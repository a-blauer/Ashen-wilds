// ================= v153 The Hilltop Ascent — the chase =================
// Mistmere's (Hillside Crest II) gateway to III is gone: at the far edge of its gateway clearing a worn road climbs away into the
// hills (F · "Ascend to the hilltops"; a mount is needed). Riding up it starts the main quest's second chapter, played once:
// Skarrith, the Mountain Coil, comes down the mountain behind you and you race it up the trail to a crack in the summit rock too
// narrow for it. Through the crack lies The Galecliffs (III); from then on the road leads straight there.
//  * Riding: the mount runs on by itself at one speed for everyone (CH153V.spd: no mount bonuses here); A / D (← →, the stick)
//    steer, Space jumps (the 🦘 button on touch screens). The camera rides behind, along the trail.
//  * Three hits and you are done (CH153V.hp): a crash (boulders, spikes, tunnel pillars, logs you did not jump, rolling rockslide
//    boulders, a gap you did not jump), a venom glob landing on you, a venom puddle, a strike of its head. A crash also slows you
//    for a moment (CH153V.stumT); after any hit you are safe for CH153V.inv s.
//  * The snake (ch153SnakeTick): it follows the trail; it closes in when far behind and eases off when right on you (CH153V.band),
//    so a crash costs ground but never decides the run alone. It spits venom (phases by s: CH153C.venom), lunges with its head
//    (telegraphed: steer away), and if it reaches you it swallows you whole. Rockslides roll across the trail (telegraphed: rumble,
//    dust on the wall above). On the bridge the planks fall away behind you; in the tunnel only its eyes show.
//  * Losing: swallowed or out of hits → a short scene, then the chase starts again at the foot of the trail.
//  * Inside: companions wait, you stay mounted, no fighting, no recall (a 🏳 button gives up and rides back down to Mistmere).
var CH153Q={st:0};
var CH153V={hole:1,spd:8.2,lat:6.6,stumT:.9,stumV:2.3,inv:1.3,jumpT:.74,jumpH:2.05,hp:3,gap0:16,band:[11,.14,-1.0,2.6],slow0:6.4,catch:2.6,strike:[22,15,9]};
var CH153={S:null,R:null,err:0,jumpQ:0,btn:null};
function ch153Done(){return CH153Q.st>=2||insReach(1)>=2}
function ch153In(){return sp152Here('ascent')}
function ch153Run(){return ch153In()&&!!CH153.R}
// ---------------- the world ----------------
function ch153Build(){if(CH153.S)return CH153.S;const P=ch153Path(),K=ch153Course(),root=new THREE.Group();root.name='HilltopAscent';scene.add(root);
  const S={P,K,root,obs:[],planks:[],arches:[],slides:[],globs:[],pools:[],t:0};CH153.S=S;
  const put=(m,s,o,y,turn)=>{const [x,z,h]=P.at(s,o);m.position.set(x,h+(y||0),z);m.rotation.y=P.yaw(s)+(turn||0);root.add(m);return m};
  // obstacles (collision sizes: w across, l along, h height you must clear by jumping; Infinity = no jumping over it)
  const SZ={boulder:[2.5,2.2,99],log:[99,.9,.85],spike:[1.35,1.2,99],pillar:[1.6,1.5,99],gap:[99,0,0]};
  K.O.forEach(q=>{const sz=SZ[q.k];const o={k:q.k,s:q.s,o:q.o,w:sz[0],l:q.len||sz[1],h:sz[2],plank:!!q.plank};S.obs.push(o);
    if(q.k=='gap'){if(!q.plank){[-1,1].forEach(e=>put(ch153Ob('gapEdge'),q.s+e*(q.len/2+.2),0,0,0))}return}
    const m=ch153Ob(q.k);if(m)o.m=put(m,q.s,q.o,0,q.k=='log'?Math.PI/2:Math.random()*6)});
  // the bridge: planks every .6 along it (none where the plank gaps are), posts and ropes on both sides
  const B=K.bridge,gaps=S.obs.filter(o=>o.plank);for(let s=B[0];s<=B[1];s+=.6){if(gaps.some(g=>Math.abs(s-g.s)<g.l/2))continue;const m=put(ch153Plank(),s,0,-.05,0);m.scale.x=(P.hw(s)*2+.4)/3.6;S.planks.push({s,m,f:0,vy:0})}
  for(let s=B[0];s<=B[1];s+=3)[-1,1].forEach(e=>put(ch153Post(),s,e*(P.hw(s)+.3),-.05,0));
  {const pts=[[],[]];for(let s=B[0];s<=B[1];s+=1)[-1,1].forEach((e,i)=>{const [x,z,h]=P.at(s,e*(P.hw(s)+.3));pts[i].push(new THREE.Vector3(x,h+1.2-.25*Math.sin((s-B[0])/(B[1]-B[0])*Math.PI),z))});
    pts.forEach(p=>{const c=new THREE.CatmullRomCurve3(p),g=new THREE.TubeGeometry(c,140,.05,5,false),m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:CH153M.rope}));m.userData.psNo=1;root.add(m)})}
  // the tunnel: rock arches
  for(let s=K.tunnel[0];s<=K.tunnel[1];s+=6)S.arches.push(put(ch153Arch(),s,0,-.1,0));
  // the summit crack, facing the trail
  S.crack=put(ch153Crack(),P.S-3.5,0,-.1,Math.PI);
  // the serpent
  S.sn=ch153Snake(root,46);
  // venom pool / warning pools (made on demand), dust
  return S}
