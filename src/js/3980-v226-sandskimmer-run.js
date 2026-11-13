// ================= v226: the Sandstorm Run as a turret fight (owner, Nov 12 2026) =================
// Owner: "The perspective while on the sandskimmers gun is awkward, and you cant aim the gun unless you toggle to mouse mode. The pacing
// is also still off. Lets only have enemies be either on the sides of you or in front of you (if they go behind you they just fall behind)
// this way we only have to turn the gun 180. Let's also make the turret combat more engaging- right now the mobs just die in 1 hit and
// there isn't enough of a swarm for it to be a challenge. Add more variety of mobs with different health. Also- the tip of the gun is
// still floating. The instance is also quite quick- make it a little longer."
// ---------------- aiming: a crosshair that works in every control mode ----------------
//  * The guns follow a crosshair on the screen (SKR226.rx / ry, -1..1 like the mouse's own screen coordinates), drawn by the game:
//    - cursor showing: the crosshair is the cursor (the cursor itself is hidden over the game while you man the guns);
//    - mouse-look on (right click, the pointer locked): moving the mouse moves the crosshair (it used to do nothing: the guns only
//      followed a visible cursor);
//    - keys: A / D (or ← / →) sweep it left and right, W / S up and down, while someone else drives; the touch stick does the same.
//    Left button or Space fires.
//  * The guns turn at most SKR226.arc either side of straight ahead (a half circle: front and sides). Aimed further back, they stop
//    at the limit.
//  * Lock-on: a creature within SKR226.lock of the crosshair on the screen draws the guns to it (the ring on the sand turns red).
//  * The barrels heat up (SKR226.hps a shell, cooling SKR226.cool a second): full, they lock for a moment to cool (a bar under the
//    crosshair, steam from the barrels). Bursts beat holding the trigger down.
//  * Hit marks on the crosshair when a shell lands on something, a bigger mark for a kill.
// ---------------- the camera ----------------
//  Manning the guns, the camera rides higher and further back (SKR226.cam: the hull, both flanks and the course ahead in view);
//  driving keeps v219's close camera.
// ---------------- what the storm throws at you (3302's roster, rebuilt) ----------------
//  Every creature comes from ahead or from the sides. One that drops behind the guns' line (SKR226.behind) falls behind: it slows,
//  gives up and is gone. Clinging scarabs hold on beside or ahead of the turret, never behind it.
//  Shells to kill (SKR226.H, a direct hit counts 1, the blast round it .6):
//    · Sun Scarab  (sc) .6  swarms of 6–13 run out from the dunes ahead, pace the hull (glowing red), leap aboard and gnaw.
//    · Dune Scorpion (sp) 3  waits at the edge ahead and spits venom where the Skimmer is going (a ring shows where it lands).
//    · Shellback (sb, a great armoured scarab: the 'scarab' alpha, grown) 6  crouches at the edge ahead with an ember glow, then
//      charges the hull: a ram costs SKR226.ram hull and most of the speed. Kill it before it reaches you.
//    · Brood Scorpion (gs, the 'scorp' alpha, grown) 16  an elite that hunts the Skimmer twice (SKR226.giants: past ~40% and ~80% of
//      the course): it runs alongside on one flank, spits volleys of three venom globs and calls scarab swarms out of the sand,
//      for up to SKR226.life seconds before it burrows away.
//    · Sand worms 8 (were 4).
//  Pacing (sr165Spawn replaced): the course is four acts between the checkpoints, each rising from calm to a crush (SKR226.I);
//  a few quiet seconds after every checkpoint; nothing in the last stretch before the cave. At most SKR226.max creatures at once.
//  Run creatures give less: fodder scarabs SKR226.xpSc of the XP and loot a quarter of the time; the elites SKR226.xpGs.
// ---------------- a longer run ----------------
//  The Skimmer is slower: cruise SKR226.v (was 15), boost SKR226.vb (was 26): the same course takes about 2 ½ minutes (it was about 1 ½).
// ---------------- the gun ----------------
//  The barrels stood 5 cm in front of the breech block (a gap you could see through): each barrel now has an iron collar that runs
//  back into the block (it also hides the barrel sliding back as it fires). The gunner's brass step plate sat 2 cm over the deck.
// ---------------- co-op ----------------
//  Shellbacks and Brood Scorpions are the shared 'scarab' / 'scorp' alpha monsters (their alpha flag already goes out with them), so
//  partners see them; their size is set from that flag on every screen. Venom, worms and hull damage go out as before (3305). How
//  many shells each one takes is worked out the same way on every screen (SKR226.H by kind and alpha flag). Crosshair, camera and
//  heat are each player's own view of their own guns.
var SKR226={on:true,arc:Math.PI/2+.17,lock:.085,hps:.068,cool:.26,hotEnd:.3,heat:0,hot:0,rx:0,ry:-.12,sens:.0024,keyV:1.6,
  cam:{d:9.6,h:7.8,ahead:6.5,ly:.4,floor:1.8},behind:4.5,
  H:{sc:.6,sp:3,sb:6,gs:16},ram:14,life:44,giants:[.41,.8],v:12.5,vb:21,max:30,xpSc:.4,xpGs:.6,
  I:[.6,.8,.95,1.15],T:null,hm:0,km:0,dom:null,mx:null,my:null,space:0,err:0};
