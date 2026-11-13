// ================= v205 Vharog, the Bloodgorged — the moves (Sovereign move format, v110 engine) and the engine glue =================
// Like Qarsul (3273) he runs on the v110 timeline engine outside a Sovereign den: the gateway clearing of The Citadel II (3742) is
// his arena; svCtx / svHitNow are pointed at it for him only. He never sets e.ar (not a Sovereign defeat).
// Theme: hunger. A war-beast bred and starved by the court: everything he does is the hunt and the feeding — claws that open
// wounds, a maw that drinks, the pounce of a predator, the screech of a bat, and in the dark he hunts by your heartbeat.
// Hemorrhage (his debuff): his claws open wounds (stacks to 3; each stack bleeds you a little every second, ~6 s; a dash does not
// close them, time does). Pinned: his Feeding Bite holds you in his jaws and drinks (he heals) until you dash free.
// Pattern (learnable; cooldowns, no repeats, combo strings):
//  close, front ── Rending Claws: a right swipe, a left swipe, a pause… then he rears onto his hind legs and brings both claws
//                  down on a line (late: it punishes an early dodge). Every claw that lands opens a wound.
//  mid, front   ── Pounce: he crouches, haunches up, and leaps onto where you will be (a circle leads you), a crash of blood.
//  behind/side  ── Wing Buffet: the wings snap open and he whirls a full turn: a ring round him (hug him, or be far out).
//  any          ── Gore Spew: he gulps, throws his head back, then spews three gouts of blood ahead of you: pools that open wounds.
//  far, front   ── Night Screech: half rearing, wings spread, a cone of sound in three pulses: Deafened (slowed) if it catches you.
//  close, any   ── Feeding Bite: a lunging snap; caught, you are Pinned and he drinks (dash to tear free).
//  Phase II (55%) "The Hunger Wakes": a roar, the blood moon comes out, the mist round the arena closes in and runs red, and
//                  he rests less. He gains Frenzy (four claws and a pounce), Double Pounce, Bat Storm (three lanes of bats sweep
//                  the arena) and the signature:
//  Night Hunt: he leaps away into the dark; the light dies and only his eyes show as he circles the arena, lunging across it
//                  through you again and again (each lunge's lane is shown). Three siege ballistae stand at the edge: F at one
//                  fires a silver harpoon into him; three chains and he is dragged down: CHAINED, a long stagger. If the hunt runs
//                  out first he drops on you, feeds (heals) and lets out the Crimson Howl (two rings to dash through).
// Weakness: posture (the yellow bar); every break staggers him (+35% damage). Big moves have armour.
var VH205A=null;   // the arena while he exists: {cx, cz, r (his reach), hr (the hero's), y, f (fight on), r0}
{const f=svCtx;svCtx=function(e){const c=f.apply(this,arguments);if(e&&e.vh205){c.A=VH205A;c.inA=(p,mg)=>vh205Clamp(p,mg==null?1.2:mg);c.hit=(s,an,dm,o)=>vh205HitNow(e,s,an,dm,o||{})}return c}}
{const f=svHitNow;svHitNow=function(e,s,an,dm,o){if(e&&e.vh205)return vh205HitNow(e,s,an,dm,o||{});return f.apply(this,arguments)}}
function vh205Clamp(p,mg){const A=VH205A;if(!A)return p;const dx=p.x-A.cx,dz=p.z-A.cz,d=Math.hypot(dx,dz),lim=A.r-(mg||0);if(d>lim){p.x=A.cx+dx/d*lim;p.z=A.cz+dz/d*lim}return p}
function vh205HeroIn(p){const A=VH205A;if(!A)return p;const dx=p.x-A.cx,dz=p.z-A.cz,d=Math.hypot(dx,dz);if(d>A.hr){p.x=A.cx+dx/d*A.hr;p.z=A.cz+dz/d*A.hr}return p}
function vh205HitNow(e,s,an,dm,o){if(!VH205A||!VH205A.f||e.dead)return false;let hit=false;if(o.flash!==false)svFlash(s,an,o.col||VH205M.col,o.fms);
  if(hero.hp>0&&svIn(s,an,pl.position,o.pad)){hit=true;SVX.st.hits++;if(o.pre)try{o.pre()}catch(_){}const iv=hero.iv>0;bossHit(e,dm);
    if(!iv&&hero.hp>0){if(o.kb){const dx=pl.position.x-an.x,dz=pl.position.z-an.z,l=Math.hypot(dx,dz)||1,q=vh205HeroIn(pl.position.clone().add(new THREE.Vector3(dx/l*o.kb,0,dz/l*o.kb)));
        pl.step={x:(q.x-pl.position.x)/(o.kb||1),z:(q.z-pl.position.z)/(o.kb||1),t:.22,sp:(o.kb||1)/.22}}
      if(o.on)try{o.on()}catch(err){console.error('vh on hit',err)}}}
  return hit}
