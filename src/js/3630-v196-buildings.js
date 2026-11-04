// ================= v196: fantasy buildings that grow with their upgrades; the Trading Post and the Inn on the plaza ring =================
// Owner (Nov 3 2026): "improve the look and feel of each building and make them more fantasy inspired — right now they're pretty basic
// home models. Add moss, vines, make some out of stone etc. I also want each upgrade to buildings or shops to make the building more
// elaborate and decorated."
//  * Every shop, house and kingdom structure gets a dressing pass (dm196Dress) after its own kit: a mossy stone footing, moss along
//    the eaves and on the stones, ivy climbing the corners, a lantern by the door and a flower box. The Alchemist, the Rune Sanctum
//    and the Bard's Stage are now stone buildings.
//  * Each level adds more (shops: SHP109.lv 0..3; the Blacksmith follows the forge's kingdom level; houses: their best resident's
//    rank; kingdom structures: their own level 1..3):
//      L1 banners in the shop's colour, potted shrubs, a carved lintel, more ivy;
//      L2 a round stone turret at a back corner (crenels, slate cone, finial), a dormer, more moss;
//      L3 a stone portico with braziers before the door, glowing rune stones on the ridge, a gilded weathervane, floating motes.
//    A level bought at the Steward rebuilds that building on the spot (cache key carries the level).
//  * The Trading Post (always open, levels from its upgrade) and the Inn are new buildings on the plaza ring (DM196_FIX in 0045);
//    the Inn has its own file (3640) because you can walk into it. The v83 north-row buildings stay hidden (3610).
// Co-op: every look comes from shared state (shop levels, ranks, kingdom levels) and seeded numbers, so partners see the same.
var DM196B={stone:{alch:1,sage:1,bard:1},col:{smith:0x8a3a22,alch:0x2e6a4a,cook:0x8a5a2a,bard:0x6a2a7a,merchant:0x2a5a7a,sage:0x4a2a8a,trainer:0x6a4a22,stable:0x7a4a22,magic:0x4a2a8a,post:0x8a6a2a},cur:null};
// remember the body and roof of the building being built (shops and houses use TWN100_body / TWN100_roof)
{const f=TWN100_body;TWN100_body=function(k,o){if(DM196B.cur&&DM196B.stone[DM196B.cur]&&o&&o.st!='stone'&&o.st!='log'){o=Object.assign({},o,{st:'stone',wc:0x6e6a64})}if(k)k._b196=Object.assign({},o);return f.call(this,k,o)}}
{const f=TWN100_roof;TWN100_roof=function(k,o,col,rise,along,trim){if(k&&k._b196){k._b196.rise=rise;k._b196.along=along;k._b196.roof=col}return f.apply(this,arguments)}}
// ---------------- the dressing ----------------
var DM196C={moss:[0x34502a,0x3e5c2e,0x2a4424,0x486a34],ivy:[0x24402a,0x2e4a30,0x35602e,0x1e3626],flw:[0xd8c8e8,0xc8607a,0xe8d890,0x9a7ad8,0xe89a5a],stone:0x6e6a64,stoneD:0x4e4a50};
function dm196Moss(k,x,y,z,s,sd){dc190Clump(k,DM196C.moss[sd%4],x,y,z,.32*s,.09*s,.26*s,sd,'leaf',0)}
function dm196Ivy(k,x,z,h,nx,nz,sd){const P=[];for(let j=0;j<7;j++){const y=.1+j*(h-.2)/6;P.push([x+nx*.05+Math.sin(j*1.7+sd)*.12*Math.abs(nz),y,z+nz*.05+Math.sin(j*1.7+sd)*.12*Math.abs(nx)])}
  dc190Tube(k,'c',0x3a2e20,P,P.map((_,j)=>.03-j*.003),5,'bark');P.forEach((p,j)=>{dc190Clump(k,DM196C.ivy[(sd+j)%4],p[0]+nx*.06,p[1],p[2]+nz*.06,nx?.07:.24,.22,nz?.07:.24,sd+j,'leaf',0);
    if(j%2==0)dc190Clump(k,DM196C.ivy[(sd+j+1)%4],p[0]+nx*.05+(nz?.2:0),p[1]-.18,p[2]+nz*.05+(nx?.2:0),nx?.06:.2,.16,nz?.06:.2,sd+j+5,'leaf',0)})}
