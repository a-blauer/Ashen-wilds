// ================= v223 the Magic Shop's evolution preview shows the hero again =================
// Owner: "The magic shop evolved ability animation preview has the character model missing from the animation."
// Why: the v119 preview lends the real hero model (`pl`) to its training stage. The Magic Shop is a v221 keeper view, and that
// view hides the hero (`pl.visible=false`) so the keeper is seen alone — but the hero it hid was the one standing on the
// preview stage, so the evolved ability played with nobody casting it. (The Abilities window is not a keeper view: fine.)
// A second slip of the same kind: a preview that started before the view hid the hero gave the world back a visible hero
// when it stopped (switching to Reforge / Wares), standing in front of the keeper.
// Fix: right after each view step, while the view hides the hero, the hero is shown when it is on the preview stage and
// hidden when it is in the world. Nothing else changes: companions stay hidden, the view ends as before (im220End).
{const f=im220Tick;im220Tick=function(){const r=f.apply(this,arguments);
  try{if(IM220.on&&IM220.hid&&typeof pl!='undefined'&&pl){const st=typeof ABX!='undefined'&&ABX.on&&ABX.root&&abxOnStage(pl);pl.visible=!!st}}catch(_){}
  return r}}
