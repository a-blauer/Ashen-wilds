// ================= v88: abilities — ability points, one starting ability, 50 new class abilities, ground targeting =================
// How it works (read this before changing it):
// - Every class has 17 abilities: the 4 original skills (SKB, a_data.js), the 3 v71 skills (SKX, zz7_v71.js) and 10 new ones (KQN below).
//   A new hero knows only the class default (the first original skill). The rest cost ABILITY POINTS (AP), which are separate from talent points.
// - AP: 1 per level gained (49 by level 50) + hero.tal.__apB (bonus granted when an old save is migrated). AP are not stored as a counter:
//   apFree() = earned − the cost of every unlocked ability, so cheats/level changes and old saves always add up.
//   Cost = 1 + floor(level requirement / 6) → 1…9 AP; the whole book costs 66, so a level-50 hero owns about 12 of the 16 and has to choose.
//   Abilities → gold reset ("Reset abilities") refunds everything (keeps the default).
// - Saved inside hero.tal (saved by gameSnapshot): 'ab:<name>' = unlocked, '__ld' = loadout (names joined by |, 4 slots), '__ab' = migrated, '__apB' = bonus AP.
//   Old saves (no __ab): every original skill the hero's level had already unlocked and every bought v71 skill ('sk:<name>', which cost talent
//   points) is kept for free (its AP cost is added to __apB), 'sk:' keys are removed so talSpent no longer counts them (talent points refunded).
// - Casting: cast(i) → [this wrapper: ground targeting, class-resource spenders] → w_models/t_combat cast (Rage/Faith… empower) → cast_base.
//   New abilities have k:'x' and a handler KQH[x]; the cast_base wrapper below runs them (mana, cooldown, echo, pose through castAnim, sound).
//   Old kinds still go through the old cast_base (and the v85 anim wrapper). castAnim reads ATK_SK.pose for new abilities (see kqsPoseT).
// - Ground targeting (sk.gt): pressing the key shows a reticle (circle / cone / line / wall + max range ring) that follows the mouse on the terrain;
//   left-click / tap / the same key casts, right-click / Esc / ✕ cancels. On touch: drag on the screen to place, lift to cast. KQS.gp holds the
//   point during the cast; aimPoint()/aimDir() are wrapped to return it, so old ground skills (Leap Slam, Meteor, Rain of Arrows…) use it too.
// - Effects that last (banners, traps, zones, summons, orbs) are KQS.objs entries ticked from heroTick; channels are KQS.ch.
// - Window: Abilities is a tab of K (Talents | Abilities; K reopens the last tab) and a system-menu button. It is the shared #xw window in mode 'abil' (XR.abil).
//   (L is the Bestiary, every other letter is taken, so it lives under K.)

var KQS={tg:null,gp:null,fire:0,cr0:0,ch:null,objs:[],cdn:{},hist:[],histT:0,stealth:0,unbrk:0,mx:null,my:null,mIn:false,touch:null,eat:0,ret:null,sel:null,slot:0,ck:'',ca:null,rc:null};
var KQS_SLOTS=4;

// ---------------- the 50 new abilities ----------------
// k:'x' + x:<handler>; gt:1 ground targeted (sh circle|line|wall|cone, r radius / w width, L length, rng max range); spend:1 uses up the class resource;
// pose: castAnim pose; ty: type label; req: needs this ability first. m = damage multiplier on attack power (like the old skills).
var KQN={
 warrior:[
  {n:'Bull Rush',i:'🐂',lv:2,x:'w_rush',m:1.6,cd:9,mp:10,col:0xd08a4a,pose:'dash',ty:'Mobility · charge',d:'Charge forward, bowling through every enemy in your path: damage and a short stun. +10 Rage.'},
  {n:'Intimidating Shout',i:'😤',lv:8,x:'w_shout',m:.6,r:6,cd:16,mp:12,col:0xff5a3a,pose:'flex',ty:'Shout · AoE',d:'Bellow a war cry: enemies within 6 are interrupted, slowed and weakened (they deal 20% less and take 20% more) for 6s. +25 Rage.'},
  {n:'Skull Splitter',i:'💀',lv:14,x:'w_skull',m:3.0,cd:8,mp:14,spend:1,col:0xff7a4a,pose:'slam',ty:'Single target · Rage spender',d:'A crushing overhead blow that makes the enemy bleed. Spends all your Rage: up to double damage at 100 Rage.'},
  {n:'Seismic Rupture',i:'🌋',lv:16,x:'w_rupture',gt:1,sh:'line',w:2.2,L:10,rng:10,m:2.4,stun:.8,cd:12,mp:18,col:0xd0905a,pose:'slam',ty:'Line · AoE',d:'Split the earth: a fissure erupts from your feet to the target point, damaging and stunning everything along it.'},
  {n:'War Banner',i:'🚩',lv:26,x:'w_banner',gt:1,sh:'circle',r:5,rng:9,dur:12,cd:30,mp:20,col:0xe0402a,pose:'raise',ty:'Banner · zone',d:'Plant a war banner for 12s. Inside its circle you gain +20% physical attack, 15% damage reduction and 2% health regeneration per second; enemies there are slowed.'},
  {n:'Bloodrage',i:'🩸',lv:30,x:'w_blood',cd:28,mp:0,dur:10,col:0xc0101a,pose:'flex',ty:'Buff · Rage',d:'Spill 15% of your health to fill your Rage to the brim and gain +25% attack speed, +10% physical attack and 10% lifesteal for 10s.'},
  {n:'Chain Hook',i:'🪝',lv:34,x:'w_hook',gt:1,sh:'circle',r:2.6,rng:10,m:1.4,stun:.8,cd:14,mp:16,col:0xa8a8b8,pose:'throw',req:'Bull Rush',ty:'Pull · AoE',d:'Hurl chains at the target area: every enemy caught is dragged to your feet, damaged and stunned.'},
  {n:'Execute',i:'🪦',lv:38,x:'w_exec',m:2.4,cd:12,mp:15,spend:1,col:0xff3020,pose:'great1',ty:'Single target · finisher',d:'Strike one enemy for triple damage if it is below 30% health. Spends Rage for up to +80% damage. A kill refunds most of the cooldown.'},
  {n:'Unbreakable',i:'🗿',lv:44,x:'w_unbrk',dur:8,cd:60,mp:20,col:0xb0a898,pose:'flex',ty:'Defensive buff',d:'For 8s you cannot fall below 1 health and take 30% less damage. When it ends, heal 15% of your max health.'},
  {n:'Titan\'s Fall',i:'🏔️',lv:48,x:'w_titan',gt:1,sh:'circle',r:4.5,rng:12,m:4.2,stun:1.5,cd:26,mp:26,col:0xffb060,pose:'leap',req:'Seismic Rupture',ty:'Leap · AoE',d:'Leap high into the sky and crash down on the target area: huge damage, a long stun, and the shattered ground slows enemies for 4s.'}],
 paladin:[
  {n:'Shield Bash',i:'💫',lv:2,x:'p_bash',m:1.7,stun:1.4,cd:7,mp:8,col:0xffe8a0,pose:'thrust',ty:'Single target · stun',d:'Slam your shield into the nearest enemy in front of you: damage and a 1.4s stun. +15 Faith.'},
  {n:'Blessed Hammers',i:'⚒️',lv:8,x:'p_hammers',m:.55,mt:'m',dur:6,cd:14,mp:16,col:0xffd860,pose:'raise',ty:'Orbit · AoE',d:'Three holy hammers circle around you for 6s, striking every enemy they pass.'},
  {n:'Beacon of Light',i:'🗼',lv:14,x:'p_beacon',gt:1,sh:'circle',r:4,rng:9,m:.5,mt:'m',dur:10,cd:22,mp:20,col:0xfff0a0,pose:'raise',ty:'Beacon · zone',d:'Raise a beacon for 10s. Every second it heals you 2.5% of your max health while you stand near it and burns enemies around it.'},
  {n:'Crusader\'s Charge',i:'🏇',lv:16,x:'p_charge',m:1.8,mt:'m',cd:12,mp:14,col:0xffe080,pose:'dash',ty:'Mobility · charge',d:'Charge forward in a blaze of holy light, damaging and weakening every enemy you pass for 4s.'},
  {n:'Sanctuary',i:'⛪',lv:26,x:'p_sanct',gt:1,sh:'circle',r:4.5,rng:10,m:.35,mt:'m',dur:6,cd:30,mp:24,col:0xfff6c8,pose:'raise',ty:'Ward · zone',d:'Raise a dome of holy light for 6s: inside it you take 35% less damage, and enemies are slowed and seared.'},
  {n:'Avenger\'s Shield',i:'🥏',lv:30,x:'p_avenger',m:2.0,stun:.5,cd:10,mp:16,col:0xffe8b0,pose:'throw',ty:'Bouncing · single target',d:'Hurl your shield: it bounces between up to 5 enemies, damaging and dazing each, then flies back to you.'},
  {n:'Penance',i:'📿',lv:34,x:'p_penance',m:.55,r:3.5,mt:'m',dur:2.5,cd:18,mp:22,col:0xfff0b0,pose:'raise',req:'Lay on Hands',ty:'Channel · heal',d:'Kneel in prayer for 2.5s: every half second heal 3% of your max health and sear enemies around you. You move slowly while praying.'},
  {n:'Seal of Light',i:'🌟',lv:38,x:'p_seal',dur:12,cd:30,mp:18,col:0xffe060,pose:'flex',ty:'Buff',d:'For 12s your basic attacks deal 35% more damage, your magic attack is 15% higher and you heal for 6% of the damage you deal.'},
  {n:'Divine Intervention',i:'😇',lv:44,x:'p_interv',m:2.2,r:4,mt:'m',dur:3,cd:75,mp:30,col:0xfffbe0,pose:'raise',ty:'Invulnerable · heal',d:'Become untouchable for 3s while healing 30% of your max health, then release a holy nova around you.'},
  {n:'Heaven\'s Wrath',i:'🌩️',lv:48,x:'p_wrath',gt:1,sh:'circle',r:5,rng:12,m:1.6,mt:'m',stun:1,cd:28,mp:32,col:0xfff2a0,pose:'raise',req:'Hammer of Light',ty:'Barrage · AoE',d:'Pillars of light strike six spots in the target area, then a final judgement lands at its center and stuns.'}],
 assassin:[
  {n:'Eviscerate',i:'✂️',lv:2,x:'a_evisc',m:1.3,cd:6,mp:10,spend:1,col:0xe04a6a,pose:'thrust',ty:'Finisher · single target',d:'A finishing strike that spends all Combo points: +45% damage per point (5 points: ×3.25, always critical).'},
  {n:'Venom Flask',i:'⚗️',lv:8,x:'a_flask',gt:1,sh:'circle',r:2.8,rng:9,m:.35,dur:6,cd:13,mp:14,col:0x7ae04a,pose:'throw',ty:'Poison · zone',d:'Lob a flask that bursts into a poison cloud for 6s: enemies inside are poisoned and slowed.'},
  {n:'Vanish',i:'🌫️',lv:14,x:'a_vanish',dur:4,cd:20,mp:14,col:0x6a5a8a,pose:'flex',ty:'Stealth',d:'Melt into the shadows for 4s: enemies lose track of you and you move 40% faster. Your next hit is an ambush: critical and +50% damage.'},
  {n:'Shadow Clone',i:'👥',lv:16,x:'a_clone',m:.6,dur:8,cd:24,mp:18,col:0x7a4ae0,pose:'cast',ty:'Summon',d:'Split off a shadow double that hunts nearby enemies with its own daggers for 8s.'},
  {n:'Phantom Strike',i:'🌘',lv:26,x:'a_phantom',gt:1,sh:'circle',r:2.5,rng:9,land:1,m:2.0,cd:11,mp:14,col:0x9a6ae0,pose:'dash',ty:'Teleport · AoE',d:'Vanish and reappear at the target point, slashing every enemy around you. Grants 2 Combo points.'},
  {n:'Caltrops',i:'📌',lv:30,x:'a_caltrops',gt:1,sh:'circle',r:3,rng:8,m:.2,dur:8,cd:16,mp:12,col:0xb0b0c0,pose:'throw',ty:'Trap · zone',d:'Scatter caltrops over the target area for 8s: enemies walking through are slowed and bleed.'},
  {n:'Garrote',i:'🧵',lv:34,x:'a_garrote',m:1.2,stun:1.2,cd:12,mp:12,spend:1,col:0xd03a3a,pose:'thrust',req:'Eviscerate',ty:'Finisher · bleed',d:'Choke the nearest enemy: it is silenced (stunned) and bleeds heavily for 8s. Each Combo point spent makes the bleed stronger.'},
  {n:'Thousand Cuts',i:'🌸',lv:38,x:'a_cuts',m:1.1,cd:18,mp:20,col:0xff8ac8,pose:'dash',req:'Phantom Strike',ty:'Multi-blink',d:'Flicker between up to 6 nearby enemies, landing a critical strike on each. You cannot be hit while you flicker.'},
  {n:'Envenom',i:'🐍',lv:44,x:'a_envenom',m:.8,r:8,cd:15,mp:16,spend:1,col:0x8ad84a,pose:'nova',ty:'Finisher · AoE',d:'Detonate the poison and bleeding on every enemy within 8: they take the rest of it at once, plus 50%. Combo points add +20% each.'},
  {n:'Eclipse',i:'🌒',lv:48,x:'a_eclipse',gt:1,sh:'circle',r:5,rng:10,m:.5,dur:5,cd:30,mp:26,col:0x4a2a7a,pose:'raise',ty:'Darkness · zone',d:'Blot out the light over the target area for 5s: enemies inside are blinded (weakened and slowed) and wounded; inside it you gain +25% critical chance and +30% critical damage.'}],
 ranger:[
  {n:'Disengage',i:'🦘',lv:2,x:'r_diseng',m:1.2,cd:8,mp:8,col:0xc8e0a0,pose:'leap',ty:'Mobility',d:'Leap 6 tiles backwards, slowing the enemies you leave behind and firing an arrow at them.'},
  {n:'Call of the Wild',i:'🐺',lv:8,x:'r_wolf',m:.7,dur:15,cd:25,mp:18,col:0x9ad0ff,pose:'point',ty:'Summon',d:'Call a spirit wolf that hunts at your side for 15s.'},
  {n:'Frost Trap',i:'🧊',lv:14,x:'r_frost',gt:1,sh:'circle',r:3,rng:10,m:1.2,stun:2,cd:16,mp:14,col:0x9fe3ff,pose:'throw',ty:'Trap · freeze',d:'Throw a frost trap. The first enemy to step on it freezes everything within 3 tiles for 2s.'},
  {n:'Hawk Dive',i:'🦅',lv:16,x:'r_hawk',m:2.2,cd:9,mp:12,col:0xe8c890,pose:'point',ty:'Beast · single target',d:'Send a spectral hawk diving at your target (up to 14 tiles): heavy damage, and the target takes 20% more damage for 6s.'},
  {n:'Explosive Trap',i:'🧨',lv:26,x:'r_mine',gt:1,sh:'circle',r:3.2,rng:10,m:2.8,cd:10,mp:14,col:0xff8a3a,pose:'throw',ty:'Trap · AoE',d:'Lob a trap that explodes in flames when an enemy steps on it (up to 3 traps, 20s each).'},
  {n:'Rapid Fire',i:'⏩',lv:30,x:'r_rapid',m:.75,dur:2,cd:14,mp:18,col:0xf0e0b0,pose:'bow',ty:'Channel · volley',d:'Loose 10 arrows in 2 seconds where you aim. You move slowly while firing.'},
  {n:'Entangling Roots',i:'🌱',lv:34,x:'r_roots',gt:1,sh:'circle',r:3.8,rng:10,m:1.0,cd:18,mp:16,col:0x6ac04a,pose:'raise',ty:'Root · AoE',d:'Roots burst from the ground in the target area: enemies are rooted for 3s, wounded and poisoned.'},
  {n:'Stampede',i:'🦬',lv:38,x:'r_stamp',gt:1,sh:'line',w:3.2,L:12,rng:12,m:2.6,cd:22,mp:22,col:0xc8b088,pose:'point',req:'Call of the Wild',ty:'Line · knockback',d:'A herd of spirit beasts charges from your side to the target point, trampling and flinging aside everything in the way.'},
  {n:'Aimed Shot',i:'🔭',lv:44,x:'r_aimed',m:4.5,cd:16,mp:20,col:0xfff6d0,pose:'bow',ty:'Cast · piercing line',d:'Draw for 0.9s, then loose a shot that pierces everything in a 20-tile line.'},
  {n:'Wild Hunt',i:'🐾',lv:48,x:'r_hunt',m:.6,dur:12,cd:40,mp:28,col:0xa0e0ff,pose:'raise',req:'Hawk Dive',ty:'Summon · buff',d:'Lead the wild hunt for 12s: three spirit wolves fight for you, and you and your companions gain +20% move speed and +20% companion damage.'}],
 mage:[
  {n:'Blink',i:'💠',lv:2,x:'m_blink',gt:1,sh:'circle',r:1,rng:8,land:1,m:.8,cd:8,mp:10,col:0xa08aff,pose:'cast',ty:'Teleport',d:'Teleport to the target point. The space you leave bursts with arcane sparks.'},
  {n:'Dragon\'s Breath',i:'🐉',lv:8,x:'m_breath',m:1.9,r:5,burn:1,cd:9,mp:14,col:0xff6a1a,pose:'cast',ty:'Cone · fire',d:'Exhale a cone of dragonfire that burns everything in front of you.'},
  {n:'Frozen Orb',i:'🔵',lv:14,x:'m_orb',m:1.2,cd:12,mp:18,col:0x9fe3ff,pose:'cast',ty:'Projectile · AoE',d:'Release a slow orb of ice that sprays shards at enemies it passes (slowing them) and bursts at the end of its path.'},
  {n:'Rift Gate',i:'🌀',lv:16,x:'m_rift',gt:1,sh:'circle',r:1,rng:14,land:1,dur:8,cd:22,mp:16,col:0xc06aff,pose:'cast',ty:'Portal · mobility',d:'Tear open two linked portals, at your feet and at the target point, and step through. For 8s, walking into either portal takes you to the other.'},
  {n:'Time Warp',i:'⏳',lv:26,x:'m_warp',gt:1,sh:'circle',r:4.5,rng:10,dur:6,cd:26,mp:22,col:0x8ad8ff,pose:'raise',ty:'Time · zone',d:'Bend time in the target area for 6s: enemies inside move and attack far slower, and your cooldowns recover 50% faster while you stand in it.'},
  {n:'Disintegrate',i:'⚛️',lv:30,x:'m_disint',m:.5,dur:2.4,cd:14,mp:24,col:0xc890ff,pose:'cast',ty:'Channel · beam',d:'Channel an arcane beam for 2.4s that tears through everything in a 10-tile line where you aim.'},
  {n:'Wall of Fire',i:'🧱',lv:34,x:'m_wall',gt:1,sh:'wall',w:1.4,L:7,rng:10,m:.45,dur:6,cd:20,mp:22,col:0xff7a2a,pose:'raise',ty:'Wall · fire',d:'Raise a 7-tile wall of fire across the target point for 6s. Enemies touching it burn.'},
  {n:'Chronoshift',i:'⌛',lv:38,x:'m_rewind',cd:30,mp:10,col:0x9ad8ff,pose:'cast',req:'Time Warp',ty:'Time · rewind',d:'Rewind yourself 4 seconds: return to where you were, with the health and mana you had then if it was more.'},
  {n:'Singularity',i:'🕳️',lv:44,x:'m_sing',gt:1,sh:'circle',r:5,rng:11,m:.4,dur:3,cd:28,mp:30,col:0x8a4aff,pose:'raise',req:'Rift Gate',ty:'Pull · AoE',d:'Open a singularity that drags enemies toward its heart for 3s, then collapses in a burst that stuns.'},
  {n:'Comet Storm',i:'🌠',lv:48,x:'m_comets',gt:1,sh:'circle',r:6,rng:12,m:1.8,cd:30,mp:36,col:0xffa060,pose:'raise',ty:'Barrage · AoE',d:'Eight comets of fire, frost and lightning crash down across the target area over 2.5 seconds.'}]};
