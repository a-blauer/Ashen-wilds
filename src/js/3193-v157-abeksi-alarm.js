// ================= v157 Abeksi: the assassin's knife and the roused city =================
// Owner: "Add an option to assassinate an abeksi if the player is unsuspected behind them. When a player is caught all of the
// snakepeople in the city become hostile and the sneaking option is disabled. All snake residents in the city become enemies. Players can
// attempt to kill them all and leave through a gate rather than the sewer."
//  * Assassinate (ab157Target, ab157Assassinate): close behind an Abeksi (AB157K.r tiles, inside the AB157K.back cone behind its back)
//    that does not suspect you (calm, suspicion under AB152V.look), F · "Assassinate" (a red ring marks the target): the hero lunges and
//    strikes, the snake falls and stays lying in its blood. Silent, but any snake that SEES the kill (its eyes, ab152Sees) catches you,
//    and folk close by who are facing it do too (ab157Witness). A body seen by a calm watcher (ab157Bodies) makes it come to look
//    (suspicion to AB152V.go: it investigates, no instant alarm). Every resident can be killed this way: the plan's snakes and the
//    v157 folk (3191), not those on roofs or lamp towers.
//  * Caught = the city's alarm (ab157Alarm, replaces "back to the last checkpoint"): horns and drums, "The city is roused!", the stealth
//    HUD, crouch and the view cones go, the no-fighting rule is lifted, and every resident (AB157A.R: the snakes then the folk, plan
//    order) turns hostile: residents near a hero (AB157K.act tiles) become real enemies of the game's own kind (spawnEnemy 'nagaw' /
//    'nagaa' / 'nagas' by their look, the city's level INSL[30].lv; guards full strength, townsfolk weaker: AB157K.civ), at most
//    AB157K.cap at once, nearest first; the rest stand and stare. XP and loot are scaled down (AB157K.xp, .loot). The tracker counts
//    "Abeksi left"; with none left, F at the city gate (Gate Yard) leaves the city: ab152Finish('gate') (same as the drain, which keeps
//    working). Death during the alarm: after "Rise Again" the city is calm again from the last checkpoint, every resident back.
//  * v158 (owner: "players don't have to kill every single abeksi - they can just fight their way to the gate if seen. When the bell is
//    rung when you're spotted a substantial amount of abeksi in the immediate area actively look for you and attack"): the alarm is a
//    BELL (ab158Bell, three tolls over drums). It calls up to AB158.bell.n of the nearest residents by street distance (within
//    AB158.bell.r steps) to hunt the hero: they run through the streets on a flow field from the heroes (ab158Flow, rebuilt every
//    0.35 s; ab158Step) and turn into the game's enemies when they are AB158.eng steps away (any standing resident that close joins too),
//    at most AB157K.cap fighting at once. An enemy left AB158.drop steps behind (cut off by a wall) becomes a street hunter again, with the
//    health it had. Every AB158.bell.re s the bell tolls again and calls AB158.bell.rn more. The city gate opens as soon as the alarm
//    sounds: F there leaves the city (ab152Finish('gate')); killing everyone is no longer needed. Tracker / banner: "Hunting you".
//  * Co-op (3180): the map's host owns the alarm's enemies (spawning, AI; the game's monster sync shows them to the others); kills and
//    assassinations are sent (['ab','x',i,u,v] a knife kill: the host checks for witnesses; ['ab','d',i,u,v] a resident fell;
//    ['ab','rs',states] the host's residents every 0.6 s: 0 standing, 1 fighting, 2 dead; ['ab','calm'] someone died: everyone back).
var AB157K={r:1.6,back:1.05,act:24,cap:10,civ:{hp:.55,atk:.6},xp:{g:.6,c:.3},loot:{g:.45,c:.15},gate:[75,185.6],gateR:3.2};
var AB157A={on:0,R:null,bodies:[],tg:null,kill:null,ring:null,tA:0,tB:0,tS:0,left:0,pool:null};
function ab157Lead(){try{return typeof ab155Lead!='function'||ab155Lead()}catch(_){return true}}
function ab157Co(){try{return typeof ab155Co=='function'&&ab155Co()}catch(_){return false}}
// every resident, in plan order (the same on every client)
function ab157Res(){const S=AB152.S;if(!S)return [];if(AB157A.R&&AB157A.R.S===S)return AB157A.R;const L=S.acts.slice();try{if(AB157.S)AB157.S.folk.forEach(a=>L.push(a))}catch(_){}
  L.forEach((a,i)=>a.ri=i);L.S=S;return AB157A.R=L}
