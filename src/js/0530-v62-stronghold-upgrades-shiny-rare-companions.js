// ================= v62: stronghold upgrades · shiny & rare companions · companion talents =================

// ---------------- 1. STRONGHOLD UPGRADES ----------------
var SH={lv:{}};
const SHU=[
 {k:'train',n:'Training Grounds',i:'⚔️',col:0xc84a3a,m:[['wood',12],['iron',6]],d:l=>'+'+[0,4,8,12][l]+'% hero attack'},
 {k:'walls',n:'Bastion Walls',i:'🛡️',col:0x7a8aa0,m:[['stone',15],['Rock Core',5]],d:l=>'+'+[0,5,10,15][l]+'% hero max health'},
 {k:'tower',n:'Scholar’s Tower',i:'📚',col:0x6a5ad0,m:[['glowcap',10],['crystal',6]],d:l=>'+'+[0,5,10,15][l]+'% XP from everything'},
 {k:'den',n:'Beast Den',i:'🐾',col:0x4a9a5a,m:[['wood',12],['bone',10]],d:l=>'+'+[0,5,10,15][l]+'% to every companion stat'},
 {k:'hatch',n:'Hatchery',i:'🥚',col:0xd8a84a,m:[['fiber',12],['Silk Gland',5]],d:l=>l?'Eggs hatch in '+[60,45,30,20][l]+'s · +'+l+'% shiny & rare chance':'Eggs hatch in 60s'},
 {k:'treas',n:'Treasury',i:'💰',col:0xe0c040,m:[['stone',12],['iron',8]],d:l=>'+'+[0,10,20,30][l]+'% gold from monsters'}];
const SHC=[null,{g:600,x:1,b:0},{g:3500,x:2.5,b:2},{g:12000,x:5,b:4}];
// shops (everything except the Trading Post must be built)
const SHOPS=[
 {k:'magic',n:'Magic Shop',i:'🔮',g:400,m:[['glowcap',10],['Rock Core',4]],d:'Sells spell scrolls and enchanted wares'},
 {k:'cook',n:'Cooking Hearth',i:'🍳',g:250,m:[['stone',10],['wood',10]],d:'Cook meals that boost your stats'},
 {k:'alch',n:'Alchemy Table',i:'⚗️',g:300,m:[['glowcap',8],['bone',6]],d:'Brew potions, elixirs and fusion catalysts'},
 {k:'merchant',n:'Curio Shop',i:'🧳',g:500,m:[['wood',15],['fiber',10]],d:'Mystery eggs, potion bundles and a rune — new stock every 20 minutes'},
 {k:'trainer',n:'Beast Trainer',i:'🦴',g:600,m:[['fiber',10],['Silk Gland',6]],d:'Pay to train a companion up one level'},
 {k:'bard',n:'Bard’s Stage',i:'🎵',g:400,m:[['wood',12],['petals',8]],d:'A song that grants Inspired (+10% XP, +5% stats) every 20 minutes'},
 {k:'sage',n:'Rune Sanctum',i:'🔯',g:1500,m:[['crystal',6],['Ectoplasm',6]],d:'Buy any creature rune'}];
SH.shop={};
function shopBuilt(k){return typeof SH!='undefined'&&!!(SH.shop&&SH.shop[k])}
const shL=k=>SH.lv[k]|0;
const matN=k=>{const i=matInfo(k);return [i[1],RES[k]?i[0]:k]};
function shCost(u,l){const c=SHC[l];return u.m.map(([k,n])=>[k,Math.round(n*c.x)])}
function shPay(gc,ms){gold-=gc;ms.forEach(([k,n])=>{mats[k]=(mats[k]||0)-n;if(mats[k]<=0&&!RES[k])delete mats[k];if(RES[k]&&mats[k]<0)mats[k]=0})}
const shHas=ms=>ms.every(([k,n])=>(mats[k]||0)>=n);
const costH=(g,ms)=>'🪙 '+g+' · '+ms.map(([k,n])=>{const q=matN(k),h=mats[k]||0;return `<span style="color:${h>=n?'#bfe8a0':'#f0a0a0'}">${q[0]} ${n} ${q[1]}</span> <span class="mut">(${h})</span>`}).join(' · ');
function shApply(){EGG_T=[60000,45000,30000,20000][shL('hatch')];hsDirty();try{shBuild();shSites()}catch(err){console.warn(err)}}
{const f=HS;HS=function(){const s=f.apply(this,arguments);if(s&&!s._sh){s._sh=1;const a=1+[0,.04,.08,.12][shL('train')],h=1+[0,.05,.1,.15][shL('walls')];
  if(s.pa!=null)s.pa*=a;if(s.ma!=null)s.ma*=a;if(s.hp!=null)s.hp*=h;s.xp=(s.xp||0)+[0,.05,.1,.15][shL('tower')]}return s}}
{const f=lootE;lootE=function(e){const g0=gold;const r=f.apply(this,arguments);const dg=gold-g0,b=[0,.1,.2,.3][shL('treas')];if(dg>0&&b){const x=Math.round(dg*b);gold+=x}return r}}
function shCanBuy(u){const l=shL(u.k);if(l>=3)return [false,'Fully upgraded'];const c=SHC[l+1];
  if(bossDone.size<c.b)return [false,'Needs '+c.b+' Sovereigns defeated'];if(gold<c.g)return [false,'Not enough gold'];if(!shHas(shCost(u,l+1)))return [false,'Not enough materials'];return [true,'']}
