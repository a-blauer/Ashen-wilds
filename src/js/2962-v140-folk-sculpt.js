// ================= v140: townsfolk heads sculpted from anatomy =================
// The v137 heads were one parametric loft (a ball with a tube for a muzzle), so no amount of tuning gave them a brow,
// cheekbones, sockets or a jaw. Each species now has a sculpt recipe (2963): anatomical forms written as signed distance
// functions — ellipsoids (cranium, brow ridges, cheekbones, whisker pads, nose pad), round cones (muzzle, lower jaw, snout)
// joined with smooth unions and carved with smooth subtractions (eye sockets, nostrils) — mirrored left / right. The shape
// is turned into one faceted mesh by surface nets (cell FKS.h), coloured per face by the recipe's paint(p) (muzzle, mask,
// nose, inner ear…), all on the head bone. Coordinates are head-local: metres from FKS.C0 (the old skull centre),
// +z forward, +y up; the v140 head transform then carries the head forward (A.hz / A.hy, hs = 1).
// The recipe also gives: eye sockets (eye centre, gaze, size → fk140Eyes), ear bases (→ ear bones and fkEars), whisker
// rows, the neck's attachment, and extras (teeth, tusks, horns) as kit parts. Skull rings (D.SN) are measured from the
// sculpt, so every v137 helper that reads the skull (hats, coifs, goggles, antlers, horns, wool) fits the new head.
var FKS={C0:[0,1.16,-.01],h:.0092,cache:{}};
// ---------------- distance functions ----------------
var FKSD={
  ell(p,c,r){const x=(p[0]-c[0])/r[0],y=(p[1]-c[1])/r[1],z=(p[2]-c[2])/r[2],k0=Math.sqrt(x*x+y*y+z*z),
    x1=x/r[0],y1=y/r[1],z1=z/r[2],k1=Math.sqrt(x1*x1+y1*y1+z1*z1);return k1>1e-9?k0*(k0-1)/k1:-Math.min(r[0],r[1],r[2])},
  // round cone from a (radius ra) to b (radius rb); sq = [sx, sy] squash of the cross-section (x wider / y taller)
  rcone(p,a,b,ra,rb,sq){let px=p[0],py=p[1],pz=p[2],ax=a[0],ay=a[1],az=a[2],bx=b[0],by=b[1],bz=b[2],m=1;
    if(sq){const sx=sq[0],sy=sq[1];px/=sx;ax/=sx;bx/=sx;py/=sy;ay/=sy;by/=sy;m=Math.min(sx,sy)}
    const bax=bx-ax,bay=by-ay,baz=bz-az,l2=bax*bax+bay*bay+baz*baz,rr=ra-rb,a2=l2-rr*rr,il2=1/l2,pax=px-ax,pay=py-ay,paz=pz-az,
      y=pax*bax+pay*bay+paz*baz,z=y-l2,xx=Math.pow(pax*l2-bax*y,2)+Math.pow(pay*l2-bay*y,2)+Math.pow(paz*l2-baz*y,2),y2=y*y*l2,z2=z*z*l2,k=Math.sign(rr)*rr*rr*xx;
    let d;if(Math.sign(z)*a2*z2>k)d=Math.sqrt(xx+z2)*il2-rb;else if(Math.sign(y)*a2*y2<k)d=Math.sqrt(xx+y2)*il2-ra;else d=(Math.sqrt(xx*a2*il2)+y*rr)*il2-ra;
    return d*m},
  sph(p,c,r){return Math.hypot(p[0]-c[0],p[1]-c[1],p[2]-c[2])-r},
  smin(a,b,k){if(k<=0)return Math.min(a,b);const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25},
  smax(a,b,k){return -FKSD.smin(-a,-b,k)}};
// a recipe's shape: S.forms = [{t:'ell'|'rcone'|'sph', …, k (blend), sub (carve), mir (mirror to the other side)}]
function fksEval(S,p){const D=FKSD,q=[Math.abs(p[0]),p[1],p[2]];let d=1e9;
  for(const f of S.forms){const P=f.mir===false?p:q;let v;
    if(f.t=='ell')v=D.ell(P,f.c,f.r);else if(f.t=='rcone')v=D.rcone(P,f.a,f.b,f.ra,f.rb,f.sq);else v=D.sph(P,f.c,f.r);
    d=f.sub?D.smax(d,-v,f.k||0):D.smin(d,v,f.k||0)}
  return d}
