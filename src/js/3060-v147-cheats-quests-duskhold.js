// ================= v147 cheats: all quests complete · Max Duskhold =================
// Two more rows in Settings → Cheats (behind the v90 password like every other control inside #cheatBox).
// 1. All quests complete (cheatQuests147): every Cheddar quest in every zone instance is marked done (CHQ132.st s:3; no rewards are
//    paid, so XP and loot stay as they are), and the three Kindlelight main quests are finished: The Lantern Road (MQ143.st 3, every
//    lamp lit), The Glowmire Crystal (MQ144.st 3: Vorraxis counts as slain, the crystal as claimed) and The Three Sigils (MQ145, every
//    sigil found and attuned). Their gateways open. A Vorraxis fight or a sigil ritual in progress is cleared the way a load clears it.
//    Saved through each quest's own x2Save hook.
// 2. Max Duskhold (cheatDusk147): every shop built (SH.shop, as cheatShops does), every stronghold upgrade (SHU) at level 3, every
//    shop upgrade (SHPU109, the Trading Post too) at SHP109_MAX, all HS103_MAX houses with two citizens each, and every citizen's
//    trade at rank CZ105_RMAX. That fills all 20 lots (smith + 8 shops + 5 upgrade buildings + 6 houses), so the kingdom's size
//    goes to its last stage (kfStage109 → 5, saved implicitly: kfNeed109 recomputes it from the buildings on load). kfApply109
//    rebuilds walls, tiles and lots; shApply raises the buildings and the prestige halls. Free: no gold or materials are taken.
{const box=$('cheatBox');if(box)box.insertAdjacentHTML('beforeend',`
   <div class="chr"><span>📜 All quests complete<small>Finishes every Cheddar quest and the Kindlelight main quests (no rewards)</small></span><span class="chb"><button id="ch_quests">Complete all</button></span></div>
   <div class="chr"><span>🏰 Max Duskhold<small>Biggest Duskhold, every building built, every upgrade at max, free</small></span><span class="chb"><button id="ch_dusk">Max it out</button></span></div>`)}

function cheatQuests147(){let nc=0,nm=0;
  // Cheddar's quests, every instance of every zone
  try{for(const id in CHQ132_ID){const q=CHQ132_ID[id],S=CHQ132.st[id];if(S&&S.s===3)continue;
      CHQ132.st[id]={s:3,p:q.o.map(o=>Math.max(1,o[1]|0)),cj:S&&S.cj};nc++}
    CHQ132.trkK='';CHQ132.mkK='';if(CHQ132.e)CHQ132.e.mkK='';chqTrk132()}catch(e){console.warn('v147 cheddar',e)}
  // 1 · The Lantern Road
  try{if(MQ143.st<3)nm++;MQ143.st=3;MQ143.lit=new Array(mq143N()).fill(1);MQ143.b=0;MQ143.roll=null;MQ143.fire=null;MQ143.seen=1;MQ143.trkK='';
    if(MQ143.S)mq143Sync()}catch(e){console.warn('v147 mq143',e)}
  // 2 · The Glowmire Crystal
  try{if(MQ144.st<3)nm++;if(MB144A&&MB144A.f)mb144Reset();
    if(MQ144.e&&!MQ144.e.dead){try{removeE(MQ144.e)}catch(_){}}MQ144.e=null;
    MQ144.st=3;MQ144.seen=1;MQ144.trkK='';mb144LairSync();mq144GateSync()}catch(e){console.warn('v147 mq144',e)}
  // 3 · The Three Sigils
  try{if(mq145N()<3)nm++;if(MQ145.R)mq145Fail('left');
    MQ145.at=[1,1,1];MQ145.fd=[1,1,1];MQ145.trkK='';mq145Sync();mq145GateSync()}catch(e){console.warn('v147 mq145',e)}
  try{hud();ui();rX()}catch(_){}try{saveGame(true)}catch(_){}
  if(!nc&&!nm){say('📜 Every quest is already complete.');return 0}
  try{banner('📜 ALL QUESTS COMPLETE','Cheddar’s errands and the Kindlelight main quests','Every gateway stands open')}catch(_){}try{sfx('power')}catch(_){}
  say('📜 Cheat: '+nc+' of Cheddar’s quest'+(nc==1?'':'s')+' and '+nm+' main quest'+(nm==1?'':'s')+' marked complete.');return nc+nm}

function cheatDusk147(){const s0=KF109.s;let sh=0,up=0,su=0,hs=0,rk=0;
  // shops, stronghold upgrades, shop upgrades
  SHOPS.forEach(o=>{if(!shopBuilt(o.k)){SH.shop[o.k]=1;sh++}});
  SHU.forEach(u=>{if(shL(u.k)<3){SH.lv[u.k]=3;up++}});
  SHPU109.forEach(u=>{if(u.g&&shpL109(u.k)<SHP109_MAX){SHP109.lv[u.k]=SHP109_MAX;su++}});
  if(su){try{stock2=null}catch(_){}try{mstock=null}catch(_){}}   // restock the Trading Post and Magic Shop at the new level
  // houses: same names and citizens hsBuy103 gives; the lots are handed out below, once the kingdom is at its biggest
  while(HS103.h.length<HS103_MAX){const n=HS103.h.length,used=new Set(HS103.h.map(h=>h.nm)),nm=(HS103_NM.find(q=>!used.has(q+' House'))||'New')+' House';
    HS103.h.push({nm,v:n%3});
    const taken=new Set(HS103.cit.map(c=>c.n)),pool=HS103_CN.filter(q=>!taken.has(q));
    for(let j=0;j<2;j++){const k=pool.splice(Math.floor(Math.random()*pool.length),1)[0]||('Citizen '+(HS103.cit.length+1));
      HS103.cit.push({n:k,h:n,task:'',t0:0,lk:Math.floor(Math.random()*1e6)})}
    hs++}
  HS103.cit.forEach(c=>{if(czRank105(c)<CZ105_RMAX){c.rk=CZ105_RMAX;rk++}});
  // the walls move out to the last stage, then every building gets its lot and is raised
  try{kfApply109(true)}catch(e){console.warn('v147 size',e)}
  try{shApply()}catch(e){console.warn('v147 build',e)}
  try{CZ103.ver=-1}catch(_){}
  try{hud();ui();rX()}catch(_){}try{saveGame(true)}catch(_){}
  const grew=KF109.s>s0;
  if(!sh&&!up&&!su&&!hs&&!rk&&!grew){say('🏰 Duskhold is already at its biggest, with everything built and upgraded.');return 0}
  try{banner('🏰 DUSKHOLD AT ITS GREATEST','Every shop, house and upgrade · the walls at their widest','Visit the Stronghold Steward')}catch(_){}try{sfx('power')}catch(_){}
  const p=[];if(grew)p.push('walls at the last stage');if(sh)p.push(sh+' shop'+(sh>1?'s':'')+' built');if(up)p.push(up+' stronghold upgrade'+(up>1?'s':'')+' to level 3');
  if(su)p.push(su+' shop upgrade'+(su>1?'s':'')+' to level '+SHP109_MAX);if(hs)p.push(hs+' house'+(hs>1?'s':'')+' built');if(rk)p.push(rk+' citizen'+(rk>1?'s':'')+' to rank '+CZ105_RMAX);
  say('🏰 Cheat: Max Duskhold — '+(p.join(', ')||'everything was already done')+'.');return 1}

{const a=$('ch_quests');if(a)a.onclick=()=>cheatQuests147();const b=$('ch_dusk');if(b)b.onclick=()=>cheatDusk147()}
