// ================= v194: runes, part 1 — the rune types, ranks, gear rune slots and what runes do =================
// Owner (Nov 3 2026): "Runes need a better description of what they do. Make runes only be able to be placed into something at the
// rune sanctum ... Runes should be permanent on slotting, and to remove you have to destroy the rune. Companions should only get a
// rune slot once they are evolved for the first time, and another slot once they evolve a 3rd time. ... combining like-type Runes to
// create a stronger version. ... a RNG slot system on equipment drops and shop equipment (armor and weapons only). Slots should only
// be on items blue rarity or above and more common as you get higher level- but still not super common. Multiple rune slots on an item
// should be uncommon, with 3 rune slots being rare and only available on epic or above items. There should be offensive Runes for
// weapons (fire, poison, etc) and other Runes specifically for armor (extra health, armor, deflect, etc.)"
//
// How it works:
// - Twelve rune types (RN194.T): six weapon runes (Ember, Frost, Storm, Venom, Might, Leech) and six armour runes (Vigor, Ward,
//   Deflect, Tide, Swift, Thorns). Each has three ranks. A rune is a supply item (SUP / sup): 'r_<type>' is rank I (the old keys,
//   so runes in old saves stay), 'r_<type>2' rank II, 'r_<type>3' rank III. RUNEK stays the list of rank I keys (drops roll from it).
// - Gear: weapons (sl 'weapon') take weapon runes; shields, helms, chest pieces and boots take armour runes. A piece's slots are
//   it.rs (0–3) and the runes set in it it.ru (keys). Slots are rolled when the piece is made (genItem, so drops and shop stock):
//   only Rare (blue) or better, more often at higher tiers, two slots uncommon, three only on Epic or Legendary pieces and rare.
// - Companions take any rune. Slots: one after their first evolution (c.evo ≥ 1), a second after the third (c.evo ≥ 3).
//   Old saves: runes in slots a companion no longer has go back to the bag (rn194Fix, once per load).
// - Runes are set at the Rune Sanctum only (3591) and are permanent: the only way to free a slot is to destroy the rune in it.
// - Effects: hero stats through an HS wrapper (equipped, usable pieces only), weapon procs through a heroHit wrapper (burn, chill,
//   arcs, poison), deflect through a hitHero wrapper; companions through runeMul / runeEl / runeHit / runeTick (the v49 hooks in
//   cStat, compHit and the main loop, redefined here) and a hitTarget wrapper (deflect, thorns).
var RN194={busy:0,rk:['I','II','III'],
  T:{
   // ---- weapon runes ----
   ember:{n:'Ember',i:'🔥',sl:'w',col:0xff5a14,c2:0xffc040,el:'fire',
     h:{pr:'burn',ch:[.25,.32,.4],k:[.2,.3,.4],dur:3},c:{att:[.05,.08,.12]},
     hd:r=>`Hits have a ${P_(r.h.ch)} chance to set the enemy ablaze. It burns for 3 s, taking ${P_(r.h.k)} of your attack each second.`,
     cd:r=>`Its attacks burn (fire element) · +${P_(r.c.att)} attack.`},
   frost:{n:'Frost',i:'❄️',sl:'w',col:0x7ad8ff,c2:0xe8fbff,el:'frost',
     h:{pr:'chill',ch:[.25,.33,.42],v:[.08,.12,.16],dur:2.5},c:{att:[.05,.08,.12]},
     hd:r=>`Hits have a ${P_(r.h.ch)} chance to chill the enemy for 2.5 s: it is slowed and takes ${P_(r.h.v)} more damage from you.`,
     cd:r=>`Its attacks chill (frost element) · +${P_(r.c.att)} attack.`},
   storm:{n:'Storm',i:'⚡',sl:'w',col:0x8aa8ff,c2:0xf0f4ff,el:'shock',
     h:{pr:'arc',ch:[.15,.2,.26],k:[.4,.55,.7],n:2},c:{att:[.05,.08,.12]},
     hd:r=>`Hits have a ${P_(r.h.ch)} chance to arc lightning to up to 2 nearby enemies for ${P_(r.h.k)} of your attack.`,
     cd:r=>`Its attacks shock (lightning element) · +${P_(r.c.att)} attack.`},
   venom:{n:'Venom',i:'☠️',sl:'w',col:0x7ae04a,c2:0xd8ff6a,el:'poison',
     h:{pr:'poison',ch:[.35,.45,.55],k:[.15,.22,.3],dur:4},c:{att:[.05,.08,.12]},
     hd:r=>`Hits have a ${P_(r.h.ch)} chance to poison the enemy for 4 s, ${P_(r.h.k)} of your attack each second.`,
     cd:r=>`Its attacks poison (poison element) · +${P_(r.c.att)} attack.`},
   might:{n:'Might',i:'💪',sl:'w',col:0xffb238,c2:0xffe7a0,
     h:{st:{paP:[.06,.1,.15],maP:[.06,.1,.15]}},c:{att:[.15,.22,.3]},
     hd:r=>`+${P_(r.h.st.paP)} physical and magical attack.`,
     cd:r=>`+${P_(r.c.att)} attack.`},
   leech:{n:'Leech',i:'🩸',sl:'w',col:0xd01c3a,c2:0xff7a8a,
     h:{st:{ls:[.02,.03,.045]}},c:{leech:[.08,.12,.16]},
     hd:r=>`Heals you for ${P_(r.h.st.ls)} of the damage you deal.`,
     cd:r=>`Heals it for ${P_(r.c.leech)} of the damage it deals.`},
   // ---- armour runes ----
   vigor:{n:'Vigor',i:'❤️',sl:'a',col:0xff2a1a,c2:0xff9a4a,
     h:{st:{hpP:[.06,.1,.15]}},c:{hp:[.2,.28,.36]},
     hd:r=>`+${P_(r.h.st.hpP)} max health.`,cd:r=>`+${P_(r.c.hp)} health.`},
   ward:{n:'Ward',i:'🛡️',sl:'a',col:0x5a8aff,c2:0xc8dcff,
     h:{st:{pdP:[.08,.13,.2],mdP:[.08,.13,.2]}},c:{def:[.2,.28,.36]},
     hd:r=>`+${P_(r.h.st.pdP)} physical and magical defense (armor).`,cd:r=>`+${P_(r.c.def)} physical and magical defense.`},
   deflect:{n:'Deflect',i:'💠',sl:'a',col:0xdfe6ff,c2:0x9ab8ff,
     h:{st:{defl:[.04,.07,.1]}},c:{defl:[.06,.1,.14]},
     hd:r=>`${P_(r.h.st.defl)} chance to deflect an enemy's hit completely.`,cd:r=>`${P_(r.c.defl)} chance to deflect a hit completely.`},
   tide:{n:'Tide',i:'💧',sl:'a',col:0x1ad0b8,c2:0x9affee,
     h:{st:{regen:[.0025,.004,.006]}},c:{regen:[.01,.015,.02]},
     hd:r=>`Restores ${P_(r.h.st.regen,2)} of your max health every second in combat.`,cd:r=>`Restores ${P_(r.c.regen,1)} of its health every second.`},
   swift:{n:'Swift',i:'💨',sl:'a',col:0xa8ffd8,c2:0xeafff6,
     h:{st:{cdr:[.05,.08,.12]}},c:{swift:[.43,.6,.8]},
     hd:r=>`Abilities recharge faster: +${P_(r.h.st.cdr)} cooldown reduction.`,cd:r=>`Its spells recharge ${['30%','38%','44%'][r._k|0]} faster.`},
   thorns:{n:'Thorns',i:'🥀',sl:'a',col:0xb0205a,c2:0xff6aa8,
     h:{st:{thorns:[.1,.16,.24]}},c:{thorns:[.15,.22,.3]},
     hd:r=>`Reflects ${P_(r.h.st.thorns)} of the damage you take back at the attacker.`,cd:r=>`Reflects ${P_(r.c.thorns)} of the damage it takes back at the attacker.`}},
  // gear slots: Rare (2) or better; chance by rarity, +2.5% per tier; two slots 20% of slotted pieces; three on Epic+ only
  slot:{base:[0,0,.08,.14,.2],tier:.025,two:.2,three:.3},
  // what setting a rune costs (gold), per rank
  sockG:r=>[60,240,900][r-1],
  // fusing three runes into one of the next rank: [gold, crystal shards] for → II and → III
  fuse:[[150,3],[800,8]]};
