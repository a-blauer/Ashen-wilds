// ================= Kill Quest animation viewer =================
// Runs AFTER the game script, on the real game code: real models, real attack/ability code, real effects.
// Four tabs:
//  · Companions: every species, every evolution look: basic attack + its 4 abilities
//  · Monsters:   every creature that spawns (grouped by the zone it lives in, plus quest creatures) and each of its moves
//  · Bosses:     the six Sovereigns in their own dens and the main-quest bosses in their arenas (Vorraxis in the Seeping Lair,
//                Gorthrak in the Frozen Maw, Qarsul in the Sunken Gate yard): every move, Phase II, signature, stagger, defeat
//  · Hero:       every class as its beast, every weapon type (each combo hit, full combo) and all 17 class abilities,
//                base form (rank 1) or evolved form (rank 5, v137 evolution)
// The field stage is a quiet spot on Hillside Crest I's road; natural spawns are off, the viewer keeps only its own actors.
// Bosses are shown in their real arenas: the viewer walks the hero into the den, the real fight starts, and the AI is
// held still (no moves of its own, no walking at the hero) so each move plays only when asked for.
var KV={on:false,mode:'comp',sel:{comp:'Foxlet',mon:'hobgoblin',cls:'warrior',boss:'s0'},stage:0,wt:null,form:'base',dummy:null,mon:null,
  boss:null,P:null,tod:.32,home:{},busyT:0,orbit:{yaw:2.1,pitch:.32,dist:7.5},focus:null,loop:false,last:null,queue:[],qT:0,label:'',where:null};