function ab157Guard(a){return a.role=='sentry'||a.role=='patrol'||a.role=='lantern'||!!a.o.chef}
function ab157Left(){return ab157Res().filter(a=>!a.dead).length}
// ---------------- the knife ----------------
function ab157Target(){const S=AB152.S,H=AB152H;if(!S||AB157A.on||AB157A.kill||H.cau||H.frz)return null;let best=null,bd=AB157K.r;
  for(const a of ab157Res()){if(a.dead||a.e||a.hid||(a.o.lift||0)>=1||a.st=='caught')continue;const du=H.u-a.u,dv=H.v-a.v,d=Math.hypot(du,dv);if(d>bd)continue;
    if(a.sus>=AB152V.look||(a.st!='routine'&&a.st!='return'))continue;let df=Math.atan2(du,dv)-(a.yaw+(a.hy||0));df=Math.atan2(Math.sin(df),Math.cos(df));
    if(Math.PI-Math.abs(df)>AB157K.back)continue;if(!ab152LOS(S.G,a.u,a.v,H.u,H.v,false))continue;best=a;bd=d}
  return best}
// who saw it: the snakes' own eyes (as if the hero were standing in the open), and folk close by facing the spot
function ab157Witness(v,hu,hv,cr){const S=AB152.S,G=S.G;for(const a of ab157Res()){if(a===v||a.dead||a.e||a.hid)continue;const d=Math.hypot(a.u-hu,a.v-hv);if(d>16)continue;
    if(!a.folk){if(ab152Sees(a,hu,hv,cr,Math.max(.6,ab152Light(hu,hv)))>0)return a;continue}
    if(d>5||(a.o.lift||0)>=1)continue;let df=Math.atan2(hu-a.u,hv-a.v)-a.yaw;df=Math.atan2(Math.sin(df),Math.cos(df));if(Math.abs(df)<1.0&&ab152LOS(G,a.u,a.v,hu,hv,false))return a}
  return null}
function ab157PoolMesh(){const A=AB157A;if(!A.pool)A.pool={g:new THREE.CircleGeometry(1,14).rotateX(-Math.PI/2),m:new THREE.MeshBasicMaterial({color:0x3a0507,transparent:true,opacity:.86,depthWrite:false})};
  const m=new THREE.Mesh(A.pool.g,A.pool.m);m.renderOrder=2;m.userData.psNo=1;return m}
// a resident falls: the body topples onto its side and stays, a pool of blood spreads under it
function ab157Fall(a,u,v,anim,delay){const S=AB152.S,I=S.I;a.dead=1;a.e=null;a.halt=1;a.st='routine';a.sus=0;a.mv=0;if(u!=null){a.u=u;a.v=v}a.layT=performance.now()+(delay||0);
  const g=a.g,b=g.b;if(!b)return;const sd=(a.sd%2)?1:-1,L=typeof death135Lift=='function'?death135Lift(g):.15,x=I.x0+a.u,z=I.y0+a.v;a.fallSd=sd;
  if(anim&&typeof tw=='function')tw(640,k=>{const q=typeof death135Ease=='function'?death135Ease(k):k;b.rotation.z=sd*1.42*q;b.position.y=L*Math.sin(1.42*q)});else{b.rotation.z=sd*1.42;b.position.y=L*Math.sin(1.42)}
  const p=ab157PoolMesh();p.position.set(x+Math.cos(a.yaw)*sd*.35,GH(x,z)+.03,z-Math.sin(a.yaw)*sd*.35);p.scale.setScalar(.05);S.root.add(p);
  const t0=performance.now()+(delay||0);AB157A.bodies.push({a,u:a.u,v:a.v,p,seen:new Set(),t0})}
function ab157Unfall(a){a.dead=0;a.halt=0;a.e=null;a.hid=0;a.net1=0;a.layT=0;const b=a.g&&a.g.b;if(b){b.rotation.z=0;b.position.y=0}if(a.folk){a.g.visible=true}}
function ab157Assassinate(a,remote){const S=AB152.S,I=S.I,H=AB152H;if(!a||a.dead)return;
  if(!remote){AB157A.kill={a,t0:performance.now()};H.frz=1;const x=I.x0+a.u,z=I.y0+a.v,yw=a.yaw+(a.hy||0),bx=x-Math.sin(yw)*.85,bz=z-Math.cos(yw)*.85;
    const P=pl.position,x0=P.x,z0=P.z;pl.rotation.y=Math.atan2(x-x0,z-z0);tw(220,k=>{if(!solid(bx,bz)){P.x=x0+(bx-x0)*k;P.z=z0+(bz-z0)*k}});
    try{svSnd('whoosh',.35,1.3)}catch(_){}}
  a.halt=1;a.st='routine';a.sus=0;
  setTimeout(()=>{if(a.dead)return;const x=I.x0+a.u,z=I.y0+a.v;ab157Fall(a,null,null,true);
    try{burst(new THREE.Vector3(x,GH(x,z)+1.1,z),0x5a0808,22,1.6,1.4,.55);burst(new THREE.Vector3(x,GH(x,z)+1.1,z),0x1a0a0a,10,1,1,.6);svSnd('crack',.35,.55);svSnd('heavy',.25,1.6)}catch(_){}
    if(remote)return;
    try{if(typeof cl155Send=='function'&&ab157Co())cl155Send(['ab','x',a.ri,cl155R1(a.u),cl155R1(a.v),cl155R1(AB152H.u),cl155R1(AB152H.v)])}catch(_){}
    if(ab157Lead()){const w=ab157Witness(a,H.u,H.v,!!H.cr);if(w){AB157A.kill=null;H.frz=0;say('👁 <b>'+(w.folk?'Someone':'A guard')+' saw the kill!</b>');w.yaw=Math.atan2(H.u-w.u,H.v-w.v);ab152Caught(w);return}}
    say('🗡 <b>Silent.</b> No one saw.')},330);
  if(!remote)setTimeout(()=>{if(AB157A.kill&&AB157A.kill.a===a){AB157A.kill=null;if(!AB152H.cau)AB152H.frz=0}},720)}