function skr226T0(){return {sc:2.2,sp:5,sb:9,wy:10,calm:0,cp:0,e:[0,0]}}
SKR226.T=skr226T0();
function skr226Gun(){return SR165.on&&SR165.me&&SR165.me.gun==='me'}
// ---------------- the gun model: collars into the breech, the step plate on the deck ----------------
{const f=sk165Build;sk165Build=function(R){f.apply(this,arguments);if(!SKR226.on)return;try{
    const iron=svMat(R,0x45454c,{roughness:.55,metalness:.6});
    ['brlL','brlR'].forEach(j=>svM(R,j,svG('sk226col',()=>{const g=new THREE.CylinderGeometry(.15,.16,.42,10);g.rotateX(Math.PI/2);g.translate(0,0,-.13);return g}),iron));
    const g8=SVX.gc.skcy8;R.J.turret.children.forEach(o=>{if(o.isMesh&&o.geometry===g8&&Math.abs(o.position.z+.85)<.01)o.position.y-=.025})}catch(e){console.warn('v226 gun',e)}}}
// ---------------- speed ----------------
{const f=sr165Drive;sr165Drive=function(V,dt){const r=f.apply(this,arguments);if(SKR226.on&&V&&!V.wreck){const mx=V.trap>0?4.5:V.boost?SKR226.vb:SKR226.v;if(V.v>mx)V.v=Math.max(mx,V.v-Math.max(dt*14,(V.v-mx)*Math.min(1,dt*4)))}return r}}
// ---------------- the crosshair ----------------
function skr226Dom(){if(SKR226.dom)return SKR226.dom;const d=document.createElement('div');d.id='sk226R';
  d.style.cssText='position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:31;display:none';
  d.innerHTML='<svg width="64" height="64" viewBox="-32 -32 64 64" style="position:absolute;left:-32px;top:-32px;overflow:visible">'+
    '<g id="sk226Rg" stroke="#ffd070" stroke-width="2.2" fill="none" stroke-linecap="round" style="filter:drop-shadow(0 0 2px #000)"><circle r="11" opacity=".85"/><path d="M-21 0h-7M21 0h7M0 -21v-7M0 21v7"/><circle r="1.6" fill="#ffd070"/></g>'+
    '<g id="sk226Rh" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity="0"><path d="M-9 -9l-6 -6M9 -9l6 -6M-9 9l-6 6M9 9l6 6"/></g></svg>'+
    '<div style="position:absolute;left:-26px;top:30px;width:52px;height:5px;background:rgba(0,0,0,.55);border:1px solid rgba(255,220,160,.35);border-radius:3px;overflow:hidden"><i id="sk226Ht" style="display:block;height:100%;width:0;background:linear-gradient(90deg,#ffb040,#ff3a20)"></i></div>'+
    '<div id="sk226Hx" style="position:absolute;left:-60px;top:38px;width:120px;text-align:center;font:600 11px system-ui,sans-serif;color:#ff9a70;text-shadow:0 1px 2px #000;display:none">OVERHEATED</div>';
  ($('stage')||document.body).appendChild(d);return SKR226.dom=d}
// mouse-look (pointer locked): the mouse moves the crosshair
addEventListener('pointermove',e=>{try{if(!SKR226.on||!skr226Gun()||document.pointerLockElement!==gl)return;const cl=v=>Math.max(-70,Math.min(70,v||0)),s=SKR226.sens*((typeof SET!='undefined'&&+SET.sens)||1);
  SKR226.rx=Math.max(-.97,Math.min(.97,SKR226.rx+cl(e.movementX)*s));SKR226.ry=Math.max(-.92,Math.min(.75,SKR226.ry-cl(e.movementY)*s*(innerWidth/Math.max(1,innerHeight))))}catch(_){}});