function shBuy(k){const u=SHU.find(q=>q.k==k);if(!u)return;const ok=shCanBuy(u);if(!ok[0])return say(ok[1]+'.');const l=shL(k)+1;
  shPay(SHC[l].g,shCost(u,l));SH.lv[k]=l;shApply();
  banner('🏰 '+u.n.toUpperCase()+' · LEVEL '+l,u.d(l),'Duskhold grows stronger');sfx('power');hud();ui();rX();try{saveGame(true)}catch(_){}}
function shopCan(o){if(shopBuilt(o.k))return [false,'Built'];if(gold<o.g)return [false,'Not enough gold'];if(!shHas(o.m))return [false,'Not enough materials'];return [true,'']}
function shopBuy(k){const o=SHOPS.find(q=>q.k==k);if(!o)return;const ok=shopCan(o);if(!ok[0])return say(ok[1]+'.');shPay(o.g,o.m);SH.shop[k]=1;shApply();
  banner('🔨 '+o.n.toUpperCase()+' OPENS',o.d,'Find it in Duskhold');sfx('power');hud();ui();rX();try{saveGame(true)}catch(_){}}
var shTab='shops';
XR.hold=()=>{$('xwT').textContent='🏰 Stronghold Steward';$('xwS').textContent='Duskhold · 🪙 '+gold+' · '+bossDone.size+' Sovereigns defeated';
  const tabs=`<div class="tabs" style="display:flex;gap:6px;margin-bottom:8px"><button class="${shTab=='shops'?'pri':''}" data-sht="shops">🔨 Shops (${SHOPS.filter(o=>shopBuilt(o.k)).length}/${SHOPS.length})</button><button class="${shTab=='up'?'pri':''}" data-sht="up">🏰 Upgrades</button></div>`;
  let b='';
  if(shTab=='shops')b='<div class="rows">'+SHOPS.map(o=>{const bt=shopBuilt(o.k),ok=shopCan(o);return `<div class="rw" style="--rc:${bt?'#6ee7b7':'#c9a24a'}"><span class="rn">${o.i} <b>${o.n}</b><small>${o.d}${bt?'':'<br>Cost: '+costH(o.g,o.m)}</small></span>
    <span class="ra">${bt?'<em style="color:#6ee7b7">✔ Open</em>':`<button class="pri" data-shs="${o.k}" ${ok[0]?'':'disabled'} title="${ok[1]}">Build</button>`}</span></div>`}).join('')+'</div>';
  else b='<div class="rows">'+SHU.map(u=>{const l=shL(u.k),c=SHC[l+1],ok=shCanBuy(u),pips='◆'.repeat(l)+'◇'.repeat(3-l);
    const cost=c?costH(c.g,shCost(u,l+1))+(c.b?' · 👑 '+c.b+' Sovereigns':''):'';
    return `<div class="rw" style="--rc:#${u.col.toString(16).padStart(6,'0')}"><span class="rn">${u.i} <b>${u.n}</b> <span style="color:#f0cc72;letter-spacing:2px">${pips}</span>
      <small>${l?'Now: '+u.d(l):'Not built yet'}${c?'<br>Next: '+u.d(l+1)+'<br>Cost: '+cost:''}</small></span>
      <span class="ra">${l>=3?'<em style="color:#6ee7b7">✔ Max</em>':`<button class="pri" data-shb="${u.k}" ${ok[0]?'':'disabled'} title="${ok[1]}">${l?'Upgrade':'Build'}</button>`}</span></div>`}).join('')+'</div>';
  $('xwB').innerHTML=tabs+b;
  $('xwF').innerHTML='<span class="mut dtl">'+(shTab=='shops'?'The Trading Post is always open. Every other shop has to be built — gather wood, stone, fibers, glow caps and the like in the portal maps, and collect monster parts like Rock Core, Silk Gland and Ectoplasm.':'Upgrades are permanent and shown as banners around Duskhold. Higher levels need more materials and defeated Sovereigns.')+'</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='hold')return;const t=e.target.closest('[data-shb],[data-shs],[data-sht]');if(!t||t.disabled)return;
  if(t.dataset.sht){shTab=t.dataset.sht;rX()}else if(t.dataset.shs)shopBuy(t.dataset.shs);else shBuy(t.dataset.shb)});
