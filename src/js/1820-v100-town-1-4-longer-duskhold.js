// ================= v100 town (1/4): the longer Duskhold — wall ring, south wards, courtyard inside the walls =================
// Layout numbers live in w0_world.js: TWN100_SZ (south wall, town-local z), TWN100_IW (inner wall closing the courtyard
// ward), TWN100_PG (portal islands), TWN100_RD (roads), TWN100_SH (market plots), CYD (courtyard), PCOURT (crossroads).
// Town-local frame (T.g): x = world x - T.cx, z = world z - T.cy, ground at T.ph.
//   v101: ONE Grand Square, walls at x ±36 (TWN100_WX) from z -21 to 51 (TWN100_SZ), no inner walls or wards (v109: the walls are
//   sized by the kingdom's stage instead, x ±20 and z -21..11..51, see 1960):
//   north row (Trading Post, Tavern) and the fountain as before; building lots down each side and in the south half (v103:
//   LOT103, the player picks one for every shop, upgrade and house); prestige buildings in the corners; the south gate opens on the Portal Road
// This file: the wall ring for every Bastion Walls level (kdWalls), area names,
// arriving home from a zone (TWN100_home), old saves standing where there is no ground any more.
var TWN100={walls:null,cy:null,lamps:[]};
// v109: the walls follow the kingdom's current size (kf109 in 1960: WX, SZ per stage); before that file runs, the full square
function TWN100_L(){const T=TOWNS[0],F=typeof kf109=='function'?kf109():null;return {T,R:TS,WX:F?F.WX:TWN100_WX,IW:TWN100_IW,SZ:F?F.SZ:(T.sz||TWN100_SZ),st:F?F.s:-1}}
// where the two baked halves of the ring meet, and the extra towers along the sides (lv 3), for the current size
function TWN100_mid(SZ){return Math.min(15,Math.round(SZ*.55))}
function TWN100_mids(WX,SZ){const M=TWN100_mid(SZ),n=[[-Math.round(WX*.62),-TS],[Math.round(WX*.62),-TS],[-WX,-12],[WX,-12]];if(M>2)n.push([-WX,Math.round(M*.4)],[WX,Math.round(M*.4)]);
  const s=[];for(let z=M+9;z<SZ-5;z+=12)s.push([-WX,z],[WX,z]);return [n,s]}
// the v83 stone tower (Bastion Walls level 2 used the old tower groups; the ring now needs towers in new places)
function TWN100_tw2(k,r,h){const roofC=TOWNS[0].pal.roof||0x3e3a40,flag=TOWNS[0].pal.ban||0x7a2230;
  twStoneRing(k,TWC.stone,0,0,r*1.08,0,.45,.36);twStoneRing(k,TWC.stone,0,0,r,.45,h,.32);
  const n=Math.max(8,Math.round(r*7));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;k.as('wood',()=>k.L('c',TWC.woodD,[Math.cos(a)*r*.9,h-.25,Math.sin(a)*r*.9],[Math.cos(a)*r*1.22,h+.05,Math.sin(a)*r*1.22],.06,'box'))}
  k.as('board',()=>k.p('c',TWC.wood,'cyl8',0,h+.12,0,r*1.24,.18,r*1.24,0,0,0,.05));
  for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2;k.as('wood',()=>k.p('c',k.R()<.3?TWC.woodD:TWC.wood,'box',Math.cos(a)*r*1.2,h+.42,Math.sin(a)*r*1.2,.07,.5,r*Math.PI*2/n*1.02,0,-a,0,.06))}
  twCone(k,roofC,0,h+.55,0,r*1.42,r*2.3);
  [0,2.1,4.2].forEach(a=>k.p('c',0x18141a,'box',Math.cos(a)*(r+.14),h*.6,Math.sin(a)*(r+.14),.08,.5,.16,0,-a,0,0));
  const top=h+.55+r*2.3;k.L('c',TWC.woodD,[0,top-.3,0],[0,top+1.0,0],.035,'cyl6',0);k.as('cloth',()=>{k.p('c',flag,'box',.34,top+.72,0,.62,.36,.03,0,0,0,.08);k.p('c',flag,'tri',.72,top+.72,0,.36,.2,.03,0,0,-Math.PI/2,.05)})}
