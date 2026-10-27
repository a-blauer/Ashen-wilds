// ================= v158: UI size (desktop + mobile), phone layout for upright and sideways play, key binding settings =================
// Owner (Oct 27 2026): the mobile UI was far too large by default; fit it to phones held upright and sideways; add UI size
// options for desktop and mobile; let desktop players change their keys.
//
// 1. UI size. Each group of the interface is scaled with CSS zoom from a variable on <html>:
//      --kqHud   the HUD: companion panel, target / boss frames, location box, menu buttons, log, prompt, trackers, banners
//      --kqBar   the bottom bar (orbs, hotbar, XP): the HUD size, shrunk further when it would not fit (UI158.bar)
//      --kqMap   the minimap        --kqTouch  the joystick and touch buttons        --kqMenu  every window (.win)
//    Size = auto fit × the player's sliders (SET.ui158: all, hud, map, menu, touch; 1 = 100%). Auto fit (ui158Base):
//    mobile: the short side of the screen / 430 (0.62–1.3: a phone ≈ 0.85–0.95, a tablet 1.3); desktop: min(w/1280, h/760),
//    0.7–1 (a normal window keeps the old size). Windows use their own fit (ui158MenuBase). CSS zoom also scales px offsets,
//    so everything that is placed by script goes through ui158Pos (screen px ÷ the element's own zoom).
// 2. Phone layout (body.mob; body.kqP upright / body.kqL sideways): smaller pieces, the hotbar without the attack and dash
//    slots (the touch buttons do those; the dash charges show on the dash button), the touch buttons in an arc around the
//    big attack button, and ui158Lay() places everything so nothing overlaps: upright the bar spans the bottom (abilities in
//    two rows) with the joystick and buttons above it; sideways the joystick and buttons take the bottom corners and the bar
//    sits between them (one row; it shrinks, then drops the Power box, when the screen is narrow). Left-handed mode swaps
//    the joystick and the buttons. The location box / ☰ / fullscreen follow the minimap (replaces v90Lay, 1660).
// 3. Settings → Interface size (sliders, touch-button opacity, left-handed) and Settings → Keyboard (desktop): every action
//    with its key; click, press a new key; a key another action uses is swapped with it. Keys: KB158 (0005-v158-keymap.js).
//    Hotbar slots, the ☰ menu and the help line show the chosen keys.
var UI158={d:{all:1,hud:1,map:1,menu:1,touch:1,alpha:1,lh:0},last:{},bar:1,hold:null};
function ui158S(){return Object.assign({},UI158.d,(typeof SET!='undefined'&&SET.ui158)||{})}
function ui158Mob(){return document.body.classList.contains('mob')}
// (desktop: the browser window's size, the stage sits under the page title)
function ui158Base(W,H,mob){if(!mob){W=innerWidth;H=innerHeight}return mob?Math.max(.62,Math.min(1.3,Math.min(W,H)/430)):Math.max(.7,Math.min(1,Math.min(W/1280,H/760)))}
function ui158MenuBase(W,H,mob){if(!mob){W=innerWidth;H=innerHeight}return mob?Math.max(.62,Math.min(1.15,Math.min(W,H)/470)):Math.max(.75,Math.min(1,Math.min(W/1280,H/760)))}
function ui158Var(k,v){v=String(Math.round(v*1000)/1000);if(UI158.last[k]===v)return;UI158.last[k]=v;document.documentElement.style.setProperty(k,v)}
// the element's own zoom, measured (screen size ÷ layout size)
function ui158Z(e){if(!e)return 1;const w=e.offsetWidth;if(!w)return parseFloat(getComputedStyle(e).zoom)||1;const r=e.getBoundingClientRect().width;return r>0?r/w:1}
// set left/top/right/bottom/width/maxHeight in screen px (numbers) or raw strings; null clears
function ui158Pos(e,o){if(!e)return;const z=ui158Z(e);for(const k in o){const v=o[k];const s=v==null?'':typeof v=='number'?(Math.round(v/z*10)/10)+'px':v;if(e.style[k]!==s)e.style[k]=s}}
function ui158Vis(e){if(!e||e.classList.contains('hide'))return false;const r=e.getBoundingClientRect();return r.width>1&&r.height>1}
var UI158_HUD=['topl','tgt','boss','locBox','sysBtn','fsBtn','sysmenu','prompt','rcb','glog','pk','banner','strk','kqsTg','rv148r','ztc116','fishui',
  'ch157sL','ch157sR','mpBtnH','chqt132','mqt143','mqt152','ab152h','ch153h','ch153g','ab157al','evtk','fs160','dr170h','mpToast','btrk'];
