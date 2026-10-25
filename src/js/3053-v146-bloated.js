// ================= v146 The Bloated One to the Vorraxis standard (model, Phase II den, signature mechanic, effects) =================
// Builds on 1975 (his v110/v112 model, poses and moves stay; this file adds to them).
//  * Model (bloBuild wrapper): the belly and chest are rebuilt as sagging flesh — rolls of fat that overhang one another,
//    lumps and dimples, 28 sides instead of 13–14 — with sewn-on hide patches, open sores and hanging strips of rotten skin;
//    the head is sculpted (a low heavy brow, small sunken eyes, a broad flat nose, a wide lipless mouth, a double chin);
//    fat rolls on the arms and neck, more glowing pustules across the back, a bile drool, a cloud of flies that follows him.
//  * Motion: the belly jiggles and swings after every step and slam (a soft spring), the jaw and head follow through.
//  * Phase II den change, "The Rot Spills": pools of rot well up across the charnel pit and spread, one after another (the
//    oldest dry out). Standing in rot slows you and eats at you. The open floor shrinks and shifts all fight.
//  * Signature mechanic, The Feast (Phase II): three carcasses drop on hooks from the dark. He lumbers from one to the next
//    to gorge on them — while he feeds his gorged hide shrugs off blows (70% less damage). Cut all three down before he eats
//    them and he collapses in a starving rage, BROKEN. Each carcass he reaches heals him and bursts rot around him.
//  * Effects: cleaver chops and stomps crack the floor and throw up gore and bone, the flop lands in a wall of rot,
//    vomit splatters, every hit sprays rot.
var BLO146={col:0x9aff6a,rot:0x6ad020};
function blo146RotMat(){return BLO146.rm||(BLO146.rm=new THREE.MeshStandardMaterial({color:0x4a5a1a,emissive:0x1a2a06,roughness:.3,flatShading:true}))}
function blo146BoneMat(){return BLO146.bm||(BLO146.bm=new THREE.MeshStandardMaterial({color:0xd8ccb0,roughness:.6,flatShading:true}))}
// refine a ring list (insert rings between, with fat rolls: the radius dips just above each roll and bulges at it)
function blo146Rolls(R0,rolls,n){const out=[];for(let i=0;i<R0.length-1;i++){const A=R0[i],B=R0[i+1];for(let s=0;s<n;s++){const k=s/n,L=(u,v)=>(u||0)+((v||0)-(u||0))*k,y=L(A[0],B[0]);
    let m=1;rolls.forEach(([ry,d,w])=>{const q=(y-ry)/w;m+=d*(Math.exp(-q*q*4)-.9*Math.exp(-(q-.7)*(q-.7)*10))});out.push([y,L(A[1],B[1])*m,L(A[2],B[2])*m,L(A[3],B[3]),L(A[4],B[4])])}}
  out.push(R0[R0.length-1]);return out}
{const f=bloBuild;bloBuild=function(R,e){f.apply(this,arguments);try{blo146Add(R)}catch(err){console.error('v146 bloated model',err)}};if(SVB[4])SVB[4].build=bloBuild}
function blo146Add(R){const G=(k,fn)=>svG('b46'+k,fn),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz);
  const fl=sk146Mat(R,0x6e6c4c),fl2=sk146Mat(R,0x50563a),bruise=sk146Mat(R,0x4a3448),leath=sk146Mat(R,0x2a1e16),cloth=sk146Mat(R,0x3a3028),blood=sk146Mat(R,0x4a0c08),bone=sk146Mat(R,0xd8ccb0),pus=R.pus,
    sore=svMat(R,0x6a1a10,{roughness:.25,emissive:0x2a0804}),rot=svMat(R,0x4a5a1a,{roughness:.3,emissive:0x1a2a06});
  // ---- the belly: rolls of fat, 28 sides, lumps ----
  const BR=blo146Rolls(BLO_BR,[[-.55,.06,.22],[.15,.05,.2],[.75,.04,.18]],3);
  sk146Swap(R,'b2_bl',G('bl',()=>sk146Loft(BR,28,{fn:5,fa:.035,seed:11,cap:true})));
  const CR=blo146Rolls(BLO_CR,[[.05,.04,.2],[.6,.035,.2]],3);sk146Swap(R,'b2_ch',G('ch',()=>sk146Loft(CR,24,{fn:4,fa:.03,seed:12,cap:true})));
  // sewn-on hide patches with stitches, open sores, rotten skin strips
  [[.35,-.6],[-.3,.9],[.6,1.5],[-.8,-1.3]].forEach(([y,a],k)=>{const p=bloSrf(BLO_BR,y,a,.03);const m=Mm('belly',G('pt'+(k%2),()=>svBlade([[-.22,-.18],[.24,-.2],[.26,.16],[-.2,.22]],.02)),k%2?leath:cloth,p[0],p[1],p[2],0,a,0);
    for(let q=0;q<6;q++){const t=q/6*6.283;Mm('belly',G('sn',()=>new THREE.BoxGeometry(.02,.08,.02)),leath,p[0]+Math.cos(a)*Math.cos(t)*.24,p[1]+Math.sin(t)*.2,p[2]-Math.sin(a)*Math.cos(t)*.24,0,a,t)}});
  [[-.1,.5,.16],[.55,-1.2,.12],[-.9,.6,.14],[.9,1.9,.1],[.2,2.6,.13]].forEach(([y,a,r],k)=>{const p=bloSrf(BLO_BR,y,a,.0);Mm('belly',G('so'+k,()=>svLump(r,0,.3,70+k)),sore,p[0],p[1],p[2],0,a,0,1,1,.3);Mm('belly',G('sp',()=>new THREE.IcosahedronGeometry(.05,0)),pus,p[0],p[1],p[2]+.0)});
  for(let k=0;k<7;k++){const a=-1.6+k*.55,p=bloSrf(BLO_BR,-.95,a,.02);Mm('belly',G('rs'+(k%3),()=>svBlade([[-.06,0],[.06,0],[.04,-.4-(k%3)*.1],[0,-.48-(k%3)*.1],[-.04,-.36]],.012)),k%2?rot:fl2,p[0],p[1],p[2],-.15,a,0)}
  // ---- the head, sculpted ----
  sk146Drop(R,'b2_hd');
  Mm('head',sk146Sculpt('b46hd',20,16,(x,y,z)=>{let X=x*.5,Y=y*.5+.15,Z=z*.48;const fz=Math.max(0,z);
    if(y<-.1){const k=Math.min(1,(-.1-y)/.9);X*=1+.18*k;Z+=.06*k*fz}                                                // jowls and a double chin
    Z+=fz*(.08*sk146Gs(x,y,0,.38,.7,.12)                                                                              // the heavy brow
      -.07*sk146Gs(Math.abs(x),y,.34,.2,.14,.1)                                                                      // sunken eye pits
      +.05*sk146Gs(x,y,0,0,.25,.18)                                                                                  // a broad flat nose
      -.05*sk146Gs(x,y,0,-.32,.5,.07)                                                                                // the wide mouth line
      +.04*sk146Gs(x,y,0,-.62,.35,.12));                                                                             // the chin roll
    if(y>.5)Y-=.08*(y-.5);return [X,Y,Z]}),fl,0,0,0);
  [-1,1].forEach(s=>{Mm('head',G('lid',()=>svLump(.06,0,.2,80)),fl2,s*.17,.29,.41,0,0,0,1.5,.5,.8)});
  // bile drool
  Mm('head',G('dr',()=>svTube([[0,0,0],[.02,-.15,.02],[0,-.32,.05],[-.02,-.45,.06]],[.04,.03,.025,.015],4)),rot,.08,-.06,.43);
  // ---- fat rolls on the neck and arms, pustules on the back ----
  Mm('neck',G('nr',()=>svLoft([[-.1,.55,.5],[.05,.62,.56],[.15,.55,.5]],16,{cap:false})),fl,0,0,0);
  ['L','R'].forEach(L=>{[[-.25,.36],[-.55,.32]].forEach(([y,r],k)=>Mm('sh'+L,G('ar'+k,()=>svLoft([[y-.08,r*.9,r*.9],[y,r*1.05,r*1.05],[y+.08,r*.9,r*.9]],12,{cap:false})),fl));Mm('el'+L,G('er',()=>svLoft([[-.1,.27,.27],[-.02,.31,.31],[.06,.27,.27]],12,{cap:false})),fl)});
  for(let k=0;k<14;k++){const a=Math.PI+(k%7-3)*.32,y=.1+Math.floor(k/7)*.5+(k%2)*.12,p=bloSrf(BLO_CR,y,a,.02);Mm('chest',G('bp'+(k%3),()=>svLump(.07+.025*(k%3),0,.2,90+k%3)),pus,p[0],p[1],p[2])}
  // ---- the flies ----
  const fz=svJ(R,'flies','chest',0,1.2,0);fz.userData.flies=1;R.v146fly=[];
  for(let k=0;k<26;k++){const o=new THREE.Mesh(G('fly',()=>new THREE.OctahedronGeometry(.03,0)),leath);o.userData.noMerge=1;o.userData.ph=Math.random()*6.283;o.userData.r=.8+Math.random()*1.4;o.userData.h=(Math.random()-.5)*1.6;o.userData.w=1.5+Math.random()*2;fz.add(o);R.v146fly.push(o)}}
