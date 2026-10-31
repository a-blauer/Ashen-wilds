// ---------- rigged creatures + hero: skinned meshes, procedural skins, skeletal animation ----------
const RS=new THREE.SphereGeometry(1,16,12),RC=new THREE.ConeGeometry(.5,1,12),RY=new THREE.CylinderGeometry(.5,.5,1,8),RB=new THREE.BoxGeometry(1,1,1),RTO=new THREE.TorusGeometry(1,.06,8,24),HEM=new THREE.SphereGeometry(1,24,14,0,Math.PI*2,0,Math.PI/2);
const RG={},RT={},RM={},SPEC={};
function rcol(st,u,v,B,P,n){
  const mx=(a,b,t)=>{t=Math.max(0,Math.min(1,t));return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]},s=Math.sin(u*6.283),band=v<.5?0:v<.75?1:2,l=band?(v-(band==1?.5:.75))*4:v*2;
  let c=B;
  if(st=='fur'){
    if(band==0){c=mx(B,P.bel,-s*1.4);if(l>.78){c=mx(c,P.bel,(1-Math.abs(s)*2)*.55*Math.min(1,(l-.78)*8));if(l>.955)c=mx(c,P.dk,(l-.955)*22)}}
    else if(band==1)c=mx(B,P.dk,(l-.62)*5);
    else{c=mx(B,P.tip,(l-.8)*7);c=mx(c,P.dk,Math.max(0,1-Math.abs(l-.72)*14)*.4)}
    if(band==0&&l>.8&&l<.9&&Math.abs(Math.cos(u*6.283))>.8)c=mx(c,P.dk,.5);
    if(P.sad&&band==0&&s>.7&&l>.2&&l<.75)c=mx(c,P.sad,(s-.7)*2.2);
    if(n>.93)c=mx(c,P.bel,.2);if(n<.06)c=mx(c,P.dk,.25);
  }else if(st=='scale'){
    const gx=u*(band?28:44),gy=l*(band?20:70),cx=((gx+(Math.floor(gy)%2)*.5)%1)-.5,cy=(gy%1)-.5,d=Math.hypot(cx,cy*1.2);
    c=mx(B,P.dk,(d-.38)*5);{const hq=Math.sin(Math.floor(gx)*12.9898+Math.floor(gy)*78.233)*43758.5453;c=mx(c,P.bel,(hq-Math.floor(hq)-.5)*.35)}if(band==0)c=mx(c,P.bel,-s*1.5-.1);if(band==1)c=mx(c,P.dk,(l-.65)*4);if(band==2)c=mx(c,P.tip,(l-.85)*6);
  }else if(st=='bone'){c=mx(B,P.dk,Math.max(0,Math.abs(Math.sin(l*45+u*18))-.93)*9+n*.12);if(band==1&&l>.7)c=mx(c,P.dk,.4)}
  else if(st=='feather'){c=mx(B,P.bel,-s*1.3);c=mx(c,P.dk,Math.max(0,Math.sin(l*110+Math.abs(s)*7)-.7)*(band?.2:.5));if(band==2)c=mx(c,P.tip,(l-.7)*4)}
  else if(st=='chitin'){c=mx(B,P.bel,(Math.sin(l*60+u*3)*.5+.5)*.18);if(band==0&&l<.55&&s>.5)c=mx(c,P.tip,Math.max(0,1-Math.abs(l-.3)*6)*(s-.5)*2)}
  else if(st=='shroom'){
    if(band!=1){c=mx(P.bel,B,.1+n*.1);c=mx(c,P.dk,Math.max(0,Math.sin(u*40))*.1)}
    else{const gx=u*9,gy=l*5,fx=gx%1-.5,fy=gy%1-.5,h=Math.sin(Math.floor(gx)*12.9+Math.floor(gy)*78.2)*43758,hh=h-Math.floor(h);c=mx(B,P.tip,(hh>.5&&Math.hypot(fx,fy)<.3)?1:0)}
  }else if(st=='ghost'){c=mx(B,P.tip,(1-l)*.5+Math.sin(u*30+l*6)*.08)}
  else if(st=='stone'){c=mx(B,P.dk,Math.max(0,.07-Math.abs(Math.sin(u*38)*Math.sin(v*46)))*9)}
  else if(st=='hero'){
    if(v<.2){const q=v/.2;c=mx(B,P.dk,Math.max(0,1-Math.abs(q-.12)*18));c=mx(c,P.bel,Math.max(0,(q-.93)*10))}
    else if(v<.35)c=mx(P.skin,P.dk,.06);
    else if(v<.5)c=mx(P.cape,[0,0,0],.2+Math.abs(Math.sin(u*40))*.25);
    else if(v<.75){const q=(v-.5)*4;c=mx(P.pants,P.boot,(q-.62)*6)}
    else{const q=(v-.75)*4;c=mx(B,P.skin,(q-.72)*8);c=mx(c,P.dk,Math.max(0,1-Math.abs(q-.62)*20)*.7)}
  }
  return c;
}
function rigTex(S,hex){
  const key=S.id+hex;if(RT[key])return RT[key];
  const N=384,mkC=()=>{const c=document.createElement('canvas');c.width=c.height=N;return c},cv=mkC(),cn2=mkC(),g=cv.getContext('2d'),g2=cn2.getContext('2d'),im=g.createImageData(N,N),nm2=g2.createImageData(N,N),h=new Float32Array(N*N);
  const B=[(hex>>16)&255,(hex>>8)&255,hex&255],fr=(a,b)=>{const x=Math.sin(a*12.9898+b*78.233)*43758.5453;return x-Math.floor(x)},nz=S.pal.nz==null?1:S.pal.nz;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    const n=fr(x*.37,Math.floor(y/2)),n2=fr(Math.floor(x/2),y*.21),v0=y/N,bd=v0<.5?0:v0<.75?1:2,ll=bd?(v0-(bd==1?.5:.75))*4:v0*2,ao=bd==1?1-.2*Math.max(0,1-Math.abs(ll-.33)*10)-.15*Math.max(0,1-Math.abs(ll-.66)*10):bd==0?1-.2*Math.max(0,1-ll*8):1-.15*Math.max(0,1-ll*6),c=rcol(S.st,x/N,v0,B,S.pal,n),f=(1-(1-(.78+.32*n+.12*n2))*nz)*ao,k=(y*N+x)*4;
    h[y*N+x]=n*.7+n2*.3;im.data[k]=c[0]*f;im.data[k+1]=c[1]*f;im.data[k+2]=c[2]*f;im.data[k+3]=255;
  }
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    const k=(y*N+x)*4,dx=h[y*N+(x+1)%N]-h[y*N+(x+N-1)%N],dy=h[((y+1)%N)*N+x]-h[((y+N-1)%N)*N+x],l=Math.hypot(dx*4,dy*4,1);
    nm2.data[k]=(-dx*4/l*.5+.5)*255;nm2.data[k+1]=(-dy*4/l*.5+.5)*255;nm2.data[k+2]=(1/l*.5+.5)*255;nm2.data[k+3]=255;
  }
  g.putImageData(im,0,0);g2.putImageData(nm2,0,0);
  const t1=new THREE.CanvasTexture(cv),t2=new THREE.CanvasTexture(cn2);[t1,t2].forEach(t=>{t.flipY=false;t.anisotropy=4});
  return RT[key]={map:t1,nm:t2};
}
function mkAx(S,bones){
  return (bn,geo,col,px,py,pz,sx,sy,sz,rx,rz,basic)=>{
    const r=S.bones[bn],q=S.T?S.T([px,py,pz]):[px,py,pz];
    const m=new THREE.Mesh(geo,col&&col.isMaterial?col:basic?new THREE.MeshBasicMaterial({color:col}):new THREE.MeshStandardMaterial({color:col,roughness:.35,metalness:0}));
    m.position.set(q[0]-r[1],q[1]-r[2],q[2]-r[3]);m.scale.set(sx||1,sy||1,sz||1);m.rotation.set(rx||0,0,rz||0);m.castShadow=true;bones[bn].add(m);return m;
  };
}
function mkBones(S){
  const bones={},arr=[];
  Object.keys(S.bones).forEach(k=>{const [pa,x,y,z]=S.bones[k],bn=new THREE.Bone(),q=pa?S.bones[pa]:[0,0,0,0];bn.position.set(x-q[1],y-q[2],z-q[3]);bones[k]=bn;arr.push(bn);if(pa)bones[pa].add(bn)});
  return {bones,arr};
}
function mkWing(type,span,chord,col,col2){
  const grp=new THREE.Group();
  if(type=='feather'){
    for(let i=0;i<7;i++){const len=span*(.55+.45*Math.sin((i+1)/7*Math.PI*.8+.3)),f=new THREE.Mesh(RB,new THREE.MeshStandardMaterial({color:i>4?col2:col,roughness:.7}));f.scale.set(len,.012,.09);f.position.set(len/2,0,.02+i*.07);f.rotation.y=.05*i;f.castShadow=true;grp.add(f)}
    for(let i=0;i<6;i++){const f=new THREE.Mesh(RB,new THREE.MeshStandardMaterial({color:col,roughness:.7}));f.scale.set(span*.4,.014,.08);f.position.set(span*.22,.014,.03+i*.075);f.rotation.y=.06*i;f.castShadow=true;grp.add(f)}
  }else{
    const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(span,.04);[[.85,.55],[.7,.28],[.55,.85],[.4,.4],[.22,.9]].forEach(q=>sh.lineTo(span*q[0],chord*q[1]));sh.lineTo(0,chord*.6);sh.lineTo(0,0);
    const gm=new THREE.ShapeGeometry(sh);gm.rotateX(-Math.PI/2);
    const m=new THREE.Mesh(gm,new THREE.MeshStandardMaterial({color:col,roughness:.6,side:THREE.DoubleSide}));m.castShadow=true;grp.add(m);
    const bn=new THREE.Mesh(RY,new THREE.MeshStandardMaterial({color:col2,roughness:.5}));bn.scale.set(.02,span,.02);bn.rotation.z=-Math.PI/2;bn.position.set(span/2,.01,0);grp.add(bn);
    [[.85,.55],[.55,.85],[.22,.9]].forEach(q=>{const x1=span*q[0]-span*.1,z1=chord*q[1],f=new THREE.Mesh(RY,new THREE.MeshStandardMaterial({color:col2,roughness:.5}));f.scale.set(.012,Math.hypot(x1,z1),.012);f.position.set(span*.1+x1/2,.012,z1/2);f.rotation.set(0,-Math.atan2(z1,x1),-Math.PI/2);grp.add(f)});
    const th=new THREE.Mesh(RC,new THREE.MeshStandardMaterial({color:col2,roughness:.5}));th.scale.set(.025,.07,.025);th.position.set(span*.03,.03,-.03);th.rotation.x=-Math.PI/2;grp.add(th);
  }
  return grp;
}
// quadruped template (the Foxlet) that other species reshape
const QB={pelvis:[null,0,.4,-.25],spine:['pelvis',0,.42,-.02],chest:['spine',0,.43,.22],neck:['chest',0,.5,.36],head:['neck',0,.56,.48],jaw:['head',0,.5,.6],tail0:['pelvis',0,.42,-.36],tail1:['tail0',0,.46,-.6],tail2:['tail1',0,.52,-.82],tail3:['tail2',0,.56,-1.0],
 fl0:['chest',-.1,.38,.2],fl1:['fl0',-.1,.2,.22],fl2:['fl1',-.1,.08,.2],fr0:['chest',.1,.38,.2],fr1:['fr0',.1,.2,.22],fr2:['fr1',.1,.08,.2],hl0:['pelvis',-.11,.4,-.25],hl1:['hl0',-.11,.22,-.19],hl2:['hl1',-.11,.1,-.27],hr0:['pelvis',.11,.4,-.25],hr1:['hr0',.11,.22,-.19],hr2:['hr1',.11,.1,-.27]};
