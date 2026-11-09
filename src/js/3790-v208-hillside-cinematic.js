// ================= v208: Hillside Crest's arrival cinematic =================
// Owner (Nov 9 2026): "Add a cinematic for Hillside crest when you first enter it. The same voice from the intro will be the
// voice speaking to you now … While the dialogue is going showcase different instances within hillside crest, creatures, quest
// objectives, and then a menacing preview of the sovereign."
// The first time a hero arrives anywhere in Hillside Crest (insArrive, zone 1) the voice of the intro speaks over a tour of the
// zone, drawn in the real world like the intro's part two (3081): the main loop waits (IC151.on), hc208Frame(t) moves the game's
// own camera, and every frame is a pure function of t (tests seek it: hc208Cap / hc208Seek).
//   0  the hero at the entrance of Hillside Crest I, the camera rises over the plains
//   1  an Abeksi war camp on the plains of I · 2 the serpent city's sacrificial shrine (chant, kneelers, idol) · 3 its jewellers' stalls
//   4  the Hilltop Ascent's mountain · 5 the Gate of the Hydra (III), pushing in on the stone door
//   6–8 "Stealth, agility and strength": a sentry and its view cone in Abeksi, a ride up the Ascent's ledge toward a
//      broken stretch, the Galecliffs' creatures stalking toward the camera (no text on screen but the voice)
//   9  the Sovereign's Den: the Hydra rises out of the mere and roars, then a hard cut to black and the game fades back in
// The subtitles are the intro's voice (the same letters drifting out of a blur, the same glitch); the score is the intro's
// voice drone and far choir in a darker key, a toll at each cut, the Hydra's own hiss and roar.
// Seen once per character (saved as x2.hc208). Saves from before v208 that already went past Hillside Crest I count as seen.
// Skip: the button, Esc, Enter or Space. Off when the intro is turned off (SET.intro 0) and under test automation unless
// window.KQ_HC208. Co-op: every player sees it on their own first arrival (nothing is shared or relayed: it is local, like the
// intro); while it plays that player's game waits, presence keeps going out so partners don't drop them.
var HC208={seen:0,run:false,S:null,len:37.4,skipT:35.0,cut:35.0,
  lines:[{a:3.4,b:6.4,s:'The Abeksi occupy this land.'},
    {a:7.0,b:12.0,s:'Their ritual magic is an abomination… and their culture is vain.'},
    {a:12.6,b:15.4,s:'They have cities in the mountains,'},
    {a:15.8,b:20.2,s:'and seal their God behind an ancient stone gate.'},
    {a:20.8,b:27.8,s:'Stealth, agility and strength are needed here, Upright.'},
    {a:29.2,b:32.9,s:'Bring me the Hydra’s essence.'}],
  // shot start times (each runs to the next); the den shot runs to HC208.cut
  T:[0,3.4,7.4,9.9,12.3,15.9,21.0,23.4,25.8,28.4],
  // no on-screen text but the voice (owner, Nov 9: "only have the visuals … focus on the dialogue"): no chapter or Sovereign cards
  rise:[29.7,31.9],roar:31.6};
function hc208Want(I){try{if(!I||I.z!==1||HC208.seen||HC208.run)return false;if(typeof IC151!='undefined'&&IC151.run)return false;
  if(window.KQ_HC208)return true;if(window.AW_NOTITLE||navigator.webdriver)return false;if(typeof SET!='undefined'&&SET.intro===0)return false;return true}catch(_){return false}}

