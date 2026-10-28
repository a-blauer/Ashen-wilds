// ================= v165 Searing Sands I · Qarsul, the Living Dune: the fight =================
// When the dig is done (3271, SS165.c1.st 2) the three spoil heaps stir: sand streams from them into a vortex in the middle of the
// yard and Qarsul rises out of it (the formation, ~4.5 s). A wall of whirling sand rises round the yard as he forms: from then on
// nobody leaves it (the hero is held inside) and nobody recalls. Kill him, or die. If the fight is lost (every hero in the yard
// down) or nobody is left in the yard, he slumps back into the heaps; come back and he rises again. Slain, the temple doors open.
//  * The arena (QS165A): centred in the yard before the forecourt (ss165T1().ac), radius T.arena.r; Phase II closes it by 1.5.
//  * Phase II "The Storm Wakes" (qs165Storm): sand blows round the yard, the wall thickens, three dust devils wander it on fixed
//    paths (the same for every co-op partner); touching one throws you and stings.
//  * The Heart of the Dune (signature): three mounds rise (adds with a hidden body and a mound of their own, no AI), his heart flies
//    into one and the mounds change places three times. Then ~10 s: break the mound whose glow flickers through the sand. The right
//    one → he is torn out of it (the 'broken' stagger, at that mound). A wrong one bursts in a blast of sand round it. Time runs out
//    → 'hfail': he rises healed, three slabs burst up, and the Sandstorm Burial hits everything not within 2 of a slab.
var QS165={e:null,lv:30,F:null,form:null,wall:null,storm:null,dev:[],mounds:[],slabs:[],H:null,err:0,t:0};
// run fn after sec seconds of game time (timers that follow the game clock, so tests and pauses agree)
function qs165After(sec,fn){let t=0;kqFx({tick(dt){t+=dt||0;if(t>=sec){try{fn()}catch(err){console.error('v165 after',err)}return false}return true},end(){}})}
var QS165B={name:'Qarsul',col:QS165M.col,body:2.1,ph2:.55,poise:.1,headJ:'head',turnA:3.0,edge:2.2,
  ai:{pref:3.8,walk:2.4,run:4.2,turn:2.3,rest:[.8,1.4],ph2r:.68,strafe:.5},
  build:qs165Build,loco:qs165Loco,post:qs165Post,P:QS165P,M:QS165MV,spr:{jaw:[50,7,1]},
  stag:[[.25,'stag','o'],[2.2,'stag','l',.025],[2.75,'rec','io']],stagT:2.75,
  die:[[.4,'stag','o'],[1.6,'dead','i'],[2.6,'dead','l']]};
QS165B.M.stagger=svStagDef(QS165B);
function qs165Here(){return ss165Here(0)}
function qs165Alive(){const e=QS165.e;return !!(e&&!e.dead&&enemies.includes(e))}
function qs165Arena(){const T=ss165T1();return {cx:T.ac[0],cz:T.ac[1],r:T.arena.r-1.8,hr:T.arena.r,y:T.y0,f:false,r0:T.arena.r}}
// ---------------- the wall of sand round the yard ----------------
function qs165SandTex(){if(QS165.tex)return QS165.tex;const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle='rgba(200,160,100,.0)';x.fillRect(0,0,256,128);
  for(let i=0;i<500;i++){const px=Math.random()*256,py=Math.random()*128,l=8+Math.random()*40,a=.08+Math.random()*.3;x.fillStyle='rgba('+(190+Math.random()*50|0)+','+(150+Math.random()*40|0)+','+(90+Math.random()*30|0)+','+a+')';x.fillRect(px,py,l,1+Math.random()*3);x.fillRect(px-256,py,l,1+Math.random()*3)}
  const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'rgba(210,170,110,.0)');g.addColorStop(.25,'rgba(210,170,110,.35)');g.addColorStop(1,'rgba(190,150,90,.75)');x.fillStyle=g;x.fillRect(0,0,256,128);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,1);return QS165.tex=t}
function qs165WallMake(){if(QS165.wall)return QS165.wall;const A=qs165Arena(),g=new THREE.Group();g.name='QarsulWall';
  const geo=new THREE.CylinderGeometry(1,1,1,56,1,true);geo.translate(0,.5,0);const L=[];
  [[1,4.2,.5,1],[1.05,5.6,.28,-.6],[.97,2.6,.42,1.6]].forEach(([s,h,op,sp],i)=>{const t=qs165SandTex().clone();t.needsUpdate=true;t.repeat.set(5+i*2,1);const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:op,side:THREE.DoubleSide,depthWrite:false,fog:true,color:0xe8c890}));
    m.scale.set(A.r0+.9*s,h,A.r0+.9*s);m.renderOrder=3;m.userData.lpsSkip=1;g.add(m);L.push({m,t,sp,s})});
  g.position.set(A.cx,A.y-.6,A.cz);g.visible=false;scene.add(g);QS165.wall={g,L,k:0,want:0,r:A.r0};return QS165.wall}
