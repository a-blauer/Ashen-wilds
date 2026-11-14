// ================= v232 Maelis, the Tempest Roc — the model, poses and procedural animation =================
// The second Warden of the Balance (fight and arena in 4032, moves in 4031). A storm given the body of a bird of prey: a deep
// keeled chest and a short heavy body shingled with slate feathers, pale barred underparts, a hooked gold beak, a crest of long
// plumes that crackle, wings nine paces across with fingered primaries whose tips burn with lightning, feathered thighs, gold
// scaled legs and black talons, a broad fanned tail. Lightning runs in her crest, wingtips and eyes (brighter in Phase II).
// Built like a Sovereign (svRig kit; rigid parts on named joints, merged by svMerge). She faces +z.
// Joints (L = +x): root · hips (the body) · chest · neck · head · jaw · crest · wgL/R (upper wing) · wfL/R (forewing) · whL/R (hand) ·
// thL/R · knL/R · ftL/R · tail0 · tail1. Poses (ML232P) are offsets from rest, mirrored with '~'.
var ML232={col:0x7ad8ff,bolt:0xcfeeff,tris:0,sheet:{}};
function ml232Build(R,e){
  const sl=svMat(R,0x2f3a4c,{roughness:.8}),sl2=svMat(R,0x435268,{roughness:.8}),sl3=svMat(R,0x1c2330,{roughness:.85}),pale=svMat(R,0xc9d2da,{roughness:.8}),bar=svMat(R,0x7f8b99,{roughness:.8}),
    gold=svMat(R,0xc8962a,{roughness:.45,metalness:.35}),gold2=svMat(R,0x8a6418,{roughness:.5,metalness:.3}),claw=svMat(R,0x121318,{roughness:.3,metalness:.4}),dark=svMat(R,0x0a0c12,{roughness:.6}),
    F=c=>svMat(R,c,{roughness:.8,side:THREE.DoubleSide}),fA=F(0x2f3a4c),fB=F(0x435268),fC=F(0x1c2330),fP=F(0xc9d2da),
    arc=svMat(R,0x0c2a3c,{roughness:.4,emissive:0x3ab8ff,emissiveIntensity:.8,side:THREE.DoubleSide}),eye=svGlowMat(R,0xdff6ff),spk=svGlowMat(R,0xbfeaff,.9);
  arc.userData.e0=0x3ab8ff;R.arc=arc;R.eyeM=eye;R.spkM=spk;const FM=[sl,sl2,sl3,sl2];
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),G=(k,f)=>svG('ml'+k,f),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz);
  const horn=(k,r,l,bx,by,n,seg)=>G('h'+k,()=>svHorn(r,l,bx,by,n||5,seg||4)),ball=(k,r,det,j)=>G('b'+k,()=>svLump(r,det==null?1:det,j||.15,80+k));
  // a body feather (plate, rounded tip at -y) and a flight feather (a long flat blade along -z, a raised shaft)
  const plate=wk232Plate('mlft',[[0,.5],[.3,.3],[.36,-.1],[.24,-.46],[0,-.66],[-.24,-.46],[-.36,-.1],[-.3,.3]],.1,.08);
  const quill=G('ql',()=>{const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(.09,-.12);s.quadraticCurveTo(.15,-.7,.05,-1);s.lineTo(0,-1.04);s.lineTo(-.05,-1);s.quadraticCurveTo(-.15,-.7,-.09,-.12);s.lineTo(0,0);const g=new THREE.ShapeGeometry(s,3);g.rotateX(Math.PI/2);return g});
  // ---------------- the skeleton ----------------
  J('root',null,0,0,0);J('hips','root',0,2.25,-.25,-.42);J('chest','hips',0,.25,.85);J('neck','chest',0,.55,.55,-.25);J('head','neck',0,.72,.3,.55);J('jaw','head',0,-.1,.18);J('crest','head',0,.26,-.12);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';
    J('wg'+L,'chest',s*.62,.42,-.05,0,0,s*-.5);J('wf'+L,'wg'+L,s*1.55,0,0,0,s*.9,0);J('wh'+L,'wf'+L,s*1.7,0,0,0,s*-1.3,0);
    J('th'+L,'hips',s*.5,-.3,.1,.42);J('kn'+L,'th'+L,0,-.85,.2);J('ft'+L,'kn'+L,0,-.95,-.05)});
  J('tail0','hips',0,.0,-.9);J('tail1','tail0',0,0,-.5);
  // ---------------- body: keeled chest, belly, back; feathers shingled over lofts (z-lofts, tips toward the tail) ----------------
  const zc=(j,name,rings,o,x,y,z)=>{const h=svJ(R,name,j,x||0,y||0,z||0,Math.PI/2,0,0);return wk232Cover(R,h,rings,plate,Object.assign({lift:.2,th:1,dir:-1},o))};
  const under=t=>Math.cos(t)<-.35;   // t = 0 is the back (+y after the turn), the belly faces down
  const bodyR=[[-1.0,.3,.28],[-.6,.6,.56],[0,.76,.74],[.5,.72,.76],[.9,.5,.56]];Mm('hips',G('bd',()=>svLoftZ(bodyR,12)),sl3);
  zc('hips','hipsC',bodyR,{n:15,rows:7,size:.42,seed:31,mat:(t,u,r,k)=>under(t)?((r+k)%3?pale:bar):FM[(r+k)%4]});
  const chR=[[-.3,.7,.76],[.1,.68,.8,0,-.06],[.5,.5,.6,0,-.1],[.8,.3,.36,0,-.08]];Mm('chest',G('ch',()=>svLoftZ(chR,12)),sl3);
  zc('chest','chestC',chR,{n:15,rows:5,size:.4,seed:32,mat:(t,u,r,k)=>under(t)?((r*2+k)%3?pale:bar):FM[(r+k)%4]});
  Mm('chest',G('kl',()=>svLoftZ([[-.2,.1,.3],[.3,.12,.34],[.7,.06,.2]],6)),pale,0,-.56,0);   // the keel
  // ---------------- neck, head: a ruff, a flat fierce skull, brow ridges, the hooked beak ----------------
  const nkP=[[0,-.15,-.1],[0,.25,.08],[0,.72,.3]];Mm('neck',G('nk',()=>svTube(nkP,[[.42,.46],[.3,.34],[.24,.27]],9)),sl3);
  for(let r=0;r<4;r++)for(let k=0;k<9;k++){const a=k/9*6.283+r*.35,u=r/3,y=.0+u*.6,z=-.04+u*.3,rd=.42-u*.16;Mm('neck',plate,r==0?pale:FM[(r+k)%4],Math.sin(a)*rd,y,z+Math.cos(a)*rd,Math.cos(a)*.9-.25,a,0,.3,.42,.3)}
  const hdR=[[-.3,.2,.2],[-.08,.27,.24,0,.02],[.18,.25,.2,0,0],[.4,.17,.14,0,-.03]];Mm('head',G('hd',()=>svLoftZ(hdR,9)),sl);
  Mm('head',G('cp',()=>svLump(.2,1,.1,91)),pale,0,.06,-.06,0,0,0,1.25,.7,1.3);
  [-1,1].forEach(s=>{Mm('head',G('bw',()=>svHorn(.06,.36,0,-.04,4,3)),sl3,s*.17,.19,.0,.15,s*.22,0,1.5,.8,1);
    Mm('head',ball(1,.075,1),dark,s*.2,.1,.2,0,0,0,1,.9,1.2);Mm('head',G('ey',()=>new THREE.IcosahedronGeometry(.045,1)),eye,s*.215,.1,.215);svSpr(R,'head',ML232.col,.45,s*.24,.1,.23);
    Mm('head',G('ck',()=>svHorn(.05,.3,0,0,4,2)),pale,s*.2,-.02,.1,.2,Math.PI+s*.5,0)});
  // upper beak: a deep gold hook; the cere; lower beak on the jaw
  Mm('head',G('bk',()=>svTube([[0,.04,.36],[0,.05,.62],[0,.0,.84],[0,-.12,.98],[0,-.26,.98]],[[.15,.13],[.13,.12],[.1,.1],[.06,.06],[.012,.012]],7)),gold);
  Mm('head',G('cr',()=>svLump(.11,1,.1,92)),gold2,0,.1,.4,0,0,0,1.2,.6,1);Mm('jaw',G('jw',()=>svLoftZ([[-.14,.13,.05],[.3,.11,.05],[.58,.06,.03],[.68,.02,.015]],6)),gold2);
  Mm('jaw',horn('tg',.03,.3,0,.02,4,2),dark,0,.04,.16);
  // the crest: seven long plumes swept back, lightning along their shafts
  [-3,-2,-1,0,1,2,3].forEach((u,i)=>{const l=1.5-Math.abs(u)*.2;Mm('crest',quill,i%2?fB:fC,u*.045,-Math.abs(u)*.02,0,-.5-Math.abs(u)*.06,u*.16,0,.7,1,l);
    Mm('crest',G('cs',()=>new THREE.BoxGeometry(.012,.012,1)),arc,u*.045+Math.sin(u*.16)*-l*.5,.02-Math.abs(u)*.02+l*.24,-l*.44,-.5-Math.abs(u)*.06,u*.16,0,1,1,l*.9)});
  svSpr(R,'crest',ML232.col,.7,0,.4,-.7);
  // ---------------- wings: a shoulder mass, bone and muscle, coverts, long fingered primaries with burning tips ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',wg='wg'+L,wf='wf'+L,wh='wh'+L;
    Mm(wg,ball(2,.36,1,.15),sl,0,0,0,0,0,0,1.2,.9,1);Mm(wg,G('ua',()=>svTube([[0,0,0],[.8,.05,.02],[1.55,0,0]],[.24,.2,.15],7)),sl3,0,0,0,0,0,0,s,1,1);
    Mm(wf,G('fa',()=>svTube([[0,0,0],[.9,.03,.02],[1.7,0,0]],[.15,.13,.1],7)),sl3,0,0,0,0,0,0,s,1,1);Mm(wh,G('ha',()=>svTube([[0,0,0],[.7,0,0],[1.3,0,-.05]],[.1,.07,.03],6)),sl3,0,0,0,0,0,0,s,1,1);
    // feathers: [joint, count, span, first length, last length, sweep at the tip]
    [[wg,6,1.55,1.5,1.9,.0],[wf,7,1.7,1.9,2.4,.15],[wh,7,1.3,2.4,2.9,.75]].forEach(([j,n,span,l0,l1,sw],wi)=>{for(let k=0;k<n;k++){const u=(k+.5)/n,x=s*u*span,l=l0+(l1-l0)*u,yaw=s*(wi==2?u*sw+.1:sw*u);
        Mm(j,quill,[fA,fC,fB][(k+wi)%3],x,-.03-(k%2)*.02,-.08,.06+(k%2)*.04,yaw,s*-.04,1.35,1,l);                          // flight feather
        Mm(j,quill,k%2?fB:fA,x,.05,-.02,-.1,yaw*.6,0,1.6,1,l*.5);                                                         // covert over it
        if(k%2==0)Mm(j,quill,fP,x,-.09,-.06,.16,yaw,0,1.3,1,l*.42);                                                      // pale lining under
        if(wi==2&&k>1){Mm(j,quill,arc,x+Math.sin(yaw)*-l*.86,-.045,-.08-Math.cos(yaw)*l*.86,.06,yaw,0,1.0,1,l*.16);        // the burning tip
          if(k%2)svSpr(R,j,ML232.col,.45,x+Math.sin(yaw)*-l,-.03,-.08-Math.cos(yaw)*l)}}});
    for(let k=0;k<5;k++)Mm(wg,plate,FM[k%4],s*(.1+k*.3),.14,-.02,-1.3,0,0,.42,.5,.4)});
  // ---------------- legs: feathered thighs, scaled gold shanks, four black talons each ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',th='th'+L,kn='kn'+L,ft='ft'+L;
    const tR=[[.2,.36,.4],[-.3,.3,.34],[-.85,.14,.16]];Mm(th,G('tg',()=>svLoft(tR,9)),sl3);wk232Cover(R,th,tR,plate,{n:9,rows:5,size:.3,lift:.3,seed:40+s,mat:(t,u,r,k)=>u<.3?pale:FM[(r+k)%4]});
    Mm(kn,G('sk',()=>svLoft([[.05,.12,.13],[-.5,.09,.1],[-.95,.1,.11]],7)),gold);for(let k=0;k<5;k++)Mm(kn,G('sc',()=>svLoft([[-.04,.11,.05],[.04,.12,.05]],6,{cap:false})),gold2,0,-.15-k*.16,.07);
    Mm(ft,ball(3,.15,1,.1),gold2,0,.02,0);
    [[0,1],[.75,.9],[-.75,.9],[Math.PI,.75]].forEach(([a,l])=>{Mm(ft,G('to',()=>svTube([[0,0,0],[0,-.03,.3],[0,-.08,.55]],[.07,.06,.045],5)),gold,0,0,0,0,a,0,1,1,l);
      Mm(ft,horn('tl',.05,.4,0,-.2,5,4),claw,Math.sin(a)*.55*l,-.08,Math.cos(a)*.55*l,.15,a,0)})});
  // ---------------- tail: a fan of nine long feathers, dark bars, pale tips ----------------
  Mm('tail0',G('tb',()=>svLoftZ([[-.5,.26,.12],[0,.34,.2]],8)),sl3);
  for(let k=0;k<9;k++){const u=(k-4)/4;Mm('tail1',quill,[fA,fC,fB][k%3],u*.16,-Math.abs(u)*.03,.1,.05,u*.5,0,1.25,1,2.3-Math.abs(u)*.3);Mm('tail1',quill,fP,u*.16+Math.sin(u*.5)*-1.9,-.04-Math.abs(u)*.03,.1-Math.cos(u*.5)*1.9,.05,u*.5,0,1.1,1,.36)}
  if(!ML232.tris)ML232.tris=wk232Tris(R);R.headJ='head'}
