// ================= v232 Ythrael — the moves (Sovereign move format; the kit 4010 points the engine at the Hollow) =================
// Theme: the thing that drank the Sovereigns: black fire, long nails, a voice that commands — and the essence itself, which is his
// strength and his weakness. Debuff: Withered (his black fire: you deal less damage).
// Three phases. I "The Voice" (to 66%): the robed lord, on foot. II "Wings of Ivory" (to 33%): the wings tear out, he takes to the
// air, and the brink of the stone begins to burn. III "The Gangly Truth": the robe splits, the limbs stretch, the stone's rim falls
// away; he is frantic and starving.
//  close, front ── Nail Rake: a hand raked down and across (an arc), the other hand (an arc), then both hands low and up: a pillar
//                  of black fire along a line in front of him (late).
//  mid / far    ── Umbral Lance: one arm levelled at you, a breath, and a lance of black fire the length of the stone.
//  behind/side  ── Robe Whirl: he turns in a sweep of robe and sleeve: a ring (stand close in, or far out).
//  any          ── Grasping Shadows: his palms lift, and three hands of shadow close out of the floor under you, each aimed ahead
//                  of you; a pool of void stays where each closed.
//  far, front   ── Black Orbs: hands crossed at his breast and flung apart: five slow orbs in a fan.
//  close, any   ── Voice of Command: he speaks one word. A blast round him, then black spikes along eight lanes, then eight more.
//  Phase II ────── Skyfall (he stoops on you from the air; a ring of force from where he lands), Essence Barrage (six strikes in
//                  the six Sovereigns' colours fall one after another, each aimed ahead of you) and Wing Gale (a wide cone of
//                  wind that throws you toward the brink).
//  Phase III ───── Frenzy (five rakes and a leaping slam), Thousand Nails (three fans of lances in quick succession) and
//                  everything faster.
//  Signature ──── Thirst (all phases). His heavy blows spill motes of essence onto the stone, and they lie there. Walk over a mote
//                  and you take it: it heals you a little and makes you stronger (Stolen Essence, up to six). When enough lie
//                  about he kneels and DRINKS: every mote left flies to his mouth; each one heals him and makes him stronger.
//                  Take the sixth mote and the essence in you tears out of him in answer: RUPTURED, a long stagger, a deep wound.
//                  So the floor is a race: the motes lie where his blows just landed.
// Weakness: posture (the yellow bar); every break staggers him (+35% damage). Big moves have armour.
const YT232_DEB=['Withered','🕳',{paP:-.15,maP:-.15},'Black fire eats at you: −15% attack'];
function yt232Mats(){const X=WK232.X;return X.yt||(X.yt={void:new THREE.MeshStandardMaterial({color:0x0c0614,emissive:0x5a2a9a,emissiveIntensity:.7,roughness:.4,flatShading:true}),dark:new THREE.MeshStandardMaterial({color:0x08060c,roughness:.6,flatShading:true}),orb:new THREE.MeshBasicMaterial({color:0x1a0a2a})})}
function yt232Wither(ms){try{dqDebuff(YT232_DEB[0],YT232_DEB[1],YT232_DEB[2],ms||3500,YT232_DEB[3])}catch(_){}}
function yt232Pool(e,p,r,ms){wk232Pool(e,p,r,0x7a3aff,ms||4000,.17,YT232_DEB)}
// a hand of shadow closing out of the floor (the hit is the move's); a void pool; a mote of essence
function yt232Grasp(c,p,big){const e=c.e,M=yt232Mats(),s=big?1.3:1;wk232Erupt(e,p,{col:0x7a3aff,s,decal:0x0a0612,snd:'hiss',h:3.4,op:.55});
  for(let k=0;k<5;k++){const a=k/5*6.283+.3,r=.75*s;svSpike(new THREE.Vector3(p.x+Math.cos(a)*r,0,p.z+Math.sin(a)*r),k%2?M.dark:M.void,(1.9+Math.random()*.5)*s,.14*s,1.3,.75)}
  burst(gY(p,.6),0x3a1a5a,24,2.5,3,.7);yt232Pool(e,p,1.3*s,3800)}
