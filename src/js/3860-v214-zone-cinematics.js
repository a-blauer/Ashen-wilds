// ================= v214: arrival cinematics for Burningeye Summit, Searing Sands, The Dirge and The Citadel (names zc214*) =================
// Owner (Nov 10 2026): "make intro cinematics for our other zones (ice, sand, graveyard, citadel) and make them similar to how we have
// our kindlelight and plains intro cinematics."
// Built like Hillside Crest's (3810): the first time a hero arrives in one of these zones the main loop waits (IC151.on) and the
// intro's voice speaks over a tour of the zone drawn in the real world. Every frame is a pure function of t (zc214Seek), so tests
// render it frame by frame (zc214Cap). One engine, one plan per zone (ZC214.Z[z]):
//   0  the hero at the entrance of the zone, the camera rises over the land (all four)
//   1–4 the zone's three field instances: their main quest set pieces (built as the game builds them, shown for the shot, put back),
//      stand-in creatures of each instance (models only, no AI, removed after), no words on screen but the voice
//   5  the Sovereign's Den: the den's own Sovereign (posed, then put back) wakes and roars its own intro move, a hard cut to black,
//      the game fades back in and the zone's title card shows
// Burningeye Summit: the Frozen Maw's mouth · the Frozen Gate · the Mountain Drill · the storm-born of III · the Rime Wraith.
// Searing Sands: the buried temple · the Last Warden's court · the salt columns · the Sandskimmer and the desert · Ssith'ra.
// The Dirge: the weeping angel · the graves · the quay of the Black Channel · the five prisms and the Reliquary · the Bloated One.
// The Citadel: the Great Gate's blood seal · Vharog asleep before the rampart gate · the Sun Court and the Eclipse Door · III's court
// creatures · Lord Vaelric.
// Seen once per character and zone (saved as x2.zc214, a bit per zone); older saves that already went past the zone's first
// instance or into its quest count as seen. Skip: the button, Esc, Enter or Space. Off when the intro is off (SET.intro 0) and
// under test automation unless window.KQ_ZC214. Co-op: every player sees it on their own first arrival (local, nothing relayed,
// like 3800 / 3810); while it plays that player's game waits and presence keeps going out.
var ZC214={run:false,S:null,seen:0,raw:null,len:37.4,skipT:35.0,cut:35.0,
  // shot starts (shot 5, the den, runs to the cut)
  T:[0,4.0,9.8,15.6,21.4,27.0],rise:[27.4,30.1],roar:30.0,Z:{}};
function zc214Bit(z){return 1<<z}
function zc214Seen(z){return !!(ZC214.seen&zc214Bit(z))}
function zc214Want(I){try{if(!I||!I.fld||!ZC214.Z[I.z]||zc214Seen(I.z)||ZC214.run||ZC214.raw===-1)return false;   // raw -1: an older save still loading (decided after it)
  
  if(typeof IC151!='undefined'&&IC151.run)return false;if(typeof HC208!='undefined'&&HC208.run)return false;if(typeof KC208!='undefined'&&KC208.run)return false;
  if(window.KQ_ZC214)return true;if(window.AW_NOTITLE||navigator.webdriver)return false;if(typeof SET!='undefined'&&SET.intro===0)return false;return true}catch(_){return false}}
// a hero who already knows the zone (saves from before v214): past instance I, the Sovereign beaten, or the zone's quest begun
function zc214Known(z){try{if(insReach(z)>0||bossDone.has(z))return true}catch(_){}
  try{if(z===2)return MQ151.st>0||!!MQ151.seen||MQ160.st>0;if(z===3)return SS165.c1.st>0||!!SS165.c1.seen;if(z===4)return DG165Q.g.st>0;if(z===5)return CQ205.c1.st>0}catch(_){}return false}

