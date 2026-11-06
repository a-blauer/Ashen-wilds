// ================= v202 natural wrists for the humanoid foes (owner, Nov 6 2026: "Fix the 40 humanoid enemies") =================
// Measured on every humanoid foe (idle, walk, each attack, twist about the forearm left out): 24 of the 40 bent the weapon
// hand 64–85° at the wrist in their blows (the v181 attack solver allowed flex / extend 65° plus 35° of ulnar deviation, the
// anatomical edge), and the Brigand's and the Orc's charge (a move v181 does not drive) folded it back 120°. A real wrist
// reads as broken well before its limit, so:
//  * the v181 solver's wrist limits are cut for one-handed weapons, daggers and two-handers (FW202_WL: flex / extend 65° → 52-57°,
//    ulnar 35° → 29° (two-handers keep 35°), radial 20° → 17°; the weapon's turn inside the fist stays as it was, FA_FIST, and every blow keeps its
//    edge / point leading as v181_foe_attacks requires); the solver
//    already moves the elbow round its circle and rolls the hand to keep the weapon on its line, so the shoulder and elbow now
//    carry what the wrist did;
//  * a last layer (after every animation) bends any wrist the solver did not set this frame — one-handed weapons, daggers,
//    slings, claws, and moves v181 doesn't drive such as the charge — back to at most FW202.max (≈ 48°), keeping the forearm's
//    twist. Two-handed weapons, polearms, staves and bows are left to the solver (their off hand holds the haft, which a
//    later turn of one hand would pull out of it).
// The rest pose of a wrist is its bind pose (from the skeleton), so the bend is measured exactly as the probe measured it.
// Co-op: animation is local and deterministic per foe; every client runs the same code.
var FW202={on:1,max:.84};
// the solver's wrist limits (flex / extend, ulnar, radial; radians), set around each foe's animation step: 52° / 29° / 17° for
// every weapon class; v181's own (65° / 35° / 20°) only where a blow needs the range to keep its edge leading or the off hand
// on the haft (v181_foe_attacks): the Jotun's second swing (keeps 57° / 35°), the Troll Shaman's cast, the slinger's whirl
var FW202_WL={one:[.9,.5,.3],dag:[.9,.5,.3],two:[.9,.5,.3],pole:[.9,.5,.3],staff:[.9,.5,.3]},FW202_WLK={jotun:[1.0,.61,.35],trollsh:null};
var FW202_TWO={two:1,pole:1,staff:1,bow:1};
var FW202Q=[new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion()],FW202V=new THREE.Vector3(),FW202M=new THREE.Matrix4(),FW202S=new THREE.Vector3();
// the wrist's rest (bind) rotation in its parent, cached on the bone
function fw202Rest(b,sk){if(b.userData.q202)return b.userData.q202;const i=sk.bones.indexOf(b),j=sk.bones.indexOf(b.parent);if(i<0||j<0)return null;
  const W=FW202M.copy(sk.boneInverses[i]).invert(),P=new THREE.Matrix4().copy(sk.boneInverses[j]).invert(),L=P.invert().multiply(W),q=new THREE.Quaternion();L.decompose(FW202S,q,FW202S);
  return b.userData.q202=q}
// bend (swing off the forearm's line) limited to mx, the twist about the forearm kept
function fw202Clamp(b,q0,mx){const Q=FW202Q,rel=Q[0].copy(q0).invert().multiply(b.quaternion),ax=FW202V.copy(b.position).normalize().applyQuaternion(Q[1].copy(q0).invert());
  const d=rel.x*ax.x+rel.y*ax.y+rel.z*ax.z,tw=Q[2].set(ax.x*d,ax.y*d,ax.z*d,rel.w);if(tw.lengthSq()<1e-9)tw.identity();else tw.normalize();
  const sw=Q[3].copy(rel).multiply(Q[1].copy(tw).invert());if(sw.w<0){sw.x=-sw.x;sw.y=-sw.y;sw.z=-sw.z;sw.w=-sw.w}
  const a=2*Math.acos(Math.min(1,sw.w));if(a<=mx)return 0;sw.slerp(Q[1].identity(),1-mx/a);b.quaternion.copy(q0).multiply(sw).multiply(tw);return a-mx}
{const f=animC;animC=function(g,now,mv,sp){let r,W0=null;
  try{const S=FW202.on&&g&&g._fa,K=S&&S.K,L=K&&(S.key in FW202_WLK?FW202_WLK[S.key]:FW202_WL[K.c]);if(L&&typeof FA_WL!='undefined'){W0=[FA_WL.flex,FA_WL.uln,FA_WL.rad];FA_WL.flex=L[0];FA_WL.uln=L[1];FA_WL.rad=L[2]}}catch(_){}
  try{r=f.apply(this,arguments)}finally{if(W0){FA_WL.flex=W0[0];FA_WL.uln=W0[1];FA_WL.rad=W0[2]}}
  try{if(!FW202.on||!g||!g.hk179||!g.h||!g.h.bones)return r;   /* humanoid foes only (heroes and folk untouched) */const S=g._fa,K=S&&S.K;if(K&&FW202_TWO[K.c])return r;if(S&&S.ph>=0)return r;
    const b=g.h.bones;let sk=g._sk202;if(sk===undefined){sk=null;g.traverse(o=>{if(!sk&&o.isSkinnedMesh&&o.skeleton&&b.aR2&&o.skeleton.bones.indexOf(b.aR2)>=0)sk=o.skeleton});g._sk202=sk}
    if(!sk)return r;['aR2','aL2'].forEach(n=>{const w=b[n];if(!w)return;const q0=fw202Rest(w,sk);if(q0)fw202Clamp(w,q0,FW202.max)})}
  catch(e){if(!FW202.err){FW202.err=1;console.warn('v202 wrists',e)}}
  return r}}
