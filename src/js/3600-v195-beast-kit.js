// ================= v195: the beast kit — heroes and townsfolk built like the v181 cage foes =================
// Owner (Nov 3 2026): "Our animal models for companions and townsfolk seem a little outdated compared to our newer enemies
// with the upgraded modeling techniques and logic. Can we build a more advanced modeling framework like we did for the
// humanoids — but this time for our characters/townsfolk? I want their proportions to be better and their
// animations/gestures to be smoother and more natural. Let's start with the weasel ranger."
//
// The v114 beast heroes (and the v137 folk on the same engine) were separate tubes pushed into each other: a 12-sided torso,
// 7-sided arms and 8-sided legs, a skull loft with spheres glued on for eyes, ears and nose, and fur painted per ring in
// blocky panels. A race (or later a folk species) that sets `D.bf` is built with this kit instead:
//  * body (`bf195Body`): ONE cage of the whole figure, the way the v181 foes are built (3393): torso rings → the neck flowing
//    up into the skull, the arms grown out of shoulder sockets cut in the torso, the legs out of the split bottom ring with a
//    crotch, then one Catmull-Clark step (`cgSub`). The cage rings are the race's own md rings (mdTorso / mdArm / mdLeg, which
//    the beast engine already scales per race), so every armour shell, sleeve, boot and hood built from those rings still fits.
//    Joints get proper weights from the rings, the shoulders and hips are real joined shapes, the torso is shaped by the
//    race's `bf.tpush` (keel, flat back, tucked belly). Clothes painted on the body (shirts, breeches, belts: P.col / P.paint)
//    stay crisp per face; fur is coloured per corner by the race's `bf.fur` (a flowing throat / belly line, a darker back),
//    so colour follows form instead of stepping ring by ring. Shading is baked into the vertex colours (`cgShade`: creases,
//    height, top light). Hands (palm) and feet stay the md lofts the paws, toes and boots are built on.
//  * head (`bf195Head`): sculpted from anatomy (the v142 folk method: ellipsoids and round cones in `bf.head.forms`, meshed
//    by `fksLoft` as flat-faceted rings), coloured per corner (`bf.head.paint`), with ambient occlusion read from the
//    sculpt's own distance field (eye sockets, under the jaw, behind the cheeks darken) and a top light. The skull rings
//    (D.SN), the eye frame (EYEP / eyeR) and the ears' ellipsoids are measured from the sculpt, so every helmet, hood, mask
//    and goggle of the class fits the new head. Eyes are set into the surface along their gaze, ears are lofted and pressed
//    into the skull (no edge off the head), whiskers root on the whisker pads.
//  * tail (`bf195Tail`): a cage tube (8 sides, smoothed) from inside the pelvis to a rounded tip, thick at the root, coloured
//    per corner (`bf.tail.col`).
//  * motion (`bf195Motion`, after every other animation layer, through the beast engine's exact undo `brAddR`): critically
//    damped springs, so nothing snaps: the head leads into turns and steadies against the body's bob, the spine follows the
//    gait with a little lag and settles with a soft overshoot when you stop, the arms swing with follow-through, and the race's
//    own idle gestures (`bf.gest`) play now and then between the v93 fidgets (never at the same time, never in combat or
//    while attacking). Gestures are local cosmetics: every client runs them on every hero model it draws (co-op partners
//    included), like the v93 idle.
// `BF195.on=false` builds and animates the old models.
var BF195={on:true,limbK:1.1,torK:1.04};
function bf195Use(P){return !!(BF195&&BF195.on&&BR.on&&BR.R&&BR.R.bf&&P&&!P.noTorso)}
function bf195SS(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}
function bf195Cl(x,a,b){return x<a?a:x>b?b:x}
// HSL helpers for palettes (linear colours, as everywhere in the game)
function bf195HSL(c,s,l){const C=new THREE.Color(mdC(c)),h={};C.getHSL(h);C.setHSL(h.h,s==null?h.s:s,l==null?h.l:l);return C.getHex()}
function bf195HSLk(c,ks,kl){const C=new THREE.Color(mdC(c)),h={};C.getHSL(h);C.setHSL(h.h,Math.min(1,h.s*ks),Math.min(1,h.l*kl));return C.getHex()}
// mix as RGB arrays (per-corner colours)
function bf195Rgb(c){const C=new THREE.Color(mdC(c));return [C.r,C.g,C.b]}
function bf195Mix(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
function bf195Hex(q){return new THREE.Color(Math.max(0,q[0]),Math.max(0,q[1]),Math.max(0,q[2])).getHex()}
// torso / neck weights by height (human space: chest → neck → head over the neck)
function bf195TW(y){return y<=.97?mdTorsoW(y):y<=1.03?mdWb('chest','neck',(y-.97)/.06):y<=1.12?mdWb('neck','head',(y-1.03)/.09):[['head',1]]}

// ---------------- the body cage ----------------
function bf195Body(B,P){const D=BR.R,F=D.bf,C=P.col,T=P._T||(P._T=mdTorso(P)),M=cgMesh(B),n=F.n||16,H=n/2,Q=n/4,tk=F.torK||BF195.torK,lk=F.limbK||BF195.limbK;
  // torso rings up to the collar, then the race's neck rings (the neck flows up into the back of the skull)
  const TR=T.filter(r=>r.y<.99&&r.y>=(F.hipY||0)).map(r=>[r.y,r.rx*tk,r.f*tk,r.b*tk,r.p[2]]).concat((F.neck?F.neck(T):[]));
  // the hip rings share their weight with the thigh on each side, so a flexed hip bends the buttock with the leg (no ledge
  // where the body's bottom ring stays behind a thigh swung forward)
  const hipW=(y,j,a)=>{const k=y<TR[0][0]+.005?.38:y<TR[0][0]+.07?.14:0,c=Math.cos(a);if(!k||Math.abs(c)<.2)return bf195TW(y);return [['pelvis',1-k*Math.min(1,Math.abs(c)*1.4)],[(c>0?'rh0':'lh0'),k*Math.min(1,Math.abs(c)*1.4)]]};
  const tr=TR.map((q,i)=>cgRing(M,[0,q[0],q[4]||0],[1,0,0],[0,0,1],n,q[1],q[2],q[3],q[0]<TR[0][0]+.07?(j,a)=>hipW(q[0],j,a):bf195TW(q[0]),{a0:0,push:F.tpush?(j,a)=>F.tpush(q[0],a,q):null}));
  // the shoulder sockets: the three torso rings round the arm's root
  let ia=0;{const ay=mdArm(P,1)[1].p[1];let bd=1e9;for(let i=1;i+2<TR.length;i++){const d=Math.abs(TR[i+1][0]-ay);if(d<bd&&TR[i+2][0]<1.0){bd=d;ia=i}}}
  const sock=(i,j)=>i>=ia&&i<ia+2&&(j==n-1||j==0||j==H-1||j==H),cent=i=>[0,(TR[i][0]+TR[i+1][0])/2,((TR[i][4]||0)+(TR[i+1][4]||0))/2];
  for(let i=0;i<tr.length-1;i++)cgBand(M,tr[i],tr[i+1],TR[i+1][0]>1.0?'neck':'torso',cent(i),j=>sock(i,j));
  const top=TR[TR.length-1];cgCap(M,tr[tr.length-1],[0,top[0]+.01,(top[4]||0)],[['head',1]],'neck',[0,top[0]-.06,top[4]||0]);
  const AR={},LR={};
  // arms: the socket boundary (8 vertices) → the md arm rings 1 (below the shoulder) … 5 (wrist)
  [-1,1].forEach(s=>{const bn=s<0?'aL':'aR',R=mdArm(P,s),R0=tr[ia],R1=tr[ia+1],R2=tr[ia+2];AR[s]=R;
    const c1=s>0?[1,0,n-1]:[H-1,H,H+1],root=[R0[c1[0]],R0[c1[1]],R0[c1[2]],R1[c1[2]],R2[c1[2]],R2[c1[1]],R2[c1[0]],R1[c1[0]]];
    const sc=root.reduce((a,i)=>add3(a,mul3(M.V[i].slice(0,3),1/8)),[0,0,0]),sO=nrm3([sc[0],0,sc[2]-(TR[ia+1][4]||0)]);
    const use=R.slice(1,6),pts=use.map(r=>r.p),r0=Math.max(use[0].rx,use[0].f)*lk;
    let prev=root;use.forEach((q,i)=>{const c=pts[i],dn=nrm3(sub3(pts[Math.min(i+1,pts.length-1)],i?pts[i-1]:sc)),
      u0=nrm3(sub3([s,0,0],mul3(dn,dn[0]*s))),fv=nrm3(cross3(dn,u0)),f0=fv[2]<0?mul3(fv,-1):fv,ring=[];
      for(let j=0;j<8;j++){const a=(j-5)*Math.PI/4,ca=Math.cos(a),sa=Math.sin(a),ro=q.rx*lk,rf=(sa>=0?q.f:q.b)*lk;
        let p=[c[0]+u0[0]*ca*ro+f0[0]*sa*rf,c[1]+u0[1]*ca*ro+f0[1]*sa*rf,c[2]+u0[2]*ca*ro+f0[2]*sa*rf];
        // the shoulder grows out of the body (v181 j2): the first two rings start from the socket pushed outward
        if(i<2){const Pv=M.V[root[j]],b=i?.78:.42,o2=(i?.55:.3)*r0;p=lerp3([Pv[0]+sO[0]*o2,Pv[1]+sO[1]*o2,Pv[2]+sO[2]*o2],p,b)}
        ring.push(cgVert(M,p,q.w))}
      cgBand(M,prev,ring,'arm',c);prev=ring});
    const a1=pts[pts.length-2],a2=pts[pts.length-1];cgCap(M,prev,add3(a2,mul3(nrm3(sub3(a2,a1)),.01)),[[bn+'2',1]],'arm',a1)});
  // legs: the bottom torso ring split in two halves with a crotch line, then the md leg rings below the crotch
  const R=tr[0],q0=TR[0],y0=q0[0],L0=mdLeg(P,1),lr=Math.max(L0[1].rx,L0[1].f)*lk;
  const cf=cgVert(M,[0,y0-.03,q0[2]*.5+(q0[4]||0)],[['pelvis',1]]),cm=cgVert(M,[0,y0-(.3*lr+.02),q0[4]||0],[['pelvis',1]]),cb=cgVert(M,[0,y0-.03,-q0[3]*.5+(q0[4]||0)],[['pelvis',1]]);
  [-1,1].forEach(s=>{const l=s<0?'lh':'rh',Rl=mdLeg(P,s);LR[s]=Rl;
    const half=[];for(let i=0;i<=H;i++)half.push(s>0?(Q-i+n)%n:Q+i);const root=half.map(j=>R[j]).concat([cb,cm,cf]),LN=root.length;
    const top=Object.assign({},Rl[1],{p:[Rl[1].p[0],Math.min(Rl[1].p[1],y0-.035),Rl[1].p[2]],w:[['pelvis',.35],[l+'0',.65]]}),use=[top].concat(Rl.slice(2));
    // the half of the bottom torso ring this leg grows from: the first leg rings start inside it (no lip where a leg is wider
    // than its half of the hips), then widen into the md leg rings
    const hx=q0[1]*.5,hr=q0[1]*.52,hf=Math.min(q0[2],q0[3])*.95;
    let prev=root;use.forEach((q,i)=>{const t=i==0?.35:i==1?.72:1,c=[s*(hx+(Math.abs(q.p[0])-hx)*t),q.p[1],q.p[2]],rx=hr+(q.rx*lk-hr)*t,ring=[];
      for(let j=0;j<LN;j++){const a=(j<=H?90-j*180/H:[-135,180,135][j-H-1])*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),rf=hf+((sa>=0?q.f:q.b)*lk-hf)*t;
        let p=[c[0]+s*ca*rx,c[1],c[2]+sa*rf];
        if(i<2){const Pv=M.V[root[j]],b=i?.8:.45;p=lerp3([Pv[0],Pv[1]-(i?.5:.3)*lr,Pv[2]],p,b)}
        ring.push(cgVert(M,p,q.w))}
      cgBand(M,prev,ring,'leg',c);prev=ring});
    const ak=use[use.length-1].p;cgCap(M,prev,[ak[0],ak[1]-.02,ak[2]],[[l+'2',1]],'leg',[ak[0],ak[1]+.1,ak[2]])});
  cgOrient(M);const SM=cgSub(M);
  if(F.sculpt)cgSculpt(SM,{torso:1,neck:1,arm:1,leg:1},(x,y,z,nn)=>F.sculpt(x,y,z,nn));
  SM.shade=cgShade(SM,Object.assign({cav:.3,hk:.24,dk:.16,min:.55,blur:3},F.shade||{}));
  // ---- colour: clothes painted crisp per face, as mdBody paints its lofts; uncovered fur flows per corner ----
  const tp=P.paint.torso,belt=P.beltY==null?.6:P.beltY,BC=BR.C;
  const furSet=new Set([BC.FUR,BC.BELLY,BC.FURL,BC.FURD,mdC(C.skin)].map(mdC));if(D.handCol)furSet.add(mdC(D.handCol(BC)));
  // the fur shades the bare model / outfits paint from the palette (thigh fronts, wrists, toes) count as fur too
  [[BC.FUR,BC.BELLY,.4],[BC.FUR,C.hand,.3],[BC.FUR,C.boot,.5],[BC.FUR,BC.BELLY,.5]].forEach(q=>{if(q[1]!=null)furSet.add(mdC(mdMix(q[0],q[1],q[2])))});
  const tIdx=y=>{for(let i=0;i<T.length-1;i++)if(y<=T[i+1].y)return i+Math.max(0,Math.min(1,(y-T[i].y)/(T[i+1].y-T[i].y)));return T.length-1};
  // nearest point on a ring polyline → fractional ring index
  const along=(Rr,p)=>{let best=1e9,bi=0;for(let i=0;i<Rr.length-1;i++){const a=Rr[i].p,b=Rr[i+1].p,ab=sub3(b,a),l2=ab[0]*ab[0]+ab[1]*ab[1]+ab[2]*ab[2]||1e-9,t=bf195Cl(((p[0]-a[0])*ab[0]+(p[1]-a[1])*ab[1]+(p[2]-a[2])*ab[2])/l2,0,1),
      q=add3(a,mul3(ab,t)),d=(q[0]-p[0])**2+(q[1]-p[1])**2+(q[2]-p[2])**2;if(d<best){best=d;bi=i+t}}return bi};
  const mdm=m=>{if(m.part=='torso'||m.part=='neck'){const fi=tIdx(m.y),z0=T[Math.min(T.length-1,Math.round(fi))].p[2],dx=m.x,dz=m.z-z0,l=Math.hypot(dx,dz)||1;
      return {x:m.x,y:m.y,z:m.z,s:dz/l,c:-dx/l,i:fi,r:T[Math.min(T.length-1,Math.round(fi))],kind:'t'}}
    const s=m.x<0?-1:1;if(m.part=='arm'){const Rr=AR[s],fi=along(Rr,[m.x,m.y,m.z]);return {x:m.x,y:m.y,z:m.z,s:m.nz,c:m.nx*s,i:fi+2,r:Rr[Math.min(Rr.length-1,Math.round(fi))],kind:'a',side:s}}
    const Rr=LR[s],fi=along(Rr,[m.x,m.y,m.z]);return {x:m.x,y:m.y,z:m.z,s:m.nz,c:m.nx*s,i:fi+2,r:Rr[Math.min(Rr.length-1,Math.round(fi))],kind:'l',side:s}};
  const colT=m=>m.y>1.0?C.neck:m.y>.985&&!P.highNeck?C.neck:Math.abs(m.y-belt)<.026&&C.belt!=null?C.belt:m.y<belt?(P.paint.torsoLo?P.paint.torsoLo(m):C.torsoLo==C.torso&&m.y<.5?C.pants:C.torsoLo):tp?tp(m):C.torso;
  const colA=(m,s)=>{const p=m.r.part;return p=='hand'?(P.paint.hand?P.paint.hand(m,s):C.hand):p=='up'||(p=='el'&&m.i<5.5)?(P.paint.sleeve?P.paint.sleeve(m,s):C.sleeve):(P.paint.fore?P.paint.fore(m,s):C.fore)};
  const colL=(m,s)=>{const p=m.r.part;return (P.paint.leg?P.paint.leg(m,s):null)||(p=='shin'||p=='ankle'||(p=='knee'&&m.i>5.5)?C.shin:C.pants)};
  const col=m=>{const q=mdm(m),c=q.kind=='t'?colT(q):q.kind=='a'?colA(q,q.side):colL(q,q.side);if(c==null)return null;const h=mdC(c);return furSet.has(h)&&F.fur?null:h};
  cgEmit(B,SM,col,{vcol:F.fur?(m=>{const c=F.fur(m,BC,mdm(m));return Array.isArray(c)?bf195Hex(c):c}):null});
  // the palms the paws grow from: the md hand rings, starting inside the wrist
  [-1,1].forEach(s=>{const Rr=AR[s],w=Rr[5],d=nrm3(sub3(Rr[6].p,w.p)),st=Object.assign({},w,{p:sub3(w.p,mul3(d,.022)),rx:w.rx*.95,f:w.f*.95,b:w.b*.95});
    mdLoft(B,[st].concat(Rr.slice(6)),{seg:7,capB:true,col:m=>P.paint.hand?P.paint.hand(m,s):C.hand})});
  // feet: the md foot lofts (bare toes and boots are built on them), as mdBody does
  [-1,1].forEach(s=>mdLoft(B,mdFoot(P,s),{seg:7,ref:[0,1,0],capA:true,capB:true,col:m=>m.y<.022?C.sole:C.boot}));
  P.bf195=SM;return SM}

