// =====================================================================================================
function mdChestO(B,P,d,cls){mdDX(d);const k=mdKP(),X={B,P,d,k};
  if(d.a=='heavy')mdChH(X);else if(d.a=='medium')mdChM(X);else if(d.a=='light')mdChL(X);else mdChC(X);
  mdKit(B,k)}
// shared pieces
function mdMail(B,P,M,arms,lo,hem){const mc=mdMix(M,0x6a6c70,.3),md=mdSh(mc,.78),mm=m=>(Math.round(m.y*48)%2?mc:md);
  mdTS(B,P,.43,.99,.012,{col:mm,lip:.012});[-1,1].forEach(s=>mdAS(B,P,s,0,arms,.01,{col:mm}));
  mdSkirt(B,P,.5,lo||.36,.03,.014,{col:m=>m.y<(lo||.36)+.025?(hem||mdSh(M,.6)):mm(m),n:4})}
function mdBeltO(X,y,col,lv,o){o=o||{};const {B,P,d,k}=X,off=(P.tOff||0)+.008,T=d.T;
  mdTS(B,P,y-.024,y+.024,off,{col:m=>Math.abs(m.y-y)>.018?mdSh(col,.75):col,lipT:.003});
  if(d.R)mdTS(B,P,y+.024,y+.032,off+.002,{col:d.R,t:'m'});
  const f=mdTorsoAt(P,y).f+off+.008;mdBuckle(k,'spine',0,y,f,lv>=3?1.15:1,T,mdSh(col,.7),mdTorsoW(y));
  if(lv>=3&&!o.noGem){k.p('spine','oct',d.G?'g':'m',d.G||d.gem,0,y,f+.012,.01);mdOW(k,mdTorsoW(y))}
  const ns=o.studs!=null?o.studs:lv>=1?10:0;for(let i=0;i<ns;i++){const aa=.4+i*(Math.PI*2-.8)/(ns-1);const p=mdTP(P,y,aa,off+.006);k.p('spine','oct','m',T,p[0],p[1],p[2],.007);mdOW(k,mdTorsoW(y))}}
// glow line round the torso at y (Epic+)
function mdGlowBand(X,y,off,keep){const {B,P,d}=X;if(d.G==null)return;mdTS(B,P,y-.006,y+.006,off,{t:'g',col:d.G,keep})}

// ---------------------------------------------- heavy ----------------------------------------------
function mdPaul(X,n,o){o=o||{};const {P,d,k}=X,M=d.M,T=d.T,ps=mdSh(M,1.16),W=mdBuildF(P),sz=(1+(W-1)*.6)*(o.sz||1);
  [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',R=mdArm(P,s),sp=R[1].p;
    for(let i=n-1;i>=0;i--){const r=(.108-i*.011)*sz,x=sp[0]+s*(.008+i*.02),y=.995-i*.048+(o.dy||0),rz=-s*(.18+i*.3);
      if(o.sq){const xs=sp[0]+s*(.02+i*.012),ys=1.0-i*.042,rs=-s*(.12+i*.16);k.p(a,'box','m',i?M:ps,xs,ys,0,r*1.55,.05,r*2.05,0,0,rs);k.p(a,'box','m',T,xs+s*.002,ys-.022,0,r*1.6,.012,r*2.1,0,0,rs);
        if(i==0){for(let j=0;j<3;j++){const q=mdRotZ(s*(-r*.4+j*r*.4),.026,rs);k.p(a,'oct','m',T,xs+q[0],ys+q[1],r*.7,.009)}k.p(a,'box','m',T,xs,ys+.03,0,.014,.016,r*2.0,0,0,rs)}}
      else{k.p(a,'hem','m',i?M:ps,x,y,0,r,r*.7,r*1.08,0,0,rz);k.p(a,'tor','m',i==0||d.lv>=2?T:mdSh(M,.8),x,y-.002,0,r*1.04,.012,r*1.12,0,0,rz);
        if(i==0&&d.lv>=1){for(let j=0;j<5;j++){const th=-.9+j*.45,q=mdRotZ(Math.sin(th)*r*.86*s,.012,rz);k.p(a,'oct','m',T,x+q[0],y+q[1],Math.cos(th)*r*.92,.008)}}
        if(i==0&&d.lv>=3){const q=mdRotZ(0,r*.68,rz);k.p(a,'box','m',T,x+q[0],y+q[1],0,.012,.016,r*2.0,0,0,rz)}}}
    // spikes on the top lame
    const sp0=mdRotZ(0,.108*sz*.7,-s*.18);for(let i=0;i<(o.spk||0);i++){const b=[sp[0]+s*.008+sp0[0]+s*i*.025,.995+sp0[1]-.005,-.03+i*.05];k.L(a,'m',o.spkC||mdSh(T,.95),b,[b[0]+s*.05,b[1]+.11-i*.025,b[2]-.01],.02,.003,5)}
    if(d.G&&(d.GB||o.gem)){const q=mdRotZ(s*.02,.108*sz*.66,-s*.18);k.p(a,'oct','g',d.G,sp[0]+s*.008+q[0],.995+q[1],.06*sz,.014,.018,.01)}})}
function mdArmP(X,o){const {B,P,d,k}=X,M=d.M,T=d.T,ps=mdSh(M,1.14);
  [-1,1].forEach(s=>{const R=mdArm(P,s),a1=s<0?'aL1':'aR1';
    if(o.rere){mdAS(B,P,s,1,3,.02,{t:'m',col:m=>m.i>2.4?mdSh(M,.85):M});mdLB(B,R,1.4,.008,.026,T)}
    if(o.cout){const e=R[3],p=e.p;k.p(a1,'sph','m',ps,p[0],p[1]+.005,p[2]-e.b-.008,.042,.046,.034);mdOW(k,e.w);
      k.p(a1,'box','m',T,p[0]+s*(e.rx+.012),p[1],p[2]-.012,.012,.07,.056,0,0,0);mdOW(k,e.w);
      if(d.lv>=3){k.p(a1,'cone4','m',T,p[0],p[1],p[2]-e.b-.05,.014,.04,.014,-Math.PI/2);mdOW(k,e.w)}}
    if(o.vamb){mdAS(B,P,s,4,5,.02,{t:'m',col:m=>m.s>.6&&d.lv>=2?ps:M});mdLB(B,R,4.05,.008,.028,T);mdLB(B,R,5.25,.012,.03,M,{fl:.012});mdLB(B,R,5.42,.005,.044,T);
      if(d.G){mdLB(B,R,4.6,.004,.026,d.G,{t:'g',keep:m=>m.s>0})}}
    else if(o.bracer){mdAS(B,P,s,4,5,.016,{col:mdSh(0x4a3020,1)});mdLB(B,R,4.1,.006,.02,T);mdLB(B,R,5,.006,.02,T)}})}
function mdFaulds(X,n,y0,y1,o){o=o||{};const {B,P,d}=X,M=d.M,T=d.T,off=(P.tOff||0)+.01;
  for(let i=n-1;i>=0;i--){const t0=i/n,t1=(i+1)/n,tm=t1-.14/n;
    mdSk(B,P,y0,y1,.008,off+.004*(n-i),[t0,tm,t1],{t:'m',e:[0,0,.006],col:m=>m.y<y0+(y1-y0)*tm+.002?(i==n-1||d.lv>=3?T:mdSh(M,.72)):i%2?mdSh(M,.9):M})}}
