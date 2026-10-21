// ================= v94: creator track — hero look, character creator step, barber =================
// hero.look = {skin, hair, hairStyle, face, eye, build, height, sex} (saved with the hero; old saves have none and get
// their class's default look, which is exactly how heroes looked before v94). heroLook(h) always returns a full look.
//   hairStyle 0 short · 1 long · 2 top-knot · 3 spiky · 4 ponytail · 5 shaved
//   face      0 none · 1 stubble · 2 short beard · 3 long beard · 4 moustache · 5 scar
//   build     0 lean · 1 average · 2 broad          height .9 … 1.1 (model scale)          sex 0 male · 1 female
// Contract with the model track (its files sort after this one, so its definitions win):
//   heroRebuild(h)            rebuild the player's hero (no argument) or a hero model h (co-op partner) after a look change
//   heroBuildPreview(look,cls,E)  a THREE.Group hero with that look, class (and gear E) for previews
// The model itself is built by the v94 model track (1520: heroLook/heroRebuild/heroBuildPreview).
var LOOK_DEF={skin:'#d9b38c',hair:'#2a1a12',hairStyle:0,face:2,eye:'#4a6a8a',build:1,height:1,sex:0};
var LOOK_OPT={
  skin:['#f0d2b6','#e1bea0','#d9b38c','#d2aa82','#c8a080','#b88a64','#8e623e','#5a3e2c','#3e2a1e'],
  hair:['#121014','#2a1a12','#3a2414','#5a3a20','#8a5a2a','#b8823a','#d8b870','#8a8a90','#dcdad4','#7a2a1e'],
  eye:['#4a6a8a','#3a2a1c','#5a7a3a','#7a8a9a','#9a7a2a','#6a3a8a'],
  hairStyle:['Short','Long','Top-knot','Spiky','Ponytail','Shaved'],
  face:['None','Stubble','Short beard','Long beard','Moustache','Scar'],
  build:['Lean','Average','Broad'],sex:['Male','Female']};
function lkHexA(a){return '#'+a.map(v=>('0'+Math.max(0,Math.min(255,Math.round(v))).toString(16)).slice(-2)).join('')}
function lkArr(h){const n=parseInt(String(h).slice(1),16);return [n>>16&255,n>>8&255,n&255]}
// each class's look before v94 (skin from CLS, hair/beard from the v71 dark-fantasy kit)
function lkClsDef(cls){
  const C=(typeof CLS!='undefined'&&CLS[cls])||null,D=(typeof dkC=='function'&&dkC()[cls])||null,o={};
  if(C&&C.sk)o.skin=lkHexA(C.sk);
  if(D){o.hair=D.hair!=null?'#'+('00000'+D.hair.toString(16)).slice(-6):LOOK_DEF.hair;o.hairStyle=Math.max(0,['short','long','topknot','spiky'].indexOf(D.hs||'short'));o.face=D.beard?2:0}
  return o}
// keep only valid fields (saves and co-op data are untrusted)
function lkClean(o){
  const r={};if(!o||typeof o!='object')return r;const hx=v=>typeof v=='string'&&/^#[0-9a-f]{6}$/i.test(v);
  if(hx(o.skin))r.skin=o.skin.toLowerCase();if(hx(o.hair))r.hair=o.hair.toLowerCase();if(hx(o.eye))r.eye=o.eye.toLowerCase();
  const it=(k,n)=>{const v=+o[k];if(Number.isInteger(v)&&v>=0&&v<n)r[k]=v};it('hairStyle',6);it('face',6);it('build',3);it('sex',2);
  if(isFinite(+o.height)&&o.height!==null&&o.height!=='')r.height=Math.max(.9,Math.min(1.1,+o.height));
  return r}
function heroLook(h){h=h||hero;return Object.assign({},LOOK_DEF,lkClsDef(h&&h.cls),h&&h.look||{})}
function lkFull(cls,part){return Object.assign({},LOOK_DEF,lkClsDef(cls),lkClean(part))}
function lkSig(L){return [L.skin,L.hair,L.hairStyle,L.face,L.eye,L.build,(+L.height).toFixed(2),L.sex].join(',')}