addEventListener('keydown',e=>{if(e.key===' '&&SKR226.on&&skr226Gun())SKR226.space=1});addEventListener('keyup',e=>{if(e.key===' ')SKR226.space=0});addEventListener('blur',()=>{SKR226.space=0});
function skr226Steer(V,dt){const lk=document.pointerLockElement===gl;
  if(!lk&&typeof mOn!='undefined'&&mOn&&(SKR226.mx!==mnd.x||SKR226.my!==mnd.y)){SKR226.rx=mnd.x;SKR226.ry=mnd.y}SKR226.mx=mnd.x;SKR226.my=mnd.y;
  if(V.drv!=='me'){const kx=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0)+(dp[0]||0),ky=(K.w||K.arrowup?1:0)-(K.s||K.arrowdown?1:0)-(dp[1]||0);
    if(kx||ky){SKR226.rx=Math.max(-.97,Math.min(.97,SKR226.rx+kx*SKR226.keyV*dt));SKR226.ry=Math.max(-.92,Math.min(.75,SKR226.ry+ky*SKR226.keyV*dt))}}}
// where the crosshair meets the sand (or, over the horizon, the same bearing 30 out)
const SKR226V=new THREE.Vector2();
function skr226Ground(){SKR226V.set(SKR226.rx,SKR226.ry);SKR218RC.setFromCamera(SKR226V,cam);const o=SKR218RC.ray.origin,d=SKR218RC.ray.direction,p=new THREE.Vector3();let prev=0;
  for(let t=1;t<160;t+=1.2){p.copy(o).addScaledVector(d,t);if(p.y<=GH(p.x,p.z)+.5){let a=prev,b=t;for(let i=0;i<6;i++){const m=(a+b)/2;p.copy(o).addScaledVector(d,m);if(p.y<=GH(p.x,p.z)+.5)b=m;else a=m}
      p.copy(o).addScaledVector(d,b);p.y=GH(p.x,p.z)+.6;return p}prev=t}
  const L=Math.hypot(d.x,d.z)||1;p.set(o.x+d.x/L*30,0,o.z+d.z/L*30);p.y=GH(p.x,p.z)+.6;return p}
// the guns: follow the crosshair inside their arc, drawn to a creature near it
sr165Aim=function(V,dt){const tp=sr165Seat(V,'turret');let A=null;const mine=V===SR165.me&&V.gun==='me';
  if(mine){try{skr226Steer(V,dt);A=skr226Ground()}catch(_){}}
  let best=null;if(mine){let bd=SKR226.lock;const q=new THREE.Vector3();sr165Foes().forEach(f=>{q.copy(f.p).project(cam);if(q.z>1)return;const d=Math.hypot(q.x-SKR226.rx,(q.y-SKR226.ry)*.75);if(d<bd){bd=d;best=f}})}
  else{let bd=40;sr165Foes().forEach(f=>{const d=Math.hypot(f.p.x-tp.x,f.p.z-tp.z);if(d<bd){bd=d;best=f}})}
  if(best)A=best.p.clone();if(!A){const fx=Math.sin(V.h),fz=Math.cos(V.h);A=new THREE.Vector3(V.x+fx*20,V.y+.9,V.z+fz*20)}
  let y=Math.atan2(A.x-tp.x,A.z-tp.z)-V.h;y=Math.atan2(Math.sin(y),Math.cos(y));const dist=Math.max(3,Math.hypot(A.x-tp.x,A.z-tp.z));
  if(SKR226.on&&Math.abs(y)>SKR226.arc){y=Math.sign(y)*SKR226.arc;A=new THREE.Vector3(tp.x+Math.sin(V.h+y)*dist,0,tp.z+Math.cos(V.h+y)*dist);A.y=GH(A.x,A.z)+.6;best=null}
  V.aim=A;V.lock218=!!best;let d=y-V.aY;d=Math.atan2(Math.sin(d),Math.cos(d));V.aY+=d*Math.min(1,dt*16);
  if(SKR226.on)V.aY=Math.max(-SKR226.arc,Math.min(SKR226.arc,V.aY));
  V.aP=Math.max(-.35,Math.min(.25,Math.atan2(tp.y-(A.y||V.y),dist)*.8))};
