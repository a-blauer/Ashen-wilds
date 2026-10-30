// ================= v112: every zone's field instances II and III have a sub-theme of their own =================
// Instance I of every zone stays as it was. II and III keep the zone's palette and mood but each is a different place:
//   Kindlelight       II The Glowmire Hollows (cave tunnels, glowing goo streams, glowing fungus)  III The Rotwood (dark rotting forest)
//   Hillside Crest    II Mistmere (misty highland lakes, serpent ruins)                              III The Galecliffs (windswept cliffs)
//   Burningeye Summit II The Rimecaverns (ice caverns, glowing meltwater)                           III Stormcrown (frozen peak in a blizzard)
//   Searing Sands     II The Sunken Temple (red canyon, temple gates)                               III The Salt Wastes (salt flats, oasis ruins)
//   The Dirge         II The Drowned Crypts (flooded vaults, spectral channels)                     III The Ossuary Fields (plains of bones)
//   The Citadel       II The Outer Ramparts (siege camp)                                            III The Inner Keep (halls and blood gardens)
// Each theme (TH112.byG[g], g = insG(zone,k)) has:
//   bio  a BIOMES entry of its own (appended by v112Biomes; same name as the zone so zone checks still hold): ground,
//        grass, accent, rim and water colours, rim trees, harvest nodes, patch densities, camp colours, terrain roughness
//   sh   the terrain shape: road/branch/field widths, rim tiles and the wall profile ('cave', 'canyon', 'cliff', 'open',
//        'forest', 'lake', 'keep'), applied by v112Map (tiles, at the end of the 0045 world build) and v112Ht (heights)
//   Z    the decoration set (like 1680's Z[zone]; types defined in v112Deco, placed by wdDeco with a seeded stream of
//        their own), plus arches over the road and rock overhangs (v112Post)
//   a    the atmosphere on top of the zone's (fog, light, grade, sky, particles, lantern, water glow), blended in ia112
//   st   decorative ribbons along the road (glowing goo / meltwater / spectral channels, the keep's red carpet)
// The roads (wp, path, branches), camps, gateway clearings, entrances and levels are the v108 ones: only the ground
// around them changes, so every gateway, camp, treasure-map spot and co-op region works as before. Everything is seeded
// (mkR112), so co-op partners build the same world. The tile layout changed: WD_WL 112; v108 saves are moved (v112Load).
var TH112; // (no initialiser: v112Biomes fills it from 0045, long before this file runs)
function mkR112(s){let sd=(Math.abs(Math.floor(s))%2147483646)+1;return ()=>(sd=sd*16807%2147483647)/2147483647}
function th112(){if(TH112)return TH112;
  const L=[
   // ---------------- Kindlelight ----------------
   {z:0,k:1,nm:'The Glowmire Hollows',sub:'Winding caves of glowing goo and fungus',
    bio:{gnd:[44,52,48],grs:[40,96,62],acc:[56,78,60],frs:[22,30,26],wat:[96,230,70],tree:['shroom','shroom','dead'],pr:['mush','mush','crystal','rock'],den:[0,1.6,0,1.2],tc:[0xb8b098,0x2a8a6a,0x2a6a5a],amp:.45},
    sh:{k:'cave',hw:6.4,hwA:1.2,hwB:.8,wig:1.5,br:4.6,brA:1,fd:.5,alc:22,alr:[4,7],rim:'mix',H:17,HW:3.4,drop:[15,22]},
    a:{fog:.064,fc:0x03100c,fcA:.95,sun:.12,hemi:.38,env:'dark',ex:.94,sat:1.32,vig:1.7,sky:0,lan:1,pt:'spore',pc:0x9affb8,po:.9,wamb:1.9},
    st:[{c:0x4cff2a,w:1.5,A:4.3,f:.031,ph:0,sp:.22},{c:0x8aff4a,w:1,A:-4.8,f:.047,ph:2,sp:.32,br:1}],
    arch:{k:'k2_arch',n:18,hs:5.2},ceil:{k:'k2_ceil',n:10}},
   {z:0,k:2,nm:'The Rotwood',sub:'A dark forest rotting where the bog dries out',
    bio:{gnd:[50,46,36],grs:[66,64,38],acc:[62,52,40],frs:[22,22,18],wat:[64,62,38],tree:['dead','dead','oak','dead'],pr:['mush','bones','bush','mound'],den:[1,1.2,.5,.9],tc:[0x2a241c,0x3a3a22,0x4a4428],amp:.5},
    sh:{k:'forest',hw:10.5,hwA:2.5,hwB:1.5,wig:3,br:8,brA:2,fd:1,rim:'forest',H:12,HW:6,drop:[12,19]},
    a:{fog:.044,fc:0x1e1a12,fcA:.8,sun:.42,hemi:.6,env:'dim',ex:.9,sat:.82,vig:1.65,sky:.55,lan:1,pt:'leaf',pc:0x8a6a3a,po:.75}},
   // ---------------- Hillside Crest ----------------
   {z:1,k:1,nm:'Mistmere',sub:'Misty highland lakes among the serpent ruins',
    bio:{gnd:[84,118,80],grs:[66,126,74],acc:[128,134,118],frs:[30,62,44],wat:[64,118,150],tree:['oak','pine','oak'],pr:['flower','rock','bush','rock'],den:[1.1,1,.4,1.6],tc:[0x4a3a2a,0x2f6a44,0x3e7a52],amp:.6},
    sh:{k:'lake',hw:12,hwA:3,hwB:2,wig:3,br:9,brA:2,fd:1.08,rim:'mix',lakes:1,H:10,HW:7,drop:[12,19]},
    a:{fog:.021,fc:0x9aa8b4,fcA:.75,sun:.85,hemi:1.05,ex:1.02,sat:1.08,vig:1.25,sky:.8,pt:'mote',pc:0xf4f8ff,po:.6,wref:0x3e5260}},
   {z:1,k:2,nm:'The Galecliffs',sub:'Windswept cliffs high above the plains',
    bio:{gnd:[146,136,82],grs:[150,146,74],acc:[138,128,108],frs:[50,70,46],wat:[60,110,150],tree:['pine','pine','dead'],pr:['rock','rock','flower','bush'],den:[1.2,1.3,.4,.15],tc:[0x4a3a28,0x3a6a3a,0x4a7a44],amp:1.7},
    sh:{k:'cliff',hw:11,hwA:3,hwB:2,wig:3,br:8,brA:2,fd:1,rim:'R',H:15,HW:4.5,drop:[13,20]},
    a:{fog:.0062,fc:0xc8b8a0,fcA:.5,sun:1.12,hemi:1.08,ex:1.1,sat:1.18,vig:1.15,sky:1,pt:'gust',pc:0xffffff,po:.45}},
   // ---------------- Burningeye Summit ----------------
   {z:2,k:1,nm:'The Rimecaverns',sub:'Ice caverns beneath the burning sky',
    bio:{gnd:[138,166,192],grs:[160,190,216],acc:[100,140,184],frs:[40,58,76],wat:[130,214,255],tree:['crystal','dead'],pr:['crystal','rock','crystal'],den:[0,1.5,0,1],tc:[0x3a3e48,0x6ab8ff,0x9ad8ff],amp:.45},
    sh:{k:'cave',hw:7,hwA:1.3,hwB:.9,wig:1.5,br:5,brA:1,fd:.62,alc:20,alr:[4,7],rim:'mix',H:17,HW:3.4,drop:[15,22]},
    a:{fog:.05,fc:0x0a1a30,fcA:.92,sun:.2,hemi:.45,env:'dim',ex:.98,sat:1.15,vig:1.6,sky:0,lan:1,pt:'sparkle',pc:0xbfe8ff,po:.8,wamb:1.5},
    st:[{c:0x5ad8ff,w:1.4,A:4.2,f:.03,ph:1,sp:.12}],
    arch:{k:'b2_arch',n:18,hs:5.4},ceil:{k:'b2_ceil',n:11}},
   {z:2,k:2,nm:'Stormcrown',sub:'The frozen peak, lost in a howling blizzard',
    bio:{gnd:[226,232,242],grs:[204,214,230],acc:[144,152,170],frs:[40,58,62],wat:[150,196,226],tree:['pine','dead','pine'],pr:['rock','crystal','rock'],den:[.5,1.4,.4,.25],tc:[0x3a2a28,0x214a50,0x2a5a60],amp:1.9},
    sh:{k:'cliff',hw:11,hwA:3,hwB:2,wig:3,br:8,brA:2,fd:1,rim:'R',H:16,HW:5,drop:[13,20]},
    a:{fog:.038,fc:0xc4ccd8,fcA:.85,sun:.6,hemi:1.15,ex:1.04,sat:.72,vig:1.4,sky:.35,pt:'blizzard',pc:0xffffff,po:.9}},
   // ---------------- Searing Sands ----------------
   {z:3,k:1,nm:'The Sunken Temple',sub:'A buried temple at the bottom of a red canyon',
    bio:{gnd:[186,110,70],grs:[168,104,64],acc:[204,158,108],frs:[120,66,40],wat:[56,140,128],tree:['spire','cactus'],pr:['pillar','bones','rock','pillar'],den:[.4,1.3,.1,.15],tc:[0x5a7a3a,0x6a8a44,0x7a9a50],amp:.6},
    sh:{k:'canyon',hw:8.4,hwA:1.5,hwB:1,wig:2,br:6,brA:1,fd:.85,alc:10,alr:[5,8],rim:'R',H:23,HW:3.8,drop:[15,22]},
    a:{fog:.019,fc:0x8a4424,fcA:.6,sun:.92,hemi:.82,ex:1.0,sat:1.38,vig:1.35,sky:1,pt:'sand',pc:0xd8905a,po:.5},
    arch:{k:'s2_gate',n:20,hs:4.6}},
   {z:3,k:2,nm:'The Salt Wastes',sub:'Blinding salt flats and the ruins of an oasis',
    bio:{gnd:[226,220,204],grs:[188,178,120],acc:[198,188,166],frs:[120,140,80],wat:[40,168,170],tree:['cactus','spire'],pr:['crystal','bones','rock','crystal'],den:[.5,1.2,.3,1.3],tc:[0x4a7a3a,0x5a8a44,0x6a9a50],amp:.22},
    sh:{k:'open',hw:13.5,hwA:3,hwB:2,wig:3,br:10,brA:2,fd:1.12,rim:'R',H:6,HW:6,drop:[11,18]},
    a:{fog:.0105,fc:0xf2e8d4,fcA:.7,sun:1.08,hemi:1.12,ex:1.12,sat:.95,vig:1.1,sky:1,pt:'mote',pc:0xfff4e0,po:.35}},
   // ---------------- The Dirge ----------------
   {z:4,k:1,nm:'The Drowned Crypts',sub:'Flooded vaults beneath the graveyard',
    bio:{gnd:[54,58,64],grs:[46,72,66],acc:[78,80,86],frs:[24,30,32],wat:[50,170,140],tree:['dead','crystal'],pr:['grave','bones','pillar','mush'],den:[0,1.5,0,2.2],tc:[0x2a2a30,0x3a4a50,0x4a5a64],amp:.35},
    sh:{k:'cave',hw:7.2,hwA:1.3,hwB:.9,wig:1.5,br:5,brA:1,fd:.66,alc:16,alr:[4,7],rim:'mix',H:15,HW:3.4,drop:[15,22]},
    a:{fog:.052,fc:0x081a1c,fcA:.92,sun:.25,hemi:.4,env:'dark',ex:.9,sat:1.15,vig:1.65,sky:0,lan:1,pt:'wisp',pc:0x6affd8,po:.85,wamb:1.4},
    st:[{c:0x3affc8,w:1.3,A:4.4,f:.028,ph:3,sp:.1}],
    arch:{k:'d2_arch',n:18,hs:5.4},ceil:{k:'d2_ceil',n:9}},
   {z:4,k:2,nm:'The Ossuary Fields',sub:'Grey plains strewn with the bones of the old dead',
    bio:{gnd:[124,120,104],grs:[138,132,104],acc:[168,162,140],frs:[34,36,32],wat:[70,86,70],tree:['dead','dead'],pr:['bones','bones','grave','rock'],den:[.25,1.5,.3,.15],tc:[0x2a2a30,0x3a3a34,0x4a4a40],amp:.65},
    sh:{k:'open',hw:13,hwA:3,hwB:2,wig:3,br:9,brA:2,fd:1.1,rim:'mix',H:9,HW:6,drop:[12,19]},
    a:{fog:.03,fc:0x4a5240,fcA:.8,sun:.62,hemi:.7,env:'dim',ex:.94,sat:.66,vig:1.55,sky:.7,pt:'ash',pc:0xb8b8a8,po:.7}},
   // ---------------- The Citadel ----------------
   {z:5,k:1,nm:'The Outer Ramparts',sub:'The siege camp at the foot of the Citadel walls',
    bio:{gnd:[72,54,48],grs:[84,40,32],acc:[98,86,82],frs:[30,24,28],wat:[90,20,30],tree:['dead'],pr:['pillar','bones','pillar'],den:[.4,1,0,0],tc:[0x3a1a14,0x5a2018,0x6a2a20],amp:.12},
    sh:{k:'keep',hw:13,hwA:2.5,hwB:1.5,wig:3,br:9,brA:2,fd:1.05,rim:'void'},
    a:{fog:.028,fc:0x3a1a0c,fcA:.75,sun:1.1,hemi:1.1,ex:.92,sat:1.25,vig:1.5,sky:.8,pt:'ember',pc:0xff7a2a,po:.95}},
   {z:5,k:2,nm:'The Inner Keep',sub:'Moonlit halls and the blood gardens of the court',
    bio:{gnd:[88,90,108],grs:[34,58,36],acc:[132,122,136],frs:[30,24,28],wat:[120,16,26],tree:['dead'],pr:['pillar','pillar','bones'],den:[.5,1.8,0,.5],tc:[0x2a1a1a,0x3a2028,0x4a2a30],amp:.06},
    sh:{k:'keep',hw:10.5,hwA:2,hwB:1,wig:2,br:8,brA:1.5,fd:1,rim:'void'},
    a:{fog:.024,fc:0x24183e,fcA:.95,sun:.8,hemi:.95,ex:.94,sat:1.15,vig:1.5,sky:.5,pt:'petal',pc:0xc8102a,po:.95},
    st:[{c:0xa01226,w:2.4,A:0,f:0,ph:0,sp:0,flat:1}]}];
  TH112={list:L,byG:{}};L.forEach((t,i)=>{t.g=insG(t.z,t.k);t.i=i;t.seed=112000+t.g*7919;TH112.byG[t.g]=t});return TH112}
