// ================= v223 the Alchemy Table and the Cooking Hearth feel like working at a station =================
// Owner (Nov 12 2026): "Make the alchemy station and cooking station UI more attractive and interactive."
// What changes is only the look and the way you choose: the recipes, what they cost, what they make and the crafting itself are
// the same (the Brew / Cook button calls the old make(k,n), exactly like the old Brew and x5 buttons did).
//  - Two tabs: the station (recipes + the work area) and "Market & stores" (the old right-hand column, moved as it is:
//    ingredients, what you made, the market list and its buy page; their buttons and handlers are unchanged).
//  - Recipes are ledger lines: picture, name, how many you hold, and one chip per ingredient with have / need (green when
//    you have enough, red when not). Category filters at the top, and "Ready only".
//  - The work area (a dark plate, kept dark by the ink pass: class *-view) shows the chosen recipe: a glass flask over an
//    arcane burner at the Alchemy Table (green-violet glass), a pot over a log fire at the hearth (warm fire). The ingredients
//    stand above it with their counts; pick 1 / 5 / Max and press Brew / Cook: the ingredients drop into the vessel, it
//    bubbles / steams / stirs while a bar fills (C223.T ms), then make() runs and what you made pops out with a glow.
//  - Closing the window or leaving the station during the brew cancels it (nothing is spent: make() only runs at the end).
// Each player's own window: nothing is sent in co-op.
var C223={T:1300,st:{},busy:null,rev:null,
  G:{cook:[['Simple meals',['f_meat','f_fish','f_bread','f_soup']],['Hearty meals',['f_stew','f_skewer']],['Treats & feasts',['f_tart','f_cake','f_pie','f_feast']]],
     alch:[['Potions',['p_hp','p_mp']],['Elixirs',['e_might','e_stone','e_swift','e_fort']],['Fusion catalysts',['c_kin','c_asc','c_bind','c_ess']]]},
  col:{p_hp:'#e0445a',p_mp:'#4a7cff',e_might:'#ff8a3a',e_stone:'#9aa4b4',e_swift:'#3ad8c8',e_fort:'#6ad84a',fert:'#a8843a',c_kin:'#ff6ab0',c_asc:'#ff5a3a',c_bind:'#e8e0d0',c_ess:'#c08aff',
    f_meat:'#a0482a',f_fish:'#d8a060',f_bread:'#e0b060',f_soup:'#f09a3a',f_stew:'#9a4a22',f_skewer:'#d0402a',f_tart:'#8a4ad0',f_cake:'#e8b84a',f_pie:'#e08a2a',f_feast:'#c86a30'}};
function c223S(m){return C223.st[m]||(C223.st[m]={sel:null,qty:1,tab:'make',cat:'all',ready:false})}
function c223Esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
// one recipe, whatever list it lives in: {k, n name, i icon, rec, mk makes, d text, min, cf companion food}
function c223Rec(k){const r=FOOD.find(x=>x[0]==k)||ALCH.find(x=>x[0]==k);if(r)return {k,n:r[1],i:r[2],rec:r[3],mk:r[4],d:r[6],min:r[7]};
  try{const c=typeof cf200R=='function'&&cf200R(k);if(c)return {k,n:c[1],i:c[2],rec:c[3],mk:c[4],d:'Heals '+Math.round(c[5]*100)+'% of a companion\'s health at once. Goes in a companion\'s food pouch (P).',cf:1}}catch(_){}return null}
function c223Groups(m){const G=C223.G[m].map(g=>[g[0],g[1].slice()]);try{if(m=='cook'&&typeof CF200!='undefined')G.push(['Companion food',CF200.R.map(r=>r[0])])}catch(_){}return G}
function c223Lk(r){try{return !r.cf&&locked(r.k)}catch(_){return false}}
function c223Max(r){let n=1e9;for(const k in r.rec)n=Math.min(n,Math.floor(cnt(k)/r.rec[k]));return Math.max(0,n)}
function c223Verb(m){return m=='alch'?'Brew':'Cook'}
// ---------------- the recipe list ----------------
function c223Chips(r){return Object.keys(r.rec).map(k=>{const h=cnt(k),nd=r.rec[k];return `<span class="c223-chip ${h>=nd?'ok':'no'}" title="${c223Esc(supNm(k))}: you have ${h}, it needs ${nd}"><i>${supIco(k)}</i><b>${h}</b>/${nd}</span>`}).join('')}
function c223Line(m,r,S){const lk=c223Lk(r),mx=lk?0:c223Max(r),own=cnt(r.k);
  return `<div class="c223-r${S.sel==r.k?' on':''}${lk?' lk':mx>0?' ok':' no'}" role="button" tabindex="0" data-c223r="${r.k}">
    <span class="c223-ri">${lk?'🔒':r.i}</span><span class="c223-rn"><b>${c223Esc(r.n)}</b><small>${lk?'Defeat '+c223Esc(lockBy(r.k))+' to learn it':'have '+own+(r.mk>1?' · makes '+r.mk:'')}</small></span>
    <span class="c223-rc">${lk?'':c223Chips(r)}</span><span class="c223-rs">${lk?'':mx>0?'<em>ready ×'+mx+'</em>':'<small>missing</small>'}</span></div>`}
