// ================= v100: fusemenu — a guided Fusion window =================
// The old #fz window put every choice on one screen (keep/consume picks in one list, three option cards, catalysts,
// a warning line). This module draws a step-by-step flow inside the same window and leaves the game rules alone:
//   1 Companion  pick the companion to make stronger
//   2 Method     Fuse / Siphon / Consume cards with a plain-English line each and how many partners can be used
//   3 Partner    usable partners first (sorted by what they give), unusable ones greyed with the reason
//   4 Confirm    before → after for every stat (real numbers, grades, green/red changes), what is lost, catalyst,
//                and an explicit button ("Fuse — Ember Foxlet is used up")
//   5 Done       what actually changed
// Rules = the code that already runs (m_fuse / y_rework / zz7_v71 / zzI_v85 / f_mount): the confirm button sets
// sel / fOpt / fStat / fCon / fCat and calls the real $('doF').onclick, so co-op, saves and other wrappers are unchanged.
// Previews use the same helpers (fuseVal, compat, conGainC, ivOf, cStat) on a JSON clone that is swapped into the
// party slot while it is measured (so den/talent bonuses that look at `party` apply the same way).
// The old .wb/.wf stay in the DOM (hidden) because older code and tests still write to #fmsg/#fl and click #doF.
// Globals: FSM100, FSM100_* (functions). localStorage key 'fsm100' only remembers the sort choices.
var FSM100={st:'pick',a:null,act:null,b:null,stat:null,cat:'',sortA:'team',sortB:'best',help:false,res:null,busy:false,poll:0};
try{const o=JSON.parse(localStorage.getItem('fsm100')||'{}');if(o.sa)FSM100.sortA=o.sa;if(o.sb)FSM100.sortB=o.sb}catch(_){}
function FSM100_save(){try{localStorage.setItem('fsm100',JSON.stringify({sa:FSM100.sortA,sb:FSM100.sortB}))}catch(_){}}
var FSM100_SN={hp:'Health',pa:'Phys. Attack',ma:'Magic Attack',pd:'Phys. Defense',md:'Magic Defense'};
var FSM100_ACT={
  std:{i:'⚗️',n:'Fuse',verb:'Fuse',l:'Every level it gains from now on gives more stats.',best:'Best for a companion you will keep levelling.',rule:'same family or Universal'},
  sip:{i:'🧲',n:'Siphon',verb:'Siphon',l:'Copy one better stat grade from the partner (e.g. Phys. Attack D → A).',best:'Best when a spare has a high grade you want.',rule:'same family or Universal'},
  con:{i:'🍽️',n:'Consume',verb:'Consume',l:'A small boost to all five stats.',best:'Best for spare companions of any family.',rule:'any family'}};
var FSM100_STEPS=[['pick','Companion'],['act','Method'],['mate','Partner'],['prev','Confirm']];
function FSM100_esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function FSM100_pc(v){const x=Math.round(v*1000)/10;return (x%1?x.toFixed(1):String(x))+'%'}
function FSM100_g(v){const g=grade(v);return `<b class="fsm-gl" style="--g:${g[2]}">${g[1]}</b>`}
function FSM100_fam(c){const f=famOf(c.g[0]);return {f,i:FAMD[f]?FAMD[f].i:'🐾',t:tierSp(c.g[0])}}
function FSM100_name(c){return FSM100_esc((c.al?'Alpha ':'')+(c.shn?'Shiny ':'')+(c.rv?c.rv+' ':'')+(c.v?c.v+' ':'')+c.n)}
function FSM100_stars(c){const n=Math.floor(c.fp||c.fz||0);return n?(n>5?'★×'+n:'★'.repeat(n)):''}
// portrait: the HUD head render (CPIC). Big pictures (the chosen companions) ask for one; list rows only use one that
// already exists (rendering a model per row would be slow on phones) and show the species icon otherwise.
function FSM100_pic(c,big){let p=null,k='';try{if(typeof cpicKey=='function'){k=cpicKey(c);p=big&&typeof cpic=='function'?cpic(c):(CPIC.cache[k]||null)}}catch(_){}
  const e=S[c.g[0]]?S[c.g[0]].e:em(c);
  return `<span class="fsm-pic${big?' big':''}" data-pk="${p||!big?'':FSM100_esc(k)}">${p?`<img src="${p}" alt="">`:e}</span>`}
function FSM100_picPoll(){clearTimeout(FSM100.poll);if($('fz').classList.contains('hide'))return;let left=0;
  document.querySelectorAll('#fsmB .fsm-pic[data-pk]:not([data-pk=""])').forEach(el=>{const p=CPIC&&CPIC.cache[el.dataset.pk];if(p){el.innerHTML=`<img src="${p}" alt="">`;el.dataset.pk=''}else if(p!=='')left++});
  if(left)FSM100.poll=setTimeout(FSM100_picPoll,350)}
function FSM100_grades(c){ivFix(c);return `<span class="fsm-gs">${IVK.map(k=>{const g=grade(ivOf(c,k));return `<span title="${FSM100_SN[k]}: grade ${g[1]}"><small>${IVS[k]}</small><b style="--g:${g[2]}">${g[1]}</b></span>`}).join('')}</span>`}
function FSM100_tags(c,i){const t=[];if(i<2)t.push(`<span class="fsm-tag act" title="In your active team (slot ${i+1})">Team ${i+1}</span>`);
  if(c.lock)t.push('<span class="fsm-tag lk" title="Locked: it can be improved, but never used up">🔒 Locked</span>');
  if(c.tr=='Universal')t.push('<span class="fsm-tag un" title="Universal: can fuse or siphon with any family">✦ Universal</span>');
  if(c.h<=0)t.push('<span class="fsm-tag dn">Fainted</span>');return t.join('')}
function FSM100_withCat(cat,fn){const f0=fCat;fCat=cat||'';try{return fn()}finally{fCat=f0}}
// measure a clone as if it stood in a's party slot
function FSM100_snap(c,inSlotOf){const o=inSlotOf||c,i=party.indexOf(o);if(i>=0&&c!==o)party[i]=c;
  try{ivFix(c);const st={},iv={};IVK.forEach(k=>{st[k]=Math.round(cStat(c,k));iv[k]=ivOf(c,k)});return {st,iv,ov:ovV(c),gs:c.gs||0,fz:c.fz||0,l:c.l,mods:(c.mods||[]).slice(),tr:c.tr||''}}
  finally{if(i>=0&&c!==o)party[i]=o}}
