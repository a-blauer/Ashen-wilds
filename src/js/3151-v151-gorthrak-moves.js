// ================= v151 Gorthrak the Glacierback — the moves (Sovereign move format, v110 engine) and the engine glue =================
// Like Vorraxis (3032) he runs on the v110 timeline engine but not in a Sovereign den: the Frozen Maw (3152) is his arena, and two
// small wrappers point the engine at it (svCtx: the cave's clamp and hit test; svHitNow: hits without the den flag). He never sets
// e.ar (his death is not a Sovereign defeat) and e.boss keeps him local in co-op (each player fights their own copy).
// Theme: a brute warlord of the glacier. Everything he does is weight and cold: a maul of glacier ice, a fist crusted in rime,
// charges that shake the cave, ice torn out of the floor and the ceiling brought down on you.
// Frostbite (his debuff): every frost hit adds a stack (shown on the hero); the third stack freezes you solid for 1.3 s (dash out).
// The stacks fade 7 s after the last one. (v168: the ice pillars are gone. The owner: "I don't like the mechanic of making him charge
// into the ice pillars. It's too easy and kind of a slog." Kiting him into objects is replaced by reading his leaps and getting
// behind him: see Rimelock below. Phase I's charge teaches it.)
// Pattern (learnable; cooldowns, no repeats, combo strings):
//  close, front ── Skullbreaker: a diagonal maul smash, a Rime Fist backhand, a pause… then both hands up and an overhead slam
//                  down a line (late: it punishes an early dodge).
//  mid, front   ── Glacier Charge: drops his shoulder and fixes on you (the lane shows where he will run), then runs straight
//                  through; frost patches on his path. Sidestep it and he overruns and skids, driving his maul into the floor to
//                  stop: STUCK for a moment, the crack in his back glows and the ground behind him lights gold (hits from
//                  behind ×1.5). That is Rimelock, taught before it matters.
//  behind/side  ── Wrecking Whirl: winds the maul out behind him and spins a full turn: a ring around him (hug him, or be far out).
//  any          ── Cave-in Roar: beats his chest and roars at the ceiling; four icicles fall on you, each aimed ahead of you.
//  far, front   ── Glacier Hurl: tears a boulder of ice out of the floor and lobs it at you; it bursts into shards.
//  close, any   ── Permafrost Slam: both fists into the floor: a close blast… then ice spikes erupt in a ring further out.
//                  Get out, then step back in.
//  Phase II (55%) "Glacial Fury": a roar, the glacier on his back flares, the Maw groans and icicles keep falling from the ceiling
//                  for the rest of the fight (3152). He rests less and gains Warlord's Fury (smash, backhand, smash, uppercut and a
//                  leaping slam), Avalanche Hurl (three boulders), Icefall Storm (a ring of icicles closing on you) and the signature:
//  Glacier Shell (v168, was the pillar Rampage): he armours himself in glacier ice (85% less damage, his troll blood heals him)
//                  and leaps at you three times. Each leap: he crouches and fixes on you (a ring marks where he lands: get out of
//                  it), lands with a blast, and his maul freezes into the floor: RIMELOCKED for ~2 s. The glacier on his back
//                  cracks open and glows, the ground behind him lights gold, and ice shards burst out in FRONT of him: get round
//                  behind him and strike the glowing crack twice to crack the shell. Three cracks and the shell bursts:
//                  SHATTERED, a long stagger. Fewer and the shell holds: he heals, and the ceiling comes down (Avalanche): only
//                  the three rock shelters at the cave wall are safe.
// Weakness: posture (the yellow bar); every break staggers him (+35% damage). Big moves have armour.
var GB151A=null;   // the cave arena while he exists: {cx, cz, r (his reach), hr (the hero's), y, f (fight on)}
{const f=svCtx;svCtx=function(e){const c=f.apply(this,arguments);if(e&&e.gb151){c.A=GB151A;c.inA=(p,mg)=>gb151Clamp(p,mg==null?1.2:mg);c.hit=(s,an,dm,o)=>gb151HitNow(e,s,an,dm,o||{})}return c}}
{const f=svHitNow;svHitNow=function(e,s,an,dm,o){if(e&&e.gb151)return gb151HitNow(e,s,an,dm,o||{});return f.apply(this,arguments)}}
function gb151Clamp(p,mg){const A=GB151A;if(!A)return p;const dx=p.x-A.cx,dz=p.z-A.cz,d=Math.hypot(dx,dz),lim=A.r-(mg||0);if(d>lim){p.x=A.cx+dx/d*lim;p.z=A.cz+dz/d*lim}return p}
function gb151HeroIn(p){const A=GB151A;if(!A)return p;const dx=p.x-A.cx,dz=p.z-A.cz,d=Math.hypot(dx,dz);if(d>A.hr){p.x=A.cx+dx/d*A.hr;p.z=A.cz+dz/d*A.hr}return p}
function gb151HitNow(e,s,an,dm,o){if(!GB151A||!GB151A.f||e.dead)return false;let hit=false;if(o.flash!==false)svFlash(s,an,o.col||GB151.col,o.fms);
  if(hero.hp>0&&svIn(s,an,pl.position,o.pad)){hit=true;SVX.st.hits++;if(o.pre)try{o.pre()}catch(_){}const iv=hero.iv>0;bossHit(e,dm);
    if(!iv&&hero.hp>0){if(o.kb){const dx=pl.position.x-an.x,dz=pl.position.z-an.z,l=Math.hypot(dx,dz)||1,q=gb151HeroIn(pl.position.clone().add(new THREE.Vector3(dx/l*o.kb,0,dz/l*o.kb)));
        pl.step={x:(q.x-pl.position.x)/(o.kb||1),z:(q.z-pl.position.z)/(o.kb||1),t:.22,sp:(o.kb||1)/.22}}
      if(o.fr)gb151Frost(o.fr);if(o.on)try{o.on()}catch(err){console.error('gb on hit',err)}}}
  return hit}