// heat: a shell warms the barrels; full, they lock until they cool
{const f=sr165Fire;sr165Fire=function(V,own){if(!(SKR226.on&&own&&V&&V===SR165.me))return f.apply(this,arguments);
  if(SKR226.hot||V.fT>0||V.wreck)return;f.apply(this,arguments);if(V.fT>0){SKR226.heat=Math.min(1,SKR226.heat+SKR226.hps);
    if(SKR226.heat>=1&&!SKR226.hot){SKR226.hot=1;try{svSnd('hiss',.7,.8)}catch(_){}try{const R=V.R;['brlL','brlR'].forEach(j=>{const p=new THREE.Vector3(0,0,1.2);R.J[j].localToWorld(p);burst(p,0xe8e8e8,14,1.4,2.2,.9)})}catch(_){}
      if(!SKR226.hotSaid){SKR226.hotSaid=1;say('♨ The barrels overheat! Short bursts keep them firing.')}}}}}
function skr226Heat(V,dt){SKR226.heat=Math.max(0,SKR226.heat-dt*SKR226.cool*(SKR226.hot?1.25:1));if(SKR226.hot&&SKR226.heat<=SKR226.hotEnd)SKR226.hot=0;
  if(SKR226.hot&&Math.random()<dt*18){try{const j=Math.random()<.5?'brlL':'brlR',p=new THREE.Vector3(0,.1,.9+Math.random()*.8);V.R.J[j].localToWorld(p);burst(p,0xdcdcdc,1,.5,1.4,.7)}catch(_){}}}
// the crosshair on the screen, the heat bar, the hit marks
function skr226Draw(now){const on=skr226Gun()&&SR165.ph!=='win';if(!on&&!SKR226.was)return;const D=skr226Dom();D.style.display=on?'':'none';
  if(on!==!!SKR226.was){SKR226.was=on?1:0;try{gl.style.cursor=on?'none':(typeof orb!='undefined'&&orb?'none':'')}catch(_){}}
  if(!on)return;const st=$('stage')||document.body,r=gl.getBoundingClientRect(),s=st.getBoundingClientRect();
  D.style.left=(r.left-s.left+(SKR226.rx+1)/2*r.width)+'px';D.style.top=(r.top-s.top+(1-SKR226.ry)/2*r.height)+'px';
  const V=SR165.me,g=$('sk226Rg');if(g)g.setAttribute('stroke',SKR226.hot?'#8a8a8a':V&&V.lock218?'#ff4030':'#ffd070');
  const hk=Math.max(0,1-(now-SKR226.hm)/160),kk=Math.max(0,1-(now-SKR226.km)/380),h=$('sk226Rh');if(h){h.setAttribute('opacity',Math.max(hk,kk).toFixed(2));h.setAttribute('stroke',kk>0?'#ff5040':'#fff');h.setAttribute('transform','scale('+(1+kk*.5)+')')}
  const t=$('sk226Ht');if(t){t.style.width=Math.round(SKR226.heat*100)+'%';t.style.background=SKR226.hot?'#8a8a8a':'linear-gradient(90deg,#ffb040,#ff3a20)'}const x=$('sk226Hx');if(x)x.style.display=SKR226.hot?'':'none'}
// ---------------- the camera ----------------
skr218Cam=function(){const V=SR165.me;if(!V)return;const C=V.gun==='me'&&SKR226.on?SKR226.cam:SKR218.cam;const fx=Math.sin(V.h),fz=Math.cos(V.h),x=V.x-fx*C.d,z=V.z-fz*C.d;
  let y=V.y+C.h;y=Math.max(y,GH(x,z)+C.floor,GH((x+V.x)/2,(z+V.z)/2)+C.floor+.6);
  const p=new THREE.Vector3(x,y,z);if(SKR218.shk>0){p.x+=(Math.random()-.5)*SKR218.shk;p.y+=(Math.random()-.5)*SKR218.shk;SKR218.shk=Math.max(0,SKR218.shk-.03)}
  cam.position.copy(p);const l=new THREE.Vector3(V.x+fx*C.ahead,V.y+C.ly,V.z+fz*C.ahead);cam.lookAt(l);if(typeof look!='undefined')look.copy(l);try{FADE.cam.value.copy(cam.position)}catch(_){}cam.updateMatrixWorld()};
