// ================= v137: animal townsfolk — the species =================
// Each: hp (skull + muzzle, fkSN), eyes, nose, jaw, whiskers, ear, face details, fur colours (3 variants), body build,
// paws / toes / hooves, tail path TP ([x, y, z, radius] in model space, from the hip out behind the clothes) and how the
// tail moves. cit: may be picked for citizens (keepers are assigned in 2820).
function fkCols(L,i,o){const f=L[Math.abs(i|0)%L.length];return fkPal(f[0],Object.assign({},o||{},f[1]||{}))}
function fkTailPts(y0,pts){return pts.map(p=>[p[0],p[1],p[2],p[3]])}
// a stripe / patch helper for skull painting: is the face point within the eye mask band
function fkMask(D,m,w){const e=D.EYEP,z=m.r.p[2];return Math.abs(z-e[2])<w&&m.s>-.25&&m.s<.55&&Math.abs(m.c)>.35}
// ------------------------------------------------ FOX ------------------------------------------------
fkSpecies('fox',{n:'Fox',cit:1,sc:.98,
  hp:{R:.094,W:.95,H:.9,L:1,m:{len:.105,w:.052,h:.042,b:.036,tw:.014,th:.012,tb:.01,drop:.03,y0:-.026,z0:.35}},
  eyes:{sz:1,fw:.85,pupil:[.0035,.012],tilt:.18},nose:'nose',noseSz:.8,jaw:[.04,.135,{h:.7,w:.8}],whisk:[.1,1.13,3,.1,0x1a1410],
  ear:{t:'tri',z:-.03,phi:.52,len:.105,w:.052,th:.02,out:.28,back:.12,tw:.15,tip:C=>0x1a1210},
  skull(m,C){const z=m.r.p[2];if(m.s<-.15&&z>-.01)return C.FURL;if(m.s<.2&&z>.05&&Math.abs(m.c)>.5)return C.FURL;return m.s>.6&&z<0?C.FURD:C.FUR},
  cols:i=>fkCols([[0xb85a22],[0xa04a1c],[0x8a6a52,{FURL:0xe8e0d6}]],i,{FURL:0xeee6da,BELLY:0xeee6da,EYE:0xd89020}),
  body:{build:0,af:.92,lf:.95},TR:null,
  paint(P,C){P.paint.leg=(m,s)=>m.r.part=='ankle'||m.r.part=='shin'&&m.i>4.6?0x1a1210:C.FUR;P.col.hand=0x1a1210},handCol:C=>0x1a1210,toeCol:C=>0x1a1210,
  paw:{n:4,len:[.024,.028,.028,.023],claw:.007,spread:.011,pad:true,curl:1.1,colOf:C=>0x1a1210,padColOf:C=>0x3a2a24},
  toes:{n:4,len:.036,claw:.01,pad:true,colOf:C=>0x1a1210},
  TP:[[0,.6,-.09,.035],[0,.56,-.17,.055],[0,.49,-.27,.072],[0,.41,-.36,.08],[0,.32,-.44,.08],[0,.24,-.5,.074],[0,.17,-.55,.062],[0,.12,-.59,.044],[0,.095,-.62,.022],[0,.09,-.63,.006]],
  tailCol:(m,C)=>m.i>6.6?C.FURL:m.s<-.3?mdMix(C.FUR,C.FURL,.4):C.FUR,tail:{sway:.14,freq:.9,lag:.5,stiff:.3}});
