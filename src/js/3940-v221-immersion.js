// ================= v221 (made as v220, names *220) talking to people: conversations and shopkeepers in the world =================
// Owner (Nov 11 2026): "we use ui popup menus to handle most shops, main quest dialogue and interactions. Doing this kind of
// kills immersion - id rather have a more interactive interaction where we actually talk to the npc for the quest and it shows
// pop up dialogue that we navigate through, and a camera focused on them like we're talking to them. In shops, I want it to
// show the shopkeeper to the right side while we shop."
//
// Two views, both driven by the windows the game already opens (nothing about quests or shops themselves changes):
//  TALK (quest people: the Warden-Captain 'mq143', Kheprit 'kh165', Cheddar at the Great Gate 'ch205' and in the Sun Court
//    'dm205'): the camera moves in on the speaker's face, the HUD steps aside behind two black bars, and the window becomes a
//    dialogue box at the bottom. What they say comes one passage at a time, typed out (DL220): click / Space / Enter / F for
//    the next, and after the last passage your answers appear as a list (click, or press 1-9). Esc leaves.
//  SHOP (alchemist, cook, stable, magic shop, the four visitors, the Steward, Cheddar's board in #xw; the Trading Post in
//    #shop; the Blacksmith's forge in #bag): the window slides to the left and the camera frames the keeper on the right, turned
//    to face you, with a line of greeting. On tall / narrow screens the keeper stands above the window instead.
// How: im220Find() says each frame who you are dealing with (from the open window and its mode); im220Tick() runs in front of
// POST.render, after the follow camera, and places the camera (eased in; the follow camera eases back by itself on leaving).
// FADE.pl is pointed at the speaker so walls between the camera and them are cut away; the hero is hidden while the view is on.
// Co-op: these are your own views, like any menu: a partner keeps seeing your hero standing at the counter, and their world
// keeps running. Nothing here is sent, and nothing a partner needs to see changes (the keeper turning to you is yours only).
var IM220={on:null,ft:0,p0:new THREE.Vector3(),l0:new THREE.Vector3(),hid:false,
  talk:{mq143:1,kh165:1,ch205:1,dm205:1},
  hi:{alch:'Mind the fumes. What do you need brewed?',cook:'Sit, eat. You look half starved.',stable:'Easy now. Looking for a mount?',magic:'Power has a price. Browse.',
    merchant:'Rare things from far roads. Have a look.',trainer:'Bring me a beast worth training.',bard:'A song for a coin, friend?',sage:'The runes have been waiting for you.',
    steward:'The stronghold is yours to shape, my liege.',cheddar:'Work for the brave! Take your pick.',post:'Buying or selling, friend?',smith:'Steel and fire. What will it be?'}};
var DL220={sig:'',i:0,pages:[],name:'',typed:true,tm:0};
function im220Vis(id){const e=$(id);return e&&!e.classList.contains('hide')?e:null}
function im220Rig(g){if(!g)return null;if(g.bones)return g;let r=null;try{g.traverse(c=>{if(!r&&c.bones)r=c})}catch(_){}return r||g}
// who the open window belongs to: {mode:'talk'|'shop', key, o:Object3D, el:modal}
function im220Find(){let el,o=null,mode='shop',key='';
  try{if(el=im220Vis('xw')){const m=xwMode;key=m;
      if(IM220.talk[m]){mode='talk';o=m=='mq143'?MQ143.S.war.captain.g:m=='kh165'?KH165W.e.m:m=='ch205'?CH205.g:DM205.C.root}
      else if(m=='alch'||m=='cook'||m=='stable'||m=='magic')o=TWN100_S.npc[m];
      else if(m=='visitor'){key=String(xwArg);const v=VIS.find(v=>v.k==xwArg);o=v&&v.g}
      else if(m=='hold'){key='steward';o=SHM.st&&SHM.st.g}
      else if(m=='chq132'){key='cheddar';o=CHQ148.P&&CHQ148.P.ch.root}}
    else if(el=im220Vis('shop')){key='post';o=DM196TP.npc}
    else if((el=im220Vis('bag'))&&KQM_SMITH){key='smith';o=TWN100_S.npc.smith}}catch(_){o=null}
  if(!o||!el)return null;o=im220Rig(o);if(!o||!o.parent)return null;
  const p=o.getWorldPosition(IM220._v||(IM220._v=new THREE.Vector3()));if(Math.hypot(p.x-pl.position.x,p.z-pl.position.z)>(mode=='talk'?14:9))return null;
  return {mode,key,o,el}}
