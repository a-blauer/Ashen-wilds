// ================= v116 menus: Kingdom window + Villagers tab, menu clean-up, Fusion inside Companions, forge only at the Blacksmith =================
// Menu list: Fusion and Sovereigns are gone from the ☰ menu (Fusion lives in the Companions window, the Sovereigns list is not needed;
// the sealed-portal prompt still opens the portal list). New "🏰 Kingdom" button (B) opens the kingdom window anywhere:
// Construction (plan + buildings, 1880) | Villagers (vlRender116 below) | Decorations (1910).
// ---------------- the ☰ menu ----------------
['fuseBtn','bossBtn'].forEach(id=>{const b=$(id);if(b)b.style.setProperty('display','none','important')});
{const c=$('cmpBtn');if(c&&!$('kgBtn')){c.insertAdjacentHTML('afterend','<button id="kgBtn">🏰 Kingdom <kbd>B</kbd></button>');$('kgBtn').onclick=()=>{$('sysmenu').classList.add('hide');openKingdom116()}}}
function openKingdom116(tab){if(!$('xw').classList.contains('hide')&&xwMode=='hold'&&!tab)return closeX();if(uiOpen()&&$('xw').classList.contains('hide'))return;
  if(tab)KM103.tab=tab;openX('hold');try{mSfx('open')}catch(_){}}
// B opens / closes the kingdom window; J (the old Sovereigns list) does nothing now
addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();if(k!='b'&&k!='j')return;const a=document.activeElement;if(a&&(a.tagName=='INPUT'||a.tagName=='TEXTAREA'||a.tagName=='SELECT'))return;
  e.stopImmediatePropagation();if(k=='b')openKingdom116()},true);
// ---------------- Companions | Fusion: one window, two tabs ----------------
function cfTabs116(on){const dis=$('fuseBtn')&&$('fuseBtn').disabled;
  return `<div class="tabs cftabs"><button class="${on=='c'?'on':''}" data-cft="c">🐾 Companions &amp; Eggs</button><button class="${on=='f'?'on':''}" data-cft="f" ${dis&&on!='f'?'disabled title="Needs two companions, and no fight going on"':''}>⚗️ Fusion</button></div>`}
function cfPaint116(){[['cmp','c'],['fz','f']].forEach(([id,on])=>{const w=document.querySelector('#'+id+' .wh');if(!w)return;const p=w.parentElement;let t=p.querySelector(':scope>.cftabs');if(t)t.remove();w.insertAdjacentHTML('afterend',cfTabs116(on))})}
var CF116={fromCmp:false};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-cft]');if(!t||t.disabled)return;e.preventDefault();e.stopPropagation();
  if(t.dataset.cft=='f'){if(!$('fz').classList.contains('hide'))return;CF116.fromCmp=true;FSM100_open()}
  else{if(!$('cmp').classList.contains('hide'))return;$('fz').classList.add('hide');openCmp(false)}cfPaint116()},true);
{const f=rC0;rC0=function(){const r=f.apply(this,arguments);try{cfPaint116()}catch(_){}return r}}
{const f=FSM100_open;FSM100_open=function(){const r=f.apply(this,arguments);try{cfPaint116()}catch(_){}return r}}
// the window reads as one menu: closing Fusion after coming from Companions goes back to Companions
{const x=$('fCancel');if(x)x.addEventListener('click',()=>{if(CF116.fromCmp){CF116.fromCmp=false;setTimeout(()=>{try{openCmp(false)}catch(_){}},0)}})}
document.head.insertAdjacentHTML('beforeend',`<style>
.win>.cftabs{display:flex;gap:4px;margin:0;padding:8px 14px 0;flex:none}.win>.cftabs button{white-space:nowrap}
@media (max-width:640px){.win>.cftabs{padding:6px 8px 0}.win>.cftabs button{font-size:.72rem;padding:3px 7px}}
</style>`);
// ---------------- the forge only at the Blacksmith ----------------
// The bag's Forge tab and the item Upgrade button exist only while the bag was opened with F at the Blacksmith (1050, 0140).
{const f=TWN100_ACT.smith;TWN100_ACT.smith=function(){KQM_SMITH=true;return f.apply(this,arguments)}}
new MutationObserver(()=>{if(KQM_SMITH&&$('bag').classList.contains('hide')){KQM_SMITH=false;if(bagTab2==KQM_FORGE)bagTab2=0}}).observe($('bag'),{attributes:true,attributeFilter:['class']});
{const f=doUpgrade;doUpgrade=function(it){if(!KQM_SMITH)return say('⚒️ Visit the Blacksmith in Duskhold to upgrade your gear.');return f.apply(this,arguments)}}
// ---------------- Villagers tab ----------------
var VL116={scrolled:false};
function vlState116(c){if(c.bag)return {k:'ready',l:'🎁 Back with goods',col:'#f0cc72'};if(c.task&&c.t0)return {k:'work',l:'⚒️ On a trip',col:'#6ee7b7'};
  if(c.task&&c.wf==1)return {k:'stuck',l:'🍽️ Needs food',col:'#f87171'};if(c.task&&c.wf==2)return {k:'stuck',l:'🥚 Egg bag full',col:'#f87171'};return {k:'idle',l:'💤 Idle',col:'#b8ad98'}}
