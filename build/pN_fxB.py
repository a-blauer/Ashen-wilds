# v91 fxB track: one hook in the old cast_base so Shockwave, Judgment, Hammer of Light and Arcane Missiles get their own
# visuals/animation/homing (src/modules/zzN_fxB.js, fxbCast). Mana, cooldown and the attack value are still computed by cast_base.
# Runs inside build/pV11.py with the shared `h` and `rep`.
rep("  switch(sk.k){\n    case 'cone':arc(P,d,sk.col,Rr,320);",
    "  switch(typeof fxbCast=='function'&&fxbCast(sk,P,d,raw,mt,fx,s,Rr)?'_fxb':sk.k){\n    case 'cone':arc(P,d,sk.col,Rr,320);")
