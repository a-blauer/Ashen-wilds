// ================= v110 Sovereign 3 — Ssith'ra the Endless (Searing Sands) =================
// A wurm-centipede of armoured plates, fourteen segments long, every one on a pair of hooked legs; a horned head with a
// cluster of ember eyes and two great mandibles. The body follows the path the head has taken (it really slithers).
// Pattern (learnable):
//  close    ── Mandible Snap: it rears a little and the mandibles spread wide (hiss), then a short lunge and a snap.
//  mid      ── Rearing Slam: the head rises high above you and trembles — then crashes down along a line. Long recovery.
//              Acid Spray: it rears to mid height and sweeps acid left to right across the front (three beats).
//  far      ── Sand Charge: the head drops low, then it charges straight down a line (columns can stop it).
//              Burrow: it dives under the sand; a ripple hunts you; when the ripple stops, MOVE — it bursts out there.
//  Phase II (55%) "The Endless Hunger": its seams glow like a forge; adds Triple Burrow (three eruptions in a row) and
//              Molten Spit (globs arc onto you and your path), and the snap becomes a double.
var SSR={col:0xff7a30,acid:0xc8ff40,sand:0xd8b070,N:14,L:1.05};
function ssrBuild(R,e){
  const cara=svMat(R,0x481810,{roughness:.42,metalness:.3,emissive:0x100302}),cara2=svMat(R,0x642612,{roughness:.48,metalness:.25}),bel=svMat(R,0xc89a6a,{roughness:.8}),
    leg=svMat(R,0x3a140c,{roughness:.5,metalness:.2}),horn=svMat(R,0xe0c8a0,{roughness:.5}),eye=svGlowMat(R,0xffb040),seam=svGlowMat(R,0x5a1a08);R.seam=seam;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz);
  J('root',null,0,0,0);J('head','root',0,1.25,.2);
  // ---- the head: armoured dome, horn crest, ember eyes, mandibles, antennae ----
  svM(R,'head',svG('ss_hd',()=>svLoftZ([[-.75,.95,.72,0,.05],[-.1,1.12,.82,0,.1],[.55,.98,.66,0,.05],[1.05,.62,.42,0,-.05],[1.3,.3,.22,0,-.1]],10)),cara);
  svM(R,'head',svG('ss_hd2',()=>svLoftZ([[-.6,.7,.5,0,-.25],[.9,.5,.3,0,-.3]],8)),bel);
  for(let k=0;k<5;k++)svM(R,'head',svG('ss_cr'+(k%2),()=>svHorn(.14,.9+.25*(k%2),0,-.35,5,4)),horn,(k-2)*.34,.75-.06*Math.abs(k-2),-.1,-1.1,(k-2)*.25,0);
  [[.34,.35,.92],[.55,.28,.72],[.2,.5,.8]].forEach(([x,y,z])=>[-1,1].forEach(s=>{svM(R,'head',svG('ss_ey',()=>new THREE.SphereGeometry(.1,6,5)),eye,s*x,y,z)}));
  svSpr(R,'head',SSR.col,.9,0,.4,.95);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('md'+L,'head',s*.45,-.2,1.0,0,s*.25,0);svM(R,'md'+L,svG('ss_md',()=>svHorn(.2,1.7,-.65,-.15,6,6)),horn,0,0,0,0,s<0?Math.PI:0,s<0?Math.PI:0,1,1,1);
    svM(R,'md'+L,svG('ss_mdt',()=>svHorn(.08,.5,0,0,4,2)),leg,0,0,.4,1.2,s*-.6,0);
    J('an'+L,'head',s*.38,.6,.7,-.7,s*.4,0);svM(R,'an'+L,svG('ss_an',()=>svHorn(.05,2.4,0,-.8,4,6)),leg)});
  // ---- fourteen body segments (placed along the trail every frame), each with a pair of legs ----
  for(let k=0;k<SSR.N;k++){const n='s'+k,sc=1-.035*k;J(n,'root',0,1.1,-(k+1)*SSR.L).rotation.order='YXZ';
    svM(R,n,svG('ss_sg',()=>svLoftZ([[-.6,.95,.58,0,.1],[-.1,1.05,.66,0,.16],[.45,.92,.55,0,.12],[.62,.75,.45,0,.08]],10)),k%2?cara:cara2,0,0,0,0,0,0,sc,sc,sc);
    svM(R,n,svG('ss_sb',()=>svLoftZ([[-.5,.72,.3,0,-.32],[.5,.68,.28,0,-.3]],8)),bel,0,0,0,0,0,0,sc,sc,sc);
    svM(R,n,svG('ss_sm',()=>svLoftZ([[-.62,.98,.12,0,-.1],[-.5,.98,.12,0,-.1]],10,{cap:false})),seam,0,0,0,0,0,0,sc,sc,sc);
    [-1,1].forEach(s=>svM(R,n,svG('ss_sp',()=>svHorn(.12,.7+.15*(k%3),0,-.35,5,4)),horn,s*.42*sc,.62*sc,-.05,-1.25,s*.2,s*.2));
    [-1,1].forEach(s=>{const L=s>0?'L':'R',lj=J('lg'+k+L,n,s*.85*sc,-.2,0,0,0,s*1.25);svM(R,lj,svG('ss_lu2',()=>svLoft([[.05,.13,.15],[-.72,.1,.11]],5)),leg);
      const lk=J('lk'+k+L,lj,0,-.72,0,0,0,-s*1.1);svM(R,lk,svG('ss_ll2',()=>svHorn(.09,.85,0,0,4,3)),leg,0,0,0,Math.PI/2,0,0);svM(R,lk,svG('ss_lt',()=>svHorn(.05,.3,0,0,4,2)),horn,0,-.82,0,Math.PI/2,0,0)})}
  const tl='s'+(SSR.N-1);for(let k=0;k<3;k++)svM(R,tl,svG('ss_tl'+k,()=>svHorn(.22-.05*k,1.5-.3*k,0,.4,5,5)),horn,(k-1)*.35,.3,-.4,-2.6+.3*Math.abs(k-1),(k-1)*.4,0);
}
// the trail the body follows (in world space), and the gait
function ssrTrail(e,S,reset){const m=e.m,p=m.position;if(!S.tr||reset){S.tr=[];const a=m.rotation.y;for(let i=0;i<=SSR.N*4+8;i++)S.tr.push([p.x-Math.sin(a)*i*.3,p.z-Math.cos(a)*i*.3]);return}
  const q=S.tr[0],dq=Math.hypot(p.x-q[0],p.z-q[1]);if(dq>4.5)return ssrTrail(e,S,true);if(dq>.3){S.tr.unshift([p.x,p.z]);if(S.tr.length>SSR.N*4+12)S.tr.pop()}}
