// ================= v167 The Hilltop Ascent: obstacles, a faster mount =================
// The owner: "Add obstacles in the path during the chase. Make sure the obstacles' collision box is true to the object. Add
// rolling boulders, parts of the path that are skinnier, and logs. Make the speed of the mount 35% faster."
//  * The course (ch167Obs in 3160: seeded, the same for every co-op rider, between the broken stretches):
//    - Fallen logs: a trunk lying across the trail, the whole width (jump it) or from one side (jump it or ride round its end).
//    - Rolling boulders: one breaks off the mountain wall above the trail (a rumble, dust, a wobble), rolls across the trail and
//      off the outer lip into the drop. It is timed to cross your line as you arrive at full speed: steer round behind it, boost
//      past before it gets there, or ease off and let it pass.
//    - Narrow ledges: the outer part of the ledge has fallen away (carved out of the ground in 3160, dressed here with a broken
//      lip and a dark drop): keep to the mountain wall. Ride over the edge and you fall (like a broken stretch).
//  * Collision true to the object (ch167Hit*): the obstacle is tested as exactly the shape that is drawn (a log is a cylinder of
//    its radius between its two ends; a boulder a sphere of its radius at its real place and height; a narrow ledge its broken edge
//    line, ch167Edge, which is also where the lip is built) against the mount's own box (CH167.ml long, CH167.mw wide, from its
//    hooves R.y up to CH167.mh). A jump clears a log only if the hooves really pass over the trunk.
//  * Hitting a log or a boulder: a crash (no health is lost; the v164 rule stands): the mount stumbles to ×CH167.crashK speed for
//    CH167.crashT s (a boost still helps a little), which lets Skarrith close in. The log breaks apart; a boulder rolls on.
//  * Skarrith smashes through any log or boulder in its way (splinters and rock chips), so it never passes through them.
//  * Venom never lands on an obstacle or just before one (ch167Keep, used by 3250's ch153SpitPlan).
//  * Speed: every mount runs 35% faster (CH153V.spd 8.2 → 11.07). Skarrith's speed, its slow start and the steering are scaled
//    with it, so the chase keeps its balance (a run is ~85 s instead of ~115 s).
var CH167={ml:.85,mw:.4,mh:1.7,crashT:.95,crashK:.35,rockPre:.5,err:0,cue:{},mats:null};
// ---------------- the speed: everything that sets the pace, ×1.35 ----------------
CH153V.spd=+(8.2*1.35).toFixed(2);CH153V.slow0=+(6.4*1.35).toFixed(2);CH153V.lat=+(6.6*1.2).toFixed(2);
CH164.snV=[+(8.55*1.35).toFixed(2),+(8.85*1.35).toFixed(2)];CH164.farK=+(.14*1.35).toFixed(3);
// ---------------- where venom may not land ----------------
// [from, to] stretches of trail: each broken stretch with 3250's margins, each obstacle with a short one before and after
function ch167Keep(){if(ch167Keep.c)return ch167Keep.c;const L=ch153Course().gaps.map(g=>[g.s-g.len/2-CH164.gapB,g.s+g.len/2+CH164.gapA]);
  // (before a log 15: jumping a puddle there would land you on the log)
  ch167Obs().forEach(q=>{const e=ch167Ext(q);L.push([e[0]-(q.k=='log'?15:6),e[1]+3.5])});return ch167Keep.c=L.sort((a,b)=>a[0]-b[0])}
// ---------------- materials (shared, made once) ----------------
function ch167Mats(){if(CH167.mats)return CH167.mats;const mk=o=>{const m=new THREE.MeshLambertMaterial(o);m.userData.noFade135=1;return m};
  // the cut end of a log: pale wood with dark growth rings and a crack
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),R=ch153R(16707);x.fillStyle='#b89a6a';x.fillRect(0,0,128,128);
  for(let i=1;i<14;i++){x.strokeStyle='rgba(90,62,32,'+(.35+R()*.35).toFixed(2)+')';x.lineWidth=1+R()*1.5;x.beginPath();x.arc(64+R()*2,64+R()*2,i*4.4,0,7);x.stroke()}
  x.strokeStyle='#3a2410';x.lineWidth=7;x.beginPath();x.arc(64,64,61,0,7);x.stroke();x.strokeStyle='rgba(40,24,10,.8)';x.lineWidth=2;x.beginPath();x.moveTo(64,64);x.lineTo(64+40,64-22);x.stroke();
  const M={bark:mk({vertexColors:true,flatShading:true}),end:mk({map:new THREE.CanvasTexture(c)}),wood:mk({color:0x6a4a2a,flatShading:true}),
    moss:mk({color:0x46682e,flatShading:true}),rock:mk({vertexColors:true,flatShading:true}),chip:mk({color:0x8a6a40,flatShading:true})};
  M.end.userData.noFade135=1;return CH167.mats=M}
