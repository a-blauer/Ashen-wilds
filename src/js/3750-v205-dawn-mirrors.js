// ================= v205 The Citadel III · The Dawn Mirrors: bring the sunrise to the Citadel and open the Eclipse Door =================
// The owner: "For instance 3 think of something yourself that would fit the zone and have it be a meaningful last quest step before
// the epic final boss." The court has lived under a blood eclipse for an age; Lord Vaelric's den is shut by the Eclipse Door, a
// seal of black sun that only true sunlight burns. Before the door lies the old Sun Court of the keep, from the days before the
// vampires: a sunwell lens on a pillar that still catches one thin shaft of dawn through the clouds, and three empty mirror stands.
//  * Cheddar (a second copy of the model) waits in the Sun Court and tells the story (XR.dm205): the court tore the three Dawn
//    Mirrors down and hid them in blood shrines across III; take them back.
//  * The shrines (dm205Plan: off the road at 30 / 56 / 82% of III's road, like the sigils of v145): a mirror sealed in a cocoon of
//    blood on a dais, bone stakes and banners round it; its Mirror-Warden (an elite Crimson Executioner, Nosferatu or Blood
//    Magister, DM205.W) rises when you come near. Slay it and the cocoon bursts; F takes the mirror (quest item).
//  * The Sun Court (dm205Court, a fixed layout in the clearing's frame): F at an empty stand mounts a mirror. With all three
//    mounted, F at a mirror turns it an eighth (DM205.dirs). The lens throws its beam one way; a Dawn Mirror gathers the light
//    that reaches it and casts it the way it faces. Lead the beam lens → all three mirrors → the door's seal. The beam burns any
//    creature of the court that crosses it.
//  * Dawnbreak: the beam strikes the seal; the black sun burns away, Vaelric speaks, the light floods the court and the door
//    opens on his den (F: the Den). Afterwards the beam keeps shining (III's way to the Den stays lit).
// State in CQ205.c3: st 0 · 1 met · 2 all mounted · 3 the dawn · 4 through; fd / cl / got / mnt masks; rot[3] each mirror's facing.
var DM205={S:null,C:null,lit:0,err:0,tab:'hi',beams:[],W:[{en:'executioner',n:'Mirror-Warden Ysolde',t:'the Crimson Executioner'},{en:'nosferatu',n:'Mirror-Warden Orlaith',t:'the Nosferatu'},{en:'vampm',n:'Mirror-Warden Casimir',t:'the Blood Magister'}],
  dirs:[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]],see:24,lv:51,g:[null,null,null],dawn:0,dk:0};
// the court's layout in the clearing's frame (a along the way out, b across): the lens, the three stands, the door's seal
function dm205Court(){if(dm205Court.c)return dm205Court.c;const F=cq205F(2),W=(a,b)=>{const [x,z]=F.W2(a,b);return {a,b,x,z,y:GH(x,z)}};
  const R={F,lens:W(-8,-7),ldir:2,st:[W(-8,2),W(0,-6),W(6,0)],door:W(F.reach+.5,0),seal:W(F.reach-.6,0),ched:W(-3,4.5)};
  R.solve=[7,1,0];R.start=[3,5,4];return dm205Court.c=R}
// a direction index → a world direction (in the frame)
function dm205Dir(i){const F=cq205F(2),d=DM205.dirs[((i%8)+8)%8],l=Math.hypot(d[0],d[1]);const a=d[0]/l,b=d[1]/l;return [F.fx*a+F.lx*b,F.fz*a+F.lz*b]}
// ---------------- the shrines' places (a pure function of the map data) ----------------
function dm205Plan(){if(dm205Plan.c)return dm205Plan.c;const I=cq205I(2),P=I.path,N=P.length,DW=MAP.DW,F=cq205F(2);
  const ok=(x,z,m)=>{const X=Math.round(x),Z=Math.round(z);if(X<1||Z<1||X>=W-1||Z>=H-1)return false;const t=MAP[Z]&&MAP[Z][X];if(!t||t=='#'||t=='r'||t=='~'||t=='H')return false;const J=insAt(X,Z);if(!J||J.g!==I.g)return false;return DW[Z*W+X]<-(m==null?1:m)};
  const tan=i=>{const a=P[Math.max(0,i-3)],b=P[Math.min(N-1,i+3)];let dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;return [dx/L,dz/L]};
  const avoid=[[I.en[0],I.en[1],20],[F.x,F.z,24]].concat(typeof cs164Avoid=='function'?cs164Avoid(I,16):(I.cl||[]).map(c=>[c[0],c[1],16])),fr=[.3,.56,.82],R={sh:[null,null,null],keep:[]};
  for(const T of [{m:2.4,sep:30,av:1},{m:1.6,sep:22,av:.75},{m:1.1,sep:14,av:.5}])for(let j=0;j<3;j++){if(R.sh[j])continue;const ix=Math.round((N-1)*fr[j]),sd=j%2?-1:1;let got=null;
    for(const b of [12,10,14,9,16,7])for(const side of [sd,-sd])for(const da of [0,6,-6,12,-12]){if(got)break;const k=Math.max(0,Math.min(N-1,ix+da)),p=P[k],t=tan(k),x=p[0]-t[1]*b*side,z=p[1]+t[0]*b*side;
      if(!ok(x,z,T.m)||!avoid.every(([px,pz,r])=>Math.hypot(x-px,z-pz)>=r*T.av)||!R.sh.every(o=>!o||Math.hypot(x-o.x,z-o.z)>=T.sep))continue;got={x:Math.round(x*2)/2,z:Math.round(z*2)/2,i:j,ry:Math.atan2(p[0]-x,p[1]-z)}}
    if(got)R.sh[j]=got}
  for(let j=0;j<3;j++)if(!R.sh[j]){const ix=Math.round((N-1)*fr[j]),p=P[ix],t=tan(ix);R.sh[j]={x:p[0]-t[1]*5,z:p[1]+t[0]*5,i:j,ry:0,fb:1}}
  R.sh.forEach(o=>R.keep.push([o.x,o.z,5]));R.keep.push([F.x,F.z,15]);return dm205Plan.c=R}