// ---------------- small helpers ----------------
function zc214V(x,z,dy){return new THREE.Vector3(x,GH(x,z)+(dy||0),z)}
// remember how a thing was before the cinematic touched it; everything is put back in zc214Back
function zc214Vis(S,o,on){if(!o)return;if(!S.vm.has(o))S.vm.set(o,o.visible);o.visible=!!on}
function zc214Lit(S,l,i){if(!l)return;if(!S.lm.has(l))S.lm.set(l,l.intensity);l.intensity=i}
// a thing the cinematic builds that the game would only have built on a visit: put back hidden (the zone's own tick shows it there)
function zc214New(S,o){if(o&&!S.vm.has(o))S.vm.set(o,false)}
// the road of an instance at a fraction of its length: a point and the way along it
function zc214Road(g,fr){const I=INSL[g],P=I.path,j=Math.max(2,Math.min(P.length-14,Math.floor(P.length*fr))),a=P[j],b=P[Math.min(P.length-1,j+12)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;
  return {x:a[0],z:a[1],fx:dx/L,fz:dz/L,sx:-dz/L,sz:dx/L}}
// a stand-in creature (model only): sh = its shot, from (x,z) walking along (dx,dz) at v from t0; stalk = toward the camera
function zc214Cast(S,c){try{if(!EN[c.k])return;if(!c.free){const T=ZC214.T,ta=T[c.sh],tb=T[c.sh+1]||ZC214.cut;if(!zc214Clear(S,c,ta,tb,zc214G({x:c.x,z:c.z})))return}const m=cr(enemyC(c.k,c.lv||10,{}));if(!m)return;m.scale.setScalar(m.bs||m.scale.x||1);m.userData.psNo=1;m.userData.noFarCull=1;m.visible=false;
    m.traverse(o=>{if(o.isMesh)o.frustumCulled=false});scene.add(m);S.cast.push(Object.assign({m},c))}catch(e){console.warn('zc214 cast',c.k,e)}}
// a creature of our own on the Sovereign rig (no AI): built with B.build, posed per frame by zc214RigPose
function zc214Rig(B,x,z,ry){const R=svRig();B.build(R,null);svRest(R);try{svMerge(R)}catch(_){}const g=new THREE.Group();g.add(R.root);g.position.set(x,GH(x,z),z);g.rotation.y=ry;
  g.visible=false;g.userData.noFarCull=1;g.traverse(o=>{if(o.isMesh)o.frustumCulled=false});scene.add(g);
  const O={};for(const k in R.J)O[k]=[0,0,0,0,0,0];const v={m:g,c:{h:1},dead:false,sv:{i:'zc',B,R,O,P:{},snap:{},ph:1,spd:0,mv:null,chg:0,hy:0,aw:1}};v.sv.e=v;v.sv.lp=g.position.clone();return v}
function zc214RigPose(v,trk,t,dt,now){const Q=v.sv,B=Q.B,R=Q.R,O=Q.O;for(const k in O){const o=O[k];o[0]=o[1]=o[2]=o[3]=o[4]=o[5]=0}
  try{B.loco&&B.loco(v,Q,O,dt,now)}catch(_){}
  if(trk){const Pz=svSample(B,{snap:{}},trk,t,Q.P,now);for(const k in Pz){const p=Pz[k],o=O[k];if(!p||!o)continue;for(let q=0;q<6;q++)o[q]=p[q]}}
  for(const k in O){const g=R.J[k],o=O[k],r0=g.userData.r0,p0=g.userData.p0;g.rotation.set(r0.x+o[0],r0.y+o[1],r0.z+o[2]);g.position.set(p0.x+o[3],p0.y+o[4],p0.z+o[5])}
  try{B.post&&B.post(v,Q,dt,now)}catch(_){}}
// a sp152 gateway's model (built as its first visit builds it)
function zc214Gate(S,key){try{const G=SP152.gates[key];if(!G)return null;if(!G.spot){G.spot=G.where?G.where():sp152GateSpot(G.ig);G.g=G.build(G.spot);G.spot.built=1;zc214New(S,G.g)}return G.g?G:null}catch(e){console.warn('zc214 gate',key,e);return null}}

// =====================================================================================================================
// the stand-ins of shots 1–4 stand where that shot's camera looks at mid-shot: d ahead, o across, walking across the view
function zc214Place(S){(S.Z.rel||[]).forEach(([sh,k,lv,d,o,dir,v,dl])=>{try{const T=ZC214.T,ta=T[sh],tb=T[sh+1]||ZC214.cut,tm=(ta+tb)/2,c=S.Z.cam(S,sh,.5,tm);if(!c)return;
    let fx=c.l.x-c.p.x,fz=c.l.z-c.p.z;const L=Math.hypot(fx,fz)||1;fx/=L;fz/=L;const rx=-fz,rz=fx,t0=ta+dl,g=zc214G(c.F);
    // the first spot (then nearby ones, then the other way) whose whole walk stays on open ground: never through a wall, a tomb,
    // a column or the sand of the buried temple (owner, Nov 10 2026: creatures walked through the tomb in the sand cinematic)
    const tries=[];for(const dd of [0,-2,2,-4,4])for(const oo of [0,2,-2,4,-4,6,-6])for(const sg of [1,-1])tries.push([d+dd,o+oo,dir*sg]);
    for(const [d2,o2,dr] of tries){if(d2<5)continue;const s0=o2-dr*v*(tm-t0),C={sh,k,lv,x:c.p.x+fx*d2+rx*s0,z:c.p.z+fz*d2+rz*s0,dx:rx*dr,dz:rz*dr,v,t0};
      if(zc214Clear(S,C,ta,tb,g)){zc214Cast(S,C);return}}}catch(e){console.warn('zc214 place',k,e)}})}
function zc214G(F){try{const J=insAt(Math.round(F.x),Math.round(F.z));return J?J.g:null}catch(_){return null}}
// can a creature stand at x,z: inside the shot's own instance, on open ground (no wall, rock, water, prop, set-piece block), not in
// the buried temple's sand, and not where another stand-in of the same shot already walks
function zc214Blk(x,z,g){const X=Math.round(x),Z=Math.round(z),t=MAP[Z]&&MAP[Z][X];if(!t||t=='#'||t=='r'||t=='R'||t=='~')return true;
  try{if(solid(X,Z)||props.has(Z*W+X))return true}catch(_){}
  try{if(g!=null){const J=insAt(X,Z);if(!J||J.g!==g)return true}}catch(_){}
  try{if(typeof sd165At=='function'&&SD165.D&&sd165At(x,z)!=null)return true}catch(_){}return false}
// the whole walk of one stand-in in its shot, with a body's width either side
function zc214Clear(S,C,ta,tb,g){for(let t=ta;t<=tb+.01;t+=.2){const u=Math.max(0,t-C.t0),x=C.x+C.dx*C.v*u,z=C.z+C.dz*C.v*u;
    for(const [ox,oz] of [[0,0],[.9,0],[-.9,0],[0,.9],[0,-.9]])if(zc214Blk(x+ox,z+oz,g))return false;
    for(const K of S.keep||[])if(Math.hypot(x-K[0],z-K[1])<K[2]+.9)return false;   // the set pieces themselves (not all of them block walking)
    for(const o of S.cast)if(o.sh===C.sh){const uo=Math.max(0,t-o.t0),px=o.x+o.dx*o.v*uo,pz=o.z+o.dz*o.v*uo;if(Math.hypot(px-x,pz-z)<1.8)return false}}return true}
// the zones' plans: lines (the voice), build(S) → S.A anchors + set pieces + cast, cam(S,i,k,t) for shots 1–4, frame(S,i,t,now,dt)
// =====================================================================================================================
// ---------------- Burningeye Summit (the ice zone) ----------------
ZC214.Z[2]={keep(S){const A=S.A,K=[];if(A.maw)K.push([A.maw.x,A.maw.z,5]);if(A.gate)K.push([A.gate.x,A.gate.z,6]);if(A.bench)K.push([A.bench.x,A.bench.z,2.2]);if(A.drill)K.push([A.drill.x,A.drill.z,4.5]);if(A.con)K.push([A.con.x,A.con.z,2]);(A.box||[]).forEach(b=>K.push([b.x,b.z,1.8]));return K},den:[0xb8e0ff,2.0],rel:[[1,'troll',20,11,-2,1,.9,0],[1,'yeti',20,13.5,-5.5,1,.85,.3],[1,'trollsh',20,12,1.8,1,.9,.6],[2,'wendigo',23,12,3,-1,.8,0],[2,'rimecrawler',23,9.5,-3.5,1,.7,.3],[3,'troll',26,9,-3,1,.9,0],[3,'troll',26,11,1.2,1,.85,.5]],name:'Burningeye Summit',ess:'the Wraith',key:{dr:[41.2,61.74,82.41],ch:[329.63,392,493.88,587.33],toll:82.41,bed:'wind'},rise:7,riseFade:1,
  lines:[{a:1.0,b:3.6,s:'Burningeye Summit. Here even the sky burns cold.'},
    {a:4.4,b:9.0,s:'A troll warlord rules the frozen maw beneath the mountain.'},
    {a:10.2,b:14.8,s:'Above it, an ancient gate lies sealed in ice older than kings.'},
    {a:16.0,b:20.6,s:'Fire will open it… and iron will bore through the rest.'},
    {a:21.8,b:26.2,s:'The storm-born guard every pass, Upright.'},
    {a:27.2,b:31.2,s:'And at the peak, the Rime Wraith haunts its endless winter.'},
    {a:31.8,b:34.6,s:'Bring me the Wraith’s essence.'}],
  build(S){const A=S.A;
    try{const had=!!MQ151.CM;gb151MouthBuild();if(!had)zc214New(S,MQ151.CM.g);A.maw=mq151Gate()}catch(e){console.warn('zc214 maw',e)}
    try{const had=!!MQ160.S;mq160Build();const Q=MQ160.S;if(!had){[Q.gate.g,Q.bench,Q.sp].concat(Q.cache.map(c=>c.g)).forEach(o=>zc214New(S,o))}const R=mq160Plan();A.gate=R.gate;A.bench=R.bench}catch(e){console.warn('zc214 frozen gate',e)}
    try{const had=!!MQ170.S;mq170Build();const Q=MQ170.S;if(!had){[Q.cliff.g,Q.drill.g,Q.con].concat(Q.box.map(b=>b.g)).forEach(o=>zc214New(S,o))}const R=mq170Plan();A.dr=R.g;A.drill=R.drill;A.con=R.con;A.box=R.box}catch(e){console.warn('zc214 drill',e)}
    A.cr=zc214Road(insG(2,2),.45);
    // III: the storm-born stalk down the road toward the camera
    {const C=A.cr;[['jotun',9,-1.8,1.0,0],['galeharpy',11.5,2.4,1.1,.5],['jotun',14,.4,.9,.9]].forEach(([k,f,s,v,d])=>zc214Cast(S,{sh:4,k,lv:26,x:C.x+C.fx*f+C.sx*s,z:C.z+C.fz*f+C.sz*s,dx:-C.fx,dz:-C.fz,v,t0:21.4+d}))}},
  cam(S,i,k,t){const A=S.A,V=THREE.Vector3,Sm=ic151Sm,Io=ic151Io,q=Sm(k),G=zc214V;
    if(i===1&&A.maw){const M=A.maw,sx=M.fz,sz=-M.fx,r=19-7*Io(k);return {p:G(M.x+M.fx*r+sx*(4-3*q),M.z+M.fz*r+sz*(4-3*q),2.0+1.2*q),l:G(M.x+M.fx*1.5,M.z+M.fz*1.5,3.4-.6*q),fov:48,F:G(M.x+M.fx*8,M.z+M.fz*8)}}
    if(i===2&&A.gate){const g=A.gate,r=21-6*Io(k),s=-7+6*q;return {p:G(g.x+g.fx*r+g.sx*s,g.z+g.fz*r+g.sz*s,2.4+1.6*q),l:G(g.x,g.z,3.6+.6*q),fov:48,F:G(g.x+g.fx*8,g.z+g.fz*8)}}
    if(i===3&&A.dr){const g=A.dr,d=A.drill,a=-1.0+.6*q,r=17-3*q,ca=Math.cos(a),sa=Math.sin(a),ox=g.fx*ca+g.sx*sa,oz=g.fz*ca+g.sz*sa;return {p:G(d.x+ox*r,d.z+oz*r,3.4+1.4*q),l:G(d.x,d.z,2.4+.8*q),fov:50,F:G(d.x+g.fx*6,d.z+g.fz*6)}}
    return null},
  frame(S,i,t,now,dt){const tt=now/1000;
    if(MQ151.CM){zc214Vis(S,MQ151.CM.g,i===1);if(i===1&&MQ151.CM.glow)MQ151.CM.glow.material.opacity=.38+.1*Math.sin(tt*1.3)}
    const Q=MQ160.S;if(Q){[Q.gate.g,Q.bench].forEach(o=>zc214Vis(S,o,i===2));zc214Vis(S,Q.sp,false);Q.cache.forEach(c=>zc214Vis(S,c.g,i===2&&!MQ160.p[c.i]));zc214Lit(S,Q.blt,i===2?1.1+.25*Math.sin(tt*7):0)}
    const D=MQ170.S;if(D){[D.cliff.g,D.drill.g,D.con].concat(D.box.map(b=>b.g)).forEach(o=>zc214Vis(S,o,i===3));if(i===3)D.box.forEach((B,j)=>{if(B.halo)B.halo.scale.setScalar(1.1*(1+.15*Math.sin(tt*3+j)))})}}};

// ---------------- Searing Sands ----------------
ZC214.Z[3]={keep(S){const A=S.A,K=[];if(A.t2){const F=A.t2.F,T=ss165T2();[[T.altar,5],[T.kh,2.4],[T.rift,2.4]].forEach(([o,r])=>{if(o){const [x,z]=F.W2(o.a,o.b);K.push([x,z,r])}})}(A.col||[]).forEach(c=>K.push([c.x,c.z,3]));if(A.t3){const F=A.t3.F,cr=A.t3.cr;for(let a=-7;a<=7;a+=3.5){const [x,z]=F.W2(cr.a+a,cr.b);K.push([x,z,4])}}return K},den:[0xffc070,1.6],denK:1.5,rel:[[1,'scorp',29,7,-2,1,1.2,0],[1,'scorp',29,8.5,1.5,1,1.1,.4],[1,'selem',29,9.5,-4.5,1,.8,.2],[2,'tombpriest',31,11,3,-1,.6,0],[2,'scarab',31,8,-2,1,1,.3],[2,'scarab',31,9,-4,1,1,.6],[3,'saltgolem',34,9,4,-1,.7,0],[3,'dustwyrm',34,11,-4,1,.9,.4]],name:'Searing Sands',ess:'the Devourer',key:{dr:[46.25,69.3,92.5],ch:[369.99,440,554.37,659.25],toll:92.5,bed:'heat'},rise:-11,
  lines:[{a:1.0,b:3.6,s:'The Searing Sands bury everything they touch.'},
    {a:4.4,b:9.0,s:'Temples… kings… whole cities sleep beneath the dunes.'},
    {a:10.2,b:14.8,s:'A broken warden waits in his court to be made whole.'},
    {a:16.0,b:20.6,s:'Past the salt, no one crosses the waste on foot.'},
    {a:21.8,b:26.2,s:'Dig, Upright. Build. Ride into the storm.'},
    {a:27.2,b:31.2,s:'Beneath it all, Ssith’ra feeds… endless, and always hungry.'},
    {a:31.8,b:34.6,s:'Bring me the Devourer’s essence.'}],
  build(S){const A=S.A;
    try{const had=!!SD165.g;sd165Build();if(!had)zc214New(S,SD165.g);const T=ss165T1();A.t1={F:T.F,a:T.aF,y:T.yP}}catch(e){console.warn('zc214 temple',e)}
    try{const had=!!CY165.g;cy165Build();if(!had)zc214New(S,CY165.g);const T=ss165T2();A.t2={F:T.F,y:T.y0,al:T.altar}}catch(e){console.warn('zc214 court',e)}
    try{if(!SC165.made){SC165.made=1;sc165Sync();SC165.cols.forEach(C=>{if(C&&C.g)zc214New(S,C.g)})}A.col=sc165Spots()}catch(e){console.warn('zc214 salt',e)}
    try{const had=!!CS165.g;cs165Build();if(!had){zc214New(S,CS165.g);if(CS165.vis)zc214New(S,CS165.vis)}const T=ss165T3();A.t3={F:T.F,cr:T.cr,edge:T.edge,y:T.y0}}catch(e){console.warn('zc214 yard',e)}},
  cam(S,i,k,t){const A=S.A,Sm=ic151Sm,Io=ic151Io,q=Sm(k),G=zc214V;
    if(i===1&&A.t1){const F=A.t1.F,a=A.t1.a,[px,pz]=F.W2(a-28+8*Io(k),6-5*q),[lx,lz]=F.W2(a,0);return {p:G(px,pz,4.4-1.2*q),l:new THREE.Vector3(lx,A.t1.y+1.6,lz),fov:48,F:G(...F.W2(a-8,0))}}
    if(i===2&&A.t2){const F=A.t2.F,al=A.t2.al||{a:6,b:0},[px,pz]=F.W2(-13+6*Io(k),-5+7*q),[lx,lz]=F.W2(al.a,al.b);return {p:G(px,pz,4.2-1.2*q),l:G(lx,lz,1.6),fov:50,F:G(F.x,F.z)}}
    if(i===3&&A.col){const c=A.col[1]||A.col[0],R=zc214Road(insG(3,2),.34),a=.8-.9*q,ca=Math.cos(a),sa=Math.sin(a),ox=R.fx*ca+R.sx*sa,oz=R.fz*ca+R.sz*sa,r=13-3*q;return {p:G(c.x+ox*r,c.z+oz*r,1.6+1.2*q),l:G(c.x,c.z,2.6),fov:48,F:G(c.x,c.z)}}
    // the yard sits on the map's very edge: the camera stands at the edge side and looks back into the land, never out past the edge
    if(i===4&&A.t3){const F=A.t3.F,cr=A.t3.cr,[px,pz]=F.W2(cr.a+4.2-2.4*Io(k),7.5-3*q),[lx,lz]=F.W2(cr.a-9,-1.5+1.5*q),y=A.t3.y!=null?A.t3.y:GH(px,pz);return {p:new THREE.Vector3(px,y+2.4+1.0*q,pz),l:new THREE.Vector3(lx,y+1.3,lz),fov:52,F:G(...F.W2(cr.a,0))}}
    return null},
  frame(S,i,t,now,dt){if(SD165.g)zc214Vis(S,SD165.g,i===1);if(CY165.g)zc214Vis(S,CY165.g,i===2);
    try{SC165.cols.forEach(C=>{if(C&&C.g)zc214Vis(S,C.g,i===3)});SC165.picks.forEach(q=>zc214Vis(S,q.g,false))}catch(_){}
    if(CS165.g){zc214Vis(S,CS165.g,i===4);if(CS165.vis)zc214Vis(S,CS165.vis,i===4);try{const R=CS165.R;if(R&&i===4){R.J.sail.rotation.y=Math.sin(t*2.3)*.35}}catch(_){}}}};

// ---------------- The Dirge (the graveyard) ----------------
ZC214.Z[4]={keep(S){const A=S.A,K=[];if(A.ang)K.push([A.ang.x,A.ang.z,4]);(A.gr||[]).forEach(g=>K.push([g.x,g.z,1.8]));if(A.quay)K.push([A.quay.x,A.quay.z,5]);(A.pr||[]).forEach(p=>K.push([p.x,p.z,2.4]));if(A.ctr)K.push([A.ctr.x,A.ctr.z,8]);return K},fill:[0x9adcc8,1.6],den:[0x9affd0,4.2],dim:.14,rel:[[1,'skeleton',38,8,-3.5,1,.6,0],[1,'ghoul',38,10,3.5,-1,.7,.5],[2,'bonearcher',38,8,3,-1,.5,0],[2,'skeleton',38,10,-3,1,.55,.4],[3,'drowned',40,8,-3,1,.5,0],[3,'banshee',40,10,3,-1,.7,.3],[4,'bonehound',42,12,-4,1,1.1,.2],[4,'colossus',42,15,3,-1,.5,0],[4,'bonehound',42,13,-7,1,1.1,.6]],name:'The Dirge',ess:'the Rot-King',key:{dr:[43.65,65.41,87.31],ch:[349.23,415.3,523.25,622.25],toll:87.31,bed:'murmur'},rise:-5,
  lines:[{a:1.0,b:3.6,s:'The Dirge. Its dead never rest.'},
    {a:4.4,b:9.0,s:'A weeping angel keeps watch over a field of graves…'},
    {a:10.2,b:14.8,s:'…and only one of them is a door.'},
    {a:16.0,b:20.6,s:'Below, the black channel carries the drowned into the dark.'},
    {a:21.8,b:26.2,s:'Five runes hold the last gate shut. Light them, Upright.'},
    {a:27.2,b:31.2,s:'The Bloated One gorges on the dead of this place.'},
    {a:31.8,b:34.6,s:'Bring me the Rot-King’s essence.'}],
  build(S){const A=S.A;
    {const G=zc214Gate(S,'sanctum');if(G)A.ang=G.spot}
    try{const had=!!DG165GR.S;dg165GBuild();if(!had)zc214New(S,DG165GR.S.root);A.gr=dg165GravePlan().G}catch(e){console.warn('zc214 graves',e)}
    {const G=zc214Gate(S,'channel');if(G)A.quay=G.spot}
    try{const had=!!OS165.S;os165Build();const Q=OS165.S;if(!had){Q.pr.forEach(M=>zc214New(S,M.g));zc214New(S,Q.R.g)}const P=dg165PrismPlan();A.ctr=P.ctr;A.pr=P.pr}catch(e){console.warn('zc214 prisms',e)}},
  cam(S,i,k,t){const A=S.A,Sm=ic151Sm,Io=ic151Io,q=Sm(k),G=zc214V;
    if(i===1&&A.ang){const s=A.ang,fx=-s.ux,fz=-s.uz,sx=fz,sz=-fx,r=14-6*Io(k);return {p:G(s.x+fx*r+sx*(-3+2*q),s.z+fz*r+sz*(-3+2*q),1.4+.8*q),l:G(s.x,s.z,2.6+.4*q),fov:46,F:G(s.x+fx*6,s.z+fz*6)}}
    if(i===2&&A.gr&&A.gr.length){const o=A.gr.find(g=>g.i===DG165G.K)||A.gr[0],a=o.ry+.95-.6*q,R=7-2.4*Io(k),hx=o.x-Math.sin(o.ry)*.8,hz=o.z-Math.cos(o.ry)*.8;
      return {p:G(o.x+Math.sin(a)*R,o.z+Math.cos(a)*R,1.5-.3*q),l:G(hx,hz,1.0),fov:46,F:G(o.x,o.z)}}
    if(i===3&&A.quay){const s=A.quay,fx=-s.ux,fz=-s.uz,sx=fz,sz=-fx,r=15-5*Io(k);return {p:G(s.x+fx*r+sx*(5-4*q),s.z+fz*r+sz*(5-4*q),2.4+.8*q),l:G(s.x,s.z,1.6),fov:48,F:G(s.x+fx*6,s.z+fz*6)}}
    if(i===4&&A.ctr){const c=A.ctr,a=-2.4+.9*q,r=24-6*Io(k);return {p:G(c.x+Math.cos(a)*r,c.z+Math.sin(a)*r,6.5-2.5*q),l:G(c.x,c.z,2.2),fov:54,F:G(c.x,c.z)}}
    return null},
  frame(S,i,t,now,dt){const tt=now/1000;try{const Ga=SP152.gates.sanctum;if(Ga&&Ga.g)zc214Vis(S,Ga.g,i===1||i===2)}catch(_){}
    try{const Q=DG165GR.S;if(Q){zc214Vis(S,Q.root,i===1||i===2);if(i===1||i===2)Q.gr.forEach((g,j)=>{if(g.wisp){g.wisp.position.y=2.3+.15*Math.sin(tt*1.3+j);g.wisp.material.opacity=.32+.14*Math.sin(tt*2.1+j*1.7)}})}}catch(_){}
    try{const Gc=SP152.gates.channel;if(Gc&&Gc.g)zc214Vis(S,Gc.g,i===3)}catch(_){}
    try{const Q=OS165.S;if(Q){Q.pr.forEach((M,j)=>{zc214Vis(S,M.g,i===4);zc214Lit(S,M.lt,i===4?1.6:0);if(i===4){M.cr.rotation.y=tt*.6+j;M.cr.position.y=3.6+.18*Math.sin(tt*1.2+j);M.core.position.y=M.cr.position.y;M.halo.position.y=M.cr.position.y}});zc214Vis(S,Q.R.g,i===4)}}catch(_){}}};

// ---------------- The Citadel ----------------
ZC214.Z[5]={keep(S){const A=S.A,K=[];if(A.gg)K.push([A.gg.x,A.gg.z,7]);if(A.vh){K.push([A.vh.sleep.x,A.vh.sleep.z,5.5]);K.push([A.vh.x,A.vh.z,6])}if(A.dm){const R=A.dm;[[R.door,5],[R.lens,2.2]].concat((R.st||[]).map(o=>[o,1.6])).forEach(([o,r])=>{if(o&&o.x!=null)K.push([o.x,o.z,r])})}return K},fill:[0xff8a8a,.9],den:[0xffa080,6.0],dim:.12,denK:.72,rel:[[1,'vamp',46,10,-3,1,.6,0],[1,'vampk',46,12,3.5,-1,.5,.3],[1,'bloodbat',46,8,0,1,1.2,.2],[2,'bloodhound',48,12,-5,1,.9,0],[2,'gargoyle',48,14,5,-1,.6,.4]],name:'The Citadel',ess:'the Crimson King',key:{dr:[38.89,58.27,77.78],ch:[311.13,369.99,466.16,554.37],toll:77.78,bed:'pulse'},rise:0,
  lines:[{a:1.0,b:3.6,s:'The Citadel. The last court of the Crimson King.'},
    {a:4.4,b:9.0,s:'His gates are sealed with blood…'},
    {a:10.2,b:14.8,s:'…and his hounds sleep in chains.'},
    {a:16.0,b:20.6,s:'Only the dawn can break the eclipse over his keep.'},
    {a:21.8,b:26.2,s:'Every soul here was drained to serve him, Upright.'},
    {a:27.2,b:31.2,s:'Lord Vaelric has fed on this land for a thousand years.'},
    {a:31.8,b:34.6,s:'End his reign. Bring me his essence.'}],
  build(S){const A=S.A;
    try{const had=!!GG205.S;gg205Build();const G=GG205.S;if(!had){zc214New(S,G.g);G.br.forEach(b=>zc214New(S,b))}A.gg=gg205Spot()}catch(e){console.warn('zc214 great gate',e)}
    try{const had=!!VH205.G;vh205GateBuild();const G=VH205.G;if(!had){zc214New(S,G.g);(VH205.bal||[]).forEach(b=>zc214New(S,b.o))}A.vh=vh205Spot()}catch(e){console.warn('zc214 rampart',e)}
    // Vharog asleep before the rampart gate: a model of our own (the fight's own only exists while a hero is in II)
    try{if(A.vh&&!cq205Done(2)){const s=A.vh.sleep;S.vhg=zc214Rig(VH205BOSS,s.x,s.z,s.ry)}}catch(e){console.warn('zc214 vharog',e);S.vhg=null}
    try{const had=!!DM205.S;dm205Build();const Q=DM205.S;if(!had){[Q.door.g,Q.floor,Q.lens,Q.shaft].concat(Q.st.map(s=>s.o),Q.sh.map(s=>s.o)).forEach(o=>zc214New(S,o))}A.dm=dm205Court()}catch(e){console.warn('zc214 sun court',e)}
    // III: the court's executioner and nosferatu stalk down the road toward the camera
    {const C=zc214Road(insG(5,2),.5);A.cr=C;[['executioner',9,-1.6,.9,0],['nosferatu',11.5,2.2,1.0,.5],['nosferatu',14,.3,.95,.9]].forEach(([k,f,s,v,d])=>zc214Cast(S,{sh:4,k,lv:50,x:C.x+C.fx*f+C.sx*s,z:C.z+C.fz*f+C.sz*s,dx:-C.fx,dz:-C.fz,v,t0:21.4+d}))}},
  cam(S,i,k,t){const A=S.A,Sm=ic151Sm,Io=ic151Io,q=Sm(k),G=zc214V;
    if(i===1&&A.gg){const F=A.gg.F,a=F.reach,[px,pz]=F.W2(a-30+10*Io(k),5-4*q),[lx,lz]=F.W2(a,0);return {p:G(px,pz,3.0+1.4*q),l:new THREE.Vector3(lx,A.gg.y+5.2,lz),fov:48,F:G(...F.W2(a-8,0))}}
    if(i===2&&A.vh){const s=A.vh.sleep,F=A.vh.F,a=.9-.5*q,ca=Math.cos(a),sa=Math.sin(a),ox=-F.fx*ca+F.lx*sa,oz=-F.fz*ca+F.lz*sa,r=15-3.5*Io(k);return {p:G(s.x+ox*r,s.z+oz*r,2.6-.6*q),l:G(s.x+F.fx*2.5,s.z+F.fz*2.5,1.6),fov:46,F:G(s.x,s.z)}}
    if(i===3&&A.dm){const R=A.dm,F=R.F,[px,pz]=F.W2(-14+6*Io(k),-6+5*q),d=R.door;return {p:G(px,pz,2.0+1.6*q),l:new THREE.Vector3(d.x,d.y+4.2,d.z),fov:50,F:G(F.x,F.z)}}
    return null},
  frame(S,i,t,now,dt){const tt=now/1000;
    const Gg=GG205.S;if(Gg){zc214Vis(S,Gg.g,i===1);Gg.br.forEach(b=>{zc214Vis(S,b,i===1);zc214Lit(S,b.userData.l,i===1?1.2+.25*Math.sin(tt*9+b.position.x):0)});
      if(Gg.seal){zc214Lit(S,Gg.seal.light,i===1?1.2+.5*Math.sin(tt*2.2):0);if(i===1&&!Gg.open)Gg.seal.rings.forEach(r=>{if(r.on)r.m.rotation.z=tt*(r.sp||.3)})}}
    const Gv=VH205.G;if(Gv){zc214Vis(S,Gv.g,i===2);(VH205.bal||[]).forEach(b=>zc214Vis(S,b.o,i===2))}
    if(S.vhg){S.vhg.m.visible=i===2;if(i===2){zc214RigPose(S.vhg,VH205BOSS.M.sleep.trk,9,dt,now);try{const ek=ic151Sm(ic151K(t,ZC214.T[3]-1.3,ZC214.T[3]-.9));S.vhg.sv.R.eyeM.color.setRGB(.12+.88*ek,.02+.14*ek,.02+.14*ek)}catch(_){}}}
    const Q=DM205.S;if(Q){[Q.door.g,Q.floor,Q.lens,Q.shaft].forEach(o=>zc214Vis(S,o,i===3));Q.st.forEach(s=>zc214Vis(S,s.o,i===3));Q.sh.forEach(s=>zc214Vis(S,s.o,i===3));Q.beams.forEach(b=>zc214Vis(S,b,false));
      zc214Lit(S,Q.ll,i===3?1.3+.2*Math.sin(tt*2):0);if(i===3)Q.shaft.material.opacity=.16+.04*Math.sin(tt*1.3)}}};

// =====================================================================================================================
// the engine
// =====================================================================================================================
function zc214Build(z){const Z=ZC214.Z[z],S={z,Z,A:{},cast:[],props:[],vm:new Map(),lm:new Map(),si:-1,lt:null,t:0,ev:{},fx:[]};
  // no words in the world: floating name tags and markers are hidden until the hand-back
  S.tags=[];try{scene.traverse(o=>{if(o.isSprite&&o.visible&&o.material&&o.material.map&&o.material.map.isCanvasTexture){S.tags.push(o);o.visible=false}})}catch(_){}
  S.H=pl.position.clone();S.yaw=pl.rotation.y;S.near0=cam.near;
  // the live creatures stand frozen while the game waits: hidden during the tour, back after
  S.foes=[];try{enemies.forEach(e=>{if(!e.dead&&!e.boss&&e.m&&e.m.visible){S.foes.push(e);e.m.visible=false}})}catch(_){}
  try{Z.build(S)}catch(e){console.warn('zc214 build',z,e)}
  try{S.keep=S.Z.keep?S.Z.keep(S):[]}catch(e){S.keep=[];console.warn('zc214 keep',e)}
  zc214Place(S);
  // the den
  const D=INSL[insG(z,3)],B=BOSSES[z];S.den={x:B.x,z:B.y};const nx=D.en[0]-S.den.x,nz=D.en[1]-S.den.z,nl=Math.hypot(nx,nz)||1;S.den.nx=nx/nl;S.den.nz=nz/nl;
  try{const e=(typeof enemies!='undefined'?enemies:[]).find(e=>e.boss&&e.bi===z&&!e.dead&&e.sv&&e.sv.R);
    if(e){const s=e.sv,busy=!!(s.mv||s.on);S.boss={e,busy,save:{p:e.m.position.clone(),ry:e.m.rotation.y,vis:e.m.visible,hb:e.hb&&e.hb.visible,trk:s.trk,tt:s.tt,aw:s.aw}};
      if(!busy){S.den.x=e.m.position.x;S.den.z=e.m.position.z;
        // how tall it stands (the camera keeps its distance by it)
        try{e.m.position.y=GH(S.den.x,S.den.z);svApply(e,0,performance.now());e.m.updateMatrixWorld(true);const j=s.R.J[s.B.headJ||'head']||s.R.J.head;S.hh=Math.max(1.6,j.getWorldPosition(new THREE.Vector3()).y-GH(S.den.x,S.den.z))}catch(_){S.hh=4}}}}catch(e){console.warn('zc214 boss',e);S.boss=null}
  if(!S.hh)S.hh=4;S.sc=Math.max(.55,Math.min(1.7,S.hh/5.5))*(Z.denK||1);
  // a light on the subject: a soft fill in the field shots (dark zones), a key light on the Sovereign in its den
  S.lgt=new THREE.PointLight(0xffffff,0,30,1.5);scene.add(S.lgt);
  return S}
function zc214Shot(t){const T=ZC214.T;let i=0;while(i<T.length-1&&t>=T[i+1])i++;const b=i<T.length-1?T[i+1]:ZC214.cut;return {i,k:Math.max(0,Math.min(1,(t-T[i])/(b-T[i])))}}
// the cameras: the zone's own for shots 1–4; the opening on the hero and the den are the same for every zone
function zc214Cam(S,i,k,t){const V=THREE.Vector3,Io=ic151Io,Sm=ic151Sm,K=ic151K;let c=null;
  if(i>=1&&i<=4)try{c=S.Z.cam(S,i,k,t)}catch(e){if(!S.ce){S.ce=1;console.warn('zc214 cam',e)}}
  if(c)return c;
  // a shot of creatures stalking down the road toward a low camera (as 3810's Galecliffs)
  if(i===4&&S.A.cr){const C=S.A.cr,q=Sm(k),m=S.cast.find(o=>o.sh===4),l=m&&m.cx!=null?zc214V(m.cx,m.cz,1.5*(m.hs||1)):zc214V(C.x+C.fx*10,C.z+C.fz*10,1.5);
    return {p:zc214V(C.x+C.sx*.6-C.fx*.6*q,C.z+C.sz*.6-C.fz*.6*q,.8),l,fov:46,F:zc214V(C.x+C.fx*6,C.z+C.fz*6,0)}}
  if(i===0||i<5){const H=S.H,fw=new V(Math.sin(S.yaw),0,Math.cos(S.yaw)),sd=new V(fw.z,0,-fw.x),kk=i===0?k:1,q=Io(K(kk,.3,1));
    const p=H.clone().addScaledVector(fw,-3.1-.4*kk+8*q).addScaledVector(sd,1.0-.5*q).add(new V(0,1.75+14*q,0)),l=H.clone().addScaledVector(fw,6).add(new V(0,1.3,0)).lerp(H.clone().addScaledVector(fw,55).add(new V(0,2,0)),Sm(K(kk,.25,1)));
    return {p,l,fov:46+6*q,F:H}}
  // the den: the slow approach out of the dark as it wakes, then close and low as it roars
  const D=S.den,c0=zc214V(D.x,D.z,0),sx=-D.nz,sz=D.nx,s=S.sc,R=ZC214.roar,hh=S.hh;
  if(t<R+.35){const q=Sm(K(t,ZC214.T[5],R+.35));const p=c0.clone().add(new V(D.nx*(27-6*q)*s+sx*(4-5*q)*s,1.3+.6*q,D.nz*(27-6*q)*s+sz*(4-5*q)*s));
    const l=c0.clone().add(new V(0,hh*(.45+.35*Sm(K(t,ZC214.rise[0],ZC214.rise[1]))),0));return {p,l,fov:46,F:c0}}
  const q=Sm(K(t,R+.35,ZC214.cut)),h=S.bh||c0.clone().add(new V(0,hh,0)),p=c0.clone().add(new V(D.nx*(13.5-2*q)*s+sx*2.4*s,1.1,D.nz*(13.5-2*q)*s+sz*2.4*s));
  const l=h.clone().lerp(c0.clone().add(new V(0,h.y-c0.y,0)),.5).add(new V(0,-.8*s,0));return {p,l,fov:54-5*q,F:c0}}
// the Sovereign: hidden until the den, rising (or descending) into view, then its own intro move as the voice names it
function zc214Boss(S,i,t,now,dt){const B=S.boss;if(!B||B.busy)return;const e=B.e,s=e.sv,D=S.den,K=ic151K,Sm=ic151Sm,on=i===5;e.m.visible=on;if(e.hb)e.hb.visible=false;if(!on)return;
  const rk=ic151Oc(K(t,ZC214.rise[0],ZC214.rise[1])),dy=S.Z.rise||0,y0=GH(D.x,D.z);e.m.position.set(D.x,y0+dy*S.sc*(1-rk),D.z);e.m.rotation.y=Math.atan2(D.nx,D.nz);
  const Q=s,Bd=s.B,O=s.O;for(const k in O){const o=O[k];o[0]=o[1]=o[2]=o[3]=o[4]=o[5]=0}
  try{Bd.loco&&Bd.loco(e,Q,O,dt,now)}catch(_){}
  const M=Bd.M&&Bd.M.intro,u=t-ZC214.roar;if(M&&u>-.05){const Pz=svSample(Bd,{snap:{}},M.trk,Math.max(0,u),Q.P,now),w=Sm(K(u,-.05,.35));for(const k in Pz){const p=Pz[k],o=O[k];if(!p||!o)continue;for(let q=0;q<6;q++)o[q]+=(p[q]-o[q])*w}}
  for(const k in O){const g=s.R.J[k];if(!g)continue;const o=O[k],r0=g.userData.r0,p0=g.userData.p0;g.rotation.set(r0.x+o[0],r0.y+o[1],r0.z+o[2]);g.position.set(p0.x+o[3],p0.y+o[4],p0.z+o[5])}
  try{Bd.post&&Bd.post(e,Q,0,now)}catch(_){}
  // a ghost fades in as it comes down (the Wraith)
  if(S.Z.riseFade&&s.R.mats){const a=.15+.85*rk;s.R.mats.forEach(m=>{if(m.userData.zc214o==null){m.userData.zc214o=m.opacity;m.userData.zc214t=m.transparent}m.transparent=true;m.opacity=m.userData.zc214o*a})}
  try{e.m.updateMatrixWorld(true);const j=s.R.J[Bd.headJ||'head']||s.R.J.head;if(j)S.bh=j.getWorldPosition(S.bh||new THREE.Vector3())}catch(_){}
  // its voice
  const ev=(k,a,fn)=>{if(!S.ev[k]&&t>=a){S.ev[k]=1;if(t<a+.5)try{fn()}catch(_){}}},c=new THREE.Vector3(D.x,y0,D.z);
  ev('h0',ZC214.rise[0]-.2,()=>svSnd('hiss',.5,.5));ev('sp',ZC214.rise[0]+.5,()=>{if(dy<0)burst(gY(c,.2),S.z===3?0xd8b070:0x4a5a48,60,4*S.sc,4,.8)});
  ev('ro',ZC214.roar+1.5,()=>{svSnd('roar',1,S.z===5?.8:1.0);svSnd('shriek',.5,S.z===2?1.2:.8);if(dy<0)burst(gY(c,.2),S.z===3?0xd8b070:0x4a5a48,50,4*S.sc,4,.7)})}
function zc214Frame(S,t){const now=3e6+t*1000,dt=Math.max(0,Math.min(.1,S.lt==null?0:t-S.lt));S.lt=t;const sh=zc214Shot(t),i=sh.i;
  try{S.Z.frame(S,i,t,now,dt)}catch(e){if(!S.fe){S.fe=1;console.warn('zc214 zone frame',e)}}
  zc214Boss(S,i,t,now,dt);
  // the stand-ins: only in their own shot, walking (a pure function of t)
  S.cast.forEach(C=>{const on=C.sh===i;C.m.visible=on;if(!on)return;const u=Math.max(0,t-C.t0),x=C.x+C.dx*C.v*u,z=C.z+C.dz*C.v*u;C.cx=x;C.cz=z;C.m.position.set(x,GH(x,z),z);C.m.rotation.y=Math.atan2(C.dx,C.dz);
    try{animC(C.m,now,u>0,C.v*1.6)}catch(_){try{if(C.m.rig)C.m.rig(now,u>0,C.v)}catch(_){}}});
  const c0=zc214Cam(S,i,sh.k,t);
  // the camera, a shake on the roar
  const c=c0,sk=i===5?.16*Math.max(0,1-Math.abs(t-(ZC214.roar+1.75))/.9):0;
  if(sk>0){c.p.x+=(ic151H(t*40)-.5)*sk;c.p.y+=(ic151H(t*43+1)-.5)*sk;c.l.x+=(ic151H(t*37+2)-.5)*sk*1.6}
  c.p.y=Math.max(c.p.y,GH(c.p.x,c.p.z)+.45);
  cam.position.copy(c.p);cam.up.set(0,1,0);cam.lookAt(c.l);cam.fov=c.fov;cam.updateProjectionMatrix();if(typeof look!='undefined')look.copy(c.l);
  // draw only the instance being shown; settle its sky and fog on the first frame of a shot
  const F=c.F;hc208Focus(F,()=>{try{chunkVis()}catch(_){}
    try{if(S.si!==i){for(let n=0;n<40;n++)atmos(.05,now)}else atmos(dt,now)}catch(_){}
    try{townLights(F)}catch(_){}});
  if(i===5)try{scene.fog.density=Math.min(scene.fog.density,.03)}catch(_){}
  {const L=S.lgt,Z=S.Z,f=i===5?Z.den:i>0?Z.fill:null;if(f&&L){const w=i===5?ic151Sm(ic151K(t,ZC214.T[5],ZC214.rise[1])):1;L.color.setHex(f[0]);L.intensity=f[1]*w;L.distance=i===5?30*S.sc+10:30;
      L.position.set(F.x+(c.p.x-F.x)*.45,F.y+(i===5?S.hh*1.2:5),F.z+(c.p.z-F.z)*.45)}else if(L)L.intensity=0}
  S.si=i;WIND.t.value=now/1000;try{torch.position.set(F.x,GH(F.x,F.z)+2.2,F.z+.3);if(i>0)torch.intensity*=.6}catch(_){}
  try{FADE.cam.value.copy(cam.position);FADE.pl.value.copy(cam.position)}catch(_){}
  if(i===5&&S.boss&&!S.boss.busy){const keep=KQ.fx;KQ.fx=S.fx;try{fxStep(dt);kqFxTick(dt)}catch(_){}finally{S.fx=KQ.fx;KQ.fx=keep}}else try{fxStep(dt)}catch(_){}
  if(!ZC214.noDraw){let zp=null;if(typeof kc208ZpClear=='function'){const r0=KC208.zpR;KC208.zpR=7;try{zp=kc208ZpClear()}finally{KC208.zpR=r0}}try{POST.render()}finally{if(zp)kc208ZpBack(zp)}}}

// ---------------- the page layer: letterbox, the voice's subtitles, the den's dark, fades, skip (as 3810) ----------------
function zc214Css(){if(document.getElementById('zc214css'))return;ic151Css();ic151DCss();const s=document.createElement('style');s.id='zc214css';s.textContent=
  '#zc214{position:fixed;inset:0;z-index:2147483000;overflow:hidden;cursor:none;user-select:none;pointer-events:auto;background:transparent}'+
  '#zc214 .lb{position:absolute;left:0;right:0;height:11vh;background:#000;z-index:3;pointer-events:none}#zc214 .lb.t{top:0}#zc214 .lb.b{bottom:0}'+
  '#zc214 .fk{position:absolute;inset:0;background:#000;z-index:4;pointer-events:none}'+
  '#zc214 .vg{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 30%,rgba(6,6,12,.55) 68%,rgba(0,0,4,.92) 100%)}'+
  '#zc214 .sub{position:absolute;left:6%;right:6%;bottom:17vh;text-align:center;z-index:5;pointer-events:none;font-family:"IM Fell English SC","Cinzel Decorative",Georgia,serif;font-size:clamp(20px,3.2vw,44px);letter-spacing:.06em;color:#fff;line-height:1.2}'+
  '#zc214 .sub span{display:inline-block;white-space:pre;text-shadow:0 0 3px rgba(10,16,50,.95),0 0 14px rgba(14,24,70,.85),-2px 0 rgba(90,200,255,.6),2px 0 rgba(255,120,220,.5)}'+
  '#zc214 .skip{position:absolute;right:22px;bottom:calc(11vh + 14px);z-index:6;cursor:pointer;background:rgba(10,8,16,.45);color:#e8e0d0;border:1px solid rgba(232,224,208,.35);border-radius:4px;font:600 13px/1 "Cinzel Decorative",Georgia,serif;letter-spacing:.08em;padding:8px 14px;opacity:.7}'+
  '#zc214 .skip:hover{opacity:1;background:rgba(30,24,40,.7)}';document.head.appendChild(s)}
function zc214Layer(S){zc214Css();const el=document.createElement('div');el.id='zc214';
  el.innerHTML='<div class="vg"></div><div class="lb t"></div><div class="lb b"></div><div class="sub"></div><div class="fk"></div><button class="skip">Skip ›</button>';
  document.body.appendChild(el);S.dom={el,lt:el.querySelector('.lb.t'),lb:el.querySelector('.lb.b'),sub:el.querySelector('.sub'),vg:el.querySelector('.vg'),fk:el.querySelector('.fk'),skip:el.querySelector('.skip'),cur:null,sp:[]}}
function zc214Dom(S,t){const D=S.dom;if(!D)return;const K=ic151K,Sm=ic151Sm,C=ZC214.cut,T5=ZC214.T[5];
  const lb=(11*(1-Sm(K(t,C+.5,ZC214.len-.3))))+'vh';D.lt.style.height=lb;D.lb.style.height=lb;
  // black: out of black at the start, a short dip at each cut, a hard cut on the roar's end, back out of black into the game
  let fk=t<C?1-K(t,0,1.2):1-K(t,C+.25,C+1.6);if(t<C)for(let j=1;j<ZC214.T.length;j++){const a=ZC214.T[j],w=j===5?.5:.28;fk=Math.max(fk,K(t,a-w,a)*(1-K(t,a,a+w*1.4)))}
  D.fk.style.opacity=fk.toFixed(3);
  const dk=t>=T5&&t<C?Sm(K(t,T5,T5+1)):0;D.vg.style.opacity=dk.toFixed(3);
  try{const c=ren.domElement;if(dk>0){c.style.transition='none';c.style.filter='brightness('+(1-(S.Z.dim==null?.38:S.Z.dim)*dk).toFixed(3)+') saturate('+(1-.2*dk).toFixed(3)+') contrast('+(1+.18*dk).toFixed(3)+')'}else if(c.style.filter)c.style.filter=''}catch(_){}
  // the voice (the intro's subtitles: letters drift in out of a blur, the line breathes and glitches)
  const L=S.Z.lines.find(x=>t>=x.a-.1&&t<x.b+.6);if(L!==D.cur){D.cur=L;D.sub.innerHTML='';D.sp=[];if(L){L.s.split(/( )/).forEach(w=>{if(!w)return;let box=D.sub;if(w!==' '){box=document.createElement('span');box.className='w';D.sub.appendChild(box)}for(const ch of w){const e=document.createElement('span');e.textContent=ch;box.appendChild(e);D.sp.push(e)}})}}
  if(L){const out=K(t,L.b,L.b+.6);D.sp.forEach((e,i)=>{const k=K(t,L.a+i*.045,L.a+i*.045+.55),fr=Math.floor(t*14),gl=ic151H(fr*1.7+i*3.1)>.93?1:0,jx=(ic151H(fr+i*.7)-.5)*2.4*(1+gl*3),jy=(ic151H(fr*1.3+i)-.5)*1.6;
    e.style.opacity=(k*(1-out)*(.85+.15*Math.sin(t*7+i))).toFixed(3);e.style.filter='blur('+((1-k)*7+out*6+gl*1.5).toFixed(2)+'px)';e.style.transform='translate('+jx.toFixed(2)+'px,'+(jy+(1-k)*8).toFixed(2)+'px) scale('+(1+(1-k)*.25).toFixed(3)+')'})}
  D.skip.style.visibility=t<ZC214.skipT?'':'hidden'}

// ---------------- sound: the voice's drone and far choir in the zone's key, the zone's air, tolls on the cuts, the den ----------------
function zc214Score(ac,out,T0,Z){const T=x=>T0+x,G=v=>{const g=ac.createGain();g.gain.value=v||0;return g},E=ZC214.cut,Kz=Z.key;
  const NB=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  const rv=ac.createConvolver(),IR=ac.createBuffer(2,ac.sampleRate*3.4,ac.sampleRate);for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.4)}rv.buffer=IR;const wet=G(.5);rv.connect(wet);wet.connect(out);
  const route=(n,o)=>{const d=G(o.dry==null?1:o.dry);n.connect(d);d.connect(out);if(o.wet){const w=G(o.wet);n.connect(w);w.connect(rv)}};
  const env=(g,a,dur,pk,at,rel)=>{g.gain.setValueAtTime(0,T(a));g.gain.linearRampToValueAtTime(pk,T(a+at));g.gain.setValueAtTime(pk,T(a+Math.max(at,dur-rel)));g.gain.linearRampToValueAtTime(0,T(a+dur))};
  const osc=(type,f,a,dur,pk,at,rel,o)=>{if(T(a+dur)<ac.currentTime-.01)return;o=o||{};const s=ac.createOscillator();s.type=type;s.frequency.setValueAtTime(f,T(a));if(o.f2)s.frequency.exponentialRampToValueAtTime(o.f2,T(a+(o.ft||dur)));if(o.det)s.detune.value=o.det;
    const g=G(0);env(g,a,dur,pk,at,rel);let n=g;s.connect(g);if(o.lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;g.connect(fl);n=fl}route(n,o);s.start(T(a));s.stop(T(a+dur+.05))};
  const noise=(a,dur,pk,at,rel,ft,f,q,o)=>{if(T(a+dur)<ac.currentTime-.01)return;o=o||{};const s=ac.createBufferSource();s.buffer=NB;s.loop=true;const fl=ac.createBiquadFilter();fl.type=ft;fl.frequency.setValueAtTime(f,T(a));if(o.f2)fl.frequency.exponentialRampToValueAtTime(o.f2,T(a+dur));fl.Q.value=q||1;
    const g=G(0);env(g,a,dur,pk,at,rel);s.connect(fl);fl.connect(g);route(g,o);s.start(T(a),Math.random());s.stop(T(a+dur+.05))};
  // the zone's air under everything
  if(Kz.bed==='wind'){noise(0,E,.05,2,2,'bandpass',900,.5,{wet:.4});noise(0,E,.03,2,2,'highpass',2400,.4,{wet:.3})}
  else if(Kz.bed==='heat'){noise(0,E,.04,2,2,'bandpass',520,.4,{wet:.3});noise(0,E,.05,2,2,'lowpass',160,.7,{wet:.2})}
  else if(Kz.bed==='murmur'){noise(0,E,.05,2,2,'lowpass',140,.8,{wet:.3});noise(0,E,.018,2,2,'bandpass',1400,3,{wet:1})}
  else {noise(0,E,.04,2,2,'lowpass',220,.7,{wet:.3});for(let a=1.2;a<E-1;a+=1.6){osc('sine',48,a,.3,.22,.005,.28,{f2:34,ft:.26});osc('sine',46,a+.22,.24,.14,.005,.22,{f2:33,ft:.2})}}
  // the voice: a low drone and a far choir under the words
  Kz.dr.forEach((f,i)=>osc('sawtooth',f,.2,E-.1,.03-i*.006,3,1.2,{lp:300,wet:.5,det:i*5}));
  Kz.ch.forEach((f,i)=>osc('sine',f,.8+i*.5,E-1.2,.011,3.5,1.4,{wet:1.3,dry:.4,det:(i%2?6:-6)}));
  // a toll at every cut, sinking
  ZC214.T.slice(1).forEach((a,i)=>{const f=Kz.toll*Math.pow(.944,i);osc('sine',f,a+.03,2.4,.2,.01,2.3,{wet:.8});osc('sine',f*4,a+.03,2,.025,.02,1.9,{wet:1})});
  // the den: a dissonant swell as it wakes, cut dead to black on the roar
  [Kz.dr[0]*1.42,Kz.dr[0]*1.5,Kz.dr[0]*2.12].forEach((f,i)=>osc('sawtooth',f,ZC214.rise[0]-.6,E-ZC214.rise[0]+.5,.03,2.2,.06,{lp:420+i*60,wet:.7,det:i*9}));
  osc('sine',Kz.dr[0]*.9,E,2.6,.32,.01,2.5,{wet:.6});osc('sine',Kz.dr[0]*1.8,E+.02,2.2,.05,.01,2.1,{wet:1})}

