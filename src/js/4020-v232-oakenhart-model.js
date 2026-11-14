// ================= v232 Oakenhart, the Rootbound Stag — the model, poses and procedural animation =================
// The first Warden of the Balance (the side-with-him ending; fight and grove in 4022, moves in 4021). A stag the size of a house,
// grown out of an old oak in autumn: a trunk of dark furrowed bark shingled with bark plates, amber sap glowing in the seams of his
// chest and flanks, a pale deer-skull mask for a face with burning amber eyes, a mane of hanging moss and vines, shelf fungus and
// moss on his back, and antlers that are whole branching boughs carrying russet leaves and three sap lanterns each.
// Built like a Sovereign (v110 svRig kit; rigid parts on named joints, merged by svMerge). The body lies along +z (he faces +z).
// Joints (L = +x): root · hips · spine · chest · neck · head · jaw · antL/R · earL/R · shL/R (foreleg) · elL/R · wrL/R · thL/R (hind leg) ·
// knL/R · hkL/R · ftL/R · tail0 · tail1. Poses (OK232P) are offsets from rest, mirrored with '~' (svPose).
var OK232={col:0xffb43a,sap:0xa8500a,leaf:[0xb8521a,0xd88a1e,0x8a3414,0xe0b030],tris:0,sheet:{}};
function ok232Build(R,e){
  const bark=svMat(R,0x2c2016,{roughness:.92}),bark2=svMat(R,0x3d2c1c,{roughness:.9}),bark3=svMat(R,0x1c140e,{roughness:.95}),pale=svMat(R,0x5a452c,{roughness:.85}),
    moss=svMat(R,0x4a5a22,{roughness:.95}),moss2=svMat(R,0x6a7a2c,{roughness:.95}),bone=svMat(R,0xd6cba6,{roughness:.6}),bone2=svMat(R,0xa89a78,{roughness:.7}),
    hoof=svMat(R,0x14120f,{roughness:.4,metalness:.3}),fung=svMat(R,0xc8a064,{roughness:.7}),
    sap=svMat(R,0x1c0e04,{roughness:.5,emissive:OK232.sap,emissiveIntensity:.3}),eye=svGlowMat(R,0xffd27a),lant=svGlowMat(R,0xffc85a,.92),
    leaf=OK232.leaf.map(c=>svMat(R,c,{roughness:.8,side:THREE.DoubleSide}));
  sap.userData.e0=OK232.sap;R.sap=sap;R.eyeM=eye;R.lantM=lant;const BK=[bark,bark2,bark3,pale];
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),G=(k,f)=>svG('ok'+k,f),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz);
  const horn=(k,r,l,bx,by,n,seg)=>G('h'+k,()=>svHorn(r,l,bx,by,n||5,seg||4)),ball=(k,r,det,j)=>G('b'+k,()=>svLump(r,det==null?1:det,j||.2,60+k));
  // a bark plate: long, split at the tip, ridged; a leaf: a flat pointed blade
  const plate=wk232Plate('okbk',[[0,.56],[.3,.34],[.4,-.05],[.28,-.42],[.1,-.62],[0,-.5],[-.12,-.66],[-.3,-.4],[-.4,-.02],[-.28,.36]],.2,.1);
  const leafG=G('lf',()=>{const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(.5,.35,0,1);s.quadraticCurveTo(-.5,.35,0,0);const g=new THREE.ShapeGeometry(s,3);g.rotateX(-.3);return g});
  // ---------------- the skeleton ----------------
  J('root',null,0,0,0);J('hips','root',0,2.28,-1.0);J('spine','hips',0,.06,.8);J('chest','spine',0,.08,.85);J('neck','chest',0,.42,.5);J('head','neck',0,1.02,.72,.42);J('jaw','head',0,-.13,.06);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';
    J('ant'+L,'head',s*.2,.3,-.16);J('ear'+L,'head',s*.26,.2,-.2);
    J('sh'+L,'chest',s*.56,-.3,.12);J('el'+L,'sh'+L,0,-1.02,-.06);J('wr'+L,'el'+L,0,-.9,.06);
    J('th'+L,'hips',s*.52,-.14,-.12);J('kn'+L,'th'+L,0,-.94,.36);J('hk'+L,'kn'+L,0,-.78,-.46);J('ft'+L,'hk'+L,0,-.42,.1)});
  J('tail0','hips',0,.22,-.62);J('tail1','tail0',0,-.1,-.34);
  // ---------------- the trunk: hips, barrel, chest (lofts along z), bark plates shingled over them, sap in the seams ----------------
  const cov=(j,rings,o)=>{const m=wk232Cover(R,j,rings,plate,Object.assign({lift:.22,th:1.0,mat:(t,u,r,k)=>BK[(r*3+k*5+((u*7)|0))%4==0?3:(k+r)%3]},o));return m};
  // (a z-loft is a y-loft turned on its side: the cover is laid on a helper joint turned the same way)
  const zc=(j,name,rings,o,x,y,z)=>{const h=svJ(R,name,j,x||0,y||0,z||0,Math.PI/2,0,0);cov(h,rings,o);return h};
  const hipR=[[-.62,.34,.4],[-.38,.56,.62],[0,.66,.72],[.4,.62,.68]];Mm('hips',G('hp',()=>svLoftZ(hipR,12)),sap);zc('hips','hipsC',hipR,{n:13,rows:5,size:.42,seed:11});
  const spR=[[-.4,.6,.66],[0,.56,.6],[.44,.62,.68]];Mm('spine',G('sp',()=>svLoftZ(spR,12)),sap);zc('spine','spineC',spR,{n:13,rows:4,size:.42,seed:12});
  const chR=[[-.42,.62,.7],[-.05,.72,.86],[.34,.66,.84],[.62,.46,.62],[.8,.26,.36]];Mm('chest',G('ch',()=>svLoftZ(chR,14)),sap);
  zc('chest','chestC',chR,{n:15,rows:6,size:.44,seed:13,skip:(t,u)=>u>.55&&Math.abs(svAng(t-Math.PI))<.5});   // the breast is left open: the heartwood shows
  Mm('hips',ball(14,.5,1,.25),bark,0,.02,-.52,0,0,0,1.05,1.2,.6);Mm('hips',plate,bark2,0,.1,-.86,-1.4,Math.PI,0,.7,.8,.5);
  // heartwood: a burning knot in the breast, ribs of root closing over it
  Mm('chest',ball(1,.34,1,.25),sap,0,-.22,.66,0,0,0,1.1,1.25,.7);svSpr(R,'chest',OK232.col,.95,0,-.22,.98);
  [-1,1].forEach(s=>{for(let k=0;k<3;k++)Mm('chest',G('rb'+k,()=>svTube([[0,.36,0],[.2,.2,.16],[.26,-.06,.2],[.16,-.34,.12],[.02,-.5,0]],[.05,.06,.055,.045,.02],5)),k%2?bark2:bark3,s*(.1+k*.12),-.2,.74-k*.1,0,s*(.1+k*.3),0,s,1,1)});
  // the withers: a hump of moss, shelf fungus up the flanks, hanging vines
  Mm('chest',ball(2,.5,1,.3),moss,0,.62,.0,0,0,0,1.15,.5,1.4);Mm('spine',ball(3,.4,1,.3),moss2,.1,.56,.05,0,0,0,1.2,.42,1.5);Mm('hips',ball(4,.36,1,.3),moss,-.08,.6,-.1,0,0,0,1.1,.4,1.3);
  [[1,'chest',.62,.2,.1],[-1,'chest',.6,.34,-.2],[1,'spine',.56,.22,.1],[-1,'spine',.55,.3,-.1],[1,'hips',.58,.26,-.05],[-1,'hips',.56,.16,.2]].forEach(([s,j,x,y,z],i)=>{
    for(let k=0;k<2+(i%2);k++)Mm(j,G('fg',()=>{const g=new THREE.CylinderGeometry(1,.75,.22,7,1).toNonIndexed();g.scale(1,1,.62);return g}),k%2?fung:bone2,s*(x+k*.02),y+k*.17,z+k*.06,0,s*.2,s*-.25,.26-k*.05,.3,.26-k*.05)});
  for(let k=0;k<9;k++){const s=k%2?1:-1,j=k<4?'chest':k<7?'spine':'hips',z=(k%3)*.3-.3,l=.5+((k*7)%5)*.14;
    Mm(j,G('vn'+(k%3),()=>svTube([[0,0,0],[.03,-.3,.02],[-.02,-.62,-.02],[.02,-1,0]],[.022,.02,.016,.006],4)),k%3?moss:moss2,s*.6,-.02,z,0,0,s*.12,1,l,1);
    if(k%2)Mm(j,leafG,leaf[k%4],s*.62,-l*.6,z,0,s*1.2,Math.PI,.16,.2,.16)}
  // ---------------- neck: a thick bole, the mane of moss ----------------
  const nkP=[[0,-.1,-.1],[0,.3,.22],[0,.68,.52],[0,1.02,.72]];Mm('neck',G('nk',()=>svTube(nkP,[[.44,.5],[.36,.42],[.29,.33],[.24,.27]],10)),bark);
  for(let k=0;k<4;k++){const u=k/3,y=.06+u*.86,z=.02+u*.62,r=.42-u*.16;[-1,1].forEach(s=>{Mm('neck',plate,BK[(k+(s>0?1:0))%3],s*r*.82,y,z-.08,.5,s*1.25,0,.34,.4,.34);
      for(let q=0;q<2;q++)Mm('neck',G('mn'+q,()=>svTube([[0,0,0],[.02,-.26,-.03],[-.02,-.52,.02],[0,-.8,0]],[.05,.045,.03,.008],4)),q?moss2:moss,s*r*(.5+q*.3),y-.04,z-.22-q*.06,0,0,s*(.1+q*.12),1,.8+((k+q)%3)*.25,1)});
    Mm('neck',ball(5,.2,1,.3),k%2?moss:moss2,0,y+.1,z-.3,0,0,0,1.2,.6,1)}
  // ---------------- head: the skull mask over a bark head ----------------
  const hdR=[[-.3,.22,.2,0,.02],[-.1,.27,.26,0,.03],[.14,.25,.23,0,.0],[.42,.18,.16,0,-.04],[.72,.13,.11,0,-.08],[.9,.1,.075,0,-.1]];Mm('head',G('hd',()=>svLoftZ(hdR,10)),bark);
  // the mask: brow, the long nasal bone, cheek arches, eye sockets (dark), teeth along the upper jaw
  Mm('head',G('mk',()=>svLoftZ([[-.16,.24,.14,0,.14],[.06,.25,.13,0,.13],[.34,.19,.1,0,.09],[.64,.14,.075,0,.03],[.9,.105,.05,0,-.04],[.98,.06,.03,0,-.07]],9)),bone);
  Mm('head',G('nb',()=>svLoftZ([[.3,.06,.035],[.66,.05,.03],[.96,.03,.02]],5)),bone2,0,.105,0,.16);
  [-1,1].forEach(s=>{Mm('head',ball(6,.1,1,.1),bark3,s*.19,.13,.12,0,0,0,1,.8,1.2);Mm('head',G('ey',()=>new THREE.IcosahedronGeometry(.05,1)),eye,s*.2,.13,.13);svSpr(R,'head',OK232.col,.5,s*.23,.13,.15);
    Mm('head',G('ck',()=>svTube([[0,0,0],[.07,-.04,.14],[.05,-.1,.3],[-.02,-.1,.44]],[.035,.04,.035,.02],5)),bone2,s*.2,.03,.14,0,0,0,s,1,1);
    for(let k=0;k<5;k++)Mm('head',horn('tt',.016,1,0,0,4,2),bone,s*(.105-k*.012),-.06,.5+k*.09,Math.PI/2,0,0,1,1,.07-(k%2)*.02);
    Mm('ear'+(s>0?'L':'R'),G('er',()=>{const g=svHorn(.09,.42,0,.05,4,3);g.scale(1,.42,1);return g}),bark2,0,0,0,-.3,s*1.9,0);Mm('ear'+(s>0?'L':'R'),leafG,leaf[1],s*.2,.02,-.1,-1.4,s*1.4,0,.18,.26,.18)});
  Mm('head',horn('no',.05,.1,0,0,5,2),bark3,0,.02,.9,0,0,0,1.4,1,1);
  // the lower jaw: bone, a row of teeth, a short beard of moss
  Mm('jaw',G('jw',()=>svLoftZ([[-.02,.15,.05],[.3,.12,.045],[.62,.085,.035],[.8,.05,.025]],8)),bone2);
  [-1,1].forEach(s=>{for(let k=0;k<4;k++)Mm('jaw',horn('tt',.016,1,0,0,4,2),bone,s*(.09-k*.012),.03,.42+k*.09,-Math.PI/2,0,0,1,1,.06)});
  for(let k=0;k<3;k++)Mm('jaw',G('bd'+k,()=>svTube([[0,0,0],[.02,-.2,.02],[0,-.42,0]],[.035,.03,.006],4)),k%2?moss2:moss,(k-1)*.07,-.04,.24+k*.08,0,0,0,1,.8+k*.3,1);
  // ---------------- antlers: two boughs, five tines each, leaves and sap lanterns ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',A='ant'+L,beam=[[0,0,0],[.22,.34,-.1],[.56,.72,-.22],[.86,1.2,-.2],[1.02,1.72,-.06],[1.0,2.2,.14]];
    Mm(A,G('bm',()=>svTube(beam,[.11,.1,.085,.07,.052,.022],7)),bark2,0,0,0,0,0,0,s,1,1);
    [[1,[.5,.34,.42],.62,.07],[2,[.74,.5,.4],.74,.062],[3,[.5,.62,-.5],.7,.055],[4,[.3,.5,.46],.56,.045],[2,[-.36,.5,.2],.5,.05],[3,[.5,.3,.5],.5,.04]].forEach(([i,d,l,r],k)=>{const b=beam[i],dl=Math.hypot(d[0],d[1],d[2]),u=d.map(v=>v/dl),
        p1=[b[0]+u[0]*l*.5,b[1]+u[1]*l*.5+.06*l,b[2]+u[2]*l*.5],p2=[b[0]+u[0]*l,b[1]+u[1]*l+.22*l,b[2]+u[2]*l];
      Mm(A,G('tn'+k,()=>svTube([b,p1,p2],[r,r*.72,r*.2],6)),k%2?bark:bark2,0,0,0,0,0,0,s,1,1);
      // leaves round each tip, some hanging; a lantern under three of them
      for(let q=0;q<4;q++){const a=q*1.57+k;Mm(A,leafG,leaf[(k+q)%4],s*(p2[0]+Math.cos(a)*.1),p2[1]-.02+((q%2)*.08),p2[2]+Math.sin(a)*.1,-.6+q*.5,a,q%2?2.6:.3,.24,.3,.24)}
      if(k<3){const lp=[s*p1[0],p1[1]-.34,p1[2]];Mm(A,G('ls',()=>new THREE.CylinderGeometry(.008,.008,.3,3)),bark3,lp[0],lp[1]+.17,lp[2]);
        Mm(A,G('ln',()=>{const g=new THREE.IcosahedronGeometry(.085,0);g.scale(1,1.35,1);return g}),lant,lp[0],lp[1],lp[2]);svSpr(R,A,OK232.col,.7,lp[0],lp[1],lp[2])}});
    Mm(A,ball(7,.13,1,.2),moss,s*.2,.3,-.08,0,0,0,1.3,.6,1)});
  // ---------------- forelegs: a bark shoulder, the long cannon, roots trailing off the knee, a split hoof ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',sh='sh'+L,el='el'+L,wr='wr'+L;
    Mm(sh,ball(8,.36,1,.2),bark,0,.1,0,0,0,0,1,1.3,1.1);const ua=[[.2,.3,.34],[-.3,.25,.3],[-.72,.19,.22],[-1.04,.17,.19]];Mm(sh,G('ua',()=>svLoft(ua,9)),bark2);cov(sh,ua,{n:9,rows:4,size:.3,seed:20+s});
    Mm(el,ball(9,.2,1,.15),bark3,0,0,.02);const fa=[[.04,.17,.19],[-.4,.13,.14],[-.9,.11,.12]];Mm(el,G('fa',()=>svLoft(fa,8)),bark);cov(el,fa,{n:7,rows:3,size:.22,seed:22+s});
    for(let k=0;k<2;k++)Mm(el,G('rt'+k,()=>svTube([[0,0,0],[.06,-.16,-.1],[.02,-.34,-.2],[.06,-.5,-.24]],[.035,.03,.02,.006],4)),bark3,s*(.1-k*.2),-.02,-.14,0,k*1.2,0);
    Mm(wr,G('ps',()=>svLoft([[.02,.11,.12],[-.24,.13,.15]],8)),bark3);Mm(wr,G('hf',()=>svLoft([[-.22,.15,.17,0,.02],[-.4,.19,.22,0,.05]],8)),hoof);
    Mm(wr,ball(10,.09,1,.3),moss,s*.1,-.16,-.1)});
  // ---------------- hind legs: a heavy haunch, the stifle, the hock, the cannon, the hoof ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',th='th'+L,kn='kn'+L,hk='hk'+L,ft='ft'+L;
    Mm(th,ball(11,.46,1,.2),bark,0,.02,-.04,0,0,0,.95,1.35,1.2);Mm(th,G('tg',()=>svTube([[0,.1,0],[0,-.5,.2],[0,-.94,.36]],[[.32,.4],[.25,.3],[.17,.19]],9)),bark2);
    cov(th,[[.2,.34,.42,0,0],[-.4,.27,.32,0,.16],[-.9,.18,.2,0,.34]],{n:9,rows:4,size:.3,seed:30+s});
    Mm(kn,ball(12,.19,1,.15),bark3);Mm(kn,G('sk',()=>svTube([[0,0,0],[0,-.42,-.26],[0,-.78,-.46]],[[.16,.19],[.12,.14],[.11,.12]],8)),bark);
    Mm(hk,ball(13,.14,1,.15),bark3,0,0,-.02);Mm(hk,horn('sp',.05,.3,0,.06,5,3),bark3,0,.02,-.1,Math.PI*.9,0,0);Mm(hk,G('cn',()=>svTube([[0,0,0],[0,-.42,.1]],[.11,.12],8)),bark2);
    Mm(ft,G('hf',()=>svLoft([[-.22,.15,.17,0,.02],[-.4,.19,.22,0,.05]],8)),hoof,0,.22,0);Mm(ft,ball(10,.09,1,.3),moss2,s*-.1,.04,-.12)});
  // ---------------- tail: a short brush of moss and leaves ----------------
  Mm('tail0',G('tl',()=>svTube([[0,0,0],[0,-.1,-.34]],[.12,.08],6)),bark2);for(let k=0;k<4;k++)Mm('tail1',G('tb'+k,()=>svTube([[0,0,0],[.02,-.2,-.08],[0,-.46,-.12]],[.05,.04,.008],4)),k%2?moss:moss2,(k-1.5)*.06,0,0,0,0,(k-1.5)*.15);
  Mm('tail1',leafG,leaf[0],0,-.2,-.1,-2,0,0,.2,.26,.2);
  if(!OK232.tris)OK232.tris=wk232Tris(R);R.headJ='head'}
