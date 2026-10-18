// ================= v90 ui: cheats password, location box under the minimap =================
// 1. Cheats (Settings → Cheats, zzL_cheats.js + zzN_misc_cheats.js) need the password CHU.pw. Until it is entered the section
//    shows only a password field + Unlock button; the cheat controls stay hidden and every cheat handler refuses.
//    The unlock lasts for this browser session (sessionStorage CHU.key) or until Lock is pressed. Cheat flags that are
//    already on in a save (CHEAT.portals/money/god) keep working while locked; only changing them needs the password.
//    Keys typed in the password field never reach the game hotkeys (window capture listener below).
// 2. The location box (#locBox, v84) sits right under the minimap, as wide as the minimap; area name/level on line 1,
//    the recommendation on line 2 (each line shrinks a little to fit, then wraps). The buttons/panels under the minimap
//    (#fsBtn, #sysBtn, #sysmenu, #evtk) move down by the box's height. v90Lay() measures, it runs on HUD updates and resizes.
var CHU={on:false,pw:'112233',key:'kq_cheatpw'};
try{CHU.on=sessionStorage.getItem(CHU.key)=='1'}catch(_){}
document.head.insertAdjacentHTML('beforeend',`<style id="v90css">
#chLock{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border:1px dashed #c9a24a;border-radius:3px;background:rgba(201,162,74,.06);font-size:.78rem}
#chLock small{color:var(--mut);font-size:.68rem}
#chLock .chlr{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
#chLock input{flex:1;min-width:120px;max-width:220px;font-size:16px;padding:6px 8px}
#chLock input:not(:placeholder-shown){letter-spacing:.2em}
#chErr{color:#f87171;font-size:.72rem;font-weight:700}
#chLock.bad input{animation:chShake .35s;border-color:#f87171}
@keyframes chShake{20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
#chOpen{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
#chOpen small{color:#6ee7b7;font-size:.68rem}
#chLock.hide,#chOpen.hide,#chErr.hide{display:none}
#locBox.v90{left:auto;right:auto;transform:none;max-width:none;white-space:normal;overflow:hidden;text-overflow:clip;box-sizing:border-box;
  padding:5px 8px;display:flex;flex-direction:column;align-items:center;gap:1px;line-height:1.15;text-align:center}
#locBox.v90 .v90l1,#locBox.v90 .v90l2{display:block;max-width:100%;white-space:nowrap}
#locBox.v90 .v90w{white-space:normal}
#locBox.v90 .v90w .v90s{display:none}#locBox.v90 .v90w .v90c{display:block}
#locBox.v90 .v90c{white-space:nowrap}
#locBox.v90 .v90l1{font-size:11px}
#locBox.v90 .v90l1 .v90c:not(.v90n){font:700 .9em/1.15 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:0}
#locBox.v90 .v90l2{font:600 10px/1.15 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:0;color:var(--kq-ink,#e8dcc0);opacity:.9}
#locBox.v90.v90cut .v90o{display:none}
#locBox.v90 .v90h{display:none}
body.kq #locBox.v90{padding:5px 8px;letter-spacing:.03em;border-image-width:9px}
@media (min-width:900px){body:not(.mob) #tgt,body:not(.mob) #boss{top:10px}}
/* phone held upright: the boss bar and target frame use the space left of the minimap column */
#sysmenu{z-index:4}
body.v90s #boss,body.v90s #tgt{left:calc(46% - min(150px,18%));transform:none;width:min(300px,36%);box-sizing:border-box}body.v90s #boss{top:58px}
body.v90s #evtk{min-width:0;width:128px;box-sizing:border-box}
@media (orientation:portrait){body.mob #boss,body.mob #tgt{left:8px;transform:none;width:calc(100% - 146px);box-sizing:border-box}body.mob #boss{top:58px}}
</style>`);

// ---------------- 1. cheats password ----------------
{const btn=$('cheatBtn');if(btn){
  btn.insertAdjacentHTML('beforebegin',`<div id="chLock" class="hide"><span>🔒 Cheats are locked.<br><small>Enter the cheat password to use them.</small></span>
    <div class="chlr"><input id="chPw" type="password" inputmode="numeric" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" maxlength="24" placeholder="Password" aria-label="Cheat password"><button id="chUnBtn" class="pri">Unlock</button></div>
    <div id="chErr" class="hide" role="alert"></div></div><div id="chOpen" class="hide"></div>`);
  const op=$('chOpen');op.appendChild(btn);op.insertAdjacentHTML('beforeend','<button id="chLockBtn" title="Lock the cheats again">🔒 Lock</button><small>Unlocked</small>')}}
CHU.sync=function(){const L=$('chLock'),O=$('chOpen'),B=$('cheatBox');if(!L)return;L.classList.toggle('hide',CHU.on);if(O)O.classList.toggle('hide',!CHU.on);
  if(!CHU.on&&B)B.classList.add('hide');try{cheatSync()}catch(_){}};
