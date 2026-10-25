// ================= v148: cheaper decorations, material-only ones, and six big new ones =================
// Owner's list: decorations were gold-only and pricey (150..3000) and mostly small. Now:
//  - every decoration costs less, and many cost only common materials (wood, stone, plant fibre, petals, glow caps, bones),
//    the things the outskirts (3074) and the first zones give; the rest mix a little gold with materials (DC148_COST);
//  - six new, large decorations change how Duskhold looks: the Duskhold Obelisk (north of the fountain, with turning stone
//    rings and a floating crystal), Plaza Torches (a ring of flickering torches round the plaza), and four set pieces for the
//    open squares between the south lots, each appearing once the kingdom has grown over its square: the Lantern Pavilion,
//    the Elder Oak, the Moonflower Gardens and the Great Beacon. Their spots keep the mid lots' doors and the paths to them clear.
// The Steward's Decorations tab shows the price in gold and materials (red when you have too little) and when a square
// decoration will appear. Owned decorations from older saves stay owned.
var DC148_COST={
 banner:{g:120,m:{fiber:10}},garland:{m:{wood:12,glowcap:6}},planter:{m:{stone:12,petals:6}},statue:{g:600,m:{stone:30}},brazier:{g:120,m:{stone:10}},
 trees:{m:{wood:20,fiber:10}},gild:{g:1000,m:{iron:10}},trophy:{g:800,m:{crystal:6}},ravens:{g:150},wisps:{g:350,m:{glowcap:10}},skylant:{g:450,m:{fiber:10}},
 carts:{m:{wood:25}},well:{m:{stone:25,wood:10}},bunting:{m:{fiber:18}},benches:{m:{stone:15}},pumpkins:{m:{fiber:10,wood:6}},shrine:{g:220,m:{stone:10}},
 totems:{m:{bone:12,wood:8}},ivy:{m:{fiber:12}},gatepoles:{g:250,m:{wood:10}},crystals:{g:300,m:{crystal:6}},mosaic:{g:280,m:{stone:15}},cats:{g:120},
 baskets:{m:{fiber:8,petals:6}},woodpile:{m:{wood:15}},fireworks:{g:1200},
 obelisk:{g:300,m:{stone:30,crystal:4}},torches:{m:{wood:12,fiber:6}},pavilion:{g:200,m:{wood:35}},oak:{g:250,m:{wood:30,fiber:12}},
 garden:{m:{fiber:20,petals:12,stone:10}},beacon:{g:350,m:{stone:40,wood:15}}};
// ---------------- the new decorations ----------------
// flames that flicker (animated, not baked): a few additive cones per fire
function dc148Fire(g,list,M){const F=list.map(([x,y,z,s],i)=>{const o=new THREE.Group();o.position.set(x,y,z);[[0xffd27a,.55,1],[0xff8a3a,.8,.75],[0xff4a1a,1,.5]].forEach(([c,h,r],j)=>{
    const m=new THREE.Mesh(new THREE.ConeGeometry(.16*s*r,.55*s*h,6),M[j]||(M[j]=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})));
    m.position.y=.25*s*h;m.userData.lpsSkip=1;o.add(m)});g.add(o);return {o,t:i*1.7}});
  return now=>F.forEach(q=>{const t=now/1000+q.t;q.o.children.forEach((m,j)=>{const k=1+.18*Math.sin(t*(9+j*3))+.1*Math.sin(t*23+j);m.scale.set(1,k,1);m.rotation.y=t*(1+j)})})}
