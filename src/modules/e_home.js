// ================= v3: Realm building overhaul, farming, cooking, alchemy, supplies =================
// ---------- one shared pop-up window for the new menus ----------
let xwMode='',xwArg=null;const XR={};
function openX(m,a){xwMode=m;xwArg=a==null?null:a;$('xw').classList.remove('hide');rX()}
function closeX(){$('xw').classList.add('hide');xwMode=''}
function rX(){const f=XR[xwMode];if(f)f()}
$('xwClose').onclick=closeX;
// ---------- supplies: ingredients, crops, seeds, food, potions, elixirs, catalysts ----------
const sup={};
const CROPS={
 wheat:{n:'Wheat',i:'🌾',t:180,y:[3,4],st:'grain',c:0xe8c860,tr:1,pr:8},
 carrot:{n:'Carrot',i:'🥕',t:150,y:[2,3],st:'root',c:0xf08a2a,tr:1,pr:8},
 sunleaf:{n:'Sunleaf',i:'🌿',t:150,y:[2,3],st:'herb',c:0xf0e040,tr:1,pr:12},
 pepper:{n:'Fire Pepper',i:'🌶️',t:240,y:[2,3],st:'bush',c:0xe83a2a,tr:2,pr:20},
 moonpetal:{n:'Moonpetal',i:'🌙',t:240,y:[2,3],st:'herb',c:0x9ab0ff,tr:2,pr:20},
 pumpkin:{n:'Pumpkin',i:'🎃',t:360,y:[1,2],st:'vine',c:0xf0902a,tr:3,pr:35},
 emberroot:{n:'Emberroot',i:'🔥',t:300,y:[2,3],st:'root',c:0xff5a2a,tr:3,pr:35},
 frostcap:{n:'Frostcap',i:'❄️',t:300,y:[2,3],st:'shroom',c:0x9ae8ff,tr:4,pr:50},
 starbloom:{n:'Starbloom',i:'🌟',t:600,y:[1,2],st:'herb',c:0xffe08a,tr:5,pr:120}
};
const SUP={meat:{n:'Raw Meat',i:'🥩',c:'ing',d:'Dropped by beasts, birds, dragons and earth creatures.'},fish:{n:'Fish',i:'🐟',c:'ing',d:'Caught while wading for clay at the water.'},
 berries:{n:'Wild Berries',i:'🫐',c:'ing',d:'Foraged from bushes.'},honey:{n:'Honey',i:'🍯',c:'ing',d:'Collected from a Beehive in your Realm.'}};
