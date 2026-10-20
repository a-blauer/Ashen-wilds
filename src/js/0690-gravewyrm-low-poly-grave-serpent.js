// ================= Gravewyrm: low-poly grave serpent (v81, toolkit in zzD_lowpoly.js) =================
// Thick faceted coils with a slight S-curve, bony ridge plates, a wide fanged wedge head and pale belly scutes.
// Bones (model space): tail3 −1.35 … pelvis −.25, spine 0, chest .2, neck .38, head .5 (all near y .25); anim 'slither' twists them about y.
var WYRM_BZ=[['tail3',-1.35],['tail2',-1.05],['tail1',-.78],['tail0',-.5],['pelvis',-.25],['spine',0],['chest',.2],['neck',.38],['head',.5]];
function wyrmBones(z){
  const B=WYRM_BZ;if(z<=B[0][1])return [B[0][0],B[0][0],0];
  for(let i=0;i<B.length-1;i++)if(z<B[i+1][1]){const t=(z-B[i][1])/(B[i+1][1]-B[i][1]);return [B[i][0],B[i+1][0],t*t*(3-2*t)]}
  return ['head','head',0];
}
// body rings: [z, radius]; neck rises a little so the head is held up off the ground
var WYRM_BODY=[[-1.62,.012],[-1.5,.035],[-1.35,.058],[-1.2,.08],[-1.05,.1],[-.9,.122],[-.78,.14],[-.64,.155],[-.5,.17],[-.37,.18],[-.25,.19],[-.12,.19],[0,.185],[.1,.175],[.2,.16],[.3,.135],[.38,.118]];
// head rings: [z, y, half width, half height above, half height below]
var WYRM_HEAD=[[.44,.3,.115,.08,.06],[.53,.31,.14,.08,.05],[.63,.305,.11,.065,.04],[.72,.298,.075,.05,.03],[.8,.292,.04,.032,.022],[.85,.29,.01,.01,.01]];
function wyrmLift(z){return z>0?.17*Math.pow(Math.min(z,.4)/.4,1.5):0}
function wyrmCurve(z){return z<.15?Math.sin(z*3.4+.6)*.055*Math.min(1,(.15-z)*3):0}
LPR.Gravewyrm={
  head:['head',0,.38,.53],up:.1,
  back:[['chest',0,.27,.2],['spine',0,.3,0],['pelvis',0,.31,-.27],['tail0',0,.28,-.52]],
  geo(C){
    const main=lpMain(C,.15),back=main.clone().multiplyScalar(.6),belly=new THREE.Color(0xc4bb94),blot=main.clone().lerp(new THREE.Color(0x1a1a12),.55),band=main.clone().lerp(new THREE.Color(0xa8a070),.3);
    const rings=WYRM_BODY.map(q=>{const z=q[0],r=q[1],ryB=r*.72,lift=wyrmLift(z);return {p:[wyrmCurve(z),ryB+.006+lift,z],rx:r,ryT:r*.86,ryB:ryB,b:wyrmBones(z)}})
      .concat(WYRM_HEAD.map(q=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:['head','head',0],hd:1})));
    return lpGeo('Gravewyrm|'+C,'Gravewyrm',[{rings,seg:8,capA:1,capB:1,paint:(o,r,s,c,i)=>{
      if(s<-.45){o.copy(belly);if(i%2)o.multiplyScalar(.82);return}       // belly scutes
      o.copy(main);
      if(r.hd){if(s>.4)o.lerp(back,.7);return}
      if(s>.6)o.copy(i%2?back:band.clone().lerp(back,.35));                // dark saddles with pale bands across the back
      else if(i%2==0&&s>-.3)o.copy(blot);                                  // dark side blotches
      else if(s>.2)o.lerp(band,.4);
    }}]);
  },
  kit(k,c,C,red){
    const bone=0xd8d0b8,bone2=0xb8ae94,eye=red?0xff2a2a:0xe8c020,dk=dkShade(lpMain(C,.15).getHex(),.45);
    // lower jaw (a flat wedge that opens on attack) with a red mouth and forked tongue
    k.p('jaw','cone4','c',0xb8b090,0,.238,.6,.085,.36,.025,Math.PI/2);
    k.p('jaw','box','c',0x5a1418,0,.25,.6,.09,.008,.2);
    k.L('jaw','c',0xb03a4a,[0,.252,.6],[0,.255,.83],.01,.004,4);
    [-1,1].forEach(s=>{
      k.L('jaw','c',0xb03a4a,[0,.255,.83],[s*.018,.257,.865],.006,.002,3);
      // eyes: dark socket + big glowing slit eye + heavy bone brow
      k.p('head','box','c',0x0a0908,s*.112,.33,.6,.026,.04,.056,0,s*.3,0);
      k.p('head','box','g',eye,s*.122,.332,.602,.012,.034,.04,0,s*.3,0);
      k.p('head','box','c',bone2,s*.1,.362,.59,.05,.018,.08,0,s*.3,s*.35);
      // fangs
      k.p('head','cone4','c',0xf0eadc,s*.045,.225,.76,.012,.055,.012,Math.PI);
      k.p('head','cone4','c',0xf0eadc,s*.075,.235,.68,.008,.03,.008,Math.PI);
      // horns sweeping back, plus cheek spurs
      k.L('head','c',bone,[s*.07,.36,.5],[s*.16,.42,.34],.03,.004,5);
      k.L('head','c',bone,[s*.125,.29,.5],[s*.2,.27,.4],.02,.003,4);
    });
    // bony ridge plates along the spine, shrinking toward the tail
    [['neck',.38,.118],['chest',.27,.15],['chest',.15,.172],['spine',.03,.185],['spine',-.1,.19],['pelvis',-.23,.19],['pelvis',-.36,.18],['tail0',-.49,.17],['tail0',-.62,.155],['tail1',-.76,.14],['tail1',-.9,.12],['tail2',-1.04,.1],['tail2',-1.18,.08],['tail3',-1.32,.06]].forEach((q,i)=>{
      const z=q[1],r=q[2],y=r*.72+.006+r*.86+wyrmLift(z),x=wyrmCurve(z);
      k.L(q[0],'c',i%2?bone:bone2,[x,y-.03,z+.02],[x,y+r*.42,z-.08],r*.3,.004,4);
    });
    // tail spike
    k.L('tail3','c',bone,[wyrmCurve(-1.58),.02,-1.56],[wyrmCurve(-1.7),.03,-1.72],.02,.002,4);
  }};

