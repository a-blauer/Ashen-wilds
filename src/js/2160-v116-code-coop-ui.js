// ================= v116: join-code co-op — windows and flow =================
// Host: co-op window (Y) → Host a game → a 6-letter code to share. Join: title screen "Join a friend" or the co-op window →
// type the code, pick one of your three heroes (or paste a save code from the Claude version / another device into a slot).
// A link with ?join=CODE (or #join=CODE) opens the join window with the code filled in.
// Joining with a hero other than the loaded one saves, switches slot and reloads (sessionStorage kq_join + kq_cont/kq_new);
// KQN.pend then connects as soon as the hero is in the world (KQN.pend is also used after a title-screen start).
document.head.insertAdjacentHTML('beforeend',`<style>
#kqj{position:fixed;inset:0;z-index:95;display:flex;align-items:center;justify-content:center;background:rgba(6,4,3,.86)}#kqj.hide{display:none}
#kqj .win{width:min(520px,96vw);max-height:94vh;overflow:auto}#kqj .wb{padding:14px 16px;display:grid;gap:10px}
.kqj-code{width:100%;box-sizing:border-box;text-align:center;font:700 1.6rem/1.2 'VT323',monospace;letter-spacing:.35em;text-transform:uppercase;background:rgba(0,0,0,.4);color:#f0cc72;border:1px solid rgba(201,162,74,.5);border-radius:6px;padding:8px}
.kqj-sl{display:grid;gap:6px}.kqj-sl label{display:flex;gap:8px;align-items:center;padding:7px 9px;border:1px solid rgba(255,255,255,.12);border-radius:7px;cursor:pointer;background:rgba(0,0,0,.2);font-size:.85rem}
.kqj-sl label.on{border-color:#c9a24a;background:rgba(201,162,74,.14)}.kqj-sl small{display:block;color:var(--mut,#a39378);font-size:.72rem}
#kqj textarea{width:100%;min-height:70px;box-sizing:border-box;font:.7rem/1.35 monospace;background:rgba(0,0,0,.35);color:var(--ink,#e8dcc0);border:1px solid rgba(201,162,74,.35);border-radius:6px;padding:6px}
#kqj details summary{cursor:pointer;font-size:.82rem;color:#e8d8a8}#kqj .mut{font-size:.75rem}#kqj .ok{color:#8ad07a}#kqj .bad{color:#e07a6a}
.kqc{background:rgba(201,162,74,.08);border:1px solid rgba(201,162,74,.35);border-radius:10px;padding:10px 12px;margin-bottom:10px;display:block!important}
.kqc h4{margin:0 0 6px;font-size:.9rem;color:#e8d8a8}.kqc .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.kqc .big{font:700 2rem/1 'VT323',monospace;letter-spacing:.3em;color:#f0cc72;padding:4px 10px;background:rgba(0,0,0,.35);border-radius:6px;user-select:all}
.kqc input{width:9.5em;text-transform:uppercase;letter-spacing:.2em;font:600 1rem monospace;background:#0d1016;color:#f0cc72;border:1px solid #3a4150;border-radius:6px;padding:5px 7px}
.kqc .bad{color:#e07a6a}.kqc .mut{font-size:.76rem}
</style>`);
document.body.insertAdjacentHTML('beforeend',`<div id="kqj" class="hide"><div class="win nar">
  <div class="wh"><h2>👥 Join a friend</h2><button class="x" id="kqjX" title="Close">✕</button></div>
  <div class="wb">
    <div class="mut">Ask the host for their join code (Co-op window, <b>Y</b> → Host a game). No Claude account is needed.</div>
    <input id="kqjCode" class="kqj-code" maxlength="6" autocomplete="off" spellcheck="false" placeholder="CODE">
    <div><div class="mut" style="margin-bottom:4px">Play as</div><div class="kqj-sl" id="kqjSl"></div></div>
    <details id="kqjImp"><summary>📥 Bring a hero from another link or device (save code)</summary>
      <div class="mut" style="margin:6px 0">In the other game: Settings → Saved game → Export save, copy the code and paste it here. It goes into the slot picked above.</div>
      <textarea id="kqjA" spellcheck="false" placeholder="KQSAVE1:…"></textarea><div class="mut" id="kqjAM"></div></details>
    <div class="row" style="display:flex;gap:8px;align-items:center"><button class="pri" id="kqjGo">👥 Join</button><span class="mut" id="kqjM"></span></div>
  </div></div></div>`);
