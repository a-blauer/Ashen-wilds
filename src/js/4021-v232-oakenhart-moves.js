// ================= v232 Oakenhart — the moves (Sovereign move format, v110 engine; the kit 4010 points the engine at his grove) =================
// Theme: the old wood in autumn: antlers, hooves, roots and thorns, falling leaves, amber sap. Debuff: Snared (roots: slower).
// Pattern (learnable; cooldowns, no repeats, combo strings):
//  close, front ── Antler Sweep: the head swung low to one side and across (an arc), back again (an arc), then he draws back and
//                  gores down a line (late: it punishes an early dodge).
//  mid, front   ── Trampling Charge: he paws the ground twice, head down, then gallops through you; torn earth and roots (Snared)
//                  are left along his path.
//  behind       ── Hind Kick: he looks back over his shoulder, bunches up and lashes out with both hind hooves: a cone behind him,
//                  a long knock-back. (Only when you stand behind him.)
//  any          ── Rootburst: he rears and slams his forehooves down; three knots of root burst out under you, each aimed ahead of
//                  you, each leaving a bramble patch.
//  far, front   ── Thorn Lances: the head thrown back, antlers bristling, then snapped forward: five thorns in a fan. Stand in a gap.
//  close, any   ── Earthshaker: he rears, trembling, and comes down: a close blast, then two rings of force roll out across the grove
//                  one after the other (dodge through each).
//  Phase II (55%) "The Wild Hunt": a bellow, the leaves turn to a storm and a wall of briars grows in round the edge of the grove
//                  (4022; it tears at you). He rests less and gains Stampede (three charges, one after another), Briar Ring (a ring of
//                  rootbursts closing on you) and a double Thorn Lances.
//  Signature ──── Rampage (Phase II): his eyes blaze white and he charges four times, harder each time, shrugging off most damage.
//                  Four runestones stand in the grove. Put one between you and him (or just behind you) and his antlers lodge in
//                  it: the stone shatters and he hangs there, helpless, for a long time. Four stones, four chances: a stone is gone
//                  once used. If no charge finds a stone he bellows in triumph, heals, and the briars grow further in.
// Weakness: posture (the yellow bar); every break staggers him (+35% damage). Big moves have armour.
const OK232_DEB=['Snared','🌿',{mspd:-.3},'Roots drag at your feet: −30% move speed'];
function ok232Mats(){const X=WK232.X;return X.ok||(X.ok={root:new THREE.MeshStandardMaterial({color:0x3a2a1a,roughness:.9,flatShading:true}),thorn:new THREE.MeshStandardMaterial({color:0x1c140e,roughness:.7,flatShading:true}),
  sap:new THREE.MeshStandardMaterial({color:0x5a2c06,emissive:0xd87a12,emissiveIntensity:.9,roughness:.4,flatShading:true})})}
function ok232Leaves(p,n,sp,up){for(let k=0;k<4;k++)burst(p,OK232.leaf[k],Math.ceil((n||20)/4),sp||2.5,up==null?2:up,1.1)}
function ok232Patch(e,p,r,ms){wk232Pool(e,p,r,0x8a5a2a,ms||4000,.12,OK232_DEB)}
// a knot of roots bursting out of the ground (the hit is the move's), a bramble patch left behind
function ok232Burst(e,p,big){const M=ok232Mats(),s=big?1.3:1;wk232Erupt(e,p,{col:0xc8741a,s,mat:M.root,decal:0x2a1c0e,snd:'crack',h:3.2,op:.5});
  for(let k=0;k<4;k++){const a=k*1.57+Math.random(),r=.4+Math.random()*.5;svSpike(new THREE.Vector3(p.x+Math.cos(a)*r,0,p.z+Math.sin(a)*r),M.thorn,(1.3+Math.random()*.6)*s,.12*s,1.4,.9)}
  ok232Leaves(gY(p,.6),12,2,3);ok232Patch(e,p,1.3*s,3800)}
function ok232Thorn(c,an,dm,spd){wk232Bolt(c,an,dm,{col:0xffc86a,spd:spd||16,w:1.0,mesh:()=>{const g=new THREE.Group(),m=new THREE.Mesh(svG('ok_th',()=>{const q=new THREE.ConeGeometry(.1,1.5,5);q.rotateX(Math.PI/2);return q}),ok232Mats().thorn);g.add(m);return g},
  on:()=>dqDebuff(OK232_DEB[0],OK232_DEB[1],OK232_DEB[2],2500,OK232_DEB[3])})}
