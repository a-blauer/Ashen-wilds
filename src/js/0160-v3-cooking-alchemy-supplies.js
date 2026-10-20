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
const triGeo=(pts)=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>s.lineTo(p[0],p[1]));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.2,bevelEnabled:false});g.translate(0,0,-.1);return g};
const GABG=triGeo([[-1,0],[1,0],[0,1]]),HGABG=triGeo([[-1,0],[1,0],[1,1]]);
function walk(o,dx,dz){
  const p=o.position,tin=tcHit(p.x,p.z);
  if(!CR.some(([a,b])=>solid(p.x+dx+a,p.z+b))&&(tin||!tcHit(p.x+dx,p.z)))p.x+=dx;
  if(!CR.some(([a,b])=>solid(p.x+a,p.z+dz+b))&&(tin||!tcHit(p.x,p.z+dz)))p.z+=dz;
}
$('xw').addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t||t.disabled)return;const ds=t.dataset;
  if(ds.mk){make(ds.mk,+ds.n||1);return}
  if(ds.use){consume(ds.use);return}
});
// ---------- cooking and alchemy ----------
function make(k,n){
  const r=FOOD.find(x=>x[0]==k)||ALCH.find(x=>x[0]==k);if(!r)return;if(locked(k))return say('🔒 Defeat '+lockBy(k)+' to learn this recipe.');let m=0;
  for(let i=0;i<n;i++){if(!recOk(r[3]))break;spend(r[3]);giveS(k,r[4]);m+=r[4]}
  const ck=FOOD.includes(r);if(m){say((ck?'🍳 Cooked ':'⚗️ Brewed ')+r[2]+' '+r[1]+' ×'+m+'.')}
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
  $('xwB').innerHTML=`<div class="xcols"><div><div class="sec">Recipes <span style="text-transform:none;letter-spacing:0">(tap a group to open it)</span></div>${rows}</div><div><div class="sec">Ingredients</div><div class="matline">${ing||'<span class="mut">None. Hunt for meat, fish at the water, forage berries.</span>'}</div><div class="sec">Yours</div><div class="rows">${pan}</div></div></div>`;
  $('xwF').innerHTML=buffsHTML();
}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.classList&&d.classList.contains('grp')){if(d.open)xwGrp.add(d.dataset.g);else xwGrp.delete(d.dataset.g)}},true);
XR.cook=()=>recipeWin('🍳 Cooking Hearth','Food boosts your stats for 15 minutes · up to 2 foods at once',FOOD,'Cook',['food'],[['Simple meals',['f_meat','f_fish','f_bread','f_soup']],['Hearty meals',['f_stew','f_skewer']],['Treats & feasts',['f_tart','f_cake','f_pie','f_feast']]]);
XR.alch=()=>recipeWin('⚗️ Alchemy Table','Potions, elixirs, fertilizer and fusion catalysts',ALCH,'Brew',['pot','elixir','cat','fert'],[['Potions',['p_hp','p_mp']],['Elixirs',['e_might','e_stone','e_swift','e_fort']],['Farming',['fert']],['Fusion catalysts',['c_kin','c_asc','c_bind','c_ess']]]);
function promptTick(){
  const d=(a,b)=>Math.hypot(pl.position.x-a,pl.position.z-b);let p=null;
  if(gat)p={label:GK[gat.tg.kind][1]+'... '+Math.round(100*gat.t/gat.need)+'%',fn:()=>{gat=null}};
  else {
    const tw=townAt(pl.position.x,pl.position.z,0),T=tw>=0?TOWNS[tw]:null;
    if(T&&d(T.mp[0],T.mp[1])<3.2)p={label:'F · Trading Post',fn:()=>openShop('m')};
    else if(T&&d(T.mv[0],T.mv[1])<3.2)p=shopBuilt('magic')?{label:'F · Magic Shop',fn:()=>openShop('x')}:{label:'🔨 Magic Shop · build it at the Stronghold Steward',fn:()=>openX('hold')};
    else if(T&&T.st&&d(T.st[0],T.st[1])<2.7)p={label:'F · Stable Master',fn:()=>openX('stable',T.i)};
    else if(gatePrompt(T))p=gatePrompt(T);
    else if(townPortalPrompt(T))p=townPortalPrompt(T);
    else if(T&&d(T.tv[0],T.tv[1])<2.8)p={label:'F · Rest at '+T.tav,fn:()=>restTavern(T)};
    else if(!T&&campChestPrompt())p=campChestPrompt();
    else if(!T&&typeof worldPrompt=='function'&&worldPrompt())p=worldPrompt();
    else{const t=gTarget()||(featMoving?null:groundTarget());if(t)p={label:'F · '+GK[t.kind][0],fn:()=>gStart(t)}}
  }
  PR=p;const b=$('prompt');b.classList.toggle('hide',!p||uiOpen());if(p)b.textContent=p.label;
}
function homeTick(dt,now,al){
  hero.cdM=Math.max(0,(hero.cdM||0)-dt);if(dt>0)arenaTick(dt,now);campTick(dt,now);portalTick(now);compRegen(dt,now);combatTick(dt,now);if(typeof worldTick=='function')worldTick(dt,now);
  mountTick(dt,now,al);
}