// roaming groups stay away from the shrines and out of the Sun Court
{const f=rosterBuild;rosterBuild=function(r){const o=f.apply(this,arguments);try{if(r===insG(5,2)&&ROST.r===r){const R=dm205Plan(),L=R.sh.map(c=>[c.x,c.z,14]).concat([[cq205F(2).x,cq205F(2).z,20]]);
    ROST.slots=ROST.slots.filter(s=>!(s.wild&&L.some(q=>Math.hypot((s.hx==null?s.x:s.hx)-q[0],(s.hz==null?s.z:s.hz)-q[1])<q[2])))}}catch(e){console.warn('v205 mirrors roster',e)}return o}}
// ---------------- models ----------------
function dm205MirrorG(){return dt168Group('CQ205|mir',k=>{const P=(geo,t,col,x,y,z,rx,ry,rz,sx,sy,sz)=>dt168P(k,geo,t,col,dt168Mx(x,y,z,rx,ry,rz,sx,sy,sz));
    P(dt168Geo('dm_rim',()=>new THREE.TorusGeometry(.72,.08,6,20)),'m',0xb8903a,0,0,0);P(dt168Geo('dm_disc',()=>new THREE.CylinderGeometry(.66,.66,.06,20)),'m',0xd8d0c0,0,0,0,Math.PI/2,0,0);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;P(dt168Geo('dm_ray',()=>new THREE.ConeGeometry(.07,.32,4)),'m',0xc8a048,Math.cos(a)*.92,Math.sin(a)*.92,0,0,0,a-Math.PI/2)}
    P(dt168Geo('dm_gem',()=>new THREE.OctahedronGeometry(.16,0)),'g',0xfff0b0,0,0,.06)},{m:{n:.08,sd:221}})}
function dm205Stand(){return dt168Group('CQ205|stand',k=>{const P=(geo,t,col,x,y,z,rx,ry,rz,sx,sy,sz)=>dt168P(k,geo,t,col,dt168Mx(x,y,z,rx,ry,rz,sx,sy,sz));
    P(dt168Lathe([[0,0],[.85,0],[.85,.25],[.7,.32],[.42,.5],[.3,1.2],[.36,1.3],[.2,1.4],[0,1.4]],8),'c',0x6a6260,0,0,0);
    [-1,1].forEach(s=>P(dt168Geo('dm_fork',()=>svTube([[0,0,0],[.25,.4,0],[.82,.9,0],[.86,1.4,0]],[.07,.06,.06,.05],5)),'m',0x8a6a30,0,1.35,0,0,s>0?0:Math.PI,0))},{c:{g:[1,.3],n:.12,m:[0x2a3a24,.25,.6],sd:222},m:{n:.08,sd:223}})}
function dm205Lens(){return dt168Group('CQ205|lens',k=>{const P=(geo,t,col,x,y,z,rx,ry,rz,sx,sy,sz)=>dt168P(k,geo,t,col,dt168Mx(x,y,z,rx,ry,rz,sx,sy,sz));
    P(dt168Lathe([[0,0],[1.1,0],[1.1,.4],[.8,.55],[.55,.7],[.5,5.6],[.7,5.8],[.85,6.1],[0,6.1]],10),'c',0x7a7268,0,0,0);
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;P(dt168BBox(.08,4.6,.08,.02),'c',0x5a524c,Math.sin(a)*.5,3.15,Math.cos(a)*.5)}
    P(dt168Geo('dm_lr',()=>new THREE.TorusGeometry(.95,.1,6,22)),'m',0xb8903a,0,7.0,0,0,0,0);[-1,1].forEach(s=>P(dt168Geo('dm_la',()=>svTube([[0,0,0],[.3,.4,0],[.9,.9,0]],[.08,.07,.06],5)),'m',0x8a6a30,0,6.1,0,0,s>0?0:Math.PI,0));
    P(dt168Geo('dm_lg',()=>new THREE.SphereGeometry(.85,14,10)),'g',0xfff2c0,0,7.0,0,0,0,0,1,1,.45)},{c:{g:[2,.3],n:.12,m:[0x2a3a24,.3,.6],sd:224},m:{n:.08,sd:225}})}