const OK232_TR=(t0,t1,j)=>[t0,t1,j,[.3,.6,0],[1.0,2.1,.1],0xffd27a,.2];
// one charge of a string: [turn window, root motion, hit] starting at tb (aim .55 s, hold, dash .3 s)
function ok232Dash(tb,o){o=o||{};return {trn:[tb,tb+.55,o.turn||7],rm:[tb+.95,tb+1.25,'tgt','o',o.over==null?-2.5:o.over,13],
  hit:{t:tb+1.17,s:{k:'l',w:2.8,l:13,b:0},f:0,dm:o.dm||1.25,w:.62,kb:3,fx:c=>{shake(.2)}},
  trk:[[tb+.3,'paw','io'],[tb+.5,'paw2','io'],[tb+.7,'paw','io'],[tb+.93,'paw2','l',.02],[tb+1.02,'gallop','s'],[tb+1.26,'gallop','l'],[tb+1.6,'skid','o']],
  ev:[[tb+.25,c=>{svSnd('heavy',.5,1.4);burst(gY(c.at(.8),.2),0x3a2a1a,10,1.5,1.2,.5)}],[tb+.65,c=>{svSnd('heavy',.5,1.5);burst(gY(c.at(.8),.2),0x3a2a1a,10,1.5,1.2,.5)}],
    [tb+.95,c=>{svSnd('whoosh',1.1,.8);ok232Leaves(gY(c.m.position,1.5),16,3,1)}],[tb+1.28,c=>{svSnd('heavy',.9,1);burst(gY(c.m.position,.3),0x3a2a1a,24,3,1.5,.6);shake(.2)}]]}}
