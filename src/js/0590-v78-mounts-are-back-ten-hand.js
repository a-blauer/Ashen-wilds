// ================= v78: Mounts are back — ten hand-built mount models, sold only at the Stable in Duskhold (build it at the Steward) =================

// ---------------- 1. the mounts ----------------
var MOUNT_OLD={dusthound:1,bogstrider:1,ashwarg:2,mossback:2,cinderlynx:3,webrunner:3,bonecharger:4,galeroc:4,nightwarg:5,obsidrake:5};
{const NEW={
  pony:{n:'Duskmane Pony',i:'🐴',t:1,d:'A shaggy little pony bred in Duskhold. Steady, cheerful and never in a hurry to stop.'},
  boar:{n:'Tuskback Boar',i:'🐗',t:1,d:'Low, wide and bristling. It charges through brush like it holds a grudge against it.'},
  stag:{n:'Gravewood Stag',i:'🦌',t:2,d:'A pale stag from the haunted woods, crowned with antlers like bare branches.'},
  ram:{n:'Ironhorn Ram',i:'🐏',t:2,d:'A woolly mountain ram with curling iron-hard horns. Sure-footed on any slope.'},
  charger:{n:'Emberhoof Charger',i:'🐎',t:3,d:'A barded warhorse whose mane smoulders with living embers.'},
  raptor:{n:'Dune Strider',i:'🦖',t:3,d:'A two-legged sand runner. Its stride eats the road in great bounds.'},
  panther:{n:'Shadowstalk Panther',i:'🐆',t:4,d:'A silent black cat with glowing eyes. You barely feel it move.'},
  destrier:{n:'Bone Destrier',i:'💀',t:4,d:'A skeletal warhorse wreathed in ghost-fire. It never tires and never blinks.'},
  direwolf:{n:'Dread Wolf',i:'🐺',t:5,d:'A huge wolf from beyond the portals, with eyes like coals and a howl that empties camps.'},
  drake:{n:'Cinderwing Drake',i:'🐲',t:5,d:'A young drake broken to the saddle. Its belly glows with banked fire.'}};
  for(const k in MOUNTS)delete MOUNTS[k];Object.assign(MOUNTS,NEW);MNTK.length=0;Object.keys(NEW).forEach(k=>MNTK.push(k))}

// ---------------- 2. mount models ----------------

// ---------------- 3. riding (mounting was switched off in an earlier version) ----------------
function toggleMount(){
  if(riding)return dismount(true);
  if(!party.length||uiOpen())return;
  if(!mounts.length)return say('You have no mount yet. Build the Stable at the Stronghold Steward in Duskhold, then buy one there with gold.');
  if(inCombatNow())return say('You cannot summon a mount in combat.');
  if(typeof gat!='undefined'&&gat)gat=null;if(hero.chan)return;
  const m=mOf(mActive)||mounts[0];mActive=m.id;riding=m;mModel=mountModel(m.k);mModel.position.copy(pl.position);mModel.rotation.y=pl.rotation.y;scene.add(mModel);
  mLast={x:pl.position.x,z:pl.position.z};burst(gY(pl.position,.6),0xd8c8a0,30,2,2,.6);ring(pl.position,0xffe0a0,2.4,400);say('🐎 You mount your '+m.n+' (speed '+m.spd+').');hud()}
function openMounts(){if(uiOpen()&&$('xw').classList.contains('hide'))return;if(!$('xw').classList.contains('hide')&&xwMode=='mounts')return closeX();openX('mounts')}
try{$('mntBtn').style.removeProperty('display');$('mntBtn').classList.remove('hide')}catch(_){}
{const p=document.querySelector('.wrap>.sub');if(p&&!/V ride/.test(p.textContent))p.textContent=p.textContent.replace('T recall to Duskhold','T recall to Duskhold · V ride mount · H mounts')}

// old saves: mounts from the old roster become the new mount of the same tier; mount eggs are refunded
function mFix(){const byT=T=>MNTK.filter(k=>MOUNTS[k].t==T);
  (mounts||[]).forEach(m=>{if(!MOUNTS[m.k]){const L=byT(MOUNT_OLD[m.k]||1);m.k=L[m.id%L.length]||'pony';m.n=MOUNTS[m.k].n}});
  if(meggs&&meggs.length){const g=meggs.reduce((a,e)=>a+Math.round(MPRICE[(e.t||1)-1]*.3),0);gold+=g;meggs=[];say('🥚 Your old mount eggs were sold for '+g+' gold. Mounts are now bought at the Stable.')}
  if(riding&&!mModel)riding=null}
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{mFix();hud()}catch(err){console.warn(err)}return r}}

