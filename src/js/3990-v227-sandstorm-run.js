// ================= v227: the Sandstorm Run, reinvented (owner, Nov 13 2026) =================
// Owner: "It's not fast paced enough - the driving seems wonky and doesn't give a sense of suspense or speed. The monsters are too
// easy and the gun doesn't feel satisfying. I also want to change it so no loot or xp is given. I'm giving you the freedom to
// reinvent this quest to make it the same premise - but improve the gameplay of it vastly. Also improve the audio design for the
// level - the gunshots aren't doing it for me."
// The same premise (the Sandskimmer races through the storm to the Den, its twin guns against what the sand throws up), played new:
// ---------------- you steer AND shoot ----------------
//  Solo, Cheddar no longer drives for you: A / D (or the stick) slide the Skimmer across the course, the mouse aims, the left button
//  fires, Shift (W, or the stick forward) is the turbine's boost, S brakes, Space (the dodge button) fires the heavy shell. Two
//  players on one machine keep their seats (one steers, one shoots: the gunner's A / D sweep the crosshair as in v226).
// ---------------- driving that never goes wrong (sr165Drive replaced) ----------------
//  The Skimmer always runs flat out along the course (V.s) and you choose where across it (V.o, sliding at SKR227.lat a second,
//  banking into the slide). No reversing, no spinning into a wall, no getting stuck: the dune walls scrape the hull and throw it
//  back, a boulder knocks it aside and costs speed, a salt spire shatters, a sand trap drags. Twice as fast as before: cruise
//  SKR227.v (was 12.5), boost SKR227.vb (was 21), on a course ~70% longer (3300: six sweeping rows, ~2700), so the run still
//  takes a little over two minutes.
//  Dune crests (sr165Ramps, in the terrain): the Skimmer flies off their lip (real up-speed from the slope, gravity SKR227.g),
//  further when boosting, and lands in a burst of sand. Nothing on the ground touches it in the air.
// ---------------- suspense: the storm is behind you ----------------
//  The heart of the sandstorm rolls down the course after the Skimmer a touch faster than it cruises (V.gap: how far behind, at
//  most SKR227.gapMax). It creeps up all the time and every knock that costs speed lets it close; only the boost opens the gap. Close (under SKR227.near) the
//  screen darkens, the wind roars, lightning cracks; inside it (gap 0) the hull is torn at SKR227.stormDmg a second. In the last
//  stretch (past SKR227.surge of the course) the storm surges a little faster than the Skimmer cruises. The ride opens looking
//  back at the wall as it comes.
// ---------------- speed you can see ----------------
//  A lower, wider camera that follows the course (not the hull's every twitch), leans into the slides, widens with speed and
//  boost, rattles; sand streaks standing in the air that whip past; storm markers and the ribs of dead giants along and over the
//  course; wind ripples on the sand; rooster tails from the runners; streaks at the screen's edge while boosting.
// ---------------- the guns ----------------
//  A fast twin autocannon (SKR227.fire between shells, 10 a second, was ~5): tracers at 150 a second (was a slow glowing ball),
//  a muzzle flash that lights the hull, kicking barrels, sparks and ichor where they land, shell fragments when a creature
//  dies, a kill streak count. The barrels still heat (gentler: ~6 s of holding the trigger).
//  The heavy shell (Space / the dodge button, every SKR227.heavyCd s): both barrels at once, a blast SKR227.heavyR wide worth 6
//  shells at its heart: for swarms, Shellbacks and the Brood Scorpion.
// ---------------- the creatures (harder) ----------------
//  Shells to kill SKR227.H: Sun Scarab 1 (a direct hit; the blast beside it no longer does), Dune Scorpion 5, Shellback 9,
//  Brood Scorpion 55, worms 12. They hit harder (SKR227.dm ×: gnawing, venom, rams, worms). Scorpions no longer stand and
//  wait to be passed: they run along the edge beside the Skimmer and spit where it is heading (slide out of the ring). Everything
//  keeps up with the faster machine; swarms come more often.
// ---------------- no loot, no XP ----------------
//  The Run's creatures give nothing (no XP for hero or companions, no loot, no runes, no kill credit): they burst and are gone
//  (the outermost `kill` wrapper, on every screen).
// ---------------- co-op ----------------
//  Each machine is still simulated by its driver (or its lone gunner) and sent 10 times a second ('s5v'): two fields were added at
//  the end (how high it is in the air, how far the storm is behind it), so partners see the jumps and their own machine's storm.
//  The heavy shell goes out as the 4th field of the shot message ('s5f'); an older partner shows a normal shot. Creatures are the
//  host's as before; their new behaviour runs on the host and reaches partners as positions, venom as 's5st'. The no-reward
//  death runs on every screen. Camera, streaks, sounds, crosshair, heat and the kill count are each player's own.
var SKR227={on:true,auto:false,v:20,vb:31,vTrap:9,vBrake:13,acc:9,accB:20,dec:13,lat:11,latK:6.5,edge:2.3,g:18,
  gap0:40,gapMax:50,near:24,stormK:1.03,surge:.86,surgeK:1.09,stormDmg:9,
  dmg:{rock:14,spire:8,trap:4,edge:5},dm:{scarab:1.35,venom:1.3,worm:1.25},ram:18,
  H:{sc:1,sp:5,sb:9,gs:55,wy:12},fire:.095,hps:.04,cool:.22,hotEnd:.6,trV:150,heavyCd:4.5,heavyR:5.5,heavyV:85,
  cam:{d:10.2,h:6.5,ahead:7,ly:1.0,floor:1.7,fov:[8,16]},I:[.75,.95,1.1,1.3],max:32,life:40,
  kills:0,combo:0,comboT:0,best:0,time:0,hv:0,kick:0,lt:0,bk:0,cy:null,co:null,camY:null,camDt:0,roll:0,fov0:null,
  said:{},err:0,dom:null,wall:null,streak:null,lines:[],light:null};
// the older layers keep running under this one; their numbers follow it
SKR226.hps=SKR227.hps;SKR226.cool=SKR227.cool;SKR226.hotEnd=SKR227.hotEnd;SKR226.ram=SKR227.ram;SKR226.life=SKR227.life;SKR226.max=SKR227.max;
SKR218.runMax=27;SKR218.paceMax=34;SKR218.run=3.5;
function skr227Mine(V){return !!V&&V===SR165.me}
function skr227Wrap(a){return Math.atan2(Math.sin(a),Math.cos(a))}
// the course's direction at s, without the steps of the sampled tangents
function sr227Yaw(s){const P=sr165Path();s=Math.max(0,Math.min(P.S-.001,s));const i=Math.floor(s),f=s-i,j=Math.min(P.N-1,i+1);return Math.atan2(P.TX[i]+(P.TX[j]-P.TX[i])*f,P.TZ[i]+(P.TZ[j]-P.TZ[i])*f)}
function skr227Snd(k,v,p){try{if(typeof snd227=='function')snd227(k,v,p)}catch(_){}}
// ---------------- who steers ----------------
// the helm: A / D or the stick slide the machine, Shift / W / the stick forward boost, S / the stick back brakes
sr165Input=function(V){const k=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0)+(dp[0]||0);V.st=Math.max(-1,Math.min(1,-k));
  const fw=(K.w||K.arrowup?1:0)+((dp[1]||0)<-.6?1:0),bk=(K.s||K.arrowdown?1:0)+((dp[1]||0)>.6?1:0);V.thr=bk?-1:0;
  const want=(K.shift||fw)&&!bk;V.boost=want&&(V.boost?V.bst>0:V.bst>.2)?1:0};
// Cheddar's seat: solo (and a gunner whose driver is gone) you steer from the turret; Cheddar only takes the helm for the
// automation (SKR227.auto) and other crews' machines
function sr227Auto(V,dt){const hw=SR165C.hw-SKR227.edge,P=sr165Path();V.laneT=(V.laneT||0)-dt;if(V.o==null)return;
  if(V.laneT<=0){V.laneT=.1;let best=V.o,bc=1e9;
    for(let c=-hw+.4;c<=hw-.39;c+=1.2){let cost=Math.abs(c-V.o)*.5+Math.abs(c)*.12;
      const oAt=ds=>{const m=SKR227.lat*.8*Math.max(0,ds)/Math.max(8,V.v);return Math.abs(c-V.o)<=m?c:V.o+Math.sign(c-V.o)*m};
      for(const o of SR165.obs){if(o.gone)continue;const ds=o.s-V.s;if(ds<-3||ds>60)continue;const need=o.r+2.7,gap=Math.abs(oAt(ds)-o.o);if(gap<need)cost+=(o.k=='trap'?140:320)*(1+(need-gap)/need)/(1+Math.max(0,ds)/25)}
      for(const w of (SR165.wy||[])){if(w.ph=='gone')continue;const ds=w.s-V.s;if(ds<-3||ds>60)continue;const oo=oAt(ds);if(Math.abs(oo-w.o0)<3.6||Math.abs(oo-w.o1)<3.6)cost+=260/(1+Math.max(0,ds)/20)}
      for(const q of SR165F.st){if(!q.so)q.so=P.near(q.b.x,q.b.z,V.s+20);const ds=q.so.s-V.s;if(ds<-3||ds>45)continue;if(Math.abs(oAt(ds)-q.so.o)<4.4)cost+=200}
      if(cost<bc){bc=cost;best=c}}
    V.lane=best}
  V.st=Math.max(-1,Math.min(1,-(V.lane-V.o)*.9));V.thr=0;
  const need=(V.gap!=null&&V.gap<30)||V.cling.length>=2;V.boost=(V.boost?V.bst>.05&&(need||V.gap<42):need&&V.bst>.3)?1:0}