// ------------------------------------------------ WOLF ------------------------------------------------
fkSpecies('wolf',{n:'Wolf',cit:1,sc:1.04,
  hp:{R:.1,W:.98,H:.92,L:1.02,m:{len:.115,w:.058,h:.05,b:.044,tw:.022,th:.018,tb:.016,drop:.028,y0:-.028,z0:.32}},
  eyes:{sz:.95,fw:.85,tilt:.22,brow:null},nose:'nose',noseSz:1.05,jaw:[.04,.15,{h:.8,w:.85}],
  ear:{t:'tri',z:-.04,phi:.5,len:.085,w:.05,th:.022,out:.22,back:.18,tw:.1},
  skull(m,C){const z=m.r.p[2];if(m.s<-.25&&z>-.02)return C.FURL;if(m.s>.4&&z<.12)return C.FURD;if(Math.abs(m.c)>.75&&z>-.05&&z<.06&&m.s<.3)return C.FURL;return C.FUR},
  cols:i=>fkCols([[0x6a6a6e],[0x4a4648],[0x8a7a66]],i,{FURL:0xd8d4cc,BELLY:0xc8c4bc,EYE:0xc8a030}),
  body:{build:1,af:1,lf:1},
  face(k,B,D,C){// a ruff of fur at the cheeks
    [-1,1].forEach(s=>[[.0,1.11,.4],[-.03,1.1,.15],[-.06,1.115,-.1]].forEach(([z,y,a])=>{const x=brSurfX(D,z,y)-.008;k.p('head','cone4','c',C.FURL,s*x,y,z,.022,.05,.014,Math.PI*.8+a*.3,0,s*(.9+a*.3))}))},
  paw:{n:4,len:[.026,.03,.03,.025],claw:.009,spread:.012,pad:true,curl:1,colOf:C=>C.FURD},handCol:C=>C.FURD,toes:{n:4,len:.04,claw:.012,pad:true,colOf:C=>C.FURD},toeCol:C=>C.FURD,
  TP:[[0,.6,-.09,.035],[0,.55,-.18,.05],[0,.47,-.27,.058],[0,.38,-.34,.06],[0,.29,-.39,.058],[0,.21,-.42,.05],[0,.15,-.44,.038],[0,.12,-.45,.02],[0,.11,-.455,.005]],
  tailCol:(m,C)=>m.i>6.3?C.FURD:C.FUR,tail:{sway:.1,freq:.7,lag:.45,stiff:.4}});
// ------------------------------------------------ BEAR ------------------------------------------------
fkSpecies('bear',{n:'Bear',cit:1,sc:1.12,
  hp:{R:.115,W:1.16,H:.95,L:.95,yc:1.155,m:{len:.05,w:.07,h:.052,b:.05,tw:.046,th:.034,tb:.03,drop:.02,y0:-.032,z0:.32}},
  eyes:{sz:.8,fw:.9,brow:null},nose:'nose',noseSz:1.55,noseDy:.006,jaw:[.05,.13,{h:.9,w:.9}],
  ear:{t:'round',z:-.025,phi:.82,len:.06,w:.034,th:.018,out:.9,back:.15},
  skull(m,C){const z=m.r.p[2];if(z>.1)return C.FURL;if(m.s<-.4&&z>.04)return C.FURL;return m.s>.55&&z<0?C.FURD:C.FUR},
  cols:i=>fkCols([[0x5a3a24],[0x3a2a20],[0x7a5a3a]],i,{FURL:0xa88a66,BELLY:0x8a6a4a,EYE:0x1a1008}),
  body:{build:2,af:1.25,lf:1.18,belly:.08},neck:[.085,.09,.092],armK:[1.08,1.1,1.08,1.05,1.05,1],legK:[1.12,1.15,1.1,1.05,1,.98,.96],foot:{len:1.12,w:1.05,h:.9},
  paw:{n:5,len:[.022,.026,.027,.026,.022],claw:.014,spread:.0125,palm:1.15,pad:true,curl:.9,rad:1.25,colOf:C=>C.FURD,padColOf:C=>0x2a1e18},handCol:C=>C.FURD,
  toes:{n:5,len:.036,claw:.016,pad:true,w:1.2,colOf:C=>C.FURD},toeCol:C=>C.FURD,
  TP:[[0,.58,-.11,.04],[0,.56,-.155,.038],[0,.54,-.18,.022],[0,.535,-.19,.006]],tail:{sway:.05,freq:.6,lag:.3,stiff:.5},earAnim:{amp:.25}});
