// ================= v207: the owner's list (Nov 8 2026) — gameplay and UI =================
// Owner: "There are way too many boxes in kindlelight and they drop too much loot. Its also hard to break them with mage and
// ranger class' basic attack" · "Some enemies walk up to or are in attacking range but dont attack for long periods of time …
// more often after they use a special attack" · "When you have mouse look on and you open a menu and then close it- mouse look
// should return to being on." · "When an enemy is on elevated ground, abilities and attacks (ranged) do not path up to them" ·
// "sometimes damage text shows a large decimal number" · "After hatching an egg in the hatchery-it should return to the hatchery
// menu" · "In kingdom menu- remove the 'Shops' and 'upgrades' separation title" · "Change kindlelight quest Stone and Ore for the
// Forge to require 5 iron ore or crystal" · Abeksi: "player should be able to attack … would just make the snake attempt to ring
// the bell", "Vision cones of abeksi residents should be twice as big. Remove vision cones and possibility of getting sighted by
// residents on rooftops. Guards are fine.", "Remove the text that says 'Abeksi has fallen'. Just have the title to Mistmere" ·
// "Remove the text … 'Fallen creatures respawn after 50 seconds after they die' when entering an instance."
//  1. Kindlelight boxes (BX207): at most BX207.kl breakable boxes per Kindlelight camp (was CS164.box = 10); the extra box models
//     are left out of the camp (3241 reads CS164.cut). Every box drops less (v207b: all zones; first Kindlelight only): gold × goldK, one material at matP, a potion
//     at potP, an egg at eggP (were: 1–3 materials always, 8 % potion, 3 % egg).
//     Ranged basic attacks break boxes: a shot is tested along the whole stretch it moved this frame (a fast arrow could skip a
//     box), with a slightly bigger box radius (BX207.shotR); a ranged basic attack with no enemy locked aims at the box you face
//     (within BX207.aimR tiles and BX207.aimA radians of where you aim) and does not home on a monster.
//  2. Monsters after a special move (EN207): the special's long cooldown (2.6–12 s) used to block every attack, so the monster
//     circled you without attacking. Now the special keeps its own cooldown (e.mcd207, it is not picked again before then) and the
//     next attack of any other kind is ready after a normal basic-attack pause (EN207.cd).
//  3. Mouse-look comes back after a menu (ML207): a window that turned mouse-look off turns it back on when it closes (not after
//     Esc or a right click that turned it off on purpose).
//  4. Floating numbers are rounded (dn): no more "123.456789".
//  5. Hatchery: hatching from the Hatchery returns to the Hatchery window when the reveal is closed or continued (HT207).
//  6. The Steward's list has no "Shops" / "Upgrades" titles.
//  7. Cheddar's "Stone and Ore for the Forge" (k2c): 5 iron ore or crystal (any mix). Old progress: the iron mined counts.
//  8. Abeksi (AB207): a swing is allowed; a snake in reach that is struck grabs its bell (the v192 ring: kill it within 3 s or the
//     city wakes). Residents (townsfolk and the plan's citizens) see twice as far; residents up on roofs have no cone and see
//     nothing (guards unchanged). Leaving the city by the gate or the drain shows only Mistmere's title card.
//  9. The "Fallen creatures return 50 seconds after they die" line is gone from the "back where you left off" banner.
// 10. Hero shots follow the ground's height (they climb a slope to a monster on higher ground instead of vanishing into the hill),
//     and a shot locked onto a monster flies over the rock edge below it (SH207). Partners' ghost shots follow the ground too (2170).
// Co-op: boxes, loot, menus, quests and mouse-look are local as before; monsters are the region host's (its AI, its cooldowns);
// the Abeksi strike is the host's ring (a partner's strike is sent as ['ab','sw',ri]: older hosts ignore it); shots: see 10.
var BX207={kl:4,goldK:.6,matP:.6,potP:.04,eggP:.015,shotR:.85,aimR:10,aimA:.45,aimT:0,boxT:0,v:207};
var EN207={cd:[1.0,1.6]};
var ML207={on:0,was:0,t:0};
var HT207={ret:0};
var AB207={reach:2.6,ang:1.1,n:0};
var SH207={K:null,prev:null};
{const f=buildCamp;buildCamp=function(C){if(!C||C.g)return f.apply(this,arguments);const kl=String(C.key||'').split('_')[0]==='0',o=CS164.box;
  if(kl){CS164.box=Math.min(o,BX207.kl);CS164.cut=1}
  try{return f.apply(this,arguments)}finally{CS164.box=o;CS164.cut=0;
    try{if(kl&&C.boxes&&C.boxes.length>BX207.kl){C.boxes.slice(BX207.kl).forEach(b=>{if(b.g&&b.g.parent)b.g.parent.remove(b.g)});C.boxes.length=BX207.kl}}catch(_){}}}}
{const f=brkBox;brkBox=function(C,b){if(!b||b.b)return f.apply(this,arguments);   // v207b (owner: "Apply the box loot change to all boxes"): every zone
  b.b=nowP();const p=V(b.x,0,b.z),T=tierAt(b.x,b.z),l=zoneLv(b.x,b.z);
  burst(gY(p,.5),0x8a5a30,26,2.6,2.4,.6);burst(gY(p,.4),0xc8a070,10,1.6,1.6,.5);sfx('blunt');sfx('slash',.5);
  b.g.matrixAutoUpdate=true;tw(260,k=>{b.g.scale.set(1+k*.4,1-k,1+k*.4);b.g.rotation.z=k*.4},()=>{b.g.visible=false;b.g.scale.set(1,1,1);b.g.rotation.z=0});
  const g=Math.max(1,Math.round((2+l*.8)*(.7+Math.random()*.6)*BX207.goldK));gold+=g;dn(p,'+'+g+' 🪙','#fbbf24',-26,1000);
  if(Math.random()<BX207.matP){const mk=BXMAT[T-1][R(0,2)];if(RES[mk]||matInfo(mk))drop('mat',{k:mk,n:1},p,0)}
  const r=Math.random();if(r<BX207.eggP){const eg=rollEgg(T);drop('egg',eg,p,eg.tier)}else if(r<BX207.eggP+BX207.potP)drop('potion',null,p,1);
  hud()}}