sr165Auto=function(V,dt){if(SKR227.on&&!SKR227.auto&&V===SR165.me&&V.gun==='me')return sr165Input(V);return sr227Auto(V,dt)};
{const f=sr165Place;sr165Place=function(V,s,o){V.o=o||0;V.ov=0;V.vy=0;V.air=0;V.yy=null;V.gap=SKR227.gap0;V.pt=null;V.rl=null;const r=f.apply(this,arguments);if(V===SR165.me){SKR227.cy=null;SKR227.co=null;SKR227.camY=null}return r}}
// ---------------- the ride (dt): along the course, across it, off the crests; the storm behind ----------------
sr165Drive=function(V,dt){const P=sr165Path(),C=SKR227,me=skr227Mine(V);if(V.wreck)return;
  if(V.o==null||!isFinite(V.o)){const q=P.near(V.x,V.z,V.s);V.s=q.s;V.o=Math.max(-SR165C.hw+C.edge,Math.min(SR165C.hw-C.edge,q.o));V.ov=0}
  // the turbine
  if(V.boost&&V.bst>0){V.bst=Math.max(0,V.bst-dt*.26);if(V.bst<=0)V.boost=0}else{V.boost=0;V.bst=Math.min(1,V.bst+dt*.085)}
  if(V.boost&&!V.wasB){if(me){skr227Snd('boost',1);shake(.12)}const fx=Math.sin(V.h),fz=Math.cos(V.h);burst(new THREE.Vector3(V.x-fx*4.4,V.y+1.8,V.z-fz*4.4),0x9ae8ff,18,3,1.2,.4)}V.wasB=V.boost;
  V.trap=Math.max(0,V.trap-dt);const air=V.air>0;
  const want=V.trap>0?(V.boost?15:C.vTrap):V.boost?C.vb:V.thr<-.3?C.vBrake:C.v,a=V.v<want?(V.boost?C.accB:V.v<12?C.acc*1.8:C.acc):C.dec;
  V.v+=Math.sign(want-V.v)*Math.min(Math.abs(want-V.v),a*dt);
  // across the course
  const wl=-V.st*C.lat*(V.boost?.85:1)*Math.min(1,V.v/9);V.ov+=(wl-V.ov)*Math.min(1,dt*(air?1.6:C.latK));V.o+=V.ov*dt;
  const lim=SR165C.hw-C.edge;
  if(Math.abs(V.o)>lim){const sg=Math.sign(V.o),into=V.ov*sg;V.o=sg*lim;
    if(into>4.5&&!(V.edT>0)){V.edT=.5;sr165Hurt(V,3+into*.4,'wall');V.bump=.4;V.v*=.82;if(me)skr227Snd('clang',.7,1.2)}
    if(into>0){V.ov=-into*.3*sg;V.v=Math.max(9,V.v-dt*9);sr165Hurt(V,C.dmg.edge*dt,'scrape');
      if(Math.random()<dt*40){const [ex,ez]=P.at(V.s+(Math.random()-.3)*3,sg*(lim+1.6));burst(new THREE.Vector3(ex,V.y+.6,ez),Math.random()<.4?0xffc070:0xd8b080,2,2.6,1.6,.4)}}}
  V.edT=Math.max(0,(V.edT||0)-dt);
  V.s=Math.min(P.S,V.s+V.v*dt);const [x,z]=P.at(V.s,V.o);V.x=x;V.z=z;V.h=sr227Yaw(V.s)-Math.atan2(V.ov,Math.max(9,V.v))*.8;
  // off the crests
  const gy=GH(x,z);if(V.yy==null){V.yy=gy;V.vy=0}
  if(air){V.vy-=C.g*dt;V.yy+=V.vy*dt;V.air+=dt;
    if(V.yy<=gy){const hit=-V.vy;V.yy=gy;V.air=0;V.vy=0;V.bump=.5;burst(new THREE.Vector3(x,gy+.3,z),0xd8b080,Math.min(60,20+hit*3|0),4,2.4,.7);
      if(me){shake(Math.min(.35,.08+hit*.02));skr227Snd('land',Math.min(1.2,.5+hit*.06));SKR227.camDip=Math.min(1,hit*.08)}}}
  else{const [bx,bz]=P.at(V.s-1.5,V.o),[ax,az]=P.at(V.s+1,V.o),up=(gy-GH(bx,bz))/1.5*V.v,drop=gy-GH(ax,az);
    if(up>2.6&&drop>.3&&V.trap<=0){V.air=.001;V.vy=up;V.yy=gy;if(me){skr227Snd('jump',.8,.9+V.v*.012);SKR227.jumps=(SKR227.jumps||0)+1}}else V.yy=gy}
  const high=V.air>0&&V.yy-gy>1.1;
  // the hazards
  for(const o of SR165.obs){if(o.gone||Math.abs(o.s-V.s)>16)continue;const d=Math.hypot(o.x-x,o.z-z);
    if(o.k=='trap'){if(d<o.r+.6&&!(V.air>0)){if(V.trap<=0&&me&&!C.said.trap){C.said.trap=1;say('🌀 Sand trap! It drags at the runners — boost through!')}V.trap=.3;sr165Hurt(V,dt*C.dmg.trap,'trap')}continue}
    if(d<o.r+1.45&&!high){const now=performance.now();if(o.hT&&now-o.hT<1500)continue;o.hT=now;const sp=o.k=='spire';
      sr165Hurt(V,sp?(V.boost?3:C.dmg.spire):C.dmg.rock,o.k);if(me){skr227Snd('clang',1,sp?1.25:.85);svSnd('crack',.7,.9)}burst(new THREE.Vector3(o.x,V.y+1,o.z),sp?0xf0e8e0:0xa88458,30,3,2.2,.6);
      let sg=Math.sign(V.o-o.o)||1;if(Math.abs(o.o+sg*(o.r+1.6))>lim)sg=-sg;V.o=Math.max(-lim,Math.min(lim,o.o+sg*(o.r+1.6)));V.ov=sg*6;V.v*=sp?(V.boost?.9:.7):.45;V.bump=.5;if(sp){o.gone=1;sr165SpireGone(o)}}
    else if(me&&!o.wh&&o.s<V.s&&d<o.r+6){o.wh=1;skr227Snd('whoosh',.5,o.k=='spire'?1.3:.9)}}
  // the storm behind
  if(SR165.ph==='run'){const sv=C.v*(V.s/P.S>C.surge?C.surgeK:C.stormK);V.gap=Math.max(-8,Math.min(C.gapMax,(V.gap==null?C.gap0:V.gap)+(V.v-sv)*dt));if(V.gap<=0)sr165Hurt(V,C.stormDmg*dt,'scrape')}
  sr165Pose(V,dt,performance.now())};
