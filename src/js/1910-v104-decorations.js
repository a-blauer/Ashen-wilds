// ================= v104 kingdom: decorations =================
// A second tab in the Stronghold Steward's window ("Decorations"): buy decorations for gold, then switch each on or off.
// Every decoration has fixed spots kept clear of the building lots, their door spots and the streets (v103_kingdom.py
// checks this with every decoration on). Each is one baked kit (a few meshes) plus, for the living ones, a handful of
// plain meshes moved by one TANIM entry. Colliders only on the chunky ones (statue, well, carts, trees, ...).
// SH.deco[key] = 1 (owned, shown) or 0 (owned, hidden); saved as x2.kdeco.
// spots are town-local tiles (x east, z south from the fountain)
// v109: the kingdom grows (1960, kf109: WX, SZ, stage s). Decorations that follow the walls or the rows compute their spots from
// that frame (spf(F)); they are rebuilt when the stage changes. Everything else stands in the plaza, which is there from the start.
function dcF104(){return typeof kf109=='function'?kf109():{s:-1,WX:36,SZ:51}}
var DECO103_WALLZ=[-16,-8,0,10,16,28,34,46];
function dcPost103(k,x,z,h,c){k.as('bark',()=>k.L('c',c||TWC.woodD,[x,0,z],[x,h,z],.06,'log'))}
var DECO103=[
 {k:'banner',i:'🎏',n:'Kingdom Banners',g:300,d:'Crimson banners hang along the inner walls.',
  wall:1,b(k,D,W){const ban=TOWNS[0].pal.ban||0x8a2a3a;
    const F=W.F;[-1,1].forEach(s=>DECO103_WALLZ.forEach((z,i)=>{if(z>F.SZ-2)return;const t=W.top(s*F.WX,z);if(t==null||t<1.9)return;const y=Math.min(2.7,t-.2),h=Math.min(1.25,y-.5),f=W.faceX(s,z,y-.5);if(f==null)return;const x=f-s*.04;
      k.L('m',TWC.iron,[x,y+.05,z],[x+s*.05,y+.05,z],.025,'box',0);kdBanner(k,x,y,z,-s*Math.PI/2,i%2?ban:0x2a2a3a,.62,h)}));
    [-30,-22,-15,-8,8,15,22,30].forEach((x,i)=>{if(Math.abs(x)>F.WX-3)return;const t=W.top(x,F.SZ);if(t==null||t<1.9)return;const y=Math.min(2.7,t-.2),h=Math.min(1.25,y-.5),f=W.faceZ(x,y-.5);if(f==null)return;kdBanner(k,x,y,f-.04,Math.PI,i%2?ban:0x2a2a3a,.62,h)})}},
 {k:'garland',i:'🏮',n:'Street Lanterns',g:450,d:'Strings of paper lanterns across the Gate Avenue between the rows.',
  // v112: the rows line the Gate Avenue now (1860): one string across the avenue at every gap between two rows, posts at its edges
  spf:F=>[18.35,25.85,33.35,40.85].filter(z=>z<F.SZ-3).map(z=>[z]),
  b(k,D){D.sp.forEach(([z])=>{const a=-3.3,b=3.3;[a,b].forEach(x=>dcPost103(k,x,z,3.6));k.L('m',0x2a2420,[a,3.55,z],[0,3.15,z],.012,'cyl6',0);k.L('m',0x2a2420,[0,3.15,z],[b,3.55,z],.012,'cyl6',0);
    for(let i=-3;i<=3;i++){const x=i*.95,y=3.15+Math.abs(i)*.12-.25;k.p('g',[0xffb050,0xff7a5a,0xffe08a,0xc8a0ff,0xff9a40][(i+3)%5],'oct',x,y,z,.14,.2,.14)}})}},
 {k:'planter',i:'🌸',n:'Flower Planters',g:250,d:'Stone planters full of night-blooming flowers round the plaza.',
  sp:[[-17.6,-3.2],[17.4,-11.4],[-11.5,2.5],[11.5,2.5],[0,-5.8]],
  b(k,D){D.sp.forEach(([x,z],i)=>k.at(x,0,z,()=>{twStones(k,TWC.stone,-.55,0,.55,0,0,.42,.5,.3);k.as('dirt',()=>k.p('c',0x3a2a1a,'box',0,.44,0,1.0,.04,.4,0,0,0,0));
    for(let j=0;j<5;j++){k.p('c',[0x3e6a34,0x4a7a3a][j%2],'ico',-.4+j*.2,.55,(j%2-.5)*.12,.12,.12,.12,0,j,0,.06);k.p('c',[0xc83a5a,0xe8c84a,0xb070ff,0xe8e0d0,0xff7a5a][(j+i)%5],'sph',-.4+j*.2,.68,(j%2-.5)*.12,.07,.06,.07,0,j,0,.04)}},z>0?0:Math.PI/2))},
  col(D){return D.sp.map(([x,z])=>[x,z,.6,.3])}},
 {k:'statue',i:'🗿',n:"Hero's Statue",g:1500,d:'A stone likeness of you, south of the fountain.',
  b(k){k.at(0,0,5.6,()=>{twStones(k,TWC.stone,-.7,0,.7,0,0,1.0,1.3,.5);k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',0,1.06,0,1.5,.12,1.5,0,0,0,.02));
    k.as('stone',()=>{k.p('c',0x8a8a90,'cyl8',0,1.7,0,.26,1.1,.2,0,0,0,.04);k.p('c',0x8a8a90,'box',0,2.35,0,.7,.32,.32,0,0,0,.03);k.p('c',0x8a8a90,'ico',0,2.72,0,.2,.22,.2,0,0,0,.02);
      k.p('c',0x8a8a90,'box',.38,2.6,.05,.1,.8,.1,0,0,-.5,0);k.p('c',0x8a8a90,'box',.62,3.1,.05,.06,1.1,.06,0,0,-.15,0);k.p('c',0x7a7a80,'box',-.42,1.9,.1,.5,.65,.06,0,0,.1,.02)});
    k.p('m',TWC.gold,'box',0,1.06,.76,.6,.12,.02,0,0,0,0)})},col(){return [[0,5.6,.75]]}},
 {k:'brazier',i:'🔥',n:'Watch Braziers',g:400,d:'Iron braziers burn along the south wall.',
  spf:F=>[-12.5,-8.5,8.5,12.5].map(x=>[x,F.SZ-1.4]),b(k,D){D.sp.forEach(([x,z])=>kdBrazier(k,x,z,0,.95))},col(D){return D.sp.map(([x,z])=>[x,z,.35])}},
 {k:'trees',i:'🌳',n:'Corner Groves',g:600,d:'Old dark-leaved trees in the south corners of the town.',
  spf:F=>[[-18.3,F.SZ-1.3],[-16.6,F.SZ-1.15],[-18.4,F.SZ-4.0],[18.3,F.SZ-1.3],[16.6,F.SZ-1.15],[18.4,F.SZ-4.0]],
  b(k,D){D.sp.forEach(([x,z],i)=>{k.as('bark',()=>k.L('c',0x3a2a1c,[x,0,z],[x+.1,2.0+i%2*.4,z+.05],.18,'log'));[[0,2.4,0,1.1],[.5,2.0,.3,.8],[-.45,2.1,-.3,.85],[0,2.9,.1,.75]].forEach(([dx,y,dz,r],j)=>k.p('c',[0x24402a,0x2e4a30,0x1e3626][(i+j)%3],'ico',x+dx,y+i%2*.4,z+dz,r,r*.85,r,0,i+j,0,.1))})},
  col(D){return D.sp.map(([x,z])=>[x,z,.32])}},
 {k:'gild',i:'⛲',n:'Gilded Fountain',g:2500,d:'Gold trim and a glowing crown for the fountain.',
  b(k){for(let i=0;i<16;i++){const a=i/16*6.283;k.p('m',TWC.gold,'box',Math.cos(a)*2.42,.8,Math.sin(a)*2.42,1.0,.09,.14,0,-a+Math.PI/2,0,0)}
    for(let i=0;i<6;i++){const a=i/6*6.283;k.p('m',TWC.gold,'cone4',Math.cos(a)*2.42,.98,Math.sin(a)*2.42,.12,.3,.12,0,a,0,0)}k.p('g',0x9ad8ff,'oct',0,3.35,0,.26,.4,.26);k.p('m',TWC.gold,'cyl8',0,3.0,0,.3,.1,.3,0,0,0,0)}},
 {k:'trophy',i:'🏆',n:'Sovereign Trophies',g:2000,d:'Six plinths, one crystal for every Sovereign of the portal zones.',
  sp:[[18.2,-1.6],[18.2,-.1],[18.2,1.4],[18.2,2.9],[18.2,4.4],[18.2,5.9]],
  b(k,D){const C=[0xffb040,0x6aff9a,0x9ad8ff,0xffd06a,0x9aff6a,0xff4a5a];D.sp.forEach(([x,z],i)=>{twStones(k,TWC.stoneD,x-.35,z,x+.35,z,0,.9,.7,.3);k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',x,.95,z,.8,.1,.8,0,0,0,.02));
    k.p('g',C[i],'oct',x,1.42,z,.22,.4,.22);k.p('m',TWC.gold,'box',x-.42,.6,z,.02,.2,.5,0,0,0,0)})},col(D){return D.sp.map(([x,z])=>[x,z,.45])}},
 {k:'ravens',i:'🪶',n:'Ravens',g:350,d:'A few ravens keep watch from the walls. They flap and caw.',
  spf:F=>[[-6,1],[4,1],[0,-1],[8,-1]].map(([z,s])=>[s*(F.WX-.4),z,s]).concat(F.SZ>24?[[-(F.WX-.4),F.SZ-6,1],[F.WX-.4,F.SZ-10,-1]]:[],[[-11,F.SZ-.4,0],[11,F.SZ-.4,0]]),
  wall:1,an(g,D,W){const M=new THREE.MeshLambertMaterial({color:0x14121a}),B=new THREE.MeshLambertMaterial({color:0x3a3020}),R=D.sp.map(([x,z,s],i)=>{const r=new THREE.Group(),t=W.top(s?s*W.F.WX:x,s?z:W.F.SZ);r.position.set(s?s*W.F.WX:x,(t==null?2.5:t)+.12,s?z:W.F.SZ);r.userData.y0=r.position.y;r.rotation.y=s?-s*Math.PI/2:Math.PI;
    const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.13,0),M);b.scale.set(.85,.9,1.45);r.add(b);const h=new THREE.Mesh(new THREE.IcosahedronGeometry(.08,0),M);h.position.set(0,.12,.15);r.add(h);
    const bk=new THREE.Mesh(new THREE.ConeGeometry(.025,.1,4),B);bk.rotation.x=Math.PI/2;bk.position.set(0,.11,.25);h.add(bk);bk.position.set(0,-.01,.1);
    const w=[-1,1].map(q=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.24,.02,.14),M);m.position.set(q*.14,.03,-.02);m.geometry.translate(q*.1,0,0);r.add(m);return m});g.add(r);return {r,h,w,t:i*1.7}});
    return now=>R.forEach(o=>{const t=now/1000+o.t,fl=Math.max(0,Math.sin(t*.7))>.93?Math.sin(t*28):0;o.w[0].rotation.z=.25+.9*fl;o.w[1].rotation.z=-.25-.9*fl;o.h.rotation.y=.6*Math.sin(t*.45)+.2*Math.sin(t*1.9);o.r.position.y=o.r.userData.y0+.05*Math.abs(fl)})}},
 {k:'wisps',i:'✨',n:"Will-o'-Wisps",g:900,d:'Soft lights drift through the streets at night.',
  spf:F=>[[F.SZ]],an(g,D){const Z0=-14,Z1=Math.max(4,D.sp[0][0]-2);const M=[0x9ad8ff,0xc8a0ff,0xffe08a].map(c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.85}));const W=[];for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.09,0),M[i%3]);m.userData.lpsSkip=1;
      const a={x:(i*37%34)-17,z:Z0+(i*53%97)/97*(Z1-Z0),y:1.4+(i%4)*.45,t:i*2.3};g.add(m);W.push([m,a])}
    return now=>{const n=typeof ATM!='undefined'?ATM.night||0:.5;W.forEach(([m,a])=>{const t=now/1000+a.t;m.visible=n>.15;m.position.set(a.x+1.8*Math.sin(t*.31),a.y+.35*Math.sin(t*1.3),a.z+1.6*Math.cos(t*.27));m.scale.setScalar(.8+.3*Math.sin(t*3.1));M.forEach(q=>q.opacity=.4+.5*n)})}}},
 {k:'skylant',i:'🌙',n:'Sky Lanterns',g:1200,d:'Paper lanterns rise slowly over the town into the night.',
  an(g){const L=[];const mt=new THREE.MeshBasicMaterial({color:0xffb050});for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.32,.42,.32),mt);m.userData.lpsSkip=1;g.add(m);L.push([m,i/10,(i*29%32)-16,(i*41%60)-14])}
    return now=>{const n=typeof ATM!='undefined'?ATM.night||0:.5;L.forEach(([m,o,x,z])=>{const u=(now/60000+o)%1;m.visible=n>.3;m.position.set(x+Math.sin(u*9+o*7)*1.5,1.5+u*34,z+u*8);m.rotation.y=u*6;m.scale.setScalar(1-u*.5)})}}},
 {k:'carts',i:'🛒',n:'Merchant Carts',g:500,d:'Loaded handcarts parked between the market buildings.',
  sp:[[-12.9,-.6],[12.9,-.6]],
  b(k,D){D.sp.forEach(([x,z],i)=>k.at(x,0,z,()=>{k.as('board',()=>k.p('c',0x6a4a2e,'box',0,.62,0,1.9,.08,1.0,0,0,0,.03));twPlanks(k,0x7a5a3a,-.95,.5,.95,.5,.62,.95,.2);twPlanks(k,0x7a5a3a,-.95,-.5,.95,-.5,.62,.95,.2);
    [-1,1].forEach(s=>{k.as('wood',()=>k.p('c',TWC.woodD,'cyl8',-.3,.36,s*.55,.36,.06,.36,Math.PI/2,0,0,.02));k.as('wood',()=>k.L('c',TWC.woodD,[.95,.62,s*.35],[1.8,.3,s*.35],.04,'box'))});
    [[0,.1,0x8a5a2a],[-.5,-.15,0xc8a850],[.45,.2,0x6a8a3a]].forEach(([a,b,c],j)=>k.p('c',c,j==1?'cyl8':'sph',a,.85,b,.26,.22,.26,j?Math.PI/2:0,0,0,.06));TWN100_crate(k,-.45,.25,.3,.3)},i%2?Math.PI:0))},
  col(D){return D.sp.map(([x,z])=>[x,z,1.05,.6])}},
 {k:'well',i:'💧',n:'Village Well',g:700,d:'A stone well with a little roof on the west side of the plaza.',
  b(k){k.at(-17.4,0,2.0,()=>{twStoneRing(k,0x7a7468,0,0,.75,0,.85,.3);k.p('c',0x1a2a3a,'cyl8',0,.6,0,.55,.02,.55,0,0,0,0);[-1,1].forEach(s=>k.as('wood',()=>k.L('c',TWC.woodD,[s*.78,0,0],[s*.78,2.0,0],.07,'box')));
    k.as('wood',()=>k.L('c',TWC.woodD,[-.85,1.6,0],[.85,1.6,0],.05,'cyl6'));k.L('m',0x8a7a5a,[0,1.6,0],[0,.95,0],.012,'cyl6',0);k.as('wood',()=>k.p('c',0x6a4a2e,'cyl8',0,.92,0,.16,.2,.16,0,0,0,.03));twGable(k,0x5a4632,2.0,1.2,.55,.2,2.0)})},col(){return [[-17.4,2.0,.95]]}},
 {k:'bunting',i:'🧵',n:'Festival Bunting',g:300,d:'Colourful pennants strung across both sides of the plaza.',
  b(k){[-1,1].forEach(s=>[-12.2,8.8].forEach((z,j)=>{const x0=s*11.6,x1=s*18.8,y=3.7;[x0,x1].forEach(x=>dcPost103(k,x,z,3.85));k.L('m',0x3a3028,[x0,y,z],[x1,y,z],.01,'cyl6',0);
    for(let i=0;i<7;i++){const t=(i+.5)/7,x=x0+(x1-x0)*t,yy=y-.18*Math.sin(t*Math.PI);k.as('cloth',()=>k.p('c',[0xc83a3a,0xe8c84a,0x3a6ac8,0x3a9a5a][(i+j)%4],'tri',x,yy-.16,z,.32,.3,.02,0,Math.PI/2,Math.PI,0))}}))}},
 {k:'benches',i:'🪑',n:'Stone Benches',g:200,d:'Benches along the walls for tired heroes.',
  sp:[[-19,-8.4,1],[-19,-.4,1],[19,8.6,-1]],
  b(k,D){D.sp.forEach(([x,z,s])=>k.at(x,0,z,()=>{[-.55,.55].forEach(q=>twStones(k,TWC.stone,q-.12,0,q+.12,0,0,.42,.36,.22));k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',0,.46,0,1.5,.1,.42,0,0,0,.02))},Math.PI/2))},
  col(D){return D.sp.map(([x,z])=>[x,z,.25,.78])}},
 {k:'pumpkins',i:'🎃',n:'Harvest Piles',g:250,d:'Pumpkins, sheaves and baskets by the market stalls and the well.',
  sp:[[13.4,-9.6],[13.1,-6.6],[-18.4,-.6],[-16.4,9.8]],
  b(k,D){D.sp.forEach(([x,z],i)=>{for(let j=0;j<5;j++){const a=j*1.3+i,r=j?.35:0;k.p('c',[0xd8802a,0xc8701a,0xe8a03a][j%3],'sph',x+Math.cos(a)*r,.2+(j?0:.15),z+Math.sin(a)*r,.24,.18,.24,0,a,0,.05)}
    k.as('straw',()=>k.p('c',0xc8a850,'cyl8',x+.7,.4,z-.2,.18,.8,.18,0,0,.1,.12))})}},
 {k:'shrine',i:'🕯️',n:'Candle Shrine',g:550,d:'A small stone shrine with ever-burning candles, east of the fountain.',
  b(k){k.at(14.6,0,6.4,()=>{twStones(k,TWC.stoneD,-.5,0,.5,0,0,1.0,.8,.35);k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',0,1.05,0,1.2,.1,.6,0,0,0,.02));k.at(0,0,0,()=>twGable(k,0x3e3a48,1.3,.8,.45,.15,1.7));
    [-.35,-.15,.05,.25,.4].forEach((x,i)=>{k.p('c',0xe8e0d0,'cyl6',x,1.15+i%2*.05,.12,.04,.16+i%2*.06,.04,0,0,0,0);k.p('g',0xffd27a,'cone4',x,1.3+i%2*.11,.12,.04,.08,.04)});
    [-.5,.5].forEach(x=>k.as('stone',()=>k.L('c',TWC.stoneD,[x,1.1,-.25],[x,1.7,-.25],.08,'box')))})},col(){return [[14.6,6.4,.6]]}},
 {k:'totems',i:'🦴',n:'Bone Totems',g:450,d:'Grim totems of horn and bone line the road outside the south gate.',
  sp:[[-2.3,54],[2.3,54],[-2.3,58],[2.3,58]],
  b(k,D){D.sp.forEach(([x,z],i)=>{dcPost103(k,x,z,2.2,0x4a3424);k.as('plain',()=>{k.p('c',0xe8e0c8,'dod',x,2.25,z,.22,.18,.2);[-1,1].forEach(s=>k.L('c',0xe8e0c8,[x+s*.12,2.3,z],[x+s*.55,2.75,z-.1],.04,'cone6'))});
    [.9,1.3,1.7].forEach((y,j)=>k.p('c',[0x8a2a2a,0xe8e0c8,0x2a2a30][j],'box',x,y,z,.18,.06,.18,0,j,0,.02))})}},
 {k:'ivy',i:'🌿',n:'Wall Ivy',g:200,d:'Dark ivy climbs the inside of the walls.',
  wall:1,b(k,D,W){const F=W.F;[-1,1].forEach(s=>[-18,-11,-4,4,9,19,26,31,37,44,49].forEach((z,i)=>{if(z>F.SZ-1.5)return;const t=W.top(s*F.WX,z);if(t==null)return;for(let j=0;j<4;j++){const y=.4+j*.55+i%2*.2;if(y>t-.3)break;const f=W.faceX(s,z,y);if(f==null)continue;
      k.p('c',[0x24402a,0x2e4a30,0x35602e][(i+j)%3],'ico',f-s*.06,y,z+(j%2-.5)*.5,.08,.35,.4,0,0,0,.12)}}));
    [-27,-18,-11,-4,10,17,24,31].forEach((x,i)=>{if(Math.abs(x)>F.WX-2)return;const t=W.top(x,F.SZ);if(t==null)return;for(let j=0;j<3;j++){const y=.5+j*.6;if(y>t-.3)break;const f=W.faceZ(x,y);if(f==null)continue;k.p('c',[0x24402a,0x2e4a30][(i+j)%2],'ico',x+(j-1)*.45,y,f-.06,.4,.35,.08,0,0,0,.12)}})}},
 {k:'gatepoles',i:'🚩',n:'Gate Standards',g:650,d:'Two tall standards flank the inside of the south gate.',
  spf:F=>[[-4.3,F.SZ-1.8],[4.3,F.SZ-1.8]],b(k,D){const ban=TOWNS[0].pal.ban||0x8a2a3a;[-1,1].forEach(s=>{const x=s*4.3,z=D.sp[0][1];dcPost103(k,x,z,5.2);k.p('m',TWC.gold,'oct',x,5.35,z,.1,.18,.1);k.as('wood',()=>k.L('c',TWC.woodD,[x,4.9,z],[x,4.9,z-.9],.035,'box'));kdBanner(k,x,4.85,z-.45,s*Math.PI/2,ban,.75,2.2)})},
  col(D){return D.sp.map(([x,z])=>[x,z,.15])}},
 {k:'crystals',i:'💠',n:'Moon Crystals',g:800,d:'Glowing crystal clusters ring the fountain.',
  b(k){for(let i=0;i<8;i++){const a=i/8*6.283+.2,x=Math.cos(a)*3.3,z=Math.sin(a)*3.3;if(z>2.5&&Math.abs(x)<1.4)continue;[[0,.3,0],[.18,.2,.1],[-.15,.22,-.08]].forEach(([dx,h,dz],j)=>k.p('g',[0x9ad8ff,0xc8a0ff,0xaee6ff][(i+j)%3],'oct',x+dx,h,z+dz,.09+h*.1,h,.09+h*.1,dx,a,dz))}}},
 {k:'mosaic',i:'🔆',n:'Crest Mosaic',g:700,d:'A golden sun crest set into the paving at the south edge of the plaza.',
  b(k){for(let i=0;i<24;i++){const a=i/24*6.283;k.p(i%2?'m':'c',i%2?TWC.gold:0x6a2a3a,'box',Math.cos(a)*1.3,.015,9.6+Math.sin(a)*1.3,.5,.02,.12,0,-a,0,0)}
    for(let i=0;i<8;i++){const a=i/8*6.283;k.p('m',TWC.gold,'tri',Math.cos(a)*.7,.02,9.6+Math.sin(a)*.7,.3,.02,.5,0,-a+Math.PI/2,0,0)}k.p('m',TWC.gold,'cyl8',0,.02,9.6,.4,.02,.4,0,0,0,0)}},
 {k:'cats',i:'🐈',n:'Town Cats',g:300,d:'A few cats doze in the warm spots. They twitch their tails.',
  sp:[[-17.4,2.9,.88],[18.2,8.4,0],[-11.8,9.8,0],[6.6,9.3,.55],[18.2,-1.6,1.0]],
  an(g,D){const C=[0x2a2a30,0xd8802a,0x8a8a8a,0xe8e0d0,0x3a2a1a],R=D.sp.map(([x,z,y],i)=>{const r=new THREE.Group(),M=new THREE.MeshLambertMaterial({color:C[i%5]});r.position.set(x,y,z);r.rotation.y=i*1.9;
    const b=new THREE.Mesh(new THREE.SphereGeometry(.15,7,5),M);b.scale.set(1,.85,1.4);b.position.y=.13;r.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.09,7,5),M);h.position.set(0,.27,.17);r.add(h);
    [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.ConeGeometry(.03,.07,4),M);e.position.set(s*.045,.06,0);h.add(e)});
    const t=new THREE.Mesh(new THREE.CylinderGeometry(.02,.025,.32,4),M);t.geometry.translate(0,.16,0);t.position.set(0,.12,-.2);t.rotation.x=-1.0;r.add(t);g.add(r);return {h,t,o:i*2.1}});
    return now=>R.forEach(c=>{const s=now/1000+c.o;c.t.rotation.z=.6*Math.sin(s*1.6);c.h.rotation.y=.5*Math.sin(s*.3)})}},
 {k:'baskets',i:'🧺',n:'Hanging Flower Baskets',g:250,d:'Flower baskets on every lantern post down the side streets.',
  b(k){(typeof TWN100_LP!='undefined'?TWN100_LP:[]).forEach(([x,z],i)=>{if(Math.abs(x)<17)return;const s=x<0?1:-1,bx=x+s*.05;k.as('straw',()=>k.p('c',0x8a6a3a,'sph',bx,1.55,z,.2,.14,.2,0,0,0,.05));
    for(let j=0;j<4;j++)k.p('c',[0xc83a5a,0xe8c84a,0xb070ff,0x4a7a3a][(i+j)%4],'ico',bx+Math.cos(j*1.6)*.12,1.66,z+Math.sin(j*1.6)*.12,.08,.07,.08,0,j,0,.05)})}},
 {k:'woodpile',i:'🪵',n:'Firewood Stacks',g:150,d:'Neat stacks of firewood in the north corners.',
  sp:[[-18.7,-16.4],[-18.7,-14.2],[18.75,-16.4],[18.75,-14.2]],
  b(k,D){D.sp.forEach(([x,z],i)=>{for(let j=0;j<9;j++){const y=.12+Math.floor(j/3)*.2,zz=z-.45+(j%3)*.3;k.as('bark',()=>k.L('c',[0x5a3a22,0x6a4a2a][j%2],[x-.4,y,zz],[x+.4,y,zz],.1,'log'))}})},col(D){return D.sp.map(([x,z])=>[x,z,.45,.5])}},
 {k:'fireworks',i:'🌠',n:'Night Fireworks',g:3000,d:'At night, fireworks burst high over Duskhold every few seconds.',
  an(g){let nx=0;return now=>{const n=typeof ATM!='undefined'?ATM.night||0:.5;if(n<.35||now<nx)return;nx=now+2600+Math.random()*3000;const T=TOWNS[0];
    try{if(Math.hypot(pl.position.x-T.cx,pl.position.z-(T.cy+15))>60)return;const F=dcF104(),c=[0xff5a5a,0xffd24a,0x6ad8ff,0xb08aff,0x6aff9a][Math.floor(Math.random()*5)],p=new THREE.Vector3(T.cx+(Math.random()-.5)*F.WX*1.6,T.ph+20+Math.random()*8,T.cy-14+Math.random()*(F.SZ+14));
      burst(p,c,46,7,1.5,1.3);if(typeof sfx=='function'&&Math.random()<.4)sfx('chime')}catch(_){}}}}
];
var DC103={g:{},col:{}};SH.deco=SH.deco||{};
function dcOn103(k){return SH.deco[k]===1}
// the wall as it stands now (Bastion Walls level): inner face and top found by casting rays at the ring's own meshes
function dcWall104(){const T=TOWNS[0],K=kdState(),G=K.wg,lv=K.wl|0,rc=new THREE.Raycaster(),F=dcF104();if(G)G.updateMatrixWorld(true);
  const hit=(o,d,far)=>{if(!G)return null;rc.set(o,d);rc.far=far;const h=rc.intersectObject(G,true)[0];return h?h.point:null};
  return {lv,F,top:(x,z)=>{let best=null;for(const [dx,dz] of [[0,0],[.2,0],[-.2,0],[0,.2],[0,-.2],[.15,.15],[-.15,-.15]]){const p=hit(new THREE.Vector3(T.cx+x+dx,T.ph+20,T.cy+z+dz),new THREE.Vector3(0,-1,0),30);if(p&&(best==null||p.y-T.ph>best))best=p.y-T.ph}return best},
    faceX:(s,z,y)=>{const p=hit(new THREE.Vector3(T.cx+s*(F.WX-6),T.ph+y,T.cy+z),new THREE.Vector3(s,0,0),12);return p?p.x-T.cx:s*(F.WX-.5)},
    faceZ:(x,y)=>{const p=hit(new THREE.Vector3(T.cx+x,T.ph+y,T.cy+F.SZ-7),new THREE.Vector3(0,0,1),12);return p?p.z-T.cy:F.SZ-.5}}}
