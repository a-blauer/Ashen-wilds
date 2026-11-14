// ================= v232 Ythrael, the Voice Below — the finale's boss: the model, poses and procedural animation =================
// The man from the fountain, grown vast on six Sovereigns' essence (the fight-him ending; fight and arena in 4062, moves in 4061).
// Phase I and II he is the robed figure of the cinematic at four times the size: a long pale face with white beady eyes and ivory
// hair, an elegant crimson robe worked with gold thread (high collar, mantle, hanging sleeves, a skirt that sweeps the stone), long
// pale hands with nails like knives and black fire round them, the essence he drank burning in his breast in the six Sovereigns'
// colours. In Phase II the ivory wings come out: gangly bone fingers with torn pale membrane. In Phase III the truth shows: the
// robe splits, the neck and arms stretch, the jaw unhinges on its teeth (yt232Post morphs the rig with S.tru 0..1).
// Built like a Sovereign (svRig kit; rigid parts on named joints, merged by svMerge). He faces +z.
// Joints (L = +x): root · hips · spine · chest · neck · head · jaw · shL/R · elL/R · wrL/R · wgL/R (wing arm) · wfL/R (wing fingers) ·
// sk0 · sk1 (the robe's skirt) · slL/R (the hanging sleeves) · heart. Poses (YT232P): offsets from rest, '~' mirrors.
var YT232={col:0xc89aff,dark:0x1a0a2a,ess:[0x9aff5a,0x5ad8ff,0xbfe9ff,0xffc24a,0xb8ff3a,0xff4a5a],tris:0,sheet:{}};
function yt232Build(R,e){
  const skin=svMat(R,0xcfc6c2,{roughness:.6}),skin2=svMat(R,0xa89a98,{roughness:.65}),hair=svMat(R,0xe6e0d0,{roughness:.7,side:THREE.DoubleSide}),nail=svMat(R,0x1a1418,{roughness:.3,metalness:.3}),
    robe=svMat(R,0x6a0a14,{roughness:.8,side:THREE.DoubleSide}),robe2=svMat(R,0x3e0610,{roughness:.85,side:THREE.DoubleSide}),lining=svMat(R,0x1c0408,{roughness:.9,side:THREE.DoubleSide}),
    gold=svMat(R,0xd4a93a,{roughness:.35,metalness:.75,emissive:0x6a4a0a,emissiveIntensity:.35}),gold2=svMat(R,0x8f6c1e,{roughness:.45,metalness:.7}),
    bone=svMat(R,0xe2dccb,{roughness:.6}),memb=svMat(R,0xbdb4a2,{roughness:.8,side:THREE.DoubleSide,transparent:true,opacity:.9}),tooth=svMat(R,0xefe9d8,{roughness:.4}),maw=svMat(R,0x2a060c,{roughness:.6}),
    ess=svMat(R,0x1a1020,{roughness:.3,emissive:0xc89aff,emissiveIntensity:1.0}),eye=svGlowMat(R,0xffffff),voidM=svGlowMat(R,0x2a1040,.85);
  ess.userData.e0=0xc89aff;R.ess=ess;R.eyeM=eye;R.robeM=robe;R.robe2M=robe2;R.membM=memb;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),G=(k,f)=>svG('yt'+k,f),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz);
  const ball=(k,r,det,j)=>G('b'+k,()=>svLump(r,det==null?1:det,j||.08,200+k)),horn=(k,r,l,bx,by,n,seg)=>G('h'+k,()=>svHorn(r,l,bx,by,n||5,seg||3));
  const tab=(k,w0,w1,l)=>G('tb'+k,()=>{const s=new THREE.Shape();s.moveTo(-w0,0);s.lineTo(w0,0);s.lineTo(w1,-l*.86);s.lineTo(0,-l);s.lineTo(-w1,-l*.86);s.lineTo(-w0,0);return new THREE.ShapeGeometry(s,1)});
  const band=(k,rx,rz,t)=>G('bd'+k,()=>svLoft([[-t,rx,rz],[t,rx*1.01,rz*1.01]],14,{cap:false}));
  // ---------------- the skeleton (he stands about 4.9 tall) ----------------
  J('root',null,0,0,0);J('hips','root',0,2.45,0);J('spine','hips',0,.38,0);J('chest','spine',0,.62,.02);J('neck','chest',0,.74,.02);J('head','neck',0,.34,.03);J('jaw','head',0,-.02,.1);R.J.head.scale.setScalar(1.25);J('heart','chest',0,.2,.3);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('sh'+L,'chest',s*.62,.5,0,0,0,s*.1);J('el'+L,'sh'+L,0,-1.0,0);J('wr'+L,'el'+L,0,-.95,.03);J('sl'+L,'el'+L,0,-.5,-.02);
    J('wg'+L,'chest',s*.3,.42,-.34,0,0,s*.25);J('wf'+L,'wg'+L,s*1.5,.5,-.1,0,0,s*-.9)});
  J('sk0','hips',0,-.2,0);J('sk1','sk0',0,-1.15,0);
  // ---------------- the robe over hips and trunk: a fitted body, gold girdle, thread patterns as raised gold lines ----------------
  Mm('hips',G('hp',()=>svLoft([[-.3,.5,.4],[0,.56,.44],[.36,.5,.4]],12)),robe);Mm('hips',band(1,.58,.46,.07),gold,0,.04,0);
  Mm('hips',G('bk',()=>{const g=new THREE.OctahedronGeometry(.13,0);g.scale(1,1.2,.5);return g}),gold,0,.04,.48);Mm('hips',G('bg',()=>new THREE.OctahedronGeometry(.055,0)),ess,0,.04,.54);
  Mm('spine',G('sp',()=>svLoft([[-.05,.5,.4],[.3,.46,.36],[.62,.56,.42]],12)),robe2);
  Mm('chest',G('ch',()=>svLoft([[-.06,.56,.42],[.3,.7,.5],[.58,.62,.46],[.76,.3,.28]],12)),robe);
  // the open breast of the robe: pale skin, ribs, the drunk essence burning under it
  Mm('chest',G('br',()=>svLoft([[-.05,.3,.08],[.3,.36,.1],[.6,.24,.08]],8)),skin,0,0,.4);for(let k=0;k<4;k++)[-1,1].forEach(s=>Mm('chest',G('rb',()=>svTube([[0,0,0],[.14,-.03,.03],[.26,-.1,-.02]],[.022,.026,.016],4)),skin2,s*.03,.12+k*.11,.49,0,0,0,s,1,1));
  Mm('heart',ball(1,.17,1,.2),ess);svSpr(R,'heart',YT232.col,1.5,0,0,.16);
  // gold thread: lapels down the opening, chevrons on the breast, a hem line; the collar and the mantle
  [-1,1].forEach(s=>{Mm('chest',G('lp',()=>svTube([[.3,.72,.3],[.34,.4,.47],[.3,.1,.47],[.2,-.2,.42]],[.03,.035,.03,.025],4)),gold,0,0,0,0,0,0,s,1,1);
    for(let k=0;k<3;k++)Mm('chest',G('cv',()=>svTube([[.36,.1,.44],[.5,.2,.36],[.62,.12,.22]],[.014,.014,.014],3)),gold2,0,k*.16,0,0,0,0,s,1,1);
    for(let k=0;k<4;k++)Mm('spine',G('dm',()=>{const g=new THREE.OctahedronGeometry(.045,0);g.scale(1,1.5,.3);return g}),gold,s*(.2+((k%2)*.14)),.06+k*.14,.36-((k%2)*.04))});
  Mm('chest',G('cl',()=>svLoft([[.66,.36,.34],[.84,.4,.38],[.98,.47,.43]],10,{cap:false})),robe2);Mm('chest',band(2,.48,.44,.03),gold,0,.98,0);
  Mm('chest',G('mt',()=>svLoft([[.74,.4,.36],[.6,.84,.56],[.36,.98,.6],[.2,1.0,.58]],14,{cap:false})),robe);Mm('chest',band(3,1.01,.59,.035),gold,0,.2,0);
  for(let k=0;k<14;k++){const a=k/14*6.283;if(Math.abs(svAng(a))<.5)continue;Mm('chest',G('mz',()=>svTube([[0,0,0],[.05,.09,0],[.1,0,0]],[.013,.013,.013],3)),gold2,Math.sin(a)*.93-.05,.3,Math.cos(a)*.57,0,a+Math.PI/2,0)}
  // ---------------- neck, head: a long pale face, sunk cheeks, white beady eyes, ivory hair, the jaw with its teeth ----------------
  Mm('neck',G('nk',()=>svLoft([[-.06,.17,.17],[.18,.14,.14],[.36,.13,.13]],8)),skin);for(let k=0;k<2;k++)Mm('neck',G('tn',()=>svTube([[0,0,.12],[.03,.16,.13],[.02,.3,.11]],[.02,.022,.018],4)),skin2,(k?1:-1)*.07,0,0,0,0,0,k?1:-1,1,1);
  const hdR=[[-.08,.16,.18],[.1,.22,.24],[.3,.24,.26,0,-.01],[.5,.2,.23,0,-.02],[.64,.1,.13,0,-.03]];Mm('head',G('hd',()=>svLoft(hdR,10)),skin);
  Mm('head',G('fc',()=>svLoft([[-.06,.13,.06],[.12,.17,.08],[.3,.16,.07],[.46,.1,.04]],8)),skin,0,0,.19);Mm('head',G('ns',()=>svHorn(.035,.2,0,-.03,4,2)),skin2,0,.26,.24,-.4,0,0);
  Mm('head',G('bw',()=>svLump(.1,1,.1,211)),skin2,0,.36,.2,0,0,0,2.0,.35,.8);
  [-1,1].forEach(s=>{Mm('head',ball(2,.055,1),maw,s*.09,.31,.235,0,0,0,1.1,.8,.6);Mm('head',G('ey',()=>new THREE.IcosahedronGeometry(.026,1)),eye,s*.09,.31,.262);svSpr(R,'head',0xffffff,.3,s*.09,.31,.28);
    Mm('head',G('ck',()=>svTube([[0,0,0],[.04,-.1,.02],[.02,-.2,.0]],[.02,.028,.018],4)),skin2,s*.14,.24,.2,0,0,0,s,1,1);Mm('head',G('er',()=>svHorn(.035,.2,0,.04,4,2)),skin,s*.22,.3,.0,-.5,s*1.9,0)});
  Mm('head',G('mo',()=>new THREE.BoxGeometry(.16,.03,.03)),maw,0,.1,.26);for(let k=0;k<6;k++)Mm('head',horn('tu',.011,.07,0,0,4,2),tooth,-.065+k*.026,.085,.25,Math.PI/2,0,0);
  Mm('jaw',G('jw',()=>svLoft([[-.14,.12,.06],[-.02,.15,.08],[.06,.13,.05]],8)),skin,0,0,.1);for(let k=0;k<6;k++)Mm('jaw',horn('tu',.011,.08,0,0,4,2),tooth,-.065+k*.026,.07,.16,-Math.PI/2,0,0);Mm('jaw',G('mw',()=>new THREE.BoxGeometry(.2,.02,.14)),maw,0,.05,.1);
  // hair: a cap swept back, long locks down the back and over the shoulders
  Mm('head',G('hc',()=>svLump(.25,1,.08,212)),hair,0,.42,-.06,0,0,0,1,.8,1.05);
  for(let k=0;k<9;k++){const u=(k-4)/4,l=1.5+((k*5)%3)*.3;Mm('head',tab('h'+(k%3),.09,.05,l),hair,u*.2,.46-Math.abs(u)*.06,-.2-Math.abs(u)*-.06,.25+Math.abs(u)*.1,Math.PI+u*.5,0)}
  [-1,1].forEach(s=>Mm('head',tab('hs',.07,.035,1.25),hair,s*.24,.4,.02,-.1,s*1.3,s*.05));
  // ---------------- arms: the robe's upper sleeve, a long bare forearm, the hand with nails like knives, the hanging sleeve ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',sh='sh'+L,el='el'+L,wr='wr'+L,sl='sl'+L;
    Mm(sh,G('pd',()=>svLump(.3,1,.08,213)),robe,0,.04,0,0,0,0,1.15,.8,1.1);Mm(sh,band(4,.31,.31,.03),gold,0,-.14,0,0,0,s*.2);
    Mm(sh,G('ua',()=>svLoft([[.04,.24,.24],[-.5,.2,.2],[-1.0,.22,.22]],9)),robe2);Mm(sh,band(5,.23,.23,.03),gold,0,-.96,0);
    Mm(el,ball(3,.13,1),skin2);Mm(el,G('fa',()=>svLoft([[0,.12,.12],[-.5,.1,.1],[-.95,.075,.075]],8)),skin);for(let k=0;k<2;k++)Mm(el,G('vn',()=>svTube([[0,0,0],[.02,-.4,.01],[0,-.8,0]],[.014,.016,.012],3)),skin2,(k?1:-1)*.06,-.08,.08);
    Mm(sl,G('sl',()=>svLoft([[.5,.24,.24],[0,.34,.3],[-.5,.5,.2,0,-.12],[-1.1,.36,.1,0,-.2]],10,{cap:false})),robe);Mm(sl,G('sli',()=>svLoft([[.45,.22,.22],[0,.31,.27],[-.5,.46,.17,0,-.12],[-1.05,.32,.08,0,-.2]],10,{cap:false})),lining);
    Mm(sl,G('slh',()=>svLoft([[-1.04,.37,.11,0,-.2],[-1.12,.37,.11,0,-.2]],10,{cap:false})),gold);
    // the hand: a long palm, four fingers and a thumb in two joints each, a nail on every one; black fire in the palm
    Mm(wr,G('pm',()=>svLump(.09,1,.08,214)),skin,0,-.1,.01,0,0,0,1,1.5,.6);
    [[-.07,0,.42],[-.025,.01,.48],[.025,.01,.46],[.07,0,.4],[s*.1,-.02,.3]].forEach(([fx,fz,fl],k)=>{const th=k==4,rz=th?s*.9:fx*-1.2;
      Mm(wr,G('fg'+k,()=>svTube([[0,0,0],[0,-fl*.5,.03],[0,-fl,.07]],[.024,.02,.014],4)),skin,fx,th?-.08:-.22,fz+.02,-.15,0,rz);
      Mm(wr,horn('nl',.02,.34,0,-.05,4,3),nail,fx+Math.sin(-rz)*-fl,(th?-.08:-.22)-fl*Math.cos(rz),fz+.1,Math.PI/2+.15,0,rz)});
    Mm(wr,G('vd',()=>new THREE.IcosahedronGeometry(.11,1)),voidM,0,-.26,.12);svSpr(R,wr,0x7a3aff,.7,0,-.26,.14)});
  // ---------------- the skirt of the robe: panels to the floor, gold hem, thread running up from it ----------------
  Mm('sk0',G('sk',()=>svLoft([[.14,.56,.44],[-.5,.66,.56],[-1.15,.8,.72]],14,{cap:false})),robe);Mm('sk1',G('sk2',()=>svLoft([[.02,.8,.72],[-.6,.98,.92],[-1.08,1.12,1.06]],14,{cap:false})),robe2);
  Mm('sk1',band(6,1.13,1.07,.04),gold,0,-1.06,0);Mm('sk1',band(7,1.05,.99,.02),gold2,0,-.86,0);
  for(let k=0;k<14;k++){const a=k/14*6.283,r=1.0;Mm('sk1',G('ht',()=>svTube([[0,-1.02,0],[.04,-.8,0],[-.03,-.6,0],[0,-.42,0]],[.014,.014,.014,.008],3)),gold,Math.sin(a)*r*.99,0,Math.cos(a)*r*.93,0,a,0);
    if(k%2)Mm('sk1',G('hd2',()=>{const g=new THREE.OctahedronGeometry(.05,0);g.scale(1,1.6,.3);return g}),gold2,Math.sin(a)*1.07,-.95,Math.cos(a)*1.0,0,a,0)}
  [[0,.46,.3,0],[0,-.46,.26,Math.PI]].forEach(([x,z,w,ry],i)=>{Mm('sk0',tab('f'+i,w,w*.8,2.0),robe2,x,.14,z,i?-.2:.2,ry,0);Mm('sk0',tab('g'+i,w*.3,w*.2,1.8),gold,x,.12,z*1.03,i?-.2:.2,ry,0)});
  // ---------------- wings (hidden until Phase II: yt232Post scales the wing joints from nothing): bone arm, four long fingers, torn membrane ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',wg='wg'+L,wf='wf'+L;
    Mm(wg,G('wa',()=>svTube([[0,0,0],[.7,.3,-.04],[1.5,.5,-.1]],[.09,.07,.06],6)),bone,0,0,0,0,0,0,s,1,1);Mm(wg,ball(4,.1,1),bone,s*1.5,.5,-.1);
    const F=[[2.6,.35,.0],[2.9,-.5,-.05],[2.5,-1.3,-.1],[1.7,-1.9,-.1]];
    F.forEach(([l,dy],k)=>{const p1=[l*.5,dy*.5+.12,0],p2=[l,dy,0];Mm(wf,G('wf'+k,()=>svTube([[0,0,0],p1,p2],[.05,.035,.012],5)),bone,0,0,0,0,0,0,s,1,1);Mm(wf,horn('wc',.02,.22,0,-.05,4,2),nail,s*p2[0],p2[1],0,Math.PI/2,0,s*-.3)});
    // membrane: fans between neighbouring fingers and from the last finger back to the body, each with a bite out of its edge
    const tri=(k,a,b,c)=>G('wm'+k,()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,a[0],a[1],0,(a[0]+b[0])*.44,(a[1]+b[1])*.44,0, 0,0,0,(a[0]+b[0])*.44,(a[1]+b[1])*.44,0,b[0],b[1],0, a[0],a[1],0,(a[0]*.75+b[0]*.25)+c,(a[1]*.75+b[1]*.25),0,(a[0]+b[0])*.44,(a[1]+b[1])*.44,0],3));g.computeVertexNormals();return g});
    for(let k=0;k<3;k++)Mm(wf,tri(k,[F[k][0],F[k][1]],[F[k+1][0],F[k+1][1]],-.2),memb,0,0,-.01,0,0,0,s,1,1);
    Mm(wf,tri(3,[F[3][0],F[3][1]],[-.6,-1.5],-.1),memb,0,0,-.01,0,0,0,s,1,1)});
  if(!YT232.tris)YT232.tris=wk232Tris(R);R.headJ='head'}
