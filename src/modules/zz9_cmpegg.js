// ================= v74: one Companions & Eggs window; eggs hatch inside its preview =================
var CE={sel:null,hat:null,next:0};   // sel: selected egg id (null = companion view); hat: the hatch in progress {c,egg,done}
{const st=document.createElement('style');st.textContent=`
#cmp .win{max-width:980px;height:min(680px,100%)}
#cmp .wb.cols.c2{overflow:hidden;align-items:stretch}
#cmp #cl{overflow:auto;min-height:0;max-height:100%;padding-right:2px}
#cmp .wb.cols.c2>div:last-child{display:flex;flex-direction:column;min-height:0}
#cmp #cd{overflow:auto;flex:1;min-height:0;padding-right:4px}
@media (max-width:640px){#cmp .wb.cols.c2{overflow:auto;grid-template-rows:auto auto}#cmp #cl{max-height:38vh}#cmp #cd{overflow:visible}}
#cmp #cvw.pvbox.sm{height:230px;position:relative;background:radial-gradient(circle at 50% 42%,#2b3a52,#120e0b 78%)}
#cmp #cvw.hatching{background:radial-gradient(circle at 50% 55%,#3a2a18,#120c08 75%)}
.ceh{display:flex;align-items:center;justify-content:space-between;margin:2px 2px 6px;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:#9a927e}
.ceh b{color:#e8d8b0;letter-spacing:.04em}
#cl .ceeg{width:100%}
#cl .ceeg .rn small{display:block}
#cl .ceeg.rdy{animation:ceGlow 1.6s ease-in-out infinite}
@keyframes ceGlow{0%,100%{box-shadow:inset 0 0 0 1px rgba(250,204,21,.25)}50%{box-shadow:inset 0 0 0 1px rgba(250,204,21,.8),0 0 12px rgba(250,204,21,.25)}}
#cl .cesp{height:10px}
.cedh{font:700 1.05rem Cinzel,Georgia,serif;margin:2px 0 2px}
.cebar{height:8px;border-radius:4px;background:rgba(255,255,255,.08);overflow:hidden;margin:10px 0 6px}
.cebar i{display:block;height:100%;background:linear-gradient(90deg,#b45309,#facc15);transition:width .3s}
.cehatch{width:100%;margin-top:10px;padding:12px;font-size:1rem}
.cest{font:700 1.15rem Cinzel,Georgia,serif;text-align:center;margin:4px 0 8px;color:#f5e6c8}
.cest.wait{animation:ceDots 1.2s ease-in-out infinite;color:#d6c3a0}
@keyframes ceDots{0%,100%{opacity:.55}50%{opacity:1}}
#cd .cehr{text-align:center}#cd .cehr .hab{text-align:left}
#cd .cehb{display:flex;gap:8px;justify-content:center;margin-top:12px}
`;document.head.appendChild(st)}
{const w=$('cmp');w.querySelector('h2').textContent='Companions & Eggs';
  if(!w.querySelector('.wsub'))w.querySelector('h2').insertAdjacentHTML('afterend','<span class="wsub">Eggs hatch after a short wait · click a ready egg to hatch it</span>');
  const ib=$('incBtn');if(ib)ib.style.setProperty('display','none','important');
  const cb=$('cmpBtn');if(cb)cb.innerHTML='🐾 Companions & Eggs <kbd>P</kbd>'}

// ---------- egg list (top of the left column) ----------
function ceEggRows(){
  if(!eggs.length)return '';const now=Date.now();
  const ord=eggs.slice().sort((a,b)=>(eggRdy(b)?1:0)-(eggRdy(a)?1:0));
  return `<div class="ceh"><span>Eggs <b>${eggs.length}</b></span><span>${eggs.filter(eggRdy).length?'✨ '+eggs.filter(eggRdy).length+' ready':''}</span></div>`+
   ord.map(e=>{const p=Math.min(1,(now-(e.t0||now))/EGG_T),rd=p>=1;
    return `<button class="rw it ceeg${rd?' rdy':''}${CE.sel==e.id?' on':''}" data-cegg="${e.id}" style="--rc:${RAR[e.tier][1]}"><span class="rn">${en(e)}<small data-eg="${e.id}">${rd?'✨ Ready! Click to hatch':'Hatching in '+Math.max(1,Math.ceil((EGG_T-(now-(e.t0||now)))/1000))+'s'}</small></span><span class="ra"><span class="hpm egp"><i data-egb="${e.id}" style="width:${p*100}%"></i></span></span></button>`}).join('')+
   `<div class="ceh" style="margin-top:12px"><span>Companions <b>${party.length}</b></span></div>`}

// ---------- egg preview: a slowly turning egg that trembles more as it nears hatching ----------
function ceEggMesh(e){
  const ec=parseInt(RAR[e.tier][1].slice(1),16),mat=new THREE.MeshStandardMaterial({map:eggTex(ec),roughness:.5,emissive:ec,emissiveIntensity:0,side:THREE.DoubleSide});
  const bot=new THREE.Mesh(new THREE.SphereGeometry(1,28,20,0,Math.PI*2,Math.PI/2,Math.PI/2),mat),top=new THREE.Mesh(new THREE.SphereGeometry(1,28,20,0,Math.PI*2,0,Math.PI/2),mat);
  const g=new THREE.Group();g.add(bot,top);g.scale.set(.55,.72,.55);g.position.y=.72;return {g,bot,top,mat,ec}}
