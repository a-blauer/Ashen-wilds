// ================= v94: creator track — a natural riding pose =================
// Before v94 the rider sat with the thighs flat on the saddle, the knees folded under and both arms held straight out in
// front (upper arm −0.75 + elbow −0.8 ≈ 90°: the forearms pointed straight ahead).
// mountTick (f_mount.js) still moves the hero onto the saddle and sets the old pose; this wrapper then replaces the pose:
//   legs   — thighs forward and out around the mount's flanks, knees bent, shins down the flanks, heels a little down.
//            The angles are solved once per mount model (lkrSolve): the mount's body + saddle blanket is sampled into a
//            grid of half widths around the saddle (lkrProfile), then a small grid search picks the thigh pitch/yaw/splay
//            and knee bend that keep the knee, shin and foot outside that body while staying close to a relaxed seat
//            (broad mounts like the boar get wider legs, narrow ones like the stag a closer seat);
//   torso  — upright, leaning forward a little more with speed; it gives with the saddle's bounce (a spring on the
//            saddle's vertical speed) so it rocks with the gait instead of moving rigidly with the mount;
//   arms   — a free hand holds the reins low in front, near the mount's neck (both hands when no weapon is carried);
//            a hand that carries a weapon keeps the v93 carry grip (same forearm angle as standing, so the blade stays
//            upright, great weapons on the shoulder); a shield arm still holds the reins;
//   head   — looks forward against the lean, a slow look around while standing; standing still also sways a little.
// While an action plays (HA.cur / pl.sw / channel) the upper body is left to the v81 action system; attacking still
// dismounts as before (swing/cast wrappers in f_mount.js). Every channel this file touches that animHero does not
// set each frame (left arm yaw, thigh yaw, spine roll) is put back to 0 when the hero leaves the saddle.
var LKR={on:0,sv:0,sp:0,lp:0,last:null,vy:0,yb:null,t:0,hw:{},spd:0};
function lkrSS(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}
// The mount's body around the saddle as a grid of half widths in the rider's frame (hip height .55, unscaled): cell
// [iy][iz] = widest |x| of the mount (body + saddle blanket) at height iy*.05 and depth −.2+iz*.1. Measured once per model.
var LKR_GY=13,LKR_GZ=8;
function lkrProfile(m,ps){
  const P=new Float32Array(LKR_GY*LKR_GZ);
  try{m.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(m.matrixWorld).invert(),s=m.seat,y0=s[0]+.05-.55*ps;
    const put=(x,y,z)=>{y=(y-y0)/ps;z=(z-s[1])/ps;const iy=Math.floor(y/.05),iz=Math.floor((z+.2)/.1);if(iy<0||iy>=LKR_GY||iz<0||iz>=LKR_GZ)return;
      const k=iy*LKR_GZ+iz;x=Math.abs(x)/ps;if(x>P[k]&&x<1.2)P[k]=x};
    const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();
    m.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.attributes.position||!o.visible)return;const g=o.geometry,pa=g.attributes.position,ix=g.index?g.index.array:null,n=ix?ix.length:pa.count;
      const W=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld),get=(i,out)=>{out.fromBufferAttribute(pa,i);if(o.isSkinnedMesh)o.boneTransform(i,out);return out.applyMatrix4(W)};
      // sample each triangle's surface (the low-poly faces are big: their corners alone leave holes)
      for(let t=0;t+2<n;t+=3){get(ix?ix[t]:t,A);get(ix?ix[t+1]:t+1,B);get(ix?ix[t+2]:t+2,C);
        if(Math.max(A.y,B.y,C.y)<y0-.05||Math.min(A.y,B.y,C.y)>y0+.7*ps)continue;
        const N=Math.min(8,1+Math.ceil(Math.max(A.distanceTo(B),B.distanceTo(C),C.distanceTo(A))/.04));
        for(let i=0;i<=N;i++)for(let j=0;j<=N-i;j++){const u=i/N,w=j/N,r=1-u-w;put(A.x*r+B.x*u+C.x*w,A.y*r+B.y*u+C.y*w,A.z*r+B.z*u+C.z*w)}}})}catch(e){console.warn('ride profile',e)}
  return P}
