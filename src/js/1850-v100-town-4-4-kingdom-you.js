// ================= v100 town (4/4): a kingdom you can see — structures instead of flags =================
// Every Steward upgrade already raises its own structure per level (KDU in zzM_town.js: Training Grounds, Scholar's Tower,
// Treasury, Beast Den, Hatchery; Bastion Walls = the whole ring in zzN_zz_town1.js). What was only cloth is replaced:
//  * the six upgrade banners by the fountain (one ring per level) are gone; the Steward's desk stays.
//  * total upgrade levels (0..18) no longer hang banners/pennants. Instead Duskhold grows buildings:
//      ≥2  braziers on stone plinths round the fountain                     (the old ≥4 braziers, sooner)
//      ≥5  a granary with a windmill behind the market's west row            (sails turn)
//      ≥8  a chapel with a bell tower behind the market's east row
//      ≥11 a guard barracks with a watch platform in the courtyard ward (west)
//      ≥14 a great hall / keep tower at the courtyard ward (east), beacons on the south gate towers
//      ≥17 statues of the fallen flank the inner gate, copper (verdigris) roofs on the chapel and keep
// Each tier is one baked kit (KDP2|tier) added to T.g; colliders are boxes per structure.
var TWN100_PR=[2,5,8,11,14,17];
function TWN100_prK(k,lv){const ban=TOWNS[0].pal.ban||0x7a2230;
  // ≥2: braziers on plinths round the fountain
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{const x=sx*4.6,z=sz*4.6;twStones(k,TWC.stone,x-.35,z,x+.35,z,0,.45,.7,.35);kdBrazier(k,x,z,.45,.9)});
  if(lv>=2){// granary on stilts + windmill, behind the west row (x -16, z 26..36)
    k.at(-16.2,0,28.5,()=>{[-1,1].forEach(s=>[-1,1].forEach(q=>{twStones(k,TWC.stone,s*1.3-.25,q*1.6,s*1.3+.25,q*1.6,0,.7,.5,.3);k.p('c',TWC.stoneL,'cyl8',s*1.3,.78,q*1.6,.4,.12,.4,0,0,0,.03)}));
      k.as('board',()=>k.p('c',TWC.wood,'box',0,.95,0,3.2,.14,3.8,0,0,0,.02));twPlanks(k,0x6a4a30,-1.5,1.8,1.5,1.8,1.0,3.0,.26);twPlanks(k,0x6a4a30,-1.5,-1.8,1.5,-1.8,1.0,3.0,.26);
      twPlanks(k,0x6a4a30,-1.5,-1.8,-1.5,1.8,1.0,3.0,.26);twPlanks(k,0x6a4a30,1.5,-1.8,1.5,1.8,1.0,3.0,.26);twGable(k,TWC.thatch,3.2,3.8,1.4,.3,3.0);
      k.as('straw',()=>{k.p('c',0xc8a850,'cyl8',2.1,.4,1.2,.4,.8,.4,0,0,Math.PI/2,.12);k.p('c',0xc8a850,'cyl8',2.1,.4,.3,.4,.8,.4,0,.2,Math.PI/2,.12)});
      [[-2.2,-.5],[-2.2,.2],[-2.5,-.15]].forEach(([x,z],i)=>k.as('cloth',()=>k.p('c',0xd8c8a0,'sph',x,.3+(i==2?.35:0),z,.3,.34,.26,0,i,0,.08)))});
    k.at(-16.5,0,35.5,()=>{twStoneRing(k,0x8a8478,0,0,1.25,0,4.6,.34);k.as('stone',()=>k.p('c',TWC.stoneL,'cyl8',0,4.65,0,1.4,.14,1.4,0,0,0,.03));twCone(k,0x5a4632,0,4.7,0,1.55,1.8);
      twDoor(k,1.3,0,0,.75,1.4,Math.PI/2);twWindow(k,0,3.1,1.28,.32,.42,0,0xffd27a);
      k.as('wood',()=>{k.p('c',TWC.woodD,'cyl8',1.62,5.1,0,.16,.35,.16,0,0,Math.PI/2,0)})})}
  if(lv>=3){// chapel with a bell tower, behind the east row (x 16, z 26..38)
    k.at(16.4,0,30.5,()=>{twHall(k,{w:3.8,d:5.6,h:3.2,stoneWalls:1,wc:0x7a766c});k.at(0,0,0,()=>twGable(k,lv>=6?0x3e6a5e:0x3e3a48,5.6,3.8,2.2,.35,3.2),Math.PI/2);
      [-1.6,0,1.6].forEach(z=>[-1,1].forEach(s=>twWindow(k,s*1.94,2.0,z,.4,1.1,s*Math.PI/2,0xe8c87a)));
      twDoor(k,0,.36,-2.82,1.1,1.9,Math.PI);for(let i=0;i<7;i++){const a=Math.PI*i/6;k.p('c',TWC.stoneL,'box',Math.cos(a)*.72,2.25+Math.sin(a)*.5,-2.86,.22,.22,.16,0,0,a+Math.PI/2,.08)}
      k.at(0,0,4.0,()=>{twStones(k,TWC.stone,-1.1,1.1,1.1,1.1,0,6.4,.4,.5);twStones(k,TWC.stone,-1.1,-1.1,1.1,-1.1,0,6.4,.4,.5);twStones(k,TWC.stone,-1.1,-1.1,-1.1,1.1,0,6.4,.4,.5);twStones(k,TWC.stone,1.1,-1.1,1.1,1.1,0,6.4,.4,.5);
        [-1,1].forEach(s=>[-1,1].forEach(q=>k.L('c',TWC.stoneD,[s*1.1,6.4,q*1.1],[s*1.1,7.6,q*1.1],.18,'box')));k.as('ashlar',()=>{k.p('c',TWC.stoneL,'box',0,6.45,0,2.6,.16,2.6,0,0,0,.02);k.p('c',TWC.stoneL,'box',0,7.65,0,2.6,.16,2.6,0,0,0,.02)});
        k.as('brass',()=>k.p('m',0xb08a3a,'frus8',0,6.95,0,.55,.7,.55,Math.PI,0,0,0));k.L('m',TWC.iron,[-.9,7.45,0],[.9,7.45,0],.04,'box',0);
        twCone(k,lv>=6?0x3e6a5e:0x3e3a48,0,7.75,0,1.7,2.8);k.L('m',TWC.iron,[0,10.4,0],[0,11.4,0],.04,'cyl6',0);k.L('m',TWC.iron,[-.32,11.05,0],[.32,11.05,0],.035,'box',0)})})}
  if(lv>=4){// guard barracks + watch platform, courtyard ward west (x -16, z 60..70)
    k.at(-15.6,0,63.5,()=>{twHall(k,{w:4.6,d:4.0,h:2.6});twGable(k,0x5a4a3e,4.6,4.0,1.5,.35,2.6);twDoor(k,1.0,.36,2.02,1.0,1.7,0);twWindow(k,-1.0,1.5,2.04,.6,.5,0,0xffb347);
      kdBanner(k,0,2.45,2.08,0,ban,.6,1.0);
      [[-1.5,3.4],[1.5,3.4]].forEach(([x,z])=>{k.as('bark',()=>k.L('c',TWC.woodD,[x,-.2,z],[x,1.9,z],.07,'log'));k.as('wood',()=>k.L('c',TWC.woodD,[x-.5,1.4,z],[x+.5,1.4,z],.045,'box'));k.as('straw',()=>k.p('c',0xc8a850,'cyl8',x,1.15,z,.24,.7,.24,0,0,0,.1));k.p('c',0xb89a50,'dod',x,1.75,z,.18,.2,.18)})});
    k.at(-18.3,0,69.5,()=>{[-1,1].forEach(s=>[-1,1].forEach(q=>k.as('bark',()=>k.L('c',TWC.woodD,[s*.9,-.2,q*.9],[s*.8,4.4,q*.8],.13,'log'))));k.as('board',()=>k.p('c',TWC.wood,'box',0,3.6,0,2.4,.14,2.4,0,0,0,.02));
      [-1,1].forEach(s=>{twPlanks(k,TWC.wood,-1.1,s*1.1,1.1,s*1.1,3.6,4.2,.22);twPlanks(k,TWC.wood,s*1.1,-1.1,s*1.1,1.1,3.6,4.2,.22)});k.as('shingle',()=>k.p('c',0x6a4a32,'cone4',0,5.4,0,1.7,1.2,1.7,0,Math.PI/4,0,.06));
      [-1,1].forEach(s=>k.as('wood',()=>k.L('c',TWC.woodD,[s*.9,.3,.9],[-s*.9,3.4,.9],.05,'box')));kdBrazier(k,0,0,3.68,.55)})}
  if(lv>=5){// great hall with a keep tower, courtyard ward east (x 16, z 60..72); beacons over the south gate
    k.at(15.8,0,64.5,()=>{twHall(k,{w:4.4,d:6.4,h:3.0,stoneWalls:1});k.at(0,0,0,()=>twGable(k,lv>=6?0x3e6a5e:0x45403e,6.4,4.4,2.0,.38,3.0),Math.PI/2);
      twDoor(k,-2.22,.36,0,1.1,1.9,-Math.PI/2);[-2,2].forEach(z=>twWindow(k,-2.24,1.8,z,.5,.8,-Math.PI/2,0xffd27a));kdBanner(k,-2.3,2.8,-1,-Math.PI/2,ban,.6,1.2);kdBanner(k,-2.3,2.8,1,-Math.PI/2,ban,.6,1.2);
      k.at(1.6,0,4.4,()=>{twStoneRing(k,TWC.stoneD,0,0,1.6,-.3,.6,.36);twStoneRing(k,TWC.stone,0,0,1.45,.6,7.6,.32);
        const n=12;for(let i=0;i<n;i++)if(i%2==0){const a=(i+.5)/n*6.283;k.p('c',TWC.stone,'box',Math.cos(a)*1.55,8.0,Math.sin(a)*1.55,.32,.7,.7,0,-a,0,.1)}
        k.as('stone',()=>k.p('c',TWC.stoneL,'cyl8',0,7.65,0,1.75,.16,1.75,0,0,0,.02));[1.5,3.4,5.4].forEach((y,i)=>twWindow(k,Math.cos(i*2.1)*1.47,y+1,Math.sin(i*2.1)*1.47,.3,.55,-i*2.1+Math.PI/2,0xffd27a));
        k.L('c',TWC.woodD,[0,7.6,0],[0,9.6,0],.05,'cyl6',0);k.as('cloth',()=>{k.p('c',ban,'box',.6,9.2,0,1.1,.6,.03,0,0,0,.06);k.p('c',ban,'tri',1.3,9.2,0,.6,.3,.03,0,0,-Math.PI/2,.05)});kdBrazier(k,-.6,-.6,7.73,.7)})});
    [-1,1].forEach(s=>kdBrazier(k,s*2.3,TOWNS[0].sz-0,4.65,.9))}
  if(lv>=6){// statues of the fallen flank the inner gate (inside the courtyard ward)
    [-1,1].forEach(s=>k.at(s*4.4,0,TWN100_IW+3.0,()=>{twStones(k,TWC.stone,-.6,0,.6,0,0,1.0,1.2,.5);k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',0,1.05,0,1.4,.12,1.4,0,0,0,.02));
      k.as('stone',()=>{k.p('c',0x8a8a90,'cyl8',0,1.9,0,.3,1.4,.24,0,0,0,.04);k.p('c',0x8a8a90,'ico',0,2.8,0,.22,.24,.22,0,0,0,.02);k.p('c',0x8a8a90,'box',0,2.42,0,.8,.24,.36,0,0,0,.03);
        k.p('c',0x8a8a90,'box',s*.28,2.0,.25,.1,1.6,.06,0,0,0,0);k.p('c',0x8a8a90,'box',s*.28,2.5,.25,.42,.07,.07,0,0,0,0);k.p('c',0x7a7a80,'cyl8',-s*.42,1.9,.1,.32,.08,.42,Math.PI/2,0,s*.2,.02)});
      kdBrazier(k,s*1.2,.6,0,.7)}))}}
