// ================= v200: the Scholar's Tower keeps a collection log =================
// Owner (Nov 5 2026): "make scholars tower a collection log station where you can get rewards for filling out certain sections
// similar to runescape's collection log. Remove the current collection log system that rewards filling out beastiary."
//  * CL200.S: 17 sections, each a list of things to collect (creatures defeated, species tamed, fish caught, mounts, runes,
//    uniques, Sovereigns, rare breeds). A section is complete when every entry is ticked; its reward is claimed at the
//    Scholar's Tower. The tower's level decides which rewards can be claimed: level 1 novice (★), 2 adept (★★), 3 master (★★★).
//  * Things the game doesn't remember by itself are recorded as they happen (CL200.got, saved): every unique, mount, rune
//    (any rank) and rare / shiny companion you have held. cl200Scan looks over your bag, gear, sockets and party.
//  * Rewards: gold, eggs, runes and permanent bonuses (hero.buffs perm, as the old Bestiary rewards were). Bonuses claimed from the
//    old Bestiary points (Scholar I / II, Master Tamer) stay with your hero.
//  * The Bestiary's old Rewards tab now shows the log (read only, 0440).
// Co-op: personal (your log, your hero); the claim tier follows the tower of the kingdom you see.
var CL200={got:new Set(),claim:new Set(),open:{}};
function cl200Add(k){if(k&&!CL200.got.has(k))CL200.got.add(k)}
function cl200Scan(){try{(gear||[]).concat(Object.values(eq||{})).forEach(it=>{if(!it)return;if(it.u)cl200Add('u:'+it.u);(Array.isArray(it.ru)?it.ru:[]).forEach(r=>{if(typeof r=='string')cl200Add('r:'+r)})});
  for(const k in sup)if(/^r_[a-z]+[23]?$/.test(k)&&sup[k]>0)cl200Add('r:'+k);
  (mounts||[]).forEach(m=>m&&m.k&&cl200Add('m:'+m.k));
  (party||[]).forEach(c=>{if(!c)return;if(c.shn)cl200Add('shn');if(c.rv)cl200Add('rv:'+c.rv);(Array.isArray(c.ru)?c.ru:[]).forEach(r=>{if(typeof r=='string')cl200Add('r:'+r)})});
  try{dexScan()}catch(_){}}catch(e){console.warn('v200 log scan',e)}}
