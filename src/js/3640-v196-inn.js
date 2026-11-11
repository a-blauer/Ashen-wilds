// ================= v196: The Last Lantern — an inn you can walk into =================
// Owner (Nov 3 2026): "Lets make the Inn an actual building you can walk into with a bar, fire, tables — and make it extra cozy."
// The inn stands on the plaza ring (DM196_FIX.inn in 0045: 11 x 8 tiles, door toward the fountain). Lot-local frame (lotW103):
// x across the front (-5.5..5.5), z toward the plaza (front wall at z = +4, door |x| < .85).
//  * Shell (always drawn): stone footing and walls up to the sill, timber and plaster above, a plank floor (v213b: no ceiling beams); inside a long
//    bar with stools, shelves of bottles and casks behind it, a great stone hearth with a living fire on the right wall, three round
//    tables with chairs and candles, a fireside bench, a rug, hanging lanterns, a stag skull.
//  * Roof (its own group): a steep slate roof with two dormers, the chimney and moss. It is hidden while you are inside, so the camera
//    looks into the room; the walls between you and the camera fade like every other building (v192).
//  * Walls and furniture are solid (town colliders), the doorway is open; the rest prompt (T.tv) is at the bar, where the innkeeper
//    stands. The seats are listed for the townsfolk (DM196I.seats: chairs, stools and the bench, with the table they face) — 3650
//    walks villagers in to sit and eat. Warm point lights come from the hearth and the lanterns (TLAMP).
// v213 (owner, Nov 9 2026: "make the Inn 40% larger and make the roof completely transparent when inside"): the room is 12.2 x 10.2
// (was 11 x 8: 41% more floor, as large as fits between the avenue, the west house lot, the town wall and the fountain; the lot sits at
// r 13.8, -48°),
// 3.6 high. The four walls above the footing are their own groups (DM196I.w: f b l r) and so is the porch (DM196I.outF): inside,
// the roof is hidden and every wall the camera stands outside of is cut away with the porch, so nothing hides the room (dm196InnCut).
// The card table of v213 (3850) stands at DM196I.card, its dealer on the left wall's side.
var DM196I={W2:6.1,D2:5.1,H:3.6,rise:3.0,hz:-1.6,card:[-3.6,1.8],w:{},outF:null,barTop:.85,g:null,roof:null,col:[],lamps:[],seats:[],an:null,inside:false,keeper:null,l:null};
function dm196InnK(k,R){const W2=DM196I.W2,D2=DM196I.D2,H=DM196I.H,st=0x6e6a64,stD=0x55525a,pl=0xd8ccb0,wood=0x5a3c24,woodD=0x3a281a,warm=0xffc070;
  // floor and footing
  k.as('board',()=>{for(let x=-W2+.35;x<W2;x+=.5)k.p('c',R()<.3?0x6a4a2e:0x7a5636,'box',x,.05,0,.48,.06,2*D2-.3,0,0,0,.02)});
  twStones(k,stD,-W2,-D2,W2,-D2,0,.36,.4);twStones(k,stD,-W2,D2,-.9,D2,0,.36,.4);twStones(k,stD,.9,D2,W2,D2,0,.36,.4);twStones(k,stD,-W2,-D2,-W2,D2,0,.36,.4);twStones(k,stD,W2,-D2,W2,D2,0,.36,.4);
  k.as('ashlar',()=>k.p('c',st,'box',0,.18,D2+.45,2.0,.36,.7,0,0,0,.04)); // the doorstep
  // v213: the walls above the footing are built by dm196InnWallK (one group per side, cut away from inside)
  // v213b: no ceiling beams (owner: the cross beams blocked the camera inside)
  // the bar: a long counter on the left back (v199: top at ~.85 above the floor, it stood chest high and hid the innkeeper), stools, shelves of bottles and casks behind it, a tap barrel
  const bz=-1.9,FL=-.32;k.at(DM196I.bar[0],0,DM196I.bar[1],()=>{const D2=4;k.at(0,FL,0,()=>{k.as('wood',()=>{k.p('c',wood,'box',-3.0,.75,bz,4.2,.7,.5,0,0,0,.03);k.p('c',0x6a4a2e,'box',-3.0,1.13,bz+.05,4.5,.08,.72,0,0,0,.03);k.p('c',woodD,'box',-.95,.75,bz-.9,.5,.7,1.8,0,0,0,.03)});
  for(let i=0;i<4;i++){const x=-4.6+i*1.05;k.as('wood',()=>{k.L('c',woodD,[x,.36,bz+.85],[x,.78,bz+.85],.05,'cyl6');k.p('c',0x6a4a2e,'cyl8',x,.8,bz+.85,.26,.07,.26,0,0,0,.02)})}})
  k.as('wood',()=>[1.0,1.6,2.2].forEach(y=>k.p('c',woodD,'box',-3.0,y,-D2+.3,4.6,.06,.34,0,0,0,.02)));
  [1.0,1.6,2.2].forEach((y,j)=>{for(let i=0;i<9;i++){const x=-5.0+i*.5+(j%2)*.2;k.p(R()<.3?'g':'c',[0x3a6a3a,0x6a2a2a,0x2a3a6a,0xd8b060,0x5a3a6a][(i+j)%5],'cyl6',x,y+.17,-D2+.3,.06,.28,.06,0,0,0,0)}});
  [[-5.0,-3.0],[-4.3,-3.0]].forEach(([x,z])=>TWN100_barrel(k,x,z,.9));k.at(-4.65,.82,-3.0,()=>TWN100_barrel(k,0,0,.75));
  k.at(0,FL,0,()=>{k.as('wood',()=>{k.p('c',0x7a5230,'cyl8',-1.9,1.35,bz-.05,.22,.4,.22,Math.PI/2,0,0,.03)});k.p('m',0xb08a3a,'cyl6',-1.9,1.35,bz+.2,.04,.12,.04,Math.PI/2,0,0,0);
  [[-2.6,0],[-3.4,.3],[-4.2,-.1]].forEach(([x,o])=>{k.p('m',0x8a7a5a,'cyl8',x,1.26,bz+.1+o*.1,.07,.15,.07);k.p('c',0xe8e0c8,'cyl8',x,1.35,bz+.1+o*.1,.06,.03,.06)})});});
  // the hearth: a great stone fireplace on the right wall, a fire grate, a mantel with candles, a cauldron, logs
  const hx=W2-.2,hz=DM196I.hz;twStones(k,st,hx-.75,hz-1.15,hx-.75,hz-.55,.36,2.4,.5);twStones(k,st,hx-.75,hz+.55,hx-.75,hz+1.15,.36,2.4,.5);
  twStones(k,stD,hx,hz-1.15,hx,hz+1.15,.36,H,.5);twStones(k,st,hx-.8,hz-1.2,hx-.8,hz+1.2,1.45,2.5,.45);
  k.as('ashlar',()=>{k.p('c',0x8a8478,'box',hx-1.05,1.42,hz,.35,.12,2.6,0,0,0,.02);k.p('c',stD,'box',hx-.45,.4,hz,1.3,.1,1.3,0,0,0,.02)});
  for(let i=0;i<3;i++)k.as('bark',()=>k.L('c',[0x4a3020,0x5a3a22,0x3e2a1a][i],[hx-.85,.52+i*.06,hz-.4+i*.3],[hx-.25,.5+i*.07,hz+.1-i*.25],.08,'log'));
  k.p('g',0xff5a14,'box',hx-.45,.47,hz,.9,.05,.9,0,0,0,0);k.p('g',0x8a2a08,'box',hx-.22,1.0,hz,.05,1.0,1.0,0,0,0,0);k.p('m',0x2a2a30,'sph',hx-.55,.75,hz+.45,.24,.2,.24);k.L('m',0x2a2a30,[hx-.55,1.3,hz+.45],[hx-.55,.95,hz+.45],.01,'cyl6',0);
  [-.8,.8].forEach(o=>dc190Candle(k,hx-1.05,1.48,hz+o,.16));k.as('plain',()=>{k.p('c',0xe8e0c8,'dod',hx-1.0,1.7,hz,.18,.15,.2);[-1,1].forEach(s=>k.L('c',0xe8e0c8,[hx-1.0,1.75,hz+s*.14],[hx-1.05,2.2,hz+s*.55],.03,'cone6'))}); // a stag skull over the mantel
  for(let i=0;i<6;i++)k.as('bark',()=>k.L('c',[0x5a3a22,0x6a4a2a][i%2],[hx-.6,.45+Math.floor(i/3)*.19,hz+1.55+(i%3)*.18],[hx-1.5,.45+Math.floor(i/3)*.19,hz+1.55+(i%3)*.18],.09,'log'));
  // a rug before the fire, the fireside bench
  k.at(DM196I.rug[0],FL,DM196I.rug[1],()=>{
  k.as('cloth',()=>{k.p('c',0x6a1e26,'box',2.4,.41,-.9,2.8,.02,2.0,0,0,0,.01);k.p('c',0xc9a24a,'box',2.4,.415,-.9,2.5,.02,1.7,0,0,0,0);k.p('c',0x4a1018,'box',2.4,.42,-.9,2.2,.02,1.4,0,0,0,.01)});
  k.as('wood',()=>{k.p('c',0x6a4a2e,'box',2.9,.66,-2.9,2.2,.08,.46,0,0,0,.03);k.p('c',woodD,'box',2.9,1.03,-3.12,2.2,.62,.08,0,0,0,.03);[-.9,.9].forEach(o=>k.L('c',woodD,[2.9+o,.36,-2.9],[2.9+o,.64,-2.9],.06,'box'))});
  });k.at(0,FL,0,()=>{
  // three round tables, chairs, candles, mugs, a loaf and a roast
  DM196I.tables.forEach(([x,z],ti)=>k.at(0,-.1,0,()=>{k.as('wood',()=>{k.p('c',0x6a4a2e,'cyl8',x,1.08,z,.62,.08,.62,0,0,0,.02);k.L('c',woodD,[x,.36,z],[x,1.04,z],.09,'cyl6');k.p('c',woodD,'cyl8',x,.42,z,.32,.06,.32,0,0,0,.02)});
    dc190Candle(k,x,1.12,z,.14);k.p('m',0x8a7a5a,'cyl8',x+.3,1.18,z-.1,.07,.14,.07);k.p('m',0x8a7a5a,'cyl8',x-.25,1.18,z+.2,.07,.14,.07);
    if(ti==0){k.p('c',0xb8843a,'sph',x-.15,1.18,z-.25,.2,.12,.14);k.p('c',0x8a4a2a,'ico',x+.15,1.2,z+.25,.16,.1,.13)}else if(ti==1)k.p('c',0xc89a5a,'sph',x+.1,1.17,z+.1,.18,.1,.12)}));
  DM196I.seats.forEach(s=>{if(s.k!='chair')return;const a=Math.atan2(s.x-s.tx,s.z-s.tz);k.at(s.x,-.14,s.z,()=>{k.as('wood',()=>{k.p('c',0x6a4a2e,'box',0,.82,0,.48,.07,.46,0,0,0,.03);
      [[-.19,-.18],[.19,-.18],[-.19,.18],[.19,.18]].forEach(([u,v])=>k.L('c',woodD,[u,.36,v],[u,.8,v],.035,'box'));k.p('c',woodD,'box',0,1.18,.2,.46,.58,.06,0,0,0,.03)})},a)});
  });
  // lanterns hanging on chains, a notice board (v213b: the herbs went with the beams they hung from)
  DM196I.lantern.forEach(([x,z])=>{k.L('m',TWC.iron,[x,H-.15,z],[x,2.55,z],.012,'cyl6',0);TWN100_lantern(k,x,2.32,z,warm)});

  k.as('board',()=>k.p('c',0x5a3c24,'box',-W2+.2,1.9,-.4,.06,.8,1.2,0,0,0,.02));[0,1,2].forEach(i=>k.p('c',0xe8dcc0,'box',-W2+.25,1.85+(i%2)*.2,-.7+i*.3,.02,.3,.22,0,0,(i-1)*.1,0))}
