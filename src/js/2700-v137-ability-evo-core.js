// ================= v137: ability evolution =================
// How it works (read this before changing it):
// - Every one of the 85 class abilities (17 per class) has an evolved form in EVO137 (files 2720-2740): a new name, a line
//   saying what changed, field changes (mod: radius, range, projectile count, jumps, duration, stun…; '*1.5' multiplies,
//   '+2' adds, a plain value replaces) and code for what the fields can't express (post(c) runs after the ability, run(c,orig)
//   replaces the ability's handler). Evolved casts also hit 25% harder (EV137.dmg, through kqrP, so heals and shields grow too).
// - Evolving: when an ability is rank 5 the Abilities window shows its evolution with an "Evolve" button. It costs ability
//   points: the last rank's cost + 4 (12–16 ⚡), counted by apSpent, so "Reset abilities" refunds it (the reset also removes
//   the evolution). Saved in hero.tal['__ev:<name>'] = 1 ('__' keys survive the talent reset; the ability reset clears them here).
// - Casting: cast(i) is wrapped (outermost). If the ability in slot i is evolved, the loadout array's slot i holds an evolved
//   copy (Object.create of the ability with the mods, ev137:1, same name, so ranks, cooldowns, fx files keyed by name keep
//   working) for the length of the call; every layer below (ground targeting, class resources, fxA/fxB, cast_base, the KQH
//   handlers) reads that copy. EV137.cur (the evolved cast) is carried into the timers, tweens, ability objects and channels
//   made during the cast, so later hits and effects know they belong to an evolved cast.
// - Look: a casting sigil, a light column and orbiting sparks on every evolved cast; while EV137.cur is set, the old effects
//   get evolved companions (ring → shockwave, big burst → star flare, area hit → ground glyph, bolt → lance, pillar → light
//   column; rate limited); shots get a new projectile model with a glowing wake and their own impact; new cast poses
//   (ATK.evoCast/evoRaise/evoNova/evoFlex). The effects live in 2710 and are relayed to co-op partners (MPV.FX).
// - Preview: the Abilities window's preview plays the evolved form when the ability is evolved, and "Preview evolution" plays
//   it before you buy it (EV137.pv).
var EVO137={};
var EV137={cur:null,dmg:1.25,pv:null,cache:new WeakMap(),busy:0,
  cls:{warrior:[0xff7a2a,0xffd27a],paladin:[0xffd860,0xfff6d0],assassin:[0x9a5aff,0xff4aa8],ranger:[0x6ae08a,0xf0f0a0],mage:[0x6ab8ff,0xc890ff]},
  poseMap:{cast:'evoCast',raise:'evoRaise',nova:'evoNova',flex:'evoFlex'},
  kindPose:{nova:'evoNova',meteor:'evoRaise',chain:'evoCast'}};
function ev137Key(n){return '__ev:'+n}
function ev137On(n){try{if(typeof ABX!='undefined'&&ABX.ctx&&EV137.pv&&EV137.pv===n)return true;return !!(hero&&hero.tal&&hero.tal[ev137Key(n)])}catch(_){return false}}
function ev137Def(s){return s&&EVO137[s.n]||null}
function ev137Pal(cls){return EV137.cls[cls]||[0xffffff,0xffffff]}
// the evolved copy of an ability (cached per ability object)
function ev137Sk(s){let e=EV137.cache.get(s);if(e)return e;const E=ev137Def(s);if(!E)return s;e=Object.create(s);const M=E.mod||{};
  for(const k in M){const v=M[k];if(typeof v=='string'&&v[0]=='*')e[k]=(+s[k]||0)*parseFloat(v.slice(1));else if(typeof v=='string'&&v[0]=='+')e[k]=(+s[k]||0)+parseFloat(v.slice(1));else if(v&&typeof v=='object'&&!Array.isArray(v))e[k]=Object.assign({},s[k]||{},v);else e[k]=v}
  e.ev137=1;e.en=E.en;
  const fxOwn=(typeof FXB_SK!='undefined'&&FXB_SK[s.n])||(typeof FXA!='undefined'&&FXA.on&&FXA.on[s.n]);
  if(E.pose)e.pose=E.pose;else if(s.pose&&EV137.poseMap[s.pose])e.pose=EV137.poseMap[s.pose];
  else if(!s.pose&&!fxOwn){const k=s.k=='rain'?(s.at=='self'?'nova':'meteor'):s.k=='shot'&&!s.arrow&&s.mt=='m'?'chain':s.k;if(EV137.kindPose[k])e.pose=EV137.kindPose[k]}
  if(e.pose&&e.pose!==s.pose)e.pms=E.pms||({evoCast:520,evoRaise:640,evoNova:560,evoFlex:600})[e.pose]||480;
  EV137.cache.set(s,e);return e}