function dcBuild103(D){const T=TOWNS[0],F=dcF104(),fr=!!(D.wall||D.spf);if(D.spf)D.sp=D.spf(F);const W=D.wall?dcWall104():null,key='DECO104|'+D.k+(W?'|w'+W.lv:'')+(fr?'|s'+F.s:'');let k=null;const g=new THREE.Group();g.name='deco_'+D.k;g.position.set(T.cx,T.ph,T.cy);g.userData.wl=W?W.lv:null;g.userData.fs=fr?F.s:null;
  if(D.b){if(!twHas(key)){k=twKit(1101+D.k.length*7+D.k.charCodeAt(0));D.b(k,D,W)}const s=twGroup(k,key);g.add(s)}
  if(D.an){const f=D.an(g,D,W);if(f){g.userData.an={x:T.cx,z:T.cy+14,f:now=>{if(g.visible)f(now)}};TANIM.push(g.userData.an)}g.userData.psNo=1}
  scene.add(g);DC103.g[D.k]=g;
  DC103.col[D.k]=(D.col?D.col(D):[]).map(q=>q.length==3?{x:T.cx+q[0],z:T.cy+q[1],r:q[2]}:{x:T.cx+q[0],z:T.cy+q[1],hx:q[2],hz:q[3]});return g}
