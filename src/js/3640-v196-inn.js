// ================= v196: The Last Lantern — an inn you can walk into =================
// Owner (Nov 3 2026): "Lets make the Inn an actual building you can walk into with a bar, fire, tables — and make it extra cozy."
// The inn stands on the plaza ring (DM196_FIX.inn in 0045: 11 x 8 tiles, door toward the fountain). Lot-local frame (lotW103):
// x across the front (-5.5..5.5), z toward the plaza (front wall at z = +4, door |x| < .85).
//  * Shell (always drawn): stone footing and walls up to the sill, timber and plaster above, a plank floor, ceiling beams; inside a long
//    bar with stools, shelves of bottles and casks behind it, a great stone hearth with a living fire on the right wall, three round
//    tables with chairs and candles, a fireside bench, a rug, hanging lanterns, hops and herbs drying on the beams, a stag skull.
//  * Roof (its own group): a steep slate roof with two dormers, the chimney and moss. It is hidden while you are inside, so the camera
//    looks into the room; the walls between you and the camera fade like every other building (v192).
//  * Walls and furniture are solid (town colliders), the doorway is open; the rest prompt (T.tv) is at the bar, where the innkeeper
//    stands. The seats are listed for the townsfolk (DM196I.seats: chairs, stools and the bench, with the table they face) — 3650
//    walks villagers in to sit and eat. Warm point lights come from the hearth and the lanterns (TLAMP).
var DM196I={barTop:.85,g:null,roof:null,col:[],lamps:[],seats:[],an:null,inside:false,keeper:null,l:null};
function dm196InnK(k,R){const W2=5.5,D2=4,H=3.3,st=0x6e6a64,stD=0x55525a,pl=0xd8ccb0,wood=0x5a3c24,woodD=0x3a281a,warm=0xffc070;
  // floor and footing
  k.as('board',()=>{for(let x=-W2+.35;x<W2;x+=.5)k.p('c',R()<.3?0x6a4a2e:0x7a5636,'box',x,.05,0,.48,.06,2*D2-.3,0,0,0,.02)});
  twStones(k,stD,-W2,-D2,W2,-D2,0,.36,.4);twStones(k,stD,-W2,D2,-.9,D2,0,.36,.4);twStones(k,stD,.9,D2,W2,D2,0,.36,.4);twStones(k,stD,-W2,-D2,-W2,D2,0,.36,.4);twStones(k,stD,W2,-D2,W2,D2,0,.36,.4);
  k.as('ashlar',()=>k.p('c',st,'box',0,.18,D2+.45,2.0,.36,.7,0,0,0,.04)); // the doorstep
  // walls: stone to the sill, timber framing with plaster panels above; the doorway is open (lintel above)
  const wall=(x0,z0,x1,z1)=>{twStones(k,st,x0,z0,x1,z1,.36,1.4,.36);const L=Math.hypot(x1-x0,z1-z0),ux=(x1-x0)/L,uz=(z1-z0)/L,ry=Math.atan2(-uz,ux);
    k.as('plaster',()=>k.p('c',pl,'box',(x0+x1)/2,(1.4+H)/2,(z0+z1)/2,L,H-1.4,.2,0,ry,0,.02));
    const nx=-uz*.12,nz=ux*.12;k.as('wood',()=>[-1,1].forEach(q=>{for(let t=0;t<=L+.01;t+=Math.max(.9,L/Math.round(L/1.2))){const x=x0+ux*t+nx*q,z=z0+uz*t+nz*q;k.L('c',woodD,[x,1.4,z],[x,H,z],.07,'box')}
      [1.45,H-.05].forEach(y=>k.L('c',woodD,[x0+nx*q,y,z0+nz*q],[x1+nx*q,y,z1+nz*q],.07,'box'));for(let t=.6;t<L-.4;t+=2.4){const x=x0+ux*t+nx*q,z=z0+uz*t+nz*q;k.L('c',woodD,[x,1.45,z],[x+ux*1.1,H-.05,z+uz*1.1],.05,'box')}}))};
  wall(-W2,-D2,W2,-D2);wall(-W2,-D2,-W2,D2);wall(W2,-D2,W2,D2);wall(-W2,D2,-.85,D2);wall(.85,D2,W2,D2);
  twStones(k,st,-.95,D2,.95,D2,2.25,H,.36);k.as('wood',()=>k.L('c',woodD,[-1.0,2.25,D2+.05],[1.0,2.25,D2+.05],.1,'box'));
  [-.9,.9].forEach(x=>k.as('wood',()=>k.L('c',woodD,[x,.36,D2+.05],[x,2.25,D2+.05],.09,'box')));
  // windows: two on the front, one each side, glowing warm
  [-3.2,3.2].forEach(x=>{twWindow(k,x,1.9,D2+.12,.95,.75,0,warm);twWindow(k,x,1.9,D2-.12,.95,.75,Math.PI,warm)});
  [[-W2,-1.6,1],[-W2,1.8,1]].forEach(([x,z])=>{twWindow(k,x-.12,1.9,z,.8,.7,-Math.PI/2,warm);twWindow(k,x+.12,1.9,z,.8,.7,Math.PI/2,warm)});
  twWindow(k,W2+.12,1.9,2.4,.8,.7,Math.PI/2,warm);twWindow(k,W2-.12,1.9,2.4,.8,.7,-Math.PI/2,warm);
  // ceiling beams and a ring of posts
  k.as('wood',()=>{for(let x=-W2+1.1;x<W2;x+=2.2)k.L('c',woodD,[x,H-.12,-D2],[x,H-.12,D2],.11,'box');k.L('c',woodD,[-W2,H-.2,0],[W2,H-.2,0],.12,'box')});
  // the bar: a long counter on the left back (v199: top at ~.85 above the floor, it stood chest high and hid the innkeeper), stools, shelves of bottles and casks behind it, a tap barrel
  const bz=-1.9,FL=-.32;k.at(0,FL,0,()=>{k.as('wood',()=>{k.p('c',wood,'box',-3.0,.75,bz,4.2,.7,.5,0,0,0,.03);k.p('c',0x6a4a2e,'box',-3.0,1.13,bz+.05,4.5,.08,.72,0,0,0,.03);k.p('c',woodD,'box',-.95,.75,bz-.9,.5,.7,1.8,0,0,0,.03)});
  for(let i=0;i<4;i++){const x=-4.6+i*1.05;k.as('wood',()=>{k.L('c',woodD,[x,.36,bz+.85],[x,.78,bz+.85],.05,'cyl6');k.p('c',0x6a4a2e,'cyl8',x,.8,bz+.85,.26,.07,.26,0,0,0,.02)})}})
  k.as('wood',()=>[1.0,1.6,2.2].forEach(y=>k.p('c',woodD,'box',-3.0,y,-D2+.3,4.6,.06,.34,0,0,0,.02)));
  [1.0,1.6,2.2].forEach((y,j)=>{for(let i=0;i<9;i++){const x=-5.0+i*.5+(j%2)*.2;k.p(R()<.3?'g':'c',[0x3a6a3a,0x6a2a2a,0x2a3a6a,0xd8b060,0x5a3a6a][(i+j)%5],'cyl6',x,y+.17,-D2+.3,.06,.28,.06,0,0,0,0)}});
  [[-5.0,-3.0],[-4.3,-3.0]].forEach(([x,z])=>TWN100_barrel(k,x,z,.9));k.at(-4.65,.82,-3.0,()=>TWN100_barrel(k,0,0,.75));
  k.at(0,FL,0,()=>{k.as('wood',()=>{k.p('c',0x7a5230,'cyl8',-1.9,1.35,bz-.05,.22,.4,.22,Math.PI/2,0,0,.03)});k.p('m',0xb08a3a,'cyl6',-1.9,1.35,bz+.2,.04,.12,.04,Math.PI/2,0,0,0);
  [[-2.6,0],[-3.4,.3],[-4.2,-.1]].forEach(([x,o])=>{k.p('m',0x8a7a5a,'cyl8',x,1.26,bz+.1+o*.1,.07,.15,.07);k.p('c',0xe8e0c8,'cyl8',x,1.35,bz+.1+o*.1,.06,.03,.06)})});
  // the hearth: a great stone fireplace on the right wall, a fire grate, a mantel with candles, a cauldron, logs
  const hx=W2-.2,hz=-1.1;twStones(k,st,hx-.75,hz-1.15,hx-.75,hz-.55,.36,2.4,.5);twStones(k,st,hx-.75,hz+.55,hx-.75,hz+1.15,.36,2.4,.5);
  twStones(k,stD,hx,hz-1.15,hx,hz+1.15,.36,H,.5);twStones(k,st,hx-.8,hz-1.2,hx-.8,hz+1.2,1.45,2.5,.45);
  k.as('ashlar',()=>{k.p('c',0x8a8478,'box',hx-1.05,1.42,hz,.35,.12,2.6,0,0,0,.02);k.p('c',stD,'box',hx-.45,.4,hz,1.3,.1,1.3,0,0,0,.02)});
  for(let i=0;i<3;i++)k.as('bark',()=>k.L('c',[0x4a3020,0x5a3a22,0x3e2a1a][i],[hx-.85,.52+i*.06,hz-.4+i*.3],[hx-.25,.5+i*.07,hz+.1-i*.25],.08,'log'));
  k.p('g',0xff5a14,'box',hx-.45,.47,hz,.9,.05,.9,0,0,0,0);k.p('g',0x8a2a08,'box',hx-.22,1.0,hz,.05,1.0,1.0,0,0,0,0);k.p('m',0x2a2a30,'sph',hx-.55,.75,hz+.45,.24,.2,.24);k.L('m',0x2a2a30,[hx-.55,1.3,hz+.45],[hx-.55,.95,hz+.45],.01,'cyl6',0);
  [-.8,.8].forEach(o=>dc190Candle(k,hx-1.05,1.48,hz+o,.16));k.as('plain',()=>{k.p('c',0xe8e0c8,'dod',hx-1.0,1.7,hz,.18,.15,.2);[-1,1].forEach(s=>k.L('c',0xe8e0c8,[hx-1.0,1.75,hz+s*.14],[hx-1.05,2.2,hz+s*.55],.03,'cone6'))}); // a stag skull over the mantel
  for(let i=0;i<6;i++)k.as('bark',()=>k.L('c',[0x5a3a22,0x6a4a2a][i%2],[hx-.6,.45+Math.floor(i/3)*.19,hz+1.55+(i%3)*.18],[hx-1.5,.45+Math.floor(i/3)*.19,hz+1.55+(i%3)*.18],.09,'log'));
  // a rug before the fire, the fireside bench
  k.at(0,FL,0,()=>{
  k.as('cloth',()=>{k.p('c',0x6a1e26,'box',2.4,.41,-.9,2.8,.02,2.0,0,0,0,.01);k.p('c',0xc9a24a,'box',2.4,.415,-.9,2.5,.02,1.7,0,0,0,0);k.p('c',0x4a1018,'box',2.4,.42,-.9,2.2,.02,1.4,0,0,0,.01)});
  k.as('wood',()=>{k.p('c',0x6a4a2e,'box',2.9,.66,-2.9,2.2,.08,.46,0,0,0,.03);k.p('c',woodD,'box',2.9,1.03,-3.12,2.2,.62,.08,0,0,0,.03);[-.9,.9].forEach(o=>k.L('c',woodD,[2.9+o,.36,-2.9],[2.9+o,.64,-2.9],.06,'box'))});
  // three round tables, chairs, candles, mugs, a loaf and a roast
  DM196I.tables.forEach(([x,z],ti)=>k.at(0,-.1,0,()=>{k.as('wood',()=>{k.p('c',0x6a4a2e,'cyl8',x,1.08,z,.62,.08,.62,0,0,0,.02);k.L('c',woodD,[x,.36,z],[x,1.04,z],.09,'cyl6');k.p('c',woodD,'cyl8',x,.42,z,.32,.06,.32,0,0,0,.02)});
    dc190Candle(k,x,1.12,z,.14);k.p('m',0x8a7a5a,'cyl8',x+.3,1.18,z-.1,.07,.14,.07);k.p('m',0x8a7a5a,'cyl8',x-.25,1.18,z+.2,.07,.14,.07);
    if(ti==0){k.p('c',0xb8843a,'sph',x-.15,1.18,z-.25,.2,.12,.14);k.p('c',0x8a4a2a,'ico',x+.15,1.2,z+.25,.16,.1,.13)}else if(ti==1)k.p('c',0xc89a5a,'sph',x+.1,1.17,z+.1,.18,.1,.12)}));
  DM196I.seats.forEach(s=>{if(s.k!='chair')return;const a=Math.atan2(s.x-s.tx,s.z-s.tz);k.at(s.x,-.14,s.z,()=>{k.as('wood',()=>{k.p('c',0x6a4a2e,'box',0,.82,0,.48,.07,.46,0,0,0,.03);
      [[-.19,-.18],[.19,-.18],[-.19,.18],[.19,.18]].forEach(([u,v])=>k.L('c',woodD,[u,.36,v],[u,.8,v],.035,'box'));k.p('c',woodD,'box',0,1.18,.2,.46,.58,.06,0,0,0,.03)})},a)});
  });
  // lanterns hanging from the beams, hops and herbs drying, a notice board
  DM196I.lantern.forEach(([x,z])=>{k.L('m',TWC.iron,[x,H-.15,z],[x,2.55,z],.012,'cyl6',0);TWN100_lantern(k,x,2.32,z,warm)});
  for(let i=0;i<8;i++){const x=-4.4+i*1.2;k.as('leaf',()=>k.p('c',[0x6a8a3a,0x5a7a34,0x8a8a4a][i%3],'ico',x,H-.42,-.15,.12,.3,.12,0,i,0,.1))}
  k.as('board',()=>k.p('c',0x5a3c24,'box',-W2+.2,1.9,.6,.06,.8,1.2,0,0,0,.02));[0,1,2].forEach(i=>k.p('c',0xe8dcc0,'box',-W2+.25,1.85+(i%2)*.2,.3+i*.3,.02,.3,.22,0,0,(i-1)*.1,0))}
