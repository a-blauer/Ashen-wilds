// ================= v141: owner's list (Oct 2026) =================
// Keys: Q feeds the most hurt companion, Z health potion, X mana potion (0108). Hotbar: 6 ability keys (KQS_SLOTS in 0990).
// Consume raises one stat (0860, 1780). Quests: Kindlelight I wood only, II stone + iron (2350). Outskirts pines (1960).
// This file: Q feeding, break poise ×2, quieter effect text, level growth −60%, the second companion slot.

// ---------------- Q: feed the active companion with the lowest health share ----------------
function feedLowest141(){
  if(!party.length)return say('You have no companion to feed.');
  const L=party.slice(0,actN141()).map((c,i)=>({c,i})).filter(x=>x.c&&x.c.h>0);
  if(!L.length)return say('Your companion has fainted. Revive it with 💗 first.');
  const share=c=>(Math.max(0,c.h)+(c.fhot&&c.fhot.left>0?c.fhot.left:0))/M(c);
  L.sort((a,b)=>share(a.c)-share(b.c));
  if(share(L[0].c)>=1)return say(L.length>1?'Your companions are already full.':nm(L[0].c)+' is already full.');
  feedBest(L[0].i)}

// ---------------- breaks: normal enemies need twice the damage during a wind-up ----------------
// (Sovereigns are never broken by hits.) A combo finisher no longer breaks a normal mob outright: it adds
// KQP.fin poise damage like it always did for elites, so the break still needs the doubled damage.
KQP.pz.n*=2;KQP.pz.el*=2;
cbHeavy=function(e){if(!e||e.boss||e.dead)return;
  if(cbWind(e)){e.atk.pz=(e.atk.pz||0)+M(e.c)*KQP.fin;if(cbBreakChk(e))cbBreak(e,'finisher')}
  else if(!e.c.al){e.cd=Math.max(e.cd,.5)}};

// ---------------- effect text (BREAK!, COMBUST!, MELT! ...): smaller, softer, and their sounds 45% quieter ----------------
var FX141={t:-1e9,keep:/TREASURE|SECRET FOUND/,vol:.55,win:80};
{const f=popT;popT=function(p,t,col,big){const r=f.apply(this,arguments);
  try{if(!FX141.keep.test(String(t||''))){FX141.t=performance.now();const el=$('stage').lastChild;
    if(el&&el.className=='dn'){el.style.fontSize=big?'1.02rem':'.82rem';el.style.fontWeight='800';el.style.letterSpacing='.03em';el.style.opacity='.72';el.classList.add('fx141')}}}catch(_){}
  return r}}
// sounds played together with that text (same moment), and the break sound itself
function fx141Quiet(k){return k=='brk'||performance.now()-FX141.t<FX141.win}
{const f=sfx;sfx=function(k,vol){if(fx141Quiet(k))vol=(vol||1)*FX141.vol;return f.call(this,k,vol)}}
{const f=mSfx;mSfx=function(k,vol){if(fx141Quiet(k))vol=(vol||1)*FX141.vol;return f.call(this,k,vol)}}
// the floating text animates its own opacity in some builds: keep it under .72
document.head.insertAdjacentHTML('beforeend','<style id="fx141css">#stage .dn.fx141{text-shadow:0 1px 3px rgba(0,0,0,.7)!important;filter:saturate(.85)}</style>');

// ---------------- levelling: 60% less of the hero's own growth per level (attribute points unchanged) ----------------
// CLS[c].per is the flat health / attack / defense each level adds (already ×ATR139.flat since v139). Mana keeps its growth.
var LV141={k:.4};
CLSK.forEach(c=>{const P=CLS[c].per;['hp','pa','ma','pd','md'].forEach(k=>{P[k]=+(P[k]*LV141.k).toFixed(4)})});

