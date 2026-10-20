// ================= Realm: your own instance - crafting, building, decor, terrain, habitats =================
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
// ---- realm geometry: a floating island far away from the world map ----
const RX=1000,RZ=1000,RN=48,PORTAL=[RX+24,RZ+26],RBENCH=[RX+27,RZ+26];
let inRealm=false,ret=null,rec=null,seenRealm=false;
const have={},blocks={},decor={},terr=new Uint8Array(RN*RN);
const mnd={x:0,y:0};
// ---- shared model helpers ----
const GX={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(.5,.5,1,12),sph:new THREE.SphereGeometry(.5,12,9),cone:new THREE.ConeGeometry(.5,1,10),tor:new THREE.TorusGeometry(.5,.12,8,18),oct:new THREE.OctahedronGeometry(.5,0),dod:new THREE.DodecahedronGeometry(.5,0)};
const MC={};
function pmat(col,em){const k=col+'_'+(em||0);return MC[k]||(MC[k]=em?new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:em,roughness:.5}):mt(col))}
function pm(g,geo,col,x,y,z,sx,sy,sz,rx,rz,em){const m=new THREE.Mesh(GX[geo],pmat(col,em));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx||0,0,rz||0);m.castShadow=true;g.add(m);return m}
// ---- blocks ----
const B_=(id,n,i,rec,out,pat,col)=>({id:id,n:n,i:i,rec:rec,out:out,pat:pat,col:col,cat:0});
const BLK=[
 B_('plank','Plank','🟫',{wood:1},2,'plank',0x9a6a3a),B_('log','Log Wall','🪵',{wood:2},1,'log',0x5a3a22),B_('thatch','Thatch','🌾',{fiber:3},2,'thatch',0xc8a850),
 B_('cobble','Cobblestone','🪨',{stone:1},2,'cobble',0x7a7a80),B_('brick','Stone Brick','⬜',{stone:2},2,'brick',0x8a8a92),B_('mossy','Mossy Stone','🟩',{stone:2,fiber:1},2,'mossy',0x667a5a),
 B_('clay','Clay Brick','🧱',{clay:2},2,'clay',0xb4623e),B_('plaster','Plaster','🤍',{clay:1,stone:1},2,'plaster',0xe8dfc8),B_('tile','Roof Tile','🔺',{clay:2,wood:1},2,'tile',0x8a3a2e),
 B_('glass','Glass','🟦',{crystal:1},2,'glass',0xbfeaff),B_('iron','Iron Block','⬛',{iron:2},1,'metal',0x4a4e58),B_('bone','Bone Block','🦴',{bone:3},1,'bonebl',0xe4dcc4),B_('crystal','Crystal Block','💠',{crystal:3},1,'crystal',0x7ad0ff)
];
function blockTex(pat,col){
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  g.fillStyle='#'+col.toString(16).padStart(6,'0');g.fillRect(0,0,64,64);
  const ln=(a,w)=>{g.strokeStyle=a;g.lineWidth=w||2},sp=(n,a)=>{g.fillStyle=a;for(let k=0;k<n;k++)g.fillRect(Math.random()*64,Math.random()*64,2+Math.random()*4,1+Math.random()*2)},hl=(y)=>{g.beginPath();g.moveTo(0,y);g.lineTo(64,y);g.stroke()};
  if(pat=='plank'){ln('rgba(0,0,0,.3)');for(let y=0;y<64;y+=16)hl(y);sp(30,'rgba(0,0,0,.14)')}
  else if(pat=='log'){for(let x=0;x<64;x+=8){g.fillStyle=x%16?'rgba(0,0,0,.2)':'rgba(255,255,255,.07)';g.fillRect(x,0,8,64)}sp(26,'rgba(0,0,0,.2)')}
  else if(pat=='thatch'){ln('rgba(90,60,10,.5)',1.5);for(let i=-64;i<128;i+=6){g.beginPath();g.moveTo(i,0);g.lineTo(i+30,64);g.stroke()}sp(30,'rgba(255,230,140,.25)')}
  else if(pat=='cobble'){g.fillStyle='rgba(0,0,0,.28)';for(let i=0;i<14;i++){g.beginPath();g.arc(Math.random()*64,Math.random()*64,6+Math.random()*6,0,6.28);g.fill()}ln('rgba(0,0,0,.3)');g.strokeRect(1,1,62,62);sp(30,'rgba(255,255,255,.1)')}
  else if(pat=='brick'||pat=='mossy'||pat=='clay'||pat=='tile'){
    ln(pat=='clay'?'rgba(60,30,20,.45)':'rgba(0,0,0,.35)');
    for(let y=0;y<64;y+=16){hl(y);const o=(y/16)%2?0:16;for(let x=o;x<64;x+=32){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+16);g.stroke()}}
    if(pat=='mossy')sp(40,'rgba(70,140,60,.55)');
    if(pat=='tile'){ln('rgba(255,255,255,.12)',1);for(let y=8;y<64;y+=16)hl(y)}}
  else if(pat=='plaster'){sp(50,'rgba(120,100,70,.18)');ln('rgba(120,100,70,.25)',1);g.strokeRect(.5,.5,63,63)}
  else if(pat=='glass'){ln('rgba(255,255,255,.85)',4);g.strokeRect(2,2,60,60);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(10,10,14,4);g.fillRect(10,10,4,14)}
  else if(pat=='metal'){g.fillStyle='rgba(255,255,255,.18)';[[8,8],[56,8],[8,56],[56,56]].forEach(q=>{g.beginPath();g.arc(q[0],q[1],3,0,6.28);g.fill()});ln('rgba(0,0,0,.4)');g.strokeRect(1,1,62,62)}
  else if(pat=='bonebl'){ln('rgba(120,100,70,.4)',1.5);for(let i=0;i<5;i++){g.beginPath();g.moveTo(Math.random()*64,0);g.lineTo(Math.random()*64,64);g.stroke()}sp(24,'rgba(150,130,100,.3)')}
  else if(pat=='crystal'){ln('rgba(255,255,255,.55)',2);g.beginPath();g.moveTo(8,56);g.lineTo(32,6);g.lineTo(56,56);g.closePath();g.stroke();g.fillStyle='rgba(255,255,255,.2)';g.fillRect(28,12,8,32)}
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;return t;
}
const BM=BLK.map(b=>{
  const m=new THREE.InstancedMesh(GX.box,new THREE.MeshStandardMaterial({map:blockTex(b.pat,b.col),roughness:.9,transparent:b.id=='glass',opacity:b.id=='glass'?.6:1,emissive:b.id=='crystal'?0x3aa0e0:0,emissiveIntensity:b.id=='crystal'?.5:0}),1500);
  m.count=0;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;scene.add(m);return m});
