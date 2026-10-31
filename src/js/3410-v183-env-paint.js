// ================= v183: the world painted, not built (owner, Oct 30 2026) =================
// "Use that new knowledge [docs/MODEL_DETAIL_RECIPE.md, the creature session's method: detail from colour, shading and
// textures instead of triangles] to revise our maps and environments, all trees, rocks and everything else on every instance
// on every zone." No triangle is added; the low-poly faceted look stays. Two layers, both on scenery only (never on heroes,
// monsters, companions, mounts or gear: anything skinned, on a bone, or in a group that holds a skinned body is left alone):
//
// 1. Baked shading (ep183Bake): once per geometry, into its vertex colours (free while playing). Per welded corner:
//    cavity (creases darker, ridges and corners lighter: edge wear), the inside of a mass darker (the heart of a tree crown,
//    under an overhang), the base darker where it meets the ground, faces turned down darker and a little cooler, faces
//    turned up a touch warmer. Colour changes follow the form, never random per face.
// 2. One shared detail texture (ep183Tex: 256² RGBA, made in code at load: R fBm, G cell edges, B a tone per cell, A
//    streaks), projected in each object's own space (one plane per flat face) (it sticks to the object), its pattern chosen from the surface's
//    colour: stone (grey, sandstone, brick) gets a few thin cracks (short straight runs of the cell edges, sparse; none on
//    near-white stone, snow or ice), a tone per stone, pitting and lichen on its tops; bark and wood (dark warm) grain streaks up its upright faces; foliage
//    (green) soft blotches and lit tops (a cell pattern read as scales on pines: none on foliage); everything a little
//    mottling. The ground (ENVDET_G) gets only mottling on flat ground, and on slopes and cliffs strata along the level
//    lines (stepped bands; long cracks read as worms there: none). It replaces the world-space grime of 0060 (GR) on these materials, with the same average
//    brightness. Tuned on pictures of every zone (test/env_look.py, test/wd_sheet.py EP=1).
// Materials opt in with the ENVDET define (so the program cache keys stay apart) and a chained onBeforeCompile that hands
// the shared uniforms over (a texture uniform in ShaderLib would be cloned per material: one GPU copy each).
// woodRe: the decoration kinds (WD) whose brown parts are wood and get grain; every other kind gets none (decided by what
// the kind is, not by its colour); scenery outside WD keeps the colour test
var EP183={woodRe:/tree|log|stump|fallen|snag|palm|pine|oak|root|fence|cart|barrel|coffin|cross|hay|boat|catapult|barricade|stake|tent|banner|totem|crate|ladder|bench|shelf|flag|lamp|brazier/,on:true,s:.46,a:1,kg:'0.9',ko:'1.0',u:null,tex:null,scans:0,ms:0,mats:0,geos:0,bakeMs:0,kinds:0};
function ep183Hash(x,y,s){let h=(x*374761393+y*668265263+s*1442695041)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296}
// periodic value noise (period p cells) and the texture
function ep183VN(x,y,px,py,s){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),mx=a=>((a%px)+px)%px,my=a=>((a%py)+py)%py;
  const a=ep183Hash(mx(xi),my(yi),s),b=ep183Hash(mx(xi+1),my(yi),s),c=ep183Hash(mx(xi),my(yi+1),s),d=ep183Hash(mx(xi+1),my(yi+1),s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function ep183Tex(){if(EP183.tex)return EP183.tex;const N=256,D=new Uint8Array(N*N*4),R=new Float32Array(N*N),Gc=new Float32Array(N*N),Bc=new Float32Array(N*N),A=new Float32Array(N*N);
  const C=7,pts=[];for(let j=0;j<C;j++)for(let i=0;i<C;i++)pts.push([i+.15+.7*ep183Hash(i,j,91),j+.15+.7*ep183Hash(i,j,92)]);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const k=y*N+x,u=x/N,v=y/N;
    let f=0,am=.5,tot=0;for(let o=0;o<5;o++){const p=4<<o;f+=ep183VN(u*p,v*p,p,p,o+1)*am;tot+=am;am*=.55}R[k]=f/tot;
    // cells: distance to the nearest and the second nearest point (wrapped), and the nearest cell's id
    const cx=u*C,cy=v*C,ix=Math.floor(cx),iy=Math.floor(cy);let f1=9,f2=9,id=0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const gx=ix+dx,gy=iy+dy,wx=((gx%C)+C)%C,wy=((gy%C)+C)%C,P=pts[wy*C+wx],px=P[0]+(gx-wx),py=P[1]+(gy-wy),d=Math.hypot(px-cx,py-cy);
      if(d<f1){f2=f1;f1=d;id=wy*C+wx}else if(d<f2)f2=d}
    Gc[k]=Math.min(1,(f2-f1)*1.6);Bc[k]=ep183Hash(id,id*7+3,93)*.75+.25*ep183VN(u*16,v*16,16,16,9);
    // streaks: fine across (u), long along (v)
    let s=0;am=.6;tot=0;for(let o=0;o<3;o++){const px=32<<o,py=2<<o;s+=ep183VN(u*px,v*py,px,py,20+o)*am;tot+=am;am*=.5}A[k]=s/tot}
  const st=a=>{let lo=1,hi=0;for(const x of a){if(x<lo)lo=x;if(x>hi)hi=x}const r=1/Math.max(1e-4,hi-lo);for(let i=0;i<a.length;i++)a[i]=(a[i]-lo)*r};st(R);st(A);st(Bc);
  for(let k=0;k<N*N;k++){D[k*4]=R[k]*255;D[k*4+1]=Gc[k]*255;D[k*4+2]=Bc[k]*255;D[k*4+3]=A[k]*255}
  const t=new THREE.DataTexture(D,N,N,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;
  t.generateMipmaps=true;try{t.anisotropy=Math.min(4,ren.capabilities.getMaxAnisotropy()||1)}catch(e){}t.needsUpdate=true;return EP183.tex=t}
