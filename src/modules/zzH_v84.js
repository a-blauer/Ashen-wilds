// ================= v84: HUD rework, companion care, Kindlelight gloom, material hints, courtyard =================

// (the courtyard walls are built at runtime by cyWalls in zzI_v85.js, since the courtyard grows)

// ---------------- Kindlelight: thick green gloom, drifting ground mist, and dimmer days ----------------
var KG={k:0,col:new THREE.Color(0x1c3414),mist:null};
KG.mist=(()=>{const g=new THREE.Group(),N=46;g.visible=false;scene.add(g);
  for(let i=0;i<N;i++){const m=new THREE.SpriteMaterial({map:SPR,color:0x5a8a34,transparent:true,opacity:0,depthWrite:false});const s=new THREE.Sprite(m);
    s.userData={ph:Math.random()*6.28,sp:.25+Math.random()*.35,w:7+Math.random()*7,init:false};s.scale.set(s.userData.w,s.userData.w*.38,1);g.add(s)}
  return g})();
function kgPlace(s,P,far){const a=Math.random()*6.283,r=far?18+Math.random()*10:Math.random()*28;s.position.x=P.x+Math.cos(a)*r;s.position.z=P.z+Math.sin(a)*r;s.userData.init=true}
function kGloom(dt,now){
  const on=!inRealm&&!inDun&&ZA.cur===0,k0=Math.min(1,(dt||.016)*1.2+.004);KG.k+=((on?1:0)-KG.k)*k0;const k=KG.k;
  if(k<.003){KG.mist.visible=false;return}
  const day=Math.max(0,Math.min(1,(typeof ATM!='undefined'&&ATM.day)||0)),dim=1-k*(.22+.5*day);
  sun.intensity*=dim;hemi.intensity*=dim;
  scene.fog.color.lerp(KG.col,.6*k).multiplyScalar(1-.3*k*day);scene.fog.density+=.014*k;scene.background=scene.fog.color;
  if(typeof POST!='undefined'&&POST.u&&typeof PSXON!='undefined'&&PSXON)POST.u.ex.value*=1-k*(.06+.2*day);
  const P=pl.position,M=KG.mist;M.visible=true;
  M.children.forEach((s,i)=>{const u=s.userData;if(!u.init)kgPlace(s,P,false);
    s.position.x+=Math.sin(now/7000+u.ph)*u.sp*(dt||.016);s.position.z+=Math.cos(now/8000+u.ph)*u.sp*(dt||.016);
    const dx=s.position.x-P.x,dz=s.position.z-P.z;if(dx*dx+dz*dz>30*30)kgPlace(s,P,true);
    s.position.y=GH(s.position.x,s.position.z)+.7+Math.sin(now/2600+u.ph)*.25;
    s.material.opacity=k*(.2+.08*Math.sin(now/1900+u.ph*2))})}
{const f=atmos;atmos=function(dt,now){f.apply(this,arguments);try{kGloom(dt,now)}catch(_){}}}

// ---------------- team-up attack removed ----------------
teamGain=function(){};teamUp=function(){};teamUI=function(){const d=$('tub');if(d)d.classList.add('hide')};
{const mb=$('mbtn');if(mb){const b=mb.querySelector('[data-m=team]');if(b)b.remove()}}

