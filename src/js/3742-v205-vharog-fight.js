// ================= v205 The Citadel II · the rampart gate and Vharog, the Bloodgorged: the fight =================
// The gateway of The Citadel II is gone: the road ends at a gate in the rampart wall (cq205Gatehouse 'rampart': an iron portcullis
// between two squat towers, war drums and spears) and before it, chained to the gate by its collar, sleeps the court's war-beast.
//  * Asleep: curled on its side, breathing, its chain looping back to a ring in the gate. Come within VH205.wake of it, or hurt it,
//    and it wakes: the chain tears out of the stones, it roars, and a wall of red mist rises round the clearing (no leaving, no
//    recall, no mount: kill it or die). A wipe (every hero down) or nobody left in the clearing puts it back to sleep, healed.
//  * The arena (VH205A): centred in the clearing a little before the gate, radius VH205.R; Phase II closes it by 1.5.
//  * Phase II "The Hunger Wakes" (vh205Storm): the blood moon comes out, the light turns red, the mist runs red and closes in,
//    bats wheel overhead.
//  * Night Hunt (signature): he leaps away and the light dies; he circles the edge in the dark (only his eyes and the dark smoke
//    off him show) and lunges across the arena through you every VH205.lg s (the lane shows first). Three siege ballistae stand at
//    the edge (VH205.bal): F at one cranks it (1 s, stay put) and looses a silver harpoon into him; its chain holds. Three chains
//    and he is dragged down CHAINED (the 'broken' stagger). If the hunt runs out (VH205.hT s) he drops on you, feeds and howls.
//  * Slain: the portcullis grinds up; F under it goes to III.
var VH205={e:null,lv:49,R:10.5,wake:9,lg:2.4,hT:16,G:null,wall:null,storm:null,bal:[],H:null,cr:null,moon:null,dk:0,err:0,ft:0,chainG:null};
var VH205BOSS={name:'Vharog',col:VH205M.col,body:2.0,ph2:.55,poise:.1,headJ:'head',turnA:3.2,edge:2.2,
  ai:{pref:3.6,walk:2.8,run:6.2,turn:2.6,rest:[.7,1.3],ph2r:.66,strafe:.55},
  build:vh205Build,loco:vh205Loco,post:vh205Post,P:VH205P,M:VH205MV,spr:{jaw:[60,8,1],earL:[30,5,1.2],earR:[30,5,1.2],tail1:[25,4,1.4],tail2:[22,4,1.6],wgL:[40,6,.8],wgR:[40,6,.8],chain:[18,3,1.5]},
  stag:[[.25,'stag','o'],[2.1,'stag','l',.025],[2.6,'rec','io']],stagT:2.6,
  die:[[.4,'stag','o'],[1.6,'dead','i'],[2.6,'dead','l']]};
VH205BOSS.M.stagger=svStagDef(VH205BOSS);
VH205BOSS.M.sleep={dur:9999,trk:[[.4,'sleep','io'],[9999,'sleep','l']]};
function vh205Here(){return cq205Here(1)}
function vh205Alive(){const e=VH205.e;return !!(e&&!e.dead&&enemies.includes(e))}
function vh205Spot(){if(vh205Spot.c)return vh205Spot.c;const F=cq205F(1),a=F.reach+.5,[x,z]=F.W2(a,0),G={F,a,x,z,ry:Math.atan2(-F.fx,-F.fz),y:F.y0};
  const [cx,cz]=F.W2(1.5,0),[sx,sz]=F.W2(F.reach-6.5,1.2);G.arena={cx,cz,r0:VH205.R};G.sleep={x:sx,z:sz,ry:G.ry+.6};
  // three ballistae at the edge of the arena, facing its centre
  G.bal=[70,-70,180].map(d=>{const t=d*Math.PI/180,r=VH205.R-1.2,[x,z]=F.W2(1.5+Math.cos(t)*r,Math.sin(t)*r);return {x,z,ry:Math.atan2(cx-x,cz-z)}});
  return vh205Spot.c=G}
function vh205Arena(){const S=vh205Spot();return {cx:S.arena.cx,cz:S.arena.cz,r:S.arena.r0-1.8,hr:S.arena.r0,y:S.y,f:false,r0:S.arena.r0}}
// ---------------- the rampart gate ----------------
function vh205GateBuild(){if(VH205.G)return VH205.G;const S=vh205Spot(),G=cq205Gatehouse({kind:'rampart'});G.g.position.set(S.x,S.y-.05,S.z);G.g.rotation.y=S.ry;scene.add(G.g);G.spot=S;cq205PlaceLights(G);
  try{G.cleared=cq205ClearFoot(S,G.dims)}catch(_){}G.tiles=cq205FootTiles(S,G.dims);G.tiles.T.forEach(k=>CBLK.add(k));
  // the ring in the stones the chain runs to
  const [rx,rz]=cq205GW(S,1.6,G.dims.fz+.6);G.ring={x:rx,z:rz,y:GH(rx,rz)+.5};
  // the ballistae
  VH205.bal=S.bal.map((b,i)=>{const o=vh205Ballista();o.position.set(b.x,GH(b.x,b.z),b.z);o.rotation.y=b.ry;scene.add(o);CBLK.add(Math.round(b.z)*W+Math.round(b.x));return {o,x:b.x,z:b.z,ry:b.ry,i,used:0,beam:null}});
  VH205.G=G;vh205GateSync();return G}
