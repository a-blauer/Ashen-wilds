// ================= v146 Ssith'ra the Endless to the Vorraxis standard (Phase II den, signature mechanic, effects, motion) =================
// Builds on 1974 (its v112 model — already detailed — the slithering body chain, poses and moves stay).
//  * Model: sand pours from the seams of the body (particles), the rune scars on the tergites smoulder brighter.
//  * Motion: antennae, palps and mandibles follow through on springs.
//  * Phase II den change, "The Sinking Sands": sinkholes open in the pit one after another — sand vortices that drag you
//    toward their middle (and slow you); the middle swallows (damage). Walk out against the pull, or dash.
//  * Signature mechanic, The Rune Scars (Phase II): Ssith'ra coils and rears high, chanting; three rune scars on its body blaze
//    (they move with the body) and it is warded (80% less damage elsewhere). Break all three and the chant shatters:
//    it crashes down, BROKEN. If any scar still burns when the chant completes it heals (10%), dives, and bursts out of the
//    sand under you (a red circle — get out), then the sand ripples out in two rings.
//  * Effects: sand bursts throw debris and grit, globs and quills crack the floor, every snap sprays acid.
var SSR146={col:0xff7a30,acid:0xc8ff40,sand:0xd8b070};
function ssr146SandMat(){return SSR146.sm||(SSR146.sm=new THREE.MeshStandardMaterial({color:0xc8a060,roughness:.95,flatShading:true}))}
{const B=SVB[3];if(B){const s={};['L','R'].forEach(q=>{s['an'+q]=[40,5,1];s['an2'+q]=[32,4,1.2];s['p'+q]=[50,6,.6];s['p2'+q]=[40,5,.8];s['md'+q]=[90,11,.2]});B.spr=s;
  const p0=B.post;B.post=function(e,S,dt,now){p0&&p0.apply(this,arguments);try{if(!S.gone&&Math.random()<dt*7){const k=(Math.random()*SSR.N)|0,p=svWP(e,'s'+k,(Math.random()-.5)*.8,.2,0);burst(p,SSR146.sand,1,.4,.3,.8)}}catch(_){}}}}
