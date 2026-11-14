// ================= v232 the Warden kit — one controller for the endings' arena bosses =================
// The five fights of the two endings (4020–4062) are built to the Vorraxis standard (docs/BOSS_RECIPE.md) but share one controller
// instead of copying 3033's: a boss is a record D given to wk232Reg and the kit does the rest.
//   D = {key, name, title, icon, lv, zi (zone whose unused Wave Trial arena it takes; or T: an instance record + center [x, z]),
//        place (the arena's name), card [sub, foot] (title card at the start), hpK / dmK (health and damage against a plain boss),
//        B (the Sovereign-engine record: build, loco, post, P poses, M moves, ai, stag, die …),
//        done() → true once he has been beaten (he never returns), build(D, root, LS) (the arena's dressing),
//        sync(D), start(D, e), reset(D), won(D, e), tick(D, dt, now, t) (the arena, every frame while you are there),
//        fight(D, e, dt, now) (hazards, every frame of the fight), hurt(D, e, d, s, crit, dot) → d (his own damage rules),
//        phase(D, e) → a move id to cast instead of picking (phase changes beyond 'awaken'), hud(D, e) → extra name text}
// The kit: the instance's name and level, the old trial's camp and portal hidden, the arena record D.A {cx, cz, r, hr, y, f (fighting)},
// spawn (model hidden, an svRig built by B.build), start (seal, title card, recall blocked), reset on a wipe or leaving, the win,
// the AI (3033's: move tick, 'awaken' at B.ph2, footwork, svPick), the engine glue (svCtx / svHitNow for e.wk), the HUD with the
// posture bar, the way back to Duskhold (a rift by the entrance), and the shared move effects every Warden draws with.
// Co-op: local to each player (e.boss is never shared), like Vorraxis.
var WK232={D:{},list:[],err:0,X:{}};
function wk232Reg(D){const T=D.T||INSL[insG(D.zi,4)],c=D.center||T.wa,cx=c[0],cz=c[1];try{T.n=D.place;T.rn=D.place;T.lv=[D.lv,D.lv]}catch(_){}
  D.T=T;D.L=Object.assign({T,cx,cz,y:GH(cx,cz),ent:{x:cx,z:cz+10.0},exit:{x:cx,z:cz+12.2},home:{x:cx,z:cz-2.4},r:11.6,hr:12.6},D.Lx||{});
  D.A=null;D.e=null;D.LS=null;D.ft=0;D.adds=[];WK232.D[D.key]=D;WK232.list.push(D);D.B.M.stagger=D.B.M.stagger||svStagDef(D.B);
  // the old Wave Trial's leave portal and war-camp dressing are not part of the arena
  if(D.zi!=null){try{RPORT.forEach(r=>{if(r.k=='wave'&&r.pi===D.zi)r.g.visible=false})}catch(_){}
    try{const o=typeof ARK_TRIAL!='undefined'&&ARK_TRIAL[D.zi];if(o){o.visible=false;if(o.parent)o.parent.remove(o)}}catch(_){}}
  return D}
function wk232In(D){try{const I=curIns();return !!I&&I.g===D.T.g}catch(_){return false}}
function wk232Here(){for(let i=0;i<WK232.list.length;i++)if(wk232In(WK232.list[i]))return WK232.list[i];return null}
function wk232Fighting(){const D=wk232Here();return !!(D&&D.A&&D.A.f)}
// ---------------- engine glue ----------------
{const f=svCtx;svCtx=function(e){const c=f.apply(this,arguments);if(e&&e.wk){const D=e.wk;c.A=D.A;c.D=D;c.inA=(p,mg)=>wk232Clamp(D,p,mg==null?1.2:mg);c.hit=(s,an,dm,o)=>wk232HitNow(e,s,an,dm,o||{})}return c}}
{const f=svHitNow;svHitNow=function(e,s,an,dm,o){if(e&&e.wk)return wk232HitNow(e,s,an,dm,o||{});return f.apply(this,arguments)}}
function wk232Clamp(D,p,mg){const A=D.A;if(!A)return p;const dx=p.x-A.cx,dz=p.z-A.cz,d=Math.hypot(dx,dz),lim=A.r-(mg||0);if(d>lim){p.x=A.cx+dx/d*lim;p.z=A.cz+dz/d*lim}return p}
function wk232HeroIn(D,p){const A=D.A;if(!A)return p;const dx=p.x-A.cx,dz=p.z-A.cz,d=Math.hypot(dx,dz);if(d>A.hr){p.x=A.cx+dx/d*A.hr;p.z=A.cz+dz/d*A.hr}return p}
function wk232HitNow(e,s,an,dm,o){const D=e.wk,A=D.A;if(!A||!A.f||e.dead)return false;let hit=false;if(o.flash!==false)svFlash(s,an,o.col||D.B.col,o.fms);
  if(hero.hp>0&&svIn(s,an,pl.position,o.pad)&&!(o.safe&&o.safe())){hit=true;SVX.st.hits++;if(o.pre)try{o.pre()}catch(_){}const iv=hero.iv>0;bossHit(e,dm*(D.dmK||1));
    if(!iv&&hero.hp>0){if(o.kb){const dx=pl.position.x-an.x,dz=pl.position.z-an.z,l=Math.hypot(dx,dz)||1,q=wk232HeroIn(D,pl.position.clone().add(new THREE.Vector3(dx/l*o.kb,0,dz/l*o.kb)));
        pl.step={x:(q.x-pl.position.x)/(o.kb||1),z:(q.z-pl.position.z)/(o.kb||1),t:.22,sp:(o.kb||1)/.22}}
      if(o.on)try{o.on()}catch(err){console.error('wk on hit',err)}}}
  return hit}
