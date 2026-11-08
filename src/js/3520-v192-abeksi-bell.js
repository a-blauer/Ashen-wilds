// ================= v192 Abeksi: the bell-ringer; every Abeksi has eyes (owner, Nov 2 2026) =================
// Owner: "For the Abeksi city — when someone spots you have them attempt to ring a bell (takes 3 seconds after spotted)." · "If an
// Abeksi is killed before he rang the bell the whole town isn't alerted." · "Make all Abeksi in the city have a vision cone and be
// able to spot you."
//  * Spotted = a bell-ringer, not the alarm (ab152Caught wrapper → ab192Start): the Abeksi who saw you pulls out a hand bell and
//    shakes it overhead (pose AB152P.ring192, a bronze bell in its left hand, a quickening jingle ab192Tink), a timer over its head
//    fills (ab192Tex, drawn through walls), the stealth HUD counts down ("🔔 Alarm in 2.1 s!") and the log says what to do. You are
//    not frozen. After AB192.T (3) s of game time (+AB192.lag for a ringer that saw a co-op partner) the ring is done: the city's alarm (ab157Alarm: the great bell, the hunt, the
//    bell's elite guards of v164).
//  * Kill it first and the city stays asleep: F · "Silence the bell-ringer!" within AB192.reach tiles (any side: it faces you; the
//    knife of 3193, ab157Assassinate), a swing in reach does the same; a raised ringer (roof, battlement) takes a thrown knife within
//    AB192.thr tiles. Anyone who sees that kill starts ringing in turn (ab157Witness). Several can ring at once; each one counts.
//  * Every Abeksi has eyes: the townsfolk of 3191 (AB157.S.folk, 128) get view cones like the plan's snakes (ab152ConeMake), "?"
//    marks and sight (ab152Sees, kind 'folk': AB152V.rng.folk / half.folk, shorter than a guard's). Suspicion rises while one sees
//    you; from AB152V.look its head follows you; at 100 it rings. Folk keep their routines and seats (ab192FolkTick).
//  * Co-op: the region's host runs every pair of eyes and every ring. New message kinds (old partners ignore them and still get the
//    alarm from the host's ['ab','rs']): ['ab','rg',ri,peer,yaw×100] a ring starts (peer: who was seen), ['ab','rx',ri] it stopped,
//    ['ab','rd',ri,peer] it rang (the alarm), ['ab','sl',ri] a partner silences one (the host stops it at once; the kill follows as
//    3193's ['ab','x',...]), ['ab','fs',[ri,u,v,yaw,hy,sus,mv,pi, ...]] the host's townsfolk near each partner, ~5 a second (the
//    partner's folk follow them, so a partner sees the cones the host's eyes really have).
var AB192={T:3,lag:.3,reach:2.6,thr:9,fk:.6,R:[],tF:0,n:{st:0,rg:0,mk:0,sil:0,done:0,stop:0},log:[],tx:null,M:null,err:0,v:192};
AB152V.rng.folk=5;AB152V.half.folk=.65;
{const f=ab152Kind;ab152Kind=function(a){return a&&a.folk?'folk':f.apply(this,arguments)}}
function ab192Log(k,a){const L=AB192.log;L.push([k,a&&a.id,Math.round(performance.now())]);if(L.length>30)L.shift()}
// ---------------- the hand bell, the ringing pose, the jingle, the timer ----------------
function ab192Mats(){return AB192.M||(AB192.M={br:new THREE.MeshStandardMaterial({color:0xb48a3a,roughness:.3,metalness:.82,flatShading:true,side:THREE.DoubleSide}),
  wd:new THREE.MeshStandardMaterial({color:0x4e3420,roughness:.85,flatShading:true}),st:new THREE.MeshStandardMaterial({color:0xc8ccd2,roughness:.25,metalness:.85}),
  hd:new THREE.CylinderGeometry(.016,.02,.11,6).translate(0,-.03,0),cap:new THREE.SphereGeometry(.036,8,3,0,Math.PI*2,0,Math.PI/2).translate(0,-.085,0),
  body:new THREE.CylinderGeometry(.036,.092,.13,9,1,true).translate(0,-.15,0),lip:new THREE.TorusGeometry(.09,.011,4,12).rotateX(Math.PI/2).translate(0,-.215,0),
  cl:new THREE.SphereGeometry(.024,6,4).translate(0,-.205,0),kn:new THREE.BoxGeometry(.035,.035,.42)})}
