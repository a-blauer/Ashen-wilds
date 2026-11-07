// ================= v205 The Citadel I · The Unsealing: defend Cheddar for two minutes while he unbinds the blood seal =================
// The owner: "players have to defend cheddar as he casts the spell to dispel the wall. The duration to protect him is 2 minutes —
// and during this various vampire creatures mobs will swarm the gate to try to kill you and cheddar. Let's make this event very
// atmospheric with cinematic dark lighting and unique fight mechanics and attacks."
//  * Start ("Begin the unbinding", 3732): black bars slide in, the light drains out of the sky, a blood moon rises over the gate
//    and six pools of red mist open round the clearing. Cheddar walks into his circle, raises his paws and his tome, and the four
//    keys flare; threads of gold run from him into the seal. US205.T (120 s) of casting; his health is the bar at the top (#us205H).
//  * The court comes in four quarters (one seal ring breaks at the end of each, 3731 gg205BreakRing):
//     I   "The court stirs"      thralls rush out of the mist; blood bats dive on Cheddar.
//     II  "Blood Siphons"        Blood Magisters take up places at the edge and tether a beam of blood to Cheddar: while any beam
//                                holds he bleeds and the seal stops unwinding (the beam and the HUD show it). Kill the caster.
//     III "The Eclipse"          the moon goes black: the clearing falls dark but for Cheddar's ward and his four fires; Mist
//                                Stalkers pour across the ground as red mist (untouchable) and re-form beside him (a ring warns).
//     IV  "The Gate-Breaker"     Ser Morvaine, a Blood Knight champion, marches on the circle; at Cheddar he raises his greatsword
//                                over a red ring: hurt him enough during the wind-up (US205.brkI of his health) and he reels,
//                                otherwise the blow falls on Cheddar (and you, if you are in it). The last 20 s, "the seal
//                                screams": Nightwing Dives, lanes of bats from the edge to Cheddar: stand in a lane to take the
//                                swarm yourself, or it tears into him.
//    About half of the thralls / bats / stalkers go for Cheddar (a proxy target beside him, the rf165 way); hit one and it may turn
//    on you. Cheddar's Ward Flare (every US205.flare s) throws back and stuns whatever is at him. Inside his circle the light burns
//    them: they take +25% damage there (US205.ward).
//  * Fail: Cheddar falls (0 health): the rings knit back, the court melts into mist, he gets up after a while ('fell': speak with
//    him to try again; the keys stay in the bowls). Leaving, recalling or dying (solo) stops it quietly.
//  * Win: the last ring, the chains and the sigil burst, the doors grind open (gg205Shatter); the light comes back, the moon fades.
//    Event creatures give half XP and drop loot 35% of the time.
// Co-op (3760): the region host runs it (spawns, Cheddar's health, the specials) and sends its state; anyone may begin it.
var US205={T:120,hpM:100,E:null,cap:14,capC:20,ward:1.25,flare:15,brkI:.12,err:0,sp:null,moon:null,mist:[],lb:null,dk:0,
  lv:45,said:{},Q:['The court stirs','Blood Siphons','The Eclipse','The Gate-Breaker'],
  // the four kinds that come: thrall / bat (I…), siphon (II…), stalker (III…), the breaker (IV, one)
  mix:[[['vamp',6],['bloodbat',4]],[['vamp',5],['bloodbat',3],['siph',2]],[['vamp',4],['bloodbat',3],['siph',2],['mist',3]],[['vamp',4],['bloodbat',4],['siph',2],['mist',3]]]};
function us205Host(){return typeof co151On!='function'||!co151On()||co151Host()}
function us205C(){return CH205.g?CH205.g.position:null}
// ---------------- the six mist pools round the clearing (where the court comes from) ----------------
function us205Spots(){if(us205Spots.c)return us205Spots.c;const R=ch205Spots(),c=R.circ,S=gg205Spot(),F=S.F,out=[];
  for(let i=0;i<24&&out.length<6;i++){const a=S.ry+Math.PI+(i%2?1:-1)*Math.floor((i+1)/2)*.26*2.2;for(const r of [10.5,9.5,11.5,8.5]){const x=c.x+Math.sin(a)*r,z=c.z+Math.cos(a)*r,X=Math.round(x),Z=Math.round(z);
      const J=insAt(X,Z);if(!J||J.g!==F.I.g||solid(X,Z)||MAP.DW[Z*W+X]>-1.3)continue;const [la]=F.L2(x,z);if(la>F.reach-4.5)continue;if(out.some(o=>Math.hypot(o.x-x,o.z-z)<5))continue;out.push({x,z,y:GH(x,z),a});break}}
  return us205Spots.c=out}
function us205MistTex(){if(US205.mt)return US205.mt;const N=128,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),g=x.createRadialGradient(N/2,N/2,0,N/2,N/2,N/2);
  g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.45,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,N,N);return US205.mt=new THREE.CanvasTexture(c)}
