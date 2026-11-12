// ================= v223: the town's working keepers, touched up =================
// Owner (Nov 12 2026): "The blacksmith is holding the hammer from the underside rather than the top - and the bard's strumming
// arm looks like it's coming at it from the wrong angle." · "The beast trainer turns when you're talking to him but he's still
// swinging his equipment into the air."
//
// 1. HOLD (every working keeper, 1900 WK103): while their window is open (the v221 shop view is on them, IM220.on.o, or their
//    window / the forge is open and you stand by them) a keeper eases out of the work loop (TF223.ease per second) into a calm
//    stand facing you: the work pose fades with the v151 "greeted" weight (_wk.ic151H, 3081: no sparks, no swing), the arms go
//    to the relaxed v197 stand (rlx197Of), a slow breath, and the hand tool rests (hammer and ladle hang, the stick is planted,
//    the fork is held upright: TF223.rest). The Bard keeps his lute in his hands and stops strumming. When the window closes
//    he eases back into his work. _wk.h223 is the weight (0 working .. 1 holding still).
// 2. GRIP (all hand tools): the tool used to hang from the wrist joint, so the haft came out from under the paw. Now the haft
//    runs through the middle of the fist (TF223.palm of the forearm's length past the wrist), across the fist, with the
//    head on the thumb side (top / forward) and a little of the haft's end showing below the fist.
// 3. BARD: see bard223 below.
// Co-op: town scenery; every partner sees their own shop views (the keeper turning to you was already local).
var TF223={on:true,hold:true,grip:true,bard:true,ease:3.2,palm:.42,cross:{hammer:72},
  rest:{hammer:[0,-1,.35],ladle:[0,-1,.2],stick:[.12,-1,.4],fork:[0,1,.12],orb:null}};
var TF223_V=null;
function tf223T(){return TF223_V||(TF223_V={a:new THREE.Vector3(),b:new THREE.Vector3(),c:new THREE.Vector3(),d:new THREE.Vector3(),q:new THREE.Quaternion(),q2:new THREE.Quaternion(),e:new THREE.Euler(),DN:new THREE.Vector3(0,-1,0)})}
// is this keeper's window open right now (and you near him)?
function tf223Busy(n){const S=n._wk;if(!S)return false;
  try{if(typeof IM220!='undefined'&&IM220.on&&IM220.on.o===n)return true}catch(_){}
  try{const near=()=>{const p=n.getWorldPosition(tf223T().a);return Math.hypot(p.x-pl.position.x,p.z-pl.position.z)<9};
    const xw=$('xw');if(xw&&!xw.classList.contains('hide')&&(xwMode===S.k||(xwMode=='visitor'&&xwArg===S.k)))return near();
    if(S.k=='smith'&&typeof KQM_SMITH!='undefined'&&KQM_SMITH){const b=$('bag');if(b&&!b.classList.contains('hide'))return near()}}catch(_){}
  return false}
// the hand tool in the fist: hand = wrist + palm along the forearm, the haft along d (keeper frame)
function tf223Place(n,S,d){const tl=S.tool,B=n.bones;if(!tl||!tl.userData.hand||!B.aR2||!B.aR1)return;const T=tf223T();n.updateMatrixWorld(true);
  const w=n.worldToLocal(B.aR2.getWorldPosition(T.a)),e=n.worldToLocal(B.aR1.getWorldPosition(T.b)),f=T.c.subVectors(w,e),fl=f.length()||1;f.multiplyScalar(1/fl);
  tl.position.copy(w).addScaledVector(f,TF223.grip?fl*TF223.palm:0);T.d.copy(d).normalize();tl.quaternion.setFromUnitVectors(T.DN,T.d)}
function tf223Fore(n){const B=n.bones,T=tf223T();n.updateMatrixWorld(true);const w=n.worldToLocal(B.aR2.getWorldPosition(T.a)).clone(),e=n.worldToLocal(B.aR1.getWorldPosition(T.b));return w.sub(e).normalize()}
if(typeof wkAnim103=='function'){const f0=wkAnim103;wkAnim103=function(n,now){const S=n&&n._wk;if(!TF223.on||!S||!n.bones||!WK103[S.k])return f0.apply(this,arguments);
  // the hold weight eases toward 1 while the window is open
  const busy=TF223.hold&&tf223Busy(n),dt=S.n223!=null?Math.max(0,Math.min(.25,(now-S.n223)/1000)):1;S.n223=now;
  const h0=S.h223||0,h=S.h223=busy?Math.min(1,h0+dt*TF223.ease):Math.max(0,h0-dt*TF223.ease);
  if(h>0&&S.f223==null)S.f223=now;if(!h)S.f223=null;
  const g0=S.ic151H;if(h>0)S.ic151H=Math.max(g0||0,h*h*(3-2*h));
  let r;try{r=f0.apply(this,arguments)}finally{S.ic151H=g0}
  if(!n.visible||(n.parent&&!n.parent.visible))return r;
  try{const W0=WK103[S.k],tl=S.tool,s=h*h*(3-2*h);
    // the calm stand: relaxed arms (not the Bard: his hands stay on the lute) and a slow breath
    if(s>0&&S.k!='bard'&&typeof rlx197Of=='function'){const A=rlx197Of(n),B=n.bones,T=tf223T();
      if(A&&A.E)for(const k in A.E){const b=B[k],E=A.E[k];if(!b)continue;T.q.setFromEuler(T.e.set(E[0],E[1],E[2]));b.quaternion.slerp(T.q,s)}
      const t=now/1000+(S.t0||0);if(B.aR1)B.aR1.rotation.x+=s*(-.05-.03*Math.sin(t*.6));if(B.aL1)B.aL1.rotation.x+=s*(-.05-.03*Math.sin(t*.6+1.3))}
    // the hand tool: in the fist (work direction, or along the forearm), easing to its resting direction
    if(tl&&tl.userData.hand&&n.bones.aR2){const T=tf223T(),fw=tf223Fore(n),d=S.td&&s<.5?new THREE.Vector3(S.td[0],S.td[1],S.td[2]).normalize():fw.clone();
      // a hammer's haft crosses the fist: at least TF223.cross degrees from the forearm, in the plane of the pose's direction
      const cr=TF223.grip&&TF223.cross[W0.tool];if(cr){const c=d.dot(fw),mn=Math.cos(cr*Math.PI/180);if(c>mn){const p=d.clone().addScaledVector(fw,-c);if(p.lengthSq()>1e-6){p.normalize();d.copy(p).multiplyScalar(Math.sqrt(1-mn*mn)).addScaledVector(fw,mn)}}}
      const R=TF223.rest[W0.tool];if(R&&s>0){const rd=new THREE.Vector3(R[0],R[1],R[2]).normalize();T.q.setFromUnitVectors(d,rd);T.q2.identity().slerp(T.q,s);d.applyQuaternion(T.q2)}
      tf223Place(n,S,d)}}catch(e){if(!TF223.err){TF223.err=1;console.warn('v223 keepers',e)}}
  return r}}
