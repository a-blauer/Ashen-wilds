// ================= v181: foe attacks — every humanoid foe's blows solved on its own skeleton =================
// Owner: "does the weapon actually swing during the attack and does the attack look natural and fluid? … This is a big
// problem if it's not right." The foes played the hero's baked swing tracks (joint angles made for the hero's body and its
// one-handed grip), so on other proportions, stoops, two-handed weapons and polearms the blow did not land on the target:
// the orc's axe ended raised out to the side, the gharial's halberd barely moved, the off hand flailed by the head.
//
// Now each attack is described by WHERE THINGS GO, and solved every frame on the foe's own skeleton:
//   * the weapon hand's path (relative to the shoulders, in arm lengths, in the body's frame: +x toward the weapon arm,
//     +y up, +z toward the target), the elbow's direction, the weapon's direction (the blade or head lags behind the hand in
//     the wind-up and whips through at the hit) and which way its edge faces (the edge leads);
//   * the body: hips turning before the shoulders, chest twist, lean into the blow, side bend, pelvis drop and weight shift
//     (the legs are solved so the feet stay exactly where they stood);
//   * the off hand: on the haft of a two-hander, polearm or casting staff, a counterbalance for one-handers, the shield up.
// Two-bone IK puts the arm there (elbow toward its pole, a real hinge), and the hand turns so the weapon — which never moves
// inside the fist (the carry grip) — points where the description says, within what a wrist can do.
// Timeline (gameplay unchanged): s = 0→1 wind-up, 1→2 act, 2→3 recovery. Melee contact at s = 1.45 (the game's act k .45);
// projectiles leave at s = 1 (the act's start); slams and rainfire land at s = 2 (the act's end). Keys are played with a
// monotone cubic per channel: anticipation (coil, then a held, creeping coil), a fast whip into the hit, follow-through past
// it, a settle with a little overshoot. Heavier foes heave into the coil later and settle slower; daggers and ghouls snap.
// Blend: from the pose the earlier layers made (walk/idle, stance) into this one over the start of the wind-up and back over
// the end of the recovery; a cancelled attack (stun, death) fades out over 0.15 s. The body group's whole-body tilt and
// lunge (mTick's m.pose) is left out for the moves driven here: the lean comes from the hips and spine, feet planted.
// Regular humanoid foes only (FA_K); Sovereigns, the abeksi actors and every other model are untouched.
var FA={on:true};
// hum key -> c: class, hv: heaviness 0 (quick) … 1 (slow and heavy), sh: carries a shield, arm: unarmed style
var FA_K={
  brigand:{c:'one',hv:.3},orc:{c:'one',hv:.55},troll:{c:'one',hv:.85},hob:{c:'one',hv:.35},skel:{c:'one',hv:.2,sh:1},nagaw:{c:'one',hv:.4,sh:1}
};
// the moves this file animates (others keep the older poses); the real move name is read from the enemy (signature moves
// reuse these animation names with other timings)
var FA_MOVES={strike:1,slam:1,bolt:1,rainfire:1,throw:1};
// ---------------- tracks: keys -> channels -> monotone cubic ----------------
// key fields: s; H hand [x,y,z] (arm lengths from the shoulder line: hs=1 at the weapon shoulder, 0 at the midline);
// D weapon direction; E edge facing; P elbow pole; O off hand (from the off shoulder), OP its elbow pole; ow off-hand weight;
// ot haft point (weapon units along the handle) for two-handed grips; rw / orw wrist flex (unarmed); body: py hip yaw,
// sy spine yaw, cy chest yaw (+ = toward the weapon side), sx lean forward, sz side bend (+ = toward the weapon side), hx head
// pitch, dy pelvis drop and fz / fx weight shift forward / sideways (leg lengths).
var FA_CH={H:3,D:3,E:3,P:3,O:3,OP:3,hs:1,os:1,ow:1,ot:1,rw:1,orw:1,py:1,sy:1,cy:1,sx:1,sz:1,hx:1,dy:1,fz:1,fx:1,ad:1};
var FA_DEF={H:[0,-.9,.2],D:[0,.8,.6],E:[0,0,1],P:[.4,-.9,-.3],O:[-.05,-.9,.12],OP:[-.4,-.9,-.3],hs:1,os:1,ow:1,ot:0,rw:0,orw:0,py:0,sy:0,cy:0,sx:0,sz:0,hx:0,dy:0,fz:0,fx:0,ad:0};
function faTrack(keys,o){
  o=o||{};const K=[],cur=Object.assign({},FA_DEF,o.def||{});
  keys.forEach(k=>{for(const c in k)if(c!='s')cur[c]=k[c];const q={s:k.s};for(const c in FA_CH)q[c]=Array.isArray(cur[c])?cur[c].slice():cur[c];K.push(q)});
  const T=K.map(k=>k.s),C=[];
  for(const c in FA_CH){const n=FA_CH[c];for(let j=0;j<n;j++){const Y=K.map(k=>n>1?k[c][j]:k[c]);C.push({c,j,n,Y,M:V100A_mono(T,Y)})}}
  const out={};for(const c in FA_CH)out[c]=FA_CH[c]>1?[0,0,0]:0;
  const f=function(s){const n=T.length;let x=Math.max(T[0],Math.min(T[n-1],s)),i=0;while(i<n-2&&x>T[i+1])i++;
    const h=(T[i+1]-T[i])||1e-6,t=(x-T[i])/h,t2=t*t,t3=t2*t,a=2*t3-3*t2+1,b=(t3-2*t2+t)*h,c2=-2*t3+3*t2,d=(t3-t2)*h;
    for(let m=0;m<C.length;m++){const q=C[m],v=a*q.Y[i]+b*q.M[i]+c2*q.Y[i+1]+d*q.M[i+1];if(q.n>1)out[q.c][q.j]=v;else out[q.c]=v}
    return out};
  f.keys=K;f.o=o;return f}
