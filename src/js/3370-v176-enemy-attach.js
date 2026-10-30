// ================= v176: enemy models — no unattached pieces =================
// Owner: "check all enemy models for unattached pieces, accessories and limbs". Every enemy's small rigid parts (teeth, beads,
// studs, spikes, chain links, tassels, eyes…) are built as dkKit parts (k.P: {bn, geo, t, col, m}) and baked onto the body.
// Many were placed by hand-picked numbers that left them a few mm to a few cm off the skin (a necklace hovering in front of
// an orc's chest, teeth below the gum line, chain links that never touched). sn176Snap moves each loose part (or a group
// of parts that touch each other, e.g. a chain or a rib made of segments) straight onto the nearest surface already
// attached, so it sits on / slightly into it:
//  * a part is attached when it comes within SN176.tol of the body or of a part already attached (grown from the body);
//    a part wholly inside the body (hidden) counts as attached;
//  * a loose group is moved by the shortest gap (+ SN176.emb so it sinks in a little) when the gap is at most SN176.max
//    of the body's height; farther ones are left for hand fixes (and listed in SN176.far for the test);
//  * runs once per look: creature rigs (lpRig) snap their kit against the body loft before the bake is cached; humanoid
//    foes (mdFoeB, which also builds the v113 / v137 humanoids) snap every mdKit against what is built so far.
// Companions, heroes and townsfolk are not touched. SN176.on=false builds the old models (cache keys differ, so both can be compared).
// Test: test/v176_enemy_parts.py.
var SN176={on:true,tol:.003,max:.075,emb:.0025,hum:0,far:[],moved:0,lp:null};
// triangles (flat xyz, 9 numbers each) → a cell grid for nearest-surface queries
function sn176Grid(cs){return {cs,T:[],C:new Map(),stamp:null,sid:1}}
function sn176Key(i,j,k){return ((i+1024)*2048+(j+1024))*2048+(k+1024)}
function sn176Add(G,a,b,c){const T=G.T,id=T.length/9;T.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);const cs=G.cs;
  const i0=Math.floor(Math.min(a[0],b[0],c[0])/cs),i1=Math.floor(Math.max(a[0],b[0],c[0])/cs),j0=Math.floor(Math.min(a[1],b[1],c[1])/cs),j1=Math.floor(Math.max(a[1],b[1],c[1])/cs),
    k0=Math.floor(Math.min(a[2],b[2],c[2])/cs),k1=Math.floor(Math.max(a[2],b[2],c[2])/cs);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)for(let k=k0;k<=k1;k++){const key=sn176Key(i,j,k);let L=G.C.get(key);if(!L)G.C.set(key,L=[]);L.push(id)}}