DECO103.push(
 {k:'obelisk',i:'🗿',n:'Duskhold Obelisk',d:'A black obelisk north of the fountain, ringed by turning stones under a floating crystal.',
  sp:[[0,-9.4]],
  b(k){k.at(0,0,-9.4,()=>{twStones(k,TWC.stoneD,-1.25,0,1.25,0,0,.36,2.5,.4);k.as('ashlar',()=>{k.p('c',TWC.stoneL,'box',0,.42,0,2.2,.12,2.2,0,0,0,.02);k.p('c',TWC.stone,'box',0,.62,0,1.6,.3,1.6,0,0,0,.02)});
    k.as('stone',()=>{k.p('c',0x2a2830,'frus8',0,2.95,0,.5,4.4,.5,0,Math.PI/8,0,.03);k.p('c',0x2a2830,'cone4',0,5.45,0,.42,.6,.42,0,Math.PI/4,0,.02)});
    for(let i=0;i<4;i++){const a=i*Math.PI/2;for(let j=0;j<6;j++)k.p('g',0x9a6aff,'box',Math.sin(a)*.47,1.2+j*.62,Math.cos(a)*.47,.12+.05*(j%2),.18,.02,0,a,0,0)}
    [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([a,b])=>kdBrazier(k,a*1.0,b*1.0,.77,.55))})},
  an(g){const T=TOWNS[0],o=new THREE.Group();o.position.set(0,0,-9.4);g.add(o);const M=new THREE.MeshLambertMaterial({color:0x4a4654}),G=new THREE.MeshBasicMaterial({color:0xc8a0ff});
    const R=[[1.05,3.3,.0],[.85,4.3,.9]].map(([r,y,t])=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,.06,5,22),M);m.position.y=y;m.rotation.x=Math.PI/2;o.add(m);
      for(let i=0;i<6;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.12),G);s.position.set(Math.cos(i/6*6.283)*r,0,Math.sin(i/6*6.283)*r);s.userData.lpsSkip=1;m.add(s)}return {m,t}});
    const c=new THREE.Mesh(new THREE.OctahedronGeometry(.28,0),new THREE.MeshBasicMaterial({color:0xd8b8ff}));c.position.y=6.2;c.userData.lpsSkip=1;o.add(c);
    return now=>{const t=now/1000;R.forEach((q,i)=>{q.m.rotation.z=t*(i?-.5:.35)+q.t;q.m.position.y=(i?4.3:3.3)+.08*Math.sin(t*1.1+i)});c.rotation.y=t*.8;c.position.y=6.2+.15*Math.sin(t*1.4)}},
  col(D){return [[0,-9.4,1.3]]}},
 {k:'torches',i:'🔥',n:'Plaza Torches',d:'Tall torches on iron-banded posts in a ring round the plaza. They flicker all night.',
  spf:F=>{const out=[];let s=null;try{s=chq148Spot()}catch(_){}const T=TOWNS[0];for(let i=0;i<8;i++){const a=i/8*6.283+.3927,x=Math.cos(a)*6.2,z=Math.sin(a)*6.2;
    if(s&&(Math.hypot(T.cx+x-s.cx,T.cy+z-s.cz)<1.9||Math.hypot(T.cx+x-s.bx,T.cy+z-s.bz)<1.9))continue;out.push([+x.toFixed(2),+z.toFixed(2)])}return out},
  b(k,D){D.sp.forEach(([x,z])=>{k.as('bark',()=>k.L('c',TWC.woodD,[x,0,z],[x,2.35,z],.07,'log'));[.6,1.5,2.2].forEach(y=>k.p('m',TWC.iron,'cyl8',x,y,z,.085,.06,.085,0,0,0,0));
    k.p('m',TWC.iron,'frus8',x,2.45,z,.16,.2,.16,Math.PI,0,0,0);k.p('c',0x2a1a10,'cyl8',x,2.52,z,.12,.03,.12,0,0,0,0)})},
  an(g,D){return dc148Fire(g,D.sp.map(([x,z])=>[x,2.53,z,.8]),[])},col(D){return D.sp.map(([x,z])=>[x,z,.16])}},
 {k:'pavilion',i:'🏮',n:'Lantern Pavilion',d:'An open wooden pavilion hung with glowing lanterns, in the square east of the first row of lots.',
  spf:F=>F.SZ>19?[[13.2,13.7]]:[],
  b(k,D){D.sp.forEach(([x,z])=>k.at(x,0,z,()=>{[[-1.5,-1.3],[1.5,-1.3],[-1.5,1.3],[1.5,1.3]].forEach(([a,b])=>{k.as('wood',()=>k.L('c',0x5a2a22,[a,0,b],[a,2.5,b],.09,'box'));twStones(k,TWC.stone,a-.18,b,a+.18,b,0,.25,.36,.36)});
      k.as('board',()=>k.p('c',0x4a3420,'box',0,.1,0,3.4,.12,3.0,0,0,0,.02));[[-1.5,0],[1.5,0]].forEach(([a])=>k.as('wood',()=>k.p('c',0x5a2a22,'box',a,2.45,0,.14,.14,3.0,0,0,0,.02)));
      twGable(k,0x6a2a24,3.6,3.2,.95,.45,2.5);[-1,1].forEach(s=>k.p('m',TWC.gold,'cone4',s*1.95,3.4,0,.08,.4,.08,0,0,0,0));
      k.as('wood',()=>{k.p('c',0x4a3020,'cyl8',0,.55,0,.6,.06,.6,0,0,0,.02);k.L('c',0x3a2418,[0,.12,0],[0,.52,0],.08,'cyl6')});k.p('c',0xe8dcc0,'box',.1,.6,.1,.3,.02,.22,0,.3,0,0);k.p('g',0xffd27a,'cyl6',-.25,.68,-.1,.05,.12,.05);
      [[-1.5,-1.3],[1.5,-1.3],[-1.5,1.3],[1.5,1.3],[0,-1.4],[0,1.4]].forEach(([a,b],i)=>{k.L('m',0x2a2420,[a,2.42,b],[a,2.1,b],.01,'cyl6',0);k.p('c',[0x8a2a2a,0xa8502a][i%2],'cyl8',a,1.95,b,.17,.28,.17,0,0,0,.02);k.p('g',[0xffb050,0xff8a3a][i%2],'cyl8',a,1.95,b,.13,.22,.13)})}))},
  col(D){return D.sp.length?[[-1.5,-1.3],[1.5,-1.3],[-1.5,1.3],[1.5,1.3]].map(([a,b])=>[D.sp[0][0]+a,D.sp[0][1]+b,.2]):[]}},
 {k:'oak',i:'🌳',n:'The Elder Oak',d:'A vast, ancient oak with lanterns in its branches and a ring of mossy stones round its roots.',
  spf:F=>F.SZ>27?[[-14,21.4]]:[],
  b(k,D){D.sp.forEach(([x,z])=>k.at(x,0,z,()=>{k.as('bark',()=>{k.L('c',0x3a2a1c,[0,0,0],[.1,2.6,.05],.62,'log');k.L('c',0x3a2a1c,[.1,2.5,.05],[1.6,3.9,.4],.28,'log');k.L('c',0x3a2a1c,[.1,2.5,0],[-1.4,4.1,-.3],.3,'log');
        k.L('c',0x3a2a1c,[.1,2.7,0],[.2,4.6,-1.2],.25,'log');k.L('c',0x3a2a1c,[.05,2.6,0],[-.3,4.4,1.3],.24,'log');
        for(let i=0;i<7;i++){const a=i/7*6.283+.4;k.L('c',0x34261a,[Math.cos(a)*.35,.25,Math.sin(a)*.35],[Math.cos(a)*1.25,0,Math.sin(a)*1.25],.16,'log')}});
      {const C=[[0,6.3,0,1.25]];for(let i=0;i<9;i++){const t=i/9*6.283;C.push([Math.cos(t)*2.0,4.4+(i%3)*.35,Math.sin(t)*2.0,.95+(i%2)*.2])}for(let i=0;i<6;i++){const t=i/6*6.283+.5;C.push([Math.cos(t)*1.1,5.5+(i%2)*.3,Math.sin(t)*1.1,1.05])}
        C.forEach(([a,y,b,r],j)=>{k.p('c',[0x1e3626,0x24402a,0x2a4a30,0x1a2e22][j%4],'ico',a,y,b,r,r*.72,r,0,j,0,.14);k.p('c',0x152a1c,'ico',a,y-r*.35,b,r*.8,r*.35,r*.8,0,j+1,0,.1)})}
      for(let i=0;i<10;i++){const a=i/10*6.283;k.as('stone',()=>k.p('c',[0x5a5662,0x4e4a54][i%2],'dod',Math.cos(a)*2.05,.16,Math.sin(a)*2.05,.32,.24,.28,0,a,0,.18));k.p('c',0x35602e,'ico',Math.cos(a)*2.05,.32,Math.sin(a)*2.05,.2,.08,.2,0,a,0,.1)}
      [[1.5,3.6,.4],[-1.3,3.8,-.3],[.2,4.1,-1.1],[-.3,3.9,1.2],[1.0,4.2,-.6]].forEach(([a,y,b])=>{k.L('m',0x2a2420,[a,y+.5,b],[a,y,b],.008,'cyl6',0);k.p('m',0x2a2622,'box',a,y-.06,b,.16,.2,.16,0,0,0,0);k.p('g',0xffc070,'oct',a,y-.06,b,.07,.1,.07)})}))},
  col(D){return D.sp.length?[[D.sp[0][0],D.sp[0][1],.8]]:[]}},
 {k:'garden',i:'🌷',n:'Moonflower Gardens',d:'Hedged flower beds round a stone birdbath, in an open square of the south ward.',
  spf:F=>F.SZ>34?[[14,28.6]]:[],
  b(k,D){D.sp.forEach(([x,z])=>k.at(x,0,z,()=>{[[-1.4,-1.2],[1.4,-1.2],[-1.4,1.2],[1.4,1.2]].forEach(([a,b],i)=>{twStones(k,TWC.stone,a-.8,b,a+.8,b,0,.22,.5,.6);k.as('dirt',()=>k.p('c',0x2e2216,'box',a,.24,b,1.5,.04,1.0,0,0,0,0));
        for(let j=0;j<7;j++){const u=a-.6+j*.2,v=b+((j%2)-.5)*.3;k.p('c',0x2e4a30,'ico',u,.34,v,.1,.12,.1,0,j,0,.06);k.p('c',[0xc8a0ff,0xe8e0f8,0x9a6aff,0xffd27a][(i+j)%4],'sph',u,.48,v,.07,.06,.07,0,j,0,.03)}});
      [[0,-2.2,3.6,.5],[0,2.2,3.6,.5],[-2.2,0,.5,3.4],[2.2,0,.5,3.4]].forEach(([a,b,w,d],i)=>{if(i==1)return;k.as('leaf',()=>k.p('c',0x24402a,'box',a,.38,b,w,.76,d,0,0,0,.08))});
      [[-2.2,-2.2],[2.2,-2.2],[-2.2,2.2],[2.2,2.2]].forEach(([a,b])=>k.as('leaf',()=>{k.p('c',0x2a4a30,'sph',a,.95,b,.42,.42,.42,0,0,0,.06);k.p('c',0x2a4a30,'cyl8',a,.4,b,.1,.8,.1,0,0,0,0)}));
      k.as('stone',()=>{k.p('c',TWC.stoneL,'cyl8',0,.35,0,.22,.7,.22,0,0,0,.04);k.p('c',TWC.stone,'cyl8',0,.75,0,.55,.1,.55,0,0,0,.03)});k.p('c',0x3a5a8a,'cyl8',0,.81,0,.45,.02,.45,0,0,0,0);
      [[.25,.86,.1],[-.2,.86,-.15]].forEach(([a,y,b])=>{k.p('c',0x2a2a30,'sph',a,y,b,.06,.05,.08,0,0,0,0)})}))},
  col(D){if(!D.sp.length)return [];const [x,z]=D.sp[0],o=[[x,z,.6],[x-2.2,z-2.2,.4],[x+2.2,z-2.2,.4],[x-2.2,z+2.2,.4],[x+2.2,z+2.2,.4]];
    for(let t=-1.5;t<=1.51;t+=.6){o.push([x+t,z-2.2,.3]);o.push([x-2.2,z+t,.3]);o.push([x+2.2,z+t,.3])}return o}},   // hedges: a row of small circles each
 {k:'beacon',i:'🗼',n:'Great Beacon',d:'A stone beacon tower in the south ward, its great fire seen from the Portal Road.',
  spf:F=>F.SZ>42?[[-14,35.6]]:[],
  b(k,D){D.sp.forEach(([x,z])=>k.at(x,0,z,()=>{twStoneRing(k,TWC.stone,0,0,1.1,0,3.6,.34);k.as('ashlar',()=>k.p('c',TWC.stoneL,'cyl8',0,3.68,0,1.4,.16,1.4,0,0,0,.02));
      for(let i=0;i<8;i++){const a=i/8*6.283;k.as('stone',()=>k.p('c',TWC.stoneD,'box',Math.cos(a)*1.25,3.95,Math.sin(a)*1.25,.32,.36,.32,0,-a,0,.06))}
      [0,1,2].forEach(i=>{const a=i/3*6.283+.4;k.L('m',TWC.iron,[Math.cos(a)*.7,3.76,Math.sin(a)*.7],[Math.cos(a)*.35,4.5,Math.sin(a)*.35],.05,'cyl6',0)});
      k.p('m',TWC.iron,'frus8',0,4.6,0,.75,.35,.75,Math.PI,0,0,0);k.p('c',0x2a1a10,'cyl8',0,4.72,0,.6,.06,.6,0,0,0,0);
      twDoor(k,0,0,1.14,.7,1.5,0);const ban=TOWNS[0].pal.ban||0x8a2a3a;kdBanner(k,0,3.2,1.16,0,ban,.7,1.6)}))},
  an(g,D){return D.sp.length?dc148Fire(g,[[D.sp[0][0],4.75,D.sp[0][1],2.6],[D.sp[0][0]+.3,4.75,D.sp[0][1]-.2,1.6],[D.sp[0][0]-.3,4.75,D.sp[0][1]+.25,1.7]],[]):null},
  col(D){return D.sp.length?[[D.sp[0][0],D.sp[0][1],1.35]]:[]}});