// ---------------- the debuffs ----------------
var VH205B={n:0,t:0,tk:0,e:null};   // Hemorrhage: stacks and their timer
function vh205Bleed(e,n){if(hero.hp<=0||hero.iv>0)return;VH205B.n=Math.min(3,VH205B.n+(n||1));VH205B.t=6;VH205B.e=e;dqDebuff('Hemorrhage','🩸',{},6000,'Hemorrhage ×'+VH205B.n+': bleeding');popT(pl.position,'HEMORRHAGE ×'+VH205B.n,'#ff6a6a');svSnd('blood',.8,.9)}
function vh205BleedTick(dt){const B=VH205B;if(B.n<=0)return;B.t-=dt;if(B.t<=0||hero.hp<=0){B.n=0;return}B.tk-=dt;if(B.tk<=0){B.tk=1;const e=B.e;if(e&&!e.dead&&!(hero.iv>0)&&!(typeof AWD!='undefined'&&AWD.dead)){hitHero(e,.045*B.n,'p');burst(gY(pl.position,1),0xb01020,6+B.n*3,.5,.7,.5)}}}
function vh205Pin(){if(hero.hp<=0||hero.iv>0)return false;dqDebuff('Pinned','🦷',{mspd:-1},1500,'Pinned in his jaws: dash to tear free');popT(pl.position,'PINNED','#ff8080',true);svSnd('squelch',1,.6);return true}
function vh205Pinned(){return hero.buffs.some(b=>b&&b.n==='Pinned')}
function vh205Deaf(){if(hero.hp<=0||hero.iv>0)return;dqDebuff('Deafened','🦇',{mspd:-.4},2500,'Deafened: −40% move speed');popT(pl.position,'DEAFENED','#e0b0ff')}
// a dash tears you out of his jaws
{const f=dodge;dodge=function(){const b=hero.buffs.findIndex(q=>q&&q.n==='Pinned');if(b>=0){hero.buffs.splice(b,1);try{hsDirty()}catch(_){}try{if(VH205.e&&VH205.e.sv&&VH205.e.sv.mv&&VH205.e.sv.mv.an)VH205.e.sv.mv.an.free=1}catch(_){}popT(pl.position,'TORN FREE','#ffd8a0')}return f.apply(this,arguments)}}
// ---------------- effects ----------------
var VH205X={m:{}};
function vh205BloodMat(){return VH205X.m.b||(VH205X.m.b=new THREE.MeshStandardMaterial({color:0x5a0a12,roughness:.3,metalness:.1,flatShading:true}))}
// a pool of blood that opens a wound if you stand in it (one stack a second)
function vh205Pool(e,p,r,ms){if(!VH205A||!VH205A.f)return;const q=vh205Clamp(p.clone(),.3),y=GH(q.x,q.z);svDecal(q,0x5a0a12,r,(ms||5000)/1000,.75);let t=0,tk=.3;
  const m=new THREE.Mesh(svG('vh_pool',()=>new THREE.CircleGeometry(1,18).rotateX(-Math.PI/2)),new THREE.MeshStandardMaterial({color:0x4a0610,roughness:.15,metalness:.2,transparent:true,opacity:.85,polygonOffset:true,polygonOffsetFactor:-3}));
  m.position.set(q.x,y+.05,q.z);m.scale.setScalar(.1);m.userData.lpsSkip=1;scene.add(m);
  kqFx({tick(dt){t+=dt||0;const T=(ms||5000)/1000;m.scale.setScalar(r*Math.min(1,t/.3));if(t>T-.6)m.material.opacity=.85*Math.max(0,(T-t)/.6);tk-=dt||0;
      if(tk<=0&&hero.hp>0&&VH205A&&VH205A.f&&Math.hypot(pl.position.x-q.x,pl.position.z-q.z)<r){tk=1;vh205Bleed(e,1)}if(Math.random()<.05)burst(new THREE.Vector3(q.x+(Math.random()-.5)*r,y+.1,q.z+(Math.random()-.5)*r),0x8a0a14,1,.2,.5,.4);return t<T},
    end(){scene.remove(m);m.material.dispose()}})}