// ---------------- the sculpted head ----------------
// S = D.bf.head: {forms (FKH shapes, head-local metres from FKS.C0, +z forward), bb, seg, rings, eye {c, g, r}, ear {p, len, w, th,
// out, back, tw}, paint(p, n, C, ao) → colour or [r,g,b], whisk {p, n, len}, ao strength}
function bf195Grad(S,p,e){e=e||.0015;const f=fksEval;const g=[f(S,[p[0]+e,p[1],p[2]])-f(S,[p[0]-e,p[1],p[2]]),f(S,[p[0],p[1]+e,p[2]])-f(S,[p[0],p[1]-e,p[2]]),f(S,[p[0],p[1],p[2]+e])-f(S,[p[0],p[1],p[2]-e])];return nrm3(g)}
// ambient occlusion from the distance field: how much the surface is enclosed a few mm out along its normal
function bf195AO(S,p,n){let o=0;const H=[.006,.013,.022,.034];for(let i=0;i<H.length;i++){const h=H[i],d=fksEval(S,[p[0]+n[0]*h,p[1]+n[1]*h,p[2]+n[2]*h]);o+=Math.max(0,h-d)/h*(1/(i+1))}
  return bf195Cl(1-o*(S.ao==null?.55:S.ao),.45,1)}
// measure the skull for the helmets (rings, eye frame, ears) once per recipe
function bf195HeadSetup(D){const S=D.bf.head;if(S._set)return;S._set=1;const C0=FKS.C0;
  D.SN=fksRings(S,20);D.muzzleZ=S.muzzleZ!=null?S.muzzleZ+C0[2]:D.SN[D.SN.length-1][0]-.05;
  const e=S.eye,g=nrm3(e.g);let t=-.04;while(t<.05&&bf195EvalSolid(S,add3(e.c,mul3(g,t)))<0)t+=.0005;S._eyeS=add3(e.c,mul3(g,t));
  D.EYEP=[S._eyeS[0]+C0[0],S._eyeS[1]+C0[1],S._eyeS[2]+C0[2]];D.eyeR=e.r*1.35;D.eyeFw=e.fw==null?.8:e.fw;D.eyeIns=0;
  // ear base on the skull, the ear ellipsoid for the helmets' ear openings (right ear; mirrored)
  if(S.ear){const q=S.ear,d=bf195EarDir(q);let b=q.p.slice(),k=0;while(k<60&&fksEval(S,b)<0){b=add3(b,mul3(d,.001));k++}S._earB=b;
    const c=add3(b,mul3(d,q.len*.42));D.EAR=[c[0]+C0[0],c[1]+C0[1],c[2]+C0[2]];D.earR=q.w*.95;
    D.earE=[D.EAR[0],D.EAR[1],D.EAR[2],q.w*1.05,q.len*.6,q.th*1.4,-(q.back||0),(q.out||0)*.9,(q.out||0)*.7]}}