// ---------------- the creatures: kinds, sizes, how many shells ----------------
function skr226Kind(e){if(!e||!e.c)return null;if(e.sr165)return e.sr165;if(e.mir&&SR165.on){if(e.c.en==='scarab')return e.c.al?'sb':'sc';if(e.c.en==='scorp')return e.c.al?'gs':'sp'}return null}
function skr226R(k){return k==='gs'?2.6:k==='sb'?1.6:k==='sp'?1.5:.9}
// every screen: the alpha scarab is a Shellback (1.4 × the alpha's size), the alpha scorpion a Brood Scorpion (1.75 ×)
function skr226Sizes(){for(const e of enemies){if(e.dead||e.sz226||!e.c||!e.c.al)continue;const k=skr226Kind(e);if(k==='sb'){e.sz226=1;e.m.bs*=1.4}else if(k==='gs'){e.sz226=1;e.m.bs*=1.75}}}
sr165FoeList=function(){const L=[];enemies.forEach(e=>{if(e.dead)return;const k=skr226Kind(e);if(!k)return;
    L.push({p:gY(e.m.position,k==='gs'?1.1:.6),r:skr226R(k),e,hit:q=>{try{const H=SKR226.on?SKR226.H[k]:(k==='sp'||k==='gs'?3.3:1.6);e.sh226=(e.sh226||0)+q;SKR226.hm=performance.now();
      if(e.sh226>=H-1e-6)hurt(e,M(e.c)*3+50,{col:0xffc060},true);else hurt(e,Math.max(1,M(e.c)*q/H*.98),{col:0xffc060},Math.random()<.12);
      if(e.dead){SKR226.km=performance.now();if(e.cl){const i=e.cl.V.cling.indexOf(e);if(i>=0)e.cl.V.cling.splice(i,1);e.cl=null}}}catch(err){if(!SKR226.err++)console.warn('v226 shell',err)}}})});
  SR165F.wy.forEach(W=>{if(W.ph==='tell'||!W.segs)return;[0,5,10].forEach(i=>{const m=i?W.segs[i]:W.head;if(m&&m.visible)L.push({p:m.position.clone(),r:1.4,hit:k=>{W.hp-=k;SKR226.hm=performance.now();burst(m.position,0xffc060,10,1.6,1.4,.4);
      if(W.hp<=0&&W.ph!=='down'){W.ph='down';SKR226.km=performance.now();popT(m.position,'Driven under!','#ffe080',true);svSnd('shriek',.6,1.1)}}})})});return L};
// worms take 8
{const f=sr165Worm;sr165Worm=function(){const W=f.apply(this,arguments);if(W&&SKR226.on)W.hp=8;return W}}
// less XP and loot from the run's fodder (a lot more of it now); the elites a little less
{const f=gw150X;gw150X=function(e){const k=f.apply(this,arguments);try{if(e&&SKR226.on&&e.sr165){if(e.sr165==='sc')return k*SKR226.xpSc;if(e.sr165==='gs')return k*SKR226.xpGs}}catch(_){}return k}}
{const f=lootE;lootE=function(e){if(e&&SKR226.on&&e.sr165==='sc'&&Math.random()>=.25)return;return f.apply(this,arguments)}}
// ---------------- the pacing: four acts, rising inside each ----------------
sr165Spawn=function(dt){const me=SR165.me;if(!me||SR165.ph!=='run'||!sr165Host())return;const P=sr165Path(),f=me.s/P.S,T=SKR226.T;
  if(!SKR226.on)return;if(me.s>P.S-35)return;
  if(SR165.cp>T.cp){T.cp=SR165.cp;T.calm=5;T.sc=Math.max(T.sc,1.5)}if(T.calm>0){T.calm-=dt;return}
  const act=Math.min(3,Math.floor(f*4)),a=f*4-act,I=SKR226.I[act]*(.7+.6*a),alive=enemies.filter(e=>e.sr165&&!e.dead).length,hw=SR165C.hw,R=Math.random;
  const at=(s,o)=>P.at(Math.min(P.S-30,s),o);
  // scarab swarms: from one edge or both, ahead
  T.sc-=dt*I;if(T.sc<=0&&alive<SKR226.max){T.sc=5.6+R()*2.4;const n=Math.round(5+I*5+R()*3),both=act>=1&&R()<.35,s0=me.s+32+R()*12,sd=R()<.5?-1:1;
    for(let i=0;i<n;i++){const side=both?(i%2?1:-1):sd,[x,z]=at(s0+(R()-.5)*8+i*.6,side*(hw-1.2-R()*3));sr165Foe('scarab',x,z,'sc')}
    if(n>=8)say('🪲 A swarm pours over the dunes!')}
  // shellbacks: crouched at the edge ahead, then the charge
  T.sb-=dt*I;if(T.sb<=0&&f>.1&&alive<SKR226.max){T.sb=12+R()*5;const k=act>=2&&R()<.45?2:1;for(let i=0;i<k;i++){const sd=i?-1:(R()<.5?-1:1),[x,z]=at(me.s+44+R()*10+i*7,sd*(hw-1.5));skr226Spawn('sb',x,z)}}
  // scorpions at the edges ahead
  T.sp-=dt*I;if(T.sp<=0&&alive<SKR226.max){T.sp=8+R()*3;const k=act>=1&&R()<.55?2:1;for(let i=0;i<k;i++){const sd=i?-1:(R()<.5?-1:1),[x,z]=at(me.s+46+R()*14+i*8,sd*(hw-1.6));sr165Foe('scorp',x,z,'sp')}}
  // worms
  T.wy-=dt*I;if(T.wy<=0&&f>.12){T.wy=13+R()*4;const s=me.s+40+R()*16,half=R()<.5?-1:1,o0=half<0?-hw+.5:-1.5+R()*1.5,o1=half<0?1.5-R()*1.5:hw-.5;sr165Worm(s,o0,o1,true)}
  // the Brood Scorpions
  SKR226.giants.forEach((g,i)=>{if(!T.e[i]&&f>g){T.e[i]=1;const sd=R()<.5?-1:1,[x,z]=at(me.s+40,sd*(hw-1.5));skr226Spawn('gs',x,z)}})};