function P_(v,dp){const f=x=>(+(x*100).toFixed(dp==null?0:dp))+'%';return Array.isArray(v)?'<b class="rn194-v">'+f(v[RN194._r|0])+'</b>':f(v)}
const RN194K=Object.keys(RN194.T);
function rn194Key(t,r){return 'r_'+t+(r>1?r:'')}
function rn194Parse(k){const m=/^r_([a-z]+?)([23])?$/.exec(k||'');if(!m||!RN194.T[m[1]])return null;return {t:m[1],r:m[2]?+m[2]:1,T:RN194.T[m[1]],k}}
function rn194Name(k){const p=rn194Parse(k);return p?p.T.n+' Rune '+RN194.rk[p.r-1]:k}
// descriptions at a rank (r 1..3): what it does in gear and what it does in a companion
function rn194Desc(k,who){const p=rn194Parse(k);if(!p)return '';RN194._r=p.r-1;const T=Object.assign({},p.T,{_k:p.r-1});
  try{return who=='c'?p.T.cd(T):p.T.hd(T)}finally{RN194._r=0}}
function rn194Kind(k){const p=rn194Parse(k);return p?(p.T.sl=='w'?'Weapon rune':'Armor rune'):''}
function rn194FullDesc(k){const p=rn194Parse(k);if(!p)return '';
  return `${rn194Kind(k)} · rank ${RN194.rk[p.r-1]}. ${p.T.sl=='w'?'In a weapon':'In a shield, helm, chest piece or boots'}: ${rn194Desc(k,'h')} In a companion: ${rn194Desc(k,'c')} Set it at the Rune Sanctum (permanent).`}
