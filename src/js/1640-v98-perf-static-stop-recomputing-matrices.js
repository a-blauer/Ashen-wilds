// ================= v98 perf_static: stop recomputing the matrices of scenery that never moves =================
// three.js r128 recomputes every object's matrix and world matrix every frame (scene.updateMatrixWorld, called by
// ren.render), visible or not: ~10,600 objects in a zone, ~8,000 of them scenery chunk meshes. This file:
//  1. chunk containers: the terrain and decoration InstancedMeshes of each visibility chunk (CHL: ms/ns) move into one
//     Group per chunk (c.g), all under one static group PSROOT. A chunk's group is shown while the chunk shows anything
//     (c.on||c.non), so the renderer and the shadow pass skip hidden chunks in one step. Their matrices are worked out
//     once (they all sit at the origin); the per-frame update never looks at PSROOT again.
//  2. scene.updateMatrixWorld (only the main scene's): a hidden top-level object is skipped and gets a full update the
//     frame it is shown again; everything else updates exactly as before (forced), except roots in "frozen" mode (3).
//  3. freezing: every ~0.5 s a sweep looks at the visible top-level objects. An object whose position, rotation and
//     scale have not changed for 3 sweeps gets matrixAutoUpdate=false (matrix computed once). Its root then updates
//     with force=false, which still updates anything that moves (auto objects call updateMatrix themselves). Frozen
//     objects are guarded: writing a new value to their position/scale (x/y/z), rotation or quaternion thaws them on
//     the spot (matrixAutoUpdate=true again, for good), so a door, chest, tent or flame that starts moving later moves
//     the same frame. Nothing with bones below it (hero, NPCs, creatures) freezes, nor the hero, enemy models,
//     lights, or a root where something thawed more than 24 times (PST.log lists the last things that thawed).
// PST.on=false switches 2+3 back to the stock update (for A/B checks); PST.st has counters. Test: test/v98_static.py.
var PST={on:true,f:0,st:{frozen:0,thawed:0,roots:0,chunkG:0,sweeps:0,sweepMs:0},
  Z:new WeakSet(),   // frozen objects (matrixAutoUpdate=false set by us, guarded)
  L:new WeakSet(),   // objects that moved after being frozen: never frozen again
  R:new WeakSet(),   // roots updated with force=false
  X:new WeakSet(),   // roots never frozen (bones, enemies, odd matrices)
  H:new WeakSet(),   // hidden roots whose world matrices are stale
  S:new WeakMap(),   // object -> {a:[10 numbers], n:sweeps unchanged, r:root}
  T:new WeakMap(),   // root -> times something in it thawed
  G:new WeakMap(),   // guarded vector -> its x/y/z; frozen object -> its own rotation/quaternion callbacks
  log:[],         // the last things that thawed: [type, name, x, z, what moved]
  root:null,mw:new Float64Array(16).fill(NaN)};
var PSROOT=null;
// ---- 1. chunk containers ----
function psChunks(){if(typeof CHL=='undefined')return 0;let n=0;
  if(!PSROOT){PSROOT=new THREE.Group();PSROOT.name='psStatic';PSROOT.matrixAutoUpdate=false;PSROOT.updateMatrix();scene.add(PSROOT);PST.root=PSROOT}
  for(const c of CHL){
    if(!c.g){c.g=new THREE.Group();c.g.matrixAutoUpdate=false;c.g.updateMatrix();c.g.visible=!!(c.on||c.non);PSROOT.add(c.g);PST.st.chunkG++}
    const ad=m=>{if(!m||m.parent===c.g||m.parent===null)return;c.g.add(m);m.matrixAutoUpdate=false;m.updateMatrix();n++};
    c.ms.forEach(ad);c.ns.forEach(ad)}
  if(n)THREE.Object3D.prototype.updateMatrixWorld.call(PSROOT,true);
  return n}
// container visibility follows the chunk (chunkVis sets c.on/c.non); runs right before each render
var PSV=new Set();
function psChunkVis(){
  for(const c of PSV)if(!(c.on||c.non)){if(c.g)c.g.visible=false;PSV.delete(c)}
  const L=(typeof CVG!='undefined'&&CVG.live)?CVG.live:CHL;
  for(const c of L)if((c.on||c.non)&&c.g&&!PSV.has(c)){c.g.visible=true;PSV.add(c)}}
// ---- 3. freezing with a guard ----
function psSnap(o,a){const p=o.position,q=o.quaternion,s=o.scale;a[0]=p.x;a[1]=p.y;a[2]=p.z;a[3]=q.x;a[4]=q.y;a[5]=q.z;a[6]=q.w;a[7]=s.x;a[8]=s.y;a[9]=s.z;return a}
function psSame(o,a){const p=o.position,q=o.quaternion,s=o.scale;return a[0]===p.x&&a[1]===p.y&&a[2]===p.z&&a[3]===q.x&&a[4]===q.y&&a[5]===q.z&&a[6]===q.w&&a[7]===s.x&&a[8]===s.y&&a[9]===s.z}
function psGuardV(v,o){const s={x:v.x,y:v.y,z:v.z};
  for(const k of ['x','y','z'])Object.defineProperty(v,k,{configurable:true,enumerable:true,get(){return s[k]},set(a){if(a!==s[k]){s[k]=a;psThaw(o,v===o.scale?'scale':'pos')}}});PST.G.set(v,s)}
