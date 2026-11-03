// ================= v194: the Curio Shop (resources instead of gold, Curio of the Hour), shop upgrade features, Sovereign restocks =================
// Owner (Nov 3 2026): "For the curio shop I like the Curio of the hour idea- lets implement that. Lets also make his wares cost resources
// instead of money. Lets also make the shop upgrades unlock new features like you mentioned, and have shops restock after a sovereign
// kill." And the exploit: a tier-5 Curio egg cost 750 gold but sold for 6,000.
//
// Curio Shop (#xw visitor mode, xwArg 'merchant'; the v49/v55/v109 visitor list is skipped for it):
//   wares — a mystery egg, three Health Potions and a random rune, plus one ware per shop level (rune, egg, rune, as in v109), all
//           paid in gathered resources and companion materials (CU194_P). New wares every 20 minutes and after every Sovereign.
//   Curio of the Hour (CU194_POOL) — one rare thing you can't get elsewhere, changing every hour: a Shimmering Egg (always hatches
//           shiny), a Rank II rune, a runed Epic+ weapon or armour piece (two slots, three when it rolls Legendary), an Elixir of
//           Fortune (+25% loot find for 20 minutes) or an Elder Egg (a tier above yours). Shop level 2: a second Curio each hour.
//           Shop level 3: ask the merchant for a different Curio once an hour (10 Crystal Shards).
//   Shop discount: 5% fewer resources per level. Eggs bought here (e.cu) can't be sold back (the old 750 → 6,000 gold loop).
//   The stock is saved (x2Save 'cu194'), so reloading doesn't refill it.
// Sovereign restocks (SR194.n): every Sovereign kill refreshes the Trading Post, the Magic Shop's eggs, the Curio wares and Curios.
// Shop upgrade texts (shpFx109) now name the features each level opens (Magic Shop, Curio Shop, Rune Sanctum).
var SR194={n:0};
var CU194={k:'',hk:'',wares:[],cur:[],ask:'',fam:''};
var CU194_POOL=['shiny','rune2','armament','fortune','elder'];
function cu194L(){return typeof shpL109=='function'?shpL109('merchant'):0}
function cu194T(){return Math.max(1,Math.min(5,tierOfLv(hero.lvl)))}
function cu194Off(ms){const L=cu194L();return ms.map(([k,n])=>[k,Math.max(1,Math.ceil(n*(1-.05*L)))])}
function cu194Fam(seed){return FAM[FAMS[mdHash('f'+seed)%FAMS.length]][0]}
// ---- prices in resources (tier T 1..5) ----
function cu194Price(kind,T,fam){const P={
  egg:[['wood',6+4*T],['fiber',4+3*T],['bone',2+2*T]],pots:[['glowcap',4+T],['petals',3+T]],rune:[['crystal',2+T],['bone',3+2*T]],
  shiny:[['crystal',4+2*T],['glowcap',6+2*T],[fam,2+T]],rune2:[['crystal',6+2*T],['bone',6+3*T],['Ectoplasm',1+T]],
  armament:[['iron',10+5*T],['stone',8+4*T],['crystal',3+T],[UPM[T-1][0],2]],fortune:[['petals',8+2*T],['glowcap',6+2*T],['fiber',6+2*T]],
  elder:[['wood',10+5*T],['fiber',8+4*T],[fam,3+T]]}[kind]||[];return cu194Off(P)}
// ---- the stock ----
function cu194Key(){return Math.floor(Date.now()/(20*60000))+'|'+SR194.n}
function cu194HKey(){return Math.floor(Date.now()/3600000)+'|'+SR194.n}
function cu194Egg(t){const T=Math.max(1,Math.min(5,t));const e=rollEgg(T);e.cu=1;return e}
function cu194Ware(k,T){const L=cu194L(),t=k=='egg'&&T<5&&Math.random()<.12*L?T+1:T;
  if(k=='egg')return {k,t,egg:cu194Egg(t),m:cu194Price('egg',t)};if(k=='pots')return {k,n:3,m:cu194Price('pots',T)};
  return {k:'rune',r:RUNEK[R(0,RUNEK.length-1)],m:cu194Price('rune',T)}}
