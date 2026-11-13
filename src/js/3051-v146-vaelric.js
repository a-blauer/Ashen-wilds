// ================= v146 Lord Vaelric to the Vorraxis standard (model, Phase II den, signature mechanic, effects) =================
// Builds on 1976 (his v110/v112 model, poses and moves stay; this file adds to them).
//  * Model (vlrBuild wrapper, about 2× the triangles): a sculpted face (brow, sockets, cheekbones, nose bridge, lips, chin)
//    instead of the plain head loft; long white hair on three chained joints that sway (springs); gold filigree along the
//    pauldron edges, a plackart with a blood sigil, a chain-mail skirt, engraved rune lines on the greaves, a rune-etched
//    blade that drips blood; a heavier cape (24 folds a panel, tattered hem strips, an embroidered gold hem band); Phase II
//    adds a blood halo over the crown and a slowly turning blood glyph under his feet.
//  * Motion: cape panels, tabard, hair and wings follow through on springs (3050 sk146Spring) — they swing out on his spins
//    and trail his lunges.
//  * Phase II den change, "The Crimson Tide": blood rain falls over the hall and three wide channels of blood sweep slowly
//    round the floor (the middle stays dry). Standing in a channel bleeds you (damage over time, slowed). Keep moving round.
//  * Signature mechanic, Blood Covenant (Phase II): he rises over the hall, arms wide, and four golden chalices rise on the
//    pedestals, each tethered to him by a stream of blood — he is warded (80% less damage). Shatter all four and the covenant
//    breaks: he crashes down, BROKEN (a long stagger). If any chalice still stands when the rite ends he drinks (heals 12%) and
//    unleashes Exsanguinate: two rings of blood sweep out across the whole hall — dash through each one.
//  * Effects: Blood Wave crescents layered with a dark core and spray, Skyfall spears that crack the floor, Sanguine Nova
//    throws up a ring of blood geysers, Bat Step is a real swarm of bats, every sword hit sprays blood.
var VLR146={col:0xff2040,dk:0x5a0010,on:1};
{const f=vlrBuild;vlrBuild=function(R,e){}}
if(SVB[5])SVB[5].build=vlrBuild;
// springs: cape panels, tabard, hair, wings
{const B=SVB[5];if(B){B.spr={cp0:[55,9,1.4],cp1:[42,7,1.9],cp2:[34,6,2.4],tab:[70,11,1],hr0:[60,10,1.3],hr1:[45,8,1.6],hr2:[36,7,1.9],wgL:[48,8,.7],wgR:[48,8,.7],wfL:[40,7,.8],wfR:[40,7,.8]};
  // post: the halo, the glyph, blood dripping from the blade
  const p0=B.post;B.post=function(e,S,dt,now){p0&&p0.apply(this,arguments);try{const R=S.R,on=S.ph>1;if(R.v146halo){R.v146halo.visible=on;R.v146halo.rotation.z+=dt*.8}
    if(R.v146gly){const m=R.v146gly.material;m.opacity+=((on?.55:0)-m.opacity)*Math.min(1,dt*2);R.v146gly.rotation.y+=dt*.35;R.v146gly.visible=m.opacity>.01}
    if(Math.random()<dt*(on?3:1.2)&&!S.gone){const p=svWP(e,'swd',0,.06,2.3);sk146Drops(p,0x8a0018,1,.2,.1,{s:.05,splats:1,dc:0x3a0008})}}catch(_){}}}}