var UI158_TRK=['chqt132','mqt143','mqt152','fs160','dr170h'];
document.head.insertAdjacentHTML('beforeend',`<style id="ui158css">
${UI158_HUD.map(i=>'#'+i).join(',')}{zoom:var(--kqHud,1)}
#bbar{zoom:var(--kqBar,1)}#mini{zoom:var(--kqMap,1)}#joy,#mbtn{zoom:var(--kqTouch,1)}
.modal .win,#hatch>div,#svp .svpw{zoom:var(--kqMenu,1)}
#ui158sa{position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)}
/* ---- phones and tablets (body.mob) ---- */
body.mob #topl{transform:none!important;left:8px;top:8px;zoom:calc(var(--kqHud,1)*.85)}
body.mob #mini{width:120px;height:90px;right:8px;top:8px}
body.mob #acts .hs[data-x=a],body.mob #acts .hs[data-x=d]{display:none}
body.mob .hs{width:44px;height:44px}body.mob .hs .ic{font-size:1.2rem}
body.mob #hot{padding:4px 6px}body.mob #acts{gap:4px;flex-wrap:nowrap;max-width:none;justify-content:center}
body.mob #bmid{width:auto!important;max-width:none}
body.mob .orb{width:56px;height:56px}body.mob .orb span{font-size:.62rem}
body.mob #bbar{gap:6px;bottom:6px}
body.mob #glog{width:240px;font-size:.68rem}
body.mob #prompt{font-size:.95rem;padding:9px 16px;white-space:nowrap}
body.mob #joy{width:116px;height:116px;left:14px;right:auto;bottom:14px}
body.mob #joy i{width:50px;height:50px;margin:-25px 0 0 -25px}
body.mob #mbtn{display:block;width:164px;height:164px;right:14px;left:auto;bottom:14px;pointer-events:none}
body.mob #mbtn button{position:absolute;width:50px;height:50px;font-size:1.15rem;pointer-events:auto;margin:0}
body.mob #mbtn [data-m=atk]{width:76px;height:76px;right:0;bottom:0;font-size:1.8rem}
body.mob #mbtn [data-m=dash]{right:113px;bottom:13px}
body.mob #mbtn [data-m=cmd]{right:100px;bottom:63px}
body.mob #mbtn [data-m=tgt]{right:63px;bottom:100px}
body.mob #mbtn [data-m=f]{right:13px;bottom:113px;font-size:.95rem}
body.mob #joy,body.mob #mbtn button{opacity:var(--kqTouchA,1)}
body.mob.kqLH #joy{left:auto;right:14px}
body.mob.kqLH #mbtn{right:auto;left:14px}
body.mob.kqLH #mbtn [data-m=atk]{right:auto;left:0}
body.mob.kqLH #mbtn [data-m=dash]{right:auto;left:113px}
body.mob.kqLH #mbtn [data-m=cmd]{right:auto;left:100px}
body.mob.kqLH #mbtn [data-m=tgt]{right:auto;left:63px}
body.mob.kqLH #mbtn [data-m=f]{right:auto;left:13px}
#mbtn .ui158c{position:absolute;right:-3px;bottom:-3px;min-width:16px;padding:0 3px;border-radius:8px;background:#1a110a;border:1px solid #a8742c;font:800 10px/14px system-ui,sans-serif;color:#f6d98a;pointer-events:none}
#mbtn .ui158c:empty{display:none}
#mbtn button.ui158cd{filter:grayscale(.7) brightness(.75)}
/* upright phone (no room for one row): abilities in rows of five, the Power box a thin strip above them */
body.mob.kqRows #hot{flex-direction:column;align-items:center}
body.mob.kqRows #acts{flex-wrap:wrap;width:236px;max-width:236px}
body.mob.kqRows #pwrB{flex-direction:row;align-items:center;justify-content:center;gap:6px;align-self:stretch;margin:0 0 4px;min-width:0;padding:1px 6px}
body.mob.kqRows #pwrB b{display:inline;font-size:.95rem}
body.mob.kqL.kqTight #pwrB{display:none}
/* the Settings window: preview the HUD while dragging a size slider */
#setw.ui158pv{background:rgba(5,3,2,.25)!important}#setw.ui158pv .win{opacity:.92}
body:not(.mob) .ui158mob,body.mob .ui158desk{display:none!important}
#kb158 summary{cursor:pointer;font-weight:700;padding:4px 0}
#kb158 .kbh{font:700 .66rem/1 Cinzel,Georgia,serif;letter-spacing:.14em;text-transform:uppercase;color:#c9a466;margin:10px 0 4px}
#kb158 .kbr{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:.8rem}
#kb158 .kbr button{min-width:84px;padding:4px 8px;font-weight:700}
#kb158 .kbr button.kbw{border-color:#f0cc72;color:#f0cc72;animation:kb158p 1s ease-in-out infinite}
#kb158 .kbr.kbc button{color:#9ae6b4}
@keyframes kb158p{50%{opacity:.55}}
#kb158 .kbn{font-size:.72rem;color:#f0cc72;min-height:1em;margin:6px 0}
</style>`);
document.body.insertAdjacentHTML('beforeend','<div id="ui158sa"></div>');
function ui158SA(){const e=$('ui158sa');if(!e)return {t:0,r:0,b:0,l:0};const c=getComputedStyle(e);return {t:parseFloat(c.paddingTop)||0,r:parseFloat(c.paddingRight)||0,b:parseFloat(c.paddingBottom)||0,l:parseFloat(c.paddingLeft)||0}}
// ---------- sizes ----------
function ui158Sizes(W,H,mob){const s=ui158S(),b=ui158Base(W,H,mob),cl=v=>Math.max(.4,Math.min(2.2,v));
  const hud=cl(b*s.all*s.hud);
  return {hud,map:cl(hud*s.map),touch:cl(b*s.all*s.touch),menu:Math.max(.5,Math.min(1.8,ui158MenuBase(W,H,mob)*s.all*s.menu)),alpha:Math.max(.25,Math.min(1,+s.alpha||1)),lh:!!s.lh}}