// ---------------- a fallen log: a trunk of radius r and length len along +x (centred), bark, cut or broken ends ----------------
// The trunk's surface stays within ±3% of r (the collision cylinder is the drawn trunk); branch stubs and roots stay off the trail.
function ch167LogModel(r,len,seed,stubA,stubB,rootA,brokeB){const M=ch167Mats(),R=ch153R(seed),g=new THREE.Group();g.userData.psNo=1;g.userData.noFade135=1;
  const geo=new THREE.CylinderGeometry(r,r,len,14,Math.max(2,Math.round(len*2)),true).rotateZ(Math.PI/2),p=geo.attributes.position,col=[],C=new THREE.Color();
  for(let i=0;i<p.count;i++){const X=p.getX(i),Y=p.getY(i),Z=p.getZ(i),a=Math.atan2(Z,Y),k=1+.03*Math.sin(a*5+X*1.7+seed)*Math.cos(X*2.3);p.setY(i,Y*k);p.setZ(i,Z*k);
    const ridge=.5+.5*Math.sin(a*9+Math.sin(X*.8)*1.2),top=Y/r;C.setHex(ridge>.75?0x3a2a1a:ridge>.3?0x5a4028:0x4a3420);if(top>.55&&R()<.5)C.lerp(new THREE.Color(0x4a6a30),.5);col.push(C.r,C.g,C.b)}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();const tr=new THREE.Mesh(geo,M.bark);tr.castShadow=true;tr.receiveShadow=true;tr.userData.noFade135=1;g.add(tr);
  // the ends: a sawn / snapped face (a broken end gets splinters instead)
  [[-1,0],[1,1]].forEach(([sd,j])=>{if(j&&brokeB){const sp=new THREE.Mesh(new THREE.ConeGeometry(r*.95,r*.9,9,1,true).rotateZ(-Math.PI/2),M.wood);sp.position.x=len/2+r*.45;tr.add(sp);
      for(let k=0;k<6;k++){const s2=new THREE.Mesh(new THREE.ConeGeometry(.05,.22+R()*.2,4).rotateZ(-Math.PI/2),M.wood);const a=k/6*6.283;s2.position.set(len/2+.08,Math.sin(a)*r*.6,Math.cos(a)*r*.6);tr.add(s2)}return}
    const e=new THREE.Mesh(new THREE.CircleGeometry(r*1.01,14),M.end);e.rotation.y=sd*Math.PI/2;e.position.x=sd*len/2;tr.add(e)});
  // the root plate at end A (into the mountain wall): a flattened disc of earth and roots
  if(rootA){const rp=new THREE.Mesh(new THREE.CylinderGeometry(r*2.1,r*1.8,.32,10).rotateZ(Math.PI/2),M.wood);rp.position.x=-len/2-.12;rp.castShadow=true;tr.add(rp);
    for(let k=0;k<7;k++){const a=k/7*6.283,rt=new THREE.Mesh(new THREE.ConeGeometry(.08,.7+R()*.5,4).rotateZ(Math.PI/2),M.wood);rt.position.set(-len/2-.4,Math.sin(a)*r*1.6,Math.cos(a)*r*1.6);tr.add(rt)}}
  // branch stubs, only near the ends (off the trail): stubA / stubB are their distances in from each end
  const stub=(x)=>{const b=new THREE.Mesh(new THREE.ConeGeometry(.08,.55,5),M.wood),a=(R()-.5)*1.2;b.position.set(x,Math.cos(a)*(r+.2),Math.sin(a)*(r+.2));b.rotation.x=a;tr.add(b)};
  if(stubA>0)stub(-len/2+stubA);if(stubB>0)stub(len/2-stubB);
  // moss on top
  for(let k=0;k<4;k++){const m=new THREE.Mesh(CH167.mossG||(CH167.mossG=new THREE.SphereGeometry(1,7,4)),M.moss);m.scale.set(.3+R()*.4,.05,.2+R()*.12);m.position.set((R()-.5)*len*.8,r*.99,(R()-.5)*r*.5);tr.add(m)}
  return g}
