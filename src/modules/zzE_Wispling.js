// ================= Wispling: low-poly hooded spirit (v81) =================
// A translucent, faceted cloak body tapering into ragged tails, a dark opaque hood with glowing eyes and a glowing core.
// Bones: SPEC.Wispling (pelvis…head, tail0-3 hanging down/back, fl/fr arms). Anim 'float'.
LPR.Wispling={
  head:['head',0,1.13,-.03],up:.1,
  back:[['chest',0,.86,-.13],['spine',0,.7,-.15],['pelvis',0,.52,-.14]],
  mat:{transparent:true,opacity:.7,depthWrite:false,emissive:0x0c2030},
  geo(C){
    const pale=new THREE.Color(C).lerp(new THREE.Color(0xd8e4ea),.25),deep=new THREE.Color(C).lerp(new THREE.Color(0x1a2a3a),.55);
    // fades from pale shoulders to deep, darker tails
    const paint=(o,r)=>{o.copy(pale).lerp(deep,Math.min(1,Math.max(0,(.8-r.p[1])*1.2)))};
    const lofts=[
      {rings:[{p:[0,.92,0],rx:.09,b:['neck','head',.5]},{p:[0,.84,0],rx:.185,ryT:.15,b:['chest','neck',.3]},{p:[0,.72,-.01],rx:.19,b:['chest','chest',0],j:.08},
        {p:[0,.6,-.02],rx:.155,b:['spine','spine',0],j:.1},{p:[0,.47,-.04],rx:.13,b:['pelvis','pelvis',0],j:.14},{p:[0,.36,-.07],rx:.105,b:['tail0','tail0',0],j:.18},
        {p:[0,.24,-.13],rx:.075,b:['tail1','tail1',0],j:.2},{p:[0,.13,-.21],rx:.045,b:['tail2','tail2',0],j:.2},{p:[0,.04,-.31],rx:.012,b:['tail3','tail3',0]}],seg:8,ref:[0,0,1],capA:1,capB:1,paint:paint}];
    // two ragged side tendrils
    [-1,1].forEach(s=>lofts.push({rings:[{p:[s*.09,.5,-.03],rx:.06,b:['pelvis','pelvis',0]},{p:[s*.13,.36,-.08],rx:.05,b:['tail0','tail0',0],j:.2},
      {p:[s*.15,.22,-.15],rx:.03,b:['tail1','tail1',0]},{p:[s*.16,.12,-.2],rx:.008,b:['tail2','tail2',0]}],seg:6,ref:[0,0,1],capB:1,paint:paint}));
    // sleeves flaring at the wrist
    ['fl','fr'].forEach((k,i)=>{const s=i?1:-1;lofts.push({rings:[{p:[s*.12,.82,0],rx:.06,b:['chest',k+'0',.5]},{p:[s*.19,.71,.04],rx:.05,b:[k+'0',k+'1',.6]},
      {p:[s*.22,.6,.08],rx:.065,b:[k+'1',k+'2',.7],j:.2},{p:[s*.225,.57,.09],rx:.02,b:[k+'2',k+'2',0]}],seg:6,ref:[0,0,1],paint:paint})});
    return lpGeo('Wispling|'+C,'Wispling',lofts,53);
  },
  kit(k,c,C,red){
    const hood=dkShade(new THREE.Color(C).lerp(new THREE.Color(0x2a2a34),.75).getHex(),.55),eye=red?0xff2a2a:0x9ff0ff,glow=new THREE.Color(C).lerp(new THREE.Color(0xffffff),.5).getHex();
    // hood (opaque cloth) and the dark void inside it
    k.p('head','hood','c',hood,0,.83,-.01,.18,.34,.19);
    k.p('head','sph','c',0x020306,0,.98,.02,.12,.13,.11);
    // eyes and teeth in the dark void
    [-1,1].forEach(s=>{k.p('head','box','c',0x010204,s*.048,.99,.11,.045,.03,.02,0,s*.3,s*.25);
      k.p('head','box','g',eye,s*.05,.99,.122,.03,.012,.006,0,s*.3,s*.25)});
    for(let i=-1;i<=1;i++)k.p('head','cone4','c',0xc8d8e0,i*.018,.935,.115,.006,.025,.006,Math.PI);
    // glowing core and wispy finger claws
    k.p('chest','ico','g',glow,0,.72,.03,.05);
    [['fl2',-.225],['fr2',.225]].forEach(f=>[-1,0,1].forEach(i=>k.L(f[0],'g',0xbfeaff,[f[1],.57,.09],[f[1]+i*.025,.5,.12],.01,.002,4)));
    k.p('tail3','sph','g',glow,0,.05,-.3,.03);
  }};