// ---------------- new poses ----------------
Object.assign(VLRP,{
  covRise:{root:[0,0,0,0,1.5,0],hips:[-.1,0,0],spine:[-.12,0,0],chest:[-.3,0,0],head:[-.45,0,0],shR:[-.35,0,-1.35],elR:[-.25,0,0],hdR:[1.0,0,0],shL:[-.35,0,1.35],elL:[-.25,0,0],hdL:[-.2,0,0],
    thL:[.15,0,.05],knL:[.5,0,0],ftL:[.4,0,0],thR:[.05,0,-.05],knR:[.35,0,0],ftR:[.4,0,0],cp0:[.5,0,0],cp1:[.2,0,0],tab:[.15,0,0],wgL:[0,-.5,.35],wgR:[0,.5,-.35]},
  covDrink:{root:[0,0,0,0,1.3,0],hips:[.15,0,0],spine:[.15,0,0],chest:[.25,0,0],head:[.35,0,0],shR:[-1.2,0,-.5],elR:[-1.3,0,0],hdR:[.8,0,0],shL:[-1.2,0,.5],elL:[-1.3,0,0],hdL:[.3,0,0],
    thL:[-.3,0,0],knL:[.9,0,0],thR:[-.2,0,0],knR:[.8,0,0],cp0:[.2,0,0],wgL:[0,.3,.6],wgR:[0,-.3,-.6]},
  crash:{hips:[.18,0,.12,0,-.8,0],spine:[.22,0,.08],chest:[.28,0,0],head:[.4,0,.22],shR:[.35,0,-.25],elR:[-.25,0,0],hdR:[1.3,0,0],shL:[.3,0,.35],elL:[-.35,0,0],thL:[-1.5,0,0],knL:[1.9,0,0],thR:[-.9,0,0],knR:[2.0,0,0],ftR:[-.35,0,0],cp0:[.45,0,0],cp1:[.15,0,0],wgL:[0,.4,.6],wgR:[0,-.4,-.6]}});
// ---------------- the den: Phase II "The Crimson Tide" ----------------
function vlr146TideTex(){if(VLR146.tt)return VLR146.tt;const cv=document.createElement('canvas');cv.width=128;cv.height=256;const g=cv.getContext('2d');g.fillStyle='#5a0010';g.fillRect(0,0,128,256);
  for(let k=0;k<90;k++){const x=Math.random()*128,y=Math.random()*256,l=20+Math.random()*60;g.strokeStyle=`rgba(${150+Math.random()*80|0},${Math.random()*20|0},${20+Math.random()*20|0},${.3+Math.random()*.4})`;g.lineWidth=1+Math.random()*3;g.beginPath();g.moveTo(x,y);g.lineTo(x+(Math.random()-.5)*8,y+l);g.stroke()}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;return VLR146.tt=t}
function vlr146TideStart(A,e){const D=sk146Den(A);if(D.ph2)return;D.ph2=1;const y0=GH(A.cx,A.cz),grp=new THREE.Group();grp.position.set(A.cx,y0+.13,A.cz);grp.userData.lpsSkip=1;
  const tex=vlr146TideTex(),m=new THREE.MeshStandardMaterial({color:0x8a0a1c,map:tex,emissive:0x3a0008,emissiveMap:tex,roughness:.12,metalness:.35,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3});m.userData.noFade135=1;
  const W=.46;D.tide={grp,m,a:0,W,n:3,r0:3.2,r1:ARENA_R-.4,dT:0};for(let k=0;k<3;k++){const s=new THREE.Mesh(svG('v46td',()=>new THREE.RingGeometry(3.2,ARENA_R-.4,40,3,-W/2,W).rotateX(-Math.PI/2)),m);s.rotation.y=k/3*6.283;s.renderOrder=16;grp.add(s);
    // bright edges so the channel reads on the red marble
    [-W/2,W/2].forEach(th=>{const d=new THREE.Vector3(Math.cos(th),0,-Math.sin(th)),ed=new THREE.Mesh(svG('v46te',()=>new THREE.PlaneGeometry(.14,ARENA_R-.4-3.2).rotateX(-Math.PI/2)),D.tide.em||(D.tide.em=new THREE.MeshBasicMaterial({color:0xff2a40,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})));
      ed.position.copy(d.multiplyScalar((3.2+ARENA_R-.4)/2));ed.position.y=.02;ed.rotation.y=Math.atan2(d.x,d.z);ed.renderOrder=17;s.add(ed)})}
  sk146DenAdd(A,grp);D.rain=sk146DenAdd(A,sk146Weather(A,'rain',0xff3048,700));
  try{banner('🩸 THE CRIMSON TIDE','Blood rains on the hall — channels of blood sweep the floor','Keep out of the blood')}catch(_){}
  svSnd('splash',1.2,.5);sk146Flash(new THREE.Vector3(A.cx,y0,A.cz),VLR146.col,4,24,1200)}