function FSM100_clone(c){return JSON.parse(JSON.stringify(c))}
// can b be used up to improve a with this action? -> null (same companion) | {ok,why,need,v,gain,tag,k,warn[]}
function FSM100_check(a,b,act){
  if(!a||!b||a===b)return null;ivFix(a);ivFix(b);const i=party.indexOf(b),warn=[];
  if(i<2)warn.push('In your active team');if(b.runes&&b.runes.length)warn.push(b.runes.length+' rune'+(b.runes.length>1?'s':'')+' lost');
  if(b.evo)warn.push('Evolved '+'✦'.repeat(b.evo));if(b.shn)warn.push('Shiny');
  if(b.lock)return {ok:false,why:'Locked. Unlock it in the Companions window to use it up.',warn};
  if(act=='con'){const g=conGainC(b);if(IVK.every(k=>ivOf(a,k)>=1.3))return {ok:false,why:'Wasted: every stat of '+FSM100_esc(a.n)+' is already at the maximum.',warn};
    return {ok:true,gain:g,tag:'+'+FSM100_pc(g*.8)+'–'+FSM100_pc(g*1.2)+' all stats',warn}}
  let need='';if(!FSM100_withCat('',()=>compat(a,b))){if((sup.c_bind||0)>0)need='c_bind';
    else return {ok:false,why:'Different family ('+famOf(b.g[0])+'). Needs a '+famOf(a.g[0])+' or a Universal companion, or Binding Salts.',warn}}
  const v=FSM100_withCat(need,()=>fuseVal(a,b)),pen=tierSp(a.g[0])>tierSp(b.g[0]);
  if(pen)warn.unshift('Lower tier: half strength');if(need)warn.unshift('Uses 🧂 Binding Salts');
  if(act=='std'){const g=.06*v;return {ok:true,need,v,gain:g,tag:'+'+FSM100_pc(g)+' growth',warn}}
  let bk=null,bd=0;IVK.forEach(k=>{const d=ivOf(b,k)-ivOf(a,k);if(d>.001&&d*Math.min(1,v)>bd){bd=d*Math.min(1,v);bk=k}});
  if(!bk)return {ok:false,why:'Nothing to copy: no stat roll is better than '+FSM100_esc(a.n)+'’s.',warn};
  const nv=ivOf(a,bk)+(ivOf(b,bk)-ivOf(a,bk))*Math.min(1,v);
  return {ok:true,need,v,gain:bd,k:bk,tag:IVS[bk]+' '+grade(ivOf(a,bk))[1]+' → '+grade(nv)[1],warn}}
// the outcome of an action, from the same formulas the confirm button runs: {lo,hi} snapshots (equal unless random)
function FSM100_sim(a,b,act,k,cat){
  const f0=fCat;fCat=cat||'';try{ivFix(a);ivFix(b);const lo=FSM100_clone(a),hi=FSM100_clone(a),r={v:0,pen:false};
    if(act=='con'){const g=conGainC(b);r.g=g;IVK.forEach(q=>{const o=ivOf(a,q);lo.iv[q]=Math.min(1.3,o+g*.8);hi.iv[q]=Math.min(1.3,o+g*1.2)});ivSync(lo);ivSync(hi)}
    else{const v=fuseVal(a,b);r.v=v;r.pen=tierSp(a.g[0])>tierSp(b.g[0])&&cat!='c_asc';
      if(act=='std'){lo.gs=hi.gs=(a.gs||0)+.06*v}
      else{const o=ivOf(a,k);lo.iv[k]=hi.iv[k]=o+(ivOf(b,k)-o)*Math.min(1,v);ivSync(lo);ivSync(hi)}
      lo.fz=hi.fz=(a.fz||0)+1;lo.fp=hi.fp=lo.fz;lo.f=hi.f=Math.min(10,lo.fz)}
    r.now=FSM100_snap(a);r.lo=FSM100_snap(lo,a);r.hi=FSM100_snap(hi,a);
    if(act=='std'){const L=typeof MAXLV!='undefined'?MAXLV:50,x0=FSM100_clone(a),x1=FSM100_clone(lo);x0.l=x1.l=L;r.l50=[FSM100_snap(x0,a),FSM100_snap(x1,a),L]}
    return r}finally{fCat=f0}}
function FSM100_valid(){const S=FSM100;if(S.a&&!party.includes(S.a)){S.a=null;S.b=null;if(S.st!='done')S.st='pick'}
  if(S.b&&!party.includes(S.b))S.b=null;if(S.st=='done'&&!S.res)S.st=S.a?'act':'pick';
  if(S.st!='pick'&&S.st!='done'&&!S.a)S.st='pick';if((S.st=='mate'||S.st=='prev')&&!S.act)S.st='act';
  if(S.st=='prev'){const c=FSM100_check(S.a,S.b,S.act);if(!c||!c.ok){S.b=null;S.st='mate'}}}
// ---------------- DOM shell ----------------
function FSM100_init(){const fz=$('fz');if(!fz||$('fsmB'))return;const w=fz.querySelector('.win');if(!w)return;
  const b=document.createElement('div');b.id='fsmB';b.className='wb fsm-b';const f=document.createElement('div');f.id='fsmF';f.className='wf fsm-f';
  const wf=w.querySelector(':scope > .wf');w.insertBefore(b,wf);w.appendChild(f);fz.classList.add('fsm');
  const ws=w.querySelector('.wh .wsub');if(ws)ws.textContent='Make a companion stronger';
  const x=w.querySelector('.wh .x');if(x)x.insertAdjacentHTML('beforebegin','<button class="fsm-hb" data-fsm="help" title="How fusion works">?</button>');
  fz.addEventListener('click',FSM100_click);
  const st=document.createElement('style');st.id='fsmCss';st.textContent=FSM100_CSS;document.head.appendChild(st)}
