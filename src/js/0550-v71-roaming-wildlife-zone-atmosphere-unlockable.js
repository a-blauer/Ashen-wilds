// ================= v71: roaming wildlife · zone atmosphere · unlockable skills · bell-curve grades · consume eggs =================
function wildCount(P){let n=0;for(const e of enemies)if(e.wild&&!e.dead&&Math.abs(e.m.position.x-P.x)<95&&Math.abs(e.m.position.z-P.z)<95)n++;return n}
// v72: each zone has a fixed population for the visit; v106: per zone instance (ROST.r = instance key g), and a creature
// comes back RESP_T seconds after it dies, at its own spot (not while a hero stands within RESP_NEAR tiles of that spot)
var ROST={r:-9,slots:[],left:0,quiet:false};
// v89: zones are 1.3x bigger each way (~1.8x walkable ground): 60 roaming groups instead of 45 keep about the same density
// v97: 1.4x bigger again (~2.1x walkable ground): 130 roaming groups (plus 8 camps instead of 5)
// v106: an instance is half a v97 zone: 65 roaming groups and 4 camps each
// v108: a field instance is half a v106 one again: 33 roaming groups and 3 camps each
var ROST_G=33,RESP_T=50,RESP_NEAR=14; // v112: 50 s; never within aggro reach (4.5-6 tiles + a camp pulling its friends) of a hero
function rosterBuild(r){const I=INSL[r],p=PMAP[I.z],DW=MAP.DW,S=[];let sid=0;const L=BIOEN[p.n]||['hobgoblin'];
  // the creatures of the instance you left go (they are out of reach behind the void anyway)
  enemies.slice().forEach(e=>{if(e.slot&&!e.boss&&!e.mir)removeE(e)});
  if(!I.fld){ROST.r=r;ROST.slots=[];ROST.quiet=false;return} // v108: the den and the wave trial have no roaming creatures
  // camps: a full garrison each
  CAMPS.forEach(C=>{if(C.ig!==r)return;for(let k=0;k<C.cap;k++){let x,z,n=0;do{const a=Math.random()*6.283,rr=Math.random()*8.5;x=Math.round(C.x+Math.cos(a)*rr);z=Math.round(C.z+Math.sin(a)*rr);n++}while(solid(x,z)&&n<30);
    const key=pickMem(C.th);if(!EN[key])continue;const al=Math.random()<.018+.004*p.t;S.push({id:sid++,key,x,z,lv:Math.min(MAXLV,zoneLv(x,z)+(al?2:0)),al,camp:C,dead:false,on:null})}});
  // roaming groups spread across the whole instance
  const grp=[],BR=I.den?Math.max(30,24*DK):PM_GTR+8;for(let t=0;t<40000&&grp.length<ROST_G;t++){const x=I.x0+6+Math.floor(Math.random()*(I.w-12)),z=I.y0+6+Math.floor(Math.random()*(I.h-12));
    if(DW[z*W+x]>-2.5||solid(x,z))continue;if(CAMPS.some(C=>C.ig===r&&Math.hypot(C.x-x,C.z-z)<CAMP_R+10))continue;
    if(Math.hypot(x-I.ba[0],z-I.ba[1])<BR||(I.wa&&Math.hypot(x-I.wa[0],z-I.wa[1])<20)||Math.hypot(x-I.en[0],z-I.en[1])<22)continue;
    if(grp.some(g=>Math.hypot(g[0]-x,g[1]-z)<15))continue;grp.push([x,z])}
  grp.forEach(([x,z])=>{const key=L[Math.floor(Math.random()*L.length)],rr=Math.random(),nG=rr<.5?1:rr<.85?2:3,lv=zoneLv(x,z);
    for(let k=0;k<nG;k++){const xx=x+(k?Math.round((Math.random()-.5)*6):0),zz=z+(k?Math.round((Math.random()-.5)*6):0);if(solid(xx,zz))continue;const al=Math.random()<.012;
      S.push({id:sid++,key:k&&Math.random()<.4?L[Math.floor(Math.random()*L.length)]:key,x:xx,z:zz,hx:x,hz:z,lv:Math.max(I.lv[0],Math.min(MAXLV,lv+(al?2:0)+(Math.random()<.3?1:0)-(Math.random()<.3?1:0))),al,wild:1,dead:false,on:null})}});
  ROST.r=r;ROST.slots=S;ROST.quiet=false;CAMPS.forEach(C=>{if(C.ig===r)C.kt=-1e9})}