// ---------- layout ----------
function ui158Lay(force){const st=$('stage'),m=$('mini');if(!st||!m)return;
  const mob=ui158Mob(),pr=st.getBoundingClientRect(),W=pr.width,H=pr.height;if(W<50||H<50)return;
  const S=ui158Sizes(W,H,mob),land=W>H,bd=document.body;
  bd.classList.toggle('kqP',mob&&!land);bd.classList.toggle('kqL',mob&&land);bd.classList.toggle('kqLH',mob&&S.lh);bd.classList.remove('v90s');
  ui158Var('--kqHud',S.hud);ui158Var('--kqMap',S.map);ui158Var('--kqTouch',S.touch);ui158Var('--kqMenu',UI158.hold!=null?+UI158.hold:S.menu);ui158Var('--kqTouchA',S.alpha);
  if(m.offsetParent===null){ui158Var('--kqBar',S.hud);return}
  const sa=mob?ui158SA():{t:0,r:0,b:0,l:0},g=6*S.hud;
  const P=(e,o)=>ui158Pos(e,o),X=x=>x-pr.left,Y=y=>y-pr.top;   // stage-relative
  // the bottom bar: as big as the HUD unless it would not fit
  const bb=$('bbar'),joy=$('joy'),mb=$('mbtn');
  let bar=S.hud;if(!(bb&&bb.offsetWidth))ui158Var('--kqBar',bar);
  else{
    const natW=()=>bb.getBoundingClientRect().width/ui158Z(bb);
    let avail;
    // sideways: the bar sits centred in the room between the joystick and the touch buttons
    let cx=null;if(mob&&land){const jw=116*S.touch,mw=164*S.touch,e=14*S.touch,a=sa.l+e+(S.lh?mw:jw),b=sa.r+e+(S.lh?jw:mw);avail=W-a-b-24;cx=(a+W-b)/2}
    else avail=W-sa.l-sa.r-12;
    bd.classList.remove('kqTight');bd.classList.remove('kqRows');let nw=natW(),fit=avail/nw;
    if(mob&&!land&&fit<S.hud){bd.classList.add('kqRows');nw=natW();fit=avail/nw}
    if(mob&&land&&fit<S.hud*.85){bd.classList.add('kqTight');nw=natW();fit=avail/nw}
    bar=Math.max(.45,Math.min(S.hud,fit));ui158Var('--kqBar',bar);UI158.bar=bar;
    P(bb,{bottom:(mob?sa.b+6:8),left:cx==null?null:cx})}
  if(!mob){ui158Desk(pr,S,g);return}
  const br=bb&&bb.offsetWidth?bb.getBoundingClientRect():null,barH=br?pr.bottom-br.top:0;
  // corners
  P($('topl'),{left:sa.l+8,top:sa.t+8});P(m,{right:sa.r+8,top:sa.t+8});
  const tz=S.touch,edge=14*tz,lh=S.lh;
  const tB=land?sa.b+edge:barH+10*tz;
  if(joy)P(joy,lh?{right:sa.r+edge,left:'auto',bottom:tB}:{left:sa.l+edge,right:'auto',bottom:tB});
  if(mb)P(mb,lh?{left:sa.l+edge,right:'auto',bottom:tB}:{right:sa.r+edge,left:'auto',bottom:tB});
  const jr=joy&&joy.offsetWidth?joy.getBoundingClientRect():null,mr2=mb&&mb.offsetWidth?mb.getBoundingClientRect():null;
  const ctlTop=Math.min(jr?jr.top:pr.bottom,mr2?mr2.top:pr.bottom);
  // minimap column: location box + menu buttons
  const mr=m.getBoundingClientRect(),lb=$('locBox'),sy=$('sysBtn'),fs=$('fsBtn'),sm=$('sysmenu'),kq=document.body.classList.contains('kq')?4*S.map:0;
  let rowB;
  if(!land){
    if(lb){P(lb,{left:X(mr.left-kq),top:Y(mr.bottom+kq+g),width:mr.width+2*kq,right:'auto',transform:'none'});try{v90Fit()}catch(_){}}
    const lr=lb&&ui158Vis(lb)?lb.getBoundingClientRect():null,rt=lr?lr.bottom+g:mr.bottom+kq+g;
    let x=pr.right-(sa.r+8);[sy,fs].forEach(e=>{if(!e)return;const w=e.getBoundingClientRect().width||38*S.hud;P(e,{top:Y(rt),right:pr.right-x});x-=w+4*S.hud});
    rowB=rt+(sy?sy.getBoundingClientRect().height:38*S.hud);
  }else{
    const Wb=Math.min(220*S.hud,W*.26),Rb=mr.left-kq-g;
    if(lb){P(lb,{left:X(Rb-Wb),top:Y(mr.top-kq),width:Wb,right:'auto',transform:'none'});try{v90Fit()}catch(_){}}
    let x=Rb-Wb-g;[sy,fs].forEach(e=>{if(!e)return;const w=e.getBoundingClientRect().width||38*S.hud;P(e,{top:Y(mr.top-kq),right:pr.right-x});x-=w+4*S.hud});
    const lr=lb&&ui158Vis(lb)?lb.getBoundingClientRect():null;
    rowB=Math.max(mr.bottom+kq,lr?lr.bottom:0,sy?sy.getBoundingClientRect().bottom:0);
    UI158.rowL=x;UI158.rowB=Math.max(lr?lr.bottom:0,sy?sy.getBoundingClientRect().bottom:0,fs?fs.getBoundingClientRect().bottom:0);
  }
  if(sm)P(sm,{top:Y(rowB+g),right:pr.right-(sy?sy.getBoundingClientRect().right:pr.right-8),maxHeight:Math.max(120,(br?br.top:pr.bottom)-rowB-2*g)});
  // target frame / boss bar
  const tl=$('topl'),tlr=tl?tl.getBoundingClientRect():{bottom:pr.top+50,right:pr.left+180},bo=$('boss'),tg=$('tgt');
  if(!land){const L=sa.l+8,w=Math.max(160,mr.left-kq-g-pr.left-L);let top=Y(tlr.bottom+g);
    [bo,tg].forEach(e=>{if(!e)return;P(e,{left:L,top,width:w,transform:'none'});if(ui158Vis(e))top=Y(e.getBoundingClientRect().bottom+g)})}
  else{const w=Math.min(300*S.hud,W*.36),cx=pr.left+W/2,free=cx-w/2>tlr.right+g&&cx+w/2<UI158.rowL-g;
    let top=Y(free?pr.top+sa.t+8:Math.max(tlr.bottom,UI158.rowB)+g);
    [bo,tg].forEach(e=>{if(!e)return;P(e,{left:'50%',top,width:w,transform:'translateX(-50%)'});if(ui158Vis(e))top=Y(e.getBoundingClientRect().bottom+g)})}
  // interaction prompt, message log
  const pt=$('prompt'),gl=$('glog');
  let pB;if(land)pB=barH+g;else pB=pr.bottom-ctlTop+g;
  if(pt)P(pt,{bottom:pB});
  if(gl){if(land){const top=jr&&!lh?jr.top:(br?br.top:pr.bottom);P(gl,{left:sa.l+8,bottom:pr.bottom-top+g,width:Math.min(260*S.hud,W*.3)})}
    else{const pr2=pt&&ui158Vis(pt)?pt.getBoundingClientRect():null;P(gl,{left:sa.l+8,bottom:pr.bottom-(pr2?pr2.top:ctlTop)+g,width:Math.min(260*S.hud,W*.62)})}}
  // quest trackers: under the minimap column, stacked, never over the touch buttons
  let ty=land?mr.bottom+kq+g*1.5:rowB+g*1.5;const tmax=land?(mr2?mr2.top:pr.bottom)-g:(ctlTop-g);
  UI158_TRK.forEach(id=>{const e=$(id);if(!e)return;if(!ui158Vis(e)){return}
    P(e,{right:sa.r+8,top:ty,left:'auto',maxHeight:Math.max(40,tmax-ty),overflow:'hidden'});ty=e.getBoundingClientRect().bottom+g});
}
// desktop: the old v90 layout (location box under the minimap, ☰ / fullscreen / menu under it), zoom-aware
function ui158Desk(pr,S,g){const m=$('mini'),lb=$('locBox'),sy=$('sysBtn'),fs=$('fsBtn'),sm=$('sysmenu'),ev=$('evtk');
  const P=(e,o)=>ui158Pos(e,o),X=x=>x-pr.left,Y=y=>y-pr.top;
  // clear anything the phone layout set
  [['topl',['left','top']],['mini',['right','top']],['joy',['left','right','bottom']],['mbtn',['left','right','bottom']],['prompt',['bottom']],['glog',['left','bottom','width']],
   ['tgt',['left','top','width','transform']],['boss',['left','top','width','transform']]].forEach(([id,ks])=>{const e=$(id);if(e)ks.forEach(k=>{if(e.style[k])e.style[k]=''})});
  UI158_TRK.forEach(id=>{const e=$(id);if(e){['right','top','left','maxHeight','overflow'].forEach(k=>{if(e.style[k])e.style[k]=''})}});
  const mr=m.getBoundingClientRect(),kq=document.body.classList.contains('kq')?4*S.map:0;
  if(lb){P(lb,{left:X(mr.left-kq),top:Y(mr.bottom+kq+g),width:mr.width+2*kq,right:'auto',transform:'none'});try{v90Fit()}catch(_){}}
  const lr=lb&&ui158Vis(lb)?lb.getBoundingClientRect():null,rt=(lr?lr.bottom:mr.bottom+kq)+g;
  let x=pr.right-10*S.hud;[sy,fs].forEach(e=>{if(!e)return;const w=e.getBoundingClientRect().width||42*S.hud;P(e,{top:Y(rt),right:pr.right-x});x-=w+6*S.hud});
  const rowB=rt+(sy?sy.getBoundingClientRect().height:42*S.hud);
  if(sm)P(sm,{top:Y(rowB+g),right:10*S.hud,maxHeight:null});
  if(ev)P(ev,{top:Y(rowB+g),right:null})}
