// ================= v36: Save / load (browser storage) =================
const SAVE_KEY='et_save_v1';
function hasSave(){try{return !!localStorage.getItem(SAVE_KEY)}catch(_){return false}}
function saveInfo(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));return s&&s.hero?s:null}catch(_){return null}}
function gameSnapshot(){
  const now=performance.now(),P=inDun?inDun.ret:inRealm&&ret?ret:{x:pl.position.x,z:pl.position.z};
  return {v:1,at:Date.now(),uid,gold,pots,
    hero:{cls:hero.cls,name:hero.name,lvl:hero.lvl,xp:hero.xp,tal:hero.tal,hp:hero.hp,mp:hero.mp,
      buffs:hero.buffs.filter(b=>!b.perm&&b.t>now&&(b.food||b.elix)).map(b=>({s:b.s,rem:b.t-now,n:b.n,i:b.i,d:b.d,k:b.k,food:b.food,elix:b.elix}))},
    party,gear,eq,eggs,incS,mats,have,sup,skills,kills,rest,
    pos:{x:P.x,z:P.z,realm:inRealm&&!inDun},wv:3,home:TOWNS.indexOf(home),seen:TOWNS.map(t=>!!t.seen),
    realm:{terr:Array.from(terr),blocks,seen:seenRealm,
      decor:Object.values(decor).map(d=>({k:d.it.key,x:d.x,y:d.y,z:d.z,r:d.rot,crop:d.crop||null,hive:d.hive||null,cost:d.cost||null})),
      pcs:Object.values(pcs).map(p=>({k:p.k,m:p.m,h:p.h,t:p.t,o:p.o,i:p.i,j:p.j,x:p.x,z:p.z,r:p.r,key:p.key,cost:p.cost,open:p.open}))},
    mounts,meggs,mActive,bossDone:[...bossDone],dunClears,bounties,bSeq,x2:typeof x2Save=='function'?x2Save():null};
}
function saveGame(quiet){
  if(!party.length||AF)return false;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(gameSnapshot()));if(!quiet)say('💾 Game saved.');return true}
  catch(e){if(!quiet)say('Could not save: your browser blocked storage here.');return false}
}
function loadGame(){
  const s=saveInfo();if(!s)return false;
  // hero and inventory
  Object.assign(hero,{cls:s.hero.cls,name:s.hero.name,lvl:s.hero.lvl,xp:s.hero.xp,tal:s.hero.tal||{},cd:{},buffs:[],dc:2,sh:0});
  const now=performance.now();(s.hero.buffs||[]).forEach(b=>hero.buffs.push(Object.assign({},b,{t:now+b.rem})));
  uid=Math.max(uid,s.uid||1);gold=s.gold||0;pots=s.pots||0;
  party=(s.party||[]).map(c=>{c.emp=false;c.cdm={};return ivFix(c)});gear=s.gear||[];eq=s.eq||{};eggs=s.eggs||[];
  Object.keys(incS).forEach(k=>delete incS[k]);Object.assign(incS,s.incS||{});
  Object.assign(mats,s.mats||{});Object.keys(have).forEach(k=>delete have[k]);Object.assign(have,s.have||{});Object.assign(sup,s.sup||{});
  Object.keys(s.skills||{}).forEach(k=>skills[k]=s.skills[k]);Object.assign(kills,s.kills||{});if(s.rest)rest=s.rest;
  mounts=s.mounts||[];meggs=s.meggs||[];mActive=s.mActive||null;
  (s.dunClears&&Object.assign(dunClears,s.dunClears));bounties=s.bounties||[];bSeq=Math.max(bSeq,s.bSeq||1);
  // realm
  const R0=s.realm||{};if(R0.terr)terr.set(R0.terr);seenRealm=!!R0.seen;
  Object.keys(blocks).forEach(k=>delete blocks[k]);Object.assign(blocks,R0.blocks||{});
  Object.values(decor).forEach(d=>RLG.remove(d.g));Object.keys(decor).forEach(k=>delete decor[k]);Object.keys(built).forEach(k=>delete built[k]);
  (R0.decor||[]).forEach(q=>{const it=ITEMS[q.k];if(!it)return;const d=placeDecor(it,q.x,q.y,q.z,q.r||0);if(q.crop){d.crop=q.crop;d.crop.lt=Date.now();d.cs=-2;cropVis(d)}if(q.hive)d.hive=Object.assign(q.hive,{lt:Date.now()});if(q.cost)d.cost=q.cost});
  Object.values(pcs).forEach(p=>RLG.remove(p.g));Object.keys(pcs).forEach(k=>delete pcs[k]);
  (R0.pcs||[]).forEach(q=>{if(!PS[q.k])return;const p=Object.assign({},q);pcs[p.key]=p;mkPiece(p)});
  terrRebuild();bRebuild();rDirty();
  // bosses: powers and opened gates
  bossDone.clear();(s.wv===3?(s.bossDone||[]):[]).forEach(i=>{if(!BOSSES[i])return;bossDone.add(i);const P=BOSSES[i].pw;hero.buffs=hero.buffs.filter(b=>b.n!=P.n);hero.buffs.push({s:P.s,t:Infinity,n:P.n,i:P.i,d:P.d,perm:1})});if(s.wv!==3){hero.buffs=hero.buffs.filter(b=>!b.perm||!BOSSX.some(q=>q.pw.n==b.n));setTimeout(()=>say('🌀 The world has changed: you now start in Duskhold, the floating stronghold. Your level, gear and companions are kept; the portals start from the first one.'),3500)}
  (s.seen||[]).forEach((v,i)=>{if(v&&TOWNS[i])TOWNS[i].seen=1});if(s.home>=0&&TOWNS[s.home])home=TOWNS[s.home];
  hsDirty();hero.hp=Math.min(s.hero.hp||heroMax(),heroMax());hero.mp=Math.min(s.hero.mp||mpMax(),mpMax());if(!(hero.hp>0))hero.hp=heroMax();
  // place the hero
  PV.run=false;$('start').classList.add('hide');
  if(s.wv===3)pl.position.set(s.pos.x,0,s.pos.z);else{const T0=home||TOWNS[0];pl.position.set(T0.sp[0],0,T0.sp[1]);s.pos.realm=false}curTown=-2;snapCam();
  if(s.x2&&typeof x2Load=='function')x2Load(s.x2);
  refreshGear();ui();sync();hud();bTrack();
  if(s.pos.realm){ret={x:s.pos.x,z:s.pos.z};enterRealm()}
  fadeTo(()=>banner('Welcome back, '+hero.name,CLS[hero.cls].i+' '+CLS[hero.cls].n+' · Lv '+hero.lvl,bossDone.size+' of 6 portal maps cleared'));
  return true;
}
function deleteSave(){try{localStorage.removeItem(SAVE_KEY)}catch(_){}}
// autosave every 30 seconds and when the tab is hidden or closed
setInterval(()=>{if(party.length&&!uiOpen())saveGame(true)},30000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame(true)});
addEventListener('pagehide',()=>saveGame(true));
// continue / new game prompt after the layout picker
$('devp').addEventListener('click',e=>{if(!e.target.closest('[data-dev]'))return;const s=saveInfo();if(!s)return;
  const C=CLS[s.hero.cls]||{i:'',n:''},d=new Date(s.at);
  $('svpI').innerHTML=`${C.i} <b>${s.hero.name}</b> · Lv ${s.hero.lvl} ${C.n}<br><small class="mut">${(s.party||[]).length} creature${(s.party||[]).length==1?'':'s'} · 🪙 ${s.gold} · ${s.wv===3?(s.bossDone||[]).length:0} map${(s.bossDone||[]).length==1?'':'s'} defeated · saved ${d.toLocaleString()}</small>`;
  $('svp').classList.remove('hide')});
$('svpC').onclick=()=>{$('svp').classList.add('hide');if(!loadGame())say('That save could not be loaded.')};
$('svpN').onclick=()=>{if(!$('svpN').dataset.sure){$('svpN').dataset.sure=1;$('svpN').textContent='Tap again: this replaces your save';return}deleteSave();$('svp').classList.add('hide')};
$('saveBtn').onclick=()=>saveGame(false);
$('delSave').onclick=()=>{if(!$('delSave').dataset.sure){$('delSave').dataset.sure=1;$('delSave').textContent='Click again to delete for good';return}deleteSave();$('delSave').textContent='Saved game deleted';};
