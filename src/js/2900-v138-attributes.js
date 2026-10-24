// ================= v138: attributes replace talents (owner's request, Oct 2026) =================
// Levelling up used to add a big flat amount of every stat (CLS[c].per) plus a talent point. Now:
//  * the flat gain per level is ATR138.flat (55%) of the old health / attack / defense growth (mana keeps its old growth);
//  * every level gives ATR138.per (3) attribute points to spend on Intellect, Strength, Dexterity, Vigor, Wisdom, Luck;
//    each point adds a little (ATR138.D[k].p) and reaching 10 / 25 / 50 / 75 points in one attribute unlocks a bonus (D[k].T);
//  * talents are gone: talRank() is 0 for every talent, talMods() returns the attribute bonuses instead (HS_base adds them
//    where it added talents), tpFree() (0120) counts unspent attribute points (the hud's "✦ N points · C" chip).
// Points live in hero.tal['__at:<key>'] (saved with the hero; '__' keys survive the ability reset). Old saves: talent ranks are
// removed on load (they were stat bonuses only) and the hero gets every attribute point of their level to spend.
// Spending is staged: + buttons add pending points (ATR138.pend), Apply commits them, Undo drops them, Auto fills the free
// points in the class's usual mix (ATR138.auto). Reset (40 gold per level, also the Magic Shop's Tome) takes all of them back.
// The Character window (C, 2910) and the block under the hero in the inventory show them.
var ATR138={per:3,flat:.55,
  K:['int','str','dex','vig','wis','lck'],
  D:{
    int:{n:'Intellect',ab:'INT',i:'🔮',col:'#8ab4ff',d:'Magical attack and mana',p:{ma:1.4,mp:1.5},
      T:[[10,{skillP:.05},'+5% ability damage'],[25,{aoeP:.1},'Ability areas 10% larger'],[50,{maP:.08},'+8% magical attack'],[75,{skillP:.1,cdr:.05},'+10% ability damage and 5% faster cooldowns']]},
    str:{n:'Strength',ab:'STR',i:'💪',col:'#ff8a5a',d:'Physical attack and a little physical defense',p:{pa:1.4,pd:.25},
      T:[[10,{basicP:.05},'+5% basic attack damage'],[25,{finisher:.15},'Combo finishers deal 15% more'],[50,{paP:.08},'+8% physical attack'],[75,{exec:.15},'+15% damage to enemies under 35% health']]},
    dex:{n:'Dexterity',ab:'DEX',i:'🏹',col:'#7ee08a',d:'Critical chance, attack speed and a little physical attack',p:{pa:.35,crit:.004,as:.004},
      T:[[10,{as:.05},'+5% attack speed'],[25,{iframe:.1},'Dashes stay invulnerable 0.1 s longer'],[50,{crit:.05},'+5% critical hit chance'],[75,{dash:1},'+1 dash charge']]},
    vig:{n:'Vigor',ab:'VIG',i:'❤️',col:'#ff6b7a',d:'Health and defense',p:{hp:10,pd:.5,md:.35},
      T:[[10,{hpP:.05},'+5% max health'],[25,{regen:.004},'Regenerate 0.4% health per second in combat'],[50,{pdP:.08,mdP:.08},'+8% physical and magical defense'],[75,{lowdr:.15},'15% less damage taken below 40% health']]},
    wis:{n:'Wisdom',ab:'WIS',i:'📖',col:'#c79bff',d:'Mana, mana regeneration, magical defense and healing received',p:{mp:3.5,md:.55,mpr:.0002,healP:.004},
      T:[[10,{mpP:.1},'+10% max mana'],[25,{healP:.15},'Healing you receive is 15% stronger'],[50,{cdr:.06},'Abilities cool down 6% faster'],[75,{killheal:.03},'Heal 3% of max health on every kill']]},
    lck:{n:'Luck',ab:'LCK',i:'🍀',col:'#f0cc72',d:'Critical chance, critical damage and loot find',p:{crit:.0025,cdm:.012,loot:.004},
      T:[[10,{loot:.05},'+5% loot find'],[25,{cdm:.2},'Critical hits deal 20% more damage'],[50,{ls:.02},'Heal for 2% of the damage you deal'],[75,{crit:.05,cdm:.25},'+5% critical chance and +25% critical damage']]}
  },
  // Auto: the share of points each class usually puts where (ratios, not points)
  auto:{warrior:{str:4,vig:4,dex:1.5,lck:.5},paladin:{str:3.5,vig:4,wis:1.5,int:1},assassin:{dex:3.5,str:3,vig:2,lck:1.5},ranger:{dex:3,str:3,vig:2.5,lck:1.5},mage:{int:5,wis:2.5,vig:2.5}},
  pend:{},sel:null};
