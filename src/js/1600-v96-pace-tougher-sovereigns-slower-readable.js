// ================= v96 pace: tougher Sovereigns, slower and readable boss specials, staggered ranged openers =================
// 1. Boss health ×1.5: every Sovereign (the only enemies spawned with the boss flag, by spawnBoss) gets PACE.hp × its max
//    health. Dungeon wardens and camp leaders are elites (al flag) and are unchanged. Every client spawns the boss the same
//    way, so co-op health sync (zzz_mp 'bs', clamped to M(e.c)) stays consistent. Den sub-targets (eye-stalks, brood necks,
//    pustules, corpse piles, chalices, doubles, obelisks) keep their old absolute health (paceM0 = health before the ×1.5);
//    mechanic wounds/heals that are a share of the boss's health (eye burst, sever/sear, pustule pop, chalice heal) keep their share.
// 2. Specials: twice the time between them, ×1.5 wind-ups.
//    - Wind-ups: every Sovereign move reads its timing from `en`. paceWrap() (run after every module, see build/pN_pace.py)
//      wraps each BMV move outermost and multiplies en by PACE.W when the move is cast fresh by the boss driver (inside the
//      boss AI or a den scheduler: MP.inAI, depth 0). Nested calls (fallbacks, setTimeout chains) already got the scaled en,
//      co-op partners replay the relayed (already scaled) en unscaled, so nothing is scaled twice. Moves that pack a den index
//      into en (dqEnc) keep the index. The v89 sands rig reads en inside this wrapper, so its whips still land on the warning.
//      Den timings written as plain numbers (neck bites, eye wakes, leaps, ice falls, geysers, lashes, …) are patched in
//      build/pN_pace.py with the same factor.
//    - Intervals: bossAI's next-special timer becomes PACE.I × (the old move length + the old recovery gap); den schedulers
//      (eye wakes, neck spawns/attacks, snuff, whiteout, vortex, sandstorm, corpse piles, pustules, chalices, blood moon,
//      rite harass) and the Cataclysm cooldown are ×PACE.I / ×PACE.U.
//    - Between specials the boss keeps the pressure with basic attacks (BMV pbasic: a short red circle in front when you
//      are in reach; pbolt: one aimed bolt when you are not), every PACE.B.cd seconds, only while it is free.
// 3. Ranged openers: on aggro every ranged/caster mob waits PACE.op seconds (random) before its first shot (it keeps
//    repositioning), and within PACE.tokR tiles only PACE.tokN ranged/caster attacks may start per PACE.tokW seconds
//    (an "attack token"; a mob without one retries a moment later). Host only: co-op mirrors replay the host's attacks.
var PACE={hp:1.5,W:1.5,I:2,U:2,T0:3.3,
  B:{cd:[2.6,3.4],wm:.8,wr:1.0,dm:.6,dr:.5},
  op:[1,4],tokN:2,tokW:.6,tokR:16,
  clk:0,tok:[],dep:0,lastK:1,mvT:0,basic:true,wrapped:0,on:true,log:[],st:{op:0,tok:0,basic:0,bolt:0},
  // moves whose en must not be scaled: the Cataclysm (already 4.6 s+), basics, den sub-events, idx-only den casts
  raw:{ult:1,pbasic:1,pbolt:1,chalices:1,riteend:1,rite:1,corpsecall:1,rottide:1,bloodmoon:1,whiteout:1},
  // moves that carry a den index in en (dqEnc): scaled with the index kept
  enc:{batswarm:1,mirror:1},
  // moves whose returned length does not grow with en
  fixD:{erupt:1,ram:1,whiteout:1}};
