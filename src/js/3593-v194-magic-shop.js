// ================= v194: the Magic Shop — ability evolutions, reforging gear stats, wares =================
// Owner (Nov 3 2026): "Lets make spell evolutions only purchasable at the magic shop. Lets make a nice UI in the shop for it and dont
// show the evolution preview in the character skills area anymore- only in the magic shop ui. Lets make rerolling stats on equipment
// (the extra stats like attack speed and crit for example- not base stat values) possible at the magic shop. Make a nice UI for that
// experience as well." Also: "the magic shop ... still says it sells spell scrolls" (fixed: its description).
//
// The Magic Shop opens in the shared #xw window (mode 'magic', MS194.tab):
//   evo     — every ability the hero has learned; a rank 5 one can evolve here (the v137 cost in ability points, still refunded by
//             Reset abilities, plus gold — not refunded). The live preview (v119 ABX stage, EV137.pv) plays the evolved form.
//             The Abilities window no longer offers to evolve or previews the evolution: it says where to go.
//   forge   — reforge a piece's extra stats (it.aff; base stats never change). Reroll: a new random stat (one the piece doesn't
//             have) with a fresh value. Shop level 1: Refine (same stat, new value). Level 2: rerolls offer three stats to choose
//             from (or keep the old one). Level 3: masterwork rolls (values roll in the upper part of the range).
//             Cost: gold (grows with item level, rarity and the piece's earlier reforges, it.rr) + the piece's tier upgrade material.
//   wares   — the old stock (Elixir of Insight, upgrade materials, eggs): the v2/v88 #mst list is lent to the window.
var MS194={tab:'evo',ab:null,it:null,offer:null};
SHOPS.forEach(o=>{if(o.k=='magic')o.d='Evolve your abilities, reforge gear stats, elixirs, materials and eggs'});
function ms194L(){return typeof shpL109=='function'?shpL109('magic'):0}
{const f=openShop;openShop=function(k){if(k=='x'&&shopBuilt('magic')){MS194.offer=null;return openX('magic')}return f.apply(this,arguments)}}
// ---------------- evolutions ----------------
function ms194EvG(s){return shpP109('magic',Math.round(250+30*Math.max(1,hero.lvl|0)))}
function ms194Abil(){const c=hero.cls;return kqsAll(c).filter(s=>kqsUnl(c,s)&&ev137Def(s))}
function ms194Evo(){const L=ms194Abil();if(!L.length)return '<div class="rs194-empty">Learn abilities first (K → Abilities).</div>';
  if(!MS194.ab||!L.some(s=>s.n==MS194.ab)){const d=L.find(s=>kqrRank(s)>=KQR_MAX&&!hero.tal[ev137Key(s.n)])||L[0];MS194.ab=d.n}
  const s=kqsFind(hero.cls,MS194.ab),E=ev137Def(s),on=!!hero.tal[ev137Key(s.n)],r=kqrRank(s),k=ev137Cost(s),g=ms194EvG(s),why=ev137Why(s),ok=!why&&gold>=g;
  const list=L.map(q=>{const ev=!!hero.tal[ev137Key(q.n)],rq=kqrRank(q),rd=!ev&&rq>=KQR_MAX;
    return `<button class="ms194-ab${q.n==MS194.ab?' on':''}${ev?' ev':rd?' rd':''}" data-ms194="ab:${rs194Esc(q.n)}"><span class="ms194-ai">${q.i||'✦'}</span><span class="ms194-an"><b>${rs194Esc(q.n)}</b><small>${ev?'✦ '+rs194Esc(ev137Def(q).en):'Rank '+rq+'/'+KQR_MAX}</small></span><span class="ms194-at">${ev?'✦':rd?'Ready':'◇'.repeat(Math.max(0,KQR_MAX-rq))}</span></button>`}).join('');
  const pips=`<span class="ms194-rk">${[1,2,3,4,5].map(i=>`<i class="${i<=r?'on':''}"></i>`).join('')}</span>`;
  let btn;if(on)btn=`<div class="ms194-done">✦ Evolved. It casts as <b>${rs194Esc(E.en)}</b> now.</div>`;
  else btn=`<div class="rs194-ab"><span class="rs194-cost"><span class="${apFree()>=k?'':'bad'}">${k} ⚡ ability points <small>(${apFree()} free)</small></span><span class="${gold>=g?'':'bad'}">${g.toLocaleString()} 🪙</span></span>
    <button class="pri" data-ms194="evolve" ${ok?'':'disabled'}>${why&&why!='Evolved'?'🔒 '+why:gold<g?'Not enough gold':'✦ Evolve'}</button></div>`;
  return `<div class="ms194-evo"><div class="rs194-col ms194-list"><div class="rs194-gh">Your abilities</div>${list}</div>
    <div class="rs194-col"><div class="ms194-card${on?' on':''}"><div class="ms194-pv"><div class="abpvc" id="ms194PV"></div><div class="ms194-pvl"><span>▶ ${on?'Evolved':'Preview of the evolution'} · <b>✦ ${rs194Esc(E.en)}</b></span><button data-ms194="replay" title="Play it again">↻</button></div></div>
      <div class="ms194-h"><span>${s.i||''} <b>${rs194Esc(s.n)}</b> ${pips}</span><span class="ms194-arr">➜</span><span class="ms194-en">✦ ${rs194Esc(E.en)}</span></div>
      <div class="ms194-d">${E.d}</div><div class="ms194-n">Evolved casts hit and heal 25% harder and get their own look.${r<KQR_MAX?` Raise ${rs194Esc(s.n)} to rank ${KQR_MAX} first (K → Abilities).`:''}</div>${btn}
      <div class="mut dtl" style="margin-top:6px">The ability points come back if you reset your abilities (the evolution is removed then); the gold does not.</div></div></div></div>`}
