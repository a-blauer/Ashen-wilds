// ================= v146 The Rime Wraith to the Vorraxis standard (model, Phase II den, signature mechanic, effects) =================
// Builds on 1973 (its v110/v112 model, solved scythe aims, poses and moves stay; this file adds to them).
//  * Model (rwrBuild wrapper): the robes are rebuilt as heavy folded cloth (a 24-fold inner bell, a ragged over-robe and a
//    torn outer shroud), ice grows through them in clusters (hem, shoulders, back, crown of the hood), frost rime crusts the
//    hem; the skull is sculpted (a domed cranium, deep sockets with the eyes burning inside, cheek arches, a nasal hollow);
//    the hood has a black void inside so the skull floats in darkness; two soul lanterns hang from the belt on chains.
//  * Motion: the fourteen hem strips, the robe, the lanterns and the jaw follow through on springs.
//  * Phase II den change, "The Whiteout": a blizzard (driving snow, drifting banks of fog that hide the far side of the den)
//    and the floor freezes into a sheet of ice — you slide: you keep moving a moment after you stop and turn wide; a steady
//    wind pushes you about. Plan your dodges early.
//  * Signature mechanic, Frozen Heart (Phase II): it sinks into a shell of ice in the middle of the den (warded: 90% less
//    damage) and frost creeps in from the walls. Three frozen braziers rise; break the ice on each to light it. Light all
//    three and their heat shatters the shell: the wraith drops, BROKEN. If the frost reaches the middle first, Absolute Zero
//    freezes the whole den — only the warmth beside a lit brazier is safe — and the shell mends it (heals 10%).
//  * Effects: icicles shatter into shards and crack the floor, Frost Nova and Glacial Prison throw up ice and frost walls,
//    Winter's Step is a storm of ice shards, every scythe hit throws frost.
var RWR146={col:0x9ad8ff,ice:0xd8f4ff};
function rw146IceMat(){return RWR146.im||(RWR146.im=new THREE.MeshStandardMaterial({color:0xbfe6ff,emissive:0x2a6aa0,emissiveIntensity:.6,roughness:.1,metalness:.1,flatShading:true,transparent:true,opacity:.9}))}
{const f=rwrBuild;rwrBuild=function(R,e){f.apply(this,arguments);try{rw146Add(R)}catch(err){console.error('v146 wraith model',err)}};if(SVB[2])SVB[2].build=rwrBuild}
function rw146Add(R){const G=(k,fn)=>svG('w46'+k,fn),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz),
    MY=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>{const o=svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz);o.rotation.order='YXZ';return o};
  const robe=sk146Mat(R,0x1a2232),robe2=sk146Mat(R,0x2a3850),bone=sk146Mat(R,0xd8dce4),ice=R.iceM,ice2=sk146Mat(R,0x8ac8f0),iron=sk146Mat(R,0x3a404c),
    voidM=svMat(R,0x020306,{roughness:1,emissive:0x000000}),rime=svMat(R,0xe8f4ff,{roughness:.9,emissive:0x1a2a3a}),eye=R.glow.find(m=>m.userData.c0===0x9ae8ff),shroud=svMat(R,0x10161f,{roughness:1,side:THREE.DoubleSide,emissive:0x03050a});
  // ---- the robes: folded cloth ----
  sk146Swap(R,'rw_rb',G('rb',()=>sk146Loft([[.18,.5,.44],[-.3,.68,.6],[-.8,.86,.78],[-1.3,1.04,.94],[-1.92,1.26,1.12]],24,{fn:9,fa:.07,grow:1,seed:3})));
  sk146Swap(R,'rw_rb2',G('rb2',()=>sk146Loft([[.24,.57,.51],[-.3,.8,.72],[-.8,.98,.88],[-1.12,1.12,1.01]],20,{fn:7,fa:.09,grow:1,rag:.5,seed:4,rot:.35})));
  Mm('robe',G('shr',()=>sk146Loft([[.3,.62,.56],[-.2,.9,.8],[-.6,1.05,.94]],18,{fn:5,fa:.12,grow:1,rag:.9,seed:5,rot:.9})),shroud);
  // frost rime crusted on the hem, ice clusters growing through the robe
  for(let k=0;k<22;k++){const a=k/22*6.283+.1;Mm('robe',G('rm',()=>svLump(.09,0,.5,31)),rime,Math.sin(a)*1.2,-1.84+.05*Math.sin(k*3),Math.cos(a)*1.07,0,a,0,1.3,.6,1)}
  const clus=(j,x,y,z,ry,s,n)=>{for(let q=0;q<(n||3);q++){const t=(q-1)*.45;MY(j,G('ic'+(q%2),()=>svHorn(.07,.5+.25*(q%2),0,.06,5,2)),ice,x,y,z,-1.0+Math.abs(t)*.6,ry+t,0,s,s,s*(1.1-.2*q))}};
  [[1.15,-1.6,.3],[-1.1,-1.5,-.2],[.3,-1.7,1.1],[-.5,-1.65,-1.0],[.9,-.9,.6],[-.85,-1.0,.55]].forEach(([x,y,z],k)=>clus('robe',x,y,z,Math.atan2(x,z),.9+.2*(k%2)));
  ['shL','shR'].forEach((j,k)=>clus(j,(k?-1:1)*.3,.35,-.1,Math.PI,.8,4));clus('chest',0,1.1,-.55,Math.PI,1,4);
  // ---- the skull, sculpted; the void inside the hood ----
  sk146Drop(R,'rw_sk');
  Mm('head',sk146Sculpt('w46sk',18,14,(x,y,z)=>{let X=x*.28,Y=y*.31+.3,Z=z*.31+.27;const fz=Math.max(0,z);
    Y+=.06*Math.max(0,y)*Math.max(0,1-Math.abs(x));                                                   // the dome
    if(y<-.2){const k=Math.min(1,(-.2-y)/.8);X*=1-.35*k;Z-=.05*k}                                       // the face narrows to the teeth
    Z-=fz*(.13*sk146Gs(Math.abs(x),y,.4,.05,.2,.18)+.06*sk146Gs(x,y,0,-.3,.08,.12));                   // deep sockets, the nasal hollow
    X+=Math.sign(x)*.03*sk146Gs(Math.abs(x),y,.75,-.25,.2,.15);                                        // cheek arches
    Z+=fz*.04*sk146Gs(x,y,0,.3,.6,.12);return [X,Y,Z]}),bone);
  {const ey=SVX.gc['rw_ey'];R.J.head.children.forEach(o=>{if(o.isMesh&&o.geometry===ey)o.position.z=.5;if(o.isSprite&&o.userData.s0===.5){o.position.z=.55;o.scale.setScalar(.36)}})}
  [-1,1].forEach(s=>Mm('head',G('sok',()=>new THREE.SphereGeometry(.075,6,5).toNonIndexed()),voidM,s*.11,.31,.45));
  Mm('head',G('nas',()=>new THREE.SphereGeometry(.04,5,4).toNonIndexed()),voidM,0,.2,.45,0,0,0,1,1.4,.8);
  Mm('head',G('vd',()=>new THREE.SphereGeometry(.47,12,8,Math.PI,Math.PI).toNonIndexed()),voidM,0,.34,.02,0,0,0,1,1.05,.9);   // the back half only: the skull sits in front of it
  // the hood, the sleeves and the mantle as folded cloth
  sk146Swap(R,'rw_hd',G('hd',()=>sk146Loft([[-.22,.5,.5,0,-.1],[.2,.56,.58,0,-.06],[.6,.5,.52,0,-.13],[.95,.24,.28,0,-.32],[1.25,.04,.05,0,-.6]],18,{fn:5,fa:.05,seed:8})));
  sk146Swap(R,'rw_sl',G('sl',()=>sk146Loft([[-.3,.27,.26],[-.5,.33,.31],[-.72,.4,.37],[-.92,.46,.43]],16,{fn:5,fa:.1,grow:1,rag:.6,seed:9})));
  sk146Swap(R,'rw_mt',G('mt',()=>sk146Loft([[.92,.9,.66],[1.06,.95,.7],[1.2,.98,.73],[1.46,.62,.5]],18,{fn:7,fa:.06,seed:10})));
  // ---- two soul lanterns on chains (their own joints: they swing) ----
  [[.62,-.05,.36,1],[-.55,-.1,.42,-1]].forEach(([x,y,z,s],k)=>{const j=svJ(R,'lan'+k,'robe',x,y,z);
    Mm(j,G('lch',()=>svTube([[0,0,0],[.02,-.18,.02],[0,-.34,0]],.016,4)),iron);
    Mm(j,G('lcg',()=>svLoft([[-.38,.06,.06],[-.46,.11,.11],[-.62,.11,.11],[-.7,.05,.05]],6,{cap:false})),iron);
    for(let q=0;q<4;q++){const a=q/4*6.283;Mm(j,G('lcb',()=>svTube([[0,-.4,0],[0,-.66,0]],.012,3)),iron,Math.sin(a)*.11,0,Math.cos(a)*.11)}
    Mm(j,G('lcs',()=>svLump(.07,0,.2,33)),ice2,0,-.54,0);svSpr(R,j,0x9ae8ff,.55,0,-.54,0)});
  // ---- frost on the ribs, torn strips on the sleeves ----
  for(let k=0;k<8;k++){const s=k%2?1:-1;Mm('chest',G('rf',()=>svLump(.05,0,.4,34)),rime,s*(.55-.03*k),.5+k*.09,.1+.04*k,0,0,0,1.2,.5,1)}
  ['shL','shR'].forEach(j=>{for(let k=0;k<6;k++){const a=k/6*6.283;Mm(j,G('st'+(k%2),()=>svBlade([[-.08,0],[.08,0],[.04,-.5-.12*(k%2)],[-.05,-.36]],.015)),shroud,Math.sin(a)*.46,-1.0,Math.cos(a)*.43,0,a,0)}})}
