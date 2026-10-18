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
  #bag .wb.cols.kqm-bagw{grid-template-columns:1fr}
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

// ================= inventory =================
function kqmBagInit(){if(KQM.ready)return;const bag=$('bag'),wb=bag&&bag.querySelector('.wb');if(!wb)return;KQM.ready=true;
  wb.classList.add('kqm-bagw');const left=wb.children[0],right=wb.children[1];left.classList.add('kqm-left');right.classList.add('kqm-right');
  const doll=document.createElement('div');doll.className='kqm-doll';doll.innerHTML='<div class="kqm-dl"></div><div class="kqm-dr"></div>';
  left.insertBefore(doll,left.firstChild);doll.insertBefore($('hv'),doll.children[1]);
  const sum=document.createElement('div');sum.className='kqm-sum';sum.id='kqmSum';doll.after(sum);
  const sp=document.createElement('div');sp.className='kqm-statp kqm-tabhid';sp.id='kqmStatP';right.appendChild(sp);sp.appendChild($('hs'));
  const eqh=right.querySelector('.sec');if(eqh&&/equipped/i.test(eqh.textContent))eqh.classList.add('kqm-tabhid');$('eqrow').classList.add('kqm-tabhid')}
function kqmDoll(){const sl=kqmSlots(),L=['helm','chest','boots'],Rr=['weapon','offhand','amulet','ring'].filter(k=>sl.includes(k));
  const one=k=>{const it=eq[k];return it?kqmTile(it,'e',{eqm:0}):`<div class="kqm-slot kqm-empty" data-kqs="${k}" data-kqt="es:${k}"><span class="kqm-ic">${SLOTIC[k]}</span><span class="kqm-sn">${SLOTN[k]}</span></div>`};
  const d=document.querySelector('.kqm-dl'),r=document.querySelector('.kqm-dr');if(d)d.innerHTML=L.map(one).join('');if(r)r.innerHTML=Rr.map(one).join('');
  try{const s=HS(),kv=(l,v)=>`<div class="kv"><span>${l}</span><b>${v}</b></div>`;$('kqmSum').innerHTML=kv('Health',Math.round(s.hp))+kv('Mana',Math.round(s.mp))+kv('Phys. attack',Math.round(s.pa))+kv('Mag. attack',Math.round(s.ma))+kv('Phys. defense',Math.round(s.pd))+kv('Mag. defense',Math.round(s.md))}catch(_){}}
const KQM_SORT={best:(a,b)=>(canUse(b)-canUse(a))||b.r-a.r||b.lv-a.lv,rarity:(a,b)=>b.r-a.r||b.lv-a.lv,slot:(a,b)=>SLOTS.indexOf(itT(a).sl)-SLOTS.indexOf(itT(b).sl)||b.r-a.r,level:(a,b)=>b.lv-a.lv||b.r-a.r,new:(a,b)=>b.id-a.id};
function kqmGearTab(){const sl=kqmSlots(),F=KQM.filt!='all'&&!sl.includes(KQM.filt)?'all':KQM.filt;KQM.filt=F;
  let L=gear.slice().sort(KQM_SORT[KQM.sort]||KQM_SORT.best);if(F!='all')L=L.filter(i=>itT(i).sl==F);
  const chips=`<button data-kqf="all" class="${F=='all'?'on':''}">All ${gear.length}</button>`+sl.map(k=>{const n=gear.filter(i=>itT(i).sl==k).length;return n||F==k?`<button data-kqf="${k}" class="${F==k?'on':''}" title="${SLOTN[k]}">${SLOTIC[k]} ${n}</button>`:''}).join('');
  const sel=`<select class="kqm-sort" title="Sort">${[['best','Best for you'],['rarity','Rarity'],['slot','Slot'],['level','Item level'],['new','Newest']].map(o=>`<option value="${o[0]}" ${KQM.sort==o[0]?'selected':''}>${o[1]}</option>`).join('')}</select>`;
  return `<div class="kqm-bar"><span class="kqm-chips">${chips}</span>${sel}</div><div class="kqm-grid kqm-bagg">${L.map(i=>kqmTile(i,'g')).join('')}${kqmFill(L.length)}</div>`+
    (gear.length?'':'<div class="mut" style="padding:4px 2px">No gear yet. Monsters drop gear for your class; elites and bosses drop the best.</div>')}
