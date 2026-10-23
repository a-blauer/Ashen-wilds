// ================= v135: bow — one string, a smaller bow, carried inside the bow arm =================
// 1. The bow model's own string is now a mesh of its own (material 's' in 0780). While a shot shows the drawn string
//    (bowFxSet for the hero, eBowFxSet for archer foes) the model's straight string hides, so there are never two strings.
// 2. The bow is BOW_K (0780) of its old size, scaled about the riser, so the grip, shots and drawn string still line up
//    (the drawn string reads its tips from BOW_T).
function bow135Str(W,show){if(!W)return;const S=W.userData.bow135s||(W.userData.bow135s=(()=>{const L=[],M=lgMats().s;W.traverse(o=>{if(o.isMesh&&o.material===M)L.push(o)});return L})());
  for(const o of S)o.visible=show}
{const f=bowFxSet;bowFxSet=function(k,g){const r=f.apply(this,arguments);try{const W=(pl.gearG||[]).find(o=>o.userData&&o.userData.wt=='bow'&&o.parent);
  bow135Str(W,!(BOW_FX&&BOW_FX.g.visible))}catch(_){}return r}}
{const f=eBowFxSet;eBowFxSet=function(g,k,gr){const r=f.apply(this,arguments);try{bow135Str(g.bowW,!(g.bowFx&&g.bowFx.g.visible))}catch(_){}return r}}
// 3. Carry (owner's reference pictures): the bow lies across the front of the hips, held low at the riser in the bow hand, its limbs
//    pointing left-right (one across the body, one out past the hand), the string toward the body and up. Each frame, after every
//    animation layer, the bow is turned to a fixed direction in the hero's own frame (so it stays level while the arm swings in a
//    run) and moved so the riser stays in the hand; it blends out with the grip's carry weight during shots.
//    x135: a = how far the string side tilts up, b = the far limb turned forward, r = the far limb tipped up.
V100A_BOW.x135={a:.62,b:.6,r:0};Object.assign(V100A_BOW,{lx:-.1,lz:.3,le:-.1,sw:.85,an:[0,-.04,.02]});
function bow135Q(){const X=V100A_BOW.x135,V3=THREE.Vector3;
  // model axes: +x riser→string, +y upper limb. Hero frame: +x is across the body from the bow hand (the bow arm is on -x), +z forward
  const Y=new V3(Math.cos(X.b),Math.sin(X.r),Math.sin(X.b)).normalize(),Xs=new V3(0,Math.sin(X.a),-Math.cos(X.a));Xs.addScaledVector(Y,-Xs.dot(Y)).normalize();
  const Z=new V3().crossVectors(Xs,Y);return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xs,Y,Z))}
{const f=V100A_bowQ;V100A_bowQ=function(){const B=V100A_BOW;if(!B.x135)return f.apply(this,arguments);const Q=THREE.Quaternion,E=THREE.Euler;
  // the starting carry (refined every frame by bow135Carry): undo the nominal hand orientation of the relaxed carry arm
  const qh=new Q().setFromEuler(new E(B.lx,0,B.lz)).multiply(new Q().setFromEuler(new E(-.25+B.le,0,0)));return qh.invert().multiply(bow135Q())}}
var BOW135_T={q:null,a:null,b:null,v:null};
function bow135Carry(h){const S=h&&h._grip;if(!S||!S.L||!V100A_BOW.x135)return;let e=null;for(const q of S.L)if(q.ty=='bow'&&q.W&&q.W.parent){e=q;break}if(!e)return;
  const w=gripSS(S.w==null?1:S.w);if(w<=1e-3)return;const T=BOW135_T,Q=THREE.Quaternion;if(!T.q){T.q=new Q();T.a=new Q();T.b=new Q();T.v=new THREE.Vector3()}
  const W=e.W,P=W.parent;P.updateWorldMatrix(true,false);h.getWorldQuaternion(T.a);P.getWorldQuaternion(T.b);
  T.q.copy(T.b.invert()).multiply(T.a).multiply(bow135Q());W.quaternion.slerp(T.q,w);
  const C=e.C,an=C.an||GRIP_AN,hd=T.v.set(C.hold[0]*W.scale.x,C.hold[1]*W.scale.y,C.hold[2]*W.scale.z).applyQuaternion(W.quaternion);
  W.position.lerp(hd.set(an[0]-hd.x,an[1]-hd.y,an[2]-hd.z),w)}
{const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);try{h=h||pl;if(h&&h.bones&&!(h===pl&&typeof riding!='undefined'&&riding))bow135Carry(h)}catch(e){}return r}}
try{if(typeof pl!='undefined'&&pl&&pl.bones&&pl._grip)gripReg(pl)}catch(_){}