function ms194PV(){const host=$('ms194PV');if(!host)return;const s=kqsFind(hero.cls,MS194.ab);if(!s)return;EV137.pv=s.n;try{abxShow(host,s)}catch(e){console.warn('v194 preview',e)}}
// the preview stage may run while the Magic Shop is open too
abxWatch=function(){if(!ABX.on||ABX.ctx)return;const x=$('xw');const ok=xwMode=='abil'||(xwMode=='magic'&&MS194.tab=='evo');
  if(!PV.cv||!PV.cv.isConnected||PV.obj!==ABX.root||!x||x.classList.contains('hide')||!ok||(typeof mpLive=='function'&&mpLive())){abxStop();if(xwMode!='abil'&&EV137.pv)EV137.pv=null}};
// the Abilities window: no evolve button and no evolution preview any more, only where to evolve it
ev137Box=function(s){const E=ev137Def(s);if(!E)return '';const on=!!hero.tal[ev137Key(s.n)],r=kqsUnl(hero.cls,s)?kqrRank(s):0;
  if(on)return `<div class="ev137-box on"><div class="ev137-h">✦ Evolved · <b>${E.en}</b></div><div class="ev137-d">${E.d}</div><div class="ev137-n">+25% damage and healing · new look</div></div>`;
  return `<div class="ev137-box lock ms194-hint"><div class="ev137-h">✦ ${r>=KQR_MAX?'Ready to evolve':'Can evolve at rank '+KQR_MAX}</div><div class="ev137-d">Evolutions are bought at the <b>Magic Shop</b> in Duskhold, where you can preview them.</div></div>`};
{const f=ev137Decor;ev137Decor=function(){if(EV137.pv&&xwMode=='abil')EV137.pv=null;return f.apply(this,arguments)}}
// ---------------- reforging ----------------
function ms194Items(){const L=[];SLOTS.forEach(s=>{const it=eq[s];if(it&&(it.aff||[]).length)L.push([it,'Equipped'])});gear.forEach(it=>{if(it&&(it.aff||[]).length)L.push([it,'Bag'])});return L}
function ms194T(it){return Math.max(0,tierOfLv(it.lv||1)-1)}
function ms194Rng(it,k,mw){const A=AFX[k],T=ms194T(it),lo=mw?.95:it.u?.9:.8,hi=1.3,f=x=>A[1]=='n'?Math.round(A[2]*(2+it.lv)*x):+(A[2]*(1+T*.45)*x).toFixed(4);return [f(lo),f(hi),f]}
function ms194Roll(it,k){const mw=ms194L()>=3,[lo,hi,f]=ms194Rng(it,k,mw),a=mw?.95:it.u?.9:.8;return f(a+Math.random()*(1.3-a))}
function ms194Pool(it,keep){const t=itT(it),have=(it.aff||[]).map(a=>a.k);return Object.keys(AFX).filter(k=>!(t.sl=='weapon'&&k=='mp')&&(!have.includes(k)||k==keep))}
function ms194Cost(it,refine){const g=Math.round((40+it.lv*9)*(1+(it.r|0)*.35)*(1+.2*Math.min(10,it.rr|0))*(refine?.6:1)),T=ms194T(it);return {g:shpP109('magic',g),m:[[UPM[T][0],refine?1:1+Math.floor((it.r|0)/2)]]}}
function ms194Fmt(k,v){return AFX[k][1]=='n'?'+'+Math.round(v):'+'+(+(v*100).toFixed(2))+'%'}
function ms194Bar(it,a){const [lo,hi]=ms194Rng(it,a.k,false),q=Math.max(0,Math.min(1,(a.v-lo)/((hi-lo)||1)));return `<span class="ms194-bar" title="Range ${ms194Fmt(a.k,lo)} – ${ms194Fmt(a.k,hi)}"><i style="width:${Math.round(q*100)}%"></i></span><small class="ms194-rg">${ms194Fmt(a.k,lo)} – ${ms194Fmt(a.k,hi)}</small>`}
function ms194Forge(){const L=ms194Items(),Lv=ms194L();if(!L.length)return '<div class="rs194-empty">None of your gear has extra stats to reforge. Uncommon (green) or better pieces have one extra stat per rarity step.</div>';
  if(!MS194.it||!L.some(([it])=>it.id==MS194.it))MS194.it=L[0][0].id;const it=L.find(([q])=>q.id==MS194.it)[0],t=itT(it);
  const list=L.map(([q,w])=>`<button class="rs194-tg${q.id==MS194.it?' on':''}" data-ms194="it:${q.id}" style="--rc:${RAR[q.r][1]}"><span class="rs194-tn"><span style="color:${RAR[q.r][1]}">${icoOf(q)} ${rs194Esc(itName(q))}</span></span><span class="mut" style="font-size:.7rem">${q.aff.length} stat${q.aff.length>1?'s':''}</span><small>${w} · ${SLOTN[itT(q).sl]} · iLvl ${q.lv}${q.rr?' · reforged ×'+q.rr:''}</small></button>`).join('');
  const C=ms194Cost(it,false),CR=ms194Cost(it,true),okC=c=>gold>=c.g&&shHas(c.m),O=MS194.offer&&MS194.offer.id==it.id?MS194.offer:null;
  const base=Object.entries(itStats(Object.assign({},it,{aff:[]}))).map(([k,v])=>`<span>${SNM[k]||k} <b>${fmtS(k,v)}</b></span>`).join('');
  const rows=it.aff.map((a,i)=>{const pend=O&&O.i==i;
    return `<div class="ms194-af${pend?' pend':''}"><div class="ms194-al"><b>${AFX[a.k][0]}</b><span class="ms194-v">${ms194Fmt(a.k,a.v*(1+.033*(it.up||0)))}</span>${ms194Bar(it,a)}</div>
      <div class="ms194-ab2"><button data-ms194="rr:${i}" ${okC(C)&&!O?'':'disabled'} title="A new random stat with a fresh value">🎲 Reroll stat</button>${Lv>=1?`<button data-ms194="rf:${i}" ${okC(CR)&&!O?'':'disabled'} title="Same stat, a fresh value">✧ Refine value</button>`:''}</div>
      ${pend?`<div class="ms194-off"><div class="ms194-oh">Choose the new stat</div>${O.opts.map((o,j)=>`<button class="ms194-oc" data-ms194="pick:${j}"><b>${AFX[o.k][0]}</b><span>${ms194Fmt(o.k,o.v)}</span></button>`).join('')}<button class="ms194-oc keep" data-ms194="keep"><b>Keep ${AFX[a.k][0]}</b><span>${ms194Fmt(a.k,a.v)}</span></button></div>`:''}</div>`}).join('');
  const lv=['Refine (same stat, new value)','Three stats to choose from','Masterwork rolls (upper range)'];
  return `<div class="ms194-forge"><div class="rs194-col rs194-list"><div class="rs194-gh">Your gear</div>${list}</div><div class="rs194-col">
    <div class="ms194-it" style="--rc:${RAR[it.r][1]}"><div class="ms194-ih"><span style="color:${RAR[it.r][1]}">${icoOf(it)} <b>${rs194Esc(itName(it))}</b></span><small>${RAR[it.r][0]} ${SLOTN[t.sl]} · iLvl ${it.lv}${it.up?' · +'+it.up:''}</small></div>
      <div class="ms194-base"><span class="ms194-bl">Base stats (never change)</span>${base}</div>
      <div class="rs194-gh">Extra stats</div>${rows}
      <div class="rs194-ab"><span class="mut" style="font-size:.72rem">Reroll</span>${rs194Cost(C.g,C.m)}${Lv>=1?`<span class="mut" style="font-size:.72rem">· Refine</span>${rs194Cost(CR.g,CR.m)}`:''}</div></div>
    <div class="ms194-lv">${lv.map((u,i)=>`<span class="rs194-un${Lv>i?' on':''}">${Lv>i?'✔ ':'🔒 L'+(i+1)+': '}${u}</span>`).join('')}</div>
    <div class="mut dtl">Each reforge of a piece makes the next one 20% dearer. Upgrades (+1…+10) keep their bonus on the new stat.</div></div></div>`}