// ---------------- the run ----------------
function ch153Reset(first){const S=ch153Build(),P=S.P,K=S.K;
  CH153.R={s:K.start,o:0,v:0,y:0,jt:-1,hp:CH153V.hp,inv:0,stum:0,ph:'intro',t:first?0:1.1,t0:first?0:1.1,vT:0,slide:0,
    sn:{s:CH153V.hole,v:0,o:0,lift:0,rear:0,jaw:.2,st:'intro',t:0,spit:0,strike:null,next:0,eye:1,em:0,drop:0},hit:0,dead:null,win:null,fx:0,warned:{}};
  S.globs.forEach(g=>{root(g.m);root(g.w)});S.globs.length=0;S.pools.forEach(p=>root(p.m));S.pools.length=0;S.slides.forEach(b=>root(b.m));S.slides.length=0;
  S.planks.forEach(q=>{q.f=0;q.vy=0;q.m.visible=true;const [x,z,h]=P.at(q.s,0);q.m.position.set(x,h-.05,z);q.m.rotation.set(0,P.yaw(q.s),0)});
  K.slides.forEach(q=>q.done=0);
  function root(m){if(m&&m.parent)m.parent.remove(m)}
  try{if(!riding)ch153Mount()}catch(e){console.warn('v153 mount',e)}
  ch153Place()}
// mount the active mount whatever the usual checks say (the chase is mounted only)
function ch153Mount(){if(riding||!mounts.length)return;const m=mOf(mActive)||mounts[0];mActive=m.id;riding=m;mModel=mountModel(m.k);mModel.position.copy(pl.position);mModel.rotation.y=pl.rotation.y;scene.add(mModel);hud()}
function ch153Place(){const R=CH153.R,P=CH153.S.P;const [x,z,h]=P.at(R.s,R.o);pl.position.set(x,h+R.y,z);pl.rotation.y=P.yaw(R.s)-(R.steer||0)*.35;
  if(typeof mModel!='undefined'&&mModel){mModel.position.copy(pl.position);mModel.rotation.y=pl.rotation.y}}
function ch153Hit(why){const R=CH153.R;if(!R||R.inv>0||R.ph!='run')return false;R.hp--;(R.log||(R.log=[])).push([why,Math.round(R.s),+R.o.toFixed(1),+R.y.toFixed(1)]);R.inv=CH153V.inv;R.hit=.5;
  try{flash(why=='venom'||why=='pool'?'rgba(120,255,40,.75)':'rgba(255,80,30,.7)');shake(why=='crash'||why=='strike'?.32:.18);svSnd(why=='venom'||why=='pool'?'splash':'heavy',1,1.1)}catch(_){}
  if(why=='crash'){R.stum=CH153V.stumT}
  if(R.hp<=0)ch153Die('hits');else{try{pickup({ic:'💔',t:R.hp+' left',col:'#ff7a5a',sub:{crash:'You crashed',venom:'Venom!',pool:'You rode through venom',strike:'Its fangs caught you'}[why]||'Hit'})}catch(_){}}
  return true}
function ch153Die(why){const R=CH153.R;if(R.ph!='run')return;R.ph='dead';R.dead={why,t:0};R.v=0;
  try{svSnd(why=='swallow'?'roar':'hiss',1.2,why=='swallow'?.8:1);shake(.5)}catch(_){}
  say(why=='swallow'?'🐍 <b>Skarrith swallowed you whole.</b> The chase starts again.':'🐍 <b>The serpent wore you down.</b> The chase starts again.')}
function ch153Win(){const R=CH153.R;if(R.ph!='run')return;R.ph='win';R.win={t:0};try{zt116Show(ZT116.Z[1],'Hillside Crest · Main Quest','Through!','Skarrith slams into the rock behind you','The Galecliffs lie beyond','z1');svSnd('roar',1.2,.75)}catch(_){}}
// the snake: speed, venom, strikes, and laying the model
function ch153SnakeTick(dt,now){const S=CH153.S,P=S.P,K=S.K,R=CH153.R,N=R.sn,gap=R.s-N.s;
  // v157: it bursts out of the ground on the trail behind you (CH153V.hole), towers over you, then drops onto the trail
  // (N.em: risen 0..1 from ch153EmT, N.drop: lowered 0..1; the debris, cracks, roar and the camera are 3192's)
  if(R.ph=='intro'){N.st='intro';N.t+=dt;const te=R.t-ch153EmT(R);N.s=CH153V.hole;N.o=0;N.v=0;N.rear=0;
    N.em=te<0?0:Math.min(1,te/.55);N.drop=Math.max(0,Math.min(1,(R.t-2.35)/.6));
    if(R.t>2.8&&!N.slam){N.slam=1;try{shake(.35);svSnd('heavy',1.1,.8);const [x,z,h]=ch153Ext(P,CH153V.hole+2.5,0);burst(new THREE.Vector3(x,h+.5,z),0x9a8a6a,30,3,2.2,1.2)}catch(_){}}}
  else if(R.ph=='run'){const B=CH153V.band;let v=CH153V.spd*.93+Math.max(B[2],Math.min(B[3],(gap-B[0])*B[1]));if(R.t<3)v=Math.min(v,CH153V.slow0);N.v+=(v-N.v)*Math.min(1,dt*2);N.s+=N.v*dt;
    if(gap<CH153V.catch){ch153Die('swallow');return}
    // venom: the current phase sets how often and how many
    const ph=K.venom.filter(q=>R.s>=q[0]).pop();if(ph&&!N.strike){N.spit-=dt;if(N.spit<=0){N.spit=ph[1]*(.85+Math.random()*.3);N.rear=1;N.spitAt=.42;N.spitN=ph[2]}}
    if(N.spitAt!=null){N.spitAt-=dt;if(N.spitAt<=0){N.spitAt=null;ch153Spit(N.spitN)}}
    // strikes: every so often when close enough, telegraphed, the head shoots forward to where you were
    const sk=CH153V.strike;N.next-=dt;const busy=S.obs.some(q=>q.k!='gap'&&q.k!='log'&&q.s>R.s-2&&q.s<R.s+R.v*1.1+5);   // never a strike while you are dodging rocks
    if(!N.strike&&N.next<=0&&gap<sk[0]&&R.s>110&&!busy){N.next=R.s>600?sk[2]:sk[1];N.strike={t:0,o:R.o,s0:N.s};try{svSnd('hiss',1.2,.8)}catch(_){}}
    if(N.strike){const T=N.strike;T.t+=dt;if(T.t<.75)T.o+=(R.o-T.o)*Math.min(1,dt*3.2);   // it tracks you while it draws back, then commits
      if(T.t>=1.05&&!T.hit){T.hit=1;if(Math.abs(R.o-T.o)<1.25&&R.y<1.2)ch153Hit('strike');else try{pickup({ic:'💨',t:'Dodged!',col:'#c8ff90'})}catch(_){}}
      if(T.t>1.6)N.strike=null}}
  else if(R.ph=='win'){N.s=Math.min(N.s+N.v*dt,P.S-13);N.v*=.9}
  N.rear=Math.max(0,N.rear-dt*1.6);N.o+=((R.ph=='run'?R.o*.5:0)-N.o)*Math.min(1,dt*1.5);
  ch153SnakeAnim(now)}
