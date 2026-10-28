// ================= v164: camps — much larger, set into the land, far more detail (1/3: the plan) =================
// Owner: "make each camp much larger and make them feel more integrated in the map with much more detail, structures and
// landscape and accessories."
// The 54 field camps (v123) sat in a 17-tile walkable clearing with radius C.r 8..16 on a levelled disc. v164:
//   * size: each camp wants cs164Rd(r123) = 1.9 r + 2 (18..30 tiles). cs164Sites works out what fits where the camp stands
//     (instance edge, gateway clearing, entrance, the Lantern Road outpost, the other camps of the instance) and, when a camp
//     cannot grow enough, nudges it up to 12 tiles to a roomier spot (like v151 mq151MoveCamp); never smaller than v123.
//     The result is a pure function of the map data (co-op partners build the same camps). Instance II's camp furthest from the
//     entrance stays the furthest (the Glowmire Warren hatch, mq144Camp).
//   * clearing: cs164Grow (from 0045, after every seeded map step: v112Map has drawn II and III) stamps a bigger, lobed
//     walkable clearing (r + 2, three lobes reaching ~1.07 r + 2) at the final spot, turns the new ground walkable, redraws the
//     rim, clears water and harvest nodes inside the camp. The old clearing stays open ground.
//   * ground (cs123Terrain, replaced): the v123 shape (bowls, mounds, tiers, spires...) shapes the core (rc ≈ 1–1.25 r123), the
//     settlement ring is levelled, an earth bank rises outside the fence line for fortified camps (gaps at the gates), soft
//     hummocks roll through the outskirts and everything blends into the natural ground out to r + 7; the trail from the
//     nearest road to the camp's gate is ramped smooth.
//   * tiles (cs123Map, replaced): the core keeps its v123 ground tile, the settlement ring is trodden bare ground fading into
//     grass toward the outskirts, the trail and the gates are dirt.
//   * camp records (cs123Setup, replaced): C.r = the v164 radius (campAt, the map circle, box breaking, keep-out rings all follow),
//     C.r0 the v123 radius, C.rc the core, C.rf the fence ring, C.site the plan, C.sp the garrison spread (.42 r, 6.5..12).
// The kit, the merge and the layers that dress the camp are in 3241 and 3242. Hoisted functions only: 0045, 0250 and 1680 call
// them long before this file runs (no top-level const / let / var state here).

function cs164S(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)} // smoothstep (0045's smt is not there yet during the map build)
function cs164Rd(r){return Math.max(18,Math.min(30,Math.round(r*1.9+2)))}
// the fence-ring share of the radius and the earth bank height for each fort kind
function cs164Fort(k){return ({palis:[.8,.6],stakes:[.8,.45],stone:[.8,.5],ruin:[.8,.4],ice:[.8,.5],iron:[.8,.3],bone:[.8,.28],hedge:[.8,.25],root:[.82,0],reed:[.82,0],none:[.84,0]})[k]||[.84,0]}
// the recipe of camp 'z_k_j' (3242 reads the dwellings, works and outskirts; the plan only needs the fort kind)
function cs164Rec(key){const T=cs164Rec.T||(cs164Rec.T=cs164RecTable());const s=T[key];if(!s)return {f:'none',d:[],w:[],o:[],c:[],l:[]};
  if(typeof s!='string')return s;const R={f:'none',d:[],w:[],o:[],c:[],l:[]};
  s.split('|').forEach(p=>{const i=p.indexOf(':'),k=p.slice(0,i),v=p.slice(i+1);if(k=='f')R.f=v;else if(k=='c')R.c=v.split(',');else if(k=='l')R.l=v.split(',').map(h=>parseInt(h,16));
    else R[k]=v.split(',').filter(Boolean).map(q=>{const m=q.match(/^([a-zA-Z_]+)(\d*)$/);return [m[1],m[2]?+m[2]:1]})});
  return T[key]=R}
