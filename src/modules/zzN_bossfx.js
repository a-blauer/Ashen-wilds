// ================= v89 bossfx: breakable Rime Wraith orbs, den walls that never block the camera, targetable necks and eye-stalks =================
// 1. ORBS (den 2 and any boss using BMV.orbs): every Wailing Orb is a one-hit "sub-target" — any hero swing, shot, skill or
//    companion hit shatters it; an orb that drifts into a lit Warmfire dissolves in a hiss of steam (dark fires do nothing).
//    Orbs are per-player copies in co-op (each copy hunts its own hero), so breaking one is local and needs no relay.
// 2. CUTAWAY: den scenery (dens 0-3; dens 4-5 already use dqCut) gets a shader that dithers away whatever stands between the
//    camera and the hero (a tube along the line of sight, like the trees in the wilds) and — when the camera is out past the
//    wall — the whole stretch of wall on the camera's side (like dqCut). The floor is never cut.
// 3. SUB-TARGETS: Hydra brood necks (den 1), Argus eye-stalks (den 0) and orbs live in `enemies` as inert proxy enemies
//    (e.bfx). Tab (den order: nearest first, then on round the list), clicking/tapping them, the target frame, homing shots
//    and targeted skills all work on them. Every hit on a proxy is handed to the neck's / stalk's own health logic
//    (hyHitNeck / arHitStalk: sever → stump → sear or regrow, open eyes +60%, eye burst), so nothing is counted twice.
var BFX={subs:[],aHit:null,cyc:null,cycT:0,mk:null,tap:null,cut:{},cutN:0,orbN:0,shN:0,stN:0};
// ---------------- sub-target proxies ----------------
function bfxProxy(A,kind,ref,o){const B=bossEnt(A.i),l=B?B.c.l:(A.b.lvl||40),c=enemyC('ghoul',l,{});c.n=o.n;
  c.st=Object.assign({},c.st,{hp:Math.max(1,o.hpM),pd:0,md:0});c.h=Math.max(0,o.hp);
  const m=new THREE.Group();m.position.set(o.x,GH(o.x,o.z),o.z);m.bs=o.bs||1;scene.add(m);
  const hb=new THREE.Object3D();hb.fill=new THREE.Object3D();   // the neck/stalk draws its own bar
  const e={c,m,hb,cd:99,ch:0,vx:0,vz:0,tier:3,wx:o.x,wz:o.z,wt:0,agg:1,dots:[],
    bfx:{k:kind,ref,A,sub:o.sub,pts:o.pts,pm:o.pm},dprop:{n:o.n,die:(x,killed)=>bfxGone(x,killed)}};
  ref._bfx=e;enemies.push(e);BFX.subs.push(e);return e}
function bfxGone(e,killed){const r=e.bfx&&e.bfx.ref;if(r&&r._bfx===e)r._bfx=null;const i=BFX.subs.indexOf(e);if(i>=0)BFX.subs.splice(i,1);
  // a broken sub-target hands the target back to the Sovereign so a ranged hero keeps shooting
  if(e.bfx&&e.bfx.wasT){const B=e.bfx.A&&bossEnt(e.bfx.A.i);if(!tgt&&B&&!B.dead&&AF&&AF.f)setTarget(B)}}
