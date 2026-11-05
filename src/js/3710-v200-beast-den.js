// ================= v200: the Beast Den is an essence altar =================
// Owner (Nov 5 2026): "make the beast den an area where you can sacrifice companions for essence. This companion essence can be
// used to reroll your current companions traits and give it a chance to become shiny or a rare variant. Doing this will not
// change its base stats — it will only increase them if it becomes shiny or a rare variant by the normal amount. Higher tier
// companions would yield more essence. Higher tier companions should cost more to reroll as well. Shiny and rare variant rolls
// should still be hard to get here."
//  * Sacrifice: a reserve companion (not locked, not in your team, not training) becomes essence: DEN200.Y[tier] × (1 + level/100)
//    × (1.25 per evolution) × (3 shiny / 1.5 rare colour) × (1 + the den's bonus: +25% at level 2, +50% at level 3). Food in its
//    pouch comes back to you.
//  * Reroll (DEN200.C[tier] essence): a new trait (Horned / Bulky / Armored / Spiked, Universal, or none, with the hatching odds)
//    and new modifiers (as many as it had). Its base stats (grades), level, evolutions and abilities stay. Each reroll has a
//    DEN200.shn (0.75%) chance to turn it shiny (+10% stats and a bonus modifier, as when hatched) or else DEN200.rv (3%) to give
//    it a rare colour (+5%) — never both, and a shiny or rare companion keeps what it has.
//  * Essence is saved with your hero (x2.den200).
// Co-op: the new look (trait, colour, shiny) reaches partners through the companion's look (mpvLookOf: tr, cl, shn, rv).
var DEN200={ess:0,Y:[6,14,28,50,85],C:[10,22,40,65,100],shn:.0075,rv:.03,sel:null,conf:null};
function den200T(c){return st200Tier(c)}
function den200Yield(c){const lv=Math.max(1,kdLv('den'));return Math.round(DEN200.Y[den200T(c)-1]*(1+(c.l||1)/100)*Math.pow(1.25,c.evo||0)*(c.shn?3:c.rv?1.5:1)*(1+(ST200_DEN[lv]||0)))}
function den200Cost(c){return DEN200.C[den200T(c)-1]}
function den200Why(c,i){if(c.lock)return 'Locked';if(i<actN141())return 'In your team';if(c.tr200)return 'Training';if(party.length<=1)return 'Your last companion';return ''}
function den200Sac(i){const c=party[i];if(!c)return;const w=den200Why(c,i);if(w)return say('🐾 '+c.n+' can\'t be sacrificed: '+w.toLowerCase()+'.');
  if(DEN200.conf!==i){DEN200.conf=i;rX();return}DEN200.conf=null;const y=den200Yield(c);
  try{(c.cf200||[]).forEach(s=>{if(s&&s.n>0)giveS(s.k,s.n)})}catch(_){}
  party.splice(i,1);if(typeof cmpSel!='undefined'&&cmpSel>=party.length)cmpSel=Math.max(0,party.length-1);if(DEN200.sel===c)DEN200.sel=null;
  DEN200.ess+=y;try{const p=pl.position;burst(gY(p,1),0xa070ff,26,2,2,.8)}catch(_){}try{sfx('power')}catch(_){}
  say('🔥 '+c.n+' returns to the wild as essence: +'+y+' ✦ ('+DEN200.ess+' ✦).');try{hsDirty();ui();hud();saveGame(true)}catch(_){}rX()}
function den200Reroll(c){if(!c||!party.includes(c))return;const cost=den200Cost(c);if(DEN200.ess<cost)return say('Not enough essence ('+DEN200.ess+' / '+cost+' ✦).');
  DEN200.ess-=cost;const nMods=Math.max(1,(c.mods||[]).length-(c.shn?1:0)),r=Math.random();
  c.tr=Math.random()<.06?'Universal':Math.random()<.3?['Horned','Bulky','Armored','Spiked'][R(0,3)]:'';
  c.mods=[];for(let i=0;i<nMods;i++)rollMod(c);
  let news='';if(!c.shn&&r<DEN200.shn){c.shn=1;news='shiny'}else if(!c.shn&&!c.rv&&r<DEN200.shn+DEN200.rv){const k=Object.keys(RVAR)[R(0,Object.keys(RVAR).length-1)];c.rv=k;c.cl=c.cl.slice();c.cl[0]=RVAR[k];news='rare'}
  if(c.shn)rollMod(c);
  try{if(c.h>M(c))c.h=M(c)}catch(_){}try{hsDirty();ui();hud();cbarSig=''}catch(_){}
  if(news=='shiny'){try{banner('✨ A SHINY '+c.n.toUpperCase()+' ✨','The essence set it glittering: +10% to every stat and a bonus modifier','Beast Den');mSfx('rare')}catch(_){}}
  else if(news=='rare'){try{banner('🎨 A '+c.rv.toUpperCase()+' '+c.n.toUpperCase(),'A rare colour: +5% to every stat','Beast Den');mSfx('rare')}catch(_){}}
  else{try{sfx('chime')}catch(_){}say('✦ '+c.n+' rerolled: '+(c.tr||'no trait')+' · '+(c.mods.join(', ')||'no modifiers')+'.')}
  try{saveGame(true)}catch(_){}rX()}
