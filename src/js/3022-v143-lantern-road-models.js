// ================= v143 The Lantern Road — models: the Portal Ripper, glowbulb lampposts, the Wardens' outpost, glowbulbs =================
// All rigid kits (dkKit parts baked by lgGroup into 1–3 shared meshes: cloth/wood, metal, glow), the same chunky flat-shaded
// low-poly look as the camps and the heroes' gear. Frame: +z forward, +y up, the origin on the ground.
//  * mqm143Ripper() → {g, body, wheels[4], clawL, clawR, lamps (on-glow group), core (charge-glow group), fireP, chimP, coreP,
//    jacks[2]}: a four-wheeled iron siege-engine with a glowbulb furnace and chimney at the back, a copper coil mast with a caged
//    glowbulb capacitor in the middle and two great ripping claws folded up at the front (they swing open to tear the gateway).
//  * mqm143Lamp() → {g, on (lit glow group), bulbP}: a tall iron lamppost with a hanging cage lantern and a glowbulb socket
//  * outpost pieces: tent, stakes (palisade section), banner, brazier (+flame group), table, rack, crate, barrel, bulbcrate
//  * mqm143Bulb(): the glowbulb itself (ground drop): a pale glowing bulb with a dark leaf cap
var MQM143={iron:0x34343a,ironL:0x50525a,ironD:0x222226,brass:0xa8843a,copper:0xa05a2c,wood:0x3e2c1c,woodL:0x56402a,woodD:0x2a1c12,
  rust:0x6a3a22,canvas:0x6a604c,canvasD:0x4e463a,teal:0x2a6a64,tealD:0x173c3a,glass:0x26342a,glow:0xd8ff7a,glowW:0xf4ffd0,fire:0xffa040,sheet:{}};

// ---------------- the Portal Ripper ----------------
function mqm143Wheel(){const C=MQM143;return lgGroup('MQM143|wheel',k=>{const R=.56,Wd=.24;
  const rim=lgGeoC('mqRim',()=>new THREE.CylinderGeometry(1,1,1,16,1,true));
  k.p('',rim,'m',C.iron,0,0,0,R,Wd,R,0,0,Math.PI/2);k.p('',rim,'m',C.ironD,0,0,0,R-.05,Wd*.9,R-.05,0,0,Math.PI/2);
  [-1,1].forEach(s=>k.p('','ring','m',C.ironL,s*Wd*.5,0,0,R*.98,R*.5,R*.98,0,0,Math.PI/2));
  k.p('','cyl','m',C.ironD,0,0,0,.13,.34,.13,0,0,Math.PI/2);k.p('','cyl','m',C.brass,0,0,0,.08,.38,.08,0,0,Math.PI/2);
  [-1,1].forEach(s=>k.p('','cone4','m',C.ironL,s*.2,0,0,.05,.06,.05,0,0,-s*Math.PI/2));
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('','box','c',C.woodL,0,Math.cos(a)*.27,Math.sin(a)*.27,.06,.42,.07,a,0,0)}
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;k.p('','box','m',C.ironL,0,Math.cos(a)*(R+.02),Math.sin(a)*(R+.02),Wd*1.05,.06,.1,a,0,0)}},.14)}
function mqm143Claw(side){const C=MQM143;return lgGroup('MQM143|claw',k=>{
  const pts=[[0,0,0],[0,.32,.5],[0,.52,1.02],[0,.42,1.36],[0,.16,1.52]],r=[.11,.095,.075,.055,.012];
  for(let i=0;i<pts.length-1;i++)k.L('','m',i<2?C.iron:C.ironL,pts[i],pts[i+1],r[i],r[i+1],6);
  for(let i=0;i<3;i++)k.p('','sph','m',C.brass,pts[i][0],pts[i][1],pts[i][2],r[i]*1.08);
  // serrations along the inside (underside) of the claw and a second smaller talon
  for(let i=0;i<5;i++){const u=.25+i*.15,a=pts[1],b=pts[2],p=[0,a[1]+(b[1]-a[1])*u-.075,a[2]+(b[2]-a[2])*u];k.p('','cone4','m',C.ironL,p[0],p[1],p[2],.03,.08,.02,Math.PI,0,0)}
  k.L('','m',C.ironL,[0,.5,1.0],[0,.18,1.18],.05,.01,5);
  k.p('','box','m',C.ironD,0,.2,.25,.16,.14,.24,-.55,0,0);k.p('','box','m',C.copper,0,.16,.26,.17,.03,.2,-.55,0,0)},.12)}
