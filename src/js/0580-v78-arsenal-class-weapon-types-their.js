// ================= v78: Arsenal — class weapon types with their own attacks, 100 new equipment templates =================
// New templates are APPENDED to ITPL (saves store the template index), so tp 0-99 keep their meaning.

// ---------------- 1. new weapon types ----------------
Object.assign(WTYPE,{
  axes:{n:'Twin Axes',i:'🪓',k:.86,spd:.62},
  halberd:{n:'Halberd',i:'🔱',k:1.2,spd:1.14},
  flail:{n:'Flail',i:'⛓️',k:1.02,spd:1.06},
  claws:{n:'Claws',i:'🐾',k:.8,spd:.7},
  knives:{n:'Throwing Knives',i:'🗡️',k:.92,spd:1},
  crossbow:{n:'Crossbow',i:'🎯',k:1.6,spd:1.6},
  sling:{n:'Sling',i:'🪨',k:.78,spd:.78},
  wand:{n:'Wand',i:'✨',k:.58,spd:.6},
  orb:{n:'Orb',i:'🔮',k:1.0,spd:1.12}
});
// what each weapon type does with a basic attack (shown on the item)
var WDESC={
  gs:'Balanced 3-hit combo. The third swing knocks foes off balance.',
  ga:'Heavy 3-hit combo. The third swing is a full spin that makes everything around you bleed.',
  axes:'Fast 4-hit flurry with both hands. Each chop can open a bleeding wound.',
  halberd:'Long-reach thrusts that hit far down a line. The third attack is a wide sweep that shoves enemies back.',
  mace:'Solid 3-hit combo. The third blow stuns.',
  hammer:'Slow, crushing blows that send out a shockwave. The third blow is a ground slam that stuns everything nearby.',
  flail:'Every attack is a spin that hits all around you. The second spin calls holy light that heals you for each enemy hit.',
  dagger:'Quick 4-hit combo with both blades. The last cut hits hardest.',
  claws:'Very fast 5-hit rake at close range, often causing bleeding. The last hit is a deep rending slash.',
  knives:'Throws a fan of 3 knives, and every 4th throw a fan of 5. Knives can cause bleeding.',
  bow:'Fires a fast arrow.',
  crossbow:'Slow, heavy bolt that pierces every enemy in a line and knocks them back.',
  sling:'Quick stones that ricochet to 2 more enemies, and sometimes daze.',
  staff:'Slow homing orb that bursts on impact.',
  wand:'Rapid homing sparks. Every 5th spark is a big bolt that bursts.',
  orb:'Calls chain lightning that jumps between up to 4 enemies. No projectile to dodge.'
};