// a plain hit on the hero from an arena hazard (no shape): k = damage as a share of a boss hit
function wk232Zap(e,k,mt){if(!e||e.dead||hero.hp<=0||hero.iv>0)return false;hitHero(e,k*(e.wk.dmK||1),mt||e.c.mt);return true}
// ---------------- spawn, start, reset, win ----------------
function wk232Spawn(D){if(D.e&&!D.e.dead&&enemies.includes(D.e))return D.e;if(D.done()&&!wkn232Want(D))return null;const L=D.L,key='wk_'+D.key;
  if(!EN[key])EN[key]=Object.assign({},EN[D.base]||EN.akorror,{n:D.name,e:D.icon});try{MSET[key]=[]}catch(_){}
  const c=enemyC(key,D.lv,{boss:1});c.n=D.name;c.st.hp=Math.round(c.st.hp*(D.hpK||1));c.h=c.st.hp;const m=cr(c);m.position.set(L.home.x,0,L.home.z);m.rotation.y=0;scene.add(m);
  const hb=bar(true);hb.scale.setScalar(3);
  const e={c,m,hb,boss:1,wk:D,tier:4,home:[L.home.x,L.home.z],cd:1,ch:0,vx:0,vz:0,agg:0,bs:{t:99,lock:0,ph:1,last:'',ult:99,pb:99},wx:L.home.x,wz:L.home.z,wt:0,dots:[]};enemies.push(e);
  m.children.forEach(o=>{o.visible=false});const R=svRig();D.B.build(R,e);svRest(R);try{svMerge(R)}catch(err){console.error('wk merge',D.key,err)}const bs=m.bs||m.scale.x||1;R.root.scale.setScalar(1/bs);R.root.name='svwk';m.add(R.root);
  const O={};for(const k in R.J)O[k]=[0,0,0,0,0,0];
  e.sv={i:'wk',B:D.B,R,O,P:{},snap:{},aw:0,trk:null,tt:0,mv:null,ph:1,rest:1.5,last:[],cd:{},po:0,poT:0,stg:0,inv:0,spd:0,lp:m.position.clone(),hero:1,body:D.B.body,on:false,wait:0,act:0,fl:0,chg:0,dr:0};
  D.A={cx:L.cx,cz:L.cz,r:L.r,hr:L.hr,y:L.y,f:false};svApply(e,0,performance.now());D.e=e;return e}
function wk232Start(D,e){const S=e.sv,A=D.A;if(!A||A.f)return;A.f=true;e.agg=1;S.on=false;S.ph=1;e.bs.ph=1;S.rest=1;S.po=0;D.ft=0;wk232Sync(D);
  if(riding)try{dismount()}catch(_){}try{setTarget(e)}catch(_){}
  try{const cd=D.card||[];zt116Show(ZT116.Z[D.zi==null?5:D.zi],D.place,D.name,D.title+(cd[0]?' · '+cd[0]:''),cd[1]||'The way out is sealed','z'+(D.zi==null?5:D.zi))}catch(_){}
  if(D.start)try{D.start(D,e)}catch(err){console.error('wk start',D.key,err)}try{wkn232Send(D,[5])}catch(_){}}
function wk232Reset(D,why){const e=D.e,A=D.A;if(A)A.f=false;wk232AddsClear(D);if(D.reset)try{D.reset(D)}catch(err){console.error('wk reset',D.key,err)}wk232Sync(D);if(!e||e.dead)return;const S=e.sv;
  svEndMove(e,true);S.stgM=null;S.on=false;S.ph=1;e.bs.ph=1;S.po=0;S.stg=0;S.inv=0;S.cd={};S.dr=0;S.chg=0;S.chgT=0;S.last=[];S.sigN=0;S.ghost=0;e.agg=0;e.c.h=M(e.c);
  e.m.position.set(D.L.home.x,0,D.L.home.z);e.m.rotation.y=0;if(why)setTimeout(()=>say(D.icon+' '+D.name+' returns to '+(D.restTxt||'the heart of the arena')+' and waits.'),900)}
function wk232Won(D,e){const A=D.A;if(A)A.f=false;D.slain=1;try{if(!D.mir)wkn232Send(D,[3])}catch(_){}D.netWin=0;wk232AddsClear(D);if(D.reset)try{D.reset(D,true)}catch(_){}
  try{D.won&&D.won(D,e)}catch(err){console.error('wk won',D.key,err)}wk232Sync(D);try{hud()}catch(_){}}