// ---------------- the attacks ----------------
var FA_A={};
function faBuild(){
  const R0={s:0,H:[0,-.85,.25],D:[0,.8,.6],E:[0,0,1],P:[.4,-.9,-.3],O:[-.05,-.9,.12],OP:[-.4,-.9,-.3],py:0,sy:0,cy:0,sx:0,sz:0,dy:0,fz:0,fx:0,ad:0};
  const RE=Object.assign({},R0,{s:3});
  // ---- one-handed (axe, club, sword): A forehand diagonal (high on the weapon side → low past the off hip), B overhead chop
  FA_A.oneA=faTrack([R0,
    {s:.55,H:[.25,.35,-.3],D:[.35,.25,-.9],E:[.1,1,0],P:[1,-.2,-.4],py:.35,sy:.2,cy:.1,sx:-.04,sz:-.06,dy:-.02,fz:-.05,O:[.15,-.3,.6],OP:[-.7,-.6,-.2]},
    {s:1,H:[.3,.42,-.36],D:[.35,.35,-.87],py:.42,sy:.25,cy:.12,sx:-.06,sz:-.08,dy:-.03,fz:-.07,O:[.18,-.28,.62]},
    {s:1.22,H:[.2,.38,.15],D:[.2,.95,.1],E:[-.2,.1,1],P:[1,-.3,-.2],py:.15,sy:.05,cy:0,sx:.05,sz:0,dy:-.04,fz:0,O:[.05,-.5,.3]},
    {s:1.34,H:[0,.2,.55],D:[-.1,.45,1],E:[-.4,-.5,.8]},
    {s:1.45,H:[-.3,-.12,.8],D:[-.45,-.4,1],E:[-.5,-.85,.1],P:[.8,-.6,0],py:-.25,sy:-.2,cy:-.1,sx:.25,sz:.06,dy:-.07,fz:.1,O:[-.1,-.7,-.15],OP:[-.6,-.6,-.6],ad:1},
    {s:1.75,H:[-.55,-.55,.55],D:[-.75,-.6,.2],E:[-.2,-.3,-1],P:[.6,-.8,.1],py:-.4,sy:-.25,cy:-.12,sx:.3,sz:.08,dy:-.09,fz:.12,ad:0},
    {s:2,H:[-.5,-.62,.45],D:[-.6,-.8,0],py:-.38,sy:-.22,cy:-.1,sx:.28,dy:-.09,fz:.11},
    {s:2.4,H:[-.12,-.55,.45],D:[-.05,.6,.8],E:[0,1,0],P:[.5,-.9,-.2],py:-.1,sy:-.05,cy:0,sx:.1,sz:0,dy:-.03,fz:.03,O:[-.05,-.85,.1],OP:[-.4,-.9,-.3]},
    RE]);
  FA_A.oneB=faTrack([R0,
    {s:.55,H:[0,.62,-.12],D:[.15,.45,-.9],E:[0,1,0],P:[.9,.5,-.4],py:.18,sy:.1,sx:-.1,sz:-.03,dy:-.01,fz:-.05,O:[.15,-.25,.6],OP:[-.7,-.6,-.2]},
    {s:1,H:[-.02,.7,-.15],D:[.15,.5,-.88],py:.2,sy:.12,sx:-.13,sz:-.04,dy:-.02,fz:-.06,O:[.18,-.22,.62]},
    {s:1.22,H:[-.05,.62,.3],D:[0,1,.25],E:[0,.1,1],P:[.9,.3,-.2],py:.05,sy:.02,sx:0,sz:0,dy:-.04,fz:0,O:[.05,-.5,.3]},
    {s:1.34,H:[-.15,.3,.65],D:[-.05,.35,1],E:[0,-.5,.5]},
    {s:1.45,H:[-.22,-.15,.78],D:[-.15,-.5,1],E:[0,-1,0],P:[.7,-.6,0],py:-.12,sy:-.08,sx:.32,dy:-.08,fz:.1,O:[-.1,-.7,-.15],OP:[-.6,-.6,-.6],ad:1},
    {s:1.75,H:[-.28,-.6,.55],D:[-.1,-.95,.35],E:[0,-.4,-1],sx:.36,dy:-.1,fz:.12,ad:0},
    {s:2,H:[-.28,-.62,.5],D:[-.1,-.95,.3],sx:.34,dy:-.1,fz:.11},
    {s:2.4,H:[-.12,-.55,.45],D:[0,.6,.8],E:[0,1,0],P:[.5,-.9,-.2],py:-.05,sy:-.03,sx:.1,dy:-.03,fz:.03,O:[-.05,-.85,.1],OP:[-.4,-.9,-.3]},
    RE]);
}
// which track plays: class, move, the foe's attack count (repeats alternate)
function faPick(S,n){
  const c=S.K.c;
  if(c=='one'){if(n=='strike')return S.n%2?FA_A.oneB:FA_A.oneA}
  return null}