// ---- the shader (ShaderLib text, only compiled in where ENVDET is defined) ----
(function(){
  const VD='\n#ifdef ENVDET\nvarying vec3 vEdP,vEdW;\n#endif\n',
    VC=`
#ifdef ENVDET
{vec4 ep=vec4(transformed,1.);
#ifdef USE_INSTANCING
 ep=instanceMatrix*ep;
#endif
 vEdW=(modelMatrix*ep).xyz;vEdP=ep.xyz*vec3(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz),length(modelMatrix[2].xyz));}
#endif
`,FD='\n#ifdef ENVDET\nvarying vec3 vEdP,vEdW;uniform sampler2D uEdT;uniform float uEdS,uEdA;\n#endif\n',
    FC=`
#ifdef ENVDET
{vec3 eP=vEdP*uEdS;vec3 nP=abs(cross(dFdx(vEdP),dFdy(vEdP)));
 // flat faces: one projection per face, the plane the face looks along most (a triplanar blend costs three reads per layer
 // and only matters on smooth surfaces); v runs up the object on upright faces, so streaks and grain run up them
 float px=step(nP.y,nP.x)*step(nP.z,nP.x),py=(1.-px)*step(nP.z,nP.y);
 #define EDUV(q) mix(mix((q).xy,(q).xz,py),(q).zy,px)
 vec3 nW=normalize(cross(dFdx(vEdW),dFdy(vEdW)));if(dot(nW,cameraPosition-vEdW)<0.)nW=-nW;
 vec4 tA=texture2D(uEdT,EDUV(eP));
 vec3 e2=eP*.43+vec3(.31,.17,.53);
 vec4 tB=texture2D(uEdT,EDUV(e2));
 vec3 c=diffuseColor.rgb;float mx=max(c.r,max(c.g,c.b))+.002,mn=min(c.r,min(c.g,c.b)),sat=(mx-mn)/mx,lum=dot(c,vec3(.3,.59,.11));
 float fol=smoothstep(.02,.13,(c.g-max(c.r,c.b))/mx);
 float warm=smoothstep(.1,.3,(c.r-c.b)/mx);float ice=smoothstep(.04,.18,(c.b-c.r)/mx);   // warm: wood, sandstone; blue-white: ice, crystal, frost
 float wood=warm*(1.-fol)*(1.-smoothstep(.24,.48,lum))*smoothstep(.32,.5,sat);   // bark and wood: darker, more saturated browns than sandstone
#ifdef ENVDET_NW
 wood=0.;   // a decoration kind that is not wooden (an arch post of brown stone read as planks)
#endif
 float stn=(1.-fol)*(1.-wood)*(1.-smoothstep(.38,.62,sat))*(1.-ice);
 float bri=smoothstep(.45,.9,lum);float vrt=1.-abs(nW.y);
 float d=((tB.r-.5)*.24+(tA.r-.5)*.12)*(1.-.65*ice);   // ice and crystal: only a soft brightness variation
#ifndef ENVDET_G
 // cracks: thin pieces of the cell edges (straight runs, sharp turns), only where a sparse mask lets them through; none on
 // near-white stone, snow and ice (they read as veins there), and the stone's own tone and pitting softer on bright stone
 float ck=(1.-smoothstep(.012,.04,tB.g))*smoothstep(.52,.66,tA.r*.5+tB.b*.5)*(1.-smoothstep(.62,.95,lum));
 d+=stn*(-ck*.42+((tB.b-.5)*.13+(tA.r-.5)*.2)*(1.-.55*bri));
 float lic=stn*smoothstep(.15,.7,nW.y)*smoothstep(.5,.64,tB.r*.7+tA.r*.3)*(1.-smoothstep(.28,.55,lum))*(1.-warm);   // lichen on the tops of grey stones (never pale or warm desert stone)
 diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.86,.96,.62),lic*.8*uEdA);
 d+=wood*(tA.a-.5)*1.5*(.3+.7*vrt);
 d+=fol*((tA.r-.5)*.3+nW.y*.1);   // foliage: soft blotches and lit tops (a cell pattern read as scales: no cells here)
#else
 vec3 e3=vEdP*uEdS*.11+vec3(.7,.2,.4);
 vec4 tC=texture2D(uEdT,EDUV(e3));
 float sl=smoothstep(.3,.65,vrt),hz=dot(vEdP.xz,vec2(.7,.7))*uEdS;
 // strata: bands of rock along the level lines, uneven in spacing and thickness (two scales mixed), with a harder edge so
 // they read as ledges; softer up close (they read as stripes there) and on pale rock and snow
 float yb=vEdP.y*uEdS;float sa=smoothstep(.4,.6,texture2D(uEdT,vec2(yb*.55,hz*.012+.37)).r*.6+texture2D(uEdT,vec2(yb*.19+.5,hz*.007+.81)).r*.4);
 float sk=smoothstep(4.,26.,length(cameraPosition-vEdW))*.7+.3;
 d=(tC.r-.5)*.38+(tB.r-.5)*.14+fol*(tA.r-.5)*.12;
  d+=sl*(1.-fol)*((sa-.5)*.32*sk*(1.-.8*bri)+(tC.b-.5)*.08+(tA.r-.5)*.12);   // (long cracks on cliffs read as worms: none)
#endif
 diffuseColor.rgb*=.93*clamp(1.+d*uEdA*ENVDET_K,.45,1.4);}
#endif
`,GR='\n{float n1=psxN(vPsxW*2.3),n2=psxN(vPsxW*.55+7.);diffuseColor.rgb*=.78+.3*n1+.16*(n2-.5);}\n';
  ['standard','physical','lambert','phong'].forEach(k=>{const L=THREE.ShaderLib[k];if(!L||L.ep183)return;L.ep183=1;
    L.vertexShader=VD+L.vertexShader.replace('#include <project_vertex>','#include <project_vertex>'+VC);
    let f=L.fragmentShader;if(f.indexOf(GR)>=0)f=f.replace(GR,'\n#ifndef ENVDET'+GR+'#endif\n');
    L.fragmentShader=FD+f.replace('#include <color_fragment>','#include <color_fragment>'+FC)})})();