var FSM100_CSS=`
#fz.fsm .win{width:min(640px,100%);height:min(680px,100%)}
#fz.fsm .win>.wb:not(.fsm-b),#fz.fsm .win>.wf:not(.fsm-f){display:none!important}
#fz .fsm-b{display:flex;flex-direction:column;gap:10px;padding:10px 14px 14px;overflow:auto;-webkit-overflow-scrolling:touch}
#fz .fsm-b>*{flex-shrink:0}
#fz .wh .fsm-hb{width:28px;height:28px;border-radius:50%;padding:0;font:700 .9rem Cinzel,Georgia,serif;color:var(--kq-gold2,#f8dc98);flex:none}
#fz .wh .fsm-hb.on{border-color:var(--kq-gold,#e6bf6a);box-shadow:0 0 8px rgba(230,170,80,.45)}
#fz .fsm-steps{display:flex;gap:4px;counter-reset:fsm}
#fz .fsm-steps button{flex:1 1 0;min-width:0;min-height:30px;padding:3px 4px;font-size:.7rem;color:var(--kq-dim,#7d6d58);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:linear-gradient(180deg,#22180f,#160f09);border-color:#3e2b17}
#fz .fsm-steps button b{display:inline-block;width:16px;height:16px;line-height:16px;border-radius:50%;margin-right:4px;font-size:.62rem;background:#2e2014;color:var(--kq-mut,#a8957a);border:1px solid #5c3d1c}
#fz .fsm-steps button.done{color:var(--kq-ink2,#d8c6a2)}#fz .fsm-steps button.done b{background:#3e5a2a;color:#e6ffd8;border-color:#7aa85a}
#fz .fsm-steps button.on{color:var(--kq-gold2,#f8dc98);border-color:#8a6230;background:linear-gradient(180deg,#5a3e22,#2e2013)}#fz .fsm-steps button.on b{background:var(--kq-gold,#e6bf6a);color:#22160a;border-color:#fbe3a2}
#fz .fsm-q{font:700 .95rem/1.25 Cinzel,Georgia,serif;color:var(--kq-gold2,#f8dc98);letter-spacing:.03em;margin:2px 0 0}
#fz .fsm-sub{color:var(--kq-mut,#a8957a);font-size:.76rem;line-height:1.35;margin-top:-6px}
#fz .fsm-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:.74rem;color:var(--kq-mut,#a8957a)}
#fz .fsm-bar select{margin-left:auto;font-size:.76rem;min-height:30px;max-width:60%}
#fz .fsm-list{display:flex;flex-direction:column;gap:5px}
#fz .fsm-row{display:grid;grid-template-columns:44px minmax(0,1fr) auto;align-items:center;gap:10px;width:100%;text-align:left;padding:6px 10px 6px 6px;min-height:56px;border-radius:4px;font-size:.8rem;line-height:1.25}
#fz .fsm-row:disabled{opacity:1;filter:none;cursor:not-allowed;background:linear-gradient(180deg,#1c140d,#140e09);border-color:#33241a;color:var(--kq-dim,#7d6d58)}
#fz .fsm-row:disabled .fsm-pic{filter:grayscale(1) brightness(.6)}#fz .fsm-row:disabled .fsm-gs{opacity:.55}
#fz .fsm-row .fsm-m{min-width:0;display:flex;flex-direction:column;gap:2px}
#fz .fsm-row .fsm-n{font-weight:700;color:var(--kq-ink,#eee1c4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#fz .fsm-row:disabled .fsm-n{color:var(--kq-mut,#a8957a)}
#fz .fsm-row .fsm-n small{font-weight:400;color:var(--kq-mut,#a8957a);margin-left:4px}
#fz .fsm-row .fsm-d{font-size:.7rem;color:var(--kq-mut,#a8957a);display:flex;flex-wrap:wrap;align-items:center;gap:3px 8px;min-width:0}
#fz .fsm-row .fsm-why{font-size:.7rem;color:#e09a7a;line-height:1.3}
#fz .fsm-row .fsm-w{font-size:.68rem;color:#e0b45a;line-height:1.3}
#fz .fsm-row .fsm-r{display:flex;flex-direction:column;align-items:flex-end;gap:2px;text-align:right;max-width:120px}
#fz .fsm-row .fsm-r small{font-size:.62rem;color:var(--kq-mut,#a8957a);text-transform:uppercase;letter-spacing:.06em}
#fz .fsm-gain{font-weight:700;color:var(--kq-good,#9ad884);font-size:.76rem;white-space:nowrap}
#fz .fsm-big{font:700 1.25rem/1 Cinzel,Georgia,serif}
#fz .fsm-pic{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.35rem;overflow:hidden;flex:none;
  background:radial-gradient(circle at 50% 35%,#4a3826,#1a120b 75%);border:1px solid #8a6230;box-shadow:inset 0 0 0 2px rgba(0,0,0,.5)}
#fz .fsm-pic.big{width:60px;height:60px;font-size:1.8rem}
#fz .fsm-pic img{width:100%;height:100%;object-fit:cover}
#fz .fsm-gs{display:inline-flex;gap:3px;flex-wrap:nowrap}
#fz .fsm-gs span{display:inline-flex;align-items:baseline;gap:1px;padding:0 3px;border-radius:3px;background:rgba(0,0,0,.35);border:1px solid rgba(230,190,110,.12);line-height:1.35}
#fz .fsm-gs small{font-size:.56rem;color:var(--kq-dim,#7d6d58)}#fz .fsm-gs b,#fz b.fsm-gl{color:var(--g);font-weight:800}
#fz .fsm-tag{display:inline-block;font-size:.62rem;padding:0 5px;border-radius:8px;border:1px solid;line-height:1.5;white-space:nowrap;margin-left:4px;vertical-align:1px;font-weight:400}
#fz .fsm-tag.act{color:#e6bf6a;border-color:rgba(230,191,106,.5)}#fz .fsm-tag.lk{color:#d8c6a2;border-color:rgba(216,198,162,.4)}
#fz .fsm-tag.un{color:#bff7ff;border-color:rgba(124,240,255,.55)}#fz .fsm-tag.dn{color:#ff8068;border-color:rgba(255,128,104,.5)}
#fz .fsm-sec{font:700 .68rem Cinzel,Georgia,serif;letter-spacing:.14em;text-transform:uppercase;color:#c9a466;padding:4px 0 3px;background:linear-gradient(90deg,rgba(201,154,69,.55),rgba(201,154,69,.15) 60%,transparent) left bottom/100% 1px no-repeat}
#fz .fsm-sec.bad{color:#c98a6a}
#fz .fsm-tgt{display:grid;grid-template-columns:52px minmax(0,1fr);gap:12px;align-items:center;padding:6px 10px;border:1px solid rgba(230,190,110,.22);border-radius:4px;background:rgba(0,0,0,.25)}
#fz .fsm-tgt .fsm-n{font-weight:700;font-size:.92rem;color:var(--kq-ink,#eee1c4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#fz .fsm-tgt .fsm-d{font-size:.72rem;color:var(--kq-mut,#a8957a);display:flex;flex-wrap:wrap;align-items:center;gap:3px 10px;margin-top:3px}
#fz .fsm-tgt .fsm-pic.big{width:52px;height:52px}
#fz .fsm-acts{display:flex;flex-direction:column;gap:8px}
#fz .fsm-act{display:grid;grid-template-columns:46px minmax(0,1fr);gap:2px 12px;align-items:start;text-align:left;width:100%;padding:8px 12px;border-radius:4px;min-height:62px}
#fz .fsm-act .fsm-bestf{color:var(--kq-mut,#a8957a)}
#fz .fsm-act .fsm-ai{grid-row:1/4;align-self:center;width:46px;height:46px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;background:radial-gradient(circle at 50% 35%,#5a4028,#1e140c 80%);border:1px solid #8a6230}
#fz .fsm-act b.t{font:700 .95rem Cinzel,Georgia,serif;color:var(--kq-gold2,#f8dc98);letter-spacing:.04em}
#fz .fsm-act .l{font-size:.78rem;color:var(--kq-ink,#eee1c4);line-height:1.35}
#fz .fsm-act .n{font-size:.7rem;color:var(--kq-mut,#a8957a);line-height:1.35}
#fz .fsm-act .ok{color:var(--kq-good,#9ad884)}#fz .fsm-act .no{color:#e09a7a}
#fz .fsm-act:disabled{opacity:1;filter:none;cursor:not-allowed;background:linear-gradient(180deg,#1c140d,#140e09);border-color:#33241a}
#fz .fsm-act:disabled .fsm-ai{filter:grayscale(1) brightness(.6)}#fz .fsm-act:disabled b.t,#fz .fsm-act:disabled .l{color:var(--kq-mut,#a8957a)}
#fz .fsm-pair{display:grid;grid-template-columns:minmax(0,1fr) 22px minmax(0,1fr);gap:6px;align-items:stretch}
#fz .fsm-pc{display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;padding:8px 6px;border-radius:4px;border:1px solid rgba(154,216,132,.4);background:linear-gradient(180deg,rgba(60,90,40,.22),rgba(0,0,0,.25));min-width:0}
#fz .fsm-pc.gone{border-color:rgba(255,110,90,.55);background:linear-gradient(180deg,rgba(120,30,20,.3),rgba(0,0,0,.25))}
#fz .fsm-pc .fsm-n{font-weight:700;font-size:.8rem;color:var(--kq-ink,#eee1c4);max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#fz .fsm-pc small{font-size:.68rem;color:var(--kq-mut,#a8957a)}
#fz .fsm-pc .fsm-st{font:700 .62rem Cinzel,Georgia,serif;letter-spacing:.12em;text-transform:uppercase;padding:1px 8px;border-radius:8px;background:rgba(154,216,132,.18);color:#c8f0b0}
#fz .fsm-pc.gone .fsm-st{background:rgba(255,110,90,.2);color:#ffb4a0}#fz .fsm-pc.gone .fsm-pic{filter:grayscale(.7);opacity:.85}
#fz .fsm-arrow{display:flex;align-items:center;justify-content:center;color:var(--kq-gold,#e6bf6a);font-size:1.1rem}
#fz .fsm-chips{display:flex;flex-wrap:wrap;gap:6px}
#fz .fsm-chips button{min-height:36px;padding:4px 10px;font-size:.76rem;border-radius:4px;display:inline-flex;align-items:center;gap:5px}
#fz .fsm-chips button.on{border-color:var(--kq-gold,#e6bf6a);background:linear-gradient(180deg,#6a4a26,#3a2814);color:var(--kq-gold2,#f8dc98);box-shadow:0 0 0 1px #3a240c,0 0 8px rgba(230,170,80,.35)}
#fz .fsm-chips button small{color:var(--kq-mut,#a8957a);font-size:.66rem}
#fz .fsm-t{width:100%;border-collapse:collapse;font-size:.8rem}
#fz .fsm-t th{font:700 .62rem Cinzel,Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:#c9a466;text-align:right;padding:2px 6px 4px;border-bottom:1px solid rgba(230,190,110,.25)}
#fz .fsm-t th:first-child,#fz .fsm-t td:first-child{text-align:left}
#fz .fsm-t td{padding:5px 6px;text-align:right;border-bottom:1px solid rgba(230,190,110,.08);white-space:nowrap;color:var(--kq-ink2,#d8c6a2)}
#fz .fsm-t td:first-child{color:var(--kq-ink,#eee1c4);white-space:normal}
#fz .fsm-t td.aft{color:var(--kq-ink,#eee1c4);font-weight:700}
#fz .fsm-t tr.hl td{background:rgba(230,190,110,.07)}
#fz .fsm-t .up{color:var(--kq-good,#9ad884);font-weight:700}#fz .fsm-t .dn{color:var(--kq-bad,#ff8068);font-weight:700}#fz .fsm-t .eq{color:var(--kq-dim,#7d6d58)}
#fz .fsm-t td small{color:var(--kq-mut,#a8957a);font-size:.66rem}
#fz .fsm-note{font-size:.74rem;line-height:1.4;color:var(--kq-ink2,#d8c6a2);padding:6px 10px;border-left:2px solid rgba(230,190,110,.45);background:rgba(0,0,0,.2)}
#fz .fsm-note.good{border-color:rgba(154,216,132,.6)}
#fz .fsm-loss{border:1px solid rgba(255,110,90,.55);background:linear-gradient(180deg,rgba(110,24,14,.42),rgba(40,10,6,.4));border-radius:4px;padding:8px 12px;font-size:.78rem;line-height:1.4;color:#ffd8cc}
#fz .fsm-loss b.h{display:block;font:700 .82rem Cinzel,Georgia,serif;letter-spacing:.05em;color:#ffb4a0;margin-bottom:3px}
#fz .fsm-loss ul{margin:2px 0 0 18px;padding:0}#fz .fsm-loss li{margin:1px 0}
#fz .fsm-help{font-size:.76rem;line-height:1.45;color:var(--kq-ink2,#d8c6a2);border:1px solid rgba(230,190,110,.3);border-radius:4px;padding:8px 12px;background:rgba(0,0,0,.3)}
#fz .fsm-help dt{font-weight:700;color:var(--kq-gold2,#f8dc98);margin-top:6px}#fz .fsm-help dt:first-child{margin-top:0}#fz .fsm-help dd{margin:1px 0 0}
#fz .fsm-empty{padding:14px;text-align:center;color:var(--kq-mut,#a8957a);font-size:.8rem;border:1px dashed rgba(230,190,110,.25);border-radius:4px}
#fz .fsm-f{gap:8px;flex-wrap:wrap}
#fz .fsm-f .fsm-fh{flex:1 1 140px;min-width:0;font-size:.72rem;color:var(--kq-mut,#a8957a);line-height:1.3}
#fz .fsm-f button{min-height:38px}
#fz .fsm-f button.pri{flex:0 1 auto;max-width:100%;white-space:normal;line-height:1.2;padding:6px 14px}
#fz .fsm-f button.go{background:linear-gradient(180deg,#e88a5a 0%,#b8482a 45%,#7a2412 100%);border-color:#ffb08a;color:#fff4ea;text-shadow:0 1px 0 rgba(0,0,0,.6)}
#fz .fsm-f button.go:hover:not(:disabled){background:linear-gradient(180deg,#f8a070 0%,#cc5a34 45%,#8a2c16 100%)}
@media (max-width:540px){#fz .wh .wsub{display:none}#fz .fsm-b{padding:8px 10px 12px}#fz .fsm-steps button{font-size:.64rem}
  #fz .fsm-row{grid-template-columns:40px minmax(0,1fr) auto;gap:8px;padding:6px 8px 6px 5px}#fz .fsm-row .fsm-pic{width:40px;height:40px}
  #fz .fsm-row .fsm-r{max-width:96px}#fz .fsm-t{font-size:.76rem}#fz .fsm-t td,#fz .fsm-t th{padding-left:4px;padding-right:4px}
  #fz .fsm-f .fsm-fh{display:none}#fz .fsm-f button.pri{flex:1 1 auto}#fz .fsm-gs{gap:2px}#fz .fsm-gs span{padding:0 2px}#fz .fsm-gs small{font-size:.5rem}}
body.mob #fz .fsm-row,body.mob #fz .fsm-act{min-height:58px}body.mob #fz .fsm-chips button{min-height:40px}
`;
// ---------------- rendering ----------------
function FSM100_stepsHTML(){const S=FSM100,ord=FSM100_STEPS.map(s=>s[0]),cur=S.st=='done'?4:ord.indexOf(S.st);
  return `<div class="fsm-steps">${FSM100_STEPS.map(([k,n],i)=>`<button data-fsm="go" data-st="${k}" class="${i==cur?'on':i<cur?'done':''}" ${i<cur&&S.st!='done'?'':'disabled'} title="${i<cur?'Go back to: '+n:n}"><b>${i<cur?'✓':i+1}</b>${n}</button>`).join('')}</div>`}
