// ================= v49: secrets, world events, fishing, gear sets & legendaries, creature runes, realm visitors, bestiary =================
const UW={rnd:(()=>{let s=4242;return ()=>(s=s*16807%2147483647)/2147483647})()};
const opn=(x,y)=>{const t=MAP[y]&&MAP[y][x];return t&&t!='#'&&t!='~'&&t!='r'&&t!='R'&&t!='W'&&t!='B'&&t!='a'};
function freeSpot(x,y,r){for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r&&!opn(x+i,y+j))return false;
  if(townAt(x,y,18)>=0||CAMPS.some(C=>Math.hypot(C.x-x,C.z-y)<CAMP_R+8)||ARN.some(A=>Math.hypot(A.cx-x,A.cz-y)<ARENA_R+10)||DUNS.some(D=>Math.hypot((D.x||D.tx)-x,(D.y||D.ty)-y)<10))return false;return true}
function pickSpot(T,minD,tries){for(let k=0;k<(tries||400);k++){const x=8+Math.floor(UW.rnd()*(W-16)),y=8+Math.floor(UW.rnd()*(H-16));if(tierAt(x,y)!==T)continue;if(SECRETS.some(s=>Math.hypot(s.x-x,s.z-y)<(minD||30)))continue;if(freeSpot(x,y,3))return [x,y]}return null}
// shared loot chest
const CHESTS=[];
function makeChest(x,z,label,loot){
  const g=new THREE.Group();g.position.set(x,GH(x,z),z);
  TQ(g,G_BOX,sm(0x5a3a1e),0,.32,0,1.1,.64,.72);TQ(g,G_BOX,sm(0x6a4626),0,.74,0,1.12,.22,.74);[-.5,.5].forEach(px=>TQ(g,G_BOX,sm(0xd8a830,{metalness:.7,roughness:.3}),px,.45,0,.06,.9,.76));TQ(g,G_BOX,sm(0xe8c040,{metalness:.7,roughness:.3}),0,.42,.37,.18,.24,.04);
  const gl=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,3,20,1,true),new THREE.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));gl.position.y=1.5;g.add(gl);
  scene.add(g);const c={g,x,z,label,loot};CHESTS.push(c);return c}
function openChest(c){const i=CHESTS.indexOf(c);if(i<0)return;CHESTS.splice(i,1);tw(450,k=>{c.g.scale.setScalar(1-k*.9)},()=>scene.remove(c.g));burst(gY(c.g.position,.8),0xffd060,60,3,3,.8);sfx('chime');c.loot(V(c.x,0,c.z+1));hud()}
function stdLoot(p,T,o){o=o||{};const l=Math.max(1,Math.min(MAXLV,TIER_LV[T-1][0]+R(2,8)));const g=Math.round((30+l*10)*(o.g||1));gold+=g;dn(p,'+'+g+' 🪙','#fbbf24',-26,1300);
  const it=genItem(l,{minR:o.minR||1,cls:hero.cls});drop('gear',it,p,it.r);if(Math.random()<(o.egg||.3)){const eg=rollEgg(T);drop('egg',eg,p,eg.tier)}if(Math.random()<(o.rune||.25))drop('sup',{k:RUNEK[R(0,RUNEK.length-1)],n:1},p,2);drop('mat',{k:UPM[T-1][0],n:R(2,4)},p,T-1)}

// =============== 6. SECRETS: cracked boulders, lore stones, treasure maps ===============
const SECRETS=[];const secOpen=new Set(),loreRead=new Set();let tmaps=[];
const LORE=[
 ['The First Hatching','Long before the towns, the Heartlands were a nursery. Eudemons laid their eggs in warm meadow soil, and the first tamers were simply the ones who stayed to watch them hatch.'],
 ['Grimtusk’s Den','The wolves of the Frostwood follow a mother older than the trees. Hunters say she remembers every pup that was ever taken from her den.'],
 ['The Drowned Bell','A bell rings under the Murky Mire on still nights. The old village that owned it sank in a single storm, along with everyone who refused to leave their eggs behind.'],
 ['Stonegate’s Oath','The walls of Stonegate were raised in nine days by people who had already lost one home. Each stone is carved with the name of someone who did not make it.'],
 ['Spores and Silence','In the Fungal Grove, the mushrooms talk to each other through the ground. Stand still long enough and you can feel the conversation in your boots.'],
 ['The Ashen Warden','The Warden was a tortoise who swallowed a dying star to keep it from burning the highlands. It has been carrying that fire for a thousand years.'],
 ['Cinderwatch Rising','Cinderwatch was built on cooled lava, and the smiths swear the ground is still warm in winter. They are not wrong.'],
 ['Silk and Shadow','The Webwood spiders weave their webs in patterns. Scholars have copied them for centuries; nobody has worked out what they spell.'],
 ['The Pyrelord’s Pact','The drakes of the Ember Crags once served the cultists willingly. Then the cultists asked for eggs as tribute.'],
 ['Palehaven’s Bones','Every building in Palehaven sits on a foundation of ancient bone. The founders said it was the only material the wraiths would not walk through.'],
 ['The Hollow Knights','The armour still marches, but nobody is inside. Some say they guard a king; others say they are looking for one.'],
 ['Lights of the Fen','The wisps of the Haunted Fens are kind to travelers who carry a lantern, and cruel to those who carry torches. Nobody knows why.'],
 ['Skyreach Winds','Skyreach was founded by harpy tamers who learned to read the wind. The town bells are tuned so that each storm plays a different song.'],
 ['The Giant’s Stones','The standing stones of Stormreach are not monuments. The giants placed them to count the years, and they are almost out of stones.'],
 ['The Last Sovereign','The oldest tale says that when the final Sovereign falls, the eggs of the world will hatch all at once. The Wyrm of the Barrens has not fallen yet.']];
{
  for(let T=1;T<=5;T++){
    for(let k=0;k<3;k++){const s=pickSpot(T,26);if(s)SECRETS.push({id:SECRETS.length,k:'lore',x:s[0],z:s[1],T,li:(T-1)*3+k})}
    for(let k=0;k<2;k++){const s=pickSpot(T,26);if(s)SECRETS.push({id:SECRETS.length,k:'boulder',x:s[0],z:s[1],T})}
  }
}
function buildSecret(S){
  const g=new THREE.Group();g.position.set(S.x,GH(S.x,S.z),S.z);
  if(S.k=='lore'){TQ(g,G_BOX,sm(0x7a7a80),0,1.15,0,.8,2.3,.38,0,0,.04);TQ(g,G_BOX,sm(0x5a5a62),0,.1,0,1.3,.2,.8);
    const r=TQ(g,G_BOX,gmat(0x8ad8ff),0,1.35,.2,.36,1.1,.02);r.castShadow=false;S.glow=r;
    const h=new THREE.Mesh(new THREE.CircleGeometry(1.1,24),new THREE.MeshBasicMaterial({color:0x8ad8ff,transparent:true,opacity:.18,depthWrite:false}));h.rotation.x=-Math.PI/2;h.position.y=.05;g.add(h)}
  else{const b=TQ(g,new THREE.DodecahedronGeometry(1,0),sm(0x6e6a64),0,.95,0,1.25,1.05,1.15,.3,.6,0);
    [[0,1.2,.9,.5],[.5,.9,.8,-.6],[-.4,1.4,.75,.9]].forEach(([x,y,z,r])=>{const c=TQ(g,G_BOX,gmat(0xffb050),x,y,z,.06,.6,.02,0,0,r);c.castShadow=false});
    S.body=b;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)CBLK.add((S.z+j)*W+S.x+i)}
  scene.add(g);S.g=g;
}
function breakBoulder(S){
  if(S.broken)return;S.broken=1;secOpen.add('b'+S.id);for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)CBLK.delete((S.z+j)*W+S.x+i);
  burst(gY(V(S.x,0,S.z),1),0x8a8478,60,4,3,.8);burst(gY(V(S.x,0,S.z),1),0xffb050,30,3,3,.6);shake(.25);sfx('boom');
  tw(400,k=>S.g.scale.setScalar(1-k),()=>{scene.remove(S.g);S.g=null});
  popT(V(S.x,0,S.z),'SECRET FOUND!','#fbbf24',true);say('🗝️ The cracked boulder shatters, revealing a hidden cache!');
  makeChest(S.x,S.z,'hidden cache',p=>stdLoot(p,S.T,{minR:2,egg:.5,rune:.6,g:1.5}));
}
function readLore(S){const L=LORE[S.li];const first=!loreRead.has(S.li);loreRead.add(S.li);if(S.glow)S.glow.material=gmat(0x4a6a7a);
  if(first){const xp=Math.round(needH(Math.max(1,TIER_LV[S.T-1][0]))*.25);if(hero.lvl<MAXLV){hero.xp+=xp;while(hero.lvl<MAXLV&&hero.xp>=needH(hero.lvl)){hero.xp-=needH(hero.lvl);heroLevelUp()}}pickup({ic:'📜',t:'Lore discovered',col:'#8ad8ff',sub:L[0]+' · +'+xp+' XP',r:2});sfx('chime')}
  openX('lore',S.li)}
