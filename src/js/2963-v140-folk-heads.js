// ================= v140: townsfolk head recipes (sculpted from each animal's anatomy) =================
// Head-local metres from FKS.C0 (+z forward, +y up, x mirrored). Forms: E ellipsoid (centre, radii), RC round cone (a, b,
// radius at a, radius at b), SP sphere; k = blend width, sub = carve. Proportions follow the real skulls: muzzle length
// against the brain case, where the stop sits, eye position (forward for hunters, to the side for prey), cheekbone width.
// eye {c centre (in the socket), g gaze, r radius}, ear base, neck [y, z, r] (where the neck meets the skull), whisk.
var FKH={};
FKH.E=(c,r,o)=>Object.assign({t:'ell',c,r},o||{});FKH.RC=(a,b,ra,rb,o)=>Object.assign({t:'rcone',a,b,ra,rb},o||{});FKH.SP=(c,r,o)=>Object.assign({t:'sph',c,r},o||{});
// the line where the upper muzzle meets the lower jaw (for painting the mouth): y at z between two points
FKH.lerpY=(z,z0,y0,z1,y1)=>y0+(y1-y0)*Math.max(0,Math.min(1,(z-z0)/(z1-z0)));
FKH.add=function(key,S,A){const D=FK137.sp[key];if(!D)return;D.sculpt=S;const F=FK140.sp[key];if(F){F.hs=1;Object.assign(F,A||{})}};
// ------------------------------------------------ FOX ------------------------------------------------
// red fox: long narrow muzzle (half the head's length), steep forehead, eyes set forward and up, white cheeks and jaw
FKH.add('fox',{R:.094,bb:[-.13,-.12,-.14,.13,.12,.2],
  forms:[FKH.E([0,0,-.02],[.074,.068,.088]),
    FKH.E([.05,-.022,.02],[.034,.03,.05],{k:.025}),                      // cheekbones
    FKH.E([.032,.03,.045],[.026,.016,.03],{k:.02}),                      // brow
    FKH.E([.062,-.042,-.012],[.028,.034,.04],{k:.03}),                   // cheek fur
    FKH.RC([0,-.012,.055],[0,-.03,.16],.036,.014,{k:.03,sq:[1,.92]}),    // muzzle
    FKH.E([0,-.024,.163],[.014,.011,.011],{k:.006}),                     // nose pad
    FKH.RC([0,-.045,.03],[0,-.047,.13],.026,.011,{k:.012}),              // lower jaw
    FKH.SP([.04,.024,.07],.017,{sub:1,k:.008})],                         // eye socket
  eye:{c:[.039,.024,.072],g:[.62,.08,.78],r:.0135},ear:[.042,.058,-.03],neck:[-.055,-.06,.044],whisk:{p:[.018,-.034,.13],n:3,len:.08,col:0x1a1410},
  paint(p,n,C){const z=p[2],y=p[1],ym=FKH.lerpY(z,.05,-.05,.15,-.043);
    if(z>.152&&y>-.04)return C.NOSE;
    if(z>.06&&Math.abs(y-ym)<.003)return C.MOUTH;
    if(y<ym||y<-.022&&z>-.03||(Math.abs(p[0])>.045&&y<-.008&&z>-.04))return C.FURL;
    return C.FUR}});
// ------------------------------------------------ BEAR ------------------------------------------------
// brown bear: broad domed skull, wide cheeks, short blunt muzzle, big nose pad, small eyes set wide, round ears high
FKH.add('bear',{R:.11,bb:[-.16,-.14,-.15,.16,.14,.2],
  forms:[FKH.E([0,.005,-.02],[.102,.088,.098]),
    FKH.E([0,.04,.03],[.07,.05,.06],{k:.03}),                            // forehead
    FKH.E([.074,-.03,.01],[.048,.045,.06],{k:.04}),                      // jowls
    FKH.RC([0,-.02,.06],[0,-.028,.148],.048,.031,{k:.035,sq:[1.05,.9]}), // muzzle
    FKH.E([0,-.012,.162],[.026,.019,.016],{k:.008}),                     // nose pad
    FKH.RC([0,-.058,.04],[0,-.058,.13],.034,.021,{k:.015}),              // lower jaw
    FKH.SP([.05,.03,.074],.017,{sub:1,k:.008})],
  eye:{c:[.049,.031,.078],g:[.5,.06,.86],r:.0145},ear:[.074,.074,-.03],neck:[-.07,-.06,.066],
  paint(p,n,C){const z=p[2],y=p[1],ym=FKH.lerpY(z,.06,-.065,.14,-.05);
    if(z>.148&&y>-.032)return C.NOSE;
    if(z>.07&&Math.abs(y-ym)<.003)return C.MOUTH;
    if(z>.075&&y<.0||y<ym)return C.FURL;
    return C.FUR}});
