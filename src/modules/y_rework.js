// ================= v55: rework — no Realm/farming/incubators, town stations, eggs hatch in the bag, grades, power level, lock, multi-sell, unique bosses =================
document.head.insertAdjacentHTML('beforeend',`<style>
#hot{display:flex;align-items:center}#pwrB{flex:none;align-self:stretch;display:flex;flex-direction:column;justify-content:center;margin-right:6px;min-width:74px;padding:4px 8px;border-radius:10px;background:rgba(10,12,22,.78);border:1px solid rgba(201,162,74,.55);text-align:center;font:600 .62rem/1.1 system-ui;color:#c9b88a;letter-spacing:.06em;text-transform:uppercase;pointer-events:auto;cursor:help}
#pwrB b{display:block;font:700 1.15rem/1.15 Cinzel,Georgia,serif;color:#f4e3b0;letter-spacing:0;text-transform:none}
body.mob #pwrB{min-width:0;padding:2px 5px}
.egr .egp{width:90px}.egr.rdy{--rc:#ffd24a!important;animation:egp 1.2s ease-in-out infinite}.egr.rdy small{color:#ffd24a}
@keyframes egp{50%{box-shadow:0 0 14px rgba(255,210,74,.55)}}
.hgr{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin:8px 0}.hgr span{display:flex;flex-direction:column;align-items:center;padding:4px 2px;border-radius:8px;background:rgba(255,255,255,.05);font-size:.62rem;color:#b8b0a0}
.hgr i{font:700 1.2rem Cinzel,Georgia,serif;font-style:normal;color:var(--gc)}
.hov{display:inline-flex;align-items:center;gap:6px;margin:4px 0;padding:3px 10px;border-radius:999px;border:1px solid var(--gc);color:var(--gc);font-weight:700}
.hsec{margin-top:8px;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:#9a927e}.hab{font-size:.78rem;text-align:left;margin:3px 0}.hab small{display:block;color:#a8a090}
#hr{max-width:420px;margin:0 auto}
.ogr{font-weight:700;font-family:Cinzel,Georgia,serif}
.lk{color:#ffd24a}
.sellbar{position:sticky;bottom:0;display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px;margin-top:6px;background:rgba(14,16,26,.95);border-top:1px solid rgba(255,255,255,.1)}
.sellbar .tot{margin-right:auto;font-size:.78rem}.sellbar .warn{color:#ffd24a;font-size:.78rem;width:100%}
#ss .rw.sel{outline:2px solid #ffd24a;background:rgba(255,210,74,.1)}#ss .rw .ck{width:16px;height:16px;border:1px solid #888;border-radius:4px;display:inline-block;margin-right:6px;vertical-align:-3px}
#ss .rw.sel .ck{background:#ffd24a;border-color:#ffd24a}
.rec{color:#f0cc72}
</style>`);