XR.lore=()=>{const L=LORE[xwArg|0];$('xwT').textContent='📜 '+L[0];$('xwS').textContent='Lore stone · '+loreRead.size+' / '+LORE.length+' found';$('xwB').innerHTML=`<p class="lore">${L[1]}</p>`;$('xwF').innerHTML='<span class="mut dtl">Lore stones glow blue. Each one you read adds to your Bestiary (L).</span>'};
// treasure maps
function giveMap(p){const T=tierAt(p.x,p.z);let s=null;for(let k=0;k<200&&!s;k++){const x=8+Math.floor(Math.random()*(W-16)),y=8+Math.floor(Math.random()*(H-16));if(tierAt(x,y)==T&&freeSpot(x,y,1)&&Math.hypot(x-p.x,y-p.z)>30)s=[x,y]}
  if(!s)return;tmaps.push({x:s[0],z:s[1],T});pickup({ic:'🗺️',t:'Treasure Map',col:'#fbbf24',sub:'An ✕ is marked on your minimap and world map (N)',r:2});sfx('chime')}
function digTreasure(m){tmaps=tmaps.filter(q=>q!==m);const p=V(m.x,0,m.z);burst(gY(p,.3),0x8a6a40,40,2.5,3,.7);sfx('blunt');popT(p,'TREASURE!','#fbbf24',true);
  makeChest(m.x,m.z+.5,'buried treasure',q=>stdLoot(q,m.T,{minR:1,egg:.35,rune:.4,g:1.3}))}

// =============== 7. WORLD EVENTS ===============
let EVT=null,evNext=nowP()+5*60000;
const EVK={meteor:['☄️','Meteor Strike','A meteor crashed nearby. Defeat the starborn creatures around the crater.'],caravan:['🛒','Goblin Caravan','A treasure caravan is passing through. Defeat its guards to claim the wagon.'],portal:['🌀','Invasion Portal','A rift has opened. Survive three waves to collapse it.']};
function evStart(k){
  const T=tierAt(pl.position.x,pl.position.z);let s=null;
  for(let t=0;t<300&&!s;t++){const a=Math.random()*6.283,r=45+Math.random()*55,x=Math.round(pl.position.x+Math.cos(a)*r),y=Math.round(pl.position.z+Math.sin(a)*r);if(x<10||y<10||x>W-10||y>H-10)continue;if(tierAt(x,y)!==T)continue;if(freeSpot(x,y,4))s=[x,y]}
  if(!s)return false;k=k||['meteor','caravan','portal'][R(0,2)];const D=EVK[k];
  EVT={k,x:s[0],z:s[1],T,t0:nowP(),until:nowP()+8*60000,foes:[],wave:0,spawned:false,g:null};
  const g=new THREE.Group();g.position.set(s[0],GH(s[0],s[1]),s[1]);EVT.g=g;scene.add(g);
  if(k=='meteor'){const cr=new THREE.Mesh(new THREE.CircleGeometry(3.4,28),sm(0x2a2220));cr.rotation.x=-Math.PI/2;cr.position.y=.06;g.add(cr);for(let i=0;i<7;i++){const a=i/7*6.283;TQ(g,G_OCT,sm(0x9a7aff,{emissive:0x6a4aff,emissiveIntensity:.9}),Math.cos(a)*2,.5,Math.sin(a)*2,.25,.6,.25,.3,a,.2)}
    TQ(g,new THREE.DodecahedronGeometry(1,0),sm(0x3a2a3a,{emissive:0xff5a1a,emissiveIntensity:.5}),0,.7,0,1.1,.9,1.1);
    const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),gmat(0xffb050));m.position.set(-30,60,-20);g.add(m);tw(1600,q=>{m.position.set(-30*(1-q),60*(1-q)+.7,-20*(1-q));m.scale.setScalar(1.6-q*.6)},()=>{g.remove(m);if(d2(pl.position,V(s[0],0,s[1]))<70){shake(.5);sfx('boom')}burst(gY(V(s[0],0,s[1]),1),0xff8a3a,90,6,5,1)})}
  else if(k=='portal'){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.6,.18,10,32),gmat(0xb070ff));ring.position.y=2;g.add(ring);const d=new THREE.Mesh(new THREE.CircleGeometry(1.5,28),new THREE.MeshBasicMaterial({color:0x5a1aaa,transparent:true,opacity:.8,side:THREE.DoubleSide}));d.position.y=2;g.add(d);EVT.ring=ring}
  else{const w=new THREE.Group();TQ(w,G_BOX,sm(0x7a5230),0,.8,0,1.6,.6,2.6);TQ(w,G_BOX,sm(0xd8b44a,{metalness:.5}),0,1.2,0,1.2,.3,1.6);[-1,1].forEach(sx=>[-1,1].forEach(sz=>TQ(w,G_CYL,sm(0x3a2a1a),sx*.85,.42,sz*.9,.42,.1,.42,0,0,Math.PI/2)));
    const cv=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,2.6,12,1,true,0,Math.PI),sm(0xe8dcc0,{side:THREE.DoubleSide}));cv.rotation.x=Math.PI/2;cv.rotation.z=Math.PI/2;cv.position.y=1.15;w.add(cv);g.add(w);EVT.wagon=w;
    const a=Math.random()*6.283;EVT.dest=[s[0]+Math.cos(a)*55,s[1]+Math.sin(a)*55]}
  banner(D[0]+' '+D[1].toUpperCase(),D[2],'Follow the ★ on your minimap · 8 minutes');sfx('horn');evUI();return true;
}
function evSpawn(n,lvB,al){const k=zoneFoes(EVT.T),x0=EVT.wagon?EVT.g.position.x:EVT.x,z0=EVT.wagon?EVT.g.position.z:EVT.z;
  for(let i=0;i<n;i++){const a=i/n*6.283+Math.random()*.4,x=x0+Math.cos(a)*3.5,z=z0+Math.sin(a)*3.5;if(solid(x,z))continue;
    const e=spawnEnemy(k[R(0,k.length-1)],x,z,Math.min(MAXLV,zoneLv(x,z)+lvB),{zt:EVT.T,al:al&&i==0});e.ev=1;EVT.foes.push(e);if(EVT.k=='portal'){e.agg=1}}}