function ceEggPV(e){
  const E=ceEggMesh(e),grp=new THREE.Group();grp.add(E.g);$('cvw').classList.remove('hatching');
  pvShow($('cvw'),grp,now=>{const p=Math.min(1,(Date.now()-(e.t0||Date.now()))/EGG_T),t=now/1000;
    grp.rotation.y=t*.5;E.g.rotation.z=Math.sin(t*(4+p*14))*.04*(.3+p);E.mat.emissiveIntensity=.04+p*.18+(p>=1?.12*(1+Math.sin(t*4)):0);
    PV.pl.color.setHex(E.ec);PV.pl.intensity=p*.6});
}
function ceEggInfo(e){
  const now=Date.now(),p=Math.min(1,(now-(e.t0||now))/EGG_T),rd=p>=1,f=famOf(e.sp),F=typeof FAMD!='undefined'&&FAMD[f];
  $('cd').innerHTML=`<div class="cedh">${en(e)}</div><div class="mut" style="font-size:.76rem">${RAR[e.tier][0]} egg${F?' · '+F.i+' '+f+' family':''}</div>
   ${F&&F.d?`<p class="mut" style="font-size:.78rem;margin:8px 0 0">${F.d}</p>`:''}
   <div class="cebar"><i data-egb="${e.id}" style="width:${p*100}%"></i></div>
   <div class="mut" style="font-size:.78rem"><small data-eg="${e.id}" style="font-size:inherit">${rd?'✨ Ready! Click to hatch':'Hatching in '+Math.max(1,Math.ceil((EGG_T-(now-e.t0))/1000))+'s'}</small></div>
   <div class="kv"><span>Hatches as</span><b>${e.sp}</b></div><div class="kv"><span>Parent potential</span><b>${Math.round((e.pa||1)*100)}%</b></div>
   <button class="pri cehatch" data-cehatch="${e.id}" ${rd?'':'disabled'}>${rd?'🥚 Hatch now':'Not ready yet'}</button>`;
}

// ---------- render ----------
function rC(){
  const egg=CE.sel!=null&&eggs.find(q=>q.id==CE.sel);if(CE.sel!=null&&!egg)CE.sel=null;
  if(party.length)rC0();else{$('cl').innerHTML='';$('cd').innerHTML=''}
  $('cl').insertAdjacentHTML('afterbegin',ceEggRows());
  if(CE.hat||egg)$('cl').querySelectorAll('[data-i].on').forEach(b=>b.classList.remove('on'));
  if(CE.hat){ceHatchPanel();return}
  if(egg){ceEggInfo(egg);ceEggPV(egg)}
  else if(party.length){$('cvw').classList.remove('hatching');cmpPV(party[Math.min(cmpSel,party.length-1)])}
}
$('cl').onclick=e=>{const b=e.target.closest('button');if(!b||CE.hat)return;
  if(b.dataset.cegg){const id=+b.dataset.cegg,eg=eggs.find(q=>q.id==id);if(!eg)return;if(eggRdy(eg))return hatchEgg(id);CE.sel=id;rC();return}
  if(b.dataset.i!=null){CE.sel=null;cmpSel=+b.dataset.i;rC()}};
$('cd').addEventListener('click',e=>{const h=e.target.closest('[data-cehatch]');if(h){e.stopImmediatePropagation();if(!h.disabled)hatchEgg(+h.dataset.cehatch);return}
  if(e.target.id=='ceOk'){e.stopImmediatePropagation();ceDone()}},true);
function openCmp(focusEggs){if(focusEggs&&!CE.hat){const r=eggs.find(eggRdy)||eggs[0];if(r&&!eggRdy(r))CE.sel=r.id}$('inc').classList.add('hide');$('cmp').classList.remove('hide');rC();if(focusEggs)$('cl').scrollTop=0}
function openInc(){openCmp(true)}
$('cmpBtn').onclick=()=>openCmp(false);
$('incBtn').onclick=openInc;
function rI(){if(!$('cmp').classList.contains('hide')&&!CE.hat)rC()}
// U toggles the merged window like P does
addEventListener('keydown',e=>{const t=e.target;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'))return;if(e.key.toLowerCase()!='u'||e.ctrlKey||e.metaKey)return;
  if(!$('cmp').classList.contains('hide')){e.stopImmediatePropagation();$('cmp').classList.add('hide')}},true);
// keep the egg list fresh when an egg becomes ready while the window is open
{const f=hatchCheck;hatchCheck=function(){const n=eggRdyN;const r=f.apply(this,arguments);if(eggRdyN!==n&&!$('cmp').classList.contains('hide')&&!CE.hat)rC();return r}}