// what one point / each bonus does, in words (for tooltips and the Character window)
var ATR138_SN={hp:['health',0],mp:['mana',0],pa:['physical attack',0],ma:['magical attack',0],pd:['physical defense',0],md:['magical defense',0],
  crit:['critical chance',1],cdm:['critical damage',1],as:['attack speed',1],mpr:['mana regeneration per second',1],healP:['healing received',1],loot:['loot find',1]};
function atr138PerTxt(k){const p=ATR138.D[k].p;return Object.keys(p).map(s=>{const q=ATR138_SN[s]||[s,0];return '+'+(q[1]?+(p[s]*100).toFixed(2)+'%':+p[s].toFixed(2))+' '+q[0]}).join(', ')}
// ---- the flat gain per level: 55% of the old health / attack / defense growth ----
CLSK.forEach(c=>{const P=CLS[c].per;['hp','pa','ma','pd','md'].forEach(k=>{P[k]=+(P[k]*ATR138.flat).toFixed(3)})});
// ---- points ----
function atr138Pts(k){return (hero&&hero.tal&&hero.tal['__at:'+k])|0}
function atr138Spent(){let n=0;ATR138.K.forEach(k=>n+=atr138Pts(k));return n}
function atr138Earned(){return Math.max(0,((hero&&hero.lvl|0)-1)*ATR138.per)}
function atr138Unspent(){return Math.max(0,atr138Earned()-atr138Spent())}
function atr138PendN(){let n=0;for(const k in ATR138.pend)n+=ATR138.pend[k]|0;return n}
function atr138Free(){return Math.max(0,atr138Unspent()-atr138PendN())}
// the stat bonuses of a set of points (default: what is spent)
function atr138ModsOf(P){const o={},add=(s,m)=>{for(const k in s)o[k]=(o[k]||0)+s[k]*m};
  ATR138.K.forEach(k=>{const v=P[k]|0,D=ATR138.D[k];if(!v)return;add(D.p,v);D.T.forEach(t=>{if(v>=t[0])add(t[1],1)})});return o}
function atr138Cur(){const P={};ATR138.K.forEach(k=>P[k]=atr138Pts(k));return P}
// ---- talents are gone: HS_base's talent hook now carries the attributes ----
talRank=function(){return 0};
talMods=function(){try{return atr138ModsOf(atr138Cur())}catch(e){return {}}};
talSpent=function(){return atr138Spent()};
// every talent id of every class (to clear them out of old saves)
function atr138TalIds(){const S=new Set();try{for(const c in TAL)TAL[c].forEach(b=>b.t.forEach(t=>S.add(t[0])))}catch(_){}return S}
function atr138Migrate(){if(!hero.tal||typeof hero.tal!='object')hero.tal={};const ids=atr138TalIds();let n=0;
  for(const k of Object.keys(hero.tal))if(ids.has(k)){n+=hero.tal[k]|0;delete hero.tal[k]}
  const first=!hero.tal.__at138;hero.tal.__at138=1;ATR138.pend={};hsDirty();
  if(first&&(hero.lvl|0)>1)setTimeout(()=>{try{say('✦ <b>Talents are now attributes.</b> You have <b>'+atr138Unspent()+'</b> attribute points to spend: press <b>C</b> for your character (abilities moved to <b>K</b>).')}catch(_){}},2600);
  return n}
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{atr138Migrate()}catch(e){console.warn('v138 attributes',e)}return r}}
// a new hero starts on attributes (no 'talents are now attributes' note later)
{const f=ccBegin;ccBegin=function(){const r=f.apply(this,arguments);try{if(!hero.tal||typeof hero.tal!='object')hero.tal={};hero.tal.__at138=1;ATR138.pend={}}catch(_){}return r}}
// ---- spending ----
function atr138Add(k,n){if(!ATR138.D[k])return 0;n=Math.min(n||1,atr138Free());if(n<=0)return 0;ATR138.pend[k]=(ATR138.pend[k]|0)+n;atr138Refresh();return n}
function atr138Sub(k,n){const c=ATR138.pend[k]|0;if(!c)return 0;n=Math.min(n||1,c);ATR138.pend[k]=c-n;if(!ATR138.pend[k])delete ATR138.pend[k];atr138Refresh();return n}
function atr138Undo(){ATR138.pend={};atr138Refresh()}
function atr138Apply(){const n=atr138PendN();if(!n)return 0;const mx0=heroMax();
  for(const k in ATR138.pend){const v=ATR138.pend[k]|0;if(v>0)hero.tal['__at:'+k]=atr138Pts(k)+v}
  ATR138.pend={};hsDirty();const mx=heroMax();if(mx>mx0)hero.hp=Math.min(mx,hero.hp+(mx-mx0));hero.hp=Math.min(hero.hp,mx);
  try{mSfx('rare')}catch(_){try{sfx('chime')}catch(__){}}try{say('✦ Spent '+n+' attribute point'+(n==1?'':'s')+'.')}catch(_){}
  try{hud()}catch(_){}atr138Refresh();return n}
