// ================= v138: ability balance — every ability valued by how it delivers damage, what else it does, and evolutions =================
// How it works (read this before changing it). See README "Ability balance (v138)".
// - Measured with test/v138_abilities/ (every ability of every class at level 50, base form at rank 1 and evolved form at rank 5,
//   on a target dummy with 4 dummies close by and 4 further out; every hit is logged). Each damaging ability is sorted by what it
//   actually does: single target, burst area (one moment), intermittent area (2–4 pulses), constant area (5+ pulses over 2.5 s+),
//   and by area size (small, medium: reaches the close ring, large: reaches the far ring).
// - Damage per target per second of cooldown, against the hero's attack, is set from one table for all five classes:
//     single 1.00 · burst .75 · intermittent .75 · constant .55   ×   small 1.00 · medium .93 · large .85
//   and what else the ability does is paid for in damage (test/v138_abilities/an2.py `utility`: stun .12–.15, root .10,
//   slow .05, debuff/mark .12, pull .06, knockback .04, silence .05, dash/leap .08, invulnerability/shield/heal .12; stuns, roots, slows, pulls, debuffs, heals, shields,
//   dashes, invulnerability; at most 40%). So a large stunning zone hits less than a large zone that only burns, a dash that
//   damages hits less than a plain strike, and of two big area spells the one without extras hits harder. Cooldown does not
//   change the rate: a long cooldown is a bigger single hit, a short one steadier damage.
// - Evolved forms follow the same table at ~2.2× the base form's rate (rank 5 ×1.48 and −15% cooldown, evolution ×1.25),
//   whatever new shape the evolution gives them; BAL138_EVO is the per-ability factor applied to evolved casts only.
// - Projectiles fired together by one cast (Multishot, Barrage, Shuriken Volley, Phoenix Barrage…) hit each enemy once at full
//   damage; more of them on the same enemy deal BAL138.dup. Seeking bolts meant to focus one enemy (Arcane Missiles) are exempt.
var BAL138={vol:null,dup:.3,EXEMPT:{'Arcane Missiles':1}};
{const f=cast;cast=function(i){let n=null;try{const s=heroSkills()[+i];n=s&&s.n}catch(_){}
  const o=BAL138.vol;BAL138.vol=n&&!BAL138.EXEMPT[n]?Object.assign(new Set(),{k:BAL138.dup}):null;
  try{return f.apply(this,arguments)}finally{BAL138.vol=o}}}
{const f=launch;launch=function(pos,d,spd,s){if(BAL138.vol&&s&&typeof s=='object'&&!s.basic&&!s.cc&&!s.vol){const a=[].slice.call(arguments);a[3]=Object.assign({},s,{vol:BAL138.vol});return f.apply(this,a)}return f.apply(this,arguments)}}
var BAL138_EVO={};
{const f=kqrP;kqrP=function(s){const k=f.apply(this,arguments);return s&&s.ev137&&BAL138_EVO[s.n]!=null?k*BAL138_EVO[s.n]:k}}