function vlr146TideTick(A,e,dt){const D=A.s146,T=D&&D.tide;if(!T)return;T.m.opacity=Math.min(.9,T.m.opacity+dt*.5);if(T.em)T.em.opacity=T.m.opacity*(.7+.3*Math.sin(nowP()/180));T.a+=dt*.16;T.grp.rotation.y=T.a;const tex=T.m.map;tex.offset.y-=dt*.25;
  if(Math.random()<dt*14){const k=(Math.random()*3)|0,an=Math.PI/2+T.a+k/3*6.283+(Math.random()-.5)*T.W,r=T.r0+Math.random()*(T.r1-T.r0);burst(new THREE.Vector3(A.cx+Math.sin(an)*r,GH(A.cx,A.cz)+.25,A.cz+Math.cos(an)*r),0xc0102a,1,.4,.6,.5)}
  if(!sk146In(A)||!e||e.dead)return;const P=pl.position,dx=P.x-A.cx,dz=P.z-A.cz,d=Math.hypot(dx,dz);if(d<T.r0||d>T.r1)return;
  // the channel's angle in the world: the group turns by +a about y; a point's local angle = atan2(x,z) − a
  let inC=false;const pa=Math.atan2(dx,dz);for(let k=0;k<3;k++){if(Math.abs(svAng(pa-(Math.PI/2+T.a+k/3*6.283)))<T.W/2){inC=true;break}}
  T.dT-=dt;if(inC&&T.dT<=0&&!(hero.iv>0)){T.dT=.8;hitHero(e,.14,'m');dqDebuff('Bleeding','🩸',{mspd:-.15},1400,'Standing in blood: bleeding, −15% move speed');D.deb='Bleeding';sk146Drops(gY(P,.3),0xa0101e,6,1.5,2.5,{splats:1})}}
{const B=SVB[5];if(B){const t0=B.denTick,c0=B.denClear;
  B.denTick=function(A,e,dt,now){try{t0&&t0.apply(this,arguments)}catch(_){}try{if(A.f&&e&&e.sv&&e.sv.ph>1&&!sk146Den(A).ph2)vlr146TideStart(A,e);vlr146TideTick(A,e,dt)}catch(err){if(!SK146.err++)console.error('v146 tide',err)}};
  B.denClear=function(A,won){try{c0&&c0.apply(this,arguments)}catch(_){}sk146DenClear(A)}}}
// ---------------- the signature: Blood Covenant ----------------
function vlr146Chalice(){const g=new THREE.Group(),gm=new THREE.MeshStandardMaterial({color:0xd8a840,metalness:.8,roughness:.28,flatShading:true,emissive:0x2a1406});gm.userData.lps=1;
  const prof=[[.0,0],[.24,0],[.26,.04],[.12,.08],[.06,.16],[.05,.36],[.09,.42],[.06,.48],[.08,.52],[.24,.62],[.34,.78],[.36,.92],[.33,.94],[.3,.8],[0,.66]].map(([x,y])=>new THREE.Vector2(x,y));
  const cup=new THREE.Mesh(svG('v46ch',()=>new THREE.LatheGeometry(prof,12).toNonIndexed()),gm);cup.scale.setScalar(1.15);cup.castShadow=true;g.add(cup);
  for(let k=0;k<4;k++){const a=k/4*6.283,j=new THREE.Mesh(svG('v46cj',()=>new THREE.OctahedronGeometry(.045,0)),new THREE.MeshBasicMaterial({color:0xff2040}));j.position.set(Math.sin(a)*.36,.86,Math.cos(a)*.36);g.add(j)}
  const bl=new THREE.Mesh(svG('v46cb',()=>new THREE.CircleGeometry(.36,14).rotateX(-Math.PI/2)),new THREE.MeshStandardMaterial({color:0x8a0018,emissive:0x5a0010,roughness:.1,metalness:.3}));bl.position.y=1.02;g.add(bl);
  const gl=kqSpr(0xff2040,1.4);gl.position.y=1.1;g.add(gl);return {g,gm,bl,gl}}
