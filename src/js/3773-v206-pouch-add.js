// ================= v206: the food pouch's "Add food" button =================
// Owner (Nov 7 2026): "Add a button in the companion food pouch where you can add food from your inventory into the pouch."
// The v200 pouch (3704) only showed small "+1 / +5" icon buttons, and only for food you carried. Now the pouch has one clear
// "＋ Add food" button (and each empty slot is one too): it opens a list of every companion food in your bag with its name, how
// many you carry, what it heals, and +1 / +5 / All buttons. With none in the bag the list says where to cook it.
// cf200Html is replaced here (its only caller is the rC0 wrapper in 3704); cf200Put / cf200Take and the click handler stay.
var CF206={open:false};
cf200Html=function(c){};
// open / close the list (capture: before the pouch's own handler, which ignores these buttons)
$('cd').addEventListener('click',e=>{const t=e.target.closest('[data-cf206]');if(!t)return;e.stopImmediatePropagation();CF206.open=!CF206.open||t.classList.contains('cf206e');try{rC()}catch(_){}},true);
document.head.insertAdjacentHTML('beforeend',`<style id="cf206css">
#cd .cf206h{display:flex;align-items:center;justify-content:space-between;gap:8px}
#cd .cf206b{padding:3px 10px;font-size:.74rem;min-height:0;white-space:nowrap}
#cd .cf206b.on{border-color:#c9a24a;color:#f0cc72}
#cd button.cf200x.cf206e{cursor:pointer;font:inherit;font-size:.72rem;color:var(--mut);padding:0;min-height:0}
#cd button.cf200x.cf206e:hover{opacity:.9;color:#f0cc72;border-color:#c9a24a}
#cd .cf206l{display:flex;flex-direction:column;gap:4px;margin:4px 0 2px;padding:6px;border:1px solid rgba(201,162,74,.35);border-radius:7px;background:rgba(0,0,0,.28)}
#cd .cf206r{display:flex;align-items:center;gap:6px}
#cd .cf206i{font-size:1.15rem;width:24px;text-align:center}
#cd .cf206t{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.15}#cd .cf206t b{font-size:.78rem}#cd .cf206t small{font-size:.66rem;color:var(--mut)}
#cd .cf206r button{padding:2px 8px;font-size:.72rem;min-height:0}
#cd .cf206n{font-size:.72rem;padding:2px}
</style>`);
