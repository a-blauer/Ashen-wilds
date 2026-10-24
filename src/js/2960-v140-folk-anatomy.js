// ================= v140: townsfolk anatomy — animal heads on animal necks, natural eyes, animal legs =================
// The v137 townsfolk were a human body with a small animal head on a tall, straight neck. This layer reshapes every
// species without touching the clothes, tools or animations (they all keep working because the skeleton keeps its bones):
//  * Posture by bone offsets: the upper body leans forward over the hips (A.lean), shoulders narrow / widen (A.sh). The body
//    is built on the old ("pre") bone positions and then moved with its bones (each vertex by its skin weights), so the torso
//    shears smoothly, arms ride their shoulders, and clothes built from the body rings follow.
//  * Head: the whole head (skull, face, ears, horns, hats) is scaled up (A.hs) about the top of the neck and carried
//    forward / down (A.hz / A.hy, A.pitch), as an animal carries it; the neck rings blend between body and head, so the
//    neck leans forward and joins the back of the skull. The ear bones move with the head.
//  * Natural eyes (fk140Eyes): set into a socket where the brow meets the muzzle (prey animals further back and to the
//    side), aimed forward (predators) or out (prey), iris filling the eye, the species' pupil (slit / bar / round), a dark
//    rim, a fur lid over the top; sized from the skull, so big heads get big eyes (A.eye.sz tunes it).
//  * Legs (A.leg): 'plant' (flat feet: bear, raccoon, beaver…), 'digi' (on the toes, heel raised: fox, wolf, lynx, hound),
//    'hoof' (on hooves: deer, goat, sheep, ram, boar), 'bird' (scaled shanks and talons: owl). The knee / hock bones move
//    (fkNB), the foot rings run from the raised hock down to the ball of the foot (mdFoot), toes and hooves sit at the ball.
// FK140.on = false gives the v137 models back (tests compare both).
var FK140={on:true,sp:{},cur:null,D:null,pre:false,
  // legs: knee [y, z], hock [y, z], metatarsus reach mt (ball of the foot = hock z + mt)
  legs:{digi:{k:[.33,.065],h:[.135,-.07],mt:.11},hoof:{k:[.34,.06],h:[.165,-.065],mt:.085},bird:{k:[.35,.05],h:[.15,-.03],mt:.07}}};
function fk140A(D){return FK140.on&&D&&D.key?FK140.sp[D.key]||null:null}
function fk140Def(k,A){FK140.sp[k]=A;return A}
function fk140Leg(A){return A&&A.leg&&A.leg!='plant'?Object.assign({},FK140.legs[A.leg],A.legP||{}):null}
// ---------------- bone offsets (lean, shoulders) and the head transform ----------------
function fk140Lean(A,y){return (A.lean||0)*Math.max(0,y-.55)}
function fk140Xf(D,A){if(D._xf140)return D._xf140;const hs=A.hs||1,pv=new THREE.Vector3(0,A.pvy||1.075,A.pvz==null?-.01:A.pvz);
  const T=new THREE.Vector3(0,A.hy||0,fk140Lean(A,1.04)+(A.hz||0)).add(pv),Q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),A.pitch||0);
  return D._xf140=new THREE.Matrix4().compose(T,Q,new THREE.Vector3(hs,hs,hs)).multiply(new THREE.Matrix4().makeTranslation(-pv.x,-pv.y,-pv.z))}
// what each bone does: {m: matrix} (head, ears) or [dx, dy, dz]
function fk140Delta(n,A,N,D){if(n=='head'||n=='erL'||n=='erR')return {m:fk140Xf(D,A)};
  if(/^(spine|chest|neck)$/.test(n))return [0,0,fk140Lean(A,N[n][2])];
  if(/^cp\d/.test(n))return [0,0,fk140Lean(A,N.chest[2])];
  const a=/^a([LR])\d/.exec(n);if(a){const s=a[1]=='L'?-1:1,sh=A.sh||1;return [s*Math.abs(N.aL0[1])*(sh-1),0,fk140Lean(A,N[a[1]=='L'?'aL0':'aR0'][2])]}
  return [0,0,0]}
