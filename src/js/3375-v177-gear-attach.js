// ================= v177: every piece of gear is attached to something =================
// Owner (Oct 30 2026): "check all equipment models for unattached pieces". The gear audit (test/v177_gear_audit.py) found pieces
// hovering off what they should sit on: studs, scratches and seals placed on a formula of the torso instead of the armour actually
// built there (some float, some are buried inside the plate), weapon blades and censer cages a few cm off their guards, staff
// crystals hanging in mid-air, serration teeth beside a blade, chain links that do not meet.
// gf176Snap runs over a finished build and moves each loose piece the shortest way onto what is there:
//  * pieces = the rigid kit parts (one triangle range each); everything else (the body, lofted shells, cloth) is fixed ground,
//    and so is every piece reached from it through pieces that touch (a vertex within 5 mm of another surface, or an edge
//    through it).
//  * a loose group (pieces touching each other but nothing leading to the ground) is moved along the shortest line to the
//    nearest attached surface within 8 cm, 1.5 mm into it; nearest groups first, so a group can then hold the next one.
//    A group buried inside the armour (most rays from its centre hit something) is pushed out through the nearest surface
//    until it sits on top of it.
// Used on hero models and armour pictures (after the whole build, hoods and motifs included) and on weapon / shield kits (the
// ground there is what touches the grip; a shield's ground is its biggest piece). Moving keeps each piece's bone weights.
// buried = enclosed: rays in 14 directions (turned off the axes, so the bars of a cage do not all line up with them) nearly all hit
var GF176_DIRS=(()=>{const D=[];[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1]].forEach(d=>{const v=new THREE.Vector3(...d).normalize().applyEuler(new THREE.Euler(.37,.61,.23));D.push([v.x,v.y,v.z])});return D})();
var GF176={eps:.005,R:.08,ov:.0015,stat:{built:0,moved:0,buried:0,left:0,ms:0},on:1};
function gf176CP(p,v){// closest point on triangle v (9 numbers) to p → [x,y,z,dist]
  const ax=v[0],ay=v[1],az=v[2],abx=v[3]-ax,aby=v[4]-ay,abz=v[5]-az,acx=v[6]-ax,acy=v[7]-ay,acz=v[8]-az,apx=p[0]-ax,apy=p[1]-ay,apz=p[2]-az,
    d1=abx*apx+aby*apy+abz*apz,d2=acx*apx+acy*apy+acz*apz;let qx,qy,qz;
  if(d1<=0&&d2<=0){qx=ax;qy=ay;qz=az}else{const bpx=p[0]-v[3],bpy=p[1]-v[4],bpz=p[2]-v[5],d3=abx*bpx+aby*bpy+abz*bpz,d4=acx*bpx+acy*bpy+acz*bpz;
    if(d3>=0&&d4<=d3){qx=v[3];qy=v[4];qz=v[5]}else{const vc=d1*d4-d3*d2;
      if(vc<=0&&d1>=0&&d3<=0){const w=d1/(d1-d3);qx=ax+abx*w;qy=ay+aby*w;qz=az+abz*w}else{const cpx=p[0]-v[6],cpy=p[1]-v[7],cpz=p[2]-v[8],d5=abx*cpx+aby*cpy+abz*cpz,d6=acx*cpx+acy*cpy+acz*cpz;
        if(d6>=0&&d5<=d6){qx=v[6];qy=v[7];qz=v[8]}else{const vb=d5*d2-d1*d6;
          if(vb<=0&&d2>=0&&d6<=0){const w=d2/(d2-d6);qx=ax+acx*w;qy=ay+acy*w;qz=az+acz*w}else{const va=d3*d6-d5*d4;
            if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0){const w=(d4-d3)/((d4-d3)+(d5-d6));qx=v[3]+(v[6]-v[3])*w;qy=v[4]+(v[7]-v[4])*w;qz=v[5]+(v[8]-v[5])*w}
            else{const dn=1/(va+vb+vc),vv=vb*dn,ww=vc*dn;qx=ax+abx*vv+acx*ww;qy=ay+aby*vv+acy*ww;qz=az+abz*vv+acz*ww}}}}}}
  return [qx,qy,qz,Math.hypot(p[0]-qx,p[1]-qy,p[2]-qz)]}
