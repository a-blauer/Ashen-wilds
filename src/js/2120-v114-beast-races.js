// ================= v114: the five beasts — rat (Warrior), cat (Assassin), raven (Mage, v134), badger (Paladin), weasel (Ranger) =================
// Each entry: proportions (`pre` v99 preset, `shear` hunch, `crouch` [hip, knee]), body ring multipliers (`TR`, `armK`, `legK`,
// `foot`), skull rings `SN` (back → front: [z, y centre, half-width, top, underside]), eye and ear positions, the tail path
// `TP`, paw / toe recipes, colours (`cols(look)`), and `head(B,P,o)` that builds the face. Helm fitting values: `muzzleZ`
// (where cheek guards end), `hoodZ` (where a hood's front edge sits), `crownZ` (crest / band centre), `hatZ`, `bandY/Z`.
function brPal(L,o){const f=mdC(L.skin),e=mdC(L.eye);return Object.assign({FUR:f,FURD:mdSh(f,.66),FURL:mdMix(f,0xe8e0d4,.22),BELLY:mdMix(f,0xd8ccbc,.38),PINK:0xb88a86,PINKD:0x8a6460,TOOTH:0xd8c890,CLAW:0x1e1a16,EYE:e,MOUTH:0x2a2220,NOSE:0x3a2424},o||{})}
// generic ear rim for helmets: a ring round each ear opening
function brEarRim(D,k,c,t,S){if(!D.EAR)return;const [x,y,z]=D.EAR,r=D.earR||.032,s2=S||[1,1,1];[-1,1].forEach(s=>k.p('head','ring',t||'m',c,s*(x-.002),y-.03,z,r*.95*s2[0],.07*s2[1],r*.75*s2[2],0,0,-s*.38))}
// ======================================================== 1 · RAT (Warrior) ========================================================
// A proper rat skull: a rounded brain case, a brow, whisker pads that bulge at the cheeks, a muzzle that drops from the brow
// to a blunt nose, a lower jaw with the incisors, big thin cupped ears, beady eyes high on the skull.
brDef(1,{key:'rat',n:'Rat',cls:'warrior',furN:'Fur',
  fur:['#5e5248','#3a3230','#77695c','#8a6a4a','#a89c8e','#e6e0d6'],eye:['#c8301c','#e0a020','#78d040','#9a40e0','#e8e8f0'],
  cols:L=>brPal(L),
  pre:{pelvis:[1.2,1,1.12],spine:[.95,.95,1.1],chest:[.82,.95,1],neck:[1,.5,1],head:.95,arm:[.95,.85],hand:1.3,leg:[1,1.05],foot:1,cape:[1.15,1]},
  shear:{spine:.2,chest:.36,neck:.4},crouch:[.36,.66],pose:{sp:.13,ch:.08,shx:-.35,el:-.6},run:{sp:.1,shx:-.2},look:[.1,0],
  TR:[[1.03,1.06,1.07,1.05,1.02,.93,.94,.97,.94,.85,1.13,1.2],[1.05,1.14,1.16,1.23,1.19,1.05,.92,.92,.98,1,1.1,1.14],[1.05,1.05,1.05,1.07,1.09,1.1,1.1,1.11,1.1,1,1.14,1.16]],
  armK:[.86,.86,.82,.8,.82,.74],legK:[1.22,1.28,1.18,.98,.88,.76,.7],foot:{len:1.15,w:.78,h:.82},
  SN:[[-.11,1.16,.045,.045,.045],[-.08,1.168,.088,.085,.08],[-.04,1.176,.106,.1,.092],[0,1.174,.108,.095,.096],[.04,1.164,.1,.08,.094],[.075,1.15,.082,.062,.08],[.105,1.137,.062,.046,.06],[.13,1.126,.047,.034,.045],[.155,1.118,.035,.026,.033],[.175,1.112,.025,.018,.022],[.19,1.108,.015,.011,.014]],
  EYEP:[.065,1.176,.055],EAR:[.078,1.258,-.05],earR:.034,earE:[.078,1.258,-.05,.054,.06,.013,-.2,.55,.38],muzzleZ:.15,hoodZ:.04,crownZ:-.04,
  TP:[[0,.62,-.07,.052],[0,.6,-.15,.043],[0,.56,-.25,.035],[.008,.49,-.37,.029],[.02,.39,-.48,.025],[.035,.27,-.58,.021],[.05,.16,-.66,.018],[.065,.08,-.74,.015],[.08,.045,-.83,.012],[.1,.034,-.92,.01],[.12,.036,-1.0,.008],[.145,.05,-1.07,.006],[.17,.07,-1.12,.003]],
  tailCol:(m,C)=>m.i<1.2?C.FUR:m.i<1.8?mdMix(C.FUR,C.PINK,.5):Math.floor(m.i*2)%2?C.PINK:mdSh(C.PINK,.9),
  paw:{n:4,len:[.028,.033,.032,.026],claw:.011,spread:.0112},toes:{n:4,len:.045,claw:.018},
  earRim:(k,c,t)=>brEarRim(BRD[1],k,c,t),earPocket:(k,c,off)=>[-1,1].forEach(s=>{const [x,y,z]=BRD[1].EAR;k.p('head','sph2','c',c,s*(x+.006),y+.004,z-.006,.07,.078,.03,-.2,s*.55,s*.38)}),
  head(B,P,o){const D=this,C=BR.C,k=dkKit();P.head={w:.96,jaw:.82,top:1,len:.96,fwd:-.012};const H=P._H=mdHeadR(P);
    brSkull(B,D,m=>{const z=m.r.p[2];if(m.s<-.55&&z>-.03)return C.BELLY;if(m.s<-.25&&z>.0)return C.FURL;if(m.s>.5&&z<.06)return C.FURD;return C.FUR});
    brJaw(B,D,.06,.165,C.BELLY,{h:.9});
    brNose(k,D,C.PINK,1);brEyes(k,D,{sz:1.05,fw:.9});
    // incisors below the nose, whiskers from the pads
    [-1,1].forEach(s=>k.p('head','box','c',C.TOOTH,s*.0042,1.088,.172,.0075,.016,.005,.12,0,0));brWhiskers(k,D,.13,1.12,4,.12);
    // ears: big, round, thin and cupped, pink inside; they always stand (helmets have openings for them)
    [-1,1].forEach(s=>{const [x,y,z]=D.EAR;k.p('head','sph2','c',C.FUR,s*x,y,z,.054,.06,.013,-.2,s*.55,s*.38);k.p('head','sph2','c',C.PINK,s*(x+.003),y-.003,z+.006,.042,.048,.007,-.2,s*.55,s*.38)});
    mdKit(B,k);return H}});
