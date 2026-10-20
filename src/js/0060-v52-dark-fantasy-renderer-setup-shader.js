// ================= v52: dark-fantasy renderer setup (shader patches must run before anything compiles) =================
var PSXSET=(()=>{try{return JSON.parse(localStorage.getItem('et_set')||'{}')||{}}catch(_){return {}}})();
var PSXON=PSXSET.psx!==false,PSXH=PSXSET.psxRes==null?0:+PSXSET.psxRes;if(!PSXON)PSXH=0;
if(PSXON){
  if(PSXH>0){const g=(PSXH*.3).toFixed(1),gx=(PSXH*.3*1.7).toFixed(1);
    THREE.ShaderChunk.project_vertex+='\n#ifndef PSX_NOSNAP\nif(gl_Position.w>0.){vec2 psxG=vec2('+gx+','+g+');gl_Position.xy=floor(gl_Position.xy/gl_Position.w*psxG+.5)/psxG*gl_Position.w;}\n#endif\n'}
  const VW='\n#ifdef USE_INSTANCING\nvPsxW=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\n#else\nvPsxW=(modelMatrix*vec4(transformed,1.)).xyz;\n#endif\n';
  // smooth stony grime: two octaves of value noise in world space
  const NZ='\nfloat psxH(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}\nfloat psxN(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(psxH(i),psxH(i+vec3(1,0,0)),f.x),mix(psxH(i+vec3(0,1,0)),psxH(i+vec3(1,1,0)),f.x),f.y),mix(mix(psxH(i+vec3(0,0,1)),psxH(i+vec3(1,0,1)),f.x),mix(psxH(i+vec3(0,1,1)),psxH(i+vec3(1,1,1)),f.x),f.y),f.z);}\n';
  const GR='\n{float n1=psxN(vPsxW*2.3),n2=psxN(vPsxW*.55+7.);diffuseColor.rgb*=.78+.3*n1+.16*(n2-.5);}\n';
  ['standard','physical','lambert','phong','toon'].forEach(k=>{const L=THREE.ShaderLib[k];if(!L)return;
    L.vertexShader='varying vec3 vPsxW;\n'+L.vertexShader.replace('#include <project_vertex>','#include <project_vertex>'+VW);
    L.fragmentShader='varying vec3 vPsxW;\n'+NZ+L.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>'+GR)});
}
const POST=(()=>{
  let hf=false;try{hf=!!(ren.extensions.get('EXT_color_buffer_float')||ren.extensions.get('EXT_color_buffer_half_float'))}catch(e){}
  const w2=ren.capabilities.isWebGL2,opt={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,type:hf?THREE.HalfFloatType:THREE.UnsignedByteType,depthBuffer:true};
  const T=(w,h,ms)=>{if(ms&&w2){try{const t=new THREE.WebGLMultisampleRenderTarget(w,h,opt);t.samples=4;return t}catch(e){}}return new THREE.WebGLRenderTarget(w,h,opt)};
  const vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',oc=new THREE.OrthographicCamera(-1,1,1,-1,0,1),ps=new THREE.Scene(),fq=new THREE.Mesh(new THREE.PlaneGeometry(2,2),null);fq.frustumCulled=false;ps.add(fq);
  const M=(fs,u)=>new THREE.ShaderMaterial({vertexShader:vs,fragmentShader:fs,uniforms:u,depthTest:false,depthWrite:false});
  const mBright=M('uniform sampler2D t;uniform float thr;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float l=max(max(c.r,c.g),c.b);gl_FragColor=vec4(c*smoothstep(thr,thr+.9,l),1.);}',{t:{value:null},thr:{value:.95}}),
   mBlur=M('uniform sampler2D t;uniform vec2 dir;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb*.227;c+=(texture2D(t,vUv+dir*1.385).rgb+texture2D(t,vUv-dir*1.385).rgb)*.3162;c+=(texture2D(t,vUv+dir*3.23).rgb+texture2D(t,vUv-dir*3.23).rgb)*.0703;gl_FragColor=vec4(c,1.);}',{t:{value:null},dir:{value:new THREE.Vector2()}}),
   mRay=M('uniform sampler2D t;uniform vec2 sun;varying vec2 vUv;void main(){vec2 d=(sun-vUv)*.034;vec2 uv=vUv;float w=1.;vec3 a=vec3(0.);for(int i=0;i<28;i++){uv+=d;a+=texture2D(t,uv).rgb*w;w*=.935;}gl_FragColor=vec4(a/18.,1.);}',{t:{value:null},sun:{value:new THREE.Vector2(.5,.5)}}),
   mComp=M(`uniform sampler2D t,bl,ry;uniform float ex,bk,rk,sat,vig,time,grain,psx;uniform vec2 res;uniform vec3 rayC,shT,hiT;varying vec2 vUv;
   vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
   float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
   void main(){vec3 c=texture2D(t,vUv).rgb+texture2D(bl,vUv).rgb*bk+texture2D(ry,vUv).rgb*rk*rayC;c*=ex;c=aces(c);
    float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,sat);c*=mix(shT,vec3(1.),smoothstep(0.,.45,l));c=mix(c,c*hiT,smoothstep(.45,1.,l)*.6);
    vec2 q=vUv-.5;c*=1.-dot(q,q)*vig;c+=(hs(vUv*vec2(1731.,977.)+time)-.5)*grain;
    if(psx>.5){vec2 px=floor(vUv*res);vec2 a=px*.5;float b2a=fract(dot(floor(a),vec2(.5,floor(a.y)*.75)));float b2b=fract(dot(px,vec2(.5,px.y*.75)));float bay=b2a*.25+b2b;c=floor(clamp(c,0.,1.)*31.+bay)/31.;}
    gl_FragColor=vec4(c,1.);}`,
   {t:{value:null},bl:{value:null},ry:{value:null},ex:{value:1},bk:{value:.4},rk:{value:.3},sat:{value:.95},vig:{value:1.1},time:{value:0},grain:{value:.035},rayC:{value:new THREE.Color(1,.9,.7)},psx:{value:PSXON&&PSXH>0?1:0},res:{value:new THREE.Vector2(320,240)},shT:{value:new THREE.Color(.9,.96,1.08)},hiT:{value:new THREE.Color(1.08,1,.9)}});
  let r0,rb1,rb2,rr,sz=new THREE.Vector2();
  const P={on:true,u:mComp.uniforms,bu:mBright.uniforms,resize(){ren.getDrawingBufferSize(sz);let w=Math.max(2,sz.x|0),h=Math.max(2,sz.y|0);[r0,rb1,rb2,rr].forEach(t=>t&&t.dispose());if(PSXON&&PSXH>0){h=Math.min(h,PSXH);w=Math.max(2,Math.round(h*sz.x/Math.max(1,sz.y)));r0=new THREE.WebGLRenderTarget(w,h,Object.assign({},opt,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter}))}else r0=T(w,h,true);mComp.uniforms.res.value.set(w,h);const q=Math.max(2,w>>2),qh=Math.max(2,h>>2);rb1=T(q,qh);rb2=T(q,qh);rr=T(q,qh)},
   pass(m,src,dst){fq.material=m;if(src)m.uniforms.t.value=src.texture;ren.setRenderTarget(dst);ren.render(ps,oc)},
   render(){
    ren.info.reset();
    if(!P.on||!r0){ren.setRenderTarget(null);ren.render(scene,cam);return}
    ren.setRenderTarget(r0);ren.clear();ren.render(scene,cam);
    P.pass(mBright,r0,rb1);
    mRay.uniforms.sun.value.copy(ATM.sunU);P.pass(mRay,rb1,rr);
    const qw=1/rb1.width,qh=1/rb1.height;
    for(let i=0;i<2;i++){mBlur.uniforms.dir.value.set(qw*(1+i),0);P.pass(mBlur,rb1,rb2);mBlur.uniforms.dir.value.set(0,qh*(1+i));P.pass(mBlur,rb2,rb1)}
    mComp.uniforms.t.value=r0.texture;mComp.uniforms.bl.value=rb1.texture;mComp.uniforms.ry.value=rr.texture;mComp.uniforms.time.value=(performance.now()%1000)/1000;
    fq.material=mComp;ren.setRenderTarget(null);ren.render(ps,oc)}};
  return P})();
function rs(){const s=$('stage'),w=s.clientWidth,h=s.clientHeight;if(!w||!h)return;ren.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();POST.resize()}
new ResizeObserver(rs).observe($('stage'));rs();
const TMP=new THREE.Vector3(),TMC=new THREE.Color();
const QL={lv:0,acc:0,n:0,up:0,auto:location.protocol!='file:',pr:Math.min(devicePixelRatio||1,1.5)};
const QLV=[{pr:1,far:104,near:46,sh:2048},{pr:.78,far:84,near:38,sh:2048},{pr:.62,far:68,near:30,sh:1024},{pr:.5,far:56,near:24,sh:1024}];
function setQ(l){QL.lv=l;const q=QLV[l];ren.setPixelRatio(QL.pr*q.pr);FARR=q.far;NEARR=q.near;if(sun.shadow.mapSize.x!=q.sh){sun.shadow.mapSize.set(q.sh,q.sh);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}rs()}
function qualityTick(ms){
  if(!QL.auto||ms>200)return;QL.acc+=ms;QL.n++;
  if(QL.acc>2500){const avg=QL.acc/QL.n;QL.acc=0;QL.n=0;
    if(avg>25&&QL.lv<QLV.length-1){QL.up=0;setQ(QL.lv+1)}else if(avg<13.5&&QL.lv>0){if(++QL.up>=4){QL.up=0;setQ(QL.lv-1)}}else QL.up=0}
}
function atmos_base(dt,now){
  const U=POST.u;WTR.vis=true;
  SKY.visible=true;
  if(dt>0)TOD=(TOD+dt/DAYLEN)%1;
  const el=TOD*6.2832,sd=ATM.sd.set(Math.cos(el)*.9,Math.sin(el)*.8,-.42).normalize(),s=sd.y;
  const day=smt(-.1,.3,s),gold=(1-smt(.04,.4,s))*smt(-.14,.06,s),night=1-smt(-.2,.02,s);ATM.night=night;ATM.day=day;ATM.gold=gold;
  const su=SKY.material.uniforms;
  su.top.value.copy(CK.topN).lerp(CK.topD,day).lerp(CK.topG,gold*.35);
  su.hor.value.copy(CK.horN).lerp(CK.horD,day).lerp(CK.horG,gold*.85);
  ATM.sc.copy(CK.scL).lerp(CK.scH,smt(.05,.55,s));su.sunCol.value.copy(ATM.sc);su.sunDir.value.copy(sd);su.night.value=night;su.time.value=now/1000;
  scene.fog.color.copy(su.hor.value).multiplyScalar(.82+.1*day);scene.background=scene.fog.color;
  scene.fog.density=.0185*(1+night*.3+gold*.28);
  const useSun=s>-.01;
  if(useSun){sun.color.copy(ATM.sc);sun.intensity=2.1*smt(-.02,.2,s);TMP.copy(sd)}else{sun.color.setRGB(.55,.66,1);sun.intensity=.55*night;TMP.copy(sd).negate()}
  sun.position.set(pl.position.x+TMP.x*60,pl.position.y+TMP.y*60,pl.position.z+TMP.z*60);sun.target.position.copy(pl.position);
  hemi.color.copy(CK.hyN).lerp(CK.hyD,day).lerp(CK.hyG,gold*.5);hemi.groundColor.copy(CK.gN).lerp(CK.gD,day);hemi.intensity=.3+.36*day;
  torch.intensity=(.2+1.25*night+gold*.3)+Math.sin(now/90)*.15+Math.random()*.1;
  // sun on screen (for shafts)
  TMP.copy(sd).multiplyScalar(100).add(cam.position).project(cam);ATM.sunU.set(TMP.x*.5+.5,TMP.y*.5+.5);
  const fwd=TMC.set(0,0,0);cam.getWorldDirection(TMP);ATM.sunVis=Math.max(0,TMP.dot(sd))*smt(-.03,.2,s)*(1-night);
  U.ex.value=.9+.06*day;U.bk.value=.42+.18*gold;U.rk.value=.55*ATM.sunVis*(.6+.7*gold);U.rayC.value.copy(ATM.sc);U.sat.value=.98+.14*day;U.vig.value=1.15;
  U.shT.value.setRGB(.88+.04*day,.95,1.1-.04*day);U.hiT.value.setRGB(1.1,1.02,.88+.08*(1-gold));
  [WTR.w,WTR.l].forEach(m=>{const u=m.material.uniforms;u.time.value=now/1000;u.fogC.value.copy(scene.fog.color);u.fogD.value=scene.fog.density;u.hor.value.copy(su.hor.value);u.top.value.copy(su.top.value);u.sunDir.value.copy(sd);u.sunCol.value.copy(ATM.sc).multiplyScalar(1-night*.9);u.amb.value=.15+.85*day})
}

const mt=c=>new THREE.MeshStandardMaterial({color:c,roughness:.95,flatShading:false});
const d0=new THREE.Object3D(),cc=new THREE.Color();
const CHN=32,VIL=[];let CHL=[];
function inst(geo,n,cast,near){
  const v={geo,n,cast,near,material:new THREE.MeshStandardMaterial({roughness:1}),M:new Float32Array(n*16),C:new Float32Array(n*3).fill(1),cm:null,cl:null,instanceMatrix:{needsUpdate:true},
    setMatrixAt(i,m){m.toArray(this.M,i*16);const c=this.cm&&this.cm[i];if(c){m.toArray(c.instanceMatrix.array,this.cl[i]*16);c.instanceMatrix.needsUpdate=true}},
    getMatrixAt(i,m){m.fromArray(this.M,i*16)},
    setColorAt(i,c){c.toArray(this.C,i*3)}};
  VIL.push(v);return v}
function buildTerrain(chk){
  const mat=new THREE.MeshStandardMaterial({map:gt,roughness:1,metalness:0,envMapIntensity:.5}),NZ=`float hs3(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float vn3(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs3(i),hs3(i+vec2(1,0)),f.x),mix(hs3(i+vec2(0,1)),hs3(i+vec2(1,1)),f.x),f.y);}
  float fb3(vec2 p){return vn3(p)*.55+vn3(p*2.1)*.3+vn3(p*4.3)*.15;}`;
  mat.flatShading=true;mat.userData.lps=1;
  const obc=T=>sh=>{sh.uniforms.uWH={value:new THREE.Vector2(T.w,T.h)};sh.uniforms.uGO={value:new THREE.Vector2(T.x0,T.y0)};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=position;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform vec2 uWH,uGO;\n'+NZ).replace('#include <map_fragment>',`
    vec2 fi=floor(vWP.xz),ff=vWP.xz-fi;float par=mod(fi.x+fi.y,2.);
    vec2 co=par>.5?((ff.x+ff.y<1.)?vec2(.3333):vec2(.6667)):((ff.y>ff.x)?vec2(.3333,.6667):vec2(.6667,.3333));
    vec2 fc=fi+co;
    vec4 tC=texture2D(map,vUv),tF=texture2D(map,vec2((fc.x-uGO.x+.5)/uWH.x,1.-(fc.y-uGO.y+.5)/uWH.y));float pav=step(tC.a,.995);
    vec4 texelColor=mapTexelToLinear(mix(tF,tC,pav));diffuseColor.rgb*=texelColor.rgb;
    {vec3 fn=normalize(cross(dFdx(vWP),dFdy(vWP)));if(fn.y<0.)fn=-fn;float sl=1.-clamp(fn.y,0.,1.);
     vec2 q=mix(fc,vWP.xz,pav);float fh=hs3(fc*1.731+.37);float yc=vWP.y-dot(fn.xz,fc-vWP.xz)/max(fn.y,.2);
     float n1=fb3(q*.8),n2=fb3(q*3.1);
     float sand=smoothstep(.05,.13,tF.r-tF.g)*(1.-pav);vec3 rock=mix(vec3(.36,.33,.31),tF.rgb*vec3(.78,.62,.5),.35+.4*sand)*(.72+.5*n2)*(.82+.36*fh);float rm=smoothstep(.15,.34,sl+(n1-.5)*.16);
     float n0=fb3(q*.045);diffuseColor.rgb*=mix(mix(vec3(.74,.9,.62),vec3(1.02,.98,.86),n0),mix(vec3(.86,.8,.72),vec3(1.06,1.,.9),n0),sand)*(.84+.28*n2)*mix(.84+.3*fh,1.,pav);
     diffuseColor.rgb=mix(diffuseColor.rgb,rock,rm);float sn=smoothstep(9.5,14.,yc+(n1-.5)*4.)*(1.-smoothstep(.22,.6,sl))*(1.-sand);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.9,.94,1.)*(.84+.16*fh),sn);}`)};
  GTX.list.forEach(T=>{const m=T===GTX.main?mat:mat.clone();m.map=T.t;m.flatShading=true;m.userData.lps=1;m.onBeforeCompile=obc(T);T.mat=m});
  for(let cz=0;cz*CHN<H;cz++)for(let cx=0;cx*CHN<W;cx++){
    const x0=cx*CHN,z0=cz*CHN,TT=GTX.pick(cx,cz),nx=Math.min(CHN,W-x0),nz=Math.min(CHN,H-z0),vc=(nx+1)*(nz+1),pos=new Float32Array(vc*3),nor=new Float32Array(vc*3),uv=new Float32Array(vc*2),idx=[];
    let y0=1e9,y1=-1e9;
    for(let iz=0;iz<=nz;iz++)for(let ix=0;ix<=nx;ix++){
      const x=x0+ix,z=z0+iz,k=iz*(nx+1)+ix,y=GHv(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;
      const gx=GHv(x-1,z)-GHv(x+1,z),gz=GHv(x,z-1)-GHv(x,z+1),l=Math.hypot(gx,2,gz);nor[k*3]=gx/l;nor[k*3+1]=2/l;nor[k*3+2]=gz/l;
      uv[k*2]=(x-TT.x0+.5)/TT.w;uv[k*2+1]=1-(z-TT.y0+.5)/TT.h;if(y<y0)y0=y;if(y>y1)y1=y}
    for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++){const a=iz*(nx+1)+ix,b=a+1,c=a+nx+1,d=c+1;if((ix+iz)&1)idx.push(a,c,b,b,c,d);else idx.push(a,c,d,a,d,b)}
    if(y1<-30)continue; // v89: skip chunks that are all void
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);
    const m=new THREE.Mesh(g,TT.mat);m.receiveShadow=true;m.frustumCulled=false;m.visible=false;m.userData.cast=false;scene.add(m);
    const k=cz*100+cx,c=chk[k]=chk[k]||{ms:[],ns:[],on:false,non:false,box:null};c.ms.push(m);
    c.box=new THREE.Box3(new THREE.Vector3(x0-2,y0-2,z0-2),new THREE.Vector3(x0+nx+2,y1+9,z0+nz+2));
  }
}

// ---- v83 low-poly nature kit: jittered, flat-shaded shapes with painted per-face colours ----
// Colours are multipliers on top of each instance's colour, so biome tints still apply.
const NK=(()=>{
  const hs=(a,b,c)=>{const k=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return k-Math.floor(k)};
  // o: j = corner jitter, jy = vertical share of it, f = reshape(x,y,z)->[x,y,z], paint(h,ny,r,x,y,z)->[r,g,b]
  function fin(g,o){o=o||{};const j=o.j||0,sd=o.sd||1;let p=g.attributes.position;
    for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
      if(o.f){const v=o.f(x,y,z);x=v[0];y=v[1];z=v[2]}
      if(j){const kx=Math.round(x*400),ky=Math.round(y*400),kz=Math.round(z*400);x+=(hs(kx,ky,kz+sd)-.5)*j;y+=(hs(ky+sd,kz,kx)-.5)*j*(o.jy==null?1:o.jy);z+=(hs(kz,kx+sd,ky)-.5)*j}
      p.setXYZ(i,x,y,z)}
    if(g.index)g=g.toNonIndexed();if(g.attributes.uv)g.deleteAttribute('uv');if(g.attributes.uv2)g.deleteAttribute('uv2');g.computeVertexNormals();g.computeBoundingBox();
    p=g.attributes.position;const n=g.attributes.normal,bb=g.boundingBox,col=new Float32Array(p.count*3),pt=o.paint||def,hy=Math.max(1e-4,bb.max.y-bb.min.y);
    for(let i=0;i+2<p.count;i+=3){const cx=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3,cy=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3,cz=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3;
      const c=pt((cy-bb.min.y)/hy,n.getY(i),hs(cx*31.3,cy*17.7,cz*23.1+sd),cx,cy,cz);for(let k=0;k<3;k++)col.set(c,(i+k)*3)}
    g.setAttribute('color',new THREE.BufferAttribute(col,3));g.userData.lps=1;return g}
  const def=(h,ny,r)=>{const v=(.74+.4*h)*(.86+.24*r)*(ny<-.35?.6:1);return [v,v,v]};
  // move a geometry into place (rotation in radians, then translation)
  const tr=(g,x,y,z,rx,ry,rz,s)=>{if(s)g.scale(s[0],s[1],s[2]);if(rx)g.rotateX(rx);if(ry)g.rotateY(ry);if(rz)g.rotateZ(rz);g.translate(x||0,y||0,z||0);return g};
  function merge(gs){let n=0;gs.forEach(g=>n+=g.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
    gs.forEach(g=>{P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);C.set(g.attributes.color.array,o*3);o+=g.attributes.position.count});
    const m=new THREE.BufferGeometry();m.setAttribute('position',new THREE.BufferAttribute(P,3));m.setAttribute('normal',new THREE.BufferAttribute(N,3));m.setAttribute('color',new THREE.BufferAttribute(C,3));m.computeBoundingSphere();m.userData.lps=1;return m}
  // painters
  const leaf=(h,ny,r)=>{if(ny<-.25){const v=.42+.12*r;return [v,v*1.02,v*.95]}const v=(.6+.62*h)*(.84+.3*r);return [v*.98,v*1.04,v*.9]};
  const bark=(h,ny,r)=>{const v=(.62+.3*h)*(.8+.4*r)*(ny>.6?1.15:1);return [v,v*.96,v*.9]};
  const stone=(h,ny,r)=>{if(ny>.55){const v=(.94+.14*r);return r>.55?[v*.86,v*1.0,v*.78]:[v,v,v*.97]}const v=(ny<-.3?.55:.74+.26*h)*(.84+.3*r);return [v,v,v*1.02]};
  const rock=(sz,j,sd)=>fin(new THREE.DodecahedronGeometry(sz,0),{j:j,sd:sd,paint:stone});
  return {fin,def,tr,merge,leaf,bark,stone,rock,hs};
})();
const WIND={t:{value:0}},FADE={cam:{value:new THREE.Vector3()},pl:{value:new THREE.Vector3()}};
function windMat(mat,amp,off){
  mat.onBeforeCompile=sh=>{sh.uniforms.uT=WIND.t;sh.uniforms.uA={value:amp};sh.uniforms.uO={value:off||0};sh.uniforms.uCam=FADE.cam;sh.uniforms.uPl=FADE.pl;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT,uA,uO;varying vec3 vWP2;').replace('#include <begin_vertex>',`#include <begin_vertex>
    #ifdef USE_INSTANCING
    {float sy=length(instanceMatrix[1].xyz),sx=length(instanceMatrix[0].xyz);float hg=max(0.,transformed.y*sy+uO);
     float ph=instanceMatrix[3].x*.6+instanceMatrix[3].z*.45;float sw=uA*hg*hg*(sin(uT*1.7+ph)*.6+sin(uT*.8+ph*.3)*.8+.35*sin(uT*3.1+ph*2.));
     transformed.x+=sw/sx;transformed.z+=sw*.55/sx;vWP2=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;}
    #else
    vWP2=(modelMatrix*vec4(transformed,1.)).xyz;
    #endif`);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uCam,uPl;varying vec3 vWP2;').replace('void main() {',`void main() {
    {vec3 ab=uPl-uCam;float t=clamp(dot(vWP2-uCam,ab)/dot(ab,ab),0.,1.);float d=length(vWP2-(uCam+ab*t));
     float f=smoothstep(.8,2.3,d);f*=smoothstep(.5,2.4,length(vWP2-uCam));f=mix(f,1.,smoothstep(.86,.97,t));
     float dh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(f<dh)discard;}`)};
  mat.customProgramCacheKey=()=>'ifx';
}
function buildVI(){
  const chk={};buildTerrain(chk);
  VIL.forEach(v=>{windMat(v.material,v.sway||0,v.off);
    const g={};v.cm=new Array(v.n);v.cl=new Int32Array(v.n);
    for(let i=0;i<v.n;i++){const cx=Math.max(0,Math.floor(v.M[i*16+12]/CHN)),cz=Math.max(0,Math.floor(v.M[i*16+14]/CHN)),k=cz*100+cx;(g[k]=g[k]||[]).push(i)}
    for(const k in g){
      const ids=g[k],mesh=new THREE.InstancedMesh(v.geo,v.material,ids.length),col=new Float32Array(ids.length*3);
      ids.forEach((i,j)=>{mesh.instanceMatrix.array.set(v.M.subarray(i*16,i*16+16),j*16);col.set(v.C.subarray(i*3,i*3+3),j*3);v.cm[i]=mesh;v.cl[i]=j});
      mesh.instanceColor=new THREE.InstancedBufferAttribute(col,3);mesh.castShadow=false;mesh.userData.cast=!!v.cast;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.visible=false;scene.add(mesh);
      (chk[k]||(chk[k]={ms:[],ns:[],on:false,non:false,box:new THREE.Box3(new THREE.Vector3((k%100)*CHN-2,-3,Math.floor(k/100)*CHN-2),new THREE.Vector3((k%100+1)*CHN+2,40,(Math.floor(k/100)+1)*CHN+2))}))[v.near?'ns':'ms'].push(mesh)}
  });
  CHL=Object.values(chk);
}
const FR=new THREE.Frustum(),PM=new THREE.Matrix4();let FARR=104,NEARR=46;

function put(m,i,x,y,z,sx,sy,sz,hex,j){d0.position.set(x,y+GH(x,z),z);d0.scale.set(sx,sy,sz);d0.updateMatrix();m.setMatrixAt(i,d0.matrix);cc.setHex(hex).offsetHSL(0,0,(Math.random()-.5)*j);m.setColorAt(i,cc)}
// ---- terrain: smooth painted ground (colors blend between neighboring tiles) ----
// v97: two ground textures painted from the same tile colours (see build/pN_world2.py): the world at GPX px per tile,
// Duskhold's paved square at 4 px per tile. GTX.pick(cx,cz) gives a terrain chunk its texture.
const GPX=2;
const GTX=(()=>{
const bc=(x,y)=>{x=Math.max(0,Math.min(W-1,x));y=Math.max(0,Math.min(H-1,y));const t=MAP[y][x],b=BIOMES[MAP.bio[y][x]],w=b.wat;return t=='g'?b.grs:t=='a'?b.acc:t=='#'?b.frs:t=='R'?[b.gnd[0]*.45+42,b.gnd[1]*.45+40,b.gnd[2]*.45+38]:(t=='P'||t=='B'||t=='W')?[156,148,134]:t=='p'?[146,121,86]:t=='~'?(b.lava?[110,40,14]:[w[0]*.4,w[1]*.4,w[2]*.5]):b.gnd};
const TC=new Float32Array(W*H*3),CF=new Uint8Array(W*H);
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=bc(x,y),k=y*W+x,t=MAP[y][x];TC[k*3]=c[0];TC[k*3+1]=c[1];TC[k*3+2]=c[2];CF[k]=(t=='P'||t=='B'||t=='W')?1:t=='p'?2:0}
const cl=(v,m)=>v<0?0:v>m?m:v;
const paint=(OX,OY,TW,TH,PX)=>{const NW=TW*PX,NH=TH*PX,c=document.createElement('canvas');c.width=NW;c.height=NH;const g2=c.getContext('2d'),gid=g2.createImageData(NW,NH),gd=gid.data;
 for(let ly=0;ly<NH;ly++){const qy=ly+OY*PX,ty=qy/PX-.5,y0=Math.floor(ty),fy=ty-y0,ya=cl(y0,H-1),yb=cl(y0+1,H-1),yr=cl(Math.round(ty),H-1);
  for(let lx=0;lx<NW;lx++){const qx=lx+OX*PX;
    const tx=qx/PX-.5,x0=Math.floor(tx),fx=tx-x0,xa=cl(x0,W-1),xb=cl(x0+1,W-1),ct=CF[yr*W+cl(Math.round(tx),W-1)];let cb=1;
    if(ct==1){const rw=Math.floor(qy/2),lx=(qx+(rw&1)*1)%2;cb=(lx<.6||qy%2<.6)?.78:.96+(((qx/2|0)*7+rw*13)%7)/55}else if(ct==2){cb=.94+(((qx*7+qy*13)>>2)%5)/45}
    const n=cb*(.9+.1*(Math.sin(qx*.31+qy*.17)+Math.sin(qx*.13-qy*.29)+Math.sin((qx+qy)*.05))/1.5+(((qx*73856093^qy*19349663)>>>0)%100)/100*.07),k=(ly*NW+lx)*4,
      i0=(ya*W+xa)*3,i1=(ya*W+xb)*3,i2=(yb*W+xa)*3,i3=(yb*W+xb)*3,w0=(1-fx)*(1-fy)*n,w1=fx*(1-fy)*n,w2=(1-fx)*fy*n,w3=fx*fy*n;
    gd[k]=TC[i0]*w0+TC[i1]*w1+TC[i2]*w2+TC[i3]*w3;gd[k+1]=TC[i0+1]*w0+TC[i1+1]*w1+TC[i2+1]*w2+TC[i3+1]*w3;gd[k+2]=TC[i0+2]*w0+TC[i1+2]*w1+TC[i2+2]*w2+TC[i3+2]*w3;gd[k+3]=ct?250:255;
  }}
 g2.putImageData(gid,0,0);return {c,x0:OX,y0:OY,w:TW,h:TH,px:PX}};
// the paved square: chunk-aligned (CHN=32) rectangle around the town, the road to the Portal Court and the Courtyard path
const TR=[0,7,4,17],main=paint(0,0,W,H,GPX),town=paint(TR[0]*32-2,TR[1]*32-2,(TR[2]-TR[0])*32+4,(TR[3]-TR[1])*32+4,4);
return {main,town,list:[main,town],pick:(cx,cz)=>cx>=TR[0]&&cx<TR[2]&&cz>=TR[1]&&cz<TR[3]?town:main}})();
const gt=new THREE.CanvasTexture(GTX.main.c);gt.anisotropy=ren.capabilities.getMaxAnisotropy();GTX.main.t=gt;
try{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=MAP[y][x];if((t=='P'||t=='B'||t=='W'||t=='p')&&GTX.pick(x>>5,y>>5)!==GTX.town){console.warn('paved tile outside the town texture',x,y);y=H;break}}}catch(_){}
const gtT=new THREE.CanvasTexture(GTX.town.c);gtT.anisotropy=gt.anisotropy;GTX.town.t=gtT;
const NODE={},ZM=new THREE.Matrix4().makeScale(0,0,0),regN=(x,y,m,i)=>{(NODE[y*W+x]=NODE[y*W+x]||[]).push([m,i,null])};
const hx=(a,k)=>((a[0]*k|0)<<16)|((a[1]*k|0)<<8)|(a[2]*k|0);
const trees=[],gr=[];
MAP.forEach((r,y)=>r.forEach((t,x)=>{if(t=='#')trees.push([x,y]);if(t=='g')gr.push([x,y]);}));
