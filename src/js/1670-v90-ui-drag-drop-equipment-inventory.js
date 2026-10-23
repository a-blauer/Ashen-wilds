// ================= v90 ui: drag & drop equipment in the inventory (I) =================
// Drag a gear item from the bag grid (.kqm-bagg) onto its paper-doll slot (or onto the hero picture) to equip it; drag a worn
// item from the paper doll onto the bag side to take it off. Equipping/unequipping goes through the game's own invAct(),
// so stats, models, class and level rules are the same as double-click. Wrong slot / class / level: red flash + a message.
// Pointer events, so mouse and touch both work: with a mouse the drag starts after moving 6px with the button held (a plain
// click still selects, double-click still equips); on touch it starts after a 0.38s long-press (a tap still selects, a
// swipe still scrolls). A ghost with the item's icon follows the pointer, the matching slot glows, the tooltip is hidden.
// The game has one ring slot, so a ring goes there.
var V90D={on:false,p:null,src:null,it:null,from:'',ghost:null,tm:0,x0:0,y0:0,noClick:0,ok:false,hl:[]};
document.head.insertAdjacentHTML('beforeend',`<style id="v90dcss">
#bag .kqm-bagg .kqm-it,#bag .kqm-doll .kqm-it{touch-action:pan-y;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
#bag .kqm-it img{-webkit-user-drag:none;user-drag:none}
.v90-ghost{position:fixed;z-index:80;width:54px;height:54px;margin:-27px 0 0 -27px;pointer-events:none;display:flex;align-items:center;justify-content:center;
  border:1px solid var(--rc,#c9a24a);border-radius:6px;background:rgba(16,12,10,.9);box-shadow:0 0 0 1px #000,0 8px 22px rgba(0,0,0,.75),inset 0 0 14px -4px var(--rc,#c9a24a);
  transform:scale(1.08) rotate(-4deg);opacity:.95}
.v90-ghost .kqm-ic{font-size:1.6rem;line-height:1}.v90-ghost img{width:100%;height:100%;object-fit:contain;border-radius:5px}
.v90-ghost.bad{border-color:#f87171;box-shadow:0 0 0 1px #000,0 0 14px #f87171}
#bag .kqm-slot.v90-src{opacity:.35;outline:1px dashed rgba(255,255,255,.4)}
#bag .kqm-slot.v90-ok{outline:2px solid #6ee7b7!important;outline-offset:1px;box-shadow:0 0 14px rgba(110,231,183,.55),inset 0 0 14px rgba(110,231,183,.3);animation:v90Glow 1s ease-in-out infinite}
#bag .kqm-slot.v90-no{outline:2px dashed #f87171!important;outline-offset:1px}
#bag .kqm-slot.v90-ok.v90-over{background:rgba(110,231,183,.25);transform:scale(1.06)}
#bag .v90-binz{outline:2px dashed #6ee7b7;outline-offset:2px;border-radius:6px}
#bag .v90-binz.v90-over{background:rgba(110,231,183,.08)}
#bag .kqm-slot.v90-flash,#bag .v90-flash{animation:v90Red .55s ease-out 2}
@keyframes v90Glow{50%{box-shadow:0 0 22px rgba(110,231,183,.8),inset 0 0 18px rgba(110,231,183,.45)}}
@keyframes v90Red{0%{box-shadow:0 0 0 2px #f87171,0 0 22px #f87171;background:rgba(248,113,113,.45)}100%{box-shadow:none}}
#bag .kqm-slot.v90-press{transform:scale(.92);transition:transform .3s}
body.v90drag,body.v90drag *{cursor:grabbing!important;-webkit-user-select:none!important;user-select:none!important}
</style>`);
function v90Item(el){const k=el.dataset.k,id=+el.dataset.id;return k=='e'?SLOTS.map(s=>eq[s]).find(x=>x&&x.id==id):gear.find(x=>x.id==id)}
// the paper-doll element for a slot (worn tile or the empty placeholder)
function v90DollEl(sl){const d=document.querySelector('#bag .kqm-doll');if(!d)return null;const e=d.querySelector('[data-kqs="'+sl+'"]');if(e)return e;
  const it=eq[sl];return it?d.querySelector('.kqm-it[data-k="e"][data-id="'+it.id+'"]'):null}
function v90SlotOf(el){if(!el)return null;if(el.dataset.kqs)return el.dataset.kqs;if(el.dataset.k=='e'){const id=+el.dataset.id;return SLOTS.find(s=>eq[s]&&eq[s].id==id)||null}return null}
function v90Why(it){const t=itT(it);if(!fitsCls(t,hero.cls)||(t.sl=='offhand'&&hero.cls!='paladin'))return 'Your class can’t use that.';if(hero.lvl<it.req)return 'You need level '+it.req+' to use that.';if(!canUse(it))return 'You can’t use that.';return ''}
function v90Flash(el,msg){if(el){el.classList.remove('v90-flash');void el.offsetWidth;el.classList.add('v90-flash');setTimeout(()=>el.classList.remove('v90-flash'),1200)}
  if(msg)say('<span style="color:#f87171">✖ '+msg+'</span>')}
