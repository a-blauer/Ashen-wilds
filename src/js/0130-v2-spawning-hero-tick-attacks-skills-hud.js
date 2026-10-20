// ---------------- spawning ----------------
function spawnEnemy_base(key,x,z,l,o){
  o=o||{};const al=!!o.al,c=enemyC(key,l,{al}),m=cr(c);if(o.zt)c.zt=o.zt;
  if(al){m.bs*=1.35;const r=new THREE.Mesh(new THREE.RingGeometry(.75,.95,24),new THREE.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.y=.06;m.add(r)}
  m.position.set(x,0,z);m.isE=1;m.scale.setScalar(.001);scene.add(m);tw(450,k=>m.scale.setScalar(m.bs*k));
  const e={c,m,hb:bar(al),cd:1.2,ch:0,vx:0,vz:0,tier:tierOfLv(l)-1,wx:x,wz:z,wt:0,agg:o.agg?1:0,minion:o.minion?1:0,dots:[]};enemies.push(e);return e;
}
function humAnim(g,now,mv){
  const h=g.h,b=h.bones,a=g.ak;h.sw=!!a;animHero(now,mv,h);g.b.position.y=0;
  if(a){const k=a.k,n=a.n;
    if(a.ph==0){const q=k;if(n=='throw'||n=='bolt'||n=='rainfire'||n=='spit'){b.aR0.rotation.x=-2.4*q;b.aL0.rotation.x=-1.2*q}else if(n=='slam'){b.aR0.rotation.x=-3*q;b.aL0.rotation.x=-3*q;b.spine.rotation.x=-.3*q}else if(n=='spin'){b.aR0.rotation.z=1.3*q;b.aL0.rotation.z=-1.3*q;b.aR0.rotation.x=-.3}else{b.aR0.rotation.x=-1.9*q;b.aR0.rotation.z=-.5*q;b.spine.rotation.y=.6*q}}
    else if(a.ph==1){const s=Math.min(1,k*1.6);if(n=='slam'){b.aR0.rotation.x=-3+2.6*s;b.aL0.rotation.x=-3+2.6*s;b.spine.rotation.x=-.3+.6*s}else if(n=='spin'){b.aR0.rotation.z=1.3;b.aL0.rotation.z=-1.3}else if(n=='throw'||n=='bolt'||n=='rainfire'||n=='spit'){b.aR0.rotation.x=-2.4+2*s}else{b.aR0.rotation.x=-1.9+1.6*s;b.aR0.rotation.z=-.5+1.3*s;b.spine.rotation.y=.6-1.3*s}}
    else{const r=k;b.aR0.rotation.z*=r;b.spine.rotation.y*=r;b.spine.rotation.x*=r}
  }else{b.aR0.rotation.z=0;b.aL0.rotation.z=0;b.spine.rotation.x=0}
}
// ---------------- extra enemy moves ----------------
Object.assign(MV,{
 strike:{rmin:0,rmax:1.9,wind:.32,act:.18,rec:.38,cd:1.15,dmg:.75,sh:'cone',r:1.85,ang:.62,quick:1},
 throw:{rmin:2.4,rmax:10,wind:.5,act:.15,rec:.4,cd:1.9,dmg:.85,sh:'line',w:.4,l:10,proj:{spd:13,col:0xc8b890}},
 bolt:{rmin:2.4,rmax:10,wind:.65,act:.2,rec:.5,cd:2.4,dmg:1.1,sh:'line',w:.55,l:10,mt:'m',proj:{spd:9.5}},
 rainfire:{rmin:2,rmax:9,wind:1.1,act:.22,rec:.6,cd:4.6,dmg:1.6,sh:'circle',r:2.2,at:'tg',mt:'m'}
});
MV.spit.mt='m';
// ---------------- hero tick: regen, mana, dashes, buffs, channels, zones, traps ----------------
function heroTick(dt,now){
  if(dt<=0)return;const s=HS(),mx=heroMax(),mm=mpMax();
  if(hero.mp==null)hero.mp=mm;hero.mp=Math.min(mm,hero.mp+dt*mm*(.012+s.mpr));
  const inCombat=now-hero.lastHit<6000||enemies.some(e=>e.agg&&!e.dead&&d2(e.m.position,pl.position)<12);
  if(!inCombat)hero.hp=Math.min(mx,hero.hp+dt*mx*.03);else if(s.regen)hero.hp=Math.min(mx,hero.hp+dt*mx*s.regen);
  party.slice(0,2).forEach(c=>{if(!c||!c.emp||c.h<=0)return;(c.sp||[]).forEach(n=>{const em=CSP[n]&&CSP[n].emp;if(!em)return;
    if(em.k=='regen')hero.hp=Math.min(mx,hero.hp+dt*mx*em.v);
    else if(em.k=='shield'||em.k=='healp'||em.k=='pulse'){c.eT=(c.eT||0)-dt;if(c.eT<=0){c.eT=em.cd;
      if(em.k=='shield'){hero.sh=Math.max(hero.sh,mx*em.v*(1+s.shieldP));hero.shT=now+8000;ring(pl.position,0xc0b090,2,500)}
      else if(em.k=='healp')healHero(mx*em.v);
      else if(inCombat){ring(pl.position,0x9ad84a,em.r*1.4,400);enemies.forEach(e=>{if(!e.dead&&d2(e.m.position,pl.position)<em.r)compHit(c,e,em.m,{poison:4})})}}}})});
  hero.dc=Math.min(s.dash,(hero.dc==null?s.dash:hero.dc)+dt/(2.8*(1-Math.min(.6,s.dashR))));
  if(hero.sh>0&&now>hero.shT)hero.sh=0;
  hero.buffs=hero.buffs.filter(b=>b.t>now);
  if(hero.chan){const c=hero.chan;c.t-=dt;c.tick-=dt;pl.rotation.y+=dt*18;if(c.tick<=0){c.tick=.3;area(pl.position,c.R,c.raw,{mt:c.mt,col:c.sk.col},null,0);burst(gY(pl.position,.8),c.sk.col,10,c.R*1.2,.6,.3)}if(c.t<=0){hero.chan=null;pl.sw=0}}
  for(let i=zones.length-1;i>=0;i--){const z=zones[i];z.t-=dt;z.ti-=dt;if(z.follow)z.p.copy(pl.position);if(z.mesh)z.mesh.position.copy(gY(z.p,.14));
    if(z.ti<=0&&z.n>0){z.ti=z.iv;z.n--;if(z.cc)enemies.forEach(e=>{if(!e.dead&&d2(e.m.position,z.p)<z.R)compHit(z.cc,e,z.mm,z.fx)});else area(z.p,z.R,z.raw,{mt:z.mt,col:z.col,proc:false},null,0);for(let k=0;k<6;k++){const a=Math.random()*6.28,r=Math.random()*z.R;burst(gY(V(z.p.x+Math.cos(a)*r,0,z.p.z+Math.sin(a)*r),.3+Math.random()*1.5),z.col,1,.3,-1.5,.4)}}
    if(z.n<=0||z.t<=0){if(z.mesh){scene.remove(z.mesh);z.mesh.geometry.dispose()}zones.splice(i,1)}}
  for(let i=traps.length-1;i>=0;i--){const tp=traps[i];tp.t-=dt;const vic=enemies.filter(e=>!e.dead&&d2(e.m.position,tp.p)<1.1);
    if(vic.length){enemies.forEach(e=>{if(!e.dead&&d2(e.m.position,tp.p)<2){heroHit(e,tp.raw,'p',{proc:false});eStatus(e,{root:tp.root},0)}});ring(tp.p,0xc0a060,2.4,400);burst(gY(tp.p,.3),0xc0a060,24,2,1.5,.5);tp.t=0}
    if(tp.t<=0){scene.remove(tp.mesh);traps.splice(i,1)}}
}
function zoneAt(p,R,raw,mt,col,ticks,iv,o){
  o=o||{};const mesh=new THREE.Mesh(new THREE.CircleGeometry(R,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));mesh.rotation.x=-Math.PI/2;mesh.position.copy(gY(p,.14));scene.add(mesh);
  zones.push(Object.assign({p:p.clone(),R,raw,mt,col,n:ticks,iv,ti:0,t:ticks*iv+1,mesh},o));
}
// ---------------- class basic attacks ----------------
function launch(pos,d,spd,s,dm,life){const m=shotMesh(s.col,s.arrow);m.position.copy(gY(pos,1.0)).addScaledVector(d,.7);m.lookAt(m.position.clone().add(d));scene.add(m);shots.push({m,v:d.clone().multiplyScalar(spd),s,dm,t:life||1.1,hit:new Set()})}
function swing_base(){
  if(atkCd>0||!party.length||hero.chan)return;
  const C=CLS[hero.cls],s=HS(),w=eq.weapon&&canUse(eq.weapon)?eq.weapon:null,wt=w?itT(w).wt:null,spdK=wt?WTYPE[wt].spd:1,base=C.spd*spdK/(1+s.as),d=aimDir();face(d);
  const raw=atkOf(C.mt)*(1+s.basicP);
  if(C.atk=='bow'){atkCd=base;bowAnim(base*900);setTimeout(()=>{if(!party.length)return;const d2_=aimDir();face(d2_);launch(pl.position,d2_,24,{col:0xe8d8b0,arrow:1,mt:'p',pierce:s.pierce,basic:1},raw,.62)},base*480);return}
  if(C.atk=='staff'){atkCd=base;staffAnim(base*800);setTimeout(()=>{if(!party.length)return;const d2_=aimDir();face(d2_);launch(pl.position,d2_,15,{col:hero.cls=='mage'?0x9a7aff:0xffe08a,mt:'m',splash:.9,basic:1,home:1},raw,.78)},base*360);return}
  const now=performance.now(),n4=C.atk=='melee4',N=n4?4:3;if(now-comboT>1000)combo=0;const st=combo;combo=(combo+1)%N;comboT=now;
  const fin=st==N-1,anim=n4?[0,1,0,2][st]:st,mult=(n4?[.8,.8,.95,1.55]:[1,1.1,1.7])[st]*(fin?1+s.finisher:1),ms=(n4?[190,190,210,330]:[300,300,450])[st]*Math.min(1.2,spdK)/(1+s.as*.5);
  const rg=C.rng*(wt=='gs'||wt=='ga'?1.08:1)*(fin?1.12:1);
  atkCd=base*(fin?1.3:1);pl.step=fin?null:{x:d.x,z:d.z,t:.1,sp:3.5};
  swingAnim(anim,ms,()=>{
    slashFx(d,anim,rg);if(n4)slashFx(d,anim==1?0:1,rg*.9);
    const hits=area(pl.position,rg,raw*mult,{mt:C.mt,col:0xffe6b0,basic:1},d,fin?1.25:1.15);
    if(fin){ring(pl.position.clone().addScaledVector(d,1.2),0xffe0a0,2.4,320);burst(gY(pl.position.clone().addScaledVector(d,1.3),.15),0xc8b090,22,2.4,1.4,.5);shake(.14);hits.forEach(e=>cbHeavy(e))}
    if(hits.length){hstop=fin?.05:.02;shake(fin?.2:.06)}
  });
}
function shotTick(dt){
  for(let i=shots.length-1;i>=0;i--){
    const sh=shots[i];if(sh.s.home&&dt>0)homeShot(sh,dt);sh.m.position.addScaledVector(sh.v,dt);sh.t-=dt;if(dt>0&&!sh.s.arrow)burst(sh.m.position,sh.s.col,2,.3,.4,.35);
    const hit=enemies.find(e=>!e.dead&&!sh.hit.has(e)&&Math.hypot(e.m.position.x-sh.m.position.x,e.m.position.z-sh.m.position.z)<.75*(e.c.al?1.4:1)+(e.boss?1.2:0));
    let gone=sh.t<=0||solid(sh.m.position.x,sh.m.position.z)||brkShot(sh.m.position);
    if(hit){sh.hit.add(hit);const s=sh.s;burst(sh.m.position,s.col,s.big?40:12,s.big?5:2.5,2,.5);
      if(s.big||s.splash){ring(sh.m.position,s.col,s.big?4:1.6,320);area(sh.m.position,s.big?2.2:s.splash,sh.dm,s,null,0)}
      else if(s.cc)compHit(s.cc,hit,s.mm||1,s.fx);else heroHit(hit,sh.dm,s.mt||heroMt(),{s});
      if((s.pierce||0)>=sh.hit.size)gone=false;else gone=true}
    if(gone){scene.remove(sh.m);shots.splice(i,1)}
  }
}
// ---------------- class skills ----------------
const heroSkills=()=>SKL[hero.cls];
function aimPoint(maxD){if(tgt&&!tgt.dead&&d2(tgt.m.position,pl.position)<maxD)return tgt.m.position.clone().setY(0);if(mOn&&!orb){const v=V(mg.x-pl.position.x,0,mg.z-pl.position.z),L=v.length();if(L>maxD)v.multiplyScalar(maxD/L);return V(pl.position.x+v.x,0,pl.position.z+v.z)}const d=aimDir();return V(pl.position.x+d.x*Math.min(6,maxD),0,pl.position.z+d.z*Math.min(6,maxD))}
function nearestFront(maxD){const f=aimDir();return enemies.filter(e=>!e.dead&&d2(e.m.position,pl.position)<maxD).map(e=>{const v=V(e.m.position.x-pl.position.x,0,e.m.position.z-pl.position.z),L=v.length()||.01;return {e,s:L*(1+Math.acos(Math.max(-1,Math.min(1,v.dot(f)/L)))*1.5)}}).sort((a,b)=>a.s-b.s).map(o=>o.e)[0]}
function cast_base(i){
  const sk=heroSkills()[i];if(!sk||!party.length||hero.chan)return;
  if(hero.lvl<sk.lv){if(performance.now()-(hero.nmT||0)>900){hero.nmT=performance.now();say(sk.i+' '+sk.n+' unlocks at level '+sk.lv+'.')}return}
  const key='s'+i;if((hero.cd[key]||0)>0)return;const s=HS();
  if(hero.mp<sk.mp){if(performance.now()-(hero.nmT||0)>1200){hero.nmT=performance.now();say('Not enough mana.')}return}
  hero.mp-=sk.mp;hero.cd[key]=Math.random()<s.echo?.6:sk.cd*kqrC(sk)*(1-Math.min(.5,s.cdr));
  const d=aimDir();face(d);const mt=sk.mt||CLS[hero.cls].mt,raw=atkOf(mt)*(sk.m||0)*(1+s.skillP)*kqrP(sk),Rr=(sk.r||0)*(1+s.aoeP),now=performance.now(),P=pl.position;
  const fx={mt,col:sk.col,stun:sk.stun,burn:sk.burn};
  if(sk.k!='buff'&&sk.k!='heal'&&sk.k!='barrier')castAnim();
  switch(typeof fxbCast=='function'&&fxbCast(sk,P,d,raw,mt,fx,s,Rr)?'_fxb':sk.k){
    case 'cone':arc(P,d,sk.col,Rr,320);burst(gY(P.clone().addScaledVector(d,1.4),.8),sk.col,24,2.5,1.5,.5);area(P,Rr,raw,fx,d,1);shake(.08);break;
    case 'nova':ring(P,sk.col,Rr*2.2,380);ring(P,0xffffff,Rr*1.6,260);burst(gY(P,.5),sk.col,50,Rr*1.6,3,.7);area(P,Rr,raw,fx,null,0);break;
    case 'leap':{const tp=aimPoint(7),o=P.clone();let k0=1;while(k0>0&&plBlocked(o.x+(tp.x-o.x)*k0,o.z+(tp.z-o.z)*k0))k0-=.05;UNS.air=nowP()+480;tp.set(o.x+(tp.x-o.x)*k0,0,o.z+(tp.z-o.z)*k0);hero.iv=Math.max(hero.iv,.5);
      tw(420,k=>{P.x=o.x+(tp.x-o.x)*k;P.z=o.z+(tp.z-o.z)*k;pl.children[0].position.y=Math.sin(k*Math.PI)*1.6},()=>{pl.children[0].position.y=0;ring(P,sk.col,Rr*2,380);burst(gY(P,.3),0xc8b090,40,Rr*1.5,2,.6);shake(.25);area(P,Rr,raw,fx,null,0)});break}
    case 'buff':hero.buffs.push({s:kqrB(sk,sk.buff),t:now+sk.dur*1000,n:sk.n,i:sk.i});hsDirty();ring(P,sk.col,3,600);burst(gY(P,1),sk.col,40,2,3,.8);break;
    case 'channel':hero.chan={t:sk.dur,tick:0,sk,raw,R:Rr,mt};pl.sw=1;break;
    case 'barrier':hero.sh=heroMax()*sk.v*(1+s.shieldP)*kqrP(sk);hero.shT=now+sk.dur*1000;ring(P,sk.col,2.2,600);burst(gY(P,1),sk.col,30,1.5,2,.7);break;
    case 'rain':{const p=sk.at=='self'?P.clone():aimPoint(10);zoneAt(p,Rr,raw,mt,sk.col,sk.ticks,sk.iv,{follow:sk.at=='self'});break}
    case 'heal':healHero(heroMax()*sk.v*kqrP(sk));pl.slow=0;ring(P,sk.col,2.6,700);burst(gY(P,1),sk.col,40,1.5,3,.9);break;
    case 'blink':{const t=tgt&&!tgt.dead&&d2(tgt.m.position,P)<9?tgt:nearestFront(8);const dv=t?V(t.m.position.x-P.x,0,t.m.position.z-P.z):d.clone().setY(0);const L_=dv.length()||1;dv.multiplyScalar(1/L_);const dist=t?Math.min(8,L_+1.8):5.5;face(dv);hero.iv=Math.max(hero.iv,dist/14+.15);hero.dash={x:dv.x,z:dv.z,t:dist/14};shadowRush(dist,raw,mt,fx,sk);break}
    case 'fan':for(let j=0;j<sk.n2;j++){const a=j/sk.n2*6.283,dd=V(Math.sin(a),0,Math.cos(a));launch(P,dd,16,{col:sk.col,mt,arrow:0},raw,.55)}break;
    case 'mark':{const t=tgt&&!tgt.dead&&d2(tgt.m.position,P)<9?tgt:nearestFront(8);if(!t){hero.cd[key]=0;hero.mp+=sk.mp;say('No target in reach.');return}t.mark=sk.dur;t.markV=sk.v*kqrU(sk);heroHit(t,raw,mt,{s:fx});ring(t.m.position,sk.col,1.6,600);dn(t.m.position,'Marked','#ff6a9a',-36,1000);break}
    case 'trap':{const mesh=new THREE.Mesh(new THREE.TorusGeometry(.45,.08,6,16),new THREE.MeshStandardMaterial({color:0x8a7a5a,metalness:.6,roughness:.4}));mesh.rotation.x=Math.PI/2;mesh.position.copy(gY(P,.06));scene.add(mesh);traps.push({p:P.clone(),t:20,raw,root:sk.root,mesh});break}
    case 'shot':for(let j=0;j<(sk.n2||1);j++){const n=sk.n2||1,a=(j-(n-1)/2)*.2,co=Math.cos(a),sn=Math.sin(a),dd=V(d.x*co+d.z*sn,0,-d.x*sn+d.z*co);launch(P,dd,sk.arrow?22:13,{col:sk.col,mt,arrow:sk.arrow,big:sk.big,burn:sk.burn,pierce:sk.arrow?s.pierce:0},raw,sk.arrow?.65:1.1)}break;
    case 'beam':{const o=gY(P,.9);bolt(o,o.clone().addScaledVector(d,9),sk.col);bolt(o,o.clone().addScaledVector(d,9),0xffffff);enemies.forEach(e=>{if(e.dead)return;const v=V().subVectors(e.m.position,P).setY(0),a=v.dot(d),w=Math.abs(v.x*d.z-v.z*d.x);if(a>0&&a<9&&w<1.1)heroHit(e,raw,mt,{s:fx})});break}
    case 'chain':{const t=tgt&&!tgt.dead&&d2(tgt.m.position,P)<10?tgt:nearestFront(9);if(!t){hero.cd[key]=0;hero.mp+=sk.mp;say('No target in reach.');return}chainFrom(t,raw,mt,sk.jumps,sk.col,null);break}
    case 'meteor':{const p=aimPoint(10);tele(p,Rr,sk.delay,()=>{ring(p,sk.col,Rr*2,420);burst(gY(p,.4),sk.col,70,Rr*1.6,4,.9);shake(.3);area(p,Rr,raw,fx,null,0)});break}
  }
  hud();
}
function compCast(c,f,sp,t){
  const mult=sp.m||1,fx=sp.fx,P=f.position,col=sp.col,R2=sp.r||2.6;
  if(t){const w=V(t.m.position.x-P.x,0,t.m.position.z-P.z);if(w.lengthSq()>0)f.rotation.y=Math.atan2(w.x,w.z)}
  const d=t?V(t.m.position.x-P.x,0,t.m.position.z-P.z).normalize():V(0,0,1);
  switch(sp.k){
    case 'bite':f.lk=1;lunge(f,t.m.position,()=>{f.lk=0;for(let h=0;h<(sp.hits||1);h++)setTimeout(()=>{if(!t.dead){compHit(c,t,mult,fx);burst(gY(t.m.position,.6),col,8,1.5,1,.3)}},h*160)});break;
    case 'bolt':launch(P,d,12,{col,cc:c,mm:mult,fx,big:sp.big},0,1.2);break;
    case 'fan':for(let j=0;j<(sp.n2||5);j++){const a=(j-((sp.n2||5)-1)/2)*.22,co=Math.cos(a),sn=Math.sin(a);launch(P,V(d.x*co+d.z*sn,0,-d.x*sn+d.z*co),14,{col,cc:c,mm:mult,fx},0,.7)}break;
    case 'nova':ring(P,col,R2*2,380);burst(gY(P,.5),col,30,R2*1.4,2,.6);enemies.forEach(e=>{if(!e.dead&&d2(e.m.position,P)<R2)compHit(c,e,mult,fx)});break;
    case 'cone':arc(P,d,col,R2,300);enemies.forEach(e=>{if(e.dead)return;const v=V(e.m.position.x-P.x,0,e.m.position.z-P.z),L=v.length();if(L<R2&&(L<.4||Math.acos(Math.min(1,v.dot(d)/L))<.9))compHit(c,e,mult,fx)});break;
    case 'beam':{const o=gY(P,.6);bolt(o,o.clone().addScaledVector(d,8),col);enemies.forEach(e=>{if(e.dead)return;const v=V().subVectors(e.m.position,P).setY(0),a=v.dot(d),w=Math.abs(v.x*d.z-v.z*d.x);if(a>0&&a<8&&w<1)compHit(c,e,mult,fx)});break}
    case 'rain':zoneAt(t.m.position.clone().setY(0),R2,0,'p',col,sp.ticks||6,sp.iv||.45,{cc:c,mm:mult,fx});break;
    case 'chain':chainFrom(t,0,'m',sp.jumps||3,col,c,fx);break;
    case 'meteor':{const p=t.m.position.clone();tele(p,R2,sp.delay||1,()=>{ring(p,col,R2*2,400);burst(gY(p,.4),col,50,R2*1.5,3,.8);enemies.forEach(e=>{if(!e.dead&&d2(e.m.position,p)<R2)compHit(c,e,mult,{burn:4})})});break}
    case 'shield':{const mx=heroMax();hero.sh=Math.max(hero.sh,mx*sp.v*(1+HS().shieldP));hero.shT=performance.now()+(sp.dur||8)*1000;ring(pl.position,col,2.2,600);burst(gY(pl.position,1),col,24,1.4,2,.6);
      if(sp.nova)enemies.forEach(e=>{if(!e.dead&&d2(e.m.position,pl.position)<2.8)compHit(c,e,sp.nova)});break}
    case 'heal':healHero(heroMax()*sp.v);ring(pl.position,col,2.4,600);break;
    case 'buff':hero.buffs.push({s:sp.buff,t:performance.now()+(sp.dur||8)*1000,n:sp.n||'',i:sp.i});hsDirty();ring(pl.position,col,2.6,600);break;
  }
}
function toggleEmp(i){
  const c=party[i];if(!c||c.h<=0)return say("That companion can't empower you right now.");
  const b=heroMax();c.emp=!c.emp;hsDirty();const a=heroMax();hero.hp=c.emp?hero.hp+(a-b):Math.min(hero.hp,a);
  const sp=CSP[c.sp[0]];say(c.emp?nm(c)+' empowers you'+(sp&&sp.emp?': '+sp.emp.d:'.'):nm(c)+' goes back to fighting.');hud();
}
// ---------------- dash with charges ----------------
function dodge_base(){
  if(!party.length||(hero.cdD||0)>0||uiOpen()||hero.chan)return;
  if((hero.dc||0)<1){if(performance.now()-(hero.dxT||0)>800){hero.dxT=performance.now();dn(pl.position,'Out of stamina','#9ab0c8',-20,800)}return}
  const s=HS(),ax0=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0)+dp[0],az0=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0)+dp[1],cy_=Math.cos(camYaw),sy_=Math.sin(camYaw),ax=ax0*cy_+az0*sy_,az=-ax0*sy_+az0*cy_,l=Math.hypot(ax,az),now_=performance.now(),d=(pl.mvd&&now_-pl.mvd.t<180)?V(pl.mvd.x,0,pl.mvd.z):l>0?V(ax/l,0,az/l):V(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y));
  hero.dc-=1;hero.cdD=.25;hero.iv=.3+s.iframe;hero.dash={x:d.x,z:d.z,t:.2};face(d);burst(gY(pl.position,.4),0xbfd0ff,20,2,1,.4);
  if(!pl.sw){const bb=pl.bones;tw(260,k=>{const q=Math.sin(k*Math.PI);bb.spine.rotation.x=.55*q;bb.lh0.rotation.x=-.9*q;bb.rh0.rotation.x=-.6*q},()=>{bb.spine.rotation.x=0})}
}

