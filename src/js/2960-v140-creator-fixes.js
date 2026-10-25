// ================= v140: character creator fixes (owner's list, Oct 2026) =================
// * Ranger: a new victory pose. The old one drew the bow across his chest while the v135 carry kept the bow level across the
//   hips, so the bow lay sideways with its string loose in front of him. Now he raises the bow high in his bow hand, upright with the
//   string toward him, the other fist pressed to his chest, chest out and chin up. cc140Bow turns the bow upright in the raised hand after
//   the pose (the carry is worked out before the pose moves the arm).
// * The Mage's arm (2220, fc140Fwd / fc140Scale) and the companion step's material hint (0840, whole words) are fixed in their files.
var CC140={bow:{up:[0,1,0],str:[0,-.15,-1]}};   // hero frame [x across from the bow hand, y up, z forward]: the upper limb's way, the string's way
CC116.P.ranger={set:{'aL0.x':-2.55,'aL0.z':-.55,'aL1.x':-.12,'aR0.x':.35,'aR0.z':-.5,'aR1.x':-1.5},add:{'chest.x':-.1,'head.x':-.22,'spine.y':.12}};
function cc140Bow(h){const S=h&&h._grip;if(!S||!S.L)return;let e=null;for(const q of S.L)if(q.ty=='bow'&&q.W&&q.W.parent){e=q;break}if(!e)return;
  const V=THREE.Vector3,Q=THREE.Quaternion,W=e.W,P=W.parent;P.updateWorldMatrix(true,false);
  const Y=new V(...CC140.bow.up).normalize(),Xs=new V(...CC140.bow.str);Xs.addScaledVector(Y,-Xs.dot(Y)).normalize();const Z=new V().crossVectors(Xs,Y);
  const inHero=new Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xs,Y,Z)),hq=h.getWorldQuaternion(new Q()),pq=P.getWorldQuaternion(new Q());
  W.quaternion.copy(pq.invert().multiply(hq).multiply(inHero));
  const C=e.C,an=C.an||GRIP_AN,hd=new V(C.hold[0]*W.scale.x,C.hold[1]*W.scale.y,C.hold[2]*W.scale.z).applyQuaternion(W.quaternion);W.position.set(an[0]-hd.x,an[1]-hd.y,an[2]-hd.z);
  h.updateMatrixWorld(true)}
{const f=cc116Pose;cc116Pose=function(h,cls){const r=f.apply(this,arguments);try{if(cls=='ranger')cc140Bow(h)}catch(e){if(!CC140.err){CC140.err=1;console.warn('v140 ranger bow',e)}}return r}}