// ---------------- 1. the Realm is gone ----------------
var RW_ST=[];
toggleBuild=function(){};openCraft=function(){};
enterRealm=function(){say('There is no Realm any more. Cook and brew at the stations in any town.')};
{const ib=$('incBtn');if(ib)ib.innerHTML='🥚 Eggs <kbd>U</kbd>';['craftBtn','buildBtn'].forEach(i=>{const b=$(i);if(b)b.style.setProperty('display','none','important')})}
// cooking hearth + alchemy table where each town's realm portal used to stand
function rwStations(){
  TPRT.forEach((p,ti)=>{const T=TOWNS[ti],g0=p.g,x=g0.position.x,z=g0.position.z,ry=g0.rotation.y;if(g0.parent)g0.parent.remove(g0);T.rp=null;
    const g=new THREE.Group(),y=GH(x,z);g.position.set(x,y,z);g.rotation.y=ry;scene.add(g);
    let k=dkKit();const st=0x5a554c,st2=0x7a746a,wd=0x3a2616;
    // hearth (left)
    k.p('','cyl','c',st,-1.25,.12,0,.62,.24,.62);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;k.p('','dod','c',i%2?st:st2,-1.25+Math.cos(a)*.6,.28,Math.sin(a)*.6,.16)}
    [[.4,.2],[-.3,.5],[.1,-.6]].forEach((q,i)=>k.L('','c',wd,[-1.25-q[0]*.5,.27,-q[1]*.5],[-1.25+q[0]*.5,.32,q[1]*.5],.06,.06,6));
    k.p('','cone','g',0xff7a20,-1.25,.55,0,.28,.55,.28).p('','cone','g',0xffc040,-1.25,.5,0,.16,.38,.16);
    [0,1,2].forEach(i=>{const a=i/3*Math.PI*2;k.L('','m',0x2a2a2e,[-1.25+Math.cos(a)*.55,0,Math.sin(a)*.55],[-1.25,1.45,0],.03,.025,5)});
    k.L('','m',0x2a2a2e,[-1.25,1.45,0],[-1.25,1.05,0],.012,.012,4);k.p('','sph','m',0x26262a,-1.25,.88,0,.32,.26,.32).p('','ring','m',0x3a3a40,-1.25,1.08,0,.3,.3,.3).p('','cyl','c',0x3a5a2a,-1.25,1.1,0,.26,.02,.26);
    const gc=dkBake(k.P,null,'TOWNSTC');k=dkKit();
    // alchemy table (right)
    k.p('','box','c',wd,1.25,.82,0,1.5,.08,.75);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>k.p('','box','c',0x2a1a10,1.25+q[0]*.66,.4,q[1]*.3,.08,.8,.08));
    [[.55,.2,0x7aff6a],[.35,-.15,0xb070ff],[.8,-.1,0xff5a3a],[.15,.18,0x5ad8ff]].forEach((q,i)=>{k.p('','cyl','g',q[2],1.25+q[0]-.5,.98+i%2*.04,q[1],.06,.22+i%2*.08,.06);k.p('','cyl','c',0x2a2016,1.25+q[0]-.5,1.13+i%2*.08,q[1],.025,.05,.025)});
    k.p('','box','c',0x4a1a1a,.6,.92,.05,.32,.1,.24,0,.3,0).p('','box','c',0xc8bc98,.6,.98,.05,.3,.02,.22,0,.3,0).p('','cyl','c',0x6a6458,1.75,.92,.15,.12,.1,.12).p('','cyl','g',0xffd070,1.85,.98,-.2,.03,.14,.03);
    const ga=dkBake(k.P,null,'TOWNSTA'),G1=new THREE.Group(),G2=new THREE.Group();g.add(G1,G2);gc.forEach(m=>G1.add(m));ga.forEach(m=>G2.add(m));T.stG={c:G1,a:G2};
    sign(G1,[{t:'🍳 Hearth',f:'700 40px'}],1.1,.34,'#3a2414','#ffe6c0',null,-1.25,2.05,.0,0);sign(G2,[{t:'⚗️ Alchemy',f:'700 40px'}],1.1,.34,'#2a1a3a','#efe6ff',null,1.25,1.75,-.3,0);
    const c=Math.cos(ry),s=Math.sin(ry),wp=lx=>[x+lx*c,z-lx*s];T.st2={c:wp(-1.25),a:wp(1.25)};RW_ST.push(T.st2);
    T.col.push({x:T.st2.c[0],z:T.st2.c[1],r:.7},{x:T.st2.a[0],z:T.st2.a[1],r:.8});
  });TPRT.length=0;
}
rwStations();
function townPortalPrompt(T){if(!T||!T.st2)return null;const d=q=>Math.hypot(pl.position.x-q[0],pl.position.z-q[1]);
  const dc=d(T.st2.c),da=d(T.st2.a);if(dc<2.1&&dc<=da)return {label:'F · Cook at the hearth',fn:()=>openX('cook')};if(da<2.2)return {label:'F · Brew at the alchemy table',fn:()=>openX('alch')};return null}
// ---------------- 2. farming is gone: no fertilizer, crops are bought or found ----------------
{const i=ALCH.findIndex(r=>r[0]=='fert');if(i>=0)ALCH.splice(i,1)}
Object.keys(CROPS).forEach(k=>{SUP[k].d='Bought at any town hearth or alchemy table, or found in the wild.';SUP['s_'+k].n=CROPS[k].n;SUP['s_'+k].i=CROPS[k].i});
SUP.honey.d='Bought at any town hearth or alchemy table.';if(SUP.c_ess)SUP.c_ess.n='Essence of Ascension';
BOSSES.forEach(b=>{b.un=b.un.filter(k=>!/^(d:|m:)/.test(k)&&k!='fert')});
var MKT=[['meat',10,1],['fish',12,1],['berries',8,1],['honey',16,1]];
function mktHTML(){const T=townTier(),ks=Object.keys(CROPS).filter(k=>CROPS[k].tr<=T).map(k=>[k,CROPS[k].pr,1]).concat(MKT);
  return `<div class="sec">Market · 🪙 ${gold}</div><div class="rows">${ks.map(([k,p])=>`<div class="rw"><span class="rn">${SUP[k].i} <b>${SUP[k].n}</b> <span class="mut">×${cnt(k)}</span></span><span class="ra"><button data-ibuy="${k}" data-n="1" data-c="${p}" ${gold<p?'disabled':''}>🪙 ${p}</button><button data-ibuy="${k}" data-n="5" data-c="${p*5}" ${gold<p*5?'disabled':''}>×5</button></span></div>`).join('')}</div>`}