// closest point on triangle t of G to p (Ericson); returns squared distance, writes the point to o
function sn176Tri(T,t,p,o){const ax=T[t*9],ay=T[t*9+1],az=T[t*9+2],bx=T[t*9+3],by=T[t*9+4],bz=T[t*9+5],cx=T[t*9+6],cy=T[t*9+7],cz=T[t*9+8];
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
function sn176Near(G,p,r,o){const cs=G.cs,n=Math.ceil(r/cs),i0=Math.floor(p[0]/cs),j0=Math.floor(p[1]/cs),k0=Math.floor(p[2]/cs),T=G.T;
  if(!G.stamp||G.stamp.length<T.length/9)G.stamp=new Int32Array(Math.max(1024,T.length/9*2));const sid=++G.sid;let best=r*r,hit=false;const q=[0,0,0];
  for(let i=i0-n;i<=i0+n;i++)for(let j=j0-n;j<=j0+n;j++)for(let k=k0-n;k<=k0+n;k++){const L=G.C.get(sn176Key(i,j,k));if(!L)continue;
    for(let m=0;m<L.length;m++){const t=L[m];if(G.stamp[t]===sid)continue;G.stamp[t]=sid;const d=sn176Tri(T,t,p,q);if(d<best){best=d;hit=true;o[0]=q[0];o[1]=q[1];o[2]=q[2];G.lastT=t}}}
  return hit?Math.sqrt(best):-1}
// does a ray from p along axis dir hit a triangle of the list (Möller–Trumbore)?
function sn176Ray(T,p,d,mx){for(let t=0;t<T.length/9;t++){const ax=T[t*9],ay=T[t*9+1],az=T[t*9+2],e1x=T[t*9+3]-ax,e1y=T[t*9+4]-ay,e1z=T[t*9+5]-az,e2x=T[t*9+6]-ax,e2y=T[t*9+7]-ay,e2z=T[t*9+8]-az;
    const hx=d[1]*e2z-d[2]*e2y,hy=d[2]*e2x-d[0]*e2z,hz=d[0]*e2y-d[1]*e2x,a=e1x*hx+e1y*hy+e1z*hz;if(Math.abs(a)<1e-12)continue;const f=1/a,sx=p[0]-ax,sy=p[1]-ay,sz=p[2]-az,u=f*(sx*hx+sy*hy+sz*hz);if(u<0||u>1)continue;
    const qx=sy*e1z-sz*e1y,qy=sz*e1x-sx*e1z,qz=sx*e1y-sy*e1x,v=f*(d[0]*qx+d[1]*qy+d[2]*qz);if(v<0||u+v>1)continue;const t2=f*(e2x*qx+e2y*qy+e2z*qz);if(t2>1e-6&&t2<mx)return true}return false}
// the outward normal of the surface at triangle t of G: its face normal turned away from the middle of the body nearby
function sn176N(G,t,r){const T=G.T,ax=T[t*9],ay=T[t*9+1],az=T[t*9+2],ux=T[t*9+3]-ax,uy=T[t*9+4]-ay,uz=T[t*9+5]-az,vx=T[t*9+6]-ax,vy=T[t*9+7]-ay,vz=T[t*9+8]-az;
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
  const cx=ax+(ux+vx)/3,cy=ay+(uy+vy)/3,cz=az+(uz+vz)/3,cs=G.cs,n=Math.max(1,Math.ceil(r/cs)),i0=Math.floor(cx/cs),j0=Math.floor(cy/cs),k0=Math.floor(cz/cs);let mx=0,my=0,mz=0,c=0;
  for(let i=i0-n;i<=i0+n;i++)for(let j=j0-n;j<=j0+n;j++)for(let k=k0-n;k<=k0+n;k++){const L=G.C.get(sn176Key(i,j,k));if(!L)continue;for(const u of L){mx+=T[u*9]+T[u*9+3]+T[u*9+6];my+=T[u*9+1]+T[u*9+4]+T[u*9+7];mz+=T[u*9+2]+T[u*9+5]+T[u*9+8];c+=3}}
  if(c&&nx*(cx-mx/c)+ny*(cy-my/c)+nz*(cz-mz/c)<0){nx=-nx;ny=-ny;nz=-nz}return [nx,ny,nz]}
// a part's triangles and sample points in model space
function sn176Part(p){const g=p.geo,pa=g.attributes.position,ix=g.index?g.index.array:null,n=ix?ix.length:pa.count,v=new THREE.Vector3(),V=[];
  for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);V.push([v.x,v.y,v.z])}
  const tri=[],S=V.slice();for(let i=0;i+2<n;i+=3){const a=V[ix?ix[i]:i],b=V[ix?ix[i+1]:i+1],c=V[ix?ix[i+2]:i+2];tri.push([a,b,c]);
    S.push([(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[(b[0]+c[0])/2,(b[1]+c[1])/2,(b[2]+c[2])/2],[(c[0]+a[0])/2,(c[1]+a[1])/2,(c[2]+a[2])/2])}
  const c=[0,0,0];V.forEach(q=>{c[0]+=q[0];c[1]+=q[1];c[2]+=q[2]});const k=1/Math.max(1,V.length);return {p,tri,S,c:[c[0]*k,c[1]*k,c[2]*k]}}
// body: flat triangle list (xyz × 9 per triangle); P: kit parts (their matrices are moved in place); tag: for SN176.far
function sn176Snap(body,P,tag){if(!SN176.on||!P||!P.length||!body||body.length<9)return 0;
  let y0=1e9,y1=-1e9;for(let i=1;i<body.length;i+=3){y0=Math.min(y0,body[i]);y1=Math.max(y1,body[i])}const H=Math.max(.2,y1-y0),tol=SN176.tol*Math.max(1,H/1.7),max=SN176.max*H,emb=SN176.emb*Math.max(1,H/1.7);
  const G=sn176Grid(Math.max(.02,H*.02));for(let i=0;i<body.length;i+=9)sn176Add(G,[body[i],body[i+1],body[i+2]],[body[i+3],body[i+4],body[i+5]],[body[i+6],body[i+7],body[i+8]]);
  const parts=P.map(sn176Part),att=new Array(parts.length).fill(false),o=[0,0,0];let moved=0;
  const attach=i=>{if(att[i]!=='in')att[i]=true;parts[i].tri.forEach(t=>sn176Add(G,t[0],t[1],t[2]))};
  const near=(q,r)=>{let best=-1,bp=null,bq=null,bt=-1;for(const s of q.S){const d=sn176Near(G,s,r,o);if(d>=0&&(best<0||d<best)){best=d;bp=s;bq=o.slice();bt=G.lastT}}return best<0?null:{d:best,s:bp,q:bq,t:bt}};
  // hidden inside the body: rays along all six axes from the part's centre meet the body close by (within 12 % of its height)
  const BT=body,AX=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];parts.forEach((q,i)=>{if(!near(q,tol)&&[q.c].concat(q.S.slice(0,8)).every(p=>AX.every(d=>sn176Ray(BT,p,d,H*.12))))att[i]='in'});
  parts.forEach((q,i)=>{if(att[i]==='in')attach(i)});
  if(SN176.dbg)parts.forEach((q,i)=>{const r=near(q,.2);SN176.dbg.push((tag||'')+' '+q.p.bn+' c '+q.c.map(v=>v.toFixed(3)).join(',')+' d '+(r?r.d.toFixed(4)+' q '+r.q.map(v=>v.toFixed(3)).join(','):'-')+(att[i]==='in'?' IN':''))});
  const grow=()=>{let ch=true;while(ch){ch=false;parts.forEach((q,i)=>{if(att[i])return;if(near(q,tol)){attach(i);ch=true}})}};
  grow();
  for(let pass=0;pass<6;pass++){const L=[];parts.forEach((q,i)=>{if(!att[i])L.push(i)});if(!L.length)break;
    // loose parts that touch each other move together
    const grp=L.map(i=>[i]),gi=new Map(L.map((i,j)=>[i,j]));
    {const T=sn176Grid(G.cs);const own=[];L.forEach(i=>parts[i].tri.forEach(t=>{sn176Add(T,t[0],t[1],t[2]);own.push(i)}));const par=L.map((_,j)=>j),f=j=>{while(par[j]!==j)j=par[j]=par[par[j]];return j};
      L.forEach(i=>{const q=parts[i];for(const s of q.S){const cs=T.cs,n=1,a=Math.floor(s[0]/cs),b=Math.floor(s[1]/cs),c=Math.floor(s[2]/cs);
        for(let x=a-n;x<=a+n;x++)for(let y=b-n;y<=b+n;y++)for(let z=c-n;z<=c+n;z++){const C=T.C.get(sn176Key(x,y,z));if(!C)continue;C.forEach(t=>{const j=own[t];if(j===i)return;if(sn176Tri(T.T,t,s,o)<=tol*tol){const A=f(gi.get(i)),B=f(gi.get(j));if(A!==B)par[B]=A}})}}});
      grp.length=0;const by=new Map();L.forEach((i,j)=>{const r=f(j);if(!by.has(r))by.set(r,[]);by.get(r).push(i)});by.forEach(v=>grp.push(v))}
    let did=false;
    grp.forEach(g=>{let best=null,bi=-1;g.forEach(i=>{const r=near(parts[i],max);if(r&&(!best||r.d<best.d)){best=r;bi=i}});if(!best)return;
      let dx=best.q[0]-best.s[0],dy=best.q[1]-best.s[1],dz=best.q[2]-best.s[2];const L2=Math.hypot(dx,dy,dz)||1;let k=(L2+emb)/L2;
      // a part sunk into the body (its middle behind the surface) comes out to sit on it, its middle at the surface
      const N=sn176N(G,best.t,G.cs*1.5),c=parts[bi].c,dc=[c[0]-best.q[0],c[1]-best.q[1],c[2]-best.q[2]];
      if(N[0]*dc[0]+N[1]*dc[1]+N[2]*dc[2]<0){dx=best.q[0]-c[0];dy=best.q[1]-c[1];dz=best.q[2]-c[2];k=1}
      const M=new THREE.Matrix4().makeTranslation(dx*k,dy*k,dz*k);
      g.forEach(i=>{parts[i].p.m.premultiply(M);parts[i]=sn176Part(parts[i].p);attach(i)});moved+=g.length;did=true});
    grow();if(!did)break}
  parts.forEach((q,i)=>{if(!att[i])SN176.far.push((tag||'')+' '+q.p.bn+' at '+q.c.map(v=>v.toFixed(3)).join(','))});
  SN176.moved+=moved;return moved}
