// ================= v178: enemy models — no unattached pieces =================
// Owner: "check all enemy models for unattached pieces, accessories and limbs". Every enemy's small rigid parts (teeth, beads,
// studs, spikes, chain links, tassels, eyes…) are built as dkKit parts (k.P: {bn, geo, t, col, m}) and baked onto the body.
// Many were placed by hand-picked numbers that left them a few mm to a few cm off the skin (a necklace hovering in front of
// an orc's chest, teeth below the gum line, chain links that never touched). sn178Snap moves each loose part (or a group
// of parts that touch each other, e.g. a chain or a rib made of segments) straight onto the nearest surface already
// attached, so it sits on / slightly into it:
//  * a part is attached when it comes within SN178.tol of the body or of a part already attached (grown from the body);
//    a part wholly inside the body (hidden) counts as attached;
//  * a loose group is moved by the shortest gap (+ SN178.emb so it sinks in a little) when the gap is at most SN178.max
//    of the body's height; farther ones are left for hand fixes (and listed in SN178.far for the test);
//  * runs once per look: creature rigs (lpRig) snap their kit against the body loft before the bake is cached; humanoid
//    foes (mdFoeB, which also builds the v113 / v137 humanoids) snap every mdKit against what is built so far.
// Companions, heroes and townsfolk are not touched. SN178.on=false builds the old models (cache keys differ, so both can be compared).
// Test: test/v178_enemy_parts.py.
var SN178={on:true,tol:.0015,max:.075,emb:.002,hum:0,far:[],moved:0,lp:null};
// triangles (flat xyz, 9 numbers each) → a cell grid for nearest-surface queries
function sn178Grid(cs){return {cs,T:[],C:new Map(),stamp:null,sid:1}}
function sn178Key(i,j,k){return ((i+1024)*2048+(j+1024))*2048+(k+1024)}
function sn178Add(G,a,b,c){const T=G.T,id=T.length/9;T.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);const cs=G.cs;
  const i0=Math.floor(Math.min(a[0],b[0],c[0])/cs),i1=Math.floor(Math.max(a[0],b[0],c[0])/cs),j0=Math.floor(Math.min(a[1],b[1],c[1])/cs),j1=Math.floor(Math.max(a[1],b[1],c[1])/cs),
    k0=Math.floor(Math.min(a[2],b[2],c[2])/cs),k1=Math.floor(Math.max(a[2],b[2],c[2])/cs);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)for(let k=k0;k<=k1;k++){const key=sn178Key(i,j,k);let L=G.C.get(key);if(!L)G.C.set(key,L=[]);L.push(id)}}
// closest point on triangle t of G to p (Ericson); returns squared distance, writes the point to o
function sn178Tri(T,t,p,o){const ax=T[t*9],ay=T[t*9+1],az=T[t*9+2],bx=T[t*9+3],by=T[t*9+4],bz=T[t*9+5],cx=T[t*9+6],cy=T[t*9+7],cz=T[t*9+8];
  const abx=bx-ax,aby=by-ay,abz=bz-az,acx=cx-ax,acy=cy-ay,acz=cz-az,apx=p[0]-ax,apy=p[1]-ay,apz=p[2]-az;
  const set=(x,y,z)=>{o[0]=x;o[1]=y;o[2]=z;const dx=p[0]-x,dy=p[1]-y,dz=p[2]-z;return dx*dx+dy*dy+dz*dz};
  const d1=abx*apx+aby*apy+abz*apz,d2=acx*apx+acy*apy+acz*apz;if(d1<=0&&d2<=0)return set(ax,ay,az);
  const bpx=p[0]-bx,bpy=p[1]-by,bpz=p[2]-bz,d3=abx*bpx+aby*bpy+abz*bpz,d4=acx*bpx+acy*bpy+acz*bpz;if(d3>=0&&d4<=d3)return set(bx,by,bz);
  const vc=d1*d4-d3*d2;if(vc<=0&&d1>=0&&d3<=0){const v=d1/(d1-d3);return set(ax+abx*v,ay+aby*v,az+abz*v)}
  const cpx=p[0]-cx,cpy=p[1]-cy,cpz=p[2]-cz,d5=abx*cpx+aby*cpy+abz*cpz,d6=acx*cpx+acy*cpy+acz*cpz;if(d6>=0&&d5<=d6)return set(cx,cy,cz);
  const vb=d5*d2-d1*d6;if(vb<=0&&d2>=0&&d6<=0){const w=d2/(d2-d6);return set(ax+acx*w,ay+acy*w,az+acz*w)}
  const va=d3*d6-d5*d4;if(va<=0&&d4-d3>=0&&d5-d6>=0){const w=(d4-d3)/((d4-d3)+(d5-d6));return set(bx+(cx-bx)*w,by+(cy-by)*w,bz+(cz-bz)*w)}
  const dn=1/(va+vb+vc),v=vb*dn,w=vc*dn;return set(ax+abx*v+acx*w,ay+aby*v+acy*w,az+abz*v+acz*w)}
