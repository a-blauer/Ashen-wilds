// ================= v205 Vharog, the Bloodgorged — the model, poses and procedural animation =================
// The mini boss of The Citadel II's main quest (moves 3741, the fight 3742). The owner: "a large vampiric beast mini boss that guards
// the gate to the next instance. He should be bipedal with vampiric qualities, is on all fours, and a ferocious appearance."
// The court's war-beast: built like a man — long arms with hands, legs with knees, a human ribcage — but swollen, hunched and
// gorged, it runs on its knuckles and hind claws like an ape crossed with a bat, and rears onto its hind legs to kill. Nothing like
// the zone's Blood Hounds (lean, dog-shaped) or Gargoyles (stone):
//  * Silhouette: a deep barrel chest and huge shoulders over a lean waist and hips, arms longer than its legs (it stands on its
//    knuckles), digitigrade hind legs, a short whip tail with bone hooks, folded bat wings lying over its back like a torn cloak
//    (they open into a vast span when it roars or screeches).
//  * Head: a bat's skull grown huge: enormous pointed ears, a flat pug snout with a nose-leaf, deep sockets with burning red eyes,
//    a heavy underslung jaw with long fangs top and bottom; a black mane from the crown down the neck and shoulders.
//  * Skin (painted, MODEL_DETAIL_RECIPE): ashen mauve, darker down the back, paler on the belly and the insides of the limbs, the
//    ribs and the cords of muscle showing through, crimson veins that glow (brighter in Phase II, vh205Post), old scars.
//  * The court's mark: an iron collar studded with spikes and a broken chain hanging from it (it was chained to the gate).
//  * About twice the triangles of a Blood Hound (VH205M.tris is measured on the first build).
// Joints (L = +x, the model's left; it faces +z): root · hips · spine · chest · neck · head · jaw · earL/R · wgL/R (wings) ·
// shL/R · elL/R · wrL/R (hands) · thL/R · knL/R · hkL/R · ftL/R · tail0..2 · chain. Poses (VH205P) are offsets from the rest pose,
// mirrored with '~' (svPose). In the rest pose it stands on all fours: the torso level, the arms straight down to the knuckles.
var VH205M={col:0xff2a3a,tris:0,sheet:{}};
// ---------------- painted skin: vertex colours by form (value first: dark back, pale belly, ribs, veins) ----------------
function vh205Paint(g,fn){const P=g.attributes.position,N=g.attributes.normal,c=new Float32Array(P.count*3),C=new THREE.Color();
  for(let i=0;i<P.count;i++){fn(P.getX(i),P.getY(i),P.getZ(i),N?N.getX(i):0,N?N.getY(i):1,N?N.getZ(i):0,C);c[i*3]=C.r;c[i*3+1]=C.g;c[i*3+2]=C.b}g.setAttribute('color',new THREE.BufferAttribute(c,3));return g}
const VH205C={base:new THREE.Color(0x4c4050),dark:new THREE.Color(0x2c2430),pale:new THREE.Color(0x8a7882),vein:new THREE.Color(0x7a1424),rib:new THREE.Color(0x6e5e6a),scar:new THREE.Color(0x9a8a8c),inner:new THREE.Color(0x3a1a22),tmp:new THREE.Color()};
function vh205N(x,y,z,s){return Math.sin(x*5.3+s)*Math.cos(y*4.7+s*1.7)*Math.sin(z*5.9+s*.6)*.5+Math.sin(x*11.1+y*9.3+z*7.7+s*2.3)*.25}
// a torso piece lofted along +z: the back (ny>0) darker, the belly paler, ribs on the flanks (rib: spacing along z), veins
function vh205TorsoCol(rib,seed){return (x,y,z,nx,ny,nz,C)=>{const T=VH205C;C.copy(T.base);const up=ny;if(up>0)C.lerp(T.dark,Math.min(1,up*.9));else C.lerp(T.pale,Math.min(1,-up*.8));
    if(rib){const side=Math.abs(nx);const r=Math.sin(z*rib+.6);if(side>.45&&ny<.4&&ny>-.6){if(r>.55)C.lerp(T.rib,.55);else if(r<-.35)C.lerp(T.dark,.35)}}
    const v=vh205N(x,y,z,seed||1);if(Math.abs(v)<.018&&ny<.35&&ny>-.5)C.lerp(T.vein,.55);C.multiplyScalar(.82+.22*(.5*ny+.5))}}
// a limb lofted along -y (o: +1 outward is +x); the inside of the limb paler, the outside darker; knuckles and tips darker
function vh205LimbCol(s,seed){return (x,y,z,nx,ny,nz,C)=>{const T=VH205C;C.copy(T.base);const out=nx*s;if(out>.2)C.lerp(T.dark,Math.min(1,out*.7));else if(out<-.2)C.lerp(T.pale,Math.min(1,-out*.6));
    if(nz>.5)C.lerp(T.dark,.15);const v=vh205N(x*1.4,y,z*1.4,seed||2);if(Math.abs(v)<.016&&out<0)C.lerp(T.vein,.5);C.multiplyScalar(.85+.18*Math.max(-1,Math.min(1,y*.2+.5)))}}