// ---------------- a boulder: a rough rock of mean radius r (its surface within ±4%: the collision sphere is r) ----------------
function ch167RockModel(r,seed){const M=ch167Mats(),R=ch153R(seed),geo=new THREE.IcosahedronGeometry(1,2),p=geo.attributes.position,col=[],C=new THREE.Color();
  const cols=[0x6a645a,0x7a7266,0x5a554c,0x847b6c];
  for(let i=0;i<p.count;i++){const v=new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i)).normalize(),k=1+.04*Math.sin(v.x*5+seed)*Math.sin(v.y*4.3+v.z*3.1+seed*.3);p.setXYZ(i,v.x*k*r,v.y*k*r,v.z*k*r);
    C.setHex(cols[(Math.abs(Math.floor(v.x*3+v.y*5+v.z*7+seed))%4)]);if(v.y>.6)C.lerp(new THREE.Color(0x56703a),.35);col.push(C.r,C.g,C.b)}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,M.rock);m.castShadow=true;m.receiveShadow=true;m.userData.psNo=1;m.userData.noFade135=1;return m}
// ---------------- a narrow ledge: the broken outer lip along the edge line, the dark drop beyond it ----------------
function ch167Ledge(P,q,i){const R=ch153R(8101+i*41),a=q.s-q.len/2,b=q.s+q.len/2,C=new THREE.Color(),L={p:[],c:[]},D={p:[],c:[]};
  const at=(s,o,y)=>{const t=P.at(s,o);return [t[0],t[2]+y,t[1]]},edge=s=>{const E=ch167Edge(Math.max(a+1e-3,Math.min(b-1e-3,s)));return E?E.o:P.hw(s)+.45};
  const tri=(B,p1,p2,p3,c1,c2,c3)=>{B.p.push(...p1,...p2,...p3);[c1,c2==null?c1:c2,c3==null?c1:c3].forEach(c=>{C.setHex(c);B.c.push(C.r,C.g,C.b)})};
  const quad=(B,p1,p2,p3,p4,ct,cb)=>{cb=cb==null?ct:cb;tri(B,p1,p2,p3,ct,ct,cb);tri(B,p1,p3,p4,ct,cb,cb)};
  const SL=[0x8a8262,0x7a7454,0x948a68,0x6c664c],RK=[0x3a352e,0x2e2a24,0x443e36],N=Math.max(4,Math.ceil(q.len/.5)),S=k=>a+(b-a)*k/N;
  // the lip: cracked slabs along the edge, tipped a little toward the drop, a hanging chunk under some of them
  for(let k=0;k<N;k++){const s0=S(k),s1=S(k+1),e0=edge(s0),e1=edge(s1),j=(R()-.5)*.05,dn=.06+R()*.12,c=SL[(R()*4)|0];
    const T=[at(s0,e0-.6,.015),at(s1,e1-.6,.015),at(s1,e1+j,.015-dn),at(s0,e0+j,.015-dn)];quad(L,T[0],T[3],T[2],T[1],c);
    quad(L,T[3],T[2],at(s1,e1+j,-.7),at(s0,e0+j,-.7),c,RK[k%3]);
    if(R()<.55){const m=(s0+s1)/2,e=edge(m),h=.25+R()*.35;quad(L,at(m-.18,e+.02,-.05),at(m+.18,e+.02,-.05),at(m+.18,e+.02,-.05-h),at(m-.18,e+.02,-.05-h),RK[(R()*3)|0])}}
  // the drop (unlit): dark across the fallen part (just above the old ground there), the broken face falling into black
  // the broken face under the lip, falling steeply into black (it hides the carved ground's slope just past the edge)
  for(let k=0;k<N;k++){const s0=S(k),s1=S(k+1),e0=edge(s0),e1=edge(s1);
    quad(D,at(s0,e0+.03,-.05),at(s1,e1+.03,-.05),at(s1,e1+.35,-1.6),at(s0,e0+.35,-1.6),0x2a231c,0x0c0a08);
    quad(D,at(s0,e0+.35,-1.6),at(s1,e1+.35,-1.6),at(s1,e1+1.1,-8),at(s0,e0+1.1,-8),0x0c0a08,0x020202)}
  // the ends of the break: the slanted faces where the ledge is whole again
  [[a,1],[b,-1]].forEach(([s,d])=>{const e=edge(s+d*1.4);quad(D,at(s,P.hw(s)+.45,-.05),at(s+d*1.4,e+.03,-.05),at(s+d*1.4,e+1.1,-8),at(s,P.hw(s)+1.2,-8),0x2a231c,0x020202)});
  const mk=(B,lit)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(B.c,3));geo.computeVertexNormals();
    const key=lit?'leL':'leD',M=CH167[key]||(CH167[key]=(()=>{const m=lit?new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}):new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:false,polygonOffset:true,polygonOffsetFactor:-2});m.userData.noFade135=1;return m})());
    const m=new THREE.Mesh(geo,M);m.castShadow=!!lit;m.receiveShadow=!!lit;m.userData.psNo=1;m.userData.noFade135=1;return m};
  const G=new THREE.Group();G.userData.psNo=1;G.userData.noFade135=1;G.add(mk(L,1),mk(D,0));return G}