// the supply entries for every type and rank (rank I keeps the old key); RUNES (v49) mirrors them for old readers
RN194K.forEach(t=>{const T=RN194.T[t];for(let r=1;r<=3;r++){const k=rn194Key(t,r),plain=s=>String(s).replace(/<[^>]+>/g,'');
  SUP[k]={n:rn194Name(k),i:T.i,c:'rune',d:plain(rn194FullDesc(k))};RUNES[k]=[rn194Name(k),T.i,plain(rn194Desc(k,'h')),{}]}
  if(!RUNEK.includes(rn194Key(t,1)))RUNEK.push(rn194Key(t,1))});
// the ranks fit for a slot kind: weapon pieces take weapon runes, armour pieces armour runes, companions any
function rn194SlK(it){const t=it&&itT(it);if(!t)return null;return t.sl=='weapon'?'w':['offhand','helm','chest','boots'].includes(t.sl)?'a':null}
function rn194Fits(k,target){const p=rn194Parse(k);if(!p)return false;if(target&&target.g)return true;const s=rn194SlK(target);return !!s&&p.T.sl==s}

// ---------------- gear rune slots ----------------
function rn194Roll(it){const t=itT(it);if(!t||!rn194SlK(it)||(it.r|0)<2)return 0;const S=RN194.slot,T=Math.max(0,tierOfLv(it.lv||1)-1);
  if(Math.random()>=S.base[Math.min(4,it.r|0)]+S.tier*T)return 0;let n=1;if(Math.random()<S.two)n=2;if(n==2&&(it.r|0)>=3&&Math.random()<S.three)n=3;return n}
{const f=genItem;genItem=function(l,o){const it=f.apply(this,arguments);try{if(it&&it.rs==null){const n=rn194Roll(it);if(n){it.rs=n;it.ru=[]}}}catch(e){console.warn('v194 slots',e)}return it}}
// the runes set in a piece (a copy), its open slots
function rn194Ru(it){return it&&Array.isArray(it.ru)?it.ru.filter(k=>rn194Parse(k)):[]}
function rn194Open(it){return Math.max(0,(it&&it.rs|0)-rn194Ru(it).length)}

