// ================= v114: the five beasts — rat (Warrior), cat (Assassin), frog (Mage), badger (Paladin), weasel (Ranger) =================
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
  shear:{spine:.2,chest:.36,neck:.4},crouch:[.36,.66],pose:{sp:.08,ch:.06,shx:-.35,el:-.6},run:{sp:.05,shx:-.2},look:[.1,0],
  TR:[[1.03,1.06,1.07,1.05,1.02,.93,.94,.97,.94,.85,1.13,1.2],[1.05,1.14,1.16,1.23,1.19,1.05,.92,.92,.98,1,1.1,1.14],[1.05,1.05,1.05,1.07,1.09,1.1,1.1,1.11,1.1,1,1.14,1.16]],
  armK:[.86,.86,.82,.8,.82,.74],legK:[1.22,1.28,1.18,.98,.88,.76,.7],foot:{len:1.15,w:.78,h:.82},
  SN:[[-.11,1.16,.045,.045,.045],[-.08,1.168,.088,.085,.08],[-.04,1.176,.106,.1,.092],[0,1.174,.108,.095,.096],[.04,1.164,.1,.08,.094],[.075,1.15,.082,.062,.08],[.105,1.137,.062,.046,.06],[.13,1.126,.047,.034,.045],[.155,1.118,.035,.026,.033],[.175,1.112,.025,.018,.022],[.19,1.108,.015,.011,.014]],
  EYEP:[.065,1.176,.055],EAR:[.078,1.258,-.05],earR:.034,muzzleZ:.15,hoodZ:.04,crownZ:-.04,
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
  shear:{spine:.08,chest:.16,neck:.2},crouch:[.28,.56],pose:{sp:.04,shx:-.15,el:-.3},run:{sp:.08,shx:-.1},look:[.06,0],
  TR:[[1.05,1.04,1,.9,.86,.86,.9,.92,.9,.95,1.1,1.15],[1.02,1.05,1.05,1.02,1,1.02,1.05,1.02,1,1,1.1,1.12],[1.04,1.04,1.04,1.02,1.02,1.04,1.06,1.06,1.02,1,1.1,1.12]],
  armK:[.88,.88,.84,.8,.82,.76],legK:[1.22,1.26,1.12,.92,.8,.72,.68],foot:{len:1.05,w:.8,h:.75},
  SN:[[-.1,1.158,.045,.045,.045],[-.07,1.17,.09,.082,.08],[-.035,1.178,.108,.088,.094],[0,1.178,.116,.08,.1],[.03,1.172,.118,.07,.098],[.055,1.162,.1,.058,.09],[.072,1.152,.064,.046,.07],[.095,1.146,.057,.04,.062],[.115,1.141,.046,.032,.05],[.132,1.138,.03,.022,.03]],
  EYEP:[.06,1.18,.058],EAR:[.076,1.268,-.045],earR:.042,muzzleZ:.11,hoodZ:.03,crownZ:-.04,hatZ:-.05,
  TP:[[0,.6,-.06,.038],[0,.58,-.16,.036],[0,.55,-.27,.034],[0,.52,-.38,.032],[.01,.5,-.49,.03],[.02,.51,-.59,.029],[.03,.55,-.68,.028],[.04,.62,-.76,.027],[.05,.7,-.82,.025],[.06,.78,-.86,.022],[.07,.86,-.88,.018],[.08,.93,-.89,.012],[.09,.98,-.89,.006]],
  tailCol:(m,C)=>m.i>10?C.FURD:Math.floor(m.i)%3==2?C.FURD:C.FUR,tailSway:[.08,.08,1.2,2.4],
  paw:{n:4,len:[.02,.022,.022,.019],claw:.006,pad:true,curl:1.2,spread:.011,colOf:C=>C.FUR},handCol:C=>C.FUR,
  toes:{n:4,len:.03,claw:.008,pad:true,dew:false,colOf:C=>C.FUR},
  earRim:(k,c,t)=>brEarRim(BRD[2],k,c,t,[1.1,1.3,1]),earPocket:(k,c,off)=>[-1,1].forEach(s=>{const [x,y,z]=BRD[2].EAR;k.p('head','cone4','c',c,s*(x+.004),y+.004,z-.004,.046,.1,.036,-.12,s*.1,-s*.26)}),
  head(B,P,o){const D=this,C=BR.C,k=dkKit();P.head={w:1,jaw:.9,top:1,len:.9,fwd:-.01};const H=P._H=mdHeadR(P);
    brSkull(B,D,m=>{const z=m.r.p[2];if(m.s<-.45&&z>-.01)return C.BELLY;if(m.s<-.15&&z>.065)return C.FURL;
      if(m.s>.55&&z<.02&&z>-.085&&Math.abs(Math.sin(z*90))>.7)return C.FURD; // forehead stripes
      return C.FUR});
    brJaw(B,D,.07,.128,C.BELLY,{h:.8,w:.92});
    // cheek tufts, a small triangular nose, the mouth's inverted Y painted under it
    const tip=D.SN[D.SN.length-1];k.p('head','cone4','c',C.PINK,0,tip[1]+.003,tip[0]+.006,.012,.009,.008,Math.PI*.5);
    k.p('head','box','c',C.MOUTH,0,tip[1]-.013,tip[0]-.002,.0025,.012,.003);
    brEyes(k,D,{sz:1.2,al:1.25,tilt:.3,fw:.4,inset:.003,browY:.022,socket:mdSh(C.FURD,.9),white:0xe8e4dc,pupil:[.0035,.014],brow:C.FURD});
    brWhiskers(k,D,.095,1.14,3,.17);
    // tall pointed ears, pink inside, dark tips
    [-1,1].forEach(s=>{const [x,y,z]=D.EAR;k.p('head','cone4','c',C.FUR,s*x,y,z,.036,.09,.016,-.12,s*.1,-s*.26);k.p('head','cone4','c',C.PINK,s*(x+.002),y-.008,z+.009,.022,.064,.009,-.12,s*.1,-s*.26);
      k.p('head','cone4','c',C.FURD,s*(x+.013),y+.04,z-.004,.008,.016,.006,-.12,s*.1,-s*.26)});
    mdKit(B,k);return H}});
