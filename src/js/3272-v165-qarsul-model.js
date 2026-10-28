// ================= v165 Qarsul, the Living Dune — the model, poses and procedural animation =================
// The mini boss of Searing Sands I's main quest (the dig is 3271, the moves 3273, the fight 3274). The sand dug off the Sunken
// Temple's doors gathers itself into a guardian: a towering elemental of packed sand and temple stone, nothing like the zone's
// ordinary Sand Elementals (humanoid, sandstone-skinned, on two legs):
//  * No legs: from the hips down he is a spinning vortex of sand (three rings turning at different speeds, pebbles and shards
//    whirling in them) that skims over the ground; he rises from it and sinks back into it.
//  * Body: a barrel torso of packed sand armoured with shingled sandstone plates cut from the temple (some carved with glyphs);
//    seams in it show his heart: a golden scarab relic burning amber in his chest.
//  * Head: a sandstone mask (a heavy brow, deep sockets with burning eyes, a slot of a mouth that glows when he roars) under a
//    crown of broken obelisk tips; sand streams off him all the time.
//  * Arms: thick columns of sand ringed with stones. The left ends in a fist of sandstone blocks; the right is fused with a broken
//    obelisk (glyph bands, a gold pyramidion) that he swings as a club. Two great carved boulders for pauldrons (a lotus capital,
//    an eye of the sun).
//  * Around his waist a ring of debris orbits: stones, pottery, bones, a skull, a gold amulet.
//  * S.melt (0..1, set by the moves) dissolves him into the ground: his body sinks and squashes into a mound of sand (Dune Surge,
//    Collapse, the Heart of the Dune).
// Joints (L = +x, the model's left): root · vtx · v0 · v1 · v2 · hips · spine · chest · core · orbit · neck · head · jaw · crown ·
// shL/R · elL/R · wrL/R · club. Poses (QS165P) are offsets from the rest pose, mirrored with '~' (svPose).
var QS165M={col:0xffb040,sand:0xd8b47a,tris:0,sheet:{}};
function qs165Blob(k,seed,j,ws){return svG('qsB'+k,()=>{const g=new THREE.SphereGeometry(1,ws||12,Math.max(6,((ws||12)*.7)|0)),P=g.attributes.position,s=seed||1;
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),n=Math.sin(x*3.1+s)*Math.cos(y*2.7+s*1.3)*Math.sin(z*3.3+s*.7)+.5*Math.sin(x*6.2+y*5.1+s*2.1);const q=1+(j==null?.14:j)*n;P.setXYZ(i,x*q,y*q,z*q)}
  g.computeVertexNormals();return g})}
// a cut sandstone plate (a thick bevelled slab, its face +z), for the shingled armour
function qs165Plate(){return svG('qs_pl',()=>{const o=[[-.5,.5],[.5,.5],[.56,0],[.48,-.5],[-.48,-.5],[-.56,0]],pos=[];
  const top=o.map(([x,y])=>[x*.92,y*.92,.09]),bot=o.map(([x,y])=>[x,y,-.06]),c=[0,0,.11],cb=[0,0,-.06],T=(a,b,d)=>pos.push(a[0],a[1],a[2],b[0],b[1],b[2],d[0],d[1],d[2]);
  for(let i=0;i<o.length;i++){const j=(i+1)%o.length;T(c,top[i],top[j]);T(cb,bot[j],bot[i]);T(top[i],bot[i],bot[j]);T(top[i],bot[j],top[j])}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g})}
// one ring of the vortex: an open, twisted funnel of sand (wide at the bottom), with streaks in its colours
function qs165Funnel(k,r0,r1,h,tw){return svG('qs_fn'+k,()=>{const n=30,m=9,pos=[],col=[],idx=[],c=new THREE.Color();
  for(let j=0;j<=m;j++){const t=j/m,r=r0+(r1-r0)*t;for(let i=0;i<=n;i++){const a=i/n*Math.PI*2+t*tw,wob=1+.08*Math.sin(a*5+t*7);pos.push(Math.cos(a)*r*wob,t*h,Math.sin(a)*r*wob);
      const s=.5+.5*Math.sin(a*3+t*9);c.setHex(s>.7?0xe8cc94:s>.35?0xd0ac70:0xb08a52);col.push(c.r,c.g,c.b)}}
  for(let j=0;j<m;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+1,cc=a+n+1,d=cc+1;idx.push(a,cc,b,b,cc,d)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);return g.toNonIndexed()})}