// ---------------- set-up: everything the shots need, made once when it starts ----------------
function hc208Build(){const V=THREE.Vector3,S={si:-1,lt:null,t:0,props:[]};
  S.H=pl.position.clone();S.yaw=pl.rotation.y;S.fx=[];S.near0=cam.near;
  // Abeksi (built here if the hero has not been inside yet; 3155 hides it again once the game runs)
  try{S.ab=ab152Build();S.abI=S.ab.I}catch(e){console.warn('hc208 city',e);S.ab=null}
  if(S.ab){const A=S.ab.acts;S.abSave=A.map(a=>({a,st:a.st,sus:a.sus,u:a.u,v:a.v,yaw:a.yaw}));
    // the stealth shot: a watcher on open ground (the fountain's sentry first) and a clear spot low beside it that sees it
    const G=S.ab.G,pick=[A.find(a=>a.id=='b2'||(a.g&&a.g.userData.ab152=='b2'))].concat(A.filter(a=>a.role=='sentry'),A.filter(a=>a.role=='lantern'&&!a.o.sweep)).filter(Boolean);
    for(const a of pick){const h=a.home||a,yw=a.yaw;for(const [f,sd] of [[-4.4,2.4],[-4.4,-2.4],[-5.4,1.2],[-5.4,-1.2],[-3.6,3.4],[-3.6,-3.4],[-6.2,0]]){const fu=Math.sin(yw),fv=Math.cos(yw),cu=h.u+fu*f+fv*sd,cv=h.v+fv*f-fu*sd;
        if(ab152Cls(G,cu,cv)===0&&ab152LOS(G,cu,cv,h.u,h.v,false)){S.lamp=a;S.lampC=[cu,cv,h.u,h.v];break}}if(S.lamp)break}}
  // an Abeksi war camp in I, the one nearest the entrance: three warriors posed at its fire (the camp's own, wherever they wander, are hidden meanwhile)
  try{const cs=CAMPS.filter(C=>C.ig===5).sort((a,b)=>Math.hypot(a.x-S.H.x,a.z-S.H.z)-Math.hypot(b.x-S.H.x,b.z-S.H.z)),C=cs[0];
    if(C){S.camp={x:C.x,z:C.z};const I5=INSL[5],nx=C.x-(I5.x0+I5.w/2),nz=C.z-(I5.y0+I5.h/2),nl=Math.hypot(nx,nz)||1;S.camp.fx=nx/nl;S.camp.fz=nz/nl;
      S.campE=(typeof enemies!='undefined'?enemies:[]).filter(e=>!e.dead&&!e.boss&&e.m&&e.m.visible&&Math.hypot(e.m.position.x-C.x,e.m.position.z-C.z)<16);
      {const sx=-S.camp.fz,sz=S.camp.fx;[['nagaw',-.6,-2.4,.4],['nagaa',.6,2.0,-.3],['nagaw',-2.6,.2,.1]].forEach(([k,f,d,ry])=>{if(!EN[k])return;const m=cr(enemyC(k,10,{}));m.scale.setScalar(m.bs||1);
          const x=C.x+S.camp.fx*f+sx*d,z=C.z+S.camp.fz*f+sz*d;m.position.set(x,GH(x,z),z);m.rotation.y=Math.atan2(S.camp.fx,S.camp.fz)+ry;m.userData.hcP=[x,GH(x,z),z,m.rotation.y];m.visible=false;scene.add(m);S.props.push(m);S.campM=(S.campM||[]).concat(m)})}
      // the camera's spot: on the camp's outer side, with a clear view of the fire (no tent or fence in front of the lens)
      const V=THREE.Vector3,tg=new V(C.x-S.camp.fx*.6,GH(C.x,C.z)+1.3,C.z-S.camp.fz*.6),rc=new THREE.Raycaster();S.camp.cp=null;
      for(const r of [11,9.5,8,6.5])for(const a of [0,.45,-.45,.9,-.9]){if(S.camp.cp)break;const ca=Math.cos(a),sa=Math.sin(a),dx=S.camp.fx*ca-S.camp.fz*sa,dz=S.camp.fz*ca+S.camp.fx*sa,x=C.x+dx*r,z=C.z+dz*r,o=new V(x,GH(x,z)+2.4,z);
        const L=o.distanceTo(tg);let ok=true;if(C.g)for(const da of [0,.22,-.22]){const d=tg.clone().sub(o).normalize().applyAxisAngle(new V(0,1,0),da);rc.set(o,d);rc.far=L-1.2;if(rc.intersectObject(C.g,true).length){ok=false;break}}
        if(ok)S.camp.cp=[x,z,tg.x,tg.y,tg.z]}}}catch(e){console.warn('hc208 camp',e)}
  // the Hilltop Ascent
  try{S.asc=ch153Build();S.ap=ch153Path()}catch(e){console.warn('hc208 ascent',e);S.asc=null}
  // the Gate of the Hydra
  try{const D=hd154Plan().door;S.door={x:D.x,z:D.z,fx:-D.ux,fz:-D.uz}}catch(e){const I=INSL[7];S.door={x:I.ba[0],z:I.ba[1],fx:1,fz:0}}
  try{const G=SP152.gates.hydra;if(G&&!G.spot){G.spot=G.where?G.where():sp152GateSpot(G.ig);G.g=G.build(G.spot);G.spot.built=1}S.gate=G&&G.g?G:null}catch(e){console.warn('hc208 gate',e);S.gate=null}
  // the Galecliffs' creatures (III): three of them stalk down the road toward the camera
  try{const I=INSL[7],P=I.path,j=Math.max(2,Math.floor(P.length*.42)),a=P[j],b=P[Math.min(P.length-1,j+12)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;
    S.cr={x:a[0],z:a[1],fx:dx/L,fz:dz/L};const sx=-dz/L,sz=dx/L;
    [['basilisk',8.5,-1.6,1.15],['snapper',10.5,2.3,1.0],['basilisk',13.5,.2,.95]].forEach(([k,f,s,sp],i)=>{if(!EN[k])return;const m=cr(enemyC(k,16,{}));
      m.scale.setScalar(m.bs||1);m.visible=false;m.userData.hc208=1;scene.add(m);S.props.push(m);
      (S.mons=S.mons||[]).push({m,x:a[0]+dx/L*f+sx*s,z:a[1]+dz/L*f+sz*s,sp,ph:i*.7})})}catch(e){console.warn('hc208 creatures',e)}
  // the Crest Hydra: the den's own Sovereign (spawned at load and idle until a fight starts); a copy only if there is none
  const D8=INSL[8];S.den={x:D8.ba[0],z:D8.ba[1]};const nx=D8.en[0]-S.den.x,nz=D8.en[1]-S.den.z,nl=Math.hypot(nx,nz)||1;S.den.nx=nx/nl;S.den.nz=nz/nl;
  try{let e=(typeof enemies!='undefined'?enemies:[]).find(e=>e.boss&&e.ar===1&&!e.dead&&e.sv);
    const busy=e&&(e.sv.mv||(typeof AF!='undefined'&&AF&&AF.i===1));
    if(e&&!busy){const s=e.sv;S.hyd={e,own:false,save:{p:e.m.position.clone(),ry:e.m.rotation.y,vis:e.m.visible,trk:s.trk,tt:s.tt,aw:s.aw}};S.den.x=e.m.position.x;S.den.z=e.m.position.z}
    else if(!e){const m=new THREE.Group();m.position.set(S.den.x,GH(S.den.x,S.den.z),S.den.z);scene.add(m);const f={m,dead:false,bs:{ph:1}};svMake(f,1);S.hyd={e:f,own:true}}
    else S.hyd={e,own:false,busy:true}}catch(e){console.warn('hc208 hydra',e);S.hyd=null}
  return S}

// ---------------- the shots: camera p, look l, fov, focus F (which instance draws), per shot i at local k 0..1 ----------------
function hc208Cam(S,i,k,t){const V=THREE.Vector3,Io=ic151Io,Sm=ic151Sm,g=(x,z,dy)=>new V(x,GH(x,z)+(dy||0),z);let p,l,fov=48,F=null;
  if(i===0){const H=S.H,fw=new V(Math.sin(S.yaw),0,Math.cos(S.yaw)),sd=new V(fw.z,0,-fw.x),q=Io(ic151K(k,.3,1)),d=.4*k;
    p=H.clone().addScaledVector(fw,-3.1-d+8*q).addScaledVector(sd,1.0-.5*q).add(new V(0,1.75+14*q,0));l=H.clone().addScaledVector(fw,6).add(new V(0,1.3,0)).lerp(H.clone().addScaledVector(fw,55).add(new V(0,2,0)),Sm(ic151K(k,.25,1)));fov=46+6*q;F=H}
  else if(i===1&&S.camp){const C=S.camp,q=Sm(k),c=C.cp||[C.x+C.fx*11,C.z+C.fz*11,C.x,GH(C.x,C.z)+1.3,C.z],tx=c[2],tz=c[4],u=.28*q;
    p=g(c[0]+(tx-c[0])*u,c[1]+(tz-c[1])*u,2.4-.4*q);l=new V(tx,c[3],tz);fov=46;F=g(C.x,C.z,0)}
  else if(i===2&&S.ab){const I=S.abI,X=I.x0,Y=I.y0,q=Sm(k);p=g(X+61-2.6*q,Y+20.4-2.2*q,2.4-.5*q);l=g(X+57.5,Y+9,2.2+.3*q);fov=44;F=l}
  else if(i===3&&S.ab){const I=S.abI,X=I.x0,Y=I.y0,q=Sm(k);p=g(X+117.4+1.6*q,Y+38.5+4.5*q,2.1);l=g(X+125,Y+46,1.4);fov=46;F=l}
  else if(i===4&&S.asc){const P=S.ap,a=-.95+.32*Sm(k),r=150-8*Sm(k),cx=P.cx+Math.cos(a)*r,cz=P.cz+Math.sin(a)*r,lx=P.cx+Math.cos(a)*20,lz=P.cz+Math.sin(a)*20;
    p=new V(cx,GH(cx,cz)+38+5*Sm(k),cz);l=new V(lx,GH(lx,lz)*.72,lz);fov=54;F=new V(P.cx,0,P.cz)}
  else if(i===5){const D=S.door,sx=-D.fz,sz=D.fx,q=Io(k);p=g(D.x+D.fx*(36-12*q)+sx*(3.4-2.4*q),D.z+D.fz*(36-12*q)+sz*(3.4-2.4*q),2.4+2.2*q);l=g(D.x,D.z,7.2+.8*q);fov=46;F=g(D.x+D.fx*6,D.z+D.fz*6,0)}
  else if(i===6&&S.ab&&S.lamp){const I=S.abI,a=S.lamp,C=S.lampC,q=Sm(k),cu=C[0]+(C[2]-C[0])*.15*q,cv=C[1]+(C[3]-C[1])*.15*q,fy=a.yaw+(a.hy||0);
    p=g(I.x0+cu,I.y0+cv,1.75);l=g(I.x0+a.u+Math.sin(fy)*2.6,I.y0+a.v+Math.cos(fy)*2.6,.7);fov=52;F=g(I.x0+a.u,I.y0+a.v,0)}
  else if(i===7&&S.asc){const P=S.ap,s=50+15*k,a=P.at(s-2.8,.6),b=P.at(s+13,0);p=new V(a[0],a[2]+2.3,a[1]);l=new V(b[0],b[2]+.5,b[1]);fov=58;F=new V(b[0],0,b[1])}
  else if(i===8&&S.cr){const C=S.cr,sx=-C.fz,sz=C.fx,q=Sm(k);p=g(C.x+sx*.6-C.fx*.6*q,C.z+sz*.6-C.fz*.6*q,.8);const m=S.mons&&S.mons[0];l=m?g(m.cx,m.cz,1.5):g(C.x+C.fx*10,C.z+C.fz*10,1.5);fov=46;F=g(C.x+C.fx*6,C.z+C.fz*6,0)}
  else if(i===9){const D=S.den,c=g(D.x,D.z,0),sx=-D.nz,sz=D.nx;F=c;
    if(t<HC208.roar+.35){const q=Sm(ic151K(t,HC208.T[9],HC208.roar+.35));p=c.clone().add(new V(D.nx*(27-6*q)+sx*(4-5*q),1.3+.6*q,D.nz*(27-6*q)+sz*(4-5*q)));l=c.clone().add(new V(0,2.6+3.4*Sm(ic151K(t,HC208.rise[0],HC208.rise[1])),0));fov=46}
    else{const q=Sm(ic151K(t,HC208.roar+.35,HC208.cut)),h=S.hc||c.clone().add(new V(0,6,0));p=c.clone().add(new V(D.nx*(13.5-2*q)+sx*2.4,1.1,D.nz*(13.5-2*q)+sz*2.4));l=h.clone().lerp(c.clone().add(new V(0,h.y-c.y,0)),.5).add(new V(0,-.8,0));fov=54-5*q}}
  if(!p){p=S.H.clone().add(new THREE.Vector3(0,6,6));l=S.H.clone();F=S.H}
  return {p,l,fov,F}}

// ---------------- each frame ----------------
function hc208Shot(t){const T=HC208.T;let i=0;while(i<T.length-1&&t>=T[i+1])i++;const b=i<T.length-1?T[i+1]:HC208.cut;return {i,k:Math.max(0,Math.min(1,(t-T[i])/(b-T[i])))}}
function hc208Focus(F,fn){const sv=pl.position.clone();try{pl.position.set(F.x,GH(F.x,F.z),F.z);fn()}finally{pl.position.copy(sv)}}
function hc208Frame(S,t){const now=3e6+t*1000,dt=Math.max(0,Math.min(.1,S.lt==null?0:t-S.lt));S.lt=t;const sh=hc208Shot(t),i=sh.i;
  const city=S.ab&&(i===2||i===3||i===6),asc=S.asc&&(i===4||i===7);
  (S.campM||[]).forEach(m=>{m.visible=i<=1;if(i===1)try{animC(m,now,false,0)}catch(_){}const q=m.userData.hcP;if(q){m.position.set(q[0],q[1],q[2]);m.rotation.set(0,q[3],0)}});(S.campE||[]).forEach(e=>{e.m.visible=i>1});
  if(S.ab){const R=S.ab;R.root.visible=!!city;R.lights.forEach(L=>{L.lt.intensity=city?L.i0:0});R.acts.forEach(a=>{if(a.lt)a.lt.intensity=city?(a.o.sweep?2.2:1.1):0})}
  if(S.asc)S.asc.root.visible=!!asc;
  if(S.gate){S.gate.g.visible=i===5||i===8;if(i===5)try{const H=HD154.S;H.heads.forEach((h,j)=>{const f=ic151Sm(ic151K(t,17.0+j*.55,17.5+j*.55));h.m.visible=f>0;h.halo.visible=f>0;const s=(2.0+.9*f+.2*Math.sin(t*3+j))*f;h.halo.scale.set(s,s,1);h.m.scale.setScalar(Math.max(.01,f))})}catch(_){}}
  (S.mons||[]).forEach(o=>o.m.visible=i===8);
  // the city's folk keep to their routines (no eyes: nothing here can see the hero)
  const c0=hc208Cam(S,i,sh.k,t);
  if(city){const R=S.ab,I=R.I,fu=c0.F.x-I.x0,fv=c0.F.z-I.y0;try{ab152WorldTick(dt,now)}catch(_){}
    R.acts.forEach(a=>{const d=Math.hypot(a.u-fu,a.v-fv),near=d<34;try{if(near&&dt>0){a.t+=dt;ab152Routine(a,dt);a.hy+=(a.ht*.6-a.hy)*Math.min(1,dt*4)}ab152ActPose(a,now,dt,near)}catch(_){}
      if(a.cone){a.cone.visible=i===6&&near&&d<18;if(a.cone.visible)try{ab152ConeTick(a,I,R.G,false);const U=a.cone.material.uniforms;U.op.value=Math.max(U.op.value,.34)}catch(_){}}if(a.mark)a.mark.visible=false})}
  // the creatures stalk toward the camera
  if(i===8&&S.mons){const C=S.cr,u=t-HC208.T[8];S.mons.forEach(o=>{const w=Math.max(0,u-o.ph*.4)*o.sp;o.cx=o.x-C.fx*w;o.cz=o.z-C.fz*w;o.m.position.set(o.cx,GH(o.cx,o.cz),o.cz);
    o.m.rotation.y=Math.atan2(-C.fx,-C.fz);try{animC(o.m,now,u>o.ph*.4,o.sp*1.6)}catch(_){try{if(o.m.rig)o.m.rig(now,true,o.sp)}catch(_){}}})}
  // the Hydra: under the mere, rising, the roar
  if(S.hyd&&!S.hyd.busy){const e=S.hyd.e,s=e.sv,D=S.den;if(s){const rk=ic151Oc(ic151K(t,HC208.rise[0],HC208.rise[1])),y0=GH(D.x,D.z);
      e.m.visible=i===9;e.m.position.set(D.x,y0-8.5*(1-rk),D.z);e.m.rotation.y=Math.atan2(D.nx,D.nz);
      if(t>=HC208.roar){s.trk=s.B.M.intro.trk;s.tt=Math.min(2.8,t-HC208.roar);s.aw=1}else{s.trk=null;s.tt=0;s.aw=0}
      if(i===9){const keep=KQ.fx;KQ.fx=S.fx;try{svApply(e,dt,now);kqFxTick(dt)}catch(_){}finally{S.fx=KQ.fx;KQ.fx=keep}}
      try{s.R.eyeG.color.setHex(0xf4ff70);const j=s.R.J.hC;if(j){e.m.updateMatrixWorld(true);S.hc=j.getWorldPosition(S.hc||new THREE.Vector3())}}catch(_){}}}
  if(i===9&&S.hyd&&!S.hyd.busy){const ev=(k,a,fn)=>{if(!S.ev[k]&&t>=a){S.ev[k]=1;if(t<a+.5)try{fn()}catch(_){}}};const c=new THREE.Vector3(S.den.x,GH(S.den.x,S.den.z),S.den.z);
    ev('h0',HC208.rise[0]-.2,()=>svSnd('hiss',.6,.55));ev('sp',HC208.rise[0]+.6,()=>burst(gY(c,.2),0xbfe8e0,60,4,4,.7));ev('h1',HC208.roar+.3,()=>svSnd('hiss',.8,.6));
    ev('ro',HC208.roar+1.55,()=>{svSnd('roar',1,1.1);svSnd('shriek',.5,.8);burst(gY(c,.2),0xbfe8e0,50,4,4,.7)})}
  // the camera, a shake on the roar
  const c=c0,sk=i===9?.16*Math.max(0,1-Math.abs(t-(HC208.roar+1.75))/.9):0;
  if(sk>0){c.p.x+=(ic151H(t*40)-.5)*sk;c.p.y+=(ic151H(t*43+1)-.5)*sk;c.l.x+=(ic151H(t*37+2)-.5)*sk*1.6}
  c.p.y=Math.max(c.p.y,GH(c.p.x,c.p.z)+.45);
  if(i===4){if(S.farr0==null)S.farr0=FARR;FARR=Math.max(S.farr0,240);cam.near=1.5}else{if(S.farr0!=null){FARR=S.farr0;S.farr0=null}cam.near=S.near0}
  cam.position.copy(c.p);cam.up.set(0,1,0);cam.lookAt(c.l);cam.fov=c.fov;cam.updateProjectionMatrix();if(typeof look!='undefined')look.copy(c.l);
  // draw only the instance being shown; settle its sky and fog on the first frame of a shot
  const F=c.F;hc208Focus(F,()=>{try{chunkVis()}catch(_){}
    try{if(S.si!==i){for(let n=0;n<40;n++)atmos(.05,now)}else atmos(dt,now)}catch(_){}
    try{townLights(F)}catch(_){}});
  S.si=i;WIND.t.value=now/1000;try{torch.position.set(F.x,GH(F.x,F.z)+2.2,F.z+.3)}catch(_){}
  try{FADE.cam.value.copy(cam.position);FADE.pl.value.copy(cam.position)}catch(_){}try{fxStep(dt)}catch(_){}
  if(!HC208.noDraw)POST.render()}

// ---------------- the page layer: letterbox, the voice's subtitles, the den's dark, fades, skip ----------------
function hc208Css(){if(document.getElementById('hc208css'))return;ic151Css();ic151DCss();const s=document.createElement('style');s.id='hc208css';s.textContent=
  '#hc208{position:fixed;inset:0;z-index:2147483000;overflow:hidden;cursor:none;user-select:none;pointer-events:auto;background:transparent}'+
  '#hc208 .lb{position:absolute;left:0;right:0;height:11vh;background:#000;z-index:3;pointer-events:none}#hc208 .lb.t{top:0}#hc208 .lb.b{bottom:0}'+
  '#hc208 .fk{position:absolute;inset:0;background:#000;z-index:4;pointer-events:none}'+
  '#hc208 .vg{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 30%,rgba(4,12,6,.55) 68%,rgba(0,4,2,.92) 100%)}'+
  '#hc208 .sub{position:absolute;left:6%;right:6%;bottom:17vh;text-align:center;z-index:5;pointer-events:none;font-family:"IM Fell English SC","Cinzel Decorative",Georgia,serif;font-size:clamp(20px,3.2vw,44px);letter-spacing:.06em;color:#fff;line-height:1.2}'+
  '#hc208 .sub span{display:inline-block;white-space:pre;text-shadow:0 0 3px rgba(10,16,50,.95),0 0 14px rgba(14,24,70,.85),-2px 0 rgba(90,200,255,.6),2px 0 rgba(255,120,220,.5)}'+
  '#hc208 .skip{position:absolute;right:22px;bottom:calc(11vh + 14px);z-index:6;cursor:pointer;background:rgba(10,8,16,.45);color:#e8e0d0;border:1px solid rgba(232,224,208,.35);border-radius:4px;font:600 13px/1 "Cinzel Decorative",Georgia,serif;letter-spacing:.08em;padding:8px 14px;opacity:.7}'+
  '#hc208 .skip:hover{opacity:1;background:rgba(30,24,40,.7)}';document.head.appendChild(s)}
function hc208Layer(S){hc208Css();const el=document.createElement('div');el.id='hc208';
  el.innerHTML='<div class="vg"></div><div class="lb t"></div><div class="lb b"></div><div class="sub"></div><div class="fk"></div><button class="skip">Skip ›</button>';
  document.body.appendChild(el);S.dom={el,lt:el.querySelector('.lb.t'),lb:el.querySelector('.lb.b'),sub:el.querySelector('.sub'),vg:el.querySelector('.vg'),fk:el.querySelector('.fk'),skip:el.querySelector('.skip'),cur:null,sp:[]}}
function hc208Dom(S,t){const D=S.dom;if(!D)return;const K=ic151K,Sm=ic151Sm;
  // letterbox: in from the start, out as the game comes back
  const lb=(11*(1-Sm(K(t,HC208.cut+.5,HC208.len-.3))))+'vh';D.lt.style.height=lb;D.lb.style.height=lb;
  // black: out of black at the start, a hard cut on the roar's end, back out of black into the game
  D.fk.style.opacity=(t<HC208.cut?1-K(t,0,1.2):1-K(t,HC208.cut+.25,HC208.cut+1.6)).toFixed(3);
  const dk=t>=HC208.T[9]&&t<HC208.cut?Sm(K(t,HC208.T[9],HC208.T[9]+1)):0;D.vg.style.opacity=dk.toFixed(3);
  try{const c=ren.domElement;if(dk>0){c.style.transition='none';c.style.filter='brightness('+(1-.42*dk).toFixed(3)+') saturate('+(1-.2*dk).toFixed(3)+') contrast('+(1+.18*dk).toFixed(3)+') hue-rotate('+(-12*dk).toFixed(1)+'deg)'}else if(c.style.filter)c.style.filter=''}catch(_){}
  // the voice (the intro's subtitles: letters drift in out of a blur, the line breathes and glitches)
  const L=HC208.lines.find(x=>t>=x.a-.1&&t<x.b+.6);if(L!==D.cur){D.cur=L;D.sub.innerHTML='';if(L){D.sp=[];L.s.split(/( )/).forEach(w=>{if(!w)return;let box=D.sub;if(w!==' '){box=document.createElement('span');box.className='w';D.sub.appendChild(box)}for(const ch of w){const e=document.createElement('span');e.textContent=ch;box.appendChild(e);D.sp.push(e)}})}}
  if(L){const out=K(t,L.b,L.b+.6);D.sp.forEach((e,i)=>{const k=K(t,L.a+i*.045,L.a+i*.045+.55),fr=Math.floor(t*14),gl=ic151H(fr*1.7+i*3.1)>.93?1:0,jx=(ic151H(fr+i*.7)-.5)*2.4*(1+gl*3),jy=(ic151H(fr*1.3+i)-.5)*1.6;
    e.style.opacity=(k*(1-out)*(.85+.15*Math.sin(t*7+i))).toFixed(3);e.style.filter='blur('+((1-k)*7+out*6+gl*1.5).toFixed(2)+'px)';e.style.transform='translate('+jx.toFixed(2)+'px,'+(jy+(1-k)*8).toFixed(2)+'px) scale('+(1+(1-k)*.25).toFixed(3)+')'})}
  D.skip.style.visibility=t<HC208.skipT?'':'hidden'}

// ---------------- sound: the voice's drone and choir (a darker key than the intro's), tolls on the cuts ----------------
function hc208Score(ac,out,T0){const T=x=>T0+x,G=v=>{const g=ac.createGain();g.gain.value=v||0;return g};
  const rv=ac.createConvolver(),IR=ac.createBuffer(2,ac.sampleRate*3.4,ac.sampleRate);for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.4)}rv.buffer=IR;const wet=G(.5);rv.connect(wet);wet.connect(out);
  const osc=(type,f,a,dur,pk,at,rel,o)=>{if(T(a)<ac.currentTime-.01)return;o=o||{};const s=ac.createOscillator();s.type=type;s.frequency.setValueAtTime(f,T(a));if(o.f2)s.frequency.exponentialRampToValueAtTime(o.f2,T(a+(o.ft||dur)));if(o.det)s.detune.value=o.det;
    const g=G(0);g.gain.setValueAtTime(0,T(a));g.gain.linearRampToValueAtTime(pk,T(a+at));g.gain.setValueAtTime(pk,T(a+Math.max(at,dur-rel)));g.gain.linearRampToValueAtTime(0,T(a+dur));let n=g;s.connect(g);
    if(o.lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;g.connect(fl);n=fl}const d=G(o.dry==null?1:o.dry);n.connect(d);d.connect(out);if(o.wet){const w=G(o.wet);n.connect(w);w.connect(rv)}s.start(T(a));s.stop(T(a+dur+.05))};
  const E=HC208.cut;
  // the voice: a low drone and a far choir under the words (A minor; the intro's was D)
  [55,82.41,110].forEach((f,i)=>osc('sawtooth',f,.2,E-.1,.03-i*.006,3,1.2,{lp:300,wet:.5,det:i*5}));
  [220,261.63,329.63,392].forEach((f,i)=>osc('sine',f,.8+i*.5,E-1.2,.011,3.5,1.4,{wet:1.3,dry:.4,det:(i%2?6:-6)}));
  // a toll at every cut, sinking
  HC208.T.slice(1).forEach((a,i)=>{osc('sine',[110,103.8,98,92.5,87.3,82.4,77.8,73.4,65.4][i]||65.4,a+.03,2.4,.2,.01,2.3,{wet:.8});osc('sine',[440,415,392,370,349,330,311,294,262][i]||262,a+.03,2,.025,.02,1.9,{wet:1})});
  // the trials: a hard low hit on each of the three cuts
  HC208.T.slice(6,9).map(a=>({a:a+.3})).forEach(c=>{osc('triangle',55,c.a,1.3,.12,.005,1.2,{lp:500,wet:.4});osc('sine',41.2,c.a,1.6,.14,.01,1.5,{wet:.3})});
  // the den: a dissonant swell as it rises, cut dead to black on the roar
  [58.27,61.74,87.31].forEach((f,i)=>osc('sawtooth',f,HC208.rise[0]-.6,E-HC208.rise[0]+.5,.03,2.2,.06,{lp:420+i*60,wet:.7,det:i*9}));
  osc('sine',36.7,E,2.6,.32,.01,2.5,{wet:.6});osc('sine',73.4,E+.02,2.2,.05,.01,2.1,{wet:1})}