function dm205Shrine(i){return dt168Group('CQ205|shr',k=>{const P=(geo,t,col,x,y,z,rx,ry,rz,sx,sy,sz)=>dt168P(k,geo,t,col,dt168Mx(x,y,z,rx,ry,rz,sx,sy,sz));
    P(dt168Lathe([[0,0],[2.2,0],[2.2,.25],[1.9,.35],[1.9,.5],[0,.5]],12),'c',0x3a3036,0,0,0);
    for(let j=0;j<5;j++){const a=j/5*Math.PI*2;P(dt168Geo('dm_stk',()=>svHorn(.09,1.8,0,.35,5,4)),'c',0xcfc4a8,Math.sin(a)*2.0,.4,Math.cos(a)*2.0,-Math.PI/2+.25,a,0);k.S('',0x5e0a16,Math.sin(a)*2.05,1.9,Math.cos(a)*2.05,.45,1.1,a,0,j);
      P(dt168Geo('dm_cdl',()=>new THREE.CylinderGeometry(.05,.06,.25,5)),'c',0xe0d8c0,Math.sin(a+.6)*1.6,.62,Math.cos(a+.6)*1.6);P(dt168Geo('dm_fl',()=>new THREE.ConeGeometry(.04,.12,4)),'g',0xff9a40,Math.sin(a+.6)*1.6,.82,Math.cos(a+.6)*1.6)}},{c:{g:[1.2,.3],n:.14,sd:226}})}
function dm205Cocoon(){const g=new THREE.Group(),m=new THREE.Mesh(svG('dm_coc',()=>svLump(1,1,.28,2261)),new THREE.MeshStandardMaterial({color:0x4a0a12,roughness:.35,metalness:.1,flatShading:true,emissive:0x2a0206}));m.scale.set(1,1.35,.8);m.position.y=1.5;g.add(m);
  const vm=new THREE.MeshBasicMaterial({color:0xc01020});for(let i=0;i<7;i++){const a=i/7*Math.PI*2,v=new THREE.Mesh(svG('dm_cv'+(i%3),()=>svTube([[0,0,0],[.15,.5,.1],[.05,1.1,.0],[.2,1.7,-.1]],.035,4)),vm);v.position.set(Math.cos(a)*.75,.6,Math.sin(a)*.62);v.rotation.y=-a;g.add(v)}
  const gl=kqSpr(0xff2030,2.4);gl.position.y=1.5;g.add(gl);g.userData.m=m;return g}
