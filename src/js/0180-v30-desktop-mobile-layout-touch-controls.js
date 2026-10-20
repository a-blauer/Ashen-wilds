// ================= v30: desktop / mobile layout with touch controls =================
let joyId=null;
function applyDev(m){
  SET.dev=m;saveSet();document.body.classList.toggle('mob',m=='mobile');const s=$('s_dev');if(s)s.value=m;
  if(m=='mobile'){SET.zoom=SET.zoom||1}setTimeout(()=>{try{rs()}catch(_){}},60);
}
$('devp').addEventListener('click',e=>{const b=e.target.closest('[data-dev]');if(!b)return;applyDev(b.dataset.dev);$('devp').classList.add('hide');
  if(b.dataset.dev=='mobile'){try{const st=$('stage');if(st.requestFullscreen&&!document.fullscreenElement){const p=st.requestFullscreen();if(p&&p.catch)p.catch(()=>{})}}catch(_){}}});
{const pre=SET.dev||((matchMedia('(pointer:coarse)').matches||innerWidth<760)?'mobile':'desktop');document.querySelectorAll('#devp [data-dev]').forEach(b=>b.classList.toggle('pri',b.dataset.dev==pre))}
if($('s_dev')){$('s_dev').value=SET.dev||'desktop';$('s_dev').onchange=e=>applyDev(e.target.value)}
// ---------- virtual joystick ----------
{const J=$('joy'),K0=J.querySelector('i'),R0=46;
  const set=(e)=>{const r=J.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const L=Math.hypot(dx,dy);if(L>R0){dx*=R0/L;dy*=R0/L}
    K0.style.transform=`translate(${dx}px,${dy}px)`;const k=Math.hypot(dx,dy)/R0;dp[0]=k>.18?dx/R0:0;dp[1]=k>.18?dy/R0:0};
  J.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();joyId=e.pointerId;try{J.setPointerCapture(e.pointerId)}catch(_){}set(e)});
  J.addEventListener('pointermove',e=>{if(e.pointerId===joyId){e.preventDefault();set(e)}});
  const end=e=>{if(e.pointerId!==joyId)return;joyId=null;dp[0]=dp[1]=0;K0.style.transform=''};
  J.addEventListener('pointerup',end);J.addEventListener('pointercancel',end);J.addEventListener('lostpointercapture',end);
}
// ---------- action buttons ----------
$('mbtn').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-m]');if(!b)return;e.preventDefault();e.stopPropagation();const m=b.dataset.m;
  if(m=='atk'){atkHeld=true;mOn=false;swing();b.classList.add('on');const up=ev=>{atkHeld=false;b.classList.remove('on');removeEventListener('pointerup',up)};addEventListener('pointerup',up)}
  else if(m=='dash')dodge();else if(m=='tgt')selectTarget();else if(m=='f')interact();});
// ---------- touch camera: one finger drags to look, a quick tap attacks (or builds), two fingers pinch to zoom ----------
const TCH=new Map();let tLook=null,pinch=0;
gl.addEventListener('pointerdown',e=>{
  if(!document.body.classList.contains('mob')||e.pointerType=='mouse')return;
  TCH.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(TCH.size>=2){const a=[...TCH.values()];pinch=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);tLook=null;e.stopImmediatePropagation();return}
  tLook={id:e.pointerId,x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t:performance.now(),mv:0};e.stopImmediatePropagation();e.preventDefault();
},{capture:true});
addEventListener('pointermove',e=>{
  if(!TCH.has(e.pointerId))return;TCH.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(TCH.size>=2&&pinch){const a=[...TCH.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);camDist=Math.max(4.5,Math.min(15,camDist-(d-pinch)*.03*SET.zoom));pinch=d;return}
  if(tLook&&e.pointerId===tLook.id){const dx=e.clientX-tLook.x,dy=e.clientY-tLook.y;tLook.x=e.clientX;tLook.y=e.clientY;tLook.mv+=Math.abs(dx)+Math.abs(dy);
    camYaw-=dx*.009*SET.sens;camPitch=Math.max(.14,Math.min(1.1,camPitch+dy*.006*SET.sens*(SET.inv?-1:1)))}
});
const tEnd=e=>{
  if(!TCH.has(e.pointerId))return;TCH.delete(e.pointerId);if(TCH.size<2)pinch=0;
  if(tLook&&e.pointerId===tLook.id){const tap=tLook.mv<14&&performance.now()-tLook.t<320;tLook=null;
    if(tap&&!uiOpen()){mp(e);swing();mOn=false}}
};
addEventListener('pointerup',tEnd);addEventListener('pointercancel',tEnd);
if(SET.dev)document.body.classList.toggle('mob',SET.dev=='mobile');
setInterval(()=>{const m=$('mctl');if(m)m.style.display=(uiOpen()||!$('devp').classList.contains('hide'))?'none':''},250);

