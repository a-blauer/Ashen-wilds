// ================= v38: Enemy camps — every monster type owns a territory with a themed outpost =================
// Each biome is split into wedges around its centre; each wedge belongs to one camp theme. Enemies spawn at camps and roam around them.
const CTH={
 goblin:{n:'Hobgoblin Camp',mem:[['hobgoblin',3],['slinger',1]],b:'goblin'},
 slingers:{n:'Slinger Lookout',mem:[['slinger',3]],b:'goblin'},
 bandit:{n:'Bandit Hideout',mem:[['bandit',3]],b:'bandit'},
 brig:{n:'Brigand Stockade',mem:[['bandit',2],['brigand',1]],b:'brig'},
 mire:{n:'Lurker Pool',mem:[['lurker',3]],b:'mire'},
 wolf:{n:'Wolf Den',mem:[['snowwolf',3]],b:'wolf'},
 tort:{n:'Tortoise Rocks',mem:[['tortoise',3]],b:'tort'},
 bats:{n:'Bat Roost',mem:[['cavebat',4]],b:'bats'},
 shrine:{n:'Goblin Shrine',mem:[['shaman',2],['hobgoblin',1]],b:'shrine'},
 shroom:{n:'Shambler Ring',mem:[['shambler',3]],b:'shroom'},
 ritual:{n:'Cultist Ritual Site',mem:[['cultist',3]],b:'ritual'},
 lava:{n:'Drake Lava Pit',mem:[['magmadrake',3]],b:'lava'},
 orc:{n:'Orc Warcamp',mem:[['orc',3]],b:'orc'},
 web:{n:'Spider Nest',mem:[['stalker',3]],b:'web'},
 grave:{n:'Restless Graveyard',mem:[['skeleton',2],['bonearcher',1]],b:'grave'},
 fort:{n:'Hollow Fort',mem:[['hollowknight',2],['skeleton',1]],b:'fort'},
 haunt:{n:'Haunted Barrows',mem:[['wraith',2],['bonearcher',1]],b:'haunt'},
 bog:{n:'Horror Bog',mem:[['boghorror',3]],b:'bog'},
 nest:{n:'Harpy Eyrie',mem:[['harpy',3]],b:'nest'},
 mega:{n:'Giant Stones',mem:[['giant',2]],b:'mega'},
 tomb:{n:'Revenant Tomb',mem:[['revenant',3]],b:'tomb'},
 wyrm:{n:'Wyrm Graveyard',mem:[['sandwyrm',2]],b:'wyrm'}
};
const BTH={'Sunlit Meadow':['goblin','bandit','slingers'],'Murky Mire':['mire','goblin','bandit'],'Frostwood Taiga':['wolf','bandit','slingers'],
 'Stone Highlands':['brig','tort'],'Twilight Hollow':['bats','shrine','brig'],'Fungal Grove':['shroom','shrine','bats'],
 'Ember Crags':['ritual','lava','orc'],'Webwood':['web','orc','ritual'],'Bone Wastes':['grave','fort'],'Haunted Fens':['haunt','bog'],
 'Windswept Cliffs':['nest','mega','tomb'],'Scorched Barrens':['wyrm','tomb','mega']};
if(typeof CTH2!='undefined')Object.assign(CTH,CTH2);
const pickMem=th=>{const t=th.mem.reduce((s,m)=>s+m[1],0);let r=Math.random()*t;for(const m of th.mem){r-=m[1];if(r<0)return m[0]}return th.mem[0][0]};
// ---------- camp placement: a few large settlements per biome, spread far apart ----------
var CBLK=new Set(typeof WDCOL!='undefined'&&WDCOL?WDCOL:[]);
const CAMPS=[],CAMP_R=12;
if(typeof PMAP!='undefined'){PMAP.forEach((p,pi)=>p.cl.forEach((c,k)=>{CAMPS.push({i:CAMPS.length,x:Math.round(c[0]),z:Math.round(c[1]),th:CTH[PM_TH[pi][k%3]],cap:7,g:null,kt:-1e9,seed:R(1,1e6),bi:p.bi,pm:pi,ig:rgAt(Math.round(c[0]),Math.round(c[1]))})}))}else // v106: ig = the zone instance
{
  const open=(x,y)=>{const t=MAP[y]&&MAP[y][x];return t&&t!='#'&&t!='~'&&t!='r'&&t!='R'&&t!='W'&&t!='B'};
  const cand={};
  for(let y=14;y<H-14;y+=3)for(let x=14;x<W-14;x+=3){
    if(!open(x,y)||townAt(x,y,22)>=0)continue;
    if(ARN.some(A=>Math.hypot(A.cx-x,A.cz-y)<ARENA_R+22))continue;
    if(BOSSES.some(B=>Math.hypot(B.x-x,B.y-y)<ARENA_R+22))continue;
    if(DUNS.some(D=>Math.hypot((D.x||D.tx)-x,(D.y||D.ty)-y)<18))continue;
    if(tierAt(x-12,y)!=tierAt(x+12,y))continue;
    const bi=MAP.bio[y][x];let same=0,ok=0,n=0;
    for(let j=-9;j<=9;j+=1.5)for(let i=-9;i<=9;i+=1.5){if(i*i+j*j>81)continue;const xx=Math.round(x+i),yy=Math.round(y+j);n++;if(open(xx,yy))ok++;if(MAP.bio[yy]&&MAP.bio[yy][xx]==bi)same++}
    if(ok/n<.66||same/n<.9)continue;
    (cand[bi]=cand[bi]||[]).push([x,y,ok/n]);
  }
  BIOMES.forEach((b,bi)=>{const L=cand[bi]||[],T=BTH[b.n];if(!T||!L.length)return;
    const want=Math.max(T.length,Math.min(T.length*2,Math.round(L.length/170)));const mine=[];
    for(let k=0;k<want;k++){let best=null,bd=-1;
      L.forEach(c=>{let md=1e9;CAMPS.forEach(C=>{md=Math.min(md,Math.hypot(C.x-c[0],C.z-c[1]))});if(md<40)return;
        // first site: the most open spot; then farthest from the others
        const sc=mine.length?Math.min(md,200)+c[2]*4:c[2]*100-Math.hypot(c[0]-b.x,c[1]-b.y)*.2;if(sc>bd){bd=sc;best=c}});
      if(!best)break;const C={i:CAMPS.length,x:best[0],z:best[1],th:null,cap:6,g:null,kt:-1e9,seed:R(1,1e6),bi};CAMPS.push(C);mine.push(C)}
  });
}
// split each biome's camps into equal, neighbouring groups (sorted by angle around the biome centre), one group per theme
if(!CAMPS.length||!CAMPS[0].th){const byB={};CAMPS.forEach(C=>{const b=BIOMES[C.bi];(byB[b.n]=byB[b.n]||{b,L:[]}).L.push(C)});
 for(const n in byB){const {b,L}=byB[n],T=BTH[n];
  L.forEach(C=>C.an=Math.atan2(C.z-b.y,C.x-b.x));L.sort((p,q)=>p.an-q.an);
  let gi=0,gw=-1;L.forEach((C,k)=>{const nx=L[(k+1)%L.length],w=((nx.an-C.an)+6.283)%6.283||6.283;if(w>gw){gw=w;gi=(k+1)%L.length}});
  const R2=L.slice(gi).concat(L.slice(0,gi));R2.forEach((C,k)=>{C.th=CTH[T[Math.min(T.length-1,Math.floor(k*T.length/R2.length))]]})}
 CAMPS.forEach((C,i)=>{C.i=i;const big=C.th.mem.some(m=>m[0]=='giant'||m[0]=='sandwyrm');C.cap=big?4:6})}