function us205MistMake(){if(US205.mist.length)return;us205Spots().forEach((p,i)=>{const m=new THREE.Mesh(new THREE.CircleGeometry(2.4,20).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:us205MistTex(),color:0x8a0a1a,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:true}));
  m.position.set(p.x,p.y+.12,p.z);m.userData.lpsSkip=1;m.renderOrder=2;scene.add(m);US205.mist.push({m,p,k:0})})}
// ---------------- the sky: the blood moon (and its eclipse) ----------------
function us205MoonTex(){if(US205.mnt)return US205.mnt;const N=256,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),C=N/2,g=x.createRadialGradient(C,C,40,C,C,C);
  g.addColorStop(0,'rgba(255,90,70,1)');g.addColorStop(.42,'rgba(200,30,30,1)');g.addColorStop(.5,'rgba(150,10,20,.55)');g.addColorStop(1,'rgba(120,0,10,0)');x.fillStyle=g;x.fillRect(0,0,N,N);
  const rn=svRng(2099);for(let i=0;i<14;i++){const a=rn()*6.28,r=rn()*50,cr=6+rn()*16;x.fillStyle='rgba(90,0,10,'+(.25+rn()*.3)+')';x.beginPath();x.arc(C+Math.cos(a)*r,C+Math.sin(a)*r,cr,0,Math.PI*2);x.fill()}
  return US205.mnt=new THREE.CanvasTexture(c)}
function us205Moon(){if(US205.moon)return US205.moon;const S=gg205Spot(),F=S.F,g=new THREE.Group();
  const m=new THREE.Sprite(new THREE.SpriteMaterial({map:us205MoonTex(),color:0xffffff,transparent:true,opacity:0,depthWrite:false,fog:false}));m.scale.set(46,46,1);g.add(m);
  const sh=new THREE.Sprite(new THREE.SpriteMaterial({color:0x050002,transparent:true,opacity:0,depthWrite:false,fog:false,map:us205MistTex()}));sh.scale.set(30,30,1);sh.position.set(0,0,.5);g.add(sh);
  const [x,z]=F.W2(F.reach+150,-12);g.position.set(x,F.y0+66,z);scene.add(g);g.visible=false;return US205.moon={g,m,sh,k:0,ec:0}}
// ---------------- the letterbox and the HUD ----------------
function us205Css(){if(document.getElementById('us205css'))return;const st=document.createElement('style');st.id='us205css';st.textContent=`
#us205L{position:absolute;inset:0;pointer-events:none;z-index:28}#us205L i{position:absolute;left:0;right:0;height:0;background:#000;transition:height 1.1s ease}#us205L i:first-child{top:0}#us205L i:last-child{bottom:0}
#us205L.on i{height:11vh}#us205V{position:absolute;inset:0;pointer-events:none;z-index:27;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 45%,rgba(40,0,6,.55) 100%);opacity:0;transition:opacity 1.5s}
#us205H{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:min(460px,74vw);z-index:30;pointer-events:none;text-align:center;font:600 13px/1.3 inherit;color:#f6e0c8;text-shadow:0 1px 2px #000}
#us205H .b{height:10px;margin-top:3px;background:rgba(0,0,0,.65);border:1px solid rgba(255,214,140,.5);border-radius:3px;overflow:hidden}#us205H .b i{display:block;height:100%;background:linear-gradient(90deg,#c8902a,#ffe8a8);transition:width .15s}
#us205H .s{height:5px;margin-top:3px;display:flex;gap:3px}#us205H .s i{flex:1;background:rgba(0,0,0,.6);border:1px solid rgba(255,40,60,.35);border-radius:2px;overflow:hidden;position:relative}#us205H .s i b{position:absolute;inset:0;width:0;background:linear-gradient(90deg,#8a0a1a,#ff3a4a)}
#us205H .w{margin-top:3px;font-size:11.5px;color:#ffb0a8;min-height:15px;letter-spacing:.02em}`;document.head.appendChild(st)}
function us205Hud(){const E=US205.E;let h=document.getElementById('us205H');if(!E||!cq205Here(0)){if(h)h.style.display='none';return}us205Css();
  if(!h){h=document.createElement('div');h.id='us205H';h.innerHTML='<div class="n"></div><div class="b"><i></i></div><div class="s"><i><b></b></i><i><b></b></i><i><b></b></i><i><b></b></i></div><div class="w"></div>';($('stage')||document.body).appendChild(h)}
  h.style.display='';const k=Math.min(1,E.t/US205.T),q=Math.min(3,Math.floor(k*4));h.querySelector('.n').textContent='🐭 Cheddar · breaking the seal · '+Math.round(k*100)+'% · '+US205.Q[q];
  h.querySelector('.b i').style.width=Math.max(0,100*E.hp/US205.hpM)+'%';h.querySelectorAll('.s b').forEach((b,i)=>{b.style.width=Math.max(0,Math.min(1,k*4-i))*100+'%'});
  const w=E.siN?'🩸 A blood siphon drinks from Cheddar — the seal has stopped! Kill the magister!':E.brk&&E.brk.wind?'⚔️ The Gate-Breaker raises his sword over Cheddar — hurt him NOW!':E.dive?'🦇 Nightwing Dive — stand in the lane to take the swarm!':E.ecl?'🌑 The Eclipse — stay in the light':'';
  h.querySelector('.w').textContent=w}
