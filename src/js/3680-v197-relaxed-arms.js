// =====================================================================================================
// v197 relaxed arms for the town folk (owner, Nov 4 2026: "all of our animal characters and villagers arms
// are bent in a static kind of way that seems unnatural").
// Why they looked stiff: the folk skeleton (idlNB) is bound with the forearms folded forward across the belly
// (about 60 degrees at the elbow). Standing, the idle moved the elbows only 2-4 degrees, so that fold showed as-is;
// walking, czWalkPose103 added one fixed forearm twist and swung only the shoulders, so each arm swung as one stiff
// piece; the v196 villager poses add fixed angles on top of the fold.
// Now every folk rig gets a relaxed arm, measured from its own bones (species have different shoulders):
//   * upper arm hanging down, a little out from the body; forearm a little forward (about 15-20 degrees at the elbow);
//   * czReset103 puts the arms there (the base for standing, walking and the v196 poses);
//   * idle: the elbows and shoulders drift slowly, a layer after the v93 idle (it restores exactly what it changed);
//   * walk: the shoulders swing against the legs and the elbow bends more as the arm comes forward;
//   * czRest103 still records the bind pose, so the keepers' work poses (wkAnim103, measured from that rest) and
//     anything else built on the rest are unchanged. The lantern wardens keep their own weapon poses (no relax).
// The rig data lives on the pelvis bone (userData.rlx197), so a rebuilt figure (fkRebuild) gets fresh data.
// =====================================================================================================
var RLX197={U:[-.17,-1,-.05],F:[.05,-1,.24],tw:0,on:true,_q:null};
// relaxed arm rotations for a folk rig in its bind pose (bones straight from mkBones, not yet posed)
function rlx197Calc(B){if(!B||!B.pelvis||!B.aL0||!B.aL1||!B.aL2||!B.aR0||!B.aR1||!B.aR2)return null;
  let root=B.pelvis;while(root.parent)root=root.parent;root.updateMatrixWorld(true);
  const V=THREE.Vector3,Q=THREE.Quaternion,E={},BD={},Mi=(B.pelvis.parent?B.pelvis.parent.getWorldQuaternion(new Q()):new Q()).invert(); // the model's own frame
  ['L','R'].forEach(s=>{const m=s=='L'?1:-1,a0=B['a'+s+'0'],a1=B['a'+s+'1'],a2=B['a'+s+'2'];
    BD['a'+s+'0']=[a0.rotation.x,a0.rotation.y,a0.rotation.z];BD['a'+s+'1']=[a1.rotation.x,a1.rotation.y,a1.rotation.z];
    const Qp=Mi.clone().multiply(a0.parent.getWorldQuaternion(new Q())),Qpi=Qp.clone().invert();
    const U=new V(RLX197.U[0]*m,RLX197.U[1],RLX197.U[2]).normalize(),F=new V(RLX197.F[0]*m,RLX197.F[1],RLX197.F[2]).normalize();
    // upper arm: turn the shoulder so the elbow lies along U (keeps the bind twist)
    const cur0=a1.position.clone().normalize().applyQuaternion(a0.quaternion),want0=U.clone().applyQuaternion(Qpi).normalize();
    const q0=new Q().setFromUnitVectors(cur0,want0).multiply(a0.quaternion);
    // forearm: in the turned upper arm's frame, the wrist lies along F
    const Q1p=Qp.clone().multiply(q0),cur1=a2.position.clone().normalize().applyQuaternion(a1.quaternion),want1=F.clone().applyQuaternion(Q1p.clone().invert()).normalize();
    let q1=new Q().setFromUnitVectors(cur1,want1).multiply(a1.quaternion);
    if(RLX197.tw)q1=new Q().setFromAxisAngle(want1,RLX197.tw*m).multiply(q1);
    const e0=new THREE.Euler().setFromQuaternion(q0),e1=new THREE.Euler().setFromQuaternion(q1);
    E['a'+s+'0']=[e0.x,e0.y,e0.z];E['a'+s+'1']=[e1.x,e1.y,e1.z]});
  return {E,B:BD,seed:Math.random()*100,L:null}}
