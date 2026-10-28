// ================= v165 The Dirge I — the Keeper's Grave =================
// The Dirge I's gateway to II is gone. Where it stood, a weeping angel watches over the road's end, a gravedigger's spade stuck in the
// earth at its feet and an inscription on its plinth: the Keeper sleeps where the stone is broken, a raven keeps watch and the candles
// never die. Fourteen graves stand along the road (dg165GravePlan, 3260), each with its own headstone, emblem and offering.
//  * F at a grave reads it (name, dates, epitaph, what you see on it). Once you have the spade, F again digs it up (3 s of digging,
//    walking away or a hit stops it).
//  * A wrong grave: the coffin bursts and its dead climb out (two or three of the Dirge's dead, local to you); the grave stays open.
//  * The Keeper's grave: the earth caves in on a stone stair. F · Descend into the Hidden Sanctum (3263). Once the Sanctum is behind
//    you, the stair (and the angel) lead straight on to the Drowned Crypts.
// The graves are built the first time you are in the Dirge I, hidden elsewhere. Their tiles are solid (CBLK) except the stair.
var DG165GR={S:null,dig:null,err:0,col:{st:0x5c5c60,st2:0x4a4a50,st3:0x6c6a64,moss:0x3a4a34,soil:0x2a241e,soil2:0x3a3026,wax:0xd0c4a2,iron:0x2a2c30,rust:0x5a3a24,bone:0xc8c0a8,lily:0xd8d4c8,stem:0x3a4a2a,rose:0x4a1214,raven:0x1c1c22}};
function dg165GIn(){return dg165InG(20)}
// ---------------- models ----------------
function dg165GraveKit(k,o){const C=DG165GR.col,R=svRng(4100+o.i*37),st=[C.st,C.st2,C.st3][o.i%3];
  // the mound: heaped earth with a ring of half-sunk stones, grass tufts
  k.p('','dod','c',C.soil,0,.02,.35,.62,.26,1.18,0,0,0);k.p('','dod','c',C.soil2,0,.12,.3,.46,.16,.92,.1,0,0);
  for(let i=0;i<14;i++){const a=i/14*6.283,x=Math.cos(a)*.78,z=.35+Math.sin(a)*1.32;k.p('','dod','c',lgCol(st,C.moss,R()*.6),x,.04,z,.12+R()*.08,.08+R()*.06,.12+R()*.08,R()*3,R()*3,R()*3)}
  for(let i=0;i<7;i++)k.p('','cone','c',lgCol(0x2e3a2a,0x4a5a3a,R()),(R()-.5)*1.3,.05,.35+(R()-.5)*2.2,.04,.18+R()*.12,.04,(R()-.5)*.5,0,(R()-.5)*.5);
  // the headstone
  const z0=-.95,tilt=(R()-.5)*.12;
  if(o.stone=='slab'){k.p('','box','c',st,0,.6,z0,1.0,1.2,.2,tilt,0,(R()-.5)*.06);k.p('','cyl','c',st,0,1.2,z0,.5,.2,.5,Math.PI/2+tilt,0,0);k.p('','box','c',lgCol(st,0,.25),0,.08,z0,1.15,.16,.32)}
  else if(o.stone=='cross'){k.p('','box','c',st,0,.78,z0,.22,1.56,.18,tilt,0,0);k.p('','box','c',st,0,1.12,z0,.9,.2,.18,tilt,0,0);k.p('','box','c',lgCol(st,0,.25),0,.1,z0,.6,.2,.4);
    k.p('','ring','c',lgCol(st,C.moss,.4),0,1.12,z0+.02,.3,.6,.3,Math.PI/2,0,0)}
  else if(o.stone=='obelisk'){k.p('','box','c',lgCol(st,0,.2),0,.14,z0,.86,.28,.86);k.p('','box','c',st,0,.95,z0,.46,1.4,.46,tilt*.5,0,0);k.p('','cone4','c',st,0,1.86,z0,.33,.42,.33,0,Math.PI/4,0);
    k.p('','box','c',lgCol(st,0,.3),0,.36,z0,.6,.12,.6)}
  else{// broken: the lower half stands tilted, its top a jagged break; the upper half lies cracked in the grass beside it
    k.p('','box','c',st,0,.34,z0,1.0,.68,.2,tilt-.08,0,.06);for(let i=0;i<6;i++)k.p('','box','c',st,-.42+i*.17,.7+R()*.1,z0,.17,.12+R()*.14,.2,0,0,(R()-.5)*.6);
    k.p('','box','c',lgCol(st,C.moss,.3),.72,.1,z0+.55,.95,.18,.5,0,.6,0);k.p('','cyl','c',lgCol(st,C.moss,.3),.98,.12,z0+.18,.45,.18,.45,0,.6,Math.PI/2);
    for(let i=0;i<5;i++)k.p('','dod','c',st,-.6+R()*1.2,.04,z0+.2+R()*.5,.06+R()*.05)}
  // lichen and a carved name panel
  k.p('','box','c',lgCol(st,0x1a1a1c,.55),0,o.stone=='broken'?.4:.62,z0+.105,.6,.26,.01);for(let i=0;i<5;i++)k.p('','box','c',C.moss,(R()-.5)*.8,.2+R()*.8,z0+.1,.12+R()*.1,.08+R()*.08,.012);
  // the emblem
  const ty=o.stone=='slab'?1.32:o.stone=='cross'?1.6:o.stone=='obelisk'?.32:.78,tz=o.stone=='obelisk'?z0+.44:z0;
  if(o.emb=='raven'){const y=o.stone=='obelisk'?1.1:ty,z=o.stone=='obelisk'?z0+.0:z0,x=o.stone=='obelisk'?.0:.05,rc=C.raven;
    const yb=o.stone=='obelisk'?.22:0;k.p('','sph','c',rc,x,y+.14+yb,z,.13,.15,.2,.3,0,0);k.p('','sph','c',rc,x,y+.3+yb,z+.12,.085,.085,.09);k.p('','cone4','c',0x0e0e10,x,y+.29+yb,z+.24,.025,.1,.025,Math.PI/2,0,0);
    [-1,1].forEach(s=>{k.p('','box','c',lgCol(rc,0x2a2a34,.3),x+s*.11,y+.16+yb,z-.02,.03,.12,.28,.3,s*.15,s*.12);k.p('','sph','g',0xb0ff90,x+s*.05,y+.32+yb,z+.18,.012)});
    k.p('','box','c',rc,x,y+.08+yb,z-.22,.12,.03,.22,-.4,0,0);[-1,1].forEach(s=>k.L('','c',0x101012,[x+s*.04,y+.06+yb,z+.02],[x+s*.04,y-.03+yb,z+.06],.008,.006,4))}
  else if(o.emb=='skull'){const y=o.stone=='obelisk'?.95:o.stone=='broken'?.42:.78,z=(o.stone=='obelisk'?z0+.24:z0+.11);k.p('','sph','c',C.bone,0,y,z,.12,.13,.07);k.p('','box','c',C.bone,0,y-.11,z+.01,.08,.05,.05);
    [-1,1].forEach(s=>k.p('','sph','c',0x0a0a0a,s*.045,y+.01,z+.05,.032,.03,.02));k.p('','cone4','c',0x0a0a0a,0,y-.05,z+.06,.015,.03,.01,Math.PI);
    [-1,1].forEach(s=>k.L('','c',C.bone,[s*-.2,y-.22,z],[s*.2,y-.12,z],.022,.02,5))}
  else if(o.emb=='rose'){const y=o.stone=='obelisk'?.95:o.stone=='broken'?.42:.8,z=(o.stone=='obelisk'?z0+.24:z0+.11);for(let i=0;i<6;i++){const a=i/6*6.283;k.p('','sph','c',lgCol(C.rose,0x2a0808,i/8),Math.cos(a)*.05,y+Math.sin(a)*.05,z,.045,.045,.025)}
    k.p('','sph','c',0x3a0a0c,0,y,z+.01,.04,.04,.03);k.L('','c',C.stem,[0,y-.05,z],[.02,y-.4,z],.012,.01,4);k.p('','box','c',C.stem,.05,y-.22,z,.08,.03,.01,0,0,.6)}
  else if(o.emb=='hourglass'){const y=o.stone=='obelisk'?.95:o.stone=='broken'?.42:.8,z=(o.stone=='obelisk'?z0+.24:z0+.11);k.p('','cone','c',lgCol(st,0x101010,.4),0,y+.1,z,.1,.18,.03,Math.PI,0,0);k.p('','cone','c',lgCol(st,0x101010,.4),0,y-.08,z,.1,.18,.03);
    [-1,1].forEach(s=>k.p('','box','c',lgCol(st,0x101010,.3),0,y+s*.2,z,.24,.03,.04));[-1,1].forEach(s=>k.L('','c',lgCol(st,0,.2),[s*.12,y-.08,z+.01],[s*.24,y+.28,z+.01],.012,.01,4))}
  else if(o.emb=='bell'){const y=o.stone=='broken'?.85:o.stone=='obelisk'?1.5:1.35,x=.32;k.L('','m',C.iron,[x-.1,y,z0],[x+.22,y+.04,z0+.02],.015,.015,4);k.L('','m',C.iron,[x+.2,y+.04,z0],[x+.22,y-.06,z0+.02],.008,.008,3);
    k.p('','cone','m',lgCol(C.iron,C.rust,.5),x+.22,y-.14,z0+.02,.07,.13,.07);k.p('','sph','m',C.rust,x+.22,y-.21,z0+.02,.02);k.L('','c',0x3a3026,[x+.22,y-.2,z0+.02],[x+.1,y-.5,z0+.5],.006,.006,3)}
  // what lies on the grave
  if(o.ext=='candles')[[-.35,.05,.25,.24],[.3,.06,.0,.18],[-.12,.08,-.35,.28],[.4,.04,.62,.14]].forEach(q=>dg165Candle(k,q[0],q[1]+.12,q[2],q[3]));
  else if(o.ext=='lilies'){for(let i=0;i<5;i++){const x=(R()-.5)*.4,z=.05+(R()-.5)*.3,a=R()*6.28;k.L('','c',C.stem,[x,.2,z],[x+Math.cos(a)*.3,.32,z+Math.sin(a)*.3],.008,.006,3);
      k.p('','cone','c',lgCol(C.lily,0x8a7a5a,.5),x+Math.cos(a)*.33,.3,z+Math.sin(a)*.33,.04,.08,.04,Math.PI/2+.4,a,0)}k.p('','box','c',0x3a2a2a,0,.21,.05,.08,.03,.08)}
  else if(o.ext=='cage'){// a mortsafe: an iron cage over the grave against the body snatchers
    for(let i=0;i<8;i++){const x=-.7+i*.2;k.L('','m',C.iron,[x,0,-.6],[x,.62,-.6],.018,.018,4);k.L('','m',C.iron,[x,.62,-.6],[x,.62,1.3],.018,.018,4);k.L('','m',C.iron,[x,0,1.3],[x,.62,1.3],.018,.018,4);k.p('','cone4','m',C.rust,x,.7,1.3,.025,.08,.025)}
    [-.6,1.3].forEach(z=>k.L('','m',C.rust,[-.75,.62,z],[.75,.62,z],.02,.02,4));[0,.3,.6,.95].forEach(z=>k.L('','m',C.rust,[-.75,.62,z],[.75,.62,z],.014,.014,4))}
  else if(o.ext=='chains'){for(let i=0;i<16;i++){const t=i/15,x=-.75+t*1.5,y=.18+Math.sin(t*Math.PI)*.12;k.p('','ring','m',i%2?C.iron:C.rust,x,y,.4,.06,.5,.06,i%2?Math.PI/2:0,0,i%2?0:Math.PI/2)}
    for(let i=0;i<10;i++){const a=i/10*6.283;k.p('','ring','m',i%2?C.iron:C.rust,Math.cos(a)*.52,.55,z0+Math.sin(a)*.12,.05,.5,.05,0,a,i%2?Math.PI/2:0)}
    k.p('','box','m',C.iron,.5,.12,1.3,.12,.16,.06);k.p('','ring','m',C.rust,.5,.2,1.3,.07,.4,.07,Math.PI/2,0,0)}
  else if(o.ext=='lantern'){k.L('','c',0x2a2018,[.75,0,.9],[.75,1.5,.9],.035,.03,5);k.L('','m',C.iron,[.75,1.45,.9],[.48,1.5,.9],.015,.015,4);
    k.p('','box','m',C.iron,.48,1.24,.9,.16,.24,.16);k.p('','box','g',0x9affd0,.48,1.24,.9,.11,.16,.11);k.p('','cone4','m',C.iron,.48,1.42,.9,.11,.1,.11,0,Math.PI/4,0)}}