function bf195EarDir(q){const o=q.out||0,b=q.back||0;return nrm3([Math.sin(o),Math.cos(o)*Math.cos(b),-Math.cos(o)*Math.sin(b)])}
// the head mesh: fksLoft's rings (z slices, rays from each slice's centre), but every slice uses a smoothed centre line, so the
// rings' sides run straight along the head and each quad is nearly flat (fksLoft's per-slice centre jumped between slices and
// twisted the quads: their two triangles caught the light differently, a zigzag of 'teeth' along the muzzle)
function bf195Loft(S){const bb=S.bb,M=S.seg||16,n=S.rings||21,st=.0015,ins=(x,y,z)=>fksEval(S,[x,y,z])<0;
  let zA=bb[2],zB=bb[5];for(let z=bb[2];z<bb[5];z+=st){let h=false;for(let y=bb[1];y<bb[4];y+=st)if(ins(0,y,z)){h=true;break}if(h){zA=z;break}}
  for(let z=bb[5];z>bb[2];z-=st){let h=false;for(let y=bb[1];y<bb[4];y+=st)if(ins(0,y,z)){h=true;break}if(h){zB=z;break}}
  const Z=[],Y=[];for(let i=0;i<n;i++){const u=i/(n-1),z=zA+.004+(zB-zA-.008)*(u<.5?Math.pow(u*2,1.1)/2:1-Math.pow((1-u)*2,1.25)/2);
    let top=null,bot=null;for(let y=bb[4];y>bb[1];y-=st)if(ins(0,y,z)){top=y;break}for(let y=bb[1];y<bb[4];y+=st)if(ins(0,y,z)){bot=y;break}if(top==null)continue;Z.push(z);Y.push((top+bot)/2)}
  for(let k=0;k<3;k++)for(let i=1;i<Y.length-1;i++)Y[i]=(Y[i-1]+2*Y[i]+Y[i+1])/4;
  const R=Z.map((z,i)=>{const yc=Y[i],ring=[];for(let j=0;j<M;j++){const a=j/M*Math.PI*2,dx=Math.sin(a),dy=Math.cos(a);let r=.24;while(r>0&&!ins(dx*r,yc+dy*r,z))r-=st;
      let lo=Math.max(0,r),hi=r+st;for(let k=0;k<8;k++){const m=(lo+hi)/2;if(ins(dx*m,yc+dy*m,z))lo=m;else hi=m}const rr=Math.max(.003,lo);ring.push([dx*rr,yc+dy*rr,z])}return {z,yc,ring}});
  const V=[],T=[];R.forEach(q=>q.ring.forEach(p=>V.push(p)));const id=(i,j)=>i*M+(j%M);
  // split each quad along its shorter diagonal (the flatter fold)
  for(let i=0;i+1<R.length;i++)for(let j=0;j<M;j++){const a=id(i,j),b=id(i,j+1),c=id(i+1,j+1),d=id(i+1,j),q=[0,1,2].map(k=>(V[a][k]+V[b][k]+V[c][k]+V[d][k])/4),
      d1=Math.hypot(V[a][0]-V[c][0],V[a][1]-V[c][1],V[a][2]-V[c][2]),d2=Math.hypot(V[b][0]-V[d][0],V[b][1]-V[d][1],V[b][2]-V[d][2]);
    const t1=d1<=d2?[a,b,c]:[a,b,d],t2=d1<=d2?[a,c,d]:[b,c,d];t1.q=q;t2.q=q;T.push(t1,t2)}
  const b0=V.length;V.push([0,R[0].yc,zA]);const f0=V.length;V.push([0,R[R.length-1].yc,zB]);const L=R.length-1;
  for(let j=0;j<M;j++){T.push([b0,id(0,j+1),id(0,j)]);T.push([f0,id(L,j),id(L,j+1)])}
  // wind outward (by the field's gradient)
  T.forEach(t=>{const a=V[t[0]],b=V[t[1]],c=V[t[2]],u=sub3(b,a),w=sub3(c,a),nn=cross3(u,w),m=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],g=bf195Grad(S,m,.002);
    if(nn[0]*g[0]+nn[1]*g[1]+nn[2]*g[2]<0){const x=t[1];t[1]=t[2];t[2]=x}});
  return {V,T}}