function dm196Pot(k,x,z,sd,s){s=s||1;dc190L(k,'c',0x7a4a32,[[0,0],[.16*s,0],[.22*s,.3*s],[.2*s,.34*s],[0,.34*s]],8,x,0,z,0,1,'stone');
  for(let j=0;j<3;j++)dc190Clump(k,DM196C.ivy[(sd+j)%4],x+(j-1)*.08*s,.48*s+j*.05,z+((j%2)-.5)*.1*s,.2*s,.24*s,.2*s,sd+j,'leaf',0);
  for(let j=0;j<4;j++)k.p('c',DM196C.flw[(sd+j)%5],'oct',x+Math.cos(j*1.6+sd)*.16*s,.62*s,z+Math.sin(j*1.6+sd)*.16*s,.05,.05,.05)}
// b = {w,d,h,zc,rise,along}: body w x d centred at z=zc, front wall at zc+d/2 facing +z, walls h high, roof rise; lv 0..3; col = the trade's colour
function dm196Dress(k,b,lv,col,sd){if(!b||!b.w)return;const R=dkRng(9196+(sd|0)*31+lv*7),w=b.w,d=b.d,h=b.h,zc=b.zc||0,fz=zc+d/2,bz=zc-d/2,rise=b.rise||1.5,ban=col||TOWNS[0].pal.ban||0x7a2230;
  // L0: a mossy stone footing, moss on the eaves and corners, ivy up the front corners, a lantern by the door, a flower box
  if(b.st!='stone'&&b.st!='log'){twStones(k,DM196C.stoneD,-w/2-.18,fz+.12,w/2+.18,fz+.12,0,.5,.34,.5);twStones(k,DM196C.stoneD,-w/2-.18,bz-.12,w/2+.18,bz-.12,0,.5,.34,.5);
    twStones(k,DM196C.stoneD,-w/2-.12,bz,-w/2-.12,fz,0,.5,.3,.5);twStones(k,DM196C.stoneD,w/2+.12,bz,w/2+.12,fz,0,.5,.3,.5)}
  for(let i=0;i<5+lv*2;i++){const t=(i+.5)/(5+lv*2),x=-w/2+w*t+(R()-.5)*.3;dm196Moss(k,x,.52,fz+.2,.9+R()*.4,i);if(i%2==0)dm196Moss(k,x,.52,bz-.2,.8,i+3)}
  const eave=h+.06;for(let i=0;i<4+lv*2;i++){const x=-w/2+.3+R()*(w-.6);dm196Moss(k,x,eave+.08,fz+.34+R()*.1,.8+R()*.5,i+11);if(R()<.5)dm196Moss(k,x,eave+.08,bz-.34,.8,i+17)}
  [-1,1].forEach((s,j)=>dm196Ivy(k,s*(w/2+.02),fz+.02,Math.min(h-.1,2.6),0,1,j*3+sd));
  if(lv>=1)[-1,1].forEach((s,j)=>dm196Ivy(k,s*(w/2+.04),zc+(R()-.5)*d*.5,Math.min(h-.1,2.4),s,0,j*5+sd+2));
  if(lv>=2)dm196Ivy(k,(R()-.5)*w*.6,bz-.04,Math.min(h-.1,2.6),0,-1,sd+9);
  k.L('m',TWC.iron,[-.95,2.25,fz+.02],[-.95,2.25,fz+.38],.02,'box',0);TWN100_lantern(k,-.95,1.92,fz+.38,0xffc870);
  // L1: banners either side of the door, potted shrubs, a carved lintel over the door
  if(lv>=1){[-1,1].forEach(s=>kdBanner(k,s*(w/2-.35),h-.15,fz+.08,0,ban,.48,1.05));dm196Pot(k,-w/2-.3,fz+.55,sd+1,1);dm196Pot(k,w/2+.3,fz+.55,sd+2,.9);
    k.as('ashlar',()=>k.p('c',DM196C.stone,'box',0,2.05,fz+.1,1.5,.18,.16,0,0,0,.04));for(let i=0;i<5;i++)k.p('g',ban,'box',-.5+i*.25,2.05,fz+.19,.06,.06,.02,0,0,.785,0)}
  // L2: a round stone turret at a back corner with crenels, a slate cone and a finial; a dormer on the roof
  if(lv>=2){const tx=(sd%2?1:-1)*(w/2-.1),tz=bz+.1,tr=.78,th=h+rise+.9;twStoneRing(k,DM196C.stone,tx,tz,tr,0,th,.3);
    for(let i=0;i<10;i++){const a=i/10*6.283;if(i%2)k.p('c',DM196C.stone,'box',tx+Math.cos(a)*(tr+.02),th+.2,tz+Math.sin(a)*(tr+.02),.28,.32,.26,0,-a,0,.06)}
    k.as('ashlar',()=>k.p('c',DM196C.stoneD,'cyl8',tx,th+.04,tz,tr+.12,.12,tr+.12,0,0,0,.03));twCone(k,0x3e3a52,tx,th+.1,tz,tr+.22,1.9);
    k.p('m',TWC.gold||0xc9a24a,'oct',tx,th+2.15,tz,.1,.18,.1);[0,1].forEach(i=>twWindow(k,tx+Math.cos(i*2.4+.6)*(tr+.02),h*.55+i*1.1,tz+Math.sin(i*2.4+.6)*(tr+.02),.22,.42,Math.PI/2-(i*2.4+.6),0xffd27a));
    for(let i=0;i<4;i++)dm196Moss(k,tx+Math.cos(i*1.7)*(tr+.05),.3+i*.55,tz+Math.sin(i*1.7)*(tr+.05),.7,i+23);
    if(b.along!='z'){const dz=fz-(d/2)*.45,dy=h+rise*.45;k.at(0,0,0,()=>{k.p('c',0xd8ccb0,'box',(sd%2?-1:1)*w*.18,dy+.3,dz,.7,.6,.5,0,0,0,.03);twWindow(k,(sd%2?-1:1)*w*.18,dy+.3,dz+.26,.36,.34,0,0xffd27a);
      twGable(k,b.roof||0x3e3a40,.9,.8,.42,.12,dy+.55)},0)}}
  // L3: a stone portico with braziers before the door, glowing rune stones along the ridge, a weathervane, floating motes
  if(lv>=3){[-1,1].forEach(s=>{const x=s*(w/2+.45),z=fz+.35;twStones(k,DM196C.stone,x-.22,z,x+.22,z,0,1.25,.44,.42);k.as('ashlar',()=>k.p('c',DM196C.stoneD,'box',x,1.3,z,.56,.12,.56,0,0,0,.03));kdBrazier(k,x,z,1.36,.55);dm196Moss(k,x,1.36,z,.6,s+40)});
    const ry=h+rise+.05;for(let i=0;i<3;i++){const x=(i-1)*w*.3;k.p('c',0x3a3640,'dod',x,ry+.12,zc,.12,.16,.12);k.p('g',ban,'oct',x,ry+.34,zc,.08,.13,.08)}
    k.L('m',TWC.iron,[w*.32,h+rise*.6,zc],[w*.32,h+rise+1.2,zc],.025,'cyl6',0);k.p('m',TWC.gold||0xc9a24a,'tri',w*.32+.22,h+rise+1.1,zc,.42,.22,.02,0,0,-Math.PI/2,0);
    for(let i=0;i<6;i++){const a=i/6*6.283;k.p('g',[0xffe8a0,ban,0xbfe8ff][i%3],'oct',Math.cos(a)*(w*.6),h*.8+R()*1.4,zc+Math.sin(a)*(d*.7),.05,.07,.05)}}}