function qs165WallSet(on){const W=qs165WallMake();W.want=on?1:0;if(on)W.g.visible=true}
function qs165WallTick(dt,t){const W=QS165.wall;if(!W)return;W.k+=(W.want-W.k)*Math.min(1,dt*1.6);W.g.visible=W.k>.01&&qs165Here();if(!W.g.visible)return;const R=QS165A?QS165A.hr+.9:W.r+.9;
  W.L.forEach(o=>{o.t.offset.x=(t*.07*o.sp)%1;o.t.offset.y=(t*.03)%1;o.m.scale.set(R*o.s,o.m.scale.y,R*o.s);o.m.material.opacity=(o===W.L[0]?.5:o===W.L[1]?.28:.42)*W.k*(QS165.storm?1.25:1)});
  W.g.scale.y=Math.max(.05,W.k);if(Math.random()<dt*20){const a=Math.random()*6.283;burst(new THREE.Vector3(W.g.position.x+Math.cos(a)*R,W.g.position.y+1+Math.random()*4,W.g.position.z+Math.sin(a)*R),0xe0c088,1,.6,.4,.8)}}
// ---------------- the storm (Phase II): blowing sand, the closing wall, dust devils ----------------
function qs165Storm(on){const A=QS165A;if(!A)return;if(!on){if(QS165.storm){scene.remove(QS165.storm.pts);QS165.storm.pts.geometry.dispose();QS165.storm.pts.material.dispose();QS165.storm=null}qs165DevClear();A.r=A.r0-1.8;A.hr=A.r0;return}
  if(QS165.storm)return;A.r=A.r0-1.8-1.5;A.hr=A.r0-1.5;const N=700,pos=new Float32Array(N*3),sd=new Float32Array(N*3);for(let i=0;i<N;i++){const a=Math.random()*6.283,r=Math.random()*A.hr;sd[i*3]=a;sd[i*3+1]=r;sd[i*3+2]=Math.random()*6;pos[i*3]=A.cx+Math.cos(a)*r;pos[i*3+1]=A.y+sd[i*3+2];pos[i*3+2]=A.cz+Math.sin(a)*r}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));const pts=new THREE.Points(G,new THREE.PointsMaterial({color:0xe0c088,size:.18,transparent:true,opacity:.75,depthWrite:false}));pts.frustumCulled=false;scene.add(pts);
  QS165.storm={pts,sd,N};qs165DevMake()}
function qs165StormTick(dt,t){const S=QS165.storm,A=QS165A;if(!S||!A)return;S.pts.visible=qs165Here();const P=S.pts.geometry.attributes.position.array;
  for(let i=0;i<S.N;i++){S.sd[i*3]+=dt*(.5+.6*(1-S.sd[i*3+1]/A.hr));S.sd[i*3+2]=(S.sd[i*3+2]+dt*(.4+((i*7)%5)*.15))%6;const a=S.sd[i*3],r=S.sd[i*3+1];P[i*3]=A.cx+Math.cos(a)*r;P[i*3+1]=A.y+.2+S.sd[i*3+2];P[i*3+2]=A.cz+Math.sin(a)*r}
  S.pts.geometry.attributes.position.needsUpdate=true}
// dust devils: three whirlwinds on fixed Lissajous paths inside the yard (the same for everyone), each a spinning funnel
function qs165DevMake(){qs165DevClear();const A=QS165A,M=new THREE.MeshBasicMaterial({map:qs165SandTex(),transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false,color:0xd8b47a});
  for(let i=0;i<3;i++){const geo=svG('qs_dev',()=>{const q=new THREE.CylinderGeometry(1.3,.25,4.2,16,4,true);q.translate(0,2.1,0);return q}),m=new THREE.Mesh(geo,M);m.userData.lpsSkip=1;m.renderOrder=3;scene.add(m);QS165.dev.push({m,i,hitT:0})}}
function qs165DevClear(){QS165.dev.forEach(d=>{if(d.m.parent)d.m.parent.remove(d.m)});QS165.dev=[]}
function qs165DevAt(i,t){const A=QS165A,r=(A.hr-2.6)*.82,a=t*(.21+i*.04)+i*2.09,b=t*(.33-i*.05)+i*1.3;return [A.cx+Math.sin(a)*r*Math.cos(b*.5),A.cz+Math.cos(a*1.3+i)*r*.9]}
function qs165DevTick(dt,now){if(!QS165.dev.length||!QS165A)return;const t=now/1000;QS165.dev.forEach(d=>{const [x,z]=qs165DevAt(d.i,t);d.m.position.set(x,GH(x,z),z);d.m.rotation.y+=dt*9;d.m.visible=qs165Here();
    if(Math.random()<dt*12)burst(new THREE.Vector3(x+(Math.random()-.5)*1.4,GH(x,z)+.2,z+(Math.random()-.5)*1.4),0xd8b47a,1,1,2.4,.7);
    if(hero.hp>0&&QS165A.f&&now>d.hitT&&Math.hypot(pl.position.x-x,pl.position.z-z)<1.35){d.hitT=now+900;const e=QS165.e;if(e&&!e.dead)qs165HitNow(e,{k:'c',r:99},{x,z,a:0},.55,{flash:false,kb:3.5});popT(pl.position,'DUST DEVIL','#e8c890')}})}