// nearest surface point of G to p within r: {d, q} or null
function sn178Near(G,p,r,o){const cs=G.cs,n=Math.ceil(r/cs),i0=Math.floor(p[0]/cs),j0=Math.floor(p[1]/cs),k0=Math.floor(p[2]/cs),T=G.T;
  if(!G.stamp||G.stamp.length<T.length/9)G.stamp=new Int32Array(Math.max(1024,T.length/9*2));const sid=++G.sid;let best=r*r,hit=false;const q=[0,0,0];
  for(let i=i0-n;i<=i0+n;i++)for(let j=j0-n;j<=j0+n;j++)for(let k=k0-n;k<=k0+n;k++){const L=G.C.get(sn178Key(i,j,k));if(!L)continue;
    for(let m=0;m<L.length;m++){const t=L[m];if(G.stamp[t]===sid)continue;G.stamp[t]=sid;const d=sn178Tri(T,t,p,q);if(d<best){best=d;hit=true;o[0]=q[0];o[1]=q[1];o[2]=q[2];G.lastT=t}}}
  return hit?Math.sqrt(best):-1}
// does a ray from p along axis dir hit a triangle of the list (Möller–Trumbore)?
function sn178Ray(T,p,d,mx){for(let t=0;t<T.length/9;t++){const ax=T[t*9],ay=T[t*9+1],az=T[t*9+2],e1x=T[t*9+3]-ax,e1y=T[t*9+4]-ay,e1z=T[t*9+5]-az,e2x=T[t*9+6]-ax,e2y=T[t*9+7]-ay,e2z=T[t*9+8]-az;
    const hx=d[1]*e2z-d[2]*e2y,hy=d[2]*e2x-d[0]*e2z,hz=d[0]*e2y-d[1]*e2x,a=e1x*hx+e1y*hy+e1z*hz;if(Math.abs(a)<1e-12)continue;const f=1/a,sx=p[0]-ax,sy=p[1]-ay,sz=p[2]-az,u=f*(sx*hx+sy*hy+sz*hz);if(u<0||u>1)continue;
    const qx=sy*e1z-sz*e1y,qy=sz*e1x-sx*e1z,qz=sx*e1y-sy*e1x,v=f*(d[0]*qx+d[1]*qy+d[2]*qz);if(v<0||u+v>1)continue;const t2=f*(e2x*qx+e2y*qy+e2z*qz);if(t2>1e-6&&t2<mx)return true}return false}
// the outward normal of the surface at triangle t of G: its face normal turned away from the middle of the body nearby
function sn178N(G,t,r){const T=G.T,ax=T[t*9],ay=T[t*9+1],az=T[t*9+2],ux=T[t*9+3]-ax,uy=T[t*9+4]-ay,uz=T[t*9+5]-az,vx=T[t*9+6]-ax,vy=T[t*9+7]-ay,vz=T[t*9+8]-az;
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
  const cx=ax+(ux+vx)/3,cy=ay+(uy+vy)/3,cz=az+(uz+vz)/3,cs=G.cs,n=Math.max(1,Math.ceil(r/cs)),i0=Math.floor(cx/cs),j0=Math.floor(cy/cs),k0=Math.floor(cz/cs);let mx=0,my=0,mz=0,c=0;
  for(let i=i0-n;i<=i0+n;i++)for(let j=j0-n;j<=j0+n;j++)for(let k=k0-n;k<=k0+n;k++){const L=G.C.get(sn178Key(i,j,k));if(!L)continue;for(const u of L){mx+=T[u*9]+T[u*9+3]+T[u*9+6];my+=T[u*9+1]+T[u*9+4]+T[u*9+7];mz+=T[u*9+2]+T[u*9+5]+T[u*9+8];c+=3}}
  if(c&&nx*(cx-mx/c)+ny*(cy-my/c)+nz*(cz-mz/c)<0){nx=-nx;ny=-ny;nz=-nz}return [nx,ny,nz]}
