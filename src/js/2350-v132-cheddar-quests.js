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
// forgeKill (+2 weapon), foodKill, bardKill, fuse, catFuse, feed, ability (rank 2+), secret, egg2 (a Tier 2+ egg gained), mount, rune
var CHQD132={
 '0_0':[
  {id:'k1a',t:'Smoke Them Out',d:'A camp has dug in on my best toadstool patch. Clear one out and I’ll make it worth your while.',o:[['camp',1,'Camp cleared']],rw:'weapon',w:1.2},
  {id:'k1b',t:'Timber for the Burrows',d:'My burrows don’t shore themselves up. Fifteen wood from the groves, if you please.',o:[['wood',15,'Wood gathered']],rw:'boots',w:1.2}, // v141: wood only (was + 10 stone)
  {id:'k1c',t:'Something for the Pot',d:'Five fish from the bog water. Don’t ask what I do with them.',o:[['fish',5,'Fish caught']],rw:'egg',w:1},
  {id:'k1d',t:'Lanterns for the Dark',d:'Glow Caps light the tunnels down below. Pick me five.',o:[['glow',5,'Glow Caps picked']],rw:'helm',w:1},
  {id:'k1e',t:'Borrowed Strength',d:'Have a companion empower you (E / R), then take something down while their strength is in you.',o:[['empKill',1,'Kill while a companion empowers you']],rw:'chest',w:1}],
 '0_1':[
  {id:'k2a',t:'Bigger Game',d:'Elites stalk these hollows: bigger, meaner, and their names burn gold. Bring one down.',o:[['elite',1,'Elite slain']],rw:'weapon',w:1.5},
  {id:'k2b',t:'A Lucky Line',d:'Fish long enough and the water coughs up a gold pouch. Pull one up for me.',o:[['pouch',1,'Gold pouch fished up']],rw:'egg',w:1.3},
  {id:'k2c',t:'Stone and Ore for the Forge',d:'Eight stone for the hearth and five iron ore. The veins here run rust-red through the rock.',o:[['stone',8,'Stone gathered'],['iron',5,'Iron Ore mined']],rw:'helm',w:1.2}, // v141: + 8 stone
  {id:'k2d',t:'Two Become One',d:'Fuse, siphon or consume a companion. Out here the strong eat the weak.',o:[['fuse',1,'Companion fused, siphoned or consumed']],rw:'egg',w:1}],
 '0_2':[
  {id:'k3a',t:'Tempered Steel',d:'Have the Blacksmith forge your weapon to +2 or better, then kill something with it.',o:[['forgeKill',1,'Kill with a +2 forged weapon']],rw:'weapon',w:1.3},
  {id:'k3b',t:'Well Fed',d:'Feed your companions five times. A hungry beast is a disloyal one.',o:[['feed',5,'Companions fed']],rw:'egg',w:1},
  {id:'k3c',t:'Sharpen the Craft',d:'Spend your ability points to raise one of your abilities to rank 2 or higher.',o:[['ability',1,'Ability raised to rank 2+']],rw:'chest',w:1}],
 '1_0':[
  {id:'h1a',t:'Clean Sweep',d:'Every camp on this stretch of road. Clear each one at least once.',o:[['allCamps',3,'Camps cleared']],rw:'weapon',w:1.6},
  {id:'h1b',t:'Fight on a Full Stomach',d:'Eat a proper meal, then kill a monster while it still warms your belly.',o:[['foodKill',1,'Kill while buffed by food']],rw:'chest',w:1},
  {id:'h1c',t:'Under the Stone',d:'There’s a cracked boulder out on these plains with a cache beneath it. Find it.',o:[['secret',1,'Secret found']],rw:'egg',w:1.3}],
 '1_1':[
  {id:'h2a',t:'New Blood',d:'Find me an egg of Tier 2 or higher out on these plains. Loot it, fish it, take it.',o:[['egg2',1,'Tier 2+ egg found']],rw:'egg',w:1.2},
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
function chqXP132(I,q){const L=chqLv132(I);return Math.max(5,Math.round((8+12*L)*.6375*(typeof ECON96!='undefined'?ECON96.xp:1)*(14+L)*(q.w||1)*.7))}   // v132.1: 30% less than first shipped
function chqGold132(I,q){const L=chqLv132(I);return Math.max(10,Math.round((3+1.4*L)*.65*(16+L)*(q.w||1)))}
function chqGear132(I,sl){const lv=Math.max(1,Math.min(chqLv132(I),hero.lvl+2)),minR=I.k>=2?2:1;let it=null;
  for(let i=0;i<12&&!it;i++){try{const c=genItem(lv,{cls:hero.cls,sl,minR});if(c&&itT(c).sl===sl&&(sl!='weapon'||fitsCls(itT(c),hero.cls)))it=c}catch(_){}}
  if(!it)try{it=genItem(lv,{cls:hero.cls,sl,minR})}catch(_){}return it}
function chqEgg132(I){const L=zEggs104(I.z);if(!L.length)return rollEgg(Math.max(1,Math.min(5,PMAP[I.z].t||1)));const sp=L[Math.floor(Math.random()*L.length)];
  return mkEgg(sp,Math.max(0,SP2[sp][1]-1),.95+Math.random()*.15+(I.k>=2?.05:0))}
function chqGiveXP132(xp){
  if(hero.lvl<MAXLV){hero.xp+=hxp164(xp);while(hero.lvl<MAXLV&&hero.xp>=needH(hero.lvl)){hero.xp-=needH(hero.lvl);heroLevelUp()}}else hero.xp=0;
  party.slice(0,actN141()).forEach(c2=>{if(!c2||c2.l>=MAXLV)return;c2.x+=xp;while(c2.l<MAXLV&&c2.x>=needH(c2.l)){c2.x-=needH(c2.l);c2.l++;c2.h=M(c2);say(nm(c2)+' reached Lv '+c2.l+'!')}})}
function chqReward132(I,q){const xp=chqXP132(I,q),g=chqGold132(I,q);
  if(q.rw=='egg'){const eg=chqEgg132(I);if(eg){try{(CHQ132.egS||(CHQ132.egS=new WeakSet())).add(eg)}catch(_){}take({kind:'egg',data:eg})}try{dex.egg.add(eg.sp)}catch(_){}}
  else{const it=chqGear132(I,q.rw);if(it)take({kind:'gear',data:it})}
  gold+=g;chqGiveXP132(xp);try{dn(pl.position,'+'+hxp164(xp)+' XP','#c4b5fd',0,1600);dn(pl.position,'+'+g+' 🪙','#fbbf24',-26,1600)}catch(_){}
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
  // v135: he stands a few steps down the road in front of where you arrive (the camera looks down the road), a little to its side,
  // facing the arrival spot, so he is the first thing you see; the burrow is just behind him
  const n=I.path[26],e=I.en;let dx=n[0]-e[0],dz=n[1]-e[1];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;const sx=-dz,sz=dx;
  const free=(x,z,rr)=>{for(let j=-rr;j<=rr;j++)for(let i=-rr;i<=rr;i++){const X=Math.round(x)+i,Z=Math.round(z)+j;if(X<1||Z<1||X>=W-1||Z>=H-1||solid(X,Z))return false}return true};
  const C=[[4.2,1.9],[4.2,-1.9],[3.6,2.4],[3.6,-2.4],[5,2.2],[5,-2.2],[4.4,1.4],[4.4,-1.4],[3.2,3],[3.2,-3]];let best=null;
  for(const [a,b] of C){const x=e[0]+dx*a+sx*b,z=e[1]+dz*a+sz*b,o=Math.sign(b),bx=x+dx*1.2+sx*o*.55,bz=z+dz*1.2+sz*o*.55;
    if(free(x,z,0)&&free(bx,bz,0)&&Math.abs(GH(x,z)-GH(bx,bz))<.6&&Math.abs(GH(x,z)-GH(e[0],e[1]))<1.2){best={x,z,bx,bz};break}}
  if(!best){const x=e[0]+dx*4.2+sx*1.9,z=e[1]+dz*4.2+sz*1.9;best={x,z,bx:x+dx*1.2,bz:z+dz*1.2}}
  best.face=Math.atan2(e[0]-best.x,e[1]-best.z);best.g=I.g;CHQ132.spots[I.g]=best;return best}
// v135: a second Cheddar waits a few steps before the gateway at the end of every field instance (it leads to the next instance,
// or to the Den from III), facing the road you come down, so quests can be handed in before stepping through
CHQ132.e={end:1,spots:{},ch:null,bur:null,mk:null,mkK:'',pop:0,popB:0,wave:0,near:0};
function chqSpotEnd135(I){const E=CHQ132.e;if(E.spots[I.g]!==undefined)return E.spots[I.g];
  const r=RPORT.find(q=>q.k=='next'&&q.ig===I.g);if(!r||!I.fld){E.spots[I.g]=null;return null}
  const P=I.path,q=P[Math.max(0,P.length-14)];let dx=q[0]-r.x,dz=q[1]-r.z;const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;const sx=-dz,sz=dx;
  const free=(x,z)=>{const X=Math.round(x),Z=Math.round(z);return X>=1&&Z>=1&&X<W-1&&Z<H-1&&!solid(X,Z)};
  const C=[[5.4,2],[5.4,-2],[6,2.4],[6,-2.4],[5.2,2.6],[5.2,-2.6],[6.6,1.8],[6.6,-1.8],[5.6,1.4],[5.6,-1.4]];   // past the gateway's own F reachlet best=null;
  for(const [a,b] of C){const x=r.x+dx*a+sx*b,z=r.z+dz*a+sz*b,o=Math.sign(b),bx=x-dx*1.2+sx*o*.55,bz=z-dz*1.2+sz*o*.55;
    if(free(x,z)&&free(bx,bz)&&Math.abs(GH(x,z)-GH(bx,bz))<.6){best={x,z,bx,bz};break}}
  if(!best){const x=r.x+dx*5.4+sx*2,z=r.z+dz*5.4+sz*2;best={x,z,bx:x-dx*1.2,bz:z-dz*1.2}}
  best.face=Math.atan2(q[0]-best.x,q[1]-best.z);best.g=I.g;E.spots[I.g]=best;return best}
function chqPosts135(){return [CHQ132,CHQ132.e]}
function chqPSpot135(P,I){return P.end?chqSpotEnd135(I):chqSpot132(I)}
// v148: Cheddar no longer stands in the zone instances (he keeps the quest board in Duskhold, 3075), so no colliders on his old spots

// v148: (the grass round his old spots is no longer cleared)

// ---------------- the burrow hole ----------------
const CHQ132_DIRT=[0x3a2a1c,0x5a4630,0x4a4448,0xa88c5c,0x3c3a34,0x3a2c2a];
function chqBurrow132(){const g=new THREE.Group();g.name='CheddarBurrow';g.userData.psNo=1;
  const M=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,side:THREE.DoubleSide});   // v132.1: the lathe rim faced down and vanished from above
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
function chqBurrowTint132(z,P){const B=(P||CHQ132).bur;if(!B||B.userData.z===z)return;B.userData.z=z;const base=CHQ132_DIRT[z]||CHQ132_DIRT[0];
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
function chqBuild132(P){P=P||CHQ132;if(P.ch)return;try{
  const C=chd132Model({game:true});C.root.scale.setScalar(CHQ132_SC);C.root.userData.psNo=1;C.root.userData.noFarCull=1;
  C.root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  P.ch=C;P.bur=chqBurrow132();P.mk=chqMarker132();
  [C.root,P.bur,P.mk].forEach(o=>{o.visible=false;scene.add(o)})}catch(err){console.warn('chq132 build',err);P.ch=null}}
function chqPlace132(I,P){P=P||CHQ132;const s=I?chqPSpot135(P,I):null;if(!s&&!P.ch)return;chqBuild132(P);const C=P.ch;if(!C)return;const show=!!(I&&s);
  [C.root,P.bur].forEach(o=>o.visible=show);if(!show){P.mk.visible=false;return}
  C.root.position.set(s.x,GH(s.x,s.z),s.z);C.root.rotation.y=s.face;
  P.bur.position.set(s.bx,GH(s.bx,s.bz)+.02,s.bz);P.bur.rotation.y=Math.atan2(s.bx-s.x,s.bz-s.z);chqBurrowTint132(I.z,P);
  P.pop=P.end?0:1;P.wave=0;P.near=0;C.setPose('idle')}
function chqTick132(dt,now){
  const I=chqHere132(),g=I?I.g:-1;
  if(g!==CHQ132.g){CHQ132.g=g;chqPosts135().forEach(P=>chqPlace132(I,P));CHQ132.trkK='';chqTrk132()}
  if(!I)return;const st=chqState132(I);chqPosts135().forEach(P=>chqTickP135(P,I,st,dt,now))}
function chqTickP135(P,I,st,dt,now){
  const C=P.ch;if(!C||!C.root.visible)return;const R=C.root,s=chqPSpot135(P,I);if(!s)return;
  const Pp=pl.position,d=Math.hypot(Pp.x-s.x,Pp.z-s.z),y0=GH(s.x,s.z);
  // climbing out of the burrow when you arrive (he slides up from the hole, then hops across to his spot); the gateway Cheddar
  // climbs out when you first come near
  if(P.end&&!P.popD&&d<16){P.popD=1;P.pop=1}
  if(P.end&&d>40)P.popD=0;
  if(P.pop>0){P.pop=Math.max(0,P.pop-dt/1.1);const k=1-P.pop,up=Math.min(1,k/.55),hop=Math.max(0,(k-.55)/.45);
    const e=1-Math.pow(1-up,3);R.position.set(s.bx+(s.x-s.bx)*hop,y0-.95*(1-e)+Math.sin(hop*Math.PI)*.22,s.bz+(s.z-s.bz)*hop);
    if(P.pop===0)R.position.set(s.x,y0,s.z);
    if(k>.05&&!P.popB){P.popB=1;try{burst(V(s.bx,GH(s.bx,s.bz)+.25,s.bz),CHQ132_DIRT[I.z]||0x5a4630,14,1.3,1.8,.55)}catch(_){}}}
  else P.popB=0;
  if(dt<=0&&P.pop<=0){chqMark132(I,st,now,P);return}
  // turn towards the hero when they come close, otherwise back towards the road
  const want=d<9?Math.atan2(Pp.x-R.position.x,Pp.z-R.position.z):s.face;let da=want-R.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));R.rotation.y+=da*Math.min(1,dt*4);
  // a wave when you walk up and he has something for you
  if(d<7&&!P.near){P.near=1;if(st.av||st.rd){P.wave=2.6;C.setPose('wave')}}
  if(d>10)P.near=0;
  if(P.wave>0){P.wave-=dt;if(P.wave<=0)C.setPose('idle')}
  if(d<40)C.update(now/1000,Math.min(.05,dt));
  chqMark132(I,st,now,P)}