// 2. Base forms: KQR_TUNE (the v90 per-ability damage factor; it scales everything the cast does). Old values in the comment.
Object.assign(KQR_TUNE,{
  // warrior (was: Bull Rush 1.5, Chain Hook 1.47, Cleave 1, Earthshatter 0.94, Execute 0.81, Intimidating Shout 2.4, Leap Slam 1, Seismic Rupture 1, Shockwave 1, Skull Splitter 0.49, Titan's Fall 1, Whirlwind 0.4)
  "Bull Rush":1.051,"Chain Hook":1.909,"Cleave":0.621,"Earthshatter":1.014,"Execute":0.638,"Intimidating Shout":3.877,"Leap Slam":0.705,"Seismic Rupture":1.062,"Shockwave":0.941,"Skull Splitter":0.454,"Titan's Fall":0.996,"Whirlwind":0.383,
  // paladin (was: Avenger's Shield 1, Beacon of Light 1.16, Blessed Hammers 1, Consecration 1, Crusader's Charge 1.6, Hammer of Light 0.9, Heaven's Wrath 1.11, Holy Smite 1, Judgment 1.39, Penance 1, Sanctuary 1.38, Shield Bash 1.11)
  "Avenger's Shield":1.005,"Beacon of Light":1.371,"Blessed Hammers":1.042,"Consecration":1.035,"Crusader's Charge":2.484,"Hammer of Light":1.328,"Heaven's Wrath":2.25,"Holy Smite":1.331,"Judgment":1.738,"Penance":2.209,"Sanctuary":2.115,"Shield Bash":1.305,
  // assassin (was: Caltrops 0.79, Death Mark 0.74, Eclipse 0.36, Envenom 1, Eviscerate 0.36, Fan of Knives 1, Garrote 0.59, Phantom Strike 0.53, Shadow Rush 0.38, Shuriken Volley 0.27, Smoke Bomb 0.93, Thousand Cuts 0.8, Venom Flask 0.55)
  "Caltrops":0.628,"Death Mark":1.748,"Eclipse":0.34,"Envenom":1.717,"Eviscerate":0.258,"Fan of Knives":1.042,"Garrote":0.952,"Phantom Strike":0.596,"Shadow Rush":0.166,"Shuriken Volley":0.443,"Smoke Bomb":0.657,"Thousand Cuts":1.305,"Venom Flask":0.271,
  // ranger (was: Aimed Shot 0.53, Barrage 1.2, Disengage 1.21, Entangling Roots 1, Explosive Arrow 1.05, Explosive Trap 1, Frost Trap 1, Hawk Dive 0.9, Multishot 0.7, Piercing Arrow 0.75, Rain of Arrows 0.75, Rapid Fire 0.27, Stampede 0.6)
  "Aimed Shot":0.575,"Barrage":1.246,"Disengage":1.391,"Entangling Roots":2.217,"Explosive Arrow":0.421,"Explosive Trap":0.418,"Frost Trap":1.948,"Hawk Dive":0.878,"Multishot":0.499,"Piercing Arrow":0.528,"Rain of Arrows":0.232,"Rapid Fire":0.257,"Stampede":1.189,
  // mage (was: Arcane Missiles 0.45, Blizzard 0.4, Chain Lightning 0.5, Comet Storm 1.3, Disintegrate 0.46, Dragon's Breath 0.55, Fireball 0.55, Frost Nova 1.25, Frozen Orb 1.9, Meteor 0.6, Singularity 0.43, Wall of Fire 0.55)
  "Arcane Missiles":0.404,"Blizzard":0.316,"Chain Lightning":0.353,"Comet Storm":2.072,"Disintegrate":0.396,"Dragon's Breath":0.758,"Fireball":0.314,"Frost Nova":1.051,"Frozen Orb":3.312,"Meteor":0.564,"Singularity":0.347,"Wall of Fire":0.309
});
// 3. Evolved forms: BAL138_EVO, on top of the base factor and the evolution bonus (1 = unchanged). Under 1: the evolution added
//    area, duration or extra hits at full damage (Arrowstorm, Starpiercer, Earthsplitter, Final Verdict…); over 1: it was weak.
Object.assign(BAL138_EVO,{
  // warrior
  "Bull Rush":0.993,"Chain Hook":0.581,"Cleave":0.577,"Earthshatter":0.904,"Execute":0.734,"Intimidating Shout":0.801,"Leap Slam":0.925,"Seismic Rupture":0.649,"Shockwave":0.337,"Skull Splitter":0.473,"Titan's Fall":1.006,"Whirlwind":0.416,
  // paladin
  "Avenger's Shield":0.485,"Beacon of Light":0.768,"Blessed Hammers":0.68,"Consecration":0.995,"Crusader's Charge":0.315,"Hammer of Light":0.059,"Heaven's Wrath":0.739,"Holy Smite":0.897,"Judgment":0.318,"Penance":0.484,"Sanctuary":0.71,"Shield Bash":0.421,
  // assassin
  "Caltrops":0.702,"Death Mark":0.858,"Eclipse":0.603,"Envenom":0.778,"Eviscerate":0.568,"Fan of Knives":0.438,"Garrote":0.753,"Phantom Strike":0.445,"Shadow Rush":0.989,"Shuriken Volley":0.629,"Smoke Bomb":1.266,"Thousand Cuts":0.477,"Venom Flask":0.712,
  // ranger
  "Aimed Shot":0.931,"Barrage":0.823,"Disengage":0.635,"Entangling Roots":0.994,"Explosive Arrow":1.14,"Explosive Trap":1.085,"Frost Trap":1.005,"Hawk Dive":0.395,"Multishot":1.008,"Piercing Arrow":0.34,"Rain of Arrows":0.428,"Rapid Fire":0.628,"Stampede":0.961,
  // mage
  "Arcane Missiles":0.643,"Blizzard":0.958,"Chain Lightning":0.83,"Comet Storm":1.088,"Disintegrate":0.564,"Dragon's Breath":0.445,"Fireball":0.692,"Frost Nova":1.021,"Frozen Orb":0.294,"Meteor":0.86,"Singularity":0.829,"Wall of Fire":0.708
});
// Not tuned by the table (their job is not damage, or the dummy cannot measure them): pure buffs, shields, heals and movement
// (War Cry, Iron Skin, Unbreakable, War Banner, Bloodrage, Divine Barrier, Lay on Hands, Aegis, Seal of Light, Divine Intervention,
// Vanish, Shadow Dance, Poison Blades, Snare Trap, Hunter’s Focus, Blink, Rift Gate, Mana Shield, Time Warp) and summons (Shadow
// Clone, Call of the Wild, Wild Hunt: the pets wander off the dummy).