function Q(P){
  const sx=P.wx||1,sy=P.hy||1,sz=P.lz||1,sn=P.sn||1,rs=P.rs||1,ls=P.ls||1,ts=P.ts||1,tl=P.tl||1,nk=P.nk||0;
  const T=a=>{const x=a[0],y=a[1],z=a[2];return [x*sx,(y+(z>.3&&y>.45?nk:0))*sy,(z>.5?.5+(z-.5)*sn:z<-.36?-.36+(z+.36)*tl:z)*sz]};
  const bones={};for(const k in QB){const q=QB[k];bones[k]=[q[0]].concat(T([q[1],q[2],q[3]]))}
  const R=(r,f)=>r.map(a=>[a[0]*f,a[1]*f]);
  const lofts=[{c:[[0,.42,-.4],[0,.40,-.25],[0,.42,-.02],[0,.43,.22],[0,.51,.38],[0,.57,.5],[0,.55,.68],[0,.54,.77]].map(T),r:R([[.05,.05],[.15,.15],[.17,.17],[.19,.2],[.1,.11],[.13,.12],[.055,.05],[.012,.01]],rs),b:['pelvis','pelvis','spine','chest','neck','head','head','head'],seg:14,N:40,v:[0,.5]}];
  [['fl',-.1,.2,0],['fr',.1,.2,0],['hl',-.11,-.25,1],['hr',.11,-.25,1]].forEach(a=>{
    const k=a[0],x=a[1],z=a[2],h=a[3];
    lofts.push({c:[[x,h?.4:.38,z],[x,.2+(h?.02:0),z+(h?.06:.02)],[x,h?.1:.08,h?-.27:.2],[x,.015,h?-.21:.26]].map(T),r:R(h?[[.085,.09],[.05,.055],[.03,.032],[.045,.06]]:[[.075,.08],[.045,.05],[.03,.03],[.045,.06]],ls),b:[k+'0',k+'1',k+'2',k+'2'],seg:8,N:14,v:[.5,.25]});
  });
  lofts.push({c:[[0,.42,-.36],[0,.46,-.6],[0,.52,-.82],[0,.56,-1.0]].map(T),r:R([[.05,.05],[.09,.09],[.12,.12],[.03,.03]],ts),b:['tail0','tail1','tail2','tail3'],seg:12,N:20,v:[.75,.25]});
  return {bones:bones,T:T,lofts:lofts,legs:[['fl',0],['hr',0],['fr',Math.PI],['hl',Math.PI]]};
}
const QBK=[['pelvis',.6,-.15],['spine',.6,.05],['chest',.6,.2]];
SPEC.Foxlet=Object.assign(Q({}),{id:'F',st:'fur',pal:{bel:[250,238,218],dk:[40,30,26],tip:[250,238,218]},anim:'quad',sc:.95,hd:[0,.72,.5],bk:QBK,
  sig:(x,C)=>{earsF(x,C);x.ax('tail3',RS,0xfaeeda,0,.56,-1.01,.034,.034,.034)},ex:x=>qface(x,{eye:0xf2a21e,fang:1,wh:1})});