// ---------------- Frostbite: stacks on the hero; three freeze you solid ----------------
var GB151X={fb:0,fbT:0,frz:0,m:{}};
const GB151_CHILL=['Chilled','❄️',{mspd:-.25},'Chilled: −25% move speed'];
function gb151FbSet(n){hero.buffs=hero.buffs.filter(b=>!(b&&typeof b.n=='string'&&b.n.startsWith('Frostbite')));GB151X.fb=n;
  if(n>0)hero.buffs.push({n:'Frostbite '+n+'/3',i:'🥶',s:{mspd:-.07*n},t:nowP()+7000,d:'Frostbite: '+n+' of 3 stacks · the third freezes you solid'});try{hsDirty()}catch(_){}}
function gb151Frost(k){if(hero.hp<=0||hero.iv>0)return;const n=Math.min(3,GB151X.fb+(k||1));GB151X.fbT=nowP()+7000;
  if(n>=3){gb151FbSet(0);gb151Freeze();return}gb151FbSet(n);dn(pl.position,'Frostbite '+n+'/3','#bfe8ff',-30,900)}
function gb151Freeze(){dqDebuff('Frozen Solid','🧊',{mspd:-1},1300,'Frozen solid by Frostbite (dash out)');popT(pl.position,'FROZEN SOLID','#bfe8ff',true);svSnd('crack',1,1.2);
  const m=GB151X.m.blk||(GB151X.m.blk=new THREE.MeshStandardMaterial({color:0xbfe8ff,emissive:0x3a8ac8,emissiveIntensity:.5,roughness:.1,metalness:.1,transparent:true,opacity:.55,depthWrite:false,flatShading:true}));
  const g=new THREE.Mesh(svG('gb_frz',()=>svLump(.9,1,.25,171)),m);g.scale.set(.8,1.25,.8);g.position.copy(gY(pl.position,.95));g.userData.lpsSkip=1;scene.add(g);let t=0;GB151X.frz=1;
  burst(gY(pl.position,1),0xd8f4ff,30,1.5,1.5,.6);
  kqFx({tick(dt){t+=dt||0;g.position.copy(gY(pl.position,.95));const out=!hero.buffs.some(b=>b.n==='Frozen Solid');return t<1.3&&!out},end(){scene.remove(g);GB151X.frz=0;burst(gY(pl.position,1),0xd8f4ff,40,2.2,1.5,.6);svSnd('crack',.8,1.5)}})}
function gb151FrostTick(){if(GB151X.fb>0&&nowP()>GB151X.fbT)gb151FbSet(0)}
// ---------------- effects ----------------
function gb151IceMat(){return GB151X.m.ice||(GB151X.m.ice=new THREE.MeshStandardMaterial({color:0xa8dcff,emissive:0x2a6aa8,emissiveIntensity:.55,roughness:.1,metalness:.15,transparent:true,opacity:.9,flatShading:true}))}
function gb151RockMat(){return GB151X.m.rock||(GB151X.m.rock=new THREE.MeshStandardMaterial({color:0x4a4e56,roughness:.9,flatShading:true}))}
function gb151Pool(e,p,r,ms){if(!GB151A||!GB151A.f)return;const q=gb151Clamp(p.clone(),.3);s6Pool(e,q,r,0x9ad8ff,ms||3200,.08,GB151_CHILL)}
// a shatter of ice where something lands: spikes, chunks, a crack, frost
function gb151Shatter(p,s){s=s||1;for(let k=0;k<6;k++){const a=k/6*6.283+Math.random(),r=(.5+Math.random()*.7)*s;svSpike(new THREE.Vector3(p.x+Math.cos(a)*r,0,p.z+Math.sin(a)*r),gb151IceMat(),(.8+Math.random()*.6)*s,.2*s,1.1,.55)}
  try{sk146Debris(gY(p,.6),gb151IceMat(),6,.18*s,4,6,1.3)}catch(_){}burst(gY(p,.4),0xd8f4ff,30,2.4*s,3,.7);svDecal(p,0x8ac8ff,1.6*s,3,.5);try{sk146Crack(p,0x9ad8ff,1.8*s,1.8)}catch(_){}svShock(p,0xbfe8ff,2.2*s,.35)}
