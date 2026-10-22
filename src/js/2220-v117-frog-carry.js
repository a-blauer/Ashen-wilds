// ================= v117 frog Mage: how he carries his weapons =================
// The v93 carry grip is tuned on human arms (GRIP_B), and the frog's short arms sit right on his wide robe, so staves, wands and orbs
// cut through the robe and armour. While he is not attacking, his weapon arm is posed by a two-bone IK to a hold point out to the
// side (staff, wand) or in front (orb), and the weapon gets its own steady orientation: the staff stands upright beside him with its
// foot angled away from the robe hem, the wand points ahead, the orb rests above his open paw. Attacks and abilities fade the hold
// out exactly like the beast arm hold (H._brS.a), so their tracks play unchanged.
// Every change is put back before the next frame (FC116 keeps the bone and weapon values it found), so the base layers, the grip and
// the beast layer's exact-value undo never see it. Numbers are in the hero's frame from the shoulder: side out, fwd, down (m);
// the weapon direction is up/side/fwd weights (side > 0 = away from the body). test/v116_wclip.py measures the result.
var FC116={on:true,
  H:{staff:{arm:'R',hand:[.15,.1,.22],dir:[1,-.2,-.08]},
     wand:{arm:'R',hand:[.14,.2,.18],dir:[.45,.15,.85]},
     orb:{arm:'L',hand:[.12,.32,.24],dir:[1,0,0]}},
  pole:[-.35,-1,.5]}; // elbow bends down and back, a little out (side, up, fwd)
function fc116Race(H){return H&&H._race&&BRD[H._race]&&BRD[H._race].key=='frog'}
function fc116Restore(H){const S=H._fc116;if(!S)return;H._fc116=null;
  S.b.forEach(r=>{if(r.o.quaternion.equals(r.set))r.o.quaternion.copy(r.q0)});
  S.w.forEach(r=>{if(r.o.quaternion.equals(r.set)&&r.o.position.equals(r.ps)){r.o.quaternion.copy(r.q0);r.o.position.copy(r.p0)}})}
var FC116_T={V:null};
function fc116Rot(bone,from,to,w){// turn a bone in world space so direction `from` points along `to` (slerped by w)
  const T=FC116_T,q=T.q1.setFromUnitVectors(from.clone().normalize(),to.clone().normalize());if(w<1)q.slerp(T.qI,1-w);
  const pw=bone.parent.getWorldQuaternion(T.q2),bw=bone.getWorldQuaternion(T.q3);bone.quaternion.copy(pw.clone().invert().multiply(q.multiply(bw)));bone.updateMatrixWorld(true)}
function fc116Apply(H){const B=H.bones;if(!B||!B.aR0||!B.aL0)return;
  const W=(H.gearG||[]).find(o=>o&&o.userData&&FC116.H[o.userData.wt]&&o.parent);if(!W)return;
  const C=FC116.H[W.userData.wt],s1=C.arm,b0=B['a'+s1+'0'],b1=B['a'+s1+'1'],b2=B['a'+s1+'2'];if(!b0||!b1||!b2||W.parent!==b2)return;
  const st=H._brS,ar=st?st.a:1,w=ar<.001?0:ar*ar*(3-2*ar);
  if(w<=0)return;
  if(!FC116_T.V){const V=THREE.Vector3,Q=THREE.Quaternion;Object.assign(FC116_T,{V,q1:new Q(),q2:new Q(),q3:new Q(),qI:new Q(),m:new THREE.Matrix4()})}
  const V=FC116_T.V,rec={b:[],w:[]};[b0,b1].forEach(o=>rec.b.push({o,q0:o.quaternion.clone()}));rec.w.push({o:W,q0:W.quaternion.clone(),p0:W.position.clone()});
  H.updateMatrixWorld(true);
  const S=b0.getWorldPosition(new V()),E=b1.getWorldPosition(new V()),Hd=b2.getWorldPosition(new V()),sp=(B.chest||B.spine).getWorldPosition(new V());
  const f=new V(Math.sin(H.rotation.y),0,Math.cos(H.rotation.y)),up=new V(0,1,0);let sd=new V(S.x-sp.x,0,S.z-sp.z);sd.addScaledVector(f,-sd.dot(f));if(sd.lengthSq()<1e-6)sd.set(f.z,0,-f.x);sd.normalize();
  const fr=(a)=>new V().addScaledVector(sd,a[0]).addScaledVector(up,a[1]).addScaledVector(f,a[2]);
  const T=S.clone().add(fr([C.hand[0],-C.hand[2],C.hand[1]]));
  // two-bone IK: the elbow sits on the side of the pole, the upper arm aims at it, the forearm at the hold point
  const a=E.distanceTo(S),b=Hd.distanceTo(E);let d=T.distanceTo(S);const dm=(a+b)*.985;if(d>dm){T.sub(S).setLength(dm).add(S);d=dm}
  const ST=T.clone().sub(S).normalize(),x=(a*a-b*b+d*d)/(2*d),h=Math.sqrt(Math.max(0,a*a-x*x));
  const P=fr([FC116.pole[0],FC116.pole[1],FC116.pole[2]]);P.addScaledVector(ST,-P.dot(ST)).normalize();
  const Ed=S.clone().addScaledVector(ST,x).addScaledVector(P,h);
  fc116Rot(b0,E.clone().sub(S),Ed.clone().sub(S),w);
  const E2=b1.getWorldPosition(new V()),H2=b2.getWorldPosition(new V());fc116Rot(b1,H2.clone().sub(E2),T.clone().sub(E2),w);
  // the weapon: local -Y along the chosen direction, local "face" axis turned toward the hero's front
  b2.updateMatrixWorld(true);const Y=fr([C.dir[1],C.dir[0],C.dir[2]]).normalize().negate(),Fz=fr([0,0,1]);
  const Z=Fz.clone().addScaledVector(Y,-Fz.dot(Y)).normalize(),X=new V().crossVectors(Y,Z).normalize();
  const qd=new THREE.Quaternion().setFromRotationMatrix(FC116_T.m.makeBasis(X,Y,Z));
  const qw=W.getWorldQuaternion(new THREE.Quaternion()),out=qw.clone().slerp(qd,w),pq=b2.getWorldQuaternion(new THREE.Quaternion());
  W.quaternion.copy(pq.invert().multiply(out));
  rec.b.forEach(r=>r.set=r.o.quaternion.clone());rec.w.forEach(r=>{r.set=r.o.quaternion.clone();r.ps=r.o.position.clone()});H._fc116=rec;H.updateMatrixWorld(true)}
{const f=animHero;animHero=function(now,mv,h){const H=h||pl;if(H&&H._fc116)fc116Restore(H);const r=f.apply(this,arguments);
  try{if(FC116.on&&H&&fc116Race(H)&&!(H===pl&&typeof riding!='undefined'&&riding))fc116Apply(H)}catch(e){if(!FC116.err){FC116.err=1;console.warn('v117 frog carry',e)}}return r}}
// during attacks and casts the frog's shoulders spread a little (the beast layer's D.atk), so the staff swings clear of his wide head and robe
{const D=Object.values(BRD).find(d=>d&&d.key=='frog');if(D&&!D.atk)D.atk={shz:.3}}