function c223List(m){const S=c223S(m),G=c223Groups(m);let h='';
  G.forEach(g=>{if(S.cat!='all'&&S.cat!=g[0])return;const rs=g[1].map(c223Rec).filter(Boolean).filter(r=>!S.ready||(!c223Lk(r)&&c223Max(r)>0));if(!rs.length)return;
    h+=`<div class="c223-gh">${c223Esc(g[0])}<small>${rs.filter(r=>!c223Lk(r)&&c223Max(r)>0).length} ready</small></div>`+rs.map(r=>c223Line(m,r,S)).join('')});
  return h||`<div class="c223-none">${S.ready?'Nothing is ready to make. Buy ingredients in the Market tab, or clear "Ready only".':'No recipes here.'}</div>`}
function c223Filters(m){const S=c223S(m),G=c223Groups(m);
  return `<div class="c223-flt">${[['all','All']].concat(G.map(g=>[g[0],g[0]])).map(([k,l])=>`<button data-c223f="${c223Esc(k)}" class="${S.cat==k?'on':''}">${c223Esc(l)}</button>`).join('')}
    <label class="c223-rdy"><input type="checkbox" data-c223ready="1" ${S.ready?'checked':''}> Ready only</label></div>`}
// ---------------- the work area ----------------
function c223Vessel(m){
  if(m=='alch')return `<svg class="c223-svg" viewBox="0 0 200 200" aria-hidden="true">
    <defs><radialGradient id="c223gA" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff" stop-opacity=".32"/><stop offset=".55" stop-color="#b9a0ff" stop-opacity=".07"/><stop offset="1" stop-color="#1a1030" stop-opacity=".35"/></radialGradient>
      <linearGradient id="c223gL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--lq)" stop-opacity=".95"/><stop offset="1" stop-color="var(--lq)" stop-opacity=".55"/></linearGradient>
      <clipPath id="c223cA"><circle cx="100" cy="122" r="46"/></clipPath><radialGradient id="c223gF" cx=".5" cy=".8" r=".6"><stop offset="0" stop-color="#d6c2ff"/><stop offset=".5" stop-color="#7de3b0" stop-opacity=".8"/><stop offset="1" stop-color="#7de3b0" stop-opacity="0"/></radialGradient></defs>
    <g class="c223-rot"><circle cx="100" cy="182" r="40" fill="none" stroke="#7de3b0" stroke-opacity=".35" stroke-dasharray="3 5"/><circle cx="100" cy="182" r="30" fill="none" stroke="#b48cff" stroke-opacity=".4"/></g>
    <path d="M78 196h44l-6-14H84z" fill="#3a3046" stroke="#8a78b0" stroke-width="1"/>
    <g class="c223-flame"><path d="M100 184c-9-6-8-14-2-22 0 6 4 7 5 3 4 6 7 13-3 19z" fill="url(#c223gF)"/></g>
    <path d="M70 164h60" stroke="#8a78b0" stroke-width="2"/>
    <g clip-path="url(#c223cA)"><rect x="40" y="108" width="120" height="70" fill="url(#c223gL)"/>
      <path class="c223-wave" d="M20 110q10-6 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0v8H20z" fill="var(--lq)" opacity=".9"/>
      <g class="c223-bubs" fill="#fff" fill-opacity=".55"><circle class="c223-bub" cx="86" cy="160" r="3"/><circle class="c223-bub b2" cx="104" cy="166" r="2.2"/><circle class="c223-bub b3" cx="116" cy="158" r="2.8"/><circle class="c223-bub b4" cx="95" cy="168" r="1.8"/><circle class="c223-bub b5" cx="110" cy="150" r="1.6"/></g></g>
    <path d="M87 30v48.6A46 46 0 1 0 113 78.6V30" fill="url(#c223gA)" stroke="#cdbdf5" stroke-opacity=".85" stroke-width="2.4"/>
    <path d="M70 108a34 34 0 0 1 16-20" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>
    <rect x="84" y="24" width="32" height="8" rx="2" fill="#5a4a72" stroke="#cdbdf5" stroke-opacity=".7"/>
    <g class="c223-steam" fill="none" stroke="var(--lq)" stroke-width="3" stroke-linecap="round" stroke-opacity=".5"><path class="s1" d="M96 20c-6-6 6-10 0-16"/><path class="s2" d="M106 18c6-6-6-10 0-16"/></g></svg>`;
  return `<svg class="c223-svg" viewBox="0 0 200 200" aria-hidden="true">
    <defs><radialGradient id="c223gG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb35a" stop-opacity=".7"/><stop offset="1" stop-color="#ff6a2a" stop-opacity="0"/></radialGradient>
      <linearGradient id="c223gP" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a1614"/><stop offset=".35" stop-color="#4a423c"/><stop offset=".6" stop-color="#2a2420"/><stop offset="1" stop-color="#121010"/></linearGradient>
      <linearGradient id="c223gY" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff5a1a"/><stop offset=".6" stop-color="#ffb02a"/><stop offset="1" stop-color="#fff0a0"/></linearGradient></defs>
    <ellipse class="c223-glow" cx="100" cy="182" rx="80" ry="24" fill="url(#c223gG)"/>
    <g fill="#4a2c18" stroke="#2a180c"><rect x="56" y="178" width="88" height="10" rx="5" transform="rotate(-8 100 183)"/><rect x="56" y="178" width="88" height="10" rx="5" transform="rotate(8 100 183)"/></g>
    <g class="c223-flame" fill="url(#c223gY)"><path class="f1" d="M80 182c-8-10-4-20 2-28 0 8 6 10 8 4 6 10 4 20-10 24z"/><path class="f2" d="M100 184c-10-12-4-26 4-34 0 10 8 12 9 4 8 12 4 26-13 30z"/><path class="f3" d="M120 182c-8-10-4-20 2-26 0 8 6 8 8 2 6 10 2 20-10 24z"/></g>
    <path d="M38 96h124c-3 46-26 66-62 68-36-2-59-22-62-68z" fill="url(#c223gP)" stroke="#0a0806" stroke-width="2"/>
    <path d="M30 104c-8 0-8 14 2 14M170 104c8 0 8 14-2 14" fill="none" stroke="#2a2420" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="100" cy="96" rx="64" ry="13" fill="#2a2420" stroke="#5a504a" stroke-width="2"/>
    <ellipse cx="100" cy="97" rx="57" ry="9" fill="var(--lq)"/>
    <g class="c223-bubs" fill="#fff" fill-opacity=".4"><circle class="c223-pop1" cx="82" cy="97" r="3"/><circle class="c223-pop1 b2" cx="112" cy="95" r="2.4"/><circle class="c223-pop1 b3" cx="96" cy="99" r="2"/></g>
    <g class="c223-stir"><path d="M126 30l-20 66" stroke="#a87a48" stroke-width="5" stroke-linecap="round"/><path d="M126 30l-20 66" stroke="#d8a868" stroke-width="1.5" stroke-linecap="round" opacity=".6"/></g>
    <g class="c223-steam" fill="none" stroke="#f4ead8" stroke-width="5" stroke-linecap="round" stroke-opacity=".35"><path class="s1" d="M74 84c-8-10 8-16 0-28"/><path class="s2" d="M100 80c8-10-8-16 0-28"/><path class="s3" d="M128 84c-8-10 8-16 0-28"/></g></svg>`}
