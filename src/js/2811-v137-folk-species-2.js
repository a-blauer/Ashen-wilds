// ================= v137: animal townsfolk — more species =================
// raccoon, lynx, otter, goat, ram, sheep, hedgehog, squirrel, beaver, mole, ferret, bat, hound
// ------------------------------------------------ RACCOON ------------------------------------------------
fkSpecies('raccoon',{n:'Raccoon',sc:.95,
  hp:{R:.098,W:1.05,H:.9,L:.98,m:{len:.075,w:.05,h:.038,b:.034,tw:.014,th:.012,tb:.01,drop:.028,y0:-.03,z0:.35}},
  eyes:{sz:1,fw:.85,brow:false,socket:0x141010},nose:'nose',noseSz:.85,jaw:[.04,.12,{h:.6,w:.75}],whisk:[.085,1.118,3,.09,0xe8e4dc],
  ear:{t:'tri',z:-.03,phi:.62,len:.06,w:.048,th:.016,out:.55,back:.1,tw:.2,inner:C=>0xe8e0d6},
  skull(m,C){const z=m.r.p[2];if(fkMask(this,m,.035))return 0x161214;if(z>.08&&m.s>.2)return 0x2a2422;if(m.s<-.2&&z>-.02)return 0xe8e4dc;if(z>-.0&&z<.08&&m.s>.3&&Math.abs(m.c)<.35)return 0xe8e4dc;
    if(Math.abs(m.c)>.55&&z>.04&&m.s<.1)return 0xe8e4dc;return m.s>.6&&z<0?C.FURD:C.FUR},
  cols:i=>fkCols([[0x7a7470],[0x6a645e],[0x8a8278]],i,{FURL:0xd8d4cc,BELLY:0xc8c2b8,EYE:0x1a1008}),
  body:{build:1,af:.95,lf:.95,belly:.03},paw:{n:5,len:[.022,.028,.03,.028,.022],claw:.006,spread:.0105,pad:true,curl:1,colOf:C=>0x2a2624,padColOf:C=>0x4a4240},handCol:C=>0x2a2624,
  toes:{n:5,len:.034,claw:.008,pad:true,colOf:C=>0x2a2624},toeCol:C=>0x2a2624,
  TP:[[0,.6,-.09,.035],[0,.55,-.17,.05],[0,.47,-.26,.06],[0,.38,-.34,.062],[0,.29,-.4,.06],[0,.21,-.44,.055],[0,.15,-.47,.046],[0,.115,-.49,.03],[0,.105,-.5,.006]],
  tailCol:(m,C)=>Math.floor(m.i*1.6)%2?0x1e1a18:C.FUR,tail:{sway:.12,freq:.9,lag:.5,stiff:.3}});
// ------------------------------------------------ LYNX ------------------------------------------------
fkSpecies('lynx',{n:'Lynx',sc:1.0,
  hp:{R:.1,W:1.05,H:.95,L:.92,m:{len:.04,w:.06,h:.042,b:.044,tw:.034,th:.024,tb:.026,drop:.016,y0:-.03,z0:.35}},
  eyes:{sz:1.15,fw:.95,pupil:[.0035,.013],brow:false},nose:'pink',noseSz:.7,jaw:[.05,.1,{h:.7,w:.85}],whisk:[.085,1.13,4,.14,0xf0ece4],
  ear:{t:'tri',z:-.035,phi:.48,len:.085,w:.048,th:.016,out:.18,back:.1,tw:.1,tip:C=>0x1a1410,tuft:C=>0x1a1410,tuftL:.05},
  skull(m,C){const z=m.r.p[2];if(m.s<-.25&&z>-.03)return C.FURL;if(z>.07&&m.s<.35)return C.FURL;if(m.s>.4&&z<.05&&Math.abs(Math.sin(m.x*90))>.8)return C.FURD;return C.FUR},
  face(k,B,D,C){// the long cheek ruffs, barred dark at the tips
    [-1,1].forEach(s=>[[.03,1.115,-.1],[.0,1.1,-.35],[-.03,1.105,-.6],[-.055,1.12,-.8]].forEach(([z,y,a],i)=>{const x=brSurfX(D,z,y)-.006;k.p('head','cone4','c',i%2?C.FURL:mdMix(C.FURL,0x1a1410,.6),s*x,y,z,.022,.075,.012,Math.PI*.75+a*.25,0,s*(1.1+a*.25))}))},
  cols:i=>fkCols([[0xb08a5e],[0x9a8a72],[0xc09a6a]],i,{FURL:0xeae4d8,BELLY:0xe0d8c8,EYE:0xd8b030}),
  body:{build:0,af:.98,lf:1.05},legK:[1.1,1.1,1.02,.92,.86,.8,.78],foot:{len:1.15,w:1,h:.85},
  paint(P,C){P.paint.leg=(m,s)=>m.s>.4&&m.r.part=='shin'&&Math.sin(m.y*80)>.5?C.FURD:C.FUR},
  paw:{n:4,len:[.022,.025,.025,.021],claw:.006,spread:.012,pad:true,curl:1.2,rad:1.15,colOf:C=>C.FUR},toes:{n:4,len:.034,claw:.008,pad:true,w:1.2,colOf:C=>C.FUR},
  TP:[[0,.6,-.08,.035],[0,.58,-.13,.04],[0,.555,-.17,.038],[0,.53,-.2,.03],[0,.51,-.215,.008]],tailCol:(m,C)=>m.i>2.6?0x1a1410:C.FUR,tail:{sway:.12,freq:1.3,lag:.4,stiff:.2}});