// f fort · d dwellings · w works · o outskirts · c ground clutter · l light colours (main fire, gate)
function cs164RecTable(){return {
  // Kindlelight I (dark fungal woods; lantern-bearers' camps the creatures overran)
  '0_0_0':'f:root|d:ctent3,lean|w:stores2,bedroll2,crate|o:lantern6,fungus8,deadtree4,debris2|c:bones,goo,planks|l:ffb050',
  '0_0_1':'f:none|d:burrow5,carcass2|w:eggs3,bonepile|o:fungus10,deadtree4,lantern3,roots3|c:bones,grubs|l:ffb050',
  '0_0_2':'f:reed|d:stilt2,ctent2|w:boardwalk,stores,nets|o:lantern5,reeds8,deadtree4,log2|c:planks,bones|l:ffb050',
  // Kindlelight II (the Glowmire Hollows: caverns of teal fungus)
  '0_1_0':'f:none|d:burrow3|w:crystals4,eggs2,bonepile|o:fungus10,stalag8,lantern3|c:bones,goo|l:5affb0',
  '0_1_1':'f:root|d:cocoon6|w:eggs3,web2|o:fungus8,stalag6,roots3|c:bones,husk|l:9affb8',
  '0_1_2':'f:none|d:burrow4|w:stores,eggs2,crystals2|o:fungus12,lantern4,stalag6|c:bones,fungi|l:ffb050',
  // Kindlelight III (the Rotwood)
  '0_2_0':'f:root|d:ctent2,lean|w:stores,bedroll2,woodpile|o:deadtree8,fungus8,log4,lantern3|c:bones,moss|l:ffb050',
  '0_2_1':'f:none|d:resin6|w:eggs3,crystals2|o:deadtree6,stump6,fungus6|c:chips,husk|l:ffb040',
  '0_2_2':'f:root|d:lean2|w:totem2,altar,candles2|o:deadtree8,fungus8,lantern3,roots3|c:bones,moss|l:ff5a3a',
  // Hillside Crest I (the serpent folk's plains)
  '1_0_0':'f:palis|d:hall2,tent6|w:spit,rack3,forge,stores3,bedroll3,drum,totem2|o:tower2,stakes3,banner4,hay3|c:planks,spears,bones|l:ff8a3a,ffa040',
  '1_0_1':'f:stone|d:pavilion2,tent2|w:altar2,totem2,brazier3,stores|o:obelisk4,banner3,cairn3,flowers4|c:pots,candles|l:ffa040',
  '1_0_2':'f:palis|d:tent4,hut|w:target4,rack2,stores2,bedroll2,spit|o:tower3,post2,stakes4,hay4|c:arrows,planks|l:ff8a3a',
  // Hillside Crest II (Mistmere)
  '1_1_0':'f:reed|d:stilt3|w:boardwalk2,nets2,stores|o:reeds12,post,log3|c:planks,shells|l:ffc060',
  '1_1_1':'f:none|d:mudnest4|w:carcass3,boat|o:log6,reeds10,deadtree3|c:bones,planks|l:ff8a3a',
  '1_1_2':'f:ruin|w:altar,boardwalk2,brazier2|o:ruincol6,reeds10,obelisk2|c:rubble,pots|l:80ffd0',
  // Hillside Crest III (the Galecliffs)
  '1_2_0':'f:none|d:nest2|w:statue4,bonepile|o:rocks8,cairn3,debris3|c:bones,shards|l:ffd040',
  '1_2_1':'f:none|d:shell4|w:carcass|o:rocks10,reeds6,log3|c:shells,pebbles|l:ffc060',
  '1_2_2':'f:stakes|d:ctent2|w:carcass2,stores,bedroll|o:rocks10,debris4,cairn2|c:bones,planks|l:ff8a3a',
  // Burningeye Summit I (snow and ice)
  '2_0_0':'f:stone|d:lean2,yurt2|w:spit,bonepile2,woodpile2,stores2,meat2|o:cairn4,totem2,snowdrift6,rocks6|c:bones,snow|l:ff7a2a',
  '2_0_1':'f:none|d:snowhut2|w:meat2,bonepile,carcass|o:ice8,snowdrift8,deadtree3|c:bones,snow|l:9ad8ff',
  '2_0_2':'f:ice|d:yurt3|w:altar2,totem2,brazier2|o:iceob4,ice6,snowdrift6|c:snow,runes|l:6ad0ff',
  // Burningeye II (the Rimecaverns)
  '2_1_0':'f:none|d:shell4|w:eggs3,web2|o:ice10,stalag6|c:snow,shards|l:6ad0ff',
  '2_1_1':'f:bone|d:lean2|w:meat4,bonepile2,spit,cage2|o:antler4,ice6,deadtree4|c:bones,blood|l:ff7a2a',
  '2_1_2':'f:ice|d:snowhut2|w:stores|o:ice10,stalag6,snowdrift6|c:snow,shards|l:9ad8ff',
  // Burningeye III (Stormcrown)
  '2_2_0':'f:stakes|d:hall2,yurt2|w:forge,spit,rack2,stores3,woodpile2|o:tower2,cairn4,banner3,snowdrift6|c:bones,planks|l:ff7a2a,ffa040',
  '2_2_1':'f:none|d:nest4|w:bonepile2|o:rocks10,cairn3,feathers|c:feathers,bones|l:ffc060',
  '2_2_2':'f:stone|d:yurt3|w:altar,totem3,brazier2|o:rod4,cairn4,snowdrift4|c:shards,runes|l:bfe8ff',
  // Searing Sands I (desert)
  '3_0_0':'f:stakes|d:burrow4,ctent2|w:husks3,stores,spit,bonepile|o:rocks8,cactus6,bones4,ribs2,cairn3|c:bones,husk|l:ffa030',
  '3_0_1':'f:ruin|d:pavilion2|w:stores2,cart,brazier2|o:ruincol8,obelisk2,cactus4|c:rubble,pots|l:ff8a2a',
  '3_0_2':'f:none|d:ctent2|w:cart2,stores|o:bones6,cactus6,rocks4|c:bones,planks|l:ffa030',
  // Searing Sands II (the Sunken Temple)
  '3_1_0':'f:ruin|d:pavilion3|w:altar2,brazier4,stores|o:obelisk4,ruincol6,statue2|c:pots,rubble|l:ffa040',
  '3_1_1':'f:none|d:burrow3|w:eggs4,dung3|o:rocks6,ruincol4,cactus3|c:husk,pebbles|l:ffa030',
  '3_1_2':'f:stone|d:tomb3,pavilion2|w:altar,brazier3,urns3|o:obelisk4,statue2,ruincol4|c:pots,bones|l:ffa040',
  // Searing Sands III (the Salt Wastes)
  '3_2_0':'f:none|d:ctent2|w:cart,stores|o:saltpillar8,rocks6,bones3|c:salt,bones|l:ffc060',
  '3_2_1':'f:stakes|d:ctent2|w:stores,carcass|o:bones6,rocks8,ribs2|c:bones,planks|l:ff8a2a',
  '3_2_2':'f:none|d:pavilion3|w:stores2,cart|o:palm8,rocks6,cactus3|c:pots,planks|l:ffc060',
  // The Dirge I (graves)
  '4_0_0':'f:iron|d:tomb2|w:graves8,coffin3|o:deadtree6,skull4,lantern4|c:bones,planks|l:9affe8',
  '4_0_1':'f:bone|d:lean2,hut|w:meat3,bonepile3,cage2,spit|o:skull6,deadtree4|c:bones,blood|l:ff7a3a',
  '4_0_2':'f:bone|d:tomb2|w:pyre2,graves4,altar|o:skull6,deadtree4,lantern3|c:bones,skulls|l:9affe8',
  // The Dirge II (the Drowned Crypts)
  '4_1_0':'f:ruin|d:tomb2|w:boardwalk2,coffin2|o:ruincol6,lantern4,reeds6|c:bones,planks|l:9affe8',
  '4_1_1':'f:none|w:graves6,candles3|o:lantern5,reeds8,deadtree3|c:bones,candles|l:9affe8',
  '4_1_2':'f:none|w:boardwalk2,coffin2,stores|o:ruincol6,lantern3,reeds8|c:rubble,bones|l:9affe8',
  // The Dirge III (the Ossuary Fields)
  '4_2_0':'f:stone|d:tomb|w:graves8,pyre|o:deadtree6,skull6,ribs2|c:bones,rubble|l:9affe8',
  '4_2_1':'f:bone|d:kennel3|w:cage2,bonepile2,meat|o:skull6,deadtree4|c:bones,chains|l:ff7a3a',
  '4_2_2':'f:stakes|d:tomb|w:pyre2,bonepile3|o:skull14,deadtree4,banner2|c:skulls,bones|l:9affe8',
  // The Citadel I (crimson ruins)
  '5_0_0':'f:iron|d:pavilion2,tent2|w:altar2,candles4,brazier2,cage|o:ruincol6,banner4,obelisk2|c:candles,bones|l:ff2040,ff6a40',
  '5_0_1':'f:none|w:bonepile,cage2|o:deadtree8,ruincol4,rocks6|c:bones,guano|l:ff2040',
  '5_0_2':'f:ruin|d:hall2,tent4|w:rack4,forge,dummy3,stores3,bedroll3,table2|o:tower2,banner4,stakes2|c:planks,shields|l:ff5a2a,ff6a40',
  // The Citadel II (the Outer Ramparts' siege camp)
  '5_1_0':'f:none|d:tent3|w:stores2,rack,brazier2|o:ruincol8,banner3,debris3|c:rubble,planks|l:ff4a2a',
  '5_1_1':'f:iron|d:kennel4|w:cage3,meat2,stores|o:ruincol4,banner2,stakes2|c:bones,chains|l:ff4a2a',
  '5_1_2':'f:stakes|d:tent5,hall|w:catapult,rack3,stores3,forge,bedroll4,spit|o:tower2,banner4,ruincol4|c:rubble,planks,spears|l:ff5a2a,ff6a40',
  // The Citadel III (the Inner Keep)
  '5_2_0':'f:iron|d:tent2|w:cage3,rack,brazier3,pyre|o:ruincol6,banner4,skull4|c:blood,planks|l:ff4a2a',
  '5_2_1':'f:iron|d:tomb2|w:coffin3,graves6,candles3|o:deadtree6,ruincol4,lantern3|c:bones,rubble|l:ff6a40',
  '5_2_2':'f:hedge|d:pavilion|w:statue3,bench2,brazier2|o:roses10,ruincol4,deadtree3|c:petals,rubble|l:ff4a2a'}}