// ---------------- companion rune slots ----------------
function rn194CSlots(c){if(!c||c.st)return 0;const e=c.evo|0;return (e>=1?1:0)+(e>=3?1:0)}
function rn194CNext(c){const e=c.evo|0;return e<1?'Unlocks at its first evolution ✦':e<3?'Unlocks at its third evolution ✦✦✦':''}
// old saves: runes in slots a companion doesn't have go back to the bag (once per load)
function rn194Fix(){let n=0;try{(party||[]).forEach(c=>{if(!c||!Array.isArray(c.runes))return;c.runes=c.runes.filter(k=>rn194Parse(k));const m=rn194CSlots(c);
  while(c.runes.length>m){giveS(c.runes.pop(),1);n++}})}catch(e){console.warn('v194 fix',e)}
  try{(gear||[]).concat(Object.values(eq||{})).forEach(it=>{if(!it||it.rs==null)return;it.rs=Math.max(0,Math.min(3,it.rs|0));it.ru=rn194Ru(it).slice(0,it.rs)})}catch(_){}
  if(n)setTimeout(()=>{try{say('🔮 Companions now gain rune slots by evolving (one at the first evolution, a second at the third). '+n+' rune'+(n>1?'s were':' was')+' returned to your bag.')}catch(_){}},4000);return n}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{rn194Fix()}catch(_){}return r}}

// ---------------- what the runes add up to ----------------
// the hero: every usable equipped piece's runes. Stats are summed; procs come from the weapon.
function rn194HeroRunes(){const L=[];try{SLOTS.forEach(k=>{const it=eq[k];if(it&&canUse(it))rn194Ru(it).forEach(r=>L.push(r))})}catch(_){}return L}
function rn194HeroSum(){const S={};rn194HeroRunes().forEach(k=>{const p=rn194Parse(k),st=p&&p.T.h.st;if(!st)return;for(const q in st)S[q]=(S[q]||0)+st[q][p.r-1]});return S}
{const f=HS;HS=function(){const s=f.apply(this,arguments);if(s&&!s._rn194){s._rn194=1;try{const A=rn194HeroSum();
  if(A.hpP)s.hp*=1+A.hpP;if(A.paP)s.pa*=1+A.paP;if(A.maP)s.ma*=1+A.maP;if(A.pdP)s.pd*=1+A.pdP;if(A.mdP)s.md*=1+A.mdP;
  ['ls','regen','cdr','thorns','defl'].forEach(k=>{if(A[k])s[k]=(s[k]||0)+A[k]});if(s.defl)s.defl=Math.min(.35,s.defl)}catch(e){console.warn('v194 HS',e)}}return s}}
// weapon procs (outermost heroHit wrapper)
function rn194WProcs(){const w=eq&&eq.weapon;if(!w||!canUse(w))return [];return rn194Ru(w).map(rn194Parse).filter(p=>p&&p.T.h.pr)}
{const f=heroHit;heroHit=function(e,raw,mt,o){
  if(e&&!e.dead&&e._rnCh&&e._rnCh>nowP())raw*=1+(e._rnChV||0);
  const d=f.apply(this,[e,raw,mt,o]);
  if(d>0&&e&&!RN194.busy&&!(o&&o.proc===false)&&!(typeof ABX!='undefined'&&ABX.ctx)){const L=rn194WProcs();if(L.length){RN194.busy++;try{rn194Proc(e,L,mt)}catch(err){console.warn('v194 proc',err)}finally{RN194.busy--}}}
  return d}}
