// ================= v165 The Dirge main quest — the plan: two hidden places, the graves, the prisms =================
// The Dirge's main quest has three chapters, one per field instance (like Hillside Crest, v152–v155):
//  I   The Graveyard (3311): the gateway to II is gone. Graves stand scattered along the road; the weeping angel at the road's end
//      tells which one the Keeper sleeps in. Digging it up opens a stair down into
//      The Hidden Sanctum (special instance 'sanctum', g 33, 3313–3314): a one-time crypt of traps and timed puzzles whose last
//      chamber holds the flooded stair down into the Drowned Crypts (II).
//  II  The Drowned Crypts' gateway to III becomes a tunnel mouth over a flooded channel with a raft moored at its bank (3314).
//      Taking the raft down starts The Black Channel (special instance 'channel', g 34, 3315–3316): drowned dead rise from the
//      water and tear the raft apart plank by plank; reach the far end and you come out in the Ossuary Fields (III).
//  III The Ossuary Fields (3317): five glowing prisms; carry their essence, one charge at a time, to the five runes of the
//      Reliquary at the centre of the map. All five lit open the Den.
// Everything here is a pure function of numbers and the map: 0045 paints the two hidden places' ground (sp152Map / sp152Terrain,
// 3150) and 1680 keeps decorations off the graves and the prisms (dg165Keep) long before the rest of the script runs.
// Local coordinates: u = x - I.x0, v = z - I.y0 (tiles).

// ---------------- the Hidden Sanctum ----------------
// The floor stands at DG165S.F0 (the world's water plane is at y 0.02 and fills anything lower; the chasm drops to y 1).
function dg165SCfg(){return {F0:20,wall:7,pit:3.5}}
function dg165SanPlan(){if(dg165SanPlan.c)return dg165SanPlan.c;
  // rooms and corridors [u0, v0, u1, v1) and what they hold
  const R={
    entry:[68,8,92,30],          // the stair hall: you come down the stair at its north wall
    pend:[77,30,83,78],          // the Hall of Pendulums: five blades sweep across
    spike:[58,78,102,110],       // the Spike Hall: the floor's spikes rise in moving bands
    plate:[60,110,68,116],       // the antechamber: a pressure plate opens the far gate for a moment
    flame:[61,116,67,160],       // the Fire Walk: skull mouths in the walls breathe fire; the portcullis at its end
    chasm:[40,160,104,214],      // the Chasm: a bridge of slabs that crumble under your feet
    walls:[72,214,112,250],      // the Chamber of Closing Walls: four statues to turn before the walls meet
    gal:[88,250,96,286],         // the Ossuary Gallery
    tomb:[76,286,108,320]};      // the Keeper's Tomb and the flooded stair down
  const P={R,
    spawn:[80,12.5],                                                     // where you arrive at the foot of the stair
    // checkpoints: [u, v, facing (yaw), name]
    CP:[[80,13,0,'The Stair Hall'],[80,81,0,'The Spike Hall'],[64,112.5,0,'The Antechamber'],[64,162.6,0,'The Chasm'],[92,216.5,0,'The Closing Walls'],[92,254,0,'The Ossuary Gallery']],
    pend:[38,46,54,62,70].map((v,i)=>({v,w:[1.55,2.05,1.75,2.35,1.9][i],ph:[0,1.9,3.6,.8,2.7][i]})),
    // the spike grid: cells of 2×2 tiles over the hall floor (entry and exit strips stay safe)
    spk:{u0:58,u1:102,v0:82,v1:106,cs:2,step:.62,warn:.36},
    plate:[64,113.2],
    jets:[122,129,136,143,150].map((v,i)=>({v,side:i%2?1:-1,ph:i*.55})),jet:{per:2.9,on:1.25},
    gate:{v:158.5,u0:61,u1:67,open:16},
    // the chasm's bridge: a chain of 2×2 slabs from the entry ledge to the exit ledge
    ledgeA:[58,160,70,165],ledgeB:[86,207,98,214],
    bridge:(()=>{const L=[[64,167],[64,175],[72,175],[72,183],[84,183],[84,191],[76,191],[76,199],[92,199],[92,205]],out=[],seen={};
      for(let i=0;i<L.length-1;i++){const [a,b]=[L[i],L[i+1]],n=Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/2);for(let k=0;k<=n;k++){const u=a[0]+(b[0]-a[0])*k/n,v=a[1]+(b[1]-a[1])*k/n,key=u+'_'+v;if(seen[key])continue;seen[key]=1;out.push([u,v])}}
      return out})(),
    // the closing walls: start at the room's sides, meet at the middle; statues stand ±6 from the middle
    cw:{mid:92,half:20,stop:1.6,T:62,doorN:214,doorS:250},
    statues:[[92,225.5],[92,239.5],[88.5,232.5],[95.5,232.5]],altar:[92,232.5],   // north, south, west, east of the altar
    exit:[92,316.5],keeper:[92,300]};
  return dg165SanPlan.c=P}
