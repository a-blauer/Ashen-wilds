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
  {n:'Eviscerate',i:'✂️',lv:2,x:'a_evisc',m:1.3,cd:6,mp:10,spend:1,col:0xe04a6a,pose:'thrust',ty:'Finisher · single target',d:'A finishing strike that spends all Combo points: +25% damage per point (5 points: ×2.25, always critical).'},
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
  if(old)setTimeout(()=>{try{say('⚡ <b>Abilities reworked:</b> you kept '+kept.length+' abilit'+(kept.length==1?'y':'ies')+' and have <b>'+apFree()+'</b> ability points to spend (C · Abilities). Talent points spent on skills were refunded.')}catch(_){}},4200)}
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
function kqsLvNote(){const L=kqsAll(hero.cls).filter(s=>s.lv==hero.lvl);return L.length?'New abilit'+(L.length>1?'ies':'y')+' to unlock: '+L.map(s=>s.i+' '+s.n).join(', ')+' (C · Abilities)':''}