// ---------------- play / skip / finish ----------------
function hc208Play(I){if(HC208.run)return false;let S;try{S=hc208Build()}catch(e){console.warn('hc208 build',e);return false}
  S.ev={};S.I=I||null;HC208.S=S;HC208.run=true;HC208.seen=1;IC151.on=true;document.body.classList.add('ic151d');S.fov0=cam.fov;hc208Layer(S);
  const L=S.live={t0:performance.now(),off:0,raf:0,ac:null};
  try{const AC=window.AudioContext||window.webkitAudioContext,ac=L.ac=new AC(),out=ac.createGain(),cp=ac.createDynamicsCompressor();out.gain.value=.9*Math.max(.15,Math.min(1,typeof SET!='undefined'&&SET.sfxV!=null?+SET.sfxV*1.4:1));out.connect(cp);cp.connect(ac.destination);L.out=out;if(ac.resume)ac.resume();hc208Score(ac,out,ac.currentTime+.05)}catch(e){console.warn('hc208 sound',e)}
  try{if(typeof MU!='undefined'&&MU.g&&MU.a){L.mu=1;MU.g.gain.setTargetAtTime(0,MU.a.currentTime,.1)}}catch(_){}
  const onKey=e=>{if(!HC208.run)return;e.stopImmediatePropagation();e.preventDefault();if(e.type=='keydown'&&/^(Escape|Enter| |Spacebar)$/.test(e.key))hc208Skip()};L.onKey=onKey;
  addEventListener('keydown',onKey,true);addEventListener('keyup',onKey,true);S.dom.skip.onclick=e=>{e.stopPropagation();hc208Skip()};
  S.dom.el.addEventListener('mousemove',()=>{S.dom.el.style.cursor='default';clearTimeout(L.cur);L.cur=setTimeout(()=>{if(S.dom)S.dom.el.style.cursor=''},1500)});
  const tick=now=>{if(!HC208.run)return;L.raf=requestAnimationFrame(tick);hc208Seek(Math.max(L.off,(now-L.t0)/1000+L.off));
    try{if(MP&&MP.on&&party.length&&now-(L.pt||0)>500){L.pt=now;mpPresence(now)}}catch(_){}};
  L.raf=requestAnimationFrame(tick);return true}