// the ability's hit value outside the handlers (old kinds), like cast_base computes it
function ev137Ctx(sk,i){const s=HS(),mt=sk.mt||CLS[hero.cls].mt,A=atkOf(mt)*(1+s.skillP)*kqrP(sk);
  return {rk:kqrP(sk),sk,i,key:'s'+i,s,P:pl.position.clone(),d:aimDir().clone(),mt,A,raw:A*(sk.m||0),R:(sk.r||0)*(1+(s.aoeP||0)),now:performance.now(),gp:KQS.gp?KQS.gp.clone():null,fx:{mt,col:sk.col,stun:sk.stun,burn:sk.burn},cr:0,pips:0,old:1}}
function ev137Cur(sk){const P=ev137Pal(hero.cls);return {sk,cls:hero.cls,col:sk.col||P[0],c1:P[0],c2:P[1]}}
// carry the evolved cast into callbacks made during it
function ev137Cb(f){const C=EV137.cur;if(!C||typeof f!='function'||f.ev137W)return f;const w=function(){const o=EV137.cur;EV137.cur=C;try{return f.apply(this,arguments)}finally{EV137.cur=o}};w.ev137W=1;return w}
{const st=window.setTimeout;window.setTimeout=function(f,ms){if(EV137.cur&&typeof f=='function'){const a=Array.prototype.slice.call(arguments);a[0]=ev137Cb(f);return st.apply(window,a)}return st.apply(window,arguments)}}
{const f=tw;tw=function(ms,fn,done){if(EV137.cur)return f.call(this,ms,ev137Cb(fn),ev137Cb(done));return f.apply(this,arguments)}}
{const f=kqsObj;kqsObj=function(o){if(EV137.cur&&o)['tick','end','upd','hit'].forEach(k=>{if(typeof o[k]=='function')o[k]=ev137Cb(o[k])});return f.apply(this,arguments)}}
{const f=kqsChan;kqsChan=function(o){if(EV137.cur&&o)['tick','end','upd'].forEach(k=>{if(typeof o[k]=='function')o[k]=ev137Cb(o[k])});return f.apply(this,arguments)}}

// ---------------- damage, cost, saving ----------------
{const f=kqrP;kqrP=function(s){return f.apply(this,arguments)*(s&&s.ev137?EV137.dmg:1)}}
function ev137Cost(s){return kqrCost(s,KQR_MAX)+4}
function ev137Spent(){let n=0;try{const c=hero.cls;kqsAll(c).forEach(s=>{if(hero.tal&&hero.tal[ev137Key(s.n)])n+=ev137Cost(s)})}catch(_){}return n}
{const f=apSpent;apSpent=function(){return f.apply(this,arguments)+ev137Spent()}}
function ev137Why(s){const c=hero.cls;if(!ev137Def(s))return 'No evolution';if(!kqsUnl(c,s))return 'Unlock it first';if(kqrRank(s)<KQR_MAX)return 'Reach rank '+KQR_MAX+' first';
  if(hero.tal[ev137Key(s.n)])return 'Evolved';const k=ev137Cost(s);if(apFree()<k)return 'Needs '+k+' ability points';return ''}
function ev137Evolve(n){const c=hero.cls,s=kqsFind(c,n);if(!s)return false;const w=ev137Why(s);KQS.sel=s.n;if(w){say('🔒 '+s.n+': '+w+'.');return false}
  hero.tal[ev137Key(s.n)]=1;hsDirty();const E=ev137Def(s);EV137.pv=null;
  say('✦ <b>'+s.n+'</b> evolved into <b>'+E.en+'</b>! '+E.d);try{popT(pl.position,'✦ '+E.en+' ✦','#f5d0fe',true)}catch(_){}
  try{ev137Ceremony(pl.position,s.col)}catch(e){console.warn(e)}try{ev137Snd('evolve')}catch(_){}try{mSfx('rare')}catch(_){}
  try{hud()}catch(_){}if(typeof xwMode!='undefined'&&xwMode=='abil')rX();return true}
