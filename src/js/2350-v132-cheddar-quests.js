// ================= v132 Cheddar's quests =================
// Cheddar (model: 2340, chd132Model) stands beside the Duskhold portal of every field instance and every Sovereign's Den,
// with a burrow hole next to him: there is one Cheddar, and he moves through his burrows to whichever instance the hero is in
// (he climbs out of the hole when you arrive). F beside him opens his window (XR.chq132): the quests of THIS instance.
//  - Quests are per instance (CHQD132['zone_k'], k = 0..2 field I..III). Accepted quests only count while you are in their
//    instance and only show in the tracker (#chqt132) there; their progress is kept when you leave.
//  - State per quest id in CHQ132.st: {s:1 active | 2 ready to turn in | 3 done, p:[count per objective], cj:[camps cleared]}.
//    Saved as x2.chq. Old saves start with nothing accepted.
//  - Overhead marker: gold "!" while this instance has a quest not yet accepted, gold "?" while one is ready to turn in.
//  - Rewards (chqReward132): XP and gold scaled by the instance's top level, plus a weapon, a piece of armour or a zone egg.
//  - Events come from wrappers at the end of this file (kill, gFinish, fishCatch, fishTreasure, the fusion button, feedComp,
//    kqrUp/kqsBuy, breakBoulder/digTreasure, hatch, mountTick) and a 0.4 s poll for runes (they are added inline in 0420).
// Co-op: Cheddar and his quests are local to each player; a partner's kill only counts for camp clears.
var CHQ132={st:{},g:-2,ch:null,bur:null,mk:null,mkK:'',spots:{},t:0,pop:0,wave:0,near:0,rp:new WeakMap(),trkK:''};
// objective kinds: camp, allCamps (each camp of the instance once), wood, stone, glow, iron, fish, pouch, elite, empKill,
// forgeKill, foodKill, bardKill, fuse, catFuse, feed, ability, secret, hatch2, mount, rune
var CHQD132={
 '0_0':[
  {id:'k1a',t:'Smoke Them Out',d:'A camp has dug in on my best toadstool patch. Clear one out and I’ll make it worth your while.',o:[['camp',1,'Camp cleared']],rw:'weapon',w:1.2},
  {id:'k1b',t:'Timber and Stone',d:'My burrows don’t shore themselves up. Twenty wood from the groves and ten stone from the rocks.',o:[['wood',20,'Wood gathered'],['stone',10,'Stone gathered']],rw:'boots',w:1.2},
  {id:'k1c',t:'Something for the Pot',d:'Five fish from the bog water. Don’t ask what I do with them.',o:[['fish',5,'Fish caught']],rw:'egg',w:1},
  {id:'k1d',t:'Lanterns for the Dark',d:'Glow Caps light the tunnels down below. Pick me five.',o:[['glow',5,'Glow Caps picked']],rw:'helm',w:1},
  {id:'k1e',t:'Borrowed Strength',d:'Let a companion empower you, then take something down while their strength is in you.',o:[['empKill',1,'Kill while empowered']],rw:'chest',w:1}],
 '0_1':[
  {id:'k2a',t:'Bigger Game',d:'Elites stalk these hollows: bigger, meaner, and their names burn gold. Bring one down.',o:[['elite',1,'Elite slain']],rw:'weapon',w:1.5},
  {id:'k2b',t:'A Lucky Line',d:'Fish long enough and the water coughs up a gold pouch. Pull one up for me.',o:[['pouch',1,'Gold pouch fished up']],rw:'egg',w:1.3},
  {id:'k2c',t:'Ore for the Forge',d:'Ten iron ore. The veins here run rust-red through the rock.',o:[['iron',10,'Iron Ore mined']],rw:'helm',w:1.2},
  {id:'k2d',t:'Two Become One',d:'Fuse, siphon or consume a companion. Out here the strong eat the weak.',o:[['fuse',1,'Companion fused, siphoned or consumed']],rw:'egg',w:1}],
 '0_2':[
  {id:'k3a',t:'Tempered Steel',d:'Have the Blacksmith forge your weapon (+1 or better), then kill something with it.',o:[['forgeKill',1,'Kill with a forged weapon']],rw:'weapon',w:1.3},
  {id:'k3b',t:'Well Fed',d:'Feed your companions five times. A hungry beast is a disloyal one.',o:[['feed',5,'Companions fed']],rw:'egg',w:1},
  {id:'k3c',t:'Sharpen the Craft',d:'Spend your ability points: unlock an ability or raise one a rank.',o:[['ability',1,'Ability levelled up']],rw:'chest',w:1}],
 '1_0':[
  {id:'h1a',t:'Clean Sweep',d:'Every camp on this stretch of road. Clear each one at least once.',o:[['allCamps',3,'Camps cleared']],rw:'weapon',w:1.6},
  {id:'h1b',t:'Fight on a Full Stomach',d:'Eat a proper meal, then kill a monster while it still warms your belly.',o:[['foodKill',1,'Kill while buffed by food']],rw:'chest',w:1},
  {id:'h1c',t:'Under the Stone',d:'There’s a cracked boulder out on these plains with a cache beneath it. Find it.',o:[['secret',1,'Secret found']],rw:'egg',w:1.3}],
 '1_1':[
  {id:'h2a',t:'New Blood',d:'Hatch an egg of Tier 2 or higher.',o:[['hatch2',1,'Tier 2+ egg hatched']],rw:'egg',w:1.2},
  {id:'h2b',t:'Saddle Sore',d:'Ride your mount until its speed has grown five times. The road teaches it.',o:[['mount',5,'Mount speed gained']],rw:'boots',w:1.3},
  {id:'h2c',t:'Rune-Touched',d:'Socket a rune into one of your companions.',o:[['rune',1,'Rune equipped']],rw:'weapon',w:1}],
 '1_2':[
  {id:'h3a',t:'A Song for the Road',d:'Hear the Bard’s song in Duskhold, then kill a monster while you are still Inspired.',o:[['bardKill',1,'Kill while Inspired']],rw:'weapon',w:1.3},
  {id:'h3b',t:'The Catalyst',d:'Fuse or siphon a companion with a fusion catalyst.',o:[['catFuse',1,'Fusion with a catalyst']],rw:'egg',w:1.3}]
};
var CHQ132_ID={};for(const k in CHQD132)CHQD132[k].forEach(q=>{q.ik=k;CHQ132_ID[q.id]=q});
const CHQ132_SAY={
  hi:'Psst. Down here. Cheddar’s the name. I’ve walked every portal road there is, and I always need a pair of hands.',
  busy:'Still at it? The burrow will keep. So will I.',
  ready:'Ha! You actually did it. Come here, take your pay before I change my mind.',
  done:'That’s all I need from this stretch of road. I’ll be further along. I always get there first.',
  none:'Nothing for you here yet. The tunnels are still settling. Try the other roads.'};
