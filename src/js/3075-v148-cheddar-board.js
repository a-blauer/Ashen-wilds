// ================= v148: Cheddar's quest board in Duskhold =================
// Cheddar and his burrows are gone from the zone instances. He now keeps a quest board in the Grand Square, east of the plaza
// (CHQ148.at, town-local), standing on a crate beside it. The board offers the quests of every zone whose portal is open
// (pUnlocked): one tab per zone. A quest counts wherever it makes sense: things done out in the world (kills, camps, chests,
// gathering, fishing, Sovereigns) count in ANY instance of that quest's zone; things done in menus or on the road (fusing,
// feeding, ranking an ability, socketing a rune, riding) count anywhere. Accepting and turning in happen at the board.
//  - Quests: CHQD148[zone] = [{id,t,d,o:[[kind,count,label]],df,rw,w}]; df 1..4 = Easy · Medium · Hard · Heroic (CHQ148_DF):
//    the reward grows with it (XP and gold ×w, gear rarity and count, an egg on Heroic). The v132 quests of Kindlelight and
//    Hillside Crest keep their ids (so saved progress and finished quests carry over) and moved to their zone's list.
//  - State stays in CHQ132.st (saved as x2.chq, v148). A v132 save's "every camp" progress counted one instance's 3 camps;
//    it starts again, as the quest now wants all 9 of the zone.
//  - Gold "!" over Cheddar = a quest on offer in an open zone; "?" = one ready to turn in. The minimap shows him in town.
//  - Tracker (#chqt132): out in a zone its active quests, in Duskhold the ones ready to turn in and the rest in short.
var CHQ148={at:[6.3,5.4],ry:0,P:null,board:null,col:[],tab:null,mk:'',t:0,v:148};
var CHQ148_DF={1:{n:'Easy',s:'★',w:1,r:1,n2:1},2:{n:'Medium',s:'★★',w:1.8,r:2,n2:1},3:{n:'Hard',s:'★★★',w:3,r:2,n2:2},4:{n:'Heroic',s:'★★★★',w:5,r:3,n2:2,egg:1}};
// objective kinds that count anywhere (the rest only inside the quest's zone)
var CHQ148_ANY={fuse:1,catFuse:1,feed:1,ability:1,rune:1,mount:1};
var CHQD148={};
(function(){const O=CHQ132_ID;
  const old=(id,df,rw)=>{const q=O[id];if(!q)return null;q.df=df;if(rw)q.rw=rw;return q};
  CHQD148={
  0:[old('k1a',1),old('k1b',1),old('k1c',1),old('k1d',1),old('k1e',1),old('k3b',1),
     old('k2a',2),old('k2b',2),old('k2c',2),old('k2d',2),old('k3c',2),
     {id:'c0a',t:'Spoils of the Hollow',d:'Those camps sit on hoards. Clear them and crack the chests at their hearts. Four will do.',o:[['chest',4,'Camp chests opened']],df:2,rw:'gear'},
     old('k3a',3),
     {id:'c0b',t:'The Long Night',d:'Kindlelight never sleeps, and neither should you. Sixty of the things that crawl about out there. Any of them.',o:[['kill',60,'Creatures slain in Kindlelight']],df:3,rw:'weapon'},
     {id:'c0c',t:'Every Fire Put Out',d:'Nine camps across the three roads. Clear every single one. I’ll know if you skip one.',o:[['allCamps',9,'Kindlelight camps cleared']],df:3,rw:'chest'},
     {id:'c0d',t:'The Hundred Eyes',d:'Argus watches the whole forest from his den. Close his eyes for good. Then do it again, to be sure.',o:[['boss',2,'Argus defeated']],df:4,rw:'weapon'}],
  1:[old('h1b',1),old('h2c',1),
     {id:'c1a',t:'Fibre for the Ropes',d:'My pulley ropes are fraying. Twenty bundles of plant fibre from the plains bushes.',o:[['fiber',20,'Plant Fibre gathered']],df:1,rw:'boots'},
     old('h1c',2),old('h2a',2),old('h2b',2),old('h3a',2),old('h3b',2),
     {id:'c1b',t:'Rust-Red Seams',d:'The forge eats ore faster than I can steal it. Fifteen iron ore from the crest rocks.',o:[['iron',15,'Iron Ore mined']],df:2,rw:'helm'},
     old('h1a',3),
     {id:'c1c',t:'Crowns of the Crest',d:'The elites up here strut about like kings. Topple three of them.',o:[['elite',3,'Elites slain on the Crest']],df:3,rw:'weapon'},
     {id:'c1d',t:'Grass Fire',d:'Eighty of the beasts that roam these hills. That should thin them out a little.',o:[['kill',80,'Creatures slain on the Crest']],df:3,rw:'chest'},
     {id:'c1e',t:'Mother of Serpents',d:'The Crest Hydra lays her eggs in my favourite cave. Put her down. Twice. Heads grow back.',o:[['boss',2,'The Crest Hydra defeated']],df:4,rw:'weapon'}],
  2:[{id:'c2a',t:'Stone for the Hearths',d:'Summit stone holds heat like nothing else. Twenty pieces, if your arms still work in the cold.',o:[['stone',20,'Stone gathered']],df:1,rw:'boots'},
     {id:'c2b',t:'Ice Fishing',d:'Six fish from the summit’s water. Bring them before they freeze solid in your pack.',o:[['fish',6,'Fish caught']],df:1,rw:'egg'},
     {id:'c2c',t:'Frostbitten',d:'Thirty of the frozen things up there. Mind the cliffs.',o:[['kill',30,'Creatures slain on the Summit']],df:1,rw:'helm'},
     {id:'c2d',t:'Shards of the Eye',d:'Crystals grow in the summit’s cracks. Eight shards. They hum when you hold them, that’s normal.',o:[['crystal',8,'Crystal Shards mined']],df:2,rw:'chest'},
     {id:'c2e',t:'Three Cold Camps',d:'Three camps, any three. Burn them out and warm your hands on the ashes.',o:[['camp',3,'Summit camps cleared']],df:2,rw:'weapon'},
     {id:'c2f',t:'Plunder on the Ice',d:'Open five camp chests on the summit. Whatever is inside is yours; the chests are mine. Just kidding.',o:[['chest',5,'Camp chests opened']],df:2,rw:'gear'},
     {id:'c2g',t:'Kings of the Cold',d:'Five elites. They burn gold even in the snow, you can’t miss them.',o:[['elite',5,'Elites slain on the Summit']],df:3,rw:'weapon'},
     {id:'c2h',t:'The Whole Mountain',d:'Every camp on the summit, all nine. Then we talk about the wraith.',o:[['allCamps',9,'Summit camps cleared']],df:3,rw:'chest'},
     {id:'c2i',t:'The Rime Wraith',d:'A ghost that freezes the breath in your chest. Lay it to rest twice and I’ll stop having nightmares.',o:[['boss',2,'The Rime Wraith defeated']],df:4,rw:'weapon'}],
  3:[{id:'c3a',t:'Shade Money',d:'Thirty-five of whatever crawls out of the dunes. Bring water.',o:[['kill',35,'Creatures slain in the Sands']],df:1,rw:'boots'},
     {id:'c3b',t:'Oasis Catch',d:'Six fish from the oasis pools. Yes, there are fish in the desert. Don’t think about it.',o:[['fish',6,'Fish caught']],df:1,rw:'egg'},
     {id:'c3c',t:'Sandstone',d:'Twenty-five stone from the Searing Sands. The good stuff, sun-baked.',o:[['stone',25,'Stone gathered']],df:1,rw:'helm'},
     {id:'c3d',t:'Gold in the Water',d:'Fish up two gold pouches from the oasis. People drop the strangest things when they’re thirsty.',o:[['pouch',2,'Gold pouches fished up']],df:2,rw:'gear'},
     {id:'c3e',t:'Three Burning Tents',d:'Three camps. The ones with the most banners, ideally. Show-offs.',o:[['camp',3,'Sands camps cleared']],df:2,rw:'weapon'},
     {id:'c3f',t:'Sun-Gilded Hunters',d:'Six elites. The sun makes them proud; make them humble.',o:[['elite',6,'Elites slain in the Sands']],df:3,rw:'chest'},
     {id:'c3g',t:'Desert Sweep',d:'Every camp of the Sands, all nine of them, and a hundred and twenty creatures besides.',o:[['allCamps',9,'Sands camps cleared'],['kill',120,'Creatures slain in the Sands']],df:3,rw:'weapon'},
     {id:'c3h',t:'The Endless',d:'Ssith’ra coils under the dunes and swallows caravans whole. Bring it down twice.',o:[['boss',2,'Ssith’ra defeated']],df:4,rw:'weapon'}],
  4:[{id:'c4a',t:'Bog Lanterns',d:'Glow caps from the Dirge. Ten. They glow brighter there, it’s the rot.',o:[['glow',10,'Glow Caps picked']],df:1,rw:'boots'},
     {id:'c4b',t:'Mud and Bones',d:'Forty of the things in the mire. Count them, I won’t.',o:[['kill',40,'Creatures slain in the Dirge']],df:1,rw:'helm'},
     {id:'c4c',t:'Swamp Supper',d:'Eight fish from the black water. Ugly ones. The uglier the tastier.',o:[['fish',8,'Fish caught']],df:1,rw:'egg'},
     {id:'c4d',t:'Rotten Hoards',d:'Six camp chests from the Dirge. Hold your nose when you open them.',o:[['chest',6,'Camp chests opened']],df:2,rw:'gear'},
     {id:'c4e',t:'Torches in the Fog',d:'Four camps. The fog hides them; follow the smell of smoke.',o:[['camp',4,'Dirge camps cleared']],df:2,rw:'chest'},
     {id:'c4f',t:'Gilded Rot',d:'Seven elites. Rot looks very fancy in gold.',o:[['elite',7,'Elites slain in the Dirge']],df:3,rw:'weapon'},
     {id:'c4g',t:'Drain the Dirge',d:'All nine camps of the Dirge and a hundred and forty creatures. Then the swamp can breathe.',o:[['allCamps',9,'Dirge camps cleared'],['kill',140,'Creatures slain in the Dirge']],df:3,rw:'chest'},
     {id:'c4h',t:'The Rot-King',d:'The Bloated One squats on his throne of muck. Burst him twice. Stand well back.',o:[['boss',2,'The Bloated One defeated']],df:4,rw:'weapon'}],
  5:[{id:'c5a',t:'Embers and Ash',d:'Forty-five of the Citadel’s guards and beasts. They won’t miss a few.',o:[['kill',45,'Creatures slain in the Citadel']],df:1,rw:'helm'},
     {id:'c5b',t:'Crimson Stone',d:'Thirty stone from the Citadel’s ruins. It still smells of smoke.',o:[['stone',30,'Stone gathered']],df:1,rw:'boots'},
     {id:'c5c',t:'The King’s Treasury',d:'Seven camp chests inside the Citadel. A king’s soldiers carry a king’s pay.',o:[['chest',7,'Camp chests opened']],df:2,rw:'gear'},
     {id:'c5d',t:'Breach the Barracks',d:'Five camps of the Crimson King’s soldiers. Kick the doors in.',o:[['camp',5,'Citadel camps cleared']],df:2,rw:'weapon'},
     {id:'c5e',t:'The Royal Guard',d:'Eight elites. The king’s finest. Prove they aren’t.',o:[['elite',8,'Elites slain in the Citadel']],df:3,rw:'chest'},
     {id:'c5f',t:'Siege of the Citadel',d:'Every camp of the Citadel, all nine, and a hundred and sixty of its defenders.',o:[['allCamps',9,'Citadel camps cleared'],['kill',160,'Creatures slain in the Citadel']],df:3,rw:'weapon'},
     {id:'c5g',t:'The Crimson King',d:'Lord Vaelric. The end of every road. Beat him three times and I’ll tell everyone you’re my favourite.',o:[['boss',3,'Lord Vaelric defeated']],df:4,rw:'weapon'}]};
  for(const z in CHQD148)CHQD148[z]=CHQD148[z].filter(Boolean).map(q=>{q.z=+z;q.ik='z'+z;if(!q.rw)q.rw='gear';CHQ132_ID[q.id]=q;return q})})();

