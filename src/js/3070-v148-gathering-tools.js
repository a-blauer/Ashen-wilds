// ================= v148: the hatchet and the pickaxe swing the right way =================
// v141 hung both tools in the hand through the weapon grip layer (axes / hammer), so their heads lay wherever that grip put
// them: the pick's head ran across the swing (sideways, like a T seen from the front) and the hatchet poked upward with one
// hand. Now, after every animation layer, the tool is aimed in the world from the motion's own progress (like the v141 spade):
//  - the handle direction (hand → head) follows key directions in the hero's frame (forward, the tool hand's side, up);
//  - the pick's head lies in the swing plane (points forward and back); the hatchet's edge leads the head's motion, so it
//    bites into the trunk on the downward diagonal swing;
//  - the other hand takes the handle a little further down (two-bone IK), so both tools are swung with two hands.
// The arm tracks (SK141_T.chop / mine) still move the tool hand; the off hand's bones are put back before the next frame's
// animation runs, so nothing drifts.
var SK148={
  // key: [progress, forward, hand side, up] for the hand → head direction
  chop:[[0,.45,.2,.87],[.34,-.5,.5,.71],[.45,.2,.6,.78],[.52,.93,-.28,.24],[.66,.9,-.32,.18],[1,.45,.2,.87]],
  mine:[[0,.35,0,.94],[.4,-.6,0,.8],[.5,.25,-.05,.97],[.56,.95,-.12,-.12],[.72,.94,-.12,-.18],[1,.35,0,.94]],
  grip:{hatchet:-.17,pick:-.25},   // where the off hand holds the handle (tool-local y; the tool hand is at 0)
  rest:null,edge:null,k:-1};
function sk148Dir(K,k,f,s,u){let i=0;while(i<K.length-2&&k>K[i+1][0])i++;const a=K[i],b=K[i+1],t0=Math.max(0,Math.min(1,(k-a[0])/((b[0]-a[0])||1))),t=t0*t0*(3-2*t0);
  const m=j=>a[j]+(b[j]-a[j])*t;return f.clone().multiplyScalar(m(1)).addScaledVector(s,m(2)).addScaledVector(u,m(3)).normalize()}
function sk148Restore(){const R=SK148.rest;SK148.rest=null;if(R)R.forEach(r=>r.o.quaternion.copy(r.q))}
function sk148Aim(){const t=SK141.tool,kind=SK141.kind;if(!t||!t.parent||(kind!='hatchet'&&kind!='pick'))return;
  const V=THREE.Vector3,Q=THREE.Quaternion,B=pl.bones;if(!B||!B.aL0||!B.aL1||!B.aL2||!B.aR0)return;
  const mo=kind=='hatchet'?'chop':'mine',K=SK148[mo],A=HA.cur,k=A&&A.pose===SK141_T[mo].t?A.k:0;
  pl.updateMatrixWorld(true);
  const f=new V(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y)),up=new V(0,1,0),lx=new V(f.z,0,-f.x);
  const hs=Math.sign(pl.worldToLocal(B.aR0.getWorldPosition(new V())).x)||1,s=lx.clone().multiplyScalar(hs);   // the tool hand's side
  const u=sk148Dir(K,k,f,s,up);
  // the head's long axis: pick - across the handle inside the swing plane; hatchet - the edge leads where the head is going
  let x;
  if(kind=='pick')x=new V().crossVectors(u,s).normalize();
  else{// v150: the edge keeps one side of the handle all through the swing (a hatchet does not turn in the hand): the side
    // that leads the down-swing. Following the motion of each moment (v148) flipped the edge round during the wind-up, so
    // the blade faced the hero at the start of every chop.
    const a=sk148Dir(K,.42,f,s,up),b=sk148Dir(K,.54,f,s,up),n=new V().crossVectors(a,b);
    if(n.lengthSq()<1e-6)n.copy(s);n.normalize();const mid=sk148Dir(K,.48,f,s,up);if(new V().crossVectors(n,mid).dot(b.clone().sub(a))<0)n.negate();
    x=new V().crossVectors(n,u);if(x.lengthSq()<1e-6)x=f.clone().addScaledVector(u,-f.dot(u));x.normalize()}
  if(SK148.edge&&kind=='pick'&&x.dot(SK148.edge)<0)x.negate();
  SK148.edge=x.clone();SK148.k=k;
  const y=u.clone().negate(),z=new V().crossVectors(x,y).normalize();x.crossVectors(y,z).normalize();
  const wq=new Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
  t.parent.updateWorldMatrix(true,false);t.quaternion.copy(t.parent.getWorldQuaternion(new Q()).invert().multiply(wq));t.updateMatrixWorld(true);
  // the off hand on the handle
  const T=t.localToWorld(new V(0,SK148.grip[kind],0)),P=s.clone().negate().multiplyScalar(.6).addScaledVector(up,-.8).normalize();
  SK148.rest=[B.aL0,B.aL1,B.aL2].map(o=>({o,q:o.quaternion.clone()}));
  try{fc116IK(B.aL0.getWorldPosition(new V()),B.aL0,B.aL1,B.aL2,T,P,1)}catch(e){if(!SK148.err){SK148.err=1;console.warn('sk148 ik',e)}}}
{const f=animHero;animHero=function(now,mv,h){if((h||pl)===pl)sk148Restore();const r=f.apply(this,arguments);
  try{if((h||pl)===pl)sk148Aim()}catch(e){if(!SK148.err2){SK148.err2=1;console.warn('sk148 aim',e)}}return r}}
{const f=sk141Hide;sk141Hide=function(){sk148Restore();SK148.edge=null;SK148.k=-1;return f.apply(this,arguments)}}