setInterval(()=>{try{if(typeof party!='undefined'&&party.length)cl200Scan()}catch(_){}},5000);
// ---------------- the sections ----------------
function cl200Zone(z){const W=dex141Where();return dex141Keys().filter(k=>{const w=(W[k]||[])[0];return w&&w.z===z}).map(k=>({n:EN[k].n,ic:EN[k].e||'❔',got:(kills[k]||0)>0}))}
function cl200Sp(T){return SPK.filter(n=>T.includes(SP2[n][1])).map(n=>({n,ic:SP2[n][3],got:dex.own.has(n)}))}
function cl200Fish(f){return FISH.filter(f).map(q=>({n:q[0],ic:q[1],got:(fishLog[q[0]]||0)>0}))}
function cl200Runes(r){return RN194K.map(t=>{const k=r>1?rn194Key(t,r):'r_'+t;return {n:(typeof rn194Name=='function'?rn194Name(k):k),ic:(RUNES[k]||RUNES['r_'+t]||[0,'🔮'])[1],got:CL200.got.has('r:'+k)}})}
function cl200Buff(n,s,d){return {t:'perm',n,s,d}}
var CL200_S=[
  {k:'z0',n:'Kindlelight Wildlife',i:'🕯️',L:1,it:()=>cl200Zone(0),rw:[{g:1000},{egg:1}]},
  {k:'z1',n:'Hillside Crest Wildlife',i:'⛰️',L:1,it:()=>cl200Zone(1),rw:[{g:2000},{egg:2}]},
  {k:'tame1',n:'First Bonds',i:'🐾',L:1,d:'Tame every Tier 1 species',it:()=>cl200Sp([1]),rw:[{g:1000},{egg:2}]},
  {k:'fish1',n:'The Shallows',i:'🎣',L:1,d:'Catch every fish of the first two tiers',it:()=>cl200Fish(q=>q[2]<=2&&q[3]<3),rw:[{g:1500},{rune:3}]},
  {k:'rune1',n:'Rune Collector',i:'🔮',L:1,d:'Hold every rank I rune',it:()=>cl200Runes(1),rw:[{g:2000},{rune2:1}]},
  {k:'z2',n:'Burningeye Summit Wildlife',i:'🌋',L:2,it:()=>cl200Zone(2),rw:[{g:3500},{egg:3}]},
  {k:'z3',n:'Searing Sands Wildlife',i:'🏜️',L:2,it:()=>cl200Zone(3),rw:[{g:5000},{egg:4}]},
  {k:'tame2',n:'Kindred Spirits',i:'🦊',L:2,d:'Tame every Tier 2 and 3 species',it:()=>cl200Sp([2,3]),rw:[{g:4000},{buff:cl200Buff('Kindred Spirits',{xp:.03},'+3% XP')}]},
  {k:'mount',n:'Stablemaster',i:'🐎',L:2,d:'Own every mount',it:()=>MNTK.map(k=>({n:MOUNTS[k].n,ic:MOUNTS[k].i,got:CL200.got.has('m:'+k)})),rw:[{g:5000},{buff:cl200Buff('Stablemaster',{mspd:.05},'+5% move speed')}]},
  {k:'fish2',n:'Deep Waters',i:'🐠',L:2,d:'Catch every rarer fish',it:()=>cl200Fish(q=>!(q[2]<=2&&q[3]<3)),rw:[{g:4000},{buff:cl200Buff('Angler\'s Luck',{loot:.05},'+5% loot find')}]},
  {k:'z4',n:'The Dirge Wildlife',i:'🌫️',L:3,it:()=>cl200Zone(4),rw:[{g:7000},{egg:5}]},
  {k:'z5',n:'The Citadel Wildlife',i:'🏰',L:3,it:()=>cl200Zone(5),rw:[{g:10000},{egg:5},{buff:cl200Buff('Scholar of the Wilds',{xp:.05},'+5% XP')}]},
  {k:'sov',n:'Sovereign Slayer',i:'👑',L:3,d:'Defeat every Sovereign',it:()=>BOSSES.map((B,i)=>({n:B.name,ic:B.i||'👑',got:bossDone.has(i)})),rw:[{g:8000},{buff:cl200Buff('Sovereign\'s Bane',{hpP:.04,paP:.04,maP:.04,pdP:.04,mdP:.04},'+4% health, attack and defense')}]},
  {k:'tame3',n:'Elder Tamer',i:'🐲',L:3,d:'Tame every Tier 4 and 5 species',it:()=>cl200Sp([4,5]),rw:[{g:10000},{buff:cl200Buff('Elder Tamer',{paP:.04,maP:.04},'+4% physical and magic attack')}]},
  {k:'unq',n:'Relic Hunter',i:'✦',L:3,d:'Find every zone unique',it:()=>[].concat(...UNQ135_ZK.map(L=>L||[])).map(k=>({n:UNQ135[k].n,ic:'✦',got:CL200.got.has('u:'+k)})),rw:[{g:15000},{buff:cl200Buff('Relic Hunter',{loot:.08},'+8% loot find')}]},
  {k:'rare',n:'Rare Breeds',i:'✨',L:3,d:'Own a shiny companion and one of every rare colour',it:()=>[{n:'Shiny companion',ic:'✨',got:CL200.got.has('shn')}].concat(Object.keys(RVAR).map(v=>({n:v+' companion',ic:'🎨',got:CL200.got.has('rv:'+v)}))),rw:[{g:10000},{shiny:1}]},
  {k:'rune3',n:'Runemaster',i:'🔯',L:3,d:'Hold every rune at rank III',it:()=>cl200Runes(3),rw:[{g:12000},{buff:cl200Buff('Runemaster',{hpP:.03,pdP:.03,mdP:.03},'+3% health and defense')}]}];