SPEC.Ashwolf=Object.assign(Q({wx:1.1,hy:1.2,lz:1.15,sn:1.35,rs:1.1,ls:1.1,ts:.9}),{id:'A',st:'fur',pal:{bel:[200,205,212],dk:[28,30,36],tip:[40,44,52],sad:[52,56,66]},anim:'quad',sc:1.05,hd:[0,.72,.5],bk:QBK,
  sig:(x,C)=>{earsF(x,C,.8,1.35);[0,1,2,3].forEach(i=>x.ax('neck',RC,0x2a2a32,0,.62,.28+i*.05,.05,.14,.05,-.3));x.ax('tail3',RS,0x2a2d34,0,.56,-1.01,.05,.05,.05)},
  ex:x=>qface(x,{eye:0xd8e040,slit:1,fang:1.4,nose:0x15151a,jaw:0xb0b4ba,es:.9})});
SPEC.Drakelet=Object.assign(Q({lz:1.1,sn:1.2,nk:.12,rs:1.05,ts:1.2,tl:1.15}),{id:'D',st:'scale',pal:{bel:[232,214,150],dk:[40,20,70],tip:[232,214,150],nz:.5},anim:'quad',sc:1.1,hd:[0,.74,.45],bk:QBK,
  sig:(x,C)=>{[-1,1].forEach(s=>{x.ax('head',RC,0xe8d8b0,s*.07,.7,.44,.04,.2,.04,-.7,-s*.25);x.wing('chest',s,.8,.5,0x5a2f90,0xe8d8b0,'bat',.12,.62,.1)});
    [['neck',.62,.4],['chest',.64,.15],['spine',.62,-.1],['pelvis',.58,-.3]].forEach(a=>x.ax(a[0],RC,0xe8d8b0,0,a[1],a[2],.05,.12,.05));x.ax('tail3',RC,0xe8d8b0,0,.56,-1.06,.08,.2,.08,-Math.PI/2)},
  ex:x=>qface(x,{eye:0xff8a20,slit:1,fang:1.2,nose:0x2a1a2a,jaw:0xe0cc90})});
SPEC.Stoneshell=Object.assign(Q({wx:1.15,hy:.6,lz:.85,sn:.6,nk:-.05,rs:1.15,ls:1.2,ts:.5,tl:.6}),{id:'T',st:'scale',pal:{bel:[190,200,170],dk:[40,52,40],tip:[60,70,56],nz:.6},anim:'quad',gs:.6,sc:1.1,hd:[0,.55,.5],bk:[['pelvis',.5,-.15],['spine',.5,.05],['chest',.5,.2]],
  sig:(x,C)=>{const m=x.tex('stone',0x7a7a6a,{dk:[30,30,28],bel:[0,0,0],tip:[0,0,0],nz:.8});x.axm('spine',HEM,m,0,.44,-.02,.36,.3,.5);x.ax('spine',RTO,0x5a5a4e,0,.45,-.02,.36,.5,.36,Math.PI/2)},
  ex:x=>qface(x,{eye:0x222222,es:.6,nose:0x1a2a1a,jaw:0xbac8a0})});
SPEC.Mossfrog=Object.assign(Q({wx:1.3,hy:.62,lz:.7,sn:.55,rs:1.25,ls:1.1,ts:.15,tl:.1}),{id:'M',st:'scale',pal:{bel:[214,232,168],dk:[30,70,30],tip:[214,232,168],nz:.5},anim:'hop',sc:1.1,hd:[0,.55,.45],bk:QBK,
  sig:(x,C)=>{[-1,1].forEach(s=>x.ax('head',RS,C,s*.085,.67,.5,.062,.062,.062));[[.1,.6,-.1],[-.1,.62,0],[.05,.6,.1]].forEach(a=>x.ax('spine',RS,0x3a7a2a,a[0],a[1],a[2],.03,.03,.03))},
  ex:x=>{[-1,1].forEach(s=>{x.ax('head',RS,0xe8c030,s*.09,.675,.54,.04,.04,.04);x.ax('head',RS,0x0b0b0b,s*.095,.675,.575,.03,.012,.012)});x.ax('head',RY,0x1c2a16,0,.535,.6,.004,.2,.004,0,Math.PI/2);x.ax('jaw',RS,0xcfe0a0,0,.49,.58,.06,.04,.07)}});