function gf176Ray(o,d,v){// segment / ray vs triangle: distance along d or -1
  const e1x=v[3]-v[0],e1y=v[4]-v[1],e1z=v[5]-v[2],e2x=v[6]-v[0],e2y=v[7]-v[1],e2z=v[8]-v[2],px=d[1]*e2z-d[2]*e2y,py=d[2]*e2x-d[0]*e2z,pz=d[0]*e2y-d[1]*e2x,det=e1x*px+e1y*py+e1z*pz;
  if(Math.abs(det)<1e-12)return -1;const id=1/det,sx=o[0]-v[0],sy=o[1]-v[1],sz=o[2]-v[2],u=(sx*px+sy*py+sz*pz)*id;if(u<0||u>1)return -1;
  const qx=sy*e1z-sz*e1y,qy=sz*e1x-sx*e1z,qz=sx*e1y-sy*e1x,w=(d[0]*qx+d[1]*qy+d[2]*qz)*id;if(w<0||u+w>1)return -1;return (e2x*qx+e2y*qy+e2z*qz)*id}
// closest point / ray on a triangle stored at offset o of a flat array
function gf176CPo(p,T,o){return gf176CP(p,T.subarray?T.subarray(o,o+9):T.slice(o,o+9))}
// S: {n (triangles), TT: Float64Array n*9 (positions; moved here too), own: Int32Array (piece id, -1 = ground), np, ground: Uint8Array per piece,
//     move(pid,dx,dy,dz) (moves the source), R (search radius, optional), autoGround}
function gf176Run(S){const RR=S.R||GF176.R,t0=performance.now(),cs=.025,G=new Map(),eps=GF176.eps,n=S.n,np=S.np,TT=S.TT,own=S.own;
  const K=(x,y,z)=>((x+1024)*2048+(y+1024))*2048+(z+1024);
  const add=i=>{const o=i*9;let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;for(let j=0;j<9;j+=3){const X=TT[o+j],Y=TT[o+j+1],Z=TT[o+j+2];if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y;if(Z<z0)z0=Z;if(Z>z1)z1=Z}
    for(let x=Math.floor(x0/cs);x<=Math.floor(x1/cs);x++)for(let y=Math.floor(y0/cs);y<=Math.floor(y1/cs);y++)for(let z=Math.floor(z0/cs);z<=Math.floor(z1/cs);z++){const k=K(x,y,z);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(i)}};
  for(let i=0;i<n;i++)add(i);
  const byP=[];for(let i=0;i<n;i++){const o=own[i];if(o>=0)(byP[o]||(byP[o]=[])).push(i)}
  // each triangle near p (cells within r) once per query
  const stamp=new Int32Array(n);let st=0;
  const each=(p,r,fn)=>{st++;const x0=Math.floor((p[0]-r)/cs),x1=Math.floor((p[0]+r)/cs),y0=Math.floor((p[1]-r)/cs),y1=Math.floor((p[1]+r)/cs),z0=Math.floor((p[2]-r)/cs),z1=Math.floor((p[2]+r)/cs);
    for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++){const a=G.get(K(x,y,z));if(!a)continue;for(let j=0;j<a.length;j++){const i=a[j];if(stamp[i]===st)continue;stamp[i]=st;if(fn(i)===false)return}}};
  const VC=[];const verts=pid=>{if(VC[pid])return VC[pid];const out=[],sk=new Set();(byP[pid]||[]).forEach(i=>{const o=i*9;for(let j=0;j<9;j+=3){const k=Math.round(TT[o+j]*4000)+','+Math.round(TT[o+j+1]*4000)+','+Math.round(TT[o+j+2]*4000);if(sk.has(k))continue;sk.add(k);out.push([TT[o+j],TT[o+j+1],TT[o+j+2]])}
    out.push([(TT[o]+TT[o+3]+TT[o+6])/3,(TT[o+1]+TT[o+4]+TT[o+7])/3,(TT[o+2]+TT[o+5]+TT[o+8])/3])});return VC[pid]=out};
  const cp=(p,i)=>gf176CPo(p,TT,i*9),ray=(o,d,i)=>gf176Ray(o,d,TT.subarray(i*9,i*9+9));
  // touches of every non-ground piece
  const L=[];for(let p=0;p<np;p++)L.push(new Set());
  const sit=new Int32Array(np).fill(-1);// the first ground triangle each piece rests on
  for(let p=0;p<np;p++){if(S.ground[p]||!byP[p])continue;const acc=L[p];
    for(const q of verts(p))each(q,eps,i=>{const o=own[i];if(o===p||(acc.has(o)&&(o!==-1||sit[p]>=0)))return;if(cp(q,i)[3]<=eps){acc.add(o);if(o===-1&&sit[p]<0)sit[p]=i}});
    if(!acc.size)for(const i of byP[p]){const o9=i*9;for(const [a,b] of [[0,3],[3,6],[6,0]]){const o=[TT[o9+a],TT[o9+a+1],TT[o9+a+2]],d=[TT[o9+b]-o[0],TT[o9+b+1]-o[1],TT[o9+b+2]-o[2]],len=Math.hypot(d[0],d[1],d[2]);if(len<1e-6)continue;
        const u=[d[0]/len,d[1]/len,d[2]/len],mid=[o[0]+d[0]/2,o[1]+d[1]/2,o[2]+d[2]/2];each(mid,len/2,j=>{const ow=own[j];if(ow===p||acc.has(ow))return;const h=ray(o,u,j);if(h>=0&&h<=len)acc.add(ow)})}}}
  (S.join||[]).forEach(([a,b])=>{L[a].add(b)});
  for(let p=0;p<np;p++)L[p].forEach(o=>{if(o>=0)L[o].add(p)});
  const ok=new Uint8Array(np),q=[];for(let p=0;p<np;p++)if(S.ground[p]||!byP[p]||L[p].has(-1)){ok[p]=1;q.push(p)}
  const spread=()=>{while(q.length){const c=q.pop();L[c].forEach(o=>{if(o>=0&&!ok[o]){ok[o]=1;q.push(o)}})}};spread();
  // a kit whose grip holds only a small part of it (bows: the hand is off the frame): the biggest touching group is the ground too
  if(S.autoGround){let tot=0,got=0;for(let p=0;p<np;p++){const c=(byP[p]||[]).length;tot+=c;if(ok[p])got+=c}
    if(got<tot*.2){const done=new Uint8Array(np);let big=null,bn=0;for(let p=0;p<np;p++){if(ok[p]||done[p])continue;const g=[p];done[p]=1;for(let j=0;j<g.length;j++)L[g[j]].forEach(o=>{if(o>=0&&!ok[o]&&!done[o]){done[o]=1;g.push(o)}});
        const c=g.reduce((a,x)=>a+(byP[x]||[]).length,0);if(c>bn){bn=c;big=g}}
      if(big)big.forEach(p=>{ok[p]=1;q.push(p)});spread()}}
  // loose groups
  let groups=[];{const done=new Uint8Array(np);for(let p=0;p<np;p++){if(ok[p]||done[p])continue;const g=[p];done[p]=1;for(let j=0;j<g.length;j++)L[g[j]].forEach(o=>{if(o>=0&&!ok[o]&&!done[o]){done[o]=1;g.push(o)}});groups.push(g)}}
  // pieces resting on the ground take its bone weights (a stud on a pauldron moves with the pauldron, not the chest it was weighted to)
  if(S.rest)for(let p=0;p<np;p++)if(!S.ground[p]&&sit[p]>=0)S.rest(p,sit[p]);
  if(!groups.length){GF176.stat.ms+=performance.now()-t0;GF176.stat.built++;return}
  const isOk=i=>{const o=own[i];return o<0||ok[o]};
  // the nearest attached surface to a group: a sample of its vertices, searched out to 1.2 cm, then 3 cm, then RR
  const best=g=>{const S2=new Set(g);let V=[];g.forEach(p=>V=V.concat(verts(p)));if(V.length>64){const st2=V.length/64;V=Array.from({length:64},(_,i)=>V[Math.floor(i*st2)])}
    for(const r of [.012,.03,RR]){let b=null;V.forEach(v=>each(v,r,i=>{const o=own[i];if(S2.has(o)||!isOk(i))return;const c=cp(v,i);if(c[3]<=r&&(!b||c[3]<b.d))b={d:c[3],v,c,i}}));if(b)return b}return null};
  const place=g=>{const S2=new Set(g),bb=g._b;
    let cx=0,cy=0,cz=0,nv=0;const V=[];g.forEach(p=>verts(p).forEach(v=>{V.push(v);cx+=v[0];cy+=v[1];cz+=v[2];nv++}));cx/=nv;cy/=nv;cz/=nv;const c=[cx,cy,cz];
    // buried (enclosed): nearly every ray from its centre meets an attached surface
    let hits=0,miss=0;for(const d of GF176_DIRS){if(miss>1)break;let hit=false;for(let s=0;s<=12&&!hit;s++){const pp=[cx+d[0]*s*.02,cy+d[1]*s*.02,cz+d[2]*s*.02];
        each(pp,.012,i=>{if(S2.has(own[i])||!isOk(i))return;const h=ray(c,d,i);if(h>=0&&h<.26){hit=true;return false}})}if(hit)hits++;else miss++}
    let dx,dy,dz,nb=null,ti=-1;if(hits>=GF176_DIRS.length-1){each(c,RR*1.5,i=>{if(S2.has(own[i])||!isOk(i))return;const r=cp(c,i);if(!nb||r[3]<nb[3]){nb=r;ti=i}});if(!nb||nb[3]<1e-5)nb=null}
    if(nb){// buried: out through the nearest surface to the centre, until the group sits on it
      const dir=[(nb[0]-cx)/nb[3],(nb[1]-cy)/nb[3],(nb[2]-cz)/nb[3]];let m=0;V.forEach(v=>{const t=(v[0]-cx)*dir[0]+(v[1]-cy)*dir[1]+(v[2]-cz)*dir[2];if(t<m)m=t});
      const s=nb[3]-m-GF176.ov;dx=dir[0]*s;dy=dir[1]*s;dz=dir[2]*s;GF176.stat.buried++}
    else{const d=bb.d,f=(d+GF176.ov)/Math.max(d,1e-6);dx=(bb.c[0]-bb.v[0])*f;dy=(bb.c[1]-bb.v[1])*f;dz=(bb.c[2]-bb.v[2])*f;ti=bb.i}
    if(GF176.dbg)GF176.dbg.push({g:g.slice(),hits,d:[dx,dy,dz].map(x=>+x.toFixed(4))});
    g.forEach(p=>{S.move(p,dx,dy,dz,ti);(byP[p]||[]).forEach(i=>{const o=i*9;for(let j=0;j<9;j+=3){TT[o+j]+=dx;TT[o+j+1]+=dy;TT[o+j+2]+=dz}add(i)});VC[p]=null;ok[p]=1});GF176.stat.moved+=g.length};
  // nearest groups first; groups with nothing in reach are tried again once the others have moved (one may now hold them)
  for(let pass=0;pass<3&&groups.length;pass++){groups.forEach(g=>g._b=best(g));const go=groups.filter(g=>g._b).sort((a,b)=>a._b.d-b._b.d);groups=groups.filter(g=>!g._b);
    if(!go.length)break;go.forEach(place)}
  if(groups.length){GF176.stat.left+=groups.length;if(GF176.dbg)groups.forEach(g=>GF176.dbg.push({left:g.slice()}))}
  GF176.stat.ms+=performance.now()-t0;GF176.stat.built++}