var KQJ={sl:0,sure:0};
function kqjOpen(){const w=$('kqj');w.classList.remove('hide');KQJ.sure=0;$('kqjM').textContent='';$('kqjM').className='mut';
  if(!kqnClean($('kqjCode').value)&&KQN.url)$('kqjCode').value=KQN.url;
  KQJ.sl=KQSL.n;if(!kqSlotInfo(KQJ.sl)){const f=[0,1,2].find(i=>kqSlotInfo(i));if(f!=null&&!party.length)KQJ.sl=f}
  kqjSlots();kqjCheck();setTimeout(()=>{const c=$('kqjCode');if(!kqnClean(c.value))c.focus()},40)}
var kqJoinOpen=kqjOpen;
function kqjClose(){$('kqj').classList.add('hide')}
function kqjSlots(){const loaded=party.length>0;
  $('kqjSl').innerHTML=[0,1,2].map(i=>{const s=kqSlotInfo(i),C=s?CLS[s.hero.cls]||{i:'',n:''}:null;
    return `<label class="${i===KQJ.sl?'on':''}" data-kqjs="${i}"><input type="radio" name="kqjs" ${i===KQJ.sl?'checked':''}><span>Slot ${i+1} · ${s?C.i+' <b>'+kqslEsc(s.hero.name||'Hero')+'</b> Lv '+(s.hero.lvl|0)+' '+C.n:'<i>Empty</i>'}<small>${s?(loaded&&i===KQSL.n?'Playing now':'Saved '+new Date(s.at||Date.now()).toLocaleDateString()):'Create a new hero first, then you join'}</small></span></label>`}).join('')}
function kqjImport(){const t=$('kqjA').value.trim();return t?kqsxDecode(t):null}
function kqjCheck(){const t=$('kqjA').value.trim(),s=kqjImport(),M=$('kqjAM');
  if(!t){M.textContent='';return null}
  if(!s){M.textContent='That is not a Kill Quest save code.';M.className='mut bad';return null}
  const o=kqSlotInfo(KQJ.sl);M.textContent='Found '+kqsxName(s)+' → Slot '+(KQJ.sl+1)+(o?' (replaces '+(o.hero.name||'Hero')+')':'');M.className=o?'mut bad':'mut ok';return s}
$('kqjX').onclick=kqjClose;
$('kqjSl').addEventListener('click',e=>{const l=e.target.closest('[data-kqjs]');if(!l)return;KQJ.sl=+l.dataset.kqjs;KQJ.sure=0;kqjSlots();kqjCheck()});
$('kqjA').addEventListener('input',()=>{KQJ.sure=0;kqjCheck()});
$('kqjCode').addEventListener('input',e=>{const v=kqnClean(e.target.value);if(v!==e.target.value)e.target.value=v});
// typing in the join window or the co-op code box never reaches the game's controls (the title screen's own key filter runs
// first there, so Enter on the title is handled in the awTitleGo wrapper below)
addEventListener('keydown',e=>{const t=e.target;if(!t||!t.closest)return;const inJ=!!t.closest('#kqj'),inC=t.id=='kqcIn';if(!inJ&&!inC)return;
  e.stopImmediatePropagation();
  if(inJ&&e.key=='Escape'){e.preventDefault();kqjClose()}
  else if(e.key=='Enter'&&t.id=='kqjCode'){e.preventDefault();kqjGo()}
  else if(e.key=='Enter'&&inC){e.preventDefault();const b=document.querySelector('[data-kqc="join"]');if(b)b.click()}},true);