// ---- materials: opt in (scenery) or stay out for good (anything a character uses) ----
function ep183Uni(){if(!EP183.u)EP183.u={t:{value:ep183Tex()},s:{value:EP183.s},a:{value:EP183.a}};return EP183.u}
function ep183Hook(m){const P=THREE.Material.prototype;if(m.onBeforeCompile&&m.onBeforeCompile._ep183)return;
  const prev=m.onBeforeCompile,ck=m.customProgramCacheKey,U=ep183Uni();
  const f=function(sh,r){if(prev&&prev!==P.onBeforeCompile)prev.call(this,sh,r);sh.uniforms.uEdT=U.t;sh.uniforms.uEdS=U.s;sh.uniforms.uEdA=U.a};f._ep183=1;
  const pk=ck&&ck!==P.customProgramCacheKey&&!ck._ep183?()=>ck.call(m):()=>(prev?String(prev):'');const nk=()=>pk()+'|ep183';nk._ep183=1;
  m.onBeforeCompile=f;m.customProgramCacheKey=nk;m.needsUpdate=true}
function ep183Mat(m,K){if(!m||m.userData.ep183No)return;if(!m.defines)m.defines={};
  if(m.defines.ENVDET===undefined||m.defines.ENVDET_K!==K){m.defines.ENVDET='';m.defines.ENVDET_K=K;m.needsUpdate=true;if(!m.userData.ep183)EP183.mats++}
  m.extensions=Object.assign(m.extensions||{},{derivatives:true});m.userData.ep183=1;ep183Hook(m)}