// ---------------- 3. the Bard's arms ----------------
// bard141 (2995) places the lute and v192 (3550) chose the arms' elbow directions by searching for the one furthest from the
// bowl: the strumming elbow often ended down in front or under the bowl, so the forearm came up at the strings from below.
// Now, after them, both arms are solved again with fixed, natural elbow directions (keeper frame, x out to that arm's side):
//  * strumming arm (the rig's aL, the figure's right): elbow out to the side, up and back (TF223.bPole), so the forearm lies
//    over the bowl's top edge and the paw comes down onto the strings between the sound hole and the neck (TF223.bStrum,
//    lute frame), strumming across the strings (lute x) at the old rate;
//  * neck arm: the paw under the neck, sliding along it a little (TF223.bNeck), elbow down and out (TF223.bNPole).
Object.assign(TF223,{bPole:[1,.8,-.15],bNPole:[1,-1,-.3],bStrum:[.0,.1,.135],bClear:1.04,bSw:.04,bNeck:[0,.42,-.045],bNk:.05});
function bard223(n,now){const S=n._wk,B=n.bones,L=S&&S.tool;if(!L||!B||!B.aL0||!B.aR0||typeof fc116IK!='function')return;const V=THREE.Vector3,t=now/1000+(S.t0||0);
  n.updateMatrixWorld(true);L.updateMatrixWorld(true);const rs=Math.sign(n.worldToLocal(B.aR0.getWorldPosition(new V())).x)||-1,C=TF223;
  const W=p=>L.localToWorld(new V(p[0],p[1],p[2])),s=Math.sin(t*9.5),f=Math.sin(t*2.1);
  const TS=W([C.bStrum[0]+C.bSw*s,C.bStrum[1],C.bStrum[2]]),TN=W([C.bNeck[0],C.bNeck[1]+C.bNk*f,C.bNeck[2]]);
  const pole=(p,sx)=>new V(sx*p[0],p[1],p[2]).normalize().transformDirection(n.matrixWorld);
  fc116IK(B.aL0.getWorldPosition(new V()),B.aL0,B.aL1,B.aL2,TS,pole(C.bPole,-rs),1);
  // the forearm rests on the bowl's rim, never through it, and the paw stays in front of the soundboard: while any part of
  // the arm or paw is inside the bowl (bard192Out, 3550: < 1 inside), the strum point moves out from the soundboard
  const bowl=L.children[0];if(bowl&&typeof bard192Out=='function'){if(!BARD192_T)BARD192_T={mi:new THREE.Matrix4(),a:new V(),e:new V(),w:new V(),t:new V(),l:new V(),p:new V()};
    for(let i=0,dz=0;i<12;i++){bowl.updateMatrixWorld(true);if(bard192Out(L,bowl,B.aL0,B.aL1,B.aL2)>=C.bClear)break;dz+=.018;
      fc116IK(B.aL0.getWorldPosition(new V()),B.aL0,B.aL1,B.aL2,W([C.bStrum[0]+C.bSw*s,C.bStrum[1],C.bStrum[2]+dz]),pole(C.bPole,-rs),1)}}
  fc116IK(B.aR0.getWorldPosition(new V()),B.aR0,B.aR1,B.aR2,TN,pole(C.bNPole,rs),1)}
// the Bard: while he holds still his strum stops (bard141 reads the time; it is held where it was); then the v223 arms
if(typeof bard141=='function'){const f0=bard141;bard141=function(n,now){const S=n&&n._wk;if(TF223.on&&S&&S.h223>0&&S.f223!=null)now=S.f223;const r=f0.call(this,n,now);
  if(TF223.on&&TF223.bard)try{bard223(n,now)}catch(e){if(!TF223.berr){TF223.berr=1;console.warn('v223 bard',e)}}return r}}