// ---------- 1. biomes: one entry per themed instance (called from 0045 right after BIOMES) ----------
function v112Biomes(){const TH=th112();TH.list.forEach(t=>{const z=BIOMES[PMAP[t.z].bi];
  t.bi=BIOMES.length;BIOMES.push(Object.assign({n:z.n,sp:z.sp,x:z.x,y:z.y,t:z.t,v112:t.g},t.bio))})}
// ---------- 2. the tiles of II and III (called from 0045 at the end of the MAP build) ----------
// Re-stamps the walkable ground of each themed instance from its own roads (same wp/path/branches/fields/camps as v108)
// with the theme's widths, redraws the rim, the grass/accent/water patches and the harvest nodes with a seeded stream of
// its own, and points the instance's tiles at its biome. Instance I, the Den and the Trial are not touched.
function v112Map(m,bio,DW,props,stamp){const TH=th112(),t0=performance.now();
  TH.list.forEach(t=>{const I=INSL[t.g],S=t.sh,x0=I.x0,y0=I.y0,x1=x0+I.w,y1=y0+I.h,rnd=mkR112(t.seed),ri=(a,b)=>a+rnd()*(b-a);
    const mine=(x,y)=>{const J=insAt(x,y);return !J||J===I};
    for(let y=Math.max(1,y0-3);y<Math.min(H-1,y1+3);y++)for(let x=Math.max(1,x0-3);x<Math.min(W-1,x1+3);x++)if(mine(x,y)){DW[y*W+x]=99;m[y][x]=''}
    // roads, branches, fields (chambers in caves), camps, the gateway clearing
    const P=I.path;P.forEach(([x,y],i)=>{if(i%2)return;const hw=S.hw+S.hwA*Math.sin(i*.045+I.g)+S.hwB*Math.sin(i*.13+I.g*2);stamp(x+S.wig*Math.sin(i*.07),y+S.wig*Math.cos(i*.05),hw)});
    I.br.forEach(l=>{for(let k=0;k<l.length-1;k++){const [ax,ay]=l[k],[bx,by]=l[k+1],n=Math.ceil(Math.hypot(bx-ax,by-ay)/2);for(let q=0;q<=n;q++){const u=q/n;stamp(ax+(bx-ax)*u,ay+(by-ay)*u,S.br+S.brA*Math.sin(q*.4+k))}}});
    I.fd.forEach(([x,y,r])=>{r*=S.fd;stamp(x,y,r);stamp(x+r*.45,y-r*.3,r*.7);stamp(x-r*.4,y+r*.35,r*.65)});
    // caves and the canyon: side pockets off the tunnel make it wind and bulge
    for(let a=0;a<(S.alc||0);a++){const i=Math.floor(ri(.08,.92)*P.length),q=P[i],n=P[Math.min(P.length-1,i+4)],p0=P[Math.max(0,i-4)],dx=n[0]-p0[0],dy=n[1]-p0[1],l=Math.hypot(dx,dy)||1,sd=rnd()<.5?-1:1,o=ri(5,8.5),r=ri(S.alr[0],S.alr[1]);
      stamp(q[0]-dy/l*o*sd,q[1]+dx/l*o*sd,r)}
    I.cl.forEach(([x,y])=>stamp(x,y,17));stamp(I.ba[0],I.ba[1],PM_GTR);
    // tiles: walkable inside, the rim band (trees '#', rocks 'R' or void), void beyond
    for(let y=Math.max(1,y0-3);y<Math.min(H-1,y1+3);y++)for(let x=Math.max(1,x0-3);x<Math.min(W-1,x1+3);x++){if(!mine(x,y))continue;const d=DW[y*W+x],J=insAt(x,y);
      if(d<0){m[y][x]='.';continue}if(!J||d>=2.6)continue;
      m[y][x]=S.rim=='void'?'':S.rim=='R'?'R':S.rim=='forest'?(d>2.1?'R':'#'):(d>1.6?'R':'#')}
    for(let x=x0;x<x1;x++){m[y0][x]='';m[y1-1][x]=''}for(let y=y0;y<y1;y++){m[y][x0]='';m[y][x1-1]=''}
    // grass, accent and water patches (lakes in Mistmere)
    const b=t.bio,dn=b.den,A=I.w*I.h/(260*270);
    const blob=(ch,n,a,b2)=>{for(let i=0;i<n;i++){let cx=0,cy=0;for(let k=0;k<60;k++){const q=P[Math.floor(rnd()*P.length)];cx=Math.round(q[0]+(rnd()-.5)*(S.k=='cave'?14:22));cy=Math.round(q[1]+(rnd()-.5)*(S.k=='cave'?14:22));if(m[cy]&&m[cy][cx]=='.')break}
      const r=a+rnd()*(b2-a);for(let y=Math.floor(cy-r*1.3)-1;y<cy+r*1.3+1;y++)for(let x=Math.floor(cx-r)-1;x<cx+r+1;x++){if(!m[y]||m[y][x]!='.')continue;if(Math.hypot(x-cx,(y-cy)*1.25)<r*(.75+.25*Math.sin(x*1.7+y*1.1+i)))m[y][x]=ch}}};
    blob('g',Math.round(40*A*dn[0]),3,7);blob('a',Math.round(26*A*dn[1]),3,7);blob('~',Math.round(9*A*dn[3]),1.6,3.4);
    if(S.lakes)I.fd.forEach(([fx,fy,r],i)=>{r*=S.fd;const R0=r*ri(.55,.75);for(let y=Math.floor(fy-R0-3);y<=fy+R0+3;y++)for(let x=Math.floor(fx-R0-3);x<=fx+R0+3;x++){if(!m[y]||m[y][x]==''||m[y][x]=='#'||m[y][x]=='R')continue;
      const a=Math.atan2(y-fy,x-fx);if(Math.hypot(x-fx,y-fy)<R0*(.82+.18*Math.sin(a*3+i)+.08*Math.sin(a*7+i*2))&&DW[y*W+x]<-1.2)m[y][x]='~'}});
    // never water on the road, its branches, the camps, the gateway or the entrance
    const keep=(cx,cy,r)=>{for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++)if(m[y]&&m[y][x]=='~'&&Math.hypot(x-cx,y-cy)<r)m[y][x]='a'};
    P.forEach(([x,y],i)=>{if(i%2==0)keep(x,y,3.4)});I.br.forEach(l=>{for(let k=0;k<l.length-1;k++){const [ax,ay]=l[k],[bx,by]=l[k+1],n=Math.ceil(Math.hypot(bx-ax,by-ay)/2);for(let q=0;q<=n;q++)keep(ax+(bx-ax)*q/n,ay+(by-ay)*q/n,2.6)}});
    I.cl.forEach(c=>keep(c[0],c[1],14));keep(I.ba[0],I.ba[1],PM_GTR+1);keep(I.en[0],I.en[1],6);
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)bio[y][x]=t.bi;
    // harvest nodes: the old ones in this instance go, new ones of the theme's kinds come (same rule as 0045)
    for(let i=props.length-1;i>=0;i--){const q=props[i];if(q[0]>=x0&&q[0]<x1&&q[1]>=y0&&q[1]<y1)props.splice(i,1)}
    const okT=(x,y)=>{const u=m[y]&&m[y][x];return u=='.'||u=='g'||u=='a'},rockK=k=>k=='rock'||k=='grave'||k=='pillar',used=new Set();
    for(let y=y0+2;y<y1-2;y++)for(let x=x0+2;x<x1-2;x++){if(!okT(x,y)||rnd()>=.0012)continue;
      const wt=b.pr.map(k=>rockK(k)?.6:1),tot=wt.reduce((a,v)=>a+v,0);let u=rnd()*tot,k=b.pr[0];for(let i=0;i<b.pr.length;i++){u-=wt[i];if(u<=0){k=b.pr[i];break}}
      if(Math.hypot(x-I.ba[0],y-I.ba[1])<PM_GTR+4)continue;
      if(rockK(k)&&P.some((q,i)=>i%3==0&&Math.hypot(q[0]-x,q[1]-y)<5))continue;
      const n=3+Math.floor(rnd()*3);let got=0;
      for(let tr=0;tr<30&&got<n;tr++){const a=rnd()*6.283,d=tr?.8+rnd()*1.9:0,cx=Math.round(x+Math.cos(a)*d),cy=Math.round(y+Math.sin(a)*d),key=cy*W+cx;
        if(used.has(key)||!okT(cx,cy)||insAt(cx,cy)!==I)continue;used.add(key);if(rockK(k))m[cy][cx]='r';props.push([cx,cy,k]);got++}}
  });
  TH.mapMs=Math.round(performance.now()-t0)}