// ------------------------------------------------ HARE ------------------------------------------------
// brown hare: long head, big eyes high on the sides, blunt rounded muzzle, puffy whisker pads, split lip, pink nose
FKH.add('hare',{R:.088,bb:[-.12,-.11,-.12,.12,.12,.16],
  forms:[FKH.E([0,0,-.015],[.06,.065,.082]),
    FKH.E([.04,-.02,.025],[.03,.035,.045],{k:.025}),                     // cheeks
    FKH.RC([0,-.008,.04],[0,-.022,.108],.038,.027,{k:.03}),              // muzzle
    FKH.E([.016,-.034,.104],[.018,.016,.016],{k:.008}),                  // whisker pads
    FKH.E([0,-.018,.123],[.009,.007,.006],{k:.004}),                     // nose
    FKH.RC([0,-.044,.02],[0,-.048,.09],.022,.012,{k:.012}),              // lower jaw
    FKH.SP([.052,.022,.036],.017,{sub:1,k:.006})],
  eye:{c:[.05,.022,.04],g:[.92,.08,.38],r:.0162},ear:[.03,.058,-.035],neck:[-.05,-.06,.04],whisk:{p:[.026,-.033,.104],n:3,len:.09,col:0xe8e0d0},
  extra(k,B,D,C){const C0=FKS.C0;[-1,1].forEach(s=>k.p('head','box','c',C.TOOTH,s*.0042,C0[1]-.052,C0[2]+.108,.0075,.014,.004,.1,0,0))},
  paint(p,n,C){const z=p[2],y=p[1],x=Math.abs(p[0]);
    if(z>.115&&y>-.026)return C.PINK;
    if(z>.1&&x<.0025&&y<-.022)return C.MOUTH;
    if(z>.08&&y<-.012||y<-.045)return C.FURL;
    return C.FUR}});
// ------------------------------------------------ STAG / DOE ------------------------------------------------
// red deer: long tapering face, eyes on the sides under a bony rim, narrow muzzle ending in a dark moist nose
FKH.deer={R:.085,bb:[-.12,-.12,-.13,.12,.12,.24],
  forms:[FKH.E([0,.01,-.03],[.062,.062,.074]),
    FKH.RC([0,-.004,.03],[0,-.034,.2],.045,.021,{k:.035,sq:[.95,1.05]}),  // face
    FKH.E([.04,-.026,.04],[.024,.03,.05],{k:.025}),                      // cheek
    FKH.E([.044,.024,.03],[.02,.02,.026],{k:.015}),                      // orbit rim
    FKH.E([0,-.028,.205],[.022,.018,.014],{k:.01}),                      // nose
    FKH.RC([0,-.05,0],[0,-.057,.18],.03,.014,{k:.015}),                  // lower jaw
    FKH.SP([.052,.022,.05],.015,{sub:1,k:.006})],
  eye:{c:[.051,.022,.053],g:[.9,.06,.42],r:.0152},ear:[.04,.05,-.04],neck:[-.05,-.06,.046],
  paint(p,n,C){const z=p[2],y=p[1],x=Math.abs(p[0]),ym=FKH.lerpY(z,.02,-.06,.19,-.05);
    if(z>.19&&y>-.045)return 0x1a1412;
    if(z>.165&&z<=.19)return C.FURL;
    if(z>.05&&Math.abs(y-ym)<.003)return C.MOUTH;
    if(y<ym)return C.FURL;
    return y>.03&&z<.02?C.FURD:C.FUR}};