// ---------------- the Heart of the Dune ----------------
function qs165MoundMesh(){const M=qs165SandMat(),g=new THREE.Group(),m=new THREE.Mesh(svG('qs_md',()=>{const q=new THREE.SphereGeometry(1.4,14,8,0,Math.PI*2,0,Math.PI/2),P=q.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),a=Math.atan2(z,x);P.setXYZ(i,x*(1+.12*Math.sin(a*4)),y*.85,z*(1+.12*Math.sin(a*4)))}q.computeVertexNormals();return q}),M);
  g.add(m);const gl=new THREE.Mesh(svG('qs_mdg',()=>new THREE.SphereGeometry(.55,10,6)),new THREE.MeshBasicMaterial({color:0xffb040,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));gl.position.y=.55;g.add(gl);return {g,gl}}
function qs165HeartStart(e){qs165HeartClear();const A=QS165A,S=e.sv,rnd=S.mv?S.mv.rnd:Math.random,a0=rnd()*Math.PI*2,hp=Math.max(80,Math.round(M(e.c)*.014)),spots=[];
  for(let i=0;i<3;i++){const a=a0+i*Math.PI*2/3,r=6.2;spots.push([A.cx+Math.sin(a)*r,A.cz+Math.cos(a)*r])}
  const right=Math.floor(rnd()*3);S.hN=(S.hN||0)+1;
  spots.forEach((p,i)=>{let s=null;try{s=spawnEnemy('goo',p[0],p[1],QS165.lv,{minion:1})}catch(err){console.error('qs mound',err)}if(!s)return;
    s.qsMound=1;s.qsRight=i===right;s.qsI=i;s.agg=0;s.c.n='Mound of Sand';s.c.st.hp=hp;s.c.h=hp;s.m.children.forEach(o=>{o.visible=false});const bs=s.m.bs||s.m.scale.x||1,Mm=qs165MoundMesh();Mm.g.scale.setScalar(1/bs);s.m.add(Mm.g);s.qsG=Mm;
    burst(gY(s.m.position,.6),0xd8b47a,40,2.4,2.4,.7);svShock(s.m.position,0xe8c890,2.6,.4);QS165.mounds.push(s)});
  // the heart flies from where he sank into the right mound; then the mounds change places three times
  const R=QS165.mounds.find(s=>s.qsRight);const H={t:0,ph:'fly',right:R,swaps:[],sw:-1,left:10.5,from:e.m.position.clone()};QS165.H=H;
  for(let k=0;k<3;k++){const a=Math.floor(rnd()*3),b=(a+1+Math.floor(rnd()*2))%3;H.swaps.push([a,b])}
  if(!H.orb){const o=new THREE.Mesh(svG('qs_orb',()=>new THREE.IcosahedronGeometry(.42,1)),new THREE.MeshBasicMaterial({color:0xffc050,fog:false}));o.add(kqSpr(0xffa030,2.4));scene.add(o);H.orb=o}
  say('🏜️ Qarsul sinks into the sand and his heart flies into a mound! Watch it — then break the right one.');svSnd('charge',.8,.6)}
