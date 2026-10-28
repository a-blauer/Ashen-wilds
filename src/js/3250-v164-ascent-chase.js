// ================= v164 The Hilltop Ascent rework: venom, broken trail, a real chase =================
// The owner: "Remove the obstacles and the attack from the snake from behind. Remove the health system during the chase. The snake
// spits venom that when stepped on slows you for a second, and the trail leading up has portions that are chipped off or broken so
// you have to jump over them. If the snake catches up to you (you hit too many venom spots or don't dash enough) then he chomps you."
//  * No obstacles, no strikes, no hits: the boulders, logs, spikes, tunnel pillars, rockslides and the plank bridge are gone, and so
//    are Skarrith's strikes and the 3-hit rule (CH153V.hp, the 💚 hearts). The tunnel arches stay (scenery you never touch).
//  * Broken trail (ch153Course().gaps, seeded: the same for every co-op rider; 3160 carves them out of the ground): ~13 stretches
//    where the ledge has fallen away, longer and closer together toward the summit. Each is a dark hole (ch164Abyss: cracked slabs
//    tipped toward it, broken rock walls dropping into black) with cracks running up to it and stones crumbling off its near lip
//    as you come (ch153FxTick). The ground itself is carved deep there (3160). Space jumps them; the
//    mount leaps at least at full stride at a gap (CH164.leap, even when slowed) and keeps its speed in the air, so a jump timed
//    anywhere in a ~2.5–4 tile window clears it. Land in
//    the hole and you fall (R.ph 'dead', why 'fall'): you drop into the gap, Skarrith lunges down after you and its jaws close.
//  * Venom (ch153Spit → ch153SpitPlan / ch153SpitSpawn, ch164Glob…): it rears and spits globs that arc through the air to land
//    ahead on the trail. Where one will land a green target ring with a growing shadow shows; it lands with a splash and leaves a
//    bubbling puddle (CH164.poolT s). Riding through a puddle (or being under a glob) slows the mount to ×CH164.slowK for
//    CH164.slowT s (a green tint, a squelch and a hiss, drips): ~5 tiles lost. Volleys: one glob at your lane, two (a slalom: the
//    second further on, on the other side) or a wall of three across the trail (jump it). Never on or just before a broken stretch (fairness).
//  * The chase (ch164SnakeV): Skarrith runs at its own speed, CH164.snV (8.55 at the foot → 8.85 near the summit), between the
//    mount's 8.2 and what steady boosting averages (~8.9); it is held back to CH153V.slow0 for the first 3 s. Every venom slow and
//    every stretch without a boost lets it close in; boosts open the gap. Only far behind (past CH164.far) does it surge to stay
//    in sight. When it reaches you (CH164.catch) it rears and chomps (why 'chomp'): a lunge, jaws closing over hero and mount, a
//    shake and a red flash. Then the chase starts again at the foot. The hero's own health is never touched.
//  * HUD: a distance meter (the bar with 🐍 at the left and 🐎 at the gap, its colour and the "· m" figure) and 3192's danger
//    edge, rumble and thuds, all scaled by closeness; a JUMP cue before the first broken stretches.
//  * Co-op (3180): one Skarrith driven by the host after the rearmost rider, its distance measured to that rider; venom volleys
//    relayed ['cs','v',n,[[s,o]…]]; each rider's world checks its own puddles, gaps and the chomp; the fallen spectate.
var CH164={snV:[8.55,8.85],far:28,farK:.14,catch:2.6,slowT:1.0,slowK:.42,poolT:7,poolR:1.15,leap:.95,edge:.35,spitMax:46,gapB:12,gapA:6.5,slalom:5,lane:.85,deb:[],err:0};
// ---------------- the world ----------------
function ch153Build(){if(CH153.S)return CH153.S;const P=ch153Path(),K=ch153Course(),root=new THREE.Group();root.name='HilltopAscent';scene.add(root);
  const S={P,K,root,arches:[],globs:[],pools:[],deb:[],t:0};CH153.S=S;
  const put=(m,s,o,y,turn)=>{const [x,z,h]=P.at(s,o);m.position.set(x,h+(y||0),z);m.rotation.y=P.yaw(s)+(turn||0);root.add(m);return m};
  // the broken stretches: the hole (ch164Abyss), cracks leading up to it
  K.gaps.forEach((g,i)=>{const a=g.s-g.len/2,b=g.s+g.len/2,w=P.hw(g.s)/2.7;root.add(ch164Abyss(P,g,i));
    [[a,0],[b,Math.PI]].forEach(([s,turn],j)=>{const c=put(ch164CrackDecal(),s+(j?1:-1)*2.2,(i%2?.6:-.5)*(j?-1:1),.05,turn);c.scale.set(w*1.15,1,1)})});
  // the tunnel: rock arches
  for(let s=606;s<=684;s+=6)if(!ch153GapAt(s,-3.2))S.arches.push(put(ch153Arch(),s,0,-.1,0));   // none standing over a hole
  // the summit crack, facing the trail
  S.crack=put(ch153Crack(),P.S-3.5,0,-.1,Math.PI);
  // the serpent
  S.sn=ch153Snake(root,46);
  return S}