function skr226Spawn(k,x,z){let e=null;try{e=spawnEnemy(k==='gs'?'scorp':'scarab',x,z,sr165Lv()+(k==='gs'?2:0),{agg:1,al:1})}catch(err){if(!SKR226.err++)console.warn('v226 foe',err)}if(!e)return null;
  e.sr165=k;e.agg=1;e.hunt=1;e.srT=1+Math.random();e.k226={st:k==='gs'?'hunt':'wait',t:0,side:0,sp:2.2,br:6};burst(gY(e.m.position,.5),0xd8b080,k==='gs'?50:22,2.4,2,.6);
  if(k==='gs'){try{svSnd('roar',.8,.55);shake(.25)}catch(_){}say('⚠ <b>A Brood Scorpion</b> bursts from the dunes and hunts the Skimmer!');if(SR165.me)popT(gY(e.m.position,3),'Brood Scorpion','#ff9a60',true)}
  return e}
{const f=sr165FoesReset;sr165FoesReset=function(){const r=f.apply(this,arguments);try{const T=SKR226.T=skr226T0(),cf=(sr165CPs()[SR165.cp]||0)/sr165Path().S;T.cp=SR165.cp;SKR226.giants.forEach((g,i)=>{T.e[i]=cf>=g?1:0});SKR226.heat=0;SKR226.hot=0}catch(_){}return r}}
// ---------------- their behaviour ----------------
function skr226Along(V,p){return (p.x-V.x)*Math.sin(V.h)+(p.z-V.z)*Math.cos(V.h)}
{const f=sr165FoeAI;sr165FoeAI=function(e,dt,now){if(!SKR226.on||!e||!SR165.on||SR165.ph!=='run')return f.apply(this,arguments);
  try{const m=e.m,[V]=sr165Near(m.position);if(!V)return f.apply(this,arguments);const al=skr226Along(V,m.position);
    // behind the guns: it falls behind and is gone
    if(!e.cl&&(e.fall226||al<-SKR226.behind)){if(!e.fall226){e.fall226=1;e.k218=null}const sp=Math.max(0,(e.fsp226=(e.fsp226==null?6:e.fsp226)*(1-dt*1.2)));const fx=Math.sin(m.rotation.y),fz=Math.cos(m.rotation.y);
      m.position.x+=fx*sp*dt;m.position.z+=fz*sp*dt;m.position.y=GH(m.position.x,m.position.z);animC(m,now,sp>.6,sp*.4);if(al<-28||Math.hypot(V.x-m.position.x,V.z-m.position.z)>60)removeE(e);return}
    // scarabs keep beside or ahead of the turret
    if(e.sr165==='sc'&&!e.cl&&!e.k218){const fx=Math.sin(V.h),fz=Math.cos(V.h),rx=m.position.x-V.x,rz=m.position.z-V.z;e.k218={st:'run',t:0,side:(rx*fz-rz*fx)>=0?1:-1,f:-.5+Math.random()*2.5}}
    if(e.sr165==='sb'){skr226Shell(e,V,al,dt,now);return}
    if(e.sr165==='gs'){skr226Brood(e,V,al,dt,now);return}
    if(e.sr165==='sp'&&al<-1){animC(m,now,false,0);return}}catch(err){if(!SKR226.err++)console.warn('v226 foe ai',err)}
  return f.apply(this,arguments)}}