(function(){
const Q=s=>document.querySelector(s),QA=s=>[].slice.call(document.querySelectorAll(s));
const now_=()=>performance.now();
const FAMI={Beast:'🐾',Earth:'⛰️',Sky:'🪶',Dragon:'🐉',Spirit:'👻',Swarm:'🕷️'};
const KINDN={bite:'Melee bite',bolt:'Projectile',nova:'Burst around it',cone:'Cone in front',beam:'Beam',rain:'Area at target',chain:'Chain',shield:'Shields an ally',heal:'Heals an ally',buff:'Buffs an ally',fan:'Spread',meteor:'Delayed strike'};
// where the hero stands for the old basic moves (newer moves carry their own range, MV[n].rmin / rmax)
const MOVED={strike:1.7,bite:1.5,spin:1.6,slam:1.8,pounce:4.2,charge:4.6,spit:5.2,throw:6,bolt:6,rainfire:6};
const RANGEDW={bow:1,staff:1,knives:1,crossbow:1,sling:1,wand:1,orb:1};
const STAGEN=['Hatchling','Stage 1','Stage 2','Stage 3'];
const ROMAN=['I','II','III'];
const STAGE_INS=5;   // INSL index of the field stage: Hillside Crest I

// ---------- the bosses: move names (the game keeps only ids; names follow each den's guide, DSTXT) ----------
const BOSSN={
  s0:{claw:'Rending Claws',claw2:'Rending Claws · backhand',snapF:'Rending Claws · snapping bite',snap:'Lunging Bite',tail:'Tail Lash',gaze:'Hundred-Eyed Gaze',
      gaze2:'Hundred-Eyed Gaze · second beam',pounce:'Leaping Pounce',whirl:'Whirling Rend',furrow:'Amber Furrow',furrow3:'Amber Furrow · three lines',
      awaken:'The Eyes Open',barrage:'Eye Barrage',flare:'Blinding Flare',sweep:'Searing Sweep',hundred:'The Hundred Eyes'},
  s1:{bite:'Fang Strike',fury:'Serpent Fury',sweep:'Neck Sweep',coil:'Coil Surge',tail:'Tail Slam',spit:'Venom Spit',rush:'Mire Rush',geyser:'Undertow',
      breath:'Venom Breath',deluge:'Venom Deluge',furyX:'Serpent Fury · every head',maelstrom:'Venom Maelstrom',sever:'Sever and Sear'},
  s2:{reap:'Reaping Sweep',reap2:'Reaping Sweep · return cut',spinR:'Reaping Spin',cleave:'Overhead Cleave',glide:'Glide Reap',nova:'Frost Nova',icicles:'Icicle Volley',
      frostbrand:'Frostbrand Rend',wraithchain:'Wraith Chains',step:"Winter's Step",prison:'Glacial Prison',maelstrom:'Rime Maelstrom',heart:'Frozen Heart'},
  s3:{snap:'Mandible Snap',snap2:'Mandible Snap · second snap',slam:'Rearing Slam',spray:'Acid Spray',charge:'Sand Charge',burrow:'Burrow',burrowH:'Burrow · head strike',
      burrowB:'Triple Burrow · second rise',burrowC:'Burrow · full surfacing',glare:'Sun Lance',sinkhole:'Sinkhole',quills:'Quill Volley',geysers:'Triple Burrow',
      spit:'Molten Spit',scars:'The Rune Scars'},
  s4:{chop:'Cleaver Chop',sweep:'Gut Sweep',stomp:'Ground Pound',vomit:'Bile Vomit',flop:'Belly Flop',hook:"Butcher's Hook",hookChop:"Butcher's Hook · chop",
      furrow:'Bone Furrow',frenzy:"Butcher's Frenzy",burst:'Pustule Burst',flop2:'Double Flop',gorge:'Gorge',feast:'The Feast'},
  s5:{combo:'Crimson Combo',lunge:'Crimson Lunge',wave:'Blood Wave',batstep:'Bat Step',nova:'Sanguine Nova',grasp:'Hemorrhage Grasp',spin:'Danse Macabre',
      awaken:'The Blood Moon',skyfall:'Skyfall',waves:'Blood Wave · three waves',combo5:'Crimson Combo · five cuts',thorns:'Thorned Procession',covenant:'Blood Covenant'},
  mb:{combo:'Scythe Rend',lunge:'Caustic Lunge',tail:'Tail Lash',geyser:'Ooze Geyser',volley:'Spine Volley',burst:'Carapace Burst',awaken:'The Seeping',
      combo5:'Frenzied Rend',eruption:'Caustic Eruption',volley2:'Double Spine Volley',siphon:'Crystal Siphon'},
  gb:{combo:'Skullbreaker',charge:'Glacier Charge',skid:'Glacier Charge · overrun and skid',spin:'Wrecking Whirl',icefall:'Cave-in Roar',hurl:'Glacier Hurl',
      stomp:'Permafrost Slam',awaken:'Glacial Fury',fury:"Warlord's Fury",hurl3:'Avalanche Hurl',storm:'Icefall Storm',rampage:'Glacier Shell',
      rleap:'Glacier Shell · one leap',rfail:'Glacier Shell · the shell holds (Avalanche)',broken:'Shattered'},
  qs:{pummel:'Sandstone Pummel',surge:'Dune Surge',lash:'Vortex Lash',grasp:'Grasping Sands',blast:'Sandblast',collapse:'Collapse',awaken:'The Storm Wakes',
      fury:'Avalanche Pummel',surge2:'Twin Surge',spires:'Buried Spires',heart:'Heart of the Dune',hfail:'Heart of the Dune · time runs out (Sandstorm Burial)',broken:'Torn Out'}};
const BOSSN0={intro:'Entrance',awaken:'Awakening (Phase II)',stagger:'Staggered',broken:'Broken (signature stopped)',reach141:'Reach'};
const BOSSD0={intro:'What it does when the fight starts.',awaken:'At about half health it changes: Phase II, a changed den and new moves.',
  stagger:'A full posture bar: it reels for a few seconds and takes +35% damage.',broken:'What happens when every prop of its signature move is destroyed in time.',
  reach141:'Used when you keep your distance: three aimed eruptions under you.'};
const MBD={combo:'Close, in front: right cut, left cut, a pause, then a crossing double cut down a line.',lunge:'Mid range: low, scythes swept back, then a long dash through you; acid pools on his path.',
  tail:'Behind or beside him: the tail winds to one side and whips round in a ring.',geyser:'He stabs both scythes into the floor; three geysers erupt under you, each aimed ahead of you.',
  volley:'From afar: the dorsal spines bristle and five spines fly out in a fan. Stand in a gap.',burst:'Close: he curls up and trembles, a close blast, then his scales fire along eight lanes, then eight more.',
  awaken:'At 55%: a roar, his seams split and the edge of the lair floods with ooze.',combo5:'Phase II: five cuts and a leaping double cut.',eruption:'Phase II: a ring of geysers closing on you.',
  volley2:'Phase II: two spine fans in a row.',siphon:'Phase II: he leaps to the crystal and drinks from it; burst the three ooze sacs or the floor floods.'};
const GBD={intro:'Walk close to his throne: a wall of ice seals the cave and he rises with his maul.',
  combo:'Close, in front: a diagonal maul smash, a frost-fist backhand, a pause, then an overhead slam down a line.',
  charge:'Mid range: he drops his shoulder, the lane shows where he will run, then he charges straight through; frost patches on his path.',
  skid:'A missed charge: he overruns, drives his maul into the floor to stop and is stuck (Rimelock): hits on the glowing crack in his back deal ×1.5.',
  spin:'Behind or beside him: he winds the maul out and spins a full turn, a ring around him.',
  icefall:'He beats his chest and roars at the ceiling: four icicles fall on you, each aimed ahead of you.',
  hurl:'From afar: he tears a boulder of ice out of the floor and lobs it; it bursts into shards.',
  stomp:'Close: both fists into the floor, a close blast, then ice spikes erupt in a ring further out.',
  awaken:'At 55%: a roar, the glacier on his back flares and icicles keep falling from the ceiling for the rest of the fight.',
  fury:'Phase II: smash, backhand, smash, uppercut and a leaping slam.',hurl3:'Phase II: three ice boulders in a row.',
  storm:'Phase II: a ring of icicles closing in on you.',
  rampage:'Signature: armoured in glacier ice he leaps at you three times; after each landing he is Rimelocked: strike the crack in his back twice.',
  rleap:'One leap of the Glacier Shell: a ring marks the landing, a blast, then his maul freezes in the floor.',
  rfail:'Fewer than three cracks: the shell holds, he heals and the ceiling comes down; only the rock shelters are safe.',
  broken:'Three cracks: the shell bursts and he reels in a long stagger.'};
const QSD={intro:'The three heaps of sand pour into a vortex in the yard and he rises out of it; a wall of whirling sand closes the yard.',
  pummel:'Close, in front: an overhead smash with the obelisk, a left hook, a pause, then a hammer blow down a line that throws up sand spikes.',
  surge:'Mid range: he pours himself into the ground and comes through you as a wave of sand; quicksand on his path.',
  lash:'Behind or beside him: his vortex flares and he whirls a full turn, a ring around him.',
  grasp:'Fists into the ground: three hands of sand burst up under you; a hand that catches you buries you (dash free).',
  blast:'From afar: his chest opens and a fan of five sand bolts flies out. Stand in a gap.',
  collapse:'Close: he slumps into his vortex (a close blast) and bursts back up in a ring further out.',
  awaken:'At 55%: a roar, the storm thickens, the sand wall closes in and dust devils wander the yard.',
  fury:'Phase II: five blows and a leaping slam.',surge2:'Phase II: a surge through you and back again.',spires:'Phase II: a ring of spikes closing in, then one under you.',
  heart:'Signature: he sinks into the sand, three mounds rise and his heart flies into one; the mounds change places. Break the one whose glow flickers. Here nobody breaks it, so it runs to the time-out (about 20 s).',
  hfail:'Time runs out: he rises healed, three stone slabs burst up and the Sandstorm Burial scours everything not behind them.',
  broken:'The right mound broken: he is torn out of the ground in a long stagger.'};
const BOSSD={mb:MBD,gb:GBD,qs:QSD};
// moves that only happen as part of another one (named after it), and moves the list leaves out (a 16 s wait under the sand)
const BOSSFOL={gb:{skid:'charge',rleap:'rampage',rfail:'rampage'},qs:{hfail:'heart'}};
const BOSSSUB={gb:['rleap','rfail'],qs:['hfail']},BOSSHIDE={qs:['hidden']};
const KVB=[0,1,2,3,4,5].map(i=>({k:'s'+i,i})).concat([{k:'mb',i:'mb'},{k:'gb',i:'gb'},{k:'qs',i:'qs'}]);
const QBOSS=['mb','gb','qs'];
function bossInfo(k){if(k=='mb')return {n:'Vorraxis',t:'the Seeping King',ic:'🦂',zone:'Kindlelight II',den:'The Seeping Lair',kind:'Main-quest boss'};
  if(k=='gb')return {n:'Gorthrak',t:'the Glacierback',ic:'🧌',zone:(PMAP[2]&&PMAP[2].ins[0].n)||'Burningeye Summit I',den:'The Frozen Maw',kind:'Main-quest boss'};
  if(k=='qs')return {n:'Qarsul',t:'the Living Dune',ic:'🏜️',zone:(PMAP[3]&&PMAP[3].ins[0].n)||'Searing Sands I',den:'The Sunken Gate',kind:'Main-quest boss'};
  const i=+k.slice(1),b=BOSSES[i],D=(typeof DSTXT!='undefined'&&DSTXT[i])||{};return {n:b.name,t:b.title,ic:b.i||'👑',zone:(PMAP[i]&&PMAP[i].n)||D.zone||'',den:D.den||'Sovereign’s Den',kind:'Sovereign'}}
function bossDesc(k,id){const nm=(BOSSN[k]||{})[id];if(BOSSD[k])return BOSSD[k][id]||BOSSD0[id]||'';
  const D=(typeof DSTXT!='undefined'&&DSTXT[+k.slice(1)])||{},base=(nm||'').split(' · ')[0],norm=s=>String(s).replace(/^[^A-Za-z']+/,'').trim();
  const a=(D.atk||[]).find(x=>norm(x[0])===base);return a?a[1]+(a[2]?' — '+a[2]:''):BOSSD0[id]||''}

// ---------- start: make a hero through the real creator, then build the stage ----------
function boot(){
  try{applyDev('desktop')}catch(_){}try{$('devp').classList.add('hide')}catch(_){}
  let n=0;const go=()=>{n++;
    try{if(!$('start').classList.contains('hide')){ccCls='warrior';ccSp='Foxlet';ccStep=1;ccBegin()}}catch(e){console.warn('viewer boot',e)}
    let open=false;try{open=!$('start').classList.contains('hide')||uiOpen()}catch(_){}
    if(open&&n<40){try{document.querySelectorAll('.panel:not(.hide) .x,.modal:not(.hide) .x').forEach(b=>b.click())}catch(_){}setTimeout(go,250);return}
    setTimeout(stageUp,300)};
  setTimeout(go,200);
}
function stageUp(){
  try{CHEAT.god=true}catch(_){}
  try{mOn=false}catch(_){}
  hero.lvl=50;hero.hp=heroMax();hero.mp=mpMax();KV.tal0=Object.assign({},hero.tal||{});
  // no natural spawns and no companion auto spells; Sovereigns spawn only for the Bosses tab
  KV.spawnBoss0=spawnBoss;spawn=function(){};spawnBoss=function(i){return KV.mode=='boss'?KV.spawnBoss0.apply(this,arguments):null};compSpells=function(){};
  toStage();
  enemies.slice().forEach(e=>{try{removeE(e)}catch(_){}});
  KV.on=true;document.body.classList.add('kv-on');
  try{window.dispatchEvent(new Event('resize'))}catch(_){}
  buildUI();select('comp',KV.sel.comp);
  requestAnimationFrame(frame);
}
// the field stage: a flat, open stretch of Hillside Crest I's road
window.KVSPOT=function(){try{const z=INSL[STAGE_INS].path;const p=z[Math.min(z.length-1,40)];return [p[0],p[1]]}catch(_){return [pl.position.x,pl.position.z]}};
function toStage(){const p=KVSPOT();if(KV.where!=='stage'){try{insArrive(INSL[STAGE_INS])}catch(e){console.warn('viewer stage',e)}KV.where='stage'}
  toPos(p[0],p[1],0);KV.P=V(p[0],0,p[1]);try{TOD=KV.tod}catch(_){}}

// ---------- actors ----------
function at(dx,dz){return V(KV.P.x+dx,0,KV.P.z+dz)}
function mkFoe(key,pos){const e=spawnEnemy(key,pos.x,pos.z,30,{});if(!e)return null;e.__kv=1;e.c.st.hp=1e9;e.c.h=6e8;e.agg=0;e.cd=1e9;
  e.m.position.set(pos.x,GH(pos.x,pos.z),pos.z);try{scene.remove(e.hb)}catch(_){}try{if(e.rmk)e.rmk.visible=false}catch(_){}return e}
function freezeFoe(e){if(!e||e.dead)return;e.cd=1e9;e.c.h=6e8;e.root=99;e.agg=1;if(e.atk==null)e.tgI=null}
function setComp(sp,stage){
  const c=hatch(Object.assign(mkEgg(sp,0,1),{basic:true}));c.l=50;c.evo=stage;c.sp=[SP2[sp][8]].concat(EVSP[famOf(sp)].slice(0,3));c.cdm={};c.emp=false;c.h=M(c);
  party=[c];cmpSel=0;try{ui()}catch(_){}try{sync()}catch(_){}
  const f=fols[0];if(f){f.position.copy(KV.home.comp||at(0,0));f.rotation.y=0}
}
function layout(){
  const m=KV.mode;
  if(m=='comp'){KV.home.comp=at(0,0);KV.home.dummy=at(0,3.4);KV.home.hero=at(-1.9,-1.3)}
  else if(m=='mon'){KV.home.mon=at(0,0);KV.home.hero=at(0,1.7)}
  else if(m=='hero'){KV.home.hero=at(0,0);KV.home.dummy=at(0,RANGEDW[KV.wt]?6.5:2.3)}
}
function putG(o,p){o.position.set(p.x,GH(p.x,p.z),p.z)}
function placeHero(p){pl.position.set(p.x,GH(p.x,p.z),p.z);pl.step=null;hero.dash=null}
function clearHeroFx(){try{kqsClear()}catch(_){}hero.chan=null;hero.dash=null;pl.step=null;try{KQS.gp=null;KQS.fire=0}catch(_){}}

// ---------- selecting a subject ----------
function select(mode,key,opt){
  KV.mode=mode;KV.queue=[];KV.last=null;clearHeroFx();
  if(mode=='comp'){KV.sel.comp=key;if(opt&&opt.stage!=null)KV.stage=opt.stage}
  else if(mode=='mon')KV.sel.mon=key;
  else if(mode=='boss')KV.sel.boss=key;
  else{KV.sel.cls=key;KV.wt=(opt&&opt.wt)||KV.wt;if(!wtList(key).some(w=>w.wt==KV.wt))KV.wt=wtList(key)[0].wt;if(opt&&opt.form)KV.form=opt.form}
  // leave a boss arena, or go to one
  if(mode=='boss')bossEnter(key);
  else{bossLeave();layout()}
  // the companion always exists (the game pauses with an empty party); it is hidden off stage outside its tab
  const csp=mode=='comp'?KV.sel.comp:(party[0]&&party[0].g&&party[0].g[0])||'Foxlet';
  if(mode=='comp'||!party.length)setComp(csp,mode=='comp'?KV.stage:0);
  if(mode=='hero')setHero(KV.sel.cls,KV.wt);else if(mode=='comp'||mode=='mon')setHero('warrior',null);
  if(mode!='boss'){
    enemies.slice().forEach(e=>{try{removeE(e)}catch(_){}});KV.dummy=null;KV.mon=null;
    if(mode=='comp'||mode=='hero')KV.dummy=mkFoe(Q('#kvTarget')?Q('#kvTarget').value:'hobgoblin',KV.home.dummy);
    if(mode=='mon')KV.mon=mkFoe(key,KV.home.mon);
    placeHero(KV.home.hero);
    const sc=mode=='mon'?Math.max(1,(EN[key].sc||1)):1;KV.orbit.dist=(mode=='hero'&&RANGEDW[KV.wt]?9.5:7.2)*sc}
  KV.busyT=0;QA('#kvTabs button').forEach(x=>x.classList.toggle('on',x.dataset.t==mode));renderDetail();renderList();
}
function setHero(cls,wt){
  hero.cls=cls;hero.lvl=50;hero.cd={};hero.cr=0;hero.buffs=[];hero.tal=Object.assign({},KV.tal0||{});
  const T=wt?wtList(cls).find(w=>w.wt==wt):wtList(cls)[0];
  eq={};eq.weapon={id:uid++,tp:T.tp,lv:50,req:1,r:3,up:0,aff:[]};
  const ch=ITPL.findIndex(t=>t.sl=='chest'&&t.arm==CLS[cls].arm&&t.t==2);if(ch>=0)eq.chest={id:uid++,tp:ch,lv:50,req:1,r:2,up:0,aff:[]};
  if(cls=='paladin'){const o=ITPL.findIndex(t=>t.sl=='offhand'&&t.t==2);if(o>=0)eq.offhand={id:uid++,tp:o,lv:50,req:1,r:2,up:0,aff:[]}}
  try{hsDirty()}catch(_){}try{refreshGear()}catch(e){console.warn(e)}hero.hp=heroMax();hero.mp=mpMax();try{ui()}catch(_){}
  combo=0;atkCd=0;
}
function wtList(cls){const out=[],seen={};ITPL.forEach((t,i)=>{if(t.sl=='weapon'&&t.cls==cls)seen[t.wt]=i});
  Object.keys(seen).forEach(wt=>{if(WTYPE[wt])out.push({wt,tp:seen[wt],n:WTYPE[wt].n,i:WTYPE[wt].i})});return out}
function comboN(wt){if(MW[wt])return MW[wt].N;if(WBEH[wt])return 0;const C=CLS[hero.cls];if(C.atk=='melee4')return 4;if(C.atk=='melee3')return 3;return 0}

// ---------- the bosses' arenas ----------
function bossEnter(k){bossLeave(true);KV.dummy=null;KV.mon=null;enemies.slice().forEach(e=>{try{removeE(e)}catch(_){}});
  const B=KV.boss={k,e:null,t0:now_(),ph:1};
  try{if(k=='mb'){const L=MB144L;if(MQ144.st>=2)MQ144.st=1;toPos(L.ent.x,L.ent.z,0);B.c=V(L.cx,0,L.cz);B.Y0=0;B.R=L.hr-1.2}
    // Gorthrak: the Frozen Maw (Burningeye Summit's ice cave); he waits before his throne until the hero walks in
    else if(k=='gb'){const L=GB151L;MQ151.st=1;toPos(L.ent.x,L.ent.z,0);B.c=V(L.cx,0,L.cz);B.Y0=0;B.R=L.hr-1.2}
    // Qarsul: the temple yard of Searing Sands I, the dig done (uncovered, doors shut); he rises out of the heaps
    else if(k=='qs'){const A=qs165Arena(),F=ss165F(0);if(QS165.e||QS165.form)qs165Reset(false);toPos(A.cx+F.fx*-6,A.cz+F.fz*-6,0);B.c=V(A.cx,0,A.cz);B.Y0=Math.atan2(-F.fx,-F.fz);B.R=A.hr-1.2}
    else{const i=+k.slice(1),I=PMAP[i].ins[3],A=ARN[i];try{bossDone.delete(i)}catch(_){}insArrive(I);B.A=A;B.c=V(A.cx,0,A.cz);B.Y0=Math.atan2(I.en[0]-A.cx,I.en[1]-A.cz);B.R=ARENA_R-2.5}
  }catch(e){console.warn('viewer boss enter',e)}
  KV.where='boss';KV.home.boss=B.c;KV.home.hero=V(B.c.x+Math.sin(B.Y0)*8,0,B.c.z+Math.cos(B.Y0)*8);placeHero(KV.home.hero)}
// the boss entity: found or spawned, the fight started (the intro plays), the hero inside the arena
function bossGet(){const B=KV.boss;if(!B)return null;if(B.e&&!B.e.dead&&enemies.includes(B.e))return B.e;B.e=null;
  try{if(B.k=='mb'){const e=MQ144.e&&!MQ144.e.dead&&enemies.includes(MQ144.e)?MQ144.e:mb144Spawn();if(e&&e.sv){B.e=e;if(!(MB144A&&MB144A.f))mb144Start(e)}}
    else if(B.k=='gb'){const e=MQ151.e&&!MQ151.e.dead&&enemies.includes(MQ151.e)?MQ151.e:gb151Spawn(true);if(e&&e.sv){B.e=e;if(!(GB151A&&GB151A.f))gb151Start(e)}}
    else if(B.k=='qs'){// the yard is built by the game's own tick once the hero is there; then the dig is marked done and he forms (~4.5 s)
      if(!SD165.g||!qs165Here())return null;
      if(SS165.c1.st!==2){SS165.c1.st=2;try{sd165Sync()}catch(err){console.warn('viewer yard',err)}}
      if(qs165Alive()&&QS165A&&QS165A.f)B.e=QS165.e;else{if(!QS165.form&&!qs165Alive())qs165Form();return null}}
    else{const i=+B.k.slice(1);let e=bossEnt(i);if(!e)e=KV.spawnBoss0(i);if(e&&e.sv){B.e=e;if(AF!==B.A)try{arenaStart(B.A,e)}catch(err){console.warn(err)}}}}
  catch(err){console.warn('viewer boss',err)}
  const e=B.e;if(e){e.m.rotation.y=B.Y0;const bb=new THREE.Box3().setFromObject(e.sv.R.root),sz=bb.getSize(V());B.h=Math.max(1.5,sz.y);B.sz=Math.max(sz.x,sz.y,sz.z);
    KV.orbit.dist=Math.max(12,Math.min(26,B.sz*2.1));KV.focus=null;renderDetail()}
  return e}
function bossLeave(stay){const B=KV.boss;KV.boss=null;KV.die=null;
  if(B)try{if(B.k=='mb'){try{mb144Reset()}catch(_){}if(MQ144.e)try{removeE(MQ144.e)}catch(_){}MQ144.e=null}
    else if(B.k=='gb'){try{gb151Reset()}catch(_){}if(MQ151.e)try{removeE(MQ151.e)}catch(_){}MQ151.e=null}
    else if(B.k=='qs'){try{qs165Reset(false)}catch(_){}}
    else{if(AF)arenaFail();const e=bossEnt(+B.k.slice(1));if(e)removeE(e)}}catch(e){console.warn('viewer boss leave',e)}
  if(!stay&&KV.where!=='stage'){enemies.slice().forEach(e=>{try{removeE(e)}catch(_){}});toStage()}}
// Phase II changes the place too: the Sovereigns' dens (awake), Gorthrak's falling ice, Qarsul's storm
function bossPhase(e,ph){const S=e.sv;if(S.ph===ph)return;S.ph=ph;e.bs.ph=ph;if(ph>1)try{S.B.awake&&S.B.awake(e)}catch(_){}
  if(ph>1)try{if(e.gb151)gb151Quake(true);else if(e.qs165&&!QS165.storm)qs165Storm(true)}catch(err){console.warn('viewer phase',err)}renderDetail()}
// what one move leaves behind that would carry into the next (a shell, a crack, the heart's mounds, slabs)
function bossClean(e){const S=e.sv;
  if(e.gb151)try{if(S.rlk)gb151RlkClose(e);S.rp=null;S.rpN=0;S.shell=0;S.crk=0;S.chg=0;S.chgT=0;S.dr=0;gb151HandRock(e,false);gb151ShelterClear()}catch(err){console.warn('viewer gb clean',err)}
  if(e.qs165)try{qs165HeartClear();qs165SlabClear();S.melt=0;S.chg=0;S.chgT=0}catch(err){console.warn('viewer qs clean',err)}}
function bossPlay(id){const e=bossGet(),B=KV.boss;if(!e)return;const S=e.sv,D=S.B.M[id];if(!D)return;
  svEndMove(e,true);S.mv=null;S.stg=0;S.inv=0;S.cd={};S.rt=null;S.plan=null;S.force=null;S.dieM=0;KV.die=null;bossClean(e);
  enemies.slice().forEach(q=>{if(q.minion&&!q.dead)try{removeE(q)}catch(_){}});
  if((D.ph||1)>1&&S.ph<2)bossPhase(e,2);
  e.m.position.set(B.c.x,e.m.position.y,B.c.z);e.m.rotation.y=B.Y0;
  const r=D.r||[0,9],back=D.a==='b'||D.a==='sb',d=Math.min(B.R,Math.max(r[0]+.8,Math.min(r[1]-.5,(r[0]+Math.min(r[1],r[0]+6))/2+1))),a=B.Y0+(back?Math.PI:0);
  KV.home.hero=V(B.c.x+Math.sin(a)*d,0,B.c.z+Math.cos(a)*d);placeHero(KV.home.hero);hero.iv=0;
  svStart(e,id,1+((Math.random()*997)|0))}
function bossDie(){const e=bossGet();if(!e)return;const S=e.sv;svEndMove(e,true);S.mv=null;if(!S.B.die)return;svSnapNow(S);S.dieM=1;S.trk=S.B.die;S.tt=0;KV.die={e,t:0,T:2.6}}
function bossActions(){const B=KV.boss,e=B&&B.e,out=[];if(!e)return out;const S=e.sv,N=BOSSN[B.k]||{},nm=id=>N[id]||BOSSN0[id]||id;
  const follow=Object.assign({},BOSSFOL[B.k]||{});for(const id in S.B.M)(S.B.M[id].nx||[]).forEach(q=>{const N=S.B.M[q[0]];if(N&&!N.wt&&!follow[q[0]])follow[q[0]]=id});
  const add=(id,grp,ic)=>{const D=S.B.M[id];out.push({k:'b'+id,g:grp,i:ic,t:nm(id),s:(follow[id]?'Follows '+nm(follow[id])+' · ':'')+(D.r?'range '+D.r[0]+'–'+D.r[1]+' · ':'')+({f:'in front',b:'behind',s:'beside',sb:'beside or behind',fs:'in front or beside',any:'any side'}[D.a]||'')+' · '+(+D.dur).toFixed(1)+'s',
    d:bossDesc(B.k,id),ms:(D.dur||2)*1000+900,run(){bossPlay(id)}})};
  const ids=Object.keys(S.B.M),skip={intro:1,awaken:1,stagger:1,broken:1,reach141:1},sub=BOSSSUB[B.k]||[];(BOSSHIDE[B.k]||[]).concat(sub).forEach(id=>skip[id]=1);
  const sig=ids.filter(id=>S.B.M[id].wt&&S.B.M.broken&&['hundred','sever','heart','scars','feast','covenant','siphon','rampage'].includes(id));
  ids.filter(id=>!skip[id]&&!sig.includes(id)&&(S.B.M[id].ph||1)==1).forEach(id=>add(id,'Phase I',follow[id]?'↪️':'⚔️'));
  if(S.B.M.awaken)add('awaken','Phase II','🌕');
  ids.filter(id=>!skip[id]&&!sig.includes(id)&&(S.B.M[id].ph||1)>1).forEach(id=>add(id,'Phase II',follow[id]?'↪️':'🔥'));
  sig.forEach(id=>add(id,'Signature','✴️'));sub.forEach(id=>{if(S.B.M[id])add(id,'Signature','↪️')});
  ['intro','stagger','broken','reach141'].forEach(id=>{if(S.B.M[id])add(id,'Other',{intro:'🎬',stagger:'💫',broken:'💔',reach141:'🎯'}[id])});
  if(S.B.die)out.push({k:'bdie',g:'Other',i:'💀',t:'Defeat',s:'Its fall (the body stays: this is a preview)',ms:3400,run(){bossDie()}});
  return out}
// the AI held still: no moves of its own, no stalking, no retreats; between moves it walks back to its mark and faces the hero
function kvBossIdle(e,dt){const S=e.sv,m=e.m,h=KV.home.boss,ai=S.B.ai||{};S.rt=null;S.plan=null;S.force=null;S.rest=Math.max(S.rest||0,.5);let sp=0;
  if(h){const dx=h.x-m.position.x,dz=h.z-m.position.z,L=Math.hypot(dx,dz);
    if(L>.7){const ya=Math.atan2(dx,dz),da=svAng(ya-m.rotation.y);m.rotation.y+=Math.max(-3*dt,Math.min(3*dt,da));if(Math.abs(da)<1.2){sp=Math.min(ai.walk||2.2,L*2.5);walkM(m,dx/L*sp*dt,dz/L*sp*dt)}}
    else{const da=svAng(svYawTo(m,pl.position)-m.rotation.y);m.rotation.y+=Math.max(-2*dt,Math.min(2*dt,da))}}
  S.walkSp=sp}
{const f=svPick;svPick=function(){if(KV.on)return null;return f.apply(this,arguments)}}
{const f=svMoveFree;svMoveFree=function(e,dt,now){if(KV.on&&e&&e.sv){kvBossIdle(e,dt);return}return f.apply(this,arguments)}}
['mb144Move','gb151Move','qs165Move'].forEach(n=>{if(typeof window[n]!='function')return;const f=window[n];window[n]=function(e,dt){if(KV.on&&e&&e.sv){kvBossIdle(e,dt);return}return f.apply(this,arguments)}});
{const f=svAfterMove;svAfterMove=function(e,M){f.apply(this,arguments);const S=e&&e.sv;if(KV.on&&S){S.rt=null;S.plan=null;S.dis141=0;S.cl141=0;S.far141=0;if(!S.mv)S.rest=99}}}
// the defeat preview: the fall track plays on the living boss, then it stands up again
function kvDieTick(e,dt,now){const K=KV.die;if(!K||K.e!==e)return false;K.t+=dt;const S=e.sv;S.tt=K.t;
  if(K.t>=K.T){S.dieM=0;S.trk=null;S.aw=0;KV.die=null}svApply(e,dt,now);return true}
{const f=svAI;svAI=function(e,dt,now){if(KV.on&&kvDieTick(e,dt||0,now))return;return f.apply(this,arguments)}}
['mb144AI','gb151AI','qs165AI'].forEach(n=>{if(typeof window[n]!='function')return;const f=window[n];window[n]=function(e,dt,now){if(KV.on&&kvDieTick(e,dt||0,now))return;return f.apply(this,arguments)}});

// ---------- actions ----------
function busy(ms){KV.busyT=Math.max(KV.busyT,now_()+ms)}
function caption(t,s){KV.label=t;const o=Q('#kvCap');if(o){o.innerHTML='<b>'+esc(t)+'</b>'+(s?'<span>'+esc(s)+'</span>':'');o.classList.remove('hide');clearTimeout(KV.capT);KV.capT=setTimeout(()=>o.classList.add('hide'),2600/Math.max(.1,KVCLK.speed||1))}}
function act(a,fromQueue){if(!fromQueue)KV.queue=[];KV.last=a;
  QA('.kv-act').forEach(b=>b.classList.toggle('on',b.dataset.k==a.k));
  try{a.run()}catch(e){console.warn('viewer action',e)}caption(a.t,a.s);busy(a.ms||1600)}
function compActions(){const c=party[0],f=fols[0],out=[];if(!c||!f)return out;const mg=xMt(c)=='m';
  out.push({k:'basic',i:mg?'✴️':'🦷',t:'Basic attack',s:mg?'Magic bolt':'Bite',ms:1300,run(){const e=KV.dummy;if(!e)return;KV.home.comp&&f.position.copy(KV.home.comp);faceTo(f,e.m.position);
    if(mg){f.lk=1;const b=f.b;tw(220,k=>{if(b){b.position.y=Math.sin(k*Math.PI)*.12;b.rotation.x=-Math.sin(k*Math.PI)*.25}},()=>{if(b){b.position.y=0;b.rotation.x=0}f.lk=0;compBolt(f,c,e,()=>{if(!e.dead)compHit(c,e,1)})})}
    else{f.lk=1;lunge(f,e.m.position,()=>{f.lk=0;if(!e.dead)compHit(c,e,1)})}}});
  c.sp.forEach((n,j)=>{const S=CSP[n],R=(typeof SPX105!='undefined'&&SPX105[n])||{};
    out.push({k:'sp'+j,i:S.i,t:n,s:(j?'Unlocks at stage '+j:'Signature')+' · '+(KINDN[S.k]||S.k)+(R.m?' · '+R.m+' motion':''),d:S.d,ms:2600,lock:j>KV.stage,run(){const e=KV.dummy;f.lk=0;f._m105=null;KV.home.comp&&f.position.copy(KV.home.comp);if(e)faceTo(f,e.m.position);c.cdm[n]=0;hero.sh=0;compCast(c,f,S,e)}})});
  return out}
function monActions(){const key=KV.sel.mon,ms=(typeof MSET!='undefined'&&MSET[key])||EN[key].moves||['strike'];
  return ms.map(n=>{const M_=MV[n]||{};return {k:'m'+n,i:M_.ic||(KQMEL[n]?'⚔️':KQR[n]?'🎯':'✴️'),t:(typeof MVN!='undefined'&&MVN[n])||M_.nm||n,
    s:(M_.sh?M_.sh+' · ':'')+(M_.wind!=null?'wind-up '+M_.wind+'s':''),ms:(M_.wind!=null?(M_.wind+M_.act+M_.rec)*1000+700:1800),run(){const e=KV.mon;if(!e)return;
    mCancel(e);putG(e.m,KV.home.mon);const dd=MOVED[n]||(M_.rmin>0?Math.max(M_.rmin+.8,Math.min(M_.rmax-.5,4.5)):Math.min(1.7,(M_.rmax||2)-.2)),hp=V(KV.home.mon.x,0,KV.home.mon.z+Math.max(1,dd));
    placeHero(hp);KV.home.hero=hp;faceTo(e.m,hp);e.cd=1e9;mStart(e,pl,n)}}})}
// an ability, cast for real: the loadout holds only it, at rank 1 (base) or rank 5 and evolved
function abilCast(s,evo){const T=Object.assign({},KV.tal0||{},{__ld:s.n,['ab:'+s.n]:evo?5:1});if(evo)T['__ev:'+s.n]=1;hero.tal=T;
  hero.lvl=Math.max(50,s.lv|0);hero.mp=1e6;hero.cd={};try{KQS.cdn={};KQS.ck=''}catch(_){}if(s.spend){hero.cr=100;hero.crT=performance.now()}hero.hp=heroMax();
  const e=KV.dummy;tgt=e;if(e)faceTo(pl,e.m.position);const sk=heroSkills()[0];if(!sk||sk.n!==s.n){console.warn('viewer: ability not in loadout',s.n);return}
  if(s.gt&&e){KQS.gp=e.m.position.clone();KQS.fire=1}try{cast(0)}finally{KQS.gp=null;KQS.fire=0}}
function heroActions(){const out=[],wt=KV.wt,N=comboN(wt),ranged=RANGEDW[wt];
  const prep=d=>{clearHeroFx();if(d!=null&&KV.dummy){KV.home.dummy=at(0,d);putG(KV.dummy.m,KV.home.dummy)}else layout();placeHero(KV.home.hero);
    faceTo(pl,KV.dummy?KV.dummy.m.position:at(0,3));tgt=KV.dummy;atkCd=0;try{riding=null}catch(_){}};
  if(N){for(let i=0;i<N;i++)out.push({k:'h'+i,g:'Attacks',i:i==N-1?'💥':'⚔️',t:i==N-1?'Finisher (hit '+(i+1)+')':'Hit '+(i+1),s:WTYPE[wt].n+' combo',ms:1200,run(){prep();combo=i;comboT=performance.now();swing()}});
    out.push({k:'full',g:'Attacks',i:'🔁',t:'Full combo',s:N+' hits in a row',ms:N*700+800,run(){prep();combo=0;comboT=performance.now();let n=0;const go=()=>{if(KV.mode!='hero')return;if(atkCd>0||hero.chan){setTimeout(go,30);return}if(n++>=N)return;swing();setTimeout(go,40)};go()}})}
  else{out.push({k:'h0',g:'Attacks',i:'🎯',t:'Attack',s:WTYPE[wt].n+(ranged?' · ranged':''),ms:1600,run(){prep();swing()}});
    out.push({k:'full',g:'Attacks',i:'🔁',t:'Attack 5 times',s:wt=='knives'?'every 4th throw is a fan of 5':wt=='wand'?'every 5th bolt is a big one':'repeated attacks',ms:5200,run(){prep();let n=0;const go=()=>{if(KV.mode!='hero')return;if(atkCd>0){setTimeout(go,30);return}if(n++>=5)return;tgt=KV.dummy;swing();setTimeout(go,40)};go()}})}
  const evo=KV.form=='evo';
  try{kqsAll(KV.sel.cls).forEach((s,i)=>{const E=evo&&typeof EVO137!='undefined'&&EVO137[s.n],S2=E&&typeof ev137Sk=='function'?ev137Sk(s):s,dur=+(S2.dur||s.dur||0);
    out.push({k:'a'+i,g:evo?'Evolved abilities (rank 5)':'Abilities (rank 1)',i:s.i,t:E?E.en:s.n,s:(E?'Evolved '+s.n:'Level '+s.lv)+(s.gt?' · aimed on the ground':'')+(s.spend?' · spends combo points':''),
      d:E?E.d:s.d,ms:(dur>0&&dur<8?dur*1000:0)+2600,run(){prep(typeof abxDist=='function'?abxDist(s):4.5);abilCast(s,!!E)}})})}catch(e){console.warn(e)}
  return out}
function actions(){return KV.mode=='comp'?compActions():KV.mode=='mon'?monActions():KV.mode=='boss'?bossActions():heroActions()}
function faceTo(o,p){const dx=p.x-o.position.x,dz=p.z-o.position.z;if(dx*dx+dz*dz>1e-4)o.rotation.y=Math.atan2(dx,dz)}
function playAll(){const A=actions().filter(a=>a.k!='full'&&a.k!='bdie');if(!A.length)return;KV.queue=A.slice(1);act(A[0],true);KV.qT=now_()+(A[0].ms||1600)+400}

// ---------- the per-frame stage keeper ----------
const HIDE=['fz','bag','inc','cmp','shop','mshop','wmap','setw','tal','hatch','start','xw','dth','devp'].map(i=>()=>$(i));
function bossBusy(){const B=KV.boss,e=B&&B.e;return !!(e&&e.sv&&(e.sv.mv||KV.die))}
function frame(){requestAnimationFrame(frame);if(!KV.on)return;const t=now_(),idle=t>KV.busyT&&!bossBusy();
  // the floating lantern's halo (dark zones) would glow right in front of the side camera; its light stays
  try{if(FLAN.halo.visible)FLAN.halo.visible=false}catch(_){}
  // Qarsul's wall of whirling sand: the viewer's camera stands outside it, so only its far side is drawn (it still frames the yard)
  try{if(typeof QS165!='undefined'&&QS165.wall)QS165.wall.L.forEach(o=>{const mt=o.m.material;if(mt.side!==THREE.BackSide){mt.side=THREE.BackSide;mt.needsUpdate=true}})}catch(_){}
  HIDE.forEach(g=>{const el=g();if(el&&!el.classList.contains('hide'))el.classList.add('hide')});try{if(typeof KQMENU!='undefined')KQMENU.on=false}catch(_){}
  hero.hp=heroMax();if(KV.mode!='hero')hero.mp=mpMax();
  if(KV.mode=='boss'){const e=bossGet();
    // keep the boss, its summons and props (minions, ooze sacs); nothing else lives in the arena
    enemies.slice().forEach(q=>{if(q!==e&&!q.minion&&!q.mbSac&&!q.boss)try{removeE(q)}catch(_){}});
    if(e){e.c.h=M(e.c);if(e.sv)e.sv.po=0}if(tgt)try{setTarget(null)}catch(_){}
    if(!KV.boss.ready&&e&&!e.sv.mv&&t-KV.boss.t0>800){KV.boss.ready=1;renderDetail()}}
  else{try{TOD=KV.tod}catch(_){}
    const keep=[KV.dummy,KV.mon].filter(Boolean);enemies.slice().forEach(e=>{if(!keep.includes(e))try{removeE(e)}catch(_){}});keep.forEach(freezeFoe);
    if(KV.mon){KV.mon.agg=1;if(idle&&!KV.mon.atk)ease(KV.mon.m,KV.home.mon,6);if(!KV.mon.atk)faceTo(KV.mon.m,pl.position)}
    if(KV.dummy){if(idle)ease(KV.dummy.m,KV.home.dummy,6);KV.dummy.agg=0;faceTo(KV.dummy.m,pl.position)}}
  // hero: back to the mark and facing the action when nothing is happening
  if(idle&&!hero.chan&&!hero.dash&&atkCd<=0){ease(pl,KV.home.hero,5);const fo=KV.mode=='mon'?KV.mon&&KV.mon.m:KV.mode=='boss'?KV.boss&&KV.boss.e&&KV.boss.e.m:KV.dummy&&KV.dummy.m;if(fo)faceTo(pl,fo.position)}
  if(KV.mode=='hero'&&KV.dummy)tgt=KV.dummy;else if(KV.mode!='boss')tgt=null;
  // queue (Play all) and loop
  if(KV.queue.length&&t>KV.qT&&!bossBusy()){const a=KV.queue.shift();act(a,true);KV.qT=t+(a.ms||1600)+400}
  else if(!KV.queue.length&&KV.loop&&KV.last&&idle&&t>KV.busyT+500){act(KV.last,true)}
  // camera focus follows the action, gently
  let subj,other,hy=.8;
  if(KV.mode=='comp'){subj=fols[0];other=KV.dummy&&KV.dummy.m}
  else if(KV.mode=='mon'){subj=KV.mon&&KV.mon.m;other=pl;hy=.8*Math.max(1,(EN[KV.sel.mon].sc||1))}
  else if(KV.mode=='boss'){subj=KV.boss&&KV.boss.e&&KV.boss.e.m;other=pl;hy=KV.boss&&KV.boss.h?KV.boss.h*.45:2;if(!subj)subj=pl}
  else{subj=pl;other=KV.dummy&&KV.dummy.m}
  if(subj){const a=subj.position,b=other?other.position:a;KV.sep=(KV.sep||0)+(Math.hypot(a.x-b.x,a.z-b.z)-(KV.sep||0))*.05;const fx=(a.x+b.x)/2,fz=(a.z+b.z)/2,fy=GH(fx,fz)+hy;
    const F=KV.focus||(KV.focus=V(fx,fy,fz));F.x+=(fx-F.x)*.08;F.y+=(fy-F.y)*.08;F.z+=(fz-F.z)*.08}
}
function ease(o,h,k){if(!h)return;const dx=h.x-o.position.x,dz=h.z-o.position.z;if(dx*dx+dz*dz<1e-4)return;const r=Math.min(1,.016*k*(KVCLK.speed||0));o.position.x+=dx*r;o.position.z+=dz*r;if(o!==pl)o.position.y=Math.max(o.position.y,GH(o.position.x,o.position.z))}

// the companion stays on its mark (its own AI would chase the target and cast on its own)
compTick=function(dt,now){const f=fols[0],c=party[0];if(!f||!c)return;f.vel=f.vel||V();
  if(KV.mode!='comp'){f.visible=false;f.position.set(pl.position.x-60,0,pl.position.z-60);return}
  f.visible=true;f.position.y=GH(f.position.x,f.position.z);const h=KV.home.comp;let mv=false;
  if(!f.lk&&!f._m105&&h&&now_()>KV.busyT){const dx=h.x-f.position.x,dz=h.z-f.position.z,L=Math.hypot(dx,dz);if(L>.05){const s=Math.min(L,dt*3);f.position.x+=dx/L*s;f.position.z+=dz/L*s;mv=L>.2;if(mv)f.rotation.y=Math.atan2(dx,dz)}}
  if(!mv&&!f.lk&&KV.dummy)faceTo(f,KV.dummy.m.position);
  animC(f,now,mv,mv?2:0)};

// ---------- camera: orbit the action; drag to turn, wheel / pinch to zoom ----------
{const R=ren.render.bind(ren);ren.render=function(s,c){if(KV.on&&c===cam)orbitCam();if(window.KVNODRAW)return;return R(s,c)}}
{const f=chunkVis;chunkVis=function(){if(KV.on)orbitCam();return f.apply(this,arguments)}}
// (the camera backs off when the two actors stand far apart, so both stay in the picture)
function orbitCam(){const O=KV.orbit,F=KV.focus||V(pl.position.x,1,pl.position.z),cp=Math.cos(O.pitch),D=Math.max(O.dist,(KV.sep||0)*1.15+3);
  cam.position.set(F.x+Math.sin(O.yaw)*cp*D,F.y+Math.sin(O.pitch)*D,F.z+Math.cos(O.yaw)*cp*D);
  const g=GH(cam.position.x,cam.position.z)+.4;if(cam.position.y<g)cam.position.y=g;
  if(typeof shk!='undefined'&&shk>0){cam.position.x+=(Math.random()-.5)*shk*.6;cam.position.y+=(Math.random()-.5)*shk*.6}
  cam.lookAt(F.x,F.y,F.z);cam.updateMatrixWorld()}
// presets are relative to the subject's facing in the boss tab (bosses face the den's entrance), fixed elsewhere
function camPreset(n){const O=KV.orbit,b=KV.mode=='boss'&&KV.boss?KV.boss.Y0||0:0;
  if(n=='side'){O.yaw=b+Math.PI/2+.45;O.pitch=.3}else if(n=='front'){O.yaw=b+.15;O.pitch=.25}else if(n=='back'){O.yaw=b+Math.PI+.25;O.pitch=.35}else if(n=='top'){O.yaw=b+Math.PI/2+.2;O.pitch=1.2}}

// ---------- UI ----------
function buildUI(){
  const st=Q('#stage');
  const ov=document.createElement('div');ov.id='kvOv';ov.innerHTML='<div id="kvCap" class="hide"></div><div id="kvHint">Drag to turn · scroll or pinch to zoom · 1–9 play · R replay · Space pause</div>';st.appendChild(ov);
  const pn=document.createElement('aside');pn.id='kvPanel';
  pn.innerHTML=`<header><h1>Kill Quest <span>Animation Viewer</span></h1></header>
  <nav id="kvTabs"><button data-t="comp" class="on">🥚 Companions</button><button data-t="mon">👹 Monsters</button><button data-t="boss">👑 Bosses</button><button data-t="hero">⚔️ Hero</button></nav>
  <div id="kvList"></div>
  <section id="kvDetail"></section>
  <footer id="kvCtl">
    <div class="row"><span class="lbl">Speed</span><div class="seg" id="kvSpd"><button data-s="1" class="on">1×</button><button data-s=".5">½×</button><button data-s=".25">¼×</button><button data-s=".1">⅒×</button></div>
      <button id="kvPause" title="Pause / play (Space)">Pause</button><button id="kvStep" title="Step one frame (.)">Step</button></div>
    <div class="row"><span class="lbl">View</span><div class="seg" id="kvCam"><button data-c="side">Side</button><button data-c="front">Front</button><button data-c="back">Back</button><button data-c="top">Top</button></div>
      <label class="chk"><input type="checkbox" id="kvLoop"> Loop</label></div>
    <div class="row" id="kvTgtRow"><span class="lbl">Target</span><select id="kvTarget"></select></div>
    <div class="row"><span class="lbl">Look</span><div class="seg" id="kvGfx"><button data-g="full" class="on">Full</button><button data-g="noglass">No glass</button><button data-g="plain">Plain</button><button data-g="safe">Safe</button></div>
      <button id="kvGfxI" title="What this device's graphics report">Info</button></div>
    <div id="kvGfxOut" class="note" hidden></div>
  </footer>`;
  document.body.appendChild(pn);
  const tsel=Q('#kvTarget');['hobgoblin','orc','skeleton','troll','snowwolf','tortoise','goo','yeti'].forEach(k=>{if(EN[k]){const o=document.createElement('option');o.value=k;o.textContent=EN[k].e+' '+EN[k].n;tsel.appendChild(o)}});
  tsel.onchange=()=>{select(KV.mode,KV.mode=='comp'?KV.sel.comp:KV.sel.cls)};
  Q('#kvTabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;const t=b.dataset.t;select(t,KV.sel[{comp:'comp',mon:'mon',boss:'boss',hero:'cls'}[t]]);camPreset('side')};
  Q('#kvSpd').onclick=e=>{const b=e.target.closest('button');if(!b)return;setSpeed(+b.dataset.s)};
  Q('#kvPause').onclick=()=>setSpeed(KVCLK.speed==0?(KV.prevS||1):0);
  Q('#kvStep').onclick=()=>{if(KVCLK.speed!=0)setSpeed(0);KVCLK.step+=16};
  Q('#kvCam').onclick=e=>{const b=e.target.closest('button');if(b)camPreset(b.dataset.c)};
  Q('#kvLoop').onchange=e=>{KV.loop=e.target.checked};
  Q('#kvGfx').onclick=e=>{const b=e.target.closest('button');if(b)kvGfx(b.dataset.g)};Q('#kvGfxI').onclick=()=>{const o=Q('#kvGfxOut');o.hidden=!o.hidden;if(!o.hidden)o.innerHTML=kvGfxInfo()};
  Q('#kvList').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;select(KV.mode,b.dataset.k);if(KV.mode=='boss')camPreset('side')};
  Q('#kvDetail').onclick=e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.stage!=null){KV.stage=+b.dataset.stage;select('comp',KV.sel.comp,{stage:KV.stage});return}
    if(b.dataset.wt){select('hero',KV.sel.cls,{wt:b.dataset.wt});return}
    if(b.dataset.form){KV.form=b.dataset.form;renderDetail();return}
    if(b.id=='kvAll'){playAll();return}
    const a=actions().find(x=>x.k==b.dataset.k);if(a)act(a)};
  // orbit input on the stage
  let drag=null,pinch=null;const pts={};
  ov.addEventListener('pointerdown',e=>{pts[e.pointerId]={x:e.clientX,y:e.clientY};ov.setPointerCapture(e.pointerId);const ks=Object.keys(pts);
    if(ks.length==2){const a=pts[ks[0]],b=pts[ks[1]];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),d0:KV.orbit.dist};drag=null}else drag={x:e.clientX,y:e.clientY}});
  ov.addEventListener('pointermove',e=>{if(!pts[e.pointerId])return;pts[e.pointerId]={x:e.clientX,y:e.clientY};const ks=Object.keys(pts);
    if(pinch&&ks.length==2){const a=pts[ks[0]],b=pts[ks[1]],d=Math.hypot(a.x-b.x,a.y-b.y);KV.orbit.dist=Math.max(2.5,Math.min(30,pinch.d0*pinch.d/Math.max(10,d)));return}
    if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag={x:e.clientX,y:e.clientY};KV.orbit.yaw-=dx*.008;KV.orbit.pitch=Math.max(-.05,Math.min(1.35,KV.orbit.pitch+dy*.006))}});
  const up=e=>{delete pts[e.pointerId];if(Object.keys(pts).length<2)pinch=null;if(!Object.keys(pts).length)drag=null};ov.addEventListener('pointerup',up);ov.addEventListener('pointercancel',up);
  ov.addEventListener('wheel',e=>{e.preventDefault();KV.orbit.dist=Math.max(2.5,Math.min(30,KV.orbit.dist*(1+Math.sign(e.deltaY)*.1)))},{passive:false});
  // keys: the game's own keys are switched off; a few viewer shortcuts instead
  const keyH=e=>{if(e.target&&(e.target.tagName=='INPUT'||e.target.tagName=='SELECT'))return;e.stopImmediatePropagation();if(e.type!='keydown')return;
    if(e.key==' '){e.preventDefault();Q('#kvPause').click()}else if(e.key=='.')Q('#kvStep').click();else if(e.key=='r'||e.key=='R'){if(KV.last)act(KV.last)}
    else if(/^[1-9]$/.test(e.key)){const a=actions()[+e.key-1];if(a)act(a)}};
  window.addEventListener('keydown',keyH,true);window.addEventListener('keyup',keyH,true);
  camPreset('side');
}
function setSpeed(s){if(s!=0)KV.prevS=s;KVCLK.speed=s;QA('#kvSpd button').forEach(b=>b.classList.toggle('on',+b.dataset.s==s));Q('#kvPause').textContent=s==0?'Play':'Pause'}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
// where each monster lives (the bestiary's table): zone → the instances, camps
function monWhere(){return typeof dex141Where=='function'?dex141Where():{}}
function monKeys(){return Object.keys(EN).filter(k=>!/^boss/.test(k)&&k!=='vorraxis'&&((typeof MSET!='undefined'&&MSET[k]&&MSET[k].length)||(EN[k].moves&&EN[k].moves.length)))}
// creatures that only come in a quest (not a zone's fields or camps), and where
const QMON={ghostwolf:'Kindlelight III · The Three Sigils (the sigil rituals)',icespider:'Burningeye Summit · The Frozen Gate',
  ss165zealot:'Searing Sands II · the rift (the cult attacks while Kheprit opens it)',ss165caller:'Searing Sands II · the rift (the cult attacks while Kheprit opens it)',
  dgwretch:'The Dirge · the Black Channel (they climb onto the raft)'};