// health before the ×1.5 (for den sub-targets sized from the boss)
function paceM0(c){return M(c)/((c&&c._pHP)||1)}
function paceRaw(k){return PACE.raw[k]||/^arEye\d|^hyNeck\d/.test(k)}
function paceEnc(en,w){const n=Math.round((+en||1)*1000),i=n%10,b=(n-i)/1000;return Math.round(b*w*100)/100+i/1000}
// the next-special timer: PACE.I × (old move length + old recovery gap). The old length is the returned length / the
// wind-up factor, except for parts that do not grow with en (the Great Eye's beam, the Hydra's second wave and tail).
function paceFixPart(k,e){if(k=='argusgaze')return typeof AR!='undefined'&&AR.beam?AR.beam.t+.5:3;if(k=='tide')return ((e&&e.bs&&e.bs.ph>=2)?2:1)*1.3+1.2;return 0}
function paceGap(k,r,g,e){const d=(r&&+r.d)||0,k0=PACE.lastK||1,fx=Math.min(d,paceFixPart(k,e));return PACE.I*((d-fx)/k0+fx+g)}
// a den state (Ssith'ra's ram, dive & erupt) hands the boss back: remaining wait so the whole interval is ~PACE.I× the old one
// (old elapsed ≈ elapsed / 1.2, as only its wind-ups grew)
function paceEnd(g){const el=Math.min(8,Math.max(0,PACE.clk-(PACE.mvT||0)));return PACE.I*g+Math.max(0,PACE.I/1.2-1)*el}
// ---- 1. boss health ----
{const f=spawnBoss;spawnBoss=function(i){const e=f.apply(this,arguments);try{if(e&&e.c&&e.c.st&&!e.c._pHP){e.c._pHP=PACE.hp;e.c.st.hp*=PACE.hp;e.c.h=Math.round(e.c.st.hp)}}catch(err){console.error('pace hp',err)}return e}}
// ---- 2. scaled wind-ups (wrapped outermost, after every module: see paceWrap() in build/pN_pace.py) ----
function paceWrap(){if(PACE.wrapped)return;PACE.wrapped=1;
  Object.keys(BMV).forEach(k=>{const f=BMV[k];if(typeof f!='function')return;
    BMV[k]=function(e,A,en){const top=PACE.on&&!PACE.dep&&typeof MP!='undefined'&&MP.inAI;let en2=en;
      if(top){let w=paceRaw(k)?1:PACE.W;if(w!==1)en2=PACE.enc[k]?paceEnc(en,w):(+en||1)*w;PACE.lastK=PACE.fixD[k]?1:w;if(!/^pb/.test(k))PACE.mvT=PACE.clk;
        if(PACE.log.length<4000&&A)PACE.log.push([k,+PACE.clk.toFixed(2),A.i])}
      PACE.dep++;try{return f.call(this,e,A,en2)}finally{PACE.dep--}}});
  // the sands rig plays our basics like its own sweep / spit
  if(typeof ssrMove=='function'){const g=ssrMove;ssrMove=function(e,k,en,r){return g.call(this,e,k=='pbasic'?'tailsweep':k=='pbolt'?'spit':k,en,r)}}}
// ---- basic attacks between specials (relayed like every boss move) ----
kqBmv('pbasic',function(e,A,en){const m=e.m,bs=m.bs||3,W=.75*(+en||1),d=toPl(m.position),reach=1.8+.45*bs,rr=Math.max(2,1+.35*bs);
  const o=inArena(A,m.position.clone().addScaledVector(d,Math.min(reach*.55,d2(pl.position,m.position))),1);m.rotation.y=Math.atan2(d.x,d.z);
  if(m.isHum&&typeof dqPose=='function')dqPose(e,'slam',W*.85,.3);else kqTimed(Math.max(.05,W-.3),()=>{},ab=>{if(!ab&&!e.dead)lunge(m,o)},()=>A.f);
  tele(o,rr,W,()=>{if(!A.f||e.dead)return;burst(gY(o,.3),A.b.col||0xff5030,14,2,2,.4);if(d2(pl.position,o)<rr&&hero.iv<=0)bossHit(e,PACE.B.dm)});
  return {d:W+.25,lock:1}});
kqBmv('pbolt',function(e,A,en){const m=e.m,W=PACE.B.wr*(+en||1),q=pl.position.clone(),col=A.b.col||0xff5030;m.rotation.y=Math.atan2(q.x-m.position.x,q.z-m.position.z);
  kqBossCast(e,col,W*700);if(m.isHum&&typeof dqPose=='function')dqPose(e,'bolt',W*.8,.3);kqFall(A,q,W,col,'orb',1.0,kqMouth(e));
  tele(q,1.5,W,()=>{if(!A.f||e.dead)return;burst(gY(q,.3),col,14,2,2,.4);if(d2(pl.position,q)<1.5&&hero.iv<=0)bossHit(e,PACE.B.dr)});
  return {d:.6,lock:0}});
