// ================= v90: ability ranks 1–5, more ability points, balance =================
// How it works (read this with the header of zzM_skills.js):
// - Rank is stored in hero.tal['ab:<name>'] (1…5). Unlocking an ability = rank 1 (old saves store 1, so they load as rank 1).
//   The class default ability has no 'ab:' key until you rank it up (no key = rank 1).
// - What a rank does (kqrP/kqrU/kqrD/kqrC below, applied by the patches in build/pN_abil.py):
//     damage, damage over time, summons, traps, heals and shields  ×(1 + 12% per rank above 1)   → rank 5 = ×1.48
//     buff / debuff strength (War Cry, Seal of Light, Death Mark…)  ×(1 + 8% per rank above 1)    → rank 5 = ×1.32
//     pure utility (Vanish, Rift Gate, Time Warp) lasts             +10% per rank above 1          → rank 5 = +40%
//     cooldown                                                       −8% from rank 3, −15% at rank 5
//   Damage is scaled where the cast computes its attack value (cast_base for the old kinds, the KQN cast wrapper for the new ones),
//   so every hit, DoT, projectile, trap, zone and summon that comes from that cast is scaled the same way.
// - Ability points: 2 per level gained, 3 on every 5th level (108 by level 50) + hero.tal.__apB. apFree() = earned − spent, never negative.
//   Unlock cost (v88): 1 + floor(level requirement / 6). Rank-up cost to rank r: ceil(unlock cost / 3) + r − 2
//   (the default ability counts as unlock cost 1). So maxing costs 10 AP for an early ability and up to 18 for a level-48 one.
// - Abilities window: rank pips (5 small diamonds, kqrPips) on every row and the slots, "Rank up · N ⚡" buttons, the detail panel lists this rank → next rank.
//   The hotbar shows a small rank badge. "Reset abilities" refunds ranks too (it removes every 'ab:' key).
var KQR_MAX=5;
function kqrRank(s){if(!s||!hero||!hero.tal)return 1;const v=hero.tal['ab:'+s.n]|0;return Math.max(1,Math.min(KQR_MAX,v||1))}
function kqrPr(r){return 1+.12*(r-1)}
function kqrUr(r){return 1+.08*(r-1)}
function kqrCr(r){return r>=5?.85:r>=3?.92:1}
var KQR_UTIL={Vanish:1,'Rift Gate':1,'Time Warp':1};
function kqrDr(s,r){return KQR_UTIL[s.n]?1+.1*(r-1):1}
// is this hero's ability (not a co-op partner's, not a different class's)
function kqrOwn(s){return !!s&&!!hero&&kqsAll(hero.cls).some(q=>q.n===s.n)}
// v90 balance: per-ability damage factor (applied with the rank, to everything the cast does) and cooldowns — see README "v90: abilities".
// Measured by test/v90_abil.py (level 50, rank 1): damage of one cast on a same-level mob ÷ the hero's average basic hit.
// Targets at rank 1: single target 2.5 hits, area 2.0 per target, big cooldowns 3.2, lasting summons/zones 3.6 in total → ×1.48 at rank 5.
var KQR_TUNE={
 'Bull Rush':1.5,'Intimidating Shout':1.6,'Skull Splitter':.49,'Whirlwind':.4,'Earthshatter':.94,'Chain Hook':1.47,'Execute':.81,
 'Holy Smite':1.6,'Shield Bash':1.11,'Judgment':1.39,'Hammer of Light':.9,'Beacon of Light':1.16,"Crusader's Charge":1.6,'Sanctuary':1.38,'Divine Intervention':1.6,"Heaven's Wrath":1.11,
 'Shadow Rush':.44,'Eviscerate':.42,'Smoke Bomb':.93,'Venom Flask':.55,'Shuriken Volley':.34,'Shadow Clone':.35,'Death Mark':.74,'Phantom Strike':.53,'Caltrops':.79,'Garrote':.59,'Thousand Cuts':.8,'Envenom':1,'Eclipse':.36,
 'Multishot':.56,'Disengage':1.21,'Hawk Dive':.9,'Piercing Arrow':.75,'Explosive Arrow':.72,'Call of the Wild':.22,'Rain of Arrows':.24,'Barrage':.57,'Explosive Trap':.6,'Rapid Fire':.27,'Stampede':.6,'Aimed Shot':.53,'Wild Hunt':.1,
 'Fireball':.75,'Arcane Missiles':.45,"Dragon's Breath":.55,'Chain Lightning':.77,'Blizzard':.3,'Frozen Orb':1.04,'Meteor':.45,'Disintegrate':.46,'Wall of Fire':.45,'Singularity':.43,'Comet Storm':.81};