FKH.add('stag',Object.assign({},FKH.deer,{extra(k,B,D,C,P){fkAntlers(k,D,C,{z:-.04,phi:.38,len:.28,seg:5,r:.019,tines:[[.3,.09,.5],[.55,.1,.35],[.8,.08,.2],[1,.06,-.1]]})}}));
FKH.add('doe',Object.assign({},FKH.deer,{extra(){}}));
// ------------------------------------------------ WOLF ------------------------------------------------
// grey wolf: heavier than the fox, broad cheekbones and a cheek ruff, long deep muzzle, small eyes set forward
FKH.add('wolf',{R:.1,bb:[-.15,-.13,-.15,.15,.13,.22],
  forms:[FKH.E([0,0,-.025],[.082,.074,.095]),
    FKH.E([.058,-.02,.015],[.04,.034,.055],{k:.028}),
    FKH.E([.036,.034,.05],[.03,.018,.032],{k:.02}),
    FKH.E([.072,-.045,-.02],[.034,.042,.046],{k:.032}),
    FKH.RC([0,-.012,.06],[0,-.03,.175],.042,.02,{k:.032,sq:[1,.95]}),
    FKH.E([0,-.022,.18],[.017,.013,.012],{k:.006}),
    FKH.RC([0,-.05,.03],[0,-.05,.15],.03,.014,{k:.013}),
    FKH.SP([.044,.026,.075],.018,{sub:1,k:.008})],
  eye:{c:[.043,.026,.077],g:[.6,.08,.8],r:.0138},ear:[.045,.064,-.035],neck:[-.06,-.065,.05],
  paint(p,n,C){const z=p[2],y=p[1],x=Math.abs(p[0]),ym=FKH.lerpY(z,.06,-.058,.17,-.048);
    if(z>.168&&y>-.04)return C.NOSE;if(z>.07&&Math.abs(y-ym)<.003)return C.MOUTH;
    if(y<ym||(y<-.02&&z>.04)||(x>.06&&y<-.02))return C.FURL;if(y>.05&&z<.03)return C.FURD;return C.FUR}});
// ------------------------------------------------ HOUND ------------------------------------------------
// scent hound: domed skull, clear stop, square muzzle with hanging lips, big nose, kind eyes, long drop ears
FKH.add('hound',{R:.098,bb:[-.14,-.14,-.14,.14,.13,.2],
  forms:[FKH.E([0,.005,-.02],[.075,.075,.088]),
    FKH.E([.034,.032,.045],[.026,.016,.028],{k:.02}),
    FKH.E([.05,-.025,.015],[.034,.034,.05],{k:.025}),
    FKH.RC([0,-.016,.055],[0,-.026,.15],.04,.029,{k:.03,sq:[1,1.1]}),    // long muzzle
    FKH.RC([0,-.044,.06],[0,-.05,.138],.036,.026,{k:.03,sq:[1.12,.8]}),  // hanging upper lips: a broad square block under it
    FKH.E([0,-.016,.155],[.017,.013,.011],{k:.007}),
    FKH.RC([0,-.066,.04],[0,-.066,.118],.024,.016,{k:.012}),
    FKH.SP([.042,.025,.07],.016,{sub:1,k:.007})],
  eye:{c:[.041,.025,.072],g:[.55,.04,.83],r:.0152},ear:[.06,.035,-.02],neck:[-.06,-.065,.05],
  extra(){},   // (the v137 hound face added round jowl balls)
  paint(p,n,C){const z=p[2],y=p[1],x=Math.abs(p[0]),ym=FKH.lerpY(z,.06,-.074,.14,-.068);
    if(z>.146&&y>-.032)return C.NOSE;if(z>.08&&Math.abs(y-ym)<.003)return C.MOUTH;
    if(x<.016&&z>-.03&&y>-.03)return C.FURL;if(z>.095||y<-.04)return C.FURL;return y>.04&&z<0?C.FURD:C.FUR}});