// a beam segment: a bright core and a soft glow (cylinders along +z, scaled to length)
function dm205BeamMesh(){const G=DM205.bg||(DM205.bg=(()=>{const g=new THREE.CylinderGeometry(1,1,1,8,1,true);g.translate(0,.5,0);g.rotateX(Math.PI/2);return g})());
  const core=new THREE.Mesh(G,new THREE.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})),glow=new THREE.Mesh(G,new THREE.MeshBasicMaterial({color:0xffc060,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  const g=new THREE.Group();core.scale.set(.09,.09,1);glow.scale.set(.32,.32,1);g.add(core,glow);[core,glow].forEach(q=>{q.userData.lpsSkip=1;q.renderOrder=4});g.userData.c=core;g.userData.g=glow;scene.add(g);return g}
// ---------------- building the court and the shrines ----------------
function dm205Build(){if(DM205.S)return DM205.S;const R=dm205Court(),F=R.F,S={st:[],sh:[],beams:[]};DM205.S=S;
  // the Eclipse Door
  const G=cq205Gatehouse({kind:'eclipse'}),gs={F,a:F.reach+.5,x:R.door.x,z:R.door.z,ry:Math.atan2(-F.fx,-F.fz),y:F.y0};G.g.position.set(gs.x,gs.y-.05,gs.z);G.g.rotation.y=gs.ry;scene.add(G.g);G.spot=gs;cq205PlaceLights(G);
  try{G.cleared=cq205ClearFoot(gs,G.dims)}catch(_){}G.tiles=cq205FootTiles(gs,G.dims);G.tiles.T.forEach(k=>CBLK.add(k));S.door=G;
  // the court's flagstones (a pale disc with a sun carved in it)
  const fl=new THREE.Mesh(new THREE.CircleGeometry(11,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:dm205CourtTex(),color:0xc8b890,transparent:true,opacity:.5,depthWrite:false,fog:true,polygonOffset:true,polygonOffsetFactor:-4}));
  const [cx,cz]=F.W2(-1,-1);fl.position.set(cx,GH(cx,cz)+.05,cz);fl.rotation.y=Math.atan2(F.fx,F.fz);fl.userData.lpsSkip=1;scene.add(fl);S.floor=fl;
  // the lens on its pillar, the shaft of dawn into it
  const L=dm205Lens();L.position.set(R.lens.x,R.lens.y,R.lens.z);scene.add(L);S.lens=L;CBLK.add(Math.round(R.lens.z)*W+Math.round(R.lens.x));
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(.5,1.6,60,10,1,true),new THREE.MeshBasicMaterial({color:0xffe8b0,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  sh.position.set(R.lens.x,R.lens.y+7+30,R.lens.z);sh.userData.lpsSkip=1;sh.renderOrder=3;scene.add(sh);S.shaft=sh;
  S.ll=new THREE.PointLight(0xffe0a0,1.4,12,1.5);S.ll.position.set(R.lens.x,R.lens.y+6.5,R.lens.z);scene.add(S.ll);
  // the stands and their mirrors (a turning group on top)
  R.st.forEach((p,i)=>{const o=dm205Stand();o.position.set(p.x,p.y,p.z);scene.add(o);CBLK.add(Math.round(p.z)*W+Math.round(p.x));const turn=new THREE.Group();turn.position.y=2.3;o.add(turn);const m=dm205MirrorG();turn.add(m);
    const gl=kqSpr(0xfff0b0,2.2);gl.material=gl.material.clone();gl.material.opacity=0;gl.position.y=2.3;o.add(gl);S.st.push({o,turn,m,gl,i,yaw:null})});
  // the shrines (each with its cocoon and the mirror inside)
  dm205Plan().sh.forEach((p,i)=>{const o=dm205Shrine(i);o.position.set(p.x,GH(p.x,p.z),p.z);o.rotation.y=p.ry;scene.add(o);const c=dm205Cocoon();o.add(c);const mr=dm205MirrorG();mr.position.y=1.5;mr.rotation.x=-.25;mr.scale.setScalar(.8);o.add(mr);
    const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.2,.6,30,8,1,true),new THREE.MeshBasicMaterial({color:0xff3040,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));beacon.position.y=15;beacon.userData.lpsSkip=1;o.add(beacon);
    S.sh.push({o,c,mr,beacon,i,x:p.x,z:p.z})});
  // Cheddar in the court
  try{const C=chd132Model({game:true});C.root.scale.setScalar((typeof CHQ132_SC!='undefined'?CHQ132_SC:1.1)*1.12);C.root.userData.psNo=1;C.root.userData.noFarCull=1;C.root.position.set(R.ched.x,R.ched.y,R.ched.z);C.root.rotation.y=Math.atan2(R.lens.x-R.ched.x,R.lens.z-R.ched.z);scene.add(C.root);DM205.C=C}catch(e){console.error('v205 cheddar III',e)}
  dm205Sync();return S}
function dm205CourtTex(){if(DM205.ct)return DM205.ct;const N=512,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),C=N/2;x.strokeStyle='#fff';x.fillStyle='#fff';
  const circ=(r,w)=>{x.lineWidth=w;x.beginPath();x.arc(C,C,r,0,Math.PI*2);x.stroke()};circ(250,6);circ(236,2);circ(120,4);circ(70,3);
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;x.lineWidth=i%2?2:5;x.beginPath();x.moveTo(C+Math.cos(a)*126,C+Math.sin(a)*126);x.lineTo(C+Math.cos(a)*(i%2?190:230),C+Math.sin(a)*(i%2?190:230));x.stroke()}
  for(let r=0;r<6;r++)for(let i=0;i<24;i++){const a=(i+(r%2)*.5)/24*Math.PI*2,rr=140+r*16;x.globalAlpha=.25;x.beginPath();x.arc(C+Math.cos(a)*rr,C+Math.sin(a)*rr,7,0,Math.PI*2);x.stroke()}x.globalAlpha=1;
  return DM205.ct=new THREE.CanvasTexture(c)}
// ---------------- state → scene ----------------
function dm205Sync(){const S=DM205.S;if(!S)return;const C=CQ205.c3,R=dm205Court(),done=cq205Done(3);
  S.sh.forEach(s=>{const cl=C.cl&(1<<s.i)||done||C.st>=2,tk=(C.got|C.mnt)&(1<<s.i)||done||C.st>=2;s.c.visible=!cl;s.mr.visible=cl&&!tk;s.beacon.visible=!tk;s.beacon.material.color.setHex(cl?0xffe0a0:0xff3040)});
  S.st.forEach(s=>{const on=C.mnt&(1<<s.i)||done;s.m.visible=!!on;const r=done?R.solve[s.i]:C.rot[s.i];const [dx,dz]=dm205Dir(r);s.yaw=Math.atan2(dx,dz);s.turn.rotation.y=s.yaw});
  // the door: open once the dawn has come
  const D=S.door;if(done||C.st>=3){D.doors.forEach((d,i)=>d.rotation.y=(i?-1:1)*1.25);if(D.seal)D.seal.g.visible=false;D.light.intensity=1.6;D.haze.material.opacity=.6;D.pass.material.color.setHex(0x6a5030);D.tiles.D.forEach(k=>CBLK.add(k))}
  else{D.doors.forEach(d=>d.rotation.y=0);if(D.seal){D.seal.g.visible=true;D.seal.sig.material.opacity=.95;D.seal.rings.forEach(r=>{r.on=1;r.m.visible=true;r.m.material.opacity=.85});D.seal.chains.forEach(c=>c.visible=true)}D.light.intensity=0;D.haze.material.opacity=0;D.pass.material.color.setHex(0x050203)}
  dm205Trace()}