function rwFix(){const b=$('xwB');b.innerHTML=b.innerHTML.replace('None. Farm crops in your Realm, hunt for meat, fish at the water, forage berries.','None yet. Buy them in the market below, hunt for meat, fish at the water, forage berries.');
  const r=b.querySelector('.xcols > div:last-child');if(r)r.insertAdjacentHTML('beforeend',mktHTML())}
XR.cook=()=>{recipeWin('🍳 Cooking Hearth','Food boosts your stats for 15 minutes · up to 2 foods at once',FOOD,'Cook',['food'],[['Simple meals',['f_meat','f_fish','f_bread','f_soup']],['Hearty meals',['f_stew','f_skewer']],['Treats & feasts',['f_tart','f_cake','f_pie','f_feast']]]);rwFix()};
XR.alch=()=>{recipeWin('⚗️ Alchemy Table','Potions, elixirs and fusion catalysts',ALCH,'Brew',['pot','elixir','cat'],[['Potions',['p_hp','p_mp']],['Elixirs',['e_might','e_stone','e_swift','e_fort']],['Fusion catalysts',['c_kin','c_asc','c_bind','c_ess']]]);rwFix()};
$('xw').addEventListener('click',e=>{const b=e.target.closest('[data-ibuy]');if(!b||b.disabled)return;e.stopPropagation();const c=+b.dataset.c;if(gold<c)return say('Not enough gold.');gold-=c;giveS(b.dataset.ibuy,+b.dataset.n);sfx&&sfx('chime');hud();rX()},true);
{const f=rB0;rB0=function(){f();if(bagTab2==3){$('bl').innerHTML=$('bl').innerHTML.replace('No supplies yet. Farm, cook and brew in your Realm, hunt for meat and forage for seeds.','No supplies yet. Cook and brew at the hearth and alchemy table in any town.')}
  if(bagTab2==1)$('bl').innerHTML=$('bl').innerHTML.replace(/<div class="sec">Realm items<\/div><div class="mgrid">[\s\S]*?<\/div><\/div>(?=<div class="sec">|$)/,'');
  $('bt').insertAdjacentHTML('beforeend',`<button data-bt="4" class="${bagTab2==4?'on':''}">Eggs${eggs.length?' ('+eggs.length+')':''}</button>`);
  if(bagTab2==4){$('bl').innerHTML='<div class="mut dtl" style="padding:2px 4px 6px">Eggs hatch after 1 minute in your bag. Click a ready egg to hatch it.</div><div class="rows">'+eggRows()+'</div>'}}}
// ---------------- visitors now drop by the town you are in ----------------
function visHere(v){const m=((Date.now()/60000)+v.off)%20;return m<13}
function rwSpots(T,n){const out=[],avoid=[T.mp,T.mv,T.tv,T.st,T.sp,[T.cx-10.8,T.cy+3.1]].concat(T.st2?[T.st2.c,T.st2.a]:[]).filter(Boolean);
  for(let r=7;r<19&&out.length<n;r+=.9)for(let a=0;a<6.283&&out.length<n;a+=.33){const x=T.sp[0]+Math.cos(a)*r,z=T.sp[1]+Math.sin(a)*r;
    if(Math.abs(x-T.cx)>TS-2||Math.abs(z-T.cy)>TS-2)continue;if(avoid.concat(out).some(p=>Math.hypot(p[0]-x,p[1]-z)<4.4))continue;
    let ok=true;for(let k=0;k<8&&ok;k++){const b=k/8*6.283;if(tcHit(x+Math.cos(b)*.9,z+Math.sin(b)*.9)||solid(x+Math.cos(b)*.9,z+Math.sin(b)*.9))ok=false}if(ok)out.push([x,z])}
  while(out.length<n)out.push([T.sp[0]+2+out.length*2,T.sp[1]+2]);return out}
function visTick(){const ti=townAt(pl.position.x,pl.position.z,2),T=ti>=0?TOWNS[ti]:null;if(T&&!T.vsp)T.vsp=rwSpots(T,VIS.length);
  VIS.forEach((v,i)=>{const on=!!T&&!inDun&&visHere(v);if(v.g&&(!on||v.ti!==ti)){scene.remove(v.g);v.g=null}
    if(on&&!v.g){const [x,z]=T.vsp[i],g=new THREE.Group(),prev=T_cur;T_cur={col:[],cx:0,cy:0};npc(g,x,z,{robe:v.robe,trim:0xd8b44a,hat:v.hat,hatC:v.hatC,label:v.n,ry:Math.atan2(T.cx-x,T.cy-z)});T_cur=prev;
      g.position.y=GH(x,z);scene.add(g);v.g=g;v.x=x;v.z=z;v.ti=ti;if(!visShown.has(v.k+ti)){visShown.add(v.k+ti);say('🧳 A '+v.n+' is visiting '+T.n+'.')}}})}
