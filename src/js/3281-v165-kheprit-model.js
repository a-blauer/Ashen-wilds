// ================= v165 Kheprit, the Last Warden — the model, poses and procedural animation =================
// The guardian of the Sunken Temple, broken apart and his pieces sealed in urns round his courtyard (3282). An insect warden: a
// humanoid torso standing up out of the front of an ant's body.
//  * The lower body: a long thorax carried level on six jointed legs (coxa, femur, tibia, a hooked claw), a great ringed abdomen
//    behind it. The upper body: an upright armoured torso with two arms (three-fingered claws), a narrow waist where it joins the
//    thorax. The head: an ant's head (heart-shaped, big compound eyes, two elbowed antennae, curved mandibles).
//  * His carapace is a dusty sand colour (lighter on the plates, darker in the seams and on the joints), worn smooth and chipped,
//    with the Warden's marks on it: a gold collar, gold bands on his arms, glyphs scratched on his plates, a torn linen sash.
//  * One rig is the whole creature (kh165Build). The same rig lies on the altar as the remains: each of the eleven parts is a joint
//    subtree (KH165.parts) shown as it is laid there; then the rig wakes, stands and walks. kh165PartMesh(i) gives a loose copy
//    of one part (in its urn, on the ground, carried).
// Joints (L = +x): root · thorax · abd · waist · torso · neck · head · mandL/R · antL/R · antL2/R2 · shL/R · elL/R · wrL/R ·
// cx1L/R fe1L/R ti1L/R (front legs) · cx2… (middle) · cx3… (hind). Poses KH165P; parts: 0 head · 1 torso · 2 abdomen ·
// 3 left arm · 4 right arm · 5–7 left legs (front, middle, hind) · 8–10 right legs.
var KH165={col:0xc8a878,tris:0,parts:['head','torso','abdomen','left arm','right arm','left foreleg','left middle leg','left hind leg','right foreleg','right middle leg','right hind leg'],
  pj:['head',null,'abd','shL','shR','cx1L','cx2L','cx3L','cx1R','cx2R','cx3R'],ic:['🐜','🦺','🥚','💪','💪','🦵','🦵','🦵','🦵','🦵','🦵'],sheet:{}};