function rlx197Of(g){const b=g&&g.bones&&g.bones.pelvis;if(!b)return null;return b.userData.rlx197||(b.userData.rlx197N?null:rlx197Ensure(g))}
// figures built before this file loaded (towns are built while the script runs): measure them now, in their rest pose
function rlx197Ensure(g){const b=g.bones.pelvis;b.userData.rlx197N=1;if(!RLX197.on||(g.userData&&(g.userData.mq||g.userData.rlxNo)))return null;
  const m=g.children&&g.children.find(c=>c.isSkinnedMesh&&c.userData&&c.userData.fk);if(!m)return null;
  const R=(g._wk&&g._wk.rest)||(g.userData&&g.userData.rest)||null,keep=[];
  for(const k in g.bones){const o=g.bones[k];keep.push([o,o.rotation.x,o.rotation.y,o.rotation.z]);const r=R&&R[k];if(r)o.rotation.set(r[0],r[1],r[2]);else o.rotation.set(0,0,0)}
  let A=null;try{A=rlx197Calc(g.bones);if(A){A.nose=rlx197Nose({meshes:[m],bones:g.bones});b.userData.rlx197=A}}catch(e){console.warn('v197 arms (late)',e)}
  finally{keep.forEach(([o,x,y,z])=>o.rotation.set(x,y,z))}return A}
function rlx197Set(g,A){const B=g.bones;for(const k in A.E){const b=B[k],e=A.E[k];if(b)b.rotation.set(e[0],e[1],e[2])}A.L=null;A.on=1}
// the idle layer: undo last frame's drift exactly (or by subtraction if a pose layer touched the bones since)
function rlx197Undo(g,A){const L=A.L;if(!L)return;A.L=null;for(const it of L){const b=it[0].rotation;
    if(b.x===it[4]&&b.y===it[5]&&b.z===it[6])b.set(it[1],it[2],it[3]);else{b.x-=it[4]-it[1];b.y-=it[5]-it[2];b.z-=it[6]-it[3]}}}
function rlx197Life(g,A,now){const B=g.bones,t=now/1000+A.seed,L=A.L=[];
  const add=(k,x,y,z)=>{const b=B[k];if(!b)return;const r=b.rotation,o=[b,r.x,r.y,r.z];r.x+=x;r.y+=y;r.z+=z;o.push(r.x,r.y,r.z);L.push(o)};
  // slow and uneven: two waves per joint, the sides out of step; now and then the elbows bend a little more (a shift of weight)
  const sh=Math.max(0,Math.sin(t*.21))**6;
  ['L','R'].forEach((s,i)=>{const m=i?-1:1,p=i*1.9;
    add('a'+s+'0',.035*Math.sin(t*.47+p)+.02*Math.sin(t*1.13+p*2),0,m*(-.025-.02*Math.sin(t*.31+p)));
    add('a'+s+'1',-.06-.05*Math.sin(t*.53+p+.8)-.03*Math.sin(t*1.27+p)-.12*sh,0,0)})}
