// ================= v136: the Mage's robes, redesigned =================
// The v95 cloth chest was one stiff tube from shoulders to shins with flat bands. Every Mage robe is now layered cloth:
//  * an under-robe (gkSkirt, closed) and an open-fronted over-robe whose panels hang from the waist, flare and swing (the back
//    on the cape bones), with trims down the opening and round the hem; the hem is cut (frayed, flame tongues, tatters) per style;
//  * bell sleeves that widen from the elbow and trail a long point behind the wrist (the raven's wing feathers stay folded
//    inside them); a capelet (gkCape) or a standing collar (gkCollar, taller at the back) at the neck;
//  * the dark-fantasy details of each robe: rope belt and a satchel (Novice), moss, roots and bone charms (Mossweave),
//    charred hem, ember cracks and a censer (Pyreweave), a bone rib-cage, skull clasp, chains and melting candles (Lichsilk),
//    layered metal mantle plates and storm runes (Tempest), patchwork and charms (Hedge-Witch), chained grimoires and seals
//    (Spellbinder), a starfield and crescent (Starweaver).
// While a robe is built the raven's hem remap (RV_HEM) is off: the robes are cut for him directly (hem above his talons).
// the shoulder capelet: rows from the neck down to the hem, measured (shoulders, upper arms, collar), hanging, open in front
function gkCape(B,P,o){o=o||{};const N=o.N||32,y1=o.y1||1.0,yH=o.yHem||.84,clr=o.clear==null?.014:o.clear,TH=j=>j/N*Math.PI*2,nt=o.rows||6;
  const hem=typeof o.hem=='function'?o.hem:(th=>yH+(o.hemF||0)*Math.max(0,Math.cos(th)));let ymin=y1;for(let j=0;j<N;j++)ymin=Math.min(ymin,hem(TH(j)));ymin-=o.dag?o.dag[0]:0;
  const ez=BR.on&&BR.R?BR.R.EYEP[2]-.04:.06,pts=gkPts(B,ymin-.01,y1+.02,(x,y,z)=>x*x+z*z<.38*.38&&(y<1.05||z<ez)&&!(BR.on&&BR.R&&BR.R.TP&&brTailNear(BR.R,x,y,z)));
  const dy=.014,ys=[];for(let y=y1;y>=ymin-.001;y-=dy)ys.push(y);const H=gkRows(pts,ys,dy*.75);
  const RB=H.map(h=>{const r=[];for(let j=0;j<N;j++)r.push(gkHullR(h,0,0,TH(j)));return r});for(let i=1;i<RB.length;i++)for(let j=0;j<N;j++)RB[i][j]=Math.max(RB[i][j],RB[i-1][j]);
  const rAt=(y,j)=>{const f=(y1-y)/dy,i=Math.max(0,Math.min(RB.length-1,Math.round(f)));return RB[i][j]};
  const G=[];for(let i=0;i<=nt;i++){const t=i/nt,row=[];for(let j=0;j<=N;j++){const th=TH(j);let y=y1+(hem(th)-y1)*t;if(i==nt&&o.dag&&j%2==1)y-=o.dag[0]*(.7+.3*Math.abs(Math.sin(j*1.9)));
      const r=rAt(y,j%N)+clr+(o.flare||.02)*t*t+(o.folds||.006)*t*(.5+.5*Math.sin(th*8+.5)),x=Math.sin(th)*r,z=Math.cos(th)*r;row.push({x,y,z,w:gkHeadW(x,y,z,{arm:o.arm==null?.5:o.arm}),cz:0})}G.push(row)}
  const op=o.open||0,keep=m=>{const th=m.u*Math.PI*2;return !(op&&(th<op||th>Math.PI*2-op))&&(!o.keep||o.keep(m))};
  gkSurf(B,G,{t:o.t||'c',col:o.col,keep});gkSurf(B,gkInset(G,G.map(()=>0),.004),{t:'c',col:o.lin==null?0x1a1418:o.lin,keep});return {G,N,nt}}
