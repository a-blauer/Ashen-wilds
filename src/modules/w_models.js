// ================= v53: KayKit 3D models (CC0, Kay Lousberg) for the hero and humanoid enemies =================
// Models load in the background; until (or unless) they arrive, the original built-in models stay in place.
const KK={ok:!!(THREE.GLTFLoader&&THREE.SkeletonUtils),base:'models/',g:{},p:{},clips:{},list:[],H:1.45};
KK.load=n=>KK.p[n]||(KK.p[n]=new Promise(res=>{if(!KK.ok)return res(null);const L=new THREE.GLTFLoader(),ok=g=>{KK.g[n]=g;res(g)},bad=()=>res(null);
  const d=window.KKDATA&&KKDATA[n];if(d){try{const bin=atob(d),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);L.parse(u.buffer,'',ok,bad)}catch(_){bad()}}else L.load(KK.base+n+'.glb',ok,undefined,bad)}));
KK.lib=n=>KK.load('anim_'+n).then(g=>{if(!g)return null;if(!KK.clips[n]){const m={};g.animations.forEach(a=>{m[a.name]=a});KK.clips[n]=m}return KK.clips[n]});
const kkTint=(root,col,k)=>{if(col==null)return;k=k==null?.8:k;const c=new THREE.Color(col).multiplyScalar(1.7);root.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();o.material.color.setRGB(1,1,1).lerp(c,k).multiplyScalar(1-k*.25)}})};
// build a ready-to-animate instance; o = {m: model, lib, show:[weapon nodes to keep], wR/wL: separate weapon files, tint}
async function kkMake(o){
  const [g,clips]=await Promise.all([KK.load(o.m),KK.lib(o.lib)]);if(!g||!clips)return null;
  const wR=o.wR?await KK.load(o.wR):null,wL=o.wL?await KK.load(o.wL):null;
  const root=THREE.SkeletonUtils.clone(g.scene);
  root.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;n.frustumCulled=false;if(!n.isSkinnedMesh&&o.show&&!o.show.includes(n.name))n.visible=false}});
  const hand=(bn,w)=>{if(!w)return;let b=null;root.traverse(n=>{if(!b&&n.name.replace(/[._]/g,'')==bn)b=n});if(b){const c=w.scene.clone();c.traverse(n=>{if(n.isMesh){n.castShadow=true}});b.add(c)}};
  hand('handslotr',wR);hand('handslotl',wL);
  kkTint(root,o.tint,o.tk);
  // normalise height
  const bx=new THREE.Box3().setFromObject(root),h=Math.max(.1,bx.max.y-bx.min.y);root.scale.setScalar((o.h||KK.H)/h);
  const mx=new THREE.AnimationMixer(root),A={root,mx,clips,cur:null,cn:'',one:null};
  A.play=(n,fade,loop,ts)=>{const cl=clips[n];if(!cl)return 0;const a=mx.clipAction(cl);a.reset();a.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,Infinity);a.clampWhenFinished=!loop;a.timeScale=ts||1;a.enabled=true;a.setEffectiveWeight(1);
    if(A.cur&&A.cur!==a)A.cur.crossFadeTo(a,fade==null?.15:fade,false);a.play();A.cur=a;A.cn=n;return cl.duration};
  A.base=(n,ts)=>{if(A.one)return;if(A.cn===n){if(ts&&A.cur)A.cur.timeScale=ts;return}A.play(n,.2,true,ts)};
  A.shot=(n,ts,hold)=>{const d=A.play(n,.08,false,ts);if(!d)return;A.one=n;clearTimeout(A.ot);A.ot=setTimeout(()=>{if(A.one===n){A.one=null;if(!hold)A.cn=''}},d/(ts||1)*1000*.92)};
  return A;
}
// ---------- hero ----------
const HKK={warrior:{m:'Barbarian',show:['2H_Axe','Barbarian_Hat','Barbarian_Cape'],atk:['2H_Melee_Attack_Chop','2H_Melee_Attack_Slice','2H_Melee_Attack_Spin'],sk:'2H_Melee_Attack_Spin',idle:'2H_Melee_Idle'},
 paladin:{m:'Knight',show:['1H_Sword','Badge_Shield','Knight_Helmet','Knight_Cape'],atk:['1H_Melee_Attack_Chop','1H_Melee_Attack_Slice_Diagonal','1H_Melee_Attack_Slice_Horizontal'],sk:'Spellcast_Raise'},
 assassin:{m:'Rogue_Hooded',show:['Knife','Knife_Offhand','Rogue_Cape'],atk:['Dualwield_Melee_Attack_Stab','Dualwield_Melee_Attack_Slice','Dualwield_Melee_Attack_Stab','Dualwield_Melee_Attack_Slice'],sk:'Dualwield_Melee_Attack_Slice'},
 ranger:{m:'Rogue',show:['2H_Crossbow','Rogue_Cape'],atk:['2H_Ranged_Shoot'],sk:'2H_Ranged_Shoot'},
 mage:{m:'Mage',show:['2H_Staff','Mage_Hat','Mage_Cape'],atk:['Spellcast_Shoot'],sk:'Spellcast_Raise'}};
