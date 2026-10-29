// ================= v167: combat fixes (owner's list, Oct 29 2026) =================
// 1. "Enemies don't attack until they're right next to their target": a melee move started only when the target was inside its
//    rmax (bite / strike 1.9 tiles, centre to centre: touching), but its hit lands up to the red warning's edge (cone r + .35,
//    self circle r + .3; bite 2.45). Now a move centred on the monster starts once the target is inside that reach (less V167.mg,
//    so a target that stands still is always hit; one that steps away can still dodge), and melee monsters wait at that range
//    instead of walking in to 1.65 (kqPref). Moves aimed at a spot, lines, projectiles and charges keep their numbers.
//    test/v167_combat.py starts every changed move at its new reach and checks that it lands.
// 2. "Enemies spin rapidly after a spin attack": the Sand Elemental's Sandstorm adds to the body turn every frame (~25 rad in
//    1.8 s); the recovery then eased that whole number back to 0, so the body unwound ~4 turns backwards in 0.6 s. The body turn
//    is now kept within one turn (-π..π) every frame, so the recovery only eases the last bit; the v113 rolls and whirls (Death
//    Roll, Shell Spin, Crimson Whirl) unwound two whole turns in their recovery the same way (n3Body wrapper). For
//    V167.turnT s after any attack the monster turns to face its target at V167.turn rad/s instead of snapping round.
// 3. Monster movement +30%: one knob, ESPD167.k. Ordinary monsters (chase, back off, circle, wander: the main loop in 0104) and the
//    boss footwork speeds (Sovereigns SVB[i].ai, Vorraxis, Gorthrak, Qarsul: walk / run) are multiplied by it. Attack moves
//    (charges, leaps, dashes), knock-backs, projectiles, the hero and companions are not.
// 4. "After a perfect dodge there's a delay before you can attack": the perfect dodge's slow motion (slowT, 0.85 s at 35% speed)
//    also slowed the hero's attack cooldown (atkCd), so an attack started before the dodge took ~3x longer to come back. Now a
//    perfect dodge clears the cooldown and the cooldown counts real time during the slow motion (0104).
var V167={mg:.25,turn:9,turnT:.7,n:0,raised:{}};
var ESPD167={k:1.3};
function espd167(){return ESPD167.k}
function v167Wrap(a){return Math.atan2(Math.sin(a),Math.cos(a))}
// ---------- 1. attack reach ----------
// how far away the target may be when the move starts and still be inside its hit area (a monster-centred move; 0 = not one)
function v167Reach(M){if(!M||M.proj||M.at==='tg'||!(M.r>0))return 0;
  if(M.sh==='cone')return M.r+.35;if(M.sh==='circle'&&M.at==='self')return M.r+.3;return 0}
function v167Raise(){for(const n in MV){const M=MV[n],R=v167Reach(M);if(!R||M.v167)continue;const r=+(R-V167.mg).toFixed(2);
  if(r>M.rmax){V167.raised[n]=[M.rmax,r];M.rmax0=M.rmax;M.rmax=r}M.v167=1}}
try{v167Raise()}catch(err){console.warn('v167 reach',err)}
// melee monsters wait just inside their basic attack's reach (it used to be 1.3 for every one of them)
{const f=kqPref;kqPref=function(e){const p=f.apply(this,arguments);try{if(p<2){const ms=MSET[kqKey(e)]||['bite'];let r=0;
  ms.forEach(n=>{if(KQMEL[n]&&MV[n]&&(!r||MV[n].rmax<r))r=MV[n].rmax});if(r)return Math.max(p,r-.45)}}catch(_){}return p}}
// ---------- 2. no unwinding after a spin; a smooth turn back to the target ----------
{const f=mTick;mTick=function(e,dt,now){const a=e&&e.atk;const r=f.apply(this,arguments);
  try{const m=e&&e.m;if(m&&m.pose&&m.pose.ry!=null&&Math.abs(m.pose.ry)>Math.PI)m.pose.ry=v167Wrap(m.pose.ry);
    if(a&&a.P0&&a.P0.ry!=null&&Math.abs(a.P0.ry)>Math.PI){a.P0.ry=v167Wrap(a.P0.ry);if(m&&m.pose&&e.atk===a&&a.ph==2){const k=Math.max(0,a.t/(a.R||1));m.pose.ry=a.P0.ry*k*k}}
    if(a&&e.atk!==a&&m){m._v167T=now;m._v167R=m.rotation.y}}catch(err){if(!V167.n++)console.warn('v167 spin',err)}return r}}
// v113 moves that roll or whirl (Death Roll, Shell Spin, Crimson Whirl) end their act whole turns round (Bry 4π); the recovery
// then eased those turns back to 0 (two turns backwards in the recovery). Now the recovery eases only what is left of the last turn.
{const f=n3Body;n3Body=function(e,a,M,ph,k,P){const r=f.apply(this,arguments);
  try{if(ph==2&&P){const T=HUP113[M.an]||CRP113[M.an];if(T&&T.at){const r0=T.at(2).Bry||0;
    if(Math.abs(r0)>Math.PI){const u=T.at(n3U(ph,k)).Bry||0;P.ry=v167Wrap(v167Wrap(r0)*(u/r0))}}}}catch(_){}return r}}
{const f=animC;animC=function(g,now,mv,sp){
  try{if(g&&g.isE&&g._v167T!=null){const e=g._ie;if(e&&e.boss||now-g._v167T>V167.turnT*1000){g._v167T=null}
    else if(g._v167R!=null){const dt=Math.min(.1,Math.max(0,(now-(g._v167L||now))/1000)),mx=V167.turn*(dt||1/60),da=v167Wrap(g.rotation.y-g._v167R);
      if(!(e&&e.atk))g.rotation.y=g._v167R+Math.max(-mx,Math.min(mx,da))}
    g._v167L=now;if(g._v167T!=null)g._v167R=g.rotation.y}}catch(_){}
  return f.apply(this,arguments)}}
// ---------- 3. boss footwork +30% (ordinary monsters: 0104 calls espd167()) ----------
function v167BossSpeed(){const k=ESPD167.k,L=[];try{SVB.forEach(B=>{if(B&&B.ai)L.push(B.ai)})}catch(_){}
  [typeof MB144B!='undefined'&&MB144B,typeof GB151B!='undefined'&&GB151B,typeof QS165B!='undefined'&&QS165B].forEach(B=>{if(B&&B.ai)L.push(B.ai)});
  L.forEach(ai=>{if(ai.v167)return;ai.v167=1;ai.walk=(ai.walk||2.2)*k;if(ai.run)ai.run*=k})}
try{v167BossSpeed()}catch(err){console.warn('v167 boss speed',err)}
// ---------- 4. attack right after a perfect dodge ----------
{const f=perfectCheck;perfectCheck=function(){const r=f.apply(this,arguments);if(r)atkCd=0;return r}}
