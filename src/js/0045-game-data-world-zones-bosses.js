// ---------- Game data (add your own species here!) ----------
// c = body color, h/t = name syllables used when fusing
const S={Foxlet:{e:'🦊',c:0xe8833a,h:'Vulp',t:'ix',hp:18,a:7,d:4},Mossfrog:{e:'🐸',c:0x5fae4a,h:'Mire',t:'bit',hp:22,a:6,d:5},Stoneshell:{e:'🐢',c:0x9a8f72,h:'Cairn',t:'ark',hp:24,a:5,d:8},
Skyhawk:{e:'🦅',c:0x4a8fd8,h:'Zeph',t:'ryx',hp:15,a:9,d:3},Ashwolf:{e:'🐺',c:0x8a919c,h:'Cinder',t:'wyn',hp:20,a:8,d:5},Drakelet:{e:'🐉',c:0x8a4fd0,h:'Pyra',t:'gon',hp:26,a:10,d:7},
Batwing:{e:'🦇',c:0x5a4a6a,h:'Vesp',t:'ire',hp:16,a:8,d:3},Cryptspider:{e:'🕷️',c:0x2e2836,h:'Crypt',t:'weave',hp:17,a:10,d:4},Gloomcap:{e:'🍄',c:0x7a3a6a,h:'Gloom',t:'spore',hp:26,a:5,d:6},
Boneling:{e:'💀',c:0xe0d8bc,h:'Osse',t:'ling',hp:21,a:8,d:6},Wispling:{e:'👻',c:0x9ad8ff,h:'Wisp',t:'ael',hp:14,a:10,d:2},Gravewyrm:{e:'🐍',c:0x4a6a3a,h:'Grave',t:'wyrm',hp:28,a:9,d:8}};
// Variants: every companion rolls one (w = spawn weight, m = hp/atk/def multipliers)
const VAR={'':{w:50,m:[1,1,1]},Ember:{w:18,c:0xe0482a,m:[1,1.12,1]},Frost:{w:16,c:0x7fd4f0,m:[1,1,1.12]},Shadow:{w:12,c:0x3b2f55,m:[1.12,1,1]},Golden:{w:4,c:0xf2c230,m:[1.08,1.08,1.08]}};
// Special moves. r = loot rarity (0 common, 1 uncommon, 2 rare), pp = uses per battle
const MOVES={'Power Strike':{i:'💥',k:'nova',m:1.9,cd:4,r:-1,col:0xffd24a,d:'Shockwave around you.'},'Gale Slash':{i:'🌪️',k:'shot',n:3,m:.9,cd:3,r:0,col:0xbfe8d0,d:'Three fast wind blades.'},'Rock Slam':{i:'🪨',k:'nova',m:1.6,cd:5,r:0,pierce:1,col:0xb59a6a,d:'Ground slam that ignores defense.'},'Frost Shard':{i:'❄️',k:'shot',m:1.3,cd:3,r:0,chill:1,col:0x9fe3ff,d:'Icy bolt that slows foes.'},'Flame Burst':{i:'🔥',k:'shot',m:2,cd:4,r:1,big:1,col:0xff7a2a,d:'Fireball that explodes on impact.'},'Drain Bite':{i:'🦷',k:'cone',m:1.3,cd:5,r:1,drain:1,col:0xd04a6a,d:'Bite in front of you, heals you.'},'Thunder Bolt':{i:'⚡',k:'beam',m:2.3,cd:6,r:1,col:0xfff06a,d:'Lightning line that hits everything ahead.'},'Dragon Rage':{i:'🐲',k:'nova',m:3.2,cd:10,r:2,big:1,col:0xb04aff,d:'Huge dragon-fire blast.'}};
const TR={Horned:[1,1.1,1,'+10% ATK'],Bulky:[1.12,1,1,'+12% HP'],Armored:[1,1,1.12,'+12% DEF'],Spiked:[1,1.05,1.05,'+5% ATK and DEF'],Universal:[1,1,1,'Can fuse with any type']};
const SPL={Foxlet:['Flame Burst'],Mossfrog:['Drain Bite','Frost Shard'],Stoneshell:['Rock Slam'],Skyhawk:['Gale Slash'],Ashwolf:['Drain Bite','Gale Slash'],Drakelet:['Flame Burst','Dragon Rage'],Batwing:['Drain Bite','Gale Slash'],Cryptspider:['Frost Shard','Drain Bite'],Gloomcap:['Frost Shard','Rock Slam'],Boneling:['Rock Slam','Thunder Bolt'],Wispling:['Thunder Bolt','Frost Shard'],Gravewyrm:['Drain Bite','Rock Slam']};
const VS={Ember:'Flame Burst',Frost:'Frost Shard',Shadow:'Drain Bite',Golden:'Thunder Bolt'};
const spl=(n,v)=>[...new Set([...SPL[n],...(VS[v]?[VS[v]]:[])])];
const pick=()=>{let r=Math.random()*100;for(const k in VAR){r-=VAR[k].w;if(r<0)return k}return ''};
const mul=c=>1+.1*c.f,need=l=>10*l*l+25*l+20;
const B=(c,k)=>c.g.reduce((s,n)=>s+S[n][k],0)/c.g.length,vm=(c,i)=>VAR[c.v].m[i]*(TR[c.tr]?TR[c.tr][i]:1);
const M=c=>cM(c),A=c=>cPA(c),D=c=>cPD(c),pot=c=>Math.round((c.iv.hp+c.iv.a+c.iv.d)/3*100);
// g = species it looks like, cl = their colors, sy = name syllables, mv = known moves
const mk=(n,l,f=0,v='',iv)=>mkC(n,l,f,v,iv),mkOld=(n,l,f=0,v='',iv)=>{const rv=()=>.85+Math.random()*.3;const s=S[n],col=new THREE.Color(s.c);if(v)col.lerp(new THREE.Color(VAR[v].c),.65);const c={n,l,x:0,f,v,iv:iv||{hp:rv(),a:rv(),d:rv()},g:[n],cl:[col.getHex()],sy:[s.h,s.t],z:.92+Math.random()*.2,tr:Math.random()<.55?['Horned','Bulky','Armored','Spiked'][R(0,3)]:'',sp:spl(n,v),cdm:{}};c.h=M(c);return c};
const em=c=>c.g.map(n=>S[n].e).join(''),nm=c=>em(c)+' '+(c.al?'Alpha ':'')+(c.shn?'✨ ':'')+(c.rv?c.rv+' ':'')+(c.v?c.v+' ':'')+c.n+' Lv'+c.l+'★'.repeat(Math.floor(c.fp||c.f||0))+(c.evo?' '+'✦'.repeat(c.evo):'');
const dmg=(a,b,k,p)=>dmgCE(a,b,k,p);
const W=1559,H=1010,TS=21,TK=1.5;
// ---- Progressive world: five zones separated by mountain ridges. The only way through each ridge is a walled town. ----
const TIER_LV=[[1,9],[10,19],[20,29],[30,39],[40,50]],ZN=['Kindlelight','Hillside Crest','Burningeye Summit','Searing Sands','The Citadel'];
// ---- v56: a floating stronghold, and six portal maps. Each map is a winding road that ends at a boss arena. ----
const PMAP=[
 {n:'Kindlelight',sub:'A drowned, gloomy bog',bi:1,lv:[1,8],t:1,x0:110,y0:8,col:0x7aff4a,ic:'🫧'},
 {n:'Hillside Crest',sub:'Windswept plains of the serpent folk',bi:2,lv:[9,17],t:2,x0:593,y0:8,col:0xd8c060,ic:'🐍'},
 {n:'Burningeye Summit',sub:'A frozen peak under a burning sky',bi:3,lv:[18,26],t:3,x0:1076,y0:8,col:0x9ad8ff,ic:'❄️'},
 {n:'Searing Sands',sub:'An endless scorched desert',bi:4,lv:[27,35],t:4,x0:110,y0:509,col:0xffa040,ic:'🏜️'},
 {n:'The Dirge',sub:'A haunted graveyard that never sleeps',bi:5,lv:[36,43],t:4,x0:593,y0:509,col:0x9affc8,ic:'🪦'},
 {n:'The Citadel',sub:'The halls of the vampire court',bi:6,lv:[44,50],t:5,x0:1076,y0:509,col:0xff3040,ic:'🏰'}];