function bfxDrop(e){if(!e||e._gone)return;if(e.bfx)e.bfx.wasT=tgt===e;dqPropGone(e,false)}
const bfxLive=e=>e&&!e.dead&&!e._gone;
// damage on a proxy goes to the thing it stands for
function bfxDmg(e,d,s){if(BFX.aHit)BFX.aHit.add(e);const b=e.bfx,A=b.A,r=b.ref;if(!(d>0))return;
  try{if(b.k=='neck'){if(r.st=='up'||r.st=='rise'){hyHitNeck(A,r,d);e.c.h=Math.max(0,r.hp)}if(r.st!='up'&&r.st!='rise')bfxDrop(e)}
    else if(b.k=='stalk'){if(r.st!='dead'){arHitStalk(A,r,d);e.c.h=Math.max(0,r.hp)}if(r.st=='dead')bfxDrop(e)}
    else if(b.k=='orb'){bfxOrbEnd(A,r,'shatter');bfxDrop(e)}}catch(err){console.error('bossfx hit',err)}}
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.bfx){if(!e.dead&&!e._gone)bfxDmg(e,d,s);return}return f.apply(this,arguments)}}
// proxies stand for den objects that keep their own level-free health: no level-gap penalty on them
{const f=rollHero;rollHero=function(e){if(e&&e.bfx){const c=e.c,l=c.l;c.l=Math.min(l,hero.lvl);try{return f.apply(this,arguments)}finally{c.l=l}}return f.apply(this,arguments)}}
// never sent to co-op peers as a world monster
{const f=mpElig;mpElig=function(e){return e&&e.bfx?false:f.apply(this,arguments)}}
// ---------------- orbs ----------------
function bfxOrbEnd(A,f,how){const L=bxA(A),i=L.indexOf(f);if(i>=0)L.splice(i,1);const g=f.ms;if(!g)return;const p=g.position.clone();if(g.parent)g.parent.remove(g);f.t=0;
  if(how=='shatter'){BFX.orbN++;burst(p,0xe8f8ff,30,3,2,.5);burst(p,0x9ad8ff,16,2,2.5,.45);kqFlash(p,0xcfefff,2.6,220);ring(V(p.x,0,p.z),0x9ad8ff,2,260);dn(p,'Shattered!','#cfefff',-24,700);sfx('shatter',.6)}
  else if(how=='steam'){BFX.stN++;const q=V(p.x,p.y-.2,p.z);burst(q,0xdfe6ee,28,1.2,3.4,1.1);burst(p,0xffffff,14,.8,2.6,.9);burst(p,0xffb060,8,.8,1.6,.5);kqFlash(p,0xffd0a0,2.2,240);
    tw(900,k=>{if(Math.random()<.6)burst(V(q.x+(Math.random()-.5)*.6,q.y+k*2,q.z+(Math.random()-.5)*.6),0xe8eef4,1,.4,1.5,.9)});dn(p,'💨 Hiss!','#e8f0f8',-24,800);sfx('hiss',.7)}}
function bfxOrbs(A){const L=bxA(A),D=A.i===2&&A.dn;
  for(let i=L.length-1;i>=0;i--){const f=L[i];if(!f||f.k!='orb'||!f.ms)continue;const p=f.ms.position;
    // a lit Warmfire melts it (a snuffed one does not)
    if(D&&D.br){let hot=null;for(const B of D.br)if(B.lit&&Math.hypot(p.x-B.x,p.z-B.z)<1.7){hot=B;break}
      if(hot){if(f._bfx)bfxDrop(f._bfx);bfxOrbEnd(A,f,'steam');continue}}
    const e=f._bfx;if(!bfxLive(e)){bfxProxy(A,'orb',f,{n:'Wailing Orb',hp:1,hpM:1,x:p.x,z:p.z,bs:.7,sub:'One hit shatters it · a lit Warmfire melts it',pts:()=>[f.ms.position],pm:'orb'});continue}
    e.m.position.x=p.x;e.m.position.z=p.z}
  for(const e of BFX.subs.slice())if(e.bfx.k=='orb'&&(L.indexOf(e.bfx.ref)<0||!e.bfx.ref.ms||!e.bfx.ref.ms.parent))bfxDrop(e)}