// ---------------- where each camp stands and how big it is ----------------
// cs164Sites()[g] = [{j, x, y, r, r0, rc, rf, rd, ang, gates:[angles], gaps:[[a0,a1]], trail:[[x,y]...] (world tiles) or null}]
function cs164Sites(){if(cs164Sites.S)return cs164Sites.S;const DW0=cs164Sites.DW||(typeof MAP!='undefined'&&MAP&&MAP.DW)||null,S={},P123=cs123Plan(),d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  INSL.forEach(I=>{if(!I.fld||!I.cl||!I.cl.length||!I.path)return;const P=I.path,N=P.length,e1=P[16]||I.en,out=I.g===0&&typeof mq151A=='function'?P[mq151A(N)]:null;
    const L=I.cl.map((c,j)=>{const D=P123[I.z+'_'+I.k+'_'+j],r0=D?D.r:12;return {j,c,r0,rd:cs164Rd(r0),x:Math.round(c[0]),y:Math.round(c[1])}});
    const solo=(x,y)=>{const e=Math.min(x-I.x0,I.x0+I.w-1-x,y-I.y0,I.y0+I.h-1-y);let r=(e-10)/1.12;
      r=Math.min(r,d([x,y],I.ba)-PM_GTR-8,d([x,y],I.en)-14,d([x,y],e1)-14);if(out)r=Math.min(r,d([x,y],out)-20);return r};
    const share=(o,x,y)=>{let r=1e9;L.forEach(q=>{if(q!==o)r=Math.min(r,(d([x,y],[q.x,q.y])-8)*o.rd/(o.rd+q.rd))});return r};
    const far=()=>{let b=-1,bd=-1;L.forEach(o=>{const v=d([o.x,o.y],I.en);if(v>bd){bd=v;b=o.j}});return b},f0=far();
    // a camp that cannot reach its size where it stands moves up to 21 tiles (36 when it could hardly grow at all) to the roomiest nearby spot (moving costs a little)
    L.forEach(o=>{const sc=(x,y)=>Math.min(o.rd,solo(x,y),share(o,x,y));const s0=sc(o.x,o.y);if(s0>=o.rd)return;let bs=s0,bx=o.x,by=o.y;
      const far2=s0<o.r0*1.5?36:21;for(let rr=3;rr<=far2;rr+=3)for(let k=0;k<20;k++){const a=k/20*6.2832+rr*.37,x=Math.round(o.x+Math.cos(a)*rr),y=Math.round(o.y+Math.sin(a)*rr);
        if(insAt(x,y)!==I||(out&&d([x,y],out)<32)||(DW0&&!(DW0[y*W+x]<-5)))continue; /* only to open ground (the camp stays joined to the road) */const v=sc(x,y)-.18*rr;if(v>bs+.01){bs=v;bx=x;by=y}}
      if(bs>=s0+1.5){o.x=bx;o.y=by}});
    if(I.g===1&&far()!==f0)L.forEach(o=>{o.x=Math.round(o.c[0]);o.y=Math.round(o.c[1])}); // keep the camp furthest from the entrance (v144 hatch)
    // radii: what fits alone, then pairs that crowd each other give back what they grew, in proportion
    L.forEach(o=>{o.r=Math.max(o.r0,Math.min(o.rd,solo(o.x,o.y)))});
    for(let it=0;it<6;it++)L.forEach(o=>L.forEach(q=>{if(q.j<=o.j)return;const ex=o.r+q.r+8-d([o.x,o.y],[q.x,q.y]);if(ex<=0)return;
      const fo=Math.max(0,o.r-o.r0),fq=Math.max(0,q.r-q.r0),t=fo+fq;if(!t)return;o.r=Math.max(o.r0,o.r-ex*fo/t);q.r=Math.max(q.r0,q.r-ex*fq/t)}));
    L.forEach(o=>{o.r=Math.floor(o.r*2)/2;o.moved=o.x!==Math.round(o.c[0])||o.y!==Math.round(o.c[1]);o.c[0]=o.x;o.c[1]=o.y; // in place: PMAP[z].cl holds the same records
      o.rc=Math.max(o.r0,Math.min(o.r0*1.15,o.r*.5));o.key=I.z+'_'+I.k+'_'+o.j;o.fk=cs164Rec(o.key).f;o.rf=Math.max(o.rc+3,o.r*cs164Fort(o.fk)[0]);
      o.ang=cs123Ang(o.x,o.y);o.sd=1+Math.floor(cs123H(o.x+.5,o.y-.5)*2e6);cs164Gates(I,o)});
    S[I.g]=L});
  return cs164Sites.S=S}
