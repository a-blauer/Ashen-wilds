// ================= v86: Sovereign dens — each boss fights in its own themed lair with its own mechanics =================
// The old round stone arena (painted floor, rune ring, braziers, standing stones) is removed. Each boss index i can register
// DEN[i] = {
//   build(A)            build the den's scenery into A.g (called once at load, after every den file is spliced)
//   start(A,e)          the fight begins (the den is sealed)
//   tick(A,e,dt,now)    every frame while the fight runs (hazards, gaze, cold, quicksand, ...)
//   ai(A,e,dt,now)      optional: runs before the boss AI each frame; return true to skip the default AI this frame
//   clear(A,won)        the fight ends (won = boss died) — remove hazards, reset state
//   seal(A,on)          optional: show/hide the den's own seal (default: the glowing wall A.wall)
// }
// The playable area stays a circle of radius ARENA_R (14) around A.cx/A.cz; dens dress it up and may add obstacles
// (use denBlock(x,z) for solid tiles so the hero and enemies collide, denUnblock to remove).
var DEN=[];
// solid tiles placed by dens (collision via MAP 'r' like other rocks; kept in a set so they can be removed)
var DENB=new Set();
function denBlock(x,z){x=Math.round(x);z=Math.round(z);if(!MAP[z])return;if(MAP[z][x]==='.'||MAP[z][x]==='g'||MAP[z][x]==='a'||MAP[z][x]==='p'){DENB.add(z*W+x);MAP[z][x]='R'}}
function denUnblock(x,z){x=Math.round(x);z=Math.round(z);const k=z*W+x;if(DENB.has(k)){DENB.delete(k);MAP[z][x]='a'}}
// remove the old arena dressing (keep the seal wall)
function denStrip(A){A.g.children.slice().forEach(o=>{if(o!==A.wall)A.g.remove(o)});A.fx0=[]}
ARN.forEach(A=>{try{denStrip(A)}catch(e){console.error('den strip',A.i,e)}});
// the boss's own ground ring stays (it marks the boss); the den's floor tint is up to each den
function denBuildAll(){ARN.forEach(A=>{const D=DEN[A.i];if(D&&D.build){try{D.build(A)}catch(e){console.error('den build',A.i,e)}}})}
// ---- hooks into the arena flow ----
{const f=arenaStart;arenaStart=function(A,e){const r=f.apply(this,arguments);const D=DEN[A.i];
  if(D){try{if(D.seal){A.wall.visible=false;D.seal(A,true)}D.start&&D.start(A,e)}catch(err){console.error('den start',A.i,err)}}return r}}
{const f=arenaClear;arenaClear=function(A){const D=DEN[A.i],e=bossEnt(A.i),won=!e||e.dead;try{D&&D.clear&&D.clear(A,won);if(D&&D.seal)D.seal(A,false)}catch(err){console.error('den clear',A.i,err)}
  const r=f.apply(this,arguments);if(D&&D.seal)A.wall.visible=false;return r}}
{const f=arenaTick;arenaTick=function(dt,now){f.apply(this,arguments);const A=AF;if(!A)return;const D=DEN[A.i];if(!D||!D.tick)return;const e=bossEnt(A.i);if(!e)return;try{D.tick(A,e,dt,now)}catch(err){console.error('den tick',A.i,err)}}}
{const f=bossAI;bossAI=function(e,dt,now){const A=arenaOf(e),D=A&&DEN[A.i];
  // during a den fight the big boss bar at the top shows its health; the floating 3x bar over the boss only blocks the view
  if(A&&A.f&&e.hb)e.hb.visible=false;
  if(D&&D.ai&&A.f){try{if(D.ai(A,e,dt,now))return}catch(err){console.error('den ai',A.i,err)}}const r=f.apply(this,arguments);if(A&&A.f&&e.hb)e.hb.visible=false;return r}}