function mdTassets(X,c,trim){const {B,P,d,k}=X;[-1,1].forEach(s=>{const R=mdLeg(P,s),rr=[mdRAt(R,.7),mdRAt(R,1.5),mdRAt(R,2.4)];
  mdLoft(B,rr,{seg:8,off:.03,t:'m',col:m=>m.i>1.6?trim:c,keep:m=>m.s>-.1});const r=rr[1];k.p(s<0?'lh0':'rh0','oct','m',trim,r.p[0],r.p[1]+.03,r.p[2]+r.f+.036,.01);mdOW(k,r.w)})}
function mdGorget(X,n,col){const {B,P,d}=X,T=d.T;for(let i=0;i<n;i++){const y0=.94+i*.03;mdTS(B,P,y0,y0+.036,.04-i*.004,{t:'m',col:m=>m.y<y0+.008?T:col,lip:.006})}}
// breastplate: keel ridge, fluting (lv4+), engraved band (lv3+), trims at neckline and lower edge, rivets
function mdBreast(X,o){o=o||{};const {B,P,d,k}=X,M=d.M,T=d.T,lv=d.lv,ps=mdSh(M,1.15),pd=mdSh(M,.86),y0=o.y0||.6;
  mdTS(B,P,y0,.985,.03,{t:'m',col:m=>m.y<y0+.03?pd:lv>=4&&m.s>.3&&Math.round(m.x*28)%2?ps:m.s>.55&&m.y>.68&&m.y<.95?ps:M,lip:.012,lipT:.006});
  // trims
  mdTS(B,P,y0-.004,y0+.016,.044,{t:'m',col:T});mdTS(B,P,.955,.985,.038,{t:'m',col:T,lipT:.004});
  if(lv>=3){mdTS(B,P,.885,.9,.036,{t:'m',col:d.R||T});mdGlowBand(X,.8925,.037,m=>m.s>.2)}
  if(d.R&&lv<3)mdTS(B,P,.62,.632,.04,{t:'m',col:d.R});
  // keel ridge (front) and spine ridge (back)
  mdTStrap(B,P,y0+.02,0,.95,0,.034,.016,lv>=2?T:ps,{t:'m',th:.006,n:5});mdTStrap(B,P,y0+.02,Math.PI,.95,Math.PI,.034,.014,pd,{t:'m',th:.006,n:5});
  // rivets along the lower edge
  for(let i=0;i<12;i++){const a=(i+.5)/12*Math.PI*2,p=mdTP(P,y0+.03,a,.044);k.p('spine','oct','m',T,p[0],p[1],p[2],.0075);mdOW(k,mdTorsoW(y0+.03))}
  // back: shoulder-blade plates
  if(lv>=2)[-1,1].forEach(s=>mdTStrap(B,P,.9,Math.PI+s*.5,.74,Math.PI+s*.75,.034,.02,T,{t:'m',th:.004,n:4}))}
function mdTabardO(X,c,tr,o){o=o||{};const {B,P,d,k}=X,off=(P.tOff||0)+.012,lo=o.lo||.32,top=o.top||.95;
  (o.only=='back'?[Math.PI]:[0,Math.PI]).forEach(a=>{const pts=[],pb=[],wf=mdSkW(P,.6),K=o.sk;for(let i=0;i<=8;i++){const y=top-(top-lo)*i/8,q=mdTorsoAt(P,Math.max(y,.6)),fz=y>=.6?(a?-(q.b):q.f):(a?-Math.max(.135,q.b):Math.max(.135,q.f));
      // over a robe: lie on the skirt (K: its y0, y1, flare, offset)
      const sr=K&&y<K.y0?mdSkR(P,K.y0,K.y1,K.fl,Math.min(1,(K.y0-y)/(K.y0-K.y1))):null;
      const z=sr?(a?-(sr.b+K.off+.008):sr.f+K.off+.008):(q.z||0)+fz+(a?-off:off)*(y<.6?1.15:1),w=y>=.6?mdTorsoW(y):wf(0,y);pts.push({p:[0,y,z],n:[0,0,a?-1:1],w,wd:(o.wd||.17)*(y<.6?1.08:1)});pb.push({p:[0,y-(i==8?.022:0),z+(a?.003:-.003)],n:[0,0,a?-1:1],w,wd:((o.wd||.17)+.03)*(y<.6?1.08:1)})}
    mdRib(B,pts,0,.003,m=>o.band&&Math.abs(m.y-(o.band))<.025?tr:c);mdRib(B,pb,0,.003,tr)});
  if(o.sym)o.sym((mdTorsoAt(P,.8).f+off+.008))}