// the machine's look from its state
sr165Pose=function(V,dt,now){const R=V.R,t=now/1000,gy=GH(V.x,V.z);dt=dt||0;if(!(V.air>0)||V.yy==null)V.yy=gy;V.y=Math.max(gy,V.yy);const fx=Math.sin(V.h),fz=Math.cos(V.h),lx=fz,lz=-fx,air=V.air>0;
  let pt,rl;if(air){pt=-Math.atan2(V.vy||0,Math.max(9,V.v))*.75;rl=0}
  else{const yf=GH(V.x+fx*2.6,V.z+fz*2.6),yb=GH(V.x-fx*2.6,V.z-fz*2.6),yl=GH(V.x+lx*1.8,V.z+lz*1.8),yr=GH(V.x-lx*1.8,V.z-lz*1.8);pt=-Math.atan2(yf-yb,5.2);rl=Math.atan2(yl-yr,3.6)*.8}
  const k=dt?Math.min(1,dt*(air?5:11)):1;V.pt=V.pt==null?pt:V.pt+(pt-V.pt)*k;V.rl=V.rl==null?rl:V.rl+(rl-V.rl)*k;
  const sink=V.trap>0?.4:0,slide=V.ov!=null?-(V.ov||0)/SKR227.lat:V.st||0,spd=Math.min(1,Math.abs(V.v)/10);
  V.m.position.set(V.x,V.y-sink,V.z);R.root.rotation.set(V.pt,V.h,V.rl);
  R.J.body.position.y=Math.sin(t*14)*.03*Math.min(1,Math.abs(V.v)/14)+(V.bump>0?Math.sin(V.bump*30)*.07:0);V.bump=Math.max(0,V.bump-dt);
  R.J.body.rotation.z=-slide*.17*spd;R.J.fan.rotation.z+=dt*(3+Math.abs(V.v)*1.2+(V.boost?16:0));R.J.wheel.rotation.z=-slide*1.3;R.J.sail.rotation.y=Math.sin(t*9)*.5;
  const j=V.boost?.8+.2*Math.sin(t*40):Math.min(.3,Math.abs(V.v)*.012);R.jetM[0].opacity=j;R.jetM[1].opacity=j*.4;R.J.jet.scale.set(1,1,V.boost?1.7+Math.random()*.4:1);
  R.J.brlL.position.z=R.J.brlL.userData.p0.z-V.rec[0];R.J.brlR.position.z=R.J.brlR.userData.p0.z-V.rec[1];V.rec[0]=Math.max(0,V.rec[0]-dt*3.4);V.rec[1]=Math.max(0,V.rec[1]-dt*3.4);
  R.J.turret.rotation.y=V.aY;R.J.gun.rotation.x=V.aP-(V.gk||0);V.gk=Math.max(0,(V.gk||0)-dt*.9);
  // rooster tails from the runners, a sheet of sand off the outer runner in a slide, the turbine's flame
  if(dt&&V.v>3&&!air){let n=dt*(18+V.v*1.6);while(n>0&&(n>=1||Math.random()<n)){n--;const s=Math.random()<.5?-1:1;burst(new THREE.Vector3(V.x-fx*(2.6+Math.random())+lx*s*1.9,V.y+.2,V.z-fz*(2.6+Math.random())+lz*s*1.9),0xd8b080,1,1+V.v*.07,1+V.v*.06,.7)}
    if(Math.abs(V.ov||0)>5&&Math.random()<dt*50){const s=V.ov>0?1:-1;burst(new THREE.Vector3(V.x+lx*s*2.1+fx*(Math.random()*4-2),V.y+.2,V.z+lz*s*2.1+fz*(Math.random()*4-2)),0xe8c898,2,3,2.4,.5)}}
  if(dt&&V.boost&&Math.random()<dt*60)burst(new THREE.Vector3(V.x-fx*4.6,V.y+1.9,V.z-fz*4.6),Math.random()<.5?0x9ae8ff:0xffffff,1,1.6,.3,.25);
  if(V.chd)try{V.chd.update(t,dt)}catch(_){}};
// a partner's machine: where they say it is, as high as they say, their storm
sr165NetPose=function(V,dt,now){const N=V.net,k=Math.min(1,dt*12);V.x+=(N.x-V.x)*k;V.z+=(N.z-V.z)*k;let d=N.h-V.h;d=skr227Wrap(d);V.h+=d*k;V.v=N.v;V.boost=N.b;V.st=N.st||0;V.hp=N.hp;V.s=N.s;V.o=null;V.ov=null;
  V.ya=(V.ya||0)+((N.ya||0)-(V.ya||0))*Math.min(1,dt*14);V.air=V.ya>.06?1:0;V.yy=GH(V.x,V.z)+V.ya;V.vy=0;if(N.gap!=null)V.gap=N.gap;sr165Pose(V,dt,now)};
// harder knocks from the creatures; the hull's own sounds
{const f=sr165Hurt;sr165Hurt=function(V,d,why){const m=SKR227.on&&SKR227.dm[why];if(m)d*=m;const h0=V&&V.hp,r=f.call(this,V,d,why);
  try{if(SKR227.on&&skr227Mine(V)&&h0>V.hp){const B=SKR227.by||(SKR227.by={});B[why]=(B[why]||0)+h0-V.hp}if(SKR227.on&&skr227Mine(V)&&h0-V.hp>=3&&why!=='wall'&&why!=='rock'&&why!=='spire')skr227Snd('clang',Math.min(1.1,.5+(h0-V.hp)*.04),.8+Math.random()*.2)}catch(_){}return r}}
// ---------------- the guns ----------------
// keys only move the crosshair when someone else steers; on a touch screen (or before any mouse) it glides to the nearest threat
skr226Steer=function(V,dt){const lk=document.pointerLockElement===gl,S=SKR227;
  if(!lk&&typeof mOn!='undefined'&&mOn&&(SKR226.mx!==mnd.x||SKR226.my!==mnd.y)){SKR226.rx=mnd.x;SKR226.ry=mnd.y;S.mT=performance.now()}SKR226.mx=mnd.x;SKR226.my=mnd.y;
  if(V.drv!=='me'&&V.drv!=='chd'){const kx=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0)+(dp[0]||0),ky=(K.w||K.arrowup?1:0)-(K.s||K.arrowdown?1:0)-(dp[1]||0);
    if(kx||ky){SKR226.rx=Math.max(-.97,Math.min(.97,SKR226.rx+kx*SKR226.keyV*dt));SKR226.ry=Math.max(-.92,Math.min(.75,SKR226.ry+ky*SKR226.keyV*dt));S.mT=performance.now()}return}
  if(lk||S.noAssist)return;const mob=document.body.classList.contains('mob');if(!mob&&S.mT&&performance.now()-S.mT<(S.mT0?4000:1e12))return;
  // the assist: the creature most worth a shell (on the hull first, then the nearest ahead)
  let best=null,bs=1e9;const q=new THREE.Vector3();for(const f of sr165Foes()){const al=(f.p.x-V.x)*Math.sin(V.h)+(f.p.z-V.z)*Math.cos(V.h);if(al<-3)continue;const d=f.p.distanceTo(V.m.position)-(f.e&&f.e.cl?30:0)-(f.k==='sb'||f.k==='gs'?8:0);if(d<bs){bs=d;best=f}}
  const tx=best?q.copy(best.p).project(cam).x:0,ty=best?q.y:-.12,kk=Math.min(1,dt*9);if(best&&q.z>1)return;SKR226.rx+=(Math.max(-.97,Math.min(.97,tx))-SKR226.rx)*kk;SKR226.ry+=(Math.max(-.92,Math.min(.75,ty))-SKR226.ry)*kk};
addEventListener('pointermove',e=>{try{if(SR165.on&&document.pointerLockElement===gl&&(e.movementX||e.movementY))SKR227.mT=performance.now()}catch(_){}});
function sr227Geo(){return svG('sk227tr',()=>{const g=new THREE.BoxGeometry(.075,.075,1);g.translate(0,0,-.5);return g})}
function sr227TrMat(){return SKR227.trM||(SKR227.trM=new THREE.MeshBasicMaterial({color:0xffe6b0,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}))}
// the distance from p to the stretch a → b
function sr227Seg(p,a,b){const abx=b.x-a.x,aby=b.y-a.y,abz=b.z-a.z,L=abx*abx+aby*aby+abz*abz||1e-6;let t=((p.x-a.x)*abx+(p.y-a.y)*aby+(p.z-a.z)*abz)/L;t=Math.max(0,Math.min(1,t));return Math.hypot(p.x-a.x-abx*t,p.y-a.y-aby*t,p.z-a.z-abz*t)}
function sr227Flash(p,s,ms,col){const o=kqSpr(col||0xffdc98,s);o.position.copy(p);o.userData.lpsSkip=1;scene.add(o);let t=0;kqFx({tick(dt){t+=(dt||0)*1000;o.scale.setScalar(s*(1+t/ms*.6));return t<ms},end(){scene.remove(o)}})}
sr165Fire=function(V,own,heavy){if(!V||V.wreck)return;const S=SKR227,mine=own&&skr227Mine(V),R=V.R;
  if(heavy){if(mine){if(S.hv>0||SR165.ph!=='run')return;S.hv=S.heavyCd}return sr227Heavy(V,own)}
  if(V.fT>0)return;if(mine&&SKR226.hot)return;V.fT=S.fire;V.alt^=1;const j=V.alt?'brlL':'brlR';V.rec[V.alt?0:1]=.42;V.gk=Math.min(.05,(V.gk||0)+.022);
  const mz=new THREE.Vector3(0,0,1.95);R.J[j].localToWorld(mz);const A=(V.aim||mz).clone(),d=A.clone().sub(mz),L=d.length()||1;d.multiplyScalar(1/L);
  burst(mz,0xffd070,4,3,.8,.14);if(Math.random()<.5)burst(mz,0x8a7a6a,2,1.2,1.2,.45);sr227Flash(mz,1.5+Math.random()*.5,55);
  if(mine){S.lt=1;S.kick=Math.min(1,S.kick+.35);skr227Snd('gun',1,(V.alt?.97:1.04)*(.97+Math.random()*.06))}else skr227Snd('gun',.45,(V.alt?.97:1.04)*(.94+Math.random()*.06));
  if(own&&typeof co165Shot=='function')co165Shot(V,A);
  if(mine){SKR226.heat=Math.min(1,SKR226.heat+S.hps);if(SKR226.heat>=1&&!SKR226.hot){SKR226.hot=1;skr227Snd('overheat',1);try{['brlL','brlR'].forEach(b=>{const p=new THREE.Vector3(0,0,1.2);R.J[b].localToWorld(p);burst(p,0xe8e8e8,14,1.4,2.2,.9)})}catch(_){}
      if(!S.said.hot){S.said.hot=1;say('♨ The barrels overheat! Let go of the trigger now and then.')}}}
  // the tracer
  const o=new THREE.Mesh(sr227Geo(),sr227TrMat());o.position.copy(mz);o.lookAt(mz.clone().add(d));o.scale.set(1,1,.6);o.userData.lpsSkip=1;scene.add(o);let run=0;const prev=mz.clone();
  kqFx({tick(dt){dt=dt||0;prev.copy(o.position);const st=Math.min(L-run,S.trV*dt);o.position.addScaledVector(d,st);run+=st;o.scale.z=Math.min(3.4,.6+run*.5);
      let hit=null,hd=1e9;for(const f of sr165Foes()){const q=sr227Seg(f.p,prev,o.position);if(q<f.r+.4){const dd=f.p.distanceToSquared(prev);if(dd<hd){hd=dd;hit=f}}}
      if(hit){sr227Impact(hit.p.clone().lerp(o.position,.3),own,hit);return false}if(run>=L-.01){sr227Impact(o.position.clone(),own,null);return false}return true},end(){scene.remove(o)}})};