// ---------------- poses (offsets from rest: [rx, ry, rz, px, py, pz]; arms hang -y: rx − raises one forward; wings: wg rz + lifts the left) ----------------
var YT232P={
  idle:{},
  cRec:{hips:[.03,0,0,0,-.05,0],shL:[-.15,0,.08],shR:[-.15,0,-.08]},
  // Nail Rake: a hand drawn back high across the body and raked down and across; then both hands low, and up in a pillar of black fire
  rUp:{hips:[0,-.3,0],spine:[0,-.25,0],chest:[-.05,-.35,0],head:[0,.3,0],shR:[-1.9,0,-.9],elR:[-.9,0,0],wrR:[-.3,0,0],shL:[-.3,0,.3],elL:[-.5,0,0],sk0:[0,.15,0]},
  rCut:{hips:[.08,.35,0,0,-.08,.2],spine:[.1,.3,0],chest:[.15,.45,0],head:[.05,-.3,0],shR:[-.7,0,.7],elR:[-.2,0,0],wrR:[.3,0,0],shL:[.3,0,.2],sk0:[.12,-.15,0]},
  upLow:{hips:[.3,0,0,0,-.35,0],spine:[.25,0,0],chest:[.2,0,0],head:[-.2,0,0],shL:[.4,0,.3],elL:[-.5,0,0],shR:[.4,0,-.3],elR:[-.5,0,0],sk0:[-.25,0,0]},
  upCut:{hips:[-.15,0,0,0,.12,.25],spine:[-.2,0,0],chest:[-.3,0,0],head:[-.35,0,0],jaw:[.3,0,0],shL:[-2.6,0,.4],elL:[-.3,0,0],shR:[-2.6,0,-.4],elR:[-.3,0,0],sk0:[.2,0,0]},
  // Umbral Lance: one arm drawn back, the other levelled at you; the cast
  lnUp:{hips:[0,-.45,0],spine:[0,-.3,0],chest:[0,-.3,0],head:[0,.7,0],shR:[.4,0,-.5],elR:[-1.7,0,0],shL:[-1.5,0,.1],elL:[-.1,0,0]},
  lance:{hips:[.06,.3,0,0,-.05,.2],spine:[.05,.2,0],chest:[.08,.3,0],head:[0,-.25,0],shR:[-1.55,0,.1],elR:[-.05,0,0],wrR:[-.4,0,0],shL:[.3,0,.4],elL:[-.4,0,0]},
  // Robe Whirl: wound to one side, the whirl
  whUp:{hips:[0,.7,0,0,-.1,0],spine:[0,.4,0],chest:[0,.4,0],head:[0,-.8,0],shL:[-.5,0,.9],elL:[-.4,0,0],shR:[-.9,0,.6],elR:[-1.0,0,0],sk0:[0,.4,0],sk1:[0,.3,0]},
  whirl:{hips:[0,-1.2,0,0,-.15,0],spine:[0,-.6,0],chest:[0,-.5,0],head:[0,.9,0],shL:[-1.2,0,1.3],elL:[-.1,0,0],shR:[-1.2,0,-1.3],elR:[-.1,0,0],sk0:[.1,-.6,0],sk1:[.1,-.5,0],slL:[0,0,.6],slR:[0,0,-.6]},
  // Grasping Shadows / Essence Barrage: both hands lifted, palms up; then turned over and pressed down
  lift:{hips:[-.06,0,0,0,.08,0],chest:[-.15,0,0],head:[-.25,0,0],shL:[-1.2,0,.8],elL:[-1.2,0,0],wrL:[-.6,0,0],shR:[-1.2,0,-.8],elR:[-1.2,0,0],wrR:[-.6,0,0]},
  press:{hips:[.15,0,0,0,-.15,.1],chest:[.2,0,0],head:[.2,0,0],shL:[-1.0,0,.5],elL:[-.3,0,0],wrL:[.6,0,0],shR:[-1.0,0,-.5],elR:[-.3,0,0],wrR:[.6,0,0],sk0:[-.1,0,0]},
  // Black Orbs: hands crossed at the breast, flung apart
  cross:{hips:[.05,0,0],chest:[.12,0,0],head:[.2,0,0],shL:[-1.0,0,-.7],elL:[-1.6,0,0],shR:[-1.0,0,.7],elR:[-1.6,0,0]},
  fling:{hips:[-.06,0,0,0,.05,.1],chest:[-.15,0,0],head:[-.1,0,0],shL:[-1.4,0,.9],elL:[-.1,0,0],shR:[-1.4,0,-.9],elR:[-.1,0,0],slL:[0,0,.4],slR:[0,0,-.4]},
  // Voice of Command (and the phase changes): head back, arms wide, the jaw open on the word
  speak:{hips:[-.12,0,0,0,.08,0],spine:[-.15,0,0],chest:[-.25,0,0],head:[-.45,0,0],jaw:[.55,0,0],shL:[-.5,0,1.3],elL:[-.5,0,0],shR:[-.5,0,-1.3],elR:[-.5,0,0],wgL:[0,.2,.5],wgR:[0,-.2,-.5]},
  curl:{hips:[.3,0,0,0,-.5,0],spine:[.35,0,0],chest:[.35,0,0],head:[.4,0,0],shL:[-.6,0,-.5],elL:[-1.7,0,0],shR:[-.6,0,.5],elR:[-1.7,0,0],wgL:[0,-.9,-.4],wgR:[0,.9,.4],sk0:[-.3,0,0]},
  // Thirst: on one knee at the stone, a hand cupped to the mouth
  kneel:{hips:[.35,0,0,0,-1.0,.1],spine:[.3,0,0],chest:[.25,0,0],head:[.3,0,0],jaw:[.5,0,0],shR:[-1.3,0,.5],elR:[-1.9,0,0],shL:[-.3,0,.5],elL:[-.4,0,0],sk0:[-.5,0,0],sk1:[-.4,0,0],wgL:[0,-.5,-.3],wgR:[0,.5,.3]},
  // flight (Phase II on): the crouch, the leap, the beat, the stoop, the landing; the wing gale
  crouch:{hips:[.25,0,0,0,-.55,0],spine:[.2,0,0],chest:[.15,0,0],head:[-.2,0,0],shL:[.3,0,.4],shR:[.3,0,-.4],wgL:[0,.3,.9],wgR:[0,-.3,-.9],sk0:[-.3,0,0]},
  flyUp:{root:[0,0,0,0,5.2,0],hips:[-.2,0,0],chest:[-.15,0,0],head:[.25,0,0],shL:[-.3,0,.7],elL:[-.5,0,0],shR:[-.3,0,-.7],elR:[-.5,0,0],wgL:[0,.2,1.0],wgR:[0,-.2,-1.0],wfL:[0,0,.3],wfR:[0,0,-.3],sk0:[.25,0,0],sk1:[.2,0,0]},
  flyDn:{root:[0,0,0,0,4.7,0],hips:[-.12,0,0],chest:[-.1,0,0],head:[.25,0,0],shL:[-.2,0,.5],elL:[-.6,0,0],shR:[-.2,0,-.5],elR:[-.6,0,0],wgL:[0,.2,-.2],wgR:[0,-.2,.2],wfL:[0,0,-.3],wfR:[0,0,.3],sk0:[.1,0,0]},
  stoop:{root:[0,0,0,0,2.6,0],hips:[.7,0,0],chest:[.2,0,0],head:[-.5,0,0],shL:[-2.4,0,.3],elL:[-.2,0,0],shR:[-2.4,0,-.3],elR:[-.2,0,0],wgL:[0,.9,.6],wgR:[0,-.9,-.6],sk0:[.7,0,0],sk1:[.5,0,0]},
  land:{hips:[.35,0,0,0,-.7,0],spine:[.3,0,0],chest:[.2,0,0],head:[-.2,0,0],shL:[-.9,0,.3],elL:[-.2,0,0],wrL:[.5,0,0],shR:[-.9,0,-.3],elR:[-.2,0,0],wrR:[.5,0,0],wgL:[0,.2,.6],wgR:[0,-.2,-.6],sk0:[-.4,0,0]},
  galeUp:{hips:[-.2,0,0,0,.1,-.1],chest:[-.2,0,0],shL:[-.4,0,.8],shR:[-.4,0,-.8],wgL:[0,.8,.9],wgR:[0,-.8,-.9],wfL:[0,.3,.2],wfR:[0,-.3,-.2]},
  gale:{hips:[.15,0,0,0,-.1,.15],chest:[.2,0,0],shL:[-1.0,0,.4],shR:[-1.0,0,-.4],wgL:[0,-1.2,.1],wgR:[0,1.2,-.1],wfL:[0,-.5,0],wfR:[0,.5,0]},
  // torn open: on his knees, the essence pouring out; dead: face down, wings spread
  stag:{hips:[.3,.1,.1,0,-1.15,0],spine:[.3,0,.08],chest:[.3,0,.06],head:[.5,.2,.2],jaw:[.5,0,0],shL:[-.4,0,.3],elL:[-.5,0,0],shR:[-.9,0,-.2],elR:[-1.4,0,0],wgL:[0,.2,-.6],wgR:[0,-.2,.6],sk0:[-.6,0,0],sk1:[-.4,0,0]},
  dead:{root:[0,0,0,0,-1.9,0],hips:[1.4,0,.1,0,0,.5],spine:[.1,0,0],chest:[.1,0,0],head:[.2,.6,0],jaw:[.6,0,0],shL:[-2.5,0,.6],elL:[-.3,0,0],shR:[-1.8,0,-.7],elR:[-.5,0,0],wgL:[0,.3,.2],wgR:[0,-.3,-.2],sk0:[-.3,0,0]}};