// a broken stretch, built in the trail's own frame (world coordinates; per gap one lit mesh and one unlit, shared materials):
// the ledge has fallen away between a and b. Near and far lips: cracked slabs at trail height, tipped toward the hole, with
// chunks hanging over the edge (lit). Inside: the walls of the break dropping into the dark, a black floor below (unlit, fading
// from shadowed rock at the lip to black, so the hole reads as a drop from any light). The mountain side: a broken block of the
// wall. The outer side is open: the ground is carved deep down the mountain (3160), the drop shows through.
function ch164Abyss(P,g,i){const R=ch153R(7001+i*37),a=g.s-g.len/2,b=g.s+g.len/2,hw=P.hw(g.s),C=new THREE.Color(),L={p:[],c:[]},D={p:[],c:[]};
  const at=(s,o,y)=>{const q=P.at(s,o);return [q[0],q[2]+y,q[1]]};
  const tri=(B,p,q,r,c1,c2,c3)=>{B.p.push(...p,...q,...r);[c1,c2==null?c1:c2,c3==null?c1:c3].forEach(c=>{C.setHex(c);B.c.push(C.r,C.g,C.b)})};
  const quad=(B,p,q,r,s,ct,cb)=>{cb=cb==null?ct:cb;tri(B,p,q,r,ct,ct,cb);tri(B,p,r,s,ct,cb,cb)};
  const dk=(c,k)=>{C.setHex(c).multiplyScalar(k);return C.getHex()};
  // a box between trail positions s0..s1 and o0..o1: top y per corner [s0o0, s0o1, s1o0, s1o1], bottom yb
  const box=(B,s0,s1,o0,o1,yt,yb,c)=>{const T=[at(s0,o0,yt[0]),at(s0,o1,yt[1]),at(s1,o1,yt[3]),at(s1,o0,yt[2])],Bt=[at(s0,o0,yb),at(s0,o1,yb),at(s1,o1,yb),at(s1,o0,yb)],cs=dk(c,.7),cd=dk(c,.3);
    quad(B,T[0],T[1],T[2],T[3],c);for(let k=0;k<4;k++){const j=(k+1)%4;quad(B,T[j],T[k],Bt[k],Bt[j],cs,cd)}};
  const SL=[0x8a8262,0x7a7454,0x948a68,0x6c664c],RK=[0x3a352e,0x2e2a24,0x443e36];
  const W0=-hw-.15,W1=hw+.45,N=10,ow=k=>W0+(W1-W0)*k/N;
  [[a,-1],[b,1]].forEach(([e,dir])=>{
    // the lip slabs (lit): tipped down toward the hole, hanging chunks under the edge
    let o=W0;while(o<W1){const w=.7+R()*.6,o1=Math.min(W1,o+w),dep=.9+R()*.35,lip=e-dir*(R()*.1),back=e+dir*dep,dn=.08+R()*.18,yb=.012+R()*.02,s0=Math.min(lip,back),s1=Math.max(lip,back),yl=yb-dn;
      box(L,s0,s1,o+.05,o1-.05,dir<0?[yb,yb,yl,yl]:[yl,yl,yb,yb],-.6,SL[(R()*4)|0]);
      if(R()<.75){const c=lip+dir*.03,h=.3+R()*.4;box(L,Math.min(c,c+dir*.35),Math.max(c,c+dir*.35),o+.12,o+.12+w*.55,[yl-.12,yl-.12,yl-.12,yl-.12],yl-.12-h,RK[(R()*3)|0])}
      o=o1}
    // the wall of the break (unlit): jagged, from shadowed rock under the lip to black below
    const F=[];for(let k=0;k<=N;k++)F.push([ow(k),e+dir*(.02+R()*.22)]);
    for(let k=0;k<N;k++){const p=F[k],q=F[k+1],c=dk(RK[k%3],.75),t=[at(p[1],p[0],-.35),at(q[1],q[0],-.35)],m=[at(p[1]+dir*.12,p[0],-1.8),at(q[1]+dir*.12,q[0],-1.8)],bt=[at(p[1]+dir*.3,p[0],-6),at(q[1]+dir*.3,q[0],-6)];
      quad(D,t[0],t[1],m[1],m[0],c,dk(c,.35));quad(D,m[0],m[1],bt[1],bt[0],dk(c,.35),0x020202)}});
  // the dark floor of the hole
  for(let k=0;k<N;k++)quad(D,at(a+.2,ow(k+1),-3.2),at(a+.2,ow(k),-3.2),at(b-.2,ow(k),-3.2),at(b-.2,ow(k+1),-3.2),0x020202);
  // the mouth of the drop: dark just under the lips across the whole hole (it hides the ground's carved slopes, which would
  // show lit from the rider's low view), rock-brown at the lips fading to black in the middle
  {const NS=6,y=-.3;for(let j=0;j<NS;j++)for(let k=0;k<N;k++){const s0=a-.04+(g.len+.08)*j/NS,s1=a-.04+(g.len+.08)*(j+1)/NS,f=u=>{const d=Math.min(u-a,b-u)/(g.len/2);return d<.12?0x241e18:d<.4?0x0c0a08:0x030303};
      quad(D,at(s0,ow(k),y),at(s0,ow(k+1),y),at(s1,ow(k+1),y),at(s1,ow(k),y),f(s0),f(s1))}}
  // the mountain side: the wall's foot over the hole's inner edge, broken blocks, its face dropping into the dark
  {const s0=a-1.2,s1=b+1.2,o0=-hw-1.9,o1=-hw-.05;box(L,s0,s1,o0,o1,[.3+R()*.3,.2,.3+R()*.3,.2],-.4,RK[1]);
    for(let k=0;k<=6;k++){const s=a+g.len*k/6,p=at(s,o1+.02,-.4),q=at(s+g.len/6,o1+.02,-.4),p2=at(s,o1+.15,-6),q2=at(s+g.len/6,o1+.15,-6);if(k<6)quad(D,p,q,q2,p2,dk(RK[k%3],.7),0x020202)}
    for(let k=0;k<5;k++){const s=a-.6+(g.len+1.2)*k/4,sz=.3+R()*.3;box(L,s-sz,s+sz,o1-sz*1.6,o1-.1,[.35+R()*.5,.35,.35+R()*.5,.35],.1,RK[k%3])}}
  const mk=(B,lit)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(B.c,3));geo.computeVertexNormals();
    const key=lit?'abL':'abD',M=CH164[key]||(CH164[key]=(()=>{const m=lit?new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}):new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:false});m.userData.noFade135=1;return m})());
    const m=new THREE.Mesh(geo,M);m.castShadow=lit;m.receiveShadow=lit;m.userData.psNo=1;m.userData.noFade135=1;return m};
  const G=new THREE.Group();G.userData.psNo=1;G.userData.noFade135=1;G.add(mk(L,1),mk(D,0));return G}
