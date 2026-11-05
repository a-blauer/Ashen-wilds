// ================= v200: Duskhold's buildings become stations =================
// Owner (Nov 5 2026): the Training Grounds, Scholar's Tower, Treasury, Beast Den and Hatchery stop giving passive bonuses and
// become places you walk up to (F) and use; the Beast Trainer trains companions in slots; the Stable's upgrades open mount
// tiers; companion food; Curio prices by tier; one villager per house; cheaper top upgrades.
// This file: the shared parts —
//  * costs: town upgrades' third level 12,000 → 5,000 gold (SHC); Rune Sanctum levels 1,000 / 2,000 / 5,000 gold; Beast Trainer
//    levels 1,000 gold each (one more training slot per level); Stable levels cost wood, stone and plant fiber only.
//  * the upgrade texts (SHU[].d) say what each station level does now (the passive bonuses were taken out of 0530 / 1870 / 2985).
//  * the Hatchery stands from the start: level 0 is a working Hatchery (3 slots) that takes a lot like any building;
//    its levels 1-3 are upgrades. Its model shows level 1 at level 0 (kdUp wrapper); the Steward row says "Upgrade".
//  * walk-up prompts: F at a station's door opens its window (ST200 table; each station file fills in its open()).
//  * one villager per house (1870 builds one); older saves keep each house's best-ranked villager, the others move away:
//    their goods are handed over and half of what was spent training and ranking them comes back as gold.
// Co-op: station levels come from the kingdom you see (the host's while you play together); what you put in a station
// (eggs, companions, gold, training) is your own and saved with your hero.
var ST200={k:['hatch','train','tower','treas','den'],open:{},name:{hatch:'Hatchery',train:'Training Grounds',tower:'Scholar\'s Tower',treas:'Treasury',den:'Beast Den'}};
// ---------------- costs ----------------
try{SHC[3].g=5000}catch(e){console.warn('v200 SHC',e)}
var ST200_STB=[null,[['wood',40],['stone',30],['fiber',25]],[['wood',90],['stone',70],['fiber',55]],[['wood',180],['stone',140],['fiber',110]]];
{const f=shpCost109;shpCost109=function(u,l){const c=f.apply(this,arguments);try{
  if(u&&u.k=='sage')c.g=[0,1000,2000,5000][l]|0;
  else if(u&&u.k=='trainer')c.g=1000;
  else if(u&&u.k=='stable'){c.g=0;c.m=ST200_STB[l]?ST200_STB[l].map(q=>q.slice()):c.m}}catch(_){}return c}}
// the Beast Trainer and the Stable no longer give discounts: their levels add slots / mount tiers
{const f=shpP109;shpP109=function(k,c){if(k=='trainer'||k=='stable')return +c||0;return f.apply(this,arguments)}}
{const f=shpFx109;shpFx109=function(k,l){
  if(k=='trainer')return (1+l)+' training slot'+(l?'s':'')+' · companions climb to your level in 5 minutes';
  if(k=='stable')return 'Tier 1–'+Math.min(5,2+l)+' mounts for sale';
  return f.apply(this,arguments)}}
{const f=shpNote109;shpNote109=function(k){if(k!='stable'&&k!='trainer')return f.apply(this,arguments);const l=shpL109(k);
  const pip='<span class="shpip">'+'◆'.repeat(l)+'◇'.repeat(SHP109_MAX-l)+'</span>';
  return `<div class="shpnote${l?' on':''}">🏪 ${l?'<b>Shop level '+l+'</b> '+pip+' · ':''}${shpFx109(k,l)}${l<SHP109_MAX?' · upgrade it at the Stronghold Steward for '+(k=='stable'?'the next mount tier':'another slot'):''}</div>`}}
// the shop list's one-line descriptions
try{SHOPS.find(o=>o.k=='trainer').d='Train companions up to your level in slots (5 minutes, free)';SHOPS.find(o=>o.k=='stable').d='Buy mounts for gold (more tiers with each upgrade). Ride with V for a big boost to move speed.'}catch(_){}
// ---------------- what each station level does (Steward rows, banners) ----------------
var ST200_TG=[0,15,30,40],ST200_TR=[0,5000,20000,75000],ST200_DEN=[0,0,.25,.5];
{const D={
  train:l=>l?'Train while you are away: +1 level per absence of 8 hours or more, up to Lv '+ST200_TG[l]+(l>=3?' (16 hours per level past Lv 40)':''):'Not built yet',
  tower:l=>l?'Collection log: claim '+['novice','novice and adept','every'][l-1]+' section rewards':'Not built yet',
  treas:l=>l?'Gold market: invest up to 🪙 '+ST200_TR[l].toLocaleString():'Not built yet',
  den:l=>l?'Sacrifice companions for essence'+(ST200_DEN[l]?' (+'+Math.round(ST200_DEN[l]*100)+'%)':'')+', reroll traits':'Not built yet',
  hatch:l=>(3+l)+' hatching slots · eggs hatch in '+(8-l)+' min'+(l?' · +'+l+'% shiny & rare chance':'')};
  SHU.forEach(u=>{if(D[u.k])u.d=D[u.k]})}