// ---------------- play / skip / finish ----------------
function zc214Play(I){if(ZC214.run)return false;let S;try{S=zc214Build(I.z)}catch(e){console.warn('zc214 build',e);return false}
  S.I=I;ZC214.S=S;ZC214.run=true;ZC214.seen|=zc214Bit(I.z);IC151.on=true;document.body.classList.add('ic151d');S.fov0=cam.fov;zc214Layer(S);
  const L=S.live={t0:performance.now(),off:0,raf:0,ac:null};
  try{const AC=window.AudioContext||window.webkitAudioContext,ac=L.ac=new AC(),out=ac.createGain(),cp=ac.createDynamicsCompressor();out.gain.value=.9*Math.max(.15,Math.min(1,typeof SET!='undefined'&&SET.sfxV!=null?+SET.sfxV*1.4:1));out.connect(cp);cp.connect(ac.destination);L.out=out;if(ac.resume)ac.resume();zc214Score(ac,out,ac.currentTime+.05,S.Z)}catch(e){console.warn('zc214 sound',e)}
  try{if(typeof MU!='undefined'&&MU.g&&MU.a){L.mu=1;MU.g.gain.setTargetAtTime(0,MU.a.currentTime,.1)}}catch(_){}
  const onKey=e=>{if(!ZC214.run)return;e.stopImmediatePropagation();e.preventDefault();if(e.type=='keydown'&&/^(Escape|Enter| |Spacebar)$/.test(e.key))zc214Skip()};L.onKey=onKey;
  addEventListener('keydown',onKey,true);addEventListener('keyup',onKey,true);S.dom.skip.onclick=e=>{e.stopPropagation();zc214Skip()};
  S.dom.el.addEventListener('mousemove',()=>{S.dom.el.style.cursor='default';clearTimeout(L.cur);L.cur=setTimeout(()=>{if(S.dom)S.dom.el.style.cursor=''},1500)});
  const tick=now=>{if(!ZC214.run)return;L.raf=requestAnimationFrame(tick);zc214Seek(Math.max(L.off,(now-L.t0)/1000+L.off));
    try{if(MP&&MP.on&&party.length&&now-(L.pt||0)>500){L.pt=now;mpPresence(now)}}catch(_){}};
  L.raf=requestAnimationFrame(tick);return true}
