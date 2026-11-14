// ================= v232 Seraphel, the Dawn Arbiter — the model, poses and procedural animation =================
// The fourth and last Warden of the Balance (fight and court in 4052, moves in 4051). A judge made of morning: a tall figure in
// ivory plate edged with gold that never touches the floor, a blank gold mask under a crown of rays, a halo turning behind the
// head, six wings (a great pair, a middle pair, a small low pair) of pale gold-tipped feathers, a skirt of long gold-hemmed
// tabards that trail to nothing where legs would be, a greatsword of white light in the right hand and a pair of scales hanging
// from the left. Light lives in the blade, the halo, the eyes of the mask and the seams of the breastplate.
// Built like a Sovereign (svRig kit; rigid parts on named joints, merged by svMerge). She faces +z and hovers (hips well off the floor).
// Joints (L = +x): root · hips · spine · chest · neck · head · halo · shL/R · elL/R · wrL/R · blade (in the right hand) · scale (from the
// left) · panL/panR (the pans) · w1L/R (great wings) · w2L/R · w3L/R · sk0 · sk1 (the trailing skirt). Poses (SR232P): offsets, '~' mirrors.
var SR232={col:0xffe9a0,light:0xfff6d8,tris:0,sheet:{}};
function sr232Build(R,e){
  const ivory=svMat(R,0xe9e2d0,{roughness:.45,metalness:.2}),ivory2=svMat(R,0xcfc6b0,{roughness:.5,metalness:.2}),gold=svMat(R,0xd4a93a,{roughness:.3,metalness:.8}),gold2=svMat(R,0x8f6c1e,{roughness:.4,metalness:.7}),
    cloth=svMat(R,0xf3eee2,{roughness:.9,side:THREE.DoubleSide}),cloth2=svMat(R,0xb9a36a,{roughness:.8,side:THREE.DoubleSide}),dark=svMat(R,0x2a2620,{roughness:.6}),
    F=c=>svMat(R,c,{roughness:.75,side:THREE.DoubleSide}),fW=F(0xf4efe2),fC=F(0xe2d8bf),fG=F(0xd4a93a),
    lit=svMat(R,0x4a3a14,{roughness:.3,emissive:0xffe9a0,emissiveIntensity:1.1,side:THREE.DoubleSide}),bladeM=svGlowMat(R,0xfff6d8,.92),eye=svGlowMat(R,0xffffff),haloM=svGlowMat(R,0xffe9a0,.9);
  lit.userData.e0=0xffe9a0;R.lit=lit;R.bladeM=bladeM;R.haloM=haloM;R.eyeM=eye;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),G=(k,f)=>svG('sr'+k,f),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz);
  const ball=(k,r,det,j)=>G('b'+k,()=>svLump(r,det==null?1:det,j||.06,160+k)),horn=(k,r,l,bx,by,n,seg)=>G('h'+k,()=>svHorn(r,l,bx,by,n||5,seg||3));
  const quill=G('ql',()=>{const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(.1,-.1);s.quadraticCurveTo(.17,-.7,.05,-1);s.lineTo(0,-1.05);s.lineTo(-.05,-1);s.quadraticCurveTo(-.17,-.7,-.1,-.1);s.lineTo(0,0);const g=new THREE.ShapeGeometry(s,3);g.rotateX(Math.PI/2);return g});
  const tab=(k,w0,w1,l)=>G('tb'+k,()=>{const s=new THREE.Shape();s.moveTo(-w0,0);s.lineTo(w0,0);s.lineTo(w1,-l*.85);s.lineTo(0,-l);s.lineTo(-w1,-l*.85);s.lineTo(-w0,0);return new THREE.ShapeGeometry(s,1)});
  // ---------------- the skeleton ----------------
  J('root',null,0,0,0);J('hips','root',0,2.5,0);J('spine','hips',0,.3,0);J('chest','spine',0,.55,.02);J('neck','chest',0,.62,.02);J('head','neck',0,.2,.02);J('halo','head',0,.22,-.28);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('sh'+L,'chest',s*.56,.42,0,0,0,s*.18);J('el'+L,'sh'+L,0,-.74,0);J('wr'+L,'el'+L,0,-.7,.02);
    J('w1'+L,'chest',s*.28,.5,-.34,0,0,s*.55);J('w2'+L,'chest',s*.3,.18,-.36,0,0,s*.1);J('w3'+L,'spine',s*.26,.2,-.32,0,0,s*-.45)});
  J('blade','wrR',0,-.14,.06,2.64,0,0);J('scale','wrL',0,-.2,.02);J('panL','scale',.42,-.12,0);J('panR','scale',-.42,-.12,0);
  J('sk0','hips',0,-.25,0);J('sk1','sk0',0,-.9,0);
  // ---------------- torso: a fluted breastplate, a gorget, a girdle of gold; light in the seams ----------------
  Mm('hips',G('hp',()=>svLoft([[-.3,.36,.3],[0,.44,.36],[.3,.4,.33]],12)),ivory);Mm('hips',G('gd',()=>svLoft([[-.07,.46,.38],[.07,.47,.39]],12,{cap:false})),gold,0,.02,0);
  Mm('hips',G('bk',()=>{const g=new THREE.OctahedronGeometry(.11,0);g.scale(1,1.3,.5);return g}),gold,0,.02,.4);Mm('hips',G('bg',()=>new THREE.OctahedronGeometry(.05,0)),lit,0,.02,.46);
  Mm('spine',G('sp',()=>svLoft([[-.05,.38,.3],[.3,.34,.27],[.58,.44,.34]],12)),ivory2);for(let k=0;k<4;k++)Mm('spine',G('ab',()=>svLoft([[-.05,.3,.07],[.05,.31,.08]],8)),ivory,0,.08+k*.12,.24,-.05,0,0,1-k*.04,1,1);
  Mm('chest',G('ch',()=>svLoft([[-.08,.44,.34],[.24,.58,.42],[.5,.52,.38],[.66,.26,.24]],12)),ivory);
  [-1,1].forEach(s=>{for(let k=0;k<3;k++)Mm('chest',G('fl',()=>svTube([[0,.5,.36],[.1,.3,.44],[.16,.05,.4],[.1,-.1,.34]],[.028,.034,.03,.02],4)),k==1?gold:ivory2,s*(.1+k*.13),0,0,0,0,0,s,1,1);
    Mm('chest',G('sm',()=>new THREE.BoxGeometry(.02,.5,.02)),lit,s*.045,.22,.43,-.08,0,s*.06)});
  Mm('chest',G('sn',()=>{const g=new THREE.CircleGeometry(.12,12);return g}),lit,0,.3,.435);for(let k=0;k<12;k++){const a=k/12*6.283;Mm('chest',G('ry',()=>new THREE.BoxGeometry(.016,.1,.012)),gold,Math.sin(a)*.19,.3+Math.cos(a)*.19,.432,0,0,-a)}
  svSpr(R,'chest',SR232.col,1.0,0,.3,.5);Mm('chest',G('gg',()=>svLoft([[.56,.3,.27],[.74,.22,.2]],10)),gold);
  // ---------------- head: the mask, the crown of rays, the halo ----------------
  Mm('neck',G('nk',()=>svLoft([[-.05,.13,.13],[.22,.11,.11]],8)),ivory2);
  Mm('head',G('hd',()=>svLoft([[-.06,.16,.17],[.12,.21,.22],[.32,.19,.2],[.46,.1,.12]],10)),ivory);
  Mm('head',G('mk',()=>svLoft([[-.08,.12,.05],[.1,.17,.07],[.3,.15,.06],[.42,.06,.03]],8)),gold,0,0,.16);
  [-1,1].forEach(s=>{Mm('head',G('es',()=>new THREE.BoxGeometry(.1,.022,.02)),eye,s*.075,.2,.235,0,0,s*-.12);svSpr(R,'head',SR232.light,.34,s*.08,.2,.26)});
  Mm('head',G('ns',()=>new THREE.BoxGeometry(.018,.2,.03)),gold2,0,.12,.232);
  for(let k=0;k<9;k++){const u=(k-4)/4,l=.5-Math.abs(u)*.18;Mm('head',horn('cr',.035,1,0,0,4,2),k%2?gold:gold2,u*.2,.36-Math.abs(u)*.08,-.02,-Math.PI/2+.25,0,u*-.75,1,1,l)}
  [-1,1].forEach(s=>Mm('head',G('vl',()=>tab('v',.14,.1,.7)),cloth,s*.17,.3,-.12,.25,s*1.2,0));
  Mm('halo',G('hl',()=>new THREE.TorusGeometry(.5,.028,5,28)),haloM);Mm('halo',G('hl2',()=>new THREE.TorusGeometry(.62,.012,4,28)),haloM);
  for(let k=0;k<12;k++){const a=k/12*6.283;Mm('halo',G('hr',()=>new THREE.BoxGeometry(.02,.16,.012)),haloM,Math.sin(a)*.74,Math.cos(a)*.74,0,0,0,-a,1,k%3?1:1.9,1)}
  svSpr(R,'halo',SR232.col,2.2,0,0,-.05);
  // ---------------- arms: layered pauldrons, slim plate arms, gauntlets ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',sh='sh'+L,el='el'+L,wr='wr'+L;
    for(let k=0;k<3;k++)Mm(sh,G('pd'+k,()=>svLump(.26-k*.03,1,.06,170+k)),k==1?gold:ivory,s*(.02+k*.06),.1-k*.1,0,0,0,s*(.15+k*.3),1.2,.48,1.1);
    Mm(sh,horn('pf',.05,.34,0,.05,4,2),gold,s*.08,.22,0,-Math.PI/2,0,s*-.5);
    Mm(sh,G('ua',()=>svLoft([[.02,.13,.13],[-.4,.115,.115],[-.74,.1,.1]],8)),ivory2);Mm(el,ball(1,.11,1),gold);Mm(el,G('fa',()=>svLoft([[-.02,.1,.1],[-.36,.125,.12],[-.7,.09,.09]],8)),ivory);
    Mm(el,G('vb',()=>svLoft([[-.05,.13,.13],[-.3,.15,.14]],8,{cap:false})),gold,0,-.08,0);Mm(wr,G('hn',()=>svLump(.1,1,.08,175)),ivory2,0,-.1,.02,0,0,0,1,1.3,1)});
  // the sword: a gold hilt, a long narrow blade of light
  Mm('blade',G('gp',()=>new THREE.CylinderGeometry(.03,.035,.36,6).toNonIndexed()),gold2,0,-.1,0);Mm('blade',G('pm',()=>new THREE.OctahedronGeometry(.06,0)),gold,0,-.31,0);
  Mm('blade',G('cg',()=>svTube([[-.34,.06,0],[-.15,.1,0],[0,.08,0],[.15,.1,0],[.34,.06,0]],[.02,.035,.045,.035,.02],5)),gold,0,0,0);
  Mm('blade',G('bl',()=>svBlade([[0,.1],[.085,.2],[.07,2.3],[0,2.75],[-.07,2.3],[-.085,.2]],.03)),bladeM);Mm('blade',G('bc',()=>new THREE.BoxGeometry(.018,2.2,.05)),lit,0,1.3,0);svSpr(R,'blade',SR232.light,.9,0,2.6,0);
  // the scales: a beam, two chains, two pans
  Mm('scale',G('sb',()=>svTube([[-.42,-.02,0],[0,.03,0],[.42,-.02,0]],[.018,.028,.018],5)),gold);Mm('scale',G('sh',()=>new THREE.CylinderGeometry(.012,.012,.2,4)),gold2,0,.1,0);
  ['panL','panR'].forEach(p=>{[-1,1].forEach(q=>Mm(p,G('pc',()=>new THREE.CylinderGeometry(.006,.006,.42,3)),gold2,q*.07,-.2,0,0,0,q*-.16));Mm(p,G('pn',()=>new THREE.SphereGeometry(.13,8,3,0,6.283,1.9,1.2).toNonIndexed()),gold,0,-.3,0);
    Mm(p,G('pg',()=>new THREE.OctahedronGeometry(.045,0)),lit,0,-.4,0)});
  // ---------------- wings: three pairs ----------------
  [[1,'w1',3.0,9,1.25,2.0],[1,'w2',2.2,7,1.0,1.5],[1,'w3',1.5,6,.8,1.1]].forEach(([_,w,span,n,l0,l1],wi)=>{[-1,1].forEach(s=>{const j=w+(s>0?'L':'R');
      Mm(j,G('wb'+wi,()=>svTube([[0,0,0],[span*.45,.14,0],[span,.05,0]],[.1,.075,.03],6)),ivory2,0,0,0,0,0,0,s,1,1);Mm(j,ball(2,.14,1),gold,0,0,0);
      for(let k=0;k<n;k++){const u=(k+.5)/n,x=s*u*span,l=l0+(l1-l0)*Math.sin(u*2.4+.5),yaw=s*u*.5;
        Mm(j,quill,k%2?fW:fC,x,.14*Math.sin(u*3.1)-.02,-.04,-(.9+u*.2),yaw,0,1.25,1,l);Mm(j,quill,fW,x,.14*Math.sin(u*3.1)+.03,0,-.6,yaw*.6,0,1.4,1,l*.5);
        Mm(j,quill,fG,x+Math.sin(yaw)*-l*.52,.14*Math.sin(u*3.1)-.02-Math.sin(.9+u*.2)*l*.84,-.04-Math.cos(.9+u*.2)*l*.84*Math.cos(yaw),-(.9+u*.2),yaw,0,.9,1,l*.18)}})});
  // ---------------- the skirt: tabards front, back and sides, an inner robe that fades to strips; no legs ----------------
  Mm('sk0',G('sk',()=>svLoft([[.12,.42,.34],[-.45,.48,.42],[-.95,.4,.36]],12,{cap:false})),cloth);Mm('sk1',G('sk2',()=>svLoft([[.05,.4,.36],[-.5,.26,.24],[-1.0,.06,.06]],10,{cap:false})),cloth2);
  [[0,.4,.36,0],[0,-.4,.3,Math.PI],[.44,0,.26,Math.PI/2],[-.44,0,.26,-Math.PI/2]].forEach(([x,z,w,ry],i)=>{Mm('sk0',tab('t'+i,w,w*.7,1.7),i<2?cloth:cloth2,x,.12,z,i==1?-.12:.12,ry,0);
    Mm('sk0',tab('h'+i,w*.5,w*.34,1.5),i<2?gold:gold2,x*1.02,.1,z*1.03,i==1?-.12:.12,ry,0)});
  for(let k=0;k<8;k++){const a=k/8*6.283+.4;Mm('sk1',tab('s',.07,.04,.9+((k*5)%4)*.2),k%2?cloth:cloth2,Math.sin(a)*.24,-.3,Math.cos(a)*.22,.1,a,0)}
  svSpr(R,'sk1',SR232.col,1.6,0,-.9,0);
  if(!SR232.tris)SR232.tris=wk232Tris(R);R.headJ='head'}