Object.keys(KQN).forEach(c=>KQN[c].forEach(s=>{s.k='x';s.nw=1}));
// the old ground skills now use the reticle too
[['Leap Slam',7],['Rain of Arrows',10],['Meteor',10],['Hammer of Light',10],['Blizzard',10]].forEach(([n,rng])=>{Object.keys(SKB).forEach(c=>skAll(c).forEach(s=>{if(s.n==n){s.gt=1;s.sh='circle';s.rng=rng;if(s.k=='leap')s.land=1}}))});
var KQS_TY={cone:'Melee · cone',nova:'AoE around you',leap:'Leap · AoE',buff:'Buff',channel:'Channel · AoE',barrier:'Shield',rain:'Zone · AoE',heal:'Heal',blink:'Teleport strike',fan:'AoE · knives',mark:'Single target · debuff',trap:'Trap',shot:'Projectile',beam:'Line',chain:'Chain',meteor:'Delayed AoE'};

// ---------------- ability book, unlocks and ability points ----------------
function kqsAll(c){const a=SKB[c].concat(SKX[c]||[],KQN[c]||[]);return a.map((s,i)=>[s,i]).sort((p,q)=>p[0].lv-q[0].lv||p[1]-q[1]).map(p=>p[0])}
function kqsDef(c){return SKB[c][0]}
function kqsFind(c,n){return kqsAll(c).find(s=>s.n===n)}
function kqsUnl(c,s){return !!s&&(s===kqsDef(c)||!!(hero.tal&&hero.tal['ab:'+s.n]))}
function apCost(s){return s===kqsDef(hero.cls)?0:1+Math.floor(s.lv/6)}
function apEarned(){return Math.max(0,(hero.lvl|0)-1)+((hero.tal&&hero.tal.__apB)|0)}
function apSpent(){const T=hero.tal||{};let n=0;kqsAll(hero.cls).forEach(s=>{if(s!==kqsDef(hero.cls)&&T['ab:'+s.n])n+=apCost(s)});return n}
function apFree(){return Math.max(0,apEarned()-apSpent())}
function kqsWhy(s){const c=hero.cls;if(kqsUnl(c,s))return '';if(hero.lvl<s.lv)return 'Reach level '+s.lv;if(s.req&&!kqsUnl(c,kqsFind(c,s.req)))return 'Unlock '+s.req+' first';if(apFree()<apCost(s))return 'Needs '+apCost(s)+' ability point'+(apCost(s)>1?'s':'');return ''}
// old saves: keep what the hero had, refund talent points spent on skills, add the kept abilities' cost as bonus points
function kqsMig(){const T=hero.tal;if(!T||T.__ab)return;const c=hero.cls;if(!SKB[c])return;let bonus=0,kept=[],old=hero.lvl>1;
  const all=kqsAll(c),oldLd=String(T.__ld||'').split('|').filter(Boolean),ld=[];
  SKB[c].forEach((s,i)=>{if(i&&hero.lvl>=s.lv&&!T['ab:'+s.n]){T['ab:'+s.n]=1;bonus+=apCost(s);kept.push(s.n)}});
  Object.keys(T).forEach(k=>{if(!k.startsWith('sk:'))return;old=true;const s=all.find(q=>q.n===k.slice(3));if(s&&!T['ab:'+s.n]){T['ab:'+s.n]=1;bonus+=apCost(s);kept.push(s.n)}delete T[k]});
  oldLd.forEach(n=>{const s=all.find(q=>q.n===n);if(s&&kqsUnl(c,s)&&!ld.includes(n)&&ld.length<KQS_SLOTS)ld.push(n)});
  SKB[c].forEach(s=>{if(ld.length<KQS_SLOTS&&kqsUnl(c,s)&&!ld.includes(s.n))ld.push(s.n)});
  T.__ld=ld.join('|');T.__apB=(T.__apB|0)+bonus;T.__ab=1;hsDirty&&hsDirty();
  if(old)setTimeout(()=>{try{say('⚡ <b>Abilities reworked:</b> you kept '+kept.length+' abilit'+(kept.length==1?'y':'ies')+' and have <b>'+apFree()+'</b> ability points to spend (K → Abilities). Talent points spent on skills were refunded.')}catch(_){}},4200)}
// talent points no longer pay for skills
{const f=talSpent;talSpent=function(b){if(b!=null)return f(b);let n=0;const T=TAL[hero.cls]||[];for(let i=0;i<T.length;i++)n+=f(i);return n}}
// the hotbar: the equipped abilities, in slot order (packed, 1-4)
function skLoad(c){const all=kqsAll(c),T=hero.tal||{},out=[];
  String(T.__ld||'').split('|').forEach(n=>{const s=all.find(q=>q.n===n);if(s&&kqsUnl(c,s)&&!out.includes(s)&&out.length<KQS_SLOTS)out.push(s)});
  if(!out.length)out.push(kqsDef(c));return out}
Object.keys(SKB).forEach(c=>Object.defineProperty(SKL,c,{configurable:true,enumerable:true,get(){if(c!==hero.cls||!hero.tal)return SKB[c];kqsMig();const T=hero.tal,key=c+'|'+(T.__ld||'')+'|'+Object.keys(T).filter(k=>k.startsWith('ab:')).join(',');
  if(KQS.ck!==key){KQS.ck=key;KQS.ca=skLoad(c)}return KQS.ca}}));
// cooldowns follow the ability, not the slot, so swapping can't skip a cooldown
function kqsCdSave(){heroSkills().forEach((s,i)=>{KQS.cdn[s.n]=Math.max(KQS.cdn[s.n]||0,hero.cd['s'+i]||0)})}
function kqsCdLoad(lock){heroSkills().forEach((s,i)=>{hero.cd['s'+i]=Math.max(KQS.cdn[s.n]||0,lock==null?1.5:lock)})}
function kqsSetLd(names){kqsTgEnd();kqsCdSave();hero.tal.__ld=names.slice(0,KQS_SLOTS).join('|');kqsCdLoad();try{ui();hud()}catch(_){}if(!$('tal').classList.contains('hide'))rTal();if(xwMode=='abil')rX()}
function skSet(slot,name){const cur=heroSkills().map(s=>s.n),j=cur.indexOf(name);slot=Math.max(0,Math.min(KQS_SLOTS-1,slot|0));
  if(j>=0){if(slot>=cur.length){cur.splice(j,1);cur.push(name)}else{cur[j]=cur[slot];cur[slot]=name}}else if(slot>=cur.length)cur.push(name);else cur[slot]=name;kqsSetLd(cur)}
function kqsUneq(slot){const cur=heroSkills().map(s=>s.n);if(cur.length<=1)return say('Keep at least one ability equipped.');cur.splice(slot,1);kqsSetLd(cur)}
function kqsBuy(n){const c=hero.cls,s=kqsFind(c,n);if(!s||kqsUnl(c,s))return;const w=kqsWhy(s);if(w)return say('🔒 '+s.n+': '+w+'.');
  hero.tal['ab:'+s.n]=1;KQS.sel=s.n;say('⚡ Unlocked '+s.i+' <b>'+s.n+'</b>!'+(heroSkills().length<KQS_SLOTS?' It is on key '+(heroSkills().length+1)+'.':' Equip it to a slot in the Abilities window.'));
  try{mSfx('rare')}catch(_){sfx('chime')}if(heroSkills().length<KQS_SLOTS){const cur=heroSkills().map(q=>q.n);cur.push(s.n);kqsSetLd(cur)}else{try{hud()}catch(_){}if(xwMode=='abil')rX()}}
function kqsResetCost(){return 30*hero.lvl}
function kqsReset(){if(!apSpent())return say('You have no ability points to refund.');const g=kqsResetCost();if(gold<g)return say('Resetting abilities costs '+g+' gold.');gold-=g;
  Object.keys(hero.tal).forEach(k=>{if(k.startsWith('ab:'))delete hero.tal[k]});kqsSetLd([kqsDef(hero.cls).n]);say('⚡ Abilities reset: '+apFree()+' ability points to spend.')}
// the talent reset must keep abilities and the loadout
{const b=$('talReset');if(b){const f=b.onclick;b.onclick=function(){const keep={};for(const k in hero.tal)if(k.startsWith('ab:')||k.startsWith('__'))keep[k]=hero.tal[k];const r=f&&f.apply(this,arguments);for(const k in keep)if(!(k in hero.tal))hero.tal[k]=keep[k];return r}}}
{const f=loadGame;loadGame=function(){kqsClear();KQS.cdn={};const r=f.apply(this,arguments);try{kqsMig();KQS.ck='';hud()}catch(err){console.warn(err)}return r}}
{const f=ccBegin;ccBegin=function(){kqsClear();KQS.cdn={};const r=f.apply(this,arguments);try{if(hero.tal)hero.tal.__ab=1;KQS.ck='';hud()}catch(_){}return r}}
// level up: +1 ability point (the banner text is patched in build/pV10.py)
function kqsLvNote(){const L=kqsAll(hero.cls).filter(s=>s.lv==hero.lvl);return L.length?'New abilit'+(L.length>1?'ies':'y')+' to unlock: '+L.map(s=>s.i+' '+s.n).join(', ')+' (K → Abilities)':''}

// ---------------- helpers for the new abilities ----------------
var kqsV=(x,z)=>new THREE.Vector3(x,0,z);
function kqsFoes(p,R){return enemies.filter(e=>!e.dead&&d2(e.m.position,p)<R+(e.boss?1.2:e.c.al?.5:0))}
function kqsNear(maxD){return tgt&&!tgt.dead&&d2(tgt.m.position,pl.position)<maxD?tgt:nearestFront(maxD)}
function kqsHit(e,raw,c,o){if(!e||e.dead)return 0;return heroHit(e,raw,c.mt,Object.assign({s:c.fx},o||{}))}
function kqsArea(p,R,raw,c,x){return area(p,R,raw,Object.assign({},c.fx,x||{}),null,0)}
function kqsLine(P,d,L,w){return enemies.filter(e=>{if(e.dead)return false;const vx=e.m.position.x-P.x,vz=e.m.position.z-P.z,a=vx*d.x+vz*d.z,pw=Math.abs(vx*d.z-vz*d.x),ex=e.boss?1.2:e.c.al?.4:0;return a>-.6-ex&&a<L+ex&&pw<w/2+.3+ex})}
function kqsDir(a,b){const v=kqsV(b.x-a.x,b.z-a.z),L=v.length();return L>.01?v.multiplyScalar(1/L):kqsV(Math.sin(pl.rotation.y),Math.cos(pl.rotation.y))}
function kqsBuff(n,i,s,ms){const now=performance.now(),b=hero.buffs.find(q=>q.n===n&&q.kqs);if(b){b.t=Math.max(b.t,now+ms);return b}const nb={s,t:now+ms,n,i,kqs:1};hero.buffs.push(nb);hsDirty();return nb}
function kqsUnbuff(n){const L=hero.buffs.length;hero.buffs=hero.buffs.filter(q=>!(q.n===n&&q.kqs));if(hero.buffs.length!=L)hsDirty()}
function kqsRes(v){try{if(typeof resGain=='function')resGain(v)}catch(_){}}
function kqsLand(P,tp){let k=1;const blk=(x,z)=>typeof plBlocked=='function'?plBlocked(x,z):solid(x,z);while(k>0&&blk(P.x+(tp.x-P.x)*k,P.z+(tp.z-P.z)*k))k-=.05;k=Math.max(0,k);return kqsV(P.x+(tp.x-P.x)*k,P.z+(tp.z-P.z)*k)}
function kqsTp(p){pl.position.x=p.x;pl.position.z=p.z;if(!inRealm)pl.position.y=GH(p.x,p.z);try{if(typeof UNS!='undefined')UNS.air=nowP()+300}catch(_){}}
function kqsObj(o){o.age=0;KQS.objs.push(o);return o}
function kqsRm(m){if(!m)return;if(m.parent)m.parent.remove(m);m.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&!o.userData.kqsKeep){(Array.isArray(o.material)?o.material:[o.material]).forEach(q=>q.dispose&&q.dispose())}})}
function kqsFade(m,ms,done){if(!m)return done&&done();const mats=[];m.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(q=>{q.transparent=true;mats.push([q,q.opacity])})});tw(ms||300,k=>mats.forEach(([q,o])=>q.opacity=o*(1-k)),()=>{kqsRm(m);done&&done()})}
var kqsAdd=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
var kqsStd=(c,e,op)=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:e==null?.5:e,flatShading:true,roughness:.7,metalness:.1,transparent:op!=null,opacity:op==null?1:op});
function kqsMesh(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.userData.lpsSkip=1;return m}
// a decal draped over the terrain. geo is built in its XY plane; fn(u,v) → [worldX, worldZ]
function kqsDrapeM(geo,mat,ro){const m=new THREE.Mesh(geo,mat);m.frustumCulled=false;m.renderOrder=ro||28;m.userData.lpsSkip=1;m.userData.b=geo.attributes.position.array.slice();scene.add(m);return m}
function kqsDrape(m,fn,lift){const P=m.geometry.attributes.position,b=m.userData.b,y0=lift==null?.14:lift;for(let i=0;i<P.count;i++){const w=fn(b[i*3],b[i*3+1]);P.setXYZ(i,w[0],(inRealm?0:GH(w[0],w[1]))+y0,w[1])}P.needsUpdate=true;m.geometry.computeBoundingSphere()}
var kqsDMat=(c,op,dt)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false,depthTest:dt!==false?true:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
// a circle decal (fill + edge) at p; returns {g:[meshes], set(p,R)}
function kqsDecal(p,R,col,op,edge){const f=kqsDrapeM(new THREE.RingGeometry(.001,1,40,3),kqsDMat(col,op==null?.2:op)),e=kqsDrapeM(new THREE.RingGeometry(.93,1,48,1),kqsDMat(col,edge==null?.7:edge));
  const D={g:[f,e],p:p.clone(),R,set(q,r){D.p.copy(q);if(r!=null)D.R=r;const fn=(u,v)=>[D.p.x+u*D.R,D.p.z-v*D.R];kqsDrape(f,fn);kqsDrape(e,fn,.15)},op(k){f.material.opacity=(op==null?.2:op)*k;e.material.opacity=(edge==null?.7:edge)*k},rm(ms){D.g.forEach(m=>kqsFade(m,ms||350))}};D.set(p,R);return D}
