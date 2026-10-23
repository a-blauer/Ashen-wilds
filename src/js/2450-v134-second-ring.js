// ================= v134: a second ring slot =================
// SLOTS (0110) has 'ring2'; ring items (sl 'ring') fit either ring slot. Equipping a ring from the bag fills the first empty ring
// slot (both full: it swaps with the first); dragging it onto a ring slot puts it in that one (RING134.to, 1670). Everything that
// walks SLOTS (stats, set bonuses, tooltips, the forge tab, saves) sees the second ring; the paper doll shows it under the boots.
var RING134={to:null};
function eqSlot134(it){const sl=itT(it).sl;if(sl!=='ring')return sl;const to=RING134.to;RING134.to=null;if(to==='ring'||to==='ring2')return to;
  if(!eq.ring)return 'ring';if(!eq.ring2)return 'ring2';return 'ring'}