function c223Bench(m){const S=c223S(m),r=c223Rec(S.sel),V=c223Verb(m);
  if(!r)return `<div class="c223-bench c223-view c223-empty">Choose a recipe from the list.</div>`;
  const lk=c223Lk(r),mx=lk?0:c223Max(r),q=S.qty,n=q=='max'?mx:q,col=C223.col[r.k]||(m=='alch'?'#a77cff':'#b07a4a'),busy=C223.busy&&C223.busy.m==m;
  const ings=Object.keys(r.rec).map((k,j)=>{const h=cnt(k),nd=r.rec[k];return `<span class="c223-ing ${h>=nd?'ok':'no'}" data-c223ing="${j}" title="${c223Esc(supNm(k))}"><i>${supIco(k)}</i><b>${h}/${nd}</b><small>${c223Esc(supNm(k))}</small></span>`}).join('');
  const miss=Object.keys(r.rec).filter(k=>cnt(k)<r.rec[k]).map(k=>(r.rec[k]-cnt(k))+' '+supNm(k));
  const st=lk?'🔒 Defeat '+c223Esc(lockBy(r.k))+' to learn this recipe (J).':mx<1?'Missing '+c223Esc(miss.join(', '))+'. Buy them in the Market tab.':`You can make <b>${mx}</b> batch${mx==1?'':'es'}`+(r.mk>1?` (${r.mk} each)`:'')+'.';
  const qb=[[1,'×1'],[5,'×5'],['max','Max'+(mx>0?' ('+mx+')':'')]].map(([v,l])=>`<button data-c223q="${v}" class="${String(q)==String(v)?'on':''}" ${lk||mx<1?'disabled':''}>${l}</button>`).join('');
  const make=Math.min(n,mx)*r.mk;
  return `<div class="c223-bench c223-view${busy?' c223-busy':''}" style="--lq:${col}">
    <div class="c223-bt"><span class="c223-bi">${r.i}</span><div><b>${c223Esc(r.n)}</b><small>${c223Esc(r.d)}${r.min?' · '+r.min+' min':''}</small></div></div>
    <div class="c223-stage"><div class="c223-ings">${ings}</div>${c223Vessel(m)}<div class="c223-out"></div></div>
    <div class="c223-pb"><i></i></div>
    <div class="c223-q">${qb}</div>
    <button class="pri c223-go" data-c223go="${r.k}" ${lk||mx<1||busy?'disabled':''}>${busy?(m=='alch'?'Brewing…':'Cooking…'):V+(mx>0?' · makes '+make:'')}</button>
    <div class="c223-st">${st}</div></div>`}