let HK=null,hkCls=null,hkLast=null;
async function heroKK(){
  if(!KK.ok||!PSXON||!hero.cls||hkCls===hero.cls)return;hkCls=hero.cls;const D=HKK[hero.cls];
  const A=await kkMake({m:D.m,lib:'hero',show:D.show});if(!A||hkCls!==hero.cls)return;
  if(HK)pl.remove(HK.root);HK=Object.assign(A,{D});pl.add(A.root);A.base(D.idle||'Idle');
}
function heroKKTick(dt){
  if(!HK)return;pl.children.forEach(c=>{if(c!==HK.root)c.visible=false});
  const p=pl.position,last=hkLast||(hkLast=p.clone()),sp=dt>0?Math.hypot(p.x-last.x,p.z-last.z)/dt:0;last.copy(p);
  if(hero.hp<=0){if(HK.cn!=='Death_A'&&!HK.dead){HK.dead=1;HK.one=null;HK.play('Death_A',.1,false,1.2)}}
  else{if(HK.dead){HK.dead=0;HK.one=null;HK.cn=''}
    if(riding)HK.base('Idle');else if(sp>3.2)HK.base('Running_A',Math.min(1.5,sp/5));else if(sp>.6)HK.base('Walking_A',Math.max(.8,sp/2));else HK.base(HK.D.idle||'Idle')}
  HK.mx.update(dt);
}
// hook hero actions to animation clips
{const _sw=swing;swing=function(){const a0=atkCd,r=_sw.apply(this,arguments);if(HK&&atkCd>a0+.001){const L=HK.D.atk;HK.shot(L[(combo+L.length-1)%L.length],1.35)}return r}}
{const _ca=cast;cast=function(i){const c0=hero.cd['s'+i]||0,r=_ca.apply(this,arguments);if(HK&&(hero.cd['s'+i]||0)>c0)HK.shot(HK.D.sk,1.3);return r}}
{const _do=dodge;dodge=function(){const d0=hero.dc||0,r=_do.apply(this,arguments);if(HK&&(hero.dc||0)<d0)HK.shot('Dodge_Forward',1.6);return r}}
{const _fl=heroFlinch;heroFlinch=function(){_fl();if(HK&&!HK.one)HK.shot('Hit_A',1.5)}}
// ---------- humanoid enemies ----------
const EKK={
 skeleton:{m:'Skeleton_Warrior',lib:'skel',wR:'Skeleton_Blade',atk:'1H_Melee_Attack_Chop',run:'Running_C',spawn:'Spawn_Ground_Skeletons',die:'Death_C_Skeletons'},
 hollowknight:{m:'Skeleton_Warrior',lib:'skel',wR:'Skeleton_Axe',wL:'Skeleton_Shield_Large_A',atk:'1H_Melee_Attack_Chop',run:'Running_C',h:1.7,tint:0x4a5a7a,tk:.5},
 bonearcher:{m:'Skeleton_Rogue',lib:'skel',wR:'Skeleton_Crossbow',atk:'2H_Ranged_Shoot',run:'Running_C',spawn:'Spawn_Ground_Skeletons'},
 revenant:{m:'Skeleton_Mage',lib:'skel',wR:'Skeleton_Staff',atk:'Spellcast_Shoot',cast:'Spellcast_Summon',run:'Running_C'},
 bandit:{m:'Rogue_Hooded',lib:'hero',show:['Knife','Knife_Offhand','Rogue_Cape'],atk:'Dualwield_Melee_Attack_Stab',tint:0x2a2224,tk:.85},
 brigand:{m:'Barbarian',lib:'hero',show:['1H_Axe','Barbarian_Round_Shield','Barbarian_Cape'],atk:'1H_Melee_Attack_Chop',tint:0x5a2a22,tk:.7,h:1.6},
 cultist:{m:'Mage',lib:'hero',show:['1H_Wand','Mage_Hat','Mage_Cape'],atk:'Spellcast_Shoot',cast:'Spellcast_Raise',tint:0x8a1020,tk:.9},
 shaman:{m:'Mage',lib:'hero',show:['2H_Staff','Mage_Cape'],atk:'Spellcast_Shoot',cast:'Spellcast_Raise',tint:0x3a6a2a,tk:.85,h:1.15},
 orc:{m:'Barbarian',lib:'hero',show:['2H_Axe','Barbarian_Cape'],atk:'2H_Melee_Attack_Chop',spin:'2H_Melee_Attack_Spin',tint:0x3a6a2a,tk:.9,h:1.85},
 giant:{m:'Barbarian',lib:'hero',show:['2H_Axe'],atk:'2H_Melee_Attack_Chop',spin:'2H_Melee_Attack_Spin',tint:0x6a7480,tk:.85,h:1.6},
 hobgoblin:{m:'Rogue',lib:'hero',show:['Knife'],atk:'1H_Melee_Attack_Chop',tint:0x4a7a2a,tk:.9,h:1.05},
 slinger:{m:'Rogue',lib:'hero',show:['Throwable'],atk:'1H_Ranged_Shoot',tint:0x5a7a2a,tk:.9,h:1}};
