// ================= v192: the camera never passes an instance's edge; everything else fades =================
// Owner (Nov 2 2026): "Something happened with how our camera works. I want the camera to not be able to pass through the edge of an
// instance (the walls that surround each map). If it collides with the edge, the camera should zoom in. When the camera collides
// with all other objects in the game the object should fade and become semi transparent so you can still see your character."
// What had happened:
//  * the fade: v183's paint (3410 ep183Hook) wraps the shader hook of nearly every scenery material at load, before 2420's fade scan
//    first runs, and f135Patch left every material with a hook of its own alone: from v183 on most scenery (Duskhold's buildings,
//    camps, tents, every decoration, v190's new pieces) was never set up to fade, so v176's scan (3361) never saw it. Fixed in
//    f135Patch (2420): it chains onto the paint's hook.
//  * the edge: v172's rule (cam172Ok, 3360) counted the rock of an edge wall as "out" only within 8 tiles of the void; field, den
//    and cave walls rise far from the void, so the camera went into them (and then saw through the terrain from inside).
// Now (cam192Out): the camera may not be
//  * past the instance's rectangle, over the void or within CAM172.r1 of it (as v172);
//  * in or against the ground past the walkable edge: where the map's walkable ground has ended (MAP.DW > CAM192.band) the lens keeps
//    CAM192.clr above the highest ground round it: the cliffs, slopes and cave walls that surround each map (inside caves too);
//  * past Abeksi's outer wall (the city's edge: its walls are buildings, not ground) at any height.
// The camera slides in along its own line toward the hero instead (cam172Reach sets the target distance, camDD's smoothing in 0104:
// fast in, slow out; cam172Hold keeps its actual spot inside while it catches up). Everything else between the camera and the hero
// (buildings, Abeksi's houses too — v176 had them pull the camera in —, trees, rocks, props, decorations, set pieces) is faded whole
// by 3361 (OB176.k of it left, a fine even screen so it reads as see-through) and the camera keeps the distance the player set.
var CAM192={on:true,band:.5,far:3,clr:.9,min:1.1,step:.3,back:.45,abm:.5,why:'',lite:false,st:{d:0,cut:0,hold:0,lite:0},
  old(){try{return (typeof ch153Run=='function'&&ch153Run())||(typeof sr165Here=='function'&&sr165Here())}catch(_){return false}}};
const CAM192R=[[0,0],[.55,0],[-.55,0],[0,.55],[0,-.55]];
function cam192Dw(x,z){const X=Math.round(x),Z=Math.round(z);if(X<0||Z<0||X>=W||Z>=H)return 99;return MAP.DW[Z*W+X]}
// why the camera may not be at (x,y,z) in instance I (null: Duskhold / outside the zones), or '' when it may.
// lite: only the rectangle and the void (the hero stands somewhere the full rule would not allow: a level's own ground)
function cam192Out(x,y,z,I,lite){
  if(I&&(x<I.x0+.5||z<I.y0+.5||x>I.x0+I.w-.5||z>I.y0+I.h-.5))return 'rect';
  if(cam172Void(x,z,CAM172.r1))return 'void';
  if(lite)return '';
  if(I&&I.g===30&&typeof ab152Plan=='function'){const N=ab152Plan().IN,u=x-I.x0,v=z-I.y0,m=CAM192.abm;   // Abeksi: its outer wall is the edge, at any height
    return u<N[0]+m||v<N[1]+m||u>N[2]-m||v>N[3]-m?'wall':''}
  if(CAM192.old()){   // the chase levels' own cameras (the Ascent, the Sandstorm Run) keep v172's rule: the rim's rock near the void only
    if(y<GH(x,z)-.05){for(const r of [3,5.5,CAM172.r2])if(cam172Void(x,z,r))return 'rim'}return ''}
  let d=cam192Dw(x,z);for(let i=1;i<5;i++)d=Math.max(d,cam192Dw(x+CAM192R[i][0],z+CAM192R[i][1]));
  if(d>CAM192.far)return 'far';   // past the foot of the edge: never, at any height (no looking over the wall's top)
  if(d>CAM192.band){let g=-1e9;for(const [a,b] of CAM192R)g=Math.max(g,GH(x+a,z+b));if(y<g+CAM192.clr)return 'edge'}   // in or against the wall
  return ''}