function dcDrop104(k){const g=DC103.g[k],T=TOWNS[0];if(!g)return;scene.remove(g);if(g.userData.an){const i=TANIM.indexOf(g.userData.an);if(i>=0)TANIM.splice(i,1)}(DC103.col[k]||[]).forEach(c=>{const i=T.col.indexOf(c);if(i>=0)T.col.splice(i,1)});delete DC103.g[k];delete DC103.col[k]}
function dc103Sync(){const T=TOWNS[0];if(!T)return;const wl=kdState().wl|0;
  const fs=dcF104().s;DECO103.forEach(D=>{const g=DC103.g[D.k];if(g&&(D.wall&&g.userData.wl!==wl||(D.wall||D.spf)&&g.userData.fs!==fs))dcDrop104(D.k)});
  DECO103.forEach(D=>{const on=dcOn103(D.k);let g=DC103.g[D.k];if(on&&!g)g=dcBuild103(D);if(g)g.visible=on;
  (DC103.col[D.k]||[]).forEach(c=>{const i=T.col.indexOf(c);if(on&&i<0)T.col.push(c);else if(!on&&i>=0)T.col.splice(i,1)})});
  try{if(typeof CZ103!='undefined')CZ103.ver=-1}catch(_){}}
function dcBuy103(k){const D=DECO103.find(q=>q.k==k);if(!D||SH.deco[k]!=null)return;if(gold<D.g)return say('Not enough gold.');gold-=D.g;SH.deco[k]=1;dc103Sync();
  banner(D.i+' '+D.n.toUpperCase(),D.d,'You can switch it off and on in the Decorations tab');sfx('power');hud();try{saveGame(true)}catch(_){}}
