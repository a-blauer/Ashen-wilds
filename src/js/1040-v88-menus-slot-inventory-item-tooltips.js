// ================= v88: menus — slot inventory, item tooltips with comparison, slot shops, tabbed character / companion windows =================
// Everything here runs after the older renderers and re-shapes their output, so the old click handlers keep working:
//  * Inventory (I): paper doll (#hv with equipment slots around it), the bag as a grid of square slots (rarity frame, +N, 🔒, new dot,
//    dimmed when you can't use it), Materials / Supplies / Eggs as slot grids with counts, plus new Forge (upgrade) and Stats tabs.
//    Click selects (detail + actions in the footer as before), double-click (or a second tap on touch) equips / unequips / uses.
//  * Hover tooltip (#kqmTip): name, type, level / requirement, stats and green ▲ / red ▼ deltas against what is equipped in that slot.
//  * Shops: every list of wares (Trading Post buy + sell, Magic Shop, Curio Merchant, Rune Sage, Stable, hearth / alchemy market)
//    is turned into a slot grid with the price under each slot. Click selects and shows a buy bar; the bar's buttons click the
//    original (hidden) row buttons, so the old buy code runs unchanged.
//  * Companions (P): the long detail column is split into tabs (Overview / Stats & Grades / Spells & Evolution / Care / Talents)
//    built from the already-rendered sections after every other module added its parts.
// Classes start with kqm- so the UI theme (zzM_ui.js) can style them; the CSS here is layout only.
var KQM={sort:'best',filt:'all',ctab:'ov',sel:{},wm:new WeakMap(),known:new Set(),tipEl:null,touch:false,last:{k:'',t:0},supSel:null,ready:false};
try{const o=JSON.parse(localStorage.getItem('kqm_menus')||'{}');if(o.sort)KQM.sort=o.sort;if(o.ctab)KQM.ctab=o.ctab;if(o.bt!=null&&isFinite(o.bt))bagTab2=+o.bt}catch(_){}
function kqmSave(){try{localStorage.setItem('kqm_menus',JSON.stringify({sort:KQM.sort,ctab:KQM.ctab,bt:bagTab2}))}catch(_){}}
{const st=document.createElement('style');st.id='kqmCss';st.textContent=`
#bag .win{width:min(1010px,100%);max-width:1010px;height:min(700px,100%)}
#bag .wb.cols.kqm-bagw{grid-template-columns:292px minmax(0,1fr);gap:16px;align-items:stretch}
.kqm-left{display:flex;flex-direction:column;gap:8px;min-width:0}
.kqm-doll{display:grid;grid-template-columns:58px minmax(0,1fr) 58px;gap:8px;align-items:stretch}
.kqm-doll #hv.pvbox.sm{height:100%;min-height:268px;margin:0}
.kqm-doll #hv canvas{max-width:100%}
.kqm-dl,.kqm-dr{display:flex;flex-direction:column;gap:8px;justify-content:flex-start}
.kqm-sum{display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;font-size:.74rem}
.kqm-sum .kv{font-size:.74rem;padding:2px 0}
.kqm-slot{position:relative;width:100%;aspect-ratio:1/1;min-width:0;padding:0;margin:0;display:flex;align-items:center;justify-content:center;
  border:1px solid var(--rc,rgba(255,255,255,.14));border-radius:6px;background:rgba(0,0,0,.32);box-shadow:inset 0 0 12px -4px var(--rc,transparent);cursor:pointer;color:inherit;font:inherit;line-height:1;overflow:hidden}
.kqm-slot .kqm-ic{font-size:1.55rem;line-height:1;pointer-events:none}
.kqm-slot.on{outline:2px solid var(--acc,#c9a24a);outline-offset:1px}
.kqm-slot.kqm-no{opacity:.42;filter:grayscale(.7)}
.kqm-slot.kqm-empty{border-style:dashed;border-color:rgba(255,255,255,.1);background:rgba(0,0,0,.18);box-shadow:none;cursor:default}
.kqm-slot.kqm-empty .kqm-ic{opacity:.22;filter:grayscale(1)}
.kqm-doll .kqm-slot.kqm-empty{cursor:pointer}
.kqm-slot .kqm-up{position:absolute;top:2px;right:3px;font-size:.62rem;font-weight:800;color:#ffe08a;pointer-events:none}
.kqm-slot .kqm-lk{position:absolute;top:2px;left:3px;font-size:.6rem;pointer-events:none}
.kqm-slot .kqm-nw{position:absolute;top:4px;left:4px;width:7px;height:7px;border-radius:50%;background:#ffd24a;box-shadow:0 0 6px #ffd24a;pointer-events:none}
.kqm-slot .kqm-ct{position:absolute;bottom:2px;right:4px;font-size:.66rem;font-weight:800;pointer-events:none;text-shadow:0 1px 2px #000}
.kqm-slot .kqm-lv{position:absolute;bottom:2px;left:4px;font-size:.58rem;opacity:.75;pointer-events:none}
.kqm-slot .kqm-sn{position:absolute;bottom:2px;left:0;right:0;text-align:center;font-size:.54rem;opacity:.7;pointer-events:none;text-transform:uppercase;letter-spacing:.04em}
.kqm-slot .kqm-eb{position:absolute;left:4px;right:4px;bottom:4px;height:4px;border-radius:2px;background:rgba(255,255,255,.12);overflow:hidden;pointer-events:none}
.kqm-slot .kqm-eb i{display:block;height:100%;background:#facc15}
.kqm-slot.kqm-rdy{animation:kqmPulse 1.4s ease-in-out infinite}
@keyframes kqmPulse{50%{box-shadow:inset 0 0 18px -2px var(--rc,#ffd24a)}}
.kqm-grid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px;margin:4px 0 10px}
.kqm-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:6px 0 4px;font-size:.74rem}
.kqm-bar .kqm-chips{display:flex;flex-wrap:wrap;gap:4px;flex:1}
.kqm-bar button{padding:3px 8px;font-size:.72rem}
.kqm-bar button.on{outline:2px solid var(--acc,#c9a24a)}
.kqm-bar select{font-size:.72rem;padding:2px 4px}
.kqm-h{font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;opacity:.75;margin:8px 0 2px}
.kqm-statp{overflow:auto}
#bag .kqm-tabhid{display:none!important}
.kqm-forge{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:14px;align-items:start}
.kqm-forge .kqm-grid{grid-template-columns:repeat(6,minmax(0,1fr))}
.kqm-fp{display:flex;flex-direction:column;gap:6px;font-size:.78rem}
.kqm-fp .kqm-fh{display:flex;gap:10px;align-items:center}
.kqm-fp .kqm-fh .kqm-slot{width:58px;flex:none}
.kqm-fp .kqm-pips{letter-spacing:2px;color:#f0cc72}
.kqm-fp .kqm-frow{display:flex;justify-content:space-between;gap:8px}
.kqm-fp .kqm-bad{color:#f87171}.kqm-fp .kqm-ok{color:#6ee7b7}
.kqm-fp button{width:100%}
.kqm-tip{position:fixed;z-index:61;width:270px;max-width:calc(100vw - 16px);padding:9px 11px;border-radius:8px;pointer-events:none;font-size:.74rem;line-height:1.35;
  background:rgba(16,12,10,.97);border:1px solid var(--rc,#c9a24a);box-shadow:0 6px 22px #000c;color:#efe4cc;display:none}
.kqm-tip .kqm-tn{font-weight:800;font-size:.84rem;display:flex;justify-content:space-between;gap:6px;align-items:baseline}
.kqm-tip .kqm-tag{font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;padding:1px 5px;border-radius:4px;background:rgba(110,231,183,.16);color:#6ee7b7;white-space:nowrap}
.kqm-tip .kqm-tag.nw{background:rgba(255,210,74,.16);color:#ffd24a}
.kqm-tip .kqm-ts{opacity:.75;font-size:.7rem}
.kqm-tip .kqm-tst{margin:6px 0 4px;display:flex;flex-direction:column;gap:1px}
.kqm-tip .kqm-tr{display:grid;grid-template-columns:1fr auto 58px;gap:6px;align-items:baseline}
.kqm-tip .kqm-tr b{text-align:right}
.kqm-tip .kqm-tr .kqm-d{font-style:normal;text-align:right;font-size:.7rem}
.kqm-tip .kqm-gu{color:#6ee7b7}.kqm-tip .kqm-gd{color:#f87171}.kqm-tip .kqm-ge{opacity:.5}.kqm-tip .kqm-bad{color:#f87171}
.kqm-tip .kqm-tc{font-size:.68rem;opacity:.8;border-top:1px solid rgba(255,255,255,.08);padding-top:4px;margin-top:2px}
.kqm-tip .kqm-tx{font-size:.7rem;margin-top:3px;color:#f0cc72}
.kqm-tip .kqm-tp{margin-top:5px;font-weight:700;color:#f0cc72}
.kqm-tip .kqm-th{margin-top:5px;font-size:.64rem;opacity:.55}
.kqm-tip .kqm-td{margin-top:4px;opacity:.85}
.kqm-shopg{grid-template-columns:repeat(auto-fill,minmax(58px,1fr))}
.kqm-cell{display:flex;flex-direction:column;gap:2px;min-width:0;background:none;border:0;padding:0;margin:0;cursor:pointer;color:inherit;font:inherit}
.kqm-cell .kqm-slot{pointer-events:none}
.kqm-cell.on .kqm-slot{outline:2px solid var(--acc,#c9a24a);outline-offset:1px}
.kqm-cell.kqm-sel .kqm-slot{outline:2px solid #ffd24a;outline-offset:1px;background:rgba(255,210,74,.12)}
.kqm-cell.kqm-sel .kqm-slot::after{content:'✔';position:absolute;top:2px;left:4px;font-size:.7rem;color:#ffd24a}
.kqm-cell .kqm-pr{font-size:.68rem;font-weight:700;text-align:center;color:#f0cc72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kqm-cell.kqm-poor .kqm-pr{color:#f87171}
.kqm-cell.kqm-off .kqm-slot{opacity:.5}
.kqm-hold{display:none!important}
.kqm-bbar{position:sticky;bottom:0;z-index:2;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:7px 8px;margin-top:6px;border-top:1px solid rgba(255,255,255,.1);background:rgba(14,12,10,.96);font-size:.76rem}
.kqm-bbar .kqm-bn{flex:1;min-width:120px;display:flex;align-items:center;gap:6px}
.kqm-bbar .kqm-bn .kqm-ic{font-size:1.2rem}
.kqm-bbar .kqm-bn small{display:block;opacity:.7}
.kqm-ctabs{flex:none;margin:0 0 6px!important}
.kqm-ctabs.hide{display:none}
.kqm-ctabs button .kqm-dot{display:inline-block;min-width:15px;padding:0 4px;margin-left:4px;border-radius:8px;font-size:.62rem;background:rgba(255,210,74,.2);color:#ffd24a}
#cmp .kqm-novw #cvw{display:none}
.kqm-chead{margin-bottom:6px}
.kqm-cpane.hide{display:none}
.kqm-csum{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}
.kqm-cmods{display:flex;gap:4px;flex-wrap:wrap;margin:6px 0}
@media (max-width:640px){
  #cmp .wb.cols.c2{grid-template-columns:minmax(0,1fr)!important}
  #cmp .wb.cols.c2>div:last-child{display:block!important}
  #cmp #cvw.pvbox.sm{height:180px}
  #bag #bt,.kqm-ctabs{flex-wrap:nowrap!important;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}
  #bag #bt button,.kqm-ctabs button{flex:none;white-space:nowrap}
  .kqm-doll #hv.pvbox.sm{min-height:190px}
  #bag #idt{flex-wrap:wrap;max-height:36vh;overflow:auto;align-items:flex-start}
  #bag #idt .dtl{flex:1 1 100%}
  #bag #idt .wsrow .wsbox{flex-basis:100%}
  #bag .wb.cols.kqm-bagw{grid-template-columns:minmax(0,1fr)}
  .kqm-doll{grid-template-columns:50px minmax(0,1fr) 50px}
  .kqm-doll #hv.pvbox.sm{min-height:214px}
  .kqm-dl,.kqm-dr{gap:5px}
  .kqm-grid{grid-template-columns:repeat(6,minmax(0,1fr))}
  .kqm-forge{grid-template-columns:1fr}
  .kqm-forge .kqm-grid{grid-template-columns:repeat(6,minmax(0,1fr))}
  .kqm-csum{grid-template-columns:1fr}
}
`;document.head.appendChild(st)}