function mqm143Ripper(){const C=MQM143,root=new THREE.Group();root.name='PortalRipper';root.userData.psNo=1;
  const body=lgGroup('MQM143|ripper',k=>{
    // chassis: two rails, cross beams, an iron deck with plank boards and straps, axle beams with leaf springs
    [-1,1].forEach(s=>{k.p('','box','m',C.iron,s*.72,.78,0,.14,.24,3.3);for(let i=0;i<11;i++)k.p('','sph','m',C.ironL,s*.8,.84,-1.5+i*.3,.022)});
    [-1.5,-.5,.5,1.5].forEach(z=>k.p('','box','m',C.ironD,0,.72,z,1.58,.14,.16));
    k.p('','box','m',C.ironD,0,.94,0,1.62,.08,3.1);
    for(let i=0;i<6;i++)k.p('','box','c',i%2?C.wood:C.woodL,-.66+i*.264,1.0,0,.25,.05,3.0);
    [-1.3,0,1.3].forEach(z=>k.p('','box','m',C.ironL,0,1.03,z,1.66,.025,.08));
    [-1.15,1.15].forEach(z=>{k.p('','cyl','m',C.ironD,0,.56,z,.07,2.0,.07,0,0,Math.PI/2);[-1,1].forEach(s=>{for(let j=0;j<3;j++)k.p('','box','m',C.ironL,s*.72,.64+j*.035,z,.12,.03,.7-j*.18)})});
    // the furnace / boiler at the back: riveted drum, brass bands, dome, chimney, firebox door with a glowbulb grate
    k.p('','cyl','m',C.iron,0,1.56,-.95,.52,1.05,.52);[1.12,1.56,2.0].forEach(y=>k.p('','ring','m',C.brass,0,y,-.95,.54,.5,.54));
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;[1.3,1.82].forEach(y=>k.p('','sph','m',C.ironL,Math.sin(a)*.53,y,-.95+Math.cos(a)*.53,.018))}
    k.p('','hem','m',C.ironL,0,2.08,-.95,.5,.24,.5);k.p('','cyl','m',C.iron,0,2.58,-1.0,.12,1.0,.12);k.p('','ring','m',C.brass,0,2.4,-1.0,.14,.6,.14);
    k.p('','tor','m',C.ironD,0,3.12,-1.0,.22,.16,.22);k.p('','tor','m',C.ironL,0,3.0,-1.0,.16,.1,.16,Math.PI,0,0);
    k.p('','box','m',C.ironD,0,1.32,-1.47,.46,.4,.06);k.p('','box','c',C.glass,0,1.32,-1.49,.34,.24,.02);for(let i=0;i<4;i++)k.p('','box','m',C.ironL,-.12+i*.08,1.32,-1.505,.02,.26,.02);
    k.p('','box','m',C.brass,0,1.56,-1.5,.12,.04,.04);
    // pressure gauges and a crank wheel on the right, the Wardens' lantern sigil plate on the left
    [[.5,1.62,-.7],[.5,1.4,-.56]].forEach(p=>{k.p('','cyl','m',C.brass,p[0],p[1],p[2],.07,.035,.07,0,0,Math.PI/2);k.p('','cyl','c',0xd8d0b0,p[0]+.02,p[1],p[2],.055,.01,.055,0,0,Math.PI/2);k.p('','box','c',0x8a1a1a,p[0]+.026,p[1]+.02,p[2],.006,.045,.006,.6,0,0)});
    k.p('','ring','m',C.ironL,.86,1.3,-.2,.2,.5,.2,0,0,Math.PI/2);k.p('','box','m',C.ironL,.86,1.3,-.2,.04,.38,.04);k.p('','box','m',C.ironL,.86,1.3,-.2,.04,.04,.38);k.p('','cyl','c',C.woodL,.92,1.48,-.2,.03,.12,.03,0,0,Math.PI/2);
    k.p('','cyl','m',C.brass,-.5,1.56,-.85,.17,.04,.17,0,0,Math.PI/2);k.p('','cyl','c',C.tealD,-.53,1.56,-.85,.13,.02,.13,0,0,Math.PI/2);
    k.p('','box','m',C.brass,-.56,1.6,-.85,.02,.07,.07);k.p('','cone4','m',C.brass,-.56,1.65,-.85,.02,.04,.04,0,0,Math.PI/2);
    // copper pipes from the boiler to the coil housing
    [-1,1].forEach(s=>{k.L('','m',C.copper,[s*.42,1.3,-.6],[s*.42,1.2,-.1],.04,.04,6);k.L('','m',C.copper,[s*.42,1.2,-.1],[s*.3,1.28,.1],.04,.04,6)});
    // the coil mast in the middle: housing, mast, three copper coils, the caged capacitor socket on top
    k.p('','box','m',C.ironD,0,1.24,.25,.92,.44,.82);k.p('','box','m',C.ironL,0,1.47,.25,.96,.04,.86);for(let i=0;i<5;i++)[-1,1].forEach(s=>k.p('','sph','m',C.brass,s*.47,1.3,-.1+i*.18,.02));
    k.p('','cyl','m',C.iron,0,2.12,.25,.07,1.34,.07);[1.75,2.05,2.35].forEach((y,i)=>{k.p('','ring','m',C.copper,0,y,.25,.36-i*.05,.85,.36-i*.05);k.p('','ring','m',mdSh(C.copper,.8),0,y+.05,.25,.33-i*.05,.6,.33-i*.05)});
    k.p('','cyl','m',C.ironD,0,2.78,.25,.18,.06,.18);k.p('','sph2','c',C.glass,0,2.98,.25,.15,.17,.15);
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;k.L('','m',C.brass,[Math.sin(a)*.18,2.8,.25+Math.cos(a)*.18],[Math.sin(a)*.17,3.17,.25+Math.cos(a)*.17],.014,.014,4)}
    k.p('','cone4','m',C.ironD,0,3.22,.25,.2,.12,.2,0,Math.PI/4,0);k.p('','sph','m',C.brass,0,3.3,.25,.035);
    // the front: claw pivots, piston rams, a spiked ram plate, two headlamps (dark glass)
    [-1,1].forEach(s=>{k.p('','box','m',C.ironD,s*.42,1.17,1.2,.26,.34,.3);k.p('','cyl','m',C.brass,s*.42,1.25,1.2,.09,.34,.09,0,0,Math.PI/2);
      k.L('','m',C.ironL,[s*.42,1.0,.7],[s*.42,1.25,1.05],.05,.05,6);k.p('','box','m',C.iron,s*.62,1.08,1.62,.12,.14,.12);k.p('','sph2','c',C.glass,s*.62,1.08,1.69,.07,.07,.04)});
    k.p('','box','m',C.iron,0,.74,1.72,1.5,.46,.12);k.p('','box','m',C.ironL,0,.97,1.72,1.54,.05,.14);[-.5,0,.5].forEach(x=>k.p('','cone4','m',C.ironL,x,.72,1.84,.07,.22,.07,Math.PI/2,0,0));
    // stabiliser jacks (folded) at the front corners, a tow hitch, hanging chains, a lantern hook, a toolbox
    k.p('','box','m',C.ironD,0,.7,-1.68,.3,.1,.2);k.p('','ring','m',C.ironL,0,.7,-1.82,.08,.4,.08);
    [-1,1].forEach(s=>{for(let i=0;i<7;i++){const u=i/6,z=-1.2+u*1.6,y=.82-Math.sin(u*Math.PI)*.18;k.p('','ring','m',C.ironL,s*.82,y,z,.035,.35,.035,0,i%2?Math.PI/2:0,Math.PI/2)}});
    k.p('','box','c',C.woodD,-.55,1.14,1.0,.34,.2,.26);k.p('','box','m',C.ironL,-.55,1.25,1.0,.36,.03,.28);k.p('','box','m',C.brass,-.55,1.18,1.13,.05,.05,.02)},.15);
  root.add(body);
  // wheels (spun by the world tick), claws on pivots, the glow groups toggled on when the engine runs / charges
  const wheels=[];[[-.98,-1.15],[.98,-1.15],[-.98,1.15],[.98,1.15]].forEach(([x,z])=>{const w=mqm143Wheel();w.position.set(x,.56,z);root.add(w);wheels.push(w)});
  const claws=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.42,1.25,1.2);const c=mqm143Claw(s);c.position.x=s*.04;p.add(c);p.rotation.x=-1.05;root.add(p);return p});
  const lamps=lgGroup('MQM143|ripperLamps',k=>{[-1,1].forEach(s=>k.p('','sph2','g',C.glowW,s*.62,1.08,1.7,.06,.06,.03));k.p('','box','g',C.glow,0,1.32,-1.5,.33,.23,.02)},0);
  const core=lgGroup('MQM143|ripperCore',k=>{k.p('','sph2','g',C.glowW,0,2.98,.25,.14,.16,.14);[1.75,2.05,2.35].forEach((y,i)=>k.p('','ring','g',C.glow,0,y+.02,.25,.37-i*.05,.3,.37-i*.05))},0);
  lamps.visible=false;core.visible=false;root.add(lamps,core);
  const jacks=[-1,1].map(s=>{const j=lgGroup('MQM143|jack',k=>{k.p('','cyl','m',MQM143.ironL,0,-.25,0,.05,.5,.05);k.p('','cyl','m',MQM143.ironD,0,-.52,0,.13,.05,.13)},.1);j.position.set(s*.62,.95,1.5);j.scale.y=.2;root.add(j);return j});
  return {g:root,body,wheels,clawL:claws[0],clawR:claws[1],lamps,core,jacks,fireP:new THREE.Vector3(0,1.32,-1.55),chimP:new THREE.Vector3(0,3.2,-1.0),coreP:new THREE.Vector3(0,2.98,.25),clawTip:new THREE.Vector3(0,1.6,2.7)}}