// ---------------- 2. one hundred new templates ----------------
var ITPL_V78=ITPL.length;
{
  const W=(cls,wt,names,imp)=>names.forEach((n,t)=>ITPL.push({n,sl:'weapon',cls,wt,t,imp:imp(t),nw:1}));
  W('warrior','axes',['Notched Hatchets','Ironbite Twin Axes','Cinderfang Choppers','Hollowtooth Cleavers','Stormrend Twinaxes'],t=>({as:+(.03+.01*t).toFixed(3)}));
  W('warrior','halberd',['Militia Pike-Axe','Ironwatch Halberd','Cinderreach Glaive','Hollowguard Halberd','Stormspire Halberd'],t=>({hpP:+(.03+.01*t).toFixed(3)}));
  W('paladin','flail',['Chain Flail','Penitent Flail','Sunlash Morningstar','Gravechain Flail','Dawnstar Flail'],t=>({ls:+(.005+.002*t).toFixed(4)}));
  W('assassin','claws',['Bent Hookclaws','Viper Talons','Emberrake Claws','Nightglass Talons','Stormclaw Gauntlets'],t=>({crit:+(.02+.006*t).toFixed(3)}));
  W('assassin','knives',['Rusty Throwing Knives','Viper Darts','Emberflick Knives','Nightglass Fans','Galecut Shuriken'],t=>({mspd:+(.02+.005*t).toFixed(3)}));
  W('ranger','crossbow',['Poacher Crossbow','Ironjaw Arbalest','Cinderbolt Crossbow','Bonecrank Arbalest','Thunderlatch Arbalest'],t=>({cdm:+(.1+.04*t).toFixed(3)}));
  W('ranger','sling',['Shepherd Sling','Wolfhide Sling','Cinderstone Sling','Bonecord Sling','Galestone Sling'],t=>({loot:+(.05+.02*t).toFixed(3)}));
  W('mage','wand',['Twig Wand','Mossroot Wand','Pyrefinger Wand','Lichbone Wand','Tempest Rod'],t=>({cdr:+(.02+.006*t).toFixed(3)}));
  W('mage','orb',['Cloudy Orb','Mossglass Orb','Pyre Orb','Lichsoul Orb','Tempest Orb'],t=>({maP:+(.03+.01*t).toFixed(3)}));
  // armour lines: a theme with an innate bonus, made as helm + chest + boots at one tier
  const PC={heavy:['Helm','Plate','Greaves'],medium:['Hood','Coat','Boots'],light:['Mask','Garb','Wraps'],cloth:['Cowl','Robe','Slippers']};
  const A=(arm,name,t,imp)=>['helm','chest','boots'].forEach((sl,i)=>ITPL.push({n:name+' '+PC[arm][i],sl,arm,t,imp:Object.assign({},imp),nw:1}));
  A('heavy','Bloodsworn',1,{hpP:.05,ls:.006});A('heavy','Ironwall',2,{hpP:.08,regen:.0012});A('heavy','Warlord',3,{paP:.06,crit:.02});
  A('medium','Pathfinder',0,{mspd:.03,loot:.05});A('medium','Deadeye',2,{crit:.03,cdm:.12});A('medium','Windrunner',4,{as:.06,mspd:.04});
  A('light','Cutthroat',1,{crit:.03,as:.03});A('light','Venomweave',3,{ls:.008,cdm:.12});A('light','Duskdancer',4,{crit:.04,mspd:.04});
  A('cloth','Hedge-Witch',0,{maP:.04,regen:.001});A('cloth','Spellbinder',2,{cdr:.04,maP:.05});A('cloth','Starweaver',4,{maP:.07,cdr:.05});
  const J=(sl,list)=>list.forEach(([n,t,imp])=>ITPL.push({n,sl,t,imp,nw:1}));
  J('amulet',[['Lucky Rabbit Foot',0,{loot:.08}],['Wolfheart Pendant',1,{hpP:.05,ls:.004}],['Scholar’s Locket',1,{xp:.06}],['Emberglow Amulet',2,{paP:.05,maP:.05}],['Vampire Fang',2,{ls:.012}],
    ['Hourglass Charm',3,{cdr:.06}],['Gravebloom Torc',3,{regen:.002,hpP:.06}],['Sovereign’s Sigil',4,{crit:.04,cdm:.2}],['Eye of the Tempest',4,{as:.06,maP:.06}]]);
  J('ring',[['Rusty Nail Ring',0,{crit:.015}],['Traveler’s Band',0,{mspd:.03}],['Bloodstone Ring',1,{ls:.006}],['Quickhand Ring',1,{as:.03}],['Ember Signet',2,{cdm:.12}],['Miser’s Ring',2,{loot:.1}],
    ['Bone Seal',3,{hpP:.06}],['Nightglass Loop',3,{crit:.03,cdm:.08}],['Ring of Storms',4,{as:.05,crit:.025}],['Archmage Seal',4,{maP:.07,cdr:.04}]]);
}

// wands and orbs are magical: they give magical attack and mana like a staff; innate bonuses are added on top
{const f=itStats;itStats=function(it){const s=f(it),t=itT(it);if(!t)return s;
  if(t.sl=='weapon'&&(t.wt=='wand'||t.wt=='orb')&&s.pa!=null){s.ma=s.pa;delete s.pa;const rm=[1,1.15,1.32,1.55,1.85][it.r]*(1+.045*(it.up||0));s.mp=Math.round((6+1.6*it.lv)*rm*(t.wt=='orb'?.8:.6))}
  if(t.imp){const u=1+.033*(it.up||0);for(const k in t.imp)s[k]=(s[k]||0)+t.imp[k]*u}
  return s}}