function chqMark132(I,st,now,P){P=P||CHQ132;const m=P.mk,R=P.ch&&P.ch.root;if(!m||!R)return;
  const ch=st.rd?'?':st.av?'!':'';m.visible=!!ch&&R.visible;if(!ch)return;if(P.mkK!==ch){P.mkK=ch;m.material.map=m.userData.tx[ch];m.material.needsUpdate=true}
  const t=now/1000;m.position.set(R.position.x,R.position.y+.78*CHQ132_SC+.42+Math.sin(t*2.2)*.06,R.position.z);const k=1+.06*Math.sin(t*4.4);m.scale.set(.42*k,.52*k,1)}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{chqTick132(dt,now)}catch(err){if(!CHQ132.err){CHQ132.err=1;console.warn('chq132',err)}}
  try{if(now-CHQ132.t>400){CHQ132.t=now;chqRunes132();chqEggs132();chqTrk132();if(!$('chqt132').classList.contains('hide'))chqTrkPos132()}}catch(_){}return r}}

// ---------------- talking to him ----------------
function chqNear132(){const I=chqHere132();if(!I)return null;
  for(const P of chqPosts135()){if(!P.ch||!P.ch.root.visible)continue;const s=chqPSpot135(P,I);if(s&&Math.hypot(pl.position.x-s.x,pl.position.z-s.z)<2.3)return I}return null}
{const f=worldPrompt;worldPrompt=function(){try{const I=chqNear132();if(I){const st=chqState132(I);
    return {label:'F · Talk to Cheddar'+(st.rd?' (quest complete!)':st.av?' (new quests)':''),fn:()=>openX('chq132')}}}catch(_){}return f.apply(this,arguments)}}
