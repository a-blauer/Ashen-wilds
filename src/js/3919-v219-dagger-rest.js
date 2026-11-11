// ================= v219: daggers held clear of the body (owner, Nov 10 2026) =================
// Owner: "When using emberkiss daggers- they rest incorrectly and they phase into the assassin's body"
// Daggers (every dagger pair, Emberkiss among them) rest in the v93 carry grip (1270 GRIP.dagger): tipped .6 forward and leaning
// neither way, so standing and walking the blades crossed the forearms and slid into the chest and hips. They now rest a little more
// upright (t .45) and lean out away from the body (rl −.45, mirrored for the left hand: DR219): both blades stand clear of the arms,
// chest and legs at rest and on the move. Attacks use the strike grip as before. Partners build the same grip from the same table.
// Heroes only (the player, partners, previews): humanoid foes keep their own dagger grip (their strike tracks were tuned on it).
var DR219={t:.45,rl:-.45,foe:0};
{const f=gripCarry;gripCarry=function(ty,side){if(ty==='dagger'&&!DR219.foe){const G=GRIP.dagger,t=G.t,rl=G.rl;G.t=DR219.t;G.rl=DR219.rl;try{return f.apply(this,arguments)}finally{G.t=t;G.rl=rl}}return f.apply(this,arguments)}}
{const f=mkHumanoid;mkHumanoid=function(){DR219.foe++;try{return f.apply(this,arguments)}finally{DR219.foe--}}}
{const f=gripReg;gripReg=function(h){const foe=!!(h&&h._grHum);if(foe)DR219.foe++;try{return f.apply(this,arguments)}finally{if(foe)DR219.foe--}}}
