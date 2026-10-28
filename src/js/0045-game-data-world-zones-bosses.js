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
const W=1180,H=2030,TS=21,TK=1.5; // v106: 6 rows of 3 zone instances (see PMI below); H*GPX stays under 4096 px
// ---- Progressive world: five zones separated by mountain ridges. The only way through each ridge is a walled town. ----
const TIER_LV=[[1,9],[10,19],[20,29],[30,39],[40,50]],ZN=['Kindlelight','Hillside Crest','Burningeye Summit','Searing Sands','The Citadel'];
// ---- v56: a floating stronghold, and six portal maps. Each map is a winding road that ends at a boss arena. ----
const PMAP=[
 {n:'Kindlelight',sub:'A drowned, gloomy bog',bi:1,lv:[1,8],t:1,col:0x7aff4a,ic:'🫧'},
 {n:'Hillside Crest',sub:'Windswept plains of the serpent folk',bi:2,lv:[9,17],t:2,col:0xd8c060,ic:'🐍'},
 {n:'Burningeye Summit',sub:'A frozen peak under a burning sky',bi:3,lv:[18,26],t:3,col:0x9ad8ff,ic:'❄️'},
 {n:'Searing Sands',sub:'An endless scorched desert',bi:4,lv:[27,35],t:4,col:0xffa040,ic:'🏜️'},
 {n:'The Dirge',sub:'A haunted graveyard that never sleeps',bi:5,lv:[36,43],t:4,col:0x9affc8,ic:'🪦'},
 {n:'The Citadel',sub:'The halls of the vampire court',bi:6,lv:[44,50],t:5,col:0xff3040,ic:'🏰'}];
// v89: every zone was made 30% bigger in each direction (260x270 -> 338x351); v97: 40% bigger again (473x491).
// v106: every zone is split into three instances, I -> II -> III, each half the area of the v97 zone (350x331). Zone i is
// row i of the grid, instance k is column k, with a 6-tile void between neighbours (regionAt = zone, rgAt = instance key
// g = zone*3+k, insAt = the instance record). Enemy levels rise through I, II and III (the zone's range split in thirds,
// pmLvSplit). Instance III holds the Sovereign's den and the wave arena; the end of I and II is a gateway to the next one.
// PMS scales the generator's distances against the original 260x270 zone (the square root of the area ratio); PMA is the area.
// v108: the field instances are half that area again (248x234), and the Sovereign's den and the Wave Trial are instances of
// their own. Row i holds zone i: I, II, III (fields), the Den (k 3) and the Wave Trial (k 4), 6 tiles of void apart. The field
// instances I -> II -> III -> Den are what you reach in turn (PMI = 4, INSR 0..3); the Trial is entered from the zone's portal.
// Instance key g = zone*PMG+k (insG); every instance record has its own x0,y0,w,h. III ends in a gateway to the Den.
const PMF=3,PMI=4,PMG=5,PMW=248,PMH=234,PMS=Math.sqrt(PMW*PMH/(260*270)),PMA=PMW*PMH/(260*270),PM_X0=110,PM_Y0=8,PM_RN=['I','II','III','Den','Trial'];
const PM_DNW=136,PM_DNH=176,PM_TRW=84,PM_TRH=84,PM_W=[PMW,PMW,PMW,PM_DNW,PM_TRW],PM_H=[PMH,PMH,PMH,PM_DNH,PM_TRH];
const PM_CX=PM_W.reduce((a,w,k)=>(a.push(k?a[k-1]+PM_W[k-1]+6:PM_X0),a),[]),PM_PY=Math.max(...PM_H)+6;
const insG=(z,k)=>z*PMG+k;
// v69: every map gets its own procedurally laid-out, wide, winding route with side branches, open fields and a sealed wave arena
const PM_TH_SEED=[7,19,31,43,57,71],PM_NC=3,PM_DENR=Math.round(25*DK/1.35),PM_GTR=14; // v108: 3 camps per field instance (9 per zone); PM_DENR: the den clearing (grows with DK); PM_GTR: gateway clearing
const INSL=[];
function pmLvSplit(lv,k){if(k>=PMF)return [lv[1],lv[1]];const n=lv[1]-lv[0]+1,b=q=>lv[0]+Math.round(n*q/PMF);return [b(k),b(k+1)-1]}
PMAP.forEach((p,i)=>{p.i=i;p.ins=[];
  for(let k=0;k<PMG;k++){const I={z:i,k,g:insG(i,k),x0:PM_CX[k],y0:PM_Y0+i*PM_PY,w:PM_W[k],h:PM_H[k],fld:k<PMF,den:k==PMF,tri:k==PMF+1,lv:pmLvSplit(p.lv,k),
      n:k<PMF?p.n+' '+PM_RN[k]:p.n+(k==PMF?' · Sovereign’s Den':' · Wave Trial'),rn:PM_RN[k]};
    if(I.fld){let best=null,bsc=-1;for(let at=0;at<14;at++){const L0=pmGen(I,i,PM_TH_SEED[i]*7919+13+at*104729+k*7717,true);const xs=[],ys=[];L0.pts.forEach(q=>{xs.push(q[0]);ys.push(q[1])});const sc=(Math.max(...xs)-Math.min(...xs))*(Math.max(...ys)-Math.min(...ys));if(sc>bsc){bsc=sc;best=L0}}
      Object.assign(I,best.out);I.wa=null}
    else if(I.den)Object.assign(I,pmDen(I,PM_TH_SEED[i]*104729+5));
    else{const c=[I.x0+Math.round(I.w/2),I.y0+Math.round(I.h/2)];Object.assign(I,{wp:[c],br:[],fd:[],cl:[],ba:c,wa:c,en:c.slice()})}
    if(k<PMI)p.ins.push(I);else p.tri=I;INSL.push(I)}
  // zone-level fields that older code reads: the den's road and clearing, the trial's arena, the first instance's entrance and
  // corner, and every instance's camps (CAMPS records which instance each camp is in: C.ig)
  const D=p.ins[PMF];['wp','br','fd','ba'].forEach(k=>p[k]=D[k]);p.wa=p.tri.wa;p.cl=[].concat(...p.ins.map(I=>I.cl));p.en=p.ins[0].en;p.x0=p.ins[0].x0;p.y0=p.ins[0].y0});