function kqmMatTab(){const t=k=>`<div class="kqm-slot mi" data-kqt="m:${kqmEsc(k)}"><span class="kqm-ic">${matInfo(k)[1]}</span><span class="kqm-ct">${mats[k]}</span><span class="kqm-hold">${kqmEsc(matInfo(k)[0])}</span></div>`;
  const has=k=>mats[k]>0,up=UPM.map(u=>u[0]).filter(has),fm=FAMK.map(f=>FAMD[f].mat).filter(has),rs=Object.keys(RES).filter(has),seen=new Set([...up,...fm,...rs]),ot=Object.keys(mats).filter(k=>has(k)&&!seen.has(k));
  const sec=(n,a)=>a.length?`<div class="kqm-h">${n}</div><div class="kqm-grid">${a.map(t).join('')}${kqmEmpty((8-a.length%8)%8)}</div>`:'';
  return sec('Upgrade materials',up)+sec('Companion materials (evolution)',fm)+sec('Gathered',rs)+sec('Other',ot)||'<div class="mut" style="padding:8px">Chop trees, mine rocks, forage plants and defeat monsters for materials.</div>'}
function kqmSupTab(){const grp=[['Food','food'],['Potions & elixirs','pot','elixir'],['Fusion catalysts','cat'],['Runes','rune'],['Seeds','fert','seed'],['Crops & ingredients','crop','ing']],used=new Set(grp.flatMap(g=>g.slice(1)));
  const t=k=>{const S=SUP[k];return `<button class="kqm-slot${KQM.supSel==k?' on':''}" data-kqsup="${k}" data-kqt="s:${k}"><span class="kqm-ic">${S.i}</span><span class="kqm-ct">${cnt(k)}</span></button>`};
  const ks=c=>Object.keys(SUP).filter(k=>c.includes(SUP[k].c)&&cnt(k)>0);
  const all=grp.map(g=>[g[0],ks(g.slice(1))]).concat([['Other',Object.keys(SUP).filter(k=>!used.has(SUP[k].c)&&cnt(k)>0)]]);
  const h=all.map(([n,a])=>a.length?`<div class="kqm-h">${n}</div><div class="kqm-grid">${a.map(t).join('')}${kqmEmpty((8-a.length%8)%8)}</div>`:'').join('');
  return h||'<div class="mut" style="padding:8px">No supplies yet. Cook and brew at the hearth and alchemy table in any town.</div>'}
function kqmEggTab(){const now=Date.now();
  const t=e=>{const p=Math.min(1,(now-(e.t0||now))/EGG_T),rd=p>=1,inner=`<span class="kqm-ic">🥚</span><span class="kqm-up">T${e.tier+1}</span><span class="kqm-eb"><i data-egb="${e.id}" style="width:${p*100}%"></i></span>`;
    return rd?`<button class="kqm-slot kqm-rdy" data-hatch="${e.id}" data-kqt="egg:${e.id}" style="--rc:${RAR[e.tier][1]}">${inner}</button>`:`<div class="kqm-slot" data-kqt="egg:${e.id}" style="--rc:${RAR[e.tier][1]}">${inner}</div>`};
  return '<div class="mut dtl" style="padding:2px 2px 4px">Eggs hatch after a short wait in your bag. Click a glowing egg to hatch it.</div>'+
    `<div class="kqm-grid">${eggs.map(t).join('')}${kqmEmpty(Math.max(16,Math.ceil((eggs.length+1)/8)*8)-eggs.length)}</div>`+(eggs.length?'':'<div class="mut" style="padding:4px 2px">No eggs. They are rare drops from monsters, elites and bosses, and some shops sell them.</div>')}