// fallback preview (only used if the v94 heroBuildPreview throws)
function lkStarter(cls){
  const C=CLS[cls],E={},w=ITPL.findIndex(t=>t.sl=='weapon'&&t.cls==cls&&t.t==0);E.weapon={id:-1,tp:w,lv:1,req:1,r:1,up:0,aff:[]};
  ['chest','boots'].forEach(sl=>{const i=ITPL.findIndex(t=>t.sl==sl&&t.arm==C.arm&&t.t==1);if(i>=0)E[sl]={id:-2,tp:i,lv:5,req:1,r:2,up:0,aff:[]}});
  if(cls=='paladin')E.offhand={id:-3,tp:ITPL.findIndex(t=>t.sl=='offhand'&&t.t==1),lv:5,req:1,r:2,up:0,aff:[]};return E}
function lkPreviewFB(look,cls,E){const h=buildHero();h.look=lkFull(cls,look);refreshGear(h,cls,E||lkStarter(cls));return h}

// ---------------- saves ----------------
{const f=gameSnapshot;gameSnapshot=function(){const s=f.apply(this,arguments);try{if(hero.look)s.hero.look=lkClean(hero.look)}catch(_){}return s}}
{const f=loadGame;loadGame=function(){
  try{const s=saveInfo();const c=s&&s.hero?lkClean(s.hero.look):{};hero.look=Object.keys(c).length?c:null}catch(_){hero.look=null}
  const r=f.apply(this,arguments);try{if(r&&typeof heroRebuild=='function')heroRebuild()}catch(e){console.warn('look load',e)}return r}}

// ---------------- the appearance editor (creator step and barber) ----------------
var LK={on:0,look:{},zoom:1,rot:.35,cls:'warrior',host:null,model:null,piv:null,inner:null,dirty:0,tgt:null};
function lkRandom(){const R=a=>a[Math.floor(Math.random()*a.length)],O=LOOK_OPT,sex=Math.random()<.5?0:1;
  return {skin:R(O.skin),hair:R(O.hair),eye:R(O.eye),hairStyle:Math.floor(Math.random()*6),face:sex?(Math.random()<.7?0:5):Math.floor(Math.random()*6),build:Math.floor(Math.random()*3),height:+(.93+Math.random()*.14).toFixed(2),sex}}
function lkCtl(L){
  const O=LOOK_OPT,sw=(k,a)=>`<div class="lks">${a.map(c=>`<button class="lksw${L[k]==c?' on':''}" data-lk="${k}" data-v="${c}" style="background:${c}" title="${c}" aria-label="${k} ${c}"></button>`).join('')}</div>`,
    ch=(k,a)=>`<div class="lkcs">${a.map((n,i)=>`<button class="lkc${L[k]==i?' on':''}" data-lk="${k}" data-v="${i}">${n}</button>`).join('')}</div>`,g=(t,x)=>`<div class="lkg"><div class="lkl">${t}</div>${x}</div>`;
  const body=g('Body',ch('sex',O.sex))+g('Build',ch('build',O.build))+g(`Height <b>${Math.round(L.height*100)}%</b>`,`<input class="lkr" type="range" min="0.9" max="1.1" step="0.01" value="${L.height}" data-lk="height" aria-label="Height">`)+g('Skin tone',sw('skin',O.skin));
  const head=g('Hair style',ch('hairStyle',O.hairStyle))+g('Hair colour',sw('hair',O.hair))+g('Face',ch('face',O.face))+g('Eye colour',sw('eye',O.eye))+
    `<div class="lkb"><button data-lka="rnd">🎲 Randomize</button><button data-lka="reset">↺ Reset</button></div>`;
  return {body,head}}
function lkSet(state,k,v){if(k=='height')v=+v;else if(k!='skin'&&k!='hair'&&k!='eye')v=+v;state.look=Object.assign({},state.look,{[k]:v})}
// a click/input inside an editor panel; returns true when the look changed
function lkInput(state,e){
  const a=e.target.closest('[data-lka]');if(a){state.look=a.dataset.lka=='rnd'?lkRandom():{};return true}
  const t=e.target.closest('[data-lk]');if(!t)return false;lkSet(state,t.dataset.lk,t.tagName=='INPUT'?t.value:t.dataset.v);return true}
