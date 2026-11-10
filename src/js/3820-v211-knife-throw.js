// ================= v211: a real knife when you throw, and a smaller turn of the body (owner, Nov 9 2026) =================
// Owner: "Does throwing knife actually throw a knife? or is it an arrow? I also still dont like how far to the side our character
// turns when throwing the knife"
//  1. The knife: throwing knives launched the arrow model shrunk (0.7 × 0.7 × 0.55: a short arrow with feathers). Now the thrown
//     thing is the knife the hero holds (the dagger kit at the hand's 0.78 size), flipping end over end as it flies (KN211.spin
//     rad/s, overhand: the point goes over the top). Partners see the knife too: the 'L' message's last field (e[13], 1 = a crossbow
//     bolt since v207) is 2 for a knife (2170); older partners still draw their small arrow.
//  2. The turn: the baked knife throw twists the spine and hips ~0.85 rad one way in the wind-up and ~0.75 rad back after the
//     release (the v207 variations add a little more): nearly a right angle of turn every throw. The throw's yaw channels (spine sy,
//     hips py, chest cy and the head's counter-turn hy) now play at KN211.yawK of that; the arm's own swing, the lean and the steps
//     are unchanged, so the throws still differ and still flow. Partners see the played pose (2170 samples the hero's bones).
var KN211={yawK:.4,spin:22,sc:.78,on:true,ch:['sy','py','cy','hy']};
{const f=atkPick;atkPick=function(st){const T=f.apply(this,arguments);
  try{if(KN211.on&&T&&atkWT()==='knives'){const o={},g=function(k){const p=T(k);for(const c in p)o[c]=p[c];for(const c of KN211.ch)if(typeof o[c]=='number')o[c]*=KN211.yawK;return o};g.v100=T.v100;return g}}catch(_){}return T}}
// the thrown knife: +z is its flight (the shot code points it), a pivot spins it about x; the kit is shared (nothing to free)
function kn211Mesh(){const out=new THREE.Group(),pv=new THREE.Group(),k=lgGroup('KQ211|tknife',k=>lgWpnKit(k,'dagger',0x9aa2ae,0),.1);
  k.rotation.x=-Math.PI/2;k.position.z=-.12;pv.scale.setScalar(KN211.sc);pv.add(k);out.add(pv);out.userData.lpsSkip=1;out.userData.kn211=1;out.userData.kn211pv=pv;
  const t0=performance.now();let m=null;k.traverse(o=>{if(!m&&o.isMesh)m=o});
  if(m)m.onBeforeRender=function(){pv.rotation.x=(performance.now()-t0)/1000*KN211.spin};
  return out}
function kn211Swap(sh){if(!sh||!sh.m)return;const o=sh.m,b=kn211Mesh();b.position.copy(o.position);b.quaternion.copy(o.quaternion);
  if(o.parent)o.parent.add(b);if(o.parent)o.parent.remove(o);sh.m=b;sh.kn211=1}
// as 3782's throw, with the knife (knife:1 tells partners to draw a knife; mpSc stays .7 for older partners' arrow)
WBEH.knives=function(C,s,raw,d,spdK,base){atkCd=base;knN++;SWNOL=1;KN207.cur=KN207.order[KN207.i++%KN207.order.length];
  try{kn207Aim(aimDir())}catch(_){}
  const hp=haPlay;haPlay=function(ms,pose,hitAt,onHit,bi){return hp.call(this,ms,pose,hitAt,onHit,Math.max(bi==null?.22:bi,KN207.bi))};
  try{swingAnim(0,Math.max(KN207.ms[0],base*KN207.ms[1]),()=>{const d2_=aimDir();kn207Aim(d2_);
    launch(pl.position,d2_,26,{col:0xd8dde6,arrow:1,mt:'p',basic:1,wfx:'knife',pierce:WB127.knPierce,mpSc:.7,knife:1},raw*WB127.knife1,.5);
    const sh=shots[shots.length-1];if(sh)kn211Swap(sh);sfx('stab')})}
  finally{haPlay=hp}};