function chqList132(I){return I&&!I.tri&&I.k<=2?(CHQD132[I.z+'_'+I.k]||[]):[]}
function chqS132(q){return CHQ132.st[q.id]||null}
function chqState132(I){const L=chqList132(I);let av=0,rd=0,ac=0,dn=0;L.forEach(q=>{const S=chqS132(q),s=S?S.s:0;if(!s)av++;else if(s==1)ac++;else if(s==2)rd++;else dn++});return {n:L.length,av,rd,ac,dn}}
function chqHere132(){try{const I=curIns();return I&&!I.tri?I:null}catch(_){return null}}

// ---------------- rewards ----------------
function chqLv132(I){return I.lv[1]}
function chqXP132(I,q){const L=chqLv132(I);return Math.max(5,Math.round((8+12*L)*.6375*(typeof ECON96!='undefined'?ECON96.xp:1)*(14+L)*(q.w||1)))}
function chqGold132(I,q){const L=chqLv132(I);return Math.max(10,Math.round((3+1.4*L)*.65*(16+L)*(q.w||1)))}
function chqRwTxt132(I,q){const it=q.rw=='egg'?'🥚 '+PMAP[I.z].n+' egg':q.rw=='weapon'?'⚔️ Weapon':q.rw=='helm'?'🪖 Helm':q.rw=='boots'?'🥾 Boots':'🛡️ Chest armour';
  return it+' · ✨ '+chqXP132(I,q)+' XP · 🪙 '+chqGold132(I,q)}
function chqGear132(I,sl){const lv=Math.max(1,Math.min(chqLv132(I),hero.lvl+2)),minR=I.k>=2?2:1;let it=null;
  for(let i=0;i<12&&!it;i++){try{const c=genItem(lv,{cls:hero.cls,sl,minR});if(c&&itT(c).sl===sl&&(sl!='weapon'||fitsCls(itT(c),hero.cls)))it=c}catch(_){}}
  if(!it)try{it=genItem(lv,{cls:hero.cls,sl,minR})}catch(_){}return it}
function chqEgg132(I){const L=zEggs104(I.z);if(!L.length)return rollEgg(Math.max(1,Math.min(5,PMAP[I.z].t||1)));const sp=L[Math.floor(Math.random()*L.length)];
  return mkEgg(sp,Math.max(0,SP2[sp][1]-1),.95+Math.random()*.15+(I.k>=2?.05:0))}
function chqGiveXP132(xp){
  if(hero.lvl<MAXLV){hero.xp+=xp;while(hero.lvl<MAXLV&&hero.xp>=needH(hero.lvl)){hero.xp-=needH(hero.lvl);heroLevelUp()}}else hero.xp=0;
  party.slice(0,2).forEach(c2=>{if(!c2||c2.l>=MAXLV)return;c2.x+=xp;while(c2.l<MAXLV&&c2.x>=needH(c2.l)){c2.x-=needH(c2.l);c2.l++;c2.h=M(c2);say(nm(c2)+' reached Lv '+c2.l+'!')}})}
function chqReward132(I,q){const xp=chqXP132(I,q),g=chqGold132(I,q);
  if(q.rw=='egg'){const eg=chqEgg132(I);if(eg)take({kind:'egg',data:eg});try{dex.egg.add(eg.sp)}catch(_){}}
  else{const it=chqGear132(I,q.rw);if(it)take({kind:'gear',data:it})}
  gold+=g;chqGiveXP132(xp);try{dn(pl.position,'+'+xp+' XP','#c4b5fd',0,1600);dn(pl.position,'+'+g+' 🪙','#fbbf24',-26,1600)}catch(_){}
  say('🐭 <b>'+q.t+'</b> turned in: +'+xp+' XP, +'+g+' gold.')}

