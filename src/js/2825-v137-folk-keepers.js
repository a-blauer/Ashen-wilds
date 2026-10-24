// ================= v137: animal townsfolk — the keepers' costumes =================
// One costume per keeper, made for their trade (and the label the game gives them). Species are set in FK137.out (2820).
var FKC={gold:0xc9a24a,brass:0xb08a3a,leather:0x5a3a22,leatherD:0x3a2616,linen:0xd8ccb0,white:0xe8e2d6,iron:0x4a4a52};
// a stripe / trim at the hem rows of a gkSkirt (m.v near 1) or the front edges of an open coat
function fkTrim(col,tr,o){o=o||{};return m=>{if(m.v!=null&&m.v>(o.hem||.86))return tr;if(o.edge&&m.u!=null){const th=m.u*Math.PI*2,a=Math.min(th,Math.PI*2-th);if(Math.abs(a-o.edge)<.12)return tr}return typeof col=='function'?col(m):col}}
// ---------------- Stronghold Steward (stag): a long navy coat, crimson waistcoat, chain of office ----------------
FKO['Stronghold Steward']=function(o,D,C){const navy=0x23304e,crim=0x7a2228,G=FKC.gold;
  return {paint(P){FKG.paint(P,C,{shirt:crim,sleeve:'long',pants:0x1c2030,legs:'long',cuffs:G});P.paint.sleeve=()=>navy;P.paint.fore=m=>m.r.part=='wrist'?G:navy},
    build(B,P){FKG.buttons(B,P,.66,.9,5,G);FKG.shell(B,P,.56,.97,m=>Math.abs(m.y-.6)<.02?0x1a1a22:navy,{open:.42,off:.012,lipT:.004});
      FKG.belt(B,P,.6,0x1a1612,{buckle:G,off:.016,h:.018});
      FKG.skirt(B,P,{y0:.6,hem:th=>.2+.16*Math.max(0,Math.cos(th))**2,col:fkTrim(navy,G,{hem:.88}),lin:0x14182a,open:.36,flare:.05,backF:.4});
      FKG.collar(B,P,navy,{h:th=>1.02+.04*Math.max(0,-Math.cos(th)),flare:.03,open:.6,lin:G});
      const k=dkKit(),pts=[];for(let i=0;i<=12;i++){const a=-1.25+i/12*2.5,y=.95-.09*Math.cos(a*1.25)**2*(1-Math.abs(a)/1.6)-.0;pts.push(mdTP(P,Math.max(.86,y-.0),a,Math.abs(a)>.46?.02:.006))}
      gkChain(k,'chest',pts,.008,G);const m=mdTP(P,.84,0,.009);k.p('chest','cyl','m',G,m[0],m[1],m[2],.032,.008,.032,Math.PI/2,0,0);k.p('chest','cyl','c',crim,m[0],m[1],m[2]+.005,.02,.006,.02,Math.PI/2,0,0);
      k.p('chest','oct','m',G,m[0],m[1],m[2]+.009,.01,.014,.004);
      {const q=mdTP(P,.55,1.0,(P.tOff||0)+.004);gkScroll(k,'pelvis',q[0],q[1],q[2],1.2,G,1.2)}mdKit(B,k)}}};
