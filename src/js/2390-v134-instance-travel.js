// ================= v134: the Duskhold portal at an instance's entrance opens the travel window =================
// Walking back to the portal at the start of a field instance or a Den used to send you straight to Duskhold. Now F there opens
// the zone's travel window (the same list as the zone's gate in Duskhold: every instance you have reached) with the instance you are in marked, plus "Return to Duskhold". Mode 'portal134' (its own click handler).
function port134Home(){const P=pl.position;for(const r of RPORT){if(r.k!=='home'||!r.g.visible)continue;if(Math.hypot(P.x-r.x,P.z-r.z)<2.2)return r}return null}
{const f=worldPrompt;worldPrompt=function(){try{const r=port134Home();if(r)return {label:'F · Travel: '+PMAP[r.pi].n+' or Duskhold',fn:()=>openX('portal134',r.pi)}}catch(_){}return f.apply(this,arguments)}}
XR.portal134=()=>{XR.portal();const i=xwArg|0,I=curIns();
  // the instance you are standing in: no Enter button, a "you are here" tag instead
  try{if(I&&I.z===i&&!I.tri){const b=$('xwB').querySelector(`[data-pgo="map"][data-pk="${I.k}"]`);if(b){const s=document.createElement('span');s.className='mut';s.textContent='📍 You are here';b.replaceWith(s)}}}catch(_){}
  const R=$('xwB').querySelector('.rows');if(R)R.insertAdjacentHTML('beforeend',`<div class="rw"><span class="rn">🏰 <b>Duskhold</b><small>Return to the stronghold.</small></span><span class="ra"><button class="pri" data-p134="home">Return</button></span></div>`);
  $('xwF').innerHTML='<span class="mut dtl">Choose where to go: another instance of this zone, or home to Duskhold.</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='portal134')return;const i=xwArg|0;
  if(e.target.closest('[data-p134="home"]')){closeX();goHome();return}
  const b=e.target.closest('[data-pgo]');if(!b)return;closeX();if(b.dataset.pgo=='map')enterMap(i,+b.dataset.pk||0);else waveStart(i)});
