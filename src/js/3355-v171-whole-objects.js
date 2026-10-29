// ================= v171: whole objects turn see-through (no round window) =================
// Owner (Oct 29 2026): "I dont want the circular cutout view when looking through an object. Just make it transparent", then
// "add a slight dithering when looking through an object as well".
// v169 cut a smooth round window round the hero out of anything in front of them. Now ~11 times a second gh171Scan casts five
// rays from the camera to the hero (chest, head, knees, both shoulders) against what was drawn last frame, and every object one of
// them meets is handed to the shaders as a box (0061 gh169Bx, up to GH171N): the whole object turns to glass, as far as it stands
// in front of the hero (never below the hero's knees, as before). "The object" is:
//   * a plain mesh: the largest group above it that is still object-sized (a house = its walls + roof), GH171.big across at most;
//   * one tree or rock of an instanced set (InstancedMesh): that instance;
//   * a big merged mesh (camp dressing, Duskhold's outskirts, Abeksi): the piece of it the ray meets — the triangles joined to
//     the one it hit, then pieces whose boxes touch it (gh171Acc, built once per geometry when it first blocks the view).
// The ground has its own switch: when it blocks the view (a wall, a hill, the rock past an instance's edge) or the camera is inside
// it, uGhT goes to 1 and every wall of ground in front of the hero turns to glass (3190); seen from inside, the rock is glass too.
// Boxes and the ground's switch fade in and out over GH171.fade s. The glass has a slight dither (GH169.d, 0061).
var GH171={box:[],seen:[],t:0,last:0,under:false,bt:0,fade:.18,big:12,st:{scans:0,ms:0,hits:0,boxes:0},rc:new THREE.Raycaster(),acc:new WeakMap(),err:0};
var GH171N=8;
// the ground's height there, the rock past the instance's edge included (3356's apron)
function gh171Ground(x,z){const k=cvKey(),I=k>=0?INSL[k]:null;
  if(I&&(x<I.x0||z<I.y0||x>I.x0+I.w||z>I.y0+I.h)&&typeof ed171H=='function'){const h=ed171H(I,x,z);if(h!=null)return h}
  return GH(x,z)}
const GH171V=[0,1,2,3,4].map(()=>new THREE.Vector3()),GH171D=new THREE.Vector3(),GH171S=new THREE.Vector3(),GH171M=new THREE.Matrix4(),GH171B=new THREE.Box3();
function gh171Scan(){const B=GH171,C=FADE.cam.value,H=FADE.pl.value,t0=performance.now();B.st.scans++;
  for(const b of B.box)b.on=0;
  if(!GH169.on||(typeof IC151!='undefined'&&IC151.on)){B.bt=0;B.under=false;return}
  const T=GH171V,ab=GH171D.copy(H).sub(C);if(ab.lengthSq()<1e-4){B.bt=0;return}
  const sd=GH171S.set(ab.z,0,-ab.x);if(sd.lengthSq()>1e-6)sd.normalize();
  T[0].copy(H);T[1].copy(H).y+=.6;T[2].copy(H).y-=.75;T[3].copy(H).addScaledVector(sd,.38);T[4].copy(H).addScaledVector(sd,-.38);
  // the ground: inside it, or does it rise above any of the rays?
  let bt=false;B.under=C.y<gh171Ground(C.x,C.z)-.05;if(B.under)bt=true;
  for(let i=0;i<5&&!bt;i++){const P=T[i],L=C.distanceTo(P);for(let s=.5;s<L-.4;s+=.4){const f=s/L,x=C.x+(P.x-C.x)*f,y=C.y+(P.y-C.y)*f,z=C.z+(P.z-C.z)*f;if(gh171Ground(x,z)>y+.02){bt=true;break}}}
  B.bt=bt?1:0;
  // what was drawn: objects the rays meet
  const S=B.seen,done=new Set();let hits=0;
  for(let i=0;i<S.length;i+=2){const o=S[i];if(done.has(o))continue;done.add(o);
    const s=gh169Sphere(o,GH169S);if(!s)continue;if(S[i+1]!=null&&s.top<H.y+S[i+1])continue;
    // broad: the ball against the segment from the camera to the hero
    const L2=ab.lengthSq(),u=Math.max(0,Math.min(1,GH169W.copy(s.c).sub(C).dot(ab)/L2)),dx=C.x+ab.x*u-s.c.x,dy=C.y+ab.y*u-s.c.y,dz=C.z+ab.z*u-s.c.z;
    if(dx*dx+dy*dy+dz*dz>(s.r+.9)*(s.r+.9))continue;
    for(let j=0;j<5;j++){const k=gh171Ray(o,C,T[j]);if(k){hits++;break}}}
  B.st.hits=hits;B.st.ms=+(performance.now()-t0).toFixed(2)}