function vh205GateSync(){const G=VH205.G;if(!G)return;const open=cq205Done(2);G.op=open;G.raising=0;G.tok=(G.tok||0)+1;G.port.position.y=open?G.dims.hs+G.dims.dA-.4:0;G.light.intensity=open?1.6:0;G.haze.material.opacity=open?.5:0;G.pass.material.color.setHex(open?0x3a0a0a:0x050203)}
function vh205Raise(){const G=VH205.G;if(!G)return;G.raising=1;G.op=true;const tok=G.tok=(G.tok||0)+1;svSnd('heavy',1.1,.45);try{dg165Snd('grind',1,.55);dg165Snd('creak',.9,.5)}catch(_){}let t=0;const top=G.dims.hs+G.dims.dA-.4;
  kqFx({tick(dt){if(G.tok!==tok)return false;t+=dt||0;const k=svEase.io(Math.min(1,t/3.6));G.port.position.y=top*k;G.light.intensity=1.6*k;G.haze.material.opacity=.5*k;G.pass.material.color.setRGB(.23*k+.02,.04*k+.01,.04*k+.01);if(Math.random()<.3){const q=new THREE.Vector3();G.g.localToWorld(q.set((Math.random()-.5)*5,.3,G.dims.fz-.4));burst(q,0x7a6a6a,2,1,.6,.8)}return t<3.6},end(){if(G.tok===tok)G.raising=0}})}
// a siege ballista: a trestle, the stock, two bow arms, the string, a winch, a silver harpoon loaded (o.userData.h)
function vh205Ballista(){const g=dt168Group('CQ205|bal',k=>{const P=(geo,t,col,x,y,z,rx,ry,rz,sx,sy,sz)=>dt168P(k,geo,t,col,dt168Mx(x,y,z,rx,ry,rz,sx,sy,sz)),BB=dt168BBox,wd=0x4a3220,wd2=0x2e1e14,ir=0x34343a;
    [-1,1].forEach(s=>{P(BB(.14,1.1,.14,.02),'c',wd2,s*.45,.55,-.4,0,0,s*.15);P(BB(.14,1.1,.14,.02),'c',wd2,s*.45,.55,.4,0,0,s*.15)});P(BB(1.1,.12,1.0,.02),'c',wd,0,1.08,0);
    P(BB(.22,.2,2.4,.03),'c',wd,0,1.25,.15);P(BB(.08,.06,2.2,.01),'m',ir,0,1.37,.2);
    [-1,1].forEach(s=>{P(dt168Geo('cq_bar',()=>svTube([[0,0,0],[.5,0,-.12],[1.0,0,-.38],[1.35,0,-.72]],[.07,.06,.05,.04],5)),'c',wd2,s*.12,1.3,1.1,0,s>0?0:Math.PI,0);P(BB(.06,.06,.06,.01),'m',ir,s*1.45,1.3,.38)});
    P(dt168Geo('cq_str',()=>new THREE.CylinderGeometry(.012,.012,2.9,4)),'c',0xb8a888,0,1.32,.36,0,0,Math.PI/2);
    P(dt168Geo('cq_win',()=>new THREE.CylinderGeometry(.16,.16,.5,8)),'c',wd2,0,1.2,-.95,0,0,Math.PI/2);[-1,1].forEach(s=>P(BB(.05,.4,.05,.01),'m',ir,s*.32,1.2,-.95))},{c:{g:[1,.3],n:.12,sd:217},m:{n:.1,sd:218}});
  const h=dt168Group('CQ205|harp',k=>{const P=(geo,t,col,x,y,z,rx,ry,rz,sx,sy,sz)=>dt168P(k,geo,t,col,dt168Mx(x,y,z,rx,ry,rz,sx,sy,sz));P(dt168Geo('cq_hs',()=>new THREE.CylinderGeometry(.04,.04,2.2,5)),'m',0x8a8a92,0,0,0,Math.PI/2,0,0);
    P(dt168Geo('cq_hh',()=>new THREE.ConeGeometry(.12,.45,4)),'m',0xe8e8f0,0,0,1.3,Math.PI/2,0,0);[-1,1].forEach(s=>P(dt168Geo('cq_hb',()=>new THREE.ConeGeometry(.05,.3,3)),'m',0xd8d8e0,s*.1,0,1.0,-Math.PI/2+.5*s,0,0))},{m:{n:.1,sd:219}});
  h.position.set(0,1.45,.4);g.add(h);g.userData.h=h;g.userData.psNo=1;return g}
