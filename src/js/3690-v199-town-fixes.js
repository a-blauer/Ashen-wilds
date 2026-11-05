// ================= v199: the town portals answer again; the inn's bar comes down =================
// Owner (Nov 4 2026): "In the tavern, the bar is too tall and covers the bartender" · "I can't interact with the portals in town. I walk up to
// the kindlelight portal and no prompt comes up".
//  * Portals: since v196 the portal rooms count as Duskhold (townAt takes in the meadow, its paths and the rooms), and promptTick only asks
//    worldPrompt (which holds portalPrompt and the v196 seal prompt) outside a town, so standing at a portal showed nothing. In Duskhold the
//    portal and the seal prompts now come first in the town prompts (townPortalPrompt). Co-op: prompts are local; portal unlocks follow the
//    shared progress (bossDone) as before.
//  * The bar (3640 dm196InnK) is built lower in 3640 itself: its top stood ~1.25 above the floor, chest high on the ~1.5 tall folk, so the
//    innkeeper behind it was hidden; now ~.85 (DM196I.barTop; the innkeeper's head is at ~1.1), with the tap and mugs moved down onto it.
function dm199SealPrompt(){const P=pl.position;for(const S of DM196P.seal){if(!S||S.open)continue;if(Math.hypot(P.x-S.x,P.z-S.z)<3.4){const i=S.i;
    return {label:'🔒 Portal '+['I','II','III','IV','V','VI'][i]+' is sealed · defeat '+BOSSES[i-1].name+' in '+PMAP[i-1].n,fn:()=>openX('bosses')}}}return null}
{const f=townPortalPrompt;townPortalPrompt=function(T){if(T&&T===TOWNS[0]){try{const r=portalPrompt()||dm199SealPrompt();if(r)return r}catch(e){console.warn('v199 portal prompt',e)}}return f.apply(this,arguments)}}