function v90Under(x,y){const g=V90D.ghost;if(g)g.style.display='none';const el=document.elementFromPoint(x,y);if(g)g.style.display='';return el}
// where would a drop at (x,y) go?  {kind:'slot',sl,el} | {kind:'hero',el} | {kind:'bag',el} | null
function v90Target(x,y){const el=v90Under(x,y);if(!el||!el.closest||!el.closest('#bag'))return null;
  const d=el.closest('.kqm-doll .kqm-slot');if(d){const sl=v90SlotOf(d);return sl?{kind:'slot',sl,el:d}:null}
  if(el.closest('#hv'))return {kind:'hero',el:$('hv')};
  const r=el.closest('.kqm-right');if(r)return {kind:'bag',el:r.querySelector('.kqm-bagg')||$('bl')||r};
  return null}
function v90Clear(){V90D.hl.forEach(e=>e.classList.remove('v90-ok','v90-no','v90-over','v90-binz'));V90D.hl=[];
  document.querySelectorAll('#bag .v90-src,#bag .v90-press').forEach(e=>e.classList.remove('v90-src','v90-press'))}
function v90Start(){let el=V90D.src;const it=V90D.it;if(!it)return v90End();
  // the bag may have re-rendered since the press: find the same item's tile again
  if(!el||!el.isConnected)el=V90D.src=document.querySelector(V90D.sel);if(!el)return v90End();try{getSelection().removeAllRanges()}catch(_){}
  V90D.on=true;V90D.from=el.dataset.k;try{kqmTipHide()}catch(_){}clearTimeout(V90D.tm);
  const g=document.createElement('div');g.className='v90-ghost';g.style.setProperty('--rc',RAR[it.r][1]);const ic=el.querySelector('.kqm-ic');g.innerHTML=ic?ic.outerHTML:'';
  document.body.appendChild(g);V90D.ghost=g;el.classList.remove('v90-press');el.classList.add('v90-src');document.body.classList.add('v90drag');
  if(V90D.from=='g'){const sl=itT(it).sl,t=v90DollEl(sl),ok=!v90Why(it);V90D.ok=ok;if(t){t.classList.add(ok?'v90-ok':'v90-no');V90D.hl.push(t)}}
  else{const b=document.querySelector('#bag .kqm-bagg')||$('bl');V90D.ok=true;if(b){b.classList.add('v90-binz');V90D.hl.push(b)}}
  try{navigator.vibrate&&V90D.p&&V90D.p.t=='touch'&&navigator.vibrate(12)}catch(_){}
  v90Move(V90D.x,V90D.y)}
function v90Move(x,y){const g=V90D.ghost;if(!g)return;g.style.left=x+'px';g.style.top=y+'px';
  const T=v90Target(x,y);V90D.hl.forEach(e=>e.classList.remove('v90-over'));let bad=false;
  if(T){if(V90D.from=='g'&&(T.kind=='slot'||T.kind=='hero')){const sl=itT(V90D.it).sl,ts=T.kind=='slot'&&sl=='ring'&&T.sl=='ring2'?'ring2':sl;if(T.kind=='slot'&&T.sl!=ts)bad=true;else{if(!V90D.ok)bad=true;const t=v90DollEl(T.kind=='slot'?ts:eqSlot135(V90D.it));if(t)t.classList.add('v90-over')}}
    else if(V90D.from=='e'&&T.kind=='bag')T.el.classList.add('v90-over')}
  g.classList.toggle('bad',bad)}
function v90Drop(x,y){const it=V90D.it,T=v90Target(x,y);if(!T||!it)return;
  if(V90D.from=='g'){if(T.kind!='slot'&&T.kind!='hero')return;const sl=itT(it).sl;
    if(T.kind=='slot'&&sl=='ring'&&(T.sl=='ring'||T.sl=='ring2'))RING135.to=T.sl;   // v135: a ring dropped on either ring slot goes there
    if(T.kind=='slot'&&T.sl!=sl&&RING135.to!==T.sl){v90Flash(T.el,'That goes in the '+SLOTN[sl]+' slot, not '+SLOTN[T.sl]+'.');return}
    const why=v90Why(it);if(why){RING135.to=null;v90Flash(T.kind=='slot'?T.el:v90DollEl(sl)||T.el,why);return}
    if(!gear.includes(it)){RING135.to=null;return}selI={k:'g',id:it.id};try{invAct()}finally{RING135.to=null}try{sfx('chime')}catch(_){}return}
  if(V90D.from=='e'&&T.kind=='bag'){if(!SLOTS.some(s=>eq[s]===it))return;
    if(typeof BAG_MAX!='undefined'&&gear.length>=BAG_MAX){v90Flash(T.el,'Your bag is full.');return}
    selI={k:'e',id:it.id};invAct()}}