// ------------------------------------------------ HARE ------------------------------------------------
fkSpecies('hare',{n:'Hare',cit:1,sc:.96,
  hp:{R:.09,W:.92,H:.95,L:1.08,m:{len:.06,w:.05,h:.045,b:.045,tw:.026,th:.022,tb:.022,drop:.022,y0:-.026,z0:.3}},
  eyes:{sz:1.25,fw:.45,brow:null},nose:'pink',noseSz:.75,jaw:[.05,.1,{h:.6,w:.7}],whisk:[.085,1.125,3,.11,0xe8e0d0],
  ear:{t:'long',z:-.035,phi:.36,len:.21,w:.062,th:.016,out:.1,back:.3,tw:.25,tip:C=>0x2a2420},
  skull(m,C){const z=m.r.p[2];if(m.s<-.3&&z>-.02)return C.FURL;if(z>.06&&m.s<.3&&Math.abs(m.c)>.3)return C.FURL;if(Math.abs(m.c)>.8&&Math.abs(z-.045)<.02&&m.s>-.1&&m.s<.4)return C.FURL;return C.FUR},
  face(k,B,D,C){const t=D.SN[D.SN.length-1];[-1,1].forEach(s=>k.p('head','box','c',C.TOOTH,s*.0055,t[1]-.022,t[0]-.006,.009,.018,.005,.1,0,0));
    [-1,1].forEach(s=>k.p('head','sph2','c',C.FURL,s*.017,t[1]-.008,t[0]-.012,.022,.018,.016))},
  cols:i=>fkCols([[0x9a8064],[0x7a6a5a],[0xb89a72]],i,{FURL:0xeae6e0,BELLY:0xe0dad0,EYE:0x3a2412}),
  body:{build:0,af:.85,lf:1.02},legK:[1.12,1.1,1,.88,.82,.76,.72],foot:{len:1.35,w:.82,h:.8},
  paw:{n:4,len:[.022,.026,.026,.021],claw:.006,spread:.0105,pad:false,curl:1.1},toes:{n:4,len:.05,claw:.01,pad:false},
  TP:[[0,.56,-.1,.04],[0,.565,-.15,.055],[0,.575,-.19,.05],[0,.585,-.21,.03],[0,.59,-.22,.008]],tailCol:(m,C)=>C.FURL,tail:{sway:.08,freq:1.6,lag:.3,stiff:.3},earAnim:{amp:.22,sv:.18,cyc:3.6}});
// ------------------------------------------------ STAG / DOE ------------------------------------------------
var FK_DEER={hp:{R:.085,W:.9,H:.9,L:1.1,m:{len:.125,w:.046,h:.04,b:.04,tw:.021,th:.018,tb:.016,drop:.045,y0:-.03,z0:.3}},
  eyes:{sz:1.15,fw:.45,brow:null},nose:'none',jaw:[.05,.17,{h:.65,w:.8}],
  ear:{t:'leaf',z:-.035,phi:.95,len:.12,w:.05,th:.014,out:.95,back:.35,tw:-.5,inner:C=>mdMix(C.FURL,C.PINK,.3),tip:C=>C.FURD},
  skull(m,C){const z=m.r.p[2];if(z>.203)return 0x2a2220;if(m.s<-.2&&z>.0)return C.FURL;if(z>.13&&m.s<.25)return C.FURL;if(Math.abs(m.c)>.7&&z>.025&&z<.065&&m.s>-.2&&m.s<.5)return C.FURL;return m.s>.5&&z<.08?C.FURD:C.FUR},
  face(k,B,D,C){const t=D.SN[D.SN.length-1];k.p('head','sph2','c',0x1a1412,0,t[1]+.008,t[0]-.006,.016,.012,.011);[-1,1].forEach(s=>k.p('head','box','c',0x050404,s*.008,t[1]+.002,t[0]+.0045,.004,.004,.004))},
  body:{build:0,af:.88,lf:.92},legK:[1.02,1.02,.95,.82,.74,.66,.62],foot:{len:.75,w:.72,h:.9},hoof:1,
  paw:{n:3,len:[.03,.034,.03],claw:.01,nail:1,spread:.0135,pad:false,curl:.7,rad:1.15,colOf:C=>C.FURD,clawCol:C=>C.HOOF},handCol:C=>C.FURD,
  TP:[[0,.58,-.1,.035],[0,.6,-.15,.04],[0,.6,-.19,.03],[0,.59,-.21,.008]],tailCol:(m,C)=>m.s<0?C.FURL:C.FUR,tail:{sway:.1,freq:1.4,lag:.3,stiff:.2},earAnim:{amp:.3,sv:.2,cyc:3.9}};
fkSpecies('stag',Object.assign({},FK_DEER,{n:'Stag',sc:1.06,cols:i=>fkCols([[0x8a5a36],[0x6a4a30],[0x9a6a40]],i,{FURL:0xe8e0d0,BELLY:0xd8ccb8,EYE:0x1a1008,HORN:0xb0a088}),
  face(k,B,D,C,P){FK_DEER.face(k,B,D,C);fkAntlers(k,D,C,{z:-.035,phi:.38,len:.28,seg:5,r:.019,tines:[[.3,.09,.5],[.55,.1,.35],[.8,.08,.2],[1,.06,-.1]]})}}));
