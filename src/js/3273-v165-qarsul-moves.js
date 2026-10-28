// ================= v165 Qarsul, the Living Dune — the moves (Sovereign move format, v110 engine) and the engine glue =================
// Like Vorraxis (3032) and Gorthrak (3151) he runs on the v110 timeline engine outside a Sovereign den: the temple yard of Searing
// Sands I (3274) is his arena; svCtx / svHitNow are pointed at it for him only. He never sets e.ar (not a Sovereign defeat).
// Theme: the desert itself, roused to guard a door. Everything he does is the weight and the flow of sand: stone fists, a body that
// pours into the ground and surges back out of it, sand that swallows your feet, a storm that buries the yard.
// Quicksand (his debuff): his surges and slams leave patches of quicksand (slows); his Grasping Sands bury you to the waist
// ("Buried": rooted ~1 s; a dash tears you free).
// Pattern (learnable; cooldowns, no repeats, combo strings):
//  close, front ── Sandstone Pummel: an overhead smash with the obelisk, a left hook, a pause… then both fists raised and a hammer
//                  blow down a line that throws up sand spikes (late: it punishes an early dodge).
//  mid, front   ── Dune Surge: he pours himself into the ground (the lane shows where) and comes through you as a wave of sand,
//                  rising at the end of it; quicksand on his path.
//  behind/side  ── Vortex Lash: his vortex flares and he whirls a full turn: a ring around him (hug him, or be far out).
//  any          ── Grasping Sands: fists into the ground; three hands of sand burst up under you, each aimed ahead of you; a hand
//                  that catches you buries you (dash free).
//  far, front   ── Sandblast: the chest thrown open, a fan of five sand bolts with gaps between them.
//  close, any   ── Collapse: he slumps into his vortex (a close blast) and bursts back up (a ring further out). Get out, step back in.
//  Phase II (55%) "The Storm Wakes": a roar, the storm round the yard thickens, the wall of sand closes in, and dust devils
//                  wander the yard (3274). He rests less and gains Avalanche Pummel (five blows and a leaping slam), Twin Surge
//                  (through you and back), Buried Spires (a ring of spikes closing on you, then one under you) and the signature:
//  Heart of the Dune: he sinks into the sand; three mounds rise round the yard and his heart flies into one; the mounds shift
//                  places. Break the mound that holds the heart (its glow flickers through the sand) and he is torn out of the
//                  ground: TORN OUT, a long stagger. Strike a wrong one and it bursts in your face. If time runs out he rises
//                  healed, three slabs of temple stone burst from the yard, and the Sandstorm Burial scours everything not in
//                  their lee.
// Weakness: posture (the yellow bar); every break staggers him (+35% damage). Big moves have armour.
var QS165A=null;   // the yard arena while he exists: {cx, cz, r (his reach), hr (the hero's), y, f (fight on)}
{const f=svCtx;svCtx=function(e){const c=f.apply(this,arguments);if(e&&e.qs165){c.A=QS165A;c.inA=(p,mg)=>qs165Clamp(p,mg==null?1.2:mg);c.hit=(s,an,dm,o)=>qs165HitNow(e,s,an,dm,o||{})}return c}}
{const f=svHitNow;svHitNow=function(e,s,an,dm,o){if(e&&e.qs165)return qs165HitNow(e,s,an,dm,o||{});return f.apply(this,arguments)}}
function qs165Clamp(p,mg){const A=QS165A;if(!A)return p;const dx=p.x-A.cx,dz=p.z-A.cz,d=Math.hypot(dx,dz),lim=A.r-(mg||0);if(d>lim){p.x=A.cx+dx/d*lim;p.z=A.cz+dz/d*lim}return p}
function qs165HeroIn(p){const A=QS165A;if(!A)return p;const dx=p.x-A.cx,dz=p.z-A.cz,d=Math.hypot(dx,dz);if(d>A.hr){p.x=A.cx+dx/d*A.hr;p.z=A.cz+dz/d*A.hr}return p}
function qs165HitNow(e,s,an,dm,o){if(!QS165A||!QS165A.f||e.dead)return false;let hit=false;if(o.flash!==false)svFlash(s,an,o.col||QS165M.col,o.fms);
  if(hero.hp>0&&svIn(s,an,pl.position,o.pad)){hit=true;SVX.st.hits++;if(o.pre)try{o.pre()}catch(_){}const iv=hero.iv>0;bossHit(e,dm);
    if(!iv&&hero.hp>0){if(o.kb){const dx=pl.position.x-an.x,dz=pl.position.z-an.z,l=Math.hypot(dx,dz)||1,q=qs165HeroIn(pl.position.clone().add(new THREE.Vector3(dx/l*o.kb,0,dz/l*o.kb)));
        pl.step={x:(q.x-pl.position.x)/(o.kb||1),z:(q.z-pl.position.z)/(o.kb||1),t:.22,sp:(o.kb||1)/.22}}
      if(o.bury)qs165Bury();if(o.on)try{o.on()}catch(err){console.error('qs on hit',err)}}}
  return hit}