// an icicle falling from the ceiling onto p (the hit is the move's or the hazard's own)
function gb151Icicle(p,big,T){const s=big?1.5:1,y0=GH(p.x,p.z),o=new THREE.Mesh(svG('gb_icl',()=>{const q=new THREE.ConeGeometry(.42,2.6,6);q.rotateX(Math.PI);return q.toNonIndexed()}),gb151IceMat());
  o.scale.setScalar(s);o.position.set(p.x,y0+11,p.z);o.userData.lpsSkip=1;scene.add(o);let t=0;const D=T||.32;
  kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/D);o.position.y=y0+11-(11-1.3*s)*k*k;if(Math.random()<.6)burst(o.position,0xd8f4ff,1,.1,.2,.4);if(k>=1){gb151Shatter(p,s);shake(big?.3:.14);svSnd('crack',big?1.1:.8,big?.8:1.1);return false}return true},end(){scene.remove(o)}})}
// a boulder of ice lobbed from a to b; bursts into shards on landing
function gb151Boulder(a,b,T,onEnd){const o=new THREE.Group(),m1=new THREE.Mesh(svG('gb_bd',()=>svLump(.62,1,.25,181)),gb151IceMat()),m2=new THREE.Mesh(svG('gb_bd2',()=>svLump(.42,0,.35,182)),gb151RockMat());
  m2.position.set(.25,-.1,.2);o.add(m1,m2);o.userData.lpsSkip=1;svShot(a,b,T,0x9ad8ff,1,3.4,onEnd,o);return o}
// a short lane of ice shards flying outward from p along angle a (hits once; dm 0: only the look, the move's own hit does the damage)
function gb151Shards(c,p,a,L,dm){const e=c.e,N=7,st=L/N,sa=Math.sin(a),ca=Math.cos(a);let t=0,k=0,hit=false;
  kqFx({tick(dt){t+=dt||0;while(k<N&&t>=k*.04){const d=.8+k*st,x=p.x+sa*d,z=p.z+ca*d;k++;const A=GB151A;if(A&&Math.hypot(x-A.cx,z-A.cz)>A.r+.8){k=N;break}
      const q=new THREE.Vector3(x,0,z);svSpike(q,gb151IceMat(),.7+(k%2)*.3,.16,.8,.6);if(k%2)burst(gY(q,.3),0xd8f4ff,3,.8,1.2,.35);
      if(dm>0&&!hit&&!e.dead&&svIn({k:'c',r:.7},{x,z,a:0},pl.position,.25)){hit=true;gb151HitNow(e,{k:'c',r:99},{x,z,a:0},dm,{flash:false,fr:1})}}
    return k<N&&!e.dead},end(){}})}
// a ring of ice spikes erupting between r0 and r1 round p (Permafrost Slam's second beat)
function gb151SpikeRing(p,r0,r1){const n=Math.round(r1*4.2);for(let i=0;i<n;i++){const a=i/n*6.283+Math.random()*.1,r=r0+.4+Math.random()*(r1-r0-.6),q=new THREE.Vector3(p.x+Math.cos(a)*r,0,p.z+Math.sin(a)*r);
    if(GB151A&&Math.hypot(q.x-GB151A.cx,q.z-GB151A.cz)>GB151A.r+.6)continue;svSpike(q,gb151IceMat(),1.0+Math.random()*.9,.26,1.0,.4)}
  burst(gY(p,.5),0xd8f4ff,60,r1*.8,2,.7);svShock(p,0xbfe8ff,r1,.5);try{sk146Wall(p,0x9ad8ff,r1,2.2,.5)}catch(_){}}
// where the hero will be (lead seconds ahead), inside the cave
function gb151Aim(c,lead){const v=c.S.hv||{x:0,z:0};return gb151HeroIn(new THREE.Vector3(pl.position.x+v.x*lead,0,pl.position.z+v.z*lead))}
// trails along the maul head and the Rime Fist: [t0, t1, joint, a, b, colour, life]
const GB151_TR=(t0,t1)=>[t0,t1,'maul',[0,-1.9,0],[0,-2.75,0],0xbfe8ff,.18];
const GB151_TF=(t0,t1)=>[t0,t1,'wrL',[0,-.1,.1],[0,-.45,.25],0x9ad8ff,.14];
const GB151_NO141=D=>{D._h141=null;return D};
// a landing slam on p: shockwave, crack, debris, a frost patch
function gb151Slam(c,p,r,pool){svShock(p,GB151.col,r,.4);burst(gY(p,.3),0xd8f4ff,40,r*.9,2.4,.6);svDecal(p,0x8ac8ff,r*.8,3,.5);try{sk146Crack(p,0x9ad8ff,r*.9,1.8);sk146Debris(gY(p,.3),gb151RockMat(),5,.16,3.5,5,1.2)}catch(_){}
  shake(.3);svSnd('heavy',1.15,.85);if(pool)gb151Pool(c.e,p,pool,3200)}