// the gates: where the road crosses the fence ring (the road always stays open), else one toward the nearest road point with a
// trail out to it and a back gate on the far side
// the road and its side branches as points about 2 tiles apart (gates, trails and the dressing keep them open)
function cs164Road(I){if(I.v164rd)return I.v164rd;const L=[];I.path.forEach((q,i)=>{if(i%2==0)L.push([q[0],q[1]])});
  (I.br||[]).forEach(l=>{for(let k=0;k<l.length-1;k++){const [ax,ay]=l[k],[bx,by]=l[k+1],n=Math.ceil(Math.hypot(bx-ax,by-ay)/2);for(let q=0;q<=n;q++)L.push([ax+(bx-ax)*q/n,ay+(by-ay)*q/n])}});
  return I.v164rd=L}
function cs164Gates(I,o){const P=cs164Road(I),N=P.length,DW=cs164Sites.DW,rd=(x,y)=>{let b=1e9;for(let i=0;i<N;i++){const q=P[i],v=(q[0]-x)*(q[0]-x)+(q[1]-y)*(q[1]-y);if(v<b)b=v}return Math.sqrt(b)};
  const n=96,bl=[];for(let k=0;k<n;k++){const a=k/n*6.2832;bl.push(rd(o.x+Math.cos(a)*o.rf,o.y+Math.sin(a)*o.rf)<4.6)}
  o.gaps=[];o.gates=[];o.trail=null;
  if(bl.some(v=>v)&&!bl.every(v=>v)){let s=bl.indexOf(false);for(let i=0;i<n;i++){const k=(s+i)%n;if(bl[k]&&!bl[(k+n-1)%n]){let e=k;while(bl[(e+1)%n]&&e-k<n)e++;
      const a0=k/n*6.2832-.04,a1=e/n*6.2832+.04;o.gaps.push([a0,a1]);o.gates.push((a0+a1)/2)}}}
  else if(!bl.some(v=>v)){let bi=0,bd=1e9;for(let i=0;i<N;i++){const v=Math.hypot(P[i][0]-o.x,P[i][1]-o.y);if(v<bd){bd=v;bi=i}}
    const Q=P[bi],ga=Math.atan2(Q[1]-o.y,Q[0]-o.x);o.gates.push(ga,ga+Math.PI+(cs123H(o.y,o.x)-.5));
    // a trail out to it over walkable ground (a breadth-first search from the gate to the nearest road tile, then smoothed)
    if(bd>o.rf+3&&DW)o.trail=cs164Trail(I,o,ga,rd);}
  return o}
