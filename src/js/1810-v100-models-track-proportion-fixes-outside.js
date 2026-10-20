// ================= v100 models track: proportion fixes outside the mounts =================
// Held weapons were sized for the pre-v99 hero (body 1.1 units); with the realistic hero (body ≈1.46) a greatsword was
// longer than the hero is tall (1.6), a halberd 2.0, a dagger 40% of body height. One-handed / two-handed melee weapons
// are scaled about the grip (the model origin), so every grip, carry pose, strike track and flail chain still lines up.
// Bows (riser/string constants), crossbows, slings, wands, orbs, claws and shields keep their size.
var MDL100_WS={sword:.86,gs:.8,ga:.86,axe:.9,axes:.9,mace:.86,hammer:.86,club:.9,flail:.86,dagger:.78,knives:.78,halberd:.88,staff:.9,spear:.9};
{const f=mkWpn;mkWpn=function(type,col,r){const g=f.apply(this,arguments);
  try{const k=MDL100.on&&MDL100_WS[type];if(k&&g&&g.children&&!g.userData.mdlS){g.userData.mdlS=k;g.children.forEach(c=>{c.position.multiplyScalar(k);c.scale.multiplyScalar(k)})}}catch(e){}
  return g}}
// Ashwolf family (Ashwolf, Direfang, Skollmaw, Snow Wolf): the hanging tail was as long as the body and as thick as the
// torso. Real wolf tails are ~1/3 of body length and slim at the root: 20% shorter, 28% slimmer (same bones and weights).
(function MDL100_wolfTail(){try{if(typeof WOLF_TAIL=='undefined')return;WOLF_TAIL.forEach(r=>{r[0]=-.33+(r[0]+.33)*.8;r[2]*=.72});
  for(const k in LPG)if(/^Ashwolf\|/.test(k))delete LPG[k]}catch(e){console.warn('v100 wolf tail',e)}})();

