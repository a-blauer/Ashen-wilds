// ================= v165 The Sandskimmer — the model (the salt-cutters' desert machine) =================
// A long sand-sled built by the salt-cutters of the Wastes to cross the deep desert at speed: a planked, brass-banded hull riding
// on two long skis and a keel runner, a great turbine on the stern that drives it (and roars blue-white when boosting), a twin-
// barrelled cannon on a turret ring high over the deck, a helm in the bow.
//  * One rig (sk165Build). Joints: root · body (the bob and roll) · pRam · pRun · runL/runR · pTurb · fan (spins about z) · jet ·
//    pGun · turret (yaw) · gun (pitch) · brlL/brlR (recoil) · pHelm · wheel (steering) · seatD (where the driver sits) · seatG
//    (where the gunner stands, on the turret) · sail (the pennant).
//  * Five parts (SK165.parts) are each a joint subtree: 0 the Ram Prow (pRam), 1 the Runners (pRun), 2 the Great Turbine (pTurb),
//    3 the Twin Cannons (pGun), 4 the Helm (pHelm). The bare hull is what stands in the salt-cutters' cradle; each part mined out
//    of the salt is fitted to it (sk165PartShow), and sk165PartMesh(i) is a loose copy of one part (in the salt, on the ground).
//  * Facing +z; about 7.2 long, 4.2 wide over the skis, the turret's top ~2.9 high.
var SK165={parts:['Ram Prow','Runners','Great Turbine','Twin Cannons','Helm'],pj:['pRam','pRun','pTurb','pGun','pHelm'],ic:['🔱','🛷','🌀','💥','☸️'],tris:0,sheet:{}};
function sk165Build(R){
  const wood=svMat(R,0x7a5230,{roughness:.85}),wood2=svMat(R,0x5e3e22,{roughness:.9}),plank=svMat(R,0x9a7048,{roughness:.88}),brass=svMat(R,0xc89a40,{roughness:.32,metalness:.8}),
    iron=svMat(R,0x45454c,{roughness:.55,metalness:.6}),dark=svMat(R,0x24221f,{roughness:.7,metalness:.3}),canvas=svMat(R,0xe6dcc6,{roughness:.95,side:THREE.DoubleSide}),
    red=svMat(R,0x8a2a1a,{roughness:.6,side:THREE.DoubleSide}),salt=svMat(R,0xf0ece4,{roughness:.95}),glass=svMat(R,0x9ac8d8,{roughness:.1,metalness:.3,transparent:true,opacity:.45}),
    rope=svMat(R,0xb89a68,{roughness:1}),jet=svGlowMat(R,0x9ae8ff,.0),jet2=svGlowMat(R,0xffffff,.0);
  R.jetM=[jet,jet2];
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz),G=(k,f)=>svG('sk'+k,f);
  const box=(j,m,x,y,z,w,h,d,rx,ry,rz)=>Mm(j,G('bx',()=>new THREE.BoxGeometry(1,1,1)),m,x,y,z,rx||0,ry||0,rz||0,w,h,d);
  const cyl=(j,m,x,y,z,r,h,rx,ry,rz,n)=>Mm(j,G('cy'+(n||10),()=>new THREE.CylinderGeometry(1,1,1,n||10)),m,x,y,z,rx||0,ry||0,rz||0,r,h,r);
  const ball=(j,m,x,y,z,r)=>Mm(j,G('bl',()=>new THREE.SphereGeometry(1,8,6)),m,x,y,z,0,0,0,r,r,r);
  const tube=(j,m,pts,r,n)=>Mm(j,svTube(pts,r,n||6),m);
  // ---------------- skeleton ----------------
  J('root',null,0,0,0);J('body','root',0,0,0);J('pRam','body',0,0,0);J('pRun','body',0,0,0);J('runL','pRun',1.95,0,0);J('runR','pRun',-1.95,0,0);
  J('pTurb','body',0,0,0);J('fan','pTurb',0,1.95,-3.15);J('jet','pTurb',0,1.95,-3.95);J('pGun','body',0,0,0);J('turret','pGun',0,2.05,.15);J('gun','turret',0,.42,.1);
  J('brlL','gun',.26,0,.2);J('brlR','gun',-.26,0,.2);J('pHelm','body',0,0,0);J('wheel','pHelm',0,1.72,2.25,-.75);J('seatD','pHelm',0,1.3,1.55);J('seatG','turret',0,-.2,-.85);J('sail','body',0,3.1,-2.2);
  // ---------------- the hull (always there): a planked, round-bottomed sled body with a flat deck ----------------
  const hz=[[3.0,.25,.3,0,.95],[2.5,.8,.42,0,.9],[1.6,1.22,.52,0,.86],[.3,1.36,.56,0,.85],[-1.4,1.34,.56,0,.86],[-2.6,1.12,.5,0,.92],[-3.2,.86,.42,0,.98]];
  Mm('body',G('hull',()=>svLoftZ(hz,16)),wood);
  // brass bands round the hull and a dark waterline strake
  [2.0,.6,-.9,-2.3].forEach((z,k)=>{const r=[1.12,1.36,1.35,1.16][k];Mm('body',G('hb'+k,()=>svLoftZ([[z+.06,r+.03,.58,0,.86],[z-.06,r+.03,.58,0,.86]],16,{cap:false})),brass)});
  Mm('body',G('strk',()=>svLoftZ(hz.map(([z,rx,ry,ox,oy])=>[z,rx*1.01,ry*.5,ox,oy-.18]),16)),wood2);
  // the deck: planks across, a raised gunwale with brass caps, rope rails between posts
  for(let k=0;k<14;k++){const z=-3.0+k*.44,w=Math.max(.5,2*Math.sqrt(Math.max(0,1-Math.pow((z+.1)/3.25,2)))*1.32);box('body',k%2?plank:wood,0,1.37,z,w,.06,.4)}
  [-1,1].forEach(s=>{const pts=[],pts2=[];for(let k=0;k<=12;k++){const z=-3.05+k*.5,w=Math.max(.3,Math.sqrt(Math.max(0,1-Math.pow((z+.1)/3.3,2)))*1.33);pts.push([s*w,1.48,z]);pts2.push([s*w,1.86,z])}
    tube('body',wood2,pts,.09,5);tube('body',rope,pts2.filter((p,i)=>i>0&&i<12),.025,4);
    for(let k=1;k<12;k+=2){const p=pts[k];cyl('body',brass,p[0],1.68,p[2],.045,.42,0,0,0,6);ball('body',brass,p[0],1.9,p[2],.06)}
    // rivets along the bands
    for(let k=0;k<8;k++)ball('body',iron,s*(1.3+(k%2)*.02),.95,-2.4+k*.62,.035)});
  // the stern: a transom with brass plate and the cradle the turbine sits on
  box('body',wood2,0,1.05,-3.2,1.6,.62,.1);box('body',brass,0,1.12,-3.26,.8,.18,.04);
  // the salt-cutters' marks: salt crust low on the hull, a painted red eye at each bow
  [-1,1].forEach(s=>{Mm('body',G('crust',()=>svLump(.5,1,.4,61)),salt,s*1.15,.55,-1.5,0,0,0,1.0,.22,1.6);Mm('body',G('eye',()=>new THREE.CircleGeometry(.18,10)),red,s*.94,1.05,2.12,0,s*1.08,0);
    Mm('body',G('eye2',()=>new THREE.CircleGeometry(.08,8)),dark,s*.95,1.05,2.13,0,s*1.08,0)});
  // deck clutter: a water cask, crates, coiled rope
  cyl('body',wood,.75,1.66,-.9,.26,.56,0,0,0,10);[.38,1.04].forEach(y=>cyl('body',iron,.75,y+.62-.38,-.9,.27,.04,0,0,0,10));
  box('body',wood2,-.8,1.6,-1.6,.5,.42,.5,0,.3,0);box('body',plank,-.8,1.98,-1.62,.4,.34,.4,0,-.2,0);Mm('body',G('coil',()=>new THREE.TorusGeometry(.22,.06,5,12)),rope,.85,1.45,.6,Math.PI/2,0,0);
  // the pennant mast at the stern
  cyl('body',wood2,0,2.3,-2.2,.05,1.9,0,0,0,6);Mm('sail',G('pen',()=>{const g=new THREE.PlaneGeometry(1.1,.42,4,1);g.translate(-.55,0,0);return g}),red,0,0,0,0,Math.PI/2,0);
  // ---------------- 0 · the ram prow: an iron beak, brass cheek plates, a figurehead of a salt-crab ----------------
  Mm('pRam',G('ram',()=>svHorn(.32,1.2,0,-.15,6,4)),iron,0,.88,2.95);
  [-1,1].forEach(s=>{box('pRam',brass,s*.55,.98,2.55,.08,.5,1.0,0,s*-.5,0);for(let k=0;k<3;k++)ball('pRam',iron,s*(.5-k*.12),1.1-k*.08,2.25+k*.33,.045)});
  box('pRam',iron,0,.62,2.2,.26,.14,1.6);Mm('pRam',G('fh',()=>svLump(.26,1,.25,63)),brass,0,1.45,2.85,0,0,0,1.2,.6,1);[-1,1].forEach(s=>Mm('pRam',G('fhc',()=>svHorn(.06,.42,s*.25,.05,4,3)),brass,s*.18,1.45,2.95,0,s*.6,0));
  // ---------------- 1 · the runners: two long skis on struts (outriggers) and a keel runner ----------------
  [['runL',1],['runR',-1]].forEach(([j,s])=>{box(j,iron,0,.1,-.3,.36,.08,5.6);Mm(j,svTube([[0,.1,2.5],[0,.2,3.0],[0,.42,3.35]],[.1,.08,.06],6),iron);box(j,brass,0,.18,-.3,.12,.06,5.4);
    [-1.8,1.4].forEach(z=>{tube(j,wood2,[[0,.18,z],[-s*.55,.75,z],[-s*.8,.92,z]],.08,6);tube(j,iron,[[0,.18,z-.25],[-s*.75,.86,z+.1]],.035,4)})});
  box('pRun',iron,0,.32,0,.2,.14,5.4);Mm('pRun',svTube([[0,.32,2.7],[0,.5,3.1]],[.09,.07],6),iron);
  // ---------------- 2 · the great turbine: a brass cowl on struts over the stern, fan blades, a rear grille, the jet ----------------
  Mm('pTurb',G('cowl',()=>{const g=new THREE.CylinderGeometry(1.12,1.0,1.6,18,1,true);g.rotateX(Math.PI/2);return g}),brass,0,1.95,-3.05);
  Mm('pTurb',G('cowli',()=>{const g=new THREE.CylinderGeometry(1.06,.95,1.58,18,1,true);g.rotateX(Math.PI/2);g.scale(-1,1,1);return g}),dark,0,1.95,-3.05);
  [-2.25,-3.85].forEach((z,k)=>Mm('pTurb',G('crim',()=>new THREE.TorusGeometry(1.08,.08,6,20)),k?iron:brass,0,1.95,z,0,0,0,k?.95:1.04,k?.95:1.04,1));
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2;box('pTurb',iron,Math.cos(a)*.55,1.95+Math.sin(a)*.55,-3.9,.06,1.0,.06,0,0,a)}
  [-1,1].forEach(s=>{tube('pTurb',iron,[[s*.85,1.45,-2.6],[s*.55,1.38,-2.2]],.07,5);tube('pTurb',iron,[[s*.85,1.45,-3.5],[s*.6,1.38,-3.0]],.07,5);box('pTurb',brass,s*.95,1.25,-3.0,.22,.3,1.2)});
  cyl('pTurb',iron,0,1.42,-2.95,.18,.5,0,0,0,8);
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2;Mm('fan',G('blade',()=>{const g=new THREE.BoxGeometry(.22,.95,.04);g.translate(0,.55,0);return g}),k%2?brass:iron,0,0,0,0,.45,a)}
  Mm('fan',G('hub',()=>{const g=new THREE.ConeGeometry(.24,.6,10);g.rotateX(Math.PI/2);return g}),brass,0,0,.32);cyl('fan',dark,0,0,0,.2,.3,Math.PI/2,0,0,10);
  Mm('jet',G('jd',()=>new THREE.CircleGeometry(.95,20)),jet,0,0,.02,0,Math.PI,0);Mm('jet',G('jc',()=>{const g=new THREE.ConeGeometry(.8,2.6,14,1,true);g.rotateX(-Math.PI/2);g.translate(0,0,-1.3);return g}),jet2);
  // ---------------- 3 · the twin cannons on their turret: a pedestal, a turn ring, a curved shield, two barrels, the gunner's step ----------------
  cyl('pGun',iron,0,1.7,.15,.42,.66,0,0,0,10);Mm('pGun',G('tring',()=>new THREE.TorusGeometry(.62,.07,5,18)),brass,0,2.02,.15,Math.PI/2,0,0);
  cyl('turret',wood2,0,.02,0,.7,.1,0,0,0,14);box('turret',iron,0,.12,-.45,1.2,.06,.9);
  Mm('turret',G('shld',()=>{const g=new THREE.CylinderGeometry(.85,.85,.75,10,1,true,-.75,1.5);g.scale(1,1,.7);return g}),iron,0,.62,.05,0,0,0);
  Mm('turret',G('shld2',()=>new THREE.TorusGeometry(.85,.04,4,10,1.5)),brass,0,1.0,.05,Math.PI/2,0,Math.PI/2-.75,1,.7,1);
  [-1,1].forEach(s=>box('turret',iron,s*.42,.38,.05,.08,.5,.5));box('gun',dark,0,0,-.2,.85,.36,.6);box('gun',brass,0,.2,-.2,.55,.06,.5);
  [['brlL'],['brlR']].forEach(([j])=>{Mm(j,G('brl',()=>{const g=new THREE.CylinderGeometry(.1,.14,1.9,10);g.rotateX(Math.PI/2);g.translate(0,0,.9);return g}),iron);
    [.25,.9,1.75].forEach((z,k)=>Mm(j,G('brb',()=>{const g=new THREE.CylinderGeometry(1,1,1,10);g.rotateX(Math.PI/2);return g}),k==2?iron:brass,0,0,z,0,0,0,k==2?.17:.155,k==2?.17:.155,k==2?.16:.1));
    Mm(j,G('mz',()=>new THREE.CircleGeometry(.08,8)),dark,0,0,1.86)});
  [-1,1].forEach(s=>tube('gun',iron,[[s*.35,-.05,-.5],[s*.45,-.15,-.85]],.04,5));cyl('turret',brass,0,.2,-.85,.16,.06,0,0,0,8);
  // ---------------- 4 · the helm: a bucket seat, a spoked wheel, levers, gauges and a little windscreen ----------------
  box('pHelm',wood2,0,1.5,1.5,.6,.16,.55);box('pHelm',wood2,0,1.82,1.22,.6,.6,.12,-.15);box('pHelm',red,0,1.52,1.5,.5,.06,.46);
  box('pHelm',wood,0,1.5,2.25,.9,.5,.3,-.2);box('pHelm',brass,0,1.76,2.32,.92,.05,.32,-.2);
  Mm('wheel',G('wh',()=>new THREE.TorusGeometry(.32,.035,5,16)),wood2);for(let k=0;k<6;k++){const a=k/6*Math.PI*2;box('wheel',brass,Math.cos(a)*.16,Math.sin(a)*.16,0,.3,.03,.03,0,0,a);ball('wheel',wood,Math.cos(a)*.38,Math.sin(a)*.38,0,.04)}cyl('wheel',brass,0,0,0,.06,.12,Math.PI/2,0,0,8);
  [-1,1].forEach(s=>{tube('pHelm',iron,[[s*.42,1.55,1.95],[s*.48,1.95,2.0]],.025,4);ball('pHelm',red,s*.48,1.97,2.0,.05);cyl('pHelm',brass,s*.28,1.78,2.42,.09,.05,-1.37,0,0,10);Mm('pHelm',G('gface',()=>new THREE.CircleGeometry(.075,10)),salt,s*.28,1.8,2.45,-.2,0,0)});
  Mm('pHelm',G('ws',()=>new THREE.PlaneGeometry(1.1,.38)),glass,0,2.05,2.48,-.35,0,0);tube('pHelm',brass,[[-.56,1.85,2.42],[-.56,2.22,2.54],[.56,2.22,2.54],[.56,1.85,2.42]],.025,4);
  // ---------------- the parts and the count ----------------
  R.part=SK165.pj.map(j=>R.J[j]);
  if(!SK165.tris){let n=0;R.root.traverse(o=>{if(o.isMesh){const g=o.geometry;n+=g.index?g.index.count/3:g.attributes.position.count/3}});SK165.tris=Math.round(n)}}