// the steward and the banners in Duskhold
var SHM={st:null,pil:{}};
{const f=townPortalPrompt;townPortalPrompt=function(T){let r=f(T);
  if(r&&/hearth/i.test(r.label)&&!shopBuilt('cook'))r={label:'🔨 Cooking Hearth · build it at the Stronghold Steward',fn:()=>{shTab='shops';openX('hold')}};
  else if(r&&/alchemy/i.test(r.label)&&!shopBuilt('alch'))r={label:'🔨 Alchemy Table · build it at the Stronghold Steward',fn:()=>{shTab='shops';openX('hold')}};
  if(r)return r;if(T&&SHM.st&&Math.hypot(pl.position.x-SHM.st.x,pl.position.z-SHM.st.z)<2.6)return {label:'F · Stronghold Steward',fn:()=>openX('hold')};
  if(T)for(const q of SHM.vsite||[]){if(Math.hypot(pl.position.x-q.x,pl.position.z-q.z)<2.4)return {label:'🔨 '+q.n+' · build it at the Stronghold Steward',fn:()=>{shTab='shops';openX('hold')}}}
  return null}}
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.sh=Object.assign({},SH.lv);o.shp=Object.assign({},SH.shop);return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);SH.lv={};SH.shop={};if(s&&s.sh&&typeof s.sh=='object')SHU.forEach(u=>{const v=s.sh[u.k]|0;if(v>0)SH.lv[u.k]=Math.min(3,v)});
  if(s&&s.shp&&typeof s.shp=='object')SHOPS.forEach(o=>{if(s.shp[o.k])SH.shop[o.k]=1});shApply();return r}}
// visitors are now permanent shops once built
{const T=TOWNS[0];if(T)T.vsp=[[T.cx+13,T.cy-4],[T.cx+13,T.cy+5],[T.cx-7,T.cy+15],[T.cx+7,T.cy+15]]}
function visHere(v){return shopBuilt(v.k)}
VIS.forEach(v=>{v.n={merchant:'Curio Merchant',trainer:'Beast Trainer',bard:'Bard',sage:'Rune Sage'}[v.k]||v.n});
{const f=visTick;visTick=function(){VIS.forEach(v=>visShown.add(v.k+0));f.apply(this,arguments);
  VIS.forEach((v,i)=>{if(v.g&&!v.g.stall){v.g.stall=1;const T=TOWNS[0],dx=T.cx-v.x,dz=T.cy-v.z,l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l,cx=v.x+ux*.95,cz=v.z+uz*.95,ry=Math.atan2(ux,uz);
    const st=new THREE.Group();st.position.set(cx,0,cz);st.rotation.y=ry;const col=[0x7a3a2a,0x3a6a3a,0x6a2a5a,0x2a3a7a][i%4];
    twStall(st,col);
    v.g.add(st)}})}}
{const f=XR.visitor;XR.visitor=()=>{f();$('xwS').textContent=$('xwS').textContent.replace('Passing through town','Duskhold shop').replace('Visiting your Realm','Duskhold shop');
  $('xwF').innerHTML='<span class="mut dtl">'+(xwArg=='merchant'?'New stock every 20 minutes.':xwArg=='bard'?'One song every 20 minutes.':'A permanent shop in Duskhold.')+'</span>'}}
setInterval(()=>{try{if(visState.bard&&!visState.bardT)visState.bardT=Date.now();if(visState.bardT&&Date.now()-visState.bardT>20*60000){visState.bard=0;visState.bardT=0}}catch(_){}},5000);
{const f=openShop;openShop=function(k){if(k=='x'&&!shopBuilt('magic')){shTab='shops';return openX('hold')}return f.apply(this,arguments)}}
setTimeout(()=>{try{shApply()}catch(err){console.warn(err)}},0);

