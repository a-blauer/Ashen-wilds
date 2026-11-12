// ================= v222 the floating item: the thing you are looking at, turning in the air =================
// Owner (Nov 12 2026): "let's have a floating preview model of the item thats selected".
// Beside any open window (shops, the inventory, the forge, crafting), the item under the pointer - or, when nothing is pointed
// at, the selected one - floats and turns slowly over a ring of runes, with its name on a slip of paper.
//  - Gear (weapons, shields, armour, jewellery) is the item's real 3D model: the same kit its icon and the hero's hand use
//    (lgGroup + v89Kit + v89Pose, 1260), on a small renderer of its own (IP222.r, made on first use, see-through background).
//  - Everything else (potions, materials, food, eggs, runes ...) has no model, so its painted icon floats instead, enlarged.
//  - Where: to the right of the window when there is room (in the keeper view that is between the window and the keeper),
//    else to its left; on screens with no room beside the window (phones) it is not shown.
// ip222Pick() finds the slot ([data-kqt], the same tag the tooltips read), ip222Info() says what it is, a 150 ms check swaps the
// model when that changes; the model's geometry is freed when it is replaced. Your own view only: nothing is sent in co-op.
var IP222={el:null,r:null,sc:null,cam:null,P:null,key:'',cur:'',raf:0,t0:0,ids:new WeakMap(),n:0,S:220,on:true};
function ip222El(){let d=IP222.el;if(d)return d;d=IP222.el=document.createElement('div');d.id='ip222';d.className='hide';
  d.innerHTML='<div class="ip222s"><i class="ip222g"></i><i class="ip222r"></i><div class="ip222m"><canvas width="440" height="440"></canvas><div class="ip222i"></div></div></div><div class="ip222n"><b></b><span></span></div>';
  ($('stage')||document.body).appendChild(d);return d}
function ip222Pick(){const sel='.modal.w:not(.hide)';if(!document.querySelector(sel)||document.body.classList.contains('im220t'))return null;
  let el=null;try{el=KQM.tipEl}catch(_){}if(el&&(!el.isConnected||!el.closest(sel)))el=null;
  if(!el)el=document.querySelector(sel+' .kqm-slot.on[data-kqt],'+sel+' [data-kqt].on,'+sel+' .on>[data-kqt],'+sel+' .kqm-cell.on [data-kqt]');
  return el}
function ip222Info(el){const k=el.dataset.kqt||'',i=k.indexOf(':'),ty=i<0?k:k.slice(0,i),v=i<0?'':k.slice(i+1);
  const ico=()=>{const q=el.querySelector('.kqm-ic')||el;return q.innerHTML},gear=it=>({id:'g'+it.tp+'.'+(it.r|0)+'.'+it.id,it,nm:itT(it).n,sub:RAR[it.r|0][0],rc:RAR[it.r|0][1]});
  try{
    if(ty=='g'||ty=='e'){const it=kqmFind(ty,+v);return it?gear(it):null}
    if(ty=='x'){const o=KQM.wm.get(el);if(!o)return null;const it=o.item&&o.item();if(it&&it.tp!=null)return gear(it);
      let id=IP222.ids.get(el);if(!id){id=++IP222.n;IP222.ids.set(el,id)}const eg=o.egg&&o.egg();
      return {id:'x'+id,ico:ico(),nm:eg?(RAR[eg.tier|0][0]+' Egg'):String(o.nm||'').replace(/<[^>]*>/g,''),sub:eg?'Egg':'',rc:eg?RAR[eg.tier|0][1]:(o.rc||'#c9a24a')}}
    if(ty=='m')return {id:k,ico:ico(),nm:matInfo(v)[0],sub:'Material',rc:'#c9a24a'};
    if(ty=='s'){const S=SUP[v];return S?{id:k,ico:ico(),nm:S.n,sub:'',rc:'#c9a24a'}:null}
    if(ty=='egg'){const e=eggs.find(q=>q.id==+v);return e?{id:k,ico:ico(),nm:RAR[e.tier|0][0]+' Egg',sub:'Egg',rc:RAR[e.tier|0][1]}:null}
  }catch(_){}
  return null}