// ---------------- building the window (after every older XR.cook / XR.alch has drawn its version) ----------------
function c223Build(m){const B=$('xwB');if(!B)return;const cols=B.querySelector('.xcols');if(!cols)return;const S=c223S(m);
  const all=c223Groups(m).flatMap(g=>g[1]);if(!S.sel||!all.includes(S.sel)){const R=all.map(c223Rec).filter(Boolean);const f=R.find(r=>!c223Lk(r)&&c223Max(r)>0)||R.find(r=>!c223Lk(r))||R[0];S.sel=f&&f.k}
  const right=cols.querySelector(':scope>div:last-child');
  const root=document.createElement('div');root.className='c223 c223-'+m+(S.tab=='shop'?' c223-shopon':'');
  root.innerHTML=`<div class="tabs c223-tabs"><button data-c223t="make" class="${S.tab!='shop'?'on':''}">${m=='alch'?'⚗️ Brewing table':'🔥 Hearth'}</button><button data-c223t="shop" class="${S.tab=='shop'?'on':''}">Market &amp; stores</button></div>
    <div class="c223-make"><div class="c223-left">${c223Filters(m)}<div class="c223-list">${c223List(m)}</div></div><div class="c223-right">${c223Bench(m)}</div></div><div class="c223-shop"></div>`;
  if(right){right.classList.add('c223-mkt');root.querySelector('.c223-shop').appendChild(right)}
  B.innerHTML='';B.appendChild(root);
  if(S.tab=='shop')c223Two(root);
  const v=C223.rev;if(v&&v.m==m&&performance.now()-v.t<2600)c223Pop(v,true)}
function c223Two(root){const r=root.querySelector('.c223-mkt');if(r)r.classList.toggle('lg-two',r.clientWidth>=540)}
['cook','alch'].forEach(m=>{const f=XR[m];if(!f)return;XR[m]=function(){const B=$('xwB'),sc=B?B.scrollTop:0,L=B&&B.querySelector('.c223-list'),ls=L?L.scrollTop:0;const r=f.apply(this,arguments);
  try{c223Build(m);if(B){B.scrollTop=sc;const L2=B.querySelector('.c223-list');if(L2)L2.scrollTop=ls}}catch(e){console.warn('v223 station',e)}return r}});
function c223Root(){return $('xwB')&&$('xwB').querySelector('.c223')}
function c223Redraw(m,what){const R=c223Root();if(!R)return;
  if(what!='bench'){const L=R.querySelector('.c223-list'),s=L.scrollTop;L.innerHTML=c223List(m);L.scrollTop=s;const F=R.querySelector('.c223-flt');if(F)F.outerHTML=c223Filters(m)}
  const b=R.querySelector('.c223-bench');if(b)b.outerHTML=c223Bench(m)}
// the brew: ingredients drop in, the vessel works, then the real make()
function c223Go(m){if(C223.busy)return;const S=c223S(m),r=c223Rec(S.sel);if(!r||c223Lk(r))return;const mx=c223Max(r);if(mx<1)return say('You are missing ingredients.');
  const n=S.qty=='max'?mx:(+S.qty||1),R=c223Root();if(!R)return;
  C223.busy={m,k:r.k,n};C223.rev=null;const b=R.querySelector('.c223-bench'),stg=b.querySelector('.c223-stage'),go=b.querySelector('.c223-go');
  b.classList.add('c223-busy');go.disabled=true;go.textContent=m=='alch'?'Brewing…':'Cooking…';b.querySelectorAll('.c223-q button').forEach(x=>x.disabled=true);
  const out=b.querySelector('.c223-out');if(out)out.innerHTML='';
  try{const sr=stg.getBoundingClientRect();b.querySelectorAll('.c223-ing').forEach((e,j)=>{const er=e.getBoundingClientRect();e.style.setProperty('--tx',(sr.left+sr.width/2-(er.left+er.width/2))+'px');e.style.setProperty('--ty',(sr.top+sr.height*.6-(er.top+er.height/2))+'px');e.style.animationDelay=(j*120)+'ms';e.classList.add('fly')})}catch(_){}
  const pb=b.querySelector('.c223-pb i');if(pb){pb.style.transition='none';pb.style.width='0';void pb.offsetWidth;pb.style.transition='width '+C223.T+'ms linear';pb.style.width='100%'}
  try{sfx('chime')}catch(_){}
  C223.busy.t=setTimeout(()=>{const B=C223.busy;C223.busy=null;if(!B||xwMode!==m||$('xw').classList.contains('hide')){try{if(xwMode===m)rX()}catch(_){}return}
    const n0=cnt(B.k);make(B.k,B.n);const got=cnt(B.k)-n0;
    if(got>0){C223.rev={m,k:B.k,got,t:performance.now()};try{sfx('power')}catch(_){}c223Pop(C223.rev,false)}},C223.T)}