// ---------- 3. heights (called from the 0045 heightfield loop for every tile of II and III) ----------
function v112Base(x,y,a){const s=1.0+(fbm2(x*.02+3,y*.02+9,4)-.5)*6*a+(fbm2(x*.07,y*.07+4,3)-.5)*1.6*a,sp=s<-5?0:Math.log1p(Math.exp(s*1.5))/1.5;return .55+sp}
function v112Ht(I,i,j,d,dd,tile){const t=TH112&&TH112.byG[I.g];if(!t)return null;const S=t.sh;let h=tile=='~'?-1.2:v112Base(i,j,t.bio.amp);
  if(S.rim=='void')return h+6.5*smt(0,1.2,dd)-60*smt(4,9,dd); // the Citadel floats: walls are built on its edge
  const f=fbm2(i*.09,j*.09,3),f2=fbm2(i*.23+5,j*.23,2);
  if(S.k=='cave'||S.k=='canyon'){// sheer walls that close in overhead, with ledges and buttresses
    // (they keep climbing steeply past the foot, so no flat ledge high up catches the terrain shader's snow)
    const q=smt(.15,S.HW,dd+(f2-.5)*1.4);return h+(S.H+7*f)*q+Math.max(0,dd-S.HW)*1.8+2.5*smt(1.5,3,dd)*(f2-.4)-95*smt(S.drop[0],S.drop[1],dd)}
  if(S.k=='cliff'){// stretches of rock wall, and stretches where the ground ends in a sheer drop (a rocky lip stays as the rim)
    const up=(S.H+8*f)*smt(.4,S.HW,dd)+dd*.3+3*(f2-.5)*smt(2,6,dd)-62*smt(S.drop[0],S.drop[1],dd),
      down=(1.6+1.4*f2)*smt(.2,1.3,dd)*(1-smt(2.6,4,dd))-80*smt(2.6,10,dd),mx=smt(.4,.6,fbm2(i*.011+7,j*.011+3,3));
    return h+up*(1-mx)+down*mx}
  return h+(S.H+5*f)*smt(.6,S.HW,dd)+dd*.15-62*smt(S.drop[0],S.drop[1],dd)}