// ---------------- HUD layout: location box top-middle, character info above the hotbar, one bar per companion ----------------
document.head.insertAdjacentHTML('beforeend',`<style>
#topl{background:none!important;border:none!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;padding:0!important;width:auto!important;pointer-events:none}
#topl>.row,#topl>#areaT,#topl>#act,#tub,#topl>#buffs{display:none!important}
#cbars{display:flex;flex-direction:column;gap:6px;pointer-events:auto}
.cbar{display:flex;align-items:center;gap:8px;padding:5px 8px 5px 5px;width:236px;box-sizing:border-box;border-radius:10px}
.cbar.emp{box-shadow:0 0 0 1px #fbbf24,0 0 12px rgba(251,191,36,.35)}
.cbar.dead{filter:grayscale(.7)}
.cbar .cpic{width:44px;height:44px;flex:0 0 44px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 50% 35%,#3a3448,#14111a);border:2px solid rgba(236,200,130,.45);display:flex;align-items:center;justify-content:center;font-size:1.4rem}
.cbar .cpic img{width:100%;height:100%;object-fit:cover;display:block}
.cbar .cinf{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.cbar .cnm{font-size:.74rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cbar .cnm small{color:var(--mut);font-weight:600;margin-left:4px}
.cbar .chp{position:relative;height:12px;border-radius:6px;background:rgba(0,0,0,.55);overflow:hidden;border:1px solid rgba(255,255,255,.12)}
.cbar .chp i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#16a34a,#4ade80);transition:width .2s}
.cbar .chp em{position:absolute;left:0;top:0;bottom:0;background:rgba(110,231,183,.35);transition:width .2s}
.cbar .chp span{position:relative;display:block;text-align:center;font-size:.6rem;line-height:12px;font-weight:700;text-shadow:0 1px 2px #000}
.cbar button{width:30px;height:30px;padding:0;font-size:.95rem;flex:0 0 30px}
.cbar button.on{background:linear-gradient(#f59e0b,#b45309);border-color:#fde047}
#locBox{position:absolute;left:50%;top:8px;transform:translateX(-50%);z-index:2;padding:5px 14px;font-size:.78rem;font-weight:600;white-space:nowrap;max-width:60%;overflow:hidden;text-overflow:ellipsis;pointer-events:none;text-align:center}
#tgt,#boss{top:46px}
body.mob #tgt{top:120px}
#chInfo{display:flex;align-items:center;justify-content:center;gap:6px 14px;flex-wrap:wrap;margin:0 auto 4px;padding:4px 12px;font-size:.76rem;font-weight:700;pointer-events:auto;max-width:100%;box-sizing:border-box}
#chInfo #lvT,#chInfo #goldT{white-space:nowrap}
#chInfo #buffs{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin:0}
#chInfo #buffs:empty{display:none}
.mi,.matline span,#crm span{cursor:help}
#mhint{position:fixed;z-index:60;max-width:280px;padding:8px 11px;font-size:.76rem;line-height:1.35;pointer-events:none;border-radius:8px;background:rgba(18,14,22,.96);border:1px solid #c9a24a;color:#f3e8d0;box-shadow:0 4px 16px #000a}
#mhint b{color:#f0cc72}
</style>`);
{const T=$('topl'),bm=$('bmid');
 const lb=document.createElement('div');lb.id='locBox';lb.className='glass';$('stage').appendChild(lb);
 const ci=document.createElement('div');ci.id='chInfo';ci.className='glass';const row=T.querySelector('.row');ci.appendChild($('lvT'));ci.appendChild($('goldT'));ci.appendChild($('buffs'));
 bm.insertBefore(ci,bm.firstChild);
 const cb=document.createElement('div');cb.id='cbars';T.appendChild(cb);
 cb.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();e.stopPropagation();
   if(b.dataset.rv!=null)reviveComp(+b.dataset.rv);else if(b.dataset.fd!=null)feedBest(+b.dataset.fd);else if(b.dataset.e!=null)toggleEmp(+b.dataset.e);hud()});
 // the "Your team" strip under the game screen is gone
 const pt=$('pty');if(pt){const r=pt.previousElementSibling;if(r&&r.classList.contains('bar-row'))r.style.display='none';pt.style.display='none'}}
// courtyard name
{const f=areaName;areaName=function(){try{if(!inRealm&&!inDun&&townAt(pl.position.x,pl.position.z,0)<0&&curMap()<0&&Math.hypot(pl.position.x-CYD.x,pl.position.z-CYD.y)<CYD.r+.8)return '🌲 Duskhold · Courtyard'}catch(_){}return f.apply(this,arguments)}}

// companion head portraits: render each companion's head once into a small picture
{const f=mkBones;mkBones=function(S){const r=f.apply(this,arguments);for(const k in r.bones)r.bones[k].name=k;return r}}
var CPIC={r:null,sc:null,cam:null,cache:{},q:[]};
function cpicKey(c){return [c.g.join(),c.cl.join(),c.v||'',c.tr||'',c.evo||0,c.shn?1:0,c.rv?1:0].join('|')}
function cpicInit(){if(CPIC.r)return true;try{const cv=document.createElement('canvas');cv.width=cv.height=112;
  CPIC.r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,preserveDrawingBuffer:true});CPIC.r.setClearColor(0,0);CPIC.r.setSize(112,112,false);
  CPIC.sc=new THREE.Scene();const h=new THREE.HemisphereLight(0xd8e4ff,0x40352a,1.0),d=new THREE.DirectionalLight(0xfff0dd,1.3),rim=new THREE.DirectionalLight(0x8ab0ff,.7);d.position.set(2,3,4);rim.position.set(-3,2,-2);CPIC.sc.add(h,d,rim);
  CPIC.cam=new THREE.PerspectiveCamera(30,1,.01,50);return true}catch(e){CPIC.r=null;return false}}