function wk232Sync(D){const LS=D.LS;if(LS&&LS.seal)LS.seal.visible=!!(D.A&&D.A.f);if(LS&&LS.rift)LS.rift.visible=!(D.A&&D.A.f);if(D.sync)try{D.sync(D)}catch(_){}}
function wk232Heal(e,f,col){if(!e||e.dead)return;const h=Math.round(M(e.c)*f);if(!e.wk.mir)e.c.h=Math.min(M(e.c),e.c.h+h);dn(e.m.position,'+'+h,'#9aff6a',-20,1400);burst(gY(e.m.position,1.5),col||0x9aff6a,40,3,2,.7)}
// he takes a share of his health as damage (mechanics that wound him), never the killing blow
function wk232Wound(e,f,col,mine){if(!e||e.dead)return;const d=Math.round(M(e.c)*f);if(!e.wk.mir||mine)e.c.h=Math.max(1,e.c.h-d);dn(e.m.position,d,col||'#ffe9a0',-20,1200)}
// ---------------- mechanic props: enemies with a hidden model, no AI and their own death ----------------
// wk232Add(D, x, z, {n, hp (share of the boss's health), g (a group shown instead of the creature), pop(s), tick(s, t), base})
function wk232Add(D,x,z,o){let s=null;try{s=spawnEnemy(o.base||'goo',x,z,D.lv,{minion:1})}catch(err){console.error('wk add',err)}if(!s)return null;
  const hp=Math.max(40,Math.round(M(D.e.c)*(o.hp||.015)));s.wkAdd={D,o};s.agg=0;s.c.n=o.n||'';s.c.st.hp=hp;s.c.h=hp;s.m.children.forEach(q=>{q.visible=false});
  const bs=s.m.bs||s.m.scale.x||1;if(o.g){o.g.scale.multiplyScalar(1/bs);s.m.add(o.g);s.addG=o.g}D.adds.push(s);return s}
function wk232AddPop(s){if(s.popped)return;s.popped=1;s.dead=1;s.c.h=0;try{s.hb.visible=false}catch(_){}if(typeof tgt!='undefined'&&tgt===s)try{setTarget(null)}catch(_){}
  const A=s.wkAdd,i=A.D.adds.indexOf(s);if(i>=0)A.D.adds.splice(i,1);setTimeout(()=>{try{removeE(s)}catch(_){}},60);try{A.o.pop&&A.o.pop(s)}catch(err){console.error('wk add pop',err)}}
function wk232AddsClear(D){D.adds.slice().forEach(s=>{try{if(!s.dead)removeE(s)}catch(_){}});D.adds=[]}
// ---------------- the AI (3033's controller, per record) ----------------
function wk232AI(e,dt,now){const D=e.wk,S=e.sv,A=D.A,m=e.m,B=D.B;if(!A)return;const mir=!!D.mir;if(e.hb)e.hb.visible=false;const here=wk232In(D);m.visible=here;
  const dx=m.position.x-S.lp.x,dz=m.position.z-S.lp.z;S.lp.copy(m.position);const ms=dt>0?Math.hypot(dx,dz)/dt:0;S.spd+=((ms>12?0:ms)-S.spd)*Math.min(1,dt*8);
  for(const k in S.cd)S.cd[k]=Math.max(0,S.cd[k]-dt);S.inv=Math.max(0,S.inv-dt);
  if(!S.chgHold)S.chg=(S.chg||0)+((S.chgT||0)-(S.chg||0))*Math.min(1,dt*3);
  {const p=pl.position;if(S.hp0&&dt>0){const vx=(p.x-S.hp0.x)/dt,vz=(p.z-S.hp0.z)/dt,a=Math.min(1,dt*6);if(Math.hypot(vx,vz)<20){S.hv=S.hv||{x:0,z:0};S.hv.x+=(vx-S.hv.x)*a;S.hv.z+=(vz-S.hv.z)*a}}S.hp0={x:p.x,z:p.z}}
  if(!A.f){if(S.mv)svEndMove(e,true);e.agg=0;const hx=D.L.home.x-m.position.x,hz=D.L.home.z-m.position.z,hl=Math.hypot(hx,hz);
    if(hl>.6){walkM(m,hx/hl*2*dt,hz/hl*2*dt);m.rotation.y=Math.atan2(hx,hz)}else m.rotation.y+=svAng(0-m.rotation.y)*Math.min(1,dt*2);
    e.c.h=Math.min(M(e.c),e.c.h+M(e.c)*dt*.2);S.po=0;
    if(here&&hero.hp>0&&!D.done()&&Math.hypot(pl.position.x-m.position.x,pl.position.z-m.position.z)<(D.wake||9.5))wk232Start(D,e);
    svApply(e,dt,now);return}
  if(!here||((hero.hp<=0||(typeof AWD!='undefined'&&AWD.dead))&&!mir)){wk232Reset(D,true);svApply(e,dt,now);return}
  D.ft+=dt;e.agg=1;
  if(!S.on){S.on=true;S.ph=1;e.bs.ph=1;S.rest=1;S.po=0;if(!mir)svCast(e,'intro')}
  if(now-S.poT>3500)S.po=Math.max(0,S.po-dt*.1);
  if(S.mv)svTickMove(e,dt,now);
  else if(!mir){let ph=null;if(S.ph===1&&e.c.h/M(e.c)<=B.ph2)ph='awaken';else if(D.phase)try{ph=D.phase(D,e)}catch(_){}
    if(ph)svCast(e,ph);else{if(!S.still)wk232Move(e,dt);S.rest-=dt;if(S.rest<=0){const id=svPick(e);if(id)svCast(e,id);else S.rest=.25}}}
  if(mir)try{wkn232Follow(D,e,dt)}catch(_){}
  if(!S.free)wk232Clamp(D,m.position,B.edge);
  {const p=pl.position,hx=p.x-A.cx,hz=p.z-A.cz,hd=Math.hypot(hx,hz);if(hd>A.hr){p.x=A.cx+hx/hd*A.hr;p.z=A.cz+hz/hd*A.hr}}
  if(!S.ghost&&!S.rmOn&&hero.hp>0){const hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,hl=Math.hypot(hx,hz),R0=S.body;if(hl<R0&&hl>.001){const k=R0-hl;pl.position.x+=hx/hl*k;pl.position.z+=hz/hl*k}}
  if(D.fight)try{D.fight(D,e,dt,now)}catch(err){if(!WK232.err++)console.error('wk fight',D.key,err)}
  svApply(e,dt,now)}