function zc214Seek(t){const S=ZC214.S;if(!S)return;S.t=t;
  if(t<ZC214.cut){IC151.on=true;try{zc214Frame(S,t)}catch(e){console.warn('zc214 frame',e);ZC214.err=String(e&&e.stack||e);if(S.live)S.live.off+=ZC214.cut-t;t=ZC214.cut}}
  if(t>=ZC214.cut&&!S.back)zc214Back(S);
  zc214Dom(S,t);if(t>=ZC214.len)zc214End()}
function zc214Skip(){const S=ZC214.S,L=S&&S.live;if(!L)return;const t=(performance.now()-L.t0)/1000+L.off;if(t>=ZC214.skipT)return;L.off+=ZC214.skipT-t;
  try{if(L.out){L.out.gain.cancelScheduledValues(L.ac.currentTime);L.out.gain.setTargetAtTime(0,L.ac.currentTime,.12)}}catch(_){}}
// hand the game back (at the cut to black): everything shown is put back, the camera returns behind the hero, the loop runs again
function zc214Back(S){if(S.back)return;S.back=1;
  try{S.cast.forEach(C=>{if(C.m.parent)C.m.parent.remove(C.m)});S.cast=[]}catch(_){}   // models only: their kits may be shared, nothing disposed
  // our own Vharog: its materials are its own (freed, as 3810 frees its own Hydra); kit geometry may be shared, so only svOwn is
  try{const v=S.vhg;if(v){if(v.m.parent)v.m.parent.remove(v.m);const R=v.sv.R;R.mats.forEach(m=>m.dispose());R.glow.forEach(m=>m.dispose());R.root.traverse(o=>{if(o.geometry&&o.geometry.userData.svOwn)o.geometry.dispose()})}S.vhg=null}catch(_){}
  try{if(S.lgt&&S.lgt.parent)S.lgt.parent.remove(S.lgt);S.lgt=null}catch(_){}
  try{S.vm.forEach((v,o)=>{o.visible=v});S.vm.clear();S.lm.forEach((v,l)=>{l.intensity=v});S.lm.clear()}catch(e){console.warn('zc214 put back',e)}
  try{(S.fx||[]).forEach(o=>KQ.fx.push(o));S.fx=[]}catch(_){}
  try{(S.tags||[]).forEach(o=>{o.visible=true});S.tags=[];(S.foes||[]).forEach(e=>{if(e.m)e.m.visible=true});S.foes=[]}catch(_){}
  try{const B=S.boss;if(B&&!B.busy){const e=B.e,v=B.save,s=e.sv;e.m.position.copy(v.p);e.m.rotation.y=v.ry;e.m.visible=v.vis;if(e.hb)e.hb.visible=!!v.hb;s.trk=v.trk;s.tt=v.tt;s.aw=v.aw;
      if(s.R.mats)s.R.mats.forEach(m=>{if(m.userData.zc214o!=null){m.opacity=m.userData.zc214o;m.transparent=m.userData.zc214t;delete m.userData.zc214o;delete m.userData.zc214t}});try{svApply(e,0,performance.now())}catch(_){}}}catch(e){console.warn('zc214 boss back',e)}
  try{ren.domElement.style.filter='';cam.near=S.near0||.1}catch(_){}
  try{document.body.classList.remove('ic151d');cam.fov=S.fov0||58;cam.updateProjectionMatrix();snapCam();chunkVis();for(let n=0;n<40;n++)atmos(.05,performance.now())}catch(e){console.warn('zc214 back',e)}
  IC151.on=false;try{if(S.live&&S.live.mu&&typeof muVol=='function')muVol()}catch(_){}try{if(typeof K!='undefined')for(const k in K)K[k]=false}catch(_){}
  // the zone's title card, held back while the cinematic played
  setTimeout(()=>{try{const I=curIns();if(S.I&&I&&I.z===S.z)zt116Ins(I)}catch(_){}},500)}