function evEnd(win){
  if(!EVT)return;const E=EVT;EVT=null;evNext=nowP()+(15+Math.random()*6)*60000;
  if(win){banner('🏆 EVENT COMPLETE',EVK[E.k][1],'Claim your reward');sfx('chime');const px=E.wagon?E.g.position.x:E.x,pz=E.wagon?E.g.position.z:E.z;
    makeChest(px,pz+(E.wagon?2:0),EVK[E.k][1]+' reward',p=>stdLoot(p,E.T,{minR:2,egg:.5,rune:.6,g:2}));if(E.k=='meteor')drop('mat',{k:'crystal',n:R(4,8)},V(px,0,pz),2)}
  else{say('⌛ The '+EVK[E.k][1]+' has ended.');E.foes.forEach(e=>{if(!e.dead)removeE(e)})}
  tw(800,k=>E.g.scale.setScalar(Math.max(.001,1-k)),()=>scene.remove(E.g));evUI();
}
function evTick(dt,now){
  if(!EVT){if(now>evNext&&!inRealm&&!inDun&&!AF&&party.length){if(!evStart())evNext=now+60000}return}
  const E=EVT,P=E.wagon?E.g.position:V(E.x,0,E.z),d=d2(pl.position,P);
  if(now>E.until)return evEnd(false);
  if(E.ring){E.ring.rotation.z+=dt*1.5}
  if(!E.spawned&&d<65){E.spawned=true;if(E.k=='meteor')evSpawn(5,1,true);else if(E.k=='caravan')evSpawn(4,1,true);else{E.wave=1;evSpawn(4,1,false);say('🌀 Wave 1 of 3 pours out of the rift!')}}
  if(!E.spawned)return;
  if(E.k=='caravan'){const alive=E.foes.filter(e=>!e.dead);const busy=alive.some(e=>e.agg);if(!busy&&alive.length){const dx=E.dest[0]-P.x,dz=E.dest[1]-P.z,L=Math.hypot(dx,dz);if(L>1){const sx=P.x+dx/L*dt*1.3,sz=P.z+dz/L*dt*1.3;if(!solid(sx,sz)){P.x=sx;P.z=sz;P.y=GH(sx,sz);E.wagon.rotation.y=Math.atan2(dx,dz)}}}
    alive.forEach((e,i)=>{const a=i/alive.length*6.283;e.hx=P.x+Math.cos(a)*2.5;e.hz=P.z+Math.sin(a)*2.5})}
  if(E.foes.length&&E.foes.every(e=>e.dead||!enemies.includes(e))){
    const allDead=E.foes.every(e=>e.dead);
    if(!allDead){E.foes=E.foes.filter(e=>!e.dead&&enemies.includes(e));E.spawned=false;return}
    if(E.k=='portal'&&E.wave<3){E.wave++;E.foes=[];evSpawn(4+E.wave,1+E.wave,E.wave==3);say('🌀 Wave '+E.wave+' of 3!');sfx('horn');return}
    evEnd(true)}
}
function evUI(){let d=$('evtk');if(!d){d=document.createElement('div');d.id='evtk';d.className='glass';$('stage').appendChild(d)}
  if(!EVT){d.classList.add('hide');return}d.classList.remove('hide');const E=EVT,P=E.wagon?E.g.position:{x:E.x,z:E.z},dx=P.x-pl.position.x,dz=P.z-pl.position.z,L=Math.hypot(dx,dz),left=Math.max(0,E.until-nowP());
  const dir=['E','SE','S','SW','W','NW','N','NE'][((Math.round(Math.atan2(dz,dx)/(Math.PI/4))%8)+8)%8];
  const alive=E.foes.filter(e=>!e.dead).length;
  d.innerHTML=`<b>${EVK[E.k][0]} ${EVK[E.k][1]}</b><span>${L<12?'You’re here!':Math.round(L)+'m '+dir}${E.spawned?' · '+(E.k=='portal'?'wave '+E.wave+'/3 · ':'')+alive+' left':''}</span><small>⏳ ${Math.floor(left/60000)}:${String(Math.floor(left/1000)%60).padStart(2,'0')}</small>`}

// =============== 8. FISHING ===============
const FISH=[
 ['Sunfish','🐟',1,0],['Mud Carp','🐟',1,0],['Silver Minnow','🐟',1,0],['Speckled Trout','🐠',1,1],['Golden Perch','🐠',2,1],['Frost Pike','🐡',2,1],
 ['Ember Eel','🐍',3,1],['Ghost Koi','🎏',3,2],['Bone Gar','🦴',4,2],['Lantern Fish','🏮',4,2],['Storm Marlin','⚡',5,2],['Ancient Koi','✨',1,3]];