// v89: every zone was made 30% bigger in each direction (260x270 -> 338x351); v97: 40% bigger again (473x491).
// PMS scales the generator's distances against the original 260x270 zone (1.3*1.4); PMA is the area against it.
const PMS=1.82,PMW=473,PMH=491,PMA=PMW*PMH/(260*270);
// v69: every map gets its own procedurally laid-out, wide, winding route with side branches, open fields and a sealed wave arena
const PM_TH_SEED=[7,19,31,43,57,71],PM_NC=8,PM_DENR=25; // 8 camps per zone (v88: 3, v89: 5)
PMAP.forEach((p,i)=>{p.i=i;let best=null,bsc=-1;for(let at=0;at<14;at++){const L0=pmGen(p,i,PM_TH_SEED[i]*7919+13+at*104729);const xs=[],ys=[];L0.pts.forEach(q=>{xs.push(q[0]);ys.push(q[1])});let sc=(Math.max(...xs)-Math.min(...xs))*(Math.max(...ys)-Math.min(...ys));if(L0.clr<50)sc*=.05;if(sc>bsc){bsc=sc;best=L0}}Object.assign(p,best.out)});
function pmGen(p,i,seed){let sd=seed;const rnd=()=>(sd=sd*16807%2147483647)/2147483647,ri=(a,b)=>a+rnd()*(b-a);
  const G=(x,y)=>[p.x0+Math.round(x),p.y0+Math.round(y)],cl=(v,a,b)=>Math.max(a,Math.min(b,v)),M=26,S=PMS;
  // pick a corner for the sealed wave arena, start on the far side, end with the boss on yet another side
  const CR=Math.round(34*S),cor=[[CR,CR],[PMW-CR,CR],[CR,PMH-CR],[PMW-CR,PMH-CR]],wc=Math.floor(rnd()*4),WA=cor[wc],opp=cor[3-wc];
  const SD=50*S,sides=[[[14,ri(SD,PMH-SD)],[PMW-20,ri(SD,PMH-SD)]],[[ri(SD,PMW-SD),14],[ri(SD,PMW-SD),PMH-18]]];let st,en;
  {const k=Math.floor(rnd()*2),flip=rnd()<.5,s0=sides[k];st=flip?s0[1]:s0[0];en=flip?s0[0]:s0[1];}
  const awayWA=(q,r)=>{const dx=q[0]-WA[0],dy=q[1]-WA[1],d=Math.hypot(dx,dy);if(d<r){q[0]=WA[0]+dx/(d||1)*r;q[1]=WA[1]+dy/(d||1)*r}q[0]=cl(q[0],M,PMW-M);q[1]=cl(q[1],M,PMH-M);return q};
  awayWA(st,62*S);st[0]=cl(st[0],14,PMW-14);st[1]=cl(st[1],14,PMH-14);
  const BM=Math.round(30*S);const ba=awayWA([cl(en[0],BM,PMW-BM),cl(en[1],BM,PMH-BM)],70*S);ba[0]=cl(ba[0],36,PMW-36);ba[1]=cl(ba[1],36,PMH-36);if(ba[0]<BM||ba[0]>PMW-BM||ba[1]<BM||ba[1]>PMH-BM){ba[0]=cl(ba[0],BM,PMW-BM);ba[1]=cl(ba[1],BM,PMH-BM)}
  // main road: wander from start to the boss with big sideways swings
  const N=20+Math.floor(rnd()*5),wp=[st.slice()],ux=ba[0]-st[0],uy=ba[1]-st[1],L=Math.hypot(ux,uy),nx=-uy/L,ny=ux/L,amp=ri(48*S,80*S),ph=rnd()*6.28,fr=ri(1.2,2.4);
  for(let k=1;k<N;k++){const t=k/N,o=amp*Math.sin(t*Math.PI*fr+ph)+ri(-16*S,16*S);wp.push(awayWA([st[0]+ux*t+nx*o,st[1]+uy*t+ny*o],60*S))}
  wp.push(ba.slice());
  // side branches ending in open fields, and a couple of wide clearings on the road
  const br=[],fd=[],nb=6+Math.floor(rnd()*2);
  for(let b=0;b<nb;b++){const k=1+Math.floor(rnd()*(N-2)),o=wp[k],a=rnd()*6.283,len=ri(45*S,85*S),e=awayWA([o[0]+Math.cos(a)*len,o[1]+Math.sin(a)*len],62*S),mid=[(o[0]+e[0])/2+ri(-14*S,14*S),(o[1]+e[1])/2+ri(-14*S,14*S)];
    br.push([o.slice(),awayWA(mid,58*S),e]);fd.push([e[0],e[1],ri(17*S,23*S)])}
  for(let f=0;f<6;f++){const k=2+Math.floor(rnd()*(N-3)),q=wp[k];fd.push([q[0],q[1],ri(19*S,25*S)])}
  // PM_NC camp clearings: field ends first, then spread along the road
  const NC=PM_NC,cls=[];let spc=64*S;const far=q=>Math.hypot(q[0]-st[0],q[1]-st[1])>30*S&&Math.hypot(q[0]-ba[0],q[1]-ba[1])>34*S&&cls.every(c=>Math.hypot(c[0]-q[0],c[1]-q[1])>spc);
  fd.forEach(f=>{if(cls.length<NC-1&&far(f))cls.push([f[0],f[1]])});
  const segs=[];for(let k=0;k<N;k++)segs.push([wp[k],wp[k+1]]);br.forEach(l=>{for(let k=0;k<l.length-1;k++)segs.push([l[k],l[k+1]])});
  for(let tries=0;cls.length<NC&&tries<4000;tries++){if(tries&&tries%150==0)spc=Math.max(36,spc-6);const sg=segs[Math.floor(rnd()*segs.length)],t=rnd(),q=[sg[0][0]+(sg[1][0]-sg[0][0])*t,sg[0][1]+(sg[1][1]-sg[0][1])*t];if(far(q))cls.push(q)}
  while(cls.length<NC){const q=wp[1+cls.length%(N-1)];cls.push([q[0]+3,q[1]+3])}
  // order camps along the road so their levels rise with the route
  const prog=q=>{let bi=0,bd=1e9;wp.forEach((w,k)=>{const d=Math.hypot(w[0]-q[0],w[1]-q[1]);if(d<bd){bd=d;bi=k}});return bi};cls.sort((a,b)=>prog(a)-prog(b));
  const out={wp:wp.map(q=>G(q[0],q[1])),br:br.map(l=>l.map(q=>G(q[0],q[1]))),fd:fd.map(f=>G(f[0],f[1]).concat([f[2]])),cl:cls.map(q=>G(q[0],q[1])),ba:G(ba[0],ba[1]),wa:G(WA[0],WA[1])};out.en=out.wp[0].slice();
  let clr=1e9;const chk=(x,y,r)=>{clr=Math.min(clr,Math.hypot(x-WA[0],y-WA[1])-r)},seg=(a,b,r)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2);for(let q=0;q<=n;q++){const t=q/n;chk(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,r)}};
  for(let k=0;k<N;k++)seg(wp[k],wp[k+1],21);br.forEach(l=>{for(let k=0;k<l.length-1;k++)seg(l[k],l[k+1],12)});fd.forEach(f=>chk(f[0],f[1],f[2]*1.2));cls.forEach(c=>chk(c[0],c[1],16));
  return {out,clr,pts:wp.concat(...br,fd.map(f=>[f[0]-f[2],f[1]-f[2]]),fd.map(f=>[f[0]+f[2],f[1]+f[2]]))}}