// ---------------- 2. SHINY & RARE COMPANIONS ----------------
const RVAR={Albino:0xece6da,Obsidian:0x1c1c24,Crimson:0x9a1c26,Verdant:0x2f8a4a,Azure:0x2f62c8,Amethyst:0x7a3ab0};
function rollRare(c,boost){const b=(boost||0)/100+shL('hatch')*.01,r=Math.random();
  if(r<.015+b*.5){c.shn=1;rollMod(c);return 'shiny'}
  if(r<.015+b*.5+.06+b){const k=Object.keys(RVAR)[Math.random()*6|0];c.rv=k;c.cl=c.cl.slice();c.cl[0]=RVAR[k];return 'rare'}return ''}
{const f=hatch;hatch=function(e){const c=f.apply(this,arguments);if(c){const r=rollRare(c);if(r)c._new=r}return c}}
{const f=cStat;cStat=function(c,k){let v=f(c,k);if(c&&!c.st){if(c.shn)v*=1.1;else if(c.rv)v*=1.05;const d=[0,.05,.1,.15][shL('den')];if(d&&party.includes(c))v*=1+d;
  const t=c.tal;if(t){if((k=='pa'||k=='ma')&&t.fer)v*=1+.04*t.fer;if(k=='hp'&&t.tou)v*=1+.05*t.tou;if((k=='pd'||k=='md')&&t.grd)v*=1+.04*t.grd}}return v}}
// shiny companions glitter
{const f=cr;cr=function(c){const g=f.apply(this,arguments);if(c&&c.shn&&g){try{const N=18,pos=new Float32Array(N*3);for(let i=0;i<N;i++){const a=i/N*6.283,r=.55+(i%3)*.12;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=.25+((i*7)%10)/10*.9;pos[i*3+2]=Math.sin(a)*r}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const p=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffe27a,size:.09,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));
  p.onBeforeRender=()=>{const t=performance.now();p.rotation.y=t/900;p.material.opacity=.55+.4*Math.sin(t/180)};g.add(p)}catch(err){}}return g}}
{const f=hatchInfo;hatchInfo=function(c){let h=f.apply(this,arguments);if(c.shn)h='<div class="shb shn">✨ SHINY ✨<small>Glittering · +10% all stats · bonus modifier</small></div>'+h;else if(c.rv)h='<div class="shb rv">💎 RARE '+c.rv.toUpperCase()+' VARIANT<small>Unusual colors · +5% all stats</small></div>'+h;return h}}
{const f=hatchEgg;hatchEgg=function(id){const r=f.apply(this,arguments);const c=party[party.length-1];if(c&&c._new){const k=c._new;delete c._new;setTimeout(()=>{if(k=='shiny'){say('✨ <b>A SHINY companion!</b> It glitters with gold.');sfx('chime')}else say('💎 A rare <b>'+c.rv+'</b> variant hatched!')},2400)}return r}}

// ---------------- 3. COMPANION TALENTS ----------------
const CTAL=[
 {k:'fer',n:'Ferocity',i:'🗡️',mx:5,d:r=>'+'+4*r+'% physical & magical attack'},
 {k:'tou',n:'Toughness',i:'❤️',mx:5,d:r=>'+'+5*r+'% health'},
 {k:'grd',n:'Guard',i:'🛡️',mx:5,d:r=>'+'+4*r+'% physical & magical defense'},
 {k:'pre',n:'Precision',i:'🎯',mx:3,d:r=>6*r+'% chance for a hit to strike twice'},
 {k:'hid',n:'Thick Hide',i:'🪨',mx:3,d:r=>'Takes '+5*r+'% less damage'},
 {k:'wnd',n:'Second Wind',i:'💨',mx:3,d:r=>'Below 30% health, heals '+[0,15,25,35][r]+'% (once a minute)'}];
