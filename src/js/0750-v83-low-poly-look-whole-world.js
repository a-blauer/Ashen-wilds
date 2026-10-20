// ================= v83: one low-poly look for the whole world =================
// Every mesh in the game gets the same chunky, flat-shaded style as the low-poly companions:
// - round shapes (spheres, cylinders, cones, rings) are swapped for low-segment versions
// - lit materials use flat shading, and smooth procedural normal maps are removed
// Hand-built low-poly models (zzG_* modules) are already low-segment, so this pass leaves their shape alone.
// Anything can opt out with mesh.userData.lpsSkip=1 or material.userData.lpsSkip=1.
var LPS={gc:new Map(),q:[],on:true,n:0};
function lpsMat(m){
  if(!m||m.userData.lps||m.userData.lpsSkip)return;m.userData.lps=1;
  if(!(m.isMeshStandardMaterial||m.isMeshPhongMaterial||m.isMeshLambertMaterial))return;
  if(m.normalMap&&m.normalMap.isCanvasTexture){m.normalMap=null}
  if(!m.flatShading){m.flatShading=true;m.needsUpdate=true}else if(!m.normalMap)m.needsUpdate=true}
function lpsObj(o){
  if(!o||o._lps===LPS.n)return;
  o.traverse(c=>{
    if(c._lps===LPS.n||!(c.isMesh)||c.userData.lpsSkip)return;c._lps=LPS.n;
    const r=lpsGeo(c.geometry);if(r&&!c.isSkinnedMesh)c.geometry=r;
    if(Array.isArray(c.material))c.material.forEach(lpsMat);else lpsMat(c.material)})}
// the shared unit shapes used by most hand-placed props
[[typeof G_SPH!='undefined'&&G_SPH,()=>new THREE.SphereGeometry(1,8,6)],[typeof G_CYL!='undefined'&&G_CYL,()=>new THREE.CylinderGeometry(1,1,1,8)],[typeof G_CONE!='undefined'&&G_CONE,()=>new THREE.ConeGeometry(1,1,8)]].forEach(([g,f])=>{
  if(!g)return;const n=f();g.copy(n);g.userData.lps=1;g.computeBoundingSphere();LPS.gc.set(g,null)});
// anything added from now on is styled shortly after; a slow sweep catches swapped materials
{const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(){for(let i=0;i<arguments.length;i++){const a=arguments[i];if(a&&(a.isMesh||a.children&&a.children.length))LPS.q.push(a)}return add.apply(this,arguments)}}
function lpsFlush(){if(!LPS.on)return;const q=LPS.q;LPS.q=[];for(const o of q){try{lpsObj(o)}catch(e){}}}
setInterval(lpsFlush,100);
setInterval(()=>{if(!LPS.on)return;try{scene.traverse(c=>{if(c.isMesh&&c.material&&!Array.isArray(c.material)&&!c.material.userData.lps)c._lps=-1});lpsObj(scene)}catch(e){}},2500);
try{lpsObj(scene)}catch(e){console.warn('lowpoly style',e)}