function ch164CrackDecal(){const M=CH164.ckM||(CH164.ckM=(()=>{const m=new THREE.MeshBasicMaterial({map:ch157CrackTex(),transparent:true,depthWrite:false,opacity:.85,polygonOffset:true,polygonOffsetFactor:-4});m.userData.noFade135=1;return m})());
  const m=new THREE.Mesh(CH164.ckG||(CH164.ckG=new THREE.PlaneGeometry(5.2,2.6).rotateX(-Math.PI/2)),M);m.renderOrder=2;m.userData.psNo=1;m.userData.noFade135=1;return m}
// ---------------- the run ----------------
function ch153Reset(first){const S=ch153Build(),P=S.P,K=S.K;
  CH153.R={s:K.start,o:0,v:0,y:0,jt:-1,slow:0,ph:'intro',t:first?0:1.1,t0:first?0:1.1,
    sn:{s:CH153V.hole,v:0,o:0,lift:0,rear:0,jaw:.2,st:'intro',t:0,spit:0,next:0,eye:1,em:0,drop:0},dead:null,win:null,fx:0,cue:0,slows:0};
  ch164ClearFx(S);
  try{if(!riding)ch153Mount()}catch(e){console.warn('v153 mount',e)}
  ch153Place()}
function ch164ClearFx(S){S.globs.forEach(g=>{ch164Drop(g.m);ch164Drop(g.w,1)});S.globs.length=0;S.pools.forEach(p=>ch164Drop(p.m,1));S.pools.length=0;S.deb.forEach(d=>ch164Drop(d.m));S.deb.length=0}
// take a mesh out of the scene; own: its material was made for it (free it; the geometry is always shared)
function ch164Drop(m,own){if(!m)return;if(m.parent)m.parent.remove(m);if(own&&m.material){m.material.dispose()}}
// caught: 'chomp' (it reached you) or 'fall' (into a broken stretch; g = the gap)
function ch153Die(why,g){const R=CH153.R;if(!R||R.ph!='run')return;R.ph='dead';R.dead={why,t:0,g:g||null,vy:1.6};R.v=0;R.jt=-1;
  try{if(why=='fall'){svSnd('whoosh',1,.6);svSnd('crack',1,.8);shake(.25)}else{svSnd('roar',1.3,.85);shake(.3)}}catch(_){}
  say(why=='fall'?'🕳 <b>You fell through the broken trail — Skarrith was waiting.</b> The chase starts again.':'🐍 <b>Skarrith caught you.</b> The chase starts again.')}
// the bite: the jaws close over hero and mount
function ch164Bite(){const R=CH153.R,D=R.dead;if(D.bit)return;D.bit=1;pl.visible=false;if(typeof mModel!='undefined'&&mModel)mModel.visible=false;
  try{shake(ch157Calm()?.25:.7);flash('rgba(160,0,0,.8)');svSnd('heavy',1.5,.7);svSnd('crack',1.3,.6);svSnd('roar',1.1,1.1);burst(pl.position.clone().add(new THREE.Vector3(0,1,0)),0x5a0a06,26,2.2,2,.7);burst(pl.position.clone().add(new THREE.Vector3(0,.6,0)),0x9a8a6a,20,2.6,1.4,.9)}catch(_){}}
// Skarrith's speed: its own pace (rising toward the summit), a surge only when far behind
function ch164SnakeV(s,gap){const k=Math.max(0,Math.min(1,s/880));let v=CH164.snV[0]+(CH164.snV[1]-CH164.snV[0])*k;if(gap>CH164.far)v+=(gap-CH164.far)*CH164.farK;return v}
// its venom: the phase by trail position sets how often and how many; it rears, then spits (fire(n) at the moment it spits)
function ch164SpitTick(N,s,gap,dt,fire){const ph=ch153Course().venom.filter(q=>s>=q[0]).pop();if(!ph||gap>CH164.spitMax)return;
  if(N.spitAt==null){N.spit-=dt;if(N.spit<=0){N.spit=ph[1]*(.85+Math.random()*.3);N.rear=1;N.spitAt=.45;N.spitN=1+Math.floor(Math.random()*ph[2]*.999);try{svSnd('hiss',1.1,.8)}catch(_){}}}
  else{N.spitAt-=dt;if(N.spitAt<=0){N.spitAt=null;fire(N.spitN)}}}