function whereTxt(L){const by={};(L||[]).forEach(o=>{(by[o.z]=by[o.z]||[]).push(ROMAN[o.k]+(o.camp&&!o.roam?' (camp)':''))});return Object.keys(by).map(z=>PMAP[z].n+' '+by[z].join(', ')).join(' · ')}
function renderList(){const L=Q('#kvList');let h='';
  if(KV.mode=='comp'){const fams={};SPK.forEach(k=>{(fams[SP2[k][0]]=fams[SP2[k][0]]||[]).push(k)});
    for(const f in fams){h+=`<div class="grp">${FAMI[f]||''} ${f}</div><div class="chips">`+fams[f].sort((a,b)=>SP2[a][1]-SP2[b][1]).map(k=>`<button data-k="${k}" class="${KV.sel.comp==k?'on':''}"><i>${SP2[k][3]}</i>${k}<small>T${SP2[k][1]}</small></button>`).join('')+'</div>'}}
  else if(KV.mode=='mon'){const W=monWhere(),G={};
    monKeys().forEach(k=>{const w=W[k],z=w&&w.length?w[0].z:QMON[k]?'q':'o',f=w&&w.length?w[0].k:9;(G[z]=G[z]||[]).push([f,k])});
    const rk=z=>z=='q'?1:z=='o'?2:0;
    Object.keys(G).sort((a,b)=>rk(a)-rk(b)||a-b).forEach(z=>{const P=PMAP[z];h+=`<div class="grp">${z=='q'?'📜 Quest creatures':z=='o'?'🗃️ Other creatures':(P.ic||'')+' '+esc(P.n)}</div><div class="chips">`+
      G[z].sort((a,b)=>a[0]-b[0]||EN[a[1]].n.localeCompare(EN[b[1]].n)).map(([f,k])=>`<button data-k="${k}" class="${KV.sel.mon==k?'on':''}"><i>${EN[k].e}</i>${esc(EN[k].n)}${f<3?'<small>'+ROMAN[f]+'</small>':''}</button>`).join('')+'</div>'})}
  else if(KV.mode=='boss'){const chip=k=>{const I=bossInfo(k);return `<button data-k="${k}" class="${KV.sel.boss==k?'on':''}"><i>${I.ic}</i>${esc(I.n)}</button>`};
    h+='<div class="grp">Sovereigns</div><div class="chips">'+KVB.filter(b=>!QBOSS.includes(b.k)).map(b=>chip(b.k)).join('')+'</div>';
    h+='<div class="grp">Main-quest bosses</div><div class="chips">'+QBOSS.map(chip).join('')+'</div>'}
  else{h+='<div class="grp">Class</div><div class="chips">'+CLSK.map(k=>`<button data-k="${k}" class="${KV.sel.cls==k?'on':''}"><i>${CLS[k].i}</i>${CLS[k].n}</button>`).join('')+'</div>'}
  L.innerHTML=h;Q('#kvTgtRow').style.display=KV.mode=='comp'||KV.mode=='hero'?'':'none'}