// springs: the belly jiggles, the jaw and head follow through
{const B=SVB[4];if(B){B.spr={belly:[22,3.2,1.5],jaw:[70,8,.2],head:[55,9,.4],neck:[60,10,.3]};
  const p0=B.post;B.post=function(e,S,dt,now){p0&&p0.apply(this,arguments);try{const t=now/1000;(S.R.v146fly||[]).forEach(o=>{const u=o.userData,a=t*u.w+u.ph;o.position.set(Math.cos(a)*u.r,u.h+.25*Math.sin(a*1.7),Math.sin(a*1.3)*u.r)});
    if(Math.random()<dt*2){const p=svWP(e,'head',.08,-.5,.48);sk146Drops(p,0x8aa030,1,.2,.1,{s:.05,splats:1,dc:0x3a4a10})}}catch(_){}}}}
// ---------------- new poses: lumbering with arms reaching, gorging ----------------
Object.assign(BLOP,{
  lumber:{spine:[.3,0,0],chest:[.25,0,0],head:[.15,0,0],jaw:[.45,0,0],shL:[-1.2,0,.25],elL:[-.5,0,0],hdL:[.3,0,0],shR:[-1.0,0,-.3],elR:[-.4,.4,0],hdR:[.6,.1,.2]},
  eat:{hips:[0,0,0,0,-.35,0],spine:[.55,0,0],chest:[.5,0,0],head:[.5,0,0],jaw:[.9,0,0],shL:[-1.5,0,.35],elL:[-1.3,0,0],hdL:[.5,0,0],shR:[-1.4,0,-.4],elR:[-1.2,.5,0],hdR:[.9,.1,.2],thL:[-.5,0,0],knL:[.7,0,0],thR:[-.5,0,0],knR:[.7,0,0]},
  starve:{hips:[.15,0,.2,0,-.9,0],spine:[.45,0,.15],chest:[.35,0,0],head:[.6,0,.3],jaw:[.6,0,0],shL:[.4,0,.6],elL:[-.3,0,0],shR:[.4,0,-.6],elR:[-.3,.4,0],thL:[-1.5,0,.2],knL:[1.9,0,0],thR:[-1.4,0,-.2],knR:[1.9,0,0]}});