function ch153SnakeTick(dt,now){const S=CH153.S,P=S.P,R=CH153.R,N=R.sn,gap=R.s-N.s;
  // v157: it bursts out of the ground on the trail behind you (CH153V.hole), towers over you, then drops onto the trail
  if(R.ph=='intro'){N.st='intro';N.t+=dt;const te=R.t-ch153EmT(R);N.s=CH153V.hole;N.o=0;N.v=0;N.rear=0;
    N.em=te<0?0:Math.min(1,te/.55);N.drop=Math.max(0,Math.min(1,(R.t-2.35)/.6));
    if(R.t>2.8&&!N.slam){N.slam=1;try{shake(.35);svSnd('heavy',1.1,.8);const [x,z,h]=ch153Ext(P,CH153V.hole+2.5,0);burst(new THREE.Vector3(x,h+.5,z),0x9a8a6a,30,3,2.2,1.2)}catch(_){}}}
  else if(R.ph=='run'){let v=ch164SnakeV(R.s,gap);if(R.t<3)v=Math.min(v,CH153V.slow0);N.v+=(v-N.v)*Math.min(1,dt*2);N.s+=N.v*dt;
    if(R.s-N.s<CH164.catch){ch153Die('chomp');return ch153SnakeAnim(now)}
    if(R.t>2.5)ch164SpitTick(N,R.s,gap,dt,n=>ch153Spit(n))}
  else if(R.ph=='dead')ch164DeadSnake(dt);
  else if(R.ph=='win'){N.s=Math.min(N.s+N.v*dt,P.S-13);N.v*=.9}
  N.rear=Math.max(0,N.rear-dt*1.6);N.o+=((R.ph=='run'?R.o*.5:0)-N.o)*Math.min(1,dt*1.5);
  ch153SnakeAnim(now)}
// after a chomp or a fall the serpent closes the distance: to just behind you, or to the near lip of the gap you fell into
function ch164DeadSnake(dt){const R=CH153.R,N=R.sn,D=R.dead;if(!D)return;const want=D.why=='fall'&&D.g?D.g.s-D.g.len/2-.6:R.s-2.2;
  if(N.s<want){N.v=Math.max(N.v,(want-N.s)*3.2);N.s=Math.min(want,N.s+N.v*dt)}else N.v=0}
// the pose: the head (raised, rearing to spit, chomping, diving into a gap), the body along the trail behind it
function ch153SnakeAnim(now){const S=CH153.S,P=S.P,R=CH153.R,N=R.sn,M=S.sn,t=now/1000,HO=CH153V.hole;
  const slope=(s,o)=>ch153Ext(P,s,o);
  let hs=N.s,ho=N.o,hy=2.4+N.rear*1.8,jaw=.18+.12*Math.sin(t*3),pitch=.12;
  const D=R.ph=='dead'?R.dead:null;
  if(D&&D.why!='fall'){// the chomp: it rears back (.0–.32 s), lunges down over you (–.55), jaws shut on you, then lifts
    const T=D.t;if(T<.32){const k=T/.32;hy=2.4+N.rear*1.8+2.6*k;hs=N.s-.8*k;jaw=.4+.6*k;pitch=.12-.55*k}
    else if(T<.55){const k=(T-.32)/.23,e=k*k;hs=N.s-.8+(R.s-N.s+.8)*e;ho=N.o+(R.o-N.o)*e;hy=5.2-4*e;jaw=1;pitch=-.43+.95*e}
    else{const k=Math.min(1,(T-.55)/.6);hs=R.s;ho=R.o;hy=1.2+1.6*k;jaw=Math.max(.04,.25-k*.2);pitch=.52-.4*k}
    if(T>=.55)ch164Bite()}
  if(D&&D.why=='fall'){// it reaches the lip, then dives down into the hole after you
    const T=D.t,g=D.g,lip=g?g.s-g.len/2:R.s,ready=N.s>=lip-1.2||T>.9;
    if(!ready){hy=2.4+.8*Math.min(1,T*2);jaw=.6;pitch=.1}
    else{if(D.rdy==null)D.rdy=T;const k=Math.min(1,(T-D.rdy)/.45);hs=N.s+(R.s-N.s)*k;ho=N.o+(R.o-N.o)*k;hy=2.4+(R.y+1-2.4)*k*k;jaw=k<.85?1:.05;pitch=.12+.95*k;if(k>=1)ch164Bite()}}
  if(R.ph=='win'&&R.win.t>.5){jaw=.9;hy=1.6;pitch=-.1}
  if(N.rear>.05&&!D){jaw=Math.max(jaw,.35+.6*N.rear);pitch=-.3*N.rear}
  // v157 the emergence: the head shoots up out of the ground, towers and sways, glares down at you, then lowers to its chase height
  const emg=R.ph=='intro',lx=-P.TZ[0]*P.sgn,lz=P.TX[0]*P.sgn;let em=0;
  if(emg){em=N.em||0;const d=N.drop||0,eo=1-Math.pow(1-em,3),dd=d*d*(3-2*d),top=-2.5+11.5*eo+.35*Math.sin(t*2.1)*em,k2=Math.max(0,Math.min(1,(R.t-ch153EmT(R)-.55)/.35));
    hs=HO;ho=.45*Math.sin(t*1.9)*em*(1-dd);hy=top+(4.2-top)*dd;
    pitch=em<1?-.95+.5*em:dd>0?.3*(1-dd)+.12*dd:-.45+.75*k2;jaw=em<1?1:dd>0?.9-.55*dd:.75+.18*Math.sin(t*7)}
  M.head.visible=!(emg&&em<=0);M.hood.scale.set(1+(emg?.18*em:.16*N.rear+(D?.2:0)),1,1);
  const [hx,hz,hh]=slope(hs,ho);M.head.position.set(hx,hh+hy,hz);const ya=hs>=0?P.yaw(Math.max(0,hs)):P.yaw(0);
  M.head.rotation.set(pitch,ya+.12*Math.sin(t*1.7)*(D?0:1),.06*Math.sin(t*2.3),'YXZ');M.jaw.rotation.x=jaw*.95;
  // the body along the trail behind it, slithering; the neck rises to the head
  const pts=[],[Hx,Hz,Hh]=slope(HO,0);
  for(let i=0;i<M.n;i++){let r=1.55*(1-Math.pow(i/M.n,1.6)*.82)*(i<6?.76+.24*(i/6):1);
    if(emg){const l=1.9+i*1.32,py=hh+hy-l*.95,sw=Math.sin(l*.45-t*2.4)*.55*em*Math.min(1,l/4)+ho*Math.max(0,1-l/5);if(py<Hh-r*1.3||em<=0)r=0;pts.push([Hx+lx*sw,py,Hz+lz*sw,r]);continue}   // a coiling column out of the hole
    const s=Math.min(N.s,hs)-1.9-i*1.32,hw=P.hw(Math.max(0,s)),near=Math.max(0,Math.min(1,(s-HO)/3)),o=Math.max(-hw+.4,Math.min(hw-.4,(N.o*Math.max(0,1-i/8)+.95*Math.sin(t*3.1-i*.42))*(s<HO+3?near:1)));
    const neck=i<4?(hy-1.3)*Math.pow(1-i/4,1.5):0;
    if(s<HO){const py=Hh+r*.82-(HO-s)*1.1+neck;if(py<Hh-r*1.3)r=0;pts.push([Hx,py,Hz,r]);continue}   // still coming out of the hole
    const [x,z,h]=slope(s,o);pts.push([x,h+r*.82+.12*Math.sin(t*4-i*.6)+neck,z,r])}
  ch153SnakeLay(M,pts);ch164HeadAnim(M,t,jaw,N.rear)}