// the size of a figure from its meshes only (name plates and markers are sprites: left out)
function im220Box(o){const B=new THREE.Box3(),b=new THREE.Box3();o.updateMatrixWorld(true);
  o.traverse(c=>{if(!(c.isMesh||c.isSkinnedMesh)||!c.geometry||c.visible===false)return;if(!c.geometry.boundingBox)c.geometry.computeBoundingBox();b.copy(c.geometry.boundingBox).applyMatrix4(c.matrixWorld);
    if(isFinite(b.min.y)&&isFinite(b.max.y)&&b.max.y-b.min.y<12)B.union(b)});
  if(B.isEmpty()){const p=o.getWorldPosition(new THREE.Vector3());B.set(new THREE.Vector3(p.x-.4,p.y,p.z-.4),new THREE.Vector3(p.x+.4,p.y+1.7,p.z+.4))}return B}
function im220WorldYaw(o){if(!o)return 0;const q=o.getWorldQuaternion(new THREE.Quaternion()),e=new THREE.Euler().setFromQuaternion(q,'YXZ');return e.y}
function im220Narrow(){const s=$('stage');return !!s&&(s.clientWidth<720||s.clientWidth<s.clientHeight*1.05)}
function im220Begin(w){const A=IM220;A.on=w;w.t0=nowP();A.p0.copy(cam.position);A.l0.copy(look);
  const p=w.o.getWorldPosition(new THREE.Vector3());let h=1.7,y0=p.y;
  try{const B=im220Box(w.o);h=Math.max(.5,Math.min(6,B.max.y-p.y));y0=p.y}catch(_){}
  w.h=h;w.y0=y0;w.x=p.x;w.z=p.z;w.ry0=w.o.rotation.y;w.py=im220WorldYaw(w.o.parent);w.narrow=im220Narrow();
  let dx=pl.position.x-p.x,dz=pl.position.z-p.z;const d=Math.hypot(dx,dz);if(d<.3){dx=Math.sin(camYaw);dz=Math.cos(camYaw)}else{dx/=d;dz/=d}w.dx=dx;w.dz=dz;
  if(w.mode=='talk'){document.body.classList.add('im220t');try{if(d>=.3)pl.rotation.y=Math.atan2(-dx,-dz)}catch(_){}}
  else{document.body.classList.add('im220s');w.el.classList.add(w.narrow?'sk220v':'sk220');im220Hi(w)}
  w.spr=[];try{w.o.children.forEach(c=>{if(c.isSprite&&c.visible){c.visible=false;w.spr.push(c)}})}catch(_){}}   // their name plate and markers step out of the close-up
function im220End(){const A=IM220,w=A.on;if(!w)return;A.on=null;
  try{w.o.rotation.y=w.ry0}catch(_){}try{(w.spr||[]).forEach(c=>{c.visible=true})}catch(_){}if(A.hid){A.hid=false;try{pl.visible=true}catch(_){}}
  document.body.classList.remove('im220t','im220s');['xw','shop','bag'].forEach(id=>{const e=$(id);if(e)e.classList.remove('sk220','sk220v')});
  const s=$('sk220say');if(s)s.className='hide'}
// the keeper's greeting, beside them
function im220Hi(w){let s=$('sk220say');if(!s){s=document.createElement('div');s.id='sk220say';s.className='hide';($('stage')||document.body).appendChild(s)}
  let nm='';try{nm=(w.o.userData.npcO&&w.o.userData.npcO.label)||''}catch(_){}if(w.key=='cheddar')nm='Cheddar';nm=String(nm).split(' · ')[0];
  const t=IM220.hi[w.key];if(!t||w.narrow){s.className='hide';return}
  s.innerHTML=(nm?'<b>'+nm+'</b>':'')+'<i>“'+t+'”</i>';s.className='';void s.offsetWidth;s.className='on'}