// ---------------- forge (item upgrades) ----------------
function kqmForgeItem(){return selI&&selI.k!='p'?kqmFind(selI.k,selI.id):null}
function kqmForgePanel(it){if(!it)return '<div class="mut">Pick an item on the left to see what its next upgrade costs and gives.</div>';
  const u=it.up||0,cap=typeof upCap=='function'?upCap():10,inTown=townAt(pl.position.x,pl.position.z,1)>=0,R=RAR[it.r];
  let h=`<div class="kqm-fh">${kqmTile(it,kqmEq(it)?'e':'g',{noSel:1})}<div><b style="color:${R[1]}">${kqmEsc(itName(it))}</b><div class="mut" style="font-size:.7rem">${R[0]} ${SLOTN[itT(it).sl]} · iLvl ${it.lv}</div><div class="kqm-pips">${'◆'.repeat(u)}${'◇'.repeat(10-u)}</div></div></div>`;
  if(u>=10)return h+'<div class="kqm-ok">Fully upgraded (+10).</div>';
  const c=upCost(it),nx=itStats(Object.assign({},it,{up:u+1})),cs=itStats(it),hm=mats[c.m]||0;
  h+=`<div class="kqm-h">+${u} → +${u+1}</div>`+[...new Set([...Object.keys(cs),...Object.keys(nx)])].filter(k=>SNM[k]).sort((x,y)=>KQM_ORD.indexOf(x)-KQM_ORD.indexOf(y)).map(k=>{const a=cs[k]||0,b=nx[k]||0,d=b-a,fl=['pa','ma','pd','md','hp','mp'].includes(k);
    return `<div class="kqm-frow"><span>${kqmLab(k)}</span><span>${kqmFmt(k,a).replace(/^\+/,fl?'':'+')} → <b>${kqmFmt(k,b).replace(/^\+/,fl?'':'+')}</b> ${(fl?Math.abs(d)>=.5:Math.abs(d)>=.0005)?`<span class="kqm-ok">▲${kqmFmt(k,d).slice(1)}</span>`:''}</span></div>`}).join('');
  h+=`<div class="kqm-h">Cost</div><div class="kqm-frow"><span>${matInfo(c.m)[1]} ${c.m}</span><b class="${hm>=c.n?'kqm-ok':'kqm-bad'}">need ${c.n} · have ${hm}</b></div><div class="kqm-frow"><span>🪙 Gold</span><b class="${gold>=c.g?'kqm-ok':'kqm-bad'}">${c.g.toLocaleString()}</b></div><div class="kqm-frow"><span>Success chance</span><b>${Math.round(c.ch*100)}%</b></div>`+
    (c.ch<1?'<div class="mut" style="font-size:.7rem">A failed upgrade uses the materials and gold; the item is never harmed.</div>':'');
  const lock=u>=cap,why=lock?'Forge mastery reaches +'+cap+'. Defeat Sovereigns (J) to raise it.':!inTown?'Upgrades need a forge: visit any town.':hm<c.n?'Not enough '+c.m+'.':gold<c.g?'Not enough gold.':'';
  h+=`<div class="mut" style="font-size:.7rem">Forge mastery: up to +${cap}</div>${why?`<div class="kqm-bad" style="font-size:.72rem">${why}</div>`:''}<button class="pri" data-kqup="1" ${why?'disabled':''}>⚒️ Upgrade to +${u+1}</button>`;
  return h}
function kqmForgeTab(){const E=SLOTS.map(k=>eq[k]).filter(Boolean),G=gear.slice().sort(KQM_SORT.best);
  return `<div class="kqm-forge"><div><div class="kqm-h">Equipped</div><div class="kqm-grid">${E.map(i=>kqmTile(i,'e',{lv:1})).join('')}${kqmEmpty((6-E.length%6)%6)}</div>`+
    `<div class="kqm-h">In your bag</div><div class="kqm-grid">${G.map(i=>kqmTile(i,'g',{lv:1})).join('')}${kqmEmpty(Math.max(12,Math.ceil((G.length+1)/6)*6)-G.length)}</div></div><div class="kqm-fp" id="kqmFP">${kqmForgePanel(kqmForgeItem())}</div></div>`}