// where a shell lands: sparks and ichor on a creature, a puff of sand on the ground
function sr227Impact(p,own,f){if(f){burst(p,0xffc060,7,3.2,1.8,.22);burst(p,0xb8d040,4,2,1.6,.4);sr227Flash(p,1.1,70);skr227Snd('hit',own?.9:.4,.9+Math.random()*.25)}
  else{burst(p,0xd8b080,6,1.8,2.2,.45);if(own&&Math.random()<.4)skr227Snd('sand',.5,.8+Math.random()*.4)}
  if(!own||!f)return;try{f.hit(1,1)}catch(err){if(!SKR227.err++)console.warn('v227 shell',err)}}
sr165Burst=function(p,own){sr227Impact(p,own,null)};
// the heavy shell: both barrels, a wide blast
function sr227Heavy(V,own){const S=SKR227,R=V.R,mine=own&&skr227Mine(V);V.rec[0]=V.rec[1]=.7;V.gk=.12;const mz=new THREE.Vector3(0,0,2.05);R.J.gun.localToWorld(mz);
  const A=(V.aim||mz).clone(),d=A.clone().sub(mz),L=d.length()||1;d.multiplyScalar(1/L);burst(mz,0xffd070,26,4.5,1.6,.3);burst(mz,0x6a5a4a,14,2,2,.8);sr227Flash(mz,4,110);
  if(mine){S.lt=2.2;S.kick=1;shake(.22);skr227Snd('heavy',1)}else skr227Snd('heavy',.5);if(own&&typeof co165Shot=='function')co165Shot(V,A,1);
  const o=kqSpr(0xffa040,2);o.position.copy(mz);o.userData.lpsSkip=1;scene.add(o);let run=0;const prev=mz.clone();
  kqFx({tick(dt){dt=dt||0;prev.copy(o.position);const st=Math.min(L-run,S.heavyV*dt);o.position.addScaledVector(d,st);run+=st;burst(o.position,Math.random()<.5?0xffb050:0x8a7a6a,2,.6,.5,.4);
      let hit=run>=L-.01;if(!hit)for(const f of sr165Foes())if(sr227Seg(f.p,prev,o.position)<f.r+.7){hit=true;break}
      if(hit){sr227Blast(o.position.clone(),own);return false}return true},end(){scene.remove(o)}})}
function sr227Blast(p,own){const S=SKR227,R=S.heavyR;p.y=Math.max(p.y,GH(p.x,p.z)+.5);burst(p,0xffb050,70,6.5,4.5,.6);burst(p,0x4a3a2a,40,4,5,1.1);burst(p,0xd8b080,40,5,3,.9);ring(p,0xffb050,R,380);sr227Flash(p,9,220,0xffc070);
  const me=SR165.me,near=me?Math.hypot(me.x-p.x,me.z-p.z):99;skr227Snd('boom',Math.max(.35,1-near/60));if(near<40)shake(Math.min(.4,.5-near*.01));
  if(!own)return;for(const f of sr165Foes()){const d=f.p.distanceTo(p);if(d<f.r+R)try{f.hit(d<f.r+1.6?6:4,0)}catch(err){if(!S.err++)console.warn('v227 blast',err)}}}
// Space and the dodge button: the heavy shell
{const f=dodge;dodge=function(){try{if(SKR227.on&&SR165.on){const V=SR165.me;if(V&&V.gun==='me')sr165Fire(V,true,1);return}}catch(_){}return f.apply(this,arguments)}}
// what the shells can hit, and how many it takes
sr165FoeList=function(){const L=[],H=SKR227.H;enemies.forEach(e=>{if(e.dead)return;const k=skr226Kind(e);if(!k)return;
    L.push({p:gY(e.m.position,k==='gs'?1.1:.6),r:skr226R(k),e,k,hit:q=>{try{const h=H[k]||1;e.sh226=(e.sh226||0)+q;SKR226.hm=performance.now();
      if(e.sh226>=h-1e-6)hurt(e,M(e.c)*3+50,{col:0xffc060},true);else hurt(e,Math.max(1,M(e.c)*q/h*.98),{col:0xffc060},false);
      if(e.dead)SKR226.km=performance.now()}catch(err){if(!SKR227.err++)console.warn('v227 hit',err)}}})});
  SR165F.wy.forEach(W=>{if(W.ph==='tell'||!W.segs)return;[0,5,10].forEach(i=>{const m=i?W.segs[i]:W.head;if(m&&m.visible)L.push({p:m.position.clone(),r:1.5,k:'wy',hit:q=>{W.hp-=q;SKR226.hm=performance.now();burst(m.position,0xffc060,8,1.6,1.4,.4);
      if(W.hp<=0&&W.ph!=='down'){W.ph='down';SKR226.km=performance.now();popT(m.position,'Driven under!','#ffe080',true);svSnd('shriek',.6,1.1);sr227Count()}}})})});return L};
{const f=sr165Worm;sr165Worm=function(){const W=f.apply(this,arguments);if(W&&SKR227.on)W.hp=SKR227.H.wy;return W}}
// ---------------- no loot, no XP: the Run's creatures burst and are gone (every screen) ----------------
function sr227IsRun(e){try{return !!e&&(!!e.sr165||(SR165.on&&!!skr226Kind(e)))}catch(_){return false}}
function sr227Count(){const S=SKR227,now=performance.now();if(!SR165.on)return 1;S.kills++;S.combo=now-S.comboT<1500?S.combo+1:1;S.comboT=now;S.best=Math.max(S.best,S.combo);return S.combo}
function sr227GibMat(c){const M=SKR227.gib||(SKR227.gib={});return M[c]||(M[c]=new THREE.MeshStandardMaterial({color:c,roughness:.5,flatShading:true}))}
function sr227Death(e){const k=skr226Kind(e)||e.sr165,big=k==='gs'?2:k==='sb'?1:0,p=gY(e.m.position,big?1.2:.6);e.dead=1;try{e.c.h=0;e.hb.visible=false}catch(_){}
  if(e.cl){const i=e.cl.V.cling.indexOf(e);if(i>=0)e.cl.V.cling.splice(i,1);e.cl=null}try{if(tgt===e)setTarget(null)}catch(_){}
  burst(p,0xb8d040,big?60:16,big?5:3.4,big?4:2.6,.55);burst(p,0x5a3a20,big?30:8,3,3,.7);sr227Flash(p,big?6:2.2,big?200:110,0xffc060);
  try{sk146Debris(p,sr227GibMat(k==='sp'||k==='gs'?0x7a5a34:0x8a5a28),big?16:5,big?.34:.2,big?8:6,big?7:5,1.1)}catch(_){}
  if(big){ring(p,0xffb050,big>1?6:3.5,360);const me=SR165.me;if(me&&Math.hypot(me.x-p.x,me.z-p.z)<40)shake(big>1?.4:.18)}
  const c=sr227Count();skr227Snd('kill',big?1.2:.8,Math.min(1.7,(big?.6:1)+c*.03));if(big>1){skr227Snd('boom',.8);if(SR165.me)say('🦂 The <b>Brood Scorpion</b> is blown apart!')}
  if(SR165.on&&c>=5&&c%5===0)popT(p,'×'+c,'#ffd070',true);
  removeE(e)}
{const f=kill;kill=function(e){if(!SKR227.on||!sr227IsRun(e))return f.apply(this,arguments);
  try{if(typeof MP!='undefined'&&MP.on){if(!MP.rk&&e.nid&&!e.mir&&MP.others)MP.kq.push({id:e.nid,n:2});if(e.nid)MP.dead[e.nid]=performance.now()}}catch(_){}
  try{sr227Death(e)}catch(err){if(!SKR227.err++)console.warn('v227 death',err);try{removeE(e)}catch(_){}}}}