Object.keys(CROPS).forEach(k=>{const C=CROPS[k];SUP[k]={n:C.n,i:C.i,c:'crop',d:'Grown on a Farm Plot.'};SUP['s_'+k]={n:C.n+' Seeds',i:C.i,c:'seed',crop:k,d:'Plant on a Farm Plot · ready in '+Math.round(C.t/60)+' min.'}});
// [key, name, icon, recipe, makes, stat buff, description, minutes]
const FOOD=[
 ['f_meat','Grilled Meat','🍖',{meat:2},1,{hpP:.08,regen:.002},'+8% max health, health regen in combat',15],
 ['f_fish','Grilled Fish','🍤',{fish:2},1,{pdP:.1,mdP:.1},'+10% physical & magical defense',15],
 ['f_bread','Fresh Bread','🍞',{wheat:3},1,{mpP:.12,mpr:.004},'+12% max mana, faster mana regen',15],
 ['f_soup','Carrot Soup','🥣',{carrot:3,glowcap:1},1,{hpP:.12,regen:.003},'+12% max health, health regen in combat',15],
 ['f_stew','Hearty Stew','🍲',{meat:2,carrot:2,wheat:1},2,{hpP:.15,pdP:.08},'+15% max health, +8% physical defense',15],
 ['f_skewer','Fire Skewer','🍢',{meat:2,pepper:2},1,{paP:.12,maP:.12},'+12% physical & magical attack',15],
 ['f_tart','Berry Tart','🍰',{wheat:2,berries:3},1,{as:.08,mspd:.06},'+8% attack speed, +6% move speed',15],
 ['f_cake','Honey Cake','🧁',{wheat:2,honey:2},1,{mpP:.1,cdr:.06},'+10% max mana, +6% cooldown reduction',15],
 ['f_pie','Pumpkin Pie','🥧',{pumpkin:1,wheat:2,honey:1},2,{xp:.1,loot:.1},'+10% XP, +10% loot find',15],
 ['f_feast',"Hunter's Feast",'🍱',{meat:2,fish:1,pumpkin:1,carrot:2,wheat:2},2,{hpP:.1,paP:.08,maP:.08,pdP:.08,mdP:.08},'+10% health, +8% attack and defense',25]
];
const ALCH=[
 ['p_hp','Health Potion','🧪',{sunleaf:2,glowcap:1},2,null,'Heals 40% health (Q)'],
 ['p_mp','Mana Potion','🫙',{moonpetal:2,crystal:1},2,null,'Restores 50% mana (Z)'],
 ['e_might','Elixir of Might','⚗️',{emberroot:2,pepper:1,crystal:1},1,{paP:.15,maP:.15},'+15% physical & magical attack for 10 min',10],
 ['e_stone','Stoneskin Elixir','🗿',{frostcap:2,stone:4},1,{pdP:.2,mdP:.2},'+20% physical & magical defense for 10 min',10],
 ['e_swift','Swiftness Draught','💨',{sunleaf:2,petals:3},1,{mspd:.12,as:.08},'+12% move speed, +8% attack speed for 10 min',10],
 ['e_fort','Fortune Tonic','🍀',{moonpetal:2,starbloom:1,honey:1},1,{loot:.25,xp:.1},'+25% loot find, +10% XP for 10 min',10],
 ['fert','Fertilizer','🧺',{bone:2,glowcap:1,sunleaf:1},3,null,'Use on a growing crop: grows 50% faster and yields +1'],
 ['c_kin','Kinship Draught','💞',{sunleaf:2,moonpetal:2,petals:4},1,null,'Fusion catalyst: +25% fusion value'],
 ['c_asc','Ascendant Tincture','🔺',{emberroot:2,frostcap:2,starbloom:1},1,null,'Fusion catalyst: removes the lower-tier half-value penalty, then +25%'],
 ['c_bind','Binding Salts','🧂',{starbloom:2,crystal:3,bone:3},1,null,'Fusion catalyst: lets two different families fuse'],
 ['c_ess','Essence of Potential','✨',{starbloom:3,moonpetal:3,'Tempered Ore':1},1,null,'Fusion catalyst: +60% fusion value, and a modifier always passes on']
];
FOOD.forEach(r=>SUP[r[0]]={n:r[1],i:r[2],c:'food',s:r[5],d:r[6],dur:r[7]});
ALCH.forEach(r=>SUP[r[0]]={n:r[1],i:r[2],c:r[0][0]=='e'?'elixir':r[0][0]=='c'?'cat':r[0]=='fert'?'fert':'pot',s:r[5],d:r[6],dur:r[7]});
const CATS=['c_kin','c_asc','c_bind','c_ess'];
const cnt=k=>k=='p_hp'?pots:SUP[k]?(sup[k]||0):(mats[k]||0);
const recOk=r=>Object.keys(r).every(k=>cnt(k)>=r[k]);
function spend(r){for(const k in r){if(SUP[k])sup[k]-=r[k];else mats[k]-=r[k]}}
const giveS=(k,n)=>{if(k=='p_hp')pots+=n;else sup[k]=(sup[k]||0)+n};
const supIco=k=>SUP[k]?SUP[k].i:matInfo(k)[1],supNm=k=>SUP[k]?SUP[k].n:matInfo(k)[0];
const recHTML=r=>Object.keys(r).map(k=>`<span style="color:${cnt(k)>=r[k]?'#6ee7b7':'#f87171'}">${supIco(k)} ${supNm(k)} ${cnt(k)}/${r[k]}</span>`).join(' · ');
function gotS(k,n){giveS(k,n);pickup({ic:SUP[k].c=='seed'?'🌱':SUP[k].i,t:'+'+n+' '+SUP[k].n,col:'#bfe8a0'})}
function pickSeed(T,list){const c=list.filter(k=>CROPS[k].tr<=T);return c.length?c[R(0,c.length-1)]:list[0]}
skills.farm={l:1,x:0};
// ---------- eating and drinking ----------
const fmtT=ms=>{const s=Math.ceil(ms/1000);return s>=60?Math.ceil(s/60)+'m':s+'s'};
function consume(k){
  const S=SUP[k];if(!S)return;if(k=='p_hp')return drink();if(k=='p_mp')return drinkMana();
  if(S.c=='cat')return say(S.i+' '+S.n+' is used in the Fusion window (G): pick it as the catalyst.');
  if(S.c=='fert')return say('Use Fertilizer on a growing crop: walk to a Farm Plot in your Realm and press F.');
  if(S.c!='food'&&S.c!='elixir')return;
  if(!(sup[k]>0))return say('You have none left.');
  const now=performance.now(),fl=S.c=='food'?'food':'elix',act=hero.buffs.filter(b=>b[fl]&&b.t>now);let msg='';
  const same=act.find(b=>b.k==k);
  if(same)hero.buffs.splice(hero.buffs.indexOf(same),1);
  else if(act.length>=(fl=='food'?2:1)){const o=act.sort((a,b)=>a.t-b.t)[0];hero.buffs.splice(hero.buffs.indexOf(o),1);msg=' (replaces '+o.n+')'}
  sup[k]--;hero.buffs.push({s:S.s,t:now+S.dur*60000,n:S.n,i:S.i,d:S.d,k,[fl]:1});hsDirty();hero.hp=Math.min(hero.hp,heroMax());
  burst(gY(pl.position,1.1),fl=='food'?0xffc070:0x9a7aff,22,1.4,2,.6);say((fl=='food'?'You eat ':'You drink ')+S.i+' '+S.n+': '+S.d+' for '+S.dur+' min'+msg+'.');hud();
  if(!$('xw').classList.contains('hide'))rX();if(!$('bag').classList.contains('hide'))rB();
}
function drinkMana(){
  if(!(sup.p_mp>0)){if(performance.now()-(hero.nmT||0)>900){hero.nmT=performance.now();say('No Mana Potions. Brew them at an Alchemy Table or buy them from a Trading Post.')}return}
  if((hero.cdM||0)>0)return;const mm=mpMax();if(hero.mp>=mm)return;
  sup.p_mp--;hero.cdM=6;const v=Math.round(mm*.5);hero.mp=Math.min(mm,hero.mp+v);dn(pl.position,'+'+v+' mana','#8ab4ff');burst(gY(pl.position,.8),0x6a9aff,24,2,2.5,.7);hud();
}
// ---------- textures that repeat across large pieces ----------
BM.forEach(m=>{const t=m.material.map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.needsUpdate=true}});
// ---------- new decor: stations, farming, furniture ----------
const NDEC=[
 D_('hearth','Cooking Hearth','🍳',6,1,[0xff8a30,1.0,6],{stone:10,wood:4,iron:2},g=>{for(let i=0;i<8;i++){const a=i/8*6.283;pm(g,'dod',0x6a6a70,Math.cos(a)*.38,.1,Math.sin(a)*.38,.22,.2,.22)}pm(g,'cyl',0x2a1a10,0,.05,0,.6,.06,.6);
   [0,1,2].forEach(i=>{const a=i*2.094;pm(g,'cyl',0x3a3a40,Math.cos(a)*.36,.55,Math.sin(a)*.36,.04,1.12,.04,Math.sin(a)*.28,-Math.cos(a)*.28)});
   pm(g,'sph',0x2a2a30,0,.62,0,.44,.36,.44);pm(g,'cyl',0x8a6a3a,0,.78,0,.36,.03,.36,0,0,.15);pm(g,'cone',0xff7a20,0,.22,0,.3,.36,.3,0,0,1.2).userData.fl=1;pm(g,'cone',0xffc040,0,.2,0,.16,.24,.16,0,0,1.5).userData.fl=1}),
 D_('alchemy','Alchemy Table','⚗️',4,1,[0xb08aff,.7,4],{wood:6,crystal:3,glowcap:2},g=>{pm(g,'box',0x5a3a22,0,.62,0,.95,.07,.6);LEG(g,0x3a2414,.4,.24,.6,.07);
   [[-.3,.1,0x9a7aff],[0,-.12,0x6ee7b7],[.28,.12,0xff6a8a]].forEach(q=>{pm(g,'sph',q[2],q[0],.78,q[1],.17,.17,.17,0,0,.8);pm(g,'cyl',0xe8f4ff,q[0],.9,q[1],.05,.12,.05)});
   pm(g,'cyl',0x8a8a92,.34,.7,-.18,.12,.1,.12);pm(g,'box',0xe8dcc0,-.05,.67,.2,.3,.02,.18);pm(g,'cyl',0x9a7aff,-.05,.69,.2,.04,.04,.04,0,0,1)}),
 D_('hitch','Stable Post','🐎',2,1,0,{wood:6,fiber:4},g=>{[-.4,.4].forEach(x=>pm(g,'cyl',0x5a3a22,x,.55,0,.09,1.1,.09));pm(g,'cyl',0x6a4a2a,0,.95,0,.07,.95,.07,0,Math.PI/2);pm(g,'tor',0xc8a24a,.15,.86,0,.14,.14,.14);pm(g,'cyl',0xd8bc5a,0,.18,.28,.36,.6,.36,0,Math.PI/2)}),
 D_('plot','Farm Plot','🟫',1,0,0,{wood:2,fiber:2,clay:1},g=>{pm(g,'box',0x5a3a22,0,.1,0,.96,.2,.96);pm(g,'box',0x3a2416,0,.2,0,.86,.04,.86);for(let i=0;i<3;i++)pm(g,'box',0x2a1a0e,-.28+i*.28,.225,0,.1,.02,.8)}),
 D_('scarecrow','Scarecrow','🧑‍🌾',2,1,0,{wood:3,fiber:4},g=>{pm(g,'cyl',0x5a3a22,0,.75,0,.07,1.5,.07);pm(g,'cyl',0x5a3a22,0,1.15,0,.05,1.0,.05,0,Math.PI/2);pm(g,'box',0x7a5a9a,0,1.02,0,.4,.5,.22);pm(g,'sph',0xd8c890,0,1.48,0,.28,.3,.28);
   pm(g,'cyl',0x4a3a20,0,1.6,0,.52,.03,.52);pm(g,'cone',0x4a3a20,0,1.72,0,.32,.26,.32);[-.5,.5].forEach(x=>pm(g,'cone',0xd8bc5a,x,1.15,0,.12,.2,.12,0,x>0?-1.57:1.57));pm(g,'sph',0x1a1410,-.08,1.5,.13,.05,.05,.03);pm(g,'sph',0x1a1410,.08,1.5,.13,.05,.05,.03)}),
 D_('well','Water Well','⛲',3,1,0,{stone:8,wood:2,iron:1},g=>{pm(g,'cyl',0x7a7a82,0,.32,0,.85,.64,.85);pm(g,'cyl',0x2a5a9a,0,.62,0,.66,.02,.66,0,0,.3);[-.38,.38].forEach(x=>pm(g,'box',0x5a3a22,x,.95,0,.08,1.2,.08));
   pm(g,'cone',0x8a3a2e,0,1.68,0,1.05,.45,.8);pm(g,'cyl',0x6a4a2a,0,1.2,0,.05,.8,.05,0,Math.PI/2);pm(g,'cyl',0x5a3a22,0,.9,0,.1,.14,.1)}),
 D_('beehive','Beehive','🐝',2,1,0,{wood:4,fiber:2,petals:4},g=>{pm(g,'box',0x5a3a22,0,.3,0,.6,.06,.6);LEG(g,0x3a2414,.24,.24,.3,.06);[0,1,2,3].forEach(i=>pm(g,'tor',0xd8a840,0,.42+i*.12,0,.62-i*.1,.62-i*.1,.8-i*.15,Math.PI/2));pm(g,'sph',0xd8a840,0,.84,0,.2,.14,.2);pm(g,'box',0x2a1a10,0,.4,.25,.1,.06,.04)}),
 D_('chest','Storage Chest','🧰',3,1,0,{wood:5,iron:1},g=>{pm(g,'box',0x7a4e2a,0,.22,0,.8,.44,.5);pm(g,'cyl',0x7a4e2a,0,.44,0,.5,.8,.5,0,Math.PI/2);[-.25,.25].forEach(x=>pm(g,'box',0x3a3a40,x,.3,0,.06,.62,.52));pm(g,'box',0xd8b040,0,.36,.26,.1,.12,.03)}),
 D_('couch','Cushioned Bench','🛋️',7,1,0,{wood:4,fiber:6},g=>{pm(g,'box',0x6a4a2a,0,.22,0,.95,.22,.5);pm(g,'box',0x8a2a3a,0,.38,.02,.85,.12,.44);pm(g,'box',0x6a4a2a,0,.6,-.22,.95,.5,.08);pm(g,'box',0x8a2a3a,0,.6,-.16,.8,.36,.06);[-.46,.46].forEach(x=>pm(g,'box',0x6a4a2a,x,.42,0,.06,.32,.5))}),
 D_('candles','Candelabra','🕯️',4,0,[0xffc070,.8,4.5],{iron:2,glowcap:1},g=>{pm(g,'cyl',0x2a2a30,0,.04,0,.3,.06,.3);pm(g,'cyl',0x2a2a30,0,.5,0,.04,1,.04);pm(g,'cyl',0x2a2a30,0,.95,0,.03,.6,.03,0,Math.PI/2);
   [-.28,0,.28].forEach(x=>{pm(g,'cyl',0xf0e8d0,x,1.08,0,.06,.2,.06);pm(g,'cone',0xffc040,x,1.24,0,.05,.1,.05,0,0,1.5).userData.fl=1})}),
 D_('rack','Weapon Rack','🗡️',4,1,0,{wood:3,iron:2},g=>{[-.4,.4].forEach(x=>pm(g,'box',0x5a3a22,x,.6,0,.08,1.2,.12));pm(g,'box',0x5a3a22,0,1.1,0,.9,.06,.12);pm(g,'box',0x5a3a22,0,.2,0,.9,.06,.2);
   [[-.2,0xb8c0c8],[0,0x8a6a3a],[.2,0xb8c0c8]].forEach(q=>{pm(g,'box',q[1],q[0],.7,.05,.05,.9,.02);pm(g,'box',0x3a2416,q[0],.24,.05,.14,.04,.04)})})
];
NDEC.forEach(d=>{DEC.push(d);d.key='d:'+d.id;ITEMS[d.key]=d});
ITEMS['d:hearth'].st='cook';ITEMS['d:alchemy'].st='alch';ITEMS['d:hitch'].st='stable';ITEMS['d:plot'].st='plot';ITEMS['d:beehive'].st='hive';
const BC_FURN=['bed','rug','fireplace','lantern','table','chair','bookshelf','plant','door','banner','clayurn','chest','couch','candles','rack'],BC_STAT=['hearth','alchemy','hitch'],BC_FARM=['plot','scarecrow','well','beehive','flowerbed','sapling'];
DEC.forEach(d=>{d.bc=BC_FURN.includes(d.id)?'furn':BC_STAT.includes(d.id)?'stat':BC_FARM.includes(d.id)?'farm':'dec'});
const bcOf=it=>it.bc||(it.cat==2?'terr':it.cat==3?'nest':it.cat==0?'blk':'dec');
// ---------- structural pieces on a 2-unit grid ----------
const GX0=RX-.5,GZ0=RZ-.5,GN=RN/2,MAXH=10;
const PS={
 floor:{n:'Floor',i:'⬛',t:'c',sl:'f',f:2,d:'Walkable floor. Put floors on top of walls to make an upper storey.'},
 wall:{n:'Wall',i:'🧱',t:'e',f:4,H:2,sol:1,enc:1,d:'Full-height wall. Walls, windows and doors enclose rooms.'},
 window:{n:'Window',i:'🪟',t:'e',f:3,H:2,sol:1,enc:1,x:{crystal:1},d:'Wall with a glass window.'},
 doorway:{n:'Doorway',i:'🚪',t:'e',f:3,H:2,sol:'door',enc:1,d:'Wall with an open arch you can walk through.'},
 door:{n:'Door',i:'🚪',t:'e',f:3,H:2,sol:'door',enc:1,door:1,x:{wood:2,iron:1},d:'Doorway with a door. Press F next to it to open or close. R flips the hinge.'},
 half:{n:'Half Wall',i:'▬',t:'e',f:2,H:1,sol:1,d:'Waist-high wall for railings and balconies.'},
 fence:{n:'Fence',i:'🚧',t:'e',f:1,H:1,sol:1,d:'Low fence for gardens and paddocks.'},
 pillar:{n:'Pillar',i:'🏛️',t:'p',f:1,H:2,sol:1,d:'Corner post. Holds up upper floors and roofs.'},
 beam:{n:'Beam',i:'➖',t:'e',f:1,H:2,sol:0,d:'Overhead beam along an edge.'},
 stairs:{n:'Stairs',i:'🪜',t:'c',sl:'s',f:4,rise:2,rot:1,d:'Climbs one full storey (2 high). R turns it.'},
 steps:{n:'Steps',i:'📶',t:'c',sl:'s',f:2,rise:1,rot:1,d:'Climbs half a storey, for porches and platforms. R turns it.'},
 roof:{n:'Roof Slope',i:'📐',t:'c',sl:'f',f:3,rot:1,roof:1,d:'Gentle roof slope rising 1. Two facing slopes make a gable. R turns it.'},
 steep:{n:'Steep Roof',i:'🔺',t:'c',sl:'f',f:4,rot:1,roof:1,d:'Steep roof slope rising 2. R turns it.'},
 peak:{n:'Roof Peak',i:'⛺',t:'c',sl:'f',f:3,rot:1,roof:1,d:'Both slopes in one cell, ridge in the middle. R turns it.'},
 flat:{n:'Flat Roof',i:'🟫',t:'c',sl:'f',f:3,roof:1,walk:.2,d:'Flat roof you can walk on, for terraces.'},
 gable:{n:'Gable',i:'🔼',t:'e',f:2,H:1,sol:1,d:'Triangle wall that closes the end of a Roof Peak.'},
 hgable:{n:'Half Gable',i:'◢',t:'e',f:1,H:1,sol:1,d:'Sloped wall end under a Roof Slope. R flips it.'},
 block:{n:'Block',i:'🧊',t:'b',f:0,d:'Classic 1×1 block. Stacks on other blocks.'}
};
const PSK=Object.keys(PS);
const PGC={};
function pGeo(w,h,d){const k=w+'_'+h+'_'+d;if(PGC[k])return PGC[k];const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv,S=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(let f=0;f<6;f++)for(let v=0;v<4;v++){const i=f*4+v;uv.setXY(i,uv.getX(i)*S[f][0],uv.getY(i)*S[f][1])}return PGC[k]=g}
function pbx(g,m,w,h,d,x,y,z,rx){const o=new THREE.Mesh(pGeo(w,h,d),m);o.position.set(x,y,z);if(rx)o.rotation.x=rx;o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
const triGeo=(pts)=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>s.lineTo(p[0],p[1]));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.2,bevelEnabled:false});g.translate(0,0,-.1);return g};
const GABG=triGeo([[-1,0],[1,0],[0,1]]),HGABG=triGeo([[-1,0],[1,0],[1,1]]);
const TRIM=pmat(0x3a2616),GLASSM=new THREE.MeshStandardMaterial({color:0xbfeaff,transparent:true,opacity:.42,roughness:.1,metalness:.1,emissive:0x2a4a6a,emissiveIntensity:.25}),DOORM=BM[BIDX.plank].material;
const pMat=m=>BM[m].material;
const tri=(g,m,geo)=>{const o=new THREE.Mesh(geo,m);o.castShadow=true;o.receiveShadow=true;g.add(o);return o};
const PB={
 floor:(g,m,h)=>h?pbx(g,m,2,.2,2,0,-.1,0):pbx(g,m,2,.12,2,0,.06,0),
 wall:(g,m)=>pbx(g,m,2,2,.2,0,1,0),
 window:(g,m)=>{pbx(g,m,2,.8,.2,0,.4,0);pbx(g,m,2,.45,.2,0,1.775,0);pbx(g,m,.5,.75,.2,-.75,1.175,0);pbx(g,m,.5,.75,.2,.75,1.175,0);pbx(g,GLASSM,1,.75,.04,0,1.175,0);pbx(g,TRIM,.06,.75,.08,0,1.175,0);pbx(g,TRIM,1,.06,.08,0,1.175,0);pbx(g,TRIM,1.1,.07,.3,0,.82,0)},
 doorway:(g,m)=>{pbx(g,m,.5,2,.2,-.75,1,0);pbx(g,m,.5,2,.2,.75,1,0);pbx(g,m,1,.3,.2,0,1.85,0)},
 door:(g,m)=>{PB.doorway(g,m);const pv=new THREE.Group();pv.position.set(-.5,0,0);g.add(pv);pbx(pv,DOORM,.98,1.68,.08,.49,.85,0);pbx(pv,TRIM,.9,.08,.1,.49,.4,0);pbx(pv,TRIM,.9,.08,.1,.49,1.3,0);
   const k=new THREE.Mesh(GX.sph,pmat(0xd8b040));k.scale.setScalar(.08);k.position.set(.85,.85,.08);pv.add(k);g.userData.pv=pv},
 half:(g,m)=>{pbx(g,m,2,1,.2,0,.5,0);pbx(g,m,2.04,.08,.3,0,1.04,0)},
 fence:(g,m)=>{[-.92,.92].forEach(x=>pbx(g,m,.14,1.05,.14,x,.52,0));pbx(g,m,2,.09,.06,0,.45,0);pbx(g,m,2,.09,.06,0,.85,0)},
 pillar:(g,m)=>{pbx(g,m,.3,2,.3,0,1,0);pbx(g,m,.4,.12,.4,0,.06,0);pbx(g,m,.4,.12,.4,0,1.94,0)},
 beam:(g,m)=>pbx(g,m,2.1,.24,.24,0,1.88,0),
 stairs:(g,m)=>{for(let k=0;k<8;k++){const hh=(k+1)*.25;pbx(g,m,1.9,hh,.25,0,hh/2,1-(k+.5)*.25)}},
 steps:(g,m)=>{for(let k=0;k<4;k++){const hh=(k+1)*.25;pbx(g,m,1.9,hh,.5,0,hh/2,1-(k+.5)*.5)}},
 roof:(g,m)=>{pbx(g,m,2.08,.12,Math.hypot(2,1)+.3,0,.5,0,Math.atan2(1,2))},
 steep:(g,m)=>{pbx(g,m,2.08,.12,Math.hypot(2,2)+.3,0,1,0,Math.PI/4)},
 peak:(g,m)=>{pbx(g,m,2.08,.12,Math.SQRT2+.2,0,.5,.5,-Math.PI/4);pbx(g,m,2.08,.12,Math.SQRT2+.2,0,.5,-.5,Math.PI/4);pbx(g,TRIM,2.12,.1,.18,0,1.04,0)},
 flat:(g,m)=>{pbx(g,m,2,.2,2,0,.1,0);pbx(g,TRIM,2.08,.07,2.08,0,.035,0)},
 gable:(g,m)=>tri(g,m,GABG),
 hgable:(g,m)=>tri(g,m,HGABG)
};
const pcs={};let RIX=null,roomC=null;
const rDirty=()=>{RIX=null;roomC=null;cutH=-1};
function pRot(p){return p.t=='e'?(p.o=='v'?Math.PI/2:0)+((p.r&1)?Math.PI:0):p.t=='c'?(p.r||0)*Math.PI/2:0}
function mkPiece(p){
  const g=new THREE.Group();PB[p.k](g,pMat(p.m),p.h);g.position.set(p.x,p.h,p.z);g.rotation.y=pRot(p);g.userData.pk=p.key;RLG.add(g);p.g=g;
  if(p.open&&g.userData.pv)g.userData.pv.rotation.y=-1.6;g.visible=p.h<cutH||cutH<0;g.updateMatrixWorld(true);return g;
}
function pRects(p){
  const D=PS[p.k],R=[];if(!D.sol)return R;const y0=p.h,y1=p.h+(D.H||2);
  if(p.t=='p'){R.push({x0:p.x-.16,x1:p.x+.16,z0:p.z-.16,z1:p.z+.16,y0,y1});return R}
  if(p.t!='e')return R;
  const segs=D.sol=='door'&&(!D.door||p.open)?[[-1,-.5],[.5,1]]:[[-1,1]];
  segs.forEach(s=>{if(p.o=='h')R.push({x0:p.x+s[0],x1:p.x+s[1],z0:p.z-.1,z1:p.z+.1,y0,y1});else R.push({x0:p.x-.1,x1:p.x+.1,z0:p.z+s[0],z1:p.z+s[1],y0,y1})});
  return R;
}
function rIndex(){
  RIX=new Map();const add=r=>{for(let x=Math.floor(r.x0);x<=Math.floor(r.x1);x++)for(let z=Math.floor(r.z0);z<=Math.floor(r.z1);z++){const k=x+','+z;let a=RIX.get(k);if(!a)RIX.set(k,a=[]);a.push(r)}};
  for(const k in pcs)pRects(pcs[k]).forEach(add);
  for(const k in blocks){const q=k.split(',').map(Number);add({x0:q[0]-.5,x1:q[0]+.5,z0:q[2]-.5,z1:q[2]+.5,y0:q[1],y1:q[1]+1})}
  for(const k in decor){const d=decor[k];if(d.it.s){const y=d.sy!=null?d.sy:d.y;add({x0:d.x-.42,x1:d.x+.42,z0:d.z-.42,z1:d.z+.42,y0:y,y1:y+1})}}
}
function rBlock(x,z,y){
  if(!RIX)rIndex();const r0=.28,a=y+.35,b=y+1.5;
  for(let gx=Math.floor(x-r0);gx<=Math.floor(x+r0);gx++)for(let gz=Math.floor(z-r0);gz<=Math.floor(z+r0);gz++){const L=RIX.get(gx+','+gz);if(!L)continue;
    for(const r of L){if(r.y1<=a||r.y0>=b)continue;const cx=Math.max(r.x0,Math.min(x,r.x1)),cz=Math.max(r.z0,Math.min(z,r.z1));if((x-cx)*(x-cx)+(z-cz)*(z-cz)<r0*r0)return true}}
  return false;
}
// the highest surface you can stand on at (x,z) that is no more than a small step above y
function groundAt(x,z,y){
  let best=null;const lim=y+.55,tx=Math.round(x),tz=Math.round(z),up=v=>{if(v<=lim&&(best==null||v>best))best=v};
  if(rin(tx,tz)&&terr[(tx-RX)+(tz-RZ)*RN])best=0;
  const i=Math.floor((x-GX0)/2),j=Math.floor((z-GZ0)/2);
  for(let h=0;h<=Math.min(MAXH,Math.ceil(lim));h++){
    const f=pcs[h+'|c|f|'+i+'|'+j];if(f){const D=PS[f.k];if(!D.roof)up(h?h:.12);else if(D.walk!=null)up(h+D.walk)}
    const s=pcs[h+'|c|s|'+i+'|'+j];if(s){const D=PS[s.k],a=s.r*Math.PI/2,dx=-Math.sin(a),dz=-Math.cos(a),t=Math.max(0,Math.min(1,.5+.5*((x-s.x)*dx+(z-s.z)*dz)));up(h+D.rise*t+.02)}
  }
  for(let yy=0;yy<=Math.min(10,Math.ceil(lim));yy++)if(blocks[tx+','+yy+','+tz]!=null)up(yy+1);
  return best;
}
const rGY=(x,z)=>{const g=groundAt(x,z,pl.position.y+.2);return g==null?pl.position.y:g};
function rWalk(o,dx,dz){
  const p=o.position,y=p.y,ok=(x,z)=>!rBlock(x,z,y)&&groundAt(x,z,y)!=null&&[[.22,.22],[-.22,.22],[.22,-.22],[-.22,-.22]].every(q=>groundAt(x+q[0],z+q[1],y)!=null);
  if(ok(p.x+dx,p.z))p.x+=dx;if(ok(p.x,p.z+dz))p.z+=dz;
}
function realmSolid(x,z){return rBlock(x,z,pl.position.y)||groundAt(x,z,pl.position.y)==null}
function walk(o,dx,dz){
  if(inRealm)return rWalk(o,dx,dz);
  const p=o.position,tin=tcHit(p.x,p.z);
  if(!CR.some(([a,b])=>solid(p.x+dx+a,p.z+b))&&(tin||!tcHit(p.x+dx,p.z)))p.x+=dx;
  if(!CR.some(([a,b])=>solid(p.x+a,p.z+dz+b))&&(tin||!tcHit(p.x,p.z+dz)))p.z+=dz;
}
// ---------- rooms: walls + roof all around make a room (comfort, better rest) ----------
function rooms(){
  if(roomC)return roomC;const R=[],seen=new Set(),hs=new Set();for(const k in pcs){const p=pcs[k];if(p.t=='e'&&PS[p.k].enc)hs.add(p.h)}
  const enc=(h,o,i,j)=>{const p=pcs[h+'|e|'+o+'|'+i+'|'+j];return !!(p&&PS[p.k].enc)};
  const flr=(h,i,j)=>{if(i<0||j<0||i>=GN||j>=GN)return false;if(h==0){for(let a=0;a<2;a++)for(let b=0;b<2;b++)if(!landAt(2*i+a,2*j+b))return false;return true}const p=pcs[h+'|c|f|'+i+'|'+j];return !!(p&&!PS[p.k].roof)};
  const cov=(h,i,j)=>{for(let hh=h+1;hh<=h+5;hh++)if(pcs[hh+'|c|f|'+i+'|'+j])return true;return false};
  hs.forEach(h=>{for(let i=0;i<GN;i++)for(let j=0;j<GN;j++){
    const k0=h+'|'+i+'|'+j;if(seen.has(k0)||!flr(h,i,j)||!cov(h,i,j))continue;
    const q=[[i,j]],cells=[];let ok=true;seen.add(k0);
    while(q.length){const c=q.pop(),a=c[0],b=c[1];cells.push(c);if(cells.length>30)ok=false;
      [[1,0,'v',a+1,b],[-1,0,'v',a,b],[0,1,'h',a,b+1],[0,-1,'h',a,b]].forEach(e=>{if(enc(h,e[2],e[3],e[4]))return;const na=a+e[0],nb=b+e[1],kk=h+'|'+na+'|'+nb;if(!flr(h,na,nb)||!cov(h,na,nb)){ok=false;return}if(!seen.has(kk)){seen.add(kk);q.push([na,nb])}})}
    if(ok)R.push({h,cells})}});
  return roomC=R;
}
function inRoomSet(){const s=new Set();rooms().forEach(r=>r.cells.forEach(c=>s.add(r.h+'|'+c[0]+'|'+c[1])));return s}
const cellOf=(x,z)=>[Math.floor((x-GX0)/2),Math.floor((z-GZ0)/2)];
function inRoomAt(d){const c=cellOf(d.x,d.z);return inRoomSet().has(d.y+'|'+c[0]+'|'+c[1])}
function cozyScore(){
  const R=rooms(),inR=inRoomSet(),cnt0={};let s=0;
  Object.values(decor).forEach(d=>{const c=d.it.cz||0;if(!c)return;cnt0[d.it.id]=(cnt0[d.it.id]||0)+1;if(cnt0[d.it.id]<=3){const q=cellOf(d.x,d.z);s+=c*(inR.has(d.y+'|'+q[0]+'|'+q[1])?1.5:1)}});
  return Math.min(100,Math.round(s+Math.min(8,Object.keys(blocks).length/8)+Math.min(10,Object.keys(pcs).length/10)+12*Math.min(3,R.length)));
}
function useBed(){
  const cz=cozyScore(),bd=Object.values(decor).find(o=>o.it.id=='bed'&&Math.hypot(o.x-pl.position.x,o.z-pl.position.z)<2.2),inR=!!(bd&&inRoomAt(bd)),m=(.03+cz*.0027)*(inR?1.5:1),dur=inR?15:10;
  hero.hp=heroMax();hero.mp=mpMax();party.forEach(c=>c.h=M(c));rest={t:Date.now()+dur*60000,m};ui();hud();
  burst(gY(pl.position,.8),0xffe6b0,24,1.5,2,.9);
  say('You rest in your bed. Your team is fully healed. Well Rested: +'+Math.round(m*100)+'% XP for '+dur+' minutes ('+cozyName(cz)+' home'+(inR?', snug inside a proper room':'. Tip: a bed inside a walled, roofed room rests you 50% better')+').');
}
// ---------- decor placement now remembers the surface it sits on ----------
function surfAt(x,z,h){if(h==0){const c=cellOf(x,z),f=pcs['0|c|f|'+c[0]+'|'+c[1]];return f&&!PS[f.k].roof?.12:0}return h}
function placeDecor(it,x,y,z,rot){
  const key=x+','+y+','+z,g=new THREE.Group();it.mk(g);const sy=surfAt(x,z,y);g.position.set(x,sy,z);g.rotation.y=rot*Math.PI/2;g.userData.dk=key;RLG.add(g);g.updateMatrixWorld(true);
  const d={it:it,x:x,y:y,z:z,sy:sy,rot:rot,g:g,fl:[]};g.traverse(o=>{if(o.userData&&o.userData.fl)d.fl.push(o)});decor[key]=d;
  if(it.fam)built[it.fam]=true;if(it.st=='hive')d.hive={n:0,acc:0,lt:Date.now()};if(it.st=='plot'){d.crop=null;d.cs=-2}
  rDirty();return d;
}
// ---------- build mode state ----------
let bSub='Walls';const STRG=[['Walls',['wall','window','doorway','door','half','fence','pillar','beam']],['Floors & stairs',['floor','stairs','steps']],['Roofs',['roof','steep','peak','flat','gable','hgable']],['Blocks',['block']]];
const BCATS=[['str','🧱','Structure'],['furn','🪑','Furniture'],['stat','⚒️','Stations'],['farm','🌱','Farming'],['dec','🌸','Garden & Decor'],['terr','🟩','Terrain'],['nest','🥚','Incubators'],['rm','✖','Demolish']];
let bCat='str',bPc='wall',bMat=BIDX.plank,bH=0,bRot=0,bLast='',bUndo=[],bT=null,bErr='',cutH=-1;const bSel={};
const catItems=c=>Object.keys(ITEMS).filter(k=>bcOf(ITEMS[k])==c);
function pCost(k,m){const D=PS[k],b=BLK[m],o={};if(k=='block'){for(const r in b.rec)o[r]=Math.max(1,Math.ceil(b.rec[r]/b.out));return o}
  for(const r in b.rec)o[r]=Math.max(1,Math.ceil(b.rec[r]*D.f/b.out));if(D.x)for(const r in D.x)o[r]=(o[r]||0)+D.x[r];return o}