function wk232Move(e,dt){const D=e.wk,S=e.sv,ai=D.B.ai,m=e.m,v=V().subVectors(pl.position,m.position).setY(0),L=v.length()||.01;
  const da=svAng(Math.atan2(v.x,v.z)-m.rotation.y),tr=ai.turn*(S.ph>1?1.2:1);m.rotation.y+=Math.max(-tr*dt,Math.min(tr*dt,da));
  let sp=0,ux=0,uz=0;const ws=ai.walk*(S.ph>1?1.15:1);
  if(L>ai.pref+1.2){sp=L>ai.pref+7?ai.run:ws;ux=v.x/L;uz=v.z/L}else if(L<(ai.near||1.8)){sp=ws*.6;ux=-v.x/L;uz=-v.z/L}
  else{S.sdT=(S.sdT||0)-dt;if(S.sdT<=0){S.sdT=1.8+Math.random()*2.2;S.sd=Math.random()<.5?-1:1}sp=ws*ai.strafe;ux=-v.z/L*(S.sd||1);uz=v.x/L*(S.sd||1)}
  const A=D.A,rx=m.position.x-A.cx,rz=m.position.z-A.cz,rl=Math.hypot(rx,rz)||.01;if(rl>A.r-2.5){const nx=rx/rl,nz=rz/rl,out=ux*nx+uz*nz;if(out>0){ux-=nx*out;uz-=nz*out}}
  if(sp>0&&Math.abs(da)<1.4)walkM(m,ux*sp*dt,uz*sp*dt);else sp=0;S.walkSp=sp}