function cs164Trail(I,o,ga,rd){const sx=Math.round(o.x+Math.cos(ga)*(o.rf+1.5)),sy=Math.round(o.y+Math.sin(ga)*(o.rf+1.5)),DW=cs164Sites.DW,R=70,S=2*R+1,prev=new Int32Array(S*S).fill(-1);
  const ok=(x,y)=>insAt(x,y)===I&&(DW[y*W+x]<-1.6||Math.hypot(x-o.x,y-o.y)<o.r),id=(x,y)=>(y-sy+R)*S+(x-sx+R);if(!ok(sx,sy))return null;const q=[sx,sy];prev[id(sx,sy)]=id(sx,sy);let end=null;
  for(let h=0;h<q.length&&!end;h+=2){const x=q[h],y=q[h+1];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const X=x+dx,Y=y+dy;if(Math.abs(X-sx)>R||Math.abs(Y-sy)>R)continue;const k=id(X,Y);
    if(prev[k]>=0||!ok(X,Y)||Math.hypot(X-o.x,Y-o.y)<o.rf)continue;prev[k]=id(x,y);if(rd(X,Y)<2.5){end=[X,Y];break}q.push(X,Y)}}
  if(!end)return null;const P=[];let k=id(end[0],end[1]);for(let n=0;n<4*R*R;n++){const x=k%S-R+sx,y=Math.floor(k/S)-R+sy;P.push([x,y]);if(prev[k]===k)break;k=prev[k]}P.reverse();
  if(P.length<4)return null;let T=P.filter((q,i)=>i%2==0||i==P.length-1).map(q=>q.slice());for(let it=0;it<3;it++)T=T.map((q,i)=>i&&i<T.length-1?[(T[i-1][0]+q[0]*2+T[i+1][0])/4,(T[i-1][1]+q[1]*2+T[i+1][1])/4]:q);
  return T}