function cu194Curio(kind,T,seed){const fam=cu194Fam(seed),o={k:kind,m:cu194Price(kind,T,fam)};
  if(kind=='shiny'){o.egg=cu194Egg(T);o.egg.shn=1}
  else if(kind=='elder'){o.egg=cu194Egg(Math.min(5,T+1));if(T>=5)o.egg.pa=Math.max(o.egg.pa||1,1.22)}
  else if(kind=='rune2'){o.r=rn194Key(RN194K[R(0,RN194K.length-1)],2)}
  else if(kind=='armament'){const sl=['weapon','weapon','chest','helm','boots'].concat(hero.cls=='paladin'?['offhand']:[]),l=Math.max(TIERS[T-1][0],Math.min(TIERS[T-1][1],hero.lvl));
    const it=genItem(l,{cls:hero.cls,minR:3,sl:sl[R(0,sl.length-1)]});if(!rn194SlK(it)){it.rs=0}else{it.rs=(it.r|0)>=4?3:2;it.ru=[]}o.it=it}
  return o}
function cu194Stock(){const T=cu194T(),k=cu194Key(),hk=cu194HKey();
  if(CU194.k!==k||!CU194.wares.length){CU194.k=k;const L=['egg','pots','rune'].concat(CUR109.slice(0,cu194L()));CU194.wares=L.map(x=>cu194Ware(x,T))}
  else{const want=3+cu194L();while(CU194.wares.length<want)CU194.wares.push(cu194Ware(CUR109[CU194.wares.length-3]||'rune',T))}
  const nC=cu194L()>=2?2:1;
  if(CU194.hk!==hk||!CU194.cur.length){CU194.hk=hk;CU194.ask='';const h=mdHash('cu'+hk),a=CU194_POOL[h%CU194_POOL.length],b=CU194_POOL[(h+1+(h>>3)%(CU194_POOL.length-1))%CU194_POOL.length];CU194.cur=[cu194Curio(a,T,hk),cu194Curio(b,T,hk+'b')]}
  return {wares:CU194.wares,cur:CU194.cur.slice(0,nC)}}
// ---- what each thing is ----
function cu194Info(o){const sp=e=>e?`Tier ${e.tier+1} egg (${TGI[e.tag]||''} ${e.tag})`:'';
  if(o.k=='egg')return {ic:'🥚',n:'Mystery Tier '+o.t+' Egg',d:'You find out what hatches. Hatches after a minute in your bag.',rc:RAR[Math.min(4,o.t-1)][1]};
  if(o.k=='pots')return {ic:'🧪',n:'3× Health Potion',d:'Each heals 40% of your health.',rc:'#5fcf6a'};
  if(o.k=='rune')return {ic:RUNES[o.r][1],n:rn194Name(o.r),d:rn194Kind(o.r)+': '+rn194Desc(o.r,'h'),rc:'#7a5cff',rune:o.r};
  if(o.k=='shiny')return {ic:'✨',n:'Shimmering Egg',d:'A '+sp(o.egg)+' that always hatches a shiny companion (+10% to every stat, a sparkle, an extra modifier).',rc:'#f5d76e'};
  if(o.k=='elder')return {ic:'🥚',n:'Elder Egg',d:'A '+sp(o.egg)+': a tier above your own'+(o.egg&&o.egg.pa>1.15?', from a strong parent':'')+'.',rc:RAR[Math.min(4,o.egg.tier)][1]};
  if(o.k=='rune2')return {ic:RUNES[o.r][1],n:rn194Name(o.r),d:rn194Kind(o.r)+' (rank II, rare): '+rn194Desc(o.r,'h')+' In a companion: '+rn194Desc(o.r,'c'),rc:'#9a7aff',rune:o.r};
  if(o.k=='armament')return {ic:icoOf(o.it),n:itName(o.it),d:`${RAR[o.it.r][0]} ${SLOTN[itT(o.it).sl]} · iLvl ${o.it.lv} · ${o.it.rs} rune slots. ${itMain(o.it)}`,rc:RAR[o.it.r][1],item:o.it};
  if(o.k=='fortune')return {ic:'🍀',n:'Elixir of Fortune',d:'+25% loot find for 20 minutes.',rc:'#6ee7b7'};
  return {ic:'📦',n:o.k,d:'',rc:'#888'}}