// when Skarrith erupts in the intro (s of R.t): a restart (t starts at 1.4) gets a quicker version
function ch153EmT(R){return R&&R.t0>0?R.t0+.3:.75}
// a spot on the trail, or (s < 0) on the ground of the run-off below its foot, straight on along the trail's first heading
function ch153Ext(P,s,o){if(s>=0)return P.at(s,o);const [x0,z0]=P.at(0,o),d=-s,x=x0-P.TX[0]*d,z=z0-P.TZ[0]*d;return [x,z,GH(x,z)]}
function ch153SnakeAnim(now){const S=CH153.S,P=S.P,R=CH153.R,N=R.sn,M=S.sn,t=now/1000,HO=CH153V.hole;
  // v157: before the foot of the trail the body lies on the real ground (it used to float 10–16 above the slope, out of the
  // intro camera's view: the 'missing' serpent); behind the hole it dives back into the ground it came out of
  const slope=(s,o)=>ch153Ext(P,s,o);
  // the head: raised, rearing back to spit, lunging on a strike, over you when it swallows
  let hs=N.s,ho=N.o,hy=2.4+N.rear*1.8,jaw=.18+.12*Math.sin(t*3),pitch=.12;
  // a strike comes from the side: the neck swings out over the drop beside you (the wind-up), then the head lunges across the
  // trail at your lane, and draws back
  let face=null;if(N.strike){const T=N.strike,hw=P.hw(R.s),side=hw+3.4,A=[N.s,N.o,hy],Bw=[R.s-3.6,side,3.6],C=[R.s-.5,T.o,1.25];
    const e=x=>x*x*(3-2*x),L=(p,q,k)=>[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,p[2]+(q[2]-p[2])*k];let p;
    if(T.t<.75){p=L(A,Bw,e(T.t/.75));jaw=.35+.4*T.t/.75}else if(T.t<1.05){p=L(Bw,C,e((T.t-.75)/.3));jaw=.95}else{p=L(C,A,e(Math.min(1,(T.t-1.05)/.55)));jaw=.6}
    hs=p[0];ho=p[1];hy=p[2];face=T.t<1.05?[R.s-.5,T.o]:null;pitch=T.t<1.05?.15:.05}
  if(R.ph=='dead'&&R.dead.why=='swallow'){const k=Math.min(1,R.dead.t/.6);hs=N.s+(R.s-N.s)*k;ho=N.o+(R.o-N.o)*k;hy=2.4-1.0*k;jaw=R.dead.t<.55?1:Math.max(.1,1-(R.dead.t-.55)*3);pitch=.35}
  if(R.ph=='win'&&R.win.t>.5){jaw=.9;hy=1.6;pitch=-.1}
  if(N.rear>.05){jaw=Math.max(jaw,.35+.5*N.rear);pitch=-.25*N.rear}
  // v157 the emergence: the head shoots up out of the ground (roaring at the sky), towers and sways, glares down at you, then
  // lowers to its chase height (4.2 = 2.4 + a full rear, which the run starts with)
  const emg=R.ph=='intro',lx=-P.TZ[0]*P.sgn,lz=P.TX[0]*P.sgn;let em=0;
  if(emg){em=N.em||0;const d=N.drop||0,eo=1-Math.pow(1-em,3),dd=d*d*(3-2*d),top=-2.5+11.5*eo+.35*Math.sin(t*2.1)*em,k2=Math.max(0,Math.min(1,(R.t-ch153EmT(R)-.55)/.35));
    hs=HO;ho=.45*Math.sin(t*1.9)*em*(1-dd);hy=top+(4.2-top)*dd;
    pitch=em<1?-.95+.5*em:dd>0?.3*(1-dd)+.12*dd:-.45+.75*k2;jaw=em<1?1:dd>0?.9-.55*dd:.75+.18*Math.sin(t*7)}
  M.head.visible=!(emg&&em<=0);if(emg)M.hood.scale.set(1+.12*em,1,1);
  const [hx,hz,hh]=slope(hs,ho);M.head.position.set(hx,hh+hy,hz);let ya=hs>=0?P.yaw(Math.max(0,hs)):P.yaw(0);if(face){const [fx,fz]=P.at(face[0],face[1]);ya=Math.atan2(fx-hx,fz-hz)}
  M.head.rotation.set(pitch,ya+(face?0:.12*Math.sin(t*1.7)),.06*Math.sin(t*2.3),'YXZ');
  M.jaw.rotation.x=jaw*.9;if(!emg)M.hood.scale.set(1+.15*N.rear,1,1);
  // the body along the trail behind it, slithering
  const pts=[],[Hx,Hz,Hh]=slope(HO,0),bx=-P.TX[0],bz=-P.TZ[0];
  for(let i=0;i<M.n;i++){let r=1.55*(1-Math.pow(i/M.n,1.6)*.82);
    if(emg){const l=1.9+i*1.32,py=hh+hy-l*.95,sw=Math.sin(l*.45-t*2.4)*.55*em*Math.min(1,l/4)+ho*Math.max(0,1-l/5);if(py<Hh-r*1.3||em<=0)r=0;pts.push([Hx+lx*sw+bx*.15*l*0,py,Hz+lz*sw,r]);continue}   // a coiling column out of the hole
    const s=N.s-1.9-i*1.32,hw=P.hw(Math.max(0,s)),near=Math.max(0,Math.min(1,(s-HO)/3)),o=Math.max(-hw+.4,Math.min(hw-.4,(N.o*Math.max(0,1-i/8)+.95*Math.sin(t*3.1-i*.42))*(s<HO+3?near:1)));
    const neck=i<3?(hy-1.2)*(1-i/3):0;
    if(s<HO){const py=Hh+r*.82-(HO-s)*1.1+neck;if(py<Hh-r*1.3)r=0;pts.push([Hx,py,Hz,r]);continue}   // still coming out of the hole
    const [x,z,h]=slope(s,o);let px=x,py=h+r*.82+.12*Math.sin(t*4-i*.6)+neck,pz=z;pts.push([px,py,pz,r])}
  ch153SnakeLay(M,pts)}
