// ================= v37: balance pass — classes, gear upgrades, creature families =================
// Assassin: lower base crit and slightly slower swings
CLS.assassin.crit=.06;CLS.assassin.spd=.43;
// Lethality talents stacked crit damage to +175%; trim them
{const L=TAL.assassin[0].t,set=(id,v,txt)=>{const t=L.find(x=>x[0]==id);if(t){const k=Object.keys(t[5])[0];t[5][k]=v;if(txt)t[4]=txt}};
 set('a2',.07);set('a3',.12);set('a4',.1);set('a5',.25,'Critical hits deal 25% more damage')}
// Paladin hits harder; Mage gets a little more armour (applied once per stat refresh)
function HS(){const s=HS_base();if(!s._bal){s._bal=1;
  if(hero.cls=='paladin'){const pb=.2+.011*hero.lvl;s.basicP+=pb;s.skillP+=pb}
  if(hero.cls=='mage'){s.pd*=1.25}
  if(typeof gearX=='function')gearX(s)}return s}
// Earth: real tanks with a proper bite, and sturdier shields
Object.assign(FAMD.Earth.w,{pa:1.25});FAMD.Earth.spd=.9;
FAMD.Earth.d='Slow, armoured giants. Most health and defense, with a heavy bite and strong shields.';
Object.assign(FAMD.Swarm.w,{pa:1.12,ma:1.08});
{const sw=CSP['Stone Ward'];if(sw){sw.v=.22;sw.d='Wraps you in stone that absorbs 22% of your max health.';sw.emp.v=.18;sw.emp.d='Every 12s you gain a stone shield worth 18% of your max health.'}
 const sp=CSP['Spectral Ward'];if(sp){sp.v=.26;sp.d='Shields you for 26% max health and blasts enemies nearby.'}}
// per-species tuning
var SPM={Soulwarden:{ma:1.25,md:1.1},Rocsovereign:{pa:.9,ma:.9}};
