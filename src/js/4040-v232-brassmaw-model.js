// ================= v232 Brassmaw, the Kiln Colossus — the model, poses and procedural animation =================
// The third Warden of the Balance (fight and foundry in 4042, moves in 4041). A walking furnace: a barrel chest of black iron
// plates banded and riveted in brass, a furnace door in the belly with a barred grate (the fire shows through), two smoke stacks
// on the shoulders, a small helm sunk between them with one glowing slit, arms like piledrivers ending in great hammer fists,
// short thick legs on broad iron feet, chains, slag crusted in every seam. The seams and the grate glow with his Heat (4042).
// Built like a Sovereign (svRig kit; rigid parts on named joints, merged by svMerge). He faces +z.
// Joints (L = +x): root · hips · spine · chest · neck · head · jaw (the grate's lower lip) · door · stkL/R (stacks) · shL/R · elL/R ·
// wrL/R (fists) · thL/R · knL/R · ftL/R. Poses (BM232P) are offsets from rest, mirrored with '~'.
var BM232={col:0xff7a2a,hot:0xff5a12,tris:0,sheet:{}};
function bm232Build(R,e){
  const iron=svMat(R,0x24262b,{roughness:.55,metalness:.6}),iron2=svMat(R,0x34373e,{roughness:.6,metalness:.55}),soot=svMat(R,0x121316,{roughness:.9,metalness:.2}),
    brass=svMat(R,0xb08a3a,{roughness:.4,metalness:.75}),brass2=svMat(R,0x7a5c22,{roughness:.5,metalness:.7}),slag=svMat(R,0x3a2a22,{roughness:.95}),
    fire=svMat(R,0x2a0c02,{roughness:.5,emissive:BM232.hot,emissiveIntensity:.8}),seam=svMat(R,0x180802,{roughness:.6,emissive:BM232.hot,emissiveIntensity:.35}),eye=svGlowMat(R,0xffd08a),ember=svGlowMat(R,0xffa040,.9);
  fire.userData.e0=BM232.hot;seam.userData.e0=BM232.hot;R.fire=fire;R.seam=seam;R.eyeM=eye;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),G=(k,f)=>svG('bm'+k,f),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz);
  const ball=(k,r,det,j)=>G('b'+k,()=>svLump(r,det==null?1:det,j||.12,120+k)),box=(k,x,y,z)=>G('x'+k,()=>new THREE.BoxGeometry(x,y,z).toNonIndexed()),
    cyl=(k,rt,rb,h,n)=>G('c'+k,()=>new THREE.CylinderGeometry(rt,rb,h,n||10,1).toNonIndexed()),rivet=G('rv',()=>new THREE.IcosahedronGeometry(.035,0)),
    band=(k,r,rz,t)=>G('bd'+k,()=>svLoft([[-t,r,rz],[t,r,rz]],14,{cap:false}));
  const rivets=(j,r,rz,y,n,m)=>{for(let k=0;k<n;k++){const a=k/n*6.283;Mm(j,rivet,m||brass,Math.sin(a)*r,y,Math.cos(a)*rz)}};
  // ---------------- the skeleton ----------------
  J('root',null,0,0,0);J('hips','root',0,1.55,0);J('spine','hips',0,.3,0);J('chest','spine',0,.75,.05);J('neck','chest',0,.95,.12);J('head','neck',0,.12,.06);J('jaw','head',0,-.2,.2);J('door','spine',0,.2,.92);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('stk'+L,'chest',s*.95,.9,-.35,-.1,0,s*-.12);
    J('sh'+L,'chest',s*1.35,.45,.05,0,0,s*.12);J('el'+L,'sh'+L,0,-1.15,0);J('wr'+L,'el'+L,0,-1.05,.05);
    J('th'+L,'hips',s*.62,-.1,0);J('kn'+L,'th'+L,0,-.7,.06);J('ft'+L,'kn'+L,0,-.62,0)});
  // ---------------- hips: an iron skirt of hanging plates, a brass girdle, chains ----------------
  Mm('hips',G('hp',()=>svLoft([[-.35,.85,.72],[.0,1.0,.86],[.34,1.02,.9]],14)),iron);Mm('hips',band(1,1.04,.9,.09),brass,0,.1,0);rivets('hips',1.06,.92,.1,14);
  for(let k=0;k<10;k++){const a=k/10*6.283+.31;Mm('hips',box(1,.42,.6,.07),k%2?iron2:iron,Math.sin(a)*.9,-.4,Math.cos(a)*.76,.12,a,0);Mm('hips',rivet,brass,Math.sin(a)*.95,-.2,Math.cos(a)*.8)}
  // ---------------- the furnace: belly barrel, the door with its barred grate, the fire behind it ----------------
  const brR=[[-.2,1.0,.88],[.3,1.14,1.0],[.8,1.12,.98],[1.15,.98,.86]];Mm('spine',G('br',()=>svLoft(brR,16)),iron);
  [.05,.55,1.02].forEach((y,i)=>{Mm('spine',band(2+i,[1.07,1.17,1.06][i],[.94,1.03,.93][i],.07),brass,0,y,0);rivets('spine',[1.09,1.19,1.08][i],[.96,1.05,.95][i],y,16)});
  for(let k=0;k<12;k++){const a=k/12*6.283+.26;if(Math.abs(svAng(a))<.6)continue;Mm('spine',G('sm',()=>new THREE.BoxGeometry(.035,.44,.03)),seam,Math.sin(a)*1.14,.3,Math.cos(a)*1.0,0,a,0)}
  Mm('spine',G('fc',()=>svLump(.62,1,.12,131)),fire,0,.3,.52,0,0,0,1,1,.5);svSpr(R,'spine',BM232.col,1.6,0,.3,1.05);
  Mm('spine',G('fr',()=>svLoft([[-.06,.62,.6],[.06,.66,.64]],12,{cap:false}).rotateX(Math.PI/2)),brass,0,.3,.96);rivets('door',.66,.66,0,0);
  for(let k=0;k<5;k++)Mm('door',cyl(1,.035,.035,1.1,6),iron2,-.4+k*.2,0,.04,0,0,0,1,1-Math.abs(k-2)*.13,1);                                    // the bars (on the door joint: they lift when he vents)
  Mm('door',box(2,1.25,.09,.08),brass2,0,.52,.05);Mm('door',box(2,1.25,.09,.08),brass2,0,-.52,.05);
  // ---------------- chest: the boiler shoulders, a brass collar, gauges, pipes down the back ----------------
  Mm('chest',G('ch',()=>svLoft([[-.3,1.0,.88],[.2,1.3,.9],[.62,1.34,.84],[.95,.8,.62]],14)),iron2);Mm('chest',band(5,1.33,.9,.08),brass,0,.4,0);rivets('chest',1.35,.92,.4,16);
  Mm('chest',G('cl',()=>svLoft([[.86,.62,.56],[1.1,.5,.48]],12)),brass2);
  [-1,1].forEach(s=>{Mm('chest',cyl(2,.14,.14,.06,10),brass,s*.5,.5,.86,Math.PI/2,0,0);Mm('chest',cyl(3,.1,.1,.07,8),soot,s*.5,.5,.87,Math.PI/2,0,0);Mm('chest',box(3,.015,.09,.02),eye,s*.5,.52,.91,0,0,s*.6);
    Mm('chest',G('pp',()=>svTube([[0,.7,-.5],[.1,.3,-.86],[.12,-.5,-.9],[.05,-1.2,-.7]],[.11,.11,.1,.09],6)),brass2,s*.5,0,0,0,0,0,s,1,1);
    for(let k=0;k<3;k++)Mm('chest',band(6,.13,.13,.03),brass,s*(.6+k*.01),.2-k*.5,-.88,0,0,0)});
  Mm('chest',G('tk',()=>svLump(.5,1,.1,132)),iron,0,.1,-.8,0,0,0,1.1,1.5,.7);
  for(let k=0;k<7;k++){const a=(k-3)*.36;Mm('chest',ball(1,.13,0,.5),slag,Math.sin(a)*1.25,.72+((k*7)%3)*.05,Math.cos(a)*.7-.1,k,k*2,0,1.3,.6,1)}
  // smoke stacks
  [-1,1].forEach(s=>{const L=s>0?'L':'R',st='stk'+L;Mm(st,G('st',()=>svLoft([[0,.3,.3],[.8,.25,.25],[1.5,.27,.27],[1.62,.32,.32]],10,{cap:false})),iron);Mm(st,band(7,.3,.3,.05),brass,0,.25,0);Mm(st,band(7,.3,.3,.05),brass,0,1.5,0,0,0,0,1.05,1,1.05);
    Mm(st,cyl(4,.24,.24,.04,10),fire,0,1.52,0);svSpr(R,st,BM232.col,.9,0,1.7,0)});
  // ---------------- head: a pot helm sunk in the collar, one slit, a grated jaw ----------------
  Mm('head',G('hm',()=>svLoft([[-.25,.4,.38],[.1,.44,.42],[.4,.36,.36],[.56,.16,.18]],10)),iron);Mm('head',band(8,.45,.43,.05),brass,0,.1,0);
  Mm('head',box(4,.52,.06,.05),eye,0,.2,.41);svSpr(R,'head',BM232.col,.9,0,.2,.46);Mm('head',box(5,.07,.5,.08),brass2,0,.22,.42);
  Mm('head',G('cs',()=>svHorn(.09,.4,0,.1,5,3)),brass2,0,.5,-.1,-1.2,0,0);
  Mm('jaw',G('jw',()=>svLoft([[-.16,.38,.3],[.02,.4,.32]],10,{cap:false})),iron2,0,0,-.14);for(let k=0;k<5;k++)Mm('jaw',box(6,.04,.2,.04),brass2,-.24+k*.12,-.06,.18-Math.abs(k-2)*.02);
  // ---------------- arms: pauldron drums, a piston upper arm, a banded forearm, the hammer fist ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',sh='sh'+L,el='el'+L,wr='wr'+L;
    Mm(sh,G('pd',()=>svLoft([[-.4,.5,.56],[0,.62,.66],[.36,.5,.56]],12).rotateZ(Math.PI/2)),iron,0,.12,0);Mm(sh,band(9,.64,.68,.06).clone().rotateZ(Math.PI/2),brass,0,.12,0);
    for(let k=0;k<6;k++){const a=k/6*6.283;Mm(sh,rivet,brass,s*.02,.12+Math.sin(a)*.66,Math.cos(a)*.7,0,0,0,1.6)}
    Mm(sh,G('ua',()=>svLoft([[-.2,.3,.3],[-.7,.26,.26],[-1.15,.3,.3]],9)),soot);Mm(sh,cyl(5,.12,.12,.9,7),brass2,s*.26,-.62,-.1);Mm(sh,cyl(6,.07,.07,1.0,6),iron2,s*.26,-.62,-.1);
    Mm(el,ball(2,.36,1,.1),iron2);Mm(el,G('fa',()=>svLoft([[-.1,.34,.36],[-.6,.44,.46],[-1.05,.4,.42]],10)),iron);[-.3,-.62,-.94].forEach((y,i)=>{Mm(el,band(10,.43+((i==1)?.03:0),.45+((i==1)?.03:0),.045),brass,0,y,0);});
    for(let k=0;k<5;k++){const a=k*1.26;Mm(el,G('sm2',()=>new THREE.BoxGeometry(.03,.26,.03)),seam,Math.sin(a)*.44,-.47,Math.cos(a)*.46,0,a,0)}
    // the fist: a block hammer head with brass striking faces, knuckle studs, slag crust
    Mm(wr,box(7,.95,.8,1.05),iron2,0,-.42,.05);Mm(wr,box(8,.8,.66,.08),brass,0,-.42,.6);Mm(wr,box(8,.8,.66,.08),brass,0,-.42,-.5);Mm(wr,box(9,.99,.12,1.09),brass2,0,-.08,.05);Mm(wr,box(9,.99,.12,1.09),brass2,0,-.78,.05);
    for(let k=0;k<4;k++)Mm(wr,G('kn',()=>svHorn(.08,.16,0,0,4,2)),brass,(k-1.5)*.2,-.3,.64);for(let k=0;k<4;k++)Mm(wr,ball(1,.12,0,.5),slag,s*(.3-k*.2),-.84,(k%2)*.4-.1,k,0,k*2,1.2,.5,1.2);
    Mm(wr,G('sm3',()=>new THREE.BoxGeometry(.78,.035,.02)),seam,0,-.42,.645);Mm(wr,G('ch1',()=>svTube([[0,0,0],[.06,-.3,-.05],[0,-.6,0],[-.05,-.86,.04]],[.03,.03,.03,.03],4)),iron,s*.5,-.1,-.3)});
  // ---------------- legs: short iron thighs, knee caps, flared shins, broad feet ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',th='th'+L,kn='kn'+L,ft='ft'+L;
    Mm(th,G('tg',()=>svLoft([[.05,.44,.46],[-.4,.4,.42],[-.7,.34,.36]],10)),soot);Mm(th,band(11,.45,.47,.05),brass2,0,-.2,0);
    Mm(kn,G('kc',()=>svLump(.3,1,.1,133)),brass2,0,.02,.26,0,0,0,1,1,.6);Mm(kn,G('sn',()=>svLoft([[.05,.34,.36],[-.3,.38,.42],[-.62,.48,.5]],10)),iron);Mm(kn,band(12,.5,.52,.05),brass,0,-.56,0);
    Mm(ft,G('ft',()=>svLoft([[.02,.5,.56,0,.08],[-.3,.6,.76,0,.16]],8)),iron2);Mm(ft,box(10,.9,.1,.5),brass2,0,-.26,.66);for(let k=0;k<3;k++)Mm(ft,G('tc',()=>svHorn(.1,.24,0,-.04,4,2)),iron,(k-1)*.3,-.2,.86)});
  if(!BM232.tris)BM232.tris=wk232Tris(R);R.headJ='head'}