// venom: n globs from the mouth to where you will be (leading you), each warned on the ground, each leaving a puddle
// (v155: split in two so in co-op the lead player plans the volley at a rider and everyone spawns the same globs)
function ch153Spit(n){const R=CH153.R;ch153SpitSpawn(ch153SpitPlan(n,R.s,R.o,R.v),n)}
function ch153SpitPlan(n,s,o,v){const S=CH153.S,P=S.P,T=1.05;
  // fairness: venom never lands on or right beside an obstacle (no boulder-or-puddle choices)
  const clear=v=>{for(let k=0;k<4;k++){const q=S.obs.find(q=>Math.abs(q.s-v)<3+(q.l||0)/2);if(!q)return v;v=q.s+(v>=q.s?1:-1)*(3.4+(q.l||0)/2)}return v};
  // one glob: at you · two: one behind the other on your line (step aside) · three: a wall across the trail (jump it)
  const L=[];for(let i=0;i<n;i++){const ls=clear(s+Math.max(4,v)*T+(n==2?i*2.6:0)+(n>=3?(Math.random()-.5)*.6:0)),hw=P.hw(ls),lo=Math.max(-hw+.6,Math.min(hw-.6,n>=3?(i-(n-1)/2)*1.75:o+(Math.random()-.5)*.4));L.push([ls,lo])}
  return L}
function ch153SpitSpawn(L,n){const S=CH153.S,P=S.P,M=S.sn,T=1.05,from=M.head.position.clone().add(new THREE.Vector3(0,-.4,0));try{svSnd('hiss',1,1.3)}catch(_){}
  if(n>=3&&!CH153.wallHint){CH153.wallHint=1;setTimeout(()=>{try{pickup({ic:'🦘',t:'JUMP the venom wall!',col:'#9aff40',sub:'Space'})}catch(_){}},250)}
  L.forEach(([ls,lo],i)=>{const [x,z,h]=P.at(ls,lo),g=ch153Glob(),w=ch153Warn();g.position.copy(from);w.position.set(x,h+.08,z);w.scale.setScalar(1.35);S.root.add(g);S.root.add(w);
    S.globs.push({m:g,w,a:from.clone(),b:new THREE.Vector3(x,h,z),s:ls,o:lo,t:0,T:T+i*.08})})}
