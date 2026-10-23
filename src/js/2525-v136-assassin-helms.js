// ================= v136: the Assassin's head pieces (the cat) =================
// Masks are shells over the lower muzzle (stitched seam, a buckle at the cheek, a strap round the back of the head with a
// knot and trailing tails); the styles add their own pieces: a rag wrap round the brow (Cloth Mask), a scaled snout guard,
// fangs and a crest of spines (Viper Mask), nightglass goggles (Nightglass Mask), a bandana knotted over the crown (Cutthroat),
// respirator canisters and green lenses (Venomweave). The three hoods (Ashveil, Stormshade, Duskdancer) are gkHoods over a mask.
function asMask(X,o){o=o||{};const {B,k,D}=X,S=D.SN,ez=D.EYEP[2],mz=D.muzzleZ==null?S[S.length-1][0]-.05:D.muzzleZ,z0=S[0][0]-.005,za=ez-.004,zb=mz+.012,c=o.col,dk=mdSh(c,.65),T=X.T;
  brShell(B,D,.014,za,zb,m=>(m.z>ez+.03?m.s<.6:m.s<.14)&&!(D.topW&&D.topW(m)),m=>m.z>zb-.014||m.z<za+.01?dk:o.pat?o.pat(m,c):c,'c',20);
  brShell(B,D,.009,z0+.01,za,m=>m.s<.3&&m.s>-.22&&!brEarW(D,m),dk,'c',16);
  // the seam down the middle of the mask, a buckle on the cheek
  const q=brSkullAt(D,(za+zb)/2),yb=q.yc-q.b*.55;for(let i=0;i<4;i++){const z=za+.012+i*(zb-za-.02)/3,qq=brSkullAt(D,z);k.p('head','box','c',mdSh(c,.45),0,qq.yc-qq.b*.2-.008-.002*i,z,.003,.006,.004)}
  [-1,1].forEach(s=>{const z=za+.004,x=brSurfX(D,z,yb+.01)+.016;k.p('head','box','m',T,s*x,yb+.01,z,.004,.016,.014,0,s*.3,0)});
  // the knot at the back and two tails
  if(o.tails!==false){const q0=brSkullAt(D,z0+.012),y=q0.yc+.004,z=z0-.02;k.p('head','sph','c',dk,0,y,z,.016,.014,.012);
    [-1,1].forEach(s=>k.L('head','c',dk,[s*.008,y,z],[s*.03,y-(o.tlen||.12),z-.05],.012,.004,4))}}
function asGoggles(X,glass,frame){const {k,D,G}=X,er=D.eyeR||.021,gr=Math.max(.017,er*1.06),V=THREE.Vector3,at=z=>brSkullAt(D,z);
  [-1,1].forEach(s=>{const [x,y,z]=D.EYEP,ry=s*Math.atan2(1,-at(z).slope)*(D.eyeFw==null?1:D.eyeFw),d=new V(Math.sin(ry),0,Math.cos(ry)),eye=new V(s*(brSurfX(D,z,y)-.004-(D.eyeIns||0)),y,z),h=.01+er*.3,
      c0=eye.clone().add(d.clone().multiplyScalar(er*1.05+.003+h*.5)),e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new V(0,1,0),d));
    k.p('head','cyl','m',frame,c0.x,c0.y,c0.z,gr,h,gr,e.x,e.y,e.z);const c1=c0.clone().add(d.clone().multiplyScalar(h*.5+.001));k.p('head','cyl','g',G||glass,c1.x,c1.y,c1.z,gr*.78,.004,gr*.78,e.x,e.y,e.z);
    k.p('head','ring','m',mdSh(frame,1.3),c1.x,c1.y,c1.z,gr*.95,.04,gr*.95,e.x,e.y,e.z);
    const b0=c0.clone().add(new V(s*gr*.8,0,-gr*.3)),b1=new V(s*(at(-.04).rx+.024),y+.006,-.03);k.L('head','c',0x1a1614,b0.toArray(),b1.toArray(),.006,.006,4)});
  brShell(X.B,D,.012,-.05,-.03,m=>m.s>-.25&&!brEarW(D,m),0x1a1614,'c',16)}
GK_HELM.wrap={race:'cat',pre:X=>{const {k,D,M}=X,rag=mdSh(M,.9);asMask(X,{col:rag,pat:(m,c)=>Math.floor(m.z*90+m.y*60)%2?c:mdSh(c,.82)});
  // a rag wound round the brow between the ears, its ends trailing
  brShell(X.B,D,.014,-.02,.045,m=>m.s>.05&&m.s<.62&&!brEarW(D,m),m=>Math.floor(m.z*70)%2?mdSh(rag,.8):mdSh(rag,.65),'c',18)}};
GK_HELM.bandana={race:'cat',pre:X=>{const {k,D,M,A}=X,red=0x6a1218;asMask(X,{col:mdSh(M,.8),tlen:.08});
  brShell(X.B,D,.016,D.SN[0][0]-.005,.04,m=>m.s>.18&&!brEarW(D,m),m=>Math.floor(m.z*60+m.x*40)%3==0?mdSh(red,.7):red,'c',20);
  const q=brSkullAt(D,D.SN[0][0]+.01),y=q.yc+q.f*.4,z=D.SN[0][0]-.01;k.p('head','sph','c',mdSh(red,.8),0,y,z,.018,.016,.014);
  [-1,1].forEach(s=>{k.L('head','c',red,[s*.008,y,z],[s*.04,y-.13,z-.06],.016,.006,4);k.L('head','c',mdSh(red,.8),[s*.04,y-.13,z-.06],[s*.05,y-.2,z-.05],.006,.002,4)})}};