// ---------------- helpers ----------------
const kqmEsc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const kqmEq=it=>!!it&&SLOTS.some(s=>eq[s]===it);
const kqmFind=(k,id)=>k=='e'?SLOTS.map(s=>eq[s]).find(x=>x&&x.id==id):gear.find(x=>x.id==id);
const kqmSlots=()=>SLOTS.filter(k=>k!='offhand'||hero.cls=='paladin');
const KQM_ORD=['pa','ma','pd','md','hp','mp','crit','cdm','as','blockC','ls','hpP','paP','maP','cdr','regen','mspd','loot','xp'];
const kqmLab=k=>(SNM[k]||k)+(k=='hpP'||k=='paP'||k=='maP'||k=='pdP'||k=='mdP'?' %':''),kqmFmt=(k,v)=>k=='regen'?'+'+(+(v*100).toFixed(2))+'%':fmtS(k,v);
const kqmIcon=s=>{const m=String(s||'').trim().match(/^(\p{Extended_Pictographic}|\p{Regional_Indicator})(️|‍(\p{Extended_Pictographic})️?|\p{Emoji_Modifier})*/u);return m?m[0]:''};
function kqmSeen(){try{gear.forEach(i=>KQM.known.add(i.id));SLOTS.forEach(s=>eq[s]&&KQM.known.add(eq[s].id))}catch(_){}}
setTimeout(kqmSeen,0);
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{KQM.known.clear();kqmSeen()}catch(_){}return r}}
function kqmMarkNew(){gear.forEach(i=>{if(!KQM.known.has(i.id)){KQM.known.add(i.id);i.kqn=1}});SLOTS.forEach(s=>{const i=eq[s];if(i){KQM.known.add(i.id);if(i.kqn)delete i.kqn}})}
// locked gear can't be sold (multi-sell skips it)
{const f=sellables;sellables=function(){return f.apply(this,arguments).filter(x=>!(x.k[0]=='g'&&(gear.find(i=>i.id==+x.k.slice(1))||{}).lock))}}

