// =============== 8. FISHING ===============
const FISH=[
 ['Sunfish','🐟',1,0],['Mud Carp','🐟',1,0],['Silver Minnow','🐟',1,0],['Speckled Trout','🐠',1,1],['Golden Perch','🐠',2,1],['Frost Pike','🐡',2,1],
 ['Ember Eel','🐍',3,1],['Ghost Koi','🎏',3,2],['Bone Gar','🦴',4,2],['Lantern Fish','🏮',4,2],['Storm Marlin','⚡',5,2],['Ancient Koi','✨',1,3]];
const fishLog={};let fishing=null;
function nearWater(){const px=Math.round(pl.position.x),pz=Math.round(pl.position.z);for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const t=MAP[pz+j]&&MAP[pz+j][px+i];if(t=='~'){const b=BIOMES[MAP.bio[pz+j][px+i]];if(!b.lava)return [px+i,pz+j]}}return null}
function fishEnd(msg){if(!fishing)return;scene.remove(fishing.bob);fishing=null;$('fishui').classList.add('hide');if(msg)say(msg)}
function fishPick(){const T=tierAt(pl.position.x,pl.position.z),pool=FISH.filter(f=>f[2]<=T),w=pool.map(f=>[8,3,1,.15][f[3]]*(f[2]==T?1.5:1));let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<pool.length;i++){r-=w[i];if(r<0)return pool[i]}return pool[0]}
function fishCatch(){const f=fishing.fish,T=tierAt(pl.position.x,pl.position.z),p=pl.position.clone();fishLog[f[0]]=(fishLog[f[0]]||0)+1;const first=fishLog[f[0]]==1;
  giveS('fish',f[3]+1);
  pickup({ic:f[1],t:'Caught a '+f[0]+'!',col:['#a8a8a8','#5fcf6a','#5a96ff','#ff9a2a'][f[3]],sub:'+'+(f[3]+1)+' Fish'+(first?' · New in your Bestiary!':''),r:f[3]+1});sfx('chime');
  if(Math.random()<(f[3]>=2?.08:.012)){const eg=rollEgg(T);drop('egg',eg,p,eg.tier)}if(f[3]>=2&&Math.random()<.35)drop('sup',{k:RUNEK[R(0,RUNEK.length-1)],n:1},p,2);
  fishTreasure(f[3],T,p);fishEnd();hud()}
addEventListener('keydown',e=>{if(!fishing)return;const k=e.key.toLowerCase();if(k=='f'||k==' '){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)fishPress(true)}else if(k=='escape'){fishEnd('You reel in your line.')}},true);
addEventListener('keyup',e=>{if(!fishing)return;const k=e.key.toLowerCase();if(k=='f'||k==' '){e.stopImmediatePropagation();fishPress(false)}},true);