// the furthest rider up the trail (co-op: 3180 sets CH153.lead to the leading partner's spot): rockslides start from it
function ch153LeadS(){const R=CH153.R;return Math.max(R&&R.ph=='run'?R.s:-1e9,CH153.lead!=null?CH153.lead:-1e9)}
function ch153FxTick(dt,now){const S=CH153.S,P=S.P,R=CH153.R;
  // globs fly and land
  for(let i=S.globs.length-1;i>=0;i--){const G=S.globs[i];G.t+=dt;const k=Math.min(1,G.t/G.T);G.m.position.lerpVectors(G.a,G.b,k);G.m.position.y+=Math.sin(k*Math.PI)*5;G.w.material.uniforms.k.value=k;
    if(k>=1){try{burst(G.b.clone().add(new THREE.Vector3(0,.3,0)),CH153M.venom,18,1.6,2.2,.6)}catch(_){}
      if(R.ph=='run'&&Math.abs(R.s-G.s)<1.35&&Math.abs(R.o-G.o)<1.35&&R.y<.6)ch153Hit('venom');
      const pm=ch153Pool();pm.position.set(G.b.x,G.b.y+.05,G.b.z);pm.scale.setScalar(1.15);S.root.add(pm);S.pools.push({m:pm,s:G.s,o:G.o,t:4.5,hit:0});
      S.root.remove(G.m);S.root.remove(G.w);S.globs.splice(i,1)}}
  for(let i=S.pools.length-1;i>=0;i--){const Q=S.pools[i];Q.t-=dt;Q.m.material.opacity=.72*Math.min(1,Q.t/1.2);Q.m.scale.setScalar(1.15*(1+.04*Math.sin(now/120+i)));
    if(!Q.hit&&R.ph=='run'&&Math.abs(R.s-Q.s)<1.1&&Math.abs(R.o-Q.o)<1.1&&R.y<.3){Q.hit=1;ch153Hit('pool')}
    if(Q.t<=0){S.root.remove(Q.m);S.pools.splice(i,1)}}
  // rockslides: a rumble and dust on the wall above, then boulders bounce down and roll across the trail
  // (seeded, so co-op partners see the same boulders)
  S.K.slides.forEach((q,qi)=>{if(q.done||ch153LeadS()<q[0]-34)return;q.done=1;try{svSnd('crack',1.2,.7);shake(.2)}catch(_){}const rn=ab152R(1530+qi*71);
    for(let i=0;i<q[1];i++){const s=q[0]+i*5.5+(rn()-.5)*2,hw=P.hw(s),[x,z,h]=P.at(s,-hw-7);try{burst(new THREE.Vector3(x,h+5,z),0xa89878,22,2.4,2,1.4)}catch(_){}
      const m=ch153Ob('slide');m.position.set(x,h+6,z);S.root.add(m);S.slides.push({m,s,o:-hw-7,y:6,vo:4.6+rn()*1.2,vy:0,t:-.9-i*.55,sp:rn()*4})}});
  for(let i=S.slides.length-1;i>=0;i--){const b=S.slides[i];b.t+=dt;if(b.t<0)continue;b.o+=b.vo*dt;b.vy-=22*dt;b.y+=b.vy*dt;const hw=P.hw(b.s);const ground=b.o>hw+1.2?-(b.o-hw-1.2)*2.2:0;
    if(b.y<ground+1.0){b.y=ground+1.0;b.vy=Math.abs(b.vy)*.42;if(Math.abs(b.o)<hw+2)try{shake(.06)}catch(_){}}
    const [x,z,h]=P.at(b.s,b.o);b.m.position.set(x,h+b.y,z);b.m.rotation.x+=b.vo*dt*.9;b.m.rotation.z+=dt*b.sp;
    if(R.ph=='run'&&Math.abs(R.s-b.s)<1.3&&Math.abs(R.o-b.o)<1.35&&R.y<b.y+.2)ch153Hit('crash');
    if(b.o>hw+14){S.root.remove(b.m);S.slides.splice(i,1)}}
  // the bridge: planks fall away under and behind the snake
  const sn=R.sn.s;S.planks.forEach(q=>{if(!q.f&&q.s<sn+1.5&&R.ph=='run'){q.f=1;q.vy=0}if(q.f&&q.m.visible){q.vy-=18*dt;q.m.position.y+=q.vy*dt;q.m.rotation.x+=dt*2;q.m.rotation.z+=dt*1.3;if(q.vy<-30)q.m.visible=false}})}