function qs165Build(R,e){
  const sand=svMat(R,0xb07e48,{roughness:.97}),sand2=svMat(R,0x8e6438,{roughness:.97}),sand3=svMat(R,0xd2aa70,{roughness:.96}),
    stone=svMat(R,0xd6b884,{roughness:.86}),stone2=svMat(R,0xbe9a66,{roughness:.88}),stoneD=svMat(R,0x7a5a36,{roughness:.9}),glyph=svMat(R,0x2e1c0c,{roughness:.9}),
    gold=svMat(R,0xd8a840,{roughness:.32,metalness:.75}),bone=svMat(R,0xd8ccb0,{roughness:.7}),clay=svMat(R,0x9a5a34,{roughness:.85}),
    vort=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,flatShading:true,transparent:true,opacity:.86,side:THREE.DoubleSide,depthWrite:false}),
    core=svGlowMat(R,0xffb040),coreHot=svGlowMat(R,0xffe0a0),eye=svGlowMat(R,0xffd060),crack=svGlowMat(R,0xff9a30,.85);
  R.mats.push(vort);vort.userData.e0=0;vort.userData.ei0=1;R.coreM=core;R.coreHot=coreHot;R.eyeM=eye;R.crackM=crack;R.vortM=vort;R.sandMs=[sand,sand2,sand3];
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz),G=(k,f)=>svG('qs'+k,f);
  const B=(j,k,m,x,y,z,sx,sy,sz,rx,ry,rz,jt)=>Mm(j,qs165Blob(k,k*1.9+5,jt),m,x,y,z,rx||0,ry||0,rz||0,sx,sy,sz),rn=svRng(1651);
  const box=(j,m,x,y,z,w,h,d,rx,ry,rz)=>Mm(j,G('bx',()=>new THREE.BoxGeometry(1,1,1)),m,x,y,z,rx||0,ry||0,rz||0,w,h,d);
  // ---------------- the skeleton: the vortex foot, then the body above it ----------------
  J('root',null,0,0,0);J('vtx','root',0,0,0);J('v0','vtx',0,.05,0);J('v1','vtx',0,.85,0);J('v2','vtx',0,1.6,0);
  J('hips','root',0,2.45,0);J('spine','hips',0,.45,-.05,.12);J('chest','spine',0,.75,0,.1);J('core','chest',0,.4,1.12);J('orbit','hips',0,.25,0);
  J('neck','chest',0,1.15,.25,-.25);J('head','neck',0,.32,.12,-.05);R.J.head.scale.setScalar(1.38);J('jaw','head',0,-.18,.2);J('crown','head',0,.42,-.05);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('sh'+L,'chest',s*1.32,.82,.05,-.25,0,s*-.25);J('el'+L,'sh'+L,0,-1.1,0,-.5);J('wr'+L,'el'+L,0,-1.05,.05,.15)});
  J('club','wrR',0,-.25,.1,-.35,0,0);
  // ---------------- the vortex: three twisted funnels, pebbles whirling in them, dust at the ground ----------------
  Mm('v0',qs165Funnel(0,2.1,1.35,.95,1.2),vort,0,0,0);Mm('v1',qs165Funnel(1,1.42,1.02,.85,-1.4),vort,0,0,0);Mm('v2',qs165Funnel(2,1.08,.86,.95,1.6),vort,0,0,0);
  for(let i=0;i<18;i++){const v=['v0','v1','v2'][i%3],a=i/18*Math.PI*2*3+rn(),r=[1.7,1.2,.95][i%3]*(.9+rn()*.2);Mm(v,G('pb'+(i%4),()=>svLump(.12+(i%4)*.03,0,.4,160+i)),i%5==0?stoneD:stone2,Math.cos(a)*r,.2+rn()*.6,Math.sin(a)*r,rn()*3,rn()*3,rn()*3)}
  // ---------------- hips: a broken column drum ringed with blocks, packed sand over it ----------------
  Mm('hips',G('hp',()=>svLoft([[-.55,.92,.82],[-.15,1.05,.92],[.25,1.1,.95],[.5,1.0,.88]],24)),sand);
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2;box('hips',i%3?stone:stone2,Math.sin(a)*1.02,-.05+(i%2)*.08,Math.cos(a)*.92,.62,.5,.42,0,a,0)}
  for(let i=0;i<9;i++){const a=(i+.5)/9*Math.PI*2;Mm('hips',G('hsd',()=>svLump(.22,0,.35,171)),sand3,Math.sin(a)*1.08,-.45,Math.cos(a)*.98,rn(),rn()*3,rn())}
  // ---------------- the torso: a barrel of packed sand, plated with temple stone; seams glow with the heart ----------------
  const spR=[[-.1,.95,.85,0,0],[.35,1.05,.92,0,0],[.75,1.18,1.0,0,.02]];Mm('spine',G('sp',()=>svLoft(spR,24)),sand);
  const chR=[[-.05,1.18,1.0,0,.02],[.35,1.42,1.12,0,.06],[.75,1.5,1.12,0,.04],[1.1,1.3,.98,0,-.02],[1.35,.86,.72,0,-.06]];Mm('chest',G('ch',()=>svLoft(chR,26)),sand);
  B('chest',1,sand2,0,.55,.75,.75,.5,.32);
  // the plates (gb151Cover lays shingles down a loft): stone, some carved, gaps showing sand; the chest's centre left open for the heart
  gb151Cover(R,'chest',[[.05,1.22,1.04,0,.02],[.45,1.46,1.14,0,.06],[.85,1.48,1.1,0,.03],[1.2,1.2,.92,0,-.03]],{geo:qs165Plate(),n:17,rows:5,size:.4,seed:31,lift:.14,w:1.15,out:.02,
    skip:(t,u,r,k)=>(Math.abs(Math.sin(t))<.5&&Math.cos(t)>0&&u<.8)||(k*7+r*3)%9==0,mat:(t,u,r,k)=>(k*5+r*3)%7==0?stone2:(k+r)%4==0?stoneD:stone});
  gb151Cover(R,'spine',spR,{geo:qs165Plate(),n:16,rows:3,size:.36,seed:32,lift:.1,w:1.2,out:.02,skip:(t)=>Math.sin(t*3)>.6,mat:(t,u,r,k)=>(k+r)%3?stone:stone2});
  // the heart: a gold scarab relic in a cage of cracked stone, burning amber; glowing seams spread from it
  Mm('core',G('cr',()=>new THREE.IcosahedronGeometry(.36,1)),core,0,0,0);Mm('core',G('crh',()=>new THREE.IcosahedronGeometry(.2,1)),coreHot,0,0,.1);
  Mm('core',G('scb',()=>svLump(.26,1,.15,181)),gold,0,0,.22,0,0,0,1,.75,.5);[-1,1].forEach(s=>{Mm('core',G('scw',()=>svBlade([[0,0],[.34,.1],[.38,-.12],[.06,-.2]],.03)),gold,s*.05,.02,.2,0,s>0?0:Math.PI,0)});
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;box('core',stoneD,Math.cos(a)*.42,Math.sin(a)*.42,.05,.16,.36,.2,0,0,a)}
  svSpr(R,'core',0xffa030,1.6,0,0,.1);
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2+rn()*.3,l=.35+rn()*.55,r0=.45+l*.5,y=.4+Math.sin(a)*r0*.9,x=Math.cos(a)*r0;box('chest',crack,x,y,Math.sqrt(Math.max(0,1-x*x/2.1))*1.12+.03,.06,l,.04,-.1,Math.atan2(x,1.1)*.8,a+Math.PI/2)}
  // the heart's socket: a ring of broken plates round the opening
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2;box('chest',stoneD,Math.cos(a)*.66,.4+Math.sin(a)*.62,1.08,.34,.22,.24,0,0,a+Math.PI/2)}
  // the back: a great slab of temple wall (with glyph rows) set between the shoulders
  box('chest',stone2,0,.75,-.95,1.6,1.4,.42,.15,0,0);for(let r=0;r<4;r++)for(let c=0;c<5;c++)box('chest',glyph,-.6+c*.3,.35+r*.3,-1.17,.16,.12,.03,.15,0,0);
  // ---------------- the head: a sandstone mask under a crown of broken obelisk tips ----------------
  Mm('neck',G('nk',()=>svLoft([[-.1,.62,.55],[.25,.5,.45]],12)),sand2);
  const hdR=[[-.32,.55,.5,0,0],[-.05,.62,.56,0,.04],[.25,.6,.55,0,.06],[.48,.46,.44,0,.02]];Mm('head',G('hd',()=>svLoft(hdR,14)),sand);
  box('head',stone,0,.02,.42,.95,.72,.3);box('head',stone2,0,.32,.5,1.08,.2,.36);   // the mask and its heavy brow
  [-1,1].forEach(s=>{box('head',stoneD,s*.24,.12,.58,.26,.13,.1);Mm('head',G('ey',()=>new THREE.IcosahedronGeometry(.07,1)),eye,s*.24,.12,.64,0,0,0,1.4,.6,.6);svSpr(R,'head',0xffc040,.32,s*.24,.12,.68);
    box('head',stone2,s*.48,-.05,.38,.16,.5,.3,0,s*.3,0)});
  box('head',stoneD,0,-.14,.6,.5,.08,.06);Mm('jaw',G('mo',()=>new THREE.BoxGeometry(.44,.06,.04)),crack,0,.04,.42);box('jaw',stone2,0,-.1,.36,.78,.24,.3);
  for(let i=0;i<7;i++){const a=(i-3)*.42,h=.35+(3-Math.abs(i-3))*.16+(i%2)*.1;Mm('crown',G('ob'+(i%3),()=>svHorn(.09,1,0,0,4,2)),i%3==1?stoneD:stone,Math.sin(a)*.45,0,Math.cos(a)*.3-.05,-Math.PI/2-.2*Math.cos(a),0,-Math.sin(a)*.45,1.1,1.1,h);
    if(i==3)Mm('crown',G('pyr',()=>new THREE.ConeGeometry(.1,.16,4)),gold,0,h*.98+.04,-.12)}
  B('head',3,sand3,0,.38,-.1,.52,.22,.45);
  [-1,1].forEach(s=>{box('head',stone2,s*.36,-.06,.5,.2,.26,.22,0,s*.4,0);for(let k=0;k<3;k++)box('head',glyph,s*(.18+k*.1),.4,.69,.05,.06,.02)});
  for(let k=0;k<7;k++){const x=(k-3)*.1;Mm('jaw',G('bd'+(k%3),()=>{const q=new THREE.ConeGeometry(.06,.5+(k%3)*.18,6,3);q.rotateX(Math.PI);q.translate(0,-.25,0);return q}),sand3,x,-.22,.4-Math.abs(x)*.4)}
  // ---------------- arms: columns of sand ringed with stones; the sandstone fist; the obelisk club ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',sh='sh'+L,el='el'+L,wr='wr'+L;
    B(sh,10,sand,s*.05,-.05,0,.6,.55,.6);
    const uaR=[[.05,.5,.5],[-.5,.52,.5],[-1.1,.44,.42]];Mm(sh,G('ua',()=>svLoft(uaR,12)),sand);
    for(let k=0;k<3;k++)for(let i=0;i<6;i++){const a=i/6*Math.PI*2+k*.4;Mm(sh,G('as'+(i%3),()=>svLump(.13,0,.4,200+i)),(i+k)%3?stone2:stone,Math.sin(a)*.5,-.3-k*.32,Math.cos(a)*.48,rn()*3,rn()*3,rn()*3)}
    gb151Cover(R,sh,uaR,{geo:qs165Plate(),n:9,rows:3,size:.3,seed:40+s,lift:.18,w:1.2,out:.02,skip:(t,u,r,k)=>Math.sin(t)*s<-.2||(k+r)%4==0,mat:(t,u,r,k)=>(k+r)%3?stone:stone2});
    for(let k=0;k<5;k++){const a=k/5*Math.PI*2;Mm(sh,G('dr'+(k%2),()=>{const q=new THREE.ConeGeometry(.08,.7+(k%2)*.4,6,3);q.rotateX(Math.PI);q.translate(0,-.35,0);return q}),sand3,Math.sin(a)*.45,-1.15,Math.cos(a)*.42)}
    B(el,11,sand2,0,0,0,.48,.45,.5);const faR=[[.05,.46,.46],[-.45,.56,.54],[-1.0,.5,.48]];Mm(el,G('fa',()=>svLoft(faR,12)),sand);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;box(el,i%2?stone:stoneD,Math.sin(a)*.55,-.62,Math.cos(a)*.52,.24,.42,.2,0,a,0)}
    gb151Cover(R,el,faR,{geo:qs165Plate(),n:10,rows:3,size:.32,seed:44+s,lift:.2,w:1.2,out:.03,skip:(t,u,r,k)=>(k*3+r)%5==0,mat:(t,u,r,k)=>(k+r)%3?stone2:stone});
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.3;Mm(el,G('dr'+(k%2),()=>{const q=new THREE.ConeGeometry(.08,.7+(k%2)*.4,6,3);q.rotateX(Math.PI);q.translate(0,-.35,0);return q}),sand3,Math.sin(a)*.5,-1.0,Math.cos(a)*.48)}
    // the great pauldrons: a lotus capital (left), a block with the eye of the sun (right)
    if(s>0){Mm(sh,G('lot',()=>new THREE.CylinderGeometry(.82,.5,.75,10)),stone,.12,.38,0,0,0,-.3);for(let i=0;i<10;i++){const a=i/10*Math.PI*2;box(sh,stone2,.12+Math.sin(a)*.66,.55,Math.cos(a)*.66,.18,.48,.1,0,a,-.3)}box(sh,stoneD,.12,.8,0,.9,.14,.9,0,0,-.3)}
    else{box(sh,stone,-.1,.4,0,1.25,.85,1.15,0,0,.25);box(sh,stoneD,-.1,.86,0,1.32,.12,1.2,0,0,.25);Mm(sh,G('eye1',()=>new THREE.TorusGeometry(.2,.04,4,12)),glyph,-.1,.42,.6,0,0,0);Mm(sh,G('eye2',()=>new THREE.CircleGeometry(.08,8)),gold,-.1,.42,.6)}});
  // the left fist: blocks of sandstone gripped into a fist
  B('wrL',12,sand,0,-.1,0,.55,.5,.55);for(let f=0;f<4;f++)box('wrL',f%2?stone:stone2,(f-1.5)*.22,-.48,.22,.22,.28,.32,.25,0,0);box('wrL',stone2,0,-.3,-.12,.68,.46,.42);box('wrL',stone,-.38,-.22,.18,.2,.3,.26,0,0,.5);
  // the right arm ends in a broken obelisk: glyph bands, a gold pyramidion, sand pouring off it
  B('wrR',13,sand2,0,-.05,0,.6,.55,.6);
  const obl=G('obl',()=>{const g=new THREE.CylinderGeometry(.24,.36,2.6,4,1);g.rotateY(Math.PI/4);g.translate(0,-1.3,0);return g});Mm('club',obl,stone,0,0,0);
  for(let k=0;k<6;k++){Mm('club',G('obb',()=>{const g=new THREE.CylinderGeometry(.27,.3,.06,4,1);g.rotateY(Math.PI/4);return g}),k%2?glyph:stoneD,0,-.3-k*.38,0,0,0,0,1-k*.035,1,1-k*.035);
    for(let q=0;q<4;q++){const a=q/4*Math.PI*2;box('club',glyph,Math.sin(a)*.27,-.48-k*.38,Math.cos(a)*.27,.09,.12,.02,0,a,0)}}
  Mm('club',G('pyc',()=>{const g=new THREE.ConeGeometry(.34,.5,4);g.rotateY(Math.PI/4);g.rotateX(Math.PI);return g}),gold,0,-2.82,0);Mm('club',G('ccr',()=>svLump(.3,0,.5,191)),stoneD,.08,.1,.05);
  // ---------------- the orbit: debris whirling round his waist ----------------
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=2.15+(i%3)*.22,y=-.1+Math.sin(a*3)*.35,k=i%7;let o;
    if(k==0)o=Mm('orbit',G('ob_sk',()=>svLump(.17,1,.1,222)),bone,Math.cos(a)*r,y,Math.sin(a)*r,0,a,0,1,1.1,1.2);
    else if(k==1)o=Mm('orbit',G('ob_pot',()=>new THREE.CylinderGeometry(.14,.2,.32,8,1,true)),clay,Math.cos(a)*r,y,Math.sin(a)*r,.6,a,.3);
    else if(k==2)o=Mm('orbit',G('ob_bn',()=>new THREE.CylinderGeometry(.04,.05,.55,5)),bone,Math.cos(a)*r,y,Math.sin(a)*r,1.2,a,.4);
    else if(k==3)o=Mm('orbit',G('ob_am',()=>new THREE.TorusGeometry(.12,.04,4,10)),gold,Math.cos(a)*r,y,Math.sin(a)*r,0,a,0);
    else o=Mm('orbit',G('ob_st'+(k%3),()=>svLump(.18+(k%3)*.06,0,.45,230+k)),k%2?stone:stone2,Math.cos(a)*r,y,Math.sin(a)*r,rn()*3,rn()*3,rn()*3)}
  if(!QS165M.tris){let n=0;R.root.traverse(o=>{if(o.isMesh){const g=o.geometry;n+=g.index?g.index.count/3:g.attributes.position.count/3}});QS165M.tris=Math.round(n)}
  R.headJ='head'}