// one ray from the camera to a point on the hero against one object; on a hit its box is switched on (gh171Box). Stops .45 short
// of the hero (their own gear, held weapons are not scenery) and starts .2 past the lens.
function gh171Ray(o,C,P){const B=GH171,g=o.geometry;if(!g||!g.attributes.position)return false;
  const L=C.distanceTo(P);if(L<.8)return false;
  if(o.isInstancedMesh){const rc=B.rc;rc.set(C,GH169V.copy(P).sub(C).normalize());rc.near=.2;rc.far=L-.45;rc.camera=cam;let I=[];
    try{I=rc.intersectObject(o,false)}catch(_){I=[]}
    if(!I.length||I[0].instanceId==null)return false;const id=I[0].instanceId;
    if(!g.boundingBox)g.computeBoundingBox();o.getMatrixAt(id,GH171M);GH171M.premultiply(o.matrixWorld);
    GH171B.copy(g.boundingBox).applyMatrix4(GH171M);gh171Box(o.uuid+':'+id,GH171B);return true}
  const nT=(g.index?g.index.count:g.attributes.position.count)/3;
  if(nT<=3000){const rc=B.rc;rc.set(C,GH169V.copy(P).sub(C).normalize());rc.near=.2;rc.far=L-.45;rc.camera=cam;let I=[];
    try{I=rc.intersectObject(o,false)}catch(_){I=[]}
    if(!I.length)return false;const ob=gh171Whole(o);gh171Box(ob.k,ob.b);return true}
  // a big merged mesh: the piece the ray meets
  const A=gh171Acc(g);if(!A)return false;const inv=GH171M.copy(o.matrixWorld).invert();
  const a=GH171A0.copy(C).applyMatrix4(inv),e=GH171A1.copy(P).addScaledVector(GH169V.copy(C).sub(P).normalize(),.45).applyMatrix4(inv);
  const tri=gh171AccRay(A,a,e);if(tri<0)return false;
  const grp=A.tg[tri],bx=A.gb.subarray(grp*6,grp*6+6);GH171B.min.set(bx[0],bx[1],bx[2]);GH171B.max.set(bx[3],bx[4],bx[5]);GH171B.applyMatrix4(o.matrixWorld);
  gh171Box(o.uuid+'#'+grp,GH171B);return true}
const GH171A0=new THREE.Vector3(),GH171A1=new THREE.Vector3();
// the whole object a plain mesh belongs to: climb its parents while the group stays object-sized (static scenery: cached by spot)
function gh171Whole(o){const u=o.userData,me=o.matrixWorld.elements,f=me[12]*7.1+me[13]*3.3+me[14];if(u.gh171W&&u.gh171W.f===f)return u.gh171W;
  let best=o,bb=gh171OBox(o,new THREE.Box3(),1e9),a=o;
  while(a.parent&&a.parent!==scene&&!a.parent.isScene){const p=a.parent,b=gh171OBox(p,new THREE.Box3(),GH171.big);if(!b)break;best=p;bb=b;a=p}
  return u.gh171W={k:best.uuid,b:bb,f}}
// a group's box from its meshes' bounding boxes (null as soon as it grows past lim across)
const GH171Q=new THREE.Box3();
function gh171OBox(r,out,lim){out.makeEmpty();let ok=true;
  r.traverse(q=>{if(!ok||!q.isMesh||!q.visible)return;const g=q.geometry;if(!g||!g.attributes||!g.attributes.position)return;if(!g.boundingBox)g.computeBoundingBox();
    GH171Q.copy(g.boundingBox).applyMatrix4(q.matrixWorld);out.union(GH171Q);
    if(out.max.x-out.min.x>lim||out.max.z-out.min.z>lim||out.max.y-out.min.y>lim*1.6)ok=false});
  return ok&&!out.isEmpty()?out:null}
// switch a box on (a new one takes a free slot, or the faintest one that is off)
function gh171Box(k,b){const B=GH171;let x=B.box.find(q=>q.k===k);
  if(!x){if(B.box.length<GH171N)B.box.push(x={k,mn:new THREE.Vector3(),mx:new THREE.Vector3(),w:0,on:0});
    else{let lo=null;for(const q of B.box)if(!q.on&&(!lo||q.w<lo.w))lo=q;if(!lo)return;x=lo;x.k=k;x.w=0}}
  x.mn.copy(b.min);x.mx.copy(b.max);x.on=1}