// the hero's strike: wind up behind the target, then a short downward thrust (undone each frame by 3155's animHero layer)
{const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);try{const K=AB157A.kill;if(K&&(h||pl)===pl&&pl.bones){const B=pl.bones,k=(performance.now()-K.t0)/650;if(k<1){
    const w=ab152SS(0,.4,k)*(1-ab152SS(.42,.55,k)),s=ab152SS(.42,.55,k)*(1-ab152SS(.85,1,k));
    [['aR0',-2.5*w-1.25*s],['aR1',-.7*w-.15*s],['aL0',-1.1*w-.8*s],['aL1',-.9*w],['spine',-.08*w+.42*s],['chest',.12*s],['head',.1*w+.25*s],['lh0',-.4*s],['rh0',.25*s],['lh1',.5*s],['rh1',.3*s]].forEach(([n,v])=>ab152CrAdd(B[n],'x',v));
    ab152CrAdd(B.spine,'y',.45*w-.3*s)}}}catch(_){}return r}}
// ---------------- the alarm ----------------
// a war horn (three long blasts) over drums
function ab157Horn(drumsOnly){let a=null;try{a=AUD}catch(_){}if(!a||a.state!='running'||SET.sfx===false)return;const t0=a.currentTime,out=a.out;
  try{if(!drumsOnly)[0,1.5,3.0].forEach((d,i)=>{const t=t0+d,len=i==2?2.2:1.2,lp=a.createBiquadFilter(),g=a.createGain();lp.type='lowpass';lp.frequency.setValueAtTime(380,t);lp.frequency.linearRampToValueAtTime(900,t+.25);lp.connect(g);g.connect(out);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.2,t+.18);g.gain.setValueAtTime(.18,t+len-.2);g.gain.exponentialRampToValueAtTime(.0005,t+len+.4);
      [[98,'sawtooth'],[147,'sawtooth'],[49,'square']].forEach(([f,ty],j)=>{const o=a.createOscillator();o.type=ty;o.frequency.setValueAtTime(f*(i==2?1.06:1)*.94,t);o.frequency.linearRampToValueAtTime(f*(i==2?1.06:1),t+.2);
        const og=a.createGain();og.gain.value=j==2?.35:j?.5:.8;o.connect(og);og.connect(lp);o.start(t);o.stop(t+len+.5)})});
    if(typeof NOISE!='undefined'&&NOISE)for(let i=0;i<16;i++){const t=t0+.2+i*.32+(i%4==3?.08:0),s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),o=a.createOscillator(),og=a.createGain();
      s.buffer=NOISE;f.type='lowpass';f.frequency.value=180;g.gain.setValueAtTime(i%4==0?.5:.28,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random()*.5);s.stop(t+.35);
      o.type='sine';o.frequency.setValueAtTime(75,t);o.frequency.exponentialRampToValueAtTime(38,t+.25);og.gain.setValueAtTime(i%4==0?.45:.25,t);og.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(og);og.connect(out);o.start(t);o.stop(t+.35)}}catch(_){}}
function ab157Alarm(){if(AB157A.on||!ab152In()||!AB152.S)return;const H=AB152H;AB157A.on=1;AB157A.t0=performance.now();H.cau=null;H.frz=0;AB157A.kill=null;ab152SetCrouch(false);H.crK=0;
  ab157Res().forEach(a=>{if(!a.dead){a.halt=0;a.st='look';a.sus=0}});
  AB157A.called=0;AB157A.tollT=performance.now();AB158.fl=null;AB158.flT=0;
  try{ab158Bell(3);ab157Horn(true);flash('rgba(255,40,20,.55)');shake(.3)}catch(_){}
  try{zt116Show(ZT116.Z[1],'Abeksi','The Bell Tolls!','The serpents nearby are hunting you through the streets','Fight your way to the city gate · or flee through the drain','z1')}catch(_){}
  say('🔔 <b>The alarm bell tolls!</b> The Abeksi nearby are coming for you. Fight your way to the <b>city gate</b> — or flee through the drain.')}