function visitorPrompt(){for(const v of VIS){if(v.g&&Math.hypot(pl.position.x-v.x,pl.position.z-v.z)<2.4)return {label:'F · Talk to '+v.n,fn:()=>openX('visitor',v.k)}}return null}
// visitors in town can be talked to (the prompt used to only be checked inside the old Realm)
{const f=townPortalPrompt;townPortalPrompt=function(T){return f(T)||(T?visitorPrompt():null)}}
// the merchant no longer sells farm seeds or treasure maps: a mystery egg instead
function visStock(){const d=Math.floor(Date.now()/(20*60000));if(visState.day!==d||!visState.stock||visState.stock.some(s=>s.k=='seed'||s.k=='map')){visState.day=d;visState.bard=0;const T=Math.max(1,Math.min(5,tierOfLv(hero.lvl)));
  visState.stock=[{k:'egg',t:T,p:150+T*120,r:RUNEK[0]},{k:'pots',n:3,p:120},{k:'rune',r:RUNEK[R(0,RUNEK.length-1)],p:450}]}return visState.stock}
$('xw').addEventListener('click',e=>{if(xwMode!='visitor')return;const t=e.target.closest('[data-vbuy]');if(!t||t.disabled)return;const s=visStock()[+t.dataset.vbuy];if(!s||s.k!='egg')return;
  e.stopImmediatePropagation();if(s.sold||gold<s.p)return;gold-=s.p;s.sold=1;const eg=rollEgg(s.t);eggs.push(eg);say('🥚 Bought a Tier '+(eg.tier+1)+' '+eg.sp+' egg. It hatches after a minute in your bag (U).');hud();ui();rX()},true);
{const f=XR.visitor;XR.visitor=()=>{f();if(xwArg=='merchant'){const st=visStock();$('xwB').querySelectorAll('[data-vbuy]').forEach(b=>{const q=st[+b.dataset.vbuy];if(q&&q.k=='egg'){const n=b.closest('.rw').querySelector('.rn b');if(n)n.textContent='🥚 Mystery Tier '+q.t+' Egg'}})}$('xwS').textContent=$('xwS').textContent.replace('Visiting your Realm','Passing through town');$('xwF').innerHTML='<span class="mut dtl">Visitors travel between the towns. Each stays about 13 minutes, then moves on.</span>'}}

// ---------------- 3. eggs hatch after one minute in your bag ----------------
var EGG_T=60000,eggNote=new Set(),eggRdyN=-1;
const eggRdy=e=>!!e.t0&&Date.now()-e.t0>=EGG_T;
function eggRows(){const now=Date.now();return eggs.length?eggs.map(e=>{const p=Math.min(1,(now-(e.t0||now))/EGG_T),rd=p>=1;
  return `<button class="rw it egr${rd?' rdy':''}" data-hatch="${e.id}" style="--rc:${RAR[e.tier][1]}" ${rd?'':'disabled'}><span class="rn">${en(e)}<small data-eg="${e.id}">${rd?'✨ Ready! Click to hatch':'Hatching in '+Math.max(1,Math.ceil((EGG_T-(now-(e.t0||now)))/1000))+'s'}</small></span><span class="ra"><span class="hpm egp"><i data-egb="${e.id}" style="width:${p*100}%"></i></span></span></button>`}).join('')
  :'<div class="mut" style="padding:8px">No eggs. They are rare drops from monsters, elites and bosses, and some shops sell them.</div>'}
{const w=$('inc');w.querySelector('h2').textContent='Eggs';const ws=w.querySelector('.wsub');if(ws)ws.textContent='Eggs hatch after 1 minute in your bag · click a ready egg to watch it hatch';
  w.querySelector('.wb').innerHTML='<div class="rows" id="eggs"></div><div id="islots" class="hide"></div>';
  $('eggs').addEventListener('click',e=>{const b=e.target.closest('[data-hatch]');if(b&&!b.disabled)hatchEgg(+b.dataset.hatch)})}
$('bag').addEventListener('click',e=>{const b=e.target.closest('[data-hatch]');if(!b)return;e.stopImmediatePropagation();if(!b.disabled)hatchEgg(+b.dataset.hatch)},true);
function rI(){$('eggs').innerHTML=eggRows()}
function openInc(){$('inc').classList.remove('hide');rI()}
$('incBtn').onclick=openInc;
function hatchEgg(id){const i=eggs.findIndex(e=>e.id==id);if(i<0||!eggRdy(eggs[i]))return;const e=eggs.splice(i,1)[0];e.basic=true;const c=hatch(e);
  $('inc').classList.add('hide');$('bag').classList.add('hide');hq.push({egg:e,c});if(!hAct)nextHatch();eggRdyN=-1}