addEventListener('keyup',e=>{const t=e.target;if(t&&t.closest&&(t.closest('#kqj')||t.id=='kqcIn'))e.stopImmediatePropagation()},true);
$('kqjGo').onclick=()=>kqjGo();
function kqjGo(){const M=$('kqjM'),code=kqnClean($('kqjCode').value);M.className='mut bad';
  if(code.length!==6){M.textContent='Enter the 6-letter join code.';return}
  const imp=kqjImport();if($('kqjA').value.trim()&&!imp){M.textContent='The save code is not valid (or clear it).';return}
  const sl=KQJ.sl,had=kqSlotInfo(sl);
  if(imp&&had&&!KQJ.sure){KQJ.sure=1;M.textContent='Press Join again: this replaces '+(had.hero.name||'the hero')+' in Slot '+(sl+1)+'.';return}
  const loaded=party.length>0,menu=typeof KQMENU!='undefined'&&KQMENU.on;
  if(loaded&&sl===KQSL.n&&!imp){ // the hero who is already loaded: just connect
    kqjClose();if(menu){const T=$('awT');if(T)awTitleGo('cont',kqslBtn('cont',sl))}kqcJoin(code);return}
  if(loaded){ // another hero (or an imported one): save this one, switch, reload, then join
    try{saveGame(true)}catch(_){}KQMENU.nosave=1;
    if(imp)try{localStorage.setItem(KQSL.keys[sl],JSON.stringify(imp))}catch(_){KQMENU.nosave=0;M.textContent='Your browser blocked storage here.';return}
    kqSlotSet(sl);try{sessionStorage.setItem('kq_join',code);sessionStorage.setItem(kqSlotInfo(sl)?'kq_cont':'kq_new','1')}catch(_){}
    M.className='mut ok';M.textContent='Loading your hero…';setTimeout(()=>{try{location.reload()}catch(_){}},300);return}
  // from the first title screen: nothing loaded yet
  if(imp)try{localStorage.setItem(KQSL.keys[sl],JSON.stringify(imp))}catch(_){M.textContent='Your browser blocked storage here.';return}
  kqSlotSet(sl);KQN.pend=code;kqjClose();const T=$('awT');
  if(T&&!T.classList.contains('out'))awTitleGo(kqSlotInfo(sl)?'cont':'new',kqslBtn(kqSlotInfo(sl)?'cont':'new',sl))}
// the title's Enter key is not for us while the join window is open
{const f=awTitleGo;awTitleGo=function(mode,btn){if(!$('kqj').classList.contains('hide')&&btn&&btn.isConnected){const a=document.activeElement;if(a&&a.id=='kqjCode')kqjGo();return}return f.apply(this,arguments)}}

// ---------- sessions ----------
function kqcMsg(t,bad){KQN.msg=t;KQN.bad=!!bad;try{if(xwMode=='coop')rX()}catch(_){}}
function kqcStart(p,join){KQN.busy=join?'join':'host';kqcMsg('');
  return p.then(({room,code})=>{KQN.busy='';const old=KQN.cur;KQN.cur=null;if(old)try{old.room.leave()}catch(_){}
    KQN.cur={room,code:code||join,host:!join};mpAttach(room);mpUse(room);
    room.onEnd(r=>{if(!KQN.cur||KQN.cur.room!==room)return;KQN.cur=null;mpUse(MPX.cl||null);
      const t={host:'The host left — the game ended.',net:'Lost the connection to the game.',full:'That game is full.'}[r]||'Online game ended.';say('👥 '+t);kqcMsg(t,true)});
    if(join){say('👥 Joined game <b>'+join+'</b>.');kqcMsg('')}else{say('👥 Hosting — your join code is <b>'+code+'</b>. Press Y to see it.');kqcMsg('')}
  }).catch(err=>{KQN.busy='';const t=(err&&err.message)||'Could not connect.';say('👥 '+mpEsc(t));kqcMsg(t,true)})}
function kqcHost(){if(KQN.busy)return;return kqcStart(kqnRoom('host'))}
function kqcJoin(code){if(KQN.busy)return;code=kqnClean(code);if(KQN.cur&&KQN.cur.code===code)return;return kqcStart(kqnRoom('join',code),code)}
function kqcLeave(){const c=KQN.cur;if(!c)return;KQN.cur=null;try{c.room.leave()}catch(_){}mpUse(MPX.cl||null);say('👥 You left the online game.');kqcMsg('')}
// connect a pending join once the hero is in the world
setInterval(()=>{try{if(!KQN.pend||!party.length||(typeof KQMENU!='undefined'&&KQMENU.on)||$('awT')||!$('start').classList.contains('hide'))return;
  const c=KQN.pend;KQN.pend=null;kqcJoin(c)}catch(_){}},500);
addEventListener('pagehide',()=>{try{if(KQN.cur)KQN.cur.room.leave()}catch(_){}});