// ======================================================== 2 · CAT (Assassin) ========================================================
// A lithe cat: round skull, short muzzle with full cheeks, big forward-set eyes with slit pupils, tall pointed ears, a long
// furred tail carried high; soft paws with pads and small claws; a light crouch on long legs.
brDef(2,{key:'cat',n:'Cat',cls:'assassin',furN:'Fur',
  fur:['#2a2628','#5a5a60','#9a9aa0','#b86a2a','#6a4a30','#e8e4dc'],eye:['#e0b020','#78c040','#50a0e0','#c87020','#e8e8f0'],
  cols:L=>brPal(L,{PINK:0xc08a90,PINKD:0x9a6a70}),
  pre:{pelvis:[.9,1,.9],spine:[.82,1.15,.88],chest:[.82,1.05,.95],neck:[.9,1.1,.9],head:.92,arm:[1,.72],hand:.95,leg:[1.1,.9],foot:.95,cape:[1.1,1]},
  shear:{spine:.08,chest:.16,neck:.2},crouch:[.28,.56],pose:{sp:.08,ch:.04,shx:-.15,el:-.3},run:{sp:.14,shx:-.1},look:[.06,0],
  TR:[[1.05,1.04,1,.9,.86,.86,.9,.92,.9,.95,1.1,1.15],[1.02,1.05,1.05,1.02,1,1.02,1.05,1.02,1,1,1.1,1.12],[1.04,1.04,1.04,1.02,1.02,1.04,1.06,1.06,1.02,1,1.1,1.12]],
  armK:[.88,.88,.84,.8,.82,.76],legK:[1.22,1.26,1.12,.92,.8,.72,.68],foot:{len:1.05,w:.8,h:.75},
  // v135: the head remade — a rounder brain case, broad cheeks, a short blunt muzzle (14 rings, lofted with 22 sides)
  SN:[[-.105,1.16,.04,.04,.04],[-.085,1.168,.075,.07,.068],[-.06,1.175,.098,.088,.086],[-.03,1.18,.112,.096,.096],[0,1.18,.12,.094,.1],[.025,1.176,.122,.086,.1],
    [.045,1.17,.118,.074,.096],[.062,1.162,.1,.06,.086],[.074,1.154,.08,.048,.074],[.085,1.148,.064,.04,.062],[.095,1.144,.056,.035,.054],[.104,1.141,.05,.03,.046],[.111,1.14,.042,.025,.036],[.116,1.14,.028,.017,.022]],
  EYEP:[.052,1.18,.07],EAR:[.074,1.272,-.04],earR:.046,earE:[.074,1.272,-.04,.044,.054,.018,-.12,.12,-.3],muzzleZ:.095,hoodZ:.03,crownZ:-.04,hatZ:-.05,
  TP:[[0,.6,-.06,.038],[0,.58,-.16,.036],[0,.55,-.27,.034],[0,.52,-.38,.032],[.01,.5,-.49,.03],[.02,.51,-.59,.029],[.03,.55,-.68,.028],[.04,.62,-.76,.027],[.05,.7,-.82,.025],[.06,.78,-.86,.022],[.07,.86,-.88,.018],[.08,.93,-.89,.012],[.09,.98,-.89,.006]],
  tailCol:(m,C)=>m.i>10?C.FURD:Math.floor(m.i)%3==2?C.FURD:C.FUR,tailSway:[.08,.08,1.2,2.4],
  paw:{n:4,len:[.02,.022,.022,.019],claw:.006,pad:true,curl:1.2,spread:.011,colOf:C=>C.FUR},handCol:C=>C.FUR,
  toes:{n:4,len:.03,claw:.008,pad:true,dew:false,colOf:C=>C.FUR},
  earRim:(k,c,t)=>brEarRim(BRD[2],k,c,t,[1.1,1.3,1]),earPocket:(k,c,off)=>[-1,1].forEach(s=>{const [x,y,z]=BRD[2].EAR;k.p('head','cone4','c',c,s*(x+.006),y+.012,z-.004,.062,.128,.044,-.12,s*.12,-s*.3)}),
  head(B,P,o){const D=this,C=BR.C,k=dkKit();P.head={w:1,jaw:.9,top:1,len:.9,fwd:-.01};const H=P._H=mdHeadR(P);
    // v135 remade head: a round skull lofted with more sides, broad cheeks with ruffs, puffy whisker pads, a small chin, a pink
    // triangle nose, big almond eyes set forward with slit pupils, tall wide ears with tufts of fur inside
    brSkull(B,D,m=>{const z=m.r.p[2];if(m.s<-.45&&z>-.01)return C.BELLY;if(m.s<-.15&&z>.07)return C.FURL;
      if(m.s>.55&&z<.03&&z>-.08&&Math.abs(Math.sin(z*95))>.72)return C.FURD; // forehead stripes
      return C.FUR},{seg:22});
    brJaw(B,D,.064,.108,C.BELLY,{h:.7,w:.8});
    // whisker pads (two soft lobes) and the chin under them
    [-1,1].forEach(s=>k.p('head','sph2','c',C.FURL,s*.021,1.131,.104,.027,.022,.019,0,s*.35,0));
    k.p('head','sph2','c',C.BELLY,0,1.111,.098,.02,.013,.014);
    // nose: a small pink triangle on the bridge, nostril line, the mouth's inverted Y between the pads
    const tip=D.SN[D.SN.length-1];k.p('head','cone4','c',C.PINK,0,tip[1]+.008,tip[0]+.008,.013,.01,.009,Math.PI*.5);
    k.p('head','box','c',mdSh(C.PINK,.7),0,tip[1]+.001,tip[0]+.012,.012,.002,.002);
    k.p('head','box','c',C.MOUTH,0,tip[1]-.011,tip[0]+.006,.0022,.012,.003);[-1,1].forEach(s=>k.p('head','box','c',C.MOUTH,s*.008,tip[1]-.02,tip[0]+.007,.011,.0022,.003,0,0,s*.5));
    brCatEyes135(k,D,C);
    brWhiskers(k,D,.1,1.134,4,.18);
    // cheek ruffs: tufts of fur pointing down and back below the eyes
    [-1,1].forEach(s=>[[.03,1.135,0,.04],[.012,1.122,-.25,.034],[-.008,1.132,-.45,.028]].forEach(([z,y,a,l])=>{const x=brSurfX(D,z,y)-.006;
      k.p('head','cone4','c',C.FURL,s*x,y,z,.02,l,.012,Math.PI*.82+a*.3,0,s*(.9+a*.4))}));
    // tall, wide ears: fur outside, pink inside, a fur tuft at the base inside, dark tips
    [-1,1].forEach(s=>{const [x,y,z]=D.EAR;k.p('head','cone4','c',C.FUR,s*x,y,z,.046,.1,.018,-.12,s*.12,-s*.3);k.p('head','cone4','c',C.PINK,s*(x+.002),y-.01,z+.011,.03,.072,.008,-.12,s*.12,-s*.3);
      k.p('head','cone4','c',C.FURL,s*(x-.004),y-.034,z+.014,.016,.04,.006,-.05,s*.12,-s*.12);
    });
    mdKit(B,k);return H}});