// v172's names, now with the v192 rule (later definitions win; 3360's hooks in 0104 and before drawing call these)
function cam172Ok(x,y,z,I){const w=cam192Out(x,y,z,I,CAM192.lite);CAM172.why=CAM192.why=w;return !w}
function cam172Ab(){return false}   // v192: Abeksi's houses fade like every other object (3361); the camera no longer slides in for them
function cam192Ins(){try{const k=cvKey();return k>=0?INSL[k]:null}catch(_){return null}}
// the first spot along the line from the hero's chest (y0) in direction v (unit) that is out, as a safe distance, or L when none
function cam192Walk(P,y0,vx,vy,vz,L,I){CAM192.lite=!!cam192Out(P.x,y0,P.z,I,false);if(CAM192.lite)CAM192.st.lite++;
  for(let s=.6;s<=L+CAM192.back+.3;s+=CAM192.step)if(cam192Out(P.x+vx*s,y0+vy*s,P.z+vz*s,I,CAM192.lite))return Math.min(L,Math.max(CAM192.min,s-CAM192.back));
  return L}
// how far back the camera may go along its line from the hero's chest (P = the hero's feet), at most d
function cam172Reach(P,yaw,pitch,d){if(!CAM172.on||!CAM192.on)return d;const I=cam192Ins(),cp=Math.cos(pitch);
  const r=cam192Walk(P,P.y+1.1,Math.sin(yaw)*cp,Math.sin(pitch),Math.cos(yaw)*cp,d,I);if(r<d){CAM192.st.cut++;CAM172.st.cut++}CAM192.st.d=CAM172.st.d=r;return r}
// the camera's actual spot (it trails its target in 0104) is held inside too, along its own line to the hero's chest
const CAM192V=new THREE.Vector3();
function cam172Hold(P,c){if(!CAM172.on||!CAM192.on)return;const I=cam192Ins();
  const y0=P.y+1.1,v=CAM192V.set(c.x-P.x,c.y-y0,c.z-P.z),L=v.length();if(L<CAM192.min)return;v.multiplyScalar(1/L);
  const r=cam192Walk(P,y0,v.x,v.y,v.z,L,I);if(r<L-1e-3){c.set(P.x+v.x*r,y0+v.y*r,P.z+v.z*r);CAM192.st.hold++;CAM172.st.hold=(CAM172.st.hold||0)+1}}

// ---- the look: semi-transparent, not speckled ----
// 3361 leaves OB176.k (.35) of a blocking object. Before, the rest was cut away with a screen-door dither (a speckle). The main view
// is drawn into a 4x multisampled target (POST, WebGL2): there each pixel of a faded object now covers that share of its samples
// (alpha to coverage) and the resolve blends it with what is behind, so the object reads as see-through glass-like, evenly, and
// the hero shows through. Without multisampling (WebGL1, the PSX low-res look, post off) and in the intro's shots the old dither stays.
// ob192Fade(f) replaces the dither discard in 2420 (scenery), 0060 (plants) and 3190 (ground); those materials set alphaToCoverage.
// (hoisted: a material may compile before this file runs, so the GLSL comes from a function, not from OB176.HEAD)
function ob192Glsl(){return `uniform float uOb192A;float ob192a=1.;
void ob192Fade(float f){if(uOb192A>.5){ob192a=min(ob192a,clamp(f,0.,1.));if(ob192a<.02)discard;}
 else{float dh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(f<dh)discard;}}
`}
function ob176Shader(sh){if(!OB176.U.uOb192A)OB176.U.uOb192A={value:0};for(const k in OB176.U)sh.uniforms[k]=OB176.U[k];
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+OB176.HEAD+ob192Glsl())
    .replace('#include <dithering_fragment>','#include <dithering_fragment>\n#ifdef OB203_KEEPA\n gl_FragColor.a*=ob192a;\n#else\n gl_FragColor.a=ob192a;\n#endif')}   // (opaque scenery: its own alpha never mattered, so it is replaced, not multiplied; v203: see-through ones, OB203_KEEPA, keep it)
if(!OB176.U.uOb192A)OB176.U.uOb192A={value:0};
function ob192Msaa(){try{return CAM192.a2c&&POST.on&&ren.capabilities.isWebGL2&&(ren.capabilities.maxSamples|0)>=2&&!(PSXON&&PSXH>0)&&!(typeof IC151!='undefined'&&IC151.on)}catch(_){return false}}
CAM192.a2c=true;
{const f=POST.render;POST.render=function(){OB176.U.uOb192A.value=ob192Msaa()?1:0;return f.apply(this,arguments)}}
