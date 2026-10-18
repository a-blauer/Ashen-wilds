# --- sands (v89): Ssith'ra animation (the rig itself is src/modules/zzN_sands.js) ---
# exposed / stuck: the rig plays its own slack or straining pose, so drop the whole-body roll shiver and sink for it
rep("m.b.rotation.z=Math.sin(now/70)*.05;m.b.position.y-=.18","if(!m._ssr){m.b.rotation.z=Math.sin(now/70)*.05;m.b.position.y-=.18}")
# its corpse curls, rolls over and sinks into the sand before it shrinks (on the game clock, only for that model)
rep("setTimeout(()=>shrink(e.m,()=>removeE(e)),260)","(e.m._ssDead?(f=>tw(1500,()=>{},f)):(f=>setTimeout(f,260)))(()=>shrink(e.m,()=>removeE(e)))",2)