// ---------------- Phase II: "The Sinking Sands" ----------------
function ssr146VxTex(){if(SSR146.vt)return SSR146.vt;const cv=document.createElement('canvas');cv.width=cv.height=256;const g=cv.getContext('2d');g.translate(128,128);
  const gr=g.createRadialGradient(0,0,4,0,0,128);gr.addColorStop(0,'rgba(40,24,10,1)');gr.addColorStop(.25,'rgba(120,80,40,.95)');gr.addColorStop(.8,'rgba(200,160,100,.7)');gr.addColorStop(1,'rgba(200,160,100,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,128,0,6.283);g.fill();
  g.strokeStyle='rgba(60,36,14,.6)';g.lineWidth=3;for(let k=0;k<7;k++){g.beginPath();for(let q=0;q<=40;q++){const u=q/40,r=8+u*118,a=k/7*6.283+u*4.2;g[q?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r)}g.stroke()}
  return SSR146.vt=new THREE.CanvasTexture(cv)}
function ssr146Sands(A,e){const D=sk146Den(A);if(D.ph2)return;D.ph2=1;D.sinks={L:[],t:2,dT:0};D.dust=sk146DenAdd(A,sk146Weather(A,'ash',0xd8b070,320));
  try{banner('🏜 THE SINKING SANDS','Sinkholes open in the pit and drag you down','Walk out against the pull, or dash')}catch(_){}svSnd('heavy',1,.5)}
function ssr146SandsTick(A,e,dt){const D=A.s146,K=D&&D.sinks;if(!K)return;K.t-=dt;
  if(K.t<=0&&K.L.length<2&&sk146In(A)){K.t=8;let x,z,tr=0;do{const a=Math.random()*6.283,r=3.5+Math.random()*(ARENA_R-6);x=A.cx+Math.cos(a)*r;z=A.cz+Math.sin(a)*r;tr++}while(tr<10&&Math.hypot(x-pl.position.x,z-pl.position.z)<4);
    const m=new THREE.MeshBasicMaterial({color:0xffffff,map:ssr146VxTex(),transparent:true,opacity:0,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3}),o=new THREE.Mesh(svG('s46vx',()=>new THREE.CircleGeometry(1,40).rotateX(-Math.PI/2)),m);
    o.position.set(x,GH(x,z)+.13,z);o.scale.setScalar(4.6);o.renderOrder=16;o.userData.lpsSkip=1;sk146DenAdd(A,o);K.L.push({o,m,x,z,r:4.6,t:0,life:13});svSnd('heavy',.9,.6);sk146Crack(new THREE.Vector3(x,0,z),0xffa040,2.5,2)}
  K.L.slice().forEach(s=>{s.t+=dt;s.o.rotation.y+=dt*1.4;s.m.opacity=Math.min(.9,s.t*.8)*(s.t>s.life-1?Math.max(0,s.life-s.t):1);if(Math.random()<dt*10){const a=Math.random()*6.283,r=Math.random()*s.r;burst(new THREE.Vector3(s.x+Math.cos(a)*r,GH(s.x,s.z)+.2,s.z+Math.sin(a)*r),SSR146.sand,1,.3,.4,.6)}
    if(s.t>s.life){if(s.o.parent)s.o.parent.remove(s.o);s.m.dispose();K.L.splice(K.L.indexOf(s),1)}});
  if(!sk146In(A)||!e||e.dead)return;const P=pl.position;K.dT-=dt;
  for(const s of K.L){if(s.t<.8)continue;const dx=s.x-P.x,dz=s.z-P.z,d=Math.hypot(dx,dz);if(d>s.r)continue;
    const pull=(1-d/s.r)*1.8+.6;if(d>.3&&!pl.step)walk(pl,dx/d*pull*dt,dz/d*pull*dt);dqDebuff('Sinking','🏜',{mspd:-.25},500,'Caught in a sinkhole: −25% move speed');D.deb='Sinking';
    if(d<1.3&&K.dT<=0&&!(hero.iv>0)){K.dT=.7;hitHero(e,.3,'m');burst(gY(P,.3),SSR146.sand,14,2,2,.6)}break}}
{const B=SVB[3];if(B){const t0=B.denTick,c0=B.denClear;
  B.denTick=function(A,e,dt,now){try{t0&&t0.apply(this,arguments)}catch(_){}try{if(A.f&&e&&e.sv&&e.sv.ph>1&&!sk146Den(A).ph2)ssr146Sands(A,e);ssr146SandsTick(A,e,dt)}catch(err){if(!SK146.err++)console.error('v146 sands',err)}};
  B.denClear=function(A,won){try{c0&&c0.apply(this,arguments)}catch(_){}sk146DenClear(A)}}}
// ---------------- the signature: The Rune Scars ----------------
function ssr146Scar(){const g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:0xffc060,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  const r=new THREE.Mesh(svG('s46sr',()=>new THREE.TorusGeometry(.5,.07,5,20)),m);r.rotation.x=Math.PI/2;g.add(r);
  const c=new THREE.Mesh(svG('s46sc',()=>new THREE.OctahedronGeometry(.32,0)),m);c.scale.set(1,1.6,1);g.add(c);const gl=kqSpr(0xffa040,2.2);g.add(gl);
  const sh=[];for(let k=0;k<4;k++){const s=new THREE.Mesh(svG('s46ss',()=>new THREE.BoxGeometry(.08,.5,.04)),m);s.position.set(Math.cos(k*1.57)*.7,0,Math.sin(k*1.57)*.7);s.rotation.y=-k*1.57;g.add(s);sh.push(s)}
  return {g,r,c,gl,sh,m}}
function ssr146ScarsStart(c){const e=c.e,S=c.S,A=c.A;if(!A)return;S.dr=.2;const D=sk146Den(A);
  const L=[3,7,11].map((k,i)=>{const W=svWP(e,'s'+k,0,0,0),Sc=ssr146Scar();let t=0;
    return {x:W.x,z:W.z,n:'Rune Scar',frac:.017,mesh:Sc.g,hbY:2.4,hbS:.8,cupY:1,
      tick(pe,dt,now){t+=dt;const P=svWP(e,'s'+k,0,.55,0);pe.m.position.set(P.x,GH(P.x,P.z),P.z);Sc.g.position.y=P.y-GH(P.x,P.z)+.2;Sc.g.rotation.y+=dt*2;Sc.c.rotation.y-=dt*3;
        Sc.gl.scale.setScalar(2+.5*Math.sin(now/110+i));Sc.g.scale.setScalar(Math.min(1,t/.4));Sc.sh.forEach((s,q)=>{s.position.y=.25*Math.sin(now/200+q)});if(Math.random()<dt*8)burst(gY(pe.m.position,Sc.g.position.y),0xffa040,1,.6,.8,.5)},
      die(pe,killed){if(killed){const p=gY(pe.m.position,Sc.g.position.y);burst(p,0xffc060,50,3.5,3,.7);sk146Debris(p,ssr146SandMat(),8,.08,4,5,1.3);sk146Flash(p,0xffa040,4,10,500);popT(pe.m.position,'✸ SCAR BROKEN','#ffd8a0');svSnd('crack',1.2,1.2);svSnd('bell',.5,1.4)}Sc.m.dispose()}}});
  const P=sk146Props(A,L);c.M.an.props=P;D.props=(D.props||[]).concat(P);svSnd('roar',1,.8);svSnd('hum',1,.5);sk146Wall(e.m.position,SSR146.col,6,3,.7);
  try{banner('✸ THE RUNE SCARS','Ssith’ra coils and chants — three rune scars blaze on its body','Break all three before the chant completes!')}catch(_){}say("✸ Ssith'ra chants: break the three blazing rune scars on its body!")}
function ssr146ScarsCleanup(c){const S=c.S,M=c.M;S.dr=0;if(!M)return;(M.an.props||[]).forEach(p=>{if(!p._gone)dqPropGone(p,false)})}
function ssr146ScarsEnd(c,broken){const e=c.e,M=c.M;if(M.an.done2)return;M.an.done2=1;
  if(broken){ssr146ScarsCleanup(c);svEndMove(e,true);svCast(e,'broken');try{banner('💔 THE CHANT SHATTERS',"Ssith'ra crashes into the sand",'Strike now!')}catch(_){}return}
  sk146Heal(e,.1,SSR146.col);ssr146ScarsCleanup(c);svSnd('roar',1.1,.7);
  // it bursts out of the sand under you
  const q=c.inA(pl.position.clone(),.8),S2={k:'c',r:3.4},an={x:q.x,z:q.z,a:0};svWarn(S2,an,1.0);
  setTimeout(()=>{if(e.dead||!AF)return;const p=new THREE.Vector3(q.x,0,q.z);ssrSand(p,120,3.6);sk146Column(p,SSR146.sand,0xffe0a0,1.4,7,1.1);sk146Debris(p,ssr146SandMat(),18,.14,6,7,1.6);sk146Crack(p,0xffa040,4,3);shake(.55);svSnd('heavy',1.4,.6);
    svHitNow(e,S2,an,1.8,{col:SSR146.col});[0,1].forEach(k=>setTimeout(()=>{if(!e.dead&&AF)sk146RingWave(e,p,2,12,1.4,1.2,1.1,SSR146.sand,{h:1.3})},400+k*650))},1000)}
Object.assign(SSRM,{
  scars:{wt:(e,L)=>e.sv.scN?9:30,cd:30,ph:2,r:[0,40],a:'any',armor:1,dur:11.2,inv:[0,1.0],trn:[[0,.6,2]],
    trk:[[.6,'roar','io'],[1.1,'coil','io'],[9.8,'coil','l',.012],[10.4,'roar','o'],[11.2,'sRec','io']],
    go(c){c.S.scN=(c.S.scN||0)+1;if(c.S.gone)ssrGone(c.e,false)},
    ev:[[1.0,c=>ssr146ScarsStart(c)],[10.0,c=>ssr146ScarsEnd(c,false)]],
    tk(c,dt){const M=c.M;if(Math.random()<dt*8)burst(svWP(c.e,'head',0,0,.8),0xffa040,1,.8,.6,.5);if(M.an.props&&c.t>1.4&&c.t<10&&!M.an.done2&&!sk146Alive(M.an.props).length)ssr146ScarsEnd(c,true)},
    end(c){ssr146ScarsCleanup(c)},rec:.6},
  broken:sk146Broken(SVB[3],4.6,'stag','sRec')});
// ---------------- richer effects ----------------
{const f=ssrSand;ssrSand=function(p,n,r){f.apply(this,arguments);try{sk146Debris(p,ssr146SandMat(),Math.min(12,((n||40)/8)|0),.08,(r||4)*.9,5,1.2);sk146Wall(p,SSR146.sand,(r||4)+.5,2.2,.5)}catch(_){}}}
{const f=ssrGlob;ssrGlob=function(c,q,T){f.apply(this,arguments);try{const p=new THREE.Vector3(q.x,0,q.z);setTimeout(()=>{if(c.e.dead||!AF)return;sk146Drops(gY(p,.4),SSR146.acid,12,3,4,{splats:4,dc:0x4a5a10});sk146Crack(p,SSR146.acid,1.4,2)},T*1000)}catch(_){}}}
{const f=ssrQuill;ssrQuill=function(c,from,q,T,i){f.apply(this,arguments);try{const p=new THREE.Vector3(q.x,0,q.z);setTimeout(()=>{if(c.e.dead||!AF)return;sk146Crack(p,0xffc060,1.1,2.2);sk146Debris(p,ssr146SandMat(),3,.06,2.5,4,1)},T*1000)}catch(_){}}}
sk146AutoFx(SSRM,{liq:SSR146.acid,sp:0xffc060,dust:SSR146.sand});
try{svRegMoves(3)}catch(_){}
try{DSTXT[3].atk.push(['✸ The Rune Scars',"Phase II: Ssith'ra coils and chants (warded) while three rune scars blaze on its body, moving with it.",'Break all three before the chant ends: it crashes down BROKEN. If one still burns it heals, dives and bursts out under you — get out of the red circle, then dash the rings.'],
  ['🏜 The Sinking Sands','Phase II: sinkholes open one after another and drag you toward their middle.','Walk out against the pull or dash — the middle swallows.'])}catch(_){}