// the ring's long walls in bigger blocks and taller courses (≈1/3 of the parts of twStones; reads the same at wall scale)
function TWN100_coarse(k,col,x0,z0,x1,z1,y0,y1,th,bl){return twCtx(k,k&&k.mt=='ashlar'?'ashlar':'stone',(k,col,x0,z0,x1,z1,y0,y1,th,bl)=>{const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz)||.01,ux=dx/L,uz=dz/L,ry=Math.atan2(-dz,dx);bl=(bl||.62)*1.75;
  let y=y0,row=0;while(y<y1-.04){const bh=Math.min(y1-y,.46+k.R()*.18);let u=row%2?-bl*.45:0;
    while(u<L-.02){const len=Math.min(L-Math.max(u,0),bl*(.7+k.R()*.6)),a=Math.max(u,0),m=a+len/2,sh=(k.R()-.5)*.1;
      if(len>.08)k.p('c',k.R()<.25?TWC.stoneD:k.R()<.3?TWC.stoneL:col,'box',x0+ux*m,y+bh/2,z0+uz*m,len-.03,bh-.03,th*(.94+k.R()*.12),sh*.3,ry,sh*.2,.16);u+=len}
    y+=bh;row++}},arguments)}
function TWN100_tower(k,lv,r,h){if(lv==2)TWN100_tw2(k,r,h);else kdTowerK(k,lv,r,h)}
// v101: the ring round the Grand Square, baked per level into two kits (north half / south half) so each can be culled.
// Walls at x = ±WX from z = -TS to SZ, one gatehouse in the south wall (the Portal Road), towers at the corners and along the sides.
function TWN100_ringK(k,lv,part){const {WX,SZ}=TWN100_L(),N=-TS,M=TWN100_mid(SZ),MD=TWN100_mids(WX,SZ),gz=1.75,at=(x,z,ry,f)=>k.at(x,0,z,f,ry),seg=(x0,z0,x1,z1,ry)=>at((x0+x1)/2,(z0+z1)/2,ry,()=>kdSegK(k,lv,Math.hypot(x1-x0,z1-z0)));
  const side=(z0,z1)=>[-1,1].forEach(s=>seg(s*WX,z0,s*WX,z1,-s*Math.PI/2));
  const big=(x,z,i)=>at(x,z,i*1.3,()=>TWN100_tower(k,lv,1.45,4.2)),small=(x,z,i)=>at(x,z,i*.9+(x+z)%6,()=>TWN100_tower(k,lv,.95,3.1)),mid=(x,z,i)=>at(x,z,i*1.7,()=>kdTowerK(k,3,1.15,3.6));
  if(part==0){seg(-WX,N,WX,N,0);side(N,M);
    [-1,1].forEach(s=>{big(s*WX,N,s);small(s*WX,-3,s+1);small(s*Math.min(12,WX-6),N,s+3)});
    if(lv>=3)MD[0].forEach(([x,z],i)=>mid(x,z,i))}
  else{side(M,SZ);seg(-WX,SZ,-gz,SZ,Math.PI);seg(gz,SZ,WX,SZ,Math.PI);at(0,SZ,Math.PI/2,()=>kdGateK(k,lv));
    [-1,1].forEach(s=>{big(s*WX,SZ,s+6);small(s*2.3,SZ,s+2);if(SZ-M>10)small(s*WX,Math.round((M+SZ)/2),s+4);small(s*Math.min(18,WX-6),SZ,s+8)});
    if(lv>=3)MD[1].forEach(([x,z],i)=>mid(x,z,i+3))}}