// v135: the cat's eyes, set on the skull where the muzzle starts and turned to face mostly forward: a dark rim, a large almond
// iris that catches the light (unlit material), a tall slit pupil and a highlight, all laid along the surface normal
function brCatEyes135(k,D,C){const [xT,ey]=D.EYEP;let ez=.02;for(let z=.02;z<.13;z+=.001){if(brSurfX(D,z,ey)<=xT){ez=z;break}}
  const x0=brSurfX(D,ez,ey),dx=(brSurfX(D,ez+.004,ey)-brSurfX(D,ez-.004,ey))/.008,a=Math.atan2(1,-dx)*.85,rx=-.32;
  D.eyeR=.026;D.eyeFw=.62;D.eyeIns=0;D.EYEP[2]=ez;
  [-1,1].forEach(s=>{const nx=s*Math.sin(a)*Math.cos(rx),ny=-Math.sin(rx),nz=Math.cos(a)*Math.cos(rx),ry=s*a,tl=s*.32,at=d=>[s*x0+nx*d,ey+ny*d,ez+nz*d];
    let p=at(.005);k.p('head','sph2','c',mdSh(C.FURD,.55),p[0],p[1],p[2],.029,.019,.012,rx,ry,tl);
    p=at(.0105);k.p('head','sph2','g',C.EYE,p[0],p[1],p[2],.024,.0145,.007,rx,ry,tl);
    p=at(.0165);k.p('head','box','c',0x050404,p[0],p[1],p[2],.0032,.0145,.002,rx,ry,0);
    p=at(.0172);k.p('head','box','g',0xfff8e8,p[0]+s*.004,p[1]+.004,p[2],.0026,.0026,.0015,rx,ry,0);
    // a heavy upper lid over the top of the eye: a hooded, narrowed, wary look rather than a round cartoon stare
    p=at(.0125);k.p('head','sph2','c',mdSh(C.FUR,.8),p[0]-s*.002,p[1]+.0105,p[2],.028,.009,.009,rx,ry,tl+s*.18)})}
// ======================================================== 3 · RAVEN (Mage, v134; replaced the v114 frog) ========================================================
// A bipedal raven: a round feathered skull with a heavy curved beak (nasal bristles over its base, a hooked tip, the gape
// line), dark side-set eyes, shaggy throat hackles and a ruffled nape; a deep keeled chest, a thick feathered neck; arms that
// are wings (flat feathers lie along each forearm from the wrist to the elbow, like a folded wing; bare arms also carry
// coverts on the upper arm); scaly three-fingered talon hands with a thumb; feathered thighs over thin scaled shanks; bird feet with
// three forward toes and a back toe, all hooked claws; a stiff wedge tail of long feathers that pivots at the rump.
// Built with the v114 beast engine (2100): same hero skeleton retargeted, one tail bone (tl0) carrying the whole fan.
// Feathers are one shared low-poly blade (`rvFeatherG`: a flat diamond, widest near the tip, a ridge along the shaft).
var RV_FG=null,RV={helm:null};  // RV.helm: the style of the helm being built with this raven (2370)
function rvFeatherG(){if(RV_FG)return RV_FG;const g=new THREE.BufferGeometry(),
    v=[0,0,0, 0,1,0, -1,.62,0, 1,.62,0, 0,.52,1, 0,.52,-1];
  g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex([0,3,4, 0,4,2, 0,2,5, 0,5,3, 1,4,3, 1,2,4, 1,5,2, 1,3,5]);
  return RV_FG=g}
// the outermost surface round a forearm (bare arm or sleeve), measured from the vertices already built on its forearm / hand
// bones: returns rad(t, o) = how far out the surface lies at t along the forearm (from the wrist) in direction o
function rvArmR(B,a,A2,fw,FL){const b1=B.O.indexOf(a+'1'),b2=B.O.indexOf(a+'2'),pts=[];
  for(const t in B.L){const L=B.L[t],p=L.p,si=L.si,sw=L.sw,n=p.length/3;for(let v=0;v<n;v++){let w=0;for(let j=0;j<4;j++){const ix=si[v*4+j];if(ix==b1||ix==b2)w+=sw[v*4+j]}if(w<.3)continue;
    const dx=p[v*3]-A2.x,dy=p[v*3+1]-A2.y,dz=p[v*3+2]-A2.z,al=dx*fw.x+dy*fw.y+dz*fw.z;if(al<-.004||al>FL+.04)continue;pts.push(al,dx-fw.x*al,dy-fw.y*al,dz-fw.z*al)}}
  return (t,o)=>{let r=0;for(let i=0;i<pts.length;i+=4){if(Math.abs(pts[i]-t)>.014)continue;const x=pts[i+1],y=pts[i+2],z=pts[i+3],L=Math.hypot(x,y,z);if(L>1e-6&&(x*o.x+y*o.y+z*o.z)/L>.88&&L>r)r=L}return r}}