// abilities whose hits got much smaller come back a little sooner
var KQR_CD={'Whirlwind':11,'Shadow Clone':18,'Eclipse':24,'Venom Flask':10,'Rain of Arrows':10,'Rapid Fire':10,'Explosive Trap':8,'Aimed Shot':13,'Call of the Wild':18,'Wild Hunt':30,
 'Blizzard':13,'Disintegrate':11,'Meteor':14,'Wall of Fire':16,'Singularity':22,'Fireball':4.5,'Arcane Missiles':5};
// class knobs (added to the hero's stats): every class gets to use its abilities over a long fight (mana regeneration, % of max mana per second),
// and the rotation damage of the five classes lands within about ±12% of each other at levels 5-50 (test/v90_abil.py)
var KQR_CLS={warrior:{basicP:.05,skillP:.1,mpr:.01,mp:L=>5+.5*L},paladin:{mpr:.008},assassin:{as:L=>.1+.002*L,basicP:.15,mpr:.01},ranger:{basicP:.12,mpr:.01},mage:{skillP:L=>-.36+.008*L}};  // a number, or a function of the hero's level
{const f=HS;HS=function(){const s=f.apply(this,arguments);if(!s._kqr){s._kqr=1;const o=KQR_CLS[hero.cls];if(o)for(const k in o)s[k]=(s[k]||0)+(typeof o[k]=='function'?o[k](hero.lvl|0):o[k])}return s}}
function kqrT(s){return (s&&KQR_TUNE[s.n])||1}
function kqrP(s){return kqrT(s)*(kqrOwn(s)?kqrPr(kqrRank(s)):1)}
function kqrU(s){return kqrOwn(s)?kqrUr(kqrRank(s)):1}
function kqrC(s){return kqrOwn(s)?kqrCr(kqrRank(s)):1}
function kqrD(s){return kqrOwn(s)?kqrDr(s,kqrRank(s)):1}
// a buff's stats scaled by rank (flags stay as they are)
var KQR_FLAG={poisonOn:1,dash3:1,setArc:1};
function kqrB(s,o){const k=kqrU(s);if(k===1||!o)return o;const n={};for(const q in o)n[q]=KQR_FLAG[q]||typeof o[q]!='number'?o[q]:o[q]*k;return n}

Object.keys(SKB).forEach(c=>kqsAll(c).forEach(s=>{if(KQR_CD[s.n]!=null)s.cd=KQR_CD[s.n]}));
// ---------------- ability points ----------------
function kqrLvAP(l){return l%5==0?3:2}
function apEarned(){const L=hero.lvl|0;let n=0;for(let l=2;l<=L;l++)n+=kqrLvAP(l);return n+((hero.tal&&hero.tal.__apB)|0)}
function kqrUnlockCost(s){return 1+Math.floor((s.lv|0)/6)}
// AP to go from rank r-1 to rank r
function kqrCost(s,r){return Math.ceil((s===kqsDef(hero.cls)?1:kqrUnlockCost(s))/3)+r-2}
function kqrSpentOn(s){let n=0;const r=kqrRank(s);for(let k=2;k<=r;k++)n+=kqrCost(s,k);return n}
function apSpent(){const c=hero.cls;let n=0;kqsAll(c).forEach(s=>{if(!kqsUnl(c,s))return;if(s!==kqsDef(c))n+=apCost(s);n+=kqrSpentOn(s)});return n}
function kqrWhy(s){const c=hero.cls;if(!kqsUnl(c,s))return 'Unlock it first';const r=kqrRank(s);if(r>=KQR_MAX)return 'Max rank';const k=kqrCost(s,r+1);if(apFree()<k)return 'Needs '+k+' ability point'+(k>1?'s':'');return ''}
function kqrUp(n){const c=hero.cls,s=kqsFind(c,n);if(!s)return;const w=kqrWhy(s);KQS.sel=s.n;if(w){say('🔒 '+s.n+': '+w+'.');return}
  const r=kqrRank(s)+1;hero.tal['ab:'+s.n]=r;hsDirty();say('⚡ '+s.i+' <b>'+s.n+'</b> is now rank '+r+' '+kqrPips(r)+'.');try{mSfx('rare')}catch(_){try{sfx('chime')}catch(__){}}
  try{hud()}catch(_){}if(xwMode=='abil')rX();try{if(!$('tal').classList.contains('hide'))rTal()}catch(_){}}