function rn194Proc(e,L,mt){const A=atkOf(mt||heroMt()),now=nowP(),at=()=>e.m?gY(e.m.position,.8):null;
  L.forEach(p=>{const H=p.T.h,i=p.r-1;if(Math.random()>=H.ch[i])return;
    if(e.dead&&H.pr!='arc')return;
    if(H.pr=='burn'){eStatus(e,{burn:H.dur},A*H.k[i]/.32);const q=at();if(q)burst(q,p.T.col,7,1.3,1.4,.4)}
    else if(H.pr=='poison'){eStatus(e,{poison:H.dur},A*H.k[i]/.28);const q=at();if(q)burst(q,p.T.col,6,1,.8,.45)}
    else if(H.pr=='chill'){eStatus(e,{slow:H.dur},0);e._rnChV=Math.max(e._rnCh>now&&e._rnChV||0,H.v[i]);e._rnCh=now+H.dur*1000;const q=at();if(q)burst(q,p.T.col,8,1.1,.6,.5)}
    else if(H.pr=='arc'){const from=e.m.position,L2=enemies.filter(q=>q!==e&&!q.dead&&!q.hid&&d2(q.m.position,from)<30).sort((a,b)=>d2(a.m.position,from)-d2(b.m.position,from)).slice(0,H.n);
      L2.forEach(q=>{try{bolt(gY(from,.9),gY(q.m.position,.8),p.T.col)}catch(_){}heroHit(q,A*H.k[i],'m',{s:{col:p.T.col,noel:1},proc:false})});
      if(L2.length)try{sfx('zap',.5)}catch(_){}}})}
// deflect (outermost hitHero wrapper): the hit never lands
{const f=hitHero;hitHero=function(e,mult,mt){try{if(e&&hero.hp>0&&!(hero.iv>0)&&townAt(pl.position.x,pl.position.z,.5)<0&&!(typeof AWD!='undefined'&&AWD.dead)&&!(typeof RV148!='undefined'&&RV148.down)){
    const s=HS();if(s.defl>0&&Math.random()<s.defl){dn(pl.position,'Deflected!','#dfe6ff',-18);burst(gY(pl.position,1),0xdfe6ff,10,1.6,1,.3);try{sfx('blunt',.5)}catch(_){}return}}}catch(_){}
  return f.apply(this,arguments)}}
// ---------------- companions ----------------
function rn194CSum(c){const sig=(c.runes||[]).join(',');if(c._rn194&&c._rn194.k===sig)return c._rn194.v;const S={el:null};
  (c.runes||[]).forEach(k=>{const p=rn194Parse(k);if(!p)return;const C=p.T.c;for(const q in C)S[q]=(S[q]||0)+C[q][p.r-1];if(p.T.el&&!S.el)S.el=p.T.el});
  try{Object.defineProperty(c,'_rn194',{value:{k:sig,v:S},writable:true,configurable:true,enumerable:false})}catch(_){c._rn194={k:sig,v:S}}return S}
runeEl=function(c){return c&&c.runes&&c.runes.length?rn194CSum(c).el:null};
runeMul=function(c,k){if(!c||!c.runes||!c.runes.length)return 1;const S=rn194CSum(c);return 1+((k=='pa'||k=='ma')?(S.att||0):k=='hp'?(S.hp||0):(k=='pd'||k=='md')?(S.def||0):0)};
runeHit=function(c,d){if(!c||!c.runes||!c.runes.length||!(c.h>0))return;const l=rn194CSum(c).leech;if(l)c.h=Math.min(M(c),c.h+d*l)};
runeTick=function(dt){if(dt<=0)return;party.slice(0,actN141()).forEach(c=>{if(!c||!c.runes||!c.runes.length||!(c.h>0))return;const S=rn194CSum(c);
  if(S.swift&&c.cdm)for(const k in c.cdm)c.cdm[k]=Math.max(0,c.cdm[k]-dt*S.swift);
  if(S.regen&&c.h<M(c))c.h=Math.min(M(c),c.h+M(c)*S.regen*dt)})};
{const f=hitTarget;hitTarget=function(e,tg,mult,mt){const i=tg&&tg!==pl?fols.indexOf(tg):-1,me=i>=0?party[i]:null;
  if(me&&me.runes&&me.runes.length&&me.h>0){const S=rn194CSum(me);if(S.defl&&Math.random()<S.defl){try{dn(tg.position,'Deflected','#dfe6ff',-14)}catch(_){}return}
    const h0=me.h,r=f.apply(this,arguments);if(S.thorns&&e&&!e.dead&&me.h<h0){try{hurt(e,Math.max(1,Math.round((h0-me.h)*S.thorns)),{col:0xb0205a},false)}catch(_){}}return r}
  return f.apply(this,arguments)}}