// a shot breaks the first box along the stretch it moved this frame
function bx207Seg(ax,az,bx,bz,px,pz){const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz;let t=L2>1e-9?((px-ax)*dx+(pz-az)*dz)/L2:0;t=Math.max(0,Math.min(1,t));return Math.hypot(ax+dx*t-px,az+dz*t-pz)}
brkShot=function(p){if(typeof ABX!='undefined'&&ABX.ctx)return false;const q=SH207.prev&&SH207.prev.get(p),a=q||p;let best=null,bd=1e9;
  CAMPS.forEach(C=>{if(!C.boxes||!C.g||!C.g.visible)return;const cr=(C.r||CAMP_R)+3;if(Math.abs(C.x-p.x)>cr||Math.abs(C.z-p.z)>cr)return;
    C.boxes.forEach(b=>{if(b.b)return;const d=bx207Seg(a.x,a.z,p.x,p.z,b.x,b.z);if(d>BX207.shotR)return;const s=Math.hypot(b.x-a.x,b.z-a.z);if(s<bd){bd=s;best=[C,b]}})});
  if(best){brkBox(best[0],best[1]);return true}return false};
// a ranged basic attack with no monster locked aims at the box in front of you
function bx207Ranged(){try{return typeof bfxRanged=='function'&&bfxRanged()}catch(_){return false}}
function bx207Pick(v){const P=pl.position;let best=null,bs=1e9;
  CAMPS.forEach(C=>{if(!C.boxes||!C.g||!C.g.visible)return;if(Math.hypot(C.x-P.x,C.z-P.z)>(C.r||CAMP_R)+BX207.aimR+2)return;
    C.boxes.forEach(b=>{if(b.b)return;const dx=b.x-P.x,dz=b.z-P.z,L=Math.hypot(dx,dz);if(L>BX207.aimR||L<.2)return;
      const a=Math.acos(Math.max(-1,Math.min(1,(dx*v.x+dz*v.z)/L)));if(a>BX207.aimA)return;const s=L*(1+a*2.5);if(s>=bs)return;
      for(let t=.9;t<L-1.6;t+=.4){if(solid(P.x+dx*t/L,P.z+dz*t/L))return}   // a clear line to it (not behind a tent or a wall)
      bs=s;best=b})});
  return best}