// ---------------- necks and stalks ----------------
function bfxNecks(A){if(typeof HY=='undefined'||!HY.necks)return;const y0=GH(A.cx,A.cz);
  for(const N of HY.necks){const live=N.st=='up'||N.st=='rise',e=N._bfx;
    if(!live){if(e)bfxDrop(e);continue}
    if(!bfxLive(e)){bfxProxy(A,'neck',N,{n:'Brood Neck',hp:N.hp,hpM:N.hpM,x:N.x,z:N.z,bs:1.4,sub:'Sever it, then sear the stump with serpent-fire',
      pts:()=>{const gy=GH(N.x,N.z);return [N.p,V(N.x,gy+1.6*HY_NS,N.z),V(N.x,gy+.8*HY_NS,N.z)]},pm:'neck'});continue}
    e.c.h=Math.max(0,N.hp);e.c.st.hp=Math.max(1,N.hpM);e.m.position.x=N.x;e.m.position.z=N.z}}
function bfxStalks(A){if(typeof AR=='undefined'||!AR.st)return;
  for(const T of AR.st){const live=T.st!='dead',e=T._bfx;
    if(!live){if(e)bfxDrop(e);continue}
    if(!bfxLive(e)){bfxProxy(A,'stalk',T,{n:'Eye-stalk',hp:T.hp,hpM:T.hpM,x:T.x,z:T.z,bs:1.2,sub:'Strike it down — an open eye takes +60%',
      pts:()=>{const gy=GH(T.x,T.z);return [T.p,V(T.x,gy+2,T.z),V(T.x,gy+.9,T.z)]},pm:'stalk'});continue}
    e.c.h=Math.max(0,T.hp);e.c.st.hp=Math.max(1,T.hpM);const o=T.st=='open'||T.st=='wake';e.bfx.sub=o?'👁 Eye OPEN — takes +60% damage':'Strike it down — an open eye takes +60%'}}
function bfxSync(dt,now){const A=AF;
  for(const e of BFX.subs.slice())if(!A||!A.f||e.bfx.A!==A||e.dead)bfxDrop(e);
  if(A&&A.f&&bossEnt(A.i)){try{bfxOrbs(A);if(A.i===1)bfxNecks(A);if(A.i===0)bfxStalks(A)}catch(err){console.error('bossfx sync',err)}}
  bfxMark(now)}
{const f=arenaTick;arenaTick=function(dt,now){const r=f.apply(this,arguments);bfxSync(dt,now);return r}}
{const f=arenaClear;arenaClear=function(A){const r=f.apply(this,arguments);for(const e of BFX.subs.slice())if(e.bfx.A===A)bfxDrop(e);return r}}
// a red chevron over the targeted neck / stalk / orb (the ground ring alone is easy to miss under a tall neck)
function bfxMark(now){let m=BFX.mk;const t=tgt,on=t&&t.bfx&&bfxLive(t);
  if(!m){if(!on)return;m=BFX.mk=new THREE.Mesh(new THREE.ConeGeometry(.24,.5,4),new THREE.MeshBasicMaterial({color:0xff4a2a,transparent:true,opacity:.95,depthTest:false,depthWrite:false,fog:false}));m.rotation.x=Math.PI;m.renderOrder=30;m.material.userData.lps=1;scene.add(m)}
  m.visible=!!on;if(!on)return;const P=t.bfx.pts()[0];m.position.set(P.x,P.y+(t.bfx.k=='orb'?.9:1.3)+.12*Math.sin(now/160),P.z);m.rotation.y=now/400}
// ---------------- melee / projectiles reach a proxy once (no double hits with the dens' own hit paths) ----------------
{const f=area;area=function(){const o=BFX.aHit;BFX.aHit=new Set();try{return f.apply(this,arguments)}finally{BFX.aHit=o}}}
const bfxMt=s=>(s&&s.mt)||heroMt();
if(DEN[1]&&DEN[1].hitA)DEN[1].hitA=function(A,p,r,dm,s,dir,half){for(const N of HY.necks){if(N.st!='up'&&N.st!='rise')continue;
  if(!(d01InArc(p,r,dir,half,N.x,N.z,1.1)||d01InArc(p,r,dir,half,N.p.x,N.p.z,.9)))continue;const e=N._bfx;
  if(bfxLive(e)){if(!(BFX.aHit&&BFX.aHit.has(e)))heroHit(e,dm,bfxMt(s),{s,proc:!s||s.proc!==false})}else hyHitNeck(A,N,dm)}};