function vh205HeadCol(x,y,z,nx,ny,nz,C){const T=VH205C;C.copy(T.base);if(ny>.3)C.lerp(T.dark,.6);if(ny<-.3)C.lerp(T.pale,.4);if(z>.35&&ny<.2)C.lerp(T.inner,.35);C.multiplyScalar(.85+.2*(.5*ny+.5))}
// a painted mesh (one material, vertex colours): merged per joint at the end (vh205Merge), so the paint survives svMerge
function vh205PM(R,j,geo,fn,x,y,z,rx,ry,rz,sx,sy,sz){const g=geo.index?geo.toNonIndexed():geo;if(!g.attributes.color){g.computeVertexNormals();vh205Paint(g,fn)}const m=svM(R,j,g,R.skin,x,y,z,rx,ry,rz,sx,sy,sz);m.userData.noMerge=1;m.userData.vh=1;return m}
function vh205Merge(R){const by=new Map();R.root.traverse(o=>{if(o.isMesh&&o.userData.vh&&o.parent){if(!by.has(o.parent))by.set(o.parent,[]);by.get(o.parent).push(o)}});
  by.forEach((L,P)=>{if(L.length<2)return;let n=0;L.forEach(o=>{o.updateMatrix();n+=o.geometry.attributes.position.count});const pos=new Float32Array(n*3),col=new Float32Array(n*3),v=new THREE.Vector3();let j=0;
    L.forEach(o=>{const a=o.geometry.attributes.position,c=o.geometry.attributes.color;const flip=o.matrix.determinant()<0;for(let i=0;i<a.count;i++){const q=flip?(i%3==1?i+1:i%3==2?i-1:i):i;v.fromBufferAttribute(a,q).applyMatrix4(o.matrix);pos[j*3]=v.x;pos[j*3+1]=v.y;pos[j*3+2]=v.z;col[j*3]=c.getX(q);col[j*3+1]=c.getY(q);col[j*3+2]=c.getZ(q);j++}});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();g.userData.lps=1;g.userData.svOwn=1;
    const m=new THREE.Mesh(g,R.skin);m.castShadow=true;m.userData.lpsSkip=1;m.userData.noMerge=1;L.forEach(o=>P.remove(o));P.add(m)})}
// a scalloped bat-wing membrane (folded: lies along -z from the root; spread by rotating the joint), in its joint's frame
function vh205WingGeo(){return svG('vh_wing',()=>{const s=new THREE.Shape(),P=[[0,0],[.35,.25],[.9,.35],[1.7,.3],[2.6,.15],[3.4,-.15],[3.05,-.45],[2.75,-.55],[2.45,-.9],[2.05,-.95],[1.75,-1.35],[1.3,-1.4],[.95,-1.8],[.5,-1.6],[.15,-1.1]];
  P.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));const g=new THREE.ExtrudeGeometry(s,{depth:.05,bevelEnabled:false});g.translate(0,0,-.025);g.computeVertexNormals();
  return vh205Paint(g.index?g.toNonIndexed():g,(x,y,z,nx,ny,nz,C)=>{const T=VH205C;C.set(0x3a1e28);const v=Math.abs(Math.sin(Math.atan2(y-.1,x)*6+x*.6));if(v<.12)C.lerp(T.vein,.8);C.multiplyScalar(.7+.25*Math.min(1,x/3.4)+.15*(y+.5))})})}