function kdPrestige(T,P){const K=kdState(),o=kdOld(T);o.ban.forEach(q=>q.visible=false);let lv=0;TWN100_PR.forEach((t,i)=>{if(P>=t)lv=i+1});if(K.pr===lv)return null;K.pr=lv;
  if(K.pg){T.g.remove(K.pg);K.pg=null}if(!lv){kdCol(T,K.pcol=K.pcol||[],[]);return []}
  const key='KDP2|'+lv;let k=null;if(!twHas(key)){k=twKit(521+lv);TWN100_prK(k,lv)}const g=twGroup(k,key);g.name='kdPrestige';T.g.add(g);K.pg=g;
  const lamps=[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sz])=>[T.cx+sx*4.6,T.ph+1.5,T.cy+sz*4.6]),c=[];
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>c.push({x:T.cx+sx*4.6,z:T.cy+sz*4.6,r:.42}));
  const B=(x,z,hx,hz)=>c.push({x:T.cx+x,z:T.cy+z,hx,hz});
  if(lv>=2){B(-16.2,28.5,1.75,2.1);B(-16.5,35.5,1.45,1.45)}
  if(lv>=3){B(16.4,30.5,2.1,3.0);B(16.4,34.5,1.3,1.3)}
  if(lv>=4){B(-15.6,63.5,2.5,2.2);B(-18.3,69.5,1.1,1.1);c.push({x:T.cx-17.1,z:T.cy+66.9,r:.3},{x:T.cx-14.1,z:T.cy+66.9,r:.3})}
  if(lv>=5){B(15.8,64.5,2.4,3.4);c.push({x:T.cx+17.4,z:T.cy+68.9,r:1.7})}
  if(lv>=6)[-1,1].forEach(s=>B(s*4.4,TWN100_IW+3.0,.75,.75));
  kdCol(T,K.pcol=K.pcol||[],c);if(lv>=5)[-1,1].forEach(s=>lamps.push([T.cx+s*2.3,T.ph+5.5,T.cy+T.sz]));return lamps}