// ---------------- the beam: lens → mirrors (in the light) → wherever it ends ----------------
function dm205Trace(){const S=DM205.S;if(!S)return;const C=CQ205.c3,R=dm205Court(),F=R.F,done=cq205Done(3)||C.st>=3,pts=[],lit=[0,0,0];let hitDoor=false;
  let p={x:R.lens.x,z:R.lens.z},d=dm205Dir(R.ldir),from=-1;pts.push([p.x,p.z]);
  for(let n=0;n<5;n++){// the first stand (mounted, not the one we leave) within .95 of the ray ahead
    let best=null,bt=99;R.st.forEach((s,i)=>{if(i===from||!(C.mnt&(1<<i))&&!done)return;const vx=s.x-p.x,vz=s.z-p.z,t=vx*d[0]+vz*d[1];if(t<.5)return;const off=Math.abs(vx*d[1]-vz*d[0]);if(off<.95&&t<bt){bt=t;best=i}});
    // the door's seal: the plane at a = reach - .6, |b| < 3.2
    const [pa,pb]=F.L2(p.x,p.z),da=d[0]*F.fx+d[1]*F.fz,db=d[0]*F.lx+d[1]*F.lz;let td=99;if(da>.05){const t=(F.reach-.6-pa)/da,b=pb+db*t;if(t>.5&&Math.abs(b)<3.2)td=t}
    // the edge: the first blocked tile along the ray
    let te=30;for(let t=1;t<30;t+=.5){const x=p.x+d[0]*t,z=p.z+d[1]*t,X=Math.round(x),Z=Math.round(z);if(solid(X,Z)&&!CBLK.has(Z*W+X)||MAP.DW[Z*W+X]>-.2||Math.hypot(x-F.x,z-F.z)>F.reach+1){te=t;break}}
    if(best!=null&&bt<Math.min(td,te)){const s=R.st[best];pts.push([s.x,s.z]);lit[best]=1;from=best;p={x:s.x,z:s.z};d=dm205Dir(done?R.solve[best]:C.rot[best]);continue}
    if(td<te){pts.push([p.x+d[0]*td,p.z+d[1]*td]);hitDoor=true;break}
    pts.push([p.x+d[0]*te,p.z+d[1]*te]);break}
  DM205.lit=lit.filter(Boolean).length;DM205.pts=pts;DM205.door=hitDoor;
  // draw it
  while(S.beams.length<pts.length-1)S.beams.push(dm205BeamMesh());S.beams.forEach((b,i)=>{if(i>=pts.length-1){b.visible=false;return}const a=pts[i],c=pts[i+1],ya=i===0?R.lens.y+7:GH(a[0],a[1])+2.3,yb=GH(c[0],c[1])+(i===pts.length-2&&hitDoor?4.2:2.3);
    const A=new THREE.Vector3(a[0],ya,a[1]),B=new THREE.Vector3(c[0],yb,c[1]);b.position.copy(A);b.lookAt(B);b.scale.set(1,1,A.distanceTo(B));b.visible=true;b.userData.A=A;b.userData.B=B});
  S.st.forEach(s=>{s.gl.material.opacity=lit[s.i]?.9:0});
  if(!done&&C.st===2&&hitDoor&&DM205.lit>=3)dm205Dawn(true)}
// ---------------- actions ----------------
function dm205Take(i,own){const C=CQ205.c3;if(C.got&(1<<i)||C.mnt&(1<<i))return;C.got|=1<<i;C.cl|=1<<i;CQ205.trkK='';dm205Sync();svSnd('bell',.7,1.2);
  pickup({ic:'🌞',t:'Dawn Mirror',col:'#ffe8a0',sub:'Quest item · '+cq205Bits(C.got|C.mnt)+' of 3 · mount them on the stands of the Sun Court'});if(own!==false&&typeof co205Mir=='function')co205Mir('t',i)}
function dm205Mount(i,own){const C=CQ205.c3;if(!(C.got&(1<<i))||C.mnt&(1<<i))return;C.got&=~(1<<i);C.mnt|=1<<i;CQ205.trkK='';const R=dm205Court();C.rot[i]=R.start[i];
  if(C.mnt===7&&C.st<2){C.st=2;say('🐭 Cheddar: “All three! Now turn them — each one throws the light the way it faces. Lead the beam over all three mirrors and onto the door.”')}
  dm205Sync();svSnd('heavy',.6,1.3);try{const s=DM205.S.st[i];burst(gY(s.o.position,2.3),0xffe0a0,30,1.2,1,.6)}catch(_){}if(own!==false&&typeof co205Mir=='function')co205Mir('m',i)}