// springs: hem strips, robe, lanterns, jaw
{const B=SVB[2];if(B){const s={robe:[40,8,.5],lan0:[26,3.5,1.6],lan1:[26,3.5,1.6],jaw:[90,12,0]};for(let k=0;k<14;k++)s['tt'+k]=[30,5,1.4];B.spr=s}}
// ---------------- new poses (aims are solved at the first build, like the others) ----------------
Object.assign(RWRP,{
  hEnc:{body:[.2,0,0,0,.4,0],chest:[.25,0,0],shR:[-0.76,0.68,-2.15],elR:[-1.39,0.01,0.05],shL:[-1.3,0,-.6],elL:[-1.6,0,0],hdL:[.3,0,0],head:[.55,0,0],jaw:[.1,0,0],robe:[-.15,0,0],aim:[1,.15,0, 0,1,0]},
  hRoar:{body:[-.25,0,0,0,.9,0],chest:[-.3,0,0],shR:[-0.76,0.68,-2.15],elR:[-1.39,0.01,0.05],shL:[-2.6,0,.9],elL:[-.2,0,0],head:[-.6,0,0],jaw:[.6,0,0],robe:[.35,0,0],aim:[1,.15,0, 0,1,0]}});
// ---------------- Phase II: "The Whiteout" ----------------
function rw146IceTex(){if(RWR146.it)return RWR146.it;const cv=document.createElement('canvas');cv.width=cv.height=512;const g=cv.getContext('2d');g.fillStyle='#9ad0f0';g.fillRect(0,0,512,512);
  for(let k=0;k<160;k++){g.strokeStyle=`rgba(255,255,255,${.15+Math.random()*.35})`;g.lineWidth=.5+Math.random()*1.5;g.beginPath();let x=Math.random()*512,y=Math.random()*512;g.moveTo(x,y);for(let q=0;q<4;q++){x+=(Math.random()-.5)*70;y+=(Math.random()-.5)*70;g.lineTo(x,y)}g.stroke()}
  for(let k=0;k<40;k++){const x=Math.random()*512,y=Math.random()*512,r=20+Math.random()*60,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.25)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}
  return RWR146.it=new THREE.CanvasTexture(cv)}