function dg165GraveHole(k,o){const C=DG165GR.col,R=svRng(4200+o.i*13);
  // an open pit with a heap of fresh earth beside it and a smashed coffin in it
  k.p('','box','c',0x0c0a08,0,-.02,.35,1.0,.06,1.9);for(let i=0;i<8;i++){const s=i<4?-1:1;k.p('','dod','c',lgCol(C.soil,C.soil2,R()),s*.7,.02,.35+(i%4-1.5)*.5,.16,.08,.3,R(),R(),R())}
  k.p('','dod','c',C.soil2,1.25,.22,.2,.55,.42,.8,.3,.4,0);k.p('','dod','c',C.soil,1.1,.12,.75,.4,.25,.45,.2,1,0);
  k.p('','box','c',0x3a2618,0,.05,.35,.72,.1,1.6);for(let i=0;i<4;i++)k.p('','box','c',lgCol(0x4a3020,0x2a1a10,R()),-.3+i*.2,.12+R()*.08,.1+R()*.6,.18,.04,.7,R()*.4,R()*.8,R()*.4);
  k.p('','box','c',0x4a3020,1.2,.35,-.25,.7,.06,1.5,.4,.9,.3);for(let i=0;i<3;i++)k.p('','sph','c',C.bone,(R()-.5)*.4,.14,.3+(R()-.5)*.8,.05,.04,.08)}