// is (u, v) floor inside the sanctum (the chasm's pit is not; its ledges and bridge are)
function dg165SanFloor(u,v){const P=dg165SanPlan(),R=P.R;for(const k in R){const r=R[k];if(u>=r[0]&&v>=r[1]&&u<r[2]&&v<r[3]){
      if(k!='chasm')return k;const a=P.ledgeA,b=P.ledgeB;if(u>=a[0]&&v>=a[1]&&u<a[2]&&v<a[3])return 'ledge';if(u>=b[0]&&v>=b[1]&&u<b[2]&&v<b[3])return 'ledge';
      for(const s of P.bridge)if(u>=s[0]-1&&u<s[0]+1&&v>=s[1]-1&&v<s[1]+1)return 'bridge';return 'pit'}}return null}
function dg165SanctumMap(m,bio,DW,I,bi){const P=dg165SanPlan();
  for(let y=I.y0;y<I.y0+I.h;y++)for(let x=I.x0;x<I.x0+I.w;x++){if(!m[y])continue;const u=x-I.x0,v=y-I.y0,k=dg165SanFloor(u+.5,v+.5);bio[y][x]=bi;
    if(k&&k!='pit'){m[y][x]=(Math.sin(x*12.9898+y*78.233)*43758.5453%1+1)%1<.18?'a':'.';DW[y*W+x]=-2}else{m[y][x]='';DW[y*W+x]=k=='pit'?1:4}}}
function dg165SanctumTerrain(I){const C=dg165SCfg();
  // distance (in tiles, up to 6) from each solid tile to the nearest floor, for the walls' rise
  const w=I.w,h=I.h,fl=new Uint8Array(w*h),d=new Float32Array(w*h).fill(99);
  for(let v=0;v<h;v++)for(let u=0;u<w;u++){const k=dg165SanFloor(u+.5,v+.5);fl[v*w+u]=k=='pit'||k=='bridge'?2:k?1:0;if(k&&k!='pit'&&k!='bridge')d[v*w+u]=0}
  for(let it=0;it<7;it++)for(let v=1;v<h-1;v++)for(let u=1;u<w-1;u++){const i=v*w+u;if(d[i]===0)continue;const m=Math.min(d[i-1],d[i+1],d[i-w],d[i+w])+1;if(m<d[i])d[i]=m}
  for(let j=I.y0-2;j<I.y0+h+2;j++)for(let i=I.x0-2;i<I.x0+w+2;i++){const u=i-I.x0,v=j-I.y0,inn=u>=0&&v>=0&&u<w&&v<h,k=inn?v*w+u:-1;let y;
    if(k<0)y=C.F0+C.wall+2;
    else if(fl[k]==2)y=C.pit+(fbm2(i*.11,j*.11,3)-.5)*2;                         // the chasm
    else if(fl[k]==1)y=C.F0+(fbm2(i*.3,j*.3,2)-.5)*.06;                         // floor (the flagstones are meshes on top)
    else{const dd=Math.min(6,d[k]);y=C.F0+Math.min(C.wall+1.5,Math.max(0,dd-1)*2.6)+(dd>1?(fbm2(i*.2,j*.2,2)-.5)*.8:0)}  // rock between the rooms
    // the chasm's edge falls away: rock walls that drop into the dark under the ledges and along its sides
    HF[(j+HPD)*HW+i+HPD]=y}}