function FSM100_helpHTML(){return `<dl class="fsm-help">
  <dt>Fuse, Siphon, Consume</dt><dd>All three improve one companion by using up another. The improved companion keeps its level, spells, evolution and talents. The used-up companion is gone for good, with its level, modifiers, talents and socketed runes.</dd>
  <dt>Grades F · E · D · C · B · A · S</dt><dd>Every companion has a hidden roll for each of its five stats, set when it hatches. C is normal; A and S are strong, D–F weak. S and F are rare (about 2% each). A higher grade means more of that stat at every level.</dd>
  <dt>Growth per level</dt><dd>Extra stats each level-up gives. Fuse raises it, with no limit. It counts for every level, so the effect is small at low level and big later.</dd>
  <dt>Stars ★</dt><dd>One per Fuse or Siphon. They show how often a companion was fused and make it a little bigger; they add no stats by themselves.</dd>
  <dt>Tier 1–5</dt><dd>Higher-tier species are stronger. A partner of a lower tier than the companion you improve works at half strength (an Ascendant Tincture removes this).</dd>
  <dt>✦ Universal</dt><dd>A Universal companion can fuse or siphon with any family. If a Universal companion is improved with a partner of another family, it loses the trait.</dd>
  <dt>🔒 Locked</dt><dd>Locked companions can be improved but can never be used up. Lock or unlock them in the Companions window.</dd>
  <dt>Catalysts</dt><dd>Optional potions for Fuse and Siphon, brewed at the Alchemy Table: ${CATS.filter(k=>SUP[k]).map(k=>SUP[k].i+' '+SUP[k].n+' ('+FSM100_esc(String(SUP[k].d).replace(/^Fusion catalyst: /,''))+')').join(', ')}.</dd>
  <dt>Best match first</dt><dd>Partners are sorted by how much they give, then the least valuable one (lowest grade and level) first.</dd></dl>`}