// warning circle that fills over `delay` s, then calls cb
function kqsWarn(p,R,col,delay,cb){const D=kqsDecal(p,R,col,.12,.8),in_=kqsDrapeM(new THREE.RingGeometry(.001,1,32,2),kqsDMat(col,.3));
  kqsObj({life:delay,tick:(dt,now,o)=>{const k=Math.min(1,o.age/delay);kqsDrape(in_,(u,v)=>[p.x+u*R*k,p.z-v*R*k],.16)},end:o=>{kqsRm(in_);D.rm(200);if(!o.abort)cb&&cb()}})}
function kqsLob(from,to,mesh,ms,h,cb){scene.add(mesh);const a=gY(from,1.2),b=gY(to,.3);tw(ms,k=>{mesh.position.lerpVectors(a,b,k);mesh.position.y+=Math.sin(k*Math.PI)*(h||2.4);mesh.rotation.x+=.3;mesh.rotation.z+=.2},()=>{kqsRm(mesh);cb&&cb()})}
function kqsPillar(p,col,h,ms,w){const m=kqsMesh(new THREE.CylinderGeometry(w||.5,w||.5,h||8,10,1,true),kqsAdd(col));m.position.copy(gY(p,(h||8)/2));scene.add(m);tw(ms||420,k=>{m.material.opacity=.85*(1-k);m.scale.set(1+k*.6,1,1+k*.6)},()=>kqsRm(m))}
function kqsSpark(a,b,col){try{bolt(a,b,col)}catch(_){}}

// ---------------- simple low-poly models for summons and props ----------------
function kqsWolf(col,sc){const g=new THREE.Group(),m=kqsStd(col,.75,.82),L=[];
  g.add(kqsMesh(new THREE.BoxGeometry(.42,.4,1.0),m,0,.62,0));g.add(kqsMesh(new THREE.BoxGeometry(.46,.46,.38),m,0,.7,.36));
  g.add(kqsMesh(new THREE.BoxGeometry(.3,.28,.34),m,0,.86,.68));const sn=kqsMesh(new THREE.ConeGeometry(.12,.32,4),m,0,.8,.95);sn.rotation.x=Math.PI/2;g.add(sn);
  [-.1,.1].forEach(x=>g.add(kqsMesh(new THREE.ConeGeometry(.07,.2,4),m,x,1.08,.62)));
  [[-.14,.36],[.14,.36],[-.14,-.36],[.14,-.36]].forEach(([x,z])=>{const l=kqsMesh(new THREE.BoxGeometry(.11,.5,.11),m,x,.27,z);l.geometry.translate(0,-.2,0);l.position.y=.47;L.push(l);g.add(l)});
  const t=kqsMesh(new THREE.ConeGeometry(.08,.55,4),m,0,.78,-.62);t.rotation.x=-2.1;g.add(t);g.userData.legs=L;g.userData.tail=t;g.scale.setScalar(sc||1);return g}
function kqsHawk(col){const g=new THREE.Group(),m=kqsStd(col,.7,.85);const b=kqsMesh(new THREE.ConeGeometry(.12,.6,4),m);b.rotation.x=Math.PI/2;g.add(b);
  const w1=kqsMesh(new THREE.BoxGeometry(.8,.03,.26),m,-.42,0,0),w2=kqsMesh(new THREE.BoxGeometry(.8,.03,.26),m,.42,0,0);w1.geometry.translate(-.0,0,0);g.add(w1,w2);g.userData.w=[w1,w2];return g}
function kqsShade(col){const g=new THREE.Group(),m=kqsStd(col,.55,.7);
  g.add(kqsMesh(new THREE.CylinderGeometry(.2,.26,.75,6),m,0,1.05,0));g.add(kqsMesh(new THREE.SphereGeometry(.18,6,5),m,0,1.62,0));
  const hood=kqsMesh(new THREE.ConeGeometry(.24,.34,6),m,0,1.82,-.02);g.add(hood);
  [-.32,.32].forEach((x,i)=>{const a=kqsMesh(new THREE.BoxGeometry(.1,.55,.1),m,x,1.1,.05);a.rotation.x=-.6;g.add(a);const bl=kqsMesh(new THREE.BoxGeometry(.04,.04,.42),kqsAdd(0xd8c8ff),x,.9,.36);g.add(bl)});
  [-.1,.1].forEach(x=>g.add(kqsMesh(new THREE.BoxGeometry(.12,.65,.12),m,x,.36,0)));return g}
function kqsHammer(){const g=new THREE.Group(),m=kqsStd(0xffd860,.8);g.add(kqsMesh(new THREE.BoxGeometry(.34,.2,.2),m,0,.22,0));g.add(kqsMesh(new THREE.CylinderGeometry(.035,.035,.5,5),kqsStd(0xb08040,.3),0,0,0));return g}

// ---------------- channels (Penance, Rapid Fire, Disintegrate, Aimed Shot) ----------------
function kqsChan(o){KQS.ch=Object.assign({ti:0,el:0},o);if(o.slow)kqsBuff('Channelling','🔆',{mspd:-o.slow},o.t*1000+200)}
function kqsChanEnd(cancel){const c=KQS.ch;if(!c)return;KQS.ch=null;kqsUnbuff('Channelling');if(c.end)try{c.end(cancel)}catch(err){console.error(err)}}
{const f=swing;swing=function(){if(KQS.ch||KQS.tg&&KQS.eat)return;return f.apply(this,arguments)}}
{const f=dodge;dodge=function(){if(KQS.ch&&!((hero.cdD||0)>0)&&(hero.dc||0)>=1)kqsChanEnd(true);return f.apply(this,arguments)}}