function cs164Site(I,j){const S=cs164Sites();return S[I.g]&&S[I.g][j]||null}
// keep-out rings for later placements that avoid camps (sigils 3040, caches 3160, chime stones 3170): [x, y, camp radius + 3]
function cs164Avoid(I,r0){return (I.cl||[]).map((c,j)=>{const o=I.fld?cs164Site(I,j):null;return [c[0],c[1],o?Math.max(r0,o.r+3):r0]})}
// 1680 place(): decorations stay off the camps' trails (true = keep out; counted as placed, so the seeded stream is unchanged)
function cs164Keep(g,x,y){const L=cs164Sites()[g];if(!L)return false;for(const o of L){const T=o.trail;if(!T)continue;
  if(Math.abs(x-T[0][0])>60&&Math.abs(x-T[T.length-1][0])>60)continue;for(const q of T)if(Math.abs(q[0]-x)<2.2&&Math.abs(q[1]-y)<2.2)return true}return false}

// ---------------- the clearing (0045, after v112Map) ----------------
function cs164Grow(m,bio,DW,props,stamp){try{cs164Sites.DW=DW;const S=cs164Sites(),T0=performance.now();let n=0;
  const rim=(I,d)=>{const t=typeof TH112!='undefined'&&TH112&&TH112.byG&&TH112.byG[I.g];
    if(t){const R=t.sh.rim;return R=='void'?'':R=='R'?'R':R=='forest'?(d>2.1?'R':'#'):(d>1.6?'R':'#')}
    const b=BIOMES[PMAP[I.z].bi];return b.n=='The Citadel'?'':(b.n=='Searing Sands'||d>1.6?'R':'#')};
  INSL.forEach(I=>{const L=S[I.g];if(!L)return;L.forEach(o=>{const cx=o.x,cy=o.y,r=o.r;stamp(cx,cy,r+2);
    for(let i=0;i<3;i++){const a=o.ang+i*2.094+.6;stamp(cx+Math.cos(a)*r*.45,cy+Math.sin(a)*r*.45,r*.62+2)}
    if(o.trail)o.trail.forEach(q=>stamp(q[0],q[1],2.6));
    const R2=Math.ceil(r*1.1+6);for(let y=cy-R2;y<=cy+R2;y++)for(let x=cx-R2;x<=cx+R2;x++){if(!m[y]||y<1||x<1||y>=H-1||x>=W-1||insAt(x,y)!==I||x<=I.x0||y<=I.y0||x>=I.x0+I.w-1||y>=I.y0+I.h-1)continue;const k=y*W+x,dd=DW[k],t=m[y][x],q=Math.hypot(x-cx,y-cy);
      if(dd<0){if(t===''||t=='#'||t=='R'){m[y][x]='.';n++}}else if(dd<2.6&&t==='')m[y][x]=rim(I,dd);
      if(t=='~'&&q<r+2)m[y][x]='a'}
    for(let i=props.length-1;i>=0;i--){const q=props[i];if(Math.abs(q[0]-cx)<=r&&Math.abs(q[1]-cy)<=r&&Math.hypot(q[0]-cx,q[1]-cy)<r){if(m[q[1]][q[0]]=='r')m[q[1]][q[0]]='.';props.splice(i,1)}}})});
  cs164Grow.st={tiles:n,ms:Math.round(performance.now()-T0)}}catch(e){console.warn('v164 camp clearings',e)}}