const fishLog={};let fishing=null;
function nearWater(){const px=Math.round(pl.position.x),pz=Math.round(pl.position.z);for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const t=MAP[pz+j]&&MAP[pz+j][px+i];if(t=='~'){const b=BIOMES[MAP.bio[pz+j][px+i]];if(!b.lava)return [px+i,pz+j]}}return null}
function fishStart(w){
  if(fishing||riding)return;const ui=fishUI();fishing={w,ph:'wait',t:R(25,55)/10,bob:null};
  const b=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),sm(0xff4a3a));b.position.set(w[0],GH(w[0],w[1])+.05,w[1]);scene.add(b);fishing.bob=b;
  face(V(w[0]-pl.position.x,0,w[1]-pl.position.z).normalize());ui.classList.remove('hide');ui.dataset.ph='wait';$('fsT').textContent='Waiting for a bite...';$('fsBar').classList.add('hide');sfx('arrow');
}
function fishEnd(msg){if(!fishing)return;scene.remove(fishing.bob);fishing=null;$('fishui').classList.add('hide');if(msg)say(msg)}
function fishPick(){const T=tierAt(pl.position.x,pl.position.z),pool=FISH.filter(f=>f[2]<=T),w=pool.map(f=>[8,3,1,.15][f[3]]*(f[2]==T?1.5:1));let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<pool.length;i++){r-=w[i];if(r<0)return pool[i]}return pool[0]}
function fishTick(dt){
  const F=fishing;if(!F)return;
  if(d2(pl.position,V(F.w[0],0,F.w[1]))>4.5)return fishEnd('You walked away from the water.');
  F.t-=dt;const b=F.bob;
  if(F.ph=='wait'){b.position.y=GH(F.w[0],F.w[1])+.05+Math.sin(nowP()/300)*.03;if(F.t<=0){F.ph='bite';F.t=1.1;F.fish=fishPick();$('fsT').textContent='❗ A bite! Press F / tap now!';$('fishui').dataset.ph='bite';sfx('chime');burst(b.position,0xbfe8ff,10,1,1,.4)}}
  else if(F.ph=='bite'){b.position.y=GH(F.w[0],F.w[1])-.08+Math.sin(nowP()/50)*.06;if(F.t<=0)fishEnd('The fish got away. Try again!')}
  else if(F.ph=='reel'){
    const diff=[.7,1,1.35,1.8][F.fish[3]];F.ft-=dt;if(F.ft<=0){F.ft=R(4,10)/10/diff;F.tg=Math.random()}
    F.fy+=(F.tg-F.fy)*Math.min(1,dt*2.2*diff);
    F.zv+=(F.hold?2.6:-2.2)*dt;F.zv*=.92;F.zy=Math.max(0,Math.min(1-F.zh,F.zy+F.zv*dt));if(F.zy<=0||F.zy>=1-F.zh)F.zv*=-.3;
    const inZ=F.fy>=F.zy&&F.fy<=F.zy+F.zh;F.prog=Math.max(0,Math.min(1,F.prog+(inZ?.32:-.22)*dt));
    $('fsFish').style.bottom=(F.fy*92)+'%';$('fsZone').style.bottom=(F.zy*100)+'%';$('fsZone').style.height=(F.zh*100)+'%';$('fsProg').style.height=(F.prog*100)+'%';$('fsZone').classList.toggle('on',inZ);
    if(F.prog>=1)fishCatch();else if(F.prog<=0&&F.t<-1)fishEnd('The line snapped... the fish escaped.')}
}
function fishPress(down){const F=fishing;if(!F)return;
  if(F.ph=='bite'&&down){F.ph='reel';F.t=0;F.fy=.5;F.tg=.5;F.ft=0;F.zy=.35;F.zv=0;F.zh=[.34,.28,.22,.17][F.fish[3]];F.prog=.3;F.hold=true;$('fishui').dataset.ph='reel';$('fsT').textContent='Hold F / press to keep the fish in the green zone!';$('fsBar').classList.remove('hide');return}
  if(F.ph=='reel')F.hold=down}
function fishCatch(){const f=fishing.fish,T=tierAt(pl.position.x,pl.position.z),p=pl.position.clone();fishLog[f[0]]=(fishLog[f[0]]||0)+1;const first=fishLog[f[0]]==1;
  giveS('fish',f[3]+1);const g=[3,8,20,120][f[3]]*T;gold+=g;
  pickup({ic:f[1],t:'Caught a '+f[0]+'!',col:['#a8a8a8','#5fcf6a','#5a96ff','#ff9a2a'][f[3]],sub:'+'+(f[3]+1)+' Fish · +'+g+' gold'+(first?' · New in your Bestiary!':''),r:f[3]+1});sfx('chime');
  if(Math.random()<(f[3]>=2?.08:.012)){const eg=rollEgg(T);drop('egg',eg,p,eg.tier)}if(f[3]>=2&&Math.random()<.35)drop('sup',{k:RUNEK[R(0,RUNEK.length-1)],n:1},p,2);
  fishEnd();hud()}
function fishUI(){let d=$('fishui');if(d)return d;d=document.createElement('div');d.id='fishui';d.className='glass hide';
  d.innerHTML='<div id="fsT">Waiting for a bite...</div><div id="fsBar" class="hide"><div class="fsTrack"><i id="fsZone"></i><b id="fsFish">🐟</b></div><div class="fsProgT"><i id="fsProg"></i></div></div><div class="fsBtns"><button id="fsHold" class="pri">🎣 Reel</button><button id="fsQuit">Stop</button></div>';
  $('stage').appendChild(d);const hb=$('fsHold');
  hb.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fishPress(true)});['pointerup','pointerleave','pointercancel'].forEach(ev=>hb.addEventListener(ev,()=>fishPress(false)));
  $('fsQuit').onclick=()=>fishEnd('You reel in your line.');return d}
addEventListener('keydown',e=>{if(!fishing)return;const k=e.key.toLowerCase();if(k=='f'||k==' '){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)fishPress(true)}else if(k=='escape'){fishEnd('You reel in your line.')}},true);
addEventListener('keyup',e=>{if(!fishing)return;const k=e.key.toLowerCase();if(k=='f'||k==' '){e.stopImmediatePropagation();fishPress(false)}},true);

// =============== 9. GEAR SETS & LEGENDARIES ===============
const SETS={
 storm:{n:'Stormcaller',i:'⚡',b2:['+8% attack speed',{as:.08}],b4:['Basic attacks have a 15% chance to call lightning on the target',{setStorm:1}]},
 bulwark:{n:'Bulwark',i:'🛡️',b2:['+10% damage reduction',{dr:.1}],b4:['+40% thorns and +1% health regeneration per second',{thorns:.4,regen:.01}]},
 blood:{n:'Bloodmoon',i:'🩸',b2:['+5% lifesteal',{ls:.05}],b4:['+25% damage while below half health',{berserk:.25}]},
 beast:{n:'Beastmaster',i:'🐾',b2:['+15% companion damage',{compP:.15}],b4:['Team-up meter fills 50% faster and empower is 20% stronger',{setBeast:1,empP:.2}]},
 arcane:{n:'Arcanist',i:'🔮',b2:['+12% skill damage',{skillP:.12}],b4:['−15% cooldowns and your class resource builds 30% faster',{cdr:.15,setArc:1}]},
 shadow:{n:'Nightshade',i:'🌑',b2:['+6% critical chance',{crit:.06}],b4:['+40% critical damage and +30% damage on your first hit',{cdm:.4,first:.3}]}};
