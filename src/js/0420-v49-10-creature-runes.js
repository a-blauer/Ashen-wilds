// =============== 10. CREATURE RUNES ===============
const RUNES={r_ember:['Ember Rune','🔥','Attacks set enemies on fire (fire element).',{el:'fire'}],r_frost:['Frost Rune','❄️','Attacks chill enemies (frost element).',{el:'frost'}],r_storm:['Storm Rune','⚡','Attacks shock enemies (lightning element).',{el:'shock'}],
 r_tide:['Tide Rune','💧','Attacks soak enemies (water element).',{el:'water'}],r_venom:['Venom Rune','☠️','Attacks poison enemies (poison element).',{el:'poison'}],
 r_might:['Might Rune','💪','+15% physical and magical attack.',{pa:1.15,ma:1.15}],r_ward:['Ward Rune','🛡️','+20% health and defenses.',{hp:1.2,pd:1.2,md:1.2}],
 r_swift:['Swift Rune','💨','Spells recharge 30% faster.',{swift:1}],r_leech:['Leech Rune','🩸','Heals 8% of the damage it deals.',{leech:.08}]};
const RUNEK=Object.keys(RUNES);
RUNEK.forEach(k=>{SUP[k]={n:RUNES[k][0],i:RUNES[k][1],c:'rune',d:RUNES[k][2]}});
function runeEl(c){}
function runeMul(c,k){}
function runeHit(c,d){}
function runeTick(dt){}
function runeHTML(c){}
$('cd').addEventListener('click',e=>{const a=e.target.closest('[data-runadd],[data-runrm]');if(!a)return;const c=party[cmpSel];if(!c)return;c.runes=c.runes||[];
  if(a.dataset.runadd){const k=a.dataset.runadd;if(c.runes.length>=2||!(cnt(k)>0))return;sup[k]--;c.runes.push(k);say(RUNES[k][1]+' '+RUNES[k][0]+' socketed into '+c.n+'.');sfx('chime')}
  else{const k=c.runes.splice(+a.dataset.runrm,1)[0];if(k)giveS(k,1)}
  hsDirty();c.h=Math.min(c.h,M(c));rC();ui();hud()});

