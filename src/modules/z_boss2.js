// ================= v55: every Sovereign fights differently — own movement style and signature moves =================
// enemies hidden underground / faded out can't be hurt
{const f=hurt;hurt=function(e,d,s,c,dot){if(e&&e.hid){if(e.m&&nowP()-(e.hidT||0)>600){e.hidT=nowP();dn(e.m.position,'Out of reach','#9aa0aa',-30,600)}return 0}return f(e,d,s,c,dot)}}
const bxA=A=>A.bx||(A.bx=[]);
const inArena=(A,q,m)=>{const dx=q.x-A.cx,dz=q.z-A.cz,l=Math.hypot(dx,dz),r=ARENA_R-(m||1.6);if(l>r){q.x=A.cx+dx/l*r;q.z=A.cz+dz/l*r}return q};
const toPl=(o)=>{const d=V().subVectors(pl.position,o).setY(0);const l=d.length()||1;return d.multiplyScalar(1/l)};
function bxPool(A,o,r,t,col,k){const ms=new THREE.Mesh(new THREE.CircleGeometry(r,28),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.32,depthWrite:false,blending:THREE.AdditiveBlending}));ms.rotation.x=-Math.PI/2;ms.position.set(o.x,GH(o.x,o.z)+.16,o.z);scene.add(ms);bxA(A).push({k:'pool',o:o.clone(),r,t,ms,tick:0,mult:k||.22})}
function bxHide(e,on){e.hid=on?1:0;e.m.visible=!on;if(e.hb)e.hb.visible=!on}
function jumpTo(e,q,dur,h){e.jmp={sx:e.m.position.x,sz:e.m.position.z,tx:q.x,tz:q.z,t:0,dur,h}}
Object.assign(BMV,{
  // ---- Grimtusk: pack hunter ----
  pounce(e,A,en){const q=inArena(A,pl.position.clone());tele(q,2.8,.8*en,()=>{if(!A.f)return;ring(q,A.b.col,6,350);burst(gY(q,.4),A.b.col,30,4,3,.6);shake(.2);if(d2(pl.position,q)<3)bossHit(e,1.3)});jumpTo(e,q,.8*en,4.5);return {d:1.3*en,lock:1}},
  triple(e,A,en){say('⚠ '+A.b.name+' charges again and again!');[0,1,2].forEach(i=>setTimeout(()=>{if(A.f&&!e.dead&&!e.bs.dash)BMV.charge(e,A,en*.7)},i*1050*en));return {d:3.6*en,lock:1}},
  // ---- Bogmaw: hops everywhere ----
  tongue(e,A,en){const o=e.m.position.clone(),d=toPl(o);tele(o,0,.55*en,()=>{if(!A.f)return;for(let s=1;s<11;s+=1)burst(gY(o.clone().addScaledVector(d,s),.6),0xe06a8a,2,1,1,.3);
      if(inLine(pl.position,o,d,11,1.4)&&hero.iv<=0){bossHit(e,.9);const p=o.clone().addScaledVector(d,2.4);pl.position.x=p.x;pl.position.z=p.z;dn(pl.position,'Pulled!','#ff9ab0',-20,700)}},{w:1.4,l:11,d});return {d:1.1*en,lock:1}},
  spit(e,A,en){const N=e.bs.ph>=3?5:3;for(let i=0;i<N;i++){const q=inArena(A,pl.position.clone().add(V((Math.random()-.5)*6,0,(Math.random()-.5)*6)));if(i==0)q.copy(inArena(A,pl.position.clone()));
      tele(q,2.2,(.9+i*.15)*en,()=>{if(!A.f)return;burst(gY(q,.3),0x7aff4a,16,2,2,.5);if(d2(pl.position,q)<2.2)bossHit(e,.7);bxPool(A,q,2.2,6,0x6aff3a)})}return {d:1.3*en,lock:0}},
  // ---- Ashen Warden: a slow fortress that ricochets ----
  shellspin(e,A,en){const d=toPl(e.m.position);say('⚠ '+A.b.name+' spins into its shell!');tele(e.m.position,0,.8*en,()=>{if(A.f)e.spin={x:d.x,z:d.z,t:2.6,hitT:0,b:0}},{w:3,l:12,d});return {d:3.6*en,lock:1}},
  quake(e,A,en){[0,1,2].forEach(i=>setTimeout(()=>{if(A.f&&!e.dead)BMV.wave(e,A,en)},i*750*en));return {d:2.8*en,lock:1}},
  boulders(e,A,en){let n=0;const N=e.bs.ph>=2?5:4,f=()=>{if(n++>=N||!A.f)return;const q=inArena(A,pl.position.clone().add(V((Math.random()-.5)*2,0,(Math.random()-.5)*2)));
      tele(q,3,1.1*en,()=>{if(!A.f)return;ring(q,0xc8a070,6,400);burst(gY(q,.4),0x8a7a6a,30,4,4,.8);shake(.15);if(d2(pl.position,q)<3)bossHit(e,1.2)});setTimeout(f,600*en)};f();return {d:(N*.6+1)*en,lock:0}},
  // ---- Mire Colossus: rooted, burrows and fills the air with spores ----
  burrow(e,A,en){bxHide(e,true);burst(gY(e.m.position,.4),0x7a5a3a,40,3,3,.8);setTimeout(()=>{if(!A.f||e.dead){bxHide(e,false);return}const q=inArena(A,pl.position.clone());
      tele(q,3.2,1.0*en,()=>{e.m.position.set(q.x,0,q.z);bxHide(e,false);if(!A.f)return;ring(q,A.b.col,7,400);burst(gY(q,.5),0x7a5a3a,50,5,4,.9);shake(.3);if(d2(pl.position,q)<3.2)bossHit(e,1.4)})},350*en);return {d:2.2*en,lock:1}},
  spores(e,A,en){for(let i=0;i<(e.bs.ph>=2?5:4);i++){const q=inArena(A,i==0?pl.position.clone():V(A.cx+(Math.random()-.5)*20,0,A.cz+(Math.random()-.5)*20));tele(q,2.6,(.9+i*.1)*en,()=>{if(A.f)bxPool(A,q,2.6,7,0xb050e0,.25)})}say('☁ Toxic spores drift across the arena.');return {d:1.4*en,lock:0}},
  sporering(e,A,en){const o=e.m.position.clone();[4,7.5,11].forEach((r,j)=>{for(let k=0;k<10+j*4;k++){const a=k/(10+j*4)*6.283+j*.3,q=inArena(A,o.clone().add(V(Math.cos(a)*r,0,Math.sin(a)*r)),.8);tele(q,1.3,(.8+j*.55)*en,()=>{if(!A.f)return;burst(gY(q,.3),A.b.col,6,2,2,.4);if(d2(pl.position,q)<1.3)bossHit(e,.8)})}});return {d:2.6*en,lock:1}},
  // ---- Crypt Matriarch: skitters and webs ----
  web(e,A,en){const o=e.m.position.clone(),a0=Math.atan2(pl.position.x-o.x,pl.position.z-o.z);let hit=false;[-.38,0,.38].forEach(da=>{const d=V(Math.sin(a0+da),0,Math.cos(a0+da));
      tele(o,0,.75*en,()=>{if(!A.f)return;for(let s=1;s<12;s+=1.5)burst(gY(o.clone().addScaledVector(d,s),.5),0xe8e8f0,2,1,1,.4);if(!hit&&inLine(pl.position,o,d,12,1.6)&&hero.iv<=0){hit=true;bossHit(e,.7);
        hero.buffs=hero.buffs.filter(b=>b.n!='Webbed');hero.buffs.push({n:'Webbed',i:'🕸️',s:{mspd:-.55},t:nowP()+2500,d:'Slowed'});hsDirty();dn(pl.position,'Webbed!','#e8e8f0',-20,800)}},{w:1.6,l:12,d})});return {d:1.3*en,lock:1}},
  // ---- Pyrelord Vash: takes to the air ----
  flyby(e,A,en){const o=e.m.position.clone(),d=toPl(o),L=Math.min(22,d2(o,pl.position)+8),end=inArena(A,o.clone().addScaledVector(d,L),2);const len=d2(o,end);say('⚠ '+A.b.name+' takes to the sky!');
    tele(o,0,1.0*en,()=>{if(!A.f)return;e.fly={sx:o.x,sz:o.z,tx:end.x,tz:end.z,t:0,dur:.7};setTimeout(()=>{if(!A.f)return;for(let s=0;s<len;s+=1.2)burst(gY(o.clone().addScaledVector(d,s),.4),0xff6a20,6,3,4,.6);shake(.2);if(inLine(pl.position,o,d,len,3.2)&&hero.iv<=0)bossHit(e,1.4)},700)},{w:3.2,l:len,d});
    e.lift=1;return {d:2.3*en,lock:1}},
  meteor(e,A,en){let n=0;const N=e.bs.ph>=3?8:6,f=()=>{if(n++>=N||!A.f)return;const q=inArena(A,n%2?pl.position.clone():V(A.cx+(Math.random()-.5)*22,0,A.cz+(Math.random()-.5)*22));
      tele(q,2.8,1.2*en,()=>{if(!A.f)return;ring(q,0xff6a20,6,400);burst(gY(q,.5),0xff6a20,40,5,5,.8);shake(.15);if(d2(pl.position,q)<2.8)bossHit(e,1.1)});setTimeout(f,350*en)};f();return {d:(N*.35+1.4)*en,lock:0}},
  // ---- The Hollow King: blinks, bone lines and prisons ----
  bonelines(e,A,en){const o=e.m.position.clone(),a0=Math.atan2(pl.position.x-o.x,pl.position.z-o.z);let hit=false;[-.45,0,.45].forEach(da=>{const d=V(Math.sin(a0+da),0,Math.cos(a0+da));
      tele(o,0,1.0*en,()=>{if(!A.f)return;for(let s=1;s<15;s+=1.2)burst(gY(o.clone().addScaledVector(d,s),.6),0xe8e0c8,3,1,3,.5);if(!hit&&inLine(pl.position,o,d,15,2.2)&&hero.iv<=0){hit=true;bossHit(e,1.2)}},{w:2.2,l:15,d})});return {d:1.6*en,lock:1}},
  prison(e,A,en){const c=pl.position.clone();say('⚠ Bones rise around you. Dash out through a gap!');for(let k=0;k<8;k++){if(k%4==1)continue;const a=k/8*6.283,q=inArena(A,c.clone().add(V(Math.cos(a)*3,0,Math.sin(a)*3)),.8);
      tele(q,1.5,1.2*en,()=>{if(!A.f)return;burst(gY(q,.6),0xe8e0c8,12,2,4,.6);if(d2(pl.position,q)<1.5)bossHit(e,.8)})}tele(c,2.2,1.8*en,()=>{if(!A.f)return;ring(c,A.b.col,4,300);if(d2(pl.position,c)<2.2)bossHit(e,1.5)});return {d:2.2*en,lock:0}},
  // ---- The Wailing Lumen: fades, splits and haunts ----
  fade(e,A,en){bxHide(e,true);burst(gY(e.m.position,1),A.b.col,30,2,2,.8);setTimeout(()=>{if(!A.f||e.dead){bxHide(e,false);return}const ry=Math.atan2((pl.mvd||{x:0}).x||0,(pl.mvd||{z:1}).z||1),q=inArena(A,pl.position.clone().add(V(-Math.sin(ry)*2.6,0,-Math.cos(ry)*2.6)));
      e.m.position.set(q.x,0,q.z);bxHide(e,false);burst(gY(q,1),A.b.col,30,2,2,.6);const o=q.clone();tele(o,3,.7*en,()=>{if(!A.f)return;ring(o,A.b.col,6,350);if(d2(pl.position,o)<3)bossHit(e,1.3)})},1500*en);return {d:2.6*en,lock:1}},
  orbs(e,A,en){const N=e.bs.ph>=2?6:4;for(let i=0;i<N;i++){const ms=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),new THREE.MeshBasicMaterial({color:A.b.col}));const a=i/N*6.283;ms.position.copy(gY(e.m.position.clone().add(V(Math.cos(a)*2,0,Math.sin(a)*2)),1.2));scene.add(ms);
      bxA(A).push({k:'orb',ms,t:7,sp:2.6+i*.15,e})}say('✦ Wailing orbs drift toward you.');return {d:1.2*en,lock:0}},
  clones(e,A,en){say('⚠ '+A.b.name+' splits apart! The copies explode.');for(let i=0;i<3;i++){const a=i/3*6.283+Math.random(),q=inArena(A,pl.position.clone().add(V(Math.cos(a)*7,0,Math.sin(a)*7)));
      const m2=cr(e.c);m2.scale.setScalar(e.m.bs*.6);m2.position.copy(q);scene.add(m2);bxA(A).push({k:'clone',g:m2,t:3.4*en,boom:false,e})}return {d:1.4*en,lock:0}},
  // ---- Stormwing Sovereign: kites and dive-bombs ----
  dive(e,A,en){const N=e.bs.ph>=3?3:2;[...Array(N)].forEach((_,i)=>setTimeout(()=>{if(!A.f||e.dead)return;const o=e.m.position.clone(),d=toPl(o);tele(o,0,.55*en,()=>{if(A.f)e.bs.dash={x:d.x,z:d.z,t:.55,h:0,sp:22}},{w:2.4,l:12,d})},i*1150*en));return {d:(N*1.15+.6)*en,lock:1}},
  gust(e,A,en){const o=e.m.position.clone();tele(o,6,.7*en,()=>{if(!A.f)return;ring(o,0xc8e8ff,7,400);if(d2(pl.position,o)<6){const d=toPl(o),q=inArena(A,pl.position.clone().addScaledVector(d,6),1);pl.position.x=q.x;pl.position.z=q.z;bossHit(e,.6);dn(pl.position,'Blown back!','#c8e8ff',-20,700)}});return {d:1.3*en,lock:1}},
  lightning(e,A,en){const o=e.m.position.clone(),d=toPl(o);for(let i=0;i<8;i++){const q=inArena(A,o.clone().addScaledVector(d,2+i*2.4),.8);tele(q,1.8,(.6+i*.13)*en,()=>{if(!A.f)return;burst(gY(q,2),0xcfe8ff,12,1,6,.3);ring(q,0x9ad8ff,3,200);if(d2(pl.position,q)<1.8)bossHit(e,1)})}return {d:1.8*en,lock:0}},
  // ---- Wyrm of the Waste: swims under the sand ----
  submerge(e,A,en){bxHide(e,true);burst(gY(e.m.position,.3),0xd8b070,50,4,3,.9);e.sub={t:2.2,trail:0};say('⚠ '+A.b.name+' burrows beneath the sand!');return {d:3.4*en,lock:1}},
  tailsweep(e,A,en){const o=e.m.position.clone();tele(o,5.6,.75*en,()=>{if(!A.f)return;ring(o,A.b.col,8,350);burst(gY(o,.4),0xd8b070,40,5,3,.6);if(d2(pl.position,o)<5.6)bossHit(e,1.2)});return {d:1.3*en,lock:1}}
});
// movement styles and move pools, one per Sovereign (index matches BOSSES)
var BSTY=[
 {m:'circle',r:6.5,sp:3.0,pool:[['pounce','charge','slam'],['adds','rain'],['triple']]},
 {m:'hop',sp:0,pool:[['tongue','spit','slam'],['pounce','mines'],['wave','adds']]},
 {m:'slow',sp:.9,pool:[['shellspin','slam','boulders'],['quake'],['shellspin','cross']]},
 {m:'root',sp:0,pool:[['spores','burrow','rain'],['sporering','adds'],['beam']]},
 {m:'skitter',r:5.5,sp:4.2,pool:[['web','pounce','charge'],['adds','mines'],['web','cross']]},
 {m:'hover',r:8.5,sp:2.8,fly:.7,pool:[['flyby','beam','rain'],['meteor','cross'],['flyby','wave']]},
 {m:'blink',sp:1.6,pool:[['bonelines','slam','adds'],['prison','cross'],['beam']]},
 {m:'drift',sp:1.3,fly:.45,pool:[['orbs','fade','wave'],['clones','beam'],['mines','clones']]},
 {m:'kite',r:9,sp:5.2,fly:.9,pool:[['dive','lightning','gust'],['rain','cross'],['dive','beam']]},
 {m:'burrow',sp:1.7,pool:[['submerge','tailsweep','beam'],['charge','mines'],['submerge','wave','adds']]}];
