// ================= v232 Brassmaw — the moves (Sovereign move format; the kit 4010 points the engine at his foundry) =================
// Theme: the forge: hammer blows, slag, furnace fire, steam. Debuff: Seared (burning: damage over time, weaker defence).
// Pattern:
//  close, front ── Hammer Fall: a right hook (an arc), a left hook (an arc), then both fists over his head and down on one spot
//                  (late, heavy; a pool of slag stays).
//  mid, front   ── Shoulder Charge: he drops his left shoulder and runs through you; the floor burns where he passed.
//  behind/side  ── Backhand: the right fist wound across his body and swung out behind: a ring (stand close in, or far out).
//  far          ── Slag Toss: he scoops from his own belly and lobs three gobs of slag, each aimed ahead of you; each leaves a
//                  burning pool.
//  mid, front   ── Furnace Breath: the door bars lift, he leans in and breathes a jet that sweeps from one side to the other:
//                  five wedges in turn (run with it, or step through behind it).
//  close, any   ── Ground Pound: a knee raised high and stamped down: a blast round him, then the floor cracks open along eight
//                  lanes, then eight more in the gaps.
//  Phase II (55%) "Meltdown": a roar; the foundry floor itself heats: its four quarters glow and then burn one after another, one
//                  always cool (4042). He rests less, his Heat climbs faster, and he gains Triple Pound (three stamps, a ring of
//                  force from each), Slag Rain (six gobs, three aimed, three wild) and a Furnace Breath that sweeps there and back.
//  Signature ──── Heat (both phases; the bar says how hot he is). It climbs all the time. Two quench pools are sunk in the floor.
//                  * Lead him into a pool with water in it: steam bursts, his Heat drops to nothing and his plates crack cold:
//                    QUENCHED, a long stagger. The pool is boiled dry for a while.
//                  * If his Heat fills he kneels, shaking, and melts down: a blast across the whole foundry. Only someone standing
//                    in a pool with water in it is spared (and that pool boils dry too). Then he heals a little and starts again.
//                  So water is both your sword and your shield, and there are only two pools.
// Weakness: posture (the yellow bar); every break staggers him (+35% damage). Big moves have armour.
const BM232_DEB=['Seared','🔥',{pdP:-.15},'Seared: −15% physical defence'];
function bm232Mats(){const X=WK232.X;return X.bm||(X.bm={slag:new THREE.MeshStandardMaterial({color:0x2a1a12,emissive:0xff5a12,emissiveIntensity:.9,roughness:.5,flatShading:true}),iron:new THREE.MeshStandardMaterial({color:0x24262b,roughness:.55,metalness:.6,flatShading:true}),
  rock:new THREE.MeshStandardMaterial({color:0x1c1a1a,roughness:.9,flatShading:true})})}
function bm232Sear(ms){try{dqDebuff(BM232_DEB[0],BM232_DEB[1],{pdP:-.15},ms||3000,BM232_DEB[3])}catch(_){}}
function bm232Pool(e,p,r,ms){wk232Pool(e,p,r,0xff6a1a,ms||4200,.17,['Seared','🔥',{pdP:-.15},BM232_DEB[3]])}
// a gob of slag lobbed from his fist to a spot; lands as a burst and a pool (the hit is the move's)
function bm232Gob(c,an,from){const p=new THREE.Vector3(an.x,0,an.z),a=from||c.wp('wrR',0,-.4,0),b=gY(p,.2),ms=new THREE.Mesh(svG('bm_gob',()=>svLump(.34,1,.3,141)),bm232Mats().slag);ms.userData.lpsSkip=1;
  svShot(a,b,.62,0xff8a3a,1.6,5,()=>{},ms)}
function bm232Land(e,p,big){const s=big?1.3:1;wk232Erupt(e,p,{col:0xff6a1a,s,mat:bm232Mats().rock,decal:0x1a0e08,snd:'splash',h:2.6,op:.6});burst(gY(p,.4),0xffa040,30,3,3,.7);try{sk146Drops(p,0xff8a3a,10,3,4,{})}catch(_){}bm232Pool(e,p,1.35*s,4200)}
function bm232Lane(c,an,dm){wk232Lane(c,an,dm,{mat:bm232Mats().rock,mat2:bm232Mats().slag,col:0xff8a3a,n:10,step:1.05,on:()=>bm232Sear(2500)})}
// the breath: one wedge of flame (the hit is the move's)
function bm232Jet(c,an){const N=16;for(let k=0;k<N;k++){const d=1.5+k*.55,w=(Math.random()-.5)*.5*(d/8),p=new THREE.Vector3(an.x+Math.sin(an.a+w)*d,0,an.z+Math.cos(an.a+w)*d);burst(gY(p,.8+Math.random()*.6),k%3?0xff8a2a:0xffd27a,2,1.2,.8,.45)}
  svSnd('hiss',.5,.6)}