function ms194Apply(it){hsDirty();try{if(Object.values(eq).includes(it))hud()}catch(_){}try{ui()}catch(_){}try{saveGame(true)}catch(_){}}
// ---------------- wares (the old list, lent to this window) ----------------
function ms194Park(){const m=$('mst'),home=$('mshop')&&$('mshop').querySelector('.wb');if(m&&home&&!home.contains(m))home.appendChild(m)}
function ms194Wares(){return '<div class="ms194-wares" id="ms194W"></div><div class="mut dtl" style="margin-top:6px">Eggs restock after every Sovereign you defeat.</div>'}
// ---------------- the window ----------------
XR.magic=function(){const B=$('xwB');if(!B)return;ms194Park();$('xwT').textContent='🔮 Magic Shop';$('xwS').textContent='🪙 '+gold.toLocaleString()+' · ⚡ '+apFree()+' ability points';
  const tabs=[['evo','✦ Evolutions'],['forge','⚒️ Reforge'],['wares','🧪 Wares']];
  B.innerHTML=ms194Note()+`<div class="rs194-tabs">${tabs.map(([k,n])=>`<button data-ms194="tab:${k}" class="${MS194.tab==k?'on':''}">${n}</button>`).join('')}</div><div class="rs194-body">${MS194.tab=='evo'?ms194Evo():MS194.tab=='forge'?ms194Forge():ms194Wares()}</div>`;
  $('xwF').innerHTML='<span class="mut dtl">Evolve rank 5 abilities, reforge the extra stats on your gear, and buy elixirs, upgrade materials and eggs.</span>';
  if(MS194.tab=='evo')ms194PV();
  if(MS194.tab=='wares'){const h=$('ms194W'),m=$('mst');if(h&&m){h.appendChild(m);try{rMS()}catch(e){console.warn(e)}}}};
