// ================= inventory =================
function kqmBagInit(){if(KQM.ready)return;const bag=$('bag'),wb=bag&&bag.querySelector('.wb');if(!wb)return;KQM.ready=true;
  wb.classList.add('kqm-bagw');const left=wb.children[0],right=wb.children[1];left.classList.add('kqm-left');right.classList.add('kqm-right');
  const doll=document.createElement('div');doll.className='kqm-doll';doll.innerHTML='<div class="kqm-dl"></div><div class="kqm-dr"></div>';
  left.insertBefore(doll,left.firstChild);doll.insertBefore($('hv'),doll.children[1]);
  const sum=document.createElement('div');sum.className='kqm-sum';sum.id='kqmSum';doll.after(sum);
  const sp=document.createElement('div');sp.className='kqm-statp kqm-tabhid';sp.id='kqmStatP';right.appendChild(sp);sp.appendChild($('hs'));
  const eqh=right.querySelector('.sec');if(eqh&&/equipped/i.test(eqh.textContent))eqh.classList.add('kqm-tabhid');$('eqrow').classList.add('kqm-tabhid')}
function kqmDoll(){const sl=kqmSlots(),L=['helm','chest','boots','ring2'],Rr=['weapon','offhand','amulet','ring'].filter(k=>sl.includes(k));
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
  const lock=u>=cap,why=lock?'Forge mastery reaches +'+cap+'. Defeat Sovereigns to raise it.':!inTown?'Visit the Blacksmith in Duskhold to upgrade.':hm<c.n?'Not enough '+c.m+'.':gold<c.g?'Not enough gold.':'';
  h+=`<div class="mut" style="font-size:.7rem">Forge mastery: up to +${cap}</div>${why?`<div class="kqm-bad" style="font-size:.72rem">${why}</div>`:''}<button class="pri" data-kqup="1" ${why?'disabled':''}>⚒️ Upgrade to +${u+1}</button>`;
  return h}
function kqmForgeTab(){const E=SLOTS.map(k=>eq[k]).filter(Boolean),G=gear.slice().sort(KQM_SORT.best);
  return `<div class="kqm-forge"><div><div class="kqm-h">Equipped</div><div class="kqm-grid">${E.map(i=>kqmTile(i,'e',{lv:1})).join('')}${kqmEmpty((6-E.length%6)%6)}</div>`+
    `<div class="kqm-h">In your bag</div><div class="kqm-grid">${G.map(i=>kqmTile(i,'g',{lv:1})).join('')}${kqmEmpty(Math.max(12,Math.ceil((G.length+1)/6)*6)-G.length)}</div></div><div class="kqm-fp" id="kqmFP">${kqmForgePanel(kqmForgeItem())}</div></div>`}
// ---------------- the render hook ----------------
var KQM_FORGE=7,KQM_STATS=8,KQM_SMITH=false;
function kqmBag(){kqmBagInit();if(!KQM.ready)return;kqmMarkNew();
  // v117: the Forge tab exists only while the bag was opened at the Blacksmith (KQM_SMITH, set by TWN100_ACT.smith)
  const bt=$('bt');if(!KQM_SMITH&&bagTab2==KQM_FORGE)bagTab2=0;
  if(bt){const fb=bt.querySelector('[data-bt="'+KQM_FORGE+'"]');if(fb&&!KQM_SMITH){fb.remove();bt.querySelectorAll('.on').forEach(x=>x.classList.remove('on'))}
    if(!bt.querySelector('[data-bt="'+KQM_STATS+'"]'))bt.insertAdjacentHTML('beforeend',`<button data-bt="${KQM_STATS}" class="${bagTab2==KQM_STATS?'on':''}">Stats</button>`);
    if(KQM_SMITH&&!bt.querySelector('[data-bt="'+KQM_FORGE+'"]'))bt.querySelector('[data-bt="'+KQM_STATS+'"]').insertAdjacentHTML('beforebegin',`<button data-bt="${KQM_FORGE}" class="${bagTab2==KQM_FORGE?'on':''}" title="Upgrade your gear">⚒️ Forge</button>`)}
  if(bt&&!bt.querySelector('.on')){bagTab2=0;const b=bt.querySelector('[data-bt="0"]');if(b)b.classList.add('on')}
  kqmDoll();const bl=$('bl'),T=bagTab2;
  $('kqmStatP').classList.toggle('kqm-tabhid',T!=KQM_STATS);bl.classList.toggle('kqm-tabhid',T==KQM_STATS);
  if(T==0)bl.innerHTML=kqmGearTab();else if(T==1)bl.innerHTML=kqmMatTab();else if(T==3)bl.innerHTML=kqmSupTab();else if(T==4)bl.innerHTML=kqmEggTab();
  else if(T==KQM_FORGE){bl.innerHTML=kqmForgeTab();$('idt').innerHTML='<span class="mut dtl">⚒️ The Blacksmith upgrades your gear here. Upgrade materials drop in the portal zones; the Trading Post sells the one for your tier. Success chance falls after +5.</span>'}
  else if(T==KQM_STATS)$('idt').innerHTML='<span class="mut dtl">Hover any stat for where it comes from. Gear, attributes, food, elixirs and Sovereign powers all add up here.</span>';
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