// the same, through the grid: only the triangles in the cells the ray passes
function sn178RayG(G,p,d,mx){const cs=G.cs,T=G.T,seen=new Set(),q=[0,0,0];for(let t=0;t<=mx+cs;t+=cs*.5){q[0]=p[0]+d[0]*t;q[1]=p[1]+d[1]*t;q[2]=p[2]+d[2]*t;
    const L=G.C.get(sn178Key(Math.floor(q[0]/cs),Math.floor(q[1]/cs),Math.floor(q[2]/cs)));if(!L)continue;const S=[];for(const u of L)if(!seen.has(u)){seen.add(u);S.push(T[u*9],T[u*9+1],T[u*9+2],T[u*9+3],T[u*9+4],T[u*9+5],T[u*9+6],T[u*9+7],T[u*9+8])}
    if(S.length&&sn178Ray(S,p,d,mx))return true}return false}
// a part's triangles and sample points in model space
function sn178Part(p){const g=p.geo,pa=g.attributes.position,ix=g.index?g.index.array:null,n=ix?ix.length:pa.count,v=new THREE.Vector3(),V=[];
  for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);V.push([v.x,v.y,v.z])}
  const tri=[],S=V.slice();for(let i=0;i+2<n;i+=3){const a=V[ix?ix[i]:i],b=V[ix?ix[i+1]:i+1],c=V[ix?ix[i+2]:i+2];tri.push([a,b,c]);
    S.push([(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[(b[0]+c[0])/2,(b[1]+c[1])/2,(b[2]+c[2])/2],[(c[0]+a[0])/2,(c[1]+a[1])/2,(c[2]+a[2])/2])}
  const c=[0,0,0];V.forEach(q=>{c[0]+=q[0];c[1]+=q[1];c[2]+=q[2]});const k=1/Math.max(1,V.length);
  // bosses (SN178.cap): an even spread of at most that many sample points per part (the nearest-surface search is the costly step)
  const cap=SN178.cap||Infinity,Sx=S.length>cap?S.filter((_,i)=>i%Math.ceil(S.length/cap)==0):S;return {p,tri,S:Sx,c:[c[0]*k,c[1]*k,c[2]*k]}}
// body: flat triangle list (xyz × 9 per triangle); P: kit parts (their matrices are moved in place); tag: for SN178.far
function sn178Snap(body,P,tag){if(!SN178.on||!P||!P.length||!body||body.length<9)return 0;
  let y0=1e9,y1=-1e9;for(let i=1;i<body.length;i+=3){y0=Math.min(y0,body[i]);y1=Math.max(y1,body[i])}const H=Math.max(.2,y1-y0),tol=SN178.tol*Math.max(1,H/1.7),max=SN178.max*H,emb=SN178.emb*Math.max(1,H/1.7);
  const G=sn178Grid(Math.max(.02,H*.02));for(let i=0;i<body.length;i+=9)sn178Add(G,[body[i],body[i+1],body[i+2]],[body[i+3],body[i+4],body[i+5]],[body[i+6],body[i+7],body[i+8]]);
  const parts=P.map(sn178Part),att=new Array(parts.length).fill(false),o=[0,0,0];let moved=0;
  const attach=i=>{if(att[i]!=='in')att[i]=true;parts[i].tri.forEach(t=>sn178Add(G,t[0],t[1],t[2]))};
  const near=(q,r)=>{let best=-1,bp=null,bq=null,bt=-1;for(const s of q.S){const d=sn178Near(G,s,r,o);if(d>=0&&(best<0||d<best)){best=d;bp=s;bq=o.slice();bt=G.lastT}}return best<0?null:{d:best,s:bp,q:bq,t:bt}};
  // hidden inside the body: rays along all six axes from the part's centre meet the body close by (within 12 % of its height, at most 30 cm)
  const AX=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];parts.forEach((q,i)=>{if(!near(q,tol)&&[q.c].concat(q.S.slice(0,8)).every(p=>AX.every(d=>sn178RayG(G,p,d,Math.min(H*.12,.3)))))att[i]='in'});
  parts.forEach((q,i)=>{if(att[i]==='in')attach(i)});
  if(SN178.dbg)parts.forEach((q,i)=>{const r=near(q,.2);SN178.dbg.push((tag||'')+' '+q.p.bn+' c '+q.c.map(v=>v.toFixed(3)).join(',')+' d '+(r?r.d.toFixed(4)+' q '+r.q.map(v=>v.toFixed(3)).join(','):'-')+(att[i]==='in'?' IN':''))});
  const grow=()=>{let ch=true;while(ch){ch=false;parts.forEach((q,i)=>{if(att[i])return;if(near(q,tol)){attach(i);ch=true}})}};
  grow();
  for(let pass=0;pass<6;pass++){const L=[];parts.forEach((q,i)=>{if(!att[i])L.push(i)});if(!L.length)break;
    // loose parts that touch each other move together
    const grp=L.map(i=>[i]),gi=new Map(L.map((i,j)=>[i,j]));
    {const T=sn178Grid(G.cs);const own=[];L.forEach(i=>parts[i].tri.forEach(t=>{sn178Add(T,t[0],t[1],t[2]);own.push(i)}));const par=L.map((_,j)=>j),f=j=>{while(par[j]!==j)j=par[j]=par[par[j]];return j};
      L.forEach(i=>{const q=parts[i];for(const s of q.S){const cs=T.cs,n=1,a=Math.floor(s[0]/cs),b=Math.floor(s[1]/cs),c=Math.floor(s[2]/cs);
        for(let x=a-n;x<=a+n;x++)for(let y=b-n;y<=b+n;y++)for(let z=c-n;z<=c+n;z++){const C=T.C.get(sn178Key(x,y,z));if(!C)continue;C.forEach(t=>{const j=own[t];if(j===i)return;if(sn178Tri(T.T,t,s,o)<=tol*tol){const A=f(gi.get(i)),B=f(gi.get(j));if(A!==B)par[B]=A}})}}});
      grp.length=0;const by=new Map();L.forEach((i,j)=>{const r=f(j);if(!by.has(r))by.set(r,[]);by.get(r).push(i)});by.forEach(v=>grp.push(v))}
    let did=false;
    grp.forEach(g=>{let best=null,bi=-1;g.forEach(i=>{const r=near(parts[i],max);if(r&&(!best||r.d<best.d)){best=r;bi=i}});if(!best)return;
      let dx=best.q[0]-best.s[0],dy=best.q[1]-best.s[1],dz=best.q[2]-best.s[2];const L2=Math.hypot(dx,dy,dz)||1;let k=(L2+emb)/L2;
      // a part sunk into the body (its middle behind the surface) comes out to sit on it, its middle at the surface
      const N=sn178N(G,best.t,G.cs*1.5),c=parts[bi].c,dc=[c[0]-best.q[0],c[1]-best.q[1],c[2]-best.q[2]];
      if(N[0]*dc[0]+N[1]*dc[1]+N[2]*dc[2]<0){dx=best.q[0]-c[0];dy=best.q[1]-c[1];dz=best.q[2]-c[2];k=1}
      const M=new THREE.Matrix4().makeTranslation(dx*k,dy*k,dz*k);
      g.forEach(i=>{parts[i].p.m.premultiply(M);parts[i]=sn178Part(parts[i].p);attach(i)});moved+=g.length;did=true});
    grow();if(!did)break}
  parts.forEach((q,i)=>{if(!att[i])SN178.far.push((tag||'')+' '+q.p.bn+' at '+q.c.map(v=>v.toFixed(3)).join(','))});
  SN178.moved+=moved;return moved}