function iCost(it){const o={},n=it.out||1;for(const r in it.rec||{})o[r]=Math.max(1,Math.ceil(it.rec[r]/n));return o}
const payable=o=>Object.keys(o).every(k=>(mats[k]||0)>=o[k]);
const costTxt=o=>Object.keys(o).map(k=>matInfo(k)[1]+' '+o[k]+' '+matInfo(k)[0]).join(', ');
const costHTML=o=>Object.keys(o).map(k=>`<span style="color:${(mats[k]||0)>=o[k]?'inherit':'#f87171'}">${matInfo(k)[1]}${o[k]}</span>`).join(' ');
function payFor(o){for(const k in o)mats[k]-=o[k]}
function refund(o){for(const k in o)mats[k]=(mats[k]||0)+o[k]}
function bTool(){if(bCat=='rm')return {kind:'rm'};if(bCat=='str')return bPc=='block'?{kind:'blk',it:ITEMS['b:'+BLK[bMat].id]}:{kind:'pc',k:bPc};
  const k=bSel[bCat]||catItems(bCat)[0],it=ITEMS[k];return it?{kind:it.cat==2?'ter':'dec',it,key:k}:null}
const RPL=new THREE.Plane(V(0,1,0),0),RPT=V();
function rayPlane(y){rc.setFromCamera(mnd,cam);RPL.constant=-y;return rc.ray.intersectPlane(RPL,RPT)?RPT.clone():null}
function snapC(p){const i=Math.floor((p.x-GX0)/2),j=Math.floor((p.z-GZ0)/2);return {i,j,x:GX0+2*i+1,z:GZ0+2*j+1}}
function snapE(p){const fx=(p.x-GX0)/2,fz=(p.z-GZ0)/2,i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j;
  const c=[[v,'h',i,j],[1-v,'h',i,j+1],[u,'v',i,j],[1-u,'v',i+1,j]].sort((a,b)=>a[0]-b[0])[0];
  return c[1]=='h'?{o:'h',i:c[2],j:c[3],x:GX0+2*c[2]+1,z:GZ0+2*c[3]}:{o:'v',i:c[2],j:c[3],x:GX0+2*c[2],z:GZ0+2*c[3]+1}}