function cl200Done(S){const L=S.it();return L.length&&L.every(q=>q.got)}
function cl200RwTxt(r){if(r.g)return '🪙 '+r.g.toLocaleString();if(r.egg)return '🥚 Tier '+r.egg+' egg';if(r.rune)return '🔮 '+r.rune+' rank I runes';if(r.rune2)return '🔯 A rank II rune';
  if(r.shiny)return '✨ A Shimmering Egg (hatches shiny)';if(r.buff)return '📖 '+r.buff.n+': '+r.buff.d+' (permanent)';return ''}
function cl200Give(r){if(r.g)gold+=r.g;else if(r.egg)eggs.push(rollEgg(r.egg));else if(r.rune){for(let i=0;i<r.rune;i++)giveS(RUNEK[R(0,RUNEK.length-1)],1)}
  else if(r.rune2)giveS(rn194Key(RN194K[R(0,RN194K.length-1)],2),1);else if(r.shiny){const e=rollEgg(Math.max(1,Math.min(5,tierOfLv(hero.lvl))));e.shn=1;eggs.push(e)}
  else if(r.buff&&!hero.buffs.some(b=>b.perm&&b.n==r.buff.n))permBuff(r.buff.n,r.buff.s)}
function cl200Claim(k){const S=CL200_S.find(q=>q.k==k);if(!S||CL200.claim.has(k)||!cl200Done(S))return;if(kdLv('tower')<S.L)return say('📜 The Scholar\'s Tower must be level '+S.L+' to grant this reward.');
  CL200.claim.add(k);S.rw.forEach(cl200Give);try{banner('📜 '+S.n.toUpperCase(),S.rw.map(cl200RwTxt).join(' · '),'Collection Log section complete')}catch(_){}try{sfx('power')}catch(_){}try{hsDirty();hud();ui();saveGame(true)}catch(_){}rX()}
// the log (claim buttons only at the tower)
function cl200Html(claim){cl200Scan();const lv=kdLv('tower');let all=0,got=0,done=0;
  const cards=CL200_S.map(S=>{const L=S.it(),n=L.filter(q=>q.got).length,ok=L.length&&n==L.length,cl=CL200.claim.has(S.k);all+=L.length;got+=n;if(ok)done++;const open=!!CL200.open[S.k];
    const btn=cl?'<em class="cl200-ok">✔ Claimed</em>':!claim?(ok?'<em class="cl200-rd">Claim at the Scholar\'s Tower</em>':''):ok?(lv>=S.L?`<button class="pri" data-cl200c="${S.k}">Claim</button>`:`<button disabled title="Upgrade the Scholar's Tower">🔒 Tower Lv ${S.L}</button>`):'';
    return `<div class="cl200-s${ok?' done':''}${cl?' cl':''}"><button class="cl200-h" data-cl200o="${S.k}"><span class="cl200-i">${S.i}</span><span class="cl200-n"><b>${S.n}</b> <span class="cl200-st">${'★'.repeat(S.L)}</span><small>${S.d||'Defeat every creature that lives there'}</small></span>
      <span class="cl200-c">${n} / ${L.length}</span></button><div class="cl200-bar"><i style="width:${L.length?(n/L.length*100).toFixed(1):0}%"></i></div>
      <div class="cl200-rw"><span>${S.rw.map(cl200RwTxt).join(' · ')}</span>${btn}</div>
      ${open?`<div class="cl200-it">${L.map(q=>`<span class="${q.got?'got':''}" title="${st200Esc(q.got?q.n:'Not yet')}"><i>${q.got?q.ic:'❔'}</i>${q.got?st200Esc(q.n):'???'}</span>`).join('')}</div>`:''}</div>`}).join('');
  return `<div class="cl200-top"><b>📜 Collection Log</b> <span>${got} / ${all} collected · ${done} / ${CL200_S.length} sections complete</span><span class="mut">Scholar's Tower level ${lv}: claims ${lv?['★','★ ★★','★ ★★ ★★★'][lv-1]:'nothing yet'}</span></div><div class="cl200">${cards}</div>`}