function dcToggle103(k){if(SH.deco[k]==null)return;SH.deco[k]=SH.deco[k]?0:1;dc103Sync();try{saveGame(true)}catch(_){}}
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.kdeco=Object.assign({},SH.deco);return o}}
{const f=x2Load;x2Load=function(s){SH.deco={};if(s&&s.kdeco&&typeof s.kdeco=='object')DECO103.forEach(D=>{const v=s.kdeco[D.k];if(v===0||v===1)SH.deco[D.k]=v});const r=f.apply(this,arguments);dc103Sync();return r}}
// ---------- the Steward's window: Kingdom | Decorations ----------
KM103.tab=KM103.tab||'kingdom';
function dcRender103(){const own=DECO103.filter(D=>SH.deco[D.k]!=null).length,on=DECO103.filter(D=>dcOn103(D.k)).length;
  const rows=DECO103.map(D=>{const has=SH.deco[D.k]!=null,o=dcOn103(D.k);
    return `<div class="dccard${has?' own':''}${o?' on':''}"><div class="dci">${D.i}</div><div class="dct"><b>${D.n}</b><small>${D.d}</small></div><div class="dca">${has?`<button class="dctg${o?' on':''}" data-dct="${D.k}" aria-pressed="${o}">${o?'On':'Off'}</button>`:`<button class="pri" data-dcb="${D.k}" ${gold>=D.g?'':'disabled'}>🪙 ${D.g}</button>`}</div></div>`}).join('');
  $('xwB').innerHTML=`<div class="mut dcsum">${own} of ${DECO103.length} owned · ${on} shown. Decorations stand in fixed spots round the square and never block a building lot.</div><div class="dcgrid">${rows}</div>`;
  $('xwF').innerHTML='<span class="mut dtl">Bought once, kept forever. Switch any decoration off to hide it, and on again whenever you like.</span>'}