function FSM100_row(c,attrs,right,extra,dis){const i=party.indexOf(c),F=FSM100_fam(c),o=ovG(c);
  return `<button class="fsm-row" ${attrs} ${dis?'disabled':''}>${FSM100_pic(c)}<span class="fsm-m"><span class="fsm-n">${FSM100_name(c)}<small>Lv ${c.l}${FSM100_stars(c)?' '+FSM100_stars(c):''}</small>${FSM100_tags(c,i)}</span>
    <span class="fsm-d"><span title="${F.f} family, tier ${F.t}">${F.i} ${F.f} · T${F.t}</span>${FSM100_grades(c)}</span>${extra||''}</span>
    <span class="fsm-r">${right!=null?right:`<small>Grade</small><span class="fsm-big" style="color:${o[2]}">${o[1]}</span>`}</span></button>`}
function FSM100_pickHTML(){const S=FSM100;let L=party.map((c,i)=>({c,i}));
  const so={team:(x,y)=>x.i-y.i,grade:(x,y)=>ovV(y.c)-ovV(x.c),level:(x,y)=>y.c.l-x.c.l||x.i-y.i,fam:(x,y)=>famOf(x.c.g[0]).localeCompare(famOf(y.c.g[0]))||tierSp(y.c.g[0])-tierSp(x.c.g[0])||x.i-y.i}[S.sortA]||((x,y)=>x.i-y.i);
  L.sort(so);
  return `<div class="fsm-q">Which companion do you want to make stronger?</div><div class="fsm-sub">It keeps its level. In the next steps you choose how, and which other companion is used up for it.</div>
   <div class="fsm-bar"><span>${party.length} companion${party.length==1?'':'s'}</span><select data-fsm="sortA" title="Sort">${[['team','Team order'],['grade','Best grade'],['level','Highest level'],['fam','Family']].map(o=>`<option value="${o[0]}" ${S.sortA==o[0]?'selected':''}>Sort: ${o[1]}</option>`).join('')}</select></div>
   <div class="fsm-list">${L.map(({c,i})=>FSM100_row(c,`data-fsm="a" data-i="${i}"`)).join('')||'<div class="fsm-empty">You have no companions yet.</div>'}</div>`}
function FSM100_tgtHTML(a){const F=FSM100_fam(a),o=ovG(a);
  return `<div class="fsm-tgt">${FSM100_pic(a,true)}<div style="min-width:0"><div class="fsm-n">${FSM100_name(a)} <small style="color:var(--kq-mut)">Lv ${a.l}</small>${FSM100_tags(a,party.indexOf(a))}</div>
   <div class="fsm-d"><span>${F.i} ${F.f} · Tier ${F.t}</span><span>Grade <b style="color:${o[2]}">${o[1]}</b></span><span title="Extra stats per level, raised by Fuse">Growth +${FSM100_pc(a.gs||0)}/level</span>${FSM100_stars(a)?`<span title="Fusions so far">${FSM100_stars(a)}</span>`:''}
${FSM100_grades(a)}</div></div></div>`}
function FSM100_count(a,act){let ok=0,why='';const others=party.filter(c=>c!==a);
  others.forEach(b=>{const r=FSM100_check(a,b,act);if(r&&r.ok)ok++});
  if(!others.length)why='You have no other companion to use.';
  else if(!ok){if(act=='con')why=IVK.every(k=>ivOf(a,k)>=1.3)?'Every stat is already at the maximum.':'Every other companion is locked.';
    else{const fam=others.filter(b=>FSM100_withCat('',()=>compat(a,b)));
      if(!fam.length)why='Needs another '+famOf(a.g[0])+' or a Universal companion.';else if(fam.every(b=>b.lock))why='Every matching partner is locked.';else why='No partner has a better stat roll to copy.'}}
  return {ok,why}}
function FSM100_actHTML(){const a=FSM100.a;
  return FSM100_tgtHTML(a)+`<div class="fsm-q">How do you want to improve it?</div><div class="fsm-acts">${['std','sip','con'].map(k=>{const A=FSM100_ACT[k],n=FSM100_count(a,k);
    return `<button class="fsm-act" data-fsm="act" data-k="${k}" ${n.ok?'':'disabled'}><span class="fsm-ai">${A.i}</span><b class="t">${A.n}</b><span class="l">${A.l} <span class="fsm-bestf">${A.best}</span></span>
      <span class="n">${n.ok?`<span class="ok">✔ ${n.ok} partner${n.ok==1?'':'s'} you can use</span> (${A.rule})`:`<span class="no">✖ ${n.why}</span>`}</span></button>`}).join('')}</div>`}