function rosterTick(){const r=rgAt(Math.round(pl.position.x),Math.round(pl.position.z));
  if(r<0){if(ROST.r>=0){ROST.r=-1;ROST.slots=[]}return}
  if(r!==ROST.r)rosterBuild(r);
  const ps=[pl.position];if(typeof MP!='undefined'&&MP.on&&MP.others)for(const k in MP.rh){const q=MP.rh[k];if(q.act&&q.m)ps.push(q.m.position)}
  const now=nowP(),p=PMAP[INSL[r].z];let left=0;
  for(const s of ROST.slots){
    if(s.dead){if(!(now>=(s.rt||0)))continue;let dn=1e9;for(const P of ps)dn=Math.min(dn,Math.hypot(P.x-s.x,P.z-s.z));if(dn<RESP_NEAR)continue;s.dead=false;s.on=null;s.rsp=1}
    left++;if(s.on&&(s.on.dead||!enemies.includes(s.on)))s.on=null;if(s.on)continue;
    let d=1e9;for(const P of ps)d=Math.min(d,Math.hypot(P.x-s.x,P.z-s.z));if(d>78)continue;
    if(s.camp&&!s.camp.g)buildCamp(s.camp);const e=spawnEnemy(s.key,s.x,s.z,s.lv,{al:s.al,zt:p.t});if(!e)continue;e.slot=s;s.on=e;
    if(s.rsp){s.rsp=0;if(d<40&&typeof burst=='function')burst(gY(e.m.position,.5),0x9a6aff,14,1.6,1.6,.5)}
    if(s.camp){e.camp=s.camp;e.wx=s.camp.x;e.wz=s.camp.z}else{e.wild=1;e.wx=s.hx;e.wz=s.hz}}
  ROST.left=left}
{const f=spawn;spawn=function(init){
  if(typeof MP!='undefined'&&MP.on&&MP.rg>=0&&MP.host&&MP.host!==MP.me)return;
  const r=regionAt(Math.round(pl.position.x),Math.round(pl.position.z));if(r<0&&!init)return;
  if(init)return;rosterTick()}}
{const f=kill;kill=function(e){if(e&&e.slot){e.slot.dead=true;e.slot.on=null;e.slot.rt=nowP()+RESP_T*1000}return f.apply(this,arguments)}}
// the main loop only calls spawn while below the mob cap — make sure the roster keeps streaming in either way
setInterval(()=>{try{if(party.length&&!(typeof MP!='undefined'&&MP.on&&MP.rg>=0&&MP.host&&MP.host!==MP.me))rosterTick()}catch(_){}},1500);

// ---------------- 2. each zone has its own mood ----------------
const ZATM={
 town:{sun:1,hemi:1,fog:.0155,fm:1,ex:.98,vig:1.3,sat:1.38,li:1.15,ld:13,lc:0xffa070,lan:0,pt:'none'},
 0:{env:'dark',sun:.18,hemi:.22,fog:.038,fm:.34,ex:.76,vig:1.6,sat:1.25,li:3.4,ld:17,lc:0xffc070,lan:1,pt:'fly',pc:0xd8ff6a},
 1:{sun:1.45,hemi:1.3,fog:.0085,fm:1.15,ex:1.12,vig:1.1,sat:1.5,li:.5,ld:10,lc:0xffd090,lan:0,pt:'pollen',pc:0xfff0b8},
 2:{sun:1.2,hemi:1.15,fog:.024,fm:1.25,ex:1.04,vig:1.25,sat:1.2,li:.9,ld:12,lc:0xffb070,lan:0,pt:'snow',pc:0xffffff},
 3:{sun:1.55,hemi:1.35,fog:.0125,fm:1.2,ex:1.13,vig:1.2,sat:1.42,li:.4,ld:10,lc:0xffc080,lan:0,pt:'sand',pc:0xe8b878},
 4:{env:'dark',sun:.4,hemi:.42,fog:.032,fm:.55,ex:.84,vig:1.55,sat:1.15,li:2.8,ld:16,lc:0xfff0c0,lan:1,pt:'wisp',pc:0x8affe0},
 5:{env:'dim',sun:.5,hemi:.48,fog:.026,fm:.7,ex:.86,vig:1.5,sat:1.35,li:2.2,ld:15,lc:0xffa060,lan:1,pt:'ember',pc:0xff5a2a}};