// v90Lay (1660) is replaced: its job is part of ui158Lay
v90Lay=function(force){try{ui158Lay(force)}catch(_){}};
{let q=0;const later=()=>{if(q)return;q=1;setTimeout(()=>{q=0;try{ui158Lay(true)}catch(_){}},80)};
  addEventListener('resize',later);addEventListener('orientationchange',()=>{later();setTimeout(later,400)});document.addEventListener('fullscreenchange',later);
  if(window.visualViewport)visualViewport.addEventListener('resize',later)}
setInterval(()=>{try{ui158Lay()}catch(_){}},400);
{const f=applyDev;applyDev=function(){const r=f.apply(this,arguments);setTimeout(()=>{try{ui158Lay(true);ui158Sync()}catch(_){}},70);return r}}
// the dash button shows the dash charges (the hotbar's dash slot is hidden on phones)
setInterval(()=>{try{if(!ui158Mob())return;const d=document.querySelector('#acts .hs[data-x=d]'),b=document.querySelector('#mbtn [data-m=dash]');if(!b)return;
  let c=b.querySelector('.ui158c');if(!c){c=document.createElement('span');c.className='ui158c';b.appendChild(c)}
  const t=d?(d.querySelector('.sb')||{}).textContent||'':'';if(c.textContent!==t)c.textContent=t;b.classList.toggle('ui158cd',!!(d&&d.disabled))}catch(_){}},250);
