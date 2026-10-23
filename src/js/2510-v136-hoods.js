// ================= v136: hoods and cowls hung as cloth (every race) =================
// Every hood-style head piece (Ranger: hood, pelt, cowl, skullhood, wind, deadeye · Assassin: ashcowl, stormhood, dusk ·
// Mage: linen, tallcowl, star) is now a gkHood: measured round the head, ears, neck, collar and shoulder armour that are
// already built, hanging from the crown, open round the face, gathered in folds at the neck and spread into a mantle.
// The pieces that sit on the hood (masks, skulls, bands, charms) are built by the style itself (GK_HOOD[st].pre runs at once,
// before the hood is measured; .post gets the built hood).
var GK_HOOD={},GK_HELM={};
{const f=brHelm;brHelm=function(B,P,d){const S=d&&(GK_HOOD[d.st]||GK_HELM[d.st]);if(!S||!BR.R||(S.race&&S.race!=BR.R.key))return f.apply(this,arguments);const D=BR.R,k=dkKit();
  const X={B,P,d,k,D,st:d.st,M:d.M,A:d.A,G:d.G,T:d.T==null?MD_TRIM[d.ti|0]:d.T,lv:d.lv|0,ti:d.ti|0,r:d.r|0,cls:BR.R.cls};
  if(S.pre)S.pre(X);mdKit(B,k);if(!S.hood)return;P.gkHoodOn=1;
  gkLater(B,B2=>{const k2=dkKit(),X2=Object.assign({},X,{B:B2,k:k2});const Hd=gkHood(B2,P,S.hood(X2));if(S.post)S.post(X2,Hd);mdKit(B2,k2)})}}
// shared looks
function gkHoodBase(X,o){const D=X.D,raven=D.key=='raven',cat=D.key=='cat';return Object.assign({col:X.M,lin:mdSh(X.M,.42),trim:mdSh(X.M,.72),
  yHem:raven?.86:.89,yHemF:raven?.93:.955,clear:.018,loose:.035,folds:[7,.014],open:raven?.42:null,close:raven?null:D.EYEP[1]-.16,over:.035,
  dag:[.035],tip:{len:.15,r:.036}},o||{})}
GK_HOOD.hood={hood:X=>gkHoodBase(X)};
GK_HOOD.ashcowl={hood:X=>gkHoodBase(X,{dag:[.05],tip:false})};
GK_HOOD.linen={hood:X=>gkHoodBase(X)};
// ---------------- the Ranger's hoods (the weasel) ----------------
GK_HOOD.hood={hood:X=>gkHoodBase(X,{col:X.M,lin:mdSh(X.M,.38),trim:mdSh(X.M,.7),dag:[.04],tip:false,loose:.025})};
// a wolf-pelt hood: the wolf's ears on the crown, its upper jaw over the brow, the forepaws hanging down the chest
GK_HOOD.pelt={hood:X=>gkHoodBase(X,{col:X.M,lin:mdSh(X.M,.35),trim:mdSh(X.M,.85),dag:[.06],tip:false,loose:.025,folds:[9,.018],
    pat:(m,c)=>Math.floor(m.i*1.3+m.j*.7)%3==0?mdSh(c,1.15):Math.floor(m.i+m.j*1.7)%4==0?mdSh(c,.82):c}),
  post:(X,Hd)=>{const {k,M}=X,fur=M,dkf=mdSh(M,.7),top=Hd.G[Hd.nr-1],fr=gkHoodAt(Hd,Hd.ys[Hd.nr-1]-.02,.0001)||top[0];
    [-1,1].forEach(s=>{const v=gkHoodAt(Hd,Hd.ys[Math.round(Hd.nr*.85)],Math.PI*(s<0?1.62:.38));if(!v)return;k.p('head','cone4','c',fur,v.x,v.y+.035,v.z,.026,.07,.018,-.2,0,-s*.25);k.p('head','cone4','c',0x2a1a14,v.x-s*.002,v.y+.03,v.z+.008,.014,.045,.006,-.2,0,-s*.25)});
    // the wolf's muzzle lying over the brow, teeth along its edge
    const b=Hd.G[Math.min(Hd.nr-1,Math.round(Hd.nr*.86))],L=b[0],R2=b[b.length-1],cx=(L.x+R2.x)/2,cy=Math.max(L.y,R2.y)+.01,cz=Math.max(L.z,R2.z)+.004;
    k.p('head','box','c',fur,cx,cy,cz+.025,.04,.026,.07,.15);k.p('head','cone4','c',dkf,cx,cy-.002,cz+.065,.03,.03,.022,Math.PI/2+.15,Math.PI/4,0);k.p('head','sph','c',0x14100c,cx,cy+.004,cz+.075,.01,.008,.008);
    for(let i=0;i<5;i++)k.p('head','cone4','c',0xe8e0d0,cx-.024+i*.012,cy-.016,cz+.03+Math.abs(i-2)*-.004,.004,.012,.004,Math.PI);
    [-1,1].forEach(s=>{const v=gkHoodAt(Hd,.93,s<0?Math.PI*1.86:Math.PI*.14);if(!v)return;k.L('chest','c',fur,[v.x,v.y,v.z+.005],[v.x*.8,v.y-.14,v.z+.03],.022,.016,5);mdOW(k,v.w);
      for(let i=0;i<3;i++){k.p('chest','cone4','c',0x1a1410,v.x*.8+(i-1)*.01,v.y-.155,v.z+.035,.003,.016,.003,Math.PI);mdOW(k,v.w)}})}};