// the tip radius of a straight feather from (t0, r0) along the forearm so that it stays above the surface everywhere along it
function rvLine(rad,o,t0,len,r0,FL,m){let rt=r0*.8;for(let t=t0+.02;t<=Math.min(FL,t0+len);t+=.01){const r=rad(t,o);if(r<=0)continue;rt=Math.max(rt,r0+(r+m-r0)*len/(t-t0))}return rt}
// one feather on bone bn: from base along dir, flat side facing nrm; len, half-width w, half-thickness th
function rvFeather(k,bn,col,base,dir,nrm,len,w,th,t,wt){const V=THREE.Vector3,y=new V(...dir).normalize(),z=new V(...nrm);z.sub(y.clone().multiplyScalar(z.dot(y))).normalize();
  const x=new V().crossVectors(y,z),m=new THREE.Matrix4().makeBasis(x.multiplyScalar(w),y.multiplyScalar(len),z.multiplyScalar(th||.004));m.setPosition(new V(...base));
  const p={bn,geo:rvFeatherG(),t:t||'c',col,m};if(wt)p.w=wt;k.P.push(p);return p}
// a feather direction turned by yaw (about y) then pitch (down from horizontal)
function rvDir(yaw,pitch){return [Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)]}
brDef(3,{key:'raven',n:'Raven',cls:'mage',furN:'Plumage',
  fur:['#2a2c35','#262232','#30333a','#3a3029','#5c5e64','#d8d6d0'],eye:['#3a2414','#0e0c0c','#d0a030','#9ec4e0','#9a40e0'],
  cols:L=>{const f=mdC(L.skin),pale=(((f>>16)&255)+((f>>8)&255)+(f&255))>480;
    return brPal(L,{FURD:mdSh(f,.62),FURL:mdMix(f,0x6c78c8,pale?.08:.34),BELLY:mdMix(f,0x8a8a90,.05),
      BEAK:pale?0xb8b4ac:mdMix(0x26262c,f,.2),BEAKL:pale?0xd0ccc4:mdMix(0x3a3c46,f,.15),MOUTH:0x0c0c0e,NOSE:0x101012,
      SCALE:pale?0xa8a49c:mdMix(0x2e2e34,f,.2),SCALED:pale?0x8a867e:mdMix(0x1e1e22,f,.2),CLAW:0x0c0c0e,PINK:pale?0xa8a49c:mdMix(0x2e2e34,f,.2)})},
  // upright but leaning: narrow hips, a deep chest, a thick short neck, long wing-arms, long thin legs
  pre:{pelvis:[.86,1,.92],spine:[.86,1.02,.98],chest:[.96,1.02,1.12],neck:[1.1,1.12,1.1],head:1.12,arm:[1.12,.84],hand:1.05,leg:[1.22,.84],foot:1.05,cape:[1.15,1]},
  shear:{spine:.12,chest:.24,neck:.28},crouch:[.34,.66],pose:{sp:.1,ch:.05,shx:-.22,el:-.5},run:{sp:.14,shx:-.3,el:-.2},look:[.05,0],atk:{shz:.3,shx:-.15},
  // torso rings (hips → neck): the keel bulges forward at the breast, the neck ruff is thick
  TR:[[.88,.88,.87,.9,.98,1.05,1.04,.94,.9,1.04,1.06,1.06],[.95,1,1.06,1.12,1.2,1.25,1.22,1.12,1.04,1.08,1.1,1.08],[.98,1,1,1,1.02,1.06,1.1,1.1,1.04,1.04,1.06,1.06]],
  armK:[.9,.9,.86,.8,.78,.7],legK:[1.04,1.12,1.06,.72,.5,.44,.4],foot:{len:.32,w:.58,h:.62},
  // skull + beak, back → front: [z, y centre, half-width, top, underside]
  SN:[[-.108,1.162,.04,.04,.04],[-.088,1.166,.074,.072,.066],[-.058,1.17,.094,.09,.084],[-.022,1.172,.1,.094,.09],[.014,1.168,.095,.087,.088],
      [.044,1.158,.078,.07,.078],[.066,1.146,.052,.06,.06],[.088,1.141,.042,.052,.048],[.114,1.136,.034,.044,.037],[.14,1.129,.027,.036,.028],
      [.164,1.119,.02,.028,.019],[.184,1.106,.014,.021,.011],[.198,1.09,.009,.014,.006],[.206,1.072,.004,.007,.003]],
  EYEP:[.07,1.176,.03],EAR:null,muzzleZ:.066,hoodZ:-.004,crownZ:-.05,hatZ:-.06,bandY:1.2,bandZ:-.04,
  TP:[[0,.62,-.09,.04],[0,.5,-.24,.04],[0,.38,-.38,.03]],tailSway:[.025,.04,1.1,2.2],
  tailCol:(m,C)=>C.FUR,
  paw:{n:3,len:[.034,.04,.035],rad:.95,claw:.017,spread:.0125,palm:.95,plen:1,curl:1.1,thumb:true,tlen:.022,pad:true,colOf:C=>C.SCALE,padColOf:C=>C.SCALED},handCol:C=>C.SCALE,
  toes:{n:3,len:.085,claw:.02,colOf:C=>C.SCALE,padColOf:C=>C.SCALED},
  paint(P,C){const row=m=>((m.y*34+Math.abs(m.x)*18)%1)<.24;
    P.paint.torso=m=>m.s<-.45&&m.y>.78?C.FURL:m.s>.4&&m.y<.68?C.FURD:m.s>.3&&m.y>.84?C.BELLY:C.FUR;
    P.paint.torsoLo=m=>m.s>.45?C.FURD:C.FUR;
    P.paint.leg=(m,s)=>{const pt=m.r.part;if(pt=='hip'||pt=='thigh')return row(m)?C.FURD:C.FUR;if(pt=='knee')return C.FUR;
      return Math.floor(m.y*70)%2?C.SCALE:C.SCALED};
    P.paint.fore=m=>m.r.part=='wrist'?C.FURD:C.FUR;P.paint.sleeve=m=>m.s<-.3?C.FURL:C.FUR},
  head(B,P,o){const D=this,C=BR.C,k=dkKit();P.head={w:1,jaw:.9,top:1,len:1,fwd:-.01};const H=P._H=mdHeadR(P);
    brSkull(B,D,m=>{const z=m.r.p[2];
      if(z>.062){ // the beak: bristles over its base, the gape line along the side, a lighter ridge on top
        if(z<.11&&m.s>.25)return C.FURD;
        return m.s>.7?C.BEAKL:C.BEAK}
      if(m.s<-.35&&z>-.04)return C.BELLY;if(m.s>.65&&z<.02)return C.FURL;return C.FUR},{seg:14,capB:{dz:.002}});
    // nostrils under the bristles, a tuft of bristles fanning forward over the beak base
    const at=z=>brSkullAt(D,z);
    [-1,1].forEach(s=>{const q=at(.1),x=q.rx*.62;k.p('head','box','c',C.NOSE,s*x,q.yc+q.f*.55,.1,.004,.003,.008,0,s*.3,0);
      for(let i=0;i<3;i++){const z=.064+i*.012,qq=at(z),xx=s*(.008+i*.006);rvFeather(k,'head',i%2?C.FURD:C.FUR,[xx,qq.top-.004,z],[s*.08,-.18,1],[s*.25,1,0],.045-.008*i,.009,.0035)}});
    rvFeather(k,'head',C.FURD,[0,at(.06).top-.002,.06],[0,-.12,1],[0,1,0],.05,.01,.004);
    // eyes: set on the sides, a dark ring, a glossy dark eye with the iris colour, a feathered brow
    brEyes(k,D,{sz:1,fw:.3,socket:C.FURD,white:0x060606,brow:C.FURD,browY:.019});
    // hackles: shaggy lance feathers hanging from the throat, longest in the middle
    for(let r=0;r<3;r++)for(let i=-3;i<=3;i++){if(r==2&&Math.abs(i)>2)continue;const t=(i+(r==1?.5:0))/3.4,z=.03-r*.035-Math.abs(t)*.015,q=at(Math.max(-.05,z)),x=t*q.rx*.75,y=q.yc-q.b*Math.sqrt(Math.max(0,1-t*t*.56))+.006;
      rvFeather(k,'head',(i*7+r*3)%3?C.FUR:C.FURD,[x,y,z+.006],[t*.22,-1,.2-r*.1],[t*.7,.1,1],(.1-.028*Math.abs(t)-.012*r)*(1+.18*Math.sin(i*2.7+r*1.9)),.017,.004,'c',[['head',.7],['neck',.3]])}
    // the gape: a thin dark line along each side of the beak, from under the eye to near the tip
    [-1,1].forEach(sd=>{const Z=[.05,.075,.1,.13,.16,.184];for(let i=0;i+1<Z.length;i++){const p=z=>{const q=at(z),y=q.yc-q.b*.12;return [sd*(brSurfX(D,z,y)+.0008),y,z]};
      k.L('head','c',C.MOUTH,p(Z[i]),p(Z[i+1]),.0026-.0003*i,.0023-.0003*i,4)}});
    // the nape: a few loose feathers lying back over the neck (left off under any head piece, which covers the back of the head)
    if(!RV.helm)for(let i=0;i<4;i++){const z=-.06-i*.016,q=at(z),x=(i%2?1:-1)*.012*i;rvFeather(k,'head',i%2?C.FURD:C.FUR,[x,q.top-.012,z],[x*3,-.45-i*.12,-1],[0,1,-.3],.075-.006*i,.017,.004)}
    mdKit(B,k);return H},
  // the wings on the arms: flat feathers along the forearm pointing to the elbow (always), coverts on the upper arm (bare only)
  wings(B){const C=BR.C,k=dkKit(),V=THREE.Vector3,full=!!BR.bare;
    [['aL',-1],['aR',1]].forEach(([a,s])=>{const A0=mdV(HB[a+'0']),A1=mdV(HB[a+'1']),A2=mdV(HB[a+'2']),out=[s,0,0],xo=0;
      // flat wing feathers on the forearm: rooted round the outer back of the wrist, lying along the arm and pointing up to
      // the elbow like a folded wing, overlapping in two layers (on the forearm bone, so a bent wrist never pushes them in).
      // They lie on whatever covers the forearm: the bare arm, or a sleeve built before them (rvArmR measures the outermost
      // surface round the forearm from the model's own vertices), so no robe's sleeve ever covers them.
      const fw=A1.clone().sub(A2).normalize(),FL=A1.distanceTo(A2),rad=rvArmR(B,a,A2,fw,FL);
      for(let i=0;i<7;i++){const t=i/6,ph=.15+t*1.55,lay=i%2,o=new V(s*Math.cos(ph),0,-Math.sin(ph)),t0=.012+.012*lay,len=Math.min(FL+.03-t0,.2+.05*Math.sin(t*Math.PI)-.015*lay),
          r0=Math.max(.03,rad(t0+.006,o))+.004+.004*lay,rt=rvLine(rad,o,t0,len,r0,FL,.006+.004*lay),
          b=A2.clone().add(fw.clone().multiplyScalar(t0)).add(o.clone().multiplyScalar(r0)),tip=A2.clone().add(fw.clone().multiplyScalar(t0+len)).add(o.clone().multiplyScalar(rt));
        rvFeather(k,a+'1',lay?C.FURD:C.FUR,b.toArray(),tip.clone().sub(b).toArray(),o.toArray(),tip.distanceTo(b),.032,.0045,'c')}
      if(!full)return;
      // bare only: a skirt of belly and flank feathers over the hip joints, so the thighs grow out of the body like a bird's
      if(s>0)for(let i=0;i<13;i++){const a=-2.3+i/12*4.6,P0=BR.P||mdP({}),q=mdTorsoAt(P0,.56),r=Math.cos(a)>0?q.f:q.b,b=new V(Math.sin(a)*q.rx*.92,.56,Math.cos(a)*r*.92);
        rvFeather(k,'pelvis',i%2?C.FURD:C.FUR,b.toArray(),[Math.sin(a)*.3,-1,Math.cos(a)*.3],[Math.sin(a),0,Math.cos(a)],.11+.02*Math.cos(a),.03,.006)}
      // coverts on the upper arm: from the shoulder down to the elbow, lying flat on its outer back side
      const ua=A1.clone().sub(A0).normalize();
      for(let i=0;i<5;i++){const t=i/4,ph=.2+t*1.3,o=new V(s*Math.cos(ph),0,-Math.sin(ph)),b=A0.clone().add(ua.clone().multiplyScalar(.03)).add(o.clone().multiplyScalar(.055)),d=ua.clone().add(o.clone().multiplyScalar(.06));
        rvFeather(k,a+'0',i%2?C.FURL:C.FUR,b.toArray(),d.toArray(),o.toArray(),.13+.03*Math.sin(t*Math.PI),.03,.005,'c')}});
    mdKit(B,k)},
  // the tail: a wedge of 11 long feathers fanned from the rump on the one tail bone, upper coverts over its base
  tailB(B){const C=BR.C,D=BR.R,k=dkKit(),V=THREE.Vector3,base=new V(...D.FAN.base),cd=new V(...D.FAN.cd).normalize(),X=new V(1,0,0),N=new V().crossVectors(X,cd);
    for(let i=-5;i<=5;i++){const t=i/5,a=t*D.FAN.spread,d=cd.clone().multiplyScalar(Math.cos(a)).add(X.clone().multiplyScalar(Math.sin(a))),b=base.clone().add(X.clone().multiplyScalar(t*.035)).add(N.clone().multiplyScalar(-Math.abs(t)*.012));
      rvFeather(k,'tl0',Math.abs(i)%2?C.FURD:C.FUR,b.toArray(),d.toArray(),N.toArray(),.4-.13*Math.pow(Math.abs(t),1.4),.026,.006,'c')}
    for(let i=-2;i<=2;i++){const t=i/2,a=t*.4,d=cd.clone().multiplyScalar(Math.cos(a)).add(X.clone().multiplyScalar(Math.sin(a))),b=base.clone().add(new V(t*.03,.03,.02)).add(N.clone().multiplyScalar(.012));
      rvFeather(k,'tl0',i%2?C.FURL:C.FUR,b.toArray(),d.toArray(),N.toArray(),.17-.03*Math.abs(t),.03,.007,'c',[['tl0',.6],['pelvis',.4]])}
    // the rump the fan grows from
    k.p('tl0','sph2','c',C.FUR,0,.6,-.1,.06,.05,.05,.6);
    mdKit(B,k)},
  // the toes of one foot (s = -1 left, +1 right): yaw (0 = forward), length, root offset from the ankle bone [x, y, z], thickness
  toeList(s){const L=this.toes.len;return [{yaw:0,len:L*1.1,root:[0,.024,.02]},{yaw:s*.42,len:L*.95,root:[s*.008,.024,.016]},{yaw:-s*.42,len:L*.9,root:[-s*.008,.024,.016]},{yaw:Math.PI-s*.15,len:L*.55,root:[-s*.004,.024,-.018],w:.95,back:1}]},
  // the tail fan (tailB) and the opening it needs in coats and robes (tailNear): within the fan's wedge and close to its plane
  FAN:{base:[0,.6,-.105],cd:[0,-.84,-.55],spread:.6,len:.4},
  tailNear(x,y,z){const F=this.FAN,V=THREE.Vector3,c=this._fan||(this._fan={cd:new V(...F.cd).normalize()});if(!c.N)c.N=new V().crossVectors(new V(1,0,0),c.cd);
    const v=new V(x-F.base[0],y-F.base[1],z-F.base[2]),u=v.dot(c.cd),w=v.dot(c.N);
    return u>-.08&&u<F.len+.05&&Math.abs(v.x)<Math.max(.095,u*Math.tan(F.spread+.08)+.06)&&Math.abs(w)<.05+Math.max(0,.08-u)*.6},
  // bird feet: three forward toes splayed, a back toe; each toe jointed (scutes as small knuckle pads), a hooked black claw
  toesB(B,P){const C=BR.C,D=BR.R,T=D.toes,k=dkKit(),V=THREE.Vector3;
    [-1,1].forEach(s=>{const l=(s<0?'lh':'rh')+'2',A=mdV(P.bones[l]),lf=P.lf||1;
      const toe=(yaw,len,root,w)=>{const d=new V(Math.sin(yaw),0,Math.cos(yaw)),p0=new V(A.x+root[0],root[1],A.z+root[2]),pts=[p0];
        [.4,.35,.25].forEach((f,j)=>{pts.push(pts[j].clone().add(d.clone().multiplyScalar(len*f*lf)).add(new V(0,-(j==0?.008:.005),0)))});
        pts.forEach((p,j)=>{if(j<3)k.L(l,'c',j%2?C.SCALED:C.SCALE,p.toArray(),pts[j+1].toArray(),(.0115-.0022*j)*lf*(w||1),(.0095-.0022*j)*lf*(w||1),5);
          if(j>0&&j<3)k.p(l,'sph2','c',C.SCALED,p.x,p.y+.001,p.z,.0095*lf*(w||1),.007*lf,.009*lf)});
        const tp=pts[3],c1=tp.clone().add(d.clone().multiplyScalar(.012*lf)).add(new V(0,.002,0)),c2=c1.clone().add(d.clone().multiplyScalar(.008*lf)).add(new V(0,-.012,0));
        k.L(l,'c',C.CLAW,tp.toArray(),c1.toArray(),.005*lf,.0035*lf,4);k.L(l,'c',C.CLAW,c1.toArray(),c2.toArray(),.0035*lf,.0006,4)};
      D.toeList(s).forEach(q=>toe(q.yaw,q.len,q.root,q.w));
      // a fringe of thigh feathers over the knee (the 'trousers' end), on the thigh bone; bare only (a robe covers the knee)
      if(BR.bare){const H0=mdV(P.bones[(s<0?'lh':'rh')+'0']),K=mdV(P.bones[(s<0?'lh':'rh')+'1']);for(let i=0;i<7;i++){const a=i/7*Math.PI*2,r=.05*lf,b=H0.clone().lerp(K,.78).add(new V(Math.sin(a)*r,0,Math.cos(a)*r));
        rvFeather(k,(s<0?'lh':'rh')+'0',i%2?C.FURD:C.FUR,b.toArray(),[Math.sin(a)*.25,-1,Math.cos(a)*.25],[Math.sin(a),0,Math.cos(a)],.065,.02,.005)}}
      // the ankle joint: a knobbly ball where the shank meets the toes
      k.p(l,'sph2','c',C.SCALED,A.x,.032,A.z+.004,.024*lf,.02*lf,.026*lf)});
    mdKit(B,k)}});
