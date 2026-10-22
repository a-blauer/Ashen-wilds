// ================= v128: Whirlwind — the warrior holds his weapon out while he spins =================
// Before v128 the channel pose (0890: ax -1.2, az -.9) and the strike grip pointed the blade straight up while the hero spun.
// Now, while a 'channel' skill (Whirlwind) runs, after every other animation layer:
//   - two-handed weapons (greatsword, great axe, halberd: one weapon in the right hand, nothing in the left): both hands on the
//     grip, arms reaching out in front and to the right at shoulder height (two-bone IK, fc116IK from 2220), right hand at the
//     guard, left hand just behind it toward the pommel, elbows down;
//   - dual axes: both arms stretched out to the sides, one axe held out on each side;
//   - each held weapon is turned so its blade / head points straight out from the body, level, trailing the spin a little,
//     with the edge (axe bit) leading into the turn; the fist stays on the weapon's grip point.
// It eases in over ~0.12 s and back out over ~0.2 s, so the normal pose and grip take over smoothly when the spin ends.
// The IK changes to the arm bones are undone before the next frame's animation (like FC116), so nothing stacks.
// Companions: their follow spot behind the hero (compTick, 0860) used the hero's facing, which turns 18 rad/s during the spin,
// so the spot circled the hero and companions ran round him. plFaceY() gives the facing from before the spin while it runs.
// Visual only: hit ranges, timings and damage are unchanged. Only the local hero (pl).
var WW128={w:0,t:null,fy:null,rec:null,
  arm:{R:{x:-1.5,z:1.32,el:-.12},L:{x:-1.35,z:-1.2,el:-.35}},   // dual wield: shoulder pitch/roll, elbow bend
  two:{f:.85,r:.5,reach:.3,dy:-.12,gap:.09,pR:[.6,-1],pL:[-.35,-1]},  // two hands: direction (forward/right), reach from the
                                                                       // shoulders' middle, height, hand gap on the grip, elbow poles (right, down)
  lag:.22,     // how far the blade trails the spin (share of the sideways direction)
  lift:.04,    // a touch above level
  inT:.12,outT:.2};
var WW128_V=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],
  WW128_M=new THREE.Matrix4(),WW128_Q=new THREE.Quaternion(),WW128_Q2=new THREE.Quaternion();