function vlr146CovStart(c){const e=c.e,S=c.S,A=c.A;if(!A)return;S.dr=.2;const D=sk146Den(A),ped=(typeof D5!='undefined'&&D5.ped&&D5.ped.length===4)?D5.ped:[0,1,2,3].map(k=>{const a=k/4*6.283+.78;return [A.cx+Math.cos(a)*8.4,A.cz+Math.sin(a)*8.4]});
  const L=ped.map(([x,z],k)=>{const C=vlr146Chalice();C.g.position.y=-1.4;let t=0;
    return {x,z,n:'Blood Chalice',frac:.016,mesh:C.g,hbY:2.6,hbS:.8,cupY:2.2,
      tick(pe,dt,now){t+=dt;C.g.position.y=-1.4+(1.13+1.4)*svEase.o(Math.min(1,t/.9));C.g.rotation.y+=dt*.7;C.gl.scale.setScalar(1.2+.35*Math.sin(now/140+k));if(Math.random()<dt*6)burst(gY(pe.m.position,2.2),0xff2040,1,.3,.8,.5)},
      die(pe,killed){if(killed){const p=gY(pe.m.position,2);sk146Debris(p,C.gm,10,.07,4,5,1.6);sk146Drops(p,0xa0101e,22,4,5,{splats:5});burst(p,0xff2040,40,3,3,.7);sk146Flash(p,0xff3048,3.5,9,500);popT(pe.m.position,'🩸 SHATTERED','#ffb0c0');svSnd('crack',1,1.3);svSnd('bell',.5,1.6)}C.gm.dispose()}}});
  const P=sk146Props(A,L);c.M.an.props=P;D.props=(D.props||[]).concat(P);c.M.an.teth=P.map(p=>sk146Tether(p,e,'chest',0xff2040,.1));
  svSnd('bell',1,.7);svSnd('charge',.8,.5);sk146Wall(c.m.position,VLR146.col,6,4,.8);sk146Flash(c.m.position,VLR146.col,5,16,900);
  try{banner('🩸 BLOOD COVENANT','Four chalices feed him — he is warded','Shatter all four before the rite ends!')}catch(_){}say('🩸 Lord Vaelric binds himself to the chalices: shatter all four!')}
function vlr146CovCleanup(c){const S=c.S,M=c.M;S.dr=0;(M&&M.an.teth||[]).forEach(t=>t.stop());if(M)M.an.teth=[];(M&&M.an.props||[]).forEach(p=>{if(!p._gone){burst(gY(p.m.position,2),0x5a0010,14,1.5,1.5,.6);dqPropGone(p,false)}})}
function vlr146CovEnd(c,broken){const e=c.e,M=c.M;if(M.an.done2)return;M.an.done2=1;
  if(broken){vlr146CovCleanup(c);svEndMove(e,true);svCast(e,'broken');try{banner('💔 THE COVENANT BREAKS','Lord Vaelric crashes down','Strike now!')}catch(_){}return}
  // the rite completes: he drinks, then Exsanguinate
  sk146Heal(e,.12,0xff3048);vlr146CovCleanup(c);const p=c.m.position.clone();svSnd('roar',1,.9);shake(.4);
  [0,.95].forEach((d,k)=>setTimeout(()=>{if(e.dead||!AF)return;sk146RingWave(e,p,1,ARENA_R+1,1.7,1.3,1.6,VLR146.col,{h:2.2,on:()=>dqDebuff('Bleeding','🩸',{mspd:-.15},3000,'Exsanguinate: bleeding, −15% move speed')});sk146Flash(p,VLR146.col,4,16,500)},d*1000))}