// ---------------- poses (offsets from rest: [rx, ry, rz, px, py, pz]) ----------------
var QS165P={
  idle:{},
  // Sandstone Pummel: the obelisk raised over the right shoulder / the smash; the left hook; both arms up, the hammer-fist
  rUp:{hips:[0,-.35,0],spine:[-.12,-.25,0],chest:[-.18,-.35,0],shR:[-2.6,0,-.15],elR:[-.6,0,0],shL:[-.45,0,-.3],elL:[-.5,0,0],head:[.05,.3,0]},
  rHit:{hips:[.1,.4,0,0,-.2,.4],spine:[.25,.3,0],chest:[.32,.4,0],shR:[.35,0,.45],elR:[-.15,0,0],shL:[-.2,0,.25],head:[0,-.3,0],v2:[0,0,0,0,0,.2]},
  lUp:{hips:[0,.3,0],spine:[0,.3,0],chest:[-.05,.55,0],shL:[-1.4,0,-1.1],elL:[-1.3,0,0],shR:[-.5,0,.2],head:[0,-.4,0]},
  lHit:{hips:[.05,-.35,0,0,-.1,.25],spine:[.1,-.35,0],chest:[.1,-.65,0],shL:[-1.3,0,1.0],elL:[-.15,0,0],shR:[-.25,0,-.1],head:[0,.35,0]},
  xUp:{hips:[-.12,0,0,0,.35,-.2],spine:[-.3,0,0],chest:[-.38,0,0],head:[-.3,0,0],shR:[-2.95,0,.1],elR:[-.7,0,0],shL:[-2.95,0,-.1],elL:[-.7,0,0],jaw:[.3,0,0]},
  xHit:{hips:[.3,0,0,0,-.75,.55],spine:[.45,0,0],chest:[.42,0,0],head:[.2,0,0],shR:[-.5,0,.2],elR:[-.15,0,0],shL:[-.5,0,-.2],elL:[-.15,0,0],jaw:[.4,0,0]},
  rec:{hips:[0,0,0,0,-.05,0],shL:[-.15,0,-.05],shR:[-.15,0,.05]},
  // Dune Surge: he leans in and pours himself into the ground (S.melt), the wave runs, he rises at its end
  sLow:{hips:[.4,0,0,0,-.55,.3],spine:[.3,0,0],chest:[.25,0,0],head:[-.25,0,0],shL:[-1.2,0,.4],elL:[-.4,0,0],shR:[-1.2,0,-.4],elR:[-.4,0,0],jaw:[.4,0,0]},
  sRise:{hips:[-.2,0,0,0,.25,0],spine:[-.25,0,0],chest:[-.3,0,0],head:[-.35,0,0],shL:[-.4,0,1.1],elL:[-.6,0,0],shR:[-.4,0,-1.1],elR:[-.6,0,0],jaw:[.6,0,0]},
  // Vortex Lash: arms flung wide, the torso wound round; the full turn is the root's
  spW:{hips:[0,.75,0,0,-.15,0],spine:[0,.4,0],chest:[0,.5,0],head:[0,-.6,0],shR:[-1.5,0,1.5],elR:[-.1,0,0],shL:[-1.5,0,-1.5],elL:[-.1,0,0]},
  spGo:{hips:[0,-.5,0,0,-.2,0],spine:[0,-.4,0],chest:[0,-.45,0],head:[0,.4,0],shR:[-1.55,0,1.45],shL:[-1.55,0,-1.45],jaw:[.3,0,0]},
  // Grasping Sands: both fists driven into the ground
  stUp:{hips:[-.15,0,0,0,.4,-.1],spine:[-.3,0,0],chest:[-.35,0,0],head:[-.35,0,0],jaw:[.5,0,0],shL:[-2.85,0,-.35],elL:[-.9,0,0],shR:[-2.85,0,.35],elR:[-.9,0,0]},
  stHit:{hips:[.5,0,0,0,-1.1,.35],spine:[.5,0,0],chest:[.42,0,0],head:[.25,0,0],shL:[-.65,0,-.1],elL:[-.2,0,0],shR:[-.65,0,.1],elR:[-.2,0,0]},
  // Sandblast: the chest thrown open, both arms thrust forward
  blUp:{hips:[-.1,0,0,0,.1,-.25],spine:[-.25,0,0],chest:[-.4,0,0],head:[-.3,0,0],shL:[-.4,0,1.3],elL:[-.8,0,0],shR:[-.4,0,-1.3],elR:[-.8,0,0],jaw:[.5,0,0]},
  blGo:{hips:[.15,0,0,0,-.05,.3],spine:[.15,0,0],chest:[.2,0,0],head:[.1,0,0],shL:[-1.55,0,.25],elL:[-.1,0,0],shR:[-1.55,0,-.25],elR:[-.1,0,0],jaw:[.7,0,0]},
  // Collapse: he slumps into his vortex (S.melt does the rest) and bursts back up
  clDown:{hips:[.3,0,.1,0,-1.4,0],spine:[.4,0,.1],chest:[.3,0,0],head:[.4,0,0],shL:[.5,0,.6],shR:[.5,0,-.6],elL:[-.5,0,0],elR:[-.5,0,0]},
  // Phase II and the signature
  roar:{hips:[-.15,0,0,0,.3,0],spine:[-.35,0,0],chest:[-.45,0,0],neck:[-.3,0,0],head:[-.55,0,0],jaw:[.9,0,0],shL:[-.9,0,1.4],elL:[-.5,0,0],shR:[-.9,0,-1.4],elR:[-.5,0,0]},
  leap:{hips:[-.2,0,0,0,2.2,0],spine:[-.2,0,0],chest:[-.25,0,0],shR:[-3.0,0,.25],elR:[-.5,0,0],shL:[-3.0,0,-.25],elL:[-.5,0,0]},
  sink:{hips:[.35,0,0,0,-2.6,0],spine:[.4,0,0],chest:[.3,0,0],head:[.4,0,0],shL:[-2.8,0,-.2],elL:[-.3,0,0],shR:[-2.8,0,.2],elR:[-.3,0,0],jaw:[.7,0,0]},
  stag:{hips:[.25,.2,.18,0,-.7,0],spine:[.35,0,.12],chest:[.3,0,.1],neck:[.3,0,0],head:[.55,.3,.3],shL:[.4,0,.55],elL:[-.3,0,0],shR:[.6,0,-.35],elR:[-.2,0,0],jaw:[.5,0,0]},
  dead:{hips:[.5,0,.3,0,-2.2,.2],spine:[.4,0,.2],chest:[.35,0,.15],neck:[.3,0,0],head:[.6,.5,0],shL:[.3,0,1.2],shR:[.4,0,-1.0],elL:[-.4,0,0],elR:[-.4,0,0],jaw:[.7,0,0]}};
