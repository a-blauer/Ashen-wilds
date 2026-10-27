// ================= v161: custom key bindings (desktop) =================
// Every keyboard check in the game reads e.key (the key's default letter, e.g. 'w', ' ', 'shift'). Rather than change each
// of them, this file runs FIRST (window capture listener, registered before any other key listener) and rewrites e.key on
// the event: a key the player bound to an action becomes that action's default key, and an action's default key that the
// player moved elsewhere becomes 'Unidentified' (does nothing). With no custom bindings nothing is touched.
//  * KB161.A: the actions [id, label, default key, group, context]; bindings live in SET.keys {id: key} (only changed ones),
//    saved with the other settings ('et_set'). Keys are stored the way kb161Norm() names them: lower-case e.key, digits by
//    their key position (so Shift+1 is still '1'), ' ' for Space.
//  * context 'ab': Crouch only works in the Abeksi stealth level (ab152In), so it may share a key with a normal action.
//  * KB161.cap: while the Settings window waits for a key, the next key press goes to this callback and nowhere else.
//  * Skipped: typing in text boxes, Ctrl/Alt/Cmd shortcuts, the title screen and the intro film.
var KB161={A:[
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
var KB161_BAD={escape:1,meta:1,os:1,contextmenu:1,unidentified:1,dead:1,process:1,f11:1,f12:1};
function kb161Norm(e){let k=String(e.key||'').toLowerCase();const c=e.code||'';
  if(/^Digit\d$/.test(c))k=c.slice(5);else if(/^Numpad\d$/.test(c)&&k.length==1&&!/\d/.test(k))k=c.slice(6);
  if(k=='spacebar')k=' ';if(k=='esc')k='escape';return k}
function kb161Label(k){if(k==null||k==='')return '—';const L={' ':'Space',shift:'Shift',tab:'Tab',control:'Ctrl',alt:'Alt',enter:'Enter',backspace:'Backspace',
  capslock:'Caps Lock',arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',delete:'Del',insert:'Ins',home:'Home',end:'End',pageup:'PgUp',pagedown:'PgDn'};
  if(L[k])return L[k];return k.length==1?k.toUpperCase():k.charAt(0).toUpperCase()+k.slice(1)}
function kb161Get(id){const s=(typeof SET!='undefined'?SET:KB161.boot)||{},K=s.keys||{};const a=KB161.A.find(x=>x[0]==id);if(!a)return '';return (id in K)?K[id]:a[2]}
// rebuild the translation tables from the saved bindings
function kb161Build(keys){keys=keys||{};const map={},mapX={},def={};let on=false;
  KB161.A.forEach(a=>{def[a[2]]=1;const b=(a[0] in keys)?keys[a[0]]:a[2];if(b!==a[2])on=true;if(b==='')return;(a[4]?mapX:map)[b]=a[2]});
  KB161.on=on;KB161.map=map;KB161.mapX=mapX;KB161.def=def;KB161.rev++}
KB161.boot=(()=>{try{return JSON.parse(localStorage.getItem('et_set')||'{}')||{}}catch(_){return {}}})();
kb161Build(KB161.boot.keys);
function kb161Skip(e){const t=e.target;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'||t.tagName=='SELECT'||t.isContentEditable))return true;
  try{if(typeof IC151!='undefined'&&IC151.on)return true}catch(_){}
  try{const T=document.getElementById('awT');if(T&&!T.classList.contains('out'))return true}catch(_){}
  return false}
function kb161Key(d,sh){return d==' '?' ':d=='shift'?'Shift':d=='tab'?'Tab':d=='control'?'Control':(sh&&d.length==1?d.toUpperCase():d)}
function kb161H(e){
  if(KB161.cap){e.preventDefault();e.stopImmediatePropagation();if(e.type!='keydown'||e.repeat)return;
    const k=kb161Norm(e);if(k=='meta'||k=='os')return;const f=KB161.cap;KB161.cap=null;try{f(k)}catch(_){}return}
  if(!KB161.on)return;
  const p=kb161Norm(e);
  if((e.ctrlKey&&p!='control')||(e.metaKey&&p!='meta')||(e.altKey&&p!='alt'))return;
  if(kb161Skip(e))return;
  let d;
  // the stealth level's crouch key
  let ab=false;try{ab=typeof ab152In=='function'&&ab152In()&&AB152.S}catch(_){}
  if(ab&&(p in KB161.mapX))d=KB161.mapX[p];
  else if(p in KB161.map){d=KB161.map[p];
    // the Character key in the stealth level when Crouch moved off 'c': open Character here (the level's own 'c' handler would crouch)
    if(ab&&d=='c'&&kb161Get('crouch')!=='c'){e.preventDefault();e.stopImmediatePropagation();
      if(e.type=='keydown'&&!e.repeat){try{if(!$('tal').classList.contains('hide'))$('tal').classList.add('hide');else if(!uiOpen())openTal()}catch(_){}}return}}
  else if(KB161.def[p])d='';
  else return;
  const v=d===''?'Unidentified':kb161Key(d,e.shiftKey);
  if(v===e.key)return;
  try{Object.defineProperty(e,'key',{value:v,configurable:true})}catch(_){}
  if(d===''||d==' '||d=='tab'||p.length>1)e.preventDefault()}
addEventListener('keydown',kb161H,true);addEventListener('keyup',kb161H,true);