// ======================================================== 3 · FROG (Mage) ========================================================
// A squat frog: a wide flat head with bulging eyes on top, a wide mouth, a pale throat; smooth spotted hide, no tail, no ears;
// long webbed fingers and toes with round pads; a deep squat on bent legs.
brDef(3,{key:'frog',n:'Frog',cls:'mage',furN:'Hide',
  fur:['#4a7a3a','#2e5a4a','#7a8a3a','#c87a2a','#4a5a9a','#6a4a3a'],eye:['#e0a020','#c84020','#e8d8a0','#78c040','#101010'],
  cols:L=>brPal(L,{BELLY:mdMix(mdC(L.skin),0xe8e0b0,.62),FURL:mdMix(mdC(L.skin),0xe8e0b0,.3),PINK:mdMix(mdC(L.skin),0xd8c8a0,.5),MOUTH:0x2a1818,NOSE:0x1a1410}),
  pre:{pelvis:[1.35,.9,1.15],spine:[1.25,.85,1.1],chest:[1.25,.85,1.15],neck:[1.4,.3,1],head:1.1,arm:[1.1,1.05],hand:1.5,leg:[1.15,1.2],foot:1.3,cape:[1.1,1]},
  shear:{spine:.1,chest:.2,neck:.22},crouch:[.56,1],pose:{sp:.06,shz:.3,el:-.4},run:{sp:.04},look:[.04,0],
  TR:[[1.15,1.2,1.22,1.22,1.18,1.08,1,1,.98,1.3,1.4,1.4],[1.1,1.25,1.3,1.35,1.3,1.15,1,.95,1,1.3,1.4,1.4],[1.05,1.1,1.12,1.12,1.1,1.05,1,1,1,1.2,1.3,1.3]],
  armK:[1,1,.96,.9,.9,.85],legK:[1.1,1.15,1.05,.95,.92,.88,.85],foot:{len:1.35,w:1,h:.7},
  SN:[[-.125,1.095,.07,.045,.04],[-.095,1.118,.118,.05,.065],[-.055,1.13,.148,.048,.08],[-.015,1.133,.158,.045,.085],[.025,1.13,.152,.042,.085],[.065,1.125,.14,.038,.08],[.105,1.118,.12,.034,.07],[.145,1.113,.092,.03,.055],[.185,1.109,.06,.024,.04],[.22,1.106,.03,.016,.025]],
  EYEP:[.108,1.178,-.012],EAR:null,muzzleZ:.16,hoodZ:-.03,crownZ:-.08,hatZ:-.1,bandY:1.16,bandZ:-.04,
  topW:m=>{const dx=Math.abs(m.x)-.108,dy=m.y-1.178,dz=m.z+.012;return dx*dx+dy*dy+dz*dz<.054*.054},
  eyeW:m=>false,
  TP:null,paw:{n:4,len:[.04,.046,.046,.038],rad:1.15,pad:true,web:true,curl:.5,spread:.013,palm:1.15,plen:1.1,thumb:false,colOf:C=>C.FUR,padColOf:C=>C.FURL},handCol:C=>C.FUR,
  toes:{n:5,len:.055,claw:0,web:true,pad:true,dew:false,w:1.1,spread:1.2,colOf:C=>C.FUR,padColOf:C=>C.FURL},
  paint(P,C){const spot=m=>Math.sin(m.x*83+m.y*47)*Math.sin(m.z*71-m.y*39)>.72;
    P.paint.torso=m=>m.s>.45&&m.y>.5?C.BELLY:spot(m)?C.FURD:C.FUR;P.paint.torsoLo=m=>m.s>.5&&m.y>.47?C.BELLY:spot(m)?C.FURD:C.FUR;
    P.paint.leg=(m,s)=>m.s>.5&&m.r.part=='thigh'?mdMix(C.FUR,C.BELLY,.5):spot(m)?C.FURD:C.FUR;P.paint.fore=m=>spot(m)?C.FURD:C.FUR},
  head(B,P,o){const D=this,C=BR.C,k=dkKit();P.head={w:1.3,jaw:1.1,top:.8,len:1,fwd:0};const H=P._H=mdHeadR(P);
    const spot=m=>Math.sin(m.x*83+m.y*47)*Math.sin(m.z*71-m.y*39)>.7;
    brSkull(B,D,m=>{const z=m.r.p[2];if(z>-.07&&m.s<.07&&m.s>-.08&&Math.abs(m.c)>.3)return C.MOUTH; // the mouth line along the whole edge
      if(m.s<-.3)return C.BELLY;if(m.s>.3&&m.s<.5&&z<.08&&z>-.1)return C.FURL; // the pale fold along the back
      if(m.s>.4&&spot(m))return C.FURD;return C.FUR},{seg:16,capB:{dz:.004},noNeck:true});
    // a throat sac under the jaw joining the chest, nostrils as two small bumps at the tip
    k.p('head','sph2','c',C.BELLY,0,1.075,.02,.095,.045,.085);k.P[k.P.length-1].w=[['head',.5],['neck',.5]];
    const tip=D.SN[D.SN.length-1];[-1,1].forEach(s=>{k.p('head','sph2','c',C.FUR,s*.014,tip[1]+.014,tip[0]+.004,.007,.005,.006);k.p('head','box','c',C.NOSE,s*.014,tip[1]+.017,tip[0]+.007,.004,.002,.003)});
    // bulging eyes on the corners of the head: an eyelid ridge, the gold eye, a horizontal pupil, a highlight; a tympanum disc behind each
    [-1,1].forEach(s=>{const [x,y,z]=D.EYEP;k.p('head','sph2','c',C.FURD,s*x,y-.014,z,.05,.036,.05);k.p('head','sph2','c',C.EYE,s*x,y,z,.044,.042,.044);
      k.p('head','box','c',0x080606,s*(x+.014),y+.004,z+.03,.024,.006,.012,0,s*.6,0);k.p('head','box','c',0xf0ece0,s*(x+.02),y+.02,z+.022,.005,.004,.004);
      const tz=-.075,tx=brSurfX(D,tz,1.128)+.002;k.p('head','cyl','c',mdSh(C.FUR,.8),s*tx,1.128,tz,.02,.004,.02,0,0,s*Math.PI/2);k.p('head','cyl','c',C.FURD,s*(tx+.002),1.128,tz,.011,.004,.011,0,0,s*Math.PI/2)});
    mdKit(B,k);return H},
  // the frog mage's head pieces: no brims across the eyes — soft caps worn far back on the crown, floating arcane halos,
  // cowls that drape from behind the eyes
  helmSet:{cloth:X=>{const {k,st,M,A,G,at,top,hood,band,z0}=X,D=BRD[3],dk=mdSh(M,.75);
    // a slouch cap on the back of the crown behind the eyes, bending backward to a point
    const cap=(col,len,wide)=>{const zb=-.095,y0=top(zb)+.004,q=at(zb),R=[[0,y0-.004,zb,q.rx*.98*(wide||1),.065],[0,y0+.05,zb-.02,q.rx*.86,.058],[0,y0+.1*len,zb-.07*len,.06,.045],[0,y0+.14*len,zb-.14*len,.034,.028],[0,y0+.15*len,zb-.21*len,.014,.012],[0,y0+.14*len,zb-.26*len,.004,.004]];
      mdLoft(X.B,R.map(r=>({p:[r[0],r[1],r[2]],rx:r[3],f:r[4],b:r[4],w:[['head',1]]})),{seg:12,t:'c',capB:true,col:m=>m.i<.6?mdSh(col,.85):col});
      band(zb+.01,.014,A,'c')};
    // a floating halo above the crown: a flat ring, crystals on it, a gem at the front
    const halo=(r,h,n,gem)=>{const z=-.065,y=top(z)+.028+h;k.p('head','ring','m',A,0,y,z,r,.05,r);
      for(let i=0;i<n;i++){const ang=i/n*Math.PI*2;k.p('head','oct',G?'g':'m',G||A,Math.sin(ang)*r,y+.012+(i==0?.012:0),z+Math.cos(ang)*r,.012,.022+(i==0?.012:0),.01)}
      if(gem)k.p('head','oct',G?'g':'m',G||X.d.gem||A,0,y,z+r,.016,.022,.014)};
    if(st=='linen')hood(.028,M);
    else if(st=='hat'){cap(M,1,1);if(G)k.p('head','oct','g',G,0,top(-.095)+.02,-.07,.012)}
    else if(st=='witch'){cap(dk,1.2,1.1);const zb=-.1,y=top(zb)+.012;k.p('head','cyl','c',mdSh(dk,.9),0,y,zb-.02,.16,.012,.14,-.25)}
    else if(st=='circlet')halo(.1,0,0,1);
    else if(st=='diadem')halo(.105,.01,3,1);
    else if(st=='crown')halo(.115,.02,7,1);
    else if(st=='tallcowl'){hood(.03,M,{tip:false});const q=at(-.08);k.L('head','c',M,[0,q.top+.03,-.08],[0,q.top+.2,-.16],.07,.004,7);band(-.07,.04,A,'c')}
    else{/*star*/hood(.03,M,{tip:false});halo(.12,.03,5,0)}}}});
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
  EYEP:[.07,1.168,.06],EAR:[.085,1.238,-.06],earR:.028,muzzleZ:.17,hoodZ:.045,crownZ:-.04,
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
  shear:{spine:.16,chest:.32,neck:.36},crouch:[.28,.48],pose:{sp:.03,ch:.02,shx:-.25,el:-.5},run:{sp:.04},look:[.08,0],
  TR:[[.95,.95,.94,.92,.9,.9,.92,.94,.94,.95,1.05,1.1],[.95,.96,.96,.95,.94,.93,.92,.92,.96,1,1.05,1.08],[.95,.95,.95,.96,.97,.98,.98,.98,.98,1,1.05,1.08]],
  armK:[.84,.84,.8,.78,.8,.74],legK:[1,1.05,.98,.9,.84,.76,.72],foot:{len:.85,w:.8,h:.8},
  SN:[[-.09,1.15,.04,.04,.04],[-.065,1.158,.074,.07,.066],[-.03,1.166,.09,.08,.08],[.005,1.166,.092,.078,.082],[.04,1.159,.086,.066,.078],[.075,1.148,.072,.052,.066],[.105,1.138,.056,.04,.052],[.13,1.13,.043,.03,.04],[.15,1.125,.032,.022,.03],[.165,1.122,.02,.015,.02]],
  EYEP:[.055,1.168,.045],EAR:[.07,1.228,-.05],earR:.026,muzzleZ:.125,hoodZ:.03,crownZ:-.035,
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
