// ================= v134: very rare items you can only fish up =================
// Six uniques that never drop from monsters (src 'fish', no zone): four pieces of jewellery with their own models and one weapon
// of your class dressed in barnacles, coral and kelp. Any catch anywhere may bring one up with the fish: 0.4% / 0.8% / 1.5% / 3%
// for a common / uncommon / rare / legendary fish (UNQ134_FISH), at the level fishing treasure uses. They work like the zone
// uniques (2470): legendary rarity, own name, fixed bonus, "✦ Unique · Fished up" in the tooltip.
var UNQ134_FISH=[.004,.008,.015,.03];
Object.assign(UNQ134,{
 pearl:{src:'fish',sl:'amulet',n:"Leviathan's Pearl",fl:'Pried from a shell the size of a cart. It glows when the tide turns.',e:{hpP:.1,regen:.008},gem:0xdff6ff,
   kit(k){const S=0x6a5a6a;k.p('','ring','m',0xc8ccd4,0,.03,0,.03,.2,.03,Math.PI/2);k.p('','hem','c',S,0,-.12,0,.075,.04,.06,Math.PI);k.p('','hem','c',lgCol(S,0xe8d8e0,.3),0,-.1,-.01,.075,.05,.06,-.9);
     k.p('','sph2','g',0xeef8ff,0,-.105,.015,.034);k.p('','sph','g',0xffffff,.012,-.095,.04,.008)}},
 lure:{src:'fish',sl:'ring',n:"Angler's Lure",fl:'The lure that caught the thing that ate the angler.',e:{loot:.15,xp:.05},gem:0xff8a30,
   kit(k){k.p('','ring','m',0x9a7838,0,0,0,.1,.16,.1,Math.PI/2);k.L('','c',0xd8d0b8,[0,.1,0],[.03,.17,.01],.002,.002,3);k.p('','sph2','g',0xff8a30,.035,.19,.012,.016,.02,.014);
     k.p('','cone4','m',0xc8ccd4,.04,.165,.012,.005,.02,.005,Math.PI);[-1,1].forEach(s=>k.p('','box','c',0xffd060,.035+s*.012,.195,.012,.012,.004,.006,0,0,s*.6))}},
 conch:{src:'fish',sl:'amulet',n:'Tidecaller Conch',fl:'Hold it to your ear and the sea answers.',e:{cdr:.08,skillP:.08},gem:0x7ad8ff,
   kit(k){const C=0xe8c8a8;k.p('','ring','m',0x9a7838,0,.03,0,.03,.2,.03,Math.PI/2);for(let i=0;i<6;i++){const t=i/5;k.p('','sph',i%2?'c':'c',lgCol(C,0xd88a6a,t*.6),.03*Math.sin(t*5),-.04-t*.13,.03*Math.cos(t*5)*.5,.05-t*.035,.04-t*.022,.045-t*.03)}
     k.p('','cone4','c',0xf0e0d0,0,-.2,0,.012,.04,.012,Math.PI);k.p('','sph','g',0x7ad8ff,-.01,-.06,.04,.012)}},
 sailor:{src:'fish',sl:'ring',n:"Drowned Sailor's Band",fl:'Barnacled and green, and still warm.',e:{dr:.05,ls:.03},gem:0x5ac8a0,
   kit(k){const B=0x5a7a62;k.p('','ring','m',B,0,0,0,.1,.18,.1,Math.PI/2);[[.07,.08,.02],[-.09,.04,.01],[.02,-.1,.02],[-.05,-.08,-.01]].forEach(([x,y,z])=>k.p('','sph','c',0xd8d0c0,x,y,z,.016,.012,.016));
     k.L('','m',0x3a4a40,[0,.11,0],[0,.18,0],.006,.006,4);k.L('','m',0x3a4a40,[-.03,.13,0],[.03,.13,0],.005,.005,4);k.p('','ring','m',0x3a4a40,0,.17,0,.03,.2,.03,0,0,Math.PI/2)}},
 abyssal:{src:'fish',sl:'weapon',n:'Abyssal',fl:'Dredged from the deep, still crusted with the deep.',e:{as:.08,paP:.06,maP:.06},gem:0x4ab8d8,tint:0x3a6a6a,orn:6}});
for(const k in UNQ134)UNQ134[k].key=k;
// barnacles, coral and kelp along the weapon
UNQ134_ORN[6]=(k,p,i,R)=>{if(i%3==0)k.p('','cone4','c',0xd86a5a,p.x,p.y,p.z+.02,.008,.05,.008,R()-.5,0,R()-.5);else if(i%3==1){for(let j=0;j<3;j++)k.p('','sph','c',0xd8d0c0,p.x+(R()-.5)*.03,p.y+(R()-.5)*.03,p.z+.01,.01)}
  else k.L('','c',0x2a5a3a,[p.x,p.y,p.z],[p.x+.04,p.y-.07,p.z+.01],.006,.002,3)};
// the zone ornament set a weapon uses: its own (orn) or its zone's
{const f=unqWpnKit134;unqWpnKit134=function(k,it,U){if(U&&U.orn!=null&&U.orn!==U.z)return f.call(this,k,it,Object.assign({},U,{z:U.orn}));return f.apply(this,arguments)}}
// monsters never drop them; the tooltip says where they come from
for(const z in UNQ134_ZK)UNQ134_ZK[z]=UNQ134_ZK[z].filter(k=>UNQ134[k].src!=='fish');
{const f=unqTipHTML134;unqTipHTML134=function(it){const U=unqOf134(it);if(!U||U.src!=='fish')return f.apply(this,arguments);
  return f.apply(this,arguments).replace(/✦ Unique · [^<]*/,'✦ Unique · Fished up')}}
function unqFish134(r,p){const ch=UNQ134_FISH[Math.max(0,Math.min(3,r|0))]||0;if(Math.random()>=ch)return false;
  const L=Object.keys(UNQ134).filter(k=>UNQ134[k].src==='fish'),lv=Math.max(1,Math.min(MAXLV,Math.max(hero.lvl-1,(typeof zoneLv=='function'?zoneLv(p.x,p.z):hero.lvl))));
  const it=unqMake134(L[R(0,L.length-1)],lv);if(!it)return false;drop('gear',it,p.clone().add(V(.6,0,-.6)),it.r);
  try{banner('✦ SOMETHING RARE ON THE LINE',unqName134(it),'Fished up · '+SLOTN[itT(it).sl])}catch(_){}try{mSfx('rare')}catch(_){try{sfx('chime')}catch(__){}}return true}
{const f=fishTreasure;fishTreasure=function(r,T,p){try{if(p&&unqFish134(r,p))return}catch(err){console.warn('v134 fish unique',err)}return f.apply(this,arguments)}}