function hatchCheck(){
  if(typeof incS!='undefined')Object.keys(incS).forEach(t=>{const s=incS[t];if(s&&s.egg){s.egg.t0=s.t0||Date.now();eggs.push(s.egg)}delete incS[t]});
  let n=0;eggs.forEach(e=>{if(!e.t0)e.t0=Date.now();if(eggRdy(e)){n++;if(!eggNote.has(e.id)){eggNote.add(e.id);say('🥚 Your '+e.sp+' egg is ready to hatch! Open Eggs (U) and click it.');if(typeof sfx=='function')sfx('chime')}}});
  const now=Date.now();document.querySelectorAll('[data-egb]').forEach(el=>{const e=eggs.find(q=>q.id==el.dataset.egb);if(e)el.style.width=Math.min(100,(now-e.t0)/EGG_T*100)+'%'});
  document.querySelectorAll('small[data-eg]').forEach(el=>{const e=eggs.find(q=>q.id==el.dataset.eg);if(e&&!eggRdy(e))el.textContent='Hatching in '+Math.max(1,Math.ceil((EGG_T-(now-e.t0))/1000))+'s'});
  if(n!==eggRdyN){eggRdyN=n;if(!$('inc').classList.contains('hide'))rI();if(!$('bag').classList.contains('hide')&&bagTab2==4)rB0()}
  for(const k in sup)if(k.startsWith('s_')&&sup[k]>0){const c=k.slice(2);sup[c]=(sup[c]||0)+sup[k];sup[k]=0}
}
// ---------------- 4. grades: overall grade replaces potential ----------------
function ovV(c){ivFix(c);return IVK.reduce((s,k)=>s+ivOf(c,k),0)/IVK.length}
function ovG(c){return grade(ovV(c))}
const ovTag=c=>{const g=ovG(c);return `<span class="ogr" style="color:${g[2]}" title="Overall grade">${g[1]}</span>`};
function hatchInfo(c){ivFix(c);
  const gr=IVK.map(k=>{const g=grade(ivOf(c,k));return `<span style="--gc:${g[2]}"><i>${g[1]}</i>${IVS[k]}</span>`}).join(''),o=ovG(c);
  const mods=(c.mods||[]).map(m=>`<div class="hab">${MODS[m].i} <b>${m}</b><small>${MODS[m].d||''}</small></div>`).join('')||'<div class="hab mut">None</div>';
  const sp=(c.sp||[]).map(n=>{const s=CSP[n];return s?`<div class="hab">${s.i} <b>${n}</b><small>${s.d} · ${s.cd}s cooldown</small></div>`:''}).join('');
  return `<b>${nm(c)}</b><br><span class="mut">${famT(c)}${c.tr=='Universal'?' · ✦ Universal (fuses with any type)':''}</span><br><span class="hov" style="--gc:${o[2]}">Overall grade <span class="ogr">${o[1]}</span></span>
   <div class="hsec">Base stats</div><div class="hgr">${gr}</div><div class="hsec">Modifiers</div>${mods}<div class="hsec">Abilities</div>${sp}`}
function mrow(c,i,on){return `<button class="rw it${on?' on':''}" data-i="${i}" style="--rc:${c.h<=0?'#f87171':i<2?'#c9a24a':'transparent'}"><span class="rn">${c.lock?'<span class="lk" title="Locked">🔒</span> ':''}${nm(c)}<small>${famT(c)} · HP ${c.h}/${M(c)} · Grade ${ovTag(c)}${(c.mods||[]).length?' · '+c.mods.join(', '):''}</small></span><span class="ra"><span class="hpm"><i style="width:${100*c.h/M(c)}%"></i></span>${i<2?'<em>'+(i+1)+'</em>':''}</span></button>`}
{const f=rC0;rC0=function(){f();if(!party.length)return;const c=party[cmpSel];if(!c)return;const cd=$('cd'),o=ovG(c);
  cd.innerHTML=cd.innerHTML.replace(/<div class="kv"><span>Potential<\/span><b>[^<]*<\/b><\/div>/,`<div class="kv"><span>Overall grade</span><b class="ogr" style="color:${o[2]}">${o[1]}</b></div>`);
  const bt=cd.querySelector('.btns');if(bt)bt.insertAdjacentHTML('afterbegin',`<button id="mkLock" title="Locked companions can't be consumed by fusion">${c.lock?'🔒 Locked':'🔓 Lock'}</button>`)}}