function qs165HeartTick(dt,now){const H=QS165.H;if(!H)return;const e=QS165.e;if(!e||e.dead){qs165HeartClear();return}H.t+=dt;const t=now/1000;
  const L=QS165.mounds,pos=i=>{const s=L.find(q=>q.qsI===i);return s?s.m.position:null};
  if(H.ph=='fly'){const q=H.right&&H.right.m.position,k=Math.min(1,H.t/1.1);if(q&&H.orb){H.orb.position.set(H.from.x+(q.x-H.from.x)*k,GH(q.x,q.z)+1+Math.sin(k*Math.PI)*4,H.from.z+(q.z-H.from.z)*k)}
    if(k>=1){H.ph='shift';H.t=0;if(H.orb){scene.remove(H.orb);H.orb=null}if(H.right&&H.right.qsG)H.right.qsG.gl.material.opacity=.9;svSnd('heavy',.7,1.2)}}
  else if(H.ph=='shift'){// three swaps of 1.05 s each: the two mounds slide round each other; the heart's mound glows steadily so you can follow it
    const k=Math.floor(H.t/1.05),u=(H.t%1.05)/1.05;if(H.right&&H.right.qsG)H.right.qsG.gl.material.opacity=.55+.2*Math.sin(t*9);
    // a swap that has finished exchanges the two mounds' places (their slot numbers), once
    const fin=()=>{if(H.sw>=0&&!H.fin){H.fin=1;const [a0,b0]=H.swaps[H.sw],s0=L.find(q=>q.qsI===a0),s1=L.find(q=>q.qsI===b0);if(s0&&s1){s0.qsI=b0;s1.qsI=a0}}};
    if(k>=H.swaps.length){fin();H.ph='seek';H.t=0;H.left=10.5;L.forEach(s=>{s.agg=0;if(s.qsG)s.qsG.gl.material.opacity=0});popT(gY(QS165A?new THREE.Vector3(QS165A.cx,0,QS165A.cz):pl.position,2),'WHICH ONE?','#ffd890',true);return}
    if(H.sw!==k){fin();H.sw=k;H.fin=0;H.sp={};H.swaps[k].forEach(i=>{const s=L.find(q=>q.qsI===i);if(s)H.sp[i]=s.m.position.clone()})}
    const [a,b]=H.swaps[k],sa=L.find(q=>q.qsI===a),sb=L.find(q=>q.qsI===b);if(sa&&sb&&H.sp[a]&&H.sp[b]){const A0=H.sp[a],B0=H.sp[b],e2=svEase.io(u),mx=(A0.x+B0.x)/2,mz=(A0.z+B0.z)/2,ox=-(B0.z-A0.z)*.35,oz=(B0.x-A0.x)*.35,arc=Math.sin(u*Math.PI);
      sa.m.position.set(A0.x+(B0.x-A0.x)*e2+ox*arc,0,A0.z+(B0.z-A0.z)*e2+oz*arc);sb.m.position.set(B0.x+(A0.x-B0.x)*e2-ox*arc,0,B0.z+(A0.z-B0.z)*e2-oz*arc);
      if(Math.random()<.5)[sa,sb].forEach(s=>burst(gY(s.m.position,.3),0xd8b47a,2,1.2,1,.5))}}
  else if(H.ph=='seek'){H.left-=dt;// the right mound's glow flickers through the sand now and then
    if(H.right&&H.right.qsG){const f=Math.max(0,Math.sin(t*5.5))*Math.max(0,Math.sin(t*1.7+1));H.right.qsG.gl.material.opacity=f>.55?.45:0}
    if(H.left<=0){qs165HeartEnd(false)}}}
function qs165HeartEnd(won,at){const H=QS165.H,e=QS165.e;QS165.H=null;const p=at||(H&&H.right&&!H.right.dead?H.right.m.position.clone():null);
  QS165.mounds.slice().forEach(s=>{if(!s.dead){burst(gY(s.m.position,.6),0xd8b47a,30,2,1.6,.6);try{removeE(s)}catch(_){}}});QS165.mounds=[];if(H&&H.orb)scene.remove(H.orb);
  if(!e||e.dead)return;if(p){e.m.position.x=p.x;e.m.position.z=p.z}e.m.visible=true;svEndMove(e,true);
  if(won){svCast(e,'broken')}else svCast(e,'hfail')}
function qs165HeartClear(){const H=QS165.H;if(H&&H.orb)scene.remove(H.orb);QS165.H=null;QS165.mounds.slice().forEach(s=>{try{if(!s.dead)removeE(s)}catch(_){}});QS165.mounds=[]}
// a wrong mound bursts in your face; the right one, broken, tears him out
function qs165MoundHit(s){if(!s||s.popped||!QS165.H)return;if(s.qsRight)return;s.popped=1;s.dead=1;s.c.h=0;try{s.hb.visible=false}catch(_){}if(typeof tgt!='undefined'&&tgt===s)try{setTarget(null)}catch(_){}
  const p=s.m.position.clone(),e=QS165.e;qs165Burst(p,1.6);svShock(p,0xe8c890,3.2,.4);svSnd('heavy',1,1.1);popT(p,'EMPTY!','#ffb080',true);
  if(e&&hero.hp>0&&Math.hypot(pl.position.x-p.x,pl.position.z-p.z)<3)qs165HitNow(e,{k:'c',r:99},{x:p.x,z:p.z,a:0},.9,{flash:false,kb:3});
  const i=QS165.mounds.indexOf(s);if(i>=0)QS165.mounds.splice(i,1);setTimeout(()=>{try{removeE(s)}catch(_){}},60)}
function qs165MoundBreak(s){if(s.popped)return;s.popped=1;const p=s.m.position.clone();burst(gY(p,.8),0xffc050,80,3,3,.9);svShock(p,0xffc070,4,.5);svSnd('crack',1.2,.7);
  const i=QS165.mounds.indexOf(s);if(i>=0)QS165.mounds.splice(i,1);setTimeout(()=>{try{removeE(s)}catch(_){}},60);qs165HeartEnd(true,p)}
