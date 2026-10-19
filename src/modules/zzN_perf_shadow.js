// ================= v98 perf_shadow: cheaper sun shadows =================
// The sun's shadow map is a square around the hero (an orthographic camera looking along the sun). Before v98 it was
// redrawn every frame from every shadow caster the scene had switched on: all decoration chunks within 34 tiles
// (instanced, never frustum-culled, so drawn even outside the shadow square), every monster rig within 30 tiles
// (skinned, also never culled), empty instanced meshes (count 0) and tiny props.
//  1. Shadow square: 40x40 tiles (was 48x48), pushed 7 tiles ahead of the hero in the view direction, so it covers
//     more of what the camera sees and nothing far behind it.
//  2. Every 0.5 s (or after the hero moves 4 tiles) `shdPass` works out which casters cannot reach the shadow square
//     (decoration chunks by their chunk box, monster/companion rigs by a bounding sphere). Those, and instanced meshes
//     that hold no instances, are hidden ONLY while the shadow map is drawn (`ren.shadowMap.render` wrapper) and shown
//     again right after; nobody's castShadow flag is changed, so objects that switch shadows on later keep working.
//  3. Small clutter never casts: decoration chunk meshes and static props smaller than ~0.45 / 0.25 tiles
//     (pebbles, candles, flowers...) get castShadow off once, the first time the world is around (`shdClutter`).
//  4. The shadow map is drawn every 2nd frame (`ren.shadowMap.autoUpdate=false` + needsUpdate), and every frame while
//     the hero moves faster than ~0.15 tiles per frame (dash, riding, low frame rates), so the hero's shadow never lags
//     by more than that. The light's matrix is only updated when the map is drawn, so a skipped frame shows last
//     frame's shadows in the right place.
//  5. Shadow type PCF (was PCF-soft), set where the renderer is created (build/pN_perf_shadow.py); radius tuned below.
var SHD={on:true,half:20,fwd:7,pad:6,every:2,mv:.15,clutterI:.45,clutterM:.25,rad:1.5,
  f:0,t:-1e9,px:1e9,pz:1e9,hide:[],inst:[],hid:[],cl:false,clT:0,fr:new THREE.Frustum(),cam:new THREE.OrthographicCamera(-1,1,1,-1,.5,140),
  sx:1e9,sz:1e9,box:new THREE.Box3(),sph:new THREE.Sphere(),stat:{passes:0,hidden:0,drawn:0,skipped:0,clutter:0}};
(function(){try{const c=sun.shadow.camera;c.left=c.bottom=-SHD.half;c.right=c.top=SHD.half;c.updateProjectionMatrix();sun.shadow.radius=SHD.rad}catch(e){console.warn('shd init',e)}})();

// 1. push the shadow square ahead of the hero (after every other atmos step has placed the sun)
{const f=atmos;atmos=function(){const r=f.apply(this,arguments);try{if(SHD.on){const k=SHD.fwd,dx=-Math.sin(camYaw)*k,dz=-Math.cos(camYaw)*k;
  sun.position.x+=dx;sun.position.z+=dz;sun.target.position.x+=dx;sun.target.position.z+=dz}}catch(_){}return r}}

// 3. small clutter: castShadow off once (chunk decoration by geometry size x largest instance scale; static props without
// a rig by world size). Later-built scenery is checked when the scene grows by more than 200 top-level objects.
function shdClutter(){const S=SHD;let n=0;const ws=new THREE.Vector3();
  const rad=g=>{if(!g.boundingSphere)g.computeBoundingSphere();return g.boundingSphere?g.boundingSphere.radius:1};
  (typeof CHL!='undefined'?CHL:[]).forEach(c=>c.ms.forEach(m=>{if(!m.userData.cast||m.userData.shdC)return;m.userData.shdC=1;
    const a=m.instanceMatrix.array;let mx=0;for(let i=0;i<m.count;i++){const o=i*16;mx=Math.max(mx,a[o]*a[o]+a[o+1]*a[o+1]+a[o+2]*a[o+2],a[o+4]*a[o+4]+a[o+5]*a[o+5]+a[o+6]*a[o+6])}
    if(rad(m.geometry)*Math.sqrt(mx)<S.clutterI){m.userData.cast=false;m.castShadow=false;n++}}));
  const ent=new Set();try{ent.add(pl);enemies.forEach(e=>e.m&&ent.add(e.m));drops.forEach(d=>d.g&&ent.add(d.g))}catch(_){}
  scene.children.forEach(r=>{if(r.isInstancedMesh||ent.has(r)||r.userData.shdC)return;r.userData.shdC=1;let rig=false;
    r.traverse(o=>{if(o.isBone||o.isSkinnedMesh||o.isInstancedMesh)rig=true});if(rig)return;
    r.updateMatrixWorld(true);r.traverse(o=>{if(!o.isMesh||!o.castShadow||!o.geometry)return;o.getWorldScale(ws);
      if(rad(o.geometry)*Math.max(Math.abs(ws.x),Math.abs(ws.y),Math.abs(ws.z))<S.clutterM){o.castShadow=false;n++}})});
  S.stat.clutter+=n;S.cl=scene.children.length;return n}