// ---------------- 4. the Stable: a buildable Duskhold shop ----------------
SHOPS.push({k:'stable',n:'Stable',i:'🐎',g:800,m:[['wood',20],['fiber',12]],d:'Buy mounts for gold. Ride with V for a big boost to move speed.'});
var STB={x:-7,z:-8,g:null,col:[],npc:null,site:null};
{const f=shApply;shApply=function(){const r=f.apply(this,arguments);try{stableSync()}catch(err){console.warn(err)}return r}}
{const f=townPortalPrompt;townPortalPrompt=function(T){const r=f(T);if(r)return r;if(!T||T!==TOWNS[0])return null;const x=TOWNS[0].cx+STB.x,z=TOWNS[0].cy+STB.z,d=Math.hypot(pl.position.x-x,pl.position.z-(z+1.4));
  if(d<2.6)return shopBuilt('stable')?{label:'F · Stable Master',fn:()=>openX('stable',0)}:{label:'🔨 Stable · build it at the Stronghold Steward',fn:()=>{shTab='shops';openX('hold')}};return null}}

// stable window: every mount, for gold
XR.stable=()=>{
  const P=c=>`<span class="gp${gold<c?' poor':''}">${c} 🪙</span>`;if(!mSel||!MOUNTS[mSel])mSel=MNTK[0];
  $('xwT').textContent='🐎 Stable Master';$('xwS').innerHTML='Duskhold · 🪙 <b>'+gold+'</b>';
  let sale='';for(let T=1;T<=5;T++){const c=MPRICE[T-1];sale+=`<div class="sec">Tier ${T} · speed ${MBASE[T-1]}-${MBASE[T-1]+6}</div><div class="rows">`+MNTK.filter(k=>MOUNTS[k].t==T).map(k=>{const D=MOUNTS[k],own=mounts.some(m=>m.k==k);
    return `<div class="rw${mSel==k?' on':''}" data-msel="${k}" style="--rc:${RAR[T-1][1]}"><span class="rn">${D.i} <b>${D.n}</b>${own?' <em style="color:#6ee7b7">owned</em>':''}<small>${D.d}</small></span><span class="ra">${P(c)}<button class="pri" data-mbuy="${k}" ${gold<c?'disabled':''}>Buy</button></span></div>`}).join('')+'</div>'}
  const mine=mounts.map(m=>mRow(m,`${mActive==m.id?'':`<button data-mact="${m.id}">Ride this</button>`}<button data-msell="${m.id}" title="Sell for ${Math.round(MPRICE[MOUNTS[m.k].t-1]*.3)} gold">Sell</button>`)).join('')||'<div class="mut" style="padding:6px 8px">You have no mounts yet.</div>';
  $('xwB').innerHTML=`<div class="xcols"><div>${sale}<div class="sec">Your mounts</div><div class="rows">${mine}</div></div><div>${mDetail(mSel)}</div></div>`;
  $('xwF').innerHTML='<span class="mut dtl">Press V to ride and to dismount. Mounts get faster the more you ride them. You cannot summon a mount in combat, and attacking dismounts you.</span>';mPreview(mSel)};
{const f=XR.mounts;XR.mounts=()=>{f();if(!mounts.length)$('xwB').innerHTML=`<div class="mut" style="padding:10px">No mounts yet. Build the Stable at the Stronghold Steward in Duskhold, then buy a mount there with gold.</div>`}}
function mDetail(k){const D=MOUNTS[k];if(!D)return '';return `<div id="xwPv" class="pvbox"></div><div class="dh" style="text-align:center">${D.i} ${D.n}</div><div class="mut" style="font-size:.74rem;text-align:center;padding:0 8px">${D.d}<br>Tier ${D.t} · ${MPRICE[D.t-1]} gold · born with speed ${MBASE[D.t-1]}-${MBASE[D.t-1]+6} · grows up to +${MCAP} by riding</div>`}