function dm196InnRoofK(k,R){const W2=5.5,D2=4,H=3.3;twGable(k,0x3a3644,2*W2+.4,2*D2+.4,2.7,.5,H);
  // two dormers on the front slope, the chimney over the hearth, moss along the eaves
  [-2.6,2.6].forEach(x=>{const z=2.05,y=4.85;k.as('plaster',()=>k.p('c',0xd8ccb0,'box',x,y,z,1.0,1.0,.9,0,0,0,.03));twWindow(k,x,y,z+.47,.5,.45,0,0xffc070);k.at(x,0,z,()=>twGable(k,0x3a3644,1.2,1.0,.55,.12,y+.5))});
  TWN100_chim(k,W2-.2,-1.1,H,H+4.0,TWC.stone);
  for(let i=0;i<14;i++){const x=-W2+.4+i*(2*W2-.8)/13;dm196Moss(k,x+(R()-.5)*.3,H+.1,D2+.42,.9+R()*.4,i);if(i%2)dm196Moss(k,x,H+.1,-D2-.42,.9,i+5)}
  for(let i=0;i<5;i++)dm196Moss(k,-W2+1+R()*(2*W2-2),H+1.0+R()*1.2,(R()<.5?1:-1)*(D2*.6),.7,i+30)}
// outside: the sign over the door, a lantern on a bracket, barrels and a bench, ivy, moss and flower boxes (L2 dressing without the turret)
function dm196InnOutK(k,R){const W2=5.5,D2=4;[-1.25,1.25].forEach(x=>{k.as('bark',()=>k.L('c',TWC.woodD,[x,0,D2+1.35],[x,2.55,D2+1.35],.09,'log'));k.as('ashlar',()=>k.p('c',DM196C.stoneD,'box',x,.12,D2+1.35,.36,.24,.36,0,0,0,.03))});
  k.as('wood',()=>{k.L('c',TWC.woodD,[-1.5,2.55,D2+1.35],[1.5,2.55,D2+1.35],.09,'box');[-1.25,1.25].forEach(x=>k.L('c',TWC.woodD,[x,2.55,D2+1.35],[x,2.9,D2+.05],.07,'box'))});
  k.at(0,0,D2+.75,()=>twGable(k,0x3a3644,3.3,1.7,.55,.14,2.62));for(let i=0;i<5;i++)dm196Moss(k,-1.4+i*.7,2.7,D2+1.6,.8,i+60);
  [-1.25,1.25].forEach((x,j)=>dm196Ivy(k,x+.1,D2+1.38,2.4,0,1,j+20));k.L('m',TWC.iron,[1.4,2.6,D2+.05],[1.4,2.6,D2+.75],.025,'box',0);TWN100_lantern(k,1.4,2.25,D2+.75,0xffc070);
  TWN100_barrel(k,-4.6,D2+.8,.9);TWN100_barrel(k,-4.0,D2+1.0,.8);k.as('wood',()=>{k.p('c',0x6a4a2e,'box',3.6,.5,D2+.75,1.6,.07,.34,0,0,0,.05);[2.95,4.25].forEach(x=>k.L('c',TWC.woodD,[x,0,D2+.75],[x,.46,D2+.75],.05,'box'))});
  [-1,1].forEach((s,j)=>dm196Ivy(k,s*(W2+.03),D2+.03,2.9,0,1,j*4+2));dm196Ivy(k,-W2-.03,0,2.8,-1,0,7);dm196Ivy(k,W2+.03,1.4,2.8,1,0,9);
  [-3.2,3.2].forEach(x=>{k.as('wood',()=>k.p('c',0x5a3c24,'box',x,1.42,D2+.28,1.05,.16,.22,0,0,0,.02));for(let i=0;i<5;i++)k.p('c',DM196C.flw[i],'sph',x-.4+i*.2,1.55,D2+.28,.08,.07,.08,0,i,0,.04)});
  for(let i=0;i<10;i++)dm196Moss(k,-W2+.3+i*1.2,.42,D2+.3,.9,i+40);dm196Pot(k,-1.4,D2+.7,3,1);dm196Pot(k,2.0,D2+.6,5,.9)}