// the field without its carved parts (eye sockets): where the skin would be, for setting the eyes into it
function bf195EvalSolid(S,p){if(!S._solid)S._solid={forms:S.forms.filter(f=>!f.sub),bb:S.bb};return fksEval(S._solid,p)}
function bf195Head(B,P,D){const S=D.bf.head,C=BR.C,C0=FKS.C0;bf195HeadSetup(D);const Ms=S._mesh||(S._mesh=bf195Loft(S));
  // per vertex: normal from the field, occlusion, top light, colour from the recipe's paint (blended across the facets)
  if(!S._vx||S._vk!==C){const vc=new Map();S._vk=C;S._vx=Ms.V.map(p=>{const n=bf195Grad(S,p),ao=bf195AO(S,p,n),lit=.86+.2*(.5*n[1]+.5),pc=S.paint(p,n,C,ao),rgb=Array.isArray(pc)?pc:bf195Rgb(pc);
      return {n,k:ao*lit,rgb}})}
  const w=mdW(B,[['head',1]]),VV=Ms.V.map((p,i)=>({x:p[0]+C0[0],y:p[1]+C0[1],z:p[2]+C0[2],w,k:S._vx[i].k,rgb:S._vx[i].rgb}));
  for(const t of Ms.T){// crisp regions (nose pad, mouth line): the recipe's crisp(p) gives one colour for the whole facet
    const a=Ms.V[t[0]],b=Ms.V[t[1]],c=Ms.V[t[2]],m=t.q||[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],cr=S.crisp?S.crisp(m,C):null;
    if(cr!=null){const q=bf195Rgb(cr),f=x=>Object.assign({},x,{rgb:q});mdTri(B,'c',f(VV[t[0]]),f(VV[t[1]]),f(VV[t[2]]),0)}
    else mdTri(B,'c',VV[t[0]],VV[t[1]],VV[t[2]],0)}
  const k=dkKit();bf195Eyes(k,D,S,C);if(S.whisk)fksWhiskers(k,D,S.whisk,C);if(S.extra)S.extra(k,B,D,C);mdKit(B,k);
  if(S.ear)bf195Ears(B,D,S,C)}