function hc208Seek(t){const S=HC208.S;if(!S)return;S.t=t;
  if(t<HC208.cut){IC151.on=true;try{hc208Frame(S,t)}catch(e){console.warn('hc208 frame',e);HC208.err=String(e&&e.stack||e);if(S.live)S.live.off+=HC208.cut-t;t=HC208.cut}}
  if(t>=HC208.cut&&!S.back)hc208Back(S);
  hc208Dom(S,t);if(t>=HC208.len)hc208End()}
function hc208Skip(){const S=HC208.S,L=S&&S.live;if(!L)return;const t=(performance.now()-L.t0)/1000+L.off;if(t>=HC208.skipT)return;L.off+=HC208.skipT-t;
  try{if(L.out){L.out.gain.cancelScheduledValues(L.ac.currentTime);L.out.gain.setTargetAtTime(0,L.ac.currentTime,.12)}}catch(_){}}
// hand the game back (at the cut to black): everything shown is put back, the camera returns behind the hero, the loop runs again
function hc208Back(S){if(S.back)return;S.back=1;
  try{if(S.ab){const R=S.ab;(S.abSave||[]).forEach(q=>{try{ab152ResetActor(q.a)}catch(_){Object.assign(q.a,{st:q.st,sus:q.sus,u:q.u,v:q.v,yaw:q.yaw})}if(q.a.cone)q.a.cone.visible=false});R.root.visible=false;R.lights.forEach(L=>L.lt.intensity=0);R.acts.forEach(a=>{if(a.lt)a.lt.intensity=0})}}catch(e){console.warn('hc208 city back',e)}
  try{if(S.asc)S.asc.root.visible=false}catch(_){}
  try{if(S.gate){const I=curIns();S.gate.g.visible=!!I&&I.g===S.gate.ig;const H=HD154.S;if(H)H.heads.forEach(h=>{h.f=0;h.m.scale.setScalar(1)})}}catch(_){}
  try{(S.props||[]).forEach(m=>{if(m.parent)m.parent.remove(m)});S.props=[];S.mons=null;(S.campE||[]).forEach(e=>{e.m.visible=true});S.campE=null}catch(_){}
  try{(S.fx||[]).forEach(o=>KQ.fx.push(o));S.fx=[]}catch(_){}
  try{const H=S.hyd;if(H&&!H.busy){const e=H.e;if(H.own){if(e.m.parent)e.m.parent.remove(e.m);try{e.sv.R.mats.forEach(m=>m.dispose());e.sv.R.glow.forEach(m=>m.dispose());e.sv.R.root.traverse(o=>{if(o.geometry&&o.geometry.userData.svOwn)o.geometry.dispose()})}catch(_){}}
      else{const v=H.save,s=e.sv;e.m.position.copy(v.p);e.m.rotation.y=v.ry;e.m.visible=v.vis;s.trk=v.trk;s.tt=v.tt;s.aw=v.aw;try{svApply(e,0,performance.now())}catch(_){}}}}catch(e){console.warn('hc208 hydra back',e)}
  try{ren.domElement.style.filter='';if(S.farr0!=null){FARR=S.farr0;S.farr0=null}cam.near=S.near0||.1}catch(_){}
  try{document.body.classList.remove('ic151d');cam.fov=S.fov0||58;cam.updateProjectionMatrix();snapCam();chunkVis();for(let n=0;n<40;n++)atmos(.05,performance.now())}catch(e){console.warn('hc208 back',e)}
  IC151.on=false;try{if(S.live&&S.live.mu&&typeof muVol=='function')muVol()}catch(_){}try{if(typeof K!='undefined')for(const k in K)K[k]=false}catch(_){}
  // the zone's title card, held back while the cinematic played
  setTimeout(()=>{try{if(S.I&&curIns()&&curIns().z===1)zt116Ins(curIns())}catch(_){}},500)}