// the layout the builders and the villagers share (lot-local)
DM196I.tables=[[-3.3,1.4],[1.6,1.1],[3.6,2.5]];
DM196I.lantern=[[-3.3,1.4],[1.6,1.1],[-2.4,-1.4],[3.4,-.6]];
(function(){const S=[];DM196I.tables.forEach(([x,z],ti)=>{const n=ti==2?3:4;for(let j=0;j<n;j++){const a=(j/n)*6.283+(ti==2?.5:.785);const sx=x+Math.sin(a)*1.0,sz=z+Math.cos(a)*1.0;
    if(sz>3.55||Math.abs(sx)>5.0)continue;S.push({k:'chair',x:+sx.toFixed(2),z:+sz.toFixed(2),tx:x,tz:z,t:ti})}});
  for(let i=0;i<4;i++)S.push({k:'stool',x:-4.6+i*1.05,z:-1.9+.85,tx:-4.6+i*1.05,tz:-1.9,t:-1});
  [2.3,3.5].forEach(x=>S.push({k:'bench',x,z:-2.9+.1,tx:x,tz:-1.0,t:-2}));DM196I.seats=S})();
function dm196InnBuild(){const T=TOWNS[0],l=dm196Fix('inn');if(!l)return;DM196I.l=l;
  [DM196I.g,DM196I.roof,DM196I.out].forEach(o=>{if(o)scene.remove(o)});
  const mk=(key,seed,fn)=>{let k=null;if(!twHas(key)){k=twKit(seed);fn(k,k.R)}const g=twGroup(k,key),[x,z]=lotW103(l,0,0);g.position.set(x,T.ph-.0,z);g.rotation.y=l.ry;g.userData.lpsSkip=1;scene.add(g);return g};
  DM196I.g=mk('DM196INN',19611,dm196InnK);DM196I.g.name='dm196inn';DM196I.roof=mk('DM196INNR',19612,dm196InnRoofK);DM196I.roof.name='dm196innRoof';DM196I.out=mk('DM196INNO',19613,dm196InnOutK);DM196I.out.name='dm196innOut';
  sign(DM196I.out,[{t:T.tav.toUpperCase(),f:'700 52px'}],2.4,.5,'#2a1a10','#ffd88a','#c9a24a',0,2.17,4.0+1.42,0,512,120);
  // the fire, lit warm; the lanterns' glow
  const hx=5.3,hz=-1.1;DM196I.an=dc190Fire(DM196I.g,[[hx-.5,.5,hz,1.7],[hx-.55,.5,hz-.32,1.15],[hx-.55,.5,hz+.34,1.2]]);
  const FA={x:T.cx+l.x,z:T.cy+l.z,f:now=>{if(DM196I.g.visible)DM196I.an(now)}};TANIM.push(FA);
  DM196I.lamps.forEach(L=>{const i=TLAMP.indexOf(L);if(i>=0)TLAMP.splice(i,1)});DM196I.lamps=[];
  [[hx-.6,1.0,hz]].concat(DM196I.lantern.map(([x,z])=>[x,2.3,z])).forEach(([x,y,z])=>{const [X,Z]=lotW103(l,x,z),L=[X,T.ph+y,Z];TLAMP.push(L);DM196I.lamps.push(L)});
  // colliders: the walls as a chain of small circles (the doorway open), the bar, the hearth, tables and the bench
  const C=[],cw=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/.45));for(let i=0;i<=n;i++){const t=i/n,[X,Z]=lotW103(l,x0+(x1-x0)*t,z0+(z1-z0)*t);C.push({x:X,z:Z,r:.26})}};
  cw(-5.5,-4,5.5,-4);cw(-5.5,-4,-5.5,4);cw(5.5,-4,5.5,4);cw(-5.5,4,-1.0,4);cw(1.0,4,5.5,4);
  cw(-5.0,-1.9,-.9,-1.9);cw(-.95,-1.9,-.95,-2.75);cw(4.6,-2.4,4.6,.2);cw(4.6,-2.3,5.4,-2.3);cw(4.6,.1,5.4,.1);cw(1.9,-2.95,3.9,-2.95);
  DM196I.tables.forEach(([x,z])=>{const [X,Z]=lotW103(l,x,z);C.push({x:X,z:Z,r:.55})});
  [[-5.0,-3.0],[-4.3,-3.0]].forEach(([x,z])=>{const [X,Z]=lotW103(l,x,z);C.push({x:X,z:Z,r:.32})});
  {const [X,Z]=lotW103(l,-4.6,4.85);C.push({x:X,z:Z,r:.5})}[-1.25,1.25].forEach(x=>{const [X,Z]=lotW103(l,x,5.35);C.push({x:X,z:Z,r:.2})});{const [X,Z]=lotW103(l,3.6,4.75);C.push({x:X,z:Z,r:.45})}
  kfColSet109(DM196I.col,C);DM196S.col=(DM196S.col||[]).filter(c=>DM196I.col.indexOf(c)<0).concat(DM196I.col);
  // the innkeeper behind the bar; the rest prompt in front of it
  if(DM196I.keeper)scene.remove(DM196I.keeper);{const [nx,nz]=lotW103(l,-3.0,-2.75),ng=new THREE.Group(),prev=T_cur,nc=[];T_cur={col:nc,cx:0,cy:0};
    try{npc(ng,nx,nz,{robe:0x6a3a22,trim:0xd8c8a0,apron:1,label:'Innkeeper',ry:l.ry})}finally{T_cur=prev}ng.position.y=GH(nx,nz);scene.add(ng);DM196I.keeper=ng}
  T.tv=lotW103(l,-3.0,-1.05)}
// inside: the roof goes, so the camera sees the room
function dm196InnInside(x,z){const l=DM196I.l;if(!l)return false;const T=TOWNS[0],fx=Math.sin(l.ry),fz=Math.cos(l.ry),dx=x-T.cx-l.x,dz=z-T.cy-l.z,u=dx*fz-dz*fx,v=dx*fx+dz*fz;return Math.abs(u)<5.6&&v>-4.1&&v<4.15}
{const f=townTick;townTick=function(now,pp){f.apply(this,arguments);try{if(!DM196I.roof)return;const In=dm196InnInside(pp.x,pp.z);if(In!==DM196I.inside){DM196I.inside=In;DM196I.roof.visible=!In}}catch(_){}}}
try{dm196InnBuild();lotMark103('fix:inn',[])}catch(e){console.warn('v196 inn',e)}