function ssrLoco(e,S,O,dt,now){const t=now/1000,a=Math.min(1,S.spd/2.5);S.gp=(S.gp||0)+dt*(3+S.spd*2.2);
  O.head[4]+=.08*Math.sin(t*1.3);O.head[1]+=.12*Math.sin(t*.7);O.head[0]+=.05*Math.sin(t*1.1);O.mdL[1]+=.08*Math.sin(t*2.2);O.mdR[1]-=.08*Math.sin(t*2.2);
  O.anL[0]+=.15*Math.sin(t*1.9);O.anR[0]+=.15*Math.sin(t*1.9+1);
  for(let k=0;k<SSR.N;k++)['L','R'].forEach((s,j)=>{const ph=S.gp-k*.75+j*Math.PI,sw=Math.sin(ph)*(.15+.45*a),lf=Math.max(0,Math.cos(ph))*(.1+.35*a);O['lg'+k+s][1]+=sw;O['lg'+k+s][2]+=(j?-1:1)*lf*-1})}
function ssrPost(e,S,dt,now){const R=S.R,m=e.m;ssrTrail(e,S);const tr=S.tr,inv=1/(m.bs||1),h=R.J.head,hy=h.position.y,hz=h.position.z,ca=Math.cos(m.rotation.y),sa=Math.sin(m.rotation.y);
  const rear=Math.max(0,hy-1.25),gone=S.gone?1:0;let prev=null;
  // walk the trail: arc-length from the head
  const pts=[[m.position.x,m.position.z]].concat(tr);let acc=0,j=0;const want=[];for(let k=0;k<SSR.N;k++)want.push((k+1)*SSR.L-hz*.5);
  const P=[];let seg=0;for(let i=1;i<pts.length&&seg<want.length;i++){const a=pts[i-1],b=pts[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);while(seg<want.length&&acc+l>=want[seg]){const u=l>1e-6?(want[seg]-acc)/l:0;P.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]);seg++}acc+=l}
  while(P.length<SSR.N){const L=P.length?P[P.length-1]:[m.position.x,m.position.z];P.push([L[0]-sa*SSR.L,L[1]-ca*SSR.L])}
  const y0=GH(m.position.x,m.position.z);
  for(let k=0;k<SSR.N;k++){const J=R.J['s'+k],w=P[k],dx=w[0]-m.position.x,dz=w[1]-m.position.z,lx=dx*ca-dz*sa,lz=dx*sa+dz*ca;
    const f=Math.max(0,1-(k+1)/7.5),y=1.05+.08*Math.sin(now/300-k*.6)+rear*Math.pow(f,1.5)-(gone?3:0)+(GH(w[0],w[1])-y0);
    J.position.set(lx,y,lz);
    const nb=k?P[k-1]:[m.position.x+sa*.01,m.position.z+ca*.01],yaw=Math.atan2(nb[0]-w[0],nb[1]-w[1])-m.rotation.y,py=k?R.J['s'+(k-1)].position.y:hy;
    J.rotation.set(-Math.atan2(py-y,SSR.L),yaw,Math.sin(now/400-k*.5)*.05)}
  const on=S.ph>1,gl=on?.55+.45*Math.sin(now/150):0;R.seam.color.setHex(on?0xff7a20:0x5a1a08);if(on)R.seam.color.multiplyScalar(.5+.5*gl);
  m.visible=!S.gone&&m.visible}