// ---------------- poses (offsets from rest: [rx, ry, rz, px, py, pz]; arms hang -y: rx − raises one forward; wings: rz + lifts the left) ----------------
var SR232P={
  idle:{},
  cRec:{hips:[.04,0,0,0,-.06,0],shR:[-.3,0,-.1],elR:[-.3,0,0]},
  // Blade of Dawn: the sword drawn back across the body, the level cut, the return, then both hands overhead and down
  cUp:{hips:[0,-.35,0],spine:[0,-.3,0],chest:[0,-.4,0],shR:[-.9,0,-1.2],elR:[-.9,0,0],blade:[.3,0,0],shL:[-.4,0,.5],elL:[-.6,0,0],w1L:[0,.2,.2],w1R:[0,-.2,-.2],sk0:[0,.2,0]},
  cCut:{hips:[.05,.4,0,0,-.05,.2],spine:[.05,.35,0],chest:[.08,.5,0],shR:[-1.3,0,.7],elR:[-.2,0,0],blade:[.5,0,0],shL:[.2,0,.3],w1L:[0,-.2,-.1],w1R:[0,.2,.1],sk0:[.1,-.2,0]},
  oUp:{hips:[-.12,0,0,0,.25,-.1],spine:[-.15,0,0],chest:[-.25,0,0],head:[-.2,0,0],shR:[-2.9,0,.25],elR:[-.3,0,0],blade:[.4,0,0],shL:[-2.7,0,-.3],elL:[-.6,0,0],w1L:[0,0,.5],w1R:[0,0,-.5],w2L:[0,0,.3],w2R:[0,0,-.3],sk0:[.15,0,0]},
  oCut:{hips:[.3,0,0,0,-.5,.3],spine:[.3,0,0],chest:[.3,0,0],head:[.1,0,0],shR:[-.9,0,.25],elR:[-.1,0,0],blade:[.5,0,0],shL:[-.8,0,-.3],elL:[-.2,0,0],w1L:[0,0,-.4],w1R:[0,0,.4],sk0:[-.3,0,0],sk1:[-.3,0,0]},
  // Lance of Light: the sword levelled back by the hip, the thrust
  thUp:{hips:[0,-.5,0,0,0,-.15],spine:[0,-.3,0],chest:[0,-.3,0],head:[0,.6,0],shR:[.5,0,-.3],elR:[-1.5,0,0],blade:[.5,0,0],shL:[-1.2,0,.2],elL:[-.2,0,0]},
  thrust:{hips:[.12,.3,0,0,-.1,.5],spine:[.1,.2,0],chest:[.1,.3,0],head:[0,-.3,0],shR:[-1.5,0,.1],elR:[-.05,0,0],blade:[.5,0,0],shL:[.5,0,.4],elL:[-.3,0,0],sk0:[-.35,0,0],sk1:[-.3,0,0],w1L:[0,.5,.2],w1R:[0,-.5,-.2]},
  // Wing Flare: the wings folded forward round her, then thrown wide
  wrap:{hips:[.1,0,0,0,-.2,0],chest:[.15,0,0],head:[.25,0,0],shR:[-.4,0,.5],elR:[-1.4,0,0],shL:[-.4,0,-.5],elL:[-1.4,0,0],w1L:[0,-1.2,-.5],w1R:[0,1.2,.5],w2L:[0,-1.1,-.2],w2R:[0,1.1,.2],w3L:[0,-.9,.2],w3R:[0,.9,-.2]},
  flare:{hips:[-.15,0,0,0,.25,0],chest:[-.25,0,0],head:[-.3,0,0],shR:[-.3,0,-1.3],elR:[-.1,0,0],shL:[-.3,0,1.3],elL:[-.1,0,0],w1L:[0,.3,.6],w1R:[0,-.3,-.6],w2L:[0,.3,.4],w2R:[0,-.3,-.4],w3L:[0,.3,.3],w3R:[0,-.3,-.3],sk0:[.2,0,0]},
  // Falling Stars / Verdict: the scales lifted high in the left hand, the sword point down; then the sword raised to the sun
  weigh:{hips:[-.05,0,0,0,.2,0],chest:[-.1,0,0],head:[-.15,.2,0],shL:[-2.6,0,.35],elL:[-.2,0,0],scale:[0,0,.15],panL:[0,0,-.15],panR:[0,0,-.15],shR:[-.2,0,-.3],elR:[-.2,0,0],blade:[0,0,0]},
  judge:{root:[0,0,0,0,3.2,0],hips:[-.1,0,0],chest:[-.2,0,0],head:[-.35,0,0],shR:[-3.0,0,.1],elR:[-.05,0,0],blade:[.5,0,0],shL:[-1.4,0,.9],elL:[-.3,0,0],scale:[0,0,-.3],panL:[0,0,.3],panR:[0,0,.3],
    w1L:[0,.2,.7],w1R:[0,-.2,-.7],w2L:[0,.2,.45],w2R:[0,-.2,-.45],w3L:[0,.2,.3],w3R:[0,-.2,-.3],sk0:[.1,0,0]},
  smite:{root:[0,0,0,0,2.6,0],hips:[.2,0,0],chest:[.25,0,0],head:[.2,0,0],shR:[-.9,0,.1],elR:[-.1,0,0],blade:[.5,0,0],shL:[-.9,0,.9],elL:[-.3,0,0],w1L:[0,0,-.3],w1R:[0,0,.3],w2L:[0,0,-.2],w2R:[0,0,.2]},
  // Radiant Orbs: both hands drawn in to the breast, then opened forward
  gather:{hips:[.05,0,0],chest:[.12,0,0],head:[.2,0,0],shR:[-.9,0,.6],elR:[-1.6,0,0],shL:[-.9,0,-.6],elL:[-1.6,0,0],w1L:[0,-.4,0],w1R:[0,.4,0]},
  cast:{hips:[-.05,0,0,0,.05,.1],chest:[-.1,0,0],head:[-.1,0,0],shR:[-1.5,0,-.4],elR:[-.1,0,0],shL:[-1.5,0,.4],elL:[-.1,0,0],w1L:[0,.3,.3],w1R:[0,-.3,-.3]},
  // Dawn Dash: leaning into the line, sword trailing; the cut through
  dLow:{hips:[.35,-.3,0,0,-.4,-.2],spine:[.15,0,0],chest:[.1,-.2,0],head:[-.3,.3,0],shR:[.6,0,-.6],elR:[-.6,0,0],blade:[.2,0,0],shL:[-.8,0,.2],elL:[-.9,0,0],w1L:[0,.8,-.3],w1R:[0,-.8,.3],w2L:[0,.8,-.2],w2R:[0,-.8,.2],sk0:[.5,0,0],sk1:[.4,0,0]},
  dCut:{hips:[.3,.4,0,0,-.3,.3],spine:[.1,.3,0],chest:[.1,.4,0],shR:[-1.5,0,.9],elR:[-.1,0,0],blade:[.5,0,0],shL:[.3,0,.3],w1L:[0,.9,-.2],w1R:[0,-.9,.2],sk0:[.6,0,0],sk1:[.5,0,0]},
  // staggered (the light gone out of her: sunk to the floor, wings fallen); dead
  stag:{root:[0,0,0,0,-1.45,0],hips:[.35,.1,.1],spine:[.25,0,0],chest:[.3,0,.1],head:[.5,.2,.2],shR:[-.3,0,.3],elR:[-.2,0,0],blade:[0,0,0],shL:[-.2,0,-.2],elL:[-.4,0,0],w1L:[0,.3,-1.0],w1R:[0,-.3,1.0],w2L:[0,.2,-.6],w2R:[0,-.2,.6],w3L:[0,.1,-.3],w3R:[0,-.1,.3],sk0:[.9,0,0],sk1:[.5,0,0],halo:[.6,0,.3,0,-.1,0]},
  dead:{root:[0,0,0,0,-2.2,0],hips:[1.4,0,.15,0,0,.4],spine:[.1,0,0],chest:[.1,0,0],head:[.2,.5,0],shR:[-2.4,0,.4],elR:[-.2,0,0],shL:[-1.8,0,-.6],elL:[-.4,0,0],w1L:[0,.4,-.9],w1R:[0,-.3,.4],w2L:[0,.3,-.5],w2R:[0,-.3,.5],sk0:[-.3,0,0],halo:[1.2,0,.5,0,-.3,-.2]}};