// ---------------- creature rigs: the kit against the body loft ----------------
{const f=lpRig;lpRig=function(c,n,D){const en=c&&(c.en||(c.g&&EN[c.g[0]]&&!SP2[c.g[0]]));if(!SN178.on||!en)return f.apply(this,arguments);
  SN178.lp={c,n,D};try{return f.apply(this,arguments)}finally{SN178.lp=null}}}
{const f=dkBake;dkBake=function(P,O,key){const L=SN178.lp;if(L&&key&&/^LP\|/.test(key)){key=key+'|s178';
    if(!(DKBK&&DKBK[key])&&P&&P.length){try{const G=L.D.geo(L.c.cl[0],L.c),pa=G.attributes.position,ix=G.index?G.index.array:null,n=ix?ix.length:pa.count,T=[];
      for(let i=0;i<n;i++){const j=ix?ix[i]:i;T.push(pa.getX(j),pa.getY(j),pa.getZ(j))}sn178Snap(T,P,L.n);sn178LpW(G,O,P)}catch(e){console.warn('v178 snap',L.n,e)}}}
  return f.call(this,P,O,key)}}
// creature kits likewise take the weights of the body vertex under each part (dkBake honours p.w since v178)
function sn178LpW(G,O,P){const pa=G.attributes.position,si=G.attributes.skinIndex,sw=G.attributes.skinWeight;if(!si||!sw)return;const M=new Map(),cs=.04,v=new THREE.Vector3();
  for(let i=0;i<pa.count;i++){const k=sn178Key(Math.floor(pa.getX(i)/cs),Math.floor(pa.getY(i)/cs),Math.floor(pa.getZ(i)/cs));let A=M.get(k);if(!A)M.set(k,A=[]);A.push(i)}
  const GC=(a,j,q)=>q==0?a.getX(j):q==1?a.getY(j):q==2?a.getZ(j):a.getW(j);
  P.forEach(p=>{if(p.w||!p.bn)return;v.setFromMatrixPosition(p.m);const bb=new THREE.Box3().setFromBufferAttribute(p.geo.attributes.position).applyMatrix4(p.m);if(bb.getSize(new THREE.Vector3()).length()>.25&&!/^a[LR]0$/.test(p.bn))return;let best=.06*.06,hit=-1;const i0=Math.floor(v.x/cs),j0=Math.floor(v.y/cs),k0=Math.floor(v.z/cs);
    for(let i=i0-2;i<=i0+2;i++)for(let j=j0-2;j<=j0+2;j++)for(let k=k0-2;k<=k0+2;k++){const A=M.get(sn178Key(i,j,k));if(!A)continue;for(const x of A){const dx=pa.getX(x)-v.x,dy=pa.getY(x)-v.y,dz=pa.getZ(x)-v.z,d=dx*dx+dy*dy+dz*dz;if(d<best){best=d;hit=x}}}
    if(hit<0)return;const w=[];let own=false;for(let q=0;q<4;q++){const x=GC(sw,hit,q);if(x>0){const n=O[GC(si,hit,q)];w.push([n,x]);if(n===p.bn)own=true}}if(own&&w.length>1)p.w=w})}