CHU.err=function(t){const e=$('chErr'),L=$('chLock');if(!e)return;e.textContent=t;e.classList.remove('hide');L.classList.remove('bad');void L.offsetWidth;L.classList.add('bad');
  clearTimeout(CHU.et);CHU.et=setTimeout(()=>{e.classList.add('hide');L.classList.remove('bad')},2500)};
CHU.unlock=function(pw){const ok=String(pw==null?'':pw).trim()===CHU.pw,f=$('chPw');if(f)f.value='';
  if(!ok){CHU.err('Wrong password.');return false}
  CHU.on=true;try{sessionStorage.setItem(CHU.key,'1')}catch(_){}const e=$('chErr');if(e)e.classList.add('hide');CHU.sync();if(f)f.blur();say('🔓 Cheats unlocked.');return true};
CHU.lock=function(){CHU.on=false;try{sessionStorage.removeItem(CHU.key)}catch(_){}CHU.sync();say('🔒 Cheats locked.')};
CHU.deny=function(){CHU.sync();say('🔒 Cheats are locked — enter the password in Settings → Cheats.');return false};
{const u=$('chUnBtn');if(u)u.onclick=()=>CHU.unlock($('chPw').value);const l=$('chLockBtn');if(l)l.onclick=()=>CHU.lock()}
// every cheat control refuses while locked: wrap the handlers (also covers scripts calling .onclick()/.onchange())
['cheatBtn','ch_portals','ch_money','ch_god','ch_lv1','ch_lvmax','ch_shops','ch_res'].forEach(id=>{const e=$(id);if(!e)return;
  ['onclick','onchange'].forEach(p=>{const f=e[p];if(typeof f=='function')e[p]=function(){if(!CHU.on)return CHU.deny();return f.apply(this,arguments)}})});
// …and any other control inside the box (cheats added later), before their own listeners run
{const B=$('cheatBox');if(B)['click','change','input'].forEach(t=>B.addEventListener(t,e=>{if(CHU.on)return;if(e.target.closest&&e.target.closest('input,button,select')){e.preventDefault();e.stopImmediatePropagation();if(t!='input')CHU.deny()}},true))}
// the password field: Enter submits, Escape leaves the field, no key reaches the game's hotkeys (WASD, I, K, O, Space…)
['keydown','keyup','keypress'].forEach(t=>addEventListener(t,e=>{const f=e.target;if(!f||f.id!='chPw')return;e.stopImmediatePropagation();
  if(t=='keydown'&&e.key=='Enter'){e.preventDefault();CHU.unlock(f.value)}else if(t=='keydown'&&e.key=='Escape'){e.preventDefault();f.blur()}},true));
{const f=openSet;openSet=function(){const r=f.apply(this,arguments);try{CHU.sync()}catch(_){}return r}}
CHU.sync();

// ---------------- 2. location box under the minimap ----------------
var V90L={k:"",gap:6};
function v90LocBuild(){const a=$('areaT'),lb=$('locBox');if(!a||!lb)return;lb.classList.add('v90');
  if(lb.querySelector('.v90l1')&&lb.dataset.v90===a.innerHTML)return;
  const c=a.cloneNode(true),rec=c.querySelector('.rec');
  if(rec)rec.remove();
  // " · " separated parts stay whole when a line has to wrap; the first part of line 1 is the place name (Cinzel)
  const parts=(h,first)=>'<span class="v90c'+(first?' v90n':'')+'">'+h.split(' · ').join('</span><span class="v90s"> · </span><span class="v90c">')+'</span>';
  const l1=c.innerHTML.replace(/\s+$/,'');let h='<span class="v90l1">'+parts(l1,1)+'</span>';
  if(rec){// the pieces add up to the same text as #areaT, so the v84 copy (textContent compare) leaves the box alone
    const t1=c.textContent.replace(/\s+$/,''),tail=a.textContent.slice(t1.length),rt=rec.textContent,lead=tail.slice(0,tail.length-rt.length)+(rt.match(/^\s*·\s*/)||[''])[0];
    const l2=rec.innerHTML.replace(/^\s*·\s*/,'').replace(/^(Rec:\s*)((?:companion|creature)\s+)/,'$1<span class="v90o">$2</span>');
    h+='<span class="v90l2"><span class="v90h">'+lead+'</span>'+parts(l2,0)+'</span>'}
  lb.innerHTML=h;lb.dataset.v90=a.innerHTML;lb.classList.remove('v90cut');v90Fit();V90L.k=''}