function kh165Build(R){
  const shell=svMat(R,0xc8a878,{roughness:.62}),shell2=svMat(R,0xb0905e,{roughness:.66}),seam=svMat(R,0x5a4630,{roughness:.8}),pale=svMat(R,0xdcc8a0,{roughness:.7}),
    joint=svMat(R,0x4a3a28,{roughness:.75}),gold=svMat(R,0xd8a840,{roughness:.3,metalness:.75}),linen=svMat(R,0xd8ccb0,{roughness:.95,side:THREE.DoubleSide}),mark=svMat(R,0x6a4a2a,{roughness:.9}),
    eye=svMat(R,0x1a2a28,{roughness:.2,metalness:.4,emissive:0x0a3a30,emissiveIntensity:.0}),claw=svMat(R,0x3a2a1a,{roughness:.5});
  R.eyeM=eye;R.shellMs=[shell,shell2,pale];
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz),G=(k,f)=>svG('kh'+k,f);
  const box=(j,m,x,y,z,w,h,d,rx,ry,rz)=>Mm(j,G('bx',()=>new THREE.BoxGeometry(1,1,1)),m,x,y,z,rx||0,ry||0,rz||0,w,h,d);
  const egg=(j,k,m,x,y,z,sx,sy,sz,rx,ry,rz)=>Mm(j,G('eg'+k,()=>new THREE.SphereGeometry(1,14,10)),m,x,y,z,rx||0,ry||0,rz||0,sx,sy,sz);
  // ---------------- the skeleton ----------------
  J('root',null,0,0,0);J('thorax','root',0,.98,0);J('abd','thorax',0,.05,-.55,-.18);J('waist','thorax',0,.18,.62,-.35);J('torso','waist',0,.32,0,.32);
  J('neck','torso',0,.78,.08,-.1);J('head','neck',0,.18,.1,.15);R.J.head.scale.setScalar(1.3);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('mand'+L,'head',s*.1,-.16,.26,0,s*-.25,0);J('ant'+L,'head',s*.1,.12,.2,-.6,s*.35,s*-.3);J('ant'+L+'2','ant'+L,0,.42,0,1.1,0,0);
    J('sh'+L,'torso',s*.36,.62,.0,-.15,0,s*-.3);J('el'+L,'sh'+L,0,-.55,0,-.6);J('wr'+L,'el'+L,0,-.55,0,.1);
    // legs: front legs reach forward, hind legs back; each a coxa out to the side, a femur rising, a tibia down to the ground
    [[1,.42,.55],[2,0,0],[3,-.4,-.55]].forEach(([i,z,yaw])=>{J('cx'+i+L,'thorax',s*.26,-.05,z,0,s*(Math.PI/2)-s*yaw,0);J('fe'+i+L,'cx'+i+L,0,0,.18,-.95);J('ti'+i+L,'fe'+i+L,0,0,.85,2.0)})});
  // ---------------- the thorax: a long, narrow armoured body carried level, ringed plates over it ----------------
  Mm('thorax',G('th',()=>svLoftZ([[-.55,.26,.22,0,0],[-.2,.32,.26,0,.02],[.25,.33,.27,0,.03],[.6,.24,.2,0,0]],12)),shell);
  for(let k=0;k<4;k++){Mm('thorax',G('thp',()=>svLoftZ([[-.13,.34,.29,0,.03],[.13,.34,.29,0,.03]],12,{cap:false})),k%2?shell2:shell,0,.02,-.42+k*.3,0,0,0,1,1,1);box('thorax',seam,0,.28,-.27+k*.3,.06,.06,.04)}
  egg('thorax',1,pale,0,-.18,0,.24,.1,.5);
  // ---------------- the abdomen: a great ringed gaster, pale bands between the plates ----------------
  Mm('abd',G('ab',()=>svLoftZ([[.1,.24,.2,0,0],[-.3,.5,.44,0,.05],[-.85,.56,.5,0,.04],[-1.35,.42,.36,0,0],[-1.65,.12,.1,0,-.02]],14)),shell);
  for(let k=0;k<4;k++)Mm('abd',G('abr'+k,()=>{const z=-.3-k*.33,r=[.5,.56,.53,.44][k];return svLoftZ([[z+.04,r+.02,r*.9+.02,0,.05],[z-.04,r+.02,r*.9+.02,0,.05]],14,{cap:false})}),k%2?seam:pale);
  for(let k=0;k<5;k++)box('abd',mark,0,.48-Math.abs(k-2)*.02,-.35-k*.25,.05,.04,.12,0,0,k%2?.3:-.3);
  // ---------------- the waist and the upright torso: a chest of overlapping plates, a gold collar, the linen sash ----------------
  Mm('waist',G('ws',()=>svLoft([[-.05,.16,.14],[.35,.14,.12]],10)),joint);
  Mm('torso',G('to',()=>svLoft([[-.02,.2,.17,0,0],[.25,.3,.22,0,.02],[.52,.36,.24,0,.03],[.72,.3,.2,0,.0],[.84,.15,.12,0,-.01]],12)),shell);
  for(let k=0;k<4;k++){Mm('torso',G('tp'+k,()=>svLoft([[.08+k*.17,.31-Math.abs(k-1.5)*.03+.02,.23,0,.02],[.18+k*.17,.31-Math.abs(k-1.5)*.03+.02,.23,0,.02]],12,{cap:false})),k%2?shell2:shell)}
  egg('torso',2,pale,0,.4,.17,.2,.28,.1);for(let k=0;k<3;k++)box('torso',seam,0,.2+k*.14,.24,.22,.02,.03);
  for(let k=0;k<12;k++){const a=k/12*Math.PI*2;Mm('torso',G('cl',()=>new THREE.BoxGeometry(.12,.06,.05)),k%2?gold:seam,Math.sin(a)*.27,.74,Math.cos(a)*.2,0,a,0)}
  Mm('torso',G('clr',()=>new THREE.TorusGeometry(.26,.035,4,16)),gold,0,.75,.02,Math.PI/2,0,0,1,1.25,1);
  // the sash: torn linen across the chest and hanging off the waist
  Mm('torso',G('sh',()=>{const g=new THREE.PlaneGeometry(.18,1.0,1,4);const P=g.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i);P.setZ(i,Math.sin(y*3)*.03)}return g}),linen,.05,.35,.26,0,0,.7);
  for(let k=0;k<3;k++)Mm('waist',G('sh2',()=>new THREE.PlaneGeometry(.12,.5,1,3)),linen,-.12+k*.12,-.15,.12,.25,0,(k-1)*.2);
  // scratched glyphs on the shoulders' plates
  [-1,1].forEach(s=>{for(let k=0;k<3;k++)box('torso',mark,s*.2,.5+k*.08,.24,.08,.025,.02,0,0,s*.3)});
  // ---------------- the head: heart-shaped, compound eyes, elbowed antennae, curved mandibles ----------------
  Mm('neck',G('nk',()=>svLoft([[-.02,.08,.07],[.2,.07,.06]],8)),joint);
  egg('head',3,shell,0,.02,.05,.24,.2,.26);egg('head',4,shell2,-.1,.06,.02,.14,.15,.16);egg('head',4,shell2,.1,.06,.02,.14,.15,.16);
  [-1,1].forEach(s=>{egg('head',5,eye,s*.2,.04,.13,.1,.12,.13,0,s*.4,0);egg('head',6,seam,s*.06,-.1,.28,.06,.04,.04)});
  box('head',seam,0,-.07,.27,.16,.05,.05);for(let k=0;k<3;k++)box('head',mark,0,.17-k*.05,.21,.06,.015,.02);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';Mm('mand'+L,G('md',()=>svHorn(.065,.44,s*0,-.1,5,5)),shell2,0,0,0,0,s*-.35,0,1,1,1);for(let k=0;k<3;k++)Mm('mand'+L,G('mdt',()=>new THREE.ConeGeometry(.012,.05,4)),claw,-s*.03,-.03,.08+k*.08,0,0,-s*Math.PI/2);
    Mm('ant'+L,G('a1',()=>svTube([[0,0,0],[0,.42,0]],[.025,.02],5)),joint);Mm('ant'+L+'2',G('a2',()=>svTube([[0,0,0],[0,.18,.05],[0,.38,.06]],[.02,.016,.022],5)),joint);egg('ant'+L+'2',7,seam,0,.4,.06,.035,.05,.035)});
  // ---------------- arms: plated upper arm and forearm, a gold band, a three-fingered claw ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R';egg('sh'+L,8,shell2,0,-.02,0,.14,.14,.14);Mm('sh'+L,G('ua',()=>svLoft([[0,.09,.09],[-.52,.075,.07]],9)),shell);
    egg('el'+L,9,joint,0,0,0,.08,.08,.08);Mm('el'+L,G('fa',()=>svLoft([[0,.075,.07],[-.25,.095,.085],[-.52,.065,.06]],9)),shell2);Mm('el'+L,G('ab2',()=>svLoft([[-.18,.1,.09],[-.26,.1,.09]],10,{cap:false})),gold);
    for(let f=0;f<3;f++){const a=(f-1)*.5;Mm('wr'+L,G('fg',()=>svTube([[0,0,0],[0,-.1,.03],[0,-.18,.08]],[.03,.022,.01],5)),claw,Math.sin(a)*.05,-.03,Math.cos(a)*.04)}});
  // ---------------- legs: coxa, a long femur, a thin tibia with spines, a hooked claw ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R';[1,2,3].forEach(i=>{egg('cx'+i+L,10,joint,0,0,.05,.09,.08,.12);
    Mm('fe'+i+L,G('fe',()=>svTube([[0,0,0],[0,.04,.42],[0,0,.85]],[.085,.095,.065],8)),shell);Mm('fe'+i+L,G('fe2',()=>svTube([[0,.04,.2],[0,.07,.5]],[.04,.03],5)),shell2);
    egg('ti'+i+L,11,joint,0,0,0,.06,.06,.06);Mm('ti'+i+L,G('ti',()=>svTube([[0,0,0],[0,.03,.5],[0,0,1.0],[0,-.04,1.5],[0,0,1.95]],[.065,.06,.05,.04,.03],7)),shell2);
    for(let k=0;k<3;k++)Mm('ti'+i+L,G('sp',()=>new THREE.ConeGeometry(.012,.08,4)),claw,0,-.05,.5+k*.45,Math.PI*.7,0,0);Mm('ti'+i+L,G('cw',()=>svHorn(.03,.18,0,-.08,4,3)),claw,0,0,1.95)})});
  // the parts: which meshes belong to which of the eleven pieces (a joint subtree; the torso is what is left on the thorax)
  R.part=KH165.pj.map((j,i)=>i===1?null:R.J[j]);
  if(!KH165.tris){let n=0;R.root.traverse(o=>{if(o.isMesh){const g=o.geometry;n+=g.index?g.index.count/3:g.attributes.position.count/3}});KH165.tris=Math.round(n)}
  R.headJ='head'}