// each frame (POST.render, 3350): a scan now and then, the fades, the uniforms
function gh171Tick(){const B=GH171,U=GH169.U,now=performance.now(),dt=Math.min(.1,Math.max(0,(now-(B.last||now))/1000));B.last=now;
  if(now-B.t>90){B.t=now;try{gh171Scan()}catch(e){if(!B.err){B.err=1;console.warn('v171 scan',e)}}}
  const k=dt/B.fade;U.uGhT.value=Math.max(0,Math.min(1,U.uGhT.value+(B.bt?k:-k)));if(B.under)U.uGhT.value=1;
  for(const b of B.box)b.w=Math.max(0,Math.min(1,b.w+(b.on?k:-k)));
  B.box=B.box.filter(b=>b.w>0||b.on);B.st.boxes=B.box.length;
  for(let i=0;i<GH171N;i++){const b=B.box[i];if(b){U.uGhBm.value[i].copy(b.mn);U.uGhBM.value[i].copy(b.mx);U.uGhBw.value[i]=b.w}else U.uGhBw.value[i]=0}}
// ---- big merged meshes: the pieces (triangles joined by shared corners, then pieces whose boxes touch) and a grid of triangles ----
// A: {p positions, ix corner index or null, tg triangle -> group, gb group boxes (6 per group, local), cells, cs cell size, o origin,
// n grid size}. Built once per geometry, the first time a ray reaches it.
function gh171Acc(g){let A=GH171.acc.get(g);if(A!==undefined)return A;const t0=performance.now();
  try{A=gh171AccBuild(g)}catch(e){console.warn('v171 pieces',e);A=null}
  GH171.acc.set(g,A);if(A)A.ms=+(performance.now()-t0).toFixed(1);return A}
function gh171AccBuild(g){const P=g.attributes.position.array,ix=g.index?g.index.array:null,nT=(ix?ix.length:P.length/3)/3,nV=P.length/3;
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
  const gbx=pb.slice(),big=GH171.big,cs0=4,hm=new Map();
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
function gh171AccRay(A,a,e){const P=A.P,ix=A.ix,cs=A.cs,o=A.o,n=A.n;A.sv++;const st=A.stamp,sv=A.sv;
  const d=[e.x-a.x,e.y-a.y,e.z-a.z],L=Math.hypot(d[0],d[1],d[2]);if(L<1e-4)return -1;
  const steps=Math.ceil(L/(cs*.5))+1,seen=new Set();
  for(let i=0;i<=steps;i++){const f=i/steps,x=Math.floor((a.x+d[0]*f-o[0])/cs),y=Math.floor((a.y+d[1]*f-o[1])/cs),z=Math.floor((a.z+d[2]*f-o[2])/cs);
    if(x<0||y<0||z<0||x>=n||y>=n||z>=n)continue;
    // the cell and its neighbours along the way (a thin ray can cross a cell corner between samples)
    for(let qx=x-1;qx<=x+1;qx++)for(let qy=y-1;qy<=y+1;qy++)for(let qz=z-1;qz<=z+1;qz++){if(qx<0||qy<0||qz<0||qx>=n||qy>=n||qz>=n)continue;const h=(qx*n+qy)*n+qz;if(seen.has(h))continue;seen.add(h);
      const l=A.cells.get(h);if(!l)continue;
      for(const t of l){if(st[t]===sv)continue;st[t]=sv;
        const i0=(ix?ix[t*3]:t*3)*3,i1=(ix?ix[t*3+1]:t*3+1)*3,i2=(ix?ix[t*3+2]:t*3+2)*3;
        if(gh171Tri(a,d,P,i0,i1,i2))return t}}}
  return -1}
// does the segment a + d*u (0 < u < 1) cross the triangle? (Moller-Trumbore, both sides)
function gh171Tri(a,d,P,i0,i1,i2){const e1x=P[i1]-P[i0],e1y=P[i1+1]-P[i0+1],e1z=P[i1+2]-P[i0+2],e2x=P[i2]-P[i0],e2y=P[i2+1]-P[i0+1],e2z=P[i2+2]-P[i0+2];
  const px=d[1]*e2z-d[2]*e2y,py=d[2]*e2x-d[0]*e2z,pz=d[0]*e2y-d[1]*e2x,det=e1x*px+e1y*py+e1z*pz;if(Math.abs(det)<1e-9)return false;
  const iv=1/det,tx=a.x-P[i0],ty=a.y-P[i0+1],tz=a.z-P[i0+2],u=(tx*px+ty*py+tz*pz)*iv;if(u<0||u>1)return false;
  const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x,v=(d[0]*qx+d[1]*qy+d[2]*qz)*iv;if(v<0||u+v>1)return false;
  const w=(e2x*qx+e2y*qy+e2z*qz)*iv;return w>0&&w<1}