function vh205Build(R,e){
  R.skin=svMat(R,0xffffff,{vertexColors:true,roughness:.86});const fur=svMat(R,0x1c1418,{roughness:.98}),fur2=svMat(R,0x3a141c,{roughness:.98}),bone=svMat(R,0xcfc4a8,{roughness:.6}),boneD=svMat(R,0x6a5a48,{roughness:.7}),
    iron=svMat(R,0x34343a,{roughness:.5,metalness:.6}),ironR=svMat(R,0x4a2a20,{roughness:.8,metalness:.3}),mouth=svMat(R,0x3a0a12,{roughness:.6}),gum=svMat(R,0x5a1a24,{roughness:.6}),
    eye=svGlowMat(R,0xff2a2a),vein=svGlowMat(R,0xb01020),wingM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,flatShading:true,side:THREE.DoubleSide});wingM.userData.e0=0;wingM.userData.ei0=1;R.mats.push(wingM);
  R.eyeM=eye;R.veinM=vein;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz),G=(k,f)=>svG('vh'+k,f),rn=svRng(2051);
  const PM=(j,k,f,fn,x,y,z,rx,ry,rz,sx,sy,sz)=>vh205PM(R,j,G(k,f),fn,x,y,z,rx,ry,rz,sx,sy,sz);
  // ---------------- the skeleton ----------------
  J('root',null,0,0,0);J('hips','root',0,2.42,-1.25);J('spine','hips',0,.18,.95);J('chest','spine',0,.12,1.0);J('neck','chest',0,.42,.95,-.15);J('head','neck',0,.12,.72,.15);J('jaw','head',0,-.2,.12);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('ear'+L,'head',s*.36,.36,-.1,-.25,0,s*-.55);R.J['ear'+L].scale.setScalar(.72);J('wg'+L,'chest',s*1.02,.55,.35,0,s*.1,s*.32);
    J('sh'+L,'chest',s*1.02,-.02,.38);J('el'+L,'sh'+L,0,-1.32,.06);J('wr'+L,'el'+L,0,-1.18,.14);
    J('th'+L,'hips',s*.72,-.12,-.05);J('kn'+L,'th'+L,0,-.95,.52);J('hk'+L,'kn'+L,0,-.82,-.58);J('ft'+L,'hk'+L,0,-.5,.12)});
  J('tail0','hips',0,.1,-.72,-.25);J('tail1','tail0',0,0,-.62,-.15);J('tail2','tail1',0,0,-.55,-.1);J('chain','neck',0,-.45,.2);J('mane','neck',0,.05,0,Math.PI/2,0,0);
  // ---------------- the torso: haunches, the lean waist, the barrel of ribs, the hump of the shoulders ----------------
  PM('hips','hp',()=>svLoftZ([[-.75,.7,.55,0,.05],[-.35,.86,.7,0,.02],[.15,.88,.72,0,0],[.6,.74,.64,0,-.02]],18),vh205TorsoCol(0,3),0,0,0);
  [-1,1].forEach(s=>PM('hips','hm',()=>svLump(.62,1,.16,2101),vh205TorsoCol(0,4),s*.5,-.05,-.12,0,0,0,1,1.15,1.15));
  PM('spine','sp',()=>svLoftZ([[-.15,.72,.62,0,-.02],[.35,.8,.7,0,-.06],[.85,1.0,.86,0,-.1],[1.12,1.08,.92,0,-.12]],18),vh205TorsoCol(9,5),0,0,0);
  PM('chest','ch',()=>svLoftZ([[-.1,1.08,.94,0,-.1],[.3,1.2,1.06,0,-.14],[.7,1.2,1.08,0,-.12],[1.05,1.06,.96,0,-.04],[1.32,.74,.7,0,.1]],20),vh205TorsoCol(8.5,6),0,0,0);
  // the hump over the shoulders and the shoulder masses
  PM('chest','hu',()=>svLump(.85,1,.18,2102),vh205TorsoCol(0,7),0,.62,.45,0,0,0,1.25,.7,1.05);
  [-1,1].forEach(s=>PM('chest','dl',()=>svLump(.6,1,.15,2103),vh205TorsoCol(0,8),s*.86,.1,.42,0,0,0,1,1.1,1.15));
  // the ridge of bone spines down the back and the tail
  for(let i=0;i<9;i++){const j=i<3?'hips':i<6?'spine':'chest',z=[-.5,-.1,.3,.05,.45,.85,.0,.35,.7][i],y=[.6,.7,.7,.6,.68,.76,1.1,1.18,1.15][i];Mm(j,G('sp'+(i%3),()=>svHorn(.09+(i%3)*.02,.5+(i%3)*.15,0,-.18,5,4)),i%2?bone:boneD,0,y,z,-1.9,0,0)}
  // ---------------- the neck and the mane ----------------
  PM('neck','nk',()=>svLoftZ([[-.25,.62,.66,0,-.05],[.25,.56,.6,0,0],[.7,.48,.52,0,.02]],14),vh205TorsoCol(0,9),0,0,0);
  gb151Cover(R,'mane',[[-.25,.6,.64,0,0],[.25,.56,.6,0,0],[.7,.48,.52,0,0]],{geo:gb151Tuft(),n:12,rows:3,size:.44,seed:2111,lift:.55,w:.6,jit:.3,dir:1,
    skip:(t)=>Math.cos(t)>.2,mat:(t,u,r,k)=>(k+r)%3?fur:fur2});
  // ---------------- the head: a bat's skull grown huge ----------------
  PM('head','hd',()=>svLoftZ([[-.35,.42,.44,0,.05],[-.05,.5,.48,0,.08],[.28,.46,.4,0,.03],[.58,.34,.3,0,-.05],[.86,.24,.22,0,-.1],[.98,.18,.16,0,-.12]],14),vh205HeadCol,0,0,0);
  [-1,1].forEach(s=>PM('head','br',()=>svLump(.24,1,.12,2121),vh205HeadCol,s*.2,.3,.42,0,s*-.3,s*.35,1.3,.55,.9));                       // the brow
  PM('head','sn',()=>svLump(.22,1,.14,2122),vh205HeadCol,0,-.02,.95,0,0,0,1.1,.8,.8);                    // the pug snout
  Mm('head',G('nl',()=>{const s=new THREE.Shape();[[0,.28],[.11,.1],[.13,-.06],[0,-.14],[-.13,-.06],[-.11,.1]].forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));const g=new THREE.ExtrudeGeometry(s,{depth:.05,bevelEnabled:false});g.translate(0,0,-.025);return g}),gum,0,.1,1.1,-.35,0,0);   // the nose-leaf
  [-1,1].forEach(s=>{Mm('head',G('nos',()=>new THREE.SphereGeometry(.05,5,4)),mouth,s*.08,-.02,1.13);
    Mm('head',G('sock',()=>svLump(.12,1,.1,2123)),mouth,s*.22,.17,.58,0,0,s*.3,1.3,.6,.6);Mm('head',G('eye',()=>new THREE.IcosahedronGeometry(.06,1)),eye,s*.22,.17,.64,0,0,s*.35,1.6,.6,.8);svSpr(R,'head',0xff2020,.45,s*.22,.17,.7);
    // the upper fangs and the tusks at the corners of the mouth
    Mm('head',G('fg',()=>{const q=new THREE.ConeGeometry(.055,.42,5);q.rotateX(Math.PI);q.translate(0,-.21,0);return q}),bone,s*.14,-.14,.9,-.12,0,s*-.05);
    Mm('head',G('fg2',()=>{const q=new THREE.ConeGeometry(.04,.24,5);q.rotateX(Math.PI);q.translate(0,-.12,0);return q}),bone,s*.2,-.14,.72,-.1,0,s*-.1);
    // cheek frills of skin and bristle under the ears
    Mm('head',G('chk',()=>svBlade([[0,0],[.3,.12],[.42,-.1],[.25,-.28],[0,-.18]],.04)),fur,s*.45,-.05,.15,0,s>0?-.9:Math.PI+.9,0)});
  // the crest of mane on the crown
  for(let i=0;i<7;i++){Mm('head',G('mn'+(i%2),()=>svHorn(.08,.55+(i%2)*.2,0,-.25,4,3)),i%2?fur:fur2,(i-3)*.09,.48-(Math.abs(i-3))*.04,-.15,-2.4,0,(i-3)*.12)}
  // the ears: huge, pointed, ribbed, the insides raw red
  [-1,1].forEach(s=>{const L=s>0?'L':'R',ord=P=>s>0?P:P.map(([x,y])=>[-x,y]).reverse();Mm('ear'+L,G('ear'+L,()=>{const q=new THREE.Shape();ord([[-.2,0],[.23,.15],[.35,.7],[.27,1.35],[.15,1.7],[-.03,1.2],[-.25,.7],[-.35,.25]]).forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));const g=new THREE.ExtrudeGeometry(q,{depth:.07,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:1});g.translate(0,0,-.035);return g}),
      fur,0,0,0,0,s>0?.3:-.3,0);
    Mm('ear'+L,G('eari'+L,()=>{const q=new THREE.Shape();ord([[-.1,.1],[.15,.25],[.22,.75],[.14,1.25],[.02,.95],[-.14,.55],[-.2,.25]]).forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));return new THREE.ShapeGeometry(q)}),gum,0,0,.06,0,s>0?.3:-.3,0)});
  // the jaw: heavy, underslung, with long lower fangs; the mouth inside is dark red
  PM('jaw','jw',()=>svLoftZ([[-.15,.34,.14,0,-.02],[.25,.32,.16,0,-.06],[.62,.22,.12,0,-.04],[.9,.13,.08,0,0]],12),vh205HeadCol,0,-.02,0);
  Mm('jaw',G('mo',()=>svLoftZ([[-.1,.28,.06],[.75,.16,.05]],10)),mouth,0,.08,0);Mm('jaw',G('tg',()=>svLump(.14,1,.15,2124)),gum,0,.1,.25,0,0,0,1,.4,2);
  [-1,1].forEach(s=>{Mm('jaw',G('lf',()=>{const q=new THREE.ConeGeometry(.05,.26,5);q.translate(0,.13,0);return q}),bone,s*.2,.04,.72,.15,0,s*.12);for(let k=0;k<4;k++)Mm('jaw',G('lt',()=>{const q=new THREE.ConeGeometry(.025,.1,4);q.translate(0,.05,0);return q}),bone,s*(.15+k*.03),.06,.62-k*.14)});
  for(let k=0;k<6;k++)Mm('head',G('ut',()=>{const q=new THREE.ConeGeometry(.025,.1,4);q.rotateX(Math.PI);q.translate(0,-.05,0);return q}),bone,k<4?(k-1.5)*.07:(k-4.5)*.3,-.14,k<4?.98:.82);
  // ---------------- the collar and its broken chain ----------------
  Mm('neck',G('col',()=>new THREE.TorusGeometry(.66,.1,6,16)),iron,0,0,.05,0,0,0,1,1.05,1);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;Mm('neck',G('cs',()=>new THREE.ConeGeometry(.06,.24,4)),iron,Math.cos(a)*.75,Math.sin(a)*.75,.05,0,0,a-Math.PI/2)}
  Mm('chain',G('cl',()=>new THREE.TorusGeometry(.11,.035,4,8)),ironR,0,0,0);Mm('chain',G('cl',()=>new THREE.TorusGeometry(.11,.035,4,8)),ironR,0,-.17,0,0,Math.PI/2,0);Mm('chain',G('cl',()=>new THREE.TorusGeometry(.11,.035,4,8)),ironR,0,-.34,0);
  Mm('chain',G('clb',()=>new THREE.TorusGeometry(.11,.035,4,8,Math.PI*1.3)),ironR,0,-.51,0,0,Math.PI/2,0);
  // ---------------- the arms: long, corded, ending in great clawed hands on their knuckles ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',sh='sh'+L,el='el'+L,wr='wr'+L;
    PM(sh,'ua'+L,()=>svLoft([[.25,.46,.5],[-.05,.5,.52],[-.55,.46,.46,s*.04],[-1.05,.36,.38],[-1.36,.34,.36]],12),vh205LimbCol(s,11),0,0,0);
    PM(sh,'bi'+L,()=>svLump(.3,1,.12,2131),vh205LimbCol(s,12),s*.05,-.55,.16,0,0,0,1,1.4,1);
    PM(el,'fa'+L,()=>svLoft([[.12,.34,.36],[-.3,.36,.36],[-.8,.28,.29],[-1.15,.24,.26]],12),vh205LimbCol(s,13),0,0,0);
    for(let k=0;k<3;k++)Mm(el,G('fs',()=>svHorn(.05,.32,0,-.1,4,3)),boneD,s*.22,-.2-k*.25,-.18,-2.6,s*.3,0);   // spurs down the forearm
    // the hand: a knuckled palm, four fingers curled under onto the ground, black hooked claws, a thumb claw
    PM(wr,'pa'+L,()=>svLump(.3,1,.1,2132),vh205LimbCol(s,14),0,-.12,.08,0,0,0,1.1,.7,1.15);
    for(let f=0;f<4;f++){const x=(f-1.5)*.14;PM(wr,'fk'+L+f,()=>svLoftZ([[0,.075,.08],[.22,.07,.07],[.32,.055,.06]],6),vh205LimbCol(s,15),x,-.2,.25,.55,0,0);
      Mm(wr,G('cw',()=>svHorn(.05,.32,0,-.2,5,4)),bone,x,-.32,.5,.9,0,0)}
    Mm(wr,G('cwt',()=>svHorn(.05,.28,0,-.15,5,4)),bone,s*.26,-.18,.2,.6,s*.6,0);
    // the wing: lies along the back, its leading edge a long finger bone
    const wg='wg'+L;const wm=Mm(wg,vh205WingGeo(),wingM,0,0,0,0,Math.PI/2,0);wm.userData.noMerge=1;
    Mm(wg,G('wb',()=>svTube([[0,0,0],[0,.32,-.9],[0,.3,-1.7],[0,.15,-2.6],[0,-.15,-3.4]],[.07,.06,.05,.04,.02],5)),boneD,0,0,0);wm.scale.set(1,.85,1);
    Mm(wg,G('wh',()=>svHorn(.05,.3,0,.15,4,3)),bone,0,.05,.05,-1.2,0,0);
    // ---------------- the legs: heavy thighs, digitigrade shins, long clawed feet ----------------
    const th='th'+L,kn='kn'+L,hk='hk'+L,ft='ft'+L;
    PM(th,'tg'+L,()=>svLoft([[.2,.5,.56],[-.2,.56,.58],[-.6,.46,.48],[-.95,.32,.34]],12),vh205LimbCol(s,16),0,0,.12,-.5);
    PM(kn,'sh'+L,()=>svLoft([[.1,.3,.32],[-.35,.27,.28],[-.85,.17,.18]],10),vh205LimbCol(s,17),0,0,0,.62);
    PM(hk,'mt'+L,()=>svLoft([[.08,.17,.17],[-.5,.13,.13]],8),vh205LimbCol(s,18),0,0,0,-.25);
    PM(ft,'ft'+L,()=>svLoftZ([[-.12,.2,.12],[.2,.22,.11],[.45,.18,.08]],8),vh205LimbCol(s,19),0,-.06,0);
    for(let f=0;f<3;f++)Mm(ft,G('tc',()=>svHorn(.05,.3,0,-.18,5,4)),bone,(f-1)*.12,-.08,.45,.5,(f-1)*.2,0);
    Mm(hk,G('hs',()=>svHorn(.05,.26,0,.1,4,3)),boneD,0,0,-.12,2.6,0,0)});   // a spur at the hock
  // ---------------- the tail: short, whipping, hooked with bone ----------------
  PM('tail0','t0',()=>svLoftZ([[.1,.3,.28],[-.65,.2,.19]],10),vh205TorsoCol(0,21),0,0,0);PM('tail1','t1',()=>svLoftZ([[.05,.2,.19],[-.6,.13,.12]],8),vh205TorsoCol(0,22),0,0,0);
  PM('tail2','t2',()=>svLoftZ([[.05,.13,.12],[-.6,.04,.04]],8),vh205TorsoCol(0,23),0,0,0);
  ['tail0','tail1','tail2'].forEach((t,i)=>Mm(t,G('th'+i,()=>svHorn(.06-i*.01,.28,0,-.12,4,3)),bone,0,.15-i*.03,-.3,-1.7,0,0));Mm('tail2',G('tb',()=>svHorn(.07,.45,0,.25,5,4)),bone,0,0,-.55,Math.PI,0,0);
  // ---------------- the glowing veins (a few lines that read at a distance) ----------------
  [[-1,'chest',.0],[1,'chest',.2],[-1,'spine',.5],[1,'hips',-.3]].forEach(([s,j,z],i)=>Mm(j,G('vn'+i,()=>svTube([[0,0,0],[.05,.12,.25],[.02,.3,.5],[.08,.4,.72]],.022,4)),vein,s*(j=='chest'?1.12:j=='spine'?.86:.82),j=='chest'?-.15:-.1,z,0,0,s*.2));
  vh205Merge(R);
  if(!VH205M.tris){let n=0;R.root.traverse(o=>{if(o.isMesh){const g=o.geometry;n+=g.index?g.index.count/3:g.attributes.position.count/3}});VH205M.tris=Math.round(n)}
  R.headJ='head'}