function vlPct116(c){const T=czTrip104(c);return c.t0&&T?Math.max(0,Math.min(100,100*(1-czLeft103(c)/T))):0}
function vlCollect116(L){L=L.filter(c=>c.bag);if(!L.length)return;const parts=L.map(c=>c.n+': '+czCollect105(c));
  pickup({ic:'🎁',t:'Goods from '+(L.length>2?L.length+' villagers':L.map(c=>c.n).join(' & ')),col:'#f0cc72',sub:parts.join(' — ').slice(0,160),r:2});say('🏘️ '+parts.join(' — '));sfx('chime');
  try{hsDirty&&hsDirty()}catch(_){}hud();ui();try{czTick103()}catch(_){}try{saveGame(true)}catch(_){}}
function vlRender116(){const C=HS103.cit,fd=czFood105(),S=C.map(vlState116),n=k=>S.filter(s=>s.k==k).length,ready=n('ready');
  const pill=(i,t,col,tip)=>`<span class="vlpill" style="--pc:${col}" title="${tip}">${i} <b>${t}</b></span>`;
  let h=`<div class="vlsum">${pill('🍖',fd+' food',fd?'#d8b46a':'#f87171','Rations in your bag: raw meat, fish, berries and crops are 1, cooked meals 3')}${pill('⚒️',n('work')+' working','#6ee7b7','On a trip now')}${pill('🎁',ready+' ready','#f0cc72','Back with goods to collect')}${pill('💤',n('idle')+' idle','#b8ad98','No job yet')}${n('stuck')?pill('⚠️',n('stuck')+' stuck','#f87171','Waiting for food or a free egg slot'):''}
    <button class="pri" data-vlall="1" ${ready?'':'disabled'}>🎁 Collect all</button></div>
  <div class="vlhow"><span><b>1</b> Choose a trade</span><span><b>2</b> Pick a job</span><span><b>3</b> Carry food — each trip eats some</span><span><b>4</b> Collect the goods</span></div>`;
  if(!C.length)h+='<div class="mut kmnote">Nobody lives in Duskhold yet. Build a house on the 🏗️ Construction tab and two villagers move in.</div>';
  else{if(!bossDone.size)h+='<div class="mut kmnote">Villagers work in zones whose Sovereign you have defeated. Clear Kindlelight first.</div>';
    h+='<div class="vlgrid">'+C.map((c,i)=>{const hs=HS103.h[c.h],ro=czRole104(c),RR=CZR104[ro],rk=czRank105(c),up=czUpCost105(c),busy=!!(c.t0||c.bag),st=S[i],L=czOpts104(c);
      let det='';if(c.bag)det=czGoodsTxt105(c.bag);else if(st.k=='work')det=czTaskTxt104(c)+` · back in <b data-czt="${i}">${kmClock103(czLeft103(c))}</b>`;
      else if(c.task&&c.wf==1)det='Needs '+czCost105(c)+' food ration'+(czCost105(c)>1?'s':'')+' in your bag to set off: '+czTaskTxt104(c);
      else if(c.task&&c.wf==2)det='Your egg bag is full ('+CZ104_EGGMAX+'). Hatch or sell some eggs.';else det=L.length?'Pick a job below.':ro=='fish'?'No job yet: needs a cleared zone with water.':'No job yet: clear a zone first.';
      const trades=Object.keys(CZR104).map(k=>{const R=CZR104[k],cur=k===ro,dis=!cur&&(busy||gold<R.g);
        return `<button class="vltr${cur?' on':''}" data-vltr="${i}:${k}" ${cur||dis?'disabled':''} title="${cur?'Current trade':busy?'Busy: wait until the trip is over':R.d+(R.g?' · training costs 🪙 '+R.g:'')}"><span>${R.i}</span>${R.n}${cur?'':`<small>${R.g?'🪙 '+R.g:'free'}</small>`}</button>`}).join('');
      const jobs=[['','💤 Rest in town',true]].concat(L).map(([v,l,ok])=>{const cur=(c.task||'')===v,lk=!ok,m=/needs rank (\d+)/.exec(l),txt=l.replace(/ · needs rank \d+/,'');
        return `<button class="vljob${cur?' on':''}${lk?' lk':''}" data-vljob="${i}" data-v="${v}" ${cur||lk||busy?'disabled':''} title="${lk?'Needs rank '+(m?m[1]:'')+' — rank up below':busy&&!cur?'Busy: wait until the trip is over':''}">${lk?'🔒 ':''}${txt}${lk&&m?` <small>rank ${m[1]}</small>`:''}</button>`}).join('');
      const ub=up?`<button data-vlrk="${i}" ${gold<up?'disabled':''} title="Rank ${rk+1} can work Tier ${rk+1} zones">⬆ Rank ${rk+1} · 🪙 ${up}</button>`:'<em class="vlmax">Max rank</em>';
      const trip=czTrip104(c)/60000,cost=c.task?czCost105(c):(ro=='gather'?1:null);
      return `<div class="vlc vl-${st.k} kmr-${ro}${KM103.house===c.h?' on':''}" style="--sc:${st.col}" data-vlcard="${i}">
        <div class="vlh"><span class="vli">${RR.i}</span><div class="vln"><b>${c.n}</b><small>${RR.n} · ${hs?hs.nm:''}</small></div><span class="vlrk" title="Rank ${rk} of ${CZ105_RMAX}: works zones up to Tier ${rk}">${'◆'.repeat(rk)}${'◇'.repeat(CZ105_RMAX-rk)}</span></div>
        <div class="vls"><div class="vlsl"><b>${st.l}</b>${c.bag?`<button class="pri" data-vlcol="${i}">Collect</button>`:''}</div><div class="vld">${det}</div>${st.k=='work'?`<div class="vlbar"><i data-vlp="${i}" style="width:${vlPct116(c).toFixed(1)}%"></i></div>`:''}</div>
        <div class="vlsec">Trade</div><div class="vltrs">${trades}</div>
        <div class="vlsec">Job${busy?' <span class="mut">· can change when back home'+(c.bag?' and collected':'')+'</span>':''}</div><div class="vljobs">${jobs}</div>
        <div class="vlft"><span class="mut">⏱ ${trip|0} min trips${cost?' · 🍖 '+cost+' per trip':''}</span>${ub}</div></div>`}).join('')+'</div>'}
  $('xwB').innerHTML=h;
  $('xwF').innerHTML='<span class="mut dtl">Each villager has a trade and a job. Gatherers bring materials, Egg Collectors one egg, Fishermen fish, Hunters gold, parts and gear. A higher rank reaches higher-tier zones. Goods also wait at their house (F).</span>';
  if(KM103.house!=null&&!VL116.scrolled){VL116.scrolled=true;try{const e=$('xwB').querySelector('.vlc.on');if(e)e.scrollIntoView({block:'nearest'})}catch(_){}}}