// ---------------- shops: built by level ----------------
function dm196ShopLv(k){if(k=='smith'){try{return [0,1,1,2,2,3][Math.max(0,kf109().s)]}catch(_){return 0}}return typeof shpL109=='function'?shpL109(k):0} // the forge has no upgrade of its own: it grows with the kingdom
{const f=TWN100_build;TWN100_build=function(q){const lv=dm196ShopLv(q.k),key0='TWNS|'+q.k,key=key0+'|v196|'+lv,hk=twHas,gk=twGroup,kit=TWN100_KIT[q.k];DM196B.cur=q.k;
  twHas=function(x){return hk(x===key0?key:x)};twGroup=function(k,x,ao){return gk(k,x===key0?key:x,ao)};
  if(kit)TWN100_KIT[q.k]=function(k,S){const r=kit.apply(this,arguments);try{dm196Dress(k,k._b196,lv,DM196B.col[q.k],q.k.length*3+q.k.charCodeAt(0))}catch(e){console.warn('v196 dress '+q.k,e)}return r};
  try{const g=f.apply(this,arguments);if(g)g.userData.lv196=lv;return g}finally{twHas=hk;twGroup=gk;if(kit)TWN100_KIT[q.k]=kit;DM196B.cur=null}}}
function dm196ShopRebuild(k){try{const q=TWN100_SH.find(s=>s.k==k);if(!q||!TWN100_S.b[k])return;if(TWN100_S.b[k].userData.lv196===dm196ShopLv(k))return;lotDropShop103(q);q._lot=null;TWN100_shopSync()}catch(e){console.warn('v196 rebuild '+k,e)}}
{const f=shpBuy109;shpBuy109=function(k){const r=f.apply(this,arguments);try{if(k=='post')dm196Post();else dm196ShopRebuild(k)}catch(e){console.warn('v196 upgrade',e)}return r}}
// every shop standing now was built before this file: build them again with their level
try{TWN100_SH.forEach(q=>{if(TWN100_S.b[q.k]){lotDropShop103(q);q._lot=null}});TWN100_shopSync()}catch(e){console.warn('v196 shops',e)}
// ---------------- houses: their best resident's rank ----------------
function dm196HouseLv(i){try{const rk=Math.max(1,...HS103.cit.filter(c=>c.h===i).map(c=>c.rk|0));return rk>=5?3:rk>=3?2:rk>=2?1:0}catch(_){return 0}}
{const f=hsBuild103;hsBuild103=function(i){const h=HS103.h[i];if(!h)return f.apply(this,arguments);const lv=dm196HouseLv(i),key0='HOUSE103|'+h.v,key=key0+'|v196|'+lv,hk=twHas,gk=twGroup,kit=hsKit103;
  twHas=function(x){return hk(x===key0?key:x)};twGroup=function(k,x,ao){return gk(k,x===key0?key:x,ao)};
  hsKit103=function(k,v){const r=kit.apply(this,arguments);try{dm196Dress(k,k._b196,lv,[0x6a3a2a,0x3a4a6a,0x4a5a2a][v],v*5+3)}catch(e){console.warn('v196 house',e)}return r};
  try{const r=f.apply(this,arguments);const o=HS103.g[i];if(o&&o.g)o.g.userData.lv196=lv;return r}finally{twHas=hk;twGroup=gk;hsKit103=kit}}}
