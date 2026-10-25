// ================= v148.1: enemy area attacks aimed at the hero also catch companions =================
// A creature's telegraphed attack (the red ground shapes: a.tel, and the extra ones of signature moves, a.xt) only ever tested
// its own target, so a companion standing in the shape took nothing when the creature was after the hero. Now, when the
// attacker's target is the hero, every active companion inside one of that attack's shapes takes SPL148.k (30%) of the hit:
//  - at the moment the hero is hit by it, or
//  - when the attack's strike phase ends without having hit the hero (the hero dodged out, the companion did not).
// Each companion is caught once per attack. Projectiles (spit, bolts, throws) are left out: they still hit what they meet.
// "Inside" means a downward ray at the companion meets one of the attack's ground shapes. Sovereign fights are not changed.
var SPL148={k:.3,rc:null};
function spl148Shapes(a){const L=[];if(!a)return L;if(a.tel)L.push(a.tel);(a.xt||[]).forEach(t=>{if(t)L.push(t)});return L}
function spl148In(L,p){if(!L.length)return false;const rc=SPL148.rc||(SPL148.rc=new THREE.Raycaster()),M=[];
  L.forEach(g=>g.traverse(o=>{if(o.isMesh)M.push(o)}));if(!M.length)return false;
  rc.set(new THREE.Vector3(p.x,p.y+6,p.z),new THREE.Vector3(0,-1,0));rc.far=14;return rc.intersectObjects(M,false).length>0}
function spl148Ranged(a){const M=a&&a.M;return !!(a&&(a.n=='spit'||a.n=='throw'||a.n=='bolt'||(M&&M.proj)||(typeof KQR!='undefined'&&KQR[a.n]&&!(M&&M.sh))))}
function spl148Hit(e,a,L,mult,mt){if(!e||e.dead||!a||spl148Ranged(a))return;const seen=a.spl148||(a.spl148=new Set());
  const n=typeof actN141=='function'?actN141():party.length;
  for(let i=0;i<Math.min(n,fols.length);i++){const f=fols[i],c=party[i];if(!f||!c||c.h<=0||seen.has(f)||!f.visible)continue;
    if(!spl148In(L,f.position))continue;seen.add(f);
    SPL148.on=1;try{hitTarget(e,f,(mult||1)*SPL148.k,mt)}catch(err){console.warn('v148 splash',err)}finally{SPL148.on=0}}}
// the hero is hit by an area attack: companions inside its shapes too
{const f=hitTarget;hitTarget=function(e,tg,mult,mt){const r=f.apply(this,arguments);
  try{if(!SPL148.on&&tg===pl&&e&&e.atk&&e.atk.tg===pl){const a=e.atk;a.spl148h=1;spl148Hit(e,a,spl148Shapes(a),mult,mt)}}catch(_){}return r}}
// the strike phase ends without hitting the hero: companions still inside the shapes get caught
{const f=mTick;mTick=function(e,dt,now){const a=e&&e.atk,ph0=a&&a.ph,L=a&&a.tg===pl?spl148Shapes(a):null;
  if(L&&L.length)L.forEach(g=>g.updateMatrixWorld(true));const r=f.apply(this,arguments);
  try{if(L&&L.length&&ph0===1&&(e.atk!==a||a.ph>=2)&&!a.spl148h){const M=a.M||{};spl148Hit(e,a,L,M.dmg||1,M.mt||e.c.mt)}}catch(err){console.warn('v148 splash',err)}return r}}
