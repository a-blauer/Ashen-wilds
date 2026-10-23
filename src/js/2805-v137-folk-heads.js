// ================= v137: animal townsfolk — heads, ears, horns, paws, hooves =================
// One parametric skull for every species (fkSN): a brain case (ellipsoid) joined smoothly to a muzzle (tapered, dropping
// toward a rounded tip). The rings use the v114 skull format ([z, y centre, half-width, top, underside]), so the beast
// helpers (brSkull, brEyes, brNose, brJaw, brWhiskers, brSurfX) work on them. Ears are rigid parts on the ear bones
// (tri / round / long / leaf / small / tuft), horns and antlers are tubes on the head, faces get species details (2810).
var FKV=THREE.Vector3;
// hp: {yc, zc, R (brain radius), W (width), H (height), L (length), m:{len, w, h, b, tw, th, tb, drop, y0, z0}}
function fkSN(hp){const R=hp.R||.1,W=hp.W||1,H=hp.H||1,Ln=hp.L||1,yc=hp.yc||1.158,zc=hp.zc==null?-.01:hp.zc,m=hp.m||{},n=hp.n||16;
  const zB=zc-R*Ln*.93,zF=zc+R*Ln,z0=zc+R*Ln*(m.z0==null?.25:m.z0),z1=zF+(m.len||0),out=[];
  const smax=(a,b)=>Math.pow(Math.pow(Math.max(0,a),4)+Math.pow(Math.max(0,b),4),.25);
  for(let i=0;i<n;i++){const u=i/(n-1),zz=zB+(z1-zB)*(u<.5?(u*2)**1.15/2:1-((1-u)*2)**1.15/2);
    const t=(zz-zc)/(R*Ln),s=Math.sqrt(Math.max(0,1-t*t));let rx=R*W*s,top=yc+R*H*s,bot=yc-R*H*.94*s;
    if(m.len&&zz>=z0){const v=Math.min(1,(zz-z0)/(z1-z0)),rnd=v>.8?Math.sqrt(Math.max(0,1-((v-.8)/.2)**2))*.85+.15:1,my=yc+(m.y0||-.02)-(m.drop||0)*Math.pow(v,1.3);
      const mw=((m.w||.06)+((m.tw==null?.03:m.tw)-(m.w||.06))*v)*rnd,mt=((m.h||.05)+((m.th==null?.025:m.th)-(m.h||.05))*v)*rnd,mb=((m.b||.05)+((m.tb==null?.025:m.tb)-(m.b||.05))*v)*rnd;
      rx=smax(rx,mw);top=Math.max(top,my+mt);bot=Math.min(bot,my-mb)}
    if(i==n-1){rx*=.3}
    const ycR=(top+bot)/2;out.push([+zz.toFixed(4),+ycR.toFixed(4),+Math.max(.004,rx).toFixed(4),+Math.max(.004,top-ycR).toFixed(4),+Math.max(.004,ycR-bot).toFixed(4)])}
  return out}
// point on the skull surface at z, angle phi from the top (0 top, π/2 side), pushed out by off
function fkSurf(D,z,phi,off){const q=brSkullAt(D,z),c=Math.cos(phi),s=Math.sin(phi),r=c>=0?q.f:q.b;return [s*(q.rx+(off||0)),q.yc+c*(r+(off||0)),z]}
function fkEarBase(D){const e=D.ear;if(!e||e.t=='none')return null;if(!D.SN)D.SN=fkSN(D.hp);return fkSurf(D,e.z,e.phi,-(e.sink==null?.006:e.sink))}
// orient a unit part so its +y runs along d, then turn it about d by tw; returns the Euler (XYZ) as [rx,ry,rz]
var FKQ={q:new THREE.Quaternion(),q2:new THREE.Quaternion(),e:new THREE.Euler(),up:new THREE.Vector3(0,1,0)};
function fkRot(d,tw){const Q=FKQ,v=new FKV(d[0],d[1],d[2]).normalize();Q.q.setFromUnitVectors(Q.up,v);if(tw){Q.q2.setFromAxisAngle(v,tw);Q.q.premultiply(Q.q2)}Q.e.setFromQuaternion(Q.q,'XYZ');return [Q.e.x,Q.e.y,Q.e.z]}
// a part from base along d: geo, size w (across), len (along), th (thickness), off = shift along its own face normal
function fkDir(k,bn,geo,t,col,base,d,len,w,th,tw,along){const v=new FKV(d[0],d[1],d[2]).normalize(),a=along==null?.5:along,r=fkRot(d,tw);
  k.p(bn,geo,t,col,base[0]+v.x*len*a,base[1]+v.y*len*a,base[2]+v.z*len*a,w,len,th,r[0],r[1],r[2]);return k}