// ---------------- the Black Channel ----------------
// A flooded channel winding through drowned vaults: water half width DG165C.hw, a stone walk on each side, walls beyond.
// s runs along the channel (tiles, 0 at the mooring), o across it (+ = right of the flow).
function dg165CCfg(){return {hw:6.6,walk:2.2,deep:-2.7,walkY:.62,wall:10}}
function dg165ChPath(){if(dg165ChPath.c)return dg165ChPath.c;const I=sp152Defs().find(d=>d.key=='channel'),C=dg165CCfg();
  const K=[[22,38],[110,30],[210,44],[300,32],[364,50],[388,90],[366,132],[290,150],[190,140],[100,154],[34,146]].map(q=>[I.x0+q[0],I.y0+q[1]]);
  // Catmull-Rom through the control points, then resampled every tile of arc length
  const fx=[],fz=[];for(let i=0;i<K.length-1;i++){const p0=K[Math.max(0,i-1)],p1=K[i],p2=K[i+1],p3=K[Math.min(K.length-1,i+2)];
    for(let k=0;k<60;k++){const t=k/60,t2=t*t,t3=t2*t;fx.push(.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3));
      fz.push(.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3))}}
  fx.push(K[K.length-1][0]);fz.push(K[K.length-1][1]);
  const L=[0];for(let i=1;i<fx.length;i++)L.push(L[i-1]+Math.hypot(fx[i]-fx[i-1],fz[i]-fz[i-1]));const S=Math.floor(L[L.length-1]);
  const X=new Float32Array(S+1),Z=new Float32Array(S+1),TX=new Float32Array(S+1),TZ=new Float32Array(S+1);let j=0;
  for(let s=0;s<=S;s++){while(j<fx.length-2&&L[j+1]<s)j++;const a=(s-L[j])/Math.max(1e-6,L[j+1]-L[j]);X[s]=fx[j]+(fx[j+1]-fx[j])*a;Z[s]=fz[j]+(fz[j+1]-fz[j])*a}
  for(let s=0;s<=S;s++){const a=Math.max(0,s-3),b=Math.min(S,s+3),dx=X[b]-X[a],dz=Z[b]-Z[a],l=Math.hypot(dx,dz)||1;TX[s]=dx/l;TZ[s]=dz/l}
  const P={X,Z,TX,TZ,S,C,K,I};
  // world (x, z) at (s, o): o is to the right of the flow (the normal (-tz, tx) rotated: right = (-tz, tx) when looking along +s with +y up)
  P.at=(s,o)=>{s=Math.max(0,Math.min(S,s));const i=Math.min(S-1,Math.floor(s)),f=s-i,x=X[i]+(X[i+1]-X[i])*f,z=Z[i]+(Z[i+1]-Z[i])*f,tx=TX[i]+(TX[i+1]-TX[i])*f,tz=TZ[i]+(TZ[i+1]-TZ[i])*f,l=Math.hypot(tx,tz)||1;
    return [x-tz/l*(o||0),z+tx/l*(o||0)]};
  P.yaw=s=>{const i=Math.max(0,Math.min(S,s))|0;return Math.atan2(TX[i],TZ[i])};
  P.tan=s=>{const i=Math.max(0,Math.min(S,s))|0;return [TX[i],TZ[i]]};
  // nearest (s, o) to a world point, searched near a guess (cheap enough every frame for a few things)
  P.near=(x,z,s0)=>{let bs=0,bd=1e18;const a=s0==null?0:Math.max(0,Math.floor(s0-30)),b=s0==null?S:Math.min(S,Math.ceil(s0+30));
    for(let s=a;s<=b;s+=(s0==null?2:1)){const d=(X[s]-x)*(X[s]-x)+(Z[s]-z)*(Z[s]-z);if(d<bd){bd=d;bs=s}}const tx=TX[bs],tz=TZ[bs],dx=x-X[bs],dz=z-Z[bs];return [bs+dx*tx+dz*tz,-dx*tz+dz*tx]};
  return dg165ChPath.c=P}
// for every tile of the channel's rectangle: the nearest channel position (s) and the distance across (o, signed)
function dg165ChField(){if(dg165ChField.c)return dg165ChField.c;const P=dg165ChPath(),I=P.I,w=I.w,h=I.h,best=new Float32Array(w*h).fill(99),bs=new Float32Array(w*h).fill(-1),so=new Float32Array(w*h);
  for(let s=-14;s<=P.S+22;s+=.5){const sc=Math.max(0,Math.min(P.S,s)),ext=s<0?s:s>P.S?s-P.S:0,[tx,tz]=P.tan(sc);for(let o=-16;o<=16;o+=.5){let [x,z]=P.at(sc,o);x+=tx*ext;z+=tz*ext;
      const u=Math.round(x)-I.x0,v=Math.round(z)-I.y0;if(u<0||v<0||u>=w||v>=h)continue;const k=v*w+u,d=Math.abs(o);if(d<best[k]){best[k]=d;bs[k]=s;so[k]=o}}}
  return dg165ChField.c={best,bs,so,w,h}}