function FSM100_mateHTML(){const S=FSM100,a=S.a,A=FSM100_ACT[S.act];
  const L=party.filter(c=>c!==a).map(c=>({c,r:FSM100_check(a,c,S.act)})).filter(x=>x.r),ok=L.filter(x=>x.r.ok),no=L.filter(x=>!x.r.ok);
  const val=c=>ovV(c)*10+c.l*.05+(c.evo||0)+((c.runes||[]).length)*.5;
  const so={best:(x,y)=>y.r.gain-x.r.gain||val(x.c)-val(y.c),level:(x,y)=>x.c.l-y.c.l||y.r.gain-x.r.gain,grade:(x,y)=>ovV(x.c)-ovV(y.c),name:(x,y)=>x.c.n.localeCompare(y.c.n)}[S.sortB]||((x,y)=>y.r.gain-x.r.gain);
  ok.sort(so);no.sort((x,y)=>party.indexOf(x.c)-party.indexOf(y.c));
  const lbl={std:'Growth',sip:'Best copy',con:'Each stat'}[S.act];
  const row=(x,dis)=>{const r=x.r,w=r.warn.length?`<span class="fsm-w">⚠ ${r.warn.join(' · ')}</span>`:'';
    return FSM100_row(x.c,`data-fsm="b" data-i="${party.indexOf(x.c)}"`,dis?'':`<small>${lbl}</small><span class="fsm-gain">${r.tag}</span>`,dis?`<span class="fsm-why">✖ ${r.why}</span>`:w,dis)};
  return FSM100_tgtHTML(a)+`<div class="fsm-q">${A.i} ${A.n}: choose the companion to use up</div><div class="fsm-sub">${A.l} The partner you pick is <b>gone for good</b>. You see the exact result before anything happens.</div>
   <div class="fsm-bar"><span>${ok.length} usable${no.length?' · '+no.length+' can’t be used':''}</span><select data-fsm="sortB" title="Sort">${[['best','Best match first'],['level','Lowest level first'],['grade','Lowest grade first'],['name','Name']].map(o=>`<option value="${o[0]}" ${S.sortB==o[0]?'selected':''}>Sort: ${o[1]}</option>`).join('')}</select></div>
   <div class="fsm-list">${ok.map(x=>row(x,false)).join('')||'<div class="fsm-empty">No companion can be used for this right now.</div>'}</div>
   ${no.length?`<div class="fsm-sec bad">Can’t be used (${no.length})</div><div class="fsm-list">${no.map(x=>row(x,true)).join('')}</div>`:''}`}
function FSM100_rng(lo,hi,f){f=f||(x=>x);return lo==hi?f(lo):f(lo)+'–'+f(hi)}
function FSM100_d(d0,d1,f){f=f||(x=>x);const s=x=>(x>0?'+':x<0?'−':'±')+f(Math.abs(x));const c=d1>0?'up':d1<0||d0<0?'dn':'eq';return `<span class="${c}">${d0==d1?s(d0):s(d0)+' to '+s(d1).replace(/^\+/,'+')}</span>`}
function FSM100_table(now,lo,hi,hl){const gL=v=>FSM100_g(v);
  const rows=IVK.map(k=>{const b=now.st[k],x=lo.st[k],y=hi.st[k],g0=grade(now.iv[k])[1],g1=grade(lo.iv[k])[1],g2=grade(hi.iv[k])[1];
    return `<tr class="${hl&&hl.includes(k)?'hl':''}"><td>${FSM100_SN[k]}</td><td>${b} ${gL(now.iv[k])}</td><td class="aft" data-k="${k}" data-lo="${x}" data-hi="${y}">${FSM100_rng(x,y)} ${g1==g2?gL(lo.iv[k]):gL(lo.iv[k])+'–'+gL(hi.iv[k])}</td><td>${FSM100_d(x-b,y-b)}${g1!=g0||g2!=g0?'<br><small>grade '+g0+' → '+(g1==g2?g1:g1+'–'+g2)+'</small>':''}</td></tr>`}).join('');
  const o0=grade(now.ov)[1],o1=grade(lo.ov)[1],o2=grade(hi.ov)[1];
  return `<table class="fsm-t"><thead><tr><th>Stat</th><th>Now</th><th>After</th><th>Change</th></tr></thead><tbody>${rows}
   <tr><td>Overall grade</td><td>${gL(now.ov)}</td><td class="aft">${o1==o2?gL(lo.ov):gL(lo.ov)+'–'+gL(hi.ov)}</td><td>${o1==o0&&o2==o0?'<span class="eq">same</span>':'<span class="up">up</span>'}</td></tr></tbody></table>`}
function FSM100_lossHTML(a,b,act,cat){const it=[],i=party.indexOf(b);
  it.push(`Level ${b.l}${b.evo?', evolution '+'✦'.repeat(b.evo):''}${b.tal&&Object.keys(b.tal).length?', its talents':''}`);
  if((b.mods||[]).length)it.push('Modifiers: '+b.mods.map(m=>(MODS[m]?MODS[m].i+' ':'')+m).join(', ')+(act!='con'?' (one may pass on, see above)':''));
  if(b.runes&&b.runes.length)it.push('Socketed rune'+(b.runes.length>1?'s':'')+': '+b.runes.map(r=>RUNES[r]?RUNES[r][1]+' '+RUNES[r][0]:r).join(', ')+' (lost with it)');
  if(i<2)it.push(`It is in your active team (slot ${i+1}); ${party.length>2?'your next reserve companion takes its place':'your team will have one companion less'}`);
  if(b.tr=='Universal')it.push('Its ✦ Universal trait');
  if(cat&&SUP[cat])it.push(`Also used: 1 × ${SUP[cat].i} ${SUP[cat].n} (you have ${sup[cat]||0})`);
  return `<div class="fsm-loss"><b class="h">⚠ ${FSM100_name(b)} will be used up — gone for good</b>You lose:<ul>${it.map(x=>'<li>'+x+'</li>').join('')}</ul></div>`}