// the angel at the road's end (local +z faces the clearing)
function dg165AngelModel(s){const g=new THREE.Group();g.userData.psNo=1;const C=DG165GR.col;
  g.add(lgGroup('DG165|angel',k=>{const R=svRng(4321),sA=0x77756e,sB=0x605e58,sC=0x8a8880;
    // the plinth: stepped base, a panel with the inscription
    k.p('','box','c',sB,0,.18,0,2.2,.36,2.2);k.p('','box','c',sA,0,.72,0,1.6,.8,1.6);k.p('','box','c',sB,0,1.2,0,1.85,.18,1.85);k.p('','box','c',lgCol(sB,0x1a1a1a,.5),0,.74,.81,1.1,.5,.02);
    for(let i=0;i<4;i++)k.p('','box','c',lgCol(sA,0x101010,.6),0,.62+i*.1,.83,.8-i*.06,.025,.01);
    for(let i=0;i<9;i++)k.p('','box','c',C.moss,(R()-.5)*1.8,.36+R()*.8,(R()<.5?-1:1)*(.8+R()*.02),.2+R()*.2,.1+R()*.15,.02);
    // the angel: a robed figure kneeling, head bowed into its hands, wings folded high behind it
    k.p('','skirt','c',sA,0,1.62,0,.55,.85,.48);k.p('','sph','c',sA,0,2.08,.02,.3,.42,.25,.25,0,0);k.p('','sph','c',sC,0,2.42,.18,.16,.18,.17,.6,0,0);
    k.p('','hood','c',sB,0,2.44,.14,.2,.24,.22,-.9,0,0);[-1,1].forEach(sd=>{k.L('','c',sA,[sd*.24,2.28,.05],[sd*.14,2.18,.26],.07,.06,5);k.L('','c',sA,[sd*.14,2.18,.26],[sd*.06,2.42,.3],.05,.045,5);k.p('','sph','c',sC,sd*.05,2.44,.31,.06,.07,.04)});
    for(let i=0;i<7;i++)k.p('','box','c',lgCol(sA,sB,i/7),(i-3)*.08,1.25,.38+Math.abs(i-3)*.02,.07,.3,.06,.2,0,0);   // robe folds
    [-1,1].forEach(sd=>{for(let i=0;i<7;i++){const t=i/6,y=2.0+t*1.25,x=sd*(.22+.32*Math.sin(t*2.6)),z=-.22-.18*t;k.p('','box','c',lgCol(sA,sC,t),x,y,z,.16+.2*(1-t),.55-.3*t,.06,-.15,sd*.35,sd*(.25-t*.5))}
      for(let i=0;i<5;i++)k.p('','box','c',lgCol(sB,sA,i/5),sd*(.3+i*.06),1.65-i*.08,-.28,.08,.6,.04,-.1,sd*.4,sd*.2)});
    // cracks, a chipped wing tip, moss
    k.p('','box','c',0x2a2a28,.25,2.0,.2,.02,.3,.02,0,0,.3);for(let i=0;i<6;i++)k.p('','sph','c',C.moss,(R()-.5)*.6,1.3+R()*1.4,(R()-.5)*.5,.06+R()*.06,.04,.06+R()*.04);
    // the gravedigger's spade in a heap of earth, an iron lantern on a crook
    k.p('','dod','c',C.soil,1.55,.12,.75,.45,.2,.42);k.L('','c',0x4a3420,[1.5,.2,.75],[1.62,1.5,.62],.03,.028,5);k.p('','box','c',0x4a3420,1.63,1.52,.61,.2,.04,.04);
    k.p('','box','m',0x3a3c40,1.48,.25,.78,.24,.34,.03,0,.1,.06);k.L('','c',0x2a2018,[-1.4,0,.7],[-1.45,1.9,.7],.035,.03,5);k.L('','m',DG165GR.col.iron,[-1.45,1.85,.7],[-1.15,1.9,.7],.015,.015,4);
    k.p('','box','m',DG165GR.col.iron,-1.15,1.62,.7,.18,.26,.18);k.p('','box','g',0x9affd0,-1.15,1.62,.7,.12,.18,.12);
    // offerings: candles round the base
    [[-.8,.36,1.0],[.85,.36,1.0],[-.4,.36,1.05],[.5,.36,1.02]].forEach(q=>dg165Candle(k,q[0],q[1],q[2],.18))},0));
  g.position.set(s.x,GH(s.x,s.z),s.z);g.rotation.y=s.ry;g.scale.setScalar(1.35);scene.add(g);
  g.userData.fl=[[-.8,.62,1.0],[.85,.62,1.0],[-.4,.62,1.05],[.5,.62,1.02]].map(q=>dg165Flame(g,q[0],q[1]-.05,q[2],.16));
  const ca=Math.cos(s.ry),sa=Math.sin(s.ry);for(let o=-1.6;o<=1.6;o+=.5)for(let d=-1.6;d<=1.6;d+=.5){const x=s.x+ca*o+sa*d,z=s.z-sa*o+ca*d;CBLK.add(Math.round(z)*W+Math.round(x))}
  return g}
