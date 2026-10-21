// ================= companion families, materials, terrain items, recall and the system menu (the Realm itself was retired in v102) =================
const FAMS=['Primal','Aquatic','Insect','Avian','Draconic','Stone','Undead','Spirit','Fungal'];
const TAGS={Foxlet:'Primal',Ashwolf:'Primal',Mossfrog:'Aquatic',Cryptspider:'Insect',Skyhawk:'Avian',Batwing:'Avian',Drakelet:'Draconic',Gravewyrm:'Draconic',Stoneshell:'Stone',Boneling:'Undead',Wispling:'Spirit',Gloomcap:'Fungal'};
const TGI={Primal:'🐾',Aquatic:'💧',Insect:'🕸️',Avian:'🪶',Draconic:'🐲',Stone:'🪨',Undead:'💀',Spirit:'👻',Fungal:'🍄'};
const FAMC={Primal:0xe8833a,Aquatic:0x4aa8e8,Insect:0x8a5a9a,Avian:0x7ac8f0,Draconic:0xd04a2a,Stone:0xa0a090,Undead:0xe0e0c0,Spirit:0x7fe8ff,Fungal:0xb050a0};
const FAM={Primal:['Beast Hide','🦊'],Aquatic:['Slime Scale','🫧'],Insect:['Silk Gland','🕸️'],Avian:['Soaring Feather','🪶'],Draconic:['Dragon Scale','🐉'],Stone:['Rock Core','🪨'],Undead:['Grave Dust','💀'],Spirit:['Ectoplasm','👻'],Fungal:['Spore Cap','🍄']};
const RES={wood:['Wood','🪵'],stone:['Stone','🪨'],iron:['Iron Ore','⛏️'],crystal:['Crystal Shard','💎'],fiber:['Plant Fiber','🌿'],petals:['Petals','🌸'],glowcap:['Glow Cap','✨'],bone:['Old Bone','🦴'],clay:['Clay','🧱']};
const mats={},built={},skills={wood:{l:1,x:0},mine:{l:1,x:0},forage:{l:1,x:0}};
Object.keys(RES).forEach(k=>mats[k]=0);FAMS.forEach(t=>mats[FAM[t][0]]=0);
const matInfo=k=>RES[k]||Object.values(FAM).find(f=>f[0]==k)||UPM.find(u=>u[0]==k)||[k,'📦'];
const mkEgg=(sp,tier,pa)=>({id:uid++,sp:sp,tier:tier,pa:pa,tag:TAGS[sp]});
let rec=null; // the recall in progress
const have={}; // Realm terrain items (t:…) still found by digging soil mounds and shallow water; kept in the save
const mnd={x:0,y:0};
// ---- terrain ----
const T_=(id,n,i,col,tuft,rec,out)=>({id:id,n:n,i:i,col:col,tuft:tuft,rec:rec,out:out||1,cat:2});
const TER=[
 T_('void','Open Sky','☁️',0x8ec8f0),T_('grass','Turf','🟩',0x62a84c,0x4f9a38,{fiber:4,clay:1},2),T_('dirt','Packed Dirt','🟫',0x7a5a3c,0,{stone:1,fiber:1},2),
 T_('sand','Sand','🟨',0xd8c080,0,{stone:2},3),T_('snow','Snow','⬜',0xeef4fa,0,{crystal:1},3),T_('moss','Moss','🌱',0x3f6a3a,0x4a7a44,{fiber:3,clay:1},2),
 T_('mud','Mud','🟤',0x4a3a2c,0,{clay:2},3),T_('water','Shallow Water','💧',0x3a7ac0),T_('ash','Ash','🌫️',0x3a3a3e,0,{wood:2},3),
 T_('flagstone','Flagstone','🔲',0x8a8a8e,0,{stone:2},2),T_('crystalfloor','Crystal Floor','💠',0x6a9ad8,0,{crystal:2,stone:1},2),T_('meadow','Flower Meadow','🌼',0x68ad50,0x58a84a,{petals:3,fiber:2},2)
];
const TERI={};TER.forEach((t,i)=>TERI[t.id]=i);
// ---- every placeable item in one table ----
const ITEMS={};
ITEMS['f:isle']={id:'isle',key:'f:isle',n:'Island Tile',i:'🏝️',cat:2,land:true,out:4,rec:{stone:2,fiber:2},col:0x62a84c};
TER.slice(1).forEach(t=>{t.key='t:'+t.id;ITEMS[t.key]=t});
const BDIG=['grass','mud','dirt','dirt','snow','ash','moss','sand','dirt','moss','mud','sand'];

// ---- building state and actions ----
let rest={t:0,m:0};
const restBonus=()=>rest.t>Date.now()?rest.m:0;
// ---- teleporting between the world and the realm ----
function fadeTo(fn){const f=$('fade');f.style.opacity=1;setTimeout(()=>{fn();setTimeout(()=>{f.style.opacity=0},120)},400)}
function snapCam(){cam.position.set(pl.position.x+Math.sin(camYaw)*Math.cos(camPitch)*camDist,pl.position.y+1.1+Math.sin(camPitch)*camDist,pl.position.z+Math.cos(camYaw)*Math.cos(camPitch)*camDist);look.set(pl.position.x,pl.position.y+1,pl.position.z);fols.forEach(f=>{if(f)f.position.set(pl.position.x-1,0,pl.position.z)})}
function doRecall_base(){
  if(uiOpen())return;
  if(rec){rec=null;say('Recall cancelled.');return}
  if(enemies.some(e=>!e.dead&&e.agg&&e.m.position.distanceTo(pl.position)<10))return say('You cannot recall with enemies this close.');
  rec={t:0,need:4,hp:hero.hp};say('Recalling to '+(home||TOWNS[0]).n+'... stay out of trouble for 4 seconds.');
}
$('recallBtn').onclick=doRecall;
$('sysBtn').onclick=e=>{e.stopPropagation();$('sysmenu').classList.toggle('hide')};$('sysmenu').addEventListener('click',()=>$('sysmenu').classList.add('hide'));document.addEventListener('click',e=>{if(!e.target.closest('#sysmenu')&&e.target.id!='sysBtn')$('sysmenu').classList.add('hide')});
