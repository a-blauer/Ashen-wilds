// ================= v100 town (3/4): the market ward — every shop is a building with its own trade =================
// Eight plots line the street between the plaza and the courtyard (TWN100_SH in w0_world.js: west row s=-1 faces +x,
// east row s=+1 faces -x; each plot's 7x5-tile footprint is solid). The shopkeeper stands in the street in front of the
// shop (TWN100_npc), which is also where the walk-up prompt is (2.4 tiles).
//   smith    Blacksmith (always open: opens the bag's Forge tab)  · alch  Alchemist (the old alchemy table)
//   cook     Cookhouse (the old cooking hearth)                     · bard  Bard's Stage
//   merchant Curio Shop · sage Rune Sanctum · trainer Beast Trainer (the visitors' stalls)  · stable  Stable (mounts)
// Unbuilt shops (shopBuilt false) show a fenced construction plot with lumber, stone, a half-raised frame and a sign.
// Each building is one baked kit (≤3 meshes, the town atlas) + its sign; chimney smoke for all shops is one InstancedMesh.
var TWN100_S={b:{},site:{},npc:{},col:{},smoke:null,src:[]};
// world spot of a plot-local point (local: x along the facade, z toward the street; plot centre at |x|=9)
function TWN100_lw(q,lx,lz){const T=TOWNS[0],cx=T.cx+q.s*9,cz=T.cy+q.z;return q.s<0?[cx+lz,cz-lx]:[cx-lz,cz+lx]}
function TWN100_npc(q){return TWN100_lw(q,0,4.45)}
// ---------- kit helpers (building local frame: body centred at z=zc, front wall at zc+d/2 facing +z) ----------
function TWN100_body(k,o){const w=o.w,d=o.d,h=o.h,zc=o.zc||0,st=o.st;
  k.at(0,0,zc,()=>{
    if(st=='stone'||st=='log')twHall(k,{w,d,h,stoneWalls:st=='stone'?1:0,wc:o.wc,pc:o.pc});
    else{const y0=.36;twStones(k,TWC.stone,-w/2-.1,d/2+.04,w/2+.1,d/2+.04,0,y0,.3);twStones(k,TWC.stone,-w/2-.1,-d/2-.04,w/2+.1,-d/2-.04,0,y0,.3);
      twStones(k,TWC.stone,-w/2-.04,-d/2,-w/2-.04,d/2,0,y0,.28);twStones(k,TWC.stone,w/2+.04,-d/2,w/2+.04,d/2,0,y0,.28);
      if(st=='plank'){twPlanks(k,o.wc||TWC.wood,-w/2,d/2-.04,w/2,d/2-.04,y0,h,.26);twPlanks(k,o.wc||TWC.wood,-w/2,-d/2+.04,w/2,-d/2+.04,y0,h,.26);
        twPlanks(k,o.wc||TWC.wood,-w/2+.04,-d/2,-w/2+.04,d/2,y0,h,.26);twPlanks(k,o.wc||TWC.wood,w/2-.04,-d/2,w/2-.04,d/2,y0,h,.26)}
      else{// plaster panels between dark timbers (half-timbering)
        const pc=o.wc||0xd8ccb0;k.as('plaster',()=>{k.p('c',pc,'box',0,(y0+h)/2,d/2-.06,w-.1,h-y0,.1,0,0,0,.02);k.p('c',pc,'box',0,(y0+h)/2,-d/2+.06,w-.1,h-y0,.1,0,0,0,.02);
          k.p('c',pc,'box',-w/2+.06,(y0+h)/2,0,.1,h-y0,d-.1,0,0,0,.02);k.p('c',pc,'box',w/2-.06,(y0+h)/2,0,.1,h-y0,d-.1,0,0,0,.02)});
        k.as('wood',()=>{[-1,1].forEach(f=>{const z=f*(d/2-.0);for(let x=-w/2;x<=w/2+.01;x+=w/3)k.L('c',TWC.woodD,[x,y0,z],[x,h,z],.07,'box');
            [y0+.05,(y0+h)/2,h-.05].forEach(y=>k.L('c',TWC.woodD,[-w/2-.05,y,z],[w/2+.05,y,z],.065,'box'));k.L('c',TWC.woodD,[-w/2,y0,z],[-w/6,(y0+h)/2,z],.05,'box');k.L('c',TWC.woodD,[w/2,y0,z],[w/6,(y0+h)/2,z],.05,'box')});
          [-1,1].forEach(f=>{const x=f*w/2;for(let z=-d/2;z<=d/2+.01;z+=d/2)k.L('c',TWC.woodD,[x,y0,z],[x,h,z],.07,'box');[y0+.05,h-.05].forEach(y=>k.L('c',TWC.woodD,[x,y,-d/2],[x,y,d/2],.065,'box'))})})}}
  });return k}
// gable roof over the body; along = 'x' (ridge along the facade) or 'z' (gable end to the street)
function TWN100_roof(k,o,col,rise,along,trim){const zc=o.zc||0;if(along=='z')k.at(0,0,zc,()=>twGable(k,col,o.d,o.w,rise,.38,o.h,trim),Math.PI/2);else k.at(0,0,zc,()=>twGable(k,col,o.w,o.d,rise,.38,o.h,trim))}
function TWN100_chim(k,x,z,y0,y1,c){twStones(k,c||TWC.stone,x-.32,z,x+.32,z,y0,y1,.66,.42);k.as('ashlar',()=>k.p('c',TWC.stoneD,'box',x,y1+.06,z,.76,.12,.78,0,0,0,.04));return [x,y1+.25,z]}
function TWN100_awning(k,x0,x1,zf,zt,yf,yt,cols){const n=Math.max(2,Math.round((x1-x0)/.55));for(let i=0;i<n;i++){const L=Math.hypot(zt-zf,yf-yt);
  k.as('cloth',()=>k.p('c',cols[i%cols.length],'box',x0+(x1-x0)*(i+.5)/n,(yf+yt)/2,(zf+zt)/2,(x1-x0)/n+.01,.05,L,Math.atan2(yf-yt,zt-zf),0,0,.04))}
  [x0+.1,x1-.1].forEach(x=>k.as('bark',()=>k.L('c',TWC.woodD,[x,0,zt],[x,yt+.05,zt],.06,'log')));k.as('wood',()=>k.L('c',TWC.woodD,[x0,yt,zt],[x1,yt,zt],.05,'box'))}