// ---------------- the Hatchery stands from the start ----------------
{const f=lotBuilt103;lotBuilt103=function(key){if(key==='u:hatch')return true;return f.apply(this,arguments)}}
{const f=kdUp;kdUp=function(T,key,l){if(key==='hatch')l=Math.max(1,l|0);return f.call(this,T,key,l)}}
// the kingdom's size counts the Hatchery as a building at level 0 too
kfNeed109=function(){let n=1;try{SHOPS.forEach(o=>{if(shopBuilt(o.k))n++});UPK103.forEach(k=>{if(kdLv(k)>0||k=='hatch')n++});if(typeof HS103!='undefined'&&HS103)n+=HS103.h.length}catch(_){}
  let s=0;while(s<5&&5+3*s<n)s++;try{for(const k in SH.pos){const l=LOTM103[SH.pos[k]];if(l&&l.st>s)s=l.st}}catch(_){}return s};
// Steward row: level 0 is built (Upgrade, Move, Turn), not "Build"
function st200HoldFix(){try{const b=document.querySelector('#xw [data-kmb="up:hatch"]');if(!b)return;const row=b.closest('.rw');b.dataset.kmb='lvl:hatch';b.textContent='Upgrade';
  const sm=row&&row.querySelector('small');if(sm)sm.innerHTML=sm.innerHTML.replace('Not built yet','Now: '+SHU.find(u=>u.k=='hatch').d(0));
  const ra=row&&row.querySelector('.ra'),P=KM103&&KM103.pick;if(ra&&!ra.querySelector('[data-kmmv]')){ra.insertAdjacentHTML('beforeend',`<button data-kmmv="u:hatch" ${P?'disabled':''}>Move</button><button data-kmrot="u:hatch" ${P?'disabled':''} title="Turn it a quarter turn">⟳</button>`);
    const st=ra.querySelector('em,.kmlot');if(!ra.querySelector('.kmlot'))ra.insertAdjacentHTML('afterbegin',kmLotTxt103('u:hatch'))}}catch(e){console.warn('v200 steward',e)}}
{const f=XR.hold;XR.hold=function(){const r=f.apply(this,arguments);st200HoldFix();return r}}
// ---------------- walk-up prompts ----------------
function st200Near(k){const l=lotOf103('u:'+k);if(!l)return false;const p=pl.position,d=lotDoor103(l),c=lotW103(l,0,1.4);
  return Math.hypot(p.x-d[0],p.z-d[1])<2.9||Math.hypot(p.x-c[0],p.z-c[1])<3.3}
function st200Prompt(T){if(!T||T!==TOWNS[0])return null;
  for(const k of ST200.k){if(!ST200.open[k])continue;if(k!=='hatch'&&!(kdLv(k)>0))continue;if(!st200Near(k))continue;
    return {k,label:'F · '+(SHU.find(u=>u.k==k)||{}).i+' '+ST200.name[k],fn:()=>ST200.open[k]()}}return null}
// a station whose door is closer than the Stronghold Steward wins (a lot next to the plaza puts both in reach)
{const f=townPortalPrompt;townPortalPrompt=function(T){let s=null;try{s=st200Prompt(T)}catch(e){console.warn('v200 prompt',e)}
  if(s){try{const st=SHM&&SHM.st,p=pl.position,l=lotOf103('u:'+s.k),d=lotDoor103(l);if(st&&Math.hypot(p.x-st.x,p.z-st.z)<2.6&&Math.hypot(p.x-d[0],p.z-d[1])<Math.hypot(p.x-st.x,p.z-st.z))return s}catch(_){}}
  const r=f.apply(this,arguments);return r||s}}
