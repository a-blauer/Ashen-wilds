// ================= v117 Mage (the frog, since v133 the raven): how he holds his weapons =================
// The v93 grip lays a weapon along the fingers of a human fist (tuned on human arms, GRIP_B), so on the frog's long webbed paw the
// shaft ran beside the fingers, the fingertips poked through it and the orb floated off the hand. Here the paw itself decides:
//  * fc117Frame measures each paw from the final skinned mesh (the vertices that belong to the hand bone only, in that bone's own
//    frame): finger direction d, knuckle axis e (across the fingers), the side the fingers curl toward c (the palm side), the paw
//    length, the grip point inside the curl and the palm centre.
//  * A staff or wand always sits in the paw's channel: through the grip point, along the knuckle axis tilted a little toward the
//    fingertips (C.tilt), so the curled fingers close round it. This holds in every pose, attacks included (the attack tracks still
//    move the arm). An orb rests on the open palm side.
//  * While he is not attacking (the beast arm-hold weight, H._brS.a), his arm is posed by a two-bone IK and his wrist turned so the
//    weapon points where it should (staff upright beside him, foot angled away from the robe; wand ahead; orb held out in front,
//    palm up); the wrist's roll round the weapon is chosen to keep the paw in line with the forearm.
// Every change is put back before the next frame, so the base layers, the grip and the beast layer's exact-value undo never see it.
// Hold points are from the shoulder in the hero's frame [out, fwd, down] (m); directions are [up, out, fwd] weights.
// test/v117_grip.py (close-ups), v117_wclip.py (robe clipping) check it.
var FC116={on:true,
  H:{staff:{arm:'R',hand:[.17,.1,.24],dir:[1,-.1,-.06],tilt:.28},  // v133 raven: a little further out and more upright (the frog's lean in brought the head of the staff past a crown's spikes)
     wand:{arm:'R',hand:[.13,.2,.2],dir:[.42,.12,.9],tilt:.15,tiltA:1.0},  // tiltA: in attacks the wand points along the fingers, like a pointer
     orb:{arm:'L',hand:[.1,.3,.22],palm:1}},  // the orb (ball at +Y on a short stand) stands in the cupped palm, palm up
  pole:[.45,-.6,-1], // v118: elbow bends back and a little out [out, up, fwd] (it was [-.35,-1,.5]: forward and in, so the arm bent backwards)
  clear:[['spine',.19],['chest',.215],['head',.14]]}; // v133: spheres (bone, radius m) the orb stays outside of during attacks / casts
function fc116Race(H){return H&&H._race&&BRD[H._race]&&BRD[H._race].key=='raven'}
var FC116_T={V:null};
function fc116Tmp(){if(!FC116_T.V){const V=THREE.Vector3,Q=THREE.Quaternion;Object.assign(FC116_T,{V,Q,q1:new Q(),q2:new Q(),q3:new Q(),qI:new Q(),m:new THREE.Matrix4(),m2:new THREE.Matrix4()})}return FC116_T}
// ---------- the paw, measured once per body build ----------
function fc117Frame(H,bn){const key=(H._mdKey||'')+'|'+bn;H._fc117=H._fc117||{};if(H._fc117[key])return H._fc117[key];const b=H.bones[bn];if(!b)return null;
  const V=THREE.Vector3,pts=[];H.traverse(o=>{if(!o.isSkinnedMesh||!o.skeleton)return;const sk=o.skeleton,bi=sk.bones.indexOf(b);if(bi<0)return;const P=o.geometry.attributes.position,SI=o.geometry.attributes.skinIndex,SW=o.geometry.attributes.skinWeight;if(!P||!SI)return;
    const M=new THREE.Matrix4().multiplyMatrices(sk.boneInverses[bi],o.bindMatrix),v=new V();
    for(let i=0;i<P.count;i++){let w=0;if(SI.getX(i)==bi)w+=SW.getX(i);if(SI.getY(i)==bi)w+=SW.getY(i);if(SI.getZ(i)==bi)w+=SW.getZ(i);if(SI.getW(i)==bi)w+=SW.getW(i);if(w<.99)continue;v.fromBufferAttribute(P,i).applyMatrix4(M);pts.push(v.clone())}});
  if(pts.length<40)return null;
  const cen=pts.reduce((a,p)=>a.add(p),new V()).multiplyScalar(1/pts.length),d=cen.clone().normalize();let L=0;pts.forEach(p=>{L=Math.max(L,p.dot(d))});
  const band=(a,z)=>pts.filter(p=>{const t=p.dot(d)/L;return t>=a&&t<=z}),tips=band(.82,1),base=band(.22,.45),mid=band(.55,.75),mean=A=>A.reduce((a,p)=>a.add(p),new V()).multiplyScalar(1/Math.max(1,A.length));
  // knuckle axis: the widest spread of the fingertips across the finger direction (2-D principal axis)
  const u0=Math.abs(d.x)<.9?new V(1,0,0):new V(0,1,0),ax1=u0.clone().addScaledVector(d,-u0.dot(d)).normalize(),ax2=new V().crossVectors(d,ax1).normalize(),tm=mean(tips);
  let sxx=0,syy=0,sxy=0;tips.forEach(p=>{const q=p.clone().sub(tm),x=q.dot(ax1),y=q.dot(ax2);sxx+=x*x;syy+=y*y;sxy+=x*y});const th=.5*Math.atan2(2*sxy,sxx-syy);
  const e=ax1.clone().multiplyScalar(Math.cos(th)).addScaledVector(ax2,Math.sin(th)).normalize();
  // curl: where the fingertips lean, across both the finger direction and the knuckle axis
  let c=new V().crossVectors(d,e).normalize();if(tm.clone().sub(mean(base)).dot(c)<0)c.negate();
  const mm=mean(mid);let lo=1e9,hi=-1e9;mid.forEach(p=>{const t=p.clone().sub(mm).dot(c);lo=Math.min(lo,t);hi=Math.max(hi,t)});
  const F={d,e,c,L,grip:d.clone().multiplyScalar(.64*L).addScaledVector(c,.16*L).addScaledVector(e,mm.dot(e)),palm:mean(base).clone().add(mean(mid)).multiplyScalar(.5),thick:Math.max(.008,(hi-lo)/2)};
  H._fc117[key]=F;return F}