function ab192Bell(a,on){try{if(!on){const b=a.b192;if(b&&b.parent)b.parent.remove(b);return}
  if(a.b192&&a.b192.parent)return;const bn=a.h&&a.h.bones&&a.h.bones.aL2;if(!bn)return;let g=a.b192;
  if(!g){const M=ab192Mats();g=new THREE.Group();g.name='ab192bell';[[M.hd,M.wd],[M.cap,M.br],[M.body,M.br],[M.lip,M.br],[M.cl,M.wd]].forEach(([q,m])=>{const o=new THREE.Mesh(q,m);o.castShadow=false;g.add(o)});
    g.position.set(0,-.06,.02);g.rotation.x=2.5;a.b192=g}   // turned back against the raised arm (ring192: shoulder + elbow ≈ −2.55) so it hangs mouth down
  bn.add(g)}catch(_){}}
// the bell held high and shaken hard, the other hand pointing at you (an overlay on the arms and head; legs keep 'caught')
AB152P.ring192=function(P,t,S){const s=Math.sin(t*24),w=Math.sin(t*3.1);
  P('aL0',-2.2+.12*s,0,-.32);P('aL1',-.35+.1*s);P('aL2',.55*s,0,.25*s);P('aR0',-1.35,0,.22+.05*w);P('aR1',-.25);P('head',-.18,(S.ht||0)*.3,.06*s)};
function ab192Tink(v,p){if(!(v>.02))return;let a=null;try{a=AUD}catch(_){}if(!a||a.state!='running'||SET.sfx===false)return;const t=a.currentTime,out=a.out;
  try{const f0=1250*(1+(Math.random()-.5)*.04)*(1+.06*p);[[1,.5,.42],[2.32,.3,.3],[4.25,.16,.2],[6.63,.08,.12]].forEach(([r,amp,dec])=>{const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f0*r;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(amp*.14*v,t+.004);g.gain.exponentialRampToValueAtTime(.0002,t+dec);o.connect(g);g.connect(out);o.start(t);o.stop(t+dec+.05)})}catch(_){}}
// a bell in a ring that fills as the ringer winds up (17 steps, baked once)
function ab192Tex(k){const T=AB192.tx||(AB192.tx=[]);if(T[k])return T[k];const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),P2=Math.PI*2;
  x.beginPath();x.arc(64,64,58,0,P2);x.fillStyle='rgba(24,6,4,.8)';x.fill();x.lineWidth=11;x.strokeStyle='rgba(255,255,255,.2)';x.beginPath();x.arc(64,64,50,0,P2);x.stroke();
  if(k>0){x.strokeStyle=k>=12?'#ff3020':k>=7?'#ff8a20':'#ffd040';x.lineCap='round';x.beginPath();x.arc(64,64,50,-Math.PI/2,-Math.PI/2+P2*k/16);x.stroke()}
  x.fillStyle='#ffd27a';x.strokeStyle='#1a0a04';x.lineWidth=3;x.beginPath();x.moveTo(64,30);x.bezierCurveTo(48,30,46,50,44,66);x.lineTo(37,80);x.lineTo(91,80);x.lineTo(84,66);x.bezierCurveTo(82,50,80,30,64,30);x.closePath();x.fill();x.stroke();
  x.beginPath();x.arc(64,87,7,0,P2);x.fill();x.stroke();x.fillRect(60,23,8,8);x.strokeRect(60,23,8,8);
  return T[k]=new THREE.CanvasTexture(c)}