// ---------------- each frame on the trail ----------------
function ch153Tick(dt,now){const S=CH153.S,P=S.P,R=CH153.R,K=S.K;if(!R)return;R.t+=dt;
  if(R.ph=='intro'){R.v=0;if(R.t>3.0){R.ph='run';R.t=0;R.sn.spit=3;R.sn.next=8;R.sn.rear=1;try{zt116Show(ZT116.Z[1],'Hillside Crest · Main Quest','RUN!','Skarrith, the Mountain Coil','Space · jump   A / D · steer   '+(document.body.classList.contains('mob')?'💨':'Shift')+' · boost','z1')}catch(_){}}}
  else if(R.ph=='run'){
    // speed: one for every mount; a crash slows you for a moment
    // v157: a boost (Shift / the dash button, 3192) spurs the mount on: ch157Mul gives the speed factor
    const bm=typeof ch157Mul=='function'?ch157Mul(R):1,want=R.stum>0?CH153V.stumV:CH153V.spd*bm;R.v+=(want-R.v)*Math.min(1,dt*(want>R.v?(bm>1?7:2.2):(R.stum>0?9:2.6)));R.stum=Math.max(0,R.stum-dt);R.inv=Math.max(0,R.inv-dt);
    // steering (A/D, arrows, the stick)
    const st=(K_d()?1:0)-(K_a()?1:0)+(typeof dp!='undefined'?dp[0]:0);R.steer=(R.steer||0)+((st)-(R.steer||0))*Math.min(1,dt*10);
    const hw=P.hw(R.s);R.o=Math.max(-hw+.55,Math.min(hw-.55,R.o+R.steer*P.sgn*CH153V.lat*dt*(R.stum>0?.5:1)));   // +o is the screen's right when P.sgn is 1
    // the jump
    if(CH153.jumpQ>0){CH153.jumpQ-=dt;if(R.jt<0&&R.y<.05){R.jt=0;CH153.jumpQ=0;try{svSnd('whoosh',.8,1.2)}catch(_){}}}
    if(R.jt>=0){R.jt+=dt;const k=R.jt/CH153V.jumpT;R.y=k>=1?0:CH153V.jumpH*Math.sin(k*Math.PI);if(k>=1){R.jt=-1;R.y=0;try{burst(gY(pl.position,.2),0xa89878,10,1,1,.4)}catch(_){}}}
    const s0=R.s;R.s+=R.v*dt;
    // obstacles: a crash unless you are high enough over them (or still safe after the last hit)
    for(const o of S.obs){if(Math.abs(R.s-o.s)>o.l/2+.6)continue;
      if(o.k=='gap'){if(R.y<.15&&R.inv<=0&&s0<o.s+o.l/2-.25&&R.s>o.s-o.l/2+.25){if(ch153Hit('crash')){R.s=o.s+o.l/2+.4;R.jt=-1;R.y=0;try{pickup({ic:'🕳',t:'You fell short!',col:'#ff9a5a',sub:'Your mount scrambles up the far side'})}catch(_){}}}continue}
      if(Math.abs(R.o-o.o)<o.w/2+.42&&R.y<o.h)ch153Hit('crash')}
    if(R.s>=P.S-6.5)ch153Win()}
  else if(R.ph=='dead'){const D=R.dead;D.t+=dt;R.v=0;if(D.why=='swallow'&&D.t>.55){pl.visible=false;if(mModel)mModel.visible=false}
    if(D.t>2.2&&!D.fade){D.fade=1;fadeTo(()=>{pl.visible=true;if(mModel)mModel.visible=true;ch153Reset(false)})}}
  else if(R.ph=='win'){const W2=R.win;W2.t+=dt;R.v=Math.max(2.5,R.v*.97);R.s=Math.min(P.S-.5,R.s+R.v*dt);R.o*=.9;
    if(W2.t>.5&&!W2.slam){W2.slam=1;try{shake(.7);svSnd('heavy',1.4,.6);svSnd('crack',1.2,.7);const [x,z,h]=P.at(P.S-13,0);burst(new THREE.Vector3(x,h+3,z),0x9a8a6a,60,4,3,1.6)}catch(_){}}
    if(W2.t>2.0&&!W2.fade){W2.fade=1;ch153Finish()}}
  R.hit=Math.max(0,R.hit-dt);
  ch153SnakeTick(dt,now);ch153FxTick(dt,now);ch153Place();
  // the mount blinks while you are safe after a hit
  if(typeof mModel!='undefined'&&mModel&&R.ph=='run')mModel.visible=!(R.inv>0&&Math.floor(now/90)%2);
  // in the tunnel the light drops and the snake's eyes glow
  const tn=R.s>K.tunnel[0]-4&&R.s<K.tunnel[1]+4;R.dark=(R.dark||0)+((tn?1:0)-(R.dark||0))*Math.min(1,dt*2)}
function K_a(){return !!(K.a||K.arrowleft)}function K_d(){return !!(K.d||K.arrowright)}
// ---------------- getting in and out ----------------
function ch153Enter(){if(AF)return;if(!mounts.length)return say('🐎 You need a mount to ride the hill path. Build the Stable at the Stronghold Steward in Duskhold and buy one.');
  CH153Q.st=Math.max(1,CH153Q.st);CH153.lv=0;fadeTo(()=>{const S=ch153Build();const [x,z]=S.P.at(S.K.start,0);toPos(x,z,S.P.yaw(S.K.start)+Math.PI);ch153Reset(true);
    setTimeout(()=>{try{zt116Show(ZT116.Z[1],'Hillside Crest · Main Quest','The Hilltop Ascent','A narrow trail up the mountain','','z1')}catch(_){}},200)})}
function ch153Leave(){CH153.R=null;CH153.lv=1;fadeTo(()=>{const G=SP152.gates.ascent,s=G&&G.spot;if(s)toPos(s.x+s.ux*-2.5,s.z+s.uz*-2.5,s.ry);else insArrive(INSL[6])})}
function ch153Finish(){CH153Q.st=2;CH153.lv=1;fadeTo(()=>{CH153.R=null;const N=INSL[7];insArrive(N);insMark(N);
  setTimeout(()=>{try{zt116Show(ZT116.Z[1],'Hillside Crest · Main Quest','The Hilltops','You squeeze through the crack and out onto the high plains','Onward through '+N.n,'z1');mSfx('victory')}catch(_){}},400);
  say('🐍 You escaped Skarrith. <b>'+N.n+'</b> lies ahead.')})}