// ---------------- poses (offsets from rest: [rx, ry, rz, px, py, pz]; rx + = nose / limb forward-down) ----------------
var OK232P={
  idle:{},
  cRec:{hips:[0,0,0,0,-.04,0],neck:[.06,0,0]},
  // Antler Sweep: the head swung low to one side, the sweep across, the return; then the gore (head down, a thrust)
  swUp:{hips:[0,-.2,0],spine:[0,-.2,0],chest:[.05,-.3,0],neck:[.5,-.7,0],head:[.3,-.3,.3],shL:[-.2,0,0],shR:[.25,0,0],elR:[-.3,0,0]},
  swCut:{hips:[0,.2,0,0,-.06,.2],spine:[0,.22,0],chest:[.08,.35,0],neck:[.55,.8,0],head:[.3,.4,-.3],shL:[.3,0,0],elL:[-.3,0,0],shR:[-.25,0,0],thL:[.15,0,0],thR:[-.15,0,0]},
  goreUp:{hips:[-.1,0,0,0,.05,-.25],spine:[-.1,0,0],chest:[-.1,0,0],neck:[.95,0,0],head:[.7,0,0],shL:[-.3,0,0],shR:[-.3,0,0],thL:[.2,0,0],thR:[.2,0,0],knL:[.2,0,0],knR:[.2,0,0]},
  gore:{hips:[.12,0,0,0,-.1,.55],spine:[.1,0,0],chest:[.12,0,0],neck:[.2,0,0],head:[-.35,0,0],jaw:[.3,0,0],shL:[.5,0,0],elL:[-.2,0,0],shR:[.35,0,0],thL:[-.5,0,0],knL:[.2,0,0],thR:[-.35,0,0]},
  // Trampling Charge: head lowered, a forehoof pawing; the gallop stretched out
  paw:{hips:[.05,0,0,0,-.06,-.1],chest:[.1,0,0],neck:[.8,0,0],head:[.45,0,0],shR:[.7,0,0],elR:[-1.0,0,0],wrR:[.5,0,0],thL:[.1,0,0],thR:[.1,0,0]},
  paw2:{hips:[.05,0,0,0,-.06,-.1],chest:[.1,0,0],neck:[.8,0,0],head:[.45,0,0],shR:[.25,0,0],elR:[-.25,0,0],wrR:[.2,0,0],thL:[.1,0,0],thR:[.1,0,0]},
  gallop:{hips:[.1,0,0,0,.1,.3],spine:[-.08,0,0],chest:[-.05,0,0],neck:[.65,0,0],head:[.35,0,0],shL:[.9,0,0],elL:[-.3,0,0],shR:[.7,0,0],elR:[-.5,0,0],thL:[-.9,0,0],knL:[.3,0,0],hkL:[.3,0,0],thR:[-.7,0,0],knR:[.4,0,0],hkR:[.2,0,0],tail0:[-.5,0,0]},
  skid:{hips:[-.15,0,0,0,-.15,0],spine:[.1,0,0],chest:[.15,0,0],neck:[-.1,0,0],head:[.1,0,0],shL:[.6,0,0],shR:[.6,0,0],thL:[.5,0,0],knL:[-.3,0,0],thR:[.5,0,0],knR:[-.3,0,0]},
  // Hind Kick: weight on the forelegs, head round to look back; both hind hooves out behind
  kickUp:{hips:[.3,0,0,0,.1,.15],spine:[.12,0,0],chest:[.12,0,0],neck:[.2,.5,0],head:[0,.5,0],shL:[.25,0,0],shR:[.25,0,0],thL:[.7,0,0],knL:[.9,0,0],hkL:[-.9,0,0],thR:[.7,0,0],knR:[.9,0,0],hkR:[-.9,0,0]},
  kick:{hips:[.55,0,0,0,.5,.2],spine:[.15,0,0],chest:[.2,0,0],neck:[-.1,0,0],head:[.2,0,0],shL:[.4,0,0],shR:[.4,0,0],thL:[-1.5,0,0],knL:[.5,0,0],hkL:[.5,0,0],thR:[-1.5,0,0],knR:[.5,0,0],hkR:[.5,0,0],tail0:[.6,0,0]},
  // Rootburst / the bellow: he rears on his hind legs, forehooves high; the slam
  rear:{hips:[-.75,0,0,0,-.12,-.35],spine:[-.2,0,0],chest:[-.2,0,0],neck:[.5,0,0],head:[.3,0,0],shL:[1.1,0,0],elL:[-1.3,0,0],wrL:[.4,0,0],shR:[.8,0,0],elR:[-1.5,0,0],wrR:[.5,0,0],thL:[-.7,0,0],knL:[-.12,0,0],hkL:[.1,0,0],thR:[-.74,0,0],knR:[-.12,0,0],hkR:[.1,0,0],tail0:[-.4,0,0]},
  slam:{hips:[.16,0,0,0,-.18,.25],spine:[.1,0,0],chest:[.14,0,0],neck:[.7,0,0],head:[.3,0,0],shL:[.35,0,0],elL:[-.1,0,0],shR:[.35,0,0],elR:[-.1,0,0],thL:[-.25,0,0],knL:[.3,0,0],thR:[-.25,0,0],knR:[.3,0,0]},
  // Thorn Lances: the head thrown back, then snapped forward and down
  toss:{hips:[-.06,0,0],chest:[-.12,0,0],neck:[-.75,0,0],head:[-.6,0,0],jaw:[.25,0,0],earL:[0,0,.4],earR:[0,0,-.4]},
  snap:{hips:[.06,0,0,0,-.05,.1],chest:[.12,0,0],neck:[.7,0,0],head:[.25,0,0],jaw:[.1,0,0]},
  // the bellow (intro, Phase II): neck stretched up and forward, jaw wide
  bell:{hips:[-.12,0,0,0,.04,0],chest:[-.16,0,0],neck:[-.35,0,0],head:[-.75,0,0],jaw:[.75,0,0],shL:[-.12,0,.06],shR:[-.12,0,-.06],earL:[0,0,.5],earR:[0,0,-.5],tail0:[-.6,0,0]},
  // antlers stuck in a runestone; staggered; dead (on his side)
  stuck:{hips:[.1,0,0,0,-.1,.2],chest:[.2,0,0],neck:[1.0,0,.15],head:[.75,.2,0],shL:[.5,0,0],elL:[-.35,0,0],shR:[.2,0,0],thL:[-.4,0,0],knL:[.4,0,0],thR:[-.2,0,0]},
  stag:{hips:[.1,.1,.12,0,-.5,0],spine:[.1,0,.08],chest:[.18,0,.1],neck:[.85,.3,.2],head:[.5,.2,.3],jaw:[.4,0,0],shL:[.9,0,0],elL:[-1.5,0,0],shR:[.3,0,-.2],elR:[-.5,0,0],thL:[.5,0,0],knL:[.9,0,0],hkL:[-1.0,0,0],thR:[.3,0,0],knR:[.6,0,0],hkR:[-.7,0,0]},
  dead:{root:[0,0,0,0,-1.45,0],hips:[0,0,1.35,.6,0,0],spine:[0,.1,.05],chest:[0,.15,.05],neck:[.5,.5,0],head:[.3,.3,0],jaw:[.5,0,0],shL:[.5,0,0],elL:[-.6,0,0],shR:[-.2,0,0],elR:[-.3,0,0],thL:[.4,0,0],knL:[.7,0,0],thR:[-.2,0,0],knR:[.5,0,0]}};