function dm205Turn(i,own,to){const C=CQ205.c3;if(!(C.mnt&(1<<i))||C.st>=3)return;const from=C.rot[i]|0;C.rot[i]=to!=null?to&7:(from+1)%8;const S=DM205.S,s=S.st[i];CQ205.trkK='';
  try{dg165Snd('grind',.6,1.4)}catch(_){svSnd('heavy',.5,1.4)}const [dx,dz]=dm205Dir(C.rot[i]),y1=Math.atan2(dx,dz),y0=s.turn.rotation.y;let t=0;
  kqFx({tick(dt){t+=dt||0;const k=svEase.io(Math.min(1,t/.35));s.turn.rotation.y=y0+svAng(y1-y0)*k;return t<.35},end(){s.turn.rotation.y=y1;dm205Trace()}});if(own!==false&&typeof co205Mir=='function')co205Mir('r',i,C.rot[i])}
// the dawn: the beam on the seal, the black sun burns away, Vaelric speaks, the door opens
function dm205Dawn(own){const C=CQ205.c3;if(C.st>=3)return;C.st=3;CQ205.trkK='';DM205.dawn=1;const D=DM205.S.door,p=new THREE.Vector3();D.seal.g.getWorldPosition(p);
  cq205Card('The Citadel · Main Quest','Dawnbreak','For the first time in an age, the sun touches the Citadel','');svSnd('bell',1,.5);shake(.4);try{flash('rgba(255,230,180,.45)')}catch(_){}
  let t=0;const sg=D.seal;kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/3);sg.sig.material.color.setRGB(1,.7+.3*k,.4+.6*k);sg.rings.forEach((r,i)=>{if(k>(i+1)/5&&r.on)gg205BreakRingOf(sg,r,p)});if(Math.random()<.6)burst(p.clone().add(new THREE.Vector3((Math.random()-.5)*5,(Math.random()-.5)*5,0)),0xffe0a0,2,1,1,.6);return t<3},
    end(){burst(p,0xfff0c0,140,6,3,1.2);svSnd('crack',1.3,.5);sg.g.visible=false;cq205After(.6,()=>{let u=0;svSnd('heavy',1.1,.45);try{dg165Snd('grind',1,.5)}catch(_){}kqFx({tick(dt){u+=dt||0;const k=svEase.io(Math.min(1,u/4));D.doors.forEach((d,i)=>d.rotation.y=(i?-1:1)*1.25*k);D.light.intensity=1.6*k;D.haze.material.opacity=.6*k;return u<4},end(){}})})}});
  cq205After(1.4,()=>say('🩸 A voice like a bell under water fills the court: “Who brings the sun into my house?” Lord Vaelric. “Come down, then, little light. Come down and burn.”'));
  cq205After(6,()=>say('🐭 Cheddar: “I’ll… wait here. Someone has to tell Duskhold how this ends. Go — and give him a sunrise he won’t forget.”'));
  if(own!==false&&typeof co205Mir=='function')co205Mir('d',0);if(typeof co205Credit=='function')co205Credit('c3')}
function gg205BreakRingOf(sg,r,p){r.on=0;let t=0;const m=r.m;svSnd('crack',.8,1);kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/.5);m.scale.setScalar(r.r*2*(1+k*.5));m.material.opacity=.85*(1-k);return t<.5},end(){m.visible=false}})}
// ---------------- the wardens ----------------
function dm205Guard(i){const s=DM205.S.sh[i],w=DM205.W[i];let e=null;try{e=spawnEnemy(w.en,s.x+2,s.z+1,DM205.lv,{elite:1,agg:1})}catch(err){console.error('v205 warden',err)}if(!e)return null;
  e.dm205=i+1;e.c.n=w.n;try{e.c.st.hp*=2.4;e.c.h=Math.round(M(e.c));e.m.scale.multiplyScalar(1.22)}catch(_){}e.agg=1;e.hunt=1;burst(gY(e.m.position,1),0xff2030,40,2,2,.8);svSnd('roar',.7,.8);
  say('🩸 '+w.n+', '+w.t+', rises from beside the blood shrine.');DM205.g[i]=e;return e}
{const f=kill;kill=function(e){const r=f.apply(this,arguments);try{if(e&&e.dm205){const i=e.dm205-1;DM205.g[i]=null;CQ205.c3.cl|=1<<i;CQ205.trkK='';const s=DM205.S&&DM205.S.sh[i];if(s){burst(gY(s.c.position.clone().add(s.o.position),1.5),0xff2030,90,3,3,1);svSnd('splash',1.1,.6)}dm205Sync();say('🌞 The cocoon of blood bursts. A great round mirror lies in the wreck of it, still bright.');if(typeof co205Mir=='function')co205Mir('c',i)}}catch(err){console.warn('v205 warden kill',err)}return r}}
// ---------------- Cheddar's window ----------------
var DM205T={hi0:['There you are! Look — the Sun Court. The old keep worshipped the dawn before the court came. That pillar still catches a thread of real sunlight, all the way down through the clouds.','And that door — the Eclipse Door. A black sun, sealed in his blood. Vaelric lives behind it, and nothing but sunlight will burn it away.'],
  how:['The three stands held the Dawn Mirrors. Each one gathers the light that reaches it and throws it the way it faces. The court tore them down and hid them in blood shrines out on the grounds — you can see the red beacons.','Bring them back, mount them, and turn them until the beam runs from the lens, over all three, and onto that seal.'],
  wait:['The mirrors are out there in the shrines. Mind the wardens — they won’t give them up quietly.'],
  turn:['All mounted! Now turn them. Watch where each one throws the light.'],
  after:['The door is open. Whatever you do down there — I’ll be right here when you come back. You are coming back.']};
