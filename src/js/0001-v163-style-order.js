// ================= v163: the page's own stylesheet goes first =================
// On claude.ai the published page is wrapped in an outer page: everything in index.html, its <head> included, ends up inside
// the outer page's <body>. The game's main stylesheet then sits AFTER every <style> the game adds to <head> while it runs, so
// for rules of equal weight the old base rules won on the live site (and only there: tests load the page directly). That is
// what broke the v161 phone layout live (the hotbar wrapped into one tall column, the touch buttons were pushed up to the top):
// the base `body.mob #acts{flex-wrap:wrap}` beat v161's `nowrap`, and none of v161's sizes applied.
// This runs before any other game code and moves the page's stylesheets (and the fonts link) into <head>, in their order, so
// everything added later comes after them, exactly as when the page is opened on its own.
(function(){try{const h=document.head;if(!h)return;
  document.querySelectorAll('body style,body link[rel=stylesheet]').forEach(s=>h.appendChild(s))}catch(_){}})();