// ---------------- the handlers: c = {sk,i,key,s,P,d,mt,A (attack × skill bonus),raw (A × m),R (radius incl. area talents),now,gp,fx,cr,pips} ----------------
var KQH={
 // ===== WARRIOR =====
 w_rush(c){const d=c.d,dist=7,T=dist/14,hit=new Set();hero.dash={x:d.x,z:d.z,t:T};hero.iv=Math.max(hero.iv||0,T+.15);kqsRes(10);kqsSnd('charge');
  kqsObj({life:T+.08,tick:()=>{burst(gY(pl.position,.3),0xc8a070,4,1.2,1,.4);kqsFoes(pl.position,1.8).forEach(e=>{if(hit.has(e))return;hit.add(e);kqsHit(e,c.raw,c);eStatus(e,{stun:.6},0,'h');const s=Math.sign((e.m.position.x-pl.position.x)*d.z-(e.m.position.z-pl.position.z)*d.x)||1;if(!e.boss){e.vx+=d.z*s*5;e.vz+=-d.x*s*5}burst(gY(e.m.position,.8),c.sk.col,14,2,2,.4);shake(.08)})},
   end:()=>{ring(pl.position,c.sk.col,2.2,300);burst(gY(pl.position,.3),0xc8a070,20,2,1.4,.5)}})},
 w_shout(c){const P=c.P.clone(),L=kqsFoes(P,c.R);[0,120,240].forEach((t,j)=>setTimeout(()=>{ring(P,j?0xffa060:c.sk.col,c.R*(1.2+j*.5),420);},t));burst(gY(P,1.6),c.sk.col,40,3,2,.6);popT(P,'RAAAGH!','#ff7a4a',true);shake(.2);kqsSnd('shout');kqsRes(25);
  L.forEach(e=>{if(!e.boss)mCancel(e);eStatus(e,{weak:6,slow:3},0);kqsHit(e,c.raw,c,{proc:false});dn(e.m.position,'Weakened','#fca5a5',-30,900)})},
 w_skull(c){const t=kqsNear(5.2);if(!t)return false;const k=1+Math.min(100,c.cr)/100,lg=kqsLunge(t);
  setTimeout(()=>{if(t.dead)return;kqsHit(t,c.raw*k,c);eStatus(t,{bleed:6},c.A*.5);burst(gY(t.m.position,1.1),0xd03030,30,2.6,2.5,.5);ring(t.m.position,c.sk.col,1.6,300);hstop=.08;shake(.25);kqsSnd('thud');if(c.cr>=50)popT(t.m.position,'SPLIT! ×'+k.toFixed(1),'#ff7a4a',true)},170+lg)},
 w_rupture(c){const P=c.P.clone(),d=kqsDir(P,c.gp),L=Math.max(3,Math.min(c.sk.L,d2(P,c.gp))),hit=new Set(),n=Math.ceil(L);kqsSnd('quake');
  for(let j=1;j<=n;j++)setTimeout(()=>{const q=kqsV(P.x+d.x*j*(L/n),P.z+d.z*j*(L/n));burst(gY(q,.2),0xb08a60,12,1.6,3,.6);ring(q,c.sk.col,1.3,260);kqsSpike(q,0x8a6a4a,.9+Math.random()*.5);
    kqsFoes(q,c.sk.w*.6).forEach(e=>{if(hit.has(e))return;hit.add(e);kqsHit(e,c.raw,c)});if(j==n)shake(.3)},j*45)},
 w_banner(c){const p=c.gp.clone(),R=c.R,g=new THREE.Group();g.add(kqsMesh(new THREE.CylinderGeometry(.06,.07,3.2,6),kqsStd(0x6a4a2a,.15),0,1.6,0));g.add(kqsMesh(new THREE.ConeGeometry(.12,.3,5),kqsStd(0xd8b050,.6),0,3.3,0));
  const cl=kqsMesh(new THREE.PlaneGeometry(1,1.3,4,1),new THREE.MeshStandardMaterial({color:0xb01818,emissive:0x400606,side:THREE.DoubleSide,flatShading:true}),.52,2.45,0);g.add(cl);g.add(kqsMesh(new THREE.TorusGeometry(.2,.05,5,10),kqsStd(0xffd060,.7),.52,2.5,.02));
  g.position.copy(gY(p,0));g.scale.set(1,.01,1);scene.add(g);tw(260,k=>g.scale.set(1,k,1));const D=kqsDecal(p,R,c.sk.col,.12,.6);burst(gY(p,.3),0xc8a070,30,2.5,2,.5);shake(.12);kqsSnd('horn');let ti=0;
  kqsObj({life:c.sk.dur,tick:(dt,now,o)=>{cl.rotation.y=Math.sin(now/260)*.25;ti-=dt;if(ti>0)return;ti=.5;if(d2(pl.position,p)<R){kqsBuff('War Banner','🚩',{paP:.2,dr:.15,regen:.02},700);burst(gY(pl.position,.2),c.sk.col,4,.6,1.4,.5)}
    kqsFoes(p,R).forEach(e=>eStatus(e,{slow:1},0));if(Math.random()<.5)ring(p,c.sk.col,R*1.9,500)},end:()=>{D.rm(400);kqsFade(g,400);kqsUnbuff('War Banner')}})},
 w_blood(c){const lost=Math.min(hero.hp-1,hero.hp*.15);hero.hp-=Math.max(0,lost);dn(pl.position,'-'+Math.round(lost),'#ff6b5b');hero.cr=100;try{resUI()}catch(_){}
  hero.buffs.push({s:{as:.25,paP:.1,ls:.1},t:c.now+c.sk.dur*1000,n:'Bloodrage',i:'🩸'});hsDirty();burst(gY(pl.position,1),0xc0101a,60,2.5,3,.8);ring(pl.position,0xff2020,3,500);popT(pl.position,'BLOODRAGE','#ff4040',true);flash('rgba(200,20,20,.25)');kqsSnd('shout')},
 w_hook(c){const p=c.gp.clone(),P=c.P;kqsChain(gY(P,1.1),gY(p,.5),0xa8a8b8,180);kqsSnd('chain');
  setTimeout(()=>{ring(p,c.sk.col,c.R*1.8,300);burst(gY(p,.5),0xc8c8d8,24,c.R,1.5,.4);const L=kqsFoes(p,c.R);L.forEach(e=>{kqsHit(e,c.raw,c);if(e.boss||e.dead)return;const a=e.m.position.clone(),d=kqsDir(pl.position,a),b=kqsV(pl.position.x+d.x*1.4+(Math.random()-.5)*.6,pl.position.z+d.z*1.4+(Math.random()-.5)*.6);
    kqsChain(gY(pl.position,1.1),gY(a,.8),0x8a8a9a,260);e.vx=e.vz=0;tw(260,k=>{if(e.dead)return;e.m.position.x=a.x+(b.x-a.x)*k;e.m.position.z=a.z+(b.z-a.z)*k})});if(L.length)shake(.15)},180)},
 w_exec(c){const t=kqsNear(5.2);if(!t)return false;const lg=kqsLunge(t);const low=t.c.h/M(t.c)<.3,k=(low?3:1)*(1+Math.min(100,c.cr)/100*.8);
  setTimeout(()=>{if(t.dead)return;kqsHit(t,c.raw*k,c);burst(gY(t.m.position,1),0xff2a1a,low?50:24,2.6,2.5,.5);hstop=low?.12:.06;shake(low?.35:.18);kqsSnd('thud');
   if(t.dead){hero.cd[c.key]=(hero.cd[c.key]||0)*.3;popT(t.m.position,'EXECUTED','#ff4a3a',true)}},150+lg)},
 w_unbrk(c){KQS.unbrk=c.now+c.sk.dur*1000;hero.buffs.push({s:{dr:.3},t:KQS.unbrk,n:'Unbreakable',i:'🗿'});hsDirty();ring(pl.position,0xb0a898,3,600);burst(gY(pl.position,1),0x9a9080,50,2,2.5,.8);popT(pl.position,'UNBREAKABLE','#d6d3d1',true);kqsSnd('thud');
  kqsObj({life:c.sk.dur,tick:()=>{if(Math.random()<.3)burst(gY(pl.position,1),0xb0a898,2,.6,1,.4)},end:o=>{if(!o.abort){healHero(heroMax()*.15);ring(pl.position,0x9affb0,2.4,500)}}})},
 w_titan(c){const o=c.P.clone(),tp=kqsLand(o,c.gp),R=c.R;hero.iv=Math.max(hero.iv||0,.9);try{UNS.air=nowP()+760}catch(_){}kqsSnd('whoosh');
  tw(650,k=>{pl.position.x=o.x+(tp.x-o.x)*k;pl.position.z=o.z+(tp.z-o.z)*k;if(pl.children[0])pl.children[0].position.y=Math.sin(k*Math.PI)*4.2;if(k>.2&&k<.9)burst(gY(pl.position,1+Math.sin(k*Math.PI)*4),0xffb060,2,.3,.2,.3)},
   ()=>{if(pl.children[0])pl.children[0].position.y=0;const p=pl.position.clone();ring(p,c.sk.col,R*2.2,450);ring(p,0xffffff,R*1.4,300);burst(gY(p,.3),0xb08a60,90,R*1.6,4,.9);for(let j=0;j<8;j++){const a=j/8*6.283;kqsSpike(kqsV(p.x+Math.cos(a)*R*.7,p.z+Math.sin(a)*R*.7),0x8a6a4a,1.2)}
    shake(.6);hstop=.12;kqsSnd('boom');kqsArea(p,R,c.raw,c);const D=kqsDecal(p,R,0x8a5a3a,.25,.5);kqsObj({life:4,tick:()=>kqsFoes(p,R).forEach(e=>eStatus(e,{slow:.5},0)),end:()=>D.rm(500)})})},
 // ===== PALADIN =====
 p_bash(c){const t=kqsNear(5);if(!t)return false;const lg=kqsLunge(t);kqsRes(15);
  setTimeout(()=>{if(t.dead)return;kqsHit(t,c.raw,c);burst(gY(t.m.position,1),0xffe8a0,26,2.2,2,.4);ring(t.m.position,0xffe8a0,1.5,260);hstop=.07;shake(.18);sfx('blunt');kqsSnd('bell')},120+lg)},
 p_hammers(c){const H=[0,1,2].map(()=>{const h=kqsHammer();scene.add(h);return h}),last=new Map();kqsSnd('holy');
  kqsObj({life:c.sk.dur,tick:(dt,now,o)=>{const r=1.2+Math.min(1,o.age/.6)*1.7;H.forEach((h,j)=>{const a=o.age*4.2+j*2.094;h.position.set(pl.position.x+Math.cos(a)*r,pl.position.y+1.0,pl.position.z+Math.sin(a)*r);h.rotation.y=-a;h.rotation.z+=dt*12;
    if(Math.random()<.3)burst(h.position,0xffe08a,1,.2,.2,.3);enemies.forEach(e=>{if(e.dead||d2(e.m.position,h.position)>.95+(e.boss?1.2:0))return;const t=last.get(e)||{};if((t[j]||0)>now)return;t[j]=now+500;last.set(e,t);kqsHit(e,c.raw,c,{proc:false});burst(gY(e.m.position,1),0xffe08a,8,1.4,1,.3)})})},
   end:()=>H.forEach(h=>{burst(h.position,0xffe08a,10,1,1,.4);kqsRm(h)})})},
 p_beacon(c){const p=c.gp.clone(),R=c.R,g=new THREE.Group(),cr=kqsMesh(new THREE.OctahedronGeometry(.42,0),kqsStd(0xffe8a0,1.1),0,1.6,0),col=kqsMesh(new THREE.CylinderGeometry(.32,.32,7,10,1,true),kqsAdd(0xfff0b0),0,3.5,0);col.material.opacity=.35;
  g.add(cr,col,kqsMesh(new THREE.CylinderGeometry(.5,.62,.3,6),kqsStd(0xa8a090,.2),0,.15,0));g.position.copy(gY(p,0));scene.add(g);const D=kqsDecal(p,R,c.sk.col,.12,.55);kqsPillar(p,0xfff0b0,10,500,.9);kqsSnd('holy');let ti=.2;
  kqsObj({life:c.sk.dur,tick:(dt,now)=>{cr.rotation.y+=dt*2;cr.position.y=1.6+Math.sin(now/300)*.12;ti-=dt;if(ti>0)return;ti=1;ring(p,c.sk.col,R*1.9,600);kqsArea(p,R,c.raw,c,{proc:false});
    if(d2(pl.position,p)<R){healHero(heroMax()*.025);burst(gY(pl.position,1),0x9affb0,10,1,1.5,.6)}},end:()=>{D.rm(400);kqsFade(g,400)}})},
 p_charge(c){const d=c.d,T=8/14,hit=new Set();hero.dash={x:d.x,z:d.z,t:T};hero.iv=Math.max(hero.iv||0,T+.15);kqsSnd('charge');kqsSnd('holy');
  kqsObj({life:T+.08,tick:()=>{burst(gY(pl.position,.8),0xffe080,6,1,1.5,.5);kqsFoes(pl.position,1.9).forEach(e=>{if(hit.has(e))return;hit.add(e);kqsHit(e,c.raw,c);eStatus(e,{weak:4},0);burst(gY(e.m.position,1),0xfff0b0,16,2,2,.4)})},end:()=>ring(pl.position,c.sk.col,2.4,320)})},
 p_sanct(c){const p=c.gp.clone(),R=c.R,dome=kqsMesh(new THREE.SphereGeometry(1,20,10,0,6.283,0,Math.PI/2),kqsAdd(0xfff6c8));dome.material.opacity=.0;dome.position.copy(gY(p,0));scene.add(dome);const D=kqsDecal(p,R,c.sk.col,.16,.7);kqsSnd('holy');let ti=0;
  tw(300,k=>{dome.scale.setScalar(R*k);dome.material.opacity=.22*k});
  kqsObj({life:c.sk.dur,tick:(dt,now)=>{dome.material.opacity=.18+Math.sin(now/220)*.05;ti-=dt;if(ti>0)return;ti=.5;if(d2(pl.position,p)<R)kqsBuff('Sanctuary','⛪',{dr:.35},700);kqsFoes(p,R).forEach(e=>eStatus(e,{slow:1},0));kqsArea(p,R,c.raw,c,{proc:false})},end:()=>{D.rm(400);kqsFade(dome,400);kqsUnbuff('Sanctuary')}})},
 p_avenger(c){const t0=kqsNear(12);if(!t0)return false;const L=[t0],seen=new Set([t0]);let cur=t0;for(let j=0;j<4;j++){const nx=enemies.filter(e=>!e.dead&&!seen.has(e)&&d2(e.m.position,cur.m.position)<7).sort((a,b)=>d2(a.m.position,cur.m.position)-d2(b.m.position,cur.m.position))[0];if(!nx)break;L.push(nx);seen.add(nx);cur=nx}
  const disc=new THREE.Group();disc.add(kqsMesh(new THREE.CylinderGeometry(.38,.38,.08,10),kqsStd(0xd8c8a0,.6)));disc.add(kqsMesh(new THREE.TorusGeometry(.38,.05,5,12),kqsStd(0xffd860,.9)));disc.children[1].rotation.x=Math.PI/2;scene.add(disc);
  let from=gY(pl.position,1.1),j=0;kqsSnd('whoosh');const leg=()=>{const e=L[j],to=e&&!e.dead?gY(e.m.position,1):null;if(!to){back();return}const a=from.clone();tw(140,k=>{disc.position.lerpVectors(a,to,k);disc.rotation.y+=.6;burst(disc.position,0xffe8b0,1,.2,.1,.25)},()=>{kqsHit(e,c.raw*(1-.1*j),c);burst(to,0xffe8b0,16,1.6,1.5,.4);sfx('blunt');from=to;j++;if(j<L.length)leg();else back()})};
  const back=()=>{const a=disc.position.clone();tw(200,k=>{disc.position.lerpVectors(a,gY(pl.position,1.1),k);disc.rotation.y+=.6},()=>kqsRm(disc))};leg()},
 p_penance(c){kqsSnd('holy');kqsChan({t:c.sk.dur,iv:.5,slow:.65,tick:()=>{healHero(heroMax()*.03);ring(pl.position,c.sk.col,c.R*1.9,420);burst(gY(pl.position,1.6),0xfff0b0,16,1.5,2,.6);kqsArea(pl.position,c.R,c.raw,c,{proc:false});kqsPose('raise',460)}})},
 p_seal(c){hero.buffs.push({s:{basicP:.35,maP:.15,ls:.06},t:c.now+c.sk.dur*1000,n:'Seal of Light',i:'🌟'});hsDirty();ring(pl.position,c.sk.col,3,600);burst(gY(pl.position,1.2),c.sk.col,50,2,3,.8);kqsSnd('bell')},
 p_interv(c){const T=c.sk.dur;hero.iv=Math.max(hero.iv||0,T);const sph=kqsMesh(new THREE.SphereGeometry(1.15,16,10),kqsAdd(0xfffbe0));sph.material.opacity=.25;scene.add(sph);popT(pl.position,'DIVINE INTERVENTION','#fde68a',true);flash('rgba(255,240,180,.3)');kqsSnd('holy');kqsSnd('bell');
  kqsObj({life:T,tick:(dt,now)=>{sph.position.copy(gY(pl.position,1));sph.material.opacity=.2+Math.sin(now/120)*.06;healHero(heroMax()*.1*dt,true);if(Math.random()<.4)burst(gY(pl.position,1.2),0xfffbe0,2,.8,1.5,.5)},
   end:o=>{kqsRm(sph);if(o.abort)return;const P=pl.position;ring(P,0xfff0a0,c.R*2.2,420);ring(P,0xffffff,c.R*1.4,300);burst(gY(P,.6),0xfff0a0,70,c.R*1.5,3,.8);kqsArea(P,c.R,c.raw,c);shake(.25);kqsSnd('boom')}})},
 p_wrath(c){const p=c.gp.clone(),R=c.R;kqsSnd('holy');const D=kqsDecal(p,R,c.sk.col,.08,.6);
  for(let j=0;j<6;j++)setTimeout(()=>{const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R*.85,q=kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r);kqsWarn(q,1.6,c.sk.col,.35,()=>{kqsPillar(q,0xfff2a0,12,380,.6);burst(gY(q,.4),0xfff2a0,30,1.8,3,.5);kqsArea(q,1.6,c.raw,c,{stun:0});sfx('zap');shake(.08)})},j*280);
  setTimeout(()=>kqsWarn(p,3,0xffffff,.5,()=>{kqsPillar(p,0xffffff,16,520,1.6);ring(p,c.sk.col,6,450);burst(gY(p,.4),0xfff2a0,80,3,4,.8);kqsArea(p,3,c.A*3.0,c);shake(.35);kqsSnd('boom');D.rm(400)}),1750)},
 // ===== ASSASSIN =====
 a_evisc(c){const t=kqsNear(5);if(!t)return false;const lg=kqsLunge(t);const k=1+.45*c.pips;
  setTimeout(()=>{if(t.dead)return;kqsHit(t,c.raw*k,c,{crit:c.pips>=5});burst(gY(t.m.position,1),0xe04a6a,14+c.pips*8,2,2,.4);if(c.pips)popT(t.m.position,'●'.repeat(c.pips)+' ×'+k.toFixed(2),'#f0abfc',c.pips>=4);hstop=.05;sfx('stab')},90+lg)},
 a_flask(c){const p=c.gp.clone(),R=c.R,fl=kqsMesh(new THREE.SphereGeometry(.16,6,5),kqsStd(0x7ae04a,.8));kqsSnd('whoosh');
  kqsLob(c.P,p,fl,380,2.2,()=>{burst(gY(p,.4),0x7ae04a,40,R,2,.6);ring(p,0x7ae04a,R*1.8,300);sfx('brk',.4);kqsSnd('poison');const D=kqsDecal(p,R,0x6ac03a,.22,.55);let ti=0;
   kqsObj({life:c.sk.dur,tick:dt=>{for(let k=0;k<2;k++){const a=Math.random()*6.283,r=Math.random()*R;burst(gY(kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),.3+Math.random()),0x8ad84a,1,.4,.6,.9)}ti-=dt;if(ti>0)return;ti=.5;
    kqsFoes(p,R).forEach(e=>{eStatus(e,{poison:4,slow:1},c.A*.35*(1+(c.s.poisonP||0)));kqsHit(e,c.raw,c,{proc:false})})},end:()=>D.rm(400)})})},
 a_vanish(c){KQS.stealth=c.now+c.sk.dur*1000;hero.buffs.push({s:{mspd:.4},t:KQS.stealth,n:'Vanish',i:'🌫️'});hsDirty();burst(gY(pl.position,1),0x3a2a4a,60,2.2,1.6,.9);ring(pl.position,0x6a5a8a,2.4,400);kqsStealthVis(true);kqsSnd('shadow');
  enemies.forEach(e=>{if(!e.dead&&!e.boss&&d2(e.m.position,pl.position)<30){e.agg=0;mCancel(e)}});if(tgt&&!tgt.boss){}},
 a_clone(c){const m=kqsShade(0x3a2a5a),P=c.P;m.position.set(P.x-Math.cos(pl.rotation.y)*1.2,GH(P.x,P.z),P.z+Math.sin(pl.rotation.y)*1.2);burst(gY(m.position,1),0x7a4ae0,30,1.5,2,.5);kqsSnd('shadow');
  kqsSummon({mesh:m,life:c.sk.dur,spd:8,reach:1.5,iv:.55,dmg:c.raw,c,col:0x9a6ae0,hum:1})},
 a_phantom(c){const o=c.P.clone(),tp=kqsLand(o,c.gp);burst(gY(o,1),0x3a2a4a,40,1.6,2,.6);kqsTp(tp);hero.iv=Math.max(hero.iv||0,.3);kqsSnd('shadow');kqsSpark(gY(o,1),gY(tp,1),0x9a6ae0);
  setTimeout(()=>{const P=pl.position;ring(P,c.sk.col,c.R*2,320);burst(gY(P,1),0x9a6ae0,40,c.R*1.2,2,.5);arc(P,kqsV(1,0),0xd8c8ff,c.R,300);arc(P,kqsV(-1,0),0xd8c8ff,c.R,300);kqsArea(P,c.R,c.raw,c);kqsRes(40);sfx('stab');shake(.12)},60)},
 a_caltrops(c){const p=c.gp.clone(),R=c.R,g=new THREE.Group(),m=kqsStd(0x9a9aa8,.15);for(let j=0;j<18;j++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R*.92,t=kqsMesh(new THREE.TetrahedronGeometry(.11,0),m);t.position.set(Math.cos(a)*r,0,Math.sin(a)*r);t.rotation.set(Math.random()*3,Math.random()*3,0);g.add(t)}
  g.position.set(p.x,0,p.z);g.children.forEach(t=>t.position.y=GH(p.x+t.position.x,p.z+t.position.z)+.06);scene.add(g);burst(gY(p,.3),0xb0b0c0,24,R,1,.4);kqsSnd('chain');const D=kqsDecal(p,R,0x8a8a9a,.08,.4);let ti=0;
  kqsObj({life:c.sk.dur,tick:dt=>{ti-=dt;if(ti>0)return;ti=.5;kqsFoes(p,R).forEach(e=>{eStatus(e,{slow:1,bleed:3},c.A*.25);kqsHit(e,c.raw,c,{proc:false})})},end:()=>{D.rm(300);kqsFade(g,300)}})},
 a_garrote(c){const t=kqsNear(5);if(!t)return false;const lg=kqsLunge(t);
  setTimeout(()=>{if(t.dead)return;kqsHit(t,c.raw,c);eStatus(t,{stun:c.sk.stun,bleed:8},c.A*(.6+.25*c.pips),'h');kqsChain(gY(pl.position,1.3),gY(t.m.position,1.3),0xd03a3a,300);burst(gY(t.m.position,1.3),0xd03a3a,20+c.pips*6,1.5,1.5,.5);dn(t.m.position,'Silenced','#fca5a5',-30,900);sfx('stab')},100+lg)},
 a_cuts(c){const L=enemies.filter(e=>!e.dead&&d2(e.m.position,pl.position)<8).sort((a,b)=>d2(a.m.position,pl.position)-d2(b.m.position,pl.position)).slice(0,6);if(!L.length)return false;
  hero.iv=Math.max(hero.iv||0,L.length*.18+.3);let j=0;kqsSnd('shadow');const step=()=>{const e=L[j];if(e&&!e.dead){const a=e.m.position,an=Math.random()*6.283,o=pl.position.clone(),q=kqsLand(a,kqsV(a.x+Math.cos(an)*1.1,a.z+Math.sin(an)*1.1));kqsSpark(gY(o,1),gY(q,1),0xff8ac8);kqsTp(q);face(kqsDir(q,a));
    burst(gY(q,1),0xff8ac8,14,1.2,1.5,.4);kqsHit(e,c.raw,c,{crit:true});arc(q,kqsDir(q,a),0xffc8e8,1.6,200);sfx('stab');kqsPose('dash',160)}j++;if(j<L.length)setTimeout(step,180);else ring(pl.position,c.sk.col,2.4,300)};step()},
 a_envenom(c){const P=c.P,L=kqsFoes(P,c.R);if(!L.length)return false;const k=1+.2*c.pips;ring(P,0x8ad84a,c.R*2,420);kqsSnd('poison');let any=0;
  L.forEach(e=>{let rem=0;(e.dots||[]).forEach(q=>{if(q.k=='poison'||q.k=='bleed'){rem+=q.dps*Math.max(0,q.t);q.t=0}});if(rem>0)any=1;kqsSpark(gY(P,1),gY(e.m.position,.8),0x8ad84a);kqsHit(e,(c.raw+rem*1.5)*k,c,{proc:false});burst(gY(e.m.position,1),rem>0?0x8ad84a:0x6a8a4a,rem>0?30:10,2,2,.5)});
  if(any)shake(.12)},
 a_eclipse(c){const p=c.gp.clone(),R=c.R,D=kqsDecal(p,R,0x2a0a4a,.0,.9),dark=kqsDrapeM(new THREE.RingGeometry(.001,1,40,3),new THREE.MeshBasicMaterial({color:0x05000a,transparent:true,opacity:.0,depthWrite:false,side:THREE.DoubleSide}),27);
  kqsDrape(dark,(u,v)=>[p.x+u*R,p.z-v*R],.13);tw(300,k=>dark.material.opacity=.55*k);const orb=kqsMesh(new THREE.SphereGeometry(.42,14,10),new THREE.MeshBasicMaterial({color:0x000000}));const hal=kqsMesh(new THREE.RingGeometry(.42,.62,24),kqsAdd(0x9a6ae0));orb.position.copy(gY(p,3.6));hal.position.copy(orb.position);scene.add(orb,hal);kqsSnd('shadow');let ti=0;
  kqsObj({life:c.sk.dur,tick:(dt,now)=>{hal.quaternion.copy(cam.quaternion);if(Math.random()<.5){const a=Math.random()*6.283,r=Math.random()*R;burst(gY(kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),.2),0x3a1a5a,1,.2,1.2,.8)}ti-=dt;if(ti>0)return;ti=.5;
    if(d2(pl.position,p)<R)kqsBuff('Eclipse','🌒',{crit:.25,cdm:.3},700);kqsFoes(p,R).forEach(e=>{eStatus(e,{weak:1,slow:1},0);kqsHit(e,c.raw,c,{proc:false})})},end:()=>{D.rm(400);kqsFade(dark,400);kqsRm(orb);kqsFade(hal,300);kqsUnbuff('Eclipse')}})},
 // ===== RANGER =====
 r_diseng(c){const d=c.d,o=c.P.clone(),tp=kqsLand(o,kqsV(o.x-d.x*6,o.z-d.z*6));launch(o,d,22,{col:c.sk.col,mt:'p',arrow:1},c.raw,.65);kqsFoes(o,3).forEach(e=>eStatus(e,{slow:3},0));burst(gY(o,.3),0xc8e0a0,20,2,1,.4);hero.iv=Math.max(hero.iv||0,.45);kqsSnd('whoosh');
  try{UNS.air=nowP()+460}catch(_){}tw(380,k=>{pl.position.x=o.x+(tp.x-o.x)*k;pl.position.z=o.z+(tp.z-o.z)*k;if(pl.children[0])pl.children[0].position.y=Math.sin(k*Math.PI)*1.3},()=>{if(pl.children[0])pl.children[0].position.y=0;burst(gY(pl.position,.2),0xc8b090,12,1.2,1,.4)})},
 r_wolf(c){const P=c.P,m=kqsWolf(0x8ac8ff);m.position.set(P.x+1,GH(P.x+1,P.z),P.z);burst(gY(m.position,.8),0x9ad0ff,40,1.6,2,.6);ring(m.position,0x9ad0ff,2,400);kqsSnd('beast');
  kqsSummon({mesh:m,life:c.sk.dur,spd:7.5,reach:1.6,iv:.8,dmg:c.raw,c,col:0x9ad0ff,wolf:1})},
 r_frost(c){const p=c.gp.clone(),R=c.R,tr=new THREE.Group();tr.add(kqsMesh(new THREE.OctahedronGeometry(.28,0),kqsStd(0x9fe3ff,.9,.9),0,.32,0));tr.add(kqsMesh(new THREE.TorusGeometry(.45,.06,5,14),kqsStd(0x6a9ab8,.3),0,.06,0));tr.children[1].rotation.x=Math.PI/2;kqsSnd('whoosh');
  const fl=tr.clone();kqsLob(c.P,p,fl,360,2,()=>{tr.position.copy(gY(p,0));scene.add(tr);const D=kqsDecal(p,1.3,0x9fe3ff,.06,.5);burst(gY(p,.3),0x9fe3ff,12,1,1,.4);
   kqsTrap({p,life:20,arm:.4,trig:1.4,mesh:tr,deco:D,fire:()=>{ring(p,0x9fe3ff,R*2.1,420);burst(gY(p,.5),0xdff6ff,70,R*1.4,3,.8);kqsSnd('ice');shake(.15);kqsArea(p,R,c.raw,c,{stun:c.sk.stun});
     for(let j=0;j<7;j++){const a=j/7*6.283;kqsSpike(kqsV(p.x+Math.cos(a)*R*.6,p.z+Math.sin(a)*R*.6),0x9fe3ff,1,1)}}})})},
 r_hawk(c){const t=kqsNear(14);if(!t)return false;const h=kqsHawk(0xe8c890),a=gY(pl.position,3.2);h.position.copy(a);scene.add(h);kqsSnd('beast');
  tw(440,k=>{const b=gY(t.m.position,1);h.position.lerpVectors(a,b,k);h.position.y+=Math.sin(k*Math.PI)*2;h.lookAt(b);h.userData.w.forEach((w,j)=>w.rotation.z=(j?-1:1)*Math.sin(k*30)*.6);if(Math.random()<.5)burst(h.position,0xe8c890,1,.2,.2,.3)},
   ()=>{if(!t.dead){kqsHit(t,c.raw,c);t.mark=Math.max(t.mark||0,6);t.markV=Math.max(t.markV||0,.2);dn(t.m.position,'Hunted','#fde68a',-36,900);burst(gY(t.m.position,1),0xe8c890,30,2,2,.5);sfx('crit')}const b=h.position.clone();tw(400,k=>h.position.set(b.x,b.y+k*5,b.z),()=>kqsFade(h,200))})},
 r_mine(c){const p=c.gp.clone(),R=c.R,tr=new THREE.Group();tr.add(kqsMesh(new THREE.CylinderGeometry(.24,.3,.22,8),kqsStd(0x5a3a22,.1),0,.12,0));tr.add(kqsMesh(new THREE.SphereGeometry(.09,6,4),kqsStd(0xff5a1a,1.2),0,.28,0));kqsSnd('whoosh');
  const mine=KQS.objs.filter(o=>o.kqsMine);if(mine.length>=3){const o=mine[0];o.abort=1;o.life=0}
  const fl=tr.clone();kqsLob(c.P,p,fl,360,2,()=>{tr.position.copy(gY(p,0));scene.add(tr);const D=kqsDecal(p,1.3,0xff8a3a,.05,.45);
   const o=kqsTrap({p,life:20,arm:.5,trig:1.3,mesh:tr,deco:D,blink:tr.children[1],fire:()=>{ring(p,0xff8a3a,R*2,420);ring(p,0xffd080,R*1.3,300);burst(gY(p,.6),0xff7a2a,80,R*1.4,4,.8);kqsSnd('boom');shake(.3);kqsArea(p,R,c.raw,c,{burn:1})}});o.kqsMine=1})},
 r_rapid(c){let n=0;kqsSnd('arrow');kqsChan({t:c.sk.dur,iv:.2,slow:.4,tick:()=>{if(n>=10)return;n++;const d=aimDir();face(d);launch(pl.position,d,24,{col:c.sk.col,mt:'p',arrow:1,pierce:c.s.pierce||0},c.raw,.7);try{bowAnim(170)}catch(_){}sfx('arrow')}})},
 r_roots(c){const p=c.gp.clone(),R=c.R,g=new THREE.Group(),m=kqsStd(0x4a8a2a,.25);for(let j=0;j<14;j++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R*.9,t=kqsMesh(new THREE.ConeGeometry(.12,1.1+Math.random()*.6,4),m);t.position.set(Math.cos(a)*r,0,Math.sin(a)*r);t.rotation.set((Math.random()-.5)*.8,0,(Math.random()-.5)*.8);g.add(t)}
  g.position.set(p.x,0,p.z);g.children.forEach(t=>t.position.y=GH(p.x+t.position.x,p.z+t.position.z)+.3);g.scale.set(1,.01,1);scene.add(g);kqsSnd('quake');
  setTimeout(()=>{tw(220,k=>g.scale.set(1,k,1));burst(gY(p,.3),0x6ac04a,50,R,2.5,.6);ring(p,c.sk.col,R*2,400);const L=kqsArea(p,R,c.raw,c);L.forEach(e=>eStatus(e,{root:3,poison:4},c.A*.3));shake(.12);
   kqsObj({life:3,end:()=>tw(300,k=>g.scale.set(1,1-k,1),()=>kqsRm(g))})},250)},
 r_stamp(c){const P=c.P.clone(),d=kqsDir(P,c.gp),L=Math.max(4,Math.min(c.sk.L,d2(P,c.gp)+1.5)),w=c.sk.w,n=kqsV(-d.z,d.x),B=[],hit=new Set(),S=P.clone().addScaledVector(d,-1.5);kqsSnd('beast');kqsSnd('quake');
  [-1,-.35,.35,1].forEach((o,j)=>{const b=kqsWolf(j%2?0xc8b088:0xa89070,1.25+(j%2)*.2);b.userData.o=o*w*.42;b.userData.lag=j%2?.06:0;scene.add(b);B.push(b)});const T=.85;
  kqsObj({life:T+.15,tick:(dt,now,o)=>{const k=Math.min(1,o.age/T);B.forEach(b=>{const kk=Math.max(0,k-b.userData.lag),x=S.x+d.x*kk*(L+1.5)+n.x*b.userData.o,z=S.z+d.z*kk*(L+1.5)+n.z*b.userData.o;b.position.set(x,GH(x,z),z);b.rotation.y=Math.atan2(d.x,d.z);b.userData.legs.forEach((l,i)=>l.rotation.x=Math.sin(now/40+i*1.6)*.9);if(Math.random()<.3)burst(gY(b.position,.2),0xb09a70,2,.8,1,.4)});
    const front=k*(L+1.5)-1.5;kqsLine(P,d,Math.max(0,front),w).forEach(e=>{if(hit.has(e))return;hit.add(e);kqsHit(e,c.raw,c);if(!e.boss){const s=Math.sign((e.m.position.x-P.x)*n.x+(e.m.position.z-P.z)*n.z)||1;e.vx+=d.x*7+n.x*s*6;e.vz+=d.z*7+n.z*s*6;eStatus(e,{stun:.5},0)}burst(gY(e.m.position,1),0xc8b088,14,2,2,.4);shake(.06)})},
   end:()=>B.forEach(b=>kqsFade(b,250))})},
 r_aimed(c){const glow=kqsMesh(new THREE.SphereGeometry(.16,8,6),kqsAdd(0xfff6d0));scene.add(glow);try{bowAnim(950)}catch(_){}kqsSnd('draw');
  kqsChan({t:.9,iv:.9,ti:.9,slow:.6,tick:()=>{},upd:()=>{const d=aimDir();face(d);glow.position.copy(gY(pl.position,1.3)).addScaledVector(d,.8);glow.scale.setScalar(.6+(KQS.ch?Math.min(1,KQS.ch.el/.9):1)*1.4)},
   end:cancel=>{kqsRm(glow);if(cancel)return;const d=aimDir(),o=gY(pl.position,1.1);face(d);const e=o.clone().addScaledVector(d,20);kqsSpark(o,e,0xfff6d0);kqsSpark(o,e,0xffffff);kqsBeam(o,e,0xfff6d0,.12,260);kqsSnd('snipe');shake(.15);
    kqsLine(pl.position,d,20,1.6).forEach(q=>{kqsHit(q,c.raw,c);burst(gY(q.m.position,1),0xfff6d0,16,1.6,1.5,.4)})}})},
 r_hunt(c){const P=c.P;kqsSnd('beast');kqsSnd('horn');hero.buffs.push({s:{mspd:.2,compP:.2},t:c.now+c.sk.dur*1000,n:'Wild Hunt',i:'🐾'});hsDirty();ring(P,c.sk.col,3.2,500);
  [0,1,2].forEach(j=>{const a=pl.rotation.y+Math.PI+(j-1)*.9,m=kqsWolf(j==1?0xb0e8ff:0x7ab8f0,j==1?1.15:.95);m.position.set(P.x+Math.sin(a)*1.8,0,P.z+Math.cos(a)*1.8);m.position.y=GH(m.position.x,m.position.z);burst(gY(m.position,.8),0xa0e0ff,24,1.4,2,.5);
   kqsSummon({mesh:m,life:c.sk.dur,spd:7.8,reach:1.6,iv:.75,dmg:c.raw,c,col:0xa0e0ff,wolf:1,off:j})})},
 // ===== MAGE =====
 m_blink(c){const o=c.P.clone(),tp=kqsLand(o,c.gp);burst(gY(o,1),0xa08aff,40,1.6,2,.6);ring(o,0xa08aff,2.4,300);kqsArea(o,2,c.raw,c,{proc:false});kqsTp(tp);hero.iv=Math.max(hero.iv||0,.25);kqsSpark(gY(o,1),gY(tp,1),0xc8b8ff);burst(gY(tp,1),0xc8b8ff,30,1.2,2,.5);kqsSnd('portal')},
 m_breath(c){const P=c.P,d=c.d;arc(P,d,0xff6a1a,c.R,360);arc(P,d,0xffc040,c.R*.7,280);for(let j=0;j<26;j++){const a=(Math.random()-.5)*1.3,r=1+Math.random()*c.R,co=Math.cos(a),sn=Math.sin(a),dd=kqsV(d.x*co+d.z*sn,-d.x*sn+d.z*co);burst(gY(kqsV(P.x+dd.x*r,P.z+dd.z*r),.9),j%3?0xff6a1a:0xffd060,2,.8,1.2,.5)}
  area(P,c.R,c.raw,Object.assign({},c.fx,{burn:1}),d,.75);kqsSnd('fire');shake(.1)},
 m_orb(c){const d=c.d,P=c.P,orb=kqsMesh(new THREE.IcosahedronGeometry(.36,0),kqsAdd(0xbfefff));orb.add(kqsMesh(new THREE.IcosahedronGeometry(.22,0),kqsStd(0xe8fbff,1)));orb.position.copy(gY(P,1.1)).addScaledVector(d,.8);scene.add(orb);kqsSnd('ice');let ti=.1;
  kqsObj({life:2.4,tick:(dt)=>{orb.position.addScaledVector(d,4.5*dt);orb.position.y=GH(orb.position.x,orb.position.z)+1.1;orb.rotation.x+=dt*3;orb.rotation.y+=dt*4;if(Math.random()<.6)burst(orb.position,0x9fe3ff,1,.6,.4,.4);if(solid(orb.position.x,orb.position.z))return false;
    ti-=dt;if(ti>0)return;ti=.25;const e=enemies.filter(q=>!q.dead&&d2(q.m.position,orb.position)<4).sort((a,b)=>d2(a.m.position,orb.position)-d2(b.m.position,orb.position))[0];if(!e)return;const sd=kqsDir(orb.position,e.m.position),sp=orb.position.clone().setY(orb.position.y-1);
    shots.push({m:(()=>{const m=shotMesh(0x9fe3ff,0);m.position.copy(orb.position);scene.add(m);return m})(),v:sd.clone().multiplyScalar(16),s:{col:0x9fe3ff,mt:'m'},dm:c.A*.35,t:.4,hit:new Set()});eStatus(e,{slow:1.5},0)},
   end:()=>{const p=orb.position.clone().setY(0);kqsRm(orb);ring(p,0x9fe3ff,5,380);burst(gY(p,1),0xdff6ff,60,2.5,2.5,.6);kqsArea(p,2.5,c.raw,c,{stun:.4});kqsSnd('ice')}})},
 m_rift(c){const a=c.P.clone(),b=kqsLand(a,c.gp),mk=p=>{const g=new THREE.Group(),r=kqsMesh(new THREE.TorusGeometry(.75,.1,6,22),kqsAdd(0xc06aff)),f=kqsMesh(new THREE.CircleGeometry(.72,22),kqsAdd(0x5a2a9a));f.material.opacity=.55;g.add(r,f);g.position.copy(gY(p,1.05));scene.add(g);return g};
  const A=mk(a),B=mk(b),D1=kqsDecal(a,.9,0xc06aff,.2,.8),D2=kqsDecal(b,.9,0xc06aff,.2,.8);kqsTp(b);burst(gY(a,1),0xc06aff,30,1.4,2,.5);burst(gY(b,1),0xc06aff,30,1.4,2,.5);kqsSnd('portal');let inside=1,cd=0;
  kqsObj({life:c.sk.dur,tick:(dt,now)=>{[A,B].forEach((g,j)=>{g.quaternion.copy(cam.quaternion);g.children[0].rotation.z+=dt*3;if(Math.random()<.3)burst(g.position,0xc06aff,1,.6,.4,.5)});cd-=dt;
    const da=d2(pl.position,a),db=d2(pl.position,b),near=da<.95?a:db<.95?b:null;if(!near){inside=0;return}if(inside||cd>0)return;const to=near===a?b:a;burst(gY(pl.position,1),0xc06aff,30,1.4,2,.5);kqsTp(to);inside=1;cd=.8;kqsSnd('portal');burst(gY(to,1),0xc06aff,30,1.4,2,.5)},
   end:()=>{kqsFade(A,300);kqsFade(B,300);D1.rm(300);D2.rm(300)}})},
 m_warp(c){const p=c.gp.clone(),R=c.R,D=kqsDecal(p,R,c.sk.col,.16,.8),hand=kqsDrapeM(new THREE.PlaneGeometry(.12,1,1,6),kqsDMat(0xdff6ff,.8)),hand2=kqsDrapeM(new THREE.PlaneGeometry(.18,1,1,6),kqsDMat(0xdff6ff,.8));kqsSnd('portal');
  kqsObj({life:c.sk.dur,tick:(dt,now,o)=>{const a1=o.age*3,a2=o.age*.5;[[hand,a1,.9],[hand2,a2,.6]].forEach(([h,an,len])=>kqsDrape(h,(u,v)=>{const y=(v+.5)*R*len;return [p.x+Math.sin(an)*y+Math.cos(an)*u,p.z-Math.cos(an)*y+Math.sin(an)*u]},.17));
    kqsFoes(p,R).forEach(e=>{e.ch=Math.max(e.ch||0,.4);e.cd=(e.cd||0)+dt*.6;if(e.atk&&e.atk.t!=null)e.atk.t+=dt*.5;if(Math.random()<.05)burst(gY(e.m.position,1.2),0x8ad8ff,2,.4,.4,.6)});
    if(d2(pl.position,p)<R){for(const k in hero.cd)hero.cd[k]=Math.max(0,hero.cd[k]-dt*.5);if(Math.random()<.2)burst(gY(pl.position,1.4),0x8ad8ff,1,.3,.5,.6)}},end:()=>{D.rm(400);kqsFade(hand,300);kqsFade(hand2,300)}})},
 m_disint(c){kqsSnd('beam');let ti=0;kqsChan({t:c.sk.dur,iv:.2,slow:.6,tick:()=>{const d=aimDir();face(d);const o=gY(pl.position,1.15).addScaledVector(d,.6),e=o.clone().addScaledVector(d,10);kqsBeam(o,e,0xc890ff,.18,210);kqsBeam(o,e,0xffffff,.06,210);burst(e,0xc890ff,4,.8,.6,.3);
    kqsLine(pl.position,d,10,1.3).forEach(q=>{kqsHit(q,c.raw,c,{proc:false});burst(gY(q.m.position,1),0xc890ff,4,1,1,.3)});if(Math.random()<.4)kqsPose('cast',220)}})},
 m_wall(c){const p=c.gp.clone(),d=kqsDir(c.P,p),n=kqsV(-d.z,d.x),L=c.sk.L,w=c.sk.w,strip=kqsDrapeM(new THREE.PlaneGeometry(w,L,1,14),kqsDMat(0xff6a1a,.45));kqsDrape(strip,(u,v)=>[p.x+n.x*v+d.x*u,p.z+n.z*v+d.z*u],.15);
  const F=[],fm=kqsAdd(0xff5a10);fm.opacity=.55;for(let j=0;j<12;j++){const t=kqsMesh(new THREE.ConeGeometry(.26,1.5,5),fm);t.userData.kqsKeep=1;const y=(j/11-.5)*L;t.position.set(p.x+n.x*y,0,p.z+n.z*y);t.position.y=GH(t.position.x,t.position.z)+.7;scene.add(t);F.push(t)}kqsSnd('fire');let ti=0;
  kqsObj({life:c.sk.dur,tick:(dt,now)=>{F.forEach((t,j)=>{const s=.8+Math.sin(now/90+j*1.7)*.25;t.scale.set(1,s+.4,1)});for(let k=0;k<3;k++){const y=(Math.random()-.5)*L;burst(gY(kqsV(p.x+n.x*y,p.z+n.z*y),.4+Math.random()),Math.random()<.5?0xff6a1a:0xffd060,1,.3,2,.5)}
    ti-=dt;if(ti>0)return;ti=.4;kqsLine(kqsV(p.x-n.x*L/2,p.z-n.z*L/2),n,L,w+.4).forEach(e=>{kqsHit(e,c.raw,c,{proc:false});eStatus(e,{burn:3},c.A*.3)})},end:()=>{kqsFade(strip,400);F.forEach(t=>kqsRm(t));fm.dispose()}})},
 m_rewind(c){const now=c.now,h=KQS.hist;let q=null;for(let j=0;j<h.length;j++){if(now-h[j].t>=3800){q=h[j]}}if(!q)q=h[0];if(!q||now-q.t<900){say('Nothing to rewind to yet.');return false}
  const o=pl.position.clone();ring(o,c.sk.col,2.6,400);burst(gY(o,1),0x9ad8ff,40,1.6,2,.6);kqsTp(kqsV(q.x,q.z));hero.hp=Math.min(heroMax(),Math.max(hero.hp,q.hp));hero.mp=Math.min(mpMax(),Math.max(hero.mp,q.mp));pl.slow=0;
  ring(pl.position,c.sk.col,3,500);burst(gY(pl.position,1),0xdff6ff,50,1.8,2.5,.7);popT(pl.position,'⌛ REWIND','#bae6fd',true);kqsSnd('rewind');hero.iv=Math.max(hero.iv||0,.4)},
 m_sing(c){const p=c.gp.clone(),R=c.R,core=kqsMesh(new THREE.SphereGeometry(.6,14,10),new THREE.MeshBasicMaterial({color:0x000000})),hal=kqsMesh(new THREE.RingGeometry(.65,1.3,28),kqsAdd(0x8a4aff)),D=kqsDecal(p,R,0x8a4aff,.14,.8);core.position.copy(gY(p,1.2));hal.position.copy(core.position);scene.add(core,hal);kqsSnd('portal');let ti=0;
  kqsObj({life:c.sk.dur,tick:(dt,now,o)=>{const k=o.age/c.sk.dur;core.scale.setScalar(.6+k*.9);hal.quaternion.copy(cam.quaternion);hal.rotation.z=now/120;hal.scale.setScalar(1+k);for(let j=0;j<3;j++){const a=Math.random()*6.283,r=R*(.5+Math.random()*.5);burst(gY(kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),.6),0xb08aff,1,.2,.2,.5)}
    kqsFoes(p,R+1).forEach(e=>{if(e.boss)return;const v=kqsV(p.x-e.m.position.x,p.z-e.m.position.z),L=v.length();if(L>.6)walkM(e.m,v.x/L*Math.min(L,3.6*dt),v.z/L*Math.min(L,3.6*dt));e.vx=e.vz=0});ti-=dt;if(ti>0)return;ti=.25;kqsArea(p,R,c.raw,c,{proc:false})},
   end:o=>{kqsRm(core);kqsFade(hal,200);D.rm(300);if(o.abort)return;ring(p,0xb08aff,R*2,420);ring(p,0xffffff,R*1.2,300);burst(gY(p,1),0xb08aff,80,R*1.2,3,.7);kqsArea(p,R*.7,c.A*2.5,c,{stun:.6});shake(.3);kqsSnd('boom')}})},
 m_comets(c){const p=c.gp.clone(),R=c.R,E=[[0xff7a2a,{burn:1}],[0x9fe3ff,{stun:.5}],[0xfff06a,{}]];kqsSnd('fire');const D=kqsDecal(p,R,c.sk.col,.06,.55);
  for(let j=0;j<8;j++)setTimeout(()=>{const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R*.85,q=kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),[col,x]=E[j%3],m=kqsMesh(new THREE.IcosahedronGeometry(.45,0),kqsAdd(col));const s=gY(q,14).add(kqsV(-3,-2));m.position.copy(s);scene.add(m);
    kqsWarn(q,2,col,.45,()=>{});tw(450,k=>{m.position.lerpVectors(s,gY(q,.3),k);burst(m.position,col,2,.4,.3,.4)},()=>{kqsRm(m);ring(q,col,4,320);burst(gY(q,.4),col,40,2,3,.6);kqsArea(q,2,c.raw,c,x);if(j%3==2)kqsFoes(q,2).forEach(e=>kqsSpark(gY(q,4),gY(e.m.position,1),col));shake(.12);sfx(j%3==2?'zap':'boom',.5)})},j*300);
  setTimeout(()=>D.rm(400),2900)}
};
// small shared visuals
// melee single-target abilities step in when the enemy is a little out of reach; returns the extra delay (ms)
function kqsLunge(t){const d=kqsDir(pl.position,t.m.position),L=d2(pl.position,t.m.position)-1.5-(t.boss?1.2:0);face(d);if(L<=.25)return 0;const T=L/16;hero.dash={x:d.x,z:d.z,t:T};hero.iv=Math.max(hero.iv||0,T*.5);return Math.round(T*1000)}
function kqsSpike(p,col,h,ice){const m=kqsMesh(new THREE.ConeGeometry(.28,h||1,5),ice?kqsStd(col,.6,.85):kqsStd(col,.08));m.position.copy(gY(p,-(h||1)/2));scene.add(m);const y0=m.position.y;tw(140,k=>m.position.y=y0+k*(h||1)*.9,()=>setTimeout(()=>tw(380,k=>m.position.y=y0+(1-k)*(h||1)*.9,()=>kqsRm(m)),450))}
function kqsChain(a,b,col,ms){const n=Math.max(3,Math.round(a.distanceTo(b)/.35)),g=new THREE.Group(),m=kqsStd(col,.25);for(let j=0;j<n;j++){const l=kqsMesh(new THREE.TorusGeometry(.1,.03,4,8),m);l.position.lerpVectors(a,b,j/(n-1));l.rotation.y=j%2?Math.PI/2:0;l.lookAt(b);if(j%2)l.rotateZ(Math.PI/2);g.add(l)}scene.add(g);setTimeout(()=>kqsFade(g,200),ms||250)}
function kqsBeam(a,b,col,w,ms){const L=a.distanceTo(b),m=kqsMesh(new THREE.CylinderGeometry(w,w,L,6,1,true),kqsAdd(col));m.position.lerpVectors(a,b,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());scene.add(m);tw(ms||200,k=>{m.material.opacity=.9*(1-k)},()=>kqsRm(m))}
function kqsPose(p,ms){try{const T=kqsPoseT(p);if(T&&T[0]&&typeof haPlay=='function'){haPlay(ms||T[1],T[0],2,null,.15)}}catch(_){}}
// traps: arm, then fire when an enemy steps within `trig`
function kqsTrap(t){let armed=0;return kqsObj({life:t.life,tick:(dt,now,o)=>{if(t.blink)t.blink.material.emissiveIntensity=.6+Math.sin(now/(armed?120:60))*.6;if(o.age<t.arm)return;armed=1;if(kqsFoes(t.p,t.trig).length){t.fire();return false}},end:()=>{kqsFade(t.mesh,250);if(t.deco)t.deco.rm(250)}})}
// summons: chase the nearest enemy near the hero, strike every `iv` seconds
function kqsSummon(S){scene.add(S.mesh);S.ti=.3;S.tgt=null;const m=S.mesh;
  return kqsObj({life:S.life,tick:(dt,now,o)=>{const P=pl.position;if(!S.tgt||S.tgt.dead||d2(S.tgt.m.position,P)>16)S.tgt=enemies.filter(e=>!e.dead&&d2(e.m.position,P)<13&&(e.agg||d2(e.m.position,P)<7)).sort((a,b)=>d2(a.m.position,m.position)-d2(b.m.position,m.position))[0]||null;
    let goal=S.tgt?S.tgt.m.position:kqsV(P.x-Math.sin(pl.rotation.y+(S.off||0))*1.8,P.z-Math.cos(pl.rotation.y+(S.off||0))*1.8),L=d2(goal,m.position),mv=0;const reach=S.tgt?S.reach+(S.tgt.boss?1.2:0):.6;
    if(d2(m.position,P)>22){m.position.set(P.x,0,P.z)}
    if(L>reach){const v=kqsV(goal.x-m.position.x,goal.z-m.position.z).normalize(),sp=Math.min(L-reach+.05,S.spd*dt*(S.tgt?1:Math.min(1.4,L/2)));walk(m,v.x*sp,v.z*sp);m.rotation.y=Math.atan2(v.x,v.z);mv=1}
    else if(S.tgt){const v=kqsV(goal.x-m.position.x,goal.z-m.position.z);m.rotation.y=Math.atan2(v.x,v.z)}
    m.position.y=inRealm?0:GH(m.position.x,m.position.z);
    if(S.wolf){(m.userData.legs||[]).forEach((l,i)=>l.rotation.x=mv?Math.sin(now/70+(i%2?0:Math.PI)+(i>1?1.2:0))*.8:0);if(m.userData.tail)m.userData.tail.rotation.x=-2.1+Math.sin(now/120)*.25}
    if(S.hum)m.children.forEach((q,i)=>{if(i>3&&i<8)q.rotation.x=-.6+(mv?Math.sin(now/90+i)*.4:0)});
    if(Math.random()<.25)burst(gY(m.position,.8),S.col,1,.3,.5,.5);
    S.ti-=dt;if(S.tgt&&L<=reach+.15&&S.ti<=0){S.ti=S.iv;const e=S.tgt;heroHit(e,S.dmg,S.c.mt,{s:{col:S.col},proc:false,kqsSum:1});burst(gY(e.m.position,.9),S.col,10,1.4,1.5,.3);const b0=m.position.clone(),v=kqsDir(b0,e.m.position);tw(160,k=>{const q=Math.sin(k*Math.PI)*.5;m.position.x=b0.x+v.x*q;m.position.z=b0.z+v.z*q})}},
   end:()=>{burst(gY(m.position,.8),S.col,24,1.4,2,.5);kqsFade(m,300)}})}