// the table above is written with + = a leg swung or folded FORWARD; the rig's own sign is the other way (a leg hangs down -y, so +rx
// carries it back), so every leg joint's rx is flipped once here
for(const k in OK232P){const P=OK232P[k];for(const j in P)if(/^(sh|el|wr|th|kn|hk|ft)[LR]$/.test(j))P[j][0]=-P[j][0]}
// ---------------- procedural layer: breathing, a four-beat walk, ears, tail, the head following the hero ----------------
function ok232Loco(e,S,O,dt,now){const t=now/1000,sp=S.spd||0,a=Math.min(1,sp/2.6),fast=Math.min(1,Math.max(0,(sp-4)/3));S.gp=(S.gp||0)+dt*(1.5+sp*1.35);const g=S.gp,br=Math.sin(t*1.1);
  O.hips[4]+=.03*br+.06*Math.abs(Math.sin(g*2))*a;O.chest[0]+=.02*br;O.spine[0]+=-.015*br;O.neck[0]+=.03*br+.08*Math.sin(g*2)*a;O.head[0]+=-.05*Math.sin(g*2)*a;
  // walk: lateral sequence (LH, LF, RH, RF); legs swing from the shoulder / hip, the knee folds on the lift
  [['thL',0,1],['shL',.5,0],['thR',1,1],['shR',1.5,0]].forEach(([j,ph,hind])=>{const p=g+ph*Math.PI,sw=Math.sin(p),lf=Math.max(0,Math.cos(p)),s=j[2];
    if(hind){O[j][0]+=sw*.42*a;O['kn'+s][0]+=lf*.5*a;O['hk'+s][0]+=-lf*.55*a;O['ft'+s][0]+=lf*.3*a}
    else{O[j][0]+=-sw*.4*a;O['el'+s][0]+=lf*.75*a;O['wr'+s][0]+=lf*.35*a}});
  O.hips[1]+=Math.sin(g)*.04*a;O.spine[1]+=-Math.sin(g)*.03*a;O.hips[2]+=Math.sin(g)*.03*a;O.hips[0]+=.05*fast;
  // ears flick, the tail swings, leaves tremble with his breath
  const fl=Math.max(0,Math.sin(t*2.3)*Math.sin(t*.7))*.5;O.earL[2]+=fl;O.earR[2]-=Math.max(0,Math.sin(t*1.9+2)*Math.sin(t*.9))*.5;O.tail0[1]+=Math.sin(t*1.7)*.3;O.tail1[1]+=Math.sin(t*1.7-.6)*.3;
  O.antL[2]+=.015*Math.sin(t*2.1);O.antR[2]+=.015*Math.sin(t*2.1+1);
  // the head follows the hero (out of moves)
  const m=e.m,hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,yaw=svAng(Math.atan2(hx,hz)-m.rotation.y),k=S.mv?0:(Math.abs(yaw)<1.6?1:0);
  S.hy=(S.hy||0)+((Math.max(-.7,Math.min(.7,yaw))*k)-(S.hy||0))*Math.min(1,dt*3);O.head[1]+=S.hy*.5;O.neck[1]+=S.hy*.5}