// live preview in a host element (the shared preview renderer): drag to turn, wheel / pinch / +− to zoom, idle animation
function lkPreview(state,host,E){
  const look=lkFull(state.cls,state.look);let m=null;
  try{m=heroBuildPreview(look,state.cls,E)}catch(e){console.warn('preview',e)}
  if(!m){try{m=lkPreviewFB(look,state.cls,E)}catch(_){return}}
  if(!state.piv){const piv=new THREE.Group(),inner=new THREE.Group();inner.scale.setScalar(1.42);piv.add(inner);
    const ped=new THREE.Mesh(new THREE.CylinderGeometry(.7,.8,.12,32),new THREE.MeshStandardMaterial({color:0x3a2c1e,roughness:.8}));ped.position.y=-.06;piv.add(ped);
    const rg=new THREE.Mesh(new THREE.RingGeometry(.72,.8,48),new THREE.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:.6,side:THREE.DoubleSide}));rg.rotation.x=-Math.PI/2;rg.position.y=.005;piv.add(rg);
    state.piv=piv;state.inner=inner;state.rg=rg}
  if(state.model)state.inner.remove(state.model);state.model=m;state.inner.add(m);
  try{state.rg.material.color.set(CLS[state.cls].col)}catch(_){}
  lkDrag(state,host);
  if(PV.obj!==state.piv||!PV.cv||PV.cv.parentNode!==host)pvShow(host,state.piv,now=>{
    const z=state.zoom,t=(z-1)/1.6;state.piv.scale.setScalar(z);state.piv.position.y=.9-(.9+(1.72-.9)*t)*z;state.piv.rotation.y=state.rot;
    if(!state.drag)state.rot+=(state.spin||0);if(state.model){const ua=state.model.userData&&state.model.userData.anim;if(ua)ua(now);else animHero(now,false,state.model)}state.rg.material.opacity=.4+.25*Math.sin(now/300)});
}
function lkDrag(state,host){
  if(host._lkd)return;host._lkd=1;host.style.touchAction='none';const P={};
  const zoom=f=>{state.zoom=Math.max(1,Math.min(2.6,state.zoom*f))};
  host.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;P[e.pointerId]={x:e.clientX,y:e.clientY};state.drag=1;try{host.setPointerCapture(e.pointerId)}catch(_){}});
  host.addEventListener('pointermove',e=>{const p=P[e.pointerId];if(!p)return;const ks=Object.keys(P);
    if(ks.length>=2){const [a,b]=ks.map(k=>P[k]),d0=Math.hypot(a.x-b.x,a.y-b.y);p.x=e.clientX;p.y=e.clientY;const d1=Math.hypot(a.x-b.x,a.y-b.y);if(d0>10)zoom(d1/d0);return}
    state.rot+=(e.clientX-p.x)*.012;p.x=e.clientX;p.y=e.clientY});
  const up=e=>{delete P[e.pointerId];if(!Object.keys(P).length)state.drag=0};host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
  host.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(-e.deltaY*.0015))},{passive:false});
  host.insertAdjacentHTML('beforeend','<div class="lkz"><button data-z="1" title="Zoom in">+</button><button data-z="-1" title="Zoom out">−</button></div><div class="lkhint">Drag to turn · scroll or pinch to zoom</div>');
  host.querySelector('.lkz').addEventListener('click',e=>{const b=e.target.closest('[data-z]');if(b)zoom(b.dataset.z>0?1.25:.8)})}

// ---------------- creator: class → appearance → first companion ----------------
function lkHdr(){
  const s1=$('ccS1'),s2=$('ccS2');if(!s1||!s2)return;
  if(!$('ccS1b'))s1.insertAdjacentHTML('afterend','<span id="ccS1b">2 · Appearance</span>');
  s2.textContent=s2.textContent.replace(/^\s*2 ·/,'3 ·');
  const look=LK.on;$('ccS1b').classList.toggle('on',!!look);if(look){s1.classList.remove('on');s2.classList.remove('on')}
  $('ccS1b').classList.toggle('hide',!!window.AW_NOTITLE)}
function lkStep(){
  const L=lkFull(ccCls,LK.look),c=lkCtl(L),w=document.querySelector('#start .ccw');if(w)w.classList.add('lkon');
  $('ccT').textContent='Shape your hero';$('ccBack').classList.remove('hide');$('ccNext').textContent='Next ›';$('ccName').classList.remove('hide');
  $('ccList').innerHTML='<div class="lkp">'+c.body+'</div>';$('ccInfo').innerHTML='<div class="lkp">'+c.head+'</div>';lkHdr();
  LK.cls=ccCls;lkPreview(LK,$('ccPV'))}
{const f=ccRender;ccRender=function(){
  if(LK.on)return lkStep();
  const w=document.querySelector('#start .ccw');if(w)w.classList.remove('lkon');
  const r=f.apply(this,arguments);lkHdr();return r}}