// ------------------------------------------------ LYNX ------------------------------------------------
// lynx: round face framed by a barred ruff, short muzzle with full whisker pads, big forward eyes, small chin
FKH.add('lynx',{R:.1,bb:[-.15,-.15,-.14,.15,.13,.15],
  forms:[FKH.E([0,.005,-.02],[.08,.075,.082]),
    FKH.E([.064,-.035,-.005],[.036,.045,.045],{k:.03}),                  // ruff
    FKH.E([.074,-.066,-.02],[.024,.032,.03],{k:.03}),
    FKH.E([.034,.034,.045],[.026,.016,.026],{k:.018}),
    FKH.RC([0,-.015,.05],[0,-.025,.098],.036,.026,{k:.028}),
    FKH.E([.016,-.034,.09],[.016,.014,.015],{k:.008}),                  // whisker pads
    FKH.E([0,-.016,.102],[.009,.007,.006],{k:.004}),
    FKH.E([0,-.054,.07],[.016,.012,.016],{k:.01}),                      // chin
    FKH.RC([0,-.05,.02],[0,-.052,.075],.024,.015,{k:.012}),
    FKH.SP([.04,.024,.066],.018,{sub:1,k:.008})],
  eye:{c:[.039,.024,.069],g:[.45,.06,.89],r:.0162},ear:[.05,.06,-.03],neck:[-.06,-.065,.05],whisk:{p:[.022,-.036,.092],n:4,len:.1,col:0xf0ece4},
  extra(){},
  paint(p,n,C){const z=p[2],y=p[1],x=Math.abs(p[0]);
    if(z>.098&&y>-.024)return C.PINK;if(x<.0025&&z>.09&&y<-.024)return C.MOUTH;
    if(x>.06&&y<-.03)return y<-.06?mdMix(C.FURL,0x1a1410,.35):C.FURL;
    if(z>.07&&y<-.02&&x<.03||y<-.05&&x<.03)return C.FURL;return C.FUR}});
// ------------------------------------------------ RACCOON ------------------------------------------------
// raccoon: wide cheeks, pointed muzzle, rounded ears; the black mask, white brows and muzzle, dark stripe down the nose
FKH.add('raccoon',{R:.098,bb:[-.14,-.13,-.14,.14,.12,.18],
  forms:[FKH.E([0,.005,-.02],[.08,.07,.085]),
    FKH.E([.06,-.02,.01],[.042,.036,.05],{k:.028}),
    FKH.E([.032,.03,.045],[.026,.015,.028],{k:.018}),
    FKH.RC([0,-.015,.055],[0,-.03,.135],.033,.014,{k:.028}),
    FKH.E([0,-.024,.14],[.013,.011,.01],{k:.006}),
    FKH.RC([0,-.045,.03],[0,-.046,.11],.024,.01,{k:.012}),
    FKH.SP([.04,.022,.068],.017,{sub:1,k:.008})],
  eye:{c:[.039,.022,.07],g:[.6,.07,.8],r:.0148},ear:[.048,.055,-.03],neck:[-.055,-.062,.046],whisk:{p:[.016,-.032,.11],n:3,len:.07,col:0xe8e4dc},
  extra(){},
  paint(p,n,C){const z=p[2],y=p[1],x=Math.abs(p[0]),ym=FKH.lerpY(z,.05,-.05,.13,-.04);
    if(z>.13&&y>-.035)return C.NOSE;if(z>.07&&Math.abs(y-ym)<.003)return C.MOUTH;
    if(x<.012&&y>-.012&&z>.02&&z<.13)return 0x3a3230;
    const my=.02-Math.max(0,1-Math.abs(x-.04)/.03)*.012;if(Math.abs(y-my)<.02&&z>.0&&z<.1&&x>.012)return 0x141010;
    if(y>.038&&y<.058&&z>.0&&z<.09&&x>.012)return 0xe8e4dc;
    if(z>.085&&y<.0||y<ym)return 0xe8e4dc;return y>.05&&z<0?C.FURD:C.FUR}});
// ------------------------------------------------ OTTER ------------------------------------------------
// otter: flat broad skull, short wide muzzle with big whisker pads, small eyes high and forward, tiny ears low
FKH.add('otter',{R:.092,bb:[-.14,-.14,-.14,.14,.11,.16],
  forms:[FKH.E([0,0,-.02],[.08,.062,.09]),
    FKH.RC([0,-.018,.05],[0,-.022,.112],.042,.034,{k:.03,sq:[1.15,.85]}),
    FKH.E([.026,-.03,.1],[.026,.02,.022],{k:.01}),
    FKH.E([0,-.006,.128],[.016,.011,.009],{k:.006}),
    FKH.RC([0,-.045,.03],[0,-.046,.1],.026,.018,{k:.012}),
    FKH.SP([.04,.03,.06],.014,{sub:1,k:.006})],
  eye:{c:[.039,.03,.062],g:[.55,.15,.82],r:.0128},ear:[.07,.02,-.03],neck:[-.05,-.065,.058],whisk:{p:[.036,-.03,.105],n:5,len:.1,col:0xe8e4dc},
  extra(){},
  paint(p,n,C){const z=p[2],y=p[1];if(z>.124&&y>-.012&&Math.abs(p[0])<.019)return C.NOSE;if(z>.06&&y<-.026||y<-.04)return C.FURL;return C.FUR}});