function bx207Locked(){const t=tgt;return !!(t&&!t.dead&&enemies.indexOf(t)>=0&&d2(t.m.position,pl.position)<9)}
{const f=aimDir;aimDir=function(){const v=f.apply(this,arguments);
  try{if(nowP()<BX207.aimT&&v&&!bx207Locked()){const b=bx207Pick(v);if(b){BX207.boxT=nowP();return V(b.x-pl.position.x,0,b.z-pl.position.z).normalize()}}}catch(_){}return v}}
{const f=swing;swing=function(){if(bx207Ranged()&&atkCd<=0)BX207.aimT=nowP()+1500;return f.apply(this,arguments)}}
{const f=launch;launch=function(pos,d,spd,s,dm,life){
  if(s&&typeof s=='object'&&s.basic&&s.home&&nowP()-BX207.boxT<120){const a=[].slice.call(arguments);a[3]=Object.assign({},s,{home:0});return f.apply(this,a)}
  return f.apply(this,arguments)}}

// ---------------- 2. monsters after a special move ----------------
function en207Basic(n){return !!(KQMEL[n]||KQR[n])}
{const f=mTick;mTick=function(e,dt,now){const a=e&&e.atk;const r=f.apply(this,arguments);
  try{if(a&&e.atk!==a&&a.ph===2&&!(a.t>0)&&!e.boss&&!e.sv&&!e.dead&&a.M&&!en207Basic(a.n)&&(a.M.cd||0)>EN207.cd[1]){
    (e.mcd207||(e.mcd207={}))[a.n]=nowP()+Math.max(0,e.cd||0)*1000;
    e.cd=Math.min(e.cd,(EN207.cd[0]+Math.random()*(EN207.cd[1]-EN207.cd[0]))*(e.enr?.65:1))}}catch(_){}
  return r}}
{const f=ePick;ePick=function(e,ok){try{const M=e&&e.mcd207;if(M){const t=nowP();ok=ok.filter(n=>!(M[n]>t));if(!ok.length)return null}}catch(_){}return f.call(this,e,ok)}}

// ---------------- 3. mouse-look comes back after a menu ----------------
function ml207Check(){try{if(typeof orb=='undefined')return;const ui=uiOpen(),on=!!(orb&&orb.tg);
  if(on){ML207.on=1;ML207.was=ui?1:0;return}   // on with a window already open: that window is about to turn it off
  if(ML207.on&&ui)ML207.was=1;          // mouse-look was on and a window turned it off
  ML207.on=0;
  if(ML207.was&&!ui&&!orb&&party.length&&!(typeof KQS!='undefined'&&KQS.tg)){
    const act=!navigator.userActivation||navigator.userActivation.isActive;if(!act)return;
    ML207.was=0;orbStart({clientX:innerWidth/2,clientY:innerHeight/2},1)}}catch(_){}}
setInterval(ml207Check,100);
['click','keyup'].forEach(t=>addEventListener(t,()=>setTimeout(ml207Check,0)));
// mouse-look ended by hand (Esc or a right click with no window open) is not brought back: ML207.on clears without a window
document.addEventListener('pointerlockchange',()=>{setTimeout(()=>{try{if(!orb&&!uiOpen())ML207.was=0}catch(_){}},0)});

// ---------------- 4. rounded floating numbers ----------------
{const f=dn;dn=function(p,t){const a=[].slice.call(arguments);
  if(typeof t=='number'&&isFinite(t)&&t!==Math.round(t))a[1]=Math.round(t);
  else if(typeof t=='string'&&/\d\.\d{2,}/.test(t))a[1]=t.replace(/\d+\.\d{2,}/g,m=>String(Math.round(+m)));
  return f.apply(this,a)}}

// ---------------- 5. the Hatchery window comes back after a hatch ----------------
{const f=ht200Hatch;ht200Hatch=function(ids){HT207.ret=1;const r=f.apply(this,arguments);if(!CE.hat&&!hAct)HT207.ret=0;return r}}
{const f=nextHatch;nextHatch=function(){const last=!hq.length;const r=f.apply(this,arguments);
  try{if(last&&HT207.ret&&!CE.hat)$('cmp').classList.add('hide')}catch(_){}return r}}