// ---------------- where and what ----------------
function chq148Zones(){return PMAP.map((p,z)=>z).filter(z=>typeof pUnlocked=='function'?pUnlocked(z):z==0)}
function chq148Town(){try{return townAt(pl.position.x,pl.position.z,0)===0}catch(_){return false}}
function chq148Zone(){const I=chqHere132();return I?I.z:-1}
chqList132=function(I){return I?(CHQD148[I.z]||[]):[]};
function chq148State(z){const L=z==null?[].concat(...chq148Zones().map(q=>CHQD148[q]||[])):(CHQD148[z]||[]);let av=0,rd=0,ac=0,dn=0;
  L.forEach(q=>{const S=chqS132(q),s=S?S.s:0;if(!s)av++;else if(s==1)ac++;else if(s==2)rd++;else dn++});return {n:L.length,av,rd,ac,dn}}
chqState132=function(I){return chq148State(I?I.z:null)};
function chq148Need(q,o){return o[0]=='allCamps'?Math.max(1,(PMAP[q.z]&&PMAP[q.z].cl&&PMAP[q.z].cl.length)||o[1]):o[1]}
chqNeed132=function(I,o){return o[1]};
function chq148Lv(z){let m=1;try{PMAP[z].ins.forEach(I=>{if(I&&I.lv)m=Math.max(m,I.lv[1])})}catch(_){}return m}
// ---------------- progress ----------------
// z: the zone the thing happened in (null = where the hero stands now)
chqEv132=function(kind,n,arg,z){if(z==null)z=chq148Zone();let ch=0;
  chq148Zones().forEach(qz=>(CHQD148[qz]||[]).forEach(q=>{const S=chqS132(q);if(!S||S.s!==1)return;let hit=0;
    q.o.forEach((o,i)=>{if(o[0]!==kind)return;if(!CHQ148_ANY[kind]&&qz!==z)return;const need=chq148Need(q,o);
      if(kind=='allCamps'){S.cj=S.cj||[];if(arg==null||S.cj.includes(arg))return;S.cj.push(arg);S.p[i]=Math.min(need,S.cj.length)}
      else S.p[i]=Math.min(need,(S.p[i]||0)+(n||1));hit=1;ch=1});
    if(hit&&q.o.every((o,i)=>(S.p[i]||0)>=chq148Need(q,o))){S.s=2;
      try{pickup({ic:'🐭',t:'Quest complete: '+q.t,col:'#f0cc72',sub:'Turn it in at Cheddar’s board in Duskhold',r:3})}catch(_){}try{sfx('chime')}catch(_){}}}));
  if(ch){CHQ132.trkK='';chqTrk132()}};