// ---------------- building the course (once, with the level) ----------------
function ch167Build(S){if(S.ob)return S.ob;const P=S.P,root=S.root,O=[];S.ob=O;
  ch167Obs().forEach((q,i)=>{const hw=P.hw(q.s);
    if(q.k=='log'){const len=q.o1-q.o0,full=q.o0<-hw&&q.o1>hw,inner=q.o0<-hw,g=ch167LogModel(q.r,len,40+i*7,inner?.35:0,!inner?.35:(full?.3:0),inner,!full);
      const [x0,z0,h]=P.at(q.s,q.o0),[x1,z1]=P.at(q.s,q.o1);g.position.set((x0+x1)/2,h+q.r,(z0+z1)/2);g.rotation.y=Math.atan2(-(z1-z0),x1-x0);root.add(g);
      O.push({q,m:g,st:0})}
    else if(q.k=='rock'){const m=ch167RockModel(q.r,60+i*11);root.add(m);const b={q,m,st:0,o:0,y:0,t:0,rot:new THREE.Quaternion()};O.push(b);ch167RockHome(P,b)}
    else{root.add(ch167Ledge(P,q,i));[-1].forEach(()=>{const c=ch164CrackDecal(),[x,z,h]=P.at(q.s-q.len/2-2,P.hw(q.s)-.9);c.position.set(x,h+.05,z);c.rotation.y=P.yaw(q.s);c.scale.set(.55,1,.8);root.add(c)});O.push({q,st:0})}});
  return O}
// a boulder at rest, up on the mountain wall above its crossing
function ch167RockStart(P,q){return -P.hw(q.s)-6.2}
function ch167RockHome(P,b){const q=b.q;b.st=0;b.o=ch167RockStart(P,q);b.t=0;b.vy=0;b.hit=0;b.m.visible=true;b.m.scale.setScalar(1);ch167RockPut(P,b,0)}
// its height above the trail at o: on the wall it sits on the ground, on the trail on the trail, past the lip it falls (b.y)
function ch167RockPut(P,b,dt){const q=b.q,[x,z,h]=P.at(q.s,b.o),hw=P.hw(q.s);let y;
  if(b.st==3){b.vy-=22*dt;b.fy=(b.fy||0)+b.vy*dt;y=b.fy}
  else if(b.o<-hw){const gh=GH(x,z);y=Math.max(0,gh-h)+q.r}else y=q.r;
  b.y=y;b.m.position.set(x,h+y,z)}