function kdWalls(T,lv){const K=kdState(),o=kdOld(T);if(K.wg){T.g.remove(K.wg);K.wg=null}
  o.gate.forEach(q=>q.visible=false);o.tw.forEach(q=>q.visible=false);o.ban.forEach(q=>q.visible=false);
  const g=new THREE.Group();g.name='kdWalls';
  const st=TWN100_L().st;[0,1].forEach(part=>{const key='TWNRING101|'+lv+'|'+part+(st>=0?'|s'+st:'');let k=null;if(!twHas(key)){k=twKit(611+lv*3+part);const ts=twStones;twStones=TWN100_coarse;try{TWN100_ringK(k,lv,part)}finally{twStones=ts}}const pg=twGroup(k,key);pg.name='kdWalls'+part;g.add(pg)});
  K.wg=g;T.g.add(g);K.wst=TWN100_L().st;
  const {WX,SZ}=TWN100_L(),cols=[],lamps=[];
  if(lv>=3){const MD=TWN100_mids(WX,SZ);MD[0].concat(MD[1]).forEach(([x,z])=>cols.push({x:T.cx+x,z:T.cy+z,r:1.15}));
    [-1,1].forEach(q=>{lamps.push([T.cx+q*2.75,T.ph+1.2,T.cy+SZ+1.25]);lamps.push([T.cx+q*2.75,T.ph+1.2,T.cy+SZ-1.25])})}
  kdCol(T,K.wcol=K.wcol||[],cols);K.wl=lv;return lamps}

// ---------- names, coming home, old saves ----------
{const f=areaName;areaName=function(){try{{const T=TOWNS[0],x=pl.position.x,z=pl.position.z;
    if(townAt(x,z,0)==0){const F=typeof kfIn109=='function';if(F&&!kfIn109(x-T.cx,z-T.cy,0))return '🌲 Duskhold · Outskirts';return z>T.cy+18.5&&Math.abs(x-T.cx)<22?'🏘️ Duskhold · South Ward':'🏰 Duskhold · Grand Square'}
    else if(curMap()<0){const RN=['I','II','III','IV','V','VI'];for(let i=0;i<TWN100_PG.length;i++){const p=TWN100_PG[i];if(Math.hypot(x-p.x,z-p.y)<p.r+2)return PMAP[i].ic+' Portal '+RN[i]+' · '+PMAP[i].n}
      if(Math.abs(x-PCOURT[0])<5&&z>T.cy+T.sz)return '🛤️ The Portal Road'}}}catch(_){}return f.apply(this,arguments)}}
// back from a zone (its home portal, or the Wave Trial): in front of that zone's gate, facing the road
function TWN100_home(){const r=curMap(),i=r>=0&&r<TWN100_PG.length?r:0,p=TWN100_PG[i];toPos(p.a[0],p.a[1],Math.atan2(p.a[0]-p.x,p.a[1]-p.y)+Math.PI)}
// a spot is fine to stand on when there is ground and nothing solid
function TWN100_ok(x,z){const X=Math.round(x),Z=Math.round(z);return X>1&&Z>1&&X<W-2&&Z<H-2&&MAP.DW[Z*W+X]<0&&!solid(x,z)&&!tcHit(x,z)}
function TWN100_fixPos(x,z){if(x==null){x=pl.position.x;z=pl.position.z}if(regionAt(Math.round(x),Math.round(z))>=0)return null;if(TWN100_ok(x,z)){if(Math.hypot(pl.position.x-x,pl.position.z-z)>.5)toPos(x,z);return 'kept'}
  // the old Portal Court (r 19 round PCOURT) and the old courtyard (r 18 round 76,244) are mostly sky now
  if(Math.hypot(x-PCOURT[0],z-PCOURT[1])<22){toPos(PCOURT[0],PCOURT[1]);return 'court'}
  if(Math.hypot(x-76,z-244)<20){toPos(CYD.gate[0],CYD.gate[1]+2.5);return 'yard'}
  for(let r=1;r<7;r++)for(let a=0;a<6.283;a+=.5){const qx=x+Math.cos(a)*r,qz=z+Math.sin(a)*r;if(TWN100_ok(qx,qz)){toPos(qx,qz);return 'near'}}
  toPos(START[0],START[1]);return 'start'}
// (uses the saved spot: the v97 loader sends any older-layout save west of the zones to the spawn when its tile is void)
{const f=loadGame;loadGame=function(){const s=typeof saveInfo=='function'?saveInfo():null;const r=f.apply(this,arguments);try{const p=s&&s.pos;
  TWN100.mig=p&&!p.realm&&p.x<PMAP[0].x0?TWN100_fixPos(p.x,p.z):TWN100_fixPos()}catch(e){console.warn('v100 town load',e)}return r}}