const SETK=Object.keys(SETS);
const LP={
 split:{n:'Splitting Fireball',cls:'mage',d:'Fireball splits into three fireballs.'},
 storm:{n:'Stormheart',cls:null,d:'12% of your hits zap two nearby enemies with lightning.'},
 echo:{n:'Echoing Cleave',cls:'warrior',d:'Cleave strikes a second time a moment later.'},
 nova:{n:'Radiant Nova',cls:'paladin',d:'Divine Barrier and Lay on Hands blast nearby enemies with holy light.'},
 venom:{n:'Venom Rush',cls:'assassin',d:'Shadow Rush leaves a deadly poison on everything it cuts.'},
 splinter:{n:'Splinter Shot',cls:'ranger',d:'Piercing Arrow splits into three arrows.'},
 phoenix:{n:'Phoenix Heart',cls:null,d:'Once every 3 minutes, survive a killing blow with 30% health.'},
 hunger:{n:'Bottomless Hunger',cls:null,d:'Kills restore 5% of your max health.'}};
function genItem(l,o){const it=genItem_base(l,o);
  if(it.r>=4){const tp=ITPL[it.tp],c=tp.cls||(tp.arm?ARMC[tp.arm][0]:null),pool=Object.keys(LP).filter(k=>!LP[k].cls||(tp.sl=='weapon'&&LP[k].cls==c));const own=pool.filter(k=>LP[k].cls);it.lp=(own.length&&Math.random()<.6?own:pool)[R(0,(own.length&&Math.random()<.6?own:pool).length-1)]}
  else if(it.r>=2&&Math.random()<.2)it.set=SETK[R(0,SETK.length-1)];
  return it}
const eqItems=()=>SLOTS.map(k=>eq[k]).filter(it=>it&&canUse(it));
const lpHas=k=>eqItems().some(it=>it.lp==k);
function setCount(k){return eqItems().filter(it=>it.set==k).length}
function gearX(s){SETK.forEach(k=>{const n=setCount(k),S=SETS[k];const add=o=>{for(const q in o)s[q]=(s[q]||0)+o[q]};if(n>=2)add(S.b2[1]);if(n>=4)add(S.b4[1])});if(lpHas('hunger'))s.killheal=(s.killheal||0)+.05}
function idHTML(){let h=idHTML_base();const it=selI&&(selI.k=='e'?SLOTS.map(k=>eq[k]).find(x=>x&&x.id==selI.id):gear.find(x=>x.id==selI.id));if(!it)return h;
  if(it.lp){const L=LP[it.lp];h+=`<div class="lpbox"><b>★ Legendary power: ${L.n}</b><span>${L.d}</span></div>`}
  if(it.set){const S=SETS[it.set],n=setCount(it.set);h+=`<div class="setbox"><b>${S.i} ${S.n} set (${n}/4 equipped)</b><span class="${n>=2?'on':''}">(2) ${S.b2[0]}</span><span class="${n>=4?'on':''}">(4) ${S.b4[0]}</span></div>`}
  return h}
function lpCast(sk){if(!sk)return;const P=pl.position,d=aimDir(),mt=sk.mt||CLS[hero.cls].mt,raw=atkOf(mt)*(sk.m||1)*(1+HS().skillP);
  const rot=(v,a)=>V(v.x*Math.cos(a)-v.z*Math.sin(a),0,v.x*Math.sin(a)+v.z*Math.cos(a));
  if(sk.n=='Fireball'&&lpHas('split'))[-.3,.3].forEach(a=>launch(P,rot(d,a),16,{col:sk.col,mt:'m',big:1,fx:{burn:4}},raw*.6,1.0));
  if(sk.n=='Piercing Arrow'&&lpHas('splinter'))[-.22,.22].forEach(a=>launch(P,rot(d,a),26,{col:sk.col,arrow:1,mt:'p',pierce:6},raw*.6,.6));
  if(sk.n=='Cleave'&&lpHas('echo'))setTimeout(()=>{area(pl.position,(sk.r||3.2),raw*.65,{col:sk.col,mt:'p'},aimDir(),1.1);burst(gY(pl.position,1),sk.col,30,3,2,.5);sfx('slash')},320);
  if((sk.n=='Divine Barrier'||sk.n=='Lay on Hands')&&lpHas('nova')){ring(P,0xffe08a,4.5,400);burst(gY(P,1),0xffe08a,60,4.5,3,.6);area(P,4.5,atkOf('p')*2.4,{col:0xffe08a,mt:'p'},null,0);sfx('boom',.6)}
}
function down(){
  if(lpHas('phoenix')&&nowP()-(hero.phT||-1e9)>180000){hero.phT=nowP();hero.hp=heroMax()*.3;hero.iv=Math.max(hero.iv||0,1.2);popT(pl.position,'🔥 PHOENIX HEART','#fb923c',true);flash('rgba(251,146,60,.4)');burst(gY(pl.position,1),0xff8a3a,80,4,4,.9);sfx('power');hud();return}
  if(riding)dismount();arenaFail();if(inDun){say('You were overwhelmed in the dungeon.');dunExit(false)}return down_base()}

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
function runeTick(dt){if(dt<=0)return;party.slice(0,2).forEach(c=>{if(!c||!c.cdm||!runeOf(c).some(q=>q.swift))return;for(const k in c.cdm)c.cdm[k]=Math.max(0,c.cdm[k]-dt*.43)})}
function runeHTML(c){const slots=c.runes||[],own=RUNEK.filter(k=>cnt(k)>0);
  let h=`<div class="sec">Runes (${slots.length}/2)</div><div class="runeS">`+[0,1].map(i=>{const k=slots[i];return k?`<button data-runrm="${i}" title="Remove (returns the rune)">${RUNES[k][1]} <b>${RUNES[k][0]}</b><small>${RUNES[k][2]}</small></button>`:`<div class="rempty">Empty rune slot</div>`}).join('')+'</div>';
  if(slots.length<2)h+=own.length?`<div class="runeL">`+own.map(k=>`<button data-runadd="${k}">${RUNES[k][1]} ${RUNES[k][0]} ×${cnt(k)}</button>`).join('')+'</div>':'<div class="mut dtl">No runes. Find them on elites, bosses, chests, events and rare fish, or buy them from the Rune Sage in your Realm.</div>';
  return h}
$('cd').addEventListener('click',e=>{const a=e.target.closest('[data-runadd],[data-runrm]');if(!a)return;const c=party[cmpSel];if(!c)return;c.runes=c.runes||[];
  if(a.dataset.runadd){const k=a.dataset.runadd;if(c.runes.length>=2||!(cnt(k)>0))return;sup[k]--;c.runes.push(k);say(RUNES[k][1]+' '+RUNES[k][0]+' socketed into '+c.n+'.');sfx('chime')}
  else{const k=c.runes.splice(+a.dataset.runrm,1)[0];if(k)giveS(k,1)}
  hsDirty();c.h=Math.min(c.h,M(c));rC();ui();hud()});