function snapP(p){const i=Math.round((p.x-GX0)/2),j=Math.round((p.z-GZ0)/2);return {i,j,x:GX0+2*i,z:GZ0+2*j}}
function pickables(){const a=[];for(const k in pcs)if(pcs[k].g.visible)a.push(pcs[k].g);for(const k in decor)if(decor[k].g.visible)a.push(decor[k].g);return a}
function rmPick(){
  rc.setFromCamera(mnd,cam);const hs=rc.intersectObjects(pickables(),true),bh=rc.intersectObjects(BM,false)[0],h0=hs[0];
  if(bh&&bh.instanceId!=null&&(!h0||bh.distance<h0.distance)){const t=BM.indexOf(bh.object),k=BL[t][bh.instanceId],q=k.split(',').map(Number);return {kind:'rm',sub:'b',k,x:q[0],y:q[1],z:q[2]}}
  if(h0){let o=h0.object;while(o&&!(o.userData&&(o.userData.pk||o.userData.dk)))o=o.parent;
    if(o&&o.userData.pk&&pcs[o.userData.pk]){const p=pcs[o.userData.pk];return {kind:'rm',sub:'p',k:p.key,x:p.x,y:p.h,z:p.z,g:p.g}}
    if(o&&o.userData.dk&&decor[o.userData.dk]){const d=decor[o.userData.dk];return {kind:'rm',sub:'d',k:o.userData.dk,x:d.x,y:d.sy,z:d.z,g:d.g}}}
  const p=rayPlane(0);if(p){const x=Math.round(p.x),z=Math.round(p.z);if(rin(x,z)&&terr[(x-RX)+(z-RZ)*RN]>0)return {kind:'rm',sub:'t',x,y:0,z}}
  return null;
}
function bAim(){
  if(!mOn)return null;const T=bTool();if(!T)return null;
  if(T.kind=='rm')return rmPick();
  if(T.kind=='pc'){const D=PS[T.k],p=rayPlane(bH);if(!p)return null;
    if(D.t=='c'){const s=snapC(p);return Object.assign(s,{kind:'pc',k:T.k,h:bH,t:'c',o:D.sl,r:D.rot?bRot:0,key:bH+'|c|'+D.sl+'|'+s.i+'|'+s.j})}
    if(D.t=='e'){const s=snapE(p);return Object.assign(s,{kind:'pc',k:T.k,h:bH,t:'e',r:bRot&1,key:bH+'|e|'+s.o+'|'+s.i+'|'+s.j})}
    const s=snapP(p);return Object.assign(s,{kind:'pc',k:T.k,h:bH,t:'p',o:'p',r:0,key:bH+'|p|p|'+s.i+'|'+s.j})}
  if(T.kind=='blk'){rc.setFromCamera(mnd,cam);const h=rc.intersectObjects(BM,false)[0];
    if(h&&h.instanceId!=null){const t=BM.indexOf(h.object),q=BL[t][h.instanceId].split(',').map(Number),n=h.face.normal;return {kind:'blk',it:T.it,x:q[0]+Math.round(n.x),y:q[1]+Math.round(n.y),z:q[2]+Math.round(n.z)}}
    const p=rayPlane(bH);return p?{kind:'blk',it:T.it,x:Math.round(p.x),y:bH,z:Math.round(p.z)}:null}
  if(T.kind=='ter'){const p=rayPlane(0);return p?{kind:'ter',it:T.it,x:Math.round(p.x),y:0,z:Math.round(p.z)}:null}
  const p=rayPlane(bH);return p?{kind:'dec',it:T.it,x:Math.round(p.x),y:bH,z:Math.round(p.z),r:bRot}:null;
}
function landTiles(t){const pts=t.t=='c'?[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]]:[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]];
  const f=pts.map(q=>{const x=Math.round(t.x+q[0]),z=Math.round(t.z+q[1]);return rin(x,z)&&terr[(x-RX)+(z-RZ)*RN]>0});return t.t=='c'?f.every(Boolean):f.some(Boolean)}