// ------------------------------------------------ OTTER ------------------------------------------------
fkSpecies('otter',{n:'Otter',cit:1,sc:.95,
  hp:{R:.092,W:1.02,H:.85,L:1.02,m:{len:.06,w:.06,h:.036,b:.04,tw:.04,th:.022,tb:.026,drop:.012,y0:-.026,z0:.3}},
  eyes:{sz:.85,fw:.85,brow:false},nose:'nose',noseSz:1.1,noseDy:.004,jaw:[.05,.11,{h:.6,w:.85}],whisk:[.085,1.118,5,.13,0xe8e4dc],
  ear:{t:'small',z:-.02,phi:1.0,len:.03,w:.02,th:.012,out:1.1,back:.2},
  skull(m,C){const z=m.r.p[2];if(m.s<-.1&&z>-.04)return C.FURL;if(z>.06&&m.s<.4)return C.FURL;return C.FUR},
  face(k,B,D,C){const t=D.SN[D.SN.length-1];[-1,1].forEach(s=>k.p('head','sph2','c',C.FURL,s*.026,t[1]-.006,t[0]-.016,.03,.022,.022))},
  cols:i=>fkCols([[0x5a4232],[0x6a4e3a],[0x4a382c]],i,{FURL:0xc8b49a,BELLY:0xb8a48a,EYE:0x0a0606}),
  body:{build:1,af:.92,lf:.92},neck:[.07,.075,.075],TR:[[1.06,1.08,1.06,1,1,1,1,1,1,1,1.2,1.25],[1,1,1,1,1,1,1,1,1,1,1.2,1.25],[1,1,1,1,1,1,1,1,1,1,1.2,1.25]],
  paw:{n:5,len:[.02,.024,.025,.024,.02],claw:.005,spread:.011,pad:false,curl:1,colOf:C=>C.FURD},handCol:C=>C.FURD,
  toes:{n:5,len:.036,claw:.007,pad:false,web:1,colOf:C=>C.FURD},toeCol:C=>C.FURD,
  TP:[[0,.58,-.08,.06],[0,.5,-.16,.058],[0,.4,-.24,.05],[0,.3,-.3,.042],[0,.2,-.35,.034],[0,.12,-.4,.026],[0,.07,-.46,.018],[0,.05,-.52,.01],[0,.048,-.55,.003]],
  tail:{sway:.1,freq:.8,lag:.5,stiff:.2}});