var SSRP={
  // mandible snap
  sOpen:{head:[-.25,0,0,0,.7,-.2],mdL:[0,.75,0],mdR:[0,-.75,0],anL:[-.4,0,0],anR:[-.4,0,0]},
  sSnap:{head:[.15,0,0,0,.2,.5],mdL:[0,-.25,0],mdR:[0,.25,0]},
  sRec:{head:[.05,0,0,0,.1,.2],mdL:[0,.1,0],mdR:[0,-.1,0]},
  // rearing slam
  rUp:{head:[-.75,0,0,0,4.6,-.6],mdL:[0,.5,0],mdR:[0,-.5,0],anL:[-.6,0,0],anR:[-.6,0,0]},
  rDn:{head:[.45,0,0,0,-.35,1.1],mdL:[0,.2,0],mdR:[0,-.2,0]},
  rRec:{head:[.3,0,0,0,-.25,.8],mdL:[0,.15,0],mdR:[0,-.15,0]},
  // acid spray: mid rear, head sweeps
  aUp:{head:[-.35,.75,0,0,2.2,-.2],mdL:[0,.6,0],mdR:[0,-.6,0]},
  aMid:{head:[-.2,0,0,0,2.1,0],mdL:[0,.65,0],mdR:[0,-.65,0]},
  aEnd:{head:[-.2,-.75,0,0,2.0,0],mdL:[0,.6,0],mdR:[0,-.6,0]},
  // charge
  cLow:{head:[.35,0,0,0,-.5,-.3],mdL:[0,.5,0],mdR:[0,-.5,0],anL:[.5,0,0],anR:[.5,0,0]},
  cRun:{head:[.2,0,0,0,-.3,.2],mdL:[0,.35,0],mdR:[0,-.35,0],anL:[.8,0,0],anR:[.8,0,0]},
  // burrow
  dive:{head:[1.2,0,0,0,-2.5,.6]},
  under:{head:[1.2,0,0,0,-4,0]},
  erupt:{head:[-.9,0,0,0,4.2,0],mdL:[0,.8,0],mdR:[0,-.8,0],anL:[-.8,0,0],anR:[-.8,0,0]},
  // roar
  roar:{head:[-.9,0,0,0,3.6,-.4],mdL:[0,.9,0],mdR:[0,-.9,0],anL:[-.9,0,0],anR:[-.9,0,0]},
  coil:{head:[.3,0,0,0,-.4,-.4],mdL:[0,.2,0],mdR:[0,-.2,0]},
  stag:{head:[.5,0,.6,0,-.6,0],mdL:[0,.8,0],mdR:[0,-.2,0],anL:[.6,0,0],anR:[.2,0,0]},
  dead:{head:[.6,0,1.2,0,-.9,0],mdL:[0,.9,0],mdR:[0,-.9,0]}};
