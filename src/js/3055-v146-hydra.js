// ================= v146 The Crest Hydra to the Vorraxis standard (Phase II den, signature mechanic, effects, motion) =================
// Builds on 1972 (its v112 model — already detailed — poses and moves stay).
//  * Model: barnacle crusts and weed on the coils, a second row of spines down each neck, venom dripping from the fangs.
//  * Motion: the neck tips, heads, tongues, crests and the tail follow through on springs: strikes whip, the tail trails.
//  * Phase II den change, "The Mere Rises": the water floods the shore of the mere; only a handful of sandbars stay dry.
//    Wading through the deep water slows you (Wading) — fight from the sandbars, cross the water when you must.
//  * Signature mechanic, Sever and Sear (Phase II): the Hydra slams all three heads down onto the shore, pinning them, and
//    its regrowth begins (warded: 80% less damage to the body). Each pinned head bares a swollen venom gland at its throat:
//    burst a gland and that head is severed, its stump seared shut. Sever all three and the Hydra collapses, BROKEN. If any
//    head is still whole when the regrowth completes it heals (10%) and unleashes Hydra's Wrath: two rings of venom sweep
//    out across the mere — dash through each.
//  * Effects: venom globs splash and leave droplets, geysers rise as venom columns with spray, the tail slam throws up a
//    wall of water and rock, every bite sprays venom.
var HYD146={col:0x7ac850,ven:0x9aff4a};
{const f=hydBuild;hydBuild=function(R,e){f.apply(this,arguments);try{hyd146Add(R)}catch(err){console.error('v146 hydra model',err)}};if(SVB[1])SVB[1].build=hydBuild}
function hyd146Add(R){const G=(k,fn)=>svG('h46'+k,fn),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz);
  const barn=svMat(R,0xb8b0a0,{roughness:.8,emissive:0x101008}),weed=svMat(R,0x2a4a1a,{roughness:.95,side:THREE.DoubleSide}),spine=svMat(R,0xd8d0b8,{roughness:.55}),ven=svGlowMat(R,HYD146.ven);
  // barnacles and weed on the coils (body joint, along the coil spiral)
  for(let k=0;k<36;k++){const u=.05+k/36*.85,F=hydCoilF(u),th=1.2+Math.sin(k*2.3)*.9,p=hydCoilS(F,th,1.02);const m=Mm('body',G('bn'+(k%3),()=>svLump(.09+.03*(k%3),0,.4,120+k%3)),barn,p.x,p.y,p.z);m.scale.set(1,.6,1);
    if(k%3===0){const q=hydCoilS(F,1.8,1.0);Mm('body',G('wd'+(k%2),()=>svBlade([[-.06,0],[.06,0],[.04,-.6-(k%2)*.2],[0,-.7-(k%2)*.2],[-.03,-.5]],.01)),weed,q.x,q.y,q.z,0,Math.random()*6,0)}}
  // a second row of spines down each neck, venom on the fangs
  ['C','L','R'].forEach(s=>{for(let k=1;k<5;k++){const j='n'+k+s;if(!R.J[j])continue;[-1,1].forEach(q=>Mm(j,G('ns',()=>svHorn(.04,.28,0,-.08,4,2)),spine,q*.22,.18,0,-1.1,q*.5,0))}
    const h=R.J['h'+s];if(h){[-1,1].forEach(q=>Mm('h'+s,G('vd',()=>new THREE.OctahedronGeometry(.035,0)),ven,q*.15,-.22,1.05,0,0,0,1,1.6,1))}})}
{const B=SVB[1];if(B){const s={};['C','L','R'].forEach(q=>{s['n3'+q]=[80,11,.3];s['n4'+q]=[70,10,.4];s['h'+q]=[75,10,.3];s['tn'+q]=[45,5,.8];s['cr'+q]=[60,7,.6];s['j'+q]=[90,11,0]});for(let k=1;k<6;k++)s['t'+k]=[40-4*k,6,1+.2*k];B.spr=s;
  const p0=B.post;B.post=function(e,S,dt,now){p0&&p0.apply(this,arguments);try{if(Math.random()<dt*2.5){const q=['C','L','R'][(Math.random()*3)|0];if(!(S.sv146&&S.sv146[q])){const p=svWP(e,'h'+q,.15*(Math.random()<.5?-1:1),-.25,1.05);sk146Drops(p,HYD146.ven,1,.2,.1,{s:.04,splats:1,dc:0x2a4a10})}}}catch(_){}}}}