function cu194Give(o){
  if(o.k=='egg'||o.k=='shiny'||o.k=='elder'){eggs.push(o.egg);say('🥚 '+(o.k=='shiny'?'A Shimmering ':'A ')+'Tier '+(o.egg.tier+1)+' '+o.egg.sp+' egg is in your bag. It hatches after a minute.')}
  else if(o.k=='pots'){pots+=3;say('🧪 3 Health Potions bought.')}
  else if(o.k=='rune'||o.k=='rune2'){giveS(o.r,1);say('🔮 '+rn194Name(o.r)+' bought.')}
  else if(o.k=='armament'){gear.push(o.it);say('⚔️ '+itName(o.it)+' is in your bag ('+o.it.rs+' rune slots).')}
  else if(o.k=='fortune'){hero.buffs=hero.buffs.filter(b=>b.n!='Fortune');hero.buffs.push({n:'Fortune',i:'🍀',s:{loot:.25},t:nowP()+20*60000,food:1,d:'+25% loot find'});hsDirty();say('🍀 Fortune smiles on you: +25% loot find for 20 minutes.')}}
// ---- the window ----
function cu194Clock(){const ms=3600000-Date.now()%3600000,m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);return m+':'+String(s).padStart(2,'0')}
function cu194Card(o,i,cur){const I=cu194Info(o),ok=!o.sold&&shHas(o.m);
  return `<div class="cu194-c${cur?' cur':''}${o.sold?' sold':''}" style="--rc:${I.rc}"><div class="cu194-ic">${I.rune?rs194Gem(I.rune,cur):I.ic}</div><div class="cu194-t"><b>${rs194Esc(I.n)}</b><p>${I.d}</p></div>
    <div class="cu194-b">${rs194Cost(0,o.m)}<button class="pri" data-cu194="${cur?'c':'w'}:${i}" ${ok?'':'disabled'}>${o.sold?'Sold':'Trade'}</button></div></div>`}
function cu194Render(){const B=$('xwB');if(!B)return;const S=cu194Stock(),L=cu194L(),hk=cu194HKey();$('xwT').textContent='🧳 Curio Shop';
  const R=['wood','fiber','stone','iron','crystal','glowcap','petals','bone'];$('xwS').innerHTML=R.map(k=>`${RES[k][1]} ${mats[k]||0}`).join(' · ');
  const U=['+1 rune ware','+1 egg ware and a second Curio of the Hour','+1 rune ware and you may ask for another Curio once an hour'];
  let h=`<div class="shpnote${L?' on':''}">🏪 ${L?`<b>Shop level ${L}</b> <span class="shpip">${'◆'.repeat(L)}${'◇'.repeat(3-L)}</span> · <b>${5*L}% fewer resources</b> · `:''}${U.map((u,i)=>`<span class="rs194-un${L>i?' on':''}">${L>i?'✔ ':'🔒 L'+(i+1)+': '}${u}</span>`).join(' · ')}</div>`;
  h+=`<div class="cu194-hh"><span>✦ Curio of the Hour</span><span class="cu194-clk">Next curio in <b id="cu194clk">${cu194Clock()}</b></span></div><div class="cu194-curs n${S.cur.length}">${S.cur.map((o,i)=>cu194Card(o,i,1)).join('')}</div>`;
  if(L>=3)h+=`<div class="cu194-ask">${CU194.ask===hk?'<span class="mut">You already asked for another curio this hour.</span>':`<span class="mut">Not what you need?</span>${rs194Cost(0,[['crystal',10]])}<button data-cu194="ask" ${shHas([['crystal',10]])?'':'disabled'}>🔄 Ask for another curio</button>`}</div>`;
  h+=`<div class="rs194-gh">Wares · new stock every 20 minutes and after every Sovereign</div><div class="cu194-wares">${S.wares.map((o,i)=>cu194Card(o,i,0)).join('')}</div>`;
  B.innerHTML=h;$('xwF').innerHTML='<span class="mut dtl">The Curio Merchant trades for resources and companion materials, not gold. Eggs bought here can\'t be sold back.</span>'}
