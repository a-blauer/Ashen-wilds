// ================= v135: scenery between the camera and the hero fades instead of pushing the camera =================
// v132 tilted the camera up whenever anything (the ground, a rock, a wall, a building) blocked its view of the hero. Now only the
// ground itself moves the camera (0104, blk); rocks, walls, buildings, ledge stones and other props that come between the camera
// and the hero turn see-through around the line of sight, the same dithered fade the grass and trees use (windMat in 0060):
// solid at the edges, ~35% inside, never near the hero and never below the hero's knees (floors, paving and
// bridges under the line of sight stay solid). Applied once per material to the world's plain opaque lit materials
// (default shaders and the town's texture atlas shader only, so terrain, water, wind-swayed plants and den cut-away shaders keep their own), never to the hero,
// companions, monsters or anything skinned. New scenery (chunks, buildings) is picked up every 2 s.
var F135={done:new WeakSet(),t:0,min:.35,on:true};
// the fade and the instance clip (2430) only act while the main game view is drawn (FX135ON 1); item icons, portraits and the
// small 3D previews share these materials but are drawn elsewhere (icons at the world origin), so there they do nothing
var FX135ON={value:0};
{const f=POST.render;POST.render=function(){FX135ON.value=1;try{return f.apply(this,arguments)}finally{FX135ON.value=0}}}
function f135Patch(m){if(!m||F135.done.has(m))return;F135.done.add(m);
  if(!(m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial)||m.transparent||m.skinning||m.userData.noFade135)return;
  // chain onto the town texture atlas shader (txa1, 1020); leave every other custom shader alone
  const def=m.onBeforeCompile===THREE.Material.prototype.onBeforeCompile,k0=m.customProgramCacheKey===THREE.Material.prototype.customProgramCacheKey?'':m.customProgramCacheKey();
  if(!def&&k0!=='txa1')return;const ob=def?null:m.onBeforeCompile;
  m.onBeforeCompile=(sh,rn)=>{if(ob)ob.call(m,sh,rn);sh.uniforms.uCam=FADE.cam;sh.uniforms.uPl=FADE.pl;sh.uniforms.uF135={value:F135.min};sh.uniforms.uClip=CLIP135;sh.uniforms.uOn135=FX135ON;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vF135;').replace('#include <project_vertex>',`#include <project_vertex>
    #ifdef USE_INSTANCING
    vF135=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;
    #else
    vF135=(modelMatrix*vec4(transformed,1.)).xyz;
    #endif`);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uCam,uPl;uniform float uF135,uOn135;uniform vec4 uClip;varying vec3 vF135;').replace('void main() {',`void main() {
    if(uOn135>.5){
    if(vF135.x<uClip.x||vF135.z<uClip.y||vF135.x>uClip.z||vF135.z>uClip.w)discard;   // v135: nothing of a neighbouring instance (2420)
    {vec3 ab=uPl-uCam;float t=clamp(dot(vF135-uCam,ab)/dot(ab,ab),0.,1.);float d=length(vF135-(uCam+ab*t));
     float f=smoothstep(.7,2.1,d);f=mix(f,1.,smoothstep(.84,.96,t));f=mix(1.,f,smoothstep(-.85,-.55,vF135.y-uPl.y));f=max(f,uF135);
     float dh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(f<dh)discard;}}`)};
  m.customProgramCacheKey=()=>k0+'f135';m.needsUpdate=true}
function f135Skip(){const S=new Set();try{S.add(pl)}catch(_){}
  try{fols.forEach(f=>f&&S.add(f))}catch(_){}try{enemies.forEach(e=>e&&e.m&&S.add(e.m))}catch(_){}
  try{drops.forEach(d=>d&&d.g&&S.add(d.g))}catch(_){}try{if(typeof MP!='undefined'&&MP.rh)for(const k in MP.rh){const q=MP.rh[k];if(q&&q.m)S.add(q.m);if(q&&q.h)S.add(q.h)}}catch(_){}
  return S}
function f135Scan(){if(!F135.on)return;const S=f135Skip(),st=[scene];
  while(st.length){const o=st.pop();if(S.has(o)||(o.userData&&o.userData.noFade135))continue;
    if(o.isMesh&&!o.isSkinnedMesh){const M=o.material;if(Array.isArray(M))M.forEach(f135Patch);else f135Patch(M)}
    const c=o.children;for(let i=0;i<c.length;i++)st.push(c[i])}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{if(now-F135.t>2000){F135.t=now;f135Scan()}}catch(e){if(!F135.err){F135.err=1;console.warn('v135 fade',e)}}return r}}