// the companion window: the runes it carries (read only; runes are set at the Rune Sanctum)
runeHTML=function(c){if(!c)return '';const n=rn194CSlots(c),L=(c.runes||[]).filter(k=>rn194Parse(k));
  let h=`<div class="sec">Runes (${L.length}/${n} slot${n==1?'':'s'})</div><div class="rn194-cs">`;
  for(let i=0;i<2;i++){const k=L[i];if(k){const p=rn194Parse(k);h+=`<div class="rn194-cr" style="--rc:#${p.T.col.toString(16).padStart(6,'0')}"><span class="rn194-gem">${p.T.i}<i>${RN194.rk[p.r-1]}</i></span><span><b>${rn194Name(k)}</b><small>${rn194Desc(k,'c')}</small></span></div>`}
    else if(i<n)h+=`<div class="rn194-cr rn194-empty"><span class="rn194-gem">◇</span><span><b>Empty rune slot</b><small>Set a rune at the Rune Sanctum in Duskhold.</small></span></div>`;
    else h+=`<div class="rn194-cr rn194-lock"><span class="rn194-gem">🔒</span><span><b>Locked slot</b><small>${i==0?'Unlocks at its first evolution ✦':'Unlocks at its third evolution ✦✦✦'}</small></span></div>`}
  return h+'</div><div class="mut dtl">Runes are permanent once set. Removing one destroys it.</div>'};
// Cheddar's "Rune-Touched" quest: any rune set (gear or companion) counts while you are out on that road
try{if(typeof CHQ132_ID!='undefined'&&CHQ132_ID.h2c)CHQ132_ID.h2c.d='Set a rune into your gear or one of your companions at the Rune Sanctum, then come back out here.'}catch(_){}
function rn194Any(){try{if(rn194HeroRunes().length)return true;if((gear||[]).some(it=>rn194Ru(it).length))return true;return (party||[]).some(c=>c&&c.runes&&c.runes.length)}catch(_){return false}}
if(typeof chqRunes132=='function'){const f=chqRunes132;chqRunes132=function(){const r=f.apply(this,arguments);try{if(rn194Any())chqEv132('rune',1)}catch(_){}return r}}

