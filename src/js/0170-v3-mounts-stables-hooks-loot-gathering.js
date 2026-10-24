// ================= v3: Mounts, stables, and hooks into loot / gathering / fusion / HUD =================
const MOUNTS={
 dusthound:{n:'Dusthound',i:'🐕',t:1,rig:'Foxlet',col:0xc8a070,sc:1.6,d:'A loyal, sure-footed hound.'},
 bogstrider:{n:'Bog Strider',i:'🐸',t:1,rig:'Mossfrog',col:0x6aae4a,sc:1.7,d:'Hops along at a cheerful pace.'},
 ashwarg:{n:'Ashen Warg',i:'🐺',t:2,rig:'Ashwolf',col:0x8a919c,sc:1.5,d:'Grey wolf of the Reaches. Tireless on long roads.'},
 mossback:{n:'Mossback Tortoise',i:'🐢',t:2,rig:'Stoneshell',col:0x7a8a5a,sc:1.55,d:'Broad, steady and surprisingly quick.'},
 cinderlynx:{n:'Cinder Lynx',i:'🐈',t:3,rig:'Foxlet',col:0xd8502a,v:'Ember',sc:1.65,d:'A fire-maned cat that leaves warm footprints.'},
 webrunner:{n:'Webrunner',i:'🕷️',t:3,rig:'Cryptspider',col:0x3a2e46,sc:1.45,d:'Eight legs, zero hesitation.'},
 bonecharger:{n:'Bone Charger',i:'💀',t:4,rig:'Boneling',col:0xe0d8bc,sc:1.6,d:'A skeletal steed that never tires.'},
 galeroc:{n:'Gale Roc',i:'🦅',t:4,rig:'Skyhawk',col:0x4a8fd8,sc:1.5,d:'Glides a hand above the ground.'},
 nightwarg:{n:'Nightmare Warg',i:'🌑',t:5,rig:'Ashwolf',col:0x2a2a3a,v:'Shadow',sc:1.65,d:'Red-eyed terror of Stormreach.'},
 obsidrake:{n:'Duskfire Drake',i:'🐲',t:5,rig:'Drakelet',col:0x2a1a2a,sc:1.7,d:'A young dragon broken to the saddle.'}
};
const MNTK=Object.keys(MOUNTS),MBASE=[25,40,55,70,85],MPRICE=[350,1600,5200,14000,32000],MGROW=100,MCAP=40;
const mountsOfTier=T=>MNTK.filter(k=>MOUNTS[k].t==T);
let mounts=[],meggs=[],riding=null,mActive=null,mModel=null,mLast=null;
const mOf=id=>mounts.find(m=>m.id==id);
function newMount(k,bonus){const T=MOUNTS[k].t,s=MBASE[T-1]+R(0,bonus||6);const m={id:uid++,k,n:MOUNTS[k].n,spd:s,cap:s+MCAP,dist:0};mounts.push(m);if(!mActive)mActive=m.id;return m}
function inCombatNow(){return enemies.some(e=>e.agg&&!e.dead&&d2(e.m.position,pl.position)<12)||performance.now()-hero.lastHit<3000}
function dismount(msg){
  if(!riding)return;riding=null;if(mModel){scene.remove(mModel);burst(gY(mModel.position,.6),0xd8c8a0,16,1.5,1.5,.5);mModel=null}
  const h=pl.children[0];h.position.y=0;h.position.z=0;const b=pl.bones;b.lh0.rotation.z=0;b.rh0.rotation.z=0;b.lh1.rotation.x=0;b.rh1.rotation.x=0;
  if(msg)say('You dismount.');hud();
}
function mountTick(dt,now,al){
  if(!riding||!mModel)return;
  const p=pl.position,mv=al>0&&dt>0;mModel.position.copy(p);mModel.rotation.y=pl.rotation.y;
  if(mModel.r.rig)mModel.r.rig(now,mv,mv?2.4+riding.spd/30:0);
  const B=mModel.r.b,bob=B?B.position.y*mModel.r.scale.y:0,h=pl.children[0];
  h.position.y=mModel.seat[0]+bob-.5;h.position.z=mModel.seat[1];mModel.sd.position.y=mModel.seat[0]-.06+bob;
  const b=pl.bones;b.lh0.rotation.x=-1.3;b.rh0.rotation.x=-1.3;b.lh0.rotation.z=-.42;b.rh0.rotation.z=.42;b.lh1.rotation.x=1.45;b.rh1.rotation.x=1.45;
  if(!pl.sw){b.aL0.rotation.x=-.75;b.aR0.rotation.x=-.75;b.aL1.rotation.x=-.8;b.aR1.rotation.x=-.8;b.spine.rotation.y=0;b.spine.rotation.x=mv?.12:0}
  if(mLast&&dt>0){const d=Math.hypot(p.x-mLast.x,p.z-mLast.z);if(d<5){riding.dist+=d;while(riding.dist>=MGROW){riding.dist-=MGROW;if(riding.spd<riding.cap){riding.spd++;if(riding.spd%5==0||riding.spd==riding.cap)say('🐎 '+riding.n+' grew faster: speed '+riding.spd+(riding.spd==riding.cap?' (its peak!)':''));hud()}}}}
  mLast={x:p.x,z:p.z};
  if(mv&&Math.random()<dt*8)burst(gY(V(p.x-Math.sin(pl.rotation.y)*.8,0,p.z-Math.cos(pl.rotation.y)*.8),.1),0xb8a888,2,.6,.6,.4);
}
// ---------- stables in every town ----------
// ---------- stable and mounts windows ----------
let mSel=null,mPV=null,mPVk='';
function mPreview(k){
  const host=$('xwPv');if(!host||!k)return;
  if(mPVk!=k){const m=mountModel(k),pv=new THREE.Group(),inner=new THREE.Group();inner.add(m);pv.add(inner);pvFit(inner,1.9);mPV={pv,m};mPVk=k}
  const o=mPV;pvShow(host,o.pv,now=>{o.pv.rotation.y=now/2200;if(o.m.r.rig)o.m.r.rig(now,false,0)});
}
const spdBar=m=>`<span class="hpm" title="Speed ${m.spd} of ${m.cap}"><i style="width:${Math.round(100*m.spd/m.cap)}%;background:linear-gradient(90deg,#7ac8f0,#c9a24a)"></i></span>`;
const mRow=(m,act)=>{const D=MOUNTS[m.k];return `<div class="rw${mSel==m.k?' on':''}" data-msel="${m.k}" style="--rc:${RAR[D.t-1][1]}"><span class="rn">${D.i} <b>${m.n}</b> ${mActive==m.id?'<em style="color:var(--acc)">● active</em>':''}<small>Tier ${D.t} · Speed <b>${m.spd}</b> / ${m.cap} · +${Math.round(m.spd)}% move speed · next point in ${Math.ceil(MGROW-m.dist)} steps</small></span><span class="ra">${spdBar(m)}${act||''}</span></div>`};
XR.stable=()=>{
  const T=TOWNS[xwArg]||TOWNS[0],tier=T.i+1,L=mountsOfTier(tier),P=c=>`<span class="gp${gold<c?' poor':''}">${c} 🪙</span>`;mSel=mSel||L[0];
  $('xwT').textContent='🐎 Stable Master · '+T.n;$('xwS').innerHTML='Tier '+tier+' mounts · 🪙 <b>'+gold+'</b>';
  const sale=L.map(k=>{const D=MOUNTS[k],c=MPRICE[tier-1];return `<div class="rw${mSel==k?' on':''}" data-msel="${k}" style="--rc:${RAR[tier-1][1]}"><span class="rn">${D.i} <b>${D.n}</b><small>Speed ${MBASE[tier-1]}-${MBASE[tier-1]+6} at birth · up to +${MCAP} with riding</small></span><span class="ra">${P(c)}<button class="pri" data-mbuy="${k}" ${gold<c?'disabled':''}>Buy</button></span></div>`}).join('');
  const eg=meggs.map(e=>{const D=MOUNTS[e.k];return `<div class="rw" data-msel="${e.k}" style="--rc:${RAR[e.t-1][1]}"><span class="rn">🥚 <b>${D.n} Egg</b><small>Tier ${e.t} · hatched mounts can roll a better speed than bought ones</small></span><span class="ra"><button class="pri" data-mhatch="${e.id}">Hatch</button></span></div>`}).join('')||'<div class="mut" style="padding:6px 8px">No mount eggs. They are very rare drops from monsters, more likely from elites and bosses.</div>';
  const mine=mounts.map(m=>mRow(m,`${mActive==m.id?'':`<button data-mact="${m.id}">Ride this</button>`}<button data-msell="${m.id}" title="Sell for ${Math.round(MPRICE[MOUNTS[m.k].t-1]*.3)} gold">Sell</button>`)).join('')||'<div class="mut" style="padding:6px 8px">You have no mounts yet.</div>';
  $('xwB').innerHTML=`<div class="xcols"><div><div class="sec">For sale</div><div class="rows">${sale}</div><div class="sec">Mount eggs</div><div class="rows">${eg}</div><div class="sec">Your mounts</div><div class="rows">${mine}</div></div><div>${mDetail(mSel)}</div></div>`;
  $('xwF').innerHTML='<span class="mut dtl">Press V to ride and to dismount. Mounts get faster the more you ride them. You cannot summon a mount in combat, and attacking dismounts you.</span>';mPreview(mSel);
};
XR.mounts=()=>{
  if(!mSel||!mounts.some(m=>m.k==mSel))mSel=(mOf(mActive)||mounts[0]||{}).k||null;
  $('xwT').textContent='🐎 Mounts';$('xwS').textContent=mounts.length+' owned · press V to ride';
  const mine=mounts.map(m=>mRow(m,mActive==m.id?'':`<button class="pri" data-mact="${m.id}">Set active</button>`)).join('')||'<div class="mut" style="padding:8px">No mounts yet. Visit a Stable Master in any town to buy one.</div>';
  const eg=meggs.length?`<div class="sec">Unhatched eggs</div><div class="rows">${meggs.map(e=>`<div class="rw" style="--rc:${RAR[e.t-1][1]}"><span class="rn">🥚 <b>${MOUNTS[e.k].n} Egg</b><small>Take it to a Stable Master in any town to hatch it</small></span></div>`).join('')}</div>`:'';
  $('xwB').innerHTML=`<div class="xcols"><div><div class="sec">Your mounts</div><div class="rows">${mine}</div>${eg}</div><div>${mSel?mDetail(mSel):''}</div></div>`;
  $('xwF').innerHTML='<span class="mut dtl">Speed adds directly to your move speed: speed 60 means 60% faster. Every '+MGROW+' steps ridden adds +1, up to the mount\'s peak.</span>';if(mSel)mPreview(mSel);
};
$('xw').addEventListener('click',e=>{
  const t=e.target.closest('[data-mbuy],[data-mhatch],[data-mact],[data-msell],[data-msel]');if(!t||t.disabled)return;const ds=t.dataset;
  if(ds.mbuy){const T=MOUNTS[ds.mbuy].t,c=shpP109('stable',MPRICE[T-1]);if(gold<c)return say('Not enough gold.');gold-=c;const m=newMount(ds.mbuy,6);banner('🐎 NEW MOUNT','You bought a '+m.n,'Speed '+m.spd+' · press V to ride');hud()}
  else if(ds.mhatch){const i=meggs.findIndex(x=>x.id==+ds.mhatch);if(i<0)return;const e2=meggs.splice(i,1)[0],m=newMount(e2.k,12);banner('🐎 A MOUNT HATCHED','Your '+m.n+' is born!','Speed '+m.spd+' (peak '+m.cap+') · press V to ride')}
  else if(ds.mact){mActive=+ds.mact;if(riding){dismount();toggleMount()}say('Active mount: '+mOf(mActive).n+'.');hud()}
  else if(ds.msell){const m=mOf(+ds.msell);if(!m)return;if(riding===m)dismount();const v=Math.round(MPRICE[MOUNTS[m.k].t-1]*.3);gold+=v;mounts=mounts.filter(x=>x!==m);if(mActive==m.id)mActive=mounts[0]?mounts[0].id:null;say('Sold '+m.n+' for '+v+' gold.');hud()}
  else if(ds.msel){mSel=ds.msel}
  rX();
});
// ---------- hooks: dismount when you fight, gather or leave ----------
function swing(){if(riding)dismount();return swing_base()}
function gStart(t){if(riding)dismount();return gStart_base(t)}
// ---------- hooks: loot (meat, seeds, mount eggs) and pickups ----------
function lootE(e){
  lootE_base(e);const c=e.c,p=e.m.position,al=c.al?1:0,bs=c.boss?1:0,T=c.zt||tierOfLv(c.l),lk=1+HS().loot,en=EN[c.en]||{},fam=en.fam||famOf(c.g[0]);
  if(['Beast','Sky','Dragon','Earth'].includes(fam)&&Math.random()<(bs?1:al?.25:.1))drop('sup',{k:'meat',n:bs?R(2,3):1},p,0);
}
function take(d){
  if(d.kind=='sup'){const S=SUP[d.data.k];giveS(d.data.k,d.data.n);pickup({ic:S.c=='seed'?'🌱':S.i,t:'+'+d.data.n+' '+S.n,col:'#bfe8a0',sub:S.c=='seed'?'Plant it on a Farm Plot':S.c=='rune'?'Socket it into a companion (P)':'For cooking'})}
  else if(d.kind=='megg'){meggs.push(d.data);const D=MOUNTS[d.data.k];pickup({ic:'🥚',t:D.n+' Mount Egg',col:RAR[d.data.t-1][1],sub:'Very rare! Hatch it at any Stable Master',r:4});banner('🐎 MOUNT EGG!',D.n+' · Tier '+d.data.t,'Take it to a Stable Master in any town to hatch it.')}
  else take_base(d);
}
function gFinish(tg){
  gFinish_base(tg);const r=Math.random,T=Math.max(1,Math.min(5,tierAt(tg.x,tg.y)));
  if(tg.kind=='bush'){const bv=lnV(tg);if(bv=='berry'||r()<.05)gotS('berries',bv=='berry'?R(1,3):1);if(r()<.25)gotS('s_'+pickSeed(T,['wheat','carrot','sunleaf','pepper']),1+(r()<.3?1:0))}
  else if(tg.kind=='flower'){if(r()<.3)gotS('s_'+pickSeed(T,['sunleaf','moonpetal','pumpkin']),1)}
  else if(tg.kind=='mush'){if(r()<.25)gotS('s_'+pickSeed(T,['frostcap','emberroot','sunleaf']),1)}
  else if(tg.kind=='water'){if(r()<.35)gotS('fish',R(1,2))}
  else if(tg.kind=='tree'){if(r()<.08)gotS('s_'+pickSeed(T,['pepper','wheat']),1)}
  else if(tg.kind=='crystal'){if(r()<.06)gotS('s_starbloom',1)}
}
// ---------- hooks: HUD (mana potion, mount button, food timers) ----------
function hud(){
  hud_base();if(!$('acts'))return;$('bbar').classList.toggle('hide',false);
  {const cd=hero.cdM||0,mm=mOf(mActive)||mounts[0];
    $('acts').insertAdjacentHTML('beforeend',`<button class="hs" data-x="z" title="Mana Potion (Z)" ${cd>0?'disabled':''} ${(sup.p_mp||0)?'':'style="opacity:.5"'}><span class="ic">🫙</span><span class="kb">Z</span><span class="sb">×${sup.p_mp||0}</span><span class="cdv" style="height:${Math.min(100,100*cd/6)}%"></span></button>`+
      (mm?`<button class="hs" data-x="v" title="${riding?'Dismount':'Ride '+mm.n} (V)"><span class="ic">${riding?'⏏️':MOUNTS[mm.k].i}</span><span class="kb">V</span><span class="sb">${riding?'off':mm.spd}</span><span class="cdv" style="height:0"></span></button>`:''))}
  const now=performance.now(),tp=tpFree();
  $('buffs').innerHTML=(tp?`<span class="bf tpn" title="Spend attribute points (Character, C)">✦ ${tp} attribute point${tp>1?'s':''} · C</span>`:'')+(riding?`<span class="bf" title="Riding ${riding.n}">🐎 +${riding.spd}%</span>`:'')+hero.buffs.filter(b=>b.t>now&&!b.perm).map(b=>`<span class="bf${b.food?' fd':b.elix?' ex':''}" title="${b.n}${b.d?': '+b.d:''}">${b.i||'✨'} ${fmtT(b.t-now)}</span>`).join('')+(hero.sh>0?`<span class="bf" title="Shield">🛡️ ${Math.round(hero.sh)}</span>`:'')+(restBonus()>0?`<span class="bf" title="Well Rested">🛏️ +${Math.round(restBonus()*100)}% XP</span>`:'');
  bossHudX();if(bossDone.size)$('buffs').insertAdjacentHTML('afterbegin',`<span class="bf" title="Sovereign powers: ${hero.buffs.filter(b=>b.perm).map(b=>b.n+' ('+b.d+')').join(', ')}">👑 ${bossDone.size}</span>`);
}
// ---------- hooks: bag gets a Supplies tab ----------
function rB0(){
  rB0_base();
  $('bt').insertAdjacentHTML('beforeend',`<button data-bt="3" class="${bagTab2==3?'on':''}">Supplies</button>`);
  if(bagTab2!=3)return;
  const grp=[['Food','food'],['Potions & elixirs','pot','elixir'],['Fusion catalysts','cat'],['Farming','fert','seed'],['Crops & ingredients','crop','ing']];
  const row=k=>{const S=SUP[k],u=['food','elixir','pot'].includes(S.c);return `<div class="rw"><span class="rn">${S.c=='seed'?'🌱':''}${S.i} <b>${S.n}</b> <span class="mut">×${cnt(k)}</span><small>${S.d}</small></span><span class="ra">${u?`<button data-use="${k}">${S.c=='food'?'Eat':'Drink'}</button>`:''}</span></div>`};
  let h=grp.map(g=>{const ks=Object.keys(SUP).filter(k=>g.slice(1).includes(SUP[k].c)&&cnt(k)>0);return ks.length?`<div class="sec">${g[0]}</div><div class="rows">${ks.map(row).join('')}</div>`:''}).join('');
  $('bl').innerHTML=h||'<div class="mut" style="padding:8px">No supplies yet. Cook and brew in Duskhold, hunt for meat and forage for seeds.</div>';
}
$('bag').addEventListener('click',e=>{const b=e.target.closest('[data-use]');if(b){consume(b.dataset.use);rB()}});
$('sb').addEventListener('click',e=>{const b=e.target.closest('[data-b2]');if(!b)return;const c=+b.dataset.c;if(gold<c)return say('Not enough gold.');gold-=c;giveS(b.dataset.b2,1);rS();hud()});
$('ss').addEventListener('click',e=>{const b=e.target.closest('[data-s2]');if(!b)return;const k=b.dataset.s2;if(!(sup[k]>0))return;sup[k]--;gold+=SUP[k].c=='food'?12:4;rS();hud()});
// ---------- hooks: fusion catalysts ----------
let fCat='';
function fuseVal(a,b){let v=fuseVal_base(a,b);const c=fCat&&(sup[fCat]||0)>0?fCat:'';
  if(c=='c_asc')v=(tierSp(a.g[0])>tierSp(b.g[0])?v*2:v)*1.25;else if(c=='c_kin')v*=1.25;else if(c=='c_ess')v*=1.6;return v}