fkSpecies('doe',Object.assign({},FK_DEER,{n:'Doe',cit:1,sc:.98,cols:i=>fkCols([[0x9a6a42],[0x8a6040],[0xa87a4e]],i,{FURL:0xeae2d2,BELLY:0xdcd0bc,EYE:0x1a1008})}));
// ------------------------------------------------ BOAR ------------------------------------------------
fkSpecies('boar',{n:'Boar',cit:1,sc:1.06,
  hp:{R:.1,W:1.0,H:.95,L:1.0,m:{len:.12,w:.058,h:.05,b:.046,tw:.05,th:.042,tb:.036,drop:.034,y0:-.03,z0:.3}},
  eyes:{sz:.72,fw:.7,brow:null},nose:'none',jaw:[.05,.17,{h:.8,w:.9}],
  ear:{t:'tri',z:-.045,phi:.65,len:.075,w:.05,th:.016,out:.95,back:.35,tw:-.4},
  skull(m,C){const z=m.r.p[2];if(m.s>.5&&z<.08)return C.FURD;return C.FUR},
  face(k,B,D,C){const t=D.SN[D.SN.length-1];// the snout disc, nostrils, tusks curving up, a bristly crest
    k.p('head','cyl','c',0x6a524a,0,t[1],t[0]+.002,.034,.012,.03,Math.PI/2,0,0);[-1,1].forEach(s=>k.p('head','sph2','c',0x3a2420,s*.016,t[1]+.002,t[0]+.012,.008,.011,.004));
    [-1,1].forEach(s=>{const a=[s*.042,t[1]-.03,t[0]-.05];fkPath([a,[s*.056,t[1]-.012,t[0]-.035],[s*.062,t[1]+.016,t[0]-.03],[s*.058,t[1]+.032,t[0]-.04]],0xe8e0c8,.011,.003,k)});
    for(let i=0;i<9;i++){const z=-.09+i*.022,y=fkTop(D,z);k.p('head','cone4','c',C.FURD,0,y+.006,z,.012,.04,.008,-.5,0,0)}},
  cols:i=>fkCols([[0x4a3a30],[0x5a4434],[0x3a3230]],i,{FURL:0x7a6a5a,BELLY:0x6a5a4a,EYE:0x1a0a06}),
  body:{build:2,af:1.12,lf:1.08,belly:.1},neck:[.08,.085,.085],legK:[1.1,1.1,1.02,.92,.86,.8,.78],foot:{len:.8,w:.85,h:.9},hoof:1,
  paw:{n:3,len:[.026,.03,.026],claw:.01,nail:1,spread:.014,pad:false,curl:.7,rad:1.3,colOf:C=>C.FURD,clawCol:C=>C.HOOF},handCol:C=>C.FURD,
  TP:[[0,.58,-.11,.02],[0,.56,-.16,.014],[0,.5,-.19,.012],[.01,.44,-.2,.011],[.015,.4,-.19,.014],[.015,.37,-.19,.018],[.015,.35,-.19,.004]],tailCol:(m,C)=>m.i>4.5?C.FURD:C.FUR,tail:{sway:.25,freq:2,lag:.6,stiff:0}});