function us205Letterbox(on){us205Css();let L=document.getElementById('us205L'),V=document.getElementById('us205V');const st=$('stage')||document.body;
  if(!L){L=document.createElement('div');L.id='us205L';L.innerHTML='<i></i><i></i>';st.appendChild(L)}if(!V){V=document.createElement('div');V.id='us205V';st.appendChild(V)}
  L.className=on?'on':'';V.style.opacity=on==null?V.style.opacity:US205.E?1:0}
// ---------------- start / stop ----------------
function us205Start(own){const C=CQ205.c1;if(US205.E||C.st!==2||cq205Done(1)||!cq205Here(0)||!CH205.C||hero.hp<=0)return false;
  if(own&&typeof co151On=='function'&&co151On()&&!co151Host()){if(typeof co205Ask=='function')co205Ask();return false}
  const R=ch205Spots();US205.E={t:0,hp:US205.hpM,go:0,sp:2.2,flare:US205.flare*.6,q:0,said:{},siN:0,brk:null,brkDone:0,dive:null,diveT:6,ecl:0,eclT:0,lt:5+Math.random()*4,fx:0,stall:0,hb:0};
  if(riding)try{dismount()}catch(_){}
  CH205.to={x:R.circ.x,z:R.circ.z,face:R.face+Math.PI,sp:1.8,then(){const E=US205.E;if(!E)return;E.go=1;CH205.pose='cast';svSnd('charge',.8,.55);try{dg165Snd('drone',.9,.6)}catch(_){}}};CH205.pose='idle';CH205.fell=0;
  us205Letterbox(true);cq205After(5,()=>{if(US205.E)us205Letterbox(false)});us205MistMake();us205Moon().g.visible=true;
  cq205Card('The Citadel · Main Quest','The Unsealing','Hold the court off Cheddar while he unbinds the seal','Two minutes. Do not let him fall.');
  say('🐭 Cheddar: “Here we go. Whatever comes out of the dark — keep it off me!”');svSnd('bell',.9,.45);try{dg165Snd('rumble',1,.6)}catch(_){}shake(.3);
  if(own!==false&&typeof co205Ev=='function')co205Ev('start');CQ205.trkK='';return true}
// ends it: 'won' · 'fall' (Cheddar fell) · 'quiet' (left, recalled, died)
function us205Stop(why){const E=US205.E;if(!E)return;US205.E=null;CQ205.trkK='';us205Hud();us205Letterbox(false);
  const melt=s=>{if(s.dead)return;burst(gY(s.m.position,.9),0x8a0a1a,18,1.6,1.4,.7);try{removeE(s)}catch(_){}};
  enemies.slice().forEach(s=>{if(s.us205){if(why==='fall')cq205After(.4+Math.random()*1.4,()=>melt(s));else melt(s)}});us205Tethers([]);
  if(E.brk&&E.brk.W)try{E.brk.W.kill()}catch(_){}if(E.dive&&E.dive.W)E.dive.W.forEach(w=>{try{w.kill()}catch(_){}});
  if(why==='won')return;
  // the seal knits back together
  gg205Sync();CH205.to=null;
  if(why==='fall'){CH205.pose='down';CH205.fell=1;svSnd('roar',.6,.5);say('💀 Cheddar falls — the rings of the seal snap back into place, and the court melts laughing into the mist.');
    cq205After(6,()=>{if(US205.E)return;CH205.pose='idle';ch205Sync();say('🐭 Cheddar drags himself up, rubbing his head. The keys still burn in their bowls. Speak with him to try again.')})}
  else{CH205.pose='idle';ch205Sync()}}