function ssrSand(p,n,r){burst(gY(p,.3),SSR.sand,n||40,r||4,3.5,.9);svShock(p,SSR.sand,(r||4)*1.2,.5);svDecal(p,0x6a4a24,(r||4)*.7,3,.5)}
function ssrGone(e,on){const S=e.sv;S.gone=on;S.ghost=on;e.m.visible=!on;if(on)ssrSand(e.m.position,50,3)}
// burrow: hide, a ripple hunts the hero for T, then the eruption warning, then the burst
function ssrBurrow(t0,T,W,dm){
  return [[t0,c=>{ssrGone(c.e,true);svSnd('heavy',.8,.6);c.S.rip=1}],
    [t0+.05,c=>{let t=0;const e=c.e,S=c.S,m=e.m;kqFx({tick(dt){t+=dt||0;if(!S.rip||e.dead)return false;const d=V().subVectors(pl.position,m.position).setY(0),l=d.length();if(l>.4)walkM(m,d.x/l*Math.min(l,9*dt),d.z/l*Math.min(l,9*dt));
      if(Math.random()<.9)burst(gY(m.position,.15),SSR.sand,3,1.6,1.4,.6);if(Math.random()<dt*6)svSnd('step',.35,.6);return t<T}})}],
    [t0+T,c=>{c.S.rip=0;const an={x:c.m.position.x,z:c.m.position.z,a:0};c.M.an.bu=an;c.M.warn.push(svWarn({k:'c',r:3.8},an,W));svSnd('hum',.6,.5)}],
    [t0+T+W,c=>{const e=c.e,an=c.M.an.bu;e.m.position.set(an.x,0,an.z);e.m.rotation.y=svYawTo(e.m,pl.position);ssrTrail(e,c.S,true);ssrGone(e,false);ssrSand(e.m.position,90,4.5);shake(.45);svSnd('heavy',1.1);svSnd('roar',.7,1.3);
      svHitNow(e,{k:'c',r:3.8},an,dm,{kb:4,col:SSR.sand})}]]}
function ssrGlob(c,q,T){const e=c.e,S2={k:'c',r:2},an={x:q.x,z:q.z,a:0},o=svWP(e,'head',0,.2,1.3);c.M.warn.push(svWarn(S2,an,T));
  svShot(o,new THREE.Vector3(q.x,GH(q.x,q.z)+.2,q.z),T,SSR.col,1.4,5,P=>{if(e.dead||!AF)return;burst(P,SSR.col,26,2.6,2.5,.6);svDecal(P,0x2a0800,1.8,3.5,.6);svSnd('squelch',.6,.8);svHitNow(e,S2,an,.85,{col:SSR.col})})}