function im220Tick(){const A=IM220;
  if((typeof IC151!='undefined'&&IC151.on)||(typeof KC208!='undefined'&&KC208.on)||!party.length){if(A.on)im220End();return false}
  const f=im220Find(),w0=A.on;
  if(!f){if(w0)im220End();return false}
  if(!w0||w0.o!==f.o||w0.el!==f.el||w0.key!==f.key){if(w0)im220End();im220Begin(f)}
  const w=A.on,n=nowP(),k=Math.min(1,(n-w.t0)/620),e=k*k*(3-2*k),talk=w.mode=='talk',h=w.h;w.k=k;
  const asp=cam.aspect||1.6,tf=Math.tan((cam.fov||58)*Math.PI/360);
  // where the camera stands: out from the speaker toward you, swung a little to one side
  const D=talk?Math.max(1.7,Math.min(5.2,h*1.55+.5)):Math.max(2.6,Math.min(6.5,h*(w.narrow?2.4:1.9)+.9)),sw=talk?.5:-.3,cs=Math.cos(sw),sn=Math.sin(sw);
  const ox=w.dx*cs+w.dz*sn,oz=-w.dx*sn+w.dz*cs,fy=w.y0+h*(talk?.84:.62);
  const P=IM220._p||(IM220._p=new THREE.Vector3()),L=IM220._l||(IM220._l=new THREE.Vector3()),C=IM220._c||(IM220._c=new THREE.Vector3());
  C.set(w.x,fy,w.z);P.set(w.x+ox*D,fy+(talk?h*.06:h*.12+.15),w.z+oz*D);
  if(talk)L.set(w.x,fy-D*tf*.34,w.z);                       // the face sits above the middle: the dialogue box is below
  else if(w.narrow)L.set(w.x,fy-D*tf*.55,w.z);              // tall screens: the keeper above the window
  else{const th=Math.atan(.64*tf*asp),vx=w.x-P.x,vz=w.z-P.z,c2=Math.cos(th),s2=Math.sin(th);L.set(P.x+vx*c2+vz*s2,fy-D*tf*.1,P.z-vx*s2+vz*c2)}   // wide screens: the keeper on the right
  cam.position.lerpVectors(A.p0,P,e);look.lerpVectors(A.l0,L,e);cam.lookAt(look);cam.updateMatrixWorld();
  try{FADE.cam.value.copy(cam.position);FADE.pl.value.copy(C)}catch(_){}
  // the speaker looks at you (the camera, in a shop); your hero steps out of the picture
  try{const tx=talk?pl.position.x:P.x,tz=talk?pl.position.z:P.z;w.o.rotation.y=Math.atan2(tx-w.x,tz-w.z)-w.py}catch(_){}
  if(!A.hid&&k>.25&&pl.visible){A.hid=true;pl.visible=false}
  if(A.hid)try{fols.forEach(f=>{if(f)f.visible=false})}catch(_){}   // companions too (compTick shows them again next frame once the view ends)
  return true}
{const f=POST.render;POST.render=function(){let on=false;try{on=im220Tick()}catch(e){if(!IM220.err){IM220.err=1;console.warn('v220 view',e)}}
  if(on&&typeof CAM172!='undefined'&&CAM172.on){CAM172.on=false;try{return f.apply(this,arguments)}finally{CAM172.on=true}}
  return f.apply(this,arguments)}}

// ---------------- the dialogue box ----------------
function dl220On(){const x=$('xw');return !!x&&!x.classList.contains('hide')&&x.classList.contains('dlg220')}
function dl220Last(){return DL220.i>=DL220.pages.length-1}
function dl220Build(){const x=$('xw'),B=$('xwB');if(!x||!B)return;const S=B.querySelector('.cq132say');
  if(!IM220.talk[xwMode]||!S){x.classList.remove('dlg220','dl220more');return}
  const who=S.querySelector('.cq132who'),tmp=S.cloneNode(true),w2=tmp.querySelector('.cq132who');if(w2)w2.remove();
  const pages=tmp.innerHTML.split(/<br\s*\/?>\s*<br\s*\/?>/).map(s=>s.trim()).filter(Boolean);if(!pages.length)pages.push('…');
  const sig=xwMode+'|'+pages.join('|');if(DL220.sig!==sig){DL220.sig=sig;DL220.i=0;DL220.typed=false}
  DL220.pages=pages;DL220.name=who?who.textContent:'';DL220.i=Math.min(DL220.i,pages.length-1);x.classList.add('dlg220');dl220Show()}
function dl220Show(){const x=$('xw'),S=$('xwB').querySelector('.cq132say');if(!S)return;clearInterval(DL220.tm);
  const pg=DL220.pages[DL220.i]||'',n=DL220.pages.length,tmp=document.createElement('span');tmp.innerHTML=pg;const txt=tmp.textContent;
  S.innerHTML='<span class="cq132who">'+zt116Esc(DL220.name)+'</span><span class="dl220t"></span><span class="dl220n"></span>';
  const T=S.querySelector('.dl220t'),N=S.querySelector('.dl220n');
  const done=()=>{clearInterval(DL220.tm);DL220.typed=true;T.innerHTML=pg;const more=!dl220Last();x.classList.toggle('dl220more',more);
    N.innerHTML=more?'<em>'+(DL220.i+1)+' / '+n+'</em> Continue ▸':'';N.className='dl220n'+(more?' on':'')};
  if(DL220.typed){done();return}
  x.classList.add('dl220more');let c=0;const step=Math.max(1,Math.ceil(txt.length/90));
  // the whole passage is laid out from the start (the part not yet "spoken" is invisible), so the box never jumps while it types
  T.innerHTML='<span></span><span style="visibility:hidden"></span>';const a=T.firstChild,b=T.lastChild;b.textContent=txt;
  DL220.tm=setInterval(()=>{c+=step;if(c>=txt.length||!dl220On()){done();return}a.textContent=txt.slice(0,c);b.textContent=txt.slice(c)},22)}