// ---------------- helpers ----------------
var FA_v=[],FA_q=[];for(let i=0;i<24;i++){FA_v.push(new THREE.Vector3());FA_q.push(new THREE.Quaternion())}
var FA_M1=new THREE.Matrix4(),FA_M2=new THREE.Matrix4(),FA_SC=new THREE.Vector3(),FA_X=new THREE.Vector3(1,0,0),FA_NY=new THREE.Vector3(0,-1,0);
const faSS=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
function faWP(o,v){return v.setFromMatrixPosition(o.matrixWorld)}
function faWQ(o,q){o.matrixWorld.decompose(FA_SC,q,FA_SC);return q}
// set a bone's local rotation so its world rotation is Qw (parent's matrixWorld must be current); updates its subtree
function faSetW(bn,Qw){const pq=faWQ(bn.parent,FA_q[20]);bn.quaternion.copy(pq.invert().multiply(Qw));bn.updateMatrixWorld(true)}
// rotation taking local frame (ya, za) to world frame (yw, zw)
function faFrameQ(ya,za,yw,zw,q){const xa=FA_v[16].crossVectors(ya,za).normalize(),za2=FA_v[17].crossVectors(xa,ya),xw=FA_v[18].crossVectors(yw,zw).normalize(),zw2=FA_v[19].crossVectors(xw,yw);
  FA_M1.makeBasis(xw,yw,zw2);FA_M2.makeBasis(xa,ya,za2).transpose();FA_M1.multiply(FA_M2);return q.setFromRotationMatrix(FA_M1)}