function psUnguardV(v){const s=PST.G.get(v);if(!s)return;PST.G.delete(v);for(const k of ['x','y','z'])Object.defineProperty(v,k,{configurable:true,enumerable:true,writable:true,value:s[k]})}
function psFreeze(o,e){o.updateMatrix();o.matrixAutoUpdate=false;PST.Z.add(o);PST.st.frozen++;
  psGuardV(o.position,o);psGuardV(o.scale,o);
  const r=o.rotation,q=o.quaternion,rc=r._onChangeCallback,qc=q._onChangeCallback,a=e.a;
  const chk=()=>{if(q.x!==a[3]||q.y!==a[4]||q.z!==a[5]||q.w!==a[6])psThaw(o)};
  r._onChange(()=>{rc();chk()});q._onChange(()=>{qc();chk()});PST.G.set(o,[rc,qc])}
function psThaw(o,w){if(!PST.Z.has(o))return;PST.Z.delete(o);PST.L.add(o);PST.st.thawed++;
  if(PST.log.length>=40)PST.log.shift();PST.log.push([o.type,o.name,Math.round(o.position.x),Math.round(o.position.z),w||'rot']);
  psUnguardV(o.position);psUnguardV(o.scale);const c=PST.G.get(o);if(c){o.rotation._onChange(c[0]);o.quaternion._onChange(c[1]);PST.G.delete(o)}
  o.matrixAutoUpdate=true;
  const e=PST.S.get(o),r=e&&e.r;if(r){const n=(PST.T.get(r)||0)+1;PST.T.set(r,n);if(n>24)PST.X.add(r)}}
// a matrix the game set by hand (matrixAutoUpdate=false): fine as long as it matches position/rotation/scale
var PS_M=new THREE.Matrix4();
function psOkMatrix(o){PS_M.compose(o.position,o.quaternion,o.scale);const a=PS_M.elements,b=o.matrix.elements;for(let i=0;i<16;i++)if(Math.abs(a[i]-b[i])>1e-5)return false;return true}
function psSweep(){const t0=performance.now();PST.st.sweeps++;let budget=600;
  const en=new Set();try{enemies.forEach(e=>{if(e&&e.m)en.add(e.m)})}catch(_){}
  for(const r of scene.children){
    if(r===PSROOT||!r.visible||r.isLight||r.isCamera||PST.X.has(r)||budget<=0)continue;
    if(r===pl||en.has(r)||r.userData.psNo){PST.X.add(r);continue}
    if(!PST.R.has(r)){let bad=false;r.traverse(o=>{if(!o.matrixAutoUpdate&&!PST.Z.has(o)&&!psOkMatrix(o))bad=true});
      if(bad){PST.X.add(r);continue}PST.R.add(r);PST.st.roots++}
    // anything with bones below it (a walking NPC, a creature) is animated: only the parts without bones can freeze
    const rec=o=>{let b=!!(o.isBone||o.isSkinnedMesh);const c=o.children;for(let i=0;i<c.length;i++)if(rec(c[i]))b=true;
      if(b||!o.matrixAutoUpdate||PST.L.has(o)||o.isLight)return b;let e=PST.S.get(o);
      if(!e)PST.S.set(o,{a:psSnap(o,new Float64Array(10)),n:0,r});
      else if(psSame(o,e.a)){if(++e.n>=3&&budget>0){budget--;psFreeze(o,e)}}else{psSnap(o,e.a);e.n=0}
      return b};
    rec(r)}
  PST.st.sweepMs=+(performance.now()-t0).toFixed(2)}
// something added inside a frozen root: give that root one full update
{const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(o){const r0=add.apply(this,arguments);
  if(arguments.length===1&&o&&o.isObject3D){let r=this;while(r.parent&&r.parent!==scene)r=r.parent;if(r.parent===scene&&PST.R.has(r))PST.H.add(r)}return r0}}
// a clone/copy of a frozen object starts as a normal, moving object
{const cp=THREE.Object3D.prototype.copy;THREE.Object3D.prototype.copy=function(src){const r=cp.apply(this,arguments);if(src&&PST.Z.has(src))this.matrixAutoUpdate=true;return r}}
// ---- 2. the per-frame update of the main scene ----
scene.updateMatrixWorld=function(force){const O=THREE.Object3D.prototype.updateMatrixWorld;
  if(++PST.f%120===1)psChunks();
  psChunkVis();
  if(!PST.on||force)return O.call(this,force);
  if(PST.f%30===0)try{psSweep()}catch(err){console.warn('perf_static sweep',err);PST.on=false}
  if(this.matrixAutoUpdate)this.updateMatrix();
  // the scene itself never moves; if it ever does, update everything the stock way
  const m=this.matrix.elements,w=PST.mw;let mv=false;for(let i=0;i<16;i++)if(m[i]!==w[i]){mv=true;w[i]=m[i]}
  if(mv)return O.call(this,true);
  this.matrixWorld.copy(this.matrix);this.matrixWorldNeedsUpdate=false;
  const ch=this.children,H=PST.H,R=PST.R;
  for(let i=0;i<ch.length;i++){const c=ch[i];
    if(c===PSROOT)continue;
    if(c.visible===false){H.add(c);continue}
    if(R.has(c)&&!H.has(c))c.updateMatrixWorld(false);
    else{H.delete(c);c.updateMatrixWorld(true)}}
};
try{psChunks()}catch(err){console.warn('perf_static chunks',err)}

