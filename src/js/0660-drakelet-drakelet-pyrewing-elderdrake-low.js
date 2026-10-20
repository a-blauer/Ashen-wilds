// ================= Drakelet (Drakelet, Pyrewing, Elderdrake): low-poly young drake on the v81 toolkit =================
// Rings in model space of the stretched fox template (neck raised, long snout and tail). Wings use lpwWing from zzE_Batwing.js.
// body ring: [z, y, half width, above, below, bones, kind]  kind: 1 = nostril tip
var DRK_BODY=[
  [.9,.655,.02,.018,.016,['head','head',0],1],
  [.87,.66,.045,.032,.026,['head','head',0],0],
  [.8,.668,.065,.045,.035,['head','head',0],0],
  [.72,.684,.085,.06,.045,['head','head',0],0],
  [.64,.698,.1,.075,.06,['head','head',0],0],
  [.57,.704,.098,.08,.07,['head','head',0],0],
  [.51,.69,.078,.075,.072,['neck','head',.6],0],
  [.45,.655,.072,.072,.078,['neck','neck',0],0],
  [.39,.6,.082,.082,.09,['neck','neck',0],0],
  [.32,.535,.108,.1,.118,['neck','chest',.6],0],
  [.23,.485,.135,.125,.14,['chest','chest',0],0],
  [.11,.468,.136,.125,.135,['chest','spine',.5],0],
  [-.01,.462,.126,.115,.122,['spine','spine',0],0],
  [-.13,.462,.12,.11,.116,['spine','pelvis',.6],0],
  [-.26,.462,.126,.116,.116,['pelvis','pelvis',0],0],
  [-.37,.452,.1,.094,.09,['pelvis','tail0',.5],0],
  [-.5,.448,.075,.07,.068,['tail0','tail1',.4],0],
  [-.68,.465,.056,.054,.052,['tail1','tail1',0],0],
  [-.84,.495,.044,.042,.04,['tail1','tail2',.5],0],
  [-.98,.522,.034,.032,.03,['tail2','tail2',0],0],
  [-1.1,.545,.024,.022,.02,['tail2','tail3',.5],0],
  [-1.2,.56,.014,.012,.012,['tail3','tail3',0],0]];
function drkLegs(s){const F=s<0?'fl':'fr',H=s<0?'hl':'hr',f=(x,y,z,rx,rz,b,d)=>[s*x,y,z,rx,rz,b,d];return [
  [f(.098,.48,.21,.07,.085,['chest',F+'0',.5]),f(.104,.36,.22,.062,.072,[F+'0',F+'0',0]),f(.104,.23,.245,.045,.05,[F+'0',F+'1',.7]),
   f(.104,.15,.235,.038,.04,[F+'1',F+'1',0],1),f(.104,.075,.22,.034,.036,[F+'1',F+'2',.8],1),f(.104,.04,.225,.034,.038,[F+'2',F+'2',0],1)],
  [f(.1,.5,-.27,.09,.125,['pelvis',H+'0',.4]),f(.118,.38,-.26,.082,.11,[H+'0',H+'0',0]),f(.118,.27,-.22,.055,.068,[H+'0',H+'1',.6]),
   f(.115,.2,-.22,.04,.048,[H+'1',H+'1',0],1),f(.115,.12,-.28,.035,.038,[H+'1',H+'2',.7],1),f(.115,.045,-.29,.033,.036,[H+'2',H+'2',0],1)]]}