// the ability reset removes evolutions (their cost is refunded through apSpent)
{const f=kqsReset;kqsReset=function(){const ev=Object.keys(hero.tal).filter(k=>k.startsWith('__ev:'));if(ev.length&&gold>=kqsResetCost()){ev.forEach(k=>delete hero.tal[k]);EV137.pv=null}
  const r=f.apply(this,arguments);try{hud()}catch(_){}return r}}
// tests / cheats: evolve every learned ability (rank 5 first)
function ev137All(on){const c=hero.cls;kqsAll(c).forEach(s=>{if(!kqsUnl(c,s))return;if(on===false)delete hero.tal[ev137Key(s.n)];else{hero.tal['ab:'+s.n]=KQR_MAX;hero.tal[ev137Key(s.n)]=1}});hsDirty();KQS.ck=''}

// ---------------- the cast ----------------
{const f=cast;cast=function(i){i=+i;let A=null,o=null;try{A=heroSkills();o=A&&A[i]}catch(_){}
  if(!o||o.ev137||!ev137Def(o)||!ev137On(o.n))return f.apply(this,arguments);
  const e=ev137Sk(o),prev=EV137.cur,cd0=(hero.cd&&hero.cd['s'+i])||0,ch0=hero.chan,k0=KQS.ch;let x=null;
  A[i]=e;EV137.cur=ev137Cur(e);let r;
  try{try{x=ev137Ctx(e,i)}catch(_){}
    r=f.apply(this,arguments);
    const did=((hero.cd&&hero.cd['s'+i])||0)>cd0+.01||(hero.chan&&hero.chan!==ch0)||(KQS.ch&&KQS.ch!==k0);
    if(did&&x){x.P0=x.P;x.P=pl.position.clone();try{if(typeof mpvRun=='function')mpvRun(()=>ev137Fired(e,x),null,[]);else ev137Fired(e,x)}catch(err){console.error('evolved '+e.n,err)}}}
  finally{if(A[i]===e)A[i]=o;EV137.cur=prev}
  return r}}
// after an evolved cast went off: the evolved look on the caster, and the old kinds' extra mechanics
function ev137Fired(e,x){const E=ev137Def(e),C=EV137.cur,P=x.P0||x.P;
  EV137.busy++;try{ev137CastFx(P,C)}finally{EV137.busy--}
  if(e.k!='x'&&E.post)E.post(x);
  if(e.k=='buff'||e.k=='heal'||e.k=='barrier'){try{if(ATK.evoFlex)haPlay(600,ATK.evoFlex,2,null,.12)}catch(_){}}
  try{ev137Snd(e.k=='buff'||e.k=='heal'||e.k=='barrier'?'buff':'cast')}catch(_){}}
// old ground skills ask aimPoint for a fixed reach (Leap Slam 7, Meteor 10…): an evolved range lifts it
{const f=aimPoint;aimPoint=function(maxD){const C=EV137.cur;if(C&&C.sk&&C.sk.rng&&KQS.gp)maxD=Math.max(maxD||0,C.sk.rng);return f.call(this,maxD)}}
// the new abilities (k:'x'): their handlers get the evolved extras
Object.keys(KQH).forEach(k=>{const f=KQH[k];KQH[k]=function(c){const sk=c&&c.sk,E=sk&&sk.ev137&&ev137Def(sk);if(!E)return f.apply(this,arguments);
  if(E.pre)try{E.pre(c)}catch(err){console.error(err)}
  const r=E.run?E.run(c,f):f.apply(this,arguments);
  if(r!==false&&E.post&&!E.run)try{E.post(c)}catch(err){console.error('evolved '+sk.n,err)}return r}});

// ---------------- the evolved look of every cast ----------------
function ev137CastFx(P,C){const p=pl.position,col=C.col,c2=C.c2;
  ev137Sigil(P,col,2.2,700,0,.7);ev137Column(P,c2,3.2,.42,460,.6);ev137Orbit(P,col,1.05,800);ev137Flare(evxGY(p,1.3),c2,.9,280)}