// ---------------- the chain from his collar to the gate (while he sleeps) ----------------
function vh205ChainTick(){const e=VH205.e,G=VH205.G;if(!G)return;const asleep=vh205Alive()&&!(VH205A&&VH205A.f)&&!VH205.waking&&vh205Here();
  if(!VH205.chainG){const g=new THREE.Group(),lg=new THREE.TorusGeometry(.13,.04,4,8),lm=new THREE.MeshStandardMaterial({color:0x4a2e24,roughness:.75,metalness:.4,flatShading:true});for(let i=0;i<22;i++){const l=new THREE.Mesh(lg,lm);l.userData.lpsSkip=1;g.add(l)}scene.add(g);VH205.chainG=g}
  const g=VH205.chainG;g.visible=asleep;if(!asleep)return;const a=svWP(e,'chain',0,-.45,0),b=new THREE.Vector3(G.ring.x,G.ring.y,G.ring.z),N=g.children.length;
  g.children.forEach((l,i)=>{const t=i/(N-1);l.position.lerpVectors(a,b,t);l.position.y=Math.max(GH(l.position.x,l.position.z)+.08,l.position.y-Math.sin(t*Math.PI)*.9);const n=g.children[Math.min(N-1,i+1)];if(n!==l)l.lookAt(a.clone().lerp(b,t+.05));l.rotateX(Math.PI/2);if(i%2)l.rotateY(Math.PI/2)})}
// ---------------- the mist wall round the arena ----------------
function vh205MistTex(){if(VH205.tex)return VH205.tex;const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');
  for(let i=0;i<420;i++){const px=Math.random()*256,py=Math.random()*128,l=10+Math.random()*50,a=.06+Math.random()*.25;x.fillStyle='rgba('+(120+Math.random()*80|0)+','+(10+Math.random()*20|0)+','+(20+Math.random()*20|0)+','+a+')';x.fillRect(px,py,l,2+Math.random()*4);x.fillRect(px-256,py,l,2+Math.random()*4)}
  const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'rgba(80,10,20,0)');g.addColorStop(.3,'rgba(90,10,20,.35)');g.addColorStop(1,'rgba(60,5,12,.8)');x.fillStyle=g;x.fillRect(0,0,256,128);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return VH205.tex=t}
function vh205WallMake(){if(VH205.wall)return VH205.wall;const A=vh205Arena(),g=new THREE.Group();g.name='VharogWall';const geo=new THREE.CylinderGeometry(1,1,1,56,1,true);geo.translate(0,.5,0);const L=[];
  [[1,4.6,.5,1],[1.05,6.2,.3,-.6],[.97,2.8,.42,1.5]].forEach(([s,h,op,sp],i)=>{const t=vh205MistTex().clone();t.needsUpdate=true;t.repeat.set(5+i*2,1);const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:op,side:THREE.DoubleSide,depthWrite:false,fog:true,color:0xd03040}));
    m.scale.set(A.r0+.9*s,h,A.r0+.9*s);m.renderOrder=3;m.userData.lpsSkip=1;g.add(m);L.push({m,t,sp,s,op})});
  g.position.set(A.cx,A.y-.6,A.cz);g.visible=false;scene.add(g);VH205.wall={g,L,k:0,want:0};return VH205.wall}
function vh205WallSet(on){const W=vh205WallMake();W.want=on?1:0;if(on)W.g.visible=true}
function vh205WallTick(dt,t){const W=VH205.wall;if(!W)return;W.k+=(W.want-W.k)*Math.min(1,dt*1.6);W.g.visible=W.k>.01&&vh205Here();if(!W.g.visible)return;const R=(VH205A?VH205A.hr:vh205Spot().arena.r0)+.9;
  W.L.forEach(o=>{o.t.offset.x=(t*.06*o.sp)%1;o.t.offset.y=(t*.025)%1;o.m.scale.set(R*o.s,o.m.scale.y,R*o.s);o.m.material.opacity=o.op*W.k*(VH205.storm?1.3:1)});W.g.scale.y=Math.max(.05,W.k);
  if(Math.random()<dt*14){const a=Math.random()*6.283;burst(new THREE.Vector3(W.g.position.x+Math.cos(a)*R,W.g.position.y+1+Math.random()*4,W.g.position.z+Math.sin(a)*R),0x8a1020,1,.6,.4,.9)}}
// ---------------- Phase II: the blood moon, the red light, the mist closing in, bats overhead ----------------
function vh205Storm(on){const A=VH205A;if(!A)return;if(!on){VH205.storm=null;A.r=A.r0-1.8;A.hr=A.r0;return}if(VH205.storm)return;A.r=A.r0-1.8-1.5;A.hr=A.r0-1.5;VH205.storm={bt:2};
  if(!VH205.moon){const F=cq205F(1),g=new THREE.Group(),m=new THREE.Sprite(new THREE.SpriteMaterial({map:us205MoonTex(),transparent:true,opacity:0,depthWrite:false,fog:false}));m.scale.set(44,44,1);g.add(m);const [x,z]=F.W2(F.reach+150,14);g.position.set(x,F.y0+62,z);scene.add(g);VH205.moon={g,m,k:0}}}
