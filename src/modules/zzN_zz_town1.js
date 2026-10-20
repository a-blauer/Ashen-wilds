// ================= v100 town (1/4): the longer Duskhold — wall ring, south wards, courtyard inside the walls =================
// Layout numbers live in w0_world.js: TWN100_SZ (south wall, town-local z), TWN100_IW (inner wall closing the courtyard
// ward), TWN100_PG (portal islands), TWN100_RD (roads), TWN100_SH (market plots), CYD (courtyard), PCOURT (crossroads).
// Town-local frame (T.g): x = world x - T.cx, z = world z - T.cy, ground at T.ph.
//   upper town   z -21..21 : plaza, north row (Trading Post, Tavern, Magic Shop), kingdom structures
//   market ward  z  21..56 : a street (|x|<6) with eight shop plots (|x| 7..11), arch to the plaza at z=21
//   courtyard    z  56..100: the walled garden (CYD) behind the inner gate; south gate at z=100
// This file: the wall ring for every Bastion Walls level (kdWalls), the courtyard's garden wall (cyWalls), area names,
// arriving home from a zone (TWN100_home), old saves standing where there is no ground any more.
var TWN100={walls:null,cy:null,lamps:[]};
function TWN100_L(){const T=TOWNS[0];return {T,R:TS,IW:TWN100_IW,SZ:T.sz||TWN100_SZ}}
// the v83 stone tower (Bastion Walls level 2 used the old tower groups; the ring now needs towers in new places)
function TWN100_tw2(k,r,h){const roofC=TOWNS[0].pal.roof||0x3e3a40,flag=TOWNS[0].pal.ban||0x7a2230;
  twStoneRing(k,TWC.stone,0,0,r*1.08,0,.45,.36);twStoneRing(k,TWC.stone,0,0,r,.45,h,.32);
  const n=Math.max(8,Math.round(r*7));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;k.as('wood',()=>k.L('c',TWC.woodD,[Math.cos(a)*r*.9,h-.25,Math.sin(a)*r*.9],[Math.cos(a)*r*1.22,h+.05,Math.sin(a)*r*1.22],.06,'box'))}
  k.as('board',()=>k.p('c',TWC.wood,'cyl8',0,h+.12,0,r*1.24,.18,r*1.24,0,0,0,.05));
  for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2;k.as('wood',()=>k.p('c',k.R()<.3?TWC.woodD:TWC.wood,'box',Math.cos(a)*r*1.2,h+.42,Math.sin(a)*r*1.2,.07,.5,r*Math.PI*2/n*1.02,0,-a,0,.06))}
  twCone(k,roofC,0,h+.55,0,r*1.42,r*2.3);
  [0,2.1,4.2].forEach(a=>k.p('c',0x18141a,'box',Math.cos(a)*(r+.14),h*.6,Math.sin(a)*(r+.14),.08,.5,.16,0,-a,0,0));
  const top=h+.55+r*2.3;k.L('c',TWC.woodD,[0,top-.3,0],[0,top+1.0,0],.035,'cyl6',0);k.as('cloth',()=>{k.p('c',flag,'box',.34,top+.72,0,.62,.36,.03,0,0,0,.08);k.p('c',flag,'tri',.72,top+.72,0,.36,.2,.03,0,0,-Math.PI/2,.05)})}