if(DEN[0]&&DEN[0].hitA)DEN[0].hitA=function(A,p,r,dm,s,dir,half){for(const T of AR.st){if(T.st=='dead')continue;if(!d01InArc(p,r,dir,half,T.x,T.z,1.0))continue;const e=T._bfx;
  if(bfxLive(e)){if(!(BFX.aHit&&BFX.aHit.has(e)))heroHit(e,dm,bfxMt(s),{s,proc:!s||s.proc!==false})}else arHitStalk(A,T,dm)}};
// den projectile check: the shot itself is passed on so a proxy is struck through the normal hit path and the shot ends
function d01Shots(fn){if(typeof shots=='undefined')return;for(let i=shots.length-1;i>=0;i--){const sh=shots[i];if(!sh||sh.t<=0||(sh.s&&sh.s.cc)||sh.d01)continue;
  const r=fn(sh.m.position,sh.dm,sh.s,sh);if(r){sh.t=0;sh.d01=1;if(r==='rm'){scene.remove(sh.m);shots.splice(i,1)}}}}
function bfxShotHit(e,sh){if(!sh.hit)sh.hit=new Set();if(sh.hit.has(e))return false;sh.hit.add(e);const s=sh.s||{};
  if(s.big||s.splash){ring(sh.m.position,s.col||0xffffff,s.big?4:1.6,320);area(sh.m.position,s.big?2.2:s.splash,sh.dm,s,null,0)}else heroHit(e,sh.dm,bfxMt(s),{s});
  burst(sh.m.position,s.col||0xffffff,12,2.5,2,.5);return (s.pierce||0)>=sh.hit.size?false:'rm'}
if(typeof HY!='undefined')HY.shot=(p,dm,s,sh)=>{for(const N of HY.necks){if(N.st!='up'&&N.st!='rise')continue;if(Math.hypot(p.x-N.p.x,p.z-N.p.z)<1.1||Math.hypot(p.x-N.x,p.z-N.z)<.9){
  const e=N._bfx;if(sh&&bfxLive(e))return bfxShotHit(e,sh);hyHitNeck(HY.A,N,dm);return true}}return false};
if(typeof AR!='undefined')AR.shot=(p,dm,s,sh)=>{for(const T of AR.st){if(T.st=='dead')continue;if(Math.hypot(p.x-T.x,p.z-T.z)<1.1||Math.hypot(p.x-T.ox,p.z-T.oz)<.9){
  const e=T._bfx;if(sh&&bfxLive(e))return bfxShotHit(e,sh);arHitStalk(AR.A,T,dm);return true}}return false};
// ---------------- ranged attacks follow the chosen target in a den fight ----------------
const BFX_RWT={bow:1,crossbow:1,sling:1,wand:1,orb:1,knives:1,staff:1};
function bfxRanged(){try{const wt=curWT();if(wt&&WBEH[wt])return !!BFX_RWT[wt];const C=CLS[hero.cls];return C.atk=='bow'||C.atk=='staff'}catch(_){return false}}
function bfxTgtOk(t,maxD){return t&&!t.dead&&!t.hid&&enemies.includes(t)&&AF&&AF.f&&d2(t.m.position,pl.position)<maxD}
{const f=aimDir;aimDir=function(){const t=tgt;if(!(typeof KQS!='undefined'&&KQS.gp)&&bfxTgtOk(t,24)&&bfxRanged()){const v=V(t.m.position.x-pl.position.x,0,t.m.position.z-pl.position.z),L=v.length();if(L>.05)return v.multiplyScalar(1/L)}return f.apply(this,arguments)}}
{const f=launch;launch=function(pos,d,spd,s){const n=shots.length,r=f.apply(this,arguments);
  try{const t=tgt;if(shots.length>n&&s&&!s.cc&&bfxTgtOk(t,26)){const sh=shots[shots.length-1],dx=t.m.position.x-pos.x,dz=t.m.position.z-pos.z,L=Math.hypot(dx,dz);
    if(L>.3&&(dx*d.x+dz*d.z)/L>.8){sh.htg=t;sh.bfxH=1;if(!sh.s.home)sh.s=Object.assign({},sh.s,{home:1})}}}catch(err){}return r}}
