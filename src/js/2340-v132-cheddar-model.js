// v132 Cheddar: the wandering mouse quest-giver (model from the "Cheddar NPC Model" concept page, game-ready style).
// chd132Model({game:true}) -> {root, J, update(t,dt), setPose(name), stats}. Faces +z, feet on y=0, ~0.78 units tall
// (a hero is ~1.28 in the concept's units; the quest file scales him to the game). Three skinned meshes on one skeleton.
// Built once; the quest file (2350) moves the one Cheddar to whichever instance the hero is in.
function chd132Model(opt){
  opt=opt||{};const GAME=!!opt.game,LP=GAME||opt.lowpoly!==false;   // low-poly: the same segment caps and flat shading as the game's v83 look
  const TH=THREE,V3=TH.Vector3;
  const T=!LP?TH:Object.assign(Object.create(TH),{
    SphereGeometry:function(r,w,h,...a){const k=GAME&&r<.016;return new TH.SphereGeometry(r,Math.min(k?5:8,w||8),Math.min(k?4:6,h||6),...a)},
    CylinderGeometry:function(t,b,h,rs,hs,oe,...a){const k=GAME&&Math.max(t,b)<.012;return new TH.CylinderGeometry(t,b,h,Math.min(k?4:8,rs||8),1,oe||(GAME&&Math.max(t,b)<.004),...a)},
    ConeGeometry:function(r,h,rs,hs,...a){return new TH.ConeGeometry(r,h,Math.min(GAME&&r<.008?4:8,rs||8),1,...a)},
    TorusGeometry:function(r,t,rs,ts,arc){const k=GAME&&t<.012;return new TH.TorusGeometry(r,t,Math.min(k?3:4,rs||4),Math.min(k?8:12,ts||12),arc)},
    ExtrudeGeometry:function(sh,o){return new TH.ExtrudeGeometry(sh,Object.assign({},o,{bevelSegments:1,curveSegments:Math.min(3,o.curveSegments||3)}))}});
  const HS=GAME?[12,8]:LP?[14,10]:[44,32];
  // ---------- palette ----------
  const C={
    fur:0x9c4a1c, furD:0x63300f, furL:0xb8692e, white:0xd6cab4, pink:0xb07068, pinkD:0x7e4848,
    eye:0x0c0807, tooth:0xd8ccb0,
    linen:0xa69676, leather:0x5a3820, leatherD:0x34210f, leatherL:0x7a5230,
    wool:0x4a3c2c, woolL:0x6c5a40, moss:0x3c4630, mossD:0x2a3222,
    rust:0x7a3022, brass:0xb08a3e, iron:0x5a5a5e, bone:0xd2c6a6, cord:0x4a2a1e,
    parch:0xcdb98a, glass:0x3aa888, wrap:0x847456
  };
  const mats={};
  function M(c,o){const k=c+'|'+JSON.stringify(o||{});if(mats[k])return mats[k];
    const p=Object.assign({color:c,roughness:.9,metalness:0},o||{});return mats[k]=new T.MeshStandardMaterial(p)}
  const brass=()=>M(C.brass,{roughness:.38,metalness:.85});
  const VC=new T.MeshStandardMaterial({vertexColors:true,roughness:.92});
  let nMesh=0;
  function mesh(g,m,par,x,y,z,rx,ry,rz,sx,sy,sz){const o=new T.Mesh(g,m);o.castShadow=o.receiveShadow=true;
    o.position.set(x||0,y||0,z||0);o.rotation.set(rx||0,ry||0,rz||0);if(sx!==undefined)o.scale.set(sx,sy===undefined?sx:sy,sz===undefined?sx:sz);
    if(par)par.add(o);nMesh++;return o}
  function grp(par,x,y,z,rx,ry,rz){const g=new TH.Bone();g.position.set(x||0,y||0,z||0);g.rotation.set(rx||0,ry||0,rz||0);if(par)par.add(g);return g}
  const hash=(a)=>{const s=Math.sin(a*127.1+311.7)*43758.5453;return s-Math.floor(s)};
  const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
  const col=new T.Color(),cA=new T.Color(),cB=new T.Color();
  function paint(g,fn){const p=g.attributes.position,n=p.count,a=new Float32Array(n*3);
    for(let i=0;i<n;i++){fn(p.getX(i),p.getY(i),p.getZ(i),col,i);a[i*3]=col.r;a[i*3+1]=col.g;a[i*3+2]=col.b}
    g.setAttribute('color',new T.BufferAttribute(a,3));return g}
  function mix(c1,c2,t,out){cA.setHex(c1);cB.setHex(c2);out.copy(cA).lerp(cB,Math.min(1,Math.max(0,t)));return out}
  function furNoise(out,x,y,z,amt){const h=hash(x*91.3+y*57.7+z*33.1)-.5;out.multiplyScalar(1+h*amt);return out}
  // a limb piece along -y from its group origin
  function limb(par,len,r0,r1,m,seg){const g=new T.CylinderGeometry(r1,r0,len,seg||12,3);g.translate(0,-len/2,0);return mesh(g,m,par)}
  function lathe(pts,seg,ps,pl){return new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),LP?Math.min(GAME?10:14,seg||14):seg||40,ps||0,pl||Math.PI*2)}
  function tube(par,pts,r,m,seg){const cv=new T.CatmullRomCurve3(pts.map(p=>new V3(...p)));return mesh(new T.TubeGeometry(cv,LP?Math.max(4,Math.round((seg||48)/4)):seg||48,r,LP?4:6,false),m,par)}

  const root=new T.Group();root.name='Cheddar';
  const J={};
  // ---------- skeleton ----------
  J.hips=grp(root,0,.30,0);
  J.spine=grp(J.hips,0,0,0);
  J.chest=grp(J.spine,0,.2,0);
  J.neck=grp(J.chest,0,.055,.005);
  J.head=grp(J.neck,0,.075,.025);

  // ---------- torso: fur (mostly hidden), linen shirt, leather jerkin ----------
  const SZ=.86;
  const torsoP=[[0,-.08],[.075,-.07],[.118,-.03],[.13,.03],[.128,.09],[.115,.15],[.094,.2],[.07,.245],[.05,.27]];
  const tg=paint(lathe(torsoP,28),(x,y,z,c)=>{const front=z/Math.max(.001,Math.hypot(x,z));
    mix(C.fur,C.white,sm(.25,.6,front),c);furNoise(c,x,y,z,.12)});
  if(!GAME)mesh(tg,VC,J.spine,0,0,0,0,0,0,1,1,SZ);
  const shirtP=[[.112,-.03],[.128,0],[.134,.04],[.132,.09],[.12,.15],[.1,.2],[.08,.235],[.06,.255]];
  mesh(lathe(shirtP,28),M(C.linen,{side:T.DoubleSide}),J.spine,0,0,0,0,0,0,1,1,SZ);
  // jerkin with an open laced front
  const jkP=[[.122,-.045],[.138,-.01],[.143,.04],[.141,.09],[.128,.15],[.108,.2],[.088,.232]];
  const GAP=.34;
  const jg=paint(lathe(jkP,36,GAP,Math.PI*2-2*GAP),(x,y,z,c)=>{mix(C.leather,C.leatherD,.25+.5*hash(Math.floor(y*60)+Math.atan2(x,z)*3.1),c);
    if(y<-.035)c.multiplyScalar(.7)});
  mesh(jg,new T.MeshStandardMaterial({vertexColors:true,roughness:.78,side:T.DoubleSide}),J.spine,0,0,0,0,0,0,1,1,SZ);
  const jkEdge=s=>jkP.map(p=>[s*p[0]*Math.sin(GAP)*1.01,p[1],p[0]*Math.cos(GAP)*SZ*1.01]);
  [-1,1].forEach(s=>tube(J.spine,jkEdge(s),.0055,M(C.leatherD,{roughness:.7}),24));
  // lacing across the gap
  for(let i=0;i<5;i++){const y0=-.02+i*.042,y1=y0+.042;
    const r0=.142-Math.abs(y0-.05)*.12,r1=.142-Math.abs(y1-.05)*.12;
    const a=new V3(-r0*Math.sin(GAP),y0,r0*Math.cos(GAP)*SZ+.003),b=new V3(r1*Math.sin(GAP),y1,r1*Math.cos(GAP)*SZ+.003);
    [[a,b],[new V3(-b.x,b.y,b.z),new V3(-a.x,a.y,a.z)]].forEach(([p,q])=>{const d=q.clone().sub(p),L=d.length();
      const m=mesh(new T.CylinderGeometry(.0022,.0022,L,5),M(C.cord),J.spine);m.position.copy(p).add(q).multiplyScalar(.5);
      m.quaternion.setFromUnitVectors(new V3(0,1,0),d.normalize())})}
  // stitch dashes down the jerkin sides
  if(!GAME)for(const s of [-1,1])for(let i=0;i<7;i++){const y=-.03+i*.03,r=.143-Math.abs(y-.05)*.11,a=s*1.55;
    mesh(new T.BoxGeometry(.0025,.012,.002),M(0xc8b088),J.spine,Math.sin(a)*r*1.005,y,Math.cos(a)*r*SZ,0,a,0)}
  // belt + buckle
  const belt=mesh(new T.TorusGeometry(.143,.013,6,44),M(C.leatherD,{roughness:.6}),J.spine,0,-.025,0,Math.PI/2,0,0,1,1,1);belt.scale.set(1,SZ,1);
  const bk=grp(J.spine,0,-.025,.143*SZ+.012);
  mesh(new T.TorusGeometry(.016,.004,6,4),brass(),bk,0,0,0,0,0,Math.PI/4,1,.85,1);
  mesh(new T.BoxGeometry(.003,.026,.004),brass(),bk,0,0,.002);

  // ---------- mantle (hooded capelet), scarf ----------
  const mnP=[[.058,.065],[.09,.05],[.13,.02],[.162,-.02],[.18,-.06],[.19,-.1]];
  const MG=.5;
  const mg=lathe(mnP,48,MG,Math.PI*2-2*MG);
  {const p=mg.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<-.095){const x=p.getX(i),z=p.getZ(i),ph=Math.atan2(x,z);
      p.setY(i,y-.018*Math.abs(Math.sin(ph*7.5))-.012*hash(Math.round(ph*40)))}}mg.computeVertexNormals()}
  paint(mg,(x,y,z,c)=>{mix(C.moss,C.mossD,.3+.4*hash(Math.round(Math.atan2(x,z)*14))+(y<-.1?.25:0),c);furNoise(c,x,y,z,.08)});
  J.mantle=grp(J.chest,0,0,0);
  mesh(mg,new T.MeshStandardMaterial({vertexColors:true,roughness:.97,side:T.DoubleSide}),J.mantle,0,0,0,0,0,0,1,1,.88);
  // hood, bunched behind the neck
  const hood=mesh(new T.TorusGeometry(.072,.028,10,24,Math.PI*1.25),M(C.moss,{roughness:.97}),J.mantle,0,.06,-.012,Math.PI/2+.2,0,Math.PI*-.125*0+Math.PI*.875,1,1,1);
  hood.rotation.set(Math.PI/2-.25,0,Math.PI*1.125);
  mesh(new T.SphereGeometry(.055,14,10),M(C.moss,{roughness:.97}),J.mantle,0,.02,-.135,.3,0,0,1,.8,.45);
  mesh(new T.ConeGeometry(.04,.07,10),M(C.mossD,{roughness:.97}),J.mantle,0,-.045,-.16,-.25,0,Math.PI,1,1,.45);
  // mantle edge trim
  [-1,1].forEach(s=>tube(J.mantle,mnP.slice(0,-1).map(p=>[s*p[0]*Math.sin(MG),p[1],p[0]*Math.cos(MG)*.88]),.004,M(C.mossD),20));
  // scarf + knot + tails
  J.scarf=grp(J.neck,0,-.01,0);
  mesh(new T.TorusGeometry(.055,.018,8,24),M(C.rust,{roughness:.95}),J.scarf,0,0,0,Math.PI/2-.15,0,0,1,1,1).scale.set(1,1,1.4);
  mesh(new T.SphereGeometry(.02,10,8),M(C.rust,{roughness:.95}),J.scarf,.04,-.015,.045,0,0,0,1,.8,.8);
  J.scarfTail=grp(J.scarf,.045,-.025,.05,0,0,.15);
  mesh(new T.BoxGeometry(.022,.06,.006),M(C.rust,{roughness:.95}),J.scarfTail,0,-.03,0,.1,0,.1);
  mesh(new T.BoxGeometry(.02,.05,.006),M(0x6a281c,{roughness:.95}),J.scarfTail,.014,-.024,-.004,.15,0,-.25);
  // brass clasp holding the mantle
  mesh(new T.CylinderGeometry(.014,.014,.006,14),brass(),J.mantle,0,.035,.098,Math.PI/2-.35,0,0);
  mesh(new T.SphereGeometry(.006,8,6),M(C.glass,{roughness:.15,emissive:0x0d3a2c}),J.mantle,0,.036,.103);

  // ---------- necklace of trinkets ----------
  J.neckl=grp(J.chest,0,.0,.11);
  tube(J.neckl,[[-.04,.05,-.02],[-.03,.02,0],[0,-.0,.012],[.03,.02,0],[.04,.05,-.02]],.0016,M(C.cord),20);
  J.pend=grp(J.neckl,0,0,.012);
  mesh(new T.ConeGeometry(.0065,.032,7),M(C.bone,{roughness:.55}),J.pend,0,-.018,.002,Math.PI,0,0);   // fang
  mesh(new T.SphereGeometry(.0075,10,8),M(C.glass,{roughness:.1,emissive:0x0b3326}),J.pend,-.014,-.008,.003);
  mesh(new T.CylinderGeometry(.009,.009,.0025,12),brass(),J.pend,.015,-.011,.003,Math.PI/2,0,.2);  // coin

  // ---------- head ----------
  function headPt(d){const L=Math.hypot(d[0],d[1],d[2]);let x=d[0]/L,y=d[1]/L,z=d[2]/L;const t=Math.max(0,z),tp=Math.pow(t,1.4);
    let px=x*.084*(1-.64*tp),py=y*.08*(1-.56*tp)-.022*t*t,pz=z<0?z*.09:z*.165;if(y<0)py*=.86;if(y>0&&z<.3)py*=1.05;return new V3(px,py,pz)}
  function headN(d){const e=.02,p=headPt(d),a=headPt([d[0]+e,d[1],d[2]]),b=headPt([d[0],d[1]+e,d[2]]);
    const n=a.sub(p).cross(b.sub(p)).normalize();return n.dot(p)<0?n.negate():n}
  const hgeo=new TH.SphereGeometry(1,HS[0],HS[1]);
  {const p=hgeo.attributes.position;for(let i=0;i<p.count;i++){const q=headPt([p.getX(i),p.getY(i),p.getZ(i)]);p.setXYZ(i,q.x,q.y,q.z)}hgeo.computeVertexNormals()}
  const sph=new TH.SphereGeometry(1,HS[0],HS[1]).attributes.position;
  paint(hgeo,(x,y,z,c,i)=>{const dx=sph.getX(i),dy=sph.getY(i),dz=sph.getZ(i);
    let w=0;
    w=Math.max(w,sm(.42,.62,dz)*sm(.35,-.05,dy));                // muzzle
    w=Math.max(w,sm(-.25,-.55,dy)*sm(-.4,.1,dz));                 // chin / throat
    w=Math.max(w,sm(.09,.03,Math.abs(dx)-.06*dz)*sm(.05,.35,dz)*sm(-.4,-.1,dy)*sm(.62,.4,dy)); // blaze up the brow
    mix(C.fur,C.white,w,c);
    if(w<.5&&dy>.55)c.lerp(cA.setHex(C.furD),.35*sm(.55,.9,dy));
    furNoise(c,x,y,z,.14)});
  J.headMesh=mesh(hgeo,VC,J.head);
  // cheek ruffs
  // eyes
  J.eyes=[];
  [-1,1].forEach(s=>{const d=[s*.52,.3,.62],p=headPt(d),n=headN(d);const g=grp(J.head,p.x,p.y,p.z);g.lookAt(p.clone().add(n));
    mesh(new T.TorusGeometry(.0195,.0032,6,18),M(0x2a160c,{roughness:.8}),g,0,0,-.003);
    const eb=grp(g,0,0,-.004),e=mesh(new T.SphereGeometry(.0185,16,12),M(C.eye,{roughness:.08}),eb,0,0,0,0,0,0,1,1,.75);
    mesh(new T.SphereGeometry(.0035,6,6),GAME?M(0xd8ccb0,{roughness:.3}):new T.MeshBasicMaterial({color:0xc8b898}),e,.007,.007,.017);
    J.eyes.push(eb)});
  // old scar across his left brow
  {const d=[.42,.62,.5],p=headPt(d),n=headN(d);const g=grp(J.head,p.x,p.y,p.z);g.lookAt(p.clone().add(n));
    for(let i=-1;i<=1;i++)mesh(new T.BoxGeometry(.0035,.036-Math.abs(i)*.008,.003),M(0x9a6a60,{roughness:.6}),g,i*.008,i*.002,0,0,0,.65)}
  // nose, teeth, whiskers
  {const p=headPt([0,-.06,1]);mesh(new T.SphereGeometry(.014,12,10),M(C.pinkD,{roughness:.4}),J.head,0,p.y+.004,p.z+.004,0,0,0,1,.8,.9)}
  {const p=headPt([0,-.62,.75]);[-1,1].forEach(s=>mesh(new T.BoxGeometry(.0055,.013,.004),M(C.tooth,{roughness:.4}),J.head,s*.0033,p.y-.004,p.z+.004,.15,0,0))}
  J.whisk=[];
  [-1,1].forEach(s=>{const p=headPt([s*.38,-.22,.86]);const g=grp(J.head,p.x,p.y,p.z);J.whisk.push(g);
    for(let i=0;i<4;i++){const L=.09+.03*hash(i+s*3),w=new T.CylinderGeometry(.0006,.0011,L,4);w.translate(0,L/2,0);
      mesh(w,M(i%2?0xd8d0c0:0x9a8e7e,{roughness:.6}),g,0,0,0,Math.PI/2-.25+i*.13-.15,0,-s*(1.15+i*.06))}});
  // ears: big, thin, cupped; his left ear has a notch bitten out
  function earGeo(r,notch,depth){const sh=new T.Shape(),N=LP?16:56;
    for(let i=0;i<=N;i++){const a=i/N*Math.PI*2;let rr=r*(1-.08*Math.pow(Math.max(0,-Math.sin(a)),3));
      if(notch){const da=Math.atan2(Math.sin(a-.55),Math.cos(a-.55));rr*=1-.3*Math.max(0,1-Math.abs(da)/.16)}
      const x=Math.cos(a)*rr,y=Math.sin(a)*rr+r*.88;i?sh.lineTo(x,y):sh.moveTo(x,y)}
    const g=depth?new T.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:1,curveSegments:8}):new T.ShapeGeometry(sh,8);
    const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i)-r*.88;p.setZ(i,p.getZ(i)+2.4*(x*x+y*y)-.6*x*x)}
    g.computeVertexNormals();return g}
  J.ears=[];
  [-1,1].forEach(s=>{const p=headPt([s*.5,.72,-.28]);const g=grp(J.head,p.x,p.y-.004,p.z,-.25,s*.5,-s*.42);g.scale.setScalar(.86);J.ears.push(g);g.userData.s=s;
    mesh(earGeo(.064,s>0,.004),M(C.fur,{roughness:.9}),g,0,0,-.004);
    mesh(earGeo(.05,s>0),M(0xa86460,{roughness:.65,side:T.DoubleSide}),g,0,.009,.008);
    if(s<0){mesh(new T.TorusGeometry(.011,.0022,6,16),brass(),g,-.052,.035,.004,0,Math.PI/2,0);
      mesh(new T.SphereGeometry(.0045,8,6),M(0x8a2a2a,{roughness:.2}),g,-.06,.024,.004)}});
  // head tuft
  for(let i=0;i<3;i++){const p=headPt([(i-1)*.12,.95,-.1]);mesh(new T.ConeGeometry(.008,.024,5),M(C.fur),J.head,p.x,p.y+.004,p.z,-.7,0,(i-1)*.35)}

  // neck fur
  mesh(paint(new T.CylinderGeometry(.045,.06,.08,16,2),(x,y,z,c)=>{mix(C.fur,C.white,sm(0,.03,z),c)}),VC,J.neck,0,.02,0);

  // ---------- arms ----------
  function arm(s){const sh=grp(J.chest,s*.108,-.008,-.005);const A={sh};
    mesh(new T.SphereGeometry(.025,12,10),M(C.linen),sh,0,-.008,0);
    limb(sh,.1,.03,.027,M(C.linen),12);
    A.el=grp(sh,0,-.1,0);
    mesh(new T.TorusGeometry(.027,.011,8,16),M(0xb8a888),A.el,0,.008,0,Math.PI/2,0,0);    // rolled sleeve
    const fa=limb(A.el,.09,.022,.018,VC,10);fa.geometry=paint(fa.geometry,(x,y,z,c)=>{mix(C.fur,C.white,sm(-.05,-.085,y),c);furNoise(c,x,y,z,.12)});
    if(s>0){for(let i=0;i<(GAME?2:3);i++)mesh(new T.TorusGeometry(.022-i*.0012,.005,6,14),M(C.wrap),A.el,0,-.028-i*.016,0,Math.PI/2+.2*(i%2?1:-1),0,0)}
    else{const NB=GAME?5:7;for(let i=0;i<NB;i++){const a=i/NB*Math.PI*2;mesh(new T.SphereGeometry(.0048,6,5),M([C.bone,0x6a2a22,C.glass,C.brass][i%4],{roughness:.35}),A.el,Math.cos(a)*.021,-.08,Math.sin(a)*.021)}}
    A.ha=grp(A.el,0,-.09,0);
    mesh(new T.SphereGeometry(.021,10,8),M(C.pink,{roughness:.7}),A.ha,0,-.012,.003,0,0,0,.95,1.05,.7);
    A.fing=[];
    for(let i=0;i<4;i++){const f=grp(A.ha,s*(-.011+i*.0075)*1,-.026,.004,0,0,0);A.fing.push(f);
      limb(f,.022-Math.abs(i-1.5)*.003,.0055,.004,M(C.pink,{roughness:.7}),6);
      if(!GAME)mesh(new T.ConeGeometry(.0028,.006,5),M(0x3a2a24,{roughness:.4}),f,0,-.024+Math.abs(i-1.5)*.003,0,Math.PI,0,0)}
    {const th=grp(A.ha,s*-.016,-.012,.012,.5,0,s*.7);limb(th,.016,.006,.0045,M(C.pink,{roughness:.7}),6)}
    return A}
  J.R=arm(-1);J.L=arm(1);

  // ---------- legs ----------
  function leg(s){const th=grp(J.hips,s*.068,-.03,0),Lg={th};
    mesh(new T.SphereGeometry(.058,12,10),M(C.wool,{roughness:.95}),th,0,0,0,0,0,0,1,.9,1);
    limb(th,.11,.055,.042,M(C.wool,{roughness:.95}),12);
    if(s>0){const pg=grp(th,0,-.085,.044,-.18,0,0);mesh(new T.BoxGeometry(.04,.04,.004),M(C.woolL,{roughness:.95}),pg);
      if(!GAME)for(let i=0;i<4;i++)for(const e of [-1,1]){mesh(new T.BoxGeometry(.006,.0018,.002),M(0xc8b088),pg,e*.02,-.015+i*.01,.003);mesh(new T.BoxGeometry(.0018,.006,.002),M(0xc8b088),pg,-.015+i*.01,e*.02,.003)}}
    Lg.kn=grp(th,0,-.11,0);
    mesh(new T.SphereGeometry(.043,10,8),M(C.wool,{roughness:.95}),Lg.kn);
    limb(Lg.kn,.045,.042,.036,M(C.wool,{roughness:.95}),12);
    mesh(new T.TorusGeometry(.036,.008,6,16),M(C.woolL,{roughness:.95}),Lg.kn,0,-.046,0,Math.PI/2,0,0);
    const sh=limb(Lg.kn,.1,.028,.022,VC,10);sh.geometry=paint(sh.geometry,(x,y,z,c)=>{mix(C.fur,C.white,sm(-.0,.02,z)*.8,c);furNoise(c,x,y,z,.12)});
    for(let i=0;i<(GAME?2:3);i++)mesh(new T.TorusGeometry(.024-i*.0008,.0055,6,14),M(C.wrap),Lg.kn,0,-.07-i*.012,0,Math.PI/2+(i%2?.25:-.2),0,0);
    Lg.ft=grp(Lg.kn,0,-.1,0);
    mesh(new T.SphereGeometry(1,14,10),M(C.pink,{roughness:.75}),Lg.ft,0,-.012,.035,0,0,0,.026,.016,.065);
    for(let i=0;i<4;i++){const x=(-.015+i*.01),f=grp(Lg.ft,x,-.016,.092+(1.5-Math.abs(i-1.5))*.006,0,(i-1.5)*.12,0);
      mesh(new T.SphereGeometry(1,GAME?5:8,GAME?4:6),M(C.pink,{roughness:.75}),f,0,0,.008,0,0,0,.0065,.0065,.014);
      mesh(new T.ConeGeometry(.0026,.009,5),M(0x3a2a24,{roughness:.4}),f,0,-.002,.024,Math.PI/2,0,0)}
    return Lg}
  J.LR=leg(-1);J.LL=leg(1);

  // ---------- tail ----------
  J.tail=[];
  {let par=grp(J.hips,0,-.04,-.1);const N=17,SEG=.036;
    const rest=[-.75,.12,.18,.2,.15,.08,.02,0,-.02,0,.05,.12,.2,.28,.34,.4,.45],yr=[0,.1,.1,.08,.04,0,-.06,-.1,-.12,-.1,-.06,0,.06,.12,.16,.2,.2];
    for(let i=0;i<N;i++){const g=grp(par,0,0,i?-SEG:0,rest[i],yr[i],0);g.userData.rx=rest[i];g.userData.ry=yr[i];
      const r0=.026*Math.pow(1-i/N,1.1)+.003,r1=.026*Math.pow(1-(i+1)/N,1.1)+.003,cg=new T.CylinderGeometry(r1,r0,SEG*1.08,GAME?5:10,1,GAME&&i>1);
      cg.rotateX(-Math.PI/2);cg.translate(0,0,-SEG/2);
      const furry=i<2;paint(cg,(x,y,z,c)=>{if(furry)mix(C.fur,C.furD,y>0?.3:0,c);else{mix(C.pink,C.pinkD,.15+.25*hash(Math.round(z*400)),c)}});
      mesh(cg,new T.MeshStandardMaterial({vertexColors:true,roughness:furry?.92:.6}),g);
      if(!GAME||i<2)mesh(new T.SphereGeometry(r0,10,8),furry?M(C.fur):M(C.pink,{roughness:.6}),g);
      if(i===6){mesh(new T.TorusGeometry(r0+.002,.0028,6,16),brass(),g,0,0,-SEG*.4);
        const dg=grp(g,0,-r0,-SEG*.4);J.tailBead=dg;
        tube(dg,[[0,0,0],[0,-.008,0],[0,-.016,.002]],.0012,M(C.cord),6);mesh(new T.SphereGeometry(.0055,8,6),M(0x2a5a8a,{roughness:.15}),dg,0,-.02,.002)}
      J.tail.push(g);par=g}}

  // ---------- satchel on his left hip, strap over his right shoulder ----------
  J.bag=grp(J.spine,.15,-.07,.025,0,.42,.06);J.bag.scale.setScalar(.85);
  {const W=.11,H=.085,D=.052,R=.012,sh=new T.Shape();
    sh.moveTo(-W/2+R,-H/2);sh.lineTo(W/2-R,-H/2);sh.quadraticCurveTo(W/2,-H/2,W/2,-H/2+R);sh.lineTo(W/2,H/2);sh.lineTo(-W/2,H/2);sh.lineTo(-W/2,-H/2+R);sh.quadraticCurveTo(-W/2,-H/2,-W/2+R,-H/2);
    const bg=new T.ExtrudeGeometry(sh,{depth:D,bevelEnabled:true,bevelThickness:.005,bevelSize:.005,bevelSegments:2,curveSegments:6});bg.translate(0,0,-D/2);
    // the satchel faces outward (+x of the hip), so rotate its front to +x
    const body=grp(J.bag,0,0,0,0,Math.PI/2,0);
    mesh(bg,M(C.leatherL,{roughness:.75}),body);
    // flap
    const fs=new T.Shape();fs.moveTo(-W/2-.004,H/2+.004);fs.lineTo(W/2+.004,H/2+.004);fs.lineTo(W/2+.004,-.005);fs.quadraticCurveTo(0,-.035,-W/2-.004,-.005);fs.lineTo(-W/2-.004,H/2+.004);
    const fg=new T.ExtrudeGeometry(fs,{depth:.004,bevelEnabled:true,bevelThickness:.0015,bevelSize:.0015,bevelSegments:1,curveSegments:10});
    mesh(fg,M(C.leather,{roughness:.7}),body,0,0,D/2+.005);
    // top of the flap folding over
    mesh(new T.BoxGeometry(W+.012,.007,D+.012),M(C.leather,{roughness:.7}),body,0,H/2+.006,0);
    // flap stitching
    if(!GAME)for(let i=0;i<7;i++){const x=-W/2+.01+i*(W-.02)/6;mesh(new T.BoxGeometry(.006,.0015,.002),M(0xc8b088),body,x,H/2-.006,D/2+.0115)}
    // strap + buckle on the flap
    mesh(new T.BoxGeometry(.016,.05,.003),M(C.leatherD,{roughness:.7}),body,0,-.005,D/2+.012);
    const b2=grp(body,0,-.02,D/2+.0145);mesh(new T.TorusGeometry(.009,.0022,6,4),brass(),b2,0,0,0,0,0,Math.PI/4,1.1,.9,1);
    // little brass corners and a tag
    [-1,1].forEach(s=>mesh(new T.BoxGeometry(.012,.012,.006),brass(),body,s*(W/2-.002),-H/2+.004,D/2+.002,0,0,Math.PI/4));
    mesh(new T.BoxGeometry(.016,.022,.002),M(C.parch),body,W/2-.004,-.03,D/2+.012,0,0,-.25);
    // rolled map with red thread, and a quill, poking out the back corner
    mesh(new T.CylinderGeometry(.011,.011,.075,12),M(C.parch,{roughness:.85}),body,-W/2+.018,H/2+.018,-D/2+.014,0,0,.18);
    mesh(new T.TorusGeometry(.0115,.0018,6,14),M(0x8a2a22),body,-W/2+.021,H/2+.035,-D/2+.014,Math.PI/2,0,.18);
    const q=grp(body,-W/2+.04,H/2+.01,-D/2+.012,0,0,-.35);
    limb(q,-.0001+.09,.0012,.0012,M(0xd8ccb0),4).rotation.z=Math.PI;
    const vane=new T.SphereGeometry(1,GAME?5:10,GAME?4:8);mesh(vane,M(0xb8b0a0,{roughness:.9}),q,0,.065,0,0,0,0,.009,.032,.0015);
    mesh(new T.SphereGeometry(1,GAME?4:8,GAME?3:6),M(0x2a2622,{roughness:.9}),q,0,.09,0,0,0,0,.006,.012,.0016)}
  // strap
  tube(J.spine,[[.14,-.04,.06],[.13,.0,.1],[.09,.06,.124],[.03,.12,.123],[-.03,.17,.112],[-.075,.215,.08],[-.1,.245,.02],[-.095,.24,-.05],[-.07,.2,-.1],[0,.12,-.125],[.08,.03,-.115],[.135,-.03,-.06],[.152,-.06,-.02]],.0065,M(C.leatherD,{roughness:.7}),64);
  // strap buckle on the chest
  mesh(new T.TorusGeometry(.009,.0022,6,4),brass(),J.spine,.06,.09,.127,-.1,0,Math.PI/4+.6);

  // ---------- sheathed knife on his right hip ----------
  J.knife=grp(J.spine,-.152,-.035,-.035,.6,-.35,-.5);J.knife.scale.setScalar(.75);
  {const k=J.knife;
    const sg=new T.CylinderGeometry(.0145,.006,.13,10,4);sg.translate(0,-.065,0);
    mesh(sg,M(C.leatherD,{roughness:.65}),k,0,0,0,0,0,0,1,1,.5);
    mesh(new T.CylinderGeometry(.0158,.0158,.012,10),M(C.iron,{metalness:.7,roughness:.45}),k,0,-.004,0,0,0,0,1,1,.56);   // throat
    mesh(new T.ConeGeometry(.0075,.02,10),brass(),k,0,-.135,0,Math.PI,0,0,1,1,.6);                                // chape
    // tooled lines on the sheath
    if(!GAME)for(let i=0;i<3;i++)mesh(new T.BoxGeometry(.018-i*.003,.0018,.0105),M(C.leatherL),k,0,-.03-i*.03,0);
    // belt loop
    mesh(new T.TorusGeometry(.016,.004,6,12),M(C.leatherD),k,0,-.02,0,Math.PI/2,0,0,1,1,1).scale.set(1,1,.55);
    // hilt: crossguard, cord-wrapped grip, bone pommel
    mesh(new T.BoxGeometry(.04,.007,.012),M(C.iron,{metalness:.75,roughness:.4}),k,0,.006,0);
    if(!GAME)[-1,1].forEach(s=>mesh(new T.SphereGeometry(.0055,8,6),M(C.iron,{metalness:.75,roughness:.4}),k,s*.021,.006,0));
    const gr=limb(grp(k,0,.058,0),.05,.0075,.0085,M(0x4a2218,{roughness:.8}),10);
    for(let i=0;i<(GAME?2:6);i++)mesh(new T.TorusGeometry(.0086,.0018,5,12),M(0x2e140e),k,0,.014+i*.0075,0,Math.PI/2,0,0);
    mesh(new T.SphereGeometry(.011,12,10),M(C.bone,{roughness:.5}),k,0,.066,0,0,0,0,1,.85,1);
    mesh(new T.TorusGeometry(.004,.0013,5,10),brass(),k,0,.078,0)}

  // ---------- belt charms ----------
  J.charms=[];
  function charm(x,z,len,build){const g=grp(J.spine,x,-.035,z);g.userData.ph=Math.random()*6;J.charms.push(g);
    tube(g,[[0,0,0],[0,-len*.5,.002],[0,-len,0]],.0012,M(C.cord),6);const h=grp(g,0,-len,0);build(h);return g}
  charm(.06,.135,.03,h=>{ // iron key
    mesh(new T.TorusGeometry(.007,.0018,6,12),M(C.iron,{metalness:.7,roughness:.5}),h,0,-.007,0);
    mesh(new T.BoxGeometry(.0028,.026,.0028),M(C.iron,{metalness:.7,roughness:.5}),h,0,-.026,0);
    mesh(new T.BoxGeometry(.009,.004,.0028),M(C.iron,{metalness:.7,roughness:.5}),h,.004,-.036,0);mesh(new T.BoxGeometry(.006,.004,.0028),M(C.iron,{metalness:.7,roughness:.5}),h,.003,-.029,0)});
  charm(.09,.115,.022,h=>{ // little brass bell
    mesh(new T.SphereGeometry(.009,10,8,0,Math.PI*2,0,Math.PI*.6),brass(),h,0,-.009,0);
    mesh(new T.SphereGeometry(.0028,6,5),M(C.iron),h,0,-.017,0)});
  charm(.03,.145,.04,h=>{ // a carved bone
    mesh(new T.CylinderGeometry(.0028,.0028,.022,6),M(C.bone,{roughness:.6}),h,0,-.012,0);
    [-1,1].forEach(s=>[-1,1].forEach(e=>mesh(new T.SphereGeometry(.0034,6,5),M(C.bone,{roughness:.6}),h,e*.003,-.012+s*.012,0)))});

  // ---------- rest pose ----------
  const REST={
    hips:[0,0,0],spine:[.06,0,0],chest:[.04,0,0],neck:[-.05,0,0],head:[.06,0,0],
    shR:[.1,0,-.24],elR:[-.4,0,.05],haR:[.1,0,0],shL:[.1,0,.24],elL:[-.4,0,-.05],haL:[.1,0,0],
    thR:[-.42,0,.04],knR:[.78,0,0],ftR:[-.34,0,0],thL:[-.32,-.06,-.04],knL:[.62,0,0],ftL:[-.28,.06,0],
    earR:[0,0,0],earL:[0,0,0]
  };
  const JM={hips:J.hips,spine:J.spine,chest:J.chest,neck:J.neck,head:J.head,
    shR:J.R.sh,elR:J.R.el,haR:J.R.ha,shL:J.L.sh,elL:J.L.el,haL:J.L.ha,
    thR:J.LR.th,knR:J.LR.kn,ftR:J.LR.ft,thL:J.LL.th,knL:J.LL.kn,ftL:J.LL.ft,earR:J.ears[0],earL:J.ears[1]};
  for(const k in JM){const g=JM[k];g.userData.base=g.rotation.toArray().slice(0,3);g.userData.p0=g.position.clone()}
  function applyRest(){for(const k in JM){const b=JM[k].userData.base,r=REST[k];JM[k].rotation.set(b[0]+r[0],b[1]+r[1],b[2]+r[2])}}
  applyRest();
  // put the soles on the ground
  root.updateMatrixWorld(true);
  const bb=new T.Box3().setFromObject(J.LR.ft);const lift=-bb.min.y;J.hips.position.y+=lift;J.hips.userData.p0=J.hips.position.clone();
  root.updateMatrixWorld(true);

  // ---------- poses (offsets on top of REST) ----------
  const cur={},tgt={};for(const k in JM){cur[k]=[0,0,0];tgt[k]=[0,0,0]}
  let pose='idle',curDrop=0,tgtDrop=0,blink=0,nextBlink=2,sniff=0,nextSniff=4,twitch=[0,0],nextTwitch=[1.5,3.2];
  const lookY={v:0,t:0,next:3},lookX={v:0,t:0};
  function set(k,x,y,z){tgt[k][0]=x;tgt[k][1]=y;tgt[k][2]=z}
  function update(t,dt){
    for(const k in tgt)set(k,0,0,0);tgtDrop=0;
    const br=Math.sin(t*2.1);
    // breathing and weight shift
    set('spine',.012*br,0,.02*Math.sin(t*.55));set('chest',.018*br,0,0);set('hips',0,.03*Math.sin(t*.4),-.015*Math.sin(t*.55));
    set('shR',-.012*br,0,-.02*br);set('shL',-.012*br,0,.02*br);
    // look around
    lookY.next-=dt;if(lookY.next<0){lookY.t=(Math.random()-.5)*.9;lookX.t=(Math.random()-.4)*.25;lookY.next=2+Math.random()*3}
    lookY.v+=(lookY.t-lookY.v)*Math.min(1,dt*3);lookX.v+=(lookX.t-lookX.v)*Math.min(1,dt*3);
    // sniff: quick nods + whisker flutter
    nextSniff-=dt;if(nextSniff<0){sniff=.9;nextSniff=4+Math.random()*4}sniff=Math.max(0,sniff-dt);
    const sn=sniff>0?Math.sin(sniff*42)*.03*Math.min(1,sniff*3):0;
    set('neck',lookX.v*.4,lookY.v*.35,0);set('head',lookX.v*.6+sn,lookY.v*.65,-lookY.v*.12);
    // ear twitches
    for(let e=0;e<2;e++){nextTwitch[e]-=dt;if(nextTwitch[e]<0){twitch[e]=.35;nextTwitch[e]=2+Math.random()*5}twitch[e]=Math.max(0,twitch[e]-dt)}
    const tw=e=>twitch[e]>0?Math.sin(twitch[e]*28)*.18:0;
    set('earR',tw(0),tw(0)*.5,0);set('earL',tw(1),-tw(1)*.5,0);
    if(pose==='wave'){
      const w=Math.sin(t*7);
      set('shR',-.25,.15,-2.35);set('elR',-.15,-.2,-.55+w*.38);set('haR',0,-.6,0);
      set('spine',.012*br,0,.06);set('chest',.018*br,.12,0);set('head',.04+sn,.25+lookY.v*.2,.12);set('neck',0,.12,0);
      set('earR',.2,0,.1);set('earL',.2,0,-.1);set('shL',-.012*br,0,.06)}
    else if(pose==='alert'){
      tgtDrop=.035;
      set('hips',.05,0,0);set('spine',.18,0,0);set('chest',.1,-.1,0);set('neck',-.2+lookX.v*.3,lookY.v*.5,0);set('head',-.12,lookY.v*.6,0);
      set('thR',-.35,0,.05);set('knR',.55,0,0);set('ftR',-.15,0,0);set('thL',-.15,.1,-.04);set('knL',.4,0,0);set('ftL',-.17,0,0);
      set('shR',...GRIP.sh);set('elR',...GRIP.el);set('haR',...GRIP.ha);
      set('shL',-.35,-.25,.45);set('elL',-.7,0,-.2);set('haL',.3,0,0);
      set('earR',-.35,-.2,.25);set('earL',-.35,.2,-.25)}
    const k=1-Math.exp(-dt*7);
    for(const n in JM){const c=cur[n],g=tgt[n];for(let i=0;i<3;i++)c[i]+=(g[i]-c[i])*k;
      const b=JM[n].userData.base,r=REST[n];JM[n].rotation.set(b[0]+r[0]+c[0],b[1]+r[1]+c[1],b[2]+r[2]+c[2])}
    curDrop+=(tgtDrop-curDrop)*k;J.hips.position.y=J.hips.userData.p0.y-curDrop+.002*br;
    curl+=((pose==='alert'?1:0)-curl)*k;J.R.fing.forEach(f=>f.rotation.x=-.15-1.2*curl);
    // blink
    nextBlink-=dt;if(nextBlink<0){blink=.14;nextBlink=2.5+Math.random()*3.5}blink=Math.max(0,blink-dt);
    const ey=blink>0?.12:1;J.eyes.forEach(e=>e.scale.y=ey);
    // whiskers
    J.whisk.forEach((g,i)=>{g.rotation.y=(i?-1:1)*(.05*Math.sin(t*3+i)+(sniff>0?Math.sin(sniff*50)*.08:0));g.rotation.x=pose==='alert'?-.15:0});
    // tail sway (raised and stiff when alert)
    const al=pose==='alert'?1:0;
    J.tail.forEach((g,i)=>{const s=i/J.tail.length;
      g.rotation.y=g.userData.ry+Math.sin(t*1.25-i*.42)*(.035+.06*s)*(1-al*.6);
      g.rotation.x=g.userData.rx+(al?(i===0?.45:i<4?-.02:-.05):0)*1+Math.sin(t*.9-i*.3)*.015});
    // dangling things
    J.charms.forEach((g,i)=>{g.rotation.z=Math.sin(t*2.4+g.userData.ph)*.12;g.rotation.x=Math.sin(t*1.9+g.userData.ph)*.08});
    J.pend.rotation.x=-.12+Math.sin(t*2.1)*.04;J.pend.rotation.z=Math.sin(t*1.7)*.05;
    J.scarfTail.rotation.z=.15+Math.sin(t*1.6)*.06;J.scarfTail.rotation.x=Math.sin(t*1.3)*.08;
    if(J.tailBead)J.tailBead.rotation.x=Math.sin(t*2.2)*.25;
  }
  function setPose(p){pose=p}
  // the alert pose puts his right paw on the knife's grip: solve the arm angles once against the real hilt position
  const GRIP={sh:[.2,.2,-.25],el:[-.9,.5,.2],ha:[.3,.5,0]};
  if(opt.grip)(function solveGrip(){
    const save={};for(const n in JM)save[n]=JM[n].rotation.clone();
    const put=(n,o)=>{const b=JM[n].userData.base,r=REST[n];JM[n].rotation.set(b[0]+r[0]+o[0],b[1]+r[1]+o[1],b[2]+r[2]+o[2])};
    const A={hips:[.05,0,0],spine:[.18,0,0],chest:[.1,-.1,0],neck:[-.2,0,0],head:[-.12,0,0]};for(const n in A)put(n,A[n]);
    const hilt=new V3(),palm=new V3(),p=[...GRIP.sh,GRIP.el[0],GRIP.el[1],GRIP.ha[0],GRIP.ha[1]];
    const f=q=>{put('shR',[q[0],q[1],q[2]]);put('elR',[q[3],q[4],GRIP.el[2]]);put('haR',[q[5],q[6],0]);root.updateMatrixWorld(true);
      J.knife.localToWorld(hilt.set(0,.04,0));J.R.ha.localToWorld(palm.set(0,-.022,.01));
      return palm.distanceTo(hilt)+.004*Math.abs(q[5])+.004*Math.abs(q[6])};
    let best=f(p),step=.3;
    for(let it=0;it<80&&step>.003;it++){let imp=false;
      for(let i=0;i<p.length;i++)for(const d of[-1,1]){const q=p.slice();q[i]+=d*step;const v=f(q);if(v<best){best=v;p.splice(0,p.length,...q);imp=true}}
      if(!imp)step*=.5}
    GRIP.sh=p.slice(0,3);GRIP.el=[p[3],p[4],GRIP.el[2]];GRIP.ha=[p[5],p[6],0];GRIP.err=best;
    for(const n in JM)JM[n].rotation.copy(save[n]);root.updateMatrixWorld(true)})();
  let curl=0;
  // low-poly finish: every triangle flat, each with its own slight shade (as the game does for camp props and companions)
  if(LP){const fc=new TH.Color();root.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(!m.isMeshStandardMaterial)return;
    let g=o.geometry;const src=g;if(g.index){g=g.toNonIndexed();g.userData.src=src.type.replace('Geometry','')+(src.parameters&&src.parameters.radius!==undefined?' r'+src.parameters.radius.toFixed(3):'')+(src.parameters&&src.parameters.radiusTop!==undefined?' r'+Math.max(src.parameters.radiusTop,src.parameters.radiusBottom).toFixed(3):'')}const p=g.attributes.position,n=p.count;
    const old=g.attributes.color,c=new Float32Array(n*3);
    for(let i=0;i+2<n;i+=3){const q=Math.sin((p.getX(i)+p.getX(i+1))*129.898+(p.getY(i)+p.getY(i+2))*782.33+p.getZ(i)*377.19)*43758.5453,v=.86+.24*(q-Math.floor(q));
      for(let k=0;k<3;k++){const j=i+k;if(old)fc.setRGB(old.getX(j),old.getY(j),old.getZ(j));else fc.setRGB(1,1,1);c[j*3]=fc.r*v;c[j*3+1]=fc.g*v;c[j*3+2]=fc.b*v}}
    g.setAttribute('color',new TH.BufferAttribute(c,3));g.computeVertexNormals();o.geometry=g;
    m.vertexColors=true;m.flatShading=true;m.userData.lps=1;m.needsUpdate=true})}
  if(GAME&&!opt.nomerge){root.updateMatrixWorld(true);
    const bones=[],bi=new Map();root.traverse(o=>{if(o.isBone){bi.set(o,bones.length);bones.push(o)}});
    const inv=new TH.Matrix4().copy(root.matrixWorld).invert(),mw=new TH.Matrix4(),nm=new TH.Matrix3(),cc=new TH.Color(),v=new V3();
    const kinds={matte:[],metal:[],gloss:[]},dead=[];
    root.traverse(o=>{if(!o.isMesh)return;const m=o.material;let b=o.parent;while(b&&!b.isBone)b=b.parent;
      const kind=m.metalness>.5?'metal':m.roughness<.45?'gloss':'matte';kinds[kind].push({o,b:bi.get(b)});dead.push(o)});
    dead.forEach(o=>o.parent.remove(o));
    const MAT={matte:{roughness:.9,metalness:0,side:TH.DoubleSide},metal:{roughness:.4,metalness:.8},gloss:{roughness:.2,metalness:0}};
    const skel=new TH.Skeleton(bones);
    for(const k in kinds){const L=kinds[k];if(!L.length)continue;let n=0;L.forEach(e=>n+=e.o.geometry.attributes.position.count);
      const P=new Float32Array(n*3),Cl=new Float32Array(n*3),SI=new Uint16Array(n*4),SW=new Float32Array(n*4);let at=0;
      L.forEach(({o,b})=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=g.attributes.position,c=g.attributes.color,mc=o.material.color;
        mw.multiplyMatrices(inv,o.matrixWorld);const flip=mw.determinant()<0;
        for(let i=0;i<p.count;i++){const j=flip?(i%3==1?i+1:i%3==2?i-1:i):i;v.fromBufferAttribute(p,j).applyMatrix4(mw);P.set([v.x,v.y,v.z],at*3);
          if(c)cc.setRGB(c.getX(j),c.getY(j),c.getZ(j));else cc.setRGB(1,1,1);cc.multiply(mc);Cl.set([cc.r,cc.g,cc.b],at*3);
          SI[at*4]=b;SW[at*4]=1;at++}});
      const g=new TH.BufferGeometry();g.setAttribute('position',new TH.BufferAttribute(P,3));g.setAttribute('color',new TH.BufferAttribute(Cl,3));
      g.setAttribute('skinIndex',new TH.Uint16BufferAttribute(SI,4));g.setAttribute('skinWeight',new TH.BufferAttribute(SW,4));g.computeVertexNormals();
      const sm=new TH.SkinnedMesh(g,new TH.MeshStandardMaterial(Object.assign({vertexColors:true,flatShading:true,skinning:true},MAT[k])));
      sm.name='cheddar_'+k;sm.castShadow=sm.receiveShadow=true;sm.frustumCulled=false;root.add(sm);sm.bind(skel)}
    {const dm=new Set();dead.forEach(o=>{o.geometry.dispose();dm.add(o.material)});dm.forEach(m=>m.dispose())}   // the parts now live in the 3 merged meshes
    nMesh=Object.values(kinds).filter(l=>l.length).length;root.userData.bones=bones.length}
  let tris=0;root.traverse(o=>{if(o.isMesh){const g=o.geometry;tris+=(g.index?g.index.count:g.attributes.position.count)/3}});
  root.updateMatrixWorld(true);const all=new T.Box3().setFromObject(root);
  return {root,J,update,setPose,grip:GRIP,lowpoly:LP,game:GAME,stats:{bones:root.userData.bones||0,meshes:nMesh,tris:Math.round(tris),height:all.max.y-all.min.y}}
}