// ---------- market ward + courtyard ward dressing: one baked kit (lantern posts, crates, barrels, benches) ----------
// v101: lantern posts between the shops on both sides of the Grand Square, and inside the south gate
// v109: the dressing (lantern posts, crates and barrels, benches) follows the walls: TWN100_LP and TWN100_wardK(k,F) take the
// kingdom's current size, and TWN100_ward() (1960) rebakes it whenever the walls move.
var TWN100_LP=[];
function TWN100_lpFor(F){const L=[];[-1,1].forEach(s=>[-14.5,7.5,18.5,29.5,40.5].forEach(z=>{if(z<F.SZ-2.5)L.push([s*(F.WX-1.1),z])}));L.push([-3.3,F.SZ-2.4],[3.3,F.SZ-2.4]);return L} // v112: the gate pair stands at the edges of the Gate Avenue (|x| 3.5), not in it
var TWN100_WD={crate:[[-17.6,-11.2,0],[17.7,-11,1]],bench:[-6.6,6.6],benchZ:9.3};
function TWN100_wardK(k,F){const lampK=(x,z,ry)=>k.at(x,0,z,()=>{const h=2.3;k.as('bark',()=>k.L('c',TWC.woodD,[0,0,0],[0,h+.2,0],.08,'log'));k.p('c',TWC.stoneD,'dod',0,.12,0,.2,.14,.2);
      k.as('wood',()=>k.L('c',TWC.woodD,[0,h+.05,0],[.36,h+.05,0],.04,'box'));k.L('m',TWC.iron,[.32,h+.05,0],[.32,h-.1,0],.012,'cyl6',0);
      const lx=.32,ly=h-.28;k.p('m',TWC.iron,'cone4',lx,ly+.2,0,.17,.13,.17,0,Math.PI/4,0,0);k.p('m',TWC.iron,'box',lx,ly-.16,0,.2,.04,.2,0,0,0,0);
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>k.p('m',TWC.iron,'box',lx+q[0]*.09,ly,q[1]*.09,.025,.32,.025,0,0,0,0));k.p('g',0xffd27a,'oct',lx,ly,0,.1,.15,.1)},ry);
  TWN100_lpFor(F).forEach(([x,z])=>lampK(x,z,x<0?0:Math.PI));
  TWN100_WD.crate.forEach(([x,z,b])=>{if(b)TWN100_barrel(k,x,z,1);else{TWN100_crate(k,x,z,.62,.2);TWN100_crate(k,x-.1,z+.1,.4,.6);k.at(0,.62,0,()=>TWN100_crate(k,x,z,.38,1.1))}});
  TWN100_WD.bench.forEach(x=>k.at(x,0,TWN100_WD.benchZ,()=>{k.as('bark',()=>k.L('c',0x6a4a2e,[-.75,.42,0],[.75,.42,0],.16,'cyl6'));k.as('board',()=>k.p('c',0x7a5a3a,'box',0,.5,0,1.5,.07,.34,0,0,0,.06));
    [-.55,.55].forEach(s=>{k.as('bark',()=>k.L('c',TWC.woodD,[s,0,0],[s,.38,0],.13,'log'));k.as('wood',()=>k.L('c',TWC.woodD,[s,.45,-.17],[s,.95,-.24],.05,'box'))});k.as('board',()=>k.p('c',0x6a4a2e,'box',0,.85,-.23,1.5,.18,.06,-.12,0,0,.06))}))}
// the ring changed shape: rebuild it now (kdSync only rebuilds on a level change)
try{if(KGD){KGD.wl=-1;kdSync()}}catch(e){console.warn('v100 walls',e)}

// the two ring halves (north / south of z = 15) are drawn only within ~46 tiles of their stretch
{const f=townTick;townTick=function(now,pp){f.apply(this,arguments);try{const K=KGD,T=TOWNS[0];if(!K||!K.wg||!T.g.visible)return;const z=pp.z-T.cy,L=TWN100_L(),M=TWN100_mid(L.SZ),R=[[-TS,M],[M,L.SZ]];
  K.wg.children.forEach((g,i)=>{const r=R[i]||R[0],d=z<r[0]?r[0]-z:z>r[1]?z-r[1]:0;g.visible=d<46})}catch(_){}}}