// the opened Keeper's grave: the earth has fallen through onto a stone stair going down into green light
function dg165StairKit(k){const C=DG165GR.col,R=svRng(4444),sA=0x4a4a4e,sB=0x3a3a3e;
  k.p('','box','c',0x020302,0,-.02,.2,1.3,.04,2.4);for(let i=0;i<7;i++)k.p('','box','c',lgCol(sA,0x101010,i/7),0,-.12-i*.22,1.1-i*.36,1.15,.22,.36);
  [-1,1].forEach(s=>{k.p('','box','c',sB,s*.72,.05,.2,.2,.24,2.5);for(let i=0;i<5;i++)k.p('','dod','c',lgCol(C.soil,C.soil2,R()),s*(.95+R()*.3),.08,-.8+i*.5,.2+R()*.1,.12,.25)});
  k.p('','box','c',sB,0,.05,-1.0,1.6,.24,.25);k.p('','dod','c',C.soil2,1.4,.25,-.3,.6,.4,.7,.2,.4,0);for(let i=0;i<6;i++)k.p('','dod','c',lgCol(C.st,C.moss,R()*.5),(R()-.5)*2.6,.06,(R()-.5)*2.8,.08+R()*.1)}
// ---------------- the world: built the first time you are in the Dirge I ----------------
function dg165GBuild(){if(DG165GR.S)return DG165GR.S;const Pl=dg165GravePlan(),S={gr:[],fl:[],spots:[],root:new THREE.Group()};S.root.name='DirgeGraves';scene.add(S.root);DG165GR.S=S;
  Pl.G.forEach(o=>{const g=new THREE.Group();g.position.set(o.x,GH(o.x,o.z),o.z);g.rotation.y=o.ry;S.root.add(g);
    const body=lgGroup('DG165|grave'+o.i,k=>dg165GraveKit(k,o),0);g.add(body);
    const hole=lgGroup('DG165|hole'+o.i,k=>dg165GraveHole(k,o),0);hole.visible=false;g.add(hole);
    g.scale.setScalar(1.3);const G={o,g,body,hole,stair:null,fl:[],mark:null};
    // a pale grave-light hangs over every grave of the quest (all alike: it does not give the Keeper away)
    {const w=kqSpr(0xa8d8ff,.55);w.material=w.material.clone();w.material.opacity=.45;w.position.set(0,2.3,-.95);g.add(w);G.wisp=w}
    if(o.ext=='candles')[[-.35,.05,.25,.24],[.3,.06,.0,.18],[-.12,.08,-.35,.28],[.4,.04,.62,.14]].forEach(q=>G.fl.push(dg165Flame(g,q[0],q[1]+.12+q[3]+.05,q[2],.15)));
    if(o.ext=='lantern'){const f=dg165Flame(g,.48,1.24,.9,.35,0x9affd0);G.fl.push(f)}
    S.fl.push(...G.fl);
    // a faint lantern-glow on the Keeper's candles (the candles that never die: still, no flicker, a soft green-white)
    if(o.i===DG165G.K)G.fl.forEach(f=>{f.material=f.material.clone();f.material.color.setHex(0xe8fff0);f.userData.still=1});
    // tiles: the headstone and the mound block the way (the stair stays open when the Keeper's grave is dug)
    const ca=Math.cos(o.ry),sa=Math.sin(o.ry);G.blk=[];for(let lx=-1;lx<=1;lx+=.5)for(let lz=-1.4;lz<=1.8;lz+=.5){const x=o.x+ca*lx+sa*lz,z=o.z-sa*lx+ca*lz,key=Math.round(z)*W+Math.round(x);if(G.blk.indexOf(key)<0)G.blk.push(key)}
    G.blk.forEach(q=>CBLK.add(q));S.gr.push(G);
    S.spots.push({x:o.x+Math.sin(o.ry)*1.2,y:GH(o.x,o.z)+.7,z:o.z+Math.cos(o.ry)*1.2,c:o.i===DG165G.K?0xd8ffe8:0xffb060,i:o.ext=='candles'?.9:o.ext=='lantern'?1:0,r:6,fq:o.i===DG165G.K?0:9})});
  S.pool=dg165LPool(4,7);dg165GSync();return S}
