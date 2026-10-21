// ================= v92 combat: poise (harder to interrupt enemy attacks) + wave-trial drops =================
// Why enemy attacks were easy to interrupt (old rules):
// - t_combat.js heroHit: during the wind-up of any special move (pounce, charge, spin, slam, spit, throw-less specials),
//   ANY ability hit, or any single hit worth >= 6% of the mob's max health, cancelled the attack and stunned the mob for
//   1.1 s ("BREAK!"). That included elites. With most abilities hitting several times, nearly every special was cancelled.
// - Combo finishers (b_logic.js swing, zzA_arsenal.js wMelee) cancel the current attack of normal (non-elite) mobs.
// - Any stun (eStatus fx.stun) cancels non-boss attacks; Frozen/Steam element combos too.
// New rules (poise):
// - Each wind-up (phase 0 of e.atk, basic and special moves) has poise. Every direct, non-DoT hit (hero, ability, companion,
//   shot) during the wind-up adds its damage to a.pz. Only when a.pz reaches KQP.pz (28% of max health for a normal mob, 42%
//   for an elite) is the attack broken (same "BREAK!" + 1.1 s stun as before). Lighter hits only flinch the mob (the old hit
//   flinch plus a small white spark); the attack keeps going, its red warning finishes and it hits as usual.
// - Heavy hits: a combo finisher still interrupts a normal mob (now with the BREAK effect when it was attacking); on an
//   elite it adds KQP.fin (15% of max health) of extra poise damage instead.
// - Explicit stun / interrupt abilities are unchanged on normal mobs and elites: stuns, Intimidating Shout, Frozen, Steam,
//   Vanish/stealth aggro drop, Stampede's knockback stun.
// - Bosses (Sovereigns, den moves): never broken by hits (as before). Stuns still apply at 30% duration and don't cancel the
//   move; after a stun the boss resists further stuns for KQP.bossImm seconds ("RESIST").
// Wave trials (e.wv): XP ×.6 is in build/pN_combat.py (the gainXP factor .525 → .315). Drops: lootE marks wave kills with
//   LT.on==2 (pV6 already keeps .7×.5 of their drops); here drop() keeps a further KQP.wvDrop (50%) of them, eggs included.
//   The end-of-trial reward chest drops with LT.on==0, so it is unchanged.
var KQP={pz:{n:.28,el:.42},fin:.15,bossImm:6,wvDrop:.5,log:[]};
// the last 50 breaks (what tests and the console read); it used to grow for the whole session
function kqpLog(w){KQP.log.push(w);if(KQP.log.length>50)KQP.log.splice(0,KQP.log.length-50)}
function cbThr(e){return M(e.c)*(e.c.al?KQP.pz.el:KQP.pz.n)}
function cbWind(e){return !!(e&&!e.dead&&!e.boss&&e.atk&&e.atk.ph==0)}
// used by the patched break test in heroHit (t_combat.js): true when the poise of this wind-up is gone
function cbBreakChk(e){const a=e&&e.atk;return !!(a&&!e.boss&&(a.pz||0)>=cbThr(e))}
function cbBreakFx(e){popT(e.m.position,'BREAK!','#fde68a',true);burst(gY(e.m.position,1),0xffe08a,30,2.5,2,.5);ring(e.m.position,0xffe08a,1.8,300);hstop=.08;shake(.15);sfx('brk')}
function cbBreak(e,why){if(!(e&&e.atk&&!e.boss&&!e.dead))return;mCancel(e);e.stun=Math.max(e.stun||0,1.1);e.bu=0;cbBreakFx(e);kqpLog(why||'poise')}
// poise damage: every direct hit during a wind-up
{const f=hurt;hurt=function(e,d,s,crit,dot){const w=!dot&&cbWind(e),a=w?e.atk:null,h0=w?e.c.h:0;const r=f.apply(this,arguments);
  if(a&&e.atk===a&&!e.dead){a.pz=(a.pz||0)+Math.max(0,h0-e.c.h);
    if((a.pz||0)<cbThr(e)&&Math.random()<.6)burst(gY(e.m.position,1.1),0xffffff,4,.8,1,.25)}   // light hit: flinch only
  return r}}
// companions break a wind-up through the same poise (their hits don't pass heroHit)
{const f=compHit;compHit=function(c,e){const w=cbWind(e);const r=f.apply(this,arguments);if(w&&cbWind(e)&&cbBreakChk(e))cbBreak(e,'comp');return r}}
// heavy hit (combo finisher): normal mobs are interrupted, elites take extra poise damage
function cbHeavy(e){if(!e||e.boss||e.dead)return;
  if(!e.c.al){const was=!!e.atk;mCancel(e);e.cd=Math.max(e.cd,1);if(was){cbBreakFx(e);kqpLog('finisher')}return}
  if(cbWind(e)){e.atk.pz=(e.atk.pz||0)+M(e.c)*KQP.fin;if(cbBreakChk(e))cbBreak(e,'finisher')}}
// bosses resist stuns for a while after one lands
{const f=eStatus;eStatus=function(e,fx,atk,src){if(e&&e.boss&&fx&&fx.stun&&!e.dead){const t=nowP();
    if(t<(e.cbImm||0)){fx=Object.assign({},fx);delete fx.stun;if(t-(e.cbRt||0)>700){e.cbRt=t;dn(e.m.position,'RESIST','#e5e7eb',-30,700)}}else e.cbImm=t+KQP.bossImm*1000}
  return f.call(this,e,fx,atk,src)}}
// wave-trial drops: a further 50% on top of pV6's LT filter (LT.on==2 only while a wave mob's lootE runs)
{const f=drop;drop=function(kind,data,p,r){if(typeof LT!='undefined'&&LT.on==2&&Math.random()>KQP.wvDrop)return;return f.apply(this,arguments)}}