function ep183Out(m){if(!m||m.userData.ep183No)return;m.userData.ep183No=1;
  if(m.defines&&m.defines.ENVDET!==undefined){delete m.defines.ENVDET;delete m.defines.ENVDET_K;m.needsUpdate=true;EP183.mats--}}
function ep183Ok(m){return !!m&&(m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial)&&!m.skinning&&!(m.transparent&&m.opacity<.98)&&!m.userData.lpsSkip}
// ---- baked shading: once per geometry ----
function ep183Bake(g,o){if(!g||g.userData.ep183b)return;g.userData.ep183b=1;const P=g.attributes.position,C=g.attributes.color;
  if(!P||!C||C.itemSize<3||P.count<24||P.count>2e5)return;const T0=performance.now(),n=P.count,I=g.index?g.index.array:null,nt=I?I.length/3:n/3;
  let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;for(let i=0;i<n;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z}
  const H=y1-y0,Sz=Math.max(x1-x0,H,z1-z0,1e-3),q=2e4/Sz,mp=new Map(),id=new Int32Array(n);let m=0;const VX=[];
  for(let i=0;i<n;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),k=Math.round(x*q)+'_'+Math.round(y*q)+'_'+Math.round(z*q);let w=mp.get(k);if(w===undefined){w=m++;mp.set(k,w);VX.push(x,y,z)}id[i]=w}
  const NN=new Float32Array(m*3),nb=Array.from({length:m},()=>[]),cr=(a,b)=>{const L=nb[a];if(L.indexOf(b)<0)L.push(b)};
  for(let t=0;t<nt;t++){const a=I?I[t*3]:t*3,b=I?I[t*3+1]:t*3+1,c=I?I[t*3+2]:t*3+2,A=id[a],B=id[b],Cc=id[c];if(A===B||B===Cc||A===Cc)continue;
    const ux=VX[B*3]-VX[A*3],uy=VX[B*3+1]-VX[A*3+1],uz=VX[B*3+2]-VX[A*3+2],vx=VX[Cc*3]-VX[A*3],vy=VX[Cc*3+1]-VX[A*3+1],vz=VX[Cc*3+2]-VX[A*3+2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const w of [A,B,Cc]){NN[w*3]+=nx;NN[w*3+1]+=ny;NN[w*3+2]+=nz}
    cr(A,B);cr(B,A);cr(B,Cc);cr(Cc,B);cr(A,Cc);cr(Cc,A)}
  let tv=new Float32Array(m),mean=0;
  for(let w=0;w<m;w++){let l=Math.hypot(NN[w*3],NN[w*3+1],NN[w*3+2])||1;NN[w*3]/=l;NN[w*3+1]/=l;NN[w*3+2]/=l;
    let dx=0,dy=0,dz=0;for(const j of nb[w]){const ex=VX[j*3]-VX[w*3],ey=VX[j*3+1]-VX[w*3+1],ez=VX[j*3+2]-VX[w*3+2],el=Math.hypot(ex,ey,ez)||1;dx+=ex/el;dy+=ey/el;dz+=ez/el}
    const dl=Math.hypot(dx,dy,dz);tv[w]=dl<1e-5?.5:Math.acos(Math.max(-1,Math.min(1,(NN[w*3]*dx+NN[w*3+1]*dy+NN[w*3+2]*dz)/dl)))/Math.PI}
  for(let k=0;k<2;k++){const t2=new Float32Array(m);for(let w=0;w<m;w++){let s=tv[w];for(const j of nb[w])s+=tv[j];t2[w]=s/(nb[w].length+1)}tv=t2}
  for(let w=0;w<m;w++)mean+=tv[w];mean/=Math.max(1,m);
  const cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2,hx=Math.max(1e-3,(x1-x0)/2),hy=Math.max(1e-3,H/2),hz=Math.max(1e-3,(z1-z0)/2),hg=Math.min(.6,Math.max(.12,H*.22)),
    sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)},K=o||{},kc=K.cav==null?1:K.cav;
  const F=new Float32Array(m*3);
  for(let w=0;w<m;w++){const x=VX[w*3],y=VX[w*3+1],z=VX[w*3+2],ny=NN[w*3+1];
    let f=1+Math.max(-.3,Math.min(.14,(tv[w]-mean)*1.5))*kc;                                         // crease darker, ridge lighter
    f*=.8+.2*sm(.2,.9,Math.hypot((x-cx)/hx,(y-cy)/hy,(z-cz)/hz));                                    // heart of the mass darker
    if(K.ground)f*=.7+.3*sm(0,hg,y-y0);                                                             // where it meets the ground
    f*=.8+.24*sm(-.75,.55,ny);                                                                     // turned down: darker
    const dn=sm(.15,-.75,ny)*.55,up=sm(.35,1,ny);                                                   // ... and cooler; turned up: warmer
    F[w*3]=f*(1-.13*dn)*(1+.035*up);F[w*3+1]=f*(1-.06*dn)*(1+.015*up);F[w*3+2]=f*(1+.1*dn)*(1-.03*up)}
  for(let i=0;i<n;i++){const w=id[i];C.setXYZ(i,C.getX(i)*F[w*3],C.getY(i)*F[w*3+1],C.getZ(i)*F[w*3+2])}
  C.needsUpdate=true;EP183.geos++;EP183.bakeMs+=performance.now()-T0}