// ---------------- creature ornaments: higher tiers and evolutions look more ornate ----------------
const ornLv=c=>(SP2[c.g[0]]?SP2[c.g[0]][7]:0)+(c.evo||0)+(c.boss?3:c.al?1:0);
function crOrn(c,vax,bk,hd){
  const o=ornLv(c);if(!o)return;const gold=0xd8b44a,bone=0xe8e0c8,dark=0x2a2430,glow=FAMD[famOf(c.g[0])]?FAMD[famOf(c.g[0])].col:0xff4a2a,hc=o>=4?gold:bone;
  if(o>=1){[-1,1].forEach(s=>vax('head',RC,hc,hd[0]+s*.07,hd[1]+.02,hd[2]-.06,.03+.006*o,.11+.025*o,.03+.006*o,-.6,-s*.45));[-1,1].forEach(s=>vax('head',RS,glow,hd[0]+s*.085,hd[1]-.03,hd[2]+.1,.022,.018,.012,0,0,1))}
  if(o>=2)bk.forEach((a,i)=>vax(a[0],RC,o>=4?gold:dark,0,a[1]+.04,a[2],.04+.008*o,.12+.03*o,.04+.008*o));
  if(o>=3){bk.slice(0,2).forEach(a=>[-1,1].forEach(s=>vax(a[0],RS,o>=5?gold:0x5a5a66,s*.12,a[1]-.02,a[2],.1,.05,.11)));vax('head',RC,hc,hd[0],hd[1]+.08,hd[2]-.02,.03,.16,.03,-.3)}
  if(o>=4)vax('head',new THREE.TorusGeometry(.13,.014,8,24),gold,hd[0],hd[1]+.14,hd[2]-.04,1,1,1,Math.PI/2,0,1);
  if(o>=5)[0,1,2,3,4].forEach(i=>vax('head',RC,gold,hd[0]+Math.cos(i*1.256)*.13,hd[1]+.17,hd[2]-.04+Math.sin(i*1.256)*.13,.02,.07,.02,0,0,1));
  if(o>=6)bk.forEach(a=>[-1,1].forEach(s=>vax(a[0],RC,glow,s*.08,a[1]+.06,a[2],.025,.14,.025,0,-s*.5,1)));
}
const DEFW={warrior:'gs',paladin:'mace',assassin:'dagger',ranger:'bow',mage:'staff'};
// ---------------- HUD ----------------
function hud_base(){
  const mxh=heroMax(),mm=mpMax(),s=HS(),C=CLS[hero.cls];
  $('orbHf').style.height=Math.max(0,Math.min(100,100*hero.hp/mxh))+'%';$('orbHt').textContent=Math.max(0,Math.round(hero.hp))+'/'+mxh+(hero.sh>0?' ('+Math.round(hero.sh)+')':'');
  if(hero.mp==null)hero.mp=mm;$('orbMf').style.height=Math.min(100,100*hero.mp/mm)+'%';$('orbMt').textContent=Math.floor(hero.mp)+'/'+mm;
  $('lvT').textContent=C.i+' Lv '+hero.lvl+' '+C.n;$('xpB').style.width=(hero.lvl>=MAXLV?100:Math.min(100,100*hero.xp/needH(hero.lvl)))+'%';$('xpT').textContent=hero.lvl>=MAXLV?'Max level':'Lv '+hero.lvl+' · '+hero.xp+' / '+needH(hero.lvl)+' XP';
  $('goldT').textContent='🪙 '+gold;
  const slot=(x,ic,kb,cd,mx,sub,dim,tt)=>`<button class="hs" data-x="${x}" title="${tt||''}" ${cd>0?'disabled':''} ${dim?'style="opacity:.5"':''}><span class="ic">${ic}</span><span class="kb">${kb}</span><span class="sb">${sub||''}</span><span class="cdv" style="height:${mx?Math.min(100,100*cd/mx):0}%"></span></button>`;
  const dsh=Math.floor(hero.dc||0);
  $('acts').innerHTML=(slot('a',{melee3:'⚔️',melee4:'🗡️',bow:'🏹',staff:'🪄'}[C.atk],'LMB',0,0,'')+heroSkills().map((k,i)=>{const lk=hero.lvl<k.lv,c=hero.cd['s'+i]||0;return slot(i,lk?'🔒':k.i,i+1,c,k.cd,lk?'Lv'+k.lv:k.mp+'mp',lk||hero.mp<k.mp,k.n+' — '+k.d)}).join('')+slot('d','💨','Shift',dsh<1?1-((hero.dc||0)%1):0,1,'×'+dsh)+slot('p','🧪','Q',hero.cdP||0,9,'×'+pots));
  const bs=enemies.find(e=>e.boss&&!e.dead&&e.agg&&e.m.position.distanceTo(pl.position)<30);
  $('boss').classList.toggle('hide',!bs||!!tgt);if(bs){$('bossN').textContent=bs.c.n+' · Lv '+bs.c.l;$('bossB').style.width=Math.max(0,100*bs.c.h/M(bs.c))+'%'}
  $('areaT').textContent=areaName();
  $('act').innerHTML=party.slice(0,2).map((c,i)=>`<div class="ach${c.emp?' emp':''}"><span class="ic">${em(c)}</span><div class="ai"><b>${(c.tr=='Universal'?'✦ ':'')+c.n} Lv${c.l}${c.evo?' '+'✦'.repeat(c.evo):''}</b><span class="meter sm"><i style="width:${Math.max(0,100*c.h/M(c))}%"></i><span>${Math.max(0,Math.round(c.h))}/${M(c)}</span></span></div>${c.h<=0?`<button data-rv="${i}" class="rvb" title="Revive: costs 25% of your max health">💗</button>`:`<button data-e="${i}" title="Empower (${i?'R':'E'})">⚡</button>`}</div>`).join('');
  const now=performance.now(),tp=tpFree();
  $('buffs').innerHTML=(tp?`<span class="bf tpn" title="Spend talent points">✦ ${tp} talent point${tp>1?'s':''} · K</span>`:'')+hero.buffs.filter(b=>b.t>now).map(b=>`<span class="bf" title="${b.n}">${b.i||'✨'} ${Math.ceil((b.t-now)/1000)}s</span>`).join('')+(hero.sh>0?`<span class="bf" title="Shield">🛡️ ${Math.round(hero.sh)}</span>`:'')+(restBonus()>0?`<span class="bf" title="Well Rested">🛏️ +${Math.round(restBonus()*100)}% XP</span>`:'');
}
function tgtHud(){
  const e=tgt;if(!e)return;const mx=M(e.c),hp=Math.max(0,Math.ceil(e.c.h)),gap=e.c.l-hero.lvl,en=EN[e.c.en]||{};
  $('tgN').textContent=(e.boss?'☠ ':e.c.al?'Elite ':'')+(e.c.n||e.c.g[0]);$('tgL').innerHTML=`<span style="color:${gap>=5?'#ff4a3a':gap>=2?'#ff9a4a':gap<=-5?'#8a8a8a':'#f0cc72'}">Lv ${e.c.l}${gap>=5?' ☠':''}</span>`;
  $('tgB').style.width=Math.max(0,Math.min(100,100*e.c.h/mx))+'%';$('tgH').textContent=hp+' / '+mx;
  const st=[e.enr?'🔥 Enraged':'',e.stun>0?'💫 Stunned':'',e.root>0?'🕸️ Rooted':'',e.ch>0?'🐌 Slowed':'',e.wk>0?'💔 Weakened':'',e.mark>0?'☠️ Marked':'',...(e.dots||[]).map(d=>({burn:'🔥 Burning',poison:'🧪 Poisoned',bleed:'🩸 Bleeding'})[d.k])].filter(Boolean),s=$('tgS');
  if(e.atk&&e.atk.ph==0){s.className='tgs warn';s.textContent='⚠ '+(MVN[e.atk.n]||e.atk.n)+' incoming — dodge!'}
  else{s.className='tgs';s.textContent=st.length?st.join(' · '):gap>=5?'Far too strong for you — your hits barely land':(en.mt=='m'?'Magic attacker':'Physical attacker')+' · '+(MSET[e.c.g[0]]||[]).map(n=>MVN[n]||n).join(' · ')}
}
Object.assign(MVN,{strike:'Strike',throw:'Throw',bolt:'Bolt',rainfire:'Fire Rain'});