// the boss is free for a basic: no special running or due, no den state that owns it
function paceFree(A,e){const b=e.bs;if(!b||!A||!A.f||e.dead||hero.hp<=0)return false;
  if(b.lock>0||b.dash||b.face||e.hid||e.jmp||e.fly||e.spin||e.sub||e.dqImm)return false;
  if(b.t<1.4)return false;
  if(e._ssX&&nowP()<e._ssX)return false;
  const D=A.dn;if(D&&(D.er||D.ram||D.wh))return false;
  const S=A.dq;if(S&&(S.rite||S.stun>0||(S.mir&&!S.mir.done)))return false;
  if(A.i===0&&typeof AR!='undefined'&&(AR.beam||AR.mark))return false;
  return true}
function paceAuth(A){try{return !MP.on||mpBossAuth(A.i)===MP.me}catch(_){return true}}
{const f=bossAI;bossAI=function(e,dt){const r=f.apply(this,arguments);
  try{const A=arenaOf(e);if(PACE.basic&&A&&A.f&&e&&e.bs&&paceAuth(A)){const b=e.bs;b.pb=(b.pb==null?PACE.B.cd[0]:b.pb)-(dt||0);
    if(b.pb<=0&&paceFree(A,e)){const L=d2(pl.position,e.m.position),reach=1.8+.45*(e.m.bs||3),mel=L<=reach;
      const o=MP.inAI;MP.inAI=1;let q=null;try{q=BMV[mel?'pbasic':'pbolt'](e,A,mel?PACE.B.wm/.75:1)}finally{MP.inAI=o}
      if(q&&q.lock)b.lock=Math.max(b.lock,q.d);PACE.st[mel?'basic':'bolt']++;b.pb=PACE.B.cd[0]+Math.random()*(PACE.B.cd[1]-PACE.B.cd[0])}}}
  catch(err){console.error('pace basic',err)}return r}}
{const f=arenaStart;arenaStart=function(A,e){const r=f.apply(this,arguments);if(e&&e.bs)e.bs.pb=PACE.T0+1+Math.random();return r}}
// ---- 3. ranged openers + attack tokens ----
function paceRanged(e){if(e._pR!=null)return e._pR;const k=kqKey(e),ms=MSET[k]||[],en=EN[k]||{};return e._pR=!!(en.ranged||e.role=='caster'||ms.some(n=>KQR[n]||n=='rainfire'))}
function paceRMove(n){return !!(KQR[n]||n=='rainfire')}
{const f=eshotTick;eshotTick=function(dt){PACE.clk+=dt||0;return f.apply(this,arguments)}}
{const f=eTick;eTick=function(e,dt,now){if(e&&!e.boss&&!e.mir){if(e.agg){if(e._pAgT==null){e._pAgT=PACE.clk;e._pOp=PACE.op[0]+Math.random()*(PACE.op[1]-PACE.op[0])}}else e._pAgT=null}return f.apply(this,arguments)}}
function paceTok(e){const t=PACE.clk,L=PACE.tok;while(L.length&&t-L[0].t>PACE.tokW)L.shift();let n=0;const p=e.m.position;
  for(const q of L)if(Math.hypot(q.x-p.x,q.z-p.z)<PACE.tokR)n++;return n<PACE.tokN}
{const f=mStart;mStart=function(e,tg,n){
  if(PACE.on&&e&&!e.boss&&!e.mir&&!e.dprop&&e.m&&e.c&&paceRMove(n)&&paceRanged(e)){
    if(e._pAgT==null){e._pAgT=PACE.clk;e._pOp=PACE.op[0]+Math.random()*(PACE.op[1]-PACE.op[0])}
    const w=e._pOp-(PACE.clk-e._pAgT);if(w>0){e.cd=Math.max(e.cd||0,w);PACE.st.op++;return}
    if(!paceTok(e)){e.cd=Math.max(e.cd||0,.25+Math.random()*.4);PACE.st.tok++;return}
    PACE.tok.push({t:PACE.clk,x:e.m.position.x,z:e.m.position.z})}
  return f.apply(this,arguments)}}