// two-bone IK: b2's origin to world point T, the middle joint toward world direction pole; bz = +1 (arm: the forearm folds
// toward the upper arm's local +z) or −1 (leg: the shin folds toward −z). Sets b0 and b1 (local), matrices updated.
function faIK(b0,b1,b2,T,pole,bz){
  const S=faWP(b0,FA_v[0]),E=faWP(b1,FA_v[1]),W=faWP(b2,FA_v[2]),l1=S.distanceTo(E),l2=E.distanceTo(W);
  const n=FA_v[3].subVectors(T,S);let d=n.length();if(d<1e-6||l1<1e-6||l2<1e-6)return;n.multiplyScalar(1/d);
  d=Math.max(Math.abs(l1-l2)+1e-3,Math.min((l1+l2)*.9995,d));
  const a=(l1*l1-l2*l2+d*d)/(2*d),hh=Math.sqrt(Math.max(0,l1*l1-a*a));
  const pp=FA_v[4].copy(pole).addScaledVector(n,-pole.dot(n));if(pp.lengthSq()<1e-9){pp.set(0,0,1).addScaledVector(n,-n.z);if(pp.lengthSq()<1e-9)pp.set(1,0,0)}pp.normalize();
  const Eg=FA_v[5].copy(S).addScaledVector(n,a).addScaledVector(pp,hh),U=FA_v[6].subVectors(Eg,S).normalize(),Tg=FA_v[7].copy(S).addScaledVector(n,d),F=FA_v[8].subVectors(Tg,Eg).normalize();
  const bd=FA_v[9].copy(F).addScaledVector(U,-F.dot(U));if(bd.lengthSq()<1e-6)bd.copy(pp);bd.normalize();
  const u1=FA_v[10].copy(b1.position).normalize(),za=FA_v[11].set(0,0,bz).addScaledVector(u1,-u1.z*bz).normalize();
  faSetW(b0,faFrameQ(u1,za,U,bd,FA_q[0]));
  // the lower bone: its child's rest direction onto the forearm / shin direction
  const q0=faWQ(b0,FA_q[1]).invert(),Fl=FA_v[12].copy(F).applyQuaternion(q0),u2=FA_v[13].copy(b2.position).normalize();
  b1.quaternion.setFromUnitVectors(u2,Fl);b1.updateMatrixWorld(true)}
// limit a local rotation: twist about axis (unit) to mt, the rest (swing) to ms
function faClamp(q,ax,ms,mt){const d=q.x*ax.x+q.y*ax.y+q.z*ax.z,tw=FA_q[21].set(ax.x*d,ax.y*d,ax.z*d,q.w);if(tw.lengthSq()<1e-9)tw.identity();else tw.normalize();
  const sw=FA_q[22].copy(q).multiply(FA_q[23].copy(tw).invert());
  const lim=(r,m)=>{if(r.w<0){r.x=-r.x;r.y=-r.y;r.z=-r.z;r.w=-r.w}const an=2*Math.acos(Math.min(1,r.w));if(an>m)r.copy(FA_q[23].identity().slerp(r,m/an))};
  lim(sw,ms);lim(tw,mt);return q.copy(sw).multiply(tw)}