// show / hide one part of a rig (the torso part: the meshes hanging directly on the thorax, waist, torso and neck joints)
function kh165PartShow(R,i,on){if(i===1){['thorax','waist','torso','neck'].forEach(j=>R.J[j].children.forEach(o=>{if(o.isMesh||o.isSprite)o.visible=on}));return}const J=R.part[i];if(J)J.visible=on}
// a loose copy of one part (its own little merged model, origin at the part's joint), for urns, the ground and the hand
function kh165PartMesh(i){const C=KH165.pc||(KH165.pc={});if(C[i])return C[i].clone();const R=svRig();kh165Build(R);svRest(R);R.root.updateMatrixWorld(true);const g=new THREE.Group();
  if(i===1){const keep=new Set();['thorax','waist','torso','neck'].forEach(j=>keep.add(R.J[j]));// strip the other parts
    KH165.pj.forEach((j,k)=>{if(k!==1&&j)R.J[j].parent.remove(R.J[j])});R.J.thorax.position.set(0,0,0);g.add(R.J.thorax)}
  else{const J=R.J[KH165.pj[i]];J.parent.remove(J);J.position.set(0,0,0);J.rotation.set(0,0,0);g.add(J)}
  svMerge({root:g});C[i]=g;return g.clone()}
// ---------------- poses (offsets from rest: [rx, ry, rz, px, py, pz]) ----------------
var KH165P={
  idle:{},
  // lying on the altar: the body lowered onto its belly, legs splayed flat, arms folded, head down
  laid:{root:[0,0,0,0,-.95,0],waist:[.55,0,0],torso:[.5,0,0],neck:[.3,0,0],head:[.3,0,0],shL:[-.2,0,-.9],shR:[-.2,0,.9],elL:[-1.2,0,0],elR:[-1.2,0,0],antL:[.6,0,0],antR:[.6,0,0],
    fe1L:[.9,0,0],fe2L:[.9,0,0],fe3L:[.9,0,0],fe1R:[.9,0,0],fe2R:[.9,0,0],fe3R:[.9,0,0],ti1L:[-1.5,0,0],ti2L:[-1.5,0,0],ti3L:[-1.5,0,0],ti1R:[-1.5,0,0],ti2R:[-1.5,0,0],ti3R:[-1.5,0,0],abd:[.15,0,0]},
  stir:{root:[0,0,0,0,-.85,0],waist:[.3,0,0],torso:[.1,0,0],neck:[-.2,0,0],head:[-.4,.2,0],antL:[-.3,0,.2],antR:[-.3,0,-.2],shL:[-.6,0,-.6],shR:[-.4,0,.6],elL:[-.8,0,0],elR:[-.9,0,0],
    fe1L:[.6,0,0],fe2L:[.7,0,0],fe3L:[.7,0,0],fe1R:[.6,0,0],fe2R:[.7,0,0],fe3R:[.7,0,0],ti1L:[-1.1,0,0],ti2L:[-1.2,0,0],ti3L:[-1.2,0,0],ti1R:[-1.1,0,0],ti2R:[-1.2,0,0],ti3R:[-1.2,0,0]},
  push:{root:[0,0,0,0,-.45,0],waist:[.1,0,0],torso:[-.1,0,0],head:[-.2,0,0],shL:[-1.1,0,-.3],shR:[-1.1,0,.3],elL:[-.3,0,0],elR:[-.3,0,0],fe1L:[.3,0,0],fe2L:[.35,0,0],fe3L:[.35,0,0],fe1R:[.3,0,0],fe2R:[.35,0,0],fe3R:[.35,0,0],ti1L:[-.6,0,0],ti2L:[-.6,0,0],ti3L:[-.6,0,0],ti1R:[-.6,0,0],ti2R:[-.6,0,0],ti3R:[-.6,0,0]},
  stand:{torso:[-.1,0,0],head:[-.15,0,0],shL:[-.2,0,-.15],shR:[-.2,0,.15],antL:[-.2,0,0],antR:[-.2,0,0]},
  // speaking: one claw raised, the head tilted toward you
  talk:{torso:[-.05,.15,0],head:[.05,-.2,.15],shR:[-1.2,0,.35],elR:[-1.0,0,0],wrR:[.3,0,0],mandL:[0,.15,0],mandR:[0,-.15,0]},
  point:{torso:[0,.25,0],head:[-.1,.3,0],shL:[-1.5,0,-.2],elL:[-.1,0,0]},
  // channelling: both claws raised toward the rift, the head thrown back, antennae up
  chan:{torso:[-.25,0,0],neck:[-.2,0,0],head:[-.35,0,0],shL:[-2.2,0,-.45],shR:[-2.2,0,.45],elL:[-.4,0,0],elR:[-.4,0,0],wrL:[.4,0,0],wrR:[.4,0,0],antL:[-.6,0,.3],antR:[-.6,0,-.3],mandL:[0,.3,0],mandR:[0,-.3,0]},
  hurt:{torso:[.25,.2,0],head:[.3,0,.2],shL:[-.4,0,-.8],shR:[-.4,0,.8]},
  dead:{root:[0,0,1.2,.3,-.85,0],waist:[.6,0,.3],torso:[.4,0,.2],neck:[.4,0,0],head:[.5,.4,0],shL:[.3,0,-1.2],shR:[.5,0,1.1],elL:[-.5,0,0],elR:[-.8,0,0],antL:[.9,0,0],antR:[.9,0,0],
    fe1L:[1.2,0,0],fe2L:[1.4,0,0],fe3L:[1.2,0,0],fe1R:[-.3,0,0],fe2R:[-.2,0,0],fe3R:[-.3,0,0],ti1L:[-2.2,0,0],ti2L:[-2.3,0,0],ti3L:[-2.2,0,0],ti1R:[-1.8,0,0],ti2R:[-1.9,0,0],ti3R:[-1.8,0,0]}};