// the windmill's sails (one small group, turned by TANIM)
var TWN100_MILL=null;
function TWN100_mill(T,on){if(!TWN100_MILL&&on){let k=null;if(!twHas('TWNSAIL')){k=twKit(931);for(let i=0;i<4;i++){const a=i/4*6.283+.4,c=Math.cos(a),s=Math.sin(a);k.as('wood',()=>k.L('c',TWC.woodD,[0,0,0],[c*2.6,s*2.6,0],.06,'box'));
        for(let j=0;j<5;j++){const r=.55+j*.42,o=.3;k.as('cloth',()=>k.p('c',j%2?0xd8ccb0:0xc8b898,'box',c*r-s*o,s*r+c*o,.03,.4,.5,.02,0,0,a,.02))}}
      k.as('wood',()=>k.p('c',TWC.woodD,'cyl8',0,0,0,.2,.3,.2,Math.PI/2,0,0,0))}
    const g=twGroup(k,'TWNSAIL');g.position.set(T.cx-16.5+1.85,T.ph+5.1,T.cy+35.5);g.rotation.order='YXZ';g.rotation.y=Math.PI/2;g.name='mill';T.g.parent.add(g);TWN100_MILL=g;
    TANIM.push({x:g.position.x,z:g.position.z,f:now=>{if(TWN100_MILL&&TWN100_MILL.visible)TWN100_MILL.rotation.z=now/1600}})}
  if(TWN100_MILL)TWN100_MILL.visible=!!on}