function dm196HouseSync(){try{HS103.h.forEach((h,i)=>{const o=HS103.g[i];if(o&&o.g&&o.g.userData.lv196!==dm196HouseLv(i))hsDrop103(i)});if(typeof hs103Sync=='function')hs103Sync()}catch(e){console.warn('v196 houses',e)}}
{const f=typeof czRankUp105=='function'?czRankUp105:null;if(f)czRankUp105=function(){const r=f.apply(this,arguments);dm196HouseSync();return r}}
// ---------------- kingdom structures (Training Grounds, Scholar's Tower, Treasury, Beast Den, Hatchery): their level ----------------
for(const key of ['train','tower','treas','den','hatch']){const U=KDU[key];if(!U||!U.b||U.b.v196)continue;const b0=U.b;
  U.b=function(k,l){const cl=b0.apply(this,arguments);try{const R=dkRng(7196+l*13+key.length);
      // mossy boulders and flowers at the corners of the lot (L1), lantern posts (L2), glowing rune stones (L3)
      [[-2.9,-2.9],[2.9,-2.9],[-2.9,2.6],[2.9,2.6]].forEach(([x,z],i)=>{k.as('stone',()=>k.p('c',[0x5a5662,0x4e4a54,0x66626c][i%3],'dod',x,.22,z,.42+R()*.2,.3,.4,0,R()*3,0,.18));dm196Moss(k,x,.42,z,.8,i);
        if(l>=1)dm196Pot(k,x+(x<0?.6:-.6),z,i+key.length,.8);
        if(l>=2&&z>0){k.as('bark',()=>k.L('c',TWC.woodD,[x*.86,0,z+.2],[x*.86,2.2,z+.2],.06,'log'));TWN100_lantern(k,x*.86,1.95,z+.2,0xffc870)}
        if(l>=3){k.p('c',0x3a3640,'dod',x*.7,.3,z*.7,.2,.45,.2,0,i,0,.1);k.p('g',DM196B.col.magic,'oct',x*.7,.86,z*.7,.08,.14,.08)}})}catch(e){console.warn('v196 kdu '+key,e)}return cl};U.b.v196=1}
