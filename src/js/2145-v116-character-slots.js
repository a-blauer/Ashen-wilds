// ================= v116: three character slots =================
// The title screen lists three slots (KQSL, 0230). A filled slot continues that hero, an empty one starts a new hero in it.
// Picking a slot sets SAVE_KEY (kqSlotSet) before the old Continue / New flow runs. From the in-game main menu a hero is
// already loaded, so another slot is opened by saving, setting the slot and reloading (sessionStorage kq_cont / kq_new).
// "Join a friend" (data-aw="join") opens the join-code window (2160), which also picks the slot.
document.head.insertAdjacentHTML('beforeend',`<style>
#awT .awm .kqsl-h{font:600 .72rem Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#b39a84;text-align:center;margin-bottom:-2px}
#awT .awm .kqsl-r{display:flex;gap:6px;align-items:stretch}#awT .awm .kqsl-r>button[data-aw]{flex:1;min-width:0}
#awT .awm .kqsl-r .kqsl-d{flex:0 0 auto;width:42px;padding:0;font-size:.95rem}
#awT .awm .kqsl-r .kqsl-d.sure{color:#fecaca;font-size:.62rem;width:64px}
#awT .awm button .kqsl-n{font:600 .64rem Inter,sans-serif;letter-spacing:.14em;color:#b39a84;margin-right:6px}
#awT .awm button.kqsl-e{opacity:.82}
#awT .awm button.kqsl-j{margin-top:6px}
</style>`);
function kqslEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';')}
function kqslRow(i){const s=kqSlotInfo(i),cur=i===KQSL.n,inUse=cur&&typeof KQMENU!='undefined'&&KQMENU.on;
  if(!s)return `<div class="kqsl-r"><button class="kqsl-e" data-aw="new" data-slot="${i}"><span class="kqsl-n">SLOT ${i+1}</span>Empty<small>Create a new hero here</small></button></div>`;
  const C=CLS[s.hero.cls]||{i:'',n:''},d=new Date(s.at||Date.now());
  return `<div class="kqsl-r"><button class="${cur?'p':''}" data-aw="cont" data-slot="${i}"><span class="kqsl-n">SLOT ${i+1}</span>${C.i} ${kqslEsc(s.hero.name||'Hero')}<small>Lv ${s.hero.lvl|0} ${C.n} · ${s.wv===3?(s.bossDone||[]).length:0} of 6 realms · ${d.toLocaleDateString()}${inUse?' · playing now':''}</small></button>`+
    (inUse?'':`<button class="kqsl-d" data-sld="${i}" tabindex="-1" title="Delete this hero">🗑</button>`)+'</div>'}
function kqslRender(){const T=$('awT');if(!T)return;const m=T.querySelector('.awm');if(!m)return;
  m.innerHTML='<div class="kqsl-h">Choose your hero</div>'+[0,1,2].map(kqslRow).join('')+
    '<button class="kqsl-j" data-aw="join">👥 Join a friend<small>Enter a join code and pick which hero to bring</small></button>';
  if(!m.dataset.kqsl){m.dataset.kqsl=1;m.addEventListener('click',e=>{const b=e.target.closest('[data-sld]');if(!b)return;e.stopPropagation();const i=+b.dataset.sld;
    if(!b.classList.contains('sure')){b.classList.add('sure');b.textContent='Delete?';setTimeout(()=>{if(b.isConnected){b.classList.remove('sure');b.textContent='🗑'}},3000);return}
    try{localStorage.removeItem(KQSL.keys[i])}catch(_){}kqslRender()},true)}
  if(!matchMedia('(pointer:coarse)').matches){const b=m.querySelector('[data-aw].p')||m.querySelector('[data-aw]');if(b)setTimeout(()=>b.focus(),60)}}
// a title still fading out (Continue less than a second ago) would block the new one and then vanish: clear it first
{const f=awTitle;awTitle=function(){const o=$('awT');if(o&&o.classList.contains('out'))o.remove();const r=f.apply(this,arguments);try{kqslRender()}catch(e){console.warn('slots',e)}return r}}
// open another slot from the in-game main menu: save, switch, reload, then continue / create there
function kqslReload(sl,flag,extra){try{saveGame(true)}catch(_){}KQMENU.nosave=1;kqSlotSet(sl);
  try{sessionStorage.setItem(flag,'1');if(extra)sessionStorage.setItem(extra[0],extra[1])}catch(_){}
  const T=$('awT');if(T)T.classList.add('out');setTimeout(()=>{try{location.reload()}catch(_){}},400)}
// a real (detached) button for flows that start a slot without a click
function kqslBtn(mode,sl){const b=document.createElement('button');b.dataset.aw=mode;b.dataset.slot=String(sl);return b}
{const f=awTitleGo;awTitleGo=function(mode,btn){
  const T=$('awT');if(!T||T.classList.contains('out'))return;
  if(mode=='join'){if(typeof kqJoinOpen=='function')kqJoinOpen();return}
  const sl=btn&&btn.dataset&&btn.dataset.slot!=null?+btn.dataset.slot:null;
  if(sl!=null&&sl>=0&&sl<3){
    if(typeof KQMENU!='undefined'&&KQMENU.on){if(sl!==KQSL.n)return kqslReload(sl,mode=='new'?'kq_new':'kq_cont')}
    else{kqSlotSet(sl);if(mode=='new'&&saveInfo())return}} // a filled slot is never overwritten by New
  return f.apply(this,arguments)}}
kqslRender();
// after a reload from the menu into another slot (kq_new is handled in 1160)
try{if(sessionStorage.getItem('kq_cont')){sessionStorage.removeItem('kq_cont');if(saveInfo()&&$('awT'))awTitleGo('cont',kqslBtn('cont',KQSL.n))}}catch(_){}