// ---------------- item tiles ----------------
function kqmTile(it,k,o){o=o||{};const t=itT(it),on=!o.noSel&&selI&&selI.k==k&&selI.id==it.id,ok=k=='e'||canUse(it);
  return `<button class="kqm-slot kqm-it${on?' on':''}${ok?'':' kqm-no'}" data-k="${k}" data-id="${it.id}" data-kqt="${k}:${it.id}" style="--rc:${RAR[it.r][1]}" aria-label="${kqmEsc(t.n)}">`+
    `<span class="kqm-ic">${icoOf(it)}</span>${it.up?`<span class="kqm-up">+${it.up}</span>`:''}${it.lock?'<span class="kqm-lk">🔒</span>':it.kqn&&k=='g'?'<span class="kqm-nw"></span>':''}${o.lv?`<span class="kqm-lv">${it.lv}</span>`:''}${o.eqm?'<span class="kqm-sn">worn</span>':''}</button>`}
function kqmEmpty(n){let h='';for(let i=0;i<n;i++)h+='<div class="kqm-slot kqm-empty" aria-hidden="true"></div>';return h}
function kqmFill(n,cols){const tot=Math.max(48,Math.ceil((n+1)/24)*24);return kqmEmpty(tot-n)}

// ---------------- tooltip ----------------
function kqmTipEl(){let d=$('kqmTip');if(!d){d=document.createElement('div');d.id='kqmTip';d.className='kqm-tip glass';($('stage')||document.body).appendChild(d)}return d}
function kqmStatRows(a,b,cmp){const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].filter(k=>SNM[k]||KQM_ORD.includes(k)).sort((x,y)=>{const i=KQM_ORD.indexOf(x),j=KQM_ORD.indexOf(y);return (i<0?99:i)-(j<0?99:j)});
  return keys.map(k=>{const nv=a[k]||0,ov=b[k]||0,d=nv-ov,fl=['pa','ma','pd','md','hp','mp'].includes(k),z=fl?Math.abs(d)<.5:Math.abs(d)<.0005;
    const lab=kqmLab(k),z2=k=='regen'?Math.abs(d)<.00005:z;
    const dv=z2?'<span class="kqm-d kqm-ge">=</span>':`<span class="kqm-d ${d>0?'kqm-gu':'kqm-gd'}">${d>0?'▲':'▼'} ${kqmFmt(k,Math.abs(d)).slice(1)}</span>`;
    return `<div class="kqm-tr"><span>${lab}</span><b>${nv?kqmFmt(k,nv).replace(/^\+/,fl?'':'+'):'—'}</b>${cmp?dv:'<span class="kqm-d"></span>'}</div>`}).join('')}
