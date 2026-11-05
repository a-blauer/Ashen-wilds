// ================= v200: the Hatchery is the only place eggs hatch =================
// Owner (Nov 5 2026): "make the hatchery the only place where you can hatch eggs. No more hatching from inventory. Players
// should start with a hatchery in their town. It should start with 3 slots and eggs take 8 minutes to hatch in there.
// Upgrades … increase likelihood of shiny and rare variants like it does now but also provide more hatching slots and
// decrease time to hatch by a minute each time."
//  * An egg in your bag waits. Set it in a Hatchery slot (F at the Hatchery) and it hatches in EGG_T (8 / 7 / 6 / 5 minutes
//    at Hatchery level 0-3, 0530 shApply). Slots: 3 + level. The egg stays in `eggs` with e.ht = 1 and e.t0 = when it was set in.
//    Real time: it keeps hatching while you are away. eggRdy (0490) needs e.ht; every egg display reads ht200P / ht200Txt.
//  * Hatching (the usual animation, hatchEgg in 0570) only runs from the Hatchery window (HT200.go); a ready egg clicked
//    anywhere else just says where to go. Shiny / rare chances are rollRare's (0530): +0.5% shiny and +1% rare per level.
//  * Taking an egg back out returns it to your bag and its progress is lost.
//  * Older saves (no x2.ht200): eggs that were already warming in the bag fill the slots in order (keeping their progress);
//    the rest wait in the bag.
// Co-op: personal (your eggs, your save); the slot count follows the Hatchery level of the kingdom you see.
var HT200={go:0};
function ht200N(){return 3+kdLv('hatch')}
function ht200In(){return eggs.filter(e=>e&&e.ht)}
function ht200P(e){return e&&e.ht&&e.t0?Math.max(0,Math.min(1,(Date.now()-e.t0)/EGG_T)):0}
function ht200Txt(e){if(!e||!e.ht)return '🥚 Set it in the Hatchery (Duskhold) to hatch it';return eggRdy(e)?'✨ Ready! Hatch it at the Hatchery':'In the Hatchery · '+st200Clock(EGG_T-(Date.now()-(e.t0||Date.now())))}
// keep the slots honest: every slot egg has a start time, never more slot eggs than slots
function ht200Norm(){let ch=0;const L=ht200In().sort((a,b)=>(a.t0||0)-(b.t0||0)),n=ht200N();
  L.forEach((e,i)=>{if(i>=n&&!st200Guest()){delete e.ht;delete e.t0;ch=1}else if(!e.t0){e.t0=Date.now();ch=1}});return ch} // a guest in a smaller Hatchery keeps its eggs
{const f=hatchCheck;hatchCheck=function(){try{ht200Norm()}catch(_){}return f.apply(this,arguments)}}
// hatching only at the Hatchery
{const f=hatchEgg;hatchEgg=function(id){if(!HT200.go){const e=eggs.find(q=>q.id==id);
    try{say(e&&e.ht?'🥚 That egg is ready: hatch it at the Hatchery in Duskhold.':'🥚 Eggs hatch in the Hatchery in Duskhold: set this one in a slot there.')}catch(_){}return}
  return f.apply(this,arguments)}}
function ht200Set(id){const e=eggs.find(q=>q.id==id);if(!e||e.ht)return;if(ht200In().length>=ht200N())return say('🥚 Every Hatchery slot is taken.');
  e.ht=1;e.t0=Date.now();try{sfx('chime')}catch(_){}say('🥚 The '+e.sp+' egg is warming in the Hatchery: ready in '+Math.round(EGG_T/60000)+' minutes.');try{saveGame(true)}catch(_){}rX()}
function ht200Out(id){const e=eggs.find(q=>q.id==id);if(!e||!e.ht)return;delete e.ht;delete e.t0;try{eggNote.delete(e.id)}catch(_){}say('🥚 The egg is back in your bag (its warmth is lost).');rX()}
function ht200Hatch(ids){const L=ids.filter(id=>{const e=eggs.find(q=>q.id==id);return e&&eggRdy(e)});if(!L.length)return;closeX();HT200.go=1;
  try{L.forEach(id=>hatchEgg(id))}finally{HT200.go=0}}