// kills: the camp a kill clears counts by its own index (C.i) for "every camp"
chqKill132=function(e,C,was){if(!e||e.dprop||e.wv)return;
  if(C&&!C.raid&&!was&&campCleared(C)){let z=null;try{z=INSL[C.ig].z}catch(_){}chqEv132('camp',1,null,z);chqEv132('allCamps',1,C.i,z)}
  if(chqRemote132()||e.mir||e.minion)return;
  chqEv132('kill',1);if(e.c&&e.c.al)chqEv132('elite',1);
  const b=chqBuffKind132();if(b.comp)chqEv132('empKill',1);if(b.food)chqEv132('foodKill',1);if(b.bard)chqEv132('bardKill',1);
  const w=typeof eq!='undefined'&&eq.weapon;if(w&&w.up>=2&&e.lhH&&nowP()-e.lhH<3000)chqEv132('forgeKill',1)};
// more gathering kinds (v132 watched wood, stone, glow caps and iron)
{const f=gFinish;gFinish=function(tg){const K=['fiber','crystal','petals','bone','clay'],a={};K.forEach(k=>a[k]=mats[k]||0);const r=f.apply(this,arguments);
  try{K.forEach(k=>{const d=(mats[k]||0)-a[k];if(d>0)chqEv132(k,d)})}catch(_){}return r}}