function ev137Ceremony(P,col){const C=ev137Pal(hero.cls);col=col||C[0];
  ev137Sigil(P,col,4.2,1800,0);ev137Column(P,C[1],12,1.1,1400);ev137Column(P,col,7,1.8,1100);ev137Orbit(P,col,1.6,1600);ev137Orbit(P,C[1],2.2,1400);
  setTimeout(()=>{ev137Shock(P,col,6,700);ev137Flare(evxGY(P,1.5),C[1],3.5,600);ev137Shards(P,C[1],12,2.4,1.6,1200)},700);
  try{flash('rgba(240,200,255,.18)')}catch(_){}try{haPlay(900,ATK.evoRaise,2,null,.15)}catch(_){}}
// while an evolved cast is running, the old effects get evolved companions (rate limited, never while drawing our own)
{const f=ring;ring=function(pos,col,r,ms){const o=f.apply(this,arguments);const C=EV137.cur;if(C&&!EV137.busy&&pos&&(r||0)>=1.2&&evxLimit('ring',110)){EV137.busy++;try{ev137Shock(pos,evxLerp(col,C.c2,.35),Math.min(10,.55*(1+r)),(ms||400)*1.25)}finally{EV137.busy--}}return o}}
{const f=burst;burst=function(p,col,n,sp,up,life){const o=f.apply(this,arguments);const C=EV137.cur;if(C&&!EV137.busy&&p&&(n|0)>=14&&evxLimit('burst',70)){EV137.busy++;try{ev137Flare(p,evxLerp(col,C.c2,.3),Math.min(2.6,.5+(sp||1)*.3),340);
  for(let j=0;j<5;j++){const a=Math.random()*6.28,v=1.5+Math.random()*(sp||2);evxPuff(p.clone(),{spr:1,col:j%2?C.c2:col,r0:.3,r1:0,life:.5,op:.9,v:[Math.cos(a)*v,1+Math.random()*(up||2),Math.sin(a)*v],drag:1.6,fin:.03})}}finally{EV137.busy--}}return o}}
{const f=area;area=function(p,r,dm,s,dir,half){const o=f.apply(this,arguments);const C=EV137.cur;if(C&&!EV137.busy&&p&&(r||0)>=1&&!dir&&evxLimit('area',150)){EV137.busy++;try{ev137Sigil(p,C.c2,r*1.05,520,1)}finally{EV137.busy--}}return o}}
{const f=bolt;bolt=function(a,b,col){const o=f.apply(this,arguments);const C=EV137.cur;if(C&&!EV137.busy&&a&&b&&evxLimit('bolt',80)){EV137.busy++;try{ev137Lance(a,b,evxLerp(col,C.c2,.3),.08,240)}finally{EV137.busy--}}return o}}
{const f=kqsPillar;kqsPillar=function(p,col,h,ms,w){const o=f.apply(this,arguments);const C=EV137.cur;if(C&&!EV137.busy&&p&&evxLimit('pillar',90)){EV137.busy++;try{ev137Column(p,evxLerp(col,C.c2,.3),(h||8)*1.1,(w||.5)*1.4,(ms||420)*1.3)}finally{EV137.busy--}}return o}}
// shots of an evolved cast: the new model, a glowing wake, and an impact of their own
{const f=launch;launch=function(pos,d,spd,s,dm,life){const n0=shots.length,r=f.apply(this,arguments);const C=EV137.cur;
  if(C&&shots.length>n0){for(let j=n0;j<shots.length;j++){const sh=shots[j];if(sh.ev137)continue;sh.ev137=1;sh.evC=evxLerp(s&&s.col||C.col,C.c2,.2);sh.evCls=C.cls;
    try{const M=ev137Proj(C.cls,sh.evC);M.userData.ev137P=1;sh.m.add(M);sh.m.userData.ev137S=M.userData.spin;if(!s.arrow&&sh.m.material){sh.m.material.visible=false}if(C.cls=='ranger'||C.cls=='assassin')M.scale.setScalar(1.6)}catch(err){console.warn(err)}}}return r}}
{const f=shotTick;shotTick=function(dt){let A=null;for(const sh of shots)if(sh.ev137){(A||(A=[])).push(sh);if(dt>0)try{ev137Trail(sh,dt)}catch(_){}}
  const r=f.apply(this,arguments);
  if(A)A.forEach(sh=>{if(shots.indexOf(sh)>=0)return;const p=sh.m.getWorldPosition?sh.m.getWorldPosition(new THREE.Vector3()):sh.m.position.clone();
    try{if(sh.hit&&sh.hit.size)ev137Impact(p,sh.evC,sh.evCls=='mage'?1.25:1);else ev137Flare(p,sh.evC,.8,220)}catch(_){}
    sh.m.children.slice().forEach(q=>{if(q.userData&&q.userData.ev137P)sh.m.remove(q)})});return r}}

