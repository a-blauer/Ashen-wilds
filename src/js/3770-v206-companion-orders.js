// ================= v206: companion orders — E engage, R retreat (empower removed) =================
// Owner (Nov 7 2026): "Remove the mechanic of companions being able to empower you by pressing e and r. Instead have 'e' be
// engage — where the companion attacks your target (instead of spacebar). Have 'r' be retreat where companion attempts to flee
// to the character."
//  * E = commandAttack (0860, the old Space command; the key listener there now takes E and R, KB161 'cmd' / 'ret').
//    Space is no longer a companion key: it falls through to the plain attack (0108, like a left click).
//  * R = retreat206: the active companions drop their fight and run back to the hero for RET206.ms (teamFoe gives them no
//    foe, so compTick and compSpells (0860 / 0870) run them home at follow speed). E cancels a retreat; R cancels an engage.
//  * Empower is gone: toggleEmp does nothing, the ⚡ buttons on the companion bars are gone, any c.emp left on is cleared.
//    (Cheddar's "Borrowed Strength" quest, the only one that needed empower, is no longer on his board, so nothing else changes.)
//  * Co-op: companions' positions and moves already reach partners (2170), so an engage or a retreat shows there as it is.
var RET206={t:0,ms:6000};
function ret206On(){return nowP()<RET206.t}
function retreat206(){
  const act=party.slice(0,actN141()).filter((c,i)=>c&&c.h>0&&fols[i]&&fols[i].visible);
  if(!act.length)return say('No companion is out to call back.');
  CMD={e:null,t:0};RET206.t=nowP()+RET206.ms;
  act.forEach(c=>{const f=fols[party.indexOf(c)];if(!f)return;f.fol=1;f.kb164=0;dn(f.position,'↩','#7ac8ff',-10,700)});
  try{ring(pl.position,0x7ac8ff,2.2,500)}catch(_){}
  say('↩️ '+act.map(c=>c.n).join(' and ')+(act.length>1?' fall back to you!':' falls back to you!'));try{sfx('chime',.35)}catch(_){}}
// a retreat: the team has no foe until it ends
{const f=teamFoe;teamFoe=function(){if(ret206On())return null;return f.apply(this,arguments)}}
// engage ends a retreat
{const f=commandAttack;commandAttack=function(){const t0=CMD.t;const r=f.apply(this,arguments);try{if(CMD.e&&CMD.t!==t0)RET206.t=0}catch(_){}return r}}
// mobile: a retreat button next to the engage button (📣)
{const mb=$('mbtn');if(mb&&!mb.querySelector('[data-m=ret]')){const b=document.createElement('button');b.dataset.m='ret';b.title='Retreat: companions run back to you';b.textContent='↩️';mb.appendChild(b);
  b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();retreat206()})}}

// ---------------- empower removed ----------------
toggleEmp=function(){};
{const f=compRegen;compRegen=function(dt,now){try{party.forEach(c=>{if(c&&c.emp){c.emp=false;c.empL=0;c.empCd=0;try{hsDirty()}catch(_){}}})}catch(_){}return f.apply(this,arguments)}}
document.head.insertAdjacentHTML('beforeend','<style id="v206ord">.cbar button[data-e],#act button[data-e]{display:none!important}.cbar .e92bar{display:none!important}</style>');