// a Sovereign falls (each fight counts)
{const f=bossDefeated;bossDefeated=function(e){let z=null;try{const A=arenaOf(e);z=A?A.i:null}catch(_){}const r=f.apply(this,arguments);try{if(z!=null)chqEv132('boss',1,null,z)}catch(_){}return r}}
// a camp chest opened (v148 camp clears, 3071)
{const f=openChest;openChest=function(c){const live=CHESTS.includes(c),C=c&&c.camp;const r=f.apply(this,arguments);try{if(live&&C)chqEv132('chest',1,null,INSL[C.ig].z)}catch(_){}return r}}

// ---------------- rewards ----------------
function chq148XP(q){const L=chq148Lv(q.z),D=CHQ148_DF[q.df]||CHQ148_DF[1];return Math.max(5,Math.round((8+12*L)*.6375*(typeof ECON96!='undefined'?ECON96.xp:1)*(14+L)*.7*D.w*(q.w||1)))}
function chq148Gold(q){const L=chq148Lv(q.z),D=CHQ148_DF[q.df]||CHQ148_DF[1];return Math.max(10,Math.round((3+1.4*L)*.65*(16+L)*D.w*(q.w||1)))}
function chq148ILv(q){return Math.max(1,Math.min(chq148Lv(q.z)+(q.df>=4?1:0),hero.lvl+(q.df>=4?3:2)))}
function chq148Gear(q,sl){const D=CHQ148_DF[q.df]||CHQ148_DF[1],lv=chq148ILv(q);let it=null;
  for(let i=0;i<12&&!it;i++){try{const o={cls:hero.cls,minR:D.r};if(sl)o.sl=sl;const c=genItem(lv,o);if(c&&(!sl||itT(c).sl===sl)&&(sl!='weapon'||fitsCls(itT(c),hero.cls)))it=c}catch(_){}}
  if(!it)try{it=genItem(lv,{cls:hero.cls,minR:D.r})}catch(_){}return it}
function chq148Egg(q){return chqEgg132({z:q.z,k:q.df>=3?2:q.df>=2?1:0})}
chqReward132=function(I,q){const D=CHQ148_DF[q.df]||CHQ148_DF[1],xp=chq148XP(q),g=chq148Gold(q);
  for(let n=0;n<D.n2;n++){if(q.rw=='egg'&&n==0){const eg=chq148Egg(q);if(eg){try{(CHQ132.egS||(CHQ132.egS=new WeakSet())).add(eg)}catch(_){}take({kind:'egg',data:eg});try{dex.egg.add(eg.sp)}catch(_){}}}
    else{const it=chq148Gear(q,n==0&&q.rw!='gear'&&q.rw!='egg'?q.rw:null);if(it)take({kind:'gear',data:it})}}
  if(D.egg&&q.rw!='egg'){const eg=chq148Egg(q);if(eg){try{(CHQ132.egS||(CHQ132.egS=new WeakSet())).add(eg)}catch(_){}take({kind:'egg',data:eg})}}
  gold+=g;chqGiveXP132(xp);try{dn(pl.position,'+'+xp+' XP','#c4b5fd',0,1600);dn(pl.position,'+'+g+' 🪙','#fbbf24',-26,1600)}catch(_){}
  say('🐭 <b>'+q.t+'</b> turned in: +'+xp+' XP, +'+g+' gold.')};