// ---------------- each frame ----------------
function ch167Tick(dt,now){const S=CH153.S,R=CH153.R;if(!S||!R)return;const P=S.P,O=ch167Build(S),lead=ch164LeadS(),run=R.ph=='run';
  O.forEach(b=>{const q=b.q;
    if(q.k=='rock'){
      // the trigger: the leading rider is as far from the crossing as a full-speed rider covers while it rolls there
      if(b.st==0&&run&&lead>-1e8){const tCross=(q.off-ch167RockStart(P,q))/q.u+CH167.rockPre;if(lead>=q.s-CH153V.spd*tCross&&lead<q.s+2){b.st=1;b.t=0;
          try{const [x,z]=P.at(q.s,b.o);const p=new THREE.Vector3(x,b.m.position.y,z);burst(p,0x9a8a6a,14,1.4,1.4,.8);if(Math.abs(R.s-q.s)<40)svSnd('crack',1,.6)}catch(_){}
          ch167Cue('rock','🪨','Rolling boulder!','Steer clear — A / D',R)}}
      if(b.st==1){b.t+=dt;b.m.position.x+=Math.sin(b.t*60)*.02;if(b.t>=CH167.rockPre){b.st=2;try{if(Math.abs(R.s-q.s)<40)svSnd('heavy',1.1,.6)}catch(_){}}}
      else if(b.st==2||b.st==3){const hw=P.hw(q.s),o0=b.o;b.o+=q.u*dt;if(b.st==2&&b.o>hw+.35){b.st=3;b.fy=b.y;b.vy=1.2}
        // rolling: about the axis up × (the way it rolls)
        const [x0,z0]=P.at(q.s,o0),[x1,z1]=P.at(q.s,b.o),dx=x1-x0,dz=z1-z0,d=Math.hypot(dx,dz);if(d>1e-5){const ax=new THREE.Vector3(dz/d,0,-dx/d);b.m.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(ax,d/q.r))}
        const yb=b.y;ch167RockPut(P,b,dt);
        if(b.st==2){b.dT=(b.dT||0)-dt;if(b.dT<=0){b.dT=.12;try{burst(new THREE.Vector3(b.m.position.x,b.m.position.y-q.r*.8,b.m.position.z),0xa89878,3,.8,.6,.5)}catch(_){}}
          b.sT=(b.sT||0)-dt;if(b.sT<=0){b.sT=.28;try{const dd=Math.abs(R.s-q.s);if(dd<30)svSnd('step',.7*(1-dd/32),.55)}catch(_){}}
          if(yb-b.y>.25&&b.o>-hw-.3&&!b.land){b.land=1;try{shake(Math.abs(R.s-q.s)<20?.12:.04);svSnd('heavy',.9,.7)}catch(_){}}}
        if(b.st==3&&b.y<-30){b.st=4;b.m.visible=false}}
      // Skarrith smashes through a boulder on the trail
      if((b.st==0||b.st==1||b.st==2)&&b.o>-P.hw(q.s)-1&&R.sn&&Math.abs(R.sn.s-q.s)<q.r+1.2&&R.ph!='intro')ch167Smash(b,'rock')}
    else if(q.k=='log'){if(b.st==0&&R.sn&&R.ph!='intro'&&R.sn.s>q.s-q.r-1.3)ch167Smash(b,'log')}});
  if(!run||CH167.off)return;   // CH167.off: tests that measure something else ride without obstacles
  // the rider against each obstacle near it
  for(const b of O){const q=b.q;if(Math.abs(q.s-R.s)>(q.k=='nar'?q.len/2+2:6))continue;
    if(q.k=='log'&&b.st==0&&ch167HitLog(R,q)){ch167Crash(b,'log');break}
    if(q.k=='rock'&&b.st>=1&&b.st<=3&&!b.hit&&ch167HitRock(R,b)){b.hit=1;ch167Crash(b,'rock');break}}
  // a narrow ledge: the mount's centre past the broken edge, on the ground: you fall
  {const E=ch167Edge(R.s);if(E&&R.y<.15&&R.o>E.o+.1){ch153Die('fall',{s:R.s+.7,len:1.2,nar:1});if(R.dead)R.dead.o0=R.o;return}}
  // the cues as the first of each kind comes into view
  for(const b of O){const q=b.q,d=q.s-(q.k=='nar'?q.len/2:q.r)-R.s;if(d<0||d>R.v*1.3+4)continue;
    if(q.k=='log')ch167Cue('log','🪵','Fallen log — JUMP!','Space'+(q.o0>-P.hw(q.s)&&q.o1>P.hw(q.s)||q.o1<P.hw(q.s)?' · or ride round it':''),R);
    if(q.k=='nar')ch167Cue('nar','⚠','The ledge narrows!','Keep to the mountain wall',R);break}}
// the mount's box against a log (a cylinder across the trail: its axis at height r over s, from o0 to o1)
function ch167HitLog(R,q){if(R.o+CH167.mw<q.o0||R.o-CH167.mw>q.o1)return false;
  const cs=Math.max(R.s-CH167.ml,Math.min(R.s+CH167.ml,q.s)),cy=Math.max(R.y,Math.min(R.y+CH167.mh,q.r)),ds=cs-q.s,dy=cy-q.r;return ds*ds+dy*dy<q.r*q.r}
