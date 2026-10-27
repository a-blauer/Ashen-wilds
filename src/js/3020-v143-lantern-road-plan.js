// ================= v143 The Lantern Road — where everything stands (Kindlelight I) =================
// The main quest of Kindlelight I (3021 wardens, 3022 models, 3023 the quest and the world). This file only lays out the spots:
// mq143Plan() is a hoisted function of the map data alone (INSL[0].path, MAP tiles, MAP.DW), so it gives the same answer on every
// machine and at any time — wdDeco (0070, long before this file runs) calls mq143Keep through 1680's place() so no decoration
// lands in the outpost, on a lamppost or where the Ripper parks (the kept decoration still counts as placed, so the seeded
// stream and every other decoration in the world stay exactly as they were).
// Layout (v151): the outpost sits near the entrance, mq151Cfg().A (36) steps down the road, in the clearing the entrance camp used to
// hold (that camp moves to a side field, mq151MoveCamp below). In the road's frame at the anchor (a along the road toward the
// gateway, b to the side: + south, − north here), the Ripper waits on the road, tents and the palisade stand on the north side,
// the captain's map table on the south. The lampposts line the whole road from the outpost to ~10 steps before the gateway,
// alternating sides, about mq151Cfg().gap (7) tiles apart (~47 of them; v143 had 8 on the last 50 steps). The Ripper parks beside
// the gateway, on the side away from Cheddar's gateway spot, facing the arch.
// (hoisted functions, not a var: 0045 and 0070 call into this file long before its own lines run)
function mq151Cfg(){return {A:36,gap:7}}
function mq151A(N){return Math.max(10,Math.min(mq151Cfg().A,N-60))}
function mq143Plan(){if(mq143Plan.c)return mq143Plan.c;
  const I=INSL[0],P=I.path,N=P.length,DW=MAP.DW;
  const props=new Set();try{MAP.props.forEach(q=>props.add(q[1]*W+q[0]))}catch(_){}
  const ok=(x,z,m)=>{const X=Math.round(x),Z=Math.round(z);if(X<1||Z<1||X>=W-1||Z>=H-1)return false;const t=MAP[Z]&&MAP[Z][X];
    if(!t||t=='#'||t=='r'||t=='~'||t=='H'||props.has(Z*W+X))return false;return DW[Z*W+X]<-(m==null?1.2:m)};
  const tan=i=>{const a=P[Math.max(0,i-3)],b=P[Math.min(N-1,i+3)];let dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;return [dx/L,dz/L]};
  const A=mq151A(N),C=P[A],f=tan(A),s=[-f[1],f[0]];
  const at=(a,b)=>[C[0]+f[0]*a+s[0]*b,C[1]+f[1]*a+s[1]*b];
  const ALT=[[0,0],[0,.7],[0,-.7],[.7,0],[-.7,0],[0,1.4],[0,-1.4],[1.4,0],[-1.4,0],[1.2,1.2],[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2]];
  // a spot: the first offset where the centre (and the footprint points fp, in the road frame) are walkable
  const pick=(a,b,m,fp)=>{for(const [da,db] of ALT){const q=at(a+da,b+db);if(!ok(q[0],q[1],m))continue;
      if(fp&&!fp.every(([u,v])=>{const r=at(a+da+u,b+db+v);return ok(r[0],r[1],.6)}))continue;return {x:q[0],z:q[1],a:a+da,b:b+db}}return null};
  const yawTo=(x,z,tx,tz)=>Math.atan2(tx-x,tz-z),R={A,C,f,s,N,lamps:[],props:[],war:{},stakes:[],keep:[],ok};
  // the Ripper starts on the road; it rolls from road index A+2
  R.start=A+2;
  // the wardens (key → spot + facing)
  const face=(o,a,b)=>{if(!o)return o;const t=at(a,b);o.ry=yawTo(o.x,o.z,t[0],t[1]);return o};
  R.war.captain=face(pick(.6,2.7,1),-6,0);R.war.rook=face(pick(-5.8,1.7,1),-12,1.7);R.war.thistle=face(pick(-5.8,-1.7,1),-12,-1.7);
  R.war.sergeant=face(pick(-2.6,-4.6,1),-1.8,-3.2);R.war.ironpaw=face(pick(5.4,1.9,1),-2,0);R.war.gearwick=face(pick(-.4,1.55,.9),3,0);
  R.war.vesk=face(pick(-3.4,-8.2,1),8,-8.2);R.patrol=[pick(-3.4,-8.2,1),pick(7.2,-8.2,1)];
  // the outpost pieces: [kind, a, b, turn (radians, added to the road heading), footprint]
  const road=Math.atan2(f[0],f[1]),tentFp=[[-.7,-1.3],[.7,-1.3],[-.7,1.3],[.7,1.3]];
  [['table',.9,3.95,0,null],['banner',-5.6,2.7,Math.PI,null],['banner',-5.6,-2.7,Math.PI,null],['brazier',-1.8,-3.2,0,null],['rack',2.7,-3.7,-Math.PI/2,null],
   ['tent',-1.4,-6.7,Math.PI,tentFp],['tent',4.6,-6.5,Math.PI,tentFp],['crate0',7.1,-4.4,.3,null],['crate1',7.7,-3.6,-.2,null],['barrel',6.7,-5.4,0,null],
   ['bulbcrate',4.3,2.4,.4,null],['barrel',-4.2,3.4,0,null],['crate1',-1.6,3.6,.9,null]].forEach(([k,a,b,tr,fp])=>{
    const o=pick(a,b,1,fp);if(!o)return;o.k=k;o.ry=road+tr;R.props.push(o)});
  // the palisade: sections of stakes along the east edge, a short screen on the west
  for(let a=-4.6;a<=8.6;a+=1.55){const o=pick(a,-9.7,.5);if(o){o.ry=road+Math.PI/2;o.n=6;R.stakes.push(o)}}
  [-2.2,-.7].forEach(a=>{const o=pick(a,5.6,.5);if(o){o.ry=road-Math.PI/2;o.n=5;R.stakes.push(o)}});
  // the lampposts: from A+8 to N-10, about mq151Cfg().gap apart (at least 8), alternating sides 2.7 off the road centre, the arm over the road
  const L0=A+8,L1=N-10,n=Math.max(8,Math.round((L1-L0)/mq151Cfg().gap)+1);for(let i=0;i<n;i++){const ix=Math.round(L0+(L1-L0)*i/(n-1)),q=P[ix],t=tan(ix),sv=[-t[1],t[0]],sd=i%2?1:-1;let o=null;
    for(const b of [2.7*sd,3.3*sd,2.2*sd,-2.7*sd,-3.3*sd]){const x=q[0]+sv[0]*b,z=q[1]+sv[1]*b;if(ok(x,z,.8)){o={x,z,i:ix};break}}
    if(!o)o={x:q[0]+sv[0]*2.7*sd,z:q[1]+sv[1]*2.7*sd,i:ix};o.ry=Math.atan2(-(q[1]-o.z),q[0]-o.x);R.lamps.push(o)}
  // the gateway and where the Ripper parks: beside the arch, away from Cheddar's gateway spot (2350 picks +side first)
  const G=I.ba,q=P[Math.max(0,N-14)];let dx=q[0]-G[0],dz=q[1]-G[1];const Lg=Math.hypot(dx,dz)||1;dx/=Lg;dz/=Lg;const sx=-dz,sz=dx;
  const chq=[[5.4,2],[5.4,-2],[6,2.4],[6,-2.4]].find(([a,b])=>ok(G[0]+dx*a+sx*b,G[1]+dz*a+sz*b,.3)),cs=chq?Math.sign(chq[1]):1;
  R.gate={x:G[0],z:G[1],dx,dz};
  for(const [a,b] of [[3.7,-3.1],[4.3,-3.4],[3.3,-3.7],[4.8,-3.0],[3.7,-2.6]]){const x=G[0]+dx*a+sx*b*cs,z=G[1]+dz*a+sz*b*cs;if(ok(x,z,.9)){R.park={x,z,ry:yawTo(x,z,G[0],G[1]),side:-cs};break}}
  if(!R.park){const x=G[0]+dx*3.7-sx*3.1*cs,z=G[1]+dz*3.7-sz*3.1*cs;R.park={x,z,ry:yawTo(x,z,G[0],G[1]),side:-cs}}
  // the route: the road from the start to ~12 steps before the gateway, then a curve to the parking spot
  const rt=[];for(let i=R.start;i<=N-13;i+=2)rt.push([P[i][0],P[i][1]]);
  {const e=P[N-13],m=[(e[0]+R.park.x)/2+sx*cs*-.8,(e[1]+R.park.z)/2+sz*cs*-.8];rt.push(m);
    const b=[R.park.x-Math.sin(R.park.ry)*1.6,R.park.z-Math.cos(R.park.ry)*1.6];rt.push(b);rt.push([R.park.x,R.park.z])}
  R.route=rt;
  // keep-out rings [x, z, r]: decorations (1680) and roaming groups (3023) stay clear
  {const c=at(1.5,-2.8);R.keep.push([c[0],c[1],12.5]);const w=at(1,2.8);R.keep.push([w[0],w[1],6.5])}
  R.lamps.forEach(o=>R.keep.push([o.x,o.z,1.7]));R.keep.push([R.park.x,R.park.z,3.4]);
  R.center=at(1,-1);R.at=at;
  return mq143Plan.c=R}