// ---------------- the second companion slot ----------------
// Everyone starts able to lead ONE companion. After two Sovereigns are defeated the Beast Trainer teaches the bond
// for a second (gold, once per hero; saved in hero.tal so it travels with the save). party[1] stays where it is but
// rests (no follower, no fighting, no XP share) until then. Code that meant "the active team" reads actN141().
var CS141={cost:800,need:2};
function cs141Has(){return !!(typeof hero!='undefined'&&hero&&hero.tal&&hero.tal.__cs2)}
function actN141(){return cs141Has()?2:1}
function cs141Ready(){return typeof bossDone!='undefined'&&bossDone.size>=CS141.need}
function cs141Cost(){return typeof shpP109=='function'?shpP109('trainer',CS141.cost):CS141.cost}
// HUD: a small locked row under the companion bar (once you own a second companion, or once the trainer can teach it)
{const f=cbarsRender;cbarsRender=function(){f.apply(this,arguments);try{const cb=$('cbars');if(!cb)return;let n=cb.querySelector('.cs141');
  const want=!cs141Has()&&party.length&&(party.length>1||cs141Ready());if(!want){if(n)n.remove();return}
  const r=cs141Ready(),t=r?'🔒 2nd companion · learn at the Beast Trainer':'🔒 2nd companion · after 2 Sovereigns';
  if(!n){cb.insertAdjacentHTML('beforeend','<div class="cs141"></div>');n=cb.querySelector('.cs141')}if(n.textContent!==t)n.textContent=t;
  n.title=r?'The Beast Trainer in Duskhold can teach the Companion Bond':'Defeat two Sovereigns, then learn the Companion Bond at the Beast Trainer'}catch(_){}}}
document.head.insertAdjacentHTML('beforeend','<style id="cs141css">#cbars .cs141{font-size:.66rem;color:#c9b48a;background:rgba(10,8,6,.55);border:1px dashed rgba(201,162,74,.45);border-radius:6px;padding:3px 8px;margin-top:4px;width:max-content;pointer-events:auto}</style>');
// Beast Trainer: a "Companion Bond" row on top of the training list
{const f=XR.visitor;XR.visitor=function(){const r=f.apply(this,arguments);try{const B=$('xwB');if(!B||xwArg!='trainer')return r;
  if(B.querySelector('.cs141row'))return r;const has=cs141Has(),rd=cs141Ready(),c=cs141Cost();
  B.insertAdjacentHTML('afterbegin',`<div class="cs141row" style="display:flex;gap:10px;align-items:center;padding:8px 10px;margin:0 0 8px;border:1px solid rgba(201,162,74,.45);border-radius:8px;background:rgba(201,162,74,.08)">
    <span style="font-size:1.5rem">🐾</span><div style="flex:1"><b>Companion Bond</b><div class="mut" style="font-size:.72rem">${has?'Learned: you lead two companions at once.':rd?'Learn to lead a second companion into battle.':'Defeat two Sovereigns first ('+bossDone.size+' / '+CS141.need+').'}</div></div>
    ${has?'<span class="mut">✔ Learned</span>':`<button data-cs141="1" ${rd&&gold>=c?'':'disabled'}>Learn · 🪙 ${c}</button>`}</div>`)}catch(_){}return r}}
$('xw').addEventListener('click',e=>{const t=e.target.closest('[data-cs141]');if(!t)return;e.stopImmediatePropagation();if(t.disabled||cs141Has()||!cs141Ready())return;
  const c=cs141Cost();if(gold<c)return say('You need 🪙 '+c+'.');gold-=c;hero.tal.__cs2=1;leadK[1]='';
  say('🐾 You learned the Companion Bond: your second companion now fights beside you.');try{sfx('power')}catch(_){}hsDirty();sync();ui();hud();if(XR.visitor)XR.visitor()},true);

// ---------------- quest progress kept for the changed Kindlelight II quest (iron moved to the second objective) ----------------
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const S=CHQ132.st&&CHQ132.st.k2c;if(S&&S.p&&S.p.length==1&&S.s==1)S.p=[0,S.p[0]]}catch(_){}return r}}
// R (empower with companion 2) while the second slot is locked
{const f=toggleEmp;toggleEmp=function(i){if(i>=actN141())return say(cs141Ready()?'🔒 Learn the Companion Bond at the Beast Trainer to bring a second companion.':'🔒 A second companion joins you after two Sovereigns are defeated (Beast Trainer).');return f.apply(this,arguments)}}
// a 2nd companion that empowered you before the slot closed (old saves) stops
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{if(!cs141Has()&&party[1]&&party[1].emp)party[1].emp=false}catch(_){}return r}}
