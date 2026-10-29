// ================= v169: see-through walls, the shader half (the drawing passes are in 3350) =================
// Owner: "I'd rather everything just become semi transparent, I don't like the vignette with the speckled look"; "when a house
// becomes transparent, the inside is black instead of showing the floors, still transparent so we can see our character";
// "make outside of the map black so we can't see under the map".
// Every world material that used to dither away between the camera and the hero (scenery 2420, terrain 3190, swaying plants
// windMat 0060, den walls 0960 / 1100) now computes one ghost weight `ghw` per pixel (0 solid .. 1 fully see-through) with the
// same rule (gh169W) and ends in the same code (GH169_GATE at the start of main, GH169_TAIL after the colour is done):
//   * the normal draw (uGhM 0) leaves out every pixel with ghw > 0;
//   * 3350 then draws those pixels again on their own: a depth pass (uGhM 1, only the nearest see-through surface counts) and a
//     colour pass (uGhM 2) that blends them as glass: the surface at uGhA opacity over what is behind. Buildings and props seen
//     through the glass are darkened to uGhK (near black: a house's inside, its floors); the ground, plants, water, the sky and
//     characters are seen clearly (they write 1 into the stencil buffer, gh169Clear; 3350 draws those pixels at k 1).
//     Plants themselves are see-through without the dark inside (GH169_SEE).
//   * back faces (the inside of a two-sided house) are black in the colour pass; one-sided materials never show their back.
//   * ground pixels outside the current instance's rectangle (uGhV) are black in every pass: the void past an instance's edge.
//     So is the ground's cliff where it drops off at the edge (its slope faces out of the map, ghEdge in 3190).
//     With the camera out of the map (inside the rock or past the edge) the background fades to black (3350).
var GH169={on:true,a:.4,k:.06,d:.16,R:[2.3,5.4],N:[.5,1.3],ON:{value:0}};   // d: the glass's slight dither (v171); N: right at the lens (v171, was 1.2-3.4); R unused since v171
GH169.U={uGhM:{value:0},uGhA:{value:GH169.a},uGhK:{value:GH169.k},uGhR:{value:new THREE.Vector2(GH169.R[0],GH169.R[1])},
  uGhN:{value:new THREE.Vector2(GH169.N[0],GH169.N[1])},uGhV:{value:new THREE.Vector4(-1e6,-1e6,1e6,1e6)},uGhOn:GH169.ON,
  uGhT:{value:0},uGhD:{value:GH169.d},uGhBm:{value:[0,1,2,3,4,5,6,7].map(()=>new THREE.Vector3())},uGhBM:{value:[0,1,2,3,4,5,6,7].map(()=>new THREE.Vector3())},uGhBw:{value:[0,0,0,0,0,0,0,0]}};