// v158: a few seconds' grace after the city calms (a restart at the checkpoint): nobody can be caught yet. In co-op the partner who died
// still lies where they fell (often in a guard's view) until they rise, and the host's snakes look at every hero: without the grace that
// body rang the bell again the moment the city had calmed.
{const f=ab152Caught;ab152Caught=function(a){if(AB157A.calmT&&performance.now()-AB157A.calmT<AB158.grace*1000)return;return f.apply(this,arguments)}}
// what being seen leads to now: a moment of "!" (3155's hiss and flash), then the alarm
ab152AfterCaught=function(a){say('👁 <b>Spotted!</b>');setTimeout(()=>{try{if(ab152In()&&AB152.S)ab157Alarm()}catch(e){console.error('v157 alarm',e)}},900)};
// the city calm again: the fighting residents leave the field, every resident is back at their post (restore: the dead rise too)
function ab157Calm(restore){const A=AB157A;A.on=0;A.kill=null;A.tg=null;A.called=0;A.hunt=0;AB158.fl=null;if(restore)A.calmT=performance.now();
  for(const a of ab157Res()){a.hunt=0;a.hpK=null;if(a.e){const e=a.e;a.e=null;try{if(!e.dead&&enemies.indexOf(e)>=0)removeE(e)}catch(_){}}a.net1=0;if(restore&&a.dead)ab157Unfall(a);
    if(restore&&a.folk){a.halt=0;a.hid=0;ab152ResetActor(a)}}
  try{enemies.slice().forEach(e=>{if(e.ab157&&!e.dead)removeE(e)})}catch(_){}
  if(restore){A.bodies.forEach(b=>{if(b.p&&b.p.parent)b.p.parent.remove(b.p)});A.bodies=[]}
  AB152H.nT=0}
// a resident turns into one of the game's enemies, where it stands (or on the nearest street, from a roof or a tower)
function ab157Open(S,u,v){const G=S.G,ok=(x,y)=>x>=0&&y>=0&&x<G.W&&y<G.H&&!G.sol[y*G.W+x]&&G.cls[y*G.W+x]<2;let ru=Math.round(u),rv=Math.round(v);if(ok(ru,rv))return [u,v];
  for(let r=1;r<10;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(ok(ru+dx,rv+dy))return [ru+dx,rv+dy]}return [u,v]}
function ab157Rouse(a){const S=AB152.S,I=S.I,lv=(INSL[30]&&INSL[30].lv)||I.lv||[10,11],gd=ab157Guard(a),key=a.look=='w'?'nagaw':a.look=='a'?'nagaa':'nagas';
  const [u,v]=(a.o.lift||0)>.9?ab157Open(S,a.u,a.v):ab157Open(S,a.u,a.v),x=I.x0+u,z=I.y0+v,n0=tws.length;let e=null;
  try{e=spawnEnemy(key,x,z,Math.max(1,Math.min(MAXLV,gd?lv[1]:lv[0]-1)),{agg:1})}catch(err){console.error('v157 rouse',err)}
  if(!e)return null;if(tws.length>n0&&tws[n0].ms===450)tws.splice(n0,1);e.m.scale.setScalar(e.m.bs);e.m.rotation.y=a.yaw;
  e.hunt=1;e.agg=1;e.ab157={ri:a.ri,g:gd};e.c.n=gd?'Abeksi Guard':'Abeksi '+({chop:'Butcher',skin:'Butcher',stir:'Cook',spit:'Cook',pour:'Alchemist',grind:'Alchemist',feed:'Rat-herd',fork:'Rat-herd',haggle:'Merchant',polish:'Smith',chant:'Mystic',kneel:'Zealot',offer:'Zealot',flute:'Flautist',fluteSit:'Flautist',fluteFloor:'Flautist',drumSit:'Drummer',spar:'Warrior'}[a.pose]||'Townsfolk');
  if(a.pose=='spar')e.ab157.g=true;
  if(!e.ab157.g){const c=e.c,K=AB157K.civ;c.st.hp*=K.hp;c.st.pa*=K.atk;c.st.ma*=K.atk;c.h=Math.round(c.st.hp);
    try{const h=e.m.h;['aR2','aL2'].forEach(b=>{const bn=h.bones[b];if(bn)bn.children.slice().forEach(o=>{if(!o.isBone)bn.remove(o)})});const t=ab152Tool(a.pose=='chop'||a.pose=='skin'?'cleaver':'cleaver');if(t){t.rotation.x=-1;t.position.set(0,-.03,.02);h.bones.aR2.add(t)}}catch(_){}}
  if(a.hpK!=null&&a.hpK<1){const c=e.c;c.h=Math.max(1,Math.round(M(c)*a.hpK))}a.hpK=null;a.hunt=0;
  a.e=e;a.st='look';return e}
// ---------------- v158: the bell and the hunt ----------------
var AB158={bell:{r:44,n:16,re:24,rn:5},eng:7,drop:14,hold:4,grace:4,spd:{g:4.4,c:3.7},fl:null,flT:0};
// a heavy bronze bell: inharmonic partials with long decays, and the clang of the strike
function ab158Bell(n){let a=null;try{a=AUD}catch(_){}if(!a||a.state!='running'||SET.sfx===false)return;const t0=a.currentTime,out=a.out;
  try{for(let i=0;i<n;i++){const t=t0+i*2.1,f0=104;
    [[.5,.5,7],[1,.9,5],[1.19,.55,3.5],[1.5,.4,3],[2,.45,2.6],[2.51,.25,2],[2.67,.22,1.8],[3.01,.18,1.5],[4.1,.1,1]].forEach(([r,amp,dec])=>{const o=a.createOscillator(),g=a.createGain();
      o.type='sine';o.frequency.value=f0*r*(1+(Math.random()-.5)*.003);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(amp*.17,t+.008);g.gain.exponentialRampToValueAtTime(.0003,t+dec);o.connect(g);g.connect(out);o.start(t);o.stop(t+dec+.05)});
    if(typeof NOISE!='undefined'&&NOISE){const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NOISE;f.type='bandpass';f.frequency.value=2300;f.Q.value=2;
      g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random()*.5);s.stop(t+.15)}}}catch(_){}}