function v90End(){clearTimeout(V90D.tm);if(V90D.ghost)V90D.ghost.remove();V90D.ghost=null;v90Clear();document.body.classList.remove('v90drag');
  V90D.on=false;V90D.p=null;V90D.src=null;V90D.it=null}
// --- pointer handling ---
$('bag').addEventListener('pointerdown',e=>{if(V90D.p||(e.pointerType=='mouse'&&e.button!==0))return;
  const el=e.target.closest&&e.target.closest('.kqm-bagg .kqm-it[data-k="g"],.kqm-doll .kqm-it[data-k="e"]');if(!el)return;const it=v90Item(el);if(!it)return;
  V90D.p={id:e.pointerId,t:e.pointerType};V90D.src=el;V90D.it=it;V90D.sel=(el.dataset.k=='e'?'#bag .kqm-doll':'#bag .kqm-bagg')+' .kqm-it[data-k="'+el.dataset.k+'"][data-id="'+el.dataset.id+'"]';V90D.t0=e.timeStamp;V90D.x0=V90D.x=e.clientX;V90D.y0=V90D.y=e.clientY;
  if(e.pointerType!='mouse'){el.classList.add('v90-press');V90D.tm=setTimeout(v90Start,380)}});
addEventListener('pointermove',e=>{const P=V90D.p;if(!P||e.pointerId!==P.id)return;V90D.x=e.clientX;V90D.y=e.clientY;const d=Math.hypot(e.clientX-V90D.x0,e.clientY-V90D.y0);
  // touch: moving away before the long-press time is a swipe (checked by event time, so a busy frame can't turn it into a drag)
  if(P.t!='mouse'&&d>9&&e.timeStamp-V90D.t0<370){v90End();return}
  if(!V90D.on){if(P.t=='mouse'){if(d>6)v90Start()}else if(d>9){v90End()}return}
  e.preventDefault();v90Move(e.clientX,e.clientY)},{passive:false});
addEventListener('pointerup',e=>{const P=V90D.p;if(!P||e.pointerId!==P.id)return;if(V90D.on){e.preventDefault();V90D.noClick=performance.now();try{v90Drop(e.clientX,e.clientY)}catch(err){console.warn('v90 drop',err)}}v90End()},true);
addEventListener('pointercancel',e=>{const P=V90D.p;if(P&&e.pointerId===P.id)v90End()},true);
// touch: once the long-press drag has started, the finger must not scroll the bag (and no context menu / text selection)
addEventListener('touchmove',e=>{if(V90D.on)e.preventDefault()},{passive:false,capture:true});
addEventListener('contextmenu',e=>{if(V90D.on||(V90D.p&&V90D.p.t!='mouse'))e.preventDefault()},true);
document.addEventListener('selectstart',e=>{if(V90D.p)e.preventDefault()},true);
$('bag').addEventListener('dragstart',e=>{if(e.target.closest&&e.target.closest('.kqm-slot'))e.preventDefault()},true);
// the click that follows a drop must not select / equip anything; no tooltips while dragging
addEventListener('click',e=>{if(performance.now()-V90D.noClick<350){V90D.noClick=0;e.stopImmediatePropagation();e.preventDefault()}},true);
['mouseover','mousemove'].forEach(t=>addEventListener(t,e=>{if(V90D.on){e.stopImmediatePropagation();try{kqmTipHide()}catch(_){}}},true));
addEventListener('keydown',e=>{if(V90D.on&&e.key=='Escape'){e.stopImmediatePropagation();v90End()}},true);
// the window closing or re-rendering mid-drag ends it cleanly
new MutationObserver(()=>{if(V90D.p&&$('bag').classList.contains('hide'))v90End()}).observe($('bag'),{attributes:true,attributeFilter:['class']});
{const f=rB0;rB0=function(){const r=f.apply(this,arguments);try{if(V90D.on){const sl=V90D.from=='g'?itT(V90D.it).sl:null;v90Clear();
  if(sl){const t=v90DollEl(sl);if(t){t.classList.add(V90D.ok?'v90-ok':'v90-no');V90D.hl.push(t)}}else{const b=document.querySelector('#bag .kqm-bagg')||$('bl');if(b){b.classList.add('v90-binz');V90D.hl.push(b)}}}}catch(_){}return r}}