// eyes: a glossy ball set into the surface along its gaze (about half of it shows), the iris and pupil on its front, a glint
function bf195Eyes(k,D,S,C){const e=S.eye,C0=FKS.C0,g=nrm3(e.g),r=e.r,c=add3(S._eyeS,mul3(g,-r*(e.sink==null?.42:e.sink)));
  [-1,1].forEach(s=>{const G=[s*g[0],g[1],g[2]],ry=Math.atan2(G[0],G[2]),rx=-Math.asin(bf195Cl(G[1],-1,1)),P=(o,t)=>{const q=add3([s*c[0],c[1],c[2]],mul3(G,t));return [q[0]+C0[0],q[1]+C0[1]+(o||0),q[2]+C0[2]]};
    let q=P(0,0);k.p('head','sph2','c',e.ball||0x0a0807,q[0],q[1],q[2],r,r*(e.al||.92),r,rx,ry,0);
    q=P(0,r*.62);k.p('head','sph2','c',C.EYE,q[0],q[1],q[2],r*.66,r*.62*(e.al||.92),r*.42,rx,ry,0);
    q=P(0,r*.8);k.p('head','sph2','c',0x050404,q[0],q[1],q[2],r*(e.pup||.34),r*(e.pupH||.34),r*.26,rx,ry,0);
    q=P(r*.32,r*.86);k.p('head','sph2','c',0xd8d4cc,q[0]+s*r*.05,q[1],q[2],r*.13,r*.13,r*.08,rx,ry,0);
    if(e.lid){q=P(r*.55,r*.12);k.p('head','sph2','c',e.lid(C),q[0],q[1],q[2],r*1.08,r*.42,r*.9,rx-.25,ry,0)}})}
// ears: a loft of 8-sided rings root → tip on the right, mirrored; the root pressed into the skull; the front cupped and painted
function bf195Ears(B,D,S,C){const q=S.ear,C0=FKS.C0,d=bf195EarDir(q),base=S._earB,tw=q.tw||0,V3=THREE.Vector3;
  const dv=new V3(...d),f0=new V3(0,0,1).applyAxisAngle(dv,tw),fwd=f0.sub(dv.clone().multiplyScalar(dv.dot(f0))).normalize(),side=new V3().crossVectors(dv,fwd).normalize();
  const fur=q.col?q.col(C):C.FUR,inn=q.inner?q.inner(C):C.PINK,rim=q.rim?q.rim(C):fur,M=8,ts=[0,.14,.32,.52,.72,.88,1],wf=FKS_EAR[q.t||'round']||FKS_EAR.round;
  const ev=p=>fksEval(S,p),rings=ts.map((t,ri)=>{const c=add3(base,mul3(d,q.len*t)),wd=q.w*Math.max(.1,wf(t)),th=q.th*(1-.55*t),R=[];
    for(let j=0;j<M;j++){const a=j/M*Math.PI*2,cup=(j==2&&ri>0&&t<.9)?-.95:0;let p=[c[0]+side.x*wd*Math.cos(a)+fwd.x*th*(Math.sin(a)+cup),c[1]+side.y*wd*Math.cos(a)+fwd.y*th*(Math.sin(a)+cup),c[2]+side.z*wd*Math.cos(a)+fwd.z*th*(Math.sin(a)+cup)];
      if(ri==0){let k=0;while(k<40&&ev(p)>-.005){p=sub3(p,mul3(d,.002));k++}}R.push(p)}return {t,c,R}});
  const sh=t=>.78+.22*t,hasE=B.O&&B.O.indexOf('erR')>=0,WC={};
  // weights: the root ring on the head; with ear bones (a race skeleton) the next ring half on the ear, the rest on the ear
  const wOf=(sg,t)=>{const k=(sg>0?'R':'L')+(t<.07?0:t<.2?1:2);return WC[k]||(WC[k]=mdW(B,!hasE||t<.07?[['head',1]]:t<.2?[['head',.5],[sg>0?'erR':'erL',.5]]:[[sg>0?'erR':'erL',1]]))};
  [1,-1].forEach(sg=>{const vx=(p,t)=>({x:p[0]*sg+C0[0],y:p[1]+C0[1],z:p[2]+C0[2],w:wOf(sg,t),k:sh(t)}),tri=(a,b,c,col)=>{if(sg>0)mdTri(B,'c',a,b,c,col);else mdTri(B,'c',a,c,b,col)};
    for(let i=0;i+1<rings.length;i++){const A=rings[i],Bq=rings[i+1];for(let j=0;j<M;j++){const cc=Bq.t>=.88?rim:(j==1||j==2||j==3)&&A.t>=.1?inn:fur,col=mdC(cc);
      tri(vx(A.R[j],A.t),vx(A.R[(j+1)%M],A.t),vx(Bq.R[(j+1)%M],Bq.t),col);tri(vx(A.R[j],A.t),vx(Bq.R[(j+1)%M],Bq.t),vx(Bq.R[j],Bq.t),col)}}
    const Lr=rings[rings.length-1];for(let j=0;j<M;j++)tri(vx(Lr.R[j],1),vx(Lr.R[(j+1)%M],1),vx(Lr.c,1),mdC(rim))})}