const BM232_TR=(t0,t1,j)=>[t0,t1,j,[0,-.1,.5],[0,-.8,.5],0xffa040,.2];
var BM232M={
  intro:WK232_M({dur:3.4,inv:[0,3.4],armor:1,trn:[[0,3.4,1.5]],trk:[[.7,'heat','io'],[1.4,'heat','l',.02],[1.7,'roar','o'],[2.9,'roar','l',.025],[3.4,'cRec','io']],
    ev:[[.4,c=>{svSnd('hiss',.9,.5);c.S.chgT=.8}],[1.7,c=>{svSnd('roar',1.2,.5);svSnd('heavy',.8,.6);shake(.45);svShock(c.m.position,BM232.col,9,.8);burst(gY(c.m.position,2),0xffa040,80,6,4,1);c.S.chgT=0}]]}),
  // Hammer Fall
  combo:WK232_M({wt:10,cd:2.8,r:[0,5.4],a:'f',mel:1,dur:3.0,lock:.45,trn:[[0,.5,4.5],[.98,1.1,4.5],[1.6,1.95,3.2]],
    trk:[[.48,'rUp','io'],[.62,'rUp','l',.012],[.76,'rCut','s'],[1.0,'rCut','l'],[1.14,'rUp~','io'],[1.28,'rCut~','s'],[1.6,'ohUp','io'],[1.98,'ohUp','l',.018],[2.12,'ohSlam','s'],[2.55,'ohSlam','l'],[3.0,'cRec','io']],
    rm:[[.66,.78,.6,'o'],[1.18,1.3,.5,'o'],[2.02,2.14,1.0,'o']],
    hit:[{t:.75,s:{k:'a',r:4.6,h:1.15},f:.3,dm:1.0},{t:1.27,s:{k:'a',r:4.6,h:1.15},f:.3,dm:1.0},
      {t:2.12,s:{k:'c',r:2.8},f:3.2,dm:1.55,w:.5,kb:3,fx:c=>{const p=c.at(3.2);svShock(p,BM232.col,4,.4);burst(gY(p,.3),0xffa040,40,4,3,.6);svDecal(p,0x1a0e08,2.6,4,.6);shake(.4);svSnd('heavy',1.3,.7);svSnd('bell',.5,.5);try{sk146Crack(p,0xff7a2a,3.4,2.4)}catch(_){}bm232Pool(c.e,p,1.6,3800)}}],
    tr:[BM232_TR(.66,.84,'wrR'),BM232_TR(1.18,1.36,'wrL'),BM232_TR(2.02,2.18,'wrL'),BM232_TR(2.02,2.18,'wrR')],
    ev:[[.66,c=>svSnd('swing',1,.6)],[1.18,c=>svSnd('swing',1,.65)],[1.62,c=>svSnd('hiss',.5,.7)],[2.02,c=>svSnd('whoosh',1.1,.6)]],nx:[['charge',.25,10],['back',.3,6]],rec:.35}),
  // Shoulder Charge
  charge:WK232_M({wt:8,cd:6.5,r:[4,13],a:'f',armor:1,dur:2.4,lock:.85,trn:[[0,.85,4]],
    trk:[[.65,'chLow','io'],[.95,'chLow','l',.016],[1.08,'chGo','s'],[1.5,'chGo','l'],[2.4,'cRec','io']],
    rm:[[1.04,1.46,'tgt','o',-1.6,12]],hit:[{t:1.4,s:{k:'l',w:3.0,l:12.5,b:0},f:0,dm:1.4,w:.8,kb:4}],
    ev:[[.4,c=>{svSnd('hiss',.7,.6);burst(gY(c.m.position,.3),0x3a3836,14,2,1,.5)}],[1.04,c=>{svSnd('whoosh',1.2,.55);shake(.2)}],[1.48,c=>{svSnd('heavy',1.1,.75);shake(.3);burst(gY(c.m.position,.4),0xffa040,24,3,1.5,.6)}]],
    tk(c){const M=c.M;if(c.t<1.04||c.t>1.5)return;const p=c.m.position;if(!M.an.lp)M.an.lp=p.clone();if(p.distanceTo(M.an.lp)>1.7){M.an.lp=p.clone();bm232Pool(c.e,p.clone(),1.0,4200);svSnd('heavy',.4,1)}},rec:.4}),
  // Backhand (from behind or the side)
  back:WK232_M({wt:(e,L,side)=>side==='b'?14:side==='s'?6:0,cd:5,r:[0,5.8],a:'sb',dur:2.1,lock:.6,trn:[[0,.5,2]],
    trk:[[.6,'bkUp','io'],[.9,'bkUp','l',.015],[1.08,'bkCut','s'],[1.45,'bkCut','l'],[2.1,'cRec','io']],
    hit:[{t:1.08,s:{k:'r',r0:1.3,r:5.8},dm:1.2,kb:4,w:.85,fx:c=>{svShock(c.m.position,BM232.col,6,.4);burst(gY(c.m.position,1),0xffa040,30,5,1,.5);svSnd('whoosh',1.2,.6);svSnd('heavy',.7,1)}}],
    tr:[BM232_TR(.96,1.3,'wrR')],ev:[[.45,c=>svSnd('hiss',.6,.7)]],rec:.4}),
  // Slag Toss: three gobs aimed ahead of you
  toss:WK232_M({wt:(e,L)=>L>6?9:4,cd:7,r:[4,30],a:'fs',dur:3.3,trn:[[0,.7,4],[1.4,1.5,4],[2.1,2.2,4]],
    trk:[[.55,'tsUp','io'],[.75,'tsUp','l',.014],[.9,'toss','s'],[1.25,'tsUp','io'],[1.48,'tsUp','l',.014],[1.62,'toss','s'],[1.96,'tsUp','io'],[2.2,'tsUp','l',.014],[2.34,'toss','s'],[2.8,'toss','l'],[3.3,'cRec','io']],
    hit:[.92,1.64,2.36].map((t,i)=>({t:t+.62,s:{k:'c',r:1.9},o:c=>{const p=wk232Aim(c,.5+i*.08);return {x:p.x,z:p.z,a:0}},w:.62,dm:1.05,on:()=>bm232Sear(3000),fx:(c,an)=>bm232Land(c.e,new THREE.Vector3(an.x,0,an.z))})),
    ev:[.92,1.64,2.36].map((t,i)=>[t,c=>{const an=c.M.an['h'+i]||{x:pl.position.x,z:pl.position.z};bm232Gob(c,an);svSnd('whoosh',.8,.9)}]),rec:.4}),
  // Furnace Breath: a jet sweeping across (five wedges)
  breath:WK232_M({wt:(e,L)=>L>3&&L<9?9:3,cd:8,r:[2,11],a:'f',armor:1,dur:3.7,ph1only:1,trn:[[0,.9,3.5]],
    trk:[[.7,'brIn','io'],[1.15,'brIn','l',.018],[1.3,'breath','s'],[3.0,'breath','l',.008],[3.7,'cRec','io']],
    hit:[-.84,-.42,0,.42,.84].map((ay,i)=>({t:1.45+i*.32,s:{k:'a',r:10,h:.27},f:.6,ay,w:.55,dm:1.0,wc:0xff7a2a,on:()=>bm232Sear(3000),fx:(c,an)=>bm232Jet(c,an)})),
    ev:[[.5,c=>{svSnd('charge',.8,.5);c.S.chgT=1.2}],[1.3,c=>{svSnd('roar',.8,.7)}],[3.05,c=>{c.S.chgT=0}]],rec:.45}),
  // Ground Pound
  pound:WK232_M({wt:(e,L)=>L<5.5?9:2,cd:9,r:[0,6.5],a:'any',armor:1,dur:3.2,trn:[[0,.5,2]],
    trk:[[.7,'stUp','io'],[1.7,'stUp','l',.02],[1.84,'stomp','s'],[2.6,'stomp','l'],[3.2,'cRec','io']],
    hit:[{t:1.84,s:{k:'c',r:3.4},dm:1.35,w:1.25,kb:4,fx:c=>{svShock(c.m.position,BM232.col,4.5,.4);burst(gY(c.m.position,.5),0xffa040,60,5,3,.7);svDecal(c.m.position,0x1a0e08,3.6,3,.55);shake(.5);svSnd('heavy',1.4,.6);svSnd('bell',.6,.4);try{sk146Crack(c.m.position.clone(),0xff7a2a,5,2.4)}catch(_){}}}]
      .concat([0,1,2,3,4,5,6,7].map(k=>({t:2.06,s:{k:'l',w:1.4,l:10.6,b:-1.2},f:0,ay:k*Math.PI/4,nohit:1,w:.75,fx:(c,an)=>bm232Lane(c,an,1.0)})))
      .concat([0,1,2,3,4,5,6,7].map(k=>({t:2.5,s:{k:'l',w:1.4,l:10.6,b:-1.2},f:0,ay:k*Math.PI/4+Math.PI/8,nohit:1,w:.6,fx:(c,an)=>bm232Lane(c,an,1.0)}))),
    ev:[[.5,c=>{svSnd('hiss',.7,.6);c.S.chgT=1}],[1.84,c=>{c.S.chgT=0}]],rec:.45}),
  // ---------------- Phase II ----------------
  awaken:WK232_M({dur:3.8,inv:[0,3.8],armor:1,trn:[[0,3.5,1.2]],trk:[[.7,'heat','io'],[1.3,'heat','l',.03],[1.6,'blast','o'],[3.2,'roar','l',.03],[3.8,'cRec','io']],
    hit:[{t:1.62,s:{k:'c',r:7},dm:.55,kb:6,w:1.2,fx:c=>{svShock(c.m.position,BM232.col,11,.85);burst(gY(c.m.position,2),0xffa040,120,7,4,1);svDecal(c.m.position,0x1a0e08,6,5,.55)}}],
    ev:[[.05,c=>{try{zt116Show(ZT116.Z[4],'Brassmaw · Phase II','Meltdown','The foundry floor heats: its quarters burn one after another','Keep to the cool quarter · mind the water','z4')}catch(_){}svSnd('hiss',1,.4);c.S.chgT=1.2}],
      [1.6,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.chgT=0;try{flash('rgba(255,130,40,.3)')}catch(_){}svSnd('roar',1.3,.45);shake(.6);try{bm232Floor(c.D,1)}catch(err){console.error('bm floor',err)}}]]}),
  pound3:WK232_M({wt:9,cd:10,ph:2,r:[0,30],a:'any',armor:1,dur:4.6,trn:[[0,.5,3],[1.5,1.8,3],[2.6,2.9,3]],
    trk:[[.6,'stUp','io'],[1.0,'stUp','l',.02],[1.12,'stomp','s'],[1.5,'stUp~','io'],[2.1,'stUp~','l',.02],[2.22,'stomp~','s'],[2.6,'stUp','io'],[3.2,'stUp','l',.02],[3.32,'stomp','s'],[4.0,'stomp','l'],[4.6,'cRec','io']],
    hit:[1.12,2.22,3.32].map((t,i)=>({t,s:{k:'c',r:3.2},dm:1.2,w:.8,kb:3,fx:c=>{const p=c.m.position.clone();svShock(p,BM232.col,4,.4);burst(gY(p,.5),0xffa040,40,5,3,.6);shake(.4);svSnd('heavy',1.3,.6+i*.08);try{sk146Crack(p,0xff7a2a,4,2)}catch(_){}
      try{sk146RingWave(c.e,p,2.4,13,1.5-i*.15,1.1,1.0,BM232.col,{on:()=>bm232Sear(2500)})}catch(_){}}})),
    ev:[[.4,c=>svSnd('hiss',.7,.6)]],rec:.5}),
  rain:WK232_M({wt:8,cd:10,ph:2,r:[0,30],a:'any',dur:3.6,trn:[[0,.6,3]],
    trk:[[.5,'tsUp','io'],[.8,'toss','s'],[1.1,'tsUp~','io'],[1.4,'toss~','s'],[1.7,'tsUp','io'],[2.0,'toss','s'],[2.9,'toss','l'],[3.6,'cRec','io']],
    hit:[0,1,2,3,4,5].map(i=>({t:1.6+i*.3,s:{k:'c',r:1.9},o:c=>{if(i%2==0){const p=wk232Aim(c,.4+i*.06);return {x:p.x,z:p.z,a:0}}const a=c.rnd()*6.283,r=2+c.rnd()*4,q=wk232Clamp(c.D,new THREE.Vector3(pl.position.x+Math.cos(a)*r,0,pl.position.z+Math.sin(a)*r),.5);return {x:q.x,z:q.z,a:0}},w:.8,dm:1.0,on:()=>bm232Sear(3000),
      pre:(c,an)=>{},fx:(c,an)=>bm232Land(c.e,new THREE.Vector3(an.x,0,an.z))})),
    ev:[.8,1.4,2.0].map(t=>[t,c=>{for(let k=0;k<2;k++){const a=c.wp('wrR',0,-.4,0),b=a.clone();b.y+=14;b.x+=(Math.random()-.5)*4;b.z+=(Math.random()-.5)*4;const ms=new THREE.Mesh(svG('bm_gob',()=>svLump(.34,1,.3,141)),bm232Mats().slag);ms.userData.lpsSkip=1;svShot(a,b,.5,0xff8a3a,1.4,2,()=>{},ms)}svSnd('whoosh',.8,.8)}]),rec:.45}),
  breath2:WK232_M({wt:(e,L)=>L>3&&L<10?10:3,cd:9,ph:2,r:[2,12],a:'f',armor:1,dur:5.2,trn:[[0,.9,3.5]],
    trk:[[.7,'brIn','io'],[1.15,'brIn','l',.018],[1.3,'breath','s'],[4.5,'breath','l',.008],[5.2,'cRec','io']],
    hit:[-.84,-.42,0,.42,.84,.84,.42,0,-.42,-.84].map((ay,i)=>({t:1.45+i*.3,s:{k:'a',r:10.5,h:.27},f:.6,ay,w:i==5?.3:.5,dm:1.0,wc:0xff7a2a,on:()=>bm232Sear(3000),fx:(c,an)=>bm232Jet(c,an)})),
    ev:[[.5,c=>{svSnd('charge',.8,.5);c.S.chgT=1.2}],[1.3,c=>svSnd('roar',.8,.7)],[4.5,c=>{c.S.chgT=0}]],rec:.5}),
  // Meltdown: his Heat is full (4042 casts this through the record's phase hook). Stand in water.
  meltdown:WK232_M({dur:7.0,armor:1,inv:[0,5.2],trn:[[0,.5,1]],
    trk:[[.6,'heat','io'],[4.3,'heat','l',.05],[4.5,'blast','s'],[5.4,'blast','l',.02],[6.2,'stag','io'],[7.0,'cRec','io']],
    hit:[{t:4.5,s:{k:'c',r:99},nohit:1,w:0,show:false,fx:c=>{try{bm232Melt(c.D,c.e)}catch(err){console.error('bm melt',err)}}}],
    go(c){c.S.chgT=1.6;c.S.still=1;try{bm232MeltWarn(c.D,c.e)}catch(_){}},
    ev:[[.1,c=>{svSnd('charge',1,.4);svSnd('hiss',1,.4)}],[2.2,c=>svSnd('charge',1,.6)],[3.6,c=>svSnd('charge',1,.9)]],
    tk(c,dt){if(c.t<4.5){c.S.heat=1;if(Math.random()<dt*30){const a=Math.random()*6.283;burst(c.wp('spine',Math.sin(a)*1.2,.3+Math.random(),Math.cos(a)*1.2),0xffd27a,1,1.5,1.5,.5)}}},
    end(c){c.S.chgT=0;c.S.still=0;try{bm232MeltEnd(c.D)}catch(_){}},rec:.6}),
  // quenched: steam, cracked plates, a long stagger
  broken:WK232_M({dur:5.0,trk:[[.3,'stag','o'],[4.4,'stag','l',.03],[5.0,'cRec','io']],
    go(c){c.S.stg=5.0;svSnd('stag',1.2,.7);svSnd('hiss',1.3,.5);popT(c.m.position,'QUENCHED','#bfe9ff',true);burst(gY(c.m.position,2),0xdfe9f0,90,5,5,1.4);svShock(c.m.position,0xbfe9ff,6,.5)},
    tk(c,dt){c.S.stg=Math.max(0,5.0-c.t);if(Math.random()<dt*14){const p=svWP(c.e,'chest',(Math.random()-.5)*2,Math.random(),(Math.random()-.5)*1.6);burst(p,0xdfe9f0,1,.4,1.6,1)}},end(c){c.S.stg=0}})};