// ---------------- Phase II: "The Mere Rises" ----------------
function hyd146WaterTex(){if(HYD146.wt)return HYD146.wt;const cv=document.createElement('canvas');cv.width=cv.height=256;const g=cv.getContext('2d');g.fillStyle='#2a6a6a';g.fillRect(0,0,256,256);
  for(let k=0;k<120;k++){g.strokeStyle=`rgba(${150+Math.random()*80|0},230,220,${.1+Math.random()*.25})`;g.lineWidth=1+Math.random()*2;g.beginPath();const x=Math.random()*256,y=Math.random()*256;g.moveTo(x,y);g.bezierCurveTo(x+20,y-10,x+40,y+10,x+60,y);g.stroke()}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);return HYD146.wt=t}
function hyd146Flood(A,e){const D=sk146Den(A);if(D.ph2)return;D.ph2=1;const y0=GH(A.cx,A.cz);
  const m=new THREE.MeshStandardMaterial({color:0x5ab0a8,map:hyd146WaterTex(),roughness:.08,metalness:.4,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});m.userData.noFade135=1;
  const w=new THREE.Mesh(svG('h46w',()=>new THREE.CircleGeometry(ARENA_R-.2,56).rotateX(-Math.PI/2)),m);w.position.set(A.cx,y0+.05,A.cz);w.renderOrder=15;w.userData.lpsSkip=1;sk146DenAdd(A,w);
  // the sandbars: raised, ringed with foam (they stay dry)
  const bars=[],a0=Math.random()*6.283,sand=new THREE.MeshStandardMaterial({color:0xb8a878,roughness:.95,flatShading:true});
  for(let k=0;k<5;k++){const a=a0+k/5*6.283+(Math.random()-.5)*.4,r=6.5+Math.random()*4.5,x=A.cx+Math.cos(a)*r,z=A.cz+Math.sin(a)*r,R0=2.3+Math.random()*.8;
    const b=new THREE.Mesh(svG('h46b',()=>svLump(1,1,.15,130)),sand);b.scale.set(R0,.28,R0);b.position.set(x,GH(x,z)-.05,z);b.userData.lpsSkip=1;sk146DenAdd(A,b);
    const f=new THREE.Mesh(svG('h46f',()=>new THREE.RingGeometry(.96,1.08,40).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:0xe8fff8,transparent:true,opacity:.6,depthWrite:false,fog:false}));f.scale.setScalar(R0);f.position.set(x,y0+.42,z);f.userData.lpsSkip=1;sk146DenAdd(A,f);
    bars.push({x,z,r:R0,f})}
  D.mere={w,m,bars,t:0,lvl:0};try{banner('🌊 THE MERE RISES','The water floods the shore — only the sandbars stay dry','Wading slows you')}catch(_){}svSnd('splash',1.4,.5);hydSplash(new THREE.Vector3(A.cx,0,A.cz),80)}
function hyd146FloodTick(A,e,dt){const D=A.s146,W=D&&D.mere;if(!W)return;W.t+=dt;W.lvl=Math.min(1,W.lvl+dt*.4);W.m.opacity=.75*W.lvl;W.w.position.y=GH(A.cx,A.cz)+.05+.32*svEase.o(W.lvl);W.m.map.offset.x+=dt*.02;W.m.map.offset.y+=dt*.013;
  W.bars.forEach((b,k)=>{b.f.material.opacity=.4+.25*Math.sin(W.t*2+k)});
  if(Math.random()<dt*8){const a=Math.random()*6.283,r=Math.random()*ARENA_R;burst(new THREE.Vector3(A.cx+Math.cos(a)*r,W.w.position.y+.05,A.cz+Math.sin(a)*r),0xcfeee0,1,.3,.4,.5)}
  if(!sk146In(A)||!e||e.dead||W.lvl<.5)return;const P=pl.position,dry=W.bars.some(b=>Math.hypot(P.x-b.x,P.z-b.z)<b.r*.95);
  if(!dry){dqDebuff('Wading','🌊',{mspd:-.3},500,'Wading through the risen mere: −30% move speed');D.deb='Wading';if(Math.random()<dt*6)burst(gY(P,.4),0xcfeee0,2,1,1,.4)}}
{const B=SVB[1];if(B){const t0=B.denTick,c0=B.denClear;
  B.denTick=function(A,e,dt,now){try{t0&&t0.apply(this,arguments)}catch(_){}try{if(A.f&&e&&e.sv&&e.sv.ph>1&&!sk146Den(A).ph2)hyd146Flood(A,e);hyd146FloodTick(A,e,dt)}catch(err){if(!SK146.err++)console.error('v146 mere',err)}};
  B.denClear=function(A,won){try{c0&&c0.apply(this,arguments)}catch(_){}sk146DenClear(A);const e=sk146Boss(A);if(e&&e.sv)hyd146Regrow(e)}}}