function supported(t){for(const k in pcs){const p=pcs[k];if(p.h<=t.h&&p.h>=t.h-2&&Math.abs(p.x-t.x)<=2.05&&Math.abs(p.z-t.z)<=2.05)return true}
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(blocks[(Math.round(t.x)+a)+','+(t.h-1)+','+(Math.round(t.z)+b)]!=null)return true;return false}
function hitsPlayer(rects){const x=pl.position.x,z=pl.position.z,y=pl.position.y;return rects.some(r=>{if(r.y1<=y+.05||r.y0>=y+1.6)return false;const cx=Math.max(r.x0,Math.min(x,r.x1)),cz=Math.max(r.z0,Math.min(z,r.z1));return (x-cx)*(x-cx)+(z-cz)*(z-cz)<.32*.32})}
const nearGate=(x,z,y)=>y<3&&(Math.hypot(x-PORTAL[0],z-PORTAL[1])<2.4||Math.hypot(x-RBENCH[0],z-RBENCH[1])<1.9);
function chk(t){
  if(!t)return 'Point at your island.';
  if(t.kind=='rm'){if(t.sub=='d'){const d=decor[t.k];if(d&&d.it.fam&&incS[d.it.fam])return 'Take the egg out of that incubator first.';if(d&&d.crop)return 'Harvest or dig up that crop first (F).'}
    if(t.sub=='t'){const i=(t.x-RX)+(t.z-RZ)*RN;if(terr[i]==1){if(Object.keys(blocks).some(k=>{const q=k.split(',');return +q[0]==t.x&&+q[2]==t.z})||Object.values(decor).some(d=>d.x==t.x&&d.z==t.z)||Object.values(pcs).some(p=>p.h==0&&Math.abs(p.x-t.x)<1.4&&Math.abs(p.z-t.z)<1.4))return 'Clear that tile first.';
      if(Math.hypot(t.x-PORTAL[0],t.z-PORTAL[1])<2.6||Math.hypot(t.x-RBENCH[0],t.z-RBENCH[1])<1.8||Math.hypot(t.x-pl.position.x,t.z-pl.position.z)<1.3)return 'You cannot remove that tile.'}}
    return ''}
  if(t.kind=='pc'){const D=PS[t.k];
    if(t.t=='c'?(t.i<0||t.j<0||t.i>=GN||t.j>=GN):(t.i<0||t.j<0||t.i>GN||t.j>GN))return 'That is outside your realm.';
    if(pcs[t.key])return 'Something is already built there.';
    if(locked('m:'+BLK[bMat].id))return '🔒 '+BLK[bMat].n+' is unlocked by defeating '+lockBy('m:'+BLK[bMat].id)+'.';
    if(t.t=='c'&&D.sl=='s'&&pcs[t.h+'|c|f|'+t.i+'|'+t.j]&&PS[pcs[t.h+'|c|f|'+t.i+'|'+t.j].k].roof)return 'There is a roof there.';
    if(t.h==0){if(!landTiles(t))return 'Needs ground under it. Extend your island with Island Tiles (Terrain tab).'}
    else if(!supported(t))return 'Must attach to something below or beside it (walls, pillars or floors).';
    if(nearGate(t.x,t.z,t.h))return 'Keep the portal and workbench clear.';
    if(D.sol&&hitsPlayer(pRects(Object.assign({},t,{open:false}))))return 'You are standing there.';
    const c=pCost(t.k,bMat);if(!payable(c))return 'You need '+costTxt(c)+'.';return ''}
  if(t.kind=='ter'){const it=t.it;if(!rin(t.x,t.z))return 'That is outside your realm.';const gx=t.x-RX,gz=t.z-RZ,gi=gx+gz*RN;
    if(it.land){if(terr[gi])return 'There is already ground there.';if(!(landAt(gx+1,gz)||landAt(gx-1,gz)||landAt(gx,gz+1)||landAt(gx,gz-1)))return 'Island tiles must connect to your island.'}
    else{if(!terr[gi])return 'Open sky. Place Island Tiles to extend your realm first.';if(terr[gi]==TERI[it.id])return 'That ground is already '+it.n+'.'}
    return have[it.key]>0||payable(iCost(it))?'':'You need '+costTxt(iCost(it))+'.'}
  // blocks and decor
  const it=t.it;if(locked(it.key)||(t.kind=='blk'&&locked('m:'+it.id)))return '🔒 Unlocked by defeating '+lockBy(locked(it.key)?it.key:'m:'+it.id)+'.';
  if(!rin(t.x,t.z)||t.y<0||t.y>MAXH)return 'That is outside your realm.';
  const gi=(t.x-RX)+(t.z-RZ)*RN,k=t.x+','+t.y+','+t.z;
  if(t.y==0&&!terr[gi])return 'Only open sky there.';
  if(blocks[k]!=null||decor[k])return 'That space is taken.';
  if(t.kind=='dec'&&t.y>0){const c=cellOf(t.x,t.z),f=pcs[t.y+'|c|f|'+c[0]+'|'+c[1]];if(!(f&&(!PS[f.k].roof||PS[f.k].walk!=null))&&blocks[t.x+','+(t.y-1)+','+t.z]==null)return 'Needs a floor under it at height '+t.y+'.'}
  if(t.kind=='blk'&&t.y>0&&!supported({x:t.x,z:t.z,h:t.y})&&blocks[t.x+','+(t.y-1)+','+t.z]==null)return 'Blocks must rest on something.';
  if(nearGate(t.x,t.z,t.y))return 'Keep the portal and workbench clear.';
  if((t.kind=='blk'||it.s)&&hitsPlayer([{x0:t.x-.5,x1:t.x+.5,z0:t.z-.5,z1:t.z+.5,y0:t.y,y1:t.y+1}]))return 'You are standing there.';
  if(t.kind=='blk'&&BL[BIDX[it.id]].length>=1500)return 'You cannot place more of that block.';
  if(it.fam&&built[it.fam])return 'You already placed a '+it.fam+' incubator.';
  return have[it.key]>0||payable(iCost(it))?'':'You need '+costTxt(iCost(it))+'.';
}
function bPlace(t){
  if(t.kind=='pc'){const c=pCost(t.k,bMat);payFor(c);const p={k:t.k,m:bMat,h:t.h,t:t.t,o:t.o,i:t.i,j:t.j,x:t.x,z:t.z,r:t.r,key:t.key,cost:c,open:false};pcs[p.key]=p;mkPiece(p);bUndo.push({a:'p',k:p.key});rDirty();
    burst(V(t.x,t.h+.5,t.z),BLK[bMat].col,8,1.5,1.5,.4);return}
  const it=t.it,stock=have[it.key]>0,c=stock?null:iCost(it);if(stock)have[it.key]--;else payFor(c);
  if(t.kind=='ter'){const i=(t.x-RX)+(t.z-RZ)*RN,old=terr[i];if(it.land)terr[i]=1;else{if(old>1)have['t:'+TER[old].id]=(have['t:'+TER[old].id]||0)+1;terr[i]=TERI[it.id]}terrRebuild();bUndo.push({a:'t',i,old,key:it.key,land:!!it.land,c});rDirty()}
  else if(t.kind=='blk'){const k=t.x+','+t.y+','+t.z;blocks[k]=BIDX[it.id];bRebuild();bUndo.push({a:'b',k,c});rDirty()}
  else{const d=placeDecor(it,t.x,t.y,t.z,bRot);d.cost=c;bUndo.push({a:'d',k:t.x+','+t.y+','+t.z})}
  if(bUndo.length>60)bUndo.shift();
  burst(V(t.x,(t.y||0)+.4,t.z),it.col||0xffe6b0,8,1.5,1.5,.4);
}
function bRemove(t){
  if(t.sub=='p'){const p=pcs[t.k];if(!p)return;RLG.remove(p.g);delete pcs[t.k];refund(p.cost||{});burst(V(p.x,p.h+.6,p.z),BLK[p.m].col,10,1.5,1.5,.4)}
  else if(t.sub=='b'){const it=BLK[blocks[t.k]];delete blocks[t.k];have[it.key]=(have[it.key]||0)+1;bRebuild()}
  else if(t.sub=='d'){const d=decor[t.k];if(!d)return;RLG.remove(d.g);delete decor[t.k];if(d.cost)refund(d.cost);else have[d.it.key]=(have[d.it.key]||0)+1;if(d.it.fam)delete built[d.it.fam]}
  else{const i=(t.x-RX)+(t.z-RZ)*RN,old=terr[i];if(!old)return;if(old>1){have['t:'+TER[old].id]=(have['t:'+TER[old].id]||0)+1;terr[i]=1}else{terr[i]=0;have['f:isle']=(have['f:isle']||0)+1}terrRebuild()}
  rDirty();burst(V(t.x,(t.y||0)+.4,t.z),0xcccccc,8,1.5,1.5,.4);
}
function bUndoDo(){
  const u=bUndo.pop();if(!u)return say('Nothing to undo.');
  if(u.a=='p')bRemove({sub:'p',k:u.k});
  else if(u.a=='d'){const d=decor[u.k];if(d&&(d.crop||(d.it.fam&&incS[d.it.fam])))return say('Empty it first.');bRemove({sub:'d',k:u.k,x:d?d.x:0,z:d?d.z:0})}
  else if(u.a=='b'){if(blocks[u.k]!=null){const t=blocks[u.k];delete blocks[u.k];if(u.c)refund(u.c);else have[BLK[t].key]=(have[BLK[t].key]||0)+1;bRebuild()}}
  else if(u.a=='t'){if(u.land)terr[u.i]=0;else{if(u.old>1)have['t:'+TER[u.old].id]=Math.max(0,(have['t:'+TER[u.old].id]||0)-1);terr[u.i]=u.old}if(u.c)refund(u.c);else have[u.key]=(have[u.key]||0)+1;terrRebuild()}
  rDirty();bRender();hud();say('Undone.');
}
function buildClick(){
  if(!inRealm||!building)return;const t=bAim();if(!t)return;
  if(t.kind=='rm'){const e=chk(t);if(e)return say(e);bRemove(t);bLast='';bRender();hud();return}
  const e=chk(t);if(e){if(!bheld||!bLast)say(e);return}
  bPlace(t);bLast=t.key||t.x+','+t.y+','+t.z;bRender();hud();
}
gl.addEventListener('pointermove',()=>{if(!building||!bheld)return;const T=bTool();if(!T)return;const drag=T.kind=='ter'||(T.kind=='pc'&&['floor','wall','half','fence','flat','beam'].includes(T.k));if(!drag)return;
  const t=bAim();if(!t)return;const k=t.key||t.x+','+t.y+','+t.z;if(k==bLast)return;if(chk(t))return;bPlace(t);bLast=k;bRender();hud()});
