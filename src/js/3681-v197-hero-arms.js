// =====================================================================================================
// v197 the hero's empty hand hangs relaxed (owner, Nov 4 2026: "When an arm isn't equipped with a weapon it also has the
// issue of being staticly bent").
// Why: every hero is a beast race (v114). Its empty arm got the gait's base elbow (-.25, 0890 `le` / `ex`) plus the race's
// posture elbow `D.pose.el` (rat -.6, raven -.5, weasel -.5, cat / badger -.3), added to BOTH forearms by brPoseOff; nothing
// ever posed a hand that holds nothing, so it stayed folded 40-55 degrees whatever the hero did; walking the elbow only
// changed with speed, never with the swing.
// Now, for a side with nothing registered in the hand (no `_grip` entry on that side), outside attack / ability poses and
// never while riding:
//   * the race's elbow is taken off again (kept in part while running, where a bent elbow is natural);
//   * walking and running: the elbow bends as the arm swings forward and opens as it swings back (forwardness measured from the
//     shoulder's swing against its own slow average, so it follows every race's and class's swing);
// Written through brAddR, so the v114 layer's exact undo (brUndo) takes it off before the next frame.
// Partners: their heroes run the same animHero on the guest's machine (0520) with their gear registered (gripReg), so they
// get the same relaxed hand; nothing random.
// =====================================================================================================
var RLX197H={on:true,keep:.55,flex:.34,base:.06,open:.3,run:[2.4,5]};
function rlx197HEmpty(H,sd){const G=H._grip;if(!G||!G.L)return true;return !G.L.some(e=>e.side==sd&&e.W&&e.W.parent)}
function rlx197HArms(H,D,now){const b=H.bones;if(!b||!b.aL1||!b.aR1)return;
  const S=H._rlxH||(H._rlxH={t:null,m:{L:null,R:null}}),dt=S.t==null?0:Math.min(.1,Math.max(0,((now||0)-S.t)/1000));S.t=now||0;
  const arm=H._brS?Math.max(0,Math.min(1,H._brS.a)):1;if(arm<.02){S.m.L=S.m.R=null;return}
  const G=H._ga,w=Math.max(0,Math.min(1,G?G.w:(H.mvW||0))),v=G?G.v||0:0,R0=RLX197H.run,run=v<=R0[0]?0:v>=R0[1]?1:(v-R0[0])/(R0[1]-R0[0]);
  const P=D.pose||{},Rn=D.run||{},el=(P.el||0)+(Rn.el||0)*(H._brS?H._brS.w:w);
  ['L','R'].forEach(sd=>{if(!rlx197HEmpty(H,sd)){S.m[sd]=null;return}
    const u=b['a'+sd+'0'],x=u.rotation.x;let m=S.m[sd];if(m==null)m=x;m+=(x-m)*Math.min(1,dt/.6);S.m[sd]=m;
    // cancel most of the race's elbow (less while running); then the swing: forward (x below its average) bends the elbow
    const fw=Math.max(-1,Math.min(1,(m-x)/.22)),flex=(-(RLX197H.base+RLX197H.flex*Math.max(0,fw))+RLX197H.open*run*Math.max(0,-fw))*w; // running: the elbow also opens on the back swing (the arm pumps)
    const off=(-el*(1-RLX197H.keep*run)+flex)*arm;if(Math.abs(off)>1e-5)brAddR(H,'a'+sd+'1','x',off)})}
// placed right after the v114 race layer (its last step calls brTailAnim), so every later arm layer (the Whirlwind's two-hand
// hold, fishing, gathering, drilling, the raven's wand IK, the v195 follow-through) still has the last word
{const f=brTailAnim;brTailAnim=function(H,D,b,now,w){const r=f.apply(this,arguments);
  try{const rid=H===pl&&typeof riding!='undefined'&&!!riding;if(RLX197H.on&&D&&H&&H.bones&&!H._foe&&!rid)rlx197HArms(H,D,now)}catch(e){if(!RLX197H.err){RLX197H.err=1;console.warn('v197 hero arms',e)}}return r}}
