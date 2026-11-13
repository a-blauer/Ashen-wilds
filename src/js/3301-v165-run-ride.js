// ================= v165 The Sandstorm Run — riding the Sandskimmer =================
// Board the finished Sandskimmer in the salt-cutters' yard (3292): you come down the slipway onto the course (3300) in a sandstorm.
//  * Solo: Cheddar drives (an autopilot that keeps to the course, picks a lane round the boulders, spires, sand traps and
//    erupting worms, boosts on the straights) and you man the twin cannons: the turret follows the mouse, hold the left button to
//    fire (shells burst on what they hit). Two players: one drives (W/S throttle and brake, A/D steer, Shift boost), the other
//    shoots. More: more machines, two to a machine (3305 sorts the crews; an odd one out gets Cheddar as driver).
//  * The hull (V.hp, its bar at the top) takes knocks from walls, rocks and spires, sand traps (they grip the runners: gun it
//    out), clinging scarabs, scorpion stings and worms (3302). Wrecked, the run starts again from the last checkpoint (a quarter,
//    half, three quarters: each also patches the hull). Reaching the cave at the end takes you into the Den (the run is done for
//    good: from then on the Skimmer in the yard rides straight there).
//  * While riding: no walking, dodging, abilities, mounts or recall; the camera rides behind the machine; the hero stands on the
//    turret (or sits at the helm). 🏳 on the bar turns back to the yard.
var SR165={on:false,ph:'',V:[],me:null,cp:0,tries:0,t:0,g:null,err:0,obs:[],cam:null,hud:null,ft:0,foes:[]};
function sr165In(){try{const I=spIns(pl.position.x,pl.position.z);return !!I&&I.sp==='sandrun'}catch(_){return false}}
function sr165Here(){return SR165.on&&sr165In()}
// ---------------- the level dressing (once) ----------------
function sr165Build(){if(SR165.g)return SR165.g;const P=sr165Path(),g=new THREE.Group();g.name='SandRun';scene.add(g);SR165.g=g;const rn=dkRng(16591);
  // the hazards
  SR165.obs=sr165Obs().map(o=>Object.assign({},o));const traps=[];
  g.add(lgGroup('SR165|obs',q=>{dt168Up(q);SR165.obs.forEach((o,i)=>{const y=GH(o.x,o.z);if(o.k=='rock'){for(let c=0;c<3;c++){const a=c*2.1+o.ry,rr=c?o.r*.55:0,s=c?o.r*.6:o.r;q.p('','dod','c',c%2?0x9a7a58:0xb08a60,o.x+Math.cos(a)*rr,y+s*.55,o.z+Math.sin(a)*rr,s,s*.85,s,o.ry+c,c*.7,0)}}
    else if(o.k=='trap')traps.push(o)})},.12));
  SR165.obs.forEach(o=>{if(o.k!=='spire')return;const m=lgGroup('SR165|spire',q=>{dt168Up(q);for(let c=0;c<4;c++){const a=c*1.6,rr=c?.5:0,h=c?1.6+c*.4:3.6;q.p('','cone','c',c%2?0xf0e8e0:0xe0d4c8,Math.cos(a)*rr,h/2,Math.sin(a)*rr,c?.5:.85,h,c?.5:.85,(c?.25:0)*Math.cos(a),0,(c?.25:0)*Math.sin(a))}},.12);
    m.position.set(o.x,GH(o.x,o.z),o.z);m.rotation.y=o.ry;m.scale.setScalar(o.r);g.add(m);o.mesh=m});
  // sand traps: a sunken swirl that turns
  const tm=new THREE.MeshBasicMaterial({map:sr165SwirlTex(),transparent:true,depthWrite:false,fog:true});SR165.trapM=[];
  traps.forEach(o=>{const m=new THREE.Mesh(new THREE.CircleGeometry(o.r+.6,24),tm);m.rotation.x=-Math.PI/2;m.position.set(o.x,GH(o.x,o.z)+.06,o.z);m.userData.lpsSkip=1;g.add(m);SR165.trapM.push(m)});
  // the checkpoints: banner poles either side of the course
  g.add(lgGroup('SR165|cps',q=>{dt168Up(q);sr165CPs().slice(1).forEach(s=>{[-1,1].forEach(sd=>{const [x,z]=P.at(s,sd*(SR165C.hw-.8)),y=GH(x,z);q.L('','c',0x5a3e24,[x,y,z],[x,y+5.5,z],.09,.07,5);
      const [x2,z2]=P.at(s+1.2,sd*(SR165C.hw-.8));q.p('','box','c',0xc84a2a,(x+x2)/2,y+4.6,(z+z2)/2,.05,1.4,1.2,0,P.yaw(s),0);q.p('','sph','c',0xd8a840,x,y+5.6,z,.14,.14,.14)})})},.1));
  // bones of old caravans and half-buried wrecks along the edges
  g.add(lgGroup('SR165|deco',q=>{dt168Up(q);for(let s=30;s<P.S-30;s+=9+rn()*14){const sd=rn()<.5?-1:1,o=sd*(SR165C.hw-.5+rn()*2.5),[x,z]=P.at(s,o),y=GH(x,z),r=rn();
      if(r<.3){for(let k=0;k<6;k++){const a=k*.5;q.L('','c',0xe8e0d0,[x+k*.5,y,z],[x+k*.5+Math.cos(a)*.3,y+1.2,z+.6],.06,.03,4)}q.p('','sph','c',0xe8e0d0,x-.6,y+.3,z,.4,.3,.5)}
      else if(r<.5){q.p('','box','c',0x6a4a2a,x,y+.3,z,2.2,.5,1.0,.2,rn()*3,.3);q.L('','c',0x5a3e24,[x,y,z],[x+.4,y+2.4,z+.2],.07,.05,5)}
      else q.p('','dod','c',0xa88458,x,y+.4,z,1.2+rn(),1+rn()*.6,1.2+rn(),rn(),rn()*3,0)}},.12));
  // the cave of the Den at the end: a mouth in the cliff, fangs of rock round it, a dull red glow inside
  {const s=P.S,[x,z]=P.at(s+2,0),y=GH(x,z),yaw=P.yaw(s);const c=new THREE.Group();c.position.set(x,y,z);c.rotation.y=yaw;g.add(c);SR165.cave=c;
    c.add(lgGroup('SR165|cave',q=>{dt168Up(q);for(let k=0;k<=12;k++){const a=k/12*Math.PI,r=6.5;q.p('','dod','c',k%2?0x5a3a28:0x6a4a30,Math.cos(a)*r,Math.sin(a)*r*1.1,1.5,2.2,2.0,2.4,k,k,0)}
      q.p('','box','c',0x0a0605,0,3.4,2.4,11.5,7.4,.6);for(let k=0;k<7;k++){const xx=-4.5+k*1.5;q.p('','cone','c',0xd8ccb0,xx,7.0-Math.abs(xx)*.25,1.0,.35,1.6,.35,Math.PI,0,0)}
      for(let k=0;k<5;k++)q.p('','dod','c',0x4a3020,(k-2)*5.4,9+(k%2)*3,3,4,4,3,k,0,0)},.1));
    const gl=new THREE.Mesh(new THREE.CircleGeometry(4,16),new THREE.MeshBasicMaterial({color:0xff5a2a,transparent:true,opacity:.35,fog:false}));gl.position.set(0,3.2,2.1);gl.rotation.y=Math.PI;c.add(gl)}
  // the storm: dust sheets drifting across the view
  SR165.dust=[];const dm=new THREE.MeshBasicMaterial({map:sr165DustTex(),transparent:true,opacity:.35,depthWrite:false,fog:false,side:THREE.DoubleSide});
  for(let k=0;k<10;k++){const m=new THREE.Mesh(new THREE.PlaneGeometry(26,10),dm);m.userData.lpsSkip=1;g.add(m);SR165.dust.push({m,ph:k*.7,o:(Math.random()-.5)*30})}
  return g}
