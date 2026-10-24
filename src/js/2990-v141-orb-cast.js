// ================= v141: the orb attack - hand held out, the orb floating over the palm, the bolt leaves the orb =================
// The orb's basic attack used to coil the left arm and throw it forward (ATK.orb), so the Mage swung his orb like a ball.
// Now the raven keeps his orb hold (FC116 palm hold) through the attack instead of fading it out: the arm reaches straight out in
// front (ORB141.ext, from the shoulder: out, fwd, down), the orb lifts off the palm and bobs there while it fires, and the bolt
// starts at the orb. The body only leans in a little (a calm ATK.orb track). Other heroes holding an orb get the same arm
// motion from the track (left arm forward and level) without the palm hold.
var ORB141={t0:-1e9,d:0,ext:[.15,.48,.02],lift:.035,bob:.012};
ATK.orb=atkTrack([[0,ATK_REST],
  [.22,atkEyes({sx:-.07,sy:-.12,lx:-1.45,lz:.12,le:-.12,lw:.2,ax:-.25,ex:-.45,hx:-.05,lk:.1,dy:-.015}),'out'],
  [.62,atkEyes({sx:-.08,sy:-.14,lx:-1.5,lz:.1,le:-.1,lw:.25,ax:-.25,ex:-.45,hx:-.06,lk:.1,dy:-.015}),'lin'],
  [1,ATK_REST,'io']]);
{const f=staffAnim;staffAnim=function(ms){try{if(atkWT()=='orb'){ORB141.t0=performance.now();ORB141.d=Math.max(200,ms||600)}}catch(_){}return f.apply(this,arguments)}}
// how far into the orb attack (0 = not attacking; the attack's own progress, HA.cur.k); ease in over the first 20%, out over the last 25%
function orb141K(){const A=typeof HA!='undefined'&&HA.cur;if(!A||A.pose!==ATK.orb)return 0;const t=A.k;if(!(t>=0&&t<1))return 0;const e=x=>x*x*(3-2*x);return t<.2?e(t/.2):t>.75?e((1-t)/.25):1}
{const f=fc116Apply;fc116Apply=function(H){
  const W=H&&(H.gearG||[]).find(o=>o&&o.userData&&o.userData.wt=='orb'),k=H===pl&&W?orb141K():0;if(!k)return f.apply(this,arguments);
  const C=FC116.H.orb,h0=C.hand,S=H._brS,a0=S?S.a:1;
  try{C.hand=h0.map((v,i)=>v+(ORB141.ext[i]-v)*k);if(S)S.a=Math.max(a0,k);f.apply(this,arguments)}finally{C.hand=h0;if(S)S.a=a0}
  // the orb floats upright a little above the palm while the attack lasts (placed in the world: whatever the wrist does)
  try{const b2=H.bones.aL2,Fp=fc117Frame(H,'aL2');if(Fp&&W.parent===b2){const V=THREE.Vector3,Q=THREE.Quaternion;H.updateMatrixWorld(true);
    const palm=Fp.palm.clone().addScaledVector(Fp.c,Fp.thick*.6).applyMatrix4(b2.matrixWorld),f2=fc140Fwd(H),Qw=new Q().setFromAxisAngle(new V(0,1,0),Math.atan2(f2.x,f2.z));
    const bq=b2.getWorldQuaternion(new Q()),ws=W.getWorldScale(new V()),bb=fc117WB(W),foot=new V(bb.c.x,bb.min.y,bb.c.z).multiply(ws).applyQuaternion(Qw);
    const up=(ORB141.lift+ORB141.bob*Math.sin(performance.now()/90))*fc140Scale(H),wpos=palm.clone().add(new V(0,up,0)).sub(foot);
    const lq=bq.clone().invert().multiply(Qw),lp=wpos.applyMatrix4(new THREE.Matrix4().copy(b2.matrixWorld).invert());
    W.quaternion.slerp(lq,k);W.position.lerp(lp,k);
    if(H._fc116)H._fc116.w.forEach(r=>{if(r.o===W){r.set=W.quaternion.clone();r.ps=W.position.clone()}});H.updateMatrixWorld(true)}}catch(e){if(!ORB141.err){ORB141.err=1;console.warn('orb141',e)}}}}
// the orb's world position (for the bolt); null when no orb is in hand
function orb141Pos(){try{const W=(pl.gearG||[]).find(o=>o&&o.userData&&o.userData.wt=='orb');if(!W)return null;W.updateWorldMatrix(true,true);
  const b=new THREE.Box3().setFromObject(W);if(b.isEmpty())return null;return b.getCenter(new THREE.Vector3())}catch(_){return null}}
// the first bolt of the chain leaves the orb (a short glow there), the jumps go on from enemy to enemy as before
orbChain=function(e0,raw){let cur=e0,from=pl.position.clone();const hit=new Set(),op=orb141Pos();
  for(let j=0;j<4&&cur;j++){hit.add(cur);const a=j==0&&op?op:gY(from,1);if(j==0&&op){try{burst(op,0x9ad8ff,8,.6,.5,.25)}catch(_){}}
    bolt(a,gY(cur.m.position,.8),0x9ad8ff);heroHit(cur,raw*(j?WB127.orbJump:WB127.orbFirst),'m',{s:{col:0x9ad8ff,basic:j?0:1},proc:j==0});from=cur.m.position.clone();
    cur=enemies.filter(e=>!e.dead&&!hit.has(e)&&d2(e.m.position,from)<5.5).sort((a,b)=>d2(a.m.position,from)-d2(b.m.position,from))[0]}};