function mdChH(X){const {B,P,d,k}=X,st=d.st,M=d.M,T=d.T,lv=d.lv,G=d.G,A=d.A,dk=d.dk,lt=0x3a2618;
  const C={mail:{mail:1,yoke:1,bracer:1},hauberk:{mail:1,plast:1,paul:1,bracer:1},cuirass:{mail:1,plate:1,paul:2,fauld:2,tas:1,cout:1,vamb:1},
    warplate:{plate:1,paul:3,fauld:3,tas:1,cout:1,vamb:1,rere:1,gor:2,spk:1},aegis:{plate:1,paul:3,fauld:3,tas:1,cout:1,vamb:1,rere:1,gor:2,wing:1,tab:1},
    blood:{mail:1,plate:1,paul:2,spk:2,tab:1,cout:1,vamb:1,gor:1},wall:{plate:1,paul:3,sq:1,fauld:3,tas:1,cout:1,vamb:1,rere:1,gor:3},
    warlord:{plate:1,paul:3,spk:3,fauld:2,tas:1,cout:1,vamb:1,rere:1,fur:1}}[st]||{mail:1};
  // under layer
  if(C.mail)mdMail(B,P,M,3,.36,lv>=1?T:lt);else{mdTS(B,P,.5,.99,.008,{col:mdSh(M,.5)});[-1,1].forEach(s=>mdAS(B,P,s,0,3,.008,{col:dk}));mdMail(B,P,mdSh(M,.8),0,.42,mdSh(M,.55))}
  if(C.plast){mdTS(B,P,.62,.97,.024,{col:m=>m.s>.2?lt:mdSh(lt,.85),lip:.006});mdTS(B,P,.955,.975,.03,{col:mdSh(lt,1.3)});
    for(let r=0;r<3;r++)for(let c=0;c<4;c++){const y=.7+r*.08,p=mdTP(P,y,-.45+c*.3,.03);k.p('chest','oct','m',T,p[0],p[1],p[2],.008);mdOW(k,mdTorsoW(y))}
    for(let c=0;c<4;c++){const y=.78,p=mdTP(P,y,Math.PI-.45+c*.3,.03);k.p('chest','oct','m',T,p[0],p[1],p[2],.008);mdOW(k,mdTorsoW(y))}}
  if(C.yoke){[-1,1].forEach(s=>{mdTStrap(B,P,.62,s*.3,.97,s*.62,(P.tOff||0)+.006,.035,lt,{n:6});mdTStrap(B,P,.97,s*.62,.62,Math.PI-s*.3,(P.tOff||0)+.006,.035,lt,{n:6});
      const p=mdTP(P,.86,s*.4,(P.tOff||0)+.012);k.p('chest','box','m',T,p[0],p[1],p[2],.022,.022,.008,0,s*.4,0)});
    mdTS(B,P,.965,.99,(P.tOff||0)+.01,{col:mdSh(lt,1.25)})}
  if(C.plate)mdBreast(X);
  if(C.gor)mdGorget(X,C.gor,mdSh(M,1.08));
  mdArmP(X,{rere:C.rere,cout:C.cout,vamb:C.vamb,bracer:C.bracer});
  if(C.fur){const fc=0x4a3a2c;mdTS(B,P,.9,1.0,(P.tOff||0)+.03,{col:m=>Math.round(m.c*6+m.s*3)%2?fc:mdSh(fc,.8),lip:.034,lipT:.02});
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2;if(Math.cos(a)>.75)continue;const p=mdTP(P,.93,a,(P.tOff||0)+.05);k.p('chest','cone4','c',i%2?fc:mdSh(fc,1.25),p[0],p[1]-.02,p[2],.03,.07,.02,Math.cos(a)*.5,a,Math.sin(a)*-.5)}}
  if(C.paul)mdPaul(X,C.paul,{sq:C.sq,spk:C.spk,sz:C.sq?1.08:1,gem:lv>=3,spkC:st=='warlord'?0xd8ccb0:null});
  if(C.wing)[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',x=mdArm(P,s)[1].p[0]-s*.03;k.p(a,'box','m',M,x,1.05,-.02,.014,.12,.11,0,0,s*.35);k.p(a,'box','m',T,x+s*.004,1.1,-.02,.016,.022,.114,0,0,s*.35)});
  // belt, faulds, tassets
  mdBeltO(X,.6,st=='warlord'?0x2a1e18:lt,lv,{studs:lv>=1?10:0});
  if(C.fauld)mdFaulds(X,C.fauld,.585,.585-.045*C.fauld);
  if(C.tas)mdTassets(X,M,T);
  // tabards
  if(C.tab){P.noCape=1;if(st=='blood')mdTabardO(X,0x6a0c14,0x2a0608,{lo:.3,wd:.15,band:.4});else if(!P.noTabard)mdTabardO(X,mdSh(A,.6),T,{lo:.32,wd:.16,top:.6})}
  // emblems
  const f=mdTorsoAt(P,.8).f+(P.tOff||0)+.004,ew=mdTorsoW(.8),E=(g,t,c,x,y,z,a,b,cc,r1,r2,r3)=>{k.p('chest',g,t,c,x,y,z,a,b,cc,r1,r2,r3);mdOW(k,ew)};
  if(st=='blood'){const z=mdTorsoAt(P,.8).f+(P.tOff||0)+.016;E('oct','m',T,0,.8,z,.05,.07,.008);E('sph',G?'g':'c',G||0xa01020,0,.785,z+.008,.026,.028,.012);E('cone4',G?'g':'c',G||0xa01020,0,.825,z+.008,.02,.05,.01)}
  else if(st=='wall'){E('box','m',T,0,.79,f,.075,.1,.01);E('box','m',mdSh(M,.9),0,.79,f+.006,.06,.085,.01);E('box','m',T,0,.785,f+.012,.034,.06,.008);
    for(let i=0;i<3;i++)E('box','m',T,-.014+i*.014,.822,f+.012,.009,.014,.008);E('box','c',0x14100c,0,.768,f+.016,.012,.02,.004)}
  else if(st=='warlord'){const z=f+.006;E('sph','c',0xd8ccb0,0,.8,z,.04,.042,.016);E('box','c',0xd8ccb0,0,.765,z,.026,.02,.012);[-1,1].forEach(s=>E('box',G?'g':'c',G||0x14100c,s*.015,.802,z+.014,.012,.012,.006));
    E('box','c',0x14100c,0,.763,z+.012,.016,.004,.004);E('box','m',T,0,.838,z-.004,.05,.012,.012);for(let i=0;i<3;i++)E('cone4','m',T,-.02+i*.02,.855,z-.004,.008,.024,.006)}
  else if(st=='aegis'){const z=mdTorsoAt(P,.82).f+(P.tOff||0)+.004;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('chest','box','m',T,Math.sin(a)*.04,.82+Math.cos(a)*.04,z,.01,.05,.006,0,0,-a);mdOW(k,mdTorsoW(.82))}
    E('oct',G?'g':'m',G||d.gem,0,.82,z+.008,.022,.028,.012)}
  else if(st=='warplate'){[-1,1].forEach(s=>E('box','m',T,s*.03,.83,f,.016,.07,.008,0,0,s*.7));E('oct',G?'g':'m',G||d.gem,0,.8,f+.006,.016,.02,.01)}
  else if(st=='cuirass'){E('oct','m',T,0,.82,f,.03,.036,.012);E('oct',G?'g':'m',G||mdSh(M,1.3),0,.82,f+.006,.014,.018,.008)}
  else if(G){E('oct','g',G,0,.86,mdTorsoAt(P,.86).f+(P.tOff||0)+.012,.02,.026,.01)}
  if(d.GB&&C.plate)[-1,1].forEach(s=>{const p=mdTP(P,.72,s*.5,.036);k.p('spine','oct','g',G,p[0],p[1],p[2],.012);mdOW(k,mdTorsoW(.72))})}

// ---------------------------------------------- medium ----------------------------------------------
function mdStitch(X,pts,col,every){const {k}=X;every=every||1;for(let i=0;i<pts.length-1;i+=every){const a=pts[i].p,b=pts[i+1].p,m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],n=pts[i].n;
  k.p('chest','box','c',col,m[0]+n[0]*.004,m[1],m[2]+n[2]*.004,.005,.016,.005,0,Math.atan2(n[0],n[2]),0);mdOW(k,pts[i].w)}}
function mdFur(X,y0,y1,fc,tufts){const {B,P,k}=X;mdTS(B,P,y0,y1,(P.tOff||0)+.03,{col:m=>Math.round(m.c*6+m.s*3)%2?fc:mdSh(fc,.82),lip:.03,lipT:.018});
  for(let i=0;i<(tufts||0);i++){const a=i/tufts*Math.PI*2;if(Math.cos(a)>.7)continue;const p=mdTP(P,y0+.02,a,(P.tOff||0)+.045);k.p('chest','cone4','c',i%2?fc:mdSh(fc,1.2),p[0],p[1]-.015,p[2],.026,.06,.018,Math.cos(a)*.5,a,0);mdOW(k,mdTorsoW(y0))}}
function mdShoulderPad(X,col,trim,o){o=o||{};const {P,k}=X;(o.side?[o.side]:[-1,1]).forEach(s=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p,r=.1*(o.sz||1);
  k.p(a,'hem',o.t||'c',col,sp[0]+s*.008,.99,0,r,r*.55,r*1.05,0,0,-s*.22);k.p(a,'tor',o.t||'c',trim,sp[0]+s*.008,.988,0,r*1.04,.01,r*1.1,0,0,-s*.22);
  if(o.lames)for(let i=1;i<=o.lames;i++){const rr=r*(1-i*.1);k.p(a,'hem',o.t||'c',mdSh(col,.88),sp[0]+s*(.012+i*.018),.99-i*.04,0,rr,rr*.55,rr*1.05,0,0,-s*(.22+i*.3));k.p(a,'tor',o.t||'c',trim,sp[0]+s*(.012+i*.018),.988-i*.04,0,rr*1.04,.01,rr*1.1,0,0,-s*(.22+i*.3))}})}
