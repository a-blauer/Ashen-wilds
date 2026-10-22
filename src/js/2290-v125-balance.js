// ================= v125: balance pass — companion spells, hero abilities, weapons =================
// Measured with a level 10–50 harness (every class × every weapon, 30 s fights against one target and a group of four;
// every companion spell on a training dummy). See README "Balance (v125)".
//
// 1. Companion element reactions: a companion can no longer react with itself.
//    Before: a companion's own spell status (poison, burn) set an element on the target, then the companion's family element
//    (Dragon = fire, Swarm = poison, …) landed on the same hit and set off a reaction — on EVERY tick of a lingering spell.
//    Venomcoil's Toxic Cloud (fire family + poison cloud) set off COMBUST! 32 times per cast (~7× a normal spell).
//    Now an element set by a companion's hit only reacts with elements from other sources (your hits, the other companion).
var CH125=null;
{const f=compHit;compHit=function(c,e){const o=CH125;CH125=e?{c,e}:null;try{return f.apply(this,arguments)}finally{CH125=o}}}
{const f=applyEl;applyEl=function(e,el,raw,src){
  if(!CH125||CH125.e!==e||!e||e.dead)return f.apply(this,arguments);
  const t=nowP(),cur=e.el&&e.el.t>t?e.el:null;
  if(cur&&cur.k!==el&&cur.by===CH125.c){cur.t=t+5000;return 1}   // own element: refresh, no reaction
  const r=f.apply(this,arguments);if(e.el&&e.el.k===el)e.el.by=CH125.c;return r}}

// 2. Companion spells (CSP.m = damage per hit/tick). Lingering area spells hit 6–8 times and were 2–2.4× a normal spell on one
//    target; they keep their crowd strength but come down. The weakest spells come up (crowd control spells stay a little lower).
//    Was → now: Toxic Cloud .6→.4, Choking Spores .6→.35, Plague .8→.45, Brood Swarm 1→.55, Skyfall 1.4→.7, Tempest .9→.7;
//    Web Snare .8→1.5, Sonic Screech .9→1.6, Cyclone 1.8→2.6, Quake Stomp 1.6→2.1, Gale Dive 1.5→1.9, Alpha Roar 2.5→3, Thunder Talon 1.6→2.
var BAL125_CSP={'Toxic Cloud':.4,'Choking Spores':.35,'Plague':.45,'Brood Swarm':.55,'Skyfall':.7,'Tempest':.7,
  'Web Snare':1.5,'Sonic Screech':1.6,'Cyclone':2.6,'Quake Stomp':2.1,'Gale Dive':1.9,'Alpha Roar':3,'Thunder Talon':2};
for(const k in BAL125_CSP)if(CSP[k])CSP[k].m=BAL125_CSP[k];

// 3. Hero abilities: KQR_TUNE is the per-ability damage factor (v90). Outliers measured at level 50, rank 1, in damage per
//    second of cooldown against the rest of the same class.
Object.assign(KQR_TUNE,{
  'Holy Smite':1.0,          // was 1.6: ~4× every other Paladin ability, and a big group hit on a 6 s cooldown
  'Chain Lightning':.5,      // was .77: strongest ability in the game (single + 12 basic hits spread over a group)
  'Fireball':.55,            // was .75: ~3× the Mage average because of its 4 s cooldown
  'Shuriken Volley':.27,'Shadow Rush':.38,'Eviscerate':.36,   // were .34/.44/.42: ~2× the Assassin average
  'Frozen Orb':1.9,          // was 1.04: under one basic hit per cast
  'Comet Storm':1.3,         // was .81: random comets over a wide circle rarely landed on one target
  'Intimidating Shout':2.4,  // was 1.6: the debuff is the point, but the hit was negligible
  'Wild Hunt':.16,           // was .1
  // ranged classes rely on their area abilities in a crowd (a melee weapon cleaves the crowd around you; a bow does not)
  'Explosive Arrow':1.05,'Barrage':1.0,'Rain of Arrows':.5,'Multishot':.7,'Explosive Trap':.9,   // were .72/.57/.24/.56/.6
  'Meteor':.6,'Wall of Fire':.55,'Blizzard':.4,'Frost Nova':1.25                                // were .45/.45/.3/1
});
// class knobs (v90 KQR_CLS, added to the hero's stats). Mage: −.36+.008·level → −.04+.008·level, which gives back what the
// Chain Lightning / Fireball cuts took, spread over every Mage ability. Ranger: basic +12% → +17%, skills +0 → +8%.
KQR_CLS.mage.skillP=L=>-.04+.008*L;
KQR_CLS.ranger.basicP=.17;KQR_CLS.ranger.skillP=.08;
// Assassin: +12% max health (the most fragile class, and a melee one). Max health is computed before the class knobs, so it is
// applied here on the finished stats.
var BAL125_HP={assassin:1.12};
{const f=HS;HS=function(){const s=f.apply(this,arguments);if(!s._b125){s._b125=1;const k=BAL125_HP[hero&&hero.cls];if(k)s.hp*=k}return s}}