// stealth look: the hero turns translucent
function kqsStealthVis(on){try{pl.traverse(o=>{if(!o.material)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(q=>{if(on){if(q.userData.kqsOp==null)q.userData.kqsOp=[q.transparent,q.opacity];q.transparent=true;q.opacity=Math.min(q.opacity,.28);q.needsUpdate=true}
  else if(q.userData.kqsOp){q.transparent=q.userData.kqsOp[0];q.opacity=q.userData.kqsOp[1];q.userData.kqsOp=null;q.needsUpdate=true}})})}catch(_){}}
{const f=heroHit;heroHit=function(e,raw,mt,o){if(KQS.stealth&&e&&!e.dead&&!(o&&o.kqsSum)){const now=performance.now();if(KQS.stealth>now){o=Object.assign({},o||{},{crit:true});raw*=1.5;try{popT(e.m.position,'AMBUSH!','#c4b5fd',true)}catch(_){}}KQS.stealth=0;kqsUnbuff('Vanish');hero.buffs=hero.buffs.filter(b=>b.n!='Vanish');hsDirty();kqsStealthVis(false)}return f.call(this,e,raw,mt,o)}}
{const f=seeTg;seeTg=function(a,b){if(KQS.stealth>performance.now()&&b&&Math.abs(b.x-pl.position.x)<.01&&Math.abs(b.z-pl.position.z)<.01)return false;return f.apply(this,arguments)}}
{const f=down;down=function(){if(KQS.unbrk>performance.now()){hero.hp=1;dn(pl.position,'🗿 Unbreakable','#d6d3d1',-20,700);return}return f.apply(this,arguments)}}