// clear the trees inside each camp so the settlement has room
CAMPS.forEach(C=>{const r=CAMP_R+1;for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(i*i+j*j>r*r)continue;const x=C.x+i,y=C.z+j;if(MAP[y]&&MAP[y][x]=='#'){nodeSet(y*W+x,false);MAP[y][x]='.'}}});
const campAt=(x,z,r)=>CAMPS.find(C=>Math.hypot(C.x-x,C.z-z)<(r||CAMP_R));
const campAlive=C=>enemies.reduce((n,e)=>n+(e.camp===C&&!e.dead?1:0),0);
// ---------- spawning ----------
function spawn(init){
  const p=pl.position,now=performance.now(),lo=init?14:32;
  const el=CAMPS.filter(C=>{const d=Math.hypot(C.x-p.x,C.z-p.z);return d>lo&&d<80&&now-C.kt>45000&&campAlive(C)<C.cap});
  if(!el.length)return;
  const C=el[R(0,el.length-1)];if(!C.g)buildCamp(C);let x,z,n=0;
  do{const a=Math.random()*6.283,r=Math.random()*8.5;x=Math.round(C.x+Math.cos(a)*r);z=Math.round(C.z+Math.sin(a)*r);n++}while((solid(x,z)||enemies.some(o=>Math.hypot(o.m.position.x-x,o.m.position.z-z)<1.6))&&n<20);
  if(n>=20)return;
  const b=BIOMES[MAP.bio[z][x]],key=pickMem(C.th);if(!EN[key])return;
  const al=Math.random()<.05+.012*b.t,e=spawnEnemy(key,x,z,Math.min(MAXLV,zoneLv(x,z)+(al?2:0)),{al,zt:b.t});
  e.camp=C;e.wx=C.x;e.wz=C.z;
  if(!e.c.al&&!enemies.some(o=>o.camp===C&&o.scout&&!o.dead)&&Math.random()<.3)makeScout(e);
}
const campOnKill=e=>{const C=e&&e.camp;if(!C)return;
  if(e.leader===C){campChest(C);return}
  if(C.raid||campAlive(C)>0)return;
  say('⛺ '+C.th.n+' cleared!');C.kt=performance.now()};