function rw146Whiteout(A,e){const D=sk146Den(A);if(D.ph2)return;D.ph2=1;const y0=GH(A.cx,A.cz);
  const m=new THREE.MeshStandardMaterial({color:0xd8f0ff,map:rw146IceTex(),roughness:.05,metalness:.35,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});m.userData.noFade135=1;
  const fl=new THREE.Mesh(svG('w46fl',()=>new THREE.CircleGeometry(ARENA_R-.2,48).rotateX(-Math.PI/2)),m);fl.position.set(A.cx,y0+.11,A.cz);fl.renderOrder=15;fl.userData.lpsSkip=1;sk146DenAdd(A,fl);
  const fog=[];for(let k=0;k<22;k++){const s=kqSpr(0xe8f4ff,7+Math.random()*5);s.material=s.material.clone();s.material.blending=THREE.NormalBlending;s.material.opacity=0;const a=Math.random()*6.283,r=4+Math.random()*(ARENA_R-3);
    s.position.set(A.cx+Math.cos(a)*r,y0+1.2+Math.random()*1.6,A.cz+Math.sin(a)*r);s.userData.a=a;s.userData.r=r;s.userData.w=.05+Math.random()*.08;s.renderOrder=25;sk146DenAdd(A,s);fog.push(s)}
  D.wo={fl,m,fog,wa:Math.random()*6.283,v:{x:0,z:0},last:null,t:0};D.snow=sk146DenAdd(A,sk146Weather(A,'snow',0xffffff,1100));
  try{banner('❄ THE WHITEOUT','A blizzard howls and the floor freezes over','You slide on the ice — dodge early')}catch(_){}svSnd('hiss',1.2,.5);svSnd('ice',1,.6)}
