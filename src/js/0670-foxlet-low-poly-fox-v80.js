// ================= Foxlet: low-poly fox (v80, now on the v81 toolkit in zzD_lowpoly.js) =================
// Rings are in the Foxlet's model space. body ring: [z, y, half width, half height above, half height below, [boneA,boneB,blend], belly line]
var FOX_BODY=[
  [.765,.546,.014,.014,.012,['head','head',0],'nose'],
  [.745,.549,.03,.026,.022,['head','head',0],'nose'],
  [.7,.556,.046,.036,.03,['head','head',0],-.05],
  [.64,.57,.066,.05,.04,['head','head',0],-.05],
  [.58,.59,.1,.068,.055,['head','head',0],.05],
  [.52,.605,.12,.08,.07,['head','head',0],.1],
  [.46,.607,.108,.085,.075,['head','head',0],.05],
  [.41,.58,.088,.08,.08,['neck','head',.5],-.1],
  [.35,.54,.092,.09,.1,['neck','neck',0],-.15],
  [.27,.505,.12,.12,.135,['neck','chest',.6],-.2],
  [.18,.48,.135,.13,.15,['chest','chest',0],-.35],
  [.07,.47,.128,.122,.135,['chest','spine',.5],-.55],
  [-.04,.468,.114,.112,.115,['spine','spine',0],-.6],
  [-.15,.468,.11,.11,.11,['spine','pelvis',.6],-.6],
  [-.26,.47,.122,.118,.118,['pelvis','pelvis',0],-.65],
  [-.34,.462,.095,.095,.09,['pelvis','tail0',.3],-.75],
  [-.39,.455,.048,.048,.048,['tail0','tail0',0],-1]];
// bushy tail: [z, y, radius, bones, cream tip?]
var FOX_TAIL=[
  [-.33,.452,.05,['tail0','tail0',0]],[-.42,.435,.085,['tail0','tail1',.2]],[-.53,.43,.125,['tail0','tail1',.6]],
  [-.65,.44,.15,['tail1','tail1',0]],[-.77,.46,.15,['tail1','tail2',.6]],[-.87,.48,.13,['tail2','tail2',0],1],
  [-.96,.5,.095,['tail2','tail3',.6],1],[-1.04,.515,.045,['tail3','tail3',0],1],[-1.09,.52,.008,['tail3','tail3',0],1]];