// ---------- outpost visuals (built lazily when the player comes near) ----------
const CG={tent:new THREE.ConeGeometry(1,1,4),disc:new THREE.CircleGeometry(1,22),ring:new THREE.RingGeometry(.86,1,32),tor:new THREE.TorusGeometry(1,.16,6,18),arc:new THREE.TorusGeometry(1,.07,5,10,Math.PI),dod:new THREE.DodecahedronGeometry(1,0)};
const tMat={};const tm=(c,o)=>{const k=c+'|'+o;return tMat[k]||(tMat[k]=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthWrite:false,side:THREE.DoubleSide}))};
const glowM=c=>gmat(c);
const CFL=[],CMC=new Map();// flames that flicker (CMC: painted copies of camp materials)
function buildCamp(C){
  const g=new THREE.Group();g.position.set(C.x,0,C.z);let s=C.seed;const rn=()=>(s=s*16807%2147483647)/2147483647,rr=(a,b)=>a+rn()*(b-a);
  const gy=(dx,dz)=>GH(C.x+dx,C.z+dz);
  const put=(geo,mat,dx,dy,dz,sx,sy,sz,rx,ry,rz)=>{const o=TQ(g,geo,mat,dx,gy(dx,dz)+dy,dz,sx,sy,sz,rx,ry,rz);return o};
  const S=(c,o)=>sm(c,o);
  // mark solid tiles (world grid) for collision and line of sight
  const blk=(dx,dz,r)=>{const cx=C.x+dx,cz=C.z+dz;if(r<.55){CBLK.add(Math.round(cz)*W+Math.round(cx));return}
    for(let j=Math.floor(cz-r);j<=Math.ceil(cz+r);j++)for(let i=Math.floor(cx-r);i<=Math.ceil(cx+r);i++)if(Math.hypot(i-cx,j-cz)<=r)CBLK.add(j*W+i)};
  const ring=(n,r,f)=>{for(let i=0;i<n;i++){const a=i/n*6.283+rr(-.25,.25),rad=r*rr(.85,1.15);f(Math.cos(a)*rad,Math.sin(a)*rad,a,i)}};
  // ---- primitives ----
  const fire=(dx,dz,col)=>{ring(7,.55,(x,z)=>put(G_SPH,S(0x5a5650),dx+x,.08,dz+z,.16,.12,.16));
    put(G_CYL,S(0x4a3020),dx,.12,dz,.07,.8,.07,Math.PI/2,.5,0);put(G_CYL,S(0x4a3020),dx,.12,dz,.07,.8,.07,Math.PI/2,-.6,0);
    const f1=put(G_CONE,glowM(col||0xff7a1a),dx,.42,dz,.26,.62,.26),f2=put(G_CONE,glowM(0xffd36a),dx,.34,dz,.14,.38,.14);f1.castShadow=f2.castShadow=false;CFL.push(f1,f2);
    const gl=put(CG.disc,tm(col||0xff9a3a,.22),dx,.04,dz,1.6,1.6,1,-Math.PI/2);gl.castShadow=false};
  const tent=(dx,dz,ry,col,sz)=>{sz=sz||1;blk(dx,dz,.95*sz);put(CG.tent,S(col),dx,.9*sz,dz,1.25*sz,1.8*sz,1.25*sz,0,ry+Math.PI/4);put(G_BOX,S(0x1a1410),dx+Math.sin(ry)*.62*sz,.42*sz,dz+Math.cos(ry)*.62*sz,.5*sz,.8*sz,.06,0,ry);put(G_CYL,S(0x4a3020),dx,1.85*sz,dz,.04,.35,.04)};
  const box=(dx,dz,fn)=>{const bg=new THREE.Group();bg.position.set(dx,gy(dx,dz),dz);fn(bg);g.add(bg);(C.boxes=C.boxes||[]).push({g:bg,x:C.x+dx,z:C.z+dz,b:0})};
  const crate=(dx,dz,ry)=>box(dx,dz,bg=>{const k=rr(.5,.68),r0=ry||rr(0,1.5);TQ(bg,G_BOX,S(0x7a5530),0,k/2,0,k,k,k,0,r0);TQ(bg,G_BOX,S(0x4a3220),0,k/2,0,k*1.03,k*.12,k*1.03,0,r0);TQ(bg,G_BOX,S(0x4a3220),0,k/2,0,k*.12,k*1.03,k*1.03,0,r0)});
  const barrel=(dx,dz)=>box(dx,dz,bg=>{TQ(bg,G_CYL,S(0x6a4426),0,.4,0,.28,.8,.28);TQ(bg,G_CYL,S(0x3a3430,{metalness:.5}),0,.6,0,.3,.06,.3);TQ(bg,G_CYL,S(0x3a3430,{metalness:.5}),0,.2,0,.3,.06,.3)});
  const stake=(dx,dz,h,col)=>{blk(dx,dz,0);put(G_CYL,S(col||0x5a3e24),dx,h/2,dz,.11,h,.11,rr(-.08,.08),0,rr(-.08,.08));put(G_CONE,S(col||0x5a3e24),dx,h+.15,dz,.11,.3,.11)};
  const palisade=()=>{};// walls removed by request
  const banner=(dx,dz,col)=>{put(G_CYL,S(0x3a2a1a),dx,1.4,dz,.05,2.8,.05);const b=put(G_PLN,S(col,{side:THREE.DoubleSide,emissive:col,emissiveIntensity:.15}),dx+.32,2.3,dz,.6,.9,1,0,rr(0,3),0);b.castShadow=false};
  const skullPole=(dx,dz)=>{put(G_CYL,S(0x4a3020),dx,.9,dz,.05,1.8,.05);put(G_SPH,S(0xe8e0c8),dx,1.9,dz,.17,.19,.17);put(G_SPH,glowM(0x101010),dx+.07,1.92,dz+.12,.04,.04,.03);put(G_SPH,glowM(0x101010),dx-.07,1.92,dz+.12,.04,.04,.03)};
  const rock=(dx,dz,k,col)=>{if(k>=.9)blk(dx,dz,k*.6);return put(CG.dod,S(col||0x7a7670),dx,k*.45,dz,k*rr(.8,1.2),k*rr(.55,.85),k*rr(.8,1.2),rr(0,3),rr(0,3),0)};
  const tower=(dx,dz,col)=>{blk(dx,dz,.9);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>put(G_CYL,S(0x4a3220),dx+a*.55,1.6,dz+b*.55,.08,3.2,.08));
    put(G_BOX,S(0x6a4a2c),dx,3.2,dz,1.5,.12,1.5);[[0,-.72,0],[0,.72,0],[-.72,0,1],[.72,0,1]].forEach(([a,b,r])=>put(G_BOX,S(0x5a3e24),dx+a,3.5,dz+b,r?.08:1.5,.5,r?1.5:.08));
    put(CG.tent,S(col||0x6a2a20),dx,4.3,dz,1.25,.9,1.25,0,Math.PI/4)};
  const pool=(dx,dz,r,col,glow)=>{const o=put(CG.disc,glow?glowM(col):S(col,{roughness:.15,metalness:.2}),dx,.05,dz,r,r*rr(.7,1),1,-Math.PI/2,0,rr(0,3));o.castShadow=false;if(glow){const h=put(CG.disc,tm(col,.25),dx,.06,dz,r*1.5,r*1.4,1,-Math.PI/2);h.castShadow=false}};
  const reeds=(dx,dz,col)=>{for(let i=0;i<6;i++)put(G_CYL,S(col||0x5a7a3a),dx+rr(-.4,.4),.5,dz+rr(-.4,.4),.025,rr(.7,1.3),.025,rr(-.2,.2),0,rr(-.2,.2))};
  const stump=(dx,dz,col)=>{blk(dx,dz,0);const h=rr(1.4,2.6);put(G_CYL,S(col||0x3a3026),dx,h/2,dz,.2,h,.24);put(G_CYL,S(col||0x3a3026),dx+.3,h*.75,dz,.06,1,.06,0,0,-.9);put(G_CYL,S(col||0x3a3026),dx-.25,h*.6,dz+.1,.05,.8,.05,.3,0,.8)};
  const shroom=(dx,dz,k,cap,glow)=>{put(G_CYL,S(0xd8cdb0),dx,k*.6,dz,k*.14,k*1.2,k*.14);const c=put(G_SPH,glow?S(cap,{emissive:cap,emissiveIntensity:.55}):S(cap),dx,k*1.2,dz,k*.6,k*.32,k*.6);[0,1,2].forEach(i=>put(G_SPH,S(0xf0e8d8),dx+Math.cos(i*2.1)*k*.36,k*1.42,dz+Math.sin(i*2.1)*k*.36,k*.08,k*.05,k*.08))};
  const spike=(dx,dz,k,col)=>put(G_CONE,S(col||0x5a5662),dx,k/2,dz,k*.22,k,k*.22,rr(-.12,.12),0,rr(-.12,.12));
  const crystal=(dx,dz,k,col)=>put(G_OCT,S(col,{emissive:col,emissiveIntensity:.6,roughness:.3}),dx,k*.7,dz,k*.3,k*.8,k*.3,rr(-.2,.2),rr(0,3),rr(-.2,.2));
  const cocoon=(dx,dz,h)=>{put(G_SPH,S(0xe8e4dc),dx,h,dz,.25,.48,.25);put(G_CYL,tm(0xffffff,.5),dx,h+.9,dz,.01,1.4,.01)};
  const web=(dx,dz,ry,k)=>{const w=put(CG.ring,tm(0xf0f0f0,.4),dx,1.4*k,dz,1.3*k,1.3*k,1,0,ry,0);w.castShadow=false;for(let i=0;i<4;i++){const s2=put(G_BOX,tm(0xf0f0f0,.35),dx,1.4*k,dz,.015,2.6*k,.015,0,ry,i*.785);s2.castShadow=false}
    const w2=put(CG.ring,tm(0xf0f0f0,.35),dx,1.4*k,dz,.6*k,.6*k,1,0,ry,0);w2.castShadow=false};
  const grave=(dx,dz,ry,col)=>{put(G_BOX,S(col||0x8a8a86),dx,.45,dz,.55,.9,.14,rr(-.1,.1),ry,rr(-.12,.12));put(G_BOX,S(0x5a5040),dx,.04,dz+.5,.5,.06,.9,0,ry)};
  const candle=(dx,dz,col)=>{put(G_CYL,S(0xe8e0c8),dx,.15,dz,.05,.3,.05);const f=put(G_CONE,glowM(col||0x9ad8ff),dx,.36,dz,.04,.12,.04);f.castShadow=false;CFL.push(f)};
  const pillar=(dx,dz,h,col)=>{blk(dx,dz,0);put(G_CYL,S(col||0xb8b0a0),dx,h/2,dz,.32,h,.32);put(G_BOX,S(col||0xb8b0a0),dx,.12,dz,.8,.24,.8);if(h>2)put(G_BOX,S(col||0xb8b0a0),dx,h+.1,dz,.8,.2,.8)};
  const wallSeg=(dx,dz,ry,len,h,col)=>{for(let q=-len/2;q<=len/2;q+=.5)blk(dx+Math.cos(ry)*q,dz-Math.sin(ry)*q,0);return put(G_BOX,S(col||0x8a8478),dx,h/2,dz,len,h,.5,0,ry,0)};
  const bones=(dx,dz)=>{for(let i=0;i<4;i++)put(G_CYL,S(0xe8e0c8),dx+rr(-.6,.6),.06,dz+rr(-.6,.6),.04,rr(.3,.6),.04,Math.PI/2,0,rr(0,3));put(G_SPH,S(0xe8e0c8),dx+rr(-.3,.3),.12,dz+rr(-.3,.3),.14,.14,.14)};
  const runes=(dx,dz,r,col)=>{const o=put(CG.ring,glowM(col),dx,.05,dz,r,r,1,-Math.PI/2);o.castShadow=false;const o2=put(CG.ring,glowM(col),dx,.05,dz,r*.62,r*.62,1,-Math.PI/2);o2.castShadow=false;
    for(let i=0;i<5;i++){const a=i/5*6.283,b=(i+2)/5*6.283,x1=Math.cos(a)*r*.62,z1=Math.sin(a)*r*.62,x2=Math.cos(b)*r*.62,z2=Math.sin(b)*r*.62,l=Math.hypot(x2-x1,z2-z1);const ln=put(G_BOX,glowM(col),dx+(x1+x2)/2,.05,dz+(z1+z2)/2,l,.01,.05,0,-Math.atan2(z2-z1,x2-x1),0);ln.castShadow=false}};
  const brazier=(dx,dz,col)=>{put(G_CYL,S(0x2a2420,{metalness:.6}),dx,.55,dz,.06,1.1,.06);put(G_CYL,S(0x2a2420,{metalness:.6}),dx,1.12,dz,.32,.2,.22);const f=put(G_CONE,glowM(col||0xff6a1a),dx,1.4,dz,.22,.5,.22);f.castShadow=false;CFL.push(f)};
  const obelisk=(dx,dz,h,col,gl)=>{blk(dx,dz,0);put(CG.tent,S(col),dx,h/2,dz,.55,h,.55,0,Math.PI/4+rr(-.1,.1));if(gl){const r=put(G_BOX,glowM(gl),dx,h*.55,dz+.2,.08,h*.4,.02);r.castShadow=false}};
  const totem=(dx,dz,cols)=>{blk(dx,dz,0);cols.forEach((c,i)=>put(G_BOX,S(c),dx,.35+i*.6,dz,.5,.58,.5,0,rr(-.2,.2),0));put(G_BOX,S(cols[0]),dx,.35+cols.length*.6-.4,dz,1.3,.14,.18);put(G_SPH,glowM(0xffd04a),dx,.4+(cols.length-1)*.6,dz+.26,.06,.06,.03)};
  const cauldron=(dx,dz,col)=>{put(G_SPH,S(0x1e1e22,{metalness:.5}),dx,.38,dz,.5,.4,.5);const l=put(CG.disc,glowM(col),dx,.62,dz,.42,.42,1,-Math.PI/2);l.castShadow=false;CFL.push(l);fire(dx,dz,0xff6a1a)};
  const nest=(dx,dz,k)=>{put(CG.tor,S(0x6a5030),dx,.25*k,dz,1.3*k,1.3*k,1.4*k,Math.PI/2);put(CG.disc,S(0x4a3820),dx,.15*k,dz,1.2*k,1.2*k,1,-Math.PI/2);for(let i=0;i<3;i++)put(G_SPH,S(0xe8dcc0),dx+rr(-.4,.4)*k,.35*k,dz+rr(-.4,.4)*k,.2*k,.26*k,.2*k);
    for(let i=0;i<10;i++){const a=rn()*6.283;put(G_CYL,S(0x5a4428),dx+Math.cos(a)*1.3*k,.35*k,dz+Math.sin(a)*1.3*k,.03,.9*k,.03,rr(1,2),a,0)}};
  const ribs=(dx,dz,ry,k)=>{for(let i=0;i<6;i++){const o=new THREE.Mesh(CG.arc,S(0xe8dcc0));const ox=dx+Math.cos(ry)*(i-2.5)*.75*k,oz=dz+Math.sin(ry)*(i-2.5)*.75*k;o.position.set(ox,gy(ox,oz)-.1,oz);const sc=(1.6-Math.abs(i-2.5)*.18)*k;o.scale.set(sc,sc*1.3,sc);o.rotation.y=-ry+Math.PI/2;o.castShadow=true;g.add(o)}
    put(G_CYL,S(0xe8dcc0),dx,.15,dz,.14,4.6*k,.14,Math.PI/2,-ry+Math.PI/2,0);const sx=dx+Math.cos(ry)*2.6*k*1.2,sz2=dz+Math.sin(ry)*2.6*k*1.2;put(G_SPH,S(0xe8dcc0),sx,.4*k,sz2,.6*k,.45*k,.9*k,0,-ry+Math.PI/2,0)};
  const mound=(dx,dz,k,col)=>put(G_SPH,S(col),dx,-.1,dz,k,k*.35,k*rr(.7,1.1),0,rr(0,3),0);
  const B=BIOMES[MAP.bio[C.z][C.x]],tc=B.tc||[0x5a3a22,0x3f6a3a,0x4a6a3a];
  // ---- themes ----
  ({
   goblin(){fire(0,0);ring(3,3.6,(x,z,a)=>tent(x,z,a+Math.PI,[0x7a5a3a,0x6a4a2a,0x8a6a40][R(0,2)]));ring(5,2.2,(x,z,a,i)=>i%2?crate(x,z):barrel(x,z));skullPole(4.6,.8);skullPole(-4.2,-1.8);palisade(5.8,rr(0,6),0x5a3e24,1.2)},
   bandit(){fire(0,0);tent(-2.6,-1.4,.9,0x5a2a2a,1.1);tent(2.4,-2,-.8,0x3a3a46,1.1);for(let i=0;i<4;i++)crate(rr(-3,3),rr(1.5,3.2));barrel(3.2,1.6);barrel(3.6,2.2);banner(-3.4,2.6,0x8a1a1a);put(G_BOX,S(0x6a4a2c),0,.4,-3.6,2,.08,.8);put(G_BOX,S(0x4a3220),-.8,.2,-3.6,.08,.4,.7);put(G_BOX,S(0x4a3220),.8,.2,-3.6,.08,.4,.7)},
   brig(){fire(0,0);palisade(5.4,rr(0,6),0x5a3e24,2.1);tower(3.2,-2.4,0x7a2a20);tent(-2.4,-2,1,0x4a4a54,1.15);tent(-2.2,2.4,2.2,0x5a3a2a,1.05);crate(1.6,2.4);crate(2.2,2.8);barrel(2.8,1.8);banner(0,-4.2,0x2a4a8a)},
   mire(){pool(0,0,3.2,0x3a5a3a);ring(9,3.4,(x,z)=>reeds(x,z,0x4a6a30));stump(-3.8,2.2);stump(3.6,-2.8);ring(5,4.4,(x,z)=>rock(x,z,.5,0x4a5040));put(G_CYL,S(0x3a3026),1.2,.15,1.6,.18,2.6,.18,Math.PI/2,.7,0)},
   wolf(){rock(0,-2.2,3.2,0x8a9098);rock(-2.2,-1.4,2.2,0x7a8088);rock(2.4,-1.6,2.4,0x9098a0);put(G_SPH,S(0x101418),0,.55,-.95,.9,.75,.4);bones(1.6,1.4);bones(-1.8,1.8);bones(.2,2.6);ring(4,4.4,(x,z)=>put(G_CYL,S(0x4a3426),x,.2,z,.18,1.8,.18,Math.PI/2,rr(0,3),0));mound(3.2,2.8,1.4,0xe8eef4)},
   tort(){ring(7,3.4,(x,z)=>rock(x,z,rr(1,1.8),0x8a857a));rock(0,0,1.4,0x7a7568);ring(5,1.8,(x,z)=>put(G_SPH,S(0x5a8a4a),x,.04,z,.5,.12,.5));pool(1.2,-1,1,0x4a7a9a)},
   bats(){rock(0,-2.6,3.6,0x4a4058);put(G_SPH,S(0x08060c),0,.75,-1,1.1,.95,.4);ring(9,3.4,(x,z)=>spike(x,z,rr(.9,2.2),0x5a5068));ring(4,2.4,(x,z)=>crystal(x,z,rr(.5,.9),0x9a7aff));bones(1.4,1.6)},
   shrine(){totem(0,-1.4,[0x7a4a2a,0x3a6a5a,0x8a3a2a,0x5a4a8a]);cauldron(0,1.2,0x7af07a);ring(4,3.2,(x,z,a,i)=>i%2?skullPole(x,z):totem(x,z,[0x6a4a2a,0x4a7a6a]));tent(-3.4,1.6,1.8,0x5a4a3a)},
   shroom(){ring(8,3.4,(x,z)=>shroom(x,z,rr(.9,1.6),[0x9a3a7a,0x5a8aa0,0xc04a6a][R(0,2)],true));shroom(0,0,2.6,0x7a3a8a,true);ring(10,1.8,(x,z)=>shroom(x,z,rr(.3,.5),0xe8a0d0,true));pool(2,2,.9,0x8af0c0,true)},
   ritual(){runes(0,0,3,0xff3a1a);ring(5,3.6,(x,z)=>brazier(x,z,0xff5a1a));obelisk(0,0,3.4,0x2a1e1e,0xff4a1a);ring(6,4.8,(x,z)=>candle(x,z,0xff7a2a));banner(-5,1,0x6a1010);banner(5,-1,0x6a1010)},
   lava(){pool(0,0,2.8,0xff6a1a,true);ring(8,3.6,(x,z)=>rock(x,z,rr(.7,1.4),0x1e1a22));ring(4,3.2,(x,z)=>spike(x,z,rr(1.5,2.6),0x2a2028));bones(3.8,1.8)},
   orc(){fire(0,0,0xff5a1a);palisade(5.6,rr(0,6),0x3a2a1a,1.9);ring(3,3.4,(x,z,a)=>tent(x,z,a+Math.PI,0x4a2a1a,1.25));ring(4,4.6,(x,z)=>skullPole(x,z));banner(-1.6,-2.4,0x8a1a1a);banner(1.8,2.2,0x8a1a1a);put(G_BOX,S(0x2a2a2e,{metalness:.6}),1.6,.4,-1.2,.9,.8,.9)},
   web(){ring(5,3.4,(x,z)=>stump(x,z,0x2a2420));ring(4,2.6,(x,z,a)=>web(x,z,a+Math.PI/2,rr(.9,1.3)));for(let i=0;i<6;i++)cocoon(rr(-3.5,3.5),rr(-3.5,3.5),rr(.5,1.4));bones(0,0);bones(1.6,-1)},
   grave(){ring(9,3.2,(x,z,a)=>grave(x,z,a));pillar(0,0,1.6,0xa8a090);ring(4,4.8,(x,z)=>stump(x,z,0x4a4038));bones(1.2,1.6);put(G_BOX,S(0x6a6458),0,.25,-1.6,1.4,.5,.8)},
   fort(){wallSeg(0,-3.8,0,7,2.6);wallSeg(-3.6,-1,Math.PI/2,5,rr(1.4,2.4));wallSeg(3.6,-1.6,Math.PI/2,4,rr(1,2));pillar(-3.6,-3.8,3.2,0x8a8478);pillar(3.6,-3.8,2,0x8a8478);ring(5,2.8,(x,z)=>rock(x,z,.5,0x8a8478));banner(0,-3.2,0x3a3a46);put(G_CYL,S(0x8a8478),1.8,.3,1.8,.3,2.6,.3,Math.PI/2,.4,0)},
   haunt(){ring(8,3.2,(x,z,a)=>grave(x,z,a,0x6a7a86));ring(12,2,(x,z)=>candle(x,z,0x9ad8ff));mound(0,0,1.8,0x4a5a50);ring(3,4.6,(x,z)=>stump(x,z,0x3a4048));const w=put(G_SPH,tm(0x9ad8ff,.12),0,1.4,0,1.6,1.6,1.6);w.castShadow=false},
   bog(){pool(0,0,3.6,0x2a3a26);ring(10,3.8,(x,z)=>reeds(x,z,0x3a5a28));ring(4,4.4,(x,z)=>stump(x,z,0x2a2820));bones(1.4,1.2);bones(-1.6,-.6);rock(0,0,.7,0x3a4030)},
   nest(){rock(0,0,2.6,0xb0a080);nest(0,0,1.2);ring(4,3.6,(x,z)=>rock(x,z,rr(.8,1.3),0xa89878));for(let i=0;i<8;i++)put(G_PLN,S(0x8a6a4a,{side:THREE.DoubleSide}),rr(-4,4),.05,rr(-4,4),.2,.5,1,-Math.PI/2,0,rr(0,3))},
   mega(){ring(7,3.6,(x,z,a)=>blk(x,z,0)||put(G_BOX,S(0x8a8a90),x,1.7,z,.9,3.4,.6,0,-a,rr(-.05,.05)));put(G_BOX,S(0x8a8a90),0,.35,0,1.8,.7,1.2);const r=put(G_BOX,glowM(0x8ad8ff),0,.72,0,1.4,.02,.8);r.castShadow=false;rock(4.8,2,1,0x7a7a80)},
   tomb(){obelisk(-2,-1.6,4.2,0xc8a868,0xffd06a);obelisk(2,-1.6,4.2,0xc8a868,0xffd06a);put(G_BOX,S(0xb89858),0,.9,-2.6,3,1.8,1.8);put(G_BOX,S(0x1a140c),0,.7,-1.68,1,1.4,.04);ring(5,3.6,(x,z)=>pillar(x,z,rr(.8,2.2),0xc8b088));mound(2.6,2.4,1.6,0xd8b880);mound(-3,2,1.2,0xd8b880)},
   wyrm(){ribs(0,0,rr(0,3),1.2);mound(-3,2.6,1.8,0xd8b070);mound(3.4,-2.2,1.5,0xd8b070);ring(4,4.4,(x,z)=>rock(x,z,.8,0xb08a5a))}
  })[C.th.b]();
  // ---- the wider settlement: themed ground and an outer ring of structures ----
  const GC={goblin:0x5e4c36,bandit:0x5a4a38,brig:0x5a4a38,orc:0x4a3626,mire:0x34402a,bog:0x2e3824,wolf:0x8a9096,tort:0x6e6a60,bats:0x2e2838,shrine:0x4a3c30,shroom:0x4a3058,ritual:0x2a1c1a,lava:0x241a1a,web:0x1e1c22,grave:0x5a5446,fort:0x6a665c,haunt:0x3a4a4c,nest:0x8a7a5a,mega:0x6a6a64,tomb:0xb89a68,wyrm:0xb08e5a};
  {const gc=GC[C.th.b]||0x5e4c36,patch=(r0,r1,mat,lift)=>{const geo=new THREE.RingGeometry(r0,r1,18,3),P=geo.attributes.position;
      for(let k=0;k<P.count;k++){const x=P.getX(k),y=P.getY(k),w=1+.12*Math.sin(Math.atan2(y,x)*5+C.seed);P.setXYZ(k,x*w,GH(C.x+x*w,C.z-y*w)+lift,-y*w)}
      geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.receiveShadow=true;m.renderOrder=-1;g.add(m)};
    patch(.01,CAMP_R-1.5,sm(gc,{polygonOffset:true,polygonOffsetFactor:-2}),.04);patch(CAMP_R-1.5,CAMP_R+1.5,tm(gc,.45),.05)}
  const OUT={
   goblin:[(x,z,a)=>tent(x,z,a+Math.PI,0x6a4a2a),(x,z)=>crate(x,z),(x,z)=>skullPole(x,z),(x,z)=>barrel(x,z)],
   slingers:[(x,z)=>rock(x,z,rr(.5,.9),0x7a7670),(x,z,a)=>tent(x,z,a+Math.PI,0x6a5a3a,.8)],
   bandit:[(x,z,a)=>tent(x,z,a+Math.PI,[0x5a2a2a,0x3a3a46][R(0,1)]),(x,z)=>crate(x,z),(x,z)=>barrel(x,z),(x,z)=>fire(x,z)],
   brig:[(x,z,a)=>tent(x,z,a+Math.PI,0x4a4a54,1.1),(x,z)=>crate(x,z),(x,z)=>tower(x,z,0x7a2a20)],
   orc:[(x,z,a)=>tent(x,z,a+Math.PI,0x4a2a1a,1.2),(x,z)=>skullPole(x,z),(x,z)=>banner(x,z,0x8a1a1a),(x,z)=>fire(x,z,0xff5a1a)],
   mire:[(x,z)=>reeds(x,z),(x,z)=>stump(x,z),(x,z)=>pool(x,z,rr(1,1.8),0x3a5a3a)],
   bog:[(x,z)=>reeds(x,z,0x3a5a28),(x,z)=>stump(x,z,0x2a2820),(x,z)=>pool(x,z,rr(1,2),0x2a3a26),(x,z)=>bones(x,z)],
   wolf:[(x,z)=>rock(x,z,rr(.8,1.6),0x8a9098),(x,z)=>bones(x,z),(x,z)=>stump(x,z)],
   tort:[(x,z)=>rock(x,z,rr(1,2),0x8a857a),(x,z)=>pool(x,z,1,0x4a7a9a)],
   bats:[(x,z)=>spike(x,z,rr(1,2.4),0x5a5068),(x,z)=>crystal(x,z,rr(.5,1),0x9a7aff),(x,z)=>rock(x,z,1.2,0x4a4058)],
   shrine:[(x,z)=>totem(x,z,[0x6a4a2a,0x4a7a6a,0x8a3a2a]),(x,z)=>skullPole(x,z),(x,z,a)=>tent(x,z,a+Math.PI,0x5a4a3a),(x,z)=>shroom(x,z,.8,0x7a3a8a,true)],
   shroom:[(x,z)=>shroom(x,z,rr(1,2),[0x9a3a7a,0x5a8aa0,0xc04a6a][R(0,2)],true),(x,z)=>shroom(x,z,rr(.4,.7),0xe8a0d0,true)],
   ritual:[(x,z)=>brazier(x,z,0xff5a1a),(x,z)=>obelisk(x,z,rr(2,3),0x2a1e1e,0xff4a1a),(x,z)=>candle(x,z,0xff7a2a),(x,z)=>banner(x,z,0x6a1010)],
   lava:[(x,z)=>rock(x,z,rr(.8,1.5),0x1e1a22),(x,z)=>spike(x,z,rr(1.5,2.8),0x2a2028),(x,z)=>pool(x,z,rr(.8,1.4),0xff6a1a,true)],
   web:[(x,z)=>stump(x,z,0x2a2420),(x,z)=>cocoon(x,z,rr(.5,1.3)),(x,z,a)=>web(x,z,a,rr(.8,1.2))],
   grave:[(x,z,a)=>grave(x,z,a),(x,z)=>stump(x,z,0x4a4038),(x,z)=>pillar(x,z,rr(.8,1.8),0xa8a090)],
   fort:[(x,z,a)=>wallSeg(x,z,a+Math.PI/2,rr(2,4),rr(1,2.4)),(x,z)=>pillar(x,z,rr(1.2,3),0x8a8478),(x,z)=>rock(x,z,.6,0x8a8478)],
   haunt:[(x,z,a)=>grave(x,z,a,0x6a7a86),(x,z)=>candle(x,z,0x9ad8ff),(x,z)=>stump(x,z,0x3a4048)],
   nest:[(x,z)=>rock(x,z,rr(.9,1.6),0xa89878),(x,z)=>nest(x,z,.7)],
   mega:[(x,z,a)=>blk(x,z,0)||put(G_BOX,S(0x8a8a90),x,1.5,z,.8,3,.55,0,-a,rr(-.12,.12)),(x,z)=>rock(x,z,rr(.6,1.1),0x7a7a80)],
   tomb:[(x,z)=>pillar(x,z,rr(.8,2.4),0xc8b088),(x,z)=>obelisk(x,z,rr(2.2,3.4),0xc8a868,0xffd06a),(x,z)=>mound(x,z,rr(1,1.8),0xd8b880)],
   wyrm:[(x,z)=>bones(x,z),(x,z)=>mound(x,z,rr(1.2,2),0xd8b070),(x,z)=>rock(x,z,rr(.6,1),0xb08a5a)]
  };
  {const key=OUT[C.th.b]&&C.th===CTH.slingers?'slingers':C.th.b,L=OUT[key]||OUT[C.th.b];if(L){const n=14;for(let k=0;k<n;k++){const a=k/n*6.283+rr(-.15,.15),r=rr(7.2,CAMP_R-1);L[k%L.length](Math.cos(a)*r,Math.sin(a)*r,a)}}}
  // a crude wooden sign at the edge
  {const a=rn()*6.283,x=Math.cos(a)*(CAMP_R+.5),z=Math.sin(a)*(CAMP_R+.5);{const sp=twPostG(1.6,1.3,.4);sp.position.set(x,gy(x,z),z);sp.rotation.y=-a+Math.PI/2;g.add(sp)}sign(g,[{t:C.th.n,f:'700 34px'}],1.6,.4,'#5a3d20','#f4e9d0',null,x,gy(x,z)+1.3,z,-a+Math.PI/2)}
  // merge static pieces by material to keep draw calls low
  const keep=new Set(CFL),by=new Map(),rm=[];
  g.children.forEach(o=>{if(!o.isMesh||keep.has(o)||o.material.map){o.matrixAutoUpdate=false;o.updateMatrix();return}
    o.updateMatrix();const k=o.material;if(!by.has(k))by.set(k,{geo:[],sh:false});const e=by.get(k),gg=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone());gg.applyMatrix4(o.matrix);e.geo.push(gg);e.sh=e.sh||o.castShadow;rm.push(o)});
  rm.forEach(o=>g.remove(o));
  by.forEach((e,mat)=>{let n=0;e.geo.forEach(q=>n+=q.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3);let off=0;
    e.geo.forEach(q=>{P.set(q.attributes.position.array,off*3);if(q.attributes.normal)N.set(q.attributes.normal.array,off*3);off+=q.attributes.position.count;q.dispose()});
    const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(P,3));bg.setAttribute('normal',new THREE.BufferAttribute(N,3));bg.computeBoundingSphere();
    let m;if(!mat.transparent&&!mat.isMeshBasicMaterial){const P2=bg.attributes.position,cl=new Float32Array(P2.count*3);for(let i=0;i+2<P2.count;i+=3){const q=Math.sin(P2.getX(i)*12.9898+P2.getY(i)*78.233+P2.getZ(i)*37.719)*43758.5453,v=.8+.32*(q-Math.floor(q));for(let k=0;k<9;k++)cl[i*3+k]=v}bg.setAttribute('color',new THREE.BufferAttribute(cl,3));if(!CMC.has(mat)){const c=mat.clone();c.vertexColors=true;c.flatShading=true;c.userData.lps=1;CMC.set(mat,c)}m=new THREE.Mesh(bg,CMC.get(mat))}else m=new THREE.Mesh(bg,mat);m.castShadow=e.sh&&!mat.transparent;m.receiveShadow=true;m.matrixAutoUpdate=false;m.updateMatrix();g.add(m)});
  scene.add(g);C.g=g;
}
let campT=0;
function campTick(dt,now){
  if(CFL.length){const k=now*.012;for(let i=0;i<CFL.length;i++){const f=CFL[i];if(!f.parent||!f.parent.visible)continue;const s=1+.12*Math.sin(k+i*1.7)+.06*Math.sin(k*2.3+i);f.scale.y=(f.userData.sy||(f.userData.sy=f.scale.y))*s;f.updateMatrix()}}
  if(now-campT<300)return;campT=now;const p=pl.position,far=false;
  CAMPS.forEach(C=>{const d=Math.hypot(C.x-p.x,C.z-p.z);if(!far&&d<95&&!C.g)buildCamp(C);if(C.g)C.g.visible=!far&&d<100});
}