// race-specific builders: the raven's tail fan, feet and wings replace the generic loft / toes
{const f=brTail;brTail=function(B){const D=BR.R;if(D&&D.tailB)return D.tailB(B);return f.apply(this,arguments)}}
{const f=brToes;brToes=function(B,P){const D=BR.R;if(D&&D.toesB)return D.toesB(B,P);return f.apply(this,arguments)}}
{const f=brPaws;brPaws=function(B){const r=f.apply(this,arguments);const D=BR.R;if(D&&D.wings)D.wings(B);return r}}

// ======================================================== 4 · BADGER (Paladin) ========================================================
// A stout badger: broad low body, short strong legs and arms, a wedge head with the white face and two black stripes through
// the eyes, small round white-rimmed ears, a big black nose, heavy digging claws, a short bushy tail.
brDef(4,{key:'badger',n:'Badger',cls:'paladin',furN:'Fur',
  fur:['#6a6c70','#4a4a50','#8a8c90','#8a7a5a','#3a3838','#a8a8ac'],eye:['#101010','#c87020','#c8301c','#4a6a9a','#e8e8f0'],
  cols:L=>brPal(L,{FURD:mdSh(mdC(L.skin),.4),FURL:0xe8e4dc,BELLY:mdSh(mdC(L.skin),.45),NOSE:0x14100e,PINK:mdSh(mdC(L.skin),.5)}),
  pre:{pelvis:[1.3,1,1.2],spine:[1.25,.92,1.2],chest:[1.3,.92,1.25],neck:[1.3,.6,1.1],head:.95,arm:[.9,1.3],hand:1.3,leg:[.8,1.4],foot:1.1,cape:[1.05,1]},
  shear:{spine:.16,chest:.3,neck:.34},crouch:[.28,.48],pose:{sp:.08,ch:.05,shz:.25,el:-.3},run:{sp:.05},look:[.06,0],
  TR:[[1.1,1.12,1.14,1.14,1.12,1.08,1.05,1.03,1,.95,1.15,1.2],[1.08,1.15,1.18,1.2,1.18,1.1,1.02,1,1,1,1.15,1.18],[1.08,1.1,1.1,1.12,1.14,1.14,1.12,1.1,1.05,1,1.15,1.18]],
  armK:[1.15,1.15,1.1,1.05,1.05,1],legK:[1.25,1.3,1.2,1.1,1.05,1,.95],foot:{len:.95,w:1.1,h:.85},
  SN:[[-.11,1.15,.05,.05,.05],[-.08,1.16,.092,.086,.08],[-.04,1.168,.11,.096,.092],[0,1.166,.112,.09,.096],[.04,1.158,.102,.078,.092],[.08,1.146,.086,.062,.08],[.12,1.133,.068,.048,.064],[.16,1.121,.052,.036,.05],[.19,1.113,.038,.027,.037],[.215,1.108,.024,.018,.024]],
  EYEP:[.07,1.168,.06],EAR:[.085,1.238,-.06],earR:.028,earE:[.085,1.238,-.06,.032,.03,.013,-.2,.5,.3],muzzleZ:.17,hoodZ:.045,crownZ:-.04,
  TP:[[0,.6,-.08,.045],[0,.56,-.16,.05],[0,.5,-.23,.046],[0,.43,-.28,.038],[0,.36,-.31,.026],[0,.3,-.32,.012]],
  tailCol:(m,C)=>m.i>3?C.FURL:m.s<-.3?C.FURD:C.FUR,tailSway:[.04,.05,1.4,2.6],
  paw:{n:5,len:[.022,.026,.028,.026,.021],claw:.022,rad:1.2,spread:.0105,thumb:false,colOf:C=>C.FURD},handCol:C=>C.FURD,
  toes:{n:5,len:.035,claw:.028,dew:false,colOf:C=>C.FURD},
  paint(P,C){P.paint.torso=m=>m.s>.3?C.BELLY:m.s>-.2&&m.s<.3?C.FURD:Math.abs(m.c)<.15&&m.s<-.6?C.FURL:C.FUR;P.paint.torsoLo=m=>m.s>.3?C.BELLY:m.s>-.2?C.FURD:C.FUR;
    P.paint.leg=()=>C.FURD;P.paint.fore=()=>C.FURD;P.paint.sleeve=()=>C.FURD},
  earRim:(k,c,t)=>brEarRim(BRD[4],k,c,t,[.9,.8,.9]),earPocket:(k,c,off)=>[-1,1].forEach(s=>{const [x,y,z]=BRD[4].EAR;k.p('head','sph2','c',c,s*(x+.004),y+.002,z-.004,.046,.044,.03,-.2,s*.5,s*.3)}),
  head(B,P,o){const D=this,C=BR.C,k=dkKit();P.head={w:1,jaw:.9,top:.95,len:1,fwd:-.01};const H=P._H=mdHeadR(P);
    // the badger mask: white face, a black stripe on each side running from the ear through the eye to the muzzle
    brSkull(B,D,m=>{const z=m.r.p[2],ang=Math.atan2(m.s,Math.abs(m.c));if(z<-.085)return ang<-.3?C.FURD:C.FUR;
      if(ang<-.55)return C.FURD;if(ang<.1-.3*Math.max(0,z))return C.FURL;if(ang<.78-.3*Math.max(0,z))return C.FURD;return C.FURL});
    brJaw(B,D,.09,.19,C.FURD,{h:.9});
    brNose(k,D,C.NOSE,1.35);brEyes(k,D,{sz:.95,fw:.85,socket:C.FURD,brow:C.FURD});brWhiskers(k,D,.14,1.12,3,.1,0x3a3430);
    // small round ears: dark cup with a white rim
    [-1,1].forEach(s=>{const [x,y,z]=D.EAR;k.p('head','sph2','c',C.FURL,s*x,y,z,.032,.03,.013,-.2,s*.5,s*.3);k.p('head','sph2','c',C.FURD,s*(x+.002),y-.002,z+.006,.024,.022,.008,-.2,s*.5,s*.3)});
    mdKit(B,k);return H}});
