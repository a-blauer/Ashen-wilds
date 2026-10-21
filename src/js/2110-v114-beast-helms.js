// ================= v114: helmets built over a beast's skull =================
// Every helm style of the game (heavy: nasal horned great visage winged barbute bucket crowned · medium: hood pelt cowl
// skullhood galemask feather deadeye wind · light: wrap viper ashcowl glassmask stormhood bandana venom dusk · cloth:
// linen hat witch circlet diadem crown tallcowl star) is built from the race's skull rings pushed out by an offset, so
// it sits on that skull: openings where the ears stand (`D.earW`), eye slits at the eyes (`D.eyeW`), the frog's eye
// domes left free (`D.topW`), snout guards and masks along the muzzle, hats and circlets at the crown.
// shell over the skull: the skull rings pushed out by off (top/sides), between z0 and z1, keep(m) chooses the faces
function brShell(B,D,off,z0,z1,keep,col,t,seg){const R=[],push=z=>{const q=brSkullAt(D,z);R.push({p:[0,q.yc,z],rx:q.rx+off,f:q.f+off,b:q.b+off*.6,w:[['head',1]]})};
  const zs=[z0];D.SN.forEach(q=>{if(q[0]>z0+.008&&q[0]<z1-.008)zs.push(q[0])});const ez=D.EYEP[2];[ez-.015,ez+.012,ez+.04].forEach(z=>{if(z>z0+.008&&z<z1-.008)zs.push(z)});zs.push(z1);zs.sort((a,b)=>a-b).forEach(push);
  const kp=D.topW?m=>!D.topW(m)&&(!keep||keep(m)):keep;
  mdLoft(B,R,{seg:seg||16,ref:[0,1,0],t:t||'m',capA:z0<=D.SN[0][0]+.002,keep:kp,col})}
