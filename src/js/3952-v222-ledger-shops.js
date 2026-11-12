// ================= v222b shops are written as a ledger: a list of wares, the chosen one described beside it =================
// Owner (Nov 12 2026): "You did not implement the visual list in shops that was shown in the ledger style."
// The shops kept the v88 slot grids (rows of dark squares with a price under each). Now every shop list is what the Ledger
// mock-up showed: one line per ware - a small picture, the name, a dotted leader, the price - and, beside the list, a page
// for the chosen ware: its full description (the same text the tooltip gives: type, stats, the comparison with what you wear,
// the price) and the Buy buttons.
// How: the grids are built in one place, kqmSlotify (1060), and the buy buttons in kqmBuyBar. Both stay as they are (the cells,
// their clicks, double-click to buy and the tooltips are unchanged, so nothing about buying or selling changes); lg222Rows
// adds the name and the leader to each cell, lg222Det puts the description into the buy bar, and CSS lays the cells out as
// lines and the bar as the right-hand page (class lg-two on the list's box when it is at least 540 px wide; narrower boxes and
// phones keep the description under the list).
// The Trading Post (#shop) showed Buy and Sell side by side; as lists they are too narrow for that, so they are two tabs
// (lg222Tab, class lg-sell on #shop). Inventory, eggs and crafting stations keep their slot sheets: those are not shop lists.
// Your own windows only: nothing is sent in co-op.
function lg222Rows(){document.querySelectorAll('.kqm-shopg .kqm-cell:not([data-lg])').forEach(c=>{const I=c._kq;if(!I)return;c.dataset.lg='1';
    const pr=c.querySelector('.kqm-pr'),n=document.createElement('span'),d=document.createElement('i');n.className='lg-nm';d.className='lg-dots';
    let nm=I.nm||'';try{const eg=I.egg&&I.egg();if(eg)nm=RAR[eg.tier|0][0]+' Egg'}catch(_){}
    n.innerHTML=nm+(I.own!=null&&I.own>0?' <small>have '+I.own+'</small>':'');
    try{if((I.item&&I.item())||(I.egg&&I.egg()))n.style.color=I.rc||''}catch(_){}
    c.insertBefore(n,pr);c.insertBefore(d,pr)})}