const ctPts=c=>Math.floor((c.l||1)/4),ctUsed=c=>Object.values(c.tal||{}).reduce((a,b)=>a+(b|0),0),ctFree=c=>Math.max(0,ctPts(c)-ctUsed(c));
{const f=compHit;compHit=function(c,e,mult,fx){const d=f.apply(this,arguments);const r=c&&c.tal&&c.tal.pre;if(r&&d>0&&e&&!e.dead&&Math.random()<.06*r){hurt(e,d,{col:0xffd24a},true);dn(e.m.position,'Double!','#ffd24a',-30,600)}return d}}
{const f=dmgCE;dmgCE=function(a,b,k,p){const d=f.apply(this,arguments);const r=b&&b.tal&&b.tal.hid;return r&&party.includes(b)?Math.max(1,Math.round(d*(1-.05*r))):d}}
setInterval(()=>{try{const now=Date.now();party.slice(0,2).forEach(c=>{const r=c&&c.tal&&c.tal.wnd;if(!r||c.h<=0)return;const mx=M(c);if(c.h<mx*.3&&now-(c.swT||0)>60000){c.swT=now;c.h=Math.min(mx,Math.round(c.h+mx*[0,.15,.25,.35][r]));const i=party.indexOf(c);if(fols[i])dn(fols[i].position,'Second Wind','#7ee8a0',-30,900)}})}catch(_){}},500);
function ctHTML(c){const fr=ctFree(c);let h=`<div class="ctal"><div class="cth">✦ Talents <span class="mut">${fr} point${fr==1?'':'s'} to spend · 1 point every 4 levels</span>${ctUsed(c)?'<button data-ctr="1">Reset</button>':''}</div><div class="ctg">`;
  CTAL.forEach(t=>{const r=(c.tal&&c.tal[t.k])|0;h+=`<button class="ctn${r?' on':''}" data-ctal="${t.k}" ${fr&&r<t.mx?'':'disabled'} title="${t.d(Math.min(t.mx,r+1))}"><span class="cti">${t.i}</span><b>${t.n}</b><span class="ctr">${r}/${t.mx}</span><small>${r?t.d(r):t.d(1)+(r?'':' (rank 1)')}</small></button>`});
  return h+'</div></div>'}
{const f=rC0;rC0=function(){f.apply(this,arguments);if(!party.length)return;const c=party[cmpSel];if(!c)return;const cd=$('cd');if(!cd)return;cd.insertAdjacentHTML('beforeend',ctHTML(c))}}
document.addEventListener('click',e=>{const t=e.target.closest('[data-ctal],[data-ctr]');if(!t||t.disabled||!$('cd')||!$('cd').contains(t))return;const c=party[cmpSel];if(!c)return;
  if(t.dataset.ctr){c.tal={};say('✦ '+c.n+'’s talents were reset.')}else{const T=CTAL.find(q=>q.k==t.dataset.ctal);c.tal=c.tal||{};if(!T||ctFree(c)<=0||(c.tal[T.k]|0)>=T.mx)return;c.tal[T.k]=(c.tal[T.k]|0)+1}
  c.h=Math.min(c.h,M(c));ui();if(typeof rC0=='function')rC0()});
document.head.insertAdjacentHTML('beforeend',`<style>
.shb{text-align:center;font-weight:800;letter-spacing:.12em;padding:6px;border-radius:8px;margin-bottom:6px}.shb small{display:block;font-weight:500;letter-spacing:0;font-size:.72rem;opacity:.85}
.shb.shn{background:linear-gradient(90deg,#5a4210,#a8822a,#5a4210);color:#fff5c8;box-shadow:0 0 14px rgba(255,210,90,.5)}.shb.rv{background:rgba(140,90,220,.25);color:#e2d4ff;border:1px solid rgba(180,140,255,.5)}
.ctal{margin-top:10px;border-top:1px solid rgba(255,255,255,.1);padding-top:8px}.cth{display:flex;gap:8px;align-items:center;font-weight:700;color:#f0cc72;font-size:.85rem;flex-wrap:wrap}.cth .mut{font-weight:400;font-size:.72rem}.cth button{margin-left:auto;font-size:.7rem;padding:2px 8px}
.ctg{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}.ctn{display:grid;grid-template-columns:auto 1fr auto;gap:2px 6px;align-items:center;text-align:left;padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.25);color:#ddd;cursor:pointer;font-size:.78rem}
.ctn.on{border-color:#c9a24a;background:rgba(201,162,74,.12)}.ctn:disabled{cursor:default;opacity:.75}.ctn:not(:disabled):hover{border-color:#f0cc72}.cti{grid-row:span 2;font-size:1.1rem}.ctr{color:#f0cc72;font-weight:700}.ctn small{grid-column:2/4;color:#9aa;font-size:.68rem}
</style>`);

// ---- v66: leaner loot — monster drops -30% (wave trial: a further -50%), eggs -30%; bosses keep their guaranteed loot ----
var LT={on:0};
{const f=lootE;lootE=function(e){LT.on=!e||e.boss||(e.c&&e.c.boss)?0:e.wv?2:1;try{return f.apply(this,arguments)}finally{LT.on=0}}}
{const f=drop;drop=function(kind,data,p,r){if(LT.on){const keep=.7*(LT.on==2?.5:1);if(Math.random()>keep)return}return f.apply(this,arguments)}}