MQM143.sheet.ripper=()=>{const R=mqm143Ripper();R.lamps.visible=R.core.visible=true;R.clawL.rotation.set(.1,-.35,0);R.clawR.rotation.set(.1,.35,0);return R.g};
MQM143.sheet.ripperRest=()=>mqm143Ripper().g;

// ---------------- the glowbulb lamppost ----------------
// lantern hangs at bulbP; the socket on the post (bulb plate at y 1.25) is where the hero feeds it
function mqm143Lamp(){const C=MQM143,g=new THREE.Group();g.userData.psNo=1;
  g.add(lgGroup('MQM143|lamp',k=>{
    k.p('','box','c',0x4a4a50,0,.11,0,.58,.22,.58);k.p('','box','c',0x56565c,0,.3,0,.44,.18,.44);k.p('','box','c',0x3e3e44,0,.43,0,.3,.1,.3);
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;k.p('','cone4','m',C.ironD,Math.sin(a)*.12,.54,Math.cos(a)*.12,.05,.16,.05,0,a,0)}
    k.L('','m',C.ironD,[0,.48,0],[0,3.05,0],.075,.055,6);[.62,1.62,2.92].forEach(y=>k.p('','ring','m',C.brass,0,y,0,.1,.45,.1));
    // a twisted collar and the glowbulb socket plate
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.L('','m',C.ironL,[Math.sin(a)*.07,2.2,Math.cos(a)*.07],[Math.sin(a+1)*.065,2.5,Math.cos(a+1)*.065],.012,.012,4)}
    k.p('','box','m',C.ironL,0,1.25,.07,.16,.2,.04);k.p('','cyl','m',C.brass,0,1.27,.095,.05,.03,.05,Math.PI/2,0,0);k.p('','cyl','c',0x101410,0,1.27,.11,.035,.01,.035,Math.PI/2,0,0);
    k.p('','cone4','m',C.brass,0,1.12,.09,.035,.05,.02,Math.PI,Math.PI/4,0);
    // the crook arm and finial
    const arm=[[0,2.98,0],[.2,3.14,0],[.42,3.18,0],[.6,3.1,0],[.66,2.94,0]];for(let i=0;i<arm.length-1;i++)k.L('','m',C.ironD,arm[i],arm[i+1],.03,.028,5);
    k.L('','m',C.ironD,[0,2.7,0],[.3,3.08,0],.018,.018,4);k.p('','cone4','m',C.ironD,0,3.16,0,.06,.16,.06,0,Math.PI/4,0);k.p('','sph','m',C.brass,0,3.27,0,.03);
    // the cage lantern
    const lx=.66,ly=2.58;k.L('','m',C.ironL,[lx,2.94,0],[lx,2.82,0],.008,.008,3);k.p('','cone4','m',C.ironD,lx,2.78,0,.19,.12,.19,0,Math.PI/4,0);k.p('','box','m',C.ironD,lx,2.71,0,.24,.025,.24);
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>k.L('','m',C.ironL,[lx+a*.11,2.4,b*.11],[lx+a*.11,2.71,b*.11],.012,.012,4));
    k.p('','box','m',C.ironD,lx,2.39,0,.25,.03,.25);k.p('','cone4','m',C.ironD,lx,2.33,0,.12,.1,.12,Math.PI,Math.PI/4,0);
    k.p('','cyl','m',C.brass,lx,2.67,0,.045,.04,.045);k.p('','sph2','c',C.glass,lx,ly,0,.085,.11,.085);
    // a teal pennant tied below the arm
    k.L('','m',C.ironD,[0,2.36,0],[-.24,2.36,0],.012,.012,4);k.S('',MQM143.teal,-.13,2.36,0,.18,.4,0,0,4);k.p('','box','m',C.brass,-.13,2.24,.006,.05,.06,.004)},.12));
  const on=lgGroup('MQM143|lampOn',k=>{k.p('','sph2','g',C.glowW,.66,2.58,0,.075,.1,.075);k.p('','sph2','g',C.glow,.66,2.58,0,.095,.12,.095);k.p('','cyl','g',C.glow,0,1.27,.115,.03,.006,.03,Math.PI/2,0,0)},0);
  on.visible=false;g.add(on);return {g,on,bulbP:new THREE.Vector3(.66,2.58,0),plateP:new THREE.Vector3(0,1.27,.12)}}