// ---------------- the skeleton: pre (legs moved; the body is built on it) and final (+ lean, shoulders, head) ----------------
{const f=fkNB;fkNB=function(D){const A=fk140A(D);if(!A)return f.apply(this,arguments);
  if(!D._nbPre140){const N0=f.apply(this,arguments),N={};for(const k in N0)N[k]=N0[k].slice();const G=fk140Leg(A);
    if(G)['lh','rh'].forEach(l=>{const x=N[l+'0'][1];N[l+'1']=[l+'0',x,G.k[0],G.k[1]];N[l+'2']=[l+'1',x,G.h[0],G.h[1]]});
    const F={};for(const k in N){const d=fk140Delta(k,A,N,D),p=N[k];if(d.m){const v=new THREE.Vector3(p[1],p[2],p[3]);if(k=='head')F[k]=[p[0],p[1],p[2],p[3]+fk140Lean(A,p[2])];else{v.applyMatrix4(d.m);F[k]=[p[0],v.x,v.y,v.z]}}else F[k]=[p[0],p[1]+d[0],p[2]+d[1],p[3]+d[2]]}
    D._nbPre140=N;D._nbFin140=F}
  return FK140.pre?D._nbPre140:D._nbFin140}}
// move the built body with its bones (rest pose linear blend: every vertex by its skin weights)
// (the torso bones' share is a continuous shear by the vertex's own height, not by the bone's: buttons, chains and
// pendants hang on one bone while the cloth under them blends two, and both must move the same)
function fk140Deform(B,D,A){const N=D._nbPre140,dl=B.O.map(n=>/^(pelvis|spine|chest|neck|cp\d)$/.test(n)?{sh:1}:fk140Delta(n,A,N,D)),V=new THREE.Vector3();
  for(const t in B.L){const L=B.L[t],p=L.p,si=L.si,sw=L.sw,nv=p.length/3;
    for(let v=0;v<nv;v++){const px=p[3*v],py=p[3*v+1],pz=p[3*v+2];let x=0,y=0,z=0,ws=0;
      for(let j=0;j<4;j++){const w=sw[4*v+j];if(!w)continue;const d=dl[si[4*v+j]];ws+=w;
        if(d.m){V.set(px,py,pz).applyMatrix4(d.m);x+=w*V.x;y+=w*V.y;z+=w*V.z}else if(d.sh){x+=w*px;y+=w*py;z+=w*(pz+fk140Lean(A,py))}else{x+=w*(px+d[0]);y+=w*(py+d[1]);z+=w*(pz+d[2])}}
      if(ws>0){p[3*v]=x/ws;p[3*v+1]=y/ws;p[3*v+2]=z/ws}}}}
{const f=fkBuild;fkBuild=function(D,pk,o){const A=fk140A(D);if(!A)return f.apply(this,arguments);
  const c0=FK140.cur,d0=FK140.D;FK140.cur=A;FK140.D=D;FK140.pre=true;let B;
  try{B=f.apply(this,arguments)}finally{FK140.pre=false;FK140.cur=c0;FK140.D=d0}
  fk140Deform(B,D,A);return B}}
{const f=fkKey;fkKey=function(o,pk){return f.apply(this,arguments)+(fk140A(FK137.sp[pk.sp])?'|v140':'')}}
// ---------------- natural eyes ----------------
var FK140E={slit:{fox:1,lynx:1},bar:{goat:1,ram:1,sheep:1,stag:1,doe:1},prey:{hare:1,goat:1,ram:1,sheep:1,stag:1,doe:1,mouse:1,squirrel:1}};
// where the eye sits: at the stop (where the brain case turns into the muzzle), just above the muzzle's top line
function fk140EyeAt(D,A){const S=D.SN,R=(D.hp&&D.hp.R)||.1,E=A.eye||{},pr=FK140E.prey[D.key],mx=Math.max(...S.map(s=>s[2]));
  let i=S.findIndex((s,j)=>j>2&&s[0]>0&&s[2]<mx*.62);if(i<0)i=S.length-4;
  const zs=S[i][0],top=S[i][1]+S[i][3];let ez=zs-R*(E.back==null?(pr?.42:.3):E.back),ey=top+R*(E.up==null?(pr?.08:.05):E.up);
  const q=brSkullAt(D,ez);ey=Math.min(ey,q.yc+q.f*.82);
  const g=E.g||(pr?[.88,.06,.48]:[.62,.08,.78]),n=new THREE.Vector3(g[0],g[1],g[2]).normalize();
  return {p:new THREE.Vector3(brSurfX(D,ez,ey)+(E.dx||0),ey,ez),n,r:.0142*(R/.094)*(E.sz||1)}}