// kdSync: same as before, but the prestige lamps follow the new tiers, and the windmill
function kdSync(){const T=TOWNS[0];if(!T||!T.g)return;const K=kdState();let lamps=[];
  const wl=kdLv('walls');if(K.wl!==wl)K.wlamps=kdWalls(T,wl)||[];lamps=lamps.concat(K.wlamps||[]);
  ['train','tower','treas','den','hatch'].forEach(k=>kdUp(T,k,kdLv(k)));
  const P=SHU.reduce((a,u)=>a+kdLv(u.k),0),pl=kdPrestige(T,P);if(pl)K.plamps=pl;lamps=lamps.concat(K.plamps||[]);
  try{TWN100_mill(T,K.pr>=2)}catch(e){console.warn('v100 mill',e)}
  kdLamps(lamps)}
// the upgrade banners by the fountain are gone: shBuild only places the Steward and his desk
{const f=shBuild;shBuild=function(){const r=f.apply(this,arguments);try{for(const k in SHM.pil){scene.remove(SHM.pil[k].g);SHM.pil[k].g.visible=false}}catch(_){}return r}}
try{for(const k in SHM.pil)scene.remove(SHM.pil[k].g);if(KGD){KGD.pr=-1;kdSync()}}catch(e){console.warn('v100 kingdom',e)}
// the Steward's footer text
{const f=XR.hold;XR.hold=function(){const r=f.apply(this,arguments);try{if(shTab!='shops')$('xwF').innerHTML='<span class="mut dtl">Upgrades are permanent and every level raises something new in Duskhold: walls and gatehouses, the training yard, the scholar\'s tower, the treasury, the beast den, the hatchery — and the more you build in total, the granary, chapel, barracks, keep and statues. Higher levels need more materials and defeated Sovereigns.</span>'}catch(_){}return r}}

$('talBtn').onclick=openTal;
try{paceWrap()}catch(err){console.error('pace wrap',err)}
ui();refreshGear();
