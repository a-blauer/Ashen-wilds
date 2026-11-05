// ================= v200: Stable upgrades open the next tier of mounts =================
// Owner (Nov 5 2026): "For stables, have the upgrades be the next tier of mount. Make the upgrades just cost wood stone and plant
// fiber — not gold." A new Stable sells Tier 1 and 2 mounts; levels 1 / 2 / 3 open Tiers 3 / 4 / 5 (owner's choice).
// Costs and level texts are in 3700 (shpCost109 / shpFx109); the Stable has no discount any more (shpP109).
// Co-op: the Stable's level is the kingdom's (the host's while you play together).
function stb200Max(){return Math.min(5,2+shpL109('stable'))}
function stb200Need(T){return Math.max(0,T-2)}
// buying a locked tier is refused (capture: runs before the v3 buy handler)
$('xw').addEventListener('click',e=>{if(xwMode!='stable')return;const t=e.target.closest('[data-mbuy]');if(!t)return;const D=MOUNTS[t.dataset.mbuy];if(!D||D.t<=stb200Max())return;
  e.stopImmediatePropagation();e.preventDefault();say('🔒 Tier '+D.t+' mounts need the Stable at level '+stb200Need(D.t)+' (upgrade it at the Stronghold Steward).')},true);
{const f=XR.stable;XR.stable=function(){const r=f.apply(this,arguments);try{const B=$('xwB'),mx=stb200Max();if(!B)return r;
  B.querySelectorAll('[data-mbuy]').forEach(b=>{const D=MOUNTS[b.dataset.mbuy];if(D&&D.t>mx){b.disabled=true;b.textContent='🔒 Stable Lv '+stb200Need(D.t);b.title='Upgrade the Stable at the Stronghold Steward to sell Tier '+D.t+' mounts'}});
  B.querySelectorAll('.sec').forEach(s=>{const m=/^Tier (\d)/.exec(s.textContent.trim());if(m&&+m[1]>mx&&!s.querySelector('.stb200'))s.insertAdjacentHTML('beforeend',' <span class="stb200" style="color:#f0a0a0;text-transform:none;letter-spacing:0">· 🔒 Stable level '+stb200Need(+m[1])+'</span>')});
  B.querySelectorAll('[data-msel]').forEach(rw=>{const D=MOUNTS[rw.dataset.msel];if(D&&D.t>mx)rw.classList.add('stb200-lk')});
  B.querySelectorAll('.kqm-cell').forEach(c=>{const I=c._kq,k=I&&I.r&&I.r.dataset.msel,D=k&&MOUNTS[k];if(!D||D.t<=mx)return;c.classList.add('stb200-lk');const sl=c.querySelector('.kqm-slot');if(sl&&!sl.querySelector('.stb200b'))sl.insertAdjacentHTML('beforeend','<span class="stb200b">🔒</span>')})}catch(e){console.warn('v200 stable',e)}return r}}
document.head.insertAdjacentHTML('beforeend','<style id="stb200css">#xw .stb200-lk{opacity:.55}#xw .stb200b{position:absolute;top:1px;right:2px;font-size:.7rem}</style>');