// ---------------- the signature: Sever and Sear ----------------
function hyd146Sever(e,s,on){const S=e.sv,R=S.R,h=R.J['h'+s];if(!h)return;S.sv146=S.sv146||{};S.sv146[s]=on?1:0;h.visible=!on;
  const n=R.J['n4'+s];if(on&&n){const st=svSpr(R,n,0xffa040,1.1,0,.1,.3);st.userData.v146stump=1;const c=svWP(e,'n4'+s,0,0,.3);burst(c,0xffa040,40,3,2,.7);sk146Drops(c,HYD146.ven,20,4,3,{splats:5});sk146Flash(c,0xffa040,4,10,500)}
  if(!on&&n){n.children.slice().forEach(o=>{if(o.userData&&o.userData.v146stump)n.remove(o)})}}
function hyd146Regrow(e){['C','L','R'].forEach(s=>{if(e.sv.sv146&&e.sv.sv146[s])hyd146Sever(e,s,false)})}
function hyd146Gland(){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:0x6ab030,emissive:0x4a9a10,emissiveIntensity:.9,roughness:.2,flatShading:true}),vm=new THREE.MeshBasicMaterial({color:0x2a5a10});
  const sac=new THREE.Mesh(svG('h46gs',()=>svLump(.55,1,.25,131)),m);sac.position.y=.6;sac.scale.set(1,.8,1);g.add(sac);
  for(let k=0;k<5;k++){const v=new THREE.Mesh(svG('h46gv',()=>svTube([[0,0,0],[.3,.25,.1],[.5,.55,0]],.03,4)),vm);v.position.y=.25;v.rotation.y=k/5*6.283;g.add(v)}
  const gl=kqSpr(HYD146.ven,1.6);gl.position.y=.7;g.add(gl);return {g,sac,gl,mats:[m,vm]}}
function hyd146SeverStart(c){const e=c.e,S=c.S,A=c.A;if(!A)return;S.dr=.2;const D=sk146Den(A);
  const L=['L','C','R'].map((s,k)=>{const p=svWP(e,'h'+s,0,-.3,.6),m0=e.m.position,dx=p.x-m0.x,dz=p.z-m0.z,dl=Math.hypot(dx,dz)||1,ang=dl>.3?Math.atan2(dx,dz):e.m.rotation.y+(k-1)*.9,dd=Math.max(4.6,dl),q=c.inA(new THREE.Vector3(m0.x+Math.sin(ang)*dd,0,m0.z+Math.cos(ang)*dd),1.2),Gl=hyd146Gland();   // never inside the coils: reachablelet t=0;
    return {x:q.x,z:q.z,n:'Venom Gland',frac:.017,mesh:Gl.g,hbY:2,hbS:.8,cupY:.7,side:s,
      tick(pe,dt,now){t+=dt;Gl.sac.scale.set(1+.12*Math.sin(now/160+k),.8+.15*Math.sin(now/160+k+1),1+.12*Math.cos(now/160+k));Gl.g.scale.setScalar(Math.min(1,t/.5));if(Math.random()<dt*5)burst(gY(pe.m.position,.8),HYD146.ven,1,.3,.6,.5)},
      die(pe,killed){if(killed){const p=gY(pe.m.position,.7);sk146Drops(p,HYD146.ven,26,4,4,{splats:6,dc:0x2a4a10});burst(p,HYD146.ven,40,3,3,.7);popT(pe.m.position,'⚔ SEVERED','#d8ff9a');svSnd('squelch',1.3,.9);svSnd('roar',.6,1.6);hyd146Sever(e,s,true)}Gl.mats.forEach(m=>m.dispose())}}});
  const P=sk146Props(A,L);c.M.an.props=P;D.props=(D.props||[]).concat(P);c.M.an.teth=P.map((p,k)=>sk146Beam(()=>p.dead||p._gone?null:gY(p.m.position,.7),()=>e.dead?null:svWP(e,'n2'+['L','C','R'][k],0,0,0),HYD146.ven,.07));
  svSnd('heavy',1.3,.6);shake(.5);hydSplash(e.m.position,70);try{banner('🐍 SEVER AND SEAR','The Hydra pins its heads to the shore — its regrowth begins','Burst the three venom glands to sever its heads!')}catch(_){}say('🐍 The Hydra pins its heads: burst the glands at their throats to sever them!')}