function renderDetail(){const D=Q('#kvDetail');let h='';const A=actions();
  if(KV.mode=='comp'){const k=KV.sel.comp,q=SP2[k];h+=`<h2><i>${q[3]}</i> ${k}</h2><p class="meta">${FAMI[q[0]]||''} ${q[0]} family · tier ${q[1]} · ${xMt(party[0])=='m'?'magic (keeps its distance)':'physical (closes in)'}</p>
    <div class="lbl2">Evolution look</div><div class="seg wide">${STAGEN.map((n,i)=>`<button data-stage="${i}" class="${KV.stage==i?'on':''}">${n}</button>`).join('')}</div>`}
  else if(KV.mode=='mon'){const e=EN[KV.sel.mon],w=whereTxt(monWhere()[KV.sel.mon]);h+=`<h2><i>${e.e}</i> ${esc(e.n)}</h2><p class="meta">${e.hum?'Humanoid':'Creature ('+e.rig+' body)'} · ${e.fam} · ${e.mt=='m'?'magic':'physical'}${e.ranged?' · ranged':''}${e.sc&&e.sc!=1?' · size ×'+e.sc:''}</p>
    <p class="note">${w?'Lives in '+esc(w)+'.':QMON[KV.sel.mon]?'Appears in a quest: '+esc(QMON[KV.sel.mon])+'.':'Not found in any zone’s fields or camps now.'} Red ground shapes are the warning players see before the hit lands.</p>`}
  else if(KV.mode=='boss'){const I=bossInfo(KV.sel.boss),e=KV.boss&&KV.boss.e;h+=`<h2><i>${I.ic}</i> ${esc(I.n)}</h2><p class="meta">${esc(I.t)} · ${esc(I.kind)} of ${esc(I.zone)} · ${esc(I.den)}${e?' · Phase '+(e.sv.ph>1?'II':'I'):''}</p>
    <p class="note">${e?'Shown in its own arena. Its AI is held still, so it only moves when you pick a move. Phase II moves turn Phase II on (the den changes with it); pick the boss again to go back to Phase I.':'Entering the arena…'}</p>`}
  else{const C=CLS[KV.sel.cls];h+=`<h2><i>${C.i}</i> ${C.n}</h2><p class="meta">${esc(C.role)}${typeof BRD!='undefined'&&typeof BR_CLS!='undefined'&&BRD[BR_CLS[KV.sel.cls]]?' · played as the '+esc(BRD[BR_CLS[KV.sel.cls]].n.toLowerCase()):''}</p><div class="lbl2">Weapon</div><div class="seg wide wrapb">${wtList(KV.sel.cls).map(w=>`<button data-wt="${w.wt}" class="${KV.wt==w.wt?'on':''}">${w.i} ${w.n}</button>`).join('')}</div>`
    if(typeof WDESC!='undefined'&&WDESC[KV.wt])h+=`<p class="note">${esc(WDESC[KV.wt])}</p>`;
    h+=`<div class="lbl2">Ability form</div><div class="seg wide"><button data-form="base" class="${KV.form!='evo'?'on':''}">Base · rank 1</button><button data-form="evo" class="${KV.form=='evo'?'on':''}">✨ Evolved · rank 5</button></div>`}
  h+=`<div class="lbl2 rowh"><span>${KV.mode=='comp'?'Attack and abilities':KV.mode=='mon'?'Attacks':KV.mode=='boss'?'Moves':'Attacks and abilities'}</span><button id="kvAll">▶ Play all</button></div><div class="acts">`;
  let g0=null;A.forEach((a,i)=>{if(a.g&&a.g!==g0){g0=a.g;h+=`<div class="sub">${esc(a.g)}</div>`}
    h+=`<button class="kv-act${a.lock?' lock':''}" data-k="${a.k}" title="${esc(a.d||'')}"><i>${a.i}</i><span><b>${esc(a.t)}</b><small>${esc(a.s||'')}</small></span><kbd>${i<9?i+1:''}</kbd></button>`});
  D.innerHTML=h+'</div>'}
