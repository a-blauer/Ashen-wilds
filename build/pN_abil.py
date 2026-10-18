# v90 abilities track: ability ranks 1-5 (src/modules/zzN_abil.js has kqrP/kqrU/kqrC/kqrD/kqrB and the UI).
# Runs inside build/pV11.py with the shared `h` and `rep`.
# --- ranks: one place per cast path where the attack value is computed, so every hit / DoT / shot / zone / summon of the cast scales ---
# old kinds (SKB + v71 SKX) in cast_base
rep("raw=atkOf(mt)*(sk.m||0)*(1+s.skillP)","raw=atkOf(mt)*(sk.m||0)*(1+s.skillP)*kqrP(sk)")
rep("hero.sh=heroMax()*sk.v*(1+s.shieldP)","hero.sh=heroMax()*sk.v*(1+s.shieldP)*kqrP(sk)")
rep("case 'heal':healHero(heroMax()*sk.v)","case 'heal':healHero(heroMax()*sk.v*kqrP(sk))")
rep("case 'buff':hero.buffs.push({s:sk.buff,","case 'buff':hero.buffs.push({s:kqrB(sk,sk.buff),")
rep("t.markV=sk.v","t.markV=sk.v*kqrU(sk)")
# cooldowns (old cast_base and the v88 cast wrapper)
rep("sk.cd*(1-Math.min(.5,s.cdr))","sk.cd*kqrC(sk)*(1-Math.min(.5,s.cdr))",2)
# the 50 v88 abilities: c.A (and c.raw = c.A × m) carry the rank
rep("A=atkOf(mt)*(1+s.skillP)","A=atkOf(mt)*(1+s.skillP)*kqrP(sk)")
rep("const c={sk,i,key,s,","const c={rk:kqrP(sk),sk,i,key,s,")
# v88 abilities with fixed heal / buff numbers
rep("{paP:.2,dr:.15,regen:.02}","kqrB(c.sk,{paP:.2,dr:.15,regen:.02})")            # War Banner
rep("{s:{as:.25,paP:.1,ls:.1}","{s:kqrB(c.sk,{as:.25,paP:.1,ls:.1})")               # Bloodrage
rep("{s:{dr:.3},t:KQS.unbrk","{s:kqrB(c.sk,{dr:.3}),t:KQS.unbrk")                   # Unbreakable
rep("healHero(heroMax()*.15)","healHero(heroMax()*.15*c.rk)")                        # Unbreakable end heal
rep("healHero(heroMax()*.025)","healHero(heroMax()*.025*c.rk)")                      # Beacon of Light
rep("{dr:.35}","kqrB(c.sk,{dr:.35})")                                                 # Sanctuary
rep("healHero(heroMax()*.03)","healHero(heroMax()*.03*c.rk)")                        # Penance
rep("{s:{basicP:.35,maP:.15,ls:.06}","{s:kqrB(c.sk,{basicP:.35,maP:.15,ls:.06})")   # Seal of Light
rep("healHero(heroMax()*.1*dt,true)","healHero(heroMax()*.1*dt*c.rk,true)")          # Divine Intervention
rep("{crit:.25,cdm:.3}","kqrB(c.sk,{crit:.25,cdm:.3})")                               # Eclipse
rep("{s:{mspd:.2,compP:.2}","{s:kqrB(c.sk,{mspd:.2,compP:.2})")                     # Wild Hunt
# pure utility lasts longer per rank
rep("KQS.stealth=c.now+c.sk.dur*1000","KQS.stealth=c.now+c.sk.dur*kqrD(c.sk)*1000")                         # Vanish
rep("kqsObj({life:c.sk.dur,tick:(dt,now)=>{[A,B]","kqsObj({life:c.sk.dur*kqrD(c.sk),tick:(dt,now)=>{[A,B]")    # Rift Gate
rep("kqsObj({life:c.sk.dur,tick:(dt,now,o)=>{const a1=","kqsObj({life:c.sk.dur*kqrD(c.sk),tick:(dt,now,o)=>{const a1=")  # Time Warp
# --- ability points: 2 per level, 3 on every 5th level ---
rep("+1 ability point (K)'","+'+kqrLvAP(hero.lvl)+' ability points (K)'")
rep("Earn 1 ability point every level","Earn 2 ability points every level (3 every 5th level), rank abilities up to 5")
# --- balance (v90) ---
# class-resource empower (Rage/Faith/Combo/Focus/Arcane at 50+): stacked on top of every skill multiplier it reached ×1.9; now up to ×1.5
rep("s:{skillP:.9*pw/100,aoeP:.45*pw/100}","s:{skillP:.5*pw/100,aoeP:.3*pw/100}")
rep("'EMPOWERED ×'+(1+.9*pw/100)","'EMPOWERED ×'+(1+.5*pw/100)")
rep("up to ×1.9 damage","up to ×1.5 damage")
# paladin bonus to basic attacks and skills grew +1.1% per level (+75% at level 50, the strongest basic attack in the game); now +12% +0.4% per level
rep("const pb=.2+.011*hero.lvl","const pb=.12+.004*hero.lvl")
# Eviscerate: +45% per Combo point and an always-critical hit at 5 points made one cast worth ~10 basic hits; now +25% per point
rep("const k=1+.45*c.pips","const k=1+.25*c.pips")
rep("+45% damage per point (5 points: ×3.25, always critical)","+25% damage per point (5 points: ×2.25, always critical)")