function compat(a,b){return compat_v2(a,b)||(fCat=='c_bind'&&(sup.c_bind||0)>0)}
$('fz').addEventListener('click',e=>{const b=e.target.closest('[data-fc]');if(b){e.stopPropagation();fCat=b.dataset.fc;rF()}});
$('doF').onclick=()=>{
  if(sel.length!=2)return;const a=party[sel[0]],b=party[sel[1]];if(!compat(a,b))return;
  const cat=fCat&&(sup[fCat]||0)>0?fCat:'',v=fuseVal(a,b);a.fp=Math.min(10,(a.fp||0)+v);a.f=Math.floor(a.fp);
  ['hp','a','d'].forEach(k=>a.iv[k]=Math.max(a.iv[k],a.iv[k]*.75+b.iv[k]*.25+.01));
  const inh=(b.mods||[]).filter(m=>!(a.mods||[]).includes(m));if(inh.length&&(a.mods||[]).length<5&&Math.random()<(cat=='c_ess'?1:.35)){const m=inh[R(0,inh.length-1)];a.mods.push(m);say(a.n+' inherited '+MODS[m].i+' '+m+'!')}
  if(b.tr=='Universal'&&a.tr!='Universal'){}else if(a.tr=='Universal'&&famOf(a.g[0])!=famOf(b.g[0]))a.tr='';
  if(cat){sup[cat]--;say(SUP[cat].i+' '+SUP[cat].n+' was used up.');if(!(sup[cat]>0))fCat=''}
  a.h=M(a);party=party.filter((_,i)=>i!=sel[1]);say('Fusion complete! '+nm(a)+' grew stronger (+'+Math.round(v*10)+'% stats).');$('fz').classList.add('hide');hsDirty();ui();
};

$('mntBtn').onclick=()=>openMounts();