// ---------------- Phase II: "The Rot Spills" ----------------
function blo146RotTex(){if(BLO146.rt)return BLO146.rt;const cv=document.createElement('canvas');cv.width=cv.height=256;const g=cv.getContext('2d'),gr=g.createRadialGradient(128,128,10,128,128,128);
  gr.addColorStop(0,'rgba(90,110,30,1)');gr.addColorStop(.6,'rgba(70,85,20,.95)');gr.addColorStop(.85,'rgba(50,60,15,.6)');gr.addColorStop(1,'rgba(40,40,10,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);
  for(let k=0;k<60;k++){const x=40+Math.random()*176,y=40+Math.random()*176,r=3+Math.random()*12;g.fillStyle=`rgba(${120+Math.random()*60|0},${150+Math.random()*60|0},40,.5)`;g.beginPath();g.arc(x,y,r,0,6.283);g.fill()}
  return BLO146.rt=new THREE.CanvasTexture(cv)}
function blo146Spill(A,e){const D=sk146Den(A);if(D.ph2)return;D.ph2=1;D.rot={pools:[],t:3,dT:0,n:0};D.flies=sk146DenAdd(A,sk146Weather(A,'spores',0x3a3a20,260));
  try{banner('🦠 THE ROT SPILLS','Pools of rot well up across the pit','Keep out of the rot')}catch(_){}svSnd('squelch',1.2,.6)}
function blo146SpillTick(A,e,dt){const D=A.s146,Rt=D&&D.rot;if(!Rt)return;Rt.t-=dt;
  if(Rt.t<=0&&sk146In(A)){Rt.t=6.5;// a new pool where the hero is not standing (but near enough to matter)
    let x,z,tr=0;do{const a=Math.random()*6.283,r=3+Math.random()*(ARENA_R-4.5);x=A.cx+Math.cos(a)*r;z=A.cz+Math.sin(a)*r;tr++}while(tr<8&&Math.hypot(x-pl.position.x,z-pl.position.z)<3.5);
    const m=new THREE.MeshStandardMaterial({color:0xffffff,map:blo146RotTex(),transparent:true,opacity:.95,roughness:.15,metalness:.2,emissive:0x1a2a06,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3});m.userData.noFade135=1;
    const o=new THREE.Mesh(svG('b46pl',()=>new THREE.CircleGeometry(1,28).rotateX(-Math.PI/2)),m);o.position.set(x,GH(x,z)+.12+Rt.n*.002,z);o.scale.setScalar(.2);o.renderOrder=16;o.userData.lpsSkip=1;sk146DenAdd(A,o);
    Rt.pools.push({o,m,x,z,r:.2,R:2.6+Math.random()*1.2,age:0});Rt.n++;svSnd('squelch',.8,.8);burst(gY(new THREE.Vector3(x,0,z),.3),BLO146.rot,20,2,2,.6);
    if(Rt.pools.length>6){const q=Rt.pools.shift();q.dry=1;Rt.dry=(Rt.dry||[]).concat([q])}}
  Rt.pools.forEach(q=>{q.age+=dt;q.r=Math.min(q.R,q.r+dt*.35);q.o.scale.setScalar(q.r);q.o.rotation.y+=dt*.05;if(Math.random()<dt*q.r*1.2){const a=Math.random()*6.283,r=Math.random()*q.r;burst(new THREE.Vector3(q.x+Math.cos(a)*r,GH(q.x,q.z)+.2,q.z+Math.sin(a)*r),0x9ab040,1,.2,.6,.5)}});
  (Rt.dry||[]).forEach(q=>{q.m.opacity-=dt*.4;q.o.scale.setScalar(q.r*(.9+.1*q.m.opacity));if(q.m.opacity<=0){if(q.o.parent)q.o.parent.remove(q.o);q.m.dispose();q.gone=1}});if(Rt.dry)Rt.dry=Rt.dry.filter(q=>!q.gone);
  if(!sk146In(A)||!e||e.dead)return;const P=pl.position;Rt.dT-=dt;const inP=Rt.pools.some(q=>Math.hypot(P.x-q.x,P.z-q.z)<q.r*.92);
  if(inP){dqDebuff('Rotting','🦠',{mspd:-.25},700,'Standing in rot: −25% move speed, it eats at you');D.deb='Rotting';if(Rt.dT<=0&&!(hero.iv>0)){Rt.dT=.85;hitHero(e,.12,'m')}}}
{const B=SVB[4];if(B){const t0=B.denTick,c0=B.denClear;
  B.denTick=function(A,e,dt,now){try{t0&&t0.apply(this,arguments)}catch(_){}try{if(A.f&&e&&e.sv&&e.sv.ph>1&&!sk146Den(A).ph2)blo146Spill(A,e);blo146SpillTick(A,e,dt)}catch(err){if(!SK146.err++)console.error('v146 rot',err)}};
  B.denClear=function(A,won){try{c0&&c0.apply(this,arguments)}catch(_){}sk146DenClear(A)}}}
// ---------------- the signature: The Feast ----------------
function blo146Carcass(){const g=new THREE.Group(),meat=new THREE.MeshStandardMaterial({color:0x6a1a14,roughness:.55,flatShading:true,emissive:0x1a0402}),fat=new THREE.MeshStandardMaterial({color:0xc8b890,roughness:.7,flatShading:true}),
    iron=new THREE.MeshStandardMaterial({color:0x4a4440,roughness:.5,metalness:.55,flatShading:true}),bm=blo146BoneMat();
  const body=new THREE.Mesh(svG('b46cb',()=>svLump(.55,1,.25,95)),meat);body.scale.set(.85,1.5,.6);body.position.y=1.6;g.add(body);
  const f2=new THREE.Mesh(svG('b46cf',()=>svLump(.4,0,.3,96)),fat);f2.scale.set(.9,1.2,.5);f2.position.set(0,1.55,.12);g.add(f2);
  for(let k=0;k<5;k++){const r=new THREE.Mesh(svG('b46cr',()=>svTube([[-.4,0,0],[-.3,.05,.28],[0,.06,.36],[.3,.05,.28],[.4,0,0]],.03,4)),bm);r.position.set(0,1.1+k*.18,.05);g.add(r)}
  const hk=new THREE.Mesh(svG('b46ch',()=>svTube([[0,0,0],[0,-.3,0],[0,-.45,.12],[0,-.36,.25]],.04,4)),iron);hk.position.y=2.75;g.add(hk);
  for(let k=0;k<10;k++){const l=new THREE.Mesh(svG('b46cl',()=>new THREE.TorusGeometry(.08,.025,4,6)),iron);l.position.y=2.8+k*.17;l.rotation.y=k%2?Math.PI/2:0;g.add(l)}
  return {g,body,meat,fat,iron}}
function blo146FeastStart(c){const e=c.e,S=c.S,A=c.A;if(!A)return;S.dr=.3;const D=sk146Den(A),a0=svYawTo(e.m,pl.position)+Math.PI+(Math.random()-.5);
  const L=[0,1,2].map(k=>{const a=a0+(k-1)*1.6,x=A.cx+Math.sin(a)*9.5,z=A.cz+Math.cos(a)*9.5,C=blo146Carcass();C.g.position.y=6;let t=0;
    return {x,z,n:'Carcass',frac:.018,mesh:C.g,hbY:3.4,hbS:.8,cupY:1.6,
      tick(pe,dt,now){t+=dt;C.g.position.y=6*Math.max(0,1-svEase.o(Math.min(1,t/.9)));C.g.rotation.y=.3*Math.sin(now/900+k);C.body.rotation.z=.08*Math.sin(now/700+k);if(Math.random()<dt*3)sk146Drops(gY(pe.m.position,1.1),0x6a1a14,1,.2,.1,{s:.05,splats:1})},
      die(pe,killed){if(killed){const p=gY(pe.m.position,1.5);sk146Drops(p,0x8a1a14,24,4,4,{splats:6});sk146Debris(p,blo146BoneMat(),8,.08,4,5,1.4);sk146Debris(p,C.meat,6,.12,3,4,1.4);burst(p,0x6a1a14,40,3,3,.7);popT(pe.m.position,'🪓 CUT DOWN','#ffd0a0');svSnd('squelch',1.2,.9);svSnd('crack',.8,1)}
        [C.meat,C.fat,C.iron].forEach(m=>m.dispose())}}});
  const P=sk146Props(A,L);c.M.an.props=P;c.M.an.eaten=0;D.props=(D.props||[]).concat(P);
  svSnd('roar',1.1,.7);shake(.3);try{banner('🍖 THE FEAST','Three carcasses drop from the dark — he lumbers to gorge on them','Cut them down before he eats them!')}catch(_){}say('🍖 The Bloated One hungers: cut the carcasses down before he reaches them!')}
function blo146FeastCleanup(c){const S=c.S,M=c.M;S.dr=0;if(!M)return;(M.an.props||[]).forEach(p=>{if(!p._gone)dqPropGone(p,false)})}
function blo146Eat(c,p){const e=c.e,M=c.M;M.an.eaten++;const q=gY(p.m.position,1.5);sk146Drops(q,0x8a1a14,30,4,4,{splats:6});burst(q,0x6a1a14,50,3,3,.8);svSnd('squelch',1.4,.6);svSnd('roar',.8,1.1);
  sk146Heal(e,.05,0x9aff6a);dqPropGone(p,false);M.an.eatT=1.4;M.an.tgt=null;
  // a burst of rot around him
  const pos=e.m.position.clone();sk146Wall(pos,BLO146.rot,5,2,.5);for(let k=0;k<6;k++){const a=k/6*6.283;sk146Column(new THREE.Vector3(pos.x+Math.cos(a)*3,0,pos.z+Math.sin(a)*3),0x6ad020,0xc8ff80,.45,2.4,.7)}
  svHitNow(e,{k:'c',r:4.2},{x:pos.x,z:pos.z,a:0},1.2,{col:BLO146.col,on:()=>dqDebuff('Rotting','🦠',{mspd:-.25},2500,'Rot burst: −25% move speed')})}
function blo146FeastEnd(c,broken){const e=c.e,M=c.M;if(M.an.done2)return;M.an.done2=1;
  if(broken){blo146FeastCleanup(c);svEndMove(e,true);svCast(e,'broken');try{banner('💔 STARVED','The Bloated One collapses in a starving rage','Strike now!')}catch(_){}return}
  blo146FeastCleanup(c)}
Object.assign(BLOM,{
  feast:{wt:(e,L)=>e.sv.fsN?9:30,cd:30,ph:2,r:[0,40],a:'any',armor:1,dur:13,inv:[0,1.1],trn:[[0,1.2,2.2]],
    trk:[[.5,'roar','io'],[1.3,'roar','l',.02],[1.8,'lumber','io'],[12.4,'lumber','l'],[13,'stand','io']],
    go(c){c.S.fsN=(c.S.fsN||0)+1},
    ev:[[.9,c=>blo146FeastStart(c)],[12.6,c=>blo146FeastEnd(c,false)]],
    tk(c,dt){const M=c.M,e=c.e,m=e.m;if(!M.an.props||c.t<1.8||M.an.done2)return;const live=sk146Alive(M.an.props);
      if(!live.length){if(M.an.eaten===0||c.t<12.4)blo146FeastEnd(c,M.an.eaten===0);return}
      if(M.an.eatT>0){M.an.eatT-=dt;c.S.trk=[[0,'eat','io'],[.9,'eat','l',.02],[1.4,'lumber','io']];c.S.tt=1.4-M.an.eatT;if(M.an.eatT<=0){c.S.trk=c.M.D.trk;c.S.tt=c.t}return}
      // lumber to the nearest carcass
      let t=M.an.tgt;if(!t||t.dead||t._gone){t=live.slice().sort((a,b)=>Math.hypot(a.m.position.x-m.position.x,a.m.position.z-m.position.z)-Math.hypot(b.m.position.x-m.position.x,b.m.position.z-m.position.z))[0];M.an.tgt=t}
      const dx=t.m.position.x-m.position.x,dz=t.m.position.z-m.position.z,d=Math.hypot(dx,dz);m.rotation.y+=svAng(Math.atan2(dx,dz)-m.rotation.y)*Math.min(1,dt*4);
      if(d>2.4){const sp=2.2*dt;walkM(m,dx/d*sp,dz/d*sp)}else blo146Eat(c,t);
      if(Math.random()<dt*3)svSnd('step',.8,.6)},
    end(c){blo146FeastCleanup(c)},rec:.6},
  broken:sk146Broken(SVB[4],4.8,'starve','stand')});
// ---------------- richer effects ----------------
{const f=bloSplat;bloSplat=function(p,n,r){f.apply(this,arguments);try{sk146Drops(gY(p,.4),0x6a8a20,Math.min(24,(n||30)/2),(r||3)*1.2,4,{splats:4,dc:0x2a3a08});sk146Debris(p,blo146BoneMat(),4,.07,(r||3),4,1.2);sk146Crack(p,0x9aff6a,(r||3)*.6,2.4)}catch(_){}}}
for(const id of ['chop','stomp','flop','flop2','burst','hookChop']){const D=BLOM[id];if(!D||!D.hit)continue;D.hit.forEach(h=>{const f=h.fx;h.fx=function(c,an,hit){f&&f.apply(this,arguments);try{
  const S=h.s,a=an.a||0,fw=S.k==='l'?Math.min(4,S.l*.5):0,p=new THREE.Vector3(an.x+Math.sin(a)*fw,0,an.z+Math.cos(a)*fw);
  sk146Crack(p,0x9aff6a,S.k==='c'?Math.min(4,S.r*.6):2.2,2.6);sk146Debris(p,blo146RotMat(),6,.09,4,5,1.3);sk146Flash(p,0xb8ff60,2.5,10,350);if(S.k==='c'&&S.r>3)sk146Wall(p,BLO146.rot,S.r+.5,2.4,.5)}catch(_){}}})}
sk146AutoFx(BLOM,{liq:0x6a8a20,sp:0xc8ff80,dust:0x5a4a30});
try{svRegMoves(4)}catch(_){}
try{DSTXT[4].atk.push(['🍖 The Feast','Phase II: three carcasses drop on hooks; he lumbers from one to the next to gorge on them (his gorged hide shrugs off 70% of the damage).','Cut all three down before he reaches them: he collapses BROKEN. Each one he eats heals him and bursts rot around him.'],
  ['🦠 The Rot Spills','Phase II: pools of rot well up across the pit and spread; the oldest dry out.','Keep out of the rot — it slows you and eats at you.'])}catch(_){}