function dg165ChannelMap(m,bio,DW,I,bi){const C=dg165CCfg(),F=dg165ChField();
  for(let y=I.y0;y<I.y0+I.h;y++)for(let x=I.x0;x<I.x0+I.w;x++){if(!m[y])continue;const k=(y-I.y0)*F.w+(x-I.x0),d=F.best[k];bio[y][x]=bi;
    if(d<=C.hw){m[y][x]='~';DW[y*W+x]=-1}else if(d<=C.hw+C.walk){m[y][x]=((x*7+y*13)%9)<2?'a':'.';DW[y*W+x]=-.8}else{m[y][x]='';DW[y*W+x]=Math.min(6,d-C.hw-C.walk)}}}
function dg165ChannelTerrain(I){const C=dg165CCfg(),F=dg165ChField(),P=dg165ChPath();
  for(let j=I.y0-2;j<I.y0+I.h+2;j++)for(let i=I.x0-2;i<I.x0+I.w+2;i++){const u=i-I.x0,v=j-I.y0,inn=u>=0&&v>=0&&u<F.w&&v<F.h,k=inn?v*F.w+u:-1,d=k<0?99:F.best[k],s=k<0?0:F.bs[k];let y;
    if(d<C.hw-1.2)y=C.deep+(fbm2(i*.15,j*.15,3)-.5)*.8;
    else if(d<C.hw)y=C.deep+(C.walkY-C.deep)*Math.pow((d-(C.hw-1.2))/1.2,1.6);
    else if(d<C.hw+C.walk)y=C.walkY+(fbm2(i*.4,j*.4,2)-.5)*.05;
    else y=C.walkY+Math.min(C.wall,(d-C.hw-C.walk)*3.2)+(fbm2(i*.1,j*.1,3)-.5)*2.5;
    // the landing at the far end: a beach of bone and shingle rising out of the water
    if(s>P.S-6&&k>=0){const e=s-(P.S-6);if(d<C.hw+C.walk+4)y=Math.max(y,C.deep+e*.45)}
    HF[(j+HPD)*HW+i+HPD]=y}}

// ---------------- the graves of the Dirge I ----------------
// Fourteen graves off the road, alternating sides. Each has a headstone (shape), an emblem and something left on it; the weeping
// angel at the road's end names three marks, and only the Keeper's grave (DG165G.K) has all three.
function dg165GD(){return dg165GD.c||(dg165GD.c={K:9,clue:{stone:'broken',emb:'raven',ext:'candles'},
  F:[['slab','skull','lilies'],['broken','rose','candles'],['cross','raven','chains'],['obelisk','hourglass','candles'],['broken','raven','lilies'],['slab','bell','cage'],
     ['cross','skull','candles'],['broken','hourglass','lantern'],['obelisk','raven','candles'],['broken','raven','candles'],['slab','rose','chains'],['cross','raven','lantern'],
     ['broken','skull','candles'],['obelisk','bell','lilies']],
  N:[['Maud Ashgrove','1061 – 1103','She sang to the drowned, and they listened.'],['Corwin Thale','1012 – 1060','Taken by the fever. Mourned by none.'],
     ['Ilse Marrow','1077 – 1094','Bright as a lamp, and as soon put out.'],['Osric Fenn','998 – 1049','Sexton of the Dirge. He dug his own.'],
     ['Agathe Rook','1040 – 1088','Her ravens came to the burying.'],['Little Pell','1101','Bound fast, that he might not wander.'],
     ['Sir Hadrian Coyle','1003 – 1046','He kept his oath past dying.'],['Wenna Grist','1058 – 1102','The hour came, as hours do.'],
     ['Tobias Slate','1020 – 1077','Lie still, Tobias. Lie still.'],['Brother Aldous Vane','Keeper of the Low Sanctum','What lies below, I keep.'],
     ['Eda & Bram Holloway','1066 – 1090','Chained together, as in life.'],['Mother Ysolde','1031 – 1099','Her lantern still walks the paths at night.'],
     ['Garrick Hume','1050 – 1095','Hanged at the crossroads. Buried here by mercy.'],['Sister Merel','1080 – 1104','The bell tolled once, and she was gone.']]})}