// ------------------------------------------------ BEAVER ------------------------------------------------
// beaver: big round head, blunt muzzle, orange incisors, small eyes high, small ears
FKH.add('beaver',{R:.1,bb:[-.15,-.14,-.14,.15,.13,.16],
  forms:[FKH.E([0,.005,-.02],[.088,.08,.09]),
    FKH.E([.06,-.03,.02],[.045,.04,.05],{k:.03}),
    FKH.RC([0,-.02,.05],[0,-.026,.115],.045,.034,{k:.03,sq:[1.1,.95]}),
    FKH.E([.024,-.034,.105],[.024,.02,.02],{k:.01}),
    FKH.E([0,-.008,.128],[.016,.011,.009],{k:.006}),
    FKH.RC([0,-.055,.03],[0,-.056,.1],.03,.02,{k:.012}),
    FKH.SP([.045,.035,.055],.013,{sub:1,k:.006})],
  eye:{c:[.044,.035,.057],g:[.7,.1,.7],r:.0125},ear:[.07,.04,-.03],neck:[-.06,-.068,.062],whisk:{p:[.034,-.032,.11],n:3,len:.09,col:0x2a2420},
  extra(k,B,D,C){const C0=FKS.C0;[-1,1].forEach(s=>k.p('head','box','c',0xd88a2a,s*.0072,C0[1]-.052,C0[2]+.12,.012,.026,.007,.1,0,0))},
  paint(p,n,C){const z=p[2],y=p[1];if(z>.124&&y>-.012&&Math.abs(p[0])<.019)return 0x1e1818;if(z>.07&&y<-.012)return C.FURL;return C.FUR}});
// ------------------------------------------------ MOLE ------------------------------------------------
// mole: velvet head with no outer ears, pin-prick eyes, a long naked pink snout
FKH.add('mole',{R:.1,bb:[-.14,-.13,-.14,.14,.11,.22],
  forms:[FKH.E([0,-.005,-.015],[.08,.065,.095]),
    FKH.RC([0,-.02,.06],[0,-.025,.18],.04,.014,{k:.03}),
    FKH.E([0,-.024,.185],[.016,.013,.01],{k:.006}),
    FKH.RC([0,-.045,.02],[0,-.046,.12],.025,.01,{k:.012})],
  eye:{c:[.046,.006,.07],g:[.7,.1,.7],r:.0055},neck:[-.05,-.062,.06],whisk:{p:[.014,-.028,.16],n:3,len:.06,col:0xe8d8d0},
  extra(){},
  paint(p,n,C){const z=p[2];if(z>.14)return C.PINK;return C.FUR}});
// ------------------------------------------------ HEDGEHOG ------------------------------------------------
// hedgehog: soft pale face with a pointed snout and dark eye patches; the spines start across the brow
FKH.add('hedgehog',{R:.1,bb:[-.14,-.13,-.14,.14,.12,.18],
  forms:[FKH.E([0,0,-.02],[.08,.072,.088]),
    FKH.E([.05,-.03,.02],[.035,.035,.045],{k:.025}),
    FKH.RC([0,-.02,.05],[0,-.03,.15],.036,.012,{k:.028}),
    FKH.E([0,-.028,.155],[.011,.009,.008],{k:.005}),
    FKH.RC([0,-.048,.03],[0,-.048,.12],.024,.01,{k:.012}),
    FKH.SP([.042,.018,.06],.013,{sub:1,k:.006})],
  eye:{c:[.041,.018,.062],g:[.6,.05,.8],r:.0118},ear:[.055,.04,-.02],neck:[-.05,-.062,.05],whisk:{p:[.012,-.03,.13],n:3,len:.05},
  extra(k,B,D,C){FK137.sp.hedgehog.face0(k,B,D,C)},
  paint(p,n,C){const z=p[2],y=p[1],x=Math.abs(p[0]);if(z>.148)return C.NOSE;if(Math.hypot(x-.042,y-.018,z-.06)<.024)return C.FURD;return y>.01&&z<.02?C.SPINE:C.FUR}});
