# v92 combat (exec'd by pV11 with the shared h/rep): poise rules for enemy wind-ups, wave-trial XP ×0.6.
# 1) heroHit (t_combat.js) break test: was "any ability hit, or one hit >= 6% max health, during a special wind-up";
#    now any wind-up (basic or special) breaks only when its accumulated poise damage reaches the threshold (cbBreakChk in zzN_combat.js).
rep("const wasWind=e.atk&&e.atk.ph==0&&!EBASIC[e.atk.n],h0=e.c.h;","const wasWind=e.atk&&e.atk.ph==0,h0=e.c.h;")
rep("if(wasWind&&!e.dead&&!e.boss&&e.atk&&((s&&!s.basic)||(h0-e.c.h)>=M(e.c)*.06)){","if(wasWind&&!e.dead&&!e.boss&&e.atk&&cbBreakChk(e)){")
# 2) combo finishers (b_logic.js swing + zzA_arsenal.js wMelee): heavy hit — interrupts normal mobs, extra poise damage on elites
rep("hits.forEach(e=>{if(!e.boss&&!e.dead&&!e.c.al){mCancel(e);e.cd=Math.max(e.cd,1)}})","hits.forEach(e=>cbHeavy(e))",2)
# 3) wave-trial kills: XP ×0.6 on top of the old factor (.6375 × .525 → .6375 × .315)
rep("xp*=.6375*(e&&e.wv?.525:1);","xp*=.6375*(e&&e.wv?.315:1);")