function ip222Free(){const I=IP222;if(I.P){try{I.sc.remove(I.P)}catch(_){}I.P=null}if(I.key){try{const gs=LGB[I.key];if(gs){for(const q in gs)gs[q].dispose();delete LGB[I.key]}}catch(_){}I.key=''}}
function ip222Gl(){const I=IP222;if(I.r)return true;if(I.r===false)return false;
  try{const cv=ip222El().querySelector('canvas');I.r=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});I.r.setPixelRatio(1);I.r.setSize(440,440,false);I.r.setClearColor(0,0);
    try{I.r.outputEncoding=ren.outputEncoding}catch(_){}
    I.sc=new THREE.Scene();I.cam=new THREE.PerspectiveCamera(30,1,.05,50);
    I.sc.add(new THREE.HemisphereLight(0xfff0d8,0x40302a,.95));const k=new THREE.DirectionalLight(0xffe8c0,1.15);k.position.set(2.5,4,3.5);I.sc.add(k);const b=new THREE.DirectionalLight(0x8aa0ff,.5);b.position.set(-3,1.5,-3);I.sc.add(b);
    return true}catch(e){I.r=false;console.warn('v222 item preview: no WebGL',e);return false}}
function ip222Model(it){const I=IP222;ip222Free();if(!ip222Gl())return false;
  try{const key='KQP|'+v89Key(it),g=lgGroup(key,k=>v89Kit(k,it),.14),P=new THREE.Group(),T=new THREE.Group();I.key=key;T.add(g);v89Pose(g,itT(it));T.updateMatrixWorld(true);
    const bb=new THREE.Box3().setFromObject(T),c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3()),R=Math.max(.05,sz.length()/2);T.position.sub(c);P.add(T);I.sc.add(P);I.P=P;
    const d=R/Math.sin(15*Math.PI/180)*1.08;I.cam.position.set(0,R*.22,d);I.cam.lookAt(0,0,0);I.cam.near=d/50;I.cam.far=d*4;I.cam.updateProjectionMatrix();return true}
  catch(e){ip222Free();if(!I.err){I.err=1;console.warn('v222 item preview',e)}return false}}
function ip222Loop(now){const I=IP222;I.raf=0;if(!I.cur||!I.P||!I.r)return;const t=(now-I.t0)/1000;I.P.rotation.y=t*.9;I.P.rotation.z=Math.sin(t*.7)*.06;try{I.r.render(I.sc,I.cam)}catch(_){}I.raf=requestAnimationFrame(ip222Loop)}
function ip222Place(){const d=IP222.el,st=$('stage'),m=document.querySelector('.modal.w:not(.hide)>.win');if(!d||!st||!m)return false;
  const S=st.getBoundingClientRect(),W=m.getBoundingClientRect(),w=IP222.S,gapR=S.right-W.right,gapL=W.left-S.left,right=gapR>=gapL;let k=Math.min(1,(Math.max(gapR,gapL)-14)/w),x,y;
  if(k>=.6){x=right?W.right-S.left+8:W.left-S.left-w*k-8;y=Math.max(8,Math.min(S.height-(w+80)*k-8,W.top-S.top+W.height*.2))}
  else{// no room beside the window: float next to the slot itself (left of it, else above it)
    const el=IP222.pel;if(!el||!el.isConnected||S.width<560)return false;const R=el.getBoundingClientRect();k=.72;const h=(w+70)*k;
    x=R.left-S.left-w*k-10;y=R.top-S.top+R.height/2-h/2;if(x<6){x=R.left-S.left+R.width/2-w*k/2;y=R.top-S.top-h-8;if(y<6)return false}
    x=Math.max(6,Math.min(S.width-w*k-6,x));y=Math.max(6,Math.min(S.height-h-6,y))}
  d.style.transformOrigin='left top';d.style.transform=k<1?'scale('+k.toFixed(3)+')':'';d.style.left=Math.round(x)+'px';d.style.top=Math.round(y)+'px';return true}