function chq148RwInfo(q){const D=CHQ148_DF[q.df]||CHQ148_DF[1],R=RAR[D.r]||['Uncommon','#6ee7b7'],lv=chq148ILv(q);
  const nm={weapon:'Weapon',chest:'Chest Armour',helm:'Helm',boots:'Boots',gear:'Gear'}[q.rw]||'Gear';
  if(q.rw=='egg')return {n:'Mystery Egg'+(D.n2>1?' + Gear':''),sub:'A '+PMAP[q.z].n+' companion egg',col:'#f0cc72',ic:'egg'};
  return {n:'Mystery '+nm+(D.n2>1?' + 1 more':'')+(D.egg?' + Egg':''),sub:'<span style="color:'+R[1]+'">'+R[0]+' or better</span> · item level '+lv,col:R[1],ic:q.rw=='gear'?'chest':q.rw}}

// ---------------- accepting and turning in (at the board) ----------------
function chq148AtBoard(){const s=chq148Spot();if(!s||!chq148Town())return false;return Math.hypot(pl.position.x-s.cx,pl.position.z-s.cz)<4.2||Math.hypot(pl.position.x-s.bx,pl.position.z-s.bz)<4.2}
chqAccept132=function(id){const q=CHQ132_ID[id];if(!q||q.z==null||chqS132(q)||!chq148Zones().includes(q.z))return;
  CHQ132.st[id]={s:1,p:q.o.map(()=>0)};say('🐭 Quest accepted: <b>'+q.t+'</b>');try{sfx('chime')}catch(_){}CHQ132.trkK=''};
chqTurnIn132=function(id){const q=CHQ132_ID[id],S=q&&chqS132(q);if(!q||!S||S.s!==2||!chq148AtBoard())return;
  S.s=3;chqReward132(null,q);try{mSfx('rare')}catch(_){try{sfx('chime')}catch(__){}}CHQ132.trkK='';try{hud()}catch(_){}};

// ---------------- the board and Cheddar in the Grand Square ----------------
chqPosts135=function(){return []};    // no Cheddar in the instances any more
chqNear132=function(){return null};
function chq148Spot(){if(CHQ148.sp)return CHQ148.sp;const T=TOWNS[0];if(!T)return null;const [x,z]=CHQ148.at;
  // the board faces the plaza (towards the arrival spot); Cheddar stands on a crate at its plaza-side end
  const ry=Math.atan2(0-x,8.4-z),c=Math.cos(ry),s=Math.sin(ry),L=(lx,lz)=>[T.cx+x+lx*c+lz*s,T.cy+z-lx*s+lz*c];
  const ch=L(-1.75,.25),fr=L(0,1.6);return CHQ148.sp={bx:T.cx+x,bz:T.cy+z,ry,cx:ch[0],cz:ch[1],fx:fr[0],fz:fr[1],L}}
function chq148BoardKit(k){
  // two posts, the planked board in a frame, a little shingle roof, pinned notices with wax seals, a hanging lantern, a crate
  [-1.15,1.15].forEach(x=>k.as('bark',()=>k.L('c',TWC.woodD,[x,0,0],[x,2.75,0],.085,'log')));
  k.as('board',()=>k.p('c',0x4a3420,'box',0,1.6,0,2.2,1.45,.08,0,0,0,.02));
  [[0,2.36,2.32,.1],[0,.86,2.32,.1]].forEach(([x,y,w,h])=>k.as('wood',()=>k.p('c',TWC.woodD,'box',x,y,.02,w,h,.12,0,0,0,.02)));
  [-1.12,1.12].forEach(x=>k.as('wood',()=>k.p('c',TWC.woodD,'box',x,1.6,.02,.1,1.6,.12,0,0,0,.02)));
  twGable(k,0x3a2c2a,2.6,.7,.38,.18,2.72);
  const N=[[-.72,1.95,.08],[-.22,2.02,-.06],[.3,1.97,.05],[.78,2.0,-.08],[-.6,1.38,-.05],[-.05,1.32,.1],[.48,1.4,-.03],[.86,1.27,.07],[-.9,1.05,.12]];
  N.forEach(([x,y,r],i)=>{const w=i%3==1?.38:.3,h=i%2?.36:.42;k.p('c',[0xe8dcc0,0xd8c8a0,0xcab88e][i%3],'box',x,y,.06,w,h,.012,0,0,r,0);
    k.p('c',0x2a2018,'box',x,y+h*.18,.068,w*.62,.012,.004,0,0,r,0);k.p('c',0x2a2018,'box',x-w*.06,y+h*.02,.068,w*.5,.01,.004,0,0,r,0);
    k.p(i%4?'m':'c',i%4?TWC.iron:0x8a1a1a,i%4?'box':'sph',x,y+h*.42,.075,.03,.03,.02,0,0,0,0)});
  // the gold "!" notice at the top: Cheddar's own
  k.p('c',0xf0d890,'box',.02,2.62,.08,.36,.2,.012,0,0,0,0);k.p('m',TWC.gold,'box',.02,2.62,.09,.05,.12,.006,0,0,0,0);
  // lantern on an iron arm off the right post
  k.L('m',TWC.iron,[1.15,2.35,0],[1.5,2.35,.12],.02,'box',0);k.L('m',TWC.iron,[1.5,2.35,.12],[1.5,2.18,.12],.008,'cyl6',0);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>k.p('m',0x2a2622,'box',1.5+a*.07,2.02,.12+b*.07,.018,.24,.018,0,0,0,0));
  k.p('m',0x2a2622,'box',1.5,2.15,.12,.18,.03,.18,0,0,0,0);k.p('m',0x2a2622,'box',1.5,1.89,.12,.18,.03,.18,0,0,0,0);k.p('g',0xffc070,'oct',1.5,2.02,.12,.07,.11,.07);
  // the crate Cheddar stands on, a sack and a coil of rope at the foot
  TWN100_crate(k,-1.75,.25,.56,.3);k.as('cloth',()=>k.p('c',0x8a7a5a,'sph',-1.05,.2,.45,.26,.24,.22,0,.5,0,.06));
  k.as('straw',()=>k.p('c',0x9a8458,'cyl8',1.55,.06,.45,.26,.1,.26,0,0,0,.04))}