// the charge: runs along the facing at sp tiles/s from t0 to t1; the wall stops it (stumble)
function gb151Run(c,dt,t0,t1,sp,rampage){const M=c.M,e=c.e;if(c.t<t0||M.an.stop)return;if(c.t>t1){M.an.stop=1;return}
  const a=c.m.rotation.y,d=sp*dt,x=c.m.position.x+Math.sin(a)*d,z=c.m.position.z+Math.cos(a)*d,A=GB151A;
  if(A&&Math.hypot(x-A.cx,z-A.cz)>A.r-1.6){M.an.stop=1;M.an.wall=1;shake(.25);svSnd('heavy',1,.7);burst(gY(c.m.position,.6),0x6a6e76,30,3,2,.6);return}
  c.m.position.x=x;c.m.position.z=z;e.sv.rmOn=1;
  if(!M.an.lp)M.an.lp=c.m.position.clone();if(c.m.position.distanceTo(M.an.lp)>1.6){M.an.lp=c.m.position.clone();gb151Pool(e,c.m.position.clone(),1.0,3800)}
  if(Math.random()<.7)burst(gY(c.m.position,.3),0xd8f4ff,3,1.5,1.4,.5);
  if(!M.an.hh&&hero.hp>0&&Math.hypot(pl.position.x-x,pl.position.z-z)<e.sv.body+.5){M.an.hh=1;gb151HitNow(e,{k:'c',r:99},{x,z,a},rampage?1.5:1.3,{flash:false,kb:4,fr:1})}}