// ---------------- the debuffs ----------------
const QS165_QS=['Quicksand','🏜️',{mspd:-.45},'Quicksand: −45% move speed'];
function qs165Bury(){if(hero.hp<=0||hero.iv>0)return;dqDebuff('Buried','🏜️',{mspd:-1},1000,'Buried to the waist in sand (dash free)');popT(pl.position,'BURIED','#e8c890',true);svSnd('squelch',.9,.7);
  const m=QS165X.m.bur||(QS165X.m.bur=new THREE.MeshStandardMaterial({color:0xc8a066,roughness:.97,flatShading:true}));const g=new THREE.Mesh(svG('qs_bur',()=>svLump(.75,1,.22,311)),m);g.scale.set(1,.6,1);
  g.position.copy(gY(pl.position,.25));g.userData.lpsSkip=1;scene.add(g);let t=0;burst(gY(pl.position,.5),0xd8b47a,24,1.4,1.2,.6);
  kqFx({tick(dt){t+=dt||0;g.position.copy(gY(pl.position,.25));const out=!hero.buffs.some(b=>b.n==='Buried');return t<1.0&&!out},end(){scene.remove(g);burst(gY(pl.position,.6),0xd8b47a,30,2,1.6,.6)}})}
// a dash tears you free
{const f=dodge;dodge=function(){const b=hero.buffs.findIndex(q=>q&&q.n==='Buried');if(b>=0){hero.buffs.splice(b,1);try{hsDirty()}catch(_){}}return f.apply(this,arguments)}}
// ---------------- effects ----------------
var QS165X={m:{}};
function qs165SandMat(){return QS165X.m.sand||(QS165X.m.sand=new THREE.MeshStandardMaterial({color:0xc8a066,roughness:.96,flatShading:true}))}
function qs165StoneMat(){return QS165X.m.stone||(QS165X.m.stone=new THREE.MeshStandardMaterial({color:0xbe9a66,roughness:.88,flatShading:true}))}
function qs165Pool(e,p,r,ms){if(!QS165A||!QS165A.f)return;const q=qs165Clamp(p.clone(),.3);s6Pool(e,q,r,0xc8a066,ms||3600,.06,QS165_QS)}
// a burst of sand where something lands: spikes of packed sand, a cloud, a scar in the ground
function qs165Burst(p,s){s=s||1;for(let k=0;k<6;k++){const a=k/6*6.283+Math.random(),r=(.4+Math.random()*.7)*s;svSpike(new THREE.Vector3(p.x+Math.cos(a)*r,0,p.z+Math.sin(a)*r),qs165SandMat(),(.7+Math.random()*.6)*s,.22*s,1.0,.5)}
  try{sk146Debris(gY(p,.5),qs165StoneMat(),5,.16*s,4,6,1.2)}catch(_){}burst(gY(p,.4),0xd8b47a,30,2.4*s,2.4,.8);svDecal(p,0x8a6a40,1.5*s,3,.5);svShock(p,0xe8c890,2.2*s,.35)}
// a slam on p: shockwave, sand thrown up, quicksand left
function qs165Slam(c,p,r,pool){svShock(p,QS165M.col,r,.4);burst(gY(p,.3),0xd8b47a,40,r*.9,2.6,.7);svDecal(p,0x8a6a40,r*.8,3,.5);try{sk146Crack(p,0xc89050,r*.9,1.8);sk146Debris(gY(p,.3),qs165StoneMat(),5,.16,3.5,5,1.2)}catch(_){}
  shake(.3);svSnd('heavy',1.15,.8);if(pool)qs165Pool(c.e,p,pool,3600)}