function ht200Card(e){const rd=eggRdy(e),p=ht200P(e),rc=RAR[e.tier][1];
  return `<div class="s200-card" style="--rc:${rc}"><div class="s200-ic ht200-egg${rd?' rdy':''}" style="color:${rc}">🥚</div><div class="s200-t"><b>${en(e)}</b><small data-ht200t="${e.id}">${ht200Txt(e)}</small></div>
    <div class="s200-bar"><i data-ht200b="${e.id}" style="width:${(p*100).toFixed(1)}%"></i></div>
    <div class="s200-btns">${rd?`<button class="pri" data-ht200h="${e.id}">🐣 Hatch</button>`:''}<button data-ht200o="${e.id}" title="Back to your bag (its progress is lost)">Take out</button></div></div>`}
XR.hatch200=function(){const l=kdLv('hatch'),N=ht200N(),In=ht200In().sort((a,b)=>(a.t0||0)-(b.t0||0)),bag=eggs.filter(e=>e&&!e.ht).sort((a,b)=>b.tier-a.tier||(b.pa||1)-(a.pa||1));
  $('xwT').textContent='🥚 Hatchery';$('xwS').textContent=In.length+' / '+N+' slots in use · eggs hatch in '+Math.round(EGG_T/60000)+' minutes';
  const rdy=In.filter(eggRdy);let h=st200Head('hatch');
  h+=`<div class="s200-sec">Slots${rdy.length>1?` <button class="pri" data-ht200all="1" style="margin-left:8px;font-size:.7rem">🐣 Hatch all ${rdy.length}</button>`:''}</div><div class="s200-grid">`;
  for(let i=0;i<N;i++)h+=In[i]?ht200Card(In[i]):'<div class="s200-card empty"><div class="s200-ic" style="opacity:.45">🥚</div><div class="s200-t"><b>Empty slot</b><small>Set an egg from your bag below</small></div></div>';
  h+='</div><div class="s200-sec">Your eggs ('+bag.length+')</div>';
  const full=In.length>=N;
  h+=bag.length?`<div class="s200-pick">${bag.map(e=>`<button data-ht200s="${e.id}" ${full?'disabled':''} style="--rc:${RAR[e.tier][1]}"><span class="s200-ic" style="color:${RAR[e.tier][1]}">🥚</span><span>${en(e)}<small>${full?'All slots are taken':'Set it in a slot'}</small></span></button>`).join('')}</div>`
    :'<div class="s200-note">No eggs in your bag. They drop from monsters, elites and Sovereigns, and some shops sell them.</div>';
  $('xwB').innerHTML=h;$('xwF').innerHTML='<span class="mut dtl">Eggs only hatch here. They keep warming while you are away. Upgrade the Hatchery at the Stronghold Steward: one more slot, one minute faster and a better shiny / rare chance per level.</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='hatch200')return;const t=e.target.closest('[data-ht200s],[data-ht200o],[data-ht200h],[data-ht200all]');if(!t||t.disabled)return;const d=t.dataset;
  if(d.ht200s)ht200Set(+d.ht200s);else if(d.ht200o)ht200Out(+d.ht200o);else if(d.ht200h)ht200Hatch([+d.ht200h]);else ht200Hatch(ht200In().map(q=>q.id))});
// timers tick while the window is open (a slot that becomes ready redraws for its Hatch button)
setInterval(()=>{try{if(xwMode!='hatch200'||$('xw').classList.contains('hide'))return;let redraw=false;
  ht200In().forEach(e=>{const t=document.querySelector('#xw [data-ht200t="'+e.id+'"]'),b=document.querySelector('#xw [data-ht200b="'+e.id+'"]');if(t)t.textContent=ht200Txt(e);if(b)b.style.width=(ht200P(e)*100).toFixed(1)+'%';
    if(eggRdy(e)&&!document.querySelector('#xw [data-ht200h="'+e.id+'"]'))redraw=true});if(redraw)rX()}catch(_){}},1000);
ST200.open.hatch=()=>openX('hatch200');
// older saves: eggs already warming in the bag move into the slots
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.ht200=1;return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{if(!(s&&s.ht200)){const n=3+(Math.min(3,(s&&s.sh&&s.sh.hatch)|0));
    eggs.filter(e=>e&&e.t0&&!e.ht).sort((a,b)=>a.t0-b.t0).forEach((e,i)=>{if(i<n)e.ht=1;else delete e.t0})}
  ht200Norm()}catch(e){console.warn('v200 hatchery load',e)}return r}}
document.head.insertAdjacentHTML('beforeend',`<style id="ht200css">
#xw .ht200-egg{font-size:2rem;text-shadow:0 0 8px currentColor}#xw .ht200-egg.rdy{animation:ht200w 1.1s ease-in-out infinite}
@keyframes ht200w{0%,100%{transform:rotate(0)}25%{transform:rotate(-9deg)}75%{transform:rotate(9deg)}}
</style>`);