// ---------------- hero models and armour pictures ----------------
// every rigid part merged into a build is recorded: bucket, float range, made by the animal's own builders or not, its size
{const f=mdKit;mdKit=function(B,k){if(!(GL176.on>0)||!k||!k.P||!GF176.on||GF176.inRec)return f.apply(this,arguments);const R=B.__gf||(B.__gf=[]);
  for(const p of k.P){const t=p.t=='m'?'m':p.t=='g'?'g':'c',L=B.L[t]||B.L.c,a=L.p.length;f.call(this,B,{P:[p]});const b=L.p.length;if(b<=a)continue;const tt=L===B.L[t]?t:'c',last=R[R.length-1];
    // the links of one chain / the segments of one tube are one piece (p.gfg)
    if(p.gfg&&last&&last.g===p.gfg&&last.t===tt&&last.b===a)last.b=b;else R.push({t:tt,a,b,body:GL176.body>0,g:p.gfg||0})}}}
// hanging cloth panels (tabards, war banners) and the quiver are one piece each, which may be moved (they are big, but they hang free)
['mdTabard','mdTabardO','mdQuiver'].forEach(n=>{const f=window[n];if(typeof f!='function')return;window[n]=function(X){const B=X&&X.L?X:X&&X.B;if(!B||!B.L||!(GL176.on>0)||!GF176.on||GF176.inRec)return f.apply(this,arguments);
  const n0={};for(const t in B.L)n0[t]=B.L[t].p.length;GF176.inRec=1;let r;try{r=f.apply(this,arguments)}finally{GF176.inRec=0}const R=B.__gf||(B.__gf=[]),g=++GF176_G;
  for(const t in B.L){const b=B.L[t].p.length;if(b>n0[t])R.push({t,a:n0[t],b,body:false,g,panel:1})}return r}});