function fk140Eyes(k,D,o,A){const C=BR.C,E=A.eye||{},F0=D._eye140||(D._eye140=fk140EyeAt(D,A)),F=Object.assign({},F0,{p:F0.p.clone().addScaledVector(F0.n,E.out==null?F0.r*.3:E.out)}),r=F.r,tl=-(o.tilt||0)*.7-.06+(E.roll||0);
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0),F.n),up=new THREE.Vector3(0,1,0).applyQuaternion(q),fd=new THREE.Vector3(0,0,1).applyQuaternion(q),V=THREE.Vector3;
  const put=(geo,t,col,d,u,v,sx,sy,sz,roll)=>{const p=F.p.clone().addScaledVector(F.n,d).addScaledVector(up,u).addScaledVector(fd,v);
    const qq=q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new V(1,0,0),roll||0)),e=new THREE.Euler().setFromQuaternion(qq);
    k.p('head',geo,t,col,p.x,p.y,p.z,sx,sy,sz,e.x,e.y,e.z);k.p('head',geo,t,col,-p.x,p.y,p.z,sx,sy,sz,e.x,-e.y,-e.z)};
  const iris=E.col?E.col(C):C.EYE,pc=E.pupilCol||0x070505;
  // hero style (sculpted heads): a narrow almond slanted up at the outer corner, bright iris, a dark brow line over it
  // (owner, v140: brows level, so the folk look calm, not angry; E.round gives a round eye, e.g. the owl)
  if(D.sculpt){const sl=E.slant==null?(FK140E.prey[D.key]?.06:.14):E.slant,h=E.open||.66,brow=E.brow==null?.8:E.brow,wd=E.round?h:1.2;
    put('sph2','c',0x0e0a08,-r*.45,0,0,r*.55,r*(h+.14),r*(wd+.2),sl);
    put('sph2',E.glow?'g':'c',iris,-r*.3,0,r*.02,r*.5,r*h,r*wd,sl);
    const ph=r*h*.95;if(FK140E.slit[D.key])put('sph2','c',pc,r*.19,0,r*.02,.0012,ph,r*.16,sl);else if(FK140E.bar[D.key])put('sph2','c',pc,r*.19,0,r*.02,.0012,ph*.3,r*.55,sl);else put('sph2','c',pc,r*.19,0,r*.02,.0012,ph*.62,r*.36,sl);
    if(brow)put('sph2','c',E.browCol?E.browCol(C):C.FURD,-r*.15,r*(h+.3),-r*.02,r*.4,r*.16*brow,r*(wd+.25),0);
    put('box','c',0xf2eee6,r*.21,r*h*.42,r*.3,.0012,.0016*r/.0112,.0016*r/.0112);return}
  const rm=E.rim||1.05;put('sph2','c',0x140e0a,-r*.82,0,0,r*rm,r*(rm-.06),r*(rm+.08),tl);  // dark rim: behind the iris's front, so it shows as a ring                                  // dark rim
  put('sph2','c',iris,-r*.66,0,r*.04,r,r*.93,r*1.08,tl);                                         // eye (iris fills it)
  const pr=r*.42;if(FK140E.slit[D.key])put('sph2','c',pc,r*.36,0,0,.0012,pr*1.7,pr*.38);else if(FK140E.bar[D.key])put('sph2','c',pc,r*.36,0,0,.0012,pr*.42,pr*1.6);else put('sph2','c',pc,r*.36,0,0,.0012,pr,pr);
  if(E.lid!=null||!D.sculpt)put('sph2','c',E.lidCol?E.lidCol(C):C.FUR,-r*.7,r*(E.lid==null?1.12:E.lid),0,r*1.08,r*.45,r*1.3,tl); // upper lid (sculpted heads have a socket instead)
  put('box','c',0xf2eee6,r*.38,r*.28,r*.24,.0012,.0019*r/.0112,.0019*r/.0112)}                  // glint
{const f=brEyes;brEyes=function(k,D,o){const A=FK140.cur;if(A&&FK140.D===D)return fk140Eyes(k,D,o||{},A);return f.apply(this,arguments)}}
// ---------------- feet: from the raised hock down to the ball of the foot ----------------
function fk140Foot(P,s,A,G){const l=(s<0?'lh':'rh')+'2',H=mdV(P.bones[l]),F=BR.R.foot||{w:1},lf=P.lf||1,w=(F.w||1)*lf,bz=H.z+G.mt,x=H.x,W=[[l,1]];
  const r=(p,rx,f,b,part)=>({p,rx:rx*w,f:f*lf,b:b*lf,w:W,part});
  if(A.leg=='hoof')return [r([x,H.y-.006,H.z],.036,.034,.036,'heel'),r([x,(H.y+.08)/2,(H.z+bz)/2-.004],.026,.024,.026,'foot'),r([x,.078,bz-.012],.03,.028,.03,'foot'),
    r([x,.055,bz-.002],.026,.022,.024,'toe'),r([x,.04,bz+.006],.03,.016,.02,'toe')];
  if(A.leg=='bird')return [r([x,H.y-.006,H.z],.03,.03,.03,'heel'),r([x,(H.y+.04)/2,(H.z+bz)/2],.022,.02,.02,'foot'),r([x,.04,bz-.004],.026,.02,.022,'foot'),r([x,.03,bz+.008],.02,.012,.014,'toe')];
  return [r([x,H.y-.008,H.z],.042,.04,.04,'heel'),r([x,H.y*.55+.02,H.z+(bz-H.z)*.45],.032,.03,.03,'foot'),r([x,.045,bz],.04,.03,.034,'foot'),r([x,.032,bz+.04],.042,.022,.028,'toe'),r([x,.022,bz+.068],.03,.014,.02,'toe')]}
{const f=mdFoot;mdFoot=function(P,s){const A=FK140.cur,G=BR.on&&fk140Leg(A);return G?fk140Foot(P,s,A,G):f.apply(this,arguments)}}
// toes at the ball of the foot (digi / bird); owls get a back toe too
function fk140Toes(B,P,A,G){const C=BR.C,D=BR.R,T=D.toes,k=dkKit(),tc=T.colOf?T.colOf(C):C.PINK,tpc=T.padColOf?T.padColOf(C):tc,lf=P.lf||1,F=D.foot||{w:1};
  [-1,1].forEach(s=>{const l=(s<0?'lh':'rh')+'2',H=mdV(P.bones[l]),FR=mdFoot(P,s),tr=FR[FR.length-2],bz=G?H.z+G.mt:tr.p[2]-.03,n=T.n,bird=A.leg=='bird';
    for(let i=0;i<n;i++){const o=(i-(n-1)/2)*.019*lf*(F.w||1)*(T.spread||1)*(bird?1.5:1),x=H.x+o,ln=(bird?T.len*.9:T.len*.75)*(1-.18*Math.abs(i-(n-1)/2)/((n-1)/2||1))*lf,dx=o*(bird?.9:.4),
        a=[H.x+o*(bird?.15:.55),.024,bz+(bird?.004:.02)],b=[x+dx,.012,bz+.02+ln],c=[x+dx*1.15,.004,bz+.02+ln+(T.claw||.012)*lf];
      k.L(l,'c',tc,a,b,.011*lf*(T.w||1)*(bird?.7:1),.008*lf*(T.w||1)*(bird?.7:1),5);if(T.pad&&!bird)k.p(l,'sph2','c',tpc,b[0],b[1]-.002,b[2]-.004,.011*lf,.008*lf,.012*lf);
      if(T.claw)k.L(l,'c',C.CLAW,b,c,.006*lf,.0008,4)}
    if(bird){const a=[H.x,.03,bz],b=[H.x,.012,bz-.04*lf],c=[H.x,.004,bz-.055*lf];k.L(l,'c',tc,a,b,.008*lf,.006*lf,5);if(T.claw)k.L(l,'c',C.CLAW,b,c,.005*lf,.0008,4)}});
  mdKit(B,k)}