function FSM100_prevHTML(){const S=FSM100,a=S.a,b=S.b,act=S.act,A=FSM100_ACT[act],chk=FSM100_check(a,b,act);
  if(act!='con'){if(chk.need)S.cat='c_bind';else if(S.cat=='c_bind'||(S.cat&&!(sup[S.cat]>0)))S.cat=''}else S.cat='';
  if(act=='sip'){const can=IVK.filter(k=>ivOf(b,k)>ivOf(a,k)+.001);if(!can.includes(S.stat))S.stat=chk.k}
  const r=FSM100_sim(a,b,act,S.stat,S.cat),fa=FSM100_fam(a),fb=FSM100_fam(b);let h='';
  h+=`<div class="fsm-pair"><div class="fsm-pc">${FSM100_pic(a,true)}<span class="fsm-n">${FSM100_name(a)}</span><small>Lv ${a.l} · ${fa.i} ${fa.f} T${fa.t}</small><span class="fsm-st">Improved</span></div>
    <div class="fsm-arrow">◀</div><div class="fsm-pc gone">${FSM100_pic(b,true)}<span class="fsm-n">${FSM100_name(b)}</span><small>Lv ${b.l} · ${fb.i} ${fb.f} T${fb.t}</small><span class="fsm-st">Used up</span></div></div>`;
  if(act=='sip'){const mt=FAMD[fa.f]&&FAMD[fa.f].mt=='m'?'ma':'pa';
    h+=`<div class="fsm-sec">Stat to copy</div><div class="fsm-chips">${IVK.map(k=>{const o=ivOf(a,k),t=ivOf(b,k),can=t>o+.001,nv=o+(t-o)*Math.min(1,r.v);
      return `<button data-fsm="stat" data-k="${k}" class="${S.stat==k?'on':''}" ${can?'':'disabled'} title="${can?FSM100_SN[k]+': '+grade(o)[1]+' → '+grade(nv)[1]:FSM100_esc(b.n)+'’s '+FSM100_SN[k]+' is not better'}">${FSM100_SN[k]} ${FSM100_g(o)}${can?' → '+FSM100_g(nv):''}${k==mt?' <small>main attack</small>':''}</button>`}).join('')}</div>`}
  if(act!='con'){const own=CATS.filter(k=>(sup[k]||0)>0);
    if(chk.need)h+=`<div class="fsm-note">🧂 <b>Binding Salts</b> are needed: ${FSM100_esc(b.n)} is a different family (${fb.f}). One will be used.</div>`;
    else if(own.some(k=>k!='c_bind'))h+=`<div class="fsm-sec">Catalyst (optional)</div><div class="fsm-chips"><button data-fsm="cat" data-k="" class="${!S.cat?'on':''}">None</button>${own.filter(k=>k!='c_bind').map(k=>{const dis=false;
      return `<button data-fsm="cat" data-k="${k}" class="${S.cat==k?'on':''}" ${dis?'disabled':''} title="${FSM100_esc(dis?'Not needed: they are the same family':SUP[k].d)}">${SUP[k].i} ${SUP[k].n} <small>×${sup[k]}${dis?' · not needed':''}</small></button>`}).join('')}</div>`}
  h+=`<div class="fsm-sec">Result for ${FSM100_name(a)}</div>`;
  h+=FSM100_table(r.now,r.lo,r.hi,act=='sip'?[S.stat]:act=='con'?IVK:null);
  const notes=[];
  if(act=='std'){const L=r.l50,dd=IVK.map(k=>L[1].st[k]-L[0].st[k]);
    notes.push(`<b>Growth per level: +${FSM100_pc(r.now.gs)} → <span style="color:var(--kq-good)">+${FSM100_pc(r.lo.gs)}</span></b> (no limit). ${a.l<=1?'At level 1 nothing changes yet; ':'The table shows it at level '+a.l+'; '}the gain grows with every level. At level ${L[2]}: ${IVK.map((k,i)=>FSM100_SN[k]+' +'+dd[i]).join(', ')}.`)}
  if(act=='sip')notes.push(`Copies ${r.v>=1?'all':Math.round(Math.min(1,r.v)*100)+'%'} of the gap between the two ${FSM100_SN[S.stat]} rolls.`);
  if(act=='con')notes.push(`Every stat roll goes up by about +${FSM100_pc(r.g*.8)} to +${FSM100_pc(r.g*1.2)} (random in that range). Bigger gains come from higher-tier, higher-level and evolved partners. Also heals ${FSM100_esc(a.n)} by 10% of its health.`);
  if(act!='con'){if(r.pen)notes.push(`Half strength: ${FSM100_esc(b.n)} is a lower tier (T${fb.t}) than ${FSM100_esc(a.n)} (T${fa.t}).${(sup.c_asc||0)>0?' An Ascendant Tincture removes this.':''}`);
    notes.push(`Stars ${FSM100_stars(a)||'none'} → ${'★'.repeat(Math.min(5,r.lo.fz))}${r.lo.fz>5?'×'+r.lo.fz:''} · keeps level ${a.l} · fully healed.`);
    const inh=(b.mods||[]).filter(m=>!(a.mods||[]).includes(m));
    if(inh.length)notes.push((a.mods||[]).length>=5?`No modifier can pass on: ${FSM100_esc(a.n)} already has 5.`:`<b>${S.cat=='c_ess'?'Certain':'35% chance'}</b> to inherit one of: ${inh.map(m=>MODS[m].i+' '+m+(MODS[m].d?' <small>('+FSM100_esc(MODS[m].d)+')</small>':'')).join(', ')}.${inh.some(m=>MODS[m].s)?' Not counted in the table.':''}`);
    if(a.tr=='Universal'&&famOf(a.g[0])!=famOf(b.g[0]))notes.push(`<span style="color:var(--kq-bad)">${FSM100_esc(a.n)} loses its ✦ Universal trait</span> (partner of another family).`)}
  h+=notes.map(n=>`<div class="fsm-note${act=='std'&&n.startsWith('<b>Growth')?' good':''}">${n}</div>`).join('');
  h+=FSM100_lossHTML(a,b,act,S.cat);
  return h}
function FSM100_doneHTML(){const S=FSM100,R=S.res,a=S.a;if(!R)return '';const A=FSM100_ACT[R.act];
  let h=`<div class="fsm-q">✔ ${A.n} complete</div><div class="fsm-sub">${FSM100_esc(R.bn)} was used up.</div>`;
  h+=a?FSM100_tgtHTML(a):'';h+=FSM100_table(R.b0,R.b1,R.b1,null);
  const n=[];if(R.act=='std')n.push(`Growth per level +${FSM100_pc(R.b0.gs)} → +${FSM100_pc(R.b1.gs)}.`);
  const nm2=R.b1.mods.filter(m=>!R.b0.mods.includes(m));if(R.act!='con')n.push(nm2.length?`Inherited modifier: ${nm2.map(m=>MODS[m].i+' '+m).join(', ')}!`:R.inh?'No modifier passed on this time.':'');
  if(R.b0.tr=='Universal'&&R.b1.tr!='Universal')n.push('It lost its ✦ Universal trait.');
  h+=n.filter(Boolean).map(x=>`<div class="fsm-note good">${x}</div>`).join('');return h}
