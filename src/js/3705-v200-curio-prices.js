// ================= v200: Curio prices follow the tier of what is sold =================
// Owner (Nov 5 2026): "Curio items are too cheap relative to the rarity of the item they are selling. Higher tier items should
// require higher level resources." Eggs and tiered curios now also cost that tier's upgrade material (UPM: Whetstone,
// Tempered Ore, Cinder Steel, Hollow Silver, Storm Mithril) and much more of the common resources as the tier rises; from
// Tier 3 up eggs take Crystal Shards instead of Old Bone. Runes are priced by rank, not by your tier. Health potions and the
// shop-level discount (5% fewer per level, cu194Off) are unchanged. Stock already on the shelf is repriced once (x2.cu200).
var CU200_EGG=[[10,7,'bone',4,2],[16,12,'bone',7,3],[24,18,'crystal',5,4],[34,26,'crystal',9,6],[46,36,'crystal',14,9]];
function cu200Egg(T){const q=CU200_EGG[Math.max(1,Math.min(5,T))-1];return [['wood',q[0]],['fiber',q[1]],[q[2],q[3]],[UPM[Math.max(1,Math.min(5,T))-1][0],q[4]]]}
cu194Price=function(kind,T,fam){T=Math.max(1,Math.min(5,T|0||1));const U=UPM[T-1][0];let P;
  if(kind=='egg')P=cu200Egg(T);
  else if(kind=='pots')P=[['glowcap',4+T],['petals',3+T]];
  else if(kind=='rune')P=[['crystal',5],['bone',7],[UPM[0][0],1]];
  else if(kind=='rune2')P=[['crystal',16],['bone',14],['Ectoplasm',6],[UPM[2][0],3]];
  else if(kind=='shiny')P=[['crystal',8+4*T],['glowcap',10+4*T],[fam,4+2*T],[U,2+2*T]];
  else if(kind=='armament')P=[['iron',14+8*T],['stone',10+6*T],['crystal',4+2*T],[U,3+2*T]];
  else if(kind=='fortune')P=[['petals',10+3*T],['glowcap',8+3*T],['fiber',8+2*T]];
  else if(kind=='elder'){const E=Math.min(5,T+1);P=cu200Egg(E).map(([k,n])=>[k,Math.ceil(n*1.25)]).concat([[fam,4+E]])}
  else P=[];
  return cu194Off(P.filter(q=>q[0]))};
// stock already on the shelf: priced again once
function cu200Reprice(){const T=cu194T();
  (CU194.wares||[]).forEach(o=>{if(o.sold)return;if(o.k=='egg')o.m=cu194Price('egg',o.t||(o.egg?o.egg.tier+1:T));else if(o.k=='rune')o.m=cu194Price('rune',T)});
  (CU194.cur||[]).forEach((o,i)=>{if(o.sold)return;const fam=(o.m||[]).map(q=>q[0]).find(k=>Object.values(FAM).some(F=>F[0]==k))||cu194Fam(CU194.hk+(i?'b':''));
    const t=o.k=='shiny'&&o.egg?o.egg.tier+1:o.k=='armament'&&o.it?tierOfLv(o.it.lv):T;o.m=cu194Price(o.k,t,fam)})}
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.cu200=1;return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{if(!(s&&s.cu200))cu200Reprice()}catch(e){console.warn('v200 curio',e)}return r}}