// ---------------- poses (offsets from rest: [rx, ry, rz, px, py, pz]). Wings: wg rz + lifts the left wing; wg/wf/wh ry folds / spreads. ----------------
// The rest pose is wings half open. 'fold' tucks them (the idle and walk), 'open' spreads them wide.
var ML232P={
  idle:{wgL:[0,-.5,-.5],wfL:[0,1.1,0],whL:[0,-1.2,0],wgR:[0,.5,.5],wfR:[0,-1.1,0],whR:[0,1.2,0]},
  cRec:{hips:[.04,0,0,0,-.05,0],wgL:[0,-.4,-.4],wfL:[0,.9,0],whL:[0,-1.0,0],wgR:[0,.4,.4],wfR:[0,-.9,0],whR:[0,1.0,0]},
  open:{hips:[-.2,0,0],neck:[-.2,0,0],wgL:[0,.25,.75],wfL:[0,-.8,0],whL:[0,1.1,0],wgR:[0,-.25,-.75],wfR:[0,.8,0],whR:[0,-1.1,0],tail1:[-.3,0,0]},
  // Talon Rake: one foot drawn up, wings out for balance; the kick forward; then the beak raised and driven down
  rkUp:{hips:[-.45,0,.12,0,.1,-.1],neck:[.2,0,0],head:[.15,0,0],thL:[-.9,0,0],knL:[1.3,0,0],ftL:[-.6,0,0],wgL:[0,.1,.5],wfL:[0,-.5,0],whL:[0,.8,0],wgR:[0,-.1,-.5],wfR:[0,.5,0],whR:[0,-.8,0]},
  rkCut:{hips:[-.3,0,-.1,0,0,.35],neck:[.3,0,0],head:[.1,0,0],thL:[-1.5,0,0],knL:[.3,0,0],ftL:[.5,0,0],wgL:[0,-.2,.2],wfL:[0,.4,0],wgR:[0,.2,-.2],wfR:[0,-.4,0],tail0:[.3,0,0]},
  pkUp:{hips:[-.3,0,0,0,.06,-.1],neck:[-.75,0,0],head:[-.5,0,0],jaw:[.5,0,0],wgL:[0,.1,.6],wfL:[0,-.5,0],whL:[0,.8,0],wgR:[0,-.1,-.6],wfR:[0,.5,0],whR:[0,-.8,0]},
  peck:{hips:[.4,0,0,0,-.25,.4],neck:[.9,0,0],head:[.5,0,0],jaw:[.15,0,0],thL:[-.3,0,0],thR:[-.3,0,0],knL:[.4,0,0],knR:[.4,0,0],wgL:[0,-.3,-.2],wfL:[0,.8,0],wgR:[0,.3,.2],wfR:[0,-.8,0],tail0:[-.4,0,0]},
  // Wing Buffet: wings hauled back and up, then clapped forward
  bfUp:{hips:[-.35,0,0,0,.1,-.2],chest:[-.2,0,0],neck:[.1,0,0],wgL:[0,.75,.8],wfL:[0,-.7,0],whL:[0,1.2,0],wgR:[0,-.75,-.8],wfR:[0,.7,0],whR:[0,-1.2,0],tail1:[-.4,0,0]},
  buff:{hips:[.15,0,0,0,-.1,.2],chest:[.2,0,0],neck:[.25,0,0],wgL:[0,-1.15,-.1],wfL:[0,-.6,0],whL:[0,1.0,0],wgR:[0,1.15,.1],wfR:[0,.6,0],whR:[0,-1.0,0],tail1:[.3,0,0]},
  // Tail Sweep: she turns her back and fans the tail round
  tlWind:{hips:[.1,.7,0,0,-.1,0],neck:[0,-.8,0],head:[0,-.4,0],tail0:[-.2,.9,0],tail1:[0,.5,0],wgL:[0,-.5,-.3],wfL:[0,1.0,0],whL:[0,-1.0,0],wgR:[0,.3,.6],wfR:[0,-.6,0],whR:[0,.9,0]},
  tlWhip:{hips:[.1,-.9,0,0,-.15,0],neck:[0,.8,0],head:[0,.4,0],tail0:[-.2,-1.1,0],tail1:[0,-.6,0],wgL:[0,.3,.6],wfL:[0,-.6,0],whL:[0,.9,0],wgR:[0,.5,.3],wfR:[0,-1.0,0],whR:[0,1.0,0]},
  // flight: the crouch, the leap (wings up), the hover beat down, the stoop (wings folded, talons out), the landing
  crouch:{hips:[.25,0,0,0,-.5,0],neck:[.2,0,0],thL:[-.6,0,0],knL:[1.0,0,0],ftL:[-.4,0,0],thR:[-.6,0,0],knR:[1.0,0,0],ftR:[-.4,0,0],wgL:[0,.3,.9],wfL:[0,-.7,0],whL:[0,1.0,0],wgR:[0,-.3,-.9],wfR:[0,.7,0],whR:[0,-1.0,0]},
  flyUp:{root:[0,0,0,0,5.0,0],hips:[-.5,0,0],neck:[.3,0,0],thL:[.5,0,0],knL:[.5,0,0],thR:[.5,0,0],knR:[.5,0,0],wgL:[0,.3,1.1],wfL:[0,-.8,.2],whL:[0,1.1,0],wgR:[0,-.3,-1.1],wfR:[0,.8,-.2],whR:[0,-1.1,0],tail1:[-.4,0,0]},
  flyDn:{root:[0,0,0,0,4.6,0],hips:[-.35,0,0],neck:[.2,0,0],thL:[.5,0,0],knL:[.5,0,0],thR:[.5,0,0],knR:[.5,0,0],wgL:[0,.3,-.25],wfL:[0,-.8,-.25],whL:[0,1.1,0],wgR:[0,-.3,.25],wfR:[0,.8,.25],whR:[0,-1.1,0],tail1:[.2,0,0]},
  stoop:{root:[0,0,0,0,2.4,0],hips:[.8,0,0],neck:[-.3,0,0],head:[-.2,0,0],thL:[-1.2,0,0],knL:[.5,0,0],ftL:[.6,0,0],thR:[-1.2,0,0],knR:[.5,0,0],ftR:[.6,0,0],wgL:[0,-.6,.5],wfL:[0,1.1,0],whL:[0,-1.2,0],wgR:[0,.6,-.5],wfR:[0,-1.1,0],whR:[0,1.2,0],tail0:[.6,0,0]},
  land:{hips:[.3,0,0,0,-.6,0],neck:[.3,0,0],thL:[-.7,0,0],knL:[1.2,0,0],ftL:[-.5,0,0],thR:[-.7,0,0],knR:[1.2,0,0],ftR:[-.5,0,0],wgL:[0,.2,.5],wfL:[0,-.6,0],whL:[0,1.0,0],wgR:[0,-.2,-.5],wfR:[0,.6,0],whR:[0,-1.0,0]},
  // Feather Volley: wings swept up and back, then whipped forward and down
  vArch:{hips:[-.3,0,0,0,.08,-.1],neck:[-.2,0,0],wgL:[0,.6,1.0],wfL:[0,-.8,0],whL:[0,1.2,0],wgR:[0,-.6,-1.0],wfR:[0,.8,0],whR:[0,-1.2,0],tail1:[-.4,0,0]},
  vSnap:{hips:[.25,0,0,0,-.1,.15],neck:[.3,0,0],wgL:[0,-.9,-.35],wfL:[0,-.7,0],whL:[0,1.1,0],wgR:[0,.9,.35],wfR:[0,.7,0],whR:[0,-1.1,0],tail1:[.3,0,0]},
  // the screech (intro, Phase II, Thunderclap): body upright, wings full, beak wide to the sky
  scr:{hips:[-.5,0,0,0,.15,0],chest:[-.15,0,0],neck:[-.5,0,0],head:[-.6,0,0],jaw:[.8,0,0],crest:[-.5,0,0],wgL:[0,.2,.95],wfL:[0,-.85,0],whL:[0,1.2,0],wgR:[0,-.2,-.95],wfR:[0,.85,0],whR:[0,-1.2,0],tail1:[-.5,0,0]},
  // brought down: sprawled, one wing out; dead
  stag:{hips:[.5,.15,.2,0,-1.2,0],neck:[.7,.3,0],head:[.4,.3,.3],jaw:[.4,0,0],thL:[-1.2,0,0],knL:[1.6,0,0],thR:[-1.0,0,0],knR:[1.5,0,0],wgL:[0,.2,-.5],wfL:[0,-.5,-.2],whL:[0,.9,0],wgR:[0,.6,.2],wfR:[0,-1.0,0],whR:[0,1.1,0],tail0:[.3,.3,0]},
  dead:{root:[0,0,0,0,-1.5,0],hips:[.5,0,1.2,.5,0,0],neck:[.6,.6,0],head:[.3,.4,0],jaw:[.5,0,0],thL:[-.6,0,0],knL:[.8,0,0],thR:[.3,0,0],knR:[.6,0,0],wgL:[0,.3,.9],wfL:[0,-.6,0],whL:[0,1.0,0],wgR:[0,.5,.4],wfR:[0,-1.0,0],whR:[0,1.1,0]}};