addEventListener('pointerup',()=>{bLast=''});
function bEyedrop(){const t=rmPick();if(!t)return;
  if(t.sub=='p'){const p=pcs[t.k];bCat='str';bPc=p.k;bMat=p.m;bH=p.h;bRot=p.r||0}
  else if(t.sub=='d'){const d=decor[t.k];bCat=bcOf(d.it);bSel[bCat]=d.it.key;bH=d.y}
  else if(t.sub=='b'){bCat='str';bPc='block';bMat=blocks[t.k];bH=t.y}
  bRender();say('Picked it up as your tool.');
}
function bKey(k,e){
  if(k>='1'&&k<='8'){bCat=BCATS[+k-1][0];bRender();return true}
  if(k=='r'){bRot=(bRot+1)&3;bRender();return true}
  if(k=='x'){bCat=bCat=='rm'?'str':'rm';bRender();return true}
  if(k=='['||k=='pagedown'){bH=Math.max(0,bH-1);bRender();return true}
  if(k==']'||k=='pageup'){bH=Math.min(MAXH,bH+1);bRender();return true}
  if(k=='z'&&(e.ctrlKey||e.metaKey)){e.preventDefault();bUndoDo();return true}
  if(k=='p'){bEyedrop();return true}
  return false;
}
// ---------- ghost preview + grid ----------
const GHM=new THREE.MeshBasicMaterial({color:0x6affa0,transparent:true,opacity:.58,depthWrite:false});
const GRID2=new THREE.GridHelper(14,7,0xffffff,0xffffff),GRID1=new THREE.GridHelper(9,9,0xffffff,0xffffff);
[GRID2,GRID1].forEach(g=>{g.material.transparent=true;g.material.opacity=.38;g.material.depthWrite=false;g.visible=false;scene.add(g)});
const GHC={};let ghost=null;
function ghostFor(key,mk){if(!GHC[key]){const g=new THREE.Group();mk(g);g.traverse(o=>{if(o.isMesh){o.material=GHM;o.castShadow=false;o.receiveShadow=false}});g.visible=false;scene.add(g);GHC[key]=g}return GHC[key]}
function bGhostHide(){if(ghost)ghost.visible=false;ghost=null;GRID1.visible=GRID2.visible=false;BGH.visible=false}
let bStT=0;
function bGhostTick(){
  const t=bAim(),e=t?chk(t):'Point at your island.';bT=t;bErr=e;const ok=!e,col=ok?(t&&t.kind=='rm'?0xff5a4a:0x6affa0):0xff5a4a;
  let g=null;BGH.visible=false;GRID1.visible=GRID2.visible=false;
  if(t&&t.kind=='pc'){g=ghostFor('p_'+t.k+'_'+(t.h?1:0),gg=>PB[t.k](gg,GHM,t.h));g.position.set(t.x,t.h+.002,t.z);g.rotation.y=pRot(t);
    GRID2.visible=true;GRID2.position.set(GX0+2*Math.round((t.x-GX0)/2),t.h+.03,GZ0+2*Math.round((t.z-GZ0)/2))}
  else if(t&&t.kind=='dec'){g=ghostFor('d_'+t.it.key,gg=>t.it.mk(gg));g.position.set(t.x,surfAt(t.x,t.z,t.y),t.z);g.rotation.y=bRot*Math.PI/2;GRID1.visible=true;GRID1.position.set(t.x,t.y+.03,t.z)}
  else if(t&&(t.kind=='blk'||t.kind=='ter')){const fl=t.kind=='ter';BGH.visible=true;BGH.position.set(t.x,t.y+(fl?.05:.5),t.z);BGH.scale.set(1,fl?.1:1,1);BGA.visible=false;BGH.rotation.y=0;BGH.material.color.setHex(ok?(t.it.col||0x9affc8):0xff4a4a);GRID1.visible=true;GRID1.position.set(t.x,t.y+.03,t.z)}
  else if(t&&t.kind=='rm'){BGH.visible=true;BGA.visible=false;BGH.rotation.y=0;BGH.material.color.setHex(ok?0xff4a4a:0xffa040);
    if(t.g){const b=new THREE.Box3().setFromObject(t.g),c=b.getCenter(V()),s=b.getSize(V());BGH.position.copy(c);BGH.scale.set(s.x+.06,s.y+.06,s.z+.06)}
    else if(t.sub=='b'){BGH.position.set(t.x,t.y+.5,t.z);BGH.scale.set(1,1,1)}else{BGH.position.set(t.x,.05,t.z);BGH.scale.set(1,.1,1)}}
  if(ghost&&ghost!==g)ghost.visible=false;ghost=g;if(g){g.visible=true;GHM.color.setHex(col)}
  const now=performance.now();if(now-bStT>150){bStT=now;const s=$('bst');if(s){s.textContent=e||(t.kind=='rm'?'Click to demolish (materials are refunded)':'Click to place'+(t.kind=='ter'||(t.kind=='pc'&&['floor','wall','half','fence','flat','beam'].includes(t.k))?' · hold and drag to paint':''));s.className=e?'':'ok'}}
}
// ---------- build panel ----------
function bRender(){
  const P=$('bpanel');if(!P)return;
  let items='',mats2='',info='';
  if(bCat=='str'){
    const SG=STRG.find(g=>g[1].includes(bPc))||STRG[0];bSub=SG[0];
    items=SG[1].map(k=>{const D=PS[k],c=pCost(k,bMat),ok=k=='block'?(have['b:'+BLK[bMat].id]>0||payable(c)):payable(c);return `<button class="bpc${k==bPc?' on':''}${ok?'':' no'}" data-bp="${k}" title="${D.n}: ${D.d}"><span class="bi">${D.i}</span><b>${D.n}</b><span class="bk">${k=='block'&&have['b:'+BLK[bMat].id]>0?'×'+have['b:'+BLK[bMat].id]+' made':costHTML(c)}</span></button>`}).join('');
    items=`<div class="bsub">${STRG.map(g=>`<button data-bsub="${g[0]}" class="${g[0]==SG[0]?'on':''}">${g[0]}</button>`).join('')}</div>`+items;
    mats2='<div class="bmats"><span class="mut">Material:</span>'+BLK.map((b,i)=>{const lk=locked('m:'+b.id);return `<button data-bm="${i}" class="${i==bMat?'on':''}${payable(pCost(bPc,i))&&!lk?'':' no'}" title="${lk?'Unlocked by defeating '+lockBy('m:'+b.id):b.n}"><i style="background:#${b.col.toString(16).padStart(6,'0')}"></i>${lk?'🔒 ':''}${b.n}</button>`}).join('')+'</div>';
    const D=PS[bPc];info=`<b>${D.i} ${D.n}</b> in ${BLK[bMat].n} · costs ${costHTML(pCost(bPc,bMat))} · ${D.d}`;
  }else if(bCat=='rm'){items='<div class="mut" style="padding:10px">Click any piece, block, decoration or painted tile to take it back. Materials are refunded. Hold P over something to copy it as your tool.</div>';info='<b>✖ Demolish</b>'}
  else{
    const ks=catItems(bCat);if(!bSel[bCat]||!ks.includes(bSel[bCat]))bSel[bCat]=ks[0];
    items=ks.map(k=>{const it=ITEMS[k],st=have[k]>0,c=iCost(it),ok=st||payable(c),lk=it.fam&&built[it.fam];const bl=locked(k);return `<button class="bpc${k==bSel[bCat]?' on':''}${ok&&!lk&&!bl?'':' no'}" data-bp="${k}" title="${bl?'Unlocked by defeating '+lockBy(k):it.n}"><span class="bi">${bl?'🔒':it.i}</span><b>${it.n}</b><span class="bk">${bl?'boss locked':lk?'placed':st?'×'+have[k]+' in stock':costHTML(c)}</span></button>`}).join('');
    const it=ITEMS[bSel[bCat]];if(it)info=`<b>${it.i} ${it.n}</b>${it.cz?' · Coziness +'+it.cz:''}${likedBy(it.id)?' · Loved by '+likedBy(it.id):''}${it.st=='cook'?' · Cook food that boosts your stats':it.st=='alch'?' · Brew potions, elixirs and fusion catalysts':it.st=='plot'?' · Plant seeds, press F to tend and harvest':it.st=='hive'?' · Makes Honey over time (faster near flowers)':it.id=='scarecrow'?' · Crops within 4 tiles grow 15% faster':it.id=='well'?' · Crops within 6 tiles grow 20% faster':it.st=='stable'?' · Open your mounts list':''}`;
  }
  const R=rooms().length,cz=cozyScore();
  P.innerHTML=`<div class="bcats">${BCATS.map((c,i)=>`<button data-bc="${c[0]}" class="${c[0]==bCat?'on':''}${c[0]=='rm'?' rm':''}">${i+1} ${c[1]} ${c[2]}</button>`).join('')}</div>
   <div class="bpcs">${items}</div>${mats2}
   <div class="bfoot"><span class="binf">${info}</span></div>
   <div class="bfoot"><span id="bst"></span><span class="bctl"><span class="mut">🏠 Rooms ${R} · Coziness ${cz} (${cozyName(cz)})</span><button data-bh="-1" title="Lower ([ or PgDn)">▼</button><b>Height ${bH}</b><button data-bh="1" title="Raise (] or PgUp)">▲</button><button data-brot="1" title="Rotate (R)">⟳ R</button><button data-bundo="1" title="Undo (Ctrl+Z)">↶ Undo</button><button data-bx="1" title="Leave build mode (B)">✔ Done</button></span></div>`;
}
$('bpanel').addEventListener('click',e=>{
  const sb=e.target.closest('[data-bsub]');if(sb){bSub=sb.dataset.bsub;bPc=STRG.find(g=>g[0]==bSub)[1][0];bRender();return}
  const c=e.target.closest('[data-bc]'),p=e.target.closest('[data-bp]'),m=e.target.closest('[data-bm]'),h=e.target.closest('[data-bh]');
  if(c){bCat=c.dataset.bc}else if(p){if(bCat=='str')bPc=p.dataset.bp;else bSel[bCat]=p.dataset.bp}else if(m){bMat=+m.dataset.bm}else if(h){bH=Math.max(0,Math.min(MAXH,bH+ +h.dataset.bh))}
  else if(e.target.closest('[data-brot]'))bRot=(bRot+1)&3;else if(e.target.closest('[data-bundo]')){bUndoDo();return}else if(e.target.closest('[data-bx]')){toggleBuild();return}else return;
  bRender();
});
function toggleBuild(){
  if(building){building=false;bheld=false;bGhostHide();realmHud();hud();return}
  if(!inRealm)return say('Recall to your Realm (🌀 T) to build.');
  if(riding)dismount();building=true;bRender();realmHud();hud();
  say('Build mode: pick a category (1-8) and a piece, then click to place. Drag to paint floors, walls and fences. R rotate · [ ] height · X demolish · P copy · Ctrl+Z undo · B to finish.');
}
// ---------- cutaway: hide roofs and upper floors while you are under them ----------
let cutT=0;
function cutTick(){
  const py=pl.position.y;let h=99;
  if(building)h=bH+1.5;else{const c=cellOf(pl.position.x,pl.position.z);for(let hh=Math.ceil(py+.6);hh<=py+6;hh++)if(pcs[hh+'|c|f|'+c[0]+'|'+c[1]]){h=py+1.5;break}}
  if(h==cutH)return;cutH=h;for(const k in pcs){const p=pcs[k];p.g.visible=p.h<h}for(const k in decor){const d=decor[k];d.g.visible=(d.sy||0)<h-.4}
}
// ---------- doors ----------
function toggleDoor(p){p.open=!p.open;const pv=p.g.userData.pv,a=pv.rotation.y,b=p.open?-1.6:0;tw(260,k=>{pv.rotation.y=a+(b-a)*k});rDirty();
  if(!p.open&&hitsPlayer(pRects(p))){p.open=true;pv.rotation.y=-1.6;rDirty()}}
// ---------- farming ----------
const farmLv=()=>skills.farm.l;
function farmRate(d){let r=1+(farmLv()-1)*.03;const ds=Object.values(decor);
  if(ds.some(o=>o.it.id=='scarecrow'&&Math.hypot(o.x-d.x,o.z-d.z)<=4.5))r+=.15;if(ds.some(o=>o.it.id=='well'&&Math.hypot(o.x-d.x,o.z-d.z)<=6.5))r+=.2;
  return r*(d.crop&&d.crop.fert?1.5:1)}