var DG165G=dg165GD();
function dg165GravePlan(){if(dg165GravePlan.c)return dg165GravePlan.c;
  const I=INSL[20],P=I.path,N=P.length,DW=MAP.DW;
  const props=new Set();try{MAP.props.forEach(q=>props.add(q[1]*W+q[0]))}catch(_){}
  const ok=(x,z,m)=>{const X=Math.round(x),Z=Math.round(z);if(X<1||Z<1||X>=W-1||Z>=H-1)return false;const t=MAP[Z]&&MAP[Z][X];
    if(!t||t=='#'||t=='r'||t=='~'||t=='R'||props.has(Z*W+X))return false;const J=insAt(X,Z);if(!J||J.g!==20)return false;return DW[Z*W+X]<-(m==null?1.2:m)};
  const tan=i=>{const a=P[Math.max(0,i-3)],b=P[Math.min(N-1,i+3)];let dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;return [dx/L,dz/L]};
  const roadD=(x,z)=>{let d=1e9;for(let i=0;i<N;i+=2){const q=P[i];d=Math.min(d,Math.hypot(x-q[0],z-q[1]))}return d};
  const avoid=[[I.en[0],I.en[1],16],[I.ba[0],I.ba[1],PM_GTR+6]].concat(typeof cs164Avoid=='function'?cs164Avoid(I,14):(I.cl||[]).map(c=>[c[0],c[1],14]));
  const D=dg165GD(),G=[],n=D.F.length;
  for(let j=0;j<n;j++){const f=.07+j*(.86/(n-1)),ix=Math.round((N-1)*f),sd=j%2?-1:1;let got=null;
    for(const T of [{m:2.6,road:6.5,sep:13},{m:1.8,road:5.5,sep:10},{m:1.2,road:4.5,sep:7}]){if(got)break;
      for(const b of [8,9.5,7,11,12.5,6.5,14])for(const side of [sd,-sd])for(const da of [0,4,-4,8,-8,13,-13,18,-18]){if(got)break;
        const k=Math.max(0,Math.min(N-1,ix+da)),q=P[k],t=tan(k),x=q[0]-t[1]*b*side,z=q[1]+t[0]*b*side;
        if(!ok(x,z,T.m)||!ok(x+1.2,z,T.m*.6)||!ok(x-1.2,z,T.m*.6)||!ok(x,z+1.6,T.m*.6)||!ok(x,z-1.6,T.m*.6)||roadD(x,z)<T.road)continue;
        if(!avoid.every(([px,pz,r])=>Math.hypot(x-px,z-pz)>=r))continue;if(!G.every(o=>Math.hypot(x-o.x,z-o.z)>=T.sep))continue;
        got={x:Math.round(x*2)/2,z:Math.round(z*2)/2,ix:k,ry:Math.atan2(q[0]-x,q[1]-z)}}}
    if(!got){const q=P[ix],t=tan(ix);got={x:q[0]-t[1]*6*sd,z:q[1]+t[0]*6*sd,ix,ry:Math.atan2(t[1]*sd,-t[0]*sd),fb:1}}
    const F=D.F[j],Nm=D.N[j];G.push(Object.assign(got,{i:j,stone:F[0],emb:F[1],ext:F[2],name:Nm[0],date:Nm[1],epi:Nm[2]}))}
  return dg165GravePlan.c={G,keep:G.map(o=>[o.x,o.z,3.6])}}