// match the graves to the state: dug wrong ones open, the Keeper's opened onto the stair
function dg165GSync(){const S=DG165GR.S;if(!S)return;S.gr.forEach(G=>{const i=G.o.i,keep=i===DG165G.K,open=keep?dg165GDone():!!DG165Q.g.bad[i];
  G.body.visible=!open||(!keep&&false);G.hole.visible=open&&!keep;if(keep&&open&&!G.stair){G.stair=lgGroup('DG165|stair',dg165StairKit,0);G.g.add(G.stair);
    const gl=new THREE.PointLight(0x7affb0,1.4,6,1.6);gl.position.set(0,-.8,.4);G.g.add(gl);G.lt=gl;const b=kqSpr(0x5affa0,2.2);b.material=b.material.clone();b.material.opacity=.35;b.position.set(0,-.2,.2);G.g.add(b);G.glow=b}
  if(G.stair)G.stair.visible=keep&&open;if(keep&&open)G.fl.forEach(f=>f.visible=false);
  // the open stair is walkable: its tiles come off the block list
  if(keep&&open&&!G.unb){G.unb=1;G.blk.forEach(q=>CBLK.delete(q))}})}
function dg165GTick(dt,now){const inI=dg165GIn(),t=now/1000;if(inI&&!DG165GR.S)try{dg165GBuild()}catch(e){if(!DG165GR.err++)console.error('v165 graves',e)}
  const S=DG165GR.S;if(!S)return;S.root.visible=inI;dg165LPoolTick(S.pool,S.spots,pl.position,t,inI);if(!inI){DG165GR.dig=null;return}
  dg165FlTick(S.fl.filter(f=>!f.userData.still),t);S.gr.forEach((G,j)=>{if(G.wisp){const open=G.o.i===DG165G.K?dg165GDone():!!DG165Q.g.bad[G.o.i];G.wisp.visible=!open;G.wisp.position.y=2.3+.15*Math.sin(t*1.3+j);G.wisp.material.opacity=.32+.14*Math.sin(t*2.1+j*1.7)}if(G.glow)G.glow.material.opacity=.28+.1*Math.sin(t*2.2);if(G.lt)G.lt.intensity=1.2+.3*Math.sin(t*3.1)});
  const A=SP152.gates.sanctum;if(A&&A.g&&A.g.userData.fl)dg165FlTick(A.g.userData.fl,t);
  // the Keeper's candles: a thin wisp of pale smoke rises from them, straight up, never bending
  const K=S.gr[DG165G.K];if(K&&!dg165GDone()&&Math.random()<dt*3&&Math.hypot(pl.position.x-K.o.x,pl.position.z-K.o.z)<30){const f=K.fl[(Math.random()*K.fl.length)|0];if(f){const p=f.getWorldPosition(new THREE.Vector3());p.y+=.1;burst(p,0xd8ffe8,1,.02,.8,1.2)}}
  if(DG165GR.dig)dg165DigTick(dt,now)}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{dg165GTick(dt,now)}catch(e){if(!DG165GR.err++)console.error('v165 graves tick',e)}return r}}