// ---------------- poses (offsets from rest: [rx, ry, rz, px, py, pz]) ----------------
// rear: the torso pitched up onto the hind legs (the thighs turn back so the feet stay planted)
const VH205_REAR=(k,o)=>Object.assign({hips:[-1.15*k,0,0,0,.95*k,-.35*k],thL:[1.1*k,0,0],thR:[1.1*k,0,0],knL:[.1*k,0,0],knR:[.1*k,0,0],neck:[.65*k,0,0],head:[.35*k,0,0],tail0:[.7*k,0,0]},o||{});
var VH205P={
  idle:{},
  // Rending Claws: the right claw cocked back and out, the swipe across; the left; rearing up and the double slam
  rUp:{hips:[0,.25,0,0,.15,0],chest:[-.15,.35,.08],shR:[-1.5,.3,-.85],elR:[-.9,0,0],wrR:[.4,0,0],shL:[.15,0,.1],neck:[.1,-.3,0],head:[0,-.2,0],jaw:[.25,0,0]},
  rHit:{hips:[.05,-.3,0,0,-.05,.3],chest:[.12,-.55,-.1],shR:[-1.25,-.35,.65],elR:[-.2,0,0],wrR:[-.2,0,0],shL:[.2,0,.15],neck:[0,.35,0],head:[0,.25,0],jaw:[.5,0,0]},
  lUp:{hips:[0,-.25,0,0,.15,0],chest:[-.15,-.35,-.08],shL:[-1.5,-.3,.85],elL:[-.9,0,0],wrL:[.4,0,0],shR:[.15,0,-.1],neck:[.1,.3,0],head:[0,.2,0],jaw:[.25,0,0]},
  lHit:{hips:[.05,.3,0,0,-.05,.3],chest:[.12,.55,.1],shL:[-1.25,.35,-.65],elL:[-.2,0,0],wrL:[-.2,0,0],shR:[.2,0,-.15],neck:[0,-.35,0],head:[0,-.25,0],jaw:[.5,0,0]},
  xUp:VH205_REAR(1,{shL:[-2.7,0,.35],shR:[-2.7,0,-.35],elL:[-.5,0,0],elR:[-.5,0,0],wrL:[.5,0,0],wrR:[.5,0,0],jaw:[.7,0,0],wgL:[0,-.5,.3],wgR:[0,.5,-.3]}),
  xHit:{hips:[.15,0,0,0,-.35,.6],chest:[.3,0,0],thL:[-.3,0,0],thR:[-.3,0,0],knL:[.4,0,0],knR:[.4,0,0],shL:[-.75,0,.1],shR:[-.75,0,-.1],elL:[-.1,0,0],elR:[-.1,0,0],neck:[.2,0,0],head:[-.2,0,0],jaw:[.8,0,0]},
  rec:{hips:[0,0,0,0,-.05,0],neck:[.05,0,0]},
  // Pounce: the crouch, the leap (stretched), the landing pinning the ground
  crouch:{hips:[.12,0,0,0,-.55,-.15],chest:[.1,0,0],shL:[.45,0,.1],shR:[.45,0,-.1],elL:[-.9,0,0],elR:[-.9,0,0],wrL:[.45,0,0],wrR:[.45,0,0],thL:[-.45,0,0],thR:[-.45,0,0],knL:[.7,0,0],knR:[.7,0,0],hkL:[-.35,0,0],hkR:[-.35,0,0],neck:[-.2,0,0],head:[.15,0,0],tail0:[-.3,0,0],jaw:[.3,0,0]},
  air:{hips:[-.25,0,0,0,1.35,0],chest:[-.1,0,0],shL:[-1.55,0,.25],shR:[-1.55,0,-.25],elL:[-.15,0,0],elR:[-.15,0,0],wrL:[-.5,0,0],wrR:[-.5,0,0],thL:[.95,0,0],thR:[.95,0,0],knL:[-.25,0,0],knR:[-.25,0,0],hkL:[.35,0,0],hkR:[.35,0,0],neck:[.1,0,0],jaw:[.8,0,0],wgL:[0,-.6,.5],wgR:[0,.6,-.5],tail0:[.4,0,0]},
  land:{hips:[.18,0,0,0,-.45,.2],chest:[.22,0,0],shL:[-.7,0,.3],shR:[-.7,0,-.3],elL:[-.35,0,0],elR:[-.35,0,0],thL:[-.3,0,0],thR:[-.3,0,0],knL:[.5,0,0],knR:[.5,0,0],neck:[.25,0,0],head:[-.15,0,0],jaw:[1.0,0,0]},
  // Wing Buffet: the wings thrown open, the body wound round
  spW:{hips:[0,.7,0,0,.1,0],chest:[0,.35,0],neck:[0,-.5,0],wgL:[.2,-1.25,.75],wgR:[.2,1.25,-.75],shL:[-.4,0,.6],shR:[-.4,0,-.6],jaw:[.4,0,0]},
  spGo:{hips:[0,-.5,0,0,.1,0],chest:[0,-.4,0],neck:[0,.4,0],wgL:[.1,-1.35,.9],wgR:[.1,1.35,-.9],shL:[-.5,0,.7],shR:[-.5,0,-.7],jaw:[.6,0,0]},
  // Gore Spew: the gulp (head thrown back) and the spew (neck stretched forward and down)
  gulp:{hips:[-.15,0,0,0,.2,-.2],chest:[-.2,0,0],neck:[-.55,0,0],head:[-.4,0,0],jaw:[.15,0,0],shL:[-.2,0,.15],shR:[-.2,0,-.15]},
  spew:{hips:[.1,0,0,0,-.1,.3],chest:[.15,0,0],neck:[.35,0,0,0,0,.15],head:[.3,0,0],jaw:[1.05,0,0]},
  // Screech: rearing half up, the wings half spread, the maw open wide
  scr:VH205_REAR(.55,{neck:[-.1,0,0],head:[-.25,0,0],jaw:[1.15,0,0],wgL:[.1,-.8,.5],wgR:[.1,.8,-.5],shL:[-1.1,0,.5],shR:[-1.1,0,-.5],earL:[-.4,0,.3],earR:[-.4,0,-.3]}),
  // Feeding Bite: the lunge with the maw open, the snap
  bOpen:{hips:[.1,0,0,0,-.1,.55],chest:[.15,0,0],neck:[.3,0,0,0,0,.25],head:[-.2,0,0],jaw:[1.1,0,0],shL:[-.5,0,.1],shR:[-.5,0,-.1]},
  bSnap:{hips:[.12,0,0,0,-.12,.75],chest:[.18,0,0],neck:[.4,0,0,0,0,.3],head:[.15,0,0],jaw:[0,0,0],shL:[-.55,0,.1],shR:[-.55,0,-.1]},
  drink:{hips:[.15,0,0,0,-.2,.6],chest:[.2,0,0],neck:[.5,0,0,0,0,.2],head:[.25,0,0],jaw:[.25,0,0],shL:[-.65,0,.2],shR:[-.65,0,-.2],elL:[-.4,0,0],elR:[-.4,0,0]},
  // Phase II, the hunt, the signature
  roar:VH205_REAR(1,{neck:[-.2,0,0],head:[-.45,0,0],jaw:[1.2,0,0],shL:[-1.4,0,1.25],shR:[-1.4,0,-1.25],elL:[-.7,0,0],elR:[-.7,0,0],wgL:[.25,-1.4,.95],wgR:[.25,1.4,-.95],earL:[-.5,0,.35],earR:[-.5,0,-.35],tail0:[.9,0,0]}),
  leapUp:{hips:[-.6,0,0,0,2.6,0],chest:[-.2,0,0],shL:[-2.6,0,.3],shR:[-2.6,0,-.3],thL:[.9,0,0],thR:[.9,0,0],knL:[-.3,0,0],knR:[-.3,0,0],wgL:[.2,-1.2,.8],wgR:[.2,1.2,-.8],jaw:[.6,0,0]},
  lunge:{hips:[.05,0,0,0,.25,0],chest:[0,0,0],shL:[-1.5,0,.2],shR:[-1.5,0,-.2],elL:[-.1,0,0],elR:[-.1,0,0],thL:[.85,0,0],thR:[.85,0,0],knL:[-.2,0,0],knR:[-.2,0,0],neck:[.15,0,0],jaw:[.9,0,0],wgL:[0,-.9,.5],wgR:[0,.9,-.5]},
  chained:{hips:[.25,.2,.25,0,-.75,0],chest:[.3,0,.15],neck:[.4,.3,0],head:[.4,.4,.3],jaw:[.8,0,0],shL:[.4,0,.6],shR:[.6,0,-.5],elL:[-.6,0,0],elR:[-.4,0,0],wgL:[.3,-.5,.2],wgR:[.3,.3,-.1],thL:[-.3,0,0],thR:[-.2,0,.1],knL:[.6,0,0],knR:[.5,0,0]},
  stag:{hips:[.25,.15,.2,0,-.5,0],chest:[.25,0,.12],neck:[.3,0,0],head:[.45,.3,.25],jaw:[.6,0,0],shL:[.3,0,.5],shR:[.45,0,-.3],elL:[-.4,0,0],elR:[-.3,0,0]},
  sleep:{hips:[.1,0,.08,0,-1.15,0],chest:[.08,0,.05],neck:[.55,.4,0],head:[.35,.3,.2],jaw:[.05,0,0],shL:[-1.2,0,.25],shR:[-1.3,0,-.15],elL:[1.0,0,0],elR:[1.1,0,0],wrL:[.5,0,0],wrR:[.6,0,0],thL:[-1.2,0,.15],thR:[-1.15,0,-.1],knL:[2.0,0,0],knR:[2.0,0,0],hkL:[-1.0,0,0],hkR:[-1.0,0,0],tail0:[-.2,.8,0],tail1:[0,.5,0],wgL:[-.1,.1,.1],wgR:[-.1,-.1,-.1],earL:[.3,0,.2],earR:[.3,0,-.2]},
  dead:{hips:[.2,0,1.25,0,-1.25,0],chest:[.15,0,.2],neck:[.45,.5,0],head:[.5,.5,.3],jaw:[.95,0,0],shL:[.6,0,.8],shR:[-.9,0,-1.2],elL:[-.8,0,0],elR:[-.3,0,0],thL:[-.6,0,.3],thR:[.2,0,-.2],knL:[1.2,0,0],knR:[.6,0,0],wgL:[.4,-1.0,.6],wgR:[.1,.4,-.2],tail0:[0,.6,0]}};
