// ================= v158: custom key bindings (desktop) =================
// Every keyboard check in the game reads e.key (the key's default letter, e.g. 'w', ' ', 'shift'). Rather than change each
// of them, this file runs FIRST (window capture listener, registered before any other key listener) and rewrites e.key on
// the event: a key the player bound to an action becomes that action's default key, and an action's default key that the
// player moved elsewhere becomes 'Unidentified' (does nothing). With no custom bindings nothing is touched.
//  * KB158.A: the actions [id, label, default key, group, context]; bindings live in SET.keys {id: key} (only changed ones),
//    saved with the other settings ('et_set'). Keys are stored the way kb158Norm() names them: lower-case e.key, digits by
//    their key position (so Shift+1 is still '1'), ' ' for Space.
//  * context 'ab': Crouch only works in the Abeksi stealth level (ab152In), so it may share a key with a normal action.
//  * KB158.cap: while the Settings window waits for a key, the next key press goes to this callback and nowhere else.
//  * Skipped: typing in text boxes, Ctrl/Alt/Cmd shortcuts, the title screen and the intro film.
var KB158={A:[
  ['up','Move forward','w','Movement'],['down','Move back','s','Movement'],['left','Move left','a','Movement'],['right','Move right','d','Movement'],
  ['dash','Dash','shift','Combat'],['cmd','Command companions to attack (jump in a chase)',' ','Combat'],['tgt','Target nearest enemy','tab','Combat'],
  ['a1','Ability 1','1','Combat'],['a2','Ability 2','2','Combat'],['a3','Ability 3','3','Combat'],['a4','Ability 4','4','Combat'],['a5','Ability 5','5','Combat'],['a6','Ability 6','6','Combat'],
  ['hp','Health potion','z','Combat'],['mp','Mana potion','x','Combat'],['feed','Feed the most hurt companion','q','Combat'],
  ['emp1','Empower companion 1','e','Combat'],['emp2','Empower companion 2','r','Combat'],
  ['act','Interact (talk, gather, fish)','f','World'],['mount','Ride / dismount','v','World'],['recall','Recall to Duskhold','t','World'],
  ['camL','Turn camera left','[','Camera'],['camR','Turn camera right',']','Camera'],
  ['inv','Inventory','i','Windows'],['char','Character','c','Windows'],['abil','Abilities','k','Windows'],['comp','Companions','p','Windows'],
  ['eggs','Incubators','u','Windows'],['fuse','Fusion','g','Windows'],['map','Map','n','Windows'],['king','Kingdom','b','Windows'],
  ['mnt','Mounts','h','Windows'],['dex','Bestiary','l','Windows'],['coop','Co-op','y','Windows'],['menu','Menu','m','Windows'],['set','Settings','o','Windows'],
  ['crouch','Crouch (stealth level)','c','Special','ab']],
  on:false,map:{},mapX:{},def:{},cap:null,rev:0};
var KB158_BAD={escape:1,meta:1,os:1,contextmenu:1,unidentified:1,dead:1,process:1,f11:1,f12:1};
function kb158Norm(e){let k=String(e.key||'').toLowerCase();const c=e.code||'';
  if(/^Digit\d$/.test(c))k=c.slice(5);else if(/^Numpad\d$/.test(c)&&k.length==1&&!/\d/.test(k))k=c.slice(6);
  if(k=='spacebar')k=' ';if(k=='esc')k='escape';return k}
function kb158Label(k){if(k==null||k==='')return '—';const L={' ':'Space',shift:'Shift',tab:'Tab',control:'Ctrl',alt:'Alt',enter:'Enter',backspace:'Backspace',
  capslock:'Caps Lock',arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',delete:'Del',insert:'Ins',home:'Home',end:'End',pageup:'PgUp',pagedown:'PgDn'};
  if(L[k])return L[k];return k.length==1?k.toUpperCase():k.charAt(0).toUpperCase()+k.slice(1)}
function kb158Get(id){const s=(typeof SET!='undefined'?SET:KB158.boot)||{},K=s.keys||{};const a=KB158.A.find(x=>x[0]==id);if(!a)return '';return (id in K)?K[id]:a[2]}
// rebuild the translation tables from the saved bindings
function kb158Build(keys){keys=keys||{};const map={},mapX={},def={};let on=false;
  KB158.A.forEach(a=>{def[a[2]]=1;const b=(a[0] in keys)?keys[a[0]]:a[2];if(b!==a[2])on=true;if(b==='')return;(a[4]?mapX:map)[b]=a[2]});
  KB158.on=on;KB158.map=map;KB158.mapX=mapX;KB158.def=def;KB158.rev++}
KB158.boot=(()=>{try{return JSON.parse(localStorage.getItem('et_set')||'{}')||{}}catch(_){return {}}})();
kb158Build(KB158.boot.keys);
function kb158Skip(e){const t=e.target;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'||t.tagName=='SELECT'||t.isContentEditable))return true;
  try{if(typeof IC151!='undefined'&&IC151.on)return true}catch(_){}
  try{const T=document.getElementById('awT');if(T&&!T.classList.contains('out'))return true}catch(_){}
  return false}
function kb158Key(d,sh){return d==' '?' ':d=='shift'?'Shift':d=='tab'?'Tab':d=='control'?'Control':(sh&&d.length==1?d.toUpperCase():d)}
function kb158H(e){
  if(KB158.cap){e.preventDefault();e.stopImmediatePropagation();if(e.type!='keydown'||e.repeat)return;
    const k=kb158Norm(e);if(k=='meta'||k=='os')return;const f=KB158.cap;KB158.cap=null;try{f(k)}catch(_){}return}
  if(!KB158.on)return;
  const p=kb158Norm(e);
  if((e.ctrlKey&&p!='control')||(e.metaKey&&p!='meta')||(e.altKey&&p!='alt'))return;
  if(kb158Skip(e))return;
  let d;
  // the stealth level's crouch key
  let ab=false;try{ab=typeof ab152In=='function'&&ab152In()&&AB152.S}catch(_){}
  if(ab&&(p in KB158.mapX))d=KB158.mapX[p];
  else if(p in KB158.map){d=KB158.map[p];
    // the Character key in the stealth level when Crouch moved off 'c': open Character here (the level's own 'c' handler would crouch)
    if(ab&&d=='c'&&kb158Get('crouch')!=='c'){e.preventDefault();e.stopImmediatePropagation();
      if(e.type=='keydown'&&!e.repeat){try{if(!$('tal').classList.contains('hide'))$('tal').classList.add('hide');else if(!uiOpen())openTal()}catch(_){}}return}}
  else if(KB158.def[p])d='';
  else return;
  const v=d===''?'Unidentified':kb158Key(d,e.shiftKey);
  if(v===e.key)return;
  try{Object.defineProperty(e,'key',{value:v,configurable:true})}catch(_){}
  if(d===''||d==' '||d=='tab'||p.length>1)e.preventDefault()}
addEventListener('keydown',kb158H,true);addEventListener('keyup',kb158H,true);