function TWN100_tower(k,lv,r,h){if(lv==2)TWN100_tw2(k,r,h);else kdTowerK(k,lv,r,h)}
// the archway between the plaza and the market ward (opening |x|<3.5 along x at z=0 local, both sides are town)
function TWN100_archK(k,lv,w){const hw=w/2,ban=TOWNS[0].pal.ban||0x7a2230;
  if(lv<2){[-1,1].forEach(s=>{[-.35,.35].forEach(dz=>{k.as('bark',()=>k.L('c',TWC.woodD,[s*(hw+.25),-.3,dz],[s*(hw+.25),4.1,dz],.2,'log'));if(lv==1)twStones(k,TWC.stone,s*(hw+.25)-.32,dz,s*(hw+.25)+.32,dz,-.3,.8,.6,.35)});
      k.as('wood',()=>k.p('c',TWC.woodD,'cone6',s*(hw+.25),4.35,0,.26,.5,.26,0,0,0,.05))});
    k.as('board',()=>k.p('c',TWC.wood,'box',0,3.35,0,w+1.2,.62,.62,0,0,0,.02));k.as('wood',()=>{[-1,1].forEach(q=>k.L('c',TWC.woodD,[-hw-.6,3.05,q*.34],[hw+.6,3.05,q*.34],.08,'box'));
      [-1,1].forEach(s=>k.L('c',TWC.woodD,[s*(hw+.1),2.3,0],[s*(hw-.9),3.05,0],.07,'box'))})}
  else{// stone arch: two piers, a round-ish arch of voussoirs, a walkway with merlons on top
    [-1,1].forEach(s=>{twStones(k,TWC.stone,s*(hw+.5)-.55,0,s*(hw+.5)+.55,0,-.3,3.0,1.2,.5);k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',s*(hw+.5),3.05,0,1.3,.14,1.3,0,0,0,.03))});
    const n=11;for(let i=0;i<n;i++){const a=Math.PI*(i+.5)/n,x=Math.cos(a)*hw,y=3.0+Math.sin(a)*.9;k.p('c',i%2?TWC.stoneL:TWC.stone,'box',x,y,0,.62,.5,1.1,0,0,a-Math.PI/2,.08)}
    twStones(k,TWC.stone,-hw-1.05,0,hw+1.05,0,3.3,4.25,1.1,.6);k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',0,4.3,0,w+2.3,.12,1.25,0,0,0,.02));
    for(let x=-hw-.6;x<=hw+.65;x+=1.2)[-1,1].forEach(q=>k.p('c',TWC.stone,'box',x,4.62,q*.48,.6,.55,.3,0,0,0,.08));
    [-1,1].forEach(q=>kdBanner(k,0,4.05,q*.6,q>0?0:Math.PI,ban,.9,1.3));
    if(lv>=3)[-1,1].forEach(s=>kdBrazier(k,s*(hw+.5),0,3.12,.7))}}
// the ring, baked per level into three kits (upper town / market ward / courtyard ward) so each part can be culled
function TWN100_ringK(k,lv,part){const {R,IW,SZ}=TWN100_L(),gz=1.75,at=(x,z,ry,f)=>k.at(x,0,z,f,ry),seg=(x0,z0,x1,z1,ry)=>at((x0+x1)/2,(z0+z1)/2,ry,()=>kdSegK(k,lv,Math.hypot(x1-x0,z1-z0)));
  const side=(z0,z1)=>[-1,1].forEach(s=>seg(s*R,z0,s*R,z1,-s*Math.PI/2)),cross=(z,g,ry)=>{seg(-R,z,-g,z,ry);seg(g,z,R,z,ry)};
  const big=(x,z,i)=>at(x,z,i*1.3,()=>TWN100_tower(k,lv,1.45,4.2)),small=(x,z,i)=>at(x,z,i*.9+(x+z)%6,()=>TWN100_tower(k,lv,.95,3.1)),mid=(x,z,i)=>at(x,z,i*1.7,()=>kdTowerK(k,3,1.15,3.6));
  if(part==0){seg(-R,-R,R,-R,0);side(-R,-gz);side(gz,R);cross(R,3.5,Math.PI);
    [-1,1].forEach(s=>{[-2.3,2.3].forEach((z,i)=>small(s*R,z,i));big(s*R,-R,s);big(s*R,R,s+2);at(s*R,0,s>0?Math.PI:0,()=>kdGateK(k,lv))});
    at(0,R,0,()=>TWN100_archK(k,lv,7));if(lv>=3){[[-10.5,-R],[10.5,-R],[-R,-11.5],[R,-11.5],[-R,11.5],[R,11.5]].forEach(([x,z],i)=>mid(x,z,i))}}
  else if(part==1){side(R,IW);cross(IW,gz,Math.PI);at(0,IW,Math.PI/2,()=>kdGateK(k,lv));[-1,1].forEach(s=>{big(s*R,IW,s+4);small(s*2.3,IW,s)});
    if(lv>=3)[-1,1].forEach(s=>mid(s*R,(R+IW)/2,s))}
  else{side(IW,SZ);cross(SZ,gz,Math.PI);at(0,SZ,Math.PI/2,()=>kdGateK(k,lv));[-1,1].forEach(s=>{big(s*R,SZ,s+6);small(s*2.3,SZ,s+2)});
    if(lv>=3)[-1,1].forEach(s=>mid(s*R,(IW+SZ)/2,s+3))}}
function kdWalls(T,lv){const K=kdState(),o=kdOld(T);if(K.wg){T.g.remove(K.wg);K.wg=null}
  o.gate.forEach(q=>q.visible=false);o.tw.forEach(q=>q.visible=false);o.ban.forEach(q=>q.visible=false);
  const g=new THREE.Group();g.name='kdWalls';
  [0,1,2].forEach(part=>{const key='TWNRING|'+lv+'|'+part;let k=null;if(!twHas(key)){k=twKit(611+lv*3+part);TWN100_ringK(k,lv,part)}const pg=twGroup(k,key);pg.name='kdWalls'+part;g.add(pg)});
  K.wg=g;T.g.add(g);
  const {R,IW,SZ}=TWN100_L(),cols=[],lamps=[];
  if(lv>=3){[[-10.5,-R],[10.5,-R],[-R,-11.5],[R,-11.5],[-R,11.5],[R,11.5],[-R,(R+IW)/2],[R,(R+IW)/2],[-R,(IW+SZ)/2],[R,(IW+SZ)/2]].forEach(([x,z])=>cols.push({x:T.cx+x,z:T.cy+z,r:1.15}));
    [-1,1].forEach(s=>[-1,1].forEach(q=>lamps.push([T.cx+s*(R+1.25),T.ph+1.2,T.cy+q*2.75])));[IW,SZ].forEach(z=>[-1,1].forEach(q=>lamps.push([T.cx+q*2.75,T.ph+1.2,T.cy+z+1.25])))}
  kdCol(T,K.wcol=K.wcol||[],cols);K.wl=lv;return lamps}

// ---------- the courtyard: a low garden wall of rough stone, openings toward the inner gate (north) and the south gate ----------
function cyWalls(){const C=CYD,r=C.r,gaps=[Math.atan2(C.gate[1]-C.y,C.gate[0]-C.x),Math.atan2(C.gate2[1]-C.y,C.gate2[0]-C.x)],gw=2.3/r;
  const inGap=a=>gaps.some(g=>{let d=Math.abs(a-g);if(d>Math.PI)d=6.283-d;return d<gw});
  CYG.walls.forEach(([x,y])=>{if(MAP[y][x]=='B'){MAP[y][x]='g';mmPaint(x,y)}});CYG.walls=[];
  for(let y=Math.floor(C.y-r-2);y<=C.y+r+2;y++)for(let x=Math.floor(C.x-r-2);x<=C.x+r+2;x++){const t=MAP[y]&&MAP[y][x];if(t!=='.'&&t!=='g')continue;
    const d=Math.hypot(x-C.x,y-C.y);if(d>=r-.4&&d<r+.6&&!inGap(Math.atan2(y-C.y,x-C.x))){MAP[y][x]='B';CYG.walls.push([x,y]);mmPaint(x,y)}}
  if(CYG.g){scene.remove(CYG.g);CYG.g=null}
  const n=bossDone.size,key='CYW100|'+r.toFixed(2);let k=null;
  if(!twHas(key)){k=twKit(171+Math.round(r*10));
    // the wall in short straight runs round the circle; capstones and the odd ivy tuft on top
    const N=Math.round(6.283*r/1.15);for(let i=0;i<N;i++){const a0=i/N*6.283,a1=(i+1)/N*6.283,am=(a0+a1)/2;if(inGap(a0)||inGap(a1))continue;
      const x0=Math.cos(a0)*r,z0=Math.sin(a0)*r,x1=Math.cos(a1)*r,z1=Math.sin(a1)*r;twStones(k,TWC.stone,x0,z0,x1,z1,-.2,.95,.62,.42);
      k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',Math.cos(am)*r,1.0,Math.sin(am)*r,Math.hypot(x1-x0,z1-z0)+.06,.12,.78,0,-am+Math.PI/2,0,.04));
      if(i%3==0)k.p('c',[0x3e6a34,0x4a7a3a,0x35602e][i%3==0?(i/3|0)%3:0],'ico',Math.cos(am)*(r+.05),1.12,Math.sin(am)*(r+.05),.3,.18,.36,0,am,0,.12);
      if(i%5==2)k.p('c',0x3e6a34,'box',Math.cos(am)*(r+.33),.62,Math.sin(am)*(r+.33),.42,.7,.04,0,-am+Math.PI/2,0,.06)}
    // posts with lanterns either side of each opening
    gaps.forEach(g=>[-1,1].forEach(s=>{const a=g+s*(gw+.32/r),x=Math.cos(a)*r,z=Math.sin(a)*r;twStones(k,TWC.stoneD,x-.3,z,x+.3,z,-.2,1.5,.6,.3);
      k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',x,1.55,z,.74,.12,.74,0,0,0,.03));k.p('m',TWC.iron,'cone4',x,1.95,z,.2,.16,.2,0,Math.PI/4,0,0);
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>k.p('m',TWC.iron,'box',x+q[0]*.1,1.72,z+q[1]*.1,.025,.3,.025,0,0,0,0));k.p('g',0xffd27a,'oct',x,1.72,z,.1,.14,.1)}))}
  const g=twGroup(k,key);g.position.set(C.x,TOWNS[0].ph,C.y);g.name='cyWalls';scene.add(g);CYG.g=g;
  // a sign on the north opening
  {const a=gaps[0]+gw+1.3/r,x=C.x+Math.cos(a)*(r+.2),z=C.y+Math.sin(a)*(r+.2),y=GH(x,z),sg=twPostG(1.7,1.65,.46);sg.position.set(x,y,z);sg.rotation.y=0;g.parent.add(sg);CYG.sg&&scene.remove(CYG.sg);CYG.sg=sg;
    sign(sg,[{t:'🌲 Courtyard',f:'700 40px'},{t:n?n+' zone'+(n>1?'s':'')+' tended':'Wood & stone',f:'600 26px'}],1.7,.46,'#1a2414','#efe6d8',null,0,1.65,0,0)}}
// the courtyard sign posts and lanterns are rebuilt with the wall (the v85 cyWalls already ran once at load with the old rules)
try{if(CYG.g){scene.remove(CYG.g);CYG.g=null}CYG.n=-1;cySync()}catch(e){console.warn('v100 courtyard',e)}

// ---------- names, coming home, old saves ----------
{const f=areaName;areaName=function(){try{if(!inRealm&&!inDun){const T=TOWNS[0],x=pl.position.x,z=pl.position.z;
    if(townAt(x,z,0)==0){const dz=z-T.cy;if(dz>TWN100_IW)return Math.hypot(x-CYD.x,z-CYD.y)<CYD.r+.8?'🌲 Duskhold · Courtyard':'🌲 Duskhold · Courtyard ward';if(dz>TS)return '🏰 Duskhold · Market ward'}
    else if(curMap()<0){for(let i=0;i<TWN100_PG.length;i++){const p=TWN100_PG[i];if(Math.hypot(x-p.x,z-p.y)<p.r+2)return PMAP[i].ic+' '+PMAP[i].n+' gate'}}}}catch(_){}return f.apply(this,arguments)}}
// back from a zone (its home portal, or the Wave Trial): in front of that zone's gate, facing the road
function TWN100_home(){const r=curMap(),i=r>=0&&r<TWN100_PG.length?r:0,p=TWN100_PG[i];toPos(p.a[0],p.a[1],Math.atan2(p.a[0]-p.x,p.a[1]-p.y)+Math.PI)}
// a spot is fine to stand on when there is ground and nothing solid
function TWN100_ok(x,z){const X=Math.round(x),Z=Math.round(z);return X>1&&Z>1&&X<W-2&&Z<H-2&&MAP.DW[Z*W+X]<0&&!solid(x,z)&&!tcHit(x,z)}
function TWN100_fixPos(){if(inRealm||inDun)return null;const x=pl.position.x,z=pl.position.z;if(regionAt(Math.round(x),Math.round(z))>=0||TWN100_ok(x,z))return null;
  // the old Portal Court (r 19 round PCOURT) and the old courtyard (r 18 round 76,244) are mostly sky now
  if(Math.hypot(x-PCOURT[0],z-PCOURT[1])<22){toPos(PCOURT[0],PCOURT[1]);return 'court'}
  if(Math.hypot(x-76,z-244)<20){toPos(CYD.gate[0],CYD.gate[1]+2.5);return 'yard'}
  for(let r=1;r<7;r++)for(let a=0;a<6.283;a+=.5){const qx=x+Math.cos(a)*r,qz=z+Math.sin(a)*r;if(TWN100_ok(qx,qz)){toPos(qx,qz);return 'near'}}
  toPos(START[0],START[1]);return 'start'}
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{TWN100.mig=TWN100_fixPos()}catch(e){console.warn('v100 town load',e)}return r}}

