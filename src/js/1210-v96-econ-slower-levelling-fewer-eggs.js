// ================= v96 econ: slower levelling, fewer eggs =================
// XP ×0.75 (ECON96.xp) on every source of hero XP:
//  * kills (monsters, elites, Sovereigns, camp/dungeon mobs, wave-trial mobs): the factor is in gainXP (build/pN_econ.py).
//    gainXP hands the same amount to the two active companions, so they slow down by the same 25% and stay level with you.
//  * bounty-board rewards: bReward is wrapped, so the offer text, the "Bounty complete" popup and the XP given all agree.
//  There are no other XP sources (quests/events/dungeon clears pay gold, items and bounty progress, not XP).
// Eggs ×0.6 more (ECON96.egg): EGG92.rate .65 → .39 of the original chance. It covers the same eggs as v92 (every random
//  egg through drop(), and the bounty-board egg via EGG92.rate); the Sovereign kill egg, Bestiary milestone eggs and shop
//  eggs stay guaranteed.
// v112: XP cut by another 75% (×.25 of the v96 rate): .75 → .1875
var ECON96={xp:.1875,egg:.6,egg0:null};
if(typeof EGG92!='undefined'){ECON96.egg0=EGG92.rate;EGG92.rate=Math.round(EGG92.rate*ECON96.egg*1e4)/1e4}

