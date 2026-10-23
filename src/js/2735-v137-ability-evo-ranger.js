// ================= v137 evolved abilities: Ranger (verdant green and sunlight, spirit beasts) =================
Object.assign(EVO137,{
 'Multishot':{en:'Hailstorm Volley',d:'Nine arrows instead of five.',mod:{n2:9}},
 'Piercing Arrow':{en:'Starpiercer',d:'Two more spectral arrows pierce lines fanned out to either side.',
  post(c){const C=evC(),P=c.P.clone(),ms=(typeof FXA_DRAW!='undefined'?FXA_DRAW.ms*FXA_DRAW.rel:380);setTimeout(()=>[-.22,.22].forEach(a=>{const d=evRot(c.d,a);ev137Lance(gY(P,1.1),gY(evAt(P,d,9),1.1),C.c1,.1,320);
   kqsLine(P,d,9,2.2).forEach(e=>{evHit(c,e,c.raw*.8);ev137Flare(gY(e.m.position,1),C.c2,.9,220)})}),ms)}},
 'Snare Trap':{en:"Hunter's Snarefield",d:'Drops three traps in a triangle instead of one.',
  post(c){const P=c.P,f=c.d;[-1,1].forEach(s=>{const q=kqsV(P.x+f.z*s*1.8-f.x*1.2,P.z-f.x*s*1.8-f.z*1.2);const mesh=new THREE.Mesh(new THREE.TorusGeometry(.45,.08,6,16),new THREE.MeshStandardMaterial({color:0x8a7a5a,metalness:.6,roughness:.4}));
   mesh.rotation.x=Math.PI/2;mesh.position.copy(gY(q,.06));scene.add(mesh);traps.push({p:q.clone(),t:20,raw:c.raw,root:c.sk.root,mesh});ev137Sigil(q,evC().c1,1,700,1)})}},
 'Rain of Arrows':{en:'Arrowstorm',d:'Arrows rain on a 50% wider area for 50% longer.',mod:{r:'*1.5',ticks:12},
  post(c){const p=(c.gp||aimPoint(10)).clone(),C=evC();ev137Sigil(p,C.c1,c.R,12*.35*1000+400,0);let ti=0;kqsObj({life:12*.35,tick:dt=>{ti-=dt;if(ti>0)return;ti=.12;const a=Math.random()*6.283,r=Math.sqrt(Math.random())*c.R,q=kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r);
   ev137Lance(gY(q,6),gY(q,0),Math.random()<.5?C.c1:C.c2,.04,180)}})}},
 'Explosive Arrow':{en:'Cluster Bomb',d:'Looses three bursting arrows in a spread instead of one.',mod:{n2:3}},
 'Hunter’s Focus':{en:'Eagle Eye',d:'+35% critical chance, +60% critical damage and +10% attack speed for 12s.',mod:{buff:{crit:.35,cdm:.6,as:.1},dur:12},
  post(c){const C=evC();ev137Orbit(pl.position,C.c1,1.1,1100);ev137Flare(gY(pl.position,1.7),C.c2,1.4,500)}},
 'Barrage':{en:'Thousand Arrows',d:'Fifteen arrows instead of nine, in an even wider fan.',mod:{n2:15}},
 'Disengage':{en:'Shadowstep Volley',d:'As you leap away you fire a fan of five arrows, and the enemies you leave are rooted for 1.2s.',
  post(c){const o=c.P.clone(),d=c.d,C=evC();[-.4,-.2,.2,.4].forEach(a=>launch(o,evRot(d,a),22,{col:c.sk.col,mt:'p',arrow:1},c.raw*.7,.65));kqsFoes(o,3.2).forEach(e=>eStatus(e,{root:1.2},0));ev137Shock(o,C.c1,3.2,420)}},
 'Call of the Wild':{en:"Alpha's Call",d:'Two spirit wolves answer instead of one, and they hunt for 20s.',mod:{dur:20},
  run(c,f){const r=f(c);const P=c.P;c.P=kqsV(P.x-2,P.z);try{f(c)}finally{c.P=P}ev137Column(pl.position,evC().c1,6,.7,700);return r}},
 'Frost Trap':{en:'Glacial Prison',d:'The trap freezes everything within 4.5 tiles for 3s.',mod:{r:4.5,stun:3},
  post(c){const p=c.gp.clone(),C=evC();ev137Sigil(p,0x9fe3ff,1.3,800,1)}},
 'Hawk Dive':{en:'Thunderbird',d:'The hawk strikes with lightning that leaps to 3 more enemies.',
  pre(c){c.evT=kqsNear(14)},post(c){const t=c.evT;if(!t)return;setTimeout(()=>{if(t.dead||!t.m)return;ev137Column(t.m.position,0xfff06a,8,.5,420);try{chainFrom(t,c.raw*.5,c.mt,3,0xfff06a,null,{})}catch(_){}},460)}},
 'Explosive Trap':{en:'Firestorm Mine',d:'Each mine bursts in a 40% wider blast of fire.',mod:{r:'*1.4'},
  post(c){const p=c.gp.clone(),C=evC();ev137Sigil(p,0xff8a3a,1.2,700,1)}},
 'Rapid Fire':{en:'Gatling Volley',d:'Looses 16 arrows in 2 seconds instead of 10.',
  run(c){let n=0;kqsSnd('arrow');const C=evC();kqsChan({t:c.sk.dur,iv:.125,slow:.4,tick:()=>{if(n>=16)return;n++;const d=aimDir();face(d);launch(pl.position,d,26,{col:c.sk.col,mt:'p',arrow:1,pierce:c.s.pierce||0},c.raw,.7);
   if(n%4==0)ev137Flare(gY(pl.position,1.2).addScaledVector(d,.9),C.c2,.8,180);try{bowAnim(120)}catch(_){}sfx('arrow')}});return true}},
 'Entangling Roots':{en:'Worldroot Grasp',d:'Roots burst over a 45% wider area and hold enemies for 4.5s.',mod:{r:'*1.45'},
  post(c){const p=c.gp.clone(),C=evC();setTimeout(()=>{ev137Shards(p,0x6ac04a,16,c.R*.85,1.6,1400);kqsFoes(p,c.R).forEach(e=>eStatus(e,{root:4.5},0))},270)}},
 'Stampede':{en:'Primal Stampede',d:'The herd charges 16 tiles in a 40% wider line.',mod:{L:16,w:4.5,rng:16},
  post(c){const P=c.P.clone(),d=kqsDir(P,c.gp),C=evC();ev137Rift(P,evAt(P,d,Math.min(c.sk.L,d2(P,c.gp)+1.5)),C.c1,1200)}},
 'Aimed Shot':{en:'Heartseeker',d:'The shot pierces a 30-tile line, 50% wider.',
  run(c){const C=evC(),glow=kqsMesh(new THREE.SphereGeometry(.16,8,6),kqsAdd(C.c2));scene.add(glow);try{bowAnim(950)}catch(_){}kqsSnd('draw');let ft=0;
   kqsChan({t:.9,iv:.9,ti:.9,slow:.6,tick:()=>{},upd:()=>{const d=aimDir();face(d);glow.position.copy(gY(pl.position,1.3)).addScaledVector(d,.8);const k=KQS.ch?Math.min(1,KQS.ch.el/.9):1;glow.scale.setScalar(.6+k*1.8);
     if(performance.now()>ft){ft=performance.now()+90;evxPuff(glow.position.clone().add(kqsV((Math.random()-.5)*1.4,(Math.random()-.5)*1.4)),{spr:1,col:C.c1,r0:.3,r1:0,life:.25,op:.8,v:[0,0,0],fin:.05})}},
    end:cancel=>{kqsRm(glow);if(cancel)return;const d=aimDir(),o=gY(pl.position,1.1);face(d);const e=o.clone().addScaledVector(d,30);ev137Lance(o,e,C.c1,.22,420);ev137Lance(o,e,0xffffff,.08,300);ev137Flare(o.clone().addScaledVector(d,.8),C.c2,2,300);kqsSnd('snipe');shake(.2);
     kqsLine(pl.position,d,30,2.4).forEach(q=>{kqsHit(q,c.raw,c);ev137Flare(gY(q.m.position,1),C.c2,1,240)})}});return true}},
 'Wild Hunt':{en:'The Endless Hunt',d:'Five spirit wolves join the hunt instead of three, for 16s.',mod:{dur:16},
  post(c){const P=c.P;[0,1].forEach(j=>{const a=pl.rotation.y+Math.PI+(j?1.5:-1.5),m=kqsWolf(0xc0f0ff,1.05);m.position.set(P.x+Math.sin(a)*2.2,0,P.z+Math.cos(a)*2.2);m.position.y=GH(m.position.x,m.position.z);ev137Column(m.position,0xa0e0ff,4,.5,600);
   kqsSummon({mesh:m,life:c.sk.dur,spd:7.8,reach:1.6,iv:.75,dmg:c.raw,c,col:0xa0e0ff,wolf:1,off:3+j})})}}
});