$('xw').addEventListener('click',e=>{if(xwMode!='hold'||KM103.tab!='vill')return;const t=e.target.closest('[data-vlall],[data-vlcol],[data-vltr],[data-vljob],[data-vlrk]');if(!t||t.disabled)return;const d=t.dataset;
  try{mSfx('tick')}catch(_){}
  if(d.vlall){vlCollect116(HS103.cit.slice());rX();return}
  if(d.vlcol!=null){const c=HS103.cit[+d.vlcol];if(c)vlCollect116([c]);rX();return}
  if(d.vlrk!=null){const c=HS103.cit[+d.vlrk];if(c)czRankUp105(c);rX();return}
  if(d.vltr){const [i,r]=d.vltr.split(':'),c=HS103.cit[+i];if(c)czTrain104(c,r);rX();return}
  if(d.vljob!=null){const c=HS103.cit[+d.vljob];if(!c)return;czTask103(c,d.v);say(d.v?CZR104[czRole104(c)].i+' '+c.n+' sets off: '+czTaskTxt104(c).replace(/<[^>]+>/g,'')+'.':'🧑 '+c.n+' takes it easy in town.');rX()}});
{const x=$('xwClose');if(x)x.addEventListener('click',()=>{VL116.scrolled=false})}
setInterval(()=>{try{if(xwMode!='hold'||KM103.tab!='vill'||$('xw').classList.contains('hide'))return;document.querySelectorAll('#xw [data-vlp]').forEach(b=>{const c=HS103.cit[+b.dataset.vlp];if(c)b.style.width=vlPct116(c).toFixed(1)+'%'})}catch(_){}},1000);
document.head.insertAdjacentHTML('beforeend',`<style>
#xw .vlsum{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:8px}#xw .vlsum .pri{margin-left:auto}
#xw .vlpill{display:inline-flex;gap:4px;align-items:center;padding:3px 10px;border-radius:99px;border:1px solid color-mix(in srgb,var(--pc) 55%,transparent);background:color-mix(in srgb,var(--pc) 14%,transparent);font-size:.78rem}
#xw .vlpill b{color:var(--pc)}
#xw .vlhow{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.74rem;color:var(--mut);margin:0 0 10px;padding:6px 8px;border:1px dashed var(--line);border-radius:6px}
#xw .vlhow b{display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;background:#c9a24a;color:#1a120a;font-size:.68rem;margin-right:3px}
#xw .vlgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}
#xw .vlc{border:1px solid var(--line);border-left:4px solid var(--sc);border-radius:8px;padding:10px;background:rgba(255,255,255,.03);display:flex;flex-direction:column;gap:6px}
#xw .vlc.on{box-shadow:0 0 0 1px #c9a24a inset;background:rgba(201,162,74,.08)}
#xw .vlh{display:flex;align-items:center;gap:8px}#xw .vli{font-size:1.6rem;line-height:1}#xw .vln{flex:1;min-width:0}#xw .vln small{display:block;color:var(--mut);font-size:.72rem}
#xw .vlrk{color:#f0cc72;letter-spacing:1px;font-size:.8rem}
#xw .vls{background:color-mix(in srgb,var(--sc) 10%,rgba(0,0,0,.25));border-radius:6px;padding:6px 8px}
#xw .vlsl{display:flex;align-items:center;justify-content:space-between;gap:6px}#xw .vlsl b{color:var(--sc)}
#xw .vld{font-size:.74rem;color:var(--mut);margin-top:2px;line-height:1.35}#xw .vld b{color:var(--ink)}
#xw .vlbar{height:6px;border-radius:3px;background:rgba(0,0,0,.4);margin-top:5px;overflow:hidden}#xw .vlbar i{display:block;height:100%;background:linear-gradient(90deg,#4a9a6a,#6ee7b7);transition:width .9s linear}
#xw .vlsec{font-size:.66rem;text-transform:uppercase;letter-spacing:.08em;color:var(--mut)}#xw .vlsec .mut{text-transform:none;letter-spacing:0}
#xw .vltrs{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
#xw .vltr{display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 2px!important;font-size:.68rem!important;line-height:1.15}#xw .vltr span{font-size:1.05rem}#xw .vltr small{color:var(--mut);font-size:.62rem}
#xw .vltr.on,#xw .vljob.on{opacity:1!important;border-color:#c9a24a!important;background:rgba(201,162,74,.22)!important;color:#fff3d0!important}
#xw .vljobs{display:flex;flex-wrap:wrap;gap:4px;max-height:132px;overflow:auto}#xw .vljob{font-size:.72rem!important;padding:4px 8px!important;border-radius:99px!important}
#xw .vljob.lk{opacity:.5}#xw .vljob small{color:var(--mut)}
#xw .vlft{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:.72rem;margin-top:2px}#xw .vlmax{color:#6ee7b7;font-size:.74rem}
</style>`);
// ---------------- crossbow: the bolt leaves from the crossbow's front end (v116) ----------------
// The weapon model's stock runs along its local -Y, so the muzzle is the far end of its bounding box on that axis
// (measured once per model in the weapon's own frame, works for every crossbow look).
function xbowMuzzle116(){const W=(pl.gearG||[]).find(o=>o&&o.userData&&o.userData.wt=='crossbow');if(!W)return null;pl.updateMatrixWorld(true);
  let m=W.userData.muz116;if(!m){const inv=new THREE.Matrix4().copy(W.matrixWorld).invert(),B=new THREE.Box3(),v=new THREE.Vector3();
    W.traverse(o=>{if(!o.isMesh||!o.geometry)return;const P=o.geometry.attributes.position;if(!P)return;const M=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(M);B.expandByPoint(v)}});
    if(B.isEmpty())return null;m=W.userData.muz116=new THREE.Vector3((B.min.x+B.max.x)/2,B.min.y+.02,(B.min.z+B.max.z)/2)}
  return W.localToWorld(m.clone())}