Object.assign(VLRM,{
  covenant:{wt:(e,L)=>e.sv.cvN?9:30,cd:30,ph:2,r:[0,40],a:'any',armor:1,dur:11.8,inv:[0,1.2],trn:[[0,.4,2]],
    trk:[[.5,'kneel','io'],[1.4,'covRise','o'],[9.9,'covRise','l',.012],[10.3,'covDrink','io'],[10.9,'covDrink','l'],[11.4,'kneel','i'],[11.8,'cRec','io']],
    go(c){c.S.cvN=(c.S.cvN||0)+1;svSnd('whoosh',1,.6);if(c.S.gone)vlrGone(c.e,false)},
    ev:[[.9,c=>vlr146CovStart(c)],[10.3,c=>vlr146CovEnd(c,false)],[11.4,c=>{sk146Wall(c.m.position,VLR146.col,4,2,.4);burst(gY(c.m.position,.3),VLR.blood,40,4,2,.6);svSnd('heavy',1,1)}]],
    tk(c,dt){const M=c.M;if(Math.random()<dt*10)burst(svWP(c.e,'chest',0,0,0),VLR.blood,1,.8,.4,.6);if(M.an.props&&c.t>1.6&&c.t<10.3&&!M.an.done2&&!sk146Alive(M.an.props).length)vlr146CovEnd(c,true)},
    end(c){vlr146CovCleanup(c)},rec:.6},
  broken:sk146Broken(SVB[5],4.8,'crash','cRec')});
// ---------------- richer effects ----------------
// Blood Wave: a dark core under the bright crescent, spray and cracks along the way
{const f=vlrWave;vlrWave=function(c,a0,spd,L,dm){f.apply(this,arguments);try{const o=c.m.position.clone(),a=c.m.rotation.y+a0,T=L/spd;let t=0,k=0;sk146Flash(gY(o,1),VLR146.col,2.5,9,350);
  const g=svG('vl_cres2',()=>{const q=new THREE.RingGeometry(.8,1.8,14,1,-1.2+Math.PI/2,2.4);q.rotateX(-Math.PI/2);return q}),m=new THREE.MeshBasicMaterial({color:0x2a0006,transparent:true,opacity:.75,depthWrite:false,side:THREE.DoubleSide,fog:false}),ms=new THREE.Mesh(g,m);ms.renderOrder=23;ms.userData.lpsSkip=1;scene.add(ms);
  kqFx({tick(dt){t+=dt||0;const d=1+spd*t,p=new THREE.Vector3(o.x+Math.sin(a)*d,0,o.z+Math.cos(a)*d);ms.position.set(p.x,GH(p.x,p.z)+.95,p.z);ms.rotation.y=a+Math.PI;ms.scale.set(1.25,1,1);
    while(k<Math.floor(t/.14)){k++;sk146Drops(gY(p,1),0xa0101e,3,2.5,2,{splats:1});if(k%2)svDecal(p,0x3a0008,.9,2.2,.5)}return t<T&&!c.e.dead},end(){scene.remove(ms);m.dispose()}})}catch(_){}}}