// ------------------------------------------------ FERRET ------------------------------------------------
// ferret: long narrow head, short muzzle, small round ears; the dark mask band through the eyes
FKH.add('ferret',{R:.088,bb:[-.13,-.12,-.14,.13,.11,.16],
  forms:[FKH.E([0,0,-.02],[.07,.06,.09]),
    FKH.RC([0,-.012,.05],[0,-.022,.12],.034,.016,{k:.028}),
    FKH.E([.016,-.03,.105],[.016,.014,.016],{k:.008}),
    FKH.E([0,-.018,.125],[.011,.009,.008],{k:.005}),
    FKH.RC([0,-.04,.03],[0,-.04,.105],.022,.01,{k:.012}),
    FKH.SP([.036,.02,.062],.014,{sub:1,k:.006})],
  eye:{c:[.035,.02,.064],g:[.6,.08,.8],r:.0128},ear:[.055,.04,-.03],neck:[-.05,-.058,.042],whisk:{p:[.02,-.03,.105],n:3,len:.07,col:0xe8e4dc},
  extra(){},
  paint(p,n,C){const z=p[2],y=p[1],x=Math.abs(p[0]);if(z>.118&&y>-.026)return C.PINK;
    if(Math.abs(y-.02)<.018&&z>.02&&z<.09&&x>.012)return C.FURD;if(z>.07||y<-.025)return C.FURL;return C.FUR}});
// ------------------------------------------------ BAT ------------------------------------------------
// bat: short snout with a leaf nose, small eyes, fangs, the huge ears
FKH.add('bat',{R:.095,bb:[-.13,-.12,-.13,.13,.12,.14],
  forms:[FKH.E([0,.005,-.02],[.075,.07,.08]),
    FKH.RC([0,-.012,.045],[0,-.022,.098],.034,.02,{k:.026}),
    FKH.E([0,-.01,.1],[.009,.012,.006],{k:.006}),
    FKH.RC([0,-.042,.02],[0,-.044,.09],.024,.012,{k:.012}),
    FKH.SP([.034,.018,.058],.012,{sub:1,k:.006})],
  eye:{c:[.033,.018,.06],g:[.55,.05,.83],r:.0112},ear:[.045,.05,-.02],neck:[-.05,-.06,.046],
  extra(k,B,D,C){const C0=FKS.C0;[-1,1].forEach(s=>k.p('head','cone4','c',0xf0ece4,s*.012,C0[1]-.05,C0[2]+.086,.004,.012,.004,Math.PI))},
  paint(p,n,C){const z=p[2],y=p[1];if(z>.097&&y>-.022&&Math.abs(p[0])<.012)return 0x3a2228;if(z>.06&&y<-.03)return mdSh(C.FUR,.8);return C.FUR}});
// ------------------------------------------------ MOUSE ------------------------------------------------
// mouse: round head, pointed muzzle, very big dark eyes, pink nose, the huge round ears
FKH.add('mouse',{R:.1,bb:[-.13,-.12,-.13,.13,.12,.16],
  forms:[FKH.E([0,0,-.02],[.075,.07,.085]),
    FKH.E([.045,-.025,.03],[.03,.03,.04],{k:.022}),
    FKH.RC([0,-.012,.045],[0,-.022,.13],.034,.012,{k:.028}),
    FKH.E([.014,-.028,.115],[.015,.013,.016],{k:.008}),
    FKH.E([0,-.019,.134],[.009,.008,.007],{k:.004}),
    FKH.RC([0,-.04,.03],[0,-.042,.11],.02,.009,{k:.012}),
    FKH.SP([.042,.02,.05],.018,{sub:1,k:.007})],
  eye:{c:[.041,.02,.053],g:[.7,.08,.7],r:.0178},ear:[.04,.06,-.03],neck:[-.05,-.06,.042],whisk:{p:[.022,-.028,.115],n:4,len:.1},
  extra(){},
  paint(p,n,C){const z=p[2],y=p[1];if(z>.128&&y>-.026)return C.PINK;if(y<-.03)return C.FURL;return C.FUR}});