// ---------------- venom ----------------
function ch153Spit(n){const R=CH153.R;ch153SpitSpawn(ch153SpitPlan(n,R.s,R.o,R.v),n)}
// where a volley lands: ahead of the rider (they see it coming down), never on or just before a broken stretch
// one glob: your lane · two: a slalom · three: a wall across the trail (jump it)
function ch153SpitPlan(n,s,o,v){const P=CH153.S.P,T=1.05,G=ch153Course().gaps,span=n==2?CH164.slalom:.5;
  // the whole volley (from x to x + span) lands clear of every broken stretch: not within CH164.gapB before one, CH164.gapA after
  const clear=x=>{for(let k=0;k<6;k++){const g=G.find(g=>x+span>g.s-g.len/2-CH164.gapB&&x-.5<g.s+g.len/2+CH164.gapA);if(!g)break;x=g.s+g.len/2+CH164.gapA+.6+Math.random()*2}return Math.min(x,P.S-12)};
  const ls=clear(s+Math.max(4,v)*T+3+Math.random()*4),lim=q=>P.hw(q)-.6,L=[];
  if(n>=3){for(let i=0;i<3;i++)L.push([ls+(Math.random()-.5)*.5,(i-1)*1.75])}
  else{const a=Math.max(-lim(ls),Math.min(lim(ls),o+(Math.random()-.5)*.5));L.push([ls,a]);
    // two: a slalom — the second lands further on, on the other side of the trail (go round the first, then swerve back)
    if(n==2){const s2=ls+CH164.slalom+(Math.random()-.5)*.6,sd=a>.3?-1:a<-.3?1:(Math.random()<.5?-1:1);L.push([s2,sd*lim(s2)*(.55+Math.random()*.35)])}}
  // one or two: each glob leaves a lane at least CH164.lane wide beside it (in the narrows a glob is pushed toward one edge)
  if(n<3)L.forEach(q=>{const hw=P.hw(q[0]),lo=-hw+.55,hi=hw-.55,r=CH164.poolR*.95+.1,W=CH164.lane;q[1]=Math.max(-lim(q[0]),Math.min(lim(q[0]),q[1]));
    if(Math.max(q[1]-r-lo,hi-q[1]-r)<W)q[1]=q[1]-r-lo>=hi-q[1]-r?lo+W+r:hi-W-r});
  return L.map(q=>[q[0],Math.max(-lim(q[0]),Math.min(lim(q[0]),q[1]))])}
function ch153SpitSpawn(L,n){const S=CH153.S,P=S.P,M=S.sn,T=1.05,from=M.head.localToWorld(new THREE.Vector3(0,-.3,2.1));
  try{svSnd('hiss',1.1,1.35);svSnd('whoosh',.6,.6);burst(from,0x8aff3a,14,1.2,.6,.5)}catch(_){}
  const R=CH153.R;if(R)R.vol=(R.vol||0)+1;
  if(n>=3&&!CH153.wallHint){CH153.wallHint=1;setTimeout(()=>{try{pickup({ic:'🦘',t:'JUMP the venom wall!',col:'#9aff40',sub:'Space'})}catch(_){}},250)}
  L.forEach(([ls,lo],i)=>{const [x,z,h]=P.at(ls,lo),g=ch164Glob(),w=ch164Ring();g.position.copy(from);w.position.set(x,h+.07,z);S.root.add(g);S.root.add(w);
    S.globs.push({m:g,w,a:from.clone(),b:new THREE.Vector3(x,h,z),s:ls,o:lo,t:0,T:T+i*.08,arc:4.5+Math.random()})})}
function ch164Glob(){const M=CH164.gM||(CH164.gM=(()=>{const m=new THREE.MeshStandardMaterial({color:0x7aff2a,emissive:0x46c012,emissiveIntensity:1.1,roughness:.15,transparent:true,opacity:.95});m.userData.noFade135=1;return m})());
  const m=new THREE.Mesh(CH164.gG||(CH164.gG=new THREE.IcosahedronGeometry(.45,2)),M);m.userData.psNo=1;m.userData.noFade135=1;return m}