// v213: one wall above the footing: stone to the sill, timber framing and plaster panels above, its windows (side 'f' with the doorway)
function dm196InnWallK(side){return (k,R)=>{const W2=DM196I.W2,D2=DM196I.D2,H=DM196I.H,st=0x6e6a64,pl=0xd8ccb0,woodD=0x3a281a,warm=0xffc070;
  const wall=(x0,z0,x1,z1)=>{twStones(k,st,x0,z0,x1,z1,.36,1.4,.36);const L=Math.hypot(x1-x0,z1-z0),ux=(x1-x0)/L,uz=(z1-z0)/L,ry=Math.atan2(-uz,ux);
    k.as('plaster',()=>k.p('c',pl,'box',(x0+x1)/2,(1.4+H)/2,(z0+z1)/2,L,H-1.4,.2,0,ry,0,.02));
    const nx=-uz*.12,nz=ux*.12;k.as('wood',()=>[-1,1].forEach(q=>{for(let t=0;t<=L+.01;t+=Math.max(.9,L/Math.round(L/1.2))){const x=x0+ux*t+nx*q,z=z0+uz*t+nz*q;k.L('c',woodD,[x,1.4,z],[x,H,z],.07,'box')}
      [1.45,H-.05].forEach(y=>k.L('c',woodD,[x0+nx*q,y,z0+nz*q],[x1+nx*q,y,z1+nz*q],.07,'box'));for(let t=.6;t<L-.4;t+=2.4){const x=x0+ux*t+nx*q,z=z0+uz*t+nz*q;k.L('c',woodD,[x,1.45,z],[x+ux*1.1,H-.05,z+uz*1.1],.05,'box')}}))};
  if(side=='b')wall(-W2,-D2,W2,-D2);
  if(side=='l'){wall(-W2,-D2,-W2,D2);[-2.0,2.4].forEach(z=>{twWindow(k,-W2-.12,1.9,z,.8,.7,-Math.PI/2,warm);twWindow(k,-W2+.12,1.9,z,.8,.7,Math.PI/2,warm)})}
  if(side=='r'){wall(W2,-D2,W2,D2);twWindow(k,W2+.12,1.9,2.6,.8,.7,Math.PI/2,warm);twWindow(k,W2-.12,1.9,2.6,.8,.7,-Math.PI/2,warm)}
  if(side=='f'){wall(-W2,D2,-.85,D2);wall(.85,D2,W2,D2);
    twStones(k,st,-.95,D2,.95,D2,2.25,H,.36);k.as('wood',()=>k.L('c',woodD,[-1.0,2.25,D2+.05],[1.0,2.25,D2+.05],.1,'box'));
    [-.9,.9].forEach(x=>k.as('wood',()=>k.L('c',woodD,[x,.36,D2+.05],[x,2.25,D2+.05],.09,'box')));
    [-3.6,3.6].forEach(x=>{twWindow(k,x,1.9,D2+.12,.95,.75,0,warm);twWindow(k,x,1.9,D2-.12,.95,.75,Math.PI,warm)})}}}
