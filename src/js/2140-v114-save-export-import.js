// ================= v114: export / import the saved game =================
// The save lives in this browser's storage for this link only. Export turns it into a text code (KQSAVE1: + base64 of
// the save JSON) you can copy or download; Import takes that code (or the raw JSON) and puts it back, then reloads the
// page so the Welcome-back prompt offers Continue. Offered in Settings → Saved game and on the title screen (the layout
// picker and the Welcome-back prompt), so a hero can move between links or devices.
var KQSX={pre:'KQSAVE1:'};
function kqsxEncode(){try{if(party.length&&!AF)saveGame(true)}catch(_){}const raw=localStorage.getItem(SAVE_KEY);if(!raw)return null;
  return KQSX.pre+btoa(unescape(encodeURIComponent(raw)))}
function kqsxDecode(t){t=String(t||'').trim();if(!t)return null;let j=t;
  try{if(t.startsWith(KQSX.pre))j=decodeURIComponent(escape(atob(t.slice(KQSX.pre.length).replace(/\s+/g,''))));
    else if(!t.startsWith('{'))j=decodeURIComponent(escape(atob(t.replace(/\s+/g,''))));
    const s=JSON.parse(j),h=s&&s.hero;
    // the fields loadGame needs before anything else (a code that lacks them would leave the game half-loaded)
    return h&&CLS[h.cls]&&s.pos&&isFinite(s.pos.x)&&isFinite(s.pos.z)&&isFinite(h.lvl)?s:null}catch(_){return null}}
function kqsxName(s){const C=CLS[s.hero.cls]||{n:''};return `${s.hero.name||'Hero'} · Lv ${s.hero.lvl} ${C.n}`}
document.head.insertAdjacentHTML('beforeend',`<style>
#kqsx{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(6,4,3,.86)}#kqsx.hide{display:none}
#kqsx .win{width:min(560px,96vw)}#kqsx textarea{width:100%;min-height:120px;resize:vertical;font:.72rem/1.4 monospace;background:rgba(0,0,0,.35);color:var(--ink,#e8dcc0);border:1px solid rgba(201,162,74,.4);border-radius:6px;padding:8px;box-sizing:border-box}
#kqsx .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#kqsx .mut{font-size:.74rem}#kqsx .ok{color:#8ad07a}#kqsx .bad{color:#e07a6a}
</style>`);
document.body.insertAdjacentHTML('beforeend',`<div id="kqsx" class="hide"><div class="win nar">
  <div class="wh"><h2 id="kqsxH">Save</h2><button class="x" id="kqsxClose" title="Close">✕</button></div>
  <div class="wb" style="padding:14px 16px;display:grid;gap:10px">
    <div class="mut" id="kqsxT"></div><textarea id="kqsxA" spellcheck="false"></textarea>
    <div class="row" id="kqsxB"></div><div class="mut" id="kqsxM"></div>
  </div></div></div>`);