function cpicMake(c){
  if(!cpicInit())return null;const m=cr(c);if(!m)return null;m.position.set(0,0,0);m.rotation.set(0,0,0);CPIC.sc.add(m);
  try{if(m.rig)m.rig(0,false,0)}catch(_){}m.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(m),sz=box.getSize(new THREE.Vector3()),ctr=box.getCenter(new THREE.Vector3());
  let hd=null;const hb=m.getObjectByName('head');if(hb){hd=new THREE.Vector3();hb.getWorldPosition(hd)}
  let r0;if(hd){r0=Math.max(.24,Math.min(sz.x,sz.y,sz.z)*.48);hd.y+=r0*.1}
  else{hd=new THREE.Vector3(ctr.x,box.max.y-sz.y*.18,ctr.z+sz.z*.15);r0=Math.max(sz.x,sz.y*.36)*.55}
  const dist=r0/Math.tan(15*Math.PI/180)*1.15;CPIC.cam.position.set(hd.x+dist*.42,hd.y+dist*.12,hd.z+dist*.9);CPIC.cam.lookAt(hd);
  CPIC.r.render(CPIC.sc,CPIC.cam);const url=CPIC.r.domElement.toDataURL('image/png');CPIC.sc.remove(m);return url}
function cpic(c){const k=cpicKey(c);if(CPIC.cache[k]!==undefined)return CPIC.cache[k];CPIC.cache[k]=null;
  setTimeout(()=>{try{CPIC.cache[k]=cpicMake(c)||''}catch(e){CPIC.cache[k]=''}cbarSig='';hud()},0);return null}
var cbarSig='';
function cbarsRender(){
  const cb=$('cbars');if(!cb)return;const L=party.slice(0,2);
  const sig=L.map((c,i)=>[c.n,c.l,c.evo||0,c.tr,c.emp?1:0,c.h<=0?1:0,CPIC.cache[cpicKey(c)]?1:0,cpicKey(c)].join(':')).join('/');
  if(sig!==cbarSig){cbarSig=sig;
    cb.innerHTML=L.map((c,i)=>{const p=cpic(c),dead=c.h<=0;
      return `<div class="cbar glass${c.emp?' emp':''}${dead?' dead':''}" data-ci="${i}"><div class="cpic">${p?`<img src="${p}" alt="">`:em(c)}</div><div class="cinf"><div class="cnm">${(c.tr=='Universal'?'✦ ':'')+c.n}<small>Lv ${c.l}${c.evo?' '+'✦'.repeat(c.evo):''}</small></div><div class="chp"><em></em><i></i><span></span></div></div>`+
        (dead?`<button data-rv="${i}" class="rvb" title="Revive: costs 25% of your max health">💗</button>`:`<button data-e="${i}" class="${c.emp?'on':''}" title="Empower (${i?'R':'E'})">⚡</button><button data-fd="${i}" title="Feed the best food you have">🍖</button>`)+`</div>`}).join('')}
  L.forEach((c,i)=>{const el=cb.children[i];if(!el)return;const mx=M(c),h=Math.max(0,c.h),hot=c.fhot&&c.fhot.left>0?Math.min(mx-h,c.fhot.left):0;
    el.querySelector('.chp i').style.width=(100*h/mx)+'%';const g=el.querySelector('.chp em');g.style.left=(100*h/mx)+'%';g.style.width=(100*hot/mx)+'%';
    el.querySelector('.chp span').textContent=Math.round(h)+' / '+mx+(hot>=1?'  +'+Math.round(hot):'')});
}
{const f=hud;hud=function(){f.apply(this,arguments);try{const a=$('areaT'),lb=$('locBox');if(a&&lb&&lb.textContent!==a.textContent)lb.textContent=a.textContent;cbarsRender()}catch(e){}}}
setInterval(()=>{try{if(party.length)cbarsRender()}catch(_){}},250);

// ---------------- companion feeding: best food first, heals over time ----------------
const FEED_T=8;
function feedBest(i){const c=party[i];if(!c)return;if(c.h<=0)return say(nm(c)+' has fainted. Revive it with 💗 first.');
  const L=feedList();if(!L.length)return say('You have no food. Cook meals at the Cooking Hearth in Duskhold, or carry meat, fish, berries or vegetables.');
  feedComp(c,L[0])}
