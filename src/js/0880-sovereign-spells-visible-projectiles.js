// ================= Sovereign spells: visible projectiles =================
// new BMV entries are wrapped like zzz_mp.js does, so the boss driver still relays them to the other player
function kqBmv(k,fn){BMV[k]=function(e,A,en){const top=MP.inAI&&!MP.dep;MP.dep++;try{if(top&&MP.on&&MP.others&&A)MP.evq.push(['b',A.i,k,+(+en).toFixed(3)]);return fn.apply(this,arguments)}finally{MP.dep--}}}
function kqMouth(e){const m=e.m,bs=m.bs||3,ry=m.rotation.y;return V(m.position.x+Math.sin(ry)*.35*bs,GH(m.position.x,m.position.z)+Math.min(5,.85*bs)+(e.lift?.6:0),m.position.z+Math.cos(ry)*.35*bs)}
// a glow gathering at the Sovereign before it casts
function kqBossCast(e,col,ms){const g=kqSpr(col,.5),g2=kqSpr(kqLit(col,.5),.3);scene.add(g,g2);
  tw(ms,k=>{const p=kqMouth(e);g.position.copy(p);g2.position.copy(p);g.scale.setScalar(.5+3.2*k);g2.scale.setScalar(.3+1.4*k);if(Math.random()<.4)burst(p,col,1,.8,.6,.4)},()=>{const p=kqMouth(e);scene.remove(g,g2);burst(p,col,20,2,2,.5);kqFlash(p,col,4,220)})}
// a glob lobbed in an arc that lands when the red circle fires
function kqLob(A,from,to,dur,col,sz){const g=kqShot('glob',col,sz||1.8);g.position.copy(from);scene.add(g);const h=3+d2(from,to)*.22,ty=GH(to.x,to.z)+.3;
  kqTimed(dur,k=>{const x=from.x+(to.x-from.x)*k,z=from.z+(to.z-from.z)*k;g.position.set(x,from.y+(ty-from.y)*k+h*4*k*(1-k),z);if(Math.random()<.7)burst(g.position,col,1,.2,.2,.4)},()=>kqRm(g),()=>A.f)}
// something falling from the sky onto a red circle, landing exactly when it fires
function kqFall(A,to,delay,col,kind,sz,from){const FALL=Math.min(delay,.7),wait=delay-FALL;let g=null;const sx=from?from.x-to.x:-2,sz2=from?from.z-to.z:-2,sl=Math.hypot(sx,sz2)||1;
  kqTimed(delay,k=>{const t=k*delay;if(t<wait)return;if(!g){g=kind=='spike'?(()=>{const q=new THREE.Group(),s=new THREE.Mesh(kqGeo('spike'),kqBas(kqLit(col,.5)));s.scale.setScalar(1.3*(sz||1));s.rotation.x=Math.PI/2;q.add(s,kqSpr(col,1.6*(sz||1)));return q})():kqShot(kind||'meteor',col,sz||1.2);scene.add(g)}
    const q=(t-wait)/FALL,x=to.x+sx/sl*3*(1-q),z=to.z+sz2/sl*3*(1-q);g.position.set(x,GH(x,z)+.3+10*(1-q),z);if(g.userData.spin)g.userData.spin.rotation.x+=.3;if(Math.random()<.8)burst(g.position,col,2,.3,.6,.4)},
    ab=>{kqRm(g);if(!ab){kqFlash(gY(to,.5),col,3,260);burst(gY(to,.4),kqLit(col),12,2,2.4,.45)}},()=>A.f)}
// a lance that races out along a red line, reaching the end the moment it fires
function kqSweep(A,o,d,l,delay,col,kind){const TR=Math.min(delay,.38),wait=delay-TR;let g=null;
  kqTimed(delay,k=>{const t=k*delay;if(t<wait)return;if(!g){g=new THREE.Group();if(kind=='bone'){const s=new THREE.Mesh(kqGeo('spike'),kqBas(0xf0e8d8));s.scale.set(1.4,1.4,1.6);g.add(s,kqSpr(col,1.6))}else g.add(kqShot('orb',col,1.6));scene.add(g)}
    const q=(t-wait)/TR,s=1+(l-1)*q,x=o.x+d.x*s,z=o.z+d.z*s;g.position.set(x,GH(x,z)+.8,z);g.lookAt(x+d.x,g.position.y,z+d.z);burst(g.position,col,2,.3,.4,.4);if(kind=='bone'&&Math.random()<.5)burst(gY(g.position,-.6),0xc8b090,2,.6,.6,.4)},()=>kqRm(g),()=>A.f)}