// ---------------- v123 replacements (hoisted: the last declaration of a name is the one every caller gets) ----------------
// the radius of camp j in instance I (decoration keep-out rings, CAMPS_PRE)
function cs123Rad(I,j){const o=I&&I.fld?cs164Site(I,j):null;if(o)return o.r;const D=I&&I.fld?cs123At(I.z,I.k,j):null;return D?D.r:12}
// sizes and seeds on the CAMPS records (from 0250)
function cs123Setup(){const n={};CAMPS.forEach(C=>{const I=INSL[C.ig];if(!I)return;const j=n[C.ig]=(n[C.ig]==null?0:n[C.ig]+1),D=I.fld?cs123At(I.z,I.k,j):null,o=I.fld?cs164Site(I,j):null;
  C.j=j;C.key=I.z+'_'+I.k+'_'+j;C.des=D;C.r0=D?D.r:12;C.r=o?o.r:C.r0;C.rc=o?o.rc:C.r0;C.rf=o?o.rf:C.r0*.9;C.site=o;
  C.sp=Math.max(6.5,Math.min(12,C.r*.42));C.ang=cs123Ang(C.x,C.z);C.seed=1+Math.floor(cs123H(C.x+.5,C.z-.5)*2e6)})}
// heights (0045, right after HF is filled): the v123 shape on the core, a levelled settlement ring, the fort's earth bank,
// hummocks in the outskirts, a long blend into the natural ground and a smooth ramp along the trail
function cs123Terrain(){const P=cs123Plan(),S=cs164Sites(),DW=MAP.DW,ix=(i,j)=>(j+HPD)*HW+i+HPD;
  INSL.forEach(I=>{const L=S[I.g];if(!L)return;L.forEach(o=>{const D=P[o.key];if(!D)return;
    const cx=o.x,cz=o.y,r=o.r,rc=o.rc,rf=o.rf,Rb=r+7,an=cs123Ang(cx,cz),ca=Math.cos(an),sa=Math.sin(an),sd=cs123H(cz,cx)*100,lv=D.lv==null?.85:D.lv,bh=cs164Fort(o.fk)[1];
    const ok=(x,y)=>x>0&&y>0&&x<W-1&&y<H-1&&MAP[y][x]&&MAP[y][x]!='~'&&DW[y*W+x]<0&&insAt(x,y)===I;
    const gw=2.6/rf,gap=a=>{let m=1;const G=o.gates.map(g=>[g-gw,g+gw]).concat(o.gaps);for(const [a0,a1] of G){const c=(a0+a1)/2,h=(a1-a0)/2+.12;let q=Math.abs(((a-c)%6.2832+9.4248)%6.2832-3.1416);m=Math.min(m,smt(h-.1,h+.12,q))}return m};
    let s=0,n=0;const r7=Math.ceil(r*.7);for(let y=cz-r7;y<=cz+r7;y++)for(let x=cx-r7;x<=cx+r7;x++)if(Math.hypot(x-cx,y-cz)<r*.7&&ok(x,y)){s+=HF[ix(x,y)];n++}
    const base=n?s/n:HF[ix(cx,cz)],R1=Math.ceil(Rb)+1,Lh=[];let mn=1e9,mc=1e9;
    for(let y=cz-R1;y<=cz+R1;y++)for(let x=cx-R1;x<=cx+R1;x++){const d=Math.hypot(x-cx,y-cz);if(d>Rb||!ok(x,y))continue;
      const k=ix(x,y),wl=lv*(1-.3*smt(rc,rc+5,d))*(1-smt(r*.72,Rb,d));let h=HF[k]*(1-wl)+base*wl,dv=0;
      for(const q of D.t)dv+=cs123Op(q,x-cx,y-cz,d,rc,ca,sa,sd,x,y);dv*=1-smt(rc*.92,rc+5,d);
      if(bh){const u=(d-(rf+1.3))/1.5,u2=(d-(rf+3.9))/1.1;dv+=(bh*1.5*Math.exp(-u*u)-bh*.55*Math.exp(-u2*u2))*gap(Math.atan2(y-cz,x-cx))}
      dv+=.3*(fbm2(x*.17+sd,y*.17-sd,3)-.5)*2*smt(rc+1,r*.9,d)*(1-smt(r+1,Rb,d));
      const w=1-smt(r+1,Rb,d);h+=dv*Math.max(w,1-smt(rc,rc+6,d));Lh.push(k,h,1-smt(r*.92,Rb,d));if(d<r)mn=Math.min(mn,h);if(d<rc)mc=Math.min(mc,h)}
    const sh=D.wet?(-D.wet-mc):Math.max(0,.4-mn);for(let i=0;i<Lh.length;i+=3)HF[Lh[i]]=Lh[i+1]+sh*Lh[i+2];
    // the trail: a smooth ramp from the gate down (or up) to the road
    const T=o.trail;if(T&&T.length>1){const a=T[0],b=T[T.length-1],ha=GHv(Math.round(a[0]),Math.round(a[1])),hb=GHv(Math.round(b[0]),Math.round(b[1])),Ls=Math.hypot(b[0]-a[0],b[1]-a[1])||1;
      const xs=T.map(q=>q[0]),ys=T.map(q=>q[1]),x0=Math.floor(Math.min(...xs))-3,x1=Math.ceil(Math.max(...xs))+3,y0=Math.floor(Math.min(...ys))-3,y1=Math.ceil(Math.max(...ys))+3;
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!ok(x,y))continue;let bd=1e9,bt=0;for(let i=0;i<T.length-1;i++){const p=T[i],q=T[i+1],vx=q[0]-p[0],vy=q[1]-p[1],l2=vx*vx+vy*vy||1,t=Math.max(0,Math.min(1,((x-p[0])*vx+(y-p[1])*vy)/l2)),ex=p[0]+vx*t-x,ey=p[1]+vy*t-y,dd=ex*ex+ey*ey;if(dd<bd){bd=dd;bt=(Math.hypot(p[0]+vx*t-a[0],p[1]+vy*t-a[1]))/Ls}}
        bd=Math.sqrt(bd);if(bd>3.2)continue;const k=ix(x,y),tg=ha+(hb-ha)*Math.min(1,bt),w=(1-smt(1.2,3.2,bd))*.8*smt(0,.12,bt)*(1-smt(.92,1,bt));HF[k]=HF[k]*(1-w)+tg*w}}})})}