// ---------------- a ring: start, stop, done ----------------
function ab192HeroAt(by){const H=AB152H;if(!by||by===MP.me)return [H.u,H.v];try{const I=AB152.S.I,r=MP.rh[by];if(r&&r.pr)return [r.pr.x-I.x0,r.pr.z-I.y0]}catch(_){}return [H.u,H.v]}
function ab192Start(a,by,remote,yaw){if(!a||a.r192||a.dead||a.e||a.net1||!AB152.S)return false;ab157Res();
  if(!remote&&(!a.seen||!a.last))a.last=ab192HeroAt(by);
  a.r192={t:0,by:by||'',nT:0,rem:!!remote};a.st='caught';a.sus=100;a.mv=0;if(a.folk&&isFinite(yaw))a.yaw=yaw;
  ab192Bell(a,true);AB192.R.push(a);AB192.n[remote?'rg':'st']++;ab192Log(remote?'rg':'st',a);
  const me=!by||by===MP.me,who=me?'you':'<b>'+mpEsc(mpName(by))+'</b>',raised=(a.o.lift||0)>=1;
  say('🔔 <b>An Abeksi '+(ab157Guard(a)?'guard ':'')+'has seen '+who+' and grabs its alarm bell!</b> '+(raised?'Throw a knife at it':'Kill it')+' within '+AB192.T+' s — or the whole city wakes.');
  try{if(me){svSnd('hiss',1,1.1);flash('rgba(255,140,30,.45)');shake(.12)}}catch(_){}
  if(!remote&&ab157Co()&&ab157Lead())try{cl155Send(['ab','rg',a.ri,by||MP.me,Math.round(a.yaw*100)])}catch(_){}
  return true}
function ab192Stop(a,why,quiet){if(!a||!a.r192)return;const rem=a.r192.rem;a.r192=null;ab192Bell(a,false);if(a.m192)a.m192.visible=false;
  const i=AB192.R.indexOf(a);if(i>=0)AB192.R.splice(i,1);ab192Log('x:'+why,a);
  if(why!='done'&&why!='clear'&&why!='reset'){AB192.n.stop++;if(!a.dead){a.st=a.folk?'routine':'look';a.sus=a.folk?AB152V.look+5:AB152V.go+5}}
  if(!quiet&&!rem&&ab157Co()&&ab157Lead())try{cl155Send(['ab','rx',a.ri])}catch(_){}}
function ab192Clear(){AB192.R.slice().forEach(a=>ab192Stop(a,'clear',true));AB192.R.length=0}
// the host's ringer finished: the city's alarm, for the whole party
function ab192Rang(a){const by=a.r192&&a.r192.by;AB192.n.done++;ab192Log('done',a);ab192Clear();
  try{if(ab157Co())cl155Send(['ab','rd',a.ri,by||''])}catch(_){}
  ab157Alarm()}