const regionAt=(x,y)=>{for(let i=0;i<PMAP.length;i++){const p=PMAP[i];if(x>=p.x0&&x<p.x0+PMW&&y>=p.y0&&y<p.y0+PMH)return i}return -1};
const tierAt=(x,y)=>{const r=regionAt(x,y);return r<0?1:PMAP[r].t};
var TWN100_SZ=100,TWN100_IW=56; // v100: Duskhold's walls reach cy+100; the inner wall at cy+56 closes the courtyard ward
const TOWNS=[
 {n:'Duskhold',tav:'The Last Lantern',cy:284,fx:40,pal:{wall:0x6a6470,wood:0x2a2026,roof:0x3a2a4a,stone:0x5a5662,ban:0x8a2a3a}}
].map((t,i)=>{t.i=i;t.cx=t.fx;t.sz=TWN100_SZ;t.mp=[t.cx,t.cy-11.85];t.mv=[t.cx+15.3,t.cy-11.55];t.col=[];t.tv=[t.cx-14.25,t.cy-11.25];t.sp=[t.cx,t.cy+10.5];return t});
const START=TOWNS[0].sp.slice();
const PCOURT=[84,284];
// v100 town: Duskhold's walls run from cy-TS (north) to cy+TWN100_SZ (south). Upper town cy-TS..cy+TS (plaza, north row),
// market ward cy+TS..cy+TWN100_IW (shop street), inner wall + gate at cy+TWN100_IW, courtyard ward behind it, south gate at
// cy+TWN100_SZ. Six portal gates stand on their own islands round the castle, joined by roads (TWN100_RD); PCOURT (the
// old Portal Court) is now the crossroads east of the main gate. Layout plan with coordinates: README "v100: town".
// the woodland courtyard inside the south ward of Duskhold (trees and stone to harvest)
// It starts small and grows by one ring per completed zone; ring i holds 6 nodes of every node type found in zone i.
// gate = the inner gate (north), gate2 = the south gate; the garden wall ring has an opening toward each.
const CYD={x:40,y:362,r0:9,dr:1.3,rmax:16.8,r:9,gate:[40,340],gate2:[40,384],nodes:[]};
// v100: the six portal gates, one island each (x,y centre, r radius, a = the spot in front of the portal: you arrive there)
const TWN100_PG=[{x:96,y:284,r:8.5,a:[90.5,284]},{x:84,y:252,r:8.5,a:[84,257.5]},{x:40,y:233,r:8.5,a:[40,238.5]},
 {x:86,y:322,r:8.5,a:[86,316.5]},{x:84,y:364,r:8.5,a:[84,358.5]},{x:40,y:415,r:8.5,a:[40,409.5]}];