// ---------------- creature rigs: the kit against the body loft ----------------
{const f=lpRig;lpRig=function(c,n,D){const en=c&&(c.en||(c.g&&EN[c.g[0]]&&!SP2[c.g[0]]));if(!SN176.on||!en)return f.apply(this,arguments);
  SN176.lp={c,n,D};try{return f.apply(this,arguments)}finally{SN176.lp=null}}}
{const f=dkBake;dkBake=function(P,O,key){const L=SN176.lp;if(L&&key&&/^LP\|/.test(key)){key=key+'|s176';
    if(!(DKBK&&DKBK[key])&&P&&P.length){try{const G=L.D.geo(L.c.cl[0],L.c),pa=G.attributes.position,ix=G.index?G.index.array:null,n=ix?ix.length:pa.count,T=[];
      for(let i=0;i<n;i++){const j=ix?ix[i]:i;T.push(pa.getX(j),pa.getY(j),pa.getZ(j))}sn176Snap(T,P,L.n)}catch(e){console.warn('v176 snap',L.n,e)}}}
  return f.call(this,P,O,key)}}
// ---------------- humanoid foes: every kit against what is built so far ----------------
{const f=mdFoeB;mdFoeB=function(key){if(!SN176.on)return f.apply(this,arguments);SN176.hum++;SN176.humK=key;try{return f.apply(this,arguments)}finally{SN176.hum--}}}
{const f=mdFoeGeo;mdFoeGeo=function(key){return SN176.on?mdGeo('F176|'+key,()=>mdFoeB(key)):f.apply(this,arguments)}}
// The v99 proportions (0010) move every vertex by its bones when the build is baked, so the snap works on the final shape:
// the body and each part are taken through that warp, snapped there, and the move is carried back (W⁻¹·T·W) onto the part.
function sn176Warp(B){let pl=null;try{if(B.kqPre&&B.kqPre!='none'&&typeof AW_PROP99!='undefined')pl=AW_PROP99.plan(B.bones,B.kqPre)}catch(e){pl=null}
  if(!pl)return null;const W={};pl.names.forEach(n=>{const M=pl.M[n],a=pl.abs[n],N=pl.N[n],m=new THREE.Matrix4().set(M[0],M[1],M[2],0,M[3],M[4],M[5],0,M[6],M[7],M[8],0,0,0,0,1);
    const t=new THREE.Vector3(a[0],a[1],a[2]).applyMatrix4(m);m.setPosition(N[0]-t.x,N[1]-t.y,N[2]-t.z);W[n]=m});return {pl,W}}
{const f=mdKit;mdKit=function(B,k){if(SN176.hum>0&&k&&k.P&&k.P.length){try{const X=sn176Warp(B),T=[];
      ['c','m','g'].forEach(t=>{const L=B.L[t];if(!L)return;for(let v=0;v<L.p.length/3;v++){let x=L.p[v*3],y=L.p[v*3+1],z=L.p[v*3+2];
        if(X){let X0=0,Y0=0,Z0=0,Wt=0;for(let j=0;j<4;j++){const w=L.sw[v*4+j];if(!(w>0))continue;const b=X.pl.idx[L.si[v*4+j]];if(!b)continue;const M=b.M,dx=x-b.a[0],dy=y-b.a[1],dz=z-b.a[2];
            X0+=w*(b.n[0]+M[0]*dx+M[1]*dy+M[2]*dz);Y0+=w*(b.n[1]+M[3]*dx+M[4]*dy+M[5]*dz);Z0+=w*(b.n[2]+M[6]*dx+M[7]*dy+M[8]*dz);Wt+=w}if(Wt>0){x=X0/Wt;y=Y0/Wt;z=Z0/Wt}}
        T.push(x,y,z)}});
      const bnOf=p=>(p.w&&p.w[0]&&p.w[0][0])||p.bn||B.O[0],Wb=p=>X&&X.W[bnOf(p)]||null;
      const Q=k.P.map(p=>{const w=Wb(p);return Object.assign({},p,{m:w?w.clone().multiply(p.m):p.m.clone()})});
      sn176Snap(T,Q,SN176.humK);
      Q.forEach((q,i)=>{const p=k.P[i],w=Wb(p);p.m=w?new THREE.Matrix4().copy(w).invert().multiply(q.m):q.m})}catch(e){console.warn('v176 snap',e)}}
  return f.apply(this,arguments)}}
