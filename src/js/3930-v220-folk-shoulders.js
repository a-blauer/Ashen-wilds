// ================= v220: town folk shoulders — the body is built with its arms hanging =================
// Owner (Nov 11 2026): "Our villager npcs are using a bad skeleton model which makes their shoulders rest in a weird spot."
// Why they looked wrong: the folk skeleton (idlNB) is bound with the forearms folded across the belly, and the body mesh was
// built in that pose. Since v197 the folk stand with relaxed arms, so the whole upper arm was turned ~30 degrees away from
// the pose it was modelled in: the shoulder's top ring (which sat 3 cm ABOVE the joint, at neck height, with a dome on it)
// swung up and back into a hump beside the neck, and the torso's top ring was as wide as the shoulders (a flat shelf).
// Now, for every folk species (v142 anatomy):
//  * the body, clothes, paws and sleeves are built with the arm bones in the relaxed pose (the same directions v197 uses,
//    RLX197.U / .F), so the mesh is modelled the way the folk actually stand;
//  * the shoulder is a sloped deltoid: the arm's first ring starts inside the chest (toward the neck) and the second sits
//    just under the joint, so the top of the arm runs down and out from the neck instead of standing up beside it;
//  * the torso's top ring is narrower (a trapezius slope from the neck to the shoulder, no shelf);
//  * then every vertex is carried back to the bind pose with its bones (fk220Unrelax, the inverse of the relaxed rotations),
//    so the skeleton, the rest pose, the work poses, held tools and every animation are exactly what they were. Folded arms
//    (a keeper at work, a warden on guard) are now the bent pose of a straight arm, which is what an elbow is for.
// Co-op: models only, built the same on every client (no random numbers).
var FK220={on:true,cur:null,sh:{r0:[-.062,-.014,-.004,.86],r1:[.012,-.046,0,1.0],top:.8,top2:.97,nk:1.14}};
// the arm bones of the build skeleton in the relaxed pose + the rotations that bring a relaxed vertex back to the bind pose
function fk220Rlx(D,N){if(D._rlx220)return D._rlx220;const V=THREE.Vector3,Q=THREE.Quaternion,M={},X={};for(const k in N)M[k]=N[k].slice();
  const UF=typeof RLX197!='undefined'?RLX197:{U:[-.17,-1,-.05],F:[.05,-1,.24]};
  ['L','R'].forEach(s=>{const m=s=='L'?1:-1,n0='a'+s+'0',n1='a'+s+'1',n2='a'+s+'2',A0=mdV(N[n0]),A1=mdV(N[n1]),A2=mdV(N[n2]);
    const d01=A1.clone().sub(A0),d12=A2.clone().sub(A1),U=new V(UF.U[0]*m,UF.U[1],UF.U[2]).normalize(),F=new V(UF.F[0]*m,UF.F[1],UF.F[2]).normalize();
    const q0=new Q().setFromUnitVectors(d01.clone().normalize(),U),q1=new Q().setFromUnitVectors(d12.clone().normalize(),F.clone().applyQuaternion(q0.clone().invert())),Qw=q0.clone().multiply(q1);
    const A1r=A0.clone().addScaledVector(U,d01.length()),A2r=A1r.clone().addScaledVector(F,d12.length());
    M[n1]=[N[n1][0],A1r.x,A1r.y,A1r.z];M[n2]=[N[n2][0],A2r.x,A2r.y,A2r.z];
    X[n0]={c:A0,to:A0,q:q0.clone().invert()};X[n1]={c:A1r,to:A1,q:Qw.clone().invert()};X[n2]={c:A2r,to:A2,q:Qw.clone().invert()}});
  return D._rlx220={N:M,X}}
{const f=fkNB;fkNB=function(D){const N=f.apply(this,arguments);if(FK220.cur!==D||!FK142.pre)return N;return fk220Rlx(D,N).N}}
// shoulder rings (only while a folk body is being built)
{const f=mdArm;mdArm=function(P,s){const R=f.apply(this,arguments);if(!FK220.cur||!BR.on)return R;const S=FK220.sh,bn=s<0?'aL':'aR',J=mdV(P.bones[bn+'0']),xo=R[1].p[0]-J.x;
  const set=(i,q,w)=>{const r=R[i]=Object.assign({},R[i]);r.p=[J.x+xo+s*q[0],J.y+q[1],J.z+q[2]];r.rx*=q[3];r.f*=q[3];r.b*=q[3];r.w=w};
  set(0,S.r0,[['chest',.72],[bn+'0',.28]]);set(1,S.r1,[['chest',.16],[bn+'0',.84]]);return R}}
// the torso's top: no shelf at shoulder width under the neck
{const f=mdTorso;mdTorso=function(P){const R=f.apply(this,arguments);if(!FK220.cur||!BR.on)return R;
  return R.map(r=>Math.abs(r.y-.972)<.004?Object.assign({},r,{rx:r.rx*FK220.sh.top}):Math.abs(r.y-.93)<.004?Object.assign({},r,{rx:r.rx*FK220.sh.top2}):Math.abs(r.y-1)<.004?Object.assign({},r,{rx:r.rx*FK220.sh.nk}):r)}}
// carry the built (relaxed) body back to the bind pose: every vertex with its arm bones
function fk220Unrelax(B,D){const R=D._rlx220;if(!R)return;const X=B.O.map(n=>R.X[n]||null),V=new THREE.Vector3();
  for(const t in B.L){const L=B.L[t],p=L.p,si=L.si,sw=L.sw,nv=p.length/3;
    for(let v=0;v<nv;v++){let any=false;for(let j=0;j<4;j++)if(sw[4*v+j]&&X[si[4*v+j]]){any=true;break}if(!any)continue;
      const px=p[3*v],py=p[3*v+1],pz=p[3*v+2];let x=0,y=0,z=0,ws=0;
      for(let j=0;j<4;j++){const w=sw[4*v+j];if(!w)continue;const T=X[si[4*v+j]];ws+=w;
        if(T){V.set(px-T.c.x,py-T.c.y,pz-T.c.z).applyQuaternion(T.q);x+=w*(V.x+T.to.x);y+=w*(V.y+T.to.y);z+=w*(V.z+T.to.z)}else{x+=w*px;y+=w*py;z+=w*pz}}
      if(ws>0){p[3*v]=x/ws;p[3*v+1]=y/ws;p[3*v+2]=z/ws}}}}
{const f=fk142Deform;fk142Deform=function(B,D,A){if(FK220.cur===D)fk220Unrelax(B,D);return f.apply(this,arguments)}}
{const f=fkBuild;fkBuild=function(D,pk,o){if(!FK220.on||!fk142A(D))return f.apply(this,arguments);const c0=FK220.cur;FK220.cur=D;try{return f.apply(this,arguments)}finally{FK220.cur=c0}}}
{const f=fkKey;fkKey=function(o,pk){return f.apply(this,arguments)+(FK220.on&&fk142A(FK137.sp[pk.sp])?'|v220':'')}}
