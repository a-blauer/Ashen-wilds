// ================= v135: no "Continue" needed after an egg hatches =================
// Once the hatch show has finished ("It hatched!"), the Companions & Eggs window works again straight away: clicking a
// companion or an egg in the list (or hatching the next ready egg) ends the reveal. Eggs still queued from the same batch are
// already in your party, so they are simply listed instead of each playing its show. Continue / Next egg still work as before.
function hatch135Free(){if(!CE.hat||!CE.hat.done)return false;const L=[...hq].map(h=>h.c);CE.hat=null;hq.length=0;hAct=false;
  try{$('cvw').classList.remove('hatching')}catch(_){}if(L.length)try{say('🥚 Also hatched: '+L.map(c=>nm(c)).join(', ')+'.')}catch(_){}return true}
{const f=$('cl').onclick;$('cl').onclick=function(e){try{if(CE.hat&&CE.hat.done&&e.target.closest('button'))hatch135Free()}catch(_){}return f.apply(this,arguments)}}