function TWN100_barrel(k,x,z,s,top){s=s||1;k.as('wood',()=>{k.p('c',0x7a5230,'cyl8',x,.36*s,z,.3*s,.72*s,.3*s,0,0,0,.03)});[.12,.36,.6].forEach(h=>k.p('m',TWC.iron,'cyl8',x,h*s,z,.315*s,.04*s,.315*s,0,0,0,0));if(top)k.p(top[0],top[1],'cyl8',x,.72*s,z,.26*s,.02,.26*s,0,0,0,0)}
function TWN100_crate(k,x,z,s,ry){k.as('board',()=>k.p('c',0x7a5a3a,'box',x,s/2,z,s,s,s,0,ry||0,0,.04));[-1,1].forEach(a=>k.as('wood',()=>k.p('c',TWC.woodD,'box',x,s/2,z,s*1.04,s*.12,s*1.04,0,ry||0,0,0)))}
function TWN100_lantern(k,x,y,z,glow){k.L('m',TWC.iron,[x,y+.32,z],[x,y+.16,z],.012,'cyl6',0);k.p('m',TWC.iron,'cone4',x,y+.16,z,.12,.09,.12,0,Math.PI/4,0,0);k.p('g',glow||0xffd27a,'box',x,y,z,.11,.2,.11)}
// ---------- the eight shops ----------
var TWN100_KIT={
 smith(k,S){const o={w:4.6,d:4.2,h:2.5,zc:-1.2,st:'stone'};TWN100_body(k,o);TWN100_roof(k,o,0x45403e,1.4,'z');
   S.push(TWN100_chim(k,-1.4,-2.6,1.6,5.3));
   twDoor(k,-.9,.36,.92,1.2,1.85,0);twWindow(k,1.2,1.55,.94,.7,.55,0,0xff9a4a);
   // the open forge under a lean-to on the porch: stone hearth, glowing coals, a hood, bellows
   k.as('shingle',()=>k.p('c',0x5a4a3e,'box',0,2.32,2.05,4.8,.1,2.4,.32,0,0,.04));[-2.2,2.2].forEach(x=>k.as('bark',()=>k.L('c',TWC.woodD,[x,0,3.1],[x,1.98,3.1],.08,'log')));
   twStones(k,TWC.stoneD,.7,1.9,1.9,1.9,0,.8,.95,.4);k.p('c',0x1a1210,'box',1.3,.82,1.9,1.05,.04,.8,0,0,0,0);k.p('g',0xff5a14,'box',1.3,.85,1.9,.85,.05,.6);k.p('g',0xffa030,'dod',1.15,.9,1.85,.18,.08,.14).p('g',0xff7a20,'dod',1.45,.9,1.98,.16,.07,.12);
   k.as('iron',()=>{k.p('m',0x3a3a40,'frus8',1.3,1.7,1.9,.55,.5,.5,0,Math.PI/8,0,0);k.L('m',0x3a3a40,[1.3,1.95,1.9],[1.3,2.6,1.6],.13,'cyl8',0)});S.push([1.3,2.7,1.6]);
   k.as('wood',()=>{k.p('c',0x5a3c24,'box',2.15,.62,1.55,.45,.3,.7,0,0,.25,.03)});k.p('c',0x4a2a1a,'box',2.15,.62,1.55,.4,.22,.66,0,0,.25,0);
   // anvil on a stump, quench barrel, grindstone, weapon rack, a stack of bar stock
   k.as('bark',()=>k.L('c',0x4a3424,[-.4,0,2.5],[-.4,.55,2.5],.28,'log'));k.as('iron',()=>{k.p('m',0x3a3a42,'box',-.4,.68,2.5,.62,.2,.3,0,.2,0,0);k.p('m',0x3a3a42,'box',-.4,.53,2.5,.3,.14,.22,0,.2,0,0);k.p('m',0x3a3a42,'cone4',-.04,.7,2.57,.08,.3,.1,0,.2,-Math.PI/2,0)});
   k.p('m',0x8a8a92,'box',-.35,.81,2.45,.04,.04,.5,0,.7,0,0);k.L('m',0x5a5a62,[-.65,.79,2.6],[-.95,.85,2.75],.03,'box',0);
   TWN100_barrel(k,-1.55,2.75,.9,['g',0x2a4a6a]);
   k.as('stone',()=>k.p('c',0x8a8678,'cyl8',-2.0,.55,1.75,.36,.1,.36,Math.PI/2,0,0,.02));[-.08,.08].forEach(d=>k.as('wood',()=>k.L('c',TWC.woodD,[-2.0,0,1.75+d],[-2.0,.55,1.75+d],.04,'box')));
   [[-1.2],[-.8]].forEach(([x])=>k.as('wood',()=>k.L('c',TWC.woodD,[x,0,1.05],[x,1.6,1.05],.04,'box')));k.as('wood',()=>k.L('c',TWC.woodD,[-1.4,1.35,1.08],[-.6,1.35,1.08],.035,'box'));
   [-1.3,-1.1,-.9,-.7].forEach((x,i)=>{k.p('m',0xa8a8b0,'box',x,.85,1.12,.06,.95+i%2*.12,.02,0,0,0,0);k.p('m',TWC.gold,'box',x,1.36+i%2*.06,1.12,.18,.035,.03,0,0,0,0)});
   k.as('iron',()=>{for(let i=0;i<4;i++)k.p('m',0x4a4a52,'box',1.9-i*.06,.06+i*.05,2.9,.9,.05,.08,0,.1*i,0,0)});
   // emblem: an iron anvil on a bracket over the door
   k.as('wood',()=>k.L('c',TWC.woodD,[-.9,2.35,.95],[-.9,2.35,1.6],.05,'box'));k.as('iron',()=>{k.p('m',0x2e2e34,'box',-.9,2.05,1.55,.5,.16,.22);k.p('m',0x2e2e34,'box',-.9,1.92,1.55,.22,.12,.16);k.p('m',0x2e2e34,'cone4',-.6,2.07,1.55,.07,.24,.08,0,0,-Math.PI/2,0)})},
 alch(k,S){const o={w:4.4,d:4.0,h:2.6,zc:-1.3,st:'plaster',wc:0xc8c0a8};TWN100_body(k,o);TWN100_roof(k,o,0x3a2e48,2.0,'x',0x2c2140);
   S.push(TWN100_chim(k,1.4,-2.4,2.4,5.6,0x6a6678));
   twDoor(k,-1.1,.36,.72,.95,1.75,0);twWindow(k,.8,1.45,.74,1.5,.75,0,0x9affc0);twWindow(k,0,4.0,-1.3+2.04,.42,.42,0,0xc8ffd8);
   // shelves of glowing bottles either side of the door, a bubbling cauldron, herb bundles under the awning
   TWN100_awning(k,-2.3,2.3,.75,2.1,2.45,2.0,[0x3a5a3a,0xd8ccb0]);
   [[-2.1,1.25],[2.1,1.25]].forEach(([x,z])=>{k.as('wood',()=>{[.35,.85,1.35].forEach(y=>k.p('c',0x5a3c24,'box',x,y,z,.42,.05,1.0,0,0,0,.02));k.L('c',TWC.woodD,[x,0,z-.48],[x,1.5,z-.48],.03,'box');k.L('c',TWC.woodD,[x,0,z+.48],[x,1.5,z+.48],.03,'box')});
     [.35,.85,1.35].forEach((y,j)=>{for(let i=0;i<4;i++){const c=[0x7aff6a,0xb070ff,0xff5a3a,0x5ad8ff,0xffd04a][(i+j*2)%5];k.p('g',c,'oct',x,y+.15,z-.35+i*.23,.06,.13+(i%2)*.04,.06);k.p('c',0x2a2016,'cyl6',x,y+.3+(i%2)*.04,z-.35+i*.23,.02,.05,.02,0,0,0,0)}})});
   [0,1,2].forEach(i=>{const a=i/3*6.283;k.L('m',TWC.iron,[1.0+Math.cos(a)*.5,0,2.55+Math.sin(a)*.5],[1.0,1.2,2.55],.025,'cyl6',0)});k.as('iron',()=>k.p('m',0x26262a,'sph',1.0,.62,2.55,.42,.34,.42,0,0,0,0));
   k.p('g',0x6aff6a,'cyl8',1.0,.86,2.55,.34,.02,.34);[[.95,2.45],[1.1,2.62],[.9,2.7]].forEach(([x,z],i)=>k.p('g',0xb0ffb0,'sph',x,.9+i*.03,z,.06,.05,.06));
   k.p('g',0xff7a20,'cone4',1.0,.18,2.55,.18,.32,.18,0,.3,0);S.push([1.0,1.1,2.55]);
   for(let i=0;i<6;i++){const x=-1.8+i*.55;k.L('c',0x6a5a3a,[x,1.98,2.0],[x,1.75,2.0],.008,'cyl6',0);k.p('c',[0x5a7a34,0x7a6a3a,0x4a6a3a][i%3],'cone4',x,1.62,2.0,.08,.3,.08,Math.PI,0,0,.04)}
   TWN100_crate(k,-1.6,2.8,.42,.3);k.p('g',0x9a6aff,'oct',-1.6,.52,2.8,.07,.12,.07);
   // emblem: a big glass flask on the ridge end
   k.as('glass',()=>{k.p('g',0x7aff9a,'sph',0,3.25,.86,.28,.26,.12);k.p('g',0x7aff9a,'cyl6',0,3.6,.86,.08,.24,.06)});k.p('m',TWC.gold,'cyl6',0,3.75,.86,.1,.05,.08,0,0,0,0)},
 cook(k,S){const o={w:4.6,d:4.0,h:2.4,zc:-1.3,st:'log'};TWN100_body(k,o);TWN100_roof(k,o,TWC.thatch,1.7,'x');
   // the bread oven bulging out of the right wall, with a chimney
   k.at(2.6,0,-1.0,()=>{twStoneRing(k,0x8a7a6a,0,0,.95,0,1.0,.3);k.as('stone',()=>k.p('c',0x8a7a6a,'sph',0,1.0,0,1.0,.75,1.0,0,0,0,.1));k.p('c',0x1a1210,'box',0,.55,.9,.5,.45,.1,0,0,0,0);k.p('g',0xff6a1a,'box',0,.45,.93,.38,.22,.04)});
   S.push(TWN100_chim(k,2.6,-1.6,1.4,4.4,0x7a6a5a));
   twDoor(k,-1.3,.36,.72,1.0,1.7,0);twWindow(k,.6,1.4,.74,1.1,.6,0,0xffb347);
   // counter with bread, pies and a ham; a spit roast over a fire; sacks and barrels
   TWN100_awning(k,-2.3,2.3,.72,2.0,2.35,1.95,[0x7a3a22,0xd8c8a0]);
   twPlanks(k,0x6a4a2e,-.2,1.6,1.8,1.6,0,.9,.25);k.as('wood',()=>k.p('c',0x5a3c24,'box',.8,.93,1.45,2.1,.08,.55,0,0,0,.04));
   [[0,0x9a6a32,'sph'],[.4,0xb07a3a,'sph'],[.85,0xc8a050,'cyl8'],[1.25,0x8a4a2a,'sph'],[1.6,0xa86a30,'sph']].forEach(([x,c,g],i)=>k.p('c',c,g,x,1.03,1.45+(i%2)*.1,g=='cyl8'?.16:.13,g=='cyl8'?.05:.08,g=='cyl8'?.16:.2,0,i,0,.03));
   [-1,1].forEach(s=>k.as('bark',()=>{k.L('c',TWC.woodD,[-1.4+s*.55,0,2.55],[-1.4+s*.55,1.0,2.55],.05,'log');k.L('c',TWC.woodD,[-1.4+s*.55,1.0,2.55],[-1.4+s*.7,1.15,2.55],.03,'box')}));
   k.L('m',TWC.iron,[-2.05,.98,2.55],[-.75,.98,2.55],.02,'cyl6',0);k.p('c',0x8a4a2a,'sph',-1.4,.98,2.55,.36,.22,.22,0,0,0,.06);
   [[.3,.2],[-.3,.5],[.1,-.4]].forEach(q=>k.as('bark',()=>k.L('c',0x3a2616,[-1.4-q[0]*.4,.08,2.55-q[1]*.4],[-1.4+q[0]*.4,.12,2.55+q[1]*.4],.06,'log')));k.p('g',0xff7a20,'cone4',-1.4,.32,2.55,.2,.4,.2,0,.3,0).p('g',0xffc040,'cone4',-1.4,.28,2.55,.12,.28,.12,0,1.1,0);S.push([-1.4,1.4,2.55]);
   [[-2.1,1.3],[-1.7,1.15],[2.0,2.9]].forEach(([x,z],i)=>k.as('cloth',()=>k.p('c',0xd8c8a0,'sph',x,.32,z,.3,.34,.26,0,i,0,.08)));TWN100_barrel(k,2.05,2.25,.85);
   for(let i=0;i<5;i++){const x=-.2+i*.45;k.L('c',0x6a5a3a,[x,1.95,1.9],[x,1.7,1.9],.008,'cyl6',0);k.p('c',0x8a3a22,'cyl6',x,1.55,1.9,.06,.32,.06,0,0,(i%2-.5)*.2,.03)}
   // emblem: a golden loaf on the ridge end
   k.p('c',0xc8903a,'sph',0,3.0,.78,.36,.2,.2,0,0,0,.04);k.as('brass',()=>k.p('m',TWC.gold,'box',0,3.0,.68,.6,.4,.04,0,0,0,0))},
 bard(k,S){// an open stage: platform, curtained back wall, roof on posts, lanterns along the front beam
   k.as('board',()=>k.p('c',0x6a4a2e,'box',0,.32,-.3,4.8,.64,4.4,0,0,0,.02));twStones(k,TWC.stone,-2.45,1.9,2.45,1.9,0,.64,.3);
   k.as('wood',()=>{[0,1,2].forEach(i=>k.p('c',0x5a3c24,'box',0,.1+i*.2,2.15+i*-.18,1.6,.2,.4,0,0,0,.03))});
   twPlanks(k,TWC.wood,-2.4,-2.45,2.4,-2.45,.64,3.4,.26);
   k.as('cloth',()=>{for(let i=0;i<8;i++){const x=-2.1+i*.6;k.p('c',i%2?0x7a1a2a:0x8a2232,'box',x,2.0,-2.3,.62,2.7,.08,0,0,(i%2-.5)*.03,.03)}k.p('c',0xc9a24a,'box',0,3.25,-2.25,4.8,.18,.1,0,0,0,0)});
   [[-2.3,-2.4],[2.3,-2.4],[-2.3,1.85],[2.3,1.85]].forEach(([x,z])=>k.as('bark',()=>k.L('c',TWC.woodD,[x,.6,z],[x,3.4,z],.11,'log')));
   k.as('wood',()=>{k.L('c',TWC.woodD,[-2.5,3.35,1.85],[2.5,3.35,1.85],.09,'box');k.L('c',TWC.woodD,[-2.5,3.35,-2.4],[2.5,3.35,-2.4],.09,'box')});
   k.at(0,0,-.3,()=>twGable(k,0x5a2a3a,4.8,4.6,1.5,.35,3.4,TWC.woodD));
   for(let i=0;i<7;i++)TWN100_lantern(k,-2.0+i*.667,2.9-Math.sin(i/6*Math.PI)*.15,1.9,[0xffd27a,0xffb060,0xffe0a0][i%3]);
   // instruments: a lute on a stand, a drum, a harp, music stands
   k.as('wood',()=>{k.p('c',0x9a6a32,'sph',-1.0,1.25,-1.4,.3,.38,.12,0,0,.3,.03);k.L('c',0x5a3a1a,[-1.0,1.4,-1.42],[-.75,2.1,-1.42],.04,'box');k.L('c',TWC.woodD,[-1.1,.64,-1.6],[-1.0,1.2,-1.5],.03,'box')});
   k.as('cloth',()=>k.p('c',0xd8c8a0,'cyl8',.9,.95,-1.2,.38,.6,.38,0,0,0,.02));k.as('wood',()=>k.p('c',0x7a3a22,'cyl8',.9,.95,-1.2,.4,.5,.4,0,0,0,.02));
   k.as('wood',()=>{k.L('c',0x8a6a3a,[1.7,.64,-1.8],[1.7,2.2,-1.8],.06,'box');k.L('c',0x8a6a3a,[1.7,2.2,-1.8],[2.2,1.5,-1.8],.06,'box');k.L('c',0x8a6a3a,[1.75,.7,-1.8],[2.2,1.5,-1.8],.05,'box')});
   for(let i=0;i<5;i++)k.L('m',TWC.gold,[1.78+i*.08,.8+i*.1,-1.8],[1.78+i*.08,2.05-i*.12,-1.8],.006,'cyl6',0);
   [-.2,.3].forEach(x=>{k.L('m',TWC.iron,[x,.64,-.6],[x,1.6,-.6],.012,'cyl6',0);k.p('m',TWC.iron,'box',x,1.65,-.6,.36,.24,.02,-.4,0,0,0);k.p('c',0xe8dcc0,'box',x,1.66,-.58,.3,.2,.01,-.4,0,0,0)});
   kdBanner(k,-2.3,3.1,1.95,0,0x5a2a6a,.5,1.2);kdBanner(k,2.3,3.1,1.95,0,0x5a2a6a,.5,1.2);
   // emblem: a golden lyre on the gable
   k.as('brass',()=>{k.L('m',TWC.gold,[-.25,3.9,2.0],[-.15,4.5,2.0],.03,'box',0);k.L('m',TWC.gold,[.25,3.9,2.0],[.15,4.5,2.0],.03,'box',0);k.L('m',TWC.gold,[-.22,4.45,2.0],[.22,4.45,2.0],.025,'box',0);k.p('m',TWC.gold,'cyl8',0,3.9,2.0,.26,.06,.12,Math.PI/2,0,0,0)})},
 merchant(k,S){// a narrow two-storey shop: stone ground floor, jettied timber upper floor, bay window of oddities
   const o={w:4.4,d:4.0,h:2.2,zc:-1.3,st:'stone',wc:0x7a746a};TWN100_body(k,o);
   k.at(0,0,-1.3,()=>{const U=2.5,V=2.3;k.as('wood',()=>{k.p('c',TWC.woodD,'box',0,2.27,.1,U*2+.1,.1,V*2+.1,0,0,0,.02);for(let i=0;i<7;i++){const x=-U+.1+i*(2*U-.2)/6;k.L('c',TWC.woodD,[x,2.2,V+.05],[x,2.2,-V+.2],.06,'box')}});
     twPlanks(k,0x6a5236,-U,V,U,V,2.32,3.9,.24);twPlanks(k,0x6a5236,-U,-V+.2,U,-V+.2,2.32,3.9,.24);twPlanks(k,0x6a5236,-U,-V+.2,-U,V,2.32,3.9,.24);twPlanks(k,0x6a5236,U,-V+.2,U,V,2.32,3.9,.24);
     [-1,1].forEach(s=>[-1,1].forEach(q=>k.as('bark',()=>k.L('c',TWC.woodD,[s*U,2.3,q*V],[s*U,3.95,q*V],.1,'log'))));
     twWindow(k,-1.2,3.15,V+.04,.55,.6,0,0xffd27a);twWindow(k,1.2,3.15,V+.04,.55,.6,0,0xffd27a);
     k.at(0,0,0,()=>twGable(k,0x6a4a32,4.6,5.0,1.5,.32,3.9),Math.PI/2)});
   twDoor(k,1.35,.36,.72,.9,1.65,0);
   // bay window on the street: glazed box with a display of curios
   k.as('wood',()=>{k.p('c',TWC.woodD,'box',-.7,.75,1.05,2.2,.12,.75,0,0,0,.02);k.p('c',TWC.woodD,'box',-.7,1.95,1.05,2.3,.12,.8,0,0,0,.02);[-1.75,-.7,.35].forEach(x=>k.L('c',TWC.woodD,[x,.75,1.4],[x,1.95,1.4],.05,'box'))});
   k.as('glass',()=>{k.p('g',0xffe2a8,'box',-1.22,1.35,1.42,.96,1.05,.03);k.p('g',0xffe2a8,'box',-.18,1.35,1.42,.96,1.05,.03)});
   k.as('brass',()=>{k.p('m',0x3a6aa0,'sph',-1.4,1.0,1.1,.16,.16,.16,0,0,0,0);k.p('m',TWC.gold,'box',-1.4,.88,1.1,.1,.06,.1,0,0,0,0)});k.p('c',0xe8e0c8,'ico',-.95,.92,1.15,.12,.1,.12,0,0,0,.02);
   k.p('g',0x9ad8ff,'oct',-.5,.95,1.1,.06,.16,.06);k.p('c',0xd8a84a,'sph',-.1,.93,1.12,.1,.14,.1,0,0,0,0);k.p('c',0x6a3a8a,'box',.15,.84,1.12,.2,.1,.15,0,.4,0,.02);
   TWN100_awning(k,-1.9,.5,1.42,2.2,2.15,1.8,[0x2a5a6a,0xe8dcc0]);
   TWN100_crate(k,1.0,2.4,.5,.2);TWN100_crate(k,1.55,2.75,.38,-.3);TWN100_crate(k,1.05,2.4,.32,.7);k.as('wood',()=>k.p('c',0x5a3424,'box',1.9,.25,1.9,.6,.5,.42,0,.4,0,.03));k.p('m',TWC.gold,'box',1.9,.5,1.9,.62,.05,.44,0,.4,0,0);
   TWN100_lantern(k,1.35,2.05,1.3);
   // emblem: a golden key over the door
   k.as('brass',()=>{k.p('m',TWC.gold,'cyl8',1.0,2.45,.8,.14,.04,.14,Math.PI/2,0,0,0);k.p('m',TWC.gold,'box',1.4,2.45,.8,.6,.06,.04,0,0,0,0);k.p('m',TWC.gold,'box',1.62,2.38,.8,.06,.12,.04,0,0,0,0)})},
 sage(k,S){// a dark stone sanctum with a tall pointed roof, rune monoliths and violet fires
   const o={w:4.2,d:4.0,h:2.8,zc:-1.4,st:'stone',wc:0x4e4a5c,pc:0x2a2440};TWN100_body(k,o);TWN100_roof(k,o,0x2a2440,2.8,'z',0x1e1a30);
   for(let i=0;i<7;i++){const a=Math.PI*i/6;k.p('c',0x5a5668,'box',Math.cos(a)*.62,1.95+Math.sin(a)*.55,.66,.2,.22,.16,0,0,a+Math.PI/2,.08)}[-.62,.62].forEach(x=>k.p('c',0x5a5668,'box',x,1.2,.66,.18,1.6,.16,0,0,0,.08));
   k.p('c',0x120e18,'box',0,1.35,.6,1.05,1.95,.06,0,0,0,0);k.p('g',0x9a6aff,'box',0,1.35,.58,.7,1.6,.03);
   [-1.5,1.5].forEach(x=>twWindow(k,x,1.7,.64,.32,.7,0,0xb08aff));
   // rune monoliths
   [[-1.55,2.4,.12],[1.55,2.3,-.1]].forEach(([x,z,r])=>{k.as('stone',()=>k.p('c',0x3e3a48,'box',x,1.0,z,.5,2.0,.36,0,r,(x>0?-1:1)*.04,.1));
     [.6,1.0,1.45].forEach((y,i)=>k.p('g',[0xb08aff,0x9ad8ff,0xc8a0ff][i],'box',x+Math.sin(r)*.19,y,z+Math.cos(r)*.19,.2,.09,.02,0,r,i*.4))});
   // violet braziers and the ring on the ground
   [-.85,.85].forEach(x=>{[0,1,2].forEach(i=>{const a=i/3*6.283+.4;k.L('m',TWC.iron,[x+Math.cos(a)*.2,0,2.95+Math.sin(a)*.2],[x+Math.cos(a)*.09,.6,2.95+Math.sin(a)*.09],.02,'cyl6',0)});
     k.p('m',TWC.iron,'frus8',x,.66,2.95,.24,.14,.24,Math.PI,0,0,0);k.p('g',0x9a5aff,'cone4',x,.88,2.95,.15,.38,.15,0,.3,0).p('g',0xd8b0ff,'cone4',x,.84,2.95,.09,.26,.09,0,1.1,0)});
   for(let i=0;i<16;i++){const a=i/16*6.283;k.p('g',i%2?0x9a6aff:0x6a4ad8,'box',Math.cos(a)*1.1,.03,1.75+Math.sin(a)*.8,.32,.02,.06,0,-a+Math.PI/2,0)}
   // emblem: a floating crystal over the roof peak
   k.p('g',0xc8a0ff,'oct',0,6.2,-1.4,.24,.42,.24);k.L('m',TWC.iron,[0,5.5,-1.4],[0,5.85,-1.4],.025,'cyl6',0)},
 trainer(k,S){// a hunter's lodge: dark logs, thatch, a great horned skull over the door, a pen with a training post
   const o={w:4.6,d:4.0,h:2.4,zc:-1.4,st:'log',wc:0x5a4030};TWN100_body(k,o);TWN100_roof(k,o,TWC.thatch,1.6,'x');
   twDoor(k,-1.0,.36,.62,1.1,1.75,0);twWindow(k,1.2,1.45,.64,.7,.5,0,0xffb347);
   k.as('plain',()=>{k.p('c',0xe8e0c8,'dod',-1.0,2.55,.75,.3,.24,.26);[-1,1].forEach(s=>{k.L('c',0xe8e0c8,[-1.0+s*.2,2.65,.75],[-1.0+s*.8,3.05,.7],.06,'cone6');k.L('c',0xe8e0c8,[-1.0+s*.8,3.05,.7],[-1.0+s*1.05,3.5,.6],.04,'cone6')})});
   [-1,1].forEach(s=>k.p('c',0x120e0c,'box',-1.0+s*.09,2.6,1.0,.06,.05,.02));
   // the pen: posts and rails round the porch, a training post with ropes, a trough, bones
   const P=[[-2.3,.75],[-2.3,3.2],[2.3,3.2],[2.3,.75]];for(let i=0;i<3;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.round(L/1.0);
     for(let j=0;j<=n;j++){const t=j/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(i==1&&Math.abs(x)<.7)continue;k.as('bark',()=>k.L('c',TWC.woodD,[x,-.1,z],[x,1.0,z],.06,'log'))}
     [.45,.85].forEach(h=>{if(i==1){[[-2.3,-.7],[.7,2.3]].forEach(([x0,x1])=>k.as('wood',()=>k.L('c',TWC.wood,[x0,h,3.2],[x1,h,3.2],.04,'cyl6')))}else k.as('wood',()=>k.L('c',TWC.wood,[a[0],h,a[1]],[b[0],h,b[1]],.04,'cyl6'))})}
   k.as('bark',()=>k.L('c',0x4a3424,[.9,0,2.0],[.9,1.7,2.0],.12,'log'));k.as('straw',()=>k.p('c',0xc8a850,'cyl8',.9,1.05,2.0,.2,.5,.2,0,0,0,.08));
   [.7,1.3].forEach(h=>k.L('c',0x9a8458,[.9,h,2.0],[1.4,h-.3,2.4],.02,'cyl6',0));
   k.as('wood',()=>{k.p('c',0x5a3c24,'box',-1.3,.22,2.4,1.0,.3,.4,0,.1,0,.03)});k.p('c',0x8a3a2a,'box',-1.3,.38,2.4,.85,.04,.28,0,.1,0,0);
   k.as('plain',()=>[[-.4,2.6],[.1,2.9],[1.7,1.3]].forEach(([x,z],i)=>k.L('c',0xe8e0c8,[x-.2,.05,z],[x+.2,.07,z+.1*i],.035,'cyl6')));
   // drying rack with a hide, chain on the wall
   k.as('wood',()=>{k.L('c',TWC.woodD,[1.8,0,1.05],[1.8,1.7,1.05],.04,'box');k.L('c',TWC.woodD,[2.25,0,1.05],[2.25,1.7,1.05],.04,'box');k.L('c',TWC.woodD,[1.7,1.6,1.05],[2.35,1.6,1.05],.035,'box')});
   k.p('c',0x7a5a3a,'box',2.02,1.15,1.05,.5,.8,.03,0,0,.05,.05);for(let i=0;i<5;i++)k.p('m',TWC.iron,'cyl6',-2.05,1.9-i*.14,.66,.05,.03,.05,Math.PI/2,i,0,0)},
 stable(k,S){// a barn: plank walls, shingle roof with a hayloft door to the street, open stalls, hay, a trough
   const o={w:4.6,d:4.2,h:2.6,zc:-1.2,st:'plank',wc:0x6a4a30};TWN100_body(k,o);TWN100_roof(k,o,0x6a4a32,1.9,'z');
   k.p('c',0x120e0c,'box',0,1.25,.9,2.6,1.75,.06,0,0,0,0);
   [-1,1].forEach(s=>{twPlanks(k,0x7a5636,s*1.3-.6*s,.95,s*1.3,.95,.36,1.25,.2);k.as('wood',()=>{k.L('c',TWC.woodD,[s*.7,.4,.98],[s*1.3,1.2,.98],.04,'box')})});
   k.as('wood',()=>{k.L('c',TWC.woodD,[0,.36,.98],[0,2.2,.98],.08,'box');k.L('c',TWC.woodD,[-1.4,2.15,.98],[1.4,2.15,.98],.08,'box')});
   k.p('c',0x120e0c,'box',0,3.25,.92,.75,.75,.04,0,0,0,0);k.as('straw',()=>k.p('c',0xc8a850,'box',0,3.0,.95,.62,.2,.08,0,0,0,.05));k.as('wood',()=>k.L('c',TWC.woodD,[0,4.05,.98],[0,4.05,1.6],.06,'box'));k.L('m',TWC.iron,[0,4.0,1.55],[0,3.4,1.55],.015,'cyl6',0);
   k.as('straw',()=>{k.p('c',0xc8a850,'cyl8',-1.7,.42,2.1,.4,.85,.4,0,0,Math.PI/2,.12);k.p('c',0xc8a850,'cyl8',-1.65,1.12,2.15,.38,.8,.38,0,.2,Math.PI/2,.12);k.p('c',0xb89a50,'box',0,.02,2.0,4.2,.04,2.0,0,0,0,0)});
   [-.15,.15].forEach(d=>k.as('wood',()=>k.L('c',0x5a3c22,[1.2,.2,2.6+d],[2.2,.2,2.6+d],.05,'box')));k.as('wood',()=>{twPlanks(k,0x5a3c22,1.2,2.45,2.2,2.45,0,.45,.15);twPlanks(k,0x5a3c22,1.2,2.75,2.2,2.75,0,.45,.15)});k.p('c',0x3a6a90,'box',1.7,.42,2.6,.92,.03,.26,0,0,0,0);
   k.as('cloth',()=>k.p('c',0x6a2a1a,'box',2.0,1.15,.98,.5,.45,.08,0,0,0,.05));
   // emblem: an iron horseshoe over the doors
   for(let i=0;i<7;i++){const a=Math.PI*(-.15+i/6*1.3);k.p('m',0x4a4a52,'box',Math.cos(a)*.22,2.55+Math.sin(a)*.22,1.02,.08,.11,.04,0,0,a,0)}}};