// v132.1: the window is a grid of quest cards; each card ends in a large reward panel with a "mystery" medallion per reward type
var CHQ132_IC=0;
const CHQ132_SIL={
  weapon:'<g transform="rotate(-40 32 32)"><path d="M32 6 L35.6 11.5 L35.6 38 L28.4 38 L28.4 11.5 Z"/><rect x="21.5" y="37.5" width="21" height="4.5" rx="1.8"/><rect x="29.4" y="42" width="5.2" height="10" rx="1"/><circle cx="32" cy="55" r="3.3"/></g>',
  chest:'<path d="M17 20 Q24 13.5 32 17 Q40 13.5 47 20 L51.5 28 L45 31 L45 46 Q32 54.5 19 46 L19 31 L12.5 28 Z"/><path d="M32 18 L32 50 M23 24 Q32 29 41 24" fill="none"/>',
  helm:'<path d="M15.5 43 Q14.5 14.5 32 12.5 Q49.5 14.5 48.5 43 L42 48 L42 35.5 Q32 31 22 35.5 L22 48 Z"/><path d="M32 13 L32 31" fill="none"/>',
  boots:'<path d="M21 11 L37.5 11 L37.5 34.5 Q48.5 35.5 51.5 44 L51.5 51.5 L20.5 51.5 L20.5 41 Z"/><path d="M20.5 44.5 L51.5 44.5 M21 17 L37.5 17" fill="none"/>',
  egg:'<path d="M32 9 C21.5 9 15.5 25.5 15.5 36 C15.5 46.5 23 53.5 32 53.5 C41 53.5 48.5 46.5 48.5 36 C48.5 25.5 42.5 9 32 9 Z"/><path d="M18 33 L24.5 28.5 L29 35 L35 27.5 L40.5 34 L46 30.5" fill="none"/>'};