// ---------------- procedural layer: the hover, slow wingbeats, the skirt trailing, the scales swinging, the halo turning ----------------
function sr232Loco(e,S,O,dt,now){const t=now/1000,sp=S.spd||0,a=Math.min(1,sp/2.6),bt=Math.sin(t*1.5),b2=Math.sin(t*1.5-.5),b3=Math.sin(t*1.5-1.0),low=S.stg>0||S.dieM?0:1;
  O.hips[4]+=.1*Math.sin(t*1.5+.6)*low;O.hips[0]+=.12*a;O.chest[0]+=.02*bt-.05*a;O.head[0]+=-.04*a;
  O.w1L[2]+=.22*bt*low;O.w1R[2]-=.22*bt*low;O.w2L[2]+=.18*b2*low;O.w2R[2]-=.18*b2*low;O.w3L[2]+=.14*b3*low;O.w3R[2]-=.14*b3*low;O.w1L[1]+=.25*a;O.w1R[1]-=.25*a;
  O.sk0[0]+=.06*Math.sin(t*1.1)+.4*a;O.sk1[0]+=.1*Math.sin(t*1.1-.8)+.3*a;O.sk0[2]+=.04*Math.sin(t*.8);
  O.scale[2]+=.1*Math.sin(t*1.3);O.panL[2]-=.1*Math.sin(t*1.3)+.06*Math.sin(t*2.1);O.panR[2]-=.1*Math.sin(t*1.3)-.06*Math.sin(t*2.1);O.halo[2]+=t*.25%6.283;
  O.shL[0]+=.03*bt;O.shR[0]+=.03*b2;O.elL[0]+=-.12;O.elR[0]+=-.1;
  const m=e.m,hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,yaw=svAng(Math.atan2(hx,hz)-m.rotation.y),k=S.mv?0:(Math.abs(yaw)<1.6?1:0);
  S.hy=(S.hy||0)+((Math.max(-.8,Math.min(.8,yaw))*k)-(S.hy||0))*Math.min(1,dt*3);O.head[1]+=S.hy*.7;O.chest[1]+=S.hy*.15}