// ---------------- the creatures: pace and behaviour for the faster machine ----------------
sr165Spawn=function(dt){const me=SR165.me;if(!me||SR165.ph!=='run'||!sr165Host()||!SKR227.on)return;const P=sr165Path(),f=me.s/P.S,T=SKR226.T;
  if(me.s>P.S-70)return;if(SR165.cp>T.cp){T.cp=SR165.cp;T.calm=4;T.sc=Math.max(T.sc,1.2)}if(T.calm>0){T.calm-=dt;return}
  const act=Math.min(3,Math.floor(f*4)),a=f*4-act,I=SKR227.I[act]*(.7+.6*a),alive=enemies.filter(e=>e.sr165&&!e.dead).length,hw=SR165C.hw,R=Math.random,at=(s,o)=>P.at(Math.min(P.S-40,s),o);
  // scarab swarms pour off one dune or both, ahead
  T.sc-=dt*I;if(T.sc<=0&&alive<SKR227.max){T.sc=5+R()*2.2;const n=Math.round(5+I*5+R()*3),both=act>=1&&R()<.4,s0=me.s+50+R()*14,sd=R()<.5?-1:1;
    for(let i=0;i<n;i++){const side=both?(i%2?1:-1):sd,[x,z]=at(s0+(R()-.5)*10+i*.8,side*(hw-1.2-R()*3));sr165Foe('scarab',x,z,'sc')}
    if(n>=9&&!SKR227.said.sw){SKR227.said.sw=1;say('🪲 A swarm pours over the dunes!')}}
  // shellbacks crouch at the edge, then charge
  T.sb-=dt*I;if(T.sb<=0&&f>.07&&alive<SKR227.max){T.sb=10+R()*5;const k=act>=2&&R()<.5?2:1;for(let i=0;i<k;i++){const sd=i?-1:(R()<.5?-1:1),[x,z]=at(me.s+64+R()*10+i*9,sd*(hw-1.5));skr226Spawn('sb',x,z)}}
  // scorpions run the edges and spit
  T.sp-=dt*I;if(T.sp<=0&&alive<SKR227.max){T.sp=7+R()*3;const k=act>=1&&R()<.6?2:1;for(let i=0;i<k;i++){const sd=i?-1:(R()<.5?-1:1),[x,z]=at(me.s+52+R()*10+i*8,sd*(hw-1.8));sr165Foe('scorp',x,z,'sp')}}
  // worms arch over the course
  T.wy-=dt*I;if(T.wy<=0&&f>.08){T.wy=(f>SKR227.surge?7:11)+R()*4;const s=me.s+72+R()*16,half=R()<.5?-1:1,o0=half<0?-hw+.5:-1.5+R()*1.5,o1=half<0?1.5-R()*1.5:hw-.5;if(s<P.S-45)sr165Worm(s,o0,o1,true)}
  // the Brood Scorpions
  SKR226.giants.forEach((g,i)=>{if(!T.e[i]&&f>g){T.e[i]=1;const sd=R()<.5?-1:1,[x,z]=at(me.s+55,sd*(hw-1.5));skr226Spawn('gs',x,z)}})};
{const f=skr226Spawn;skr226Spawn=function(k,x,z){const e=f.apply(this,arguments);try{if(e&&e.trait){e.c.n=String(e.c.n).replace(e.trait+' ','');e.trait=null;e.trT=0;e.sh=0;if(e.shM)e.shM.visible=false}}catch(_){}return e}}
// a Dune Scorpion: it runs the edge beside the Skimmer, slipping back a little all the time, and spits where the hull is heading
function skr227Scorp(e,V,al,dt,now){const m=e.m,P=sr165Path(),hw=SR165C.hw,K=e.k227||(e.k227={side:0,t:0,sp:1+Math.random()*.8,al:Math.max(10,al)});K.t+=dt;
  if(!K.side){const q=P.near(m.position.x,m.position.z,V.s+20);K.side=q.o>=0?1:-1}
  K.al-=dt*(K.al>20?15:2.6);const [tx,tz]=P.at(V.s+K.al,K.side*(hw-2.2)),dx=tx-m.position.x,dz=tz-m.position.z,L=Math.hypot(dx,dz)||1,sp=Math.min(38,L*3+Math.max(0,V.v)*.9),st=Math.min(L,sp*dt);
  m.position.x+=dx/L*st;m.position.z+=dz/L*st;m.position.y=GH(m.position.x,m.position.z);K.sp-=dt;const aim=K.sp<.45;
  m.rotation.y=aim?Math.atan2(V.x-m.position.x,V.z-m.position.z):sr227Yaw(V.s+K.al);animC(m,now,true,Math.min(9,sp*.4));
  if(Math.random()<dt*10)burst(gY(m.position,.2),0xd8b080,1,1.4,1,.4);
  if(K.sp<=0&&al>-1&&al<34){K.sp=2+Math.random()*.9;const T=1.1,[px,pz]=V.o!=null?P.at(V.s+V.v*T,V.o):[V.x+Math.sin(V.h)*V.v*T,V.z+Math.cos(V.h)*V.v*T];sr165Sting(gY(m.position,1.4),px,pz,T)}
  if(K.al<-6){e.fall226=1;e.fsp226=Math.max(4,V.v*.5)}}
// the Shellback: an ember glow at the edge, then the charge
skr226Shell=function(e,V,al,dt,now){const m=e.m,K=e.k226;K.t+=dt;
  if(K.st==='wait'){m.rotation.y=Math.atan2(V.x-m.position.x,V.z-m.position.z);animC(m,now,false,0);
    if(al<46&&al>-2){K.st='charge';K.t=0;try{svSnd('charge',.6,.7)}catch(_){}if(skr227Mine(V)&&!SKR226.sbSaid){SKR226.sbSaid=1;say('🪲 A <b>Shellback</b> charges! Kill it or slide out of its way!')}}return}
  if(K.st==='charge'){const fx=Math.sin(V.h),fz=Math.cos(V.h),tx=V.x+fx*Math.max(0,V.v)*.4,tz=V.z+fz*Math.max(0,V.v)*.4,dx=tx-m.position.x,dz=tz-m.position.z,L=Math.hypot(dx,dz)||1,sp=Math.min(38,Math.max(12,V.v+9));
    m.position.x+=dx/L*Math.min(L,sp*dt);m.position.z+=dz/L*Math.min(L,sp*dt);m.position.y=GH(m.position.x,m.position.z);m.rotation.y=Math.atan2(dx,dz);animC(m,now,true,sp*.4);
    if(Math.random()<dt*24)burst(gY(m.position,.2),0xd8b080,2,1.6,1.2,.4);
    if(Math.hypot(V.x-m.position.x,V.z-m.position.z)<2.7&&!(V.air>0&&V.y-GH(V.x,V.z)>1.4)){K.st='spent';e.fall226=1;e.fsp226=2;sr165Hurt(V,SKR226.ram,'ram');V.v*=.55;V.bump=.7;if(V.ov!=null)V.ov+=(Math.random()<.5?-1:1)*5;try{svSnd('heavy',1,.55);svSnd('crack',.6,.7)}catch(_){}
      burst(gY(V.m.position,1.2),0xd8b080,40,3,2.6,.7);if(skr227Mine(V)){shake(.45);say('🪲 The Shellback rams the hull!')}m.rotation.y+=Math.PI}
    if(K.t>5||al<-3){K.st='spent';e.fall226=1}}};
