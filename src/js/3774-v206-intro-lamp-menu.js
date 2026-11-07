// ================= v206: no town tour in the intro, a brighter floating lantern, the menu over the quest list =================
// Owner (Nov 7 2026):
//  1. "Remove cinematic that introduces townfolk in duskhold. It is now outdated." After "Begin your journey", part two of the
//     intro (3081) no longer walks the town meeting the Steward, Innkeeper, Blacksmith, Merchant and Cheddar (55.9–93.8 s): it
//     starts at IC151.p2From, just before the voice ("Greetings, Upright…") over the town and the six portals, out of black
//     (IC151.p2Fade s). The score's notes before that are left out (3081 osc). The whole film ('all': tests, the video) is unchanged.
//  2. "Improve the characters floating lamp light's visibility by 40%." While the floating lantern (FLAN, 1380) is out, its
//     light (torch) is FLAN206.k times as bright and reaches FLAN206.d times as far, and its glow (halo) is a little larger.
//  3. "The menu screen is blocked by the quest list. Make sure that when the menu button is pressed it goes over the quest list."
//     The quest trackers (UI161_TRK: main quest, Cheddar, …) sit in the page body at z-index 6 and the menu (#sysmenu, in the
//     stage) at 4, in the same spot under the minimap. While the menu is open the trackers step aside (body.sm206) and the menu
//     is lifted above them.
IC151.p2From=93.8;IC151.p2Fade=1.4;
function ic151P2From(){return IC151.p2From>IC151.cut?IC151.p2From:IC151.cut}
{const f=ic151Dom;ic151Dom=function(S,t){const r=f.apply(this,arguments);try{const D=S&&S.dom,a=ic151P2From();if(D&&IC151.mode==='p2'&&a>IC151.cut){
  D.fk.style.opacity=(1-ic151K(t,a,a+IC151.p2Fade)).toFixed(3);if(t<a+.5&&D.sub)D.sub.innerHTML=''}}catch(_){}return r}}

// ---------------- the floating lantern's light ----------------
var FLAN206={k:1.4,d:1.15,halo:1.15};
{const f=atmos;atmos=function(dt,now){const r=f.apply(this,arguments);try{if(typeof FLAN!='undefined'&&FLAN.root&&FLAN.root.visible){torch.intensity*=FLAN206.k;torch.distance*=FLAN206.d;
  if(FLAN.halo)FLAN.halo.scale.multiplyScalar(FLAN206.halo)}}catch(_){}return r}}   // flanStep sets the glow's size fresh every frame

// ---------------- the menu over the quest trackers ----------------
function sm206Sync(){try{const sm=$('sysmenu'),on=!!sm&&!sm.classList.contains('hide')&&!!sm.offsetParent;document.body.classList.toggle('sm206',on)}catch(_){}}
try{new MutationObserver(sm206Sync).observe($('sysmenu'),{attributes:true,attributeFilter:['class','style']})}catch(_){}
setInterval(sm206Sync,500);
(function(){const ids=(typeof UI161_TRK!='undefined'?UI161_TRK:[]).concat(['mqt143','mqt152','fs160','dr170h','chqt132']).filter((v,i,a)=>a.indexOf(v)==i);
  document.head.insertAdjacentHTML('beforeend','<style id="sm206css">#sysmenu{z-index:30!important}'+ids.map(id=>'body.sm206 #'+id).join(',')+'{visibility:hidden!important}</style>')})();