function ip222Tick(){const I=IP222;let inf=null;I.pel=null;if(I.on){try{const el=ip222Pick();if(el){inf=ip222Info(el);I.pel=el}}catch(_){}}
  const d=I.el;if(!inf){if(I.cur){I.cur='';ip222Free();if(d)d.className='hide'}return}
  if(inf.id===I.cur){if(!ip222Place()&&d)d.className='hide';else if(d&&d.classList.contains('hide'))d.className=I.cls;return}
  const e=ip222El();I.cur=inf.id;let is3=false;if(inf.it)is3=ip222Model(inf.it);else ip222Free();
  e.querySelector('.ip222i').innerHTML=is3?'':(inf.ico||(inf.it?icoOf(inf.it):''));e.querySelector('b').textContent=inf.nm||'';e.querySelector('span').textContent=inf.sub||'';
  e.style.setProperty('--rc',inf.rc||'#c9a24a');I.cls=is3?'m3':'m2';e.className=ip222Place()?I.cls:'hide';
  if(is3){I.t0=performance.now();if(!I.raf)I.raf=requestAnimationFrame(ip222Loop)}}
setInterval(()=>{try{ip222Tick()}catch(e){if(!IP222.err2){IP222.err2=1;console.warn('v222 item preview',e)}}},150);
document.head.insertAdjacentHTML('beforeend',`<style>
#ip222{position:absolute;z-index:6;width:220px;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:2px}
#ip222.hide{display:none}
.ip222s{position:relative;width:220px;height:220px}
.ip222g{position:absolute;inset:8%;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--rc) 46%,transparent) 0%,color-mix(in srgb,var(--rc) 14%,transparent) 42%,transparent 70%);filter:blur(4px);animation:ip222p 3.2s ease-in-out infinite}
.ip222r{position:absolute;left:14%;right:14%;bottom:2%;height:22%;border-radius:50%;border:1px solid color-mix(in srgb,var(--rc) 70%,#f6ead0);box-shadow:0 0 14px color-mix(in srgb,var(--rc) 60%,transparent),inset 0 0 12px color-mix(in srgb,var(--rc) 40%,transparent)}
.ip222r::before{content:'';position:absolute;inset:12% 9%;border-radius:50%;border:1px dashed color-mix(in srgb,var(--rc) 75%,#f6ead0);animation:ip222t 9s linear infinite}
.ip222m{position:absolute;inset:0;animation:ip222b 3.2s ease-in-out infinite}
.ip222m canvas{width:100%;height:100%;display:block}
#ip222.m2 canvas{display:none}
.ip222i{position:absolute;inset:22%;display:flex;align-items:center;justify-content:center;font-size:92px;line-height:1;filter:drop-shadow(0 6px 10px rgba(0,0,0,.7));animation:ip222w 5s ease-in-out infinite}
.ip222i>*{width:100%!important;height:100%!important;max-width:none!important;font-size:inherit}
.ip222i img{object-fit:contain;border-radius:4px}
#ip222.m3 .ip222i{display:none}
.ip222n{text-align:center;padding:5px 16px 6px;max-width:220px;color:#2a2118;font-family:'IM Fell English','EB Garamond',Georgia,serif;
  background:radial-gradient(130% 160% at 28% 0%,#eee2c6,#d8c7a2);box-shadow:0 0 0 1px #4a3826,0 0 0 3px #1c140c,0 0 0 4px #6a4e2c,0 8px 20px rgba(0,0,0,.6);border-radius:1px}
.ip222n b{display:block;font-weight:400;font-size:1.02rem;line-height:1.2}
.ip222n span{display:block;font-size:.78rem;font-style:italic;color:#8c2f1f}.ip222n span:empty{display:none}
@keyframes ip222b{0%,100%{transform:translateY(-5px)}50%{transform:translateY(6px)}}
@keyframes ip222p{0%,100%{opacity:.75}50%{opacity:1}}
@keyframes ip222t{to{transform:rotate(360deg)}}
@keyframes ip222w{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@media (prefers-reduced-motion:reduce){.ip222m,.ip222g,.ip222i,.ip222r::before{animation:none}}
</style>`);