function ms194Note(){const L=ms194L();return `<div class="shpnote${L?' on':''}">🏪 ${L?`<b>Shop level ${L}</b> <span class="shpip">${'◆'.repeat(L)}${'◇'.repeat(3-L)}</span> · <b>${5*L}% off</b> · `:''}Upgrades unlock reforging options and more eggs${L<3?' · upgrade at the Stronghold Steward':''}.</div>`}
{const f=closeX;closeX=function(){const was=xwMode;const r=f.apply(this,arguments);if(was=='magic'){ms194Park();MS194.offer=null;EV137.pv=null}return r}}
function ms194Do(a){const i=a.indexOf(':'),cmd=i<0?a:a.slice(0,i),arg=i<0?'':a.slice(i+1);
  if(cmd=='tab'){MS194.tab=arg;MS194.offer=null}
  else if(cmd=='ab'){MS194.ab=arg}
  else if(cmd=='replay'){try{if(ABX.on)abxCycle(performance.now())}catch(_){}return}
  else if(cmd=='evolve'){const s=kqsFind(hero.cls,MS194.ab);if(!s)return;const g=ms194EvG(s);if(gold<g)return say('Not enough gold.');if(ev137Why(s))return say('🔒 '+s.n+': '+ev137Why(s)+'.');
    try{if(ABX.on)abxStop()}catch(_){}EV137.pv=null;if(ev137Evolve(s.n)){gold-=g;try{hud();saveGame(true)}catch(_){}}}
  else if(cmd=='it'){MS194.it=+arg;MS194.offer=null}
  else if(cmd=='rr'||cmd=='rf'){const it=ms194Items().map(q=>q[0]).find(q=>q.id==MS194.it);if(!it)return;const n=+arg,a=it.aff[n];if(!a)return;const C=ms194Cost(it,cmd=='rf');
    if(gold<C.g||!shHas(C.m))return say('Not enough gold or materials.');shPay(C.g,C.m);it.rr=(it.rr|0)+1;
    if(cmd=='rf'){a.v=ms194Roll(it,a.k);say('✧ Refined: '+AFX[a.k][0]+' '+ms194Fmt(a.k,a.v)+'.')}
    else{const pool=ms194Pool(it).filter(k=>k!=a.k);if(!pool.length)return;
      if(ms194L()>=2){const o=[];const P=pool.slice();while(o.length<3&&P.length){const k=P.splice(R(0,P.length-1),1)[0];o.push({k,v:ms194Roll(it,k)})}MS194.offer={id:it.id,i:n,opts:o}}
      else{const k=pool[R(0,pool.length-1)];it.aff[n]={k,v:ms194Roll(it,k)};say('🎲 Reforged: '+AFX[k][0]+' '+ms194Fmt(k,it.aff[n].v)+'.')}}
    try{sfx('chime')}catch(_){}ms194Apply(it)}
  else if(cmd=='pick'||cmd=='keep'){const O=MS194.offer;const it=O&&ms194Items().map(q=>q[0]).find(q=>q.id==O.id);if(!it){MS194.offer=null;return rX()}
    if(cmd=='pick'){const o=O.opts[+arg];if(o){it.aff[O.i]={k:o.k,v:o.v};say('🎲 Reforged: '+AFX[o.k][0]+' '+ms194Fmt(o.k,o.v)+'.');try{mSfx('rare')}catch(_){}}}MS194.offer=null;ms194Apply(it)}
  rX()}