// v117: three tabs — Construction (the plan and the building list), Villagers (vlRender116 in 2150), Decorations
{const f=XR.hold;XR.hold=function(){const t=KM103.tab;
  if(t=='deco'||t=='vill'){$('xwT').textContent='🏰 Kingdom of Duskhold';$('xwS').textContent='🪙 '+gold+' · 👑 '+bossDone.size+' · 👥 '+HS103.cit.length;try{kmPickEnd103()}catch(_){}if(t=='deco')dcRender103();else vlRender116()}else f.apply(this,arguments);
  const b=(k,l)=>`<button class="${(t==k||(k=='kingdom'&&t!='deco'&&t!='vill'))?'on':''}" data-kmtab="${k}">${l}</button>`;
  $('xwB').insertAdjacentHTML('afterbegin',`<div class="tabs kmtabs">${b('kingdom','🏗️ Construction')}${b('vill','👥 Villagers')}${b('deco','🌟 Decorations')}</div>`)}}
$('xw').addEventListener('click',e=>{if(xwMode!='hold')return;const t=e.target.closest('[data-kmtab],[data-dcb],[data-dct]');if(!t||t.disabled)return;const d=t.dataset;
  if(d.kmtab){KM103.tab=d.kmtab;rX()}else if(d.dcb){dcBuy103(d.dcb);rX()}else if(d.dct){dcToggle103(d.dct);rX()}});