// the scattered decorations (WD kinds) at load: weathered and graded already (v177), and their base darkening is in the weathering
function ep183Kinds(){if(typeof WD=='undefined'||!WD||!WD.T)return;const T0=performance.now();
  for(const k in WD.T){const S=WD.T[k];if(!S||!S.parts)continue;EP183.kinds++;const w=EP183.woodRe.test(k);S.parts.forEach(p=>{if(!p.glow&&!p.mat&&p.g){p.g.userData.ep183nw=!w;try{ep183Bake(p.g,{ground:false})}catch(e){}}})}
  EP183.kindMs=Math.round(performance.now()-T0)}
// ---- the scan: every scenery mesh in the world opts in, anything a character uses stays out ----
function ep183Scan(){if(!EP183.on||typeof scene=='undefined')return;const T0=performance.now(),cm=new Map(),isC=a=>{let v=cm.get(a);if(v===undefined){v=!!a.isBone||a.children.some(c=>c.isSkinnedMesh);cm.set(a,v)}return v};EP183.scans++;
  if(typeof GTX!='undefined'&&GTX.list)GTX.list.forEach(T=>{const m=T.mat;if(m&&!m.userData.ep183){ep183Mat(m,EP183.kg);m.defines.ENVDET_G=''}});
  const full=EP183.scans%8===1;   // a mesh seen before is looked at again in full every 8th scan (~12 s): it may have joined a character since
  scene.traverse(o=>{if(!o.isMesh||!o.material)return;
    if(!full&&o._ep183===o.material){const m=o.material;if(m.userData&&m.userData.ep183===1&&!(m.onBeforeCompile&&m.onBeforeCompile._ep183))ep183Hook(m);return}
    o._ep183=o.material;
    let ch=!!o.isSkinnedMesh;if(!ch){let a=o.parent;while(a&&a!==scene){if(isC(a)){ch=true;break}a=a.parent}}
    const ms=Array.isArray(o.material)?o.material:[o.material];
    for(const m of ms){if(!m)continue;if(ch){ep183Out(m);continue}if(m.userData.ep183No)continue;
      if(m.userData.ep183===1){if(!m.onBeforeCompile||!m.onBeforeCompile._ep183)ep183Hook(m);continue}
      if(m.userData.ep183===-1||!ep183Ok(m)){m.userData.ep183=-1;continue}
      ep183Mat(m,EP183.ko);if(o.geometry&&o.geometry.userData.ep183nw&&m.defines.ENVDET_NW===undefined){m.defines.ENVDET_NW='';m.needsUpdate=true}}
    if(!ch&&o.geometry&&!o.geometry.userData.ep183b&&o.geometry.attributes.color&&ms.some(m=>m&&m.userData.ep183===1&&m.vertexColors)){
      const bb=o.geometry.boundingBox||(o.geometry.computeBoundingBox(),o.geometry.boundingBox),h=bb.max.y-bb.min.y;
      try{ep183Bake(o.geometry,{ground:Math.abs(bb.min.y)<Math.max(.05,h*.08)})}catch(e){}}});
  EP183.ms=Math.round((performance.now()-T0)*10)/10}
try{ep183Uni();ep183Kinds();ep183Scan()}catch(e){console.warn('v183 env paint',e)}
setInterval(()=>{try{ep183Scan()}catch(e){}},2500);