function ab158Ok(G,x,y){return x>=0&&y>=0&&x<G.W&&y<G.H&&!G.sol[y*G.W+x]&&G.cls[y*G.W+x]<2}
function ab158Heroes(){const S=AB152.S,H=AB152H,hs=[[H.u,H.v]];try{if(ab157Co()){const I=S.I;cl155Mates(MP.rg).forEach(r=>{if(r.pr&&r.pr.hp>0)hs.push([r.pr.x-I.x0,r.pr.z-I.y0])})}}catch(_){}return hs}
// steps through the streets to the nearest hero, for every open tile (breadth first from the heroes' tiles)
function ab158Flow(){const S=AB152.S,G=S.G,W=G.W,N=W*G.H;let D=AB158.fl;if(!D||D.length!==N)D=AB158.fl=new Uint16Array(N);D.fill(65535);
  const q=AB158.q&&AB158.q.length===N?AB158.q:(AB158.q=new Int32Array(N));let h=0,t=0;
  for(const [u,v] of ab158Heroes()){let x=Math.round(u),y=Math.round(v);if(!ab158Ok(G,x,y)){const o=ab157Open(S,u,v);x=Math.round(o[0]);y=Math.round(o[1])}
    if(!ab158Ok(G,x,y))continue;const k=y*W+x;if(D[k]){D[k]=0;q[t++]=k}}
  while(h<t){const k=q[h++],x=k%W,y=(k-x)/W,d=D[k]+1;
    if(x>0&&D[k-1]>d&&ab158Ok(G,x-1,y)){D[k-1]=d;q[t++]=k-1}if(x<W-1&&D[k+1]>d&&ab158Ok(G,x+1,y)){D[k+1]=d;q[t++]=k+1}
    if(y>0&&D[k-W]>d&&ab158Ok(G,x,y-1)){D[k-W]=d;q[t++]=k-W}if(y<G.H-1&&D[k+W]>d&&ab158Ok(G,x,y+1)){D[k+W]=d;q[t++]=k+W}}
  return D}
// a spot's street distance to the nearest hero (65535: no way through)
function ab158Du(u,v){const S=AB152.S,G=S.G,D=AB158.fl;if(!D)return 65535;let x=Math.round(u),y=Math.round(v);
  if(!ab158Ok(G,x,y)){const o=ab157Open(S,u,v);x=Math.round(o[0]);y=Math.round(o[1]);if(!ab158Ok(G,x,y))return 65535}return D[y*G.W+x]}
function ab158D(a){return (a.o.lift||0)>=1?65535:ab158Du(a.u,a.v)}
var AB158N8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
// a hunter runs one step down the flow toward the heroes
function ab158Step(a,dt){const S=AB152.S,G=S.G,D=AB158.fl;if(!D)return;let x=Math.round(a.u),y=Math.round(a.v);
  if(!ab158Ok(G,x,y)){const o=ab157Open(S,a.u,a.v);x=Math.round(o[0]);y=Math.round(o[1]);if(!ab158Ok(G,x,y)){a.mv=0;return}}
  let best=D[y*G.W+x],bx=x,by=y;const H0=AB152H;
  if(best<=AB158.hold&&AB157A.nf>=AB157K.cap){a.mv=0;ab152Turn(a,Math.atan2(H0.u-a.u,H0.v-a.v),5,dt);a.t+=dt;return}   // the fight is full: wait in a ring, glaring
  for(const [dx,dy] of AB158N8){const nx=x+dx,ny=y+dy;if(!ab158Ok(G,nx,ny))continue;if(dx&&dy&&(!ab158Ok(G,x+dx,y)||!ab158Ok(G,x,y+dy)))continue;
    const d=D[ny*G.W+nx]+(dx&&dy?.45:0);if(d<best){best=d;bx=nx;by=ny}}
  const H=AB152H;if(bx===x&&by===y){const du=x-a.u,dv=y-a.v;if(Math.hypot(du,dv)>.06){bx=x;by=y}else{a.mv=0;ab152Turn(a,Math.atan2(H.u-a.u,H.v-a.v),5,dt);return}}
  const sp=ab157Guard(a)?AB158.spd.g:AB158.spd.c,du=bx-a.u,dv=by-a.v,L=Math.hypot(du,dv)||1,st=Math.min(L,sp*dt);
  a.u+=du/L*st;a.v+=dv/L*st;a.mv=sp;a.hy=0;a.t+=dt;ab152Turn(a,Math.atan2(du,dv),7,dt)}