// Auto: hand out the free points one at a time to whichever attribute is furthest below the class's usual share
function atr138Auto(){const W=ATR138.auto[hero.cls]||ATR138.auto.warrior,tot=Object.values(W).reduce((a,b)=>a+b,0);let n=atr138Free(),g=0;
  while(n-->0){const all=atr138Spent()+atr138PendN()+1;let best=null,bd=-1e9;
    for(const k in W){const d=W[k]/tot*all-(atr138Pts(k)+(ATR138.pend[k]|0));if(d>bd){bd=d;best=k}}
    if(!best)break;ATR138.pend[best]=(ATR138.pend[best]|0)+1;g++}
  atr138Refresh();return g}
function atr138Clear(){ATR138.K.forEach(k=>{delete hero.tal['__at:'+k]});ATR138.pend={};hsDirty();hero.hp=Math.min(hero.hp,heroMax());try{hud()}catch(_){}atr138Refresh()}
function atr138ResetCost(){return 40*(hero.lvl|0)}
function atr138Reset(){const c=atr138ResetCost();if(!atr138Spent())return false;if(gold<c){say('Taking back your attribute points costs '+c+' gold.');return false}
  gold-=c;atr138Clear();say('✦ Your attribute points were returned ('+c+' gold). Spend them again.');return true}
// stats with the pending points counted (for the "→" previews); restores everything afterwards
function atr138Preview(){if(!atr138PendN())return null;const keep={};
  for(const k in ATR138.pend){keep[k]=hero.tal['__at:'+k];hero.tal['__at:'+k]=atr138Pts(k)+(ATR138.pend[k]|0)}
  let s=null;try{hsDirty();s=Object.assign({},HS());s._mx=heroMax();s._mm=typeof mpMax=='function'?mpMax():s.mp;s._pw=heroPower()}
  finally{for(const k in keep){if(keep[k]==null)delete hero.tal['__at:'+k];else hero.tal['__at:'+k]=keep[k]}hsDirty()}
  return s}
// everything that shows attributes redraws through here (Character window, inventory block)
var ATR138_R=[];
function atr138Refresh(){ATR138_R.forEach(f=>{try{f()}catch(e){console.warn('v138 attr ui',e)}})}
// the rows of attributes (full: Character window; compact: under the hero in the inventory)
function atr138Rows(compact){const free=atr138Free();
  return ATR138.K.map(k=>{const D=ATR138.D[k],v=atr138Pts(k),p=ATR138.pend[k]|0,tot=v+p,nx=D.T.find(t=>tot<t[0]);
    const tip=D.n+': '+D.d+'. Each point: '+atr138PerTxt(k)+'.'+(nx?' Next bonus at '+nx[0]+': '+nx[2]+'.':' Every bonus unlocked.');
    return `<div class="at138${ATR138.sel==k?' on':''}" data-at138i="${k}" title="${tip.replace(/"/g,'&quot;')}" style="--ac:${D.col}">`+
      `<span class="at138-ic">${D.i}</span><span class="at138-n">${compact?D.ab:D.n}</span>`+
      `<span class="at138-v">${v}${p?`<em>+${p}</em>`:''}</span>`+
      (compact?'':`<span class="at138-pips">${D.T.map(t=>`<i class="${tot>=t[0]?(v>=t[0]?'got':'new'):''}" title="${t[0]}: ${t[2]}">${t[0]}</i>`).join('')}</span>`)+
      `<span class="at138-b"><button data-at138m="${k}" ${p?'':'disabled'} title="Take one back">−</button><button data-at138="${k}" ${free?'':'disabled'} title="+1 (Shift: +5)">+</button></span></div>`}).join('')}
function atr138Bar(compact){const fr=atr138Free(),pn=atr138PendN(),sp=atr138Spent();
  return `<div class="at138-bar"><span class="at138-free"><b>${fr}</b> point${fr==1?'':'s'} to spend</span><span class="at138-act">`+
    (fr?`<button data-at138x="auto" title="Spend the free points in your class's usual mix (you still press Apply)">Auto</button>`:'')+
    (pn?`<button data-at138x="undo">Undo</button><button class="pri" data-at138x="apply">Apply +${pn}</button>`:'')+
    (!compact&&sp&&!pn?`<button data-at138x="reset" title="Take back every attribute point to spend again">Reset (🪙 ${atr138ResetCost()})</button>`:'')+`</span></div>`}
