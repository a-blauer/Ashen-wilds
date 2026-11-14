// ================= v232 Seraphel — the moves (Sovereign move format; the kit 4010 points the engine at her court) =================
// Theme: daylight as judgement: a blade of light, rays, falling stars, the sun itself; and its opposite, shadow, as the only mercy.
// Debuff: Judged (marked by the light: you take more damage for a while).
// Pattern:
//  close, front ── Blade of Dawn: a level cut (an arc), the return cut (an arc), then the sword raised in both hands and brought
//                  down a line; the line she cut stays burning and bursts a moment later (don't stand on it).
//  mid / far    ── Lance of Light: the sword drawn back to the hip and thrust: a narrow ray the length of the court, fast.
//  behind/side  ── Wing Flare: six wings folded round her, then thrown open: a ring (stand close in, or far out).
//  any          ── Falling Stars: the scales lifted; four stars fall, one ahead of you and three round you, then four more.
//  far, front   ── Radiant Orbs: five slow globes of light in a fan; weave between them.
//  close, any   ── Sunburst: wings wrapped, a breath, then light in all directions: a blast round her, eight rays, eight more in
//                  the gaps.
//  Phase II (55%) "High Noon": the sundial wakes. A ray like a clock hand sweeps round the court from the middle (cross it on a
//                  dodge or keep ahead of it), and the sun climbs, so every shadow is shorter. She rests less and gains Dawn
//                  Dash (three cuts through you from three sides), Starfall Cross (rays in a + and then a × through where you
//                  stand) and a double fan of orbs.
//  Signature ──── Verdict (Phase II): she rises above the court and lifts her sword to the sun. In a few breaths the whole court
//                  is filled with light: everything not in shadow is judged. Four obelisks stand in the court and each throws a
//                  shadow away from the sun — and the sun is moving, so the shadows swing as she counts. Be in a shadow when the
//                  light comes: the obelisk's crystal turns the Verdict back on her (a long stagger, and she is wounded). An
//                  obelisk can do this twice, then it breaks. Fail and you take the Verdict, are Judged, and she heals.
// Weakness: posture (the yellow bar); every break staggers her (+35% damage). Big moves have armour.
const SR232_DEB=['Judged','☀',{pdP:-.2,mdP:-.2},'Marked by the light: −20% defences'];
function sr232Mats(){const X=WK232.X;return X.sr||(X.sr={light:new THREE.MeshBasicMaterial({color:0xfff2c8}),ray:new THREE.MeshStandardMaterial({color:0xfff6d8,emissive:0xffe9a0,emissiveIntensity:1.2,roughness:.3,flatShading:true})})}
function sr232Judge(ms){dqDebuff(SR232_DEB[0],SR232_DEB[1],SR232_DEB[2],ms||4000,SR232_DEB[3])}
// a ray along a line for an instant (the hit is the move's): a bright bar on the floor and a wall of light over it
function sr232Ray(an,len,w,life){const g=new THREE.Group(),a=an.a,y=GH(an.x,an.z);g.position.set(an.x,y,an.z);g.rotation.y=a;
  const fl=new THREE.Mesh(svG('sr_rf',()=>{const q=new THREE.PlaneGeometry(1,1);q.rotateX(-Math.PI/2);q.translate(0,0,.5);return q}),new THREE.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  fl.scale.set(w,1,len);fl.position.y=.14;const wl=new THREE.Mesh(svG('sr_rw',()=>{const q=new THREE.PlaneGeometry(1,1);q.rotateY(Math.PI/2);q.translate(0,.5,.5);return q}),new THREE.MeshBasicMaterial({color:0xffe9a0,map:SPR,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  wl.scale.set(1,3.2,len);[fl,wl].forEach(m=>{m.userData.lpsSkip=1;m.renderOrder=22;g.add(m)});scene.add(g);let t=0;const T=life||.35;
  for(let k=0;k<len;k+=1.4)burst(new THREE.Vector3(an.x+Math.sin(a)*k,y+.5,an.z+Math.cos(a)*k),0xfff2c8,2,1,1.6,.4);
  kqFx({tick(dt){t+=dt||0;const k=t/T;fl.material.opacity=.9*(1-k);wl.material.opacity=.5*(1-k);fl.scale.x=w*(1+k*.4);return k<1},end(){scene.remove(g);fl.material.dispose();wl.material.dispose()}})}
// a star falling onto a spot (the hit is the move's)
function sr232Star(p,big){const s=big?1.4:1;try{sk146Column(p,0xffe9a0,0xffffff,.9*s,7,.5)}catch(_){}burst(gY(p,.4),0xfff2c8,big?40:24,3.5,3,.6);svShock(p,SR232.col,2.6*s,.3);svDecal(p,0x6a5a2a,1.6*s,3,.4);try{sk146Crack(p,0xffe9a0,2.2*s,1.6)}catch(_){}svSnd('bell',.5,1.6+Math.random()*.4);svSnd('heavy',.6,1.3)}
function sr232Orb(c,an,dm,spd){wk232Bolt(c,an,dm,{col:0xffe9a0,spd:spd||8.5,L:17,w:1.5,y:1.2,gl:2.2,trail:false,mesh:()=>{const g=new THREE.Group(),m=new THREE.Mesh(svG('sr_orb',()=>new THREE.IcosahedronGeometry(.42,1)),sr232Mats().light);g.add(m);return g},on:()=>sr232Judge(3000)})}
const SR232_TR=(t0,t1)=>[t0,t1,'blade',[0,.3,0],[0,2.7,0],0xfff2c8,.22];
var SR232M={
  intro:WK232_M({dur:3.6,inv:[0,3.6],armor:1,trn:[[0,3.6,1.5]],trk:[[.8,'wrap','io'],[1.5,'wrap','l',.012],[1.8,'flare','o'],[3.0,'flare','l',.015],[3.6,'cRec','io']],
    ev:[[.5,c=>{svSnd('charge',.6,1.4);c.S.chgT=1}],[1.8,c=>{svSnd('bell',1.2,.8);svSnd('bell',.8,1.2);svSnd('whoosh',1,.8);shake(.3);svShock(c.m.position,SR232.col,9,.8);burst(gY(c.m.position,3),0xfff2c8,80,6,3,1);c.S.chgT=0}]]}),
  // Blade of Dawn
  blade:WK232_M({wt:10,cd:2.6,r:[0,5.6],a:'f',mel:1,dur:3.2,lock:.4,trn:[[0,.42,5],[.84,.96,5],[1.44,1.72,3.6]],
    trk:[[.4,'cUp','io'],[.52,'cUp','l',.01],[.64,'cCut','s'],[.86,'cCut','l'],[1.0,'cCut','io'],[1.12,'cUp','s'],[1.4,'oUp','io'],[1.74,'oUp','l',.014],[1.88,'oCut','s'],[2.6,'oCut','l'],[3.2,'cRec','io']],
    rm:[[.56,.66,.7,'o'],[1.04,1.14,.6,'o'],[1.78,1.9,1.0,'o']],
    hit:[{t:.63,s:{k:'a',r:4.8,h:1.15},f:.3,dm:.9},{t:1.11,s:{k:'a',r:4.8,h:1.15},f:.3,dm:.9},
      {t:1.88,s:{k:'l',w:2.0,l:9,b:0},f:.3,dm:1.35,w:.44,fx:(c,an)=>{sr232Ray(an,9,1.4,.3);shake(.25);svSnd('heavy',1,1.3);svSnd('bell',.6,1.4);c.M.an.cut=an}},
      {t:2.7,s:{k:'l',w:2.6,l:9,b:0},o:c=>c.M.an.cut||{x:c.m.position.x,z:c.m.position.z,a:c.m.rotation.y},dm:1.2,w:.78,wc:0xffe9a0,on:()=>sr232Judge(4000),fx:(c,an)=>{sr232Ray(an,9,2.6,.45);for(let k=1;k<9;k+=2)sr232Star(new THREE.Vector3(an.x+Math.sin(an.a)*k,0,an.z+Math.cos(an.a)*k));shake(.3)}}],
    tr:[SR232_TR(.55,.72),SR232_TR(1.02,1.2),SR232_TR(1.78,1.94)],
    ev:[[.56,c=>svSnd('swing',.85,1.5)],[1.04,c=>svSnd('swing',.85,1.6)],[1.44,c=>svSnd('charge',.4,1.8)],[1.78,c=>svSnd('whoosh',.95,1.3)]],nx:[['lance',.25,10],['flare',.3,6]],rec:.3}),
  // Lance of Light
  lance:WK232_M({wt:(e,L)=>L>4?9:4,cd:5.5,r:[3,30],a:'f',armor:1,dur:2.2,lock:.9,trn:[[0,.9,5]],
    trk:[[.7,'thUp','io'],[1.0,'thUp','l',.014],[1.1,'thrust','s'],[1.6,'thrust','l'],[2.2,'cRec','io']],rm:[[1.04,1.14,1.2,'o']],
    hit:[{t:1.12,s:{k:'l',w:1.7,l:24,b:0},f:.6,dm:1.35,w:.78,kb:2,fx:(c,an)=>{sr232Ray(an,24,1.3,.4);shake(.25);svSnd('whoosh',1.2,1.5);svSnd('bell',.7,1.8)}}],
    tr:[SR232_TR(1.02,1.2)],ev:[[.5,c=>{svSnd('charge',.6,1.6);svCharge(c.e,'blade',SR232.col,1,.5,0,2.6,0)}]],rec:.35}),
  // Wing Flare (from behind or the side)
  flare:WK232_M({wt:(e,L,side)=>side==='b'?14:side==='s'?6:0,cd:5,r:[0,5.8],a:'sb',dur:2.0,lock:.5,trn:[[0,.4,2]],
    trk:[[.55,'wrap','io'],[.86,'wrap','l',.014],[1.0,'flare','s'],[1.4,'flare','l'],[2.0,'cRec','io']],
    hit:[{t:1.0,s:{k:'r',r0:1.2,r:5.8},dm:1.1,kb:4,w:.8,fx:c=>{svShock(c.m.position,SR232.col,6,.4);burst(gY(c.m.position,1.5),0xfff2c8,50,6,1,.5);svSnd('whoosh',1.1,1);svSnd('bell',.6,1.2)}}],
    ev:[[.4,c=>svSnd('charge',.4,1.5)]],rec:.35}),
  // Falling Stars: one ahead of you and three round you, twice
  stars:WK232_M({wt:8,cd:7,r:[2,30],a:'any',armor:1,dur:3.3,lock:.6,trn:[[0,.6,3]],
    trk:[[.6,'weigh','io'],[2.5,'weigh','l',.008],[3.3,'cRec','io']],
    hit:[0,1].flatMap(w=>[0,1,2,3].map(k=>({t:1.5+w*.8+k*.07,s:{k:'c',r:1.8},o:c=>{if(k==0){const p=wk232Aim(c,.5+w*.1);return {x:p.x,z:p.z,a:0}}const a=(k/3+w*.17+c.rnd()*.1)*6.283,q=wk232Clamp(c.D,new THREE.Vector3(pl.position.x+Math.sin(a)*3.1,0,pl.position.z+Math.cos(a)*3.1),.5);return {x:q.x,z:q.z,a:0}},
      w:.75,dm:1.0,wc:0xffe9a0,fx:(c,an)=>sr232Star(new THREE.Vector3(an.x,0,an.z))}))),
    ev:[[.4,c=>{svSnd('bell',.7,1.5);c.S.chgT=.6}],[2.5,c=>{c.S.chgT=0}]],rec:.4}),
  // Radiant Orbs: five slow globes (Phase II: two fans)
  orbs:WK232_M({wt:(e,L)=>L>6?9:3,cd:7,r:[4,30],a:'f',dur:2.3,lock:.95,trn:[[0,.95,4]],ph1only:1,
    trk:[[.75,'gather','io'],[1.0,'gather','l',.012],[1.14,'cast','s'],[1.7,'cast','l'],[2.3,'cRec','io']],
    hit:[-.56,-.28,0,.28,.56].map(ay=>({t:1.16,s:{k:'l',w:1.5,l:9,b:0},f:1.0,ay,nohit:1,w:.8,fx:(c,an)=>sr232Orb(c,an,.95)})),
    ev:[[.4,c=>svSnd('charge',.5,1.7)],[1.14,c=>svSnd('whoosh',.9,1.4)]],rec:.35}),
  // Sunburst
  burst:WK232_M({wt:(e,L)=>L<5.5?9:2,cd:9,r:[0,6.5],a:'any',armor:1,dur:3.3,trn:[[0,.5,2]],
    trk:[[.7,'wrap','io'],[1.78,'wrap','l',.02],[1.9,'flare','s'],[2.7,'flare','l'],[3.3,'cRec','io']],
    hit:[{t:1.9,s:{k:'c',r:3.4},dm:1.3,w:1.3,kb:3,fx:c=>{svShock(c.m.position,SR232.col,4.5,.35);burst(gY(c.m.position,1.5),0xfff2c8,70,6,3,.7);shake(.35);svSnd('bell',1.1,.9);svSnd('heavy',.9,1.2)}}]
      .concat([0,1,2,3,4,5,6,7].map(k=>({t:2.14,s:{k:'l',w:1.5,l:12,b:-1.4},f:0,ay:k*Math.PI/4,w:.75,dm:1.0,wc:0xffe9a0,fx:(c,an)=>sr232Ray({x:an.x+Math.sin(an.a)*1.4,z:an.z+Math.cos(an.a)*1.4,a:an.a},10.6,1.1,.3)})))
      .concat([0,1,2,3,4,5,6,7].map(k=>({t:2.58,s:{k:'l',w:1.5,l:12,b:-1.4},f:0,ay:k*Math.PI/4+Math.PI/8,w:.6,dm:1.0,wc:0xffe9a0,fx:(c,an)=>sr232Ray({x:an.x+Math.sin(an.a)*1.4,z:an.z+Math.cos(an.a)*1.4,a:an.a},10.6,1.1,.3)}))),
    ev:[[.5,c=>{svSnd('charge',.7,1.2);c.S.chgT=1.4}],[1.9,c=>{c.S.chgT=0}],[2.14,c=>svSnd('bell',.7,1.5)],[2.58,c=>svSnd('bell',.7,1.7)]],rec:.45}),
  // ---------------- Phase II ----------------
  awaken:WK232_M({dur:3.9,inv:[0,3.9],armor:1,trn:[[0,3.5,1.2]],trk:[[.7,'wrap','io'],[1.3,'wrap','l',.02],[1.6,'judge','o'],[3.2,'judge','l',.012],[3.9,'cRec','io']],
    hit:[{t:1.62,s:{k:'c',r:7},dm:.55,kb:6,w:1.2,fx:c=>{svShock(c.m.position,SR232.col,11,.85);burst(gY(c.m.position,3),0xfff2c8,120,7,4,1)}}],
    ev:[[.05,c=>{try{zt116Show(ZT116.Z[5],'Seraphel · Phase II','High Noon','The sundial wakes: a ray sweeps the court and the shadows shrink','Shadow is the only mercy','z5')}catch(_){}svSnd('charge',.9,1.2);c.S.chgT=1.2}],
      [1.6,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.chgT=0;try{flash('rgba(255,240,190,.4)')}catch(_){}svSnd('bell',1.3,.7);svSnd('bell',1,1);shake(.5);try{sr232Noon(c.D,1)}catch(err){console.error('sr noon',err)}}]]}),
  // Dawn Dash: three cuts through you from three sides
  dash:WK232_M((()=>{const TB=[.2,1.5,2.8];return {wt:9,cd:9,ph:2,r:[0,30],a:'any',armor:1,dur:4.7,rec:.5,trn:TB.map(tb=>[tb,tb+.5,9]),
    rm:TB.map(tb=>[tb+.82,tb+1.0,'tgt','o',-4.2,14]),
    hit:TB.map((tb,i)=>({t:tb+.98,s:{k:'l',w:2.4,l:14,b:0},f:0,dm:1.15+i*.1,w:.48,fx:(c,an)=>{sr232Ray(an,14,1.6,.3);svSnd('whoosh',1.2,1.4+i*.1);shake(.2)}})),
    trk:[].concat(...TB.map(tb=>[[tb+.4,'dLow','io'],[tb+.8,'dLow','l',.012],[tb+.9,'dCut','s'],[tb+1.2,'dCut','l']])).concat([[4.7,'cRec','io']]),
    ev:TB.map(tb=>[tb+.02,c=>{svSnd('charge',.4,2);/* she steps out of the light to a new side of you */const a=Math.random()*6.283,q=wk232Clamp(c.D,new THREE.Vector3(pl.position.x+Math.sin(a)*6.5,0,pl.position.z+Math.cos(a)*6.5),1.8);
      if(tb>.3){burst(gY(c.m.position,2),0xfff2c8,40,4,2,.5);c.m.position.x=q.x;c.m.position.z=q.z;c.m.rotation.y=svYawTo(c.m,pl.position);burst(gY(c.m.position,2),0xfff2c8,40,4,2,.5);svShock(c.m.position,SR232.col,3,.3)}}]),
    tr:TB.map(tb=>SR232_TR(tb+.8,tb+1.05))}})()),
  // Starfall Cross: rays in a + through where you stand, then a ×
  cross:WK232_M({wt:8,cd:9,ph:2,r:[0,30],a:'any',armor:1,dur:3.6,trn:[[0,.6,3]],
    trk:[[.6,'weigh','io'],[1.0,'judge','io'],[2.7,'smite','s'],[3.0,'smite','l'],[3.6,'cRec','io']],
    hit:[0,1].flatMap(w=>[0,1].map(k=>({t:1.7+w*.75,s:{k:'l',w:2.3,l:26,b:0},o:c=>{if(!c.M.an.cp)c.M.an.cp=wk232HeroIn(c.D,pl.position.clone());const P=c.M.an.cp,a=k*Math.PI/2+w*Math.PI/4;return {x:P.x-Math.sin(a)*13,z:P.z-Math.cos(a)*13,a}},
      w:w?.6:.85,dm:1.15,wc:0xffe9a0,on:()=>sr232Judge(4000),fx:(c,an)=>{sr232Ray(an,26,2.0,.4);if(k==0){svSnd('bell',.9,1.2+w*.3);shake(.3)}}}))),
    ev:[[.4,c=>{svSnd('charge',.7,1.5);c.S.chgT=1}],[2.5,c=>{c.S.chgT=0}]],rec:.45}),
  orbs2:WK232_M({wt:(e,L)=>L>5?10:4,cd:8,ph:2,r:[3.5,30],a:'f',dur:2.9,lock:.95,trn:[[0,.95,4],[1.4,1.55,3]],
    trk:[[.75,'gather','io'],[1.0,'gather','l',.012],[1.14,'cast','s'],[1.4,'gather','io'],[1.66,'cast','s'],[2.2,'cast','l'],[2.9,'cRec','io']],
    hit:[-.56,-.28,0,.28,.56].map(ay=>({t:1.16,s:{k:'l',w:1.5,l:9,b:0},f:1.0,ay,nohit:1,w:.8,fx:(c,an)=>sr232Orb(c,an,.9,9)}))
      .concat([-.7,-.42,-.14,.14,.42,.7].map(ay=>({t:1.68,s:{k:'l',w:1.5,l:9,b:0},f:1.0,ay,nohit:1,w:.45,fx:(c,an)=>sr232Orb(c,an,.9,11)}))),
    ev:[[.4,c=>svSnd('charge',.5,1.7)],[1.14,c=>svSnd('whoosh',.9,1.4)],[1.66,c=>svSnd('whoosh',.9,1.6)]],rec:.4}),
  // Verdict: she rises; be in an obelisk's shadow when the light comes (4052)
  verdict:WK232_M({wt:(e)=>e.sv.sigN?10:30,cd:26,ph:2,r:[0,40],a:'any',armor:1,dur:9.6,inv:[0,7.0],trn:[[0,9.6,2]],
    trk:[[.6,'weigh','io'],[1.2,'judge','o'],[6.4,'judge','l',.014],[6.6,'smite','s'],[8.4,'smite','l'],[9.0,'cRec','io'],[9.6,'cRec','l']],
    ev:[[.1,c=>{svSnd('bell',1.2,.6);c.S.chgT=1.6;c.S.ghost=1;c.e.sv.sigN=(c.e.sv.sigN||0)+1;try{sr232VerdictStart(c.D,c.e)}catch(err){console.error('sr verdict',err)}}],[2.0,c=>svSnd('bell',.9,.8)],[3.4,c=>svSnd('bell',.9,1)],[4.8,c=>svSnd('bell',.9,1.25)],[5.8,c=>svSnd('charge',1,1.6)],
      [9.0,c=>{c.S.ghost=0}]],
    hit:[{t:6.6,s:{k:'c',r:99},nohit:1,w:0,show:false,fx:c=>{c.S.chgT=0;try{sr232Verdict(c.D,c.e)}catch(err){console.error('sr verdict hit',err)}}}],
    tk(c,dt){const m=c.m,A=c.D.A;if(c.t>.6&&c.t<6.6){m.position.x+=(A.cx-m.position.x)*Math.min(1,dt*1.6);m.position.z+=(A.cz-m.position.z)*Math.min(1,dt*1.6)}},
    end(c,silent){c.S.ghost=0;c.S.chgT=0;try{sr232VerdictEnd(c.D)}catch(_){}},rec:.5}),
  // the Verdict turned back on her: a long stagger
  broken:WK232_M({dur:5.0,trk:[[.4,'stag','i'],[4.4,'stag','l',.02],[5.0,'cRec','io']],
    go(c){c.S.stg=5.0;c.S.ghost=0;svSnd('stag',1.2,1);svSnd('bell',1,.5);popT(c.m.position,'JUDGED BY HER OWN LIGHT','#fff2c8',true);burst(gY(c.m.position,3),0xfff2c8,80,5,3,.9);svShock(c.m.position,0xfff2c8,6,.5)},
    tk(c,dt){c.S.stg=Math.max(0,5.0-c.t);if(Math.random()<dt*8){const p=svWP(c.e,'head',0,.2,0);burst(p,0xffe08a,1,.5,.6,.5)}},end(c){c.S.stg=0}})};