setInterval(()=>{try{if(xwMode=='visitor'&&xwArg=='merchant'&&!$('xw').classList.contains('hide')){const c=$('cu194clk');if(c)c.textContent=cu194Clock();if(CU194.hk&&CU194.hk!==cu194HKey())rX()}}catch(_){}},1000);
function cu194Do(a){const S=cu194Stock();
  if(a=='ask'){const hk=cu194HKey();if(cu194L()<3||CU194.ask===hk||!shHas([['crystal',10]]))return;shPay(0,[['crystal',10]]);CU194.ask=hk;const T=cu194T(),have=CU194.cur.map(o=>o.k),pool=CU194_POOL.filter(k=>!have.includes(k));
    CU194.cur[0]=cu194Curio(pool[R(0,pool.length-1)]||'rune2',T,hk+'x'+Math.random());say('🧳 "Ah, perhaps this instead…"');rX();return}
  const [t,i]=a.split(':'),o=(t=='c'?S.cur:S.wares)[+i];if(!o||o.sold)return;if(!shHas(o.m))return say('Not enough resources.');
  shPay(0,o.m);o.sold=1;cu194Give(o);try{sfx('chime')}catch(_){}if(t=='c')try{mSfx('rare')}catch(_){}try{hud();ui();saveGame(true)}catch(_){}rX()}
$('xw').addEventListener('click',e=>{if(xwMode!='visitor'||xwArg!='merchant')return;const t=e.target.closest('[data-cu194]');if(!t||t.disabled)return;e.stopPropagation();try{cu194Do(t.dataset.cu194)}catch(err){console.warn('v194 curio',err)}});
{const f=XR.visitor;XR.visitor=function(){if(xwArg=='merchant'){try{return cu194Render()}catch(e){console.warn('v194 curio',e)}}return f.apply(this,arguments)}}
// tooltips on the Curio cards: the item / egg tooltip of the game
// ---- eggs: shiny eggs hatch shiny; Curio eggs can't be sold ----
{const f=hatch;hatch=function(e){const c=f.apply(this,arguments);try{if(c&&e&&e.shn&&!c.shn){c.shn=1;try{rollMod(c)}catch(_){}c._new='shiny'}}catch(_){}return c}}
{const f=sellables;sellables=function(){const L=f.apply(this,arguments);try{return L.filter(x=>{if(x.k[0]!='e')return true;const e=eggs.find(q=>q.id==+x.k.slice(1));return !(e&&e.cu)})}catch(_){return L}}}
{const f=kqmEggTip;kqmEggTip=function(e,o){let h=f.apply(this,arguments);try{if(e&&e.shn)h=h.replace('🥚 Tier','✨ Shimmering Tier')+'<div class="kqm-tx">✨ Always hatches a shiny companion</div>';if(e&&e.cu)h+='<div class="kqm-ts">Bought from the Curio Merchant · can\'t be sold</div>'}catch(_){}return h}}
// ---- saves ----
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.cu194={k:CU194.k,hk:CU194.hk,ask:CU194.ask,w:CU194.wares,c:CU194.cur,n:SR194.n}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.cu194;SR194.n=q&&q.n|0||0;
  if(q&&Array.isArray(q.w)&&Array.isArray(q.c)){CU194.k=String(q.k||'');CU194.hk=String(q.hk||'');CU194.ask=String(q.ask||'');CU194.wares=q.w.filter(o=>o&&o.k);CU194.cur=q.c.filter(o=>o&&o.k)}
  else{CU194.k='';CU194.hk='';CU194.wares=[];CU194.cur=[]}}catch(_){}return r}}