// ------------------------------------------------ GOAT / RAM / SHEEP ------------------------------------------------
var FK_CAPRA={hp:{R:.088,W:.92,H:.92,L:1.05,m:{len:.115,w:.044,h:.038,b:.04,tw:.026,th:.02,tb:.02,drop:.05,y0:-.03,z0:.3}},
  eyes:{sz:1.1,fw:.4,pupil:[.011,.003],brow:false},nose:'none',jaw:[.05,.16,{h:.6,w:.8}],
  ear:{t:'leaf',z:-.02,phi:1.1,len:.09,w:.05,th:.014,out:1.4,back:.25,tw:-.5},
  face(k,B,D,C){const t=D.SN[D.SN.length-1];k.p('head','sph2','c',C.PINKD,0,t[1]+.004,t[0]-.004,.02,.014,.012);[-1,1].forEach(s=>k.p('head','box','c',0x2a1a18,s*.008,t[1]+.004,t[0]+.006,.004,.006,.004,0,0,s*.4))},
  body:{build:1,af:.95,lf:.95},legK:[1.04,1.04,.98,.86,.78,.7,.66],foot:{len:.75,w:.75,h:.9},hoof:1,
  paw:{n:3,len:[.028,.032,.028],claw:.009,nail:1,spread:.0135,pad:false,curl:.8,rad:1.15,colOf:C=>C.FURD,clawCol:C=>C.HOOF},handCol:C=>C.FURD,
  TP:[[0,.58,-.1,.03],[0,.61,-.14,.035],[0,.63,-.17,.025],[0,.63,-.185,.006]],tail:{sway:.18,freq:2.2,lag:.3,stiff:.1},earAnim:{amp:.3,sv:.2,cyc:3.4}};
fkSpecies('goat',Object.assign({},FK_CAPRA,{n:'Goat',sc:1.0,
  skull(m,C){const z=m.r.p[2];if(m.s>.4&&z>.04&&Math.abs(m.c)<.4)return C.FURL;if(Math.abs(m.c)>.6&&m.s>-.1&&m.s<.5&&z>.0&&z<.12)return C.FURD;return C.FUR},
  face(k,B,D,C){FK_CAPRA.face(k,B,D,C);
    // horns sweeping back, ridged; a long beard
    [-1,1].forEach(s=>{const b=fkSurf(D,-.035,.35,-.004),P=[[s*b[0],b[1],b[2]],[s*(b[0]+.02),b[1]+.07,b[2]-.03],[s*(b[0]+.04),b[1]+.11,b[2]-.1],[s*(b[0]+.06),b[1]+.1,b[2]-.18],[s*(b[0]+.07),b[1]+.06,b[2]-.23]];
      fkHornLoft(B,P,t=>.022*(1-t*.82),C.HORN,1)});
    const t=D.SN[D.SN.length-1],j=[0,t[1]-.06,t[0]-.07];[[0,.1,0],[-.012,.085,.1],[.012,.085,-.1]].forEach(([dx,l])=>k.L('head','c',C.FURL,[j[0]+dx,j[1]+.015,j[2]],[j[0]+dx*1.5,j[1]-l,j[2]-.02],.018,.003,5))},
  cols:i=>fkCols([[0x8a7a66],[0xd8d0c0,{FURL:0xf0ece4,FURD:0x8a8070}],[0x5a4a3a]],i,{FURL:0xe8e2d8,BELLY:0xd0c8b8,EYE:0xc8a030,HORN:0x7a6a58})}));
fkSpecies('ram',Object.assign({},FK_CAPRA,{n:'Ram',sc:1.04,ear:Object.assign({},FK_CAPRA.ear,{z:-.0,phi:1.3,out:1.6,back:.4}),
  skull(m,C){const z=m.r.p[2];if(z<.02||m.s>.55&&z<.05)return C.WOOL;return C.FUR},
  face(k,B,D,C){FK_CAPRA.face(k,B,D,C);
    // a woolly poll on the brow, horns curling round the ears
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2,ph=.25+.6*Math.abs(Math.sin(a*1.3)),p=fkSurf(D,-.03+.05*Math.sin(a*2.1)*.5,ph*(i%2?1:-1),.002);k.p('head','dod','c',C.WOOL,p[0],p[1],p[2],.026,.022,.026)}
    [-1,1].forEach(s=>{const b=fkSurf(D,-.03,.62,-.006),c=[s*(b[0]+.04),b[1]-.03,b[2]-.03],P=[];
      for(let i=0;i<=14;i++){const t=i/14,a=t*Math.PI*1.75-.5,r=.085*(1-t*.45);P.push([s*(b[0]+.02+t*.045),c[1]+Math.cos(a)*r+.03*(1-t),c[2]-Math.sin(a)*r+.03])}
      fkHornLoft(B,P,t=>.034*(1-t*.72),C.HORN,1)})},
  cols:i=>fkCols([[0x3a3028,{WOOL:0xe0d8c8}],[0x2a2422,{WOOL:0xd0c8b8}],[0x8a7a66,{WOOL:0xf0ece0}]],i,{FURL:0xd8d0c0,BELLY:0xd8d0c0,EYE:0xc8a030,HORN:0xb8a888}),
  body:{build:2,af:1.05,lf:1,belly:.04},neck:[.075,.08,.08],
  paint(P,C){P.paint.torso=m=>C.WOOL;P.paint.torsoLo=m=>C.WOOL;P.col.neck=C.WOOL;P.paint.sleeve=()=>C.WOOL;P.paint.leg=(m,s)=>m.r.part=='hip'||m.r.part=='thigh'?C.WOOL:C.FUR},
  TP:[[0,.58,-.11,.04],[0,.57,-.16,.045],[0,.54,-.19,.035],[0,.52,-.2,.008]],tailCol:(m,C)=>C.WOOL}));