LPR.Drakelet={
  head:['head',0,.78,.56],up:.1,
  back:[['neck',0,.68,.42],['chest',0,.6,.22],['spine',0,.58,0],['pelvis',0,.58,-.24],['tail1',0,.51,-.62]],
  geo(C){
    const main=lpMain(C,.3),back=main.clone().multiplyScalar(.6),bel=new THREE.Color(0xc8b48a).lerp(main,.15),dark=main.clone().multiplyScalar(.35),nose=new THREE.Color(0x1a1014);
    return lpGeo('Drakelet|'+C,'Drakelet',[
      {rings:DRK_BODY.map((r,i)=>({p:[0,r[1],r[0]],rx:r[2],ryT:r[3],ryB:r[4],b:r[5],k:r[6],i:i})),seg:8,capA:1,capB:1,paint:(o,r,s)=>{
        if(r.k==1)return o.copy(nose);o.copy(main);if(s>.5)o.lerp(back,.75);
        // banded belly plates from throat to tail base
        if(s<-.45&&r.i>3&&r.i<17){o.copy(bel);if(r.i%2)o.multiplyScalar(.82)}}}]
      .concat([].concat(...[-1,1].map(s=>drkLegs(s).map(L=>({rings:L.map(r=>({p:[r[0],r[1],r[2]],rx:r[3],ryT:r[4],ryB:r[4],b:r[5],d:r[6]})),seg:6,ref:[0,0,1],capB:1,paint:(o,r,sn)=>{
        o.copy(r.d?dark:main);if(!r.d&&sn<-.3)o.lerp(back,.4)}}))))),91);
  },
  kit(k,c,C,red){
    const bone=0xcfc09a,boneD=0x8a7c60,dark=0x140c10,eye=red?0xff2a2a:0xff8a20,back=dkShade(lpMain(C,.3).getHex(),.45);
    [-1,1].forEach(s=>{
      // eyes, brow ridge, nostril, swept horns, cheek spikes, fangs
      k.p('head','box','c',0x070506,s*.072,.73,.66,.045,.026,.016,0,s*.55,-s*.18);
      k.p('head','box','g',eye,s*.08,.732,.664,.036,.012,.008,0,s*.55,-s*.25);
      k.p('head','box','c',back,s*.07,.758,.65,.07,.02,.04,0,s*.45,s*.35);
      k.p('head','box','c',0x0a0606,s*.022,.678,.88,.012,.008,.012);
      k.L('head','c',bone,[s*.055,.76,.6],[s*.1,.83,.45],.03,.006,5);
      k.L('head','c',boneD,[s*.1,.83,.45],[s*.11,.84,.38],.008,.002,4);
      k.L('head','c',bone,[s*.035,.77,.62],[s*.05,.82,.53],.016,.003,4);
      k.L('head','c',dkShade(lpMain(C,.3).getHex(),.7),[s*.085,.68,.55],[s*.16,.7,.47],.03,.003,4);
      k.L('jaw','c',dkShade(lpMain(C,.3).getHex(),.7),[s*.07,.64,.58],[s*.13,.62,.5],.025,.003,4);
      [0,1,2].forEach(i=>k.p('head','cone4','c',0xe8e0c8,s*(.034+i*.006),.632,.83-i*.05,.009,.042,.009,Math.PI));
    });
    // lower jaw, mouth
    k.L('jaw','c',0xb8a47e,[0,.635,.6],[0,.63,.84],.045,.016,5);
    k.p('jaw','box','c',0x3a0e10,0,.648,.74,.035,.008,.14);
    // bony ridge plates along neck, back and tail
    [['neck',.73,.47,.05],['neck',.69,.42,.06],['neck',.64,.37,.065],['chest',.59,.3,.07],['chest',.58,.2,.075],['chest',.575,.1,.075],['spine',.57,-.01,.07],['spine',.57,-.12,.07],['pelvis',.57,-.24,.065],['pelvis',.55,-.35,.06],
     ['tail0',.51,-.48,.05],['tail1',.52,-.62,.045],['tail1',.54,-.76,.04],['tail2',.565,-.9,.035],['tail2',.585,-1.02,.03],['tail3',.6,-1.13,.025]].forEach(q=>k.L(q[0],'c',bone,[0,q[1]-.04,q[2]+.03],[0,q[1]+q[3]*.8,q[2]-.03],q[3]*.55,.003,4));
    // tail spade
    k.p('tail3','cone4','c',dkShade(lpMain(C,.3).getHex(),.55),0,.565,-1.25,.07,.12,.02,-Math.PI/2);
    // claws
    [['fl2',-.104,.235],['fr2',.104,.235],['hl2',-.115,-.27],['hr2',.115,-.27]].forEach(f=>{k.p(f[0],'box','c',dark,f[1],.022,f[2]+.03,.07,.04,.09);
      [-1,0,1].forEach(i=>k.p(f[0],'cone4','c',0xd8ccb0,f[1]+i*.022,.016,f[2]+.09,.009,.04,.009,Math.PI/2))});
  },
  post(x,c,C,mat){
    const main=lpMain(C,.3),mem=main.clone().multiplyScalar(.7),edge=main.clone().multiplyScalar(.35).lerp(new THREE.Color(0x3a1a10),.3);
    const W=lpwWing('drk|'+C,
      [[0,0,.06],[.25,.07,.1],[.48,.1,.06],[.7,.08,-.02],[.95,.02,-.12],[.8,-.02,-.26],[.74,.01,-.4],[.6,-.03,-.38],[.52,0,-.55],[.36,-.03,-.46],[.24,0,-.56],[.1,-.02,-.4],[0,0,-.3]],
      [.4,.04,-.2],
      [[[0,.01,.06],[.48,.11,.06],.03],[[.48,.11,.06],[.7,.09,-.02],.022],[[.48,.1,.06],[.95,.02,-.12],.014],[[.48,.1,.06],[.74,.01,-.4],.014],[[.48,.1,.06],[.52,0,-.55],.014],[[.48,.1,.06],[.24,0,-.56],.012],[[.7,.09,-.02],[.73,.15,.04],.016]],
      mem,edge,main.clone().multiplyScalar(.4).lerp(new THREE.Color(0x6a5a44),.35));
    lpwPair(x,'chest',W,mat,.11,.57,.14,.35,.25);
  }};