// ---------------- poses (offsets from rest: [rx, ry, rz, px, py, pz]; an arm hangs down -y: rx − swings it forward and up) ----------------
var BM232P={
  idle:{},
  cRec:{hips:[0,0,0,0,-.05,0],shL:[-.1,0,.06],shR:[-.1,0,-.06]},
  // Hammer Combo: right hook wound back and thrown across, the left, then both fists overhead and down
  rUp:{hips:[0,-.3,0],spine:[0,-.3,0],chest:[-.05,-.4,0],shR:[.7,0,-.9],elR:[-1.0,0,0],shL:[-.5,0,.2],elL:[-.7,0,0],thL:[-.3,0,0],knL:[.3,0,0]},
  rCut:{hips:[.05,.35,0,0,-.08,.25],spine:[.08,.35,0],chest:[.12,.5,0],shR:[-1.35,0,.55],elR:[-.35,0,0],shL:[.3,0,.2],elL:[-.4,0,0],thL:[-.5,0,0],knL:[.45,0,0],thR:[.3,0,0]},
  ohUp:{hips:[-.12,0,0,0,.06,-.1],spine:[-.2,0,0],chest:[-.3,0,0],head:[-.2,0,0],shL:[-2.7,0,.25],elL:[-.5,0,0],shR:[-2.7,0,-.25],elR:[-.5,0,0],thL:[-.2,0,0],thR:[.1,0,0]},
  ohSlam:{hips:[.3,0,0,0,-.4,.3],spine:[.35,0,0],chest:[.35,0,0],head:[.15,0,0],shL:[-.75,0,-.2],elL:[-.2,0,0],shR:[-.75,0,.2],elR:[-.2,0,0],thL:[-.8,0,0],knL:[.9,0,0],thR:[-.3,0,0],knR:[.7,0,0]},
  // Shoulder Charge: low, the left shoulder forward; the run
  chLow:{hips:[.3,.5,0,0,-.35,-.15],spine:[.2,.2,0],chest:[.2,.2,0],head:[-.2,-.5,0],shL:[-.4,0,.5],elL:[-1.6,0,0],shR:[.6,0,-.3],elR:[-.6,0,0],thL:[-.6,0,0],knL:[.9,0,0],thR:[.1,0,0],knR:[.6,0,0]},
  chGo:{hips:[.4,.55,0,0,-.25,.35],spine:[.25,.2,0],chest:[.2,.25,0],head:[-.25,-.5,0],shL:[-.5,0,.6],elL:[-1.7,0,0],shR:[.9,0,-.35],elR:[-.4,0,0],thL:[-1.0,0,0],knL:[.7,0,0],thR:[.6,0,0],knR:[.5,0,0]},
  // Backhand: the right arm wound across the body, then swung out and round behind
  bkUp:{hips:[0,.6,0],spine:[0,.5,0],chest:[0,.5,0],head:[0,-.7,0],shR:[-.9,0,.9],elR:[-1.1,0,0],shL:[.2,0,.3],thR:[-.2,0,0],knR:[.3,0,0]},
  bkCut:{hips:[0,-1.0,0,0,-.1,0],spine:[0,-.7,0],chest:[0,-.7,0],head:[0,.8,0],shR:[-1.3,0,-1.2],elR:[-.1,0,0],shL:[-.3,0,.4],elL:[-.5,0,0],thL:[-.2,0,0],knL:[.4,0,0]},
  // Slag Toss: a scoop low behind, the overarm lob
  tsUp:{hips:[.15,-.4,0,0,-.2,0],spine:[.15,-.3,0],chest:[.1,-.3,0],shR:[.9,0,-.5],elR:[-.4,0,0],shL:[-.6,0,.2],elL:[-.8,0,0],thL:[-.3,0,0],knL:[.5,0,0]},
  toss:{hips:[-.05,.35,0,0,.05,.15],spine:[-.1,.3,0],chest:[-.1,.35,0],head:[-.2,0,0],shR:[-2.5,0,.15],elR:[-.2,0,0],shL:[.3,0,.2],thR:[.2,0,0]},
  // Furnace Breath / venting: leaning in, arms spread, the door bars lifted, the jaw dropped
  brIn:{hips:[-.12,0,0,0,.05,-.1],spine:[-.15,0,0],chest:[-.2,0,0],head:[-.15,0,0],shL:[.3,0,.7],elL:[-.9,0,0],shR:[.3,0,-.7],elR:[-.9,0,0],door:[0,0,0,0,.25,0]},
  breath:{hips:[.2,0,0,0,-.2,.15],spine:[.22,0,0],chest:[.15,0,0],head:[.1,0,0],jaw:[.6,0,0],shL:[.5,0,1.0],elL:[-.5,0,0],shR:[.5,0,-1.0],elR:[-.5,0,0],door:[0,0,0,0,.95,0],thL:[-.4,0,0],knL:[.5,0,0],thR:[-.4,0,0],knR:[.5,0,0]},
  // Ground Pound: a knee raised high; the stomp
  stUp:{hips:[-.1,0,.1,0,.1,0],spine:[-.1,0,-.08],chest:[-.1,0,0],shL:[-.9,0,.8],elL:[-.6,0,0],shR:[-.9,0,-.8],elR:[-.6,0,0],thR:[-1.4,0,0],knR:[1.5,0,0],ftR:[-.3,0,0]},
  stomp:{hips:[.15,0,-.05,0,-.3,.1],spine:[.12,0,0],chest:[.1,0,0],shL:[.2,0,.5],elL:[-.3,0,0],shR:[.2,0,-.5],elR:[-.3,0,0],thR:[-.5,0,0],knR:[.7,0,0],thL:[-.2,0,0],knL:[.5,0,0]},
  // the roar; overheating (hunched, shaking, bars up); quenched (on one knee, fists on the floor)
  roar:{hips:[-.15,0,0,0,.06,0],spine:[-.2,0,0],chest:[-.25,0,0],head:[-.4,0,0],jaw:[.7,0,0],shL:[-.6,0,1.2],elL:[-.9,0,0],shR:[-.6,0,-1.2],elR:[-.9,0,0],door:[0,0,0,0,.5,0]},
  heat:{hips:[.25,0,0,0,-.45,0],spine:[.3,0,0],chest:[.25,0,0],head:[.3,0,0],jaw:[.4,0,0],shL:[-.2,0,.5],elL:[-1.5,0,0],shR:[-.2,0,-.5],elR:[-1.5,0,0],door:[0,0,0,0,.95,0],thL:[-.7,0,0],knL:[1.0,0,0],thR:[-.7,0,0],knR:[1.0,0,0]},
  blast:{hips:[-.2,0,0,0,.12,0],spine:[-.3,0,0],chest:[-.35,0,0],head:[-.5,0,0],jaw:[.8,0,0],shL:[-1.0,0,1.4],elL:[-.1,0,0],shR:[-1.0,0,-1.4],elR:[-.1,0,0],door:[0,0,0,0,.95,0]},
  stag:{hips:[.3,.1,.08,0,-.75,0],spine:[.35,0,.06],chest:[.3,0,.05],head:[.45,.2,.1],jaw:[.3,0,0],shL:[-.5,0,.15],elL:[-.2,0,0],shR:[-.4,0,-.2],elR:[-.3,0,0],thL:[-1.3,0,0],knL:[1.5,0,0],thR:[.2,0,0],knR:[1.3,0,0],ftR:[-.6,0,0]},
  dead:{root:[0,0,0,0,-.9,0],hips:[1.35,0,.1,0,0,.6],spine:[.1,0,0],chest:[.1,0,0],head:[.3,.4,0],jaw:[.5,0,0],shL:[-2.2,0,.5],elL:[-.3,0,0],shR:[-1.6,0,-.8],elR:[-.6,0,0],thL:[-.3,0,.15],knL:[.5,0,0],thR:[.2,0,-.1],knR:[.3,0,0]}};