function c223Pop(v,still){const R=c223Root();if(!R)return;const o=R.querySelector('.c223-out'),r=c223Rec(v.k);if(!o||!r)return;
  o.innerHTML=`<div class="c223-res${still?' still':''}"><span class="c223-rays"></span><span class="c223-pi">${r.i}</span><b>+${v.got} ${c223Esc(r.n)}</b><i class="c223-sp s1"></i><i class="c223-sp s2"></i><i class="c223-sp s3"></i><i class="c223-sp s4"></i></div>`;
  clearTimeout(C223.revT);C223.revT=setTimeout(()=>{const R2=c223Root(),x=R2&&R2.querySelector('.c223-res');if(x)x.classList.add('gone')},2400)}
$('xw').addEventListener('click',e=>{const m=xwMode;if(m!='alch'&&m!='cook')return;const R=c223Root();if(!R||!R.contains(e.target))return;const S=c223S(m);
  const t=e.target.closest('[data-c223t],[data-c223f],[data-c223r],[data-c223q],[data-c223go]');if(!t||t.disabled)return;
  if(t.dataset.c223t){S.tab=t.dataset.c223t;R.classList.toggle('c223-shopon',S.tab=='shop');R.querySelectorAll('[data-c223t]').forEach(b=>b.classList.toggle('on',b.dataset.c223t==S.tab));if(S.tab=='shop')c223Two(R);return}
  if(C223.busy)return;
  if(t.dataset.c223f){S.cat=t.dataset.c223f;c223Redraw(m);return}
  if(t.dataset.c223r){S.sel=t.dataset.c223r;R.querySelectorAll('[data-c223r]').forEach(x=>x.classList.toggle('on',x.dataset.c223r==S.sel));C223.rev=null;c223Redraw(m,'bench');
    if(R.querySelector('.c223-make').clientWidth<640){const b=R.querySelector('.c223-bench');if(b&&b.scrollIntoView)b.scrollIntoView({block:'nearest',behavior:'smooth'})}return}
  if(t.dataset.c223q){S.qty=t.dataset.c223q=='max'?'max':+t.dataset.c223q;c223Redraw(m,'bench');return}
  if(t.dataset.c223go){c223Go(m)}});
