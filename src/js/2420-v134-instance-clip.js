// ================= v134: nothing from a neighbouring instance shows across the void =================
// Instances sit 6 tiles apart on one world grid. The 32-tile terrain chunks along an edge hold ground of both neighbours, and
// field instances II/III with cave or keep themes raise walls ~100 units high, so from instance I you saw a giant grey wall (or
// another Den's scenery) towering in the fog, cutting the sky into odd patches. Now:
//  1. CLIP134 = the rectangle of the instance you are in (+3 tiles, half the void; outside the zones: Duskhold and everything
//     west of the zones), updated every frame in chunkVis.
//  2. Terrain, the swaying plants (windMat) and the faded scenery materials (2410) discard every pixel outside it.
//  3. The far-scenery cull (1980) also hides, while drawing, any object whose bounds lie wholly outside it (other Dens, camp
//     set pieces, edge scenery of the neighbours).
var CLIP134={value:new THREE.Vector4(-1e5,-1e5,1e5,1e5)},CL134={k:null,M:new WeakSet()};
function cl134Rect(k){const I=k>=0?INSL[k]:null;return I?[I.x0-3,I.y0-3,I.x0+I.w+3,I.y0+I.h+3]:[-1e5,-1e5,PM_X0-3,1e5]}
function cl134Update(){const k=cvKey();if(k===CL134.k)return;CL134.k=k;const r=cl134Rect(k);CLIP134.value.set(r[0],r[1],r[2],r[3]);try{FC.t=-1e9}catch(_){}}
const CL134_GLSL='if(vC134.x<uClip.x||vC134.z<uClip.y||vC134.x>uClip.z||vC134.z>uClip.w)discard;';
// add the clip to a material that already has its own shader hook (terrain, wind)
function cl134Chain(m,key){if(!m||CL134.M.has(m))return;CL134.M.add(m);const ob=m.onBeforeCompile;
  m.onBeforeCompile=(sh,rn)=>{if(ob&&ob!==THREE.Material.prototype.onBeforeCompile)ob.call(m,sh,rn);sh.uniforms.uClip=CLIP134;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vC134;').replace('#include <project_vertex>',`#include <project_vertex>
    #ifdef USE_INSTANCING
    vC134=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;
    #else
    vC134=(modelMatrix*vec4(transformed,1.)).xyz;
    #endif`);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec4 uClip;varying vec3 vC134;').replace('void main() {','void main() {\n'+CL134_GLSL)};
  const k0=m.customProgramCacheKey===THREE.Material.prototype.customProgramCacheKey?'':m.customProgramCacheKey();m.customProgramCacheKey=()=>k0+key;m.needsUpdate=true}
try{GTX.list.forEach((T,i)=>cl134Chain(T.mat,'trc134'))}catch(e){console.warn('v134 clip terrain',e)}
try{VIL.forEach(v=>cl134Chain(v.material,'wc134'))}catch(e){console.warn('v134 clip plants',e)}
{const f=chunkVis;chunkVis=function(){try{cl134Update()}catch(_){}return f.apply(this,arguments)}}
// the far cull also drops whole objects lying outside the instance
{const f=fcTest;fcTest=function(o,now,R,cp,hide,d){const s=fcSphere(o,now);if(s&&!(s.r>FC.big&&d<FC.depth&&o.children.length)){const c=CLIP134.value;
    if(s.x+s.r<c.x||s.x-s.r>c.z||s.z+s.r<c.y||s.z-s.r>c.w){hide.push(o);return 1}}
  return f.apply(this,arguments)}}
