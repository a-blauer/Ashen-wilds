// ================= v109 perf_far: don't draw scenery the fog has already hidden =================
// Chunk scenery (terrain + props in CHL) is limited to FARR by chunkVis, but every other top-level object (Duskhold's
// buildings, kingdom lots, portal gates, camps, signs and the scenery of the other instances) was handed to the GPU
// whenever it was inside the camera's 260-tile frustum, or always when frustumCulled is off. Out in a zone that was
// ~100 draw calls and ~140k triangles a frame of things hundreds of tiles away, fully behind the fog.
// Now, every FC.every ms (or after the camera moves FC.mv tiles) `fcPass` works out each top-level object's world
// bounding sphere (redone every FC.redo ms in turns, or when its children change; groups spanning more than FC.big
// tiles are split into their children) and lists the ones whose nearest point is farther from the camera than the fog's reach:
//   reach = clamp(FC.k / fog density, FARR + FC.pad, cam.far)   (exp2 fog: FC.k=2.6 leaves < 0.2% of the colour)
// Listed objects are hidden ONLY while POST.render runs (main view and shadow map) and shown again right after, so no
// game code sees their visible flag change. Never listed: chunk containers (PSROOT), lights, the hero, enemy and
// companion models, anything with a fog:false material (sky, stars, glows meant to show far away), Points/Sprites/Lines
// roots and anything marked userData.noFarCull. FC.on=false turns it off; FC.st has counters for tests.
var FC={on:true,every:250,mv:3,k:2.6,pad:40,redo:12000,big:80,depth:3,t:-1e9,cx:1e9,cz:1e9,hide:[],hid:[],c:new WeakMap(),
  box:new THREE.Box3(),b2:new THREE.Box3(),v:new THREE.Vector3(),m4:new THREE.Matrix4(),i:0,
  st:{passes:0,listed:0,hidden:0,cands:0,ms:0}};
function fcReach(){const d=scene.fog&&scene.fog.density>0?scene.fog.density:0;let r=d?FC.k/d:cam.far;
  return Math.max(Math.min(r,cam.far),FARR+FC.pad)}
// world box of one mesh (instanced meshes: every live instance), added into B
function fcAddMesh(o,B){const g=o.geometry;if(!g||!g.attributes||!g.attributes.position)return;if(!g.boundingBox)g.computeBoundingBox();
  if(o.isInstancedMesh){if(!o.count)return;const a=o.instanceMatrix.array,M=FC.m4,b=FC.b2;
    for(let i=0;i<o.count;i++){M.fromArray(a,i*16);if(M.elements[0]===0&&M.elements[5]===0&&M.elements[10]===0)continue;
      b.copy(g.boundingBox).applyMatrix4(M).applyMatrix4(o.matrixWorld);B.union(b)}return}
  FC.b2.copy(g.boundingBox).applyMatrix4(o.matrixWorld);B.union(FC.b2)}
// can this root be culled at all? (cached with its sphere)
function fcSkip(r){if(r===PSROOT||r===pl||r.isLight||r.isCamera||r.isPoints||r.isSprite||r.isLine||r.userData.noFarCull)return true;
  try{if(SKY&&(r===SKY||r===SKY.mesh||r===SKY.m))return true}catch(_){}
  let s=false;r.traverse(o=>{if(s)return;const m=o.material;if(m){const L=Array.isArray(m)?m:[m];for(const x of L)if(x&&x.fog===false){s=true;return}}if(o.isCamera)s=true});return s}
// world bounding sphere of an object: {x,y,z,r} or null (not cullable). Kept until the object's signature changes (its
// world position, child count, or for an instanced mesh its instance count / matrix version), and redone anyway every
// FC.redo ms with a random phase so the work is spread out; motion inside a group within that time is covered by FC.pad.
function fcSig(o){const e=o.matrixWorld.elements;let s=e[12]*31+e[13]*7+e[14]*17+o.children.length*1e5;if(o.isInstancedMesh)s+=o.count*1e3+o.instanceMatrix.version;return s}
function fcSphere(r,now){let e=FC.c.get(r);
  if(e&&now<e.t&&e.g===fcSig(r))return e.s;
  if(!e){e={g:NaN,t:0,s:null,skip:fcSkip(r)};FC.c.set(r,e)}
  e.t=now+FC.redo*(.5+Math.random());
  if(e.skip){e.s=null;e.g=fcSig(r);return null}
  const B=FC.box.makeEmpty();r.updateMatrixWorld(true);e.g=fcSig(r);r.traverse(o=>{if(o.isMesh||o.isInstancedMesh)fcAddMesh(o,B)});
  if(B.isEmpty()){e.s=null;return null}
  const c=B.getCenter(FC.v);e.s={x:c.x,y:c.y,z:c.z,r:B.getSize(new THREE.Vector3()).length()/2};return e.s}
// an object spanning more than FC.big tiles (a group holding things from all over the world) is split: its children are
// tested one by one (down to FC.depth levels)
function fcTest(o,now,R,cp,hide,d){const s=fcSphere(o,now);if(!s)return 0;
  if(s.r>FC.big&&d<FC.depth&&o.children.length){let n=0;for(const k of o.children)if(k.visible)n+=fcTest(k,now,R,cp,hide,d+1);return n}
  const dx=s.x-cp.x,dy=s.y-cp.y,dz=s.z-cp.z;if(Math.sqrt(dx*dx+dy*dy+dz*dz)-s.r>R)hide.push(o);return 1}
// the enemy / companion models move on their own and stay near the action: never culled here
function fcEnt(){const s=new Set();try{enemies.forEach(e=>e.m&&s.add(e.m))}catch(_){}try{(typeof party!='undefined'?party:[]).forEach(c=>c&&c.m&&s.add(c.m))}catch(_){}
  try{(typeof comps!='undefined'?comps:[]).forEach(c=>c&&c.m&&s.add(c.m))}catch(_){}return s}
function fcPass(){const t0=performance.now(),R=fcReach(),cp=cam.position,ent=fcEnt(),hide=[],ch=scene.children;let n=0;
  for(let i=0;i<ch.length;i++){const r=ch[i];if(!r.visible||ent.has(r))continue;n+=fcTest(r,t0,R,cp,hide,0)}
  FC.hide=hide;FC.t=t0;FC.cx=cp.x;FC.cz=cp.z;const S=FC.st;S.passes++;S.listed=hide.length;S.cands=n;S.ms=+(performance.now()-t0).toFixed(2)}
{const f=POST.render;POST.render=function(){
  if(!FC.on)return f.apply(this,arguments);
  try{const now=performance.now();if(now-FC.t>FC.every||Math.hypot(cam.position.x-FC.cx,cam.position.z-FC.cz)>FC.mv)fcPass()}catch(e){FC.hide=[];console.warn('farcull',e)}
  const H=FC.hid;H.length=0;for(const o of FC.hide)if(o.visible&&o.parent){o.visible=false;H.push(o)}FC.st.hidden=H.length;
  try{return f.apply(this,arguments)}finally{for(const o of H)o.visible=true;H.length=0}}}