// item detail: attack style and innate bonus
{const f=idHTML;idHTML=function(){let h=f.apply(this,arguments);const it=selI&&(selI.k=='e'?SLOTS.map(k=>eq[k]).find(x=>x&&x.id==selI.id):gear.find(x=>x.id==selI.id));if(!it)return h;const t=itT(it);
  let x='';if(t.sl=='weapon'&&WDESC[t.wt])x+=`<div class="wsbox"><b>${WTYPE[t.wt].i} ${WTYPE[t.wt].n}</b><span>${WDESC[t.wt]}</span></div>`;
  if(t.imp)x+=`<div class="wsbox inn"><b>✦ Innate</b><span>${Object.keys(t.imp).map(k=>(SNM[k]||k)+' '+fmtS(k,t.imp[k]*(1+.033*(it.up||0)))).join(' · ')}</span></div>`;
  if(!x)return h;x='<div class="wsrow">'+x+'</div>';const re=/<\/div>(\s*)<div style="display:flex;gap:6px">/;return re.test(h)?h.replace(re,x+'</div>$1<div style="display:flex;gap:6px">'):h+x}}
{const st=document.createElement('style');st.textContent='.wsrow{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.wsrow .wsbox{flex:1 1 220px;margin-top:0}.wsbox{margin-top:8px;padding:7px 9px;border-radius:8px;display:flex;flex-direction:column;gap:3px;font-size:.74rem;background:rgba(150,170,210,.08);border:1px solid #4a5a7a}.wsbox b{color:#b8c8f0}.wsbox.inn{background:rgba(201,162,74,.08);border-color:#7a6430}.wsbox.inn b{color:#f0cc72}';document.head.appendChild(st)}

// (3. weapon models: built by lgWpnKit in 0780)
{const f=refreshGear;refreshGear=function(h,cls,E){f.apply(this,arguments);h=h||pl;cls=cls||hero.cls;E=E||eq;const w=E.weapon,wt=w&&itT(w)?itT(w).wt:null;if(!wt)return;
  const W1=(h.gearG||[]).find(o=>o.userData&&o.userData.wt==wt);if(!W1)return;
  if(wt=='axes'||wt=='claws'){const W2=mkWpn(wt,w.r>=2?parseInt(RAR[w.r][1].slice(1),16):0x9aa2ae,w.r);W2.rotation.copy(W1.rotation);W2.position.copy(W1.position);h.bones.aL2.add(W2);h.gearG.push(W2)}
  if(wt=='claws'){[W1,h.gearG[h.gearG.length-1]].forEach(o=>{o.rotation.set(-.2,0,0);o.position.set(0,-.02,.02)})}
  if(wt=='knives')W1.scale.setScalar(.78);
  if(wt=='crossbow'){W1.rotation.set(-1.45,0,0);W1.position.set(0,-.02,.06)}
  if(wt=='orb'){W1.parent.remove(W1);W1.rotation.set(0,0,0);W1.position.set(0,-.16,.1);h.bones.aL2.add(W1)}
}}

// ---------------- 4. attack behaviors ----------------
var knN=0,wandN=0;
const curWT=()=>{const w=eq.weapon&&canUse(eq.weapon)?eq.weapon:null;return w&&itT(w)?itT(w).wt:null};
const rotY=(d,a)=>V(d.x*Math.cos(a)+d.z*Math.sin(a),0,-d.x*Math.sin(a)+d.z*Math.cos(a));
function wPush(e,d,dist){if(!e||e.dead||e.boss||e.mir||(e.c&&e.c.al))return;const n=6;let i=0;const st=()=>{if(i++>=n||e.dead)return;const x=e.m.position.x+d.x*dist/n,z=e.m.position.z+d.z*dist/n;if(!solid(x,z)){e.m.position.x=x;e.m.position.z=z}setTimeout(st,22)};st()}
function wBleed(e,sec,raw){if(e&&!e.dead)eStatus(e,{bleed:sec},raw*.55,'h')}
function spinFx(r,col,ms){const m=new THREE.Mesh(new THREE.RingGeometry(r*.35,r,36),addMat(col||0xfff0c0));m.rotation.x=-Math.PI/2;m.position.copy(gY(pl.position,.7));m.material.opacity=.7;scene.add(m);
  tw(ms||280,k=>{m.material.opacity=.7*(1-k);m.rotation.z=k*5;m.scale.setScalar(.8+k*.35)},()=>{scene.remove(m);m.geometry.dispose()})}