function zc214End(){if(!ZC214.run)return;const S=ZC214.S,L=S&&S.live;ZC214.run=false;
  try{if(S&&!S.back)zc214Back(S)}catch(_){}
  try{if(L){cancelAnimationFrame(L.raf);removeEventListener('keydown',L.onKey,true);removeEventListener('keyup',L.onKey,true);clearTimeout(L.cur);
    if(L.ac){const ac=L.ac;try{L.out.gain.setTargetAtTime(0,ac.currentTime,.3)}catch(_){}setTimeout(()=>{try{ac.close()}catch(_){}},1500)}}}catch(_){}
  try{if(S&&S.dom)S.dom.el.remove()}catch(_){}ZC214.S=null}
// capture mode for tests: build, no sound, no clock; then zc214Seek(t) per frame
function zc214Cap(z){if(ZC214.run)return null;const T0=performance.now(),S=zc214Build(z);S.I=curIns();ZC214.S=S;ZC214.run=true;IC151.on=true;document.body.classList.add('ic151d');S.fov0=cam.fov;zc214Layer(S);S.dom.skip.style.display='none';
  return {ms:Math.round(performance.now()-T0),z,A:Object.keys(S.A).filter(k=>S.A[k]),cast:S.cast.map(C=>C.k),boss:S.boss?(S.boss.busy?'busy':'den'):null,hh:+S.hh.toFixed(2),vharog:!!S.vhg}}