// a hand of sand bursting up out of the ground and closing (the hit is the move's)
function qs165Hand(p){const g=new THREE.Group(),M=qs165SandMat(),y0=GH(p.x,p.z);g.position.set(p.x,y0-1.6,p.z);g.userData.lpsSkip=1;
  const palm=new THREE.Mesh(svG('qs_palm',()=>svLump(.45,1,.25,321)),M);palm.scale.set(1,1.4,1);palm.position.y=.6;g.add(palm);const F=[];
  for(let k=0;k<5;k++){const a=k/5*Math.PI*2,f=new THREE.Mesh(svG('qs_fing',()=>{const q=new THREE.ConeGeometry(.16,1.1,5);q.translate(0,.55,0);return q.toNonIndexed()}),M);f.position.set(Math.cos(a)*.34,1.1,Math.sin(a)*.34);f.rotation.set(Math.sin(a)*.55,0,-Math.cos(a)*.55);g.add(f);F.push([f,a])}
  scene.add(g);let t=0;burst(new THREE.Vector3(p.x,y0+.3,p.z),0xd8b47a,26,1.6,2.4,.7);
  kqFx({tick(dt){t+=dt||0;const up=Math.min(1,t/.18),cl=t>.25?Math.min(1,(t-.25)/.18):0,dn=t>1.0?Math.min(1,(t-1.0)/.5):0;g.position.y=y0-1.6+1.6*svEase.o(up)-1.8*dn;
    F.forEach(([f,a])=>{const k=.55*(1-cl)-.35*cl;f.rotation.set(Math.sin(a)*k,0,-Math.cos(a)*k)});if(Math.random()<.4)burst(gY(p,.2),0xd8b47a,1,.4,.6,.5);return t<1.5},end(){scene.remove(g)}})}
// a bolt of sand (a lump trailing dust) from a to b
function qs165Bolt(a,b,T){const o=new THREE.Mesh(svG('qs_bolt',()=>svLump(.32,1,.3,331)),qs165SandMat());o.userData.lpsSkip=1;svShot(a,b,T,0xd8b47a,1,.6,()=>{qs165Burst(b,.6)},o);return o}
// the wave of a surge: a hump of sand running along the ground ahead of him (he is under it)
function qs165Wave(c){const W=c.M.an.wave;if(W)return W;const M=qs165SandMat(),g=new THREE.Group(),m=new THREE.Mesh(svG('qs_wave',()=>{const q=new THREE.SphereGeometry(1,14,8,0,Math.PI*2,0,Math.PI/2),P=q.attributes.position;
    for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);P.setXYZ(i,x*(1.4+.25*Math.sin(z*4)),y*(1+.2*Math.sin(x*5+z*3)),z*(1.1+(z>0?.3:-.1)))}q.computeVertexNormals();return q}),M);
  m.scale.set(1.5,1.35,1.7);g.add(m);g.userData.lpsSkip=1;scene.add(g);c.M.an.wave=g;c.M.fx.push(()=>{scene.remove(g)});return g}
// the run of a surge: along the facing at sp tiles/s from t0 to t1; quicksand behind it, a hit if it runs through you
function qs165Run(c,dt,t0,t1,sp){const M=c.M,e=c.e;if(c.t<t0||M.an.stop)return;if(c.t>t1){M.an.stop=1;const W=M.an.wave;if(W)W.visible=false;return}
  const a=c.m.rotation.y,d=sp*dt,x=c.m.position.x+Math.sin(a)*d,z=c.m.position.z+Math.cos(a)*d,A=QS165A;
  if(A&&Math.hypot(x-A.cx,z-A.cz)>A.r-1.4){M.an.stop=1;const W=M.an.wave;if(W)W.visible=false;shake(.2);return}
  c.m.position.x=x;c.m.position.z=z;e.sv.rmOn=1;const W=qs165Wave(c);W.visible=true;W.position.set(x,GH(x,z)-.25,z);W.rotation.y=a;
  if(!M.an.lp)M.an.lp=c.m.position.clone();if(c.m.position.distanceTo(M.an.lp)>1.7){M.an.lp=c.m.position.clone();qs165Pool(e,c.m.position.clone(),1.05,3800)}
  if(Math.random()<.8)burst(new THREE.Vector3(x+(Math.random()-.5)*2,GH(x,z)+.6,z+(Math.random()-.5)*2),0xd8b47a,2,1.4,1.8,.6);
  if(!M.an.hh&&hero.hp>0&&Math.hypot(pl.position.x-x,pl.position.z-z)<2.2){M.an.hh=1;qs165HitNow(e,{k:'c',r:99},{x,z,a},1.3,{flash:false,kb:4})}}