// ---------------- the render hook ----------------
var KQM_FORGE=7,KQM_STATS=8;
function kqmBag(){kqmBagInit();if(!KQM.ready)return;kqmMarkNew();
  const bt=$('bt');if(bt&&!bt.querySelector('[data-bt="'+KQM_FORGE+'"]'))bt.insertAdjacentHTML('beforeend',`<button data-bt="${KQM_FORGE}" class="${bagTab2==KQM_FORGE?'on':''}" title="Upgrade your gear">⚒️ Forge</button><button data-bt="${KQM_STATS}" class="${bagTab2==KQM_STATS?'on':''}">Stats</button>`);
  if(bt&&!bt.querySelector('.on')){bagTab2=0;const b=bt.querySelector('[data-bt="0"]');if(b)b.classList.add('on')}
  kqmDoll();const bl=$('bl'),T=bagTab2;
  $('kqmStatP').classList.toggle('kqm-tabhid',T!=KQM_STATS);bl.classList.toggle('kqm-tabhid',T==KQM_STATS);
  if(T==0)bl.innerHTML=kqmGearTab();else if(T==1)bl.innerHTML=kqmMatTab();else if(T==3)bl.innerHTML=kqmSupTab();else if(T==4)bl.innerHTML=kqmEggTab();
  else if(T==KQM_FORGE){bl.innerHTML=kqmForgeTab();$('idt').innerHTML='<span class="mut dtl">⚒️ Upgrades need a town forge. Upgrade materials drop in the portal zones; the Trading Post sells the one for your tier. Success chance falls after +5.</span>'}
  else if(T==KQM_STATS)$('idt').innerHTML='<span class="mut dtl">Hover any stat for where it comes from. Gear, talents, food, elixirs and Sovereign powers all add up here.</span>';
  if(T==1||T==4)$('idt').innerHTML='<span class="mut dtl">'+(T==1?'Hover a material to see what it is for and where to find more.':'Eggs hatch on their own while you carry them. A glowing egg is ready: click it to watch it hatch.')+'</span>';
  if(T==3){const k=KQM.supSel,S=k&&SUP[k];if(S&&cnt(k)>0){const u=['food','elixir','pot'].includes(S.c);$('idt').innerHTML=`<div class="dtl"><div class="dh">${S.i} ${kqmEsc(S.n)} <small>×${cnt(k)}</small></div><div class="mut" style="font-size:.74rem">${S.d||''}</div></div>${u?`<button class="pri" data-use="${k}">${S.c=='food'?'Eat':'Drink'}</button>`:''}`}else{KQM.supSel=null;$('idt').innerHTML='<span class="mut dtl">Select a supply to see what it does. Food and potions can be used from here.</span>'}}
  // lock button next to Equip / Upgrade
  const act=$('idAct'),it=selI&&selI.k!='p'&&kqmFind(selI.k,selI.id);if(act&&it&&act.parentElement&&!$('kqmLock'))act.parentElement.insertAdjacentHTML('afterbegin',`<button id="kqmLock" title="Locked gear can't be sold">${it.lock?'🔒 Locked':'🔓 Lock'}</button>`);
  if(it&&it.kqn){delete it.kqn}
  if(KQM.bt!==T){KQM.bt=T;kqmSave()}
  setTimeout(kqmTipRefresh,0)}
{const f=rB0;rB0=function(){const r=f.apply(this,arguments);try{kqmBag()}catch(err){console.warn('kqm bag',err)}return r}}
// bag clicks: filters, sort, empty doll slots, supplies, forge, lock, double-click / second tap to equip or use
$('bag').addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
  const fb=t.closest('[data-kqf]');if(fb){KQM.filt=fb.dataset.kqf;rB0();return}
  const es=t.closest('[data-kqs]');if(es){KQM.filt=es.dataset.kqs;if(bagTab2!=0)bagTab2=0;rB0();return}
  if(t.closest('#kqmLock')){e.stopImmediatePropagation();const it=selI&&kqmFind(selI.k,selI.id);if(it){it.lock=!it.lock;say(it.lock?'🔒 '+itName(it)+' is locked and won’t be sold.':'🔓 '+itName(it)+' is unlocked.')}rB0();return}
  const up=t.closest('[data-kqup]');if(up){e.stopImmediatePropagation();if(up.disabled)return;const it=kqmForgeItem();if(it){doUpgrade(it);if(kqmEq(it)){refreshGear();if(HP)refreshGear(HP)}rB()}return}
  const su=t.closest('[data-kqsup]');if(su){const k=su.dataset.kqsup,S=SUP[k],now=performance.now(),again=KQM.touch?KQM.supSel==k:(KQM.last.k=='s'+k&&now-KQM.last.t<420);KQM.last={k:'s'+k,t:now};
    if(again&&S&&['food','elixir','pot'].includes(S.c)){KQM.last={k:'',t:0};consume(k);rB();return}KQM.supSel=k;rB0();return}
  const b=t.closest('[data-k]');if(!b||!b.dataset.id||b.dataset.k=='p')return;const k=b.dataset.k,id=+b.dataset.id,key=k+id,now=performance.now();
  const again=KQM.touch?(selI&&selI.k==k&&selI.id==id):(KQM.last.k==key&&now-KQM.last.t<420);KQM.last={k:key,t:now};
  if(again&&bagTab2!=KQM_FORGE){const it=kqmFind(k,id);if(!it)return;if(k=='g'&&!canUse(it)){say(hero.lvl<it.req?'You need level '+it.req+' to use that.':'Your class can’t use that.');return}
    e.stopImmediatePropagation();KQM.last={k:'',t:0};selI={k,id};invAct();setTimeout(kqmTipRefresh,0)}
},true);
$('bag').addEventListener('change',e=>{const s=e.target.closest&&e.target.closest('.kqm-sort');if(s){KQM.sort=s.value;kqmSave();rB0()}});
new MutationObserver(()=>{if($('bag').classList.contains('hide')){try{gear.forEach(i=>{if(i.kqn)delete i.kqn})}catch(_){}}}).observe($('bag'),{attributes:true,attributeFilter:['class']});