var TWN100_SIGN={smith:['BLACKSMITH','⚒ forge · arms · armour','#2a2420','#ffcf8a'],alch:['ALCHEMIST','⚗ potions · elixirs · catalysts','#1e2a22','#c8ffd8'],
 cook:['COOKHOUSE','🍖 meals that make you strong','#3a2414','#ffe6c0'],bard:["BARD'S STAGE",'🎵 songs of the old roads','#2a1430','#f0d8ff'],
 merchant:['CURIO SHOP','🧳 oddities · eggs · runes','#14282e','#d8f0ff'],sage:['RUNE SANCTUM','🔯 creature runes','#1c1236','#cdb6ff'],
 trainer:['BEAST TRAINER','🦴 companions trained to your level','#2a2014','#ffe0b0'],stable:['STABLE','🐎 mounts for sale','#2e1f12','#ffd88a']};
var TWN100_SY={smith:2.85,alch:2.95,cook:2.75,bard:3.75,merchant:2.5,sage:3.15,trainer:2.75,stable:3.0},TWN100_SZZ={smith:.95,alch:.76,cook:.76,bard:1.95,merchant:1.0,sage:.66,trainer:.66,stable:1.0};
function TWN100_built(k){return k=='smith'||shopBuilt(k)}
function TWN100_build(q){const T=TOWNS[0],key='TWNS|'+q.k,S=[];let k=null;if(!twHas(key)){k=twKit(801+q.k.length*17+q.z);TWN100_KIT[q.k](k,S);TWN100_S.src[q.k]=S}
  const g=twGroup(k,key),[x,z]=TWN100_lw(q,0,0);g.position.set(x,T.ph,z);g.rotation.y=q.s<0?Math.PI/2:-Math.PI/2;g.name='shop_'+q.k;
  const sg=TWN100_SIGN[q.k];sign(g,[{t:sg[0],f:'700 56px'},{t:sg[1],f:'600 26px'}],2.5,.56,sg[2],sg[3],'#c9a24a',q.k=='bard'?0:q.k=='merchant'?-.7:0,TWN100_SY[q.k],TWN100_SZZ[q.k]+(q.k=='bard'?.05:.08),0,512,150);
  if(q.k=='stable'){try{const dm=mountModel('pony');dm.scale.setScalar(.8);dm.position.set(.3,.36,-.8);dm.rotation.y=Math.PI*.85;g.add(dm);TANIM.push({x,z,f:now=>{if(g.visible&&dm.r&&dm.r.rig)dm.r.rig(now,false,0)}})}catch(e){console.warn('v100 stable pony',e)}}
  scene.add(g);TWN100_S.b[q.k]=g;return g}