MQM143.sheet.lamp=()=>mqm143Lamp().g;
MQM143.sheet.lampOn=()=>{const L=mqm143Lamp();L.on.visible=true;return L.g};

// ---------------- the outpost ----------------
function mqm143Tent(){const C=MQM143;return lgGroup('MQM143|tent',k=>{const L=2.4,H=1.75,Wd=1.15;
  const slope=Math.atan2(H,Wd),sl=Math.hypot(H,Wd);
  [-1,1].forEach(s=>{k.p('','box','c',s<0?C.canvas:C.canvasD,0,H/2,s*Wd/2,L,.03,sl,s*(Math.PI/2-slope),0,0);k.p('','box','c',C.tealD,0,.07,s*Wd*.97,L*1.002,.03,.14,s*(Math.PI/2-slope),0,0)});
  const tri=lgGeoC('mqTri',()=>{const s=new THREE.Shape();s.moveTo(-1,0);s.lineTo(1,0);s.lineTo(0,1);s.lineTo(-1,0);return new THREE.ShapeGeometry(s)});
  k.p('',tri,'c',C.canvasD,-L/2,0,0,Wd,H,1,0,Math.PI/2,0);
  k.p('',tri,'c',0x1a1610,-L/2+.06,0,0,Wd*.96,H*.96,1,0,Math.PI/2,0);[-1,1].forEach(s=>k.L('','c',C.canvasD,[L/2+.02,H*.62,s*Wd*.36],[L/2+.02,H*.2,s*Wd*.86],.05,.05,6));
  k.L('','c',C.woodD,[-L/2-.15,H+.04,0],[L/2+.15,H+.04,0],.035,.035,5);[-1,1].forEach(s=>{k.L('','c',C.woodD,[s*(L/2+.08),0,0],[s*(L/2+.08),H+.1,0],.04,.035,5);
    [-1,1].forEach(q=>{k.L('','c',0x8a7a5a,[s*(L/2+.08),H,0],[s*(L/2+.7),0,q*.6],.008,.008,3);k.p('','box','c',C.woodD,s*(L/2+.7),.06,q*.6,.04,.14,.04)})});
  k.p('','box','c',0x4a3a2a,0,.06,0,L*.8,.04,Wd*1.3);k.p('','box','c',C.woodD,-.6,.18,.2,.5,.28,.34);k.p('','box','m',C.ironL,-.6,.3,.2,.52,.03,.36)},.14)}
