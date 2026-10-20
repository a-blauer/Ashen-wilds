// ================= v98 perf_ai: level of detail for the enemy update =================
// The zones doubled their mobs (35–60 live enemies around the player). The main loop updated every drawn enemy every frame
// (AI, wander, health bar, eTick, animation + the v93 idle layer) and three.js recomputed the bone matrices of every
// enemy in the scene every frame, drawn or not. Now (patch: build/pN_perf_ai.py):
//  1. Update rate by distance (AIL.r1/r2): calm world mobs (roster/camp/wild, not aggroed) nearer than AIL.r1 (25 tiles)
//     update every frame; farther drawn ones every AIL.n2-th frame, every AIL.n3-th when also off-screen. Enemies take
//     turns (a fixed random phase each), so the cost is spread evenly; a skipped frame's dt is saved and handed over on
//     the enemy's next update (capped at AIL.maxDt), so wander speed, timers and DoTs stay correct.
//     Always every frame: bosses, aggroed or attacking enemies, your target, arena minions/den parts, wave-trial and
//     dungeon mobs, co-op mirrors, stunned/rooted/knocked-back/burning/alarm-running ones, anyone hit in the last 2 s,
//     and anything within AIL.r1 of a co-op partner. Aggro checks (≤ 6 tiles) are therefore unchanged.
//  2. Off-screen pose skip: an enemy whose bounding sphere is outside the camera frustum skips animC (pose, gait,
//     skeleton, idle layer) — its AI still runs. Animation code is time based, so it resumes in step.
//  3. Sleeping enemies: an enemy the loop already skips (not drawn: > 30 tiles, no co-op partner near) no longer has
//     its bone matrices recomputed by scene.updateMatrixWorld; hidden health bars neither. Matrices are recomputed the
//     frame it wakes (before the render), and getWorldPosition() still works on a sleeping one.
// AIL.on=false turns all of it off (every enemy every frame, like before). AIL.st counts updates/skips for tests.
var AIL={on:true,r1:25,r2:50,n2:2,n3:3,maxDt:.2,hitMs:2000,f:0,cull:true,sleep:true,
  st:{full:0,lod:0,skip:0,anim0:0,sleepN:0},fr:null,pm:null,sp:null};
function aiLodFrame(dt){AIL.f++;
  try{if(!AIL.fr){AIL.fr=new THREE.Frustum();AIL.pm=new THREE.Matrix4();AIL.sp=new THREE.Sphere()}
    cam.updateMatrixWorld();AIL.pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);AIL.fr.setFromProjectionMatrix(AIL.pm);AIL.frOk=1}
  catch(_){AIL.frOk=0}}
// is the model's body inside the camera view (last frame's camera; generous radius)
function aiInView(m){if(!AIL.frOk)return true;const s=AIL.sp;s.center.set(m.position.x,m.position.y+1,m.position.z);s.radius=2.6*Math.max(1,m.scale.x||1);return AIL.fr.intersectsSphere(s)}
// must this enemy update every frame?
function aiMust(e){
  if(e.boss||e.agg||e.atk||e===tgt||e.minion||e.ar!=null||e.wv||e.dun||e.mir||e.dprop||e.bfx||e.ev||e.leader||e.raid)return true;
  if(!(e.slot||e.camp||e.wild))return true;
  if(e.alarm||e.stun>0||e.root>0||e.frz>0||e.hid||(e.dots&&e.dots.length))return true;
  if(Math.abs(e.vx||0)+Math.abs(e.vz||0)>.05)return true;
  if(e.m.flT&&performance.now()-e.m.flT<AIL.hitMs)return true;
  return false}
// distance to the nearest hero (local or co-op partner)
function aiNearD(e,dpl){let d=dpl;if(typeof MP!='undefined'&&MP&&MP.on&&MP.others){const p=e.m.position;for(const k in MP.rh){const q=MP.rh[k];if(q&&q.act&&q.m){const x=Math.hypot(q.m.position.x-p.x,q.m.position.z-p.z);if(x<d)d=x}}}return d}
// returns the dt this enemy should be updated with this frame, or -1 to skip it
function aiLod(e,dpl,dt){const m=e.m;
  const inV=!AIL.on||!AIL.cull||e.boss||!m.visible||aiInView(m);
  m._aiNA=!inV&&m.visible;if(m._aiNA)AIL.st.anim0++;
  if(!AIL.on||!(dt>0)){return dt}
  let k=1;
  if(!aiMust(e)){const d=aiNearD(e,dpl);if(d>=AIL.r1)k=(d>=AIL.r2||!inV)?AIL.n3:AIL.n2}
  if(k<=1){const a=e._aiAcc||0;e._aiAcc=0;AIL.st.full++;return a?Math.min(AIL.maxDt,dt+a):dt}
  if(e._aiPh==null)e._aiPh=(Math.random()*60)|0;
  e._aiAcc=(e._aiAcc||0)+dt;
  if((AIL.f+e._aiPh)%k){AIL.st.skip++;return -1}
  const a=Math.min(AIL.maxDt,e._aiAcc);e._aiAcc=0;AIL.st.lod++;return a}
// pose skip for off-screen enemies (outermost animC wrapper is fine: the flag is set by aiLod only on enemy models)
{const f=animC;animC=function(g,now,mv,sp){if(g&&g._aiNA&&AIL.on)return;return f.apply(this,arguments)}}
// sleeping: skip scene.updateMatrixWorld for hidden enemy models / health bars
function aiUmw(o,needSleep){if(!o||o._aiU)return;o._aiU=1;const P=o.updateMatrixWorld;
  o.updateMatrixWorld=function(force){if(AIL.on&&AIL.sleep&&!this.visible&&this.matrixAutoUpdate&&(!needSleep||this._aiS)){AIL.st.sleepN++;return}return P.call(this,force)}}
function aiSleep(e,s){const m=e.m;if(!m._aiU){aiUmw(m,true);aiUmw(e.hb,false)}m._aiS=s;if(s){m._aiNA=false}}