// ---------------- the tail: a smoothed cage tube ----------------
// rings from D.TP ([x, y, z, r] per bone point; D.bf.tail.r(i, r) may reshape the radius), weighted like brTail
function bf195Tail(B){const D=BR.R,TP=D.TP,Ft=D.bf.tail||{};if(!TP||!TP.length)return;const M=cgMesh(B),last=D.TB.length-1,n=8,R=[];
  TP.forEach((t,i)=>{const w=i==0?[['pelvis',.6],['tl0',.4]]:i>last?[['tl'+last,1]]:[['tl'+(i-1),.4],['tl'+i,.6]],p=[t[0],t[1],t[2]],nx=TP[Math.min(i+1,TP.length-1)],pv=TP[Math.max(i-1,0)],
      dn=nrm3(sub3([nx[0],nx[1],nx[2]],[pv[0],pv[1],pv[2]])),u=nrm3(sub3([1,0,0],mul3(dn,dn[0]))),v=nrm3(cross3(dn,u)),r=(Ft.r?Ft.r(i,t[3]):t[3])*(Ft.k||1.1),ry=r*(Ft.flat||.92),ring=[];   // ×1.1: the smoothing step shrinks the tube inside its cage
    for(let j=0;j<n;j++){const a=j*Math.PI*2/n;ring.push(cgVert(M,[p[0]+u[0]*Math.cos(a)*r+v[0]*Math.sin(a)*ry,p[1]+u[1]*Math.cos(a)*r+v[1]*Math.sin(a)*ry,p[2]+u[2]*Math.cos(a)*r+v[2]*Math.sin(a)*ry],w))}R.push({ring,p,dn})});
  for(let i=0;i+1<R.length;i++)cgBand(M,R[i].ring,R[i+1].ring,'tail',R[i].p);
  const L=R[R.length-1],lw=TP.length-1<=last?[['tl'+Math.max(0,TP.length-2),1]]:[['tl'+last,1]];
  cgCap(M,L.ring,add3(L.p,mul3(L.dn,TP[TP.length-1][3]*.9)),lw,'tail',R[R.length-2].p);cgCap(M,R[0].ring,sub3(R[0].p,mul3(R[0].dn,.01)),[['pelvis',1]],'tail',R[1].p);
  cgOrient(M);const SM=cgSub(M);SM.shade=cgShade(SM,{cav:.4,hk:.15,dk:.18,min:.6,blur:2});
  // the position along the tail (0 root → 1 tip) for the colour
  const zs=TP.map(t=>t[2]),z0=zs[0],z1=zs[zs.length-1];
  cgEmit(B,SM,()=>null,{vcol:m=>{const c=Ft.col?Ft.col(m,BR.C,bf195Cl((m.z-z0)/(z1-z0||-1),0,1)):BR.C.FUR;return Array.isArray(c)?bf195Hex(c):c}})}
{const f=brTail;brTail=function(B){if(BF195.on&&BR.on&&BR.R&&BR.R.bf&&BR.R.bf.tail)return bf195Tail(B);return f.apply(this,arguments)}}