// ---------- Settings → Interface size ----------
var UI158_ROWS=[['all','Overall size','',.5,1.6],['hud','HUD (bars, hotbar, frames)','',.5,1.6],['map','Minimap','',.5,2],['menu','Menus and windows','',.5,1.6],
  ['touch','Touch controls','ui158mob',.5,1.6],['alpha','Touch controls opacity','ui158mob',.25,1]];
{const row=$('s_dev')&&$('s_dev').closest('.setr');
  const h='<div class="setg">Interface size</div><span class="mut" style="font-size:.74rem">100% fits your screen automatically. Drag a slider to see the game behind this window.</span>'+
    UI158_ROWS.map(r=>`<label class="setr ${r[2]}"><span>${r[1]} <b id="sv158_${r[0]}"></b></span><input type="range" id="s158_${r[0]}" min="${r[3]}" max="${r[4]}" step="0.05"></label>`).join('')+
    '<label class="setc ui158mob"><input type="checkbox" id="s158_lh"> Left-handed (joystick on the right)</label>'+
    '<button id="s158_reset" style="justify-self:start">Reset interface size</button>'+
    '<div class="setg ui158desk">Keyboard</div><div class="ui158desk" id="kb158w"></div>';
  if(row)row.insertAdjacentHTML('afterend',h)}