function lkrHW(P,y,z){const iy=Math.floor(y/.05),iz=Math.floor((z+.2)/.1);if(iy<0||iy>=LKR_GY||iz<0||iz>=LKR_GZ)return 0;return P[iy*LKR_GZ+iz]}
// right-leg angles (thigh pitch p, yaw y, splay s; knee k) that sit around that body: every sample point of the leg stays
// outside it (plus the leg's radius), with the angles as close as possible to a relaxed seat and the foot near the stirrup.
function lkrSolve(m,ps){
  const key=ps.toFixed(2);if(m._lkL&&m._lkL.key==key)return m._lkL;
  const P=lkrProfile(m,ps),b=pl.bones,r0=n=>{const o=b[n];if(!o.userData.lk0)o.userData.lk0=o.position.clone();return o.userData.lk0};
  const H=r0('rh0'),K=r0('rh1'),A=r0('rh2'),pv=b.pelvis,hx=Math.abs(H.x)+LKR_HIPW,hy=(pv.userData.y0!=null?pv.userData.y0:pv.position.y)+H.y,hz=H.z;
  let best=null;const M=new Float64Array(9),pts=new Float64Array(3);
  const rot=(x,y,z)=>{const a=Math.cos(x),bb=Math.sin(x),c=Math.cos(y),d=Math.sin(y),e=Math.cos(z),f=Math.sin(z),ae=a*e,af=a*f,be=bb*e,bf=bb*f;
    M[0]=c*e;M[1]=-c*f;M[2]=d;M[3]=af+be*d;M[4]=ae-bf*d;M[5]=-bb*c;M[6]=bf-ae*d;M[7]=be+af*d;M[8]=a*c};
  for(let p=-1.5;p<=-.25;p+=.1)for(let s=.15;s<=1.45;s+=.1)for(let yw=-.4;yw<=.7;yw+=.1)for(let k=.4;k<=2.1;k+=.1){
    rot(p,yw,s);
    // knee
    const kx=hx+M[0]*K.x+M[1]*K.y+M[2]*K.z,ky=hy+M[3]*K.x+M[4]*K.y+M[5]*K.z,kz=hz+M[6]*K.x+M[7]*K.y+M[8]*K.z;
    // shin direction = M · Rx(k) · A
    const ck=Math.cos(k),sk=Math.sin(k),ax=A.x,ay=ck*A.y-sk*A.z,az=sk*A.y+ck*A.z;
    const sx=M[0]*ax+M[1]*ay+M[2]*az,sy=M[3]*ax+M[4]*ay+M[5]*az,sz=M[6]*ax+M[7]*ay+M[8]*az;
    let pen=0;
    const tst=(x,y,z,rad)=>{const w=lkrHW(P,y,z);if(w>0){const d=w+rad-x;if(d>0)pen+=d*d}};
    tst(kx,ky,kz,0);tst(kx+sx*.5,ky+sy*.5,kz+sz*.5,.03);tst(kx+sx,ky+sy,kz+sz,.04);
    tst(kx+sx*1.25,ky+sy*1.25-.02,kz+sz*1.25+.08,.04);
    const ex=kx+sx,ey=ky+sy,ez=kz+sz;
    const c=pen*LKR_W.pen+(p+.85)*(p+.85)*LKR_W.p+(k-1.15)*(k-1.15)*LKR_W.k+(s-.55)*(s-.55)*LKR_W.s+yw*yw*LKR_W.y
      +LKR_W.ay*(ey-.14)*(ey-.14)+LKR_W.az*ez*ez+(ky>.5?(ky-.5)*(ky-.5)*20:0)+(ey<.04?(.04-ey)*20:0);
    if(!best||c<best.c)best={c,p,s,y:yw,k,pen}}
  best.key=key;return m._lkL=best}
var LKR_W={pen:30,p:.3,k:.2,s:.1,y:.2,ay:2,az:.6};
var LKR_HIPW=.035; // the thighs sit a little wider apart on the saddle (hidden by the saddle)
// which hands carry something (v93 grip registry; without it: the weapon hand, the bow hand)
function lkrHands(){
  const R={R:null,L:null};
  try{if(pl._grip&&pl._grip.L)for(const e of pl._grip.L){if(!e.W||!e.W.parent)continue;if(R[e.side]&&R[e.side].ty!='shield')continue;R[e.side]={ty:e.ty,el:(e.C&&e.C.el)||0}}
    else{const wt=typeof curWT=='function'?curWT():null;if(wt=='bow')R.L={ty:'bow',el:0};else if(wt)R.R={ty:wt,el:-.45}}}catch(_){}
  if(R.L&&R.L.ty=='shield')R.L=null; // a shield sits on the forearm: that hand still holds the reins
  return R}
