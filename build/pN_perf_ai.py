# --- perf_ai --- (v98) level of detail for the enemy update in the main loop (runtime: src/modules/zzN_perf_ai.js).
# 1. Before the enemy loop: aiLodFrame(dt) (frame counter, camera frustum) and keep the frame's dt as dtAI.
# 2. Enemies that the loop skips (not drawn, no co-op partner near) are put to sleep: aiSleep(e,1) stops three.js from
#    recomputing their bone matrices every frame (they are hidden, nothing draws them). Same early-return rule as before.
# 3. After the health bar update, `const dt=aiLod(e,dpl,dtAI)` shadows the frame's dt for the rest of that enemy's update:
#    the full frame dt for enemies that must stay exact, the dt accumulated since its last update when its turn comes
#    round, or -1 = skip this frame (staggered by a per-enemy phase).
rep("""  const safeP=townAt(pl.position.x,pl.position.z,0)>=0;
  enemies.slice().forEach(e=>{""","""  const safeP=townAt(pl.position.x,pl.position.z,0)>=0;const dtAI=dt;aiLodFrame(dtAI);
  enemies.slice().forEach(e=>{""")
rep("""    if((!m.visible&&!mpAct(e))||e.dead)return;
    e.hb.position.set(m.position.x,m.position.y+(e.boss?5.5:e.c.al?2.4:1.6),m.position.z);e.hb.quaternion.copy(cam.quaternion);
    const r=Math.max(.001,e.c.h/M(e.c));e.hb.fill.scale.x=r;e.hb.fill.position.x=-(1-r)/2;
""","""    if(!m.visible&&!mpAct(e)){aiSleep(e,1);return}aiSleep(e,0);if(e.dead)return;
    e.hb.position.set(m.position.x,m.position.y+(e.boss?5.5:e.c.al?2.4:1.6),m.position.z);e.hb.quaternion.copy(cam.quaternion);
    const r=Math.max(.001,e.c.h/M(e.c));e.hb.fill.scale.x=r;e.hb.fill.position.x=-(1-r)/2;
    const dt=aiLod(e,dpl,dtAI);if(dt<0)return;
""")
