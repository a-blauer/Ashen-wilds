// =====================================================================================================
function mdHelmO(B,P,d){mdDX(d);const H=P._H||(P._H=mdHeadR(P)),M=d.M,A=d.A,G=d.G,T=d.T,lv=d.lv,dk=d.dk,k=mdKP(),st=d.st,hz=y=>mdHeadZ(P,y),slit=G||0x0a0806,top=H[H.length-1].y,ps=mdSh(M,1.15);
  const dome=(y0,off,col,t)=>mdLoft(B,H.filter(r=>r.y>=y0),{seg:10,off,t:t||'m',capB:true,col:col||M});
  const full=(off,col,face,sq)=>mdLoft(B,H,{seg:10,off,t:'m',capB:true,capA:false,sq:sq||0,col:m=>face&&face(m)||col||M});
  const rim=(y,off,col,t,h)=>{const R=H.filter(r=>Math.abs(r.y-y)<.045);if(R.length<2)return;const a=R[0],b=R[R.length-1],L=(u)=>{const t2=(u-a.y)/(b.y-a.y);return {p:[0,u,a.p[2]+(b.p[2]-a.p[2])*t2],rx:a.rx+(b.rx-a.rx)*t2,f:a.f+(b.f-a.f)*t2,b:a.b+(b.b-a.b)*t2,w:a.w,y:u}};
    mdLoft(B,[L(y-(h||.012)),L(y+(h||.012))],{seg:10,off,t:t||'m',col})};
  const hAt=y=>{for(let i=0;i<H.length-1;i++){const a=H[i],b=H[i+1];if(y<=b.y||i==H.length-2){const t=Math.max(0,Math.min(1,(y-a.y)/(b.y-a.y))),L=(u,v)=>u+(v-u)*t;return {p:[0,y,L(a.p[2],b.p[2])],rx:L(a.rx,b.rx),f:L(a.f,b.f),b:L(a.b,b.b),w:a.w,y}}}return H[0]};
  const cutTop=yl=>{for(let i=0;i<H.length-1;i++)if((H[i].y+H[i+1].y)/2>=yl)return i;return H.length-1};
  const rivR=(y,off,col,n,skipF)=>{const r=hAt(y);for(let i=0;i<n;i++){const a=i/n*Math.PI*2,ca=Math.cos(a);if(skipF&&ca>.8)continue;k.p('head','oct','m',col,Math.sin(a)*(r.rx+off),y,r.p[2]+ca*((ca>0?r.f:r.b)+off),.0075)}};
  const hood=(off,col,open,o)=>{o=o||{};const fy=o.fy||1.21;mdLoft(B,H,{seg:10,off,t:'c',capB:true,col:m=>m.y<1.04?mdSh(col,.85):col,keep:m=>!(m.s>(open||.3)&&m.y<fy&&m.y>1.0)});
    mdLoft(B,[{p:[0,1.04,-.005],rx:.1+off,f:.08,b:.1+off,w:[['neck',.5],['head',.5]]},{p:[0,.995,-.01],rx:.15+off,f:.11,b:.13+off,w:[['chest',.5],['neck',.5]]},{p:[0,.95,-.01],rx:.2+off,f:.14,b:.15+off,w:[['chest',1]]}],
      {seg:12,t:'c',col:o.drape||mdSh(col,.9),keep:m=>!(m.s>.7&&m.y>1.0)});
    // trim along the face opening
    if(o.trim!=null){const seg=10,E=[],it=cutTop(fy),Hs=H.filter((r,i)=>r.y>1.0&&i<=it);Hs.forEach(r=>E.push(mdHV(r,2,seg,off+.004)));const Rt=Hs[Hs.length-1];
      for(let ki=1;ki>=-1;ki--)E.push(mdHV(Rt,ki,seg,off+.006));for(let i=Hs.length-1;i>=0;i--)E.push(mdHV(Hs[i],-2,seg,off+.004));
      mdEdge(k,'head',o.trimT||'c',o.trim,E,.011)}
    if(o.tip!==false)k.L('head','c',col,[0,top-.03,-.09],[0,top-.07,-.2],.04,.008,5);
    if(o.band!=null)mdLoft(B,[{p:[0,.965,-.01],rx:.18+off,f:.128,b:.142+off,w:[['chest',1]]},{p:[0,.95,-.01],rx:.2+off+.004,f:.142,b:.154+off,w:[['chest',1]]}],{seg:12,t:'c',col:o.band,keep:m=>!(m.s>.7)})};
  const face=(c,y0,y1,s0,edge)=>{mdLoft(B,H,{seg:10,off:.012,t:'c',col:c,keep:m=>m.s>(s0==null?-.25:s0)&&m.y>y0&&m.y<y1});
    if(edge!=null){const r0=H[cutTop(y1)],E=[];for(let ki=-2;ki<=2;ki++)E.push(mdHV(r0,ki,10,.016));mdEdge(k,'head',lv>=2?'m':'c',edge,E,.008)}};
  const horns=(c,sz,up,band)=>[-1,1].forEach(s=>{const x=mdHeadX(P,1.2)+.01,a=[s*x,1.2,0],b=[s*(x+.07*sz),1.24+.02*sz,-.02],c2=[s*(x+.1*sz),1.3+.06*sz*(up||1),-.03];
    k.L('head','c',c,a,b,.032*sz,.022*sz,6).L('head','c',mdSh(c,.8),b,c2,.022*sz,.003,6);if(band)k.p('head','tor','m',band,s*(x+.012),1.208,-.004,.034*sz,.014,.034*sz,0,0,s*1.1)});
  const crest=(c,n,h,c2)=>{for(let i=0;i<n;i++){const a=-.6+i*(1.6/(n-1)),y=1.17+Math.cos(a)*.12,z=Math.sin(a)*.12;k.p('head','box','m',i%2&&c2?c2:c,0,y+h*.3,z-.01,.014,h*(1-Math.abs(a+.2)*.3),.05,a)}};
  const plume=(c,c2,n,len)=>{let p=[0,top+.02,-.02];for(let i=0;i<n;i++){const q=[0,top+.04-i*.03-i*i*.008,-.06-i*.05];k.L('head','c',i%2?c2:c,p,q,.034-i*.003,.03-i*.003,5);p=q}};
  const visor=m=>m.s>.6&&Math.abs(m.y-1.145)<.014?slit:null;
  const breaths=(n,x0)=>{for(let i=0;i<n;i++){const y=1.07+(i%3)*.016,x=(x0||.03)+Math.floor(i/3)*.016;k.p('head','box','c',0x0a0806,x,y,hz(y)+.022,.008,.004,.008)}};
  const pts=(c,n,h,y,t)=>{for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=mdHeadX(P,y)+.016,big=i==0;k.p('head','cone4',t||'m',c,Math.sin(a)*r,y+.03*(big?1.5:1)*h,Math.cos(a)*r*1.05,.018,(.06*(big?1.5:1))*h,.018)}};
  const gemF=(c,y,sz)=>k.p('head','oct',G?'g':'m',G||c,0,y,hz(y)+.016,.02*(sz||1),.026*(sz||1),.012);
  const aventail=(c)=>{const mc=mdMix(c,0x6a6c70,.3),md=mdSh(mc,.78);mdLoft(B,[{p:[0,1.07,-.005],rx:.11,f:.1,b:.11,w:[['head',1]]},{p:[0,1.0,-.01],rx:.15,f:.12,b:.13,w:[['neck',.6],['head',.4]]},{p:[0,.955,-.01],rx:.2,f:.15,b:.155,w:[['chest',1]]}],
    {seg:12,t:'m',col:m=>Math.round(m.y*60)%2?mc:md,keep:m=>!(m.s>.55&&m.y>1.0)})};
  if(d.a=='heavy'){
    if(st=='nasal'){aventail(M);dome(1.13,.022);rim(1.15,.026,T);k.p('head','box','m',T,0,1.12,hz(1.12)+.024,.022,.08,.014);rivR(1.15,.03,T,10,1);dome(1.22,.024,ps)}
    else if(st=='horned'){aventail(M);dome(1.13,.022);rim(1.15,.026,T);k.p('head','box','m',T,0,1.12,hz(1.12)+.024,.022,.08,.014);rivR(1.15,.03,T,10,1);horns(0xd8ccb0,1,1,T);
      // cheek guards
      [-1,1].forEach(s=>k.p('head','box','m',M,s*(mdHeadX(P,1.09)+.022),1.08,.03,.012,.07,.06,0,0,0));crest(T,4,.02)}
    else if(st=='great'){full(.024,M,m=>visor(m)||(m.s>.6&&m.y<1.13&&m.y>1.04&&Math.abs(m.c)<.25?ps:null));rim(1.2,.028,T);rim(1.165,.028,T,'m',.006);breaths(6,.03);breaths(6,-.06);
      k.p('head','box','m',T,0,1.1,hz(1.1)+.03,.012,.08,.012);rivR(1.2,.032,T,8,0);crest(T,5,.03,ps)}
    else if(st=='visage'){full(.024,M,m=>m.s>.5&&m.y>1.12&&m.y<1.16&&Math.abs(m.c)>.06?slit:m.s>.75&&m.y<1.1?mdSh(M,.75):null);crest(T,7,.07,M);rim(1.2,.028,T);
      [-1,1].forEach(s=>{k.p('head','box','m',T,s*.04,1.168,hz(1.168)+.026,.04,.008,.008,0,0,s*.25)});breaths(6,.03);plume(d.R||mdSh(A,.8),mdSh(d.R||A,.6),5)}
    else if(st=='winged'){full(.024,M,visor);rim(1.2,.028,T);rim(1.1,.028,T,'m',.008);crest(T,5,.05);[-1,1].forEach(s=>{const x=mdHeadX(P,1.17)+.03;for(let j=0;j<4;j++)k.p('head','box','m',j%2?M:T,s*(x+j*.012),1.19+j*.04,-.04-j*.02,.012,.11-j*.018,.07,-.35,0,-s*(.5+j*.25))});
      gemF(d.gem,1.19,1.1);breaths(6,.03)}
    else if(st=='barbute'){full(.024,M,m=>(m.s>.55&&Math.abs(m.y-1.145)<.016)||(Math.abs(m.c)<.12&&m.s>.6&&m.y<1.15&&m.y>1.05)?slit:null);rim(1.2,.028,T);rivR(1.2,.032,T,8,0);
      horns(0x8a1a1a,.85,1,T);plume(0x8a1420,0x5a0a10,6);k.p('head','sph',G?'g':'c',G||0xa01020,0,1.215,hz(1.215)+.03,.012,.014,.008);k.p('head','cone4',G?'g':'c',G||0xa01020,0,1.232,hz(1.232)+.03,.009,.022,.006)}
    else if(st=='bucket'){full(.026,M,m=>m.s>.6&&Math.abs(m.y-1.15)<.012?slit:null,.55);rim(1.2,.03,T);rim(1.07,.03,T);breaths(9,.024);
      k.p('head','box','m',T,0,1.14,hz(1.14)+.03,.016,.12,.012);rivR(1.2,.034,T,10,0);
      // tower crest: crenellations on the top
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('head','box','m',i%2?T:M,Math.sin(a)*.07,top+.01,Math.cos(a)*.07,.03,.04,.03,0,a,0)}}
    else{/*crowned*/full(.024,M,visor);rim(1.2,.03,T);rim(1.22,.026,T);pts(T,8,1.2,1.235);horns(0x2a2420,1.1,1.4,T);gemF(d.gem,1.215,1.1);breaths(6,.03);
      for(let i=0;i<4;i++){const a=(i-1.5)*.5;k.p('head','oct',G?'g':'m',G||mdSh(T,.8),Math.sin(a)*(mdHeadX(P,1.21)+.03),1.21,Math.cos(a)*(hz(1.21)+.03),.009)}}
    if(G&&d.GB&&st!='winged'&&st!='crowned'&&st!='barbute')gemF(d.gem,1.205,.8)}
  else if(d.a=='medium'){const tr=lv>=2?T:mdSh(M,.7),tt=lv>=2?'m':'c';
    if(st=='hood'){hood(.03,M,.3,{trim:mdSh(M,.7),band:mdSh(M,.75)})}
    else if(st=='pelt'){hood(.034,M,.3,{tip:false,trim:0xd8ccb0,band:0x6a5a48});[-1,1].forEach(s=>k.p('head','cone4','c',mdSh(M,1.1),s*.07,top+.02,-.01,.035,.08,.025,0,0,-s*.25));k.p('head','box','c',mdSh(M,.85),0,top-.01,.07,.07,.04,.08,.3);
      [-1,1].forEach(s=>k.p('head','cone4','c',0xe8e0d0,s*.025,top-.035,.115,.008,.03,.008,Math.PI))}
    else if(st=='cowl'){hood(.03,M,.3,{trim:tr,trimT:tt,band:A});face(A,1.04,1.125,.15,tr);[-1,1].forEach(s=>k.p('head','oct','m',T,s*.075,1.1,hz(1.1)-.01,.01))}
    else if(st=='skullhood'){hood(.034,M,.3,{tip:false,trim:0xd8ccb0});k.p('head','sph','c',0xd8ccb0,0,top-.02,.04,.09,.06,.09);[-1,1].forEach(s=>{k.p('head','box','c',0x14100c,s*.03,top-.03,.12,.02,.014,.01);k.L('head','c',0xd8ccb0,[s*.07,top,0],[s*.13,top+.05,-.05],.018,.004,5)});
      for(let i=0;i<5;i++)k.p('head','cone4','c',0xece4cc,-.04+i*.02,top-.06,.125,.006,.02,.006,Math.PI)}
    else if(st=='galemask'||st=='wind'){face(mdSh(A,.9),1.125,1.17,.2,T);[-1,1].forEach(s=>{const x=mdHeadX(P,1.16)+.012;for(let j=0;j<5;j++)k.p('head','cone4','c',j%2?A:0xe8e8f0,s*(x+j*.008),1.16+j*.025,-.02-j*.025,.012,.11-j*.012,.03,-.5-j*.2,0,-s*(.9+j*.15))});
      if(st=='wind')hood(.032,M,.3,{tip:false,trim:A,trimT:'m'});else{rim(1.19,.016,mdSh(M,.7),'c');gemF(d.gem,1.19,.8)}}
    else if(st=='feather'){dome(1.16,.02,M,'c');rim(1.165,.024,mdSh(M,.75),'c',.014);rim(1.175,.026,A,'c',.005);
      k.L('head','c',0x8a6a3a,[.06,1.21,-.02],[.13,1.33,-.1],.012,.002,4);k.L('head','c',0x5a7a3a,[.07,1.2,-.04],[.12,1.3,-.16],.01,.002,4);
      // leaf brooch
      k.p('head','oct','c',0x6a8a3a,.085,1.19,-.01,.022,.012,.012,0,0,.6);k.p('head','oct','m',T,.085,1.19,0,.008)}
    else{/*deadeye*/hood(.03,M,.3,{trim:A,band:mdSh(M,.7)});face(mdSh(M,.6),1.04,1.125,.15,A);k.p('head','box','c',0x14100c,.04,1.145,hz(1.145)+.012,.034,.03,.008);k.p('head','ring','m',T,.04,1.145,hz(1.145)+.014,.02,.15,.02,Math.PI/2);
      k.p('head','cyl','g',G||0xc03020,.04,1.145,hz(1.145)+.018,.008,.004,.008,Math.PI/2);for(let i=0;i<3;i++)k.L('head','c',i==1?0xe8e0d0:A,[-.06,top-.03,-.08],[-.12-i*.02,top+.05-i*.02,-.14],.012,.002,4)}
    if(G&&d.GB)gemF(d.gem,1.2,.7)}
  else if(d.a=='light'){const dm=0x2a2c32;
    if(st=='wrap'){face(M,1.04,1.13,.05,mdSh(M,.7));rim(1.19,.016,mdSh(M,.8),'c');k.L('head','c',mdSh(M,.75),[0,1.19,-.11],[.03,1.1,-.17],.016,.008,4)}
    else if(st=='viper'){face(M,1.04,1.13,.05,A);for(let i=0;i<5;i++){const a=-.4+i*.3;k.p('head','cone4','c',A,0,1.17+Math.cos(a)*.115,Math.sin(a)*.115,.016,.05,.02,a)}
      [-1,1].forEach(s=>k.p('head','cone4','c',0xe8e0d0,s*.02,1.06,hz(1.06)+.012,.006,.022,.006,Math.PI))}
    else if(st=='ashcowl'){hood(.022,M,.32,{tip:false,fy:1.2,trim:dm,trimT:'m'});face(mdSh(M,.8),1.04,1.13,.1,T)}
    else if(st=='glassmask'){face(mdSh(M,.55),1.04,1.2,.1);[-1,1].forEach(s=>k.p('head','box',G?'g':'m',G||A,s*.04,1.145,hz(1.145)+.016,.026,.014,.006));rim(1.19,.016,M,'c');
      mdEdge(k,'head','m',T,[-2,-1,0,1,2].map(ki=>mdHV(H[cutTop(1.2)],ki,10,.016)),.007);k.p('head','oct','m',T,0,1.16,hz(1.16)+.018,.012,.02,.008)}
    else if(st=='stormhood'){hood(.026,M,.32,{trim:G||A,trimT:G?'g':'m'});face(mdSh(M,.6),1.04,1.13,.1,T);rim(1.2,.034,G||A,G?'g':'m',.006)}
    else if(st=='bandana'){face(M,1.04,1.13,.05,0x6a1a1a);dome(1.18,.016,mdSh(M,.75),'c');k.L('head','c',mdSh(M,.75),[0,1.18,-.11],[.03,1.1,-.18],.02,.01,4);k.L('head','c',0x6a1a1a,[0,1.18,-.11],[-.03,1.08,-.17],.016,.008,4);
      k.p('head','box','m',0xb8bec8,.06,1.2,hz(1.2)-.01,.008,.04,.004,0,.6,.5)}
    else if(st=='venom'){face(mdSh(M,.7),1.04,1.13,.05,A);[-1,1].forEach(s=>k.p('head','box',G?'g':'c',G||A,s*.04,1.145,hz(1.145)+.006,.03,.006,.006));
      // serpent across the brow
      for(let i=0;i<7;i++){const a=-.9+i*.3,r=mdHeadX(P,1.19)+.012;k.p('head','oct','c',i%2?A:mdSh(A,.7),Math.sin(a)*r,1.19+Math.sin(i*1.3)*.008,Math.cos(a)*(hz(1.19)+.012)*.98,.014,.012,.014)}}
    else{/*dusk*/hood(.024,M,.32,{tip:false,trim:T,trimT:'m'});face(A,1.04,1.13,.05,T);k.L('head','c',A,[0,1.14,-.13],[.05,.95,-.2],.03,.012,4);
      // crescent moon on the brow
      for(let i=0;i<5;i++){const a=-1.1+i*.55;k.p('head','box','m',T,Math.cos(a)*.022,1.21+Math.sin(a)*.022,hz(1.21)+.03,.006,.016,.004,0,0,a)}}
    if(G&&d.GB)gemF(d.gem,1.2,.7)}
  else{ // cloth
    if(st=='linen'){hood(.036,M,.25,{trim:A,band:mdSh(M,.85)})}
    else if(st=='hat'||st=='witch'){const br=st=='witch'?.26:.22,c=st=='witch'?mdSh(M,.6):M;k.p('head','cyl','c',mdSh(c,.85),0,1.235,0,br,.018,br);rim(1.235,.022,A,'c');
      k.L('head','c',c,[0,1.24,0],[.02,1.42,-.04],.11,.06,8).L('head','c',mdSh(c,.92),[.02,1.42,-.04],[.08,1.53,-.12],.06,.025,7).L('head','c',mdSh(c,.82),[.08,1.53,-.12],[.15,1.56,-.18],.025,.004,6);
      k.p('head','cyl','c',A,0,1.26,0,.115,.03,.115);k.p('head','box','m',T,0,1.26,.112,.03,.03,.008);
      if(st=='witch'){// charms on the brim, a feather in the band
        [[.15,0xe0d6bc,'cone4'],[-.12,0x6a8a4a,'box'],[.02,0x8a5a3a,'sph']].forEach(([x,cc,g])=>{const z=Math.sqrt(Math.max(0,br*br-x*x))*.9;k.L('head','c',0x2a1a10,[x,1.232,z],[x,1.19,z],.003,.003,3);k.p('head',g,'c',cc,x,1.18,z,.012,.02,.01)});
        k.L('head','c',0x6a5a3a,[-.1,1.26,.06],[-.18,1.36,.02],.01,.002,4)}
      if(G)k.p('head','oct','g',G,0,1.27,.115,.016)}
    else if(st=='circlet'){rim(1.19,.016,T,'m',.008);gemF(d.gem,1.19);[-1,1].forEach(s=>k.p('head','oct','m',T,s*.05,1.19,hz(1.19)-.008,.008))}
    else if(st=='diadem'){rim(1.19,.016,T,'m',.01);for(let i=0;i<5;i++){const a=(i-2)*.32,x=Math.sin(a)*(mdHeadX(P,1.19)+.016),z=Math.cos(a)*(hz(1.19)+.016);k.p('head','cone4','m',T,x,1.22+(i==2?.025:0),z,.014,.05+(i==2?.04:0),.01,.0,0,-a*.3)}gemF(d.gem,1.205,1.2);
      [-1,1].forEach(s=>k.p('head','oct',G?'g':'m',G||mdSh(d.gem,.8),s*.06,1.2,hz(1.2)-.012,.009))}
    else if(st=='crown'){rim(1.2,.02,T);rim(1.225,.022,T,'m',.008);pts(T,9,1,1.235);gemF(d.gem,1.21,1.3);[-1,1].forEach(s=>k.p('head','oct','m',d.gem,s*.08,1.21,hz(1.21)-.03,.012));
      for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=mdHeadX(P,1.235)+.016;k.p('head','sph',G&&i%3==0?'g':'m',G&&i%3==0?G:mdSh(T,1.1),Math.sin(a)*r,1.235+.03*(i==0?1.5:1)+.03,Math.cos(a)*r*1.05,.008)}}
    else if(st=='tallcowl'){hood(.034,M,.28,{tip:false,trim:T,trimT:'m',band:A});k.L('head','c',M,[0,top-.01,-.03],[0,top+.16,-.1],.07,.004,7);rim(1.2,.04,A,G?'g':'c',.008);
      for(let i=0;i<3;i++)k.p('head','box',G?'g':'m',G||A,0,top+.02+i*.035,-.04-i*.018,.012,.012,.004,0,0,Math.PI/4)}
    else{/*star*/hood(.034,M,.28,{trim:T,trimT:'m',band:A});rim(1.2,.04,G||A,G?'g':'m',.008);for(let i=0;i<5;i++){const a=(i-2)*.38;mdStar(k,'head',G?'g':'m',G||T,Math.sin(a)*.145,1.225,Math.cos(a)*.15,i==2?.012:.008)}}}
  mdKit(B,k)}

// =====================================================================================================
// boots