// ---------------- procedural layer: breathing, a strutting walk, wingbeats while airborne, crest and tail, head tracking ----------------
function ml232Loco(e,S,O,dt,now){const t=now/1000,sp=S.spd||0,a=Math.min(1,sp/2.4);S.gp=(S.gp||0)+dt*(1.8+sp*2.0);const g=S.gp,br=Math.sin(t*1.4);
  O.hips[4]+=.03*br+.08*Math.abs(Math.sin(g))*a;O.chest[0]+=.025*br;O.neck[0]+=.03*br-.12*Math.sin(g*2)*a;O.head[0]+=.1*Math.sin(g*2)*a;
  ['L','R'].forEach((s,j)=>{const ph=g+j*Math.PI,sw=Math.sin(ph),lf=Math.max(0,Math.cos(ph));O['th'+s][0]+=sw*.45*a;O['kn'+s][0]+=lf*.7*a;O['ft'+s][0]+=-lf*.4*a;
    const sg=j?-1:1;O['wg'+s][2]+=sg*(.03*br+.04*Math.sin(g)*a)});
  O.hips[2]+=Math.sin(g)*.05*a;O.tail0[1]+=Math.sin(g)*.08*a+Math.sin(t*.9)*.05;O.tail1[0]+=.04*br;O.crest[0]+=.06*Math.sin(t*2.3)+.04*br;
  // out of moves the wings fold (the rest pose is half open, which the move poses are written against)
  S.fold=(S.fold==null?1:S.fold)+((S.mv||S.stg>0?0:1)-(S.fold==null?1:S.fold))*Math.min(1,dt*4);{const I=ML232P.idle,f=S.fold;for(const k in I){const v=I[k];O[k][0]+=v[0]*f;O[k][1]+=v[1]*f;O[k][2]+=v[2]*f}}
  // airborne (a pose lifted her root): the wings beat
  if((S.air||0)>.02){const w=Math.sin(t*9)*.55*S.air;O.wgL[2]+=w;O.wgR[2]-=w;O.wfL[2]+=w*.5;O.wfR[2]-=w*.5;O.tail1[0]+=.1*Math.sin(t*9+1)*S.air}
  const m=e.m,hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,yaw=svAng(Math.atan2(hx,hz)-m.rotation.y),k=S.mv?0:(Math.abs(yaw)<1.6?1:0);
  S.hy=(S.hy||0)+((Math.max(-.8,Math.min(.8,yaw))*k)-(S.hy||0))*Math.min(1,dt*4);O.head[1]+=S.hy*.6;O.neck[1]+=S.hy*.4;
  // quick bird-like head tilts
  const tl=Math.sin(t*.7)>.6?.25*Math.sin(t*5):0;O.head[2]+=tl*(S.mv?0:1)}
// after the pose: the lightning in crest and wingtips flickers (stronger in Phase II and while charging), sparks jump
function ml232Post(e,S,dt,now){const R=S.R,t=now/1000,ph2=S.ph>1,ch=S.chg||0;S.air=Math.max(0,Math.min(1,(R.J.root.position.y)/3));
  const fl=.5+.5*Math.sin(t*23)*Math.sin(t*7.3);R.arc.emissiveIntensity=(ph2?1.3:.6)+fl*(ph2?.9:.35)+ch*1.6;R.eyeM.color.setHex(ch>.3||ph2?0xffffff:0xdff6ff);
  if(!S.dieM&&Math.random()<dt*(ph2?9:3)+ch*dt*14){const js=['whL','whR','crest','wfL','wfR'],j=js[(Math.random()*js.length)|0],sx=j[2]=='L'?1:j[2]=='R'?-1:0;
    const p=svWP(e,j,sx*(.4+Math.random()*.9),0,j=='crest'?-.6:-1.2-Math.random()*1.4);burst(p,ML232.bolt,1,.5,.3,.3)}}
ML232.sheet.boss=()=>{const R=svRig();ml232Build(R,null);svRest(R);svMerge(R);return R.root};