var GF176_G=0;function gf176Group(k,n0){const g=++GF176_G;for(let i=n0;i<k.P.length;i++)k.P[i].gfg=g;return k}
function gf176Hero(B,since){const R=B.__gf;if(!R||!R.length)return;const S={n:0,own:null,np:R.length,ground:new Uint8Array(R.length)},refs=[];
  const owner={};for(const t in B.L)owner[t]=new Int32Array(B.L[t].p.length/9|0).fill(-1);R.forEach((r,i)=>{const ow=owner[r.t];if(ow)for(let x=r.a;x<r.b;x+=9)ow[x/9|0]=i;
    // the animal's own parts, parts built before `since`, and big parts stay where they are
    let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;const P=B.L[r.t].p;for(let x=r.a;x<r.b;x+=3){x0=Math.min(x0,P[x]);x1=Math.max(x1,P[x]);y0=Math.min(y0,P[x+1]);y1=Math.max(y1,P[x+1]);z0=Math.min(z0,P[x+2]);z1=Math.max(z1,P[x+2])}
    r.sz=Math.hypot(x1-x0,y1-y0,z1-z0);if(r.body||(since&&i<since)||(r.panel?(r.sz>.85||x1-x0>.36):r.sz>(r.g?.6:.2)))S.ground[i]=1});
  S.join=[];R.forEach((r,i)=>{if(r.panel&&i&&R[i-1].g===r.g)S.join.push([i-1,i])});
  for(const t in B.L){const P=B.L[t].p;for(let x=0;x+8<P.length;x+=9)refs.push([t,x])}
  S.n=refs.length;S.own=new Int32Array(S.n);S.TT=new Float64Array(S.n*9);refs.forEach((r,i)=>{S.own[i]=owner[r[0]][r[1]/9|0];const P=B.L[r[0]].p;for(let j=0;j<9;j++)S.TT[i*9+j]=P[r[1]+j]});
  S.rest=(pid,ti)=>{const r=R[pid];if(r.sz>.12||r.panel||r.g)return;const L=B.L[r.t],q=refs[ti],Lq=B.L[q[0]],v=q[1]/3*4;for(let x=r.a;x<r.b;x+=3){const u=x/3*4;for(let j=0;j<4;j++){L.si[u+j]=Lq.si[v+j];L.sw[u+j]=Lq.sw[v+j]}}};
  // a small piece takes the bone weights of what it now sits on (so it stays on it when that moves)
  S.move=(pid,dx,dy,dz,ti)=>{const r=R[pid],L=B.L[r.t],P=L.p;for(let x=r.a;x<r.b;x+=3){P[x]+=dx;P[x+1]+=dy;P[x+2]+=dz}
    if(ti>=0&&r.sz<=.07&&!r.panel){const q=refs[ti],Lq=B.L[q[0]],v=q[1]/3*4;for(let x=r.a;x<r.b;x+=3){const u=x/3*4;for(let j=0;j<4;j++){L.si[u+j]=Lq.si[v+j];L.sw[u+j]=Lq.sw[v+j]}}}};
  try{gf176Run(S)}catch(e){console.warn('v177 attach',e)}}