// ---------- market ward + courtyard ward dressing (independent of the kingdom level) ----------
{const T=TOWNS[0],prev=T_cur;T_cur=T;try{
  [30,38,46].forEach(z=>[-1,1].forEach(s=>lamp(T.g,T,s*5.4,z)));[-1,1].forEach(s=>{lamp(T.g,T,s*2.4,TWN100_IW+3.4);lamp(T.g,T,s*3.2,(T.sz||TWN100_SZ)-2.6)});
  // alleys between the plots: crates, barrels, a cart
  [[-6.2,30.2],[6.3,38.1],[-6.4,46.3],[6.1,29.8]].forEach(([x,z],i)=>{if(i%2)barrel(T.g,x,z);else{crate(T.g,x,z,.62);crate(T.g,x+(x<0?-.15:.15),z+.1,.42,.62)}});
  // the courtyard ward's corners: woodpiles and a bench by the inner gate
  bench(T.g,-8.2,TWN100_IW+4,0);bench(T.g,8.2,TWN100_IW+4,0);
}catch(e){console.warn('v100 ward dressing',e)}finally{T_cur=prev}}
// the ring changed shape: rebuild it now (kdSync only rebuilds on a level change)
try{if(KGD){KGD.wl=-1;kdSync()}}catch(e){console.warn('v100 walls',e)}