// tiles (end of the 0045 map build; only '.', 'g' and 'a' are swapped, so walking, water and nodes don't change): the core keeps
// the v123 ground, the settlement ring is trodden bare ground fading into grass, the trail and the gates are dirt
function cs123Map(m){const P=cs123Plan(),S=cs164Sites();
  INSL.forEach(I=>{const L=S[I.g];if(!L)return;L.forEach(o=>{const D=P[o.key];if(!D)return;const cx=o.x,cz=o.y,R=o.rc*.88,r=o.r,R1=Math.ceil(r+3),gt=D.gt||'.';
    const T=o.trail,G=o.gates.map(a=>[Math.cos(a),Math.sin(a)]);
    for(let y=cz-R1;y<=cz+R1;y++)for(let x=cx-R1;x<=cx+R1;x++){const t=m[y]&&m[y][x];if(!t||'.ga'.indexOf(t)<0||insAt(x,y)!==I)continue;
      const a=Math.atan2(y-cz,x-cx),dd=Math.hypot(x-cx,y-cz),h=cs123H(x*1.7,y*2.3),h2=cs123H(y*3.1,x*.7),lim=R*(.84+.16*Math.sin(a*3+cx)+.08*Math.sin(a*7+cz));
      if(dd<lim){if(h<1.15-dd/lim*.7)m[y][x]=gt;continue}
      // the gates: a dirt apron across the fence line
      let gd=1e9;G.forEach(([ux,uz])=>{const u=(x-cx)*ux+(y-cz)*uz,v=Math.abs(-(x-cx)*uz+(y-cz)*ux);if(u>o.rf-5&&u<o.rf+3)gd=Math.min(gd,v)});
      if(gd<1.6&&h<.9){m[y][x]='a';continue}
      // paths: from each gate to the heart
      let pd=1e9;G.forEach(([ux,uz])=>{const u=(x-cx)*ux+(y-cz)*uz,v=-(x-cx)*uz+(y-cz)*ux;if(u>o.rc*.5&&u<o.rf+2){const w=Math.sin(u*.35+cx)*1.2;pd=Math.min(pd,Math.abs(v-w))}});
      if(pd<1.3&&h<.92){m[y][x]='a';continue}
      const p=.95*(1-cs164S(o.rf-1,r+1.5,dd));if(h<p){m[y][x]=h2<.42?'a':'.'}else if(dd<r+2&&h2<.12)m[y][x]='a'}
    if(T)for(let i=0;i<T.length;i++){const [qx,qz]=T[i];for(let y=Math.floor(qz-2.5);y<=qz+2.5;y++)for(let x=Math.floor(qx-2.5);x<=qx+2.5;x++){const t=m[y]&&m[y][x];if(!t||'.ga'.indexOf(t)<0||insAt(x,y)!==I)continue;
      const dd=Math.hypot(x-qx,y-qz),h=cs123H(x*2.1,y*1.3);if(dd<1.2&&h<.85)m[y][x]='a';else if(dd<2.3&&h<.6&&t=='g')m[y][x]='.'}}})})}