function dm196InnRoofK(k,R){const W2=DM196I.W2,D2=DM196I.D2,H=DM196I.H,RS=DM196I.rise;twGable(k,0x3a3644,2*W2+.4,2*D2+.4,RS,.5,H);
  // two dormers on the front slope, the chimney over the hearth, moss along the eaves
  [-3.0,3.0].forEach(x=>{const z=2.6,y=H+RS*(1-z/(D2+.2))+.17;k.as('plaster',()=>k.p('c',0xd8ccb0,'box',x,y,z,1.0,1.0,.9,0,0,0,.03));twWindow(k,x,y,z+.47,.5,.45,0,0xffc070);k.at(x,0,z,()=>twGable(k,0x3a3644,1.2,1.0,.55,.12,y+.5))});
  TWN100_chim(k,W2-.2,DM196I.hz,H,H+4.0,TWC.stone);
  for(let i=0;i<14;i++){const x=-W2+.4+i*(2*W2-.8)/13;dm196Moss(k,x+(R()-.5)*.3,H+.1,D2+.42,.9+R()*.4,i);if(i%2)dm196Moss(k,x,H+.1,-D2-.42,.9,i+5)}
  for(let i=0;i<5;i++)dm196Moss(k,-W2+1+R()*(2*W2-2),H+RS*.37+R()*RS*.44,(R()<.5?1:-1)*(D2*.6),.7,i+30)}