// opening the window from a house door goes to the Villagers tab (v117)
{const f=openX;openX=function(m){if(m=='hold'&&KM103.focus=='cit'){KM103.tab='vill';KM103.focus=null}return f.apply(this,arguments)}}
document.head.insertAdjacentHTML('beforeend',`<style>
#xw .kmtabs{margin:0 0 10px}
#xw .dcsum{font-size:.76rem;margin-bottom:8px}#xw .dcgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px}
#xw .dccard{display:grid;grid-template-columns:34px 1fr auto;gap:8px;align-items:center;padding:8px 10px;border:1px solid var(--line);border-radius:6px;background:rgba(255,255,255,.03)}
#xw .dccard.own{border-color:rgba(201,162,74,.45)}#xw .dccard.on{background:rgba(201,162,74,.1)}
#xw .dci{font-size:1.5rem;text-align:center}#xw .dct small{display:block;color:var(--mut);font-size:.72rem;line-height:1.3}
#xw .dctg{min-width:54px;border-radius:99px!important}#xw .dctg.on{background:#3a6a3a;border-color:#6ee7b7;color:#e8ffe8}
</style>`);
// walls rebuilt (Bastion Walls upgraded) → the wall decorations follow
{const f=kdSync;kdSync=function(){const r=f.apply(this,arguments);try{dc103Sync()}catch(e){console.warn('v104 decorations',e)}return r}}
try{dc103Sync()}catch(e){console.warn('v104 decorations',e)}