window.KVselect=select;window.KVact=k=>{const a=actions().find(x=>x.k==k);if(a)act(a);return !!a};window.KVactions=()=>actions().map(a=>a.k);
window.KVbossReady=()=>!!(KV.boss&&KV.boss.e&&KV.boss.ready);

// wait for the game to finish loading
const wait=()=>{if(typeof hero!='undefined'&&typeof ccBegin=='function'&&document.querySelector('#ccNext'))boot();else setTimeout(wait,100)};wait();
})();

// ---- Look: drawing options, to find which part of the drawing a device gets wrong (owner, Oct 29 2026: shredded view on a phone) ----
// Full: the game's normal look. No glass: the see-through wall passes off (GH169.on). Plain: no post-processing (POST.on: the
// scene draws straight to the screen, no anti-aliased buffer, glow or colour grade). Safe: both, at pixel ratio 1.
var KVGFX={mode:'full',pr:null};
function kvGfx(m){KVGFX.mode=m;if(KVGFX.pr==null)KVGFX.pr=ren.getPixelRatio();
  GH169.on=m=='full'||m=='plain';POST.on=m=='full'||m=='noglass';
  if(KVGFX.qa==null)KVGFX.qa=QL.auto;QL.auto=m=='safe'?false:KVGFX.qa;   // the game's auto quality would reset the pixel ratio
  const pr=m=='safe'?1:KVGFX.pr;if(ren.getPixelRatio()!==pr){ren.setPixelRatio(pr);try{rs()}catch(_){}}
  document.querySelectorAll('#kvGfx button').forEach(b=>b.classList.toggle('on',b.dataset.g==m));
  const o=Q('#kvGfxOut');if(o&&!o.hidden)o.innerHTML=kvGfxInfo()}