function mdChM(X){const {B,P,d,k}=X,st=d.st,M=d.M,T=d.T,lv=d.lv,G=d.G,A=d.A,lt=0x3a2618,sh=mdSh(M,.7),stc=mdMix(M,0xe8dcc0,.45),off=()=>(P.tOff||0);
  const vest=(lo)=>{mdTS(B,P,lo||.55,.985,off()+.014,{col:m=>m.s>.8&&m.y<.95?mdSh(M,.72):m.y<(lo||.55)+.025?mdSh(M,.8):M,lip:.008});
    [-1,1].forEach(s=>mdStitch(X,mdTStrap(B,P,(lo||.55)+.03,s*.26,.95,s*.3,off()+.004,.012,mdSh(M,.82),{n:6}),stc))};
  const shirt=(c,lo)=>mdTS(B,P,lo||.5,.99,.008,{col:c});const sleeves=(c,to,o)=>[-1,1].forEach(s=>mdAS(B,P,s,0,to,o||.008,{col:c}));
  const coat=(c,y1,fl)=>{mdSkirt(B,P,.56,y1,fl,off()+.012,{col:m=>m.y<y1+.03?mdSh(c,.72):c,keep:m=>!(m.s>.86),n:5});
    mdSk(B,P,.56,y1,fl,off()+.016,[.9,1],{col:T,keep:m=>!(m.s>.86)})};
  const cross=(c,w)=>{const p1=mdTLoop(B,P,.78,.2,Math.PI/2,off()+.008,w||.038,c),p2=mdTLoop(B,P,.78,.2,-Math.PI/2,off()+.012,w||.038,c);
    [[.86,.6],[.86,-.6]].forEach(([y,a])=>mdBuckle(k,'chest',...mdTP(P,y,a,Math.min(off(),.03)+.016),1,T,c,mdTorsoW(y),a))};
  const bracer=()=>[-1,1].forEach(s=>{const R=mdArm(P,s);mdAS(B,P,s,4,5,.018,{col:lt});mdLB(B,R,4.05,.006,.024,mdSh(lt,1.3),{t:'c'});mdLB(B,R,5,.006,.024,mdSh(lt,1.3),{t:'c'});
    const a1=s<0?'aL1':'aR1';for(let i=0;i<3;i++){const r=mdRAt(R,4.2+i*.25);k.p(a1,'box','c',stc,r.p[0],r.p[1],r.p[2]+r.f+.02,.03,.005,.006);mdOW(k,r.w)}
    if(lv>=2){const r=mdRAt(R,4.6);k.p(a1,'oct','m',T,r.p[0]+s*(r.rx+.02),r.p[1],r.p[2],.01);mdOW(k,r.w)}});
  const pouches=(n)=>{for(let i=0;i<n;i++)mdPouch(k,P,[-.95,.95,-1.6,1.6][i],.555,mdSh(lt,1.25),T,i>1?.85:1)};
  if(st=='padded'){mdTS(B,P,.48,.99,.012,{col:m=>Math.round(m.y*30)%2?M:mdSh(M,.85),lip:.01});sleeves(mdSh(M,.9),3,.01);
    for(let i=0;i<4;i++){const y=.68+i*.07;[-1,1].forEach(s=>{const p=mdTP(P,y,s*.12,.016),q=mdTP(P,y+.035,-s*.12,.016);k.L('chest','c',0x2a1a10,p,q,.004,.004,3);mdOW(k,mdTorsoW(y))})}
    mdTS(B,P,.955,.985,.018,{col:mdSh(M,.75)});[-1,1].forEach(s=>mdStitch(X,mdTStrap(B,P,.52,s*1.5,.95,s*1.5,.014,.008,mdSh(M,.8),{n:6}),stc));
    bracer();mdBeltO(X,.6,lt,lv,{studs:0});pouches(1)}
  else if(st=='brigandine'){shirt(sh);sleeves(sh,3);vest();
    for(let r=0;r<4;r++)for(let c=0;c<5;c++){const y=.66+r*.075,a=-.5+c*.25,p=mdTP(P,y,a,off()+.004);k.p('chest','oct','m',T,p[0],p[1],p[2],.009);mdOW(k,mdTorsoW(y))}
    for(let r=0;r<3;r++)for(let c=0;c<4;c++){const y=.68+r*.09,a=Math.PI-.45+c*.3,p=mdTP(P,y,a,off()+.004);k.p('chest','oct','m',T,p[0],p[1],p[2],.009);mdOW(k,mdTorsoW(y))}
    mdShoulderPad(X,mdSh(M,.9),T,{});bracer();mdBeltO(X,.6,lt,lv);pouches(2)}
  else if(st=='vest'){shirt(sh);sleeves(sh,3);vest(.5);mdFur(X,.9,.99,0x5a4030,10);cross(lt,.032);mdShoulderPad(X,mdSh(M,1.1),T,{side:-1,lames:1,t:'m'});bracer();mdBeltO(X,.6,lt,lv);pouches(3);mdKnife(k,P,1.25,.54,lt,T,.3)}
  else if(st=='longcoat'){shirt(sh);sleeves(M,5,.012);vest(.56);coat(M,.3,.06);mdBeltO(X,.6,lt,lv);
    // bone toggles, bone shoulder piece with teeth, fur-trimmed collar
    for(let i=0;i<4;i++){const y=.68+i*.07;[-1,1].forEach(s=>{const p=mdTP(P,y,s*.2,off()+.006);k.p('chest','box','c',0xe0d6bc,p[0],p[1],p[2],.026,.01,.01,0,0,s*.2);mdOW(k,mdTorsoW(y))})}
    mdShoulderPad(X,0xd8ccb0,0x8a7a5a,{side:-1,lames:1});const sp=mdArm(P,-1)[1].p;for(let i=0;i<4;i++)k.p('aL0','cone4','c',0xece4cc,sp[0]-.02-i*.02,.95-i*.012,.07-i*.045,.01,.035,.01,Math.PI);
    mdFur(X,.92,1.0,0x6a5a48,0);[-1,1].forEach(s=>{const R=mdArm(P,s);mdLB(B,R,4.6,.02,.022,mdSh(M,.8),{t:'c',fl:.01});mdLB(B,R,4.95,.006,.034,T,{t:'c'})});pouches(2)}
  else if(st=='mantle'){shirt(sh);sleeves(M,5,.012);vest(.56);coat(M,.36,.04);mdBeltO(X,.6,lt,lv);
    // feathered mantle round the shoulders
    const fa=mdSh(mdMix(A,M,.6),.85),fb=mdMix(mdSh(A,.7),0xc8ccd0,.3);mdTS(B,P,.86,.99,off()+.024,{col:m=>Math.round(m.c*7)%2?fa:mdSh(fa,.8),lip:.05});
    for(let r=0;r<2;r++)for(let i=0;i<16;i++){const a=(i+r*.5)/16*Math.PI*2;if(Math.cos(a)>.6)continue;const p=mdTP(P,.89-r*.05,a,off()+.03+r*.006);k.p('chest','cone4','c',(i+r)%2?fa:fb,p[0],p[1]-.03,p[2],.022,.08,.008,Math.cos(a)*.3,a,0,0);mdOW(k,mdTorsoW(.89))}
    const f=mdTorsoAt(P,.95).f+off()+.01;k.p('chest','oct','m',T,0,.95,f,.024,.02,.01);k.p('chest','oct',G?'g':'m',G||d.gem,0,.95,f+.006,.012);
    [-1,1].forEach(s=>{const R=mdArm(P,s);mdLB(B,R,4.9,.006,.03,T,{t:'m'})});bracer();pouches(2)}
  else if(st=='path'){shirt(mdSh(M,.75));sleeves(mdSh(M,.75),3);vest();mdBeltO(X,.6,lt,lv);
    // tan scarf collar, leaf shoulder guards, compass on the chest strap, bedroll on the back
    mdTS(B,P,.94,1.0,off()+.02,{col:A,lipT:.012,lip:.012});mdTLoop(B,P,.78,.2,Math.PI/2,off()+.01,.034,lt);
    [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;for(let i=0;i<3;i++)k.p(a,'oct','c',i%2?mdSh(M,1.25):mdMix(M,0x6a8a3a,.4),sp[0]+s*(.02+i*.022),.99-i*.03,-.02+i*.02,.05,.012,.03,0,s*.3,-s*(.4+i*.25))});
    const cp=mdTP(P,.86,.6,off()+.024);k.p('chest','cyl','m',T,cp[0],cp[1],cp[2],.026,.008,.026,Math.PI/2,.6,0);k.p('chest','box','c',0x8a1a1a,cp[0],cp[1],cp[2]+.005,.006,.034,.003,Math.PI/2*0,.6,.5);k.p('chest','box','c',0xe8e0d0,cp[0],cp[1],cp[2]+.004,.034,.005,.003,0,.6,.5);
    const z=-(mdTorsoAt(P,.62).b+off()+.04);k.L('spine','c',0x6a5a3a,[-.15,.63,z],[.15,.63,z],.04,.04,7);[-.09,.09].forEach(x=>k.p('spine','tor','c',lt,x,.63,z,.044,.012,.044,0,0,Math.PI/2));
    bracer();pouches(3)}
  else if(st=='bandolier'){shirt(mdSh(M,.75));sleeves(mdSh(M,.75),3);vest();mdBeltO(X,.6,lt,lv);
    const p1=mdTLoop(B,P,.78,.2,Math.PI/2,off()+.01,.04,lt),p2=mdTLoop(B,P,.78,.2,-Math.PI/2,off()+.014,.04,lt);
    // cartridge pouches along the straps, target emblem, feathers at the shoulder
    [[p1,[1,2,3]],[p2,[17,18,19]]].forEach(([pp,ii])=>ii.forEach(i=>{const q=pp[i];k.p('chest','box','c',mdSh(lt,1.3),q.p[0]+q.n[0]*.012,q.p[1],q.p[2]+q.n[2]*.012,.022,.026,.014,0,Math.atan2(q.n[0],q.n[2]),0);mdOW(k,q.w)}));
    const f=mdTorsoAt(P,.7).f+off()+.012;[[.034,A],[.024,0xe8e0d0],[.014,A]].forEach(([r,c],i)=>{k.p('spine','cyl','c',c,0,.7,f+i*.003,r,.004,r,Math.PI/2);mdOW(k,mdTorsoW(.7))});
    for(let i=0;i<3;i++)k.p('aR0','cone4','c',i==1?0xe8e0d0:A,mdArm(P,1)[1].p[0]+.04,1.0+i*.01,-.04+i*.03,.012,.08,.004,-.3,0,-.6-i*.15);
    mdShoulderPad(X,mdSh(M,.85),T,{side:1});bracer();pouches(2)}
  else{/*tails: Windrunner*/shirt(sh);sleeves(M,5,.012);vest(.56);coat(M,.22,.08);mdBeltO(X,.6,lt,lv);
    mdSk(B,P,.56,.22,.08,off()+.02,[.0,.04],{col:A});
    // feather trims at the shoulders (wing fans), silver collar, crossed strap
    [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;for(let i=0;i<5;i++)k.p(a,'cone4','c',i%2?A:mdMix(A,M,.5),sp[0]+s*(.03+i*.012),1.0+i*.006,-.06+i*.02,.014,.13-i*.012,.005,-.3+i*.12,0,-s*(.9+i*.18))});
    mdTS(B,P,.95,1.02,off()+.02,{col:A,lipT:.01});mdTLoop(B,P,.78,.2,Math.PI/2,off()+.01,.03,mdSh(M,.6));
    const f=mdTorsoAt(P,.86).f+off()+.016;for(let i=0;i<3;i++)k.p('chest','cone4',G?'g':'c',G||A,-.02+i*.02,.86,f,.008,.04,.004,0,0,(i-1)*.5);
    [-1,1].forEach(s=>{const R=mdArm(P,s);mdLB(B,R,4.9,.006,.03,A,{t:'m'})});bracer();pouches(1)}
  // stitched hem on every medium chest, rarity trim
  if(d.R)mdTS(B,P,.965,.985,off()+.006,{col:d.R,t:'m'});
  if(G){mdGlowBand(X,.62,off()+.012,m=>m.s>0);if(d.GB)[-1,1].forEach(s=>{const p=mdTP(P,.9,s*.35,off()+.012);k.p('chest','oct','g',G,p[0],p[1],p[2],.012);mdOW(k,mdTorsoW(.9))})}}