function hyd146SeverCleanup(c){const S=c.S,M=c.M;S.dr=0;if(!M)return;(M.an.teth||[]).forEach(t=>t.stop());M.an.teth=[];(M.an.props||[]).forEach(p=>{if(!p._gone)dqPropGone(p,false)})}
function hyd146SeverEnd(c,broken){const e=c.e,M=c.M;if(M.an.done2)return;M.an.done2=1;
  if(broken){hyd146SeverCleanup(c);svEndMove(e,true);svCast(e,'broken');try{banner('💔 ALL HEADS SEVERED','The Hydra collapses into the mere','Strike now!')}catch(_){}return}
  sk146Heal(e,.1,HYD146.ven);hyd146SeverCleanup(c);hyd146Regrow(e);const p=e.m.position.clone();svSnd('roar',1.1,.8);shake(.4);
  [0,1].forEach(k=>setTimeout(()=>{if(e.dead||!AF)return;sk146RingWave(e,p,2,ARENA_R+1,1.8,1.3,1.5,HYD146.ven,{h:1.6,on:()=>dqDebuff('Envenomed','🐍',{mspd:-.2},3000,"Hydra's Wrath: envenomed, −20% move speed")})},k*950))}
Object.assign(HYDM,{
  sever:{wt:(e,L)=>e.sv.seN?9:30,cd:30,ph:2,r:[0,40],a:'any',armor:1,dur:11.6,inv:[0,1.2],trn:[[0,.5,1.5]],
    trk:[[.5,'gyUp','io'],[.9,'gyUp','l',.02],[1.2,'gyDn','s'],[10.2,'gyDn','l',.008],[10.8,'roar','o'],[11.6,'rest','io']],
    go(c){c.S.seN=(c.S.seN||0)+1},
    ev:[[1.25,c=>hyd146SeverStart(c)],[10.3,c=>hyd146SeverEnd(c,false)]],
    tk(c,dt){const M=c.M;if(Math.random()<dt*6){const s=['C','L','R'][(Math.random()*3)|0];if(!(c.S.sv146&&c.S.sv146[s]))burst(svWP(c.e,'h'+s,0,0,.6),HYD146.ven,1,.6,.6,.5)}
      if(M.an.props&&c.t>1.6&&c.t<10.3&&!M.an.done2&&!sk146Alive(M.an.props).length)hyd146SeverEnd(c,true)},
    end(c){hyd146SeverCleanup(c)},rec:.6},
  broken:Object.assign(sk146Broken(SVB[1],4.6,'stag','recC'),{end(c){c.S.stg=0;hyd146Regrow(c.e);try{hydSplash(c.m.position,50)}catch(_){}}})});
// ---------------- richer effects ----------------
{const f=hydSplash;hydSplash=function(p,n){f.apply(this,arguments);try{sk146Drops(gY(p,.3),0xcfeee0,Math.min(28,(n||30)/2),4,5,{splats:0});sk146Wall(p,0xcfeee0,4,2.2,.5)}catch(_){}}}
{const f=hydGeyser;hydGeyser=function(c,P,S2,an){f.apply(this,arguments);try{sk146Column(P,HYD146.ven,0xe8ffc0,.7,6,1.1);sk146Drops(gY(P,2),HYD146.ven,20,4,6,{splats:5,dc:0x2a4a10});sk146Crack(P,HYD146.ven,1.8,2.4)}catch(_){}}}
{const f=hydGlob;hydGlob=function(c,from,q,T,big){f.apply(this,arguments);try{const p=q.clone?q.clone():new THREE.Vector3(q.x,0,q.z);setTimeout(()=>{if(c.e.dead||!AF)return;sk146Drops(gY(p,.4),HYD146.ven,14,3,4,{splats:4,dc:0x2a4a10});sk146Flash(p,HYD146.ven,2.5,8,300)},T*1000)}catch(_){}}}
{const T=HYDM.tail;if(T&&T.hit)T.hit.forEach(h=>{const f=h.fx;h.fx=function(c,an,hit){f&&f.apply(this,arguments);try{const a=an.a||0,p=new THREE.Vector3(an.x+Math.sin(a)*4,0,an.z+Math.cos(a)*4);sk146Wall(p,0xcfeee0,4,2.6,.5);sk146Crack(p,0xd8ff9a,2.5,2.4);sk146Debris(p,HYD146.rk||(HYD146.rk=new THREE.MeshStandardMaterial({color:0x6a6a5a,roughness:.9,flatShading:true})),6,.1,4,5,1.3)}catch(_){}}})}
sk146AutoFx(HYDM,{liq:HYD146.ven,sp:0xe8ffc0,dust:0xcfeee0});
try{svRegMoves(1)}catch(_){}
try{DSTXT[1].atk.push(['⚔ Sever and Sear','Phase II: it pins all three heads to the shore (its body is warded) and bares a swollen venom gland at each throat.','Burst all three glands to sever its heads: it collapses BROKEN. If a head is still whole when the regrowth completes it heals and two rings of venom sweep the mere — dash through each.'],
  ['🌊 The Mere Rises','Phase II: the water floods the shore; only a few sandbars stay dry.','Fight from the sandbars: wading through the deep water slows you.'])}catch(_){}
