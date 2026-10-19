# v96 econ (exec'd by pV11 with the shared h/rep): hero XP ×0.75 on every kill.
# gainXP (b_logic.js + pV6/v92 combat factors) gives the same xp to the hero and the two active companions, so
# companions are slowed by the same 25% and keep pace with the hero. ECON96.xp lives in src/modules/zzN_econ.js.
rep("xp*=.6375*(e&&e.wv?.315:1);","xp*=.6375*(typeof ECON96!='undefined'?ECON96.xp:1)*(e&&e.wv?.315:1);")