// the Shellback: crouched with an ember glow, then a charge at where the hull will be
function skr226Shell(e,V,al,dt,now){const m=e.m,K=e.k226;K.t+=dt;
  if(K.st==='wait'){m.rotation.y=Math.atan2(V.x-m.position.x,V.z-m.position.z);animC(m,now,false,0);
    if(al<26&&al>-2){K.st='charge';K.t=0;try{svSnd('charge',.6,.7)}catch(_){}if(V===SR165.me&&!SKR226.sbSaid){SKR226.sbSaid=1;say('🪲 A <b>Shellback</b> charges! Kill it before it rams the hull!')}}return}
  if(K.st==='charge'){const fx=Math.sin(V.h),fz=Math.cos(V.h),tx=V.x+fx*Math.max(0,V.v)*.45,tz=V.z+fz*Math.max(0,V.v)*.45,dx=tx-m.position.x,dz=tz-m.position.z,L=Math.hypot(dx,dz)||1,sp=Math.min(24,Math.max(10,V.v+7));
    m.position.x+=dx/L*Math.min(L,sp*dt);m.position.z+=dz/L*Math.min(L,sp*dt);m.position.y=GH(m.position.x,m.position.z);m.rotation.y=Math.atan2(dx,dz);animC(m,now,true,sp*.45);
    if(Math.random()<dt*20)burst(gY(m.position,.2),0xd8b080,2,1.4,1,.4);
    if(Math.hypot(V.x-m.position.x,V.z-m.position.z)<2.7){K.st='spent';e.fall226=1;e.fsp226=2;sr165Hurt(V,SKR226.ram,'ram');V.v*=.5;V.bump=.7;try{svSnd('heavy',1,.55);svSnd('crack',.6,.7)}catch(_){}
      burst(gY(V.m.position,1.2),0xd8b080,40,3,2.6,.7);if(V===SR165.me){shake(.45);say('🪲 The Shellback rams the hull!')}
      m.rotation.y+=Math.PI}
    if(K.t>6){K.st='spent';e.fall226=1}}}
// the Brood Scorpion: alongside on one flank, venom volleys, swarms called out of the sand
function skr226Brood(e,V,al,dt,now){const m=e.m,K=e.k226,P=sr165Path(),hw=SR165C.hw;K.t+=dt;
  if(!K.side){const rx=m.position.x-V.x,rz=m.position.z-V.z;K.side=(rx*Math.cos(V.h)-rz*Math.sin(V.h))>=0?1:-1}
  if(K.t>SKR226.life){burst(gY(m.position,.5),0xd8b080,60,3,3,.8);try{svSnd('roar',.6,.5)}catch(_){}if(V===SR165.me)say('🦂 The Brood Scorpion burrows away into the storm.');removeE(e);return}
  const fx=Math.sin(V.h),fz=Math.cos(V.h),lx=fz,lz=-fx,ahead=2+Math.sin(K.t*.45)*2.5;let tx=V.x+fx*ahead+lx*K.side*7,tz=V.z+fz*ahead+lz*K.side*7;
  const q=P.near(tx,tz,V.s);if(Math.abs(q.o)>hw-1.3){[tx,tz]=P.at(q.s,Math.sign(q.o)*(hw-1.3))}
  const dx=tx-m.position.x,dz=tz-m.position.z,L=Math.hypot(dx,dz)||1,sp=Math.min(21,Math.max(4,L*2.2+Math.max(0,V.v)*.85));
  m.position.x+=dx/L*Math.min(L,sp*dt);m.position.z+=dz/L*Math.min(L,sp*dt);m.position.y=GH(m.position.x,m.position.z);
  m.rotation.y=L>1.2?Math.atan2(dx,dz):Math.atan2(V.x-m.position.x,V.z-m.position.z);animC(m,now,L>.6,Math.min(8,sp*.4));
  if(Math.random()<dt*14)burst(gY(m.position,.2),0xd8b080,2,1.6,1.2,.5);
  if(al<-1)return;
  K.sp-=dt;if(K.sp<=0){K.sp=2.6+Math.random()*.7;const T=1.15,d=Math.hypot(V.x-m.position.x,V.z-m.position.z),from=gY(m.position,2.2),px=V.x+fx*V.v*T,pz=V.z+fz*V.v*T;
    [-2.6,0,2.6].forEach((o,i)=>setTimeout(()=>{try{if(!e.dead&&SR165.on&&SR165.ph==='run')sr165Sting(from,px+lx*o,pz+lz*o,T+i*.08)}catch(_){}},i*90));animC(m,now,false,0)}
  K.br-=dt;if(K.br<=0){K.br=7+Math.random()*2;const n=3+Math.floor(Math.random()*2);for(let i=0;i<n;i++)sr165Foe('scarab',m.position.x+(Math.random()-.5)*3,m.position.z+(Math.random()-.5)*3,'sc');
    try{svSnd('hiss',.6,.8)}catch(_){}burst(gY(m.position,.3),0xd8b080,30,2.4,2,.6)}}