// ---------------- the court: spawning ----------------
function us205Count(k){let n=0;enemies.forEach(e=>{if(e.us205===k&&!e.dead)n++});return n}
function us205Alive(){let n=0;enemies.forEach(e=>{if(e.us205&&!e.dead)n++});return n}
function us205Spawn(kind,at){const L=us205Spots(),p=at||L[Math.floor(Math.random()*L.length)];if(!p)return null;const lv=US205.lv-1+Math.floor(Math.random()*3);
  const en=kind==='siph'?'vampm':kind==='mist'?'nosferatu':kind==='brk'?'vampk':kind;let e=null;const x=p.x+(Math.random()-.5)*2,z=p.z+(Math.random()-.5)*2;
  try{e=spawnEnemy(en,x,z,kind==='brk'?lv+2:lv,{agg:1,elite:kind==='brk'?1:0})}catch(err){if(!US205.err++)console.error('v205 spawn',err)}if(!e)return null;
  e.us205=kind==='vamp'?'thrall':kind==='bloodbat'?'bat':kind;e.agg=1;e.hunt=1;e.usP=new THREE.Object3D();e.usP.us205K=1;
  // the swarm is many and weak; the specials are sturdier
  const hk=e.us205==='thrall'?.55:e.us205==='bat'?.45:e.us205==='siph'?.8:e.us205==='mist'?.7:2.6;try{e.c.st.hp*=hk;e.c.h=Math.max(1,Math.round(M(e.c)))}catch(_){}
  e.usK=e.us205==='bat'?(Math.random()<.7?1:0):e.us205==='thrall'?(Math.random()<.5?1:0):0;
  if(e.us205==='siph'){e.usS={st:'walk',t:0,to:us205SiphSpot()};e.c.n='Blood Siphoner'}
  if(e.us205==='mist'){e.usM={st:'mist',t:0};e.c.n='Mist Stalker';e.m.visible=false;if(e.hb)e.hb.visible=false;e.usK=1}
  if(e.us205==='brk'){e.usB={st:'march',t:0,cd:2};e.c.n='Ser Morvaine, the Gate-Breaker';try{e.m.scale.multiplyScalar(1.3)}catch(_){}e.usK=1}
  burst(gY(e.m.position,.7),0x8a0a1a,22,1.6,1.6,.7);return e}
// a siphoner's place at the edge, away from the others, facing Cheddar
function us205SiphSpot(){const c=us205C()||new THREE.Vector3(),L=us205Spots();let best=null,bd=-1;L.forEach(p=>{let d=99;enemies.forEach(e=>{if(e.us205==='siph'&&!e.dead&&e.usS&&e.usS.to)d=Math.min(d,Math.hypot(e.usS.to.x-p.x,e.usS.to.z-p.z))});if(d>bd){bd=d;best=p}});
  if(!best)return {x:c.x+6,z:c.z};const dx=best.x-c.x,dz=best.z-c.z,l=Math.hypot(dx,dz)||1,r=Math.min(l,8.5);return {x:c.x+dx/l*r,z:c.z+dz/l*r}}