// ---------------- the slabs and the Sandstorm Burial ----------------
function qs165Slabs(e){qs165SlabClear();const A=QS165A,rn=e.sv.mv?e.sv.mv.rnd:Math.random,a0=rn()*Math.PI*2;
  for(let i=0;i<3;i++){const a=a0+i*Math.PI*2/3+(rn()-.5)*.5,r=4+rn()*3.6,x=A.cx+Math.sin(a)*r,z=A.cz+Math.cos(a)*r,g=lgGroup('QS165|slab',q=>{q.p('','box','c',0xbe9a66,0,1.4,0,1.7,2.8,.55).p('','box','c',0x7a5a36,0,2.86,0,1.85,.16,.62);for(let k=0;k<4;k++)q.p('','box','c',0x2e1c0c,-.45+k*.3,1.6,.29,.14,.5,.02)},0);
    g.position.set(x,GH(x,z)-3,z);g.rotation.y=a;scene.add(g);const ring=new THREE.Mesh(svG('qs_sr',()=>new THREE.RingGeometry(1.75,2.05,36).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:0x7aff9a,transparent:true,opacity:.7,depthWrite:false,fog:false}));ring.position.set(x,GH(x,z)+.08,z);scene.add(ring);
    let t=0;kqFx({tick(dt){t+=dt||0;g.position.y=GH(x,z)-3+3*svEase.o(Math.min(1,t/.6));return t<.7},end(){}});burst(gY(new THREE.Vector3(x,0,z),.5),0xd8b47a,30,2,2.5,.7);QS165.slabs.push({g,ring,x,z})}
  say('🏜️ Slabs of temple stone burst from the sand. Shelter behind one — the storm is coming!');svSnd('heavy',1.1,.6)}
function qs165SlabClear(){QS165.slabs.forEach(o=>{if(o.g.parent)o.g.parent.remove(o.g);if(o.ring.parent){o.ring.parent.remove(o.ring);o.ring.material.dispose()}});QS165.slabs=[]}
function qs165Burial(e){const P=pl.position,safe=QS165.slabs.some(o=>Math.hypot(P.x-o.x,P.z-o.z)<2.05),A=QS165A;shake(.7);svSnd('roar',.9,1.2);svSnd('whoosh',1.4,.4);
  for(let k=0;k<40;k++){const a=Math.random()*6.283,r=Math.random()*A.hr;burst(new THREE.Vector3(A.cx+Math.cos(a)*r,A.y+.5+Math.random()*3,A.cz+Math.sin(a)*r),0xd8b47a,4,2.5,1.5,1)}
  try{flash('rgba(220,170,100,.45)')}catch(_){}if(!safe&&hero.hp>0)qs165HitNow(e,{k:'c',r:99},{x:P.x,z:P.z,a:0},1.7,{flash:false,kb:2.5});else if(safe)popT(P,'SHELTERED','#9affb0',true);
  setTimeout(()=>{QS165.slabs.forEach(o=>{burst(gY(new THREE.Vector3(o.x,0,o.z),1.2),0xbe9a66,30,2,2,.8)});qs165SlabClear()},1600)}
// ---------------- spawning, the formation, the fight, the reset, the win ----------------
function qs165Spawn(){if(qs165Alive())return QS165.e;const A=qs165Arena(),key='qarsul';
  if(!EN[key])EN[key]=Object.assign({},EN.selem,{n:'Qarsul',e:'🏜️'});try{MSET[key]=[]}catch(_){}
  const c=enemyC(key,QS165.lv,{boss:1});c.n='Qarsul';const m=cr(c);m.position.set(A.cx,0,A.cz);m.rotation.y=Math.atan2(-ss165F(0).fx,-ss165F(0).fz);scene.add(m);
  const hb=bar(true);hb.scale.setScalar(3);
  const e={c,m,hb,boss:1,qs165:1,tier:4,home:[A.cx,A.cz],cd:1,ch:0,vx:0,vz:0,agg:0,bs:{t:99,lock:0,ph:1,last:'',ult:99,pb:99},wx:A.cx,wz:A.cz,wt:0,dots:[]};enemies.push(e);
  m.children.forEach(o=>{o.visible=false});const R=svRig();qs165Build(R,e);svRest(R);try{svMerge(R)}catch(err){console.error('qs merge',err)}const bs=m.bs||m.scale.x||1;R.root.scale.setScalar(1/bs);R.root.name='svqs';m.add(R.root);
  const O={};for(const k in R.J)O[k]=[0,0,0,0,0,0];
  e.sv={i:'qs',B:QS165B,R,O,P:{},snap:{},aw:0,trk:null,tt:0,mv:null,ph:1,rest:1.5,last:[],cd:{},po:0,poT:0,stg:0,inv:0,spd:0,lp:m.position.clone(),hero:1,body:QS165B.body,on:false,wait:0,act:0,fl:0,chg:0,dr:0,melt:1};
  QS165A=A;svApply(e,0,performance.now());QS165.e=e;return e}