// ---------------- procedural layer: a heavy two-beat walk, the boiler breathing, stacks rattling, the head tracking ----------------
function bm232Loco(e,S,O,dt,now){const t=now/1000,sp=S.spd||0,a=Math.min(1,sp/1.8);S.gp=(S.gp||0)+dt*(1.2+sp*1.9);const g=S.gp,br=Math.sin(t*.9);
  O.hips[4]+=.02*br-.1*Math.abs(Math.sin(g))*a;O.chest[0]+=.02*br;O.spine[0]+=.015*br;
  ['L','R'].forEach((s,j)=>{const ph=g+j*Math.PI,sw=Math.sin(ph),lf=Math.max(0,Math.cos(ph)),sg=j?-1:1;O['th'+s][0]+=sw*.4*a;O['kn'+s][0]+=lf*.6*a;O['ft'+s][0]+=-lf*.25*a;
    O['sh'+s][0]+=-sw*.16*a+.02*br;O['el'+s][0]+=-.1*a-.03*br;O['sh'+s][2]+=sg*.03*br});
  O.hips[2]+=Math.sin(g)*.07*a;O.spine[2]+=-Math.sin(g)*.04*a;O.hips[1]+=Math.sin(g)*.05*a;
  const rt=.012*Math.sin(t*31)*(.3+a+(S.chg||0)*2);O.stkL[2]+=rt;O.stkR[2]-=rt;O.jaw[0]+=.05+.04*br;O.door[4]+=.03*Math.max(0,br);
  const m=e.m,hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,yaw=svAng(Math.atan2(hx,hz)-m.rotation.y),k=S.mv?0:(Math.abs(yaw)<1.6?1:0);
  S.hy=(S.hy||0)+((Math.max(-.9,Math.min(.9,yaw))*k)-(S.hy||0))*Math.min(1,dt*2.2);O.head[1]+=S.hy*.8;O.chest[1]+=S.hy*.15}