// ---------------- input: Space jumps (and nothing else does) ----------------
addEventListener('keydown',e=>{if(!ch153Run())return;const k=(e.key||'').toLowerCase(),tg=e.target&&e.target.tagName;if(tg=='INPUT'||tg=='TEXTAREA')return;
  if(k==' '){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)CH153.jumpQ=.18}
  else if(k=='shift'){e.stopImmediatePropagation();e.preventDefault();if(!e.repeat&&typeof ch157Boost=='function')ch157Boost()}   // v157: Shift (the dash key) boosts
  else if(k=='v'||k=='t'){e.stopImmediatePropagation();e.preventDefault()}},{capture:true});
{const f=walk;walk=function(o,dx,dz){if(o===pl&&ch153Run())return;return f.apply(this,arguments)}}
{const f=dodge;dodge=function(){if(ch153Run()){if(typeof ch157Boost=='function')ch157Boost();return}return f.apply(this,arguments)}}   // v157: the dash button boosts
// the mount gallops whatever the keys (it runs on its own) at one pace for everyone
{const f=mountTick;mountTick=function(dt,now,al){if(ch153Run()&&riding){const R=CH153.R,s0=riding.spd;riding.spd=45;try{return f.call(this,dt,now,R.v>.5?1:0)}finally{riding.spd=s0;if(mModel){mModel.position.copy(pl.position);mModel.rotation.y=pl.rotation.y}}}return f.apply(this,arguments)}}
// the camera rides behind along the trail (a look back at the snake during the intro: CH153CAM, v157)
var CH153CAM={yaw:.38,pitch:.26,dist:13};
{const f=loop;loop=function(now){let keep=null;try{if(ch153Run()&&CH153.S){const R=CH153.R,P=CH153.S.P,yw=P.yaw(R.s);keep=[camPitch,camDist];
    const intro=R.ph=='intro'&&R.t<2.75,dead=R.ph=='dead',want=intro?yw-CH153CAM.yaw*P.sgn:dead&&R.dead.why=='swallow'?yw+.9:yw+Math.PI;let d=want-camYaw;d=Math.atan2(Math.sin(d),Math.cos(d));camYaw+=d*Math.min(1,(intro?.08:.12)+0*(R.v));
    // v157: the intro starts with the camera already in front of you, looking back down the trail where Skarrith bursts out
    if(intro&&!R.camSnap){R.camSnap=1;camYaw=want;camPitch=CH153CAM.pitch;camDist=CH153CAM.dist;snapCam();camK=camPitch;camDD=camDist}
    // when the snake is close the camera rises over its head, so its jaws loom at the bottom of the screen
    // as the snake closes in, the camera comes in close behind you, staying in front of its head (it bursts into view when it strikes)
    // v157: closer than ~10 tiles the camera climbs over its head (the following camera lags ~2 tiles behind, so at a short
    // distance it used to sit inside Skarrith's head)
    const gap=R.s-R.sn.s,dh=Math.max(3.8,Math.min(8.8,gap-5.6)),near=R.ph=='run'?Math.max(0,Math.min(1,(10-gap)/6)):0;camPitch=intro?CH153CAM.pitch:dead?.45:Math.min(.95,.34+.75*near);camDist=intro?CH153CAM.dist:dead?8:dh/Math.cos(.34)}}catch(_){}
  try{return f.apply(this,arguments)}finally{if(keep){camPitch=keep[0];camDist=keep[1]}}}}
// ---------------- the HUD ----------------
(function(){const st=document.createElement('style');st.textContent=`
#ch153h{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:7;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:5px;color:#f0ead2;font:600 12px system-ui,sans-serif;text-shadow:0 1px 2px #000}
#ch153h.hide{display:none}#ch153h .hp{display:flex;gap:6px;font-size:22px;filter:drop-shadow(0 1px 2px #000)}#ch153h .hp span.off{opacity:.22;filter:grayscale(1)}
#ch153h .gap{position:relative;width:300px;height:12px;border-radius:7px;background:rgba(0,0,0,.55);border:1px solid rgba(255,220,140,.4);overflow:hidden}
#ch153h .gap i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#ff3a20,#ffb040 55%,#6adf60);transition:width .15s}
#ch153h .gap b{position:absolute;top:-6px;font-size:18px;line-height:1}#ch153h .gap b.sn{left:-2px}#ch153h .k{font-size:11px;color:#d8d0b0}
#ch153h .warn{font:800 15px Cinzel,Georgia,serif;letter-spacing:.12em;color:#ff5a3a;opacity:0;transition:opacity .1s}
#ch153v{position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0;box-shadow:inset 0 -120px 160px -40px rgba(255,30,10,.75)}
#ch153g{position:fixed;right:14px;top:92px;z-index:7;pointer-events:auto;padding:5px 10px;border-radius:8px;border:1px solid rgba(255,220,140,.35);background:rgba(10,8,6,.7);color:#e8e0c8;font:600 12px system-ui,sans-serif;cursor:pointer}
#ch153g.hide{display:none}#mbtn button.ch153j{font-size:20px}`;document.head.appendChild(st);
  const d=document.createElement('div');d.id='ch153h';d.className='hide';d.innerHTML='<div class="hp"></div><div class="gap"><i></i><b class="sn">🐍</b></div><div class="k">Space · jump &nbsp; A / D · steer</div><div class="warn">⚠ STRIKE — swerve!</div>';document.body.appendChild(d);
  const v=document.createElement('div');v.id='ch153v';document.body.appendChild(v);
  const g=document.createElement('button');g.id='ch153g';g.className='hide';g.textContent='🏳 Ride back down';g.addEventListener('click',()=>{if(ch153Run())ch153Leave()});document.body.appendChild(g)})();
function ch153Hud(){const el=$('ch153h');const on=ch153Run()&&!(typeof uiOpen=='function'&&uiOpen());el.classList.toggle('hide',!on);$('ch153g').classList.toggle('hide',!on);$('ch153v').style.opacity=0;
  try{const mb=$('mbtn');if(on&&mb&&!CH153.btn){const b=document.createElement('button');b.className='ch153j';b.textContent='🦘';b.title='Jump';mb.appendChild(b);CH153.btn=b;b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();CH153.jumpQ=.18})}
    if(CH153.btn)CH153.btn.style.display=on?'':'none'}catch(_){}
  if(!on)return;const R=CH153.R,gap=Math.max(0,R.s-R.sn.s);el.querySelector('.hp').innerHTML=[0,1,2].map(i=>'<span class="'+(i<R.hp?'':'off')+'">💚</span>').join('');
  el.querySelector('.gap i').style.width=Math.min(100,gap/26*100)+'%';el.querySelector('.warn').style.opacity=R.sn.strike&&R.sn.strike.t<1.05?1:0;
  $('ch153v').style.opacity=R.ph=='run'?Math.max(0,Math.min(1,(9-gap)/6)):R.ph=='dead'?1:0}