// ---------------- when: the first arrival in the zone; the zone card waits for the end ----------------
{const f=insArrive;insArrive=function(I){const want=zc214Want(I);if(want)ZC214.hold=1;let r;try{r=f.apply(this,arguments)}finally{ZC214.hold=0}
  if(want){let ok=false;try{ok=zc214Play(I)}catch(e){console.warn('zc214',e)}if(!ok)try{zt116Ins(I)}catch(_){}}return r}}
{const f=zt116Ins;zt116Ins=function(){if(ZC214.hold||(ZC214.run&&!(ZC214.S&&ZC214.S.back)))return;return f.apply(this,arguments)}}
// saved per character, a bit per zone; older saves that already know a zone have seen it
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.zc214=ZC214.seen|0}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{ZC214.raw=s&&s.zc214!=null?(s.zc214|0):-1;ZC214.seen=ZC214.raw>0?ZC214.raw:0}catch(_){ZC214.seen=0}return r}}
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{if(ZC214.raw===-1){let m=0;for(const z of [2,3,4,5])if(zc214Known(z))m|=zc214Bit(z);
    try{const I=curIns();if(I&&ZC214.Z[I.z])m|=zc214Bit(I.z)}catch(_){}ZC214.seen=m;ZC214.raw=m}}catch(_){}return r}}
{const f=ccBegin;ccBegin=function(){ZC214.seen=0;ZC214.raw=0;return f.apply(this,arguments)}}