// (plantigrade feet too: the v137 toes were placed by a formula that left big species' toes past the end of the foot)
{const f=brToes;brToes=function(B,P){const A=FK140.cur,G=BR.on&&fk140Leg(A);if(A&&BR.on&&A.leg!='hoof')return fk140Toes(B,P,A,G);return f.apply(this,arguments)}}
// hooves: two cloven halves at the ball, a dark sole line, a fetlock band above
{const f=fkHooves;fkHooves=function(B,P,D,C){const A=FK140.cur,G=fk140Leg(A);if(!G||A.leg!='hoof')return f.apply(this,arguments);const k=dkKit(),lf=P.lf||1,F=D.foot||{w:1};
  [-1,1].forEach(s=>{const l=(s<0?'lh':'rh')+'2',H=mdV(P.bones[l]),bz=H.z+G.mt,w=(F.w||1)*lf;
    [-1,1].forEach(q=>k.p(l,'sph2','c',C.HOOF,H.x+q*.0155*w,.026,bz+.012,.02*w,.028,.034*lf,-.15,q*.1,0));
    k.p(l,'box','c',mdSh(C.HOOF,.5),H.x,.026,bz+.03,.004,.04,.034);
    k.p(l,'tor','c',mdMix(C.FUR,C.HOOF,.45),H.x,.062,bz-.004,.034*w,.024,.034*lf,.25,0,0)});mdKit(B,k)}}