fkSpecies('sheep',Object.assign({},FK_CAPRA,{n:'Sheep',cit:1,sc:.96,ear:Object.assign({},FK_CAPRA.ear,{z:-.0,phi:1.25,out:1.7,back:.2}),
  skull(m,C){const z=m.r.p[2];if(z<-.02||m.s>.6&&z<.03)return C.WOOL;return C.FUR},
  face(k,B,D,C){FK_CAPRA.face(k,B,D,C);for(let i=0;i<16;i++){const p=fkSurf(D,-.075+(i%4)*.022,(Math.floor(i/4)-1.5)*.5,.004);k.p('head','dod','c',C.WOOL,p[0],p[1],p[2],.03,.026,.03)}},
  cols:i=>fkCols([[0xe8e0d0,{WOOL:0xf0ece4,FURD:0xa89a88}],[0x2a2422,{WOOL:0xe0dad0}],[0xd0b896,{WOOL:0xeee8dc}]],i,{FURL:0xf0ece4,BELLY:0xe8e2d8,EYE:0x6a5020}),
  body:{build:2,af:1,lf:.95,belly:.06},neck:[.075,.08,.08],
  paint(P,C){P.paint.torso=m=>C.WOOL;P.paint.torsoLo=m=>C.WOOL;P.col.neck=C.WOOL;P.paint.sleeve=()=>C.WOOL;P.paint.leg=(m,s)=>m.r.part=='hip'||m.r.part=='thigh'?C.WOOL:C.FUR},
  tailCol:(m,C)=>C.WOOL}));
// ------------------------------------------------ HEDGEHOG ------------------------------------------------
fkSpecies('hedgehog',{n:'Hedgehog',cit:1,sc:.84,
  hp:{R:.1,W:1,H:.9,L:1.05,m:{len:.1,w:.05,h:.035,b:.035,tw:.01,th:.009,tb:.008,drop:.04,y0:-.03,z0:.3}},
  eyes:{sz:.85,fw:.8,brow:false},nose:'nose',noseSz:.75,jaw:[.05,.15,{h:.6,w:.7}],whisk:[.13,1.1,2,.06],
  ear:{t:'round',z:.0,phi:1.1,len:.04,w:.026,th:.012,out:1.2,back:0},
  skull(m,C){const z=m.r.p[2];if(z<-.0&&m.s>-.3)return C.SPINE;return C.FUR},
  face(k,B,D,C){// spines over the crown and the back of the head, lying back
    for(let i=0;i<46;i++){const u=fkHash('hh'+i)%1000/1000,v=fkHash('hv'+i)%1000/1000,z=-.1+u*.105,ph=(v-.5)*2.6,p=fkSurf(D,z,ph,-.006),n=fkSurf(D,z-.02,ph*1.05,.05),d=[n[0]-p[0],n[1]-p[1]+.01,n[2]-p[2]-.03];
      fkDir(k,'head','cone4','c',i%3?C.SPINE:C.SPINEL,p,d,.07+u*.02,.012,.012)}},
  cols:i=>fkCols([[0xb8a080,{SPINE:0x4a3a2c,SPINEL:0xd8ccb4}],[0xa89070,{SPINE:0x5a4838,SPINEL:0xe0d4bc}],[0xc8b090,{SPINE:0x3a3028,SPINEL:0xc8bca4}]],i,{FURL:0xe0d4c0,BELLY:0xd8ccb8,EYE:0x0a0606}),
  body:{build:2,af:.9,lf:.88,belly:.08},paint(P,C){P.col.neck=C.SPINE},
  paw:{n:4,len:[.02,.023,.023,.019],claw:.006,spread:.0105,pad:false,curl:1,colOf:C=>C.PINKD},handCol:C=>C.PINKD,toes:{n:4,len:.03,claw:.008,pad:false,colOf:C=>C.PINKD},toeCol:C=>C.PINKD,
  TP:[[0,.58,-.11,.02],[0,.56,-.15,.016],[0,.55,-.17,.005]],tail:{sway:.03}});
