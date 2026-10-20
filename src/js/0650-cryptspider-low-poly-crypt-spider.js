// ================= Cryptspider: low-poly crypt spider (v81, toolkit in zzD_lowpoly.js) =================
// Bulbous faceted abdomen with a red marking, banded jointed legs skinned to the a0..b3 leg chains (anim 'spider'),
// a cluster of glowing eyes, heavy chelicerae with pale fangs, and bristly hair tufts.
// Leg i on side s: k0 (s*.1,.4,z) → k1 knee (s*.4,.58,z+dz*.3) → k2 (s*.62,.3,z+dz*.7) → foot (s*.7,0,z+dz)
var SPID_LZ=[.26,.14,.02,-.1],SPID_LDZ=[.38,.14,-.14,-.38];
function spidLeg(s,i){const z=SPID_LZ[i],dz=SPID_LDZ[i];return {k:(s<0?'a':'b')+i,p0:[s*.1,.4,z],p1:[s*.4,.58,z+dz*.3],p2:[s*.62,.3,z+dz*.7],p3:[s*.7,0,z+dz]}}
function spidLerp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
LPR.Cryptspider={
  head:['head',0,.5,.38],up:.1,
  back:[['pelvis',0,.68,-.38],['pelvis',0,.7,-.25],['pelvis',0,.66,-.12],['chest',0,.52,.18]],
  geo(C){
    const main=lpMain(C,.12),dark=main.clone().multiplyScalar(.55),pale=main.clone().lerp(new THREE.Color(0x8a7a64),.45),red=new THREE.Color(0x7a1410),under=main.clone().multiplyScalar(.7);
    // abdomen (tail chain + pelvis), waist, cephalothorax, head
    const body=[
      [-.68,.47,.02,.02,.02,['tail3','tail3',0]],[-.64,.47,.09,.09,.08,['tail3','tail2',.5]],[-.57,.48,.17,.17,.15,['tail2','tail2',0]],
      [-.47,.49,.235,.23,.2,['tail1','tail1',0]],[-.35,.5,.27,.26,.22,['tail0','tail1',.3]],[-.23,.5,.265,.25,.21,['pelvis','tail0',.3]],
      [-.12,.48,.2,.19,.16,['pelvis','pelvis',0]],[-.06,.44,.1,.09,.08,['pelvis','spine',.5]],[-.02,.41,.07,.06,.06,['spine','spine',0]],
      [.04,.42,.12,.09,.07,['spine','chest',.5]],[.13,.43,.16,.11,.08,['chest','chest',0]],[.24,.43,.15,.1,.08,['chest','chest',0]],
      [.33,.42,.12,.085,.07,['chest','head',.6]],[.41,.42,.1,.075,.065,['head','head',0]],[.47,.41,.07,.05,.05,['head','head',0]],[.5,.405,.02,.02,.02,['head','head',0]]];
    const lofts=[{rings:body.map((q,i)=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:q[5],i})),seg:9,capA:1,capB:1,paint:(o,r,s,c,i)=>{
      o.copy(main);if(s<-.3)o.copy(under);else if(s>.55)o.lerp(dark,.5);
      // red hourglass / skull marking on top of the abdomen, pale chevrons down its back
      if((i==3||i==5)&&s>.95)o.copy(red);                                 // two red lobes = hourglass along the top
      else if(i==4&&s>.95)o.lerp(red,.35);
      else if((i==2||i==6)&&s>.3)o.lerp(pale,.6);
    }}];
    // legs: faceted segments with swollen pale joints
    [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{
      const L=spidLeg(s,i),k=L.k,rs=1-i*.04,R=(p,r,b,jt)=>({p:p,rx:r*rs,ryT:r*rs,ryB:r*rs,b:b,jt:jt});
      lofts.push({rings:[
        R(spidLerp(L.p0,L.p1,-.15),.05,[k+'0',k+'0',0]),R(spidLerp(L.p0,L.p1,.45),.047,[k+'0',k+'0',0]),R(spidLerp(L.p0,L.p1,.88),.04,[k+'0',k+'1',.5]),
        R(L.p1,.046,[k+'1',k+'1',0],1),R(spidLerp(L.p1,L.p2,.15),.038,[k+'1',k+'1',0]),R(spidLerp(L.p1,L.p2,.55),.034,[k+'1',k+'1',0]),
        R(spidLerp(L.p1,L.p2,.92),.028,[k+'1',k+'2',.5]),R(L.p2,.032,[k+'2',k+'2',0],1),R(spidLerp(L.p2,L.p3,.35),.024,[k+'2',k+'2',0]),
        R(spidLerp(L.p2,L.p3,.8),.016,[k+'2',k+'2',0]),R(L.p3,.006,[k+'2',k+'2',0])],
        seg:5,ref:[0,0,1],capA:1,capB:1,paint:(o,r)=>{o.copy(r.jt?pale:main);if(r.p[1]<.12)o.copy(dark)}});
    }));
    return lpGeo('Cryptspider|'+C,'Cryptspider',lofts,31);
  },
  kit(k,c,C,red){
    const main=lpMain(C,.12).getHex(),hair=dkShade(main,.5),hair2=dkShade(main,.8),eye=red?0xff7a2a:0xff3030,R=dkRng(9);
    // eye cluster: two big front eyes + a crown of small ones
    [-1,1].forEach(s=>{
      k.p('head','sph','c',0x080606,s*.035,.455,.465,.026);k.p('head','sph','g',eye,s*.038,.457,.478,.016);
      [[.075,.445,.44,.012],[.06,.475,.43,.011],[.02,.48,.45,.01],[.09,.42,.42,.009]].forEach(q=>k.p('head','sph','g',eye,s*q[0],q[1],q[2],q[3]));
      // chelicerae with pale curved fangs (on the jaw bone so they flare when biting)
      k.L('jaw','c',dkShade(main,.7),[s*.032,.4,.47],[s*.036,.33,.52],.032,.02,5);
      k.L('jaw','c',0xe8dcc0,[s*.036,.33,.52],[s*.02,.28,.5],.012,.002,4);
      // pedipalps
      k.L('head','c',main,[s*.06,.39,.46],[s*.1,.35,.55],.018,.015,5);k.L('head','c',hair,[s*.1,.35,.55],[s*.11,.26,.6],.015,.006,5);
      // bristles on each leg's thigh and shin
      [0,1,2,3].forEach(i=>{const L=spidLeg(s,i),kk=L.k;
        [.3,.6].forEach(t=>{const p=spidLerp(L.p0,L.p1,t);k.L(kk+'0','c',hair,[p[0],p[1]+.03,p[2]],[p[0]+s*.03,p[1]+.09,p[2]+(R()-.5)*.04],.012,.002,3)});
        [.3,.6].forEach(t=>{const p=spidLerp(L.p1,L.p2,t);k.L(kk+'1','c',hair,[p[0]+s*.02,p[1],p[2]],[p[0]+s*.08,p[1]+.03,p[2]+(R()-.5)*.04],.01,.002,3)});
      });
    });
    // hair tufts over the abdomen and thorax
    for(let i=0;i<26;i++){const a=R()*Math.PI*2,u=R()*.9+.1,z=-.55+R()*.4,r=.25*Math.sin(Math.PI*(z+.68)/.56),y=.49+Math.sin(a)*r*.92*u,x=Math.cos(a)*r*u;
      if(y<.42)continue;const bn=z<-.42?'tail1':z<-.3?'tail0':'pelvis';k.L(bn,'c',i%3?hair:hair2,[x,y-.01,z],[x*1.25,y+.06+R()*.04,z-.05],.022,.002,3)}
    [-1,0,1].forEach(i=>k.L('chest','c',hair,[i*.06,.5,.15],[i*.08,.56,.08],.02,.002,3));
    // spinnerets
    [-1,1].forEach(s=>k.L('tail3','c',hair2,[s*.02,.46,-.66],[s*.03,.44,-.74],.018,.004,4));
  }};

