// ================= v103 kingdom (3/5): one Stronghold Steward window for everything =================
// Shops, upgrades and houses are one list (no more Shops / Upgrades tabs), next to a plan of the Grand Square.
// Build (or Move) puts the window in placing mode: free lots light up on the plan and a click on one builds it there.
// Below the list: the citizens, each with a task (idle, or gather a material from a completed zone).
// Esc while placing cancels placing (a second Esc closes the window as usual).
var KM103=KM103||{};KM103.pick=null;KM103.hover=null;KM103.sel=null;KM103.info=null;
function kmPickStart103(p){KM103.pick=p;KM103.sel=null;rX();try{const c=document.querySelector('#xw .kmplan');if(c)c.scrollIntoView({block:'nearest'})}catch(_){}}
function kmPickEnd103(){KM103.pick=null;KM103.hover=null}
// what a pending pick is: {key, kind:'shop'|'up'|'house'|'move', k, label}
function kmPickLabel103(p){const nm=lotName103(p.key)||['🏠','House'];return (p.kind=='move'?'Moving ':'Placing ')+nm[0]+' '+(p.kind=='house'?'a new house':nm[1])}
function kmPlace103(id){const p=KM103.pick;if(!p)return;const l=LOTM103[id];if(!l)return;const k=lotKey103(id);if(k&&k!==p.key)return say('That lot is taken.');
  if(p.kind=='move'){kmPickEnd103();if(lotPut103(p.key,id)){const nm=lotName103(p.key);say('🏗️ '+nm[0]+' '+nm[1]+' now stands on lot '+id+'.');sfx('power')}try{saveGame(true)}catch(_){}rX();return}
  if(p.kind=='shop'){const o=SHOPS.find(q=>q.k==p.k),ok=o&&shopCan(o);if(!ok||!ok[0]){kmPickEnd103();rX();return say((ok?ok[1]:'Unknown shop')+'.')}SH.pos[p.k]=id;kmPickEnd103();shopBuy(p.k);if(!shopBuilt(p.k))delete SH.pos[p.k];rX();return}
  if(p.kind=='up'){const u=SHU.find(q=>q.k==p.k),ok=u&&shCanBuy(u);if(!ok||!ok[0]){kmPickEnd103();rX();return say((ok?ok[1]:'Unknown upgrade')+'.')}SH.pos['u:'+p.k]=id;kmPickEnd103();shBuy(p.k);if(!(kdLv(p.k)>0))delete SH.pos['u:'+p.k];rX();return}
  if(p.kind=='house'){kmPickEnd103();hsBuy103(id);rX();return}}
var KM103_SHOPD={smith:'Upgrade and reforge your gear at the forge'};
function kmRow103(o){// o: {i,n,d,state,cost,btn:[[label,data,attrs]],col}
  return `<div class="rw kmrw" style="--rc:${o.col||'#c9a24a'}"><span class="rn">${o.i} <b>${o.n}</b>${o.pips?' <span class="kmpip">'+o.pips+'</span>':''}<small>${o.d}${o.cost?'<br>'+o.cost:''}</small></span><span class="ra">${o.state||''}${(o.btn||[]).map(b=>`<button ${b[2]||''} ${b[1]}>${b[0]}</button>`).join('')}</span></div>`}