// glows: the Shellback's embers (every screen), worked out from the creature itself
var SKR226G=new Map();
function skr226Glow(now){const seen=new Set();if(SR165.on)for(const e of enemies){if(e.dead||!e.m||!e.m.visible)continue;const k=skr226Kind(e);if(k!=='sb'&&k!=='gs')continue;seen.add(e);
    let s=SKR226G.get(e);if(!s){s=kqSpr(k==='gs'?0xff7a30:0xff4020,k==='gs'?2.6:1.6);s.material=s.material.clone();s.userData.lpsSkip=1;scene.add(s);SKR226G.set(e,s)}
    s.position.set(e.m.position.x,e.m.position.y+(k==='gs'?1.4:.9),e.m.position.z);const ch=e.k226&&e.k226.st==='charge';s.material.opacity=(ch?.75:.4)+.2*Math.sin(now/(ch?60:160))}
  SKR226G.forEach((s,e)=>{if(!seen.has(e)){scene.remove(s);s.material.dispose();SKR226G.delete(e)}})}
// clinging scarabs never sit behind the turret
{const f=skr218Scarab;skr218Scarab=function(e){const r=f.apply(this,arguments);try{if(SKR226.on&&e.cl&&e.cl.f<-.5)e.cl.f=-.5}catch(_){}return r}}
// more of them pace and cling (the swarms are bigger)
if(SKR226.on){SKR218.skip=1e9;SKR218.perSide=3;SKR218.cling=5}
// ---------------- the HUD: the elite's health under the hull bar ----------------
function skr226Hud(){const H=$('sr165H');if(!H)return;let b=$('sk226B');const g=SR165.on&&enemies.find(e=>!e.dead&&skr226Kind(e)==='gs');
  if(!g){if(b)b.style.display='none';return}
  if(!b){b=document.createElement('div');b.id='sk226B';b.style.cssText='margin-top:4px;font-size:11px;color:#ffb090';b.innerHTML='🦂 Brood Scorpion<div style="height:6px;margin-top:2px;background:rgba(0,0,0,.6);border:1px solid rgba(255,140,90,.45);border-radius:3px;overflow:hidden"><i id="sk226Bi" style="display:block;height:100%;background:linear-gradient(90deg,#8a1a10,#ff7040)"></i></div>';H.appendChild(b)}
  b.style.display='';const i=$('sk226Bi');if(i)i.style.width=Math.max(0,Math.min(100,100*g.c.h/M(g.c)))+'%'}
// ---------------- each frame ----------------
{const f=sr165Tick;sr165Tick=function(dt,now){const r=f.apply(this,arguments);if(!SKR226.on)return r;try{
    if(SR165.on){skr226Sizes();skr226Glow(now);const V=SR165.me;if(V&&V.gun==='me'){skr226Heat(V,dt);if(SKR226.space&&SR165.ph==='run')sr165Fire(V,true)}skr226Hud()}
    else if(SKR226G.size)skr226Glow(now);
    skr226Draw(now)}catch(e){if(!SKR226.err++)console.warn('v226 run',e)}return r}}
{const f=sr165End;sr165End=function(){const r=f.apply(this,arguments);try{SKR226.space=0;SKR226.heat=0;SKR226.hot=0;skr226Draw(performance.now());skr226Glow(0)}catch(_){}return r}}
// the start card says how to aim
{const f=sr165Go;sr165Go=function(crews){SKR226.rx=0;SKR226.ry=-.12;SKR226.hotSaid=0;SKR226.sbSaid=0;const r=f.apply(this,arguments);
  setTimeout(()=>{try{const V=SR165.me;if(SR165.on&&V&&V.gun==='me')say('🎯 Aim with the mouse (with or without mouse-look)'+(V.drv!=='me'?' or A / D':'')+' · left click or Space fires · the guns cover the front and both sides.')}catch(_){}},1800);return r}}