function hc208End(){if(!HC208.run)return;const S=HC208.S,L=S&&S.live;HC208.run=false;
  try{if(S&&!S.back)hc208Back(S)}catch(_){}
  try{if(L){cancelAnimationFrame(L.raf);removeEventListener('keydown',L.onKey,true);removeEventListener('keyup',L.onKey,true);clearTimeout(L.cur);
    if(L.ac){const ac=L.ac;try{L.out.gain.setTargetAtTime(0,ac.currentTime,.3)}catch(_){}setTimeout(()=>{try{ac.close()}catch(_){}},1500)}}}catch(_){}
  try{if(S&&S.dom)S.dom.el.remove()}catch(_){}HC208.S=null}
// capture mode for tests: build, no sound, no clock; then hc208Seek(t) per frame
function hc208Cap(){if(HC208.run)return null;const T0=performance.now(),S=hc208Build();S.ev={};S.I=curIns();HC208.S=S;HC208.run=true;IC151.on=true;document.body.classList.add('ic151d');S.fov0=cam.fov;hc208Layer(S);S.dom.skip.style.display='none';
  return {ms:Math.round(performance.now()-T0),city:!!S.ab,acts:S.ab?S.ab.acts.length:0,lamp:!!S.lamp,asc:!!S.asc,mons:(S.mons||[]).length,hyd:S.hyd?(S.hyd.own?'copy':S.hyd.busy?'busy':'den'):null}}