// roads (polylines, 3 tiles wide) make a ring round the castle: east gate -> crossroads (PCOURT) -> Kindlelight; crossroads ->
// Hillside -> Burningeye; crossroads -> Sands -> Dirge -> Citadel <- south gate; west gate -> Burningeye and -> Citadel
const TWN100_RD=[[[61,284],[91,284]],[[84,284],[84,256]],[[84,284],[86,318]],[[86,326],[84,360]],[[80,371],[64,395],[46,412]],
 [[40,384],[40,410]],[[19,284],[13.5,284],[13.5,262],[22,247],[34,237]],[[13.5,284],[13.5,387],[22,404],[34,413]],[[79,248],[60,240],[46,236]]];
// v100: the market ward's shop plots (town-local tiles): side -1 = west row (facade at x=-5.5, faces the street to the east),
// +1 = east row; z = plot centre. The 7x5-tile footprint (|x| 6..12, z-2..z+2) is solid ('B'): building or fenced plot.
const TWN100_SH=[{k:'smith',s:-1,z:26},{k:'alch',s:-1,z:34},{k:'cook',s:-1,z:42},{k:'bard',s:-1,z:50},
 {k:'merchant',s:1,z:26},{k:'sage',s:1,z:34},{k:'trainer',s:1,z:42},{k:'stable',s:1,z:50}];
const townAt=(x,z,pad)=>TOWNS.findIndex(t=>Math.abs(x-t.cx)<=TS+.5+(pad||0)&&z>=t.cy-TS-.5-(pad||0)&&z<=t.cy+(t.sz||TS)+.5+(pad||0)); // v100: walls reach cy+sz
const BOSSES=[
 {name:'Argus, the Hundred-Eyed',title:'Watcher of Kindlelight',sp:'EyeWolf',lvl:9},
 {name:'The Crest Hydra',title:'Mother of Serpents',sp:'Hydra',lvl:18},
 {name:'The Rime Wraith',title:'Ghost of Burningeye Summit',sp:'IceWraith',lvl:27},
 {name:"Ssith'ra the Endless",title:'Devourer of the Searing Sands',sp:'Centipede',lvl:36},
 {name:'The Bloated One',title:'Rot-King of the Dirge',sp:'Abomination',lvl:44,hum:'abom'},
 {name:'Lord Vaelric',title:'The Crimson King of the Citadel',sp:'VampLord',lvl:51,hum:'vlord'}].map((b,i)=>{b.x=PMAP[i].ba[0];b.y=PMAP[i].ba[1];return b});
// Every creature type owns a region with its own terrain. gnd/grs/acc/frs/wat = colors, tree/pr = tree and prop kinds, den = [grass, accent, forest, water] density
const BIOMES=[
 {n:'Duskhold',sp:'Foxlet',x:40,y:284,t:1,gnd:[92,88,96],grs:[70,86,74],acc:[110,104,112],frs:[30,40,34],wat:[46,80,120],tree:['dead','pine'],pr:['rock','pillar'],den:[.3,.5,0,0],tc:[0x3a2a28,0x2a3a30,0x34443a]},
 {n:'Kindlelight',sp:'Mossfrog',x:210,y:112,t:1,gnd:[44,52,34],grs:[40,64,30],acc:[66,60,30],frs:[18,28,20],wat:[60,120,30],tree:['dead','dead','oak'],pr:['mush','bones','mush','bush','rock'],den:[1,1,.5,2.4],tc:[0x24301c,0x2a4a24,0x3a5a2a],amp:.35},
 {n:'Hillside Crest',sp:'Foxlet',x:420,y:112,t:2,gnd:[106,128,62],grs:[84,136,52],acc:[168,160,82],frs:[34,72,34],wat:[56,116,168],tree:['oak','oak','pine'],pr:['flower','flower','bush','rock','rock'],den:[1.3,.8,.4,.4],tc:[0x5a3a22,0x3f8a3a,0x58a84a],amp:.9},
 {n:'Burningeye Summit',sp:'Ashwolf',x:630,y:112,t:3,gnd:[206,216,228],grs:[178,194,214],acc:[146,166,190],frs:[34,64,66],wat:[150,200,232],tree:['pine','pine','dead'],pr:['rock','crystal','rock','bush'],den:[.8,.9,.5,.6],tc:[0x3a2a28,0x214a50,0x2a5a60],amp:1.3},
 {n:'Searing Sands',sp:'Gravewyrm',x:210,y:336,t:4,gnd:[204,164,100],grs:[180,146,82],acc:[222,186,124],frs:[122,102,62],wat:[62,120,140],tree:['cactus','cactus','spire'],pr:['rock','bones','pillar','bones'],den:[.5,1,.2,.1],tc:[0x4a7a3a,0x5a8a44,0x6a9a50],amp:1},
 {n:'The Dirge',sp:'Boneling',x:420,y:336,t:4,gnd:[64,70,78],grs:[58,74,72],acc:[90,94,100],frs:[24,30,34],wat:[80,140,150],tree:['dead','dead','crystal'],pr:['grave','grave','bones','pillar','mush'],den:[.7,.9,.4,.4],tc:[0x2a2a30,0x3a4a50,0x4a5a64],amp:.5},
 {n:'The Citadel',sp:'Batwing',x:630,y:336,t:5,gnd:[66,58,62],grs:[90,30,36],acc:[96,88,92],frs:[30,24,28],wat:[90,20,30],tree:['dead'],pr:['pillar','pillar','bones'],den:[0,.6,0,0],tc:[0x2a1a1a,0x3a2028,0x4a2a30],amp:.08}
];