// ---------------- species setup: eye position (skull masks follow it), thicker necks ----------------
// the skull: the v137 brain case was a ball with a tube for a muzzle. Now (fk140SN, same ring format): the back of the
// skull is smaller and lower (occ), a brow ridge rises over the eyes (brow) with a stop in front of it where the muzzle
// starts lower (stop), the cheeks are fuller under the eyes (cheek). A.hp overrides the v137 head numbers per species.
function fk140SN(hp){const R=hp.R||.1,W=hp.W||1,H=hp.H||1,Ln=hp.L||1,yc=hp.yc||1.158,zc=hp.zc==null?-.01:hp.zc,m=hp.m||{},n=hp.n||20;
  const zB=zc-R*Ln*.93,zF=zc+R*Ln,z0=zc+R*Ln*(m.z0==null?.25:m.z0),z1=zF+(m.len||0),out=[];
  const brow=hp.brow==null?.045:hp.brow,stop=hp.stop==null?.05:hp.stop,cheek=hp.cheek==null?.06:hp.cheek,occ=hp.occ==null?.14:hp.occ;
  const zb=zc+R*Ln*(hp.browZ==null?.5:hp.browZ),zs=zb+R*(hp.stopD==null?.38:hp.stopD),zk=zc+R*Ln*(hp.cheekZ==null?.3:hp.cheekZ),g=(z,c,w)=>Math.exp(-(((z-c)/w)**2));
  const pw=hp.blend||2.6,smax=(a,b)=>Math.pow(Math.pow(Math.max(0,a),pw)+Math.pow(Math.max(0,b),pw),1/pw);
  for(let i=0;i<n;i++){const u=i/(n-1),zz=zB+(z1-zB)*(u<.5?(u*2)**1.15/2:1-((1-u)*2)**1.15/2);
    const t=(zz-zc)/(R*Ln),s=Math.sqrt(Math.max(0,1-t*t));let rx=R*W*s,top=yc+R*H*s,bot=yc-R*H*.94*s;
    if(t<0){const q=t*t;rx*=1-occ*q;top=yc+(top-yc)*(1-occ*1.4*q)}
    rx+=cheek*R*g(zz,zk,R*.35)*s;
    if(m.len&&zz>=z0){const v=Math.min(1,(zz-z0)/(z1-z0)),rnd=v>.8?Math.sqrt(Math.max(0,1-((v-.8)/.2)**2))*.85+.15:1,my=yc+(m.y0||-.02)-(m.drop||0)*Math.pow(v,1.3);
      const mw=((m.w||.06)+((m.tw==null?.03:m.tw)-(m.w||.06))*v)*rnd,mt=((m.h||.05)+((m.th==null?.025:m.th)-(m.h||.05))*v)*rnd,mb=((m.b||.05)+((m.tb==null?.025:m.tb)-(m.b||.05))*v)*rnd;
      rx=smax(rx,mw);top=Math.max(top,my+mt);bot=Math.min(bot,my-mb)}
    if(i<n-1)top+=brow*R*g(zz,zb,R*.26)-stop*R*g(zz,zs,R*.2);
    if(i==n-1){rx*=.3}
    const ycR=(top+bot)/2;out.push([+zz.toFixed(4),+ycR.toFixed(4),+Math.max(.004,rx).toFixed(4),+Math.max(.004,top-ycR).toFixed(4),+Math.max(.004,ycR-bot).toFixed(4)])}
  return out}