// ---------------- the procedural layer: the vortex turns, the debris orbits, he sways and glides, the head tracks you ----------------
function qs165Loco(e,S,O,dt,now){const t=now/1000,sp=S.spd||0,a=Math.min(1,sp/3);S.vr=(S.vr||0)+dt*(2.6+sp*.8+(S.ph>1?1.2:0)+(S.chg||0)*3);const br=Math.sin(t*1.1);
  O.v0[1]+=S.vr*1.0;O.v1[1]-=S.vr*1.35;O.v2[1]+=S.vr*1.7;O.orbit[1]+=S.vr*.42;O.orbit[0]+=Math.sin(t*.7)*.06;
  O.hips[4]+=.08*br;O.hips[0]+=.16*a;O.chest[0]+=.04*br;O.neck[0]+=-.03*br;O.jaw[0]+=.05+.04*br;
  ['L','R'].forEach((s,j)=>{const w=Math.sin(t*1.3+j*Math.PI)*.08;O['sh'+s][0]+=w-.06*a;O['el'+s][0]+=-.05*br-.12*a;O['sh'+s][2]+=(j?-1:1)*.04*br});
  O.hips[2]+=Math.sin(t*.9)*.03;O.chest[1]+=Math.sin(t*.6)*.05;
  const m=e.m,hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,yaw=svAng(Math.atan2(hx,hz)-m.rotation.y),k=S.mv?0:(Math.abs(yaw)<1.6?1:0);
  S.hy=(S.hy||0)+((Math.max(-.7,Math.min(.7,yaw))*k)-(S.hy||0))*Math.min(1,dt*3);O.head[1]+=S.hy*.6;O.neck[1]+=S.hy*.3}