// after the pose: fire and seams follow his Heat (S.heat 0..1, 4042), smoke from the stacks, embers from the grate
function bm232Post(e,S,dt,now){const R=S.R,t=now/1000,h=Math.max(0,Math.min(1,S.heat||0)),ch=S.chg||0,ph2=S.ph>1;
  R.fire.emissiveIntensity=.7+h*1.3+.15*Math.sin(t*7)+ch*1.2;R.seam.emissiveIntensity=.12+h*1.5+ch*1.2;const c=h>.85||ch>.6?0xffd27a:h>.5?0xff7a2a:BM232.hot;R.fire.emissive.setHex(c);R.seam.emissive.setHex(c);R.eyeM.color.setHex(h>.85?0xffffff:0xffd08a);
  if(!S.dieM&&Math.random()<dt*(4+h*10)){const j=Math.random()<.5?'stkL':'stkR',p=svWP(e,j,0,1.7,0);burst(p,h>.6?0xff9a40:0x3a3836,1,.25,1.6+h,1.2)}
  if(!S.dieM&&Math.random()<dt*(2+h*12+ch*10)){const p=svWP(e,'spine',(Math.random()-.5)*.8,.3+(Math.random()-.5)*.6,1.0);burst(p,0xffa040,1,.5,.8,.5)}}
BM232.sheet.boss=()=>{const R=svRig();bm232Build(R,null);svRest(R);svMerge(R);return R.root};