// ---------------- reading a grave ----------------
var DG165OBS={stone:{slab:'The headstone is a plain, rounded slab',cross:'A stone cross stands at its head',obelisk:'A tall obelisk marks it',broken:'Its headstone is <b>broken in two</b>; the top half lies in the grass'},
  emb:{raven:'a <b>stone raven</b> perches on it, watching the road',skull:'a skull is carved on its face',rose:'a rose is carved on its face',hourglass:'an hourglass is carved on its face',bell:'a little iron bell hangs from it on a cord that runs into the earth'},
  ext:{candles:'<b>Candles</b> burn on the mound',lilies:'Wilted lilies lie on the mound',cage:'An iron cage is locked over the grave',chains:'Rusted chains bind the mound',lantern:'A lantern hangs over it on a crook'}};
function dg165GCard(G){const o=G.o,keep=o.i===DG165G.K;let ext=DG165OBS.ext[o.ext];if(o.ext=='candles')ext+=keep?' · their flames are perfectly still, though the wind blows':' · they gutter in the wind';
  const sp=DG165Q.g.st>=1,hint=sp?'F · Dig up this grave':'You would need a spade to open it — the gravedigger’s lies by the weeping angel at the road’s end';
  dg165CardShow(`<div class="kk">✝ Here lies</div><div class="nm">${o.name}</div><div class="dt">${o.date}</div><div class="ep">“${o.epi}”</div>
    <div class="ob">${DG165OBS.stone[o.stone]}; ${DG165OBS.emb[o.emb]}. ${ext}.</div><div class="hn">${hint}</div>`,o.x,o.z,3.6)}