// outside: the sign over the door, a lantern on a bracket, barrels and a bench, ivy, moss and flower boxes (L2 dressing without the turret)
// outside: the porch (posts, beam, its little roof, the lantern, ivy on the posts, the flower boxes): dm196InnPorchK, cut away with the front wall;
// barrels, a bench, pots, moss and the ivy on the corners stay (dm196InnOutK)
function dm196InnPorchK(k,R){const W2=DM196I.W2,D2=DM196I.D2;[-1.25,1.25].forEach(x=>{k.as('bark',()=>k.L('c',TWC.woodD,[x,0,D2+1.35],[x,2.55,D2+1.35],.09,'log'));k.as('ashlar',()=>k.p('c',DM196C.stoneD,'box',x,.12,D2+1.35,.36,.24,.36,0,0,0,.03))});
  k.as('wood',()=>{k.L('c',TWC.woodD,[-1.5,2.55,D2+1.35],[1.5,2.55,D2+1.35],.09,'box');[-1.25,1.25].forEach(x=>k.L('c',TWC.woodD,[x,2.55,D2+1.35],[x,2.9,D2+.05],.07,'box'))});
  k.at(0,0,D2+.75,()=>twGable(k,0x3a3644,3.3,1.7,.55,.14,2.62));for(let i=0;i<5;i++)dm196Moss(k,-1.4+i*.7,2.7,D2+1.6,.8,i+60);
  [-1.25,1.25].forEach((x,j)=>dm196Ivy(k,x+.1,D2+1.38,2.4,0,1,j+20));k.L('m',TWC.iron,[1.4,2.6,D2+.05],[1.4,2.6,D2+.75],.025,'box',0);TWN100_lantern(k,1.4,2.25,D2+.75,0xffc070);
  [-3.6,3.6].forEach(x=>{k.as('wood',()=>k.p('c',0x5a3c24,'box',x,1.42,D2+.28,1.05,.16,.22,0,0,0,.02));for(let i=0;i<5;i++)k.p('c',DM196C.flw[i],'sph',x-.4+i*.2,1.55,D2+.28,.08,.07,.08,0,i,0,.04)})}