// the class step's turning preview wears the look chosen so far
{const f=ccPreview;ccPreview=function(){try{if(typeof ccHero!='undefined'&&ccHero)ccHero.look=lkFull(ccCls,LK.look)}catch(_){}return f.apply(this,arguments)}}
function lkPanelInput(e){if(!LK.on)return;if(lkInput(LK,e)){if(e.type=='input'){const L=lkFull(ccCls,LK.look),b=e.target.closest('.lkg');if(b){const t=b.querySelector('.lkl b');if(t)t.textContent=Math.round(L.height*100)+'%'}lkQueue()}else lkStep()}}
function lkQueue(){if(LK.q)return;LK.q=requestAnimationFrame(()=>{LK.q=0;if(LK.on)lkPreview(LK,$('ccPV'))})}
$('ccList').addEventListener('click',e=>{if(LK.on){e.stopImmediatePropagation();lkPanelInput(e)}},true);
$('ccInfo').addEventListener('click',lkPanelInput);
$('ccList').addEventListener('input',lkPanelInput);
$('ccNext').onclick=()=>{
  if(ccStep==0&&!LK.on&&!window.AW_NOTITLE){LK.on=1;ccRender();return}  // (tests that skip the title skip this step too)
  if(ccStep==0){LK.on=0;ccStep=1;ccRender();return}
  ccBegin()};
$('ccBack').onclick=()=>{if(LK.on){LK.on=0;ccStep=0}else if(ccStep==1){ccStep=0;LK.on=window.AW_NOTITLE?0:1}ccRender()};
{const f=ccBegin;ccBegin=function(){
  const c=lkClean(lkFull(ccCls,LK.look));hero.look=c;LK.on=0;
  const r=f.apply(this,arguments);try{if(typeof heroRebuild=='function')heroRebuild()}catch(e){console.warn('look begin',e)}return r}}
requestAnimationFrame(()=>{try{lkHdr()}catch(_){}});

// ---------------- barber (Inventory → ✂ on the hero picture): change the look, free ----------------
var LKB={on:0,look:{},zoom:1,rot:.35,cls:'warrior',piv:null,model:null};
function lkBarberHTML(){
  if($('lkw'))return;const st=$('start').parentNode;
  st.insertAdjacentHTML('beforeend',`<div id="lkw" class="modal w hide"><div class="win lkwin"><div class="wh"><h2>Barber</h2><span class="wsub">Change your look · free</span><button class="x" id="lkClose" title="Close (Esc)">✕</button></div>
   <div class="wb lkbb"><div id="lkwL" class="ccl lkp"></div><div class="ccm"><div id="lkwPV" class="ccpv"></div></div><div id="lkwR" class="ccr lkp"></div></div>
   <div class="wf"><span class="mut dtl">Your companions will still recognise you.</span><span style="flex:1"></span><button id="lkCancel">Cancel</button><button id="lkApply" class="pri">Apply look</button></div></div></div>`);
  const W=$('lkw'),inp=e=>{if(lkInput(LKB,e)){if(e.type=='input'){const t=e.target.closest('.lkg').querySelector('.lkl b');if(t)t.textContent=Math.round(lkFull(LKB.cls,LKB.look).height*100)+'%';lkBQ()}else lkBarberRender()}};
  $('lkwL').addEventListener('click',inp);$('lkwR').addEventListener('click',inp);$('lkwL').addEventListener('input',inp);
  $('lkClose').onclick=$('lkCancel').onclick=()=>lkBarberClose(false);$('lkApply').onclick=()=>lkBarberClose(true);
  W.addEventListener('pointerdown',e=>{if(e.target===W)lkBarberClose(false)});
  addEventListener('keydown',e=>{if(LKB.on&&e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();lkBarberClose(false)}else if(LKB.on&&e.target.tagName!='INPUT')e.stopImmediatePropagation()},true)}
function lkBQ(){if(LKB.q)return;LKB.q=requestAnimationFrame(()=>{LKB.q=0;if(LKB.on)lkPreview(LKB,$('lkwPV'),eq)})}
function lkBarberRender(){const c=lkCtl(lkFull(LKB.cls,LKB.look));$('lkwL').innerHTML=c.body;$('lkwR').innerHTML=c.head;lkPreview(LKB,$('lkwPV'),eq)}
function openBarber(){lkBarberHTML();LKB.cls=hero.cls;LKB.look=Object.assign({},heroLook(hero));LKB.on=1;LKB.zoom=1.15;LKB.rot=.35;$('lkw').classList.remove('hide');lkBarberRender();try{mSfx&&mSfx('open')}catch(_){}}
function lkBarberClose(apply){
  if(!LKB.on)return;LKB.on=0;$('lkw').classList.add('hide');
  if(apply){hero.look=lkClean(lkFull(hero.cls,LKB.look));try{heroRebuild()}catch(e){console.warn('barber',e)}try{saveGame(true)}catch(_){}say('✂ You have a new look.')}
  try{if(!$('bag').classList.contains('hide'))bagPV()}catch(_){}}