// 2. the periodic pass: which casters cannot reach the shadow square
function shdFrustum(){const S=SHD,c=S.cam,h=S.half+S.pad;c.left=c.bottom=-h;c.right=c.top=h;c.near=.5;c.far=sun.shadow.camera.far+30;c.updateProjectionMatrix();
  sun.updateMatrixWorld();sun.target.updateMatrixWorld();c.position.setFromMatrixPosition(sun.matrixWorld);
  const t=new THREE.Vector3().setFromMatrixPosition(sun.target.matrixWorld);c.position.addScaledVector(c.position.clone().sub(t).normalize(),15);c.lookAt(t);c.updateMatrixWorld();
  S.fr.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse));return S.fr}
function shdRig(r){// bounding sphere of a rigged top-level object, relative to its position (cached; redone when its children change)
  const u=r.userData;if(u.shdN===r.children.length)return u.shdR;u.shdN=r.children.length;u.shdR=null;let rig=false;
  r.traverse(o=>{if(o.isSkinnedMesh||(o.isMesh&&!o.frustumCulled))rig=true});
  if(!rig)return null;
  const b=SHD.box.setFromObject(r);if(b.isEmpty())return null;const s=b.getBoundingSphere(new THREE.Sphere());
  return u.shdR={x:s.center.x-r.position.x,y:s.center.y-r.position.y,z:s.center.z-r.position.z,r:Math.min(s.radius,30)+1.5}}
function shdPass(){const S=SHD,F=shdFrustum(),hide=[],inst=[],chunk=new Set(),sp=S.sph;S.stat.passes++;
  if(!S.cl||scene.children.length>S.cl+200||(!S.clT&&S.f>30)){S.clT=1;shdClutter()}
  const L=(typeof CVG!='undefined'&&CVG.live)?CVG.live:(typeof CHL!='undefined'?CHL:[]);
  L.forEach(c=>{if(!c.on)return;const out=!F.intersectsBox(c.box);c.ms.forEach(m=>{chunk.add(m);if(out&&m.castShadow)hide.push(m)})});
  const ch=scene.children;for(let i=0;i<ch.length;i++){const r=ch[i];if(!r.visible||r===pl||r.isLight)continue;
    if(r.isInstancedMesh){if(r.castShadow&&!chunk.has(r)&&!r.userData.cast)inst.push(r);continue}
    if(r.isMesh&&r.frustumCulled)continue;
    const q=shdRig(r);if(!q)continue;sp.center.set(r.position.x+q.x,r.position.y+q.y,r.position.z+q.z);sp.radius=q.r;
    if(!F.intersectsSphere(sp))hide.push(r)}
  S.hide=hide;S.inst=inst;S.t=performance.now();S.px=pl.position.x;S.pz=pl.position.z}

// shadow pass wrapper: hide the listed objects (and empty instanced meshes) only while the shadow map is drawn
{const sm=ren.shadowMap,f=sm.render;sm.render=function(lights,scn,camera){
  if(!SHD.on||scn!==scene||!lights||!lights.length||(!this.autoUpdate&&!this.needsUpdate))return f.apply(this,arguments);
  const H=SHD.hid;H.length=0;
  for(const o of SHD.hide)if(o.visible){o.visible=false;H.push(o)}
  for(const o of SHD.inst)if(o.visible&&o.count===0){o.visible=false;H.push(o)}
  SHD.stat.hidden=H.length;
  try{return f.apply(this,arguments)}finally{for(const o of H)o.visible=true;H.length=0}}}

// 4. draw the shadow map every 2nd frame, or every frame while the hero moves fast
ren.shadowMap.autoUpdate=false;ren.shadowMap.needsUpdate=true;
{const f=POST.render;POST.render=function(){try{const S=SHD,p=pl.position;S.f++;
  if(!S.on){ren.shadowMap.autoUpdate=true}else{ren.shadowMap.autoUpdate=false;
    const now=performance.now();if(now-S.t>500||Math.hypot(p.x-S.px,p.z-S.pz)>4)shdPass();
    const mv=Math.hypot(p.x-S.sx,p.z-S.sz);
    if(!sun.shadow.map||S.f%S.every===0||mv>S.mv){ren.shadowMap.needsUpdate=true;S.sx=p.x;S.sz=p.z;S.stat.drawn++}else S.stat.skipped++}}catch(e){ren.shadowMap.needsUpdate=true;console.warn('shd',e)}
  return f.apply(this,arguments)}}