// ---------------- surface nets ----------------
function fksMesh(S,h){const bb=S.bb,x0=bb[0],y0=bb[1],z0=bb[2],nx=Math.ceil((bb[3]-x0)/h)+2,ny=Math.ceil((bb[4]-y0)/h)+2,nz=Math.ceil((bb[5]-z0)/h)+2;
  const G=new Float32Array(nx*ny*nz),I=(i,j,k)=>i+nx*(j+ny*k),P=[0,0,0];
  for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){P[0]=x0+i*h;P[1]=y0+j*h;P[2]=z0+k*h;G[I(i,j,k)]=fksEval(S,P)}
  const VI=new Int32Array(nx*ny*nz).fill(-1),V=[],E=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],cor=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]];
  const grad=p=>{const e=h*.25,a=[p[0]+e,p[1],p[2]],b=[p[0]-e,p[1],p[2]],c=[p[0],p[1]+e,p[2]],d=[p[0],p[1]-e,p[2]],f=[p[0],p[1],p[2]+e],g=[p[0],p[1],p[2]-e];
    return [fksEval(S,a)-fksEval(S,b),fksEval(S,c)-fksEval(S,d),fksEval(S,f)-fksEval(S,g)]};
  for(let k=0;k<nz-1;k++)for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){const v=cor.map(c=>G[I(i+c[0],j+c[1],k+c[2])]);let m=0;v.forEach((x,n)=>{if(x<0)m|=1<<n});if(m==0||m==255)continue;
    let sx=0,sy=0,sz=0,n=0;for(const [a,b] of E){if((v[a]<0)==(v[b]<0))continue;const t=v[a]/(v[a]-v[b]),A=cor[a],B=cor[b];sx+=A[0]+(B[0]-A[0])*t;sy+=A[1]+(B[1]-A[1])*t;sz+=A[2]+(B[2]-A[2])*t;n++}
    let p=[x0+(i+sx/n)*h,y0+(j+sy/n)*h,z0+(k+sz/n)*h];
    // pull the vertex onto the surface (one Newton step), so the facets follow the form, not the grid
    const d=fksEval(S,p),g=grad(p),gl=g[0]*g[0]+g[1]*g[1]+g[2]*g[2];if(gl>1e-14){const s=d*(h*.5)/gl;p=[p[0]-g[0]*s,p[1]-g[1]*s,p[2]-g[2]*s]}
    VI[I(i,j,k)]=V.length;V.push(p)}
  const T=[],quad=(a,b,c,d,flip)=>{if(a<0||b<0||c<0||d<0)return;if(flip)T.push([a,d,c],[a,c,b]);else T.push([a,b,c],[a,c,d])};
  for(let k=1;k<nz-1;k++)for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){const s0=G[I(i,j,k)]<0;
    if(i<nx-1&&(G[I(i+1,j,k)]<0)!=s0)quad(VI[I(i,j-1,k-1)],VI[I(i,j,k-1)],VI[I(i,j,k)],VI[I(i,j-1,k)],s0);
    if(j<ny-1&&(G[I(i,j+1,k)]<0)!=s0)quad(VI[I(i-1,j,k-1)],VI[I(i-1,j,k)],VI[I(i,j,k)],VI[I(i,j,k-1)],s0);
    if(k<nz-1&&(G[I(i,j,k+1)]<0)!=s0)quad(VI[I(i-1,j-1,k)],VI[I(i,j-1,k)],VI[I(i,j,k)],VI[I(i-1,j,k)],s0)}
  // winding by the field's gradient (outward = front)
  T.forEach(t=>{const a=V[t[0]],b=V[t[1]],c=V[t[2]],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],w=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],
    m=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],g=grad(m);if(n[0]*g[0]+n[1]*g[1]+n[2]*g[2]<0){const x=t[1];t[1]=t[2];t[2]=x}});
  return {V,T}}