// a weapon's own bounding box in its local frame (orb: where the ball is)
function fc117WB(W){if(W.userData.bb117)return W.userData.bb117;W.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(W.matrixWorld).invert(),B=new THREE.Box3(),v=new THREE.Vector3();
  W.traverse(o=>{if(!o.isMesh||!o.geometry)return;const P=o.geometry.attributes.position;if(!P)return;const M=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(M);B.expandByPoint(v)}});
  const c=B.getCenter(new THREE.Vector3()),s=B.getSize(new THREE.Vector3());return W.userData.bb117={c,r:Math.max(s.x,s.y,s.z)/2,min:B.min.clone(),max:B.max.clone()}}
// rotation taking local orthonormal pair (a1,a2) to world pair (b1,b2)
function fc117Basis(a1,a2,b1,b2){const T=fc116Tmp(),a3=new T.V().crossVectors(a1,a2),b3=new T.V().crossVectors(b1,b2);
  const A=new THREE.Matrix4().makeBasis(a1,a2,a3),Bm=new THREE.Matrix4().makeBasis(b1,b2,b3);return new THREE.Quaternion().setFromRotationMatrix(Bm.multiply(A.transpose()))}
function fc116Restore(H){const S=H._fc116;if(!S)return;H._fc116=null;
  S.b.forEach(r=>{if(r.o.quaternion.equals(r.set))r.o.quaternion.copy(r.q0)});
  S.w.forEach(r=>{if(r.o.quaternion.equals(r.set)&&r.o.position.equals(r.ps)){r.o.quaternion.copy(r.q0);r.o.position.copy(r.p0)}})}
function fc116Rot(bone,from,to,w){const T=fc116Tmp(),q=T.q1.setFromUnitVectors(from.clone().normalize(),to.clone().normalize());if(w<1)q.slerp(T.qI,1-w);
  const pw=bone.parent.getWorldQuaternion(T.q2),bw=bone.getWorldQuaternion(T.q3);bone.quaternion.copy(pw.clone().invert().multiply(q.multiply(bw)));bone.updateMatrixWorld(true)}
function fc116IK(S,b0,b1,b2,T,P,w){const V=fc116Tmp().V,E=b1.getWorldPosition(new V()),Hd=b2.getWorldPosition(new V()),a=E.distanceTo(S),b=Hd.distanceTo(E);T=T.clone();let d=T.distanceTo(S);const dm=(a+b)*.985;if(d>dm){T.sub(S).setLength(dm).add(S);d=dm}
  const ST=T.clone().sub(S).normalize(),x=(a*a-b*b+d*d)/(2*d),h=Math.sqrt(Math.max(0,a*a-x*x)),Pp=P.clone().addScaledVector(ST,-P.dot(ST)).normalize(),Ed=S.clone().addScaledVector(ST,x).addScaledVector(Pp,h);
  fc116Rot(b0,E.clone().sub(S),Ed.clone().sub(S),w);const E2=b1.getWorldPosition(new V()),H2=b2.getWorldPosition(new V());fc116Rot(b1,H2.clone().sub(E2),T.clone().sub(E2),w)}