// ---------------- sounds (Web Audio, same bus as sfx) ----------------
function kqsSnd(k){try{if(SET.sfx===false||SET.sfxV!=null&&!(+SET.sfxV>0))return;const a=AUD;if(!a||a.state!='running'||!a.out)return;const t=a.currentTime;
  const tone=(ty,f,at,dur,v,f1)=>{const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.setValueAtTime(f,t+at);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+at+dur);g.gain.setValueAtTime(0,t+at);g.gain.linearRampToValueAtTime(v,t+at+.008);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);o.connect(g);g.connect(a.out);o.start(t+at);o.stop(t+at+dur+.05)};
  const nz=(ft,f0,f1,at,dur,v,q)=>{if(!NOISE)return;const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NOISE;f.type=ft;f.Q.value=q||.8;f.frequency.setValueAtTime(f0,t+at);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+at+dur);
    g.gain.setValueAtTime(0,t+at);g.gain.linearRampToValueAtTime(v,t+at+dur*.2);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);s.connect(f);f.connect(g);g.connect(a.out);s.start(t+at,Math.random()*.5);s.stop(t+at+dur+.05)};
  ({shout:()=>{tone('sawtooth',150,0,.5,.12,90);tone('sawtooth',225,0,.45,.07,130);nz('bandpass',700,300,0,.5,.25,1.5)},
    charge:()=>{nz('lowpass',600,150,0,.5,.35);[0,.11,.22,.33].forEach(at=>tone('sine',90,at,.09,.25,55))},
    thud:()=>{tone('sine',110,0,.35,.5,38);nz('lowpass',1200,150,0,.25,.4)},
    quake:()=>{nz('lowpass',300,60,0,.9,.45);tone('sine',60,0,.8,.35,30)},
    boom:()=>{tone('sine',95,0,.6,.55,32);nz('lowpass',1600,90,0,.55,.5)},
    horn:()=>{tone('sawtooth',196,0,.7,.08,190);tone('sawtooth',294,.05,.7,.06,290)},
    chain:()=>{[0,.05,.1,.16,.22].forEach(at=>{tone('square',1800+Math.random()*900,at,.05,.04);nz('highpass',4000,6000,at,.05,.06)})},
    holy:()=>{[523,659,784,1047].forEach((f,i)=>tone('sine',f,i*.04,1.1,.07));nz('highpass',5000,8000,0,.6,.04)},
    bell:()=>{tone('sine',880,0,1.2,.1);tone('sine',1320,0,.9,.05);tone('sine',2200,0,.5,.03)},
    whoosh:()=>nz('bandpass',500,2600,0,.28,.3,1.2),
    poison:()=>{[0,.08,.17,.27].forEach(at=>tone('sine',300+Math.random()*200,at,.12,.06,700));nz('bandpass',900,400,0,.4,.12,2)},
    shadow:()=>{tone('sine',220,0,.5,.12,80);nz('bandpass',1200,300,0,.45,.18,2)},
    beast:()=>{tone('sawtooth',260,0,.25,.06,520);tone('sawtooth',520,.2,.6,.05,300);nz('bandpass',800,1600,.18,.5,.1,2)},
    arrow:()=>nz('highpass',3000,1500,0,.12,.2),
    draw:()=>{tone('triangle',180,0,.9,.05,420);nz('bandpass',600,1500,0,.9,.06,4)},
    snipe:()=>{nz('highpass',5000,1500,0,.25,.35);tone('sine',1200,0,.2,.15,300);tone('sine',90,0,.3,.3,40)},
    ice:()=>{[1760,2349,2637,3136].forEach((f,i)=>tone('triangle',f,i*.03,.35,.05));nz('highpass',6000,9000,0,.3,.1)},
    fire:()=>{nz('lowpass',1800,300,0,.7,.35);tone('sawtooth',110,0,.5,.05,70)},
    portal:()=>{tone('sine',300,0,.6,.12,1200);tone('triangle',600,.04,.6,.05,2000);nz('bandpass',800,4000,0,.5,.1,3)},
    rewind:()=>{tone('sine',1400,0,.7,.1,300);tone('sine',700,.1,.6,.06,150);[0,.1,.2,.3,.4].forEach(at=>tone('square',2400,at,.03,.03))},
    beam:()=>{tone('sawtooth',220,0,2.3,.05,240);tone('sine',880,0,2.3,.05,900);nz('bandpass',1500,1800,0,2.3,.05,6)},
    tick:()=>tone('triangle',1500,0,.04,.05,1200)})[k]?.()}catch(_){}}

