// ================= v176: whatever blocks the view turns see-through as a whole object, dithered (no window) =================
// Owner (Oct 29 2026): "I want no window and just objects to go transparent with dithering" (and the camera closing in at the map's
// edge and in front of Abeksi's buildings: 3360). Replaces v157/v164's round window round the hero (2420 scenery, 3190 ground) and
// the plants' tube (0060): ~11 times a second ob176Scan casts five rays from the camera to the hero (chest, head, knees, both
// shoulders) against the see-through-capable meshes drawn last frame, and each object a ray meets becomes a box in the shaders
// (uObBm/uObBM, weight uObBw, up to OB176N): every pixel of it in front of the hero is dithered away to OB176.k (the share left,
// screen-door, the old dither pattern). "The object": a plain mesh's largest object-sized group (a house = walls + roof), one tree
// or rock of an instanced set, or the joined piece of a big merged mesh (ob176Acc). The ground has one switch (uObT): when it
// blocks the view (or the camera is in it) every steep wall of ground in front of the hero is dithered. Boxes fade in and out over
// OB176.fade s. Floors under the line of sight stay (flat surfaces below the hero's knees, as before).
var OB176U0=[0,1,2,3,4,5,6,7];
var OB176={box:[],seen:[],t:0,last:0,under:false,bt:0,fade:.18,big:12,st:{scans:0,ms:0,hits:0,boxes:0},rc:new THREE.Raycaster(),acc:new WeakMap(),err:0};
OB176.on=true;OB176.k=.35;OB176.U={uObBm:{value:OB176U0.map(()=>new THREE.Vector3())},uObBM:{value:OB176U0.map(()=>new THREE.Vector3())},uObBw:{value:[0,0,0,0,0,0,0,0]},uObT:{value:0},uObK:{value:.35}};
// GLSL: box weight (soft .3 edge), in front of the hero (from 15 cm in front of the chest), the share kept
OB176.HEAD=`uniform vec3 uObBm[8],uObBM[8];uniform float uObBw[8],uObT,uObK;
float ob176Bx(vec3 p){float w=0.;for(int i=0;i<8;i++){if(uObBw[i]>0.){vec3 q=max(uObBm[i]-p,p-uObBM[i]);w=max(w,uObBw[i]*(1.-smoothstep(0.,.3,max(q.x,max(q.y,q.z)))));}}return w;}
float ob176Fr(vec3 p,vec3 c,vec3 h){vec3 ab=h-c;float L2=dot(ab,ab);if(L2<1e-4)return 0.;float t=dot(p-c,ab)/L2;if(t<=0.)return 0.;return smoothstep(-.1,.15,(1.-t)*sqrt(L2));}
`;
// give a patched material the uniforms and the GLSL helpers (call inside its onBeforeCompile, before its main is replaced)
function ob176Shader(sh){for(const k in OB176.U)sh.uniforms[k]=OB176.U[k];sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+OB176.HEAD)}
// the meshes drawn in the main view whose material can be dithered (userData.ob176); the next scan tests these
{const ob=THREE.Mesh.prototype.onBeforeRender;THREE.Mesh.prototype.onBeforeRender=function(){if(OB176.live){const M=this.material;let g=false;
    if(Array.isArray(M)){for(const m of M)if(m&&m.userData.ob176){g=true;break}}else g=!!(M&&M.userData.ob176);
    if(g&&!this.isSkinnedMesh&&this.userData.ob176F!==OB176.f){this.userData.ob176F=OB176.f;const m0=Array.isArray(M)?M[0]:M;OB176.seen.push(this,m0&&m0.userData.ob176Fl!=null?m0.userData.ob176Fl:null)}}
  if(ob!==THREE.Object3D.prototype.onBeforeRender)return ob.apply(this,arguments)}}
{const f=POST.render;POST.render=function(){const io=typeof IC151!='undefined'&&IC151.on;OB176.f=(OB176.f||0)+1;
  try{if(!io)ob176Tick()}catch(e){if(!OB176.err2){OB176.err2=1;console.warn('v176 tick',e)}}
  OB176.U.uObK.value=OB176.k;OB176.seen.length=0;OB176.live=!io;try{return f.apply(this,arguments)}finally{OB176.live=false}}}