new MutationObserver(()=>{if(!HT207.ret||!$('cmp').classList.contains('hide'))return;HT207.ret=0;
  setTimeout(()=>{try{if(!uiOpen())openX('hatch200')}catch(_){}},30)}).observe($('cmp'),{attributes:true,attributeFilter:['class']});

// ---------------- 6. the Steward's list: no Shops / Upgrades titles ----------------
{const f=XR.hold;XR.hold=function(){const r=f.apply(this,arguments);
  try{document.querySelectorAll('#xwB .sec').forEach(s=>{const t=s.textContent.trim();if(t==='🔨 Shops'||t==='🏰 Upgrades')s.remove()})}catch(_){}return r}}

// ---------------- 7. Stone and Ore for the Forge: 5 iron ore or crystal ----------------
try{const q=CHQ132_ID.k2c;if(q){q.d='Five iron ore or crystal for the hearth: whichever the rock gives up. The veins here run rust-red.';q.o=[['oreCry',5,'Iron Ore or Crystal mined']]}}catch(_){}
{const f=gFinish;gFinish=function(tg){const i0=mats.iron||0,c0=mats.crystal||0;const r=f.apply(this,arguments);
  try{const n=Math.max(0,(mats.iron||0)-i0)+Math.max(0,(mats.crystal||0)-c0);if(n)chqEv132('oreCry',n)}catch(_){}return r}}
// old saves: [stone, iron] (or v141's migrated [0, iron]) becomes [iron]
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const S=CHQ132.st&&CHQ132.st.k2c,raw=s&&s.chq&&s.chq.st&&s.chq.st.k2c;
  if(S&&Array.isArray(S.p)){let n;if(raw&&Array.isArray(raw.p)&&raw.p.length>=2)n=raw.p[1]|0;   // a pre-v207 save: [stone, iron]: the iron counts
    else n=S.p.length>=2?S.p[1]|0:S.p[0]|0;                                                       // a v207 save (v141's wrapper made it [0, n])
    S.p=[Math.min(5,Math.max(0,n))];if(S.s===1&&S.p[0]>=5)S.s=2}}catch(_){}return r}}

// ---------------- 8. Abeksi ----------------
AB152V.rng.folk*=2;AB152V.rng.civ*=2;AB152V.rng.busy*=2;   // residents see twice as far (guards, lanterns, the lamp tower unchanged)
function ab207Roof(a){return !!a&&!!a.folk&&(a.o&&a.o.lift||0)>=1&&!ab157Guard(a)}
{const f=ab192Sees;ab192Sees=function(a){if(ab207Roof(a))return 0;return f.apply(this,arguments)}}
{const f=ab152Sees;ab152Sees=function(a){if(ab207Roof(a))return 0;return f.apply(this,arguments)}}
{const f=ab192ConeUp;ab192ConeUp=function(a){if(ab207Roof(a)){if(a.cone)a.cone.visible=false;return}return f.apply(this,arguments)}}
{const f=ab152ConeTick;ab152ConeTick=function(a){if(ab207Roof(a)){if(a.cone)a.cone.visible=false;return}return f.apply(this,arguments)}}
// a swing is allowed in the city; a snake in reach that is struck grabs its bell
{const f=sp152NoFight;sp152NoFight=function(){if(AB207.sw)return false;return f.apply(this,arguments)}}
function ab207Struck(){const S=AB152.S,H=AB152H;if(!S)return null;const fy=pl.rotation.y,fu=Math.sin(fy),fv=Math.cos(fy);let best=null,bd=1e9;
  for(const a of ab157Res()){if(!a||a.dead||a.e||a.net1||a.hid||a.r192||a.halt)continue;if(a.folk&&!a.on)continue;if((a.o&&a.o.lift||0)>=1)continue;
    const du=a.u-H.u,dv=a.v-H.v,d=Math.hypot(du,dv);if(d>AB207.reach||d>=bd)continue;
    if(d>.6&&Math.acos(Math.max(-1,Math.min(1,(du*fu+dv*fv)/d)))>AB207.ang)continue;if(d>1.2&&!ab152LOS(S.G,a.u,a.v,H.u,H.v,false))continue;best=a;bd=d}
  return best}