const BL=BLK.map(()=>[]);
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
const nTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');for(let y=0;y<64;y++)for(let x=0;x<64;x++){const v=205+Math.random()*50|0;g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(x,y,1,1)}const t=new THREE.CanvasTexture(c);return t})();
const RUND=new THREE.InstancedMesh(GX.box,new THREE.MeshStandardMaterial({roughness:1}),RN*RN),RCON=new THREE.InstancedMesh(new THREE.ConeGeometry(.5,1,7),new THREE.MeshStandardMaterial({roughness:1,flatShading:true}),RN*RN);
// ---- the sky around the island: gradient, drifting clouds and distant floating islets ----
const SKYTEX=(()=>{const c=document.createElement('canvas');c.width=4;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#2f6fd0');gr.addColorStop(.45,'#79b8ee');gr.addColorStop(.8,'#cfe8f8');gr.addColorStop(1,'#f4f9fc');g.fillStyle=gr;g.fillRect(0,0,4,256);return new THREE.CanvasTexture(c)})();
const RLT=[0,1,2].map(()=>{const l=new THREE.PointLight(0xffb060,0,6);l.position.set(RX,1,RZ);scene.add(l);return l});
const BGA=new THREE.Mesh(GX.cone,new THREE.MeshBasicMaterial({color:0xffffff}));

// ---- building state and actions ----
let building=false,bsel='remove',btab=0,brot=0,bheld=false;
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