// ---------------- the moves ----------------
var GB151M={
  intro:GB151_NO141({dur:3.6,inv:[0,3.6],armor:1,trn:[[0,3.6,1.5]],trk:[[.5,'beat','io'],[.8,'beat','l',.02],[1.0,'rec','o'],[1.25,'beat','o'],[1.55,'roar','o'],[3.0,'roar','l',.025],[3.6,'rec','io']],
    ev:[[.6,c=>{svSnd('heavy',.7,1.4);shake(.12)}],[1.3,c=>{svSnd('heavy',.7,1.3);shake(.12)}],[1.6,c=>{svSnd('roar',1.2,.6);svSnd('roar',.8,.85);shake(.45);svShock(c.m.position,GB151.col,9,.8);burst(gY(c.m.position,3),0xd8f4ff,60,5,3,1);c.S.chgT=.8}],[3.0,c=>{c.S.chgT=0}]]}),
  // Skullbreaker (Phase I): smash, backhand, the late overhead slam down a line
  combo:GB151_NO141({wt:10,cd:2.8,r:[0,5.6],a:'f',mel:1,dur:2.75,lock:.45,trn:[[0,.45,4.5],[.95,1.1,4.5],[1.5,1.72,3.4]],
    trk:[[.45,'smUp','io'],[.6,'smUp','l',.012],[.72,'smHit','s'],[.95,'smHit','l'],[1.12,'fUp','io'],[1.24,'fHit','s'],[1.5,'xUp','io'],[1.84,'xUp','l',.018],[1.98,'xHit','s'],[2.35,'rec','io'],[2.75,'rec','l']],
    rm:[[.62,.74,.8,'o'],[1.14,1.26,.5,'o'],[1.88,2.0,1.4,'o']],
    hit:[{t:.71,s:{k:'a',r:4.8,h:1.15},f:.3,dm:.95},{t:1.23,s:{k:'a',r:4.2,h:1.0},f:.3,ay:.5,dm:.8,kb:2},
      {t:1.98,s:{k:'l',w:2.6,l:6.2,b:0},f:.4,dm:1.4,w:.46,on:()=>gb151Frost(1),fx:c=>{const p=c.at(3);gb151Slam(c,p,3,1.3);gb151SpikeRing(p,0,2.2)}}],
    tr:[GB151_TR(.62,.78),GB151_TF(1.14,1.28),GB151_TR(1.88,2.04)],
    ev:[[.6,c=>svSnd('swing',.9,.85)],[1.14,c=>svSnd('swing',.8,1.1)],[1.55,c=>svSnd('roar',.5,1.1)],[1.9,c=>svSnd('whoosh',1.1,.75)],[.72,c=>{burst(c.wp('maul',0,-2.3,0),0xd8f4ff,20,2,1.5,.4);svSnd('heavy',.8,1.1);shake(.12)}]],
    nx:[['charge',.25,12],['spin',.3,6]],rec:.3}),
  // Glacier Charge: the run through you; frost patches; sidestepped, he skids and is stuck (Rimelock, the lesson)
  charge:GB151_NO141({wt:8,cd:6.5,r:[4,14],a:'f',armor:1,dur:2.4,lock:.5,trn:[[0,.5,4.2]],
    trk:[[.55,'chLow','io'],[.85,'chLow','l',.016],[.95,'chGo','s'],[1.7,'chGo','l'],[2.4,'rec','io']],
    hit:[{t:.95,s:{k:'l',w:2.8,l:11,b:0},nohit:1,w:.45}],
    ev:[[.3,c=>{svSnd('roar',.7,1.0);burst(gY(c.m.position,.3),0x6a6e76,14,2,1,.5)}],[.95,c=>{svSnd('whoosh',1.2,.7);shake(.15)}]],
    tk(c,dt){gb151Run(c,dt,.95,1.65,15,false);if(c.t>.95&&c.t<1.7&&Math.random()<dt*6)shake(.06);
      // v168: a run that missed you ends in a skid: his maul goes into the floor and he is stuck (co-op: the driver decides)
      const M=c.M;if(c.t>=1.68&&!M.an.sk){M.an.sk=1;if(!M.an.hh&&!M.an.wall&&gb180Auth()){svEndMove(c.e,true);svCast(c.e,'skid')}}},rec:.35}),
  // v168 the skid after a missed charge: the maul driven into the floor, stuck (Rimelock: hits from behind ×1.5)
  skid:GB151_NO141({dur:2.5,trk:[[.18,'stHit','o'],[.4,'stHit','l',.02],[1.9,'stHit','l',.035],[2.5,'rec','io']],
    go(c){gb151RlkOpen(c.e,1.75,false);burst(gY(c.m.position,.3),0xd8f4ff,40,2.6,1.6,.6);try{sk146Crack(c.at(1.4),0x9ad8ff,1.8,1.8)}catch(_){}svSnd('heavy',1.1,.8);svSnd('crack',.9,1.2);shake(.25)},
    tk(c,dt){c.S.rmOn=1},end(c){gb151RlkClose(c.e)}}),
  // Wrecking Whirl: a full turn with the maul out (only from behind or the side)
  spin:GB151_NO141({wt:(e,L,side)=>side==='b'?14:side==='s'?6:0,cd:5.5,r:[0,6.2],a:'sb',dur:2.15,lock:.5,trn:[[0,.5,2.4]],
    trk:[[.55,'spW','io'],[.86,'spW','l',.015],[1.0,'spGo','s'],[1.45,'spGo','l'],[2.15,'rec','io']],
    hit:[{t:1.12,s:{k:'r',r0:1.7,r:6.2},dm:1.15,kb:3.5,w:.82,fr:1,fx:c=>{svShock(c.m.position,GB151.col,6.4,.4);burst(gY(c.m.position,.8),0xd8f4ff,40,5,1,.5);svSnd('whoosh',1.2,.65);svSnd('heavy',.7,1.2)}}],
    tr:[GB151_TR(.98,1.42)],ev:[[.4,c=>svSnd('roar',.4,1.3)]],
    tk(c,dt){const M=c.M;if(c.t>=.98&&c.t<=1.42){if(M.an.y0==null)M.an.y0=c.m.rotation.y;const k=svEase.io(Math.min(1,(c.t-.98)/.44));c.m.rotation.y=M.an.y0+k*Math.PI*2}else if(c.t>1.42&&M.an.y0!=null){c.m.rotation.y=M.an.y0;M.an.y0=null}},
    end(c){if(c.M.an.y0!=null)c.m.rotation.y=c.M.an.y0},rec:.35}),
  // Cave-in Roar: four icicles from the ceiling, each aimed ahead of you
  icefall:GB151_NO141({wt:8,cd:7.5,r:[2.5,30],a:'any',armor:1,dur:3.1,lock:.9,trn:[[0,.9,3]],
    trk:[[.45,'beat','io'],[.7,'beat','l',.02],[.95,'roar','o'],[2.6,'roar','l',.02],[3.1,'rec','io']],
    hit:[1.6,1.9,2.2,2.5].map((t,i)=>({t,s:{k:'c',r:1.6},o:c=>{const p=gb151Aim(c,.5+i*.08);return {x:p.x,z:p.z,a:0}},w:.78,dm:1.0,fr:1,pre:(c,an)=>{},fx:()=>{}})),
    ev:[[.5,c=>{svSnd('heavy',.7,1.3)}],[.95,c=>{svSnd('roar',1.1,.7);shake(.3);for(let k=0;k<14;k++){const a=Math.random()*6.283,r=Math.random()*10;burst(new THREE.Vector3(GB151A.cx+Math.cos(a)*r,GB151A.y+7,GB151A.cz+Math.sin(a)*r),0xd8e8f0,3,.5,-2,1.2)}}]],rec:.4}),
  // Glacier Hurl: a boulder torn from the floor and lobbed at you (Phase II: Avalanche Hurl, three)
  hurl:GB151_NO141({wt:(e,L)=>L>7?9:3,cd:6.5,r:[5,30],a:'f',dur:2.7,lock:1.6,trn:[[0,1.65,3]],ph1only:1,
    trk:[[.5,'tear','io'],[.8,'tear','l',.01],[1.15,'lift','o'],[1.55,'lift','l',.014],[1.7,'throw','s'],[2.15,'throw','l'],[2.7,'rec','io']],
    hit:[{t:2.35,s:{k:'c',r:2.4},o:c=>{if(!c.M.an.tp)c.M.an.tp=gb151Aim(c,.9);const p=c.M.an.tp;return {x:p.x,z:p.z,a:0}},w:1.0,dm:1.3,fr:1,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);gb151Shatter(p,1.4);shake(.3);svSnd('crack',1.2,.7);for(let k=0;k<6;k++)gb151Shards(c,p,k/6*6.283+.3,4.2,.6)}}],
    ev:[[.8,c=>gb151TearRock(c)],[1.66,c=>{if(!c.M.an.tp)c.M.an.tp=gb151Aim(c,.55);gb151Throw(c,[c.M.an.tp],.62)}]],end(c){gb151HandRock(c.e,false)},rec:.35}),
  // Permafrost Slam: a close blast, then a ring of ice spikes further out
  stomp:GB151_NO141({wt:(e,L)=>L<5?9:2,cd:8.5,r:[0,6.5],a:'any',armor:1,dur:3.05,trn:[[0,.55,2]],
    trk:[[.6,'stUp','io'],[1.45,'stUp','l',.022],[1.58,'stHit','s'],[2.45,'stHit','l'],[3.05,'rec','io']],
    hit:[{t:1.58,s:{k:'c',r:3.5},dm:1.3,w:1.2,fx:c=>{gb151Slam(c,c.m.position,3.8,0)}},
      {t:2.15,s:{k:'r',r0:3.5,r:8.6},dm:1.0,w:.55,fr:1,fx:c=>gb151SpikeRing(c.m.position,3.5,8.6)}],
    ev:[[.55,c=>{svSnd('roar',.6,.9);c.S.chgT=1}],[1.58,c=>{c.S.chgT=0}]],rec:.45}),
  // ---------------- Phase II ----------------
  awaken:GB151_NO141({dur:3.8,inv:[0,3.8],armor:1,trn:[[0,3.6,1.2]],trk:[[.6,'stUp','io'],[1.3,'stUp','l',.025],[1.55,'stHit','s'],[1.9,'roar','o'],[3.2,'roar','l',.03],[3.8,'rec','io']],
    hit:[{t:1.6,s:{k:'c',r:7},dm:.55,kb:6,w:1.2,fx:c=>{gb151Slam(c,c.m.position,7,0);gb151SpikeRing(c.m.position,1.5,7)}}],
    ev:[[.05,c=>{try{zt116Show(ZT116.Z[2],'Gorthrak · Phase II','Glacial Fury','The Maw groans: the ceiling is coming down','Watch the ground for falling ice','z2')}catch(_){}svSnd('roar',.8,.7);c.S.chgT=1.2}],
      [1.6,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.chgT=0;try{flash('rgba(160,220,255,.3)')}catch(_){}svSnd('roar',1.25,.6);svSnd('crack',1,.6);shake(.6);try{gb151Quake(true)}catch(err){console.error('gb quake',err)}}]]}),
  // Warlord's Fury: smash, backhand, smash, uppercut, a leaping slam onto you
  fury:GB151_NO141({wt:9,cd:3.8,ph:2,r:[0,5.8],a:'f',mel:1,dur:3.75,lock:.32,trn:[[0,.32,4.5],[.62,.72,4.5],[1.0,1.1,4.5],[1.4,1.5,4.5],[1.9,2.2,3.6]],
    trk:[[.3,'smUp','io'],[.44,'smHit','s'],[.62,'fUp','io'],[.76,'fHit','s'],[.98,'smUp','io'],[1.12,'smHit','s'],[1.35,'upUp','io'],[1.5,'upHit','s'],[1.95,'leap','o'],[2.3,'xUp','io'],[2.44,'xHit','s'],[3.1,'rec','io'],[3.75,'rec','l']],
    rm:[[.38,.46,.7,'o'],[.7,.78,.5,'o'],[1.06,1.14,.6,'o'],[1.44,1.52,.6,'o'],[1.9,2.44,'tgt','io',.4,8]],
    hit:[{t:.44,s:{k:'a',r:4.8,h:1.15},f:.3,dm:.85},{t:.76,s:{k:'a',r:4.2,h:1.0},f:.3,dm:.75,kb:1.5},{t:1.12,s:{k:'a',r:4.8,h:1.15},f:.3,dm:.85},
      {t:1.5,s:{k:'c',r:2.6},f:1.6,dm:.9,kb:3,fr:1},
      {t:2.44,s:{k:'c',r:3.2},o:'tgt',dm:1.45,w:.5,fr:1,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);gb151Slam(c,p,4.2,1.6);gb151SpikeRing(p,0,3)}}],
    tr:[GB151_TR(.36,.5),GB151_TF(.68,.8),GB151_TR(1.04,1.18),GB151_TF(1.42,1.56),GB151_TR(2.34,2.5)],
    ev:[[.38,c=>svSnd('swing',.85,.9)],[.7,c=>svSnd('swing',.8,1.15)],[1.06,c=>svSnd('swing',.85,.95)],[1.44,c=>svSnd('swing',.8,1.2)],[1.9,c=>{svSnd('roar',.8,.9);svSnd('whoosh',1.1,.7)}]],rec:.4}),
  // Avalanche Hurl: three boulders, one on you and one either side of you
  hurl3:GB151_NO141({wt:(e,L)=>L>5?10:4,cd:7,ph:2,r:[4,30],a:'f',dur:2.85,lock:1.6,trn:[[0,1.65,3]],
    trk:[[.45,'tear','io'],[.75,'tear','l',.01],[1.1,'lift','o'],[1.5,'lift','l',.014],[1.65,'throw','s'],[2.2,'throw','l'],[2.85,'rec','io']],
    hit:[0,1,2].map(i=>({t:2.3+i*.12,s:{k:'c',r:2.3},o:c=>{if(!c.M.an.tps)c.M.an.tps=gb151Tps(c);const p=c.M.an.tps[i];return {x:p.x,z:p.z,a:0}},w:.95,dm:1.15,fr:1,
      fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);gb151Shatter(p,1.25);shake(.25);svSnd('crack',1.1,.75+i*.1);for(let k=0;k<4;k++)gb151Shards(c,p,k/4*6.283+i,3.4,.55)}})),
    ev:[[.75,c=>gb151TearRock(c)],[1.62,c=>{if(!c.M.an.tps)c.M.an.tps=gb151Tps(c);gb151Throw(c,c.M.an.tps,.62)}]],
    end(c){gb151HandRock(c.e,false)},rec:.4}),
  // Icefall Storm: six icicles in a ring round you, then a great one in the middle
  storm:GB151_NO141({wt:8,cd:9,ph:2,r:[0,30],a:'any',armor:1,dur:3.0,lock:.7,trn:[[0,.7,3]],
    trk:[[.45,'beat','io'],[.7,'beat','l',.02],[.9,'roar','o'],[2.5,'roar','l',.02],[3.0,'rec','io']],
    hit:[0,1,2,3,4,5].map(k=>({t:1.65,s:{k:'c',r:1.6},o:c=>{if(!c.M.an.er)c.M.an.er=pl.position.clone();const P=c.M.an.er,a=k/6*Math.PI*2,q=gb151Clamp(new THREE.Vector3(P.x+Math.sin(a)*3.2,0,P.z+Math.cos(a)*3.2),.5);return {x:q.x,z:q.z,a:0}},w:.85,dm:.9,fr:1,fx:(c,an)=>{}}))
      .concat([{t:2.2,s:{k:'c',r:2.3},o:c=>{const P=c.M.an.er||pl.position;return {x:P.x,z:P.z,a:0}},w:.6,dm:1.25,fr:1,fx:(c,an)=>{}}]),
    ev:[[.9,c=>{svSnd('roar',1.1,.75);shake(.35)}]],rec:.4}),
  // Glacier Shell (the move keeps its old id 'rampage'): armour up (the three leaps and the outcome are cast by the controller, 3152)
  rampage:GB151_NO141({wt:(e,L)=>e.sv.rpN?12:30,cd:28,ph:2,r:[0,40],a:'any',armor:1,dur:2.6,inv:[0,2.6],trn:[[0,2.6,2]],
    trk:[[.35,'stUp','io'],[.9,'armor','o'],[2.1,'armor','l',.03],[2.6,'rec','io']],
    go(c){try{gb151RampStart(c.e)}catch(err){console.error('gb rampage',err)}},
    tk(c,dt){c.S.shell=Math.min(1,Math.max(c.S.shell||0,(c.t-.4)/1.4));c.S.chg=.5+.5*Math.sin(c.t*8)},
    ev:[[.9,c=>{svSnd('roar',1.2,.65);svSnd('crack',1,.5);shake(.4);svShock(c.m.position,0xbfe8ff,6,.6);burst(gY(c.m.position,2),0xd8f4ff,70,3,3,1)}]],end(c){c.S.chg=0}}),
  // v168 one Glacier Shell leap: crouch and fix on you (the ring marks where he lands), leap, land with a blast, then RIMELOCKED: the
  // maul frozen in the floor ~1.9 s, the crack on his back open; shards burst out in front of him. Get behind him and strike the crack.
  rleap:GB151_NO141({dur:4.3,armor:1,lock:.95,trn:[[0,.95,4.6]],
    trk:[[.4,'chLow','io'],[.9,'chLow','l',.022],[1.05,'leap','o'],[1.5,'leap','l'],[1.62,'stHit','s'],[3.5,'stHit','l',.035],[4.3,'rec','io']],
    hit:[{t:1.62,s:{k:'c',r:3.3},o:c=>{const M=c.M;if(!M.an.lp)M.an.lp=gb151HeroIn(pl.position.clone());return {x:M.an.lp.x,z:M.an.lp.z,a:0}},w:1.0,dm:1.45,kb:3.5,fr:1,
        fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);gb151Slam(c,p,4.2,0);gb151SpikeRing(p,1.2,3.3)}},
      {t:2.3,s:{k:'a',r:7.5,h:.7},f:.4,dm:.9,w:.6,fr:1,fx:c=>{const a=c.m.rotation.y,p=c.at(1.2);for(let k=-2;k<=2;k++)gb151Shards(c,p,a+k*.26,6.2,0);svSnd('crack',1.1,.8)}}],
    ev:[[.3,c=>{svSnd('roar',1.0,.75);c.S.chgT=1}],[1.0,c=>{svSnd('whoosh',1.3,.6);burst(gY(c.m.position,.3),0xd8f4ff,30,2.4,2,.6);c.S.chgT=0}],
      [1.62,c=>{gb151RlkOpen(c.e,1.95,true)}],[3.57,c=>{gb151RlkClose(c.e);burst(c.wp('maul',0,-2.4,0),0xd8f4ff,30,2,2,.6);svSnd('crack',.9,.9)}]],
    tk(c,dt){const M=c.M,m=c.m;if(c.t>=1.0&&c.t<=1.62){if(!M.an.p0)M.an.p0=m.position.clone();const T=M.an.lp||gb151HeroIn(pl.position.clone()),k=svEase.io(Math.min(1,(c.t-1.0)/.62));
        m.position.x=M.an.p0.x+(T.x-M.an.p0.x)*k;m.position.z=M.an.p0.z+(T.z-M.an.p0.z)*k;c.S.rmOn=1}else if(c.t>1.62&&c.t<3.6)c.S.rmOn=1},
    end(c){gb151RlkClose(c.e);c.S.chgT=0}}),
  // the shell holds: he heals and brings the ceiling down; only the shelters are safe (cast by the controller)
  rfail:GB151_NO141({dur:4.6,armor:1,inv:[0,4.6],trk:[[.4,'roar','o'],[3.0,'roar','l',.03],[3.3,'stUp','io'],[3.75,'stHit','s'],[4.6,'rec','io']],
    go(c){try{gb151Shelters(c.e)}catch(err){console.error('gb shelters',err)}},
    ev:[[.45,c=>{svSnd('roar',1.2,.7);try{sk146Heal(c.e,.12,0x9ad8ff)}catch(_){}}],[3.75,c=>{try{gb151Avalanche(c.e)}catch(err){console.error('gb avalanche',err)}}]],end(c){c.S.shell=0;c.S.crk=0}}),
  // the shell bursts: a long stagger (cast the moment the third crack lands)
  broken:GB151_NO141({dur:4.8,trk:[[.3,'stag','o'],[4.2,'stag','l',.03],[4.8,'rec','io']],
    go(c){c.S.stg=4.8;c.S.shell=0;c.S.crk=0;c.S.dr=0;svSnd('stag',1.2,.7);svSnd('crack',1.2,.5);popT(c.m.position,'SHATTERED','#bfe8ff',true);
      try{sk146Debris(gY(c.m.position,2),gb151IceMat(),16,.25,6,7,1.6)}catch(_){}burst(gY(c.m.position,2),0xd8f4ff,90,4,3,.9);svShock(c.m.position,0xbfe8ff,6,.6)},
    tk(c,dt){c.S.stg=Math.max(0,4.8-c.t);if(Math.random()<dt*8){const p=svWP(c.e,'head',0,.2,0);burst(p,0xffe08a,1,.5,.6,.5)}},end(c){c.S.stg=0}})};