// the bell calls the n nearest residents (by street) within r steps to hunt
function ab158Call(n,r){const C=[];for(const a of ab157Res()){if(a.dead||a.e||a.hunt||a.net1)continue;const d=ab158D(a);if(d<=r)C.push([d,a])}
  C.sort((p,q)=>p[0]-q[0]);let k=0;for(const [,a] of C){if(k>=n)break;a.hunt=1;a.halt=1;a.st='look';a.sus=0;k++}return k}
// one frame of the alarm (the host's world calls, rouses and counts; every client runs the hunters through the streets)
function ab157AlarmTick(dt,now){const S=AB152.S,H=AB152H,A=AB157A,R=ab157Res(),B=AB158.bell;H.nT=1e9;
  // the fallen: a fighting resident whose enemy died lies where it fell
  for(const a of R){if(!a.e)continue;const e=a.e;if(e.dead){const I=S.I,u=e.m.position.x-I.x0,v=e.m.position.z-I.y0;a.yaw=e.m.rotation.y;ab157Fall(a,u,v,false,1500);
      try{if(ab157Co())cl155Send(['ab','d',a.ri,cl155R1(u),cl155R1(v)])}catch(_){}}
    else if(enemies.indexOf(e)<0){a.e=null;const I=S.I,[u,v]=[e.m.position.x-I.x0,e.m.position.z-I.y0];if(!(a.o.lift>.9)){a.u=u;a.v=v;a.hunt=1;a.halt=1}}}   // left the field: hunts on foot again
  if(!AB158.fl||now-AB158.flT>350){AB158.flT=now;ab158Flow()}
  if(ab157Lead()){if(!A.called){A.called=1;A.tollT=now;ab158Call(B.n,B.r)}
    else if(now-A.tollT>B.re*1000){A.tollT=now;try{ab158Bell(1);shake(.12)}catch(_){}if(ab158Call(B.rn,B.r*1.4))say('🔔 The bell tolls again · more serpents join the hunt')}}
  A.nf=R.filter(a=>a.e||a.net1).length;
  for(const a of R)if(a.hunt&&!a.dead&&!a.e&&!a.net1)ab158Step(a,dt);
  if(ab157Lead()&&now-A.tA>250){A.tA=now;let n=R.filter(a=>a.e).length;
    // close by street (hunters that arrived, and anyone standing near): they join the fight, nearest first
    if(n<AB157K.cap){const C=R.filter(a=>!a.dead&&!a.e).map(a=>[(a.o.lift||0)>=1?(Math.hypot(H.u-a.u,H.v-a.v)<6?0:65535):ab158D(a),a]).filter(q=>q[0]<=AB158.eng).sort((p,q)=>p[0]-q[0]);
      for(const [,a] of C){if(n>=AB157K.cap)break;if(ab157Rouse(a))n++}}
    // a fighter cut off behind a wall goes back to the streets (keeping its wounds)
    for(const a of R){const e=a.e;if(!e||e.dead||e.atk)continue;const I=S.I,u=e.m.position.x-I.x0,v=e.m.position.z-I.y0;
      if(ab158Du(u,v)>AB158.drop){try{a.hpK=e.c.h/M(e.c)}catch(_){a.hpK=null}a.e=null;try{removeE(e)}catch(_){}a.u=u;a.v=v;a.yaw=e.m.rotation.y;a.hunt=1;a.halt=1}}}
  A.left=R.filter(a=>!a.dead).length;A.hunt=R.filter(a=>!a.dead&&(a.e||a.hunt||a.net1)).length;
  if(ab157Lead()&&ab157Co()&&now-A.tS>600){A.tS=now;try{cl155Send(['ab','rs',R.map(a=>a.dead?2:a.e?1:a.hunt?3:0).join('')])}catch(_){}}}
// the snakes of the plan: a fallen one does nothing; in the alarm the ones not fighting yet stand and glare at the hero
{const f=ab152ActTick;ab152ActTick=function(a,dt,now,H){if(a.hunt&&!a.dead&&!a.e){a.sus=0;a.seen=0;return null}
  if(a.dead||a.e||a.halt){a.sus=0;a.seen=0;a.mv=0;return null}
  if(AB157A.on){a.t+=dt;a.mv=0;a.sus=0;a.st='look';ab152Turn(a,Math.atan2(AB152H.u-a.u,AB152H.v-a.v),2.6,dt);a.hy*=.9;return null}
  return f.apply(this,arguments)}}
{const f=ab152ActPose;ab152ActPose=function(a,now,dt,vis){if(a.e||a.net1){a.g.visible=false;return}
  if(a.dead){const g=a.g,I=AB152.S.I;g.visible=vis&&!(a.layT>performance.now());const x=I.x0+a.u,z=I.y0+a.v;g.position.set(x,GH(x,z),z);g.rotation.y=a.yaw;return}
  return f.apply(this,arguments)}}
{const f=ab152ConeTick;ab152ConeTick=function(a){const r=f.apply(this,arguments);if(a.cone&&(a.dead||a.e||a.net1||AB157A.on))a.cone.visible=false;return r}}
{const f=ab152MarkTick;ab152MarkTick=function(a){const r=f.apply(this,arguments);if(a.mark&&(a.dead||a.e||a.net1||AB157A.on))a.mark.visible=false;return r}}
{const f=ab152ResetActor;ab152ResetActor=function(a){const r=f.apply(this,arguments);a.halt=0;return r}}
// crouch is gone while the city hunts you; the HUD with it
{const f=ab152SetCrouch;ab152SetCrouch=function(on){if(on&&AB157A.on)return;return f.apply(this,arguments)}}
{const f=ab152Hud;ab152Hud=function(){const r=f.apply(this,arguments);try{const on=AB157A.on&&ab152In();if(on){$('ab152h').classList.add('hide');$('ab152cv').style.opacity=0;if(AB152H.btn)AB152H.btn.style.display='none'}
    const el=$('ab157al');if(el){el.classList.toggle('hide',!on);if(on)el.querySelector('b').textContent=AB157A.hunt||0}}catch(_){}return r}}