$('cd').addEventListener('click',e=>{if(e.target.id=='mkLock'){e.stopImmediatePropagation();const c=party[cmpSel];if(!c)return;c.lock=!c.lock;say(c.lock?'🔒 '+c.n+' is locked and can\'t be fused away.':'🔓 '+c.n+' is unlocked.');rC()}},true);
// ---------------- 5. fusion: no limit, locked companions can't be consumed ----------------
function fuseOpts(a,b){
  const v=fuseVal(a,b),pen=tierSp(a.g[0])>tierSp(b.g[0])&&fCat!='c_asc';
  const sipK=IVK.filter(k=>ivOf(b,k)>ivOf(a,k)+.001),bolK=IVK.filter(k=>ivOf(a,k)<A_LINE);
  if(fOpt=='sip'&&!sipK.length)fOpt='std';if(fOpt=='bol'&&!bolK.length)fOpt='std';if(fOpt=='sip'&&!sipK.includes(fStat))fStat=sipK[0];
  const card=(id,ic,t,d,dis)=>`<button class="fopt${fOpt==id?' on':''}" data-fo="${id}" ${dis?'disabled':''}><span class="fi">${ic}</span><b>${t}</b><small>${d}</small></button>`;
  let det='';
  if(fOpt=='std')det=`<div class="fdet">📈 ${a.n}'s growth per level: <b>+${pctS(a.gs||0)}</b> → <b style="color:#6ee7b7">+${pctS((a.gs||0)+.06*v)}</b> <span class="mut">(no limit)</span></div>`;
  else if(fOpt=='sip')det=`<div class="fdet">Choose the stat to pull from ${b.n}:<div class="fstats">${IVK.map(k=>{const ga=grade(ivOf(a,k)),nv=ivOf(a,k)+(ivOf(b,k)-ivOf(a,k))*Math.min(1,v),gn=grade(nv),can=sipK.includes(k);return `<button data-fs="${k}" class="${fStat==k?'on':''}" ${can?'':'disabled'}><b>${IVS[k]}</b> <span style="color:${ga[2]}">${ga[1]}</span>${can?` → <span style="color:${gn[2]}">${gn[1]}</span>`:''}</button>`}).join('')}</div>${v<1?'<small class="mut">Half strength: the consumed creature is a lower tier. Only half the gap is pulled across.</small>':''}</div>`;
  else det=`<div class="fdet">💪 Raises every stat below A by about ${pctS(.035*v)}: ${bolK.map(k=>gTag(a,k)).join(' ')}</div>`;
  return `<div class="fopts">${card('std','📈','Standard fuse','Stats grow faster with every level')}${card('sip','🧲','Siphon a stat',sipK.length?'Copy one stronger roll from '+b.n:'No stat on '+b.n+' is better',!sipK.length)}${card('bol','💪','Bolster',bolK.length?'Lift weak rolls toward grade A':'All stats are already A or S',!bolK.length)}</div>${det}
    <div class="fwarn">⚠ ${a.n} goes back to <b>level 1</b>. ${b.n} is consumed${pen?' · lower-tier partner: half strength':''}. Base stats only change with Siphon or Bolster.${(b.mods||[]).filter(m=>!(a.mods||[]).includes(m)).length?' · '+(fCat=='c_ess'?'100%':'35%')+' chance to inherit a modifier':''}</div>`}
{const f=rF;rF=function(){f();const fl=$('fl');if(!fl)return;fl.querySelectorAll('[data-i]').forEach(b=>{const i=+b.dataset.i,c=party[i];if(c&&c.lock&&sel.length>=1&&sel[0]!==i){b.disabled=true;b.title='Locked: unlock it in Companions to fuse it away'}})}}
$('fl').addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(!b)return;const i=+b.dataset.i,c=party[i];if(c&&c.lock&&sel.length==1&&sel[0]!==i){e.stopImmediatePropagation();say('🔒 '+c.n+' is locked. Unlock it in Companions first.')}},true);
$('doF').onclick=()=>{
  if(sel.length!=2)return;const a=party[sel[0]],b=party[sel[1]];if(!a||!b||!compat(a,b))return;if(b.lock)return say('🔒 '+b.n+' is locked. Unlock it in Companions first.');ivFix(a);ivFix(b);
  const cat=fCat&&(sup[fCat]||0)>0?fCat:'',v=fuseVal(a,b);let msg='';
  if(fOpt=='sip'){const k=fStat,o=ivOf(a,k);if(!(ivOf(b,k)>o))return say('Pick a stat that '+b.n+' has a better roll in.');a.iv[k]=o+(ivOf(b,k)-o)*Math.min(1,v);ivSync(a);msg=IVN[k]+' '+grade(o)[1]+' → '+grade(a.iv[k])[1]}
  else if(fOpt=='bol'){const up=[];IVK.forEach(k=>{const o=ivOf(a,k);if(o<A_LINE){a.iv[k]=Math.min(A_LINE,o+(.025+Math.random()*.02)*v);if(grade(a.iv[k])[1]!=grade(o)[1])up.push(IVS[k]+' '+grade(o)[1]+'→'+grade(a.iv[k])[1])}});ivSync(a);msg='stats bolstered'+(up.length?' ('+up.join(', ')+')':'')}
  else{a.gs=(a.gs||0)+.06*v;msg='growth per level now +'+pctS(a.gs)}
  a.fz=(a.fz||0)+1;a.fp=a.fz;a.f=Math.min(10,a.fz);
  const inh=(b.mods||[]).filter(m=>!(a.mods||[]).includes(m));if(inh.length&&(a.mods||[]).length<5&&Math.random()<(cat=='c_ess'?1:.35)){const m=inh[R(0,inh.length-1)];a.mods.push(m);say(a.n+' inherited '+MODS[m].i+' '+m+'!')}
  if(b.tr=='Universal'&&a.tr!='Universal'){}else if(a.tr=='Universal'&&famOf(a.g[0])!=famOf(b.g[0]))a.tr='';
  if(cat){sup[cat]--;say(SUP[cat].i+' '+SUP[cat].n+' was used up.');if(!(sup[cat]>0))fCat=''}
  if(b.emp)b.emp=false;a.h=M(a);party=party.filter((_,i)=>i!=sel[1]);sel=[];
  say('Fusion complete! '+nm(a)+': '+msg+'. It keeps its level.');$('fz').classList.add('hide');hsDirty();hero.hp=Math.min(hero.hp,heroMax());ui();
};