// gh169W(world point, camera, hero chest). v171 (owner: "I dont want the circular cutout view when looking through an object. Just
// make it transparent"; "add a slight dithering"): no window round the hero any more. 3350 finds what actually blocks the view
// (rays from the camera to the hero) and hands its bounds over as up to 8 boxes (uGhBm/uGhBM, faded by uGhBw): the whole object
// inside a box turns to glass, as far as it stands in front of the hero (gh169Fr). The ground has its own switch (uGhT, 3190):
// when the ground blocks the view, every wall of it in front of the hero turns to glass. Anything right at the lens (uGhN) too.
GH169.HEAD=`uniform float uGhM,uGhA,uGhK,uGhOn,uGhT,uGhD;uniform vec2 uGhR,uGhN;uniform vec4 uGhV;uniform vec3 uGhBm[8],uGhBM[8];uniform float uGhBw[8];
float gh169T(vec3 p,vec3 c,vec3 h){vec3 ab=h-c;return dot(p-c,ab)/max(dot(ab,ab),1e-4);}
float gh169Fr(vec3 p,vec3 c,vec3 h){vec3 ab=h-c;float L2=dot(ab,ab);if(L2<1e-4)return 0.;float t=dot(p-c,ab)/L2;if(t<=0.)return 0.;return 1.-smoothstep(.9,.99,t);}
float gh169Bx(vec3 p){float w=0.;for(int i=0;i<8;i++){if(uGhBw[i]>0.){vec3 q=max(uGhBm[i]-p,p-uGhBM[i]);w=max(w,uGhBw[i]*(1.-smoothstep(0.,.3,max(q.x,max(q.y,q.z)))));}}return w;}
float gh169Nc(vec3 p,vec3 c,vec3 h){return (1.-smoothstep(uGhN.x,uGhN.y,length(p-c)))*(1.-smoothstep(.75,.9,gh169T(p,c,h)));}
float gh169W(vec3 p,vec3 c,vec3 h){return max(gh169Bx(p)*gh169Fr(p,c,h),gh169Nc(p,c,h));}
float gh169WT(vec3 p,vec3 c,vec3 h){return max(uGhT*gh169Fr(p,c,h),gh169Nc(p,c,h));}
bool gh169Out(vec3 p){return p.x<uGhV.x||p.z<uGhV.y||p.x>uGhV.z||p.z>uGhV.w;}
`;
// the start of main, after ghw is known: the normal draw skips see-through pixels, the ghost passes draw only them
GH169.GATE=`if(uGhOn>.5){if(uGhM<.5){if(ghw>.004)discard;}else{if(ghw<=.004)discard;
 #if !defined(GH169_DS)&&!defined(GH169_RK)
 if(!gl_FrontFacing)discard;
 #endif
 }}else if(uGhM>.5)discard;
`;
// after the colour is done (p = the world position varying): the ground stops at the instance's edge (v171: discarded, the rock
// past it is 3355's apron; it was black in v169); the glass blend in the colour pass, with a slight dither (uGhD, owner v171).
// Glass fades fully clear toward the camera (uGhN): a wall or rock right at the lens is never a pale veil over the screen.
// Rock (GH169_RK: the ground, seen from outside or from inside) and plants (GH169_SEE) are plain glass: nothing behind is darkened.
GH169.tail=p=>`
 if(uGhOn>.5){
  #ifdef GH169_VOID
  if(gh169Out(${p}))discard;
  #endif
  if(uGhM>1.5){float nf=smoothstep(uGhN.x,uGhN.y,length(${p}-cameraPosition));float ga=1.-ghw*(1.-uGhA*nf);
   float dh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))-.5;ga=clamp(ga+dh*uGhD*ghw*nf,0.,1.);
   vec3 gc=gl_FragColor.rgb*ga;
   #ifdef GH169_DS
   if(!gl_FrontFacing)gc=vec3(0.);
   #endif
   #if defined(GH169_SEE)||defined(GH169_RK)
   gl_FragColor=vec4(gc,ga);
   #else
   gl_FragColor=vec4(gc,1.-(1.-ga)*mix(1.,uGhK,nf));
   #endif
  }}`;
// gh169Shader(sh, material, world position varying, see-through plant?, black outside the instance?): uniforms, the head, the tail;
// call after the material's own replacements (they must already have put `float ghw` at the top of main and GH169.GATE after it).
// Only the ground goes black outside the instance (the void and the cliffs it drops off): scenery out there stays as it was
// (Abeksi's north wall stands 0.5-3 tiles past its rectangle)
// rk (v171): rock, the ground: two-sided so it shows from inside too, never darkens what is behind it
function gh169Shader(sh,m,p,see,vd,rk){for(const k in GH169.U)sh.uniforms[k]=GH169.U[k];
  const ds=m.side===THREE.DoubleSide&&!rk;
  sh.fragmentShader=(ds?'#define GH169_DS\n':'')+(see?'#define GH169_SEE\n':'')+(vd?'#define GH169_VOID\n':'')+(rk?'#define GH169_RK\n':'')+sh.fragmentShader.replace('#include <common>','#include <common>\n'+GH169.HEAD);
  if(sh.fragmentShader.indexOf('#include <dithering_fragment>')<0){console.warn('v169: no dithering_fragment to end on');return}
  sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>'+GH169.tail(p))}
// mark a material as see-through capable when it is patched (3350 reads this before the first draw): all = its pixels can turn
// see-through far from the line of sight (den walls cut on the camera's side), so its meshes always join the ghost passes
// clear = what lies behind the glass is seen clearly, not darkened (the ground, plants): stencil 1, like the characters (3350)
// floor = how far below the hero's chest the material's pixels can still turn see-through (its "never below the knees" rule;
// 3350 skips meshes lying wholly below it); none for terrain and den walls
function gh169Flag(m,all,clear,floor){m.userData.gh169=1;if(all)m.userData.gh169All=1;if(clear)gh169Clear(m);if(floor!=null)m.userData.gh169Fl=floor}
function gh169Clear(m){if(!m||m.userData.gh169C)return;m.userData.gh169C=1;
  m.stencilWrite=true;m.stencilRef=1;m.stencilWriteMask=0xff;m.stencilFuncMask=0xff;m.stencilFunc=THREE.AlwaysStencilFunc;
  m.stencilZPass=THREE.ReplaceStencilOp;m.stencilFail=THREE.KeepStencilOp;m.stencilZFail=THREE.KeepStencilOp}