function sk165PartShow(R,i,on){const J=R.part[i];if(J)J.visible=on}
// a loose copy of one part (merged, centred), for the salt columns, the ground and the cradle's fly-in
function sk165PartMesh(i){const C=SK165.pc||(SK165.pc={});if(C[i])return C[i].clone();const R=svRig();sk165Build(R);svRest(R);R.root.updateMatrixWorld(true);const g=new THREE.Group(),src=R.part[i];
  const box=new THREE.Box3().setFromObject(src),c=box.getCenter(new THREE.Vector3());src.traverse(o=>{if(o.isMesh){const m=new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld),o.material);m.userData.lpsSkip=1;g.add(m)}});
  g.children.forEach(m=>m.geometry.translate(-c.x,-c.y,-c.z));const sz=box.getSize(new THREE.Vector3());g.userData.sz=sz;C[i]=g;return g.clone()}
// preview sheets (v143_look PROPS=skimmer / skPart0..4)
SK165.sheet.skimmer=()=>{const R=svRig();sk165Build(R);svRest(R);svMerge(R);R.jetM[0].opacity=.7;R.jetM[1].opacity=.25;return R.root};
SK165.sheet.skimmerBare=()=>{const R=svRig();sk165Build(R);svRest(R);for(let i=0;i<5;i++)sk165PartShow(R,i,false);svMerge(R);return R.root};
for(let i=0;i<5;i++)SK165.sheet['skPart'+i]=()=>sk165PartMesh(i);
Object.assign(KQSH151,SK165.sheet);