// next passage (or finish typing this one); returns true when it did something
function dl220Next(){if(!dl220On())return false;if(!DL220.typed){DL220.typed=true;dl220Show();return true}
  if(!dl220Last()){DL220.i++;DL220.typed=false;dl220Show();return true}return false}
{const f=openX;openX=function(m){if(IM220.talk[m])DL220.sig='';return f.apply(this,arguments)}}
{const f=rX;rX=function(){const r=f.apply(this,arguments);try{dl220Build()}catch(e){console.warn('v220 dialogue',e)}return r}}
$('xw').addEventListener('click',e=>{if(!dl220On())return;const x=$('xw');if(e.target.closest('button,a,input,select'))return;
  if(x.classList.contains('dl220more')||e.target.closest('.cq132say')){if(dl220Next()){e.stopPropagation();e.preventDefault()}}},true);
addEventListener('keydown',e=>{if(!dl220On()||e.ctrlKey||e.metaKey||e.altKey)return;const k=String(e.key||'').toLowerCase();
  if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();closeX();return}
  if(k===' '||k==='enter'||k==='f'||k==='e'){e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
    if(!dl220Next()){const b=$('xwF').querySelectorAll('button');if(b.length==1)b[0].click()}return}
  if(k>='1'&&k<='9'&&!$('xw').classList.contains('dl220more')){const b=$('xwF').querySelectorAll('button')[+k-1];if(b){e.preventDefault();e.stopImmediatePropagation();b.click()}}},true);