function kqmGearTip(it,o){o=o||{};const t=itT(it),R=RAR[it.r],sl=t.sl,isEq=kqmEq(it),cur=isEq?null:eq[sl],a=itStats(it),b=cur?itStats(cur):{};
  const fits=fitsCls(t,hero.cls),lvOk=hero.lvl>=it.req,usable=sl!='offhand'||hero.cls=='paladin';
  let h=`<div class="kqm-tn"><span style="color:${R[1]}">${icoOf(it)} ${kqmEsc(itName(it))}</span>${isEq?'<span class="kqm-tag">Equipped</span>':it.kqn?'<span class="kqm-tag nw">New</span>':''}</div>`+
   `<div class="kqm-ts">${R[0]} ${SLOTN[sl]}${t.wt&&WTYPE[t.wt]?' · '+WTYPE[t.wt].n:t.arm?' · '+t.arm:''} · ${TIERN[t.t]||''}</div>`+
   `<div class="kqm-ts">iLvl ${it.lv} · <span class="${lvOk?'':'kqm-bad'}">Requires Lv ${it.req}</span> · <span class="${fits&&usable?'':'kqm-bad'}">${itClsTxt(t)}</span></div>`+
   `<div class="kqm-tst">${kqmStatRows(a,b,!isEq)}</div>`;
  if(isEq)h+=`<div class="kqm-tc">You are wearing this.</div>`;
  else h+=`<div class="kqm-tc">${cur?`▲▼ compared with your <span style="color:${RAR[cur.r][1]}">${kqmEsc(itName(cur))}</span>`:`Nothing equipped in this slot — every stat is a gain.`}</div>`;
  if(!isEq&&cur&&t.wt&&itT(cur).wt&&itT(cur).wt!=t.wt&&WTYPE[t.wt]&&WTYPE[itT(cur).wt])h+=`<div class="kqm-tx">Attack style: ${WTYPE[itT(cur).wt].n} → ${WTYPE[t.wt].n}</div>`;
  try{if(it.lp&&LP[it.lp])h+=`<div class="kqm-tx">★ ${LP[it.lp].n}: <span style="color:#efe4cc">${LP[it.lp].d}</span></div>`}catch(_){}
  try{if(it.set&&SETS[it.set])h+=`<div class="kqm-tx">${SETS[it.set].i} ${SETS[it.set].n} set (${setCount(it.set)}/4 worn)</div>`}catch(_){}
  h+=`<div class="kqm-ts" style="margin-top:4px">Upgrade +${it.up||0}/10${it.lock?' · 🔒 locked':''}</div>`;
  if(o.price)h+=`<div class="kqm-tp">${o.price}</div>`;
  if(o.hint)h+=`<div class="kqm-th">${o.hint}</div>`;
  return h}