// ======================================================== 5 · WEASEL (Ranger) ========================================================
// A sleek weasel: long slim body, short legs, a small pointed head with round ears, black beady eyes, a cream throat and
// belly, a long tail with a black tip; neat little paws.
brDef(5,{key:'weasel',n:'Weasel',cls:'ranger',furN:'Fur',
  fur:['#8a5a30','#6a4424','#b08050','#4a3a2c','#e8e4dc','#a08a70'],eye:['#101010','#3a2a1c','#c87020','#c8301c','#78c040'],
  cols:L=>brPal(L,{BELLY:mdMix(mdC(L.skin),0xf0e8d0,.7),FURL:mdMix(mdC(L.skin),0xf0e8d0,.35),NOSE:0x14100e,PINK:mdMix(mdC(L.skin),0xb08a80,.5)}),
  pre:{pelvis:[.8,1.1,.8],spine:[.78,1.3,.78],chest:[.78,1.2,.8],neck:[.85,1.3,.85],head:.82,arm:[.9,.75],hand:.9,leg:[.82,.8],foot:.9,cape:[1.1,1]},
  shear:{spine:.16,chest:.32,neck:.36},crouch:[.28,.48],pose:{sp:.09,ch:.06,shx:-.25,el:-.5},run:{sp:.1},look:[.08,0],
  TR:[[.95,.95,.94,.92,.9,.9,.92,.94,.94,.95,1.05,1.1],[.95,.96,.96,.95,.94,.93,.92,.92,.96,1,1.05,1.08],[.95,.95,.95,.96,.97,.98,.98,.98,.98,1,1.05,1.08]],
  armK:[.84,.84,.8,.78,.8,.74],legK:[1,1.05,.98,.9,.84,.76,.72],foot:{len:.85,w:.8,h:.8},
  SN:[[-.09,1.15,.04,.04,.04],[-.065,1.158,.074,.07,.066],[-.03,1.166,.09,.08,.08],[.005,1.166,.092,.078,.082],[.04,1.159,.086,.066,.078],[.075,1.148,.072,.052,.066],[.105,1.138,.056,.04,.052],[.13,1.13,.043,.03,.04],[.15,1.125,.032,.022,.03],[.165,1.122,.02,.015,.02]],
  EYEP:[.055,1.168,.045],EAR:[.07,1.228,-.05],earR:.026,earE:[.07,1.228,-.05,.028,.026,.012,-.25,.5,.35],muzzleZ:.125,hoodZ:.03,crownZ:-.035,
  TP:[[0,.6,-.07,.03],[0,.58,-.16,.028],[0,.54,-.26,.027],[.01,.48,-.36,.026],[.02,.42,-.45,.025],[.03,.37,-.54,.024],[.04,.34,-.63,.022],[.05,.33,-.72,.02],[.06,.34,-.8,.017],[.07,.37,-.87,.014],[.08,.41,-.92,.01],[.09,.45,-.95,.006]],
  tailCol:(m,C)=>m.i>8.3?0x1a1612:m.s<-.4?C.FURL:C.FUR,tailSway:[.07,.1,1.5,3],
  paw:{n:5,len:[.016,.02,.021,.02,.016],claw:.006,pad:true,spread:.009,thumb:false,palm:.9,colOf:C=>C.FUR,padColOf:C=>C.PINK},handCol:C=>C.FUR,
  toes:{n:5,len:.028,claw:.008,dew:false,colOf:C=>C.FUR,padColOf:C=>C.PINK},
  earRim:(k,c,t)=>brEarRim(BRD[5],k,c,t,[.9,.8,.9]),earPocket:(k,c,off)=>[-1,1].forEach(s=>{const [x,y,z]=BRD[5].EAR;k.p('head','sph2','c',c,s*(x+.004),y+.002,z-.004,.042,.04,.028,-.25,s*.5,s*.35)}),
  head(B,P,o){const D=this,C=BR.C,k=dkKit();P.head={w:.9,jaw:.85,top:1,len:.95,fwd:-.01};const H=P._H=mdHeadR(P);
    brSkull(B,D,m=>{const z=m.r.p[2];if(m.s<-.35&&z>-.05)return C.BELLY;if(m.s<-.1&&z>.07)return C.FURL;if(m.s>.55&&z<.0)return C.FURD;return C.FUR});
    brJaw(B,D,.06,.145,C.BELLY,{h:.85,w:.95});
    brNose(k,D,C.NOSE,.95,.002);brEyes(k,D,{sz:.9,fw:.8,white:0x0a0808,brow:false});brWhiskers(k,D,.1,1.13,3,.12);
    // small round ears, set low and back
    [-1,1].forEach(s=>{const [x,y,z]=D.EAR;k.p('head','sph2','c',C.FUR,s*x,y,z,.028,.026,.012,-.25,s*.5,s*.35);k.p('head','sph2','c',C.PINK,s*(x+.002),y-.002,z+.005,.02,.018,.007,-.25,s*.5,s*.35)});
    mdKit(B,k);return H}});