// ================= shops: wares as slot grids =================
function kqmRowInfo(r,o){const rn=r.querySelector('.rn'),ra=r.querySelector('.ra');if(!rn)return null;
  const cl=rn.cloneNode(true);cl.querySelectorAll('small,.ck,.mut').forEach(x=>x.remove());const bEl=cl.querySelector('b');let nm=(bEl?bEl.textContent:cl.textContent).trim();
  let ic=kqmIcon(nm)||kqmIcon(cl.textContent);if(ic)nm=nm.replace(ic,'').trim();
  const sm=rn.querySelector('small');
  const acts=r.tagName=='BUTTON'?[r]:[...(ra?ra.querySelectorAll('button'):[])];const gp=r.querySelector('.gp');
  let pr=gp?gp.textContent.trim():'';if(!pr){const pb=acts.find(b=>/🪙|\d/.test(b.textContent));if(pb)pr=(pb.textContent.match(/[\d,]+/)||[''])[0]}
  pr=pr.replace(/🪙/g,'').trim();
  const off=acts.length&&acts.every(b=>b.disabled),poor=!!(gp&&gp.classList.contains('poor'));
  const key=[...r.attributes].concat(acts[0]&&acts[0]!==r?[...acts[0].attributes]:[]).filter(a=>a.name.startsWith('data-')&&a.name!='data-kqt').map(a=>a.name+'='+a.value).join('&')+'|'+nm;
  return {r,nm:kqmEsc(nm),ic:ic||'📦',sub:sm?sm.innerHTML:'',pr,pl:pr?(o.direct?'Sells for ':'Price ')+pr+' 🪙':'',acts,off,poor,key,rc:(r.style.getPropertyValue('--rc')||'').trim()}}
function kqmSlotify(rows,o){rows=rows.filter(r=>r&&!r.closest('.kqm-hold'));if(!rows.length)return;o=o||{};const ctx=o.ctx||'x';
  const runs=[];rows.forEach(r=>{const L=runs[runs.length-1],prev=L&&L[L.length-1];let q=r.previousElementSibling;while(q&&q!==prev&&!q.offsetParent&&q.classList.contains('kqm-hold'))q=q.previousElementSibling;
    if(L&&prev.parentElement===r.parentElement&&q===prev)L.push(r);else runs.push([r])});
  const cells=[];
  runs.forEach(rs=>{const p=rs[0].parentElement;const grid=document.createElement('div');grid.className='kqm-grid kqm-shopg';const hold=document.createElement('div');hold.className='kqm-hold';
    p.insertBefore(grid,rs[0]);grid.after(hold);
    rs.forEach(r=>{const I=kqmRowInfo(r,o);hold.appendChild(r);if(!I)return;if(o.info)o.info(I);
      const c=document.createElement('button');c.type='button';c.className='kqm-cell'+(I.off?' kqm-off':'')+(I.poor?' kqm-poor':'')+(o.selCls&&r.classList.contains(o.selCls)?' kqm-sel':'');c.dataset.kqt='x';
      c.innerHTML=`<span class="kqm-slot" style="--rc:${I.rc||'rgba(255,255,255,.16)'}"><span class="kqm-ic">${I.ic}</span>${I.badge||''}${I.own!=null&&I.own>0?`<span class="kqm-ct">${I.own}</span>`:''}</span><span class="kqm-pr">${I.pr?kqmShort(I.pr)+' 🪙':I.tag||'—'}</span>`;
      I.hint=o.direct?(o.dhint||'Click to select'):(KQM.touch?'Tap to select, then use the button below':'Click to select · double-click to buy');
      KQM.wm.set(c,I);c._kq=I;grid.appendChild(c);cells.push(c);
      if(o.direct)c.addEventListener('click',()=>r.click());
      else{c.addEventListener('click',()=>{KQM.sel[ctx]=I.key;if(r.dataset.msel&&!r.classList.contains('on')){r.click();return}kqmBuyBar(cells,o)});
        c.addEventListener('dblclick',()=>{const a=I.acts.find(b=>!b.disabled&&b!==r)||(r.tagName=='BUTTON'&&!r.disabled?r:null);if(a){kqmTipHide();a.click()}})}})});
  if(!o.direct)kqmBuyBar(cells,o)}