function kqmEggTip(e,o){o=o||{};const now=Date.now(),f=typeof famOf=='function'?famOf(e.sp):'',F=typeof FAMD!='undefined'&&FAMD[f],rd=typeof eggRdy=='function'&&e.t0&&eggRdy(e);
  return `<div class="kqm-tn"><span style="color:${RAR[e.tier][1]}">🥚 Tier ${e.tier+1} ${kqmEsc(e.sp)} Egg</span></div><div class="kqm-ts">${RAR[e.tier][0]} egg${F?' · '+F.i+' '+f+' family':''}</div>`+
   (F&&F.d?`<div class="kqm-td">${F.d}</div>`:'')+`<div class="kqm-ts" style="margin-top:4px">Parent potential ${Math.round((e.pa||1)*100)}%</div>`+
   (e.t0?`<div class="kqm-tx">${rd?'✨ Ready to hatch':'Hatching in '+Math.max(1,Math.ceil((EGG_T-(now-e.t0))/1000))+'s'}</div>`:'')+(o.price?`<div class="kqm-tp">${o.price}</div>`:'')+(o.hint?`<div class="kqm-th">${o.hint}</div>`:'')}
function kqmHint(){return KQM.touch?'Tap again to equip · or use the buttons below':'Click to select · double-click to equip'}
function kqmMatTip(k){const n=matInfo(k)[0],ic=matInfo(k)[1];let src='';try{if(typeof msrcBuild=='function'){if(!MSRC)MSRC=msrcBuild();const H=MSRC[String(n).toLowerCase()]||MSRC[String(k).toLowerCase()];if(H)src=H.t}}catch(_){}
  const up=UPM.findIndex(u=>u[0]==k);
  return `<div class="kqm-tn"><span>${ic} ${kqmEsc(n)}</span><span>×${mats[k]||0}</span></div><div class="kqm-ts">${up>=0?'Upgrade material · '+TIERN[up]+' gear':RES[k]?'Gathered resource':'Companion material'}</div>`+(src?`<div class="kqm-td">${src}</div>`:'')}