// ------------------------------------------------ SQUIRREL ------------------------------------------------
// red squirrel: round head, short muzzle, big eyes set to the side, tufted ears, pale cheeks, incisors
FKH.add('squirrel',{R:.096,bb:[-.13,-.12,-.13,.13,.12,.14],
  forms:[FKH.E([0,.005,-.02],[.074,.072,.08]),
    FKH.E([.045,-.025,.025],[.032,.032,.04],{k:.022}),
    FKH.RC([0,-.012,.045],[0,-.022,.108],.034,.018,{k:.028}),
    FKH.E([.015,-.03,.1],[.016,.014,.014],{k:.008}),
    FKH.E([0,-.016,.112],[.009,.007,.006],{k:.004}),
    FKH.RC([0,-.042,.02],[0,-.044,.09],.02,.01,{k:.012}),
    FKH.SP([.045,.022,.045],.017,{sub:1,k:.007})],
  eye:{c:[.044,.022,.048],g:[.8,.08,.6],r:.0168},ear:[.035,.06,-.03],neck:[-.05,-.06,.042],whisk:{p:[.022,-.03,.1],n:3,len:.08},
  extra(k,B,D,C){const C0=FKS.C0;[-1,1].forEach(s=>k.p('head','box','c',0xd8a040,s*.0042,C0[1]-.05,C0[2]+.098,.0075,.014,.004,.1,0,0))},
  paint(p,n,C){const z=p[2],y=p[1];if(z>.107&&y>-.022)return C.PINK;if(y<-.022&&z>-.02)return C.FURL;return C.FUR}});
// ------------------------------------------------ GOAT / RAM / SHEEP ------------------------------------------------
// caprids: long face, eyes high on the sides (bar pupils), mobile lips; goat: straight profile, beard, swept horns;
// ram: Roman nose, wool poll, spiral horns round the ears; sheep: shorter face under a wool cap
FKH.capra=function(o){o=o||{};const bump=o.bump||0;return {R:.088,bb:[-.13,-.13,-.13,.13,.12,.22],
  forms:[FKH.E([0,.012,-.03],[.058,.06,.07]),
    FKH.RC([0,.0,.02],[0,-.035,o.len||.18],.042,.024,{k:.032,sq:[.92,1.05]}),
    FKH.E([.036,-.03,.04],[.022,.03,.05],{k:.022}),
    FKH.E([.042,.024,.02],[.02,.018,.024],{k:.015}),
    FKH.E([0,.002+bump*.3,.1],[.02,.026+bump,.05],{k:.02}),
    FKH.E([0,-.04,(o.len||.18)+.008],[.022,.02,.016],{k:.01}),
    FKH.RC([0,-.05,0],[0,-.062,(o.len||.18)-.01],.026,.014,{k:.013}),
    FKH.SP([.048,.025,.035],.014,{sub:1,k:.006})],
  eye:{c:[.047,.025,.038],g:[.92,.08,.38],r:.015},ear:[.05,.03,-.03],neck:[-.05,-.062,.044],
  paint(p,n,C){const z=p[2],y=p[1],x=Math.abs(p[0]),L=o.len||.18,ym=FKH.lerpY(z,.02,-.066,L,-.058);
    if(z>L-.004&&y>-.05)return C.PINKD;if(z>.06&&Math.abs(y-ym)<.003)return C.MOUTH;
    if(o.wool&&(z<o.wool[0]||(y>o.wool[1]&&z<o.wool[2])))return C.WOOL;
    if(o.stripe&&x>.02&&Math.abs(y-(.025-.4*(z-.035)))<.012&&z>.04&&z<L-.03)return C.FURD;
    if(y<ym)return C.FURL;return C.FUR}}};
FKH.add('goat',Object.assign(FKH.capra({stripe:1}),{extra(k,B,D,C){const C0=FKS.C0,at=(x,y,z)=>[x+C0[0],y+C0[1],z+C0[2]];
  [-1,1].forEach(s=>fkHornLoft(B,[at(s*.024,.05,-.012),at(s*.036,.105,-.04),at(s*.05,.13,-.1),at(s*.066,.12,-.165),at(s*.074,.09,-.205)],t=>.02*(1-t*.8),C.HORN,1));
  k.L('head','c',C.FURL,at(0,-.05,.13),at(0,-.13,.115),.017,.004,6);k.L('head','c',C.FURL,at(0,-.052,.118),at(0,-.118,.1),.014,.004,5)}}));
FKH.add('ram',Object.assign(FKH.capra({bump:.012,len:.17,wool:[-.05,.03,.04]}),{ear:[.058,.0,-.02],extra(k,B,D,C){const C0=FKS.C0;
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,p=fkSurf(D,C0[2]-.06+.05*Math.sin(a*2.1)*.5,(.25+.55*Math.abs(Math.sin(a*1.3)))*(i%2?1:-1),.002);k.p('head','dod','c',C.WOOL,p[0],p[1],p[2],.026,.022,.026)}
  // spiral horns: from the crown behind the eyes, back and down round the ear, forward by the cheek
  [-1,1].forEach(s=>{const c=[.07,-.005,-.04],P=[];for(let i=0;i<=18;i++){const t=i/18,a=-.2+t*Math.PI*1.75,r=.05*(1-t*.45);P.push([s*(c[0]+t*.03+Math.sin(t*Math.PI)*.012)+C0[0],c[1]+Math.cos(a)*r+C0[1],c[2]+Math.sin(a)*r*1.05+C0[2]])}
    fkHornLoft(B,P,t=>.03*(1-t*.65),C.HORN,1)})}}));