function mqm143Stakes(n,seed){const C=MQM143;return lgGroup('MQM143|stakes'+n+'|'+seed,k=>{const R=dkRng(seed);
  for(let i=0;i<n;i++){const x=(i-(n-1)/2)*.27,h=1.35+R()*.35,lean=(R()-.5)*.12;k.L('','c',i%2?C.wood:C.woodL,[x,0,0],[x+lean*.4,h,lean],.11,.1,6);k.p('','cone4','c',0x7a6248,x+lean*.42,h+.1,lean*1.05,.1,.22,.1,lean,0,0)}
  [.45,1.0].forEach(y=>k.p('','box','c',0x5a4a32,0,y,-.1,n*.27,.06,.04))},.16)}
function mqm143Banner(){const C=MQM143;return lgGroup('MQM143|banner',k=>{
  k.L('','c',C.woodD,[0,0,0],[0,3.4,0],.06,.05,6);k.p('','box','c',C.woodD,0,3.15,0,.9,.06,.06);k.p('','cone4','m',C.brass,0,3.5,0,.06,.18,.06,0,Math.PI/4,0);
  k.S('',C.teal,-.22,3.12,.02,.44,1.5,0,0,5);k.S('',C.tealD,.22,3.12,.02,.44,1.45,0,0,6);
  // the lantern sigil on the cloth
  k.p('','box','m',C.brass,0,2.62,.06,.22,.3,.01);k.p('','box','c',C.tealD,0,2.62,.065,.17,.24,.01);k.p('','box','g',C.glow,0,2.6,.072,.08,.13,.008);
  k.p('','cone4','m',C.brass,0,2.82,.06,.14,.1,.01,0,Math.PI/4,0);k.p('','box','m',C.brass,0,2.44,.06,.18,.04,.012);
  k.p('','box','m',C.ironD,0,.12,0,.32,.24,.32)},.12)}