// Skyfall spears: the floor cracks where they land, a spray of blood
{const f=vlrSpear;vlrSpear=function(c,q,T){f.apply(this,arguments);try{const p=new THREE.Vector3(q.x,0,q.z);setTimeout(()=>{if(c.e.dead||!AF)return;sk146Crack(p,0xff2040,1.4,2.2);sk146Drops(gY(p,.4),0xa0101e,8,3,4,{splats:2});sk146Debris(p,vlrSpkMat(),4,.08,3,4,1)},T*1000)}catch(_){}}}
// Bat Step: a real swarm of bats leaves him and returns
{const f=vlrGone;vlrGone=function(e,on){const r=f.apply(this,arguments);try{const p=e.m.position,a=gY(p,1.6);if(on){const b=gY(p,7).add(new THREE.Vector3((Math.random()-.5)*6,0,(Math.random()-.5)*6));sk146Swarm(a,b,26,0x1a0a10,'bat',.9,{spread:3,s:.4,arc:2})}
  else{const b=gY(p,8).add(new THREE.Vector3((Math.random()-.5)*6,0,(Math.random()-.5)*6));sk146Swarm(b,a,22,0x1a0a10,'bat',.45,{spread:3,s:.4,arc:.5});sk146Flash(a,VLR146.col,2.5,8,300)}}catch(_){}return r}}
// Sanguine Nova: a ring of blood geysers and a shock wall
{const N=VLRM.nova,h=N&&N.hit&&N.hit[0];if(h){const f=h.fx;h.fx=function(c,an,hit){f&&f.apply(this,arguments);try{const p=c.m.position;sk146Wall(p,VLR146.col,7.5,3,.6);sk146Flash(p,VLR146.col,5,14,600);for(let k=0;k<8;k++){const a=k/8*6.283,q=new THREE.Vector3(p.x+Math.cos(a)*5.2,0,p.z+Math.sin(a)*5.2);setTimeout(()=>sk146Column(q,0xc0102a,0xff8090,.55,3.4,.8),k*35)}
  sk146Crack(p,0xff2040,3.5,3);sk146Drops(gY(p,1),0xa0101e,30,6,6,{splats:6})}catch(_){}}}}
// Thorned Procession and Danse Macabre: cracks and walls
{const f=vlrThorns;vlrThorns=function(c,an,dm){f.apply(this,arguments);try{sk146Crack(new THREE.Vector3(an.x+Math.sin(an.a)*1.5,0,an.z+Math.cos(an.a)*1.5),0xff2040,1.8,2.4)}catch(_){}}}
{const S=VLRM.spin;if(S&&S.hit&&S.hit[1]){const f=S.hit[1].fx;S.hit[1].fx=function(c){f&&f.apply(this,arguments);try{sk146Wall(c.m.position,VLR146.col,7,2.4,.5);sk146Flash(c.m.position,VLR146.col,3,10,400)}catch(_){}}}}
// the awakening: a burst of bats and a shock wall as the wings tear free
{const W=VLRM.awaken;if(W){W.ev=(W.ev||[]).concat([[1.25,c=>{try{const p=gY(c.m.position,2);for(let k=0;k<3;k++)sk146Swarm(p,p.clone().add(new THREE.Vector3(Math.cos(k*2.1)*10,5,Math.sin(k*2.1)*10)),14,0x1a0a10,'bat',1.2,{spread:2.5,s:.4});sk146Wall(c.m.position,VLR146.col,10,4,.9);sk146Flash(c.m.position,VLR146.col,6,20,1000)}catch(_){}}]])}}
// every sword hit sprays blood
sk146AutoFx(VLRM,{liq:0xa0101e,sp:0xff5060});
// the moves are registered (relayed in co-op) under their names: register the new ones too
try{svRegMoves(5)}catch(_){}
// the den sign
try{DSTXT[5].atk.push(['🩸 Blood Covenant','Phase II: he rises over the hall, warded, while four golden chalices feed him through streams of blood.','Shatter all four chalices before the rite ends: he crashes down BROKEN. If one survives he heals and two rings of blood sweep the hall — dash through each.'],
  ['🌊 The Crimson Tide','Phase II: blood rains and three wide channels of blood sweep slowly round the floor; the middle stays dry.','Stay out of the channels — standing in blood bleeds you and slows you.'])}catch(_){}