// ---------------- hero-style mesh: rings of flat facets ----------------
// The heroes' skulls are lofts (rings back → front, ~14 sides) with big flat facets. The sculpt is meshed the same way:
// z slices from the back of the skull to the nose; in each, rays from the slice's centre find the surface (from the outside
// in, so the outer form counts), giving one ring; rings are joined into quads and capped at both ends.
function fksLoft(S){const bb=S.bb,M=S.seg||14,n=S.rings||17,st=.0015,ins=(x,y,z)=>fksEval(S,[x,y,z])<0;
  let zA=bb[2],zB=bb[5];for(let z=bb[2];z<bb[5];z+=st){let h=false;for(let y=bb[1];y<bb[4];y+=st)if(ins(0,y,z)){h=true;break}if(h){zA=z;break}}
  for(let z=bb[5];z>bb[2];z-=st){let h=false;for(let y=bb[1];y<bb[4];y+=st)if(ins(0,y,z)){h=true;break}if(h){zB=z;break}}
  const R=[];for(let i=0;i<n;i++){const u=i/(n-1),z=zA+.004+(zB-zA-.008)*(u<.5?Math.pow(u*2,1.1)/2:1-Math.pow((1-u)*2,1.25)/2);
    let top=null,bot=null;for(let y=bb[4];y>bb[1];y-=st)if(ins(0,y,z)){top=y;break}for(let y=bb[1];y<bb[4];y+=st)if(ins(0,y,z)){bot=y;break}if(top==null)continue;
    const yc=(top+bot)/2,ring=[];for(let j=0;j<M;j++){const a=j/M*Math.PI*2,dx=Math.sin(a),dy=Math.cos(a);let r=.24;while(r>0&&!ins(dx*r,yc+dy*r,z))r-=st;
      let lo=Math.max(0,r),hi=r+st;for(let k=0;k<7;k++){const m=(lo+hi)/2;if(ins(dx*m,yc+dy*m,z))lo=m;else hi=m}const rr=Math.max(.003,lo);ring.push([dx*rr,yc+dy*rr,z])}
    R.push({z,yc,ring})}
  const V=[],T=[];R.forEach(q=>q.ring.forEach(p=>V.push(p)));const id=(i,j)=>i*M+(j%M);
  // both triangles of a quad carry the quad's centre (q), so colour boundaries follow the rings and seams like the heroes' paint
  const qc=(i,j)=>{const P=[id(i,j),id(i,j+1),id(i+1,j+1),id(i+1,j)].map(k=>V[k]);return [0,1,2].map(c=>(P[0][c]+P[1][c]+P[2][c]+P[3][c])/4)};
  for(let i=0;i+1<R.length;i++)for(let j=0;j<M;j++){const q=qc(i,j),t1=[id(i,j),id(i,j+1),id(i+1,j+1)],t2=[id(i,j),id(i+1,j+1),id(i+1,j)];t1.q=q;t2.q=q;T.push(t1,t2)}
  const b=V.length;V.push([0,R[0].yc,zA]);const f=V.length;V.push([0,R[R.length-1].yc,zB]);const L=R.length-1;
  for(let j=0;j<M;j++){T.push([b,id(0,j+1),id(0,j)]);T.push([f,id(L,j),id(L,j+1)])}
  const grad=p=>{const e=.002;return [fksEval(S,[p[0]+e,p[1],p[2]])-fksEval(S,[p[0]-e,p[1],p[2]]),fksEval(S,[p[0],p[1]+e,p[2]])-fksEval(S,[p[0],p[1]-e,p[2]]),fksEval(S,[p[0],p[1],p[2]+e])-fksEval(S,[p[0],p[1],p[2]-e])]};
  T.forEach(t=>{const a=V[t[0]],bq=V[t[1]],c=V[t[2]],u=[bq[0]-a[0],bq[1]-a[1],bq[2]-a[2]],w=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],nn=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],
    m=[(a[0]+bq[0]+c[0])/3,(a[1]+bq[1]+c[1])/3,(a[2]+bq[2]+c[2])/3],cc=[0,m[1],m[2]],g=[m[0]-cc[0],m[1]-(R.find(q=>Math.abs(q.z-m[2])<.03)||R[0]).yc,0];
    const gr=grad(m),gg=Math.hypot(...gr)>1e-6?gr:g;if(nn[0]*gg[0]+nn[1]*gg[1]+nn[2]*gg[2]<0){const x=t[1];t[1]=t[2];t[2]=x}});
  return {V,T}}