// tests / cheats: every learned ability to rank r
function kqrSetAll(r){const c=hero.cls;kqsAll(c).forEach(s=>{if(kqsUnl(c,s)){if(r<=1&&s===kqsDef(c))delete hero.tal['ab:'+s.n];else hero.tal['ab:'+s.n]=Math.max(1,Math.min(KQR_MAX,r))}});hsDirty()}

// ---------------- text ----------------
// rank pips as small diamonds (the emoji/icon layer would draw ★ and ☆ alike)
function kqrPips(r){let h='';for(let k=0;k<KQR_MAX;k++)h+='<span class="'+(k<r?'on':'')+'"></span>';return '<span class="kqr-pips" title="Rank '+r+' of '+KQR_MAX+'">'+h+'</span>'}
var KQR_HEAL={heal:1,barrier:1},KQR_HX={p_beacon:1,p_penance:1,p_interv:1,w_unbrk:1};
var KQR_BUFF={buff:1,mark:1},KQR_BX={w_banner:1,w_blood:1,w_unbrk:1,p_sanct:1,p_seal:1,a_eclipse:1,r_hunt:1};
function kqrLines(s,r,n){const a=[],pc=x=>Math.round(x*100)+'%',to=(x,y)=>n?x+' → <b>'+y+'</b>':x;
  if(s.m){const mt=s.mt||CLS[hero.cls].mt,A=atkOf(mt)*(1+HS().skillP),v=q=>Math.round(A*s.m*kqrT(s)*kqrPr(q));a.push('⚔ Damage '+to(pc(kqrPr(r)),pc(kqrPr(n)))+' <small>(≈ '+to(v(r),v(n))+' per hit)</small>')}
  if(KQR_HEAL[s.k]||KQR_HX[s.x])a.push('💚 '+(s.k=='barrier'?'Shield':'Healing')+' '+to(pc(kqrPr(r)),pc(kqrPr(n))));
  if(KQR_BUFF[s.k]||KQR_BX[s.x])a.push('✦ Effect strength '+to(pc(kqrUr(r)),pc(kqrUr(n))));
  if(KQR_UTIL[s.n]&&s.dur)a.push('⌛ Lasts '+to((+(s.dur*kqrDr(s,r)).toFixed(1))+'s',(+(s.dur*kqrDr(s,n)).toFixed(1))+'s'));
  if(s.cd){const c=q=>(+(s.cd*kqrCr(q)).toFixed(1))+'s';a.push('⏱ Cooldown '+(n&&kqrCr(n)!==kqrCr(r)?to(c(r),c(n)):c(r)))}
  return a}