// =============== 12. REALM VISITORS ===============
const VIS=[{k:'merchant',n:'Wandering Merchant',cz:15,robe:0x7a4a2a,hat:'cap',hatC:0x3a6a3a,off:0},{k:'trainer',n:'Beast Trainer',cz:35,robe:0x3a5a2a,hat:'cap',hatC:0x6a4a1a,off:5},{k:'bard',n:'Traveling Bard',cz:55,robe:0x8a2a5a,hat:'wiz',hatC:0x5a1a3a,off:10},{k:'sage',n:'Rune Sage',cz:75,robe:0x2a3a7a,hat:'wiz',hatC:0x1a2a5a,off:15}];
const visState={};let visShown=new Set(),visSay=0;
function visHere(v){const cz=typeof cozyScore=='function'?cozyScore():0;if(cz<v.cz)return false;const m=((Date.now()/60000)+v.off)%20;return m<13}
function visBuild(v,i){const g=new THREE.Group();const x=PORTAL[0]-6+i*4,z=PORTAL[1]-5;const prev=T_cur;T_cur={col:[],cx:0,cy:0};g.position.set(0,0,0);npc(g,x,z,{robe:v.robe,trim:0xd8b44a,hat:v.hat,hatC:v.hatC,label:v.n,ry:Math.PI});T_cur=prev;scene.add(g);v.g=g;v.x=x;v.z=z;
  const s=new THREE.Mesh(new THREE.CircleGeometry(1,20),new THREE.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:.25,depthWrite:false}));s.rotation.x=-Math.PI/2;s.position.set(x,.06,z);g.add(s)}
function visTick(){VIS.forEach((v,i)=>{const on=inRealm&&visHere(v);if(on&&!v.g)visBuild(v,i);if(v.g){v.g.visible=on;if(on){const y=groundAt(v.x,v.z,10);v.g.position.y=y==null?0:y}}});
  if(inRealm&&nowP()-visSay>3000){visSay=nowP();VIS.forEach(v=>{if(visHere(v)&&!visShown.has(v.k)){visShown.add(v.k);say('🏡 A '+v.n+' is visiting your Realm!')}})}}
function visitorPrompt(){if(!inRealm)return null;for(const v of VIS){if(v.g&&v.g.visible&&Math.hypot(pl.position.x-v.x,pl.position.z-v.z)<2.4)return {label:'F · Talk to '+v.n,fn:()=>openX('visitor',v.k)}}return null}
function visStock(){const d=Math.floor(Date.now()/(20*60000));if(visState.day!==d){visState.day=d;visState.bard=0;const cr=Object.keys(CROPS).filter(k=>CROPS[k].tr>=2);visState.stock=[
  {k:'seed',c:cr.length?cr[R(0,cr.length-1)]:'wheat',n:3,p:180},{k:'pots',n:3,p:120},{k:'map',p:300},{k:'rune',r:RUNEK[R(0,RUNEK.length-1)],p:450}]}return visState.stock}
XR.visitor=()=>{const v=VIS.find(q=>q.k==xwArg);if(!v)return;$('xwT').textContent=(v.hat=='wiz'?'🧙 ':'🧑 ')+v.n;$('xwS').textContent='Visiting your Realm · 🪙 '+gold;let b='';
  if(v.k=='merchant'){b='<div class="rows">'+visStock().map((s,i)=>{const lab=s.k=='seed'?SUP['s_'+s.c].i+' '+s.n+'× '+SUP['s_'+s.c].n:s.k=='pots'?'🧪 3× Health Potion':s.k=='map'?'🗺️ Treasure Map':RUNES[s.r][1]+' '+RUNES[s.r][0];return `<div class="rw"><span class="rn"><b>${lab}</b></span><span class="ra"><button class="pri" data-vbuy="${i}" ${gold<s.p||s.sold?'disabled':''}>${s.sold?'Sold':'🪙 '+s.p}</button></span></div>`}).join('')+'</div>'}
  else if(v.k=='trainer'){b='<div class="mut dtl" style="margin-bottom:6px">A training session grants a companion one level (up to your own level).</div><div class="rows">'+party.slice(0,6).map((c,i)=>{const cost=40+c.l*35,ok=c.l<hero.lvl&&c.l<MAXLV;return `<div class="rw"><span class="rn">${em(c)} <b>${c.n}</b> Lv ${c.l}</span><span class="ra"><button class="pri" data-vtrain="${i}" ${!ok||gold<cost?'disabled':''}>${ok?'Train · 🪙 '+cost:'Max level'}</button></span></div>`}).join('')+'</div>'}
  else if(v.k=='bard'){const done=visState.bard;b=`<p class="lore">"Gather round, hero! A song of the old Sovereigns, the first hatchings, and the long road ahead..."</p><button class="pri" data-vsong="1" ${done?'disabled':''}>${done?'You’re still humming the tune':'🎵 Listen to a song (free)'}</button><div class="mut dtl" style="margin-top:6px">Grants Inspired for 20 minutes: +10% XP and +5% to all stats. Once per visit.</div>`}
  else{b='<div class="rows">'+RUNEK.map(k=>`<div class="rw"><span class="rn">${RUNES[k][1]} <b>${RUNES[k][0]}</b><small>${RUNES[k][2]} · you have ${cnt(k)}</small></span><span class="ra"><button class="pri" data-vrune="${k}" ${gold<500?'disabled':''}>🪙 500</button></span></div>`).join('')+'</div>'}
  $('xwB').innerHTML=b;$('xwF').innerHTML='<span class="mut dtl">Visitors come and go. More arrive as your Realm grows cozier (Coziness 15 / 35 / 55 / 75).</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='visitor')return;const t=e.target.closest('[data-vbuy],[data-vtrain],[data-vsong],[data-vrune]');if(!t||t.disabled)return;const ds=t.dataset;
  if(ds.vbuy!=null){const s=visStock()[+ds.vbuy];if(!s||s.sold||gold<s.p)return;gold-=s.p;s.sold=1;if(s.k=='seed')giveS('s_'+s.c,s.n);else if(s.k=='pots')pots+=3;else if(s.k=='map')giveMap(pl.position.x<W?pl.position:V(TOWNS[0].cx,0,TOWNS[0].cy));else giveS(s.r,1);say('🛍️ Bought.')}
  if(ds.vtrain!=null){const c=party[+ds.vtrain],cost=40+c.l*35;if(gold<cost||c.l>=hero.lvl)return;gold-=cost;c.l++;c.x=0;c.h=M(c);say('💪 '+c.n+' trained hard and reached Lv '+c.l+'!');sfx('power')}
  if(ds.vsong){visState.bard=1;hero.buffs=hero.buffs.filter(b=>b.n!='Inspired');hero.buffs.push({n:'Inspired',i:'🎵',s:{xp:.1,hpP:.05,paP:.05,maP:.05,pdP:.05,mdP:.05},t:nowP()+20*60000,food:1,d:'+10% XP, +5% all stats'});hsDirty();say('🎵 The bard’s song fills you with courage. Inspired for 20 minutes!');sfx('chime')}
  if(ds.vrune){if(gold<500)return;gold-=500;giveS(ds.vrune,1);say('🔮 Bought a '+RUNES[ds.vrune][0]+'.')}
  hud();ui();rX()});