// ---------------- the procedural layer: breathing, a four-limbed gait, the tail, ears and wings, the head tracking you ----------------
function vh205Loco(e,S,O,dt,now){const t=now/1000,sp=S.spd||0,a=Math.min(1,sp/3.2),run=Math.max(0,Math.min(1,(sp-3.4)/2.5));S.gp=(S.gp||0)+dt*(1.8+sp*1.55);const g=S.gp,br=Math.sin(t*1.5);
  O.chest[4]+=.035*br;O.chest[0]+=-.025*br;O.neck[0]+=.03*br;O.jaw[0]+=.06+.05*Math.max(0,br);
  // a diagonal gait: the left arm swings with the right leg; a gallop at speed (the arms and legs in pairs)
  ['L','R'].forEach((s,j)=>{const pa=g+j*Math.PI,pl_=g+(j?0:Math.PI)+run*(j?0:-Math.PI),sw=Math.sin(pa),lf=Math.max(0,Math.cos(pa)),sl=Math.sin(pl_),ll=Math.max(0,Math.cos(pl_)),A=.42+.2*run;
    O['sh'+s][0]+=-sw*A*a;O['el'+s][0]+=-lf*.55*a;O['wr'+s][0]+=lf*.35*a+sw*.2*a;O['sh'+s][2]+=(j?-1:1)*.04*a;
    O['th'+s][0]+=-sl*(.48+.15*run)*a;O['kn'+s][0]+=ll*.55*a;O['hk'+s][0]+=-ll*.4*a;O['ft'+s][0]+=ll*.3*a});
  O.hips[4]+=Math.abs(Math.sin(g))*.09*a+run*.12*Math.sin(g*2);O.chest[2]+=Math.sin(g)*.06*a;O.hips[2]+=-Math.sin(g)*.05*a;O.chest[0]+=.08*a+run*.06*Math.sin(g*2);O.neck[0]+=-.1*a;
  // the tail whips, the ears flick, the folded wings breathe
  for(let i=0;i<3;i++){O['tail'+i][1]+=Math.sin(t*2.1-i*.8)*(.18+.12*a)*(1+i*.3);O['tail'+i][0]+=Math.sin(t*1.3-i*.6)*.06}
  const fl=Math.max(0,Math.sin(t*2.7)*Math.sin(t*1.1));O.earL[2]+=fl*.25;O.earR[2]-=Math.max(0,Math.sin(t*2.3+1)*Math.sin(t*.9))*.25;
  O.wgL[1]+=-.04*br;O.wgR[1]+=.04*br;O.wgL[2]+=.03*a*Math.sin(g);O.wgR[2]-=.03*a*Math.sin(g);
  // the head follows the hero (outside moves)
  const m=e.m,hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,yaw=svAng(Math.atan2(hx,hz)-m.rotation.y),k=S.mv?0:(Math.abs(yaw)<1.7?1:0);
  S.hy=(S.hy||0)+((Math.max(-.75,Math.min(.75,yaw))*k)-(S.hy||0))*Math.min(1,dt*3.5);O.head[1]+=S.hy*.55;O.neck[1]+=S.hy*.4}