// ---------------- poses: gather → unleash ----------------
(function(){if(typeof ATK=='undefined'||typeof atkTrack!='function')return;const E=atkEyes;
  // two hands gather a charge at the chest, then thrust it out with a lunge; long follow-through
  ATK.evoCast=atkTrack([[0,ATK_REST],[.14,E({sx:-.16,hx:-.12,ax:-1.05,az:-.55,ex:-2.0,lx:-1.05,lz:.55,le:-2.0,sy:.3,py:.12,lk:.35,rk:.35,dy:-.07}),'out'],
    [.3,E({sx:.32,hx:.1,ax:-1.65,az:.3,ex:-.05,rw:.3,lx:-1.65,lz:-.3,le:-.05,lw:.3,sy:-.12,py:-.08,lh:-.42,rh:.3,lk:.55,rk:.2,dy:-.12}),'in2'],
    [.66,E({sx:.28,hx:.08,ax:-1.6,az:.38,ex:-.08,rw:.3,lx:-1.6,lz:-.38,le:-.08,lw:.3,sy:-.1,lh:-.4,rh:.28,lk:.52,rk:.2,dy:-.11}),'out'],[1,ATK_REST,'io']]);
  // arms sweep low and back, then rise into a V overhead on tiptoe, and hold
  ATK.evoRaise=atkTrack([[0,ATK_REST],[.18,E({sx:.3,hx:.15,ax:.4,az:.5,ex:-.3,lx:.4,lz:-.5,le:-.3,lk:.6,rk:.6,dy:-.16}),'out'],
    [.42,E({sx:-.28,hx:-.45,ax:-2.85,az:.85,ex:-.12,lx:-2.85,lz:-.85,le:-.12,dy:.03,lk:.05,rk:.05}),'in2'],[.75,E({sx:-.26,hx:-.42,ax:-2.8,az:.9,ex:-.15,lx:-2.8,lz:-.9,le:-.15,dy:.03}),'out'],[1,ATK_REST,'io']]);
  // arms cross over the chest, then burst out wide and down in a deep crouch
  ATK.evoNova=atkTrack([[0,ATK_REST],[.16,E({sx:-.12,ax:-1.35,az:-1.05,ex:-1.9,lx:-1.35,lz:1.05,le:-1.9,lk:.3,rk:.3,dy:-.05}),'out'],
    [.32,E({sx:.55,hx:.25,ax:-.35,az:1.35,ex:-.05,lx:-.35,lz:-1.35,le:-.05,lh:-.4,rh:.35,lk:.9,rk:.7,dy:-.2}),'in2'],[.68,E({sx:.5,hx:.22,ax:-.3,az:1.4,ex:-.08,lx:-.3,lz:-1.4,le:-.08,lh:-.38,rh:.33,lk:.86,rk:.66,dy:-.19}),'out'],[1,ATK_REST,'io']]);
  // a roar: fists drawn in, then flung out to the sides, chest forward, head back
  ATK.evoFlex=atkTrack([[0,ATK_REST],[.2,E({sx:.3,ax:-.4,az:.2,ex:-2.1,lx:-.4,lz:-.2,le:-2.1,lk:.4,rk:.4,dy:-.08,hx:.2}),'out'],
    [.42,E({sx:-.3,hx:-.5,ax:-1.2,az:1.25,ex:-.5,lx:-1.2,lz:-1.25,le:-.5,dy:.02}),'in2'],[.74,E({sx:-.26,hx:-.45,ax:-1.15,az:1.2,ex:-.55,lx:-1.15,lz:-1.2,le:-.55,dy:.02}),'out'],[1,ATK_REST,'io']])})();
{const f=kqsPoseT;kqsPoseT=function(p){if(typeof ATK!='undefined'){const m={evoCast:[ATK.evoCast,520],evoRaise:[ATK.evoRaise,640],evoNova:[ATK.evoNova,560],evoFlex:[ATK.evoFlex,600]}[p];if(m&&m[0])return m}return f.apply(this,arguments)}}