GK_HOOD.cowl={pre:X=>asMask(X,{col:X.A,tails:false}),hood:X=>gkHoodBase(X,{col:X.M,lin:mdSh(X.M,.36),trim:mdSh(X.M,.7),dag:[.04],tip:false,loose:.025})};
// a skull hood: a horned beast's skull worn over the hood's crown
GK_HOOD.skullhood={hood:X=>gkHoodBase(X,{col:X.M,lin:mdSh(X.M,.32),trim:mdSh(X.M,.6),dag:[.06],tip:false,loose:.03}),
  post:(X,Hd)=>{const {k}=X,bone=0xd8ccb0,i=Math.round(Hd.nr*.88),f=Hd.G[i][0],g=Hd.G[i][Hd.N],cx=(f.x+g.x)/2,top=Hd.G[Hd.G.length-2][Math.round(Hd.N/2)],cy=Math.max(f.y,top.y)+.012,cz=(f.z+g.z)/2-.03;
    k.p('head','sph2','c',bone,cx,cy,cz,.06,.035,.075);k.p('head','box','c',mdSh(bone,.92),cx,cy-.005,cz+.075,.03,.022,.05,.25);[-1,1].forEach(s=>{k.p('head','oct','c',0x14100c,cx+s*.026,cy-.004,cz+.05,.012,.01,.008);
      k.L('head','c',bone,[cx+s*.04,cy+.02,cz-.01],[cx+s*.1,cy+.07,cz-.05],.016,.009,6).L('head','c',mdSh(bone,.9),[cx+s*.1,cy+.07,cz-.05],[cx+s*.12,cy+.03,cz-.11],.009,.002,6)});
    for(let q=0;q<4;q++)k.p('head','box','c',0xe8e0d0,cx-.018+q*.012,cy-.022,cz+.11,.004,.01,.004)}};
GK_HOOD.wind={pre:X=>asMask(X,{col:mdSh(X.A,.9),tails:false}),hood:X=>gkHoodBase(X,{col:X.M,lin:mdSh(X.M,.36),trim:X.A,dag:[.05],tip:false,loose:.025}),
  post:(X,Hd)=>{const {k,A}=X;[-1,1].forEach(s=>{for(let j=0;j<4;j++){const v=gkHoodAt(Hd,Hd.ys[Math.round(Hd.nr*.7)]-j*.02,Math.PI*(s<0?1.3:.7));if(!v)continue;gkFeather(k,'head',[v.x,v.y,v.z],[s*.7,.5-j*.15,-.6],.12-j*.015,.016,j%2?A:0xe8e8f0,v.w)}})}};
GK_HOOD.deadeye={pre:X=>{asMask(X,{col:mdSh(X.M,.6),tails:false});const {k,D,G,A}=X,V=THREE.Vector3,er=D.eyeR||.021,[x,y,z]=D.EYEP,at=zz=>brSkullAt(D,zz),ry=Math.atan2(1,-at(z).slope)*(D.eyeFw==null?1:D.eyeFw),dv=new V(Math.sin(ry),0,Math.cos(ry)),
    c=new V(brSurfX(D,z,y)-.004-(D.eyeIns||0),y,z).add(dv.clone().multiplyScalar(er*1.05+.004)),e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new V(0,1,0),dv));
    k.p('head','ring','m',X.T,c.x,c.y,c.z,er*1.25,.05,er*1.25,e.x,e.y,e.z);k.p('head','cyl',G?'g':'c',G||0x3a1a14,c.x,c.y,c.z,er*1.1,.002,er*1.1,e.x,e.y,e.z);
    gkChain(k,'head',[[c.x,c.y-er,c.z],[c.x-.01,c.y-.06,c.z-.04]],.004,X.T,null)},
  hood:X=>gkHoodBase(X,{col:X.M,lin:mdSh(X.M,.34),trim:mdSh(X.M,.65),dag:[.04],tip:false,loose:.025})};
// the quiver rides on the back over a hood's mantle: built after the hood, pushed out past it
{const f=mdQuiver;mdQuiver=function(B,P){if(!(GKX.late&&GKX.late.B===B&&P.gkHoodOn))return f.apply(this,arguments);
  gkLater(B,B2=>{let bk=0;gkPts(B2,.82,1.02,(x,y,z)=>Math.abs(x)<.12&&z<0).forEach((v,i,a)=>{if(i%3==2)bk=Math.max(bk,-v)});
    const o=P.tOff;P.tOff=Math.max(o||0,bk-mdTorsoAt(P,.85).b-.035);try{f.call(this,B2,P)}finally{P.tOff=o}})}}
