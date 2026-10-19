// ================= v94: creator track — "Return to main menu" =================
// Settings → Saved game and the ☰ menu get "Return to main menu". After a confirm ("Your progress is saved") the game is
// saved; if that fails (storage blocked, Sovereign fight) nothing happens. Then, without reloading:
//   - every window, the ☰ menu and the confirm close, the mount is dismissed, held keys are released, the target is cleared;
//   - KQMENU.on pauses the game (uiOpen() and the main loop's dt, patched in pN_creator.py — also in co-op) and the
//     co-op presence is cleared, so partners see you leave (your hero drops out of their world);
//   - the v73 title screen is shown again (music switches to the title theme because #awT exists).
// Continue: the world is exactly the one just saved, so it simply resumes (nothing is rebuilt → nothing can be duplicated);
//   the title's own resize listener (added by awTitle) is removed again, presence is sent again.
// New game: the old "Start over?" second tap, then the save is deleted and the page reloads straight into the character
//   creator (sessionStorage kq_new; saving on page hide is switched off first so the old hero is not written back).
var KQMENU={on:0,ls:[],nosave:0};
function kqMenuCan(){
  if(!party.length)return 'There is nothing to save yet.';
  if(typeof AWD!='undefined'&&AWD.dead)return 'Rise again first.';
  if(typeof AF!='undefined'&&AF)return 'Finish the Sovereign fight first.';
  if(typeof WV!='undefined'&&WV&&WV.go)return 'Finish or leave your Wave Trial first.';
  return ''}
function kqMenuAsk(){
  const why=kqMenuCan();if(why){say(why);return}
  if(!$('kqMenuQ'))$('start').parentNode.insertAdjacentHTML('beforeend',`<div id="kqMenuQ" class="modal hide"><div class="win nar kqmq"><div class="wh"><h2>Main menu</h2></div>
    <div class="wb"><p>Return to the main menu?</p><p class="mut">Your progress is saved.</p></div>
    <div class="wf"><span style="flex:1"></span><button id="kqMenuNo">Cancel</button><button id="kqMenuYes" class="pri">Return to main menu</button></div></div></div>`),
    $('kqMenuNo').onclick=()=>$('kqMenuQ').classList.add('hide'),$('kqMenuYes').onclick=kqMenuGo,
    $('kqMenuQ').addEventListener('pointerdown',e=>{if(e.target.id=='kqMenuQ')$('kqMenuQ').classList.add('hide')});
  $('sysmenu').classList.add('hide');$('kqMenuQ').classList.remove('hide');setTimeout(()=>{try{$('kqMenuYes').focus()}catch(_){}},30)}
function kqMenuGo(){
  $('kqMenuQ').classList.add('hide');
  const why=kqMenuCan();if(why){say(why);return}
  if(!saveGame(true)){say('Could not save here, so you stay in the game.');return}
  // leave the world
  try{if(typeof closeWin=='function')closeWin();if(typeof xwMode!='undefined'&&!$('xw').classList.contains('hide')&&typeof closeX=='function')closeX()}catch(_){}
  try{if(typeof LKB!='undefined'&&LKB.on)lkBarberClose(false)}catch(_){}
  try{$('sysmenu').classList.add('hide');if(riding)dismount();if(typeof setTarget=='function')setTarget(null)}catch(_){}
  try{for(const k in K)K[k]=false;if(typeof dp!='undefined'){dp[0]=0;dp[1]=0}}catch(_){}
  KQMENU.on=1;
  try{if(typeof MP!='undefined'&&MP.room&&MP.on){MP.room.presence({n:String(hero.name||'Hero').slice(0,20),x:null,z:null}).catch(()=>{});MP.lastPres='away'}}catch(_){}
  // the title screen, as on first load; listeners it adds to window are remembered and removed on Continue
  const ae=window.addEventListener,na=window.AW_NOTITLE;KQMENU.ls=[];
  window.addEventListener=function(t,f,o){KQMENU.ls.push([t,f,o]);return ae.call(this,t,f,o)};
  try{window.AW_NOTITLE=0;awTitle()}catch(e){console.warn('menu title',e)}finally{window.addEventListener=ae;window.AW_NOTITLE=na}
  if(!$('awT')){KQMENU.on=0;return}
  try{awSnd('open')}catch(_){}}
function kqMenuResume(){
  KQMENU.ls.forEach(([t,f,o])=>removeEventListener(t,f,o));KQMENU.ls=[];KQMENU.on=0;
  try{if(typeof MP!='undefined')MP.lastPres=''}catch(_){}
  try{last=performance.now()}catch(_){}
  hud();try{fadeTo(()=>banner('Welcome back, '+hero.name,CLS[hero.cls].i+' '+CLS[hero.cls].n+' · Lv '+hero.lvl,''))}catch(_){}}
// co-op: no presence while on the title
{const f=mpPresence;mpPresence=function(){if(KQMENU.on)return;return f.apply(this,arguments)}}
{const f=saveGame;saveGame=function(){if(KQMENU.nosave)return false;return f.apply(this,arguments)}}
{const f=awTitleGo;awTitleGo=function(mode,btn){
  if(!KQMENU.on)return f.apply(this,arguments);
  const T=$('awT');if(!T||T.classList.contains('out'))return;
  if(mode=='cont'){try{audio()}catch(_){}awSnd('open');T.classList.add('out');setTimeout(()=>T.remove(),950);kqMenuResume();return}
  if(mode=='new'){
    if(!btn.dataset.sure){btn.dataset.sure=1;btn.classList.add('warn');btn.innerHTML='Start over?<small>Tap again — this replaces your saved hero</small>';return}
    KQMENU.nosave=1;deleteSave();try{sessionStorage.setItem('kq_new','1')}catch(_){}
    T.classList.add('out');setTimeout(()=>{try{location.reload()}catch(_){}},400)}}}
// after "New game" from the menu: straight into the creator (no title, no layout prompt when it is saved)
try{if(sessionStorage.getItem('kq_new')){sessionStorage.removeItem('kq_new');const b=document.querySelector('#awT [data-aw="new"]');if(b&&!saveInfo())awTitleGo('new',b)}}catch(_){}
// buttons: Settings → Saved game, and the ☰ menu
{const d=$('delSave');if(d&&!$('kqMenuBtn')){d.insertAdjacentHTML('afterend','<button id="kqMenuBtn" style="justify-self:start">🏠 Return to main menu</button>');$('kqMenuBtn').onclick=kqMenuAsk}
 const sm=$('sysmenu');if(sm&&!$('kqMenuSys')){const b=document.createElement('button');b.id='kqMenuSys';b.innerHTML='🏠 Main menu';sm.appendChild(b);b.onclick=e=>{e.stopPropagation();kqMenuAsk()}}}
addEventListener('keydown',e=>{const q=$('kqMenuQ');if(q&&!q.classList.contains('hide')){if(e.key=='Escape'){q.classList.add('hide');e.preventDefault()}if(e.target.tagName!='BUTTON'||e.key!='Enter')e.stopImmediatePropagation()}},true);
document.head.insertAdjacentHTML('beforeend','<style>#kqMenuQ:not(.hide){display:flex;align-items:center;justify-content:center;z-index:30}#kqMenuQ .kqmq{width:min(420px,100%);height:auto}#kqMenuQ .wb{padding:14px 18px}#kqMenuQ p{margin:0 0 6px}</style>');