DECO103.forEach(D=>{const c=DC148_COST[D.k];if(c){D.g=c.g||0;D.m=c.m||null}});
// ---------------- buying with gold and materials ----------------
function dc148Has(D){if(gold<(D.g||0))return false;for(const k in D.m||{})if((mats[k]||0)<D.m[k])return false;return true}
dcBuy103=function(k){const D=DECO103.find(q=>q.k==k);if(!D||SH.deco[k]!=null)return;if(!dc148Has(D))return say('Not enough '+((gold<(D.g||0))?'gold':'materials')+' for '+D.n+'.');
  gold-=D.g||0;for(const m in D.m||{})mats[m]-=D.m[m];SH.deco[k]=1;dc103Sync();
  banner(D.i+' '+D.n.toUpperCase(),D.d,(D.spf&&!D.spf(dcF104()).length?'It appears once Duskhold has grown over its square · ':'')+'You can switch it off and on in the Decorations tab');sfx('power');hud();try{saveGame(true)}catch(_){}};
function dc148Price(D){const L=[];if(D.g)L.push('<span class="'+(gold>=D.g?'':'no')+'">🪙 '+D.g+'</span>');
  for(const k in D.m||{}){const I=matInfo(k);L.push('<span class="'+((mats[k]||0)>=D.m[k]?'':'no')+'" title="'+I[0]+' · you have '+(mats[k]||0)+'">'+I[1]+' '+D.m[k]+'</span>')}return L.join(' ')}