const KKE=new Set();
{const _se=spawnEnemy;spawnEnemy=function(key,x,z,l,o){const e=_se(key,x,z,l,o);if(e&&KK.ok&&PSXON&&EKK[key]&&!e.boss)kkEnemy(e,key);return e}}
async function kkEnemy(e,key){
  const D=EKK[key],A=await kkMake(D);if(!A||e.dead||!enemies.includes(e))return;
  if(e.m.b)e.m.b.visible=false;e.kk=Object.assign(A,{D});e.m.add(A.root);KKE.add(e);
  if(D.spawn&&!e.agg)A.shot(D.spawn,1.4);else A.base('Idle');
}
const EMV={spin:'spin',slam:'spin',charge:'run',pounce:'run',rainfire:'cast',bolt:'atk',throw:'atk',strike:'atk',bite:'atk'};
function enemyKKTick(dt){
  KKE.forEach(e=>{
    const A=e.kk;if(!enemies.includes(e)){KKE.delete(e);return}
    if(e.dead){if(!A.died){A.died=1;A.one=null;A.play(A.D.die||'Death_A',.05,false,2.2)}A.mx.update(dt);return}
    if(!e.m.visible)return;if(e.m.b)e.m.b.visible=false;
    const p=e.m.position,last=A.lp||(A.lp=p.clone()),sp=dt>0?Math.hypot(p.x-last.x,p.z-last.z)/dt:0;last.copy(p);
    if(e.atk&&e.atk!==A.la){A.la=e.atk;const k=EMV[e.atk.n]||'atk',n=k=='spin'?(A.D.spin||'2H_Melee_Attack_Spin'):k=='cast'?(A.D.cast||A.D.atk):k=='run'?(A.D.run||'Running_A'):A.D.atk,cl=A.clips[n];
      if(cl){const ts=Math.max(.6,Math.min(2.2,cl.duration*.45/Math.max(.2,e.atk.T||.5)));A.shot(n,ts)}}
    if(e.m.flT&&e.m.flT!==A.ft&&!A.one){A.ft=e.m.flT;A.shot('Hit_A',1.8)}
    if(e.stun>0)A.base('Idle',.3);else if(sp>2.2)A.base(A.D.run||'Running_A',Math.min(1.5,sp/4));else if(sp>.4)A.base('Walking_A');else A.base(e.agg&&A.clips.Idle_Combat?'Idle_Combat':'Idle');
    A.mx.update(dt);
  });
}
// preload in the background so the first fights already have models
function kkPreload(){if(!KK.ok||!PSXON)return;['anim_hero','anim_skel'].forEach(KK.load)}
let kkT=0;
function modelsTick(dt,now){if(!KK.ok||!PSXON)return;if(!hkCls||hkCls!==hero.cls)heroKK();heroKKTick(dt);enemyKKTick(dt)}
setTimeout(kkPreload,800);