// ---------------- procedural layer: a gliding walk (the robe hides his legs), breathing, sleeves and skirt trailing, the head following you ----------------
function yt232Loco(e,S,O,dt,now){const t=now/1000,sp=S.spd||0,a=Math.min(1,sp/2.4),br=Math.sin(t*.95),g=(S.gp=(S.gp||0)+dt*(1+sp*1.5));
  O.hips[4]+=.03*br+.04*Math.sin(g*2)*a;O.hips[0]+=.06*a;O.chest[0]+=.025*br;O.spine[0]+=.015*br;O.neck[0]+=-.02*br;
  O.sk0[0]+=.04*Math.sin(t*.9)+.25*a;O.sk1[0]+=.06*Math.sin(t*.9-.7)+.2*a;O.sk0[2]+=.04*Math.sin(g)*a;O.slL[0]+=.1*Math.sin(t*1.1)+.3*a;O.slR[0]+=.1*Math.sin(t*1.1+1)+.3*a;
  O.shL[0]+=.03*br-.05*a;O.shR[0]+=.03*br-.05*a;O.elL[0]+=-.12-.03*br;O.elR[0]+=-.1-.03*br;O.wrL[0]+=.1*Math.sin(t*1.7);O.wrR[0]+=.1*Math.sin(t*1.7+1.3);
  // wings: a slow settle on the ground, a beat in the air
  const air=S.air||0,w=air>.02?Math.sin(t*7)*.5*air:.05*br;O.wgL[2]+=w;O.wgR[2]-=w;O.wfL[2]+=w*.6;O.wfR[2]-=w*.6;
  const m=e.m,hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,yaw=svAng(Math.atan2(hx,hz)-m.rotation.y),k=S.mv?0:(Math.abs(yaw)<1.6?1:0);
  S.hy=(S.hy||0)+((Math.max(-.8,Math.min(.8,yaw))*k)-(S.hy||0))*Math.min(1,dt*2.5);O.head[1]+=S.hy*.7;O.chest[1]+=S.hy*.12;
  // Phase III: the body will not hold still
  const tr=S.tru||0;if(tr>.01){O.head[2]+=.12*tr*Math.sin(t*3.1);O.neck[2]+=.08*tr*Math.sin(t*2.3+1);O.jaw[0]+=.35*tr+.1*tr*Math.sin(t*5);O.shL[2]+=.1*tr*Math.sin(t*2.7);O.shR[2]-=.1*tr*Math.sin(t*2.9+2);O.spine[0]+=.12*tr}}
