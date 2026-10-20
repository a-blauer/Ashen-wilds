// ================= v101 anim: swings that read at game speed (timing, body drive, lunge) =================
// Why: v100 rebuilt the swing shapes, but the game played each swing in only ~190–340 ms with the wind-up squeezed into
// the first ~80–140 ms and the whole thing over long before the next swing was allowed (warrior: ~740 ms between swings).
// At the game camera that is a blur under the slash effect, so the new shapes looked the same as before.
// v101 keeps the v100 shapes and gameplay numbers (cooldowns, damage, ranges) but changes how a swing is played:
//  * wind-up: a longer, readable coil (hit lands up to ~100 ms later than before, scaled by weapon speed), with the
//    playback slow at the start of the coil and accelerating into contact;
//  * contact: the blade whips through, a short lunge carries the body into the blow (stopped by walls, off when mounted);
//  * follow-through + recovery: fills the time until the next swing is allowed (momentum carries past the target, then
//    settles), instead of snapping back to idle;
//  * the slash effect is a thinner, lighter band at the blade's reach so it no longer hides the body at contact;
//  * body: hip turn, chest twist, lean and knee bend are exaggerated so they show at the game camera on a phone.
// Only swingAnim (hero melee basic attacks) changes. Spins, bows, staffs/wands/orbs, skills and co-op partners are untouched.
var V100W={on:true,AMP:{sy:1.55,cy:1.6,py:1.6,sx:1.45,sz:1.4,dy:1.7,lk:1.35,rk:1.35,lh:1.3,rh:1.3,la:1.2,ra:1.2},
  EXTRA:.6,EXTRA_MAX:120,REC:1.1,LUNGE:.28,LUNGE_FIN:.5};
function V100W_pose(P,D,wind,rest){
  const A=V100W.AMP,o={},tc=wind/D;
  return function(u){
    let k;
    if(u<tc){const x=u/tc;k=.42*Math.pow(x,1.45)}                       // slow coil, accelerating into contact
    else{const y=(u-tc)/(1-tc);k=.42+.58*(1-Math.pow(1-y,1.7))}           // whip through, then a long settle
    const p=P(Math.min(1,Math.max(0,k)));
    for(const c in p){const a=A[c];o[c]=a&&rest[c]!=null?rest[c]+(p[c]-rest[c])*a:p[c]}
    return o}}
{const base=swingAnim;
swingAnim=function(st,ms,onHit){
  let P=null;try{P=atkPick(st|0)}catch(_){}
  if(!V100W.on||!P||!P.v100)return base.apply(this,arguments);
  try{atkMpSig()}catch(_){}
  ms=ms||300;
  const hit0=ms*.42,wind=hit0+Math.min(V100W.EXTRA_MAX,hit0*V100W.EXTRA),
    cd=atkCd>0?atkCd*1000:ms*2,D=Math.max(ms+wind-hit0,Math.min(cd*.9,wind+ms*V100W.REC)),
    fin=ms>=400||(pl.step&&pl.step.t>=.16);
  haPlay(D,V100W_pose(P,D,wind,ATK_REST),wind/D,onHit,.1);
  const A=HA.cur;if(!A)return;
  // lunge into the blow: from shortly before contact to shortly after
  const L=(fin?V100W.LUNGE_FIN:V100W.LUNGE),u0=Math.max(0,(wind-90)/D),u1=Math.min(1,(wind+70)/D);let done=0;
  A.tick=function(u){
    try{if(typeof riding!='undefined'&&riding)return;if(u<u0||done>=1)return;
      const t=Math.min(1,(u-u0)/(u1-u0)),s=t*t*(3-2*t),dd=(s-done)*L;done=s;if(dd<=0)return;
      const ry=pl.rotation.y,nx=pl.position.x+Math.sin(ry)*dd,nz=pl.position.z+Math.cos(ry)*dd;
      if(typeof solid=='function'&&(solid(nx,nz)||solid(nx+Math.sin(ry)*.35,nz+Math.cos(ry)*.35)))return;
      pl.position.x=nx;pl.position.z=nz}catch(_){}}}}
// the slash arc: a thinner, lighter band out at the blade's reach, so the body's swing still shows through it
slashFx=function(d,st,rg){
  const g=new THREE.Group(),col=st==2?0xffe0a0:0xf2ead8,m=new THREE.Mesh(new THREE.RingGeometry(rg*.74,rg*1.0,28,1,st==2?.35:-1.05,st==2?2.4:2.1),addMat(col));
  m.material.opacity=.5;g.add(m);g.position.copy(gY(pl.position,st==2?.15:.85));const yaw=Math.atan2(d.x,d.z);
  if(st==2){m.rotation.y=Math.PI/2;g.rotation.y=yaw;m.position.y=0}else{m.rotation.x=-Math.PI/2;g.rotation.y=yaw-Math.PI/2;g.rotation.z=st?-.18:.18}
  scene.add(g);const s0=st==1?-1:1;
  tw(st==2?240:180,k=>{m.material.opacity=.5*(1-k)*(1-k);if(st<2)m.rotation.z=s0*(.6-k*.9);else m.rotation.x=-.4+k*.6;g.scale.setScalar(.9+k*.18)},()=>{scene.remove(g);m.geometry.dispose()})};
