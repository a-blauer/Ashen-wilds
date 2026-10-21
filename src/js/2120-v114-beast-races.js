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
  pre:{pelvis:[1,1,1],spine:[.95,.98,1],chest:[.82,1,.94],neck:[1,.75,1],head:.9,arm:[1.1,.95],hand:1.3,leg:[1.12,1.04],foot:1,cape:[1.15,1]},
  shear:{spine:.22,chest:.42,neck:.46},crouch:[.3,.58],
  TR:[[1.03,1.06,1.07,1.05,1.02,.93,.94,.97,.94,.85,1.13,1.2],[1.05,1.14,1.16,1.23,1.19,1.05,.92,.92,.98,1,1.1,1.14],[1.05,1.05,1.05,1.07,1.09,1.1,1.1,1.11,1.1,1,1.14,1.16]],
  armK:[.86,.86,.82,.8,.82,.74],legK:[1.22,1.28,1.18,.98,.88,.76,.7],foot:{len:1.15,w:.78,h:.82},
  SN:[[-.11,1.16,.045,.045,.045],[-.08,1.168,.088,.085,.08],[-.04,1.176,.106,.1,.092],[0,1.174,.108,.095,.096],[.04,1.164,.1,.08,.094],[.075,1.15,.082,.062,.08],[.105,1.137,.062,.046,.06],[.13,1.126,.047,.034,.045],[.155,1.118,.035,.026,.033],[.175,1.112,.025,.018,.022],[.19,1.108,.015,.011,.014]],
  EYEP:[.065,1.176,.055],EAR:[.078,1.258,-.05],earR:.034,muzzleZ:.15,hoodZ:.04,crownZ:-.04,
  TP:[[0,.62,-.07,.052],[0,.6,-.15,.043],[0,.56,-.25,.035],[.008,.49,-.37,.029],[.02,.39,-.48,.025],[.035,.27,-.58,.021],[.05,.16,-.66,.018],[.065,.08,-.74,.015],[.08,.045,-.83,.012],[.1,.034,-.92,.01],[.12,.036,-1.0,.008],[.145,.05,-1.07,.006],[.17,.07,-1.12,.003]],
  tailCol:(m,C)=>m.i<1.2?C.FUR:m.i<1.8?mdMix(C.FUR,C.PINK,.5):Math.floor(m.i*2)%2?C.PINK:mdSh(C.PINK,.9),
  paw:{n:4,len:[.028,.033,.032,.026],claw:.011,spread:.0112},toes:{n:4,len:.045,claw:.018},
  earRim:(k,c,t)=>brEarRim(BRD[1],k,c,t),
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
  pre:{pelvis:[.9,1,.9],spine:[.9,1.02,.9],chest:[.86,1.02,.9],neck:[1,.95,1],head:.92,arm:[1.08,.86],hand:1.15,leg:[1.14,.9],foot:1,cape:[1.1,1]},
  shear:{spine:.1,chest:.2,neck:.22},crouch:[.18,.38],
  TR:[[1,1,1,.96,.94,.92,.95,.98,.96,.95,1.1,1.15],[1,1.02,1.02,1,.98,.95,.92,.92,.98,1,1.1,1.12],[1.02,1.02,1.02,1.02,1.02,1.02,1.02,1.02,1,1,1.1,1.12]],
  armK:[.9,.9,.86,.84,.86,.8],legK:[1.05,1.08,1,.9,.84,.76,.72],foot:{len:.82,w:.85,h:.8},
  SN:[[-.1,1.16,.05,.05,.05],[-.07,1.172,.096,.09,.085],[-.03,1.18,.112,.1,.1],[.01,1.178,.115,.096,.104],[.045,1.168,.108,.08,.1],[.075,1.154,.084,.058,.08],[.095,1.142,.058,.04,.06],[.11,1.134,.04,.028,.042],[.12,1.13,.026,.018,.028]],
  EYEP:[.06,1.182,.06],EAR:[.07,1.275,-.04],earR:.04,muzzleZ:.1,hoodZ:.035,crownZ:-.04,hatZ:-.05,
  TP:[[0,.6,-.06,.038],[0,.58,-.16,.036],[0,.55,-.27,.034],[0,.52,-.38,.032],[.01,.5,-.49,.03],[.02,.51,-.59,.029],[.03,.55,-.68,.028],[.04,.62,-.76,.027],[.05,.7,-.82,.025],[.06,.78,-.86,.022],[.07,.86,-.88,.018],[.08,.93,-.89,.012],[.09,.98,-.89,.006]],
  tailCol:(m,C)=>m.i>10?C.FURD:Math.floor(m.i)%3==2?C.FURD:C.FUR,tailSway:[.08,.08,1.2,2.4],
  paw:{n:4,len:[.02,.022,.022,.019],claw:.006,pad:true,curl:1.2,spread:.011,colOf:C=>C.FUR},handCol:C=>C.FUR,
  toes:{n:4,len:.03,claw:.008,pad:true,dew:false,colOf:C=>C.FUR},
  earRim:(k,c,t)=>brEarRim(BRD[2],k,c,t,[1.1,1.3,1]),
  head(B,P,o){const D=this,C=BR.C,k=dkKit();P.head={w:1,jaw:.9,top:1,len:.9,fwd:-.01};const H=P._H=mdHeadR(P);
    brSkull(B,D,m=>{const z=m.r.p[2];if(m.s<-.5&&z>.0)return C.BELLY;if(m.s<-.2&&z>.055)return C.FURL;
      if(m.s>.6&&z<.03&&z>-.08&&Math.abs(Math.sin(z*90))>.7)return C.FURD; // forehead stripes
      return C.FUR});
    brJaw(B,D,.055,.118,C.BELLY,{h:.85,w:.95});
    // small triangular nose, the mouth's inverted Y painted under it
    const tip=D.SN[D.SN.length-1];k.p('head','cone4','c',C.PINK,0,tip[1]+.002,tip[0]+.006,.011,.008,.008,Math.PI*.5);
    k.p('head','box','c',C.MOUTH,0,tip[1]-.012,tip[0]+.0,.0025,.012,.003);
    brEyes(k,D,{sz:1.25,fw:.55,socket:mdSh(C.FURD,.9),white:0xe8e4dc,pupil:[.0035,.013]});
    brWhiskers(k,D,.09,1.135,3,.17);
    // tall pointed ears, pink inside, dark tips
    [-1,1].forEach(s=>{const [x,y,z]=D.EAR;k.p('head','cone4','c',C.FUR,s*x,y,z,.032,.08,.016,-.12,s*.1,-s*.26);k.p('head','cone4','c',C.PINK,s*(x+.002),y-.006,z+.009,.02,.058,.009,-.12,s*.1,-s*.26);
      k.p('head','cone4','c',C.FURD,s*(x+.011),y+.034,z-.004,.008,.016,.006,-.12,s*.1,-s*.26)});
    mdKit(B,k);return H}});