function fkV(a){return new FKV(a[0],a[1],a[2])}
// ear direction for side s: up, tilted out by e.out, back by e.back
function fkEarDir(e,s){const o=e.out||0,b=e.back||0;return [s*Math.sin(o),Math.cos(o)*Math.cos(b),-Math.cos(o)*Math.sin(b)]}
// ---------------- ears ----------------
function fkEars(k,B,D,C){const e=D.ear;if(!e||e.t=='none')return;const base=fkEarBase(D);
  [-1,1].forEach(s=>{const bn=s<0?'erL':'erR',p=[s*base[0],base[1],base[2]],d=fkEarDir(e,s),v=fkV(d),tw=s*(e.tw||0),L=e.len,W=e.w,T=e.th||.018,fur=e.col?e.col(C):C.FUR,inn=e.inner?e.inner(C):C.PINK;
    // the inside faces forward-out: shift the inner part toward the face side of the ear
    const fwd=new FKV(0,0,1).applyAxisAngle(v,tw).sub(v.clone().multiplyScalar(v.z)).normalize(),io=(dv,k2)=>[p[0]+fwd.x*dv,p[1]+fwd.y*dv,p[2]+fwd.z*dv];
    if(e.t=='tri'){fkDir(k,bn,'cone4','c',fur,p,d,L,W,T,tw+Math.PI/4);fkDir(k,bn,'cone4','c',inn,io(T*.55),d,L*.82,W*.7,T*.45,tw+Math.PI/4,.46);
      if(e.tip)fkDir(k,bn,'cone4','c',e.tip(C),[p[0]+v.x*L*.62,p[1]+v.y*L*.62,p[2]+v.z*L*.62],d,L*.38,W*.42,T*1.05,tw+Math.PI/4);
      if(e.tuft){const tp=[p[0]+v.x*L*.97,p[1]+v.y*L*.97,p[2]+v.z*L*.97];k.L(bn,'c',e.tuft(C),tp,[tp[0]+v.x*e.tuftL,tp[1]+v.y*e.tuftL,tp[2]+v.z*e.tuftL],.006,.001,4)}
      k.p(bn,'cone4','c',C.FURL,io(T*.7)[0]+v.x*L*.12,io(T*.7)[1]+v.y*L*.12,io(T*.7)[2]+v.z*L*.12,W*.3,L*.3,T*.3,...fkRot(d,tw+Math.PI/4))}
    else if(e.t=='round'){const c=[p[0]+v.x*L*.5,p[1]+v.y*L*.5,p[2]+v.z*L*.5],r=fkRot(d,tw);k.p(bn,'sph2','c',fur,c[0],c[1],c[2],W,L*.5,T,r[0],r[1],r[2]);
      k.p(bn,'sph2','c',inn,c[0]+fwd.x*T*.55,c[1]+fwd.y*T*.55,c[2]+fwd.z*T*.55,W*.72,L*.37,T*.5,r[0],r[1],r[2])}
    else if(e.t=='long'||e.t=='leaf'){const c=[p[0]+v.x*L*.5,p[1]+v.y*L*.5,p[2]+v.z*L*.5],r=fkRot(d,tw);k.p(bn,'sph2','c',fur,c[0],c[1],c[2],W*.5,L*.5,T,r[0],r[1],r[2]);
      k.p(bn,'sph2','c',inn,c[0]+fwd.x*T*.5,c[1]+fwd.y*T*.5,c[2]+fwd.z*T*.5,W*.36,L*.42,T*.5,r[0],r[1],r[2]);
      k.p(bn,'sph2','c',fur,p[0]+v.x*L*.1,p[1]+v.y*L*.1,p[2]+v.z*L*.1,W*.36,L*.16,T*1.3,r[0],r[1],r[2]);
      if(e.tip)k.p(bn,'sph2','c',e.tip(C),p[0]+v.x*L*.86,p[1]+v.y*L*.86,p[2]+v.z*L*.86,W*.3,L*.14,T*1.06,r[0],r[1],r[2])}
    else if(e.t=='small'){const r=fkRot(d,tw);k.p(bn,'sph2','c',fur,p[0]+v.x*L*.35,p[1]+v.y*L*.35,p[2]+v.z*L*.35,W,L*.5,T,r[0],r[1],r[2]);k.p(bn,'sph2','c',C.FURD,p[0]+v.x*L*.35+fwd.x*T*.5,p[1]+v.y*L*.35+fwd.y*T*.5,p[2]+v.z*L*.35+fwd.z*T*.5,W*.6,L*.3,T*.5,r[0],r[1],r[2])}
    else if(e.t=='tuft'){// owl: feather tufts (three feathers fanned)
      for(let i=0;i<3;i++){const dd=[d[0]+s*(i-1)*.18,d[1],d[2]-(i-1)*.1];fkDir(k,bn,'cone4','c',i==1?fur:C.FURD,p,dd,L*(1-.15*Math.abs(i-1)),W,T,tw+Math.PI/4)}}});
  }