function vh205StormTick(dt,t){const S=VH205.storm,M=VH205.moon,here=vh205Here();if(M){M.k+=((S&&here?1:0)-M.k)*Math.min(1,dt*.5);M.g.visible=M.k>.01&&here;M.m.material.opacity=M.k*.95}
  const want=here&&VH205A&&VH205A.f?(VH205.H?.92:S?.45:0):0;VH205.dk+=(want-VH205.dk)*Math.min(1,dt*(want>VH205.dk?1.2:.5));
  if(!S||!VH205A||!here)return;S.bt-=dt;if(S.bt<=0){S.bt=3+Math.random()*3;const A=VH205A,a=Math.random()*6.283,p0=new THREE.Vector3(A.cx+Math.cos(a)*16,A.y+7,A.cz+Math.sin(a)*16),p1=new THREE.Vector3(A.cx-Math.cos(a)*16,A.y+5,A.cz-Math.sin(a)*16);
    try{sk146Swarm(p0,p1,14,0x1a0a10,'bat',2.6,{spread:4,arc:2})}catch(_){}}}
{const f=atmos;atmos=function(dt,now){const r=f.apply(this,arguments);try{const d=VH205.dk;if(d>.002&&vh205Here()){sun.intensity*=Math.max(.05,1-.85*d);hemi.intensity*=Math.max(.12,1-.7*d);
      const fc=VH205.fc||(VH205.fc=new THREE.Color(0x2a0408));scene.fog.color.lerp(fc,.8*d);scene.background=scene.fog.color;try{const su=SKY.material.uniforms;su.top.value.lerp(fc,.85*d);su.hor.value.lerp(fc,.7*d)}catch(_){}}}catch(_){}return r}}
// ---------------- Night Hunt: circling in the dark, lunging, the ballistae ----------------
function vh205HuntStart(e){vh205HuntClear();const A=VH205A,S=e.sv,rnd=S.mv?S.mv.rnd:Math.random;S.hN=(S.hN||0)+1;S.hunt=1;
  VH205.H={t:0,left:VH205.hT,ch:0,ang:Math.atan2(e.m.position.x-A.cx,e.m.position.z-A.cz),dir:rnd()<.5?1:-1,next:1.6,ln:null,beams:[]};VH205.bal.forEach(b=>{b.used=0;b.o.userData.h.visible=true});
  svStart(e,'prowl',S.mv?S.mv.seed:1);say('🌑 Vharog vanishes into the dark. Only his eyes… circling. The ballistae! Harpoon him — three chains will hold him.');svSnd('shriek',.7,.5)}
function vh205Prowl(c,dt){const H=VH205.H,A=VH205A,e=c.e;if(!H||!A){svEndMove(e,true);return}c.S.hunt=1;H.t+=dt;H.left-=dt;
  if(H.ln){const L=H.ln;L.t+=dt;if(L.t<.85){c.m.rotation.y=L.a;return}// the lunge: along the lane at speed
    const u=Math.min(1,(L.t-.85)/.45),x=L.x0+Math.sin(L.a)*L.len*u,z=L.z0+Math.cos(L.a)*L.len*u;c.m.position.x=x;c.m.position.z=z;c.S.rmOn=1;
    if(!L.hit&&u>.2&&hero.hp>0){const dx=pl.position.x-x,dz=pl.position.z-z;if(Math.hypot(dx,dz)<1.8){L.hit=1;vh205HitNow(e,{k:'c',r:99},{x,z,a:0},1.1,{flash:false,kb:3,on:()=>vh205Bleed(e,1)})}}
    if(Math.random()<.8)burst(gY(c.m.position,1),0x1a0a10,3,1,.6,.5);if(u>=1){H.ang=Math.atan2(x-A.cx,z-A.cz);H.ln=null;H.next=VH205.lg}return}
  // circle the edge, eyes in the dark
  const r=A.r-.4;H.ang+=dt*H.dir*.85;const x=A.cx+Math.sin(H.ang)*r,z=A.cz+Math.cos(H.ang)*r;c.m.position.x=x;c.m.position.z=z;c.m.rotation.y=H.ang+H.dir*Math.PI/2;c.S.spd=6;
  H.next-=dt;if(H.next<=0&&hero.hp>0){const P=pl.position,a=Math.atan2(P.x-x,P.z-z),dx=Math.sin(a),dz=Math.cos(a),ox=x-A.cx,oz=z-A.cz,b2=ox*dx+oz*dz,cc=ox*ox+oz*oz-r*r,len=Math.max(4,-b2+Math.sqrt(Math.max(0,b2*b2-cc)));
    H.ln={t:0,x0:x,z0:z,a,len,hit:0};H.ln.W=svWarn({k:'l',w:3.0,l:len,b:0},{x,z,a},.85,{col:0xb01020});svSnd('roar',.5,1.3);c.m.rotation.y=a}}