// 1680 place(): true = keep this decoration out (it is counted as placed so the seeded stream is unchanged)
function mq143Keep(g,x,z){if(g!==0)return false;try{const K=mq143Plan().keep;for(const k of K)if(Math.hypot(x-k[0],z-k[1])<k[2])return true}catch(e){if(!mq143Keep.e){mq143Keep.e=1;console.warn('v143 keep',e)}}return false}
// v151: Kindlelight I's camp beside the entrance stood where the outpost goes now. It moves to the nearest open side field
// (a branch-end clearing off the road, away from the entrance, the gateway and the other camps). Called from 0045 after every
// seeded step of the map (tiles, water, harvest nodes), so nothing else in the world moves; its old clearing stays open ground
// for the outpost. The camp keeps its number (design, theme, saves); its tiles lose water and harvest nodes like any camp site.
function mq151MoveCamp(m,props){try{const I=INSL[0];if(!I||!I.fld||!I.cl||!I.path)return;const P=I.path,N=P.length,C=P[mq151A(N)],d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  const j=I.cl.findIndex(c=>d(c,C)<26);if(j<0)return;
  const roadD=q=>{let b=1e9;for(let i=0;i<N;i+=2)b=Math.min(b,d(P[i],q));return b};
  const fits=(I.fd||[]).filter(f=>f[2]>=15&&roadD(f)>=24&&d(f,C)>=30&&d(f,I.en)>=45&&d(f,I.ba)>=40&&I.cl.every((c,k)=>k===j||d(c,f)>=40));
  if(!fits.length)return;const old=I.cl[j];fits.sort((a,b)=>d(a,old)-d(b,old));const f=fits[0],cx=Math.round(f[0]),cy=Math.round(f[1]);
  mq151MoveCamp.r={j,from:[old[0],old[1]],to:[cx,cy]};old[0]=cx;old[1]=cy; // in place: PMAP[0].cl holds the same record
  for(let y=cy-14;y<=cy+14;y++)for(let x=cx-14;x<=cx+14;x++)if(m[y]&&m[y][x]=='~'&&Math.hypot(x-cx,y-cy)<14)m[y][x]='a';
  for(let i=props.length-1;i>=0;i--){const q=props[i];if(Math.hypot(q[0]-cx,q[1]-cy)<14){if(m[q[1]][q[0]]=='r')m[q[1]][q[0]]='.';props.splice(i,1)}}
}catch(e){console.warn('v151 camp',e)}}