// ---- the rig ----
// the snout tip in the head's frame (front-most bind vertex skinned to the head), cached on the shared geometry; the eating
// paw aims just under it, so long muzzles (stag, fox) and short faces (owl, mouse) both get the food at the mouth
function rlx197Nose(rig){const m=rig.meshes[0],G=m&&m.geometry;if(!G)return null;if(G.userData.rlx197N!==undefined)return G.userData.rlx197N;
  let r=null;try{const hb=rig.bones.head,arr=m.skeleton.bones,pa=G.attributes.position,si=G.attributes.skinIndex,sw=G.attributes.skinWeight,inH=arr.map(b=>{let p=b;while(p){if(p===hb)return 1;p=p.parent}return 0});
    let bi=-1,bz=-1e9;for(let i=0;i<pa.count;i++){let w=0;for(let j=0;j<4;j++)if(inH[si.array[i*4+j]])w+=sw.array[i*4+j];if(w>=.6&&pa.getZ(i)>bz){bz=pa.getZ(i);bi=i}}
    if(bi>=0){let root=hb;while(root.parent)root=root.parent;root.updateMatrixWorld(true);const v=new THREE.Vector3(pa.getX(bi),pa.getY(bi),pa.getZ(bi)).applyMatrix4(m.matrixWorld);r=hb.worldToLocal(v).toArray()}}catch(e){r=null}
  return G.userData.rlx197N=r}
{const f=idlNpcBody;idlNpcBody=function(o){const rig=f.apply(this,arguments);try{if(RLX197.on&&rig&&rig.fk&&rig.bones){const A=rlx197Calc(rig.bones);if(A){A.nose=rlx197Nose(rig);rig.bones.pelvis.userData.rlx197=A}}}catch(e){console.warn('v197 arms',e)}return rig}}
// the lantern wardens hold weapons with poses of their own: no relaxed arms there
{const f=mqw143Make;mqw143Make=function(){const g=f.apply(this,arguments);try{if(g&&g.userData)g.userData.rlxNo=1;const b=g&&g.bones&&g.bones.pelvis;if(b&&b.userData.rlx197){const A=b.userData.rlx197;rlx197Undo(g,A);
      for(const k in A.B){const r=A.B[k];g.bones[k].rotation.set(r[0],r[1],r[2])}delete b.userData.rlx197}}catch(e){console.warn('v197 wardens',e)}return g}}
// the rest stays the bind pose (work poses and the walk are measured from it)
{const f=czRest103;czRest103=function(g){const R=f.apply(this,arguments);try{const A=rlx197Of(g);if(A)for(const k in A.B)if(R[k]){const r=A.B[k];R[k][0]=r[0];R[k][1]=r[1];R[k][2]=r[2]}}catch(e){}return R}}
{const f=czReset103;czReset103=function(g){const r=f.apply(this,arguments);try{const A=rlx197Of(g);if(A&&!g._wk)rlx197Set(g,A)}catch(e){}return r}}
// ---- standing ----
{const f=idlNpc;idlNpc=function(g,now){const A=rlx197Of(g);if(!A||g._wk){if(A)A.L=null;return f.apply(this,arguments)}
  try{rlx197Undo(g,A);if(!A.on)rlx197Set(g,A)}catch(e){}
  const r=f.apply(this,arguments);
  try{if(g.visible&&typeof IDL!='undefined'&&IDL&&IDL.on)rlx197Life(g,A,now)}catch(e){}return r}}
// ---- walking ----
{const f=czWalkPose103;czWalkPose103=function(g,ph,amp){const r=f.apply(this,arguments);try{const A=rlx197Of(g);if(A&&!g._wk){const B=g.bones,s=Math.sin(ph),a=amp==null?1:amp;
    rlx197Set(g,A);
    // the arm swings against the leg on its side; the elbow bends as it comes forward and opens as it goes back
    const R=(k,x,z)=>{const b=B[k];if(b){b.rotation.x+=x;b.rotation.z+=z}};
    const sb=v=>v*(v>0?.2:.34); // forward swing (x<0) bigger than the back swing, as in a real walk; a far back swing also tugs the chest skin
    R('aL0',sb(s)*a,-.03*a);R('aR0',sb(-s)*a,.03*a);
    R('aL1',-(.1+.34*Math.max(0,-s)+.06*Math.max(0,s))*a,0);R('aR1',-(.1+.34*Math.max(0,s)+.06*Math.max(0,-s))*a,0);
    if(B.aL2)B.aL2.rotation.x+=-.12*Math.max(0,-s)*a;if(B.aR2)B.aR2.rotation.x+=-.12*Math.max(0,s)*a}}catch(e){}return r}}