// ---------- hatching inside the window ----------
function hatchEgg(id){const i=eggs.findIndex(e=>e.id==id);if(i<0||!eggRdy(eggs[i]))return;const e=eggs.splice(i,1)[0];e.basic=true;const c=hatch(e);
  eggRdyN=-1;CE.sel=null;$('bag').classList.add('hide');hq.push({egg:e,c});if(!hAct)nextHatch()}
function nextHatch(){
  const h=hq.shift();
  if(!h){hAct=false;CE.hat=null;$('hatch').classList.add('hide');refreshOpen();return}
  hAct=true;CE.hat={c:h.c,egg:h.egg,done:false};const c=h.c;cmpSel=Math.max(0,party.indexOf(c));
  $('inc').classList.add('hide');$('hatch').classList.add('hide');$('cmp').classList.remove('hide');rC();
  const E=ceEggMesh(h.egg),grp=new THREE.Group(),eggG=E.g,top=E.top,bot=E.bot,mat=E.mat,ec=E.ec;grp.add(eggG);
  const m=cr(c),cp=new THREE.Group(),inner=new THREE.Group();inner.add(m);cp.add(inner);pvFit(inner,1.6);cp.scale.setScalar(.001);grp.add(cp);
  const dots=[];let t0=null,burst=false,flash=0;const H=CE.hat;
  const res=()=>{if(H.done)return;H.done=true;if(CE.hat===H)ceHatchPanel();say('The egg hatched! '+nm(c)+' · Overall grade '+ovG(c)[1]);if(typeof sfx=='function')sfx('chime')};
  $('cvw').classList.add('hatching');
  const ok=pvShow($('cvw'),grp,(now,dt)=>{
    if(t0==null)t0=now;const t=(now-t0)/1000;
    if(t<2.2){const a=Math.min(1,t/2.2);eggG.rotation.z=Math.sin(t*(18+a*26))*.12*a;eggG.rotation.x=Math.sin(t*23)*.05*a;eggG.position.y=.72+Math.abs(Math.sin(t*10))*.03*a;
      mat.emissiveIntensity=a*.9;PV.pl.color.setHex(ec);PV.pl.intensity=a*1.5}
    else{
      if(!burst){burst=true;flash=1;if(typeof sfx=='function')sfx('brk',.6);
        for(let i=0;i<40;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.05,6,5),new THREE.MeshBasicMaterial({color:i%2?ec:0xffffff}));d.position.set(0,.9,0);d.userData.v=new THREE.Vector3((Math.random()-.5)*3,1.5+Math.random()*3,(Math.random()-.5)*3);grp.add(d);dots.push(d)}
        top.userData.v=new THREE.Vector3(.8,3.2,-.4)}
      const k=t-2.2;
      top.position.addScaledVector(top.userData.v,dt);top.userData.v.y-=2.5*dt;top.rotation.z+=dt*2.5;
      bot.rotation.z=Math.min(.3,k*.6);if(k>1.1)eggG.scale.multiplyScalar(Math.max(.9,1-dt*3));if(k>1.5)eggG.visible=false;
      PV.pl.color.setHex(0xffffff);PV.pl.intensity=flash*8;flash=Math.max(0,flash-dt*2.2);mat.emissiveIntensity=Math.max(0,.9-k);
      const e=Math.min(1,k/1.0),sc=1-Math.pow(1-e,3);cp.scale.setScalar(Math.max(.001,sc));cp.rotation.y=k*1.4;if(m.rig)m.rig(now,false,0);
      dots.forEach(d=>{d.userData.v.y-=4*dt;d.position.addScaledVector(d.userData.v,dt);d.scale.multiplyScalar(Math.max(0,1-dt*1.2))});
      if(k>1.6)res();
    }});
  if(!ok)res();
}
function ceHatchPanel(){
  const H=CE.hat;if(!H)return;
  if(!H.done){$('cd').innerHTML=`<div class="cest wait">Your egg is hatching…</div><div style="text-align:center">${en(H.egg)}</div>`;return}
  const more=hq.length;
  $('cd').innerHTML=`<div class="cest">It hatched!</div><div class="cehr hr">${hatchInfo(H.c)}</div>
   <div class="cehb"><button class="pri" id="ceOk">${more?'Next egg ('+more+' more) ›':'Continue'}</button></div>`;
  $('cd').scrollTop=0;setTimeout(()=>{const b=$('ceOk');if(b&&!matchMedia('(pointer:coarse)').matches)b.focus({preventScroll:true})},30);
}
function ceDone(){const H=CE.hat;if(!H||!H.done)return;const i=party.indexOf(H.c);if(i>=0)cmpSel=i;CE.hat=null;nextHatch()}
// closing the window mid-hatch skips the show: the companions are already in your party
new MutationObserver(()=>{if($('cmp').classList.contains('hide')&&CE.hat){const names=[CE.hat.c,...hq.map(h=>h.c)].map(c=>nm(c));CE.hat=null;hq.length=0;hAct=false;PV.run=false;
  say('🥚 Hatched: '+names.join(', ')+'. Find '+(names.length>1?'them':'it')+' in Companions & Eggs (P).')}}).observe($('cmp'),{attributes:true,attributeFilter:['class']});