// ---------------- progress ----------------
function chqEv132(kind,n,arg){const I=chqHere132();if(!I)return;const L=chqList132(I);if(!L.length)return;let ch=0;
  L.forEach(q=>{const S=chqS132(q);if(!S||S.s!==1)return;q.o.forEach((o,i)=>{if(o[0]!==kind)return;
      if(kind=='allCamps'){S.cj=S.cj||[];if(arg==null||S.cj.includes(arg))return;S.cj.push(arg);S.p[i]=Math.min(chqNeed132(I,o),S.cj.length)}
      else S.p[i]=Math.min(chqNeed132(I,o),(S.p[i]||0)+(n||1));ch=1});
    if(ch&&q.o.every((o,i)=>(S.p[i]||0)>=chqNeed132(I,o))){S.s=2;
      try{pickup({ic:'🐭',t:'Quest complete: '+q.t,col:'#f0cc72',sub:'Return to Cheddar by the portal',r:3})}catch(_){}
      try{sfx('chime')}catch(_){}}});
  if(ch){CHQ132.trkK='';chqTrk132()}}
function chqNeed132(I,o){return o[0]=='allCamps'?Math.max(1,(I.cl&&I.cl.length)||o[1]):o[1]}
function chqAccept132(id){const q=CHQ132_ID[id],I=chqHere132();if(!q||!I||q.ik!==I.z+'_'+I.k||chqS132(q))return;
  CHQ132.st[id]={s:1,p:q.o.map(()=>0)};say('🐭 Quest accepted: <b>'+q.t+'</b>');try{sfx('chime')}catch(_){}CHQ132.trkK=''}
function chqTurnIn132(id){const q=CHQ132_ID[id],I=chqHere132(),S=q&&chqS132(q);if(!q||!I||!S||S.s!==2||q.ik!==I.z+'_'+I.k)return;
  S.s=3;chqReward132(I,q);try{mSfx('rare')}catch(_){try{sfx('chime')}catch(__){}}CHQ132.trkK='';try{hud()}catch(_){}}

// ---------------- Cheddar's spot beside each Duskhold portal ----------------
function chqSpot132(I){if(CHQ132.spots[I.g])return CHQ132.spots[I.g];
  const r=RPORT.find(q=>q.k=='home'&&q.ig===I.g),n=I.path[26],e=I.en;let dx=n[0]-e[0],dz=n[1]-e[1];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
  const px=r?r.x:e[0]-dx*5-dz*4,pz=r?r.z:e[1]-dz*5+dx*4,sx=-dz,sz=dx;   // s: from the road towards the portal's far side
  const free=(x,z,rr)=>{for(let j=-rr;j<=rr;j++)for(let i=-rr;i<=rr;i++){const X=Math.round(x)+i,Z=Math.round(z)+j;if(X<1||Z<1||X>=W-1||Z>=H-1||solid(X,Z))return false}return true};
  // beside the portal: its far side, then its road side, then a little forward of either
  const C=[[2.7,0],[-2.7,0],[2.9,1.6],[-2.9,1.6],[3.6,-1.2],[-3.6,-1.2],[2.2,3],[-2.2,3]];let best=null;
  for(const [a,b] of C){const x=px+sx*a+dx*b,z=pz+sz*a+dz*b,o=Math.sign(a),bx=x+sx*o*1.15-dx*.55,bz=z+sz*o*1.15-dz*.55;
    if(free(x,z,1)&&free(bx,bz,0)&&Math.abs(GH(x,z)-GH(bx,bz))<.6){best={x,z,bx,bz};break}}
  if(!best){const x=px+sx*2.7,z=pz+sz*2.7;best={x,z,bx:x+sx*1.15,bz:z+sz*1.15}}
  best.face=Math.atan2(e[0]-best.x,e[1]-best.z);best.g=I.g;CHQ132.spots[I.g]=best;return best}
// a cheap collider on his tile so you don't walk through him (built once for every spot)
try{INSL.forEach(I=>{if(I.tri)return;const s=chqSpot132(I);CBLK.add(Math.round(s.z)*W+Math.round(s.x))})}catch(err){console.warn('chq132 spots',err)}

// keep the grass out of the burrow's mouth and from under his feet (grass is one virtual instanced list, VIL, 4 tufts a tile)
try{const G=typeof TUFT!='undefined'?VIL.filter(v=>v.geo===TUFT):[],P=[];INSL.forEach(I=>{if(I.tri)return;const s=CHQ132.spots[I.g];if(s)P.push([s.bx,s.bz,1.05],[s.x,s.z,.55])});
  const T=new Map();P.forEach(q=>{for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const k=(Math.round(q[1])+j)*W+Math.round(q[0])+i;if(!T.has(k))T.set(k,[]);T.get(k).push(q)}});
  const Z=new THREE.Matrix4().makeScale(0,0,0);G.forEach(v=>{for(let i=0;i<v.n;i++){const x=v.M[i*16+12],z=v.M[i*16+14],L=T.get(Math.round(z)*W+Math.round(x));
    if(L&&L.some(q=>Math.hypot(x-q[0],z-q[1])<q[2]))v.setMatrixAt(i,Z)}v.instanceMatrix.needsUpdate=true})}catch(err){console.warn('chq132 grass',err)}