// ---------- 4. decorations (called from wdDeco with its shape kit; returns the per-instance sets) ----------
function v112Deco(c){const TH=th112(),{T,def,F,M,cyl,box,ico,dod,cone,oct,tor,dome,disc,pln,deadTree,rockG,stump,logG,bonesRib,skull,pillarG,wallG,grave,crossG,fenceG,ironFence,
  reeds,fern,flowers,tallGrass,shrub,mushC,lilies,cairn,banner,brazier,flame,lanternPost,lanternGlow,statueG,mausoleum,coffin,archG,duneG,cartG,crystals,icicles,rubble,candles,candleGlow,candelabra,candelaGlow,rootsG,plain}=c;
  // ---- new shapes ----
  const stalag=(hex,top,n)=>{const p=[];for(let i=0;i<(n||5);i++){const a=i*2.4,r=i?.35+i*.12:0,h=i?.8+((i*37)%10)/8:2.4;p.push(F(cone(.22+h*.06,h,6),hex,{j:.08,top,tt:.8},Math.cos(a)*r,h/2-.05,Math.sin(a)*r,Math.cos(a)*.12,0,Math.sin(a)*.12))}return M(p)};
  // an overhang: a slab of rock jutting out of the wall (+x = into the tunnel) with dripstones under it
  const ceilG=(hex,drip,o)=>{o=o||{};const p=[F(dod(1),hex,{j:.35,lo:.5,hi:.5},2.2,.2,0,0,0,0,[3.6,.8,2.4]),F(dod(1),hex,{j:.3,lo:.5,hi:.5},4.6,-.1,.4,0,.6,0,[1.8,.6,1.5]),F(dod(1),hex,{j:.3},-.6,-.9,0,0,.3,0,[1.6,1.6,1.8])];
    for(let i=0;i<8;i++){const x=.6+((i*37)%10)/10*5.2,z=(((i*53)%10)/10-.5)*2.6,h=.7+((i*29)%10)/9*1.4;p.push(F(cone(.13+h*.05,h,5),drip,{j:.04,lo:.9,hi:.3},x,-.4-h/2,z,Math.PI))}
    return M(p)};
  // a rock bridge over the road: pillars at x = ±hs, an arched beam on top
  const rockArch=(hex,top,hs,hh)=>{const p=[];[-1,1].forEach(s=>{let y=0;for(let i=0;i<5;i++){const r=1.15-i*.08,hy=hh/5*1.1;p.push(F(dod(1),hex,{j:.3,top,tt:.7},s*hs+((i*7)%3-1)*.15,y+hy*.45,((i*5)%3-1)*.12,0,i*.7,0,[r,hy*.62,r*.95]));y+=hy*.9}});
    const n=Math.ceil(hs*1.6);for(let i=0;i<=n;i++){const x=-hs+2*hs*i/n,y=hh+.8*Math.cos(x/hs*Math.PI/2)-.2;p.push(F(dod(1),hex,{j:.3,top,tt:.6},x,y,0,0,i*1.3,0,[1.25,.9+.25*((i*3)%2),1.1]))}
    for(let i=0;i<6;i++){const x=-hs*.7+hs*1.4*i/5,h=.6+((i*31)%10)/10;p.push(F(cone(.15,h,5),hex,{j:.04},x,hh-.5-h/2,(((i*17)%10)/10-.5)*.8,Math.PI))}return M(p)};
  const gshroom=(stemC)=>F(cyl(.18,.32,2.6,6),stemC,{j:.06,f:(x,y,z)=>[x+y*y*.06,y,z]},0,1.3,0);
  const gcap=()=>M([F(dome(1.1,8),0xffffff,{j:.12,lo:1,hi:0},.2,2.5,0,0,0,0,[1,.42,1]),F(disc(1.05,8),0xffffff,{lo:.55,hi:0},.2,2.5,0,Math.PI/2)]);
  const shelf=()=>{const p=[];for(let i=0;i<5;i++){const y=.3+i*.35,a=i*1.7;p.push(F(dome(.32+((i*13)%5)/18,6),0xffffff,{lo:1,hi:0},Math.cos(a)*.25,y,Math.sin(a)*.25,0,a,0,[1,.3,1]))}return M(p)};
  const gooPuddle=()=>F(disc(1,9),0xffffff,{lo:1,hi:0,j:.2,jy:0},0,0,0,-Math.PI/2,0,0,[1,.7,1]);
  const pillarR=(hex,top,h)=>{const p=[];let y=0;for(let i=0;i<6;i++){const hy=h/6,r=.95-Math.sin(i/5*Math.PI)*.3;p.push(F(dod(1),hex,{j:.25,top,tt:.75},((i*7)%3-1)*.1,y+hy/2,0,0,i,0,[r,hy*.7,r]));y+=hy*.92}return M(p)};
  const spire=(hex,top,h)=>M([F(cone(1,h,6),hex,{j:.35,top,tt:.75,f:(x,y,z)=>[x+(y+h/2)*(y+h/2)*.02,y,z]},0,h/2,0),F(cone(.6,h*.55,5),hex,{j:.25,top,tt:.75},.9,h*.27,.3,0,0,-.15),F(dod(.7),hex,{j:.2},-.6,.3,-.5)]);
  const bentPine=()=>{const p=[F(cyl(.08,.16,1.6,5),0x3a2a1e,{f:(x,y,z)=>[x+(y+.8)*(y+.8)*.18,y,z]},0,.8,0)];[[.8,1.3,.25],[.62,1.1,.55],[.42,.9,.85]].forEach(([r,h,o],i)=>p.push(F(cone(r,h,7),0x2a4a32,{j:.08,lo:.6,hi:.5},o,1.3+i*.55,0,0,0,-.25,[1.3,1,1])));return M(p)};
  const palm=()=>{const p=[F(cyl(.12,.2,3.4,6),0x6a5a3a,{j:.04,f:(x,y,z)=>[x+(y+1.7)*(y+1.7)*.07,y,z]},0,1.7,0)];for(let i=0;i<7;i++){const a=i/7*6.283;p.push(F(cone(.18,2,3),0x4a7a2a,{lo:.6,hi:.6},0,0,0,0,0,0,[1,1,.25]).rotateZ(1.9).translate(.8,3.3,0).rotateY(a))}
    p.push(F(ico(.18,0),0x5a3a1a,{},.8,3.15,.12),F(ico(.16,0),0x5a3a1a,{},.7,3.12,-.15));return M(p)};
  const obelisk=(hex)=>M([F(box(1.1,.5,1.1),hex,{j:.06},0,.25,0),F(cyl(.32,.5,4.2,4),hex,{j:.05},0,2.6,0,0,Math.PI/4,0),F(cone(.34,.7,4),hex,{j:.03},0,5.05,0,0,Math.PI/4,0)]);
  const glyphs=()=>{const p=[];for(let i=0;i<4;i++)p.push(F(box(.1,.22,.05),0xffffff,{lo:1,hi:0},((i%2)-.5)*.2,1.4+i*.75,.36));return M(p)};
  const frozen=()=>M([F(dt168Rock(171,1,.35,1).clone(),0x8ab8d4,{j:.08,lo:.8,hi:.5},0,.95,0,0,.3,0,[.62,1.02,.56]),skull(0xd8d8e0).translate(0,1.3,0)]);
  const sarco=(hex)=>M([F(box(1.16,.12,2.36),hex,{j:.02},0,.06,0),F(box(1,.52,2.2),hex,{j:.03},0,.38,0),F(box(1.1,.14,2.3),hex,{j:.03},0,.71,0),F(box(.92,.1,2.1),hex,{j:.02},0,.83,0)].concat([-1,1].map(s=>F(box(.04,.3,1.6),hex,{},s*.51,.38,0)),[F(cyl(.13,.17,1.15,7),hex,{j:.04},0,1,-.15,Math.PI/2,0,0),F(ico(.17,1),hex,{j:.03},0,1.02,.6),F(box(.42,.1,.22),hex,{j:.02},0,.93,-.82)]));   // v176: a carved tomb with a plinth, panels and a laid-out effigy
  const bonePile=()=>M([skull(0xd8d0b8),skull(0xc8c0a8).translate(.45,0,.2),skull(0xd0c8b0).translate(-.3,0,-.3),skull(0xc0b8a0).translate(.1,.3,0),F(dome(.9,7),0xb8b098,{j:.2},0,0,0,0,0,0,[1,.35,1]),
    F(cyl(.04,.04,.9,4),0xd8d0b8,{},.6,.15,-.4,0,.5,Math.PI/2),F(cyl(.04,.04,.8,4),0xd8d0b8,{},-.5,.12,.4,0,-.8,Math.PI/2)]);
  const boneSpikes=()=>{const p=[];for(let i=0;i<5;i++){const a=i*1.3,r=i?.3+i*.12:0,h=i?1+((i*37)%10)/10:2.2;p.push(F(cone(.1,h,4),0xe0d8c0,{j:.02},Math.cos(a)*r,h/2,Math.sin(a)*r,Math.cos(a)*.3,0,Math.sin(a)*.3))}return M(p)};
  const barricade=()=>{const p=[F(cyl(.08,.08,3.2,5),0x4a3420,{},0,.55,0,0,0,Math.PI/2)];for(let i=0;i<5;i++){const x=-1.3+i*.65;p.push(F(cyl(.04,.06,1.8,4),0x5a3e26,{},x,.55,0,.75,0,0),F(cyl(.04,.06,1.8,4),0x5a3e26,{},x+.3,.55,0,-.75,0,0))}return M(p)};
  const stake=()=>M([F(cyl(.05,.09,2.6,5),0x4a3420,{j:.02},0,1.3,0,.08,0,.05),skull(0xd8d0b8).translate(.08,2.55,0),F(cone(.05,.3,4),0x3a2a1a,{},.1,2.8,0)]);
  const tent=(cl)=>M([F(cone(1.6,2.4,4),cl,{j:.08,lo:.7,hi:.4},0,1.2,0,0,Math.PI/4,0),F(cyl(.04,.04,2.9,4),0x3a2a1a,{},0,1.45,0),F(box(.7,.9,.04),0x140c0c,{lo:1,hi:0},0,.45,1.12)]);
  const catapult=()=>M([F(box(2.4,.18,.18),0x5a3e26,{j:.02},0,.3,.6),F(box(2.4,.18,.18),0x5a3e26,{j:.02},0,.3,-.6),F(box(.18,1.4,.18),0x5a3e26,{},0,.9,.6,0,0,.3),F(box(.18,1.4,.18),0x5a3e26,{},0,.9,-.6,0,0,.3),
    F(cyl(.06,.06,1.4,5),0x3a2a1a,{},.2,1.4,0,Math.PI/2,0,0),F(box(2.8,.12,.14),0x6a4a2e,{},-.6,1.8,0,0,0,.6),F(dome(.35,6),0x3a2a1a,{},-1.7,2.4,0,Math.PI),
    F(tor(.42,.06,Math.PI*2,9),0x3a2a1a,{},-.9,.42,.72,0,0,0),F(tor(.42,.06,Math.PI*2,9),0x3a2a1a,{},.9,.42,.72,0,0,0),F(tor(.42,.06,Math.PI*2,9),0x3a2a1a,{},-.9,.42,-.72,0,0,0),F(tor(.42,.06,Math.PI*2,9),0x3a2a1a,{},.9,.42,-.72,0,0,0)]);
  const hedge=()=>M([F(box(2.9,.5,.75),0x1e2a1a,{j:.06,lo:.5,hi:.4},0,.25,0)].concat([-1.05,-.35,.35,1.05].map((x,i)=>F(ico(.62,1),[0x24381f,0x2a4024,0x22341e,0x2c4226][i],{j:.2,lo:.45,hi:.6},x,.72+(i%2)*.06,(i%2-.5)*.06,0,i,0,[1.05,.95,.72]))));   // v176: clipped but leafy, not a green box
  const topiary=()=>M([F(cyl(.08,.1,.6,5),0x3a2a1a,{},0,.3,0),F(ico(.55,1),0x2a4a2a,{j:.04,lo:.6,hi:.5},0,1.1,0),F(cone(.4,.9,6),0x2e522e,{j:.03},0,1.9,0),F(box(.9,.35,.9),0x5a5258,{j:.03},0,.17,0)]);
  const fountain=()=>M([F(cyl(1.8,1.9,.55,10),0x5a5258,{j:.05},0,.27,0),F(cyl(1.55,1.55,.1,10),0x3a0810,{lo:1,hi:0},0,.5,0),F(cyl(.25,.4,1.6,7),0x5a5258,{j:.03},0,1.2,0),F(cyl(.75,.4,.25,8),0x5a5258,{},0,1.95,0),statueG(0x5a5258,{}).scale(.6,.6,.6).translate(0,2.05,0)]);
  const fountainGlow=()=>F(cyl(1.5,1.5,.04,10),0xffffff,{lo:1,hi:0},0,.56,0);
  const glowM=(cl)=>({g:cl,glow:1});
  // ---- Kindlelight II: the Glowmire Hollows ----
  def('k2_gshroom',{parts:[gshroom(0xb8b8a0),glowM(gcap())],cast:true,col:.45,s:[.9,1.6],gt:[0x4affb0,0x7aff6a,0x5ae8ff]});
  def('k2_gshroomB',{parts:[gshroom(0xa8a890),glowM(gcap())],s:[1.4,2.4],gt:[0x4affb0,0x9aff5a,0x5ae8ff]});
  def('k2_shelf',{parts:[M([F(cyl(.13,.24,1.95,7),0x24201c,{j:.05,lo:.55,hi:.4},0,.97,0),F(cyl(.05,.09,.7,5),0x24201c,{},.12,1.75,.05,.3,0,-.35),F(cyl(.22,.3,.18,7),0x1c1a16,{j:.05},0,.05,0)]),glowM(shelf())],   /* v176: a rotten snag the glowing shelves grow on (they hung in the air) */near:true,s:[.9,1.6],gt:[0x6affa0,0xb0ff6a]});
  def('k2_goo',{parts:[glowM(gooPuddle())],near:true,y:.05,s:[.8,1.8],gt:[0x3ad82a,0x5aff3a]});
  def('k2_stalag',{parts:[stalag(0x3a423e,0x4a7a4a)],cast:true,col:.5,s:[.8,1.5]});
  def('k2_pillar',{parts:[pillarR(0x343c38,0x3e6a42,9)],cast:true,col:.95,s:[.9,1.2]});
  def('k2_ceil',{parts:[ceilG(0x2e3632,0x5a6a52)],s:[.8,1.35]});
  def('k2_arch',{parts:[rockArch(0x2e3632,0x3a6a3a,5.2,6.8)],cast:true,s:[1,1]});
  def('k2_web',{parts:[{g:plain(pln(2.2,2.2)),mat:'web'}],near:true,y:1.6,s:[.8,1.3],j:0});
  def('k2_rock',{parts:[rockG(0x343c38,0x3a6a3a,1.2,.9)],cast:true,col:.95,s:[1,1.7]});
  // ---- Kindlelight III: the Rotwood ----
  def('k3_tree',{parts:[deadTree(0x2e2a22,0x5a5236)],s:[1.3,2.1],cast:true,col:.45,sway:.006});
  def('k3_snag',{parts:[M([F(cyl(.32,.48,2.4,7),0x34302a,{j:.08,f:(x,y,z)=>y>1.15?[x,y+((x*13+z*7)%1+1)%1*.6,z]:[x,y,z]},0,1.2,0),F(cone(.12,.9,4),0x34302a,{},.2,2.6,0,0,0,-.4),rootsG(0x2e2a24).scale(.7,.7,.7)])],cast:true,col:.5,s:[1,1.5]});
  def('k3_fallen',{parts:[logG(0x342c22,0x4e4a30)],cast:true,cp:[[-.9,0,.45],[0,0,.45],[.9,0,.45]],s:[1.1,1.6]});
  def('k3_fungus',{parts:[M([stump(0x3a3026,0x5a4a36),F(dome(.3,6),0xc8a878,{lo:.9,hi:.2},.32,.35,0,0,0,0,[1,.3,1]),F(dome(.24,6),0xb89868,{lo:.9,hi:.2},-.28,.25,.1,0,0,0,[1,.3,1])])],near:true,s:[.9,1.4]});
  def('k3_toad',{parts:[mushC(0xb8ae94,0x7a5a3a,6)],near:true,s:[1,1.8]});
  def('k3_fern',{parts:[fern(0x6a5a2a)],near:true,s:[.8,1.3],sway:.08});
  def('k3_carcass',{parts:[bonesRib(0x9a9078)],cast:true,cp:[[-.6,0,.6],[.6,0,.6]],s:[1,1.4]});
  def('k3_skull',{parts:[skull(0xb8b0a0)],near:true,s:[.9,1.3]});
  def('k3_mist',{parts:[{g:plain(pln(1,1).rotateX(-Math.PI/2)),mat:'mist'}],y:.4,s:[5,9],j:0,tint:[0x8a8270]});
  def('k3_glow',{parts:[{g:mushC(0x8a9a80,0xffffff,5),glow:1}],near:true,s:[.8,1.3],tint:[0x7a9a5a],gt:[0x6a8a4a,0x8a9a5a]});
  // ---- Hillside Crest II: Mistmere ----
  def('h2_ruin',{parts:[wallG(0x7a807a,0x5a7a4a,3.6,2.2)],cast:true,cp:[[-1.3,0,.6],[0,0,.6],[1.3,0,.6]],s:[.9,1.25]});
  def('h2_col',{parts:[pillarG(0x8a8a84,2.8,0x5a7a4a)],cast:true,col:.5,s:[.9,1.3]});
  def('h2_arch',{parts:[archG(0x7a7e78,0x5a7a4a)],cast:true,cp:[[-1.7,0,.75],[1.7,0,.75]],s:[1,1.25]});
  def('h2_statue',{parts:[statueG(0x7a8078,{snake:1})],cast:true,col:.7,s:[1,1.3]});
  def('h2_reeds',{parts:[reeds(0x5a7a4a,0x4a3a2a)],near:true,s:[.9,1.4],sway:.18});
  def('h2_lily',{parts:[lilies()],near:true,abs:.035,s:[.8,1.4]});
  def('h2_mist',{parts:[{g:plain(pln(1,1).rotateX(-Math.PI/2)),mat:'mist'}],y:.5,s:[6,11],j:0,tint:[0x8a9aa8]});
  def('h2_flowers',{parts:[flowers([0x9ab8ff,0xffffff,0xc8d8ff,0x7a9aff])],near:true,s:[.9,1.5],sway:.12});
  def('h2_rubble',{parts:[rubble(0x7a7e78)],near:true,s:[.8,1.4]});
  def('h2_boat',{parts:[M([F(dome(1,8),0x4a3a28,{j:.05},0,.3,0,Math.PI,0,0,[.7,.4,1.9]),F(box(1,.06,.2),0x5a4632,{},0,.3,.3),F(box(1,.06,.2),0x5a4632,{},0,.3,-.5)])],near:true,abs:-.05,s:[1,1.2]});
  // ---- Hillside Crest III: the Galecliffs ----
  def('h3_spire',{parts:[spire(0x7a7064,0x8a9a5a,6)],cast:true,col:1,s:[.9,1.6]});
  def('h3_pine',{parts:[bentPine()],cast:true,col:.45,s:[1.1,1.7],sway:.03});
  def('h3_grass',{parts:[tallGrass(0xb0a85a)],near:true,s:[1,1.6],sway:.45});
  def('h3_banner',{parts:[banner(0x3a2e24,0x5a7a3a)],cast:true,col:.3,s:[1,1.25],sway:.02});
  def('h3_skull',{parts:[skull(0xd8d0b8)],near:true,s:[1,1.5]});
  def('h3_boulder',{parts:[rockG(0x8a8274,0x8a9a5a,1.2,.85)],cast:true,col:1,s:[1,1.9]});
  // ---- Burningeye II: the Rimecaverns ----
  def('b2_ceil',{parts:[ceilG(0x5a7898,0xc8ecff)],s:[.8,1.35]});
  def('b2_arch',{parts:[rockArch(0x5a7898,0xe8f4ff,5.4,6.8)],cast:true,s:[1,1]});
  def('b2_stalag',{parts:[stalag(0x8ab0d0,0xeaf6ff)],cast:true,col:.5,s:[.8,1.6]});
  def('b2_bigcrys',{parts:[{g:crystals(0xffffff),glow:1}],cast:false,col:.9,s:[1.6,2.6],tint:[0x7ac8ff],gt:[0x6ab8ff,0x9ae0ff,0x5a90ff]});
  def('b2_frozen',{parts:[frozen()],cast:true,col:.6,s:[.95,1.15]});
  def('b2_pillar',{parts:[pillarR(0x7a98b8,0xe8f4ff,9)],cast:true,col:.95,s:[.9,1.2]});
  // ---- Burningeye III: Stormcrown ----
  def('b3_spire',{parts:[spire(0x5a6070,0xf4f8ff,5)],cast:true,col:1,s:[.9,1.7]});
  def('b3_flag',{parts:[banner(0x2a2420,0x4a5a7a)],cast:true,col:.3,s:[1,1.3],sway:.04});
  def('b3_statue',{parts:[statueG(0x8a90a0,{sword:1})],cast:true,col:.7,s:[1.1,1.4]});
  def('b3_drift',{parts:[F(dome(1,8),0xf4f8ff,{j:.15,jy:.4,lo:.9,hi:.15},0,0,0,0,0,0,[1.8,.6,1.1])],s:[1.2,2.8],y:-.05});
  // ---- Searing Sands II: the Sunken Temple ----
  def('s2_gate',{parts:[archG(0xb87a50,0xd8a070)],cast:true,s:[2.7,2.7]});
  def('s2_obelisk',{parts:[obelisk(0xa8704a),glowM(glyphs())],cast:true,col:.6,s:[1,1.4],gt:[0xffa040,0xffc860]});
  def('s2_statue',{parts:[statueG(0xb07850,{snake:1})],cast:true,col:.8,s:[1.4,1.9]});
  def('s2_brazier',{parts:[brazier(),glowM(flame(.6))],cast:true,col:.45,s:[1,1.2],gt:[0xff7a2a,0xffa040]});
  def('s2_rubble',{parts:[rubble(0xb88058)],near:true,s:[.9,1.6]});
  def('s2_wall',{parts:[wallG(0xa86a44,0xc89060,3.6,2.4)],cast:true,cp:[[-1.3,0,.6],[0,0,.6],[1.3,0,.6]],s:[1,1.3]});
  def('s2_pillar',{parts:[pillarG(0xb88058,3.4,0xd8a070)],cast:true,col:.5,s:[1,1.4]});
  // ---- Searing Sands III: the Salt Wastes ----
  def('s3_salt',{parts:[crystals(0xffffff)],cast:true,col:.6,s:[.9,1.6],tint:[0xf4f0e8,0xe8e4dc]});
  def('s3_palm',{parts:[palm()],cast:true,col:.35,s:[1,1.4],sway:.02});
  def('s3_crust',{parts:[F(disc(1,6),0xf8f4ec,{lo:1,hi:0,j:.2,jy:0},0,0,0,-Math.PI/2)],near:true,y:.05,s:[.7,1.5]});
  def('s3_dune',{parts:[duneG(0xece4d0)],s:[3,6],y:-.3,j:.05});
  def('s3_reeds',{parts:[reeds(0x5a8a3a,0x6a5a2a)],near:true,s:[.9,1.4],sway:.15});
  def('s3_rib',{parts:[bonesRib(0xf4ecdc)],cast:true,cp:[[-.6,0,.6],[.6,0,.6]],s:[1.2,1.8]});
  // ---- The Dirge II: the Drowned Crypts ----
  def('d2_ceil',{parts:[ceilG(0x3a3e44,0x5a6a6a)],s:[.8,1.3]});
  def('d2_arch',{parts:[rockArch(0x464a52,0x4a6a5a,5.4,6.4)],cast:true,s:[1,1]});
  def('d2_col',{parts:[pillarG(0x5a5e66,3.8,0x4a6a5a)],cast:true,col:.5,s:[1,1.3]});
  def('d2_sarco',{parts:[sarco(0x5a5a62)],cast:true,col:.9,s:[.95,1.15]});
  def('d2_lamp',{parts:[lanternPost(),glowM(lanternGlow())],cast:true,s:[.95,1.1],gt:[0x5affd0]});
  // ---- The Dirge III: the Ossuary Fields ----
  def('d3_rib',{parts:[bonesRib(0xd8d0b8)],cast:true,cp:[[-1,0,.8],[1,0,.8]],s:[1.8,2.6]});
  def('d3_pile',{parts:[bonePile()],cast:true,col:.7,s:[.9,1.4]});
  def('d3_spikes',{parts:[boneSpikes()],cast:true,col:.45,s:[.9,1.5]});
  def('d3_giant',{parts:[skull(0xd8d0b8)],cast:true,col:1.4,s:[3.6,4.6],y:-.2});
  def('d3_mist',{parts:[{g:plain(pln(1,1).rotateX(-Math.PI/2)),mat:'mist'}],y:.4,s:[5,9],j:0,tint:[0x9aa08a]});
  // ---- The Citadel II: the Outer Ramparts ----
  def('c2_barricade',{parts:[barricade()],cast:true,cp:[[-1,0,.6],[0,0,.6],[1,0,.6]],s:[.95,1.15]});
  def('c2_stake',{parts:[stake()],cast:true,col:.3,s:[.9,1.2]});
  def('c2_tent',{parts:[tent(0x5a1a1a)],cast:true,col:1.3,s:[.95,1.2]});
  def('c2_tent2',{parts:[tent(0x2a2026)],cast:true,col:1.3,s:[.95,1.2]});
  def('c2_catapult',{parts:[catapult()],cast:true,cp:[[-1,0,.9],[1,0,.9]],s:[1,1.2]});
  def('c2_cart',{parts:[cartG()],cast:true,col:1.1,s:[.95,1.1]});
  // ---- The Citadel III: the Inner Keep ----
  def('c3_hedge',{parts:[hedge()],cast:true,cp:[[-1,0,.6],[0,0,.6],[1,0,.6]],s:[.9,1.2]});
  def('c3_topiary',{parts:[topiary()],cast:true,col:.5,s:[.9,1.2]});
  def('c3_rose',{parts:[M([shrub(0x2a3a22,1),flowers([0xa01020,0xd02030,0x600818])])],near:true,s:[1,1.6],sway:.05});
  def('c3_fountain',{parts:[fountain(),glowM(fountainGlow())],cast:true,col:1.9,s:[1,1.2],gt:[0x8a0818,0xa01020]});
  const Z={},ZM={},seed={};
  const set=(k,L,dm)=>{const t=TH.list.find(q=>q.z==k[0]&&q.k==k[1]);Z[t.g]=L;ZM[t.g]=dm;seed[t.g]=t.seed+17};
  set([0,1],[{k:'k2_gshroom',w:'edge',n:8,c:[1,3],r:3},{k:'k2_gshroom',w:'in',n:3.5,c:[1,3],r:4},{k:'k2_gshroomB',w:'bank',n:7,c:[1,3],r:5},{k:'k2_shelf',w:'bank',n:10,c:[2,4],r:4},{k:'k_glow',w:'edge',n:20,c:[2,5],r:3},{k:'k_glow',w:'in',n:12,c:[2,5],r:3},
    {k:'k2_goo',w:'edge',n:4,c:[1,3],r:3},{k:'k2_goo',w:'in',n:2,c:[1,2],r:3},{k:'k2_stalag',w:'edge',n:3.5,c:[1,3],r:3},{k:'k2_stalag',w:'bank',n:3,c:[1,3],r:4},{k:'k2_pillar',w:'in',n:.5,c:[1,1],r:1},{k:'k2_rock',w:'in',n:.6,c:[1,2],r:3},
    {k:'k2_web',w:'edge',n:1.6,c:[1,2],r:3},{k:'k_roots',w:'edge',n:1,c:[1,2],r:3},{k:'k_reeds',w:'shore',n:40,c:[1,3],r:2},{k:'k_lily',w:'water',n:50,c:[1,2],r:1.5},{k:'k_fern',w:'edge',n:3,c:[2,4],r:3}],1.15);
  set([0,2],[{k:'k3_tree',w:'in',n:6,c:[2,5],r:5},{k:'k3_tree',w:'bank',n:9,c:[3,6],r:6},{k:'k3_snag',w:'in',n:1.6,c:[1,2],r:4},{k:'k3_snag',w:'edge',n:1.6,c:[1,2],r:3},{k:'k3_fallen',w:'in',n:1.3,c:[1,1],r:1},{k:'k_roots',w:'in',n:2,c:[1,2],r:4},
    {k:'k3_fungus',w:'in',n:3,c:[1,3],r:4},{k:'k3_toad',w:'in',n:5,c:[2,4],r:3},{k:'k3_toad',w:'edge',n:5,c:[2,4],r:3},{k:'k3_fern',w:'edge',n:10,c:[3,6],r:3},{k:'k3_carcass',w:'in',n:.35,c:[1,1],r:1},{k:'k3_skull',w:'in',n:1.2,c:[1,2],r:3},
    {k:'k_web',w:'edge',n:3.5,c:[1,3],r:3},{k:'k3_glow',w:'edge',n:2,c:[1,3],r:3},{k:'k3_mist',w:'in',n:1.6,c:[1,3],r:6},{k:'k_stone',w:'in',n:1.4,c:[1,3],r:3},{k:'k_reeds',w:'shore',n:30,c:[1,3],r:2}],1);
  set([1,1],[{k:'h2_ruin',w:'in',n:.8,c:[1,3],r:5},{k:'h2_ruin',w:'edge',n:1,c:[1,2],r:4},{k:'h2_col',w:'in',n:.9,c:[1,3],r:4},{k:'h2_col',w:'shore',n:6,c:[1,2],r:2},{k:'h2_arch',w:'in',n:.25,c:[1,1],r:1},{k:'h2_statue',w:'in',n:.3,c:[1,1],r:1},
    {k:'h2_reeds',w:'shore',n:80,c:[2,4],r:2},{k:'h2_reeds',w:'edge',n:6,c:[2,4],r:3},{k:'h2_lily',w:'water',n:60,c:[1,2],r:1.5},{k:'h2_boat',w:'water',n:1.2,c:[1,1],r:1},{k:'h2_mist',w:'in',n:1.4,c:[1,2],r:7},
    {k:'h2_flowers',w:'in',n:4,c:[2,5],r:4},{k:'h_grass',w:'in',n:5,c:[3,6],r:3},{k:'h_grass',w:'edge',n:8,c:[3,6],r:3},{k:'h_boulder',w:'bank',n:2.5,c:[1,3],r:5},{k:'h2_rubble',w:'in',n:2,c:[1,2],r:3},{k:'h_stone',w:'circle',n:.2,c:[5,7],r:4.6}],1);
  set([1,2],[{k:'h3_spire',w:'in',n:.7,c:[1,2],r:4},{k:'h3_spire',w:'bank',n:3,c:[1,3],r:5},{k:'h3_boulder',w:'in',n:1.4,c:[1,3],r:4},{k:'h3_boulder',w:'bank',n:3,c:[1,3],r:5},{k:'h3_pine',w:'edge',n:1.5,c:[1,3],r:4},{k:'h3_pine',w:'bank',n:3.5,c:[2,4],r:6},
    {k:'h3_grass',w:'in',n:12,c:[3,7],r:3},{k:'h3_grass',w:'edge',n:14,c:[3,7],r:3},{k:'h_cairn',w:'in',n:1,c:[1,1],r:1},{k:'h_cairn',w:'bank',n:2,c:[1,1],r:1},{k:'h3_banner',w:'lane',n:3,c:[1,1],r:1},{k:'h_totem',w:'lane',n:1.5,c:[1,1],r:1},
    {k:'h3_skull',w:'in',n:.8,c:[1,2],r:3},{k:'h_bush',w:'edge',n:3,c:[1,3],r:3}],1.05);
  set([2,1],[{k:'b_crystal',w:'edge',n:5,c:[1,3],r:3},{k:'b_crystal',w:'in',n:2.5,c:[1,3],r:4},{k:'b2_bigcrys',w:'bank',n:4,c:[1,2],r:5},{k:'b2_bigcrys',w:'in',n:.5,c:[1,1],r:1},{k:'b2_stalag',w:'edge',n:4,c:[1,3],r:3},{k:'b2_stalag',w:'bank',n:3,c:[1,3],r:4},
    {k:'b_ice',w:'edge',n:3,c:[2,4],r:3},{k:'b_ice',w:'in',n:1,c:[1,3],r:3},{k:'b2_frozen',w:'in',n:.5,c:[1,2],r:3},{k:'b2_pillar',w:'in',n:.5,c:[1,1],r:1},{k:'b_bones',w:'in',n:1.2,c:[1,2],r:3},{k:'b_drift',w:'edge',n:2,c:[1,2],r:3}],1.15);
  set([2,2],[{k:'b3_drift',w:'edge',n:8,c:[1,3],r:3},{k:'b3_drift',w:'in',n:2.5,c:[1,3],r:4},{k:'b_rock',w:'in',n:1.2,c:[1,2],r:4},{k:'b_rock',w:'bank',n:4,c:[1,3],r:5},{k:'b3_spire',w:'in',n:.5,c:[1,2],r:4},{k:'b3_spire',w:'bank',n:3,c:[1,3],r:5},
    {k:'b_tree',w:'in',n:1,c:[1,3],r:5},{k:'b_pine',w:'bank',n:3,c:[2,5],r:6},{k:'b3_flag',w:'lane',n:3,c:[1,1],r:1},{k:'b_cairn',w:'lane',n:2,c:[1,1],r:1},{k:'b3_statue',w:'in',n:.3,c:[1,1],r:1},{k:'b_bones',w:'in',n:1.6,c:[1,2],r:3},{k:'b_ice',w:'edge',n:4,c:[2,4],r:3}],1.25);
  set([3,1],[{k:'s2_pillar',w:'in',n:1.2,c:[2,4],r:4},{k:'s2_pillar',w:'edge',n:2,c:[1,2],r:3},{k:'s2_obelisk',w:'in',n:.4,c:[1,1],r:1},{k:'s2_obelisk',w:'edge',n:.6,c:[1,1],r:1},{k:'s2_statue',w:'edge',n:.5,c:[1,1],r:1},{k:'s2_wall',w:'in',n:.6,c:[1,2],r:4},
    {k:'s2_brazier',w:'lane',n:3,c:[1,1],r:1},{k:'s2_rubble',w:'in',n:3,c:[1,3],r:3},{k:'s2_rubble',w:'edge',n:5,c:[1,3],r:3},{k:'s_skull',w:'in',n:1.5,c:[1,2],r:3},{k:'s_ripple',w:'in',n:2,c:[1,3],r:4},{k:'s_shrub',w:'edge',n:3,c:[1,3],r:3},{k:'s_rib',w:'in',n:.3,c:[1,1],r:1}],1.3);
  set([3,2],[{k:'s3_salt',w:'in',n:2.5,c:[2,5],r:4},{k:'s3_salt',w:'edge',n:3,c:[1,3],r:3},{k:'s3_crust',w:'in',n:8,c:[2,5],r:4},{k:'s3_dune',w:'bank',n:4,c:[1,3],r:7},{k:'s3_palm',w:'shore',n:14,c:[1,2],r:2},{k:'s3_palm',w:'in',n:.4,c:[1,2],r:3},
    {k:'s3_reeds',w:'shore',n:50,c:[2,4],r:2},{k:'s3_rib',w:'in',n:.4,c:[1,1],r:1},{k:'s_skull',w:'in',n:1.4,c:[1,2],r:3},{k:'s_arch',w:'in',n:.15,c:[1,1],r:1},{k:'s_pillar',w:'in',n:.4,c:[1,3],r:4},{k:'s_wall',w:'in',n:.3,c:[1,2],r:5},{k:'s_shrub',w:'in',n:2,c:[1,3],r:4}],1.3);
  set([4,1],[{k:'d2_col',w:'edge',n:2.2,c:[1,2],r:3},{k:'d2_col',w:'in',n:1,c:[2,4],r:4},{k:'d_coffin',w:'in',n:1.2,c:[1,3],r:3},{k:'d_coffin',w:'edge',n:1.5,c:[1,2],r:3},{k:'d2_sarco',w:'in',n:.6,c:[1,2],r:3},{k:'d_crypt',w:'in',n:.15,c:[1,1],r:1},
    {k:'d_candles',w:'edge',n:5,c:[1,3],r:3},{k:'d_candles',w:'in',n:3,c:[1,3],r:3},{k:'d_skulls',w:'edge',n:3,c:[1,2],r:3},{k:'d_fence',w:'fence',n:.6,c:[2,4],r:1},{k:'d_angel',w:'in',n:.3,c:[1,1],r:1},{k:'d_reeds',w:'shore',n:40,c:[1,3],r:2},
    {k:'d2_lamp',w:'lane',n:3,c:[1,1],r:1},{k:'d_mist',w:'water',n:4,c:[1,2],r:4}],1.2);
  set([4,2],[{k:'d3_rib',w:'in',n:.5,c:[1,1],r:1},{k:'d3_pile',w:'in',n:2.2,c:[1,3],r:4},{k:'d3_pile',w:'edge',n:2,c:[1,2],r:3},{k:'d3_spikes',w:'in',n:1.6,c:[1,3],r:4},{k:'d3_spikes',w:'bank',n:3,c:[2,4],r:5},{k:'d3_giant',w:'in',n:.12,c:[1,1],r:1},
    {k:'d_skulls',w:'in',n:2.5,c:[1,3],r:3},{k:'s_skull',w:'in',n:2,c:[1,3],r:4},{k:'d_cross',w:'in',n:.8,c:[1,3],r:4},{k:'d_tree',w:'in',n:.8,c:[1,2],r:5},{k:'d_tree',w:'bank',n:4,c:[2,4],r:6},{k:'d3_mist',w:'in',n:1.4,c:[1,3],r:6},{k:'d_graves',w:'bank',n:1.5,c:[1,3],r:5}],1.1);
  set([5,1],[{k:'c_wall',w:'edge',n:2,c:[1,3],r:4},{k:'c_wall',w:'in',n:.4,c:[1,2],r:5},{k:'c2_barricade',w:'in',n:.8,c:[1,3],r:4},{k:'c2_barricade',w:'edge',n:1,c:[1,2],r:3},{k:'c2_stake',w:'edge',n:3,c:[2,4],r:3},{k:'c2_stake',w:'lane',n:1.5,c:[1,1],r:1},
    {k:'c2_tent',w:'in',n:.5,c:[1,2],r:5},{k:'c2_tent2',w:'in',n:.4,c:[1,2],r:5},{k:'c2_catapult',w:'in',n:.2,c:[1,1],r:1},{k:'c2_cart',w:'in',n:.25,c:[1,1],r:1},{k:'c_banner',w:'lane',n:4,c:[1,1],r:1},{k:'c_brazier',w:'lane',n:4,c:[1,1],r:1},
    {k:'c_brazier',w:'in',n:.6,c:[1,1],r:1},{k:'c_rubble',w:'in',n:4,c:[1,3],r:4},{k:'c_blood',w:'in',n:1.6,c:[1,2],r:3}],1.6);
  set([5,2],[{k:'c3_hedge',w:'fence',n:1.4,c:[3,5],r:1},{k:'c3_topiary',w:'in',n:1,c:[1,3],r:4},{k:'c3_topiary',w:'edge',n:1.5,c:[1,2],r:3},{k:'c3_rose',w:'in',n:4,c:[2,5],r:4},{k:'c3_rose',w:'edge',n:4,c:[2,4],r:3},{k:'c3_fountain',w:'in',n:.2,c:[1,1],r:1},
    {k:'c_column',w:'lane',n:5,c:[1,1],r:1},{k:'c_statue',w:'edge',n:.8,c:[1,1],r:1},{k:'c_gargoyle',w:'edge',n:.8,c:[1,1],r:1},{k:'c_candela',w:'in',n:1,c:[1,2],r:3},{k:'c_candela',w:'lane',n:2,c:[1,1],r:1},{k:'c_coffin',w:'in',n:.2,c:[1,1],r:1},{k:'c_wall',w:'edge',n:1,c:[1,2],r:4}],1.6);
  return {Z,ZM,seed,post:(out,col)=>v112Post(out,col,T)}}