function vh205HuntEnd(won){const H=VH205.H,e=VH205.e;if(!H)return;VH205.H=null;VH205.cr=null;if(H.ln&&H.ln.W)try{H.ln.W.kill()}catch(_){}if(!e||e.dead)return;e.sv.hunt=0;svEndMove(e,true);
  if(won){const A=VH205A,dx=A.cx-e.m.position.x,dz=A.cz-e.m.position.z,l=Math.hypot(dx,dz)||1;e.m.position.x+=dx/l*2.5;e.m.position.z+=dz/l*2.5;svCast(e,'broken')}else{vh205ChainsOff();svCast(e,'hfail')}}
function vh205HuntClear(){const H=VH205.H;if(H&&H.ln&&H.ln.W)try{H.ln.W.kill()}catch(_){}VH205.H=null;VH205.cr=null;vh205ChainsOff();if(VH205.e&&VH205.e.sv)VH205.e.sv.hunt=0}
function vh205ChainsOff(){VH205.bal.forEach(b=>{if(b.beam){try{b.beam.stop&&b.beam.stop()}catch(_){}b.beam=null}})}
function vh205HuntTick(dt){const H=VH205.H;if(!H)return;const e=VH205.e;if(!e||e.dead){vh205HuntClear();return}
  if(H.left<=0&&!H.ln&&(typeof vh180Auth!='function'||vh180Auth())){vh205HuntEnd(false);return}
  // the crank: stay put for a second, then loose
  const C=VH205.cr;if(C){const b=VH205.bal[C.i];C.t+=dt;if(Math.hypot(pl.position.x-b.x,pl.position.z-b.z)>2.6||hero.hp<=0){VH205.cr=null;popT(pl.position,'LET GO','#c0c0c0')}
    else if(C.t>=1){VH205.cr=null;vh205Loose(b.i,true)}}}
function vh205Loose(i,own){const b=VH205.bal[i],e=VH205.e,H=VH205.H;if(!b||b.used||!e||e.dead||!H)return;b.used=1;b.o.userData.h.visible=false;svSnd('whoosh',1.3,1.2);svSnd('crack',.8,1.5);
  const a=new THREE.Vector3(b.x,GH(b.x,b.z)+1.45,b.z),tgt=()=>svWP(e,'chest',0,.2,.4),T=.35,hm=b.o.userData.h.clone();hm.visible=true;
  svShot(a,tgt(),T,0xe8e8ff,.5,.6,()=>{if(!VH205.H||e.dead)return;VH205.H.ch++;burst(tgt(),0xe8e8ff,30,1.4,1.2,.5);svSnd('heavy',.9,1.4);popT(e.m.position,'CHAINED '+VH205.H.ch+' / 3','#e8e8ff',true);
    try{b.beam=sk146Beam(()=>new THREE.Vector3(b.x,GH(b.x,b.z)+1.45,b.z),()=>e.dead?null:tgt(),0xd8d8ff,.06)}catch(_){}
    if(VH205.H.ch>=3&&(typeof vh180Auth!='function'||vh180Auth()))vh205HuntEnd(true)},hm);
  if(own&&typeof co205Loose=='function')co205Loose(i)}
// ---------------- spawning, the waking, the fight, the reset, the win ----------------
function vh205Spawn(){if(vh205Alive())return VH205.e;const S=vh205Spot(),key='vharog';
  if(!EN[key])EN[key]=Object.assign({},EN.bloodhound||EN.vamp,{n:'Vharog',e:'🦇'});try{MSET[key]=[]}catch(_){}
  const c=enemyC(key,VH205.lv,{boss:1});c.n='Vharog';const m=cr(c);m.position.set(S.sleep.x,0,S.sleep.z);m.rotation.y=S.sleep.ry;scene.add(m);
  const hb=bar(true);hb.scale.setScalar(3);
  const e={c,m,hb,boss:1,vh205:1,tier:4,home:[S.sleep.x,S.sleep.z],cd:1,ch:0,vx:0,vz:0,agg:0,bs:{t:99,lock:0,ph:1,last:'',ult:99,pb:99},wx:S.sleep.x,wz:S.sleep.z,wt:0,dots:[]};enemies.push(e);
  m.children.forEach(o=>{o.visible=false});const R=svRig();vh205Build(R,e);svRest(R);try{svMerge(R)}catch(err){console.error('vh merge',err)}const bs=m.bs||m.scale.x||1;R.root.scale.setScalar(1/bs);R.root.name='svvh';m.add(R.root);
  const O={};for(const k in R.J)O[k]=[0,0,0,0,0,0];
  e.sv={i:'vh',B:VH205BOSS,R,O,P:{},snap:{},aw:0,trk:null,tt:0,mv:null,ph:1,rest:1.5,last:[],cd:{},po:0,poT:0,stg:0,inv:0,spd:0,lp:m.position.clone(),hero:1,body:VH205BOSS.body,on:false,wait:0,act:0,fl:0,chg:0,dr:0};
  VH205A=vh205Arena();svApply(e,0,performance.now());svStart(e,'sleep',1);VH205.e=e;return e}