feedComp=function(c,k){
  if(!c||c.h<=0||!(cnt(k)>0))return;const mx=M(c),pend=c.fhot&&c.fhot.left>0?c.fhot.left:0;if(c.h+pend>=mx)return say(nm(c)+' is already full.');
  const v=feedVal(k),amt=Math.max(1,Math.round(mx*v));
  if(SUP[k])sup[k]--;else mats[k]--;
  c.fhot={left:pend+amt,rate:(pend+amt)/FEED_T};
  const i=party.indexOf(c),f=i>=0&&i<2?fols[i]:null;if(f&&f.visible){burst(gY(f.position,.8),0x6ee7b7,16,1.6,2,.6);dn(f.position,'🍖 +'+amt,'#6ee7b7',-10)}
  say(supIco(k)+' '+nm(c)+' happily eats the '+supNm(k)+' (+'+amt+' health over '+FEED_T+'s).');ui();hud()};
{const f=compRegen;compRegen=function(dt,now){f.apply(this,arguments);if(!(dt>0))return;
  party.forEach(c=>{const H=c&&c.fhot;if(!H||!(H.left>0))return;if(c.h<=0){c.fhot=null;return}const mx=M(c),d=Math.min(H.left,H.rate*dt);H.left-=d;c.h=Math.min(mx,c.h+d);if(c.h>=mx||H.left<=.01)c.fhot=null;c._ph=c.h})}}
{const f=feedHTML;feedHTML=function(c){return f.apply(this,arguments).replace('Better food heals more.','Better food heals more. Food heals over '+FEED_T+' seconds.').replace(/heals (\d+)% of max health/g,'heals $1% of max health over '+FEED_T+'s')}}

// ---------------- companion window: stat breakdown (base + level = total) and Universal in modifiers ----------------
{const f=rC0;rC0=function(){f.apply(this,arguments);try{if(!party.length)return;const c=party[cmpSel];if(!c)return;const cd=$('cd');if(!cd)return;
  const SK={'Health':'hp','Physical attack':'pa','Magical attack':'ma','Physical defense':'pd','Magical defense':'md'};
  const l0=c.l;let base={};c.l=1;try{for(const n in SK)base[SK[n]]=Math.round(cStat(c,SK[n]))}finally{c.l=l0}
  cd.querySelectorAll('.kv').forEach(r=>{const s=r.querySelector('span'),b=r.querySelector('b');if(!s||!b)return;const k=SK[s.textContent.trim()];if(!k)return;
    const tot=Math.round(cStat(c,k)),bs=base[k],lv=tot-bs;r.title='Base '+bs+' + '+lv+' from level '+c.l+' = '+tot;
    b.innerHTML=`<small class="mut" style="font-weight:600">${bs} base + ${lv} from Lv ${c.l} =</small> ${tot}`});
  if(c.tr=='Universal'){const secs=[...cd.querySelectorAll('.sec')].find(s=>s.textContent.trim().toLowerCase()=='modifiers');const box=secs&&secs.nextElementSibling;
    if(box&&!box.querySelector('.univ')){const n=box.querySelector('.mut');if(n&&n.textContent.trim()=='none')n.remove();
      box.insertAdjacentHTML('afterbegin','<span class="mod univ" title="Universal: can fuse with a companion of any family" style="border-color:#7cf0ff;color:#bff7ff">✦ Universal</span>')}}
}catch(e){}}}