function mqm143Brazier(){const C=MQM143,g=new THREE.Group();g.add(lgGroup('MQM143|brazier',k=>{
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2;k.L('','m',C.ironD,[Math.sin(a)*.38,0,Math.cos(a)*.38],[Math.sin(a)*.18,.72,Math.cos(a)*.18],.03,.025,5)}
  k.p('','hem','m',C.iron,0,.9,0,.4,.26,.4,Math.PI,0,0);k.p('','ring','m',C.brass,0,.9,0,.41,.4,.41);k.p('','dod','c',0x2a1410,0,.86,0,.3,.1,.3);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('','dod','g',0xff6a20,Math.sin(a)*.17,.92,Math.cos(a)*.17,.06)}},.12));
  const fl=lgGroup('MQM143|brazierFlame',k=>{k.p('','cone','g',0xffa040,0,1.15,0,.22,.5,.22);k.p('','cone','g',0xffe08a,0,1.08,0,.12,.32,.12);[-1,1].forEach(s=>k.p('','cone','g',0xff7a2a,s*.12,1.06,s*.05,.09,.28,.09))},0);
  g.add(fl);g.userData.flame=fl;return g}
function mqm143Table(){const C=MQM143;return lgGroup('MQM143|table',k=>{
  k.p('','box','c',C.woodL,0,.78,0,1.25,.06,.82);[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>k.p('','box','c',C.woodD,a*.55,.38,b*.34,.07,.76,.07));
  k.p('','box','c',0xc8b48a,0,.815,0,.9,.012,.6,0,.08,0);for(let i=0;i<7;i++)k.p('','box','c',0x3a2a1a,-.3+i*.1,.823,-.12+Math.sin(i)*.12,.08,.004,.012,0,i*.5,0);
  k.p('','box','c',0x8a1a1a,.18,.825,.08,.03,.004,.03);k.p('','box','m',C.ironL,-.2,.86,.15,.02,.12,.04,.3,0,.2);
  [[-.5,-.3],[.52,.28]].forEach(([x,z])=>{k.p('','cyl','c',0xd8d0b8,x,.88,z,.025,.12,.025);k.p('','cone4','g',0xffd890,x,.96,z,.014,.04,.014)});
  k.p('','cyl','m',C.brass,.4,.83,-.2,.06,.04,.06)},.12)}