// ---------------- the Abilities window: pips, rank-up buttons, this rank → next ----------------
{const f=XR.abil;XR.abil=function(){f.apply(this,arguments);try{kqrDecor()}catch(err){console.error(err)}}}
function kqrDecor(){const c=hero.cls,B=$('xwB');if(!B)return;
  document.querySelectorAll('#xwB [data-kqsel]').forEach(row=>{const s=kqsFind(c,row.dataset.kqsel);if(!s||!kqsUnl(c,s))return;const r=kqrRank(s),b=row.querySelector('.rn b');
    if(b)b.insertAdjacentHTML('afterend',` <span class="kqr-pip" title="Rank ${r} of ${KQR_MAX}">${kqrPips(r)}</span>`);
    const ra=row.querySelector('.ra');if(ra&&r<KQR_MAX){const k=kqrCost(s,r+1),ok=apFree()>=k;ra.insertAdjacentHTML('afterbegin',`<button class="kqr-up${ok?' pri':''}" data-kqrup="${s.n}" ${ok?'':'disabled'} title="${ok?'Rank '+(r+1)+' for '+k+' ability point'+(k>1?'s':''):'Needs '+k+' ability points'}">Rank up · ${k} ⚡</button>`)}});
  document.querySelectorAll('#xwB [data-kqslot]').forEach(sl=>{const s=heroSkills()[+sl.dataset.kqslot];if(!s)return;const n=sl.querySelector('.kqs-sn');if(n)n.insertAdjacentHTML('afterend',`<span class="kqr-sp">${kqrPips(kqrRank(s))}</span>`)});
  const sel=kqsFind(c,KQS.sel)||heroSkills()[0],det=B.querySelector('.kqs-det');if(!sel||!det)return;const un=kqsUnl(c,sel),r=kqrRank(sel),n=un&&r<KQR_MAX?r+1:0;
  const lines=kqrLines(sel,un?r:1,n),w=un?kqrWhy(sel):'',k=n?kqrCost(sel,n):0;
  const h=`<div class="kqr-box"><div class="kqr-h"><b>${un?'Rank '+r:'Rank 1 when unlocked'}</b> <span class="kqr-pip">${kqrPips(un?r:1)}</span>${n?` <span class="mut">→ rank ${n}</span>`:un?' <span class="kqr-max">Max rank</span>':''}</div>
    <div class="kqr-ln">${lines.map(x=>`<span>${x}</span>`).join('')}</div>
    ${n?`<div class="btns"><button class="${w?'':'pri'}" data-kqrup="${sel.n}" ${w?'disabled':''}>${w?'🔒 '+w:'Rank up to '+n+' · '+k+' ⚡'}</button></div>`:''}</div>`;
  const st=det.querySelector('.kqs-stats');if(st)st.insertAdjacentHTML('afterend',h);else det.insertAdjacentHTML('beforeend',h);
  const S=$('xwS');if(S)S.innerHTML=S.innerHTML.replace('+1 point every level','+2 points every level (+3 every 5th)');
  const F=document.querySelector('#xwF .dtl');if(F)F.textContent=`You earn 2 ability points every level (3 on every 5th level). Unlock abilities, rank them up to ${KQR_MAX} to make them stronger, then choose which ${KQS_SLOTS} sit on keys 1–${KQS_SLOTS}.`}
$('xw').addEventListener('click',e=>{if(xwMode!='abil')return;const t=e.target.closest('[data-kqrup]');if(!t)return;e.stopPropagation();e.preventDefault();if(t.disabled)return;kqrUp(t.dataset.kqrup)},true);
// the talents window link
{const f=skHTML;skHTML=function(){return f.apply(this,arguments).replace('(1 per level)','(2 per level, 3 every 5th level)')}}
// hotbar: a small rank badge on every ability key
{const f=hud;hud=function(){f.apply(this,arguments);try{const A=$('acts');if(!A||!party.length)return;heroSkills().forEach((s,i)=>{const b=A.querySelector('button[data-x="'+i+'"]');if(!b||b.querySelector('.kqr-b'))return;const r=kqrRank(s);b.insertAdjacentHTML('beforeend',`<span class="kqr-b r${r}" title="Rank ${r}">${r}★</span>`)})}catch(_){}}}
document.head.insertAdjacentHTML('beforeend',`<style>
.kqr-pip{white-space:nowrap}.kqr-pips{display:inline-flex;gap:3px;vertical-align:middle;margin:0 2px}.kqr-pips span{width:6px;height:6px;transform:rotate(45deg);border:1px solid #c9a24f;display:inline-block;box-sizing:border-box}.kqr-pips span.on{background:#f0cc72;border-color:#f0cc72;box-shadow:0 0 3px rgba(240,204,114,.6)}
.kqr-sp{position:absolute;right:6px;bottom:2px;line-height:0}.kqr-sp .kqr-pips span{width:5px;height:5px}
.kqs-ab .ra{display:flex;gap:4px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.kqr-up{font-size:.68rem;padding:2px 7px;white-space:nowrap}
.kqr-box{margin:8px 0;padding:8px;border-radius:8px;background:rgba(240,204,114,.07);border:1px solid rgba(240,204,114,.22)}.kqr-h{font-size:.8rem;margin-bottom:4px}.kqr-max{color:#6ee7b7;font-size:.7rem;font-weight:700}
.kqr-ln{display:flex;flex-direction:column;gap:2px;font-size:.74rem}.kqr-ln small{opacity:.75}.kqr-box .btns{margin-top:6px}
#acts .hs .kqr-b{position:absolute;right:5px;top:4px;font-size:.55rem;font-weight:800;line-height:1;color:#f0cc72;text-shadow:0 1px 2px #000;pointer-events:none}#acts .hs .kqr-b.r1{opacity:.55}#acts .hs .kqr-b.r5{color:#fde68a}
</style>`);