function kmLotTxt103(key){const l=lotOf103(key);return l?'<span class="mut kmlot" data-kmshow="'+l.id+'">📍 '+l.id+'</span>':''}
XR.hold=()=>{const T=TOWNS[0];$('xwT').textContent='🏰 Stronghold Steward';
  $('xwS').textContent='🪙 '+gold+' · 👑 '+bossDone.size+' · 👥 '+HS103.cit.length;$('xwS').title='Gold · Sovereigns defeated · citizens';
  const P=KM103.pick,R=[],mv=key=>['Move','data-kmmv="'+key+'"',P?'disabled':''],rt=key=>['⟳','data-kmrot="'+key+'"',(P?'disabled ':'')+'title="Turn it a quarter turn"']; // v109: turn buildings
  // ---- shops ----
  R.push('<div class="sec">🔨 Shops</div>');
  R.push(kmRow103({i:'⚒️',n:'Blacksmith',d:KM103_SHOPD.smith+' · always open',state:'<em style="color:#6ee7b7">✔ Open</em>'+kmLotTxt103('smith'),btn:[mv('smith'),rt('smith')],col:'#6ee7b7'}));
  // v109: shop upgrades (shpUp109 in 1960) — the Trading Post is always open, so it is listed for its upgrades
  const su=(k,P)=>typeof shpUp109=='function'?shpUp109(k,P):null;
  {const u=su('post',P);if(u)R.push(kmRow103({i:'🪙',n:'Trading Post',pips:u.pips,d:'Gear, potions, an egg and upgrade material · always open'+u.d,cost:u.cost,col:'#6ee7b7',state:'<em style="color:#6ee7b7">✔ Open</em>',btn:u.btn}))}
  SHOPS.forEach(o=>{const bt=shopBuilt(o.k),ok=shopCan(o),u=bt?su(o.k,P):null;R.push(kmRow103({i:o.i,n:o.n,pips:u?u.pips:'',d:o.d+(u?u.d:''),cost:bt?(u?u.cost:''):'Cost: '+costH(o.g,o.m),col:bt?'#6ee7b7':'#c9a24a',
    state:bt?'<em style="color:#6ee7b7">✔ Open</em>'+kmLotTxt103(o.k):'',btn:bt?(u?u.btn:[]).concat([mv(o.k),rt(o.k)]):[['Build','data-kmb="shop:'+o.k+'"','class="pri" '+(ok[0]&&!P?'':'disabled')+' title="'+ok[1]+'"']]}))});
  // ---- upgrades ----
  R.push('<div class="sec">🏰 Upgrades</div>');
  SHU.forEach(u=>{const l=shL(u.k),c=SHC[l+1],ok=shCanBuy(u),pips='◆'.repeat(l)+'◇'.repeat(3-l),pl=UPK103.includes(u.k);
    const cost=c?'Next: '+u.d(l+1)+'<br>Cost: '+costH(c.g,shCost(u,l+1))+(c.b?' · 👑 '+c.b+' Sovereigns':''):'';
    const b=[];if(l<3)b.push([l?'Upgrade':'Build','data-kmb="'+(l||!pl?'lvl':'up')+':'+u.k+'"','class="pri" '+(ok[0]&&!P?'':'disabled')+' title="'+ok[1]+'"']);if(l&&pl)b.push(mv('u:'+u.k),rt('u:'+u.k));
    R.push(kmRow103({i:u.i,n:u.n,pips,d:(l?'Now: '+u.d(l):'Not built yet')+(u.k=='walls'?' · the wall ring round the whole square':''),cost,col:'#'+u.col.toString(16).padStart(6,'0'),
      state:(l>=3?'<em style="color:#6ee7b7">✔ Max</em>':'')+(pl?kmLotTxt103('u:'+u.k):''),btn:b}))});
  // ---- houses ----
  const nH=HS103.h.length,hc=hsCost103(nH),hok=hsCan103();
  R.push('<div class="sec">🏠 Houses <span class="mut" style="text-transform:none;letter-spacing:0">('+nH+' / '+HS103_MAX+' · two citizens live in each)</span></div>');
  HS103.h.forEach((h,i)=>R.push(kmRow103({i:'🏠',n:h.nm,d:'Home of '+hsWho103(i),state:kmLotTxt103('h:'+i),btn:[mv('h:'+i),rt('h:'+i)],col:'#d8b46a'})));
  if(nH<HS103_MAX)R.push(kmRow103({i:'🏗️',n:'New house',d:'Two new citizens move in. Give them work below.',cost:'Cost: '+costH(hc.g,hc.m),btn:[['Build','data-kmb="house:1"','class="pri" '+(hok[0]&&!P?'':'disabled')+' title="'+hok[1]+'"']]}));
  // ---- citizens (v104: each has a trade; v105: ranks, food, goods to collect at the house) ----
  R.push('<div class="sec kmcits">👥 Citizens</div>');
  if(!HS103.cit.length)R.push('<div class="mut kmnote">Nobody lives in Duskhold yet. Build a house and two citizens move in.</div>');
  else{if(!bossDone.size)R.push('<div class="mut kmnote">Complete a zone (defeat its Sovereign) and citizens can work there.</div>');
    const fd=czFood105();
    R.push('<div class="mut kmnote">🍖 Food for trips: <b style="color:'+(fd?'var(--ink)':'#f87171')+'">'+fd+' ration'+(fd==1?'':'s')+'</b> in your bag (raw meat, fish, berries and crops are 1 ration, cooked meals 3). A trip costs 1 ration for a gatherer, otherwise the zone\'s tier.<br>'+
      'Train a citizen as an 🥚 Egg Collector (🪙 '+CZR104.egg.g+'), 🎣 Fisherman (🪙 '+CZR104.fish.g+') or 🏹 Hunter (🪙 '+CZR104.hunt.g+'). Raise their rank to reach higher-tier zones. Goods wait at the house until you collect them there.</div>');
    HS103.cit.forEach((c,i)=>{const h=HS103.h[c.h],ro=czRole104(c),RR=CZR104[ro],L=czOpts104(c),rk=czRank105(c),up=czUpCost105(c),busy=!!(c.t0||c.bag);
      const opts='<option value="">💤 Idle — strolls round town</option>'+L.map(([v,l,ok])=>`<option value="${v}" ${c.task===v?'selected':''} ${ok?'':'disabled'}>${l}</option>`).join('');
      const tr='<option value="">'+RR.i+' '+RR.n+'</option>'+Object.keys(CZR104).filter(k=>k!==ro).map(k=>`<option value="${k}" ${gold<CZR104[k].g||busy?'disabled':''}>Train as ${CZR104[k].i} ${CZR104[k].n}${CZR104[k].g?' · 🪙 '+CZR104[k].g:' (free)'}</option>`).join('');
      let st;if(c.bag)st='<b style="color:#f0cc72">🎁 Back with goods — collect them at '+(h?h.nm:'the house')+' (F)</b><br>'+czGoodsTxt105(c.bag);
      else if(c.task&&c.t0)st=czTaskTxt104(c)+` · back in <b data-czt="${i}">${kmClock103(czLeft103(c))}</b>`;
      else if(c.task&&c.wf==1)st='<span class="warn" style="display:inline">🍽️ Waiting for food: needs '+czCost105(c)+' ration'+(czCost105(c)>1?'s':'')+' to set off</span> · '+czTaskTxt104(c);
      else if(c.task&&c.wf==2)st='<span class="warn" style="display:inline">🥚 Your egg bag is full ('+CZ104_EGGMAX+')</span> · '+czTaskTxt104(c);
      else st=L.length?'Idle in town':'Idle — no work yet ('+(ro=='fish'?'needs a completed zone with water':'needs a completed zone')+')';
      const ub=up?`<button data-czu="${i}" ${gold<up?'disabled':''} title="Rank ${rk+1}: Tier ${rk+1} zones">⬆ Rank ${rk+1} · 🪙 ${up}</button>`:'<em style="color:#6ee7b7">Max rank</em>';
      R.push(`<div class="rw kmrw kmcit kmr-${ro}${KM103.house===c.h?' on':''}"><span class="rn">${RR.i} <b>${c.n}</b> <span class="kmrole">${RR.n} · rank ${rk}</span> <span class="mut">· ${h?h.nm:''}</span><small>${st}</small></span><span class="ra kmcsel"><select data-czr="${i}" aria-label="Trade for ${c.n}" ${busy?'disabled title="Busy with a trip"':''}>${tr}</select><select data-czk="${i}" aria-label="Task for ${c.n}" ${c.bag?'disabled':''}>${opts}</select>${ub}</span></div>`)})}
  // ---- plan ----
  const lot=KM103.sel&&LOTM103[KM103.sel],lk=lot&&lotKey103(lot.id),lnm=lk&&lotName103(lk);
  const lkd=lot&&typeof lotOpen109=='function'&&!lotOpen109(lot.id),pinf=typeof lotInfo109=='function'?lotInfo109(P):'';
  const info=(P?`<div class="kmpick">📍 <span>${kmPickLabel103(P)} — click a lit plot on the plan.</span><button data-kmx="1">Cancel</button></div>`
    :lot?`<div class="kminfo"><b>Lot ${lot.id}</b> · ${lot.a} · ${lk?lnm[0]+' '+lnm[1]:lkd?'🔒 not part of the kingdom yet':'free'}${lk&&lk!=='u:walls'?` <button data-kmmv="${lk}">Move</button> <button data-kmrot="${lk}" title="Turn it a quarter turn">⟳ Turn</button>`:''}</div>`
    :'<div class="kminfo mut">Every building stands on a lot. Pick one when you build, or Move it later. 🟦 is you.</div>')+pinf;
  $('xwB').innerHTML=`<div class="km"><div class="kmplan"><canvas id="kmCv" width="680" height="680"></canvas>${info}</div><div class="kmlist rows">${R.join('')}</div></div>`;
  $('xwF').innerHTML='<span class="mut dtl">Gather wood, stone, fibers, glow caps and the like in the portal zones, and monster parts like Rock Core, Silk Gland and Ectoplasm. Upgrade levels need defeated Sovereigns. Every building can be moved and turned (⟳) for free.</span>';
  kmDraw103();
  if(KM103.focus=='cit'){KM103.focus=null;try{const e=$('xwB').querySelector('.kmcits');if(e)e.scrollIntoView({block:'start'})}catch(_){}}};