// every frame in the city (every client): wind up, jingle, the timer over the head; the host's ring ends in the alarm
function ab192Tick(dt,now){const S=AB152.S,I=S.I,lead=ab157Lead();
  for(const a of AB192.R.slice()){const r=a.r192;if(!r){const i=AB192.R.indexOf(a);if(i>=0)AB192.R.splice(i,1);continue}
    if(a.dead||a.e||a.net1||AB157A.on||(!r.rem&&a.halt)){ab192Stop(a,a.dead?'dead':'stop');continue}
    r.t+=dt;if(r.rem)r.t=Math.min(r.t,AB192.T+5);
    if(!r.rem&&lead&&r.t>=AB192.T+(r.by&&r.by!==MP.me&&ab157Co()?AB192.lag:0)){ab192Rang(a);return}   // a partner's timer starts a moment later (the message): they get that moment
    if(r.t>AB192.T+4){ab192Stop(a,'lost',true);continue}   // the host's word never came (or the host left): drop it
    const p=Math.min(1,r.t/AB192.T),x=I.x0+a.u,z=I.y0+a.v,y=GH(x,z)+(a.o.lift||0);
    r.nT-=dt;if(r.nT<=0){r.nT=.3-.17*p;const d=Math.hypot(pl.position.x-x,pl.position.z-z);ab192Tink(Math.max(0,1-d/34)*(.45+.55*p),p)}
    let m=a.m192;if(!m){m=a.m192=new THREE.Sprite(new THREE.SpriteMaterial({map:ab192Tex(0),transparent:true,depthTest:false,depthWrite:false,fog:false}));m.renderOrder=40;m.userData.psNo=1;S.root.add(m)}
    const vis=(a.folk?!!a.on:!!a.g.visible)&&!a.dead;m.visible=vis;
    if(vis){m.material.map=ab192Tex(Math.min(16,Math.floor(p*16)));const s=.95+.1*Math.abs(Math.sin(now/60));m.scale.set(s,s,1);m.position.set(x,y+2.85,z);AB192.n.mk++}}}
// ---------------- silencing a ringer ----------------
function ab192Near(melee){const H=AB152H,S=AB152.S;let best=null,bd=1e9;
  for(const a of AB192.R){if(!a.r192||a.dead||a.e||a.net1||a.halt)continue;const raised=(a.o.lift||0)>=1,d=Math.hypot(a.u-H.u,a.v-H.v),R=raised?(melee?0:AB192.thr):AB192.reach;
    if(d>R||d>=bd)continue;if(d>1.2&&!ab192LOS(S.G,a.u,a.v,H.u,H.v,false,raised))continue;best=a;bd=d}
  return best}
function ab192Silence(a){if(!a||a.dead||!a.r192)return;const S=AB152.S,H=AB152H,I=S.I,lift=a.o.lift||0,d=Math.hypot(a.u-H.u,a.v-H.v);
  ab192Stop(a,'kill');AB192.n.sil++;
  try{if(ab157Co()&&!ab157Lead())cl155Send(['ab','sl',a.ri])}catch(_){}   // the host stops its ring at once (the kill follows as 'x')
  say('🔕 <b>The bell-ringer falls</b> before the alarm could sound.');
  if(lift<1&&d<=AB192.reach+.4){const y0=a.yaw,h0=a.hy;a.yaw=Math.atan2(a.u-H.u,a.v-H.v);a.hy=0;ab157Assassinate(a);a.yaw=y0;a.hy=h0;return}   // the lunge lands on the hero's side (3193 aims it at the back)
  // a thrown knife (a ringer on a roof or a battlement)
  a.halt=1;a.st='routine';a.sus=0;a.k192=1;const P=pl.position,x=I.x0+a.u,z=I.y0+a.v,y1=GH(x,z)+lift+1.25,x0=P.x,z0=P.z,y0=P.y+1.3;
  try{pl.rotation.y=Math.atan2(x-x0,z-z0);svSnd('whoosh',.4,1.6);const M=ab192Mats(),k=new THREE.Mesh(M.kn,M.st);k.userData.psNo=1;scene.add(k);k.position.set(x0,y0,z0);k.lookAt(x,y1,z);
    tw(240,q=>{k.position.set(x0+(x-x0)*q,y0+(y1-y0)*q+Math.sin(q*Math.PI)*.4,z0+(z-z0)*q)},()=>{if(k.parent)k.parent.remove(k)})}catch(_){}
  setTimeout(()=>{if(a.dead)return;ab157Fall(a,null,null,true);const b=AB157A.bodies[AB157A.bodies.length-1];if(b&&b.a===a&&b.p)b.p.position.y+=lift;
    try{burst(new THREE.Vector3(x,y1-.1,z),0x5a0808,18,1.4,1.2,.5);svSnd('crack',.3,.6)}catch(_){}
    try{if(ab157Co())cl155Send(['ab','x',a.ri,cl155R1(a.u),cl155R1(a.v),cl155R1(H.u),cl155R1(H.v)])}catch(_){}
    if(ab157Lead()){const w=ab157Witness(a,H.u,H.v,!!H.cr);if(w){say('👁 <b>'+(w.folk?'Someone':'A guard')+' saw the kill!</b>');w.yaw=Math.atan2(H.u-w.u,H.v-w.v);w.last=[H.u,H.v];ab152Caught(w)}}},260)}