function TWN100_siteK(k){const P=[[-2.3,-3.2],[2.3,-3.2],[2.3,3.2],[-2.3,3.2]];
  for(let i=0;i<3;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.round(L/1.1);for(let j=0;j<=n;j++){const t=j/n;k.as('bark',()=>k.L('c',TWC.woodD,[a[0]+(b[0]-a[0])*t,-.1,a[1]+(b[1]-a[1])*t],[a[0]+(b[0]-a[0])*t,.95,a[1]+(b[1]-a[1])*t],.055,'log'))}
    [.4,.8].forEach(h=>k.as('wood',()=>k.L('c',TWC.woodL,[a[0],h,a[1]],[b[0],h,b[1]],.035,'box')))}
  [[-2.3,3.2],[2.3,3.2]].forEach(([x,z])=>[.4,.8].forEach(h=>k.as('wood',()=>k.L('c',TWC.woodL,[x,h,z],[x*.45,h,z],.035,'box'))));
  // a half-raised frame, lumber, stone, tools, a sawhorse
  [[-1.8,-2.6],[1.8,-2.6],[-1.8,-.4],[1.8,-.4]].forEach(([x,z],i)=>k.as('wood',()=>k.L('c',TWC.woodL,[x,0,z],[x,i<2?2.4:1.6,z],.09,'box')));
  k.as('wood',()=>{k.L('c',TWC.woodL,[-1.9,2.35,-2.6],[1.9,2.35,-2.6],.08,'box');k.L('c',TWC.woodL,[-1.8,.1,-2.6],[-.2,2.3,-2.6],.05,'box');k.L('c',TWC.woodL,[-1.8,1.55,-.4],[-1.8,2.3,-2.6],.06,'box')});
  for(let i=0;i<6;i++)k.as('bark',()=>k.L('c',[TWC.wood,TWC.woodL,TWC.wood][i%3],[-.3,.1+(i>2?.17:0),.6+(i%3)*.17+(i>2?.08:0)],[1.9,.1+(i>2?.17:0),.6+(i%3)*.17+(i>2?.08:0)],.085,'log'));
  [[-1.2,1.6,.24],[-.9,1.9,.18],[-1.4,1.95,.2],[-1.05,1.75,.17,.3]].forEach(q=>k.p('c',TWC.stone,'dod',q[0],q[3]||.14,q[1],q[2],q[2]*.8,q[2],q[0],q[1],0,.2));
  k.as('wood',()=>{k.L('c',TWC.woodD,[.6,.75,1.9],[1.6,.75,1.9],.05,'box');[[.7,-1],[.7,1],[1.5,-1],[1.5,1]].forEach(([x,s])=>k.L('c',TWC.woodD,[x,.72,1.9],[x+.1,0,1.9+s*.22],.03,'box'))});
  k.L('m',TWC.iron,[.3,0,2.3],[.48,.55,2.35],.02,'cyl6',0);k.p('m',TWC.iron,'box',.5,.58,2.35,.16,.07,.05,0,0,.3,0)}