function dm205Talk(){const C=CQ205.c3;if(C.st<1){C.st=1;CQ205.trkK='';DM205.tab='hi0'}else DM205.tab='hi';openX('dm205')}
XR.dm205=()=>{const C=CQ205.c3,t=DM205.tab||'hi';$('xwT').textContent='🐭 Cheddar';$('xwS').textContent='The Sun Court · before the Eclipse Door';
  const L=t==='how'?DM205T.how:t==='hi0'?DM205T.hi0:C.st>=3||cq205Done(3)?DM205T.after:C.st>=2?DM205T.turn:DM205T.wait;
  $('xwB').innerHTML='<div class="cq132say"><span class="cq132who">Cheddar</span>'+L.map(s=>'“'+s+'”').join('<br><br>')+'</div>';const btn=(k,lab,pri)=>'<button class="'+(pri?'pri':'')+'" data-dm205="'+k+'">'+lab+'</button> ';
  $('xwF').innerHTML=t==='hi0'?btn('how','How do we bring the sun to it?',1):btn('how','Tell me about the mirrors again')+btn('bye','On my way',1)};
$('xw').addEventListener('click',ev=>{if(xwMode!='dm205')return;const b=ev.target.closest('[data-dm205]');if(!b)return;const k=b.dataset.dm205;if(k==='bye'){closeX();return}DM205.tab=k;rX()});
// ---------------- prompts ----------------
function dm205Prompt(){if(!cq205Here(2)||!DM205.S)return null;const P=pl.position,C=CQ205.c3,S=DM205.S,R=dm205Court(),near=(x,z,r)=>Math.hypot(P.x-x,P.z-z)<r;
  for(const s of S.sh){const cl=C.cl&(1<<s.i),tk=(C.got|C.mnt)&(1<<s.i);if(!near(s.x,s.z,3))continue;if(cl&&!tk&&C.st<2)return {label:'F · Take the Dawn Mirror',fn:()=>dm205Take(s.i,true)};
    if(!cl&&!cq205Done(3))return {label:'🩸 A blood shrine · a mirror sealed in a cocoon of blood (slay its warden)',fn:()=>say('🩸 The cocoon pulses like a heart. Its warden must be near.')}}
  if(DM205.C&&near(R.ched.x,R.ched.z,2.6))return {label:'F · Speak with Cheddar',fn:()=>dm205Talk()};
  for(const s of S.st){const p=R.st[s.i];if(!near(p.x,p.z,2.4))continue;const on=C.mnt&(1<<s.i);
    if(!on){if(C.got)return {label:'F · Mount a Dawn Mirror on the stand',fn:()=>{const i=s.i;if(C.got&(1<<i))dm205Mount(i,true);else{for(let j=0;j<3;j++)if(C.got&(1<<j)){C.got&=~(1<<j);C.got|=1<<i;break}dm205Mount(i,true)}}};return {label:'🌞 An empty mirror stand',fn:()=>say('🌞 A bronze fork on a stone plinth, made to hold a great round mirror.')}}
    if(C.st===2)return {label:'F · Turn the Dawn Mirror (⟳ an eighth)',fn:()=>dm205Turn(s.i,true)}}
  const D=S.door,[x,z]=cq205GW(D.spot,0,D.dims.fz+2.2);if(near(x,z,4)){if(cq205Done(3)||C.st>=3){const N=cq205I(3);return {label:'F · Descend into '+BOSSES[5].name+'’s den',fn:()=>dm205Through()}}
    return {label:'🔒 The Eclipse Door · a black sun sealed in blood',fn:()=>say('🌑 A black sun burns cold across the door. Cheddar says only sunlight can touch it.')}}
  return null}