function kvGfxInfo(){const L=[],E=x=>String(x).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  try{const gl=ren.getContext(),d=gl.getExtension('WEBGL_debug_renderer_info'),c=ren.domElement;
    L.push('WebGL '+(ren.capabilities.isWebGL2?'2':'1')+(gl.isContextLost()?' · <b>context lost</b>':''));
    L.push('GPU: '+E(d?gl.getParameter(d.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)));
    L.push('Canvas '+c.width+'×'+c.height+' · shown '+c.clientWidth+'×'+c.clientHeight+' · ratio '+ren.getPixelRatio()+' (device '+(devicePixelRatio||1)+') · quality '+QL.lv);
    L.push('Float buffers '+(gl.getExtension('EXT_color_buffer_float')||gl.getExtension('EXT_color_buffer_half_float')?'yes':'no')+' · max samples '+(ren.capabilities.maxSamples||0)+' · colour-only copies '+(window.KQ170?KQ170.n:'-'));
    L.push('Look: '+KVGFX.mode+' · see-through '+(GH169.on?'on':'off')+' · post '+(POST.on?'on':'off'))}catch(e){L.push('info error: '+E(e.message))}
  const w=(window.KVLOG||[]).slice(-6);L.push(w.length?'Last warnings:<br>'+w.map(x=>'· '+E(x.slice(0,160))).join('<br>'):'No warnings');
  return L.join('<br>')}