function rw146WhiteoutTick(A,e,dt){const D=A.s146,W=D&&D.wo;if(!W)return;W.t+=dt;W.m.opacity=Math.min(.55,W.m.opacity+dt*.3);W.wa+=dt*.12;
  W.fog.forEach(s=>{s.userData.a+=dt*s.userData.w;s.position.x=A.cx+Math.cos(s.userData.a)*s.userData.r;s.position.z=A.cz+Math.sin(s.userData.a)*s.userData.r;s.material.opacity=Math.min(.32,s.material.opacity+dt*.12)});
  if(!sk146In(A)||!e||e.dead){W.last=null;return}
  // ice: the hero keeps sliding (the velocity follows the input slowly), a wind pushes; both only on the den floor
  const P=pl.position;if(W.last&&dt>0&&dt<.1){const ux=(P.x-W.last.x)/dt,uz=(P.z-W.last.z)/dt;if(Math.hypot(ux,uz)<14&&!pl.step){const k=Math.min(1,dt*2.4);W.v.x+=(ux-W.v.x)*k;W.v.z+=(uz-W.v.z)*k;
      const ex=(W.v.x-ux)*dt*.9,ez=(W.v.z-uz)*dt*.9;if(Math.hypot(ex,ez)>.0005)walk(pl,ex,ez)}else{W.v.x=W.v.z=0}}
  const ws=.55;walk(pl,Math.cos(W.wa)*ws*dt,Math.sin(W.wa)*ws*dt);W.last={x:P.x,z:P.z}}
{const B=SVB[2];if(B){const t0=B.denTick,c0=B.denClear;
  B.denTick=function(A,e,dt,now){try{t0&&t0.apply(this,arguments)}catch(_){}try{if(e&&e.sv&&e.sv.ph>1&&!sk146Den(A).ph2)rw146Whiteout(A,e);rw146WhiteoutTick(A,e,dt);rw146HeartTick(A,e,dt)}catch(err){if(!SK146.err++)console.error('v146 whiteout',err)}};
  B.denClear=function(A,won){try{c0&&c0.apply(this,arguments)}catch(_){}sk146DenClear(A)}}}