// ---------------- the burrow hole ----------------
const CHQ132_DIRT=[0x3a2a1c,0x5a4630,0x4a4448,0xa88c5c,0x3c3a34,0x3a2c2a];
function chqBurrow132(){const g=new THREE.Group();g.name='CheddarBurrow';g.userData.psNo=1;
  const M=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1});
  const shade=(geo,c)=>{geo=geo.index?geo.toNonIndexed():geo;const p=geo.attributes.position,a=new Float32Array(p.count*3),col=new THREE.Color();
    for(let i=0;i<p.count;i+=3){const h=Math.sin((p.getX(i)+p.getZ(i+1))*91.7+p.getY(i)*37.3)*43758.5,v=.8+.35*(h-Math.floor(h));col.setHex(c).multiplyScalar(v);for(let k=0;k<3;k++)a.set([col.r,col.g,col.b],(i+k)*3)}
    geo.setAttribute('color',new THREE.BufferAttribute(a,3));geo.computeVertexNormals();return geo};
  g.userData.parts=[];const add=(geo,c,m)=>{const o=new THREE.Mesh(shade(geo,c),m||M);o.castShadow=false;o.receiveShadow=true;g.add(o);g.userData.parts.push([o,c]);return o};
  // raised dirt rim (a low lathe ring), the hole's throat going down, a dark floor
  const rim=[[.3,-.12],[.31,.04],[.35,.13],[.44,.19],[.56,.17],[.68,.09],[.8,-.04]].map(p=>new THREE.Vector2(p[0],p[1]));
  const rg=new THREE.LatheGeometry(rim,11);{const p=rg.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(x,z);p.setY(i,p.getY(i)*(1+.35*Math.sin(a*3+.7)))}}
  add(rg,0);
    {const mg=new THREE.CircleGeometry(.33,11),p=mg.attributes.position,c=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const r=Math.hypot(p.getX(i),p.getY(i))/.33,v=.012+.07*r*r;c.set([v*1.25,v,v*.7],i*3)}
    mg.setAttribute('color',new THREE.BufferAttribute(c,3));const mouth=new THREE.Mesh(mg,new THREE.MeshBasicMaterial({vertexColors:true}));mouth.rotation.x=-Math.PI/2;mouth.position.y=.05;g.add(mouth)}
  // the spoil heap he kicked out, loose clods and a pebble or two
  const heap=add(new THREE.SphereGeometry(.42,7,5,0,Math.PI*2,0,Math.PI/2),0);heap.position.set(.1,-.05,.9);heap.scale.set(1.05,.34,.6);
  [[.55,.62,.09],[-.48,.7,.07],[.22,1.18,.06],[-.18,1.1,.08],[.84,.25,.05],[-.8,.18,.06],[.42,-.7,.045],[-.6,-.5,.05]].forEach(([x,z,r],i)=>{
    const c=add(new THREE.DodecahedronGeometry(r,0),i>5?1:0);c.position.set(x,r*.5,z);c.rotation.set(i,i*2.1,i*.7)});
  [[.62,.3,.05],[-.3,.8,.04]].forEach(([x,z,r])=>{const s=add(new THREE.DodecahedronGeometry(r,0),2);s.position.set(x,r*.4,z)});
  return g}
function chqBurrowTint132(z){const B=CHQ132.bur;if(!B||B.userData.z===z)return;B.userData.z=z;const base=CHQ132_DIRT[z]||CHQ132_DIRT[0];
  const pal=[base,new THREE.Color(base).multiplyScalar(.72).getHex(),0x5a5652,0x4a3020];
  B.userData.parts.forEach(([o,k])=>{const geo=o.geometry,p=geo.attributes.position,a=geo.attributes.color,col=new THREE.Color();
    for(let i=0;i<p.count;i+=3){const h=Math.sin((p.getX(i)+p.getZ(i+1))*91.7+p.getY(i)*37.3)*43758.5,v=.8+.35*(h-Math.floor(h));col.setHex(pal[k]).multiplyScalar(v);for(let j=0;j<3;j++)a.setXYZ(i+j,col.r,col.g,col.b)}
    a.needsUpdate=true})}

// ---------------- the "!" / "?" marker ----------------
function chqMarkTex132(ch){const c=document.createElement('canvas');c.width=128;c.height=160;const x=c.getContext('2d');
  x.textAlign='center';x.textBaseline='middle';x.font='bold 132px Georgia,"Times New Roman",serif';
  x.shadowColor='rgba(255,190,70,.9)';x.shadowBlur=18;x.lineJoin='round';x.lineWidth=12;x.strokeStyle='#1a0f06';x.strokeText(ch,64,86);
  const gr=x.createLinearGradient(0,20,0,150);gr.addColorStop(0,'#fff0b0');gr.addColorStop(.5,'#f0c040');gr.addColorStop(1,'#b07818');x.fillStyle=gr;x.fillText(ch,64,86);
  x.shadowBlur=0;x.lineWidth=3;x.strokeStyle='#5a3808';x.strokeText(ch,64,86);
  const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return t}