// ---------------- the townsfolk's eyes ----------------
// sight in the cone only (no all-round ring: folk are busy), AB192.fk of a guard's speed; a townsperson on a roof sees over its own
// roof and over low cover
function ab192LOS(G,au,av,bu,bv,cr,up){if(!up)return ab152LOS(G,au,av,bu,bv,cr);const L=Math.hypot(bu-au,bv-av);if(L<.8)return true;const n=Math.ceil(L/.3);let roof=1;
  for(let i=1;i<n;i++){const t=i/n,c=ab152Cls(G,au+(bu-au)*t,av+(bv-av)*t);if(roof){if(c>=2)continue;roof=0}if((1-t)*L<.45)continue;if(c>=2)return false}return true}
function ab192Sees(a,hu,hv,cr,lit){const du=hu-a.u,dv=hv-a.v,d=Math.hypot(du,dv);let R=AB152V.rng.folk*(cr?AB152V.crouchK:1);
  R*=1-(1-AB152V.darkK)*(1-Math.min(1,lit/.6));if((a.sus||0)>=AB152V.look)R*=1.25;if(d>R)return 0;
  let df=Math.atan2(du,dv)-(a.yaw+(a.hy||0));df=Math.atan2(Math.sin(df),Math.cos(df));if(Math.abs(df)>AB152V.half.folk)return 0;
  if(!ab192LOS(AB152.S.G,a.u,a.v,hu,hv,cr,(a.o.lift||0)>=1))return 0;return (AB152V.rate[0]+AB152V.rate[1]*(1-d/R))*AB192.fk}
// the cone of a townsperson on a roof: from its feet up there, across the roof, down onto the street (3153's fan, not cut by its roof)
function ab192ConeUp(a,I,G,cr){const c=a.cone,N=AB152CN.N,lift=a.o.lift||0,half=AB152V.half.folk,fy=a.yaw+(a.hy||0),p=c.geometry.attributes.position,x0=I.x0+a.u,z0=I.y0+a.v;
  const R=AB152V.rng.folk*(cr?AB152V.crouchK:1)*(a.st!='routine'||(a.sus||0)>=AB152V.look?1.25:1);p.setXYZ(0,x0,GH(x0,z0)+lift+.06,z0);
  for(let i=0;i<=N;i++){const an=fy-half+2*half*i/N,su=Math.sin(an),sv=Math.cos(an);let L=R,roof=1;
    for(let s=.5;s<=R;s+=.5){const c2=ab152Cls(G,a.u+su*s,a.v+sv*s);if(roof){if(c2>=2)continue;roof=0}if(c2>=2){L=s-.25;break}}
    const x=x0+su*L,z=z0+sv*L;p.setXYZ(i+1,x,GH(x,z)+(roof?lift:0)+.06,z)}
  p.needsUpdate=true;const U=c.material.uniforms;U.col.value.setHex(a.st=='caught'?0xff3020:a.sus>=AB152V.go?0xff8a2a:a.sus>=AB152V.look?0xffd040:0xfff0a0);
  U.op.value=a.st=='caught'?.42:a.sus>8?.26+.16*a.sus/100:.2}