// the Brood Scorpion: alongside on one flank, venom volleys across your lane, swarms called out of the sand
skr226Brood=function(e,V,al,dt,now){const m=e.m,K=e.k226,P=sr165Path(),hw=SR165C.hw;K.t+=dt;
  if(!K.side){const q=P.near(m.position.x,m.position.z,V.s+20);K.side=q.o>=0?1:-1}
  if(K.t>SKR226.life){burst(gY(m.position,.5),0xd8b080,60,3,3,.8);try{svSnd('roar',.6,.5)}catch(_){}if(skr227Mine(V))say('🦂 The Brood Scorpion burrows away into the storm.');removeE(e);return}
  const ahead=5+Math.sin(K.t*.5)*4,[tx,tz]=V.o!=null?P.at(V.s+ahead,K.side*(hw-2.6)):[V.x+Math.sin(V.h)*ahead+Math.cos(V.h)*K.side*7,V.z+Math.cos(V.h)*ahead-Math.sin(V.h)*K.side*7];
  const dx=tx-m.position.x,dz=tz-m.position.z,L=Math.hypot(dx,dz)||1,sp=Math.min(40,Math.max(4,L*2.4+Math.max(0,V.v)*.9));
  m.position.x+=dx/L*Math.min(L,sp*dt);m.position.z+=dz/L*Math.min(L,sp*dt);m.position.y=GH(m.position.x,m.position.z);
  m.rotation.y=K.sp<.5?Math.atan2(V.x-m.position.x,V.z-m.position.z):sr227Yaw(V.s+ahead);animC(m,now,true,Math.min(9,sp*.4));
  if(Math.random()<dt*16)burst(gY(m.position,.2),0xd8b080,2,1.8,1.4,.5);
  if(al<-1)return;
  K.sp-=dt;if(K.sp<=0){K.sp=2.3+Math.random()*.7;const T=1.25,from=gY(m.position,2.2),o0=V.o!=null?V.o:0;
    [-2.8,0,2.8].forEach((o,i)=>setTimeout(()=>{try{if(e.dead||!SR165.on||SR165.ph!=='run')return;const [px,pz]=P.at(V.s+V.v*(T-i*.09),Math.max(-hw+1.5,Math.min(hw-1.5,o0+o)));sr165Sting(from,px,pz,T)}catch(_){}},i*90))}
  K.br-=dt;if(K.br<=0){K.br=6.5+Math.random()*2;const n=3+Math.floor(Math.random()*3);for(let i=0;i<n;i++)sr165Foe('scarab',m.position.x+(Math.random()-.5)*3,m.position.z+(Math.random()-.5)*3,'sc');
    try{svSnd('hiss',.6,.8)}catch(_){}burst(gY(m.position,.3),0xd8b080,30,2.4,2,.6)}};
{const f=sr165FoeAI;sr165FoeAI=function(e,dt,now){if(SKR227.on&&e&&e.sr165==='sp'&&!e.fall226&&SR165.on&&SR165.ph==='run'){try{const [V]=sr165Near(e.m.position);if(V){const al=skr226Along(V,e.m.position);
      if(al>=-SKR226.behind){skr227Scorp(e,V,al,dt,now);return}}}catch(err){if(!SKR227.err++)console.warn('v227 scorpion',err)}}
  return f.apply(this,arguments)}}
// ---------------- the camera: along the course, low and wide, leaning, rattling; the opening looks back at the storm ----------------
skr218Cam=function(){const V=SR165.me,S=SKR227,C=S.cam;if(!V)return;const P=sr165Path(),dt=Math.min(.25,S.camDt||0);S.camDt=0;
  const yT=sr227Yaw(Math.min(P.S,V.s+7));if(S.cy==null){S.cy=yT;S.co=V.o||0;S.camY=V.y}S.cy+=skr227Wrap(yT-S.cy)*Math.min(1,dt*4.5);
  S.co+=((V.o||0)-S.co)*Math.min(1,dt*5);S.camY+=(V.y-S.camY)*Math.min(1,dt*(V.air>0?3.5:9));S.bk+=((V.boost?1:0)-S.bk)*Math.min(1,dt*(V.boost?6:2.5));
  S.camDip=Math.max(0,(S.camDip||0)-dt*3);S.kick=Math.max(0,S.kick-dt*7);
  // the opening: round from in front of the bow (the storm wall behind the machine) to the chase view; a wreck: a slow drift round it
  let orb=0,far=0;if(SR165.ph==='intro'&&SR165.t0>2){const k=Math.max(0,Math.min(1,SR165.t/SR165.t0)),e=k*k*(3-2*k);orb=(1-e)*2.75;far=(1-e)*5}
  else if(SR165.ph==='wreck'||SR165.ph==='wait'){orb=Math.min(1.2,SR165.t*.35);far=3}
  const yaw=S.cy+orb,fx=Math.sin(yaw),fz=Math.cos(yaw),rx=-Math.cos(S.cy),rz=Math.sin(S.cy),lag=(S.co-(V.o||0))*.75,dist=C.d+S.bk*1.5+far;
  const x=V.x-fx*dist+rx*lag,z=V.z-fz*dist+rz*lag;const low=SR165.ph==='intro'?orb/2.75:0;let y=S.camY+C.h-S.camDip*.5+far*.25-low*3.8;   // the opening looks up past the machine at the wally=Math.max(y,GH(x,z)+C.floor,GH((x+V.x)/2,(z+V.z)/2)+C.floor+.5);
  const p=new THREE.Vector3(x,y,z),sp=Math.min(1.5,Math.abs(V.v)/S.v),close=sr227Close(V),buzz=(orb?0:.012*sp+.03*S.bk+.05*close*close);
  if(SKR218.shk>0){p.x+=(Math.random()-.5)*SKR218.shk;p.y+=(Math.random()-.5)*SKR218.shk;SKR218.shk=Math.max(0,SKR218.shk-.03)}
  p.x+=(Math.random()-.5)*buzz;p.y+=(Math.random()-.5)*buzz+S.kick*.02;
  cam.position.copy(p);const l=new THREE.Vector3(V.x+Math.sin(S.cy)*C.ahead*(orb?.2:1)+rx*lag*.4,S.camY+C.ly+low*2.6,V.z+Math.cos(S.cy)*C.ahead*(orb?.2:1)+rz*lag*.4);cam.up.set(0,1,0);cam.lookAt(l);
  S.roll+=((orb?0:Math.max(-.1,Math.min(.1,(V.ov||0)*.006-skr227Wrap(yT-S.cy)*.25)))-S.roll)*Math.min(1,dt*5);cam.rotateZ(S.roll);
  if(typeof look!='undefined')look.copy(l);try{FADE.cam.value.copy(cam.position)}catch(_){}
  if(S.fov0==null)S.fov0=cam.fov;const want=S.fov0+C.fov[0]*Math.min(1,sp)+C.fov[1]*S.bk;S.fov=S.fov==null?want:S.fov+(want-S.fov)*Math.min(1,dt*4);
  if(Math.abs(cam.fov-S.fov)>.02){cam.fov=S.fov;cam.updateProjectionMatrix()}cam.updateMatrixWorld()};