function chqMarker132(){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:chqMarkTex132('!'),transparent:true,depthWrite:false,fog:false}));
  s.userData.tx={'!':s.material.map,'?':chqMarkTex132('?')};s.scale.set(.42,.52,1);s.renderOrder=5;s.visible=false;s.userData.psNo=1;s.userData.noFarCull=1;return s}

// ---------------- building and ticking Cheddar ----------------
var CHQ132_SC=1.1;   // the concept model is 0.78 tall; a hero is ~1.45, so Cheddar stands ~0.86 (about 60% of a hero)
function chqBuild132(){if(CHQ132.ch)return;try{
  const C=chd132Model({game:true});C.root.scale.setScalar(CHQ132_SC);C.root.userData.psNo=1;C.root.userData.noFarCull=1;
  C.root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  CHQ132.ch=C;CHQ132.bur=chqBurrow132();CHQ132.mk=chqMarker132();
  [C.root,CHQ132.bur,CHQ132.mk].forEach(o=>{o.visible=false;scene.add(o)})}catch(err){console.warn('chq132 build',err);CHQ132.ch=null}}
function chqPlace132(I){chqBuild132();const C=CHQ132.ch;if(!C)return;const show=!!I;
  [C.root,CHQ132.bur].forEach(o=>o.visible=show);if(!show){CHQ132.mk.visible=false;return}
  const s=chqSpot132(I);C.root.position.set(s.x,GH(s.x,s.z),s.z);C.root.rotation.y=s.face;
  CHQ132.bur.position.set(s.bx,GH(s.bx,s.bz)+.02,s.bz);CHQ132.bur.rotation.y=Math.atan2(s.bx-s.x,s.bz-s.z);chqBurrowTint132(I.z);
  CHQ132.pop=1;CHQ132.wave=0;CHQ132.near=0;C.setPose('idle')}
function chqTick132(dt,now){
  const I=chqHere132(),g=I?I.g:-1;
  if(g!==CHQ132.g){CHQ132.g=g;chqPlace132(I);CHQ132.trkK='';chqTrk132()}
  const C=CHQ132.ch;if(!C||!I)return;const R=C.root,s=CHQ132.spots[g];if(!s)return;
  const P=pl.position,d=Math.hypot(P.x-s.x,P.z-s.z),st=chqState132(I),y0=GH(s.x,s.z);
  // climbing out of the burrow when you arrive (he slides up from the hole, then hops across to his spot)
  if(CHQ132.pop>0){CHQ132.pop=Math.max(0,CHQ132.pop-dt/1.1);const k=1-CHQ132.pop,up=Math.min(1,k/.55),hop=Math.max(0,(k-.55)/.45);
    const e=1-Math.pow(1-up,3);R.position.set(s.bx+(s.x-s.bx)*hop,y0-.95*(1-e)+Math.sin(hop*Math.PI)*.22,s.bz+(s.z-s.bz)*hop);
    if(CHQ132.pop===0)R.position.set(s.x,y0,s.z);
    if(k>.05&&!CHQ132.popB){CHQ132.popB=1;try{burst(V(s.bx,GH(s.bx,s.bz)+.25,s.bz),CHQ132_DIRT[I.z]||0x5a4630,14,1.3,1.8,.55)}catch(_){}}}
  else CHQ132.popB=0;
  if(dt<=0&&CHQ132.pop<=0){chqMark132(I,st,now);return}
  // turn towards the hero when they come close, otherwise back towards the road
  const want=d<9?Math.atan2(P.x-R.position.x,P.z-R.position.z):s.face;let da=want-R.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));R.rotation.y+=da*Math.min(1,dt*4);
  // a wave when you walk up and he has something for you
  if(d<7&&!CHQ132.near){CHQ132.near=1;if(st.av||st.rd){CHQ132.wave=2.6;C.setPose('wave')}}
  if(d>10)CHQ132.near=0;
  if(CHQ132.wave>0){CHQ132.wave-=dt;if(CHQ132.wave<=0)C.setPose('idle')}
  if(d<40)C.update(now/1000,Math.min(.05,dt));
  chqMark132(I,st,now)}
function chqMark132(I,st,now){const m=CHQ132.mk,R=CHQ132.ch&&CHQ132.ch.root;if(!m||!R)return;
  const ch=st.rd?'?':st.av?'!':'';m.visible=!!ch&&R.visible;if(!ch)return;if(CHQ132.mkK!==ch){CHQ132.mkK=ch;m.material.map=m.userData.tx[ch];m.material.needsUpdate=true}
  const t=now/1000;m.position.set(R.position.x,R.position.y+.78*CHQ132_SC+.42+Math.sin(t*2.2)*.06,R.position.z);const k=1+.06*Math.sin(t*4.4);m.scale.set(.42*k,.52*k,1)}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{chqTick132(dt,now)}catch(err){if(!CHQ132.err){CHQ132.err=1;console.warn('chq132',err)}}
  try{if(now-CHQ132.t>400){CHQ132.t=now;chqRunes132();chqTrk132();if(!$('chqt132').classList.contains('hide'))chqTrkPos132()}}catch(_){}return r}}