FKH.add('sheep',Object.assign(FKH.capra({len:.16,wool:[-.04,.025,.05]}),{ear:[.055,.005,-.02],extra(k,B,D,C){const C0=FKS.C0;
  for(let i=0;i<16;i++){const p=fkSurf(D,C0[2]-.075+(i%4)*.024,(Math.floor(i/4)-1.5)*.5,.004);k.p('head','dod','c',C.WOOL,p[0],p[1],p[2],.03,.026,.03)}}}));
// ------------------------------------------------ BOAR ------------------------------------------------
// wild boar: wedge-shaped head, long snout ending in a flat disc, small eyes high, tusks, a bristly crest
FKH.add('boar',{R:.1,bb:[-.15,-.15,-.15,.15,.14,.22],
  forms:[FKH.E([0,.01,-.03],[.075,.075,.085]),
    FKH.RC([0,.0,.02],[0,-.03,.17],.055,.036,{k:.035,sq:[.95,1.05]}),
    FKH.E([.055,-.04,.02],[.04,.045,.06],{k:.03}),
    FKH.E([0,-.032,.178],[.035,.03,.012],{k:.008}),
    FKH.RC([0,-.06,.02],[0,-.06,.15],.034,.02,{k:.014}),
    FKH.SP([.048,.035,.04],.012,{sub:1,k:.006})],
  eye:{c:[.047,.035,.043],g:[.85,.1,.5],r:.0115},ear:[.05,.062,-.045],neck:[-.065,-.07,.066],
  extra(k,B,D,C){const C0=FKS.C0,at=(x,y,z)=>[x+C0[0],y+C0[1],z+C0[2]];
    [-1,1].forEach(s=>{const q=at(s*.015,-.03,.19);k.p('head','sph2','c',0x2a1a18,q[0],q[1],q[2],.008,.011,.004);
      fkPath([at(s*.026,-.058,.13),at(s*.046,-.05,.142),at(s*.056,-.026,.146),at(s*.054,-.008,.136)],0xe8e0c8,.009,.003,k)});
    for(let i=0;i<9;i++){const z=C0[2]-.1+i*.024,y=fkTop(D,z);k.p('head','cone4','c',C.FURD,0,y+.004,z,.012,.04,.008,-.5,0,0)}},
  paint(p,n,C){const z=p[2],y=p[1];if(z>.17)return 0x6a524a;return y>.04&&z<.06?C.FURD:C.FUR}});
// ------------------------------------------------ OWL ------------------------------------------------
// tawny owl: one round head with a dished facial disc, huge forward eyes, hooked beak, ear tufts
FKH.add('owl',{R:.12,bb:[-.15,-.14,-.14,.15,.14,.14],
  forms:[FKH.E([0,0,-.01],[.098,.092,.09]),
    FKH.SP([.042,.0,.13],.06,{sub:1,k:.025}),                            // facial disc dishes
    FKH.RC([0,.0,.076],[0,-.032,.094],.012,.004,{k:.006})],               // beak
  eye:{c:[.04,.004,.066],g:[.25,.02,.97],r:.025},ear:[.06,.075,-.005],neck:[-.065,-.04,.075],
  extra(){},
  paint(p,n,C){const z=p[2],y=p[1],x=Math.abs(p[0]),dd=Math.hypot(x-.042,y,z-.13);
    if(z>.07&&x<.012&&y<.0)return 0x9a8a5a;if(dd<.072)return C.FURL;if(dd<.082)return C.FURD;
    const nn=Math.sin(p[0]*140)*Math.cos(z*120+y*90);return y<-.05?C.FURL:nn>.6?C.FURD:C.FUR}},{});
FK137.sp.owl.eyes={};FK137.sp.owl.eyeAt=null;
FK137.sp.hedgehog.face0=FK137.sp.hedgehog.face;
fk140Setup();