// ---------------- hooks ----------------
{const f=eTick;eTick=function(e,dt,now){if(e&&e.wk){try{wk232AI(e,dt,now)}catch(err){if(!WK232.err++)console.error('wk ai',e.wk.key,err)}return true}
  if(e&&e.wkAdd){try{if(e.hb)e.hb.visible=!e.dead;const o=e.wkAdd.o;if(o.tick)o.tick(e,now/1000,dt)}catch(_){}return true}
  return f.apply(this,arguments)}}
{const f=kill;kill=function(e){if(e&&e.wkAdd){try{wk232AddPop(e)}catch(err){console.error('wk add kill',err)}return}const r=f.apply(this,arguments);if(e&&e.wk)try{wk232Won(e.wk,e)}catch(err){console.error('wk won',err)}return r}}
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.wk&&e.sv&&!e.dead){const D=e.wk;if(!(D.A&&D.A.f)&&wk232In(D)&&hero.hp>0)wk232Start(D,e);
    if(D.hurt)try{d=D.hurt(D,e,d,s,crit,dot)}catch(_){}
    if(e.sv.dr>0){d=Math.max(1,Math.round(d*e.sv.dr));if(nowP()-(e.sv.drT||0)>700){e.sv.drT=nowP();dn(e.m.position,'Shielded','#ffe9a0',-30,600)}}}
  return f.call(this,e,d,s,crit,dot)}}
{const f=doRecall;doRecall=function(){if(wk232Fighting())return say('The way out is sealed. There is no escape.');return f.apply(this,arguments)}}
function wk232Hud(){const D=wk232Here(),e=D&&D.e,on=!!(e&&!e.dead&&D.A&&D.A.f);let p=document.getElementById('wkPo');if(!on){if(p)p.style.display='none';return}
  const b=$('boss');if(!b)return;b.classList.remove('hide');const S=e.sv;$('bossN').textContent=D.icon+' '+D.name+' · '+D.title+' · Phase '+['I','II','III'][Math.min(2,S.ph-1)]+(D.hud?D.hud(D,e)||'':'');$('bossB').style.width=Math.max(0,100*e.c.h/M(e.c))+'%';
  if(!p){p=document.createElement('div');p.id='wkPo';p.style.cssText='height:5px;margin:4px auto 0;width:70%;background:rgba(0,0,0,.6);border:1px solid rgba(255,216,96,.35);border-radius:2px;overflow:hidden';p.innerHTML='<i style="display:block;height:100%;width:0;background:linear-gradient(90deg,#c89020,#ffe080);transition:width .12s"></i>';const mt=b.querySelector('.meter');if(mt)mt.after(p);else b.appendChild(p)}
  p.style.display='block';p.firstChild.style.width=(S.stg>0?100:Math.min(100,S.po*100)).toFixed(1)+'%';p.firstChild.style.background=S.stg>0?'#fff4c0':'linear-gradient(90deg,#c89020,#ffe080)'}
{const f=hud;hud=function(){const r=f.apply(this,arguments);try{wk232Hud()}catch(_){}return r}}
// ---------------- the arena: build once on arrival, show only while there, the rift home ----------------
function wk232Lair(D){if(D.LS)return D.LS;const L=D.L,root=new THREE.Group();root.name='wk_'+D.key;scene.add(root);const LS=D.LS={root,lights:[],t:0};
  try{D.build(D,root,LS)}catch(err){console.error('wk lair',D.key,err);WK232.err++}
  // the way back to Duskhold: a tear of pale light by the entrance; a wall of the boss's colour over it while the fight runs
  {const g=new THREE.Group(),x=L.exit.x,z=L.exit.z,y=GH(x,z);g.position.set(x,y,z);
    const tear=new THREE.Mesh(svG('wk_rift',()=>{const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(.75,1.5,0,3.1);s.quadraticCurveTo(-.75,1.5,0,0);return new THREE.ShapeGeometry(s,10)}),
      new THREE.MeshBasicMaterial({color:D.riftCol||0xe8dcc0,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));tear.userData.lpsSkip=1;g.add(tear);
    const gl=kqSpr(D.riftCol||0xe8dcc0,1.8);gl.position.y=1.5;g.add(gl);root.add(g);LS.rift=g;LS.riftT=tear;
    const seal=new THREE.Mesh(svG('wk_seal',()=>new THREE.CylinderGeometry(1.6,1.9,3.6,14,1,true)),new THREE.MeshBasicMaterial({color:D.B.col,transparent:true,opacity:.34,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    seal.userData.lpsSkip=1;seal.position.set(x,y+1.8,z);seal.visible=false;root.add(seal);LS.seal=seal}
  wk232Sync(D);return LS}
function wk232Leave(D){fadeTo(()=>{try{TWN100_home()}catch(err){console.error('wk leave',err)}})}
{const f=worldPrompt;worldPrompt=function(){try{const D=wk232Here();if(D&&!(D.A&&D.A.f)){const P=pl.position,L=D.L;if(Math.hypot(P.x-L.exit.x,P.z-L.exit.z)<2.3)return {label:'F · Step through the rift to Duskhold',fn:()=>wk232Leave(D)};
      if(D.prompt){const r=D.prompt(D);if(r)return r}}}catch(e){if(!WK232.err++)console.warn('wk prompt',e)}return f.apply(this,arguments)}}
function wk232Tick(dt,now){const t=now/1000;for(let i=0;i<WK232.list.length;i++){const D=WK232.list[i],here=wk232In(D);try{wkn232Roles(D,here,dt)}catch(err){if(!WK232.err++)console.error('wk net',err)}
    if(here){if(!D.LS)wk232Lair(D);if((!D.done()||wkn232Want(D))&&!D.slain&&!(D.e&&enemies.includes(D.e)))try{wk232Spawn(D)}catch(err){console.error('wk spawn',D.key,err);WK232.err++}}
    else{D.slain=0;if(D.A&&D.A.f)wk232Reset(D)}
    const LS=D.LS;if(!LS)continue;LS.root.visible=here;LS.lights.forEach(l=>{if(!here){if(l.userData.wk0==null)l.userData.wk0=l.intensity;l.intensity=0}else if(l.userData.wk0!=null){l.intensity=l.userData.wk0;l.userData.wk0=null}});
    if(!here)continue;LS.t=t;if(LS.riftT){LS.riftT.scale.x=1+.12*Math.sin(t*3.1);LS.riftT.material.opacity=.4+.12*Math.sin(t*2.3);LS.rift.rotation.y=Math.atan2(cam.position.x-LS.rift.position.x,cam.position.z-LS.rift.position.z)}
    if(LS.seal&&LS.seal.visible){LS.seal.rotation.y+=dt*.4;LS.seal.material.opacity=(.26+.1*Math.sin(t*4))*Math.max(0,Math.min(1,(Math.hypot(cam.position.x-LS.seal.position.x,cam.position.z-LS.seal.position.z)-3.5)/4))}
    if(D.tick)try{D.tick(D,dt,now,t)}catch(err){if(!WK232.err++)console.error('wk tick',D.key,err)}}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{wk232Tick(dt,now)}catch(err){if(!WK232.err++)console.error('wk tick',err)}return r}}
// travel: into a Warden's arena (from anywhere)
function wk232Enter(D,then){fadeTo(()=>{const L=D.L;toPos(L.ent.x,L.ent.z,0);try{then&&then()}catch(_){}})}
// ---------------- arena dressing helpers ----------------
// a painted round floor laid on the ground of the arena. o: base (css colour), spk [[r,g,b] …] speckles, crack (css), vein [css …]
// (glowing lines, drawn on the emissive map), em (emissive colour), emI, blob [css …] (glowing spots), R0, paint(c, rn, S) / glow(c, rn, S)
function wk232Floor(D,root,o){const L=D.L,rn=svRng(o.seed||2321),S=512,cv=document.createElement('canvas');cv.width=cv.height=S;const c=cv.getContext('2d');c.fillStyle=o.base;c.fillRect(0,0,S,S);
  (o.spk||[]).forEach((q,qi)=>{for(let i=0;i<(o.spkN||500);i++){const k=.7+rn()*.6;c.fillStyle=`rgba(${q[0]*k|0},${q[1]*k|0},${q[2]*k|0},${o.spkA||.5})`;c.beginPath();c.arc(rn()*S,rn()*S,2+rn()*(o.spkR||10),0,6.283);c.fill()}});
  if(o.crack){c.strokeStyle=o.crack;c.lineWidth=2;for(let i=0;i<(o.crackN||40);i++){c.beginPath();let x=rn()*S,z=rn()*S;c.moveTo(x,z);for(let k=0;k<6;k++){x+=(rn()-.5)*60;z+=(rn()-.5)*60;c.lineTo(x,z)}c.stroke()}}
  if(o.paint)o.paint(c,rn,S);
  const em=document.createElement('canvas');em.width=em.height=S;const e2=em.getContext('2d');e2.fillStyle='#000';e2.fillRect(0,0,S,S);
  (o.vein||[]).forEach(col=>{for(let i=0;i<(o.veinN||8);i++){e2.strokeStyle=col;e2.lineWidth=1.5+rn()*3;e2.beginPath();let x=S/2+(rn()-.5)*S*.9,z=S/2+(rn()-.5)*S*.9;e2.moveTo(x,z);for(let k=0;k<8;k++){x+=(rn()-.5)*70;z+=(rn()-.5)*70;e2.lineTo(x,z)}e2.stroke()}});
  (o.blob||[]).forEach(col=>{for(let i=0;i<(o.blobN||8);i++){const x=S/2+(rn()-.5)*S*.86,z=S/2+(rn()-.5)*S*.86,r=6+rn()*18,gr=e2.createRadialGradient(x,z,0,x,z,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');e2.fillStyle=gr;e2.beginPath();e2.arc(x,z,r,0,6.283);e2.fill()}});
  if(o.glow)o.glow(e2,rn,S);
  const al=document.createElement('canvas');al.width=al.height=128;const a2=al.getContext('2d'),gr=a2.createRadialGradient(64,64,o.soft||50,64,64,64);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#000');a2.fillStyle=gr;a2.fillRect(0,0,128,128);
  const R0=o.R0||15.5,geo=new THREE.PlaneGeometry(R0*2,R0*2,44,44);geo.rotateX(-Math.PI/2);const P=geo.attributes.position;for(let k=0;k<P.count;k++){const x=P.getX(k)+L.cx,z=P.getZ(k)+L.cz;P.setXYZ(k,x,GH(x,z)+.04,z)}geo.computeVertexNormals();
  const fm=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(cv),emissiveMap:new THREE.CanvasTexture(em),emissive:o.em||0xffffff,emissiveIntensity:o.emI==null?.5:o.emI,roughness:o.rough==null?.6:o.rough,metalness:o.metal||.05,transparent:true,alphaMap:new THREE.CanvasTexture(al),polygonOffset:true,polygonOffsetFactor:-2});
  fm.userData.noFade135=1;const fl=new THREE.Mesh(geo,fm);fl.receiveShadow=true;fl.userData.noFade135=1;root.add(fl);return fm}
// n things round the wall, leaving the entrance (south, +z) open: fn(i, a, x, z, y, rn) → Object3D | null (added to root)
function wk232Around(D,root,n,r0,r1,fn,seed,gap){const L=D.L,rn=svRng(seed||7);for(let i=0;i<n;i++){const a=i/n*Math.PI*2+rn()*.12;if(Math.abs(svAng(a))<(gap==null?.14:gap)){rn();continue}
    const r=r0+rn()*(r1-r0),x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r;if(Math.hypot(x-L.exit.x,z-L.exit.z)<2.6)continue;const o=fn(i,a,x,z,GH(x,z),rn);if(o)root.add(o)}}
function wk232Lump(k,r,det,j){return svG('wkl'+k,()=>svLump(r||1,det==null?1:det,j||.35,300+k))}
function wk232Light(D,LS,col,I,dist,x,y,z){const lt=new THREE.PointLight(col,I,dist,1.6);lt.position.set(x,y,z);scene.add(lt);LS.lights.push(lt);return lt}
// an additive flat disc / ring on the floor (hazard zones, glows): returns the mesh (opacity 0, hidden)
function wk232Disc(root,r0,r1,col,y){const g=r0>0?new THREE.RingGeometry(r0,r1,64,1):new THREE.CircleGeometry(r1,48);g.rotateX(-Math.PI/2);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false,polygonOffset:true,polygonOffsetFactor:-4}));
  m.userData.lpsSkip=1;m.material.userData.noFade135=1;m.position.y=y||.12;m.visible=false;root.add(m);return m}
// ---------------- shared move effects ----------------
function wk232Aim(c,lead){const v=c.S.hv||{x:0,z:0};return wk232HeroIn(c.D,new THREE.Vector3(pl.position.x+v.x*lead,0,pl.position.z+v.z*lead))}
function wk232Pool(e,p,r,col,ms,mult,deb){const D=e.wk;if(!D.A||!D.A.f)return;const q=wk232Clamp(D,p.clone(),.3);s6Pool(e,q,r,col,ms||3500,(mult==null?.16:mult)*(D.dmK||1),deb)}
// spikes erupting along a line from an anchor; hits once. o: mat, mat2, col, n, step, dm, r, snd, h
function wk232Lane(c,an,dm,o){o=o||{};const e=c.e,D=e.wk,N=o.n||10,step=o.step||1.05,sa=Math.sin(an.a),ca=Math.cos(an.a);let t=0,k=0,hit=false;
  kqFx({tick(dt){t+=dt||0;while(k<N&&t>=k*(o.dt||.045)){const d=(o.d0==null?1.2:o.d0)+k*step,x=an.x+sa*d,z=an.z+ca*d;k++;const A=D.A;if(A&&Math.hypot(x-A.cx,z-A.cz)>A.r+.8){k=N;break}
      const p=new THREE.Vector3(x,0,z);svSpike(p,k%3&&o.mat2?o.mat2:o.mat,(o.h||1.1)+(k%3)*.25,o.w||.24,.85,.5);if(k%2)burst(gY(p,.4),o.col||D.B.col,4,1.2,1.6,.4);if(k%3===1)svSnd(o.snd||'crack',.45,1.2+k*.04);
      if(!hit&&!e.dead&&svIn({k:'c',r:o.r||.72},{x,z,a:0},pl.position,.25)){hit=true;wk232HitNow(e,{k:'c',r:99},{x,z,a:0},dm,{flash:false,on:o.on})}}
    return k<N&&!e.dead},end(){}})}
// a missile along a line from an anchor; hits once. o: mesh() → Object3D (points +z), col, spd, L, w, y, on, trail, end(p)
function wk232Bolt(c,an,dm,o){o=o||{};const e=c.e,D=e.wk,a=an.a,L=o.L||15,spd=o.spd||17,org=new THREE.Vector3(an.x,0,an.z),ms=o.mesh?o.mesh():new THREE.Group(),gl=kqSpr(o.col||D.B.col,o.gl||.9);ms.add(gl);ms.userData.lpsSkip=1;scene.add(ms);
  let t=0,hit=false;const T=L/spd;
  kqFx({tick(dt){t+=dt||0;const d=spd*t,p=new THREE.Vector3(org.x+Math.sin(a)*d,0,org.z+Math.cos(a)*d);ms.position.set(p.x,GH(p.x,p.z)+(o.y==null?1.3:o.y),p.z);ms.rotation.y=a;if(o.spin)ms.rotation.z+=dt*o.spin;
    if(o.trail!==false&&Math.random()<.8)burst(ms.position,o.col||D.B.col,1,.2,.1,.35);
    if(!hit&&!e.dead&&svIn({k:'l',w:o.w||1.1,l:1.2,b:.6},{x:p.x,z:p.z,a},pl.position,.25)){hit=true;wk232HitNow(e,{k:'c',r:99},{x:p.x,z:p.z,a},dm,{flash:false,on:o.on});burst(ms.position,o.col||D.B.col,16,1.6,1,.4)}
    const A=D.A;if(A&&Math.hypot(p.x-A.cx,p.z-A.cz)>A.r+1.2){if(o.end)try{o.end(p)}catch(_){}return false}return t<T&&!hit&&!e.dead},end(){scene.remove(ms);if(gl.parent)gl.parent.remove(gl)}})}
// a column bursting out of the floor (the hit itself is the move's): o: col, core, s, mat (chunks), decal, snd
function wk232Erupt(e,p,o){o=o||{};const s=o.s||1,col=new THREE.Mesh(svG('wk_col',()=>{const g=new THREE.CylinderGeometry(.5,.9,1,9,1,true);g.translate(0,.5,0);return g}),
    new THREE.MeshBasicMaterial({color:o.col||e.wk.B.col,transparent:true,opacity:o.op||.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})),op0=o.op||.85;
  const y0=GH(p.x,p.z);col.position.set(p.x,y0,p.z);col.userData.lpsSkip=1;col.renderOrder=21;scene.add(col);let t=0;
  if(o.mat)for(let k=0;k<5;k++){const a=k/5*6.283+Math.random(),r=.5+Math.random()*.6;svSpike(new THREE.Vector3(p.x+Math.cos(a)*r,0,p.z+Math.sin(a)*r),o.mat,(1.0+Math.random()*.7)*s,.22*s,1.1,.6)}
  burst(gY(p,.5),o.col||e.wk.B.col,40,2.4,5.5,.9);if(o.decal)svDecal(p,o.decal,1.9*s,3.4,.6);svShock(p,o.col||e.wk.B.col,2.4*s,.4);svSnd(o.snd||'heavy',1,1.1);
  kqFx({tick(dt){t+=dt||0;const k=t/(o.T||.75);col.scale.set(s*(1+.3*k),s*((o.h||4.5)*Math.sin(Math.min(1,k)*Math.PI)+.01),s*(1+.3*k));col.material.opacity=op0*(1-k*.6);return k<1},end(){scene.remove(col);col.material.dispose()}})}
// a falling strike from the sky onto a marked spot (the hit is the move's): a streak coming down for T seconds, then the impact
function wk232Fall(p,col,T,r,fx){const y0=GH(p.x,p.z),st=new THREE.Mesh(svG('wk_fall',()=>{const g=new THREE.CylinderGeometry(.12,.35,1,7,1,true);g.translate(0,.5,0);return g}),
    new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));st.userData.lpsSkip=1;scene.add(st);let t=0;
  kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/T);st.position.set(p.x,y0+26*(1-k),p.z);st.scale.set(r||1,6+10*k,r||1);return k<1},end(){scene.remove(st);st.material.dispose();try{fx&&fx()}catch(_){}}})}
