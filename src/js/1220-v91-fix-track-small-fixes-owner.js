// ================= v91 fix track: small fixes the owner asked for =================
// 1. Argus eye-stalk gaze cone: 40% of its old opacity (build/pN_fix.py multiplies both opacity lines in zzK_den0.js by arFanK()).
// 2. Camps on the zone map (N) stay green once cleared, for the rest of that zone run.
//    Old bug: the map coloured a camp green only while nowP()-C.kt < 45 s (the pre-v72 respawn timer), so it went red again
//    after 45 seconds although the zone roster keeps camp mobs dead; C.kt was also wiped by rosterBuild and never saved, so
//    a recall run / save-load showed every camp red. Now the camp's roster slots decide: every slot of that camp dead =
//    cleared. The slots (with their dead flags) are what a recall run (INST) saves and restores, so the green state comes
//    back with the run, and a restarted zone instance (new roster, mobs back) shows the camps red again.
//    Co-op guests (no roster of their own) fall back to C.clr, set on the kill that clears the camp (same rule as campOnKill).
function arFanK(){return .4}
function campCleared(C){if(!C)return false;
  try{if(typeof ROST!='undefined'&&ROST.r===C.pm&&ROST.slots&&ROST.slots.length){let n=0,a=0;for(const s of ROST.slots)if(s.camp===C){n++;if(!s.dead)a++}if(n)return a===0}}catch(_){}
  return !!C.clr}
{const f=rosterBuild;rosterBuild=function(r){const o=f.apply(this,arguments);try{CAMPS.forEach(C=>{if(C.pm===r)C.clr=false})}catch(_){}return o}}
{const f=kill;kill=function(e){const C=e&&e.camp,r=f.apply(this,arguments);try{if(C&&!C.raid&&e.leader!==C&&campAlive(C)===0)C.clr=true}catch(_){}return r}}