// v108: the den instance — the road comes in from the north edge and winds gently down into the den clearing near the south
function pmDen(I,seed){let sd=seed;const rnd=()=>(sd=sd*16807%2147483647)/2147483647;
  const cx=I.x0+Math.round(I.w/2),ba=[cx,I.y0+I.h-PM_DENR-28],st=[cx+Math.round((rnd()-.5)*24),I.y0+14],N=7,wp=[];
  for(let k=0;k<=N;k++){const t=k/N,o=k&&k<N?(rnd()-.5)*22*Math.sin(t*Math.PI):0;wp.push([Math.round(st[0]+(ba[0]-st[0])*t+o),Math.round(st[1]+(ba[1]-st[1])*t)])}
  return {wp,br:[],fd:[],cl:[],ba,wa:null,en:wp[0].slice()}}
function pmGen(p,i,seed,nw){let sd=seed;const rnd=()=>(sd=sd*16807%2147483647)/2147483647,ri=(a,b)=>a+rnd()*(b-a);
  const G=(x,y)=>[p.x0+Math.round(x),p.y0+Math.round(y)],cl=(v,a,b)=>Math.max(a,Math.min(b,v)),M=26,S=PMS;
  // pick a corner for the sealed wave arena, start on the far side, end with the boss on yet another side
  const CR=Math.round(34*S),cor=[[CR,CR],[PMW-CR,CR],[CR,PMH-CR],[PMW-CR,PMH-CR]],wc=Math.floor(rnd()*4),WA=nw?[-1e5,-1e5]:cor[wc],opp=cor[3-wc]; // nw: no wave arena (instances I, II)
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
const insAt=(x,y)=>{const r=Math.floor((y-PM_Y0)/PM_PY);if(r>=PMAP.length&&typeof spIns=='function')return spIns(x,y);if(r<0||r>=PMAP.length||x<PM_X0)return null; // v152: special instances below the grid (3150 spIns, off until registered)
  let c=PMG-1;while(c>0&&x<PM_CX[c])c--;const I=INSL[insG(r,c)];return x<I.x0+I.w&&y<I.y0+I.h?I:null};
const regionAt=(x,y)=>{const I=insAt(x,y);return I?I.z:-1};
const rgAt=(x,y)=>{const I=insAt(x,y);return I?I.g:-1};
const tierAt=(x,y)=>{const r=regionAt(x,y);return r<0?1:PMAP[r].t};
var TWN100_SZ=51,TWN100_IW=51,TWN100_WX=36; // v101: one Grand Square — walls at x ±36 (TWN100_WX), z -21..+51; no inner wards (IW = SZ)
const TOWNS=[
 {n:'Duskhold',tav:'The Last Lantern',cy:284,fx:40,pal:{wall:0x6a6470,wood:0x2a2026,roof:0x3a2a4a,stone:0x5a5662,ban:0x8a2a3a}}
].map((t,i)=>{t.i=i;t.cx=t.fx;t.sz=TWN100_SZ;t.mp=[t.cx,t.cy-11.85];t.mv=[t.cx+15.3,t.cy-11.55];t.col=[];t.tv=[t.cx-14.25,t.cy-11.25];t.sp=[t.cx,t.cy+8.4];return t}); // v109: spawn a little north (the smallest kingdom's south wall is at z 11)
const START=TOWNS[0].sp.slice();
const PCOURT=[40,347]; // v101: the crossroads just outside the south gate, where the Portal Road begins
// v100 town: Duskhold's walls run from cy-TS (north) to cy+TWN100_SZ (south). Upper town cy-TS..cy+TS (plaza, north row),
// market ward cy+TS..cy+TWN100_IW (shop street), inner wall + gate at cy+TWN100_IW, courtyard ward behind it, south gate at
// cy+TWN100_SZ. Six portal gates stand on their own islands round the castle, joined by roads (TWN100_RD); PCOURT (the
// old Portal Court) is now the crossroads east of the main gate. Layout plan with coordinates: README "v100: town".
// v103: the garden park (CYD) is gone — the south half of the Grand Square holds building lots now. CYD stays as an empty
// record (no nodes) because old code and the save loader still read its gate spots.
const CYD={x:40,y:317,r0:9,dr:1.3,rmax:16.8,r:9,gate:[40,299],gate2:[40,335],nodes:[]};
// v100: the six portal gates, one island each (x,y centre, r radius, a = the spot in front of the portal: you arrive there)
// v101: the Portal Road runs straight south from the south gate; gates I..VI stand in order along it, alternating east/west
const TWN100_PG=[0,1,2,3,4,5].map(i=>{const y=362+i*27,s=i%2?-1:1,x=40+s*16;return {x,y,r:10,a:[x-s*7,y],side:s}});
// roads (polylines, 3 tiles wide) make a ring round the castle: east gate -> crossroads (PCOURT) -> Kindlelight; crossroads ->
// Hillside -> Burningeye; crossroads -> Sands -> Dirge -> Citadel <- south gate; west gate -> Burningeye and -> Citadel
const TWN100_RD=[[[40,335],[40,TWN100_PG[5].y+7]]].concat(TWN100_PG.map(p=>[[40,p.y],[p.a[0],p.y]]));
// v100: the market ward's shop plots (town-local tiles): side -1 = west row (facade at x=-5.5, faces the street to the east),
// +1 = east row; z = plot centre. The 7x5-tile footprint (|x| 6..12, z-2..z+2) is solid ('B'): building or fenced plot.
// v101: the shops line the west (s=-1, facing +x) and east (s=+1, facing -x) sides of the Grand Square; x = plot centre
const TWN100_SH=[{k:'smith',s:-1,z:-9},{k:'alch',s:-1,z:2},{k:'cook',s:-1,z:13},{k:'bard',s:-1,z:24},
 {k:'merchant',s:1,z:-9},{k:'sage',s:1,z:2},{k:'trainer',s:1,z:13},{k:'stable',s:1,z:24}].map(q=>Object.assign(q,{x:q.s*29.5,ry:TWN100_ry(q)}));
const townAt=(x,z,pad)=>TOWNS.findIndex(t=>Math.abs(x-t.cx)<=TWN100_WX+.5+(pad||0)&&z>=t.cy-TS-.5-(pad||0)&&z<=t.cy+(t.sz||TS)+.5+(pad||0)); // v100: walls reach cy+sz
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
if(typeof v112Biomes=='function')v112Biomes(); // v112: one biome per themed field instance (II, III; 1981)

const MAP=(()=>{
  let sd=11;const rnd=()=>(sd=sd*16807%2147483647)/2147483647,m=[],bio=[];
  for(let y=0;y<H;y++){m.push(new Array(W).fill(''));bio.push(new Array(W).fill(0))}
  const DW=new Float32Array(W*H).fill(99); // signed distance to the walkable edge (negative = inside)
  const stamp=(cx,cy,r)=>{for(let y=Math.max(1,Math.floor(cy-r-5));y<=Math.min(H-2,Math.ceil(cy+r+5));y++)for(let x=Math.max(1,Math.floor(cx-r-5));x<=Math.min(W-2,Math.ceil(cx+r+5));x++){const d=Math.hypot(x-cx,y-cy)-r,k=y*W+x;if(d<DW[k])DW[k]=d}};
  // ---- the floating stronghold: the town square, a road east, and the portal court ----
  const T=TOWNS[0];
  // v100: the island is a rectangle round the walls (north square + south ward) with a 7-tile apron
  const SE=T.sz-TS,XE=TWN100_WX-TS; // v101: the island is a rectangle round the Grand Square's walls with a 7-tile apron
  for(let y=T.cy-31;y<=T.cy+SE+31;y++)for(let x=Math.max(1,T.cx-XE-31);x<=Math.min(W-2,T.cx+XE+31);x++){const ax=Math.abs(x-T.cx),dx=ax>XE?ax-XE:0,dz=y<T.cy?T.cy-y:y>T.cy+SE?y-T.cy-SE:0,d=Math.max(dx,dz)-28-1.5*Math.sin(x*.7+y*.4),k=y*W+x;if(d<DW[k])DW[k]=d}
  // roads, the crossroads by the main gate and the six portal islands
  const road=(L,r)=>{for(let i=0;i<L.length-1;i++){const [ax,ay]=L[i],[bx,by]=L[i+1],n=Math.ceil(Math.hypot(bx-ax,by-ay)*2);for(let q=0;q<=n;q++)stamp(ax+(bx-ax)*q/n,ay+(by-ay)*q/n,r)}};
  TWN100_RD.forEach(L=>road(L,2.7));stamp(PCOURT[0],PCOURT[1]+1,8.5);
  TWN100_PG.forEach(p=>{stamp(p.x,p.y,p.r);stamp(p.x+p.r*.35,p.y-p.r*.3,p.r*.72);stamp(p.x-p.r*.4,p.y+p.r*.3,p.r*.7)});
  // ---- the six portal maps, three instances each (v106) ----
  INSL.forEach(p=>{
    const pts=[];if(p.tri){p.path=[p.wa.slice()];stamp(p.wa[0],p.wa[1],15);for(let y=p.y0;y<p.y0+p.h;y++)for(let x=p.x0;x<p.x0+p.w;x++)bio[y][x]=PMAP[p.z].bi;return}
    for(let i=0;i<p.wp.length-1;i++){const [ax,ay]=p.wp[i],[bx,by]=p.wp[i+1],n=Math.ceil(Math.hypot(bx-ax,by-ay));for(let s=0;s<n;s++){const q=s/n;pts.push([ax+(bx-ax)*q,ay+(by-ay)*q])}}
    pts.push(p.wp[p.wp.length-1]);p.path=pts;
    pts.forEach(([x,y],i)=>{if(i%2)return;const hw=12+3*Math.sin(i*.045+p.g)+2*Math.sin(i*.13+p.g*2);stamp(x+3*Math.sin(i*.07),y+3*Math.cos(i*.05),hw)});
    p.br.forEach(l=>{for(let k=0;k<l.length-1;k++){const [ax,ay]=l[k],[bx,by]=l[k+1],n=Math.ceil(Math.hypot(bx-ax,by-ay)/2);for(let q=0;q<=n;q++){const t=q/n;stamp(ax+(bx-ax)*t,ay+(by-ay)*t,9+2*Math.sin(q*.4+k))}}});
    p.fd.forEach(([x,y,r])=>{stamp(x,y,r);stamp(x+r*.45,y-r*.3,r*.7);stamp(x-r*.4,y+r*.35,r*.65)});
    p.cl.forEach(([x,y])=>stamp(x,y,17));stamp(p.ba[0],p.ba[1],p.den?PM_DENR:PM_GTR);if(p.wa)stamp(p.wa[0],p.wa[1],15);
    const bi=PMAP[p.z].bi;for(let y=p.y0;y<p.y0+p.h;y++)for(let x=p.x0;x<p.x0+p.w;x++)bio[y][x]=bi;
  });
  PMAP.forEach(p=>{p.path=p.ins[PMF].path});
  const isW=(x,y)=>DW[y*W+x]<0;
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const d=DW[y*W+x],r=regionAt(x,y);
    if(d<0)m[y][x]='.';
    else if(r>=0&&d<2.6){const b=BIOMES[PMAP[r].bi];m[y][x]=b.n=='The Citadel'?'':(b.n=='Searing Sands'||d>1.6?'R':'#')}}
  // keep the regions sealed from each other (a 1-tile border is always void)
  INSL.forEach(p=>{for(let x=p.x0;x<p.x0+p.w;x++){m[p.y0][x]='';m[p.y0+p.h-1][x]=''}for(let y=p.y0;y<p.y0+p.h;y++){m[y][p.x0]='';m[y][p.x0+p.w-1]=''}});
  // grass, accent and water patches inside the walkable ground
  const blob=(ch,p,n,a,b2)=>{for(let i=0;i<n;i++){let cx=0,cy=0;for(let k=0;k<60;k++){const q=p.path[Math.floor(rnd()*p.path.length)];cx=Math.round(q[0]+(rnd()-.5)*22);cy=Math.round(q[1]+(rnd()-.5)*22);if(m[cy]&&m[cy][cx]=='.')break}
    const r=a+rnd()*(b2-a);for(let y=Math.floor(cy-r*1.3)-1;y<cy+r*1.3+1;y++)for(let x=Math.floor(cx-r)-1;x<cx+r+1;x++){if(!m[y]||m[y][x]!='.')continue;if(Math.hypot(x-cx,(y-cy)*1.25)<r*(.75+.25*Math.sin(x*1.7+y*1.1+i)))m[y][x]=ch}}};
  INSL.forEach(p=>{const b=BIOMES[PMAP[p.z].bi],d=b.den,A=p.w*p.h/(260*270)*(p.fld?1:.35);blob('g',p,Math.round(40*A*d[0]),3,7);blob('a',p,Math.round(26*A*d[1]),3,7);if(p.fld)blob('~',p,Math.round(9*A*d[3]),1.6,3.4)});
  // never block the road itself or the arenas with water
  const keep=(cx,cy,r)=>{for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++)if(m[y]&&m[y][x]=='~'&&Math.hypot(x-cx,y-cy)<r)m[y][x]='a'};
  INSL.forEach(p=>{p.path.forEach(([x,y],i)=>{if(i%2==0)keep(x,y,3.2)});p.cl.forEach(c=>keep(c[0],c[1],14));keep(p.ba[0],p.ba[1],(p.den?PM_DENR:PM_GTR)+1);if(p.wa)keep(p.wa[0],p.wa[1],16)});
  const props=[];
  // harvest nodes: a few small clusters of one kind each (about a quarter of the old scattered count)
  const okT=(x,y)=>{const t=m[y]&&m[y][x];return t=='.'||t=='g'||t=='a'},rockK=k=>k=='rock'||k=='grave'||k=='pillar',used=new Set();
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){const I=insAt(x,y);if(!I||!okT(x,y))continue;const r=I.g,b=BIOMES[bio[y][x]];
    if(rnd()>=.0012*(b.pd||1))continue;
    const wt=b.pr.map(k=>rockK(k)?.6:1),tot=wt.reduce((a,v)=>a+v,0);let u=rnd()*tot,k=b.pr[0];for(let i=0;i<b.pr.length;i++){u-=wt[i];if(u<=0){k=b.pr[i];break}}
    if(Math.hypot(x-I.ba[0],y-I.ba[1])<(I.den?PM_DENR:PM_GTR)+4)continue; // v89: the den circle stays open (v106: and the gateway)
    if(rockK(k)&&I.path.some((q,i)=>i%3==0&&Math.hypot(q[0]-x,q[1]-y)<5))continue; // keep rocks off the road
    const n=3+Math.floor(rnd()*3);let got=0;
    for(let tr=0;tr<30&&got<n;tr++){const a=rnd()*6.283,d=tr?.8+rnd()*1.9:0,cx=Math.round(x+Math.cos(a)*d),cy=Math.round(y+Math.sin(a)*d),key=cy*W+cx;
      if(used.has(key)||!okT(cx,cy)||rgAt(cx,cy)!==r)continue;
      used.add(key);if(rockK(k))m[cy][cx]='r';props.push([cx,cy,k]);got++}}
  // boss arenas: rune floor, ring of columns and four cover pillars
  BOSSES.forEach(b=>{const R=Math.ceil(15.5*DK)+1;for(let y=b.y-R;y<=b.y+R;y++)for(let x=b.x-R;x<=b.x+R;x++)if(Math.hypot(x-b.x,y-b.y)<15.5*DK)m[y][x]='a';
    });
  // v101: the stronghold town — one Grand Square: walls at |x|=WX and z=-TS / z=sz, a 3-tile south gate, paving inside,
  // the north row and fountain solid, and the eight shop plots solid (rotated footprints; v103 re-marks them by building lot)
  TOWNS.forEach(t=>{const WX=TWN100_WX,SZ=t.sz||TS;
    for(let dy=-TS-3;dy<=SZ+3;dy++)for(let dx=-WX-3;dx<=WX+3;dx++){const x=t.cx+dx,y=t.cy+dy;if(x<1||x>W-2)continue;const ax=Math.abs(dx);
      if(ax>WX||dy<-TS||dy>SZ){if(m[y][x]=='')m[y][x]='.';continue}
      if(ax==WX||dy==-TS){m[y][x]='W';continue}
      if(dy==SZ){m[y][x]=ax<=1?'P':'W';continue}
      m[y][x]='P'}
    TWN100_SH.forEach(q=>{const f=[Math.sin(q.ry),Math.cos(q.ry)],a=[f[1],-f[0]];for(let lx=-2.5;lx<=2.5;lx+=.5)for(let lz=-3.5;lz<=3.5;lz+=.5){const x=Math.round(t.cx+q.x+lx*a[0]+lz*f[0]),y=Math.round(t.cy+q.z+lx*a[1]+lz*f[1]);if(m[y][x]=='P')m[y][x]='B'}});
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
  if(typeof mq151MoveCamp=='function')mq151MoveCamp(m,props); // v151: Kindlelight I's entrance camp moves off the Lantern Road outpost (3020); after every seeded step above
  if(typeof sp152Map=='function')sp152Map(m,bio,DW); // v152: the special instances' ground (3150; no seeded draws)
  if(typeof v112Map=='function')v112Map(m,bio,DW,props,stamp); // v112: the themed instances II and III get their own ground (1981)
  if(typeof cs164Grow=='function')cs164Grow(m,bio,DW,props,stamp); // v164: each camp's bigger clearing, trail and moves (3240)
  if(typeof cs123Map=='function')cs123Map(m); // v123: the ground under each camp (2270)
  if(typeof th165Map=='function')th165Map(m,bio,DW); // v165: Mistmere's mountain trail (3260; after every other map pass, no seeded draws)
  m.bio=bio;m.DW=DW;
  const cyk=new Set(CYD.nodes.map(q=>q[1]*W+q[0])); // v100: the courtyard's nodes are inside the walls now
  m.props=props.filter(q=>(townAt(q[0],q[1],3)<0||cyk.has(q[1]*W+q[0]))&&(['rock','grave','pillar'].includes(q[2])?m[q[1]][q[0]]=='r':'.ga'.includes(m[q[1]][q[0]])&&!BOSSES.some(b=>Math.hypot(q[0]-b.x,q[1]-b.y)<PM_DENR+1)&&!INSL.some(p=>(p.wa&&Math.hypot(q[0]-p.wa[0],q[1]-p.wa[1])<16)||Math.hypot(q[0]-p.en[0],q[1]-p.en[1])<5)));
  if(typeof v124Groves=='function')v124Groves(m); // v124: choppable groves inside the fields (the rim trees are scenery now, 2270)
  return m})();