// 4. Throwing knives: one throw (a fan of 3, or 5 every 4th throw) hits each enemy with one knife at full damage; the other knives of
//    the same throw that hit that enemy deal WB125.knDup of their damage. Before, every knife of the fan landed on a lone enemy at
//    close range (after Eviscerate / Shadow Rush dash you in), so the fan was a point-blank shotgun: ~+50% over daggers on one target.
{const f=heroHit;heroHit=function(e,raw,mt,o){const v=o&&o.s&&o.s.vol;if(v&&e&&!e.dead){if(v.has(e))raw*=WB125.knDup;else v.add(e)}return f.apply(this,[e,raw,mt,o].concat([].slice.call(arguments,4)))}}

// 5. Weapons. Each weapon keeps an identity; at every level 10–50 it lands within ~8% of its target against the average of all
//    16 class + weapon pairs (30 s fights with the class's best abilities, one target / a pack of four):
//      one target  (≈ +8% alone, −8% in a pack): Twin Axes, Daggers, Claws, Bow, Wand
//      a crowd     (≈ −8% alone, +8% in a pack): Greataxe, Halberd, Warhammer, Flail, Throwing Knives; Orb ≈ −12% / +12%
//      balanced    (≈ 0 / 0): Greatsword, Mace, Crossbow, Sling, Staff
//    WTYPE.k = weapon attack (everything you do scales with it); MW = melee combo (m: hit multipliers, half: half-width of the swing
//    arc in radians, rg: reach); WB125 = numbers that were written into the attack code (0580).
Object.assign(WTYPE.ga,{k:1.16});MW.ga.m=[1,1.1,1.4];                         // was k 1.32, finisher 1.8: +10% / +35%
MW.halberd.half=.55;                                                            // thrust arc was .42: about even alone and in a pack
Object.assign(WTYPE.axes,{k:.76});Object.assign(MW.axes,{half:.78,rg:.85});    // was .86, arc 1.2, reach .95: +19% alone and as good in a pack
Object.assign(WTYPE.hammer,{k:.84});Object.assign(MW.hammer,{m:[1,1.05,1.6],half:.8});WB125.shock=.05;WB125.slam=.03;
                                                                                 // was k 1.12, [1.1,1.2,1.9], arc 1.1, shockwave 35%, slam 60%: +52% / +83%
Object.assign(WTYPE.mace,{k:1.2});Object.assign(MW.mace,{half:.8});            // was 1.0, arc 1.15: −6% / −24%
Object.assign(WTYPE.flail,{k:1.18});Object.assign(MW.flail,{m:[.95,1,1.5],half:1.9,rg:1.2});   // was 1.02, [.9,.95,1.45], arc 1.48, reach 1.12: −19% / −30%
Object.assign(WTYPE.dagger,{k:.9});Object.assign(WTYPE.claws,{k:.84});         // were .78 / .8
Object.assign(WTYPE.bow,{k:1.08});                                              // was 1.0
Object.assign(WTYPE.wand,{k:.8});WB125.wandSplash=.5;                          // was .58, big-bolt burst 1.5
WB125.orbJump=.55;                                                              // chain jumps after the first: 40% → 55%
WB125.slingRic=3;                                                               // ricochets: 2 → 3
WB125.knife=.68;WB125.knSpread=.45;WB125.knDup=.3;WB125.knPierce=1;            // was 50% per knife, fan .17, no pierce (see 4.)
// Greatsword and Daggers used the plain class combo (0130 swing_base); they now have combo tables of their own (same hits, timing and
// animation) so their swing width can be tuned: the greatsword's arc was 1.15 (it hit a pack as well as the cleaving greataxe) and the
// daggers' 1.15 (a single-target weapon that was better in a pack than alone).
MW.gs={N:3,m:[1,1.1,1.7],ms:[300,300,450],a:[0,1,2],rg:1.08,half:.7,col:0xffe6b0};
MW.dagger={N:4,m:[.8,.8,.95,1.55],ms:[190,190,210,330],a:[0,1,0,2],rg:1,half:.9,dual:1,col:0xffe6b0};
['gs','dagger'].forEach(k=>{WBEH[k]=(C,s,raw,d,spdK,base)=>wMelee(MW[k],C,s,raw,d,spdK,base)});
