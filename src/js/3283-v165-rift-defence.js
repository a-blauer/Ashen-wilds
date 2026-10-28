// ================= v165 Searing Sands II · The Rift: Kheprit calls the way to the Salt Wastes; you hold off the cult =================
//  * "Begin" in his window (3282): Kheprit walks to the rift stones and raises his claws. For a minute (RF165.T) he channels: the runes
//    on the horns light one by one, a swirling rift grows between them, threads of light run from his claws into it.
//  * The Cult of the Endless One feels it: cultists pour in through the three gates, faster as the rift grows. About half of them go
//    for Kheprit (his health is the bar at the top; at zero he falls and the rift collapses: speak with him again to retry), the
//    rest go for you (hit one and it may turn on you instead). Every 12 s he lets out a pulse that throws back whoever is at him.
//  * The rift opens: run! The cult floods in twice as fast and swarms him; he holds the way open as long as he stands (his health
//    drains). Step into the rift to reach the Salt Wastes (III). If he falls first, the rift collapses and you try again.
//  * Leave or die during the defence and it stops; he waits by the altar again.
//  * Come back later (st 4, or III reached): the rift still turns between the horns (it is the way on), Kheprit lies dead beside it,
//    and the court is heaped with the cultists he took with him (RF165.after: ~320 bodies in piles at the gates, round the rift and
//    where he stood).
// Co-op (3285): the host runs the defence (spawns, Kheprit's health) and tells the others; anyone may step through.
var RF165={T:60,E:null,hpM:100,cap:15,err:0,aft:null,sh:null,cult:['ss165zealot','ss165zealot','ss165caller']};
// ---------------- the cult ----------------
HUMLOOK.ss165zealot={skin:[150,112,82],tunic:0x8a3018,cape:[150,60,30],pants:[90,60,36],sc:1.02,head:'mask',wpn:'dagger',wcol:0xd8d0b8};
HUMLOOK.ss165caller={skin:[150,112,82],tunic:0xc8b890,cape:[120,30,20],pants:[110,80,50],sc:1.05,head:'hoodred',wpn:'staff',wcol:0x40e0c0};
EN.ss165zealot={n:'Zealot of the Endless One',e:'🗡️',hum:'ss165zealot',w:{hp:.62,pa:.95,ma:.4,pd:.7,md:.7},mt:'p',moves:['strike','spin','charge'],fam:'Earth'};
EN.ss165caller={n:'Salt Caller',e:'🧂',hum:'ss165caller',w:{hp:.55,pa:.4,ma:1.0,pd:.6,md:1.0},mt:'m',moves:['bolt','rainfire'],ranged:1,fam:'Spirit'};
MSET.ss165zealot=EN.ss165zealot.moves;MSET.ss165caller=EN.ss165caller.moves;
S.ss165zealot=S.ss165zealot||{e:'🗡️',c:0x8a3018,h:'X',t:'x',hp:20,a:8,d:5};S.ss165caller=S.ss165caller||{e:'🧂',c:0xc8b890,h:'X',t:'x',hp:20,a:8,d:5};
try{ROLEK.ss165caller='caster'}catch(_){}
// ---------------- the rift between the horns (a swirl that grows from nothing to the full arch) ----------------
function rf165Rift(){if(RF165.sh)return RF165.sh;const G=CY165.riftG;if(!G)return null;
  const M=new THREE.ShaderMaterial({uniforms:{t:{value:0},k:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float t,k;varying vec2 vU;void main(){vec2 p=vU*2.-1.;float r=length(p);if(r>1.||k<.002)discard;float a=atan(p.y,p.x);float R=k;'+
      'float s1=sin(a*5.+r*9.-t*3.)*.5+.5,s2=sin(a*3.-r*14.+t*2.2)*.5+.5,s3=sin(a*9.+t*1.3-r*4.)*.5+.5;'+
      'vec3 c=mix(vec3(.05,.03,.07),vec3(.2,.85,.75),s1*.55+s2*.3*(1.-r));c=mix(c,vec3(.95,.92,.85),smoothstep(.5,0.,r/R)*k*.55*(.7+.3*s3));'+
      'float rim=pow(max(0.,1.-abs(r-R*.97)*9.),3.);c+=vec3(1.,.78,.35)*rim*1.2;float al=smoothstep(R,R-.12,r)*(.55+.45*s1)+rim;gl_FragColor=vec4(c,clamp(al,0.,1.));}'});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(5.6,7.4),M);m.position.set(0,4.0,.05);m.userData.lpsSkip=1;m.renderOrder=3;G.add(m);
  return RF165.sh={m,M}}
function rf165RiftK(k,t){const R=rf165Rift();if(!R)return;R.M.uniforms.k.value=k;R.M.uniforms.t.value=t;R.m.visible=k>.002;if(CY165.runeM)CY165.runeM.opacity=Math.min(1,k*1.6)}
// the rift's centre and how far along / across it something stands (local to the court's frame)
function rf165In(x,z){const T=ss165T2(),[a,b]=T.F.L2(x,z);return a>T.rift.a-1.3&&a<T.rift.a+1.2&&Math.abs(b)<2.4}
function rf165KhSpot(){const T=ss165T2(),[x,z]=T.F.W2(T.kh.a,T.kh.b);return {x,z,y:T.y0}}
// ---------------- start / stop ----------------
function rf165Start(own){const C=SS165.c2,K=KH165W.e;if(RF165.E||C.st!==2||!K||!K.sv.alive)return false;
  if(own&&typeof co151On=='function'&&co151On()&&!co151Host()){if(typeof co165Ask=='function')co165Ask('rf');return false}
  RF165.E={t:0,hp:RF165.hpM,go:0,sp:1.5,pulse:9,esc:0,et:0,said:{},list:[],fx:0};const E=RF165.E;
  try{zt116Show(ZT116.Z[3],'Searing Sands · Main Quest','The Rift','Hold the cult back while Kheprit opens the way','','z3')}catch(_){}
  say('🐜 Kheprit strides to the rift stones and lifts his claws. The runes begin to wake… and from the gates comes the howl of the cult.');svSnd('bell',.9,.6);
  if(own!==false&&typeof co165Rift=='function')co165Rift('start');SS165.trkK='';return true}
// ends the defence: 'won' (through the rift) · 'fall' (Kheprit fell) · 'quiet' (left, died)
function rf165Stop(why,keep){const E=RF165.E;if(!E)return;RF165.E=null;SS165.trkK='';const K=KH165W.e;rf165Hud();
  const melt=s=>{if(s.dead)return;burst(gY(s.m.position,.8),0xc8a070,16,1.6,1.6,.6);try{removeE(s)}catch(_){}};
  enemies.slice().forEach(s=>{if(s.rf165){if(why==='fall')qs165After(.6+Math.random()*1.6,()=>melt(s));else melt(s)}});
  if(why==='won')return;
  rf165RiftK(0,0);
  if(why==='fall'&&K){svStart(K,'fall',3);say('💀 Kheprit falls — the rift gutters and collapses. The cult howls and melts back into the sand.');
    qs165After(6,()=>{if(!KH165W.e||RF165.E)return;svStart(KH165W.e,'rise',4);say('🐜 Sand pours into Kheprit’s cracks and he drags himself up again. Speak with him to try once more.')})}
  if(!keep)SS165.c2.st=2;if(K&&why!=='fall'){K.sv.alive=1;svEndMove(K,true)}}
// ---------------- the cult pours in ----------------
function rf165Spawn(n){const T=ss165T2(),I=ss165I(1),lv=(I.lv&&I.lv[1])||20;for(let i=0;i<n;i++){const g=T.gates[Math.floor(Math.random()*T.gates.length)],[x,z]=T.F.W2(g.a+(g.a<0?2.2:0)+(Math.random()-.5)*1.6,g.b+(g.b<0?2.2:g.b>0?-2.2:0)+(Math.random()-.5)*1.6);
    const k=RF165.cult[Math.floor(Math.random()*RF165.cult.length)];let e=null;try{e=spawnEnemy(k,x,z,lv-1+Math.floor(Math.random()*3),{agg:1})}catch(err){if(!RF165.err++)console.error('v165 cultist',err)}if(!e)continue;
    e.rf165=1;e.agg=1;e.hunt=1;e.rfK=k==='ss165zealot'&&Math.random()<.62?1:0;e.rfP=new THREE.Object3D();e.rfP.rf165K=1;burst(gY(e.m.position,.6),0xc8a070,14,1.4,1.4,.5)}}
function rf165Alive(){let n=0;enemies.forEach(e=>{if(e.rf165&&!e.dead)n++});return n}
// ---------------- the tick ----------------
function rf165Tick(dt,now){const E=RF165.E,t=now/1000;
  if(!E){if(!RF165.aft&&CY165.g&&KH165W.built&&(SS165.c2.st>=4||ss165Done(2)))kh165Sync();if(RF165.aft)RF165.aft.visible=ss165Here(1);if(RF165.aft&&ss165Here(1)){rf165RiftK(1,t);rf165Enter()}return}
  // co-op: a partner's defence ends when the host says so; the host's when nobody in the court is standing (or it left)
  {const co=typeof co151On=='function'&&co151On();if(!ss165Here(1)){rf165Stop('quiet');if(co&&co151Host()&&typeof co165Rift=='function')co165Rift('quiet');return}
    if(co?(co151Host()&&!co151Standing()):hero.hp<=0){rf165Stop('quiet');if(co&&typeof co165Rift=='function')co165Rift('quiet');return}}
  const K=KH165W.e,host=typeof co151On!='function'||!co151On()||co151Host(),S=K&&K.sv;if(!K){rf165Stop('quiet');return}
  // he walks to the stones, then channels
  if(!E.go){const P=rf165KhSpot(),dx=P.x-K.m.position.x,dz=P.z-K.m.position.z,L=Math.hypot(dx,dz);if(L>.15){const st=Math.min(L,dt*2.2);K.m.position.x+=dx/L*st;K.m.position.z+=dz/L*st;K.m.position.y=P.y;S.spd=2;K.m.rotation.y=Math.atan2(dx,dz)}
    else{E.go=1;S.spd=0;const T=ss165T2();K.m.rotation.y=Math.atan2(T.F.fx,T.F.fz);svStart(K,'chan',5);S.chg=1;svSnd('charge',.8,.5)}}
  else E.t+=dt;
  const k=Math.min(1,E.t/RF165.T);rf165RiftK(E.esc?1:k*.92,t);
  // threads of light from his claws into the rift
  if(E.go&&Math.random()<dt*24){const a=new THREE.Vector3();try{(S.R.J[Math.random()<.5?'wrL':'wrR']||K.m).getWorldPosition(a)}catch(_){a.copy(K.m.position)}const G=CY165.riftG,b=new THREE.Vector3(0,4,0);G.localToWorld(b);b.x+=(Math.random()-.5)*2*k;b.y+=(Math.random()-.5)*3*k;
    burst(a.clone().lerp(b,Math.random()),0x60f0d0,1,.3,.3,.4)}
  // the pulse
  if(E.go){E.pulse-=dt;if(E.pulse<=0){E.pulse=12;const p=K.m.position;ring(p,0x60f0d0,4.8,600);burst(gY(p,1),0x60f0d0,40,3,1.5,.6);svSnd('gong',.5,1.4);
    enemies.forEach(s=>{if(!s.rf165||s.dead)return;const dx=s.m.position.x-p.x,dz=s.m.position.z-p.z,L=Math.hypot(dx,dz);if(L<4.8&&L>.01){s.vx+=dx/L*9;s.vz+=dz/L*9;try{eStatus(s,{stun:1.2},0,'h')}catch(_){}}})}}
  // the cult (host only)
  if(host&&E.go){E.sp-=dt;const cap=E.esc?RF165.cap+7:RF165.cap;if(E.sp<=0){const alive=rf165Alive();E.sp=E.esc?.55:2.4-1.5*k;if(alive<cap)rf165Spawn(Math.min(cap-alive,E.esc?3:1+Math.floor(Math.random()*(1+k*2.2))))}}
  // words while he works
  [[.25,'🐜 Kheprit: “The way is stubborn… keep them from me!”'],[.5,'🐜 Kheprit: “Half-way. I can see the salt beyond.”'],[.8,'🐜 Kheprit: “Almost… almost!”']].forEach(([q,s])=>{if(k>=q&&!E.said[q]){E.said[q]=1;say(s)}});
  // the rift opens: run
  if(!E.esc&&k>=1){E.esc=1;SS165.c2.st=3;SS165.trkK='';svSnd('roar',.6,.5);shake(.35);burst(gY(CY165.riftG.position,4),0xffe0a0,80,5,3,1);
    try{zt116Show(ZT116.Z[3],'Searing Sands · Main Quest','The Rift Is Open','Run through before the cult overwhelms him','','z3')}catch(_){}
    say('🌀 Kheprit: “It is open! Go — GO! I will hold it as long as I stand!”');if(typeof co165Rift=='function'&&host)co165Rift('open')}
  if(E.esc&&host){E.et+=dt;E.hp-=dt*(1.6+E.et*.12);if(!E.said.esc2&&E.et>14){E.said.esc2=1;say('🐜 Kheprit: “I cannot hold them much longer…!”')}}
  if(host&&E.hp<=0){E.hp=0;if(typeof co165Rift=='function')co165Rift('fall');rf165Stop('fall');return}
  if(E.esc)rf165Enter();
  rf165Hud()}
// step into the open rift
function rf165Enter(){const p=pl.position;if(hero.hp<=0||!rf165In(p.x,p.z))return;if(RF165.ent&&performance.now()-RF165.ent<3000)return;RF165.ent=performance.now();
  const first=SS165.c2.st<4;if(first){SS165.c2.st=4;SS165.trkK='';rf165Stop('won',true);if(typeof co165Credit=='function')co165Credit('c2')}svSnd('whoosh',1,.6);
  try{insGo(ss165I(2))}catch(e){console.error('v165 rift go',e)}
  if(first)setTimeout(()=>{try{zt116Show(ZT116.Z[3],'Searing Sands · Main Quest','The Salt Wastes','The rift spits you out onto blinding salt','','z3')}catch(_){}},900)}
// ---------------- his health at the top of the screen ----------------
function rf165Hud(){const E=RF165.E;let h=document.getElementById('rf165H');if(!E){if(h)h.style.display='none';return}
  if(!h){h=document.createElement('div');h.id='rf165H';h.style.cssText='position:absolute;top:14px;left:50%;transform:translateX(-50%);width:min(440px,72vw);z-index:30;pointer-events:none;text-align:center;font:600 13px/1.3 inherit;color:#f0e0c0;text-shadow:0 1px 2px #000';
    h.innerHTML='<div id="rf165N"></div><div style="height:9px;margin-top:3px;background:rgba(0,0,0,.6);border:1px solid rgba(96,240,208,.45);border-radius:3px;overflow:hidden"><i id="rf165B" style="display:block;height:100%;width:100%;background:linear-gradient(90deg,#2a9a8a,#9af0d8);transition:width .15s"></i></div><div style="height:4px;margin-top:2px;background:rgba(0,0,0,.5);border-radius:2px;overflow:hidden"><i id="rf165R" style="display:block;height:100%;width:0;background:linear-gradient(90deg,#c89020,#ffe080)"></i></div>';($('stage')||document.body).appendChild(h)}
  h.style.display='';$('rf165N').textContent=E.esc?'🌀 The rift is open — run through it! · Kheprit':'🐜 Kheprit · opening the rift '+Math.round(Math.min(1,E.t/RF165.T)*100)+'%';$('rf165B').style.width=Math.max(0,100*E.hp/RF165.hpM)+'%';$('rf165R').style.width=Math.min(100,100*E.t/RF165.T)+'%'}
// ---------------- hooks: half the cult goes for Kheprit ----------------
{const f=eTarget;eTarget=function(e,m,dpl){if(e&&e.rf165&&e.rfK&&RF165.E&&KH165W.e){const K=KH165W.e.m.position,dx=m.position.x-K.x,dz=m.position.z-K.z,L=Math.hypot(dx,dz)||1;e.rfP.position.set(K.x+dx/L*1.15,K.y,K.z+dz/L*1.15);return e.rfP}return f.apply(this,arguments)}}
{const f=hitTarget;hitTarget=function(e,tg,mult,mt){if(tg&&tg.rf165K){const E=RF165.E,K=KH165W.e;if(!E||!K)return;if(typeof co151On=='function'&&co151On()&&!co151Host())return;const d=1.9*(mult||1);E.hp-=d;
    K.m.flT=performance.now();burst(gY(K.m.position,1.4),0xc8a878,8,1.2,1.2,.4);dn(gY(K.m.position,2.4),Math.round(d*10)/10+'','#ffb070');return}return f.apply(this,arguments)}}
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.rf165&&e.rfK&&!dot&&Math.random()<.35)e.rfK=0;return f.apply(this,arguments)}}
// recall during the defence: allowed (it just ends it)
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{rf165Tick(dt,now)}catch(e){if(!RF165.err++)console.warn('v165 rift tick',e)}return r}}
// ---------------- afterwards: the rift still turning, Kheprit dead beside it, the cult heaped round the court ----------------
function rf165After(){const T=ss165T2(),F=T.F;if(!CY165.g)return;if(RF165.aft){RF165.aft.visible=true;return}const g=new THREE.Group();g.name='WardenAfter';CY165.g.add(g);RF165.aft=g;
  // Kheprit, dead, slumped against the left horn
  try{const R=svRig();kh165Build(R);svRest(R);svMerge(R);KH165.pose(R.root,R,'dead');const [x,z]=F.W2(T.rift.a-2.4,-3.9);R.root.position.set(x,T.y0,z);R.root.rotation.y=F.yaw+Math.PI*.62;g.add(R.root);RF165.deadR=R}catch(e){console.error('v165 dead warden',e)}
  // the bodies (one baked group: ~320 robed figures in heaps)
  g.add(lgGroup('RF165|bodies',q=>{const rn=dkRng(16531),y0=T.y0,rob=[0x5a2216,0x4a1c12,0x6a2c1c,0x8a7a5e,0x7a6a50,0x3a1a10],skin=0x6a4a34,dark=0x2a1a10,blade=0xb8b0a0;
    const one=(a,b,y,yaw,tilt)=>{const [x,z]=F.W2(a,b),c=rob[Math.floor(rn()*rob.length)],fx=Math.sin(yaw),fz=Math.cos(yaw),lx=Math.cos(yaw),lz=-Math.sin(yaw),P=(f,l,h)=>[x+fx*f+lx*l,y+h+f*tilt,z+fz*f+lz*l];
      let p=P(0,0,.17);q.p('','box','c',c,p[0],p[1],p[2],.5,.3,.82,tilt,yaw,0);
      p=P(.56,0,.18);q.p('','sph','c',rn()<.5?0xd8d0b8:c,p[0],p[1],p[2],.17,.16,.19);
      const sa=(rn()-.5)*1.6;[-1,1].forEach(s=>{p=P(-.62,s*.13,.12);q.p('','box','c',rn()<.5?c:dark,p[0],p[1],p[2],.16,.14,.62,0,yaw+s*.12,0);
        p=P(.1+(s>0?sa*.2:0),s*.38,.12);q.p('','box','c',c,p[0],p[1],p[2],.13,.12,.55,0,yaw+s*(.5+rn()*.9),0)});
      if(rn()<.3){p=P(.2,(rn()<.5?-1:1)*.75,.05);q.p('','box','c',blade,p[0],p[1],p[2],.05,.03,.75,0,yaw+rn()*3,0)}};
    const heap=(a,b,n,r)=>{for(let i=0;i<n;i++){const ang=rn()*Math.PI*2,rr=Math.sqrt(rn())*r,lay=Math.max(0,1-rr/r);one(a+Math.cos(ang)*rr,b+Math.sin(ang)*rr,y0+.02+lay*lay*(.25+n*.022)+rn()*.06,rn()*Math.PI*2,(rn()-.5)*.35*lay)}};
    // round where he stood and the rift (the thickest), at each gate, along the ways between, scattered over the court
    heap(T.kh.a-1.2,0,46,4.2);heap(T.rift.a-2.2,3.2,26,2.6);heap(T.rift.a-2.6,-1.6,14,1.8);
    T.gates.forEach(G=>{const [ga,gb]=[G.a+(G.a<0?2.6:0),G.b+(G.b<0?2.6:G.b>0?-2.6:0)];heap(ga,gb,30,3.0)});
    for(let i=0;i<12;i++){const ang=rn()*Math.PI*2,rr=5+rn()*(T.R-7.5);heap(Math.cos(ang)*rr,Math.sin(ang)*rr,4+Math.floor(rn()*7),1.4)}
    for(let i=0;i<70;i++){const ang=rn()*Math.PI*2,rr=4.6+rn()*(T.R-6);one(Math.cos(ang)*rr,Math.sin(ang)*rr,y0+.02,rn()*Math.PI*2,0)}
    // dark stains under the heaps, dropped blades and torn banners
    [[T.kh.a-1.2,0,5],[T.rift.a-2.2,2.4,3.2]].concat(T.gates.map(G=>[G.a+(G.a<0?2.6:0),G.b+(G.b<0?2.6:G.b>0?-2.6:0),3.4])).forEach(([a,b,r])=>{const [x,z]=F.W2(a,b);q.p('','cyl','c',0x3a1a10,x,y0+.075,z,r,.01,r*.85,0,rn()*3,0)});
    for(let i=0;i<10;i++){const ang=rn()*Math.PI*2,rr=5+rn()*(T.R-7),[x,z]=F.W2(Math.cos(ang)*rr,Math.sin(ang)*rr);q.p('','box','c',0x5a3a22,x,y0+.08,z,.05,.05,2.4,0,rn()*3,0);q.p('','box','c',0x8a3018,x+.3,y0+.09,z+.2,.7,.02,.9,0,rn()*3,0)}},0));
  rf165RiftK(1,0)}
SS165L.unshift(()=>{if(RF165.E)rf165Stop('quiet',true)});
SS165L.push(()=>{if(RF165.aft&&!(ss165Done(2)||SS165.c2.st>=3)){RF165.aft.parent&&RF165.aft.parent.remove(RF165.aft);RF165.aft=null;rf165RiftK(0,0)}});
// the tracker's rift line reads RF165.E.t / RF165.T (3270)