function vh205Wake(){const e=VH205.e;if(!e||e.dead||VH205.waking||VH205A&&VH205A.f)return;VH205.waking=1;VH205A=vh205Arena();vh205WallSet(true);if(riding)try{dismount()}catch(_){}
  // the chain tears out of the gate
  try{const G=VH205.G;const p=new THREE.Vector3(G.ring.x,G.ring.y,G.ring.z);burst(p,0x6a5a50,30,2,2,.7);sk146Debris(p,vh205BloodMat(),6,.14,4,5,1.2)}catch(_){}svSnd('crack',1.2,.6);svSnd('heavy',.9,.7);shake(.3);
  say('🦇 The heap of hide by the gate uncurls. Its chain tears out of the stones — and a wall of red mist rises around you.');vh205Start(e)}
function vh205Start(e){const S=e.sv,A=VH205A;if(!A||A.f)return;A.f=true;VH205.waking=0;e.agg=1;S.on=false;S.ph=1;e.bs.ph=1;S.rest=1;S.po=0;VH205.ft=0;vh205WallSet(true);svEndMove(e,true);
  try{setTarget(e)}catch(_){}cq205Card('The Rampart Gate','Vharog','the Bloodgorged · war-beast of the court','The mist walls you in: kill it, or die');svSnd('heavy',1,.5)}
// back to sleep (a wipe, or nobody left in the clearing): he is gone and comes back healed, asleep at the gate
function vh205Reset(why){const e=VH205.e,A=VH205A;if(A)A.f=false;VH205.waking=0;vh205Storm(false);vh205HuntClear();vh205WallSet(false);VH205B.n=0;
  if(e&&!e.dead){svEndMove(e,true);try{burst(gY(e.m.position,1.5),0x8a0a14,60,4,2,1)}catch(_){}try{removeE(e)}catch(_){}}VH205.e=null;VH205A=null;
  if(why)cq205After(1,()=>say('🦇 Vharog drags himself back to the gate, licking his wounds, and curls up in the mist. He will wake again.'))}
// he falls: the mist sinks, the portcullis grinds up
function vh205Won(e){const A=VH205A;if(A)A.f=false;CQ205.c2.st=Math.max(CQ205.c2.st,1);CQ205.trkK='';vh205Storm(false);vh205HuntClear();vh205WallSet(false);VH205B.n=0;
  cq205After(1.8,()=>{try{vh205Raise()}catch(err){console.error('v205 portcullis',err)}});
  cq205After(2.6,()=>{cq205Card('The Rampart Gate','Vharog Falls','The Bloodgorged bleeds out on the flagstones','The portcullis grinds open');try{mSfx('victory')}catch(_){}say('🦇 Vharog, the Bloodgorged, is slain. Somewhere inside the wall a winch turns: the portcullis rises.')});
  if(typeof co205Credit=='function')co205Credit('c2');try{hud()}catch(_){}}