// ---------------- wiring ----------------
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{
    if(ch153In()){const S=ch153Build();S.root.visible=true;if(!CH153.R&&!CH153.lv)ch153Reset(true);ch153Tick(dt,now);if(now-(CH153.hT||0)>100){CH153.hT=now;ch153Hud()}}
    else{CH153.lv=0;if(CH153.S)CH153.S.root.visible=false;if(CH153.R)CH153.R=null;if(!CH153.off){CH153.off=1;try{ch153Hud()}catch(_){}}}
    if(ch153In())CH153.off=0}catch(e){if(!CH153.err++)console.error('v153 ascent',e)}return r}}
{const f=atmos;atmos=function(dt,now){const r=f.apply(this,arguments);try{if(ch153Run()&&CH153.R.dark>.01){const k=1-.72*CH153.R.dark;sun.intensity*=k;hemi.intensity*=k}}catch(_){}return r}}
SP152.R.ascent={park:1,forceMount:'🐎 Not now — it is right behind you!',noFight:'🐍 No time to fight — ride!',noRecall:'🐍 No time — ride for the summit (or 🏳 ride back down).',
  onLoad(){CH153.R=null;const G=SP152.gates.ascent;setTimeout(()=>{try{const I=INSL[6];toPos(I.ba[0],I.ba[1])}catch(_){}},0)}};
// ---------------- the road out of Mistmere ----------------
sp152Gate('ascent',{ig:6,r:3.6,build:ch153GateModel,
  prompt(s){if(ch153Done()){const N=INSL[7];return {label:'F · Ride up to '+N.n+' ('+rpTxt139(N.lv[0])+')',fn:()=>insGo(N)}}
    if(!mounts.length)return {label:'🐎 Ascend to the hilltops · you need a mount for the hill path',fn:()=>say('🐎 The hill path is too long and steep on foot. Build the Stable at the Stronghold Steward in Duskhold and buy a mount.')};
    return {label:'F · Ascend to the hilltops',fn:()=>ch153Enter()}}});
// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.ch153={v:153,st:CH153Q.st}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.ch153;CH153Q.st=q&&typeof q=='object'?Math.max(0,Math.min(2,q.st|0)):0;CH153.R=null}catch(e){console.warn('v153 load',e)}return r}}
// ---------------- the tracker ----------------
SP152.trk.ascent=I=>{if(I.g===6&&!ch153Done())return {name:'The Hilltop Ascent',lines:[['Find the hill road at the end of '+INSL[6].n],[mounts.length?'Ascend to the hilltops (mounted)':'You will need a mount',null,!mounts.length]]};
  if(I.sp==='ascent'&&CH153.R){const R=CH153.R,P=CH153.S.P;return {name:'The Hilltop Ascent',lines:[['Reach the crack in the summit'],['Climbed',Math.round(Math.max(0,R.s)/P.S*100)+'%']]}}
  return null};
// ---------------- the atmosphere: late sun and wind on the heights ----------------
sp152Theme('ascent',{nm:'Serpent’s Spine',sub:'A trail up the mountain to the hilltops',a:{fog:.0055,fc:0xc8a888,fcA:.35,sun:1.0,hemi:.85,ex:1.0,sat:1.1,vig:1.35,sky:1,pt:'gust',pc:0xffffff,po:.45}});
// ---------------- the terrain's snow line ----------------
// The ground shader (0060) paints snow on flat ground above ~10–14 (the zones never climb higher). The trail climbs to ~90, so
// inside the ascent's rectangle the snow line is raised by CH153SN.up: only the summit keeps a dusting.
var CH153SN={r:{value:new THREE.Vector4()},up:{value:66}};
try{const I=sp152I('ascent');CH153SN.r.value.set(I.x0,I.y0,I.x0+I.w,I.y0+I.h);
  GTX.list.forEach(T=>{const m=T.mat;if(!m)return;const ob=m.onBeforeCompile;m.onBeforeCompile=(sh,rn)=>{if(ob)ob.call(m,sh,rn);
      if(sh.fragmentShader.indexOf('float sn=smoothstep(9.5,14.,yc')<0)return;sh.uniforms.uSnR=CH153SN.r;sh.uniforms.uSnU=CH153SN.up;
      sh.fragmentShader=sh.fragmentShader.replace('void main() {','uniform vec4 uSnR;uniform float uSnU;\nvoid main() {')
        .replace('float sn=smoothstep(9.5,14.,yc','float inA=step(uSnR.x,vWP.x)*step(vWP.x,uSnR.z)*step(uSnR.y,vWP.z)*step(vWP.z,uSnR.w),sLo=9.5+inA*uSnU;float sn=smoothstep(sLo,sLo+4.5,yc')};
    const k0=m.customProgramCacheKey===THREE.Material.prototype.customProgramCacheKey?'':m.customProgramCacheKey();m.customProgramCacheKey=()=>k0+'sn153';m.needsUpdate=true})}catch(e){console.warn('v153 snow line',e)}