// the weapon a hand holds (grip registry entry)
function faWpn(h,side){const S=h._grip;if(!S||!S.L)return null;for(const e of S.L)if(e.side==side&&e.W&&e.W.parent)return e;return null}
// ---------------- per foe state ----------------
var FA_BN=['pelvis','spine','chest','neck','head','aR0','aR1','aR2','aL0','aL1','aL2','lh0','lh1','lh2','rh0','rh1','rh2'];
function faState(g){
  if(g._fa!==undefined)return g._fa;g._fa=null;
  const h=g.h,b=h&&h.bones,key=g.hk179,K=key&&FA_K[key];
  if(!K||!b||!b.aR0||!b.aL0||!b.spine||g._bo)return null;
  if(!FA_A.oneA)faBuild();
  const S={K,key,n:0,ph:-1,base:{},last:null,fo:0,dirty:0,legs:!!(b.lh0&&b.lh1&&b.lh2&&b.rh0&&b.rh1&&b.rh2&&!h.nt)};
  FA_BN.forEach(n=>{if(b[n])S.base[n]=new THREE.Quaternion()});S.py0=0;
  return g._fa=S}
// (the Euler values are kept exactly: the idle layer recognises its own last write by exact value, and a quaternion round
// trip would make it add its fidget again every frame)
function faSnap(S,b){if(!S.be)S.be={};for(const n in S.base){const r=b[n].rotation;S.base[n].copy(b[n].quaternion);(S.be[n]||(S.be[n]=[0,0,0])).splice(0,3,r.x,r.y,r.z)}S.pp=(S.pp||new THREE.Vector3()).copy(b.pelvis.position)}
function faRestore(S,b){for(const n in S.base){const e=S.be[n];b[n].rotation.set(e[0],e[1],e[2])}b.pelvis.position.copy(S.pp)}
// the move a foe is really doing (signature moves borrow these animation names with other timings)
function faMove(g,a){const e=g._ie,n=e&&e.atk&&e.atk.n;return n||a.n}
function faDrives(g,S,a){if(!FA.on||!a)return false;const n=faMove(g,a);if(!FA_MOVES[n]||a.n!==n)return false;return !!faPick(S,n)}
// ---------------- the solve ----------------
function faApply(g,S,a,now){
  const h=g.h,b=h.bones,T=S.T,s=a.ph==0?S.sw(a.k):a.ph==1?1+a.k:2+S.sr(1-a.k),P=T(s);
  // blend in over the start of the wind-up, out over the end of the recovery
  const w=faSS(s/.35)*faSS((3-s)/.45);if(w<=1e-4)return;
  const side=S.side,mesh=b.pelvis.parent;
  g.updateMatrixWorld(true);
  const mq=faWQ(mesh,FA_q[2]).clone(),toW=(arr,v)=>v.set(arr[0]*side,arr[1],arr[2]).applyQuaternion(mq);
  // feet where the earlier layers put them
  let fL,fR,qL,qR;if(S.legs){fL=faWP(b.lh2,new THREE.Vector3());fR=faWP(b.rh2,new THREE.Vector3());qL=faWQ(b.lh2,new THREE.Quaternion());qR=faWQ(b.rh2,new THREE.Quaternion())}
  // ---- body ----
  const am=S.am;
  b.pelvis.rotation.y+=P.py*side*w*am;b.spine.rotation.y+=P.sy*side*w*am;if(b.chest)b.chest.rotation.y+=P.cy*side*w*am;
  b.spine.rotation.x+=P.sx*w*am;b.spine.rotation.z-=P.sz*side*w*am;
  if(b.head){b.head.rotation.y-=(P.py+P.sy+P.cy)*side*w*am*.7;b.head.rotation.x+=(-P.sx*.6+P.hx)*w*am}
  if(S.legs){const LL=S.LL;b.pelvis.position.y+=P.dy*LL*w*am;b.pelvis.position.z+=P.fz*LL*w*am;b.pelvis.position.x+=P.fx*side*LL*w*am}
  b.pelvis.updateMatrixWorld(true);
  if(S.legs){const pole=toW([0,0,1],FA_v[14]).clone();
    [[b.lh0,b.lh1,b.lh2,fL,qL,-1],[b.rh0,b.rh1,b.rh2,fR,qR,1]].forEach(([b0,b1,b2,f,q,sd])=>{
      const pl=pole.clone().add(toW([.15*sd*side,0,0],FA_v[15]));faIK(b0,b1,b2,f,pl,-1);faSetW(b2,q)})}
  // ---- arms ----
  const m0=S.mA[0],m1=S.mA[1],m2=S.mA[2],o0=S.oA[0],o1=S.oA[1],o2=S.oA[2];
  const sm=faWP(m0,FA_v[20]).clone(),so=faWP(o0,FA_v[21]).clone(),mid=sm.clone().add(so).multiplyScalar(.5),hw=sm.distanceTo(so)/2,A=S.U;
  const sideW=toW([1,0,0],new THREE.Vector3());
  // hand target, with the hit raised or lowered toward the target's chest (ad = how much this key aims)
  // (at the hit the hand goes to where the weapon's head lands on the target's chest: hand a little above, head angled down)
  const H=P.H.slice();if(P.ad){const want=(S.tgY+.3*S.wl-mid.y)/A;H[1]+=P.ad*Math.max(-.45,Math.min(.4,want-H[1]))}
  const tgt=mid.clone().addScaledVector(sideW,P.hs*hw).add(toW(H,new THREE.Vector3()).multiplyScalar(A));
  const pole=toW(P.P,new THREE.Vector3()).normalize();
  faIK(m0,m1,m2,tgt,pole,1);
  // hand: aim the weapon (head along D, edge toward E), or a natural wrist with flex rw
  const q1=faWQ(m1,FA_q[3]).clone(),u2=m2.position.clone().normalize();
  let Qh=q1.clone();
  const we=S.we;
  if(we){const Wq=we.W.quaternion,headH=FA_NY.clone().applyQuaternion(Wq),Dw=toW(P.D,new THREE.Vector3()).normalize();
    if(P.ad){const hp=faWP(m2,FA_v[22]),y=Math.max(-.85,Math.min(.35,(S.tgY-hp.y)/(S.wl||1))),y2=Dw.y+(y-Dw.y)*P.ad,hl=Math.hypot(Dw.x,Dw.z)||1,k=Math.sqrt(1-y2*y2)/hl;Dw.set(Dw.x*k,y2,Dw.z*k)}
    const h0=headH.clone().applyQuaternion(Qh);Qh=new THREE.Quaternion().setFromUnitVectors(h0,Dw).multiply(Qh);
    if(we.edge){const Ew=toW(P.E,new THREE.Vector3());Ew.addScaledVector(Dw,-Ew.dot(Dw));
      if(Ew.lengthSq()>1e-6){Ew.normalize();const e0=FA_X.clone().applyQuaternion(Wq).applyQuaternion(Qh);e0.addScaledVector(Dw,-e0.dot(Dw)).normalize();
        let an=Math.atan2(new THREE.Vector3().crossVectors(e0,Ew).dot(Dw),e0.dot(Ew));if(we.edge==2){if(an>Math.PI/2)an-=Math.PI;else if(an<-Math.PI/2)an+=Math.PI}
        Qh=new THREE.Quaternion().setFromAxisAngle(Dw,an).multiply(Qh)}}}
  else if(P.rw){const ax=new THREE.Vector3(1,0,0).applyQuaternion(q1);Qh=new THREE.Quaternion().setFromAxisAngle(ax,P.rw).multiply(Qh)}
  const lq=q1.clone().invert().multiply(Qh);faClamp(lq,u2,1.25,1.5);m2.quaternion.copy(lq);m2.updateMatrixWorld(true);
  // ---- off hand ----
  if(P.ow>1e-3){let ot=null;
    if(S.haft&&we){
      // on the haft: the off fist round the handle at weapon point ot, turned as if it carried the weapon itself
      const Ww=faWQ(we.W,new THREE.Quaternion()),qh=Ww.clone().multiply(S.oC.clone().invert()),pw=we.W.localToWorld(new THREE.Vector3(0,P.ot,0));
      const an=S.oAn.clone().multiplyScalar(o2.matrixWorld.getMaxScaleOnAxis()).applyQuaternion(qh);ot=pw.sub(an);
      faIK(o0,o1,o2,ot,toW(P.OP,new THREE.Vector3()).normalize(),1);
      const lq2=faWQ(o1,new THREE.Quaternion()).invert().multiply(qh);faClamp(lq2,o2.position.clone().normalize(),1.3,1.6);o2.quaternion.copy(lq2);o2.updateMatrixWorld(true)}
    else if(S.shN){
      // the shield held up in front of the chest, face toward the target, pushed out a little at the hit
      const push=.12*Math.exp(-Math.pow((s-1.45)/.22,2));ot=mid.clone().addScaledVector(sideW,-hw).add(toW([.2,-.38+push*.3,.45+push],new THREE.Vector3()).multiplyScalar(A));
      faIK(o0,o1,o2,ot,toW([-.8,-.6,-.15],new THREE.Vector3()).normalize(),1);
      const q1o=faWQ(o1,new THREE.Quaternion()),nc=S.shN.clone().applyQuaternion(q1o),nd=toW([-.25,.1,1],new THREE.Vector3()).normalize();
      const qh=new THREE.Quaternion().setFromUnitVectors(nc,nd).multiply(q1o),lq2=q1o.invert().multiply(qh);faClamp(lq2,o2.position.clone().normalize(),1.3,1.6);o2.quaternion.copy(lq2);o2.updateMatrixWorld(true)}
    else{ot=mid.clone().addScaledVector(sideW,-P.os*hw).add(toW(P.O,new THREE.Vector3()).multiplyScalar(A));
      faIK(o0,o1,o2,ot,toW(P.OP,new THREE.Vector3()).normalize(),1);
      if(P.orw){o2.quaternion.copy(S.base[o2.name]);o2.rotateX(P.orw)}o2.updateMatrixWorld(true)}}
  // ---- blend every touched bone from the earlier layers' pose by w (the off arm by w·ow) ----
  const ow=w*Math.min(1,P.ow);
  for(const n in S.base){const bn=b[n];if(!bn)continue;let k=w;if(bn===o0||bn===o1||bn===o2)k=ow;
    if(n=='pelvis'||n=='spine'||n=='chest'||n=='head')continue;   // already scaled by w
    if(S.legs&&/^(lh|rh)/.test(n))k=Math.min(1,w*3);   // solved from the weighted pelvis: planted for most of the blend
    if(k<1)bn.quaternion.copy(S.base[n].clone().slerp(bn.quaternion,k))}
  S.dirty=1}