(function(){const st=document.createElement('style');st.textContent=`#ab157al{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:6;pointer-events:none;padding:6px 16px;border-radius:20px;
  background:linear-gradient(180deg,rgba(60,6,4,.85),rgba(30,4,2,.7));border:1px solid rgba(255,90,60,.55);color:#ffd8c8;font:700 12.5px system-ui,sans-serif;text-shadow:0 1px 2px #000;letter-spacing:.03em}
  #ab157al.hide{display:none}#ab157al b{color:#fff;font-size:14px}body.mob #ab157al{top:8px}`;document.head.appendChild(st);
  const d=document.createElement('div');d.id='ab157al';d.className='hide';d.innerHTML='🔔 The bell tolls · hunting you: <b>0</b> · reach the city gate';document.body.appendChild(d)})();
// fighting allowed while the city is roused
{const R0=SP152.R.abeksi,m=R0.noFight;R0.noFight=()=>AB157A.on?null:m}
// ---------------- each frame ----------------
function ab157KnifeTick(dt,now){const S=AB152.S,A=AB157A,R=ab157Res();
  // the folk follow the alarm too: standing ones turn to the hero, fighting ones are hidden (their enemy shows them)
  try{if(AB157.S)for(const a of AB157.S.folk){a.hid=(a.e||a.net1)?1:0;if(AB157A.on&&!a.dead&&!a.e&&!a.hunt){a.halt=1;a.st='look';ab152Turn(a,Math.atan2(AB152H.u-a.u,AB152H.v-a.v),2.6,dt)}else if(!AB157A.on&&!a.dead&&a.halt&&a.st=='look'){a.halt=0;a.st='routine'}}}catch(_){}
  // the knife's target, marked with a red ring
  A.tg=ab157Target();if(!A.ring){const m=new THREE.Mesh(new THREE.RingGeometry(.5,.66,28).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xff2a1a,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
    m.renderOrder=5;m.userData.psNo=1;S.root.add(m);A.ring=m}
  A.ring.visible=!!A.tg;if(A.tg){const I=S.I,x=I.x0+A.tg.u,z=I.y0+A.tg.v,s=1+.08*Math.sin(now/120);A.ring.position.set(x,GH(x,z)+(A.tg.o.lift||0)+.05,z);A.ring.scale.set(s,1,s)}
  // the blood spreads under the bodies; calm watchers who see a body come to look
  for(const b of A.bodies){if(b.p&&b.p.scale.x<1&&now>b.t0)b.p.scale.setScalar(Math.min(1,b.p.scale.x+dt*.9))}
  if(!A.on&&ab157Lead()&&A.bodies.length&&now-A.tB>300){A.tB=now;for(const a of S.acts){if(a.dead||a.e||a.st!='routine')continue;
      for(const b of A.bodies){if(b.seen.has(a.id)||now<b.t0)continue;const d=Math.hypot(a.u-b.u,a.v-b.v);if(d>11)continue;if(ab152Sees(a,b.u,b.v,true,1)>0){b.seen.add(a.id);
          a.sus=Math.max(a.sus,AB152V.go+5);a.st='investigate';a.tgt=[b.u,b.v];a.inv=0;a.unseen=0;if(Math.hypot(a.u-AB152H.u,a.v-AB152H.v)<30)say('👁 A snake has found a body and comes to look…');break}}}}
  if(A.on)ab157AlarmTick(dt,now)}
{const f=ab152WorldTick;ab152WorldTick=function(dt,now){const r=f.apply(this,arguments);try{ab157KnifeTick(dt,now)}catch(e){if(!AB157.err++)console.error('v157 knife',e)}return r}}
// leaving the city (the drain, the breach, the gate, a death elsewhere) ends the alarm
{const f=ab152Tick;ab152Tick=function(dt,now){if(AB157A.on&&!ab152In())try{ab157Calm(false)}catch(_){}return f.apply(this,arguments)}}
// a fresh start (entering, a checkpoint restart, a load, a death in the alarm): everything calm, every resident alive
{const f=ab152Restart;ab152Restart=function(){try{if(AB152.S)ab157Calm(true)}catch(e){console.warn('v157 calm',e)}return f.apply(this,arguments)}}
// ---------------- prompts: the knife, the gate ----------------
{const f=worldPrompt;worldPrompt=function(){try{if(ab152In()&&AB152.S&&!AB152H.cau){const H=AB152H;
    if(AB157A.on&&Math.hypot(H.u-AB157K.gate[0],H.v-AB157K.gate[1])<AB157K.gateR)return {label:'F · Escape through the city gate ('+INSL[6].n+')',fn:()=>ab152Finish('gate')};   // v158: open the moment the bell tolls
    if(AB157A.tg&&!AB157A.kill){const a=AB157A.tg;return {label:'F · Assassinate',fn:()=>{const t=ab157Target();if(t===a)ab157Assassinate(a)}}}}}catch(_){}return f.apply(this,arguments)}}
// ---------------- the tracker ----------------
{const f=SP152.trk.abeksi;SP152.trk.abeksi=I=>{if(I&&I.sp==='abeksi'&&AB157A.on){const n=AB157A.left;
    return {name:'The Serpent City',lines:[['🔔 The alarm bell tolls'],['Hunting you',AB157A.hunt||0],['Fight your way to the city gate (Gate Yard)'],['Or flee through the drain']]}}return f(I)}}
// ---------------- XP and loot from the city's residents: kept low ----------------
// (a partner's copy of a resident, mirrored from the host, has no tag: any serpent enemy inside the city counts, as a guard)
function ab157Kind(e){if(!e)return null;if(e.ab157)return e.ab157.g?'g':'c';try{if(e.c&&/^naga[was]$/.test(e.c.en)&&ab152In())return 'g'}catch(_){}return null}
{const f=gw150X;gw150X=function(e){const k=f.apply(this,arguments),t=ab157Kind(e);return t?k*AB157K.xp[t]:k}}
{const f=lootE;lootE=function(e){const t=ab157Kind(e);if(t&&Math.random()>=AB157K.loot[t])return;return f.apply(this,arguments)}}
// ---------------- dying while the city hunts you: back to the last checkpoint, the city calm again ----------------
function ab157Rise(){hero.hp=heroMax();hero.mp=mpMax();try{party.forEach(c=>c.h=M(c))}catch(_){}ab152Restart(false);try{say('✦ The city is calm again · Checkpoint · '+ab152Spot(AB152Q.cp).name)}catch(_){}ui()}
{const f=down_base;down_base=function(){if(!(ab152In()&&AB152.S&&AB157A.on))return f.apply(this,arguments);
  try{if(ab157Co())cl155Send(['ab','calm'])}catch(_){}
  if(typeof awDie=='function'&&typeof AWD!='undefined'){if(AWD.dead)return;awDie(()=>ab157Rise())}else ab157Rise()}}
// ---------------- co-op ----------------
{const f=ab155On;ab155On=function(q,peer){const k=q[1],S=AB152.S;
  if(['x','d','rs','calm'].indexOf(k)<0)return f.apply(this,arguments);
  if(!ab152In()||!S)return;const R=ab157Res();
  if(k==='x'){const a=R[q[2]|0];if(!a||a.dead||!isFinite(+q[3])||!isFinite(+q[4]))return;a.u=+q[3];a.v=+q[4];ab157Assassinate(a,true);
    if(ab157Lead()&&!AB157A.on){const hu=+q[5],hv=+q[6];setTimeout(()=>{try{const r=MP.rh[peer],cr=!!(r&&r.pr&&r.pr.cr),w=ab157Witness(a,isFinite(hu)?hu:a.u,isFinite(hv)?hv:a.v,cr);
        if(w&&!AB152H.cau){w.cBy=peer;say('👁 '+mpEsc(mpName(peer))+'’s kill was seen!');ab152Caught(w)}}catch(_){}},340)}}
  else if(k==='d'){const a=R[q[2]|0];if(!a||a.dead||!isFinite(+q[3])||!isFinite(+q[4]))return;ab157Fall(a,+q[3],+q[4],false,1500)}
  else if(k==='rs'&&typeof q[2]==='string'&&peer===MP.host&&!ab157Lead()){if(!AB157A.on){if(performance.now()-(AB157A.calmT||-1e9)<3000)return;ab157Alarm()}const s=q[2];for(let i=0;i<R.length&&i<s.length;i++){const a=R[i],c=s[i];
      if(c==='2'&&!a.dead)ab157Fall(a,null,null,false,0);a.net1=c==='1'?1:0;if(c==='3'&&!a.dead&&!a.hunt){a.hunt=1;a.halt=1}else if(c!=='3'&&a.hunt&&!a.e)a.hunt=0}}
  else if(k==='calm'){if(AB157A.on){say('👥 '+mpEsc(mpName(peer))+' fell — the whole party wakes at the checkpoint, the city calm again.');ab152Restart(false)}}}}