// ---------------- the prisms and the Reliquary of the Ossuary Fields (III) ----------------
function dg165PrismPlan(){if(dg165PrismPlan.c)return dg165PrismPlan.c;
  const I=INSL[22],P=I.path,N=P.length,DW=MAP.DW;
  const props=new Set();try{MAP.props.forEach(q=>props.add(q[1]*W+q[0]))}catch(_){}
  const ok=(x,z,m)=>{const X=Math.round(x),Z=Math.round(z);if(X<1||Z<1||X>=W-1||Z>=H-1)return false;const t=MAP[Z]&&MAP[Z][X];
    if(!t||t=='#'||t=='r'||t=='~'||t=='R'||props.has(Z*W+X))return false;const J=insAt(X,Z);if(!J||J.g!==22)return false;return DW[Z*W+X]<-(m==null?1.2:m)};
  const ring=(x,z,r,need,m)=>{let n=0;for(let k=0;k<16;k++){const a=k/16*6.283;if(ok(x+Math.cos(a)*r,z+Math.sin(a)*r,m))n++}return n>=need};
  const tan=i=>{const a=P[Math.max(0,i-3)],b=P[Math.min(N-1,i+3)];let dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;return [dx/L,dz/L]};
  const roadD=(x,z)=>{let d=1e9;for(let i=0;i<N;i+=2){const q=P[i];d=Math.min(d,Math.hypot(x-q[0],z-q[1]))}return d};
  const camps=typeof cs164Avoid=='function'?cs164Avoid(I,16):(I.cl||[]).map(c=>[c[0],c[1],16]);
  // the Reliquary: the open ground nearest the middle of the map, beside the road (the road passes its steps)
  const cx=I.x0+I.w/2,cz=I.y0+I.h/2;let ctr=null,bd=1e9;
  for(const T of [{R:11,need:15,m:1.2},{R:10,need:13,m:.8},{R:9,need:11,m:.5}]){if(ctr)break;
    for(let i=4;i<N-4;i+=2){const q=P[i],t=tan(i);for(const side of [1,-1])for(const b of [12,14,16,18,11,20]){const x=q[0]-t[1]*b*side,z=q[1]+t[0]*b*side;
      if(!ok(x,z,2.5)||!ring(x,z,T.R,T.need,T.m)||!ring(x,z,T.R*.55,16,T.m))continue;if(Math.hypot(x-I.en[0],z-I.en[1])<40||Math.hypot(x-I.ba[0],z-I.ba[1])<36)continue;
      if(!camps.every(([px,pz,r])=>Math.hypot(x-px,z-pz)>=r+T.R))continue;const d=Math.hypot(x-cx,z-cz);if(d<bd){bd=d;ctr={x:Math.round(x),z:Math.round(z),ix:i,ry:Math.atan2(q[0]-x,q[1]-z)}}}}}
  if(!ctr){const i=Math.round(N/2),q=P[i];ctr={x:q[0],z:q[1],ix:i,ry:0,fb:1}}
  const pr=[];const fr=[.1,.28,.47,.66,.86];
  for(let j=0;j<5;j++){const ix=Math.round((N-1)*fr[j]),sd=j%2?-1:1;let got=null;
    for(const T of [{m:2.4,road:9,sep:34,c:34},{m:1.8,road:7,sep:26,c:28},{m:1.2,road:5,sep:18,c:22}]){if(got)break;
      for(const b of [15,18,12,21,24,10])for(const side of [sd,-sd])for(const da of [0,6,-6,12,-12,18,-18]){if(got)break;const k=Math.max(0,Math.min(N-1,ix+da)),q=P[k],t=tan(k),x=q[0]-t[1]*b*side,z=q[1]+t[0]*b*side;
        if(!ok(x,z,T.m)||!ring(x,z,4,12,.6)||roadD(x,z)<T.road)continue;if(Math.hypot(x-ctr.x,z-ctr.z)<T.c||Math.hypot(x-I.en[0],z-I.en[1])<18||Math.hypot(x-I.ba[0],z-I.ba[1])<20)continue;
        if(!camps.every(([px,pz,r])=>Math.hypot(x-px,z-pz)>=r))continue;if(!pr.every(o=>Math.hypot(x-o.x,z-o.z)>=T.sep))continue;got={x:Math.round(x*2)/2,z:Math.round(z*2)/2,ix:k}}}
    if(!got){const q=P[ix],t=tan(ix);got={x:q[0]-t[1]*7*sd,z:q[1]+t[0]*7*sd,ix,fb:1}}got.i=j;pr.push(got)}
  const keep=[[ctr.x,ctr.z,13]].concat(pr.map(o=>[o.x,o.z,4.4]));
  return dg165PrismPlan.c={ctr,pr,keep,ok}}
// 1680 place() and the camps' dressing (3242): keep decorations off the graves, the Reliquary and the prisms
function dg165Keep(g,x,z){if(g!==20&&g!==22)return false;try{const L=g===20?dg165GravePlan().keep:dg165PrismPlan().keep;for(const k of L)if(Math.abs(x-k[0])<k[2]&&Math.abs(z-k[1])<k[2]&&Math.hypot(x-k[0],z-k[1])<k[2])return true}
  catch(e){if(!dg165Keep.e){dg165Keep.e=1;console.warn('v165 keep',e)}}return false}