$('xw').addEventListener('change',e=>{const m=xwMode;if(m!='alch'&&m!='cook')return;const t=e.target.closest('[data-c223ready]');if(!t||C223.busy)return;c223S(m).ready=t.checked;c223Redraw(m)});
$('xw').addEventListener('keydown',e=>{if(xwMode!='alch'&&xwMode!='cook')return;if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target.closest&&e.target.closest('[data-c223r]');if(!t)return;e.preventDefault();t.click()});
document.head.insertAdjacentHTML('beforeend',`<style id="c223css">
html body.kq .c223{--a1:#2f6b4a;--a2:#5a3a9a;container-type:inline-size;container-name:c223}
html body.kq .c223.c223-cook{--a1:#a2451a;--a2:#7a2a10}
html body.kq .win .c223-tabs{margin:0 0 10px}
html body.kq .win .c223-tabs button.on{border-bottom-color:var(--a2)}
html body.kq .c223 .c223-shop{display:none}html body.kq .c223.c223-shopon .c223-shop{display:block}html body.kq .c223.c223-shopon .c223-make{display:none}
html body.kq .c223 .c223-make{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:18px;align-items:start}
html body.kq .c223 .c223-right{position:sticky;top:0}
/* filters */
html body.kq .c223 .c223-flt{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:0 0 8px}
html body.kq .win .c223 .c223-flt button{padding:2px 10px;border-radius:12px;font-size:.86rem;min-height:0;font-style:italic;background:rgba(58,44,28,.05)}
html body.kq .win .c223 .c223-flt button.on{background:var(--a2);border-color:var(--a2);color:#f6ead0;font-style:normal}
html body.kq .c223 .c223-rdy{margin-left:auto;font-size:.86rem;font-style:italic;color:#3a2e20;display:flex;align-items:center;gap:4px;cursor:pointer}
/* the list */
html body.kq .c223 .c223-gh{font-family:'IM Fell English','EB Garamond',Georgia,serif;font-style:italic;color:var(--a2);font-size:1rem;margin:8px 0 2px;border-bottom:1px solid var(--lg-rule,rgba(58,44,28,.5));display:flex;justify-content:space-between;align-items:baseline;font-size-adjust:none}
html body.kq .c223-cook .c223-gh{color:#8a3010}
html body.kq .c223 .c223-gh small{font-size:.78rem;color:#3a6a30;font-style:italic}
html body.kq .c223 .c223-r{display:grid;grid-template-columns:38px minmax(0,1fr) auto;grid-template-areas:'i n s' 'i c c';gap:2px 10px;align-items:center;padding:6px 8px 7px 6px;border-bottom:1px dotted rgba(58,44,28,.38);border-left:3px solid transparent;cursor:pointer;transition:background .12s,transform .12s}
html body.kq .c223 .c223-r:hover{background:rgba(58,44,28,.07);transform:translateX(2px)}
html body.kq .c223 .c223-r.on{background:linear-gradient(90deg,color-mix(in srgb,var(--a2) 18%,transparent),transparent 85%);border-left-color:var(--a2)}
html body.kq .c223 .c223-r.lk{opacity:.62}
html body.kq .c223 .c223-ri{grid-area:i;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:1.25rem;background:radial-gradient(circle at 35% 30%,#3a2e4e,#15101e);box-shadow:0 0 0 2px rgba(125,227,176,.55),0 0 0 3px rgba(58,44,28,.5),inset 0 0 8px rgba(180,140,255,.5);color:#eadfc6}
html body.kq .c223-cook .c223-ri{background:radial-gradient(circle at 35% 30%,#5a3418,#1e120a);box-shadow:0 0 0 2px rgba(255,170,90,.6),0 0 0 3px rgba(58,44,28,.5),inset 0 0 8px rgba(255,120,40,.5)}
html body.kq .c223 .c223-rn{grid-area:n;min-width:0;line-height:1.15}
html body.kq .c223 .c223-rn b{font-size:1.06rem;font-weight:600;color:#2a2118}
html body.kq .c223 .c223-rn small{display:block;font-size:.8rem;font-style:italic;color:#54473a}
html body.kq .c223 .c223-rc{grid-area:c;display:flex;flex-wrap:wrap;gap:3px 5px}
html body.kq .c223 .c223-rs{grid-area:s;text-align:right;font-size:.82rem}
html body.kq .c223 .c223-rs em{color:#2f5e28;font-weight:600;font-style:normal;padding:1px 7px;border:1px solid rgba(47,94,40,.5);border-radius:10px;background:rgba(47,94,40,.08)}
html body.kq .c223 .c223-rs small{color:#8a2a1a;font-style:italic}
html body.kq .c223 .c223-chip{display:inline-flex;align-items:center;gap:3px;font-size:.8rem;padding:0 6px 0 3px;border-radius:9px;border:1px solid rgba(58,44,28,.3);background:rgba(240,228,200,.45);color:#3a2e20;white-space:nowrap}
html body.kq .c223 .c223-chip i{font-style:normal;font-size:.9rem}
html body.kq .c223 .c223-chip.ok b{color:#2f5e28}html body.kq .c223 .c223-chip.no b{color:#9a2a1a}
html body.kq .c223 .c223-chip.no{border-color:rgba(154,42,26,.45);background:rgba(154,42,26,.07)}
html body.kq .c223 .c223-none{padding:14px 6px;font-style:italic;color:#54473a}
/* the work area: a dark plate pasted into the book */
html body.kq .c223 .c223-bench{position:relative;border-radius:4px;padding:12px 14px 14px;color:#efe6d2;display:flex;flex-direction:column;gap:9px;overflow:hidden;
  background:radial-gradient(ellipse at 50% 62%,#2e2546 0%,#171228 58%,#0c0a14 100%);box-shadow:0 0 0 1px #3a2a1a,0 0 0 4px rgba(58,44,28,.15),inset 0 0 0 1px rgba(125,227,176,.28),inset 0 0 46px rgba(120,80,210,.32),0 4px 14px rgba(40,24,10,.45)}
html body.kq .c223-cook .c223-bench{background:radial-gradient(ellipse at 50% 78%,#5a2a12 0%,#26130a 56%,#110905 100%);box-shadow:0 0 0 1px #3a2a1a,0 0 0 4px rgba(58,44,28,.15),inset 0 0 0 1px rgba(255,170,90,.3),inset 0 0 46px rgba(255,110,30,.22),0 4px 14px rgba(40,24,10,.45)}
html body.kq .c223 .c223-bench.c223-empty{min-height:200px;display:grid;place-items:center;font-style:italic;color:#cfc2a6}
html body.kq .c223 .c223-bt{display:flex;gap:10px;align-items:center}
html body.kq .c223 .c223-bi{font-size:1.7rem;width:46px;height:46px;flex:none;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--lq) 45%,transparent),transparent 70%)}
html body.kq .c223 .c223-bt b{display:block;font-family:'IM Fell English','EB Garamond',Georgia,serif;font-weight:400;font-size:1.32rem;color:#f6ecd6;line-height:1.1;font-size-adjust:none}
html body.kq .c223 .c223-bt small{display:block;font-size:.84rem;color:#c9bca0;font-style:italic;line-height:1.25}
html body.kq .c223 .c223-stage{position:relative;height:250px;display:flex;justify-content:center;align-items:flex-end}
html body.kq .c223 .c223-svg{height:200px;width:200px;overflow:visible;filter:drop-shadow(0 6px 10px rgba(0,0,0,.55))}
html body.kq .c223 .c223-ings{position:absolute;left:0;right:0;top:0;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;z-index:2}
html body.kq .c223 .c223-ing{display:flex;flex-direction:column;align-items:center;width:62px;gap:1px}
html body.kq .c223 .c223-ing i{font-style:normal;font-size:1.25rem;width:36px;height:36px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
html body.kq .c223 .c223-ing b{font-size:.84rem;font-weight:600}
html body.kq .c223 .c223-ing.ok b{color:#86efac}html body.kq .c223 .c223-ing.no b{color:#fca5a5}html body.kq .c223 .c223-ing.no i{box-shadow:inset 0 0 0 1px rgba(252,165,165,.6)}
html body.kq .c223 .c223-ing small{font-size:.66rem;color:#c9bca0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:62px}
html body.kq .c223 .c223-ing.fly{animation:c223fly .62s cubic-bezier(.5,0,.8,.6) both}
@keyframes c223fly{0%{transform:none;opacity:1}60%{opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(.25);opacity:0}}
/* vessel motion */
.c223-svg .c223-rot{transform-origin:100px 182px;transform:scaleY(.32) rotate(0);animation:c223rot 14s linear infinite}
@keyframes c223rot{to{transform:scaleY(.32) rotate(360deg)}}
.c223-svg .c223-flame{transform-origin:100px 186px;animation:c223flk .45s ease-in-out infinite alternate}
.c223-svg .c223-flame .f1{transform-origin:84px 184px;animation:c223flk .38s ease-in-out infinite alternate-reverse}
.c223-svg .c223-flame .f3{transform-origin:118px 184px;animation:c223flk .52s ease-in-out infinite alternate}
@keyframes c223flk{from{transform:scale(.92,.86)}to{transform:scale(1.05,1.1)}}
.c223-svg .c223-glow{animation:c223glw 1.6s ease-in-out infinite alternate}@keyframes c223glw{from{opacity:.65}to{opacity:1}}
.c223-svg .c223-wave{animation:c223wav 2.2s linear infinite}@keyframes c223wav{to{transform:translateX(-40px)}}
.c223-svg .c223-bub{animation:c223up 2.6s linear infinite}.c223-svg .b2{animation-delay:-.9s}.c223-svg .b3{animation-delay:-1.7s}.c223-svg .b4{animation-delay:-.4s}.c223-svg .b5{animation-delay:-2.1s}
@keyframes c223up{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(-52px);opacity:0}}
.c223-svg .c223-pop1{transform-box:fill-box;transform-origin:center;animation:c223pp 1.8s ease-in infinite}
@keyframes c223pp{0%,60%{transform:scale(0);opacity:0}80%{transform:scale(1.2);opacity:1}100%{transform:scale(1.5);opacity:0}}
.c223-svg .c223-steam path{animation:c223stm 3s ease-out infinite;opacity:0}.c223-svg .c223-steam .s2{animation-delay:-1s}.c223-svg .c223-steam .s3{animation-delay:-2s}
@keyframes c223stm{0%{transform:translateY(8px);opacity:0}30%{opacity:1}100%{transform:translateY(-22px);opacity:0}}
.c223-svg .c223-stir{transform-origin:106px 96px;animation:c223str 3s ease-in-out infinite alternate}
@keyframes c223str{from{transform:rotate(-7deg)}to{transform:rotate(9deg)}}
.c223-busy .c223-svg .c223-bub{animation-duration:.9s}.c223-busy .c223-svg .c223-pop1{animation-duration:.6s}.c223-busy .c223-svg .c223-steam path{animation-duration:1.1s}
.c223-busy .c223-svg .c223-stir{animation:c223str .32s ease-in-out infinite alternate}.c223-busy .c223-svg .c223-flame{animation-duration:.18s}
.c223-busy .c223-svg .c223-rot{animation-duration:2.5s}.c223-busy .c223-svg{animation:c223shk .16s linear infinite alternate}
@keyframes c223shk{from{transform:translateX(-1px) rotate(-.6deg)}to{transform:translateX(1px) rotate(.6deg)}}
/* progress, quantity, the button */
html body.kq .c223 .c223-pb{height:6px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
html body.kq .c223 .c223-pb i{display:block;height:100%;width:0;background:linear-gradient(90deg,#7de3b0,#b48cff);box-shadow:0 0 8px #b48cff}
html body.kq .c223-cook .c223-pb i{background:linear-gradient(90deg,#ff8a2a,#ffd27a);box-shadow:0 0 8px #ff8a2a}
html body.kq .c223 .c223-q{display:flex;gap:6px;justify-content:center}
html body.kq .win .c223 .c223-q button{flex:1;max-width:120px;padding:5px 8px;font-size:.95rem;color:#efe6d2;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.28);border-radius:3px}
html body.kq .win .c223 .c223-q button:hover:not(:disabled){background:rgba(255,255,255,.14);border-color:#d6c2ff}
html body.kq .win .c223 .c223-q button.on{background:rgba(180,140,255,.3);border-color:#d6c2ff;color:#fff;box-shadow:0 0 10px rgba(180,140,255,.45)}
html body.kq .win .c223-cook .c223-q button.on{background:rgba(255,150,60,.3);border-color:#ffc27a;box-shadow:0 0 10px rgba(255,150,60,.45)}
html body.kq .win .c223 button.c223-go{padding:9px 14px;font-size:1.18rem;letter-spacing:.04em;color:#f8f0ff;border:1px solid #9a7ae0;background:linear-gradient(180deg,#6a4cc0,#352272);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 0 14px rgba(125,227,176,.3)}
html body.kq .win .c223 button.c223-go:hover:not(:disabled){background:linear-gradient(180deg,#7c5ad6,#40298a);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 0 20px rgba(125,227,176,.55)}
html body.kq .win .c223-cook button.c223-go{color:#fff6e8;border-color:#ffb35a;background:linear-gradient(180deg,#d0601e,#86280e);box-shadow:inset 0 1px 0 rgba(255,220,170,.3),0 0 14px rgba(255,140,40,.35)}
html body.kq .win .c223-cook button.c223-go:hover:not(:disabled){background:linear-gradient(180deg,#e2702a,#9a3212)}
html body.kq .c223 .c223-st{font-size:.86rem;text-align:center;color:#d8ccb2;font-style:italic;min-height:1.2em}html body.kq .c223 .c223-st b{color:#86efac}
/* what you made pops out */
html body.kq .c223 .c223-out{position:absolute;inset:0;pointer-events:none;z-index:3;display:grid;place-items:center}
html body.kq .c223 .c223-res{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;animation:c223pop .7s cubic-bezier(.2,1.6,.4,1) both;transition:opacity .6s}
html body.kq .c223 .c223-res.still{animation:none}html body.kq .c223 .c223-res.gone{opacity:0}
@keyframes c223pop{0%{transform:translateY(40px) scale(.2);opacity:0}100%{transform:none;opacity:1}}
html body.kq .c223 .c223-pi{position:relative;font-size:3.1rem;width:86px;height:86px;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--lq) 70%,#fff) 0%,color-mix(in srgb,var(--lq) 40%,transparent) 45%,transparent 72%);filter:drop-shadow(0 0 12px var(--lq))}
html body.kq .c223 .c223-rays{position:absolute;top:-34px;left:50%;width:154px;height:154px;margin-left:-77px;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,240,200,.35) 0 6deg,transparent 6deg 22deg);-webkit-mask:radial-gradient(circle,#000 25%,transparent 70%);mask:radial-gradient(circle,#000 25%,transparent 70%);animation:c223spin 6s linear infinite}
@keyframes c223spin{to{transform:rotate(360deg)}}
html body.kq .c223 .c223-res b{position:relative;font-family:'IM Fell English','EB Garamond',Georgia,serif;font-weight:400;font-size:1.2rem;color:#fff6dc;padding:3px 12px;border-radius:3px;background:rgba(10,8,14,.78);box-shadow:0 0 0 1px color-mix(in srgb,var(--lq) 70%,#fff),0 0 16px var(--lq);font-size-adjust:none}
html body.kq .c223 .c223-sp{position:absolute;top:40px;left:50%;width:6px;height:6px;border-radius:50%;background:#fff6c8;box-shadow:0 0 8px #fff;animation:c223spk 1s ease-out both}
html body.kq .c223 .c223-sp.s1{--sx:-70px;--sy:-40px}html body.kq .c223 .c223-sp.s2{--sx:70px;--sy:-46px}html body.kq .c223 .c223-sp.s3{--sx:-54px;--sy:30px;animation-delay:.1s}html body.kq .c223 .c223-sp.s4{--sx:58px;--sy:26px;animation-delay:.15s}
html body.kq .c223 .c223-res.still .c223-sp{display:none}
@keyframes c223spk{0%{transform:translate(0,0) scale(1.4);opacity:1}100%{transform:translate(var(--sx),var(--sy)) scale(0);opacity:0}}
/* narrow windows and phones: the work area on top, the list under it */
@container c223 (max-width:640px){
  html body.kq .c223 .c223-make{grid-template-columns:minmax(0,1fr);gap:10px}
  html body.kq .c223 .c223-right{position:static;order:-1}
  html body.kq .c223 .c223-stage{height:190px}html body.kq .c223 .c223-svg{width:140px;height:140px}
  html body.kq .c223 .c223-ing{width:54px}html body.kq .c223 .c223-ing i{width:30px;height:30px;font-size:1.05rem}
  html body.kq .c223 .c223-bt small{font-size:.78rem}
  html body.kq .c223 .c223-r{grid-template-columns:34px minmax(0,1fr) auto}html body.kq .c223 .c223-ri{width:32px;height:32px;font-size:1.1rem}
}
@media (prefers-reduced-motion:reduce){.c223-svg *,.c223-svg{animation:none!important}}
</style>`);