function ab207Ring(a,by){if(!a||a.dead||a.r192||AB157A.on)return false;const H=ab192HeroAt(by);a.last=[H[0],H[1]];a.seen=1;a.yaw=Math.atan2(H[0]-a.u,H[1]-a.v);a.hy=0;
  return ab192Start(a,by||MP.me,false)}
{const f=swing;swing=function(){
  if(!(typeof ab152In=='function'&&ab152In()&&AB152.S)||AB157A.on||AB157A.kill||AB152H.cau)return f.apply(this,arguments);
  try{if(AB192.R.length&&ab192Near(true))return f.apply(this,arguments)}catch(_){}   // a ringer in reach: v192 silences it
  const a0=atkCd;AB207.sw=1;let r;try{r=f.apply(this,arguments)}finally{AB207.sw=0}
  try{if(atkCd>a0+1e-4){const a=ab207Struck();if(a){AB207.n++;
      if(ab157Lead())ab207Ring(a,MP.me);else if(ab157Co())cl155Send(['ab','sw',a.ri]);
      try{svSnd('hiss',1,1)}catch(_){}}}}catch(e){console.warn('v207 abeksi strike',e)}
  return r}}
{const f=ab155On;ab155On=function(q,peer){if(q&&q[1]==='sw'){try{if(ab152In()&&AB152.S&&ab157Lead()&&!AB157A.on){const a=ab157Res()[q[2]|0];if(a)ab207Ring(a,peer)}}catch(_){}return}
  return f.apply(this,arguments)}}
// leaving the city: only Mistmere's card
{const f=zt116Show;zt116Show=function(T,kick,title){if(title==='Abeksi Has Fallen'||title==='Abeksi Escaped')return;return f.apply(this,arguments)}}

// ---------------- 9. no respawn line on the "back where you left off" banner ----------------
{const f=banner;banner=function(t,s,x){if(typeof x=='string'&&/^Fallen creatures return/.test(x)){const a=[].slice.call(arguments);a[2]='';return f.apply(this,a)}return f.apply(this,arguments)}}

// ---------------- 10. hero shots follow the ground; a locked shot clears the rock edge below its target ----------------
function sh207Y(x,z,yo){return GH(x,z)+yo}
{const f=solid;solid=function(x,z){const K=SH207.K;if(K&&K.has(Math.round(z)*W+Math.round(x)))return false;return f.apply(this,arguments)}}
{const f=shotTick;shotTick=function(dt){let K=null;const M=new Map();
  try{for(const sh of shots){if(!sh||!sh.m)continue;const p=sh.m.position;
      if(sh.yo207==null){const L=sh.v?Math.hypot(sh.v.x,sh.v.z):0;sh.p207=p.clone();if(L>1e-6){sh.p207.x-=sh.v.x/L*.7;sh.p207.z-=sh.v.z/L*.7}
        sh.yo207=Math.max(.5,Math.min(1.6,p.y-GH(sh.p207.x,sh.p207.z)))}
      else sh.p207.copy(p);
      M.set(p,sh.p207);
      // a box on this frame's path breaks before anything else can end the shot (a rock tile next to the box, a long frame)
      if(dt>0&&sh.v&&sh.t>0&&!(sh.s&&sh.s.cc)&&!(typeof ABX!='undefined'&&ABX.ctx)){const nx=p.x+sh.v.x*dt,nz=p.z+sh.v.z*dt;let best=null,bd=1e9;
        CAMPS.forEach(C=>{if(!C.boxes||!C.g||!C.g.visible)return;const cr=(C.r||CAMP_R)+3;if(Math.abs(C.x-p.x)>cr+3||Math.abs(C.z-p.z)>cr+3)return;
          C.boxes.forEach(b=>{if(b.b)return;if(bx207Seg(sh.p207.x,sh.p207.z,nx,nz,b.x,b.z)>BX207.shotR)return;const s2=Math.hypot(b.x-sh.p207.x,b.z-sh.p207.z);if(s2<bd){bd=s2;best=[C,b]}})});
        if(best){brkBox(best[0],best[1]);if(!((sh.s&&sh.s.pierce)>0))sh.t=0}
        // the camp's clutter right round a box (a crate stack, a tent peg) does not stop a shot on its way to that box
        else if(solid(nx,nz)){let nb=false;CAMPS.forEach(C=>{if(nb||!C.boxes||!C.g||!C.g.visible)return;if(Math.abs(C.x-nx)>(C.r||CAMP_R)+3||Math.abs(C.z-nz)>(C.r||CAMP_R)+3)return;
            for(const b of C.boxes)if(!b.b&&Math.hypot(b.x-nx,b.z-nz)<1.6){const L=Math.hypot(sh.v.x,sh.v.z)||1,c=((b.x-p.x)*sh.v.x+(b.z-p.z)*sh.v.z)/(L*(Math.hypot(b.x-p.x,b.z-p.z)||1));if(c>.8){nb=true;break}}});
          if(nb)(K||(K=new Set())).add(Math.round(nz)*W+Math.round(nx))}}
      const t=sh.htg;if(dt>0&&t&&!t.dead&&t.m&&sh.v){const nx=p.x+sh.v.x*dt,nz=p.z+sh.v.z*dt;
        if(d2(t.m.position,p)<12&&solid(nx,nz)&&GH(nx,nz)<=GH(t.m.position.x,t.m.position.z)+1.2)(K||(K=new Set())).add(Math.round(nz)*W+Math.round(nx))}}}catch(_){}
  SH207.K=K;SH207.prev=M;let r;try{r=f.apply(this,arguments)}finally{SH207.K=null;SH207.prev=null}
  if(dt>0)try{for(const sh of shots){if(!sh||!sh.m||sh.yo207==null)continue;const p=sh.m.position,y0=p.y,g=GH(p.x,p.z),want=g+sh.yo207;
      p.y+=(want-p.y)*Math.min(1,dt*30);if(p.y<g+.3)p.y=g+.3;
      if(sh.s&&sh.s.arrow&&sh.v){const vy=(p.y-y0)/dt;sh.m.lookAt(p.x+sh.v.x,p.y+vy,p.z+sh.v.z)}}}catch(_){}
  return r}}