function dm196InnOutK(k,R){const W2=DM196I.W2,D2=DM196I.D2;
  TWN100_barrel(k,-5.2,D2+.8,.9);TWN100_barrel(k,-4.6,D2+1.0,.8);k.as('wood',()=>{k.p('c',0x6a4a2e,'box',4.4,.5,D2+.75,1.6,.07,.34,0,0,0,.05);[3.75,5.05].forEach(x=>k.L('c',TWC.woodD,[x,0,D2+.75],[x,.46,D2+.75],.05,'box'))});
  [-1,1].forEach((s,j)=>dm196Ivy(k,s*(W2+.03),D2+.03,2.9,0,1,j*4+2));dm196Ivy(k,-W2-.03,0,2.8,-1,0,7);dm196Ivy(k,W2+.03,1.4,2.8,1,0,9);
  for(let i=0;i<12;i++)dm196Moss(k,-W2+.3+i*1.15,.42,D2+.3,.9,i+40);dm196Pot(k,-1.6,D2+.7,3,1);dm196Pot(k,2.0,D2+.6,5,.9)}
// the layout the builders and the villagers share (lot-local)
// v218: the third dining table (3.4, 3.0) made room for the Four Roads' card table (3900); its lantern hangs over that table now
DM196I.tables=[[-.5,-1.5],[.9,1.7]];DM196I.bar=[-.9,-1.1];DM196I.rug=[.9,-.7];
DM196I.lantern=[[-.5,-1.5],[.9,1.7],[-3.6,1.8],[3.6,2.95]];
(function(){const S=[];DM196I.tables.forEach(([x,z],ti)=>{const n=ti==2?3:4;for(let j=0;j<n;j++){const a=(j/n)*6.283+(ti==2?.5:.785);const sx=x+Math.sin(a)*1.0,sz=z+Math.cos(a)*1.0;
    if(sz>DM196I.D2-.45||Math.abs(sx)>DM196I.W2-.5)continue;S.push({k:'chair',x:+sx.toFixed(2),z:+sz.toFixed(2),tx:x,tz:z,t:ti})}});
  const B=DM196I.bar,G=DM196I.rug;for(let i=0;i<4;i++)S.push({k:'stool',x:-4.6+i*1.05+B[0],z:-1.9+.85+B[1],tx:-4.6+i*1.05+B[0],tz:-1.9+B[1],t:-1});
  [2.3,3.5].forEach(x=>S.push({k:'bench',x:x+G[0],z:-2.9+.1+G[1],tx:x+G[0],tz:-1.0+G[1],t:-2}));DM196I.seats=S})();