function fc116Apply(H){const B=H.bones;if(!B||!B.aR0||!B.aL0)return;
  const W=(H.gearG||[]).find(o=>o&&o.userData&&FC116.H[o.userData.wt]&&o.parent);if(!W)return;
  const C=FC116.H[W.userData.wt],s1=C.arm,b0=B['a'+s1+'0'],b1=B['a'+s1+'1'],b2=B['a'+s1+'2'];if(!b0||!b1||!b2||W.parent!==b2)return;
  const Fp=fc117Frame(H,'a'+s1+'2');if(!Fp)return;const T=fc116Tmp(),V=T.V,Q=T.Q;
  const rec={b:[],w:[]};[b0,b1,b2].forEach(o=>rec.b.push({o,q0:o.quaternion.clone()}));rec.w.push({o:W,q0:W.quaternion.clone(),p0:W.position.clone()});
  // the weapon in the paw (hand-bone frame), whatever the arm does
  const st=H._brS,ar=st?st.a:1,w=ar<.001?0:ar*ar*(3-2*ar);
  // v118: which way along the knuckle axis the staff/wand head points is fixed by the paw itself: toward the side the knuckles face
  // in the model's bind pose (forward), so the head is up in attacks too. It used to be learned from the first carry frame, which
  // could pick the other end: hidden while carrying (the wrist turned it upright) but upside down in every attack.
  if(H['_fcs'+s1]===undefined)H['_fcs'+s1]=fc118Sign(H,b2,Fp);
  const sg=H['_fcs'+s1]||1,wlOf=t=>Fp.e.clone().multiplyScalar(sg*Math.cos(t||0)).addScaledVector(Fp.d,Math.sin(t||0)).normalize(),wl=wlOf(C.tilt);
  let wq,wp;if(C.palm){const bb=fc117WB(W),foot=new V(bb.c.x,bb.min.y,bb.c.z);wq=new Q().setFromUnitVectors(new V(0,1,0),Fp.c);wp=Fp.palm.clone().addScaledVector(Fp.c,Fp.thick*.6).sub(foot.applyQuaternion(wq))}
  else{const qOf=l=>{const zl=Fp.d.clone().addScaledVector(l,-Fp.d.dot(l)).normalize();return fc117Basis(new V(0,-1,0),new V(0,0,1),l,zl)};wq=qOf(wl);
    if(C.tiltA!=null&&w<1){const l2=wlOf(C.tiltA),zA=Fp.c.clone().multiplyScalar(-1);wq=fc117Basis(new V(0,-1,0),new V(0,0,1),l2,zA.addScaledVector(l2,-zA.dot(l2)).normalize()).slerp(wq,w)}
    wp=Fp.grip.clone();if(C.hold)wp.sub(new V(...C.hold).applyQuaternion(wq))}
  // the carry pose, faded out during attacks like the beast arm hold
  if(w>0){H.updateMatrixWorld(true);
    const S=b0.getWorldPosition(new V()),sp=(B.chest||B.spine).getWorldPosition(new V()),f=new V(Math.sin(H.rotation.y),0,Math.cos(H.rotation.y)),up=new V(0,1,0);
    let sd=new V(S.x-sp.x,0,S.z-sp.z);sd.addScaledVector(f,-sd.dot(f));if(sd.lengthSq()<1e-6)sd.set(f.z,0,-f.x);sd.normalize();
    const fr=a=>new V().addScaledVector(sd,a[0]).addScaledVector(up,a[1]).addScaledVector(f,a[2]),G=S.clone().add(fr([C.hand[0],-C.hand[2],C.hand[1]])),P=fr(FC116.pole);
    const ws=b2.getWorldScale(new V()).x;
    // wrist rotation: the weapon (or the palm, for the orb) points along U; the roll round it keeps the paw in line with the forearm
    const wantR=Fw=>{let best=null;for(const s of (C.palm?[1]:H['_fcs'+s1]!==undefined?[sg]:[1,-1])){const a1=C.palm?Fp.c.clone():Fp.e.clone().multiplyScalar(s*Math.cos(C.tilt||0)).addScaledVector(Fp.d,Math.sin(C.tilt||0)).normalize();
        const U=C.palm?up.clone():fr([C.dir[1],C.dir[0],C.dir[2]]).normalize(),a2=Fp.d.clone().addScaledVector(a1,-Fp.d.dot(a1)).normalize(),b2v=Fw.clone().addScaledVector(U,-Fw.dot(U)).normalize();
        const R=fc117Basis(a1,a2,U,b2v),sc=Fp.d.clone().applyQuaternion(R).dot(Fw);if(!best||sc>best.sc)best={R,s,sc}}return best};
    let Fw=G.clone().sub(S).normalize(),R=wantR(Fw);
    for(let it=0;it<2;it++){const tip=(C.palm?Fp.palm.clone():Fp.grip.clone()).multiplyScalar(ws).applyQuaternion(R.R),Tw=G.clone().sub(tip);
      fc116IK(S,b0,b1,b2,Tw,P,w);const E2=b1.getWorldPosition(new V()),W2=b2.getWorldPosition(new V());Fw=W2.clone().sub(E2).normalize();R=wantR(Fw)}
    const pq=b2.parent.getWorldQuaternion(new Q()),cur=b2.getWorldQuaternion(new Q());let tgt;
    // v118: blending the wrist straight from the attack pose to the carry pose (one slerp) could tumble a staff end over end, because the
    // two differ mostly by a twist round the shaft. Instead the shaft swings toward its carry direction (no twist) and the twist round
    // the shaft is blended on its own, kept continuous from frame to frame (H._fcth), so the weapon stays upright through the hand-off.
    if(C.palm||w>=.999)tgt=cur.clone().slerp(R.R,w);
    else{const U=fr([C.dir[1],C.dir[0],C.dir[2]]).normalize(),ax=wl.clone().applyQuaternion(cur).normalize(),Rs=new Q().setFromUnitVectors(ax,U).multiply(cur),
        dq=R.R.clone().multiply(Rs.clone().invert());if(dq.w<0)dq.set(-dq.x,-dq.y,-dq.z,-dq.w);
        let th=2*Math.acos(Math.min(1,dq.w));if(dq.x*U.x+dq.y*U.y+dq.z*U.z<0)th=-th;const tk='_fcth'+s1,pv=H[tk];if(pv!=null){while(th-pv>Math.PI)th-=2*Math.PI;while(th-pv<-Math.PI)th+=2*Math.PI}H[tk]=th;
        const sw=cur.clone().slerp(Rs,w),ax2=wl.clone().applyQuaternion(sw).normalize();tgt=new Q().setFromAxisAngle(ax2,w*th).multiply(sw)}
    if(w>=.999)H['_fcth'+s1]=null;b2.quaternion.copy(pq.invert().multiply(tgt))}
  // v133: during attacks and casts (the hold faded out) the orb floats clear of the body and head: its centre is pushed out of a
  // sphere round the spine, the chest and the head (FC116.clear radii + the orb's own radius), along the line from that centre
  if(C.palm&&w<.999&&FC116.clear){H.updateMatrixWorld(true);const bb=fc117WB(W),ws=b2.getWorldScale(new V()).x,M=b2.matrixWorld,c0=bb.c.clone().applyQuaternion(wq).add(wp).applyMatrix4(M),c1=c0.clone();
    FC116.clear.forEach(([bn,r0])=>{const bo=B[bn];if(!bo)return;const o=bo.getWorldPosition(new V()),d=c1.clone().sub(o),R=(r0+bb.r)*ws;if(d.length()>=R)return;
      if(d.lengthSq()<1e-8)d.set(Math.sin(H.rotation.y),0,Math.cos(H.rotation.y));c1.copy(o).addScaledVector(d.normalize(),R)});
    if(!c1.equals(c0)){const inv=new THREE.Matrix4().copy(M).invert(),off=c1.applyMatrix4(inv).sub(c0.clone().applyMatrix4(inv));wp=wp.clone().addScaledVector(off,1-w)}}
  W.quaternion.copy(wq);W.position.copy(wp);
  rec.b.forEach(r=>r.set=r.o.quaternion.clone());rec.w.forEach(r=>{r.set=r.o.quaternion.clone();r.ps=r.o.position.clone()});H._fc116=rec;H.updateMatrixWorld(true)}