function kqmSupTip(k){const S=SUP[k];if(!S)return '';const u=['food','elixir','pot'].includes(S.c);
  return `<div class="kqm-tn"><span>${S.i} ${kqmEsc(S.n)}</span><span>×${cnt(k)}</span></div><div class="kqm-td">${S.d||''}</div>`+(u?`<div class="kqm-th">${KQM.touch?'Tap again':'Double-click'} to ${S.c=='food'?'eat':'drink'}</div>`:'')}
function kqmTipHTML(el){const k=el.dataset.kqt||'',i=k.indexOf(':'),ty=i<0?k:k.slice(0,i),v=i<0?'':k.slice(i+1);
  if(ty=='g'||ty=='e'){const it=kqmFind(ty,+v);if(!it)return null;const nw=it.kqn;const h=kqmGearTip(it,{hint:ty=='e'?(KQM.touch?'Tap again to unequip':'Double-click to unequip'):kqmHint()});if(nw)delete it.kqn;return [h,RAR[it.r][1]]}
  if(ty=='es')return [`<div class="kqm-tn"><span>${SLOTIC[v]} ${SLOTN[v]}</span></div><div class="kqm-ts">Empty slot</div><div class="kqm-th">${KQM.touch?'Tap':'Click'} to show your ${SLOTN[v].toLowerCase()} items</div>`,null];
  if(ty=='m')return [kqmMatTip(v),null];
  if(ty=='s')return [kqmSupTip(v),null];
  if(ty=='egg'){const e=eggs.find(q=>q.id==+v);return e?[kqmEggTip(e,{hint:eggRdy(e)?(KQM.touch?'Tap':'Click')+' to hatch':''}),RAR[e.tier][1]]:null}
  if(ty=='x'){const o=KQM.wm.get(el);if(!o)return null;const it=o.item&&o.item();if(it&&it.tp!=null)return [kqmGearTip(it,{price:o.pl,hint:o.hint}),RAR[it.r][1]];
    const eg=o.egg&&o.egg();if(eg)return [kqmEggTip(eg,{price:o.pl,hint:o.hint}),RAR[eg.tier][1]];
    return [`<div class="kqm-tn"><span>${o.ic||''} ${o.nm}</span>${o.own!=null?`<span>×${o.own}</span>`:''}</div>${o.sub?`<div class="kqm-td">${o.sub}</div>`:''}${o.pl?`<div class="kqm-tp">${o.pl}</div>`:''}${o.hint?`<div class="kqm-th">${o.hint}</div>`:''}`,o.rc||null]}
  return null}