const cropNeed=d=>CROPS[d.crop.k].t;
const cropStage=d=>!d.crop?-1:d.crop.g>=cropNeed(d)?3:Math.min(2,Math.floor(3*d.crop.g/cropNeed(d)));
function cropVis(d){
  const s=cropStage(d);if(d.cs===s)return;d.cs=s;if(d.cg){d.g.remove(d.cg);d.cg=null}if(s<0)return;
  const C=CROPS[d.crop.k],g=new THREE.Group(),k=[.35,.6,.85,1][s],gr=0x4a9a3a,y0=.22;g.position.y=y0;d.g.add(g);d.cg=g;
  const spots=[[-.28,-.28],[0,-.28],[.28,-.28],[-.28,0],[0,0],[.28,0],[-.28,.28],[0,.28],[.28,.28]];
  if(C.st=='grain')spots.forEach((q,i)=>{const h=.55*k;pm(g,'cyl',s==3?0xc8a850:0x6aa040,q[0],h/2,q[1],.03,h,.03);pm(g,'cone',s==3?C.c:0x8ac060,q[0],h+.06,q[1],.07,.16*k+.04,.07,0,0,s==3?.15:0)});
  else if(C.st=='root')spots.filter((_,i)=>i%2==0).forEach(q=>{[0,1,2].forEach(j=>pm(g,'cone',gr,q[0]+(j-1)*.04,.12*k,q[1],.06,.3*k,.06,(j-1)*.4,0));if(s==3)pm(g,'cone',C.c,q[0],.02,q[1],.1,.12,.1,Math.PI,0,.1)});
  else if(C.st=='bush')[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].forEach(q=>{pm(g,'sph',0x3a8a3a,q[0],.18*k,q[1],.3*k,.28*k,.3*k);if(s>=2)for(let j=0;j<3;j++)pm(g,'cone',C.c,q[0]+(j-1)*.08,.2*k,q[1]+.1,.04,.12,.04,Math.PI,0,s==3?.3:0)});
  else if(C.st=='vine'){[0,1,2,3,4].forEach(j=>pm(g,'sph',gr,Math.cos(j*1.26)*.25,.06,Math.sin(j*1.26)*.25,.22,.06,.18));if(s>=1)pm(g,'sph',s==3?C.c:0x8aaa4a,0,.06+.2*k,0,.5*k,.38*k,.5*k);if(s==3)pm(g,'cyl',0x4a6a2a,0,.32,0,.03,.1,.03)}
  else if(C.st=='shroom')spots.filter((_,i)=>i%2==0).forEach(q=>{pm(g,'cyl',0xe8e0d0,q[0],.08*k,q[1],.05,.16*k,.05);pm(g,'sph',C.c,q[0],.17*k,q[1],.22*k,.1*k,.22*k,0,0,s==3?.5:.1)});
  else spots.filter((_,i)=>i%2==0).forEach(q=>{for(let j=0;j<4;j++)pm(g,'sph',gr,q[0]+Math.cos(j*1.57)*.06,.06*k,q[1]+Math.sin(j*1.57)*.06,.1*k,.04,.06*k);if(s>=2)pm(g,'sph',C.c,q[0],.16*k,q[1],.09,.09,.09,0,0,s==3?.9:.2)});
}
let farmT=0;
function farmTick(){
  const now=Date.now();
  Object.values(decor).forEach(d=>{
    if(d.crop){const c=d.crop;c.g+=Math.max(0,(now-c.lt)/1000)*farmRate(d);c.lt=now;cropVis(d)}
    if(d.hive){const h=d.hive,fl=Object.values(decor).some(o=>(o.it.id=='flowerbed'||o.it.id=='plant')&&Math.hypot(o.x-d.x,o.z-d.z)<=5)||[[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(q=>{const x=d.x+q[0],z=d.z+q[1];return rin(x,z)&&TER[terr[(x-RX)+(z-RZ)*RN]].id=='meadow'});
      if(h.n<5){h.acc+=Math.max(0,(now-h.lt)/1000)*(fl?1.5:1);while(h.acc>=180&&h.n<5){h.acc-=180;h.n++}}else h.acc=0;h.lt=now}
  });
}
function plant(d,k){if(!(sup['s_'+k]>0))return false;sup['s_'+k]--;d.crop={k,g:0,lt:Date.now(),fert:0};d.cs=-2;cropVis(d);return true}
function harvest(d,quiet){
  if(!d.crop||cropStage(d)<3)return false;const C=CROPS[d.crop.k],n=R(C.y[0],C.y[1])+(d.crop.fert?1:0)+Math.floor((farmLv()-1)/4),sd=1+(Math.random()<.3?1:0);
  giveS(d.crop.k,n);giveS('s_'+d.crop.k,sd);d.crop=null;cropVis(d);
  const sk=skills.farm;sk.x++;if(sk.x>=sk.l*5){sk.x=0;sk.l++;say('🌱 Farming reached level '+sk.l+'! Crops grow faster and yield more.')}
  burst(V(d.x,d.sy+.5,d.z),C.c,16,1.2,1.5,.5);if(!quiet)pickup({ic:C.i,t:'+'+n+' '+C.n,col:'#bfe8a0',sub:'+'+sd+' seeds back'});return n;
}
function plotsAll(){return Object.values(decor).filter(o=>o.it.st=='plot')}
XR.plot=()=>{
  const d=decor[xwArg];if(!d){closeX();return}const sk=skills.farm,rate=farmRate(Object.assign({},d,{crop:null}));
  $('xwT').textContent='🟫 Farm Plot';$('xwS').textContent='🌱 Farming Lv '+sk.l+' · growth speed ×'+rate.toFixed(2)+(Object.values(decor).some(o=>o.it.id=='scarecrow'&&Math.hypot(o.x-d.x,o.z-d.z)<=4.5)?' · 🧑‍🌾 scarecrow':'')+(Object.values(decor).some(o=>o.it.id=='well'&&Math.hypot(o.x-d.x,o.z-d.z)<=6.5)?' · ⛲ well':'');
  let h='';
  if(!d.crop){const sd=Object.keys(CROPS).filter(k=>sup['s_'+k]>0),empty=plotsAll().filter(o=>!o.crop).length;
    h=sd.length?'<div class="sec">Plant seeds</div><div class="rows">'+sd.map(k=>{const C=CROPS[k];return `<div class="rw"><span class="rn">${C.i} <b>${C.n}</b> <span class="mut">×${sup['s_'+k]} seeds</span><small>Ready in about ${Math.round(C.t/60/rate)} min · yields ${C.y[0]}-${C.y[1]} ${C.n}</small></span><span class="ra"><button class="pri" data-pl="${k}">Plant</button>${empty>1?`<button data-pla="${k}">All empty plots (${Math.min(empty,sup['s_'+k])})</button>`:''}</span></div>`}).join('')+'</div>'
      :'<div class="mut" style="padding:10px">You have no seeds. Forage bushes, flowers and mushrooms in the wilds, defeat monsters, or buy seeds at any Trading Post.</div>'}
  else{const C=CROPS[d.crop.k],st=cropStage(d),pc=Math.min(100,Math.floor(100*d.crop.g/C.t)),left=Math.max(0,(C.t-d.crop.g)/farmRate(d));
    h=`<div class="rw"><span class="rn">${C.i} <b>${C.n}</b> <span class="mut">${st==3?'ready to harvest!':['Seedling','Sprouting','Growing'][st]+' · '+pc+'%'}</span><small>${st==3?'Press Harvest or F at the plot.':'About '+fmtT(left*1000)+' left'}${d.crop.fert?' · 🧺 fertilized':''}</small></span><span class="ra"><span class="hpm"><i style="width:${pc}%"></i></span></span></div>
     <div class="btns">${st==3?'<button class="pri" data-hv="1">Harvest</button>':''}${st<3&&!d.crop.fert?`<button data-fe="1" ${(sup.fert||0)>0?'':'disabled'}>🧺 Fertilize (×${sup.fert||0})</button>`:''}<button data-dig="1">Dig up</button></div>`}
  const ripe=plotsAll().filter(o=>cropStage(o)==3).length;
  $('xwB').innerHTML=h;$('xwF').innerHTML=`<span class="mut dtl">${plotsAll().length} plots · ${ripe} ready</span>${ripe>1?'<button class="pri" data-hva="1">Harvest all ripe</button>':''}`;
};
$('xw').addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t||t.disabled)return;const ds=t.dataset;
  if(xwMode=='plot'){const d=decor[xwArg];if(!d)return;
    if(ds.pl){plant(d,ds.pl);say('Planted '+CROPS[ds.pl].n+'.');closeX();return}
    if(ds.pla){let n=0;plotsAll().forEach(o=>{if(!o.crop&&plant(o,ds.pla))n++});say('Planted '+CROPS[ds.pla].n+' in '+n+' plots.');closeX();return}
    if(ds.hv){harvest(d);closeX();return}
    if(ds.hva){let n=0;plotsAll().forEach(o=>{if(harvest(o,true))n++});say('Harvested '+n+' plots.');rX();return}
    if(ds.fe){if(!(sup.fert>0))return;sup.fert--;d.crop.fert=1;say('🧺 Fertilized: grows 50% faster, +1 yield.');rX();return}
    if(ds.dig){d.crop=null;cropVis(d);closeX();return}}
  if(ds.mk){make(ds.mk,+ds.n||1);return}
  if(ds.use){consume(ds.use);return}
});
// ---------- cooking and alchemy ----------
function make(k,n){
  const r=FOOD.find(x=>x[0]==k)||ALCH.find(x=>x[0]==k);if(!r)return;if(locked(k))return say('🔒 Defeat '+lockBy(k)+' to learn this recipe.');let m=0;
  for(let i=0;i<n;i++){if(!recOk(r[3]))break;spend(r[3]);giveS(k,r[4]);m+=r[4]}
  const ck=FOOD.includes(r);if(m){say((ck?'🍳 Cooked ':'⚗️ Brewed ')+r[2]+' '+r[1]+' ×'+m+'.');const st=Object.values(decor).find(o=>o.it.st==(ck?'cook':'alch')&&Math.hypot(o.x-pl.position.x,o.z-pl.position.z)<3);if(st)burst(V(st.x,st.sy+1,st.z),ck?0xffb050:0xb08aff,20,1,2,.6)}
  else say('You are missing ingredients.');rX();hud();
}
function buffsHTML(){const now=performance.now(),a=hero.buffs.filter(b=>(b.food||b.elix)&&b.t>now);return a.length?'<span class="mut dtl">Active: '+a.map(b=>b.i+' '+b.n+' ('+fmtT(b.t-now)+')').join(' · ')+'</span>':'<span class="mut dtl">No food or elixir active. You can have 2 foods and 1 elixir at once.</span>'}
const xwGrp=new Set(['Simple meals','Potions']);
const grpHTML=(name,inner,n,ready)=>`<details class="grp" data-g="${name}" ${xwGrp.has(name)?'open':''}><summary><b>${name}</b> <span class="mut">${n} recipe${n==1?'':'s'}${ready?' · <span style="color:#6ee7b7">'+ready+' ready</span>':''}</span></summary><div class="rows">${inner}</div></details>`;
function recipeWin(title,sub,L,verb,useCats,groups){
  $('xwT').textContent=title;$('xwS').textContent=sub;
  const row=r=>{const lk=locked(r[0]);if(lk)return `<div class="rw" style="opacity:.6"><span class="rn">🔒 <b>${r[1]}</b><small>${r[6]}<br><span style="color:#f0cc72">Recipe unlocked by defeating ${lockBy(r[0])} (J)</span></small></span></div>`;const ok=recOk(r[3]),own=cnt(r[0]);return `<div class="rw"><span class="rn">${r[2]} <b>${r[1]}</b> <span class="mut">×${own}${r[4]>1?' · makes '+r[4]:''}</span><small>${r[6]}<br>${recHTML(r[3])}</small></span><span class="ra"><button class="pri" data-mk="${r[0]}" data-n="1" ${ok?'':'disabled'}>${verb}</button><button data-mk="${r[0]}" data-n="5" ${ok?'':'disabled'}>×5</button></span></div>`};
  const rows=groups.map(g=>{const rs=g[1].map(k=>L.find(r=>r[0]==k)).filter(Boolean);return grpHTML(g[0],rs.map(row).join(''),rs.length,rs.filter(r=>!locked(r[0])&&recOk(r[3])).length)}).join('');
  const mine=Object.keys(SUP).filter(k=>useCats.includes(SUP[k].c)&&cnt(k)>0);
  const pan=mine.length?mine.map(k=>`<div class="rw"><span class="rn">${SUP[k].i} <b>${SUP[k].n}</b> <span class="mut">×${cnt(k)}</span><small>${SUP[k].d}</small></span><span class="ra">${['food','elixir','pot'].includes(SUP[k].c)?`<button data-use="${k}">${SUP[k].c=='food'?'Eat':'Drink'}</button>`:''}</span></div>`).join(''):'<div class="mut" style="padding:8px">Nothing made yet.</div>';
  const ing=Object.keys(SUP).filter(k=>['ing','crop'].includes(SUP[k].c)&&cnt(k)>0).map(k=>`<span>${SUP[k].i} ${SUP[k].n} <b>${cnt(k)}</b></span>`).join('');
  $('xwB').innerHTML=`<div class="xcols"><div><div class="sec">Recipes <span style="text-transform:none;letter-spacing:0">(tap a group to open it)</span></div>${rows}</div><div><div class="sec">Ingredients</div><div class="matline">${ing||'<span class="mut">None. Farm crops in your Realm, hunt for meat, fish at the water, forage berries.</span>'}</div><div class="sec">Yours</div><div class="rows">${pan}</div></div></div>`;
  $('xwF').innerHTML=buffsHTML();
}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.classList&&d.classList.contains('grp')){if(d.open)xwGrp.add(d.dataset.g);else xwGrp.delete(d.dataset.g)}},true);
XR.cook=()=>recipeWin('🍳 Cooking Hearth','Food boosts your stats for 15 minutes · up to 2 foods at once',FOOD,'Cook',['food'],[['Simple meals',['f_meat','f_fish','f_bread','f_soup']],['Hearty meals',['f_stew','f_skewer']],['Treats & feasts',['f_tart','f_cake','f_pie','f_feast']]]);
XR.alch=()=>recipeWin('⚗️ Alchemy Table','Potions, elixirs, fertilizer and fusion catalysts',ALCH,'Brew',['pot','elixir','cat','fert'],[['Potions',['p_hp','p_mp']],['Elixirs',['e_might','e_stone','e_swift','e_fort']],['Farming',['fert']],['Fusion catalysts',['c_kin','c_asc','c_bind','c_ess']]]);
// ---------- interaction prompt ----------
function realmPrompt(){
  const px=pl.position.x,pz=pl.position.z,py=pl.position.y;let best=null,bd=1e9;
  Object.values(decor).forEach(o=>{if(Math.abs((o.sy||0)-py)>1.2)return;const dd=Math.hypot(o.x-px,o.z-pz),r=o.it.st=='plot'?1.4:1.9;if(dd>r||dd>=bd)return;
    if(o.it.fam||o.it.id=='bed'||o.it.st){best=o;bd=dd}});
  for(const k in pcs){const p=pcs[k];if(!PS[p.k].door||Math.abs(p.h-py)>1)continue;const dd=Math.hypot(p.x-px,p.z-pz);if(dd<1.5&&dd<bd){best={door:p};bd=dd}}
  if(!best)return null;if(best.door)return {label:'F · '+(best.door.open?'Close':'Open')+' door',fn:()=>toggleDoor(best.door)};
  const o=best,it=o.it;
  if(it.fam)return {label:'F · '+it.fam+' incubator',fn:openInc};
  if(it.id=='bed')return {label:'F · Rest in bed',fn:useBed};
  if(it.st=='cook')return {label:'F · Cook',fn:()=>openX('cook')};
  if(it.st=='alch')return {label:'F · Brew potions',fn:()=>openX('alch')};
  if(it.st=='stable')return {label:'F · Your mounts',fn:()=>openX('mounts')};
  if(it.st=='hive')return {label:o.hive.n?'F · Collect '+o.hive.n+' honey':'🐝 Making honey... '+Math.floor(100*o.hive.acc/180)+'%',fn:()=>{if(!o.hive.n)return;gotS('honey',o.hive.n);o.hive.n=0}};
  if(it.st=='plot'){const s=cropStage(o);if(s==3)return {label:'F · Harvest '+CROPS[o.crop.k].n,fn:()=>harvest(o)};
    return {label:o.crop?'F · '+CROPS[o.crop.k].n+' '+Math.min(99,Math.floor(100*o.crop.g/cropNeed(o)))+'%':'F · Plant seeds',fn:()=>openX('plot',o.x+','+o.y+','+o.z)}}
  return null;
}
function promptTick(){
  const d=(a,b)=>Math.hypot(pl.position.x-a,pl.position.z-b);let p=null;
  if(gat)p={label:GK[gat.tg.kind][1]+'... '+Math.round(100*gat.t/gat.need)+'%',fn:()=>{gat=null}};
  else if(inDun)p=dunPrompt();
  else if(inRealm){if(!building){
    if(d(PORTAL[0],PORTAL[1])<2.4&&pl.position.y<1)p={label:'F · Leave Realm',fn:()=>fadeTo(leaveRealm)};
    else if(d(RBENCH[0],RBENCH[1])<2.6&&pl.position.y<1)p={label:'F · Workbench',fn:openCraft};
    else p=(typeof visitorPrompt=='function'&&visitorPrompt())||realmPrompt()}}
  else{
    const tw=townAt(pl.position.x,pl.position.z,0),T=tw>=0?TOWNS[tw]:null;
    if(T&&d(T.mp[0],T.mp[1])<3.2)p={label:'F · Trading Post',fn:()=>openShop('m')};
    else if(T&&d(T.mv[0],T.mv[1])<3.2)p={label:'F · Magic Shop',fn:()=>openShop('x')};
    else if(T&&T.st&&d(T.st[0],T.st[1])<2.7)p={label:'F · Stable Master',fn:()=>openX('stable',T.i)};
    else if(gatePrompt(T))p=gatePrompt(T);
    else if(boardPrompt(T))p=boardPrompt(T);
    else if(townPortalPrompt(T))p=townPortalPrompt(T);
    else if(T&&d(T.tv[0],T.tv[1])<2.8)p={label:'F · Rest at '+T.tav,fn:()=>restTavern(T)};
    else if(!T&&campChestPrompt())p=campChestPrompt();
    else if(!T&&typeof worldPrompt=='function'&&worldPrompt())p=worldPrompt();
    else if(!T&&dunEntrancePrompt())p=dunEntrancePrompt();
    else{const t=gTarget()||(featMoving?null:groundTarget());if(t)p={label:'F · '+GK[t.kind][0],fn:()=>gStart(t)}}
  }
  PR=p;const b=$('prompt');b.classList.toggle('hide',!p||uiOpen());if(p)b.textContent=p.label;
}
// ---------- hero animation (no body bob in the realm so storeys work) ----------
function animHero(now,mv,h){h=h||pl;
  const b=h.bones,s=mv?Math.sin(now/90):0,c=Math.cos(now/90);
  b.lh0.rotation.x=-s*.7;b.rh0.rotation.x=s*.7;b.lh1.rotation.x=mv?Math.max(0,c)*.9:0;b.rh1.rotation.x=mv?Math.max(0,-c)*.9:0;
  if(!h.sw){b.aL0.rotation.x=s*.6;b.aR0.rotation.x=-s*.6-.2;b.aL1.rotation.x=-.25;b.aR1.rotation.x=-.3;b.spine.rotation.y=-s*.1}
  b.chest.scale.y=1+Math.sin(now/500)*.015;b.head.rotation.y=mv?0:Math.sin(now/1900)*.2;
  b.cp0.rotation.x=(mv?.3:.05)+Math.sin(now/300)*.04;b.cp1.rotation.x=(mv?.35:.06)+Math.sin(now/260+1)*.05;b.cp2.rotation.x=(mv?.4:.07)+Math.sin(now/230+2)*.06;
  if(h!==pl)h.position.y=mv?Math.abs(Math.sin(now/90))*.04:0;
}
// ---------- per-frame upkeep for everything above ----------
let rVy=0;
function homeTick(dt,now,al){
  hero.cdM=Math.max(0,(hero.cdM||0)-dt);if(dt>0){arenaTick(dt,now);dunTick(dt,now)}campTick(dt,now);portalTick(now);compRegen(dt,now);combatTick(dt,now);if(typeof worldTick=='function')worldTick(dt,now);
  mountTick(dt,now,al);
  if(inRealm){
    const p=pl.position,g=groundAt(p.x,p.z,p.y);
    if(g!=null){if(g>=p.y-.3){p.y=g;rVy=0}else{rVy=Math.min(18,rVy+28*dt);p.y=Math.max(g,p.y-rVy*dt)}}
    if(now-cutT>100){cutT=now;cutTick()}
    if(Math.random()<.04){const rp=plotsAll().filter(o=>cropStage(o)==3&&o.g.visible);if(rp.length){const o=rp[R(0,rp.length-1)];burst(V(o.x+(Math.random()-.5)*.6,o.sy+.6,o.z+(Math.random()-.5)*.6),0xfff0a0,1,.2,.8,.8)}}
  }
  if(now-farmT>1000){farmT=now;farmTick()}
}