try{const K=kdState();Object.keys(K.up||{}).forEach(key=>{if(K.up[key])K.up[key].l=-1});kdSync()}catch(e){console.warn('v196 kdu',e)}
// ---------------- the Trading Post: a stone and timber market hall on the plaza ring ----------------
var DM196TP={g:null,lv:-1,col:[],npc:null};
function dm196Fix(id){return dm196L().find(l=>l.id==id)}
function dm196PostK(k,lv){const o={w:5.4,d:4.2,h:2.7,zc:-.9,st:'stone',wc:0x6e6a64};TWN100_body(k,o);
  // a jettied timber upper floor, a steep slate roof with the ridge along the front
  k.at(0,0,o.zc,()=>{const U=2.95,V=2.35;k.as('wood',()=>k.p('c',TWC.woodD,'box',0,2.76,0,U*2+.1,.12,V*2+.1,0,0,0,.02));
    for(let i=0;i<9;i++){const x=-U+.2+i*(2*U-.4)/8;k.L('c',TWC.woodD,[x,2.7,V-.1],[x,2.7,V+.25],.07,'box')}
    const pc=0xd8ccb0;k.as('plaster',()=>{k.p('c',pc,'box',0,3.55,V-.05,2*U-.2,1.5,.1,0,0,0,.02);k.p('c',pc,'box',0,3.55,-V+.05,2*U-.2,1.5,.1,0,0,0,.02);k.p('c',pc,'box',-U+.05,3.55,0,.1,1.5,2*V-.2,0,0,0,.02);k.p('c',pc,'box',U-.05,3.55,0,.1,1.5,2*V-.2,0,0,0,.02)});
    k.as('wood',()=>{[-1,1].forEach(f2=>{for(let x=-U;x<=U+.01;x+=U/2)k.L('c',TWC.woodD,[x,2.8,f2*V],[x,4.3,f2*V],.07,'box');k.L('c',TWC.woodD,[-U,4.25,f2*V],[U,4.25,f2*V],.07,'box');k.L('c',TWC.woodD,[-U,2.85,f2*V],[U,2.85,f2*V],.07,'box')})});
    [-1.6,0,1.6].forEach(x=>twWindow(k,x,3.6,V+.02,.55,.55,0,0xffd27a));twGable(k,0x3e3a44,2*U+.2,2*V+.3,2.1,.42,4.3)});
  k._b196=Object.assign({},o,{h:2.7,rise:3.5,along:'x',roof:0x3e3a44});
  twDoor(k,0,.36,o.zc+o.d/2+.02,1.05,1.8,0);[-1.7,1.7].forEach(x=>twWindow(k,x,1.55,o.zc+o.d/2+.04,.7,.62,0,0xffd27a));
  TWN100_chim(k,1.9,o.zc-1.2,2.7,6.6,TWC.stone);
  // the market front: a striped awning over a counter of goods, scales, crates and barrels
  TWN100_awning(k,-2.6,2.6,o.zc+o.d/2+.1,o.zc+o.d/2+1.5,2.35,1.85,[0x8a2a3a,0xd8ccb0]);
  k.as('wood',()=>k.p('c',0x5a3c24,'box',1.7,.92,o.zc+o.d/2+.95,1.6,.1,.7,0,0,0,.04));[1.2,1.6,2.0].forEach((x,i)=>{for(let q=0;q<2+i;q++)k.p('m',0xd8b040,'cyl8',x,1.0+q*.05,o.zc+o.d/2+.9,.12,.05,.12,0,0,0,0)});
  [[1.2,0xc83a3a],[1.6,0x3a7ad8],[2.1,0x3ac87a]].forEach(([x,c])=>{k.p('g',c,'oct',x,1.08,o.zc+o.d/2+1.15,.06,.1,.06)});
  TWN100_crate(k,-2.0,o.zc+o.d/2+.9,.6,.3);TWN100_crate(k,-1.5,o.zc+o.d/2+1.1,.42,.9);TWN100_barrel(k,-2.6,o.zc+o.d/2+.5,.85);
  {const cn=twCoin&&twCoin();if(cn){}}
  dm196Dress(k,k._b196,lv,DM196B.col.post,13)}