// ---------------------------------------------- light ----------------------------------------------
function mdChL(X){const {B,P,d,k}=X,st=d.st,M=d.M,T=d.T,lv=d.lv,G=d.G,A=d.A,dm=0x2a2c32,off=()=>(P.tOff||0),lt=0x2a1e18;
  const shirt=c=>mdTS(B,P,.5,.99,.008,{col:c}),sleeves=(c,to)=>[-1,1].forEach(s=>mdAS(B,P,s,0,to,.008,{col:c}));
  const wraps=(c,c2)=>[-1,1].forEach(s=>{mdAS(B,P,s,3.6|0,5,.012,{col:m=>Math.round(m.y*34)%2?c:c2});const R=mdArm(P,s);mdLB(B,R,4.98,.006,.02,T)});
  const sash=(c,tails)=>{mdTS(B,P,.57,.63,off()+.01,{col:m=>Math.abs(m.y-.6)<.012?mdSh(c,1.2):c});if(tails){const p=mdTP(P,.6,-1.1,off()+.02);
    [0,1].forEach(j=>mdRib(B,[{p:[p[0],.6,p[2]],n:[-.9,0,.4],w:[['pelvis',1]]},{p:[p[0]-.01,.48,p[2]+.01],n:[-.9,0,.4],w:[['pelvis',.6],['lh0',.4]]},{p:[p[0]-.02+j*.03,.36,p[2]+j*.02],n:[-.9,0,.4],w:[['pelvis',.3],['lh0',.7]]}],.04,.004,c,{capB:true}));
    k.p('pelvis','sph','c',mdSh(c,.85),p[0],.6,p[2]+.01,.026,.024,.02)}};
  const guard=(side,c,n)=>{const s=side,a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;for(let i=0;i<(n||2);i++){k.p(a,'box','m',i?c:mdSh(c,1.2),sp[0]+s*(.01+i*.02),.99-i*.045,0,.1-i*.012,.016,.11,0,0,-s*(.35+i*.3));k.p(a,'box','m',T,sp[0]+s*(.012+i*.02),.985-i*.045,0,.104-i*.012,.006,.114,0,0,-s*(.35+i*.3))}};
  const blades=(n)=>{for(let i=0;i<n;i++)mdKnife(k,P,[1.2,-1.2,1.6][i],.54,lt,mdSh(T,.9),[.35,-.35,.2][i])};
  if(st=='wraps'){mdTS(B,P,.5,.99,.01,{col:m=>Math.round(m.y*26+m.c*2)%2?M:mdSh(M,.8)});wraps(M,mdSh(M,.75));
    mdTLoop(B,P,.76,.18,Math.PI/2,off()+.006,.03,mdSh(M,.65));sash(mdSh(M,.6),1);mdTS(B,P,.955,.99,off()+.012,{col:mdSh(M,.7)})}
  else if(st=='scale'){mdTS(B,P,.5,.99,.012,{col:m=>(Math.round(m.y*36)+Math.round((m.c+1)*5))%2?M:mdSh(M,.78)});sleeves(mdSh(M,.6),2);wraps(mdSh(M,.6),mdSh(M,.45));
    mdTS(B,P,.94,1.0,off()+.016,{col:A,lipT:.01});guard(1,mdSh(M,1.1),2);mdBeltO(X,.6,lt,lv,{studs:6});blades(1);
    // serpent fangs at the collar
    [-1,1].forEach(s=>{const p=mdTP(P,.93,s*.25,off()+.02);k.p('chest','cone4','c',0xe8e0d0,p[0],p[1]-.02,p[2],.008,.03,.008,Math.PI);mdOW(k,mdTorsoW(.93))})}
  else if(st=='garb'){shirt(M);sleeves(M,5);wraps(mdSh(M,.8),mdSh(M,.6));
    mdTLoop(B,P,.78,.2,Math.PI/2,off()+.008,.03,mdSh(M,.6));mdTLoop(B,P,.78,.2,-Math.PI/2,off()+.012,.03,mdSh(M,.6));
    for(let i=0;i<3;i++){const p=mdTP(P,.84-i*.06,.38-i*.12,off()+.024);k.p('chest','box','m',0xb8bec8,p[0],p[1],p[2],.008,.05,.004,0,0,-.6);mdOW(k,mdTorsoW(.84-i*.06))}
    mdSkirt(B,P,.6,.42,.02,off()+.012,{col:m=>m.y<.445?T:mdSh(M,.75),keep:m=>Math.abs(m.c)<.5,n:3});guard(-1,dm,2);sash(A,0);blades(2)}
  else if(st=='shroud'){shirt(M);sleeves(M,5);mdBeltO(X,.6,mdSh(M,.6),lv,{studs:6});mdSkirt(B,P,.56,.3,.05,off()+.012,{col:m=>m.y<.33?mdSh(M,.6):mdSh(M,.85),keep:m=>!(m.s>.86),n:5});
    mdSk(B,P,.56,.3,.05,off()+.016,[.9,1],{col:A,keep:m=>!(m.s>.86)});mdTS(B,P,.93,1.04,off()+.02,{col:mdSh(M,.7),lipT:.02});
    // nightglass shards on the right shoulder
    const sp=mdArm(P,1)[1].p;guard(1,mdSh(M,.9),2);for(let i=0;i<4;i++)k.p('aR0','cone4',G?'g':'m',G||A,sp[0]+.02+i*.015,1.02+i*.01,-.04+i*.03,.014,.07-i*.008,.01,0,0,-.4-i*.2);
    wraps(mdSh(M,.8),mdSh(M,.6));blades(1)}
  else if(st=='raiment'){shirt(M);sleeves(M,5);mdBeltO(X,.6,A,lv);mdSkirt(B,P,.56,.26,.07,off()+.012,{col:m=>m.y<.29?mdSh(M,.6):mdSh(M,.85),keep:m=>!(m.s>.86),n:5});
    mdSk(B,P,.56,.26,.07,off()+.016,[.92,1],{col:T,keep:m=>!(m.s>.86)});mdTS(B,P,.94,1.06,off()+.03,{col:m=>m.s<0?mdSh(M,.6):A,lipT:.04,keep:m=>m.s<.55});
    mdTLoop(B,P,.78,.2,Math.PI/2,off()+.008,.026,dm);mdTLoop(B,P,.74,.2,Math.PI/2,off()+.012,.02,dm);guard(-1,dm,3);guard(1,dm,1);wraps(mdSh(M,.8),A);blades(2);
    if(G)[-1,1].forEach(s=>{const p=mdTP(P,.82,s*.3,off()+.02);k.p('chest','box','g',G,p[0],p[1],p[2],.006,.08,.004,0,0,s*.5);mdOW(k,mdTorsoW(.82))})}
  else if(st=='cutthroat'){shirt(mdSh(M,1.15));sleeves(mdSh(M,1.15),5);mdTS(B,P,.55,.985,off()+.014,{col:m=>m.s>.75&&m.y<.95?mdSh(M,.7):M,lip:.006});
    // oxblood sash, dagger clasps on crossed straps, knives on the belt
    mdTLoop(B,P,.76,.2,Math.PI/2,off()+.008,.036,lt);mdTLoop(B,P,.76,.2,-Math.PI/2,off()+.012,.036,lt);sash(A,1);
    for(let i=0;i<4;i++){const y=.7+i*.06,a=-.45+i*.3*(1)*.0+(-.42+i*.04),p=mdTP(P,.66+i*.07,.36-i*.24,off()+.03);k.p('chest','box','m',0xb8bec8,p[0],p[1]-.012,p[2],.012,.05,.004,0,0,-.6);k.p('chest','box','m',T,p[0]+.014,p[1]+.012,p[2],.026,.006,.006,0,0,-.6);mdOW(k,mdTorsoW(p[1]))}
    guard(1,dm,2);wraps(mdSh(M,.8),A);blades(3)}
  else if(st=='venom'){shirt(M);sleeves(M,5);mdTS(B,P,.55,.985,off()+.014,{col:m=>m.s>.75&&m.y<.95?mdSh(M,.7):mdSh(M,1.1),lip:.006});mdBeltO(X,.6,lt,lv);
    // bandolier of vials, a serpent coiled down the front
    const pp=mdTLoop(B,P,.78,.2,Math.PI/2,off()+.01,.034,lt);[1,2,3,4].forEach(i=>{const q=pp[i];k.p('chest','cyl','g',G||A,q.p[0]+q.n[0]*.016,q.p[1],q.p[2]+q.n[2]*.016,.011,.036,.011);mdOW(k,q.w);k.p('chest','cyl','m',T,q.p[0]+q.n[0]*.016,q.p[1]+.022,q.p[2]+q.n[2]*.016,.008,.01,.008);mdOW(k,q.w)});
    for(let i=0;i<8;i++){const y=.92-i*.04,a=-.12+Math.sin(i*1.2)*.16,p=mdTP(P,y,a,off()+.02);k.p('chest','oct','c',i%2?A:mdSh(A,.7),p[0],p[1],p[2],.018-i*.001,.024,.012);mdOW(k,mdTorsoW(y))}
    const hp=mdTP(P,.94,-.12,off()+.026);k.p('chest','oct','c',A,hp[0],hp[1]+.01,hp[2],.024,.018,.014);[-1,1].forEach(s=>k.p('chest','box',G?'g':'c',G||0xd0e040,hp[0]+s*.01,hp[1]+.014,hp[2]+.012,.006,.004,.004));
    guard(-1,dm,2);wraps(mdSh(M,.8),mdSh(A,.6));blades(1)}
  else{/*scarf: Duskdancer*/shirt(M);sleeves(M,5);mdTS(B,P,.55,.985,off()+.014,{col:m=>m.s>.75&&m.y<.95?mdSh(M,.7):mdSh(M,1.1),lip:.006});
    mdBeltO(X,.6,A,lv,{studs:0});
    // scarf with trailing ribbons, crescent moons, silver accents
    mdTS(B,P,.92,1.04,off()+.03,{col:A,lip:.01,lipT:.01});
    [[.08,.98,-.14],[-.04,.97,-.15]].forEach((s0,j)=>mdRib(B,[{p:s0,n:[0,0,-1],w:[['chest',1]]},{p:[s0[0]+.02,.78,-.18-j*.01],n:[0,0,-1],w:[['chest',.4],['cp1',.6]]},{p:[s0[0]+.04,.56,-.2],n:[0,0,-1],w:[['cp1',.5],['cp2',.5]]},{p:[s0[0]+.06,.4-j*.06,-.22],n:[0,0,-1],w:[['cp2',1]]}],.05-j*.012,.004,j?mdSh(A,.65):A,{capB:true}));
    const moon=(x,y,z,r,bn,w)=>{for(let i=0;i<5;i++){const a=-1.1+i*.55;k.p(bn,'box','m',T,x+Math.cos(a)*r,y+Math.sin(a)*r,z,.008,r*.7,.004,0,0,a);if(w)mdOW(k,w)}};
    const f=mdTorsoAt(P,.8).f+off()+.006;moon(-.01,.8,f,.03,'chest',mdTorsoW(.8));moon(-.01,.6,mdTorsoAt(P,.6).f+off()+.03,.022,'spine',mdTorsoW(.6));
    [-1,1].forEach(s=>{const R=mdArm(P,s);mdLB(B,R,4.1,.006,.02,T);mdLB(B,R,4.95,.006,.02,T);mdLB(B,R,4.5,.012,.016,A,{t:'c'})});guard(1,mdSh(M,.8),2);blades(2)}
  if(d.R)mdTS(B,P,.965,.985,off()+.008,{col:d.R,t:'m'});
  if(G&&d.GB){[-1,1].forEach(s=>{const p=mdTP(P,.66,s*.4,off()+.02);k.p('spine','oct','g',G,p[0],p[1],p[2],.012);mdOW(k,mdTorsoW(.66))})}}