function dm205Through(){const C=CQ205.c3;if(C.st<4){C.st=4;CQ205.trkK=''}svSnd('whoosh',1,.5);try{insGo(cq205I(3))}catch(e){console.error('v205 den go',e)}}
{const f=worldPrompt;worldPrompt=function(){try{const r=dm205Prompt();if(r)return r}catch(e){if(!DM205.err++)console.warn('v205 mirrors prompt',e)}return f.apply(this,arguments)}}
// ---------------- the tick: build, wardens, the beam burns the court, the dawn light ----------------
function dm205Tick(dt,now){const here=cq205Here(2),t=now/1000;if(here&&!DM205.S){try{dm205Build()}catch(e){if(!DM205.err++)console.error('v205 mirrors build',e)}}const S=DM205.S;if(!S)return;
  const vis=here;[S.door.g,S.floor,S.lens,S.shaft].forEach(o=>o.visible=vis);S.st.forEach(s=>s.o.visible=vis);S.sh.forEach(s=>s.o.visible=vis);S.beams.forEach(b=>{if(!vis)b.visible=false});if(DM205.C)DM205.C.root.visible=vis;
  if(!vis){S.ll.intensity=0;S.door.light.intensity=0;return}if(!cq205Done(3)&&CQ205.c3.st<3&&!S.beams.some(b=>b.visible))dm205Trace();
  S.ll.intensity=1.3+.2*Math.sin(t*2);S.shaft.material.opacity=.16+.04*Math.sin(t*1.3);S.lens.children.forEach(m=>{});
  if(DM205.C)try{DM205.C.update(t,dt)}catch(_){}
  // the beam shimmers and burns whatever of the court crosses it
  S.beams.forEach((b,i)=>{if(!b.visible)return;b.userData.c.material.opacity=.75+.2*Math.sin(t*9+i);b.userData.g.material.opacity=.18+.06*Math.sin(t*5+i);const A=b.userData.A,B=b.userData.B;if(Math.random()<.5)burst(A.clone().lerp(B,Math.random()),0xfff0c0,1,.1,.2,.4);
    enemies.forEach(e=>{if(e.dead||!e.m||e.boss||e.dprop)return;const ex=e.m.position.x,ez=e.m.position.z,dx=B.x-A.x,dz=B.z-A.z,L2=dx*dx+dz*dz||1,u=Math.max(0,Math.min(1,((ex-A.x)*dx+(ez-A.z)*dz)/L2)),qx=A.x+dx*u,qz=A.z+dz*u;
      if(Math.hypot(ex-qx,ez-qz)<.8){e.dmBurn=(e.dmBurn||0)-dt;if(e.dmBurn<=0){e.dmBurn=.5;try{hurt(e,Math.max(1,Math.round(M(e.c)*.06)),{col:0xffe8a0},false,true)}catch(_){}burst(gY(e.m.position,1),0xffe0a0,10,.6,1,.5)}}})});
  // the wardens rise when a hero comes near an unbroken shrine
  const C=CQ205.c3;if(!cq205Done(3)&&C.st<2&&(typeof co151On!='function'||!co151On()||co151Host()))S.sh.forEach(s=>{const i=s.i;if(C.cl&(1<<i))return;const d=Math.hypot(pl.position.x-s.x,pl.position.z-s.z);
    if(d<DM205.see&&(!DM205.g[i]||DM205.g[i].dead||!enemies.includes(DM205.g[i]))){if(!(C.fd&(1<<i))){C.fd|=1<<i;CQ205.trkK=''}dm205Guard(i)}});
  S.sh.forEach(s=>{if(s.c.visible){s.c.userData.m.scale.set(1+.04*Math.sin(t*2.4+s.i),1.35+.05*Math.sin(t*2.4+s.i),.8)}if(s.mr.visible)s.mr.rotation.y+=dt*.6});
  // the dawn lingers over the court once it has come
  const want=cq205Done(3)||C.st>=3?1:0;DM205.dk+=(want-DM205.dk)*Math.min(1,dt*.4)}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{dm205Tick(dt,now)}catch(e){if(!DM205.err++)console.warn('v205 mirrors tick',e)}return r}}
{const f=atmos;atmos=function(dt,now){const r=f.apply(this,arguments);try{const d=DM205.dk;if(d>.002&&cq205Here(2)){const F=cq205F(2),k=Math.max(0,1-Math.hypot(pl.position.x-F.x,pl.position.z-F.z)/40)*d;if(k>0){sun.intensity*=1+.6*k;hemi.intensity*=1+.35*k;
      const dc=DM205.dc||(DM205.dc=new THREE.Color(0xd8b890));scene.fog.color.lerp(dc,.35*k);scene.background=scene.fog.color;try{const su=SKY.material.uniforms;su.hor.value.lerp(dc,.5*k)}catch(_){}}}}catch(_){}return r}}
// the tracker reads DM205.lit; saves rebuild from CQ205.c3
CQ205L.push(()=>{if(DM205.S)dm205Sync()});
// the bag lists the Dawn Mirrors carried
{const f=kqmMatTab;kqmMatTab=function(){const h=f.apply(this,arguments);const n=cq205Bits(CQ205.c3.got);if(!n)return h;const t=`<div class="kqm-slot mi" title="Dawn Mirror · quest item for The Dawn Mirrors: mount them on the stands of the Sun Court before the Eclipse Door."><span class="kqm-ic">🌞</span><span class="kqm-ct">${n}</span><span class="kqm-hold">Dawn Mirror</span></div>`;
  return /Quest items/.test(h)?h.replace('<div class="kqm-grid">','<div class="kqm-grid">'+t):`<div class="kqm-h">Quest items</div><div class="kqm-grid">${t}${kqmEmpty(7)}</div>`+h}}