$('kqsxClose').onclick=()=>$('kqsx').classList.add('hide');
$('kqsxA').addEventListener('keydown',e=>e.stopPropagation());$('kqsxA').addEventListener('keyup',e=>e.stopPropagation());
function kqsxOpen(mode){const w=$('kqsx'),A=$('kqsxA'),B=$('kqsxB'),M=$('kqsxM');w.classList.remove('hide');M.textContent='';M.className='mut';
  if(mode=='export'){const code=kqsxEncode();$('kqsxH').textContent='Export saved game';
    if(!code){$('kqsxT').textContent='There is no saved game on this device yet.';A.value='';B.innerHTML='';return}
    $('kqsxT').textContent='This code is your whole hero. Copy it (or download it) and keep it somewhere safe; paste it with Import on another link or device.';
    A.value=code;A.readOnly=true;A.onclick=()=>A.select();
    B.innerHTML=`<button id="kqsxCopy">📋 Copy code</button><button id="kqsxDl">⬇️ Download file</button>`;
    $('kqsxCopy').onclick=async()=>{try{await navigator.clipboard.writeText(code);M.textContent='Copied to the clipboard.';M.className='mut ok'}catch(_){A.select();M.textContent='Select the text above and copy it (Ctrl/Cmd + C).';M.className='mut'}};
    $('kqsxDl').onclick=()=>{try{const s=saveInfo(),n=(s&&s.hero&&s.hero.name||'hero').replace(/[^\w-]+/g,'_');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));a.download='kill-quest-'+n+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);M.textContent='Downloaded.';M.className='mut ok'}catch(_){M.textContent='Could not download here; copy the code instead.';M.className='mut bad'}}}
  else{$('kqsxH').textContent='Import saved game';$('kqsxT').textContent='Paste a save code (from Export) below, or open the downloaded file. This replaces the saved game on this device.';
    A.value='';A.readOnly=false;A.onclick=null;
    B.innerHTML=`<button id="kqsxFile">📂 Open file…</button><input type="file" id="kqsxF" accept=".txt,text/plain" style="display:none"><button class="pri" id="kqsxGo">📥 Import</button>`;
    $('kqsxFile').onclick=()=>$('kqsxF').click();
    $('kqsxF').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{A.value=String(r.result||'');kqsxCheck()};r.readAsText(f)};
    const kqsxCheck=()=>{const s=kqsxDecode(A.value);if(s){M.textContent='Found: '+kqsxName(s)+'. Press Import to use it.';M.className='mut ok'}else{M.textContent=A.value.trim()?'That is not a Kill Quest save code.':'';M.className='mut bad'}return s};
    A.oninput=kqsxCheck;
    $('kqsxGo').onclick=()=>{const s=kqsxCheck();if(!s)return;
      if(!$('kqsxGo').dataset.sure&&saveInfo()){$('kqsxGo').dataset.sure=1;$('kqsxGo').textContent='Tap again: this replaces the save on this device';return}
      // stop the running game (autosave, save on page close) from writing its hero back over the import before the reload
      KQMENU.nosave=1;try{localStorage.setItem(SAVE_KEY,JSON.stringify(s))}catch(_){KQMENU.nosave=0;M.textContent='Your browser blocked storage here.';M.className='mut bad';return}
      M.textContent='Imported '+kqsxName(s)+'. Reloading…';M.className='mut ok';setTimeout(()=>location.reload(),600)}}}
// Settings → Saved game: Export / Import next to Delete
{const d=$('delSave');if(d)d.insertAdjacentHTML('beforebegin',`<div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button id="kqsxE">📤 Export save</button><button id="kqsxI">📥 Import save</button></div>`);
  if($('kqsxE'))$('kqsxE').onclick=()=>kqsxOpen('export');if($('kqsxI'))$('kqsxI').onclick=()=>kqsxOpen('import')}
// title screen: the layout picker (no save yet) and the Welcome-back prompt (a save exists) both offer Import; the prompt Export too
{const p=$('devp');if(p)p.insertAdjacentHTML('beforeend',`<div style="margin-top:10px"><button id="kqsxI2" style="font-size:.85rem">📥 Import a saved game from another link or device</button></div>`);
  if($('kqsxI2'))$('kqsxI2').onclick=e=>{e.stopPropagation();kqsxOpen('import')};
  const s=document.querySelector('#svp .devb');if(s)s.insertAdjacentHTML('afterend',`<div class="row" style="display:flex;gap:8px;justify-content:center;margin-top:6px"><button id="kqsxE3" style="font-size:.8rem">📤 Export this save</button><button id="kqsxI3" style="font-size:.8rem">📥 Import a save</button></div>`);
  if($('kqsxE3'))$('kqsxE3').onclick=()=>kqsxOpen('export');if($('kqsxI3'))$('kqsxI3').onclick=()=>kqsxOpen('import')}