function kmClock103(ms){const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function kmDraw103(){const cv=$('kmCv');if(!cv)return;try{KM103.info=lotPlan103(cv,{pick:KM103.pick?KM103.pick.key||'__new':null,hover:KM103.hover,sel:KM103.sel})}catch(e){console.warn('v103 plan',e)}}
function kmCvLot103(e){const cv=$('kmCv');if(!cv||!KM103.info)return null;const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*cv.width/r.width,y=(e.clientY-r.top)*cv.height/r.height;return lotHit103(KM103.info,x,y)}
$('xw').addEventListener('click',e=>{if(xwMode!='hold')return;
  if(e.target.id=='kmCv'){const id=kmCvLot103(e);if(!id)return;if(KM103.pick){const k=lotKey103(id);if(!k||k===KM103.pick.key)kmPlace103(id)}else{KM103.sel=id;rX()}return}
  const t=e.target.closest('[data-kmb],[data-kmmv],[data-kmx],[data-kmshow]');if(!t||t.disabled)return;const d=t.dataset;
  if(d.kmx){kmPickEnd103();rX();return}
  if(d.kmshow){KM103.sel=d.kmshow;rX();return}
  if(d.kmmv){kmPickStart103({kind:'move',key:d.kmmv});return}
  if(d.kmb){const [kind,k]=d.kmb.split(':');
    if(kind=='lvl'){shBuy(k);rX();return}
    if(kind=='shop')kmPickStart103({kind:'shop',k,key:k});
    else if(kind=='up')kmPickStart103({kind:'up',k,key:'u:'+k});
    else if(kind=='house')kmPickStart103({kind:'house',key:'h:'+HS103.h.length})}});
$('xw').addEventListener('click',e=>{if(xwMode!='hold')return;const t=e.target.closest('[data-czu]');if(!t||t.disabled)return;const c=HS103.cit[+t.dataset.czu];if(c)czRankUp105(c);rX()});
$('xw').addEventListener('change',e=>{if(xwMode!='hold')return;const t=e.target.closest('[data-czr]');if(!t||!t.value)return;const c=HS103.cit[+t.dataset.czr];if(c)czTrain104(c,t.value);rX()});
$('xw').addEventListener('change',e=>{if(xwMode!='hold')return;const s=e.target.closest('[data-czk]');if(!s)return;const c=HS103.cit[+s.dataset.czk];if(!c)return;czTask103(c,s.value);
  say(s.value?CZR104[czRole104(c)].i+' '+c.n+' sets off: '+czTaskTxt104(c).replace(/<[^>]+>/g,'')+'.':'🧑 '+c.n+' takes it easy in town.');rX()});
$('xw').addEventListener('mousemove',e=>{if(xwMode!='hold'||e.target.id!='kmCv')return;const id=kmCvLot103(e);if(id!==KM103.hover){KM103.hover=id;kmDraw103()}});
$('xw').addEventListener('mouseleave',()=>{if(KM103.hover){KM103.hover=null;kmDraw103()}},true);
// Esc while placing only cancels placing
addEventListener('keydown',e=>{if(e.key!='Escape'||xwMode!='hold'||$('xw').classList.contains('hide')||!KM103.pick)return;kmPickEnd103();rX();e.stopImmediatePropagation();e.preventDefault()},true);
// a closed window forgets a half-done placing
{const x=$('xwClose');if(x)x.addEventListener('click',()=>{kmPickEnd103();KM103.sel=null;KM103.house=null})}
// countdowns tick while the window is open
setInterval(()=>{try{if(xwMode!='hold'||$('xw').classList.contains('hide'))return;document.querySelectorAll('#xw [data-czt]').forEach(b=>{const c=HS103.cit[+b.dataset.czt];if(c)b.textContent=kmClock103(czLeft103(c))});kmDraw103()}catch(_){}},1000);
document.head.insertAdjacentHTML('beforeend',`<style>
#xw .km{display:grid;grid-template-columns:minmax(240px,340px) 1fr;gap:16px;align-items:start}
#xw .kmplan{position:sticky;top:0;display:flex;flex-direction:column;gap:6px}
#xw .kmplan canvas{width:100%;aspect-ratio:1;border-radius:6px;border:1px solid var(--line);cursor:pointer;background:#0d0b09;touch-action:manipulation}
#xw .kmpick{display:flex;gap:8px;align-items:center;background:rgba(201,162,74,.16);border:1px solid #c9a24a;border-radius:6px;padding:6px 8px;font-size:.78rem}
#xw .kmpick span{flex:1}#xw .kminfo{font-size:.76rem;padding:2px 2px}#xw .kminfo button{margin-left:6px}
#xw .kmrw .ra{gap:6px;flex-wrap:wrap;justify-content:flex-end}#xw .kmpip{color:#f0cc72;letter-spacing:2px}
#xw .kmlot{font-size:.7rem;cursor:pointer;white-space:nowrap}#xw .kmlot:hover{color:var(--ink)}
#xw .kmcit.on{background:rgba(201,162,74,.12)}#xw .kmcit select{max-width:250px}#xw .kmcsel{flex-direction:column;align-items:flex-end}
#xw .kmrole{font-size:.66rem;padding:1px 6px;border-radius:99px;background:rgba(255,255,255,.08);color:var(--mut)}#xw .kmr-egg .kmrole{background:rgba(216,204,176,.2);color:#efe4c8}#xw .kmr-fish .kmrole{background:rgba(90,150,200,.22);color:#b8dcff}#xw .kmr-hunt .kmrole{background:rgba(120,140,60,.25);color:#d8e8a0}#xw .kmnote{font-size:.76rem;padding:4px 8px}
@media (max-width:760px){#xw .km{grid-template-columns:1fr}#xw .kmplan{position:static;max-width:360px;margin:0 auto;width:100%}}
</style>`);
