// =============== 10. CREATURE RUNES ===============
const RUNES={r_ember:['Ember Rune','🔥','Attacks set enemies on fire (fire element).',{el:'fire'}],r_frost:['Frost Rune','❄️','Attacks chill enemies (frost element).',{el:'frost'}],r_storm:['Storm Rune','⚡','Attacks shock enemies (lightning element).',{el:'shock'}],
 r_tide:['Tide Rune','💧','Attacks soak enemies (water element).',{el:'water'}],r_venom:['Venom Rune','☠️','Attacks poison enemies (poison element).',{el:'poison'}],
 r_might:['Might Rune','💪','+15% physical and magical attack.',{pa:1.15,ma:1.15}],r_ward:['Ward Rune','🛡️','+20% health and defenses.',{hp:1.2,pd:1.2,md:1.2}],
 r_swift:['Swift Rune','💨','Spells recharge 30% faster.',{swift:1}],r_leech:['Leech Rune','🩸','Heals 8% of the damage it deals.',{leech:.08}]};
const RUNEK=Object.keys(RUNES);
RUNEK.forEach(k=>{SUP[k]={n:RUNES[k][0],i:RUNES[k][1],c:'rune',d:RUNES[k][2]}});
const runeOf=(c,f)=>(c.runes||[]).map(k=>RUNES[k]&&RUNES[k][3]).filter(Boolean);
function runeEl(c){const r=runeOf(c).find(q=>q.el);return r?r.el:null}
function runeMul(c,k){let m=1;runeOf(c).forEach(q=>{if(q[k])m*=q[k]});return m}
function runeHit(c,d){const l=runeOf(c).find(q=>q.leech);if(l&&c.h>0)c.h=Math.min(M(c),c.h+d*l.leech)}
function runeTick(dt){if(dt<=0)return;party.slice(0,actN141()).forEach(c=>{if(!c||!c.cdm||!runeOf(c).some(q=>q.swift))return;for(const k in c.cdm)c.cdm[k]=Math.max(0,c.cdm[k]-dt*.43)})}
function runeHTML(c){const slots=c.runes||[],own=RUNEK.filter(k=>cnt(k)>0);
  let h=`<div class="sec">Runes (${slots.length}/2)</div><div class="runeS">`+[0,1].map(i=>{const k=slots[i];return k?`<button data-runrm="${i}" title="Remove (returns the rune)">${RUNES[k][1]} <b>${RUNES[k][0]}</b><small>${RUNES[k][2]}</small></button>`:`<div class="rempty">Empty rune slot</div>`}).join('')+'</div>';
  if(slots.length<2)h+=own.length?`<div class="runeL">`+own.map(k=>`<button data-runadd="${k}">${RUNES[k][1]} ${RUNES[k][0]} ×${cnt(k)}</button>`).join('')+'</div>':'<div class="mut dtl">No runes. Find them on elites, bosses, chests, events and rare fish, or buy them from the Rune Sage when it visits Duskhold.</div>';
  return h}
$('cd').addEventListener('click',e=>{const a=e.target.closest('[data-runadd],[data-runrm]');if(!a)return;const c=party[cmpSel];if(!c)return;c.runes=c.runes||[];
  if(a.dataset.runadd){const k=a.dataset.runadd;if(c.runes.length>=2||!(cnt(k)>0))return;sup[k]--;c.runes.push(k);say(RUNES[k][1]+' '+RUNES[k][0]+' socketed into '+c.n+'.');sfx('chime')}
  else{const k=c.runes.splice(+a.dataset.runrm,1)[0];if(k)giveS(k,1)}
  hsDirty();c.h=Math.min(c.h,M(c));rC();ui();hud()});