// ---------------- the signature: Frozen Heart ----------------
function rw146Brazier(){const g=new THREE.Group(),iron=new THREE.MeshStandardMaterial({color:0x3a404c,roughness:.45,metalness:.65,flatShading:true}),im=rw146IceMat();
  for(let k=0;k<3;k++){const a=k/3*6.283,l=new THREE.Mesh(svG('w46bl',()=>svTube([[0,0,0],[.12,.6,0],[.05,1.0,0]],.04,4)),iron);l.position.set(Math.sin(a)*.4,0,Math.cos(a)*.4);l.rotation.y=a+Math.PI/2;g.add(l)}
  const bowl=new THREE.Mesh(svG('w46bw',()=>new THREE.CylinderGeometry(.55,.32,.35,10,1,true).toNonIndexed()),iron);bowl.position.y=1.1;g.add(bowl);
  const coal=new THREE.Mesh(svG('w46cl',()=>svLump(.4,0,.4,35)),new THREE.MeshStandardMaterial({color:0x2a1a14,roughness:.9,flatShading:true}));coal.position.y=1.15;coal.scale.set(1,.4,1);g.add(coal);
  const blk=new THREE.Mesh(svG('w46ib',()=>svLump(.85,1,.25,36)),im);blk.position.y=1.0;blk.scale.set(1,1.35,1);g.add(blk);
  for(let k=0;k<5;k++){const a=k/5*6.283,s=new THREE.Mesh(svG('w46is',()=>{const q=new THREE.ConeGeometry(.14,.8,5);q.translate(0,.4,0);return q.toNonIndexed()}),im);s.position.set(Math.sin(a)*.6,.3,Math.cos(a)*.6);s.rotation.set(Math.cos(a)*.5,0,-Math.sin(a)*.5);g.add(s)}
  return {g,iron}}