// ---------------- talking to him ----------------
function chqNear132(){const I=chqHere132();if(!I||!CHQ132.ch||!CHQ132.ch.root.visible)return null;const s=CHQ132.spots[I.g];if(!s)return null;
  return Math.hypot(pl.position.x-s.x,pl.position.z-s.z)<2.3?I:null}
{const f=worldPrompt;worldPrompt=function(){try{const I=chqNear132();if(I){const st=chqState132(I);
    return {label:'F · Talk to Cheddar'+(st.rd?' (quest complete!)':st.av?' (new quests)':''),fn:()=>openX('chq132')}}}catch(_){}return f.apply(this,arguments)}}
XR.chq132=()=>{const I=chqHere132();$('xwT').textContent='🐭 Cheddar';$('xwS').textContent='Burrow-walker'+(I?' · '+I.n:'');
  if(!I){$('xwB').innerHTML='<p class="lore">'+CHQ132_SAY.none+'</p>';$('xwF').innerHTML='';return}
  const L=chqList132(I),st=chqState132(I);
  const line=!L.length?CHQ132_SAY.none:st.rd?CHQ132_SAY.ready:st.av&&!st.ac&&!st.dn?CHQ132_SAY.hi:st.av?CHQ132_SAY.hi:st.ac?CHQ132_SAY.busy:CHQ132_SAY.done;
  let b='<p class="lore cq132say">“'+line+'”</p>';
  const rk=q=>{const S=chqS132(q),s=S?S.s:0;return s==2?0:s==0?1:s==1?2:3};
  L.slice().sort((a,c)=>rk(a)-rk(c)).forEach(q=>{const S=chqS132(q),s=S?S.s:0;
    const obj=q.o.map((o,i)=>{const need=chqNeed132(I,o),have=S?Math.min(need,S.p[i]||0):0,pc=Math.round(have/need*100);
      return '<div class="cq132o"><span>'+o[2]+'</span><span class="cq132n">'+(s?have+' / '+need:need>1?'× '+need:'')+'</span>'+(s&&s<3?'<i style="width:'+pc+'%"></i>':'')+'</div>'}).join('');
    const btn=!s?'<button class="pri" data-cqa="'+q.id+'">Accept</button>':s==1?'<button disabled>In progress</button>':s==2?'<button class="pri cq132go" data-cqt="'+q.id+'">Turn in</button>':'<span class="cq132ok">✓ Done</span>';
    b+='<div class="cq132'+(s==3?' done':s==2?' ready':'')+'"><div class="cq132h"><b>'+(s==2?'❓ ':s==3?'':'❗ ')+q.t+'</b>'+btn+'</div><div class="mut dtl">'+q.d+'</div>'+obj+
      '<div class="cq132r">Reward: '+chqRwTxt132(I,q)+'</div></div>'});
  $('xwB').innerHTML=b;
  $('xwF').innerHTML=(st.av>1?'<button class="pri" data-cqall="1">Accept all</button> ':'')+'<span class="mut dtl">Quests only count while you are in '+I.n+'; your progress is kept if you leave.</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='chq132')return;const t=e.target.closest('[data-cqa],[data-cqt],[data-cqall]');if(!t||t.disabled)return;const ds=t.dataset;
  if(ds.cqa)chqAccept132(ds.cqa);
  if(ds.cqt)chqTurnIn132(ds.cqt);
  if(ds.cqall)chqList132(chqHere132()).forEach(q=>{if(!chqS132(q))chqAccept132(q.id)});
  try{hud()}catch(_){}chqTrk132();rX()});

// ---------------- the tracker: this instance's accepted quests ----------------
(function(){const st=document.createElement('style');st.textContent=`
#xw .cq132say{margin:0 0 10px;font-style:italic}
#xw .cq132{border:1px solid rgba(201,162,74,.28);background:rgba(20,14,9,.55);border-radius:5px;padding:8px 10px;margin:0 0 8px}
#xw .cq132.ready{border-color:#c9a24a;box-shadow:0 0 0 1px rgba(240,204,114,.25) inset}
#xw .cq132.done{opacity:.55}
#xw .cq132h{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px}
#xw .cq132h b{color:#f0cc72}
#xw .cq132h button{flex:none}
#xw .cq132o{position:relative;display:flex;justify-content:space-between;gap:8px;margin-top:5px;padding:3px 7px;border-radius:3px;background:rgba(255,255,255,.04);overflow:hidden;font-size:.86em}
#xw .cq132o i{position:absolute;left:0;top:0;bottom:0;background:rgba(201,162,74,.22);pointer-events:none}
#xw .cq132o span{position:relative}
#xw .cq132n{font-variant-numeric:tabular-nums;opacity:.85}
#xw .cq132r{margin-top:6px;font-size:.82em;color:#d8c49a}
#xw .cq132ok{color:#8fd18a;font-weight:600}
#chqt132{position:fixed;right:12px;top:300px;z-index:6;width:210px;max-width:42vw;pointer-events:none;font-size:12px;line-height:1.35;color:#e9dfcf;
  background:linear-gradient(270deg,rgba(14,10,7,.82),rgba(14,10,7,.4));border-right:2px solid #c9a24a;border-radius:4px 0 0 4px;text-align:right;padding:6px 9px 7px;text-shadow:0 1px 2px #000}
#chqt132.hide{display:none}
#chqt132 .h{font-family:'IM Fell English SC',Georgia,serif;color:#f0cc72;font-size:12.5px;letter-spacing:.03em;margin-bottom:3px}
#chqt132 .q{margin-top:4px}
#chqt132 .q b{font-weight:600;color:#efe2c4}
#chqt132 .o{display:flex;justify-content:flex-end;gap:8px;color:#b9a888;font-size:11.5px}
#chqt132 .rd{color:#f0cc72}
body.mob #chqt132{width:170px;font-size:11px}`;document.head.appendChild(st);
  const d=document.createElement('div');d.id='chqt132';d.className='hide';document.body.appendChild(d)})();
