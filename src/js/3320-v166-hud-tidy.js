// ===================== v166: HUD tidy-up (owner's list) =====================
// 1. The target frame no longer jumps on phones. Two pieces of code both moved it: the v161 layout (ui161Lay, every 0.4 s) set its
//    `top`, and bfxTgtCls (1100, run on every HUD update) cleared `top` whenever no den fight was on — so the frame flicked between
//    two heights several times a second. Now the layout is the only code that places the frame: bfxTgtCls just sets the class, and
//    on desktop the den-fight spot under the boss bar is part of ui161Desk.
//    The layout also measured each element's zoom as (screen width ÷ offsetWidth); offsetWidth is a whole number, so the result
//    wobbled and every 0.4 s nudged frames by a fraction of a pixel (the target frame and the message log shook). ui161Z now snaps to
//    the zoom the stylesheet gives (the product of the element's and its parents' CSS zoom) when the measurement agrees with it.
// 2. The plate above the hotbar (level · class · gold · point chips) is gone: gold shows in the Inventory's title bar, level in the
//    Character window and the XP bar. Timed buffs and the other small chips move under the companion panel (top left). Unspent
//    attribute / ability points show as a small glowing ✦ badge on the ☰ menu button, and on Character / Abilities in that menu.
// 3. The "👥 Co-op" pill at the top of the screen is gone; co-op is in the ☰ menu (and Y).
document.head.insertAdjacentHTML('beforeend',`<style id="v166css">
#chInfo{display:none!important}
#mpBtnH,#mpBtnH.on{display:none!important}
#bf166{pointer-events:auto;margin-top:4px}
#bf166 #buffs{display:flex;flex-wrap:wrap;gap:4px;margin:0;font-size:.7rem;font-weight:700;max-width:230px}
#bf166 #buffs:empty{display:none}
#pt166{position:absolute;top:-5px;right:-5px;min-width:15px;height:15px;padding:0 3px;box-sizing:border-box;border-radius:8px;
  background:radial-gradient(circle at 40% 35%,#ffe9a0,#e0a530 60%,#9a6414);color:#2a1606;font:900 10px/15px Georgia,serif;text-align:center;
  box-shadow:0 0 0 1px #000,0 0 6px 2px #f0c040aa;pointer-events:none;animation:pt166p 1.6s ease-in-out infinite}
#pt166.hide{display:none}
@keyframes pt166p{0%,100%{box-shadow:0 0 0 1px #000,0 0 4px 1px #f0c04088}50%{box-shadow:0 0 0 1px #000,0 0 10px 4px #f0c040dd}}
#sysmenu .pt166m{display:inline-block;margin-left:6px;padding:0 5px;border-radius:7px;background:#e0a530;color:#2a1606;font:900 .68rem/1.35 Georgia,serif}
#gold166{margin-left:auto;margin-right:10px;font-weight:700;font-size:.9rem;color:var(--kq-gold2,#f0cc72);white-space:nowrap}
</style>`);

// ---------- 1. the target frame has one owner ----------
// zoom: snap to the stylesheet's zoom when the measured ratio is within 2% of it (it only differs by offsetWidth's rounding)
function ui166CssZoom(e){let z=1;for(let q=e;q&&q.nodeType===1;q=q.parentElement){const v=parseFloat(getComputedStyle(q).zoom);if(v>0)z*=v}return z}
{const f=ui161Z;ui161Z=function(e){const m=f.apply(this,arguments);if(!e)return m;try{const c=ui166CssZoom(e);if(Math.abs(m-c)<=c*.02)return c}catch(_){}return m}}
// bfxTgtCls (1100) only sets the class now; when the class changes the layout runs at once
bfxTgtCls=function(){const t=tgt,on=!!(t&&!t.boss&&!t.dead&&AF&&AF.f),bd=document.body;
  if(bd.classList.contains('bfxT')!==on){bd.classList.toggle('bfxT',on);try{ui161Lay(true)}catch(_){}}};
// desktop: in a den fight a non-boss target sits just below the boss bar (the job bfxTgtCls used to do)
{const f=ui161Desk;ui161Desk=function(pr,S,g){const r=f.apply(this,arguments);try{const el=$('tgt'),bo=$('boss');
    if(el&&document.body.classList.contains('bfxT')&&bo&&ui161Vis(bo)){const op=(el.offsetParent||el.parentElement||document.body).getBoundingClientRect();
      ui161Pos(el,{top:bo.getBoundingClientRect().bottom-op.top+6})}}catch(_){}return r}}

// ---------- 2. no level / gold plate; buffs under the companion panel; points badge ----------
{const T=$('topl'),B=$('buffs');if(T&&B){const w=document.createElement('div');w.id='bf166';w.appendChild(B);T.appendChild(w)}}
{const sb=$('sysBtn');if(sb&&!$('pt166'))sb.insertAdjacentHTML('beforeend','<span id="pt166" class="hide">✦</span>')}
{const h=document.querySelector('#bag .wh h2');if(h&&!$('gold166'))h.insertAdjacentHTML('afterend','<span id="gold166" title="Gold"></span>')}
function pt166Sync(){let a=0,b=0;try{a=tpFree()|0}catch(_){}try{b=apFree()|0}catch(_){}
  const n=a+b,bd=$('pt166');
  if(bd){const tx=n>9?'9+':n?String(n):'';if(bd.textContent!==tx)bd.textContent=tx;bd.classList.toggle('hide',!n)}
  const mark=(id,k)=>{const btn=$(id);if(!btn)return;let s=btn.querySelector('.pt166m');
    if(!k){if(s)s.remove();return}if(!s){s=document.createElement('span');s.className='pt166m';const kb=btn.querySelector('kbd');btn.insertBefore(s,kb||null)}
    const tx='✦ '+k;if(s.textContent!==tx)s.textContent=tx};
  mark('talBtn',a);mark('abBtn',b)}
function gold166Sync(){const g=$('gold166');if(!g)return;const tx='🪙 '+(typeof gold=='number'?gold.toLocaleString():gold);if(g.textContent!==tx)g.textContent=tx}
{const f=hud;hud=function(){const r=f.apply(this,arguments);
  try{const B=$('buffs');if(B)B.querySelectorAll('.tpn,.kqs-apn').forEach(q=>q.remove())}catch(_){}
  try{pt166Sync()}catch(_){}try{if(!$('bag').classList.contains('hide'))gold166Sync()}catch(_){}return r}}
{const f=rB;rB=function(){const r=f.apply(this,arguments);try{gold166Sync()}catch(_){}return r}}
try{pt166Sync();gold166Sync()}catch(_){}

// ---------- 4. the ☰ menu sits above the touch buttons ----------
// #mbtn / #joy (z-index 3, outside #stage) were drawn over the open menu (inside #stage), and a tap on a menu entry under them
// pressed the button instead. While the menu is open they fade and let taps through.
document.head.insertAdjacentHTML('beforeend','<style>body.sm166 #mbtn,body.sm166 #joy{opacity:.18!important}body.sm166 #mbtn,body.sm166 #mbtn *,body.sm166 #joy,body.sm166 #joy *{pointer-events:none!important}</style>');
{const sm=$('sysmenu');if(sm){const s=()=>document.body.classList.toggle('sm166',!sm.classList.contains('hide'));new MutationObserver(s).observe(sm,{attributes:true,attributeFilter:['class']});s()}}