// ---------------- casting ----------------
function kqsPoseT(p){if(typeof ATK=='undefined')return null;return ({cast:[ATK.cast,340],raise:[ATK.raise,420],nova:[ATK.nova,420],flex:[ATK.flex,420],leap:[ATK.leap,440],dash:[ATK.dash,260],point:[ATK.point,360],spin:[ATK.spin,380],
  great1:[ATK.great&&ATK.great[1],360],slam:[ATK.hammer&&ATK.hammer[2],420],thrust:[ATK.thrust,300],throw:[ATK.knives,340]})[p]||null}
{const f=castAnim;castAnim=function(){const sk=typeof ATK_SK!='undefined'?ATK_SK:null,p=sk&&sk.pose;if(!p)return f.apply(this,arguments);
  try{if(typeof atkMpSig=='function')atkMpSig();else if(typeof MP!='undefined'&&MP)MP.sw=(MP.sw+1)%1000;if(p=='bow'){bowAnim(sk.pms||420);return}const T=kqsPoseT(p);if(!T||!T[0])return f.apply(this,arguments);
    haPlay(sk.pms||T[1],T[0],2,null,.15);if(p=='leap'&&HA.cur)HA.cur.legFull=1}catch(err){return f.apply(this,arguments)}}}
// new abilities run here; old kinds go through the old cast_base
{const f=cast_base;cast_base=function(i){const sk=heroSkills()[i];if(!sk||sk.k!='x'||!sk.x)return f.apply(this,arguments);
  if(!party.length||hero.chan||KQS.ch)return;
  if(hero.lvl<sk.lv){if(performance.now()-(hero.nmT||0)>900){hero.nmT=performance.now();say(sk.i+' '+sk.n+' unlocks at level '+sk.lv+'.')}return}
  const key='s'+i;if((hero.cd[key]||0)>0)return;const s=HS();
  if(hero.mp<sk.mp){if(performance.now()-(hero.nmT||0)>1200){hero.nmT=performance.now();say('Not enough mana.')}return}
  const H=KQH[sk.x];if(!H)return;
  hero.mp-=sk.mp;hero.cd[key]=Math.random()<s.echo?.6:sk.cd*(1-Math.min(.5,s.cdr));
  const gp=sk.gt?(KQS.gp?KQS.gp.clone():kqsDefPt(sk)):null,d=gp&&d2(gp,pl.position)>.3?kqsDir(pl.position,gp):aimDir();face(d);
  const mt=sk.mt||CLS[hero.cls].mt,A=atkOf(mt)*(1+s.skillP),cr=KQS.cr0||0;
  const c={sk,i,key,s,P:pl.position,d,mt,A,raw:A*(sk.m||0),R:(sk.r||0)*(1+s.aoeP),now:performance.now(),gp,fx:{mt,col:sk.col,stun:sk.stun,burn:sk.burn},cr,pips:Math.min(5,Math.floor(cr/20))};
  let ok;const prev=typeof ATK_SK!='undefined'?ATK_SK:null;try{ATK_SK=sk;castAnim()}catch(_){}finally{ATK_SK=prev}
  try{ok=H(c)}catch(err){console.error('ability '+sk.n,err);ok=true}
  if(ok===false){hero.cd[key]=0;hero.mp+=sk.mp;if(performance.now()-(hero.nmT||0)>900){hero.nmT=performance.now();say('No target in reach.')}}
  hud();return ok}}
function kqsCan(sk,i,msg){if(!sk||!party.length||hero.chan||KQS.ch)return false;const t=performance.now();
  if(hero.lvl<sk.lv){if(msg&&t-(hero.nmT||0)>900){hero.nmT=t;say(sk.i+' '+sk.n+' unlocks at level '+sk.lv+'.')}return false}
  if((hero.cd['s'+i]||0)>0)return false;if(hero.mp<sk.mp){if(msg&&t-(hero.nmT||0)>1200){hero.nmT=t;say('Not enough mana.')}return false}return true}
// outermost cast: ground targeting + class-resource spenders (the resource is taken before the empower check in t_combat's cast)
{const f=cast;cast=function(i){i=+i;const sk=heroSkills()[i];
  if(KQS.ch&&!KQS.fire)return;
  if(!sk){if(KQS.tg&&!KQS.fire)kqsTgEnd();return f.apply(this,arguments)}
  if(sk.gt&&!KQS.fire){if(KQS.tg&&KQS.tg.i===i)return kqsTgFire();if(!kqsCan(sk,i,true))return;kqsTgStart(i,sk);return}
  if(KQS.tg&&!KQS.fire)kqsTgEnd();
  const cr0=hero.cr||0,cd0=hero.cd['s'+i]||0;KQS.cr0=sk.spend?cr0:0;if(sk.spend)hero.cr=0;let r;
  try{r=f.apply(this,arguments)}finally{if(sk.spend){if(!((hero.cd['s'+i]||0)>cd0))hero.cr=cr0;try{resUI()}catch(_){}}KQS.cr0=0}return r}}
{const f=aimPoint;aimPoint=function(maxD){if(KQS.gp){const v=kqsV(KQS.gp.x-pl.position.x,KQS.gp.z-pl.position.z),L=v.length();if(L>maxD)v.multiplyScalar(maxD/L);return kqsV(pl.position.x+v.x,pl.position.z+v.z)}return f.apply(this,arguments)}}
{const f=aimDir;aimDir=function(){if(KQS.gp&&d2(KQS.gp,pl.position)>.3)return kqsDir(pl.position,KQS.gp);return f.apply(this,arguments)}}

// ---------------- ground targeting ----------------
function kqsRng(sk){return sk.rng||10}
function kqsPick(cx,cy){try{const r=gl.getBoundingClientRect();if(!r.width)return null;const nd=new THREE.Vector2((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1);KQS.rc=KQS.rc||new THREE.Raycaster();cam.updateMatrixWorld();KQS.rc.setFromCamera(nd,cam);
  const o=KQS.rc.ray.origin,dv=KQS.rc.ray.direction;if(dv.y>-1e-3)return null;let h=pl.position.y,p=null;for(let k=0;k<4;k++){const t=(h-o.y)/dv.y;if(t<0)return null;p=kqsV(o.x+dv.x*t,o.z+dv.z*t);h=inRealm?0:GH(p.x,p.z)}return p}catch(_){return null}}
function kqsClamp(sk,p){const P=pl.position,R=kqsRng(sk);const v=kqsV(p.x-P.x,p.z-P.z),L=v.length();if(L>R)v.multiplyScalar(R/L);let q=kqsV(P.x+v.x,P.z+v.z);if(sk.land)q=kqsLand(P,q);return q}
function kqsDefPt(sk){const P=pl.position,R=kqsRng(sk);let p=null;if(tgt&&!tgt.dead&&d2(tgt.m.position,P)<R+1)p=tgt.m.position.clone();else if(KQS.mIn&&KQS.mx!=null)p=kqsPick(KQS.mx,KQS.my);
  if(!p){const f=kqsV(Math.sin(pl.rotation.y),Math.cos(pl.rotation.y));p=kqsV(P.x+f.x*Math.min(6,R),P.z+f.z*Math.min(6,R))}return kqsClamp(sk,p)}
function kqsRetBuild(sk){kqsRetHide();const col=sk.col||0xffffff,M={sk,rng:kqsDrapeRing(.975,72,col,.55),cen:kqsDrapeM(new THREE.RingGeometry(.12,.22,16,1),kqsDMat(0xffffff,.9,false),31)};
  if(sk.sh=='line'||sk.sh=='wall'){M.fill=kqsDrapeM(new THREE.PlaneGeometry(1,1,2,16),kqsDMat(col,.24,false),30);M.edge=kqsDrapeM(kqsFrameGeo(),kqsDMat(col,.9,false),31)}
  else if(sk.sh=='cone'){M.fill=kqsDrapeM(new THREE.RingGeometry(.001,1,20,3,-.75,1.5),kqsDMat(col,.24,false),30)}
  else{M.fill=kqsDrapeM(new THREE.RingGeometry(.001,1,40,3),kqsDMat(col,.2,false),30);M.edge=kqsDrapeM(new THREE.RingGeometry(.92,1,48,1),kqsDMat(col,.95,false),31)}
  KQS.ret=M;return M}
function kqsDrapeRing(r0,seg,col,op){return kqsDrapeM(new THREE.RingGeometry(r0,1,seg,1),kqsDMat(col,op,false),29)}
// the outline of a line/wall reticle: the two long edges and both ends as thin strips (unit square, centered)
function kqsFrameGeo(){const s=new THREE.BufferGeometry(),pts=[],q=(x0,y0,x1,y1)=>pts.push(x0,y0,0,x1,y0,0,x1,y1,0,x0,y0,0,x1,y1,0,x0,y1,0);const add=(x0,x1)=>{for(let j=0;j<16;j++){const y0=-.5+j/16,y1=-.5+(j+1)/16;pts.push(x0,y0,0,x1,y0,0,x1,y1,0,x0,y0,0,x1,y1,0,x0,y1,0)}};add(-.5,-.44);add(.44,.5);q(-.5,-.5,.5,-.48);q(-.5,.48,.5,.5);
  s.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));return s}
function kqsRetHide(){const M=KQS.ret;if(!M)return;['rng','cen','fill','edge'].forEach(k=>{if(M[k])kqsRm(M[k])});KQS.ret=null}
function kqsRetUpd(now){const T=KQS.tg;if(!T)return;const sk=T.sk,P=pl.position;
  if(KQS.touch==null&&KQS.mIn&&KQS.mx!=null){const p=kqsPick(KQS.mx,KQS.my);if(p)T.p=kqsClamp(sk,p);else T.p=kqsClamp(sk,T.p)}else T.p=kqsClamp(sk,T.p);
  const M=KQS.ret||kqsRetBuild(sk),R=kqsRng(sk),p=T.p,pul=.75+Math.sin(now/140)*.25;
  kqsDrape(M.rng,(u,v)=>[P.x+u*R,P.z-v*R],.18);kqsDrape(M.cen,(u,v)=>[p.x+u,p.z-v],.2);
  const r=(sk.r||1)*(1+HS().aoeP);
  if(sk.sh=='line'){const d=kqsDir(P,p),n=kqsV(-d.z,d.x),L=Math.max(3,Math.min(sk.L||R,d2(P,p)+(sk.x=='r_stamp'?1.5:0))),w=sk.w||2,fn=(u,v)=>{const y=(v+.5)*L,x=u*w;return [P.x+d.x*y+n.x*x,P.z+d.z*y+n.z*x]};kqsDrape(M.fill,fn,.17);kqsDrape(M.edge,fn,.18)}
  else if(sk.sh=='wall'){const d=kqsDir(P,p),n=kqsV(-d.z,d.x),L=sk.L||7,w=(sk.w||1.4),fn=(u,v)=>{const y=v*L,x=u*w;return [p.x+n.x*y+d.x*x,p.z+n.z*y+d.z*x]};kqsDrape(M.fill,fn,.17);kqsDrape(M.edge,fn,.18)}
  else if(sk.sh=='cone'){const d=kqsDir(P,p),n=kqsV(-d.z,d.x);kqsDrape(M.fill,(u,v)=>[P.x+(u*d.x+v*n.x)*r,P.z+(u*d.z+v*n.z)*r],.17)}
  else{const fn=(u,v)=>[p.x+u*r,p.z-v*r];kqsDrape(M.fill,fn,.17);kqsDrape(M.edge,fn,.18)}
  if(M.edge)M.edge.material.opacity=.95*pul;M.fill.material.opacity=.16+.1*pul;
  if(!pl.sw&&!(pl.mvd&&now-pl.mvd.t<120)&&d2(p,P)>.4){const d=kqsDir(P,p);pl.rotation.y=Math.atan2(d.x,d.z)}}
function kqsTgStart(i,sk){kqsTgEnd();KQS.tg={i,sk,p:kqsDefPt(sk),t0:performance.now()};kqsRetBuild(sk);const b=$('kqsTg');if(b){b.querySelector('.kqs-tgn').innerHTML=sk.i+' <b>'+sk.n+'</b>';b.classList.remove('hide')}kqsSnd('tick');try{hud()}catch(_){}}
function kqsTgEnd(){if(!KQS.tg&&!KQS.ret)return;KQS.tg=null;KQS.touch=null;kqsRetHide();const b=$('kqsTg');if(b)b.classList.add('hide');try{hud()}catch(_){}}
function kqsTgFire(){const T=KQS.tg;if(!T)return;try{kqsRetUpd(performance.now())}catch(_){}const p=T.p.clone();kqsTgEnd();KQS.gp=p;KQS.fire=1;let r;try{r=cast(T.i)}finally{KQS.gp=null;KQS.fire=0}return r}
{const b=document.createElement('div');b.id='kqsTg';b.className='glass kqs-tg hide';b.innerHTML='<span class="kqs-tgn"></span><span class="kqs-tgh">Click the ground to cast · Esc or right-click to cancel</span><button class="kqs-tgx" title="Cancel">✕</button>';($('stage')||document.body).appendChild(b);
  b.querySelector('.kqs-tgx').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();kqsTgEnd()})}
addEventListener('pointermove',e=>{if(e.pointerType=='mouse'||!e.pointerType){KQS.mx=e.clientX;KQS.my=e.clientY;KQS.mIn=kqsOnGl(e.target)}
  if(KQS.tg&&KQS.touch!=null&&e.pointerId===KQS.touch){const p=kqsPick(e.clientX,e.clientY);if(p)KQS.tg.p=kqsClamp(KQS.tg.sk,p);e.stopImmediatePropagation()}},true);
function kqsOnGl(t){return !!t&&(t===gl||gl.contains(t))}
addEventListener('pointerdown',e=>{if(!KQS.tg||!kqsOnGl(e.target))return;if(e.button==2){kqsTgEnd();return}if(e.button!==0&&e.pointerType=='mouse')return;e.stopImmediatePropagation();e.preventDefault();
  if(e.pointerType&&e.pointerType!='mouse'){KQS.touch=e.pointerId;const p=kqsPick(e.clientX,e.clientY);if(p)KQS.tg.p=kqsClamp(KQS.tg.sk,p);return}
  KQS.mx=e.clientX;KQS.my=e.clientY;KQS.mIn=true;KQS.eat=1;kqsTgFire()},true);
addEventListener('pointerup',e=>{if(KQS.touch!=null&&e.pointerId===KQS.touch){KQS.touch=null;e.stopImmediatePropagation();if(KQS.tg){const p=kqsPick(e.clientX,e.clientY);if(p)KQS.tg.p=kqsClamp(KQS.tg.sk,p);kqsTgFire()}}if(e.button==0)setTimeout(()=>KQS.eat=0,0)},true);
addEventListener('mousedown',e=>{if(KQS.eat&&e.button==0)e.stopImmediatePropagation()},true);
addEventListener('keydown',e=>{if(e.key=='Escape'&&KQS.tg){kqsTgEnd();e.stopImmediatePropagation();e.preventDefault()}},true);
gl.addEventListener('pointerleave',()=>{KQS.mIn=false});