function ok232Trail(c,t0,t1,k){const M=c.M;if(c.t<t0||c.t>t1)return;const p=c.m.position,key='lp'+k;if(!M.an[key])M.an[key]=p.clone();if(p.distanceTo(M.an[key])>1.7){M.an[key]=p.clone();ok232Patch(c.e,p.clone(),.95,4200)}}
var OK232M={
  intro:WK232_M({dur:3.4,inv:[0,3.4],armor:1,trn:[[0,3.4,1.5]],trk:[[.7,'paw','io'],[1.1,'paw2','io'],[1.5,'rear','o'],[2.0,'rear','l',.02],[2.25,'bell','o'],[3.0,'bell','l',.02],[3.4,'cRec','io']],
    ev:[[.5,c=>svSnd('heavy',.6,1.3)],[1.5,c=>{svSnd('whoosh',.8,.7)}],[2.2,c=>{svSnd('roar',1.1,.6);svSnd('bell',.5,.5);shake(.4);svShock(c.m.position,OK232.col,9,.8);ok232Leaves(gY(c.m.position,3),60,5,2)}]]}),
  // Antler Sweep: across, back, then the gore down a line
  sweep:WK232_M({wt:10,cd:2.6,r:[0,6],a:'f',mel:1,dur:2.75,lock:.4,trn:[[0,.42,5],[.9,1.02,5],[1.5,1.78,3.6]],
    trk:[[.42,'swUp','io'],[.56,'swUp','l',.012],[.7,'swCut','s'],[.92,'swCut','l'],[1.06,'swCut','io'],[1.22,'swUp','s'],[1.46,'swUp','l'],[1.62,'goreUp','io'],[1.84,'goreUp','l',.016],[1.98,'gore','s'],[2.35,'gore','l'],[2.75,'cRec','io']],
    rm:[[.6,.72,.7,'o'],[1.12,1.24,.6,'o'],[1.88,2.0,1.7,'o']],
    hit:[{t:.69,s:{k:'a',r:5.0,h:1.2},f:.4,dm:.9},{t:1.21,s:{k:'a',r:5.0,h:1.2},f:.4,dm:.9},
      {t:1.98,s:{k:'l',w:2.2,l:6.6,b:0},f:.5,dm:1.4,w:.44,kb:3,fx:c=>{const p=c.at(3.4);svShock(p,OK232.col,3,.35);ok232Leaves(gY(p,.5),24,3,2);svDecal(p,0x2a1c0e,2,3,.55);shake(.25);svSnd('heavy',1,1.1)}}],
    tr:[OK232_TR(.58,.78,'antL'),OK232_TR(.58,.78,'antR'),OK232_TR(1.1,1.3,'antL'),OK232_TR(1.1,1.3,'antR'),OK232_TR(1.9,2.06,'antL'),OK232_TR(1.9,2.06,'antR')],
    ev:[[.6,c=>svSnd('swing',.9,.8)],[1.12,c=>svSnd('swing',.9,.9)],[1.6,c=>svSnd('hiss',.4,.6)],[1.9,c=>svSnd('whoosh',1,.8)]],nx:[['charge',.25,11],['kick',.3,6]],rec:.3}),
  // Trampling Charge: paw, paw, gallop through you; roots along the path
  charge:WK232_M(Object.assign({wt:8,cd:6,r:[4,13],a:'f',armor:1,dur:2.1,rec:.35,ph1only:0},(()=>{const d=ok232Dash(.2);return {trn:[d.trn],rm:[d.rm],hit:[d.hit],trk:d.trk.concat([[2.1,'cRec','io']]),ev:d.ev,tk(c){ok232Trail(c,1.15,1.5,0)}}})())),
  // Hind Kick: only when you stand behind him
  kick:WK232_M({wt:(e,L,side)=>side==='b'?16:0,cd:4.5,r:[0,5.6],a:'sb',dur:1.75,trn:[[0,.1,1]],
    trk:[[.45,'kickUp','io'],[.72,'kickUp','l',.016],[.84,'kick','s'],[1.1,'kick','l'],[1.75,'cRec','io']],
    hit:[{t:.84,s:{k:'a',r:5.4,h:1.0},f:-.6,ay:Math.PI,dm:1.2,kb:6,w:.62,fx:c=>{const p=c.at(-2.6);svShock(p,OK232.col,3.5,.35);burst(gY(p,.6),0x3a2a1a,24,4,1.5,.5);svSnd('heavy',1,1.3);svSnd('whoosh',.8,1.1);shake(.25)}}],
    ev:[[.3,c=>svSnd('hiss',.5,.7)]],rec:.35}),
  // Rootburst: three bursts under you, each aimed ahead
  rootburst:WK232_M({wt:8,cd:7,r:[2.5,30],a:'any',armor:1,dur:3.0,lock:.7,trn:[[0,.7,3.5]],
    trk:[[.65,'rear','io'],[1.0,'rear','l',.016],[1.14,'slam','s'],[2.5,'slam','l',.006],[3.0,'cRec','io']],
    hit:[1.55,1.93,2.31].map((t,i)=>({t,s:{k:'c',r:1.9},o:c=>{const p=wk232Aim(c,.45+i*.1);return {x:p.x,z:p.z,a:0}},w:.68,dm:1.0,fx:(c,an)=>ok232Burst(c.e,new THREE.Vector3(an.x,0,an.z))})),
    ev:[[.5,c=>{svSnd('whoosh',.7,.6);c.S.chgT=.8}],[1.14,c=>{c.S.chgT=0;const p=c.at(2.0);svShock(p,OK232.col,4,.4);burst(gY(p,.3),0x3a2a1a,24,2.5,2,.6);shake(.3);svSnd('heavy',1.1,.9)}]],rec:.4}),
  // Thorn Lances: five in a fan (Phase II: two fans)
  lances:WK232_M({wt:(e,L)=>L>6?9:3,cd:6.5,r:[4,30],a:'f',dur:2.2,lock:.95,trn:[[0,.95,4]],ph1only:1,
    trk:[[.75,'toss','io'],[1.0,'toss','l',.012],[1.12,'snap','s'],[1.6,'snap','l'],[2.2,'cRec','io']],
    hit:[-.5,-.25,0,.25,.5].map(ay=>({t:1.14,s:{k:'l',w:1.1,l:14,b:0},f:1.6,ay,nohit:1,w:.8,fx:(c,an)=>ok232Thorn(c,an,.85)})),
    ev:[[.4,c=>{svSnd('crack',.6,.8)}],[1.12,c=>{svSnd('whoosh',1,1.3);ok232Leaves(c.wp('head',0,.8,0),14,3,1)}]],rec:.35}),
  // Earthshaker: a close blast, then two rings rolling out
  quake:WK232_M({wt:(e,L)=>L<5.5?9:2,cd:9,r:[0,7],a:'any',armor:1,dur:3.3,trn:[[0,.5,2]],
    trk:[[.7,'rear','io'],[1.7,'rear','l',.024],[1.84,'slam','s'],[2.7,'slam','l',.006],[3.3,'cRec','io']],
    hit:[{t:1.84,s:{k:'c',r:3.6},f:1.2,dm:1.3,w:1.2,kb:4,fx:c=>{const p=c.at(1.2);svShock(p,OK232.col,4.5,.4);burst(gY(p,.5),0x3a2a1a,50,5,3,.7);svDecal(p,0x2a1c0e,3.6,3,.55);shake(.45);svSnd('heavy',1.3,.8);svSnd('crack',.8,.7);
        try{sk146Crack(p,0xffb43a,4.5,2.2)}catch(_){}try{sk146RingWave(c.e,p.clone(),2.5,13,1.5,1.1,1.0,OK232.col,{})}catch(err){console.error('ok ring',err)}}}],
    ev:[[.5,c=>{svSnd('charge',.7,.6);c.S.chgT=1.2}],[1.84,c=>{c.S.chgT=0}],[2.45,c=>{const p=c.at(1.2);svShock(p,OK232.col,3,.3);svSnd('heavy',.9,1);shake(.25);try{sk146RingWave(c.e,p.clone(),2.5,13,1.25,1.1,1.0,OK232.col,{})}catch(_){}}]],rec:.45}),
  // ---------------- Phase II ----------------
  awaken:WK232_M({dur:3.8,inv:[0,3.8],armor:1,trn:[[0,3.5,1.2]],trk:[[.7,'rear','io'],[1.3,'rear','l',.025],[1.6,'bell','o'],[3.2,'bell','l',.03],[3.8,'cRec','io']],
    hit:[{t:1.62,s:{k:'c',r:7},dm:.55,kb:6,w:1.2,fx:c=>{svShock(c.m.position,OK232.col,11,.85);ok232Leaves(gY(c.m.position,2.5),120,7,3);svDecal(c.m.position,0x2a1c0e,6,5,.55)}}],
    ev:[[.05,c=>{try{zt116Show(ZT116.Z[1],'Oakenhart · Phase II','The Wild Hunt','The leaves rise in a storm and briars close round the grove','Stay off the edge · use the runestones','z1')}catch(_){}svSnd('hiss',.8,.5);c.S.chgT=1.2}],
      [1.6,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.chgT=0;try{flash('rgba(255,170,60,.28)')}catch(_){}svSnd('roar',1.2,.55);svSnd('bell',.7,.45);shake(.55);try{ok232Briars(c.D,1)}catch(err){console.error('ok briars',err)}}]]}),
  // Stampede: three charges, one after another
  stampede:WK232_M((()=>{const A=[.2,1.75,3.3].map((tb,i)=>ok232Dash(tb,{dm:1.15,turn:8}));return {wt:9,cd:9,ph:2,r:[3,30],a:'any',armor:1,dur:5.3,rec:.5,trn:A.map(d=>d.trn),rm:A.map(d=>d.rm),hit:A.map(d=>d.hit),
    trk:[].concat(...A.map(d=>d.trk)).concat([[5.3,'cRec','io']]),ev:[].concat(...A.map(d=>d.ev)),tk(c){[0,1,2].forEach(i=>ok232Trail(c,1.15+i*1.55,1.5+i*1.55,i))}}})()),
  // Briar Ring: six rootbursts in a ring round where you stand, then one in the middle
  briar:WK232_M({wt:8,cd:9,ph:2,r:[0,30],a:'any',armor:1,dur:3.0,lock:.6,trn:[[0,.6,3]],
    trk:[[.6,'rear','io'],[.95,'rear','l',.018],[1.1,'slam','s'],[2.5,'slam','l',.006],[3.0,'cRec','io']],
    hit:[0,1,2,3,4,5].map(k=>({t:1.6,s:{k:'c',r:1.6},o:c=>{if(!c.M.an.er)c.M.an.er=pl.position.clone();const P=c.M.an.er,a=k/6*Math.PI*2,q=wk232Clamp(c.D,new THREE.Vector3(P.x+Math.sin(a)*3.2,0,P.z+Math.cos(a)*3.2),.5);return {x:q.x,z:q.z,a:0}},w:.8,dm:.9,fx:(c,an)=>ok232Burst(c.e,new THREE.Vector3(an.x,0,an.z))}))
      .concat([{t:2.15,s:{k:'c',r:2.3},o:c=>{const P=c.M.an.er||pl.position;return {x:P.x,z:P.z,a:0}},w:.6,dm:1.2,fx:(c,an)=>ok232Burst(c.e,new THREE.Vector3(an.x,0,an.z),true)}]),
    ev:[[.5,c=>{svSnd('whoosh',.8,.6);c.S.chgT=.8}],[1.1,c=>{c.S.chgT=0;const p=c.at(2);svShock(p,OK232.col,4,.4);shake(.3);svSnd('heavy',1.1,.85)}]],rec:.4}),
  lances2:WK232_M({wt:(e,L)=>L>5?10:4,cd:7,ph:2,r:[3.5,30],a:'f',dur:2.6,lock:.95,trn:[[0,.95,4],[1.35,1.45,3]],
    trk:[[.75,'toss','io'],[1.0,'toss','l',.012],[1.12,'snap','s'],[1.3,'toss','io'],[1.5,'snap','s'],[1.95,'snap','l'],[2.6,'cRec','io']],
    hit:[-.5,-.25,0,.25,.5].map(ay=>({t:1.14,s:{k:'l',w:1.1,l:14,b:0},f:1.6,ay,nohit:1,w:.8,fx:(c,an)=>ok232Thorn(c,an,.8,17)}))
      .concat([-.62,-.37,-.12,.12,.37,.62].map(ay=>({t:1.52,s:{k:'l',w:1.1,l:14,b:0},f:1.6,ay,nohit:1,w:.4,fx:(c,an)=>ok232Thorn(c,an,.8,17)}))),
    ev:[[.4,c=>svSnd('crack',.7,.8)],[1.12,c=>svSnd('whoosh',1,1.3)],[1.5,c=>svSnd('whoosh',1,1.45)]],rec:.4}),
  // Rampage: four charges; a runestone in his path ends it (4022)
  rampage:WK232_M((()=>{const TB=[1.5,3.2,4.9,6.6],A=TB.map((tb,i)=>ok232Dash(tb,{dm:1.2+i*.1,turn:9,over:-3.2}));return {wt:(e)=>e.sv.sigN?10:30,cd:24,ph:2,r:[0,40],a:'any',armor:1,dur:10.4,inv:[0,1.2],rec:.5,
    trn:[[0,1.2,3]].concat(A.map(d=>d.trn)),rm:A.map(d=>d.rm),hit:A.map(d=>d.hit),
    trk:[[.5,'rear','io'],[1.0,'bell','o'],[1.4,'bell','l',.03]].concat(...A.map(d=>d.trk)).concat([[8.7,'rear','io'],[9.0,'bell','o'],[9.9,'bell','l',.03],[10.4,'cRec','io']]),
    ev:[[.05,c=>{c.S.dr=.25;c.S.chgT=1;c.S.chgHold=0;c.e.sv.sigN=(c.e.sv.sigN||0)+1;svSnd('roar',1,.7);try{ok232RampStart(c.D,c.e)}catch(err){console.error('ok ramp',err)}}]].concat(...A.map(d=>d.ev))
      .concat([[8.9,c=>{c.S.dr=0;c.S.chgT=0;try{ok232RampFail(c.D,c.e)}catch(err){console.error('ok ramp fail',err)}}]]),
    tk(c,dt){TB.forEach((tb,i)=>{ok232Trail(c,tb+.95,tb+1.3,i);if(c.t>tb+.93&&c.t<tb+1.34)try{ok232RampHit(c.D,c.e)}catch(err){console.error('ok ramp hit',err)}})},
    end(c,silent){c.S.dr=0;c.S.chgT=0;try{ok232RampEnd(c.D)}catch(_){}}}})()),
  // antlers lodged in a runestone: a long, helpless stagger
  broken:WK232_M({dur:5.0,trk:[[.2,'stuck','o'],[1.5,'stuck','l',.04],[1.9,'stag','o'],[4.4,'stag','l',.03],[5.0,'cRec','io']],
    go(c){c.S.stg=5.0;svSnd('stag',1.2,.8);svSnd('crack',1,.6);popT(c.m.position,'ANTLERS LODGED','#ffe08a',true);burst(gY(c.m.position,2.4),0xffe08a,60,4,3,.8);svShock(c.m.position,0xffe08a,5,.5)},
    tk(c,dt){c.S.stg=Math.max(0,5.0-c.t);if(Math.random()<dt*8){const p=svWP(c.e,'head',0,.4,0);burst(p,0xffe08a,1,.5,.6,.5)}},end(c){c.S.stg=0}})};
OK232M.sweep.ph1only=0;
