# v91 fix track: small owner-requested fixes (see README "v91: fix" and src/modules/zzN_fix.js).
# Argus eye-stalk gaze cone (zzK_den0.js arStalk): 40% of its old opacity in every state (waking sweep and open gaze).
# The cone is the only user of these two lines; SEEN / MARKED do not touch the cone's material.
rep("T.fan.material.opacity=.05+.07*(Math.sin(now/70)*.5+.5);","T.fan.material.opacity=arFanK()*(.05+.07*(Math.sin(now/70)*.5+.5));")
rep("T.fan.material.opacity=.3+.06*Math.sin(now/90);","T.fan.material.opacity=arFanK()*(.3+.06*Math.sin(now/90));")
rep("const fan=d01Fan(20,0xffe060,.3);","const fan=d01Fan(20,0xffe060,.3*arFanK());")
# zone map (N, zzzzz_fish.js openWMap): a camp is green when it is cleared for this zone run, not just for 45 s (campCleared in zzN_fix.js)
rep("cl=nowP()-(C.kt||-1e9)<45000;","cl=campCleared(C);")