// legs: rings [x, y, z, half width, half depth, bones, black sock?]
function foxLegs(s){
  const f=(x,y,z,rx,rz,b,d)=>[s*x,y,z,rx,rz,b,d],F=s<0?'fl':'fr',H=s<0?'hl':'hr';
  return [
    [f(.095,.48,.19,.066,.082,['chest',F+'0',.5]),f(.102,.36,.2,.056,.07,[F+'0',F+'0',0]),f(.102,.23,.22,.04,.046,[F+'0',F+'1',.7]),
     f(.102,.15,.212,.033,.036,[F+'1',F+'1',0],1),f(.102,.075,.2,.03,.033,[F+'1',F+'2',.8],1),f(.102,.04,.205,.029,.033,[F+'2',F+'2',0],1)],
    [f(.1,.5,-.24,.08,.115,['pelvis',H+'0',.4]),f(.115,.38,-.23,.074,.1,[H+'0',H+'0',0]),f(.115,.27,-.2,.05,.062,[H+'0',H+'1',.6]),
     f(.112,.2,-.2,.036,.044,[H+'1',H+'1',0]),f(.112,.12,-.248,.031,.035,[H+'1',H+'2',.7],1),f(.112,.045,-.255,.029,.033,[H+'2',H+'2',0],1)]];
}
LPR.Foxlet={
  head:['head',0,.66,.49],up:.09,
  back:[['head',0,.66,.42],['neck',0,.6,.27],['chest',0,.585,.12],['spine',0,.57,-.02],['spine',0,.57,-.18]],
  geo(C){
    const main=lpMain(C),back=main.clone().multiplyScalar(.68),cream=new THREE.Color(0xd8cbb2),dark=new THREE.Color(0x1c1511);
    return lpGeo('Foxlet|'+C,'Foxlet',[
      {rings:FOX_BODY.map(r=>({p:[0,r[1],r[0]],rx:r[2],ryT:r[3],ryB:r[4],b:r[5],bl:r[6]})),seg:8,capA:1,capB:1,paint:(o,r,s)=>{
        if(r.bl=='nose')return o.copy(dark);o.copy(main);if(s>.62)o.lerp(back,.75);const t=Math.min(1,Math.max(0,(r.bl-s)*3.5));if(t>0)o.lerp(cream,t)}},
      {rings:FOX_TAIL.map(r=>({p:[0,r[1],r[0]],rx:r[2],ryT:r[2]*.9,ryB:r[2],b:r[3],tip:r[4]})),seg:8,capA:1,capB:1,paint:(o,r,s)=>{
        o.copy(r.tip?cream:main);if(!r.tip&&s>.5)o.lerp(back,.6);if(!r.tip&&s<-.6)o.lerp(cream,.35)}}]
      .concat([].concat(...[-1,1].map(s=>foxLegs(s).map(L=>({rings:L.map(r=>({p:[r[0],r[1],r[2]],rx:r[3],ryT:r[4],ryB:r[4],b:r[5],d:r[6]})),seg:6,ref:[0,0,1],capB:1,paint:(o,r,sn)=>{
        o.copy(r.d?dark:main);if(!r.d&&r.p[1]<.3)o.lerp(dark,.35);if(!r.d&&sn>.5&&r.p[2]>0)o.lerp(cream,.4)}}))))));
  },
  kit(k,c,C,red){
    const cream=0xd8cbb2,dark=0x1c1511,back=dkShade(lpMain(C).getHex(),.6),eye=red?0xff2a2a:0xf2a21e;
    k.p('head','box','c',0x0c0908,0,.553,.762,.036,.028,.03);
    k.L('jaw','c',cream,[0,.538,.5],[0,.536,.725],.032,.012,5);
    k.p('jaw','box','c',0x3a0e10,0,.55,.63,.03,.008,.1);
    [-1,1].forEach(s=>{
      k.p('head','box','c',0x0a0706,s*.074,.632,.57,.044,.028,.016,0,s*.6,-s*.18);
      k.p('head','box','g',eye,s*.084,.634,.574,.034,.015,.008,0,s*.6,-s*.22);
      k.p('head','box','c',back,s*.07,.656,.568,.056,.016,.03,0,s*.55,s*.32);
      k.p('head','cone4','c',0xe8e0c8,s*.03,.524,.69,.01,.044,.01,Math.PI);
      k.L('head','c',cream,[s*.095,.57,.52],[s*.17,.535,.43],.04,.004,4);
      k.L('head','c',cream,[s*.09,.59,.48],[s*.155,.565,.39],.032,.004,4);
    });
    [-1,0,1].forEach(i=>k.L(i?'neck':'chest','c',cream,[i*.045,.48,.415],[i*.065,.395,.45],.04,.004,4));
    [-1,0,1].forEach(i=>k.L('neck','c',back,[i*.04,.655,.38],[i*.05,.645,.27],.04,.004,4));
    k.L('tail3','c',cream,[0,.515,-1.05],[0,.52,-1.14],.035,.003,4);
    [['fl2',-.1,.215],['fr2',.1,.215],['hl2',-.11,-.24],['hr2',.11,-.24]].forEach(f=>{k.p(f[0],'box','c',dark,f[1],.022,f[2]+.03,.06,.04,.09);
      [-1,0,1].forEach(i=>k.p(f[0],'cone4','c',0x0a0807,f[1]+i*.018,.012,f[2]+.08,.007,.03,.007,Math.PI/2))});
  },
  post(x,c,C,mat){
    // ears pivot at their base so the idle twitch and attack flatten (rigAnim) work
    const main=lpMain(C),og=lpSpikeGeo(main,0x1c1511),ig=lpSpikeGeo(0xcdbfa6,0x6a6050);
    [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,'head',og,mat,s*.062,.665,.47,.06,.16,.026,0,-s*.25,0);
      const n=new THREE.Mesh(ig,mat);n.scale.set(.6,.68,.5);n.position.set(0,.02,.45);p.children[0].add(n);p.userData={rz:-s*.3,sd:s};x.ears.push(p)});
  }};