// default openings: the ears (a ball round each ear root), the eyes (one row of faces at the eyes' height, three rings long)
function brEarW(D,m){if(D.earE)return brEarIn(D,m.x,m.y,m.z);if(!D.EAR)return false;const r=D.earR||.032,dx=Math.abs(m.x)-D.EAR[0],dy=m.y-(D.EAR[1]-.02),dz=m.z-D.EAR[2];return Math.abs(m.x)>.03&&dx*dx+dy*dy*1.3+dz*dz<r*r}
function brEyeW(D,m){const ez=D.EYEP[2];return m.z>ez-.012&&m.z<ez+.032&&m.s>.12&&m.s<.46&&Math.abs(m.c)>.6}
function brHelm(B,P,d){const D=BR.R,C=BR.C,M=d.M,A=d.A,G=d.G,k=dkKit(),st=d.st,a=d.a,slitC=0x0a0806,S=D.SN,z0=S[0][0]-.005,tipZ=S[S.length-1][0];
  const earW=m=>D.earW?D.earW(m):brEarW(D,m),eyeW=m=>D.eyeW?D.eyeW(m):brEyeW(D,m),at=z=>brSkullAt(D,z),top=z=>at(z).top,ez=D.EYEP[2],ey=D.EYEP[1];
  const mz=D.muzzleZ==null?tipZ-.05:D.muzzleZ,hz=D.hoodZ==null?ez-.02:D.hoodZ,crown=D.crownZ==null?-.05:D.crownZ;
  const earRims=(c,t)=>{if(D.earE)brEarRimK(D,k,c,t||'m');else if(D.earRim)D.earRim(k,c,t||'m')};
  const dome=(off,zf,col,t)=>brShell(B,D,off,z0,zf,m=>m.s>-.25&&!earW(m)&&!(m.z>hz-.005&&m.s<.45),col||M,t,28);
  // closed helm: dome + cheek guards down the sides, a slit at the eyes, a guard over the snout top to the whisker pads
  const closed=(off,col,ac)=>{brShell(B,D,off,z0,mz,m=>{if(earW(m)||eyeW(m))return false;if(m.z>mz-.06)return m.s>.2;if(m.z>hz-.005)return m.s>-.5;return m.s>-.42},
      m=>m.z>mz-.015?(ac||A):col||M,'m',32);
    brShell(B,D,off+.004,mz-.013,mz,m=>m.s>.15,ac||A,'m',14)};
  const nasal=(c)=>{const za=ez-.02,zb=mz-.02;k.L('head','m',c,[0,top(za)+.022,za],[0,top(zb)+.012,zb],.011,.007,5)};
  const band=(z,off,c,t)=>brShell(B,D,off,z-.008,z+.008,m=>m.s>-.25&&!earW(m),c,t||'m');
  const crest=(c,n,h)=>{for(let i=0;i<n;i++){const z=crown-.04+i*(.12/(n-1));k.p('head','box','m',c,0,top(z)+.02+h*.4,z,.012,h*(1-Math.abs(i-(n-1)/2)/n),.04,0)}};
  const horns=(c,sz,up)=>[-1,1].forEach(s=>{const q=at(crown+.02),x=q.rx-.004,y=q.top-.02,z=crown+.02,p1=[s*x,y,z],p2=[s*(x+.06*sz),y+.03*sz,z-.02],p3=[s*(x+.08*sz),y+.09*sz*(up||1),z-.04];k.L('head','m',c,p1,p2,.026*sz,.018*sz,6).L('head','m',mdSh(c,.8),p2,p3,.018*sz,.003,6)});
  const spikes=(c,n,h)=>{for(let i=0;i<n;i++){const ang=i/n*Math.PI*2,z=crown+.015+Math.cos(ang)*.07,q=at(z),x=Math.sin(ang)*q.rx*.85,y=q.yc+q.f*Math.sqrt(Math.max(.15,1-(x/q.rx)**2))+.012;k.p('head','cone4','m',c,x,y+.025*h,z,.014,.05*h*(i==0?1.6:1),.014)}};
  const gemF=(c,sz)=>{const z=crown+.04;k.p('head','oct',G?'g':'m',G||c,0,top(z)+.026,z+.05,.018*(sz||1),.022*(sz||1),.01,-.6)};
  // cloth hood: a big loose shell round the skull (the ears inside their own cloth pockets), a rolled front edge framing
  // the face, a soft peak at the back and a wide drape over the neck and shoulders
  // the face opening sits behind the eyes and cheeks; the underside is open (the drape below covers the neck)
  const hood=(off,col,o)=>{o=o||{};const big=off+.03,zf=Math.min(hz+.012,ez-(D.eyeR||.021)-.016),dk=mdSh(col,.8);
    brShell(B,D,big,z0-.02,zf,m=>!earW(m)&&!(m.s<-.3&&m.z>z0+.03)&&!(m.z>zf-.06&&m.s<-.1),m=>m.z>zf-.014?dk:m.s<-.3?dk:col,'c',18);
    brShell(B,D,big+.008,zf-.014,zf+.004,m=>m.s>-.1,mdSh(col,.9),'c',18);
    if(D.earPocket)D.earPocket(k,col,big);
    mdLoft(B,[{p:[0,1.07,-.04],rx:.12+big,f:.1+big*.6,b:.12+big,w:[['neck',.4],['head',.6]]},{p:[0,.99,-.04],rx:.19+off,f:.14,b:.17+off,w:[['chest',.5],['neck',.5]]},{p:[0,.91,-.03],rx:.25+off,f:.17,b:.21+off,w:[['chest',1]]}],
      {seg:14,t:'c',col:o.drape||mdSh(col,.88),keep:m=>!(m.s>.45&&m.y>.985)});
    if(o.tip!==false){const q=at(z0),zb=z0-.01;k.L('head','c',col,[0,q.top+big-.03,zb+.02],[0,q.top+big-.07,zb-.1],.05,.012,6).L('head','c',dk,[0,q.top+big-.07,zb-.1],[0,q.top+big-.11,zb-.17],.012,.003,5)}};
  // lower-face cloth mask: a thin shell under the eyes from the cheeks to just behind the nose (the nose tip stays out),
  // tied behind the head with a band and two tails
  const muzzle=(c)=>{const za=ez-.004,zb=mz+.008,dk=mdSh(c,.72);
    brShell(B,D,.014,za,zb,m=>(m.z>ez+.03?m.s<.62:m.s<.15)&&!(D.topW&&D.topW(m)),m=>m.z>zb-.016||m.z<za+.012?dk:c,'c',18);
    brShell(B,D,.008,z0+.01,za,m=>m.s<.32&&m.s>-.2&&!earW(m),dk,'c',14);
    const q=at(z0+.012),y=q.yc+.01,z=z0-.004;[-1,1].forEach(s=>k.L('head','c',dk,[s*.02,y,z],[s*.045,y-.11,z-.05],.014,.004,4))};
  const strap=(c,t)=>band(crown+.02,.012,c,t);
  // goggles sized and placed from the animal's own eyes (the lens sits in front of the eye, facing where the eye looks)
  const goggles=(c,glass)=>{const er=D.eyeR||.021,gr=Math.max(.017,er*1.02),V=THREE.Vector3;[-1,1].forEach(s=>{const [x,y,z]=D.EYEP,ry=s*Math.atan2(1,-at(z).slope)*(D.eyeFw==null?1:D.eyeFw),
      d=new V(Math.sin(ry),0,Math.cos(ry)),eye=new V(s*(brSurfX(D,z,y)-.004-(D.eyeIns||0)),y,z),h=.008+er*.3,c0=eye.clone().add(d.clone().multiplyScalar(er*1.05+.003+h*.5)),
      e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new V(0,1,0),d));
      k.p('head','cyl','m',c,c0.x,c0.y,c0.z,gr,h,gr,e.x,e.y,e.z);const c1=c0.clone().add(d.clone().multiplyScalar(h*.5+.001));
      k.p('head','cyl',G?'g':'c',G||glass,c1.x,c1.y,c1.z,gr*.8,.004,gr*.8,e.x,e.y,e.z);
      // a short strap from the lens frame back to the head band
      const b0=c0.clone().add(new V(s*gr*.8,0,-gr*.3)),b1=new V(s*(at(crown).rx+.012),y+.006,crown+.02);k.L('head','c',mdSh(c,.7),b0.toArray(),b1.toArray(),.006,.006,4)});strap(mdSh(c,.7),'c')};
  const frontZ=yb=>{let fz=S[0][0];S.forEach(q=>{if(q[1]+q[3]>yb)fz=q[0]});return fz};
  if(D.helmPre)D.helmPre(k,d);
  if(D.helmSet&&D.helmSet[a]){D.helmSet[a]({B,P,d,k,st,M,A,G,at,top,hood,band,crest,gemF,muzzle,strap,crown,hz,z0,tipZ,frontZ});mdKit(B,k);return}
  if(a=='heavy'){
    if(st=='nasal'){dome(.022,mz-.02);band(crown+.04,.026,A);nasal(A);earRims(A)}
    else if(st=='horned'){dome(.022,mz-.02);band(crown+.04,.026,A);nasal(A);earRims(A);horns(0xd8ccb0,1)}
    else if(st=='great'){closed(.024);earRims(A);crest(A,4,.03)}
    else if(st=='visage'){closed(.024,M,mdSh(M,.75));earRims(A);crest(A,7,.06)}
    else if(st=='winged'){closed(.024);earRims(A);crest(A,5,.05);[-1,1].forEach(s=>{const q=at(crown);for(let j=0;j<3;j++)k.p('head','box','m',j%2?M:A,s*(q.rx+.02+j*.012),q.yc+j*.04,crown-.02-j*.02,.012,.1-j*.018,.06,-.35,0,-s*(.5+j*.25))})}
    else if(st=='barbute'){closed(.024);earRims(0x8a1a1a);horns(0x8a1a1a,.8);const q=at(crown);k.L('head','c',0x8a1a1a,[0,q.top+.03,crown],[0,q.top+.01,crown-.14],.03,.01,5)}
    else if(st=='bucket'){closed(.026);band(crown,.03,A);band(crown+.08,.03,A);earRims(A)}
    else{/*crowned*/closed(.024);band(crown+.03,.03,A);spikes(A,8,1.2);horns(0x2a2420,1.1,1.4);earRims(A);gemF(A)}}
  else if(a=='medium'){
    if(st=='hood')hood(.026,M);
    else if(st=='pelt'){hood(.03,M,{tip:false});const q=at(crown);[-1,1].forEach(s=>k.p('head','cone4','c',mdSh(M,1.1),s*.05,q.top+.07,crown-.02,.03,.07,.022,0,0,-s*.25));k.p('head','box','c',mdSh(M,.85),0,q.top+.04,crown+.03,.06,.03,.07,.3);
      [-1,1].forEach(s=>k.p('head','cone4','c',0xe8e0d0,s*.02,q.top+.025,crown+.06,.007,.026,.007,Math.PI))}
    else if(st=='cowl'){hood(.026,M);muzzle(A)}
    else if(st=='skullhood'){hood(.03,M,{tip:false});const q=at(crown);k.p('head','sph2','c',0xd8ccb0,0,q.top+.03,crown,.07,.045,.08);[-1,1].forEach(s=>{k.p('head','box','c',0x14100c,s*.025,q.top+.025,crown+.07,.018,.012,.01);k.L('head','c',0xd8ccb0,[s*.05,q.top+.05,crown-.02],[s*.11,q.top+.1,crown-.06],.016,.004,5)})}
    else if(st=='galemask'||st=='wind'){muzzle(mdSh(A,.9));strap(mdSh(M,.8),'c');[-1,1].forEach(s=>{const q=at(crown);for(let j=0;j<4;j++)k.p('head','cone4','c',j%2?A:0xe8e8f0,s*(q.rx+.01+j*.008),q.yc+j*.025,crown-.01-j*.025,.012,.1-j*.012,.03,-.5-j*.2,0,-s*(.9+j*.15))});if(st=='wind')hood(.03,M,{tip:false})}
    else if(st=='feather'){brShell(B,D,.018,z0,hz-.03,m=>m.s>.1&&!earW(m),M,'c',14);band(hz-.03,.022,mdSh(M,.75),'c');const q=at(crown);k.L('head','c',A,[.05,q.top+.01,crown],[.12,q.top+.13,crown-.08],.012,.002,4)}
    else{/*deadeye*/hood(.026,M);muzzle(mdSh(M,.6));
      // a monocle ring in front of the right eye, facing where the eye looks
      const V=THREE.Vector3,er=D.eyeR||.021,[x,y,z]=D.EYEP,ry=Math.atan2(1,-at(z).slope)*(D.eyeFw==null?1:D.eyeFw),d=new V(Math.sin(ry),0,Math.cos(ry)),
        c=new V(brSurfX(D,z,y)-.004-(D.eyeIns||0),y,z).add(d.clone().multiplyScalar(er*1.05+.004)),e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new V(0,1,0),d));
      k.p('head','ring','m',A,c.x,c.y,c.z,er*1.25,.5,er*1.25,e.x,e.y,e.z);k.p('head','cyl',G?'g':'c',G||0x3a1a14,c.x,c.y,c.z,er*1.1,.002,er*1.1,e.x,e.y,e.z)}}
  else if(a=='light'){
    if(st=='wrap'||st=='bandana'){muzzle(M);strap(mdSh(M,.8),'c');const q=at(crown);k.L('head','c',mdSh(M,.75),[0,q.top-.02,crown-.06],[.03,q.top-.1,crown-.13],.018,.008,4)}
    else if(st=='viper'){muzzle(M);for(let i=0;i<5;i++){const z=crown-.03+i*.03;k.p('head','cone4','c',A,0,top(z)+.02,z,.014,.045,.018,-.3)}}
    else if(st=='ashcowl'){hood(.02,M,{tip:false});muzzle(mdSh(M,.8))}
    else if(st=='glassmask'){goggles(mdSh(M,.6),0x1a1a2a);muzzle(mdSh(M,.55))}
    else if(st=='stormhood'){hood(.024,M);muzzle(mdSh(M,.6));band(crown+.03,.03,G||A,G?'g':'m')}
    else if(st=='venom'){muzzle(mdSh(M,.7));goggles(mdSh(M,.5),0x2a4a1a)}
    else{/*dusk*/hood(.022,M,{tip:false});muzzle(A);const q=at(crown);k.L('head','c',A,[0,q.top-.08,crown-.07],[.05,.95,crown-.15],.026,.01,4)}}
  else{ // cloth
    if(st=='linen')hood(.032,M);
    else if(st=='hat'||st=='witch'){const br=st=='witch'?.21:.18,c=st=='witch'?mdSh(M,.6):M,zb=D.hatZ==null?crown-.01:D.hatZ,q=at(zb),y0=q.top+.008;
      // the brim sits on the crown between the ears, tilted back; the ears come out under it
      k.p('head','cyl','c',mdSh(c,.85),0,y0,zb,br,.016,br,-.12);k.p('head','cyl','c',A,0,y0+.016,zb-.004,q.rx+.01,.026,q.rx+.01,-.12);
      k.L('head','c',c,[0,y0+.01,zb-.005],[.02,y0+.17,zb-.05],q.rx-.005,.05,8).L('head','c',mdSh(c,.92),[.02,y0+.17,zb-.05],[.08,y0+.27,zb-.13],.05,.022,7).L('head','c',mdSh(c,.82),[.08,y0+.27,zb-.13],[.14,y0+.3,zb-.19],.022,.004,6);
      if(G)k.p('head','oct','g',G,0,y0+.03,zb+q.rx+.01,.016)}
    else if(st=='circlet'||st=='diadem'||st=='crown'){
      // a band round the skull just above the eyes and in front of the ears
      const yb=D.bandY==null?ey+.03:D.bandY,zc=D.bandZ==null?crown+.015:D.bandZ,q=at(zc),fz=frontZ(yb)+.006,rx=q.rx+.008,fr=fz-zc,bk=zc-S[0][0]+.008;
      const R=[0,1].map(i=>({p:[0,yb+i*.016,zc],rx,f:fr,b:bk,w:[['head',1]]}));mdLoft(B,R,{seg:16,t:'m',col:A,keep:m=>!earW(m)});
      if(st=='diadem')for(let i=0;i<5;i++){const ang=(i-2)*.32;k.p('head','cone4','m',A,Math.sin(ang)*rx,yb+.03+(i==2?.025:0),zc+Math.cos(ang)*fr,.012,.045+(i==2?.035:0),.01)}
      if(st=='crown')for(let i=0;i<9;i++){const ang=i/9*Math.PI*2,ca=Math.cos(ang);k.p('head','cone4','m',A,Math.sin(ang)*rx,yb+.045,zc+ca*(ca>0?fr:bk),.014,.05*(i==0?1.5:1),.014)}
      k.p('head','oct',G?'g':'m',G||d.gem,0,yb+.012,zc+fr,.015,.02,.01)}
    else if(st=='tallcowl'){hood(.03,M,{tip:false});const q=at(crown);k.L('head','c',M,[0,q.top+.01,crown-.02],[0,q.top+.18,crown-.09],.07,.004,7);band(hz-.01,.036,A,'c')}
    else{/*star*/hood(.03,M);band(hz-.01,.036,G||A,G?'g':'m');const q=at(crown);for(let i=0;i<5;i++){const ang=(i-2)*.38;k.p('head','oct',G?'g':'m',G||A,Math.sin(ang)*(q.rx+.03),q.top-.01,crown+Math.cos(ang)*.13,.012)}}}
  mdKit(B,k)}