function TWN100_site(q){const T=TOWNS[0];let k=null;if(!twHas('TWNSITE')){k=twKit(889);TWN100_siteK(k)}
  const g=twGroup(k,'TWNSITE'),[x,z]=TWN100_lw(q,0,0);g.position.set(x,T.ph,z);g.rotation.y=q.s<0?Math.PI/2:-Math.PI/2;g.name='site_'+q.k;
  const o=SHOPS.find(s=>s.k==q.k)||{i:'🔨',n:q.k},sp=twPostG(1.6,1.25,.5);sp.position.set(0,0,3.45);g.add(sp);
  sign(sp,[{t:o.i+' '+o.n,f:'700 34px'},{t:'🔨 build it at the Steward',f:'600 22px'}],1.6,.5,'#3a2614','#ffe6c0',null,0,1.25,0,0,512,150);
  scene.add(g);TWN100_S.site[q.k]=g;return g}
// shopkeepers that are not visitors (the visitors' NPCs come from visTick at T.vsp)
var TWN100_NPCO={smith:{robe:0x3a3430,trim:0x5a3a20,apron:1,label:'Blacksmith'},alch:{robe:0x2e4a3a,trim:0x8a6a2a,hat:'wiz',hatC:0x24402e,label:'Alchemist'},
 cook:{robe:0x6a4a2a,trim:0x2a1a12,hat:'chef',apron:1,label:'Cook'},stable:{robe:0x5a4a2a,trim:0x2a1a10,hat:'cap',hatC:0x6a4a1a,label:'Stable Master'}};