// ------------------------------------------------ SQUIRREL ------------------------------------------------
fkSpecies('squirrel',{n:'Squirrel',cit:1,sc:.84,
  hp:{R:.096,W:.98,H:.95,L:1.02,m:{len:.06,w:.05,h:.04,b:.04,tw:.022,th:.018,tb:.018,drop:.024,y0:-.026,z0:.32}},
  eyes:{sz:1.1,fw:.6,brow:false},nose:'pink',noseSz:.7,jaw:[.05,.1,{h:.6,w:.75}],whisk:[.08,1.13,3,.08],
  ear:{t:'tri',z:-.03,phi:.45,len:.065,w:.036,th:.014,out:.2,back:.05,tw:.1,tuft:C=>C.FUR,tuftL:.035},
  skull(m,C){const z=m.r.p[2];if(m.s<-.25&&z>-.02)return C.FURL;if(Math.abs(m.c)>.6&&Math.abs(z-this.EYEP[2])<.025&&m.s>-.1&&m.s<.6)return C.FURL;return C.FUR},
  face(k,B,D,C){const t=D.SN[D.SN.length-1];[-1,1].forEach(s=>k.p('head','box','c',0xd8a040,s*.0045,t[1]-.02,t[0]-.006,.008,.016,.005,.1,0,0))},
  cols:i=>fkCols([[0xb8582a],[0x8a5a3a],[0x7a7270]],i,{FURL:0xeee4d4,BELLY:0xeee4d4,EYE:0x0a0606}),
  body:{build:0,af:.88,lf:.92},foot:{len:1.15,w:.85,h:.85},paw:{n:4,len:[.022,.026,.026,.021],claw:.007,spread:.0105,pad:false,curl:1.2,colOf:C=>C.FURD},handCol:C=>C.FURD,
  toes:{n:4,len:.04,claw:.01,pad:false,colOf:C=>C.FURD},toeCol:C=>C.FURD,
  // the big tail curls up the back and over
  TP:[[0,.56,-.1,.04],[0,.58,-.18,.07],[0,.66,-.26,.09],[0,.78,-.3,.1],[0,.92,-.31,.1],[0,1.05,-.28,.095],[0,1.15,-.23,.085],[0,1.21,-.17,.07],[0,1.23,-.12,.05],[0,1.22,-.09,.02],[0,1.21,-.08,.005]],
  tailCol:(m,C)=>m.s<-.5?C.FURD:C.FUR,tail:{sway:.08,freq:1.4,lag:.45,stiff:.3}});
// ------------------------------------------------ BEAVER ------------------------------------------------
fkSpecies('beaver',{n:'Beaver',cit:1,sc:.98,
  hp:{R:.1,W:1.05,H:.92,L:1,m:{len:.065,w:.058,h:.044,b:.044,tw:.036,th:.026,tb:.026,drop:.024,y0:-.028,z0:.3}},
  eyes:{sz:.75,fw:.75,brow:false},nose:'nose',noseSz:1,noseDy:.004,jaw:[.05,.12,{h:.7,w:.85}],whisk:[.09,1.12,3,.1,0x2a2420],
  ear:{t:'small',z:-.03,phi:.95,len:.032,w:.022,th:.012,out:1.1,back:.2},
  face(k,B,D,C){const t=D.SN[D.SN.length-1];[-1,1].forEach(s=>k.p('head','box','c',0xd88a2a,s*.0075,t[1]-.026,t[0]-.008,.013,.028,.007,.1,0,0));[-1,1].forEach(s=>k.p('head','sph2','c',C.FURL,s*.022,t[1]-.008,t[0]-.014,.026,.02,.018))},
  cols:i=>fkCols([[0x6a4428],[0x5a3a24],[0x7a5432]],i,{FURL:0x9a7a5a,BELLY:0x8a6a4a,EYE:0x0a0606}),
  body:{build:2,af:1,lf:.95,belly:.1},neck:[.075,.08,.08],paw:{n:5,len:[.02,.024,.025,.024,.02],claw:.008,spread:.011,pad:false,curl:1,colOf:C=>0x2a2420},handCol:C=>0x2a2420,
  toes:{n:5,len:.04,claw:.01,pad:false,web:1,colOf:C=>0x2a2420},toeCol:C=>0x2a2420,
  TP:[[0,.56,-.1,.04],[0,.48,-.18,.042],[0,.38,-.24,.036],[0,.28,-.29,.03],[0,.18,-.33,.026],[0,.1,-.37,.02],[0,.07,-.41,.008]],
  tailKit(k,D,C){// the flat scaly paddle along the tail
    [[2,.3,-.265,.07,.11],[3,.21,-.31,.075,.1],[4,.13,-.35,.065,.09]].forEach(([i,y,z,w,l])=>k.p('tl'+i,'sph2','c',i%2?0x2a2622:0x342e2a,0,y,z,w,.016,l*.6,.55,0,0))},
  tailCol:(m,C)=>m.i>1.5?0x2a2622:C.FUR,tail:{sway:.06,freq:.7,lag:.3,stiff:.6}});