function ui158Sync(){const s=ui158S();UI158_ROWS.forEach(r=>{const i=$('s158_'+r[0]),v=$('sv158_'+r[0]);if(!i)return;if(document.activeElement!==i)i.value=s[r[0]];if(v)v.textContent=Math.round(s[r[0]]*100)+'%'});
  const lh=$('s158_lh');if(lh)lh.checked=!!s.lh;kb158Render()}
function ui158Set(k,v){SET.ui158=Object.assign({},ui158S(),{[k]:v});saveSet();ui158Lay(true);const o=$('sv158_'+k);if(o&&typeof v=='number')o.textContent=Math.round(v*100)+'%'}
UI158_ROWS.forEach(r=>{const i=$('s158_'+r[0]);if(!i)return;
  // the window's own size changes when the slider is let go (it would move under the finger); the rest change while dragging
  // (UI158.hold keeps the windows' size while a slider is held)
  i.addEventListener('input',()=>{if(r[0]=='menu'&&UI158.hold!=null){const o=$('sv158_menu');if(o)o.textContent=Math.round(i.value*100)+'%';return}ui158Set(r[0],+i.value)});
  i.addEventListener('change',()=>{UI158.hold=null;ui158Set(r[0],+i.value);$('setw').classList.remove('ui158pv')});
  i.addEventListener('pointerdown',()=>{UI158.hold=UI158.last['--kqMenu']||null;if(r[0]!='menu')$('setw').classList.add('ui158pv')});
  ['pointerup','pointercancel','blur'].forEach(ev=>i.addEventListener(ev,()=>{$('setw').classList.remove('ui158pv');setTimeout(()=>{if(UI158.hold!=null){UI158.hold=null;ui158Set(r[0],+i.value)}},60)}))});