// =============== 15. BESTIARY ===============
const dex={own:new Set(),egg:new Set(),claim:new Set()};let dexTab='cre';
const DEXM=[[5,'🪙 500 gold',()=>{gold+=500}],[10,'🔮 A random rune',()=>giveS(RUNEK[R(0,RUNEK.length-1)],1)],[18,'🥚 A tier-2 egg',()=>eggs.push(rollEgg(2))],[26,'📖 Scholar I: +3% XP & loot (permanent)',()=>permBuff('Scholar I',{xp:.03,loot:.03})],
 [35,'🔮🔮 Two runes',()=>{giveS(RUNEK[R(0,RUNEK.length-1)],1);giveS(RUNEK[R(0,RUNEK.length-1)],1)}],[45,'🥚 A tier-4 egg',()=>eggs.push(rollEgg(4))],[55,'📖 Scholar II: +5% XP & loot (permanent)',()=>permBuff('Scholar II',{xp:.05,loot:.05})],[70,'👑 Master Tamer: +5% all stats (permanent)',()=>permBuff('Master Tamer',{hpP:.05,paP:.05,maP:.05,pdP:.05,mdP:.05})]];
function permBuff(n,s){hero.buffs.push({n,i:'📖',s,t:Infinity,perm:1,d:n});hsDirty()}
function dexScan(){party.forEach(c=>c&&c.g&&dex.own.add(c.g[0]));eggs.forEach(e=>e&&e.sp&&dex.egg.add(e.sp))}
function dexPoints(){const enK=Object.keys(EN).filter(k=>!k.startsWith('boss'));return {cre:dex.own.size,en:enK.filter(k=>(kills[k]||0)>=25).length,boss:bossDone.size*2,fish:Object.keys(fishLog).length,lore:loreRead.size}}
const dexTotal=()=>{const p=dexPoints();return p.cre+p.en+p.boss+p.fish+p.lore};
XR.dex=()=>{dexScan();const p=dexPoints(),tot=dexTotal();$('xwT').textContent='📖 Bestiary';$('xwS').textContent=tot+' discovery points · creatures '+p.cre+'/'+SPK.length+' · enemies '+p.en+' · bosses '+bossDone.size+'/10 · fish '+p.fish+'/'+FISH.length+' · lore '+p.lore+'/'+LORE.length;
  const tabs=[['cre','🐾 Creatures'],['en','💀 Enemies'],['boss','👑 Sovereigns'],['fish','🎣 Fish'],['lore','📜 Lore'],['rew','🎁 Rewards']];
  let b='<div class="dexT">'+tabs.map(t=>`<button data-dext="${t[0]}" class="${dexTab==t[0]?'on':''}">${t[1]}</button>`).join('')+'</div>';
  if(dexTab=='cre')b+='<div class="dexG">'+SPK.map(n=>{const q=SP2[n],own=dex.own.has(n),seen=own||dex.egg.has(n);return `<div class="dexC ${own?'own':seen?'seen':''}"><span>${seen?q[3]:'❔'}</span><b>${seen?n:'???'}</b><small>${q[0]} · T${q[1]}${own?' · ✔ tamed':seen?' · egg seen':''}</small></div>`}).join('')+'</div>';
  else if(dexTab=='en')b+='<div class="rows">'+Object.keys(EN).filter(k=>!k.startsWith('boss')).map(k=>{const n=kills[k]||0,E=EN[k];return `<div class="rw" style="--rc:${n>=100?'#fbbf24':n>=25?'#6ee7b7':'transparent'}"><span class="rn">${n?E.e:'❔'} <b>${n?E.n:'Unknown enemy'}</b><small>${n} defeated${n>=25?' · ✔ studied':' · '+Math.max(0,25-n)+' more to study'}${n>=100?' · ★ mastered':''}</small></span></div>`}).join('')+'</div>';
  else if(dexTab=='boss')b+='<div class="rows">'+BOSSES.map((B,i)=>`<div class="rw" style="--rc:${bossDone.has(i)?'#6ee7b7':'transparent'}"><span class="rn">${bossDone.has(i)?B.i:'❔'} <b>${bossDone.has(i)?B.name:'Undefeated Sovereign'}</b><small>${ZN[B.zone-1]} · Lv ${B.lvl}${bossDone.has(i)?' · ✔ defeated':''}</small></span></div>`).join('')+'</div>';
  else if(dexTab=='fish')b+='<div class="dexG">'+FISH.map(f=>{const n=fishLog[f[0]]||0;return `<div class="dexC ${n?'own':''}"><span>${n?f[1]:'❔'}</span><b>${n?f[0]:'???'}</b><small>${['Common','Uncommon','Rare','Legendary'][f[3]]} · ${ZN[f[2]-1]}${n?' · caught '+n:''}</small></div>`}).join('')+'</div>';
  else if(dexTab=='lore')b+='<div class="rows">'+LORE.map((L,i)=>`<div class="rw"><span class="rn">${loreRead.has(i)?'📜':'❔'} <b>${loreRead.has(i)?L[0]:'Undiscovered lore'}</b><small>${loreRead.has(i)?L[1]:ZN[Math.floor(i/3)]+' · find the glowing blue stone'}</small></span></div>`).join('')+'</div>';
  else b+='<div class="rows">'+DEXM.map((m,i)=>{const got=dex.claim.has(i),ok=tot>=m[0];return `<div class="rw" style="--rc:${got?'#6ee7b7':ok?'#c9a24a':'transparent'}"><span class="rn"><b>${m[0]} points</b><small>${m[1]}</small></span><span class="ra">${got?'<em style="color:#6ee7b7">✔ Claimed</em>':`<button class="pri" data-dexc="${i}" ${ok?'':'disabled'}>${ok?'Claim':tot+'/'+m[0]}</button>`}</span></div>`}).join('')+'</div>';
  $('xwB').innerHTML=b;$('xwF').innerHTML='<span class="mut dtl">Earn points by taming species, studying enemies (25 defeats), defeating Sovereigns (2 each), catching fish and reading lore stones.</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='dex')return;const t=e.target.closest('[data-dext],[data-dexc]');if(!t||t.disabled)return;if(t.dataset.dext)dexTab=t.dataset.dext;else{const i=+t.dataset.dexc,m=DEXM[i];if(dex.claim.has(i)||dexTotal()<m[0])return;dex.claim.add(i);m[2]();say('🎁 Bestiary reward: '+m[1]);sfx('chime');hud();ui()}rX()});
{const b=document.createElement('button');b.id='dexBtn';b.innerHTML='📖 Bestiary <kbd>L</kbd>';$('sysmenu').appendChild(b);b.onclick=()=>{$('sysmenu').classList.add('hide');openX('dex')}}
addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||fishing)return;const k=e.key.toLowerCase();if(k!='l'||building||document.activeElement.tagName=='INPUT')return;if(!$('xw').classList.contains('hide')&&xwMode=='dex'){closeX();return}if(!uiOpen())openX('dex')});