// the landing mark: a pulsing ring, a filling disc and the glob's shadow, growing as it comes down (k 0..1)
function ch164Ring(){const m=new THREE.Mesh(CH164.rG||(CH164.rG=new THREE.PlaneGeometry(2*CH164.poolR*1.35,2*CH164.poolR*1.35).rotateX(-Math.PI/2)),new THREE.ShaderMaterial({uniforms:{k:{value:0},t:{value:0}},transparent:true,depthWrite:false,
  vertexShader:'varying vec2 vU;void main(){vU=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform float k,t;varying vec2 vU;void main(){float r=length(vU);if(r>1.)discard;float p=.5+.5*sin(t*18.);'+
    'float ring=smoothstep(.84,.9,r)*(1.-smoothstep(.95,1.,r));float tick=step(.6,r)*step(r,.84)*step(.94,abs(cos(atan(vU.y,vU.x)*2.)));float fill=step(r,k*.84)*.28;'+
    'float sh=(1.-smoothstep(.0,.25+.45*k,r))*(.25+.55*k);vec3 c=mix(vec3(.55,1.,.2),vec3(.95,1.,.5),p);'+
    'gl_FragColor=vec4(mix(c,vec3(.02,.06,0.),sh*.8),max(max(ring*(.7+.3*p),tick*.6),max(fill,sh)));}'}));m.renderOrder=4;m.userData.psNo=1;m.userData.noFade135=1;return m}
// the puddle: an irregular bubbling pool with a bright rim; a = its fade, g = its spread as it lands
function ch164Pool(){const m=new THREE.Mesh(CH164.pG||(CH164.pG=new THREE.PlaneGeometry(2*CH164.poolR*1.25,2*CH164.poolR*1.25).rotateX(-Math.PI/2)),new THREE.ShaderMaterial({uniforms:{t:{value:0},a:{value:1},g:{value:0},sd:{value:Math.random()*50}},transparent:true,depthWrite:false,
  vertexShader:'varying vec2 vU;void main(){vU=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform float t,a,g,sd;varying vec2 vU;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
    'void main(){float an=atan(vU.y,vU.x);float r=length(vU)*1.25;float edge=.78+.07*sin(an*3.+sd)+.05*sin(an*7.-sd*1.3)+.03*sin(an*13.+t*2.);edge*=g;if(r>edge)discard;'+
    'float q=r/max(.01,edge);vec3 c=mix(vec3(.12,.42,.04),vec3(.42,.95,.14),smoothstep(.2,1.,q));c=mix(c,vec3(.8,1.,.4),smoothstep(.86,.97,q));'+
    'vec2 p=vU*5.;vec2 cell=floor(p);vec2 f=fract(p)-.5;float rnd=h(cell+sd);float ph=fract(t*(.5+rnd*.8)+rnd);vec2 o=vec2(h(cell+1.7)-.5,h(cell+3.1)-.5)*.5;'+
    'float br=.1+.24*ph;float d=length(f-o);float bub=step(.35,rnd)*(smoothstep(br,br-.05,d)-smoothstep(br-.04,br-.09,d))*(1.-step(.92,ph));'+
    'c=mix(c,vec3(.9,1.,.55),bub*.9);c+=vec3(.05,.12,0.)*sin(t*3.+r*9.);gl_FragColor=vec4(c,a*(.82+.18*q));}'}));
  m.renderOrder=3;m.userData.psNo=1;m.userData.noFade135=1;return m}
// slowed by venom
function ch164Slow(){const R=CH153.R;if(!R||R.ph!='run')return;const fresh=!(R.slow>0);R.slow=CH164.slowT;R.slows=(R.slows||0)+1;
  try{flash('rgba(110,255,40,.55)');svSnd('squelch',1.1,1);svSnd('hiss',.8,1.5);shake(.12);burst(pl.position.clone().add(new THREE.Vector3(0,.4,0)),0x8aff3a,22,1.8,1.6,.6)}catch(_){}
  if(fresh)try{pickup({ic:'☣',t:'Venom! Slowed',col:'#9aff40',sub:'Skarrith is gaining — boost!'})}catch(_){}}