const tDist=(x,z)=>{let d=1e9;for(const t of TOWNS){const se=(t.sz||TS)-TS,xe=TWN100_WX-TS,ax=Math.abs(x-t.cx),dz=z<t.cy?t.cy-z:z>t.cy+se?z-t.cy-se:0,q=Math.max(ax>xe?ax-xe:0,dz);if(q<d)d=q}return d}; // v100
// ---- visual terrain: smooth heightfield (collision stays tile-based) ----
const smt=(a,b,x)=>{x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)};
const hh2=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
const vnz=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return hh2(ix,iy)*(1-u)*(1-v)+hh2(ix+1,iy)*u*(1-v)+hh2(ix,iy+1)*(1-u)*v+hh2(ix+1,iy+1)*u*v};
const fbm2=(x,y,o)=>{let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*vnz(x*f,y*f);f*=2.03;a*=.5}return s/(1-Math.pow(.5,o))*.5+0};
const HPD=2,HW=W+2*HPD+1,HH=H+2*HPD+1,HF=new Float32Array(HW*HH);
// v112: the row index is clamped by H (it was clamped by W=1180, so everything south of row 1182 — all of The Citadel,
// the Crimson Throne Hall included — read row 1182's heights: the hall floor followed void/cliff heights and you arrived under it)
const GHv=(i,j)=>HF[(Math.max(-HPD,Math.min(H+HPD,j))+HPD)*HW+Math.max(-HPD,Math.min(W+HPD,i))+HPD];
const GH=(x,z)=>{if(x<-1||z<-1||x>W||z>H)return 0;const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j;return GHv(i,j)*(1-fx)*(1-fz)+GHv(i+1,j)*fx*(1-fz)+GHv(i,j+1)*(1-fx)*fz+GHv(i+1,j+1)*fx*fz};
const gY=(p,o)=>new THREE.Vector3(p.x,GH(p.x,p.z)+o,p.z);
{
  const DW=MAP.DW,sp=x=>x<-5?0:Math.log1p(Math.exp(x*1.5))/1.5;
  const base=(x,y,a)=>.55+sp(1.0+(fbm2(x*.02+3,y*.02+9,4)-.5)*6*a+(fbm2(x*.07,y*.07+4,3)-.5)*1.6*a);
  const supd=(x,y,t)=>{const se=(t.sz||TS)-TS,xe=TWN100_WX-TS,ax=Math.abs(x-t.cx),dx=ax>xe?ax-xe:0,dy=y<t.cy?t.cy-y:y>t.cy+se?y-t.cy-se:0;return Math.pow(Math.pow(dx,4)+Math.pow(dy,4),.25)}; // v100: walls reach cy+sz
  TOWNS.forEach(t=>{t.ph=1.6});
  for(let j=-HPD;j<=H+HPD;j++)for(let i=-HPD;i<=W+HPD;i++){
    const tx=Math.max(0,Math.min(W-1,i)),ty=Math.max(0,Math.min(H-1,j)),k=ty*W+tx,I=insAt(tx,ty),r=I?I.z:-1,d=DW[k];let h;
    if(r<0){ // the floating stronghold, and empty sky everywhere else
      h=1.6+.05*fbm2(i*.2,j*.2,2);const dd=Math.max(0,d);h-=48*smt(0,4,dd)*(1+.3*fbm2(i*.1,j*.1,3));
      TOWNS.forEach(t=>{const q=supd(i,j,t),m=smt(TS+1,TS+6,q);h=h*m+t.ph*(1-m)});
    }else{
      const b=BIOMES[PMAP[r].bi],a=b.amp==null?1:b.amp;h=base(i,j,a);
      if(MAP[ty][tx]=='~')h=-1.2;
      const dd=Math.max(0,d-(typeof v124Shelf=='function'?v124Shelf(I):0)),hz=I.fld&&I.k&&typeof v112Ht=='function'?v112Ht(I,i,j,d,dd,MAP[ty][tx]):null; // v112: themed instances shape their own walls (1981)
      if(hz!=null)h=hz;else h+=(b.n=='The Citadel'?6.5*smt(0,1.2,dd)-60*smt(4,9,dd):(10+5*fbm2(i*.09,j*.09,3))*smt(.6,7,dd)+dd*.15-62*smt(12,19,dd));
      (I.den?[[I.ba,Math.max(PM_DENR+3,22*DK),5*DK]]:I.tri?[[I.wa,19,5]]:[[I.ba,PM_GTR+2,5]]).forEach(([c,R0,W0])=>{const q=Math.hypot(i-c[0],j-c[1]),m=smt(R0-W0,R0,q);if(d<0)h=h*m+.6*(1-m)});
    }
    HF[(j+HPD)*HW+i+HPD]=h;
  }
  if(typeof cs123Terrain=='function')cs123Terrain(); // v123: each camp's own ground shape (2270)
  if(typeof sp152Terrain=='function')sp152Terrain(); // v152: the special instances' heights (3150)
  if(typeof th165Terrain=='function')th165Terrain(); // v165: Mistmere's mountain face (3260)
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

