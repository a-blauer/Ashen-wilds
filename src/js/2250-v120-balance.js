// ================= v120: balance pass — companion spells, hero abilities, weapons =================
// Measured with a level 10–50 harness (every class × every weapon, 30 s fights against one target and a group of four;
// every companion spell on a training dummy). See README "Balance (v120)".
//
// 1. Companion element reactions: a companion can no longer react with itself.
//    Before: a companion's own spell status (poison, burn) set an element on the target, then the companion's family element
//    (Dragon = fire, Swarm = poison, …) landed on the same hit and set off a reaction — on EVERY tick of a lingering spell.
//    Venomcoil's Toxic Cloud (fire family + poison cloud) set off COMBUST! 32 times per cast (~7× a normal spell).
//    Now an element set by a companion's hit only reacts with elements from other sources (your hits, the other companion).
var CH120=null;
{const f=compHit;compHit=function(c,e){const o=CH120;CH120=e?{c,e}:null;try{return f.apply(this,arguments)}finally{CH120=o}}}
{const f=applyEl;applyEl=function(e,el,raw,src){
  if(!CH120||CH120.e!==e||!e||e.dead)return f.apply(this,arguments);
  const t=nowP(),cur=e.el&&e.el.t>t?e.el:null;
  if(cur&&cur.k!==el&&cur.by===CH120.c){cur.t=t+5000;return 1}   // own element: refresh, no reaction
  const r=f.apply(this,arguments);if(e.el&&e.el.k===el)e.el.by=CH120.c;return r}}

// 2. Companion spells (CSP.m = damage per hit/tick). Lingering area spells hit 6–8 times and were 2–2.4× a normal spell on one
//    target; they keep their crowd strength but come down. The weakest spells come up (crowd control spells stay a little lower).
var BAL120_CSP={'Toxic Cloud':.4,'Choking Spores':.4,'Plague':.5,'Brood Swarm':.55,'Skyfall':.8,'Tempest':.7,
  'Web Snare':1.5,'Sonic Screech':1.6,'Cyclone':2.6,'Quake Stomp':2.1,'Gale Dive':1.9};
for(const k in BAL120_CSP)if(CSP[k])CSP[k].m=BAL120_CSP[k];

// 3. Hero abilities: KQR_TUNE is the per-ability damage factor (v90). Outliers measured at level 50, rank 1, in damage per
//    second of cooldown against the rest of the same class.
Object.assign(KQR_TUNE,{
  'Holy Smite':.85,          // was 1.6: ~4× every other Paladin ability, and a big group hit on a 6 s cooldown
  'Chain Lightning':.5,      // was .77: strongest ability in the game (single + 12 basic hits spread over a group)
  'Fireball':.55,            // was .75: ~3× the Mage average because of its 4 s cooldown
  'Shuriken Volley':.27,'Shadow Rush':.38,'Eviscerate':.36,   // were .34/.44/.42: ~2× the Assassin average
  'Frozen Orb':1.9,          // was 1.04: under one basic hit per cast
  'Comet Storm':1.3,         // was .81: random comets over a wide circle rarely landed on one target
  'Intimidating Shout':2.4,  // was 1.6: the debuff is the point, but the hit was negligible
  'Wild Hunt':.16            // was .1
});
