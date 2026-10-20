// =============== 7/8/9. ENEMY ROLES, ELITE TRAITS, WEAK POINTS ===============
const ROLEK={shaman:'caster',cultist:'caster',wraith:'caster',orc:'guard',brigand:'guard',hollowknight:'guard',giant:'guard',tortoise:'guard',boghorror:'guard'};
const TRAITS=[['Vampiric','🩸','#f43f5e'],['Frenzied','💢','#fb923c'],['Shielded','🛡️','#93c5fd'],['Explosive','💥','#fbbf24'],['Blinking','🌀','#c084fc']];
function bubble(e){if(e.shM){e.shM.visible=true;return}const s=new THREE.Mesh(new THREE.SphereGeometry(.95,18,12),new THREE.MeshBasicMaterial({color:0x8ac8ff,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false}));s.position.y=.7;e.m.add(s);e.shM=s}
function marker(e,col,y){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.13,0),new THREE.MeshBasicMaterial({color:col}));m.position.y=y||2.1;e.m.add(m);return m}
function spawnEnemy(key,x,z,l,o){
  const e=spawnEnemy_base(key,x,z,l,o);if(!e)return e;o=o||{};
  const role=ROLEK[key];if(role){e.role=role;if(role=='caster')e.rmk=marker(e,0x7ab8ff,EN[key].hum?2.2:1.6);else{const r=new THREE.Mesh(new THREE.RingGeometry(4.2/e.m.bs,4.5/e.m.bs,40),new THREE.MeshBasicMaterial({color:0x93c5fd,transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.y=.06;r.visible=false;e.m.add(r);e.gR=r}}
  if(WEAKK[key])addWeak(e);
  if(o.al&&!o.minion)giveTrait(e);
  return e;
}
function giveTrait(e,k){const T=k?TRAITS.find(t=>t[0]==k):TRAITS[R(0,TRAITS.length-1)];e.trait=T[0];e.c.n=T[0]+' '+e.c.n;e.trT=T[0]=='Shielded'?9:0;if(T[0]=='Shielded'){e.sh=M(e.c)*.3;bubble(e)}}
function eTick(e,dt,now){
  if(dt>0&&!e.dead){
    if(e.el&&e.el.t<now){e.el=null;elRing(e,null)}
    e.frz=Math.max(0,(e.frz||0)-dt);
    if(e.gR)e.gR.visible=!!e.agg;
    if(e.trait&&e.agg){e.trT-=dt;
      if(e.trait=='Frenzied')e.cd-=dt*.7;
      else if(e.trait=='Shielded'&&e.trT<=0&&!(e.sh>0)){e.trT=9;e.sh=M(e.c)*.3;bubble(e);dn(e.m.position,'🛡 Shield','#93c5fd',-30,700)}
      else if(e.trait=='Blinking'&&e.trT<=0&&!e.atk&&d2(e.m.position,pl.position)>3.5){e.trT=7;const ry=pl.rotation.y,bx=pl.position.x-Math.sin(ry)*2,bz=pl.position.z-Math.cos(ry)*2;if(!solid(bx,bz)){burst(gY(e.m.position,.8),0xc084fc,24,2,2,.5);e.m.position.set(bx,0,bz);burst(gY(e.m.position,.8),0xc084fc,24,2,2,.5);sfx('zap',.6)}}}
    if(e.shM)e.shM.visible=e.sh>0;
    // casters shield their friends
    if(e.role=='caster'&&e.agg&&!e.atk){e.scT=(e.scT==null?R(2,4):e.scT)-dt;if(e.scT<=0){e.scT=7;let best=null,bh=2;enemies.forEach(o=>{if(o.dead||o===e||o.boss||d2(o.m.position,e.m.position)>9||o.sh>0)return;const hr=o.c.h/M(o.c);if(hr<bh){bh=hr;best=o}});
      if(best){best.sh=M(best.c)*.25;bubble(best);zapLine(e.m.position,best.m.position);burst(gY(e.m.position,1.6),0x7ab8ff,16,1,2,.5);dn(best.m.position,'🛡 Shielded','#93c5fd',-30,800)}}}
    // scouts run to raise the alarm
    if(e.scout&&e.agg&&!e.alarm){e.alarm={t:3.4};popT(e.m.position,'📯 SCOUT!','#fde047');say('📯 A scout is running to sound the alarm! Stop it before it reaches the horn.');sfx('chime')}
    if(e.alarm){e.alarm.t-=dt;const a=V().subVectors(e.m.position,pl.position).setY(0);if(a.lengthSq()<.01)a.set(1,0,0);a.normalize();walkM(e.m,a.x*3.6*dt,a.z*3.6*dt);e.m.rotation.y=Math.atan2(a.x,a.z);animC(e.m,now,true,3.6);
      if(e.alarm.t<=0){e.alarm=null;e.scout=0;if(e.smk)e.smk.visible=false;soundAlarm(e)}return true}
  }
  return eTick_base(e,dt,now);
}
function soundAlarm(e){
  sfx('horn');banner('📯 ALARM!','The '+(e.camp?e.camp.th.n:'camp')+' is roused','Reinforcements are coming');shake(.2);
  enemies.forEach(o=>{if(!o.dead&&d2(o.m.position,e.m.position)<24){o.agg=1;o.wt=0}});
  const C=e.camp;for(let i=0;i<2;i++){const a=Math.random()*6.283,x=e.m.position.x+Math.cos(a)*3,z=e.m.position.z+Math.sin(a)*3;if(solid(x,z))continue;const k=C?pickMem(C.th):e.c.en,b=BIOMES[MAP.bio[Math.round(z)][Math.round(x)]];const n=spawnEnemy(k,x,z,e.c.l,{zt:b.t,agg:1});n.agg=1;if(C)n.camp=C}
}
function makeScout(e){e.scout=1;e.smk=marker(e,0xfde047,EN[e.c.en]&&EN[e.c.en].hum?2.25:1.7);e.c.n='Scout '+e.c.n}