// =============== shared: prompts, ticks, kills, map markers, saving ===============
function worldPrompt(){
  if(fishing)return null;const P=pl.position;
  for(const c of CHESTS)if(Math.hypot(P.x-c.x,P.z-c.z)<2.2)return {label:'F · Open '+c.label,fn:()=>openChest(c)};
  for(const S of SECRETS)if(S.k=='lore'&&S.g&&Math.hypot(P.x-S.x,P.z-S.z)<2.2)return {label:'F · Read the lore stone',fn:()=>readLore(S)};
  for(const m of tmaps)if(Math.hypot(P.x-m.x,P.z-m.z)<2)return {label:'F · Dig for treasure',fn:()=>digTreasure(m)};
  for(const S of SECRETS)if(S.k=='boulder'&&!S.broken&&S.g&&Math.hypot(P.x-S.x,P.z-S.z)<2.6)return {label:'Attack the cracked boulder to break it',fn:()=>say('Hit it with an attack or skill to break it open.')};
  const w=!riding&&nearWater();if(w)return {label:'F · Fish',fn:()=>fishStart(w)};
  return null}
// break boulders with attacks: extend the box-breaking hook
const _brkNear=brkNear;brkNear=function(p,r,dir,half){_brkNear(p,r,dir,half);SECRETS.forEach(S=>{if(S.k=='boulder'&&!S.broken&&S.g&&Math.hypot(S.x-p.x,S.z-p.z)<r+1.4){S.hits=(S.hits||0)+1;burst(gY(V(S.x,0,S.z),1),0x8a8478,12,2,2,.4);sfx('blunt',.6);if(S.hits>=3)breakBoulder(S);else dn(V(S.x,0,S.z),'Crack!','#e7e5e4',-20,600)}})};
function onKillX(e){
  if(!e)return;const p=e.m.position;
  if(e.ar!=null){drop('sup',{k:RUNEK[R(0,RUNEK.length-1)],n:1},p,3);if(Math.random()<.35){const it=genItem(e.c.l,{minR:Math.random()<.3?4:3,cls:hero.cls});drop('gear',it,p,it.r)}return}
  if(e.boss)return;
  if(e.c.al&&Math.random()<.05)drop('sup',{k:RUNEK[R(0,RUNEK.length-1)],n:1},p,2);
  if(e.c.al&&Math.random()<.04)giveMap(p);
}
let wTick=0;
function worldTick(dt,now){
  fishTick(dt);runeTick(dt);
  if(now-wTick<250)return;wTick=now;
  if(!inRealm&&!inDun)SECRETS.forEach(S=>{const d=Math.hypot(S.x-pl.position.x,S.z-pl.position.z);if(d<95&&!S.g&&!(S.k=='boulder'&&S.broken))buildSecret(S);if(S.g)S.g.visible=d<100});
  evTick(.25,now);if(EVT)evUI();visTick();dexScan();
}
// Stormheart legendary: some hits zap nearby enemies
{const _hh=heroHit;heroHit=function(e,raw,mt,o){const d=_hh(e,raw,mt,o);if(d&&e&&lpHas('storm')&&Math.random()<.12){let n=0;enemies.forEach(q=>{if(n>=2||q.dead||q===e||d2(q.m.position,e.m.position)>5)return;n++;zapLine(e.m.position,q.m.position);heroHit_base(q,raw*.5,heroMt(),{proc:false,s:{col:0xfff06a}})})}
  if(d&&e&&!e.dead&&o&&o.s&&o.s.basic&&HS().setStorm&&Math.random()<.15){zapLine(V(e.m.position.x,6,e.m.position.z),e.m.position);heroHit_base(e,raw*.8,'m',{proc:false,s:{col:0xfff06a}});applyEl(e,'shock',raw,'h')}
  return d}}
// set bonuses that tweak the combat systems
{const _tg=teamGain;teamGain=function(v){return _tg(HS().setBeast?v*1.5:v)};const _rg=resGain;resGain=function(v){return _rg(HS().setArc?v*1.3:v)}}
function miniMarks(w,h,vw,vh,cx,cy){const P=(x,z)=>[(x-(cx-vw/2)+.5)*w/vw,(z-(cy-vh/2)+.5)*h/vh],inV=(x,y)=>x>-6&&y>-6&&x<w+6&&y<h+6;
  const star=(x,y,c)=>{mmX.fillStyle=c;mmX.beginPath();for(let i=0;i<10;i++){const r=i%2?2.6:6,a=i*Math.PI/5-Math.PI/2;mmX.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}mmX.closePath();mmX.fill();mmX.strokeStyle='#000';mmX.lineWidth=1;mmX.stroke()};
  if(EVT){const p=EVT.wagon?EVT.g.position:{x:EVT.x,z:EVT.z};let [x,y]=P(p.x,p.z);if(!inV(x,y)){const a=Math.atan2(y-h/2,x-w/2);x=w/2+Math.cos(a)*(w/2-8);y=h/2+Math.sin(a)*(h/2-8)}star(x,y,'#fbbf24')}
  tmaps.forEach(m=>{const [x,y]=P(m.x,m.z);if(!inV(x,y))return;mmX.strokeStyle='#ef4444';mmX.lineWidth=2.5;mmX.beginPath();mmX.moveTo(x-4,y-4);mmX.lineTo(x+4,y+4);mmX.moveTo(x+4,y-4);mmX.lineTo(x-4,y+4);mmX.stroke()});
  CHESTS.forEach(c=>{const [x,y]=P(c.x,c.z);if(inV(x,y)){mmX.fillStyle='#fbbf24';mmX.fillRect(x-2.5,y-2.5,5,5)}});
  SECRETS.forEach(S=>{if(S.k!='lore'||!S.g||loreRead.has(S.li))return;const [x,y]=P(S.x,S.z);if(inV(x,y)){mmX.fillStyle='#8ad8ff';mmX.fillRect(x-2,y-2,4,4)}})}
function wmExtra(g,P){if(EVT){const p=EVT.wagon?EVT.g.position:{x:EVT.x,z:EVT.z},[x,y]=P(p.x,p.z);g.font='700 18px system-ui';g.fillStyle='#fbbf24';g.fillText('★',x,y)}
  tmaps.forEach(m=>{const [x,y]=P(m.x,m.z);g.font='800 16px system-ui';g.fillStyle='#ef4444';g.fillText('✕',x,y)})}
function x2Save(){return {own:[...dex.own],egg:[...dex.egg],claim:[...dex.claim],sec:[...secOpen],lore:[...loreRead],tmaps,fish:fishLog}}
function x2Load(s){(s.own||[]).forEach(k=>dex.own.add(k));(s.egg||[]).forEach(k=>dex.egg.add(k));(s.claim||[]).forEach(k=>dex.claim.add(k));(s.lore||[]).forEach(k=>loreRead.add(k));tmaps=s.tmaps||[];Object.assign(fishLog,s.fish||{});
  (s.sec||[]).forEach(k=>{secOpen.add(k);const S=SECRETS[+String(k).slice(1)];if(S&&S.k=='boulder'){S.broken=1;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)CBLK.delete((S.z+j)*W+S.x+i)}})}