function chqIco132(type,col,done){const u='cq132i'+(CHQ132_IC++),S=CHQ132_SIL[type]||CHQ132_SIL.chest;
  const mark=done?'<path d="M21 33 L29 41 L44 24" fill="none" stroke="#2a1606" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 33 L29 41 L44 24" fill="none" stroke="#9be08f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
    :'<text x="32" y="44" text-anchor="middle" font-family="Georgia,\'Times New Roman\',serif" font-weight="700" font-size="31" fill="'+col+'" filter="url(#'+u+'g)">?</text>'+
     '<text x="32" y="44" text-anchor="middle" font-family="Georgia,\'Times New Roman\',serif" font-weight="700" font-size="31" fill="url(#'+u+'q)" stroke="#2a1606" stroke-width="1.4" paint-order="stroke">?</text>';
  const rv=[[32,3.6],[60.4,32],[32,60.4],[3.6,32]].map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="1.6" fill="#ffe7a6" stroke="#3a2408" stroke-width=".6"/>').join('');
  return '<svg viewBox="0 0 64 64" class="cq132ic" aria-hidden="true"><defs>'+
    '<radialGradient id="'+u+'b" cx="50%" cy="40%" r="62%"><stop offset="0" stop-color="#3b2b46"/><stop offset=".68" stop-color="#170f15"/><stop offset="1" stop-color="#070405"/></radialGradient>'+
    '<linearGradient id="'+u+'r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc92"/><stop offset=".45" stop-color="#b0812f"/><stop offset="1" stop-color="#4e3010"/></linearGradient>'+
    '<linearGradient id="'+u+'s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f4870"/><stop offset="1" stop-color="#1f1626"/></linearGradient>'+
    '<linearGradient id="'+u+'q" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset=".55" stop-color="#f0c040"/><stop offset="1" stop-color="#a86c10"/></linearGradient>'+
    '<filter id="'+u+'g" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.6"/></filter></defs>'+
    '<circle cx="32" cy="32" r="31" fill="url(#'+u+'r)"/><circle cx="32" cy="32" r="27.2" fill="url(#'+u+'b)" stroke="#1a1008" stroke-width="1.6"/>'+
    '<circle cx="32" cy="32" r="23.5" fill="none" stroke="'+col+'" stroke-opacity=".4" stroke-width="1" stroke-dasharray="1.5 3"/>'+rv+
    '<g fill="url(#'+u+'s)" stroke="'+col+'" stroke-opacity=".6" stroke-width="1.15" stroke-linejoin="round" opacity="'+(done?.45:.95)+'">'+S+'</g>'+mark+'</svg>'}