// While the player aims (xbowPose from the sight to the recoil) the crossbow is turned in the hand so its barrel lies along the
// aim, level: the v85 pose was tuned on human arms and tilted the crossbow up on the beast rigs. Runs after every other layer.
function xbowLevel116(h){if(h&&h!==pl)return;const A=typeof HA!='undefined'&&HA.cur;if(!A||A.pose!==xbowPose)return;const k=A.k||0;
  const w=k<.14?k/.14:k<.6?1:k<.74?1-(k-.6)/.14:0;if(w<=0)return;
  const W=(pl.gearG||[]).find(o=>o&&o.userData&&o.userData.wt=='crossbow');if(!W||!W.parent)return;pl.updateMatrixWorld(true);
  const Q=THREE.Quaternion,qw=W.getWorldQuaternion(new Q()),b=new THREE.Vector3(0,-1,0).applyQuaternion(qw).normalize(),f=new THREE.Vector3(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y));
  const tq=new Q().setFromUnitVectors(b,f).multiply(qw),out=qw.clone().slerp(tq,w),pq=W.parent.getWorldQuaternion(new Q());
  W.quaternion.copy(pq.invert().multiply(out));W.updateMatrixWorld(true)}
{const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);try{xbowLevel116(h)}catch(_){}return r}}