// ---------------- the siphon tethers (drawn from a list of caster spots, so a partner sees them too) ----------------
var US205T=[];
function us205Tethers(list){const c=us205C();while(US205T.length>list.length){const t=US205T.pop();scene.remove(t.m);t.m.material.dispose()}
  while(US205T.length<list.length){const m=new THREE.Mesh(US205.tg||(US205.tg=(()=>{const g=new THREE.CylinderGeometry(.07,.07,1,6,1,true);g.translate(0,.5,0);g.rotateX(Math.PI/2);return g})()),
      new THREE.MeshBasicMaterial({color:0xff1a2a,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));m.userData.lpsSkip=1;m.renderOrder=4;scene.add(m);US205T.push({m})}
  if(!c)return;list.forEach((p,i)=>{const t=US205T[i],a=new THREE.Vector3(p.x,GH(p.x,p.z)+1.6,p.z),b=new THREE.Vector3(c.x,c.y+.6,c.z),L=a.distanceTo(b);t.m.position.copy(a);t.m.lookAt(b);t.m.scale.set(1+.4*Math.sin(performance.now()/90+i),1+.4*Math.sin(performance.now()/90+i),L);
    t.m.visible=cq205Here(0);if(Math.random()<.5)burst(b.clone().lerp(a,Math.random()),0xff2a3a,1,.15,.2,.5)})}
// ---------------- the tick ----------------
function us205Tick(dt,now){const E=US205.E,t=now/1000;us205Sky(dt,t);
  if(!E){US205.mist.forEach(o=>{o.k=Math.max(0,o.k-dt*.5);o.m.material.opacity=o.k*.7;o.m.visible=o.k>.01&&cq205Here(0)});return}
  {const co=typeof co151On=='function'&&co151On();if(!cq205Here(0)){us205Stop('quiet');if(co&&co151Host()&&typeof co205Ev=='function')co205Ev('quiet');return}
    if(co?(co151Host()&&!co151Standing()):hero.hp<=0){us205Stop('quiet');if(co&&typeof co205Ev=='function')co205Ev('quiet');return}}
  const host=us205Host(),c=us205C(),k=Math.min(1,E.t/US205.T),q=Math.min(3,Math.floor(k*4));
  // the mist pools breathe
  US205.mist.forEach((o,i)=>{o.k=Math.min(1,o.k+dt*.6);o.m.visible=true;o.m.material.opacity=o.k*(.55+.15*Math.sin(t*1.3+i));o.m.rotation.y+=dt*.2;if(Math.random()<dt*6)burst(new THREE.Vector3(o.p.x+(Math.random()-.5)*3,o.p.y+.3,o.p.z+(Math.random()-.5)*3),0x6a0a14,1,.4,.9,1.2)});
  if(!E.go)return us205Hud();
  // the siphons: casters standing at their place tether him; while any holds he bleeds and the seal stalls
  const sl=[];enemies.forEach(e=>{if(e.us205==='siph'&&!e.dead&&e.usS&&e.usS.st==='drain')sl.push({x:e.m.position.x,z:e.m.position.z})});if(host)E.sl=sl;us205Tethers(E.sl||sl);E.siN=(E.sl||sl).length;
  if(E.siN){if(!E.said.si){E.said.si=1;say('🩸 A magister’s blood siphon locks onto Cheddar — while it holds, the seal will not unwind. Kill the caster!')}}
  // progress (stalls under a siphon) and his health (host)
  if(host){if(!E.siN)E.t+=dt;else{E.stall+=dt;E.hp-=dt*1.6*E.siN}}
  // threads of gold from his paws into the seal
  if(Math.random()<dt*20&&GG205.S&&GG205.S.seal){const a=new THREE.Vector3(c.x,c.y+1.3,c.z),b=new THREE.Vector3();GG205.S.seal.g.getWorldPosition(b);b.x+=(Math.random()-.5)*5;b.y+=(Math.random()-.5)*5;burst(a.clone().lerp(b,Math.random()),E.siN?0xff3a3a:0xffe0a0,1,.3,.3,.5)}
  // his ward dome
  if(CH205.dome){const d=CH205.dome;d.position.set(0,0,0);d.scale.setScalar(1+.04*Math.sin(t*3));d.material.opacity=(.07+.05*Math.sin(t*2.4))*(E.hp>30?1:.6+.4*Math.sin(t*14));d.material.color.setHex(E.hp>30?0xffe0a0:0xff7a5a);d.visible=true}
  // the Ward Flare: throws back what is at him
  E.flare-=dt;if(E.flare<=0){E.flare=US205.flare;ring(c,0xffe0a0,4.6,700);burst(gY(c,1),0xffe8b0,50,3.4,1.6,.7);svSnd('gong',.5,1.5);CH205.hit=0;
    enemies.forEach(s=>{if(!s.us205||s.dead||s.us205==='brk'&&s.usB&&s.usB.st==='wind')return;const dx=s.m.position.x-c.x,dz=s.m.position.z-c.z,L=Math.hypot(dx,dz);if(L<4.6&&L>.01){s.vx=(s.vx||0)+dx/L*10;s.vz=(s.vz||0)+dz/L*10;try{eStatus(s,{stun:1.4},0,'h')}catch(_){}}})}
  // the quarters: a ring breaks at the end of each; a title line at the start of each
  if(q>E.q){for(let i=E.q;i<q;i++)gg205BreakRing(i);E.q=q;us205Quarter(q)}else if(!E.said['q0']){E.said.q0=1;us205Quarter(0)}
  // the eclipse (III): dark for a while
  E.ecl=q===2&&k<.68?1:0;
  // the court (host): keep the mix coming, faster as it goes
  if(host){E.sp-=dt;const cap=(typeof co151On=='function'&&co151On())?US205.capC:US205.cap;if(E.sp<=0){E.sp=Math.max(.7,2.4-1.4*k);const alive=us205Alive();if(alive<cap){const mix=US205.mix[q];let tot=0;mix.forEach(m=>tot+=m[1]);
        let n=1+Math.floor(Math.random()*(1.4+k*2.2));for(let j=0;j<n&&alive+j<cap;j++){let u=Math.random()*tot,kind=mix[0][0];for(const m of mix){u-=m[1];if(u<=0){kind=m[0];break}}
          if(kind==='siph'&&us205Count('siph')>=(q>=3?3:2))kind='vamp';if(kind==='mist'&&us205Count('mist')>=4)kind='bloodbat';us205Spawn(kind)}}}
    // the Gate-Breaker comes once, at the start of IV
    if(q>=3&&!E.brkDone){E.brkDone=1;const L=us205Spots();const far=L.reduce((a,p)=>!a||Math.hypot(p.x-c.x,p.z-c.z)>Math.hypot(a.x-c.x,a.z-c.z)?p:a,null);us205Spawn('brk',far)}
    // Nightwing Dives in the last stretch
    if(k>=.82){E.diveT-=dt;if(E.diveT<=0&&!E.dive){E.diveT=4.2-k*1.6;us205Dive()}}
    if(E.hp<=0){E.hp=0;if(typeof co205Ev=='function')co205Ev('fall');us205Stop('fall');return}
    if(E.t>=US205.T){us205Win();return}}
  us205DiveTick(dt);
  // his heart, when he is hurt
  if(E.hp<35){E.hb-=dt;if(E.hb<=0){E.hb=E.hp<18?.55:.9;try{dg165Snd('heart',.8,1)}catch(_){}}}
  // lightning over the gate now and then
  E.lt-=dt;if(E.lt<=0){E.lt=5+Math.random()*7;us205Bolt()}
  // first time someone fights inside the circle
  if(!E.said.wd&&Math.hypot(pl.position.x-c.x,pl.position.z-c.z)<ch205Spots().r&&enemies.some(s=>s.us205&&!s.dead&&Math.hypot(s.m.position.x-c.x,s.m.position.z-c.z)<ch205Spots().r)){E.said.wd=1;say('✨ Cheddar’s circle burns the court: inside it they take more damage.')}
  us205Hud()}
function us205Quarter(q){const tx=[['The court stirs','Thralls and bats pour out of the mist'],['Blood Siphons','Kill the magisters before they drain him'],['The Eclipse','The moon goes black: stay in the light'],['The Gate-Breaker','Stop his blade — then hold to the end']][q];
  try{cq205Card('The Unsealing · '+['I','II','III','IV'][q],tx[0],tx[1],'')}catch(_){}
  if(q===2){svSnd('roar',.7,.4);try{dg165Snd('wail',1,.7)}catch(_){}shake(.3);say('🌑 Something slides across the blood moon. The clearing goes dark — only Cheddar’s circle still burns.')}
  if(q===3)say('⚔️ Heavy footsteps on the road. A Blood Knight in black plate, taller than the rest — Ser Morvaine, the Gate-Breaker — marches on Cheddar.');
  if(q===1)say('🩸 Robed magisters glide out of the mist, blood dripping from their fingers.')}
function us205Win(){const E=US205.E;if(!E)return;if(typeof co205Ev=='function')co205Ev('won');const C=CQ205.c1;C.st=Math.max(C.st,3);CQ205.trkK='';us205Stop('won');
  CH205.pose='idle';ch205Sync();gg205Shatter();if(typeof co205Credit=='function')co205Credit('c1');
  cq205After(1.2,()=>{cq205Card('The Citadel · Main Quest','The Seal Is Broken','The doors of the Great Gate grind open','The way to '+cq205I(1).n+' lies open');try{mSfx('victory')}catch(_){}});
  say('🐭 Cheddar: “HA! Unwound, every thread of it! The doors — go, go, before the stones remember what they were!”')}
// ---------------- lightning ----------------
function us205Bolt(){const S=gg205Spot(),F=S.F,[x,z]=F.W2(F.reach+4+Math.random()*10,(Math.random()-.5)*26);try{flash('rgba(255,210,220,.22)')}catch(_){}US205.bolt=.25;
  try{dg165Snd('rumble',.9,.7+Math.random()*.3)}catch(_){}svSnd('crack',.5,.4+Math.random()*.2);const y=GH(x,z);for(let i=0;i<12;i++)burst(new THREE.Vector3(x+(Math.random()-.5)*.6,y+18-i*1.6,z+(Math.random()-.5)*.6),0xffd8e0,1,.1,.1,.18)}
// ---------------- the specials' own minds ----------------
function us205AI(e,dt,now){const E=US205.E,c=us205C();if(!E||!c)return false;
  if(e.us205==='siph'){const S=e.usS;S.t+=dt;if(S.st==='walk'){const dx=S.to.x-e.m.position.x,dz=S.to.z-e.m.position.z,L=Math.hypot(dx,dz);if(L>.3&&S.t<8){const st=Math.min(L,dt*2.6);walkM(e.m,dx/L*st,dz/L*st);e.m.rotation.y=Math.atan2(dx,dz);animC(e.m,now,true,2.6);}
      else{S.st='drain';S.t=0;e.m.rotation.y=Math.atan2(c.x-e.m.position.x,c.z-e.m.position.z);svSnd('hiss',.6,.7)}return true}
    if(S.st==='drain'){e.m.rotation.y=Math.atan2(c.x-e.m.position.x,c.z-e.m.position.z);animC(e.m,now,false,0);if(Math.random()<dt*3)burst(gY(e.m.position,1.6),0xff2a3a,2,.4,.6,.5);return true}return false}
  if(e.us205==='mist'){const S=e.usM;if(S.st==='mist'){S.t+=dt;e.m.visible=false;if(e.hb)e.hb.visible=false;const dx=c.x-e.m.position.x,dz=c.z-e.m.position.z,L=Math.hypot(dx,dz);
      if(L>2.4&&S.t<5){const st=Math.min(L-2.2,dt*7.5);e.m.position.x+=dx/L*st;e.m.position.z+=dz/L*st;if(Math.random()<.9)burst(new THREE.Vector3(e.m.position.x+(Math.random()-.5),GH(e.m.position.x,e.m.position.z)+.3+Math.random()*.6,e.m.position.z+(Math.random()-.5)),0x7a0a16,2,.6,.6,.6);
        if(Math.random()<.2)burst(gY(e.m.position,1.2),0xff2030,1,.05,.05,.3)}
      else{S.st='form';S.t=0;S.W=svWarn({k:'c',r:1.6},{x:e.m.position.x,z:e.m.position.z,a:0},.9,{col:0xb01020});svSnd('hiss',.8,.5)}return true}
    if(S.st==='form'){S.t+=dt;if(S.t>=.9){S.st='hunt';e.m.visible=true;burst(gY(e.m.position,1),0x8a0a1a,40,2,1.6,.7);const P=pl.position;if(hero.hp>0&&Math.hypot(P.x-e.m.position.x,P.z-e.m.position.z)<1.6)hitTarget(e,pl,1.1);
        try{CH205.hit=.4;if(us205Host()&&US205.E)US205.E.hp-=4}catch(_){}}return true}return false}
  if(e.us205==='brk'){const S=e.usB;S.cd=Math.max(0,S.cd-dt);const dx=c.x-e.m.position.x,dz=c.z-e.m.position.z,L=Math.hypot(dx,dz);
    if(S.st==='march'){if(L>2.6){e.m.rotation.y=Math.atan2(dx,dz);const st=Math.min(L-2.4,dt*2.0);walkM(e.m,dx/L*st,dz/L*st);animC(e.m,now,true,2);if(Math.random()<dt*2)svSnd('step',.9,.6);return true}
      if(S.cd<=0){S.st='wind';S.t=0;S.h0=e.c.h;E.brk={wind:1,W:svWarn({k:'c',r:2.4},{x:c.x,z:c.z,a:0},2.2,{col:0xd01808})};svSnd('swing',.9,.5);svSnd('roar',.5,.7);if(!E.said.brk){E.said.brk=1;say('⚔️ He raises the greatsword over Cheddar — hurt him before it falls!')}}animC(e.m,now,false,0);return true}
    if(S.st==='wind'){S.t+=dt;e.m.rotation.y=Math.atan2(dx,dz);e.usWind=Math.min(1,S.t/2.2);
      if(S.h0-e.c.h>=M(e.c)*US205.brkI){S.st='reel';S.t=0;E.brk=null;e.usWind=0;popT(e.m.position,'INTERRUPTED','#ffd860',true);svSnd('stag',1,.8);try{eStatus(e,{stun:2.2},0,'h')}catch(_){}return true}
      if(S.t>=2.2){S.st='march';S.cd=5.5;E.brk=null;e.usWind=0;const p=new THREE.Vector3(c.x,0,c.z);svShock(p,0xff2a20,2.6,.5);burst(gY(p,.5),0xff3020,40,2.4,2,.7);shake(.45);svSnd('heavy',1.2,.6);
        if(us205Host()&&US205.E){US205.E.hp-=22;CH205.hit=.6}if(hero.hp>0&&Math.hypot(pl.position.x-c.x,pl.position.z-c.z)<2.75)hitTarget(e,pl,1.8)}return true}
    if(S.st==='reel'){S.t+=dt;animC(e.m,now,false,0);if(S.t>2.2){S.st='march';S.cd=3}return true}return false}
  return false}
// ---------------- Nightwing Dives: lanes of bats from the edge into Cheddar ----------------
function us205Dive(){const E=US205.E,c=us205C();if(!E||!c)return;const L=us205Spots(),n=E.t/US205.T>.92?2:1,W=[],lanes=[];
  for(let i=0;i<n;i++){const p=L[Math.floor(Math.random()*L.length)],a=Math.atan2(c.x-p.x,c.z-p.z),len=Math.hypot(c.x-p.x,c.z-p.z);lanes.push({x:p.x,z:p.z,a,len});W.push(svWarn({k:'l',w:2.2,l:len,b:0},{x:p.x,z:p.z,a},1.7,{col:0xb01020}))}
  E.dive={t:0,lanes,W,fired:0};if(!E.said.dive){E.said.dive=1;say('🦇 The seal screams. Bats mass at the edge — stand in their lane to take the swarm yourself!')}svSnd('shriek',.7,.8);if(typeof co205Dive=='function')co205Dive(lanes)}
function us205DiveTick(dt){const E=US205.E;if(!E||!E.dive)return;const D=E.dive,c=us205C();D.t+=dt;
  if(!D.fired&&D.t>=1.7){D.fired=1;D.lanes.forEach(l=>{const P=pl.position,dx=P.x-l.x,dz=P.z-l.z,f=dx*Math.sin(l.a)+dz*Math.cos(l.a),s=Math.abs(dx*Math.cos(l.a)-dz*Math.sin(l.a)),inL=hero.hp>0&&f>-.4&&f<l.len-1.2&&s<1.3;
      // the swarm streaks down the lane
      for(let i=0;i<26;i++){const u=Math.random()*(inL?Math.max(1,f):l.len);burst(new THREE.Vector3(l.x+Math.sin(l.a)*u+(Math.random()-.5),GH(l.x,l.z)+.8+Math.random()*1.4,l.z+Math.cos(l.a)*u+(Math.random()-.5)),0x2a0a10,2,1.2,.6,.5)}
      svSnd('shriek',.9,1.1);
      if(inL){const src=enemies.find(s=>s.us205&&!s.dead)||{c:{mt:'p',l:US205.lv},m:{position:P}};try{hitTarget(src,pl,.9)}catch(_){}popT(P,'SHIELDED HIM','#ffe0a0',true);
        if(us205Host())E.hp=Math.min(US205.hpM,E.hp+1)}
      else if(us205Host()){E.hp-=7;CH205.hit=.5;burst(gY(c,.9),0xff2030,20,1.2,1.2,.5)}})}
  E.diveFlag=D.t<1.7;if(D.t>2.2)E.dive=null}
// ---------------- the darkness, the moon, lightning (atmos) ----------------
function us205Sky(dt,t){const E=US205.E,here=cq205Here(0),M=US205.moon;const want=E&&here?(E.ecl?1:.72):0;US205.dk+=(want-US205.dk)*Math.min(1,dt*(want>US205.dk?.7:.35));
  if(M){M.k+=((E&&here?1:0)-M.k)*Math.min(1,dt*.5);M.ec+=((E&&E.ecl?1:0)-M.ec)*Math.min(1,dt*.8);M.g.visible=M.k>.01&&here;M.m.material.opacity=M.k*.95;M.sh.material.opacity=M.ec*.97;M.sh.position.x=(1-M.ec)*30}
  US205.bolt=Math.max(0,(US205.bolt||0)-dt)}
{const f=atmos;atmos=function(dt,now){const r=f.apply(this,arguments);try{const d=US205.dk;if(d>.002&&cq205Here(0)){const b=US205.bolt>0?US205.bolt*4:0;
      sun.intensity*=Math.max(.04,1-.86*d)+b*.6;hemi.intensity*=Math.max(.1,1-.72*d)+b*.8;
      const fc=US205.fc||(US205.fc=new THREE.Color(0x1a0206));scene.fog.color.lerp(fc,.75*d);scene.background=scene.fog.color;scene.fog.density*=1+.35*d;
      try{const su=SKY.material.uniforms;su.top.value.lerp(fc,.85*d);su.hor.value.lerp(fc,.75*d)}catch(_){}}}catch(_){}return r}}
// ---------------- hooks ----------------
// half of them go for Cheddar: a proxy target beside him
{const f=eTarget;eTarget=function(e,m,dpl){if(e&&e.us205&&e.usK&&US205.E&&CH205.g){const K=CH205.g.position,dx=m.position.x-K.x,dz=m.position.z-K.z,L=Math.hypot(dx,dz)||1;e.usP.position.set(K.x+dx/L*.9,K.y,K.z+dz/L*.9);return e.usP}return f.apply(this,arguments)}}
{const f=hitTarget;hitTarget=function(e,tg,mult,mt){if(tg&&tg.us205K){const E=US205.E;if(!E||!us205Host())return;const d=(e&&e.us205==='bat'?1.1:1.5)*(mult||1);E.hp-=d;CH205.hit=.3;
    if(CH205.g)burst(gY(CH205.g.position,.6),0xff3a3a,6,.8,.8,.4);return}return f.apply(this,arguments)}}
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.us205){if(e.us205==='mist'&&e.usM&&e.usM.st!=='hunt')return;
    const c=us205C();if(c&&US205.E&&Math.hypot(e.m.position.x-c.x,e.m.position.z-c.z)<ch205Spots().r+.3)d*=US205.ward;
    if(e.usK&&e.us205!=='brk'&&!dot&&Math.random()<.35)e.usK=0}return f.apply(this,arguments)}}
{const f=eTick;eTick=function(e,dt,now){if(e&&e.us205&&US205.E){try{if(us205AI(e,dt,now))return true}catch(err){if(!US205.err++)console.error('v205 ai',err)}}return f.apply(this,arguments)}}
{const f=kill;kill=function(e){if(e&&e.usM&&e.usM.W)try{e.usM.W.kill()}catch(_){}if(e&&e.us205==='brk'&&US205.E&&US205.E.brk){try{US205.E.brk.W.kill()}catch(_){}US205.E.brk=null}return f.apply(this,arguments)}}
// half XP, loot 35% of the time
{const f=gw150X;gw150X=function(e){const k=f.apply(this,arguments);return e&&e.us205?k*.5:k}}
{const f=lootE;lootE=function(e){if(e&&e.us205&&Math.random()>.35)return;return f.apply(this,arguments)}}
// no mount while it lasts; recall just ends it
{const f=toggleMount;toggleMount=function(){if(US205.E&&!riding)return say('🐭 No time for that — Cheddar needs you here!');return f.apply(this,arguments)}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{us205Tick(dt,now)}catch(e){if(!US205.err++)console.warn('v205 unsealing tick',e)}return r}}
// a save made during it loads before it (the keys still in the bowls)
CQ205L.unshift(()=>{if(US205.E)us205Stop('quiet')});