function lkrTick(dt,now,al){
  if(!riding||!mModel||!pl.bones)return lkrOff();
  const b=pl.bones,h=pl.children[0],S=LKR,t=now/1000;S.on=1;
  // seat: keep the hips on the saddle whatever the hero's height (look) is
  const ps=h.scale?h.scale.y:1,B=mModel.r&&mModel.r.b,bob=B?B.position.y*mModel.r.scale.y:0;
  h.position.y=mModel.seat[0]+bob+.05-.55*ps;
  // speed (tiles/s, smoothed) and the saddle's vertical speed for the rider's give
  const p=pl.position;if(S.last&&dt>0){const d=Math.hypot(p.x-S.last.x,p.z-S.last.z);if(d<3)S.spd+=(d/dt-S.spd)*Math.min(1,dt*6)}S.last={x:p.x,z:p.z};
  if(dt>0){const v=S.yb==null?0:(bob-S.yb)/dt;S.yb=bob;S.vy+=(v-S.vy)*Math.min(1,dt*14)}
  // spring: the torso lags the saddle (pitch) — critically damped toward the saddle's vertical speed
  if(dt>0){const k=90,c=2*Math.sqrt(k),tg=Math.max(-1,Math.min(1,S.vy*.9));S.sv+=(k*(tg-S.sp)-c*S.sv)*dt;S.sp+=S.sv*dt}
  const run=lkrSS(1.2,9,S.spd),mov=lkrSS(.2,1.2,S.spd),idle=1-mov;
  // ---- legs around the flanks ----
  const L=lkrSolve(mModel,ps),lp=L.p-.06*run,ls=L.s,ly=L.y,lk=L.k+.06*run,la=-(lp+lk)-.12;
  const sq=S.sp*.08;                                                // knees give a little with the bounce
  b.lh0.rotation.set(lp-sq,-ly,-ls);b.rh0.rotation.set(lp-sq,ly,ls);b.lh1.rotation.x=lk+sq*1.4;b.rh1.rotation.x=lk+sq*1.4;
  if(b.lh2){b.lh2.rotation.x=la;b.rh2.rotation.x=la}
  {const l0=b.lh0.userData.lk0,r0=b.rh0.userData.lk0;if(l0)b.lh0.position.x=l0.x-LKR_HIPW;if(r0)b.rh0.position.x=r0.x+LKR_HIPW}
  b.pelvis.rotation.z=0;
  if(HA.cur||pl.sw||hero.chan){if(b.aL0)b.aL0.rotation.y=0;return}
  // ---- torso and head ----
  const lean=.07+.13*run+.03*mov,give=S.sp*.12,sway=idle*Math.sin(t*.9)*.025;
  b.spine.rotation.x=lean+give;b.spine.rotation.y=idle*Math.sin(t*.55+1)*.05;b.spine.rotation.z=sway;
  if(b.pelvis)b.pelvis.rotation.y=0;
  b.head.rotation.x=-(lean+give)*.75-.02;b.head.rotation.y=idle*Math.sin(t/2.3)*.32+mov*Math.sin(t/3.1)*.08;
  // ---- arms ----
  const H=lkrHands(),rein=(a1,a2,side,two)=>{ // upper arm a little forward, elbows bent, hands low in front together
      const s=side=='L'?-1:1,bob2=S.sp*.1+(mov?Math.sin(t*6.5)*.015*mov:0);
      a1.rotation.x=-.42-.12*run+bob2;a1.rotation.y=-s*(two?.42:.55);a1.rotation.z=s*.12;a2.rotation.x=-.78-.1*run-bob2*.6};
  const carry=(a1,a2,side,c)=>{const B0=typeof GRIP_B!='undefined'?(GRIP_B[side]||-.5):(side=='L'?-.25:-.5),tot=B0+(c.el||0);
      a1.rotation.x=-.18-lean*.6;a1.rotation.z=(side=='L'?-1:1)*.14;if(side=='L')a1.rotation.y=0;else a1.rotation.y=0;a2.rotation.x=tot-a1.rotation.x-lean};
  const two=!H.L&&!H.R;
  if(H.R)carry(b.aR0,b.aR1,'R',H.R);else rein(b.aR0,b.aR1,'R',two);
  if(H.L)carry(b.aL0,b.aL1,'L',H.L);else rein(b.aL0,b.aL1,'L',two);
  if(b.aL2)b.aL2.rotation.x=H.L?0:-.25;if(b.aR2)b.aR2.rotation.x=H.R?0:-.25;
  // cape: streams back with speed
  if(b.cp0){const cv=Math.min(1,S.spd/8);b.cp0.rotation.x=.08+.45*cv+Math.sin(t*4.1)*.04*(.3+cv);b.cp1.rotation.x=.08+.5*cv+Math.sin(t*4.6+1)*.05*(.3+cv);b.cp2.rotation.x=.1+.55*cv+Math.sin(t*5.2+2)*.06*(.3+cv)}
}
function lkrOff(){
  if(!LKR.on)return;LKR.on=0;LKR.last=null;LKR.yb=null;LKR.spd=0;LKR.sp=LKR.sv=0;
  try{const b=pl.bones;b.aL0.rotation.y=0;b.lh0.rotation.y=0;b.rh0.rotation.y=0;b.lh0.rotation.z=0;b.rh0.rotation.z=0;b.spine.rotation.z=0;
    for(const n of ['lh0','rh0']){const o=b[n];if(o.userData.lk0)o.position.copy(o.userData.lk0)}
    const h=pl.children[0];h.position.y=0;h.position.z=0}catch(_){}}
{const f=mountTick;mountTick=function(dt,now,al){const r=f.apply(this,arguments);try{lkrTick(dt,now,al)}catch(e){if(!LKR.err){LKR.err=1;console.warn('riding pose',e)}}return r}}
{const f=dismount;dismount=function(){const r=f.apply(this,arguments);try{if(!riding)lkrOff()}catch(_){}return r}}