function ww128On(){return !!(hero.chan&&hero.chan.sk&&hero.chan.sk.k=='channel')}
// the hero's facing for anything that should not spin with him (companion follow spots)
function plFaceY(){if(!pl)return 0;if(!ww128On()){WW128.fy=pl.rotation.y;return pl.rotation.y}return WW128.fy!=null?WW128.fy:pl.rotation.y}
function ww128Two(G){return G.L.length==1&&G.L[0].side=='R'&&G.L[0].ty!='axes'&&G.L[0].ty!='shield'}
// undo last frame's IK (only where nothing else has written the bone since)
function ww128Undo(){const R=WW128.rec;if(!R)return;WW128.rec=null;for(const r of R)if(r.o.quaternion.equals(r.set))r.o.quaternion.copy(r.q0)}
function ww128Tick(h,now){
  if(h&&h!==pl)return;const b=pl&&pl.bones;if(!b)return;
  const on=ww128On(),S=WW128;let dt=0;if(!on)S.fy=pl.rotation.y;
  if(now!=null){if(S.t!=null)dt=(now-S.t)/1000;S.t=now}if(!(dt>0&&dt<.5))dt=0;
  S.w=on?Math.min(1,S.w+(dt?dt/S.inT:1)):Math.max(0,S.w-(dt?dt/S.outT:1));
  if(S.w<=0)return;
  const w=S.w*S.w*(3-2*S.w),G=pl._grip,two=!!(G&&G.L&&G.L.length&&ww128Two(G)&&b.aR0&&b.aR1&&b.aR2&&b.aL0&&b.aL1&&b.aL2);
  const V=THREE.Vector3,P=pl.position;let twoD=null;
  if(two){
    pl.updateMatrixWorld(true);const T=S.two,sR=b.aR0.getWorldPosition(new V()),sL=b.aL0.getWorldPosition(new V());
    const mid=sR.clone().add(sL).multiplyScalar(.5),rt=new V(sR.x-sL.x,0,sR.z-sL.z);
    if(rt.lengthSq()<1e-6)rt.set(-Math.cos(pl.rotation.y),0,Math.sin(pl.rotation.y));rt.normalize();
    const fw=new V(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y)),dir=fw.multiplyScalar(T.f).addScaledVector(rt,T.r).normalize();
    const tan=new V(dir.z,0,-dir.x),d=dir.clone().addScaledVector(tan,-S.lag);d.y=S.lift;d.normalize();
    const gR=mid.clone().addScaledVector(dir,T.reach);gR.y=mid.y+T.dy;const gL=gR.clone().addScaledVector(d,-T.gap);
    const up=new V(0,1,0),pR=rt.clone().multiplyScalar(T.pR[0]).addScaledVector(up,T.pR[1]),pL=rt.clone().multiplyScalar(T.pL[0]).addScaledVector(up,T.pL[1]);
    const bones=[b.aR0,b.aR1,b.aR2,b.aL0,b.aL1,b.aL2],q0=bones.map(o=>o.quaternion.clone());
    fc116IK(sR,b.aR0,b.aR1,b.aR2,gR,pR,w);fc116IK(sL,b.aL0,b.aL1,b.aL2,gL,pL,w);
    S.rec=bones.map((o,i)=>({o,q0:q0[i],set:o.quaternion.clone()}));twoD=d}
  else{
    // dual wield (or no weapon): arms out to the sides
    const arm=(n0,n1,A)=>{const a0=b[n0],a1=b[n1];if(a0){a0.rotation.x+=(A.x-a0.rotation.x)*w;a0.rotation.z+=(A.z-a0.rotation.z)*w}
      if(a1)a1.rotation.x+=(A.el-a1.rotation.x)*w};
    arm('aR0','aR1',S.arm.R);arm('aL0','aL1',S.arm.L)}
  // weapons
  if(!G||!G.L||!G.L.length)return;
  pl.updateMatrixWorld(true);
  const [hp,out,tan,y,x]=WW128_V;
  for(const e of G.L){const W=e.W,bn=W&&W.parent;if(!bn||!e.S||e.ty=='shield'||e.ty=='bow'||e.ty=='crossbow')continue;
    let d;
    if(twoD){d=twoD;tan.set(d.z,0,-d.x).normalize()}
    else{bn.getWorldPosition(hp);out.set(hp.x-P.x,0,hp.z-P.z);
      if(out.lengthSq()<1e-4){out.set(e.side=='L'?-1:1,0,0).applyQuaternion(pl.quaternion);out.y=0}
      out.normalize();
      // the spin turns the hero by +y: a point at (x,z) moves along (z,-x)
      tan.set(out.z,0,-out.x);
      // blade direction: straight out, trailing the spin a little, a touch above level
      d=out.clone().addScaledVector(tan,-S.lag);d.y=S.lift;d.normalize()}
    // weapon frame in the world: local -y along the blade, local +x (the edge / axe bit) leading into the turn
    y.copy(d).negate();x.copy(tan).multiplyScalar(W.scale.x<0?-1:1);x.addScaledVector(y,-x.dot(y)).normalize();
    const z=new V().crossVectors(x,y);
    WW128_M.makeBasis(x,y,z);WW128_Q.setFromRotationMatrix(WW128_M);
    bn.getWorldQuaternion(WW128_Q2);WW128_Q.premultiply(WW128_Q2.invert());     // into the hand bone's frame
    W.quaternion.slerp(WW128_Q,w);
    // keep the fist on the grip point
    const hd=e.C&&e.C.hold||[0,0,0],an=e.S.p;
    const hv=new V(hd[0]*W.scale.x,hd[1]*W.scale.y,hd[2]*W.scale.z).applyQuaternion(W.quaternion);
    W.position.lerp(new V(an[0]-hv.x,an[1]-hv.y,an[2]-hv.z),w)}
}
{const f=animHero;animHero=function(now,mv,h){if(!h||h===pl){try{ww128Undo()}catch(_){}}const r=f.apply(this,arguments);try{ww128Tick(h,now)}catch(_){}return r}}