const CHQ132_XPI='<svg viewBox="0 0 20 20" class="cq132si" aria-hidden="true"><path d="M10 1.5 L12 8 L18.5 10 L12 12 L10 18.5 L8 12 L1.5 10 L8 8 Z" fill="#c4a6ff" stroke="#3a2466" stroke-width="1"/><circle cx="10" cy="10" r="2" fill="#fff"/></svg>';
const CHQ132_GPI='<svg viewBox="0 0 20 20" class="cq132si" aria-hidden="true"><circle cx="10" cy="10" r="8.4" fill="#e8b84a" stroke="#6a4410" stroke-width="1.2"/><circle cx="10" cy="10" r="5.6" fill="none" stroke="#9a6a1c" stroke-width="1"/><path d="M10 6.2 L11.2 9 L10 13.8 L8.8 9 Z" fill="#fff2b8"/></svg>';
function chqRwInfo132(I,q){const minR=I.k>=2?2:1,lv=Math.max(1,Math.min(chqLv132(I),hero.lvl+2));
  if(q.rw=='egg')return {n:'Mystery Egg',sub:'A '+PMAP[I.z].n+' companion egg',col:'#f0cc72'};
  const R=RAR[minR]||['Uncommon','#6ee7b7'],nm={weapon:'Weapon',chest:'Chest Armour',helm:'Helm',boots:'Boots'}[q.rw]||'Gear';
  return {n:'Mystery '+nm,sub:'<span style="color:'+R[1]+'">'+R[0]+' or better</span> · item level '+lv,col:R[1]}}