// ---------------- materials: click one in any menu to see where it comes from ----------------
var MSRC=null;
function msrcBuild(){const S={},zn=i=>PMAP[i].n,zl=a=>{const u=[...new Set(a)].map(zn);return u.length?u.join(', '):''};
  const pz={};MAP.props.forEach(q=>{const r=regionAt(q[0],q[1]);(pz[q[2]]=pz[q[2]]||[]).push(r)});const zonesOf=ks=>zl(ks.flatMap(k=>(pz[k]||[]).filter(r=>r>=0)));
  const add=(n,ic,t)=>{S[n.toLowerCase()]={n,ic,t}};
  add('Wood','🪵','Chop trees (F next to a tree). The 🌲 Courtyard north-east of Duskhold has a grove; every portal zone has trees too.');
  add('Stone','🪨','Mine rocks (F next to a rock). The 🌲 Courtyard north-east of Duskhold has stone, and gains more nodes with every zone you complete. Also: '+zonesOf(['rock','grave','pillar'])+'.');
  add('Iron Ore','⛏️','A lucky find while mining rocks; higher Mining level finds it more often. Rocks are in the 🌲 Courtyard and '+zonesOf(['rock'])+'.');
  add('Crystal Shard','💎','Mine glowing crystals in '+(zonesOf(['crystal'])||'Burningeye Summit')+'. Falling meteors also leave crystals.');
  add('Plant Fiber','🌿','Gather bushes in '+zonesOf(['bush'])+'.');
  add('Petals','🌸','Pick flowers in '+zonesOf(['flower'])+'.');
  add('Glow Cap','✨','Pick glowing mushrooms in '+zonesOf(['mush'])+'.');add('Glow Caps','✨',S['glow cap'].t);
  add('Old Bone','🦴','Collect bone piles in '+zonesOf(['bones'])+'.');
  add('Clay','🧱','Stand by shallow water (not lava) and press F to wade for clay and water.');add('Shallow Water','💧',S.clay.t);
  // upgrade materials: dropped by monsters of the matching tier
  const tz=t=>zl(PMAP.map((p,i)=>p.t==t?i:-1).filter(i=>i>=0));
  UPM.forEach((u,i)=>add(u[0],u[1],'Dropped by monsters, elites and Sovereigns in '+(tz(i+1)||'tier '+(i+1)+' zones')+'. Camp chests and wave trials give more.'));
  // companion materials: dropped by creatures of that family
  const fOf=k=>{try{const en=EN[k]||{};return en.fam||famOf(k)}catch(_){return ''}};
  FAMK.forEach(fk=>{const F=FAMD[fk],zs=[];PMAP.forEach((p,i)=>{const L=(BIOEN[p.n]||[]).slice();try{CAMPS.forEach(C=>{if(C.pm===i&&C.th&&C.th.mem)C.th.mem.forEach(m=>L.push(m[0]))})}catch(_){}try{const B=BOSSES[i];if(B)L.push(B.sp)}catch(_){}
    if(L.some(k=>fOf(k)==fk))zs.push(i)});
    add(F.mat,F.mi,'Dropped by '+fk+' family creatures ('+F.i+')'+(zs.length?' — found in '+zl(zs):'')+'. Elites and Sovereigns drop more. Used to evolve companions.')});
  Object.keys(FAM||{}).forEach(k=>{const f=FAM[k];if(!S[f[0].toLowerCase()])add(f[0],f[1],'Dropped by '+k+' creatures in the portal zones.')});
  // supplies (meat, fish, seeds, runes...) carry their own description
  Object.keys(SUP||{}).forEach(k=>{const s=SUP[k];if(s&&s.n&&!S[s.n.toLowerCase()])add(s.n,s.i,s.d||(s.c=='food'?'Cook it at the Cooking Hearth in Duskhold.':s.c=='seed'?'Found while foraging and on monsters; plant it on a Farm Plot.':'Found in the wilds.'))});
  const meat=S['raw meat'];if(meat)meat.t='Dropped now and then by beasts, birds, dragons and earth creatures. You can also buy it at the Cooking Hearth market.';
  // dug soils and other realm items
  Object.keys(ITEMS||{}).forEach(k=>{if(k.slice(0,2)=='t:'){const it=ITEMS[k];if(it&&it.n&&!S[it.n.toLowerCase()])add(it.n,it.i,'Dig soil mounds in the portal zones (each zone gives its own soil).')}});
  return S}
function msrcFind(el){if(!MSRC)MSRC=msrcBuild();const names=Object.keys(MSRC).sort((a,b)=>b.length-a.length);
  for(let e=el,d=0;e&&d<3;e=e.parentElement,d++){if(e.id=='cmp'||e.classList&&e.classList.contains('modal'))break;
    const t=((e.getAttribute&&e.getAttribute('title'))||'')+' '+(e.textContent||'');if(t.length>60)continue;const lt=t.toLowerCase();
    for(const n of names)if(lt.includes(n))return MSRC[n]}
  return null}
function mhintShow(H,x,y){let d=$('mhint');if(!d){d=document.createElement('div');d.id='mhint';document.body.appendChild(d)}
  d.innerHTML=`<b>${H.ic} ${H.n}</b><br>${H.t}`;d.style.display='block';const w=d.offsetWidth,h=d.offsetHeight;
  d.style.left=Math.max(6,Math.min(innerWidth-w-6,x+12))+'px';d.style.top=Math.max(6,Math.min(innerHeight-h-6,y+14))+'px';clearTimeout(d._t);d._t=setTimeout(()=>{d.style.display='none'},5000)}
document.addEventListener('click',e=>{try{const t=e.target;if(!t||!t.closest)return;if(t.closest('#stage canvas')&&!t.closest('.glass,.modal,.win'))return;
  const inWin=t.closest('.modal,.glass,#xw,#cmp,#bag,#craft,#cr,.win,#tal,#fz');if(!inWin){const d=$('mhint');if(d)d.style.display='none';return}
  const b=t.closest('button');if(b&&(b.textContent||'').length>40)return;
  const H=msrcFind(t);if(H)mhintShow(H,e.clientX,e.clientY);else{const d=$('mhint');if(d)d.style.display='none'}}catch(_){}},true);