function sr227FovBack(){const S=SKR227;if(S.fov0!=null){try{if(Math.abs(cam.fov-S.fov0)>.01){cam.fov=S.fov0;cam.updateProjectionMatrix()}}catch(_){}S.fov0=null;S.fov=null}}
// how close the storm is: 0 (far) .. 1 (on the hull)
function sr227Close(V){if(!V||V.gap==null)return 0;return Math.max(0,Math.min(1,(SKR227.near-V.gap)/SKR227.near))}
// ---------------- the level's new dressing (once, with the level) ----------------
function sr227DarkTex(){const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');let sd=7;const rn=()=>(sd=sd*16807%2147483647)/2147483647;
  const lg=x.createLinearGradient(0,0,0,128);lg.addColorStop(0,'rgba(60,38,20,0)');lg.addColorStop(.3,'rgba(54,34,18,.55)');lg.addColorStop(.62,'rgba(34,21,11,.95)');lg.addColorStop(1,'rgba(22,13,7,1)');x.fillStyle=lg;x.fillRect(0,0,256,128);
  for(let i=0;i<170;i++){const g=x.createRadialGradient(0,0,0,0,0,1);x.save();x.translate(rn()*256,128-rn()*rn()*140);x.scale(14+rn()*30,10+rn()*24);const d=rn()<.6;g.addColorStop(0,d?'rgba(26,16,8,.6)':'rgba(132,92,52,.4)');g.addColorStop(1,'rgba(60,38,20,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,1,0,7);x.fill();x.restore()}
  return new THREE.CanvasTexture(c)}
{const f=sr165Build;sr165Build=function(){const had=!!SR165.g,g=f.apply(this,arguments);if(had||!SKR227.on||!g)return g;try{const P=sr165Path(),hw=SR165C.hw,rn=dkRng(22702),RM=sr165Ramps();
    // storm markers: leaning poles with rags, one every few lengths on alternate sides (they whip past)
    g.add(lgGroup('SR227|marks',q=>{dt168Up(q);let k=0;for(let s=20;s<P.S-30;s+=11+rn()*5,k++){const sd=k%2?-1:1,[x,z]=P.at(s,sd*(hw+.2+rn()*.8)),y=GH(x,z)-.2,ln=(rn()-.5)*.9,h=3.6+rn()*1.6,yw=P.yaw(s),tx=x+Math.sin(yw)*ln,tz=z+Math.cos(yw)*ln;
        q.L('','c',0x4a3420,[x,y,z],[tx,y+h,tz],.09,.05,5);q.p('','box','c',k%3?0xb8442a:0xc89a40,tx-Math.sin(yw)*.5,y+h-.5,tz-Math.cos(yw)*.5,.04,.7,1.0,0,yw,.2);if(k%5==0)q.p('','sph','c',0xe8e0d0,tx,y+h+.15,tz,.2,.24,.22)}},.1));
    // the ribs of dead giants over the course
    g.add(lgGroup('SR227|ribs',q=>{dt168Up(q);for(let s=120;s<P.S-90;s+=150+rn()*60){if(RM.some(r=>s>r.s-40&&s<r.s+70))continue;for(let k=0;k<3;k++){const ss=s+k*3.6,H=9.5-k*.8;[-1,1].forEach(sd=>{let a=null;for(let i=0;i<=6;i++){const u=i/6,o=sd*(hw+1.2-(hw-1.4)*Math.pow(u,1.5)),[x,z]=P.at(ss+u*1.5,o),b=[x,GH(x,z)-.4+H*Math.sin(u*Math.PI*.5),z];
              if(a)q.L('','c',i%2?0xe6dcc8:0xd8ccb4,a,b,.3-i*.042,.258-i*.042,5);a=b}})}}},.1));
    // wind ripples on the sand (what the ground rushes past with)
    {const pos=[],N=Math.floor(P.S/2.6);for(let i=0;i<N;i++){const s=8+i*2.6+rn()*2,o=(rn()*2-1)*(hw-1.2),w=1.2+rn()*2.2,[ax,az]=P.at(s,o-w/2),[bx,bz]=P.at(s,o+w/2),[cx,cz]=P.at(s+.3,o+w/2),[dx,dz]=P.at(s+.3,o-w/2),Y=(x,z)=>GH(x,z)+.05;
        pos.push(ax,Y(ax,az),az,bx,Y(bx,bz),bz,cx,Y(cx,cz),cz,ax,Y(ax,az),az,cx,Y(cx,cz),cz,dx,Y(dx,dz),dz)}
      const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));const m=new THREE.Mesh(ge,new THREE.MeshBasicMaterial({color:0x6a4a2c,transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2}));m.userData.lpsSkip=1;m.frustumCulled=false;g.add(m)}
    // the storm wall
    {const w=new THREE.Group(),tx=sr227DarkTex();SKR227.wallM=[];for(let k=0;k<5;k++){const mt=new THREE.MeshBasicMaterial({map:tx,color:k%2?0xffe8cc:0xd8b890,transparent:true,opacity:.97,depthWrite:false,fog:false,side:THREE.DoubleSide}),m=new THREE.Mesh(new THREE.PlaneGeometry(120,56),mt);m.position.set((k-2)*9,24-k*1.5,-k*5);m.userData.lpsSkip=1;m.renderOrder=3;w.add(m);SKR227.wallM.push(m)}
      const fl=kqSpr(0xfff0c8,30);fl.material=fl.material.clone();fl.material.opacity=0;fl.material.fog=false;fl.position.set(0,20,-8);w.add(fl);SKR227.wallF=fl;w.visible=false;g.add(w);SKR227.wall=w}
    // sand standing in the air
    {const N=120,ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(N*6),3));const m=new THREE.LineSegments(ge,new THREE.LineBasicMaterial({color:0xf2dcb4,transparent:true,opacity:.4,depthWrite:false}));m.frustumCulled=false;m.userData.lpsSkip=1;m.visible=false;g.add(m);
      SKR227.streak={m,N,p:new Float32Array(N*3),on:new Uint8Array(N)}}
  }catch(e){console.warn('v227 dressing',e)}return g}}
// the streaks: each stands still in the world, drawn as long as the Skimmer is fast, and is put ahead again once it is passed
function sr227Streaks(V,dt){const T=SKR227.streak;if(!T)return;const on=SR165.on&&!!V&&SR165.ph!=='win';T.m.visible=on;if(!on)return;const P=sr165Path(),A=T.m.geometry.attributes.position.array,hw=SR165C.hw,fx=Math.sin(V.h),fz=Math.cos(V.h),close=sr227Close(V);
  const len=Math.max(.15,Math.abs(V.v)*.085*(1+SKR227.bk*.8)),cs=V.s-12;
  for(let i=0;i<T.N;i++){let x=T.p[i*3],y=T.p[i*3+1],z=T.p[i*3+2];const al=(x-V.x)*fx+(z-V.z)*fz;
    if(!T.on[i]||al<-14||al>110){const s=Math.min(P.S,V.s+(T.on[i]?70+Math.random()*34:Math.random()*100)),o=(Math.random()*2-1)*(hw+7),[nx,nz]=P.at(s,o);x=nx;z=nz;const r=Math.random();y=GH(nx,nz)+.3+r*r*8;T.p[i*3]=x;T.p[i*3+1]=y;T.p[i*3+2]=z;T.on[i]=1}
    A[i*6]=x;A[i*6+1]=y;A[i*6+2]=z;A[i*6+3]=x+fx*len;A[i*6+4]=y;A[i*6+5]=z+fz*len}
  T.m.geometry.attributes.position.needsUpdate=true;T.m.material.opacity=Math.min(.8,.16+.2*Math.min(1,V.v/SKR227.v)+.25*SKR227.bk+.3*close)}
// the wall behind, its lightning
function sr227Wall(V,dt,now){const W=SKR227.wall;if(!W)return;const on=SR165.on&&!!V&&V.gap!=null;W.visible=on;if(!on)return;const P=sr165Path(),s=V.s-Math.max(9,V.gap*.62+10),[x,z]=P.at(Math.max(0,s),0),yw=s<0?P.yaw(0):sr227Yaw(s);
  const bx=s<0?x+Math.sin(yw)*s:x,bz=s<0?z+Math.cos(yw)*s:z;W.position.set(bx,GH(x,z)-2,bz);W.rotation.y=yw;SKR227.wallM.forEach((m,k)=>{m.position.x=(k-2)*9+Math.sin(now/900+k*1.7)*4;m.position.y=24-k*1.5+Math.sin(now/700+k)*1.2});
  const F=SKR227.wallF,S=SKR227;S.thT=(S.thT==null?3:S.thT)-dt;if(S.thT<=0&&SR165.ph!=='win'){const c=sr227Close(V);S.thT=(2.2+Math.random()*5)*(1.3-c);S.fl=1;F.position.x=(Math.random()-.5)*60;F.position.y=14+Math.random()*16;skr227Snd('thunder',.35+.65*c,.8+Math.random()*.4)}
  S.fl=Math.max(0,(S.fl||0)-dt*5);F.material.opacity=S.fl*.9}
// ---------------- what you see of it on the screen: the storm's dark, the boost's streaks, the bars ----------------
function sr227Dom(){const S=SKR227;if(S.dom)return S.dom;const st=$('stage')||document.body,d=document.createElement('div');d.id='sk227S';
  d.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:28;opacity:0;background:radial-gradient(ellipse at 50% 46%,rgba(40,24,10,0) 30%,rgba(52,32,14,.72) 72%,rgba(30,18,8,.96) 100%)';st.appendChild(d);
  const f=document.createElement('div');f.id='sk227F';f.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:28;opacity:0;background:rgba(255,236,200,.5)';st.appendChild(f);
  const c=document.createElement('canvas');c.id='sk227L';c.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:28;display:none';st.appendChild(c);
  return S.dom={d,f,c}}
function sr227Lines(dt,k){const cv=sr227Dom().c;if(k<=.03){if(cv.style.display!=='none')cv.style.display='none';return}const w=cv.clientWidth||cv.parentNode.clientWidth,h=cv.clientHeight||cv.parentNode.clientHeight;if(!w||!h)return;
  if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}cv.style.display='block';const c=cv.getContext('2d'),L=SKR227.lines,N=Math.round(14+34*k),cx=w*.5,cy=h*.46,D=Math.hypot(w,h)*.5;
  while(L.length<N)L.push({a:Math.random()*6.283,r:.4+Math.random()*.7,s:.6+Math.random()*.8,w:.6+Math.random()*1.4});L.length=Math.min(L.length,N);c.clearRect(0,0,w,h);c.lineCap='round';
  for(const q of L){q.r+=dt*q.s*(1.4+2.8*k);if(q.r>1.15){q.a=Math.random()*6.283;q.r=.42+Math.random()*.25;q.s=.6+Math.random()*.8}
    const ca=Math.cos(q.a),sa=Math.sin(q.a),r0=q.r*D,len=D*(.05+.16*k)*q.s,a=Math.min(1,(q.r-.42)*3)*(.08+.3*k);if(a<=.01)continue;
    c.strokeStyle='rgba(255,232,190,'+a.toFixed(3)+')';c.lineWidth=q.w;c.beginPath();c.moveTo(cx+ca*r0,cy+sa*r0);c.lineTo(cx+ca*(r0+len),cy+sa*(r0+len));c.stroke()}}