// ---------------- humanoid foes: every kit against what is built so far ----------------
{const f=mdFoeB;mdFoeB=function(key){if(!SN178.on)return f.apply(this,arguments);SN178.hum++;SN178.humK=key;try{return f.apply(this,arguments)}finally{SN178.hum--}}}
{const f=mdFoeGeo;mdFoeGeo=function(key){return SN178.on?mdGeo('F178|'+key,()=>mdFoeB(key)):f.apply(this,arguments)}}
// The v99 proportions (0010) move every vertex by its bones when the build is baked, so the snap works on the final shape:
// the body and each part are taken through that warp, snapped there, and the move is carried back (W⁻¹·T·W) onto the part.
function sn178Warp(B){let pl=null;try{if(B.kqPre&&B.kqPre!='none'&&typeof AW_PROP99!='undefined')pl=AW_PROP99.plan(B.bones,B.kqPre)}catch(e){pl=null}
  if(!pl)return null;const W={};pl.names.forEach(n=>{const M=pl.M[n],a=pl.abs[n],N=pl.N[n],m=new THREE.Matrix4().set(M[0],M[1],M[2],0,M[3],M[4],M[5],0,M[6],M[7],M[8],0,0,0,0,1);
    const t=new THREE.Vector3(a[0],a[1],a[2]).applyMatrix4(m);m.setPosition(N[0]-t.x,N[1]-t.y,N[2]-t.z);W[n]=m});return {pl,W}}