SPEC.Boneling=Object.assign(Q({wx:.85,hy:1.05,rs:.55,ls:.5,ts:.7,sn:.9}),{id:'B',st:'bone',pal:{bel:[232,224,200],dk:[90,84,70],tip:[232,224,200],nz:.5},anim:'quad',sc:1.05,hd:[0,.7,.5],bk:QBK,
  sig:(x,C)=>{[0,1,2,3].forEach(i=>x.ax('chest',RTO,0xe8e0c8,0,.45,.05+i*.07,.17,.17,.17))},
  ex:x=>{for(let i=0;i<8;i++)x.ax('spine',RS,0xe8e0c8,0,.58,-.3+i*.09,.025,.025,.025);[-1,1].forEach(s=>{x.ax('head',RS,0x0a0a0a,s*.07,.6,.57,.04,.045,.03);x.ax('head',RS,0x6aff9a,s*.07,.6,.59,.02,.02,.02,0,0,1)});x.ax('jaw',RS,0xe8e0c8,0,.505,.665,.04,.02,.08)}});
SPEC.Batwing=Object.assign(Q({wx:.75,hy:.7,lz:.8,sn:.45,rs:.9,ls:.55,ts:.5,tl:.6}),{id:'V',st:'fur',pal:{bel:[120,104,140],dk:[26,20,34],tip:[40,30,50]},anim:'fly',sc:1.1,hd:[0,.72,.5],bk:QBK,
  sig:(x,C)=>{earsF(x,C,1.4,2.2);[-1,1].forEach(s=>x.wing('chest',s,.95,.55,0x3a2f4a,0x1a1420,'bat',.12,.6,.1))},
  ex:x=>{qface(x,{eye:0xff3030,fang:1.3,nose:0x2a1a30,jaw:0x5a4a6a});x.ax('head',RC,0x3a2a40,0,.59,.77,.04,.06,.02,Math.PI/2)}});