function chqRwHTML132(I,q,s){const r=chqRwInfo132(I,q);
  return '<div class="cq132rw'+(s==2?' glow':'')+'">'+chqIco132(q.rw,r.col,s==3)+'<div class="cq132ri"><div class="cq132rl">'+(s==3?'Claimed':'Reward')+'</div><div class="cq132rn">'+r.n+'</div><div class="cq132rs">'+r.sub+'</div>'+
    '<div class="cq132rc"><span>'+CHQ132_XPI+'<b>'+hxp164(chqXP132(I,q))+'</b> XP</span><span>'+CHQ132_GPI+'<b>'+chqGold132(I,q)+'</b> gold</span></div></div></div>'}
XR.chq132=()=>{const I=chqHere132();$('xwT').textContent='🐭 Cheddar';$('xwS').textContent='Burrow-walker'+(I?' · '+I.n:'');
  if(!I){$('xwB').innerHTML='<div class="cq132say">'+CHQ132_SAY.none+'</div>';$('xwF').innerHTML='';return}
  const L=chqList132(I),st=chqState132(I);
  const line=!L.length?CHQ132_SAY.none:st.rd?CHQ132_SAY.ready:st.av?CHQ132_SAY.hi:st.ac?CHQ132_SAY.busy:CHQ132_SAY.done;
  let b='<div class="cq132say"><span class="cq132who">Cheddar</span>“'+line+'”</div><div class="cq132g">';
  const rk=q=>{const S=chqS132(q),s=S?S.s:0;return s==2?0:s==0?1:s==1?2:3};
  L.slice().sort((a,c)=>rk(a)-rk(c)).forEach(q=>{const S=chqS132(q),s=S?S.s:0;
    const obj=q.o.map((o,i)=>{const need=chqNeed132(I,o),have=S?Math.min(need,S.p[i]||0):0,pc=Math.round(have/need*100);
      return '<div class="cq132o'+(s&&have>=need?' full':'')+'"><div class="cq132ot"><span>'+o[2]+'</span><span class="cq132n">'+(s?have+' / '+need:need>1?'× '+need:'')+'</span></div>'+
        (s?'<div class="cq132ob"><i style="width:'+pc+'%"></i></div>':'')+'</div>'}).join('');
    const tag=['New','In progress','Ready','Done'][s],btn=!s?'<button class="pri cq132bt" data-cqa="'+q.id+'">Accept quest</button>':s==1?'<button class="cq132bt" disabled>In progress…</button>':
      s==2?'<button class="pri cq132bt cq132go" data-cqt="'+q.id+'">Claim reward</button>':'';
    b+='<div class="cq132 s'+s+'"><div class="cq132h"><b>'+q.t+'</b><span class="cq132tag">'+tag+'</span></div><div class="cq132d">'+q.d+'</div>'+obj+chqRwHTML132(I,q,s)+btn+'</div>'});
  $('xwB').innerHTML=b+'</div>';
  $('xwF').innerHTML=(st.av>1?'<button class="pri" data-cqall="1">Accept all</button> ':'')+'<span class="mut dtl">Quests only count while you are in '+I.n+'; your progress is kept if you leave.</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='chq132')return;const t=e.target.closest('[data-cqa],[data-cqt],[data-cqall]');if(!t||t.disabled)return;const ds=t.dataset;
  if(ds.cqa)chqAccept132(ds.cqa);
  if(ds.cqt)chqTurnIn132(ds.cqt);
  if(ds.cqall)chqList132(chqHere132()).forEach(q=>{if(!chqS132(q))chqAccept132(q.id)});
  try{hud()}catch(_){}chqTrk132();rX()});