document.head.insertAdjacentHTML('beforeend',`<style>
/* ---- talk: the HUD steps aside, two bars, a dialogue box ---- */
body.im220t #stage>*:not(#gl):not(#xw):not(#fade):not(#ztc116):not(#banner){visibility:hidden!important}
body.im220s #stage>*:not(#gl):not(.modal):not(#sk220say):not(#fade):not(#ztc116):not(#banner):not(#kqmTip):not(#ip222){visibility:hidden!important}
#xw.dlg220{background:none!important;align-items:flex-end;padding:0 12px max(18px,5%);pointer-events:none}
#xw.dlg220::before,#xw.dlg220::after{content:'';position:absolute;left:0;right:0;height:9%;background:#000;pointer-events:none;animation:dl220bar .5s ease both}
#xw.dlg220::before{top:0;transform-origin:top}#xw.dlg220::after{bottom:0;transform-origin:bottom;height:5%}
@keyframes dl220bar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes dl220in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
#xw.dlg220 .win{pointer-events:auto;position:relative;z-index:1;width:min(780px,100%)!important;max-height:58%;overflow:visible;animation:dl220in .45s .12s ease both;
  background:linear-gradient(180deg,rgba(26,19,13,.94),rgba(10,8,6,.96))!important;border:1px solid #8a6a2c!important;border-radius:4px!important;
  box-shadow:0 0 0 1px #000,inset 0 0 0 1px rgba(232,195,106,.18),inset 0 0 38px rgba(0,0,0,.7),0 16px 44px rgba(0,0,0,.75)!important}
#xw.dlg220 .wh{position:absolute;left:18px;right:8px;top:-17px;height:auto;padding:0;border:0!important;background:none!important;gap:8px;z-index:2}
#xw.dlg220 .wh h2{font-size:.86rem;padding:5px 18px;color:#f4e6c0;background:linear-gradient(180deg,#3a2a16,#1a120a);border:1px solid #c9a24a;box-shadow:0 0 0 1px #000,0 3px 10px rgba(0,0,0,.7);
  clip-path:polygon(10px 0,calc(100% - 10px) 0,100% 50%,calc(100% - 10px) 100%,10px 100%,0 50%);letter-spacing:.14em}
#xw.dlg220 .wh::before,#xw.dlg220 .wh::after{display:none!important}
#xw.dlg220 .wsub{margin:0;font-family:'IM Fell English SC',Georgia,serif;font-size:.74rem;color:#c9b48a;text-shadow:0 1px 3px #000,0 0 8px #000;align-self:flex-end;padding-bottom:2px}
#xw.dlg220 .wh .x{margin-left:auto!important;width:26px;height:26px;border-radius:50%;background:#1a120a!important;border:1px solid #8a6a2c!important;color:#c9b48a;font-size:.8rem}
#xw.dlg220 .wb{padding:26px 26px 10px;overflow:auto}
#xw.dlg220 .cq132say{margin:0 0 8px;padding:0;border:0;background:none;font-size:1.14rem;line-height:1.5;color:#f0e4c4;min-height:4.6em;cursor:pointer;text-shadow:0 1px 2px #000}
#xw.dlg220 .cq132who{display:none}
#xw.dlg220 .dl220n{display:none;float:right;margin-top:8px;font-family:Cinzel,Georgia,serif;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:#e8c36a;animation:dl220pulse 1.3s ease-in-out infinite}
#xw.dlg220 .dl220n.on{display:block}#xw.dlg220 .dl220n em{font-style:normal;color:#8a7a5a;margin-right:10px}
@keyframes dl220pulse{0%,100%{opacity:.55}50%{opacity:1}}
#xw.dlg220.dl220more .wb>:not(.cq132say),#xw.dlg220.dl220more .wf{display:none!important}
#xw.dlg220 .wf{flex-direction:column;align-items:stretch;gap:5px;padding:4px 22px 16px;border:0!important;background:none!important;min-height:0;counter-reset:dl220}
#xw.dlg220 .wf::before,#xw.dlg220 .wf::after{display:none!important}
#xw.dlg220 .wf button{counter-increment:dl220;text-align:left;padding:8px 14px 8px 12px;font-family:'IM Fell English SC',Georgia,serif;font-size:1rem;letter-spacing:.02em;text-transform:none;color:#eadcb8!important;
  background:linear-gradient(90deg,rgba(201,162,74,.16),rgba(201,162,74,.03))!important;border:1px solid rgba(201,162,74,.35)!important;border-left:3px solid #c9a24a!important;border-radius:2px!important;box-shadow:none!important;transition:background .12s,transform .12s}
#xw.dlg220 .wf button::before{content:counter(dl220) '  ❖  ';color:#c9a24a;font-family:Cinzel,Georgia,serif;font-size:.7rem}
#xw.dlg220 .wf button:hover,#xw.dlg220 .wf button:focus-visible{background:linear-gradient(90deg,rgba(232,195,106,.34),rgba(201,162,74,.08))!important;transform:translateX(4px);color:#fff6dc!important}
#xw.dlg220 .wf button.pri{border-left-color:#f0d48a!important;color:#fff3d2!important}
#xw.dlg220 .wf .mut{font-style:italic;text-align:center;padding-top:2px}
body.mob #xw.dlg220 .cq132say{font-size:.98rem;min-height:3.6em}body.mob #xw.dlg220 .wb{padding:32px 16px 8px}body.mob #xw.dlg220 .wsub{display:none}body.mob #xw.dlg220 .wf{padding:4px 14px 12px}
/* ---- shop: the window to the left, the keeper on the right ---- */
.modal.w.sk220{justify-content:flex-start;background:linear-gradient(90deg,rgba(4,6,9,.86) 0%,rgba(4,6,9,.7) 52%,rgba(4,6,9,.18) 70%,rgba(4,6,9,0) 82%)!important}
.modal.w.sk220>.win{width:min(63%,980px)!important;animation:sk220in .4s ease both}
@keyframes sk220in{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:none}}
.modal.w.sk220v{align-items:flex-end;background:linear-gradient(0deg,rgba(4,6,9,.88) 0%,rgba(4,6,9,.7) 56%,rgba(4,6,9,0) 74%)!important}
.modal.w.sk220v>.win{max-height:62%}
#sk220say{position:absolute;z-index:6;right:3%;bottom:9%;width:min(27%,300px);pointer-events:none;text-align:center;opacity:0;font-family:'IM Fell English SC',Georgia,serif;color:#f0e4c4;
  padding:10px 14px 12px;background:linear-gradient(180deg,rgba(26,19,13,.88),rgba(10,8,6,.92));border:1px solid #8a6a2c;box-shadow:0 0 0 1px #000,inset 0 0 0 1px rgba(232,195,106,.16),0 8px 24px rgba(0,0,0,.6);border-radius:3px}
#sk220say.hide{display:none}#sk220say.on{animation:dl220in .5s .45s ease forwards}
#sk220say b{display:block;font-family:Cinzel,Georgia,serif;font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:#e8c36a;margin-bottom:4px}
#sk220say i{font-size:.95rem;line-height:1.35}
</style>`);