dcRender103=function(){const own=DECO103.filter(D=>SH.deco[D.k]!=null).length,on=DECO103.filter(D=>dcOn103(D.k)).length,F=dcF104();
  const big={obelisk:1,torches:1,pavilion:1,oak:1,garden:1,beacon:1};
  const rows=DECO103.slice().sort((a,b)=>(big[b.k]?1:0)-(big[a.k]?1:0)).map(D=>{const has=SH.deco[D.k]!=null,o=dcOn103(D.k),wait=D.spf&&!D.spf(F).length&&big[D.k];
    return `<div class="dccard${has?' own':''}${o?' on':''}${big[D.k]?' big':''}"><div class="dci">${D.i}</div><div class="dct"><b>${D.n}${big[D.k]?' <i class="dcnew">new</i>':''}</b><small>${D.d}${wait?' <em>Appears when Duskhold grows over its square.</em>':''}</small></div><div class="dca">${has?`<button class="dctg${o?' on':''}" data-dct="${D.k}" aria-pressed="${o}">${o?'On':'Off'}</button>`:`<button class="pri dcbuy" data-dcb="${D.k}" ${dc148Has(D)?'':'disabled'}>${dc148Price(D)}</button>`}</div></div>`}).join('');
  $('xwB').innerHTML=`<div class="mut dcsum">${own} of ${DECO103.length} owned · ${on} shown. Many cost only wood, stone and fibre: the outskirts and the first portal zone have plenty.</div><div class="dcgrid">${rows}</div>`;
  $('xwF').innerHTML='<span class="mut dtl">Bought once, kept forever. Switch any decoration off to hide it, and on again whenever you like.</span>'};
document.head.insertAdjacentHTML('beforeend',`<style>
#xw .dcbuy{white-space:nowrap;display:inline-flex;gap:6px;align-items:center}#xw .dcbuy span.no{color:#ff8a7a}
#xw .dccard.big{border-color:rgba(201,162,74,.5);background:linear-gradient(90deg,rgba(201,162,74,.1),rgba(255,255,255,.02))}
#xw .dcnew{font-style:normal;font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;padding:1px 6px;border-radius:99px;background:#c9a24a;color:#1a1208;margin-left:4px;vertical-align:middle}
#xw .dct em{display:block;color:#d8b860;font-style:normal}
</style>`);
try{dc103Sync()}catch(e){console.warn('v148 decorations',e)}