// ---------------- the tracker: this instance's accepted quests ----------------
(function(){const st=document.createElement('style');st.textContent=`
#xw .cq132say{position:relative;margin:2px 0 12px;padding:10px 14px 10px 14px;border-left:3px solid #c9a24a;background:linear-gradient(90deg,rgba(201,162,74,.12),rgba(201,162,74,0));font-family:'IM Fell English SC',Georgia,serif;font-size:1.02rem;color:#eadcb8;line-height:1.45}
#xw .cq132who{display:block;font-family:Cinzel,Georgia,serif;font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:#c9a24a;margin-bottom:2px}
#xw .cq132g{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:10px}
#xw .cq132{display:flex;flex-direction:column;gap:7px;border:1px solid rgba(201,162,74,.26);background:linear-gradient(180deg,rgba(38,28,20,.92),rgba(16,11,8,.92));border-radius:6px;padding:11px 12px 12px;box-shadow:inset 0 1px 0 rgba(255,230,170,.06),0 3px 10px rgba(0,0,0,.35)}
#xw .cq132.s2{border-color:#e0b450;box-shadow:0 0 0 1px rgba(240,204,114,.35) inset,0 0 18px rgba(240,190,80,.18)}
#xw .cq132.s3{opacity:.62}
#xw .cq132h{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
#xw .cq132h b{font-family:Cinzel,Georgia,serif;font-size:.95rem;color:#f0cc72;letter-spacing:.02em}
#xw .cq132tag{flex:none;font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;padding:2px 7px;border-radius:99px;border:1px solid rgba(201,162,74,.4);color:#c9a24a}
#xw .s0 .cq132tag{background:rgba(201,162,74,.16);color:#f0cc72}
#xw .s1 .cq132tag{border-color:rgba(150,180,220,.4);color:#a8c4e8}
#xw .s2 .cq132tag{background:#c9a24a;color:#1a1208;border-color:#c9a24a}
#xw .s3 .cq132tag{border-color:rgba(140,210,130,.4);color:#9be08f}
#xw .cq132d{font-size:.8rem;color:#b9a888;font-style:italic;line-height:1.4}
#xw .cq132o{padding:5px 8px;border-radius:4px;background:rgba(255,255,255,.035);font-size:.8rem}
#xw .cq132ot{display:flex;justify-content:space-between;gap:8px}
#xw .cq132o.full .cq132ot{color:#9be08f}
#xw .cq132n{font-variant-numeric:tabular-nums;color:#d8c49a}
#xw .cq132ob{height:5px;margin-top:4px;border-radius:99px;background:rgba(0,0,0,.55);overflow:hidden}
#xw .cq132ob i{display:block;height:100%;background:linear-gradient(90deg,#8a6a2a,#f0cc72)}
#xw .cq132o.full .cq132ob i{background:linear-gradient(90deg,#3a8a4a,#9be08f)}
#xw .cq132rw{display:flex;align-items:center;gap:12px;margin-top:3px;padding:10px 12px;border-radius:6px;border:1px solid rgba(201,162,74,.32);background:radial-gradient(120% 140% at 0% 50%,rgba(90,60,110,.28),rgba(10,7,6,.7) 60%),rgba(0,0,0,.35)}
#xw .cq132rw.glow{border-color:#e0b450;animation:cq132p 1.8s ease-in-out infinite}
@keyframes cq132p{50%{box-shadow:0 0 16px rgba(240,190,80,.35),inset 0 0 12px rgba(240,190,80,.15)}}
#xw .cq132ic{flex:none;width:72px;height:72px;filter:drop-shadow(0 3px 5px rgba(0,0,0,.6))}
#xw .cq132ri{min-width:0;flex:1}
#xw .cq132rl{font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;color:#8a7c66}
#xw .cq132rn{font-family:Cinzel,Georgia,serif;font-size:1.02rem;font-weight:700;color:#f2e2b8;line-height:1.2;margin-top:1px}
#xw .cq132rs{font-size:.74rem;color:#a39378;margin-top:1px}
#xw .cq132rc{display:flex;flex-wrap:wrap;gap:6px 10px;margin-top:7px}
#xw .cq132rc span{display:inline-flex;align-items:center;gap:5px;padding:3px 9px 3px 5px;border-radius:99px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.08);font-size:.78rem;color:#c8b898}
#xw .cq132rc b{font-size:.95rem;color:#fff1cc;font-variant-numeric:tabular-nums}
#xw .cq132si{width:18px;height:18px;flex:none}
#xw .cq132bt{width:100%;padding:7px 10px;font-size:.82rem;margin-top:2px}
#xw .cq132go{animation:cq132p 1.8s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){#xw .cq132rw.glow,#xw .cq132go{animation:none}}
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
  const comp=typeof party!='undefined'&&party.slice(0,actN141()).some(c=>c&&c.emp&&c.h>0);   // empowering only, not companion buff spells
  const food=B.some(b=>b.food&&b.k&&SUP[b.k]&&SUP[b.k].c=='food'&&b.t>t),bard=B.some(b=>b.n=='Inspired'&&b.t>t);return {comp,food,bard}}
function chqKill132(e,C,was){if(!e||e.dprop||e.wv)return;
  if(C&&!C.raid&&!was&&campCleared(C)){chqEv132('camp',1);chqEv132('allCamps',1,C.j!=null?C.j:C.i)}
  if(chqRemote132()||e.mir)return;
  if(e.c&&e.c.al)chqEv132('elite',1);
  const b=chqBuffKind132();if(b.comp)chqEv132('empKill',1);if(b.food)chqEv132('foodKill',1);if(b.bard)chqEv132('bardKill',1);
  const w=typeof eq!='undefined'&&eq.weapon;if(w&&w.up>=2&&e.lhH&&nowP()-e.lhH<3000)chqEv132('forgeKill',1)}
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
{const f=kqrUp;kqrUp=function(n){const rk=()=>{try{const a=kqsFind(hero.cls,n);return a?kqrRank(a):0}catch(_){return 0}},r0=rk();const r=f.apply(this,arguments);try{const r1=rk();if(r1>r0&&r1>=2)chqEv132('ability',1)}catch(_){}return r}}
{const f=breakBoulder;breakBoulder=function(S){const was=!S||S.broken;const r=f.apply(this,arguments);try{if(!was&&S.broken)chqEv132('secret',1)}catch(_){}return r}}
if(typeof digTreasure=='function'){const f=digTreasure;digTreasure=function(m){const had=m&&tmaps.includes(m);const r=f.apply(this,arguments);try{if(had&&!tmaps.includes(m))chqEv132('secret',1)}catch(_){}return r}}
// a Tier 2+ egg arriving in the egg bag (loot, fishing, shops, citizens...), watched like the runes; Cheddar's own reward eggs don't count
function chqEggs132(){if(typeof eggs=='undefined')return;const S=CHQ132.egS||(CHQ132.egS=new WeakSet()),first=!CHQ132.egI;CHQ132.egI=1;
  eggs.forEach(e=>{if(!e||typeof e!='object'||S.has(e))return;S.add(e);if(!first&&(e.tier|0)>=1&&!e.chq)chqEv132('egg2',1)})}
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