// ---------------- motion: springs, follow-through and the race's own gestures ----------------
// Runs after every other layer (outermost animHero wrapper) and writes through brAddR, so the beast engine's exact undo takes
// every offset back before the next frame (no drift, no stacking with the v93 idle's own undo).
// D.bf.motion = {lead, bank, stop, start, flex, armLag} strengths (0 turns a part off); D.bf.gest = [{id, dur, w, fn(u, s, O, t)}]:
// fn adds bone offsets to O ('bone.axis' → radians) for gesture progress u (0..1), side s (±1), seconds t into it.
var BF195M={gmin:6,gmax:13};
// riding: your own hero (riding) or a partner's copy whose presence carries a mount (v150 r.mt150): no gait springs, no gestures
function bf195Rides(H){if(H===pl)return typeof riding!='undefined'&&!!riding;try{if(typeof MP!='undefined'&&MP.rh)for(const k in MP.rh){const r=MP.rh[k];if(r&&r.m===H)return !!r.mt150}}catch(_){}return false}
function bf195Spr(A,i,tg,om,z,dt){const x=A[i]-tg;A[i+1]+=(-2*z*om*A[i+1]-om*om*x)*dt;A[i]+=A[i+1]*dt;return A[i]}
function bf195Motion(H,D,now){const F=D.bf,Mo=F.motion||{},b=H.bones;let S=H._bfm;
  if(!S)S=H._bfm={t:null,sp:new Float64Array(16),wl:0,gT:BF195M.gmin+Math.random()*(BF195M.gmax-BF195M.gmin),g:null,a0:{}};
  let dt=S.t==null?0:(now-S.t)/1000;S.t=now;if(!(dt>=0)||dt>.25){dt=0;S.sp.fill(0)}dt=Math.min(dt,.05);
  const G=H._ga,w=G?bf195Cl(G.w,0,1):(H.mvW||0),turn=G?bf195Cl(G.turn,-6,6):0,acc=G?bf195Cl(G.acc,-30,30):0,ph=G?G.ph:0,A=S.sp;
  const arm=H._brS?bf195Cl(H._brS.a,0,1):1,rid=bf195Rides(H),O={},add=(k,v)=>{O[k]=(O[k]||0)+v};
  if(dt>0){const sub=dt>.02?2:1,h=dt/sub;for(let k=0;k<sub;k++){
    // turn lead: the head and neck look into a turn first (and the body banks a little while moving)
    bf195Spr(A,0,bf195Cl(turn*(Mo.lead==null?.11:Mo.lead),-.5,.5),11,1,h);
    // stopping: the body pitches on with a soft overshoot and settles; a start leans a touch into the push
    bf195Spr(A,2,bf195Cl(Math.max(0,-acc)*(Mo.stop==null?.022:Mo.stop)-Math.max(0,acc)*(Mo.start==null?.006:Mo.start),-.12,.2),9,.42,h)}}
  const lead=A[0],stop=A[2];
  if(!rid){add('neck.y',lead*.38*arm);add('head.y',lead*.55*arm);add('spine.z',-lead*(Mo.bank==null?.12:Mo.bank)*w);
    add('spine.x',stop*.5);add('chest.x',stop*.35);add('head.x',-stop*.6*arm);
    // running: the spine flexes with the stride (a supple, bounding body), twice per cycle, eased in with the gait
    const fl=(Mo.flex==null?.045:Mo.flex)*w*bf195SS(.5,3.5,G?G.v:0);if(fl>1e-4){const c=Math.sin(ph*Math.PI*4);add('spine.x',fl*c);add('chest.x',-fl*.6*c);add('head.x',-fl*.4*c)}
    // arms: the forearm trails the upper arm's swing (follow-through), only while walking / running and no attack pose plays
    if((Mo.armLag==null?1:Mo.armLag)&&arm>.5&&w>.05)['aL','aR'].forEach((bn,i)=>{const u=b[bn+'0'];if(!u)return;const x=u.rotation.x,a0=S.a0[bn];S.a0[bn]=x;if(a0==null||dt<=0)return;
      const v=bf195Cl((x-a0)/dt,-12,12),j=4+i*2;bf195Spr(A,j,v*.045*(Mo.armLag==null?1:Mo.armLag),14,.8,dt);add(bn+'1.x',bf195Cl(A[j],-.25,.25)*w*arm)})}
  // gestures: only standing quiet (no gait, no attack, no combat stance, no v93 fidget playing), never riding
  const I=H._idl,cw=I&&I.sp?bf195Cl(I.sp[2],0,1):0,quiet=!rid&&w<.04&&arm>.97&&cw<.1&&(!I||(I.iw>.85&&I.fid<0)),L=F.gest||[];
  // pictures / tests: BF195M.pose = {id, u, s} shows one gesture at progress u
  const fp=BF195M.pose;if(fp){const G3=L.find(q=>q.id==fp.id);if(G3){const Og={};G3.fn(fp.u,fp.s||1,Og,fp.u*G3.dur);for(const q in Og)add(q,Og[q])}S.g=null}
  else if(S.g){const g=S.g;g.t+=dt;if(quiet&&g.out==null)g.u+=dt/g.d;else{if(g.out==null)g.out=1;g.fo=(g.fo||0)+dt/.35}
    if(g.u>=1||(g.out!=null&&g.fo>=1))S.g=null;
    else{const k=g.out!=null?1-bf195SS(0,1,g.fo):1,Og={};g.G.fn(g.u,g.s,Og,g.t);for(const q in Og)add(q,Og[q]*k);if(I)I.fT=Math.max(I.fT||0,2.5)}}
  else if(L.length&&quiet&&dt>0){S.gT-=dt;if(S.gT<=0){let tot=0;L.forEach(q=>tot+=q.w||1);let r=Math.random()*tot,G2=L[0];for(const q of L){r-=q.w||1;if(r<=0){G2=q;break}}
      S.g={G:G2,u:0,t:0,d:G2.dur,s:Math.random()<.5?-1:1};S.gT=BF195M.gmin+Math.random()*(BF195M.gmax-BF195M.gmin);if(G2.tail&&H._brT)bf195TailKick(H,G2.tail*S.g.s)}}
  else if(!quiet&&S.gT<2)S.gT=2;
  S.gs=0;if(fp||S.g)for(const k in O)S.gs+=Math.abs(O[k]);
  for(const k in O){const v=O[k];if(!v)continue;const d=k.indexOf('.');brAddR(H,k.slice(0,d),k.slice(d+1),v)}}
// a flick of the tail: a sideways push on its springs (brTailAnim's state), rolling down to the tip
function bf195TailKick(H,v){const T=H._brT;if(!T||!T.y)return;for(let i=0;i<T.n;i++)T.y[i*2+1]+=v*(1+i*.15)}
{const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);const H=h||pl;
  try{const D=H&&H._race?BRD[H._race]:null;if(BF195.on&&D&&D.bf&&H.bones&&!H._foe)bf195Motion(H,D,now||0)}catch(e){if(!BF195.err){BF195.err=1;console.warn('v195 motion',e)}}return r}}

// ---------------- a race's own skeleton ----------------
// Owner (Nov 3 2026): "we need new bones for each hero so they can match the skeleton of their own animal. weasel should have
// his own skeleton to make him look more like a weasel."
// A race keeps the hero's bone names (every animation, grip, ability pose, mount pose and worn item drives them) and adds its
// animal's own bones on top (D.skel):
//  * ins: [[name, parent, child, t]] — a bone inserted into a chain at fraction t (the weasel's long spine: spine → sp1 → sp2 →
//    chest; its long neck: neck → nk1 → head). The animations still turn `spine` / `neck`; the motion layer spreads that turn
//    evenly over the chain (each bone takes an equal share, so the chest and head end where the animation put them) and adds
//    the animal's own curve on top, so the body bends as one supple curve instead of at one joint.
//  * add: [[name, parent, x, y, z]] — new bones (ears, toes), driven only by the motion layer.
//  * mf: {name: bone} — whose v99 proportions the new bone takes (a split spine keeps the spine's length and lean).
//  * remap: [{from, bones, ax, at, side}] — every vertex of the hero (body, armour, cloth, kit) weighted to `from` is shared
//    among `bones` by its coordinate `ax` (segment ends `at`, human space), so armour bends exactly like the body under it.
// brDef / brPlan / brRig (2100) read the table; brRig re-parents and drops other races' extra bones (BR_XB) on a race change.
function bf195Skel(D){const K=D.skel;if(!K||D._skel)return;D._skel=1;const T={};for(const n in D.HBX)T[n]=D.HBX[n].slice();
  (K.ins||[]).forEach(([n,par,ch,t])=>{const a=T[par],b=T[ch];T[n]=[par,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t];T[ch][0]=n;BR_XB[n]=1});
  (K.add||[]).forEach(([n,par,x,y,z])=>{T[n]=[par,x,y,z];BR_XB[n]=1});
  const out={},done=new Set(),visit=n=>{if(done.has(n))return;const p=T[n][0];if(p)visit(p);done.add(n);out[n]=T[n]};Object.keys(T).forEach(visit);
  D.HBX=out;D.MF=Object.assign({},K.mf||{});D._pl=null}