// ======================================================== 3 · FROG (Mage) ========================================================
// A squat frog: a wide flat head with bulging eyes on top, a wide mouth, a pale throat; smooth spotted hide, no tail, no ears;
// long webbed fingers and toes with round pads; a deep squat on bent legs.
brDef(3,{key:'frog',n:'Frog',cls:'mage',furN:'Hide',
  fur:['#4a7a3a','#2e5a4a','#7a8a3a','#c87a2a','#4a5a9a','#6a4a3a'],eye:['#e0a020','#c84020','#e8d8a0','#78c040','#101010'],
  cols:L=>brPal(L,{BELLY:mdMix(mdC(L.skin),0xe8e0b0,.62),FURL:mdMix(mdC(L.skin),0xe8e0b0,.3),PINK:mdMix(mdC(L.skin),0xd8c8a0,.5),MOUTH:0x2a1818,NOSE:0x1a1410}),
  pre:{pelvis:[1.25,1,1.1],spine:[1.15,.92,1.05],chest:[1.15,.92,1.1],neck:[1.3,.45,1],head:1.05,arm:[1.12,1],hand:1.5,leg:[1.1,1.15],foot:1.25,cape:[1.1,1]},
  shear:{spine:.12,chest:.28,neck:.3},crouch:[.5,.9],
  TR:[[1.15,1.2,1.22,1.22,1.18,1.08,1,1,.98,1.3,1.4,1.4],[1.1,1.25,1.3,1.35,1.3,1.15,1,.95,1,1.3,1.4,1.4],[1.05,1.1,1.12,1.12,1.1,1.05,1,1,1,1.2,1.3,1.3]],
  armK:[1,1,.96,.9,.9,.85],legK:[1.1,1.15,1.05,.95,.92,.88,.85],foot:{len:1.35,w:1,h:.7},
  SN:[[-.1,1.13,.07,.04,.05],[-.06,1.136,.12,.055,.07],[-.02,1.14,.14,.06,.08],[.02,1.138,.146,.058,.085],[.06,1.132,.142,.052,.085],[.1,1.124,.126,.045,.075],[.14,1.116,.1,.038,.06],[.17,1.11,.07,.03,.045],[.19,1.108,.04,.02,.03]],
  EYEP:[.08,1.192,.0],EAR:null,muzzleZ:.15,hoodZ:.055,crownZ:-.07,hatZ:-.08,bandY:1.17,bandZ:-.03,
  topW:m=>{const dx=Math.abs(m.x)-.08,dy=m.y-1.192,dz=m.z;return dx*dx+dy*dy+dz*dz<.046*.046},
  eyeW:m=>false,
  TP:null,paw:{n:4,len:[.04,.046,.046,.038],rad:1.15,pad:true,web:true,curl:.5,spread:.013,palm:1.15,plen:1.1,thumb:false,colOf:C=>C.FUR,padColOf:C=>C.FURL},handCol:C=>C.FUR,
  toes:{n:5,len:.055,claw:0,web:true,pad:true,dew:false,w:1.1,spread:1.2,colOf:C=>C.FUR,padColOf:C=>C.FURL},
  paint(P,C){const spot=m=>Math.sin(m.x*83+m.y*47)*Math.sin(m.z*71-m.y*39)>.72;
    P.paint.torso=m=>m.s>.45&&m.y>.5?C.BELLY:spot(m)?C.FURD:C.FUR;P.paint.torsoLo=m=>m.s>.5&&m.y>.47?C.BELLY:spot(m)?C.FURD:C.FUR;
    P.paint.leg=(m,s)=>m.s>.5&&m.r.part=='thigh'?mdMix(C.FUR,C.BELLY,.5):spot(m)?C.FURD:C.FUR;P.paint.fore=m=>spot(m)?C.FURD:C.FUR},
  head(B,P,o){const D=this,C=BR.C,k=dkKit();P.head={w:1.3,jaw:1.1,top:.8,len:1,fwd:0};const H=P._H=mdHeadR(P);
    const spot=m=>Math.sin(m.x*83+m.y*47)*Math.sin(m.z*71-m.y*39)>.7;
    brSkull(B,D,m=>{const z=m.r.p[2];if(z>-.02&&m.s<.12&&m.s>-.12&&Math.abs(m.c)>.35)return C.MOUTH; // the wide mouth line round the sides
      if(m.s<-.3)return C.BELLY;if(m.s>.4&&spot(m))return C.FURD;return C.FUR},{seg:16,capB:{dz:.004}});
    // throat sac under the jaw, nostrils at the tip
    k.p('head','sph2','c',C.BELLY,0,1.075,.03,.075,.038,.07);k.P[k.P.length-1].w=[['head',.6],['neck',.4]];
    const tip=D.SN[D.SN.length-1];[-1,1].forEach(s=>k.p('head','box','c',C.NOSE,s*.014,tip[1]+.012,tip[0]+.01,.005,.003,.004));
    // bulging eyes on top: an eyelid ridge, the gold eye, a horizontal pupil, a highlight; a tympanum disc behind each
    [-1,1].forEach(s=>{const [x,y,z]=D.EYEP;k.p('head','sph2','c',C.FURD,s*x,y-.012,z,.047,.036,.047);k.p('head','sph2','c',C.EYE,s*x,y,z,.04,.038,.04);
      k.p('head','box','c',0x080606,s*(x+.012),y+.004,z+.03,.02,.006,.012,0,s*.5,0);k.p('head','box','c',0xf0ece0,s*(x+.016),y+.018,z+.024,.005,.004,.004);
      const tz=-.055,tx=brSurfX(D,tz,1.142)+.002;k.p('head','cyl','c',mdSh(C.FUR,.8),s*tx,1.142,tz,.022,.004,.022,0,0,s*Math.PI/2);k.p('head','cyl','c',C.FURD,s*(tx+.002),1.142,tz,.012,.004,.012,0,0,s*Math.PI/2)});
    mdKit(B,k);return H}});