$('xw').addEventListener('click',e=>{if(xwMode!='magic')return;const t=e.target.closest('[data-ms194]');if(!t||t.disabled)return;e.stopPropagation();try{ms194Do(t.dataset.ms194)}catch(err){console.warn('v194 magic',err)}});
document.head.insertAdjacentHTML('beforeend',`<style>
#xw .ms194-evo,#xw .ms194-forge{display:grid;grid-template-columns:minmax(210px,270px) minmax(0,1fr);gap:12px;align-items:start}
#xw .ms194-ab{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;text-align:left;padding:6px 9px;border-radius:7px;border:1px solid var(--line);background:rgba(0,0,0,.25)}
#xw .ms194-ab.on{border-color:#c9a24a;background:linear-gradient(90deg,rgba(201,162,74,.22),rgba(0,0,0,.2))}#xw .ms194-ab.rd .ms194-at{color:#6ee7b7;font-weight:800}#xw .ms194-ab.ev .ms194-at{color:#f5d0fe}
#xw .ms194-ai{font-size:1.1rem}#xw .ms194-an b{font-size:.8rem;display:block}#xw .ms194-an small{font-size:.68rem;color:var(--mut)}#xw .ms194-ab.ev .ms194-an small{color:#e9c8ff}#xw .ms194-at{font-size:.68rem;color:var(--mut);letter-spacing:1px}
#xw .ms194-card{border:1px solid rgba(201,162,74,.4);border-radius:12px;padding:10px;background:radial-gradient(ellipse at 50% 0%,rgba(201,162,74,.16),transparent 60%),#0e0b09}
#xw .ms194-card.on{border-color:rgba(233,180,255,.55)}
#xw .ms194-pv{border:1px solid var(--line);border-radius:8px;overflow:hidden;background:radial-gradient(ellipse at 50% 35%,#2c2418,#0e0b08 75%)}#xw .ms194-pv .abpvc{height:230px;position:relative}#xw .ms194-pv .abpvc canvas{width:100%!important;height:100%!important;display:block}
#xw .ms194-pvl{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:4px 8px;font-size:.72rem;color:var(--mut);border-top:1px solid var(--line);background:rgba(0,0,0,.3)}#xw .ms194-pvl b{color:#f5d0fe}#xw .ms194-pvl button{padding:1px 8px!important}
#xw .ms194-h{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 2px 4px;font-size:.92rem}#xw .ms194-arr{color:#c9a24a}#xw .ms194-en{color:#f5d0fe;font-weight:800;text-shadow:0 0 10px rgba(233,160,255,.5)}
#xw .ms194-rk{display:inline-flex;gap:3px;margin-left:6px;vertical-align:middle}#xw .ms194-rk i{width:8px;height:8px;border-radius:50%;border:1px solid #8a7a5a;display:block}#xw .ms194-rk i.on{background:#f0cc72;border-color:#f0cc72;box-shadow:0 0 5px #f0cc72}
#xw .ms194-d{font-size:.8rem;line-height:1.45;padding:2px}#xw .ms194-n{font-size:.72rem;color:var(--mut);margin-top:4px}
#xw .ms194-done{margin-top:8px;padding:8px 10px;border-radius:8px;background:rgba(233,160,255,.1);border:1px solid rgba(233,160,255,.35);font-size:.78rem}
#xw .ms194-it{border:1px solid color-mix(in srgb,var(--rc) 50%,transparent);border-radius:12px;padding:10px 12px;background:linear-gradient(180deg,color-mix(in srgb,var(--rc) 10%,transparent),rgba(0,0,0,.3))}
#xw .ms194-ih{display:flex;flex-direction:column}#xw .ms194-ih b{font-size:.95rem}#xw .ms194-ih small{color:var(--mut);font-size:.72rem}
#xw .ms194-base{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:.72rem;color:var(--mut);margin:8px 0 2px;padding:6px 8px;border-radius:7px;background:rgba(0,0,0,.3)}#xw .ms194-base b{color:var(--ink)}#xw .ms194-bl{width:100%;font-size:.64rem;letter-spacing:.08em;text-transform:uppercase;color:#8a7a5a}
#xw .ms194-af{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 10px;align-items:center;padding:8px 9px;margin-top:5px;border-radius:8px;border:1px solid var(--line);background:rgba(0,0,0,.25)}
#xw .ms194-af.pend{border-color:#c9a24a;box-shadow:0 0 12px rgba(201,162,74,.25) inset}
#xw .ms194-al{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;align-items:center;font-size:.8rem}#xw .ms194-v{color:#bfe8a0;font-weight:800}
#xw .ms194-bar{grid-column:1/-1;height:5px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden;display:block}#xw .ms194-bar i{display:block;height:100%;background:linear-gradient(90deg,#8a6a2a,#f0cc72)}
#xw .ms194-rg{grid-column:1/-1;font-size:.64rem;color:var(--mut)}
#xw .ms194-ab2{display:flex;flex-direction:column;gap:4px}#xw .ms194-ab2 button{font-size:.72rem!important;padding:3px 9px!important;white-space:nowrap}
#xw .ms194-off{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px}#xw .ms194-oh{grid-column:1/-1;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:#f0cc72}
#xw .ms194-oc{display:flex;flex-direction:column;align-items:flex-start;padding:7px 9px;border-radius:7px;border:1px solid #c9a24a;background:rgba(201,162,74,.12)}#xw .ms194-oc b{font-size:.76rem}#xw .ms194-oc span{color:#bfe8a0;font-weight:800;font-size:.8rem}
#xw .ms194-oc.keep{border-color:var(--line);background:rgba(0,0,0,.25)}#xw .ms194-oc.keep span{color:var(--mut)}
#xw .ms194-lv{display:flex;flex-direction:column;gap:2px;margin-top:8px;font-size:.72rem}
#xw .ms194-wares #mst{display:block}
#xw .ms194-hint .ev137-d b{color:#f0cc72}
@media (max-width:760px){#xw .ms194-evo,#xw .ms194-forge{grid-template-columns:1fr}}
</style>`);