// Every part takes the bone weights of the skin under it (the nearest body vertex, when that vertex follows the part's own bone
// at all), so it bends with that skin: rigid on one bone, a back plate, a bead or a shoulder pad lifted off the body whenever
// the spine bent or the arm swung (attacks, the stance).
function sn178SkinW(B,P){const G=new Map(),cs=.04,key=(x,y,z)=>sn178Key(Math.floor(x/cs),Math.floor(y/cs),Math.floor(z/cs));
  ['c','m','g'].forEach(t=>{const L=B.L[t];if(!L)return;for(let v=0;v<L.p.length/3;v++){const k=key(L.p[v*3],L.p[v*3+1],L.p[v*3+2]);let A=G.get(k);if(!A)G.set(k,A=[]);A.push([L,v])}});
  P.forEach(p=>{if(p.w||!p.bn)return;const c=new THREE.Vector3().setFromMatrixPosition(p.m),bi=B.O.indexOf(p.bn);if(bi<0)return;
    // only small parts lying on the skin (a tail or a limb built of rigid pieces keeps its own bone; shoulder pads may be big)
    const bb=new THREE.Box3().setFromBufferAttribute(p.geo.attributes.position).applyMatrix4(p.m);if(bb.getSize(new THREE.Vector3()).length()>.25&&!/^a[LR]0$/.test(p.bn))return;let best=.08*.08,hit=null;
    const i0=Math.floor(c.x/cs),j0=Math.floor(c.y/cs),k0=Math.floor(c.z/cs);
    for(let i=i0-2;i<=i0+2;i++)for(let j=j0-2;j<=j0+2;j++)for(let k=k0-2;k<=k0+2;k++){const A=G.get(sn178Key(i,j,k));if(!A)continue;
      for(const [L,v] of A){const dx=L.p[v*3]-c.x,dy=L.p[v*3+1]-c.y,dz=L.p[v*3+2]-c.z,d=dx*dx+dy*dy+dz*dz;if(d<best){best=d;hit=[L,v]}}}
    if(!hit)return;const [L,v]=hit,w=[];let own=false;for(let j=0;j<4;j++){const x=L.sw[v*4+j];if(x>0){const n=B.O[L.si[v*4+j]];w.push([n,x]);if(n===p.bn)own=true}}
    if(own&&w.length>1)p.w=w;
    // a shoulder part over skin that only follows the torso (a pauldron) goes half with its own bone, half with the skin under it
    else if(!own&&/^a[LR]0$/.test(p.bn)&&w.length)p.w=[[p.bn,.5]].concat(w.map(q=>[q[0],q[1]*.5])).slice(0,4)})}
{const f=mdKit;mdKit=function(B,k){if(SN178.hum>0&&k&&k.P&&k.P.length){try{sn178SkinW(B,k.P);const X=sn178Warp(B),T=[];
      ['c','m','g'].forEach(t=>{const L=B.L[t];if(!L)return;for(let v=0;v<L.p.length/3;v++){let x=L.p[v*3],y=L.p[v*3+1],z=L.p[v*3+2];
        if(X){let X0=0,Y0=0,Z0=0,Wt=0;for(let j=0;j<4;j++){const w=L.sw[v*4+j];if(!(w>0))continue;const b=X.pl.idx[L.si[v*4+j]];if(!b)continue;const M=b.M,dx=x-b.a[0],dy=y-b.a[1],dz=z-b.a[2];
            X0+=w*(b.n[0]+M[0]*dx+M[1]*dy+M[2]*dz);Y0+=w*(b.n[1]+M[3]*dx+M[4]*dy+M[5]*dz);Z0+=w*(b.n[2]+M[6]*dx+M[7]*dy+M[8]*dz);Wt+=w}if(Wt>0){x=X0/Wt;y=Y0/Wt;z=Z0/Wt}}
        T.push(x,y,z)}});
      // a part's warp: its bone's, or the weighted blend of its bones' (the warp is a linear blend per vertex, so the blend is exact)
      const Wb=p=>{if(!X)return null;const w=p.w||[[p.bn||B.O[0],1]];let t=0;const M=new THREE.Matrix4().set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
        w.forEach(([bn,x])=>{const m=X.W[bn];if(!m||!(x>0))return;for(let i=0;i<16;i++)M.elements[i]+=m.elements[i]*x;t+=x});if(!t)return null;for(let i=0;i<16;i++)M.elements[i]/=t;return M};
      const Q=k.P.map(p=>{const w=Wb(p);return Object.assign({},p,{m:w?w.clone().multiply(p.m):p.m.clone()})});
      sn178Snap(T,Q,SN178.humK);
      Q.forEach((q,i)=>{const p=k.P[i],w=Wb(p);p.m=w?new THREE.Matrix4().copy(w).invert().multiply(q.m):q.m})}catch(e){console.warn('v178 snap',e)}}
  return f.apply(this,arguments)}}