// cover a loft (rings [y, rx, rz, ox, oz] along the joint's +Y, like svLoft) with shingled plates of any outline (3031's mb144Cover with the
// plate geometry passed in). o: n (per row), rows, size, lift, dir, skip(t, u, r, k), mat(t, u, r, k), out, seed, w, wk(t, u), rot
function wk232Cover(R,j,rings,geo,o){const V3=THREE.Vector3,n=o.n||10,rows=o.rows||5,sz=o.size||.2,lift=o.lift==null?.32:o.lift,dir=o.dir||1,y0=rings[0][0],y1=rings[rings.length-1][0];
  const at=y=>{let i=0;while(i<rings.length-2&&y>rings[i+1][0])i++;const a=rings[i],b=rings[i+1],k=Math.max(0,Math.min(1,(y-a[0])/((b[0]-a[0])||1))),L=(p,q)=>(p||0)+((q||0)-(p||0))*k;return [L(a[1],b[1]),L(a[2],b[2]),L(a[3],b[3]),L(a[4],b[4])]};
  const rn=svRng(o.seed||7),M=new THREE.Matrix4(),X=new V3(),Y=new V3(),Z=new V3(),out=[];
  for(let r=0;r<rows;r++){const u=rows>1?r/(rows-1):.5,y=y0+(y1-y0)*(.06+.88*u),[rx,rz,ox,oz]=at(y);
    for(let k=0;k<n;k++){const t=(k+(r%2?.5:0))/n*Math.PI*2+(o.rot||0);if(o.skip&&o.skip(t,u,r,k)){rn();rn();continue}
      const s=Math.sin(t),c=Math.cos(t),px=(ox||0)+s*rx,pz=(oz||0)+c*rz;Z.set(s/Math.max(.01,rx),0,c/Math.max(.01,rz)).normalize();
      Y.set(0,dir,0);Y.addScaledVector(Z,-Y.dot(Z)).normalize();X.crossVectors(Y,Z).normalize();M.makeBasis(X,Y,Z);
      const q=new THREE.Quaternion().setFromRotationMatrix(M).multiply(new THREE.Quaternion().setFromAxisAngle(new V3(1,0,0),-lift));
      const kk=o.wk?o.wk(t,u):1,w=sz*(o.w||1)*(.9+rn()*.2)*kk,l=sz*(.9+rn()*.2)*kk,off=(o.out||0)+sz*.05;
      const m=new THREE.Mesh(geo,o.mat(t,u,r,k));m.position.set(px+Z.x*off,y+Z.y*off,pz+Z.z*off);m.quaternion.copy(q);m.scale.set(w,l,sz*(o.th||.9));m.castShadow=true;
      (typeof j=='string'?R.J[j]:j).add(m);m.userData.lpsSkip=1;out.push(m)}}
  return out}