// after the pose: the sap pulses with his breath (hotter in Phase II and while charging), leaves fall, the lanterns flicker
function ok232Post(e,S,dt,now){const R=S.R,t=now/1000,ph2=S.ph>1,ch=S.chg||0;
  R.sap.emissiveIntensity=(ph2?.7:.3)+.12*Math.sin(t*1.1)+ch*1.3;R.sap.emissive.setHex(ph2?0xff5a14:OK232.sap);R.eyeM.color.setHex(ch>.3?0xffffff:ph2?0xff8a3a:0xffd27a);R.lantM.opacity=.8+.15*Math.sin(t*5.3);
  if(!S.dieM&&Math.random()<dt*(ph2?7:3)){const js=['antL','antR','chest','spine','hips'],j=js[(Math.random()*js.length)|0],up=j[0]=='a';
    const p=svWP(e,j,(Math.random()-.5)*(up?1.6:.8),up?1+Math.random()*1.2:.5,(Math.random()-.5)*.8);burst(p,OK232.leaf[(Math.random()*4)|0],1,.25,-.5,1.6)}
  if(ph2&&!S.dieM&&Math.random()<dt*5){const p=svWP(e,'chest',0,-.2,.8);burst(p,0xffb43a,1,.3,.6,.5)}}
OK232.sheet.boss=()=>{const R=svRig();ok232Build(R,null);svRest(R);svMerge(R);return R.root};