function TWN100_keeper(q){const T=TOWNS[0],[x,z]=TWN100_npc(q),o=Object.assign({ry:q.s<0?Math.PI/2:-Math.PI/2},TWN100_NPCO[q.k]),g=new THREE.Group(),prev=T_cur,nc=[];T_cur={col:nc,cx:0,cy:0};
  try{npc(g,x,z,o)}finally{T_cur=prev}g.position.y=GH(x,z);scene.add(g);TWN100_S.npc[q.k]=g;TWN100_S.col[q.k]=nc;return g}
// ---------- sync: build / show / hide by shopBuilt, colliders, the stations and the visitors move into the market ----------
function TWN100_shopSync(){const T=TOWNS[0];if(!T||!TWN100_S||!TWN100_SIGN)return; // not before this file has run
  TWN100_SH.forEach(q=>{const on=TWN100_built(q.k);if(on&&!TWN100_S.b[q.k])TWN100_build(q);if(!on&&!TWN100_S.site[q.k])TWN100_site(q);
    if(TWN100_S.b[q.k])TWN100_S.b[q.k].visible=on;if(TWN100_S.site[q.k])TWN100_S.site[q.k].visible=!on;
    if(TWN100_NPCO[q.k]){if(on&&!TWN100_S.npc[q.k])TWN100_keeper(q);const n=TWN100_S.npc[q.k];if(n)n.visible=on;
      (TWN100_S.col[q.k]||[]).forEach(c=>{const i=T.col.indexOf(c);if(on&&i<0)T.col.push(c);else if(!on&&i>=0)T.col.splice(i,1)})}});
  TWN100_smokeSync()}