function dm196InnBuild(){const T=TOWNS[0],l=dm196Fix('inn');if(!l)return;DM196I.l=l;
  [DM196I.g,DM196I.roof,DM196I.out,DM196I.outF].concat(Object.values(DM196I.w)).forEach(o=>{if(o)scene.remove(o)});
  const mk=(key,seed,fn)=>{let k=null;if(!twHas(key)){k=twKit(seed);fn(k,k.R)}const g=twGroup(k,key),[x,z]=lotW103(l,0,0);g.position.set(x,T.ph-.0,z);g.rotation.y=l.ry;g.userData.lpsSkip=1;scene.add(g);return g};
  DM196I.g=mk('DM196INN',19611,dm196InnK);DM196I.g.name='dm196inn';DM196I.roof=mk('DM196INNR',19612,dm196InnRoofK);DM196I.roof.name='dm196innRoof';DM196I.out=mk('DM196INNO',19613,dm196InnOutK);DM196I.out.name='dm196innOut';
  DM196I.outF=mk('DM196INNP',19614,dm196InnPorchK);DM196I.outF.name='dm196innPorch';
  DM196I.w={};['f','b','l','r'].forEach((sd,i)=>{const g=mk('DM196INNW'+sd,19620+i,dm196InnWallK(sd));g.name='dm196innWall_'+sd;DM196I.w[sd]=g});
  sign(DM196I.outF,[{t:T.tav.toUpperCase(),f:'700 52px'}],2.4,.5,'#2a1a10','#ffd88a','#c9a24a',0,2.17,DM196I.D2+1.42,0,512,120);
  // the fire, lit warm; the lanterns' glow
  const hx=DM196I.W2-.2,hz=DM196I.hz;DM196I.an=dc190Fire(DM196I.g,[[hx-.5,.5,hz,1.7],[hx-.55,.5,hz-.32,1.15],[hx-.55,.5,hz+.34,1.2]]);
  const FA={x:T.cx+l.x,z:T.cy+l.z,f:now=>{if(DM196I.g.visible)DM196I.an(now)}};TANIM.push(FA);
  DM196I.lamps.forEach(L=>{const i=TLAMP.indexOf(L);if(i>=0)TLAMP.splice(i,1)});DM196I.lamps=[];
  [[hx-.6,1.0,hz]].concat(DM196I.lantern.map(([x,z])=>[x,2.3,z])).forEach(([x,y,z])=>{const [X,Z]=lotW103(l,x,z),L=[X,T.ph+y,Z];TLAMP.push(L);DM196I.lamps.push(L)});
  // colliders: the walls as a chain of small circles (the doorway open), the bar, the hearth, tables and the bench
  const C=[],cw=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/.45));for(let i=0;i<=n;i++){const t=i/n,[X,Z]=lotW103(l,x0+(x1-x0)*t,z0+(z1-z0)*t);C.push({x:X,z:Z,r:.26})}};
  const W2=DM196I.W2,D2=DM196I.D2,B=DM196I.bar,G=DM196I.rug;cw(-W2,-D2,W2,-D2);cw(-W2,-D2,-W2,D2);cw(W2,-D2,W2,D2);cw(-W2,D2,-1.0,D2);cw(1.0,D2,W2,D2);
  cw(-5.0+B[0],-1.9+B[1],-.9+B[0],-1.9+B[1]);cw(-.95+B[0],-1.9+B[1],-.95+B[0],-2.75+B[1]);cw(W2-.9,hz-1.3,W2-.9,hz+1.3);cw(W2-.9,hz-1.2,W2-.1,hz-1.2);cw(W2-.9,hz+1.2,W2-.1,hz+1.2);cw(1.9+G[0],-2.95+G[1],3.9+G[0],-2.95+G[1]);
  DM196I.tables.forEach(([x,z])=>{const [X,Z]=lotW103(l,x,z);C.push({x:X,z:Z,r:.55})});
  [[-5.0,-3.0],[-4.3,-3.0]].forEach(([x,z])=>{const [X,Z]=lotW103(l,x+B[0],z+B[1]);C.push({x:X,z:Z,r:.32})});
  {const [X,Z]=lotW103(l,-4.9,D2+.85);C.push({x:X,z:Z,r:.5})}[-1.25,1.25].forEach(x=>{const [X,Z]=lotW103(l,x,D2+1.35);C.push({x:X,z:Z,r:.2})});{const [X,Z]=lotW103(l,4.4,D2+.75);C.push({x:X,z:Z,r:.45})}
  kfColSet109(DM196I.col,C);DM196S.col=(DM196S.col||[]).filter(c=>DM196I.col.indexOf(c)<0).concat(DM196I.col);
  // the innkeeper behind the bar; the rest prompt in front of it
  if(DM196I.keeper)scene.remove(DM196I.keeper);{const [nx,nz]=lotW103(l,-3.0+DM196I.bar[0],-2.75+DM196I.bar[1]),ng=new THREE.Group(),prev=T_cur,nc=[];T_cur={col:nc,cx:0,cy:0};
    try{npc(ng,nx,nz,{robe:0x6a3a22,trim:0xd8c8a0,apron:1,label:'Innkeeper',ry:l.ry})}finally{T_cur=prev}ng.position.y=GH(nx,nz);scene.add(ng);DM196I.keeper=ng}
  T.tv=lotW103(l,-3.0+DM196I.bar[0],-1.05+DM196I.bar[1])}
