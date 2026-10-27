// ---- vendors, workbench, incubator menus ----
function openShop(w){if(w=='m'){rS();$('shop').classList.remove('hide')}else{rMS();$('mshop').classList.remove('hide')}}
const SPR_=[150,500,1800],SLV=[1,8,20],SRN=['Common','Uncommon','Rare'];
$('mst').onclick=e=>{
  const b=e.target.closest('[data-ms]');if(!b)return;const m=b.dataset.ms,sp=MOVES[m];if(gold<SPR_[sp.r])return say('Not enough gold.');
  gold-=SPR_[sp.r];hero.known.push(m);hero.sl[m]=hero.sl[m]||{l:1,x:0};if(hero.sp.length<4)hero.sp.push(m);
  say('You learned '+m+'!'+(hero.sp.includes(m)?' Press '+(hero.sp.indexOf(m)+1)+' to cast it.':' Equip it in your inventory.'));rMS();hud();
};
$('msClose').onclick=()=>$('mshop').classList.add('hide');
$('prompt').addEventListener('pointerdown',e=>{e.preventDefault();interact()});
function sync(){
  if(!party.length)return;
  for(let i=0;i<2;i++){
    const c=i<actN141()?party[i]:null; // v141: the 2nd companion rests until the Companion Bond is learned
    if(!c){if(fols[i]){scene.remove(fols[i]);fols[i]=null;leadK[i]=''}continue}
    const k=c.n+c.f+c.v+c.g.join()+c.cl.join()+c.tr+'|'+(c.evo||0);if(k==leadK[i])continue;leadK[i]=k;
    const old=fols[i],g=cr(c);g.position.copy(old?old.position:V(pl.position.x-1-i,0,pl.position.z));scene.add(g);if(old)scene.remove(old);fols[i]=g;
  }
}
var G_BAR=null;
function bar(al){
  G_BAR=G_BAR||new THREE.PlaneGeometry(1,.1); // one shared shape; each bar's two materials are freed in removeE
  const g=new THREE.Group(),mb=c=>new THREE.Mesh(G_BAR,new THREE.MeshBasicMaterial({color:c,depthTest:false})),a=mb(0x111111),b=mb(al?0xb04aff:0xc8402e);
  a.renderOrder=5;b.renderOrder=6;b.position.z=.001;g.add(a,b);g.fill=b;if(al)g.scale.setScalar(1.5);scene.add(g);return g;
}
function removeE(e){mCancel(e);scene.remove(e.m,e.hb);if(e.hb&&!e.hb._free){e.hb._free=1;e.hb.children.forEach(o=>o.material&&o.material.dispose())}const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1)}
function dn(p,t,col,dy,ms){const v=gY(p,1).project(cam),s=$('stage'),d=document.createElement('div');d.className='dn';d.textContent=t;d.style.cssText=`left:${(v.x*.5+.5)*s.clientWidth}px;top:${(-v.y*.5+.5)*s.clientHeight+(dy||0)}px;color:${col}${ms?';animation-duration:'+ms/1000+'s':''}`;s.appendChild(d);setTimeout(()=>d.remove(),ms||700)}
function down_base(){
  say('You were struck down. You wake at '+home.n+', healed.');
  hero.hp=heroMax();hero.mp=mpMax();party.forEach(c=>c.h=M(c));pl.position.set(home.sp[0],0,home.sp[1]);snapCam();ui();
}
let last=performance.now();
function loop(now){
  requestAnimationFrame(loop);const rd=now-last;let dt=Math.min(.05,rd/1000);last=now;const pz=uiOpen();
  for(let i=tws.length-1;i>=0;i--){const w=tws[i];if(pz){w.t+=rd;continue}const k=Math.min(1,(now-w.t)/w.ms);w.fn(k);if(k>=1){tws.splice(i,1);w.done&&w.done()}}
  if((pz&&!mpLive())||!party.length||(typeof KQMENU!='undefined'&&KQMENU.on))dt=0;
  const dtR=dt;if(hstop>0){hstop-=rd/1000;dt*=.3}if(slowT>0){slowT-=rd/1000;dt*=.35}
  if(!inited){inited=true;for(let i=0;i<MAXMOB;i++)spawn(true);BOSSES.forEach((_,i)=>spawnBoss(i))}
  // hero movement
  let ax=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0)+dp[0],az=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0)+dp[1];
  if(!ax&&!az&&rmb&&mOn){const rx=mg.x-pl.position.x,rz=mg.z-pl.position.z,rd=Math.hypot(rx,rz);if(rd>.35){ax=rx/rd;az=rz/rd}}
  {const c=Math.cos(camYaw),s2=Math.sin(camYaw),wx=ax*c+az*s2,wz=-ax*s2+az*c;if(!(rmb&&mOn&&!K.w&&!K.a&&!K.s&&!K.d&&!dp[0]&&!dp[1])){ax=wx;az=wz}}
  const al=Math.hypot(ax,az);if(al>0)pl.mvd={x:ax/al,z:az/al,t:now};
  atkCd=Math.max(0,atkCd-dt);for(const k in hero.cd)hero.cd[k]=Math.max(0,hero.cd[k]-dt);hero.iv=Math.max(0,(hero.iv||0)-dt);hero.cdD=Math.max(0,(hero.cdD||0)-dt);hero.cdP=Math.max(0,(hero.cdP||0)-dt);
  if(al>0&&dtR>0){const msp=4.5*Math.max(0,1+HS().mspd)*(hero.chan?.55:1)*(riding?1+riding.spd/100:1);walk(pl,ax/al*msp*dtR,az/al*msp*dtR);if(!pl.sw){let da=Math.atan2(ax,az)-pl.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));pl.rotation.y+=da*Math.min(1,dtR*18)}animHero(now,true)}else animHero(now,false);
  if(pl.step&&dtR>0){walk(pl,pl.step.x*pl.step.sp*dtR,pl.step.z*pl.step.sp*dtR);pl.step.t-=dtR;if(pl.step.t<=0)pl.step=null}
  if(hero.dash){walk(pl,hero.dash.x*14*dtR,hero.dash.z*14*dtR);hero.dash.t-=dtR;burst(gY(pl.position,.3),0xbfd0ff,2,.3,.3,.3);if(hero.dash.t<=0)hero.dash=null}
  if(atkHeld&&dt>0&&!hero.chan)swing();
  pl.position.y=GH(pl.position.x,pl.position.z);
  featTick(dt,now,al);heroTick(dt,now);homeTick(dt,now,al);
  spT-=dt;if(spT<=0){spT=1.5;enemies.slice().forEach(e=>{if(!e.boss&&!e.minion&&!e.ev&&!e.dead&&e.m.position.distanceTo(pl.position)>85&&!mpNear(e.m.position,85))removeE(e)});for(let k=0;k<2&&enemies.length<MAXMOB;k++)spawn();}
  bossT.forEach((t,i)=>{if(t>0){bossT[i]=t-dt;if(bossT[i]<=0)spawnBoss(i)}});
  // ground loot
  for(let i=drops.length-1;i>=0;i--){
    const d=drops[i];d.g.position.y=GH(d.g.position.x,d.g.position.z);d.t-=dt;d.gem.rotation.y+=dt*2;d.gem.position.y=.5+Math.sin(now/300+i)*.08;
    if(Math.hypot(d.g.position.x-pl.position.x,d.g.position.z-pl.position.z)<1.2){take(d);scene.remove(d.g);dropFree(d);drops.splice(i,1)}
    else if(d.t<=0){scene.remove(d.g);dropFree(d);drops.splice(i,1)}
  }
  shotTick(dt);
  // monsters: wander, aggro, attack
  const safeP=townAt(pl.position.x,pl.position.z,0)>=0;const dtAI=dt;aiLodFrame(dtAI);
  enemies.slice().forEach(e=>{
    const m=e.m;m.position.y=GH(m.position.x,m.position.z);if(!e.boss&&!e.dead&&tDist(m.position.x,m.position.z)<TS+1.5){removeE(e);return}const dpl=m.position.distanceTo(pl.position);m.visible=dpl<30;e.hb.visible=m.visible&&!e.dead;
    if(!m.visible&&!mpAct(e)){aiSleep(e,1);return}aiSleep(e,0);if(e.dead)return;
    e.hb.position.set(m.position.x,m.position.y+(e.boss?5.5:e.c.al?2.4:m.isHum?Math.max(1.6,(m.bs||1)*1.62):1.6),m.position.z);e.hb.quaternion.copy(cam.quaternion);
    const r=Math.max(.001,e.c.h/M(e.c));e.hb.fill.scale.x=r;e.hb.fill.position.x=-(1-r)/2;
    const dt=aiLod(e,dpl,dtAI);if(dt<0)return;
    if(eTick(e,dt,now))return;
    let tg=eTarget(e,m,dpl);
    const v=V().subVectors(tg.position,m.position).setY(0),L=v.length();
    e.cd-=dt;e.ch=Math.max(0,e.ch-dt);
    if(e.boss){bossAI(e,dt,now,tg,L,v);return}
    if((e.wv||e.hunt)&&!safeP)e.agg=1;else if(safeP){e.agg=0;if(e.atk)mCancel(e)}else if(L<(e.c.al?6:4.5)&&seeTg(m.position,tg.position))e.agg=1;else if(L>11&&!e.atk)e.agg=0;
    if(e.atk){if(dt>0)mTick(e,dt,now);animC(m,now,!!(e.atk&&e.atk.ph==1&&(e.atk.n=='charge'||e.atk.n=='pounce')),3);return}
    let ux=0,uz=0,sp=0;
    if(e.agg){if(e.ip){m.pose=null;e.ip=0}
      const ms=MSET[e.c.g[0]]||['bite'],pref=e.pref||(e.pref=(EN[e.c.g[0]]||{}).ranged?5:ms.some(n=>n=='bite'||n=='spin'||n=='slam'||n=='strike')?1.3:4.3),slow=e.ch>0?.4:1;
      if(e.cd<=0&&!safeP&&dt>0){const ok=ms.filter(n=>L>=MV[n].rmin&&L<=MV[n].rmax);if(!ok.length&&L<1.7)ok.push('bite');if(ok.length){const pk=ePick(e,ok);if(pk){if(e.ip){m.pose=null;e.ip=0}mStart(e,tg,pk);animC(m,now,false,0);return}}}
      if(L>pref+.35){sp=(e.c.al?2:1.7)*slow;ux=v.x/L;uz=v.z/L}
      else if(pref>2&&L<pref-1.4){sp=1.3*slow;ux=-v.x/L;uz=-v.z/L}
      else if(L>.01){if(!e.sd||Math.random()<dt*.35)e.sd=Math.random()<.5?1:-1;sp=.75*slow;ux=-v.z/L*e.sd;uz=v.x/L*e.sd}
    }
    else{const r_=enemyWander(e,m,dt,now);ux=r_[0];uz=r_[1];sp=r_[2]}
    if(e.agg&&L>.01)m.rotation.y=Math.atan2(v.x,v.z);else if(sp)m.rotation.y=Math.atan2(ux,uz);
    if(!(e.root>0))walkM(m,(ux*sp+e.vx)*dt,(uz*sp+e.vz)*dt);e.vx*=.85;e.vz*=.85;
    animC(m,now,sp>0,sp);
  });
  eshotTick(dt);tgtTick(now,dt);
  compTick(dt,now);
  compSpells(dt);
  const pt0=camPitch,cdd0=(camDist);
  let pTar=pt0,dTar=cdd0;   // v157: walls never move the camera (no tilt-up, no pull-in); whatever stands between it and the hero is cut away instead (2420, 3190)
  camK+=(pTar-camK)*Math.min(1,dt*(pTar>camK?7:2)+.03);
  camDD=(camDD==null?cdd0:camDD);camDD+=(dTar-camDD)*Math.min(1,dt*(dTar<camDD?10:2.2)+.02);const cdd=camDD,pt=camK,cp=V(pl.position.x+Math.sin(camYaw)*Math.cos(pt)*cdd,pl.position.y+1.1+Math.sin(pt)*cdd,pl.position.z+Math.cos(camYaw)*Math.cos(pt)*cdd),lp=V(pl.position.x,pl.position.y+1.0,pl.position.z);
  {const fl=cam157Floor(pl.position,cp);if(fl!=null&&cp.y<fl)cp.y=fl}   // v157: on gentle ground the camera rides above it, smoothly
  cam.position.lerp(cp,Math.min(1,dt*3+.02));look.lerp(lp,Math.min(1,dt*4+.02));{const fl=cam157Floor(pl.position,cam.position);if(fl!=null)cam.position.y=Math.max(cam.position.y,fl-.8)}cam.lookAt(look);if(shk>0){cam.position.x+=(Math.random()-.5)*shk;cam.position.y+=(Math.random()-.5)*shk;shk=Math.max(0,shk-rd/1000*.9)}FADE.cam.value.copy(cam.position);FADE.pl.value.set(pl.position.x,pl.position.y+1.1,pl.position.z);chunkVis();
  torch.position.set(pl.position.x,pl.position.y+2.2,pl.position.z+.3);
  townTick(now,pl.position);
  qualityTick(rd);WIND.t.value=now/1000;atmos(dt,now);pln.constant=-pl.position.y;
  ambient(now);
  fxStep(dt);
  if(now-hudT>200){hudT=now;hud();tgtHud();if(tgt)portraitDraw(now);mini();hatchCheck();promptTick();townWatch();townLights(pl.position);if(!$('inc').classList.contains('hide'))rI()}
  POST.render();
}
requestAnimationFrame(loop);

