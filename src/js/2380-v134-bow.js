// ================= v134: bow — one string, a smaller bow, carried inside the bow arm =================
// 1. The bow model's own string is now a mesh of its own (material 's' in 0780). While a shot shows the drawn string
//    (bowFxSet for the hero, eBowFxSet for archer foes) the model's straight string hides, so there are never two strings.
// 2. The bow is BOW_K (0780) of its old size, scaled about the riser, so the grip, shots and drawn string still line up
//    (the drawn string reads its tips from BOW_T).
// 3. The carry (V100A_BOW, 1700) holds it upright close along the body, inside the bow arm, string toward the body.
function bow134Str(W,show){if(!W)return;const S=W.userData.bow134s||(W.userData.bow134s=(()=>{const L=[],M=lgMats().s;W.traverse(o=>{if(o.isMesh&&o.material===M)L.push(o)});return L})());
  for(const o of S)o.visible=show}
{const f=bowFxSet;bowFxSet=function(k,g){const r=f.apply(this,arguments);try{const W=(pl.gearG||[]).find(o=>o.userData&&o.userData.wt=='bow'&&o.parent);
  bow134Str(W,!(BOW_FX&&BOW_FX.g.visible))}catch(_){}return r}}
{const f=eBowFxSet;eBowFxSet=function(g,k,gr){const r=f.apply(this,arguments);try{bow134Str(g.bowW,!(g.bowFx&&g.bowFx.g.visible))}catch(_){}return r}}
// 3. Carry (owner's reference picture): the bow lies across the front of the hips, held low at the riser in the bow hand, its limbs
//    pointing left-right (one across the body, one out past the hand), the string toward the body and a little up. X134 replaces
//    the v100/v125 upright side carry: a = how far the string side tilts up, b = the limbs turned forward at the far end,
//    r = the limbs tipped up toward the body; lx/lz/le in V100A_BOW still pose the relaxed carry arm.
V100A_BOW.x134={a:.8,b:.1,r:.05};Object.assign(V100A_BOW,{lx:-.12,lz:-.1,le:-.42,an:[0,-.04,.02]});
{const f=V100A_bowQ;V100A_bowQ=function(){const B=V100A_BOW,X=B.x134;if(!X)return f.apply(this,arguments);const V3=THREE.Vector3,Q=THREE.Quaternion,E=THREE.Euler;
  // model axes: +x riser→string, +y upper limb. Hero frame: +x is across the body from the bow hand (the bow arm is on -x), +z forward
  const Y=new V3(Math.cos(X.b),Math.sin(X.r),Math.sin(X.b)).normalize(),Xs=new V3(0,Math.sin(X.a),-Math.cos(X.a));Xs.addScaledVector(Y,-Xs.dot(Y)).normalize();
  const Z=new V3().crossVectors(Xs,Y),q=new Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xs,Y,Z));
  const qh=new Q().setFromEuler(new E(B.lx,0,B.lz)).multiply(new Q().setFromEuler(new E(-.25+B.le,0,0)));
  return qh.invert().multiply(q)}}
try{if(typeof pl!='undefined'&&pl&&pl.bones&&pl._grip)gripReg(pl)}catch(_){}