// ---------------- horns and antlers (tubes on the head bone) ----------------
function fkPath(pts,col,r0,r1,k,bn,sides){for(let i=0;i<pts.length-1;i++){const u0=i/(pts.length-1),u1=(i+1)/(pts.length-1);k.L(bn||'head','c',col,pts[i],pts[i+1],r0+(r1-r0)*u0,r0+(r1-r0)*u1,sides||6)}}
// a smooth lofted horn through points (radius r(t)), ridges every few rings
function fkHornLoft(B,pts,rf,col,ridge){const P=pts.map(p=>({x:p[0],y:p[1],z:p[2],w:[['head',1]]}));gkTubeS(B,P,t=>rf(t)*(ridge&&Math.floor(t*(pts.length-1)*1.5)%2?.93:1),col,{seg:8,cap:true})}
// antlers: a beam rising back and out with tines toward the front
function fkAntlers(k,D,C,o){const base=fkSurf(D,o.z,o.phi,-.004),col=C.HORN,dk=mdSh(C.HORN,.75);
  [-1,1].forEach(s=>{const b0=[s*base[0],base[1],base[2]],pts=[b0];let p=b0.slice(),d=[s*.45,1,-.35];
    for(let i=1;i<=o.seg;i++){const t=i/o.seg;d=[s*(.55+.25*t),1-.35*t,-.3+.45*t];const L=o.len/o.seg,n=Math.hypot(...d);p=[p[0]+d[0]/n*L,p[1]+d[1]/n*L,p[2]+d[2]/n*L];pts.push(p.slice())}
    k.p('head','tor','c',dk,b0[0],b0[1]+.006,b0[2],.024,.016,.024,0,0,-s*.4);
    fkPath(pts,col,o.r,o.r*.45,k);
    o.tines.forEach(([at,len,fw])=>{const i=Math.min(pts.length-1,Math.round(at*(pts.length-1))),a=pts[i],e=[a[0]+s*len*.25,a[1]+len*.8,a[2]+len*fw];k.L('head','c',col,a,e,o.r*.75,o.r*.15,5)})})}