function bxTick(A,e,dt,now){const L=bxA(A);
  for(let i=L.length-1;i>=0;i--){const f=L[i];f.t-=dt;let gone=f.t<=0;
    if(f.k=='pool'){f.tick-=dt;f.ms.material.opacity=.32*Math.min(1,f.t/1.2);if(f.tick<=0&&d2(pl.position,f.o)<f.r&&hero.iv<=0){f.tick=.5;bossHit(e,f.mult)}if(gone)scene.remove(f.ms)}
    else if(f.k=='orb'){const d=V().subVectors(gY(pl.position,1.2),f.ms.position);const l=d.length();f.ms.position.addScaledVector(d,Math.min(1,f.sp*dt/(l||1)));f.ms.scale.setScalar(1+.15*Math.sin(now/120+i));
      if(l<1&&hero.iv<=0){bossHit(e,.8);burst(f.ms.position,A.b.col,16,2,2,.4);gone=true}if(gone)scene.remove(f.ms)}
    else if(f.k=='clone'){const g=f.g,d=V().subVectors(pl.position,g.position).setY(0),l=d.length();if(!f.boom){if(l>.5)g.position.addScaledVector(d,Math.min(1,2.2*dt/l));g.rotation.y=Math.atan2(d.x,d.z);if(g.rig)g.rig(now,true,2)}
      if(f.t<1.1&&!f.boom){f.boom=true;const q=g.position.clone();tele(q,2.6,1.0,()=>{burst(gY(q,1),A.b.col,40,4,3,.8);if(A.f&&d2(pl.position,q)<2.6)bossHit(e,1.1)})}if(gone)scene.remove(g)}
    if(gone)L.splice(i,1)}}