// ---------------- humanoid foes: limb shells (bracers, greaves, wraps) get closed ends ----------------
// mdAS / mdLS lay a single-surface tube a little off the arm or leg; with open ends it hovered round the limb, touching nothing.
// Each end now gets a narrow rim from the tube down to the skin (the cuff's thickness), so it sits on the limb.
function sn178Rim(B,R,off,o,end){const i=end?R.length-1:0,j=end?R.length-2:1,r=R[i],q=R[j];if(!r||!q||!(off>.004))return;
  const d=[q.p[0]-r.p[0],q.p[1]-r.p[1],q.p[2]-r.p[2]],L=Math.hypot(d[0],d[1],d[2])||1,e=.0015/L,k=Object.assign({},o);delete k.off;
  const A=Object.assign({},r,{rx:r.rx+off,f:(r.f==null?r.rx:r.f)+off,b:(r.b==null?r.rx:r.b)+off}),Bq=Object.assign({},r,{p:[r.p[0]+d[0]*e,r.p[1]+d[1]*e,r.p[2]+d[2]*e],rx:r.rx+.001,f:(r.f==null?r.rx:r.f)+.001,b:(r.b==null?r.rx:r.b)+.001});
  mdLoft(B,[A,Bq],Object.assign(k,{off:0}))}
{const f=mdAS;mdAS=function(B,P,s,i0,i1,off,o){const r=f.apply(this,arguments);if(SN178.on&&SN178.hum>0)try{const R=mdArm(P,s).slice(i0,i1+1);sn178Rim(B,R,off,Object.assign({seg:7},o||{}),0);sn178Rim(B,R,off,Object.assign({seg:7},o||{}),1)}catch(e){console.warn('v178 rim',e)}return r}}
{const f=mdLS;mdLS=function(B,P,s,i0,i1,off,o){const r=f.apply(this,arguments);if(SN178.on&&SN178.hum>0)try{const R=mdLeg(P,s).slice(i0,i1+1);sn178Rim(B,R,off,Object.assign({seg:8},o||{}),0);sn178Rim(B,R,off,Object.assign({seg:8},o||{}),1)}catch(e){console.warn('v178 rim',e)}return r}}
// ---------------- Sovereigns and quest bosses: rigid parts on joints ----------------
// A boss model is many small meshes on named joints (svRig), merged per joint by svMerge. Before the merge the same snap runs
// on them in the rest pose: the big meshes are the body, every other visible, solid mesh is a part; a moved part keeps its
// joint (its own position is shifted). Glows (glowing stones too), see-through effects, hidden pieces and joints meant to float
// (SN178_FREE) are left alone, as is Ssith'ra (its segments are laid out live along the body path).
// joints whose pieces are meant to float free: Qarsul's ring of whirling debris, the Rime Wraith's Phase II halo
var SN178_FREE=/^(orbit|halo)/;
// Every build of the same boss gives the same moves: they are kept per boss (key: its joints and parts) and replayed.
var SN178_BC=new Map();
function sn178Boss(R){if(!SN178.on||!R||R.s178||R.no178)return 0;R.s178=1;const root=R.root;root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(),M=[];
  root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.geometry||!o.geometry.attributes.position)return;let p=o;while(p&&p!==root){if(!p.visible||SN178_FREE.test(p.name||''))return;p=p.parent}
    const mt=Array.isArray(o.material)?o.material[0]:o.material;if(!mt||mt.blending===THREE.AdditiveBlending||(mt.transparent&&mt.opacity<.6)||mt.visible===false)return;
    if(mt.emissive&&mt.emissive.getHex()>0&&(mt.emissiveIntensity||1)*Math.max(mt.emissive.r,mt.emissive.g,mt.emissive.b)>.35)return;   // a glowing stone or wisp is magic, left where it hangs
    const n=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;M.push({o,n,m:new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld)})});
  if(M.length<2)return 0;const key=Object.keys(R.J).join(',')+'|'+M.map(q=>q.o.geometry.uuid).join(','),hit=SN178_BC.get(key);
  if(hit){hit.forEach(([i,x,y,z])=>{const o=M[i].o;o.position.x+=x;o.position.y+=y;o.position.z+=z;o.updateMatrix()});return hit.length}
  const mx=Math.max(...M.map(q=>q.n)),T=[],P=[],v=new THREE.Vector3();
  M.forEach(q=>{if(q.n>=mx*.3){const g=q.o.geometry,pa=g.attributes.position,ix=g.index?g.index.array:null,n=ix?ix.length:pa.count;for(let i=0;i<n;i++){v.fromBufferAttribute(pa,ix?ix[i]:i).applyMatrix4(q.m);T.push(v.x,v.y,v.z)}}
    else P.push({geo:q.o.geometry,m:q.m.clone(),bn:q.o.name||'',o:q.o,m0:q.m.clone(),mi:M.indexOf(q)})});
  const mx0=SN178.max;SN178.max=.02;SN178.cap=96;let n=0;try{n=sn178Snap(T,P,'boss')}finally{SN178.max=mx0;SN178.cap=0}
  const rec=[];P.forEach(p=>{const a=new THREE.Vector3().setFromMatrixPosition(p.m0),b=new THREE.Vector3().setFromMatrixPosition(p.m);if(a.distanceToSquared(b)<1e-12)return;
    const d=b.sub(a),pm=new THREE.Matrix4().multiplyMatrices(inv,p.o.parent.matrixWorld),r=new THREE.Matrix3().setFromMatrix4(pm).invert();d.applyMatrix3(r);p.o.position.add(d);p.o.updateMatrix();rec.push([p.mi,d.x,d.y,d.z])});
  SN178_BC.set(key,rec);return n}
{const f=svMerge;svMerge=function(R){try{sn178Boss(R)}catch(e){console.warn('v178 boss snap',e)}return f.apply(this,arguments)}}
if(SVB[3]){const b=SVB[3].build;SVB[3].build=function(R,e){if(R)R.no178=1;return b.apply(this,arguments)}}
// ---------------- humanoid foes: skirts, coat tails and tabard skirts start on the body ----------------
// mdSkirt hangs a skirt from the waist at an offset; many outfits gave it 1–2 cm over whatever was worn there, so a flap
// hung beside the belt touching nothing. For foes the top now sits just over the layer beneath (P.tOff + 2 mm), tucked up 1.5 cm.
// Its top also takes the waist's own bone blend (mdTorsoW) fading into the thighs, so the proportion pass moves it with the belt.
{const f=mdSkirt;mdSkirt=function(B,P,y0,y1,fl,off,o){if(SN178.on&&SN178.hum>0&&P){const t=(P.tOff||0)+.002;if(off>t){off=t;y0+=.015}
    if(!(o&&o.wf)){const Y=y0;o=Object.assign({},o||{},{wf:(x,y)=>{const d=Math.max(0,Math.min(1,(Y-y)/Math.max(.05,Y-.32)))*.9,l=Math.max(0,Math.min(1,.5-x/.16)),W=mdTorsoW(Math.min(Y,Math.max(.44,y))).map(q=>[q[0],q[1]*(1-d)]);
      if(d>0)W.push(['lh0',d*l],['rh0',d*(1-l)]);return W.filter(q=>q[1]>0).slice(0,4)}})}}
  return f.call(this,B,P,y0,y1,fl,off,o)}}
// ---------------- weapons carried by foes (mkWpn kits, 'LW|' cache) ----------------
// The same snap on a weapon's own parts, grown from its largest piece (a hammer's head was 4 cm off its haft, a staff's gem
// sat loose in its claws, studs and spikes floated off heads).
{const f=lgBake;lgBake=function(P,key,mot){if(SN178.on&&P&&P.length>1&&/^LW\|/.test(key||'')){try{
    const S=P.map(p=>{const b=new THREE.Box3().setFromBufferAttribute(p.geo.attributes.position).applyMatrix4(p.m);return b.getSize(new THREE.Vector3()).length()}),i0=S.indexOf(Math.max(...S)),seed=P[i0],v=new THREE.Vector3(),T=[];
    const g=seed.geo,pa=g.attributes.position,ix=g.index?g.index.array:null,n=ix?ix.length:pa.count;for(let i=0;i<n;i++){v.fromBufferAttribute(pa,ix?ix[i]:i).applyMatrix4(seed.m);T.push(v.x,v.y,v.z)}
    sn178Snap(T,P.filter((_,i)=>i!==i0),key)}catch(e){console.warn('v178 weapon snap',e)}}return f.apply(this,arguments)}}
