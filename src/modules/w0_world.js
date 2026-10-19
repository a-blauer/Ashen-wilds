//@@TOP
const TIER_LV=[[1,9],[10,19],[20,29],[30,39],[40,50]],ZN=['Kindlelight','Hillside Crest','Burningeye Summit','Searing Sands','The Citadel'];
const RIDGE=[],ridgeX=()=>-999;
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
  const BM=Math.round(30*S);const ba=awayWA([cl(en[0],BM,PMW-BM),cl(en[1],BM,PMH-BM)],70*S);if(ba[0]<BM||ba[0]>PMW-BM||ba[1]<BM||ba[1]>PMH-BM){ba[0]=cl(ba[0],BM,PMW-BM);ba[1]=cl(ba[1],BM,PMH-BM)}
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
const TOWNS=[
 {n:'Duskhold',tav:'The Last Lantern',cy:284,fx:40,pal:{wall:0x6a6470,wood:0x2a2026,roof:0x3a2a4a,stone:0x5a5662,ban:0x8a2a3a}}
].map((t,i)=>{t.i=i;t.cx=t.fx;t.mp=[t.cx,t.cy-7.9];t.mv=[t.cx+10.2,t.cy-7.7];t.col=[];t.tv=[t.cx-9.5,t.cy-7.5];t.sp=[t.cx,t.cy+7];return t});
const START=TOWNS[0].sp.slice();
const PCOURT=[84,284];
// the woodland courtyard north-east of Duskhold (trees and stone to harvest)
// It starts small and grows by one ring per completed zone; ring i holds 6 nodes of every node type found in zone i.
const CYD={x:76,y:244,r0:9,dr:1.3,rmax:17,r:9,gate:[75,276],nodes:[]};
//@@BOSSES
const BOSSES=[
 {name:'Argus, the Hundred-Eyed',title:'Watcher of Kindlelight',sp:'EyeWolf',lvl:9},
 {name:'The Crest Hydra',title:'Mother of Serpents',sp:'Hydra',lvl:18},
 {name:'The Rime Wraith',title:'Ghost of Burningeye Summit',sp:'IceWraith',lvl:27},
 {name:"Ssith'ra the Endless",title:'Devourer of the Searing Sands',sp:'Centipede',lvl:36},
 {name:'The Bloated One',title:'Rot-King of the Dirge',sp:'Abomination',lvl:44,hum:'abom'},
 {name:'Lord Vaelric',title:'The Crimson King of the Citadel',sp:'VampLord',lvl:51,hum:'vlord'}].map((b,i)=>{b.x=PMAP[i].ba[0];b.y=PMAP[i].ba[1];return b});