function dm196Post(){const T=TOWNS[0],l=dm196Fix('post'),lv=typeof shpL109=='function'?shpL109('post'):0;if(DM196TP.g&&DM196TP.lv===lv)return;
  if(DM196TP.g){scene.remove(DM196TP.g);DM196TP.g=null}const key='DM196POST|'+lv;let k=null;if(!twHas(key)){k=twKit(19601+lv);dm196PostK(k,lv)}
  const g=twGroup(k,key),[x,z]=lotW103(l,0,0);g.position.set(x,T.ph,z);g.rotation.y=l.ry;g.name='dm196post';scene.add(g);DM196TP.g=g;DM196TP.lv=lv;
  sign(g,[{t:'TRADING POST',f:'700 56px'}],2.9,.6,'#2e1f12','#ffd88a','#c9a24a',0,2.25,-.9+2.1+.2,0,512,130);
  // the merchant at the counter; the prompt spot in front of the door
  if(!DM196TP.npc){const [nx,nz]=lotW103(l,.4,2.6),ng=new THREE.Group(),prev=T_cur,nc=[];T_cur={col:nc,cx:0,cy:0};try{npc(ng,nx,nz,{robe:0x2a4a7a,trim:0xc9a24a,hat:'cap',hatC:0x6a2a2a,label:'Merchant',ry:l.ry})}finally{T_cur=prev}ng.position.y=GH(nx,nz);scene.add(ng);DM196TP.npc=ng}
  T.mp=lotW103(l,0,3.7);
  // colliders: the hall (circles along its walls, it turns with the ring) and the counter
  const C=[];for(let a=-2.6;a<=2.61;a+=.65)for(const b of [-3.0,1.15]){const [X,Z]=lotW103(l,a,b);C.push({x:X,z:Z,r:.42})}for(let b=-2.6;b<=1.0;b+=.65)for(const a of [-2.7,2.7]){const [X,Z]=lotW103(l,a,b);C.push({x:X,z:Z,r:.42})}
  {const [X,Z]=lotW103(l,1.7,2.05);C.push({x:X,z:Z,r:.6})}{const [X,Z]=lotW103(l,-2.0,2.0);C.push({x:X,z:Z,r:.55})}
  kfColSet109(DM196TP.col,C);DM196S.col=(DM196S.col||[]).filter(c=>DM196TP.col.indexOf(c)<0).concat(DM196TP.col);
  // the lot's ground is the building's: no grass pokes through, the minimap shows it
  try{lotMark103('fix:post',lotTiles103(l,-2.4,2.4,-3.0,.9))}catch(_){}}
// ---------------- the Steward and his desk: south-west of the fountain ----------------
function dm196Steward(){try{const T=TOWNS[0];if(typeof shBuild=='function'&&!SHM.st)shBuild();const S=SHM.st;if(!S||S.v196)return;const nx=T.cx-6.8,nz=T.cy+4.4,dx=nx-S.x,dz=nz-S.z;
  S.g.position.x+=dx;S.g.position.z+=dz;S.g.position.y=GH(nx,nz);S.x=nx;S.z=nz;S.v196=1;
  // his colliders moved with him
  T.col.forEach(c=>{if(c._st196)return;const d=Math.hypot(c.x-(nx-dx),c.z-(nz-dz));if(d<2.2){c.x+=dx;c.z+=dz;c._st196=1}})}catch(e){console.warn('v196 steward',e)}}
try{dm196Post();dm196Steward()}catch(e){console.warn('v196 post',e)}
// the forge grows with the kingdom: rebuild it when the walls move
{const f=kfApply109;kfApply109=function(){const r=f.apply(this,arguments);try{dm196ShopRebuild('smith')}catch(_){}return r}}
try{dm196HouseSync()}catch(_){}
// co-op: a partner shown the host's kingdom (3094 dk150Apply) gets every building at the host's levels
{const f=typeof dk150Apply=='function'?dk150Apply:null;if(f)dk150Apply=function(){const r=f.apply(this,arguments);try{SHOPS.forEach(o=>dm196ShopRebuild(o.k));dm196ShopRebuild('smith');dm196Post();dm196HouseSync();
  // the wall pieces (banners, ivy, ravens) were placed before the host's walls went up: place them again on those walls
  if(typeof DC103!='undefined'&&DC103.g){Object.keys(DC103.g).forEach(k=>dcDrop104(k));dc103Sync()}}catch(e){console.warn('v196 coop buildings',e)}return r}}