// ---------- co-op window (Y): host / join box above the player list ----------
function kqcLink(code){try{if(window.top!==window||!/^https?:$/.test(location.protocol))return '';return location.origin+location.pathname+'?join='+code}catch(_){return ''}}
function kqcBox(){const C=KQN.cur;let h='<div class="kqc"><h4>🌐 Online with a join code <span class="mut">· no Claude account needed</span></h4>';
  if(C&&C.host){const n=C.room.count(),ln=kqcLink(C.code);
    h+=`<div class="row"><span class="mut">Your join code</span><span class="big">${C.code}</span><button data-kqc="copy">📋 Copy code</button>${ln?'<button data-kqc="link">🔗 Copy invite link</button>':''}<button data-kqc="leave">✕ Stop hosting</button></div>
      <div class="mut" style="margin-top:6px">${n>1?n+' players connected.':'Waiting for friends…'} Friends open the game in any browser, choose <b>Join a friend</b> (or press Y) and type this code. Up to ${KQN.max} players. Keep this tab open: the game ends if the host leaves.</div>`}
  else if(C)h+=`<div class="row"><span>Joined game <b>${C.code}</b> · ${C.room.count()} players</span><button data-kqc="leave">✕ Leave</button></div>`;
  else if(KQN.busy)h+=`<div class="mut">${KQN.busy=='host'?'Getting a join code…':'Connecting…'}</div>`;
  else h+=`<div class="row"><button class="pri" data-kqc="host">🏠 Host a game</button><span class="mut">or</span><input id="kqcIn" maxlength="6" placeholder="CODE" autocomplete="off" spellcheck="false" value="${KQN.url||''}"><button data-kqc="join">Join</button></div>
    <div class="mut" style="margin-top:6px">You join with the hero you are playing now. To bring a different hero, use ☰ → Main menu → Join a friend.</div>`;
  if(KQN.msg)h+=`<div class="${KQN.bad?'bad':'mut'}" style="margin-top:6px">${mpEsc(KQN.msg)}</div>`;
  return h+'</div>'}
{const f=XR.coop;XR.coop=()=>{f();const B=$('xwB');
  if(!MP.on){$('xwS').textContent=KQN.busy?'Connecting…':'Playing solo';B.innerHTML=kqcBox()+'<p class="lore">Fight the same monsters as your friends, each get your own loot, chat and trade. Host a game and share the code, or type a friend\'s code to join them.</p>';return}
  B.insertAdjacentHTML('afterbegin',kqcBox())}}
$('xwB').addEventListener('click',e=>{if(xwMode!=='coop')return;const b=e.target.closest('[data-kqc]');if(!b)return;const k=b.dataset.kqc,C=KQN.cur;
  if(k=='host')kqcHost();else if(k=='leave')kqcLeave();
  else if(k=='join'){const v=kqnClean(($('kqcIn')||{}).value);if(v.length!==6)return kqcMsg('Enter the 6-letter join code.',true);kqcJoin(v)}
  else if((k=='copy'||k=='link')&&C){const t=k=='link'?kqcLink(C.code):C.code;const done=()=>kqcMsg(k=='link'?'Invite link copied.':'Code copied.');
    try{navigator.clipboard.writeText(t).then(done,()=>kqcMsg('Copy failed — the code is '+C.code))}catch(_){kqcMsg('The code is '+C.code)}}
  rX()});
$('xwB').addEventListener('input',e=>{if(e.target&&e.target.id=='kqcIn'){const v=kqnClean(e.target.value);if(v!==e.target.value)e.target.value=v}});
// the co-op window refreshes its list every 1.5 s; keep the host's player count fresh too (but not while typing a code)
{const f=mpCoopList;mpCoopList=function(){f.apply(this,arguments);try{const C=KQN.cur;if(C&&xwMode==='coop'){const b=document.querySelector('#xwB .kqc');if(b)b.outerHTML=kqcBox()}}catch(_){}}}
// when only the join-code session could be live, the in-game co-op tick also needs a reason to show the player list
setInterval(()=>{try{if(xwMode==='coop'&&!MP.on&&!document.activeElement.matches('#kqcIn'))rX()}catch(_){}},1500);

// ---------- a link with ?join=CODE ----------
try{const q=new URLSearchParams(location.search).get('join')||(location.hash.match(/join=([A-Za-z0-9]{6})/)||[])[1];const c=kqnClean(q);if(c.length===6)KQN.url=c}catch(_){}
// after a reload that switched heroes to join
try{const c=sessionStorage.getItem('kq_join');if(c){sessionStorage.removeItem('kq_join');KQN.pend=kqnClean(c)}}catch(_){}
if(KQN.url&&!KQN.pend&&$('awT'))setTimeout(()=>{if($('awT')&&!$('awT').classList.contains('out'))kqjOpen()},700);
