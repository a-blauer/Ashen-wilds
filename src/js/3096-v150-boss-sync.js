// ================= v150: co-op Sovereigns stay in step =================
// v110 relays every move the boss driver picks (BMV 'sv<i>_<move>' with its seed) and the boss's spot every 200 ms; each
// partner plays the move on its own copy. The copies drifted apart: between moves a partner's boss turned to face that
// partner (not where the driver's boss faced), and a move started from wherever the copy happened to stand, so a lunge or
// a leap ended somewhere else on each screen and the next move began from there.
//  · Every relayed cast now carries the boss's spot and facing at the start of the move (extra fields, older pages ignore
//    them); the partner's copy starts the move from exactly there (moved straight there when it is within BS150.snap tiles,
//    otherwise it already jumps through the regular sync).
//  · Between moves a partner's copy faces the way the driver's boss faces (BS150.turn rad/s) and glides to the synced spot.
//  · The spot sync runs every BS150.ms ms (was 200).
var BS150={snap:14,turn:5,ms:120};
function bs150Co(e){try{return typeof MP!='undefined'&&MP.on&&MP.others>0&&e&&e.sv&&AF&&AF.i===e.ar}catch(_){return false}}
// the driver: stamp the boss's pose on the relayed cast
{const f=svCast;svCast=function(e,id,seed){const n0=MP.evq.length;const r=f.apply(this,arguments);
  try{if(bs150Co(e)&&svAuth(e)){const m=e.m;for(let j=n0;j<MP.evq.length;j++){const q=MP.evq[j];if(Array.isArray(q)&&q[0]==='b'&&q[1]===e.sv.i&&q.length<=4){q[4]=mpR2(m.position.x);q[5]=mpR2(m.position.z);q[6]=mpR2(m.rotation.y)}}}}catch(_){}
  return r}}
// a partner: start the relayed move from the driver's pose
{const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&Array.isArray(d.l))for(const q of d.l.slice(0,60)){
    if(!Array.isArray(q)||q[0]!=='b'||!isFinite(q[4])||!isFinite(q[5]))continue;const i=q[1];if(!(AF&&AF.i===i)||msg.peer!==mpBossAuth(i))continue;
    const e=bossEnt(i);if(!e||e.dead||!e.sv)continue;const m=e.m,dd=Math.hypot(m.position.x-q[4],m.position.z-q[5]);
    if(dd<BS150.snap){m.position.x=+q[4];m.position.z=+q[5];if(isFinite(q[6]))m.rotation.y=+q[6];e.nx=+q[4];e.nz=+q[5];if(isFinite(q[6]))e.nry=+q[6]}}}catch(err){console.warn('v150 boss sync',err)}
  return f.apply(this,arguments)}}
// a partner between moves: the driver's facing and spot
{const f=svAI;svAI=function(e,dt,now){if(!bs150Co(e)||svAuth(e))return f.apply(this,arguments);const m=e.m,ry0=m.rotation.y;const r=f.apply(this,arguments);
  try{const S=e.sv;if(!S.mv&&!S.rmOn&&e.nry!=null&&!e.dead){m.rotation.y=ry0;const da=svAng(e.nry-ry0),t=BS150.turn*dt;m.rotation.y+=Math.max(-t,Math.min(t,da));
      if(e.nx!=null){const dx=e.nx-m.position.x,dz=e.nz-m.position.z,l=Math.hypot(dx,dz);if(l>10){m.position.x=e.nx;m.position.z=e.nz}else if(dt>0){const k=Math.min(1,dt*6);m.position.x+=dx*k;m.position.z+=dz*k}}}}catch(_){}
  return r}}
// a quicker spot sync
{const f=mpSendBS;mpSendBS=function(now){if(AF&&now-MP.tB>=BS150.ms)MP.tB=Math.min(MP.tB,now-200);return f.apply(this,arguments)}}
