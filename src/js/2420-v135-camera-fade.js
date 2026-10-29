// ================= v135: scenery between the camera and the hero fades instead of pushing the camera =================
// v132 tilted the camera up whenever anything (the ground, a rock, a wall, a building) blocked its view of the hero. Now only the
// ground itself moves the camera (0104, blk); rocks, walls, buildings, ledge stones and other props that come between the camera
// and the hero turn see-through around the line of sight, the same dithered fade the grass and trees use (windMat in 0060):
// solid at the edges, ~35% inside, never near the hero and never below the hero's knees (floors, paving and
// bridges under the line of sight stay solid). Applied once per material to the world's plain opaque lit materials
// (default shaders and the town's texture atlas shader only, so terrain, water, wind-swayed plants and den cut-away shaders keep their own), never to the hero,
// companions, monsters or anything skinned. New scenery (chunks, buildings) is picked up every 2 s.
// v169: no dither any more: the see-through pixels are left out here and drawn again as glass by 3350 (one rule for all: 0061).
var F135={done:new WeakSet(),t:0,min:.25,on:true};F135.U={value:F135.min};
// v157: the see-through window: fully cut inside R157.x, solid from R157.y (world units at the hero's distance; 3190 shares it with the terrain)
// v164 (owner: "twice as large, a smoother fade in, it's too abrupt"): was 1.35-2.4 (the middle of the edge at 1.9, a 1 unit edge);
// now the middle of the edge is at 3.85 and the dithered edge is 3.1 units wide, so walls thin out gradually toward the hero
var R157={value:new THREE.Vector2(2.3,5.4)};
// v157: scenery closer to the camera than N157.x (and in front of the hero) is cut, solid again from N157.y
var N157={value:new THREE.Vector2(3.4,5.)},M157={value:1};   // M157 0 = the old v135 tube (the intro)
// the fade and the instance clip (2430) only act while the main game view is drawn (FX135ON 1); item icons, portraits and the
// small 3D previews share these materials but are drawn elsewhere (icons at the world origin), so there they do nothing
var FX135ON=GH169.ON;   // v169: the see-through passes (0061, 3350) share it
{const f=POST.render;POST.render=function(){FX135ON.value=1;try{return f.apply(this,arguments)}finally{FX135ON.value=0}}}
function f135Patch(m){if(!m||F135.done.has(m))return;F135.done.add(m);
  // chain onto the town texture atlas shader (txa1, 1020); leave every other custom shader alone
  const def=m.onBeforeCompile===THREE.Material.prototype.onBeforeCompile,k0=m.customProgramCacheKey===THREE.Material.prototype.customProgramCacheKey?'':m.customProgramCacheKey();
  // v169: and the town's plain (unlit) atlas material: its glowing windows and glass stayed solid in a see-through wall. Other plain
  // materials stay out: backdrops such as the desert vista (3292) lie past the instance's edge on purpose
  if(!(m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial||(m.isMeshBasicMaterial&&k0==='txa1'))||m.transparent||m.skinning||m.userData.noFade135)return;
  if(!def&&k0!=='txa1')return;const ob=def?null:m.onBeforeCompile;
  m.onBeforeCompile=(sh,rn)=>{if(ob)ob.call(m,sh,rn);sh.uniforms.uCam=FADE.cam;sh.uniforms.uPl=FADE.pl;sh.uniforms.uF135=F135.U;sh.uniforms.uR157=R157;sh.uniforms.uN157=N157;sh.uniforms.uM157=M157;sh.uniforms.uClip=CLIP135;sh.uniforms.uOn135=FX135ON;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vF135;').replace('#include <project_vertex>',`#include <project_vertex>
    #ifdef USE_INSTANCING
    vF135=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;
    #else
    vF135=(modelMatrix*vec4(transformed,1.)).xyz;
    #endif`);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uCam,uPl;uniform vec2 uR157,uN157;uniform float uM157;uniform float uF135,uOn135;uniform vec4 uClip;varying vec3 vF135;').replace('void main() {',`void main() {
    float ghw=0.;
    if(uOn135>.5){
    if(vF135.x<uClip.x||vF135.z<uClip.y||vF135.x>uClip.z||vF135.z>uClip.w)discard;   // v135: nothing of a neighbouring instance (2420)
    if(dot(uPl-uCam,uPl-uCam)>.0001){
     if(uM157>.5){   // v169: the see-through rule shared by every world material (0061): a smooth window round the hero, glass, no dither
      ghw=gh169W(vF135,uCam,uPl);float t=gh169T(vF135,uCam,uPl);
      if(!gl_FrontFacing&&t>0.&&t<.9)ghw=1.;   // the inside of a two-sided house the camera stands in (Abeksi): black glass
      ghw*=smoothstep(-.85,-.55,vF135.y-uPl.y);   // never below the hero's knees: floors, paving and bridges stay
     }else{   // the v135 tube, kept for the intro's Duskhold shots (3081 sets uM157 0 while it plays; plain materials joined in v169: not there)
      #ifndef GH169_B135
      vec3 ab=uPl-uCam;float t=dot(vF135-uCam,ab)/dot(ab,ab),f;
      float tc=clamp(t,0.,1.),d=length(vF135-(uCam+ab*tc));f=smoothstep(.7,2.1,d);f=mix(f,1.,smoothstep(.84,.96,tc));f=max(f,.35);
      f=mix(1.,f,smoothstep(-.85,-.55,vF135.y-uPl.y));
      float dh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(f<dh)discard;
      #endif
      }}}
    `+GH169.GATE);if(m.isMeshBasicMaterial)sh.fragmentShader='#define GH169_B135\n'+sh.fragmentShader;gh169Shader(sh,m,'vF135')};
  m.customProgramCacheKey=()=>k0+'f135';gh169Flag(m,m.side===THREE.DoubleSide,0,-.85);m.needsUpdate=true}
function f135Skip(){const S=new Set();try{S.add(pl)}catch(_){}
  try{fols.forEach(f=>f&&S.add(f))}catch(_){}try{enemies.forEach(e=>e&&e.m&&S.add(e.m))}catch(_){}
  try{drops.forEach(d=>d&&d.g&&S.add(d.g))}catch(_){}try{if(typeof MP!='undefined'&&MP.rh)for(const k in MP.rh){const q=MP.rh[k];if(q&&q.m)S.add(q.m);if(q&&q.h)S.add(q.h)}}catch(_){}
  return S}
function f135Scan(){if(!F135.on)return;const S=f135Skip(),st=[scene];
  while(st.length){const o=st.pop();if(S.has(o)||(o.userData&&o.userData.noFade135))continue;
    if(o.isMesh&&!o.isSkinnedMesh){const M=o.material;if(Array.isArray(M))M.forEach(f135Patch);else f135Patch(M)}
    const c=o.children;for(let i=0;i<c.length;i++)st.push(c[i])}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{if(now-F135.t>2000){F135.t=now;f135Scan()}}catch(e){if(!F135.err){F135.err=1;console.warn('v135 fade',e)}}return r}}