function chqTrk132(){const el=$('chqt132');if(!el)return;const I=chqHere132(),L=I?chqList132(I).filter(q=>{const S=chqS132(q);return S&&(S.s==1||S.s==2)}):[];
  const hideAll=typeof uiOpen=='function'&&uiOpen();
  const key=(I?I.g:-1)+'|'+(hideAll?1:0)+'|'+L.map(q=>{const S=chqS132(q);return q.id+S.s+S.p.join(',')}).join(';');if(key===CHQ132.trkK)return;CHQ132.trkK=key;
  if(!L.length||hideAll){el.classList.add('hide');return}
  el.innerHTML='<div class="h">🐭 Cheddar · '+I.n+'</div>'+L.map(q=>{const S=chqS132(q);
    if(S.s==2)return '<div class="q"><b>'+q.t+'</b><div class="o rd"><span>✓ Return to Cheddar</span></div></div>';
    return '<div class="q"><b>'+q.t+'</b>'+q.o.map((o,i)=>'<div class="o"><span>'+o[2]+'</span><span>'+Math.min(chqNeed132(I,o),S.p[i]||0)+'/'+chqNeed132(I,o)+'</span></div>').join('')+'</div>'}).join('');
  el.classList.remove('hide');chqTrkPos132()}
function chqTrkPos132(){const el=$('chqt132'),m=$('mini');if(!el||!m||!m.offsetParent)return;const mr=m.getBoundingClientRect();let b=mr.bottom;
  ['locBox','fsBtn','sysBtn','sysmenu','mbtn'].forEach(id=>{const e=$(id);if(!e||!e.offsetParent)return;const r=e.getBoundingClientRect();if(r.width&&r.right>mr.left-40&&r.left<mr.right+40)b=Math.max(b,r.bottom)});
  if(b+140>innerHeight)b=Math.max(mr.bottom,innerHeight*.35);el.style.top=Math.round(b+10)+'px';el.style.right=Math.max(8,Math.round(innerWidth-mr.right))+'px'}
addEventListener('resize',()=>{try{chqTrkPos132()}catch(_){}})

// ---------------- events ----------------
function chqRemote132(){return typeof MP!='undefined'&&!!MP.rk}
function chqBuffKind132(){const t=nowP(),B=hero.buffs||[];
  const comp=(typeof party!='undefined'&&party.slice(0,2).some(c=>c&&c.emp&&c.h>0))||B.some(b=>b.t>t&&b.s&&Object.values(CSP).some(sp=>sp.k=='buff'&&sp.buff===b.s));
  const food=B.some(b=>b.food&&b.k&&SUP[b.k]&&SUP[b.k].c=='food'&&b.t>t),bard=B.some(b=>b.n=='Inspired'&&b.t>t);return {comp,food,bard}}