// each line shrinks a little to stay on one line (11 → 9.5px, 10 → 8.5px); line 2 then drops the word "companion";
// only then does a line wrap, between its " · " parts
function v90Fit(){const lb=$('locBox');if(!lb||lb.offsetParent===null)return;lb.classList.remove('v90cut');
  const fit=(e,mx,mn)=>{e.classList.remove('v90w');let z=mx;e.style.fontSize=z+'px';while(z>mn&&e.scrollWidth>e.clientWidth+1){z-=.5;e.style.fontSize=z+'px'}return e.scrollWidth<=e.clientWidth+1};
  const e1=lb.querySelector('.v90l1'),e2=lb.querySelector('.v90l2');
  if(e1&&!fit(e1,11,9.5)){e1.style.fontSize='10.5px';e1.classList.add('v90w')}
  if(e2&&!fit(e2,10,8.5)){if(e2.querySelector('.v90o')){lb.classList.add('v90cut');if(fit(e2,10,8.5))return}e2.style.fontSize='9.5px';e2.classList.add('v90w')}}
var V90_MOVE=['fsBtn','sysBtn','sysmenu','evtk'];
// short landscape phone (body.mob, stage under 520px tall): the touch buttons (#mbtn) fill the column under the minimap, so
// the box goes LEFT of the minimap on the top row, the fullscreen/menu buttons left of it, and the event tracker left of
// the touch buttons; the boss bar / target frame shift left and down a little (body.v90s CSS).
function v90Short(pr){return document.body.classList.contains('mob')&&pr.height<520&&pr.width>pr.height}
function v90Lay(force){const lb=$('locBox'),m=$('mini');if(!lb||!m)return;const P=lb.offsetParent;if(!P||m.offsetParent===null){return}
  const pr=P.getBoundingClientRect(),mr=m.getBoundingClientRect(),mb=$('mbtn'),br=mb&&mb.offsetParent?mb.getBoundingClientRect():null;
  const kq=document.body.classList.contains('kq')?4:0;  // the themed minimap has a 4px bronze ring outside its border
  const sh=v90Short(pr);document.body.classList.toggle('v90s',sh);
  const key=[sh,mr.left,mr.top,mr.width,mr.height,pr.width,pr.height,br?[br.left,br.top].join(','):'',lb.dataset.v90||'',document.body.className,V90_MOVE.map(id=>{const e=$(id);return e?(e.style.top?1:0)+(e.offsetParent?2:0):9}).join('')].join('|');
  if(!force&&key===V90L.k)return;V90L.k=key;
  const clr=e=>{e.style.top='';e.style.right=''};
  if(!sh){const L=Math.round(mr.left-pr.left-kq),W=Math.round(mr.width+2*kq),T=Math.round(mr.bottom-pr.top+kq+V90L.gap);
    Object.assign(lb.style,{left:L+'px',top:T+'px',width:W+'px',right:'auto',transform:'none'});v90Fit();
    const D=lb.offsetHeight+V90L.gap;
    V90_MOVE.forEach(id=>{const e=$(id);if(!e)return;clr(e);const t=parseFloat(getComputedStyle(e).top);if(!isFinite(t))return;e.style.top=Math.round(t+D)+'px'});return}
  const R=Math.round(mr.left-pr.left-kq-V90L.gap),W=Math.min(220,Math.round(pr.width*.27)),T=Math.round(mr.top-pr.top-kq);
  Object.assign(lb.style,{left:(R-W)+'px',top:T+'px',width:W+'px',right:'auto',transform:'none'});v90Fit();
  const fromR=x=>Math.round(pr.right-x)+'px',sy=$('sysBtn'),fs=$('fsBtn'),sm=$('sysmenu'),ev=$('evtk');let x=pr.left+R-W-V90L.gap;
  [sy,fs].forEach(e=>{if(!e)return;clr(e);e.style.top=T+'px';e.style.right=fromR(x);x-=(e.offsetWidth||38)+4});
  const rowB=T+Math.max(lb.offsetHeight,sy?sy.offsetHeight:0);
  if(sm){clr(sm);sm.style.top=(rowB+6)+'px';sm.style.right=fromR(pr.left+R-W-V90L.gap)}
  if(ev){clr(ev);ev.style.top=(rowB+8)+'px';ev.style.right=fromR(br?br.left-8:pr.left+R-W-V90L.gap)}}
{const f=hud;hud=function(){const r=f.apply(this,arguments);try{v90LocBuild();v90Lay()}catch(_){}return r}}
{const f=evUI;if(typeof f=='function')evUI=function(){const r=f.apply(this,arguments);try{v90Lay()}catch(_){}return r}}
addEventListener('resize',()=>setTimeout(()=>{try{v90Lay(true)}catch(_){}},60));
document.addEventListener('fullscreenchange',()=>setTimeout(()=>{try{v90Lay(true)}catch(_){}},120));
setInterval(()=>{try{v90LocBuild();v90Lay()}catch(_){}},700);
try{v90LocBuild();v90Lay(true)}catch(_){}