// ---------- 5. arches over the road and overhangs from the walls (after wdDeco's placement) ----------
function v112Post(out,col,T){const TH=th112(),DW=MAP.DW,t0=performance.now();TH.nArch=0;TH.nCeil=0;
  const dw=(x,z)=>{const X=Math.round(x),Z=Math.round(z);return X<0||Z<0||X>=W||Z>=H?99:DW[Z*W+X]};
  TH.list.forEach(t=>{const I=INSL[t.g],P=I.path,rnd=mkR112(t.seed+31),e1=P[16]||I.en,camps=I.cl;
    const clear=(x,z,m)=>Math.hypot(x-I.ba[0],z-I.ba[1])>PM_GTR+6+m&&Math.hypot(x-I.en[0],z-I.en[1])>14+m&&Math.hypot(x-e1[0],z-e1[1])>14+m&&camps.every(c=>Math.hypot(x-c[0],z-c[1])>20+m);
    if(t.arch){const S=T[t.arch.k];let last=-99;
      for(let i=24;i<P.length-30;i+=3){if(i-last<t.arch.n)continue;const q=P[i],a=P[i-3],b=P[i+3],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l;
        if(!clear(q[0],q[1],0))continue;
        const wall=s=>{for(let r=0;r<14;r+=.5)if(dw(q[0]+nx*s*r,q[1]+nz*s*r)>-.4)return r;return 99},wr=wall(1),wl=wall(-1);
        const hs=t.arch.hs,off=(wr-wl)/2,hw2=(wr+wl)/2;
        if(wr>13||wl>13||hw2<hs-1.6||hw2>hs+2.6)continue;
        const cx=q[0]+nx*off,cz=q[1]+nz*off;if(Math.abs(off)>hs-3.2)continue;
        // both feet stand on walkable ground or at the wall; their tiles become solid
        const feet=[[cx+nx*hs,cz+nz*hs],[cx-nx*hs,cz-nz*hs]];if(feet.some(([x,z])=>dw(x,z)>2.4))continue;
        const tl=[];feet.forEach(([x,z])=>{for(let j=Math.floor(z-2);j<=Math.ceil(z+2);j++)for(let k=Math.floor(x-2);k<=Math.ceil(x+2);k++)if(Math.hypot(k-x,j-z)<=1.15)tl.push(j*W+k)});
        if(P.some((p,k)=>k%2==0&&tl.some(v=>Math.hypot(v%W-p[0],Math.floor(v/W)-p[1])<2.2)))continue;
        tl.forEach(v=>col.add(v));out.push({k:t.arch.k,x:cx,z:cz,ry:Math.atan2(-nz,nx),s:1,col:hs+1,tl});last=i;TH.nArch++}}
    if(t.ceil){const S=T[t.ceil.k],I0=I,used=[];let n=0;
      const want=Math.round(t.ceil.n*I.w*I.h/1e4);
      for(let tr=0;tr<want*40&&n<want;tr++){const x=I0.x0+4+Math.floor(rnd()*(I0.w-8)),z=I0.y0+4+Math.floor(rnd()*(I0.h-8)),d=DW[z*W+x];if(!(d>1.2&&d<3))continue;
        const gx=dw(x+1,z)-dw(x-1,z),gz=dw(x,z+1)-dw(x,z-1),gl=Math.hypot(gx,gz);if(gl<.5)continue;const ix=-gx/gl,iz=-gz/gl;
        if(!clear(x,z,-6)||used.some(u=>Math.hypot(u[0]-x,u[1]-z)<8))continue;used.push([x,z]);
        out.push({k:t.ceil.k,x:x+(rnd()-.5)*.6,z:z+(rnd()-.5)*.6,ry:Math.atan2(-iz,ix)+(rnd()-.5)*.4,s:S.s[0]+rnd()*(S.s[1]-S.s[0]),col:0});n++;TH.nCeil++}}});
  TH.postMs=Math.round(performance.now()-t0)}