function den200Desc(c){const t=c.tr?(TR[c.tr]?c.tr+' ('+TR[c.tr][3]+')':c.tr):'No trait';
  return `<div class="den200-tr"><b>Trait</b> ${st200Esc(t)}</div><div class="den200-tr"><b>Modifiers</b> ${(c.mods||[]).map(m=>MODS[m]?MODS[m].i+' '+m:m).join(' · ')||'none'}</div>
    <div class="den200-tr"><b>Look</b> ${c.shn?'✨ Shiny':c.rv?'🎨 '+c.rv:'Normal'}${c.v?' · '+c.v:''}</div>`}
XR.den200=function(){const lv=kdLv('den'),A=actN141();if(DEN200.sel&&!party.includes(DEN200.sel))DEN200.sel=null;if(!DEN200.sel&&party.length)DEN200.sel=party[0];const c=DEN200.sel;
  $('xwT').textContent='🐾 Beast Den';$('xwS').innerHTML='Essence <b>'+DEN200.ess+' ✦</b> · sacrifice companions for essence, spend it to reroll traits';
  let h=st200Head('den',`<div class="den200-ess"><small>Essence</small><b>${DEN200.ess} ✦</b></div>`);
  h+='<div class="den200"><div><div class="s200-sec">Reroll a companion</div><div class="s200-pick">'+party.map((q,i)=>`<button data-den200p="${i}" class="${q===c?'on':''}"><span class="s200-ic">${st200Pic(q)}</span><span>${st200Esc(q.n)} <span class="mut">Lv ${q.l}</span><small>Tier ${den200T(q)} · reroll ${den200Cost(q)} ✦${q.shn?' · ✨':q.rv?' · 🎨':''}</small></span></button>`).join('')+'</div>';
  if(c){const cost=den200Cost(c);h+=`<div class="den200-sel"><div class="s200-ic big">${st200Pic(c)}</div><div><b>${st200Esc(c.n)}</b> <span class="mut">Lv ${c.l} · Tier ${den200T(c)}</span>${den200Desc(c)}</div>
      <div class="den200-go"><button class="pri" data-den200r="1" ${DEN200.ess>=cost?'':'disabled'}>✦ Reroll · ${cost} ✦</button><small>New trait and modifiers. Grades, level and abilities stay.<br>${c.shn?'Already shiny.':'Each reroll: '+(DEN200.shn*100).toFixed(2)+'% shiny'+(c.rv?'':', '+(DEN200.rv*100)+'% rare colour')+'.'}</small></div></div>`}
  h+='</div><div><div class="s200-sec">Sacrifice for essence</div><div class="s200-pick">'+party.map((q,i)=>{const w=den200Why(q,i),y=den200Yield(q),cf=DEN200.conf===i;
      return `<button data-den200s="${i}" ${w?'disabled':''} class="${cf?'den200-cf':''}"><span class="s200-ic">${st200Pic(q)}</span><span>${st200Esc(q.n)} <span class="mut">Lv ${q.l}</span><small>${w||(cf?'Click again to sacrifice for '+y+' ✦':'+'+y+' ✦ essence')}</small></span></button>`}).join('')+'</div></div></div>';
  $('xwB').innerHTML=h;$('xwF').innerHTML='<span class="mut dtl">Higher-tier, higher-level, evolved, shiny and rare companions give more essence; higher tiers cost more to reroll. Locked companions, your active team and companions in training can\'t be sacrificed. Upgrade the den for more essence per sacrifice.</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='den200')return;const t=e.target.closest('[data-den200p],[data-den200r],[data-den200s]');if(!t||t.disabled)return;const d=t.dataset;
  if(d.den200p!=null){DEN200.sel=party[+d.den200p]||null;DEN200.conf=null;rX()}else if(d.den200r)den200Reroll(DEN200.sel);else den200Sac(+d.den200s)});
ST200.open.den=()=>{DEN200.conf=null;openX('den200')};
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.den200=DEN200.ess|0;return o}}
{const f=x2Load;x2Load=function(s){DEN200.ess=Math.max(0,(s&&s.den200)|0);DEN200.sel=null;return f.apply(this,arguments)}}
document.head.insertAdjacentHTML('beforeend',`<style id="den200css">
#xw .den200{display:grid;grid-template-columns:1fr 1fr;gap:14px}#xw .den200 .s200-pick{grid-template-columns:repeat(auto-fill,minmax(180px,1fr));max-height:260px;overflow:auto}
#xw .den200 .s200-pick button.on{outline:2px solid #c9a24a;background:rgba(201,162,74,.16)}#xw .den200-cf{outline:2px solid #f87171!important;background:rgba(248,113,113,.15)!important}
#xw .den200-ess{text-align:right}#xw .den200-ess small{display:block;text-transform:uppercase;letter-spacing:.08em;font-size:.6rem;color:#c9a24a}#xw .den200-ess b{font-size:1.2rem;color:#c8a8ff}
#xw .den200-sel{display:grid;grid-template-columns:72px 1fr;gap:6px 12px;margin-top:10px;padding:10px;border-radius:10px;border:1px solid rgba(160,112,255,.45);background:linear-gradient(135deg,rgba(160,112,255,.12),rgba(0,0,0,.3))}
#xw .den200-sel .s200-ic.big{width:72px;height:72px}#xw .den200-tr{font-size:.74rem;margin-top:3px}#xw .den200-tr b{color:#c9a24a;font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;margin-right:4px}
#xw .den200-go{grid-column:1/-1;display:flex;gap:10px;align-items:center}#xw .den200-go small{color:var(--mut);font-size:.68rem}
@media(max-width:700px){#xw .den200{grid-template-columns:1fr}}
</style>`);