function fc118Sign(H,b,Fp){let s=1;H.traverse(o=>{if(!o.isSkinnedMesh||!o.skeleton)return;const i=o.skeleton.bones.indexOf(b);if(i<0)return;
  const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().copy(o.skeleton.boneInverses[i]).invert());s=Fp.e.clone().applyQuaternion(q).z<0?-1:1});return s}
function fc116Restore2(H,rec){rec.b.forEach(r=>r.o.quaternion.copy(r.q0));rec.w.forEach(r=>{r.o.quaternion.copy(r.q0);r.o.position.copy(r.p0)});H.updateMatrixWorld(true)}
{const f=animHero;animHero=function(now,mv,h){const H=h||pl;if(H&&H._fc116)fc116Restore(H);const r=f.apply(this,arguments);
  try{if(FC116.on&&H&&fc116Race(H)&&!(H===pl&&typeof riding!='undefined'&&riding)){fc116Apply(H);if(!H._fc116)fc116Apply(H)}}catch(e){if(!FC116.err){FC116.err=1;console.warn('v117 frog hold',e)}}return r}}
// during attacks and casts the frog's shoulders spread a little (the beast layer's D.atk), so the staff swings clear of his wide head and robe
{const D=Object.values(BRD).find(d=>d&&d.key=='raven');if(D&&!D.atk)D.atk={shz:.3}}