// ---- rewritten Sovereign moves (same damage and timing as before, plus the visuals) ----
kqBmv('rain',function(e,A,en){let n=0;const N=e.bs.ph>=3?7:5;kqBossCast(e,A.b.col,450*en);const f=()=>{if(n++>=N||e.dead||!A.f)return;const q=pl.position.clone().add(V((Math.random()-.5)*3,0,(Math.random()-.5)*3));
    kqFall(A,q,.9*en,A.b.col,'meteor',1.1,e.m.position);
    tele(q,2.1,.9*en,()=>{if(!A.f)return;ring(q,A.b.col,5,350);burst(gY(q,.3),A.b.col,24,4,3,.6);if(d2(pl.position,q)<2.2)bossHit(e,1)});setTimeout(f,420*en)};f();return {d:(N*.42+1)*en,lock:0}});
kqBmv('spit',function(e,A,en){const N=e.bs.ph>=3?5:3,mo=kqMouth(e);kqBossCast(e,0x7aff4a,300);for(let i=0;i<N;i++){const q=inArena(A,pl.position.clone().add(V((Math.random()-.5)*6,0,(Math.random()-.5)*6)));if(i==0)q.copy(inArena(A,pl.position.clone()));
    const dl=(.9+i*.15)*en;kqLob(A,mo,q,dl,0x7aff4a,1.9);
    tele(q,2.2,dl,()=>{if(!A.f)return;burst(gY(q,.3),0x7aff4a,16,2,2,.5);if(d2(pl.position,q)<2.2)bossHit(e,.7);bxPool(A,q,2.2,6,0x6aff3a)})}return {d:1.3*en,lock:0}});
kqBmv('spores',function(e,A,en){const mo=kqMouth(e);kqBossCast(e,0xb050e0,300);for(let i=0;i<(e.bs.ph>=2?5:4);i++){const q=inArena(A,i==0?pl.position.clone():V(A.cx+(Math.random()-.5)*20*DK,0,A.cz+(Math.random()-.5)*20*DK));const dl=(.9+i*.1)*en;
    kqLob(A,mo,q,dl,0xc070ff,2.2);tele(q,2.6,dl,()=>{if(A.f)bxPool(A,q,2.6,7,0xb050e0,.25)})}say('☁ Toxic spores drift across the arena.');return {d:1.4*en,lock:0}});
kqBmv('bonelines',function(e,A,en){const o=e.m.position.clone(),a0=Math.atan2(pl.position.x-o.x,pl.position.z-o.z);let hit=false;kqBossCast(e,0xe8e0c8,1000*en*.8);[-.45,0,.45].forEach(da=>{const d=V(Math.sin(a0+da),0,Math.cos(a0+da));
    kqSweep(A,o,d,15,1.0*en,0xe8e0c8,'bone');
    tele(o,0,1.0*en,()=>{if(!A.f)return;for(let s=1;s<15;s+=1.2)burst(gY(o.clone().addScaledVector(d,s),.6),0xe8e0c8,3,1,3,.5);if(!hit&&inLine(pl.position,o,d,15,2.2)&&hero.iv<=0){hit=true;bossHit(e,1.2)}},{w:2.2,l:15,d})});return {d:1.6*en,lock:1}});
kqBmv('cross',function(e,A,en){const o=e.m.position.clone(),a0=Math.random()<.5?0:Math.PI/4;let hit=false;kqBossCast(e,A.b.col,1250*en*.8);
    for(let k=0;k<4;k++){const a=a0+k*Math.PI/2,d=V(Math.sin(a),0,Math.cos(a));kqSweep(A,o,d,14,1.25*en,A.b.col,'orb');tele(o,0,1.25*en,()=>{if(!A.f)return;for(let s=1;s<14;s+=1.5)burst(gY(o.clone().addScaledVector(d,s),.3),A.b.col,3,1,2,.4);if(!hit&&inLine(pl.position,o,d,14,2.6)&&hero.iv<=0){hit=true;bossHit(e,1.3)}},{w:2.6,l:14,d})}
    if(e.bs.ph>=3)setTimeout(()=>{if(!A.f||e.dead)return;const o2=e.m.position.clone();let h2=false;for(let k=0;k<4;k++){const a=a0+Math.PI/4+k*Math.PI/2,d=V(Math.sin(a),0,Math.cos(a));kqSweep(A,o2,d,14,1.1*en,A.b.col,'orb');tele(o2,0,1.1*en,()=>{if(!A.f)return;if(!h2&&inLine(pl.position,o2,d,14,2.6)&&hero.iv<=0){h2=true;bossHit(e,1.3)}},{w:2.6,l:14,d})}},900*en);
    return {d:(e.bs.ph>=3?2.6:1.7)*en,lock:1}});