// the icicle moves draw their own falling icicles at the warning's centre, timed to land on the hit
['icefall','storm'].forEach(id=>GB151M[id].hit.forEach((h,i)=>{const t0=h.t;h.fx=()=>{};const w=h.w;h.pre=(c,an)=>{};
  const ev=[Math.max(0,t0-.34),c=>{const an=c.M.an['h'+i]||svAnchor(c.e,h,c);gb151Icicle(new THREE.Vector3(an.x,0,an.z),h.s.r>2,.32)}];GB151M[id].ev.push(ev)}));
// Warlord's Fury and Avalanche Hurl take over from their Phase I versions
GB151M.combo.ph1only=1;
// the boulder in the Rime Fist (Glacier Hurl): torn out of the floor, held, thrown
function gb151HandRock(e,on){const S=e.sv;if(!S||!S.R)return;let g=S.hrock;if(on&&!g){g=new THREE.Group();const a=new THREE.Mesh(svG('gb_bd',()=>svLump(.62,1,.25,181)),gb151IceMat()),b=new THREE.Mesh(svG('gb_bd2',()=>svLump(.42,0,.35,182)),gb151RockMat());
    b.position.set(.25,-.1,.2);g.add(a,b);g.position.set(0,-.65,.2);S.R.J.wrL.add(g);S.hrock=g}if(g)g.visible=!!on}