function chqKill132(e,C,was){if(!e||e.dprop||e.wv)return;
  if(C&&!C.raid&&!was&&campCleared(C)){chqEv132('camp',1);chqEv132('allCamps',1,C.j!=null?C.j:C.i)}
  if(chqRemote132()||e.mir)return;
  if(e.c&&e.c.al)chqEv132('elite',1);
  const b=chqBuffKind132();if(b.comp)chqEv132('empKill',1);if(b.food)chqEv132('foodKill',1);if(b.bard)chqEv132('bardKill',1);
  const w=typeof eq!='undefined'&&eq.weapon;if(w&&w.up>0&&e.lhH&&nowP()-e.lhH<3000)chqEv132('forgeKill',1)}
{const f=kill;kill=function(e){if(!e||(e.chq132&&e.chq132===e.c))return f.apply(this,arguments);let C=null,was=true;try{C=e.camp||null;was=C?campCleared(C):true}catch(_){}
  const r=f.apply(this,arguments);try{e.chq132=e.c;chqKill132(e,C,was)}catch(err){console.warn('chq132 kill',err)}return r}}
{const f=gFinish;gFinish=function(tg){const a={w:mats.wood||0,s:mats.stone||0,g:mats.glowcap||0,i:mats.iron||0};const r=f.apply(this,arguments);
  try{const d=k=>Math.max(0,(mats[k]||0)-a[k[0]=='w'?'w':k=='stone'?'s':k=='glowcap'?'g':'i']);
    const w=d('wood'),s=d('stone'),g=d('glowcap'),i=d('iron');if(w)chqEv132('wood',w);if(s)chqEv132('stone',s);if(g)chqEv132('glow',g);if(i)chqEv132('iron',i)}catch(_){}return r}}
{const f=fishCatch;fishCatch=function(){const had=typeof fishing!='undefined'&&fishing&&fishing.fish;const r=f.apply(this,arguments);try{if(had)chqEv132('fish',1)}catch(_){}return r}}
{const f=fishTreasure;fishTreasure=function(){const g0=gold;const r=f.apply(this,arguments);try{if(gold>g0)chqEv132('pouch',1)}catch(_){}return r}}
{const f=$('doF').onclick;$('doF').onclick=function(){let mode='',b=null,cat='';
  try{mode=fOpt;b=mode=='con'?fCon:party[sel[1]];cat=typeof fCat!='undefined'&&fCat&&(sup[fCat]||0)>0?fCat:''}catch(_){}
  const r=f.apply(this,arguments);try{if(b&&!party.includes(b)){chqEv132('fuse',1);if(cat&&mode!='con')chqEv132('catFuse',1)}}catch(_){}return r}}
{const f=feedComp;feedComp=function(c,k){const a=cnt(k);const r=f.apply(this,arguments);try{if(cnt(k)<a)chqEv132('feed',1)}catch(_){}return r}}
{const f=kqrUp;kqrUp=function(n){let r0=0;try{r0=hero.tal['ab:'+n]||0}catch(_){}const r=f.apply(this,arguments);try{if((hero.tal['ab:'+n]||0)>r0)chqEv132('ability',1)}catch(_){}return r}}
{const f=kqsBuy;kqsBuy=function(n){let r0=0;try{r0=hero.tal['ab:'+n]||0}catch(_){}const r=f.apply(this,arguments);try{if((hero.tal['ab:'+n]||0)>r0)chqEv132('ability',1)}catch(_){}return r}}
{const f=breakBoulder;breakBoulder=function(S){const was=!S||S.broken;const r=f.apply(this,arguments);try{if(!was&&S.broken)chqEv132('secret',1)}catch(_){}return r}}
if(typeof digTreasure=='function'){const f=digTreasure;digTreasure=function(m){const had=m&&tmaps.includes(m);const r=f.apply(this,arguments);try{if(had&&!tmaps.includes(m))chqEv132('secret',1)}catch(_){}return r}}
{const f=hatch;hatch=function(e){const c=f.apply(this,arguments);try{if(c&&e&&(e.tier|0)>=1)chqEv132('hatch2',1)}catch(_){}return c}}
{const f=mountTick;mountTick=function(){const m=typeof riding!='undefined'?riding:null,s0=m?m.spd:0;const r=f.apply(this,arguments);try{if(m&&m.spd>s0)chqEv132('mount',m.spd-s0)}catch(_){}return r}}
// runes are socketed inline (0420): watch each companion's rune count
function chqRunes132(){if(typeof party=='undefined')return;const W_=CHQ132.rp;party.forEach(c=>{if(!c)return;const n=(c.runes||[]).length,o=W_.get(c);if(o!=null&&n>o)chqEv132('rune',n-o);W_.set(c,n)})}

// ---------------- a guaranteed secret on the plains (Hillside Crest I, "Under the Stone") ----------------
// The world has 2 secret boulders per tier and they can land in any instance (or be broken already); Cheddar's quest gets its own one.
// Appended to SECRETS (ids are saved by index, so this stays stable), built and saved like the others.
try{const I=PMAP[1]&&PMAP[1].ins[0];if(I){
  let s=8129;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};
  for(let k=0;k<900;k++){const x=Math.round(I.x0+12+rnd()*(I.w-24)),y=Math.round(I.y0+12+rnd()*(I.h-24));const J=insAt(x,y);if(!J||J.g!==I.g)continue;
    if(Math.hypot(x-I.en[0],y-I.en[1])<40)continue;if(CAMPS.some(C=>Math.hypot(C.x-x,C.z-y)<(C.r||12)+8))continue;
    if(I.path&&I.path.some(p=>Math.hypot(p[0]-x,p[1]-y)<6))continue;if(!freeSpot(x,y,3))continue;
    SECRETS.push({id:SECRETS.length,k:'boulder',x,z:y,T:Math.max(1,tierAt(x,y)),chq:1});break}}}catch(err){console.warn('chq132 secret',err)}

// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.chq={v:132,st:CHQ132.st}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.chq&&s.chq.st;CHQ132.st={};
    if(q&&typeof q=='object')for(const id in q){const S=q[id],D=CHQ132_ID[id];if(!D||!S)continue;CHQ132.st[id]={s:Math.max(1,Math.min(3,S.s|0)),p:D.o.map((o,i)=>Math.max(0,+((S.p||[])[i])||0)),cj:Array.isArray(S.cj)?S.cj.slice(0,9):undefined}}
    CHQ132.trkK=''}catch(_){CHQ132.st={}}return r}}
