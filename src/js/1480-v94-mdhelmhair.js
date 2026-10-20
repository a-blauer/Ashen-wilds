// =====================================================================================================
function mdHelmHair(d){const s=d.st;if(['circlet','diadem','crown','hat','witch','star','wrap','bandana','galemask','glassmask','venom','viper','feather'].includes(s))return s=='star'?'none':'all';
  if(['nasal','horned','great','visage','winged','barbute','bucket','crowned'].includes(s))return 'hang';return 'none'}
function mdHelm(B,P,d){const H=P._H||(P._H=mdHeadR(P)),M=d.M,A=d.A,G=d.G,dk=d.dk,k=mdKP(),st=d.st,hz=y=>mdHeadZ(P,y),slit=G||0x0a0806,top=H[H.length-1].y;
  const dome=(y0,off,col,t)=>mdLoft(B,H.filter(r=>r.y>=y0),{seg:10,off,t:t||'m',capB:true,col:col||M});
  const full=(off,col,face,sq)=>mdLoft(B,H,{seg:10,off,t:'m',capB:true,capA:false,sq:sq||0,col:m=>face&&face(m)||col||M});
  const rim=(y,off,col,t)=>{const R=H.filter(r=>Math.abs(r.y-y)<.045);if(R.length>=2)mdLoft(B,[R[0],R[R.length-1]],{seg:10,off,t:t||'m',col})};
  const hood=(off,col,open,o)=>{o=o||{};const fy=o.fy||1.21;mdLoft(B,H,{seg:10,off,t:'c',capB:true,col:m=>m.y<1.04?mdSh(col,.85):col,keep:m=>!(m.s>(open||.3)&&m.y<fy&&m.y>1.0)});
    // drape over the neck and shoulders
    mdLoft(B,[{p:[0,1.04,-.005],rx:.1+off,f:.08,b:.1+off,w:[['neck',.5],['head',.5]]},{p:[0,.995,-.01],rx:.15+off,f:.11,b:.13+off,w:[['chest',.5],['neck',.5]]},{p:[0,.95,-.01],rx:.2+off,f:.14,b:.15+off,w:[['chest',1]]}],
      {seg:12,t:'c',col:o.drape||mdSh(col,.9),keep:m=>!(m.s>.7&&m.y>1.0)});
    if(o.tip!==false)k.L('head','c',col,[0,top-.03,-.09],[0,top-.07,-.2],.04,.008,5)};
  const face=(c,y0,y1,s0)=>mdLoft(B,H,{seg:10,off:.012,t:'c',col:c,keep:m=>m.s>(s0==null?-.25:s0)&&m.y>y0&&m.y<y1});
  const horns=(c,sz,up)=>[-1,1].forEach(s=>{const x=mdHeadX(P,1.2)+.01,a=[s*x,1.2,0],b=[s*(x+.07*sz),1.24+.02*sz,-.02],c2=[s*(x+.1*sz),1.3+.06*sz*(up||1),-.03];k.L('head','c',c,a,b,.032*sz,.022*sz,6).L('head','c',mdSh(c,.8),b,c2,.022*sz,.003,6)});
  const crest=(c,n,h)=>{for(let i=0;i<n;i++){const a=-.6+i*(1.6/(n-1)),y=1.17+Math.cos(a)*.12,z=Math.sin(a)*.12;k.p('head','box','m',c,0,y+h*.3,z-.01,.014,h*(1-Math.abs(a+.2)*.3),.05,a)}};
  const visor=m=>m.s>.6&&Math.abs(m.y-1.145)<.014?slit:null;
  const pts=(c,n,h,y,t)=>{for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=mdHeadX(P,y)+.016,big=i==0;k.p('head','cone4',t||'m',c,Math.sin(a)*r,y+.03*(big?1.5:1)*h,Math.cos(a)*r*1.05,.018,(.06*(big?1.5:1))*h,.018)}};
  const gemF=(c,y,sz)=>k.p('head','oct',G?'g':'m',G||c,0,y,hz(y)+.016,.02*(sz||1),.026*(sz||1),.012);
  if(d.a=='heavy'){
    if(st=='nasal'){dome(1.13,.022);rim(1.15,.026,A);k.p('head','box','m',A,0,1.12,hz(1.12)+.022,.022,.08,.014)}
    else if(st=='horned'){dome(1.13,.022);rim(1.15,.026,A);k.p('head','box','m',A,0,1.12,hz(1.12)+.022,.022,.08,.014);horns(0xd8ccb0,1)}
    else if(st=='great'){full(.024,M,visor);rim(1.2,.028,A)}
    else if(st=='visage'){full(.024,M,m=>m.s>.5&&m.y>1.12&&m.y<1.16&&Math.abs(m.c)>.06?slit:m.s>.75&&m.y<1.1?mdSh(M,.75):null);crest(A,6,.06)}
    else if(st=='winged'){full(.024,M,visor);rim(1.2,.028,A);crest(A,5,.05);[-1,1].forEach(s=>{const x=mdHeadX(P,1.17)+.03;for(let j=0;j<3;j++)k.p('head','box','m',j%2?M:A,s*(x+j*.012),1.19+j*.04,-.04-j*.02,.012,.1-j*.018,.06,-.35,0,-s*(.5+j*.25))})}
    else if(st=='barbute'){full(.024,M,m=>(m.s>.55&&Math.abs(m.y-1.145)<.016)||(Math.abs(m.c)<.12&&m.s>.6&&m.y<1.15&&m.y>1.05)?slit:null);horns(0x8a1a1a,.8);k.L('head','c',0x8a1a1a,[0,top+.02,-.02],[0,top+.02,-.16],.03,.01,5)}
    else if(st=='bucket'){full(.026,M,m=>m.s>.6&&Math.abs(m.y-1.15)<.012?slit:m.s>.7&&m.y<1.12&&Math.round(m.y*90)%3==0?0x141210:null,.55);rim(1.2,.03,A);rim(1.07,.03,A)}
    else{/*crowned*/full(.024,M,visor);rim(1.2,.03,A);pts(A,8,1.2,1.21);horns(0x2a2420,1.1,1.4)}}
  else if(d.a=='medium'){
    if(st=='hood')hood(.03,M,.3);
    else if(st=='pelt'){hood(.034,M,.3,{tip:false});[-1,1].forEach(s=>k.p('head','cone4','c',mdSh(M,1.1),s*.07,top+.02,-.01,.035,.08,.025,0,0,-s*.25));k.p('head','box','c',mdSh(M,.85),0,top-.01,.07,.07,.04,.08,.3);
      [-1,1].forEach(s=>k.p('head','cone4','c',0xe8e0d0,s*.025,top-.035,.115,.008,.03,.008,Math.PI))}
    else if(st=='cowl'){hood(.03,M,.3);face(A,1.04,1.125,.15)}
    else if(st=='skullhood'){hood(.034,M,.3,{tip:false});k.p('head','sph','c',0xd8ccb0,0,top-.02,.04,.09,.06,.09);[-1,1].forEach(s=>{k.p('head','box','c',0x14100c,s*.03,top-.03,.12,.02,.014,.01);k.L('head','c',0xd8ccb0,[s*.07,top,0],[s*.13,top+.05,-.05],.018,.004,5)})}
    else if(st=='galemask'||st=='wind'){face(mdSh(A,.9),1.125,1.17,.2);[-1,1].forEach(s=>{const x=mdHeadX(P,1.16)+.012;for(let j=0;j<4;j++)k.p('head','cone4','c',j%2?A:0xe8e8f0,s*(x+j*.008),1.16+j*.025,-.02-j*.025,.012,.1-j*.012,.03,-.5-j*.2,0,-s*(.9+j*.15))});if(st=='wind')hood(.032,M,.3,{tip:false})}
    else if(st=='feather'){dome(1.16,.02,M,'c');rim(1.165,.024,mdSh(M,.75),'c');k.L('head','c',A,[.06,1.21,-.02],[.13,1.33,-.1],.012,.002,4)}
    else{/*deadeye*/hood(.03,M,.3);face(mdSh(M,.6),1.04,1.125,.15);k.p('head','box','c',0x14100c,.04,1.145,hz(1.145)+.012,.034,.03,.008);k.p('head','ring','m',A,.04,1.145,hz(1.145)+.014,.02,.15,.02,Math.PI/2)}}
  else if(d.a=='light'){
    if(st=='wrap'){face(M,1.04,1.13,.05);rim(1.19,.016,mdSh(M,.8),'c')}
    else if(st=='viper'){face(M,1.04,1.13,.05);for(let i=0;i<5;i++){const a=-.4+i*.3;k.p('head','cone4','c',A,0,1.17+Math.cos(a)*.115,Math.sin(a)*.115,.016,.05,.02,a)}}
    else if(st=='ashcowl'){hood(.022,M,.32,{tip:false,fy:1.2});face(mdSh(M,.8),1.04,1.13,.1)}
    else if(st=='glassmask'){face(mdSh(M,.55),1.04,1.2,.1);[-1,1].forEach(s=>k.p('head','box',G?'g':'m',G||A,s*.04,1.145,hz(1.145)+.016,.026,.014,.006));rim(1.19,.016,M,'c')}
    else if(st=='stormhood'){hood(.026,M,.32);face(mdSh(M,.6),1.04,1.13,.1);rim(1.2,.034,G||A,G?'g':'m')}
    else if(st=='bandana'){face(M,1.04,1.13,.05);dome(1.18,.016,mdSh(M,.75),'c');k.L('head','c',mdSh(M,.75),[0,1.18,-.11],[.03,1.1,-.18],.02,.01,4)}
    else if(st=='venom'){face(mdSh(M,.7),1.04,1.13,.05);[-1,1].forEach(s=>k.p('head','box',G?'g':'c',G||A,s*.04,1.145,hz(1.145)+.006,.03,.006,.006))}
    else{/*dusk*/hood(.024,M,.32,{tip:false});face(A,1.04,1.13,.05);k.L('head','c',A,[0,1.14,-.13],[.05,.95,-.2],.03,.012,4)}}
  else{ // cloth
    if(st=='linen')hood(.036,M,.25);
    else if(st=='hat'||st=='witch'){const br=st=='witch'?.26:.22,c=st=='witch'?mdSh(M,.6):M;k.p('head','cyl','c',mdSh(c,.85),0,1.235,0,br,.018,br);rim(1.235,.022,A,'c');
      k.L('head','c',c,[0,1.24,0],[.02,1.42,-.04],.11,.06,8).L('head','c',mdSh(c,.92),[.02,1.42,-.04],[.08,1.53,-.12],.06,.025,7).L('head','c',mdSh(c,.82),[.08,1.53,-.12],[.15,1.56,-.18],.025,.004,6);
      k.p('head','cyl','c',A,0,1.26,0,.115,.03,.115);if(G)k.p('head','oct','g',G,0,1.27,.115,.016)}
    else if(st=='circlet'){rim(1.19,.016,A);gemF(d.gem,1.19)}
    else if(st=='diadem'){rim(1.19,.016,A);for(let i=0;i<5;i++){const a=(i-2)*.32,x=Math.sin(a)*(mdHeadX(P,1.19)+.016),z=Math.cos(a)*(hz(1.19)+.016);k.p('head','cone4','m',A,x,1.22+(i==2?.025:0),z,.014,.05+(i==2?.04:0),.01,.0,0,-a*.3)}gemF(d.gem,1.205,1.2)}
    else if(st=='crown'){rim(1.2,.02,A);rim(1.22,.022,A);pts(A,9,1,1.235);gemF(d.gem,1.21,1.3);[-1,1].forEach(s=>k.p('head','oct','m',d.gem,s*.08,1.21,hz(1.21)-.03,.012))}
    else if(st=='tallcowl'){hood(.034,M,.28,{tip:false});k.L('head','c',M,[0,top-.01,-.03],[0,top+.16,-.1],.07,.004,7);rim(1.2,.04,A,'c')}
    else{/*star*/hood(.034,M,.28);rim(1.2,.04,G||A,G?'g':'m');for(let i=0;i<5;i++){const a=(i-2)*.38;k.p('head','oct',G?'g':'m',G||A,Math.sin(a)*.14,1.22,Math.cos(a)*.15,.012)}}}
  mdKit(B,k)}

// =====================================================================================================
// boots
