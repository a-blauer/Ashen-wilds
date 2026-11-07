// ================= v206: threat — monsters turn on the companion that hurts them most =================
// Owner (Nov 7 2026): "Enemy focus and threat should target the companion if they're doing enough damage. The tank companions
// like turtle should generate a little extra threat naturally so they tend to tank."
//  * Every monster keeps a threat table e.th206 = {h: the hero, c: [lead, 2nd]} filled by the damage each one deals it (hurt,
//    direct hits only; CH127 names the companion during compHit, 2300) and fading with a half-life of about TH206.half s.
//  * Earth companions (Stoneshell / the turtle line, Mossfrog, Cragback, Bogmaw, …) are the tanks: their damage counts
//    TH206.tank times, and while they stand next to a monster that is fighting they add TH206.pres of its max health per second.
//  * eTarget (0290, 3091 …) runs first; then a companion whose threat is over TH206.take × the hero's takes the monster (at most
//    TH206.cap monsters on one companion, TH206.capT on a tank), and it keeps it until the hero's threat is TH206.back × its own.
//  * Not for Sovereigns, scripted foes or mirrored (co-op guest) monsters; in co-op the host's monsters weigh the host's own hero
//    and companions this way (partners' companions keep the closest-first rule of v150).
var TH206={half:6,take:1.15,back:1.35,tank:1.75,pres:.025,presR:3,cap:2,capT:3,reach:12,min:1};
function th206Tank(c){try{return famOf(c.g[0])==='Earth'}catch(_){return false}}
function th206Of(e){let T=e.th206;const n=nowP();if(!T)T=e.th206={h:0,c:[0,0],t:n};const dt=(n-T.t)/1000;if(dt>0){const k=Math.pow(.5,dt/TH206.half);T.h*=k;T.c[0]*=k;T.c[1]*=k;T.t=n}return T}
function th206Skip(e){return !e||e.dead||e.boss||e.sv||e.mir||e.dprop||e.hunt||e.minion&&!e.agg}
// damage → threat
{const f=hurt;hurt=function(e,d,s,crit,dot){const h0=e&&e.c?e.c.h:null;const r=f.apply(this,arguments);
  try{if(h0!=null&&!dot&&!th206Skip(e)&&!(typeof MP!='undefined'&&MP.ap)){const got=h0-Math.max(0,e.c.h);if(got>0){const T=th206Of(e),C=typeof CH127!='undefined'&&CH127&&CH127.e===e?CH127.c:null;
    if(C){const i=party.indexOf(C);if(i>=0&&i<2)T.c[i]+=got*(th206Tank(C)?TH206.tank:1)}else T.h+=got}}}catch(_){}return r}}
// a tank's presence: threat while it stands next to a monster that is fighting
setInterval(()=>{try{if(typeof enemies=='undefined'||!party.length)return;const A=actN141();
  for(let i=0;i<Math.min(2,A);i++){const c=party[i],fo=fols[i];if(!c||c.h<=0||!fo||!fo.visible||!th206Tank(c))continue;
    enemies.forEach(e=>{if(th206Skip(e)||!e.agg||!e.m)return;if(d2(e.m.position,fo.position)>TH206.presR)return;th206Of(e).c[i]+=M(e.c)*TH206.pres*.25})}}catch(_){}},250);
// who the monster goes for
function th206Pick(e,m,tg){
  if(th206Skip(e)||!e.th206)return tg;
  const mine=tg===pl||fols.indexOf(tg)>=0;if(!mine)return tg;   // a partner's hero or companion, or a scripted target: left alone
  const T=th206Of(e),cnt=[0,0];enemies.forEach(o=>{if(o!==e&&!o.dead&&o.agg&&o.th206F!=null)cnt[o.th206F]++});
  const ok=i=>{const c=party[i],f=fols[i];return i<actN141()&&c&&c.h>0&&f&&f.visible&&m.position.distanceTo(f.position)<TH206.reach&&cnt[i]<(th206Tank(c)?TH206.capT:TH206.cap)};
  const H=Math.max(T.h,TH206.min);
  // keep the companion it already turned on, until the hero clearly out-threatens it
  if(e.th206F!=null){const i=e.th206F;if(ok(i)&&T.h<T.c[i]*TH206.back){e.tgI=i;return fols[i]}e.th206F=null}
  let best=-1,bv=0;for(let i=0;i<2;i++){if(!ok(i))continue;if(T.c[i]>H*TH206.take&&T.c[i]>bv){bv=T.c[i];best=i}}
  if(best>=0){e.th206F=best;e.tgI=best;return fols[best]}
  // otherwise the old rule stands (the hero, or a companion clearly closer than the hero: 0290)
  return tg}
{const f=eTarget;eTarget=function(e,m,dpl){const tg=f.apply(this,arguments);try{return th206Pick(e,m,tg)}catch(_){return tg}}}