var OB176N=8;
function ob176Ground(x,z){return GH(x,z)}
const OB176V=[0,1,2,3,4].map(()=>new THREE.Vector3()),OB176D=new THREE.Vector3(),OB176S=new THREE.Vector3(),OB176M=new THREE.Matrix4(),OB176B=new THREE.Box3();
function ob176Scan(){const B=OB176,C=FADE.cam.value,H=FADE.pl.value,t0=performance.now();B.st.scans++;
  for(const b of B.box)b.on=0;
  if(!OB176.on||(typeof IC151!='undefined'&&IC151.on)){B.bt=0;B.under=false;return}
  const T=OB176V,ab=OB176D.copy(H).sub(C);if(ab.lengthSq()<1e-4){B.bt=0;return}
  const sd=OB176S.set(ab.z,0,-ab.x);if(sd.lengthSq()>1e-6)sd.normalize();
  T[0].copy(H);T[1].copy(H).y+=.6;T[2].copy(H).y-=.75;T[3].copy(H).addScaledVector(sd,.38);T[4].copy(H).addScaledVector(sd,-.38);
  // the ground: inside it, or does it rise above any of the rays?
  let bt=false;B.under=C.y<ob176Ground(C.x,C.z)-.05;if(B.under)bt=true;
  for(let i=0;i<5&&!bt;i++){const P=T[i],L=C.distanceTo(P);for(let s=.5;s<L-.4;s+=.4){const f=s/L,x=C.x+(P.x-C.x)*f,y=C.y+(P.y-C.y)*f,z=C.z+(P.z-C.z)*f;if(ob176Ground(x,z)>y+.02){bt=true;break}}}
  B.bt=bt?1:0;
  // what was drawn: objects the rays meet
  const S=B.seen,done=new Set();let hits=0;
  for(let i=0;i<S.length;i+=2){const o=S[i];if(done.has(o))continue;done.add(o);
    const s=ob176Sphere(o,OB176Ts);if(!s)continue;if(S[i+1]!=null&&s.top<H.y+S[i+1])continue;
    // broad: the ball against the segment from the camera to the hero
    const L2=ab.lengthSq(),u=Math.max(0,Math.min(1,OB176Tw.copy(s.c).sub(C).dot(ab)/L2)),dx=C.x+ab.x*u-s.c.x,dy=C.y+ab.y*u-s.c.y,dz=C.z+ab.z*u-s.c.z;
    if(dx*dx+dy*dy+dz*dz>(s.r+.9)*(s.r+.9))continue;
    for(let j=0;j<5;j++){const k=ob176Ray(o,C,T[j]);if(k){hits++;break}}}
  B.st.hits=hits;B.st.ms=+(performance.now()-t0).toFixed(2)}
// one ray from the camera to a point on the hero against one object; on a hit its box is switched on (ob176Box). Stops .45 short
// of the hero (their own gear, held weapons are not scenery) and starts .2 past the lens.
function ob176Ray(o,C,P){const B=OB176,g=o.geometry;if(!g||!g.attributes.position)return false;
  const L=C.distanceTo(P);if(L<.8)return false;
  if(o.isInstancedMesh){const rc=B.rc;rc.set(C,OB176Tv.copy(P).sub(C).normalize());rc.near=.2;rc.far=L-.45;rc.camera=cam;let I=[];
    try{I=rc.intersectObject(o,false)}catch(_){I=[]}
    if(!I.length||I[0].instanceId==null)return false;const id=I[0].instanceId;
    if(!g.boundingBox)g.computeBoundingBox();o.getMatrixAt(id,OB176M);OB176M.premultiply(o.matrixWorld);
    OB176B.copy(g.boundingBox).applyMatrix4(OB176M);ob176Box(o.uuid+':'+id,OB176B);return true}
  const nT=(g.index?g.index.count:g.attributes.position.count)/3;
  if(nT<=3000){const rc=B.rc;rc.set(C,OB176Tv.copy(P).sub(C).normalize());rc.near=.2;rc.far=L-.45;rc.camera=cam;let I=[];
    try{I=rc.intersectObject(o,false)}catch(_){I=[]}
    if(!I.length)return false;const ob=ob176Whole(o);ob176Box(ob.k,ob.b);return true}
  // a big merged mesh: the piece the ray meets
  const A=ob176Acc(g);if(!A)return false;const inv=OB176M.copy(o.matrixWorld).invert();
  const a=OB176A0.copy(C).applyMatrix4(inv),e=OB176A1.copy(P).addScaledVector(OB176Tv.copy(C).sub(P).normalize(),.45).applyMatrix4(inv);
  const tri=ob176AccRay(A,a,e);if(tri<0)return false;
  const grp=A.tg[tri],bx=A.gb.subarray(grp*6,grp*6+6);OB176B.min.set(bx[0],bx[1],bx[2]);OB176B.max.set(bx[3],bx[4],bx[5]);OB176B.applyMatrix4(o.matrixWorld);
  ob176Box(o.uuid+'#'+grp,OB176B);return true}