const MAP=(()=>{
  let sd=11;const rnd=()=>(sd=sd*16807%2147483647)/2147483647,m=[],bio=[];
  for(let y=0;y<H;y++){m.push(new Array(W).fill(''));bio.push(new Array(W).fill(0))}
  const DW=new Float32Array(W*H).fill(99); // signed distance to the walkable edge (negative = inside)
  const stamp=(cx,cy,r)=>{for(let y=Math.max(1,Math.floor(cy-r-5));y<=Math.min(H-2,Math.ceil(cy+r+5));y++)for(let x=Math.max(1,Math.floor(cx-r-5));x<=Math.min(W-2,Math.ceil(cx+r+5));x++){const d=Math.hypot(x-cx,y-cy)-r,k=y*W+x;if(d<DW[k])DW[k]=d}};
  // ---- the floating stronghold: the town square, a road east, and the portal court ----
  const T=TOWNS[0];
  // v100: the island is a rectangle round the walls (north square + south ward) with a 7-tile apron
  const SE=T.sz-TS;
  for(let y=T.cy-31;y<=T.cy+SE+31;y++)for(let x=T.cx-31;x<=T.cx+31;x++){const dz=y<T.cy?T.cy-y:y>T.cy+SE?y-T.cy-SE:0,d=Math.max(Math.abs(x-T.cx),dz)-28-1.5*Math.sin(x*.7+y*.4),k=y*W+x;if(d<DW[k])DW[k]=d}
  // roads, the crossroads by the main gate and the six portal islands
  const road=(L,r)=>{for(let i=0;i<L.length-1;i++){const [ax,ay]=L[i],[bx,by]=L[i+1],n=Math.ceil(Math.hypot(bx-ax,by-ay)*2);for(let q=0;q<=n;q++)stamp(ax+(bx-ax)*q/n,ay+(by-ay)*q/n,r)}};
  TWN100_RD.forEach(L=>road(L,2.7));stamp(PCOURT[0],PCOURT[1],6);
  TWN100_PG.forEach(p=>{stamp(p.x,p.y,p.r);stamp(p.x+p.r*.35,p.y-p.r*.3,p.r*.72);stamp(p.x-p.r*.4,p.y+p.r*.3,p.r*.7)});
  // ---- the six portal maps ----
  PMAP.forEach(p=>{
    const pts=[];for(let i=0;i<p.wp.length-1;i++){const [ax,ay]=p.wp[i],[bx,by]=p.wp[i+1],n=Math.ceil(Math.hypot(bx-ax,by-ay));for(let s=0;s<n;s++){const q=s/n;pts.push([ax+(bx-ax)*q,ay+(by-ay)*q])}}
    pts.push(p.wp[p.wp.length-1]);p.path=pts;
    pts.forEach(([x,y],i)=>{if(i%2)return;const hw=12+3*Math.sin(i*.045+p.i)+2*Math.sin(i*.13+p.i*2);stamp(x+3*Math.sin(i*.07),y+3*Math.cos(i*.05),hw)});
    p.br.forEach(l=>{for(let k=0;k<l.length-1;k++){const [ax,ay]=l[k],[bx,by]=l[k+1],n=Math.ceil(Math.hypot(bx-ax,by-ay)/2);for(let q=0;q<=n;q++){const t=q/n;stamp(ax+(bx-ax)*t,ay+(by-ay)*t,9+2*Math.sin(q*.4+k))}}});
    p.fd.forEach(([x,y,r])=>{stamp(x,y,r);stamp(x+r*.45,y-r*.3,r*.7);stamp(x-r*.4,y+r*.35,r*.65)});
    p.cl.forEach(([x,y])=>stamp(x,y,17));stamp(p.ba[0],p.ba[1],PM_DENR);stamp(p.wa[0],p.wa[1],15);
    for(let y=p.y0;y<p.y0+PMH;y++)for(let x=p.x0;x<p.x0+PMW;x++)bio[y][x]=p.bi;
  });
  const isW=(x,y)=>DW[y*W+x]<0;
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const d=DW[y*W+x],r=regionAt(x,y);
    if(d<0)m[y][x]='.';
    else if(r>=0&&d<2.6){const b=BIOMES[PMAP[r].bi];m[y][x]=b.n=='The Citadel'?'':(b.n=='Searing Sands'||d>1.6?'R':'#')}}
  // keep the regions sealed from each other (a 1-tile border is always void)
  PMAP.forEach(p=>{for(let x=p.x0;x<p.x0+PMW;x++){m[p.y0][x]='';m[p.y0+PMH-1][x]=''}for(let y=p.y0;y<p.y0+PMH;y++){m[y][p.x0]='';m[y][p.x0+PMW-1]=''}});
  // grass, accent and water patches inside the walkable ground
  const blob=(ch,bi,n,a,b2)=>{const p=PMAP[bi-1];for(let i=0;i<n;i++){let cx=0,cy=0;for(let k=0;k<60;k++){const q=p.path[Math.floor(rnd()*p.path.length)];cx=Math.round(q[0]+(rnd()-.5)*22);cy=Math.round(q[1]+(rnd()-.5)*22);if(m[cy]&&m[cy][cx]=='.')break}
    const r=a+rnd()*(b2-a);for(let y=Math.floor(cy-r*1.3)-1;y<cy+r*1.3+1;y++)for(let x=Math.floor(cx-r)-1;x<cx+r+1;x++){if(!m[y]||m[y][x]!='.')continue;if(Math.hypot(x-cx,(y-cy)*1.25)<r*(.75+.25*Math.sin(x*1.7+y*1.1+i)))m[y][x]=ch}}};
  PMAP.forEach(p=>{const b=BIOMES[p.bi],d=b.den;blob('g',p.bi,Math.round(40*PMA*d[0]),3,7);blob('a',p.bi,Math.round(26*PMA*d[1]),3,7);blob('~',p.bi,Math.round(9*PMA*d[3]),1.6,3.4)});
  // never block the road itself or the arenas with water
  const keep=(cx,cy,r)=>{for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++)if(m[y]&&m[y][x]=='~'&&Math.hypot(x-cx,y-cy)<r)m[y][x]='a'};
  PMAP.forEach(p=>{p.path.forEach(([x,y],i)=>{if(i%2==0)keep(x,y,3.2)});p.cl.forEach(c=>keep(c[0],c[1],14));keep(p.ba[0],p.ba[1],PM_DENR+1);keep(p.wa[0],p.wa[1],16)});
  const props=[];
  // harvest nodes: a few small clusters of one kind each (about a quarter of the old scattered count)
  const okT=(x,y)=>{const t=m[y]&&m[y][x];return t=='.'||t=='g'||t=='a'},rockK=k=>k=='rock'||k=='grave'||k=='pillar',used=new Set();
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){const r=regionAt(x,y);if(r<0||!okT(x,y))continue;const b=BIOMES[bio[y][x]];
    if(rnd()>=.0012*(b.pd||1))continue;
    const wt=b.pr.map(k=>rockK(k)?.6:1),tot=wt.reduce((a,v)=>a+v,0);let u=rnd()*tot,k=b.pr[0];for(let i=0;i<b.pr.length;i++){u-=wt[i];if(u<=0){k=b.pr[i];break}}
    if(Math.hypot(x-PMAP[r].ba[0],y-PMAP[r].ba[1])<PM_DENR+4)continue; // v89: the den circle stays open
    if(rockK(k)&&PMAP[r].path.some((q,i)=>i%3==0&&Math.hypot(q[0]-x,q[1]-y)<5))continue; // keep rocks off the road
    const n=3+Math.floor(rnd()*3);let got=0;
    for(let tr=0;tr<30&&got<n;tr++){const a=rnd()*6.283,d=tr?.8+rnd()*1.9:0,cx=Math.round(x+Math.cos(a)*d),cy=Math.round(y+Math.sin(a)*d),key=cy*W+cx;
      if(used.has(key)||!okT(cx,cy)||regionAt(cx,cy)!==r)continue;
      used.add(key);if(rockK(k))m[cy][cx]='r';props.push([cx,cy,k]);got++}}
  // boss arenas: rune floor, ring of columns and four cover pillars
  BOSSES.forEach(b=>{for(let y=b.y-22;y<=b.y+22;y++)for(let x=b.x-22;x<=b.x+22;x++)if(Math.hypot(x-b.x,y-b.y)<15.5*DK)m[y][x]='a';
    });
  // the stronghold town (same layout as before)
  TOWNS.forEach(t=>{
    for(let dy=-TS-3;dy<=TS+3;dy++)for(let dx=-TS-3;dx<=TS+3;dx++){const x=t.cx+dx,y=t.cy+dy;const ax=Math.abs(dx),ay=Math.abs(dy);
      if(ax<TS&&ay<TS)m[y][x]='P';else if(ax<=TS&&ay<=TS)m[y][x]=(ax==TS&&ay<=1)?'P':'W';else if(m[y][x]=='')m[y][x]='.'}
    // v100: the old south wall (dy=TS) opens into the market ward (paved) down to the inner wall at dy=IW (3-tile gate),
    // then the courtyard ward (grass) down to the south wall at dy=sz (3-tile gate); side walls all the way
    if(t.sz>TS){const IW=TWN100_IW;for(let dy=TS;dy<=t.sz+3;dy++)for(let dx=-TS-3;dx<=TS+3;dx++){const x=t.cx+dx,y=t.cy+dy,ax=Math.abs(dx);
      if(dy>t.sz||ax>TS){if(m[y][x]=='')m[y][x]='.';continue}
      if(ax==TS){m[y][x]='W';continue}
      if(dy==IW||dy==t.sz){m[y][x]=ax<=1?'P':'W';continue}
      if(dy==TS){m[y][x]=ax<=3?'P':'W';continue}
      if(dy<IW)m[y][x]='P';else{m[y][x]=(x*7+y*3)%5==0?'g':'.';bio[y][x]=2}}
     TWN100_SH.forEach(q=>{for(let z=q.z-2;z<=q.z+2;z++)for(let a=6;a<=12;a++)m[t.cy+z][t.cx+q.s*a]='B'})}
    const B=(x0,x1,y0,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)m[t.cy+y][t.cx+x]='B'};
    B(-17,-11,-18,-14);B(-2,2,-18,-14);B(12,17,-18,-14);B(-1,1,-12,-12);
    for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++)if(x*x+y*y<=6)m[t.cy+y][t.cx+x]='B';
  });
  // v100: dirt roads (3 wide) outside the portal islands; each island takes its zone's ground (bio) with accent patches
  {const inPG=(x,y)=>TWN100_PG.some(p=>Math.hypot(x-p.x,y-p.y)<p.r-.6);
   TWN100_RD.forEach(L=>{for(let i=0;i<L.length-1;i++){const [ax,ay]=L[i],[bx,by]=L[i+1],n=Math.ceil(Math.hypot(bx-ax,by-ay)*2);
     for(let q=0;q<=n;q++){const cx=ax+(bx-ax)*q/n,cy=ay+(by-ay)*q/n;for(let y=Math.round(cy)-2;y<=Math.round(cy)+2;y++)for(let x=Math.round(cx)-2;x<=Math.round(cx)+2;x++)
       if(Math.hypot(x-cx,y-cy)<1.45&&m[y][x]=='.'&&!inPG(x,y))m[y][x]='p'}}});
   TWN100_PG.forEach((p,i)=>{const b=PMAP[i].bi;for(let y=Math.floor(p.y-p.r*1.5);y<=p.y+p.r*1.5;y++)for(let x=Math.floor(p.x-p.r*1.5);x<=p.x+p.r*1.5;x++){if(!m[y]||m[y][x]==='')continue;
     const d=Math.hypot(x-p.x,y-p.y);if(d>p.r*1.4)continue;bio[y][x]=b;if(m[y][x]=='p'&&d<p.r+2)m[y][x]='.';
     if(m[y][x]=='.'){const h=(x*7+y*13)%11;if(i==1&&h<5)m[y][x]='g';else if(i==0&&h<3)m[y][x]='g';else if(d>p.r-1.5&&h<3)m[y][x]='a'}}})}
  // ---- the courtyard: south gate path, a grove at the heart, then one ring of nodes per zone (walls are placed at runtime) ----
  {const C=CYD,inC=(x,y)=>Math.hypot(x-C.x,y-C.y),R=C.rmax+.6;
   for(let y=Math.floor(C.y-R);y<=C.y+R;y++)for(let x=Math.floor(C.x-R);x<=C.x+R;x++){if(m[y][x]!=='.'&&m[y][x]!=='g')continue; // v100: inside the ward
     if(inC(x,y)<R){bio[y][x]=2;if(m[y][x]=='.'&&(x*7+y*3)%5==0)m[y][x]='g'}}
   [C.gate,C.gate2].forEach(G=>{for(let q=0;q<=1;q+=.03){const x=Math.round(C.x+(G[0]-C.x)*q),y=Math.round(C.y+(G[1]-C.y)*q);if(Math.hypot(x-C.x,y-C.y)<3.2)continue;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(m[y+dy][x+dx]=='g'||m[y+dy][x+dx]=='.')m[y+dy][x+dx]='p'}}); // v100: a path from each gate
   const nearP=(x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(m[y+dy][x+dx]=='p')return true;return false};
   const spot=(cx,cy,rad,n,lo,hi,fn)=>{let got=0;for(let tr=0;tr<80&&got<n;tr++){const a=rnd()*6.283,d=tr?rnd()*rad:0,x=Math.round(cx+Math.cos(a)*d),y=Math.round(cy+Math.sin(a)*d);
     if(!'.g'.includes(m[y][x])||inC(x,y)>hi||inC(x,y)<lo||nearP(x,y))continue;fn(x,y);got++}};
   const rk=k=>k=='rock'||k=='grave'||k=='pillar',put=(x,y,k,zi)=>{if(rk(k))m[y][x]='r';props.push([x,y,k]);C.nodes.push([x,y,k,zi])};
   // the heart: trees for wood and a little stone, always open
   const hi0=C.r0-1.6;[[-4,-2],[-1,-4.5],[3,-4],[4.5,0],[-4.5,2]].forEach(([dx,dy])=>spot(C.x+dx,C.y+dy,1.8,4,2.6,hi0,(x,y)=>m[y][x]='#'));
   [[-2,-3],[4,2.5]].forEach(([dx,dy])=>spot(C.x+dx,C.y+dy,1.5,3,2.6,hi0,(x,y)=>put(x,y,'rock',-1)));
   // ring i opens when zone i is completed: 6 nodes of every node type that grows in that zone
   PMAP.forEach((p,i)=>{const lo=C.r0-1.6+C.dr*i+.15,hi=C.r0-1.6+C.dr*(i+1),kinds=[...new Set(BIOMES[p.bi].pr)];
     kinds.forEach((k,j)=>{let got=0;const a0=j/kinds.length*6.283+i*.7;
       for(let tr=0;tr<400&&got<6;tr++){const a=a0+(rnd()-.5)*(6.283/kinds.length)*.9,d=lo+rnd()*(hi-lo),x=Math.round(C.x+Math.cos(a)*d),y=Math.round(C.y+Math.sin(a)*d);
         if(!'.g'.includes(m[y][x])||nearP(x,y))continue;const dd=inC(x,y);if(dd<lo-.3||dd>hi+.3)continue;put(x,y,k,i);got++}})});
  }
  m.bio=bio;m.DW=DW;
  const cyk=new Set(CYD.nodes.map(q=>q[1]*W+q[0])); // v100: the courtyard's nodes are inside the walls now
  m.props=props.filter(q=>(townAt(q[0],q[1],3)<0||cyk.has(q[1]*W+q[0]))&&(['rock','grave','pillar'].includes(q[2])?m[q[1]][q[0]]=='r':'.ga'.includes(m[q[1]][q[0]])&&!BOSSES.some(b=>Math.hypot(q[0]-b.x,q[1]-b.y)<PM_DENR+1)&&!PMAP.some(p=>Math.hypot(q[0]-p.wa[0],q[1]-p.wa[1])<16||Math.hypot(q[0]-p.en[0],q[1]-p.en[1])<5)));
  return m})();

