// ================= v31: Sovereign boss arenas — boss-driven progression =================
const ARENA_R=14,COVER_R=6.3,COVER_HIT=1.05;
// powers are permanent; unlocks gate recipes, materials and stations; guardians (odd index) open the next zone's gate
const BOSSX=[
 {i:'🐺',col:0x9ab0c8,mv:[['charge','slam','rain'],['adds'],['wave']],ult:0,pw:{n:"Hunter's Stride",i:'🐾',s:{mspd:.08},d:'+8% move speed'},un:['d:alchemy','m:brick','m:mossy']},
 {i:'🐸',col:0x6aae4a,mv:[['slam','rain','charge'],['mines','adds'],['wave']],ult:3,pw:{n:'Bog Hide',i:'🟢',s:{hpP:.1},d:'+10% max health'},un:['f_stew','f_skewer','fert','m:clay','m:plaster','m:tile']},
 {i:'🐢',col:0xc8a070,mv:[['slam','charge','cross'],['wave'],['mines']],ult:2,pw:{n:'Stoneblood',i:'🪨',s:{pdP:.12},d:'+12% physical defense'},un:['e_might','e_stone','f_tart','f_cake','m:iron','m:glass']},
 {i:'🍄',col:0xb050e0,mv:[['rain','mines','slam'],['adds','cross'],['beam']],ult:2,pw:{n:'Spore Vigor',i:'🍄',s:{regen:.003},d:'Regenerate 0.3% health per second in combat'},un:['c_kin','e_swift','f_pie']},
 {i:'🕷️',col:0x8a1a3a,mv:[['charge','rain','adds'],['mines','beam'],['cross']],ult:2,pw:{n:'Venom Fangs',i:'🩸',s:{ls:.03},d:'+3% lifesteal'},un:['c_asc','e_fort','m:bone']},
 {i:'🐉',col:0xff5a2a,mv:[['beam','rain','charge'],['cross','wave'],['mines']],ult:2,pw:{n:'Ember Soul',i:'🔥',s:{paP:.08,maP:.08},d:'+8% physical and magical attack'},un:['c_bind','f_feast']},
 {i:'💀',col:0x9affc8,mv:[['cross','slam','adds'],['beam','wave'],['mines']],ult:2,pw:{n:'Grave Will',i:'💨',s:{dash:1},d:'+1 dash charge'},un:['c_ess','m:crystal']},
 {i:'👻',col:0x9ad8ff,mv:[['wave','rain','beam'],['cross','mines'],['adds']],ult:2,pw:{n:'Lumen Ward',i:'✨',s:{mdP:.12,cdr:.06},d:'+12% magical defense, +6% cooldown reduction'},un:[]},
 {i:'🦅',col:0x7ac8ff,mv:[['charge','cross','rain'],['beam','wave'],['mines']],ult:2,pw:{n:'Storm Call',i:'⚡',s:{as:.1},d:'+10% attack speed'},un:[]},
 {i:'🐍',col:0xffd24a,mv:[['beam','charge','slam'],['wave','cross','mines'],['rain','adds']],ult:2,pw:{n:'Wyrmheart',i:'👑',s:{paP:.12,maP:.12,hpP:.08},d:'+12% attack, +8% max health'},un:[]}
];
BOSSES.forEach((b,i)=>Object.assign(b,BOSSX[i],{zone:(i>>1)+1,guard:i%2==1}));
const bossDone=new Set();
const LOCK={};BOSSES.forEach((b,i)=>b.un.forEach(k=>LOCK[k]=i));
const locked=k=>LOCK[k]!=null&&!bossDone.has(LOCK[k]);
const lockBy=k=>BOSSES[LOCK[k]].name;
const unName=k=>k.startsWith('m:')?BLK[BIDX[k.slice(2)]].n+' building material':k.startsWith('d:')?ITEMS[k].n:SUP[k]?SUP[k].n+' recipe':k;
const upCap=()=>2+Math.min(8,[...bossDone].filter(i=>i<8).length);
// ---------- arena dressing: rune floor that hugs the terrain, columns, seal wall, cover shadows ----------
const ARN=BOSSES.map((b,i)=>{
  const A={i,b,cx:b.x,cz:b.y,f:false,fx:[],g:new THREE.Group()},g=A.g;scene.add(g);
  const cv=document.createElement('canvas');cv.width=cv.height=512;const c2=cv.getContext('2d'),hex='#'+b.col.toString(16).padStart(6,'0');
  c2.fillStyle='#3a342c';c2.fillRect(0,0,512,512);for(let k=0;k<900;k++){c2.fillStyle=`rgba(${20+Math.random()*40|0},${18+Math.random()*30|0},${14+Math.random()*24|0},.35)`;c2.fillRect(Math.random()*512,Math.random()*512,4+Math.random()*14,3+Math.random()*8)}
  c2.strokeStyle='rgba(0,0,0,.35)';c2.lineWidth=2;for(let r=40;r<256;r+=36){c2.beginPath();c2.arc(256,256,r,0,6.283);c2.stroke()}for(let k=0;k<16;k++){const a=k/16*6.283;c2.beginPath();c2.moveTo(256+Math.cos(a)*40,256+Math.sin(a)*40);c2.lineTo(256+Math.cos(a)*250,256+Math.sin(a)*250);c2.stroke()}
  c2.strokeStyle=hex;c2.globalAlpha=.75;c2.lineWidth=5;c2.beginPath();c2.arc(256,256,236,0,6.283);c2.stroke();c2.beginPath();c2.arc(256,256,64,0,6.283);c2.stroke();
  c2.font='bold 26px serif';c2.fillStyle=hex;c2.textAlign='center';c2.textBaseline='middle';for(let k=0;k<24;k++){const a=k/24*6.283;c2.save();c2.translate(256+Math.cos(a)*212,256+Math.sin(a)*212);c2.rotate(a+1.57);c2.fillText('ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃ'[k%12],0,0);c2.restore()}
  const tex=new THREE.CanvasTexture(cv),N=40,geo=new THREE.PlaneGeometry(ARENA_R*2+1,ARENA_R*2+1,N,N);geo.rotateX(-Math.PI/2);
  const P=geo.attributes.position;for(let k=0;k<P.count;k++){const x=P.getX(k)+A.cx,z=P.getZ(k)+A.cz;P.setXYZ(k,x,GH(x,z)+.07,z)}geo.computeVertexNormals();
  const fl=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex,roughness:.95,transparent:true,alphaMap:(()=>{const a=document.createElement('canvas');a.width=a.height=128;const q=a.getContext('2d'),gr=q.createRadialGradient(64,64,52,64,64,64);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#000');q.fillStyle=gr;q.fillRect(0,0,128,128);return new THREE.CanvasTexture(a)})(),polygonOffset:true,polygonOffsetFactor:-2}));fl.receiveShadow=true;g.add(fl);
  const stone=sm(0x8a8478),dark=sm(0x5a554c),rune=new THREE.MeshBasicMaterial({color:b.col});
  A.cov=[];A.cols=[];
  // braziers flanking the four entrances
  for(let k=0;k<4;k++){const a=k*Math.PI/2;[-1,1].forEach(s=>{const aa=a+s*.2,x=A.cx+Math.cos(aa)*(ARENA_R+.8),z=A.cz+Math.sin(aa)*(ARENA_R+.8),y=GH(x,z);TQ(g,G_CYL,dark,x,y+.5,z,.3,1,.3);const f=TQ(g,G_CONE,new THREE.MeshBasicMaterial({color:b.col}),x,y+1.3,z,.28,.6,.28);f.castShadow=false;A.fx0=(A.fx0||[]).concat([f])})}
  // the seal: a glowing wall that appears when the fight starts
  const bw=new THREE.Mesh(new THREE.CylinderGeometry(ARENA_R+.2,ARENA_R+.2,5,72,1,true),new THREE.MeshBasicMaterial({color:b.col,transparent:true,opacity:.0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  bw.position.set(A.cx,GH(A.cx,A.cz)+2,A.cz);bw.visible=false;g.add(bw);A.wall=bw;
  // shadows behind cover pillars, shown during the Cataclysm
  A.wedges=[];A.safe=[];
  TANIM.push({x:A.cx,z:A.cz,f:now=>{(A.fx0||[]).forEach((f,q)=>f.scale.y=.6*(1+.2*Math.sin(now/90+q)))}});
  return A;
});
ARN.forEach(A=>A.cov.concat(A.cols).forEach(([x,z])=>{if(MAP[z])MAP[z][x]='r'}));
const arenaOf=e=>e&&e.ar!=null?ARN[e.ar]:null;
let AF=null; // the arena fight in progress
// ---------- bosses ----------
function spawnBoss(i){
  const d=BOSSES[i],key='boss'+i;
  EN[key]={n:d.name,e:d.i,rig:d.sp,col:d.col,w:{hp:.8,pa:1,ma:1,pd:1.05,md:1.05},mt:FAMD[famOf(d.sp)].mt,moves:[],fam:famOf(d.sp)};S[key]=S[key]||{e:d.i,c:d.col};MSET[key]=[];
  const c=enemyC(key,d.lvl,{boss:1});c.n=d.name;const m=cr(c);m.bs*=3;m.scale.setScalar(m.bs);m.position.set(d.x,0,d.y);
  const r=new THREE.Mesh(new THREE.RingGeometry(.9,1.1,32),addMat(d.col));r.rotation.x=-Math.PI/2;r.position.y=.06;m.add(r);scene.add(m);
  const hb=bar(true);hb.scale.setScalar(3);
  const e={c,m,hb,boss:1,bi:i,ar:i,tier:4,home:[d.x,d.y],cd:1,ch:0,vx:0,vz:0,agg:0,bs:{t:2,lock:0,ph:1,last:'',ult:12},wx:d.x,wz:d.y,wt:0,dots:[]};enemies.push(e);return e;
}
const bossEnt=i=>enemies.find(e=>e.ar===i&&!e.dead);
function inLine(p,o,d,l,w){const vx=p.x-o.x,vz=p.z-o.z,a=vx*d.x+vz*d.z,c=Math.abs(vx*d.z-vz*d.x);return a>-.4&&a<l&&c<w/2}
function hiddenFrom(A,p){return (A.safe||[]).some(([x,z])=>Math.hypot(p.x-x,p.z-z)<2.5)}
const BMV={
  slam(e,A,en){const o=e.m.position.clone();tele(o,4.6,1.1*en,()=>{if(!A.f)return;ring(o,e.c.col||A.b.col,9,400);burst(gY(o,.3),A.b.col,50,6,3,.8);shake(.25);if(d2(pl.position,o)<4.8)bossHit(e,1.4)});return {d:1.5*en,lock:1}},
  charge(e,A,en){const d=V().subVectors(pl.position,e.m.position).setY(0).normalize();tele(e.m.position,0,.85*en,()=>{if(A.f)e.bs.dash={x:d.x,z:d.z,t:.65,h:0}},{w:2.6,l:9,d});return {d:1.8*en,lock:1}},
  rain(e,A,en){let n=0;const N=e.bs.ph>=3?7:5,f=()=>{if(n++>=N||e.dead||!A.f)return;const q=pl.position.clone().add(V((Math.random()-.5)*3,0,(Math.random()-.5)*3));
      tele(q,2.1,.9*en,()=>{if(!A.f)return;ring(q,A.b.col,5,350);burst(gY(q,.3),A.b.col,24,4,3,.6);if(d2(pl.position,q)<2.2)bossHit(e,1)});setTimeout(f,420*en)};f();return {d:(N*.42+1)*en,lock:0}},
  cross(e,A,en){const o=e.m.position.clone(),a0=Math.random()<.5?0:Math.PI/4;let hit=false;
    for(let k=0;k<4;k++){const a=a0+k*Math.PI/2,d=V(Math.sin(a),0,Math.cos(a));tele(o,0,1.25*en,()=>{if(!A.f)return;for(let s=1;s<14;s+=1.5)burst(gY(o.clone().addScaledVector(d,s),.3),A.b.col,3,1,2,.4);if(!hit&&inLine(pl.position,o,d,14,2.6)&&hero.iv<=0){hit=true;bossHit(e,1.3)}},{w:2.6,l:14,d})}
    if(e.bs.ph>=3)setTimeout(()=>{if(!A.f||e.dead)return;const o2=e.m.position.clone();let h2=false;for(let k=0;k<4;k++){const a=a0+Math.PI/4+k*Math.PI/2,d=V(Math.sin(a),0,Math.cos(a));tele(o2,0,1.1*en,()=>{if(!A.f)return;if(!h2&&inLine(pl.position,o2,d,14,2.6)&&hero.iv<=0){h2=true;bossHit(e,1.3)}},{w:2.6,l:14,d})}},900*en);
    return {d:(e.bs.ph>=3?2.6:1.7)*en,lock:1}},
  wave(e,A,en){const o=e.m.position.clone();tele(o,1.6,.8*en,()=>{if(!A.f)return;const ms=new THREE.Mesh(new THREE.RingGeometry(.86,1,64),new THREE.MeshBasicMaterial({color:A.b.col,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));ms.rotation.x=-Math.PI/2;ms.position.copy(gY(o,.25));scene.add(ms);
      A.fx.push({k:'wave',o,r:1,sp:7.5,ms,hit:false,e})});say('⚠ Shockwave! Dash through it.');return {d:1.6*en,lock:1}},
  beam(e,A,en){const o=e.m.position.clone(),a0=Math.atan2(pl.position.x-o.x,pl.position.z-o.z)+(Math.random()<.5?1:-1)*.9,dir=a0>Math.atan2(pl.position.x-o.x,pl.position.z-o.z)?-1:1;
      const g=new THREE.Group(),ms=new THREE.Mesh(new THREE.PlaneGeometry(1.8,15),new THREE.MeshBasicMaterial({color:A.b.col,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));ms.rotation.x=-Math.PI/2;ms.position.set(0,.3,7.5);g.add(ms);g.position.copy(gY(o,0));g.rotation.y=a0;scene.add(g);
      A.fx.push({k:'beam',o,a:a0,va:dir*Math.PI/2.4/en,warm:1*en,t:2.8*en,tick:0,g,ms,e});say('⚠ '+A.b.name+' sweeps a beam. Dash through or stay ahead of it.');return {d:3.9*en,lock:1}},
  mines(e,A,en){const N=6+e.bs.ph*2;for(let k=0;k<N;k++){const a=Math.random()*6.283,r=2+Math.random()*(ARENA_R-3.5),q=V(A.cx+Math.cos(a)*r,0,A.cz+Math.sin(a)*r);tele(q,1.9,(1.5+k*.12)*en,()=>{if(!A.f)return;ring(q,A.b.col,4,300);burst(gY(q,.3),A.b.col,20,3,3,.5);if(d2(pl.position,q)<2)bossHit(e,1.1)})}
      const q0=pl.position.clone();tele(q0,1.9,1.4*en,()=>{if(A.f&&d2(pl.position,q0)<2)bossHit(e,1.1)});return {d:1.2*en,lock:0}},
  adds(e,A,en){const live=enemies.filter(x=>x.minion&&!x.dead&&d2(x.m.position,V(A.cx,0,A.cz))<ARENA_R).length;if(live>=5)return BMV.slam(e,A,en);say(A.b.name+' calls its brood!');
    for(let k=0;k<3;k++){const a=Math.random()*6.283,x=A.cx+Math.cos(a)*(ARENA_R-3),z=A.cz+Math.sin(a)*(ARENA_R-3);if(!solid(x,z)){const n=spawnEnemy((BIOEN[BIOMES[MAP.bio[Math.round(z)][Math.round(x)]].n]||['hobgoblin'])[0],x,z,Math.max(1,e.c.l-3),{minion:1,agg:1});burst(gY(n.m.position,.5),A.b.col,20,2,2,.5)}}
    return {d:1.2*en,lock:1}},
  ult(e,A,en){const o=V(A.cx,0,A.cz);e.m.position.set(A.cx,0,A.cz);burst(gY(o,1),A.b.col,60,4,4,.8);ring(o,A.b.col,6,500);
    banner('⚠ CATACLYSM','Get into a glowing blue safe circle!','');A.wedges.forEach(w=>{if(w.parent)w.parent.remove(w)});A.safe=[];A.wedges=[];
    const a0=Math.random()*6.283;for(let k=0;k<3;k++){const a=a0+k*2.094+(Math.random()-.5)*.6,r=5+Math.random()*6,x=A.cx+Math.cos(a)*r,z=A.cz+Math.sin(a)*r;A.safe.push([x,z]);
      const rg=new THREE.CircleGeometry(2.3,32);rg.rotateX(-Math.PI/2);const w=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({color:0x6ad0ff,transparent:true,opacity:.55,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
      w.position.set(x,GH(x,z)+.15,z);w.renderOrder=5;A.g.add(w);A.wedges.push(w)}
    tele(o,ARENA_R,3.6*Math.max(.8,en),()=>{A.wedges.forEach(w=>{if(w.parent)w.parent.remove(w)});A.wedges=[];const sf=A.safe;if(!A.f){A.safe=[];return}shake(.5);for(let k=0;k<40;k++){const a=Math.random()*6.283,r=Math.random()*ARENA_R;burst(gY(V(A.cx+Math.cos(a)*r,0,A.cz+Math.sin(a)*r),.5),A.b.col,3,2,4,.6)}
      if(hiddenFrom(A,pl.position)){dn(pl.position,'Sheltered!','#9ae8ff',-20,1200)}else{const d=Math.round(heroMax()*.65);hero.hp-=d;hero.lastHit=performance.now();heroFlinch();dn(pl.position,d,'#ff3a2a');if(hero.hp<=0)down()}
      fols.forEach((f,q)=>{const c=party[q];if(f&&c&&!c.emp&&c.h>0&&!hiddenFrom(A,f.position))c.h=Math.max(1,Math.round(c.h*.35))});A.safe=[]});
    return {d:4.4*en,lock:1}}
};
function bossAI(e,dt,now,tg,L,v){
  const A=arenaOf(e),m=e.m,b=e.bs;
  if(!A){animC(m,now,false,0);return}
  if(!A.f){ // idle on its throne, healing back up
    e.agg=0;e.c.h=Math.min(M(e.c),e.c.h+M(e.c)*dt*.2);const hx=A.cx-m.position.x,hz=A.cz-m.position.z,hl=Math.hypot(hx,hz);if(hl>.6)walkM(m,hx/hl*2*dt,hz/hl*2*dt);
    animC(m,now,hl>.6,1.5);return}
  e.agg=1;tg=pl;v=V().subVectors(pl.position,m.position).setY(0);L=v.length();
  const hpr=e.c.h/M(e.c),ph=hpr>.7?1:hpr>.4?2:3;
  if(ph>b.ph){b.ph=ph;banner(ph==2?'PHASE II':'PHASE III',A.b.name+(ph==3?' is enraged!':' grows stronger'),'');ring(m.position,A.b.col,8,600);burst(gY(m.position,1.2),A.b.col,80,5,4,1);shake(.3);b.t=Math.min(b.t,1.2);if(ph==3)e.enr=1}
  const en=1.28*Math.max(.82,(1-.015*A.i)*(ph==3?.88:ph==2?.94:1));
  b.lock=Math.max(0,b.lock-dt);b.t-=dt;
  let ux=0,uz=0;
  if(!b.lock&&!b.dash&&L>3.2){ux=v.x/L;uz=v.z/L}
  const sp=ux||uz?(ph==3?2.1:1.5):0;
  if(!b.dash&&L>.01&&!(b.lock&&b.face))m.rotation.y=Math.atan2(v.x,v.z);
  walkM(m,(ux*sp+e.vx)*dt,(uz*sp+e.vz)*dt);e.vx*=.85;e.vz*=.85;
  if(b.dash){walkM(m,b.dash.x*dt*12,b.dash.z*dt*12);b.dash.t-=dt;if(!b.dash.h&&d2(pl.position,m.position)<2.4){b.dash.h=1;bossHit(e,1.6)}if(b.dash.t<=0)b.dash=null}
  const cdx=m.position.x-A.cx,cdz=m.position.z-A.cz,cl=Math.hypot(cdx,cdz);if(cl>ARENA_R-1.5){m.position.x=A.cx+cdx/cl*(ARENA_R-1.5);m.position.z=A.cz+cdz/cl*(ARENA_R-1.5);if(b.dash)b.dash=null}
  if(A.b.ult&&ph>=A.b.ult){b.ult-=dt;if(b.ult<=0&&!b.lock&&!b.dash){b.ult=ph==3?20:26;const r=BMV.ult(e,A,en);b.lock=r.d;b.t=r.d+.8;b.last='ult';animC(m,now,false,0);return}}
  if(b.t<=0&&!b.lock&&!b.dash){
    let pool=[];for(let q=0;q<ph;q++)pool=pool.concat(A.b.mv[q]||[]);
    if(L>9){const f2=pool.filter(x=>x!='slam');if(f2.length)pool=f2}if(L<4&&pool.includes('slam'))pool.push('slam');
    const c2=pool.filter(x=>x!=b.last),k=(c2.length?c2:pool)[Math.random()*(c2.length?c2.length:pool.length)|0]||'slam';
    const r=BMV[k](e,A,en);b.last=k;b.lock=r.lock?r.d:0;b.t=r.d+(ph==3?.7:1.1)*en;if(k=='slam')lunge(m,pl.position);
  }
  animC(m,now,sp>0||!!b.dash,sp+(b.dash?6:0));
}
// ---------- arena flow: enter → seal → fight → win or wipe ----------
function arenaStart(A,e){
  AF=A;A.f=true;e.bs=Object.assign(e.bs,{t:2.2,lock:0,ph:1,last:'',ult:A.b.ult==2?14:10,dash:null});e.enr=0;
  A.wall.visible=true;tw(600,k=>A.wall.material.opacity=.32*k);
  banner(A.b.i+' '+A.b.name.toUpperCase(),A.b.title+' · Lv '+A.b.lvl,'The arena is sealed. Win, or fall.');shake(.3);
  if(riding)dismount();setTarget(e);
}
function arenaClear(A){
  A.f=false;if(AF===A)AF=null;A.wedges.forEach(w=>w.visible=false);
  A.fx.forEach(f=>{if(f.ms&&f.ms.parent)f.ms.parent.remove(f.ms);if(f.g)scene.remove(f.g)});A.fx.length=0;
  tw(600,k=>A.wall.material.opacity=.32*(1-k),()=>{if(!A.f)A.wall.visible=false});
  enemies.slice().forEach(x=>{if(x.minion&&d2(x.m.position,V(A.cx,0,A.cz))<ARENA_R+3)removeE(x)});
}
function arenaFail(){
  if(!AF)return;const A=AF,e=bossEnt(A.i);arenaClear(A);
  if(e){e.c.h=M(e.c);e.bs.dash=null;e.enr=0;e.m.position.set(A.cx,0,A.cz);e.agg=0}
  setTimeout(()=>say('☠ '+A.b.name+' is victorious. It waits on its throne for your return.'),900);
}
function bossDefeated(e){
  const A=arenaOf(e);if(!A)return;arenaClear(A);const i=A.i,first=!bossDone.has(i);
  if(!first){banner('👑 '+A.b.name+' falls again','Its loot is yours','Sovereigns return after 5 minutes');return}
  bossDone.add(i);const P=A.b.pw;hero.buffs.push({s:P.s,t:Infinity,n:P.n,i:P.i,d:P.d,perm:1});hsDirty();
  banner('👑 SOVEREIGN SLAIN',A.b.name,'Power gained: '+P.i+' '+P.n+' ('+P.d+')');
  const ul=A.b.un.map(unName);
  setTimeout(()=>{if(ul.length)say('🔓 Unlocked: '+ul.join(', ')+'.');say('⚒️ Forge mastery: gear can now be upgraded to +'+upCap()+'.');
    if(A.b.guard&&A.b.zone<5){openGate(A.b.zone);banner('🔓 THE WAY IS OPEN',TOWNS[A.b.zone].n+"'s eastern gate is unsealed",ZN[A.b.zone]+' awaits')}
    if(i==9)banner('🏆 THE ASHEN WILDS ARE YOURS','Every Sovereign has fallen','Thank you for playing!')},2600);
  setTimeout(()=>{if(!uiOpen())openX('bosses')},5200);
}
function kill(e){if(e.ar!=null)bossDefeated(e);bountyOnKill(e);if(typeof campOnKill=='function')campOnKill(e);return kill_base(e)}
// ---------- zone gates: each town's eastern gate stays sealed until the zone guardian falls ----------
TOWNS.forEach((T,k)=>{if(k==0)return;
  const g=new THREE.Group();g.position.set(TS,0,0);T.g.add(g);T.gate=g;const gb=BOSSES[2*k-1];
  for(let z=-1.6;z<=1.61;z+=.4)TQ(g,G_BOX,sm(0x2a2a30,{metalness:.6,roughness:.4}),0,1.4,z,.12,2.8,.12);TQ(g,G_BOX,sm(0x2a2a30),0,2.85,0,.3,.3,3.6);[.7,1.6,2.4].forEach(y=>TQ(g,G_BOX,sm(0x3a3a40),0,y,0,.1,.1,3.4));
  const pm2=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.7),new THREE.MeshBasicMaterial({color:gb.col,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));pm2.rotation.y=Math.PI/2;pm2.position.y=1.4;g.add(pm2);
  sign(g,[{t:'SEALED',f:'700 46px'},{t:'Defeat '+gb.name,f:'600 22px'}],2.2,.6,'#1c1236','#ffd8d8','#c84a4a',-.3,3.4,0,-Math.PI/2,512,140);
  T.col.push({x:T.cx+TS,z:T.cy,hx:.7,hz:1.9,lock:k});
  TANIM.push({x:T.cx+TS,z:T.cy,f:now=>{pm2.material.opacity=.25+.12*Math.sin(now/300)}});
});
function openGate(k){const T=TOWNS[k];if(!T||!T.gate)return;T.col=T.col.filter(c=>c.lock!=k);const g=T.gate;T.gate=null;tw(1200,q=>g.position.y=-3*q,()=>T.g.remove(g))}
const gateLocked=k=>k>0&&k<5&&!bossDone.has(2*k-1);
function gatePrompt(T){if(!T||!gateLocked(T.i))return null;if(Math.hypot(pl.position.x-(T.cx+TS-1),pl.position.z-T.cy)>3)return null;return {label:'🔒 Sealed · defeat '+BOSSES[2*T.i-1].name,fn:()=>openX('bosses')}}
// ---------- per-frame: start fights, keep you inside, move shockwaves and beams ----------
let bHint=0;
function arenaTick(dt,now){
  if(!party.length||inRealm)return;
  if(!bHint&&now>15000){bHint=1;say('👑 Sovereign bosses rule each zone. Beat them for permanent powers, new recipes and the keys to the next zone. Press J to see them.')}
  if(inDun)return;if(!AF){for(const A of ARN){const dd=Math.hypot(pl.position.x-A.cx,pl.position.z-A.cz);if(dd<ARENA_R-1.5){const e=bossEnt(A.i);if(e){arenaStart(A,e);break}}}return}
  const A=AF,e=bossEnt(A.i);if(!e){arenaClear(A);return}
  const dx=pl.position.x-A.cx,dz=pl.position.z-A.cz,dd=Math.hypot(dx,dz);if(dd>ARENA_R-.8){pl.position.x=A.cx+dx/dd*(ARENA_R-.8);pl.position.z=A.cz+dz/dd*(ARENA_R-.8)}
  A.wall.rotation.y+=dt*.2;
  for(let q=A.fx.length-1;q>=0;q--){const f=A.fx[q];
    if(f.k=='wave'){f.r+=f.sp*dt;f.ms.scale.setScalar(f.r);f.ms.material.opacity=.75*(1-f.r/ARENA_R*.5);const d=d2(pl.position,f.o);if(!f.hit&&Math.abs(d-f.r)<.75&&hero.iv<=0){f.hit=true;bossHit(f.e,1.2)}if(f.r>ARENA_R){scene.remove(f.ms);A.fx.splice(q,1)}}
    else if(f.k=='beam'){if(f.warm>0){f.warm-=dt;f.ms.material.opacity=.15+.1*Math.sin(now/60);continue}f.ms.material.opacity=.7;f.a+=f.va*dt;f.g.rotation.y=f.a;f.t-=dt;f.tick-=dt;
      const d=V(Math.sin(f.a),0,Math.cos(f.a));if(f.tick<=0&&inLine(pl.position,f.o,d,15,1.9)&&hero.iv<=0){f.tick=.3;bossHit(f.e,.55)}
      if(Math.random()<.5)burst(gY(f.o.clone().addScaledVector(d,2+Math.random()*12),.4),A.b.col,2,.5,1.5,.3);if(f.t<=0){scene.remove(f.g);A.fx.splice(q,1)}}
  }
}
// ---------- hooks ----------
function doUpgrade(it){if((it.up||0)>=upCap())return say('🔒 Your forge mastery only reaches +'+upCap()+'. Defeat Sovereign bosses (J) to raise it.');return doUpgrade_base(it)}
function doRecall(){if(AF)return say('The arena is sealed. There is no escape.');if(inDun)return say('Find the exit portal to leave the dungeon.');return doRecall_base()}
function spawn(init){const n=enemies.length;spawn_base(init);if(enemies.length>n){const e=enemies[enemies.length-1];if(ARN.some(A=>d2(e.m.position,V(A.cx,0,A.cz))<ARENA_R+5))removeE(e)}}
function bossHudX(){
  const e=AF&&bossEnt(AF.i);document.body.classList.toggle('bossf',!!e);if(!e)return;$('boss').classList.remove('hide');$('bossN').textContent=AF.b.i+' '+e.c.n+' · Lv '+e.c.l+' · Phase '+['I','II','III'][e.bs.ph-1];$('bossB').style.width=Math.max(0,100*e.c.h/M(e.c))+'%';
}
// ---------- Sovereigns window (J) ----------
XR.bosses=()=>{
  $('xwT').textContent='👑 Sovereigns';$('xwS').textContent=bossDone.size+' / 10 defeated · Forge mastery +'+upCap();
  $('xwB').innerHTML='<div class="rows">'+BOSSES.map((b,i)=>{const d=bossDone.has(i),reach=b.zone==1||bossDone.has(2*(b.zone-1)-1),nx=!d&&reach;
    return `<div class="rw" style="--rc:${d?'#6ee7b7':nx?'#c9a24a':'transparent'};${reach||d?'':'opacity:.55'}"><span class="rn">${b.i} <b>${b.name}</b> <span class="mut">${b.title}</span>
      <small>${ZN[b.zone-1]} · Lv ${b.lvl}${b.guard?' · <b style="color:#f0cc72">Zone guardian: opens '+(b.zone<5?ZN[b.zone]:'the end')+'</b>':''} · Power: ${b.pw.i} ${b.pw.n} (${b.pw.d})${b.un.length?'<br>Unlocks: '+b.un.map(unName).join(', '):''}${i<8?' · Forge +1':''}</small></span>
      <span class="ra">${d?'<em style="color:#6ee7b7">✔ Defeated</em>':nx?'<em style="color:var(--acc)">◆ Ready</em>':'<small>🔒 Zone sealed</small>'}</span></div>`}).join('')+'</div>';
  $('xwF').innerHTML='<span class="mut dtl">Arenas are marked ◆ on the world map (N). Watch the red ground warnings, dash through shockwaves and beams, and when the Cataclysm comes, get into a glowing blue safe circle.</span>';
};
function openBosses(){if(!$('xw').classList.contains('hide')&&xwMode=='bosses')return closeX();if(uiOpen()&&$('xw').classList.contains('hide'))return;openX('bosses')}
$('bossBtn').onclick=()=>openBosses();

// ---------- telegraphs: drape over the ground and always draw on top so walls/terrain never hide them ----------
function tele(pos,r,delay,fn,line){
  const mk=(c,op)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false,depthTest:false,side:THREE.DoubleSide});
  const geo=()=>line?new THREE.PlaneGeometry(line.w,line.l,3,Math.max(4,Math.round(line.l))):new THREE.RingGeometry(.001,1,Math.max(24,Math.round(r*10)),Math.max(3,Math.round(r*1.5)));
  const go=geo(),gf=geo(),base=go.attributes.position.array.slice(),ox=pos.x,oz=pos.z;
  let ca=1,sa=0;if(line){const a=Math.atan2(-line.d.x,-line.d.z);ca=Math.cos(a);sa=Math.sin(a)}
  // local (u,v) on the plane -> world x,z ; circles scale by radius
  const drape=(g,k)=>{const P=g.attributes.position;for(let i=0;i<P.count;i++){let u=base[i*3],v=base[i*3+1];
      if(line){const lz=-(v)-line.l/2;u=u;const wx=ox+u*ca+lz*sa,wz=oz-u*sa+lz*ca;P.setXYZ(i,wx,GH(wx,wz)+.14,wz)}
      else{const wx=ox+u*r*k,wz=oz-v*r*k;P.setXYZ(i,wx,GH(wx,wz)+.14,wz)}}P.needsUpdate=true;g.computeBoundingSphere()};
  drape(go,1);drape(gf,line?1:.15);
  const o=new THREE.Mesh(go,mk(0xd01808,.22)),f=new THREE.Mesh(gf,mk(0xff3010,.12)),edge=line?null:new THREE.Mesh(new THREE.RingGeometry(.93,1,Math.max(24,Math.round(r*10)),1),mk(0xff2a10,.85));
  o.renderOrder=f.renderOrder=20;o.frustumCulled=f.frustumCulled=false;scene.add(o,f);
  if(edge){const P=edge.geometry.attributes.position,b2=P.array.slice();for(let i=0;i<P.count;i++){const wx=ox+b2[i*3]*r,wz=oz-b2[i*3+1]*r;P.setXYZ(i,wx,GH(wx,wz)+.15,wz)}edge.renderOrder=21;edge.frustumCulled=false;scene.add(edge)}
  let last=-1;
  tw(delay*1000,k=>{f.material.opacity=.12+.33*k;if(!line){const q=Math.round((.15+.85*k)*20)/20;if(q!==last){last=q;drape(gf,q)}}},()=>{scene.remove(o,f);if(edge)scene.remove(edge);go.dispose();gf.dispose();if(edge)edge.geometry.dispose();fn()});
}