// the formation: the heaps pour into a vortex in the middle of the yard and he rises out of it (driven by the tick; ~4.5 s)
function qs165Form(){if(QS165.form||qs165Alive()&&QS165A&&QS165A.f)return;const A=qs165Arena();QS165A=A;QS165.form={t:0,sp:0};qs165WallSet(true);sd165Stop&&sd165Stop();
  if(riding)try{dismount()}catch(_){}svSnd('whoosh',1.2,.4);svSnd('heavy',.8,.5);shake(.25);
  say('🏜️ The heaps of sand pour together in the middle of the yard… and a wall of whirling sand rises around you.')}
function qs165FormTick(dt){const F=QS165.form;if(!F)return;F.t+=dt;const A=QS165A,t=F.t;
  // sand streams from the heaps into the vortex; the heaps shrink
  SD165.heaps.forEach(h=>{const k=Math.max(0,1-t/2.6),r=Math.max(.01,h.m.scale.x*(1-dt*.5));if(k<=0)h.m.scale.set(.01,.01,.01);else h.m.scale.set(r,r*.62,r);
    if(k>0&&Math.random()<dt*14)svShot(new THREE.Vector3(h.x,GH(h.x,h.z)+.8,h.z),new THREE.Vector3(A.cx,A.y+1.5,A.cz),.5,0xd8b47a,.7,2.5,()=>{},sd165Clod())});
  if(Math.random()<dt*30){const a=Math.random()*6.283,r=.5+Math.random()*2.5;burst(new THREE.Vector3(A.cx+Math.cos(a)*r,A.y+.3+Math.random()*2.5,A.cz+Math.sin(a)*r),0xd8b47a,2,1.5,2.5,.7)}
  if(t>1.9&&!QS165.e)qs165Spawn();const e=QS165.e;if(e&&e.sv)e.sv.melt=Math.max(0,1-Math.max(0,t-2.1)/2.0);
  if(t>4.3&&e&&!e.dead){QS165.form=null;e.sv.melt=0;qs165Start(e)}}
function qs165Start(e){const S=e.sv,A=QS165A;if(!A||A.f)return;A.f=true;e.agg=1;S.on=false;S.ph=1;e.bs.ph=1;S.rest=1;S.po=0;QS165.ft=0;qs165WallSet(true);
  if(riding)try{dismount()}catch(_){}try{setTarget(e)}catch(_){}
  try{zt116Show(ZT116.Z[3],'The Sunken Gate','Qarsul','the Living Dune · warden of the buried gate','The sand walls you in: kill it, or die','z3')}catch(_){}svSnd('heavy',1,.5)}
// back to sleep (a wipe, or nobody left in the yard): he slumps back into the heaps; he will rise again
function qs165Reset(why){const e=QS165.e,A=QS165A;if(A)A.f=false;QS165.form=null;qs165Storm(false);qs165HeartClear();qs165SlabClear();qs165WallSet(false);
  if(e&&!e.dead){svEndMove(e,true);try{burst(gY(e.m.position,1.5),0xd8b47a,80,4,2,1)}catch(_){}try{removeE(e)}catch(_){}}QS165.e=null;QS165A=null;
  if(SS165.c1.st===2)sd165Heaps(true);if(why)setTimeout(()=>say('🏜️ Qarsul slumps back into the heaps of sand by the temple doors. The sand waits.'),900)}
// he falls: the sand runs out of him, the wall drops, the doors open
function qs165Won(e){const A=QS165A;if(A)A.f=false;SS165.c1.st=Math.max(SS165.c1.st,3);SS165.trkK='';qs165Storm(false);qs165HeartClear();qs165SlabClear();qs165WallSet(false);
  SD165.heaps.forEach(h=>h.m.scale.set(.01,.01,.01));qs165After(1.6,()=>{try{sd165Open()}catch(err){console.error('v165 doors',err)}});
  qs165After(2.4,()=>{try{zt116Show(ZT116.Z[3],'The Sunken Gate','Qarsul Falls','The Living Dune pours away into the sand','The doors of the Sunken Temple grind open','z3');mSfx('victory')}catch(_){}say('🏜️ Qarsul, the Living Dune, is slain. The doors of the Sunken Temple stand open.')},2400);
  try{hud()}catch(_){}}