// after the pose: the heart burns (brighter in Phase II and while charging), sand pours off him, the melt
function qs165Post(e,S,dt,now){const R=S.R,t=now/1000,ph2=S.ph>1,ch=S.chg||0;
  const k=(ph2?1.25:.85)+.25*Math.sin(t*1.6)+ch*1.4;R.coreM.color.setRGB(Math.min(1,1*k),Math.min(1,.62*k),Math.min(1,.2*k));R.crackM.opacity=Math.min(1,.55+.25*Math.sin(t*2.3)+ch*.5)*(1-(S.melt||0));
  R.eyeM.color.setHex(ch>.3?0xffffff:ph2?0xffe080:0xffd060);
  // the melt: the body above the vortex squashes into the ground (the vortex flattens into a mound)
  const mt=Math.max(0,Math.min(1,S.melt||0));const J=R.J;J.hips.scale.set(1+mt*.35,Math.max(.04,1-mt),1+mt*.35);J.hips.position.y-=mt*2.3;J.vtx.scale.set(1+mt*.5,Math.max(.25,1-mt*.75),1+mt*.5);J.orbit.visible=mt<.6;
  if(!S.dieM&&mt<.9&&Math.random()<dt*(ph2?14:8)){const j=Math.random()<.5?'shL':'shR',p=svWP(e,j,(Math.random()-.5)*.6,-.2-Math.random()*1.4,(Math.random()-.5)*.4);burst(p,0xd8b47a,1,.15,-1.6,.8)}
  if(!S.dieM&&Math.random()<dt*10){const a=Math.random()*6.283,r=1.6+Math.random()*.8;burst(new THREE.Vector3(e.m.position.x+Math.cos(a)*r,GH(e.m.position.x,e.m.position.z)+.1,e.m.position.z+Math.sin(a)*r),0xe0c088,1,.4,.4,.6)}}
// preview sheets (v143_look PROPS=qarsul / qsP:<pose>)
QS165M.sheet.qarsul=()=>{const R=svRig();qs165Build(R,null);svRest(R);svMerge(R);return R.root};
QS165M.pose=(root,R,name)=>{const P=svPose({P:QS165P},name);for(const k in P){const g=R.J[k],o=P[k];if(!g)continue;const r0=g.userData.r0,p0=g.userData.p0;g.rotation.set(r0.x+o[0],r0.y+o[1],r0.z+o[2]);g.position.set(p0.x+(o[3]||0),p0.y+(o[4]||0),p0.z+(o[5]||0))}};
Object.assign(KQSH151,QS165M.sheet);