function lkBagBtn(){const hv=$('hv');if(!hv||$('lkBtn'))return;if(getComputedStyle(hv).position=='static')hv.style.position='relative';
  hv.insertAdjacentHTML('beforeend','<button id="lkBtn" class="lkbtn" title="Barber: change your look">✂ Look</button>');$('lkBtn').onclick=e=>{e.stopPropagation();openBarber()}}
{const f=bagPV;bagPV=function(){const r=f.apply(this,arguments);try{lkBagBtn()}catch(_){}return r}}

// ---------------- styles (v88 theme tokens, with plain fallbacks) ----------------
document.head.insertAdjacentHTML('beforeend',`<style id="lkCss">
.lkp{display:flex;flex-direction:column;gap:10px;width:100%}
.lkg{display:flex;flex-direction:column;gap:5px}.lkl{font:700 .72rem/1.2 Cinzel,Georgia,serif;letter-spacing:.08em;text-transform:uppercase;color:var(--kq-gold2,#f0cc72)}.lkl b{font-family:Inter,sans-serif;color:var(--kq-ink,#e8dcc4);letter-spacing:0;margin-left:4px}
.lks{display:flex;flex-wrap:wrap;gap:6px}.lksw{width:26px;height:26px;min-width:0;border-radius:50%!important;padding:0!important;border:2px solid rgba(0,0,0,.55)!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.25),0 1px 2px #000!important;cursor:pointer}
.lksw.on{outline:2px solid var(--kq-gold2,#f0cc72);outline-offset:2px}
.lkcs{display:flex;flex-wrap:wrap;gap:5px}.lkc{padding:5px 9px!important;font-size:.74rem!important;min-height:0}.lkc.on{border-color:var(--kq-gold2,#f0cc72)!important;background:linear-gradient(180deg,rgba(230,170,80,.35),rgba(120,70,20,.35))!important;color:#fff}
.lkr{width:100%;accent-color:#d9ac5c}.lkb{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}.lkb button{flex:1}
.lkz{position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:4px;z-index:2}.lkz button{width:30px;height:30px;padding:0;font-size:1.1rem;line-height:1}
.lkhint{position:absolute;left:0;right:0;bottom:8px;text-align:center;font-size:.7rem;color:rgba(232,220,196,.7);pointer-events:none;text-shadow:0 1px 2px #000}
.ccpv canvas{cursor:grab}.ccpv canvas:active{cursor:grabbing}
.ccw.lkon .ccb{grid-template-columns:270px 1fr 290px}.ccw.lkon .ccl{display:block}
#lkw .lkwin{width:min(1000px,100%);height:min(600px,100%);display:flex;flex-direction:column}#lkw .lkbb{flex:1;display:grid;grid-template-columns:260px 1fr 280px;min-height:0;padding:0!important}
#lkw .ccl,#lkw .ccr{padding:12px;overflow:auto}#lkw .ccm{position:relative;min-height:220px}
.lkbtn{position:absolute;right:4px;top:4px;z-index:2;padding:3px 8px!important;font-size:.72rem!important}
@media (max-width:760px){.ccw.lkon .ccb{display:flex;flex-direction:column;overflow:auto}.ccw.lkon .ccm{height:230px;flex:0 0 230px;order:-1;position:sticky;top:0;z-index:3}.ccw.lkon .ccl,.ccw.lkon .ccr{overflow:visible;border:0;padding:12px 14px}.ccw.lkon .ccl{border-bottom:1px solid rgba(236,200,130,.15)}
 .ccst{white-space:nowrap}.ccst span:not(.on){display:none}.ccf{gap:6px;padding:8px 10px}.ccf input{width:auto!important;flex:1 1 auto;min-width:0}.ccf>span[style]{display:none}.ccf button{white-space:nowrap}
 .lksw{width:32px;height:32px}.lkc{padding:7px 10px!important}
 #lkw .lkbb{grid-template-columns:1fr;grid-template-rows:240px auto auto;overflow:auto}#lkw .ccm{grid-row:1}#lkw .ccl{grid-row:2}#lkw .lkwin{height:100%}}
</style>`);