function ab192FolkTick(dt,now){const Q=AB157.S,S=AB152.S;if(!Q||!S)return;ab157Res();const H=AB152H,I=S.I,G=S.G,co=ab157Co(),lead=ab157Lead(),al=AB157A.on,pn=performance.now();
  const L=(co&&lead&&AB155.hs)||[H],mates=co&&lead?L.filter(h=>h&&h.peer):[],near=a=>mates.some(h=>Math.abs(h.u-a.u)<AB157V.R&&Math.abs(h.v-a.v)<AB157V.R);let mx=0;
  for(const a of Q.folk){const off=a.dead||a.e||a.net1||a.hid||al;
    // the host keeps the folk near a partner going (3191 only runs them near its own hero)
    if(!off&&!a.on&&!a.halt&&mates.length&&near(a)){a.t+=dt;ab152Routine(a,dt)}
    const fol=co&&!lead&&a.fn192&&pn-a.fn192.t<1500;
    if(!fol)a.hy+=((a.ht||0)*.6-(a.hy||0))*Math.min(1,dt*4);   // the eyes follow the head, as 3153 does for the plan's snakes
    if(off){if(!a.r192)a.sus=0}
    else if(lead){if(!a.r192&&!a.halt){let rate=0,best=null;
        for(const h of L){const rr=AB152V.rng.folk*1.25+1;if(!h||!h.live||Math.abs(h.u-a.u)>rr||Math.abs(h.v-a.v)>rr)continue;   // v207: reach follows the folk's sight (doubled in 3780)
        const r=ab192Sees(a,h.u,h.v,h.cr,h.lit);if(r>rate){rate=r;best=h}}
        if(rate>0){a.sus=Math.min(100,(a.sus||0)+rate*dt);a.unseen=0;a.last=[best.u,best.v]}else{a.unseen=(a.unseen||0)+dt;if(a.unseen>AB152V.hold)a.sus=Math.max(0,(a.sus||0)-AB152V.decay*dt)}
        if(a.sus>=AB152V.catch&&best){a.cBy=best.peer||MP.me;ab152Caught(a)}}}
    else if(!fol&&!a.r192&&a.sus>0)a.sus=Math.max(0,a.sus-AB152V.decay*dt);   // a partner: the host's numbers stopped coming
    if(a.sus>mx&&!a.r192)mx=a.sus;
    const d=Math.hypot(a.u-H.u,a.v-H.v),show=!!a.on&&!off&&d<24;
    if(a.cone){a.cone.visible=show;if(show){if((a.o.lift||0)>=1)ab192ConeUp(a,I,G,!!H.cr);else ab152ConeTick(a,I,G,!!H.cr)}}
    if(a.on&&!off)ab152MarkTick(a,now);else if(a.mark)a.mark.visible=false}
  if(!al&&!H.cau)H.maxS=Math.max(H.maxS||0,mx);
  // the host: its townsfolk near each partner, ~5 a second
  if(co&&lead&&!al&&mates.length&&pn-AB192.tF>180){AB192.tF=pn;let F=[],n=0;
    for(const a of Q.folk){if(a.dead||a.e||a.net1||a.hid||!mates.some(h=>Math.abs(h.u-a.u)<26&&Math.abs(h.v-a.v)<26))continue;
      F.push(a.ri,cl155R1(a.u),cl155R1(a.v),cl155R2(a.yaw),cl155R2(a.hy||0),Math.round(a.sus||0),cl155R1(a.mv||0),a.pi|0);if(++n>=40){cl155Send(['ab','fs',F]);F=[];n=0}}
    if(F.length)cl155Send(['ab','fs',F])}}