function rlx197Aim(g,A,sd,T,pole,tw){const B=g.bones,a0=B['a'+sd+'0'],a1=B['a'+sd+'1'],a2=B['a'+sd+'2'],V=THREE.Vector3,Q=THREE.Quaternion;
  const S=a0.position,l0=a1.position.length(),l1=a2.position.length(),D=new V().subVectors(T,S);let d=D.length();if(d<1e-5)return null;
  const n=D.clone().divideScalar(d);d=Math.min(Math.max(d,Math.abs(l0-l1)+1e-3),l0+l1-1e-3);
  const a=(l0*l0-l1*l1+d*d)/(2*d),h=Math.sqrt(Math.max(0,l0*l0-a*a)),p=pole.clone().addScaledVector(n,-pole.dot(n));if(p.lengthSq()<1e-8)p.set(0,-1,0);p.normalize();
  const E=S.clone().addScaledVector(n,a).addScaledVector(p,h),W=S.clone().addScaledVector(n,d),U=E.clone().sub(S).normalize(),F=W.sub(E).normalize();
  const b0=A.B['a'+sd+'0'],b1=A.B['a'+sd+'1'],qb0=new Q().setFromEuler(new THREE.Euler(b0[0],b0[1],b0[2])),qb1=new Q().setFromEuler(new THREE.Euler(b1[0],b1[1],b1[2]));
  const q0=new Q().setFromUnitVectors(a1.position.clone().normalize().applyQuaternion(qb0),U).multiply(qb0);
  const w1=F.clone().applyQuaternion(q0.clone().invert()).normalize();let q1=new Q().setFromUnitVectors(a2.position.clone().normalize().applyQuaternion(qb1),w1).multiply(qb1);
  if(tw)q1=new Q().setFromAxisAngle(w1,tw).multiply(q1);
  const e0=new THREE.Euler().setFromQuaternion(q0),e1=new THREE.Euler().setFromQuaternion(q1);return [e0,e1]}
