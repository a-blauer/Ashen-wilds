// ================= v89 misc: two more cheats (Settings → Cheats): unlock all shops, +100 of every resource =================
// Unlock all shops builds every SHOPS entry (Stable and Magic Shop included) the same way the Steward does after payment:
// SH.shop[k]=1 → shApply() (shBuild/shSites, kdSync, stableSync wrappers) → save. Resources: every crafting and gathering
// material (RES), creature-family material (FAM), upgrade material (UPM), anything a shop/upgrade/recipe asks for, and
// the gathered supplies (meat, fish, berries, honey, crops; seeds are left out because y_rework turns them into crops). Gold, gear, runes, food, potions, eggs and companions
// are left alone.
{const box=$('cheatBox');if(box)box.insertAdjacentHTML('beforeend',`
   <div class="chr"><span>🔨 Unlock all shops<small>Builds every Duskhold shop at the Stronghold Steward, free</small></span><span class="chb"><button id="ch_shops">Build all</button></span></div>
   <div class="chr"><span>📦 Add 100 of all resources<small>+100 of every material, upgrade material and gathered supply</small></span><span class="chb"><button id="ch_res">+100 each</button></span></div>`)}
function cheatShops(){const L=SHOPS.filter(o=>!shopBuilt(o.k));
  if(!L.length){say('🔨 Every shop in Duskhold is already built.');return 0}
  L.forEach(o=>{SH.shop[o.k]=1});shApply();
  try{banner('🔨 ALL SHOPS OPEN',L.map(o=>o.n).join(' · '),'Find them in Duskhold')}catch(_){}
  try{sfx('power')}catch(_){}try{hud();ui();rX()}catch(_){}try{saveGame(true)}catch(_){}
  say('🔨 Cheat: built '+L.length+' shop'+(L.length>1?'s':'')+' — '+L.map(o=>o.i+' '+o.n).join(', ')+'.');return L.length}
function cheatResKeys(){const M=new Set(),S=new Set(),okS=k=>SUP[k]&&['ing','crop'].includes(SUP[k].c);
  const one=k=>{if(typeof k!='string'||!k||k.includes(':'))return;if(SUP[k]){if(okS(k))S.add(k)}else M.add(k)};
  Object.keys(RES).forEach(one);Object.values(FAM).forEach(f=>one(f[0]));UPM.forEach(u=>one(u[0]));
  try{Object.values(FAMD).forEach(f=>f&&one(f.mat))}catch(_){}
  [SHU,SHOPS].forEach(T=>T.forEach(o=>(o.m||[]).forEach(q=>one(q[0]))));
  try{[FOOD,ALCH].forEach(T=>T.forEach(r=>Object.keys(r[3]||{}).forEach(one)))}catch(_){}
  try{Object.values(ITEMS).forEach(it=>it&&it.rec&&Object.keys(it.rec).forEach(one))}catch(_){}
  Object.keys(SUP).forEach(k=>{if(okS(k))S.add(k)});
  return {mats:[...M],sup:[...S]}}
function cheatRes(n){n=n||100;const K=cheatResKeys();K.mats.forEach(k=>{mats[k]=(mats[k]||0)+n});K.sup.forEach(k=>{sup[k]=(sup[k]||0)+n});
  try{hsDirty()}catch(_){}try{hud();ui();rX()}catch(_){}try{saveGame(true)}catch(_){}
  say('📦 Cheat: +'+n+' of '+(K.mats.length+K.sup.length)+' resources ('+K.mats.length+' materials, '+K.sup.length+' supplies).');return K}
{const a=$('ch_shops');if(a)a.onclick=()=>cheatShops();const b=$('ch_res');if(b)b.onclick=()=>cheatRes(100)}
