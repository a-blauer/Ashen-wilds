# v100 anim track: the hero/humanoid walk layer (zzI_anim.js animHero) also feeds the new pose channels (spine side-bend,
# chest twist, hip yaw, ankles, off-arm roll, wrist deviation) so attack tracks can drive them and they blend back to the
# walk afterwards. The ankle values the walk computes are kept (they are now written through the channel).
# Runs inside build/pV11.py with the shared `h` and `rep`. See src/modules/zzN_zz_anim.js.
rep("sy:sA*.14*w,sx:lean,py:-sA*.09*w,hx:-lean*.45,ay:0,lw:0,rw:0,lk:kL,rk:kR,dy:0,hy:",
    "sz:0,cy:0,lhy:0,rhy:0,ly:0,rz:0,lq:0,la:b.lh2?b.lh2.rotation.x:0,ra:b.rh2?b.rh2.rotation.x:0,sy:sA*.14*w,sx:lean,py:-sA*.09*w,hx:-lean*.45,ay:0,lw:0,rw:0,lk:kL,rk:kR,dy:0,hy:")
# humanoid foes: pass the model to humAtkPose so v100 can pick the foe's weapon-specific strike (zzI_anim.js v85 wrapper)
rep("const P=humAtkPose(a.n,a.ph,a.k,now),b=h.bones,mw=h._ga?h._ga.w:0;","const P=humAtkPose(a.n,a.ph,a.k,now,g),b=h.bones,mw=h._ga?h._ga.w:0;")