if($('s158_lh'))$('s158_lh').onchange=e=>ui158Set('lh',e.target.checked?1:0);
if($('s158_reset'))$('s158_reset').onclick=()=>{SET.ui158=Object.assign({},UI158.d);saveSet();ui158Lay(true);ui158Sync()};
if($('s_reset'))$('s_reset').addEventListener('click',()=>{SET.ui158=Object.assign({},UI158.d);delete SET.keys;saveSet();kb158Apply();ui158Lay(true);ui158Sync()});
{const f=openSet;openSet=function(){const r=f.apply(this,arguments);try{ui158Sync()}catch(_){}return r}}
// ---------- Settings → Keyboard ----------
var KB158W={open:false,wait:null,note:''};
function kb158Render(){const w=$('kb158w');if(!w)return;const K=SET.keys||{},groups=[];KB158.A.forEach(a=>{if(!groups.includes(a[3]))groups.push(a[3])});
  let h=`<details id="kb158"${KB158W.open?' open':''}><summary>Change key bindings</summary><div class="kbn" id="kb158n">${KB158W.note||'Click a key, then press the new key (Esc cancels). A key that is already used swaps places.'}</div>`;
  groups.forEach(gn=>{h+=`<div class="kbh">${gn}</div>`;KB158.A.filter(a=>a[3]==gn).forEach(a=>{const b=kb158Get(a[0]),ch=b!==a[2];
    h+=`<div class="kbr${ch?' kbc':''}"><span>${a[1]}</span><button data-kb="${a[0]}" class="${KB158W.wait==a[0]?'kbw':''}" title="${ch?'Default: '+kb158Label(a[2]):''}">${KB158W.wait==a[0]?'Press a key…':kb158Label(b)}</button></div>`})});
  h+='<div class="kbh"></div><span class="mut" style="font-size:.72rem">Left click attacks, right click turns mouse-look on or off and Esc closes windows; those stay as they are.</span><br><button id="kb158r" style="margin-top:8px">Reset all keys</button></details>';
  w.innerHTML=h;const d=$('kb158');d.addEventListener('toggle',()=>{KB158W.open=d.open})}