// ---------------- Blacksmith (bear): leather apron, heavy gloves, boots, a kerchief, tongs at the belt ----------------
FKO['Blacksmith']=function(o,D,C){const sh=0x4a4038,ap=0x5e3c22,soot=0x2a2420;
  return {boots(B,P){FKG.boots(B,P,0x2a1d14,{i0:4,top:0x3a2a1a})},
    paint(P){FKG.paint(P,C,{shirt:sh,sleeve:'short',pants:0x3a3028,legs:'long'})},
    build(B,P){FKG.cuff(B,P,4,7,FKC.leatherD,.014);FKG.cuff(B,P,4,4,0x2a1a10,.018);
      FKG.belt(B,P,.6,FKC.leatherD,{buckle:FKC.iron,h:.02});
      const st=m=>{const n=Math.sin(m.x*60+m.y*40)*Math.cos(m.z*55-m.y*30);return n>.55?soot:ap};
      const o0=P.tOff||0;FKG.apron(B,P,ap,{hem:.27,w:1.25,bibTop:.94});
      const k=dkKit(),pk=mdTP(P,.72,0,o0+.012+.007);k.p('chest','box','c',mdSh(ap,.8),pk[0],pk[1],pk[2],.11,.07,.012);
      // tongs and a hammer loop on the belt
      const t0=mdTP(P,.6,-.95,(P.tOff||0)+.025);k.L('pelvis','m',FKC.iron,t0,[t0[0]-.01,t0[1]-.25,t0[2]+.03],.008,.007,4).L('pelvis','m',FKC.iron,[t0[0]+.012,t0[1],t0[2]],[t0[0]+.006,t0[1]-.25,t0[2]+.04],.008,.007,4);
      const h0=mdTP(P,.6,.95,(P.tOff||0)+.025);k.p('pelvis','ring','c',FKC.leatherD,h0[0],h0[1]-.01,h0[2],.022,.08,.022,0,0,Math.PI/2);
      // a red kerchief over the crown, knotted at the back
      fkCoif(B,D,0x8a2a1a,{z1:D.EYEP[2]-.04,yMin:D.EYEP[1]+.035,off:.01});const bk=fkSurf(D,-.09,0.9,.01);k.p('head','sph2','c',0x7a2418,0,bk[1],bk[2]-.004,.024,.018,.014);
      k.L('head','c',0x8a2a1a,[0,bk[1],bk[2]-.01],[.02,bk[1]-.07,bk[2]-.03],.012,.004,4).L('head','c',0x8a2a1a,[0,bk[1],bk[2]-.01],[-.02,bk[1]-.06,bk[2]-.025],.012,.004,4);
      mdKit(B,k)}}};
// ---------------- Merchant / Trading Post (raccoon): a blue vest, coin purse, ledger, a beret with a feather ----------------
FKO['Merchant']=function(o,D,C){const vest=mdC(o.robe||0x2a4a7a),hat=mdC(o.hatC||0x6a2a2a);
  return {paint(P){FKG.paint(P,C,{shirt:FKC.linen,sleeve:'long',pants:0x3a3448,legs:'long',cuffs:mdSh(FKC.linen,.85)})},
    build(B,P){FKG.shell(B,P,.58,.95,m=>m.y>.93?mdSh(vest,.8):vest,{open:.22,off:.012,vneck:[.8,2.2]});FKG.buttons(B,P,.62,.86,4,FKC.gold,{dx:.05,off:.005});
      FKG.belt(B,P,.6,FKC.leather,{buckle:FKC.brass});FKG.scarf(B,P,0x8a2a2a);
      FKG.skirt(B,P,{y0:.6,hem:th=>.47,col:vest,open:.5,flare:.02,rows:4,lin:mdSh(vest,.5)});
      const k=dkKit();FKG.pouch(k,P,.56,.75,0x8a6a2a,1.1);const c=mdTP(P,.56,.75,(P.tOff||0)+.034);for(let i=0;i<3;i++)k.p('pelvis','cyl','m',FKC.gold,c[0]+.008*i,c[1]-.058,c[2],.012,.004,.012);
      gkBook(k,'pelvis',-.2,.5,.0,1.3,0x5a2a1a,FKC.brass,-1.5);
      const b=fkBeret(k,D,hat,{h:.034,btn:1,tz:.18,r:.085});gkFeather(k,'head',[.04,b.y+.01,b.z-.02],[.5,.7,-.5],.12,.018,0xe8e0c8);
      mdKit(B,k)}}};