function chq148Build(){const T=TOWNS[0];if(!T||!T.g||CHQ148.board)return;const s=chq148Spot();if(!s)return;
  const key='CHQ148BOARD';let k=null;if(!twHas(key)){k=twKit(14801);chq148BoardKit(k)}
  const g=twGroup(k,key);g.name='cheddarBoard';g.position.set(s.bx,T.ph,s.bz);g.rotation.y=s.ry;
  try{sign(g,[{t:'QUEST BOARD',f:'800 56px'},{t:'Cheddar’s errands, zone by zone',f:'600 26px'}],2.1,.46,'#2a1c12','#f4e2a8','#c9a24a',0,3.32,.2,0,512,120)}catch(_){}
  scene.add(g);CHQ148.board=g;
  // colliders: the board between its posts, the crate Cheddar stands on
  const c=Math.cos(s.ry),sn=Math.sin(s.ry);CHQ148.col=[{x:s.bx,z:s.bz,r:.32},{x:s.L(-.8,0)[0],z:s.L(-.8,0)[1],r:.3},{x:s.L(.8,0)[0],z:s.L(.8,0)[1],r:.3},{x:s.cx,z:s.cz,r:.42}];
  CHQ148.col.forEach(q=>{if(T.col.indexOf(q)<0)T.col.push(q)});try{if(typeof CZ103!='undefined')CZ103.ver=-1}catch(_){}
  // Cheddar himself (the v132 model), standing on the crate
  const P={ch:null,mk:null,mkK:'',wave:0,near:0};try{const C=chd132Model({game:true});C.root.scale.setScalar(CHQ132_SC);C.root.userData.noFarCull=1;
    C.root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});C.root.position.set(s.cx,T.ph+.56,s.cz);C.root.rotation.y=s.ry;scene.add(C.root);C.setPose('idle');P.ch=C}catch(e){console.warn('v148 cheddar',e)}
  P.mk=chqMarker132();scene.add(P.mk);CHQ148.P=P}
// keep the v132/v135 instance Cheddars hidden for good (in case an old session built them)
function chq148HideOld(){[CHQ132,CHQ132.e].forEach(P=>{if(!P)return;[P.ch&&P.ch.root,P.bur,P.mk].forEach(o=>{if(o)o.visible=false})})}
chqTick132=function(dt,now){chq148HideOld();const I=chqHere132(),g=I?I.g:-1;if(g!==CHQ132.g){CHQ132.g=g;CHQ132.trkK='';chqTrk132()}
  if(!CHQ148.board)chq148Build();const P=CHQ148.P;if(!P||!P.ch)return;const R=P.ch.root,s=chq148Spot(),T=TOWNS[0];
  const near=chq148Town(),d=near?Math.hypot(pl.position.x-s.cx,pl.position.z-s.cz):1e9;R.visible=near||d<80;if(!R.visible){P.mk.visible=false;return}
  const want=d<9?Math.atan2(pl.position.x-R.position.x,pl.position.z-R.position.z):s.ry;let da=want-R.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));R.rotation.y+=da*Math.min(1,dt*4);
  const st=chq148State();if(d<7&&!P.near){P.near=1;if(st.av||st.rd){P.wave=2.6;P.ch.setPose('wave')}}if(d>10)P.near=0;
  if(P.wave>0){P.wave-=dt;if(P.wave<=0)P.ch.setPose('idle')}if(d<40)P.ch.update(now/1000,Math.min(.05,dt));
  const m=P.mk,ch=st.rd?'?':st.av?'!':'';m.visible=!!ch;if(ch){if(P.mkK!==ch){P.mkK=ch;m.material.map=m.userData.tx[ch];m.material.needsUpdate=true}
    const t=now/1000,k=1+.06*Math.sin(t*4.4);m.position.set(R.position.x,R.position.y+.78*CHQ132_SC+.42+Math.sin(t*2.2)*.06,R.position.z);m.scale.set(.42*k,.52*k,1)}};