function sr227Screen(V,dt,now){const D=sr227Dom(),S=SKR227,on=SR165.on&&!!V&&SR165.ph!=='win';if(!on){D.d.style.opacity=0;D.f.style.opacity=0;sr227Lines(dt,0);return}
  const c=sr227Close(V),inn=V.gap<=0?1:0;D.d.style.opacity=Math.min(1,c*(.35+.6*c)+inn*(.1+.08*Math.sin(now/90))).toFixed(3);D.f.style.opacity=((S.fl||0)*(.1+.3*c)).toFixed(3);sr227Lines(dt,SR165.ph==='run'?S.bk*.9+(V.air>0?.25:0):0);
  if(SR165.ph==='run'){if(c>.35&&!S.said.near){S.said.near=1;say('🌪️ The storm is on your tail — <b>boost</b> (Shift) to get clear of it!')}
    if(inn&&!(S.inT>0)){S.inT=6;say('🌪️ The storm has you — it is tearing the hull apart! Boost out!')}S.inT=Math.max(0,(S.inT||0)-dt);
    if(V.s/sr165Path().S>S.surge&&!S.said.surge){S.said.surge=1;say('🌪️ <b>The storm surges!</b> Give it everything to the cave!');skr227Snd('thunder',1,.7);shake(.2)}}}
{const f=sr165Hud;sr165Hud=function(){const r=f.apply(this,arguments);try{const V=SR165.me,H=$('sr165H');if(!SKR227.on||!SR165.on||!V||!H)return r;const S=SKR227;
    const n=$('sr165N');if(n)n.textContent='🛷 Hull '+Math.ceil(V.hp)+'% · checkpoint '+SR165.cp+'/3'+(V.gun==='me'?' · ☠ '+S.kills+(S.combo>2&&performance.now()-S.comboT<1500?' (×'+S.combo+')':''):'');
    let b=$('sk227G');if(!b){b=document.createElement('div');b.id='sk227G';b.style.cssText='display:flex;align-items:center;gap:6px;margin-top:4px;font-size:11px;color:#e8c890';
      b.innerHTML='<span>🌪️</span><div style="flex:1;height:6px;background:rgba(0,0,0,.6);border:1px solid rgba(255,200,120,.35);border-radius:3px;overflow:hidden"><i id="sk227Gi" style="display:block;height:100%;width:100%;background:#c8a060"></i></div><span id="sk227Gt" style="min-width:92px;text-align:left"></span>';H.appendChild(b)}
    const g=Math.max(0,V.gap==null?S.gap0:V.gap),k=Math.min(1,g/S.gapMax),c=sr227Close(V),i=$('sk227Gi'),t=$('sk227Gt');if(i){i.style.width=Math.round(k*100)+'%';i.style.background=c>.6?'#ff4a30':c>.1?'#ffa040':'#c8a060'}
    if(t){t.textContent=V.gap<=0?'IN THE STORM':c>.6?'storm closing!':'storm '+Math.round(g)+' behind';t.style.color=c>.6?'#ff7a60':'#e8c890'}
    let hv=$('sk227V');if(V.gun==='me'){if(!hv){hv=document.createElement('div');hv.id='sk227V';hv.style.cssText='margin-top:3px;font-size:11px';H.appendChild(hv)}
      const rdy=S.hv<=0;hv.style.display='';hv.style.color=rdy?'#ffd070':'#8a7a66';hv.textContent=rdy?'💥 Heavy shell ready ('+(document.body.classList.contains('mob')?'dodge button':'Space')+')':'💥 Heavy shell '+S.hv.toFixed(1)+' s'}else if(hv)hv.style.display='none'}catch(e){if(!SKR227.err++)console.warn('v227 hud',e)}return r}}
// ---------------- each frame ----------------
{const f=sr165Tick;sr165Tick=function(dt,now){const S=SKR227,sp=SKR226.space;if(S.on)SKR226.space=0;   // Space is the heavy shell now (v226 fired the guns with it)
  const cp0=SR165.cp,r=f.apply(this,arguments);if(!S.on)return r;S.camDt=(S.camDt||0)+dt;try{const V=SR165.me;
    if(SR165.on&&V){S.hv=Math.max(0,S.hv-dt);if(sp&&V.gun==='me'&&SR165.ph==='run')sr165Fire(V,true,1);if(SR165.ph==='run')S.time+=dt;
      if(SR165.cp>cp0){SR165.V.forEach(o=>{if(o.gap!=null)o.gap=Math.min(S.gapMax,o.gap+8)});skr227Snd('check',1)}
      // the muzzle's light on the hull
      if(V.gun==='me'){if(!S.light||S.light.parent!==V.R.J.gun){try{if(S.light&&S.light.parent)S.light.parent.remove(S.light);S.light=new THREE.PointLight(0xffb060,0,16,2);S.light.position.set(0,.3,2.2);V.R.J.gun.add(S.light)}catch(_){}}
        S.lt=Math.max(0,S.lt-dt*14);if(S.light)S.light.intensity=S.lt*2.2}
      sr227Streaks(V,dt);sr227Wall(V,dt,now);sr227Screen(V,dt,now);if(typeof snd227Loop=='function')snd227Loop(V,dt)}
    else{sr227Streaks(null,dt);sr227Wall(null,dt,now);sr227Screen(null,dt,now);if(typeof snd227Loop=='function')snd227Loop(null,dt);sr227FovBack()}}catch(e){if(!S.err++)console.warn('v227 run',e)}return r}}
{const f=sr165End;sr165End=function(){const r=f.apply(this,arguments);try{const S=SKR227;sr227FovBack();cam.up.set(0,1,0);if(S.light&&S.light.parent)S.light.parent.remove(S.light);S.light=null;S.cy=null;S.bk=0;S.roll=0;
    sr227Streaks(null,0);sr227Wall(null,0,0);sr227Screen(null,0,0);if(typeof snd227Loop=='function')snd227Loop(null,0)}catch(_){}return r}}
{const f=sr165Reset;sr165Reset=function(cp){const S=SKR227;S.hv=0;S.combo=0;S.kick=0;S.inT=0;S.thT=1.2;if(S.streak)S.streak.on.fill(0);SR165.obs.forEach(o=>{o.wh=0;o.hT=0});return f.apply(this,arguments)}}
{const f=sr165Go;sr165Go=function(crews){const S=SKR227;S.kills=0;S.combo=0;S.best=0;S.time=0;S.jumps=0;S.by={};S.said={};S.mT=0;S.mT0=0;const r=f.apply(this,arguments);
  setTimeout(()=>{try{const V=SR165.me;if(!S.on||!SR165.on||!V)return;const mob=document.body.classList.contains('mob');
    say(V.gun==='me'&&V.drv==='chd'?(mob?'🎯 The stick steers (forward: boost) · the guns find their target · hold the attack button to fire · dodge button: heavy shell':'🎯 <b>A / D</b> steer · <b>mouse</b> aims · <b>left button</b> fires · <b>Shift</b> boosts · <b>Space</b> heavy shell')
      :V.gun==='me'?'🎯 Mouse (or A / D) aims · left button fires · Space: heavy shell · your partner steers':'🛷 A / D steer · Shift boosts · S brakes · your partner mans the guns')}catch(_){}},1800);return r}}
function sr227Hint(V){return V&&V.gun==='me'&&V.drv==='chd'?'A / D steer · mouse aims · click fires · Shift boost · Space heavy shell':V&&V.drv==='me'?'A / D steer · Shift boost · S brake':'Mouse aims · click fires · Space heavy shell'}
// the end: what the run was
{const f=sr165Win;sr165Win=function(){const was=SR165.ph,S=SKR227,V=SR165.me;const r=f.apply(this,arguments);try{if(S.on&&was!=='win'&&SR165.ph==='win'&&V){const t=Math.round(S.time),mm=Math.floor(t/60),ss=('0'+t%60).slice(-2);
    say('🏁 <b>The Sandstorm Run</b> · '+mm+':'+ss+' · hull '+Math.ceil(V.hp)+'%'+(V.gun==='me'?' · '+S.kills+' creatures blown apart · best streak ×'+S.best:''));skr227Snd('check',1.2)}}catch(_){}return r}}
