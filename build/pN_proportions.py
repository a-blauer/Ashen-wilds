# v99 proportions: realistic humanoid proportions baked into the rest pose (src/modules/p0_proportions.js).
# The module must run before the first humanoid is built (the hero `pl`, town folk while the towns are built), so it
# is put at the very top of the main script instead of the usual splice before the talBtn marker.
_mod=open(M+'p0_proportions.js').read()
rep("<script>\nvar DK=1.35,DKY=1.15;","<script>\n"+_mod+"var DK=1.35,DKY=1.15;")
# enemy health bars clear the taller humanoid heads (top of a realistic human ≈ 1.47 × model scale)
rep("e.hb.position.set(m.position.x,m.position.y+(e.boss?5.5:e.c.al?2.4:1.6),m.position.z);",
    "e.hb.position.set(m.position.x,m.position.y+(e.boss?5.5:e.c.al?2.4:m.isHum?Math.max(1.6,(m.bs||1)*1.62):1.6),m.position.z);")