// a homing shot that already struck its target flies on straight (piercing bolts) instead of circling it
{const f=homeShot;homeShot=function(sh,dt){if(sh.bfxH){const e=sh.htg;if(!e||e.dead||!enemies.includes(e)||(sh.hit&&sh.hit.has(e)))return}return f.apply(this,arguments)}}
// ---------------- Tab, click and the target frame ----------------
function bfxCands(A){const c=V(A.cx,0,A.cz),p=pl.position;return enemies.filter(e=>!e.dead&&!e._gone&&!e.hid&&d2(e.m.position,c)<ARENA_R+4&&d2(e.m.position,p)<34)}
{const f=selectTarget;selectTarget=function(){const A=AF;if(!A||!A.f||inRealm)return f.apply(this,arguments);
  const C=bfxCands(A),p=pl.position,now=nowP(),byD=(a,b)=>d2(a.m.position,p)-d2(b.m.position,p);if(!C.length){if(tgt)setTarget(null);return}
  let L=BFX.cyc;if(!L||now-BFX.cycT>3000)L=C.slice().sort(byD);else{L=L.filter(e=>C.includes(e));L=L.concat(C.filter(e=>!L.includes(e)).sort(byD))}
  BFX.cyc=L;BFX.cycT=now;const i=L.indexOf(tgt);setTarget(L[(i+1)%L.length])}}
// pick the enemy under a screen point: sub-targets by their own points, others by body centre
function bfxPick(cx,cy){const r=gl.getBoundingClientRect();if(!r.width)return null;const th=Math.tan(cam.fov*Math.PI/360),v=new THREE.Vector3();let best=null,bs=1;
  for(const e of enemies){if(e.dead||e._gone||e.hid||!e.m.visible)continue;if(d2(e.m.position,pl.position)>40)continue;
    const P=e.bfx?e.bfx.pts():[gY(e.m.position,(e.boss?.55:.45)*(e.m.bs||1)*(e.boss?2.2:1.6))],rad=e.bfx?(e.bfx.k=='orb'?.7:.95):e.boss?1.6*(e.m.bs||1)*.5+.8:.75*(e.c.al?1.3:1);
    for(const q of P){v.copy(q).project(cam);if(v.z>1||v.z<-1)continue;const sx=r.left+(v.x+1)/2*r.width,sy=r.top+(1-v.y)/2*r.height,dist=cam.position.distanceTo(q)||1;
      const pr=Math.max(26,rad/(dist*th)*r.height/2),k=Math.hypot(sx-cx,sy-cy)/pr*(e.bfx?.5:1);if(k<bs){bs=k;best=e}}}
  return best}
function bfxClickOk(ev){return ev.target&&gl.contains(ev.target)&&!building&&!uiOpen()&&!inRealm&&party.length&&!(typeof KQS!='undefined'&&KQS.tg)}
addEventListener('pointerdown',ev=>{try{if(!bfxClickOk(ev))return;if(ev.pointerType=='touch'){BFX.tap={id:ev.pointerId,x:ev.clientX,y:ev.clientY,t:nowP()};return}
  if(ev.button!==0)return;const e=bfxPick(ev.clientX,ev.clientY);if(e&&e!==tgt)setTarget(e)}catch(err){}},{capture:true});
addEventListener('pointerup',ev=>{try{const t=BFX.tap;if(!t||t.id!==ev.pointerId)return;BFX.tap=null;if(Math.hypot(ev.clientX-t.x,ev.clientY-t.y)>12||nowP()-t.t>400)return;
  const e=bfxPick(ev.clientX,ev.clientY);if(e&&e!==tgt)setTarget(e)}catch(err){}},{capture:true});