// ---------------- Magic Vendor (lynx): a starry violet robe, bell sleeves, a tall pointed hat, a crystal ----------------
FKO['Magic Vendor']=function(o,D,C){const rb=mdC(o.robe||0x5a3aa0),dk=mdSh(rb,.55),G=FKC.gold;
  return {paint(P){FKG.paint(P,C,{shirt:rb,sleeve:'long',pants:dk,legs:'long'})},
    build(B,P){FKG.belt(B,P,.6,G,{buckle:0x9a70ff,h:.014});
      const S=FKG.skirt(B,P,{y0:.6,hem:th=>.07+.04*Math.max(0,-Math.cos(th)),col:fkTrim(rb,G,{hem:.9}),lin:dk,flare:.08,folds:[11,.012]});
      FKG.sleeves(B,P,{bell:.05,trail:.08,col:m=>m.v>.85?G:rb,lin:dk,u0:2.8});
      FKG.mantle(B,P,{y0:1.0,hem:th=>.86-.03*Math.max(0,-Math.cos(th)),col:m=>m.v>.8?G:mdSh(rb,.85),lin:dk,open:.5,dag:.02,flare:.02});
      const k=dkKit();// little stars and moons stitched over the skirt
      for(let j=0;j<26;j++){const t=.15+((j*37)%70)/100,th=(j*2.39)%(Math.PI*2),v=S.at(t,th);if(!v)continue;const L=Math.hypot(v.x,v.z-S.cz)||1,f=(L+.003)/L,ry=Math.atan2(v.x,v.z-S.cz);
        gkW(k.p('pelvis',j%4?'oct':'cone4',j%4?'m':'g',j%4?0xe8c860:0xc8b8ff,v.x*f,v.y,S.cz+(v.z-S.cz)*f,.009,.012,.003,0,ry,0),v.w)}
      const pc=mdTP(P,.84,0,.014);k.L('chest','c',0x2a2030,mdTP(P,.97,-.6,.003),pc,.003,.003,3).L('chest','c',0x2a2030,mdTP(P,.97,.6,.003),pc,.003,.003,3);
      k.p('chest','oct','g',0xb890ff,pc[0],pc[1]-.02,pc[2],.018,.032,.012);
      fkPointHat(k,D,mdC(o.hatC||0x2e2078),{h:.22,r:.08,brim:.15,band:G,star:0xf0d870});mdKit(B,k)}}};
// ---------------- Innkeeper (boar): rolled sleeves, a maroon waistcoat, a long white apron, a towel and keys ----------------
FKO['Innkeeper']=function(o,D,C){const wc=mdC(o.robe||0x6a3a2a);
  return {paint(P){FKG.paint(P,C,{shirt:0xe0d4bc,sleeve:'short',pants:0x4a3a2a,legs:'long'})},
    build(B,P){FKG.shell(B,P,.57,.95,m=>m.y<.6?mdSh(wc,.8):wc,{off:.012,vneck:[.78,3.2],lip:.004});FKG.buttons(B,P,.62,.76,4,FKC.brass,{off:.005});
      {const k=dkKit(),a=mdTP(P,.7,-.35,(P.tOff||0)+.004),b=mdTP(P,.66,.0,(P.tOff||0)+.005),c=mdTP(P,.7,.4,(P.tOff||0)+.004);gkChain(k,'spine',[a,b,c],.005,FKC.gold);k.p('spine','cyl','m',FKC.gold,c[0],c[1]-.004,c[2]+.004,.016,.006,.016,Math.PI/2,0,0);mdKit(B,k)}
      FKG.cuff(B,P,3,3,0xe0d4bc,.016);
      FKG.apron(B,P,0xece6da,{hem:.17,w:1.45,bib:false,y0:.62});
      const k=dkKit();// a towel over the left shoulder, hanging front and back
      const s0=mdTP(P,.96,-1.2,(P.tOff||0)+.002);k.p('chest','box','c',0xe8e0d0,s0[0],s0[1]+.012,s0[2]-.01,.07,.012,.12,0,0,-.2);
      [[.1,1],[-.11,-1]].forEach(([dz,f])=>{k.p('chest','box','c',f>0?0xe8e0d0:0xd8d0c0,s0[0]-.005,s0[1]-.07,s0[2]+dz,.06,.15,.01,f*.12,0,-.08);for(let i=0;i<2;i++)k.p('chest','box','c',0xb84a3a,s0[0]-.005,s0[1]-.12+i*.02,s0[2]+dz+f*.006,.062,.006,.004,f*.12,0,-.08)});
      // a ring of keys at the belt
      const r=mdTP(P,.6,.9,(P.tOff||0)+.008);k.p('pelvis','ring','m',FKC.iron,r[0],r[1]-.02,r[2],.024,.08,.024,0,0,Math.PI/2);[-1,0,1].forEach(i=>k.L('pelvis','m',FKC.brass,[r[0]+.004,r[1]-.04,r[2]+i*.012],[r[0]+.008,r[1]-.085,r[2]+i*.02],.004,.003,4));
      mdKit(B,k)}}};