document.addEventListener('click',e=>{const t=e.target.closest('[data-at138],[data-at138m],[data-at138x],[data-at138i]');if(!t)return;
  if(!t.closest('#tal')&&!t.closest('#kqmAtr138'))return;const D=t.dataset;
  if(D.at138!=null){e.stopPropagation();atr138Add(D.at138,e.shiftKey?5:1);return}
  if(D.at138m!=null){e.stopPropagation();atr138Sub(D.at138m,e.shiftKey?5:1);return}
  if(D.at138x){e.stopPropagation();const x=D.at138x;if(x=='auto')atr138Auto();else if(x=='undo')atr138Undo();else if(x=='apply')atr138Apply();else if(x=='reset'){if(atr138Reset())atr138Refresh()}return}
  if(D.at138i){ATR138.sel=ATR138.sel==D.at138i?null:D.at138i;atr138Refresh()}},true);
// ---- the inventory: the attributes sit under the hero, after the stat summary ----
{const f=kqmDoll;kqmDoll=function(){const r=f.apply(this,arguments);try{let el=$('kqmAtr138');const sum=$('kqmSum');
  if(!el&&sum){el=document.createElement('div');el.id='kqmAtr138';el.className='kqm-atr138';sum.after(el)}
  if(el)el.innerHTML=`<div class="at138-h">✦ Attributes</div>`+atr138Bar(true)+`<div class="at138-g c">${atr138Rows(true)}</div>`}catch(e){console.warn('v138 bag attr',e)}return r}}
ATR138_R.push(()=>{const b=$('bag');if(b&&!b.classList.contains('hide')&&$('kqmAtr138'))kqmDoll()});
// a new level: the chip in the buff bar shows the points; a short hint the first few times
{const f=heroLevelUp;heroLevelUp=function(){const r=f.apply(this,arguments);try{atr138Refresh()}catch(_){}return r}}
document.head.insertAdjacentHTML('beforeend',`<style>
.at138-g{display:grid;gap:4px}.at138-g.c{grid-template-columns:1fr 1fr;gap:3px 6px}
.at138{display:grid;grid-template-columns:auto 1fr auto auto auto;align-items:center;gap:6px;padding:4px 6px;border:1px solid rgba(255,255,255,.08);border-radius:6px;background:rgba(0,0,0,.22);cursor:pointer;min-width:0}
.at138:hover,.at138.on{border-color:var(--ac,#f0cc72)}
.at138-g.c .at138{grid-template-columns:auto 1fr auto auto;padding:2px 4px;gap:4px}
.at138-ic{font-size:1rem;line-height:1}.at138-g.c .at138-ic{font-size:.8rem}
.at138-n{font-weight:700;color:var(--ac,#f0cc72);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.at138-g.c .at138-n{font-size:.68rem;letter-spacing:.04em}
.at138-v{font-weight:800;color:#f4ead2;min-width:2.2em;text-align:right}.at138-g.c .at138-v{font-size:.74rem;min-width:1.6em}
.at138-v em{font-style:normal;color:#7ef0a0;font-size:.8em;margin-left:2px}
.at138-pips{display:flex;gap:3px}.at138-pips i{font-style:normal;font-size:.62rem;padding:1px 4px;border-radius:3px;border:1px solid rgba(255,255,255,.14);color:#8a8070}
.at138-pips i.got{border-color:var(--ac);color:#1a1208;background:var(--ac)}.at138-pips i.new{border-color:#7ef0a0;color:#7ef0a0}
.at138-b{display:flex;gap:2px}.at138-b button{min-width:22px;height:22px;padding:0 5px;font-size:.8rem;line-height:1}
.at138-g.c .at138-b button{min-width:18px;height:18px;font-size:.72rem;padding:0 3px}
.at138-b button[data-at138m]{opacity:.85}.at138-b button[data-at138m]:disabled{visibility:hidden}
.at138-bar{display:flex;align-items:center;justify-content:space-between;gap:6px;margin:4px 0;font-size:.74rem;flex-wrap:wrap}
.at138-free b{color:#f0cc72;font-size:.9rem}.at138-act{display:flex;gap:4px;flex-wrap:wrap}.at138-act button{padding:2px 8px;font-size:.72rem}
.kqm-atr138{margin-top:6px;border-top:1px solid rgba(240,204,114,.18);padding-top:5px}
.at138-h{font-family:'Cinzel Decorative',serif;font-size:.7rem;letter-spacing:.12em;color:#c9a24a;text-transform:uppercase}
</style>`);