// ---------------- hooks: his AI, his death, the mounds, the HUD, the yard ----------------
{const f=eTick;eTick=function(e,dt,now){if(e&&e.qs165){try{qs165AI(e,dt,now)}catch(err){if(!QS165.err++)console.error('v165 ai',err)}return true}if(e&&e.qsMound){e.agg=0;if(e.m)e.m.rotation.y+=0;return true}return f.apply(this,arguments)}}
{const f=kill;kill=function(e){if(e&&e.qsMound){if(e.qsRight)qs165MoundBreak(e);return}const r=f.apply(this,arguments);if(e&&e.qs165)try{qs165Won(e)}catch(err){console.error('v165 won',err)}return r}}
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.qsMound){if(!e.qsRight){qs165MoundHit(e);return}return f.apply(this,arguments)}
  if(e&&e.qs165&&e.sv&&e.sv.mv&&e.sv.mv.id==='hidden')return;return f.apply(this,arguments)}}
function qs165Hud(){const e=QS165.e,on=!!(e&&!e.dead&&QS165A&&QS165A.f&&qs165Here());let p=document.getElementById('qsPo');if(!on){if(p)p.style.display='none';return}
  const b=$('boss');if(!b)return;b.classList.remove('hide');const S=e.sv,H=QS165.H;$('bossN').textContent='🏜️ Qarsul · the Living Dune · Phase '+(S.ph>1?'II':'I')+(H?(H.ph=='seek'?' · find his heart: '+Math.ceil(H.left)+'s':' · watch the heart'):'');$('bossB').style.width=Math.max(0,100*e.c.h/M(e.c))+'%';
  if(!p){p=document.createElement('div');p.id='qsPo';p.style.cssText='height:5px;margin:4px auto 0;width:70%;background:rgba(0,0,0,.6);border:1px solid rgba(255,216,96,.35);border-radius:2px;overflow:hidden';p.innerHTML='<i style="display:block;height:100%;width:0;background:linear-gradient(90deg,#c89020,#ffe080);transition:width .12s"></i>';const mt=b.querySelector('.meter');if(mt)mt.after(p);else b.appendChild(p)}
  p.style.display='block';p.firstChild.style.width=(S.stg>0?100:Math.min(100,S.po*100)).toFixed(1)+'%';p.firstChild.style.background=S.stg>0?'#fff4c0':'linear-gradient(90deg,#c89020,#ffe080)'}
{const f=hud;hud=function(){const r=f.apply(this,arguments);try{qs165Hud()}catch(_){}return r}}
// his AI: the engine's moves, picks and rests; his own footwork inside the yard
function qs165AI(e,dt,now){const S=e.sv,A=QS165A,m=e.m;if(!A)return;if(e.hb)e.hb.visible=false;m.visible=qs165Here()&&!(S.mv&&S.mv.id==='hidden');
  const dx=m.position.x-S.lp.x,dz=m.position.z-S.lp.z;S.lp.copy(m.position);const ms=dt>0?Math.hypot(dx,dz)/dt:0;S.spd+=((ms>12?0:ms)-S.spd)*Math.min(1,dt*8);
  for(const k in S.cd)S.cd[k]=Math.max(0,S.cd[k]-dt);S.inv=Math.max(0,S.inv-dt);S.chg=(S.chg||0)+((S.chgT||0)-(S.chg||0))*Math.min(1,dt*3);
  {const p=pl.position;if(S.hp0&&dt>0){const vx=(p.x-S.hp0.x)/dt,vz=(p.z-S.hp0.z)/dt,a=Math.min(1,dt*6);if(Math.hypot(vx,vz)<20){S.hv=S.hv||{x:0,z:0};S.hv.x+=(vx-S.hv.x)*a;S.hv.z+=(vz-S.hv.z)*a}}S.hp0={x:p.x,z:p.z}}
  if(!A.f){if(S.mv&&!QS165.form)svEndMove(e,true);svApply(e,dt,now);return}
  if(qs165End()){qs165Reset(true);if(typeof qs180Ended=='function')qs180Ended();return}
  QS165.ft=(QS165.ft||0)+dt;e.agg=1;
  if(!S.on){S.on=true;S.ph=1;e.bs.ph=1;S.rest=1;S.po=0;if(qs180Auth())svCast(e,'intro')}
  if(now-S.poT>3500)S.po=Math.max(0,S.po-dt*.1);
  if(S.mv)svTickMove(e,dt,now);
  else if(!qs180Auth())qs180Glide(e,dt);
  else if(S.ph===1&&e.c.h/M(e.c)<=QS165B.ph2)svCast(e,'awaken');
  else if(!QS165.H){qs165Move(e,dt);S.rest-=dt;if(S.rest<=0){const id=svPick(e);if(id)svCast(e,id);else S.rest=.25}}
  // while his heart hides he waits under the sand (the 'hidden' move; it ends when a mound breaks or time runs out)
  if(QS165.H&&!(S.mv&&(S.mv.id==='hidden'||S.mv.id==='heart'))&&qs180Auth())svStart(e,'hidden',1);
  qs165Clamp(m.position,QS165B.edge);
  // keep the hero in the yard and out of his body
  {const p=pl.position,hx=p.x-A.cx,hz=p.z-A.cz,hd=Math.hypot(hx,hz);if(hd>A.hr){p.x=A.cx+hx/hd*A.hr;p.z=A.cz+hz/hd*A.hr}}
  if(!S.rmOn&&hero.hp>0&&m.visible&&(S.melt||0)<.5){const hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,hl=Math.hypot(hx,hz),R0=S.body;if(hl<R0&&hl>.001){const k=R0-hl;pl.position.x+=hx/hl*k;pl.position.z+=hz/hl*k}}
  svApply(e,dt,now)}
