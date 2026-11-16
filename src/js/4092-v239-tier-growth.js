// ================= v239 every companion tier gains the same per level (owner, Nov 16 2026) =================
// "Make each tier gain the same amount per level": cStat's growth multiplier GM is 1 for every tier (0210; was 1 + 0.2 per tier above 1).
// The tier still raises the starting stats (TM, 1 + 0.55 per tier). Enemies carry their own c.st and never use this formula.
// A companion saved before v239 can carry more health than its new maximum: trim it when the game loads.
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{(party||[]).forEach(c=>{if(c&&c.g&&!c.st&&c.h>M(c))c.h=M(c)})}catch(e){console.warn('v239 load',e)}return r}}