// the old hearth + alchemy table: hidden, colliders gone; their prompts (T.st2) now point at the Cook and the Alchemist
{const T=TOWNS[0];try{if(T.st2){const old=[T.st2.c.slice(),T.st2.a.slice()];T.col=T.col.filter(c=>!(c.r!=null&&old.some(o=>Math.abs(c.x-o[0])<.01&&Math.abs(c.z-o[1])<.01)));
    const sc=TWN100_SH.find(q=>q.k=='cook'),sa=TWN100_SH.find(q=>q.k=='alch');T.st2.c=TWN100_npc(sc);T.st2.a=TWN100_npc(sa);T._lay=1}
  if(T.stG&&T.stG.c.parent)T.stG.c.parent.visible=false;
  // the visitors (merchant, trainer, bard, sage) stand in front of their shops
  T.vsp=VIS.map(v=>{const q=TWN100_SH.find(s=>s.k==v.k);return q?TWN100_npc(q):[T.cx,T.cy+10]});VIS.forEach(v=>{if(v.g){scene.remove(v.g);v.g=null}});
  STB.x=TWN100_npc(TWN100_SH.find(q=>q.k=='stable'))[0]-T.cx;STB.z=TWN100_npc(TWN100_SH.find(q=>q.k=='stable'))[1]-T.cy-1.4;
}catch(e){console.warn('v100 market setup',e)}}
// visitors: no more stalls, and they face the street
{const f=visTick;visTick=function(){const r=f.apply(this,arguments);try{VIS.forEach(v=>{if(!v.g||v.g.twn)return;v.g.twn=1;const q=TWN100_SH.find(s=>s.k==v.k);
    v.g.children.slice().forEach(c=>{if(!c.bones&&c.isGroup)v.g.remove(c)});const n=v.g.children.find(c=>c.bones);if(n&&q)n.rotation.y=q.s<0?Math.PI/2:-Math.PI/2})}catch(_){}return r}}