function dg165AngelCard(s){dg165CardShow(`<div class="kk">🕯 Carved into the plinth</div><div class="ep">“Where the stone lies broken,<br>where the raven keeps its watch,<br>where the candles never die —<br>there the Keeper sleeps<br>above the door below.”</div>
  <div class="ob">A gravedigger’s spade stands in the heap of earth at the angel’s feet. You take it.</div><div class="hn">Find the Keeper’s grave among the graves along the road and dig it up</div>`,s.x,s.z,4.2)}
// ---------------- digging ----------------
function dg165DigStart(G){if(DG165GR.dig||AF)return;if(riding)try{dismount(true)}catch(_){}
  DG165GR.dig={G,t:0,need:3.2,sw:0,hp:hero.hp,x:pl.position.x,z:pl.position.z};dg165CardHide();say('⛏ You start to dig up the grave of '+G.o.name+'…')}
function dg165DigTick(dt,now){const D=DG165GR.dig,G=D.G,o=G.o,P=pl.position;
  if(Math.hypot(P.x-D.x,P.z-D.z)>.6||hero.hp<D.hp-1||Math.hypot(P.x-o.x,P.z-o.z)>3.4){DG165GR.dig=null;say('⛏ You stop digging.');return}
  D.t+=dt;D.sw-=dt;try{face(V(o.x-P.x,0,o.z-P.z).normalize())}catch(_){}
  if(D.sw<=0){D.sw=.55;try{if(!pl.sw)swingAnim((D.n=(D.n||0)+1)%2,320)}catch(_){}setTimeout(()=>{try{dg165Snd('spade',.8,.9+Math.random()*.2);burst(gY(V(o.x+Math.sin(o.ry)*.4,0,o.z+Math.cos(o.ry)*.4),.3),0x3a3026,10,1.8,2.2,.5)}catch(_){}},180)}
  G.body.children.forEach(m=>{m.scale.y=Math.max(.5,1-D.t/D.need*.35)});
  if(D.t>=D.need){DG165GR.dig=null;G.body.children.forEach(m=>m.scale.y=1);dg165DigDone(G,true)}}
function dg165DigDone(G,mine){const o=G.o,keep=o.i===DG165G.K;
  if(keep){if(DG165Q.g.st>=2)return;DG165Q.g.st=2;dg165GSync();dg165Snd('rumble',1,1);shake(.5);dg165Fear(.6);
    for(let i=0;i<40;i++)setTimeout(()=>{try{burst(gY(V(o.x+(Math.random()-.5)*1.6,0,o.z+(Math.random()-.5)*2.4),.2),0x2a241e,4,1.5,2,.6)}catch(_){}},i*40);
    setTimeout(()=>{dg165Snd('choir',.9,1);dg165Title('The Keeper’s Grave','The earth gives way onto a stair going down into the dark','F · Descend into the Hidden Sanctum')},900);
    say('🕯 The earth caves in under your spade: a stone stair leads down beneath the Keeper’s grave.');if(mine)try{dg165Co('dig',o.i)}catch(_){}return}
  if(DG165Q.g.bad[o.i])return;DG165Q.g.bad[o.i]=1;dg165GSync();if(!mine)return;
  // the wrong grave: the lid bursts and its dead climb out
  dg165Snd('splint',1,.8);dg165Snd('scream',.6,.7+Math.random()*.2);shake(.3);dg165Fear(.8);flash('rgba(40,90,60,.35)');
  const lv=dg165Lv(20),n=o.i>=7?3:2,keys=['ghoul','skeleton','ghoul'];
  for(let k=0;k<n;k++)setTimeout(()=>{try{const a=Math.random()*6.283,x=o.x+Math.sin(o.ry)*.3+Math.cos(a)*.8,z=o.z+Math.cos(o.ry)*.3+Math.sin(a)*.8;
    const e=spawnEnemy(keys[k],x,z,lv[1],{agg:1,minion:1});if(e){e.agg=1;e.hunt=1;e.dg165r=1;burst(gY(V(x,0,z),.3),0x3a3026,24,2,3,.8);dg165Snd('gasp',.6,.8)}}catch(err){console.warn('v165 risen',err)}},350+k*420);
  setTimeout(()=>say('☠ Not the Keeper. Something else was sleeping in '+o.name+'’s grave…'),500)}