function kb158Apply(){kb158Build(SET.keys||{});try{for(const k in K)K[k]=0}catch(_){}try{kb158Labels()}catch(_){}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#kb158 [data-kb]');
  if(b){e.preventDefault();const id=b.dataset.kb;if(KB158W.wait==id){KB158W.wait=null;KB158.cap=null;KB158W.note='';kb158Render();return}
    KB158W.wait=id;KB158W.note='';kb158Render();
    KB158.cap=k=>{KB158W.wait=null;
      if(k=='escape'||KB158_BAD[k]){KB158W.note=k=='escape'?'':'That key can’t be used.';kb158Render();return}
      const A=KB158.A.find(a=>a[0]==id),old=kb158Get(id),keys=Object.assign({},SET.keys||{});
      // swap with the action that already has this key (actions of another context may share it)
      const other=KB158.A.find(a=>a[0]!=id&&kb158Get(a[0])===k&&!!a[4]===!!A[4]);
      keys[id]=k;if(other){keys[other[0]]=old;KB158W.note='Swapped: '+other[1]+' is now '+kb158Label(old)+'.'}else KB158W.note=A[1]+' is now '+kb158Label(k)+'.';
      KB158.A.forEach(a=>{if(keys[a[0]]===a[2])delete keys[a[0]]});
      SET.keys=keys;saveSet();kb158Apply();kb158Render()};
    return}
  if(e.target.id=='kb158r'){SET.keys={};saveSet();kb158Apply();KB158W.note='All keys are back to their defaults.';kb158Render()}});
// closing Settings stops waiting for a key
setInterval(()=>{if(KB158.cap&&$('setw').classList.contains('hide')){KB158.cap=null;KB158W.wait=null}},300);
// ---------- the chosen keys on the hotbar, the ☰ menu and the help line ----------
function kb158Lbl(def){const a=KB158.A.find(x=>x[2]===def&&!x[4]);return a?kb158Label(kb158Get(a[0])):null}
function kb158Fix(el,attr){if(!el)return;const o=el.dataset.kb0||(el.dataset.kb0=el.textContent.trim());const d=o.toLowerCase()=='space'?' ':o.toLowerCase();const n=kb158Lbl(d);const t=n||o;if(el.textContent!==t)el.textContent=t}
function kb158Labels(){
  document.querySelectorAll('#acts .hs .kb').forEach(s=>{const b=s.closest('.hs'),x=b&&b.dataset.x||'';let d=null;
    if(/^E?\d$/.test(x))d=String(+x.replace('E','')+1);else d={d:'shift',p:'z',z:'x',v:'v'}[x];
    const t=d?kb158Lbl(d):null;const want=t||s.dataset.kb0||s.textContent;if(!s.dataset.kb0)s.dataset.kb0=s.textContent;if(s.textContent!==want)s.textContent=want;
    if(b&&t&&b.title){const nt=b.title.replace(/\((?:[^()]{1,9})\)\s*$/,'('+t+')');if(nt!==b.title)b.title=nt}});
  document.querySelectorAll('#sysmenu kbd').forEach(k=>kb158Fix(k));
  const sb=$('sysBtn');if(sb){const t=kb158Lbl('m')||'M';sb.title='Menu ('+t+')'}
  const sub=document.querySelector('.wrap>.sub');if(sub){if(!sub.dataset.kb0)sub.dataset.kb0=sub.innerHTML;
    if(!KB158.on){if(sub.innerHTML!==sub.dataset.kb0)sub.innerHTML=sub.dataset.kb0}
    else{const L=id=>kb158Label(kb158Get(id));
      sub.textContent=`${L('up')}${L('left')}${L('down')}${L('right')} move · Right click turns mouse-look on / off · Left click attack · ${['a1','a2','a3','a4','a5','a6'].map(L).join(' ')} abilities · ${L('dash')} dash · ${L('cmd')} command companions · ${L('tgt')} target · ${L('char')} character · ${L('abil')} abilities · ${L('king')} kingdom · ${L('feed')} feed companion · ${L('hp')} / ${L('mp')} potions · ${L('emp1')} / ${L('emp2')} empower · ${L('act')} interact · ${L('inv')} inventory · ${L('comp')} companions · ${L('eggs')} eggs · ${L('menu')} menu · ${L('recall')} recall · ${L('set')} settings · ${L('coop')} co-op · ${L('mount')} mount · Mouse wheel zoom · keys can be changed in Settings`}}}
{const a=$('acts');if(a)new MutationObserver(()=>{if(KB158.on)try{kb158Labels()}catch(_){}}).observe(a,{childList:true})}
setTimeout(()=>{try{kb158Labels()}catch(_){}},0);
try{ui158Lay(true)}catch(_){}