function kqmBuyBar(cells,o){const ctx=o.ctx,host=o.bar;if(!host)return;let bar=host.querySelector(':scope > .kqm-bbar');if(!bar){bar=document.createElement('div');bar.className='kqm-bbar';host.appendChild(bar)}
  const c=cells.find(x=>x._kq.key==KQM.sel[ctx]);cells.forEach(x=>x.classList.toggle('on',x===c));
  if(!c){bar.innerHTML=`<span class="mut">${o.empty||'Select an item to buy it.'}</span>`;return}const I=c._kq;
  const acts=I.acts.length?I.acts:[];bar.innerHTML=`<span class="kqm-bn"><span class="kqm-ic">${I.ic}</span><span><b>${I.nm}</b><small>${I.pl||''}</small></span></span>`+
    acts.map((b,i)=>{const tx=b.textContent.trim(),lab=b===I.r||!tx||/🪙|^\d/.test(tx)?(o.buy||'Buy'):/^×/.test(tx)?'Buy '+tx:tx;return `<button class="${i==0?'pri':''}" data-kqa="${i}" ${b.disabled?'disabled':''}>${kqmEsc(lab)}</button>`}).join('');
  bar.querySelectorAll('[data-kqa]').forEach(x=>x.addEventListener('click',()=>{const a=acts[+x.dataset.kqa];if(a&&!a.disabled){kqmTipHide();a.click()}}))}
const kqmShort=p=>{const n=+String(p).replace(/[^\d]/g,'');return n>=10000?(+(n/1000).toFixed(n<100000?1:0))+'k':String(p)};
const kqmRows=(root,sel)=>root?[...root.querySelectorAll(sel||'.rw')]:[];
// Trading Post (#shop): buy list and the multi-sell list
{const f=rS;rS=function(){const r=f.apply(this,arguments);try{
    kqmSlotify(kqmRows($('sb')),{ctx:'sb',bar:$('sb'),empty:'Select something to buy. Hover a slot to compare it with your gear.',info:I=>{const d=I.r.dataset;
      if(d.b&&d.b[0]=='g'&&typeof stock2!='undefined'&&stock2){const it=stock2.gear[+d.b.slice(1)];I.item=()=>it;if(it){I.rc=RAR[it.r][1];I.ic=icoOf(it)}}
      if(d.b=='e'&&typeof stock2!='undefined'&&stock2&&stock2.egg){const eg=stock2.egg;I.egg=()=>eg;I.ic='🥚';I.rc=RAR[eg.tier][1]}
      if(d.b2)I.own=cnt(d.b2);if(d.b=='pot')I.own=pots;if(d.b=='up'){try{const k=UPM[townTier()-1][0];I.own=mats[k]||0}catch(_){}}}});
    kqmSlotify(kqmRows($('ss')),{ctx:'ss',direct:1,selCls:'sel',dhint:'Click to select it for selling',info:I=>{const k=I.r.dataset.sk||'',t=k[0],id=+k.slice(1);
      if(t=='g'){const it=gear.find(x=>x.id==id);I.item=()=>it;if(it){I.ic=icoOf(it);if(it.up)I.badge=`<span class="kqm-up">+${it.up}</span>`}}
      if(t=='e'){const eg=eggs.find(x=>x.id==id);I.egg=()=>eg;I.ic='🥚'}
      if(t=='s'&&SUP[k.slice(1)])I.ic=SUP[k.slice(1)].i}});
    const ss=$('ss'),bar=ss&&ss.querySelector('.sellbar');if(bar)ss.appendChild(bar)}catch(err){console.warn('kqm shop',err)}return r}}
// Magic Shop (#mshop)
{const f=rMS;rMS=function(){const r=f.apply(this,arguments);try{kqmSlotify(kqmRows($('mst')),{ctx:'ms',bar:$('mst'),info:I=>{const k=(I.acts[0]&&I.acts[0].dataset.ms)||'';
  if(k[0]=='e'&&typeof mstock!='undefined'&&mstock){const eg=mstock.eggs[+k.slice(1)];if(eg){I.egg=()=>eg;I.ic='🥚';I.rc=RAR[eg.tier][1]}}
  if(k[0]=='u'){try{const u=UPM[+k.slice(1)];I.own=mats[u[0]]||0}catch(_){}}}})}catch(err){console.warn('kqm mshop',err)}return r}}