var ZA={sun:1,hemi:1,fog:.0155,fm:1,ex:.98,vig:1.3,sat:1.38,li:1.15,ld:13,cur:'town',op:0};
const ZALC=new THREE.Color(0xffa070);
// a small lantern on the hero's belt for the dark zones
var LANT=(()=>{const g=new THREE.Group();const fr=sm(0x2a2622,{metalness:.6,roughness:.4});
  TQ(g,G_BOX,fr,0,.16,0,.16,.03,.16);TQ(g,G_BOX,fr,0,-.03,0,.16,.03,.16);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>TQ(g,G_BOX,fr,a*.07,.065,b*.07,.02,.2,.02));
  const core=TQ(g,G_SPH,gmat(0xffd27a),0,.065,0,.08,.1,.08);core.castShadow=false;TQ(g,G_BOX,fr,0,.24,0,.02,.12,.02);g.visible=false;g.core=core;return g})();
try{pl.add(LANT);LANT.position.set(.3,.82,.1)}catch(_){}
// darker ambient light for the gloomy zones (the image-based ambient ignores the hemisphere light)
var ZENV=(()=>{const o={norm:scene.environment};try{[['dim',0x22283a],['dark',0x0c0e14]].forEach(([k,c])=>{const sc=new THREE.Scene();sc.add(new THREE.Mesh(new THREE.SphereGeometry(10,16,8),new THREE.MeshBasicMaterial({color:c,side:THREE.BackSide})));o[k]=pmr.fromScene(sc).texture})}catch(_){}return o})();
// drifting particles: fireflies, pollen, snow, sand, wisps, embers
var ZP=(()=>{const N=320,pos=new Float32Array(N*3),vel=new Float32Array(N*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const mat=new THREE.PointsMaterial({color:0xffffff,size:.16,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;scene.add(pts);
  return {N,pos,vel,geo,mat,pts,type:'none',init:false}})();
function zpReset(type){const P=pl.position,{N,pos,vel}=ZP;ZP.type=type;ZP.init=true;
  for(let i=0;i<N;i++){pos[i*3]=P.x+(Math.random()-.5)*60;pos[i*3+1]=P.y+Math.random()*(type=='sand'?3:type=='snow'?16:7);pos[i*3+2]=P.z+(Math.random()-.5)*60;
    vel[i*3]=(Math.random()-.5)*.6;vel[i*3+1]=0;vel[i*3+2]=(Math.random()-.5)*.6}
  const Z=ZATM[ZA.cur]||ZATM.town;ZP.mat.color.setHex(Z.pc||0xffffff);ZP.mat.size={fly:.22,pollen:.1,snow:.14,sand:.07,wisp:.32,ember:.12}[type]||.12}
function zpTick(dt,now){const {N,pos,vel}=ZP,P=pl.position,t=ZP.type;if(t=='none')return;ZP.geo.attributes.position.needsUpdate=true;
  for(let i=0;i<N;i++){const j=i*3;let x=pos[j],y=pos[j+1],z=pos[j+2];
    if(t=='fly'){vel[j]+=(Math.random()-.5)*dt*2;vel[j+2]+=(Math.random()-.5)*dt*2;vel[j]*=.98;vel[j+2]*=.98;x+=vel[j]*dt;z+=vel[j+2]*dt;y=P.y+.6+2.2*(.5+.5*Math.sin(now/900+i))}
    else if(t=='pollen'){x+=(.6+Math.sin(i))*dt;z+=Math.cos(now/2000+i)*.3*dt;y+=Math.sin(now/700+i*1.7)*.15*dt}
    else if(t=='snow'){y-=(1.4+(i%5)*.25)*dt;x+=(Math.sin(now/1300+i)*.6+.8)*dt;z+=Math.cos(now/1500+i)*.4*dt;if(y<P.y-1)y+=16}
    else if(t=='sand'){x+=(7+(i%7))*dt;z+=Math.sin(now/600+i)*.8*dt;y=P.y+.2+(i%9)*.3+Math.sin(now/300+i)*.15}
    else if(t=='wisp'){y+=(.25+(i%4)*.08)*dt;x+=Math.sin(now/1700+i)*.4*dt;z+=Math.cos(now/1900+i)*.4*dt;if(y>P.y+7)y-=7}
    else if(t=='ember'){y+=(1+(i%5)*.3)*dt;x+=Math.sin(now/500+i)*.5*dt;z+=Math.cos(now/650+i)*.5*dt;if(y>P.y+9)y-=9}
    if(x<P.x-30)x+=60;else if(x>P.x+30)x-=60;if(z<P.z-30)z+=60;else if(z>P.z+30)z-=60;if(y<P.y-2)y+=8;
    pos[j]=x;pos[j+1]=y;pos[j+2]=z}
  if(t=='fly'||t=='wisp')ZP.mat.size=(t=='fly'?.2:.3)*(.8+.35*Math.sin(now/260))}
{const f=atmos;atmos=function(dt,now){f.apply(this,arguments);try{
  const r=regionAt(Math.round(pl.position.x),Math.round(pl.position.z)),key=r<0?'town':r,Z=ZATM[key],k=Math.min(1,(dt||.016)*1.4+.004);
  if(ZA.cur!==key){ZA.cur=key;ZA.op=0;zpReset(Z.pt);const en=ZENV[Z.env||'norm']||ZENV.norm;if(en&&scene.environment!==en)scene.environment=en}
  ['sun','hemi','fog','fm','ex','vig','sat','li','ld'].forEach(q=>ZA[q]+=(Z[q]-ZA[q])*k);ZALC.lerp(new THREE.Color(Z.lc),k);
  sun.intensity*=ZA.sun;hemi.intensity*=ZA.hemi;scene.fog.density=ZA.fog;scene.fog.color.multiplyScalar(ZA.fm);scene.background=scene.fog.color;
  if(typeof POST!='undefined'&&POST.u&&typeof PSXON!='undefined'&&PSXON){POST.u.ex.value=ZA.ex;POST.u.vig.value=ZA.vig;POST.u.sat.value=ZA.sat}
  torch.color.copy(ZALC);torch.distance=ZA.ld;torch.intensity=ZA.li*(1+Math.sin(now/80)*.06+Math.random()*.04);
  LANT.visible=!!Z.lan&&true;if(LANT.visible){const q=1+Math.sin(now/90)*.06;LANT.core.scale.set(.08*q,.1*q,.08*q)}
  ZA.op+=((Z.pt=='none'?0:Z.pt=='sand'?.55:.85)-ZA.op)*k;ZP.mat.opacity=ZA.op;zpTick(Math.min(.05,dt||.016),now)}catch(err){}}}

// ---------------- 3. XP: −15% more everywhere (applied in gainXP); wave trial now only −25% ----------------

// ---------------- 4. unlockable class skills, chosen into the four skill slots ----------------
const SKX={
 warrior:[{n:'Shockwave',i:'🌊',lv:6,k:'beam',m:2.2,cd:8,mp:14,col:0xffc890,d:'Slam a shockwave forward that hits every enemy in a line.'},
  {n:'Iron Skin',i:'⛓️',lv:12,k:'barrier',v:.35,dur:6,cd:18,mp:16,col:0xc8c8d8,d:'Harden yourself: absorb damage equal to 35% of max health for 6s.'},
  {n:'Earthshatter',i:'🪨',lv:22,k:'nova',m:3.0,r:4,stun:1.2,cd:16,mp:26,col:0xc89060,d:'Crack the earth around you, dealing heavy damage and stunning.'}],
 paladin:[{n:'Judgment',i:'⚖️',lv:6,k:'beam',m:2.3,mt:'m',cd:8,mp:14,col:0xffe8a0,d:'A lance of holy light that pierces a line of enemies.'},
  {n:'Hammer of Light',i:'🔨',lv:12,k:'meteor',m:3.2,r:3,delay:.7,mt:'m',cd:14,mp:22,col:0xfff0a0,d:'A radiant hammer falls on the target area.'},
  {n:'Aegis',i:'🔰',lv:22,k:'buff',cd:24,mp:20,buff:{dr:.25,pdP:.2,mdP:.2},dur:8,col:0xfff0c0,d:'25% damage reduction and +20% defenses for 8s.'}],
 assassin:[{n:'Smoke Bomb',i:'💨',lv:6,k:'nova',m:1.2,r:3.4,stun:1.4,cd:10,mp:12,col:0x9a9aaa,d:'Vanish in smoke, stunning everything around you.'},
  {n:'Shuriken Volley',i:'✴️',lv:12,k:'shot',n2:3,m:1.4,cd:5,mp:10,col:0xd8d8e8,arrow:1,d:'Throw three spinning shuriken.'},
  {n:'Shadow Dance',i:'🌑',lv:22,k:'buff',cd:22,mp:18,buff:{as:.35,crit:.2},dur:8,col:0x7a4ae0,d:'+35% attack speed and +20% critical chance for 8s.'}],
 ranger:[{n:'Explosive Arrow',i:'💣',lv:6,k:'shot',m:2.6,big:1,burn:1,cd:7,mp:12,col:0xff9a4a,d:'An arrow that bursts into flame on impact.'},
  {n:'Hunter’s Focus',i:'🎯',lv:12,k:'buff',cd:20,mp:14,buff:{crit:.25,cdm:.4},dur:8,col:0xc8f0a0,d:'+25% critical chance and +40% critical damage for 8s.'},
  {n:'Barrage',i:'🏹',lv:22,k:'shot',n2:9,m:.9,cd:10,mp:22,col:0xf0e0b0,arrow:1,d:'Loose nine arrows in a wide fan.'}],
 mage:[{n:'Arcane Missiles',i:'✨',lv:6,k:'shot',n2:3,m:1.3,mt:'m',cd:4,mp:10,col:0xb08aff,d:'Three seeking bolts of arcane energy.'},
  {n:'Blizzard',i:'🌨️',lv:12,k:'rain',at:'aim',m:.6,ticks:10,iv:.4,r:3.4,mt:'m',stun:.4,cd:15,mp:22,col:0x9fe3ff,d:'An ice storm batters the target area.'},
  {n:'Mana Shield',i:'🔮',lv:22,k:'barrier',v:.4,dur:7,cd:22,mp:24,col:0x9ab8ff,d:'Absorb damage equal to 40% of max health for 7s.'}]};
const SKB={};Object.keys(SKL).forEach(c=>{SKB[c]=SKL[c]});
const skAll=c=>SKB[c].concat(SKX[c]||[]);
var SKC={key:'',arr:null};
Object.keys(SKB).forEach(c=>Object.defineProperty(SKL,c,{configurable:true,enumerable:true,get(){if(c!==hero.cls)return SKB[c];const key=c+'|'+((hero.tal&&hero.tal.__ld)||'')+'|'+Object.keys(hero.tal||{}).filter(k=>k.startsWith('sk:')).join(',');if(SKC.key!==key){SKC.key=key;SKC.arr=skLoad(c)}return SKC.arr}}));
{const f=talSpent;talSpent=function(b){let n=f(b);if(b==null&&hero.tal)for(const k in hero.tal)if(k.startsWith('sk:'))n+=hero.tal[k]|0;return n}}
{const f=rTal;rTal=function(){f.apply(this,arguments);const t=$('talT');if(!t)return;let d=$('skBox');if(!d){t.insertAdjacentHTML('afterend','<div id="skBox"></div>');d=$('skBox')}d.innerHTML=skHTML()}}
document.addEventListener('click',e=>{const t=e.target.closest('[data-sku],[data-sks]');if(!t||t.disabled||!$('skBox')||!$('skBox').contains(t))return;
  if(t.dataset.sku){const s=skAll(hero.cls).find(q=>q.n===t.dataset.sku);if(!s||tpFree()<1||hero.lvl<s.lv)return;hero.tal['sk:'+s.n]=1;say('🗡️ Unlocked '+s.i+' '+s.n+'! Put it on a key below.');
    const cur=heroSkills();if(cur.length<4)skSet(cur.length,s.n);else rTal();hud()}
  else skSet(+t.dataset.sks,t.dataset.skn)});
document.head.insertAdjacentHTML('beforeend',`<style>
#skBox{margin-top:10px}.sksec{border-top:1px solid rgba(255,255,255,.1);padding-top:8px}.skh{font-weight:700;color:#f0cc72;margin-bottom:6px}.skh .mut{font-weight:400;font-size:.74rem;margin-left:6px}
.skg{display:grid;grid-template-columns:1fr 1fr;gap:6px}@media(max-width:700px){.skg{grid-template-columns:1fr}}
.skr{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding:6px 8px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(0,0,0,.22)}
.skr.lk{opacity:.7}.ski{font-size:1.3rem}.skn small{display:block;color:#9aa;font-size:.7rem}.ska{display:flex;gap:3px}.ska button{min-width:26px;padding:3px 6px;font-size:.75rem}
</style>`);

// ---------------- 5. hatch grades: C is the norm, S lucky, F unlucky ----------------
const GBAND=[['S',1.2,1.26,2],['A',1.12,1.2,8],['B',1.06,1.12,20],['C',1.0,1.06,40],['D',.94,1.0,20],['E',.88,.94,8],['F',.82,.88,2]];
function gRoll(bonus){let r=Math.random()*100,i=GBAND.length-1;for(let k=0;k<GBAND.length;k++){r-=GBAND[k][3];if(r<0){i=k;break}}
  if(bonus>0&&i>0&&Math.random()<Math.min(.5,bonus))i--;const g=GBAND[i];return g[1]+Math.random()*(g[2]-g[1])}
{const f=hatch;hatch=function(e){const c=f.apply(this,arguments);if(c&&c.iv){const b=Math.max(0,((e&&e.pa)||1)-1)*2+((c.hab||0)/100)*.3;
  ['hp','pa','ma','pd','md'].forEach(k=>c.iv[k]=gRoll(b));ivSync(c);c.q=Math.max(0,Math.min(1,(ivOf(c,'hp')+ivOf(c,'pa')+ivOf(c,'pd'))/3-.82)/.44);c.h=M(c)}return c}}

// ---------------- 6. fusion: Consume an egg instead of Bolster; fusing keeps the level ----------------
var fEgg=null;
const consGain=t=>(.012+.007*t);
function fuseOpts(a,b){
  if(fOpt=='bol')fOpt='con';const card=(id,ic,t,d,dis)=>`<button class="fopt${fOpt==id?' on':''}" data-fo="${id}" ${dis?'disabled':''}><span class="fi">${ic}</span><b>${t}</b><small>${d}</small></button>`;
  if(fOpt=='con'||!b){const cards=`<div class="fopts">${card('std','📈','Standard fuse',b?'Stats grow faster with every level':'Pick a second companion first',!b)}${card('sip','🧲','Siphon a stat',b?'Copy one stronger roll':'Pick a second companion first',!b)}${card('con','🥚','Consume','Feed '+a.n+' an egg for a small boost to every base stat')}</div>`;
    return cards+(fOpt=='con'?conHTML(a):'<div class="fdet mut">Pick a companion of the same family to fuse into '+a.n+', or choose Consume to feed it an egg.</div>')}
  const v=fuseVal(a,b),pen=tierSp(a.g[0])>tierSp(b.g[0])&&fCat!='c_asc',sipK=IVK.filter(k=>ivOf(b,k)>ivOf(a,k)+.001);
  if(fOpt=='sip'&&!sipK.length)fOpt='std';if(fOpt=='sip'&&!sipK.includes(fStat))fStat=sipK[0];
  let det='';
  if(fOpt=='std')det=`<div class="fdet">📈 ${a.n}'s growth per level: <b>+${pctS(a.gs||0)}</b> → <b style="color:#6ee7b7">+${pctS((a.gs||0)+.06*v)}</b> <span class="mut">(no limit)</span></div>`;
  else det=`<div class="fdet">Choose the stat to pull from ${b.n}:<div class="fstats">${IVK.map(k=>{const ga=grade(ivOf(a,k)),nv=ivOf(a,k)+(ivOf(b,k)-ivOf(a,k))*Math.min(1,v),gn=grade(nv),can=sipK.includes(k);return `<button data-fs="${k}" class="${fStat==k?'on':''}" ${can?'':'disabled'}><b>${IVS[k]}</b> <span style="color:${ga[2]}">${ga[1]}</span>${can?` → <span style="color:${gn[2]}">${gn[1]}</span>`:''}</button>`}).join('')}</div>${v<1?'<small class="mut">Half strength: the consumed companion is a lower tier.</small>':''}</div>`;
  return `<div class="fopts">${card('std','📈','Standard fuse','Stats grow faster with every level')}${card('sip','🧲','Siphon a stat',sipK.length?'Copy one stronger roll from '+b.n:'No stat on '+b.n+' is better',!sipK.length)}${card('con','🥚','Consume','Feed '+a.n+' an egg instead')}</div>${det}
    <div class="fwarn">⚠ ${b.n} is consumed${pen?' · lower-tier partner: half strength':''}. ${a.n} keeps its level.${(b.mods||[]).filter(m=>!(a.mods||[]).includes(m)).length?' · '+(fCat=='c_ess'?'100%':'35%')+' chance to inherit a modifier':''}</div>`}
{const f=rF;rF=function(){f.apply(this,arguments);const a=sel.length>=1?party[sel[0]]:null,b=sel.length==2?party[sel[1]]:null;const ft=document.querySelector('#fz .wf .dtl');if(ft)ft.textContent='Grades run F · E · D · C · B · A · S. Fusing keeps your companion’s level.';
  if(!a)return;const m=$('fmsg');if(fOpt=='con'||(!b)){if(!b||fOpt=='con'){m.className='';const cat=m.querySelector('.fcat');m.innerHTML=fuseOpts(a,b);if(cat&&fOpt!='con')m.appendChild(cat)}}
  const d=$('doF');if(fOpt=='con'){d.disabled=!eggs.some(e=>e.id==fEgg);d.textContent='🥚 Consume egg'}else{d.textContent='Fuse';if(!b)d.disabled=true}}}
$('fz').addEventListener('click',e=>{const g=e.target.closest('[data-fegg]');if(g){e.stopPropagation();fEgg=+g.dataset.fegg;rF()}},true);
{const f=$('doF').onclick;$('doF').onclick=function(){
  if(fOpt=='con'){const a=party[sel[0]],i=eggs.findIndex(e=>e.id==fEgg);if(!a||i<0)return;const eg=eggs.splice(i,1)[0];ivFix(a);const g=consGain(eg.tier||0),up=[];
    IVK.forEach(k=>{const o=ivOf(a,k),n=Math.min(1.3,o+g*(.8+Math.random()*.4));a.iv[k]=n;if(grade(n)[1]!=grade(o)[1])up.push(IVS[k]+' '+grade(o)[1]+'→'+grade(n)[1])});ivSync(a);a.h=Math.min(M(a),a.h+Math.round(M(a)*.1));fEgg=null;
    say('🥚 '+nm(a)+' consumed a Tier '+(eg.tier+1)+' '+eg.sp+' egg · every base stat +'+pctS(g)+(up.length?' ('+up.join(', ')+')':''));sfx('chime');hsDirty();ui();rF();return}
  if(sel.length!=2)return;const a=party[sel[0]],l0=a?a.l:1,x0=a?a.x:0;f.apply(this,arguments);
  if(a&&party.includes(a)&&a.l==1&&l0>1){a.l=l0;a.x=x0;a.h=M(a);ui();say('✨ '+a.n+' keeps its level ('+l0+').')}}}