function thrustFx(d,len,col){const g=new THREE.Group(),m=new THREE.Mesh(new THREE.BoxGeometry(.16,.04,len),addMat(col||0xe8f0ff));m.position.z=len/2;g.add(m);g.position.copy(gY(pl.position,.95));g.rotation.y=Math.atan2(d.x,d.z);scene.add(g);
  tw(170,k=>{m.material.opacity=.85*(1-k);m.scale.set(1-k*.6,1,.4+k*.6);m.position.z=len*(.2+k*.3)},()=>{scene.remove(g);m.geometry.dispose()})}

// v120: weapon numbers that used to be written into the code (balance knobs; values set in 2250-v120-balance.js)
var WB120={knSpread:.17,knDup:1,knPierce:0,shock:.35,slam:.6,knife:.5,wandBig:2.1,wandSplash:1.5,slingRic:2,orbFirst:.9,orbJump:.4};
// melee weapons: combo tables
var MW={
  ga:{N:3,m:[1.05,1.15,1.8],ms:[340,340,540],a:[0,1,2],rg:1.08,half:1.15,fin:'whirl',col:0xffc890},
  axes:{N:4,m:[.72,.72,.82,1.45],ms:[170,170,190,320],a:[0,1,0,2],rg:.95,half:1.2,dual:1,bleedC:.25,col:0xffd0a0},
  halberd:{N:3,m:[1,1,1.65],ms:[300,300,480],a:[0,0,1],rg:1.55,half:.42,thrust:1,fin:'sweep',col:0xe8f0ff},
  mace:{N:3,m:[1,1.1,1.7],ms:[300,300,450],a:[0,1,2],rg:1,half:1.15,fin:'stun',col:0xffe6b0},
  hammer:{N:3,m:[1.1,1.2,1.9],ms:[340,340,540],a:[0,1,2],rg:1,half:1.1,shock:1,fin:'slam',col:0xffe08a},
  flail:{N:2,m:[.85,1.3],ms:[380,470],spin:1,rg:1.05,fin:'holy',col:0xfff0b0},
  claws:{N:5,m:[.55,.55,.6,.6,1.25],ms:[130,130,140,140,270],a:[0,1,0,1,2],rg:.85,half:1.1,dual:1,bleedC:.2,fin:'pounce',col:0xff9a9a}
};
function wMelee(Q,C,s,raw,d,spdK,base){
  const now=performance.now();if(now-comboT>1000||combo>=Q.N)combo=0;const st=combo;combo=(combo+1)%Q.N;comboT=now;
  const fin=st==Q.N-1,mult=Q.m[st]*(fin?1+s.finisher:1),ms=Q.ms[st]*Math.min(1.2,spdK)/(1+s.as*.5);
  let rg=C.rng*Q.rg*(fin?1.12:1),half=Q.half||1.15,dir=d;
  if(Q.spin||(fin&&Q.fin=='whirl')){dir=null;half=Math.PI;rg=C.rng*Q.rg*(fin?1.1:1)}
  if(fin&&Q.fin=='sweep'){half=1.7;rg=C.rng*Q.rg*.95}
  atkCd=base*(fin?1.3:1);pl.step=fin?null:{x:d.x,z:d.z,t:.1,sp:3.5};
  const hitFn=()=>{
    if(dir==null)spinFx(rg,Q.col,fin?340:260);else if(Q.thrust&&!fin)thrustFx(d,rg,Q.col);else{slashFx(d,Q.a?Q.a[st]:0,rg);if(Q.dual)slashFx(d,(Q.a?Q.a[st]:0)==1?0:1,rg*.9)}
    const hits=area(pl.position,rg,raw*mult,{mt:C.mt,col:Q.col,basic:1},dir,half);
    if(Q.bleedC)hits.forEach(e=>{if(Math.random()<Q.bleedC)wBleed(e,3,raw)});
    if(Q.shock){const p=pl.position.clone().addScaledVector(d,rg*.8);ring(p,0xffe08a,1.8,260);area(p,1.8,raw*mult*WB120.shock,{mt:C.mt,col:0xffe08a,proc:false},null,0)}
    if(fin){
      if(Q.fin=='whirl'){hits.forEach(e=>wBleed(e,4,raw));burst(gY(pl.position,.6),0xd04a3a,30,3,1.2,.5)}
      else if(Q.fin=='sweep'){hits.forEach(e=>{const v=V(e.m.position.x-pl.position.x,0,e.m.position.z-pl.position.z).normalize();wPush(e,v,1.8)});slashFx(d,0,rg)}
      else if(Q.fin=='stun')hits.forEach(e=>eStatus(e,{stun:.9},0,'h'));
      else if(Q.fin=='slam'){const p=pl.position.clone().addScaledVector(d,1.2);ring(p,0xffd060,3.8,420);burst(gY(p,.15),0xc8b090,40,3.5,1.6,.6);
        const h2=area(p,3.8,raw*mult*WB120.slam,{mt:C.mt,col:0xffd060,proc:false},null,0);h2.forEach(e=>eStatus(e,{stun:.5},0,'h'));shake(.3)}
      else if(Q.fin=='holy'){ring(pl.position,0xfff0a0,rg+.4,380);if(hits.length){healHero(Math.round(heroMax()*.015*Math.min(6,hits.length)));burst(gY(pl.position,1),0xfff0a0,24,1.4,2,.6)}}
      else if(Q.fin=='pounce'){hits.forEach(e=>wBleed(e,3,raw));burst(gY(pl.position,.5),0xff6a6a,20,2,1.4,.4)}
      if(Q.fin!='slam'){ring(pl.position.clone().addScaledVector(d,dir?1.2:0),0xffe0a0,dir?2.4:rg,320);shake(.14)}
      hits.forEach(e=>cbHeavy(e))}
    if(hits.length){hstop=fin?.05:.02;shake(fin?.2:.06)}
  };
  if(Q.spin)spinAnim(ms*1.15,hitFn);else{SWFIN=fin;swingAnim(Q.a?Q.a[st]:0,ms,hitFn)}
}
var WBEH={
  knives(C,s,raw,d,spdK,base){atkCd=base;knN++;const n=knN%4==0?5:3;SWNOL=1;swingAnim(0,Math.max(170,base*420),()=>{const d2_=aimDir();face(d2_);
    const vol=new Set();for(let i=0;i<n;i++){const a=(i-(n-1)/2)*WB120.knSpread;launch(pl.position,rotY(d2_,a),26,{col:0xd8dde6,arrow:1,mt:'p',basic:1,wfx:'knife',vol,pierce:WB120.knPierce},raw*WB120.knife,.5);const sh=shots[shots.length-1];if(sh)sh.m.scale.set(.7,.7,.55)}sfx('stab')})},
  crossbow(C,s,raw,d,spdK,base){atkCd=base;bowAnim(base*700);setTimeout(()=>{if(!party.length)return;const d2_=aimDir();face(d2_);launch(pl.position,d2_,32,{col:0xc8b080,arrow:1,mt:'p',pierce:99,basic:1,wfx:'xbow'},raw,.75);
    const sh=shots[shots.length-1];if(sh){sh.m.scale.setScalar(1.5);try{const q=xbowMuzzle116();if(q){sh.m.position.copy(q).addScaledVector(d2_,.45);sh.m.lookAt(sh.m.position.clone().add(d2_))}}catch(_){}}sfx('arrow');shake(.05)},base*380)},
  sling(C,s,raw,d,spdK,base){atkCd=base;SWNOL=1;swingAnim(1,Math.max(200,base*560),()=>{const d2_=aimDir();face(d2_);launch(pl.position,d2_,23,{col:0x8a8478,mt:'p',basic:1,wfx:'sling',ric:WB120.slingRic},raw,.65);sfx('blunt',.5)})},
  wand(C,s,raw,d,spdK,base){atkCd=base;wandN++;const big=wandN%5==0;staffAnim(base*520);setTimeout(()=>{if(!party.length)return;const d2_=aimDir();face(d2_);
    launch(pl.position,d2_,big?17:25,{col:big?0xc0a0ff:0x7ae0ff,mt:'m',basic:1,home:1,splash:big?WB120.wandSplash:0},raw*(big?WB120.wandBig:1),.75);const sh=shots[shots.length-1];if(sh)sh.m.scale.setScalar(big?2:.75)},base*200)},
  orb(C,s,raw,d,spdK,base){atkCd=base;staffAnim(base*700);setTimeout(()=>{if(!party.length)return;let e0=tgt&&!tgt.dead&&enemies.includes(tgt)&&d2(tgt.m.position,pl.position)<11?tgt:nearestFront(11);
    if(!e0){const p=pl.position.clone().addScaledVector(aimDir(),3);burst(gY(p,1),0x9ad8ff,14,1.2,1,.4);return}face(V(e0.m.position.x-pl.position.x,0,e0.m.position.z-pl.position.z).normalize());
    orbChain(e0,raw);sfx('zap')},base*300)}
};
Object.keys(MW).forEach(k=>{WBEH[k]=(C,s,raw,d,spdK,base)=>wMelee(MW[k],C,s,raw,d,spdK,base)});
function orbChain(e0,raw){let cur=e0,from=pl.position.clone();const hit=new Set();
  for(let j=0;j<4&&cur;j++){hit.add(cur);bolt(gY(from,1),gY(cur.m.position,.8),0x9ad8ff);heroHit(cur,raw*(j?WB120.orbJump:WB120.orbFirst),'m',{s:{col:0x9ad8ff,basic:j?0:1},proc:j==0});from=cur.m.position.clone();
    cur=enemies.filter(e=>!e.dead&&!hit.has(e)&&d2(e.m.position,from)<5.5).sort((a,b)=>d2(a.m.position,from)-d2(b.m.position,from))[0]}}