// F at the board (town prompts come from promptTick)
{const f=promptTick;promptTick=function(){const r=f.apply(this,arguments);try{if(typeof gat!='undefined'&&gat)return r;if(!chq148AtBoard())return r;const s=chq148Spot();
    const d=Math.min(Math.hypot(pl.position.x-s.cx,pl.position.z-s.cz),Math.hypot(pl.position.x-s.fx,pl.position.z-s.fz),Math.hypot(pl.position.x-s.bx,pl.position.z-s.bz));if(d>2.6)return r;
    const st=chq148State();PR={label:'F · Cheddar’s Quest Board'+(st.rd?' (quest complete!)':st.av?' (new quests)':''),fn:()=>openX('chq132')};
    const b=$('prompt');b.classList.toggle('hide',uiOpen());b.textContent=PR.label}catch(_){}return r}}
// the minimap marks him in town (the N map shows zone instances only)
{const f=chq135Here;chq135Here=function(){try{if(!CHQ148.mini||!chq148Town()||!CHQ148.P)return [];const s=chq148Spot();return [{I:null,s:{x:s.cx,z:s.cz}}]}catch(_){return []}}}
chq135St=function(){try{const S=chq148State();return S.rd?'?':S.av?'!':''}catch(_){return ''}};
{const f=miniMarks;miniMarks=function(){CHQ148.mini=1;try{return f.apply(this,arguments)}finally{CHQ148.mini=0}}}

// ---------------- the window: one tab per open zone ----------------
CHQ132_SAY.board='Psst. Down here, on the crate. Cheddar. Every portal you open, I’ve got errands for it. The harder the job, the better the pay.';
CHQ132_SAY.zone='Pick a job. Anything you do anywhere in that zone counts, whichever stretch of road you’re on.';
XR.chq132=()=>{$('xwT').textContent='🐭 Cheddar’s Quest Board';const Z=chq148Zones();
  if(CHQ148.tab==null||!Z.includes(CHQ148.tab)){const r=Z.find(z=>chq148State(z).rd);CHQ148.tab=r!=null?r:Z.find(z=>chq148State(z).av)!=null?Z.find(z=>chq148State(z).av):Z[Z.length-1]}
  const z=CHQ148.tab,st=chq148State(),zs=chq148State(z);$('xwS').textContent=PMAP[z].ic+' '+PMAP[z].n+' · '+zs.dn+' of '+zs.n+' done';
  const line=st.rd?CHQ132_SAY.ready:zs.av?CHQ132_SAY.board:zs.ac?CHQ132_SAY.busy:CHQ132_SAY.zone;
  let b='<div class="cq132say"><span class="cq132who">Cheddar</span>“'+line+'”</div><div class="tabs cq148t">';
  PMAP.forEach((p,i)=>{const u=Z.includes(i),S=u?chq148State(i):null,dot=S&&S.rd?'<i class="rd">?</i>':S&&S.av?'<i>!</i>':'';
    b+='<button class="'+(i==z?'on':'')+(u?'':' lk')+'" '+(u?'data-cq8z="'+i+'"':'disabled title="Opens with its portal"')+'>'+(u?p.ic:'🔒')+' '+p.n+dot+'</button>'});
  b+='</div><div class="cq132g">';
  const rk=q=>{const S=chqS132(q),s=S?S.s:0;return (s==2?0:s==0?1:s==1?2:3)*10+(q.df||1)};
  (CHQD148[z]||[]).slice().sort((a,c)=>rk(a)-rk(c)).forEach(q=>{const S=chqS132(q),s=S?S.s:0,D=CHQ148_DF[q.df]||CHQ148_DF[1];
    const obj=q.o.map((o,i)=>{const need=chq148Need(q,o),have=S?Math.min(need,S.p[i]||0):0,pc=Math.round(have/need*100);
      return '<div class="cq132o'+(s&&have>=need?' full':'')+'"><div class="cq132ot"><span>'+o[2]+(CHQ148_ANY[o[0]]?' <small class="mut">(anywhere)</small>':'')+'</span><span class="cq132n">'+(s?have+' / '+need:need>1?'× '+need:'')+'</span></div>'+
        (s?'<div class="cq132ob"><i style="width:'+pc+'%"></i></div>':'')+'</div>'}).join('');
    const tag=['New','In progress','Ready','Done'][s],btn=!s?'<button class="pri cq132bt" data-cq8a="'+q.id+'">Accept quest</button>':s==1?'<button class="cq132bt" disabled>In progress…</button>':
      s==2?'<button class="pri cq132bt cq132go" data-cq8t="'+q.id+'">Claim reward</button>':'';
    const r=chq148RwInfo(q);
    const rw='<div class="cq132rw'+(s==2?' glow':'')+'">'+chqIco132(r.ic,r.col,s==3)+'<div class="cq132ri"><div class="cq132rl">'+(s==3?'Claimed':'Reward')+'</div><div class="cq132rn">'+r.n+'</div><div class="cq132rs">'+r.sub+'</div>'+
      '<div class="cq132rc"><span>'+CHQ132_XPI+'<b>'+chq148XP(q)+'</b> XP</span><span>'+CHQ132_GPI+'<b>'+chq148Gold(q)+'</b> gold</span></div></div></div>';
    b+='<div class="cq132 s'+s+' df'+(q.df||1)+'"><div class="cq132h"><b>'+q.t+'</b><span class="cq148d" title="'+D.n+'">'+D.s+' '+D.n+'</span><span class="cq132tag">'+tag+'</span></div><div class="cq132d">'+q.d+'</div>'+obj+rw+btn+'</div>'});
  $('xwB').innerHTML=b+'</div>';
  $('xwF').innerHTML=(zs.av>1?'<button class="pri" data-cq8all="'+z+'">Accept all in '+PMAP[z].n+'</button> ':'')+'<span class="mut dtl">New zones join the board as their portals open. Turn finished quests in here.</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='chq132')return;const t=e.target.closest('[data-cq8a],[data-cq8t],[data-cq8all],[data-cq8z]');if(!t||t.disabled)return;const ds=t.dataset;
  if(ds.cq8z!=null)CHQ148.tab=+ds.cq8z;
  if(ds.cq8a)chqAccept132(ds.cq8a);
  if(ds.cq8t)chqTurnIn132(ds.cq8t);
  if(ds.cq8all!=null)(CHQD148[+ds.cq8all]||[]).forEach(q=>{if(!chqS132(q))chqAccept132(q.id)});
  try{hud()}catch(_){}chqTrk132();rX()});