// ---------------- skull rings measured from the sculpt (for hats, coifs, horns, antlers, wool…) ----------------
function fksRings(S,n){const bb=S.bb,z0=bb[2]+.004,z1=bb[5]-.004,out=[],st=.002,ins=(x,y,z)=>fksEval(S,[x,y,z])<0;
  // find the real front / back along the centre line
  let zA=z0,zB=z1;for(let z=z0;z<z1;z+=st){let hit=false;for(let y=bb[1];y<bb[4];y+=st)if(ins(0,y,z)){hit=true;break}if(hit){zA=z;break}}
  for(let z=z1;z>z0;z-=st){let hit=false;for(let y=bb[1];y<bb[4];y+=st)if(ins(0,y,z)){hit=true;break}if(hit){zB=z;break}}
  for(let i=0;i<n;i++){const z=zA+(zB-zA)*(i/(n-1))*(i==n-1?.995:1)+(i==0?.002:0);let top=null,bot=null;
    for(let y=bb[4];y>bb[1];y-=st)if(ins(0,y,z)){top=y;break}
    for(let y=bb[1];y<bb[4];y+=st)if(ins(0,y,z)){bot=y;break}
    if(top==null){top=bot=0}const yc=(top+bot)/2;let rx=.004;
    for(const yy of [yc,yc+(top-yc)*.4,yc-(yc-bot)*.4])for(let x=bb[3];x>0;x-=st)if(ins(x,yy,z)){rx=Math.max(rx,x);break}
    const C=FKS.C0;out.push([+(z+C[2]).toFixed(4),+(yc+C[1]).toFixed(4),+rx.toFixed(4),+Math.max(.004,top-yc).toFixed(4),+Math.max(.004,yc-bot).toFixed(4)])}
  return out}
// ---------------- building the head ----------------
// the mesh in model space (C0 added), cached per species; faces coloured by the recipe's paint(p (head-local), n, C)
// the top of the neck is part of the sculpt (so the head flows into it), weighted from head to neck going down
function fksPrep(S){if(S._prep)return;S._prep=1;const q=S.neck;if(!q)return;
  // the whole neck: from inside the back of the skull down to the collar (head-local y −.17 is the torso's neck ring)
  S.forms.unshift(FKH.RC([0,q[0]+.03,q[1]+.01],[0,-.168,.004],q[2]*.92,Math.max(.064,q[2]*1.05),{k:0,sq:[1.04,.96]}));S.forms[1].k=Math.max(S.forms[1].k||0,.035);S.bb[1]=Math.min(S.bb[1],-.21)}