// a hero: once, after everything (hoods and motifs included) is built
{const f=mdHeroB;mdHeroB=function(){const o=GF176.inH|0;GF176.inH=o+1;try{const B=f.apply(this,arguments);if(!o&&B&&B.__gf&&GF176.on)gf176Hero(B);return B}finally{GF176.inH=o}}}
// an armour picture: the piece's parts after the piece is built (the animal under it is ground)
['mdHelm','mdChest','mdBoots'].forEach(n=>{const f=window[n];window[n]=function(B){if(GF176.inH||!(GL176.on>0)||!GF176.on)return f.apply(this,arguments);const n0=(B.__gf||[]).length,r=f.apply(this,arguments);try{if(B.__gf&&B.__gf.length>n0)gf176Hero(B,n0)}catch(e){console.warn('v177 attach',e)}return r}});
// ---------------- weapon and shield kits ----------------
function gf176Kit(k,it){if(!GF176.on||!k||!k.P||!k.P.length)return;const v=new THREE.Vector3(),T=[],own=[];let shield=false,wt='';try{shield=itT(it).sl=='offhand';wt=String(itT(it).wt||'')}catch(e){}
  k.P.forEach((p,pi)=>{const g=p.geo;if(!g||!g.attributes||!g.attributes.position)return;const pa=g.attributes.position,ix=g.index?g.index.array:null,cnt=ix?ix.length:pa.count,Pp=[];
    for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);Pp.push(v.x,v.y,v.z)}
    for(let i=0;i+2<cnt;i+=3){const a=ix?ix[i]:i,b=ix?ix[i+1]:i+1,c=ix?ix[i+2]:i+2;T.push([Pp[a*3],Pp[a*3+1],Pp[a*3+2],Pp[b*3],Pp[b*3+1],Pp[b*3+2],Pp[c*3],Pp[c*3+1],Pp[c*3+2]]);own.push(pi)}});
  const np=k.P.length,ground=new Uint8Array(np);
  if(shield){const cnt=new Array(np).fill(0);own.forEach(o=>cnt[o]++);let b=0;for(let i=1;i<np;i++)if(cnt[i]>cnt[b])b=i;ground[b]=1}
  else{let bd=1e9,bp=-1;T.forEach((t,i)=>{const d=gf176CP([0,0,0],t)[3];if(d<.03)ground[own[i]]=1;if(d<bd){bd=d;bp=own[i]}});if(bp>=0)ground[bp]=1}
  const TT=new Float64Array(T.length*9);T.forEach((t,i)=>{for(let j=0;j<9;j++)TT[i*9+j]=t[j]});
  const S={n:T.length,TT,own:Int32Array.from(own),np,ground,autoGround:!shield&&/bow|sling/.test(wt),R:.12,move:(pid,dx,dy,dz)=>{const p=k.P[pid];p.m=p.m.clone();p.m.elements[12]+=dx;p.m.elements[13]+=dy;p.m.elements[14]+=dz}};
  try{gf176Run(S)}catch(e){console.warn('v177 attach kit',e)}}
// the outermost kit builder snaps (a unique's kit calls the base weapon's kit inside it, then adds its ornaments)
['v89WpnKit','unqWpnKit135'].forEach(n=>{const f=window[n];if(typeof f!='function')return;window[n]=function(k,it){const o=GF176.kd|0;GF176.kd=o+1;try{return f.apply(this,arguments)}finally{GF176.kd=o;if(!o)gf176Kit(k,it)}}});