function yt232Lance(an,len,w){const g=new THREE.Group(),a=an.a,y=GH(an.x,an.z);g.position.set(an.x,y+1.5,an.z);g.rotation.y=a;
  const core=new THREE.Mesh(svG('yt_lc',()=>{const q=new THREE.CylinderGeometry(1,1,1,8,1,true);q.rotateX(Math.PI/2);q.translate(0,0,.5);return q}),new THREE.MeshBasicMaterial({color:0x0a0410,transparent:true,opacity:.95,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  const halo=new THREE.Mesh(core.geometry,new THREE.MeshBasicMaterial({color:0x9a5aff,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  core.scale.set(w*.28,w*.28,len);halo.scale.set(w*.6,w*.6,len);[core,halo].forEach(m=>{m.userData.lpsSkip=1;m.renderOrder=22;g.add(m)});scene.add(g);let t=0;
  for(let k=0;k<len;k+=1.2)burst(new THREE.Vector3(an.x+Math.sin(a)*k,y+1.5,an.z+Math.cos(a)*k),k%2?0x7a3aff:0x1a0a2a,2,1.2,.4,.5);
  kqFx({tick(dt){t+=dt||0;const k=t/.4;core.scale.x=core.scale.y=w*.28*(1-k);halo.material.opacity=.6*(1-k);halo.scale.x=halo.scale.y=w*.6*(1+k);return k<1},end(){scene.remove(g);core.material.dispose();halo.material.dispose()}})}
function yt232Orb(c,an,dm,spd){wk232Bolt(c,an,dm,{col:0x9a5aff,spd:spd||8,L:22,w:1.5,y:1.3,gl:2.0,trail:false,mesh:()=>{const g=new THREE.Group(),m=new THREE.Mesh(svG('yt_orb',()=>new THREE.IcosahedronGeometry(.46,1)),yt232Mats().orb);g.add(m);return g},on:()=>yt232Wither(3500)})}
function yt232Lane(c,an,dm){const M=yt232Mats();wk232Lane(c,an,dm,{mat:M.dark,mat2:M.void,col:0x7a3aff,n:14,step:1.05,h:1.4,on:()=>yt232Wither(2500)})}
// a strike of one Sovereign's essence from above (the hit is the move's); it leaves a mote
function yt232Strike(c,p,i){const col=YT232.ess[i%6];try{sk146Column(p,col,0xffffff,1.0,8,.5)}catch(_){}burst(gY(p,.4),col,36,4,3,.7);svShock(p,col,3,.3);svDecal(p,0x0a0612,1.8,3,.5);try{sk146Crack(p,col,2.4,1.6)}catch(_){}svSnd('bell',.5,.6+i*.12);svSnd('heavy',.7,1.1);try{yt232Mote(c.D,p,i)}catch(_){}}
const YT232_TR=(t0,t1,j)=>[t0,t1,j,[0,-.3,.1],[0,-.9,.2],0x9a5aff,.2];
function yt232Stoop(tb,o){o=o||{};return {trn:[tb,tb+1.4,6],
  hit:[{t:tb+2.0,s:{k:'c',r:3.4},o:'tgt',dm:o.dm||1.45,w:.55,kb:4,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);c.m.position.x=p.x;c.m.position.z=p.z;c.S.ghost=0;svShock(p,YT232.col,5.5,.45);burst(gY(p,.4),0x3a1a5a,60,5,3,.7);svDecal(p,0x0a0612,3.2,4,.55);shake(.5);svSnd('heavy',1.4,.7);
      try{sk146Crack(p,0x9a5aff,4.2,2)}catch(_){}try{sk146RingWave(c.e,p.clone(),2.6,15,1.4,1.1,.95,YT232.col,{on:()=>yt232Wither(2500)})}catch(_){}try{yt232Mote(c.D,p)}catch(_){}}}],
  trk:[[tb+.3,'crouch','io'],[tb+.48,'crouch','l',.014],[tb+.75,'flyUp','o'],[tb+1.0,'flyDn','io'],[tb+1.25,'flyUp','io'],[tb+1.5,'flyDn','io'],[tb+1.72,'stoop','i'],[tb+2.0,'land','s'],[tb+2.4,'land','l']],
  ev:[[tb+.5,c=>{c.S.ghost=1;svSnd('whoosh',1.2,.6);burst(gY(c.m.position,.3),0x3a1a5a,30,4,1,.6);svShock(c.m.position,YT232.col,3.5,.35)}],[tb+1.5,c=>svSnd('hiss',.8,.6)]],
  tk(c,dt){if(c.t>tb+.55&&c.t<tb+1.45){const m=c.m,p=wk232HeroIn(c.D,pl.position.clone());m.position.x+=(p.x-m.position.x)*Math.min(1,dt*2.2);m.position.z+=(p.z-m.position.z)*Math.min(1,dt*2.2)}}}}
var YT232M={
  intro:WK232_M({dur:4.0,inv:[0,4.0],armor:1,trn:[[0,4.0,1.5]],trk:[[.9,'cross','io'],[1.7,'cross','l',.01],[2.0,'speak','o'],[3.4,'speak','l',.015],[4.0,'cRec','io']],
    ev:[[.3,c=>{say('<i>“So. The Upright bites the hand that raised it.”</i>');svSnd('hiss',.8,.5);c.S.chgT=1}],[2.0,c=>{svSnd('roar',1.1,.5);svSnd('bell',.8,.4);shake(.45);svShock(c.m.position,YT232.col,10,.8);burst(gY(c.m.position,3),0x7a3aff,90,6,3,1);c.S.chgT=0}]]}),
  // Nail Rake
  rake:WK232_M({wt:10,cd:2.6,r:[0,5.8],a:'f',mel:1,dur:2.9,lock:.4,trn:[[0,.42,5],[.84,.96,5],[1.44,1.74,3.6]],
    trk:[[.4,'rUp','io'],[.52,'rUp','l',.012],[.64,'rCut','s'],[.86,'rCut','l'],[1.0,'rUp~','io'],[1.12,'rCut~','s'],[1.42,'upLow','io'],[1.76,'upLow','l',.016],[1.9,'upCut','s'],[2.35,'upCut','l'],[2.9,'cRec','io']],
    rm:[[.56,.66,.8,'o'],[1.04,1.14,.7,'o'],[1.8,1.92,.8,'o']],
    hit:[{t:.63,s:{k:'a',r:5.0,h:1.15},f:.3,dm:.95},{t:1.11,s:{k:'a',r:5.0,h:1.15},f:.3,dm:.95},
      {t:1.9,s:{k:'l',w:2.4,l:8.5,b:0},f:.4,dm:1.4,w:.46,on:()=>yt232Wither(3500),fx:(c,an)=>{for(let k=1.5;k<8.5;k+=1.8){const p=new THREE.Vector3(an.x+Math.sin(an.a)*k,0,an.z+Math.cos(an.a)*k);wk232Erupt(c.e,p,{col:0x7a3aff,s:1.1,h:5,op:.55,snd:'hiss'})}shake(.3);svSnd('heavy',1.1,.9);try{yt232Mote(c.D,c.at(5))}catch(_){}}}],
    tr:[YT232_TR(.55,.72,'wrR'),YT232_TR(1.02,1.2,'wrL'),YT232_TR(1.8,1.96,'wrL'),YT232_TR(1.8,1.96,'wrR')],
    ev:[[.56,c=>svSnd('swing',.9,.9)],[1.04,c=>svSnd('swing',.9,1)],[1.44,c=>svSnd('hiss',.6,.7)],[1.8,c=>svSnd('whoosh',1,.7)]],nx:[['lance',.25,10],['whirl',.3,6]],rec:.3}),
  // Umbral Lance
  lance:WK232_M({wt:(e,L)=>L>4?9:4,cd:5.5,r:[3,40],a:'f',armor:1,dur:2.3,lock:.95,trn:[[0,.95,5]],
    trk:[[.7,'lnUp','io'],[1.04,'lnUp','l',.014],[1.14,'lance','s'],[1.7,'lance','l'],[2.3,'cRec','io']],
    hit:[{t:1.16,s:{k:'l',w:1.8,l:34,b:0},f:.8,dm:1.4,w:.8,kb:2,on:()=>yt232Wither(3500),fx:(c,an)=>{yt232Lance(an,34,1.8);shake(.3);svSnd('whoosh',1.3,.6);svSnd('crack',.8,.5)}}],
    ev:[[.4,c=>{svSnd('charge',.7,.5);svCharge(c.e,'wrL',0x7a3aff,1.2,.7,0,-.3,.1)}]],rec:.35}),
  // Robe Whirl (from behind or the side)
  whirl:WK232_M({wt:(e,L,side)=>side==='b'?14:side==='s'?6:0,cd:5,r:[0,6.2],a:'sb',dur:2.0,lock:.5,trn:[[0,.4,2]],
    trk:[[.55,'whUp','io'],[.84,'whUp','l',.014],[1.02,'whirl','s'],[1.4,'whirl','l'],[2.0,'cRec','io']],
    hit:[{t:1.02,s:{k:'r',r0:1.4,r:6.2},dm:1.15,kb:4,w:.8,fx:c=>{svShock(c.m.position,YT232.col,6.5,.4);burst(gY(c.m.position,1.2),0x6a0a14,40,6,1,.5);svSnd('whoosh',1.2,.7)}}],
    ev:[[.4,c=>svSnd('hiss',.6,.8)]],rec:.35}),
  // Grasping Shadows: three hands under you, aimed ahead
  grasp:WK232_M({wt:8,cd:7,r:[2,40],a:'any',armor:1,dur:3.1,lock:.7,trn:[[0,.7,3.5]],
    trk:[[.65,'lift','io'],[1.1,'lift','l',.012],[1.24,'press','s'],[2.5,'press','l',.006],[3.1,'cRec','io']],
    hit:[1.6,1.98,2.36].map((t,i)=>({t,s:{k:'c',r:2.0},o:c=>{const p=wk232Aim(c,.45+i*.1);return {x:p.x,z:p.z,a:0}},w:.68,dm:1.05,wc:0x7a3aff,on:()=>yt232Wither(3500),fx:(c,an)=>{yt232Grasp(c,new THREE.Vector3(an.x,0,an.z));if(i==2)try{yt232Mote(c.D,new THREE.Vector3(an.x,0,an.z))}catch(_){}}})),
    ev:[[.5,c=>{svSnd('hiss',.8,.6);c.S.chgT=.8}],[1.24,c=>{c.S.chgT=0;svSnd('heavy',.9,.8)}]],rec:.4}),
  // Black Orbs
  orbs:WK232_M({wt:(e,L)=>L>6?9:3,cd:7,r:[4,40],a:'f',dur:2.3,lock:.95,trn:[[0,.95,4]],
    trk:[[.75,'cross','io'],[1.0,'cross','l',.012],[1.14,'fling','s'],[1.7,'fling','l'],[2.3,'cRec','io']],
    hit:[-.56,-.28,0,.28,.56].map(ay=>({t:1.16,s:{k:'l',w:1.5,l:9,b:0},f:1.0,ay,nohit:1,w:.8,wc:0x7a3aff,fx:(c,an)=>yt232Orb(c,an,.95)})),
    ev:[[.4,c=>svSnd('charge',.5,.6)],[1.14,c=>svSnd('whoosh',.9,.8)]],rec:.35}),
  // Voice of Command
  voice:WK232_M({wt:(e,L)=>L<6?9:2,cd:9,r:[0,7],a:'any',armor:1,dur:3.4,trn:[[0,.5,2]],
    trk:[[.7,'curl','io'],[1.78,'curl','l',.02],[1.9,'speak','s'],[2.8,'speak','l',.012],[3.4,'cRec','io']],
    hit:[{t:1.9,s:{k:'c',r:3.8},dm:1.3,w:1.3,kb:4,fx:c=>{svShock(c.m.position,YT232.col,5,.35);burst(gY(c.m.position,2),0x7a3aff,70,6,3,.7);shake(.45);svSnd('roar',1.1,.6);svSnd('bell',.8,.4);say('<i>“KNEEL.”</i>');try{yt232Mote(c.D,c.at(2.5))}catch(_){}}}]
      .concat([0,1,2,3,4,5,6,7].map(k=>({t:2.14,s:{k:'l',w:1.4,l:15,b:-1.4},f:0,ay:k*Math.PI/4,nohit:1,w:.75,wc:0x7a3aff,fx:(c,an)=>yt232Lane(c,an,1.0)})))
      .concat([0,1,2,3,4,5,6,7].map(k=>({t:2.58,s:{k:'l',w:1.4,l:15,b:-1.4},f:0,ay:k*Math.PI/4+Math.PI/8,nohit:1,w:.6,wc:0x7a3aff,fx:(c,an)=>yt232Lane(c,an,1.0)}))),
    ev:[[.5,c=>{svSnd('charge',.7,.5);c.S.chgT=1.4}],[1.9,c=>{c.S.chgT=0}]],rec:.45}),
  // Thirst: he drinks every mote left on the stone (4062)
  drink:WK232_M({wt:(e)=>{const D=e.wk,n=D.S.motes.length;return n>=5?40:n>=3?16:0},cd:14,r:[0,40],a:'any',armor:1,dur:5.2,trn:[[0,.4,1]],
    trk:[[.7,'kneel','io'],[4.2,'kneel','l',.014],[4.6,'speak','o'],[5.2,'cRec','io']],
    go(c){c.S.still=1},ev:[[.2,c=>{svSnd('hiss',1,.5);c.S.chgT=1;try{yt232DrinkStart(c.D,c.e)}catch(err){console.error('yt drink',err)}}],[4.3,c=>{c.S.chgT=0;try{yt232DrinkEnd(c.D,c.e,false)}catch(err){console.error('yt drink end',err)}}]],
    end(c,silent){c.S.still=0;c.S.chgT=0;try{yt232DrinkEnd(c.D,c.e,true)}catch(_){}},rec:.5}),
  // ---------------- Phase II: the wings ----------------
  awaken:WK232_M({dur:4.2,inv:[0,4.2],armor:1,trn:[[0,3.8,1.2]],trk:[[.8,'curl','io'],[1.5,'curl','l',.03],[1.8,'speak','o'],[3.5,'speak','l',.02],[4.2,'cRec','io']],
    hit:[{t:1.82,s:{k:'c',r:8},dm:.55,kb:7,w:1.3,fx:c=>{svShock(c.m.position,YT232.col,13,.9);burst(gY(c.m.position,3),0xe2dccb,120,8,4,1.1);burst(gY(c.m.position,3),0x7a3aff,60,6,3,1)}}],
    ev:[[.05,c=>{try{zt116Show(ZT116.Z[5],'Ythrael · Phase II','Wings of Ivory','He takes to the air, and the brink of the stone begins to burn','Keep off the edge','z5')}catch(_){}say('<i>“You think this stone is the world? Look UP.”</i>');svSnd('hiss',1,.4);c.S.chgT=1.4}],
      [1.8,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.chgT=0;try{flash('rgba(200,150,255,.35)')}catch(_){}svSnd('roar',1.3,.5);svSnd('crack',1,.5);shake(.6);try{yt232Brink(c.D,1)}catch(err){console.error('yt brink',err)}}]]}),
  skyfall:WK232_M((()=>{const d=yt232Stoop(.1);return {wt:(e,L)=>L>4?10:5,cd:8,ph:2,r:[0,40],a:'any',armor:1,dur:3.0,rec:.4,trn:[d.trn],hit:d.hit,trk:d.trk.concat([[3.0,'cRec','io']]),ev:d.ev,tk:d.tk,end(c){c.S.ghost=0}}})()),
  barrage:WK232_M({wt:8,cd:10,ph:2,r:[0,40],a:'any',armor:1,dur:4.6,trn:[[0,.6,3]],
    trk:[[.6,'lift','io'],[3.6,'lift','l',.012],[3.9,'press','s'],[4.6,'cRec','io']],
    hit:[0,1,2,3,4,5].map(i=>({t:1.5+i*.42,s:{k:'c',r:2.1},o:c=>{const p=wk232Aim(c,.4+(i%3)*.12);return {x:p.x,z:p.z,a:0}},w:.7,dm:1.05,wc:YT232.ess[i],fx:(c,an)=>yt232Strike(c,new THREE.Vector3(an.x,0,an.z),i)})),
    ev:[[.4,c=>{svSnd('charge',.8,.7);c.S.chgT=1;say('<i>“Their strength is MINE.”</i>')}],[3.9,c=>{c.S.chgT=0}]],rec:.45}),
  gale:WK232_M({wt:(e,L)=>L<9?8:3,cd:8,ph:2,r:[0,11],a:'f',armor:1,dur:2.4,lock:.8,trn:[[0,.8,4]],
    trk:[[.7,'galeUp','io'],[1.0,'galeUp','l',.016],[1.14,'gale','s'],[1.6,'gale','l'],[2.4,'cRec','io']],
    hit:[{t:1.14,s:{k:'a',r:11,h:.85},f:.2,dm:1.1,kb:9,w:.8,fx:c=>{burst(gY(c.at(3),1.4),0xe2dccb,50,10,2,.7);burst(gY(c.at(7),1.2),0x3a1a5a,40,10,1,.7);svShock(c.at(1.5),YT232.col,5,.4);shake(.3);svSnd('whoosh',1.5,.5)}}],
    ev:[[.4,c=>svSnd('whoosh',.7,.7)]],rec:.4}),
  // ---------------- Phase III: the gangly truth ----------------
  awaken2:WK232_M({dur:4.6,inv:[0,4.6],armor:1,trn:[[0,4.2,1.2]],trk:[[.8,'kneel','io'],[2.0,'kneel','l',.05],[2.4,'speak','o'],[3.9,'speak','l',.03],[4.6,'cRec','io']],
    hit:[{t:2.42,s:{k:'c',r:8},dm:.6,kb:7,w:1.5,fx:c=>{svShock(c.m.position,0xffffff,14,.9);burst(gY(c.m.position,3),0x6a0a14,120,8,4,1.2);burst(gY(c.m.position,3),0xcfc6c2,60,6,3,1)}}],
    ev:[[.05,c=>{try{zt116Show(ZT116.Z[5],'Ythrael · Phase III','The Gangly Truth','The robe splits. The rim of the stone falls into the dark','There is less room now','z5')}catch(_){}say('<i>“A thousand years… I will NOT… go back… to the DARK—”</i>');svSnd('shriek',1,.6);c.S.chgT=1.6}],
      [2.4,c=>{c.S.ph=3;c.e.bs.ph=3;c.S.chgT=0;try{flash('rgba(255,255,255,.4)')}catch(_){}svSnd('roar',1.4,.8);svSnd('shriek',1.2,.5);shake(.8);try{yt232Crumble(c.D,1)}catch(err){console.error('yt crumble',err)}}]]}),
  frenzy:WK232_M({wt:10,cd:4,ph:3,r:[0,6.4],a:'f',mel:1,dur:3.5,lock:.3,trn:[[0,.3,6],[.62,.7,6],[.96,1.04,6],[1.3,1.38,6],[1.9,2.25,4]],
    trk:[[.28,'rUp','io'],[.42,'rCut','s'],[.6,'rUp~','io'],[.76,'rCut~','s'],[.94,'rUp','io'],[1.1,'rCut','s'],[1.28,'rUp~','io'],[1.44,'rCut~','s'],[1.9,'flyUp','o'],[2.24,'stoop','i'],[2.4,'land','s'],[2.95,'land','l'],[3.5,'cRec','io']],
    rm:[[.36,.44,.7,'o'],[.7,.78,.6,'o'],[1.04,1.12,.6,'o'],[1.38,1.46,.6,'o'],[1.86,2.4,'tgt','io',.4,9]],
    hit:[.42,.76,1.1,1.44].map(t=>({t,s:{k:'a',r:5.2,h:1.15},f:.3,dm:.85})).concat([{t:2.4,s:{k:'c',r:3.4},o:'tgt',dm:1.5,w:.5,on:()=>yt232Wither(3500),fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);svShock(p,YT232.col,5,.45);burst(gY(p,.4),0x3a1a5a,50,4,3,.7);shake(.45);svSnd('heavy',1.3,.9);yt232Grasp(c,p,true);try{yt232Mote(c.D,p)}catch(_){}}}]),
    tr:[YT232_TR(.34,.48,'wrR'),YT232_TR(.68,.82,'wrL'),YT232_TR(1.02,1.16,'wrR'),YT232_TR(1.36,1.5,'wrL')],
    ev:[[.36,c=>svSnd('swing',.9,1.2)],[.7,c=>svSnd('swing',.9,1.3)],[1.04,c=>svSnd('swing',.9,1.25)],[1.38,c=>svSnd('swing',.9,1.35)],[1.86,c=>{svSnd('shriek',.7,.9);c.S.ghost=1}],[2.4,c=>{c.S.ghost=0}]],end(c){c.S.ghost=0},rec:.4}),
  nails:WK232_M({wt:(e,L)=>L>4?10:4,cd:8,ph:3,r:[3,40],a:'f',armor:1,dur:3.8,trn:[[0,.8,5],[1.3,1.5,6],[2.0,2.2,6]],
    trk:[[.6,'lnUp','io'],[.84,'lnUp','l',.014],[.94,'lance','s'],[1.3,'lnUp~','io'],[1.56,'lance~','s'],[2.0,'lnUp','io'],[2.26,'lance','s'],[3.0,'lance','l'],[3.8,'cRec','io']],
    hit:[[.96,[-.3,0,.3]],[1.58,[-.45,-.15,.15,.45]],[2.28,[-.3,0,.3]]].flatMap(([t,A],w)=>A.map(ay=>({t,s:{k:'l',w:1.5,l:34,b:0},f:.8,ay,dm:1.15,w:w?.44:.7,wc:0x7a3aff,on:()=>yt232Wither(3000),fx:(c,an)=>{yt232Lance(an,34,1.4);if(ay==A[0]){shake(.25);svSnd('whoosh',1.2,.7+w*.1)}}}))),
    ev:[[.3,c=>svSnd('charge',.7,.6)]],rec:.45}),
  // the essence torn back out of him: a long stagger
  broken:WK232_M({dur:5.2,trk:[[.3,'stag','o'],[4.6,'stag','l',.03],[5.2,'cRec','io']],
    go(c){c.S.stg=5.2;c.S.ghost=0;svSnd('stag',1.2,.7);svSnd('shriek',1,.6);popT(c.m.position,'RUPTURED','#e8d0ff',true);svShock(c.m.position,0xffffff,7,.5);for(let i=0;i<6;i++)burst(gY(c.m.position,2.5),YT232.ess[i],24,5,4,1)},
    tk(c,dt){c.S.stg=Math.max(0,5.2-c.t);if(Math.random()<dt*14){const p=svWP(c.e,'heart',0,0,.2);burst(p,YT232.ess[(Math.random()*6)|0],1,1.2,1.5,.8)}},end(c){c.S.stg=0}})};