function rw146Fire(A,p){const g=new THREE.Group(),y0=GH(p.x,p.z);g.position.set(p.x,y0,p.z);const F=[];
  const fm=new THREE.MeshBasicMaterial({color:0xff9a3a,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),fm2=new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  for(let k=0;k<5;k++){const c=new THREE.Mesh(svG('w46fc',()=>{const q=new THREE.ConeGeometry(.22,1,6,1,true);q.translate(0,.5,0);return q}),k<3?fm:fm2);c.position.set((Math.random()-.5)*.4,1.2,(Math.random()-.5)*.4);c.userData.ph=Math.random()*6;F.push(c);g.add(c)}
  const gl=kqSpr(0xff9a3a,3.2);gl.position.y=1.8;g.add(gl);const L=new THREE.PointLight(0xff9a3a,2.2,9,1.6);L.position.set(p.x,y0+2,p.z);sk146DenAdd(A,L);   // a pooled source: added to the scene itself
  const ring=new THREE.Mesh(svG('w46wr',()=>new THREE.RingGeometry(2.6,2.8,40).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:0xffb060,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));ring.position.y=.14;g.add(ring);
  g.userData.lpsSkip=1;sk146DenAdd(A,g);let t=0;const o={g,x:p.x,z:p.z,r:2.7,on:true,stop(){o.on=false}};
  kqFx({tick(dt){t+=dt||0;if(!o.on||!g.parent){if(g.parent)g.parent.remove(g);if(L.parent)L.parent.remove(L);fm.dispose();fm2.dispose();return false}F.forEach((c,k)=>{c.scale.set(1,1+.35*Math.sin(t*9+c.userData.ph),1);c.rotation.y+=dt*3});gl.scale.setScalar(3+.4*Math.sin(t*11));L.intensity=2+.5*Math.sin(t*13);
    ring.material.opacity=.4+.2*Math.sin(t*4);if(Math.random()<.5)burst(gY(p,1.6+Math.random()),0xffb060,1,.4,1.5,.6);return true},end(){if(g.parent)g.parent.remove(g)}});
  const D=sk146Den(A);(D.fires=D.fires||[]).push(o);return o}
function rw146HeartStart(c){const e=c.e,S=c.S,A=c.A;if(!A)return;S.dr=.1;const D=sk146Den(A),y0=GH(A.cx,A.cz),a0=Math.random()*6.283;D.fires=[];
  // the shell
  const sh=new THREE.Group(),im=rw146IceMat();const core=new THREE.Mesh(svG('w46sh',()=>svLump(1.6,1,.3,37)),im);core.scale.set(1,1.7,1);core.position.y=2.6;sh.add(core);
  for(let k=0;k<10;k++){const a=k/10*6.283,s=new THREE.Mesh(svG('w46ss',()=>{const q=new THREE.ConeGeometry(.3,2,5);q.translate(0,1,0);return q.toNonIndexed()}),im);s.position.set(Math.sin(a)*1.2,1+.4*(k%3),Math.cos(a)*1.2);s.rotation.set(Math.cos(a)*.7,0,-Math.sin(a)*.7);s.scale.setScalar(.7+.4*(k%2));sh.add(s)}
  sh.scale.setScalar(.01);sh.userData.lpsSkip=1;sk146DenAdd(A,sh);c.M.an.shell=sh;let st=0;
  kqFx({tick(dt){st+=dt||0;if(!sh.parent)return false;sh.position.copy(e.m.position);sh.position.y=GH(e.m.position.x,e.m.position.z);sh.scale.setScalar(Math.min(1,st/.7));return true},end(){}});
  // frost creeping in from the walls (the timer you can see)
  const fm=new THREE.MeshBasicMaterial({color:0xd8f4ff,transparent:true,opacity:.0,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3}),fr=new THREE.Mesh(svG('w46fr',()=>new THREE.RingGeometry(.9,1,64,1).rotateX(-Math.PI/2)),fm);
  fr.position.set(A.cx,y0+.15,A.cz);fr.renderOrder=16;sk146DenAdd(A,fr);c.M.an.frost={fr,fm,t:0,T:9};
  // three frozen braziers
  const L=[0,1,2].map(k=>{const a=a0+k/3*6.283,x=A.cx+Math.cos(a)*9,z=A.cz+Math.sin(a)*9,B=rw146Brazier();B.g.position.y=-1.4;let t=0;
    return {x,z,n:'Frozen Brazier',frac:.017,mesh:B.g,hbY:2.6,hbS:.8,cupY:1.3,
      tick(pe,dt,now){t+=dt;B.g.position.y=-1.4*Math.max(0,1-t/.8);if(Math.random()<dt*4)burst(gY(pe.m.position,1.2),0xd8f4ff,1,.3,.5,.6)},
      die(pe,killed){if(killed){const p=pe.m.position.clone();sk146Debris(gY(p,1.2),rw146IceMat(),14,.12,4.5,5,1.6);burst(gY(p,1.4),0xffb060,40,3,3,.7);sk146Flash(p,0xff9a3a,4,10,600);popT(p,'🔥 LIT','#ffd0a0');svSnd('crack',1,1.1);svSnd('charge',.5,1.3);rw146Fire(A,p)}B.iron.dispose()}}});
  const P=sk146Props(A,L);c.M.an.props=P;D.props=(D.props||[]).concat(P);
  svSnd('ice',1.2,.5);svSnd('hiss',1,.5);sk146Wall(e.m.position,RWR146.col,5,4,.8);sk146Flash(e.m.position,RWR146.col,5,16,900);
  try{banner('❄ FROZEN HEART','It sinks into a shell of ice — the den is freezing','Break the ice on all three braziers to light them!')}catch(_){}say('❄ The Rime Wraith encases itself in ice: light all three braziers before the frost takes the den!')}
function rw146HeartTick(A,e,dt){}
function rw146HeartCleanup(c){const S=c.S,M=c.M;S.dr=0;if(!M)return;const A=c.A;if(M.an.shell){const sh=M.an.shell;if(sh.parent)sh.parent.remove(sh);M.an.shell=null}
  if(M.an.frost){const f=M.an.frost;if(f.fr.parent)f.fr.parent.remove(f.fr);f.fm.dispose();M.an.frost=null}
  (M.an.props||[]).forEach(p=>{if(!p._gone)dqPropGone(p,false)});
  // the fires burn on a little, then die down
  const D=A&&A.s146;if(D&&D.fires){const L=D.fires;D.fires=[];setTimeout(()=>L.forEach(o=>o.stop()),3500)}}
function rw146HeartEnd(c,broken){const e=c.e,M=c.M,A=c.A;if(M.an.done2)return;M.an.done2=1;const p=e.m.position.clone();
  if(M.an.shell){sk146Debris(gY(p,2.4),rw146IceMat(),26,.2,7,6,2);sk146Wall(p,RWR146.col,7,4,.6);sk146Flash(p,RWR146.col,6,16,800);svSnd('ice',1.4,.6);svSnd('crack',1.2,.7)}
  if(broken){rw146HeartCleanup(c);svEndMove(e,true);svCast(e,'broken');try{banner('💔 THE SHELL SHATTERS','The heat of the braziers breaks the ice','Strike now!')}catch(_){}return}
  // Absolute Zero: the whole den freezes except beside a lit brazier
  const D=A&&A.s146,safe=((D&&D.fires)||[]).some(o=>Math.hypot(pl.position.x-o.x,pl.position.z-o.z)<o.r);
  sk146Heal(e,.1,RWR146.col);flash('rgba(220,245,255,.55)');shake(.5);svSnd('ice',1.6,.4);
  if(A){for(let k=0;k<26;k++){const a=Math.random()*6.283,r=Math.random()*ARENA_R;const q=new THREE.Vector3(A.cx+Math.cos(a)*r,0,A.cz+Math.sin(a)*r);setTimeout(()=>svSpike(q,rw146IceMat(),1.4+Math.random()*1.4,.35,1.4,.5),k*20)}}
  if(!safe&&hero.hp>0&&!(hero.iv>0)){bossHit(e,2.2);dqDebuff('Frozen','🧊',{mspd:-.6},2500,'Absolute Zero: frozen, −60% move speed')}else if(safe)dn(pl.position,'Warm!','#ffd0a0',-20,1200);
  rw146HeartCleanup(c)}
Object.assign(RWRM,{
  heart:{wt:(e,L)=>e.sv.hrN?9:30,cd:30,ph:2,r:[0,40],a:'any',armor:1,dur:11.2,inv:[0,.9],trn:[[0,.4,2]],
    trk:[[.6,'hEnc','io'],[9.6,'hEnc','l',.01],[10.1,'hRoar','o'],[10.7,'hRoar','l',.02],[11.2,'rRec','io']],
    go(c){c.S.hrN=(c.S.hrN||0)+1;if(c.S.gone)rwrGone(c.e,false);svSnd('whoosh',1,.5)},
    ev:[[.7,c=>rw146HeartStart(c)],[10.1,c=>rw146HeartEnd(c,false)]],
    tk(c,dt){const M=c.M,F=M.an.frost;if(F){F.t+=dt;const k=Math.min(1,F.t/F.T),r=ARENA_R*(1-.85*k);F.fr.scale.set(r,1,r);F.fm.opacity=Math.min(.5,F.t*.3);
        if(Math.random()<dt*20){const a=Math.random()*6.283;burst(new THREE.Vector3(c.A.cx+Math.cos(a)*r,GH(c.A.cx,c.A.cz)+.3,c.A.cz+Math.sin(a)*r),0xffffff,1,.3,.6,.6)}}
      if(Math.random()<dt*8)burst(svWP(c.e,'chest',0,.8,0),0xe8f8ff,1,.6,.4,.8);
      if(M.an.props&&c.t>1.4&&c.t<10.1&&!M.an.done2&&!sk146Alive(M.an.props).length)rw146HeartEnd(c,true)},
    end(c){rw146HeartCleanup(c)},rec:.6},
  broken:sk146Broken(SVB[2],4.6,'stag','rRec')});
// ---------------- richer effects ----------------
// icicles: shards, a crack and a cold flash where each lands
{const f=rwrIcicle;rwrIcicle=function(c,i){const S=c.S,L=S.icc||[],o=L[i];f.apply(this,arguments);try{if(!o)return;const q=c.inA(pl.position.clone(),.8),p=new THREE.Vector3(q.x,0,q.z);
  setTimeout(()=>{if(c.e.dead||!AF)return;sk146Debris(gY(p,.4),rw146IceMat(),7,.08,3.5,4,1.1);sk146Crack(p,0x9ad8ff,1.3,2);sk146Flash(p,0x9ad8ff,2,7,300)},600)}catch(_){}}}
// spike lines and rings: ice debris and a frost wall
{const f=rwrSpikes;rwrSpikes=function(c,an,L,w,dm){f.apply(this,arguments);try{for(let d=2;d<L;d+=3){const p=new THREE.Vector3(an.x+Math.sin(an.a)*d,0,an.z+Math.cos(an.a)*d);sk146Debris(gY(p,.5),rw146IceMat(),3,.07,2.5,4,1)}}catch(_){}}}
{const f=rwrRing;rwrRing=function(c,an,r0,r1,n,dm){f.apply(this,arguments);try{const p=new THREE.Vector3(an.x,0,an.z);sk146Wall(p,0xd8f4ff,r1+.5,2.6,.55);sk146Flash(p,0x9ad8ff,3.5,12,500);sk146Crack(p,0x9ad8ff,Math.max(2,r1*.55),2.6);sk146Debris(gY(p,.6),rw146IceMat(),10,.1,r1*.8,5,1.4)}catch(_){}}}
// Winter's Step: a storm of ice shards carries it
{const f=rwrGone;rwrGone=function(e,on){const r=f.apply(this,arguments);try{const a=gY(e.m.position,2);if(on)sk146Swarm(a,a.clone().add(new THREE.Vector3((Math.random()-.5)*5,4,(Math.random()-.5)*5)),24,0xd8f4ff,'shard',.8,{spread:3,s:.3});
  else{sk146Swarm(a.clone().add(new THREE.Vector3(0,5,0)),a,20,0xd8f4ff,'shard',.4,{spread:3,s:.3});sk146Flash(a,0x9ad8ff,2.5,8,300)}}catch(_){}return r}}
sk146AutoFx(RWRM,{sp:0xd8f4ff,dust:0xffffff});
try{svRegMoves(2)}catch(_){}
try{DSTXT[2].atk.push(['🧊 Frozen Heart','Phase II: it sinks into a shell of ice (warded) and frost creeps in from the walls; three frozen braziers rise.','Break the ice on all three braziers to light them: the heat shatters the shell and it drops BROKEN. If the frost reaches the middle, only the warmth beside a lit brazier is safe from Absolute Zero.'],
  ['🌨 The Whiteout','Phase II: a blizzard hides the far side of the den and the floor turns to ice: you slide, and the wind pushes you.','Dodge early and steer wide — you keep moving a moment after you stop.'])}catch(_){}