// ---------- 6. ribbons along the road: glowing goo, meltwater, spectral channels, the keep's carpet ----------
var ST112=[];
function v112Ribbons(){const TH=th112();
  const mat=(s)=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,
    uniforms:{time:{value:0},col:{value:new THREE.Color(s.c)},fogC:{value:new THREE.Color()},fogD:{value:.02},sp:{value:s.sp},uFl:{value:s.flat?1:0},lit:{value:1}},
    vertexShader:'varying vec2 vU;varying float vD;void main(){vU=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}',
    fragmentShader:`varying vec2 vU;varying float vD;uniform float time,sp,fogD,uFl,lit;uniform vec3 col,fogC;
    float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}
    void main(){float e=1.-abs(vU.x*2.-1.);vec3 c;float a;
      if(uFl>.5){float b=step(.16,e)*(1.-step(.24,e));c=col*lit*(.85+.15*vn(vU*vec2(4.,1.)));c=mix(c,vec3(.55,.42,.16)*lit,b);a=smoothstep(0.,.06,e);}
      else{float n=vn(vec2(vU.x*3.,vU.y*.55-time*sp))*.6+vn(vec2(vU.x*7.+3.,vU.y*1.6-time*sp*1.7))*.4;
        c=col*(.45+.9*n)+col*pow(e,4.)*.7;c+=vec3(1.)*smoothstep(.72,.95,n)*pow(e,2.)*.35;a=smoothstep(0.,.45,e)*(.75+.25*n);}
      float fg=1.-exp(-fogD*fogD*vD*vD);c=mix(c,fogC,clamp(fg,0.,1.));gl_FragColor=vec4(c,a);}`});
  TH.list.forEach(t=>{if(!t.st)return;const I=INSL[t.g],DW=MAP.DW,pos=[],uv=[],idx=[];let nv=0;
    const dw=(x,z)=>DW[Math.round(z)*W+Math.round(x)];
    const strip=(L,s)=>{let cur=[];const flush=()=>{if(cur.length>3){let v=0;cur.forEach((q,k)=>{if(k)v+=Math.hypot(q[0]-cur[k-1][0],q[1]-cur[k-1][1]);const [x,z,nx,nz]=q,w=s.w/2;
        [[x-nx*w,z-nz*w,0],[x+nx*w,z+nz*w,1]].forEach(([px,pz,u])=>{pos.push(px,GH(px,pz)+.07,pz);uv.push(u,v)});if(k)idx.push(nv-2,nv,nv-1,nv-1,nv,nv+1);nv+=2})}cur=[]};
      for(let i=0;i<L.length;i++){const a=L[Math.max(0,i-4)],b=L[Math.min(L.length-1,i+4)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,o=s.A*Math.sin(i*s.f+s.ph+t.g)+(s.A?.6*Math.sin(i*s.f*2.7):0),
        x=L[i][0]+nx*o,z=L[i][1]+nz*o;
        if(dw(x,z)>-.9-s.w/2||MAP[Math.round(z)][Math.round(x)]=='~'){flush();continue}cur.push([x,z,nx,nz])}flush()};
    const dense=l=>{const o=[];for(let k=0;k<l.length-1;k++){const [ax,ay]=l[k],[bx,by]=l[k+1],n=Math.ceil(Math.hypot(bx-ax,by-ay));for(let q=0;q<n;q++)o.push([ax+(bx-ax)*q/n,ay+(by-ay)*q/n])}o.push(l[l.length-1]);return o};
    t.st.forEach(s=>{if(s.br)I.br.forEach(l=>strip(dense(l),Object.assign({},s,{A:s.A*.25})));else strip(I.path.filter((q,i)=>i>8&&i<I.path.length-6),s)});
    if(!nv)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();
    const m=new THREE.Mesh(g,mat(t.st[0]));m.frustumCulled=false;m.visible=false;m.renderOrder=2;m.userData.psNo=1;m.userData.lpsSkip=1;m.castShadow=false;m.receiveShadow=false;scene.add(m);
    ST112.push({g:t.g,m,flat:!!t.st[0].flat,tris:idx.length/3})})}