function gb151TearRock(c){const p=c.wp('wrL',0,-.4,.2);burst(gY(c.m.position,.3),0x6a6e76,30,2.5,2,.6);try{sk146Debris(p,gb151RockMat(),6,.15,3,6,1.1)}catch(_){}svSnd('crack',1,.6);shake(.2);gb151HandRock(c.e,true);
  try{sk146Crack(c.at(1.2,1),0x9ad8ff,1.6,1.6)}catch(_){}}
function gb151Throw(c,L,T){gb151HandRock(c.e,false);const a=c.wp('wrL',0,-.6,.2);svSnd('whoosh',1.2,.8);L.forEach((p,i)=>gb151Boulder(a.clone(),new THREE.Vector3(p.x,GH(p.x,p.z)+.5,p.z),T+i*.12,()=>{}))}
// hits marked fr add Frostbite stacks when they land (through the engine's on-hit hook)
for(const id in GB151M){const D=GB151M[id];(D.hit||[]).forEach(h=>{if(!h.fr)return;const o=h.on,n=h.fr;h.on=(c,an)=>{gb151Frost(n);if(o)o(c,an)}})}
function gb151Tps(c){const P=gb151Aim(c,.9),a=svYawTo(c.m,P)+Math.PI/2;return [0,-3.2,3.2].map(o=>gb151HeroIn(new THREE.Vector3(P.x+Math.sin(a)*o,0,P.z+Math.cos(a)*o)))}