// the leading rider's place (co-op: 3180 sets CH153.lead): debris drops off the lips ahead of it
function ch164LeadS(){const R=CH153.R;return Math.max(R&&R.ph=='run'?R.s:-1e9,CH153.lead!=null?CH153.lead:-1e9)}
function ch153FxTick(dt,now){const S=CH153.S,P=S.P,R=CH153.R,t=now/1000;
  // globs arc through the air and land
  for(let i=S.globs.length-1;i>=0;i--){const G=S.globs[i];G.t+=dt;const k=Math.min(1,G.t/G.T);G.m.position.lerpVectors(G.a,G.b,k);G.m.position.y+=Math.sin(k*Math.PI)*G.arc;
    const sc=1+.25*Math.sin(t*20+i);G.m.scale.set(1/sc,sc*1.15,1/sc);G.m.rotation.y+=dt*5;G.w.material.uniforms.k.value=k;G.w.material.uniforms.t.value=t;
    if(Math.random()<dt*14)try{burst(G.m.position,0x8aff3a,1,.2,-.4,.4)}catch(_){}
    if(k>=1){try{burst(G.b.clone().add(new THREE.Vector3(0,.3,0)),0x8aff3a,24,2,2.4,.7);burst(G.b.clone().add(new THREE.Vector3(0,.15,0)),0x2a6a0a,10,1.4,1,.9);
        const d=R?Math.hypot(pl.position.x-G.b.x,pl.position.z-G.b.z):99;if(d<26)svSnd('splash',.9*(1-d/30),1.15)}catch(_){}
      const pm=ch164Pool();pm.position.set(G.b.x,G.b.y+.06,G.b.z);S.root.add(pm);const Q={m:pm,s:G.s,o:G.o,t:CH164.poolT,hit:0,g:0};S.pools.push(Q);
      if(R&&R.ph=='run'&&Math.abs(R.s-G.s)<CH164.poolR+.2&&Math.abs(R.o-G.o)<CH164.poolR+.2&&R.y<.6){Q.hit=1;ch164Slow()}
      ch164Drop(G.m);ch164Drop(G.w,1);S.globs.splice(i,1)}}
  // puddles bubble, and slow whoever rides through them
  for(let i=S.pools.length-1;i>=0;i--){const Q=S.pools[i],u=Q.m.material.uniforms;Q.t-=dt;Q.g=Math.min(1,Q.g+dt*5);u.t.value=t;u.g.value=1-Math.pow(1-Q.g,3);u.a.value=Math.min(1,Q.t/1.2);
    if(Math.random()<dt*2.5)try{burst(Q.m.position.clone().add(new THREE.Vector3((Math.random()-.5)*1.2,.05,(Math.random()-.5)*1.2)),0x9aff40,1,.1,.6,.5)}catch(_){}
    if(!Q.hit&&R&&R.ph=='run'&&R.y<.3){const ds=R.s-Q.s,dl=R.o-Q.o;if(ds*ds+dl*dl<(CH164.poolR*.95)*(CH164.poolR*.95)){Q.hit=1;ch164Slow()}}
    if(Q.t<=0){ch164Drop(Q.m,1);S.pools.splice(i,1)}}
  // stones crumble off the near lips of the broken stretches ahead
  const ls=ch164LeadS();S.K.gaps.forEach(g=>{const a=g.s-g.len/2,d=a-ls;if(d<-2||d>34)return;g.dT=(g.dT||0)-dt;if(g.dT>0)return;g.dT=.22+Math.random()*.3;if(S.deb.length>14)return;
    const o=(Math.random()-.5)*2*P.hw(g.s)*.9,[x,z,h]=P.at(a+.1+Math.random()*.3,o),m=ch157Rock();m.scale.setScalar(.25+Math.random()*.35);m.position.set(x,h-.05,z);S.root.add(m);
    S.deb.push({m,vy:-.5,t:0,f:a,rx:(Math.random()-.5)*8});if(Math.random()<.5)try{burst(new THREE.Vector3(x,h,z),0x9a8a6a,3,.5,-.2,.6)}catch(_){}});
  for(let i=S.deb.length-1;i>=0;i--){const d=S.deb[i];d.t+=dt;d.vy-=18*dt;d.m.position.y+=d.vy*dt;d.m.rotation.x+=d.rx*dt;if(d.t>1.6){ch164Drop(d.m);S.deb.splice(i,1)}}}
// ---------------- each frame on the trail ----------------
function ch153Tick(dt,now){const S=CH153.S,P=S.P,R=CH153.R,K=S.K;if(!R)return;R.t+=dt;
  if(R.ph=='intro'){R.v=0;if(R.t>3.0){R.ph='run';R.t=0;R.sn.spit=3.5;R.sn.rear=1;try{zt116Show(ZT116.Z[1],'Hillside Crest · Main Quest','RUN!','Skarrith, the Mountain Coil','Space · jump the broken trail   '+(document.body.classList.contains('mob')?'💨':'Shift')+' · boost   avoid the venom','z1')}catch(_){}}}
  else if(R.ph=='run'){
    // speed: one for every mount; v157's boost (3192: ch157Mul); venom slows to CH164.slowK for CH164.slowT s
    const bm=typeof ch157Mul=='function'?ch157Mul(R):1,sl=R.slow>0,want=CH153V.spd*bm*(sl?CH164.slowK:1);
    if(want>R.v||R.jt<0)R.v+=(want-R.v)*Math.min(1,dt*(want>R.v?(bm>1?7:sl?2:3.2):(sl?12:2.6)));R.slow=Math.max(0,R.slow-dt);   // in the air the mount keeps its speed
    // steering (A/D, arrows, the stick)
    const st=(K_d()?1:0)-(K_a()?1:0)+(typeof dp!='undefined'?dp[0]:0);R.steer=(R.steer||0)+((st)-(R.steer||0))*Math.min(1,dt*10);
    const hw=P.hw(R.s);R.o=Math.max(-hw+.55,Math.min(hw-.55,R.o+R.steer*P.sgn*CH153V.lat*dt*(sl?.7:1)));   // +o is the screen's right when P.sgn is 1
    // the jump: the mount leaps at least at full stride
    if(CH153.jumpQ>0){CH153.jumpQ-=dt;if(R.jt<0&&R.y<.05){R.jt=0;CH153.jumpQ=0;if(K.gaps.some(q=>q.s-q.len/2>R.s-.5&&q.s-q.len/2<R.s+7))R.v=Math.max(R.v,CH153V.spd*CH164.leap);R.jumps=(R.jumps||0)+1;try{svSnd('whoosh',.8,1.2)}catch(_){}}}
    if(R.jt>=0){R.jt+=dt;const k=R.jt/CH153V.jumpT;R.y=k>=1?0:CH153V.jumpH*Math.sin(k*Math.PI);if(k>=1){R.jt=-1;R.y=0;try{burst(gY(pl.position,.2),0xa89878,10,1,1,.4);svSnd('step',.7,.8)}catch(_){}}}
    R.s+=R.v*dt;
    // a broken stretch under you, not in the air: you fall
    const g=ch153GapAt(R.s,CH164.edge);if(g&&R.y<.15){ch153Die('fall',g)}
    else{// the cue before the first broken stretches: JUMP!
      const nx=K.gaps.find(q=>q.s-q.len/2>R.s);R.nextGap=nx?nx.s-nx.len/2-R.s:99;if(nx&&R.nextGap<R.v*1.1+2&&(CH153.cueN||0)<3&&R.cue!==nx.s){R.cue=nx.s;CH153.cueN=(CH153.cueN||0)+1;try{pickup({ic:'🕳',t:'Broken trail — JUMP!',col:'#ffd27a',sub:'Space'})}catch(_){}}
      if(R.s>=P.S-6.5)ch153Win()}}
  else if(R.ph=='dead'){const D=R.dead;D.t+=dt;R.v=0;
    if(D.why=='fall'){D.vy-=17*dt;R.y=Math.max(-7,R.y+D.vy*dt);R.o*=1-dt}
    if(D.t>2.4&&!D.fade){D.fade=1;fadeTo(()=>{pl.visible=true;if(mModel)mModel.visible=true;ch153Reset(false)})}}
  else if(R.ph=='win'){const W2=R.win;W2.t+=dt;R.v=Math.max(2.5,R.v*.97);R.s=Math.min(P.S-.5,R.s+R.v*dt);R.o*=.9;
    if(W2.t>.5&&!W2.slam){W2.slam=1;try{shake(.7);svSnd('heavy',1.4,.6);svSnd('crack',1.2,.7);const [x,z,h]=P.at(P.S-13,0);burst(new THREE.Vector3(x,h+3,z),0x9a8a6a,60,4,3,1.6)}catch(_){}}
    if(W2.t>2.0&&!W2.fade){W2.fade=1;ch153Finish()}}
  ch153SnakeTick(dt,now);ch153FxTick(dt,now);ch153Place();
  // venom drips from the mount while slowed
  if(R.ph=='run'&&R.slow>0&&Math.random()<dt*20)try{burst(pl.position.clone().add(new THREE.Vector3((Math.random()-.5),.5,(Math.random()-.5))),0x8aff3a,1,.3,-.5,.5)}catch(_){}
  // in the tunnel the light drops
  const tn=R.s>600&&R.s<690;R.dark=(R.dark||0)+((tn?1:0)-(R.dark||0))*Math.min(1,dt*2)}