// Curio Merchant and Rune Sage (XR.visitor), Stable (XR.stable), hearth / alchemy market (XR.cook / XR.alch)
{const f=XR.visitor;XR.visitor=function(){const r=f.apply(this,arguments);try{if(xwArg=='merchant'||xwArg=='sage'){const B=$('xwB');
  kqmSlotify(kqmRows(B).filter(x=>x.querySelector('[data-vbuy],[data-vrune]')),{ctx:'v'+xwArg,bar:B,info:I=>{const a=I.acts[0];if(!a)return;
    if(a.dataset.vrune){I.own=cnt(a.dataset.vrune);I.rc='#7a5cff'}
    if(a.dataset.vbuy!=null){try{const q=visStock()[+a.dataset.vbuy];if(q){if(q.k=='egg'){I.ic='🥚';I.sub='A mystery egg: you find out what hatches.'}if(q.sold){I.tag='Sold';I.pr=''}if(q.k!='egg'&&q.r&&RUNES[q.r])I.own=cnt(q.r)}}catch(_){}}}})}}catch(err){console.warn('kqm visitor',err)}return r}}
{const f=XR.stable;XR.stable=function(){const r=f.apply(this,arguments);try{const B=$('xwB'),L=B&&B.querySelector('.xcols > div');
  kqmSlotify(kqmRows(B,'[data-msel]'),{ctx:'stable',bar:L,empty:'Select a mount to see it and buy it.',info:I=>{const k=I.r.dataset.msel,D=MOUNTS[k];if(!D)return;I.ic=D.i;I.sub=D.d+'<br>Tier '+D.t+' · speed '+MBASE[D.t-1]+'-'+(MBASE[D.t-1]+6);
    if(mounts.some(m=>m.k==k))I.badge='<span class="kqm-lk">✔</span>'}})}catch(err){console.warn('kqm stable',err)}return r}}
function kqmMarket(){const B=$('xwB');if(!B)return;const sec=[...B.querySelectorAll('.sec')].find(s=>/^market/i.test(s.textContent.trim()));const rs=sec&&sec.nextElementSibling;
  if(rs)kqmSlotify(kqmRows(rs),{ctx:'mkt',bar:rs.parentElement,empty:'Select an ingredient to buy it (×1 or ×5).',info:I=>{const a=I.acts[0];if(a&&a.dataset.ibuy){const k=a.dataset.ibuy;I.own=cnt(k);if(SUP[k]&&SUP[k].d)I.sub=SUP[k].d}}})}
['cook','alch'].forEach(k=>{const f=XR[k];if(f)XR[k]=function(){const r=f.apply(this,arguments);try{kqmMarket()}catch(err){console.warn('kqm market',err)}return r}});

// ================= companions: tabs instead of one long column =================
const KQM_CT=[['ov','Overview'],['st','Stats & Grades'],['sp','Spells & Evolution'],['care','Care'],['tal','Talents']];
function kqmCInit(){if($('kqmCT'))return;const cv=$('cvw');if(!cv)return;const d=document.createElement('div');d.id='kqmCT';d.className='tabs kqm-ctabs hide';cv.parentElement.insertBefore(d,cv);
  d.addEventListener('click',e=>{const b=e.target.closest('[data-kqc]');if(!b)return;KQM.ctab=b.dataset.kqc;kqmSave();kqmCApply(true)});
  new MutationObserver(()=>{const cd=$('cd'),has=cd&&cd.querySelector(':scope > .kqm-cpane');if(!has){d.classList.add('hide');cv.parentElement.classList.remove('kqm-novw')}}).observe($('cd'),{childList:true})}
function kqmCApply(click,keepVw){const cd=$('cd'),T=$('kqmCT');if(!cd||!T)return;const c=party[cmpSel];
  if(!cd.querySelector(':scope > .kqm-cpane[data-kqc="'+KQM.ctab+'"]'))KQM.ctab='ov';
  cd.querySelectorAll(':scope > .kqm-cpane').forEach(p=>p.classList.toggle('hide',p.dataset.kqc!=KQM.ctab));
  T.querySelectorAll('[data-kqc]').forEach(b=>b.classList.toggle('on',b.dataset.kqc==KQM.ctab));
  const col=T.parentElement,was=col.classList.contains('kqm-novw');if(!keepVw)col.classList.toggle('kqm-novw',KQM.ctab!='ov');
  if(click){cd.scrollTop=0;if(KQM.ctab=='ov'&&(was||!PV.run)&&c&&!CE.hat)try{cmpPV(c)}catch(_){}}}