var WFX={
  knife(e,s,raw){if(Math.random()<.3)wBleed(e,2.5,raw)},
  xbow(e,s,raw){if(e.dead)return;const v=V(e.m.position.x-pl.position.x,0,e.m.position.z-pl.position.z).normalize();wPush(e,v,1.2)},
  sling(e,s,raw){if(!e.dead&&Math.random()<.15)eStatus(e,{stun:.5},0,'h');
    if((s.ric||0)>0){const nx=enemies.filter(q=>!q.dead&&q!==e&&d2(q.m.position,e.m.position)<7).sort((a,b)=>d2(a.m.position,e.m.position)-d2(b.m.position,e.m.position))[0];
      if(nx){const p=e.m.position.clone(),dd=V(nx.m.position.x-p.x,0,nx.m.position.z-p.z).normalize();setTimeout(()=>{launch(p.clone().addScaledVector(dd,-.7),dd,23,Object.assign({},s,{ric:s.ric-1}),raw*.75,.5);const sh=shots[shots.length-1];if(sh)sh.hit.add(e)},40)}}}
};
{const f=heroHit;heroHit=function(e,raw,mt,o){const r=f.apply(this,arguments);try{const s=o&&o.s;if(s&&s.wfx&&e&&WFX[s.wfx])WFX[s.wfx](e,s,raw)}catch(err){console.warn(err)}return r}}
{const f=swing;swing=function(){const wt=curWT(),B=wt&&WBEH[wt];if(!B||atkCd>0||!party.length||hero.chan)return f.apply(this,arguments);
  if(typeof riding!='undefined'&&riding)dismount();
  const C=CLS[hero.cls],s=HS(),spdK=WTYPE[wt].spd,base=C.spd*spdK/(1+s.as),d=aimDir();face(d);const raw=atkOf(C.mt)*(1+s.basicP);B(C,s,raw,d,spdK,base)}}