function lg222Det(cells,o){const host=o&&o.bar;if(!host)return;const bar=host.querySelector(':scope > .kqm-bbar');if(!bar)return;
  host.classList.toggle('lg-two',host.clientWidth>=540);
  const c=cells.find(x=>x.classList.contains('on'));const old=bar.querySelector('.lg-det');if(old)old.remove();bar.classList.toggle('lg-has',!!c);if(!c)return;
  let t=null;try{t=kqmTipHTML(c)}catch(_){}if(!t)return;const d=document.createElement('div');d.className='lg-det kqm-tip';d.innerHTML=t[0];d.style.setProperty('--rc',t[1]||'');bar.insertBefore(d,bar.firstChild)}
{const f=kqmBuyBar;kqmBuyBar=function(cells,o){const r=f.apply(this,arguments);try{lg222Det(cells,o)}catch(e){console.warn('v222 shop page',e)}return r}}
{const f=kqmSlotify;kqmSlotify=function(rows,o){const r=f.apply(this,arguments);try{lg222Rows()}catch(e){console.warn('v222 shop list',e)}return r}}
// the Trading Post: Buy and Sell as two tabs
function lg222Tab(k){LG222.shopTab=k=='s'?'s':'b';const S=$('shop');if(!S)return;S.classList.toggle('lg-sell',LG222.shopTab=='s');
  let T=S.querySelector('.lg-tabs');if(!T){T=document.createElement('div');T.className='tabs lg-tabs';T.innerHTML='<button data-lgt="b">Buy</button><button data-lgt="s">Sell</button>';const wb=S.querySelector('.wb');wb.parentElement.insertBefore(T,wb);
    T.addEventListener('click',e=>{const b=e.target.closest('[data-lgt]');if(b)lg222Tab(b.dataset.lgt)})}
  T.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.lgt==LG222.shopTab))}
{const f=rS;rS=function(){const r=f.apply(this,arguments);try{lg222Tab(LG222.shopTab||'b')}catch(_){}return r}}
{const f=openShop;openShop=function(){LG222.shopTab='b';return f.apply(this,arguments)}}
document.head.insertAdjacentHTML('beforeend',`<style>
html body.kq .win .kqm-shopg{display:flex;flex-direction:column;gap:0;margin:2px 0 12px}
html body.kq .win .kqm-shopg .kqm-cell{display:grid;grid-template-columns:30px minmax(0,auto) minmax(14px,1fr) auto;align-items:center;gap:0 9px;flex-direction:row;width:100%;padding:4px 8px 4px 6px;text-align:left;
  background:none;border:0;border-radius:0;box-shadow:none;border-left:3px solid transparent}
html body.kq .win .kqm-shopg .kqm-cell .kqm-slot{width:28px;height:28px;aspect-ratio:auto;border-width:1px}
html body.kq .win .kqm-shopg .kqm-cell .kqm-slot .kqm-ic{font-size:1.05rem}
html body.kq .win .kqm-shopg .kqm-cell .kqm-slot .kqm-ct{display:none}
html body.kq .win .kqm-shopg .kqm-cell.on .kqm-slot,html body.kq .win .kqm-shopg .kqm-cell.kqm-sel .kqm-slot{outline:0}
.lg-nm{font-size:1.06rem;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.lg-nm small{font-size:.74em;font-style:italic;color:var(--kq-mut);margin-left:4px}
.lg-dots{display:block;align-self:end;height:.7em;margin-bottom:.38em;border-bottom:1px dotted rgba(58,44,28,.55)}
html body.kq .win .kqm-shopg .kqm-cell .kqm-pr{font-size:.98rem;font-weight:500;text-align:right;color:#2a2118;overflow:visible}
html body.kq .win .kqm-shopg .kqm-cell.kqm-poor .kqm-pr{color:#9a2a1a}
html body.kq .win .kqm-shopg .kqm-cell.kqm-off{opacity:.55}
html body.kq .win .kqm-shopg .kqm-cell:hover{background:rgba(140,47,31,.07)}
html body.kq .win .kqm-shopg .kqm-cell.on,html body.kq .win .kqm-shopg .kqm-cell.kqm-sel{background:linear-gradient(90deg,rgba(140,47,31,.17),rgba(140,47,31,.03) 85%,transparent);border-left-color:var(--lg-red)}
html body.kq .win .kqm-shopg .kqm-cell.kqm-sel .lg-nm::before{content:'✓ ';color:var(--lg-red)}
/* the chosen ware's page */
html body.kq .win .kqm-bbar{flex-direction:column;align-items:stretch;gap:8px;background:none;border-top:1px solid var(--lg-rule);padding:10px 2px 4px;position:static}
html body.kq .win .kqm-bbar.lg-has .kqm-bn{display:none}
html body.kq .win .kqm-bbar>.mut{font-style:italic}
html body.kq .win .kqm-bbar button{padding:7px 12px;font-size:.95rem}
html body.kq .win .lg-det.kqm-tip{position:static;display:block;width:auto;background:none;border:0;border-radius:0;box-shadow:none;padding:0;max-width:none;font-size:.95rem;pointer-events:auto;color:#2a2118;z-index:auto}
html body.kq .win .lg-det.kqm-tip .kqm-tn{font-family:'IM Fell English','EB Garamond',Georgia,serif;font-weight:400;font-size:1.3rem;line-height:1.15;font-size-adjust:none;flex-wrap:wrap}
html body.kq .win .lg-det.kqm-tip .kqm-ts{font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;opacity:.9;margin-top:2px}
html body.kq .win .lg-det.kqm-tip .kqm-tst{margin:10px 0 6px;gap:3px}html body.kq .win .lg-det.kqm-tip .kqm-tr{font-size:.95rem}html body.kq .win .lg-det.kqm-tip .kqm-tr .kqm-d{font-size:.86rem}
html body.kq .win .lg-det.kqm-tip .kqm-td,html body.kq .win .lg-det.kqm-tip .kqm-tc{font-style:italic;font-size:.92rem;border-top-color:rgba(58,44,28,.25)}
html body.kq .win .lg-det.kqm-tip .kqm-tp{font-size:1rem;font-weight:500}html body.kq .win .lg-det.kqm-tip .kqm-th{display:none}
html body.kq .win .lg-two{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr);column-gap:24px;align-items:start;align-content:start}
html body.kq .win .lg-two>*{grid-column:1;min-width:0}
html body.kq .win .lg-two>.kqm-bbar{grid-column:2;grid-row:1/span 80;align-self:start;position:sticky;top:0;margin:0;border-top:0;border-left:1px solid var(--lg-rule);padding:2px 0 8px 20px;min-height:180px}
/* the Trading Post: one list at a time */
#shop .wb.cols2{grid-template-columns:minmax(0,1fr)}
#shop:not(.lg-sell) .wb.cols2>div:nth-child(2),#shop.lg-sell .wb.cols2>div:nth-child(1){display:none}
#shop .wb.cols2>div:nth-child(1)>.sec{display:none}
html body.kq .win .lg-tabs{margin:0 24px 4px;padding:0}
#shop.lg-sell #ss .kqm-shopg{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:28px}
html body.kq .win .sellbar{background:none;border-top:1px solid var(--lg-rule);position:static}
html body.mob .lg-nm{font-size:1rem}
</style>`);