function kqmTipPos(x,y){const d=$('kqmTip');if(!d||d.style.display=='none')return;const w=d.offsetWidth,h=d.offsetHeight;let L=x+16,T=y+16;
  if(L+w>innerWidth-6)L=x-w-12;if(T+h>innerHeight-6)T=Math.max(6,y-h-12);d.style.left=Math.max(6,L)+'px';d.style.top=Math.max(6,T)+'px'}
function kqmTipShow(el,x,y){const r=kqmTipHTML(el);if(!r){kqmTipHide();return}const d=kqmTipEl();d.innerHTML=r[0];d.style.setProperty('--rc',r[1]||'#c9a24a');d.style.display='block';KQM.tipEl=el;KQM.tipXY=[x,y];kqmTipPos(x,y);
  clearTimeout(KQM.tipT);if(KQM.touch)KQM.tipT=setTimeout(kqmTipHide,6000)}
function kqmTipHide(){const d=$('kqmTip');if(d)d.style.display='none';KQM.tipEl=null}
addEventListener('pointerdown',e=>{KQM.touch=e.pointerType=='touch'||e.pointerType=='pen';if(KQM.touch&&!(e.target.closest&&e.target.closest('[data-kqt]')))kqmTipHide()},true);
document.addEventListener('mouseover',e=>{if(KQM.touch)return;const el=e.target&&e.target.closest&&e.target.closest('[data-kqt]');if(!el){if(KQM.tipEl)kqmTipHide();return}if(el!==KQM.tipEl)kqmTipShow(el,e.clientX,e.clientY)});
document.addEventListener('mousemove',e=>{if(KQM.touch||!KQM.tipEl)return;if(!KQM.tipEl.isConnected){const el=document.elementFromPoint(e.clientX,e.clientY),t=el&&el.closest&&el.closest('[data-kqt]');if(t)kqmTipShow(t,e.clientX,e.clientY);else kqmTipHide();return}kqmTipPos(e.clientX,e.clientY)},{passive:true});
document.addEventListener('wheel',()=>{if(!KQM.touch)kqmTipHide()},{passive:true,capture:true});
// a click re-renders the window: keep the tooltip on the new copy of the same slot
function kqmTipRefresh(){if(!KQM.tipEl)return;const k=KQM.tipEl.dataset.kqt,xy=KQM.tipXY||[0,0];if(KQM.tipEl.isConnected&&KQM.tipEl.offsetParent){kqmTipShow(KQM.tipEl,xy[0],xy[1]);return}
  const n=k&&k[0]!='x'&&document.querySelector('[data-kqt="'+k+'"]');if(n&&n.offsetParent)kqmTipShow(n,xy[0],xy[1]);else kqmTipHide()}
// touch: a tap shows the tooltip for that slot
document.addEventListener('click',e=>{if(!KQM.touch)return;const el=e.target&&e.target.closest&&e.target.closest('[data-kqt]');if(!el)return;const x=e.clientX,y=e.clientY,k=el.dataset.kqt;
  setTimeout(()=>{const n=el.isConnected?el:k[0]!='x'&&document.querySelector('[data-kqt="'+k+'"]');if(n&&n.offsetParent)kqmTipShow(n,x,y)},0)});
new MutationObserver(()=>{if(KQM.tipEl&&(!KQM.tipEl.isConnected||!KQM.tipEl.offsetParent))setTimeout(kqmTipRefresh,0)}).observe(document.body,{attributes:true,attributeFilter:['class'],subtree:true});