const OB176A0=new THREE.Vector3(),OB176A1=new THREE.Vector3();
// the whole object a plain mesh belongs to: climb its parents while the group stays object-sized (static scenery: cached by spot)
function ob176Whole(o){const u=o.userData,me=o.matrixWorld.elements,f=me[12]*7.1+me[13]*3.3+me[14];if(u.ob176W&&u.ob176W.f===f)return u.ob176W;
  let best=o,bb=ob176OBox(o,new THREE.Box3(),1e9),a=o;
  while(a.parent&&a.parent!==scene&&!a.parent.isScene){const p=a.parent,b=ob176OBox(p,new THREE.Box3(),OB176.big);if(!b)break;best=p;bb=b;a=p}
  return u.ob176W={k:best.uuid,b:bb,f}}
// a group's box from its meshes' bounding boxes (null as soon as it grows past lim across)
const OB176Q=new THREE.Box3();
function ob176OBox(r,out,lim){out.makeEmpty();let ok=true;
  r.traverse(q=>{if(!ok||!q.isMesh||!q.visible)return;const g=q.geometry;if(!g||!g.attributes||!g.attributes.position)return;if(!g.boundingBox)g.computeBoundingBox();
    OB176Q.copy(g.boundingBox).applyMatrix4(q.matrixWorld);out.union(OB176Q);
    if(out.max.x-out.min.x>lim||out.max.z-out.min.z>lim||out.max.y-out.min.y>lim*1.6)ok=false});
  return ok&&!out.isEmpty()?out:null}
// switch a box on (a new one takes a free slot, or the faintest one that is off)
function ob176Box(k,b){const B=OB176;let x=B.box.find(q=>q.k===k);
  if(!x){if(B.box.length<OB176N)B.box.push(x={k,mn:new THREE.Vector3(),mx:new THREE.Vector3(),w:0,on:0});
    else{let lo=null;for(const q of B.box)if(!q.on&&(!lo||q.w<lo.w))lo=q;if(!lo)return;x=lo;x.k=k;x.w=0}}
  x.mn.copy(b.min);x.mx.copy(b.max);x.on=1}
// each frame (POST.render, 3350): a scan now and then, the fades, the uniforms
function ob176Tick(){const B=OB176,U=OB176.U,now=performance.now(),dt=Math.min(.1,Math.max(0,(now-(B.last||now))/1000));B.last=now;
  if(now-B.t>90){B.t=now;try{ob176Scan()}catch(e){if(!B.err){B.err=1;console.warn('v171 scan',e)}}}
  const k=dt/B.fade;U.uObT.value=Math.max(0,Math.min(1,U.uObT.value+(B.bt?k:-k)));if(B.under)U.uObT.value=1;
  for(const b of B.box)b.w=Math.max(0,Math.min(1,b.w+(b.on?k:-k)));
  B.box=B.box.filter(b=>b.w>0||b.on);B.st.boxes=B.box.length;
  for(let i=0;i<OB176N;i++){const b=B.box[i];if(b){U.uObBm.value[i].copy(b.mn);U.uObBM.value[i].copy(b.mx);U.uObBw.value[i]=b.w}else U.uObBw.value[i]=0}}
// ---- big merged meshes: the pieces (triangles joined by shared corners, then pieces whose boxes touch) and a grid of triangles ----
// A: {p positions, ix corner index or null, tg triangle -> group, gb group boxes (6 per group, local), cells, cs cell size, o origin,
// n grid size}. Built once per geometry, the first time a ray reaches it.
function ob176Acc(g){let A=OB176.acc.get(g);if(A!==undefined)return A;const t0=performance.now();
  try{A=ob176AccBuild(g)}catch(e){console.warn('v171 pieces',e);A=null}
  OB176.acc.set(g,A);if(A)A.ms=+(performance.now()-t0).toFixed(1);return A}