const tDist=(x,z)=>{let d=1e9;for(const t of TOWNS){const se=(t.sz||TS)-TS,dz=z<t.cy?t.cy-z:z>t.cy+se?z-t.cy-se:0,q=Math.max(Math.abs(x-t.cx),dz);if(q<d)d=q}return d}; // v100
// ---- visual terrain: smooth heightfield (collision stays tile-based) ----
const smt=(a,b,x)=>{x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)};
const hh2=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
const vnz=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return hh2(ix,iy)*(1-u)*(1-v)+hh2(ix+1,iy)*u*(1-v)+hh2(ix,iy+1)*(1-u)*v+hh2(ix+1,iy+1)*u*v};
const fbm2=(x,y,o)=>{let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*vnz(x*f,y*f);f*=2.03;a*=.5}return s/(1-Math.pow(.5,o))*.5+0};
const HPD=2,HW=W+2*HPD+1,HH=H+2*HPD+1,HF=new Float32Array(HW*HH);
const GHv=(i,j)=>HF[(Math.max(-HPD,Math.min(W+HPD,j))+HPD)*HW+Math.max(-HPD,Math.min(W+HPD,i))+HPD];
const GH=(x,z)=>{if(x<-1||z<-1||x>W||z>H)return 0;const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j;return GHv(i,j)*(1-fx)*(1-fz)+GHv(i+1,j)*fx*(1-fz)+GHv(i,j+1)*(1-fx)*fz+GHv(i+1,j+1)*fx*fz};
const gY=(p,o)=>new THREE.Vector3(p.x,GH(p.x,p.z)+o,p.z);
{
  const DW=MAP.DW,sp=x=>x<-5?0:Math.log1p(Math.exp(x*1.5))/1.5;
  const base=(x,y,a)=>.55+sp(1.0+(fbm2(x*.02+3,y*.02+9,4)-.5)*6*a+(fbm2(x*.07,y*.07+4,3)-.5)*1.6*a);
  const supd=(x,y,t)=>{const se=(t.sz||TS)-TS,dy=y<t.cy?t.cy-y:y>t.cy+se?y-t.cy-se:0;return Math.pow(Math.pow(Math.abs(x-t.cx),4)+Math.pow(dy,4),.25)}; // v100: walls reach cy+sz
  TOWNS.forEach(t=>{t.ph=1.6});
  for(let j=-HPD;j<=H+HPD;j++)for(let i=-HPD;i<=W+HPD;i++){
    const tx=Math.max(0,Math.min(W-1,i)),ty=Math.max(0,Math.min(H-1,j)),k=ty*W+tx,r=regionAt(tx,ty),d=DW[k];let h;
    if(r<0){ // the floating stronghold, and empty sky everywhere else
      h=1.6+.05*fbm2(i*.2,j*.2,2);const dd=Math.max(0,d);h-=48*smt(0,4,dd)*(1+.3*fbm2(i*.1,j*.1,3));
      TOWNS.forEach(t=>{const q=supd(i,j,t),m=smt(TS+1,TS+6,q);h=h*m+t.ph*(1-m)});
    }else{
      const b=BIOMES[PMAP[r].bi],a=b.amp==null?1:b.amp;h=base(i,j,a);
      if(MAP[ty][tx]=='~')h=-1.2;
      const dd=Math.max(0,d);h+=(b.n=='The Citadel'?6.5*smt(0,1.2,dd)-60*smt(4,9,dd):(10+5*fbm2(i*.09,j*.09,3))*smt(.6,7,dd)+dd*.15-62*smt(12,19,dd));
      const p=PMAP[r];[[p.ba,Math.max(PM_DENR+3,22*DK),5*DK],[p.wa,19,5]].forEach(([c,R0,W0])=>{const q=Math.hypot(i-c[0],j-c[1]),m=smt(R0-W0,R0,q);if(d<0)h=h*m+.6*(1-m)});
    }
    HF[(j+HPD)*HW+i+HPD]=h;
  }
}

