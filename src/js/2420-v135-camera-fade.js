// ================= v135: scenery between the camera and the hero fades instead of pushing the camera =================
// v132 tilted the camera up whenever anything (the ground, a rock, a wall, a building) blocked its view of the hero. Now only the
// ground itself moves the camera (0104, blk); rocks, walls, buildings, ledge stones and other props that come between the camera
// and the hero turn see-through around the line of sight, the same dithered fade the grass and trees use (windMat in 0060):
// solid at the edges, ~35% inside, never near the hero and never below the hero's knees (floors, paving and
// bridges under the line of sight stay solid). Applied once per material to the world's plain opaque lit materials
// (default shaders and the town's texture atlas shader only, so terrain, water, wind-swayed plants and den cut-away shaders keep their own), never to the hero,
// companions, monsters or anything skinned. New scenery (chunks, buildings) is picked up every 2 s.
var F135={done:new WeakSet(),t:0,min:0,on:true};F135.U={value:F135.min};   // v173: min was .25 (the window never fully cleared)
// v157: the see-through window: fully cut inside R157.x, solid from R157.y (world units at the hero's distance; 3190 shares it with the terrain)
// v164 (owner: "twice as large, a smoother fade in, it's too abrupt"): was 1.35-2.4 (the middle of the edge at 1.9, a 1 unit edge);
// now the middle of the edge is at 3.85 and the dithered edge is 3.1 units wide, so walls thin out gradually toward the hero
// v173 (owner, Abeksi: the whole screen a murky speckle behind houses): same outer size, but clear right up to 4.7 and only a thin
// speckled ring (4.7-5.4) marks the window's edge; nothing is left inside it (F135.min 0, was .25: a quarter of every wall stayed)
// v174 (owner: "a bit too large"; with several buildings in front the hero did not show): 3.7-4.3, a fifth smaller
var R157={value:new THREE.Vector2(3.7,4.3)};
// v157: scenery closer to the camera than N157.x (and in front of the hero) is cut, solid again from N157.y
var N157={value:new THREE.Vector2(3.4,4.)},M157={value:1};   // v174: a thinner speckled edge (was 3.4-5)   // M157 0 = the old v135 tube (the intro)
// the fade and the instance clip (2430) only act while the main game view is drawn (FX135ON 1); item icons, portraits and the
// small 3D previews share these materials but are drawn elsewhere (icons at the world origin), so there they do nothing
var FX135ON={value:0};
{const f=POST.render;POST.render=function(){FX135ON.value=1;try{return f.apply(this,arguments)}finally{FX135ON.value=0}}}
function f135Patch(m){if(!m||F135.done.has(m))return;F135.done.add(m);
  if(!(m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshBasicMaterial)||m.transparent||m.skinning||m.userData.noFade135)return;
  // chain onto the town texture atlas shader (txa1, 1020); leave every other custom shader alone
  const def=m.onBeforeCompile===THREE.Material.prototype.onBeforeCompile,k0=m.customProgramCacheKey===THREE.Material.prototype.customProgramCacheKey?'':m.customProgramCacheKey();
  if(!def&&k0!=='txa1')return;const ob=def?null:m.onBeforeCompile;
  m.onBeforeCompile=(sh,rn)=>{if(ob)ob.call(m,sh,rn);sh.uniforms.uCam=FADE.cam;sh.uniforms.uPl=FADE.pl;sh.uniforms.uF135=F135.U;sh.uniforms.uR157=R157;sh.uniforms.uN157=N157;sh.uniforms.uM157=M157;sh.uniforms.uClip=CLIP135;sh.uniforms.uOn135=FX135ON;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vF135;').replace('#include <project_vertex>',`#include <project_vertex>
    #ifdef USE_INSTANCING
    vF135=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;
    #else
    vF135=(modelMatrix*vec4(transformed,1.)).xyz;
    #endif`);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uCam,uPl;uniform vec2 uR157,uN157;uniform float uM157;uniform float uF135,uOn135;uniform vec4 uClip;varying vec3 vF135;').replace('void main() {',`void main() {
    if(uOn135>.5){
    if(vF135.x<uClip.x||vF135.z<uClip.y||vF135.x>uClip.z||vF135.z>uClip.w)discard;   // v135: nothing of a neighbouring instance (2420)
    if(dot(uPl-uCam,uPl-uCam)>.0001){vec3 ab=uPl-uCam;float t=dot(vF135-uCam,ab)/dot(ab,ab),f;
     if(uM157>.5){   // v157: a round window around the hero on screen (the distance is scaled to the hero's depth), not a tube that filled the screen near the camera
      float d=length(vF135-(uCam+ab*clamp(t,0.,1.)))/max(t,.02);f=smoothstep(uR157.x,uR157.y,d);float fr=(1.-t)*length(ab);f=mix(f,1.,1.-smoothstep(-.1,.15,fr));f=mix(f,1.,step(t,0.));f=max(f,uF135);   // v175: solid only from the hero's own depth back (v174: .2-.55 in front, which still hid a hero standing at a wall seen at a slant; before: the last 4-16% of the way)
      float near=t>0.&&fr>1.?smoothstep(uN157.x,uN157.y,length(vF135-uCam)):1.;f=min(f,near);   // what stands right in front of the camera is cut fully (no see-through veil over the screen)
      if(!gl_FrontFacing&&t>0.&&fr>.15)f=0.;   // the inside of a two-sided house the camera stands in (Abeksi) is not drawn
     }else{   // the v135 tube, kept for the intro's Duskhold shots (3081 sets uM157 0 while it plays)
      #ifdef F135_B
      f=1.;   // v174: plain (unlit) materials joined; the intro keeps its look
      #else
      float tc=clamp(t,0.,1.),d=length(vF135-(uCam+ab*tc));f=smoothstep(.7,2.1,d);f=mix(f,1.,smoothstep(.84,.96,tc));f=max(f,.35);
      #endif
      }
     float kn=smoothstep(-.85,-.55,vF135.y-uPl.y);
     if(uM157>.5){vec3 fn=normalize(cross(dFdx(vF135),dFdy(vF135)));kn=max(kn,1.-smoothstep(.55,.75,abs(fn.y)));}   // v174: only flat surfaces keep it (walls on lower ground were a solid diagonal band)
     f=mix(1.,f,kn);   // never below the hero's knees: floors, paving and bridges stay
     float dh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(f<dh)discard;}}`)};
  if(m.isMeshBasicMaterial){const o2=m.onBeforeCompile;m.onBeforeCompile=(sh,rn)=>{o2(sh,rn);sh.fragmentShader='#define F135_B\n'+sh.fragmentShader}}   // v174: windows and plain panes (Abeksi) are cut too
  m.extensions=Object.assign({},m.extensions,{derivatives:true});   // v174: the knee rule reads the surface's slope (dFdx) on WebGL1 too
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