// ---------------- shared bits for the station windows ----------------
function st200Esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function st200Clock(ms){ms=Math.max(0,ms);const s=Math.ceil(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?h+'h '+String(m).padStart(2,'0')+'m':m+':'+String(x).padStart(2,'0')}
function st200Lv(k){return kdLv(k)}
// true while the kingdom on show is a co-op host's, not your own
function st200Guest(){try{return typeof DK150!='undefined'&&DK150.on&&!!DK150.host&&DK150.host!==MP.me}catch(_){return false}}
function st200Pips(l){return '<span class="s200-pip">'+'◆'.repeat(l)+'◇'.repeat(3-l)+'</span>'}
function st200Head(k,extra){const l=st200Lv(k),u=SHU.find(q=>q.k==k);
  return `<div class="s200-head"><div><b>${u.i} ${u.n}</b> ${st200Pips(l)}<small>${u.d(l)}</small></div>${l<3?`<div class="s200-nx"><small>Next level</small>${u.d(l+1)}<br><span class="mut">Upgrade at the Stronghold Steward</span></div>`:''}${extra||''}</div>`}
// a companion's little picture (the HUD portrait renderer) or its emoji
function st200Pic(c){try{const p=cpic(c);if(p)return `<img src="${p}" alt="">`}catch(_){}return `<span>${em(c)}</span>`}
// the species' tier (1-5)
function st200Tier(c){return Math.max(1,Math.min(5,tierSp(c&&c.g?c.g[0]:c&&c.n)||1))}
document.head.insertAdjacentHTML('beforeend',`<style id="s200css">
#xw .s200-head{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:flex-start;justify-content:space-between;padding:8px 10px;margin:0 0 10px;border:1px solid rgba(201,162,74,.4);border-radius:8px;background:linear-gradient(135deg,rgba(201,162,74,.12),rgba(0,0,0,.25))}
#xw .s200-head b{font-size:.95rem}#xw .s200-head small{display:block;color:var(--mut);font-size:.74rem;margin-top:2px}
#xw .s200-nx{font-size:.74rem;max-width:300px}#xw .s200-nx small{text-transform:uppercase;letter-spacing:.08em;font-size:.6rem;color:#c9a24a}
#xw .s200-pip{color:#f0cc72;letter-spacing:2px;font-size:.8rem}
#xw .s200-sec{margin:12px 0 6px;font:700 .72rem/1 var(--kq-head,serif);letter-spacing:.08em;text-transform:uppercase;color:#c9a24a}
#xw .s200-grid{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
#xw .s200-card{position:relative;display:grid;grid-template-columns:52px minmax(0,1fr);gap:4px 10px;align-items:center;padding:8px 10px;border-radius:9px;border:1px solid color-mix(in srgb,var(--rc,#c9a24a) 45%,var(--line));background:linear-gradient(135deg,color-mix(in srgb,var(--rc,#c9a24a) 12%,transparent),rgba(0,0,0,.3) 65%)}
#xw .s200-card.empty{border-style:dashed;opacity:.75;background:rgba(0,0,0,.15)}
#xw .s200-card.lock{opacity:.45}
#xw .s200-ic{width:52px;height:52px;border-radius:9px;background:rgba(0,0,0,.35);display:grid;place-items:center;font-size:1.7rem;overflow:hidden}
#xw .s200-ic img{width:100%;height:100%;object-fit:cover}
#xw .s200-t b{font-size:.84rem;display:block;line-height:1.2}#xw .s200-t small{display:block;color:var(--mut);font-size:.7rem;line-height:1.3}
#xw .s200-bar{grid-column:1/-1;height:6px;border-radius:4px;background:rgba(0,0,0,.45);overflow:hidden}#xw .s200-bar i{display:block;height:100%;background:linear-gradient(90deg,#c9a24a,#f5d76e)}
#xw .s200-btns{grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
#xw .s200-btns button{padding:3px 10px;font-size:.74rem}
#xw .s200-note{font-size:.74rem;color:var(--mut);margin:4px 0}
#xw .s200-pick{display:grid;gap:6px;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
#xw .s200-pick button{display:flex;gap:8px;align-items:center;text-align:left;height:auto;min-height:44px;padding:5px 8px;white-space:normal;line-height:1.2}
#xw .s200-pick button .s200-ic{width:36px;height:36px;font-size:1.2rem;flex:none}
#xw .s200-pick button small{display:block;color:var(--mut);font-size:.66rem;font-weight:500}
@media(max-width:640px){#xw .s200-grid,#xw .s200-pick{grid-template-columns:1fr}}
</style>`);
// ---------------- one villager per house ----------------
function st200OneHome(){if(typeof HS103=='undefined'||!HS103||st200Guest())return 0;let gone=[],back=0;
  HS103.h.forEach((h,i)=>{const L=HS103.cit.filter(c=>c.h===i);if(L.length<2)return;
    const keep=L.slice().sort((a,b)=>czRank105(b)-czRank105(a))[0];
    L.forEach(c=>{if(c===keep)return;try{if(c.bag)czCollect105(c)}catch(_){}const R=CZR104[czRole104(c)],rk=czRank105(c);let spent=R.g||0;for(let r=1;r<rk;r++)spent+=R.up*r;
      back+=Math.floor(spent/2);gone.push(c.n);HS103.cit.splice(HS103.cit.indexOf(c),1)})});
  if(!gone.length)return 0;gold+=back;try{czClear103()}catch(_){}try{if(typeof hs103Sync=='function')hs103Sync()}catch(_){}
  setTimeout(()=>{try{say('🏠 Houses now hold one villager each. '+gone.join(', ')+' moved away'+(back?' and left 🪙 '+back+' (half of what their training and ranks cost)':'')+'; any goods they carried are in your bag.')}catch(_){}},3500);return gone.length}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{st200OneHome()}catch(e){console.warn('v200 houses',e)}return r}}
// the Hatchery gets its lot now (new characters and older saves alike)
try{lotSync103()}catch(e){console.warn('v200 hatchery lot',e)}