// ---------------- Cook (otter): chef's whites, checked trousers, neckerchief, half apron, toque, a ladle ----------------
FKO['Cook']=function(o,D,C){const W=FKC.white;
  return {paint(P){FKG.paint(P,C,{shirt:W,sleeve:'long',pants:0x3a3a3e,legs:'long',cuffs:mdSh(W,.9),pattL:m=>(Math.floor(m.y*40)+Math.floor((m.x+m.z)*40))%2?0x2a2a2e:0xd8d4cc})},
    build(B,P){mdTS(B,P,.64,.95,(P.tOff||0)+.006,{col:mdSh(W,.94),keep:m=>m.s>.2&&m.c<.25&&m.c>-.6});FKG.buttons(B,P,.66,.9,4,0xd8d4cc,{dx:.05,off:.003});
      FKG.scarf(B,P,0xb83a2a);FKG.apron(B,P,0xd8d4cc,{hem:.36,w:1.3,bib:false,y0:.6});
      const k=dkKit();fkToque(k,D);const l0=mdTP(P,.58,-.9,(P.tOff||0)+.03);k.L('pelvis','m',0x8a8a92,l0,[l0[0]-.01,l0[1]-.22,l0[2]+.02],.006,.006,4);k.p('pelvis','sph','m',0x8a8a92,l0[0]-.012,l0[1]-.24,l0[2]+.024,.03,.02,.03);
      mdKit(B,k)}}};
// ---------------- Alchemist (goat): a long green robe, a bandolier of vials, satchel, brass goggles ----------------
FKO['Alchemist']=function(o,D,C){const rb=mdC(o.robe||0x2e4a3a),dk=mdSh(rb,.55),stain=m=>rb;
  return {paint(P){FKG.paint(P,C,{shirt:rb,sleeve:'long',pants:dk,legs:'long',cuffs:FKC.leather})},
    build(B,P){FKG.belt(B,P,.6,FKC.leather,{buckle:FKC.brass});
      FKG.skirt(B,P,{y0:.6,hem:th=>.12+.03*Math.max(0,-Math.cos(th)),col:fkTrim(stain,mdC(o.trim||0x8a6a2a),{hem:.9}),lin:dk,flare:.06,slit:.25,slitY:.3});
      FKG.cuff(B,P,4,5,FKC.leather,.014);
      const k=dkKit(),A=[],off=(P.tOff||0)+.012;// the bandolier from the right shoulder to the left hip, vials in loops
      for(let i=0;i<=10;i++){const t=i/10,y=.97-.38*t,a=.75-1.6*t;A.push(mdTP(P,y,a,off))}fkPath(A,FKC.leather,.012,.012,k,'chest',4);
      const gl=[0x7aff8a,0xff7a4a,0x7ab8ff,0xe8d84a,0xd87aff];[2,3,4,5,6].forEach((i,j)=>{const p=mdTP(P,.97-.38*i/10,.75-1.6*i/10,off+.016);gkVial(k,n3TB(p[1]),p[0],p[1],p[2],1.1,gl[j],FKC.brass)});
      // satchel on the left hip with a strap over the right shoulder (behind the bandolier)
      FKG.pouch(k,P,.52,-1.0,0x6a4a2a,1.6);
      // goggles pushed up on the brow: two brass rims with lenses, a strap round the head
      const e=D.EYEP,gz=e[2]-.02,gy=fkTop(D,gz)-.008;[-1,1].forEach(s=>{const x=s*.032;k.p('head','cyl','m',FKC.brass,x,gy,gz+.012,.024,.016,.024,-1.1,0,0);k.p('head','cyl','g',0x9ad8c0,x,gy+.006,gz+.016,.018,.014,.018,-1.1,0,0)});
      fkCoif(B,D,FKC.leatherD,{z0:-.1,z1:gz,yMin:gy-.006,off:.004});
      mdKit(B,k)}}};