// pose one arm with the IK (recorded through dm196R so dm196Undo takes it off again); T / pole are in the chest's frame
function rlx197Put(g,A,sd,T,pole,tw){const r=rlx197Aim(g,A,sd,T,pole,tw);if(!r)return;['0','1'].forEach((j,i)=>{const b=g.bones['a'+sd+j],e=r[i];dm196R(g,'a'+sd+j,e.x-b.rotation.x,e.y-b.rotation.y,e.z-b.rotation.z)})}
function rlx197Loc(g,w){const c=g.bones.chest;c.updateMatrixWorld(true);return c.worldToLocal(w.clone())}
function rlx197W(g,k){return g.bones[k].getWorldPosition(new THREE.Vector3())}
// ---- the v196 villager poses for the relaxed arm: each paw is placed at a point (on the thigh, at the mouth, palm to palm)
//      and the elbow solved toward a pole (out from the body and a little back), so the poses fit every species ----
{const f=dm196Pose0;dm196Pose0=function(o,g,A,s,t){const X=rlx197Of(g);if(!X)return f.apply(this,arguments);const R=(k,x,y,z)=>dm196R(g,k,x,y,z),V=THREE.Vector3;
  const sh=sd=>g.bones['a'+sd+'0'].position,m=sd=>sd=='L'?-1:1; // m: the outward x of that side in the chest frame
  const pole=(sd,x,y,z)=>new V(m(sd)*x,y,z);
  const rel=(sd,x,y,z)=>{const S=sh(sd);return new V(S.x+m(sd)*x,S.y+y,S.z+z)}; // a point from the shoulder (x>0 = outward)
  const relW=(sd,k)=>rlx197Loc(g,rlx197W(g,'a'+sd+k));
  // a paw resting on the thigh (seated)
  const lapT=sd=>{const h=sd=='L'?'l':'r',a=rlx197W(g,h+'h0'),b=rlx197W(g,h+'h1');return rlx197Loc(g,a.lerp(b,.62).add(new V(0,.09,0)))}; // forward of a round belly
  const lap=sd=>{g.updateMatrixWorld(true);const T=lapT(sd);T.x+=m(sd)*.025;rlx197Put(g,X,sd,T,pole(sd,1,-.2,-.5));R('a'+sd+'2',.45,0,0)};
  if(s.sit){dm196Sit(g,s.h);g.updateMatrixWorld(true);
    if(A.a=='eat'){// left paw on the lap; the right lifts food to the mouth every few seconds
      const p=(t*.45+o.i*.3)%3,lift=p<1?Math.sin(p*Math.PI):0;lap('L');
      const L=lapT('R');L.x+=.025;const hb=g.bones.head,N=X.nose||[0,.08,.16];
      // the mouth: a little behind and under the snout tip; the wrist below it and to the side, so the paw comes up to it
      const Mw=hb.localToWorld(new V(0,N[1]-.045,N[2]*.78-.01)),M=rlx197Loc(g,Mw);M.x+=.04;M.y-=.055;M.z-=.015;
      rlx197Put(g,X,'R',L.lerp(M,lift),pole('R',1,-.6-.3*lift,-.3+.6*lift),-.6*lift);
      R('aR2',.45*(1-lift)-.55*lift,0,0);R('head',.18-.22*lift,0,0);R('spine',.08)}
    else if(A.a=='warm'){// both paws held out toward the fire, rubbed together now and then
      const rb=Math.max(0,Math.sin(t*.37+o.i))**4,w=.025*rb*Math.sin(t*7);
      ['L','R'].forEach((sd,i)=>{const S=sh(sd),T=new V(m(sd)*(.07+(i?w:-w)),S.y-.17,S.z+.34);rlx197Put(g,X,sd,T,pole(sd,1,-1,-.2),m(sd)*.5);R('a'+sd+'2',-.25,0,0)});
      R('head',.05,.15*Math.sin(t*.4));R('spine',.06)}
    else if(A.a=='rim'){// on the fountain's rim: paws planted beside the hips, legs swinging
      const sw=Math.sin(t*1.6+o.i);R('lh1',.25*sw);R('rh1',-.25*sw);R('head',-.05,.5*Math.sin(t*.35+o.i),0);g.updateMatrixWorld(true);
      ['L','R'].forEach(sd=>{const h=sd=='L'?'l':'r',P=rlx197Loc(g,rlx197W(g,h+'h0'));const T=new V(P.x+m(sd)*.13,P.y-.02,P.z+.03);rlx197Put(g,X,sd,T,pole(sd,.3,0,-1));R('a'+sd+'2',.9,0,0)})}
    else{// resting: paws on the thighs, looking about; now and then one paw rubs the knee
      R('head',.08,.35*Math.sin(t*.3+o.i),0);lap('L');lap('R');R('aR1',.05*Math.max(0,Math.sin(t*.6+o.i))**3)}}
  else if(A.a=='listen'){// swaying to the music, clapping along now and then
    const sw=Math.sin(t*2.1+o.i),cl=((t*.5+o.i*.37)%4)<1.1;R('spine',0,0,.07*sw);R('chest',0,.08*sw,.04*sw);R('head',-.08,.1*sw,.08*sw);
    if(cl){const k=Math.abs(Math.sin(t*9));['L','R'].forEach(sd=>{const S=sh(sd),T=new V(m(sd)*(.035+.09*k),S.y-.09,S.z+.27);rlx197Put(g,X,sd,T,pole(sd,1,-1.1,-.3),m(sd)*1.1)})}
    else{R('aL0',.03*sw);R('aR0',-.03*sw)}}
  else if(A.a=='browse'){// bent over the stall, the right paw reaching to the goods and picking one up
    const p=(t*.35+o.i)%4,r=p<1.2?Math.sin(p/1.2*Math.PI):0;R('spine',.12);R('head',.25,.3*Math.sin(t*.5+o.i),0);
    g.updateMatrixWorld(true);const W0=relW('R','2'),T=W0.clone().lerp(rel('R',-.03,-.2,.38),.35+.65*r);rlx197Put(g,X,'R',T,pole('R',1,-.6,-.4),-.3*r);R('aR2',-.3*r,0,0);R('aL1',-.15)}}}
