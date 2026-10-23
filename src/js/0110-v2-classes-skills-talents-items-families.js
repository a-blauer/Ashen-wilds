// =====================================================================================
// ============ V2 SYSTEMS: classes · talents · gear · creature families · enemies ============
// =====================================================================================
const TIERS=[[1,9],[10,19],[20,29],[30,39],[40,49]],MAXLV=50;
const tierOfLv=l=>Math.max(1,Math.min(5,Math.floor(l/10)+1));
const needH=l=>Math.round(8*l*l+20*l+20);
const KD=l=>40+9*l;
// ---------------- classes ----------------
const CLS={
 warrior:{n:'Warrior',i:'⚔️',role:'Two-handed bruiser',d:'Heavy greatswords and greataxes. Huge, slow combo hits and the toughest frame in the game.',arm:'heavy',atk:'melee3',mt:'p',col:'#d0583a',
   base:{hp:130,mp:30,pa:12,ma:3,pd:9,md:4},per:{hp:24,mp:1.5,pa:3.7,ma:.5,pd:2.5,md:1.3},rng:2.7,spd:.66,crit:.06,cape:[120,30,24],tunic:0x6a3e2a,pants:[64,48,40],sk:[90,62,44],st:'Strength · Health'},
 paladin:{n:'Paladin',i:'🛡️',role:'Holy defender',d:'Mace and shield. Blocks blows, heals and smites with holy magic.',arm:'heavy',atk:'melee3',mt:'p',col:'#e8c45a',
   base:{hp:135,mp:45,pa:10,ma:7,pd:11,md:8},per:{hp:25,mp:3,pa:3.1,ma:1.7,pd:2.8,md:2.2},rng:2.4,spd:.6,crit:.05,cape:[230,210,150],tunic:0x8a8a96,pants:[70,70,80],sk:[217,179,140],st:'Defense · Healing'},
 assassin:{n:'Assassin',i:'🗡️',role:'Fast striker',d:'Dual daggers, lightning-fast 4-hit combos, poison and deadly critical hits.',arm:'light',atk:'melee4',mt:'p',col:'#9a6ae0',
   base:{hp:100,mp:40,pa:11,ma:4,pd:6,md:5},per:{hp:18,mp:2.5,pa:3.9,ma:.6,pd:1.7,md:1.4},rng:2.0,spd:.36,crit:.16,cape:[40,30,50],tunic:0x2a2430,pants:[34,30,40],sk:[200,160,128],st:'Speed · Critical hits'},
 ranger:{n:'Ranger',i:'🏹',role:'Archer',d:'Longbows and traps. Strikes from afar and keeps foes at bay with arrows.',arm:'medium',atk:'bow',mt:'p',col:'#6ac46a',
   base:{hp:105,mp:45,pa:11,ma:5,pd:7,md:5},per:{hp:19,mp:3,pa:3.6,ma:.9,pd:1.9,md:1.6},rng:13,spd:.62,crit:.12,cape:[46,84,40],tunic:0x4a5a32,pants:[70,56,40],sk:[210,170,130],st:'Range · Companions'},
 mage:{n:'Mage',i:'🔮',role:'Elemental caster',d:'Staves of fire, frost and arcane power. Fragile but devastating at range.',arm:'cloth',atk:'staff',mt:'m',col:'#5a9aff',
   base:{hp:88,mp:90,pa:4,ma:13,pd:4,md:9},per:{hp:15.5,mp:6,pa:.6,ma:4.1,pd:1.2,md:2.3},rng:11,spd:.72,crit:.08,cape:[40,60,130],tunic:0x3a3a7a,pants:[40,40,70],sk:[225,190,160],st:'Magic power · Mana'}
};
const CLSK=Object.keys(CLS);
// ---------------- class skills (keys 1-4, unlocked by character level) ----------------
const SKL={
 warrior:[
  {n:'Cleave',i:'🪓',lv:1,k:'cone',m:2.0,cd:5,mp:8,r:3.2,col:0xffb070,d:'A wide sweeping strike in front of you.'},
  {n:'Leap Slam',i:'💥',lv:4,k:'leap',m:2.4,cd:9,mp:14,r:2.8,stun:.9,col:0xffc080,d:'Leap to the target area and smash the ground, stunning enemies.'},
  {n:'War Cry',i:'📯',lv:10,k:'buff',cd:20,mp:15,buff:{paP:.3,dr:.15},dur:8,col:0xff6a3a,d:'+30% physical attack and 15% damage reduction for 8s.'},
  {n:'Whirlwind',i:'🌪️',lv:18,k:'channel',m:.9,cd:14,mp:22,r:2.7,dur:2.4,col:0xe8e0d0,d:'Spin with your weapon for 2.4s, hitting everything around you.'}],
 paladin:[
  {n:'Holy Smite',i:'✨',lv:1,k:'nova',m:1.9,cd:6,mp:10,r:2.8,mt:'m',col:0xffe08a,d:'Holy light bursts around you.'},
  {n:'Divine Barrier',i:'🛡️',lv:4,k:'barrier',v:.3,dur:6,cd:16,mp:14,col:0xfff0b0,d:'Absorb damage equal to 30% of your max health for 6s.'},
  {n:'Consecration',i:'🔆',lv:10,k:'rain',at:'self',m:.6,ticks:10,iv:.6,r:3.2,mt:'m',cd:14,mp:18,col:0xffd060,d:'Consecrate the ground around you, burning enemies for 6s.'},
  {n:'Lay on Hands',i:'🙏',lv:18,k:'heal',v:.4,cd:25,mp:25,col:0x9affb0,d:'Heal 40% of your max health and cleanse slows.'}],
 assassin:[
  {n:'Shadow Rush',i:'👤',lv:1,k:'blink',m:2.2,cd:6,mp:10,col:0x9a6ae0,d:'Dash forward in a streak of shadow, slicing every enemy in your path. The first enemy hit takes a guaranteed critical hit.'},
  {n:'Fan of Knives',i:'🔪',lv:4,k:'fan',n2:10,m:1.0,cd:8,mp:12,col:0xd8d8e8,d:'Throw knives in every direction.'},
  {n:'Poison Blades',i:'🧪',lv:10,k:'buff',cd:18,mp:14,buff:{poisonOn:1},dur:10,col:0x7aff6a,d:'For 10s your hits poison enemies.'},
  {n:'Death Mark',i:'☠️',lv:18,k:'mark',v:.35,dur:8,m:1.6,cd:16,mp:18,col:0xff3a6a,d:'Strike and mark a target: it takes 35% more damage for 8s.'}],
 ranger:[
  {n:'Multishot',i:'🏹',lv:1,k:'shot',n2:5,m:1.1,cd:5,mp:9,col:0xe8d8b0,arrow:1,d:'Fire five arrows in a spread.'},
  {n:'Piercing Arrow',i:'➶',lv:4,k:'beam',m:2.6,cd:7,mp:12,col:0xfff0c0,d:'An arrow that pierces every enemy in a line.'},
  {n:'Snare Trap',i:'🪤',lv:10,k:'trap',m:1.5,root:3,cd:14,mp:12,col:0xc0a060,d:'Drop a trap that roots and wounds the first enemies to step in.'},
  {n:'Rain of Arrows',i:'🌧️',lv:18,k:'rain',at:'aim',m:.7,ticks:8,iv:.35,r:3,cd:14,mp:20,col:0xe8d8b0,d:'Arrows rain down on the target area.'}],
 mage:[
  {n:'Fireball',i:'🔥',lv:1,k:'shot',m:2.4,big:1,cd:4,mp:10,mt:'m',burn:1,col:0xff7a2a,d:'A fireball that explodes on impact and burns.'},
  {n:'Frost Nova',i:'❄️',lv:4,k:'nova',m:1.4,cd:9,mp:14,r:3.3,mt:'m',stun:1.6,col:0x9fe3ff,d:'Freeze everything around you in place.'},
  {n:'Chain Lightning',i:'⚡',lv:10,k:'chain',m:1.8,jumps:4,cd:8,mp:16,mt:'m',col:0xfff06a,d:'Lightning that jumps between up to 4 enemies.'},
  {n:'Meteor',i:'☄️',lv:18,k:'meteor',m:4.5,r:3.5,delay:1.1,cd:18,mp:28,mt:'m',burn:1,col:0xff5a1a,d:'Call down a meteor on the target area after a short delay.'}]
};
// ---------------- talents: 3 branches x 5 rows per class; a row needs 3 points per row above it in the same branch ----------------
// [id, name, icon, max ranks, description (# = total value), effects per rank]
const TAL={
 warrior:[
  {n:'Arms',i:'⚔️',t:[['w1','Heavy Swings','🔨',5,'Basic attacks deal #% more damage',{basicP:.04}],['w2','Brutality','🩸',5,'Critical hits deal #% more damage',{cdm:.1}],['w3','Executioner','🪓',3,'#% more damage to enemies under 35% health',{exec:.1}],['w4','Deep Wounds','🗡️',3,'Combo finishers deal #% more damage',{finisher:.15}],['w5','Titan\'s Grip','🏔️',1,'+15% physical attack and +10% attack speed',{paP:.15,as:.1}]]},
  {n:'Fury',i:'🔥',t:[['w6','Bloodthirst','🩸',5,'Heal for #% of damage dealt',{ls:.01}],['w7','Rampage','💢',5,'#% faster attacks',{as:.03}],['w8','Battle Trance','🌀',3,'Skills deal #% more damage',{skillP:.08}],['w9','Unstoppable','💨',3,'Dashes stay invulnerable #s longer',{iframe:.05}],['w10','Berserker','😡',1,'+25% damage while below 50% health',{berserk:.25}]]},
  {n:'Bulwark',i:'🛡️',t:[['w11','Thick Skin','❤️',5,'#% more max health',{hpP:.04}],['w12','Iron Hide','⛓️',5,'#% more physical defense',{pdP:.05}],['w13','Second Wind','🌬️',3,'Regenerate #% health per second in combat',{regen:.004}],['w14','Last Stand','🏰',3,'#% damage reduction while below 40% health',{lowdr:.08}],['w15','Juggernaut','🦏',1,'8% damage reduction and reflect 15% of damage taken',{dr:.08,thorns:.15}]]}],
 paladin:[
  {n:'Retribution',i:'⚖️',t:[['p1','Righteous Might','💪',5,'Basic attacks deal #% more damage',{basicP:.04}],['p2','Zeal','⚡',5,'#% faster attacks',{as:.03}],['p3','Judgement','⚖️',3,'#% more damage to enemies under 35% health',{exec:.1}],['p4','Crusader','✝️',3,'Skills deal #% more damage',{skillP:.1}],['p5','Avenging Wrath','🌞',1,'+10% physical and +15% magical attack',{paP:.1,maP:.15}]]},
  {n:'Holy',i:'✨',t:[['p6','Devotion','🙏',5,'#% more magical attack',{maP:.05}],['p7','Blessed Light','💖',5,'Healing you receive is #% stronger',{healP:.08}],['p8','Purity','💧',3,'Regenerate #% mana per second',{mpr:.003}],['p9','Radiance','🔆',3,'Skill areas are #% larger',{aoeP:.12}],['p10','Martyr','🕊️',1,'Heal 4% max health on every kill',{killheal:.04}]]},
  {n:'Protection',i:'🛡️',t:[['p11','Shield Training','🛡️',5,'#% chance to block half of a hit',{blockC:.03}],['p12','Bastion','🏰',5,'#% more physical and magical defense',{pdP:.05,mdP:.05}],['p13','Aegis','🔰',3,'Shields and barriers are #% stronger',{shieldP:.15}],['p14','Retaliation','⚔️',3,'Reflect #% of damage taken',{thorns:.08}],['p15','Guardian','👼',1,'10% damage reduction and 10% more max health',{dr:.1,hpP:.1}]]}],
 assassin:[
  {n:'Lethality',i:'🎯',t:[['a1','Precision','🎯',5,'+#% critical hit chance',{crit:.02}],['a2','Cruelty','🩸',5,'Critical hits deal #% more damage',{cdm:.12}],['a3','Ambush','🌑',3,'#% more damage to enemies at full health',{first:.2}],['a4','Exploit','🗡️',3,'#% more damage to enemies under 35% health',{exec:.12}],['a5','Assassinate','☠️',1,'Critical hits deal 40% more damage',{cdm:.4}]]},
  {n:'Venom',i:'🧪',t:[['a6','Toxic Edge','🧪',5,'Poison deals #% more damage',{poisonP:.1}],['a7','Swift Hands','✋',5,'#% faster attacks',{as:.04}],['a8','Lingering Poison','☁️',3,'Skills deal #% more damage',{skillP:.08}],['a9','Crippling Strikes','🦵',3,'#% chance on hit to slow the enemy',{slowOn:.1}],['a10','Plaguebringer','🦠',1,'Poison deals 50% more damage and your hits always poison',{poisonP:.5,poisonOn:1}]]},
  {n:'Shadow',i:'🌑',t:[['a11','Light Feet','👟',5,'#% faster movement',{mspd:.02}],['a12','Evasion','💨',5,'Dashes recharge #% faster',{dashR:.06}],['a13','Vanish','👻',3,'Dashes stay invulnerable #s longer',{iframe:.06}],['a14','Shadow Dance','🌀',3,'+1 dash charge at rank 3 (and #% faster dash recharge)',{dashR:.05,dash3:1}],['a15','Phantom','🎭',1,'20% chance for a skill to cost no cooldown',{echo:.2}]]}],
 ranger:[
  {n:'Marksmanship',i:'🎯',t:[['r1','Steady Aim','🎯',5,'Basic attacks deal #% more damage',{basicP:.04}],['r2','Eagle Eye','🦅',5,'+#% critical hit chance',{crit:.02}],['r3','Lethal Shots','💀',3,'Critical hits deal #% more damage',{cdm:.15}],['r4','Piercing Shots','➶',3,'Arrows pierce # extra enemies',{pierce:1}],['r5','Deadeye','👁️',1,'30% more damage to full-health enemies and 10% to low-health ones',{first:.3,exec:.1}]]},
  {n:'Survival',i:'🌲',t:[['r6','Hardy','❤️',5,'#% more max health',{hpP:.04}],['r7','Fleet Footed','👟',5,'#% faster movement and dash recharge',{mspd:.02,dashR:.04}],['r8','Camouflage','🍃',3,'#% damage reduction',{dr:.03}],['r9','Trapper','🪤',3,'Skills deal #% more damage',{skillP:.1}],['r10','Hunter\'s Mark','🏹',1,'Skills deal 15% more damage and cool down 10% faster',{skillP:.15,cdr:.1}]]},
  {n:'Beastmaster',i:'🐾',t:[['r11','Kinship','🐾',5,'Companions deal #% more damage',{compP:.08}],['r12','Bond','💞',5,'Empowering gives you #% more stats',{empP:.06}],['r13','Pack Leader','🐺',3,'Heal for #% of damage dealt',{ls:.015}],['r14','Wild Spirit','🌿',3,'#% more XP and loot',{xp:.04,loot:.04}],['r15','Alpha Bond','👑',1,'Companions deal 30% more damage; empowering gives 15% more',{compP:.3,empP:.15}]]}],
 mage:[
  {n:'Fire',i:'🔥',t:[['m1','Ignite','🔥',5,'Skills deal #% more damage',{skillP:.04}],['m2','Combustion','💥',5,'Critical hits deal #% more damage',{cdm:.1}],['m3','Pyromancy','🌋',3,'#% more magical attack',{maP:.06}],['m4','Inferno','☄️',3,'Skill areas are #% larger',{aoeP:.1}],['m5','Phoenix','🐦‍🔥',1,'Heal 3% max health per kill and +10% magical attack',{killheal:.03,maP:.1}]]},
  {n:'Frost',i:'❄️',t:[['m6','Frostbite','🧊',5,'Freezes and stuns last #% longer',{stunP:.1}],['m7','Ice Armor','🛡️',5,'#% more physical defense',{pdP:.05,mdP:.03}],['m8','Shatter','💎',3,'#% more damage to enemies under 35% health',{exec:.1}],['m9','Glacial Ward','🔷',3,'Barriers are #% stronger',{shieldP:.15}],['m10','Absolute Zero','🥶',1,'10% damage reduction',{dr:.1}]]},
  {n:'Arcane',i:'🔮',t:[['m11','Arcane Mind','🧠',5,'#% more max mana',{mpP:.06}],['m12','Focus','💧',5,'Regenerate #% mana per second',{mpr:.002}],['m13','Haste','⏩',3,'Skills cool down #% faster',{cdr:.05}],['m14','Arcane Power','✴️',3,'Basic attacks deal #% more damage',{basicP:.1}],['m15','Echoes','🔁',1,'20% chance for a skill to cost no cooldown',{echo:.2}]]}]
};
// ---------------- equipment: 100 named templates ----------------
const TIERN=['Tier I','Tier II','Tier III','Tier IV','Tier V'];
const ARMC={heavy:['warrior','paladin'],medium:['ranger'],light:['assassin'],cloth:['mage']};
const WTYPE={gs:{n:'Greatsword',i:'🗡️',k:1.25,spd:1.12},ga:{n:'Greataxe',i:'🪓',k:1.32,spd:1.2},mace:{n:'Mace',i:'🔨',k:1.0,spd:1},hammer:{n:'Warhammer',i:'🔨',k:1.12,spd:1.1},dagger:{n:'Daggers',i:'🔪',k:.78,spd:1},bow:{n:'Bow',i:'🏹',k:1.0,spd:1},staff:{n:'Staff',i:'🪄',k:1.15,spd:1}};
const ITPL=[];
{
  const W=(cls,type,names)=>names.forEach((n,t)=>ITPL.push({n,sl:'weapon',cls,wt:type[t]||type[0],t}));
  W('warrior',['gs','ga','gs','ga','gs'],['Rusted Greatsword','Ironfang Greataxe','Cinderbrand Claymore','Hollowreaver Greataxe','Stormsunder Greatsword']);
  W('paladin',['mace','mace','hammer','mace','hammer'],['Oaken Cudgel','Templar Mace','Sunforge Warhammer','Gravewarden Mace','Dawnbreaker Hammer']);
  W('assassin',['dagger'],['Chipped Shivs','Viper Fangs','Emberkiss Daggers','Nightglass Kris','Stormwhisper Blades']);
  W('ranger',['bow'],['Hunting Shortbow','Ashwood Longbow','Cinder Recurve','Bonestring Bow','Galecaller Warbow']);
  W('mage',['staff'],['Apprentice Staff','Mossroot Staff','Pyreheart Staff','Lichglass Staff','Tempest Scepter']);
  ['Plank Buckler','Iron Kite Shield','Sunsteel Heater','Gravewall Tower Shield','Aegis of Dawn'].forEach((n,t)=>ITPL.push({n,sl:'offhand',cls:'paladin',t}));
  const A=(arm,sl,names)=>names.forEach((n,t)=>ITPL.push({n,sl,arm,t}));
  A('heavy','helm',['Dented Nasal Helm','Iron Horned Helm','Cinderforged Greathelm','Hollowsteel Visage','Stormguard Warhelm']);
  A('heavy','chest',['Rusted Mail','Ironbound Hauberk','Cinderforged Cuirass','Hollowsteel Warplate','Stormguard Aegisplate']);
  A('heavy','boots',['Hobnail Boots','Iron Sabatons','Cinder Greaves','Hollowsteel Stompers','Stormguard Treads']);
  A('medium','helm',['Leather Hood','Wolfpelt Hood','Emberstalker Cowl','Bonehunter Hood','Galewing Mask']);
  A('medium','chest',['Padded Jerkin','Studded Brigandine','Emberstalker Vest','Bonehunter Coat','Galewing Mantle']);
  A('medium','boots',['Trail Boots','Wolfpelt Boots','Emberstalker Boots','Bonehunter Striders','Galewing Boots']);
  A('light','helm',['Cloth Mask','Viper Mask','Ashveil Cowl','Nightglass Mask','Stormshade Hood']);
  A('light','chest',['Rag Wraps','Viperskin Tunic','Ashveil Garb','Nightglass Shroud','Stormshade Raiment']);
  A('light','boots',['Soft Shoes','Viperskin Wraps','Ashveil Steps','Nightglass Treads','Stormshade Slippers']);
  A('cloth','helm',['Linen Hood','Mossweave Hat','Pyre Circlet','Lich Diadem','Tempest Crown']);
  A('cloth','chest',['Novice Robe','Mossweave Robe','Pyreweave Robes','Lichsilk Vestments','Tempest Regalia']);
  A('cloth','boots',['Sandals','Mossweave Slippers','Pyre Treads','Lichsilk Boots','Tempest Steps']);
  ['Bone Charm','Wolf Tooth Amulet','Emberheart Pendant','Soulglass Locket','Stormeye Talisman'].forEach((n,t)=>ITPL.push({n,sl:'amulet',t}));
  ['Copper Band','Silver Signet','Cinder Loop','Hollow Ring','Storm Seal'].forEach((n,t)=>ITPL.push({n,sl:'ring',t}));
}
// v135: 'ring2' is a second ring slot; ring items (sl 'ring') fit either (eqSlot135 picks which)
const SLOTS=['weapon','offhand','helm','chest','boots','amulet','ring','ring2'],SLOTN={weapon:'Weapon',offhand:'Shield',helm:'Head',chest:'Chest',boots:'Feet',amulet:'Amulet',ring:'Ring',ring2:'Ring'};
const SLOTIC={weapon:'⚔️',offhand:'🛡️',helm:'⛑️',chest:'🥋',boots:'👢',amulet:'📿',ring:'💍',ring2:'💍'};
const AFX={crit:['Critical chance','p',.012],cdm:['Critical damage','p',.06],as:['Attack speed','p',.025],ls:['Lifesteal','p',.008],hpP:['Max health','p',.025],paP:['Physical attack','p',.025],maP:['Magical attack','p',.025],pd:['Physical defense','n',.9],md:['Magical defense','n',.9],mp:['Max mana','n',2.2],cdr:['Cooldown reduction','p',.015],loot:['Loot find','p',.03],xp:['Experience','p',.02],mspd:['Move speed','p',.015],regen:['Health regen','p',.0006]};
const UPM=[['Whetstone','🪨'],['Tempered Ore','⛏️'],['Cinder Steel','🔥'],['Hollow Silver','🥈'],['Storm Mithril','⚡']];
// ---------------- creature families: 6 families x 5 tiers = 30 hatchables ----------------
const FAMD={
 Beast:{i:'🐾',col:0xe8833a,mt:'p',w:{hp:.95,pa:1.28,ma:.6,pd:.85,md:.8},spd:1.2,mat:'Beast Hide',mi:'🦊',d:'Fast, ferocious hunters with the highest physical attack.',hab:{ter:['grass','dirt'],dec:['haynest','flowerbed','sapling']}},
 Earth:{i:'🪨',col:0xa0a090,mt:'p',w:{hp:1.38,pa:.82,ma:.6,pd:1.45,md:1.05},spd:.8,mat:'Rock Core',mi:'🪨',d:'Slow, armoured giants. Most health and defense.',hab:{ter:['flagstone','mud'],dec:['boulder','reeds','stonelantern']}},
 Sky:{i:'🪶',col:0x7ac8f0,mt:'p',w:{hp:.85,pa:1.15,ma:.8,pd:.75,md:.9},spd:1.35,mat:'Soaring Feather',mi:'🪶',d:'Swift fliers. Fastest attacks, fragile bodies.',hab:{ter:['grass','sand'],dec:['perch','sapling','banner']}},
 Dragon:{i:'🐲',col:0xd04a2a,mt:'m',w:{hp:1.15,pa:1.0,ma:1.28,pd:1.05,md:1.0},spd:.95,mat:'Dragon Scale',mi:'🐉',d:'Proud scaled beasts. Strong magic and solid health.',hab:{ter:['ash','flagstone'],dec:['brazier','hoard','bonetotem']}},
 Spirit:{i:'👻',col:0x7fe8ff,mt:'m',w:{hp:.8,pa:.6,ma:1.42,pd:.7,md:1.38},spd:1.05,mat:'Ectoplasm',mi:'👻',d:'Ghosts and bones. Highest magic and magic defense.',hab:{ter:['crystalfloor','snow'],dec:['crystalcl','orb','gravestone']}},
 Swarm:{i:'🕸️',col:0x8a5a9a,mt:'p',w:{hp:1.0,pa:1.05,ma:1.0,pd:.95,md:.95},spd:1.1,mat:'Silk Gland',mi:'🕸️',d:'Spiders and spores. Balanced, with poisons and roots.',hab:{ter:['moss','mud'],dec:['cocoon','mushcl','logpile']}}
};
const FAMK=Object.keys(FAMD);
// species: family, tier (1-5), look rig, emoji, colour, name syllables, ornament level, unique spell
const SP2={
 Foxlet:['Beast',1,'Foxlet','🦊',0xe8833a,'Vulp','ix',0,'Hamstring Bite'],Ashwolf:['Beast',2,'Ashwolf','🐺',0x8a919c,'Cinder','wyn',0,'Howling Rend'],Emberlynx:['Beast',3,'Foxlet','🐈',0xd8502a,'Ember','lynx',2,'Cinder Pounce'],Direfang:['Beast',4,'Ashwolf','🐺',0x3a3440,'Dire','fang',3,'Rending Frenzy'],Skollmaw:['Beast',5,'Ashwolf','🌑',0x2a2a3a,'Skoll','maw',4,'Moon Devour'],
 Stoneshell:['Earth',1,'Stoneshell','🐢',0x9a8f72,'Cairn','ark',0,'Stone Ward'],Mossfrog:['Earth',2,'Mossfrog','🐸',0x5fae4a,'Mire','bit',0,'Bog Spit'],Cragback:['Earth',3,'Stoneshell','🗿',0x7a7a86,'Crag','back',2,'Quake Stomp'],Bogmaw:['Earth',4,'Mossfrog','🐊',0x3a5a30,'Bog','maw',3,'Swallow'],Titanshell:['Earth',5,'Stoneshell','⛰️',0x6a5a4a,'Titan','shell',4,'Mountain\'s Embrace'],
 Batwing:['Sky',1,'Batwing','🦇',0x5a4a6a,'Vesp','ire',0,'Sonic Screech'],Skyhawk:['Sky',2,'Skyhawk','🦅',0x4a8fd8,'Zeph','ryx',0,'Gale Dive'],Duskwing:['Sky',3,'Batwing','🌘',0x4a2a6a,'Dusk','wing',2,'Night Drain'],Stormtalon:['Sky',4,'Skyhawk','⚡',0x2a5aa8,'Storm','talon',3,'Thunder Talon'],Rocsovereign:['Sky',5,'Skyhawk','👑',0xd8a83a,'Roc','sov',4,'Tempest'],
 Drakelet:['Dragon',1,'Drakelet','🐉',0x8a4fd0,'Pyra','gon',0,'Ember Breath'],Gravewyrm:['Dragon',2,'Gravewyrm','🐍',0x4a6a3a,'Grave','wyrm',0,'Venom Fang'],Pyrewing:['Dragon',3,'Drakelet','🔥',0xc83a1a,'Pyre','wing',2,'Flame Burst'],Venomcoil:['Dragon',4,'Gravewyrm','🧪',0x5a8a1a,'Venom','coil',3,'Toxic Cloud'],Elderdrake:['Dragon',5,'Drakelet','🐲',0x2a1a2a,'Elder','drake',4,'Dragonfire'],
 Wispling:['Spirit',1,'Wispling','👻',0x9ad8ff,'Wisp','ael',0,'Wisp Bolt'],Boneling:['Spirit',2,'Boneling','💀',0xe0d8bc,'Osse','ling',0,'Bone Shards'],Lumenwisp:['Spirit',3,'Wispling','🌟',0xffe08a,'Lumen','wisp',2,'Radiance'],Lichbone:['Spirit',4,'Boneling','☠️',0x6a4a8a,'Lich','bone',3,'Soul Siphon'],Soulwarden:['Spirit',5,'Wispling','🕯️',0x7a5aff,'Soul','warden',4,'Spectral Ward'],
 Gloomcap:['Swarm',1,'Gloomcap','🍄',0x7a3a6a,'Gloom','spore',0,'Spore Puff'],Cryptspider:['Swarm',2,'Cryptspider','🕷️',0x2e2836,'Crypt','weave',0,'Web Snare'],Sporelord:['Swarm',3,'Gloomcap','🍄',0x3a8a6a,'Spore','lord',2,'Choking Spores'],Widowqueen:['Swarm',4,'Cryptspider','🕸️',0x8a1a2a,'Widow','queen',3,'Widow\'s Kiss'],Hivemother:['Swarm',5,'Cryptspider','🐝',0xb8902a,'Hive','mother',4,'Brood Swarm']
};
const SPK=Object.keys(SP2),famOf=n=>SP2[n]?SP2[n][0]:'Beast',tierSp=n=>SP2[n]?SP2[n][1]:1,rigOf=n=>SP2[n]?SP2[n][2]:(typeof EN!='undefined'&&EN[n]&&EN[n].rig)||n;
const famTier=(f,t)=>SPK.find(n=>SP2[n][0]==f&&SP2[n][1]==t);
// ---------------- creature spells: one unique per species + one per evolution stage per family ----------------
// k: bite (melee), bolt (projectile), nova (around caster), cone, beam, rain (area at target), chain, shield/heal/buff (help the hero)
// emp: passive the hero gets while this creature empowers them
const CSP={
 'Hamstring Bite':{i:'🦷',k:'bite',m:1.3,cd:6,fx:{slow:3},col:0xe8833a,d:'A crippling bite that slows the target.',emp:{k:'onhit',fx:'slow',ch:.25,d:'Your hits have a 25% chance to slow.'}},
 'Howling Rend':{i:'🐺',k:'cone',m:1.4,cd:7,r:2.6,fx:{bleed:4},col:0xd04a4a,d:'Tears into everything in front, causing bleeding.',emp:{k:'stat',s:{crit:.06},d:'+6% critical hit chance.'}},
 'Cinder Pounce':{i:'🔥',k:'bite',m:1.7,cd:7,fx:{burn:4},col:0xff7a2a,d:'A blazing pounce that sets the target on fire.',emp:{k:'onhit',fx:'burn',ch:.2,d:'Your hits have a 20% chance to burn.'}},
 'Rending Frenzy':{i:'💢',k:'bite',m:.85,hits:3,cd:8,col:0xe04a4a,d:'Three savage bites in quick succession.',emp:{k:'stat',s:{as:.12},d:'+12% attack speed.'}},
 'Moon Devour':{i:'🌑',k:'nova',m:2.2,cd:10,r:3,fx:{drain:.4},col:0x9a7aff,d:'Devours life around it, healing for 40% of the damage.',emp:{k:'stat',s:{ls:.06},d:'+6% lifesteal.'}},
 'Stone Ward':{i:'🪨',k:'shield',v:.15,dur:8,cd:14,col:0xc0b090,d:'Wraps you in stone that absorbs 15% of your max health.',emp:{k:'shield',v:.12,cd:12,d:'Every 12s you gain a stone shield worth 12% of your max health.'}},
 'Bog Spit':{i:'🫧',k:'bolt',m:1.2,cd:5,fx:{slow:3},col:0x7acc5a,d:'Sticky bog spit that slows.',emp:{k:'regen',v:.008,d:'Regenerate 0.8% health per second.'}},
 'Quake Stomp':{i:'💥',k:'nova',m:1.6,cd:9,r:2.8,fx:{stun:.9},col:0xc8a070,d:'A stomp that stuns nearby enemies.',emp:{k:'stat',s:{pdP:.15},d:'+15% physical defense.'}},
 'Swallow':{i:'🐊',k:'bite',m:2.0,cd:9,fx:{drain:.5},col:0x6a9a3a,d:'Gulps a foe, healing itself for half the damage.',emp:{k:'stat',s:{hpP:.12},d:'+12% max health.'}},
 'Mountain\'s Embrace':{i:'⛰️',k:'shield',v:.25,dur:8,cd:16,col:0xb0a080,d:'A mountain of stone shields you for 25% of your max health.',emp:{k:'stat',s:{dr:.1,thorns:.12},d:'10% damage reduction and reflect 12% of damage taken.'}},
 'Sonic Screech':{i:'🔊',k:'cone',m:.9,cd:7,r:3,fx:{weak:5},col:0xc0a0ff,d:'A screech that weakens defenses by 20%.',emp:{k:'onhit',fx:'weak',ch:.2,d:'Your hits have a 20% chance to weaken.'}},
 'Gale Dive':{i:'🌪️',k:'beam',m:1.5,cd:7,col:0xbfe8d0,d:'Dives through a line of enemies.',emp:{k:'stat',s:{mspd:.1,dashR:.15},d:'+10% move speed and 15% faster dash recharge.'}},
 'Night Drain':{i:'🌘',k:'bolt',m:1.4,cd:6,fx:{drain:.5},col:0x8a4aff,d:'A dark bolt that drains life.',emp:{k:'stat',s:{ls:.03},d:'+3% lifesteal.'}},
 'Thunder Talon':{i:'⚡',k:'chain',m:1.6,jumps:3,cd:8,col:0xfff06a,d:'Lightning that jumps between 3 enemies.',emp:{k:'onhit',fx:'zap',ch:.15,d:'Your hits have a 15% chance to call lightning.'}},
 'Tempest':{i:'🌀',k:'rain',m:.9,ticks:6,iv:.4,r:3,cd:12,col:0xa0e0ff,d:'A storm of wind blades over an area.',emp:{k:'stat',s:{as:.12,crit:.05},d:'+12% attack speed and +5% critical chance.'}},
 'Ember Breath':{i:'🔥',k:'cone',m:1.3,cd:6,r:2.8,fx:{burn:4},col:0xff7a2a,d:'Breathes fire in a cone, burning foes.',emp:{k:'onhit',fx:'burn',ch:.2,d:'Your hits have a 20% chance to burn.'}},
 'Venom Fang':{i:'🐍',k:'bite',m:1.2,cd:6,fx:{poison:5},col:0x8ad84a,d:'A venomous bite with strong poison.',emp:{k:'onhit',fx:'poison',ch:.2,d:'Your hits have a 20% chance to poison.'}},
 'Flame Burst':{i:'💥',k:'bolt',m:2.0,big:1,cd:8,fx:{burn:4},col:0xff5a1a,d:'A fireball that explodes on impact.',emp:{k:'stat',s:{maP:.12},d:'+12% magical attack.'}},
 'Toxic Cloud':{i:'☁️',k:'rain',m:.6,ticks:8,iv:.5,r:2.8,cd:11,fx:{poison:3},col:0x9ad84a,d:'A lingering poison cloud.',emp:{k:'pulse',m:.8,r:2.6,cd:6,fx:'poison',d:'Every 6s you release a poison pulse.'}},
 'Dragonfire':{i:'🐲',k:'cone',m:3.0,cd:11,r:3.4,fx:{burn:5},col:0xff4a1a,d:'An inferno of dragon fire.',emp:{k:'stat',s:{paP:.15,maP:.15},d:'+15% physical and magical attack.'}},
 'Wisp Bolt':{i:'💠',k:'bolt',m:1.3,cd:4,col:0x9fe8ff,d:'A quick bolt of spirit energy.',emp:{k:'stat',s:{mpr:.004},d:'Regenerate 0.4% mana per second.'}},
 'Bone Shards':{i:'🦴',k:'fan',n2:5,m:.8,cd:7,col:0xe8e0c8,d:'Fires a spray of bone shards.',emp:{k:'stat',s:{thorns:.15},d:'Reflect 15% of damage taken.'}},
 'Radiance':{i:'🌟',k:'heal',v:.12,cd:12,col:0xffe08a,d:'Heals you for 12% of your max health.',emp:{k:'healp',v:.04,cd:6,d:'Heal 4% of your max health every 6s.'}},
 'Soul Siphon':{i:'💜',k:'beam',m:1.8,cd:8,fx:{drain:.4},col:0xb07aff,d:'A beam that siphons life.',emp:{k:'stat',s:{mdP:.12,maP:.1},d:'+12% magical defense and +10% magical attack.'}},
 'Spectral Ward':{i:'🕯️',k:'shield',v:.2,dur:8,cd:14,nova:1.6,col:0xb0a0ff,d:'Shields you for 20% max health and blasts enemies nearby.',emp:{k:'stat',s:{dr:.12},d:'12% damage reduction.'}},
 'Spore Puff':{i:'🍄',k:'nova',m:.9,cd:6,r:2.4,fx:{poison:4},col:0xc08aff,d:'A cloud of poison spores.',emp:{k:'regen',v:.006,d:'Regenerate 0.6% health per second.'}},
 'Web Snare':{i:'🕸️',k:'bolt',m:.8,cd:7,fx:{root:2},col:0xe8e8ff,d:'Webbing that roots the target in place.',emp:{k:'onhit',fx:'root',ch:.12,d:'Your hits have a 12% chance to root.'}},
 'Choking Spores':{i:'☁️',k:'rain',m:.6,ticks:8,iv:.5,r:2.8,cd:11,fx:{poison:3,weak:3},col:0x7ad8a0,d:'Poisonous spores that also weaken.',emp:{k:'pulse',m:.7,r:2.6,cd:7,fx:'poison',d:'Every 7s you release a poison pulse.'}},
 'Widow\'s Kiss':{i:'💋',k:'bite',m:2.2,cd:8,fx:{poison:6},col:0xd02a4a,d:'A lethal, deeply poisonous bite.',emp:{k:'stat',s:{cdm:.15,crit:.06},d:'+15% critical damage and +6% critical chance.'}},
 'Brood Swarm':{i:'🐝',k:'rain',m:1.0,ticks:8,iv:.4,r:3,cd:12,col:0xffd060,d:'A swarm that stings everything in the area.',emp:{k:'stat',s:{paP:.1,maP:.1},d:'+10% physical and magical attack.'}},
 // evolution spells (shared by the family; stage 1, 2, 3)
 'Pack Howl':{i:'📯',k:'buff',buff:{paP:.15},dur:8,cd:16,col:0xffb060,d:'Rallies you: +15% physical attack for 8s.'},
 'Savage Pounce':{i:'🐾',k:'bite',m:2.4,cd:9,fx:{stun:1},col:0xe8833a,d:'A crushing pounce that stuns.'},
 'Alpha Roar':{i:'🦁',k:'nova',m:2.5,cd:12,r:3.4,fx:{weak:5},col:0xffa040,d:'A roar that blasts and weakens all nearby.'},
 'Earthen Bulwark':{i:'🧱',k:'shield',v:.2,dur:8,cd:16,col:0xb0a070,d:'Shields you for 20% of your max health.'},
 'Boulder Toss':{i:'🪨',k:'bolt',m:2.4,big:1,cd:9,fx:{stun:1},col:0xa09070,d:'Hurls a boulder that stuns.'},
 'Tectonic Slam':{i:'🌋',k:'nova',m:3.0,cd:13,r:3.6,fx:{stun:1.2},col:0xc08050,d:'Splits the earth around it.'},
 'Tailwind':{i:'🌬️',k:'buff',buff:{as:.2},dur:8,cd:16,col:0xbfe8ff,d:'+20% attack speed for 8s.'},
 'Cyclone':{i:'🌀',k:'nova',m:1.8,cd:10,r:3.2,col:0xbfe8d0,d:'A whirling cyclone around it.'},
 'Skyfall':{i:'🌠',k:'rain',m:1.4,ticks:6,iv:.4,r:3,cd:13,col:0xffe8a0,d:'Feathers of light rain from the sky.'},
 'Scale Armor':{i:'🛡️',k:'buff',buff:{dr:.15},dur:8,cd:16,col:0xd04a2a,d:'15% damage reduction for 8s.'},
 'Inferno':{i:'🔥',k:'cone',m:2.6,cd:11,r:3.4,fx:{burn:5},col:0xff5a1a,d:'A torrent of flame.'},
 'Cataclysm':{i:'☄️',k:'meteor',m:4,r:3.4,delay:1,cd:16,col:0xff4a1a,d:'Calls down a burning meteor.'},
 'Mend':{i:'💖',k:'heal',v:.2,cd:14,col:0x9affb0,d:'Heals you for 20% of your max health.'},
 'Hex':{i:'🔮',k:'bolt',m:1.6,cd:7,fx:{weak:6},col:0xb07aff,d:'A curse that weakens.'},
 'Requiem':{i:'🎻',k:'nova',m:3.0,cd:13,r:3.4,fx:{drain:.3},col:0x9a7aff,d:'A wail that drains all nearby.'},
 'Regrowth':{i:'🌿',k:'heal',v:.15,cd:12,col:0x9aff7a,d:'Heals you for 15% of your max health.'},
 'Plague':{i:'🦠',k:'rain',m:.8,ticks:8,iv:.5,r:3,cd:12,fx:{poison:5},col:0x9ad84a,d:'A plague cloud that poisons heavily.'},
 'Devour':{i:'🕷️',k:'bite',m:3.0,cd:11,fx:{drain:.5},col:0xc02a4a,d:'Devours a target, healing for half.'}
};
const EVSP={Beast:['Pack Howl','Savage Pounce','Alpha Roar'],Earth:['Earthen Bulwark','Boulder Toss','Tectonic Slam'],Sky:['Tailwind','Cyclone','Skyfall'],Dragon:['Scale Armor','Inferno','Cataclysm'],Spirit:['Mend','Hex','Requiem'],Swarm:['Regrowth','Plague','Devour']};
const EVLV=[20,40,50];