// ---------------- prompts at the graves ----------------
function dg165GPrompt(){if(!dg165GIn()||!DG165GR.S)return null;const P=pl.position;if(DG165GR.dig){const D=DG165GR.dig;return {label:'⛏ Digging… '+Math.round(D.t/D.need*100)+'%',fn:()=>{DG165GR.dig=null}}}
  let best=null,bd=2.7;for(const G of DG165GR.S.gr){const o=G.o,d=Math.hypot(P.x-o.x-Math.sin(o.ry)*1.3,P.z-o.z-Math.cos(o.ry)*1.3);if(d<bd){bd=d;best=G}}
  if(!best)return null;const G=best,o=G.o,keep=o.i===DG165G.K;
  if(keep&&dg165GDone()){if(dg165SDone()){const N=INSL[21];return {label:'F · Take the stair down to '+N.n+' ('+rpTxt139(N.lv[0])+')',fn:()=>insGo(N)}}
    return {label:'F · Descend into the Hidden Sanctum',fn:()=>{try{dg165SEnter()}catch(e){console.error('v165 sanctum enter',e)}}}}
  if(!keep&&DG165Q.g.bad[o.i])return {label:'🪦 The grave of '+o.name+' · dug open, empty now',fn:()=>dg165GCard(G)};
  const seen=DG165Q.g.ex[o.i],open=DG165.card&&Math.abs(DG165.card.x-o.x)<.01&&Math.abs(DG165.card.z-o.z)<.01;
  if(!seen||!open)return {label:'F · Read the grave'+(seen?' of '+o.name:''),fn:()=>{DG165Q.g.ex[o.i]=1;dg165GCard(G);dg165Snd('whisper',.4,.9+Math.random()*.2)}};
  if(DG165Q.g.st<1)return {label:'🪦 You have nothing to dig with · the gravedigger’s spade lies by the angel at the road’s end',fn:()=>dg165GCard(G)};
  return {label:'F · Dig up the grave of '+o.name,fn:()=>dg165DigStart(G)}}
{const f=worldPrompt;worldPrompt=function(){try{const r=dg165GPrompt();if(r)return r}catch(e){if(!DG165GR.err++)console.warn('v165 grave prompt',e)}return f.apply(this,arguments)}}
// ---------------- the angel at the road's end (it replaces the gateway to II) ----------------
sp152Gate('sanctum',{ig:20,r:3.4,build:dg165AngelModel,
  prompt(s){if(dg165SDone()){const N=INSL[21];return {label:'F · Travel on to '+N.n+' ('+rpTxt139(N.lv[0])+')',fn:()=>insGo(N)}}
    return {label:'F · Read the weeping angel',fn:()=>{const first=DG165Q.g.st<1;DG165Q.g.st=Math.max(1,DG165Q.g.st);dg165AngelCard(s);dg165Snd('choir',.6,.9);
      if(first){try{pickup({ic:'⛏',t:'Gravedigger’s Spade',col:'#cfe8dc',sub:'Dig up the Keeper’s grave'})}catch(_){}setTimeout(()=>say('🕯 Read the graves along the road. Only one has all three marks.'),3500)}}}}});
// a dead risen from a wrong grave gives little (the graves are not a farm)
{const f=gw150X;gw150X=function(e){const k=f.apply(this,arguments);return e&&e.dg165r?k*.35:k}}
{const f=lootE;lootE=function(e){if(e&&e.dg165r&&Math.random()>=.3)return;return f.apply(this,arguments)}}
// ---------------- the tracker ----------------
SP152.trk.dirgeI=I=>{if(I.g!==20||dg165SDone())return null;const n=DG165Q.g.ex.filter(Boolean).length,N=dg165GravePlan().G.length;
  if(dg165GDone())return {name:'The Keeper’s Grave',lines:[['The stair beneath the Keeper’s grave'],['Descend into the Hidden Sanctum']]};
  if(DG165Q.g.st<1)return {name:'The Keeper’s Grave',lines:[['Follow the road to its end'],['Read the weeping angel'],['Graves read',n+'/'+N]]};
  return {name:'The Keeper’s Grave',lines:[['Find the Keeper’s grave'],['A broken stone · a raven · undying candles',null,1],['Graves read',n+'/'+N]]}};
// ---------------- the minimap: graves you have read ----------------
function dg165GMarks(g,P,k){if(!dg165GIn())return;dg165GravePlan().G.forEach((o,i)=>{const seen=DG165Q.g.ex[i],keep=i===DG165G.K&&dg165GDone();if(!seen&&!keep)return;const q=P(o.x,o.z);if(!q)return;
  g.save();g.translate(q[0],q[1]);g.scale(k,k);const c=keep?'#7affb0':DG165Q.g.bad[i]?'#6a5a4a':'#c8ccc4';g.fillStyle='#141618';g.fillRect(-3.4,-4.4,6.8,8.8);g.strokeStyle=c;g.lineWidth=1.4/k;
  g.beginPath();g.moveTo(0,-3.4);g.lineTo(0,3.4);g.moveTo(-2.2,-1.2);g.lineTo(2.2,-1.2);g.stroke();g.restore()})}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{dg165GMarks(mmX,(x,z)=>{const X=(x-(cx-vw/2)+.5)*w/vw,Y=(z-(cy-vh/2)+.5)*h/vh;return X<-6||Y<-6||X>w+6||Y>h+6?null:[X,Y]},1)}catch(_){}}}