// ---------------- Stable Master (ram): linen shirt, dungarees, neckerchief, straw hat, a coil of rope ----------------
FKO['Stable Master']=function(o,D,C){const du=0x5a4a2e;
  return {paint(P){FKG.paint(P,C,{shirt:0xd0c4a8,sleeve:'short',pants:du,legs:'long'})},
    build(B,P){mdTS(B,P,.58,.88,(P.tOff||0)+.01,{col:du,keep:m=>m.s>.45});FKG.belt(B,P,.6,du,{buckle:false,h:.03});
      const k=dkKit();[-1,1].forEach(s=>{const a=mdTP(P,.87,s*.4,(P.tOff||0)+.014),b=mdTP(P,.97,s*.62,(P.tOff||0)+.008),c=mdTP(P,.6,s*2.6,(P.tOff||0)+.012);k.L('chest','c',du,a,b,.011,.011,4);k.L('chest','c',du,b,c,.011,.011,4);k.p('chest','sph','m',FKC.brass,a[0],a[1],a[2]+.004,.01,.01,.006)});
      FKG.scarf(B,P,0x3a6a3a);
      const r=mdTP(P,.56,1.0,(P.tOff||0)+.05);k.p('pelvis','ring','c',0xb8a070,r[0],r[1],r[2],.07,.3,.07,0,1.0,Math.PI/2);k.p('pelvis','ring','c',0xa89060,r[0],r[1],r[2],.06,.3,.06,0,1.0,Math.PI/2);
      fkBrimHat(k,D,0xc8a860,{brim:.2,cr:.075,ch:.075,band:0x6a3a1a,sink:.0});mdKit(B,k)}}};
// ---------------- Curio Merchant (fox): a travelling coat, a big pack with trinkets, a wide hat with a feather ----------------
FKO['Curio Merchant']=function(o,D,C){const coat=mdC(o.robe||0x7a4a2a),hat=mdC(o.hatC||0x3a6a3a);
  return {paint(P){FKG.paint(P,C,{shirt:0xc8b890,sleeve:'long',pants:0x3a3028,legs:'long'});P.paint.sleeve=()=>coat;P.paint.fore=m=>m.r.part=='wrist'?mdSh(coat,.7):coat},
    build(B,P){FKG.shell(B,P,.56,.97,coat,{open:.45,off:.012});FKG.belt(B,P,.6,FKC.leatherD,{buckle:FKC.brass});
      FKG.skirt(B,P,{y0:.6,hem:th=>.24+.06*Math.max(0,Math.cos(th)),col:coat,lin:mdSh(coat,.5),open:.4,flare:.05,dag:[.02]});
      FKG.collar(B,P,mdSh(coat,.85),{h:th=>1.03,flare:.04,open:.7});FKG.scarf(B,P,0x2a5a6a,{y:.975});
      const k=dkKit();// the pack on the back: a box, a bedroll on top, a pot and a lantern hanging
      const bz=mdTorsoAt(P,.8),z=-(bz.b+(P.tOff||0))-.08;k.p('chest','box','c',0x6a4a2a,0,.8,z,.3,.34,.15).p('chest','box','c',0x5a3a22,0,.92,z-.004,.31,.06,.155);
      k.p('chest','cyl','c',0x8a2a2a,0,1.0,z+.01,.06,.34,.06,0,0,Math.PI/2);[-1,1].forEach(s=>k.p('chest','box','c',FKC.leatherD,s*.1,.84,z+.02,.025,.4,.16));
      k.p('chest','sph','m',0x4a4a4a,.17,.68,z-.03,.06,.05,.06).L('chest','m',0x2a2a2a,[.17,.73,z-.03],[.17,.78,z-.03],.004,.004,3);
      k.p('chest','box','m',0x6a5a3a,-.168,.7,z-.02,.05,.07,.05).p('chest','box','g',0xffc860,-.168,.7,z-.02,.035,.045,.035);
      [-1,1].forEach(s=>{const a=mdTP(P,.96,s*.5,(P.tOff||0)+.01),b=mdTP(P,.66,s*.65,(P.tOff||0)+.01);k.L('chest','c',FKC.leatherD,a,[s*.12,.96,z+.05],.014,.014,4);k.L('chest','c',FKC.leatherD,a,b,.012,.012,4)});
      FKG.pouch(k,P,.56,.8,0x6a4a2a);gkVial(k,'pelvis',.2,.53,-.06,1.2,0x7affd0,FKC.brass);
      const h=fkBrimHat(k,D,hat,{brim:.19,cr:.065,ch:.08,tx:-.15,band:0x8a6a2a});gkFeather(k,'head',[.06,h.y+.03,h.z-.03],[.45,.8,-.6],.14,.02,0xd84a2a);mdKit(B,k)}}};