function mqm143Rack(){const C=MQM143;return lgGroup('MQM143|rack',k=>{
  [-1,1].forEach(s=>k.p('','box','c',C.woodD,s*.6,.6,0,.08,1.2,.08));k.p('','box','c',C.wood,0,1.05,0,1.3,.07,.08);k.p('','box','c',C.wood,0,.2,.1,1.3,.06,.1);
  for(let i=0;i<4;i++){const x=-.45+i*.3;k.L('','c',C.woodL,[x,.1,.12],[x,1.85,-.08],.02,.02,5);k.p('','oct','m',C.ironL,x,1.98,-.1,.035,.13,.01)}
  k.p('','cyl','c',C.wood,.5,.5,.2,.26,.03,.26,Math.PI/2,0,0);k.p('','tor','m',C.ironL,.5,.5,.21,.27,.03,.27,Math.PI/2,0,0);k.p('','cyl','c',C.teal,.5,.5,.23,.2,.006,.2,Math.PI/2,0,0)},.14)}
function mqm143Crate(v){const C=MQM143;return lgGroup('MQM143|crate'+(v|0),k=>{const s=v?.58:.7;
  k.p('','box','c',v?C.woodL:C.wood,0,s/2,0,s,s,s);[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>k.p('','box','m',C.ironL,a*s/2,s/2,b*s/2,.05,s*1.01,.05));
  [0,s].forEach(y=>k.p('','box','m',C.ironL,0,y,0,s*1.02,.04,s*1.02));k.p('','box','c',C.woodD,0,s/2,s/2+.005,s*.9,.06,.01,0,0,.78)},.16)}
function mqm143Barrel(){const C=MQM143;return lgGroup('MQM143|barrel',k=>{k.p('','cyl','c',C.wood,0,.45,0,.3,.9,.3);k.p('','cyl','c',C.woodL,0,.45,0,.33,.5,.33);
  [.12,.78].forEach(y=>k.p('','ring','m',C.ironL,0,y,0,.315,.4,.315));k.p('','cyl','c',C.woodD,0,.905,0,.28,.01,.28)},.16)}
// an open crate of empty glowbulb husks: the Wardens are out of fuel
function mqm143BulbCrate(){const C=MQM143;return lgGroup('MQM143|bulbcrate',k=>{const s=.7;
  [[0,-1],[0,1]].forEach(([a,b])=>k.p('','box','c',C.woodL,0,s*.35,b*s/2,s,s*.7,.05));[-1,1].forEach(a=>k.p('','box','c',C.wood,a*s/2,s*.35,0,.05,s*.7,s));k.p('','box','c',C.woodD,0,.04,0,s,.05,s);
  for(let i=0;i<6;i++)k.p('','sph2','c',0x5a6a4a,-.2+(i%3)*.2,.18,-.12+Math.floor(i/3)*.22,.085,.1,.085,.3*i,0,.2);
  k.p('','sph2','g',C.glow,.12,.3,.1,.07,.09,.07);k.p('','cone4','c',0x2a3a20,.12,.4,.1,.05,.05,.05);k.p('','box','c',C.woodL,.1,.62,-.3,.75,.04,.3,.5,0,0)},.16)}
MQM143.sheet.tent=mqm143Tent;MQM143.sheet.stakes=()=>mqm143Stakes(6,3);MQM143.sheet.banner=mqm143Banner;MQM143.sheet.brazier=mqm143Brazier;MQM143.sheet.table=mqm143Table;
MQM143.sheet.rack=mqm143Rack;MQM143.sheet.props=()=>{const g=new THREE.Group();[[mqm143Crate(0),0,0],[mqm143Crate(1),.75,.1],[mqm143Barrel(),-.8,0],[mqm143BulbCrate(),0,.95]].forEach(([o,x,z])=>{o.position.set(x,0,z);g.add(o)});return g};

// ---------------- the glowbulb ----------------
function mqm143Bulb(){const C=MQM143;return lgGroup('MQM143|bulb',k=>{k.p('','sph2','g',C.glowW,0,0,0,.08,.1,.08);k.p('','sph2','g',C.glow,0,-.01,0,.1,.115,.1);
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2;k.p('','cone4','c',0x2e4a22,Math.sin(a)*.04,.1,Math.cos(a)*.04,.035,.07,.015,Math.cos(a)*.7,a,-Math.sin(a)*.7)}
  k.L('','c',0x3a2a1a,[0,.1,0],[.02,.17,0],.01,.006,4)},0)}
MQM143.sheet.bulb=()=>{const g=mqm143Bulb();g.scale.setScalar(4);return g};