function bossAI(e,dt,now,tg,L,v){
  const A=arenaOf(e),m=e.m,b=e.bs,S=BSTY[A?A.i:0]||BSTY[0];
  if(!A){animC(m,now,false,0);return}
  if(!A.f){e.agg=0;if(e.hid)bxHide(e,false);e.jmp=e.fly=e.spin=e.sub=null;e.c.h=Math.min(M(e.c),e.c.h+M(e.c)*dt*.2);const hx=A.cx-m.position.x,hz=A.cz-m.position.z,hl=Math.hypot(hx,hz);if(hl>.6)walkM(m,hx/hl*2*dt,hz/hl*2*dt);animC(m,now,hl>.6,1.5);return}
  e.agg=1;v=V().subVectors(pl.position,m.position).setY(0);L=v.length()||.01;
  const hpr=e.c.h/M(e.c),ph=hpr>.7?1:hpr>.4?2:3;
  if(ph>b.ph){b.ph=ph;banner(ph==2?'PHASE II':'PHASE III',A.b.name+(ph==3?' is enraged!':' grows stronger'),'');ring(m.position,A.b.col,8,600);burst(gY(m.position,1.2),A.b.col,80,5,4,1);shake(.3);b.t=Math.min(b.t,1.2);if(ph==3)e.enr=1}
  const en=1.28*Math.max(.82,(1-.015*A.i)*(ph==3?.88:ph==2?.94:1)),sm=ph==3?1.25:ph==2?1.1:1;
  b.lock=Math.max(0,b.lock-dt);b.t-=dt;bxTick(A,e,dt,now);
  let mv=false,fly=S.fly||0;
  // special locomotion states first
  if(e.jmp){const j=e.jmp;j.t+=dt;const k=Math.min(1,j.t/j.dur);m.position.x=j.sx+(j.tx-j.sx)*k;m.position.z=j.sz+(j.tz-j.sz)*k;fly+=Math.sin(k*Math.PI)*j.h;m.rotation.y=Math.atan2(j.tx-j.sx,j.tz-j.sz);mv=true;if(k>=1)e.jmp=null}
  else if(e.fly){const f=e.fly;f.t+=dt;const k=Math.min(1,f.t/f.dur);m.position.x=f.sx+(f.tx-f.sx)*k;m.position.z=f.sz+(f.tz-f.sz)*k;fly+=2.5*Math.sin(k*Math.PI)+.8;m.rotation.y=Math.atan2(f.tx-f.sx,f.tz-f.sz);mv=true;if(k>=1){e.fly=null;e.lift=0}}
  else if(e.spin){const s=e.spin;s.t-=dt;m.position.x+=s.x*11*dt;m.position.z+=s.z*11*dt;m.rotation.y+=dt*18;const cx=m.position.x-A.cx,cz=m.position.z-A.cz,cl=Math.hypot(cx,cz);
    if(cl>ARENA_R-1.8){const nx=cx/cl,nz=cz/cl,dt2=s.x*nx+s.z*nz;s.x-=2*dt2*nx;s.z-=2*dt2*nz;const tp=toPl(m.position);s.x=s.x*.6+tp.x*.4;s.z=s.z*.6+tp.z*.4;const l=Math.hypot(s.x,s.z);s.x/=l;s.z/=l;m.position.x=A.cx+nx*(ARENA_R-1.9);m.position.z=A.cz+nz*(ARENA_R-1.9);ring(m.position,A.b.col,3,200);shake(.1)}
    s.hitT-=dt;if(s.hitT<=0&&d2(pl.position,m.position)<2.4&&hero.iv<=0){s.hitT=.7;bossHit(e,1.1)}if(s.t<=0)e.spin=null;animC(m,now,false,0);return}
  else if(e.sub){const s=e.sub;s.t-=dt;const d=toPl(m.position);if(d2(pl.position,m.position)>1)walkM(m,d.x*7*dt,d.z*7*dt);s.trail-=dt;if(s.trail<=0){s.trail=.12;burst(gY(m.position,.2),0xd8b070,6,2,2,.5)}
    if(s.t<=0){e.sub=null;const q=m.position.clone();tele(q,3.2,.6*en,()=>{bxHide(e,false);if(!A.f)return;ring(q,A.b.col,7,400);burst(gY(q,.5),0xd8b070,60,6,5,1);shake(.35);if(d2(pl.position,q)<3.2)bossHit(e,1.5)})}return}
  else if(!b.lock&&!b.dash&&!e.hid){
    let ux=0,uz=0,sp=S.sp*sm;const vx=v.x/L,vz=v.z/L;b.side=b.side||1;b.sw=(b.sw||0)-dt;if(b.sw<=0){b.sw=2.5+Math.random()*2;b.side*=-1}
    if(S.m=='circle'||S.m=='hover'||S.m=='kite'){const rad=Math.max(-1,Math.min(1,(L-S.r)/2.5));ux=vx*rad-vz*b.side*(S.m=='kite'?1:.85);uz=vz*rad+vx*b.side*(S.m=='kite'?1:.85)}
    else if(S.m=='skitter'){const rad=Math.max(-1,Math.min(1,(L-S.r)/2)),w=Math.sin(now/220)*1.4;ux=vx*rad-vz*w;uz=vz*rad+vx*w}
    else if(S.m=='hop'){b.hop=(b.hop||1)-dt;if(b.hop<=0&&L>2.5){b.hop=(ph==3?.9:1.3);const q=inArena(A,m.position.clone().add(V(vx*Math.min(6,L-1.5),0,vz*Math.min(6,L-1.5))));jumpTo(e,q,.5,2);
        setTimeout(()=>{if(!A.f)return;burst(gY(q,.2),0x6aae4a,14,2,2,.4);if(d2(pl.position,q)<1.8)bossHit(e,.5)},500)}sp=0}
    else if(S.m=='root')sp=0;
    else if(S.m=='drift'){ux=vx+Math.sin(now/700)*.6;uz=vz+Math.cos(now/700)*.6;if(L<2.5){ux*=-.3;uz*=-.3}}
    else{if(L>3.2){ux=vx;uz=vz}}
    if(S.m=='blink'){b.bl=(b.bl==null?4:b.bl)-dt;if(b.bl<=0){b.bl=ph==3?2.6:4;burst(gY(m.position,1),A.b.col,24,2,3,.5);const a=Math.random()*6.283,q=inArena(A,pl.position.clone().add(V(Math.cos(a)*5,0,Math.sin(a)*5)));m.position.set(q.x,0,q.z);burst(gY(q,1),A.b.col,24,2,3,.5);sfx('zap',.5)}}
    const ul=Math.hypot(ux,uz);if(ul>0&&sp>0){ux/=ul;uz/=ul;walkM(m,ux*sp*dt,uz*sp*dt);mv=true}
    if(!e.jmp)m.rotation.y=Math.atan2(v.x,v.z)}
  else if(!b.dash&&L>.01&&!(b.lock&&b.face)&&!e.jmp)m.rotation.y=Math.atan2(v.x,v.z);
  walkM(m,e.vx*dt,e.vz*dt);e.vx*=.85;e.vz*=.85;
  if(b.dash){const ds=b.dash.sp||12;walkM(m,b.dash.x*dt*ds,b.dash.z*dt*ds);m.rotation.y=Math.atan2(b.dash.x,b.dash.z);b.dash.t-=dt;if(!b.dash.h&&d2(pl.position,m.position)<2.4){b.dash.h=1;bossHit(e,1.6)}if(b.dash&&b.dash.t<=0)b.dash=null}
  const cdx=m.position.x-A.cx,cdz=m.position.z-A.cz,cl=Math.hypot(cdx,cdz);if(cl>ARENA_R-1.5){m.position.x=A.cx+cdx/cl*(ARENA_R-1.5);m.position.z=A.cz+cdz/cl*(ARENA_R-1.5);if(b.dash)b.dash=null}
  if(A.b.ult&&ph>=A.b.ult&&!e.hid&&!e.jmp&&!e.fly){b.ult-=dt;if(b.ult<=0&&!b.lock&&!b.dash){b.ult=ph==3?20:26;const r=BMV.ult(e,A,en);b.lock=r.d;b.t=r.d+.8;b.last='ult';animC(m,now,false,0);return}}
  if(b.t<=0&&!b.lock&&!b.dash&&!e.hid&&!e.jmp&&!e.fly){
    let pool=[];for(let q=0;q<ph;q++)pool=pool.concat(S.pool[q]||[]);
    if(L>9){const f2=pool.filter(x=>x!='slam'&&x!='tailsweep');if(f2.length)pool=f2}if(L<4&&pool.includes('slam'))pool.push('slam');
    const c2=pool.filter(x=>x!=b.last),k=(c2.length?c2:pool)[Math.random()*(c2.length?c2.length:pool.length)|0]||'slam';
    const r=BMV[k](e,A,en);b.last=k;b.lock=r.lock?r.d:0;b.t=r.d+(ph==3?.6:1.0)*en;if(k=='slam')lunge(m,pl.position);
  }
  animC(m,now,mv||!!b.dash,mv?S.sp*sm:b.dash?6:0);
  if(fly||e.lift)m.b.position.y+=(fly+(e.lift?.6:0)+(S.fly?Math.sin(now/400)*.12:0))/(m.bs||1);
}
{const f=arenaClear;arenaClear=function(A){(A.bx||[]).forEach(q=>{if(q.ms)scene.remove(q.ms);if(q.g)scene.remove(q.g)});if(A.bx)A.bx.length=0;const e=bossEnt(A.i);if(e){if(e.hid)bxHide(e,false);e.jmp=e.fly=e.spin=e.sub=null;e.lift=0}hero.buffs=hero.buffs.filter(b=>b.n!='Webbed');return f(A)}}
