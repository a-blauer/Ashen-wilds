// ================= v223 menu fixes (owner, Nov 11 2026) =================
// "Dont show floating item mockup to the left when in inventory, and dont show mount icon to left when in stable - we have an
// actual 3d visual for the stable that works better for that."
//  * the v222 floating item (3951 IP222) no longer shows beside the plain Inventory (#bag) or the Stable window (xwMode
//    'stable', which already shows the mount itself in 3D). It still shows in shops and at the forge (#bag in the smith's
//    keeper view, class sk220), where it floats in front of the keeper.
// "Remove the shop button inside the menu - it doesnt make sense to have it there when we have a npc to interact with":
//  * the ☰ menu's 🛒 Shop button is hidden (2200 hides Fusion and Sovereigns the same way); the shops are opened at their keepers.
function ip223Skip(){try{
  const bag=$('bag');if(bag&&!bag.classList.contains('hide')&&!bag.classList.contains('sk220')&&!bag.classList.contains('sk220v'))return true;
  const xw=$('xw');if(xw&&!xw.classList.contains('hide')&&typeof xwMode!='undefined'&&xwMode==='stable')return true}catch(_){}
  return false}
{const f=ip222Pick;ip222Pick=function(){if(ip223Skip())return null;return f.apply(this,arguments)}}
{const b=$('shopBtn');if(b)b.style.setProperty('display','none','important')}