// ---------------- the HUD: the distance meter ----------------
(function(){const st=document.createElement('style');st.textContent=`
#ch153h .hp{display:none}
#ch153h .gap{width:320px;height:14px;overflow:visible;margin-top:4px;background:linear-gradient(90deg,rgba(150,10,0,.55),rgba(0,0,0,.55) 30%)}
#ch153h .gap i{border-radius:7px;background:linear-gradient(90deg,#ff3a20,#ffb040 40%,#7adf60);transition:width .12s}
#ch153h .gap b.sn{left:-12px;top:-7px;font-size:22px}#ch153h .gap b.me{top:-8px;font-size:20px;transform:translateX(-50%) scaleX(-1);transition:left .12s}
#ch153h .gap.hot{animation:ch164hot .5s infinite}@keyframes ch164hot{50%{box-shadow:0 0 12px 3px rgba(255,40,0,.85)}}
#ch153h .dl{font:700 12px system-ui,sans-serif;letter-spacing:.04em}#ch153h .dl.hot{color:#ff6a4a}
#ch164v{position:absolute;inset:0;pointer-events:none;z-index:4;opacity:0;box-shadow:inset 0 0 110px 30px rgba(90,230,20,.75)}`;document.head.appendChild(st);
  const h=$('ch153h');if(h){const g=h.querySelector('.gap');if(g){const me=document.createElement('b');me.className='me';me.textContent='🐎';g.appendChild(me);const dl=document.createElement('div');dl.className='dl';g.parentNode.insertBefore(dl,g.nextSibling)}
    const k=h.querySelector('.k');if(k)k.textContent='Space · jump   A / D · steer';const w=h.querySelector('.warn');if(w)w.textContent='⚠ BROKEN TRAIL — JUMP!'}
  const v=document.createElement('div');v.id='ch164v';($('stage')||document.body).appendChild(v)})();
var CH164H={full:30};
function ch153Hud(){const el=$('ch153h');const on=ch153Run()&&!(typeof uiOpen=='function'&&uiOpen());el.classList.toggle('hide',!on);$('ch153g').classList.toggle('hide',!on);$('ch153v').style.opacity=0;
  try{const mb=$('mbtn');if(on&&mb&&!CH153.btn){const b=document.createElement('button');b.className='ch153j';b.textContent='🦘';b.title='Jump';mb.appendChild(b);CH153.btn=b;b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();CH153.jumpQ=.18})}
    if(CH153.btn)CH153.btn.style.display=on?'':'none'}catch(_){}
  const sv=$('ch164v');if(!on){if(sv)sv.style.opacity=0;return}
  const R=CH153.R,gap=Math.max(0,R.s-R.sn.s),f=Math.min(1,gap/CH164H.full),hot=R.ph=='run'&&gap<10,g=el.querySelector('.gap');
  g.querySelector('i').style.width=(f*100).toFixed(1)+'%';const me=g.querySelector('b.me');if(me)me.style.left=(f*100).toFixed(1)+'%';g.classList.toggle('hot',hot);
  const dl=el.querySelector('.dl');if(dl){dl.textContent=R.ph=='dead'?(R.dead.why=='fall'?'🕳 You fell':'🐍 Caught!'):'🐍 Skarrith · '+Math.round(gap)+' m behind'+(gap>=CH164H.full?'+':'');dl.classList.toggle('hot',hot||R.ph=='dead')}
  el.querySelector('.warn').style.opacity=R.ph=='run'&&R.nextGap!=null&&R.nextGap<R.v*.9+1.5?1:0;
  if(sv)sv.style.opacity=R.ph=='run'&&R.slow>0?(.35+.65*R.slow/CH164.slowT).toFixed(2):0}
