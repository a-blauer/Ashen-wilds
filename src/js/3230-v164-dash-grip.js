// ================= v164: a dash never turns the weapon in the hand =================
// Owner (Oct 27 2026): "after sprinting the halberd is turned the wrong way briefly, it corrects itself after a few seconds".
// The dash's quick tuck (haDodge, 0740) plays through the same action slot as an attack (HA.cur), so the grip (1270, 3220) took it
// for a swing: the hands went to the strike grip, edge163Plan worked out an "edge roll" from the tuck's arm motion (the halberd:
// ~176°, blade backwards) and, the tuck counting as an attack, the strike hold was kept for EDGE163.hold (2 s) afterwards. Every
// edged weapon, the bow, crossbow, mace and wand turned 40-150° the same way. Measured by test/v164_dodge_grip.py.
// Now the tuck is marked as movement (HA.cur.mv164) and, for the grip only, the hero is not in an action while it plays: out of a
// fight the weapon stays in the carry grip; in a fight (right after an attack, a monster hunting nearby) it keeps the strike grip
// and the roll it already had. The tuck's pose, timing and i-frames are unchanged.
{const f=haDodge;haDodge=function(){const r=f.apply(this,arguments);try{if(HA.cur)HA.cur.mv164=1}catch(_){}return r}}
function mv164(){return !!(typeof HA!='undefined'&&HA.cur&&HA.cur.mv164)}
{const f=gripTick;gripTick=function(h,now,el,att){
  if(h!==pl||!mv164())return f.apply(this,arguments);
  const A=HA.cur,sw=pl.sw;HA.cur=null;pl.sw=hero.chan?1:0;
  try{return f.call(this,h,now,el)}finally{HA.cur=A;pl.sw=sw}}}   // the hold is worked out again without the tuck