// ---------------- paws (town-folk hands: from the folk skeleton's own wrists) ----------------
function fkPaws(B,P,D,C){const pw=D.paw,k=dkKit(),pc=pw.colOf?pw.colOf(C):C.FUR,padC=pw.padColOf?pw.padColOf(C):C.PINK,clawC=pw.clawCol?pw.clawCol(C):C.CLAW;
  [['aL1','aL2',-1],['aR1','aR2',1]].forEach(([a,b,s])=>{const A=mdV(P.bones[a]),W=mdV(P.bones[b]),d=W.clone().sub(A).normalize(),z=new FKV(0,0,1),e=z.clone().sub(d.clone().multiplyScalar(z.dot(d))).normalize(),
      sd=new FKV().crossVectors(d,e).multiplyScalar(s),bw=[[b,1]],xo=s*((mdBuildF(P)-1)*.12+(P.armX||0)),pl=pw.plen||1,at=(t,o,l)=>W.clone().add(d.clone().multiplyScalar(t)).add(e.clone().multiplyScalar(o)).add(sd.clone().multiplyScalar(l||0)).add(new FKV(xo,0,.005));
    const n=pw.n;
    for(let i=0;i<n;i++){const o=(i-(n-1)/2)*(pw.spread||.0112)*(pw.palm||1),len=pw.len[i],sp=(i-(n-1)/2)*.05,R=[];let p=at(.028*pl,o),dir=d.clone().add(e.clone().multiplyScalar(sp)).normalize();
      const rr=pw.rad||1,rad=[.0062*rr,.0056*rr,.0047*rr,.0036*rr,.0024*rr],seg=[0,.012,.012,.008,.006],curl=pw.curl==null?1:pw.curl;
      for(let j=0;j<5;j++){if(j){const st=len*seg[j]/.038;p=p.clone().add(dir.clone().multiplyScalar(st));dir=dir.clone().add(sd.clone().multiplyScalar((.16+.1*j)*curl)).normalize()}
        R.push({p:p.toArray(),rx:rad[j],f:rad[j],b:rad[j],w:bw})}
      mdLoft(B,R,{seg:6,capB:true,col:m=>m.i>3.6&&pw.pad?padC:pc});
      const t=new FKV(...R[4].p);
      if(pw.pad)k.p(b,'sph2','c',padC,t.x,t.y,t.z,rad[4]*1.3,rad[4]*1.1,rad[4]*1.3);
      if(pw.claw)k.L(b,'c',clawC,t.clone().sub(dir.clone().multiplyScalar(.003)).toArray(),t.clone().add(dir.clone().add(sd.clone().multiplyScalar(.6)).normalize().multiplyScalar(pw.claw)).toArray(),pw.nail?.0045:.0032,pw.nail?.003:.0004,4)}
    if(pw.thumb!==false){const tp=at(.012*pl,.017*(pw.palm||1)),td=d.clone().multiplyScalar(.45).add(e.clone().multiplyScalar(.85)).add(sd.clone().multiplyScalar(.25)).normalize(),tl=pw.tlen||.017;
      mdLoft(B,[{p:tp.toArray(),rx:.0068,f:.0068,b:.0068,w:bw},{p:tp.clone().add(td.clone().multiplyScalar(tl*.6)).toArray(),rx:.0058,f:.0058,b:.0058,w:bw},{p:tp.clone().add(td.clone().multiplyScalar(tl)).toArray(),rx:.0038,f:.0038,b:.0038,w:bw}],{seg:6,capB:true,col:pc});
      const tt=tp.clone().add(td.clone().multiplyScalar(tl));if(pw.claw)k.L(b,'c',clawC,tt.toArray(),tt.clone().add(td.clone().multiplyScalar(pw.claw*.8)).toArray(),.003,.0004,4)}});
  mdKit(B,k)}
// ---------------- hooves: the foot rings end in a dark cloven hoof ----------------
function fkHooves(B,P,D,C){const k=dkKit();[-1,1].forEach(s=>{const l=(s<0?'lh':'rh')+'2',A=mdV(P.bones[l]),F=D.foot,lf=P.lf||1,z=A.z+.1*F.len*lf;
  [-1,1].forEach(q=>{k.p(l,'sph2','c',C.HOOF,A.x+q*.022*lf*F.w,.028,z,.026*lf*F.w,.03,.045*lf,0,q*.08,0)});
  k.p(l,'box','c',mdSh(C.HOOF,.5),A.x,.03,z+.02,.006,.05,.06);
  k.p(l,'tor','c',mdMix(C.FUR,C.HOOF,.5),A.x,.07,A.z+.02,.05*lf*F.w,.03,.055*lf,0,0,0)});mdKit(B,k)}