// ======================================================== 4 · BADGER (Paladin) ========================================================
// A stout badger: broad low body, short strong legs and arms, a wedge head with the white face and two black stripes through
// the eyes, small round white-rimmed ears, a big black nose, heavy digging claws, a short bushy tail.
brDef(4,{key:'badger',n:'Badger',cls:'paladin',furN:'Fur',
  fur:['#6a6c70','#4a4a50','#8a8c90','#8a7a5a','#3a3838','#a8a8ac'],eye:['#101010','#c87020','#c8301c','#4a6a9a','#e8e8f0'],
  cols:L=>brPal(L,{FURD:mdSh(mdC(L.skin),.4),FURL:0xe8e4dc,BELLY:mdSh(mdC(L.skin),.45),NOSE:0x14100e,PINK:mdSh(mdC(L.skin),.5)}),
  pre:{pelvis:[1.18,1,1.1],spine:[1.15,.96,1.1],chest:[1.2,.96,1.14],neck:[1.2,.7,1],head:.95,arm:[.96,1.2],hand:1.25,leg:[.92,1.25],foot:1.1,cape:[1.05,1]},
  shear:{spine:.18,chest:.36,neck:.4},crouch:[.2,.36],
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
  earRim:(k,c,t)=>brEarRim(BRD[4],k,c,t,[.9,.8,.9]),
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
  pre:{pelvis:[.86,1.04,.86],spine:[.82,1.14,.82],chest:[.82,1.1,.84],neck:[.9,1.15,.9],head:.86,arm:[1,.8],hand:1,leg:[.96,.86],foot:.95,cape:[1.1,1]},
  shear:{spine:.2,chest:.38,neck:.42},crouch:[.25,.45],
  TR:[[.95,.95,.94,.92,.9,.9,.92,.94,.94,.95,1.05,1.1],[.95,.96,.96,.95,.94,.93,.92,.92,.96,1,1.05,1.08],[.95,.95,.95,.96,.97,.98,.98,.98,.98,1,1.05,1.08]],
  armK:[.84,.84,.8,.78,.8,.74],legK:[1,1.05,.98,.9,.84,.76,.72],foot:{len:.85,w:.8,h:.8},
  SN:[[-.09,1.15,.04,.04,.04],[-.065,1.158,.074,.07,.066],[-.03,1.166,.09,.08,.08],[.005,1.166,.092,.078,.082],[.04,1.159,.086,.066,.078],[.075,1.148,.072,.052,.066],[.105,1.138,.056,.04,.052],[.13,1.13,.043,.03,.04],[.15,1.125,.032,.022,.03],[.165,1.122,.02,.015,.02]],
  EYEP:[.055,1.168,.045],EAR:[.07,1.228,-.05],earR:.026,muzzleZ:.125,hoodZ:.03,crownZ:-.035,
  TP:[[0,.6,-.07,.03],[0,.58,-.16,.028],[0,.54,-.26,.027],[.01,.48,-.36,.026],[.02,.42,-.45,.025],[.03,.37,-.54,.024],[.04,.34,-.63,.022],[.05,.33,-.72,.02],[.06,.34,-.8,.017],[.07,.37,-.87,.014],[.08,.41,-.92,.01],[.09,.45,-.95,.006]],
  tailCol:(m,C)=>m.i>8.3?0x1a1612:m.s<-.4?C.FURL:C.FUR,tailSway:[.07,.1,1.5,3],
  paw:{n:5,len:[.016,.02,.021,.02,.016],claw:.006,pad:true,spread:.009,thumb:false,palm:.9,colOf:C=>C.FUR,padColOf:C=>C.PINK},handCol:C=>C.FUR,
  toes:{n:5,len:.028,claw:.008,dew:false,colOf:C=>C.FUR,padColOf:C=>C.PINK},
  earRim:(k,c,t)=>brEarRim(BRD[5],k,c,t,[.9,.8,.9]),
  head(B,P,o){const D=this,C=BR.C,k=dkKit();P.head={w:.9,jaw:.85,top:1,len:.95,fwd:-.01};const H=P._H=mdHeadR(P);
    brSkull(B,D,m=>{const z=m.r.p[2];if(m.s<-.35&&z>-.05)return C.BELLY;if(m.s<-.1&&z>.07)return C.FURL;if(m.s>.55&&z<.0)return C.FURD;return C.FUR});
    brJaw(B,D,.06,.145,C.BELLY,{h:.85,w:.95});
    brNose(k,D,C.NOSE,.95,.002);brEyes(k,D,{sz:.9,fw:.8,white:0x0a0808,brow:false});brWhiskers(k,D,.1,1.13,3,.12);
    // small round ears, set low and back
    [-1,1].forEach(s=>{const [x,y,z]=D.EAR;k.p('head','sph2','c',C.FUR,s*x,y,z,.028,.026,.012,-.25,s*.5,s*.35);k.p('head','sph2','c',C.PINK,s*(x+.002),y-.002,z+.005,.02,.018,.007,-.25,s*.5,s*.35)});
    mdKit(B,k);return H}});