function ob176AccBuild(g){const P=g.attributes.position.array,ix=g.index?g.index.array:null,nT=(ix?ix.length:P.length/3)/3,nV=P.length/3;
  const vi=(t,c)=>ix?ix[t*3+c]:t*3+c;
  // corners at the same spot are one corner
  const par=new Int32Array(nV);for(let i=0;i<nV;i++)par[i]=i;
  const fd=i=>{while(par[i]!==i){par[i]=par[par[i]];i=par[i]}return i},un=(a,b)=>{a=fd(a);b=fd(b);if(a!==b)par[a]=b};
  const wm=new Map();for(let i=0;i<nV;i++){const k=Math.round(P[i*3]*100)*73856093^Math.round(P[i*3+1]*100)*19349663^Math.round(P[i*3+2]*100)*83492791,q=wm.get(k);if(q===undefined)wm.set(k,i);else un(i,q)}
  for(let t=0;t<nT;t++){un(vi(t,0),vi(t,1));un(vi(t,1),vi(t,2))}
  // pieces and their boxes
  const pid=new Map(),pb=[];const tp=new Int32Array(nT);
  for(let t=0;t<nT;t++){const r=fd(vi(t,0));let k=pid.get(r);if(k===undefined){k=pb.length/6;pid.set(r,k);pb.push(1e9,1e9,1e9,-1e9,-1e9,-1e9)}tp[t]=k;
    for(let c=0;c<3;c++){const v=vi(t,c)*3;for(let a=0;a<3;a++){const x=P[v+a];if(x<pb[k*6+a])pb[k*6+a]=x;if(x>pb[k*6+3+a])pb[k*6+3+a]=x}}}
  const nP=pb.length/6,gp=new Int32Array(nP);for(let i=0;i<nP;i++)gp[i]=i;
  const gf=i=>{while(gp[i]!==i){gp[i]=gp[gp[i]];i=gp[i]}return i};
  // pieces whose boxes touch (within .2) join, as long as the joined box stays object-sized
  const gbx=pb.slice(),big=OB176.big,cs0=4,hm=new Map();
  for(let k=0;k<nP;k++){const b=pb.slice(k*6,k*6+6);if(Math.max(b[3]-b[0],b[5]-b[2])>big)continue;
    for(let x=Math.floor(b[0]/cs0);x<=Math.floor(b[3]/cs0);x++)for(let z=Math.floor(b[2]/cs0);z<=Math.floor(b[5]/cs0);z++){const h=x*92821+z;let l=hm.get(h);if(!l)hm.set(h,l=[]);
      for(const j of l){const a=gf(k),c=gf(j);if(a===c)continue;const A=gbx.slice(a*6,a*6+6),Cb=gbx.slice(c*6,c*6+6);
        if(A[0]>Cb[3]+.2||Cb[0]>A[3]+.2||A[1]>Cb[4]+.2||Cb[1]>A[4]+.2||A[2]>Cb[5]+.2||Cb[2]>A[5]+.2)continue;
        const U=[Math.min(A[0],Cb[0]),Math.min(A[1],Cb[1]),Math.min(A[2],Cb[2]),Math.max(A[3],Cb[3]),Math.max(A[4],Cb[4]),Math.max(A[5],Cb[5])];
        if(Math.max(U[3]-U[0],U[5]-U[2])>big||U[4]-U[1]>big*1.6)continue;
        gp[a]=c;for(let q=0;q<6;q++)gbx[c*6+q]=U[q]}
      l.push(k)}}
  const gid=new Map(),gb=[],tg=new Int32Array(nT);
  for(let t=0;t<nT;t++){const r=gf(tp[t]);let k=gid.get(r);if(k===undefined){k=gb.length/6;gid.set(r,k);for(let q=0;q<6;q++)gb.push(gbx[r*6+q])}tg[t]=k}
  // a grid of triangles for the rays
  if(!g.boundingBox)g.computeBoundingBox();const bb=g.boundingBox,ex=Math.max(bb.max.x-bb.min.x,bb.max.y-bb.min.y,bb.max.z-bb.min.z),cs=Math.max(1.5,ex/48),n=Math.ceil(ex/cs)+1;
  const cells=new Map(),o=[bb.min.x,bb.min.y,bb.min.z],ci=(a,i)=>Math.max(0,Math.min(n-1,Math.floor((a-o[i])/cs)));
  for(let t=0;t<nT;t++){let a0=1e9,a1=1e9,a2=1e9,b0=-1e9,b1=-1e9,b2=-1e9;for(let c=0;c<3;c++){const v=vi(t,c)*3;a0=Math.min(a0,P[v]);b0=Math.max(b0,P[v]);a1=Math.min(a1,P[v+1]);b1=Math.max(b1,P[v+1]);a2=Math.min(a2,P[v+2]);b2=Math.max(b2,P[v+2])}
    for(let x=ci(a0,0);x<=ci(b0,0);x++)for(let y=ci(a1,1);y<=ci(b1,1);y++)for(let z=ci(a2,2);z<=ci(b2,2);z++){const h=(x*n+y)*n+z;let l=cells.get(h);if(!l)cells.set(h,l=[]);l.push(t)}}
  return {P,ix,tg,gb:new Float32Array(gb),cells,cs,o,n,stamp:new Uint32Array(nT),sv:0,nT,nG:gb.length/6}}