// ---------------- hooks: his AI, his death, the HUD ----------------
{const f=eTick;eTick=function(e,dt,now){if(e&&e.vh205){try{vh205AI(e,dt,now)}catch(err){if(!VH205.err++)console.error('v205 vharog ai',err)}return true}return f.apply(this,arguments)}}
{const f=kill;kill=function(e){const r=f.apply(this,arguments);if(e&&e.vh205)try{vh205Won(e)}catch(err){console.error('v205 won',err)}return r}}
// asleep, the first blow wakes him; while he prowls in the dark he cannot be hurt
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.vh205&&!e.dead){if(!(VH205A&&VH205A.f)){vh205Wake();if(typeof co205Wake=='function')co205Wake()}if(e.sv&&e.sv.mv&&e.sv.mv.id==='prowl')return}return f.apply(this,arguments)}}
function vh205Hud(){const e=VH205.e,on=!!(e&&!e.dead&&VH205A&&VH205A.f&&vh205Here());let p=document.getElementById('vhPo');if(!on){if(p)p.style.display='none';return}
  const b=$('boss');if(!b)return;b.classList.remove('hide');const S=e.sv,H=VH205.H;$('bossN').textContent='🦇 Vharog · the Bloodgorged · Phase '+(S.ph>1?'II':'I')+(H?' · NIGHT HUNT: harpoon him ('+H.ch+'/3) · '+Math.max(0,Math.ceil(H.left))+'s':'');$('bossB').style.width=Math.max(0,100*e.c.h/M(e.c))+'%';
  if(!p){p=document.createElement('div');p.id='vhPo';p.style.cssText='height:5px;margin:4px auto 0;width:70%;background:rgba(0,0,0,.6);border:1px solid rgba(255,216,96,.35);border-radius:2px;overflow:hidden';p.innerHTML='<i style="display:block;height:100%;width:0;background:linear-gradient(90deg,#c89020,#ffe080);transition:width .12s"></i>';const mt=b.querySelector('.meter');if(mt)mt.after(p);else b.appendChild(p)}
  p.style.display='block';p.firstChild.style.width=(S.stg>0?100:Math.min(100,S.po*100)).toFixed(1)+'%';p.firstChild.style.background=S.stg>0?'#fff4c0':'linear-gradient(90deg,#c89020,#ffe080)'}
{const f=hud;hud=function(){const r=f.apply(this,arguments);try{vh205Hud()}catch(_){}return r}}
// his AI: the engine's moves, picks and rests; his own footwork in the arena
function vh205AI(e,dt,now){const S=e.sv,A=VH205A,m=e.m;if(!A)return;if(e.hb)e.hb.visible=false;m.visible=vh205Here();
  const dx=m.position.x-S.lp.x,dz=m.position.z-S.lp.z;S.lp.copy(m.position);const ms=dt>0?Math.hypot(dx,dz)/dt:0;S.spd+=((ms>14?0:ms)-S.spd)*Math.min(1,dt*8);
  for(const k in S.cd)S.cd[k]=Math.max(0,S.cd[k]-dt);S.inv=Math.max(0,S.inv-dt);S.chg=(S.chg||0)+((S.chgT||0)-(S.chg||0))*Math.min(1,dt*3);
  {const p=pl.position;if(S.hp0&&dt>0){const vx=(p.x-S.hp0.x)/dt,vz=(p.z-S.hp0.z)/dt,a=Math.min(1,dt*6);if(Math.hypot(vx,vz)<20){S.hv=S.hv||{x:0,z:0};S.hv.x+=(vx-S.hv.x)*a;S.hv.z+=(vz-S.hv.z)*a}}S.hp0={x:p.x,z:p.z}}
  if(!A.f){// asleep: the sleep pose (healed), breathing; wake when a hero comes close
    if(!S.mv||S.mv.id!=='sleep')svStart(e,'sleep',1);e.c.h=M(e.c);e.agg=0;if(S.mv)svTickMove(e,dt,now);svApply(e,dt,now);
    if(vh205Here()&&hero.hp>0&&Math.hypot(pl.position.x-m.position.x,pl.position.z-m.position.z)<VH205.wake&&(typeof vh180Auth!='function'||vh180Auth())){vh205Wake();if(typeof co205Wake=='function')co205Wake()}return}
  if(vh205End()){vh205Reset(true);if(typeof vh180Ended=='function')vh180Ended();return}
  VH205.ft+=dt;e.agg=1;
  if(!S.on){S.on=true;S.ph=1;e.bs.ph=1;S.rest=1;S.po=0;if(vh180Auth())svCast(e,'intro')}
  if(now-S.poT>3500)S.po=Math.max(0,S.po-dt*.1);
  if(S.mv)svTickMove(e,dt,now);
  else if(!vh180Auth())vh180Glide(e,dt);
  else if(S.ph===1&&e.c.h/M(e.c)<=VH205BOSS.ph2)svCast(e,'awaken');
  else if(!VH205.H){vh205Move(e,dt);S.rest-=dt;if(S.rest<=0){const id=svPick(e);if(id)svCast(e,id);else S.rest=.25}}
  // the hunt: he prowls until it ends
  if(VH205.H&&!(S.mv&&(S.mv.id==='prowl'||S.mv.id==='hunt'))&&vh180Auth())svStart(e,'prowl',1);
  vh205Clamp(m.position,S.mv&&S.mv.id==='prowl'?.2:VH205BOSS.edge);
  // keep the hero in the arena and out of his body
  {const p=pl.position,hx=p.x-A.cx,hz=p.z-A.cz,hd=Math.hypot(hx,hz);if(hd>A.hr){p.x=A.cx+hx/hd*A.hr;p.z=A.cz+hz/hd*A.hr}}
  if(!S.rmOn&&hero.hp>0&&m.visible&&!(S.mv&&(S.mv.id==='feed'||S.mv.id==='prowl'))){const hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,hl=Math.hypot(hx,hz),R0=S.body;if(hl<R0&&hl>.001){const k=R0-hl;pl.position.x+=hx/hl*k;pl.position.z+=hz/hl*k}}
  svApply(e,dt,now)}
// footwork: to his preferred range at a lope (a gallop when far), circling there, backing off when crowded
function vh205Move(e,dt){const S=e.sv,ai=VH205BOSS.ai,m=e.m,v=V().subVectors(pl.position,m.position).setY(0),L=v.length()||.01;
  const da=svAng(Math.atan2(v.x,v.z)-m.rotation.y),tr=ai.turn*(S.ph>1?1.2:1);m.rotation.y+=Math.max(-tr*dt,Math.min(tr*dt,da));
  let sp=0,ux=0,uz=0;const ws=ai.walk*(S.ph>1?1.15:1);
  if(L>ai.pref+1.2){sp=L>ai.pref+6?ai.run:ws;ux=v.x/L;uz=v.z/L}else if(L<2.2){sp=ws*.6;ux=-v.x/L;uz=-v.z/L}
  else{S.sdT=(S.sdT||0)-dt;if(S.sdT<=0){S.sdT=1.6+Math.random()*2;S.sd=Math.random()<.5?-1:1}sp=ws*ai.strafe;ux=-v.z/L*(S.sd||1);uz=v.x/L*(S.sd||1)}
  const A=VH205A,rx=m.position.x-A.cx,rz=m.position.z-A.cz,rl=Math.hypot(rx,rz)||.01;if(rl>A.r-2.5){const nx=rx/rl,nz=rz/rl,out=ux*nx+uz*nz;if(out>0){ux-=nx*out;uz-=nz*out}}
  if(sp>0&&Math.abs(da)<1.5){m.position.x+=ux*sp*dt;m.position.z+=uz*sp*dt}else sp=0;S.walkSp=sp}