// a townsperson's routine: still while ringing, its head after you while suspicious; a partner's folk follow the host's
{const f=ab152Routine;ab152Routine=function(a,dt){if(!a||!a.folk)return f.apply(this,arguments);
  if(a.r192){a.mv=0;if(!a.r192.rem&&a.last)ab152Turn(a,Math.atan2(a.last[0]-a.u,a.last[1]-a.v),3,dt);a.ht=(a.ht||0)*.9;return}
  const N=a.fn192;if(N&&!ab157Lead()&&performance.now()-N.t<1500){const k=Math.min(1,dt*8);
    if(Math.hypot(N.u-a.u,N.v-a.v)>4){a.u=N.u;a.v=N.v}else{a.u+=(N.u-a.u)*k;a.v+=(N.v-a.v)*k}
    let dy=N.yaw-a.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));a.yaw+=dy*k;a.hy=(a.hy||0)+(N.hy-(a.hy||0))*k;a.ht=a.hy/.6;a.mv=N.mv;if(a.path&&N.pi>=0&&N.pi<a.path.length)a.pi=N.pi;return}
  const r=f.apply(this,arguments);
  if(a.sus>=AB152V.look&&a.last){let d=Math.atan2(a.last[0]-a.u,a.last[1]-a.v)-a.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));a.ht=Math.max(-1.3,Math.min(1.3,d))/.6}
  return r}}
// ---------------- hooks ----------------
// spotted: a ringer instead of the alarm (an older host's 'caught' message still means its alarm)
{const f=ab152Caught;ab152Caught=function(a){if(AB157A.on)return;
  if(AB155.rx||!a||!ab152In()||!AB152.S)return f.apply(this,arguments);
  if(AB157A.calmT&&performance.now()-AB157A.calmT<AB158.grace*1000)return;   // 3193's grace after the city calms
  if(!ab157Lead())return;const by=a.cBy||MP.me;a.cBy=null;ab192Start(a,by,false)}}
// the host's ringer (a plan snake) stands and rings, facing the hero it saw
{const f=ab152ActTick;ab152ActTick=function(a,dt,now,H){const r=a.r192;
  if(r&&!r.rem&&!a.dead&&!a.e&&!a.halt&&!AB157A.on){a.t+=dt;a.mv=0;a.sus=100;a.seen=1;a.st='caught';
    if(a.last&&!a.o.sweep)ab152Turn(a,Math.atan2(a.last[0]-a.u,a.last[1]-a.v),2.6,dt);a.ht=(a.ht||0)*.9;a.hy*=.9;return null}
  return f.apply(this,arguments)}}
{const f=ab152ActPose;ab152ActPose=function(a,now,dt,vis){const r=f.apply(this,arguments);try{
  if(a.r192&&!a.dead&&!a.e&&!a.net1&&a.g.visible)ab152Apply(a.h,'ring192',performance.now()/1000,a,true);
  else if(a.dead&&a.k192)a.g.position.y+=a.o.lift||0}catch(_){}return r}}   // a ringer knifed on a roof lies on the roof