// ---------------------------------------------- cloth ----------------------------------------------
function mdChC(X){const {B,P,d,k}=X,st=d.st,M=d.M,T=d.T,lv=d.lv,G=d.G,A=d.A,rb=M,rd=mdSh(M,.78),tr=A,off=()=>(P.tOff||0);
  const long=st=='regalia'||st=='vestments'||st=='star'?.06:st=='robe'||st=='witch'?.1:.08;
  mdTS(B,P,.5,.99,.008,{col:rb});
  // sleeves widening to cuffs with an embroidered cuff band
  [-1,1].forEach(s=>{mdAS(B,P,s,0,3,.01,{col:rb});mdLoft(B,mdArm(P,s).slice(3,6).map((r,i)=>Object.assign({},r,{rx:r.rx+i*.018,f:r.f+i*.02,b:r.b+i*.018})),{seg:8,off:.012,col:m=>m.i>1.5?tr:rd});
    const R=mdArm(P,s).slice(3,6).map((r,i)=>Object.assign({},r,{rx:r.rx+i*.018,f:r.f+i*.02,b:r.b+i*.018}));mdLB(B,R,1.72,.006,.018,lv>=2?T:mdSh(tr,1.2),{t:lv>=2?'m':'c'});if(lv>=1)mdLB(B,R,1.2,.004,.014,tr,{t:'c'})});
  // robe skirt + layered hem with embroidered border
  const emb=(m,base,c2)=>(Math.floor((Math.atan2(m.x,m.z)+Math.PI)/(Math.PI*2)*14+.5)%2?base:c2);
  mdSkirt(B,P,.6,long,.09,.016,{col:m=>m.y<long+.035?tr:(st=='witch'&&(Math.round(m.c*4+m.y*9)%3==0))?mdMix(rb,0x6a5a3a,.3):rb,n:6});
  mdSk(B,P,.6,long,.09,.022,[.86,.9],{col:d.R||(lv>=2?T:mdSh(tr,1.15)),t:lv>=2||d.R?'m':'c'});
  if(lv>=1)mdSk(B,P,.6,long,.09,.02,[.91,.96],{col:m=>emb(m,tr,lv>=3?T:rd)});
  if(lv>=3){mdSk(B,P,.6,long,.09,.026,[.995,1.04],{col:m=>emb(m,T,mdSh(tr,.75)),e:[.004,.016]})}
  // embroidered back panel (lv1+) with a glyph (lv2+)
  if(lv>=1){mdTabardO(X,mdSh(M,.72),lv>=2?T:A,{only:'back',top:.95,lo:long+.06,wd:.11,sk:{y0:.6,y1:long,fl:.09,off:.016}});
    if(lv>=2){const z=-(mdTorsoAt(P,.8).b+off()+.022),w=mdTorsoW(.8);k.p('chest','oct',G?'g':'m',G||T,0,.8,z,.03,.036,.006);mdOW(k,w);k.p('chest','oct','c',mdSh(M,.72),0,.8,z-.003,.018,.022,.006);mdOW(k,w)}}
  // collar
  mdTS(B,P,.95,.99,off()+.012,{col:m=>lv>=2?T:tr,lipT:.004});
  // belt / sash with tassels
  const bc=st=='pyre'?0x5a1a10:st=='witch'?0x5a4028:mdSh(A,.6);mdTS(B,P,.578,.622,off()+.01,{col:m=>Math.abs(m.y-.6)<.008&&lv>=1?T:bc});
  const bf=mdTorsoAt(P,.6).f+off()+.016;k.p('spine','oct','m',T,0,.6,bf,.03,.03,.012);k.p('spine','oct',G?'g':'m',G||d.gem,0,.6,bf+.008,.014);
  const tassel=(x,z,len,c)=>{k.L('pelvis','c',c,[x,.585,z],[x+.004,.585-len,z+.01],.006,.006,4);k.p('pelvis','cone4','c',c,x+.004,.585-len-.02,z+.01,.016,.04,.016);k.p('pelvis','sph','m',T,x+.004,.585-len+.01,z+.01,.01)};
  tassel(.05,bf-.004,.12,bc);if(lv>=1)tassel(.085,bf-.012,.16,mdSh(bc,1.3));
  // stole: two embroidered bands from the shoulders down the front (lv2+)
  const stole=(c,c2,lo)=>[-1,1].forEach(s=>{const pts=[];for(let i=0;i<=8;i++){const y=.97-(.97-lo)*i/8,yy=Math.max(.6,y),q=mdTorsoAt(P,yy),a=s*.42,sr=mdSkR(P,.6,long,.09,Math.max(0,(.6-y)/(.6-long))),xr=sr.rx+.024,x=s*.085;
      const z=y>=.6?(q.z||0)+Math.cos(a)*(q.f+off()+.014):sr.p[2]+(sr.f+.024)*Math.sqrt(Math.max(.05,1-(x/xr)*(x/xr)));
      pts.push({p:[y>=.6?Math.sin(a)*(q.rx+off()+.014):x,y,z],n:[s*.3,0,1],w:y>=.6?mdTorsoW(y):mdSkW(P,.6)(s*.09,y)})}
    mdRib(B,pts,.056,.003,c);mdRib(B,pts.map(q=>({p:[q.p[0],q.p[1],q.p[2]-.003],n:q.n,w:q.w})),.072,.003,c2);if(lv>=4)for(let i=2;i<8;i+=2){const q=pts[i];k.p(i<5?'chest':'pelvis','oct',G&&i==4?'g':'m',G&&i==4?G:T,q.p[0],q.p[1],q.p[2]+.006,.009);mdOW(k,q.w)}});
  // shoulder pieces
  const shp=(c,n,gem)=>[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;for(let i=0;i<n;i++){const r=.11-i*.016,x=sp[0]+s*(.006+i*.018),y=.99-i*.04,rz=-s*(.3+i*.3);k.p(a,'hem','c',i?mdSh(c,.9):c,x,y,0,r,r*.5,r*1.05,0,0,rz);k.p(a,'tor','m',T,x,y-.002,0,r*1.04,.01,r*1.1,0,0,rz)}
    if(gem)k.p(a,'oct',G?'g':'m',G||d.gem,sp[0]+s*.03,1.04,.0,.014)});
  if(st=='robe'){mdTS(B,P,.88,1.0,off()+.02,{col:rd,lip:.04});mdSk(B,P,.6,long,.09,.022,[.2,.24],{col:tr})}
  else if(st=='witch'){mdTS(B,P,.82,1.0,off()+.022,{col:m=>Math.round(m.c*5+m.y*14)%3==0?0x5a4a34:0x4a3a2a,lip:.06});
    // charms: bone, herb bundles, a little bottle hanging from the belt
    [[-.08,0xe0d6bc,'cone4'],[-.12,0x5a7a3a,'box'],[-.16,0x8a6a40,'sph'],[.14,0x6aa0a0,'cyl']].forEach(([x,c,g],i)=>{const z=mdTorsoAt(P,.6).f+off()+.012;k.L('pelvis','c',0x3a2a1a,[x,.585,z],[x,.52-i*.012,z+.01],.003,.003,3);k.p('pelvis',g,g=='cyl'?'g':'c',c,x,.5-i*.012,z+.012,.016,.03,.014)});
    for(let i=0;i<5;i++){const p=mdTP(P,.78-i*.035,-.95+i*.1,off()+.01);k.p('spine','box','c',0x6a8a4a,p[0],p[1],p[2],.03,.008,.008,0,0,.6+i*.2)}}
  else if(st=='moss'){mdTS(B,P,.84,1.0,off()+.024,{col:m=>Math.round(m.c*6)%2?mdSh(rb,1.15):rd,lip:.06});
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2,p=mdTP(P,.86,a,off()+.07);k.p('chest','cone4','c',i%2?mdMix(rb,0x8ab04a,.4):mdSh(rb,.8),p[0],p[1]-.02,p[2],.022,.05,.012,Math.cos(a)*.6,a,0);mdOW(k,mdTorsoW(.86))}
    [-1,1].forEach(s=>{const p=mdTP(P,.9,s*.25,off()+.03);k.p('chest','box','c',0x6a4a2a,p[0],p[1],p[2],.012,.03,.012,0,0,Math.PI/2)})}
  else if(st=='pyre'||st=='binder'){mdTS(B,P,.66,.98,off()+.008,{col:tr,keep:m=>Math.abs(m.c)<.1});mdTS(B,P,.95,1.06,off()+.03,{col:rd,lipT:.035,keep:m=>m.s<.6});
    if(st=='pyre'){stole(mdSh(rb,.6),T,.2);shp(rd,2,0);for(let i=0;i<3;i++)k.p('chest','cone4',G?'g':'c',G||0xe06a28,-.02+i*.02,.86+(i==1?.02:0),mdTorsoAt(P,.86).f+off()+.016,.012,.05+(i==1?.02:0),.004)}
    else{// spellbinder: chains across the chest, runic bands, books on the belt
      [-1,1].forEach(s=>{const pts=[];for(let i=0;i<=10;i++){const t=i/10,y=.94-t*.22+Math.sin(t*Math.PI)*-.04,a=s*(.5-t*1.0);pts.push(mdTP(P,y,a,off()+.02))}
        for(let i=0;i<pts.length;i++){k.p('chest','tor','m',mdSh(T,1.35),pts[i][0],pts[i][1],pts[i][2],.017,.008,.017,i%2?Math.PI/2:0,0,0);mdOW(k,mdTorsoW(pts[i][1]))}});
      mdSk(B,P,.6,long,.09,.024,[.5,.54],{col:m=>Math.floor((Math.atan2(m.x,m.z)+Math.PI)/(Math.PI*2)*14+.5)%2?A:mdSh(A,.45),t:G?'g':'c'});
      [-1,1].forEach(s=>{k.p('pelvis','box','c',s<0?0x6a3a1a:0x3a2a4a,s*.17,.52,.07,.05,.07,.025,0,s*.6,0);k.p('pelvis','box','c',0xd8ccb0,s*.17+s*.004,.52,.07,.046,.064,.028,0,s*.6,0)});
      [-1,1].forEach(s=>{const R=mdArm(P,s);mdLB(B,R,2.2,.008,.016,T)})}}
  else if(st=='vestments'||st=='regalia'||st=='star'){mdTS(B,P,.92,1.08,off()+.034,{col:m=>m.s>0?tr:rd,lipT:.05,keep:m=>m.s<.5});
    mdTS(B,P,.66,.98,off()+.008,{col:tr,keep:m=>Math.abs(m.c)<.12});
    if(st=='vestments'){stole(0x2a2a3a,0xc8bca0,.12);shp(0xd8ccb0,2,1);mdTS(B,P,.7,.72,off()+.012,{col:0xd8ccb0})}
    else if(st=='regalia'){stole(mdSh(A,.55),T,.1);shp(rd,3,1);mdSk(B,P,.6,long,.1,.026,[0,.4,.62,.66],{col:m=>m.y<.27?mdSh(T,.9):rd,e:[0,0,0,.008],keep:m=>!(m.s>.8)});
      const f=mdTorsoAt(P,.88).f+off()+.016;k.p('chest','oct','m',T,0,.88,f,.036,.04,.014);k.p('chest','oct',G?'g':'m',G||d.gem,0,.88,f+.008,.02,.026,.012)}
    else{// starweaver: stars on the robe and a constellation trim
      shp(rd,2,1);const S=[[.08,.82],[-.1,.74],[.12,.66],[-.06,.9]];S.forEach(([x,y],i)=>{const z=mdTorsoAt(P,y).f+off()+.006;mdStar(k,'chest',G&&i<2?'g':'m',G&&i<2?G:T,x,y,z,.012,mdTorsoW(y))});
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2+.3,y=.2+((i*37)%5)*.05,q=mdSkR(P,.6,long,.09,(.6-y)/(.6-long));const r=q.rx+.022,x=Math.sin(a)*r,z=Math.cos(a)*(Math.cos(a)>0?q.f:q.b)+Math.cos(a)*.022;
        k.p('pelvis','oct',G&&i%3==0?'g':'m',G&&i%3==0?G:T,x,y,z,.01);mdOW(k,mdSkW(P,.6)(x,y))}}}
  if(lv>=2&&st!='regalia'){const f=mdTorsoAt(P,.84).f+off()+.012;k.p('chest','oct','m',T,0,.84,f,.026,.03,.01);k.p('chest','oct',G?'g':'m',G||d.gem,0,.84,f+.006,.016,.02,.01)}
  if(G&&d.GB)mdSk(B,P,.6,long,.09,.03,[.97,.99],{t:'g',col:G})}

// =====================================================================================================
// helm (mdHelmHair in zzN_model_gear.js decides how much hair stays)