function vh205End(){if(typeof vh180End=='function')return vh180End();return hero.hp<=0||!vh205Here()||(typeof AWD!='undefined'&&AWD.dead)}
// solo defaults (3760 replaces them for co-op)
function vh180Auth(){return true}
function vh180Glide(e,dt){}
// no recall, no mount once he is awake
function vh205Held(){return !!(VH205A&&VH205A.f)&&vh205Here()}
{const f=doRecall;doRecall=function(){if(vh205Held())return say('🦇 The red mist holds you in. There is no escape: kill it, or die.');return f.apply(this,arguments)}}
{const f=toggleMount;toggleMount=function(){if(vh205Held()&&!riding)return say('🦇 No mount will come near that thing.');return f.apply(this,arguments)}}
// ---------------- prompts: the ballistae, the gate ----------------
function vh205Prompt(){if(!vh205Here()||!VH205.G)return null;const P=pl.position;
  if(VH205.H){for(const b of VH205.bal){if(b.used||Math.hypot(P.x-b.x,P.z-b.z)>2.4)continue;if(VH205.cr&&VH205.cr.i===b.i)return {label:'⚙️ Cranking the ballista… hold still',fn:()=>{}};return {label:'F · Crank and loose the ballista (a silver harpoon)',fn:()=>{VH205.cr={i:b.i,t:0};svSnd('step',1,.5);try{dg165Snd('creak',.9,1.2)}catch(_){}}}}}
  const G=VH205.G,[x,z]=cq205GW(G.spot,0,G.dims.fz+2);if(Math.hypot(P.x-x,P.z-z)<4){if(cq205Done(2)){const N=cq205I(2);return {label:'F · Go under the portcullis to '+N.n+' ('+rpTxt139(N.lv[0])+')',fn:()=>vh205Through()}}
    return {label:'🔒 The rampart gate · the portcullis is down',fn:()=>say('🦇 The portcullis will not lift. Its winch chain runs into the wall — and its other end is round the beast’s neck.')}}
  return null}
function vh205Through(){const C=CQ205.c2;if(C.st<2){C.st=2;CQ205.trkK=''}svSnd('whoosh',1,.6);try{insGo(cq205I(2))}catch(e){console.error('v205 rampart go',e)}}
{const f=worldPrompt;worldPrompt=function(){try{const r=vh205Prompt();if(r)return r}catch(e){if(!VH205.err++)console.warn('v205 vharog prompt',e)}return f.apply(this,arguments)}}
// ---------------- the tick ----------------
function vh205Tick(dt,now){const here=vh205Here(),t=now/1000;if(here&&!VH205.G){try{vh205GateBuild()}catch(e){if(!VH205.err++)console.error('v205 rampart gate',e)}}if(!VH205.G)return;
  const G=VH205.G;G.g.visible=here;if(!G.raising&&cq205Done(2)!==G.op)vh205GateSync();VH205.bal.forEach(b=>b.o.visible=here);if(!here){G.light.intensity=0}else if(cq205Done(2))G.light.intensity=1.4+.3*Math.sin(t*2.1);
  // he sleeps by the gate while the chapter is open; once slain he is gone
  if(here&&!cq205Done(2)&&!vh205Alive()&&(typeof vh180Auth!='function'||vh180Auth()||!VH205A))vh205Spawn();
  if(!here&&VH205.e&&!VH205.e.dead&&!(VH205A&&VH205A.f)){try{removeE(VH205.e)}catch(_){}VH205.e=null;VH205A=null}
  if(VH205A&&VH205A.f&&!vh205Alive())vh205Reset(false);
  vh205ChainTick();vh205WallTick(dt,t);vh205StormTick(dt,t);vh205HuntTick(dt);vh205BleedTick(dt);
  if(VH205.cr){const b=VH205.bal[VH205.cr.i];if(b)b.o.userData.h.position.z=.4-.25*Math.min(1,VH205.cr.t)}
  VH205.bal.forEach(b=>{if(VH205.H&&!b.used){const e=VH205.e;if(e){const a=Math.atan2(e.m.position.x-b.x,e.m.position.z-b.z);b.o.rotation.y+=svAng(a-b.o.rotation.y)*Math.min(1,dt*3)}if(Math.random()<dt*3)burst(new THREE.Vector3(b.x,GH(b.x,b.z)+2,b.z),0xd8d8ff,1,.2,.8,.6)}})}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{vh205Tick(dt,now)}catch(err){if(!VH205.err++)console.warn('v205 vharog tick',err)}return r}}
// a save made during the fight loads before it (he sleeps again); a save after the kill keeps the gate open
CQ205L.push(()=>{if(VH205A&&VH205A.f)vh205Reset(false);vh205GateSync()});