// ---------------- the head ----------------
// D: SN (fkSN(D.hp)), EYEP, eyes (brEyes options), nose ('nose' | 'pink' | 'snout' | 'beak' | 'none'), jaw [z0, z1, o], whisk [z, y, n, len],
//    ear, skull(m, C) paint, face(k, B, D, C, P) species details, horns(k, B, D, C)
function fkHead(D,B,P,o){const C=BR.C,k=dkKit();P.head={w:1,jaw:.9,top:1,len:1,fwd:0};const H=P._H=mdHeadR(P);
  // the neck: from the collar line up into the skull, as thick as the species' (a bear's or an owl's head sits on a thick neck)
  {const n=D.neck||[.066,.07,.07],q=brSkullAt(D,D.SN[0][0]*.3),yb=q.yc-q.b*.55;mdLoft(B,[{p:[0,1.0,-.008],rx:n[0]*.95,f:n[0]*.9,b:n[0]*.95,w:[['chest',.4],['neck',.6]]},{p:[0,1.035,-.012],rx:n[0],f:n[0]*.97,b:n[0]*.97,w:[['neck',.7],['head',.3]]},
    {p:[0,Math.max(1.07,(1.035+yb)/2),-.016],rx:n[1],f:n[1]*.97,b:n[1],w:[['neck',.3],['head',.7]]},{p:[0,Math.max(1.1,yb),-.02],rx:n[2],f:n[2]*.95,b:n[2],w:[['head',1]]}],
    {seg:14,col:m=>D.neckCol?D.neckCol(m,C):m.s>.45?C.BELLY:C.FUR})}
  brSkull(B,D,m=>D.skull?D.skull(m,C):(m.s<-.5&&m.r.p[2]>-.02?C.BELLY:m.s>.55&&m.r.p[2]<.0?C.FURD:C.FUR),{seg:D.seg||18,noNeck:true});
  if(D.jaw)brJaw(B,D,D.jaw[0],D.jaw[1],D.jaw[3]?D.jaw[3](C):C.BELLY,D.jaw[2]||{});
  const tip=D.SN[D.SN.length-1];
  if(D.nose=='nose'||D.nose=='pink')brNose(k,D,D.nose=='pink'?C.PINK:C.NOSE,D.noseSz||1,D.noseDy||0);
  if(D.eyes!==false)brEyes(k,D,Object.assign({sz:1,fw:.8},D.eyes||{}));
  if(D.whisk)brWhiskers(k,D,D.whisk[0],D.whisk[1],D.whisk[2],D.whisk[3],D.whisk[4]);
  fkEars(k,B,D,C);
  if(D.face)D.face(k,B,D,C,P);
  mdKit(B,k);return H}
// register a species (2810): fills SN / EYEP from the head parameters; the beast hooks need TR / armK / legK / foot / paw
function fkSpecies(key,D){D.key=key;D.SN=fkSN(D.hp);const s=D.SN,em=D.eyeAt||[.55,.28];
  if(!D.EYEP){const R=D.hp.R||.1,L=D.hp.L||1,zc=D.hp.zc==null?-.01:D.hp.zc,ez=zc+R*L*em[0],q=brSkullAt(D,ez);D.EYEP=[0,q.yc+q.f*em[1],ez]}
  D.TR=D.TR||[[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1]];D.armK=D.armK||[.95,.95,.92,.9,.9,.85];D.legK=D.legK||[1.05,1.08,1.02,.95,.9,.85,.82];
  D.foot=D.foot||{len:1.05,w:.85,h:.85};D.paw=D.paw||{n:4,len:[.026,.03,.03,.025],claw:.008,spread:.0115,pad:true,curl:1};D.toes=D.toes||{n:4,len:.04,claw:.012,pad:true};if(!D.toes.colOf)D.toes.colOf=C=>D.toeCol?D.toeCol(C):C.FUR;if(!D.paw.colOf)D.paw.colOf=C=>D.handCol?D.handCol(C):C.FUR;
  D.tailCol=D.tailCol||((m,C)=>C.FUR);D.muzzleZ=D.muzzleZ||s[s.length-1][0]-.05;D.hoodZ=D.hoodZ==null?.03:D.hoodZ;D.crownZ=D.crownZ==null?-.04:D.crownZ;
  D.head=function(B,P,o){return fkHead(this,B,P,o)};
  FK137.sp[key]=D;return D}
// the skull's front surface z at (x, y) (searching from the muzzle tip back), or null when (x, y) is outside the head
function fkFrontZ(D,x,y){const z1=D.SN[D.SN.length-1][0],z0=D.SN[0][0];for(let z=z1;z>=z0;z-=.002){const q=brSkullAt(D,z),dy=y-q.yc,r=dy>0?q.f:q.b;if((x/q.rx)**2+(dy/r)**2<=1)return z}return null}
// the top of the skull at z (for hats), and the widest half-width
function fkTop(D,z){const q=brSkullAt(D,z);return q.yc+q.f}
