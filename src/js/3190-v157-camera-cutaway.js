// ================= v157: the camera stays where the player put it; walls are cut away around the hero =================
// Before: cave walls, instance edges (both are part of the ground's height map) tilted the camera up to nearly overhead (v132 blk in
// 0104), the hard "above the ground under the camera" clamp then lifted it to the top of the wall, and Abeksi tilted it over the roofs
// (3155). Pulling the camera in was tried before and was disorienting too. Now nothing moves the camera on its own:
//  * scenery (2420) and the ground's steep walls (here) that come between the camera and the hero turn see-through in a round window
//    around the hero on screen (R157: cut inside 1.35, dithered edge, solid from 2.4 units at the hero's distance);
//  * floors stay solid: flat ground below the hero's waist is never cut, so the path behind and under the hero always shows;
//  * the camera still rides above gentle ground (hills, slopes) with the same smoothing as everything else (cam157Floor). Behind a wall
//    (the ground between hero and camera climbs a step) it simply stays inside the wall: from in there its faces point away and the
//    terrain is not drawn, and the window shows the hero.
// cam157Floor(hero position, camera point) -> the lowest the camera may go there, or null when a wall stands between them.
function cam157Floor(P,c){const dx=c.x-P.x,dz=c.z-P.z,L=Math.hypot(dx,dz);let prev=GH(P.x,P.z);
  if(L>.3)for(let s=.5;s<=L;s+=.5){const g=GH(P.x+dx*s/L,P.z+dz*s/L);if(g-prev>CAM157.step)return null;prev=g}
  return GH(c.x,c.z)+1.4}
var CAM157={step:.55,on:true};
// the ground's material: steep or high terrain pixels inside the window are cut (uses vC135, the world position 2430 adds)
function cam157Terrain(m){if(!m||m.userData.cam157)return;m.userData.cam157=1;const ob=m.onBeforeCompile;
  m.onBeforeCompile=(sh,rn)=>{if(ob&&ob!==THREE.Material.prototype.onBeforeCompile)ob.call(m,sh,rn);
    sh.uniforms.uCam157=FADE.cam;sh.uniforms.uPl157=FADE.pl;sh.uniforms.uR157=R157;sh.uniforms.uOn157=CAM157U;
    if(sh.fragmentShader.indexOf('varying vec3 vC135')<0){console.warn('v157: terrain has no vC135');return}
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uCam157,uPl157;uniform vec2 uR157;uniform float uOn157;').replace('void main() {',`void main() {
    if(uOn135>.5&&uOn157>.5){vec3 ab=uPl157-uCam157;float t=dot(vC135-uCam157,ab)/dot(ab,ab);
     if(t>.0&&t<.95){float d=length(vC135-(uCam157+ab*t))/max(t,.02);float f=smoothstep(uR157.x,uR157.y,d);
      vec3 fn=normalize(cross(dFdx(vC135),dFdy(vC135)));if(fn.y<0.)fn=-fn;float hf=vC135.y-uPl157.y+1.1;
      f=max(f,smoothstep(.6,.8,fn.y)*(1.-smoothstep(.7,1.3,hf)));   // flat ground below the waist stays solid
      f=mix(f,1.,smoothstep(.86,.95,t));
      float dh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(f<dh)discard;}}`)};
  const k0=m.customProgramCacheKey===THREE.Material.prototype.customProgramCacheKey?'':m.customProgramCacheKey();m.customProgramCacheKey=()=>k0+'cam157';m.needsUpdate=true}
var CAM157U={value:1};
try{GTX.list.forEach(T=>cam157Terrain(T.mat))}catch(e){console.warn('v157 terrain cutaway',e)}