// ---------------- the procedural layer: a tripod gait driven by his speed, breathing, antennae and mandibles always busy ----------------
function kh165Loco(e,S,O,dt,now){const t=now/1000,sp=S.spd||0,a=Math.min(1,sp/1.6),live=S.alive?1:0;S.gp=(S.gp||0)+dt*(2+sp*3.2);const g=S.gp,br=Math.sin(t*1.2)*live;
  O.thorax[4]+=.03*br+.04*Math.abs(Math.sin(g))*a;O.torso[0]+=.03*br;O.abd[0]+=.04*Math.sin(t*.9)*live;
  // the tripod: front-left, middle-right, hind-left step together, then the other three
  ['L','R'].forEach((s,j)=>[1,2,3].forEach(i=>{const ph=g+((i+j)%2?Math.PI:0),sw=Math.sin(ph),lf=Math.max(0,Math.cos(ph));O['cx'+i+s][1]+=(j?-1:1)*sw*.35*a;O['fe'+i+s][0]+=-lf*.35*a;O['ti'+i+s][0]+=lf*.2*a}));
  O.antL[0]+=(Math.sin(t*2.3)*.15+Math.sin(t*5.1)*.05)*live;O.antR[0]+=(Math.sin(t*2.1+1)*.15+Math.sin(t*4.7)*.05)*live;O.antL2[0]+=Math.sin(t*3.1)*.12*live;O.antR2[0]+=Math.sin(t*2.9+2)*.12*live;
  const md=Math.max(0,Math.sin(t*1.7)*Math.sin(t*.6))*.18*live+(S.say?Math.abs(Math.sin(t*11))*.25:0);O.mandL[1]+=md;O.mandR[1]-=md;
  // the head follows the hero when nothing else holds it
  if(S.alive&&!S.mv){const m=e.m,hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,yaw=svAng(Math.atan2(hx,hz)-m.rotation.y);if(Math.abs(yaw)<1.8&&Math.hypot(hx,hz)<12){S.hy=(S.hy||0)+((Math.max(-.6,Math.min(.6,yaw)))-(S.hy||0))*Math.min(1,dt*3);O.head[1]+=S.hy*.7;O.torso[1]+=S.hy*.25}}}
function kh165Post(e,S,dt,now){const R=S.R,t=now/1000;R.eyeM.emissiveIntensity=S.alive?(S.chg?1.4+.5*Math.sin(t*6):.6+.15*Math.sin(t*1.3)):0;R.eyeM.emissive.setHex(S.chg?0x40e0c0:0x2a8a70)}
// preview sheets (v143_look PROPS=kheprit / khP:<pose> / khPart:<i>)
KH165.sheet.kheprit=()=>{const R=svRig();kh165Build(R);svRest(R);svMerge(R);return R.root};
KH165.pose=(root,R,name)=>{const P=svPose({P:KH165P},name);for(const k in P){const g=R.J[k],o=P[k];if(!g)continue;const r0=g.userData.r0,p0=g.userData.p0;g.rotation.set(r0.x+o[0],r0.y+o[1],r0.z+o[2]);g.position.set(p0.x+(o[3]||0),p0.y+(o[4]||0),p0.z+(o[5]||0))}};
for(let i=0;i<11;i++)KH165.sheet['khPart'+i]=()=>kh165PartMesh(i);
Object.assign(KQSH151,KH165.sheet);