function fk140Setup(only){for(const key in FK140.sp){if(only&&key!=only)continue;const D=FK137.sp[key],A=FK140.sp[key];if(!D)continue;
  if(D.sculpt){D.sculpt._mesh=null;fksSetup(D,A);['NBX','_nbPre140','_nbFin140','_xf140'].forEach(k=>delete D[k]);continue}
  if(!D._hp137)D._hp137=D.hp;const h0=D._hp137,ah=A.hp||{};D.hp=Object.assign({},h0,ah,{m:Object.assign({},h0.m||{},ah.m||{})});
  D.SN=fk140SN(D.hp);D.muzzleZ=D.SN[D.SN.length-1][0]-.05;['NBX','_nbPre140','_nbFin140','_xf140','_eye140'].forEach(k=>delete D[k]);
  if(D.eyes!==false){const E=fk140EyeAt(D,A);D._eye140=E;D.EYEP=[0,E.p.y,E.p.z]}
  else if(D.eyeAt){const R=D.hp.R||.1,L=D.hp.L||1,zc=D.hp.zc==null?-.01:D.hp.zc,ez=zc+R*L*D.eyeAt[0],q=brSkullAt(D,ez);D.EYEP=[0,q.yc+q.f*D.eyeAt[1],ez]}}}
// re-tune a species while the game runs (tests / tuning): new numbers, caches dropped, models rebuilt on the next build
FK140.reset=function(key,A){if(A)FK140.sp[key]=A;fk140Setup(key);const S=mdS();for(const k of [...S.G.keys()])if(k.indexOf('FK|'+key+'|')==0){const e=S.G.get(k);for(const t in e.g)e.g[t].dispose();S.G.delete(k)}};
// the leg tube runs on into the foot (weighted to the foot bone), so the foot never parts from the leg however the ankle bends
{const f=mdLeg;mdLeg=function(P,s){const R=f.apply(this,arguments),A=FK140.cur;if(!A||!BR.on)return R;const l=(s<0?'lh':'rh')+'2',H=mdV(P.bones[l]),G=fk140Leg(A),e=R[R.length-1];
  const p=G?[H.x,H.y-(H.y-.04)*.3,H.z+G.mt*.3]:[H.x,H.y-.025,H.z+.012];return R.concat([{p,rx:e.rx*.85,f:e.f*.85,b:e.b*.85,w:[[l,1]],part:'ankle'}])}}