// the Stable is one of the market buildings now (the v78 lean-to and its site are not built)
function stableBuild(){const T=TOWNS[0];if(!T||!TWN100_S)return;if(!TWN100_S.b.stable)try{TWN100_build(TWN100_SH.find(s=>s.k=='stable'));TWN100_shopSync()}catch(e){console.warn('v100 stable',e)}
  if(!TWN100_S.npc.stable)try{TWN100_keeper(TWN100_SH.find(s=>s.k=='stable'));TWN100_shopSync()}catch(e){console.warn('v100 stable',e)}STB.g=TWN100_S.b.stable||null;STB.npc=TWN100_S.npc.stable||null;STB.col=TWN100_S.col.stable||[];const q=TWN100_SH.find(s=>s.k=='stable');STB.n=TWN100_npc(q)}
function stableSync(){TWN100_shopSync();stableBuild()}
// construction sites: only the Magic Shop still uses the old kind (north row); the market plots have their own
function shSites(){const T=TOWNS[0];if(!T)return;SHM.sites=SHM.sites||{};SHM.vsite=[];const want={};if(!shopBuilt('magic'))want.magic=[T.mv[0],T.mv[1]-.4,'🔮 Magic Shop'];
  if(T.mvG){const on=shopBuilt('magic');T.mvG.visible=on;try{const c=mmB.getContext('2d');for(let y=-18;y<=-14;y++)for(let x=12;x<=17;x++){const X=T.cx+x,Y=T.cy+y,w=on?'B':'P';if(MAP[Y][X]!=w&&(MAP[Y][X]=='B'||MAP[Y][X]=='P')){MAP[Y][X]=w;c.fillStyle=on?'rgb(168,126,92)':'rgb(200,190,164)';c.fillRect(X,Y,1,1)}}}catch(err){console.warn(err)}
    (T.mvCol||[]).forEach(q=>{const i=T.mvArr.indexOf(q);if(on&&i<0)T.mvArr.push(q);else if(!on&&i>=0)T.mvArr.splice(i,1)})}
  for(const k in SHM.sites)if(!want[k]){scene.remove(SHM.sites[k]);delete SHM.sites[k]}
  for(const k in want)if(!SHM.sites[k])SHM.sites[k]=shSite(...want[k]);
  try{TWN100_shopSync()}catch(e){console.warn('v100 shops',e)}}
// walk-up prompts for every market plot (before the older prompts: same spots, clearer labels)
var TWN100_ACT={smith:()=>{$('bag').classList.remove('hide');bagTab2=typeof KQM_FORGE!='undefined'?KQM_FORGE:0;rB()},alch:()=>openX('alch'),cook:()=>openX('cook'),
 merchant:()=>openX('visitor','merchant'),trainer:()=>openX('visitor','trainer'),bard:()=>openX('visitor','bard'),sage:()=>openX('visitor','sage'),stable:()=>openX('stable',0)};
var TWN100_LBL={smith:'F · Blacksmith · upgrade your gear',alch:'F · Brew at the Alchemist',cook:'F · Cook at the Cookhouse',merchant:'F · Curio Merchant',trainer:'F · Beast Trainer',bard:'F · Listen to the Bard',sage:'F · Rune Sage',stable:'F · Stable Master'};
function TWN100_prompt(){const T=TOWNS[0],p=pl.position;if(p.z<T.cy+TS-1||p.z>T.cy+TWN100_IW)return null;
  for(const q of TWN100_SH){const [x,z]=TWN100_npc(q);if(Math.hypot(p.x-x,p.z-z)<2.4){if(TWN100_built(q.k))return {label:TWN100_LBL[q.k],fn:TWN100_ACT[q.k]};
    const o=SHOPS.find(s=>s.k==q.k);return {label:'🔨 '+(o?o.n:q.k)+' · build it at the Stronghold Steward',fn:()=>{shTab='shops';openX('hold')}}}}return null}
{const f=townPortalPrompt;townPortalPrompt=function(T){if(T===TOWNS[0]){const r=TWN100_prompt();if(r)return r}return f.apply(this,arguments)}}
// ---------- chimney smoke: one InstancedMesh for every built shop ----------
function TWN100_smokeSync(){const T=TOWNS[0],L=[];TWN100_SH.forEach(q=>{if(!TWN100_built(q.k))return;(TWN100_S.src[q.k]||[]).forEach(s=>{const [x,z]=TWN100_lw(q,s[0],s[2]);L.push([x,T.ph+s[1],z,q.k])})});
  const N=7;if(!TWN100_S.smoke){const m=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.32,depthWrite:false}),24*N);
    m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(24*N*3),3);m.frustumCulled=false;m.castShadow=false;m.userData.lpsSkip=1;m.userData.psNo=1;scene.add(m);TWN100_S.smoke=m;
    const d=new THREE.Object3D(),c=new THREE.Color();TANIM.push({x:T.cx,z:T.cy+38,f:now=>{const S=TWN100_S.smoke,L=S.userData.L||[];
      for(let i=0;i<L.length;i++)for(let j=0;j<N;j++){const t=((now/4200)+j/N+i*.37)%1,s=L[i];d.position.set(s[0]+Math.sin(t*6+j*2.1)*.25+t*.7,s[1]+t*3.2,s[2]+Math.cos(t*5+j)*.2);d.scale.setScalar(Math.sin(Math.PI*t)*.42+.03);d.rotation.set(t*2,j,0);d.updateMatrix();S.setMatrixAt(i*N+j,d.matrix)}
      S.instanceMatrix.needsUpdate=true}});
    m.userData.c=c}
  const m=TWN100_S.smoke,c=m.userData.c;m.userData.L=L.slice(0,24);m.count=Math.min(24,L.length)*N;
  m.userData.L.forEach((s,i)=>{c.setHex(s[3]=='alch'?0x9ad8a0:s[3]=='sage'?0xb8a0e0:0xc8c4bc);for(let j=0;j<N;j++)m.setColorAt(i*N+j,c)});if(m.instanceColor)m.instanceColor.needsUpdate=true}
try{TWN100_shopSync()}catch(e){console.warn('v100 shops',e)}