// remember the final pose (for a fade-out when an attack is cut short)
function faKeep(S,b){if(!S.last)S.last={};for(const n in S.base){(S.last[n]||(S.last[n]=new THREE.Quaternion())).copy(b[n].quaternion)}S.lp=(S.lp||new THREE.Vector3()).copy(b.pelvis.position)}
function faFade(S,b,dt){S.fo=Math.max(0,S.fo-dt/.15);const k=faSS(S.fo);for(const n in S.last)b[n].quaternion.slerp(S.last[n],k);b.pelvis.position.lerp(S.lp,k);S.dirty=1}
// set up a new attack: track, side, sizes
function faBegin(g,S,a){
  const h=g.h,b=h.bones,n=faMove(g,a);S.n++;S.T=faPick(S,n);S.mv=n;S.side=1;
  const R=['aR0','aR1','aR2'].map(x=>b[x]),L=['aL0','aL1','aL2'].map(x=>b[x]);S.mA=S.side>0?R:L;S.oA=S.side>0?L:R;
  g.updateMatrixWorld(true);
  const p=k=>faWP(k,new THREE.Vector3());S.A=p(S.mA[0]).distanceTo(p(S.mA[1]))+p(S.mA[1]).distanceTo(p(S.mA[2]));
  // the size the swing is drawn at: the arm's length, but no more than 1.6 torsos (a troll's or amalgam's very long arms
  // would otherwise sweep huge arcs)
  S.U=Math.min(S.A,1.6*Math.max(.05,p(S.mA[0]).y-p(b.pelvis).y));
  S.LL=S.legs?b.lh1.position.length()+b.lh2.position.length():0;
  // the target's chest height (the hero stands ~1.8 tall), in world units above the foe's feet
  const g0=g.getWorldPosition(new THREE.Vector3());S.tgY=g0.y+1.15;
  S.we=faWpn(h,S.side>0?'R':'L');S.wl=1;
  if(S.we){const W=S.we.W;if(W.userData.faLen==null){const bb=new THREE.Box3();W.traverse(o=>{if(o.isMesh&&o.geometry){o.geometry.computeBoundingBox();bb.union(o.geometry.boundingBox)}});W.userData.faLen=Math.max(.2,-bb.min.y);W.userData.faTail=Math.max(0,bb.max.y)}
    S.wl=W.userData.faLen*W.matrixWorld.getMaxScaleOnAxis()}
  const K=S.K,hv=K.hv||0;S.am=1;S.haft=0;S.shN=null;
  // a shield on the off arm: which way its face points in the hand's frame (it faces out from the body when carried)
  const se=faWpn(h,S.side>0?'L':'R');if(K.sh&&se&&se.ty=='shield'){const qb=faWQ(S.oA[2],new THREE.Quaternion()).invert(),mq=faWQ(b.pelvis.parent,new THREE.Quaternion());
    S.shN=new THREE.Vector3(-S.side,0,0).applyQuaternion(mq).applyQuaternion(qb).normalize()}
  // wind-up time warp: heavy foes heave into the coil later, quick ones snap into it and hold; recovery: heavy settle slower
  const pw=1+hv*.6,pq=1.25-hv*.35;S.sw=k=>k<=0?0:k>=1?1:hv>.5?Math.pow(k,pw):1-Math.pow(1-k,pq);S.sr=x=>x<=0?0:x>=1?1:1-Math.pow(1-x,1.15+hv*.5);
  S.ph=a.ph}