// the first triangle the segment a->e meets (local space), walking the grid's cells in order; -1 for none
function ob176AccRay(A,a,e){const P=A.P,ix=A.ix,cs=A.cs,o=A.o,n=A.n;A.sv++;const st=A.stamp,sv=A.sv;
  const d=[e.x-a.x,e.y-a.y,e.z-a.z],L=Math.hypot(d[0],d[1],d[2]);if(L<1e-4)return -1;
  const steps=Math.ceil(L/(cs*.5))+1,seen=new Set();
  for(let i=0;i<=steps;i++){const f=i/steps,x=Math.floor((a.x+d[0]*f-o[0])/cs),y=Math.floor((a.y+d[1]*f-o[1])/cs),z=Math.floor((a.z+d[2]*f-o[2])/cs);
    if(x<0||y<0||z<0||x>=n||y>=n||z>=n)continue;
    // the cell and its neighbours along the way (a thin ray can cross a cell corner between samples)
    for(let qx=x-1;qx<=x+1;qx++)for(let qy=y-1;qy<=y+1;qy++)for(let qz=z-1;qz<=z+1;qz++){if(qx<0||qy<0||qz<0||qx>=n||qy>=n||qz>=n)continue;const h=(qx*n+qy)*n+qz;if(seen.has(h))continue;seen.add(h);
      const l=A.cells.get(h);if(!l)continue;
      for(const t of l){if(st[t]===sv)continue;st[t]=sv;
        const i0=(ix?ix[t*3]:t*3)*3,i1=(ix?ix[t*3+1]:t*3+1)*3,i2=(ix?ix[t*3+2]:t*3+2)*3;
        if(ob176Tri(a,d,P,i0,i1,i2))return t}}}
  return -1}
// does the segment a + d*u (0 < u < 1) cross the triangle? (Moller-Trumbore, both sides)
function ob176Tri(a,d,P,i0,i1,i2){const e1x=P[i1]-P[i0],e1y=P[i1+1]-P[i0+1],e1z=P[i1+2]-P[i0+2],e2x=P[i2]-P[i0],e2y=P[i2+1]-P[i0+1],e2z=P[i2+2]-P[i0+2];
  const px=d[1]*e2z-d[2]*e2y,py=d[2]*e2x-d[0]*e2z,pz=d[0]*e2y-d[1]*e2x,det=e1x*px+e1y*py+e1z*pz;if(Math.abs(det)<1e-9)return false;
  const iv=1/det,tx=a.x-P[i0],ty=a.y-P[i0+1],tz=a.z-P[i0+2],u=(tx*px+ty*py+tz*pz)*iv;if(u<0||u>1)return false;
  const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x,v=(d[0]*qx+d[1]*qy+d[2]*qz)*iv;if(v<0||u+v>1)return false;
  const w=(e2x*qx+e2y*qy+e2z*qz)*iv;return w>0&&w<1}

const OB176Ts={c:new THREE.Vector3(),r:0},OB176Tv=new THREE.Vector3(),OB176Tw=new THREE.Vector3();
// the mesh's bounds in the world (instanced meshes: all instances, cached; top = the highest instance's top, local y)
function ob176Sphere(o,out){const g=o.geometry;if(!g)return null;
  if(o.isInstancedMesh){let s=o.userData.ob176S;
    if(!s||s.n!==o.count){if(!g.boundingSphere)g.computeBoundingSphere();const a=o.instanceMatrix.array,n=o.count,c=new THREE.Vector3(),m=new THREE.Matrix4(),p=new THREE.Vector3();
      for(let i=0;i<n;i++){c.x+=a[i*16+12];c.y+=a[i*16+13];c.z+=a[i*16+14]}if(n)c.multiplyScalar(1/n);let r=0,top=-1e9;
      for(let i=0;i<n;i++){m.fromArray(a,i*16);p.copy(g.boundingSphere.center).applyMatrix4(m);const ri=g.boundingSphere.radius*m.getMaxScaleOnAxis();r=Math.max(r,p.distanceTo(c)+ri);top=Math.max(top,p.y+ri)}
      s=o.userData.ob176S={n,c,r,top}}
    out.c.copy(s.c).applyMatrix4(o.matrixWorld);const k=o.matrixWorld.getMaxScaleOnAxis();out.r=s.r*k;out.top=out.c.y+(s.top-s.c.y)*k;return out}
  if(!g.boundingSphere)g.computeBoundingSphere();out.c.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld);out.r=g.boundingSphere.radius*o.matrixWorld.getMaxScaleOnAxis();out.top=out.c.y+out.r;return out}