function ssrSpray(c,a0){const e=c.e,o=svWP(e,'head',0,0,1.2),S2={k:'a',r:9,h:.38},an={x:e.m.position.x,z:e.m.position.z,a:e.m.rotation.y+a0};
  for(let k=0;k<22;k++){const d=1.5+Math.random()*7.5,a=an.a+(Math.random()-.5)*.7;burst(new THREE.Vector3(an.x+Math.sin(a)*d,GH(an.x,an.z)+.3+Math.random()*1.5,an.z+Math.cos(a)*d),SSR.acid,2,1,1.2,.6)}
  burst(o,SSR.acid,16,3,1,.5);svSnd('hiss',.8,1.1);svHitNow(e,S2,an,.9,{col:SSR.acid,on:()=>dqDebuff('Acid','🟡',{pdP:-.15},3000,'Armour melting')});
  for(let d=3;d<9;d+=2.5)svDecal(new THREE.Vector3(an.x+Math.sin(an.a)*d,0,an.z+Math.cos(an.a)*d),0x3a5a08,1.2,2.5,.4)}
var SSRM={
  intro:{dur:2.8,trk:[[.5,'coil','io'],[1.1,'coil','l',.02],[1.7,'roar','o'],[2.4,'roar','l',.025],[2.8,'sRec','io']],trn:[[0,2.8,1]],
    ev:[[.3,c=>svSnd('hiss',.8,.5)],[1.6,c=>{svSnd('roar',1.1,.8);shake(.4);ssrSand(c.m.position,80,5)}]]},
  snap:{wt:10,r:[0,6.5],a:'f',mel:1,dur:1.3,lock:.5,trk:[[.5,'sOpen','io'],[.66,'sOpen','l',.02],[.82,'sSnap','s'],[1.3,'sRec','io']],rm:[[.66,.82,2.2,'o']],
    hit:[{t:.8,s:{k:'a',r:5.6,h:.75},f:.6,dm:1.15,track:1,show:false}],ev:[[.25,c=>svSnd('hiss',.7,1.2)],[.8,c=>{svSnd('crack',.9,.8);shake(.12)}]],nx:[['snap2',.0]],rec:.25},
  snap2:{ph:2,dur:1.0,mel:1,lock:.25,trk:[[.25,'sOpen','io'],[.38,'sOpen','l',.02],[.52,'sSnap','s'],[1.0,'sRec','io']],rm:[[.38,.52,2,'o']],
    hit:[{t:.5,s:{k:'a',r:5.6,h:.75},f:.6,dm:1.1,track:1,show:false}],ev:[[.5,c=>{svSnd('crack',.9,.9);shake(.12)}]],rec:.3},
  slam:{wt:9,r:[3,11],a:'f',dur:2.35,lock:1.0,armor:1,trk:[[.75,'rUp','io'],[1.1,'rUp','l',.03],[1.28,'rDn','i'],[1.85,'rRec','l'],[2.35,'sRec','io']],
    hit:[{t:1.26,s:{k:'l',w:3.4,l:9.5,b:0},f:.5,dm:1.55,w:.5,fx:(c,an)=>{for(let d=2;d<9;d+=2.2)ssrSand(new THREE.Vector3(an.x+Math.sin(an.a)*d,0,an.z+Math.cos(an.a)*d),16,2);shake(.45);svSnd('heavy',1.1)}}],
    ev:[[.3,c=>svSnd('hiss',.8,.7)],[1.05,c=>svSnd('whoosh',1,.5)]],rec:.4},
  spray:{wt:7,r:[0,10],a:'f',dur:2.4,lock:.75,armor:1,trn:[[0,.75,2.5]],trk:[[.6,'aUp','io'],[.95,'aUp','l',.02],[1.25,'aMid','l'],[1.55,'aEnd','l'],[2.4,'sRec','io']],
    hit:[{t:1.0,s:{k:'a',r:9,h:.38},ay:.75,dm:0,nohit:1,w:.55,fx:c=>ssrSpray(c,.75)},{t:1.28,s:{k:'a',r:9,h:.38},dm:0,nohit:1,w:.6,fx:c=>ssrSpray(c,0)},{t:1.56,s:{k:'a',r:9,h:.38},ay:-.75,dm:0,nohit:1,w:.6,fx:c=>ssrSpray(c,-.75)}],
    ev:[[.3,c=>svSnd('squelch',.8,.6)]],rec:.4},
  charge:{wt:8,r:[8,30],a:'f',dur:2.4,lock:.9,armor:1,trn:[[0,.9,3]],trk:[[.6,'cLow','io'],[.9,'cLow','l',.02],[1.05,'cRun','o'],[1.75,'cRun','l'],[2.4,'sRec','io']],
    rm:[[.95,1.75,17,'l']],hit:[{t:1.2,s:{k:'l',w:3.4,l:18,b:0},f:0,dm:1.4,w:1.0,kb:4,show:true}],
    ev:[[.4,c=>{svSnd('hiss',.7,.6);burst(gY(c.m.position,.3),SSR.sand,20,2,1,.6)}],[.95,c=>{svSnd('roar',.8,1.2);shake(.2)}]],
    tk(c,dt){if(c.M.t>.95&&c.M.t<1.75){burst(gY(c.m.position,.2),SSR.sand,4,2,1.5,.6);if(Math.random()<dt*8)svSnd('step',.5,.7);}},rec:.5},
  burrow:{wt:7,r:[6,40],a:'any',dur:4.4,armor:1,inv:[.55,3.6],trk:[[.5,'cLow','io'],[.75,'dive','i'],[1.0,'under','l'],[3.45,'under','l'],[3.65,'erupt','o'],[4.0,'erupt','l'],[4.4,'sRec','io']],
    ev:ssrBurrow(.75,1.9,.8,1.5).concat([[.2,c=>svSnd('hiss',.6,.5)]]),end(c){if(c.S.gone)ssrGone(c.e,false);c.S.rip=0},rec:.6},
  // ---- Phase II ----
  awaken:{dur:3.3,inv:[0,3.3],armor:1,trk:[[.5,'coil','io'],[1.2,'coil','l',.03],[1.7,'roar','o'],[2.8,'roar','l',.02],[3.3,'sRec','io']],trn:[[0,3,1]],
    hit:[{t:1.75,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.2,fx:c=>{ssrSand(c.m.position,120,7);svShock(c.m.position,SSR.col,10,.8)}}],
    ev:[[.05,c=>{banner('THE ENDLESS HUNGER',"Ssith'ra burns from within",'');svSnd('hiss',.9,.4)}],[1.2,c=>{c.S.ph=2;c.e.bs.ph=2;flash('rgba(255,140,60,.35)');svSnd('roar',1.2,.75);shake(.55)}]]},
  geysers:{wt:8,ph:2,r:[0,40],a:'any',dur:6.6,armor:1,inv:[.55,5.9],trk:[[.5,'cLow','io'],[.75,'dive','i'],[1.0,'under','l'],[2.35,'under','l'],[2.5,'erupt','o'],[2.75,'under','i'],[3.95,'under','l'],[4.1,'erupt','o'],[4.35,'under','i'],[5.55,'under','l'],[5.75,'erupt','o'],[6.1,'erupt','l'],[6.6,'sRec','io']],
    ev:ssrBurrow(.75,1.1,.6,1.2).concat([[2.7,c=>{ssrGone(c.e,true);c.S.rip=1;let t=0;const e=c.e,m=e.m;kqFx({tick(dt){t+=dt||0;const d=V().subVectors(pl.position,m.position).setY(0),l=d.length();if(l>.4)walkM(m,d.x/l*Math.min(l,10*dt),d.z/l*Math.min(l,10*dt));if(Math.random()<.9)burst(gY(m.position,.15),SSR.sand,3,1.6,1.4,.6);return t<.85&&!e.dead}})}],
      [3.55,c=>{const an={x:c.m.position.x,z:c.m.position.z,a:0};c.M.an.b2=an;c.M.warn.push(svWarn({k:'c',r:3.8},an,.55))}],[4.1,c=>{const an=c.M.an.b2;c.m.position.set(an.x,0,an.z);ssrTrail(c.e,c.S,true);ssrGone(c.e,false);ssrSand(c.m.position,80,4.5);shake(.4);svSnd('heavy',1);svHitNow(c.e,{k:'c',r:3.8},an,1.2,{kb:4})}],
      [4.3,c=>{ssrGone(c.e,true);let t=0;const e=c.e,m=e.m;kqFx({tick(dt){t+=dt||0;const d=V().subVectors(pl.position,m.position).setY(0),l=d.length();if(l>.4)walkM(m,d.x/l*Math.min(l,10*dt),d.z/l*Math.min(l,10*dt));if(Math.random()<.9)burst(gY(m.position,.15),SSR.sand,3,1.6,1.4,.6);return t<.85&&!e.dead}})}],
      [5.2,c=>{const an={x:c.m.position.x,z:c.m.position.z,a:0};c.M.an.b3=an;c.M.warn.push(svWarn({k:'c',r:4.2},an,.55))}],[5.75,c=>{const an=c.M.an.b3;c.m.position.set(an.x,0,an.z);c.m.rotation.y=svYawTo(c.m,pl.position);ssrTrail(c.e,c.S,true);ssrGone(c.e,false);ssrSand(c.m.position,110,5);shake(.5);svSnd('heavy',1.2);svSnd('roar',.8,1.2);svHitNow(c.e,{k:'c',r:4.2},an,1.4,{kb:5});c.S.rip=0}]]),
    end(c){if(c.S.gone)ssrGone(c.e,false);c.S.rip=0},rec:.7},
  spit:{wt:7,ph:2,r:[5,40],a:'any',dur:2.6,armor:1,trn:[[0,2.6,2.5]],trk:[[.5,'aMid','io'],[.8,'aMid','l',.02],[.95,'sSnap','s'],[1.25,'aMid','io'],[1.4,'sSnap','s'],[1.7,'aMid','io'],[1.85,'sSnap','s'],[2.6,'sRec','io']],
    ev:[[.3,c=>svSnd('squelch',.8,.6)]].concat([[.95,0],[1.4,1],[1.85,2]].map(([t,i])=>[t,c=>{const d=pl.mvd&&nowP()-pl.mvd.t<300?pl.mvd:{x:0,z:0};[0,1].forEach(j=>{const q=c.inA(pl.position.clone().add(new THREE.Vector3(d.x*(1.5+j*2.2),0,d.z*(1.5+j*2.2))),.8);ssrGlob(c,q,.75)})}])),rec:.45}};
SSRM.snap.nx=[['snap2',.65,8]];
svReg(3,{name:"Ssith'ra",col:SSR.col,body:1.9,ph2:.55,poise:.17,headJ:'head',turnA:3.2,edge:2.5,
  ai:{pref:5,walk:3.0,run:5,turn:2.0,rest:[.7,1.3],ph2r:.7,strafe:.55},
  build:ssrBuild,loco:ssrLoco,post:ssrPost,P:SSRP,M:SSRM,
  init(e){ssrTrail(e,e.sv,true)},
  stag:[[.3,'stag','o'],[2.0,'stag','l',.03],[2.6,'sRec','io']],stagT:2.6,
  die:[[.5,'stag','o'],[1.3,'dead','i'],[2.1,'dead','l']],
  homeY(A){const a=A.dn&&A.dn.ea!=null?A.dn.ea:0;return Math.atan2(Math.cos(a),Math.sin(a))},
  reset(e){if(e.sv.gone)ssrGone(e,false);e.sv.rip=0;ssrTrail(e,e.sv,true)}});