// a crash where he lands: a shockwave, blood thrown up, cracks in the flagstones
function vh205Crash(p,r,pool,e){svShock(p,VH205M.col,r,.4);burst(gY(p,.3),0x8a0a14,40,r*.9,2.4,.7);svDecal(p,0x3a0a10,r*.8,3,.5);try{sk146Crack(p,0xb01020,r*.9,1.8);sk146Drops(gY(p,.6),0x6a0a14,10,3,4)}catch(_){}shake(.3);svSnd('heavy',1.15,.75);if(pool&&e)vh205Pool(e,p,pool,5200)}
// a gout of blood from a to b (a glob trailing drops) that leaves a pool
function vh205Gout(e,a,b,T){const o=new THREE.Mesh(svG('vh_gout',()=>svLump(.3,1,.3,2151)),vh205BloodMat());o.userData.lpsSkip=1;svShot(a,b,T,0x8a0a14,1.1,2.2,()=>{burst(gY(b,.3),0x8a0a14,24,1.6,1.6,.6);vh205Pool(e,b,1.7,5600)},o);return o}
// where the hero will be (lead seconds ahead), inside the arena
function vh205Aim(c,lead){const v=c.S.hv||{x:0,z:0};return vh205HeroIn(new THREE.Vector3(pl.position.x+v.x*lead,0,pl.position.z+v.z*lead))}
// claw trails and the sound of them
const VH205_TR=(t0,t1)=>[t0,t1,'wrR',[0,-.2,.3],[0,-.45,.65],0xff3a4a,.16];
const VH205_TL=(t0,t1)=>[t0,t1,'wrL',[0,-.2,.3],[0,-.45,.65],0xff3a4a,.16];
const VH205_NO141=D=>{D._h141=null;return D};
// claws that land open a wound
const VH205_CLAW=(c)=>{vh205Bleed(c.e,1)};
// ---------------- the moves ----------------
var VH205MV={
  // he wakes, tears his chain from the gate and roars (the controller plays the waking before this)
  intro:VH205_NO141({dur:3.6,inv:[0,3.6],armor:1,trn:[[0,3.6,1.6]],trk:[[.5,'crouch','io'],[1.1,'crouch','l',.02],[1.5,'roar','o'],[3.0,'roar','l',.03],[3.6,'rec','io']],
    ev:[[1.5,c=>{svSnd('roar',1.25,.5);svSnd('shriek',.6,.6);shake(.5);svShock(c.m.position,VH205M.col,10,.8);burst(gY(c.m.position,3),0x8a0a14,70,6,3,1.1);c.S.chgT=1}],[3.0,c=>{c.S.chgT=0}]]}),
  // Rending Claws (Phase I): right, left, the rearing double slam on a line
  rend:VH205_NO141({wt:10,cd:2.6,r:[0,5.8],a:'f',mel:1,dur:2.9,lock:.42,trn:[[0,.42,4.4],[.9,1.05,4.4],[1.45,1.75,3.2]],
    trk:[[.42,'rUp','io'],[.58,'rUp','l',.012],[.72,'rHit','s'],[.94,'rHit','l'],[1.08,'lUp','io'],[1.2,'lHit','s'],[1.5,'xUp','io'],[1.9,'xUp','l',.02],[2.05,'xHit','s'],[2.45,'rec','io'],[2.9,'rec','l']],
    rm:[[.6,.72,.8,'o'],[1.1,1.22,.5,'o'],[1.92,2.05,1.4,'o']],
    hit:[{t:.71,s:{k:'a',r:5.0,h:1.1},f:.3,dm:.95,on:VH205_CLAW},{t:1.19,s:{k:'a',r:4.6,h:1.0},f:.3,ay:.4,dm:.8,kb:1.5,on:VH205_CLAW},
      {t:2.05,s:{k:'l',w:2.8,l:6.5,b:0},f:.4,dm:1.4,w:.5,on:VH205_CLAW,fx:c=>{vh205Crash(c.at(3.2),3.0,1.6,c.e)}}],
    tr:[VH205_TR(.62,.78),VH205_TL(1.1,1.26),VH205_TR(1.96,2.08),VH205_TL(1.96,2.08)],
    ev:[[.6,c=>svSnd('swing',.9,.85)],[1.1,c=>svSnd('swing',.85,1.05)],[1.52,c=>{svSnd('roar',.55,1.0);c.S.chgT=.6}],[1.95,c=>{svSnd('whoosh',1.1,.7);c.S.chgT=0}]],
    nx:[['pounce',.25,13],['buffet',.3,6.5]],rec:.3}),
  // Pounce: crouch, leap onto where you will be, crash
  pounce:VH205_NO141({wt:9,cd:6,r:[4,15],a:'f',armor:1,dur:2.5,lock:.75,trn:[[0,.8,4]],
    trk:[[.45,'crouch','io'],[.78,'crouch','l',.025],[.95,'air','o'],[1.35,'air','l'],[1.5,'land','s'],[2.1,'land','l'],[2.5,'rec','io']],
    rm:[[.85,1.5,'tgt','io',1.6,16]],
    hit:[{t:1.5,s:{k:'c',r:3.0},o:c=>{const p=vh205Aim(c,.55);c.M.an.tg=p;return {x:p.x,z:p.z,a:0}},dm:1.35,w:.85,kb:3,on:VH205_CLAW,fx:(c,an)=>vh205Crash(new THREE.Vector3(an.x,0,an.z),3.6,1.4,c.e)}],
    ev:[[.4,c=>{svSnd('roar',.7,.9);c.S.chgT=.8}],[.9,c=>{svSnd('whoosh',1.2,.6);c.S.chgT=0;burst(gY(c.m.position,.3),0x8a0a14,20,2,1.4,.6)}]],rec:.35}),
  // Wing Buffet: wings open, a full turn (only from behind or the side)
  buffet:VH205_NO141({wt:(e,L,side)=>side==='b'?14:side==='s'?7:0,cd:5.5,r:[0,6.6],a:'sb',dur:2.1,lock:.5,trn:[[0,.5,2.4]],
    trk:[[.5,'spW','io'],[.85,'spW','l',.015],[.98,'spGo','s'],[1.45,'spGo','l'],[2.1,'rec','io']],
    hit:[{t:1.1,s:{k:'r',r0:1.8,r:6.4},dm:1.1,kb:4,w:.82,fx:c=>{svShock(c.m.position,VH205M.col,6.6,.4);burst(gY(c.m.position,1),0x2a0a10,60,5.5,1,.6);try{sk146Swarm(gY(c.m.position,1.4),gY(c.m.position,3),14,0x1a0a10,'bat',.9,{spread:6})}catch(_){}svSnd('whoosh',1.25,.55)}}],
    ev:[[.4,c=>{svSnd('shriek',.5,1.2);c.S.chgT=.5}],[1.5,c=>{c.S.chgT=0}]],
    tk(c,dt){const M=c.M;if(c.t>=.98&&c.t<=1.42){if(M.an.y0==null)M.an.y0=c.m.rotation.y;const k=svEase.io(Math.min(1,(c.t-.98)/.44));c.m.rotation.y=M.an.y0+k*Math.PI*2}else if(c.t>1.42&&M.an.y0!=null){c.m.rotation.y=M.an.y0;M.an.y0=null}},
    end(c){if(c.M.an.y0!=null)c.m.rotation.y=c.M.an.y0;c.S.chgT=0},rec:.35}),
  // Gore Spew: three gouts aimed ahead of you
  spew:VH205_NO141({wt:8,cd:7,r:[3,30],a:'any',dur:2.6,lock:1.0,trn:[[0,1.05,3]],
    trk:[[.5,'gulp','io'],[1.0,'gulp','l',.02],[1.15,'spew','s'],[2.1,'spew','l',.01],[2.6,'rec','io']],
    hit:[1.3,1.5,1.7].map((t,i)=>({t,s:{k:'c',r:1.6},o:c=>{const p=vh205Aim(c,.6+i*.15),a=Math.atan2(p.x-c.m.position.x,p.z-c.m.position.z),off=(i-1)*1.8;return {x:p.x+Math.cos(a)*off,z:p.z-Math.sin(a)*off,a:0}},w:.8,dm:.75,on:VH205_CLAW})),
    ev:[[.5,c=>{svSnd('squelch',.9,.6);c.S.chgT=.7}],[1.15,c=>{svSnd('splash',1,.6);c.S.chgT=0;for(let i=0;i<3;i++){const an=c.M.an['h'+i]||svAnchor(c.e,VH205MV.spew.hit[i],c);const a=svWP(c.e,'jaw',0,0,.5),b=new THREE.Vector3(an.x,GH(an.x,an.z)+.2,an.z);vh205Gout(c.e,a,b,.15+i*.2)}}]],rec:.35}),
  // Night Screech: a cone of sound, three pulses
  screech:VH205_NO141({wt:(e,L)=>L>7?9:3,cd:7.5,r:[5,30],a:'f',dur:2.8,lock:1.0,trn:[[0,1.0,3]],
    trk:[[.5,'scr','io'],[1.0,'scr','l',.03],[2.4,'scr','l',.04],[2.8,'rec','io']],
    hit:[1.1,1.5,1.9].map((t,i)=>({t,s:{k:'a',r0:i*3.5,r:5+i*4.5,h:.55},dm:.55,w:i?.3:.9,on:()=>vh205Deaf(),fx:c=>{const p=c.wp('head',0,0,.6);for(let k=0;k<3;k++)svShock(gY(c.m.position,.1),0xe0a0ff,5+i*4.5,.3+k*.05);burst(p,0xe0b0ff,20,1.5,.4,.4)}})),
    ev:[[1.05,c=>{svSnd('shriek',1.2,.7);svSnd('shriek',.8,1.1);shake(.2);c.S.chgT=1}],[2.3,c=>{c.S.chgT=0}]],rec:.35}),
  // Feeding Bite: a lunging snap; caught, pinned and drunk from
  bite:VH205_NO141({wt:(e,L)=>L<4.5?9:2,cd:8,r:[0,5.2],a:'any',dur:1.6,lock:.55,trn:[[0,.55,4.5]],
    trk:[[.4,'bOpen','io'],[.62,'bOpen','l',.015],[.75,'bSnap','s'],[1.05,'bSnap','l'],[1.6,'rec','io']],
    rm:[[.62,.78,1.4,'o']],
    hit:[{t:.76,s:{k:'a',r:3.6,h:.55},f:.4,dm:.85,w:.35,on:null}],
    ev:[[.35,c=>{svSnd('hiss',.8,.6);c.S.chgT=.5}],[.75,c=>{svSnd('crack',.7,1.4);c.S.chgT=0}]],
    end(c){c.S.chgT=0},rec:.4}),
  // caught in the bite: he holds you at his jaws and drinks (cast from the bite when it lands; a dash tears you free)
  feed:VH205_NO141({dur:2.6,armor:1,trk:[[.25,'drink','io'],[2.2,'drink','l',.02],[2.6,'rec','io']],
    tk(c,dt){const an=c.M.an;if(an.free||hero.hp<=0||!vh205Pinned()){if(!an.out){an.out=1;c.S.tt=c.M.t=Math.max(c.M.t,2.25)}return}
      const j=c.wp('jaw',0,0,.7);pl.position.x+=(j.x-pl.position.x)*Math.min(1,dt*10);pl.position.z+=(j.z-pl.position.z)*Math.min(1,dt*10);an.dt=(an.dt||0)-dt;
      if(an.dt<=0){an.dt=.4;hitHero(c.e,.18,'p');try{sk146Heal(c.e,.01,0xff4a4a)}catch(_){}burst(gY(pl.position,1),0xb01020,10,.6,.8,.4)}
      if(Math.random()<.6)burst(gY(pl.position,1).lerp(j,Math.random()),0xff2030,1,.1,.1,.3)},rec:.5}),
  // ---------------- Phase II ----------------
  awaken:VH205_NO141({dur:4.0,inv:[0,4.0],armor:1,trn:[[0,3.8,1.2]],trk:[[.6,'crouch','io'],[1.3,'crouch','l',.03],[1.6,'roar','o'],[3.4,'roar','l',.035],[4.0,'rec','io']],
    hit:[{t:1.65,s:{k:'c',r:7},dm:.55,kb:6,w:1.2,fx:c=>{vh205Crash(c.m.position,7,0)}}],
    ev:[[.05,c=>{cq205Card('Vharog · Phase II','The Hunger Wakes','The blood moon rises; the mist closes in','Watch the sky for the bats');svSnd('roar',.8,.6);c.S.chgT=1.2}],
      [1.65,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.chgT=0;try{flash('rgba(200,20,40,.3)')}catch(_){}svSnd('roar',1.3,.45);svSnd('shriek',.9,.6);shake(.6);try{vh205Storm(true)}catch(err){console.error('vh storm',err)}}]]}),
  // Frenzy: four claws and a pounce
  fury:VH205_NO141({wt:9,cd:3.8,ph:2,r:[0,5.8],a:'f',mel:1,dur:3.7,lock:.3,trn:[[0,.3,4.4],[.6,.7,4.4],[.98,1.08,4.4],[1.36,1.46,4.4],[1.85,2.15,3.4]],
    trk:[[.28,'rUp','io'],[.42,'rHit','s'],[.6,'lUp','io'],[.74,'lHit','s'],[.96,'rUp','io'],[1.1,'rHit','s'],[1.28,'lUp','io'],[1.44,'lHit','s'],[1.7,'crouch','io'],[1.95,'air','o'],[2.35,'land','s'],[3.1,'rec','io'],[3.7,'rec','l']],
    rm:[[.36,.44,.6,'o'],[.68,.76,.5,'o'],[1.04,1.12,.6,'o'],[1.38,1.46,.5,'o'],[1.9,2.35,'tgt','io',1.4,8]],
    hit:[{t:.42,s:{k:'a',r:5.0,h:1.1},f:.3,dm:.8,on:VH205_CLAW},{t:.74,s:{k:'a',r:4.6,h:1.0},f:.3,dm:.7,on:VH205_CLAW},{t:1.1,s:{k:'a',r:5.0,h:1.1},f:.3,dm:.8,on:VH205_CLAW},{t:1.44,s:{k:'a',r:4.6,h:1.0},f:.3,dm:.7,kb:1.5,on:VH205_CLAW},
      {t:2.35,s:{k:'c',r:3.2},o:'tgt',dm:1.4,w:.55,on:VH205_CLAW,fx:(c,an)=>vh205Crash(new THREE.Vector3(an.x,0,an.z),4,1.6,c.e)}],
    tr:[VH205_TR(.34,.46),VH205_TL(.66,.78),VH205_TR(1.02,1.14),VH205_TL(1.36,1.48)],
    ev:[[.34,c=>svSnd('swing',.85,.85)],[.66,c=>svSnd('swing',.8,1.05)],[1.02,c=>svSnd('swing',.85,.9)],[1.36,c=>svSnd('swing',.8,1.1)],[1.9,c=>{svSnd('roar',.8,.85);svSnd('whoosh',1.1,.65)}]],rec:.4}),
  // Double Pounce: onto you, a turn, and again
  pounce2:VH205_NO141({wt:9,cd:9,ph:2,r:[3,16],a:'f',armor:1,dur:4.3,lock:.75,trn:[[0,.8,4],[2.1,2.55,6]],
    trk:[[.45,'crouch','io'],[.75,'crouch','l',.025],[.9,'air','o'],[1.3,'air','l'],[1.45,'land','s'],[2.1,'crouch','io'],[2.55,'air','o'],[2.95,'air','l'],[3.1,'land','s'],[3.7,'land','l'],[4.3,'rec','io']],
    rm:[[.8,1.45,'tgt','io',1.6,16],[2.45,3.1,'tgt','io',1.6,16]],
    hit:[{t:1.45,s:{k:'c',r:3.0},o:c=>{const p=vh205Aim(c,.5);return {x:p.x,z:p.z,a:0}},dm:1.2,w:.8,kb:3,on:VH205_CLAW,fx:(c,an)=>vh205Crash(new THREE.Vector3(an.x,0,an.z),3.6,1.3,c.e)},
      {t:3.1,s:{k:'c',r:3.0},o:c=>{const p=vh205Aim(c,.5);return {x:p.x,z:p.z,a:0}},dm:1.3,w:.7,kb:3,on:VH205_CLAW,fx:(c,an)=>vh205Crash(new THREE.Vector3(an.x,0,an.z),3.6,1.3,c.e)}],
    ev:[[.4,c=>svSnd('roar',.7,.9)],[.9,c=>svSnd('whoosh',1.2,.6)],[2.5,c=>{svSnd('roar',.6,1);svSnd('whoosh',1.2,.65)}]],rec:.4}),
  // Bat Storm: three lanes across the arena, bats sweep them one after another
  bats:VH205_NO141({wt:8,cd:10,ph:2,r:[0,40],a:'any',armor:1,dur:3.4,lock:.6,trn:[[0,.6,3]],
    trk:[[.5,'scr','io'],[.9,'scr','l',.03],[2.8,'scr','l',.03],[3.4,'rec','io']],
    hit:[0,1,2].map(i=>({t:1.6+i*.45,s:{k:'l',w:3.2,l:26,b:0},o:c=>{const A=VH205A,P=c.M.an.bp||(c.M.an.bp=pl.position.clone()),a0=c.M.an.ba!=null?c.M.an.ba:(c.M.an.ba=c.rnd()*Math.PI),a=a0+i*Math.PI/3,off=(i-1)*3.2,
        cx=P.x+Math.cos(a)*off,cz=P.z-Math.sin(a)*off;return {x:cx-Math.sin(a)*13,z:cz-Math.cos(a)*13,a}},w:1.0,dm:.85,on:VH205_CLAW,fx:(c,an)=>{const a=new THREE.Vector3(an.x,GH(an.x,an.z)+1.4,an.z),b=new THREE.Vector3(an.x+Math.sin(an.a)*26,a.y,an.z+Math.cos(an.a)*26);try{sk146Swarm(a,b,26,0x1a0a10,'bat',.7,{spread:1.2})}catch(_){}svSnd('shriek',.8,1.2)}})),
    ev:[[.9,c=>{svSnd('shriek',1.1,.6);c.S.chgT=1;say('🦇 Bats pour out of the dark — get out of their lanes!')}],[2.8,c=>{c.S.chgT=0}]],rec:.4}),
  // Night Hunt: he leaps into the dark (the controller runs the hunt and the ballistae)
  hunt:VH205_NO141({wt:(e,L)=>e.sv.hN?12:30,cd:28,ph:2,r:[0,40],a:'any',armor:1,dur:2.2,inv:[0,2.2],trn:[[0,.6,3]],
    trk:[[.35,'crouch','io'],[.8,'crouch','l',.03],[1.0,'leapUp','o'],[2.2,'leapUp','l']],
    ev:[[.35,c=>{svSnd('roar',1.1,.55);c.S.chgT=1}],[1.0,c=>{svSnd('whoosh',1.3,.5);shake(.3);burst(gY(c.m.position,.6),0x8a0a14,50,3,2,.8)}],[2.15,c=>{try{vh205HuntStart(c.e)}catch(err){console.error('vh hunt',err)}}]]}),
  // circling in the dark (cast by the controller; ends when he is chained or the hunt runs out)
  prowl:VH205_NO141({dur:20,inv:[0,20],armor:1,trk:[[.1,'lunge','l']],tk(c,dt){try{vh205Prowl(c,dt)}catch(err){console.error('vh prowl',err)}}}),
  // the hunt ran out: he drops on you, feeds, the Crimson Howl (cast by the controller)
  hfail:VH205_NO141({dur:4.6,armor:1,inv:[0,4.6],trk:[[.1,'air','l'],[.6,'land','s'],[1.6,'drink','io'],[2.6,'drink','l',.02],[3.0,'roar','o'],[4.0,'roar','l',.03],[4.6,'rec','io']],
    hit:[{t:.6,s:{k:'c',r:3.4},o:c=>{const p=vh205HeroIn(pl.position.clone());return {x:p.x,z:p.z,a:0}},dm:1.6,w:.55,kb:2,on:VH205_CLAW}],
    go(c){c.e.m.visible=true;try{vh205HuntClear()}catch(_){}const p=vh205HeroIn(pl.position.clone());c.m.position.x=p.x+.8;c.m.position.z=p.z+.8},
    ev:[[.6,c=>vh205Crash(c.m.position.clone(),3.6,1.6,c.e)],[1.7,c=>{svSnd('squelch',1,.5);try{sk146Heal(c.e,.12,0xff4a4a)}catch(_){}}],[3.0,c=>{svSnd('roar',1.2,.5);try{sk146RingWave(c.e,c.m.position.clone(),1.5,12,1.4,1.2,1.0,0xff2030);cq205After(.8,()=>{if(!c.e.dead)sk146RingWave(c.e,c.e.m.position.clone(),1.5,12,1.4,1.2,1.0,0xff2030)})}catch(err){console.error('vh howl',err)}}]]}),
  // chained by three harpoons: a long stagger
  broken:VH205_NO141({dur:5.0,trk:[[.05,'land','l'],[.6,'chained','o'],[4.4,'chained','l',.035],[5.0,'rec','io']],
    go(c){c.e.m.visible=true;VH205.H=null;VH205.cr=null;c.S.stg=5;c.S.dr=0;c.S.hunt=0;svSnd('stag',1.2,.7);svSnd('roar',.9,.4);popT(c.m.position,'CHAINED','#e8e8ff',true);burst(gY(c.m.position,2),0xd8d8ff,80,4,3,.9);svShock(c.m.position,0xd8d8ff,6,.6)},
    tk(c,dt){c.S.stg=Math.max(0,5-c.t);if(Math.random()<dt*8){const p=svWP(c.e,'neck',0,0,0);burst(p,0xe8e8ff,1,.5,.6,.5)}},end(c){c.S.stg=0;try{vh205ChainsOff()}catch(_){}}})};
VH205MV.rend.ph1only=1;
// the moves' hit flags: bite catches you (pinned) when it lands
VH205MV.bite.hit[0].fx=(c,an,hit)=>{if(hit&&(typeof vh180Auth!='function'||vh180Auth())&&vh205Pin())cq205After(0,()=>{if(!c.e.dead&&c.e.sv&&c.e.sv.mv&&c.e.sv.mv.id==='bite')svCast(c.e,'feed')})};
// the hits' on-callbacks receive (c, an) from the engine
for(const id in VH205MV){const D=VH205MV[id];(D.hit||[]).forEach(h=>{if(h.on===VH205_CLAW){h.on=(c)=>VH205_CLAW(c)}})}