// ---------------- 11. Hillside Crest I's secrets (owner: "there are 3 secrets right next to each other. remove 1 and place the other somewhere else") ----------------
// The cracked boulder nearest Cheddar's own one ("Under the Stone", 2350) is taken out of the world (its entry stays in SECRETS:
// ids are saved by index), and Cheddar's is moved to a spot of the same kind at least SEC207.far tiles from the one that stays.
var SEC207={far:70,gone:null,moved:null};
try{const I=PMAP[1]&&PMAP[1].ins[0],inI=S=>{const J=insAt(S.x,S.z);return !!J&&J.g===I.g};const Q=SECRETS.find(S=>S.chq&&inI(S));
  if(I&&Q){const rest=SECRETS.filter(S=>S!==Q&&S.k=='boulder'&&inI(S)).sort((a,b)=>Math.hypot(a.x-Q.x,a.z-Q.z)-Math.hypot(b.x-Q.x,b.z-Q.z));
    const G=rest[0];if(G&&Math.hypot(G.x-Q.x,G.z-Q.z)<40){SEC207.gone=G.id;G.x=-9999;G.z=-9999;G.gone207=1}
    const keep=SECRETS.filter(S=>S!==Q&&!S.gone207&&S.k=='boulder'&&inI(S));let s=20770;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};
    for(let k=0;k<1500;k++){const x=Math.round(I.x0+12+rnd()*(I.w-24)),y=Math.round(I.y0+12+rnd()*(I.h-24));const J=insAt(x,y);if(!J||J.g!==I.g)continue;
      if(keep.some(S=>Math.hypot(S.x-x,S.z-y)<SEC207.far))continue;if(Math.hypot(x-I.en[0],y-I.en[1])<40)continue;
      if(CAMPS.some(C=>Math.hypot(C.x-x,C.z-y)<(C.r||12)+8))continue;if(I.path&&I.path.some(p=>Math.hypot(p[0]-x,p[1]-y)<6))continue;if(!freeSpot(x,y,3))continue;
      Q.x=x;Q.z=y;Q.T=Math.max(1,tierAt(x,y));SEC207.moved=[x,y];break}}}catch(err){console.warn('v207 secrets',err)}