//@@BIOMES
const BIOMES=[
 {n:'Duskhold',sp:'Foxlet',x:40,y:284,t:1,gnd:[92,88,96],grs:[70,86,74],acc:[110,104,112],frs:[30,40,34],wat:[46,80,120],tree:['dead','pine'],pr:['rock','pillar'],den:[.3,.5,0,0],tc:[0x3a2a28,0x2a3a30,0x34443a]},
 {n:'Kindlelight',sp:'Mossfrog',x:210,y:112,t:1,gnd:[44,52,34],grs:[40,64,30],acc:[66,60,30],frs:[18,28,20],wat:[60,120,30],tree:['dead','dead','oak'],pr:['mush','bones','mush','bush','rock'],den:[1,1,.5,2.4],tc:[0x24301c,0x2a4a24,0x3a5a2a],amp:.35},
 {n:'Hillside Crest',sp:'Foxlet',x:420,y:112,t:2,gnd:[106,128,62],grs:[84,136,52],acc:[168,160,82],frs:[34,72,34],wat:[56,116,168],tree:['oak','oak','pine'],pr:['flower','flower','bush','rock','rock'],den:[1.3,.8,.4,.4],tc:[0x5a3a22,0x3f8a3a,0x58a84a],amp:.9},
 {n:'Burningeye Summit',sp:'Ashwolf',x:630,y:112,t:3,gnd:[206,216,228],grs:[178,194,214],acc:[146,166,190],frs:[34,64,66],wat:[150,200,232],tree:['pine','pine','dead'],pr:['rock','crystal','rock','bush'],den:[.8,.9,.5,.6],tc:[0x3a2a28,0x214a50,0x2a5a60],amp:1.3},
 {n:'Searing Sands',sp:'Gravewyrm',x:210,y:336,t:4,gnd:[204,164,100],grs:[180,146,82],acc:[222,186,124],frs:[122,102,62],wat:[62,120,140],tree:['cactus','cactus','spire'],pr:['rock','bones','pillar','bones'],den:[.5,1,.2,.1],tc:[0x4a7a3a,0x5a8a44,0x6a9a50],amp:1},
 {n:'The Dirge',sp:'Boneling',x:420,y:336,t:4,gnd:[64,70,78],grs:[58,74,72],acc:[90,94,100],frs:[24,30,34],wat:[80,140,150],tree:['dead','dead','crystal'],pr:['grave','grave','bones','pillar','mush'],den:[.7,.9,.4,.4],tc:[0x2a2a30,0x3a4a50,0x4a5a64],amp:.5},
 {n:'The Citadel',sp:'Batwing',x:630,y:336,t:5,gnd:[66,58,62],grs:[90,30,36],acc:[96,88,92],frs:[30,24,28],wat:[90,20,30],tree:['dead'],pr:['pillar','pillar','bones'],den:[0,.6,0,0],tc:[0x2a1a1a,0x3a2028,0x4a2a30],amp:.08}
];
//@@MAP
const MAP=(()=>{
  let sd=11;const rnd=()=>(sd=sd*16807%2147483647)/2147483647,m=[],bio=[];
  for(let y=0;y<H;y++){m.push(new Array(W).fill(''));bio.push(new Array(W).fill(0))}
  const DW=new Float32Array(W*H).fill(99); // signed distance to the walkable edge (negative = inside)
  const stamp=(cx,cy,r)=>{for(let y=Math.max(1,Math.floor(cy-r-5));y<=Math.min(H-2,Math.ceil(cy+r+5));y++)for(let x=Math.max(1,Math.floor(cx-r-5));x<=Math.min(W-2,Math.ceil(cx+r+5));x++){const d=Math.hypot(x-cx,y-cy)-r,k=y*W+x;if(d<DW[k])DW[k]=d}};
  // ---- the floating stronghold: the town square, a road east, and the portal court ----
  const T=TOWNS[0];
  for(let y=T.cy-31;y<=T.cy+31;y++)for(let x=T.cx-31;x<=T.cx+31;x++){const d=Math.max(Math.abs(x-T.cx),Math.abs(y-T.cy))-28-1.5*Math.sin(x*.7+y*.4),k=y*W+x;if(d<DW[k])DW[k]=d}
  for(let x=T.cx+22;x<=PCOURT[0];x+=1)stamp(x,T.cy,4.5);stamp(PCOURT[0],PCOURT[1],19);
  stamp(CYD.x,CYD.y,CYD.rmax+1.5);for(let q=0;q<=1;q+=.05)stamp(CYD.x+(CYD.gate[0]-CYD.x)*q,CYD.y+(CYD.gate[1]-CYD.y)*q,3.2);
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
  BOSSES.forEach(b=>{for(let y=b.y-16;y<=b.y+16;y++)for(let x=b.x-16;x<=b.x+16;x++)if(Math.hypot(x-b.x,y-b.y)<15.5)m[y][x]='a';
    });
  // the stronghold town (same layout as before)
  TOWNS.forEach(t=>{
    for(let dy=-TS-3;dy<=TS+3;dy++)for(let dx=-TS-3;dx<=TS+3;dx++){const x=t.cx+dx,y=t.cy+dy;const ax=Math.abs(dx),ay=Math.abs(dy);
      if(ax<TS&&ay<TS)m[y][x]='P';else if(ax<=TS&&ay<=TS)m[y][x]=(ax==TS&&ay<=1)?'P':'W';else if(m[y][x]=='')m[y][x]='.'}
    const B=(x0,x1,y0,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)m[t.cy+y][t.cx+x]='B'};
    B(-17,-11,-18,-14);B(-2,2,-18,-14);B(12,17,-18,-14);B(-1,1,-12,-12);
    for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++)if(x*x+y*y<=6)m[t.cy+y][t.cx+x]='B';
  });
  for(let x=T.cx+TS+1;x<=PCOURT[0]-8;x++)for(let y=-1;y<=1;y++)if(m[T.cy+y][x]=='.')m[T.cy+y][x]='p';
  // ---- the courtyard: south gate path, a grove at the heart, then one ring of nodes per zone (walls are placed at runtime) ----
  {const C=CYD,inC=(x,y)=>Math.hypot(x-C.x,y-C.y),R=C.rmax+.6;
   for(let y=Math.floor(C.y-R);y<=C.y+R;y++)for(let x=Math.floor(C.x-R);x<=C.x+R;x++){if(townAt(x,y,3)>=0||m[y][x]==='')continue;
     if(inC(x,y)<R){bio[y][x]=2;if(m[y][x]=='.'&&(x*7+y*3)%5==0)m[y][x]='g'}}
   for(let q=0;q<=1;q+=.03){const x=Math.round(C.x+(C.gate[0]-C.x)*q),y=Math.round(C.y+(C.gate[1]-C.y)*q);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(m[y+dy][x+dx]=='g'||m[y+dy][x+dx]=='.')m[y+dy][x+dx]='p'}
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
         if(!'.g'.includes(m[y][x])||nearP(x,y)||townAt(x,y,3)>=0)continue;const dd=inC(x,y);if(dd<lo-.3||dd>hi+.3)continue;put(x,y,k,i);got++}})});
  }
  m.bio=bio;m.DW=DW;
  m.props=props.filter(q=>townAt(q[0],q[1],3)<0&&(['rock','grave','pillar'].includes(q[2])?m[q[1]][q[0]]=='r':'.ga'.includes(m[q[1]][q[0]])&&!BOSSES.some(b=>Math.hypot(q[0]-b.x,q[1]-b.y)<PM_DENR+1)&&!PMAP.some(p=>Math.hypot(q[0]-p.wa[0],q[1]-p.wa[1])<16||Math.hypot(q[0]-p.en[0],q[1]-p.en[1])<5)));
  return m})();
//@@HF
{
  const DW=MAP.DW,sp=x=>x<-5?0:Math.log1p(Math.exp(x*1.5))/1.5;
  const base=(x,y,a)=>.55+sp(1.0+(fbm2(x*.02+3,y*.02+9,4)-.5)*6*a+(fbm2(x*.07,y*.07+4,3)-.5)*1.6*a);
  const supd=(x,y,t)=>Math.pow(Math.pow(Math.abs(x-t.cx),4)+Math.pow(Math.abs(y-t.cy),4),.25);
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
      const p=PMAP[r];[[p.ba,PM_DENR+3],[p.wa,19]].forEach(([c,R0])=>{const q=Math.hypot(i-c[0],j-c[1]),m=smt(R0-5,R0,q);if(d<0)h=h*m+.6*(1-m)});
    }
    HF[(j+HPD)*HW+i+HPD]=h;
  }
}