// ---------------- Sovereign restocks ----------------
function sr194Restock(quiet){SR194.n++;try{stock2=null}catch(_){}try{mstock=null}catch(_){}CU194.k='';CU194.hk='';
  if(!quiet)setTimeout(()=>{try{say('🛍️ Word of your victory spreads: the shops of Duskhold have restocked.')}catch(_){}},5200)}
{const f=bossDefeated;bossDefeated=function(e){const r=f.apply(this,arguments);try{sr194Restock()}catch(_){}return r}}
// ---------------- what each shop level opens (Steward rows and the upgrade banner) ----------------
{const f=shpFx109;shpFx109=function(k,l){const off=5*l+'% off';
  if(k=='magic')return (2+l)+' eggs for sale'+(l?' · '+['Refine (reroll a stat\'s value)','three stats to choose from when rerolling','masterwork rolls when reforging'].slice(0,l).join(', '):'')+' · '+off;
  if(k=='merchant')return (3+l)+' wares'+(l>=2?' · a second Curio of the Hour':'')+(l>=3?' · ask for another Curio once an hour':'')+' · '+(5*l)+'% fewer resources';
  if(k=='sage')return (l?['Rank III fusion','Rank II runes for sale','carve a rune slot into gear'].slice(0,l).join(', ')+' · ':'')+off;
  return f.apply(this,arguments)}}
document.head.insertAdjacentHTML('beforeend',`<style>
#xw .cu194-hh{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin:2px 0 6px;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:#f5d76e;font-weight:800}
#xw .cu194-clk{letter-spacing:0;text-transform:none;font-weight:600;color:var(--mut)}#xw .cu194-clk b{color:#f5d76e;font-variant-numeric:tabular-nums}
#xw .cu194-curs{display:grid;gap:10px;grid-template-columns:1fr}#xw .cu194-curs.n2{grid-template-columns:1fr 1fr}
#xw .cu194-wares{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
#xw .cu194-c{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;padding:10px 12px;border-radius:10px;border:1px solid color-mix(in srgb,var(--rc) 45%,var(--line));background:linear-gradient(135deg,color-mix(in srgb,var(--rc) 12%,transparent),rgba(0,0,0,.3) 60%)}
#xw .cu194-c.cur{padding:14px 16px;border-width:1px;border-color:color-mix(in srgb,var(--rc) 70%,transparent);background:radial-gradient(ellipse at 0% 0%,color-mix(in srgb,var(--rc) 28%,transparent),transparent 60%),linear-gradient(180deg,rgba(40,30,12,.6),rgba(0,0,0,.4));box-shadow:0 0 22px color-mix(in srgb,var(--rc) 20%,transparent)}
#xw .cu194-c.sold{opacity:.5;filter:grayscale(.6)}
#xw .cu194-ic{font-size:1.6rem;display:grid;place-items:center;width:46px;height:46px;border-radius:10px;background:rgba(0,0,0,.35);border:1px solid color-mix(in srgb,var(--rc) 40%,transparent)}
#xw .cu194-c.cur .cu194-ic{width:64px;height:64px;font-size:2.3rem;animation:cu194f 3s ease-in-out infinite}
#xw .cu194-t b{font-size:.86rem}#xw .cu194-c.cur .cu194-t b{font-size:1rem;color:#fff2c8}#xw .cu194-t p{margin:3px 0 0;font-size:.72rem;line-height:1.35;color:var(--mut)}
#xw .cu194-b{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px}
#xw .cu194-ask{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin:6px 0 4px;font-size:.74rem}
@keyframes cu194f{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@media (max-width:760px){#xw .cu194-curs.n2{grid-template-columns:1fr}}
</style>`);