// ------------------------------------------------ MOLE ------------------------------------------------
fkSpecies('mole',{n:'Mole',cit:1,sc:.84,
  hp:{R:.1,W:1.02,H:.88,L:1.02,m:{len:.1,w:.045,h:.032,b:.03,tw:.016,th:.014,tb:.012,drop:.03,y0:-.03,z0:.3}},
  eyes:{sz:.45,fw:.8,brow:false},nose:'pink',noseSz:1.15,jaw:[.05,.14,{h:.55,w:.7}],whisk:[.12,1.105,3,.07,0xe8d8d0],
  ear:{t:'none'},
  cols:i=>fkCols([[0x2e2a30],[0x3a3238],[0x4a4044]],i,{FURL:0x5a5458,BELLY:0x4a4448,EYE:0x0a0606,PINK:0xd89a9a}),
  body:{build:2,af:1.05,lf:.88,belly:.06},neck:[.075,.08,.08],
  paw:{n:5,len:[.022,.026,.027,.026,.022],claw:.016,spread:.013,palm:1.25,pad:false,curl:.6,rad:1.15,colOf:C=>C.PINK},handCol:C=>C.PINK,
  toes:{n:5,len:.03,claw:.012,pad:false,colOf:C=>C.PINK},toeCol:C=>C.PINK,
  TP:[[0,.56,-.1,.022],[0,.52,-.15,.018],[0,.47,-.18,.012],[0,.45,-.19,.004]],tail:{sway:.05}});
// ------------------------------------------------ FERRET ------------------------------------------------
fkSpecies('ferret',{n:'Ferret',cit:1,sc:.9,
  hp:{R:.088,W:.95,H:.85,L:1.08,m:{len:.06,w:.046,h:.034,b:.032,tw:.016,th:.013,tb:.012,drop:.02,y0:-.024,z0:.32}},
  eyes:{sz:.85,fw:.8,brow:false},nose:'pink',noseSz:.75,jaw:[.05,.11,{h:.6,w:.75}],whisk:[.075,1.12,3,.09,0xe8e4dc],
  ear:{t:'round',z:-.025,phi:.85,len:.04,w:.028,th:.012,out:1.0,back:.1,col:C=>C.FURL},
  skull(m,C){const z=m.r.p[2];if(fkMask(this,m,.03))return C.FURD;if(z>.035||m.s<-.2)return C.FURL;return C.FUR},
  cols:i=>fkCols([[0x8a6a4a],[0x6a5444],[0xd8ccb4,{FURD:0xa89880}]],i,{FURL:0xf0e8dc,BELLY:0xe8dccb,EYE:0x0a0606}),
  body:{build:0,wf:.92,af:.82,lf:.85},
  paw:{n:5,len:[.018,.022,.023,.022,.018],claw:.006,spread:.01,pad:true,curl:1.1,colOf:C=>C.FURD},handCol:C=>C.FURD,toes:{n:5,len:.03,claw:.008,pad:true,colOf:C=>C.FURD},toeCol:C=>C.FURD,
  TP:[[0,.58,-.09,.03],[0,.53,-.17,.036],[0,.44,-.25,.036],[0,.34,-.31,.033],[0,.24,-.35,.029],[0,.15,-.38,.024],[0,.1,-.42,.016],[0,.085,-.45,.004]],tailCol:(m,C)=>m.i>4?C.FURD:C.FUR,tail:{sway:.14,freq:1.1,lag:.55,stiff:.1}});