// ---------------- tooltips and the item panel ----------------
function rn194SlotsHTML(it,cls){const n=it&&it.rs|0;if(!n)return '';const L=rn194Ru(it);let h=`<div class="${cls||'kqm-tx'} rn194-tt"><span class="rn194-tth">Rune slots ${L.length}/${n}</span>`;
  for(let i=0;i<n;i++){const k=L[i],p=k&&rn194Parse(k);h+=p?`<span class="rn194-tr" style="--rc:#${p.T.col.toString(16).padStart(6,'0')}">${p.T.i} <b>${rn194Name(k)}</b> <small>${rn194Desc(k,'h')}</small></span>`:`<span class="rn194-tr rn194-te">◇ Empty ${rn194SlK(it)=='w'?'weapon':'armor'} rune slot</span>`}
  return h+'</div>'}
{const f=kqmGearTip;kqmGearTip=function(it,o){let h=f.apply(this,arguments);try{const x=rn194SlotsHTML(it);if(x){const i=h.indexOf('<div class="kqm-ts" style="margin-top:4px">Upgrade');h=i>=0?h.slice(0,i)+x+h.slice(i):h+x}}catch(_){}return h}}
{const f=idHTML;idHTML=function(){let h=f.apply(this,arguments);try{const it=selI&&(selI.k=='e'?SLOTS.map(k=>eq[k]).find(x=>x&&x.id==selI.id):gear.find(x=>x.id==selI.id));if(it&&it.rs)h+=rn194SlotsHTML(it,'rn194-box')}catch(_){}return h}}
// ---------------- co-op: a partner's gear carries its rune types (for the look) ----------------
{const f=mpMyGear;mpMyGear=function(){const g=f.apply(this,arguments);try{['weapon','offhand','helm','chest','boots'].forEach((k,i)=>{const it=eq[k];if(it&&Array.isArray(g[i])&&rn194Ru(it).length)g[i]=g[i].concat([rn194Ru(it).join(',')])})}catch(_){}return g}}
{const f=mpGearE;mpGearE=function(g){const E=f.apply(this,arguments);try{const S5=['weapon','offhand','helm','chest','boots'];(Array.isArray(g)?g:[]).slice(0,5).forEach((q,i)=>{const it=E[S5[i]];if(it&&Array.isArray(q)&&typeof q[2]=='string'){
  const L=q[2].split(',').filter(k=>rn194Parse(k)).slice(0,3);if(L.length){it.rs=L.length;it.ru=L}}})}catch(_){}return E}}
{const f=mpSanG;mpSanG=function(it){const o=f.apply(this,arguments);if(o){if(o.rs!=null){o.rs=Math.max(0,Math.min(3,o.rs|0));o.ru=(Array.isArray(o.ru)?o.ru:[]).filter(k=>rn194Parse(k)).slice(0,o.rs)}else delete o.ru}return o}}
document.head.insertAdjacentHTML('beforeend',`<style>
.rn194-v{color:#f5e2b0;font-weight:700}
.rn194-cs{display:flex;flex-direction:column;gap:6px;margin:4px 0 6px}
.rn194-cr{display:flex;gap:10px;align-items:center;padding:7px 9px;border-radius:8px;border:1px solid color-mix(in srgb,var(--rc,#7a5cff) 55%,transparent);background:linear-gradient(90deg,color-mix(in srgb,var(--rc,#7a5cff) 16%,transparent),rgba(0,0,0,.25))}
.rn194-cr small{display:block;color:var(--mut);font-size:.72rem;line-height:1.3}.rn194-cr b{font-size:.84rem}
.rn194-cr.rn194-empty,.rn194-cr.rn194-lock{--rc:#5a5a66;opacity:.85}.rn194-cr.rn194-lock{filter:grayscale(.6)}
.rn194-gem{position:relative;flex:none;width:34px;height:34px;display:grid;place-items:center;font-size:1.05rem;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);
  background:radial-gradient(circle at 50% 40%,color-mix(in srgb,var(--rc,#7a5cff) 70%,#fff 10%),color-mix(in srgb,var(--rc,#7a5cff) 30%,#000) 75%)}
.rn194-gem i{position:absolute;bottom:1px;right:6px;font-style:normal;font-size:.55rem;font-weight:900;color:#fff;text-shadow:0 0 3px #000}
.rn194-tt{display:flex;flex-direction:column;gap:3px;margin-top:5px}.rn194-tth{font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:#c9b8ff}
.rn194-tr{font-size:.74rem;padding-left:8px;border-left:2px solid var(--rc,#7a5cff)}.rn194-tr small{color:var(--mut)}.rn194-tr.rn194-te{color:var(--mut);border-left-color:#5a5a66;font-style:italic}
.rn194-box{margin-top:8px;padding:7px 9px;border:1px solid rgba(160,130,255,.35);border-radius:6px;background:rgba(120,90,255,.07)}
</style>`);