function kqmCTabs(){kqmCInit();const cd=$('cd'),T=$('kqmCT');if(!cd||!T||!party.length)return;const c=party[cmpSel];if(!c||cd.querySelector(':scope > .kqm-cpane'))return;
  const kids=[...cd.children];if(!kids.length)return;const P={ov:[],st:[],sp:[],care:[],tal:[]},head=[];let cur='head';
  kids.forEach(el=>{const cl=el.classList;let k;
    if(cl.contains('sec')){const t=el.textContent.toLowerCase();cur=/grade|modifier/.test(t)?'st':/spell|evolution|abilit/.test(t)?'sp':/feed|rune/.test(t)?'care':/talent/.test(t)?'tal':'ov';k=cur}
    else if(cl.contains('ctal'))k='tal';else if(cl.contains('btns'))k='ov';else if(cl.contains('kv'))k='st';
    else if(cur=='head'&&(cl.contains('dh')||cl.contains('mut')||cl.contains('cedh')))k='head';else k=cur=='head'?'ov':cur;
    (k=='head'?head:P[k]).push(el)});
  if(!P.st.length&&!P.sp.length)return; // not a companion detail (egg / hatch panel)
  const hd=document.createElement('div');hd.className='kqm-chead';head.forEach(x=>hd.appendChild(x));
  // overview: the numbers people look at most, modifiers and the action buttons
  let sum='';try{const kv=(l,v,t)=>`<div class="kv"${t?' title="'+t+'"':''}><span>${l}</span><b>${v}</b></div>`,o=typeof ovG=='function'?ovG(c):null;
    sum=kv('Health',Math.round(c.h)+' / '+M(c))+kv('Overall grade',o?`<span style="color:${o[2]}">${o[1]}</span>`:'—')+kv('Physical attack',cPA(c))+kv('Magical attack',cMA(c))+kv('Physical defense',D(c))+kv('Magical defense',cMD(c))+
      kv('Level',c.l+' · '+(c.l>=MAXLV?'max':c.x+' / '+needH(c.l)+' XP'))+kv('Evolution',c.evo?'✦'.repeat(c.evo)+' stage '+c.evo:'none')}catch(_){}
  const ov=document.createElement('div');ov.innerHTML=`<div class="kqm-csum">${sum}</div><div class="kqm-cmods">${typeof modChips=='function'?modChips(c):''}</div>`;
  const panes={};KQM_CT.forEach(([k])=>{const p=document.createElement('div');p.className='kqm-cpane';p.dataset.kqc=k;panes[k]=p});
  [...ov.children].forEach(x=>panes.ov.appendChild(x));P.ov.forEach(x=>panes.ov.appendChild(x));['st','sp','care','tal'].forEach(k=>P[k].forEach(x=>panes[k].appendChild(x)));
  cd.innerHTML='';cd.appendChild(hd);KQM_CT.forEach(([k])=>{if(k=='ov'||panes[k].children.length)cd.appendChild(panes[k])});
  // tab labels with small hints: free talent points, evolution ready, open rune slots, hurt companion
  const dot=n=>n?`<span class="kqm-dot">${n}</span>`:'',evo=panes.sp.querySelector('#mkEvo'),fr=typeof ctFree=='function'?ctFree(c):0;
  const hint={sp:evo&&!evo.disabled?'!':'',tal:fr>0?fr:'',care:c.h<M(c)*.5&&c.h>0?'!':''};
  T.innerHTML=KQM_CT.filter(([k])=>cd.querySelector(':scope > .kqm-cpane[data-kqc="'+k+'"]')).map(([k,n])=>`<button data-kqc="${k}">${n}${dot(hint[k])}</button>`).join('');T.classList.remove('hide');
  kqmCApply(false,true)}
{const f=rC0;rC0=function(){const r=f.apply(this,arguments);try{kqmCTabs()}catch(err){console.warn('kqm cmp',err)}return r}}
{const f=rC;rC=function(){try{kqmCInit();const T=$('kqmCT');if(T)T.parentElement.classList.remove('kqm-novw')}catch(_){}const r=f.apply(this,arguments);try{const cd=$('cd'),T=$('kqmCT');if(cd&&cd.querySelector(':scope > .kqm-cpane'))kqmCApply(false);else if(T)T.classList.add('hide')}catch(_){}return r}}
// [ and ] switch tabs in the open character or companion window
addEventListener('keydown',e=>{const t=e.target;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'||t.tagName=='SELECT'))return;if(e.key!='['&&e.key!=']')return;const d=e.key==']'?1:-1;
  if(!$('cmp').classList.contains('hide')){const L=[...document.querySelectorAll('#kqmCT [data-kqc]')].map(b=>b.dataset.kqc);if(!L.length)return;const i=L.indexOf(KQM.ctab);KQM.ctab=L[(i+d+L.length)%L.length];kqmSave();kqmCApply(true);e.preventDefault()}
  else if(!$('bag').classList.contains('hide')){const L=[...document.querySelectorAll('#bt [data-bt]')].map(b=>+b.dataset.bt);if(!L.length)return;const i=L.indexOf(bagTab2);bagTab2=L[(i+d+L.length)%L.length];rB0();e.preventDefault()}else return;e.stopImmediatePropagation()},true);