// ------------------------------------------------ BAT ------------------------------------------------
fkSpecies('bat',{n:'Bat',cit:1,sc:.86,
  hp:{R:.095,W:1,H:.95,L:.95,m:{len:.045,w:.04,h:.034,b:.032,tw:.02,th:.016,tb:.016,drop:.018,y0:-.026,z0:.35}},
  eyes:{sz:.8,fw:.9,brow:false},nose:'none',jaw:[.05,.09,{h:.6,w:.75}],
  ear:{t:'tri',z:-.025,phi:.6,len:.13,w:.065,th:.014,out:.45,back:.08,tw:.25,inner:C=>0x7a4a52},
  face(k,B,D,C){const t=D.SN[D.SN.length-1];k.p('head','cone4','c',0x3a2228,0,t[1]+.016,t[0]-.004,.012,.03,.006);[-1,1].forEach(s=>{k.p('head','box','c',0x0a0606,s*.006,t[1]+.002,t[0]+.008,.004,.004,.004);k.p('head','cone4','c',0xf0ece4,s*.012,t[1]-.022,t[0]-.01,.004,.012,.004,Math.PI)})},
  cols:i=>fkCols([[0x4a3a34],[0x3a2e2c],[0x6a5040]],i,{FURL:0x7a6458,BELLY:0x6a564a,EYE:0x0a0606,PINK:0x6a4048}),
  body:{build:0,af:.85,lf:.82},handCol:C=>0x2a2024,
  paw:{n:3,len:[.04,.046,.04],claw:.006,spread:.012,pad:false,curl:.8,colOf:C=>0x2a2024},toes:{n:4,len:.032,claw:.012,pad:false,colOf:C=>0x2a2024},toeCol:C=>0x2a2024,
  TP:[[0,.56,-.1,.016],[0,.53,-.13,.01],[0,.52,-.14,.003]],tail:{sway:.02},earAnim:{amp:.3,sv:.25,cyc:3}});
// ------------------------------------------------ HOUND ------------------------------------------------
fkSpecies('hound',{n:'Hound',cit:1,sc:1.0,
  hp:{R:.098,W:.95,H:.92,L:1.02,m:{len:.105,w:.054,h:.05,b:.05,tw:.036,th:.03,tb:.034,drop:.04,y0:-.03,z0:.3}},
  eyes:{sz:.95,fw:.85},nose:'nose',noseSz:1.15,jaw:[.04,.15,{h:.9,w:.85}],
  ear:{t:'long',z:-.035,phi:1.25,len:.13,w:.07,th:.014,out:2.75,back:-.1,tw:1.5},
  skull(m,C){const z=m.r.p[2];if(z>.07&&(m.s<.3||Math.abs(m.c)<.3))return C.FURL;if(m.s>.5&&Math.abs(m.c)<.25&&z>-.04)return C.FURL;return C.FUR},
  face(k,B,D,C){const t=D.SN[D.SN.length-1];[-1,1].forEach(s=>k.p('head','sph2','c',C.FUR,s*.03,t[1]-.03,t[0]-.04,.026,.03,.04))},
  cols:i=>fkCols([[0x9a6a3a],[0x5a3a2a],[0xc8b8a0,{FURD:0x8a6a4a}]],i,{FURL:0xeee8dc,BELLY:0xe8e0d0,EYE:0x4a2a14}),
  body:{build:1,af:.98,lf:1},paw:{n:4,len:[.024,.028,.028,.023],claw:.008,spread:.012,pad:true,curl:1,colOf:C=>C.FUR},toes:{n:4,len:.038,claw:.01,pad:true,colOf:C=>C.FUR},
  TP:[[0,.6,-.09,.03],[0,.62,-.16,.032],[0,.66,-.23,.028],[0,.72,-.28,.022],[0,.78,-.31,.016],[0,.82,-.32,.008],[0,.83,-.32,.003]],tailCol:(m,C)=>m.i>4.5?C.FURL:C.FUR,tail:{sway:.3,freq:1.8,lag:.4,stiff:0},earAnim:{amp:.15,sv:.05}});