// the mount's box against a boulder (a sphere of radius r where it is now)
function ch167HitRock(R,b){const q=b.q,cs=Math.max(R.s-CH167.ml,Math.min(R.s+CH167.ml,q.s)),co=Math.max(R.o-CH167.mw,Math.min(R.o+CH167.mw,b.o)),cy=Math.max(R.y,Math.min(R.y+CH167.mh,b.y));
  const ds=cs-q.s,dl=co-b.o,dy=cy-b.y;return ds*ds+dl*dl+dy*dy<q.r*q.r}
// a crash: the mount stumbles (health untouched); the log breaks apart, a boulder rolls on
function ch167Crash(b,k){const R=CH153.R;R.crash=CH167.crashT;R.crashes=(R.crashes||0)+1;R.v=Math.min(R.v,CH153V.spd*CH167.crashK);R.bst=0;
  try{flash('rgba(255,150,60,.5)');shake(ch157Calm()?.12:.32);svSnd('heavy',1.3,.85);svSnd(k=='log'?'crack':'step',1.2,.7);burst(pl.position.clone().add(new THREE.Vector3(0,.8,0)),k=='log'?0x8a6a40:0x8a8274,22,2,1.6,.7)}catch(_){}
  try{pickup({ic:'💥',t:k=='log'?'Crashed into a log!':'Hit by a boulder!',col:'#ffb060',sub:'Skarrith is gaining — '+(k=='log'?'jump the logs (Space)':'steer clear (A / D)')})}catch(_){}
  if(k=='log')ch167Smash(b,'log',1)}
// broken apart (by Skarrith, or by a crash): splinters or rock chips; gone until the chase starts again
function ch167Smash(b,k,quiet){if(k=='log'){if(b.st)return;b.st=1}else{if(b.st==4||b.st==5)return;b.st=5}const m=b.m;if(!m)return;
  const p=new THREE.Vector3();m.getWorldPosition(p);m.visible=false;
  try{burst(p.clone().add(new THREE.Vector3(0,.3,0)),k=='log'?0x6a4a2a:0x7a7266,30,2.6,2.4,.9);burst(p,k=='log'?0x3a2a1a:0x5a554c,14,1.6,1.2,1);
    const R=CH153.R,d=R?Math.abs(R.s-b.q.s):99;if(!quiet&&d<36)svSnd(k=='log'?'crack':'heavy',1.2*(1-d/40),k=='log'?.9:.6)}catch(_){}}
// a cue the first time each kind of obstacle comes up (per chase attempt: the first one only)
function ch167Cue(k,ic,t,sub,R){if(CH167.cue[k]===R)return;CH167.cue[k]=R;try{pickup({ic,t,col:'#ffd27a',sub})}catch(_){}}
// ---------------- wiring ----------------
// a crash slows the mount through the chase's own speed rule (3250: want = spd × ch157Mul × venom)
{const f=ch157Mul;ch157Mul=function(R){const m=f.apply(this,arguments);return R&&R.crash>0?m*CH167.crashK:m}}
{const f=ch153Build;ch153Build=function(){const S=f.apply(this,arguments);try{ch167Build(S)}catch(e){if(!CH167.err++)console.error('v167 build',e)}return S}}
{const f=ch153Reset;ch153Reset=function(){const r=f.apply(this,arguments);try{const S=CH153.S;CH167.cue={};(S.ob||[]).forEach(b=>{if(b.q.k=='rock')ch167RockHome(S.P,b);else if(b.q.k=='log'){b.st=0;b.m.visible=true}})}catch(e){if(!CH167.err++)console.error('v167 reset',e)}return r}}
{const f=ch153Tick;ch153Tick=function(dt,now){const R=CH153.R;if(R&&R.crash>0)R.crash=Math.max(0,R.crash-dt);const r=f.apply(this,arguments);
  try{ch167Tick(dt,now);
    // falling off a narrow ledge: down and out over the drop (3250 drifts a gap's fall toward the middle)
    const R2=CH153.R;if(R2&&R2.ph=='dead'&&R2.dead&&R2.dead.g&&R2.dead.g.nar&&R2.dead.o0!=null)R2.o=R2.dead.o0+R2.dead.t*1.6;
    // a stumble: the mount pitches and dust flies
    if(R2&&R2.crash>0&&typeof mModel!='undefined'&&mModel){const k=R2.crash/CH167.crashT;mModel.rotateX(Math.sin(k*Math.PI)*.22);if(Math.random()<dt*25)burst(gY(pl.position,.2),0xa89878,2,1,.8,.5)}}
  catch(e){if(!CH167.err++)console.error('v167 tick',e)}return r}}