// after the pose: the light breathes (blazing in Phase II and while charging; almost out while she is staggered), motes rise off the blade
function sr232Post(e,S,dt,now){const R=S.R,t=now/1000,ph2=S.ph>1,ch=S.chg||0,dim=S.stg>0||S.dieM?.15:1;
  R.lit.emissiveIntensity=((ph2?1.6:1.0)+.2*Math.sin(t*2)+ch*1.8)*dim;R.bladeM.opacity=(.85+.1*Math.sin(t*9))*Math.max(.3,dim);R.haloM.opacity=(.8+.15*Math.sin(t*2.4))*dim;R.haloM.color.setHex(ch>.4?0xffffff:0xffe9a0);
  if(!S.dieM&&dim>.5&&Math.random()<dt*(ph2?12:5)+ch*dt*14){const p=svWP(e,'blade',0,.3+Math.random()*2.3,0);burst(p,SR232.light,1,.2,.5,.5)}
  if(!S.dieM&&dim>.5&&Math.random()<dt*3){const p=svWP(e,'sk1',(Math.random()-.5)*.4,-.8,(Math.random()-.5)*.4);burst(p,SR232.col,1,.2,-.4,.9)}}
SR232.sheet.boss=()=>{const R=svRig();sr232Build(R,null);svRest(R);svMerge(R);return R.root};