// ---------------- 6. power level + zone recommendations ----------------
function pwrOf(s){const off=Math.max(s.pa,s.ma)*(1+(s.crit||0)*(s.cdm||.75))*(1+(s.as||0)),sur=s.hp*(1+(s.pd+s.md)/2/45)*(1+(s.dr||0));return Math.round(Math.sqrt(off*sur)*10)}
function heroPower(){return pwrOf(HS())}
// what a hero of this class at level L with zone-appropriate gear usually reaches
function nakedPwr(cls,L){const C=CLS[cls],st={};['hp','pa','ma','pd','md'].forEach(k=>st[k]=C.base[k]+C.per[k]*(L-1));st.crit=C.crit;st.cdm=.75;return pwrOf(st)}
var RECT=[[1,700],[10,3400],[20,7000],[30,12200],[40,17600],[50,23600]];
function recPower(L){let a=RECT[0],b=RECT[RECT.length-1];for(let i=0;i<RECT.length-1;i++)if(L>=RECT[i][0]&&L<=RECT[i+1][0]){a=RECT[i];b=RECT[i+1];break}
  const v=a[1]+(b[1]-a[1])*((L-a[0])/((b[0]-a[0])||1));return Math.round(v*nakedPwr(hero.cls,L)/nakedPwr('warrior',L)/50)*50}
var ZREC={2:'C',3:'B',4:'A',5:'A'};
function zoneRec(){if(inDun)return null;const x=Math.max(0,Math.min(W-1,Math.round(pl.position.x))),z=Math.max(0,Math.min(H-1,Math.round(pl.position.z)));if(townAt(pl.position.x,pl.position.z,0)>=0)return null;
  const b=BIOMES[MAP.bio[z][x]];if(!b||b.t<2)return null;return {b,g:ZREC[b.t],p:recPower(TIER_LV[b.t-1][0])}}
var zSeen=new Set();
{const bm=$('hot');if(bm&&!$('pwrB'))bm.insertAdjacentHTML('afterbegin','<div id="pwrB" title="Power level: your overall damage and survivability">Power<b>0</b></div>')}
{const f=hud;hud=function(){f.apply(this,arguments);const pw=heroPower(),pb=$('pwrB');if(pb){const zr=zoneRec();pb.querySelector('b').textContent=pw.toLocaleString();pb.querySelector('b').style.color=zr&&pw<zr.p?'#ff8a6a':''}
  const zr=zoneRec(),at=$('areaT');if(zr&&at){const lead=party[0],lg=lead?ovG(lead):null,gi=g=>GR.findIndex(x=>x[1]==g);
    at.innerHTML=at.textContent+` <span class="rec" title="Recommended for the start of this zone">· Rec: creature ${zr.g}${lg&&gi(lg[1])>gi(zr.g)?' ⚠':''} · power ${zr.p.toLocaleString()}${pw<zr.p?' ⚠':''}</span>`;
    if(!zSeen.has(zr.b.n)){zSeen.add(zr.b.n);banner('📍 '+zr.b.n.toUpperCase(),'Recommended: creature overall grade '+zr.g+' · power level '+zr.p.toLocaleString(),'Your power: '+pw.toLocaleString()+(lead?' · '+lead.n+': grade '+lg[1]:''))}}}}