kqBmv('lightning',function(e,A,en){const o=e.m.position.clone(),d=toPl(o);kqBossCast(e,0xcfe8ff,500*en);for(let i=0;i<8;i++){const q=inArena(A,o.clone().addScaledVector(d,2+i*2.4),.8),dl=(.6+i*.13)*en;
    kqFall(A,q,dl,0xcfe8ff,'orb',1.2,o);
    tele(q,1.8,dl,()=>{if(!A.f)return;bolt(gY(q,11),gY(q,.2),0xdff0ff);burst(gY(q,2),0xcfe8ff,12,1,6,.3);ring(q,0x9ad8ff,3,200);if(d2(pl.position,q)<1.8)bossHit(e,1)})}return {d:1.8*en,lock:0}});
kqBmv('mines',function(e,A,en){const N=6+e.bs.ph*2,ice=A.b.sp=='IceWraith',kind=ice?'spike':'meteor';kqBossCast(e,A.b.col,500*en);
    for(let k=0;k<N;k++){const a=Math.random()*6.283,r=2+Math.random()*(ARENA_R-3.5),q=V(A.cx+Math.cos(a)*r,0,A.cz+Math.sin(a)*r),dl=(1.5+k*.12)*en;kqFall(A,q,dl,A.b.col,kind,1,e.m.position);
      tele(q,1.9,dl,()=>{if(!A.f)return;ring(q,A.b.col,4,300);burst(gY(q,.3),A.b.col,20,3,3,.5);if(d2(pl.position,q)<2)bossHit(e,1.1)})}
    const q0=pl.position.clone();kqFall(A,q0,1.4*en,A.b.col,kind,1.2,e.m.position);tele(q0,1.9,1.4*en,()=>{if(A.f&&d2(pl.position,q0)<2)bossHit(e,1.1)});return {d:1.2*en,lock:0}});
// ---- Rime Wraith orbs: they gather at the arena's outer edge (a frost swirl marks each spot) and then hunt you inward ----
kqBmv('orbs',function(e,A,en){const N=e.bs.ph>=2?6:4,col=A.b.col,a0=Math.random()*6.283,WARN=.95*en;kqBossCast(e,col,WARN*1000);
  for(let i=0;i<N;i++){const a=a0+i/N*6.283,R0=ARENA_R-1.4,q=V(A.cx+Math.cos(a)*R0,0,A.cz+Math.sin(a)*R0),gy=GH(q.x,q.z);
    // spawn telegraph: a blue frost circle + a rising wisp at the edge
    const rg=new THREE.Mesh(kqGeo('rune'),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide}));rg.renderOrder=22;rg.position.set(q.x,gy+.16,q.z);scene.add(rg);
    const w=kqSpr(col,.4);w.position.set(q.x,gy+.3,q.z);scene.add(w);
    kqTimed(WARN,k=>{rg.material.opacity=.85*k;rg.scale.setScalar(1.6-.6*k);rg.rotation.y+=.08;w.position.y=gy+.3+.9*k;w.scale.setScalar(.4+1.6*k);if(Math.random()<.5)burst(V(q.x,gy+.2,q.z),col,1,.8,1.2,.5)},
      ab=>{kqRm(rg);kqRm(w);rg.material.dispose();if(ab||e.dead)return;
        const g=kqShot('orb',col,1.8),cr=new THREE.Mesh(kqGeo('sph'),new THREE.MeshBasicMaterial({color:0x2a6ad0,transparent:true,opacity:.6,depthWrite:false}));cr.scale.setScalar(.62);cr.renderOrder=-1;g.add(cr);const sh=new THREE.Mesh(kqGeo('disc'),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false}));sh.renderOrder=21;sh.position.y=-1.08;g.add(sh);
        g.position.set(q.x,gy+1.2,q.z);scene.add(g);burst(g.position,col,24,2,2,.5);kqFlash(g.position,col,3,240);
        bxA(A).push({k:'orb',ms:g,t:9,sp:3.3+i*.18,e});
        kqFx({end(){sh.material.dispose()},tick(){if(!g.parent)return false;sh.position.y=(GH(g.position.x,g.position.z)+.12-g.position.y)/(g.scale.x||1);if(Math.random()<.6)burst(g.position,col,1,.25,.2,.45);return true}})},()=>A.f)}
  say('✦ Wailing orbs gather at the edge of the arena — they hunt you down!');return {d:1.2*en,lock:0}});