let party=[],inv={},gear=[],eggs=[],incS={},eq={},px=2,py=2,foe=null,busy=false,lines=[],sel=[];

// ---------- 3D scene ----------
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(58,4/3,.1,260);
const ren=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});ren.info.autoReset=false;ren.shadowMap.enabled=true;ren.shadowMap.type=THREE.PCFShadowMap;ren.toneMapping=THREE.NoToneMapping;ren.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
const pmr=new THREE.PMREMGenerator(ren),es=new THREE.Scene();es.add(new THREE.Mesh(new THREE.SphereGeometry(10,16,8),new THREE.MeshBasicMaterial({color:0x4a5470,side:THREE.BackSide})));scene.environment=pmr.fromScene(es).texture;
$('gl').appendChild(ren.domElement);
const sky=new THREE.Color(0x9fb4c8);
scene.background=sky;scene.fog=new THREE.FogExp2(sky,.0185);
const hemi=new THREE.HemisphereLight(0x9fb8e0,0x4a3c2c,.75),sun=new THREE.DirectionalLight(0xffe0b0,2),torch=new THREE.PointLight(0xff9a50,1.5,11);scene.add(torch);
sun.position.set(4,14,2);sun.target.position.set(10,0,6.5);scene.add(hemi,sun,sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0006;sun.shadow.normalBias=.04;sun.shadow.radius=2.5;Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:110});