// ---------------- the head with a real neck ----------------
// The v137 neck was a vertical column as wide as the skull, ending under it. The animal neck rises from the collar to the
// back of the skull (the head is carried forward of it by the head transform), slimmer than the head, the throat lighter.
function fk140Neck(B,D,A,C){const hp=D.hp,R=hp.R||.1,L=hp.L||1,W=hp.W||1,H=hp.H||1,yc=hp.yc||1.158,zc=hp.zc==null?-.01:hp.zc,nm=A.neck||1;
  let zb=zc-R*L*(A.nzb==null?.3:A.nzb),yb=yc-R*H*(A.nyb==null?.35:A.nyb),r3=R*W*.58*nm;
  if(D.sculpt&&D.sculpt.neck){const q=D.sculpt.neck;yb=FKS.C0[1]+q[0];zb=FKS.C0[2]+q[1];r3=q[2]*nm}
  mdLoft(B,[{p:[0,.975,-.014],rx:.074*nm,f:.064*nm,b:.07*nm,w:[['chest',.6],['neck',.4]]},{p:[0,1.012,-.014],rx:.066*nm,f:.06*nm,b:.064*nm,w:[['neck',1]]},
    {p:[0,(1.012+yb)/2,(zb-.014)/2],rx:(.064*nm+r3)/2,f:(.06*nm+r3*.9)/2,b:(.064*nm+r3)/2,w:[['neck',.5],['head',.5]]},
    {p:[0,yb,zb],rx:r3,f:r3*1.25,b:r3,w:[['head',1]]},{p:[0,yb+R*.25,zb+R*.3],rx:r3*.75,f:r3*.9,b:r3*.7,w:[['head',1]]}],
    {seg:14,capB:true,col:m=>D.neckCol?D.neckCol(m,C):m.s>.45?C.BELLY:C.FUR})}
function fk140Head(D,B,P,o,A){const C=BR.C,k=dkKit();P.head={w:1,jaw:.9,top:1,len:1,fwd:0};const H=P._H=mdHeadR(P);
  if(!D.sculpt||D.sculpt.mesher!='nets')fk140Neck(B,D,A,C);
  if(D.sculpt){const S=D.sculpt;fksHead(B,D,C);if(D.eyes!==false)fk140Eyes(k,D,Object.assign({},D.eyes||{},{tilt:0}),A);if(S.whisk)fksWhiskers(k,D,S.whisk,C);fkEars(k,B,D,C);
    if(S.extra)S.extra(k,B,D,C,P);else if(D.face&&!S.noFace)D.face(k,B,D,C,P);mdKit(B,k);return H}
  brSkull(B,D,m=>D.skull?D.skull(m,C):(m.s<-.5&&m.r.p[2]>-.02?C.BELLY:m.s>.55&&m.r.p[2]<.0?C.FURD:C.FUR),{seg:D.seg||18,noNeck:true});
  if(D.jaw)brJaw(B,D,D.jaw[0],D.jaw[1],D.jaw[3]?D.jaw[3](C):C.BELLY,D.jaw[2]||{});
  if(D.nose=='nose'||D.nose=='pink')brNose(k,D,D.nose=='pink'?C.PINK:C.NOSE,D.noseSz||1,D.noseDy||0);
  if(D.eyes!==false)brEyes(k,D,Object.assign({sz:1,fw:.8},D.eyes||{}));
  if(D.whisk)brWhiskers(k,D,D.whisk[0],D.whisk[1],D.whisk[2],D.whisk[3],D.whisk[4]);
  fkEars(k,B,D,C);
  if(D.face)D.face(k,B,D,C,P);
  mdKit(B,k);return H}
{const f=fkHead;fkHead=function(D,B,P,o){const A=FK140.cur;if(A&&FK140.D===D)return fk140Head(D,B,P,o,A);return f.apply(this,arguments)}}
// whiskers root in the muzzle: each whisker starts just under the surface where it grows (v137 rows started from one
// point's surface, so the upper / back whiskers began in the air), and the row is kept inside the muzzle's height
function fk140Whiskers(k,D,z,y,n,len,col){const q=brSkullAt(D,z);y=Math.max(q.yc-q.b*.45,Math.min(q.yc+q.f*.35,y));
  [-1,1].forEach(s=>{for(let i=0;i<n;i++){const zi=z-i*.006,yi=y+i*.005-.004,wx=brSurfX(D,zi,yi);
    k.L('head','c',col||0x2a2420,[s*(wx-.004),yi,zi],[s*(wx+len*.62-i*.008),yi+(i-1)*.022*len/.12,zi-.008-i*.008],.0015,.0005,3)}})}
{const f=brWhiskers;brWhiskers=function(k,D,z,y,n,len,col){if(FK140.cur&&FK140.D===D)return fk140Whiskers(k,D,z,y,n,len,col);return f.apply(this,arguments)}}