// ---- v196 pose undo, exact: each bone gets back the very rotation it had before the pose (subtracting the offsets left
//      rounding crumbs, and the v93 idle then took each crumb-changed value as a new base and added its sway again: the
//      arms crept away over a minute of sitting). The pelvis height entry ([b,0,0,0,y]) is unchanged. ----
dm196R=function(g,k,x,y,z){const b=g.bones[k];if(!b)return;x=x||0;y=y||0;z=z||0;const r=b.rotation;if(DM196V.cur)DM196V.cur.push([b,x,y,z,undefined,r.x,r.y,r.z]);r.x+=x;r.y+=y;r.z+=z};
dm196Undo=function(o){const L=o._pz;if(!L)return;for(let i=L.length-1;i>=0;i--){const [b,x,y,z,py,ox,oy,oz]=L[i];if(py!=null){b.position.y=py;continue}
    if(ox!==undefined)b.rotation.set(ox,oy,oz);else{b.rotation.x-=x;b.rotation.y-=y;b.rotation.z-=z}}o._pz=null};

// ---- v197: the Rune Sage's rune necklace moves with the skin it sits on. The stones were tied rigidly to the chest bone, but
//      the chest's skin near the shoulder is partly weighted to the upper arm; with the arm now hanging and swinging, that skin
//      moved off the outer stones (5-8 mm, v142_folk walk). The same ray as fk142Hug; the result also carries the hit
//      triangle's skin weights ([[bone, w] ...], up to 4) for gkW. ----
function rlx197Hug(B,P,y,a,off){const q=mdTorsoAt(P,y),cz=q.z||0,dx=Math.sin(a),dz=Math.cos(a),ox=dx*.5,oz=cz+dz*.5;let best=1e9,hit=null;
  for(const t of ['c','m']){const L=B.L[t],p=L&&L.p;if(!p)continue;
    for(let i=0;i+8<p.length;i+=9){const ay=p[i+1],by=p[i+4],cy=p[i+7];if((ay<y&&by<y&&cy<y)||(ay>y&&by>y&&cy>y))continue;
      const e1x=p[i+3]-p[i],e1y=by-ay,e1z=p[i+5]-p[i+2],e2x=p[i+6]-p[i],e2y=cy-ay,e2z=p[i+8]-p[i+2];
      const rx=-dx,rz=-dz,px=-rz*e2y,py=rz*e2x-rx*e2z,pz=rx*e2y,det=e1x*px+e1y*py+e1z*pz;if(Math.abs(det)<1e-12)continue;
      const iv=1/det,tx=ox-p[i],ty=y-ay,tz=oz-p[i+2],u=(tx*px+ty*py+tz*pz)*iv;if(u<0||u>1)continue;
      const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x,v=(rx*qx+rz*qz)*iv;if(v<0||u+v>1)continue;
      const s=(e2x*qx+e2y*qy+e2z*qz)*iv;if(s>0&&s<best){best=s;hit=[L,i/9,u,v]}}}
  if(best>=1e9)return mdTP(P,y,a,(P.tOff||0)+off);const s=best-off,r=[ox-dx*s,y,oz-dz*s];
  if(hit&&hit[0].si&&B.O){const [L,ti,u,v]=hit,bw=[1-u-v,u,v],acc={};for(let c=0;c<3;c++){const vi=(ti*3+c)*4;for(let j=0;j<4;j++){const w=L.sw[vi+j]*bw[c];if(w>0){const n=B.O[L.si[vi+j]];acc[n]=(acc[n]||0)+w}}}
    const W=Object.entries(acc).sort((x,y)=>y[1]-x[1]).slice(0,4);if(W.length)r.w=W}
  return r}
