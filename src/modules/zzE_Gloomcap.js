// ================= Gloomcap: low-poly walking toadstool (v81) =================
// Pale stalk body with a grim face, a broad faceted cap (spots on top, dark gills underneath), stubby root feet and twig arms.
// Bones: SPEC.Gloomcap (pelvis…neck stalk, head = cap, hl/hr legs, fl/fr arms). Anim 'waddle'.
LPR.Gloomcap={
  head:['head',0,1.02,0],up:.09,
  back:[['head',0,1.0,0],['head',.16,.94,-.06],['head',-.16,.94,-.06],['head',0,.95,-.17]],
  geo(C){
    const cap=lpMain(C,.22),capD=cap.clone().multiplyScalar(.6),stalk=new THREE.Color(0xc8b99c),dirt=new THREE.Color(0x4a3a2a),gill=new THREE.Color(0x3a2a24),root=new THREE.Color(0x3a2c20);
    const R=(y,r,b,o)=>Object.assign({p:[0,y,0],rx:r,ryT:r,ryB:r,b:b},o||{});
    const lofts=[
      // stalk: bulbous base, slight waist, flaring under the cap
      {rings:[R(.1,.12,['pelvis','pelvis',0]),R(.16,.165,['pelvis','pelvis',0]),R(.28,.155,['pelvis','spine',.3]),R(.42,.13,['spine','spine',0]),
        R(.56,.125,['spine','chest',.7]),R(.66,.11,['chest','neck',.4]),R(.74,.1,['neck','head',.5])],seg:7,ref:[0,0,1],capA:1,
        paint:(o,r)=>{o.copy(stalk);const t=Math.max(0,(.32-r.p[1])*3.2);if(t>0)o.lerp(dirt,Math.min(.7,t))}},
      // ragged ring (annulus) hanging under the cap
      {rings:[R(.7,.1,['neck','neck',0]),R(.64,.15,['neck','chest',.5],{j:.25})],seg:9,ref:[0,0,1],paint:o=>o.copy(stalk).multiplyScalar(.82)},
      // cap: gills underneath, broad rim, domed top
      {rings:[R(.735,.06,['head','head',0],{g:1}),R(.75,.29,['head','head',0],{g:1,j:.08}),R(.775,.33,['head','head',0],{j:.08}),R(.83,.32,['head','head',0]),
        R(.9,.275,['head','head',0]),R(.96,.18,['head','head',0]),R(1.0,.08,['head','head',0]),R(1.015,.012,['head','head',0])],seg:9,ref:[0,0,1],capA:1,capB:1,
        paint:(o,r)=>{if(r.g)return o.copy(gill);o.copy(cap);if(r.p[1]>.88)o.lerp(capD,.45);if(r.p[1]<.8)o.lerp(capD,.25)}}];
    // stubby legs ending in root clumps
    ['hl','hr'].forEach((k,i)=>{const x=i?.08:-.08;lofts.push({rings:[R(.24,.06,['pelvis',k+'0',.5]),R(.13,.055,[k+'0',k+'1',.5]),R(.05,.06,[k+'1',k+'2',.6]),R(.015,.07,[k+'2',k+'2',0])].map(r=>(r.p[0]=x,r)),
      seg:6,ref:[0,0,1],capB:1,paint:o=>o.copy(root)})});
    // twig arms
    ['fl','fr'].forEach((k,i)=>{const s=i?1:-1;lofts.push({rings:[{p:[s*.1,.57,.02],rx:.04,b:['chest',k+'0',.5]},{p:[s*.17,.46,.05],rx:.032,b:[k+'0',k+'1',.6]},{p:[s*.19,.38,.08],rx:.03,b:[k+'1',k+'2',.7]},{p:[s*.195,.34,.09],rx:.022,b:[k+'2',k+'2',0]}],
      seg:5,ref:[0,0,1],capB:1,paint:o=>o.copy(stalk).lerp(root,.45)})});
    return lpGeo('Gloomcap|'+C,'Gloomcap',lofts,31);
  },
  kit(k,c,C,red){
    const eye=red?0xff2a2a:0xb8ff6a,spot=0xd8cbb2,gl=0x241a16;
    // spots on the cap (low-poly pale scales)
    [[0,1.0,.02,.05],[.16,.93,.1,.045],[-.17,.93,.06,.05],[.07,.92,-.2,.045],[-.1,.95,-.13,.04],[.24,.86,-.06,.04],[-.25,.85,-.09,.035],[.02,.86,.27,.04],[-.2,.85,.18,.035],[.2,.86,.18,.035]].forEach(q=>{
      const n=new THREE.Vector3(q[0],q[1]-.72,q[2]).normalize();k.p('head','dod','c',spot,q[0]*1.03,q[1]+.01,q[2]*1.03,q[3],q[3]*.45,q[3],Math.atan2(n.z,n.y),0,-Math.atan2(n.x,n.y))});
    // gills: dark radial blades under the cap
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2;k.p('head','box','c',gl,Math.sin(a)*.19,.748,Math.cos(a)*.19,.006,.016,.2,0,a,0)}
    // grim face on the stalk
    [-1,1].forEach(s=>{
      k.p('chest','box','c',0x050404,s*.045,.6,.105,.05,.024,.02,0,s*.3,s*.35);
      k.p('chest','box','g',eye,s*.047,.6,.117,.032,.009,.006,0,s*.3,s*.35);
      k.p('chest','box','c',0x3a2a1c,s*.046,.628,.112,.062,.016,.024,0,s*.3,s*.5);
    });
    k.p('chest','box','c',0x120808,0,.538,.122,.07,.018,.016);
    for(let i=-2;i<=2;i++)k.p('chest','cone4','c',0xe8e0c8,i*.016,.547,.13,.006,.022,.006,Math.PI);
    // glowing spores drifting off the cap
    for(let i=0;i<7;i++){const a=i*.9;k.p('head','sph','g',0xa8ff7a,Math.cos(a)*(.12+(i%3)*.06),1.0+((i*3)%4)*.02,Math.sin(a)*(.12+(i%3)*.06),.012)}
    // root toes and twig fingers
    [['hl2',-.08],['hr2',.08]].forEach(f=>[-1,0,1].forEach(i=>k.L(f[0],'c',0x2a2018,[f[1]+i*.03,.02,.02],[f[1]+i*.05,.008,.1],.022,.006,4)));
    [['fl2',-.195],['fr2',.195]].forEach(f=>[-1,0,1].forEach(i=>k.L(f[0],'c',0x3a2c20,[f[1],.34,.09],[f[1]+i*.025,.29,.12],.012,.003,4)));
  }};
