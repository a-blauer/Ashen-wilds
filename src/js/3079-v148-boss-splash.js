// ================= v148.1: boss attacks also catch companions standing in them (30%) =================
// The six Sovereigns and Vorraxis check each strike once, against the hero only (svHitNow / mb144HitNow: shape s at anchor an).
// Now every active companion standing inside that same shape takes SPL148.k (30%) of the strike, whether or not the hero
// was hit (dodging out yourself does not save a companion left in it). The two room-wide signature blasts work the same way:
// Vorraxis's Deluge (companions not on a stone island) and the Wraith's Absolute Zero (companions not beside a lit brazier).
// The v146 expanding ring waves check companions on the ring as it passes. Projectiles (spines, bolts, blood drops: they call
// the hit with a catch-all shape r 99 once they reach the hero) and lingering ground hazards (pools, blood, rot, sand) still
// only hurt the hero.
var BSPL148={n:0};
function bspl148All(s){return !s||(s.k==='c'&&s.r>=50)}
function bspl148Fols(test){const out=[];const n=typeof actN141=='function'?actN141():party.length;
  for(let i=0;i<Math.min(n,fols.length);i++){const f=fols[i],c=party[i];if(!f||!c||c.h<=0||!f.visible)continue;try{if(test(f.position))out.push(f)}catch(_){}}return out}
function bspl148Hit(e,L,dm){if(!e||e.dead||!L.length)return;const mt=e.c&&e.c.mt;
  L.forEach(f=>{SPL148.on=1;try{hitTarget(e,f,(dm||1)*SPL148.k,mt);BSPL148.n++}catch(err){console.warn('v148 boss splash',err)}finally{SPL148.on=0}})}
// Sovereign strikes (Vorraxis's go through mb144HitNow below, which svHitNow also forwards to)
{const f=svHitNow;svHitNow=function(e,s,an,dm,o){const r=f.apply(this,arguments);
  try{if(e&&!e.mb144&&e.sv&&!bspl148All(s)&&AF&&AF.i===e.sv.i&&!e.dead)bspl148Hit(e,bspl148Fols(p=>svIn(s,an,p,(o||{}).pad)),dm)}catch(err){console.warn('v148 boss splash',err)}return r}}
{const f=mb144HitNow;mb144HitNow=function(e,s,an,dm,o){const r=f.apply(this,arguments);
  try{if(e&&!bspl148All(s)&&MB144A&&MB144A.f&&!e.dead)bspl148Hit(e,bspl148Fols(p=>svIn(s,an,p,(o||{}).pad)),dm)}catch(err){console.warn('v148 boss splash',err)}return r}}
// Vorraxis's Deluge: the flood hits everyone off the islands
{const f=mb144Deluge;mb144Deluge=function(e){let L=[];try{L=bspl148Fols(p=>!MQ144.isl.some(o=>Math.hypot(p.x-o.x,p.z-o.z)<1.95))}catch(_){}
  const r=f.apply(this,arguments);try{if(MB144A&&MB144A.f)bspl148Hit(e,L,2.6)}catch(_){}return r}}
// the Wraith's Absolute Zero: everyone away from a lit brazier freezes
{const f=rw146HeartEnd;rw146HeartEnd=function(c,broken){let L=[];
  try{if(!broken&&c&&c.M&&!c.M.an.done2){const D=c.A&&c.A.s146,F=(D&&D.fires)||[];L=bspl148Fols(p=>!F.some(o=>Math.hypot(p.x-o.x,p.z-o.z)<o.r))}}catch(_){}
  const r=f.apply(this,arguments);try{if(L.length&&c&&c.e&&AF)bspl148Hit(c.e,L,2.2)}catch(_){}return r}}
// v146 ring waves: a companion standing on the ring as it sweeps out is caught once
{const f=sk146RingWave;sk146RingWave=function(e,p,r0,r1,T,bw,dm,col,o){const r=f.apply(this,arguments);
  try{let t=0;const seen=new Set();kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/T),R=r0+(r1-r0)*k;if(!e||e.dead||!AF)return false;
      const L=bspl148Fols(q=>Math.abs(Math.hypot(q.x-p.x,q.z-p.z)-R)<bw/2+.3).filter(f=>!seen.has(f));L.forEach(f=>seen.add(f));bspl148Hit(e,L,dm);return k<1},end(){}})}catch(err){console.warn('v148 ring splash',err)}return r}}