// share the `from` weight of every vertex among a chain of bones by position (hat functions between segment centres)
function bf195Share(v,at){const n=at.length-1,c=[];for(let k=0;k<n;k++)c.push((at[k]+at[k+1])/2);const w=new Array(n).fill(0);
  if(v<=c[0])w[0]=1;else if(v>=c[n-1])w[n-1]=1;else for(let k=0;k<n-1;k++)if(v>=c[k]&&v<=c[k+1]){const t=(v-c[k])/(c[k+1]-c[k]);w[k]=1-t;w[k+1]=t;break}return w}
function bf195Remap(B,K){const O=B.O,I=n=>O.indexOf(n),R=(K.remap||[]).map(q=>Object.assign({},q,{fi:I(q.from),bi:q.bones.map(I)})).filter(q=>q.fi>=0&&q.bi.every(i=>i>=0));if(!R.length)return;
  for(const t in B.L){const L=B.L[t];if(!L||!L.p||!L.si)continue;const p=L.p,si=L.si,sw=L.sw,nv=p.length/3;
    for(let v=0;v<nv;v++){let hit=false;for(const q of R)for(let j=0;j<4;j++)if(si[v*4+j]===q.fi&&sw[v*4+j]>0){hit=true;break}if(!hit)continue;
      const W=new Map();for(let j=0;j<4;j++){const i=si[v*4+j],w=sw[v*4+j];if(w>0)W.set(i,(W.get(i)||0)+w)}
      for(const q of R){const w0=W.get(q.fi);if(!w0)continue;const x=p[v*3+(q.ax=='x'?0:q.ax=='y'?1:2)];if(q.side&&Math.sign(p[v*3])!==q.side)continue;
        W.delete(q.fi);bf195Share(x,q.at).forEach((k,j)=>{if(k>0)W.set(q.bi[j],(W.get(q.bi[j])||0)+w0*k)})}
      const L2=[...W.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4);let s=0;L2.forEach(e=>s+=e[1]);
      for(let j=0;j<4;j++){const e=L2[j];si[v*4+j]=e?e[0]:0;sw[v*4+j]=e?e[1]/(s||1):0}}}}
{const f=mdHeroB;mdHeroB=function(cls,L,E){const B=f.apply(this,arguments);try{const r=brRace(L,cls),D=r?BRD[r]:null;if(BF195.on&&D&&D.skel&&B&&B.O)bf195Remap(B,D.skel)}catch(e){console.warn('v195 skeleton weights',e)}return B}}
// the motion layer's part for the new bones: spread the animation's turn over each inserted chain, then the race's own
// curve (D.skel.drive(H, S, dt) for ears, toes and the like)
var BF195_Q={a:null};
function bf195Chain(H,K){const b=H.bones,Q=BF195_Q.a||(BF195_Q.a={q:new THREE.Quaternion(),h:new THREE.Quaternion(),i:new THREE.Quaternion(),e:new THREE.Euler()});
  (K.chains||[]).forEach(ch=>{const root=b[ch[0]];if(!root)return;const n=ch.length;Q.q.copy(root.quaternion);Q.h.copy(Q.i.identity()).slerp(Q.q,1/n);
    Q.e.setFromQuaternion(Q.h,root.rotation.order);['x','y','z'].forEach(ax=>{const d=Q.e[ax]-root.rotation[ax];if(Math.abs(d)>1e-9)brAddR(H,ch[0],ax,d)});
    for(let i=1;i<n;i++){const bn=b[ch[i]];if(bn)bn.quaternion.copy(Q.h)}})}
{const f=bf195Motion;bf195Motion=function(H,D,now){f.apply(this,arguments);const K=D.skel;if(!K||!H.bones)return;
  try{bf195Chain(H,K);if(K.drive)K.drive(H,H._bfm,now)}catch(e){if(!BF195.err2){BF195.err2=1;console.warn('v195 skeleton motion',e)}}}}

// sleeves and shoulder pieces start from the md arm's first ring (mdAS i0 = 0, with a dome over it); on a cage body the
// shoulder is a smooth slope below that ring, so the dome stood above it (through a hood's mantle). bf.sh0 = [drop, scale]
// lowers and narrows that first ring for every piece built from it (the cage body itself never uses it).
{const f=mdArm;mdArm=function(P,s){const R=f.apply(this,arguments);try{if(BF195.on&&BR.on&&BR.R&&BR.R.bf&&BR.R.bf.sh0&&R&&R[0]){const q=BR.R.bf.sh0,r=Object.assign({},R[0]);
  r.p=[r.p[0],r.p[1]-q[0],r.p[2]];r.rx*=q[1];r.f*=q[1];r.b*=q[1];R[0]=r}}catch(_){}return R}}
// capes are pinned on at the shoulders (the v179 foes' rule: the top ring on the back of the collar, not 2–4 cm behind it);
// on the old tube body a hero's cape only touched the body through the tail
{const f=mdCape;mdCape=function(B,P){if(!(BF195.on&&BR.on&&BR.R&&BR.R.bf&&typeof SN179!='undefined'))return f.apply(this,arguments);const o=SN179.hum;SN179.hum=1;try{return f.apply(this,arguments)}finally{SN179.hum=o}}}