(function(){ // Skyhawk: bird
  const bones={pelvis:[null,0,.55,-.1],spine:['pelvis',0,.6,.08],chest:['spine',0,.66,.2],neck:['chest',0,.78,.3],head:['neck',0,.86,.38],jaw:['head',0,.82,.5],tail0:['pelvis',0,.55,-.25],tail1:['tail0',0,.52,-.4],tail2:['tail1',0,.5,-.52],tail3:['tail2',0,.48,-.62],
    hl0:['pelvis',-.07,.5,-.02],hl1:['hl0',-.07,.3,.02],hl2:['hl1',-.07,.1,-.02],hr0:['pelvis',.07,.5,-.02],hr1:['hr0',.07,.3,.02],hr2:['hr1',.07,.1,-.02]};
  const leg=(k,x)=>({c:[[x,.5,-.02],[x,.3,.02],[x,.1,-.02],[x,0,.06]],r:[[.045,.05],[.03,.03],[.022,.022],[.03,.05]],b:[k+'0',k+'1',k+'2',k+'2'],seg:8,N:12,v:[.5,.25]});
  SPEC.Skyhawk={id:'S',st:'feather',pal:{bel:[242,234,212],dk:[24,34,64],tip:[18,22,38],nz:.7},anim:'quad',sc:1.1,hd:[0,.92,.38],bk:[['spine',.7,.08],['chest',.76,.2],['neck',.86,.3]],bones:bones,legs:[['hl',0],['hr',Math.PI]],
    lofts:[{c:[[0,.52,-.3],[0,.55,-.1],[0,.6,.1],[0,.66,.22],[0,.78,.3],[0,.86,.38],[0,.86,.47]],r:[[.03,.03],[.12,.12],[.16,.16],[.15,.15],[.07,.07],[.075,.07],[.045,.04]],b:['tail0','pelvis','spine','chest','neck','head','head'],seg:14,N:36,v:[0,.5]},leg('hl',-.07),leg('hr',.07)],
    sig:(x,C)=>{[-1,1].forEach(s=>x.wing('chest',s,.6,.3,C,0x1a2e58,'feather',.13,.7,.12));[-2,-1,0,1,2].forEach(i=>x.ax('tail2',RB,i%2?0x24427a:0x1a2e58,i*.04,.5,-.62,.06,.012,.3));[-1,0,1].forEach(i=>x.ax('head',RC,0x1a2e58,i*.03,.95,.34,.03,.1,.03,-.5))},
    ex:x=>{[-1,1].forEach(s=>{x.ax('head',RS,x.red?0xff2a2a:0xf2c21e,s*.07,.88,.41,.028,.028,.028,0,0,x.red);x.ax('head',RS,0x0b0b0b,s*.083,.88,.425,.012,.012,.008);[-.02,0,.02].forEach(o=>x.ax(s<0?'hl2':'hr2',RC,0x2a2a2a,s*.07+o,.02,.1,.012,.06,.012,Math.PI/2))});
      x.ax('head',RC,0xf0a030,0,.84,.54,.05,.12,.04,Math.PI/2);x.ax('jaw',RC,0xd88a20,0,.81,.54,.04,.09,.03,Math.PI/2)}};
})();
(function(){ // Cryptspider: eight legs
  const bones={pelvis:[null,0,.42,-.15],spine:['pelvis',0,.38,.05],chest:['spine',0,.4,.22],neck:['chest',0,.4,.33],head:['neck',0,.4,.4],jaw:['head',0,.36,.46],tail0:['pelvis',0,.42,-.3],tail1:['tail0',0,.44,-.45],tail2:['tail1',0,.44,-.55],tail3:['tail2',0,.43,-.62]};
  const lofts=[{c:[[0,.4,-.62],[0,.44,-.42],[0,.43,-.15],[0,.38,.05],[0,.4,.22],[0,.4,.36],[0,.38,.47]],r:[[.03,.03],[.2,.2],[.26,.26],[.12,.12],[.14,.13],[.1,.1],[.02,.02]],b:['tail3','tail1','pelvis','spine','chest','head','head'],seg:14,N:36,v:[0,.5]}],legs=[];
  [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{
    const z=[.26,.14,.02,-.1][i],dz=[.38,.14,-.14,-.38][i],k=(s<0?'a':'b')+i,pa=i<2?'chest':'spine';
    bones[k+'0']=[pa,s*.1,.4,z];bones[k+'1']=[k+'0',s*.4,.58,z+dz*.3];bones[k+'2']=[k+'1',s*.62,.3,z+dz*.7];
    lofts.push({c:[[s*.1,.4,z],[s*.4,.58,z+dz*.3],[s*.62,.3,z+dz*.7],[s*.7,0,z+dz]],r:[[.045,.045],[.032,.032],[.026,.026],[.012,.012]],b:[k+'0',k+'1',k+'2',k+'2'],seg:8,N:14,v:[.5,.25],ref:[0,0,1]});
    legs.push([k,(i+(s<0?0:1))%2?Math.PI:0]);
  }));
  SPEC.Cryptspider={id:'P',st:'chitin',pal:{bel:[90,80,110],dk:[10,8,14],tip:[200,30,30],nz:.5},anim:'spider',sc:1.1,hd:[0,.52,.4],bk:[['pelvis',.62,-.15],['spine',.5,.05],['chest',.54,.22]],bones:bones,lofts:lofts,legs:legs,
    sig:(x,C)=>{[-1,1].forEach(s=>x.ax('jaw',RC,0xe8e0d0,s*.03,.34,.5,.015,.06,.015,Math.PI))},
    ex:x=>{[-1,1].forEach(s=>[[.03,.45,.46],[.07,.43,.45],[.045,.41,.47],[.02,.41,.48]].forEach(a=>x.ax('head',RS,x.red?0xff7a2a:0xff3030,s*a[0],a[1],a[2],.018,.018,.018,0,0,1)))}};
})();
(function(){ // Gloomcap: walking mushroom
  const leg=(k,x,y,z)=>({c:[[x,y,z],[x,y*.45,z+.01],[x,.03,z],[x,0,z+.05]],r:[[.06,.06],[.05,.05],[.045,.045],[.05,.07]],b:[k+'0',k+'1',k+'2',k+'2'],seg:8,N:10,v:[.75,.25]});
  const arm=(k,x)=>({c:[[x,.56,.02],[x*1.4,.46,.05],[x*1.55,.38,.08]],r:[[.035,.035],[.03,.03],[.035,.035]],b:[k+'0',k+'1',k+'2'],seg:8,N:10,v:[.75,.25]});
  SPEC.Gloomcap={id:'G',st:'shroom',pal:{bel:[222,210,184],dk:[150,130,110],tip:[246,240,230],nz:.5},anim:'waddle',sc:1.2,hd:[0,1.0,0],bk:[['pelvis',.3,-.1],['spine',.5,-.1],['chest',.66,-.1]],
    bones:{pelvis:[null,0,.28,0],spine:['pelvis',0,.42,0],chest:['spine',0,.58,0],neck:['chest',0,.7,0],head:['neck',0,.78,.03],jaw:['head',0,.6,.12],tail0:['pelvis',0,.25,-.1],tail1:['tail0',0,.2,-.18],tail2:['tail1',0,.15,-.26],tail3:['tail2',0,.1,-.34],
      hl0:['pelvis',-.07,.2,0],hl1:['hl0',-.07,.09,.01],hl2:['hl1',-.07,.03,0],hr0:['pelvis',.07,.2,0],hr1:['hr0',.07,.09,.01],hr2:['hr1',.07,.03,0],
      fl0:['chest',-.12,.56,.02],fl1:['fl0',-.17,.46,.05],fl2:['fl1',-.19,.38,.08],fr0:['chest',.12,.56,.02],fr1:['fr0',.17,.46,.05],fr2:['fr1',.19,.38,.08]},
    legs:[['hl',0],['hr',Math.PI],['fl',Math.PI],['fr',0]],
    lofts:[{c:[[0,.02,0],[0,.2,0],[0,.45,0],[0,.62,0],[0,.74,0]],r:[[.12,.12],[.14,.14],[.12,.12],[.1,.1],[.08,.08]],b:['pelvis','pelvis','spine','chest','neck'],seg:14,N:24,v:[0,.5]},
      {c:[[0,.66,0],[0,.74,0],[0,.86,0],[0,.97,0],[0,1.02,0]],r:[[.12,.12],[.3,.3],[.3,.3],[.14,.14],[.01,.01]],b:['neck','head','head','head','head'],seg:16,N:24,v:[.5,.25]},
      leg('hl',-.07,.2,0),leg('hr',.07,.2,0),arm('fl',-.12),arm('fr',.12)],
    sig:(x,C)=>{[-1,1].forEach(s=>x.ax('chest',RS,0xff9ab0,s*.075,.55,.085,.02,.012,.01))},
    ex:x=>{[-1,1].forEach(s=>{x.ax('chest',RS,x.red?0xff2a2a:0x1a1220,s*.045,.6,.095,.03,.04,.02,0,0,x.red);x.ax('chest',RS,0xffffff,s*.05,.612,.108,.008,.008,.006,0,0,1)});x.ax('chest',RS,0x2a1018,0,.535,.105,.04,.012,.015);x.ax('chest',RS,0xff9ab0,-.075,.55,.085,.02,.012,.01);x.ax('chest',RS,0xff9ab0,.075,.55,.085,.02,.012,.01)}};
})();
(function(){ // Wispling: floating ghost
  SPEC.Wispling={id:'W',st:'ghost',pal:{tip:[255,255,255],nz:.3},anim:'float',sc:1.1,hd:[0,1.1,0],bk:[['chest',.8,-.1],['spine',.65,-.1],['pelvis',.5,-.1]],legs:[],
    bones:{pelvis:[null,0,.5,0],spine:['pelvis',0,.62,0],chest:['spine',0,.75,0],neck:['chest',0,.88,0],head:['neck',0,.96,.02],jaw:['head',0,.9,.1],tail0:['pelvis',0,.4,-.05],tail1:['tail0',0,.26,-.12],tail2:['tail1',0,.14,-.2],tail3:['tail2',0,.04,-.3],
      fl0:['chest',-.14,.8,0],fl1:['fl0',-.2,.7,.04],fl2:['fl1',-.22,.6,.08],fr0:['chest',.14,.8,0],fr1:['fr0',.2,.7,.04],fr2:['fr1',.22,.6,.08]},
    lofts:[{c:[[0,1.06,0],[0,.97,0],[0,.82,0],[0,.62,0],[0,.4,-.05],[0,.24,-.12],[0,.1,-.22],[0,.02,-.32]],r:[[.01,.01],[.13,.13],[.16,.15],[.15,.14],[.11,.1],[.07,.06],[.04,.03],[.005,.005]],b:['head','head','chest','spine','tail0','tail1','tail2','tail3'],seg:14,N:32,v:[0,.5]},
      {c:[[-.14,.8,0],[-.2,.7,.04],[-.22,.6,.08]],r:[[.04,.04],[.03,.03],[.012,.012]],b:['fl0','fl1','fl2'],seg:8,N:10,v:[.75,.25]},{c:[[.14,.8,0],[.2,.7,.04],[.22,.6,.08]],r:[[.04,.04],[.03,.03],[.012,.012]],b:['fr0','fr1','fr2'],seg:8,N:10,v:[.75,.25]}],
    sig:(x,C)=>{x.ax('tail3',RS,0xbfeaff,0,.04,-.32,.05,.05,.05,0,0,1)},
    ex:x=>{[-1,1].forEach(s=>{x.ax('head',RS,0x05080c,s*.05,.99,.12,.04,.05,.03);x.ax('head',RS,x.red?0xff2a2a:0x7fe8ff,s*.05,.99,.14,.018,.022,.01,0,0,1)});x.ax('head',RS,0x05080c,0,.92,.13,.025,.03,.015)}};
})();
(function(){ // Gravewyrm: serpent
  SPEC.Gravewyrm={id:'Y',st:'scale',pal:{bel:[196,190,130],dk:[18,34,20],tip:[130,150,90],nz:.5},anim:'slither',sc:1.15,hd:[0,.45,.55],bk:[['pelvis',.42,-.25],['spine',.46,0],['chest',.45,.2]],legs:[],
    bones:{pelvis:[null,0,.25,-.25],spine:['pelvis',0,.26,0],chest:['spine',0,.28,.2],neck:['chest',0,.3,.38],head:['neck',0,.32,.5],jaw:['head',0,.27,.6],tail0:['pelvis',0,.24,-.5],tail1:['tail0',0,.22,-.78],tail2:['tail1',0,.2,-1.05],tail3:['tail2',0,.18,-1.35]},
    lofts:[{c:[[0,.2,-1.6],[0,.2,-1.35],[0,.22,-1.05],[0,.23,-.78],[0,.25,-.5],[0,.26,-.25],[0,.28,0],[0,.28,.2],[0,.3,.38],[0,.33,.5],[0,.3,.66],[0,.28,.78]],r:[[.01,.01],[.05,.05],[.1,.1],[.14,.14],[.17,.17],[.19,.19],[.19,.19],[.17,.17],[.12,.12],[.13,.11],[.07,.06],[.015,.015]],b:['tail3','tail3','tail2','tail1','tail0','pelvis','spine','chest','neck','head','head','head'],seg:12,N:64,v:[0,.5]}],
    sig:(x,C)=>{[-1,1].forEach(s=>x.ax('head',RC,0xd8d0b8,s*.1,.46,.5,.035,.18,.035,-.8,-s*.3))},
    ex:x=>{[-1,1].forEach(s=>{x.ax('head',RS,x.red?0xff2a2a:0xe8c020,s*.09,.38,.56,.03,.03,.03,0,0,x.red);x.ax('head',RS,0x0b0b0b,s*.1,.38,.58,.008,.026,.01)});
      [0,1,2,3,4].forEach(i=>x.ax(['pelvis','spine','chest','neck','pelvis'][i],RC,0xd8d0b8,0,.46+(i%2)*.01,[-.3,0,.2,.38,-.15][i],.04,.1,.04));
      x.ax('jaw',RC,0xd04a6a,0,.27,.8,.012,.1,.012,Math.PI/2)}};
})();
// bake many small parts into skinned meshes (few draw calls, cached per look)
const BK={},LMAT=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.45,metalness:0,skinning:true}),BMAT=new THREE.MeshBasicMaterial({vertexColors:true,skinning:true});
const RSL=new THREE.SphereGeometry(1,8,6),RCL=new THREE.ConeGeometry(.5,1,6),RYL=new THREE.CylinderGeometry(.5,.5,1,5),RHX=new THREE.CylinderGeometry(1,1,1,6);
function bakeMesh(parts,O,key,basic){
  const list=parts.filter(p=>!!p.basic==basic);if(!list.length)return null;
  const k=key+basic;let G=BK[k];
  if(!G){
    const P=[],Nn=[],Cc=[],SI=[],SW=[],IX=[];let off=0;
    list.forEach(p=>{
      let geo=p.geo;if(Math.max(p.sx,p.sy,p.sz)<.05)geo=geo===RS?RSL:geo===RC?RCL:geo===RY?RYL:geo;
      const pa=geo.attributes.position.array,na=geo.attributes.normal.array,ix=geo.index?geo.index.array:null,cnt=pa.length/3,col=new THREE.Color(p.col),bi=O.indexOf(p.bn);
      const cz=Math.cos(p.rz),sz=Math.sin(p.rz),cx=Math.cos(p.rx),sx=Math.sin(p.rx);
      for(let i=0;i<cnt;i++){
        const a=pa[i*3]*p.sx,b=pa[i*3+1]*p.sy,c=pa[i*3+2]*p.sz,a1=a*cz-b*sz,b1=a*sz+b*cz;
        P.push(a1+p.x,b1*cx-c*sx+p.y,b1*sx+c*cx+p.z);
        const u=na[i*3]/p.sx,w=na[i*3+1]/p.sy,q=na[i*3+2]/p.sz,n1=u*cz-w*sz,m1=u*sz+w*cz,m2=m1*cx-q*sx,n3=m1*sx+q*cx,l=Math.hypot(n1,m2,n3)||1;
        Nn.push(n1/l,m2/l,n3/l);Cc.push(col.r,col.g,col.b);if(p.bw){for(let j=0;j<4;j++){const e=p.bw[j];SI.push(e?Math.max(0,O.indexOf(e[0])):0);SW.push(e?e[1]:0)}}else{SI.push(bi,0,0,0);SW.push(1,0,0,0)} // v183: p.bw [[bone, weight]..] skins a part like the body under it
      }
      if(ix)for(let i=0;i<ix.length;i++)IX.push(ix[i]+off);else for(let i=0;i<cnt;i++)IX.push(i+off);
      off+=cnt;
    });
    G=new THREE.BufferGeometry();
    G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));G.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
    G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4));G.setIndex(IX);BK[k]=G;
  }
  const m=new THREE.SkinnedMesh(G,basic?BMAT:LMAT);m.castShadow=!basic;m.frustumCulled=false;return m;
}
// detail layers: toes, claws, teeth, brows, tufts, plates, spines ...
const TOE=[['fl2',-.1,.26],['fr2',.1,.26],['hl2',-.11,-.21],['hr2',.11,-.21]];
SPEC.Foxlet.dt=(x,C)=>qdt(x,{tuft:C,ruff:0xfaeeda,ttuft:C});
SPEC.Ashwolf.dt=(x,C)=>qdt(x,{tuft:C,ruff:0xc8ccd4,ttuft:0x2a2d34,claw:0x1a1a1e});
SPEC.Batwing.dt=(x,C)=>{qdt(x,{tuft:0x6a5a7a,ruff:0x786a88,claw:0x1a1420,tooth:0xffffff});[-1,1].forEach(s=>x.ax('head',RC,0x8a6a9a,s*.03,.6,.77,.03,.05,.015,Math.PI/2))};
SPEC.Drakelet.dt=(x,C)=>qdt(x,{claw:0x2a2030,cl:1.4,ridge:0xe8d8b0,frill:0x8a4fd0,tooth:0xf0e8d0,toe:C});
SPEC.Stoneshell.dt=(x,C)=>{
  qdt(x,{claw:0x3a3a30,cl:1.5,ridge:0x5a6a4a,tooth:0xd8d8c0});
  const dy=(a,b)=>.264+.3*Math.sqrt(Math.max(0,1-(a/.36)**2-(b/.5)**2));
  [[0,0],[-.2,0],[.2,0],[0,.25],[0,-.25],[-.22,.15],[.22,.15],[-.22,-.15],[.22,-.15],[0,.38]].forEach(q=>x.axw('spine',RHX,0x8a8a76,q[0],dy(q[0],q[1])+.005,q[1]-.017,.1,.02,.1));
  [[.1,.1],[-.15,-.2],[.2,-.05]].forEach(q=>x.axw('spine',RS,0x4a7a3a,q[0],dy(q[0],q[1]),q[1]-.017,.07,.025,.06));
  for(let i=0;i<10;i++){const a=i*.628;x.axw('spine',RC,0x6a6a58,Math.cos(a)*.37,.27,Math.sin(a)*.5-.017,.035,.1,.035)}
};
SPEC.Mossfrog.dt=(x,C)=>{
  qdt(x,{noclaw:1,toe:C,tooth:C});
  TOE.forEach(f=>x.ax(f[0],RS,C,f[1],.012,f[2]+.05,.05,.006,.045));
  [-1,1].forEach(s=>x.ax('head',RS,C,s*.085,.705,.5,.065,.02,.065));
};
SPEC.Boneling.dt=(x,C)=>{
  qdt(x,{claw:0xe8e0c8,toe:0xe8e0c8,tooth:0xffffff,brow:0xe8e0c8});
  [4,5].forEach(i=>x.ax('chest',RTO,0xe8e0c8,0,.45,.05+i*.07,.17,.17,.17));
  x.ax('chest',RB,0xe8e0c8,0,.33,.22,.02,.02,.3);x.ax('pelvis',RTO,0xe8e0c8,0,.4,-.25,.14,.14,.2);
  [-1,1].forEach(s=>x.ax('chest',RS,0xd8d0b8,s*.14,.55,.18,.05,.08,.02));x.ax('chest',RS,0x6aff9a,0,.45,.1,.05,.05,.05,0,0,1);
};
SPEC.Skyhawk.dt=(x,C)=>{
  [-1,1].forEach(s=>{x.ax('head',RS,C,s*.07,.915,.4,.04,.014,.03);x.ax('head',RS,0x050505,s*.012,.86,.545,.006,.006,.006);x.ax('chest',RC,0xf2eadb,s*.06,.6,.3,.04,.1,.04,Math.PI);x.ax(s<0?'hl0':'hr0',RS,C,s*.08,.46,-.02,.06,.09,.07)});
  [-3,3].forEach(i=>x.ax('tail2',RB,0x24427a,i*.035,.5,-.6,.06,.012,.28));
  [['hl2',-.07],['hr2',.07]].forEach(f=>{x.ax(f[0],RC,0x2a2a2a,f[1],.02,-.04,.012,.05,.012,-Math.PI/2);[-.02,0,.02].forEach(o=>x.ax(f[0],RS,0xc8a060,f[1]+o,.015,.07,.014,.012,.03))});
};
SPEC.Cryptspider.dt=(x,C)=>{
  [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{
    const z=[.26,.14,.02,-.1][i],dz=[.38,.14,-.14,-.38][i],k=(s<0?'a':'b')+i,p=[[s*.4,.58,z+dz*.3],[s*.62,.3,z+dz*.7],[s*.7,0,z+dz]];
    x.axw(k+'1',RS,0x14101a,p[0][0],p[0][1],p[0][2],.045,.045,.045);x.axw(k+'2',RS,0x14101a,p[1][0],p[1][1],p[1][2],.036,.036,.036);
    [.3,.6,.85].forEach(t=>x.axw(k+'1',RC,0x2a2030,p[0][0]+(p[1][0]-p[0][0])*t,p[0][1]+(p[1][1]-p[0][1])*t+.02,p[0][2]+(p[1][2]-p[0][2])*t,.008,.05,.008,(i%2?.3:-.3),0));
    x.axw(k+'2',RC,0x14101a,p[2][0],p[2][1]+.02,p[2][2],.012,.05,.012,Math.PI);
  }));
  [-1,1].forEach(s=>{x.axw('head',RC,0x2a2030,s*.05,.4,.5,.02,.07,.02,Math.PI/2,0);x.axw('head',RS,0x2a2030,s*.07,.36,.5,.02,.02,.04)});
  [-1,0,1].forEach(i=>x.axw('tail3',RC,0x2a2030,i*.03,.41,-.66,.02,.07,.02,-Math.PI/2));
};
SPEC.Gloomcap.dt=(x,C)=>{
  [.2,.24,.27].forEach((r,i)=>x.axw('head',RTO,0xd8c8b0,0,.7-.01*i,0,r,r,.35,Math.PI/2));x.axw('chest',RTO,0xe8dcc0,0,.52,0,.15,.15,.7,Math.PI/2);
  for(let i=0;i<6;i++){const a=i*1.05;x.axw('pelvis',RC,0xc8b890,Math.cos(a)*.14,.03,Math.sin(a)*.14,.02,.09,.02,Math.PI)}
  [[.1,.95,.1],[-.15,.93,-.12],[.18,.88,-.05],[0,1.0,.15]].forEach(q=>x.axw('head',RS,0xf6f0e6,q[0],q[1],q[2],.03,.015,.03));
  for(let i=0;i<7;i++)x.axw('head',RS,0xf0f8d0,Math.cos(i*.9)*.2,1.05+((i*.37)%.12),Math.sin(i*.9)*.2,.008,.008,.008,0,0,1);
};
SPEC.Wispling.dt=(x,C)=>{
  x.axw('chest',RS,0xbfffff,0,.75,.02,.05,.05,.05,0,0,1);
  [-2,-1,0,1,2].forEach(i=>x.axw('head',RC,0x9fe8ff,i*.04,1.1,0,.03,.1+.03*(2-Math.abs(i)),.03,0,0,1));
  [[.28,.9,.1],[-.3,.7,0],[.2,.55,-.15]].forEach(q=>x.axw('chest',RS,0xbfffff,q[0],q[1],q[2],.03,.03,.03,0,0,1));
};
SPEC.Gravewyrm.dt=(x,C)=>{
  [[.35,.44,'chest'],[.2,.46,'chest'],[0,.47,'spine'],[-.2,.45,'pelvis'],[-.4,.43,'pelvis'],[-.6,.4,'tail0'],[-.8,.36,'tail1'],[-1.0,.32,'tail1'],[-1.2,.27,'tail2']].forEach((a,i)=>x.axw(a[2],RC,0xd8d0b8,0,a[1],a[0],.05-i*.003,.16-i*.008,.05-i*.003));
  [-1,1].forEach(s=>{[0,1,2,3].forEach(i=>{x.axw('head',RC,0xf4efe4,s*.045,.31,.54+i*.05,.01,.035,.01,Math.PI);x.axw('jaw',RC,0xf4efe4,s*.04,.29,.58+i*.04,.01,.03,.01)});x.axw('head',RC,0x8a9a5a,s*.12,.36,.46,.04,.14,.04,-Math.PI/2,-s*.7);x.axw('head',RB,0xc8c0a0,s*.07,.42,.58,.05,.02,.06)});
  [0,1,2].forEach(i=>x.axw('tail3',RS,0xd8d0b8,0,.19,-1.38-.06*i,.035,.03,.04));
};
SPEC.Mossfrog.rough=.45;SPEC.Drakelet.rough=.6;SPEC.Stoneshell.rough=.75;SPEC.Stoneshell.ns=1.4;SPEC.Boneling.rough=.6;SPEC.Boneling.ns=1.2;SPEC.Cryptspider.rough=.35;SPEC.Gloomcap.rough=.7;SPEC.Gravewyrm.rough=.55;
function crRig(c,n){
  const S=SPEC[n],g=new THREE.Group(),b=new THREE.Group();g.add(b);g.b=b;g.legs=[];g.wings=[];g.tails=[];
  const mb=mkBones(S),bones=mb.bones,C=c.cl[0],O=Object.keys(S.bones),mesh=new THREE.SkinnedMesh(rigGeo(S),rigMat(S,C,c.v));
  mesh.castShadow=true;mesh.frustumCulled=false;mesh.add(bones.pelvis);b.add(mesh);mesh.updateMatrixWorld(true);
  const sk=new THREE.Skeleton(mb.arr);mesh.bind(sk);
  const parts=[],vparts=[],axm=mkAx(S,bones);
  const bax=(L,raw)=>(bn,geo,col,px,py,pz,sx,sy,sz,rx,rz,basic)=>{const r=(S.T&&!raw)?S.T([px,py,pz]):[px,py,pz];L.push({bn:bn,geo:geo,col:col,x:r[0],y:r[1],z:r[2],sx:sx||1,sy:sy||1,sz:sz||1,rx:rx||0,rz:rz||0,basic:basic})};
  const ax=bax(parts),vax=bax(vparts),x={g:g,b:b,C:C,bones:bones,spec:S,ears:[],wings:[],red:c.v=='Shadow',ax:ax,axw:bax(parts,true),axm:axm,
    tex:(st,hex,pal)=>{const sp={id:'x'+st,st:st,pal:pal},t=rigTex(sp,hex);return new THREE.MeshStandardMaterial({map:t.map,normalMap:t.nm,roughness:.9})},
    wing:(bn,s,span,chord,col,col2,type,px,py,pz)=>{
      const grp=mkWing(type,span,chord,col,col2);if(s<0)grp.scale.x=-1;const p=new THREE.Group();p.add(grp);
      const r=S.bones[bn],q=S.T?S.T([s*px,py,pz]):[s*px,py,pz];p.position.set(q[0]-r[1],q[1]-r[2],q[2]-r[3]);bones[bn].add(p);x.wings.push({p:p,s:s,base:.35,amp:.55});return p;
    }};
  S.ex(x,C,c);if(S.sig)S.sig(x,C,c);if(S.dt)S.dt(x,C,c);
  c.g.slice(1).forEach((o,i)=>{const so=SPEC[rigOf(o)];if(so&&so.sig)so.sig(x,c.cl[i+1]||C,c)});
  const hd=S.hd,bk=S.bk;
  if(c.tr=='Horned')[-1,1].forEach(s=>vax('head',RC,0xe8e0c8,hd[0]+s*.06,hd[1],hd[2],.035,.12,.035,-.5,-s*.35));
  if(c.tr=='Spiked')bk.forEach(a=>vax(a[0],RC,0x3a3a44,0,a[1],a[2],.04,.1,.04));
  if(c.tr=='Armored')bk.slice(0,2).forEach(a=>vax(a[0],RS,0x6a6a78,0,a[1]-.02,a[2],.16,.05,.1));
  if(c.tr=='Bulky')b.scale.set(1.18,1.08,1.1);
  if(c.v=='Ember'){vax(bk[0][0],RC,0xff8a2a,0,bk[0][1]+.04,bk[0][2],.08,.2,.08,0,0,1);vax(bk[1][0],RC,0xffc040,0,bk[1][1]+.04,bk[1][2],.07,.16,.07,0,0,1)}
  if(c.v=='Frost')bk.forEach(a=>vax(a[0],RC,0xe8fbff,0,a[1]+.03,a[2],.05,.14,.05,0,0,1));
  if(c.v=='Golden')vax('head',new THREE.TorusGeometry(.12,.012,8,24),0xffd84a,hd[0],hd[1]+.06,hd[2]-.04,1,1,1,Math.PI/2,0,1);
  if(c.tr=='Universal'){vax('head',new THREE.TorusGeometry(.14,.01,8,24),0x7cf0ff,hd[0],hd[1]+.1,hd[2]-.04,1,1,1,Math.PI/2,0,1);[0,1,2].forEach(i=>vax('head',RS,[0xff6a9a,0x7cf0ff,0xffe36a][i],hd[0]+Math.cos(i*2.1)*.14,hd[1]+.1,hd[2]-.04+Math.sin(i*2.1)*.14,.018,.018,.018,0,0,1))}
  crOrn(c,vax,bk,hd);
  [['b|'+c.g.join()+'|'+c.cl.join()+'|'+(x.red?1:0),parts],['v|'+n+'|'+c.v+'|'+c.tr+'|'+ornLv(c)+'|'+famOf(c.g[0]),vparts]].forEach(a=>[false,true].forEach(bs=>{
    const m=bakeMesh(a[1],O,a[0],bs);if(m){b.add(m);m.updateMatrixWorld(true);m.bind(sk)}
  }));
  g.rig=(now,mv,sp)=>rigAnim(x,now,mv,sp);
  g.bs=(S.sc||1)*(1+.04*(c.f||0))*c.z*(SP2[c.g[0]]?1+.12*(SP2[c.g[0]][1]-1):1)*(1+.06*(c.evo||0));g.scale.setScalar(g.bs);return g;
}