FKO['Wandering Merchant']=FKO['Curio Merchant'];
// ---------------- Beast Trainer (wolf): a leather jerkin, fur mantle, bracers, a whistle and treat pouches ----------------
FKO['Beast Trainer']=function(o,D,C){const sh=mdC(o.robe||0x3a5a2a);
  return {paint(P){FKG.paint(P,C,{shirt:sh,sleeve:'long',pants:0x4a3a28,legs:'long',pattL:m=>m.r.part=='shin'&&Math.floor(m.y*45)%2?0x8a7a5a:null})},
    build(B,P){FKG.shell(B,P,.56,.96,m=>Math.abs(m.c)<.06&&m.s>.8?0x2a1a10:FKC.leather,{off:.012,lipT:.004});
      const k=dkKit();for(let i=0;i<5;i++){const y=.66+i*.06;[-1,1].forEach(s=>{const p=mdTP(P,y,s*.07,(P.tOff||0)+.004);k.p('chest','sph','c',0x2a1a10,p[0],p[1],p[2],.005,.005,.004)})}
      FKG.belt(B,P,.6,FKC.leatherD,{buckle:FKC.iron});FKG.cuff(B,P,4,5,FKC.leatherD,.016);
      FKG.skirt(B,P,{y0:.6,hem:th=>.45+.02*Math.sin(th*6),col:FKC.leather,lin:FKC.leatherD,open:.25,flare:.03,dag:[.03],rows:4});
      // the fur mantle round the shoulders
      FKG.mantle(B,P,{y0:1.01,hem:th=>.84-.03*Math.max(0,-Math.cos(th)),col:m=>(m.j+m.i)%3==0?0x6e5e4a:0x8a7a62,lin:0x5a4a38,dag:.035,flare:.025,folds:[12,.008],roll:.022,rollCol:0x9a8a72,open:.25});
      FKG.pouch(k,P,.57,.85,0x6a4a2a);FKG.pouch(k,P,.57,-.85,0x6a4a2a);FKG.pouch(k,P,.57,2.4,0x5a3a22,.8);
      const w=mdTP(P,.86,.25,(P.tOff||0)+.008);k.L('chest','c',0x2a1a10,mdTP(P,.98,-.3,(P.tOff||0)+.002),w,.003,.003,3);k.p('chest','cyl','m',0xc8c0b0,w[0],w[1]-.02,w[2],.008,.05,.008,0,0,.2);
      for(let i=0;i<5;i++){const a=-.5+i*.25,p=mdTP(P,.93-.03*Math.cos(a*2),a,(P.tOff||0)+.006);k.p('chest','cone4','c',0xe8e0c8,p[0],p[1]-.012,p[2],.006,.024,.006,Math.PI)}
      mdKit(B,k)}}};
