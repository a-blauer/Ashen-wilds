// ================= v127: Whirlwind — the warrior holds his weapon out while he spins =================
// Before v127 the channel pose (0890: ax -1.2, az -.9) and the strike grip pointed the blade straight up while the hero spun.
// Now, while a 'channel' skill (Whirlwind) runs, after every other animation layer:
//   - the weapon arm is stretched out to the side at shoulder height, elbow almost straight; the off arm out the other way
//     for balance (dual axes: the second axe is held out on that side too);
//   - each held weapon is turned so its blade / head points straight out from the body, level, trailing the spin a little,
//     with the edge (axe bit) leading into the turn; the fist stays on the weapon's grip point.
// It eases in over ~0.12 s and back out over ~0.2 s, so the normal pose and grip take over smoothly when the spin ends.
// Visual only: hit ranges, timings and damage are unchanged. Only the local hero (pl).
var WW127={w:0,t:null,
  arm:{R:{x:-1.5,z:1.32,el:-.12},L:{x:-1.35,z:-1.2,el:-.35}},   // shoulder pitch/roll, elbow bend
  lag:.22,     // how far the blade trails the spin (share of the sideways direction)
  lift:.04,    // a touch above level
  inT:.12,outT:.2};
var WW127_V=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],
  WW127_M=new THREE.Matrix4(),WW127_Q=new THREE.Quaternion(),WW127_Q2=new THREE.Quaternion();
function ww127On(){return !!(hero.chan&&hero.chan.sk&&hero.chan.sk.k=='channel')}
function ww127Tick(h,now){
  if(h&&h!==pl)return;const b=pl&&pl.bones;if(!b)return;
  const on=ww127On(),S=WW127;let dt=0;
  if(now!=null){if(S.t!=null)dt=(now-S.t)/1000;S.t=now}if(!(dt>0&&dt<.5))dt=0;
  S.w=on?Math.min(1,S.w+(dt?dt/S.inT:1)):Math.max(0,S.w-(dt?dt/S.outT:1));
  if(S.w<=0)return;
  const w=S.w*S.w*(3-2*S.w);
  // arms
  const arm=(n0,n1,A)=>{const a0=b[n0],a1=b[n1];if(a0){a0.rotation.x+=(A.x-a0.rotation.x)*w;a0.rotation.z+=(A.z-a0.rotation.z)*w}
    if(a1)a1.rotation.x+=(A.el-a1.rotation.x)*w};
  arm('aR0','aR1',S.arm.R);arm('aL0','aL1',S.arm.L);
  // weapons
  const G=pl._grip;if(!G||!G.L||!G.L.length)return;
  pl.updateMatrixWorld(true);
  const P=pl.position,[hp,out,tan,y,x]=WW127_V;
  for(const e of G.L){const W=e.W,bn=W&&W.parent;if(!bn||!e.S||e.ty=='shield'||e.ty=='bow'||e.ty=='crossbow')continue;
    bn.getWorldPosition(hp);out.set(hp.x-P.x,0,hp.z-P.z);
    if(out.lengthSq()<1e-4){out.set(e.side=='L'?-1:1,0,0).applyQuaternion(pl.quaternion);out.y=0}
    out.normalize();
    // the spin turns the hero by +y: a point at (x,z) moves along (z,-x)
    tan.set(out.z,0,-out.x);
    // blade direction: straight out, trailing the spin a little, a touch above level
    const d=out.clone().addScaledVector(tan,-S.lag);d.y=S.lift;d.normalize();
    // weapon frame in the world: local -y along the blade, local +x (the edge / axe bit) leading into the turn
    y.copy(d).negate();x.copy(tan).multiplyScalar(W.scale.x<0?-1:1);x.addScaledVector(y,-x.dot(y)).normalize();
    const z=WW127_V[1].clone().crossVectors(x,y);
    WW127_M.makeBasis(x,y,z);WW127_Q.setFromRotationMatrix(WW127_M);
    bn.getWorldQuaternion(WW127_Q2);WW127_Q.premultiply(WW127_Q2.invert());     // into the hand bone's frame
    W.quaternion.slerp(WW127_Q,w);
    // keep the fist on the grip point
    const hd=e.C&&e.C.hold||[0,0,0],an=e.S.p;
    const hv=new THREE.Vector3(hd[0]*W.scale.x,hd[1]*W.scale.y,hd[2]*W.scale.z).applyQuaternion(W.quaternion);
    W.position.lerp(new THREE.Vector3(an[0]-hv.x,an[1]-hv.y,an[2]-hv.z),w)}
}
{const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);try{ww127Tick(h,now)}catch(_){}return r}}