// ---------- workbench: items grouped by type, groups fold away ----------
const WBG={0:[['Wood',['plank','log','thatch']],['Stone',['cobble','brick','mossy']],['Clay & plaster',['clay','plaster','tile']],['Special',['glass','iron','bone','crystal']]],
  1:[['Furniture','furn'],['Stations','stat'],['Farming','farm'],['Garden & decor','dec']],2:[['Ground','ter'],['Island','isle']],3:[['Incubators','inc']]};
function rCr(){
  $('crm').innerHTML=Object.keys(mats).filter(k=>mats[k]>0||RES[k]).map(k=>`<span title="${matInfo(k)[0]}">${matInfo(k)[1]} <b>${mats[k]}</b></span>`).join('');
  $('crt').innerHTML=BTABS.map((n,i)=>`<button data-ct="${i}" class="${i==ctab?'on':''}">${n}</button>`).join('');
  const all=Object.keys(ITEMS).filter(k=>ITEMS[k].cat==ctab&&ITEMS[k].rec);
  const row=k=>{const it=ITEMS[k],bl=locked(k)||(it.cat==0&&locked('m:'+it.id)),ok=canCraft(it)&&!bl,own=have[k]||0,lk=it.cat==3?'Needed to hatch '+it.fam+' eggs. One per type.':(likedBy(it.id)?'Loved by '+likedBy(it.id):'')+(it.cz?(likedBy(it.id)?' · ':'')+'Coziness +'+it.cz:'');
    const lock=it.fam&&(built[it.fam]||own>0);
    if(bl)return `<div class="rw" style="opacity:.6"><span class="rn">🔒 <b>${it.n}</b><small style="color:#f0cc72">Unlocked by defeating ${lockBy(locked(k)?k:'m:'+it.id)} (J)</small></span></div>`;
    return `<div class="rw"><span class="rn">${it.i} <b>${it.n}</b> <span class="mut">×${own}${it.out>1?' · makes '+it.out:''}</span><small>${Object.keys(it.rec).map(m=>`<span style="color:${mats[m]>=it.rec[m]?'#6ee7b7':'#f87171'}">${matInfo(m)[1]} ${mats[m]}/${it.rec[m]}</span>`).join(' &nbsp;')}${lk?' &nbsp;·&nbsp; '+lk:''}</small></span><span class="ra"><button class="pri" data-cr="${k}" data-n="1" ${ok?'':'disabled'}>${lock?(built[it.fam]?'Placed':'Owned'):'Craft'}</button>${it.cat==3?'':`<button data-cr="${k}" data-n="5" ${ok?'':'disabled'}>×5</button>`}</span></div>`};
  const inG=(k,g)=>{const it=ITEMS[k];if(ctab==0)return g[1].includes(it.id);if(ctab==1)return bcOf(it)==g[1];if(ctab==2)return g[1]=='isle'?!!it.land:!it.land;return true};
  $('crl').innerHTML=(WBG[ctab]||[]).map(g=>{const ks=all.filter(k=>inG(k,g));if(!ks.length)return '';return grpHTML(g[0],ks.map(row).join(''),ks.length,ks.filter(k=>canCraft(ITEMS[k])&&!locked(k)).length)}).join('');
}