document.head.insertAdjacentHTML('beforeend',`<style>
#xw .cq148t{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 10px}
#xw .cq148t button{position:relative;font-size:.78rem;padding:5px 10px}
#xw .cq148t button.lk{opacity:.45}
#xw .cq148t button i{font-style:normal;margin-left:5px;display:inline-block;min-width:15px;padding:0 4px;border-radius:99px;background:#c9a24a;color:#1a1208;font-weight:800;font-size:.7rem}
#xw .cq148t button i.rd{background:#f0cc72}
#xw .cq148d{flex:none;margin-left:auto;font-size:.66rem;letter-spacing:.06em;color:#d8b860;white-space:nowrap}
#xw .df3 .cq148d{color:#e8a04a}#xw .df4 .cq148d{color:#ff7a5a}
#xw .cq132.df4{border-color:rgba(255,122,90,.35)}
</style>`);

// ---------------- the tracker ----------------
chqTrk132=function(){const el=$('chqt132');if(!el)return;const z=chq148Zone(),town=chq148Town();
  const act=[].concat(...chq148Zones().map(q=>CHQD148[q]||[])).filter(q=>{const S=chqS132(q);return S&&(S.s==1||S.s==2)});
  let L=z>=0?act.filter(q=>q.z===z):town?act.slice():[];
  L.sort((a,b)=>(chqS132(b).s-chqS132(a).s)||(a.z-b.z));L=L.slice(0,6);
  const hideAll=typeof uiOpen=='function'&&uiOpen();
  const key=z+'|'+(town?1:0)+'|'+(hideAll?1:0)+'|'+L.map(q=>{const S=chqS132(q);return q.id+S.s+S.p.join(',')}).join(';');if(key===CHQ132.trkK)return;CHQ132.trkK=key;
  if(!L.length||hideAll){el.classList.add('hide');return}
  el.innerHTML='<div class="h">🐭 Cheddar · '+(z>=0?PMAP[z].n:'Quests')+'</div>'+L.map(q=>{const S=chqS132(q);
    if(S.s==2)return '<div class="q"><b>'+q.t+'</b><div class="o rd"><span>✓ Turn in at the quest board</span></div></div>';
    return '<div class="q"><b>'+(z<0?PMAP[q.z].ic+' ':'')+q.t+'</b>'+q.o.map((o,i)=>'<div class="o"><span>'+o[2]+'</span><span>'+Math.min(chq148Need(q,o),S.p[i]||0)+'/'+chq148Need(q,o)+'</span></div>').join('')+'</div>'}).join('');
  el.classList.remove('hide');chqTrkPos132()};

// ---------------- saves: a v132 save's per-instance "every camp" progress starts again ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{if(o.chq)o.chq.v=148}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const v=s&&s.chq&&s.chq.v;if(!v||v<148)for(const id in CHQ132.st){const q=CHQ132_ID[id],S=CHQ132.st[id];
      if(!q||!S||S.s!==1)continue;q.o.forEach((o,i)=>{if(o[0]=='allCamps'){S.p[i]=0;S.cj=[]}})}CHQ132.trkK=''}catch(_){}return r}}
try{chq148Build()}catch(e){console.warn('v148 board',e)}