// pattern helpers (m from gkSurf / mdLoft): angle round the body, embroidered bands
function mgAng(m){return Math.atan2(m.x,m.z)}
function mgEmb(m,a,b,n){return Math.floor((mgAng(m)+Math.PI)/(Math.PI*2)*(n||16)+.5)%2?a:b}
// the hem height of the hero (the raven's robes end above his talons, a human's near the ground)
function mgHem(){return BR.on&&BR.R&&BR.R.key=='raven'?.2:.12}
var MG_ST={
  robe:  {under:.62,over:0,  hemD:[.018],ovHem:0,  sl:{bell:.05,trail:.07},cape:{yHem:.8,dag:[.025],open:.55},collar:0,belt:'rope'},
  moss:  {under:.6, over:1,  hemD:[.04], ovHem:.06,sl:{bell:.065,trail:.12,dag:.03},cape:{yHem:.76,dag:[.05],open:.5,moss:1},collar:0,belt:'root'},
  pyre:  {under:.4, over:1,  hemD:[.06], ovHem:.0, sl:{bell:.075,trail:.15,dag:.04},cape:0,collar:{h:1.1,hf:.99,open:.6},belt:'censer',char:1},
  vestments:{under:.3,over:1,hemD:[.03],ovHem:-.04,sl:{bell:.08,trail:.2,dag:.04},cape:0,collar:{h:1.12,hf:1.0,open:.55,spikes:1},belt:'skull',ribs:1,candles:1},
  regalia:{under:.45,over:1, hemD:[.02],ovHem:-.06,sl:{bell:.085,trail:.17},cape:{yHem:.8,dag:[.03],open:.6,plates:1},collar:{h:1.13,hf:1.0,open:.62,gem:1},belt:'regal',runes:1},
  witch: {under:.6, over:1,  hemD:[.05], ovHem:.05,sl:{bell:.07,trail:.11,dag:.035},cape:{yHem:.73,dag:[.06],open:.4,patch:1},collar:0,belt:'charms',patch:1},
  binder:{under:.4, over:1,  hemD:[.02], ovHem:-.02,sl:{bell:.065,trail:.14},cape:0,collar:{h:1.1,hf:.99,open:.55},belt:'books',chains:1},
  star:  {under:.35,over:1,  hemD:[.02], ovHem:-.05,sl:{bell:.08,trail:.17},cape:{yHem:.79,dag:0,open:.62,stars:1},collar:{h:1.1,hf:1.0,open:.62,crescent:1},belt:'star',stars:1}};
{const f=mdChestPre;mdChestPre=function(P,d){const r=f.apply(this,arguments);if(d&&d.a=='cloth'){mdDX(d);const S=MG_ST[d.st]||MG_ST.robe;P.col.torso=mdSh(d.M,S.under);P.col.sleeve=mdSh(d.M,S.under);P.col.pants=mdSh(d.M,S.under*.7)}return r}}
// the raven keeps his wing feathers folded inside wide sleeves
{const D=BRD[3];if(D&&D.wings){const f=D.wings;D.wings=function(B){if(BR.P&&BR.P.gkNoWing)return;return f.apply(this,arguments)}}}
mdChC=function(X){const {B,P,d,k}=X,st=MG_ST[d.st]?d.st:'robe',S=MG_ST[st],M=d.M,A=d.A,T=d.T,G=d.G,lv=d.lv|0,R=d.R;
  const rh=RV_HEM.on;RV_HEM.on=0;try{mgRobe(X,st,S,M,A,T,G,lv,R)}finally{RV_HEM.on=rh}};