// in a den fight the boss bar sits where the target frame goes: a non-boss target gets the frame just below the bar
{const st=document.createElement('style');st.textContent='body.bossf.bfxT #tgt{display:flex!important}';document.head.appendChild(st)}
function bfxTgtCls(){const t=tgt,on=!!(t&&!t.boss&&!t.dead&&AF&&AF.f);document.body.classList.toggle('bfxT',on);const el=$('tgt');if(!el)return;
  if(!on){if(el.style.top)el.style.top='';return}let y=0;[$('boss'),$('rwCold')].forEach(q=>{if(q&&q.offsetParent!==null&&q.style.display!='none'){const b=q.getBoundingClientRect();if(b.height)y=Math.max(y,b.bottom)}});
  const pr=(el.offsetParent||el.parentElement||document.body).getBoundingClientRect();if(y)el.style.top=Math.round(y-pr.top+6)+'px'}
function bfxPortrait(e){const b=e.bfx,g=new THREE.Group(),bm=q=>(q&&q.userData.bfxBase)||q;try{
    if(b.pm=='neck'){const N=b.ref;g.add(new THREE.Mesh(N.neck.geometry,bm(N.neck.material)),new THREE.Mesh(N.eyes.geometry,bm(N.eyes.material)))}
    else if(b.pm=='stalk'){const T=b.ref;T.g.children.forEach(c=>{if(c.isMesh)g.add(new THREE.Mesh(c.geometry,bm(c.material)))});const eg=T.eye.clone(true);eg.traverse(q=>{if(q.isSprite)q.visible=false;else if(q.isMesh)q.material=bm(q.material)});g.add(eg)}
    else{const o=b.ref.ms.clone(true);o.position.set(0,0,0);o.scale.setScalar(1);o.traverse(q=>{if(q.material&&q.material.depthTest===false)q.visible=false});g.add(o)}}catch(err){return null}
  g.rig=now=>{g.rotation.y=.55+Math.sin(now/1400)*.35};return g}
{const f=setTarget;setTarget=function(e){const r=f.apply(this,arguments);
  try{if(e&&e.bfx&&TPV.sc){const m=bfxPortrait(e);if(m){if(TPV.m)TPV.sc.remove(TPV.m);TPV.sc.add(m);TPV.m=m;m.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(m),c=bb.getCenter(V()),sz=bb.getSize(V()),q=Math.max(sz.x,sz.y,sz.z);
      TPV.cam.position.set(c.x+q*.3,c.y+q*.32,c.z+q*1.45);TPV.cam.lookAt(c.x,c.y+sz.y*.12,c.z);portraitDraw(performance.now())}}}catch(err){console.warn('bossfx portrait',err)}
  bfxTgtCls();return r}}
{const f=tgtHud;tgtHud=function(){const r=f.apply(this,arguments);try{const e=tgt;if(e&&e.bfx){$('tgN').textContent=e.c.n;const s=$('tgS');if(s&&!(e.atk&&e.atk.ph==0)){s.className='tgs';s.textContent=e.bfx.sub||''}}bfxTgtCls()}catch(err){}return r}}
// ---------------- sounds: ice shattering, steam hissing ----------------
{const f=sfx;sfx=function(k,vol){if(k!='shatter'&&k!='hiss')return f.apply(this,arguments);
  try{if(SET.sfx===false)return;const a=AUD;if(!a||a.state!='running'||!NOISE)return;const t=a.currentTime;vol=vol||1;
    const nz=(ft,f0,f1,at,dur,v,q)=>{const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=NOISE;fl.type=ft;fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+dur);fl.Q.value=q||1;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol,t+at);g.gain.exponentialRampToValueAtTime(.001,t+at+dur);s.connect(fl);fl.connect(g);g.connect(a.out);s.start(t,Math.random()*.5);s.stop(t+at+dur+.05)};
    const os=(f0,f1,dur,v,dl)=>{const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(f0,t+dl);o.frequency.exponentialRampToValueAtTime(f1,t+dl+dur);g.gain.setValueAtTime(0,t);g.gain.setValueAtTime(0,t+dl);g.gain.linearRampToValueAtTime(v*vol,t+dl+.004);g.gain.exponentialRampToValueAtTime(.001,t+dl+dur);o.connect(g);g.connect(a.out);o.start(t);o.stop(t+dl+dur+.05)};
    if(k=='shatter'){nz('highpass',5200,2600,.002,.18,.45,1);[2637,3520,3136,4186].forEach((fq,i)=>os(fq,fq*.97,.22+i*.05,.07,i*.025))}
    else{nz('highpass',6500,3800,.06,.75,.35,.7);nz('bandpass',2400,1200,.02,.3,.15,2)}}catch(err){}}}