// ---------------- 7. selling: pick several, then confirm ----------------
var sellSel=new Set(),sellAsk=false;
function sellables(){const L=[];gear.forEach(i=>L.push({k:'g'+i.id,ic:icoOf(i),n:`<span style="color:${RAR[i.r][1]}">${itName(i)}</span>`,sub:itMain(i),v:Math.round(itVal(i)*.5),rc:RAR[i.r][1],r:i.r}));
  eggs.forEach(e=>L.push({k:'e'+e.id,ic:'',n:en(e),sub:'Egg',v:Math.round(EGV[e.tier]*.4),rc:RAR[e.tier][1]}));
  Object.keys(SUP).filter(k=>['crop','food'].includes(SUP[k].c)&&cnt(k)>0).forEach(k=>L.push({k:'s'+k,ic:SUP[k].i,n:SUP[k].n+' ×'+cnt(k),sub:'Whole stack',v:(SUP[k].c=='food'?12:4)*cnt(k),rc:'transparent'}));return L}
function rS(){
  rS_base();const P=c=>`<span class="gp${gold<c?' poor':''}">${c} 🪙</span>`;
  $('sb').insertAdjacentHTML('beforeend','<div class="sec">Potions</div>'+[['p_mp','🫙 Mana Potion','Restores 50% mana (Z)',40+hero.lvl*4]].map(r=>`<button class="rw" data-b2="${r[0]}" data-c="${r[3]}"><span class="rn">${r[1]}<small>${r[2]}</small></span><span class="ra">${P(r[3])}</span></button>`).join(''));
  const L=sellables();[...sellSel].forEach(k=>{if(!L.some(x=>x.k==k))sellSel.delete(k)});
  const tot=L.filter(x=>sellSel.has(x.k)).reduce((s,x)=>s+x.v,0),n=sellSel.size;
  $('ss').innerHTML=(L.length?L.map(x=>`<button class="rw it${sellSel.has(x.k)?' sel':''}" data-sk="${x.k}" style="--rc:${x.rc}"><span class="rn"><span class="ck"></span>${x.ic} ${x.n}<small>${x.sub}</small></span><span class="ra"><span class="gp">${x.v} 🪙</span></span></button>`).join(''):'<div class="mut" style="padding:6px 8px">Nothing to sell.</div>')+
   (L.length?`<div class="sellbar">${sellAsk&&n?`<span class="warn">Sell ${n} item${n>1?'s':''} for ${tot} 🪙? This can't be undone.</span><button data-sa="no">Cancel</button><button class="pri" data-sa="yes">✔ Confirm sale</button>`:
     `<span class="tot">${n?n+' selected · <b>'+tot+' 🪙</b>':'Click items to select them'}</span><button data-sa="gear">Select all gear</button>${n?'<button data-sa="clr">Clear</button>':''}<button class="pri" data-sa="sell" ${n?'':'disabled'}>Sell selected</button>`}</div>`:'');
}
$('ss').onclick=e=>{
  const a=e.target.closest('[data-sa]');if(a){const k=a.dataset.sa;
    if(k=='gear'){gear.forEach(i=>sellSel.add('g'+i.id));sellAsk=false}else if(k=='clr'){sellSel.clear();sellAsk=false}else if(k=='sell'){if(sellSel.size)sellAsk=true}else if(k=='no')sellAsk=false;
    else if(k=='yes'){let g=0,n=0;sellables().forEach(x=>{if(!sellSel.has(x.k))return;const t=x.k[0],id=x.k.slice(1);
        if(t=='g'){const i=gear.findIndex(q=>q.id==+id);if(i>=0){gear.splice(i,1);g+=x.v;n++}}else if(t=='e'){const i=eggs.findIndex(q=>q.id==+id);if(i>=0){eggs.splice(i,1);g+=x.v;n++}}else{if(sup[id]>0){sup[id]=0;g+=x.v;n++}}});
      gold+=g;sellSel.clear();sellAsk=false;say('💰 Sold '+n+' item'+(n==1?'':'s')+' for '+g+' gold.');if(typeof sfx=='function')sfx('chime')}
    rS();hud();return}
  const b=e.target.closest('[data-sk]');if(!b)return;const k=b.dataset.sk;if(sellSel.has(k))sellSel.delete(k);else sellSel.add(k);sellAsk=false;rS()};
$('sClose')&&$('sClose').addEventListener('click',()=>{sellSel.clear();sellAsk=false});