// ---------------- sounds ----------------
function ev137Snd(k){try{if(SET.sfx===false||SET.sfxV!=null&&!(+SET.sfxV>0))return;const a=AUD;if(!a||a.state!='running'||!a.out)return;const t=a.currentTime;
  const tone=(ty,f,at,dur,v,f1)=>{const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.setValueAtTime(f,t+at);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+at+dur);g.gain.setValueAtTime(0,t+at);g.gain.linearRampToValueAtTime(v,t+at+.01);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);o.connect(g);g.connect(a.out);o.start(t+at);o.stop(t+at+dur+.05)};
  if(k=='cast'){tone('sine',520,0,.5,.05,1560);tone('triangle',780,.04,.45,.04,2340);tone('sine',130,0,.4,.08,65)}
  else if(k=='buff'){[0,.06,.12].forEach((at,j)=>tone('sine',[523,659,784][j],at,.6,.05));tone('triangle',1046,.18,.7,.03)}
  else if(k=='evolve'){[0,.1,.2,.3,.42].forEach((at,j)=>tone('sine',[392,523,659,784,1046][j],at,1.1,.06));tone('sawtooth',98,0,1.4,.05,196);tone('triangle',2093,.5,1,.03)}}catch(_){}}

// ---------------- the Abilities window: evolution box, ✦ marks, preview ----------------
function ev137Box(s){const c=hero.cls,E=ev137Def(s);if(!E)return '';const un=kqsUnl(c,s),r=un?kqrRank(s):0,on=!!hero.tal[ev137Key(s.n)],w=ev137Why(s),k=ev137Cost(s),pv=EV137.pv===s.n;
  if(on)return `<div class="ev137-box on"><div class="ev137-h">✦ Evolved · <b>${E.en}</b></div><div class="ev137-d">${E.d}</div><div class="ev137-n">+25% damage and healing · new look</div></div>`;
  if(r<KQR_MAX)return `<div class="ev137-box lock"><div class="ev137-h">✦ At rank ${KQR_MAX} it can evolve into <b>${E.en}</b></div><div class="ev137-d">${E.d}</div></div>`;
  return `<div class="ev137-box ready"><div class="ev137-h">✦ Evolution · <b>${E.en}</b></div><div class="ev137-d">${E.d} <span class="ev137-n">+25% damage and healing, new look.</span></div>
    <div class="ev137-n">Evolving costs ${k} ability points (refunded by Reset abilities).</div>
    <div class="btns"><button class="${w?'':'pri '}ev137-go" data-ev137="${s.n}" ${w?'disabled':''}>${w?'🔒 '+w:'✦ Evolve · '+k+' ⚡'}</button><button data-ev137pv="${s.n}" class="${pv?'on':''}">${pv?'■ Stop preview':'👁 Preview evolution'}</button></div></div>`}
{const f=XR.abil;XR.abil=function(){const r=f.apply(this,arguments);try{ev137Decor()}catch(err){console.error(err)}return r}}
function ev137Decor(){const c=hero.cls,B=$('xwB');if(!B)return;
  document.querySelectorAll('#xwB [data-kqsel]').forEach(row=>{const s=kqsFind(c,row.dataset.kqsel);if(!s||!hero.tal[ev137Key(s.n)])return;row.classList.add('ev137-row');const b=row.querySelector('.rn b');
    if(b&&!row.querySelector('.ev137-tag'))b.insertAdjacentHTML('afterend',` <span class="ev137-tag" title="Evolved: ${ev137Def(s).en}">✦ ${ev137Def(s).en}</span>`)});
  document.querySelectorAll('#xwB [data-kqslot]').forEach(sl=>{const s=heroSkills()[+sl.dataset.kqslot];if(s&&hero.tal[ev137Key(s.n)])sl.classList.add('ev137-slot')});
  const sel=kqsFind(c,KQS.sel)||heroSkills()[0],box=B.querySelector('.kqr-box');if(!sel)return;
  if(EV137.pv&&EV137.pv!==sel.n)EV137.pv=null;
  const h=ev137Box(sel);if(h){if(box)box.insertAdjacentHTML('afterend',h);else{const det=B.querySelector('.kqs-det');if(det)det.insertAdjacentHTML('beforeend',h)}}
  const lb=document.querySelector('#xw .abpvl span');if(lb&&(EV137.pv===sel.n||hero.tal[ev137Key(sel.n)]))lb.innerHTML='▶ Preview · <b class="ev137-tag">✦ '+ev137Def(sel).en+'</b>'}