function FSM100_footHTML(){const S=FSM100;let L='',M='',P='';
  if(S.st=='pick'){M='Tap a companion to continue.';L='<button data-fsm="close">Close</button>'}
  else if(S.st=='act'){L='<button data-fsm="back">↩ Back</button>';M='Pick a method. Nothing happens until you confirm.'}
  else if(S.st=='mate'){L='<button data-fsm="back">↩ Back</button>';M='Unusable companions are greyed out with the reason.'}
  else if(S.st=='prev'){const A=FSM100_ACT[S.act],bn=FSM100_name(S.b);L='<button data-fsm="back">↩ Back</button>';
    P=`<button class="pri go" id="fsmGo" data-fsm="confirm">${A.i} ${S.act=='sip'?'Siphon '+FSM100_SN[S.stat]:A.verb} — ${bn} is used up</button>`}
  else if(S.st=='done'){L='<button data-fsm="close">Close</button>';P=(S.a?`<button data-fsm="again">Improve ${FSM100_name(S.a)} again</button>`:'')+'<button class="pri" data-fsm="restart">Choose another</button>'}
  return `${L}<span class="fsm-fh">${M}</span>${P}`}
function FSM100_render(){FSM100_init();const B=$('fsmB'),F=$('fsmF');if(!B||!F||FSM100.busy)return;
  try{FSM100_valid();const S=FSM100,keep=B.dataset.st==S.st+'|'+(S.act||'')?B.scrollTop:0;
    let h=FSM100_stepsHTML();if(S.help)h+=FSM100_helpHTML();
    h+=S.st=='pick'?FSM100_pickHTML():S.st=='act'?FSM100_actHTML():S.st=='mate'?FSM100_mateHTML():S.st=='prev'?FSM100_prevHTML():FSM100_doneHTML();
    B.innerHTML=h;F.innerHTML=FSM100_footHTML();B.dataset.st=S.st+'|'+(S.act||'');B.scrollTop=keep;
    const hb=document.querySelector('#fz .fsm-hb');if(hb)hb.classList.toggle('on',S.help);FSM100_picPoll()}
  catch(err){console.warn('fusemenu',err);B.innerHTML='<div class="fsm-empty">Something went wrong drawing this window.</div>'}}
// ---------------- actions ----------------
function FSM100_go(st){FSM100.st=st;if(st=='pick'){FSM100.act=null;FSM100.b=null}if(st=='act')FSM100.b=null;FSM100_render();const B=$('fsmB');if(B)B.scrollTop=0}
function FSM100_back(){const S=FSM100;FSM100_go(S.st=='prev'?'mate':S.st=='mate'?'act':'pick')}
function FSM100_confirm(){const S=FSM100,a=S.a,b=S.b,act=S.act;const c=FSM100_check(a,b,act);if(!c||!c.ok)return FSM100_render();
  const b0=FSM100_snap(a),bn=b.n,inh=(b.mods||[]).some(m=>!(a.mods||[]).includes(m))&&(a.mods||[]).length<5;
  S.busy=true;try{if(act=='con'){sel=[party.indexOf(a)];fOpt='con';fCon=b}else{sel=[party.indexOf(a),party.indexOf(b)];fOpt=act;if(act=='sip')fStat=S.stat;fCat=S.cat||''}
    $('doF').onclick.call($('doF'))}finally{S.busy=false;if(act!='con')fCat=''}
  if(party.includes(b)){FSM100_render();return}   // refused by the game (say() explains)
  S.res={act,bn,b0,b1:FSM100_snap(a),inh};S.b=null;S.st='done';$('fz').classList.remove('hide');FSM100_render();const B=$('fsmB');if(B)B.scrollTop=0;
  try{if(typeof sfx=='function'&&act!='con')sfx('chime')}catch(_){}}
function FSM100_click(e){const t=e.target.closest('[data-fsm]');if(!t||!$('fz').contains(t))return;const S=FSM100,k=t.dataset.fsm;
  if(t.tagName=='SELECT')return;e.stopPropagation();if(t.disabled)return;
  if(k=='help'){S.help=!S.help;FSM100_render();if(S.help){const B=$('fsmB');if(B)B.scrollTop=0}return}
  if(k=='close'){$('fz').classList.add('hide');return}
  if(k=='back')return FSM100_back();
  if(k=='go')return FSM100_go(t.dataset.st);
  if(k=='a'){S.a=party[+t.dataset.i]||null;S.act=null;S.b=null;return FSM100_go('act')}
  if(k=='act'){S.act=t.dataset.k;S.b=null;return FSM100_go('mate')}
  if(k=='b'){S.b=party[+t.dataset.i]||null;S.stat=null;S.cat=(S.cat&&sup[S.cat]>0&&S.cat!='c_bind')?S.cat:'';return FSM100_go('prev')}
  if(k=='stat'){S.stat=t.dataset.k;return FSM100_render()}
  if(k=='cat'){S.cat=t.dataset.k||'';return FSM100_render()}
  if(k=='confirm')return FSM100_confirm();
  if(k=='again'){S.res=null;return FSM100_go('act')}
  if(k=='restart'){S.res=null;S.a=null;return FSM100_go('pick')}}
function FSM100_open(c){FSM100.st=c?'act':'pick';FSM100.a=c||null;FSM100.act=null;FSM100.b=null;FSM100.res=null;FSM100.cat='';
  ['cmp','inc'].forEach(i=>{const w=$(i);if(w)w.classList.add('hide')});held=null;sel=[];rF();$('fz').classList.remove('hide');FSM100_render()}
// ---------------- hooks ----------------
FSM100_init();
{const f=rF;rF=function(){const r=f.apply(this,arguments);try{FSM100_render()}catch(err){console.warn('fusemenu',err)}return r}}
{const f=$('fuseBtn').onclick;$('fuseBtn').onclick=function(){FSM100.st='pick';FSM100.a=null;FSM100.act=null;FSM100.b=null;FSM100.res=null;FSM100.cat='';return f.apply(this,arguments)}}
$('fz').addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.tagName!='SELECT')return;
  if(t.dataset.fsm=='sortA'){FSM100.sortA=t.value;FSM100_save();FSM100_render()}else if(t.dataset.fsm=='sortB'){FSM100.sortB=t.value;FSM100_save();FSM100_render()}});
// Backspace goes one step back (Esc still closes the window, like every other window)
addEventListener('keydown',e=>{if(e.key!='Backspace'||$('fz').classList.contains('hide'))return;const t=e.target;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'||t.tagName=='SELECT'))return;
  if(FSM100.st!='pick'&&FSM100.st!='done'){e.preventDefault();e.stopImmediatePropagation();FSM100_back()}},true);
// Companions window: an "Improve" button next to Make lead / Set as 2nd opens this window on the shown companion
{const f=rC0;rC0=function(){const r=f.apply(this,arguments);try{const c=party[cmpSel],bt=document.querySelector('#cd .btns');
  if(c&&bt&&!bt.querySelector('#fsmImp')&&party.length>1)bt.insertAdjacentHTML('beforeend','<button id="fsmImp" title="Fuse, Siphon or Consume to make this companion stronger">⚗️ Improve</button>')}catch(_){}return r}}
$('cd').addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#fsmImp')){e.stopImmediatePropagation();const c=party[cmpSel];if(c)FSM100_open(c)}},true);