function sr165SwirlTex(){if(SR165.swT)return SR165.swT;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),gr=x.createRadialGradient(64,64,4,64,64,64);gr.addColorStop(0,'rgba(60,36,20,.95)');gr.addColorStop(.6,'rgba(120,84,50,.7)');gr.addColorStop(1,'rgba(200,160,110,0)');
  x.fillStyle=gr;x.fillRect(0,0,128,128);x.strokeStyle='rgba(40,24,12,.55)';x.lineWidth=3;for(let k=0;k<5;k++){x.beginPath();for(let t=0;t<1;t+=.02){const a=t*Math.PI*3+k*1.26,r=6+t*52;x.lineTo(64+Math.cos(a)*r,64+Math.sin(a)*r)}x.stroke()}
  const t=new THREE.CanvasTexture(c);return SR165.swT=t}
function sr165DustTex(){const c=document.createElement('canvas');c.width=128;c.height=64;const x=c.getContext('2d');for(let i=0;i<60;i++){const g=x.createRadialGradient(0,0,0,0,0,1);x.save();x.translate(Math.random()*128,20+Math.random()*24);x.scale(14+Math.random()*24,5+Math.random()*8);
    g.addColorStop(0,'rgba(200,150,100,.16)');g.addColorStop(1,'rgba(200,150,100,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,1,0,7);x.fill();x.restore()}return new THREE.CanvasTexture(c)}
// ---------------- the machines ----------------
function sr165Veh(id,drv,gun){const R=svRig();sk165Build(R);svRest(R);try{svMerge(R)}catch(_){}R.root.rotation.order='YXZ';const m=new THREE.Group();m.add(R.root);scene.add(m);
  const V={id,R,m,x:0,z:0,y:0,h:0,v:0,hp:100,hpM:100,bst:1,boost:0,s:0,thr:0,st:0,drv,gun,aY:0,aP:0,fT:0,alt:0,trap:0,bump:0,lane:0,laneT:0,wreck:0,rec:[0,0],cling:[],chd:null};
  if(drv==='chd'){try{const C=chd132Model({game:true});C.root.scale.setScalar(CHQ132_SC*1.15);R.J.seatD.add(C.root);C.root.position.set(0,-.1,0);C.setPose&&C.setPose('idle');V.chd=C}catch(e){console.warn('v165 cheddar seat',e)}}
  return V}
function sr165Place(V,s,o){const P=sr165Path(),[x,z]=P.at(s,o||0);V.x=x;V.z=z;V.h=P.yaw(s);V.v=0;V.s=s;V.trap=0;V.boost=0;V.lane=o||0;sr165Pose(V,0,performance.now())}
function sr165Seat(V,j){const p=new THREE.Vector3();V.m.updateMatrixWorld(true);V.R.J[j].getWorldPosition(p);return p}
// ---------------- driving: the physics (dt), shared by the player, Cheddar and partners' machines ----------------
function sr165Drive(V,dt){}
// the machine's look from its state: on the ground, tilted with it, bobbing, the fan, the jet, the dust
function sr165Pose(V,dt,now){}
function sr165SpireGone(o){if(o.mesh)o.mesh.visible=false;try{sk146Debris(new THREE.Vector3(o.x,GH(o.x,o.z)+1.2,o.z),new THREE.MeshStandardMaterial({color:0xf0e8e0,roughness:.4,flatShading:true}),10,.2,5,6,1.4)}catch(_){}
}
function sr165Hurt(V,d,why){if(V.wreck||SR165.ph!=='run')return;if(typeof CHEAT!='undefined'&&CHEAT.god&&V===SR165.me)d*=0;V.hp=Math.max(0,V.hp-d);V.m.flT=performance.now();
  if(d>=6&&V===SR165.me){shake(Math.min(.4,d*.02));popT(gY(V.m.position,3),'-'+Math.round(d),'#ffb070')}if(V.hp<=0)sr165Wreck(V)}
// ---------------- Cheddar at the helm: keep to the course, pick a clear lane, boost on the straights ----------------
function sr165Auto(V,dt){}
// ---------------- the player at the helm ----------------
function sr165Input(V){}
function sr165Aim(V,dt){}
function sr165Fire(V,own){}
function sr165Burst(p,own){}
// every foe a shell can hit (3302 fills it: scarabs, scorpions, worms): {p (Vector3), r, hit(k)}
function sr165Foes(){return typeof sr165FoeList=='function'?sr165FoeList():[]}
// ---------------- starting, wrecking, checkpoints, the end ----------------
function sr165Start(own){if(SR165.on||SR165.going||!SS165.c3.built)return;if(own&&typeof co165RunAsk=='function'&&co165RunAsk())return;sr165Go([{id:'v0',drv:'chd',gun:'me'}])}
// crews: [{id, drv:'chd'|'me'|peer, gun:'me'|peer|null}], one for each machine
function sr165Go(crews){if(SR165.going||SR165.on)return;SR165.going=1;SR165.crews=crews;fadeTo(()=>{SR165.going=0;try{sr165Build();SR165.V.forEach(V=>scene.remove(V.m));SR165.V=crews.map(c=>sr165Veh(c.id,c.drv,c.gun));SR165.V.forEach(V=>V.netT=performance.now());SR165.me=SR165.V.find(V=>V.drv==='me'||V.gun==='me')||SR165.V[0];
    SR165.on=true;SR165.cp=0;SR165.tries=0;SR165.cam={y:camYaw,p:camPitch,d:camDist};sr165Reset(0);
    setTimeout(()=>{try{zt116Show(ZT116.Z[3],'Searing Sands · Main Quest','The Sandstorm Run','Ride through the storm to the Den of Ssith’ra',typeof sr227Hint=='function'?sr227Hint(SR165.me):SR165.me.drv==='me'?'W/S throttle · A/D steer · Shift boost':'Hold the left button to fire · the turret follows your aim','z3')}catch(_){}},200)}catch(e){console.error('v165 run go',e);SR165.on=false}})}
function sr165Reset(cp){const P=sr165Path(),s=sr165CPs()[cp]||0;SR165.ph='intro';SR165.t=0;SR165.V.forEach((V,i)=>{if(V.placed&&typeof co165Sim=='function'&&typeof co151On=='function'&&co151On()&&!co165Sim(V))return;V.placed=1;sr165Place(V,s+2-i*9,(i%2?-1:1)*(i?3:0));V.hp=V.hpM;V.wreck=0;V.bst=1;V.cling.length=0;V.aY=0});
  SR165.obs.forEach(o=>{o.gone=0;if(o.mesh)o.mesh.visible=true});if(typeof sr165FoesReset=='function')sr165FoesReset();const V=SR165.me;toPos(V.x,V.z,V.h+Math.PI);SR165.t0=cp?1.2:3.2;
  if(V.drv==='chd'&&!cp)setTimeout(()=>say(typeof SKR227!='undefined'&&SKR227.on?'🐭 Cheddar: “The storm is right behind us! You steer and shoot — I’ll keep the turbine alive!”':'🐭 Cheddar: “Hold on to something! I’ll steer — you keep those bugs off us!”'),600)}
function sr165Wreck(V){if(V.wreck)return;V.wreck=1;V.v=0;const p=V.m.position.clone();p.y+=1.5;burst(p,0xff8a3a,60,4,3,.8);burst(p,0x3a3028,40,2,4,1.4);svSnd('roar',.6,.6);shake(.5);
  if(V!==SR165.me)return;   // another machine still runs: they carry on (co-op: 3305 brings the wrecked crew along)
  SR165.ph='wreck';SR165.t=0;SR165.tries++;try{zt116Show(ZT116.Z[3],'Searing Sands · Main Quest','Wrecked!','The storm swallows the Sandskimmer','Back to the last checkpoint','z3')}catch(_){}}
function sr165Win(){if(SR165.ph==='win')return;SR165.ph='win';SR165.t=0;SS165.run.st=1;SS165.trkK='';if(typeof co165RunWin=='function')co165RunWin();
  say('🛷 The Sandskimmer shoots out of the storm into the shadow of the cliff — the cave of the Den gapes ahead.');
  fadeTo(()=>{sr165End();const N=INSL[insG(3,3)];insArrive(N);insMark(N);setTimeout(()=>{try{zt116Show(ZT116.Z[3],'Searing Sands · Main Quest','The Den of Ssith’ra','You leave the Sandskimmer at the mouth of the cave','','z3');mSfx('victory')}catch(_){}},400)})}
function sr165End(){SR165.on=false;SR165.ph='';if(typeof sr165FoesReset=='function')sr165FoesReset();SR165.V.forEach(V=>scene.remove(V.m));SR165.V=[];SR165.me=null;sr165Hud();
  if(SR165.cam){camYaw=SR165.cam.y;camPitch=SR165.cam.p;camDist=SR165.cam.d;SR165.cam=null}}
function sr165Leave(quiet){const was=SR165.on;sr165End();if(!quiet||was)fadeTo(()=>{const T=ss165T3(),[x,z]=T.F.W2(T.cr.a-5,2.5);toPos(x,z,T.F.yaw+Math.PI)});else{const T=ss165T3(),[x,z]=T.F.W2(T.cr.a-5,2.5);toPos(x,z)}}
// ---------------- the tick ----------------
function sr165Tick(dt,now){if(!SR165.on)return;if(!sr165In()){if(SR165.ph!=='win')sr165End();return}const P=sr165Path();SR165.t+=dt;const me=SR165.me;
  if(SR165.ph==='intro'&&SR165.t>SR165.t0){SR165.ph='run';say('🌪️ Into the storm!')}
  if(SR165.ph==='wreck'){if(SR165.t>2.6){fadeTo(()=>{sr165Reset(SR165.cp)})}SR165.ph=SR165.t>2.6?'wait':'wreck'}
  const run=SR165.ph==='run';
  SR165.V.forEach(V=>{V.fT=Math.max(0,V.fT-dt);if(!run){V.thr=0;V.st=0;V.boost=0;sr165Pose(V,dt,now);return}
    const sim=typeof co165Sim=='function'?co165Sim(V):(V.drv==='me'||V.drv==='chd');
    if(!sim){if(V.net)sr165NetPose(V,dt,now);else sr165Pose(V,dt,now);return}
    if(V.drv==='chd')sr165Auto(V,dt);else sr165Input(V);sr165Drive(V,dt)});
  if(me){if(me.gun==='me'){sr165Aim(me,dt);if(run&&atkHeld)sr165Fire(me,true)}else if(me.gun==null&&me.drv==='me')sr165Aim(me,dt);
    // the hero rides: on the turret (gunner) or at the helm (driver)
    const seat=sr165Seat(me,me.gun==='me'?'seatG':'seatD');pl.position.copy(seat);pl.rotation.y=me.gun==='me'?me.h+me.aY:me.h;
    // the camera behind the machine
    let d=(me.h+Math.PI)-camYaw;d=Math.atan2(Math.sin(d),Math.cos(d));camYaw+=d*Math.min(1,dt*2.6);camDist+=(12-camDist)*Math.min(1,dt*2);camPitch+=(.6-camPitch)*Math.min(1,dt*2);
    // checkpoints and the end
    const cps=sr165CPs();if(run){for(let k=SR165.cp+1;k<cps.length;k++)if(me.s>=cps[k]){SR165.cp=k;SR165.V.forEach(V=>{V.hp=Math.min(V.hpM,V.hp+30)});say('🚩 Checkpoint '+k+'/3 · the hull is patched up.');svSnd('bell',.7,1.2)}
      if(me.s>=P.S-7&&!me.wreck)sr165Win()}}
  // the storm and the traps
  if(SR165.trapM)SR165.trapM.forEach(m=>m.rotation.z+=dt*1.4);
  if(SR165.dust&&me)SR165.dust.forEach((D,k)=>{D.ph+=dt*.22;const f=(D.ph%1),fx=Math.sin(me.h),fz=Math.cos(me.h),lx=fz,lz=-fx,a=24-f*48,o=D.o;D.m.position.set(me.x+fx*(10+k*3)+lx*a,me.y+2+k%3*2,me.z+fz*(10+k*3)+lz*a);D.m.rotation.y=me.h+Math.PI/2;D.m.material.opacity=.35});
  sr165Hud()}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{sr165Tick(dt,now)}catch(e){if(!SR165.err++)console.warn('v165 run tick',e)}return r}}
// a partner's machine: shown where they say it is (3305 sets V.net = {x,z,h,v,...})
function sr165NetPose(V,dt,now){}
// ---------------- while riding: no walking, dodging, abilities, swings (the left button fires), mounts or recall ----------------
{const f=walk;walk=function(o,dx,dz){if(SR165.on&&o===pl)return;return f.apply(this,arguments)}}
{const f=animHero;animHero=function(now,mv,h){if(SR165.on&&(!h||h===pl))return f.call(this,now,false,h);return f.apply(this,arguments)}}
{const f=dodge;dodge=function(){if(SR165.on)return;return f.apply(this,arguments)}}
{const f=swing;swing=function(){if(SR165.on){const V=SR165.me;if(V&&V.gun==='me'&&SR165.ph==='run')sr165Fire(V,true);return}return f.apply(this,arguments)}}
{const f=cast;cast=function(){if(SR165.on)return;return f.apply(this,arguments)}}
// ---------------- the bar at the top: the hull, the boost, how far ----------------
function sr165Hud(){let h=document.getElementById('sr165H');const V=SR165.me;if(!SR165.on||!V){if(h)h.style.display='none';return}
  if(!h){h=document.createElement('div');h.id='sr165H';h.style.cssText='position:absolute;top:12px;left:50%;transform:translateX(-50%);width:min(460px,74vw);z-index:30;text-align:center;font:600 13px/1.3 inherit;color:#f0e0c0;text-shadow:0 1px 2px #000';
    h.innerHTML='<div><span id="sr165N"></span> <button id="sr165Q" title="Turn back to the yard" style="pointer-events:auto;margin-left:6px;font-size:11px;padding:1px 6px;background:rgba(0,0,0,.45);color:#f0e0c0;border:1px solid rgba(255,220,160,.4);border-radius:3px;cursor:pointer">🏳</button></div>'+
      '<div style="height:9px;margin-top:3px;background:rgba(0,0,0,.6);border:1px solid rgba(255,200,120,.45);border-radius:3px;overflow:hidden"><i id="sr165B" style="display:block;height:100%;width:100%;background:linear-gradient(90deg,#b05a20,#ffc070)"></i></div>'+
      '<div style="display:flex;gap:6px;margin-top:3px"><div style="flex:1;height:4px;background:rgba(0,0,0,.5);border-radius:2px;overflow:hidden"><i id="sr165Bo" style="display:block;height:100%;background:#9ae8ff"></i></div><div style="flex:3;height:4px;background:rgba(0,0,0,.5);border-radius:2px;overflow:hidden"><i id="sr165Pr" style="display:block;height:100%;background:#ffe080"></i></div></div>';
    ($('stage')||document.body).appendChild(h);$('sr165Q').addEventListener('click',()=>{if(SR165.on){say('🏳 You turn the Sandskimmer back to the yard.');sr165Leave()}})}
  h.style.display='';const P=sr165Path();$('sr165N').textContent='🛷 Sandskimmer · hull '+Math.ceil(V.hp)+'%'+(V.drv==='chd'?' · Cheddar drives, you shoot':V.drv==='me'?' · you drive':' · you shoot')+' · checkpoint '+SR165.cp+'/3';
  $('sr165B').style.width=Math.max(0,100*V.hp/V.hpM)+'%';$('sr165Bo').style.width=Math.round(V.bst*100)+'%';$('sr165Pr').style.width=Math.min(100,100*V.s/P.S)+'%'}