$('xw').addEventListener('click',e=>{if(typeof xwMode=='undefined'||xwMode!='abil')return;const t=e.target.closest('[data-ev137],[data-ev137pv]');if(!t)return;e.stopPropagation();e.preventDefault();if(t.disabled)return;
  if(t.dataset.ev137)ev137Evolve(t.dataset.ev137);
  else{const n=t.dataset.ev137pv;EV137.pv=EV137.pv===n?null:n;KQS.sel=n;rX();try{if(typeof ABX!='undefined'&&ABX.on)abxCycle(performance.now())}catch(_){}}},true);
// the hotbar: evolved keys glow and carry a ✦
{const f=hud;hud=function(){f.apply(this,arguments);if(typeof ABX!='undefined'&&ABX.ctx)return;try{const A=$('acts');if(!A||!party.length)return;heroSkills().forEach((s,i)=>{const b=A.querySelector('button[data-x="'+i+'"]');if(!b)return;const on=!!(hero.tal&&hero.tal[ev137Key(s.n)]);
  b.classList.toggle('ev137-hk',on);const q=b.querySelector('.kqr-b');if(q&&on){q.textContent='✦';q.title='Evolved: '+ev137Def(s).en}if(on)b.title=ev137Def(s).en+' (evolved '+s.n+')'})}catch(_){}}}
// the ground-targeting bar names the evolved form
{const f=kqsTgStart;kqsTgStart=function(i,sk){const r=f.apply(this,arguments);try{if(sk&&sk.ev137){const b=$('kqsTg');const n=b&&b.querySelector('.kqs-tgn');if(n)n.innerHTML=sk.i+' <b>✦ '+sk.en+'</b>'}}catch(_){}return r}}
document.head.insertAdjacentHTML('beforeend',`<style>
.ev137-box{margin:8px 0;padding:8px 9px;border-radius:8px;border:1px solid rgba(200,140,255,.35);background:linear-gradient(135deg,rgba(150,90,255,.12),rgba(255,180,90,.08));font-size:.76rem}
.ev137-box.lock{opacity:.7;border-style:dashed}.ev137-box.on{border-color:rgba(240,200,120,.6);box-shadow:0 0 10px rgba(200,140,255,.25) inset}
.ev137-h{font-size:.8rem;margin-bottom:3px;color:#f5d0fe}.ev137-h b{color:#fde68a}.ev137-d{line-height:1.35}.ev137-n{opacity:.75;font-size:.7rem;margin-top:3px}
.ev137-box .btns{margin-top:6px;display:flex;gap:6px;flex-wrap:wrap}.ev137-box .btns button.on{outline:1px solid #f5d0fe}
.ev137-go.pri{background:linear-gradient(90deg,#7c3aed,#d97706);border-color:#f5d0fe;color:#fff;animation:ev137p 1.6s ease-in-out infinite}
@keyframes ev137p{0%,100%{box-shadow:0 0 0 rgba(245,208,254,0)}50%{box-shadow:0 0 12px rgba(245,208,254,.7)}}
.ev137-tag{color:#f5d0fe;font-size:.68rem;font-weight:700;text-shadow:0 0 6px rgba(200,140,255,.7);white-space:nowrap}
.ev137-row{background:linear-gradient(90deg,rgba(150,90,255,.1),transparent 70%)}.ev137-slot{box-shadow:0 0 0 1px rgba(245,208,254,.7),0 0 10px rgba(180,120,255,.45)}
#acts .hs.ev137-hk,#acts button.ev137-hk{box-shadow:0 0 0 1px rgba(245,208,254,.85),0 0 12px rgba(180,120,255,.55);animation:ev137h 2.4s ease-in-out infinite}
#acts button.ev137-hk .kqr-b{color:#f5d0fe!important;opacity:1!important;font-size:.7rem!important;text-shadow:0 0 6px #a855f7,0 1px 2px #000!important}
@keyframes ev137h{0%,100%{box-shadow:0 0 0 1px rgba(245,208,254,.7),0 0 8px rgba(180,120,255,.35)}50%{box-shadow:0 0 0 1px rgba(253,230,138,.9),0 0 16px rgba(220,150,255,.7)}}
</style>`);