function mgRobe(X,st,S,M,A,T,G,lv,R){const {B,P,d,k}=X,hm=mgHem();if(st=='robe')M=mdSh(M,.78);const U=mdSh(M,S.under),dk=mdSh(M,.42),lin=mdSh(M,.32),tr=st=='robe'?0x5a3a22:st=='moss'?0x3a2a18:st=='witch'?0x4a3420:lv>=2?T:A,raven=BR.on&&BR.R&&BR.R.key=='raven';
  const off=()=>(P.tOff||0),ember=0xff7a20,starC=0xe8dcb0;
  P.gkNoWing=1;
  // ---- the torso: a fitted bodice over the under-robe, V-necked, with a seam and a trim round the V ----
  const vw=y=>.16+Math.max(0,y-.62)*1.1;
  mdTS(B,P,.5,.99,.01,{col:m=>{const v=m.s>0&&Math.abs(m.c)<vw(m.y)+.07;if(v)return tr;if(st=='witch'&&(Math.floor(m.y*14)+Math.floor((mgAng(m)+4)*2.2))%3==0)return mdMix(M,0x5a4a34,.35);
      return M},keep:m=>!(m.s>0&&Math.abs(m.c)<vw(m.y)),lipT:.004});
  // the under-robe's chest shows inside the V: a panel with a row of buttons / a lacing
  {const z=y=>mdTorsoAt(P,y).f+off()+.003;for(let i=0;i<5;i++){const y=.66+i*.06;k.p('chest','oct',i==2&&G?'g':'m',i==2&&G?G:T,0,y,z(y),.009,.009,.005);mdOW(k,mdTorsoW(y))}}
  // ---- skirts ----
  const fr=st=='pyre'?.06:st=='vestments'||st=='regalia'?.07:.06;
  gkSkirt(B,P,{y0:.6,hem:th=>hm+(1-Math.cos(th))*.012,flare:fr,clear:.016,folds:[11,.012],dag:S.hemD,flow:.3,col:m=>{
      if(S.char&&m.v>.7)return mdMix(U,0x140c08,(m.v-.7)/.3*.8);if(m.v>.93)return mdSh(U,.75);
      return U}});
  if(S.over){const ovH=th=>hm+S.ovHem+(st=='regalia'||st=='vestments'||st=='star'?-.04*Math.max(0,-Math.cos(th)):0)+(st=='witch'?.03*Math.sin(th*3):0),op=st=='witch'?.5:.42;
    const nO=40,edge=m=>{const th=m.u*Math.PI*2,e=Math.min(th,Math.PI*2-th)-op;return e<Math.PI*2/nO*1.5};
    const OV=gkSkirt(B,P,{y0:.62,N:nO,hem:ovH,flare:fr+.035,clear:.03,folds:[9,.016],dag:st=='pyre'?[.09]:st=='moss'||st=='witch'?[.07]:st=='vestments'?[.05]:[.02],flow:.55,backF:.35,open:op,lin,
      col:m=>{const th=m.u*Math.PI*2;if(edge(m))return st=='witch'?0x3a2a1a:S.runes&&Math.floor(m.v*10)%3==0?mdSh(A,1.25):tr;if(m.v>.88)return st=='pyre'?mdMix(M,0x1a0a06,.75):st=='moss'?mdMix(M,0x2a3a1a,.6):st=='vestments'?mdSh(M,.55):lv>=1?mgEmb(m,tr,dk,22):tr;
        if(S.char&&m.v>.55)return mdMix(M,0x1a0a06,(m.v-.55)/.33*.85);
        if(st=='witch'&&(Math.floor(m.v*6)+Math.floor(m.u*14))%3==0)return mdMix(M,0x6a5030,.4);
        if(st=='vestments'&&Math.abs(Math.cos(th))>.94)return dk;return M}});
    // embers smouldering in the charred hem
    if(st=='pyre')for(let i=0;i<22;i++){const t=.55+((i*29)%17)/17*.42,th=op+.1+((i*41)%37)/37*(Math.PI*2-2*op-.2),v=OV.at(t,th),dx=Math.sin(th),dz=Math.cos(th);
      k.p('pelvis','box','g',i%3?ember:0xffc060,v.x+dx*.003,v.y,v.z+dz*.003,.004,.012+(i%3)*.006,.003,0,Math.atan2(dx,dz),(i%2?.5:-.5));mdOW(k,v.w)}
    // the starfield: little four-point stars scattered over the over-robe (a few glow on Epic+)
    if(S.stars)for(let i=0;i<26;i++){const t=.12+((i*37)%23)/23*.8,th=op+.15+((i*53)%31)/31*(Math.PI*2-2*op-.3),v=OV.at(t,th),dx=Math.sin(th),dz=Math.cos(th),a=Math.atan2(dx,dz);
      const sz=i%5==0?.016:.009;k.p('pelvis','box',G&&i%6==0?'g':'m',G&&i%6==0?G:starC,v.x+dx*.003,v.y,v.z+dz*.003,sz*.3,sz*2,.003,0,a,Math.PI/4);mdOW(k,v.w);k.p('pelvis','box',G&&i%6==0?'g':'m',G&&i%6==0?G:starC,v.x+dx*.003,v.y,v.z+dz*.003,sz*2,sz*.3,.003,0,a,Math.PI/4);mdOW(k,v.w)}
    // an embroidered back panel down the over-robe (Rare+: a sigil)
    if(lv>=2){const z=-(mdTorsoAt(P,.82).b+off()+.012);k.p('chest','oct',G?'g':'m',G||T,0,.82,z,.03,.042,.006);mdOW(k,mdTorsoW(.82));k.p('chest','oct','c',dk,0,.82,z-.003,.018,.026,.006);mdOW(k,mdTorsoW(.82))}}
  // ---- sleeves: fitted to the elbow, then a bell that trails a point behind the wrist ----
  [-1,1].forEach(s=>{mdAS(B,P,s,0,3,.012,{col:M});const so=S.sl;
    gkSleeve(B,P,s,{u0:2.7,uw:5.25,ext:.02,bell:so.bell,trail:so.trail,ta:Math.PI*.9,off:.014,folds:.008,dag:so.dag||0,lin,col:m=>m.v>.86?tr:m.v>.78&&lv>=1?mgEmb(m,tr,dk,10):S.char&&m.v>.6?mdMix(M,0x1a0a06,.5):M});
    const Ra=mdArm(P,s);mdLB(B,Ra,2.75,.008,.026,tr,{t:lv>=2?'m':'c'});
    if(S.runes||S.chains)for(let i=0;i<3;i++){const r=mdRAt(Ra,1.4+i*.35);k.p(s<0?'aL0':'aR0','box',G?'g':'m',G||T,r.p[0]+s*(r.rx+.016),r.p[1],r.p[2],.004,.014,.01);mdOW(k,r.w)}});
  // ---- capelet / collar ----
  if(S.cape){const c=S.cape,cc=st=='moss'?mdMix(M,0x3a5a2a,.4):st=='witch'?mdMix(M,0x5a4a34,.5):st=='regalia'?mdSh(M,.8):M;
    const cp=gkCape(B,P,{yHem:c.yHem,hemF:-.03,dag:c.dag,open:c.open,lin,flare:.012,col:m=>{if(m.v>.82)return c.stars?starC:c.moss?0x3a4a22:mdSh(tr,.85);if(c.patch&&(Math.floor(m.v*4)+Math.floor(m.u*12))%3==0)return mdMix(cc,0x7a5a3a,.35);
        if(c.moss&&(Math.floor(m.u*30)+Math.floor(m.v*5))%4==0)return mdMix(cc,0x6a8a3a,.5);return cc}});
    if(c.moss)for(let i=0;i<20;i++){const th=.7+i/19*(Math.PI*2-1.4),v=cp.G[cp.nt][Math.round(th/(Math.PI*2)*cp.N)];k.p('chest','cone4','c',i%2?0x5a7a32:0x3e5a26,v.x,v.y-.012,v.z,.016,.04,.01,Math.PI,th,0);mdOW(k,v.w)}
    if(c.plates)[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;for(let i=0;i<3;i++){const x=sp[0]+s*(.014+i*.02),y=1.0-i*.042;
        k.p(a,'hem','m',i?mdSh(T,.8):T,x,y,0,.105-i*.012,.032,.11-i*.01,0,0,-s*(.35+i*.28));k.p(a,'tor','m',mdSh(T,1.2),x,y-.003,0,.108-i*.012,.008,.114-i*.01,0,0,-s*(.35+i*.28))}
      k.p(a,'oct',G?'g':'m',G||d.gem,sp[0]+s*.03,1.035,0,.014,.02,.012)})}
  if(S.collar){const c=S.collar,cc=st=='vestments'?mdSh(M,1.1):mdSh(M,.85);
    const cl=gkCollar(B,P,{y0:.93,h:th=>c.hf+(c.h-c.hf)*Math.pow(Math.max(0,-Math.cos(th)*.5+.5),1.5),open:c.open,flare:.045,clear:.012,wave:c.spikes?.012:0,wn:7,col:m=>m.v>.75?tr:cc,lin:dk});
    if(c.spikes){for(let i=0;i<9;i++){const th=c.open+.25+i/8*(Math.PI*2-2*c.open-.5),v=cl.G[cl.nt][Math.round(th/(Math.PI*2)*cl.N)],dx=Math.sin(th),dz=Math.cos(th);
        gkSpike(k,'chest',[v.x,v.y-.01,v.z],[dx*.35,1,dz*.35],.045+(i==4?.025:0),.008,0xd8ccb0,'c',v.w)}}
    if(c.gem){const v=cl.G[cl.nt][Math.round(cl.N/2)];k.p('chest','oct',G?'g':'m',G||d.gem,v.x,v.y-.035,v.z-.012,.016,.024,.01);mdOW(k,v.w)}
    if(c.crescent){const z=mdTorsoAt(P,.93).f+off()+.02;for(let i=0;i<5;i++){const a=-1.1+i*.55;k.p('chest','box','m',T,Math.cos(a)*.026,.93+Math.sin(a)*.026,z,.008,.02,.005,0,0,a);mdOW(k,mdTorsoW(.93))}}}
  else if(!S.cape)mdTS(B,P,.95,.995,off()+.012,{col:tr,lipT:.004});
  // ---- belt and what hangs from it ----
  const by=.6,bf=mdTorsoAt(P,by).f+off()+.016,bw=mdTorsoW(by),pw=m=>[['pelvis',1]];
  const bc=S.belt=='rope'?0x6a5a3a:S.belt=='root'?0x4a3420:S.belt=='censer'?0x2a1410:S.belt=='skull'?0x1a1618:mdSh(A,.5);
  mdTS(B,P,by-.022,by+.022,off()+.01,{col:m=>S.belt=='rope'&&Math.round(m.x*90+m.y*60)%2?mdSh(bc,.8):Math.abs(m.y-by)<.008&&lv>=1&&S.belt!='rope'?T:bc});
  const hang=(x,len)=>{const z=mdTorsoAt(P,by).f+off()+.012;return [x,by-.02-len,z+.01]};
  const cord=(x,len,c)=>{const z=mdTorsoAt(P,by).f+off()+.012;k.L('pelvis','c',c||mdSh(bc,1.2),[x,by-.015,z],[x+.004,by-.02-len,z+.012],.004,.004,4)};
  if(S.belt=='rope'){k.p('spine','sph','c',mdSh(bc,1.1),.03,by,bf,.022,.018,.016);[[.025,.14],[.045,.18]].forEach(([x,l])=>{k.L('pelvis','c',bc,[x,by-.01,bf-.004],[x+.006,by-l,bf+.006],.007,.006,5);k.p('pelvis','cone4','c',mdSh(bc,1.2),x+.006,by-l-.018,bf+.006,.014,.036,.014)});
    // a satchel on the hip and a little book
    mdPouch(k,P,-1.3,by-.06,mdSh(0x5a3a22,1.05),T,1.25);const hp=mdTP(P,by-.05,1.2,off()+.04);gkBook(k,'pelvis',hp[0],hp[1],hp[2],.8,0x4a2418,T,1.2,null)}
  else if(S.belt=='root'){for(let i=0;i<5;i++){const a=-.9+i*.45,p=mdTP(P,by,a,off()+.022);k.p('spine','cone4','c',i%2?0x5a7a32:0x3e5a26,p[0],p[1]-.02,p[2],.014,.04,.01,Math.PI,a,0);mdOW(k,bw)}
    [[-.06,.1],[.07,.13],[.11,.09]].forEach(([x,l],i)=>{cord(x,l,0x3a2a1a);const h=hang(x,l);if(i==0)gkBone(k,'pelvis',[h[0]-.012,h[1],h[2]],[h[0]+.012,h[1]-.02,h[2]],.004,0xd8ccb0,null);
      else if(i==1)gkSkull(k,'pelvis',h[0],h[1]-.02,h[2]+.005,.55,0xd8ccb0,0,null);else gkVial(k,'pelvis',h[0],h[1]-.012,h[2],.9,G||0x7ac83a,T,null)});
    // mushrooms on the shoulder
    {const sp=mdArm(P,-1)[1].p;for(let i=0;i<3;i++){const x=sp[0]+.01+i*.02,y=1.0+i*.006,z=-.03+i*.025;k.p('aL0','cyl','c',0xd8ccb0,x,y,z,.005,.022,.005);k.p('aL0','hem','c',i%2?0x8a3a1a:0xa86a30,x,y+.012,z,.016,.012,.016)}}}
  else if(S.belt=='censer'){k.p('spine','oct','m',T,0,by,bf,.032,.032,.012);k.p('spine','oct','g',ember,0,by,bf+.008,.014);
    // a brass censer swinging on a chain at the hip, glowing coals inside
    const z=mdTorsoAt(P,by).f+off(),x=.12;gkChain(k,'pelvis',[[x,by-.01,z+.01],[x+.01,by-.13,z+.03]],.006,T,null);
    k.p('pelvis','sph2','m',T,x+.01,by-.16,z+.03,.026,.022,.026);k.p('pelvis','cone4','m',mdSh(T,.8),x+.01,by-.135,z+.03,.022,.02,.022);for(let i=0;i<4;i++){const a=i*1.57;k.p('pelvis','box','g',ember,x+.01+Math.sin(a)*.022,by-.16,z+.03+Math.cos(a)*.022,.005,.01,.005,0,a,0)}
    [[-.06,.12],[-.1,.08]].forEach(([x2,l])=>{cord(x2,l,0x3a1a10);const h=hang(x2,l);k.p('pelvis','box','c',0x2a1a14,h[0],h[1]-.02,h[2],.024,.034,.006);k.p('pelvis','box','g',ember,h[0],h[1]-.02,h[2]+.004,.008,.014,.003)})}
  else if(S.belt=='skull'){gkSkull(k,'spine',0,by+.005,bf+.006,.85,0xd8ccb0,0,bw);
    [[-.07,.14],[.08,.11]].forEach(([x,l])=>{const z=mdTorsoAt(P,by).f+off()+.014;gkChain(k,'pelvis',[[x,by-.01,z],[x+.004,by-l,z+.01]],.005,mdSh(T,.8),null);gkBone(k,'pelvis',[x-.016,by-l-.012,z+.012],[x+.02,by-l-.02,z+.012],.0045,0xd8ccb0,null)})}
  else if(S.belt=='regal'){k.p('spine','box','m',T,0,by,bf,.06,.05,.012);k.p('spine','oct',G?'g':'m',G||d.gem,0,by,bf+.009,.017,.022,.01);
    for(let i=0;i<3;i++){const x=-.05+i*.05,z=mdTorsoAt(P,by).f+off()+.014;k.p('pelvis','box','c',i==1?mdSh(A,.8):M,x,by-.12,z+.012,.034,.18,.004);k.p('pelvis','box','m',T,x,by-.215,z+.014,.036,.01,.005)}}
  else if(S.belt=='charms'){k.p('spine','sph','c',0x5a4028,0,by,bf,.02,.018,.014);
    [[-.12,.09,'bone'],[-.08,.13,'herb'],[-.04,.1,'vial'],[.05,.15,'skull'],[.1,.1,'feather'],[.14,.12,'herb']].forEach(([x,l,t2])=>{cord(x,l,0x3a2a1a);const h=hang(x,l);
      if(t2=='bone')gkBone(k,'pelvis',[h[0]-.01,h[1],h[2]],[h[0]+.01,h[1]-.022,h[2]],.004,0xd8ccb0,null);else if(t2=='herb'){for(let j=0;j<3;j++)k.p('pelvis','box','c',j%2?0x6a8a3a:0x4a6a2a,h[0]+j*.004-.004,h[1]-.02,h[2],.004,.04,.004,0,0,(j-1)*.3)}
      else if(t2=='vial')gkVial(k,'pelvis',h[0],h[1]-.012,h[2],.9,G||0x9ad0a0,T,null);else if(t2=='skull')gkSkull(k,'pelvis',h[0],h[1]-.02,h[2]+.004,.5,0xd0c4a4,0,null);
      else gkFeather(k,'pelvis',[h[0],h[1],h[2]],[.2,-1,.2],.07,.012,0x1a1a20,null)})}
  else if(S.belt=='books'){k.p('spine','box','m',T,0,by,bf,.05,.04,.012);
    // grimoires chained to the belt, a scroll case across the back
    [[-1,.14],[1,.1]].forEach(([s,l])=>{const p=mdTP(P,by,s*1.25,off()+.02),q=[p[0]+s*.03,by-l,p[2]+.02];gkChain(k,'pelvis',[[p[0],p[1],p[2]],q],.005,mdSh(T,1.1),null);gkBook(k,'pelvis',q[0],q[1]-.04,q[2],1.15,s<0?0x5a1a14:0x2a1e3a,T,s*1.25,null)});
    const z=-(mdTorsoAt(P,.8).b+off()+.03);k.L('chest','c',0x4a2a1a,[-.13,.66,z],[.12,.96,z-.01],.03,.03,7);k.p('chest','cyl','m',T,.12,.96,z-.01,.034,.016,.034,0,0,-.68);k.p('chest','cyl','m',T,-.13,.66,z,.034,.016,.034,0,0,-.68)}
  else{/*star*/const z=bf;for(let i=0;i<5;i++){const a=-1.1+i*.55;k.p('spine','box','m',T,Math.cos(a)*.03,by+Math.sin(a)*.03,z,.009,.024,.006,0,0,a);mdOW(k,bw)}k.p('spine','oct',G?'g':'m',G||starC,0,by,z+.004,.01);mdOW(k,bw)}
  // ---- chest pieces of each robe ----
  const cf=y=>mdTorsoAt(P,y).f+off();
  if(st=='robe'){/* wooden prayer beads */for(let i=0;i<14;i++){const a=-.9+i/13*1.8,y=.97-Math.cos(a*1.6)*.17,p=mdTP(P,Math.max(.75,y),a,off()+.012);k.p('chest','sph','c',i==7?0xa87a40:0x6a4a2a,p[0],p[1],p[2],.009);mdOW(k,mdTorsoW(p[1]))}}
  if(st=='moss'){[-1,1].forEach(s=>mdTStrap(B,P,.62,s*.3,.95,s*.55,off()+.008,.012,0x4a3420,{n:6}))}
  if(st=='pyre'){// ember cracks up the bodice, a flame brooch
    for(let i=0;i<7;i++){const y=.66+i*.045,a=(i%2?.28:-.28)+Math.sin(i*2.1)*.08,p=mdTP(P,y,a,off()+.002);k.p('chest','box','g',ember,p[0],p[1],p[2],.004,.03,.003,0,a,(i%2?.6:-.6));mdOW(k,mdTorsoW(y))}
    for(let i=0;i<3;i++)k.p('chest','cone4',G?'g':'c',G||0xe06a28,-.02+i*.02,.9+(i==1?.02:0),cf(.9)+.016,.012,.05+(i==1?.02:0),.004)}
  if(S.ribs){// a rib cage of bone strapped over the bodice
    const z=y=>cf(y)+.012;k.L('chest','c',0xd8ccb0,[0,.92,z(.92)],[0,.68,z(.68)],.008,.006,5);mdOW(k,mdTorsoW(.8));
    for(let i=0;i<4;i++){const y=.88-i*.055;[-1,1].forEach(s=>{const pts=[];for(let j=0;j<=4;j++){const a=s*(.06+j*.14),yy=y-j*j*.004;pts.push(mdTP(P,yy,a,off()+.012))}
        for(let j=0;j<4;j++){k.L('chest','c',0xd8ccb0,pts[j],pts[j+1],.0055-j*.0006,.005-j*.0006,4);mdOW(k,mdTorsoW(y))}})}
    gkSkull(k,'chest',0,.95,cf(.95)+.02,.75,0xe0d6bc,0,mdTorsoW(.95))}
  if(S.candles){[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p,x=sp[0]+s*.02;k.p(a,'hem','c',0xd8ccb0,x,1.0,0,.07,.022,.075,0,0,-s*.3);
    gkCandle(k,a,x+s*.012,1.035,-.01,1.1,null,G||0xffb040);gkCandle(k,a,x-s*.02,1.03,.03,.8,null,G||0xffb040);
    for(let i=0;i<4;i++)k.p(a,'box','c',0xf0e8d4,x+s*(-.03+i*.02),1.012-i*.004,-.04+i*.025,.008,.018+i%2*.012,.008)})}
  if(S.chains){// chains across the chest to a padlock, wax seals with ribbons
    [-1,1].forEach(s=>{const pts=[];for(let i=0;i<=6;i++){const t=i/6,y=.95-t*.2,a=s*(.55-t*.55);pts.push(mdTP(P,y,a,off()+.016))}gkChain(k,'chest',pts,.007,mdSh(T,1.2),p=>mdTorsoW(p[1]))});
    k.p('chest','box','m',mdSh(T,.9),0,.73,cf(.73)+.02,.022,.026,.012);mdOW(k,mdTorsoW(.73));k.p('chest','tor','m',mdSh(T,.9),0,.755,cf(.73)+.02,.012,.016,.006,Math.PI/2);mdOW(k,mdTorsoW(.75));
    [[-.08,.68],[.09,.64]].forEach(([x,y])=>{const z=cf(y)+.012;k.p('chest','cyl','c',0x8a1414,x,y,z,.016,.006,.016,Math.PI/2);mdOW(k,mdTorsoW(y));k.p('chest','box','c',0xe0d4b4,x,y-.04,z-.002,.012,.06,.003,0,0,.1);mdOW(k,mdTorsoW(y))})}
  if(st=='witch'){// a shawl pin of bone and a bundle of herbs at the shoulder
    k.p('chest','cone4','c',0xd8ccb0,-.06,.92,cf(.92)+.03,.006,.06,.006,0,0,.8);const sp=mdArm(P,1)[1].p;for(let i=0;i<4;i++)k.p('aR0','box','c',i%2?0x6a8a3a:0x5a4a2a,sp[0]+.02,1.0+i*.006,-.02+i*.012,.005,.05,.005,.3,0,-.3-i*.1)}
  if(S.stars){[[.08,.86],[-.1,.78],[.12,.7],[-.06,.92]].forEach(([x,y],i)=>mdStar(k,'chest',G&&i<2?'g':'m',G&&i<2?G:T,x,y,cf(y)+.006,.012,mdTorsoW(y)))}
  if(S.runes){for(let i=0;i<6;i++){const y=.66+i*.05;[-1,1].forEach(s=>{const p=mdTP(P,y,s*(vw(y)+.08),off()+.004);gkRunes(k,'chest',[[p[0],p[1],p[2],s*(vw(y)+.08)]].map(q=>q.concat()),G||mdSh(A,1.3),mdTorsoW(y),.9)})}}
  if(R)mdTS(B,P,.965,.985,off()+.004,{col:R,t:'m',keep:m=>!(m.s>0&&Math.abs(m.c)<vw(m.y))})}