// ---------------- per-frame: reticle, channel, lasting effects, history ----------------
function kqsClear(){kqsTgEnd();if(KQS.ch)kqsChanEnd(true);KQS.objs.splice(0).forEach(o=>{o.abort=1;try{o.end&&o.end(o)}catch(_){}});KQS.stealth=0;KQS.unbrk=0;KQS.hist=[];kqsStealthVis(false)}
function kqsTick(dt,now){
  if(KQS.tg){if(!party.length||building||uiOpen()||hero.chan)kqsTgEnd();else kqsRetUpd(now)}
  if(dt<=0)return;
  for(const n in KQS.cdn){KQS.cdn[n]-=dt;if(KQS.cdn[n]<=0)delete KQS.cdn[n]}
  const C=KQS.ch;if(C){C.t-=dt;C.el+=dt;C.ti-=dt;if(C.upd)C.upd(dt,now);if(C.ti<=0){C.ti+=C.iv;try{C.tick(C)}catch(err){console.error(err)}}if(C.t<=0)kqsChanEnd(false)}
  for(let i=KQS.objs.length-1;i>=0;i--){const o=KQS.objs[i];if(!o)continue;o.age+=dt;let keep=true;try{if(o.tick)keep=o.tick(dt,now,o)!==false}catch(err){console.error('ability fx',err);keep=false}
    if(!keep||o.age>=o.life){const j=KQS.objs.indexOf(o);if(j>=0)KQS.objs.splice(j,1);try{o.end&&o.end(o)}catch(err){console.error(err)}}}
  if(KQS.stealth){if(KQS.stealth<now){KQS.stealth=0;kqsStealthVis(false)}else{enemies.forEach(e=>{if(!e.dead&&!e.boss&&e.agg&&!e.wv&&d2(e.m.position,pl.position)<30){e.agg=0;if(e.atk)mCancel(e)}});if(Math.random()<.3)burst(gY(pl.position,.6),0x3a2a4a,1,.4,.6,.6)}}
  KQS.histT-=dt;if(KQS.histT<=0){KQS.histT=.1;KQS.hist.push({t:now,x:pl.position.x,z:pl.position.z,hp:hero.hp,mp:hero.mp});while(KQS.hist.length&&now-KQS.hist[0].t>4600)KQS.hist.shift()}}
{const f=heroTick;heroTick=function(dt,now){const r=f.apply(this,arguments);try{kqsTick(dt,now)}catch(err){console.error(err)}return r}}

// ---------------- HUD: empty slots, aiming highlight, ability-point chip ----------------
{const f=hud;hud=function(){f.apply(this,arguments);try{const A=$('acts');if(!A||building||!party.length)return;const L=heroSkills();
  if(L.length<KQS_SLOTS){const btns=[...A.querySelectorAll('button[data-x]')],sk=btns.filter(b=>/^\d+$/.test(b.dataset.x)),after=sk[sk.length-1]||btns.find(b=>b.dataset.x=='a');
    let h='';for(let i=L.length;i<KQS_SLOTS;i++)h+=`<button class="hs kqs-empty" data-x="E${i}" title="Empty ability slot — open Abilities (K)"><span class="ic">＋</span><span class="kb">${i+1}</span><span class="sb">empty</span><span class="cdv" style="height:0"></span></button>`;
    if(after)after.insertAdjacentHTML('afterend',h)}
  if(KQS.tg){const b=A.querySelector('button[data-x="'+KQS.tg.i+'"]');if(b)b.classList.add('kqs-aim')}
  L.forEach((s,i)=>{if(s.gt){const b=A.querySelector('button[data-x="'+i+'"]');if(b)b.classList.add('kqs-gt')}});
  const ap=apFree(),B=$('buffs');if(B&&ap>0)B.insertAdjacentHTML('afterbegin',`<span class="bf kqs-apn" data-kqsopen="1" title="Spend ability points (K → Abilities)">⚡ ${ap} ability point${ap>1?'s':''} · K</span>`)}catch(err){}}}
$('acts').addEventListener('pointerdown',e=>{const b=e.target.closest('.kqs-empty');if(!b)return;e.preventDefault();e.stopImmediatePropagation();openAbil()},true);
document.addEventListener('click',e=>{const t=e.target.closest('[data-kqsopen]');if(!t)return;e.preventDefault();if(!$('tal').classList.contains('hide'))$('tal').classList.add('hide');if($('sysmenu'))$('sysmenu').classList.add('hide');if(xwMode!='abil'||$('xw').classList.contains('hide'))openAbil()});

// ---------------- the Abilities window (#xw, mode 'abil') ----------------
function openAbil(){if(!party.length)return;if(!$('tal').classList.contains('hide'))$('tal').classList.add('hide');if(!$('xw').classList.contains('hide')&&xwMode=='abil')return closeX();if(uiOpen()&&$('xw').classList.contains('hide'))return;kqsTgEnd();if(!KQS.sel)KQS.sel=heroSkills()[0].n;KQS.tab='ab';openX('abil');try{mSfx('open')}catch(_){}}
function kqsKind(s){const t=s.ty||KQS_TY[s.k]||'';return t}
function kqsInfo(s){const a=[];if(s.cd)a.push('⏱ '+s.cd+'s cooldown');a.push('💧 '+(s.mp||0)+' mana');if(s.gt)a.push('🎯 ground target · range '+kqsRng(s)+(s.sh=='line'?' · line '+(s.L||'')+'×'+(s.w||''):s.sh=='wall'?' · wall '+s.L:' · radius '+(s.r||1)));else if(s.r)a.push('◯ radius '+s.r);if(s.dur)a.push('⌛ '+s.dur+'s');if(s.spend)a.push(CRES[hero.cls]?CRES[hero.cls].i+' spends '+CRES[hero.cls].n:'');return a.filter(Boolean)}
XR.abil=()=>{const c=hero.cls,C=CLS[c],all=kqsAll(c),eqd=heroSkills(),ap=apFree(),sel=kqsFind(c,KQS.sel)||eqd[0],nUn=all.filter(s=>kqsUnl(c,s)).length;
  $('xwT').textContent='⚡ Abilities';$('xwS').innerHTML=`${C.i} ${C.n} · <b class="kqs-apv">${ap}</b> ability point${ap==1?'':'s'} · ${nUn} / ${all.length} learned · +1 point every level`;
  const slots=[0,1,2,3].slice(0,KQS_SLOTS).map(q=>{const s=eqd[q];return `<div class="kqs-slot${s?'':' empty'}${KQS.slot===q?' on':''}" data-kqslot="${q}" title="${s?s.n+' — key '+(q+1):'Empty slot '+(q+1)}"><span class="kqs-sk">${q+1}</span><span class="kqs-si">${s?s.i:'＋'}</span><span class="kqs-sn">${s?s.n:'Empty'}</span>${s&&eqd.length>1?`<button class="kqs-sx" data-kqsun="${q}" title="Remove from key ${q+1}">✕</button>`:''}</div>`}).join('');
  const row=s=>{const un=kqsUnl(c,s),q=eqd.indexOf(s),why=kqsWhy(s),def=s===kqsDef(c),cost=apCost(s);
    const st=un?(q>=0?`<span class="kqs-eqd">Key ${q+1}</span>`:`<button data-kqseq="${s.n}" title="Put on key ${(KQS.slot|0)+1}">Equip</button>`):why?`<span class="kqs-lk">🔒 ${why.replace('Reach level','Lv')}</span>`:`<button class="pri" data-kqsbuy="${s.n}">Unlock · ${cost} ⚡</button>`;
    return `<div class="rw kqs-ab${un?' un':' lk'}${s.gt?' gt':''}${sel===s?' on':''}${q>=0?' eq':''}" data-kqsel="${s.n}"><span class="rn"><span class="kqs-ic">${s.i}</span><b>${s.n}</b>${def?' <span class="kqs-tag def">Default</span>':''}${s.nw?' <span class="kqs-tag nw">New</span>':''}${s.gt?' <span class="kqs-tag gt">🎯 Ground</span>':''}<small>Lv ${s.lv} · ${kqsKind(s)}${def?'':' · '+cost+' ⚡'}</small></span><span class="ra">${st}</span></div>`};
  const tiers=[[1,9],[10,19],[20,29],[30,39],[40,50]].map(([a,b])=>{const L=all.filter(s=>s.lv>=a&&s.lv<=b);return L.length?`<div class="sec">Level ${a}–${b}</div><div class="rows">${L.map(row).join('')}</div>`:''}).join('');
  const un=kqsUnl(c,sel),why=kqsWhy(sel),q=eqd.indexOf(sel),cost=apCost(sel);
  const det=`<div class="kqs-det glass"><div class="kqs-dh"><span class="kqs-di">${sel.i}</span><div><b>${sel.n}</b><small>${kqsKind(sel)}${sel.gt?' · ground-targeted':''}</small></div></div><p>${sel.d}</p><div class="kqs-stats">${kqsInfo(sel).map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="kqs-req"><span>Level ${sel.lv}${hero.lvl>=sel.lv?' ✔':' ✖'}</span>${sel.req?`<span>Requires ${sel.req}${kqsUnl(c,kqsFind(c,sel.req))?' ✔':' ✖'}</span>`:''}<span>${sel===kqsDef(c)?'Class default':'Cost '+cost+' ⚡'}</span></div>
    ${un?`<div class="sec">Put on a key</div><div class="btns kqs-keys">${[0,1,2,3].slice(0,KQS_SLOTS).map(k=>`<button data-kqseq="${sel.n}" data-kqsk="${k}" class="${q===k?'pri':''}" ${k>eqd.length-(q>=0?1:0)?'disabled':''}>${k+1}</button>`).join('')}${q>=0&&eqd.length>1?`<button data-kqsun="${q}">Unequip</button>`:''}</div>`
      :`<div class="btns"><button class="pri" data-kqsbuy="${sel.n}" ${why?'disabled':''}>${why?'🔒 '+why:'Unlock for '+cost+' ability point'+(cost>1?'s':'')}</button></div>`}
    ${sel.gt?'<div class="mut kqs-hint">Press its key, aim the circle with the mouse (or drag on a touch screen), then click / tap — or press the key again — to cast. Right-click or Esc cancels.</div>':''}</div>`;
  $('xwB').innerHTML=kqsTabs('ab')+`<div class="kqs-ld"><div class="sec">Equipped · keys 1–${KQS_SLOTS}</div><div class="kqs-slots">${slots}</div></div><div class="xcols kqs-cols"><div class="kqs-list">${tiers}</div><div>${det}</div></div>`;
  $('xwF').innerHTML=`<span class="mut dtl">You earn 1 ability point every level. Unlock abilities here, then choose which ${KQS_SLOTS} sit on keys 1–${KQS_SLOTS}. Talents are a separate tab.</span><button data-kqsreset="1" ${apSpent()?'':'disabled'}>Reset abilities (🪙 ${kqsResetCost()})</button>`};
$('xw').addEventListener('click',e=>{if(xwMode!='abil')return;const t=e.target.closest('[data-kqsbuy],[data-kqseq],[data-kqsun],[data-kqslot],[data-kqsel],[data-kqsreset],[data-kqstal]');if(!t||t.disabled)return;e.stopPropagation();const D=t.dataset;
  try{mSfx('tick')}catch(_){}
  if(D.kqsbuy!=null)return kqsBuy(D.kqsbuy);
  if(D.kqseq!=null){const k=D.kqsk!=null?+D.kqsk:KQS.slot|0;KQS.sel=D.kqseq;skSet(Math.min(k,heroSkills().length-(heroSkills().some(s=>s.n==D.kqseq)?1:0)),D.kqseq);return}
  if(D.kqsun!=null)return kqsUneq(+D.kqsun);
  if(D.kqsreset!=null)return kqsReset();
  if(D.kqstal!=null){KQS.tab='tal';closeX();openTal();return}
  if(D.kqslot!=null){KQS.slot=+D.kqslot;const s=heroSkills()[KQS.slot];if(s)KQS.sel=s.n;rX();return}
  if(D.kqsel!=null){KQS.sel=D.kqsel;rX()}});
// the talents window points to the ability book (replaces the v71 skill list)
function skHTML(){const ap=apFree();return `<div class="sksec kqs-link"><span>⚡ <b>Abilities</b> are learned with ability points (1 per level), separate from talent points. You have <b>${ap}</b> to spend.</span><button class="pri" data-kqsopen="1">Open Abilities</button></div>`}
// K: Talents | Abilities. K reopens the tab you used last, and closes the Abilities tab when it is open
addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.key.toLowerCase()!='k')return;const a=document.activeElement;if(a&&(a.tagName=='INPUT'||a.tagName=='TEXTAREA'))return;
  if(!$('xw').classList.contains('hide')&&xwMode=='abil'){closeX();e.stopImmediatePropagation()}},true);
{const f=openTal;openTal=function(){if(KQS.tab=='ab'&&!uiOpen()&&party.length)return openAbil();KQS.tab='tal';return f.apply(this,arguments)}}
function kqsTabs(on){const ap=apFree();return `<div class="tabs kqs-tabs"><button class="${on=='tal'?'on':''}" data-kqstal="1">✦ Talents${tpFree()?' <b class="kqs-n">'+tpFree()+'</b>':''}</button><button class="${on=='ab'?'on':''}" data-kqsopen="1">⚡ Abilities${ap?' <b class="kqs-n">'+ap+'</b>':''}</button></div>`}
{const f=rTal;rTal=function(){f.apply(this,arguments);try{const w=document.querySelector('#tal .wh');if(!w)return;let t=w.querySelector('.kqs-tabs');if(t)t.remove();w.querySelector('h2').insertAdjacentHTML('afterend',kqsTabs('tal'))}catch(_){}}}
document.addEventListener('click',e=>{const t=e.target.closest('#tal [data-kqstal]');if(t)e.preventDefault()});
{const t=$('talBtn');if(t&&!$('abBtn')){t.insertAdjacentHTML('afterend','<button id="abBtn">⚡ Abilities <kbd>K</kbd></button>');$('abBtn').onclick=()=>{if($('sysmenu'))$('sysmenu').classList.add('hide');openAbil()}}}
document.head.insertAdjacentHTML('beforeend',`<style>
.kqs-tg{position:absolute;left:50%;top:84px;transform:translateX(-50%);z-index:30;display:flex;align-items:center;gap:10px;padding:6px 8px 6px 14px;font-size:.8rem;pointer-events:auto;border-radius:10px;white-space:nowrap;max-width:calc(100% - 32px);box-sizing:border-box}
.kqs-tg .kqs-tgh{opacity:.8}.kqs-tg kbd{font-size:.7rem}.kqs-tg .kqs-tgx{min-width:30px;padding:3px 8px}
body.mob .kqs-tg .kqs-tgh::after{content:' · drag on the screen, lift to cast'}
@media(max-width:700px){.kqs-tg{white-space:normal;top:70px}.kqs-tg .kqs-tgh{font-size:.7rem}}
#acts .hs.kqs-empty{opacity:.42;border-style:dashed}#acts .hs.kqs-aim{outline:2px solid #f0cc72;outline-offset:1px;box-shadow:0 0 14px rgba(240,204,114,.6)}
.kqs-apn{cursor:pointer;color:#c4b5fd}
.kqs-ld .kqs-slots{display:grid;grid-template-columns:repeat(${KQS_SLOTS},1fr);gap:6px;margin-bottom:8px}
.kqs-slot{position:relative;display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:rgba(0,0,0,.25);cursor:pointer;min-width:0}
.kqs-slot.on{border-color:#f0cc72;box-shadow:0 0 0 1px #f0cc72 inset}.kqs-slot.empty{opacity:.55;border-style:dashed}
.kqs-sk{font-size:.68rem;font-weight:800;opacity:.7}.kqs-si{font-size:1.25rem}.kqs-sn{font-size:.76rem;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}
.kqs-sx{min-width:0;padding:1px 6px;font-size:.7rem;line-height:1.2}
.kqs-cols{align-items:start}.kqs-list{max-height:min(54vh,520px);overflow:auto;padding-right:4px}
.kqs-ab{cursor:pointer}.kqs-ab.lk{opacity:.62}.kqs-ab.on{outline:1px solid #f0cc72}.kqs-ab .kqs-ic{font-size:1.15rem;margin-right:6px}
.kqs-tag{font-size:.6rem;padding:1px 5px;border-radius:6px;background:rgba(255,255,255,.1);vertical-align:middle;font-weight:700}.kqs-tag.gt{background:rgba(240,204,114,.18);color:#f0cc72}.kqs-tag.nw{background:rgba(110,231,183,.16);color:#6ee7b7}.kqs-tag.def{background:rgba(147,197,253,.16);color:#93c5fd}
.kqs-eqd{font-size:.72rem;font-weight:800;color:#f0cc72}.kqs-lk{font-size:.7rem;opacity:.8;white-space:nowrap}
.kqs-det{padding:10px 12px;border-radius:10px}.kqs-dh{display:flex;gap:10px;align-items:center}.kqs-di{font-size:2.1rem}.kqs-dh small{display:block;opacity:.75;font-size:.72rem}
.kqs-det p{margin:8px 0;font-size:.82rem;line-height:1.4}.kqs-stats,.kqs-req{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}.kqs-stats span,.kqs-req span{font-size:.7rem;padding:2px 6px;border-radius:6px;background:rgba(255,255,255,.07)}
.kqs-keys button{min-width:36px}.kqs-hint{font-size:.72rem;margin-top:8px}
.kqs-tabs{display:flex;gap:4px;margin:0 10px}.kqs-tabs button{padding:4px 10px;font-size:.78rem}.kqs-tabs button.on{border-color:#f0cc72;color:#f0cc72}.kqs-n{font-size:.68rem;margin-left:4px;padding:0 5px;border-radius:8px;background:#7c3aed;color:#fff}
#xwB>.kqs-tabs{margin:0 0 8px}
.kqs-link{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:.8rem}
@media(max-width:700px){.kqs-ld .kqs-slots{grid-template-columns:repeat(2,1fr)}.kqs-list{max-height:none}}
</style>`);