GK_HELM.viper={race:'cat',pre:X=>{const {k,D,M,A,G}=X,ez=D.EYEP[2],mz=D.muzzleZ;asMask(X,{col:mdSh(M,.9),pat:(m,c)=>(Math.round(m.z*120)+Math.round(m.x*120))%2?c:mdSh(c,.7)});
  // scales down the snout, fangs at the mask's edge, a crest of spines over the crown
  for(let r=0;r<4;r++)for(let i=-1;i<=1;i++){const z=ez-.01+r*(mz-ez+.01)/3,q=brSkullAt(D,z),x=i*q.rx*.35;k.p('head','oct','c',(r+i)%2?A:mdSh(A,.65),x,q.yc+q.f*Math.sqrt(Math.max(.1,1-(x/q.rx)**2))+.02,z,.012,.004,.012,0,0,i*.4)}
  [-1,1].forEach(s=>{const z=mz-.012,q=brSkullAt(D,z),x=s*(q.rx*.55);k.p('head','cone4','c',0xe8e0d0,x,q.yc-q.b-.006,z+.01,.005,.026,.005,Math.PI)});
  for(let i=0;i<6;i++){const z=-.09+i*.024,q=brSkullAt(D,z);k.p('head','cone4','c',i%2?A:mdSh(A,.7),0,q.top+.022,z,.009,.04+(i<3?i*.006:(5-i)*.006),.016,-.35)}}};
GK_HELM.glassmask={race:'cat',pre:X=>{asMask(X,{col:mdSh(X.M,.6)});asGoggles(X,0x2a1a4a,0x2a2a30)}};
GK_HELM.venom={race:'cat',pre:X=>{const {k,D,G}=X,gl=G||0x7ae040;asMask(X,{col:mdSh(X.M,.7)});asGoggles(X,0x1a3a1a,0x2a2a24);
  // respirator canisters on the cheeks
  const z=D.muzzleZ-.01,q=brSkullAt(D,z),yb=q.yc-q.b*.35;[-1,1].forEach(s=>{const x=s*(brSurfX(D,z,yb)+.028);k.p('head','cyl','m',0x3a3c36,x,yb,z,.02,.03,.02,0,0,Math.PI/2);k.p('head','cyl','g',gl,x+s*.016,yb,z,.014,.004,.014,0,0,Math.PI/2);
    k.p('head','ring','m',0x5a5a50,x+s*.006,yb,z,.021,.05,.021,0,0,Math.PI/2)})}};
// hoods over a mask
function asHoodPre(X,c){asMask(X,{col:c,tails:false})}
GK_HOOD.ashcowl={race:'cat',pre:X=>asHoodPre(X,mdSh(X.M,.7)),hood:X=>gkHoodBase(X,{col:X.M,lin:mdSh(X.M,.3),trim:mdSh(X.M,.7),dag:[.05],tip:false,folds:[8,.016]}),
  post:(X,Hd)=>{const {k}=X;// a clasp at the throat
    const v=gkHoodAt(Hd,.99,Math.PI*.18);if(v){k.p('chest','oct','m',X.T,v.x,v.y,v.z+.006,.012,.014,.008);mdOW(k,v.w)}}};
GK_HOOD.stormhood={race:'cat',pre:X=>asHoodPre(X,mdSh(X.M,.55)),hood:X=>gkHoodBase(X,{col:X.M,lin:mdSh(X.M,.3),trim:mdSh(X.M,.5),edge:mdSh(X.A,.7),dag:[.06],tip:{len:.17,r:.032},folds:[8,.016],over:.045}),
  post:(X,Hd)=>{const {k,G,A}=X,gl=G||mdSh(A,1.2);// a glowing seam over the crown and a clasp of two crescents
    for(let i=Math.round(Hd.nr*.55);i<Hd.nr;i++){const v=Hd.G[i][Math.round(Hd.N/2)];k.p('head','box',G?'g':'m',gl,v.x,v.y,v.z,.004,.016,.004);mdOW(k,v.w)}
    const v=gkHoodAt(Hd,.99,Math.PI*.16);if(v){k.p('chest','oct',G?'g':'m',gl,v.x,v.y,v.z+.006,.012,.016,.008);mdOW(k,v.w)}}};
GK_HOOD.dusk={race:'cat',pre:X=>asHoodPre(X,mdSh(0x5a4a8a,.8)),hood:X=>gkHoodBase(X,{col:X.M,lin:mdSh(X.M,.3),trim:mdSh(X.A,.9),dag:[.045],tip:{len:.22,r:.028,drop:1},folds:[8,.014]}),
  post:(X,Hd)=>{const {k}=X;const v=gkHoodAt(Hd,1.0,Math.PI*.2);if(v){for(let i=0;i<5;i++){const a=-1.1+i*.55;k.p('chest','box','m',AS_STEEL,v.x+Math.cos(a)*.018,v.y+Math.sin(a)*.018,v.z+.008,.006,.014,.004,0,0,a);mdOW(k,v.w)}}}};