// ---------------- when: the first arrival in Hillside Crest; the zone card waits for the end ----------------
{const f=insArrive;insArrive=function(I){const want=hc208Want(I);if(want)HC208.hold=1;let r;try{r=f.apply(this,arguments)}finally{HC208.hold=0}
  if(want){let ok=false;try{ok=hc208Play(I)}catch(e){console.warn('hc208',e)}if(!ok)try{zt116Ins(I)}catch(_){}}return r}}
// the v117 card (2210 shows it inside the call above, once the arrival is done) waits until the cinematic hands the game back
{const f=zt116Ins;zt116Ins=function(){if(HC208.hold||(HC208.run&&!(HC208.S&&HC208.S.back)))return;return f.apply(this,arguments)}}
// saved per character; older saves that already went past Hillside Crest I have been there
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.hc208=HC208.seen?1:0}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{HC208.seen=s&&s.hc208!=null?(s.hc208?1:0):-1}catch(_){HC208.seen=0}return r}}
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{if(HC208.seen===-1){let been=false;try{been=(INSR[1]|0)>0||bossDone.has(1)||(typeof AB152Q!='undefined'&&AB152Q.st>0)}catch(_){}
    try{const I=curIns();if(I&&I.z===1)been=true}catch(_){}HC208.seen=been?1:0}}catch(_){}return r}}
{const f=ccBegin;ccBegin=function(){HC208.seen=0;return f.apply(this,arguments)}}