// ---------------- den cutaway: scenery between the camera and the hero dithers away ----------------
// uCut = (den centre x, z, floor height, on), uCutR = (wall radius rIn, keep-below height yMin, line-of-sight tube radius)
function bfxCutMat(base,A,rIn,yMin,tube){const k=A.i+':'+base.uuid;if(BFX.cut[k])return BFX.cut[k];const m=base.clone();m.userData.lps=1;m.userData.bfxCut=1;m.userData.bfxBase=base;
  const U={value:new THREE.Vector4(A.cx,A.cz,GH(A.cx,A.cz),1)},Q={value:new THREE.Vector3(rIn,yMin,tube)},ob=base.onBeforeCompile;
  m.onBeforeCompile=(sh,rn)=>{if(ob&&ob!==THREE.Material.prototype.onBeforeCompile)ob.call(m,sh,rn);sh.uniforms.uCam=FADE.cam;sh.uniforms.uPl=FADE.pl;sh.uniforms.uCut=U;sh.uniforms.uCutR=Q;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWPb;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWPb=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uCam,uPl,uCutR;uniform vec4 uCut;varying vec3 vWPb;').replace('void main() {',`void main() {
    if(uCut.w>.5&&vWPb.y>uCut.z+uCutR.y){float f=1.;
      vec2 cp=uCam.xz-uCut.xy,fp=vWPb.xz-uCut.xy;float lc=length(cp),lf=length(fp);
      if(lc>uCutR.x-3.&&lf>uCutR.x){float c=dot(fp/lf,cp/lc);f=1.-smoothstep(.15,.5,c)*smoothstep(uCutR.x-3.,uCutR.x+1.,lc);}
      vec3 ab=uPl-uCam;float t=clamp(dot(vWPb-uCam,ab)/max(dot(ab,ab),.01),0.,1.);float d=length(vWPb-(uCam+ab*t)),rr=uCutR.z*(1.25-.5*t);
      float g=smoothstep(rr*.55,rr,d);g=max(g,smoothstep(.86,.97,t));g*=smoothstep(.6,2.6,length(vWPb-uCam));f=min(f,g);
      float dh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(f<dh)discard;}`)};
  m.customProgramCacheKey=()=>'bfxcut'+base.type+(base.vertexColors?'v':'')+(base.flatShading?'f':'');BFX.cut[k]=m;BFX.cutN++;return m}
function bfxCutDen(A,rIn,yMin,tube){A.g.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material))return;const b=o.material;
  if(b.userData.bfxCut||b.transparent||b.blending!==THREE.NormalBlending||b.depthTest===false)return;
  if(b.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey)return;   // already custom (dqCut, wind)
  if(!(b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial||b.isMeshBasicMaterial))return;
  o.material=bfxCutMat(b,A,rIn,yMin,tube)})}
// dens 0-3 (Argus hollow, Hydra mere, Frozen Sepulchre, Sunken Pit); 4-5 already cut their walls with dqCut
ARN.forEach(A=>{if(A.i>3)return;try{bfxCutDen(A,ARENA_R-.2,A.i===1?.75:.55,2.4)}catch(err){console.error('bossfx cut',A.i,err)}});