// where the hero will be (lead seconds ahead), inside the yard
function qs165Aim(c,lead){const v=c.S.hv||{x:0,z:0};return qs165HeroIn(new THREE.Vector3(pl.position.x+v.x*lead,0,pl.position.z+v.z*lead))}
// trails along the obelisk club and the left fist
const QS165_TR=(t0,t1)=>[t0,t1,'club',[0,-1.6,0],[0,-2.9,0],0xe8c890,.18];
const QS165_TF=(t0,t1)=>[t0,t1,'wrL',[0,-.1,.1],[0,-.55,.25],0xd8b47a,.14];
const QS165_NO141=D=>{D._h141=null;return D};
// the melt: eases S.melt toward k over T seconds from the move's time t0
function qs165Melt(c,t0,T,k0,k1){if(c.t<t0)return;const u=Math.min(1,(c.t-t0)/T);c.S.melt=k0+(k1-k0)*svEase.io(u)}
// ---------------- the moves ----------------
var QS165MV={
  // he gathers himself out of the heaps and roars (the controller plays the rise before this)
  intro:QS165_NO141({dur:3.4,inv:[0,3.4],armor:1,trn:[[0,3.4,1.5]],trk:[[.6,'stUp','io'],[1.2,'stUp','l',.02],[1.45,'roar','o'],[2.9,'roar','l',.025],[3.4,'rec','io']],
    ev:[[1.45,c=>{svSnd('roar',1.2,.55);svSnd('roar',.8,.8);shake(.45);svShock(c.m.position,QS165M.col,9,.8);burst(gY(c.m.position,3),0xd8b47a,70,6,3,1.1);c.S.chgT=.8}],[2.9,c=>{c.S.chgT=0}]]}),
  // Sandstone Pummel (Phase I): the obelisk smash, the left hook, the late hammer-fist down a line
  pummel:QS165_NO141({wt:10,cd:2.8,r:[0,6.2],a:'f',mel:1,dur:2.8,lock:.45,trn:[[0,.45,4.2],[.95,1.1,4.2],[1.5,1.74,3.2]],
    trk:[[.45,'rUp','io'],[.62,'rUp','l',.012],[.75,'rHit','s'],[.98,'rHit','l'],[1.14,'lUp','io'],[1.26,'lHit','s'],[1.52,'xUp','io'],[1.88,'xUp','l',.018],[2.02,'xHit','s'],[2.4,'rec','io'],[2.8,'rec','l']],
    rm:[[.64,.76,.9,'o'],[1.16,1.28,.5,'o'],[1.92,2.04,1.5,'o']],
    hit:[{t:.74,s:{k:'a',r:5.4,h:1.15},f:.3,dm:1.0},{t:1.25,s:{k:'a',r:4.6,h:1.0},f:.3,ay:-.5,dm:.8,kb:2},
      {t:2.02,s:{k:'l',w:2.8,l:7,b:0},f:.4,dm:1.45,w:.48,fx:c=>{const p=c.at(3.4);qs165Slam(c,p,3.2,1.3);for(let k=0;k<5;k++){const q=c.at(1.6+k*1.3,(Math.random()-.5)*.8);svSpike(q,qs165SandMat(),.9+Math.random()*.5,.26,1,.4)}}}],
    tr:[QS165_TR(.64,.8),QS165_TF(1.16,1.3),QS165_TR(1.9,2.06)],
    ev:[[.62,c=>svSnd('swing',.9,.75)],[1.16,c=>svSnd('swing',.8,1.0)],[1.56,c=>svSnd('roar',.45,1.2)],[1.92,c=>svSnd('whoosh',1.1,.7)],[.75,c=>{burst(c.wp('club',0,-2.6,0),0xd8b47a,24,2,1.6,.5);svSnd('heavy',.85,1.0);shake(.14)}]],
    nx:[['surge',.25,12],['lash',.3,6.5]],rec:.3}),
  // Dune Surge: into the ground, through you as a wave, out at the end
  surge:QS165_NO141({wt:8,cd:6.5,r:[4,15],a:'f',armor:1,dur:2.9,lock:.55,trn:[[0,.55,4]],
    trk:[[.5,'sLow','io'],[.95,'sLow','l',.02],[2.3,'sRise','o'],[2.9,'rec','io']],
    hit:[{t:1.0,s:{k:'l',w:3,l:12,b:0},nohit:1,w:.5}],
    ev:[[.2,c=>{svSnd('roar',.6,1.0);burst(gY(c.m.position,.4),0xd8b47a,20,2.2,1,.6)}],[1.0,c=>{svSnd('whoosh',1.2,.55);shake(.16)}],[2.25,c=>{qs165Burst(c.m.position.clone(),1.1);svSnd('heavy',.9,.85)}]],
    tk(c,dt){qs165Melt(c,.35,.55,0,1);if(c.t>2.05)qs165Melt(c,2.05,.45,1,0);qs165Run(c,dt,1.0,1.95,14.5);if(c.t>1&&c.t<1.95&&Math.random()<dt*6)shake(.05)},end(c){c.S.melt=0},rec:.35}),
  // Vortex Lash: a full turn with the arms out (only from behind or the side)
  lash:QS165_NO141({wt:(e,L,side)=>side==='b'?14:side==='s'?6:0,cd:5.5,r:[0,6.6],a:'sb',dur:2.15,lock:.5,trn:[[0,.5,2.4]],
    trk:[[.55,'spW','io'],[.86,'spW','l',.015],[1.0,'spGo','s'],[1.45,'spGo','l'],[2.15,'rec','io']],
    hit:[{t:1.12,s:{k:'r',r0:1.9,r:6.6},dm:1.15,kb:3.5,w:.82,fx:c=>{svShock(c.m.position,QS165M.col,6.8,.4);burst(gY(c.m.position,.8),0xd8b47a,50,5.5,1,.6);svSnd('whoosh',1.2,.6);svSnd('heavy',.7,1.1)}}],
    tr:[QS165_TR(.98,1.42)],ev:[[.4,c=>{svSnd('roar',.4,1.3);c.S.chgT=.6}],[1.5,c=>{c.S.chgT=0}]],
    tk(c,dt){const M=c.M;if(c.t>=.98&&c.t<=1.42){if(M.an.y0==null)M.an.y0=c.m.rotation.y;const k=svEase.io(Math.min(1,(c.t-.98)/.44));c.m.rotation.y=M.an.y0+k*Math.PI*2}else if(c.t>1.42&&M.an.y0!=null){c.m.rotation.y=M.an.y0;M.an.y0=null}},
    end(c){if(c.M.an.y0!=null)c.m.rotation.y=c.M.an.y0;c.S.chgT=0},rec:.35}),
  // Grasping Sands: three hands burst up under you, each aimed ahead of you; a hand that catches you buries you
  grasp:QS165_NO141({wt:8,cd:7.5,r:[2.5,30],a:'any',armor:1,dur:3.0,lock:.9,trn:[[0,.9,3]],
    trk:[[.55,'stUp','io'],[1.2,'stUp','l',.02],[1.36,'stHit','s'],[2.5,'stHit','l',.015],[3.0,'rec','io']],
    hit:[1.75,2.05,2.35].map((t,i)=>({t,s:{k:'c',r:1.55},o:c=>{const p=qs165Aim(c,.45+i*.1);return {x:p.x,z:p.z,a:0}},w:.72,dm:1.0,bury:1,fx:()=>{}})),
    ev:[[1.36,c=>{qs165Slam(c,c.at(1.6),2.6,0);svSnd('roar',.7,.9)}]],rec:.4}),
  // Sandblast: a fan of five bolts with gaps
  blast:QS165_NO141({wt:(e,L)=>L>7?9:3,cd:6.5,r:[5,30],a:'f',dur:2.5,lock:1.15,trn:[[0,1.2,3]],
    trk:[[.5,'blUp','io'],[1.05,'blUp','l',.02],[1.2,'blGo','s'],[1.9,'blGo','l'],[2.5,'rec','io']],
    hit:[-2,-1,0,1,2].map(k=>({t:1.55,s:{k:'l',w:1.3,l:16,b:1.2},ay:k*.3,dm:.95,w:.9,fx:(c,an)=>{const a=c.wp('core',0,0,.4),L=14,b=new THREE.Vector3(an.x+Math.sin(an.a)*L,0,an.z+Math.cos(an.a)*L);qs165Clamp(b,.5);b.y=GH(b.x,b.z)+.3;qs165Bolt(a,b,.42)}})),
    ev:[[.5,c=>{c.S.chgT=1.2;svSnd('charge',.7,.8)}],[1.2,c=>{c.S.chgT=0;svSnd('whoosh',1.3,.6);burst(c.wp('core',0,0,.6),0xffc060,40,3,1,.5)}]],rec:.35}),
  // Collapse: a close blast as he slumps, then a ring as he bursts back up
  collapse:QS165_NO141({wt:(e,L)=>L<5?9:2,cd:8.5,r:[0,6.8],a:'any',armor:1,dur:3.1,trn:[[0,.5,2]],
    trk:[[.45,'clDown','io'],[1.9,'clDown','l',.02],[2.3,'sRise','o'],[3.1,'rec','io']],
    hit:[{t:.95,s:{k:'c',r:3.7},dm:1.25,w:1.0,fx:c=>{qs165Slam(c,c.m.position,3.9,0)}},
      {t:2.25,s:{k:'r',r0:3.6,r:8.8},dm:1.05,w:.6,fx:c=>{const p=c.m.position;for(let i=0;i<22;i++){const a=i/22*6.283,r=4+Math.random()*4.6,q=new THREE.Vector3(p.x+Math.cos(a)*r,0,p.z+Math.sin(a)*r);if(QS165A&&Math.hypot(q.x-QS165A.cx,q.z-QS165A.cz)>QS165A.r+.6)continue;svSpike(q,qs165SandMat(),1.0+Math.random()*.8,.28,1.0,.4)}
        burst(gY(p,.5),0xd8b47a,70,8,2.2,.8);svShock(p,0xe8c890,8.8,.5);try{sk146Wall(p,0xd8b47a,8.8,2.2,.5)}catch(_){}}}],
    ev:[[.4,c=>{svSnd('roar',.6,.9);c.S.chgT=1}],[.95,c=>{c.S.chgT=0}]],
    tk(c,dt){qs165Melt(c,.3,.6,0,.85);if(c.t>1.9)qs165Melt(c,1.9,.4,.85,0)},end(c){c.S.melt=0},rec:.45}),
  // ---------------- Phase II ----------------
  awaken:QS165_NO141({dur:3.8,inv:[0,3.8],armor:1,trn:[[0,3.6,1.2]],trk:[[.6,'stUp','io'],[1.3,'stUp','l',.025],[1.55,'stHit','s'],[1.9,'roar','o'],[3.2,'roar','l',.03],[3.8,'rec','io']],
    hit:[{t:1.6,s:{k:'c',r:7},dm:.55,kb:6,w:1.2,fx:c=>{qs165Slam(c,c.m.position,7,0)}}],
    ev:[[.05,c=>{try{zt116Show(ZT116.Z[3],'Qarsul · Phase II','The Storm Wakes','The sand wall closes in; the yard is a storm','Watch for the dust devils','z3')}catch(_){}svSnd('roar',.8,.7);c.S.chgT=1.2}],
      [1.6,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.chgT=0;try{flash('rgba(255,190,110,.3)')}catch(_){}svSnd('roar',1.25,.55);shake(.6);try{qs165Storm(true)}catch(err){console.error('qs storm',err)}}]]}),
  // Avalanche Pummel: smash, hook, smash, hook, a leaping slam onto you
  fury:QS165_NO141({wt:9,cd:3.8,ph:2,r:[0,6.2],a:'f',mel:1,dur:3.8,lock:.32,trn:[[0,.32,4.2],[.62,.72,4.2],[1.0,1.1,4.2],[1.4,1.5,4.2],[1.9,2.2,3.4]],
    trk:[[.3,'rUp','io'],[.44,'rHit','s'],[.62,'lUp','io'],[.76,'lHit','s'],[.98,'rUp','io'],[1.12,'rHit','s'],[1.3,'lUp','io'],[1.46,'lHit','s'],[1.95,'leap','o'],[2.3,'xUp','io'],[2.46,'xHit','s'],[3.15,'rec','io'],[3.8,'rec','l']],
    rm:[[.38,.46,.7,'o'],[.7,.78,.5,'o'],[1.06,1.14,.6,'o'],[1.4,1.48,.5,'o'],[1.9,2.46,'tgt','io',.4,8]],
    hit:[{t:.44,s:{k:'a',r:5.4,h:1.15},f:.3,dm:.9},{t:.76,s:{k:'a',r:4.6,h:1.0},f:.3,dm:.75,kb:1.5},{t:1.12,s:{k:'a',r:5.4,h:1.15},f:.3,dm:.9},{t:1.46,s:{k:'a',r:4.6,h:1.0},f:.3,dm:.75,kb:1.5},
      {t:2.46,s:{k:'c',r:3.4},o:'tgt',dm:1.5,w:.5,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);qs165Slam(c,p,4.4,1.6);for(let k=0;k<8;k++){const a=k/8*6.283;svSpike(new THREE.Vector3(p.x+Math.cos(a)*2.4,0,p.z+Math.sin(a)*2.4),qs165SandMat(),1.1,.28,1,.4)}}}],
    tr:[QS165_TR(.36,.5),QS165_TF(.68,.8),QS165_TR(1.04,1.18),QS165_TF(1.38,1.5),QS165_TR(2.34,2.5)],
    ev:[[.38,c=>svSnd('swing',.85,.8)],[.7,c=>svSnd('swing',.8,1.05)],[1.06,c=>svSnd('swing',.85,.85)],[1.4,c=>svSnd('swing',.8,1.1)],[1.9,c=>{svSnd('roar',.8,.85);svSnd('whoosh',1.1,.65)}]],rec:.4}),
  // Twin Surge: through you, a turn, and back
  surge2:QS165_NO141({wt:9,cd:9,ph:2,r:[3,16],a:'f',armor:1,dur:4.4,lock:.55,trn:[[0,.55,4],[2.0,2.35,6]],
    trk:[[.5,'sLow','io'],[.95,'sLow','l',.02],[3.75,'sRise','o'],[4.4,'rec','io']],
    hit:[{t:1.0,s:{k:'l',w:3,l:12,b:0},nohit:1,w:.5},{t:2.45,s:{k:'l',w:3,l:12,b:0},nohit:1,w:.45}],
    ev:[[.2,c=>{svSnd('roar',.7,.9)}],[1.0,c=>{svSnd('whoosh',1.2,.55);shake(.16)}],[2.3,c=>{c.M.an.stop=0;c.M.an.hh=0;c.M.an.lp=null;svSnd('whoosh',1.2,.6)}],[3.7,c=>{qs165Burst(c.m.position.clone(),1.2);svSnd('heavy',.9,.85)}]],
    tk(c,dt){qs165Melt(c,.35,.55,0,1);if(c.t>3.5)qs165Melt(c,3.5,.4,1,0);if(c.t<2.2)qs165Run(c,dt,1.0,1.95,14.5);else qs165Run(c,dt,2.45,3.4,15)},end(c){c.S.melt=0},rec:.4}),
  // Buried Spires: six spires in a ring round you, then one under you
  spires:QS165_NO141({wt:8,cd:9,ph:2,r:[0,30],a:'any',armor:1,dur:3.0,lock:.7,trn:[[0,.7,3]],
    trk:[[.45,'stUp','io'],[.7,'stUp','l',.02],[.9,'stHit','s'],[2.5,'stHit','l',.02],[3.0,'rec','io']],
    hit:[0,1,2,3,4,5].map(k=>({t:1.65,s:{k:'c',r:1.6},o:c=>{if(!c.M.an.er)c.M.an.er=pl.position.clone();const P=c.M.an.er,a=k/6*Math.PI*2,q=qs165Clamp(new THREE.Vector3(P.x+Math.sin(a)*3.2,0,P.z+Math.cos(a)*3.2),.5);return {x:q.x,z:q.z,a:0}},w:.85,dm:.9,fx:(c,an)=>{svSpike(new THREE.Vector3(an.x,0,an.z),qs165SandMat(),2.2,.5,1.2,.15);qs165Burst(new THREE.Vector3(an.x,0,an.z),.6)}}))
      .concat([{t:2.2,s:{k:'c',r:2.3},o:c=>{const P=c.M.an.er||pl.position;return {x:P.x,z:P.z,a:0}},w:.6,dm:1.25,bury:1,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);svSpike(p,qs165SandMat(),3.2,.7,1.3,.05);qs165Burst(p,1.2)}}]),
    ev:[[.9,c=>{svSnd('roar',1.1,.7);shake(.35);qs165Slam(c,c.at(1.6),2.4,0)}]],rec:.4}),
  // Heart of the Dune: he sinks (the controller raises the mounds and runs the shell game)
  heart:QS165_NO141({wt:(e,L)=>e.sv.hN?12:30,cd:26,ph:2,r:[0,40],a:'any',armor:1,dur:2.4,inv:[0,2.4],trn:[[0,2.4,2]],
    trk:[[.35,'stUp','io'],[1.0,'sink','o'],[2.4,'sink','l',.03]],
    ev:[[.35,c=>{svSnd('roar',1.1,.6);c.S.chgT=1}],[1.0,c=>{svSnd('heavy',1.1,.5);shake(.4);burst(gY(c.m.position,.6),0xd8b47a,80,4,2,1)}],[2.35,c=>{try{qs165HeartStart(c.e)}catch(err){console.error('qs heart',err)}}]],
    tk(c,dt){qs165Melt(c,.9,1.1,0,1)}}),
  // hidden under the sand while the mounds shift and wait (cast by the controller; ends when a mound breaks or time runs out)
  hidden:QS165_NO141({dur:16,inv:[0,16],armor:1,trk:[[.1,'sink','l']],tk(c,dt){c.S.melt=1;c.e.m.visible=false}}),
  // time ran out: he rises healed, the slabs burst up, the Sandstorm Burial (cast by the controller)
  hfail:QS165_NO141({dur:4.6,armor:1,inv:[0,4.6],trk:[[.1,'sink','l'],[1.1,'roar','o'],[3.0,'roar','l',.03],[3.3,'stUp','io'],[3.75,'stHit','s'],[4.6,'rec','io']],
    go(c){c.e.m.visible=true;try{qs165Slabs(c.e)}catch(err){console.error('qs slabs',err)}},
    tk(c,dt){c.e.m.visible=true;if(c.t<1.1)qs165Melt(c,0,1.0,1,0)},
    ev:[[.9,c=>{svSnd('roar',1.2,.6);try{sk146Heal(c.e,.12,0xffc070)}catch(_){}}],[3.75,c=>{try{qs165Burial(c.e)}catch(err){console.error('qs burial',err)}}]],end(c){c.S.melt=0}}),
  // torn out of the ground: a long stagger
  broken:QS165_NO141({dur:4.8,trk:[[.05,'sink','l'],[.6,'stag','o'],[4.2,'stag','l',.03],[4.8,'rec','io']],
    go(c){c.e.m.visible=true;c.S.stg=4.8;c.S.dr=0;svSnd('stag',1.2,.7);svSnd('heavy',1.2,.5);popT(c.m.position,'TORN OUT','#ffd890',true);burst(gY(c.m.position,2),0xd8b47a,90,4,3,.9);svShock(c.m.position,0xffc070,6,.6)},
    tk(c,dt){c.e.m.visible=true;c.S.stg=Math.max(0,4.8-c.t);if(c.t<.6)qs165Melt(c,0,.55,1,0);if(Math.random()<dt*8){const p=svWP(c.e,'head',0,.3,0);burst(p,0xffe08a,1,.5,.6,.5)}},end(c){c.S.stg=0;c.S.melt=0}})};
QS165MV.pummel.ph1only=1;
// the hand moves draw their own hands at the warning's centre, just before the hit lands
['grasp'].forEach(id=>QS165MV[id].hit.forEach((h,i)=>{const t0=h.t;QS165MV[id].ev.push([Math.max(0,t0-.16),c=>{const an=c.M.an['h'+i]||svAnchor(c.e,h,c);qs165Hand(new THREE.Vector3(an.x,0,an.z))}])}));
// hits marked bury bury you (through the engine's on-hit hook)
for(const id in QS165MV){const D=QS165MV[id];(D.hit||[]).forEach(h=>{if(!h.bury)return;const o=h.on;h.on=(c,an)=>{qs165Bury();if(o)o(c,an)}})}