// a plate with an outline [[x, y] …] in its own plane (tip at -y), a raised middle, a thin underside; +z is the surface normal
function wk232Plate(key,o,th,rise){return svG('wkp'+key,()=>{th=th||.16;const pos=[],top=o.map(([x,y])=>[x,y,(1-Math.hypot(x*1.3,y))*(rise==null?.06:rise)]),bot=o.map(([x,y])=>[x*.86,y*.86,-th*.5]),c=[0,-.05,th],cb=[0,0,-th*.5];
  const T=(a,b,d)=>pos.push(a[0],a[1],a[2],b[0],b[1],b[2],d[0],d[1],d[2]);
  for(let i=0;i<o.length;i++){const j=(i+1)%o.length;T(c,top[i],top[j]);T(cb,bot[j],bot[i]);T(top[i],bot[i],bot[j]);T(top[i],bot[j],top[j])}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g})}
// pose a rig for pictures (v143_look style): offsets from rest
function wk232PoseRig(R,P,name){const B={P},Q=svPose(B,name);for(const k in Q){const g=R.J[k],o=Q[k];if(!g)continue;const r0=g.userData.r0,p0=g.userData.p0;g.rotation.set(r0.x+o[0],r0.y+o[1],r0.z+o[2]);g.position.set(p0.x+(o[3]||0),p0.y+(o[4]||0),p0.z+(o[5]||0))}}
function wk232Tris(R){let n=0;R.root.traverse(o=>{if(o.isMesh){const g=o.geometry;n+=g.index?g.index.count/3:g.attributes.position.count/3}});return Math.round(n)}
// keep the wind-up speed-up of v141 off: Warden timings are designed as they are (3032's MB144_NO141)
const WK232_M=D=>{D._h141=null;return D};
