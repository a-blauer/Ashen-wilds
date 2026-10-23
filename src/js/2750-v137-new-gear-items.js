// ================= v137: 150 new pieces of gear, each with a model of its own =================
// Appended to ITPL after the 200 older templates (saves store template indices, so nothing is inserted or reordered):
//  * 50 weapons (every class weapon type, 3–4 each, all tiers), 8 Paladin shields, 72 armour pieces (24 themed lines of
//    helm + chest + boots, six per armour type) and 20 pieces of jewellery (10 amulets, 10 rings).
//  * Each one has a model of its own (files 2755–2790): a weapon or shield recipe of its own (W137 / SH137), a base shape
//    plus a theme motif placed on the finished body for armour (A137), a pendant or ring of its own for jewellery (J137).
//    The same model shows in the hand / on the body, in the item picture and on the ground.
//  * Template fields as the v78 ones: nw (new, the tooltip tag), imp (an innate bonus), plus v7 = the model key.
//  * Loot, shops, sets, legendary powers and uniques pick them up through ITPL like any other template.
var ITPL_V137=ITPL.length;
// armour lines: theme word, armour, tier, [material, accent, trim], motif, base shape per slot [helm, chest, boots], piece names, innate bonus
var A137L=[
 // ---- heavy (Warrior · Paladin) ----
 ['Gravewarden','heavy',0,[0x4a4c48,0x5a6a4a,0x8a8a7a],'chain',['nasal','mail','hobnail'],['Helm','Hauberk','Sabatons'],{hpP:.03,regen:.0008}],
 ['Bonelord','heavy',1,[0x5a544c,0xd8ccb0,0x9a8a68],'bone',['horned','blood','stomper'],['Helm','Plate','Greaves'],{hpP:.04,ls:.004}],
 ['Briarsworn','heavy',2,[0x3a4034,0x6a1a1a,0x7a6a4a],'thorn',['barbute','cuirass','greave'],['Barbute','Cuirass','Greaves'],{paP:.04,crit:.015}],
 ['Reliquarian','heavy',2,[0x8a8478,0xd8c070,0xe0c060],'candle',['crowned','aegis','sabaton'],['Crown-Helm','Aegis','Sabatons'],{hpP:.05,regen:.0012}],
 ['Dreadknight','heavy',3,[0x24232a,0x8a1420,0x8a8e98],'spike',['great','warplate','wall'],['Greathelm','Warplate','Stompers'],{paP:.06,cdm:.1}],
 ['Abyssal','heavy',4,[0x1c1a24,0x7a3ad8,0xb0a0d0],'eye',['winged','warlord','tread'],['Visage','Carapace','Treads'],{paP:.06,hpP:.06}],
 // ---- medium (Ranger) ----
 ['Trapper','medium',0,[0x5a4630,0x8a6a40,0xa89070],'fang',['pelt','padded','trail'],['Cap','Jerkin','Boots'],{loot:.05,mspd:.02}],
 ['Crowfeather','medium',1,[0x2a2a30,0x4a4a6a,0x9a9aa8],'feather',['feather','brigandine','pelt'],['Cowl','Coat','Boots'],{as:.03,crit:.01}],
 ['Bogstalker','medium',2,[0x3a4a30,0x7a8a3a,0x8a7a5a],'root',['cowl','vest','stalker'],['Hood','Vest','Waders'],{regen:.0015,mspd:.03}],
 ['Hornwood','medium',3,[0x5a3e28,0xd8c8a0,0xa88848],'horn',['deadeye','bandolier','strider'],['Hood','Harness','Striders'],{cdm:.12,paP:.04}],
 ['Gravehound','medium',3,[0x40383a,0xc8c0b0,0x8a8070],'skull',['skullhood','longcoat','pelt'],['Hood','Longcoat','Boots'],{ls:.006,crit:.02}],
 ['Moonhunter','medium',4,[0x26303e,0x9ad8ff,0xc8d4e0],'moon',['wind','tails','gale'],['Mask','Mantle','Boots'],{as:.05,crit:.03}],
 // ---- light (Assassin) ----
 ['Gutterblade','light',0,[0x34302e,0x6a4a3a,0x8a8278],'blade',['wrap','wraps','soft'],['Mask','Wraps','Footwraps'],{crit:.015,mspd:.02}],
 ['Widowsilk','light',1,[0x1e1c22,0x8a1a2a,0x8a8a94],'web',['viper','cutthroat','wrapped'],['Mask','Garb','Wraps'],{crit:.02,ls:.004}],
 ['Plaguebird','light',2,[0x2e3028,0x7aa83a,0x7a7462],'vial',['ashcowl','venom','ashstep'],['Beak','Coat','Steps'],{ls:.006,cdm:.1}],
 ['Shadowfang','light',3,[0x1a1a22,0xd8d0c0,0x7a7e88],'fang',['glassmask','scale','glass'],['Mask','Shroud','Treads'],{crit:.03,as:.03}],
 ['Bloodveil','light',3,[0x2a1418,0xc8203a,0x9a7a7a],'ribbon',['bandana','shroud','storm'],['Veil','Raiment','Slippers'],{ls:.008,crit:.02}],
 ['Voidwalker','light',4,[0x16141e,0x9a5aff,0xa8a0c8],'crystal',['stormhood','raiment','storm'],['Hood','Garb','Steps'],{crit:.04,cdm:.15}],
 // ---- cloth (Mage) ----
 ['Candlemourn','cloth',0,[0x3a3440,0xe8d8a8,0xa89a78],'candle',['linen','robe','sandal'],['Hood','Robe','Sandals'],{maP:.03,regen:.0008}],
 ['Bonescribe','cloth',1,[0x5a4a36,0xd8ccb0,0xa88848],'scroll',['hat','moss','slipper'],['Hat','Robe','Slippers'],{xp:.05,cdr:.02}],
 ['Hexbound','cloth',2,[0x2a2034,0x5aff9a,0x8a8a98],'rune',['tallcowl','binder','pyre'],['Cowl','Vestments','Slippers'],{cdr:.04,maP:.04}],
 ['Ravenkin','cloth',2,[0x1e1e26,0x5a6aa8,0x8a8a9a],'feather',['witch','witch','slipper'],['Hat','Robe','Boots'],{maP:.05,mspd:.02}],
 ['Soulreaver','cloth',3,[0x1a2428,0x5affd8,0x8aa0a0],'skull',['circlet','vestments','lich'],['Circlet','Vestments','Boots'],{maP:.06,ls:.005}],
 ['Starless','cloth',4,[0x10121e,0xb05aff,0xd8b050],'eye',['star','regalia','tempest'],['Crown','Regalia','Steps'],{maP:.07,cdr:.05}]];
{
  const W=(cls,wt,list)=>list.forEach(([n,t,imp,v7])=>ITPL.push({n,sl:'weapon',cls,wt,t,imp,nw:1,v7}));
  W('warrior','gs',[['Gravedigger Blade',0,{hpP:.03},'gs_grave'],['Flamberge of Ashes',2,{paP:.05},'gs_flame'],["Executioner's Oath",3,{cdm:.15},'gs_exec'],['Ruinbringer',4,{paP:.06,crit:.02},'gs_ruin']]);
  W('warrior','ga',[["Woodsplitter's Grudge",0,{paP:.03},'ga_wood'],['Crescent Harvester',2,{ls:.006},'ga_moon'],['Maw of Gorrath',4,{cdm:.2,paP:.04},'ga_maw']]);
  W('warrior','axes',[['Tomb-Robber Hatchets',1,{loot:.06,as:.02},'ax_tomb'],['Raven Beak Axes',2,{as:.04},'ax_raven'],['Twin Widowmakers',4,{as:.06,crit:.02},'ax_widow']]);
  W('warrior','halberd',[["Watchman's Bardiche",0,{hpP:.03},'hb_watch'],['Bonereaper Glaive',2,{ls:.006,hpP:.03},'hb_reaper'],['Pale Rider Partisan',3,{hpP:.05,crit:.02},'hb_pale']]);
  W('paladin','mace',[["Pilgrim's Knobstick",0,{regen:.0008},'mc_pilgrim'],['Censer of Penance',2,{regen:.0015,hpP:.03},'mc_censer'],["Saint's Reliquary",4,{hpP:.06,paP:.04},'mc_relic']]);
  W('paladin','hammer',[['Gravewright Maul',1,{paP:.03},'hm_grave'],['Anvil of Vigil',3,{hpP:.05,paP:.03},'hm_anvil'],['Judgement Bell',4,{paP:.06,cdm:.12},'hm_bell']]);
  W('paladin','flail',[['Thresher of Sins',1,{ls:.005},'fl_thresh'],['Three-Skull Scourge',2,{ls:.007,crit:.01},'fl_skulls'],['Halo Morningstar',4,{ls:.01,paP:.04},'fl_halo']]);
  W('assassin','dagger',[['Rat-Catcher Shivs',0,{crit:.015},'dg_rat'],['Kris of the Hollow Moon',2,{crit:.025,cdm:.08},'dg_kris'],['Veilpiercer Stilettos',4,{crit:.04,cdm:.12},'dg_veil']]);
  W('assassin','claws',[['Ghoul Hooks',1,{ls:.005},'cl_ghoul'],['Mantis Scythes',3,{crit:.03,as:.03},'cl_mantis'],['Nightmare Talons',4,{crit:.035,ls:.008},'cl_night']]);
  W('assassin','knives',[['Crow Feather Darts',0,{mspd:.02},'kn_crow'],['Blackstar Shuriken',2,{mspd:.03,crit:.015},'kn_star'],['Fang-of-Asp Kunai',3,{crit:.025,ls:.005},'kn_asp']]);
  W('ranger','bow',[['Briar Longbow',0,{crit:.015},'bw_briar'],['Antler Recurve',2,{cdm:.1,crit:.015},'bw_antler'],['Wyrmrib Warbow',4,{cdm:.18,as:.04},'bw_wyrm']]);
  W('ranger','crossbow',[["Trapper's Latchbow",1,{cdm:.1},'xb_trap'],['Skullcrank Arbalest',3,{cdm:.16,paP:.03},'xb_skull'],['Black Watch Repeater',4,{as:.05,cdm:.15},'xb_watch']]);
  W('ranger','sling',[['Gravel-Wolf Sling',0,{loot:.05},'sl_wolf'],['Jawbone Sling',2,{loot:.08,crit:.015},'sl_jaw'],['Comet Sling',4,{loot:.1,as:.04},'sl_comet']]);
  W('mage','staff',[["Hangman's Branch",0,{maP:.03},'st_hang'],['Candlewick Crozier',1,{maP:.03,regen:.0008},'st_candle'],['Eye of the Abyss',3,{maP:.06,cdr:.03},'st_eye'],['Crown of Thorns',4,{maP:.07,ls:.005},'st_thorn']]);
  W('mage','wand',[['Grave-Finger Wand',0,{cdr:.02},'wd_finger'],['Serpent Wand',2,{cdr:.035,crit:.01},'wd_snake'],['Shard of the Void',4,{cdr:.05,maP:.04},'wd_void']]);
  W('mage','orb',[['Bottled Wisp',1,{maP:.04},'ob_jar'],['Skull of the Seer',2,{maP:.05,xp:.04},'ob_seer'],['Black Sun',4,{maP:.08},'ob_sun']]);
  [['Coffin-Lid Shield',0,{hpP:.03},'sh_coffin'],['Ossuary Kite',1,{hpP:.04},'sh_ossuary'],['Thornwall Heater',1,{ls:.004,hpP:.02},'sh_thorn'],['Weeping Saint Pavise',2,{regen:.0015,hpP:.03},'sh_saint'],
   ['Lantern Bulwark',2,{hpP:.05},'sh_lantern'],['Bloodmoon Aegis',3,{ls:.006,hpP:.04},'sh_moon'],["Gorgon's Glare",3,{hpP:.05,crit:.015},'sh_gorgon'],['Bastion of the Last Dawn',4,{hpP:.07,regen:.002},'sh_dawn']]
    .forEach(([n,t,imp,v7])=>ITPL.push({n,sl:'offhand',cls:'paladin',t,imp,nw:1,v7}));
  A137L.forEach(L=>['helm','chest','boots'].forEach((sl,i)=>ITPL.push({n:L[0]+' '+L[6][i],sl,arm:L[1],t:L[2],imp:Object.assign({},L[7]),nw:1,v7:'a|'+L[0]+'|'+i,a7:L})));
  const J=(sl,list)=>list.forEach(([n,t,imp,v7])=>ITPL.push({n,sl,t,imp,nw:1,v7}));
  J('amulet',[["Hangman's Knot",0,{hpP:.03},'am_knot'],['Crow Skull Fetish',0,{loot:.06},'am_crow'],['Weeping Eye Pendant',1,{cdr:.03},'am_eye'],['Coffin Nail Charm',1,{crit:.015,hpP:.02},'am_nail'],
    ['Reliquary Phial',2,{regen:.0018},'am_phial'],['Thorned Heart',2,{ls:.008},'am_heart'],['Moth-Wing Brooch',3,{mspd:.04,as:.03},'am_moth'],["Lich's Phylactery",3,{maP:.05,cdr:.03},'am_lich'],
    ['Black Moon Torc',4,{crit:.03,cdm:.15},'am_moon'],['Heart of the Hollow King',4,{hpP:.08,paP:.04},'am_king']]);
  J('ring',[['Iron Knuckle Coil',0,{paP:.02},'rg_coil'],['Grave-Dirt Band',0,{regen:.0008},'rg_dirt'],['Serpent Eye Ring',1,{crit:.02},'rg_snake'],['Twin Fang Band',1,{ls:.005},'rg_fang'],
    ["Widow's Web Ring",2,{crit:.02,cdm:.08},'rg_web'],['Ring of Ashen Vows',2,{maP:.04,paP:.03},'rg_ash'],['Skull Signet',3,{cdm:.14},'rg_skull'],['Bleeding Thorn Ring',3,{ls:.008,crit:.015},'rg_thorn'],
    ['Eclipse Band',4,{crit:.03,as:.04},'rg_eclipse'],["Drowned King's Seal",4,{maP:.06,hpP:.05},'rg_drown']]);
}
// the lines' palettes (material, accent, trim) — mdDX gives the v78 sets theirs the same way
A137L.forEach(L=>{MD_SETPAL[L[0]]=L[3]});
// model key → template (and back)
var V137={};ITPL.forEach((t,i)=>{if(i>=ITPL_V137&&t.v7)V137[t.v7]=i});
function v137T(it){const t=it&&ITPL[it.tp];return t&&it.tp>=ITPL_V137&&t.v7?t:null}