// ------------------------------------------------ OWL ------------------------------------------------
fkSpecies('owl',{n:'Owl',sc:.98,seg:22,
  hp:{R:.122,W:1.12,H:1.02,L:.82,yc:1.15,m:{len:.008,w:.08,h:.07,b:.07,tw:.07,th:.06,tb:.06,drop:.0,y0:-.012,z0:.6}},
  eyeAt:[.7,.12],eyes:false,nose:'none',neck:[.1,.11,.115],
  ear:{t:'tuft',z:-.02,phi:.6,len:.06,w:.013,th:.008,out:.75,back:.35,tw:.2,sink:.0},
  skull(m,C){const n=Math.sin(m.x*140)*Math.cos(m.z*120+m.y*90);if(m.s<-.4)return C.FURL;return n>.65?C.FURD:C.FUR},
  neckCol(m,C){return m.s>.3?C.FURL:C.FUR},
  face(k,B,D,C){const e=D.EYEP,ey=e[1];// the facial disc (two pale dishes round the eyes, a dark rim), big round eyes, the hooked beak
    [-1,1].forEach(s=>{const x=s*.046,zs=fkFrontZ(D,x,ey)||e[2];
      k.p('head','sph2','c',C.FURL,x,ey-.006,zs-.008,.06,.066,.022,0,s*.38,0);k.p('head','ring','c',C.FURD,x*1.02,ey-.006,zs-.006,.062,.08,.068,Math.PI/2+.0,s*.38,0);
      k.p('head','sph2','c',0x1a1008,x,ey,zs+.004,.026,.026,.014,0,s*.3,0);k.p('head','sph2','g',C.EYE,x,ey,zs+.011,.021,.021,.008,0,s*.3,0);
      k.p('head','sph2','c',0x050404,x+s*.001,ey,zs+.017,.011,.012,.004,0,s*.3,0);k.p('head','sph2','c',0xffffff,x+.006,ey+.008,zs+.019,.004,.004,.002);
      k.p('head','sph2','c',C.FURD,x,ey+.03,zs-.002,.032,.009,.014,0,s*.3,-s*.3)});
    const bz=fkFrontZ(D,0,ey-.025)||e[2];k.p('head','sph2','c',C.FURL,0,ey-.06,bz-.01,.05,.035,.022);
    k.p('head','sph2','c',0x6a5a3a,0,ey-.016,bz+.004,.013,.016,.012);k.p('head','cone4','c',0x9a8a5a,0,ey-.036,bz+.012,.012,.036,.011,2.6,0,0)},
  cols:i=>fkCols([[0x8a6a4a],[0x7a7068],[0xb8986a]],i,{FURL:0xe8dcc8,BELLY:0xe0d4bc,FURD:0x4a3a2a,EYE:0xf0a020}),
  body:{build:1,af:.95,lf:.82},legK:[1.1,1.05,.95,.75,.6,.5,.46],foot:{len:.55,w:.72,h:.7},
  paint(P,C){P.paint.leg=(m,s)=>m.r.part=='ankle'||m.r.part=='shin'&&m.i>4.4?0xb8a050:C.FUR},toeCol:C=>0xb8a050,
  paw:{n:3,len:[.036,.042,.036],claw:.014,spread:.0135,pad:false,curl:1,colOf:C=>C.FUR},
  toes:{n:3,len:.05,claw:.022,pad:false,spread:1.3,colOf:C=>0xb8a050},
  TP:[[0,.6,-.1,.05],[0,.54,-.17,.055],[0,.49,-.22,.045],[0,.46,-.24,.008]],tailCol:(m,C)=>Math.floor(m.i)%2?C.FURD:C.FUR,tail:{sway:.05,freq:.8,lag:.2,stiff:.4},earAnim:{amp:.2,sv:.1}});
// ------------------------------------------------ MOUSE ------------------------------------------------
fkSpecies('mouse',{n:'Mouse',cit:1,sc:.84,
  hp:{R:.1,W:.98,H:.95,L:1.02,m:{len:.075,w:.046,h:.038,b:.034,tw:.012,th:.01,tb:.009,drop:.026,y0:-.026,z0:.33}},
  eyes:{sz:1.05,fw:.75,brow:null},nose:'pink',noseSz:.8,jaw:[.05,.13,{h:.55,w:.7}],whisk:[.115,1.125,4,.12],
  ear:{t:'round',z:-.03,phi:.62,len:.12,w:.06,th:.012,out:.75,back:.1,tw:.2},
  cols:i=>fkCols([[0x8a7a6a],[0xa08a72],[0x6a625c]],i,{FURL:0xe0d8cc,BELLY:0xe0d8cc,EYE:0x0a0606}),
  body:{build:0,af:.88,lf:.9},paw:{n:4,len:[.022,.026,.026,.021],claw:.005,spread:.0105,pad:false,curl:1.1,colOf:C=>C.PINK},handCol:C=>C.PINK,
  toes:{n:4,len:.04,claw:.008,pad:false,colOf:C=>C.PINK},toeCol:C=>C.PINK,
  TP:[[0,.58,-.09,.026],[0,.55,-.17,.022],[0,.47,-.26,.019],[.01,.36,-.33,.016],[.02,.24,-.37,.014],[.03,.12,-.4,.012],[.05,.05,-.46,.01],[.08,.04,-.55,.008],[.12,.05,-.62,.006],[.16,.07,-.66,.003]],
  tailCol:(m,C)=>m.i<1.2?C.FUR:C.PINK,tail:{sway:.18,freq:1,lag:.6,stiff:0},earAnim:{amp:.25,cyc:3.4}});
