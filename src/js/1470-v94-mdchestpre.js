// =====================================================================================================
function mdChestPre(P,d){P.col.torso=d.M;P.col.sleeve=d.M;P.hasChest=1;if(d.a=='cloth'){P.col.pants=mdSh(d.M,.7)}}
function mdChest(B,P,d,cls){const st=d.st,M=d.M,A=d.A,dk=d.dk,G=d.G,k=mdKP(),gl=mdGlowOr(d,A),lt=0x3a2618,ti=d.ti;
  const mail=(o0)=>{const mc=mdMix(M,0x6a6c70,.3),md=mdSh(mc,.78);mdTS(B,P,.43,.99,.012,{col:m=>(Math.round(m.y*48)%2?mc:md),lip:.012});[-1,1].forEach(s=>mdAS(B,P,s,0,o0||3,.01,{col:m=>(Math.round(m.y*48)%2?mc:md)}));
    mdSkirt(B,P,.5,.36,.03,.014,{col:m=>m.y<.385?dk:(Math.round(m.y*48)%2?mc:md),n:4})};
  const belt=(y,c,bc)=>{mdTS(B,P,y-.022,y+.022,(P.tOff||0)+.003,{col:c||lt,lip:.004});k.p('spine','box','m',bc||A,0,y,mdTorsoAt(P,y).f+(P.tOff||0)+.008,.05,.04,.014)};   // v178: belts sit on the cloth (they stood 8 mm off it)
  const plate=(lv)=>{const pc=M,ps=mdSh(M,1.18);mdTS(B,P,.6,.985,.03,{t:'m',col:m=>m.s>.55&&m.y>.68&&m.y<.95&&lv>1?ps:m.y<.64?dk:pc,lip:.012,lipT:.006});
    if(G)mdTS(B,P,.6,.62,.034,{t:'g',col:G})};
  const pauld=(n,sz,spk,sq)=>[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',x=s*(P.bones[a][1]*1+s*.012*(mdBuildF(P)-1)*3),W=mdBuildF(P);
    for(let i=0;i<n;i++){const r=(.1+sz*.022-i*.014)*(1+(W-1)*.5);k.p(a,sq?'box':'hem','m',i?M:mdSh(M,1.15),x+s*(.02+i*.012),.985-i*.04,0,r,sq?.035:r*.75,r*1.05,0,0,s*(.3+i*.22))}
    if(G)k.p(a,'oct','g',G,x+s*(.07+sz*.012),1.02+sz*.008,.0,.016,.022,.016,0,0,s*.3);
    for(let i=0;i<spk;i++)k.L(a,'m',mdSh(A,1.1),[x+s*(.05+i*.03),1.02-i*.02,-.02+i*.04],[x+s*(.1+i*.03),1.13-i*.03,-.03+i*.04],.022,.003,5)});
  const tasset=(c)=>[-1,1].forEach(s=>mdLS(B,P,s,0,2,.024,{t:'m',col:m=>m.y<.43?mdSh(c,.8):c,keep:m=>m.s>-.3&&m.y>.4}));
  const vamb=(c)=>[-1,1].forEach(s=>mdAS(B,P,s,4,5,.016,{t:'m',col:c}));
  const gorget=(c)=>mdTS(B,P,.96,1.03,.034,{t:'m',col:c});
  const tabard=(c,tr,sym)=>{const z=m=>Math.abs(m.c)<.36;mdTS(B,P,.62,.97,(P.tOff||0)+.008,{col:m=>Math.abs(m.c)>.3?tr:c,keep:m=>z(m)&&(m.s>0||m.s<0)});
    mdSkirt(B,P,.62,.34,.02,(P.tOff||0)+.012,{col:m=>m.y<.36?tr:Math.abs(m.c)>.28?tr:c,keep:m=>Math.abs(m.c)<.34,n:4});
    if(sym){const f=mdTorsoAt(P,.82).f+(P.tOff||0)+.016;k.p('chest','box','c',sym,0,.82,f,.022,.12,.006).p('chest','box','c',sym,0,.85,f,.08,.022,.006)}};
  const fur=(c)=>{mdTS(B,P,.9,1.0,(P.tOff||0)+.03,{col:m=>Math.round(m.c*6+m.s*3)%2?c:mdSh(c,.82),lip:.03,lipT:.02})};
  const vest=(c,lo)=>{mdTS(B,P,lo||.55,.985,(P.tOff||0)+.014,{col:m=>m.s>.75&&m.y<.95?mdSh(c,.7):c,lip:.006})};
  const sleeves=(c,to,off)=>[-1,1].forEach(s=>mdAS(B,P,s,0,to,off||.008,{col:c}));
  const shirt=(c,lo)=>{mdTS(B,P,lo||.5,.99,.008,{col:c});};
  const coat=(c,y1,fl,split)=>mdSkirt(B,P,.56,y1,fl,(P.tOff||0)+.012,{col:m=>m.y<y1+.03?mdSh(c,.75):c,keep:split?(m=>!(m.s>.86)):null,n:5});
  if(d.a=='heavy'){
    if(st=='mail'){mail(3);belt(.6,lt,A)}
    else if(st=='hauberk'){mail(3);pauld(1,0,0);belt(.6,lt,A);mdTS(B,P,.66,.96,.02,{col:lt,keep:m=>Math.abs(m.c+m.s*.6)<.16})}
    else if(st=='cuirass'){mail(3);plate(1);pauld(2,1,0);tasset(mdSh(M,.9))}
    else if(st=='warplate'){shirt(mdSh(M,.5));sleeves(dk,3);plate(2);pauld(3,2,ti>=3?1:0);tasset(M);vamb(M);gorget(mdSh(M,1.1))}
    else if(st=='aegis'){shirt(mdSh(M,.5));sleeves(dk,3);plate(2);pauld(3,3,0);tasset(M);vamb(M);gorget(A);[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0';k.p(a,'box','m',A,s*.29,1.04,-.02,.012,.12,.1,-.2,0,-s*.5)});
      if(!P.noTabard)tabard(mdSh(A,.75),mdMix(A,0xe8e0c8,.4))}
    else if(st=='blood'){mail(3);plate(1);pauld(2,1,2);tabard(0x6a0c14,0x2a0608);vamb(mdSh(M,.9))}
    else if(st=='wall'){shirt(mdSh(M,.5));sleeves(dk,3);plate(2);pauld(3,2,0,1);tasset(M);vamb(M);gorget(M);
      const f=mdTorsoAt(P,.8).f+.034;for(let i=0;i<4;i++)k.p('chest','sph','m',A,(i%2?.07:-.07),.72+(i>>1)*.16,f-.01,.012)}
    else{/*warlord*/shirt(mdSh(M,.5));sleeves(dk,3);plate(2);pauld(3,2,2);tasset(M);vamb(M);fur(0x5a4636);const f=mdTorsoAt(P,.84).f+.04;k.p('chest','oct','m',0xd8ccb0,0,.84,f,.035,.04,.02)}}
  else if(d.a=='medium'){
    if(st=='padded'){mdTS(B,P,.48,.99,.012,{col:m=>Math.round(m.y*30)%2?M:mdSh(M,.85),lip:.01});sleeves(mdSh(M,.9),3,.01);belt(.6,lt,A)}
    else if(st=='brigandine'){shirt(mdSh(M,.7));sleeves(mdSh(M,.7),3);vest(M);const f=y=>mdTorsoAt(P,y).f+(P.tOff||0)+.004;for(let r=0;r<3;r++)for(let c=0;c<3;c++)k.p('chest','sph','m',A,-.06+c*.06,.72+r*.08,f(.72+r*.08),.011);belt(.6,lt,A)}
    else if(st=='vest'){shirt(mdSh(M,.65));sleeves(mdSh(M,.65),3);vest(M,.5);mdAS(B,P,-1,0,2,.024,{col:mdSh(M,1.15)});belt(.6,lt,A);k.p('pelvis','box','c',mdSh(lt,1.2),.15,.52,.08,.05,.07,.04,0,.5,0)}
    else if(st=='longcoat'){shirt(mdSh(M,.6));sleeves(M,5,.012);vest(M,.56);coat(M,.3,.06,true);belt(.6,lt,A);k.p('aL0','hem','c',0xd8ccb0,-.25,.985,0,.1,.07,.105,0,0,-.4)}
    else if(st=='mantle'){shirt(mdSh(M,.6));sleeves(M,5,.012);vest(M,.56);coat(M,.36,.04,true);mdTS(B,P,.86,.99,(P.tOff||0)+.024,{col:m=>Math.round(m.c*7)%2?A:mdSh(A,.8),lip:.05});belt(.6,lt,A)}
    else if(st=='path'){shirt(mdSh(M,.7));sleeves(mdSh(M,.7),3);vest(M);belt(.6,lt,A);mdTS(B,P,.95,1.0,(P.tOff||0)+.02,{col:A,lipT:.01});k.p('pelvis','box','c',lt,-.16,.5,.06,.06,.08,.05,0,-.5,0)}
    else if(st=='bandolier'){shirt(mdSh(M,.7));sleeves(mdSh(M,.7),3);vest(M);belt(.6,lt,A);mdTS(B,P,.62,.98,(P.tOff||0)+.008,{col:lt,keep:m=>Math.abs(m.c-m.s*.55)<.14||Math.abs(m.c+m.s*.55)<.14});
      for(let i=0;i<4;i++){const y=.7+i*.06;k.p('chest','box','m',A,-.08+i*.05,y,mdTorsoAt(P,y).f+(P.tOff||0)+.006,.014,.03,.008,0,0,.6)}}
    else{/*tails*/shirt(mdSh(M,.6));sleeves(M,5,.012);vest(M,.56);coat(M,.22,.08,true);belt(.6,lt,A)}}
  else if(d.a=='light'){
    if(st=='wraps'){mdTS(B,P,.5,.99,.01,{col:m=>Math.round(m.y*26+m.c*2)%2?M:mdSh(M,.8)});[-1,1].forEach(s=>mdAS(B,P,s,3,5,.01,{col:m=>Math.round(m.y*30)%2?M:mdSh(M,.75)}))}
    else if(st=='scale'){mdTS(B,P,.5,.99,.012,{col:m=>(Math.round(m.y*36)+Math.round((m.c+1)*5))%2?M:mdSh(M,.78)});sleeves(mdSh(M,.6),2);belt(.6,A,A)}
    else if(st=='garb'){shirt(M);sleeves(M,5);mdTS(B,P,.66,.98,.011,{col:mdSh(M,.6),keep:m=>Math.abs(m.c-m.s*.5)<.12||Math.abs(m.c+m.s*.5)<.12});belt(.6,A,mdSh(A,1.2));   // v178: the straps lie on the shirt (.008)
      mdSkirt(B,P,.6,.42,.02,(P.tOff||0)+.012,{col:mdSh(M,.75),keep:m=>Math.abs(m.c)<.5,n:3})}
    else if(st=='shroud'){shirt(M);sleeves(M,5);belt(.6,mdSh(M,.6),A);coat(mdSh(M,.85),.3,.05,true);mdTS(B,P,.93,1.03,(P.tOff||0)+.02,{col:mdSh(M,.7),lipT:.02});k.p('aR0','hem','m',A,.25,.985,0,.1,.07,.1,0,0,.4)}
    else if(st=='raiment'){shirt(M);sleeves(M,5);belt(.6,A,A);coat(mdSh(M,.85),.26,.07,true);mdTS(B,P,.94,1.06,(P.tOff||0)+.03,{col:m=>m.s<0?mdSh(M,.6):A,lipT:.04,keep:m=>m.s<.55})}
    else if(st=='cutthroat'){shirt(M);sleeves(M,5);vest(mdSh(M,.75));belt(.6,lt,A);for(let i=0;i<4;i++){const y=.66+i*.07;k.p('chest','box','m',0xb8bec8,.09-i*.04,y,mdTorsoAt(P,y).f+(P.tOff||0)+.006,.012,.05,.006,0,0,-.6)}}
    else if(st=='venom'){shirt(M);sleeves(M,5);belt(.6,lt,A);for(let i=0;i<3;i++)k.p('pelvis','cyl','g',G||0x6ae05a,-.12+i*.06,.55,mdTorsoAt(P,.55).f+.02,.014,.04,.014);mdTS(B,P,.66,.98,(P.tOff||0)+.008,{col:A,keep:m=>Math.abs(m.c-m.s*.5)<.1})}
    else{/*scarf*/shirt(M);sleeves(M,5);belt(.6,A,A);mdTS(B,P,.92,1.04,(P.tOff||0)+.03,{col:A,lip:.01,lipT:.01});mdLoft(B,[{p:[.08,.98,-.14],rx:.04,f:.01,b:.01,w:[['chest',1]]},{p:[.1,.7,-.17],rx:.05,f:.01,b:.01,w:[['chest',.4],['cp1',.6]]},{p:[.12,.5,-.2],rx:.045,f:.01,b:.01,w:[['cp2',1]]}],{seg:4,capA:true,capB:true,col:A})}}
  else{ // cloth: robes
    const rb=M,rd=mdSh(M,.78),tr=mdGlowOr(d,A),long=st=='regalia'||st=='vestments'||st=='star'?.06:st=='robe'||st=='witch'?.1:.08;
    shirt(rb,.5);[-1,1].forEach(s=>{mdAS(B,P,s,0,3,.01,{col:rb});mdLoft(B,mdArm(P,s).slice(3,6).map((r,i)=>Object.assign({},r,{rx:r.rx+i*.018,f:r.f+i*.02,b:r.b+i*.018})),{seg:8,off:.012,col:m=>m.i>1.5?tr:rd})});
    mdSkirt(B,P,.6,long,.09,.016,{col:m=>m.y<long+.03?tr:(st=='witch'&&(Math.round(m.c*4+m.y*9)%3==0))?mdMix(rb,0x6a5a3a,.3):rb,n:6});
    belt(.6,st=='pyre'?0x5a1a10:mdSh(A,.6),A);
    if(st=='robe'||st=='witch')mdTS(B,P,.88,1.0,(P.tOff||0)+.02,{col:st=='witch'?0x4a3a2a:rd,lip:.04});
    if(st=='moss')mdTS(B,P,.84,1.0,(P.tOff||0)+.024,{col:m=>Math.round(m.c*6)%2?mdSh(rb,1.15):rd,lip:.06});
    if(st=='pyre'||st=='binder'){mdTS(B,P,.66,.98,(P.tOff||0)+.008,{col:tr,keep:m=>Math.abs(m.c)<.1});mdTS(B,P,.95,1.06,(P.tOff||0)+.03,{col:rd,lipT:.035,keep:m=>m.s<.6})}
    if(st=='binder')[-1,1].forEach(s=>k.p('pelvis','box','c',s<0?0x6a3a1a:0xd8ccb0,s*.17,.52,.06,.05,.07,.025,0,s*.6,0));
    if(st=='vestments'||st=='regalia'||st=='star'){mdTS(B,P,.92,1.08,(P.tOff||0)+.034,{col:m=>m.s>0?tr:rd,lipT:.05,keep:m=>m.s<.5});[-1,1].forEach(s=>k.p(s<0?'aL0':'aR0','hem','c',st=='regalia'?A:rd,s*.25,.985,0,.11,.07,.115,0,0,s*.4));
      mdTS(B,P,.66,.98,(P.tOff||0)+.008,{col:tr,keep:m=>Math.abs(m.c)<.12})}
    if(ti>=2||d.set){const f=mdTorsoAt(P,.84).f+(P.tOff||0)+.012;k.p('chest','oct',G?'g':'m',G||d.gem,0,.84,f,.022,.028,.012)}}
  if(G&&d.a!='cloth'){const f=mdTorsoAt(P,.86).f+(P.tOff||0)+.012;k.p('chest','oct','g',G,0,.86,f,.02,.026,.01)}
  mdKit(B,k)}

// =====================================================================================================
// helm (returns how much hair stays: 'none' | 'hang' | 'all')