try{v112Ribbons()}catch(err){console.warn('v112 ribbons',err)}
// ---------- 7. atmosphere per instance: on top of the zone's (0550 ZATM), blended in when you arrive ----------
var IA112={g:-9,t:null,k:0,col:new THREE.Color(),c2:new THREE.Color(),ptype:null};
function ia112(dt,now){const I=curIns(),g=I?I.g:-1,t=TH112&&TH112.byG[g]||null;
  if(g!==IA112.g){IA112.g=g;IA112.t=t;IA112.k=0;
    ST112.forEach(s=>s.m.visible=s.g===g);
    // an instance without its own lighting goes back to the zone's (0550 only resets it when the zone changes)
    if(!t||!t.a.env){const en=typeof ZENV!='undefined'&&ZENV[(ZATM[ZA.cur]||ZATM.town).env||'norm'];if(en)scene.environment=en}
    if(t){zpReset(t.a.pt=='spore'||t.a.pt=='mote'?'pollen':t.a.pt=='sparkle'||t.a.pt=='leaf'||t.a.pt=='ash'||t.a.pt=='petal'?'snow':t.a.pt=='blizzard'||t.a.pt=='gust'?'sand':t.a.pt);ZP.type=t.a.pt;ZP.mat.color.setHex(t.a.pc);
      ZP.mat.size={spore:.2,mote:.12,sparkle:.13,leaf:.16,ash:.1,petal:.15,blizzard:.13,gust:.06}[t.a.pt]||ZP.mat.size;IA112.ptype=t.a.pt}
    else if(IA112.ptype){IA112.ptype=null;const Z=ZATM[ZA.cur]||ZATM.town;zpReset(Z.pt)}}
  if(!t)return;const a=t.a;IA112.k=Math.min(1,IA112.k+Math.max(0,Math.min(.1,dt==null?.016:dt))*1.6);const k=IA112.k;
  scene.fog.density+=(a.fog-scene.fog.density)*k;IA112.col.setHex(a.fc);scene.fog.color.lerp(IA112.col,a.fcA*k);scene.background=scene.fog.color;
  sun.intensity*=1+(a.sun-1)*k;hemi.intensity*=1+(a.hemi-1)*k;
  if(a.env&&k>.5){const en=ZENV[a.env];if(en&&scene.environment!==en)scene.environment=en}
  if(typeof POST!='undefined'&&POST.u&&typeof PSXON!='undefined'&&PSXON){const U=POST.u;U.ex.value+=(a.ex-U.ex.value)*k;U.sat.value+=(a.sat-U.sat.value)*k;U.vig.value+=(a.vig-U.vig.value)*k}
  const su=SKY.material.uniforms;if(a.sky<1){const q=1+(a.sky-1)*k;su.top.value.multiplyScalar(q);su.hor.value.lerp(scene.fog.color,1-q);if(a.sky<=0&&k>.5)SKY.visible=false}
  if(a.lan)LANT.visible=true;
  // water: dark caves make their pools glow; reflections take the fog colour where the sky is hidden
  [WTR.w,WTR.l].forEach(w=>{const u=w.material.uniforms;u.fogC.value.copy(scene.fog.color);u.fogD.value=scene.fog.density;if(a.wamb)u.amb.value+=(a.wamb-u.amb.value)*k;if(a.sky<1){u.hor.value.copy(su.hor.value);u.top.value.copy(su.top.value)}if(a.wref){IA112.c2.setHex(a.wref);u.hor.value.lerp(IA112.c2,k);u.top.value.lerp(IA112.c2,k)}});
  ST112.forEach(s=>{if(!s.m.visible)return;const u=s.m.material.uniforms;u.time.value=now/1000;u.fogC.value.copy(scene.fog.color);u.fogD.value=scene.fog.density;u.lit.value=.5+.5*Math.min(1,hemi.intensity)});
  // the theme's particles (0550 moves the built-in kinds; these are moved here)
  ZP.mat.opacity+=((a.po||.8)-ZP.mat.opacity)*k;ia112Particles(Math.min(.05,dt||.016),now,a.pt)}