// after the pose: the veins and eyes burn (brighter in Phase II, while charging and hunting), blood drips from the maw
function vh205Post(e,S,dt,now){const R=S.R,t=now/1000,ph2=S.ph>1,ch=S.chg||0;
  const k=(ph2?1.25:.75)+.25*Math.sin(t*2.6)+ch*1.2;R.veinM.color.setRGB(Math.min(1,.7*k),Math.min(1,.08*k),Math.min(1,.12*k));R.eyeM.color.setHex(ch>.4||S.hunt?0xffd0d0:ph2?0xff5050:0xff2a2a);
  if(!S.dieM&&Math.random()<dt*(ph2?4:2)){const p=svWP(e,'jaw',(Math.random()-.5)*.3,-.05,.45);burst(p,0x8a0a14,1,.08,-1.2,.7)}
  if(S.hunt&&Math.random()<dt*20){const p=svWP(e,'chest',(Math.random()-.5)*2,Math.random(),(Math.random()-.5)*2);burst(p,0x1a0a10,1,.6,.4,.6)}}
// preview sheets (v143_look PROPS=vharog / vhP:<pose>)
VH205M.sheet.vharog=()=>{const R=svRig();vh205Build(R,null);svRest(R);svMerge(R);return R.root};
VH205M.pose=(root,R,name)=>{const P=svPose({P:VH205P},name);for(const k in P){const g=R.J[k],o=P[k];if(!g)continue;const r0=g.userData.r0,p0=g.userData.p0;g.rotation.set(r0.x+o[0],r0.y+o[1],r0.z+o[2]);g.position.set(p0.x+(o[3]||0),p0.y+(o[4]||0),p0.z+(o[5]||0))}};
Object.assign(KQSH151,VH205M.sheet);