$('xw').addEventListener('click',e=>{if(xwMode!='tower200'&&xwMode!='dex')return;const t=e.target.closest('[data-cl200o],[data-cl200c]');if(!t||t.disabled)return;e.stopPropagation();
  if(t.dataset.cl200c)cl200Claim(t.dataset.cl200c);else{CL200.open[t.dataset.cl200o]=!CL200.open[t.dataset.cl200o];rX()}});
XR.tower200=function(){$('xwT').textContent='📚 Scholar\'s Tower';$('xwS').textContent='The Collection Log · fill a section to claim its reward';
  $('xwB').innerHTML=st200Head('tower')+cl200Html(true);$('xwF').innerHTML='<span class="mut dtl">Tap a section to see its entries. Things you have held once (uniques, mounts, runes, rare companions) stay ticked even after you sell or fuse them. Upgrade the tower at the Stronghold Steward to claim adept (★★) and master (★★★) rewards.</span>'};
ST200.open.tower=()=>openX('tower200');
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.cl200={g:[...CL200.got],c:[...CL200.claim]};return o}}
{const f=x2Load;x2Load=function(s){CL200.got=new Set();CL200.claim=new Set();try{const q=s&&s.cl200;if(q){(q.g||[]).forEach(k=>typeof k=='string'&&CL200.got.add(k));(q.c||[]).forEach(k=>typeof k=='string'&&CL200.claim.add(k))}}catch(_){}
  const r=f.apply(this,arguments);try{cl200Scan()}catch(_){}return r}}
document.head.insertAdjacentHTML('beforeend',`<style id="cl200css">
#xw .cl200-top{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline;margin:0 0 8px;font-size:.78rem}#xw .cl200-top b{font-size:.95rem}
#xw .cl200{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));align-items:start}
#xw .cl200-s{border:1px solid var(--line);border-radius:9px;background:rgba(0,0,0,.22);padding:6px 8px;display:flex;flex-direction:column;gap:5px}
#xw .cl200-s.done{border-color:rgba(240,204,114,.6);background:linear-gradient(135deg,rgba(240,204,114,.12),rgba(0,0,0,.25))}#xw .cl200-s.cl{border-color:rgba(110,231,183,.45)}
#xw .cl200-h{display:flex;gap:8px;align-items:center;text-align:left;background:none;border:0;padding:0;height:auto;min-height:0;white-space:normal;line-height:1.2;width:100%;cursor:pointer}
#xw .cl200-i{font-size:1.4rem;width:1.6em;text-align:center}#xw .cl200-n{flex:1;min-width:0}#xw .cl200-n small{display:block;color:var(--mut);font-size:.68rem;font-weight:500}
#xw .cl200-st{color:#f0cc72;font-size:.66rem;letter-spacing:1px}#xw .cl200-c{font-weight:800;font-size:.8rem;font-variant-numeric:tabular-nums}
#xw .cl200-bar{height:5px;border-radius:3px;background:rgba(0,0,0,.45);overflow:hidden}#xw .cl200-bar i{display:block;height:100%;background:linear-gradient(90deg,#c9a24a,#f5d76e)}
#xw .cl200-s.cl .cl200-bar i{background:#6ee7b7}
#xw .cl200-rw{display:flex;gap:8px;align-items:center;justify-content:space-between;font-size:.7rem;color:#e8d8b0}#xw .cl200-rw button{padding:2px 10px;font-size:.72rem;min-height:0}
#xw .cl200-ok{color:#6ee7b7;font-style:normal;font-weight:700;white-space:nowrap}#xw .cl200-rd{color:#f0cc72;font-style:normal;white-space:nowrap}
#xw .cl200-it{display:flex;flex-wrap:wrap;gap:4px}#xw .cl200-it span{display:inline-flex;gap:4px;align-items:center;font-size:.68rem;padding:2px 6px;border-radius:5px;background:rgba(0,0,0,.3);opacity:.5}
#xw .cl200-it span.got{opacity:1;background:rgba(201,162,74,.16)}#xw .cl200-it i{font-style:normal}
@media(max-width:640px){#xw .cl200{grid-template-columns:1fr}}
</style>`);
