// ================= Boneling: low-poly skeletal hound (v81 toolkit) — also Lichbone =================
// Rings and parts are written in the Foxlet TEMPLATE space and mapped onto the Boneling skeleton with lpT.
// The skinned body is the skull, spine, tail and leg bones; ribs, vertebra spikes, teeth and the soul-fire are baked parts.
function boneP(p){return lpT('Boneling',p)}
function boneCols(C){
  const c=new THREE.Color(C),hsl={};c.getHSL(hsl);
  const bone=new THREE.Color(0xb8ab8c).lerp(c,.3).lerp(new THREE.Color(0x5a4636),.18),dark=bone.clone().multiplyScalar(.42),crev=new THREE.Color(0x2a241c);
  const glow=hsl.s>.25&&Math.abs(hsl.h-.12)>.06?new THREE.Color().setHSL(hsl.h,.9,.62):new THREE.Color(0x6aff9a);
  return {bone,dark,crev,glow}}
LPR.Boneling={
  sc:1.18,
  head:['head',...boneP([0,.68,.5])],up:.08,
  back:[['neck',...boneP([0,.6,.38])],['chest',...boneP([0,.6,.2])],['chest',...boneP([0,.59,.06])],['spine',...boneP([0,.58,-.08])],['pelvis',...boneP([0,.58,-.22])]],
  geo(C){
    const K=boneCols(C),R=(p,rx,ryT,ryB,b,ex)=>Object.assign({p:boneP(p),rx:rx*.85,ryT:ryT*1.05,ryB:(ryB==null?ryT:ryB)*1.05,b},ex||{});
    const bonePaint=(o,r,s)=>{o.copy(K.bone);if(r.k)o.lerp(K.dark,r.k);if(s<-.3)o.lerp(K.dark,.3);else if(s>.7)o.multiplyScalar(1.08)};
    const lofts=[
      // skull: heavy cranium narrowing to a long fanged snout
      {rings:[R([0,.6,.43],.05,.05,.04,['head','head',0]),R([0,.618,.47],.092,.078,.05,['head','head',0]),R([0,.614,.53],.104,.078,.055,['head','head',0]),
        R([0,.592,.59],.076,.052,.036,['head','head',0]),R([0,.572,.65],.052,.036,.022,['head','head',0]),R([0,.557,.72],.04,.027,.016,['head','head',0],{k:.15}),
        R([0,.55,.775],.022,.016,.01,['head','head',0],{k:.35})],seg:6,capA:1,capB:1,paint:bonePaint},
      // spine: neck → back → tail tip
      {rings:[R([0,.58,.44],.026,.026,null,['head','neck',.5]),R([0,.565,.36],.03,.03,null,['neck','neck',0]),R([0,.565,.22],.032,.032,null,['chest','chest',0]),
        R([0,.56,.06],.03,.03,null,['chest','spine',.5]),R([0,.555,-.08],.03,.03,null,['spine','spine',0]),R([0,.55,-.22],.032,.032,null,['pelvis','pelvis',0]),
        R([0,.53,-.36],.026,.026,null,['tail0','tail0',0]),R([0,.5,-.55],.022,.022,null,['tail1','tail1',0],{k:.1}),R([0,.48,-.75],.017,.017,null,['tail2','tail2',0],{k:.2}),
        R([0,.47,-.92],.011,.011,null,['tail3','tail3',0],{k:.3}),R([0,.47,-1.0],.004,.004,null,['tail3','tail3',0],{k:.4})],seg:5,capA:1,capB:1,paint:bonePaint}];
    // legs: thin bones with knobby joints
    [-1,1].forEach(s=>{const F=s<0?'fl':'fr',H=s<0?'hl':'hr',l=(x,y,z,r,b,k)=>R([s*x,y,z],r,r,r,b,{k:k||0});
      lofts.push({rings:[l(.09,.5,.2,.03,['chest',F+'0',.5]),l(.1,.37,.21,.024,[F+'0',F+'0',0]),l(.1,.25,.22,.022,[F+'0',F+'1',.6]),l(.1,.22,.22,.032,[F+'1',F+'1',0]),
        l(.1,.19,.215,.02,[F+'1',F+'1',0]),l(.1,.1,.205,.017,[F+'1',F+'2',.7]),l(.1,.07,.2,.026,[F+'2',F+'2',0]),l(.1,.035,.21,.02,[F+'2',F+'2',0],.2)],seg:5,ref:[0,0,1],capA:1,capB:1,paint:bonePaint});
      lofts.push({rings:[l(.1,.51,-.24,.036,['pelvis',H+'0',.4]),l(.112,.4,-.23,.03,[H+'0',H+'0',0]),l(.114,.3,-.205,.024,[H+'0',H+'1',.5]),l(.114,.27,-.2,.034,[H+'1',H+'1',0]),
        l(.112,.23,-.21,.021,[H+'1',H+'1',0]),l(.112,.13,-.245,.018,[H+'1',H+'2',.7]),l(.112,.1,-.255,.027,[H+'2',H+'2',0]),l(.112,.045,-.25,.02,[H+'2',H+'2',0],.2)],seg:5,ref:[0,0,1],capA:1,capB:1,paint:bonePaint});
    });
    return lpGeo('Boneling|'+C,'Boneling',lofts,91);
  },
  kit(k,c,C,red){
    const K=boneCols(C),bone=K.bone.getHex(),dark=K.dark.getHex(),crev=K.crev.getHex(),glow=red?0xff2a2a:K.glow.getHex(),P=boneP;
    const L=(bn,t,col,a,b,r1,r2,sg)=>k.L(bn,t,col,P(a),P(b),r1,r2,sg||4),B=(bn,t,col,p,sx,sy,sz,rx,ry,rz,geo)=>{const q=P(p);k.p(bn,geo||'box',t,col,q[0],q[1],q[2],sx,sy,sz,rx,ry,rz)};
    // ribcage: ribs arcing out from the spine and back in under the chest; the front four meet the sternum
    [.27,.2,.13,.06,-.01,-.08].forEach((z,i)=>{const w=1-i*.05,dp=1-i*.09,bn=i<4?'chest':'spine',sh=i%2?dkShade(bone,.88):bone;
      [-1,1].forEach(s=>{const a=[s*.025,.565,z],b=[s*.125*w,.55,z-.02],c2=[s*.16*w,.46,z-.04],d=[s*.13*w,.565-.2*dp,z-.035],e=[s*.035,.345,z-.01];
        L(bn,'c',sh,a,b,.015,.014,5);L(bn,'c',sh,b,c2,.014,.013,5);L(bn,'c',sh,c2,d,.013,.011,5);if(i<4)L(bn,'c',dkShade(sh,.85),d,e,.011,.009,5)})});
    L('chest','c',bone,[0,.34,.3],[0,.35,.06],.02,.013,5);
    // vertebra spikes along the back and down the tail
    for(let i=0;i<9;i++){const z=.36-i*.075,bn=z>.3?'neck':z>.1?'chest':z>-.15?'spine':'pelvis';B(bn,'c',i%2?bone:dkShade(bone,.85),[0,.6,z],.012,.05,.016,-.5,0,0,'cone4')}
    [['tail0',.55,-.4],['tail1',.52,-.55],['tail1',.5,-.68],['tail2',.49,-.8]].forEach(q=>B(q[0],'c',bone,[0,q[1],q[2]],.009,.035,.012,-.6,0,0,'cone4'));
    // shoulder blades and hip bones
    [-1,1].forEach(s=>{B('chest','c',bone,[s*.135,.52,.24],.012,.1,.075,.3,0,s*.15);B('pelvis','c',bone,[s*.07,.53,-.25],.05,.06,.12,.2,0,s*.3);B('pelvis','c',crev,[s*.072,.52,-.25],.02,.025,.04,.2,0,s*.3)});
    // skull: black sockets with soul-fire eyes, brow ridges, nasal hole, back-swept horns
    [-1,1].forEach(s=>{
      B('head','c',0x050404,[s*.05,.625,.565],.045,.04,.03,0,s*.4,-s*.15);
      B('head','g',glow,[s*.055,.625,.575],.024,.016,.01,0,s*.4,-s*.2);
      B('head','c',dark,[s*.052,.655,.56],.058,.018,.04,0,s*.4,s*.35);
      L('head','c',dark,[s*.06,.66,.48],[s*.11,.72,.4],.024,.016,5);L('head','c',dark,[s*.11,.72,.4],[s*.125,.71,.31],.016,.003,5);
      B('head','c',crev,[s*.088,.585,.5],.012,.03,.05);
      for(let i=0;i<4;i++){B('head','c',0xece4cc,[s*(.03-i*.002),.535,.735-i*.04],.007,.028,.008,Math.PI,0,0,'cone4');B('jaw','c',0xe4dcc4,[s*(.028-i*.002),.548,.7-i*.04],.006,.022,.007,0,0,0,'cone4')}
    });
    B('head','c',0x050404,[0,.575,.74],.022,.018,.03);
    L('jaw','c',bone,[0,.535,.48],[0,.533,.735],.03,.012,5);
    // soul-fire in the chest
    B('chest','g',glow,[0,.46,.15],.032,.032,.032,0,0,0,'ico');
    B('chest','g',dkShade(glow,.65),[0,.48,.06],.02,.02,.02,0,0,0,'ico');
    // bony toes with claws
    [['fl2',-.1,.215],['fr2',.1,.215],['hl2',-.112,-.24],['hr2',.112,-.24]].forEach(f=>[-1,0,1].forEach(i=>{
      L(f[0],'c',bone,[f[1]+i*.018,.025,f[2]],[f[1]+i*.022,.014,f[2]+.06],.01,.008,4);B(f[0],'c',crev,[f[1]+i*.022,.012,f[2]+.075],.006,.028,.006,Math.PI/2,0,0,'cone4')}));
  }};