function ia112Particles(dt,now,t){const {N,pos}=ZP,P=pl.position;if(['spore','mote','sparkle','leaf','ash','petal','blizzard','gust'].indexOf(t)<0)return;ZP.geo.attributes.position.needsUpdate=true;
  for(let i=0;i<N;i++){const j=i*3;let x=pos[j],y=pos[j+1],z=pos[j+2];
    if(t=='spore'){y+=(.18+(i%5)*.06)*dt;x+=Math.sin(now/1900+i)*.3*dt;z+=Math.cos(now/2100+i*1.3)*.3*dt;if(y>P.y+6)y-=6.5}
    else if(t=='mote'){x+=(.25+Math.sin(i))*.3*dt;z+=Math.cos(now/2600+i)*.2*dt;y+=Math.sin(now/900+i*1.7)*.12*dt}
    else if(t=='sparkle'){y-=(.25+(i%4)*.08)*dt;x+=Math.sin(now/1500+i)*.15*dt;if(y<P.y-.5)y+=7}
    else if(t=='leaf'||t=='petal'){y-=(.55+(i%5)*.12)*dt;x+=(Math.sin(now/700+i*2.1)*1.1+.35)*dt;z+=Math.cos(now/900+i)*.6*dt;if(y<P.y-.5)y+=9}
    else if(t=='ash'){y-=(.3+(i%5)*.08)*dt;x+=(Math.sin(now/1300+i)*.4+.2)*dt;z+=Math.cos(now/1500+i)*.25*dt;if(y<P.y-.5)y+=9}
    else if(t=='blizzard'){x+=(11+(i%7)*1.4)*dt;y-=(2.2+(i%5)*.4)*dt;z+=(2.5+Math.sin(now/400+i)*2)*dt;if(y<P.y-1)y+=10}
    else if(t=='gust'){x+=(14+(i%7)*2)*dt;z+=(3+Math.sin(now/500+i))*dt;y=P.y+.4+(i%11)*.35+Math.sin(now/350+i)*.2}
    if(x<P.x-30)x+=60;else if(x>P.x+30)x-=60;if(z<P.z-30)z+=60;else if(z>P.z+30)z-=60;
    pos[j]=x;pos[j+1]=y;pos[j+2]=z}
  if(t=='spore'||t=='sparkle')ZP.mat.size=(t=='spore'?.2:.13)*(.8+.35*Math.sin(now/300))}
{const f=atmos;atmos=function(dt,now){f.apply(this,arguments);try{ia112(dt,now)}catch(err){if(!IA112.err){IA112.err=1;console.warn('v112 atmos',err)}}}}
// ---------- 8. the arrival banner names the place ----------
{const f=insArrive;insArrive=function(I){const r=f.apply(this,arguments);try{const t=I&&TH112&&TH112.byG[I.g];if(t){const p=PMAP[I.z];
  banner(p.ic+' '+I.n.toUpperCase(),t.nm+' · '+t.sub,rpTxt139(I.lv[0])+' · '+(I.k==PMF-1?'the way to '+BOSSES[I.z].name+'’s den waits at the end of the road':'a gateway to '+p.ins[I.k+1].n+' waits at the end of the road'))}}catch(_){}return r}}
{const f=areaName;areaName=function(){const s=f.apply(this,arguments);try{const I=curIns(),t=I&&TH112&&TH112.byG[I.g];if(t&&s.indexOf(I.n)>=0&&s.indexOf('⛺')<0)return s.replace(I.n,I.n+' · '+t.nm)}catch(_){}return s}}
// ---------- 9. saves: the tiles of II and III changed (layout 112) ----------
// A v108 save: the reached instances stay; a position in instance I, a Den or a Trial stays (their tiles did not change);
// a position in II or III goes to that instance's entrance. Older layouts are handled as before (1680: zone entrance).
WD_WL=112;
{const f=loadGame;loadGame=function(){const s=saveInfo&&saveInfo();const r=f.apply(this,arguments);try{
  if(s&&s.x2&&s.x2.wl===108){if(Array.isArray(s.x2.insr))INSR=PMAP.map((p,i)=>Math.max(bossDone.has(i)?PMI-1:0,Math.min(PMI-1,s.x2.insr[i]|0)));
    if(s.pos&&!s.pos.realm){const x=Math.round(s.pos.x),z=Math.round(s.pos.z),I=insAt(x,z);
      if(I){if(I.fld&&I.k>0){const n=I.path[30];toPos(I.en[0],I.en[1],Math.atan2(I.en[0]-n[0],I.en[1]-n[1]))}else if(!solid(x,z))toPos(s.pos.x,s.pos.z);else toPos(I.en[0],I.en[1])}
      else if(s.pos.x<PM_X0)toPos(s.pos.x,s.pos.z)}
    const I=curIns();if(I&&I.k<PMI&&I.k>INSR[I.z])INSR[I.z]=I.k;V112.moved=1}}catch(err){console.warn('v112 load',err)}return r}}
var V112={moved:0,stats:()=>{const TH=th112();return {themes:TH.list.map(t=>[t.g,t.nm,t.bi]),mapMs:TH.mapMs,postMs:TH.postMs,arches:TH.nArch,ceil:TH.nCeil,ribbons:ST112.map(s=>[s.g,s.tris])}}};