// inside: the roof goes, so the camera sees the room
function dm196InnInside(x,z){const l=DM196I.l;if(!l)return false;const T=TOWNS[0],fx=Math.sin(l.ry),fz=Math.cos(l.ry),dx=x-T.cx-l.x,dz=z-T.cy-l.z,u=dx*fz-dz*fx,v=dx*fx+dz*fz;return Math.abs(u)<DM196I.W2+.1&&v>-DM196I.D2-.1&&v<DM196I.D2+.15}
// v213: and every wall the camera stands outside of goes too (with the porch for the front), so the room is open to the view
function dm196InnLocal(x,z){const l=DM196I.l,T=TOWNS[0],fx=Math.sin(l.ry),fz=Math.cos(l.ry),dx=x-T.cx-l.x,dz=z-T.cy-l.z;return [dx*fz-dz*fx,dx*fx+dz*fz]}
function dm196InnCut(In){const W=DM196I.w;let c=null;if(In&&typeof cam!='undefined'&&cam)c=dm196InnLocal(cam.position.x,cam.position.z);const m=.35,W2=DM196I.W2,D2=DM196I.D2;
  const cut={f:!!c&&c[1]>D2-m,b:!!c&&c[1]<-D2+m,l:!!c&&c[0]<-W2+m,r:!!c&&c[0]>W2-m};
  for(const sd in W)if(W[sd])W[sd].visible=!cut[sd];if(DM196I.outF)DM196I.outF.visible=!cut.f;DM196I.cut=cut}
{const f=townTick;townTick=function(now,pp){f.apply(this,arguments);try{if(!DM196I.roof)return;const In=dm196InnInside(pp.x,pp.z);if(In!==DM196I.inside){DM196I.inside=In;DM196I.roof.visible=!In}
  if(In||DM196I.cut&&Object.values(DM196I.cut).some(Boolean))dm196InnCut(In)}catch(_){}}}
try{dm196InnBuild();lotMark103('fix:inn',[])}catch(e){console.warn('v196 inn',e)}
