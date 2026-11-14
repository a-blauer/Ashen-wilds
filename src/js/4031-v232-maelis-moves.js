// ================= v232 Maelis — the moves (Sovereign move format; the kit 4010 points the engine at her eyrie) =================
// Theme: the storm: talons, wind, feathers, lightning. Debuff: Shocked (a jolt: slower attacks and movement for a moment).
// Pattern:
//  close, front ── Talon Rake: a foot drawn up and raked across (an arc), the other foot (an arc), then the beak reared back and
//                  hammered down on one spot in front of her (late, heavy).
//  mid, front   ── Wing Buffet: both wings hauled back, then clapped together: a wide cone of wind that throws you a long way
//                  (into the edge, in Phase II, where the lightning walks).
//  behind/side  ── Tail Sweep: she turns and fans her tail round her: a ring (stand close in, or far out).
//  any, not near ─ Skyfall: she crouches, leaps into the sky and stoops on you: the shadow follows you for a moment, then locks.
//                  A blast where she lands and a ring of wind rolling out from it.
//  far, front   ── Feather Volley: wings swept up, then whipped down: five quills in a fan. Stand in a gap.
//  close, any   ── Thunderclap: she rears screeching, wings wide: a blast round her, then three bolts fall from the sky, each aimed
//                  ahead of you.
//  Phase II (55%) "Eye of the Storm": the cloud breaks. Rain, and a wind that drags you sideways round the eyrie; bolts walk the
//                  ground at random (marked a moment before). She rests less and gains Twin Skyfall (two stoops), Galeblades
//                  (three walls of wind fired one after another, each through where you stand) and a double Feather Volley.
//  Signature ──── Static Charge (Phase II): she climbs out of reach and the storm marks YOU. The charge on you bursts after a few
//                  seconds: a heavy blow. Three copper rods stand round the eyrie: be next to one when it bursts and the rod takes
//                  it and throws it back at her (she is wounded). She marks you three times and a rod can take only one charge
//                  each time she does this, so you must cross the eyrie, through wind and bolts, to a fresh rod each time. Ground
//                  all three and she is struck out of the sky: a long stagger. Each one you miss heals her instead.
// Weakness: posture (the yellow bar); every break staggers her (+35% damage). Big moves have armour.
const ML232_DEB=['Shocked','⚡',{mspd:-.2,as:-.2},'A jolt runs through you: −20% move and attack speed'];
function ml232Mats(){const X=WK232.X;return X.ml||(X.ml={quill:new THREE.MeshStandardMaterial({color:0x2f3a4c,roughness:.7,flatShading:true,side:THREE.DoubleSide}),glass:new THREE.MeshStandardMaterial({color:0x1c3a4c,emissive:0x3ab8ff,emissiveIntensity:.9,roughness:.2,flatShading:true})})}
function ml232Shock(){dqDebuff(ML232_DEB[0],ML232_DEB[1],ML232_DEB[2],2500,ML232_DEB[3])}
// a bolt from the sky onto p (the hit is the caller's): a jagged streak for an instant, a flash, a scorch
function ml232Bolt(p,big){const y0=GH(p.x,p.z),N=7,pts=[];let x=p.x+(Math.random()-.5)*5,z=p.z+(Math.random()-.5)*5;for(let i=0;i<=N;i++){const k=i/N;pts.push(new THREE.Vector3(x+(p.x-x)*k+(i&&i<N?(Math.random()-.5)*1.6:0),y0+26*(1-k),z+(p.z-z)*k+(i&&i<N?(Math.random()-.5)*1.6:0)))}
  const g=new THREE.BufferGeometry().setFromPoints(pts),m=new THREE.LineBasicMaterial({color:0xdff6ff,transparent:true,opacity:1,fog:false}),ln=new THREE.Line(g,m);ln.userData.lpsSkip=1;scene.add(ln);
  const core=new THREE.Mesh(svG('ml_bc',()=>{const q=new THREE.CylinderGeometry(.16,.3,26,6,1,true);q.translate(0,13,0);return q}),new THREE.MeshBasicMaterial({color:0xbfeaff,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  core.position.set(p.x,y0,p.z);core.userData.lpsSkip=1;scene.add(core);let t=0;const s=big?1.5:1;
  burst(gY(p,.4),ML232.bolt,big?50:26,4,3,.5);svShock(p,ML232.col,2.6*s,.3);svDecal(p,0x10161c,1.7*s,4,.6);try{sk146Crack(p,0x7ad8ff,2.2*s,1.6)}catch(_){}try{sk146Flash(gY(p,2),0xbfeaff,big?5:3,16,160)}catch(_){}svSnd('crack',big?1.3:.9,1.5);svSnd('heavy',.6,1.4);
  kqFx({tick(dt){t+=dt||0;const k=t/.28;m.opacity=1-k;core.material.opacity=.8*(1-k);core.scale.set(1+k*2,1,1+k*2);return k<1},end(){scene.remove(ln);scene.remove(core);g.dispose();m.dispose();core.material.dispose()}})}
function ml232Quill(c,an,dm,spd){wk232Bolt(c,an,dm,{col:ML232.col,spd:spd||18,w:1.0,y:1.5,mesh:()=>{const g=new THREE.Group(),m=new THREE.Mesh(svG('ml_q',()=>{const s=new THREE.Shape();s.moveTo(0,.8);s.quadraticCurveTo(.16,.2,.1,-.6);s.lineTo(0,-.8);s.lineTo(-.1,-.6);s.quadraticCurveTo(-.16,.2,0,.8);const q=new THREE.ShapeGeometry(s,3);q.rotateX(Math.PI/2);return q}),ml232Mats().quill);g.add(m);return g},on:ml232Shock})}
// a wall of wind running along a line (Galeblades): hits once, throws you sideways
function ml232Gale(c,an,dm){const e=c.e,D=e.wk,a=an.a,o=new THREE.Vector3(an.x,0,an.z),L=26,spd=15,g=new THREE.Group();
  for(let k=0;k<3;k++){const m=new THREE.Mesh(svG('ml_gl',()=>{const q=new THREE.CylinderGeometry(1.5,1.5,2.4,10,1,true,0,Math.PI);q.translate(0,1.2,0);return q}),new THREE.MeshBasicMaterial({color:0xcfeeff,map:SPR,transparent:true,opacity:.35-k*.08,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));m.position.z=-k*.7;m.rotation.y=-Math.PI/2;g.add(m)}
  g.userData.lpsSkip=1;scene.add(g);let t=0,hit=false;svSnd('whoosh',1,.7);
  kqFx({tick(dt){t+=dt||0;const d=spd*t,p=new THREE.Vector3(o.x+Math.sin(a)*d,0,o.z+Math.cos(a)*d);g.position.set(p.x,GH(p.x,p.z),p.z);g.rotation.y=a;if(Math.random()<.9)burst(gY(p,.3),0xc8b89a,2,2,1,.4);
    if(!hit&&!e.dead&&svIn({k:'l',w:3.0,l:1.4,b:.7},{x:p.x,z:p.z,a},pl.position,.2)){hit=true;wk232HitNow(e,{k:'c',r:99},{x:p.x-Math.cos(a)*.5,z:p.z+Math.sin(a)*.5,a},dm,{flash:false,kb:5})}
    return d<L&&!e.dead},end(){scene.remove(g);g.children.forEach(m=>m.material.dispose())}})}
const ML232_TR=(t0,t1,j)=>[t0,t1,j,[0,-.1,0],[0,-.3,.6],0xbfeaff,.16];
// one stoop of a string: leap at tb, shadow locks at tb+1.45, she lands at tb+2.0
function ml232Stoop(tb,o){o=o||{};return {trn:[tb,tb+1.4,6],
  hit:[{t:tb+2.0,s:{k:'c',r:3.2},o:'tgt',dm:o.dm||1.4,w:.55,kb:4,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);c.m.position.x=p.x;c.m.position.z=p.z;c.S.ghost=0;svShock(p,ML232.col,5,.45);burst(gY(p,.4),0xc8b89a,50,5,3,.7);burst(gY(p,.6),ML232.bolt,30,4,2,.5);
      svDecal(p,0x10161c,3,4,.55);shake(.45);svSnd('heavy',1.3,.8);try{sk146Crack(p,0x7ad8ff,4,2)}catch(_){}try{sk146RingWave(c.e,p.clone(),2.4,12,1.3,1.1,.9,ML232.col,{})}catch(_){}}}],
  trk:[[tb+.3,'crouch','io'],[tb+.48,'crouch','l',.014],[tb+.75,'flyUp','o'],[tb+1.0,'flyDn','io'],[tb+1.25,'flyUp','io'],[tb+1.5,'flyDn','io'],[tb+1.72,'stoop','i'],[tb+2.0,'land','s'],[tb+2.35,'land','l']],
  ev:[[tb+.25,c=>svSnd('hiss',.5,1.3)],[tb+.5,c=>{c.S.ghost=1;svSnd('whoosh',1.2,.7);burst(gY(c.m.position,.3),0xc8b89a,30,4,1,.6);svShock(c.m.position,ML232.col,3.5,.35)}],[tb+1.5,c=>svSnd('shriek',.7,1.2)]],
  // while she is up she drifts over you; the last half second she is committed
  tk(c,dt){if(c.t>tb+.55&&c.t<tb+1.45){const m=c.m,p=wk232HeroIn(c.D,pl.position.clone());m.position.x+=(p.x-m.position.x)*Math.min(1,dt*2.2);m.position.z+=(p.z-m.position.z)*Math.min(1,dt*2.2)}}}}
var ML232M={
  intro:WK232_M({dur:3.4,inv:[0,3.4],armor:1,trn:[[0,3.4,1.5]],trk:[[.6,'open','io'],[1.3,'open','l',.015],[1.6,'scr','o'],[2.9,'scr','l',.025],[3.4,'cRec','io']],
    ev:[[.4,c=>svSnd('whoosh',.8,.6)],[1.6,c=>{svSnd('shriek',1.2,.9);svSnd('roar',.6,1.3);shake(.35);svShock(c.m.position,ML232.col,9,.8);burst(gY(c.m.position,3),ML232.bolt,60,6,2,.8);ml232Bolt(c.at(5,3));ml232Bolt(c.at(5,-3))}]]}),
  // Talon Rake: left foot, right foot, the beak
  rake:WK232_M({wt:10,cd:2.6,r:[0,5.4],a:'f',mel:1,dur:2.7,lock:.4,trn:[[0,.42,5],[.84,.96,5],[1.44,1.72,3.6]],
    trk:[[.4,'rkUp','io'],[.52,'rkUp','l',.012],[.64,'rkCut','s'],[.86,'rkCut','l'],[1.0,'rkUp~','io'],[1.12,'rkCut~','s'],[1.4,'pkUp','io'],[1.72,'pkUp','l',.016],[1.86,'peck','s'],[2.25,'peck','l'],[2.7,'cRec','io']],
    rm:[[.56,.66,.7,'o'],[1.04,1.14,.6,'o'],[1.76,1.88,1.2,'o']],
    hit:[{t:.63,s:{k:'a',r:4.4,h:1.1},f:.3,dm:.9},{t:1.11,s:{k:'a',r:4.4,h:1.1},f:.3,dm:.9},
      {t:1.86,s:{k:'c',r:2.3},f:3.4,dm:1.4,w:.44,fx:c=>{const p=c.at(3.4);svShock(p,ML232.col,3,.35);burst(gY(p,.3),0xc8b89a,30,3,2,.5);svDecal(p,0x10161c,2,3,.55);shake(.25);svSnd('heavy',1,1.2);svSnd('crack',.6,1.2)}}],
    tr:[ML232_TR(.55,.72,'ftL'),ML232_TR(1.02,1.18,'ftR')],
    ev:[[.56,c=>svSnd('swing',.85,1.3)],[1.04,c=>svSnd('swing',.85,1.4)],[1.44,c=>svSnd('hiss',.5,1.4)],[1.78,c=>svSnd('whoosh',.9,1.2)]],nx:[['buffet',.25,10],['tail',.3,6]],rec:.3}),
  // Wing Buffet: a wide cone of wind, a long throw
  buffet:WK232_M({wt:8,cd:6,r:[2.5,10],a:'f',armor:1,dur:2.3,lock:.8,trn:[[0,.8,4]],
    trk:[[.7,'bfUp','io'],[1.0,'bfUp','l',.016],[1.14,'buff','s'],[1.6,'buff','l'],[2.3,'cRec','io']],
    hit:[{t:1.14,s:{k:'a',r:9.5,h:.85},f:.2,dm:1.1,kb:8,w:.8,fx:c=>{const p=c.at(3);burst(gY(p,1),0xc8b89a,60,9,2,.7);burst(gY(c.at(6),1),0xdfe9f0,40,9,1,.7);svShock(c.at(1.5),ML232.col,5,.4);shake(.3);svSnd('whoosh',1.4,.6);svSnd('heavy',.8,1)}}],
    ev:[[.4,c=>svSnd('whoosh',.7,.8)]],rec:.4}),
  // Tail Sweep: a ring round her (from behind or the side)
  tail:WK232_M({wt:(e,L,side)=>side==='b'?14:side==='s'?6:0,cd:5,r:[0,5.8],a:'sb',dur:1.95,lock:.55,trn:[[0,.5,2]],
    trk:[[.55,'tlWind','io'],[.82,'tlWind','l',.015],[1.0,'tlWhip','s'],[1.36,'tlWhip','l'],[1.95,'cRec','io']],
    hit:[{t:1.0,s:{k:'r',r0:1.2,r:5.8},dm:1.1,kb:3,w:.8,fx:c=>{svShock(c.m.position,ML232.col,6,.4);burst(gY(c.m.position,.6),0xc8b89a,30,5,1,.5);svSnd('whoosh',1.1,.85);svSnd('swing',.8,.8)}}],
    tr:[[.88,1.2,'tail1',[0,0,-.6],[0,0,-2.2],0xbfeaff,.22]],ev:[[.4,c=>svSnd('hiss',.6,1.3)]],rec:.35}),
  // Skyfall: the stoop
  skyfall:WK232_M((()=>{const d=ml232Stoop(.1);return {wt:(e,L)=>L>4?9:3,cd:8,r:[3,30],a:'any',armor:1,dur:2.9,rec:.4,trn:[d.trn],hit:d.hit,trk:d.trk.concat([[2.9,'cRec','io']]),ev:d.ev,tk:d.tk,end(c){c.S.ghost=0}}})()),
  // Feather Volley: five in a fan (Phase II: two fans)
  volley:WK232_M({wt:(e,L)=>L>6?9:3,cd:6.5,r:[4,30],a:'f',dur:2.2,lock:.95,trn:[[0,.95,4]],ph1only:1,
    trk:[[.75,'vArch','io'],[1.0,'vArch','l',.012],[1.12,'vSnap','s'],[1.6,'vSnap','l'],[2.2,'cRec','io']],
    hit:[-.5,-.25,0,.25,.5].map(ay=>({t:1.14,s:{k:'l',w:1.1,l:14,b:0},f:1.0,ay,nohit:1,w:.8,fx:(c,an)=>ml232Quill(c,an,.85)})),
    ev:[[.4,c=>svSnd('whoosh',.6,1.2)],[1.12,c=>svSnd('whoosh',1,1.5)]],rec:.35}),
  // Thunderclap: a blast round her, then three aimed bolts
  thunder:WK232_M({wt:(e,L)=>L<5.5?9:3,cd:9,r:[0,30],a:'any',armor:1,dur:3.6,trn:[[0,.5,2]],
    trk:[[.7,'open','io'],[1.3,'scr','o'],[1.75,'scr','l',.024],[1.88,'buff','s'],[2.9,'open','io'],[3.6,'cRec','io']],
    hit:[{t:1.88,s:{k:'c',r:3.8},dm:1.2,w:1.2,kb:4,fx:c=>{svShock(c.m.position,ML232.col,5,.4);burst(gY(c.m.position,1.5),ML232.bolt,60,6,3,.6);shake(.4);ml232Bolt(c.m.position.clone(),true)}}]
      .concat([2.3,2.7,3.1].map((t,i)=>({t,s:{k:'c',r:2.0},o:c=>{const p=wk232Aim(c,.4+i*.12);return {x:p.x,z:p.z,a:0}},w:.65,dm:1.0,wc:0x7ad8ff,on:ml232Shock,fx:(c,an)=>ml232Bolt(new THREE.Vector3(an.x,0,an.z))}))),
    ev:[[.5,c=>{svSnd('charge',.7,1.2);c.S.chgT=1.2}],[1.3,c=>svSnd('shriek',1,1)],[1.88,c=>{c.S.chgT=0}]],rec:.45}),
  // ---------------- Phase II ----------------
  awaken:WK232_M({dur:3.8,inv:[0,3.8],armor:1,trn:[[0,3.5,1.2]],trk:[[.6,'crouch','io'],[1.2,'crouch','l',.025],[1.6,'scr','o'],[3.2,'scr','l',.03],[3.8,'cRec','io']],
    hit:[{t:1.62,s:{k:'c',r:7},dm:.55,kb:6,w:1.2,fx:c=>{svShock(c.m.position,ML232.col,11,.85);burst(gY(c.m.position,2),ML232.bolt,100,7,4,.9);for(let k=0;k<5;k++){const a=k/5*6.283;ml232Bolt(c.at(Math.cos(a)*5,Math.sin(a)*5))}}}],
    ev:[[.05,c=>{try{zt116Show(ZT116.Z[3],'Maelis · Phase II','Eye of the Storm','The cloud breaks: rain, a dragging wind, bolts that walk the ground','Mind the copper rods','z3')}catch(_){}svSnd('hiss',.8,1.2);c.S.chgT=1.2}],
      [1.6,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.chgT=0;try{flash('rgba(160,220,255,.32)')}catch(_){}svSnd('shriek',1.3,.8);svSnd('roar',.7,1.2);shake(.55);try{ml232Storm(c.D,1)}catch(err){console.error('ml storm',err)}}]]}),
  skyfall2:WK232_M((()=>{const A=[ml232Stoop(.1),ml232Stoop(2.45,{dm:1.5})];return {wt:9,cd:10,ph:2,r:[0,30],a:'any',armor:1,dur:5.3,rec:.5,trn:A.map(d=>d.trn),hit:[].concat(...A.map(d=>d.hit)),trk:[].concat(...A.map(d=>d.trk)).concat([[5.3,'cRec','io']]),
    ev:[].concat(...A.map(d=>d.ev)),tk(c,dt){A.forEach(d=>d.tk(c,dt))},end(c){c.S.ghost=0}}})()),
  // Galeblades: three walls of wind, each fired through where you stand
  gale:WK232_M({wt:8,cd:9,ph:2,r:[3,30],a:'any',armor:1,dur:3.7,trn:[[0,.75,5],[1.2,1.45,7],[2.0,2.25,7]],
    trk:[[.55,'bfUp','io'],[.8,'bfUp','l',.014],[.94,'buff','s'],[1.2,'bfUp','io'],[1.5,'bfUp','l',.014],[1.64,'buff','s'],[2.0,'bfUp','io'],[2.3,'bfUp','l',.014],[2.44,'buff','s'],[3.0,'buff','l'],[3.7,'cRec','io']],
    hit:[.96,1.66,2.46].map(t=>({t,s:{k:'l',w:3.0,l:24,b:0},f:1.0,nohit:1,w:.52,fx:(c,an)=>ml232Gale(c,an,1.05)})),
    ev:[[.3,c=>svSnd('whoosh',.6,.9)],[.94,c=>shake(.15)],[1.64,c=>shake(.15)],[2.44,c=>shake(.15)]],rec:.4}),
  volley2:WK232_M({wt:(e,L)=>L>5?10:4,cd:7,ph:2,r:[3.5,30],a:'f',dur:2.6,lock:.95,trn:[[0,.95,4],[1.35,1.45,3]],
    trk:[[.75,'vArch','io'],[1.0,'vArch','l',.012],[1.12,'vSnap','s'],[1.3,'vArch','io'],[1.5,'vSnap','s'],[1.95,'vSnap','l'],[2.6,'cRec','io']],
    hit:[-.5,-.25,0,.25,.5].map(ay=>({t:1.14,s:{k:'l',w:1.1,l:14,b:0},f:1.0,ay,nohit:1,w:.8,fx:(c,an)=>ml232Quill(c,an,.8,19)}))
      .concat([-.62,-.37,-.12,.12,.37,.62].map(ay=>({t:1.52,s:{k:'l',w:1.1,l:14,b:0},f:1.0,ay,nohit:1,w:.4,fx:(c,an)=>ml232Quill(c,an,.8,19)}))),
    ev:[[.4,c=>svSnd('whoosh',.7,1.2)],[1.12,c=>svSnd('whoosh',1,1.5)],[1.5,c=>svSnd('whoosh',1,1.65)]],rec:.4}),
  // Static Charge: she climbs out of reach; ground three charges on three rods (4032)
  static:WK232_M({wt:(e)=>e.sv.sigN?10:30,cd:26,ph:2,r:[0,40],a:'any',armor:1,dur:18.4,inv:[0,18.4],trn:[[0,18.4,2.5]],
    trk:[[.4,'crouch','io'],[.8,'flyUp','o'],[1.2,'flyDn','io']].concat(...Array.from({length:19},(_,i)=>[[1.6+i*.8,'flyUp','io'],[2.0+i*.8,'flyDn','io']])).concat([[17.4,'stoop','i'],[17.75,'land','s'],[18.4,'cRec','io']]),
    ev:[[.3,c=>{svSnd('shriek',1,1);c.S.chgT=1;c.e.sv.sigN=(c.e.sv.sigN||0)+1;c.M.an.from=c.m.position.clone()}],[.8,c=>{c.S.ghost=1;svSnd('whoosh',1.2,.7);try{ml232StaticStart(c.D,c.e)}catch(err){console.error('ml static',err)}}],
      [17.2,c=>{c.S.chgT=0;try{ml232StaticEnd(c.D,c.e,false)}catch(err){console.error('ml static end',err)}}],[17.75,c=>{c.S.ghost=0;svShock(c.m.position,ML232.col,4,.4);shake(.3);svSnd('heavy',1,.9)}]],
    tk(c,dt){const m=c.m,A=c.D.A;if(c.t>.8&&c.t<17.2){m.position.x+=(A.cx-m.position.x)*Math.min(1,dt*1.5);m.position.z+=(A.cz-m.position.z)*Math.min(1,dt*1.5);try{ml232StaticTick(c.D,c.e,dt,c.t)}catch(err){if(!WK232.err++)console.error('ml static tick',err)}}},
    end(c,silent){c.S.ghost=0;c.S.chgT=0;try{ml232StaticEnd(c.D,c.e,true)}catch(_){}},rec:.5}),
  // struck out of the sky: a long stagger
  broken:WK232_M({dur:5.0,trk:[[.25,'stoop','i'],[.55,'stag','s'],[4.4,'stag','l',.03],[5.0,'cRec','io']],
    go(c){c.S.stg=5.0;c.S.ghost=0;svSnd('stag',1.2,.9);svSnd('crack',1.2,1.4);popT(c.m.position,'STRUCK FROM THE SKY','#cfeeff',true);ml232Bolt(c.m.position.clone(),true)},
    ev:[[.55,c=>{svShock(c.m.position,0xcfeeff,6,.5);burst(gY(c.m.position,.5),0xc8b89a,60,5,3,.8);shake(.5);svSnd('heavy',1.3,.7)}]],
    tk(c,dt){c.S.stg=Math.max(0,5.0-c.t);if(Math.random()<dt*8){const p=svWP(c.e,'head',0,.2,0);burst(p,0xcfeeff,1,.5,.6,.5)}},end(c){c.S.stg=0}})};