// ---------------- hooks ----------------
{const f=humAnim;humAnim=function(g,now,mv){
  let S=null;try{S=g&&g.h&&faState(g)}catch(e){S=null}
  if(!S)return f.apply(this,arguments);
  const b=g.h.bones,a=g.ak;
  try{if(S.dirty){faRestore(S,b);S.dirty=0}}catch(e){}
  let drive=false;try{drive=faDrives(g,S,a)}catch(e){drive=false}
  // the earlier layers make the plain walk/idle/stance pose (no attack): this file adds the attack on top
  if(drive)g.ak=null;
  let r;try{r=f.apply(this,arguments)}finally{if(drive){g.ak=a;g.h.sw=true}}
  try{const dt=S.t0==null?0:Math.min(.1,Math.max(0,(now-S.t0)/1000));S.t0=now;
    faSnap(S,b);
    if(drive){if(S.ph<0||(a.ph==0&&S.ph!=0))faBegin(g,S,a);S.ph=a.ph;faApply(g,S,a,now);faKeep(S,b);S.fo=1}
    else{S.ph=-1;if(S.fo>0&&S.last)faFade(S,b,dt)}}
  catch(e){if(!FA.err){FA.err=1;console.warn('foe attack',e)}}
  return r}}
// mTick tilts and lunges the whole body group (m.pose); for the attacks driven here the body does that itself, feet planted
{const f=animC;animC=function(g,now,mv,sp){const r=f.apply(this,arguments);
  try{const S=g&&g._fa;if(S&&S.ph>=0&&g.b&&g.ak){const x=g.flT?(now-g.flT)/260:2,fl=x>=0&&x<1?Math.pow(1-x,2):0;g.b.rotation.x=-.45*fl;g.b.position.z=-.18*fl}}catch(e){}
  return r}}