// ---------------- Bard (hare): a slashed doublet, puffed sleeves, two-tone hose, ruff, feathered cap ----------------
FKO['Bard']=function(o,D,C){const rb=mdC(o.robe||0x8a2a5a),y2=0xd8b040,hat=mdC(o.hatC||0x5a1a3a);
  const slash=m=>Math.abs(Math.sin(Math.atan2(m.x,m.z)*9))>.86&&m.y<.95?y2:rb;
  return {paint(P){FKG.paint(P,C,{shirt:rb,sleeve:'long',pants:rb,legs:'long',patt:m=>slash(m)});P.paint.leg=(m,s)=>m.r.part=='ankle'?C.FUR:s<0?rb:y2},
    build(B,P){FKG.belt(B,P,.6,0x2a1a10,{buckle:FKC.gold,h:.016});
      FKG.skirt(B,P,{y0:.6,hem:th=>.5,col:m=>slash(m),lin:mdSh(rb,.5),flare:.04,rows:3,dag:[.025]});
      [-1,1].forEach(s=>mdAS(B,P,s,0,3,.03,{col:m=>Math.floor(Math.atan2(m.x,m.z)*4)%2?y2:rb}));
      FKG.collar(B,P,0xf0ece0,{y0:.97,h:th=>1.01,flare:.05,open:0,wave:.012,wn:14,lin:0xd8d0c0});
      const k=dkKit(),b=fkBeret(k,D,hat,{h:.03,r:.08,tz:-.3,tx:-.25,btn:0});gkFeather(k,'head',[-.04,b.y+.015,b.z-.02],[-.4,.75,-.7],.16,.022,0xf0e8d0);gkFeather(k,'head',[-.035,b.y+.01,b.z-.025],[-.6,.6,-.6],.12,.016,0xd84a4a);
      mdKit(B,k)}}};
FKO['Traveling Bard']=FKO['Bard'];
// ---------------- Rune Sage (owl): a deep blue robe with glowing runes, a cowl mantle, rune stones ----------------
FKO['Rune Sage']=function(o,D,C){const rb=mdC(o.robe||0x2a3a7a),dk=mdSh(rb,.5),rn=0x9ac8ff;
  return {paint(P){FKG.paint(P,C,{shirt:rb,sleeve:'long',pants:dk,legs:'long'})},
    build(B,P){FKG.belt(B,P,.6,0x2a2030,{buckle:0x8ab8ff,h:.016});
      const S=FKG.skirt(B,P,{y0:.6,hem:th=>.05,col:fkTrim(rb,0xc8b070,{hem:.9}),lin:dk,flare:.07,folds:[10,.012]});
      FKG.sleeves(B,P,{bell:.045,trail:.06,col:m=>m.v>.86?0xc8b070:rb,lin:dk,u0:2.8});
      FKG.mantle(B,P,{y0:1.02,hem:th=>.8+.03*Math.cos(th),col:m=>m.v>.78?0xc8b070:mdSh(rb,.85),lin:dk,open:.35,flare:.03,roll:.03,rollCol:mdSh(rb,.75)});
      const k=dkKit();for(let j=0;j<22;j++){const v=S.at(.86,j/22*Math.PI*2+.1);if(!v)continue;const L=Math.hypot(v.x,v.z-S.cz)||1,f=(L+.004)/L,p=[v.x*f,v.y+.03,S.cz+(v.z-S.cz)*f,Math.atan2(v.x,v.z-S.cz)];
        const t=j%3,s=1.3;if(t==0)gkW(k.p('pelvis','box','g',rn,p[0],p[1],p[2],.004*s,.018*s,.003,0,p[3],0),v.w);
        else if(t==1){gkW(k.p('pelvis','box','g',rn,p[0]-.003*s*Math.cos(p[3]),p[1],p[2]+.003*s*Math.sin(p[3]),.003*s,.014*s,.003,0,p[3],.5),v.w);gkW(k.p('pelvis','box','g',rn,p[0]+.003*s*Math.cos(p[3]),p[1],p[2]-.003*s*Math.sin(p[3]),.003*s,.014*s,.003,0,p[3],-.5),v.w)}
        else gkW(k.p('pelvis','oct','g',rn,p[0],p[1],p[2],.006*s,.009*s,.003,0,p[3],0),v.w)}
      for(let i=0;i<7;i++){const a=-.7+i*.233,p=mdTP(P,.93-.05*Math.cos(a*1.8),a,(P.tOff||0)+.008);k.p('chest',i%2?'oct':'dod','g',i%2?rn:0xc8a0ff,p[0],p[1],p[2],.011,.013,.008)}
      gkBook(k,'pelvis',.2,.52,.02,1.2,0x2a2050,0xc8b070,1.5);mdKit(B,k)}}};