function fksBuild(D){const S=D.sculpt;if(!S._mesh)S._mesh=S.mesher=='nets'?(fksPrep(S),fksMesh(S,S.h||FKS.h)):fksLoft(S);return S._mesh}
// weights: head above the neck's attachment, blending to the neck bone going down, and to the chest at the collar
function fksHead(B,D,C){const S=D.sculpt,M=fksBuild(D),C0=FKS.C0,w=mdW(B,[['head',1]]),y0=S.neck?S.neck[0]+.01:-1,cl=(v)=>Math.max(0,Math.min(1,v)),
    V=M.V.map(p=>{const t1=cl((y0-p[1])/.06),t2=cl((-.12-p[1])/.045);return {x:p[0]+C0[0],y:p[1]+C0[1],z:p[2]+C0[2],
      w:t1>0?mdW(B,[['head',1-t1],['neck',t1*(1-t2)],['chest',t1*t2]].filter(q=>q[1]>1e-4)):w}});
  for(const t of M.T){const a=M.V[t[0]],b=M.V[t[1]],c=M.V[t[2]],m=t.q||[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
    const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(n[0],n[1],n[2])||1;
    mdTri(B,'c',V[t[0]],V[t[1]],V[t[2]],S.paint(m,[n[0]/l,n[1]/l,n[2]/l],C))}}
// set a species up from its recipe: skull rings, eye frame, ear base, size
function fksSetup(D,A){const S=D.sculpt,C0=FKS.C0;D.SN=fksRings(S,20);D.muzzleZ=D.SN[D.SN.length-1][0]-.05;
  const R=S.R||.1;D.hp=Object.assign({},D.hp,{R,W:1,H:1,L:1,yc:C0[1],zc:C0[2]});
  const e=S.eye,n=new THREE.Vector3(...e.g).normalize();D._eye140={p:new THREE.Vector3(e.c[0]+C0[0],e.c[1]+C0[1],e.c[2]+C0[2]),n,r:e.r};D.EYEP=[0,e.c[1]+C0[1],e.c[2]+C0[2]];
  // ear base: on the line from the brain case centre through the recipe's point, 9 mm under the sculpted surface
  if(S.ear){const c=S.forms[0].c||[0,0,0],q=S.ear,at=t=>[c[0]+(q[0]-c[0])*t,c[1]+(q[1]-c[1])*t,c[2]+(q[2]-c[2])*t];let lo=0,hi=3;
    for(let i=0;i<40;i++){const m=(lo+hi)/2;if(fksEval(S,at(m))<-(S.earSink||.009))lo=m;else hi=m}const e=at(lo);D._earB140=[e[0]+C0[0],e[1]+C0[1],e[2]+C0[2]]}}
{const f=fkEarBase;fkEarBase=function(D){if(FK140.on&&D&&D._earB140&&D.ear&&D.ear.t!='none')return D._earB140.slice();return f.apply(this,arguments)}}
// whisker rows from the recipe: [root (head-local), count, length, colour]
function fksWhiskers(k,D,W,C){const C0=FKS.C0,r=W.p;[-1,1].forEach(s=>{for(let i=0;i<W.n;i++){const a=[s*r[0],r[1]+C0[1]+(i-(W.n-1)/2)*.006,r[2]+C0[2]-i*.005],
    b=[s*(r[0]+W.len*.75),a[1]+(i-(W.n-1)/2)*.016-.006,a[2]-W.len*.45];k.L('head','c',W.col||0x2a2420,a,b,.0016,.0005,3)}})}
// ---------------- ears: lofted on the skull ----------------
// (owner, v140: the v137 pointed ear was a four-sided pyramid poked into the head — on a curved skull its flat base corners
// stood off the surface, and the left one was twisted differently from the right.) Each ear is now a loft of 8-sided rings
// from its root to its tip, shaped per type (tri / round / long / leaf / small); the root ring is pressed onto the sculpt
// (every root vertex is moved down the ear's axis until it is 5 mm inside the skull), so no edge can stand off the head.
// The root ring is weighted to the head and the next ring half to the ear bone, so a flick bends the ear at the root instead
// of lifting its base out. The right ear is built once and mirrored for the left, so the two are identical.
var FKS_EAR={tri:t=>Math.pow(Math.max(0,1-t),.85),leaf:t=>t<.25?.5+.5*Math.sin(t/.25*Math.PI/2)*.6:Math.pow(Math.sin(Math.PI*(.12+.88*t)),.7),
  round:t=>t<.5?.82+.18*Math.sin(Math.PI*t):Math.sqrt(Math.max(0,1-((t-.5)/.5)**2)),small:t=>t<.45?.85+.15*Math.sin(Math.PI*t):Math.sqrt(Math.max(0,1-((t-.45)/.55)**2)),
  long:t=>t<.55?.55+.45*Math.sin(t/.55*Math.PI/2):Math.sqrt(Math.max(0,1-((t-.55)/.45)**2))};
function fksEars(B,D,C){const e=D.ear,S=D.sculpt;if(!e||e.t=='none')return;if(!FKS_EAR[e.t]){const k=dkKit();fkEars(k,B,D,C);mdKit(B,k);return}
  const C0=FKS.C0,V3=THREE.Vector3,ev=p=>fksEval(S,[p.x-C0[0],p.y-C0[1],p.z-C0[2]]),d=new V3(...fkEarDir(e,1)).normalize(),tw=e.tw||0;
  const f0=new V3(0,0,1).applyAxisAngle(d,tw),fwd=f0.sub(d.clone().multiplyScalar(d.dot(f0))).normalize(),side=new V3().crossVectors(d,fwd).normalize();
  // the root on the surface: from the bone point along the ear's axis until outside
  const b0=new V3(...D._earB140);let s=0;while(s<.06&&ev(b0.clone().addScaledVector(d,s))<0)s+=.001;const base=b0.clone().addScaledVector(d,s);
  const L=e.len,W=e.w*(e.t=='long'?.62:.85),T=Math.max(.006,(e.th||.016)*.55),wf=FKS_EAR[e.t],pointed=e.t=='tri'||e.t=='leaf',M=8,ts=[0,.12,.3,.5,.7,.86,1];
  const fur=e.col?e.col(C):C.FUR,inn=e.inner?e.inner(C):(e.t=='small'?C.FURD:C.PINK),tip=e.tip?e.tip(C):fur,tipT=e.t=='tri'?.62:.8;
  const rings=ts.map((t,ri)=>{const c=base.clone().addScaledVector(d,L*t),w=W*Math.max(t==1&&pointed?0:.08,wf(t)),th=T*(1-.6*t);const R=[];
    for(let j=0;j<M;j++){const a=j/M*Math.PI*2;let p=c.clone().addScaledVector(side,w*Math.cos(a)).addScaledVector(fwd,th*Math.sin(a));
      if(ri==0){let k=0;while(k<40&&ev(p)>-.005){p.addScaledVector(d,-.002);k++}}R.push(p)}return {t,c,R}});
  const tipP=pointed?base.clone().addScaledVector(d,L):null;
  const tris=[],in_=[];const W8=(ri)=>ri==0?[['head',1]]:ri==1?[['head',.5],['ER',.5]]:[['ER',1]];
  for(let i=0;i+1<rings.length;i++){const A=rings[i],Bq=rings[i+1];if(pointed&&i+1==rings.length-1){for(let j=0;j<M;j++)tris.push([[A.R[j],i],[A.R[(j+1)%M],i],[tipP,i+1],A.t>=tipT?tip:fur]);break}
    for(let j=0;j<M;j++){const col=A.t>=tipT?tip:fur;tris.push([[A.R[j],i],[A.R[(j+1)%M],i],[Bq.R[(j+1)%M],i+1],col],[[A.R[j],i],[Bq.R[(j+1)%M],i+1],[Bq.R[j],i+1],col])}}
  if(!pointed){const Lr=rings[rings.length-1];for(let j=0;j<M;j++)tris.push([[Lr.R[j],ts.length-1],[Lr.R[(j+1)%M],ts.length-1],[Lr.c,ts.length-1],fur])}
  // the inner ear: a thinner loft on the front face, from near the root to near the tip
  const iT=[.1,.3,.5,.7,.84],ir=iT.map(t=>{const c=base.clone().addScaledVector(d,L*t),w=W*wf(t)*.7,th=T*(1-.6*t);const cc=c.clone().addScaledVector(fwd,th*.72);
    const R=[];for(let j=0;j<M;j++){const a=j/M*Math.PI*2;R.push(cc.clone().addScaledVector(side,w*Math.cos(a)).addScaledVector(fwd,th*.4*Math.sin(a)))}return {c:cc,R}});
  for(let i=0;i+1<ir.length;i++)for(let j=0;j<M;j++){const A=ir[i],Bq=ir[i+1];in_.push([[A.R[j],2],[A.R[(j+1)%M],2],[Bq.R[(j+1)%M],2],inn],[[A.R[j],2],[Bq.R[(j+1)%M],2],[Bq.R[j],2],inn])}
  {const A=ir[0],Z=ir[ir.length-1];for(let j=0;j<M;j++){in_.push([[A.R[j],2],[A.R[(j+1)%M],2],[A.c,2],inn]);in_.push([[Z.R[j],2],[Z.R[(j+1)%M],2],[Z.c,2],inn])}}
  [1,-1].forEach(sg=>{const er=sg>0?'erR':'erL',wc={};const vx=(q)=>{const [p,ri]=q,key=ri;const w=wc[key]||(wc[key]=mdW(B,W8(ri).map(x=>[x[0]=='ER'?er:x[0],x[1]])));return {x:p.x*sg,y:p.y,z:p.z,w}};
    for(const t of tris.concat(in_)){const a=vx(t[0]),b=vx(t[1]),c=vx(t[2]);if(sg>0)mdTri(B,'c',a,b,c,t[3]);else mdTri(B,'c',a,c,b,t[3])}});
  // lynx / squirrel tufts from the tip
  if(e.tuft){const k=dkKit(),tp=base.clone().addScaledVector(d,L*.97);[1,-1].forEach(sg=>{const a=[tp.x*sg,tp.y,tp.z],b=[(tp.x+d.x*e.tuftL)*sg,tp.y+d.y*e.tuftL,tp.z+d.z*e.tuftL];k.L(sg>0?'erR':'erL','c',e.tuft(C),a,b,.006,.001,4)});mdKit(B,k)}}