// footwork: he glides to his preferred range, circles there, backs off when crowded; slides along the wall
function qs165Move(e,dt){const S=e.sv,ai=QS165B.ai,m=e.m,v=V().subVectors(pl.position,m.position).setY(0),L=v.length()||.01;
  const da=svAng(Math.atan2(v.x,v.z)-m.rotation.y),tr=ai.turn*(S.ph>1?1.2:1);m.rotation.y+=Math.max(-tr*dt,Math.min(tr*dt,da));
  let sp=0,ux=0,uz=0;const ws=ai.walk*(S.ph>1?1.15:1);
  if(L>ai.pref+1.2){sp=L>ai.pref+7?ai.run:ws;ux=v.x/L;uz=v.z/L}else if(L<2.2){sp=ws*.6;ux=-v.x/L;uz=-v.z/L}
  else{S.sdT=(S.sdT||0)-dt;if(S.sdT<=0){S.sdT=1.8+Math.random()*2.2;S.sd=Math.random()<.5?-1:1}sp=ws*ai.strafe;ux=-v.z/L*(S.sd||1);uz=v.x/L*(S.sd||1)}
  const A=QS165A,rx=m.position.x-A.cx,rz=m.position.z-A.cz,rl=Math.hypot(rx,rz)||.01;if(rl>A.r-2.5){const nx=rx/rl,nz=rz/rl,out=ux*nx+uz*nz;if(out>0){ux-=nx*out;uz-=nz*out}}
  if(sp>0&&Math.abs(da)<1.5){m.position.x+=ux*sp*dt;m.position.z+=uz*sp*dt}else sp=0;S.walkSp=sp}
// the fight is over when every hero is down or gone from the yard (co-op: 3275 overrides these)
function qs165End(){if(typeof qs180End=='function')return qs180End();return hero.hp<=0||!qs165Here()||(typeof AWD!='undefined'&&AWD.dead)}
// solo defaults (3275 replaces them for co-op)
function qs180Auth(){return true}
function qs180Glide(e,dt){}
// no recall, no mount, no leaving once he has risen
function qs165Held(){return !!(QS165.form||QS165A&&QS165A.f)&&qs165Here()}
{const f=doRecall;doRecall=function(){if(qs165Held())return say('🏜️ The wall of sand holds you in the yard. There is no escape: kill it, or die.');return f.apply(this,arguments)}}
{const f=toggleMount;toggleMount=function(){if(qs165Held()&&!riding)return say('🏜️ No mount will come through the sandstorm.');return f.apply(this,arguments)}}
// the yard tick: wake him when the dig is done and a hero is in the yard; hold everyone in during the formation
function qs165Tick(dt,now){const here=qs165Here(),t=now/1000;
  if(here&&SD165.g&&SS165.c1.st===2&&!ss165Done(1)&&!QS165.form&&!qs165Alive()&&hero.hp>0){const A=qs165Arena(),p=pl.position;
    QS165.wk=(QS165.wk||0)+dt;if(Math.hypot(p.x-A.cx,p.z-A.cz)<A.r0+3&&QS165.wk>2.2&&qs180Auth()){QS165.wk=0;qs165Form();if(typeof qs180Formed=='function')qs180Formed()}}else QS165.wk=0;
  if(QS165.form){if(!here||hero.hp<=0){qs165Reset(false)}else{qs165FormTick(dt);const A=QS165A,p=pl.position,hx=p.x-A.cx,hz=p.z-A.cz,hd=Math.hypot(hx,hz);if(hd>A.hr){p.x=A.cx+hx/hd*A.hr;p.z=A.cz+hz/hd*A.hr}}}
  if(QS165A&&!QS165.form&&!qs165Alive()&&QS165A.f)qs165Reset(false);
  if(!here&&QS165.e&&!QS165.e.dead&&!(QS165A&&QS165A.f))qs165Reset(false);
  qs165WallTick(dt,t);qs165StormTick(dt,t);qs165DevTick(dt,now);qs165HeartTick(dt,now)}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{qs165Tick(dt,now)}catch(err){if(!QS165.err++)console.warn('v165 fight tick',err)}return r}}
// a save made during the fight loads before it (he will rise again); a save made after the kill keeps the doors open
SS165L.push(()=>{if(QS165.e||QS165.form)qs165Reset(false)});