// ---------------- loot: an empty pool (no template of that tier, slot and class) no longer breaks the roll ----------------
function genItem_base(l,o){
  o=o||{};const T=tierOfLv(l)-1,want=o.cls||(Math.random()<.7?hero.cls:CLSK[R(0,4)]);
  let pool=ITPL.filter(t=>t.t==T&&fitsCls(t,want));const sl=o.sl;
  if(sl){const p2=pool.filter(t=>t.sl==sl);if(p2.length)pool=p2;else{const p3=ITPL.filter(t=>t.sl==sl&&fitsCls(t,want));if(p3.length){const near=Math.min(...p3.map(t=>Math.abs(t.t-T)));pool=p3.filter(t=>Math.abs(t.t-T)==near)}}}
  if(!pool.length)pool=ITPL.filter(t=>t.t==T);if(!pool.length)pool=ITPL.slice(0,1);
  const ws=pool.map(t=>t.sl=='weapon'?3:t.sl=='offhand'?1.2:t.sl=='chest'?2:t.sl=='amulet'||t.sl=='ring'?1.2:1.6);let r0=Math.random()*ws.reduce((a,b)=>a+b,0),tp=pool[0];
  for(let i=0;i<pool.length;i++){r0-=ws[i];if(r0<0){tp=pool[i];break}}
  const r=rolR2(l,o.minR||0,o.bonus),it={id:uid++,tp:ITPL.indexOf(tp),lv:l,req:Math.max(1,l-2),r,up:0,aff:[]};
  const keys=Object.keys(AFX).filter(k=>!(tp.sl=='weapon'&&k=='mp'));
  for(let i=0;i<r;i++){const k=keys.splice(R(0,keys.length-1),1)[0],A_=AFX[k];it.aff.push({k,v:A_[1]=='n'?Math.round(A_[2]*(2+l)*(.8+Math.random()*.5)):+(A_[2]*(1+T*.45)*(.8+Math.random()*.5)).toFixed(4)})}
  return it;
}