// townsfolk get view cones like the plan's snakes
{const f=ab152Build;ab152Build=function(){const S=f.apply(this,arguments);try{if(S&&!S.v192&&AB157.S){S.v192=1;
  AB157.S.folk.forEach(a=>{if(!a.cone){a.cone=ab152ConeMake();a.cone.visible=false;S.root.add(a.cone)}})}}catch(e){console.error('v192 cones',e)}return S}}
{const f=ab152WorldTick;ab152WorldTick=function(dt,now){const r=f.apply(this,arguments);try{ab192FolkTick(dt,now);ab192Tick(dt,now)}catch(e){if(!AB192.err++)console.error('v192 bell',e)}return r}}
{const f=ab152Tick;ab152Tick=function(dt,now){if(AB192.R.length&&!ab152In())ab192Clear();return f.apply(this,arguments)}}
{const f=ab157Alarm;ab157Alarm=function(){ab192Clear();return f.apply(this,arguments)}}
{const f=ab157Calm;ab157Calm=function(){ab192Clear();return f.apply(this,arguments)}}
{const f=ab152ResetActor;ab152ResetActor=function(a){ab192Stop(a,'reset',true);a.fn192=null;a.cBy=null;a.last=null;a.k192=0;return f.apply(this,arguments)}}
{const f=ab157Unfall;ab157Unfall=function(a){a.k192=0;return f.apply(this,arguments)}}
// F and a swing silence the ringer in reach
{const f=worldPrompt;worldPrompt=function(){try{if(ab152In()&&AB152.S&&!AB157A.on&&!AB157A.kill&&!AB152H.cau&&AB192.R.length){const a=ab192Near(false);
    if(a){const far=(a.o.lift||0)>=1;return {label:far?'F · Throw a knife at the bell-ringer!':'F · Silence the bell-ringer!',fn:()=>{if(a.r192&&!a.dead)ab192Silence(a)}}}}}catch(_){}return f.apply(this,arguments)}}
{const f=swing;swing=function(){try{if(ab152In()&&AB152.S&&!AB157A.on&&!AB157A.kill&&!AB152H.cau&&AB192.R.length){const a=ab192Near(true);if(a){ab192Silence(a);return}}}catch(_){}return f.apply(this,arguments)}}
// the stealth HUD counts the ring down
{const f=ab152Hud;ab152Hud=function(){const r=f.apply(this,arguments);try{const el=$('ab152h');if(!el||AB157A.on||!ab152In()||el.classList.contains('hide'))return r;
  let a=null;for(const q of AB192.R)if(q.r192&&!q.dead&&(!a||q.r192.t>a.r192.t))a=q;if(!a)return r;const left=Math.max(0,AB192.T-a.r192.t),e=el.querySelector('.eye');
  e.style.setProperty('--ec','#ff3a20');e.style.setProperty('--eg','16px');el.querySelector('.s').textContent='🔔 Alarm in '+left.toFixed(1)+' s!';
  el.querySelector('.c').textContent=(a.o.lift||0)>=1?'Throw a knife at the bell-ringer (F)':'Kill the bell-ringer to stop it (F)';
  el.querySelector('.bar i').style.width=Math.min(100,a.r192.t/AB192.T*100)+'%';$('ab152cv').style.opacity=.85}catch(_){}return r}}
// ---------------- co-op ----------------
{const f=ab155On;ab155On=function(q,peer){const k=q[1];if(['rg','rx','rd','sl','fs'].indexOf(k)<0)return f.apply(this,arguments);
  if(!ab152In()||!AB152.S)return;const R=ab157Res(),host=peer===MP.host&&!ab157Lead();
  if(k==='rg'&&host){const a=R[q[2]|0];if(!a||a.dead||AB157A.on)return;const yw=+q[4]/100;ab192Start(a,String(q[3]||''),true,isFinite(yw)?yw:undefined)}
  else if(k==='rx'&&host){const a=R[q[2]|0];if(a&&a.r192)ab192Stop(a,'host',true)}
  else if(k==='rd'&&host){AB192.n.done++;ab192Log('rd',R[q[2]|0]);ab192Clear();if(!AB157A.on&&performance.now()-(AB157A.calmT||-1e9)>1000)ab157Alarm()}
  else if(k==='sl'&&ab157Lead()){const a=R[q[2]|0];if(a&&a.r192){ab192Stop(a,'sl');a.halt=1;if((a.o.lift||0)>=1)a.k192=1;setTimeout(()=>{if(!a.dead)a.halt=0},2500)}}
  else if(k==='fs'&&host&&Array.isArray(q[2])){const F=q[2],t=performance.now();for(let j=0;j+7<F.length;j+=8){const a=R[F[j]|0];if(!a||!a.folk||a.dead)continue;
      const u=+F[j+1],v=+F[j+2],yw=+F[j+3],hy=+F[j+4];if(!isFinite(u)||!isFinite(v)||!isFinite(yw)||!isFinite(hy))continue;
      const N=a.fn192||(a.fn192={});N.u=u;N.v=v;N.yaw=yw;N.hy=hy;N.mv=+F[j+6]||0;N.pi=F[j+7]|0;N.t=t;if(!a.r192)a.sus=Math.max(0,Math.min(100,+F[j+5]||0))}}}}