// after the pose: the essence in his breast cycles the six colours; wings unfold in Phase II; Phase III stretches him (S.tru)
function yt232Post(e,S,dt,now){const R=S.R,t=now/1000,ch=S.chg||0,J=R.J;S.air=Math.max(0,Math.min(1,J.root.position.y/3));
  const ci=Math.floor(t*.5)%6,c0=new THREE.Color(YT232.ess[ci]),c1=new THREE.Color(YT232.ess[(ci+1)%6]);c0.lerp(c1,(t*.5)%1);R.ess.emissive.copy(c0);R.ess.emissiveIntensity=1.0+.3*Math.sin(t*3)+ch*1.6+(S.sat||0)*.25;
  R.eyeM.color.setHex(ch>.4?0xd8b0ff:0xffffff);
  // wings: nothing in Phase I, out in II and III
  S.wk=(S.wk||0)+(((S.ph>1||S.dieM&&S.wk>.5)?1:0)-(S.wk||0))*Math.min(1,dt*2.2);const wk=Math.max(.001,S.wk);['wgL','wgR'].forEach(j=>{J[j].scale.setScalar(wk);J[j].visible=wk>.02});
  // the truth: longer neck and arms, the robe darkens and its skirt shrinks back, the jaw hangs
  S.tru=(S.tru||0)+((S.ph>2?1:0)-(S.tru||0))*Math.min(1,dt*1.2);const tr=S.tru;J.neck.scale.set(1,1+.9*tr,1);J.head.scale.setScalar(1.25);['shL','shR'].forEach(j=>{J[j].scale.set(1,1+.15*tr,1)});['elL','elR'].forEach(j=>{J[j].scale.set(1,1+.2*tr,1)});
  J.sk1.scale.set(1-.25*tr,1-.3*tr,1-.25*tr);R.robeM.color.setHex(0x6a0a14).lerp(new THREE.Color(0x24060c),tr*.8);R.robe2M.color.setHex(0x3e0610).lerp(new THREE.Color(0x14040a),tr*.8);
  if(!S.dieM&&Math.random()<dt*(4+ch*14+tr*8)){const j=Math.random()<.5?'wrL':'wrR',p=svWP(e,j,0,-.3,.1);burst(p,Math.random()<.5?0x3a1a5a:0x7a3aff,1,.3,.7,.6)}
  if(!S.dieM&&Math.random()<dt*3){const p=svWP(e,'heart',0,0,.15);burst(p,YT232.ess[(Math.random()*6)|0],1,.3,.5,.6)}}
YT232.sheet.boss=()=>{const R=svRig();yt232Build(R,null);svRest(R);svMerge(R);return R.root};
