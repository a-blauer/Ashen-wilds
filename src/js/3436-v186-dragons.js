// ================= v186: the dragon family remodelled (owner, Nov 1 2026) =================
// Owner: Drakelet "too simple, low detail"; Gravewyrm "too low detail, too simple, I dont like the thing on top his head
// either"; Pyrewing "head and mouth dont seem right- low detail"; Venomcoil "too low detail, too simple and mouth is not
// right"; Elderdrake "too chunky and boxy- low detail". Same skeletons (Drakelet rig: Drakelet, Pyrewing, Elderdrake;
// Gravewyrm rig: Gravewyrm, Venomcoil), animations and gameplay; new bodies, heads, mouths, wings and evolution looks.
// docs/MODEL_DETAIL_RECIPE.md: faceted low poly, detail from paint and shaped parts, the outline carries identity.
//  * one loft builder (dg186Geo) with sculpt bumps (brow, cheek, nostrils, the dorsal crease) and paint by position
//    (sockets, lip line, palate, scutes, markings), the v186 baked top light and cool shadows, flat facets;
//  * real mouths: the upper head is part of the body loft with a dark palate under it, the lower jaw is its own loft
//    (rear rings on the head, the rest on the jaw bone) that hugs the palate when closed; teeth are seated in both lips,
//    so a bite shows palate, tongue and two rows of teeth;
//  * eyes are glowing almonds with a slit pupil set in a painted, sunken socket under a brow ridge;
//  * membrane wings with an arm, four fingers and a scalloped trailing edge that FOLD along the flank at rest and
//    spread to attack, fly or use a wing ability (three key shapes blended into 11 shared geometries, like the v184
//    bird wings); their evolution is built into the wing (claws, darker edges, glowing veins);
//  * evolution looks rebuilt per species for the new bodies (EVO100.D.Drakelet / .Gravewyrm), one theme each.
var DG186={on:true,lv:10,WG:{},WD:{}};
function dgW(a,b,t){const o={};o[a]=1-(t||0);if(t)o[b]=(o[b]||0)+t;return o}
function dgMixW(A,B,t){const o={};for(const k in A)o[k]=(o[k]||0)+A[k]*(1-t);for(const k in B)o[k]=(o[k]||0)+B[k]*t;return o}
function dgSm(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)}
// profile rows [z, y, half width, above, below, weights, extra] → the section at z (interpolated)
function dgAt(T,z){for(let i=0;i<T.length-1;i++){const A=T[i],B=T[i+1],lo=Math.min(A[0],B[0]),hi=Math.max(A[0],B[0]);if(z>=lo&&z<=hi){const t=(z-A[0])/((B[0]-A[0])||1);
  return {y:A[1]+(B[1]-A[1])*t,w:A[2]+(B[2]-A[2])*t,a:A[3]+(B[3]-A[3])*t,b:A[4]+(B[4]-A[4])*t}}}const E=Math.abs(z-T[0][0])<Math.abs(z-T[T.length-1][0])?T[0]:T[T.length-1];return {y:E[1],w:E[2],a:E[3],b:E[4]}}
// a point on that section: angle t from the top (0 spine, PI/2 flank, PI belly), side s, k = 1 on the surface
function dgPt(T,z,t,s,k){const q=dgAt(T,z),c=Math.cos(t),f=k==null?1:k;return [s*q.w*Math.sin(t)*f,q.y+(c>0?q.a:q.b)*c*f,z]}
// gaussian bumps along the surface normal: [[x,y,z], [rx,ry,rz], amount, mirror]
function dgBumps(B){return p=>{let d=0;for(const b of B){const x=b[3]===0?p[0]:Math.abs(p[0]),q=b[0],r=b[1],u=(x-q[0])/r[0],v=(p[1]-q[1])/r[1],w=(p[2]-q[2])/r[2],e=u*u+v*v+w*w;if(e<9)d+=b[2]*Math.exp(-e)}return d}}
// distance of p to a mirrored point (x taken as |x|)
// a colour with C's hue at a set saturation and lightness (linear: .2 reads mid-dark after the tone curve)
function dgHSL(C,s,l,dh){const h={};new THREE.Color(C).getHSL(h);return new THREE.Color().setHSL((h.h+(dh||0)+1)%1,s,l)}
function dgD(p,q){return Math.hypot(Math.abs(p[0])-q[0],p[1]-q[1],p[2]-q[2])}

// ---------------- the loft builder ----------------
// loft = {rings:[{p,rx,ryT,ryB,w:{bone:w},sqB}], seg (even), ref, rot, capA, capB, paint(col,p,n,r,s,c,i), sculpt(p,n,r,s,c) → mm out}
function dg186Geo(key,n,lofts){
  if(LPG[key])return LPG[key];
  const O=Object.keys(SPEC[n].bones),P=[],Cc=[],SI=[],SW=[],IX=[],V=THREE.Vector3,col=new THREE.Color();
  const bi=b=>{const i=O.indexOf(b);if(i<0)throw new Error('dg186: no bone '+b+' in '+n);return i};
  const skin=w=>{const e=Object.keys(w).map(k=>[bi(k),w[k]]).filter(q=>q[1]>.01).sort((a,b)=>b[1]-a[1]).slice(0,4),s=e.reduce((x,q)=>x+q[1],0)||1;
    while(e.length<4)e.push([0,0]);SI.push(e[0][0],e[1][0],e[2][0],e[3][0]);SW.push(e[0][1]/s,e[1][1]/s,e[2][1]/s,e[3][1]/s)};
  lofts.forEach(L=>{const R=L.rings,seg=L.seg||16,ref=new V(...(L.ref||[0,1,0])),base=P.length/3,pts=R.map(r=>new V(...r.p)),rad=[];
    R.forEach((r,i)=>{const tg=pts[Math.min(i+1,R.length-1)].clone().sub(pts[Math.max(i-1,0)]).normalize(),U=ref.clone().sub(tg.clone().multiplyScalar(ref.dot(tg))).normalize(),Sd=new V().crossVectors(U,tg);
      for(let k=0;k<seg;k++){const a=Math.PI/2+(L.rot||0)+k/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a),ry=s>0?(r.ryT==null?r.rx:r.ryT):(r.ryB==null?r.rx:r.ryB);
        const q2=s<0&&r.sqB?2/r.sqB:0,cq=q2?Math.sign(c)*Math.abs(c)**q2:c,sq=q2?-(Math.abs(s)**q2):s;
        let p=[pts[i].x+Sd.x*cq*r.rx+U.x*sq*ry,pts[i].y+Sd.y*cq*r.rx+U.y*sq*ry,pts[i].z+Sd.z*cq*r.rx+U.z*sq*ry];
        const nn=nrm3([Sd.x*c*ry+U.x*s*r.rx,Sd.y*c*ry+U.y*s*r.rx,Sd.z*c*ry+U.z*s*r.rx]);rad.push(nn);
        if(L.sculpt){const d=L.sculpt(p,nn,r,s,c);if(d)p=add3(p,mul3(nn,d))}
        P.push(p[0],p[1],p[2]);col.setRGB(.5,.5,.5);L.paint(col,p,nn,r,s,c,i);Cc.push(col.r,col.g,col.b);skin(L.skin?L.skin(p,r):r.w)}});
    // winding: the faces of every loft point outward (checked on its fullest ring)
    let fi=0,fr=0;R.forEach((r,i)=>{if(r.rx>fr&&i<R.length-1){fr=r.rx;fi=i}});
    const v=j=>[P[(base+j)*3],P[(base+j)*3+1],P[(base+j)*3+2]],a0=fi*seg,f=cross3(sub3(v(a0+1),v(a0)),sub3(v(a0+seg),v(a0))),flip=(f[0]*rad[a0][0]+f[1]*rad[a0][1]+f[2]*rad[a0][2])>0;
    const tri=(a,b,c)=>flip?IX.push(a,c,b):IX.push(a,b,c);
    for(let i=0;i<R.length-1;i++)for(let k=0;k<seg;k++){const a=base+i*seg+k,a1=base+i*seg+(k+1)%seg,b2=a+seg,b3=a1+seg;tri(a,a1,b2);tri(b2,a1,b3)}
    [[L.capA,0],[L.capB,R.length-1]].forEach(q=>{if(!q[0])return;const r=R[q[1]],ci=P.length/3,c0=pts[q[1]],tg=pts[q[1]?q[1]:1].clone().sub(pts[q[1]?q[1]-1:0]).normalize().multiplyScalar(q[1]?1:-1);
      const ex=r.rx*.35,p=[c0.x+tg.x*ex*(q[0]==2?1:.4),c0.y+tg.y*ex*(q[0]==2?1:.4),c0.z+tg.z*ex*(q[0]==2?1:.4)];P.push(p[0],p[1],p[2]);col.setRGB(.5,.5,.5);L.paint(col,p,tg.toArray(),r,0,0,q[1]);Cc.push(col.r,col.g,col.b);skin(L.skin?L.skin(p,r):r.w);
      const o=base+q[1]*seg;for(let k=0;k<seg;k++){const a=o+k,a1=o+(k+1)%seg;if(q[1])tri(ci,a1,a);else tri(ci,a,a1)}})});
  const G=new THREE.BufferGeometry();
  G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4));
  G.setIndex(IX);G.computeVertexNormals();
  // baked value (as lp186Geo): top light x height, a cool shift in the shadows, a touch of warmth on the lit tops
  const N=G.attributes.normal.array,nv=P.length/3,tmp=new THREE.Color(),cool=new THREE.Color(0x3a4258),warm=new THREE.Color(0xffe2c0);let y0=1e9,y1=-1e9;
  for(let i=0;i<nv;i++){y0=Math.min(y0,P[i*3+1]);y1=Math.max(y1,P[i*3+1])}const H=Math.max(.05,y1-y0);
  for(let i=0;i<nv;i++){const ny=N[i*3+1],h=Math.max(0,Math.min(1,(P[i*3+1]-y0)/H)),hs=h*h*(3-2*h);
    const f=Math.max(.5,Math.min(1.12,(.84+.2*(.5*ny+.5))*(.76+.24*Math.min(1,hs*1.6))));tmp.setRGB(Cc[i*3],Cc[i*3+1],Cc[i*3+2]).multiplyScalar(f);
    const sh=Math.max(0,-ny)*.2+(1-Math.min(1,hs*1.8))*.07;if(sh>0)tmp.lerp(cool.clone().multiplyScalar(tmp.r*.3+tmp.g*.59+tmp.b*.11+.04),Math.min(.22,sh));
    if(ny>.55)tmp.lerp(warm.clone().multiplyScalar(tmp.r*.3+tmp.g*.59+tmp.b*.11),(ny-.55)*.1);Cc[i*3]=tmp.r;Cc[i*3+1]=tmp.g;Cc[i*3+2]=tmp.b}
  G.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));G.computeBoundingSphere();DG186.tris=(DG186.tris||{});DG186.tris[key]=IX.length/3;return LPG[key]=G}

// ---------------- kit helpers (model space) ----------------
// a curved horn / spine / claw through points, radii tapering r0 → r1, colour c0 at the root → c1 at the tip
function dgChain(k,bn,pts,r0,r1,c0,c1,seg,t){const N=pts.length-1,C0=new THREE.Color(c0),C1=new THREE.Color(c1==null?c0:c1);
  for(let i=0;i<N;i++){const u0=i/N,u1=(i+1)/N;k.L(bn,t||'c',C0.clone().lerp(C1,(u0+u1)/2).getHex(),pts[i],pts[i+1],r0+(r1-r0)*u0,r0+(r1-r0)*u1,seg||5)}return k}
// a bezier-ish horn: base, dir (unit-ish), bend (added * s^2), length, n segments
function dgHornPts(base,dir,bend,len,n){const d=nrm3(dir),o=[];for(let i=0;i<=(n||4);i++){const s=i/(n||4);o.push(add3(add3(base,mul3(d,len*s)),mul3(bend,len*s*s)))}return o}
// a tooth from base along dir
function dgTooth(k,bn,col,base,dir,len,r){k.L(bn,'c',col,base,add3(base,mul3(nrm3(dir),len)),r,r*.08,4)}
// an eye set in a socket: a dark socket lens, a glowing almond, a slit pupil, on side s at p looking along the outward normal nrm
function dgEye(k,s,p,nrm,len,h,glow,o){o=o||{};const n=nrm3([s*Math.abs(nrm[0]),nrm[1],nrm[2]]),yaw=Math.atan2(n[2],Math.abs(n[0]))*s,tilt=o.tilt||0,pitch=Math.asin(Math.max(-.9,Math.min(.9,n[1])));
  k.p('head','sph','c',o.sock||0x0a0708,p[0]-n[0]*.003,p[1]-n[1]*.003,p[2]-n[2]*.003,.007,h*1.45,len*.62,tilt,-yaw,s*pitch);
  k.p('head','sph','g',glow,p[0]+n[0]*.002,p[1]+n[1]*.002,p[2]+n[2]*.002,.0035,h*.55,len*.5,tilt,-yaw,s*pitch);
  k.p('head','box','c',0x050304,p[0]+n[0]*.0048,p[1]+n[1]*.0048,p[2]+n[2]*.0048,.0012,h*.95,len*.1,tilt,-yaw,s*pitch)}
// the surface point and outward normal of a profile at z, angle t from the top (side s), with the taper's forward tilt
function dgSurf(T,z,t,s){const q=dgAt(T,z),q2=dgAt(T,z+.01),p=dgPt(T,z,t,s),dw=(q.w-q2.w)/.01,n=nrm3([s*Math.sin(t)/q.w,Math.cos(t)/(Math.cos(t)>0?q.a:q.b),dw*.9]);return {p,n}}
// toes with claws from a foot: centre f (model), n toes over spread, length len, radius r; plus a dewclaw behind
function dgToes(k,bn,f,s,o){const n=o.n||3,len=o.len,r=o.r;for(let i=0;i<n;i++){const a=(i-(n-1)/2)*(o.spread||.32)+s*(o.out||.06),d=[Math.sin(a),0,Math.cos(a)],
    b=[f[0]+d[0]*r*.6,f[1]+r*.6,f[2]+d[2]*r*.6],m=[f[0]+d[0]*len*.55,f[1]+r*.45,f[2]+d[2]*len*.55],e=[f[0]+d[0]*len,f[1]+r*.25,f[2]+d[2]*len];
    k.L(bn,'c',o.skin,b,m,r,r*.85,5).L(bn,'c',o.skin2||o.skin,m,e,r*.85,r*.6,5);
    dgChain(k,bn,[sub3(e,mul3(d,r*.3)),add3(e,[d[0]*r*.9,r*.15,d[2]*r*.9]),add3(e,[d[0]*r*1.7,-r*.55,d[2]*r*1.7])],r*.62,.0015,o.claw,o.claw2||o.claw,4)}
  if(o.dew){const b=[f[0],f[1]+r*.9,f[2]-r*.4],e=[f[0]+s*r*.3,f[1]+r*.3,f[2]-o.dew];k.L(bn,'c',o.skin,b,e,r*.7,r*.4,4);dgChain(k,bn,[e,add3(e,[0,-r*.2,-r*.8]),add3(e,[0,-r*.9,-r*1.1])],r*.42,.001,o.claw,o.claw2||o.claw,4)}}

// ---------------- folding membrane wings ----------------
// A wing is jointed: shoulder S (the hinge, at the pivot), elbow E, wrist W, four fingers (knuckle bowed, then the tip) and
// a thumb claw; the membrane runs between the fingers and from the last finger back to a root point R on the flank, with a
// scalloped trailing edge. Joints are given (pivot space, right side, x out, y up, z forward) for the spread and the folded
// pose; a half pose is their mean. The vertices of each pose come from the same parameters, so the shapes blend.
function dgWingShape(J,D,L,P){const pos=[],col=[],gp=[],gc=[],K=D.cols,c3=new THREE.Color();
  const put=(A,C,p,c)=>{A.push(p[0],p[1],p[2]);C.push(c.r,c.g,c.b)},tri=(A,C,a,b,c,ca,cb,cc)=>{put(A,C,a,ca);put(A,C,b,cb||ca);put(A,C,c,cc||ca)};
  const fing=J.tips.map((t,i)=>{const cr=cross3([0,0,1],sub3(t,J.W)),kn=add3(lerp3(J.W,t,.42),Math.hypot(...cr)>1e-4?mul3(nrm3(cr),(D.bow||.02)*(i?.5:1)):[0,0,0]);return {kn,t}});
  const along=(f,u)=>u<.42?lerp3(J.W,f.kn,u/.42):lerp3(f.kn,f.t,(u-.42)/.58);
  const armP=u=>{const a=[J.W,J.E,J.S,J.R],l=[0];for(let i=1;i<4;i++)l.push(l[i-1]+Math.hypot(...sub3(a[i],a[i-1])));const x=u*l[3];for(let i=1;i<4;i++)if(x<=l[i]+1e-9){const t=(x-l[i-1])/((l[i]-l[i-1])||1);return lerp3(a[i-1],a[i],t)}return a[3]};
  const mem=(u,v,edge)=>{const c=c3.copy(K.root).lerp(K.edge,Math.pow(u,1.3));if(L>=2&&u>.86)c.lerp(K.band||K.edge,.5);const b=Math.min(v,1-v);if(b<.12)c.multiplyScalar(.82);
    if(Math.abs(v-.5)<.13&&u>.15&&u<.9)c.multiplyScalar(K.vein||.9);return c.clone()};
  // a membrane panel between edge A(u) and edge B(u), trailing edge pulled toward the wrist by sc (the scallop)
  const NU=4,NV=3,panel=(A,B,sc)=>{const a1=A(1),b1=B(1),mid=lerp3(a1,b1,.5),pull=mul3(sub3(J.W,mid),sc);
    const Pt=(u,v)=>{const p=lerp3(A(u),B(u),v),bow=4*v*(1-v)*Math.pow(u,2.2);return add3(p,mul3(pull,bow))};
    for(let i=0;i<NU;i++)for(let j=0;j<NV;j++){const u0=i/NU,u1=(i+1)/NU,v0=j/NV,v1=(j+1)/NV,p00=Pt(u0,v0),p10=Pt(u1,v0),p01=Pt(u0,v1),p11=Pt(u1,v1);
      tri(pos,col,p00,p10,p11,mem(u0,v0),mem(u1,v0),mem(u1,v1));tri(pos,col,p00,p11,p01,mem(u0,v0),mem(u1,v1),mem(u0,v1))}
    if(D.glowEdge&&L>=D.glowEdge)for(let j=0;j<NV*2;j++){const v0=j/(NV*2),v1=(j+1)/(NV*2),e0=Pt(1,v0),e1=Pt(1,v1),i0=Pt(.93,v0),i1=Pt(.93,v1),g=new THREE.Color(P.glow);tri(gp,gc,e0,e1,i1,g);tri(gp,gc,e0,i1,i0,g)}};
  for(let i=0;i<fing.length-1;i++)panel(u=>along(fing[i],u),u=>along(fing[i+1],u),D.scallop||.18);
  panel(u=>along(fing[fing.length-1],u),armP,(D.scallop||.18)*.8);
  // the leading edge membrane (shoulder → wrist), a small fold of skin in front of the arm
  {const m=lerp3(J.S,J.W,.5),f=add3(m,mul3(sub3(lerp3(J.S,J.W,.5),J.E),.25)),c=K.root.clone().multiplyScalar(.9);tri(pos,col,J.S,f,J.E,c);tri(pos,col,J.E,f,J.W,c)}
  // bones: tubes along the arm and the fingers, knuckles, claws
  const tube=(a,b,r0,r1,c,n,A,C)=>{n=n||4;const d=nrm3(sub3(b,a));let u=cross3(d,[0,1,0]);if(Math.hypot(...u)<.2)u=cross3(d,[0,0,1]);u=nrm3(u);const w=cross3(u,d);
    const ring=(p,r)=>{const o=[];for(let j=0;j<n;j++){const t=j/n*Math.PI*2;o.push(add3(p,add3(mul3(u,Math.cos(t)*r),mul3(w,Math.sin(t)*r))))}return o},R0=ring(a,r0),R1=ring(b,r1);
    for(let j=0;j<n;j++){const j1=(j+1)%n;tri(A||pos,C||col,R0[j],R1[j],R1[j1],c);tri(A||pos,C||col,R0[j],R1[j1],R0[j1],c)}};
  const bone=K.bone,bd=K.bone.clone().multiplyScalar(.8),r=D.r;
  tube(add3(J.S,[-.02,0,0]),J.E,r[0],r[0]*.8,bone,5);tube(J.E,J.W,r[0]*.8,r[1],bone,5);
  fing.forEach((f,i)=>{const k=i?.75:1;tube(J.W,f.kn,r[1]*.85*k,r[2]*k,bd,4);tube(f.kn,f.t,r[2]*k,.0015,bd,4);
    if(L>=3&&i<3){const d=nrm3(sub3(f.t,f.kn)),e=add3(f.t,mul3(d,.035+.006*L));tube(sub3(f.t,mul3(d,.01)),e,.007,.001,K.claw,4)}
    if(D.glowVein&&L>=D.glowVein){const g=new THREE.Color(P.glow),m0=lerp3(f.kn,f.t,.1),m1=lerp3(f.kn,f.t,.85);tube(add3(m0,[0,.004,0]),add3(m1,[0,.004,0]),.0035,.0012,g,3,gp,gc)}});
  // thumb claw at the wrist, hooked forward
  {const d=nrm3(add3(sub3(J.W,J.E),[0,.2,0])),b=add3(J.W,mul3(d,.01)),m=add3(b,mul3(d,.03)),e=add3(m,[0,-.018,.012]);tube(b,m,.008,.005,K.claw,4);tube(m,e,.005,.001,K.claw,4)}
  return {P:new Float32Array(pos),C:new Float32Array(col),GP:new Float32Array(gp),GC:new Float32Array(gc)}}
function dgWingData(D,K,L,P){const S=D.spread,F=D.fold,half={};['S','E','W','R'].forEach(k=>{half[k]=lerp3(S[k],F[k],.5)});half.tips=S.tips.map((t,i)=>lerp3(t,F.tips[i],.5));
  const sc=1+.02*L,scl=J=>{const o={};['S','E','W','R'].forEach(k=>{o[k]=mul3(J[k],k=='R'?1:sc)});o.tips=J.tips.map(t=>mul3(t,sc));return o};
  const Dd=Object.assign({},D,{cols:K}),A=[S,half,F].map(J=>dgWingShape(scl(J),Dd,L,P));return {P:A.map(a=>a.P),C:A[0].C,GP:A.map(a=>a.GP),GC:A[0].GC}}
// the shared geometry at fold level i (0 spread … DG186.lv folded)
function dgWingGeo(key,d,i,glow){const G=DG186.WG[key]||(DG186.WG[key]={d,g:[],h:[]}),arr=glow?G.h:G.g;if(arr[i])return arr[i];
  const f=i/DG186.lv,P=glow?G.d.GP:G.d.P;if(!P[0].length)return null;const o=new Float32Array(P[0].length);let A,B,t;if(f<=.5){A=P[0];B=P[1];t=f*2}else{A=P[1];B=P[2];t=(f-.5)*2}
  for(let j=0;j<o.length;j++)o[j]=A[j]+(B[j]-A[j])*t;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(o,3));g.setAttribute('color',new THREE.BufferAttribute(glow?G.d.GC:G.d.C,3));
  g.computeVertexNormals();g.computeBoundingSphere();g.userData.dg186=1;return arr[i]=g}
function dgWings(x,c,C,mat,sp,D,K){const L=typeof evo100Lv=='function'?evo100Lv(c):0,P=L?evo100Pal(c,'Drakelet',L):{glow:0xff8030};
  const key=sp+'|'+C+'|'+L+'|'+(L?P.glow:''),d=(DG186.WG[key]&&DG186.WG[key].d)||dgWingData(D,K,L,P),lv=DG186.lv;
  const W={key,d,lv,m:[],h:[]};x.dg186={f:1,t:0,W};if(x.g)x.g.dg186=x.dg186; // g.dg186.force = a fixed fold (tests, previews)
  const wm=typeof lp186Mat=='function'?lp186Mat(mat,'wing'):mat,gm=dkM().sg;
  [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,'chest',dgWingGeo(key,d,lv),wm,s*D.piv[0],D.piv[1],D.piv[2],s,1,1,0,0,0);W.m.push(p.children[0]);
    const hg=dgWingGeo(key,d,lv,1);if(hg){const m=new THREE.Mesh(hg,gm);m.scale.set(s,1,1);p.add(m);W.h.push(m)}
    x.wings.push({p,s,base:D.base==null?.3:D.base,amp:D.amp==null?.5:D.amp,dg:1})})}
// after the shared animation: fold toward the creature's state (folded standing and walking, a little open running,
// spread to attack, fly or use a wing ability), pick the shared geometry for that fold, scale the flap by the openness
function dgWingAnim(x,now){const B=x.dg186,g=x.g,G=(g&&g._ga)||{},S=x.spec;const dt=B.t?Math.min(.1,Math.max(0,(now-B.t)/1000)):0;B.t=now;
  const w=G.w||0,run=typeof gaSS=='function'?gaSS(.8,1.6,G.Fr||0):0,m5=g&&g._m105;
  let tgt=1-w*.25*run;if((g&&(g.atk||g.ak||g._lk!=null||g.lk||g._bo))||S.anim=='fly'||(m5&&m5.M&&m5.M.wing))tgt=0;
  if(B.force!=null)B.f=tgt=B.force;
  B.f+=(tgt-B.f)*(1-Math.exp(-dt*(tgt<B.f?9:4)));if(Math.abs(B.f-tgt)<.002)B.f=tgt;
  const lv=Math.round(B.f*DG186.lv);if(lv!=B.W.lv){B.W.lv=lv;const geo=dgWingGeo(B.W.key,B.W.d,lv),hg=dgWingGeo(B.W.key,B.W.d,lv,1);B.W.m.forEach(m=>m.geometry=geo);if(hg)B.W.h.forEach(m=>m.geometry=hg)}
  const k=1-B.f;x.wings.forEach(wg=>{if(wg.dg)wg.p.rotation.z*=k})}
{const f=rigAnim;rigAnim=function(x,now,mv,sp){const r=f.apply(this,arguments);if(x&&x.dg186)try{dgWingAnim(x,now)}catch(e){console.error('dg186 wing',e)}return r}}

// kit parts built from a ready geometry with its own vertex colours (membrane fans: userData.dgV) keep those colours in the
// kit bake (dkBake paints every part one colour); the part's colour multiplies them
{const f=dkBake;dkBake=function(P,O,key){const fresh=!(key&&DKBK&&DKBK[key]),r=f.apply(this,arguments);
  if(fresh&&P&&P.some(p=>p.geo&&p.geo.userData&&p.geo.userData.dgV))try{const M=dkM();['c','m','g'].forEach(t=>{const m=r.find(q=>q.material===M[t]||q.material===M['s'+t]);if(!m)return;
    const C=m.geometry.attributes.color;let off=0;P.filter(p=>p.t===t).forEach(p=>{const g=p.geo,n=g.attributes.position.count;
      if(g.userData&&g.userData.dgV){const ca=g.attributes.color,pc=new THREE.Color(p.col);for(let i=0;i<n;i++)C.setXYZ(off+i,ca.getX(i)*pc.r,ca.getY(i)*pc.g,ca.getZ(i)*pc.b)}off+=n});C.needsUpdate=true})}catch(e){console.error('dg186 vcol',e)}
  return r}}

// ======================================================================== quadruped dragons ========================================================================
// Drakelet skeleton (model space): head (0,.68,.528), jaw (0,.62,.682), neck (0,.62,.396), chest (0,.43,.242), spine (0,.42,-.022),
// pelvis (0,.4,-.275), tails at z -.396 / -.70 / -.978 / -1.206; front legs x ±.1: shoulder .38, elbow .2, wrist .08; hind legs x ±.11:
// hip .4 (z -.275), knee .22 (z -.209), hock .1 (z -.297).
// A design: body rows [z,y,half width,above,below,weights,sqB], head {hinge, jaw depth, eye, nostril, …}, legs, palette, paint, kit, wing.
DG186.Q={};
// the head's upper half: the section at z of the body rows; the lower jaw is built under it
function dgJaw(B,H){const R=[];H.jz.forEach(z=>{const q=dgAt(B,z),top=q.y-q.b+.005,dep=H.dep(z),rx=q.w*(H.jw||.84);
    const w=z<H.hinge-.03?{head:1}:z<H.hinge+.025?dgW('head','jaw',dgSm((z-H.hinge+.03)/.055)):{jaw:1};R.push({p:[0,top-.014,z],rx,ryT:.016,ryB:dep,w,z,jaw:1})});return R}
function dgQGeo(D,C,sp){const K=D.pal(C),B=D.body,H=D.head,bmp=dgBumps(D.bumps||[]);
  const body={rings:B.map(r=>({p:[0,r[1],r[0]],rx:r[2],ryT:r[3],ryB:r[4],w:r[5],sqB:r[6]||0,z:r[0]})),seg:16,capA:2,capB:1,
    sculpt:(p,n,r,s,c)=>{let d=bmp(p);if(s>.8&&D.ridge){const h=D.ridge(r.z);if(h)d+=h*Math.pow((s-.8)/.2,1.6)}return d},
    paint:(o,p,n,r,s,c,i)=>D.paint.call(D,o,K,p,n,r,s,c,i,'body')};
  const jaw={rings:dgJaw(B,H),seg:12,capB:1,sculpt:(p,n,r,s)=>H.chin&&s<0?H.chin(p,r,s):0,paint:(o,p,n,r,s,c,i)=>D.paint.call(D,o,K,p,n,r,s,c,i,'jaw')};
  const legs=[];[-1,1].forEach(s=>D.legs.forEach(Lg=>{const R=Lg.rows.map(q=>({p:[s*q[0],q[1],q[2]],rx:q[3],ryT:q[4],ryB:q[5],w:Object.fromEntries(Object.entries(q[6]).map(([b,v])=>[b.replace(/^([fh])r/,s<0?'$1l':'$1r'),v])),y:q[1],leg:Lg.k}));
    legs.push({rings:R,seg:Lg.seg||10,ref:[0,0,1],capB:1,sculpt:Lg.sculpt?(p,n,r,s2,c2)=>Lg.sculpt(p,n,r,s2,c2,s):null,paint:(o,p,n,r,s2,c2,i)=>D.paint.call(D,o,K,p,n,r,s2,c2,i,'leg')})}));
  return dg186Geo('DG186|'+sp+'|'+C,'Drakelet',[body,jaw].concat(legs))}

// the shared paint of a drake (part 'body' | 'jaw' | 'leg'); D.paintX adds the species' own marks
function dgPaintQ(D,o,K,p,n,r,s,c,i,part){const z=p[2],x=Math.abs(p[0]),hz=D.headZ||.535,mz=D.head.hinge-.03;
  if(part=='leg'){o.copy(K.main);if(p[1]>.3)o.lerp(K.back,.3*Math.min(1,(p[1]-.3)/.1));if(s<-.3)o.lerp(K.back,.3);if(p[1]<.13)o.lerp(K.dark,.6*(1-p[1]/.13));
    if(D.paintX)D.paintX(o,K,p,n,r,s,c,i,part);return}
  if(part=='jaw'){if(s>.25){o.copy(x<r.rx*.42?K.tongue:K.mouth);return}o.copy(K.throat);if(s>-.3)o.copy(K.main).lerp(K.lip,.3);if(s>.05)o.copy(K.lip);
    if(D.paintX)D.paintX(o,K,p,n,r,s,c,i,part);return}
  o.copy(K.main);
  if(s>.5)o.lerp(K.back,Math.min(1,(s-.5)/.4)*.9);
  if(z<hz-.1&&z>-1.25&&s>-.12&&s<.32)o.lerp(K.side,.5*(1-Math.abs(s-.1)/.22));     // a paler line of flank scales
  if(z<hz-.2&&s<-.4){o.copy(K.bel);if(i%2)o.multiplyScalar(.84);if(s>-.6)o.lerp(K.main,.5)}   // belly scutes
  if(z>hz-.06){// the head: pale under the chin, a dark lip line, the palate, nostrils, sockets
    if(s<-.2&&z<mz+.02)o.lerp(K.throat,.6);
    const inJ=x<r.rx*D.head.jw*.86;
    if(z>mz&&s<-.2&&(s>-.82||!inJ))o.lerp(K.lip,.5+(s<-.5?.35:0));
    if(z>mz&&s<=-.82&&inJ)o.copy(K.mouth);
    const E=D._eye||(D._eye=dgSurf(D.body,D.eye.z,D.eye.t,1).p),de=dgD(p,E),ER=D.eye.sock||.034;if(de<ER)o.lerp(K.sock,Math.min(1,(ER-de)/(ER*.45)));
    if(dgD(p,D.nos)<.016)o.lerp(K.sock,.85)}
  if(D.paintX)D.paintX(o,K,p,n,r,s,c,i,part)}
// the shared kit of a drake: eyes, teeth, tongue, talons, the dorsal spines; D.kitX adds horns, frills and the rest
function dgKitQ(D,k,c,C,red,K){const B=D.body,H=D.head,T=D.teeth;
  [-1,1].forEach(s=>{
    {const E=D.eye,q=dgSurf(B,E.z,E.t,s);dgEye(k,s,q.p,q.n,E.len,E.h,red?0xff2a2a:D.eyeCol,{tilt:E.tilt==null?.22:E.tilt})}
    // teeth seated in the lips: the upper row hangs outside the narrower lower jaw, the lower row stands up inside it
    T.up.forEach(q=>{const h=dgAt(B,q[0]);dgTooth(k,'head',K.tooth,[s*h.w*.84,h.y-h.b*.5,q[0]],[s*.06,-1,.12],q[1]+h.b*.5,q[2])});
    T.lo.forEach(q=>{const h=dgAt(B,q[0]),jr=h.w*H.jw*.72;dgTooth(k,'jaw',K.tooth,[s*jr,h.y-h.b-.002,q[0]],[s*-.05,1,.05],q[1],q[2])});
    D.feet.forEach(f=>dgToes(k,f.b.replace('r',s<0?'l':'r'),[s*f.x,0,f.z],s,Object.assign({skin:K.toe,skin2:K.toe2,claw:K.claw,claw2:K.claw2},f.o)))});
  {const a=dgAt(B,H.hinge+.02),b=dgAt(B,H.jz[H.jz.length-2]-.02);k.L('jaw','c',K.tongue.getHex(),[0,a.y-a.b-.004,H.hinge+.02],[0,b.y-b.b-.003,H.jz[H.jz.length-2]-.03],.014,.006,5)}
  // dorsal spines on the crest (D.spine(z) → [height, base radius] or null)
  for(let z=D.spineZ[0];z>D.spineZ[1];z-=z>-.4?D.spineZ[2]:D.spineZ[3]){const sp=D.spine(z);if(!sp)continue;const q=dgAt(B,z),top=q.y+q.a+(D.ridge(z)||0),h=sp[0],bn=dh150DB(z);
    dgChain(k,bn,[[0,top-sp[1]*1.1,z+sp[1]*.8],[0,top+h*.55,z-h*.25],[0,top+h,z-h*.75]],sp[1],.0015,K.spine,K.spine2,4)}
  if(D.kitX)D.kitX(k,c,C,red,K)}
// a brow ridge lying on the head over the eye (front to back along the upper rim of the socket)
function dgBrow(k,s,B,E,col,r){const a=dgSurf(B,E.z+E.len*.9,E.t-.36,s),m=dgSurf(B,E.z+E.len*.1,E.t-.42,s),b=dgSurf(B,E.z-E.len*.9,E.t-.3,s);
  dgChain(k,'head',[add3(a.p,mul3(a.n,-r*.6)),add3(m.p,mul3(m.n,r*.25)),add3(b.p,mul3(b.n,-r*.3))],r,r*.55,col,col,4)}
// a flat membrane fan (cheek frills, crests): hub → the points, coloured root → edge, skinned to one bone by the kit
function dgFanGeo(hub,pts,c0,c1){/* vertex colours kept through the kit bake (dgV) */const P=[],Cc=[],a=new THREE.Color(c0),b=new THREE.Color(c1);
  for(let i=0;i<pts.length-1;i++){P.push(...hub,...pts[i],...pts[i+1]);Cc.push(a.r,a.g,a.b,b.r,b.g,b.b,b.r,b.g,b.b)}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));G.computeVertexNormals();G.userData.dgV=1;return G}
// k.p with a ready geometry in model space (identity transform), its own vertex colours kept by the bake (white part colour)
function dgGeoPart(k,bn,G,col){k.p(bn,G,'c',col==null?0xffffff:col,0,0,0,1,1,1);return k}
// leg rows of the Drakelet template, thickened (kf / kh) and moved out (dxf / dxh)
function dgLegs(kf,kh,dxf,dxh,len){const F=[[.055,.49,.215,.055,.062,.062,{chest:.75,fr0:.25}],[.08,.43,.222,.054,.07,.062,{chest:.25,fr0:.75}],[.096,.35,.226,.046,.058,.05,{fr0:1}],
      [.1,.27,.235,.034,.038,.04,{fr0:1}],[.1,.21,.242,.032,.034,.038,{fr0:.5,fr1:.5}],[.1,.155,.234,.026,.028,.03,{fr1:1}],[.1,.1,.222,.022,.024,.026,{fr1:.6,fr2:.4}],
      [.1,.062,.224,.023,.027,.022,{fr2:1}],[.1,.032,.232,.027,.034,.022,{fr2:1}],[.1,.016,.24,.028,.036,.024,{fr2:1}]],
    Hh=[[.055,.51,-.275,.07,.08,.08,{pelvis:.75,hr0:.25}],[.085,.43,-.27,.072,.098,.088,{pelvis:.25,hr0:.75}],[.104,.335,-.245,.058,.08,.064,{hr0:1}],
      [.11,.265,-.218,.042,.046,.042,{hr0:1}],[.11,.222,-.212,.036,.038,.036,{hr0:.5,hr1:.5}],[.11,.17,-.238,.027,.028,.03,{hr1:1}],[.11,.115,-.283,.023,.024,.027,{hr1:.6,hr2:.4}],
      [.11,.07,-.27,.022,.025,.023,{hr2:1}],[.11,.035,-.255,.026,.036,.022,{hr2:1}],[.11,.016,-.245,.028,.04,.024,{hr2:1}]];
  const m=(R,k,dx)=>R.map((q,i)=>[q[0]+dx*Math.min(1,i/2),q[1],q[2],q[3]*(typeof k=='function'?k(i):k),q[4]*(typeof k=='function'?k(i):k),q[5]*(typeof k=='function'?k(i):k),q[6]]);
  return [{k:'f',seg:10,rows:m(F,kf,dxf)},{k:'h',seg:10,rows:m(Hh,kh,dxh)}]}

// ---------------- Drakelet: a lithe young drake ----------------
// Dusky violet-black hide with a paler line of flank scales, dark saddles over the back, pale bone scutes underneath; swept
// bone horns, a brow plate over each amber eye, jaw-angle spikes, a crest of small spines down to a spade on the tail.
DG186.Q.Drakelet={eyeCol:0xffa030,headZ:.535,
  body:[
    [.928,.655,.012,.01,.008,{head:1}],[.91,.657,.026,.02,.013,{head:1}],[.88,.661,.038,.028,.017,{head:1}],[.835,.667,.047,.034,.02,{head:1}],
    [.785,.674,.054,.04,.022,{head:1}],[.74,.684,.061,.047,.024,{head:1}],[.7,.694,.068,.054,.027,{head:1}],[.66,.7,.075,.058,.031,{head:1}],
    [.62,.701,.078,.057,.038,{head:1}],[.578,.694,.071,.053,.046,{head:1}],[.535,.68,.06,.05,.052,dgW('head','neck',.35)],
    [.49,.66,.054,.05,.056,dgW('neck','head',.25)],[.44,.63,.055,.053,.058,{neck:1}],[.39,.595,.059,.057,.064,{neck:1}],[.34,.555,.068,.064,.08,dgW('neck','chest',.4)],
    [.29,.52,.085,.082,.104,dgW('chest','neck',.25)],[.23,.495,.103,.097,.128,{chest:1},2.6],[.16,.48,.11,.103,.134,{chest:1},2.6],[.09,.472,.106,.099,.124,dgW('chest','spine',.4),2.4],
    [.01,.468,.094,.091,.102,{spine:1}],[-.08,.467,.09,.088,.094,dgW('spine','pelvis',.5)],[-.17,.469,.1,.095,.1,dgW('pelvis','spine',.2),2.6],[-.26,.47,.103,.097,.098,{pelvis:1},2.6],
    [-.35,.466,.087,.082,.08,dgW('pelvis','tail0',.45)],[-.45,.463,.068,.064,.06,dgW('tail0','tail1',.25)],[-.58,.468,.054,.052,.047,dgW('tail0','tail1',.75)],
    [-.71,.479,.044,.042,.038,{tail1:1}],[-.84,.495,.036,.034,.031,dgW('tail1','tail2',.5)],[-.97,.515,.029,.027,.025,{tail2:1}],[-1.09,.534,.022,.021,.019,dgW('tail2','tail3',.5)],
    [-1.2,.548,.016,.015,.013,{tail3:1}],[-1.29,.556,.009,.008,.007,{tail3:1}]],
  head:{hinge:.672,jz:[.6,.632,.662,.69,.73,.775,.82,.86,.893],dep:z=>z<.68?.032:.032-(z-.68)*.075,jw:.74},
  eye:{z:.684,t:1.12,len:.025,h:.0075},nos:[.021,.669,.9],
  teeth:{up:[[.875,.016,.0055],[.845,.02,.006],[.81,.016,.005],[.775,.014,.0048],[.74,.013,.0046],[.705,.011,.0044]],lo:[[.86,.016,.0036],[.82,.02,.004],[.78,.016,.0036],[.745,.016,.0036],[.71,.015,.0034]]},
  feet:[{b:'fr2',x:.1,z:.252,o:{n:3,len:.06,r:.011,spread:.42,out:.08,dew:.035}},{b:'hr2',x:.11,z:-.233,o:{n:3,len:.065,r:.012,spread:.42,out:.08,dew:.04}}],
  bumps:[[[.054,.743,.692],[.024,.012,.034],.011],[[.074,.678,.63],[.026,.022,.034],.008],[[.021,.671,.9],[.012,.01,.014],.005],[[.06,.73,.6],[.03,.03,.03],.006],
    [[.105,.5,.2],[.05,.06,.07],.012],[[.1,.5,-.24],[.05,.06,.07],.012]],
  ridge:z=>z>.56?0:z>.3?.008:z>-.4?.011:z>-1.15?.009*(1+(z+.4)*.6):0,
  spineZ:[.5,-1.16,.065,.085],spine:z=>{const h=z>.3?.026:z>-.4?.036-Math.abs(z-.05)*.02:.03+(z+.4)*.018;return h<.012?null:[h,.0105]},
  legs:dgLegs(1,1,0,0),
  pal(C){const main=dgHSL(C,.2,.21),bel=new THREE.Color().setHSL(.085,.36,.36).lerp(main,.08);
    return {main,back:dgHSL(C,.2,.12),dark:dgHSL(C,.14,.06),side:dgHSL(C,.18,.27),bel,throat:new THREE.Color().setHSL(.09,.2,.2).lerp(main,.35),
      lip:new THREE.Color(0x22151a),mouth:new THREE.Color(0x3a0e12),tongue:new THREE.Color(0x5a2228),sock:new THREE.Color(0x0c080a),mark:dgHSL(C,.24,.075),
      tooth:0xd8ceb4,claw:0x161216,claw2:0x0a0808,horn:0xa49678,horn2:0x3a3028,spine:0x3a3028,spine2:0xa49678,toe:dgHSL(C,.18,.15).getHex(),toe2:dgHSL(C,.16,.11).getHex()}},
  paint(o,K,p,n,r,s,c,i,part){dgPaintQ(this,o,K,p,n,r,s,c,i,part)},
  paintX(o,K,p,n,r,s,c,i,part){const z=p[2];if(part!='body')return;
    if(z<.3&&z>-1.25&&s>.12&&i%3==1)o.lerp(K.mark,.8*Math.min(1,(s-.12)/.35));   // dark saddles over the back
    if(s>.6&&z>.6&&z<.78)o.lerp(K.mark,.3)},
  kit(k,c,C,red,K){dgKitQ(this,k,c,C,red,K)},
  kitX(k,c,C,red,K){const back=K.back.getHex(),dark=K.dark.getHex();
    [-1,1].forEach(s=>{
      // a brow plate over the eye, swept horns from the back of the skull, small cheek horns, spikes at the jaw angle
      dgBrow(k,s,this.body,this.eye,dkShade(back,1.15),.0085);
      dgChain(k,'head',dgHornPts([s*.038,.742,.602],[s*.32,.5,-1],[s*.01,-.05,0],.17,4),.0125,.002,K.horn2,K.horn,5);
      dgChain(k,'head',dgHornPts([s*.062,.714,.598],[s*.6,.05,-1],[0,-.015,0],.075,3),.0075,.0015,K.horn2,K.horn,4);
      for(let i=0;i<3;i++)dgChain(k,'head',dgHornPts([s*(.07-i*.004),.684-i*.016,.6-i*.006],[s*.5,-.15-i*.2,-1],[0,-.01,0],.05-i*.008,2),.007,.0015,back,dark,4)});
    // a spade at the tail tip
    k.p('tail3','cone4','c',dkShade(back,.9),0,.556,-1.335,.05,.11,.012,-Math.PI/2);k.p('tail3','cone4','c',dark,0,.557,-1.33,.034,.07,.016,-Math.PI/2)},
  wing:{piv:[.072,.556,.19],base:.32,amp:.5,r:[.016,.012,.008],bow:.025,scallop:.2,
    spread:{S:[0,0,0],E:[.17,.07,-.04],W:[.34,.13,.05],R:[-.01,-.075,-.34],tips:[[.68,.06,-.06],[.61,.0,-.27],[.46,-.03,-.41],[.27,-.04,-.44]]},
    fold:{S:[0,0,0],E:[.032,.0,-.12],W:[.05,.09,-.01],R:[-.01,-.075,-.34],tips:[[.068,.04,-.43],[.074,.0,-.41],[.074,-.04,-.38],[.068,-.072,-.33]]}},
  wpal(C,K){return {root:K.back.clone().lerp(new THREE.Color(0x2a1a1c),.3),edge:K.main.clone().lerp(new THREE.Color(0x5a3428),.35),band:K.dark.clone(),bone:K.side.clone().multiplyScalar(.8),claw:new THREE.Color(0x161216),vein:.8}}};

// ---------------- Pyrewing: a slender wyvern of fire ----------------
// A long narrow wedge head on a long arched neck, a deep keel chest and wasp waist, thin raptor legs and a very long whip tail
// ending in a flame blade. Charcoal hide that warms to burnt orange under the belly, lava seams glowing over the shoulders
// and haunches, embers in the nostrils and the throat (a bite shows them), obsidian horns, brow spurs and a spined cheek
// frill with an ember membrane, obsidian blade spines; huge wings burning from charcoal at the root to ember at the edge.
DG186.Q.Pyrewing={eyeCol:0xffc23a,headZ:.55,
  body:[
    [1.0,.662,.009,.007,.005,{head:1}],[.982,.664,.02,.015,.01,{head:1}],[.948,.668,.03,.021,.013,{head:1}],[.905,.674,.037,.027,.015,{head:1}],
    [.855,.682,.043,.033,.017,{head:1}],[.805,.692,.049,.039,.019,{head:1}],[.76,.703,.055,.045,.021,{head:1}],[.718,.712,.061,.051,.024,{head:1}],
    [.678,.716,.066,.054,.028,{head:1}],[.638,.713,.068,.052,.035,{head:1}],[.597,.703,.061,.049,.043,{head:1}],[.552,.689,.051,.045,.049,dgW('head','neck',.35)],
    [.505,.668,.044,.043,.049,dgW('neck','head',.25)],[.455,.638,.043,.043,.049,{neck:1}],[.405,.598,.046,.046,.055,{neck:1}],[.355,.555,.054,.054,.07,dgW('neck','chest',.4)],
    [.3,.516,.07,.07,.098,dgW('chest','neck',.25)],[.24,.49,.088,.086,.132,{chest:1},2.2],[.17,.478,.096,.09,.145,{chest:1},2.2],[.09,.472,.088,.084,.126,dgW('chest','spine',.4),2.2],
    [.01,.47,.068,.072,.086,{spine:1}],[-.08,.471,.066,.07,.08,dgW('spine','pelvis',.5)],[-.17,.474,.081,.08,.088,dgW('pelvis','spine',.2),2.4],[-.25,.476,.086,.082,.088,{pelvis:1},2.4],
    [-.34,.472,.068,.066,.064,dgW('pelvis','tail0',.45)],[-.45,.468,.049,.047,.044,dgW('tail0','tail1',.25)],[-.58,.474,.038,.036,.033,dgW('tail0','tail1',.75)],
    [-.72,.488,.029,.027,.025,{tail1:1}],[-.86,.506,.022,.021,.019,dgW('tail1','tail2',.5)],[-1.0,.525,.017,.016,.015,{tail2:1}],[-1.13,.542,.013,.012,.011,dgW('tail2','tail3',.5)],
    [-1.26,.556,.009,.009,.008,{tail3:1}],[-1.38,.566,.006,.006,.005,{tail3:1}],[-1.47,.572,.003,.003,.003,{tail3:1}]],
  head:{hinge:.665,jz:[.6,.628,.655,.685,.725,.775,.83,.885,.935,.968],dep:z=>z<.67?.03:.03-(z-.67)*.062,jw:.72},
  eye:{z:.72,t:1.08,len:.026,h:.0065,tilt:.3},nos:[.017,.668,.975],
  teeth:{up:[[.955,.014,.0042],[.925,.02,.005],[.89,.014,.0042],[.855,.013,.004],[.82,.013,.004],[.785,.012,.0038],[.75,.011,.0036],[.715,.01,.0034]],
    lo:[[.94,.014,.0032],[.9,.018,.0036],[.86,.014,.0032],[.82,.014,.0032],[.78,.013,.003],[.74,.012,.003],[.705,.012,.003]]},
  feet:[{b:'fr2',x:.102,z:.25,o:{n:3,len:.058,r:.0095,spread:.4,out:.08,dew:.034}},{b:'hr2',x:.112,z:-.235,o:{n:3,len:.068,r:.0105,spread:.38,out:.08,dew:.042}}],
  bumps:[[[.048,.758,.726],[.022,.011,.036],.012],[[.066,.69,.66],[.024,.02,.034],.008],[[.017,.67,.975],[.01,.009,.012],.004],[[.05,.74,.62],[.03,.026,.03],.006],
    [[.095,.5,.2],[.045,.06,.07],.012],[[.085,.5,-.22],[.045,.06,.07],.012]],
  ridge:z=>z>.57?0:z>.3?.007:z>-.4?.01:z>-1.3?.007*(1+(z+.4)*.7):0,
  spineZ:[.52,-1.3,.06,.09],spine:z=>{const h=z>.32?.03:z>-.4?.05-Math.abs(z-.05)*.03:.034+(z+.4)*.026;return h<.01?null:[h,z>-.4?.011:.008]},
  legs:dgLegs(i=>i<3?.86:.78,i=>i<3?.86:.8,-.004,-.006),
  pal(C){const main=new THREE.Color().setHSL(.02,.2,.14),bel=new THREE.Color().setHSL(.055,.55,.26);
    return {main,back:new THREE.Color().setHSL(.02,.18,.075),dark:new THREE.Color().setHSL(.02,.14,.04),side:new THREE.Color().setHSL(.03,.28,.19),bel,
      throat:new THREE.Color().setHSL(.05,.36,.17),lava:new THREE.Color().setHSL(.045,.85,.32),lip:new THREE.Color(0x160a08),mouth:new THREE.Color(0x3a0a06),tongue:new THREE.Color(0x5a1a10),
      sock:new THREE.Color(0x080404),tooth:0xd8c8a8,claw:0x14100e,claw2:0x080606,horn:0x3a2e28,horn2:0x161010,spine:0x1a1210,spine2:0x4a3428,ember:0xff7a1a,ember2:0xffb040,
      toe:new THREE.Color().setHSL(.02,.16,.07).getHex(),toe2:new THREE.Color().setHSL(.02,.14,.05).getHex()}},
  paint(o,K,p,n,r,s,c,i,part){dgPaintQ(this,o,K,p,n,r,s,c,i,part)},
  paintX(o,K,p,n,r,s,c,i,part){const z=p[2];
    if(part=='leg'){if(p[1]>.25&&p[1]<.42&&s>-.2)o.lerp(K.lava,.18);return}
    if(part!='body')return;
    // the belly smoulders: burnt orange scutes fading into the charcoal, a warm glow up the keel of the chest
    if(s<-.25&&z<.4&&z>-.6)o.lerp(K.lava,.22*Math.min(1,(-.25-s)/.4));
    if(z>.6&&s>.55)o.lerp(K.dark,.35)},
  kit(k,c,C,red,K){dgKitQ(this,k,c,C,red,K)},
  kitX(k,c,C,red,K){const B=this.body,obs=K.spine,obs2=K.spine2;
    [-1,1].forEach(s=>{
      // sharp brow spurs, one long pair of swept horns and a short pair under them, embers in the nostrils
      {const E=this.eye,a=dgSurf(B,E.z+.035,.72,s),b=dgSurf(B,E.z-.005,.78,s);dgChain(k,'head',[add3(a.p,mul3(a.n,-.004)),add3(b.p,mul3(b.n,.004)),add3(b.p,[s*.012,.008,-.04])],.0075,.0015,obs,obs2,4)}
      dgChain(k,'head',dgHornPts([s*.034,.758,.63],[s*.28,.42,-1],[s*.02,.03,-.02],.3,5),.0135,.0015,K.horn2,K.horn,5);
      dgChain(k,'head',dgHornPts([s*.054,.735,.618],[s*.55,.0,-1],[0,-.02,0],.11,3),.0085,.0012,K.horn2,K.horn,4);
      k.p('head','sph','g',K.ember,s*.017,.669,.978,.006,.004,.007);
      // the cheek frill: three obsidian spines fanning back from the jaw angle, an ember membrane between them
      const hub=[s*.052,.692,.612],tips=[[s*.13,.73,.53],[s*.15,.69,.51],[s*.135,.645,.52]];
      tips.forEach((t,i)=>dgChain(k,'head',[hub,lerp3(hub,t,.55),t],.0085-i*.001,.0012,obs,obs2,4));
      dgGeoPart(k,'head',dgFanGeo(hub,tips.map(t=>lerp3(hub,t,.92)),new THREE.Color(0x1a0c08),new THREE.Color(0x8a2a0a)));
      // lava seams: glowing cracks lying in the hide over the shoulders and haunches
      [[.2,'chest',[[.62,0],[.85,-.03],[1.1,.012],[1.35,-.025]]],[-.21,'pelvis',[[.62,0],[.88,-.03],[1.15,.0],[1.38,-.035]]]].forEach(q=>{
        const P=q[2].map(u=>dgSurf(B,q[0]+u[1],u[0],s));for(let i=0;i<P.length-1;i++)k.L(q[1],'g',i%2?K.ember:K.ember2,add3(P[i].p,mul3(P[i].n,-.0015)),add3(P[i+1].p,mul3(P[i+1].n,-.0015)),.0042,.0036,3)})});
    // embers deep in the throat (seen when it bites)
    {const a=dgAt(B,.69);k.L('jaw','g',K.ember,[0,a.y-a.b-.001,.675],[0,a.y-a.b,.72],.009,.004,4)}
    // the whip tail's flame blade and obsidian barbs
    k.p('tail3','cone4','g',K.ember,0,.575,-1.55,.012,.16,.05,-Math.PI/2-.12);
    k.p('tail3','cone4','g',K.ember2,0,.572,-1.5,.014,.1,.075,-Math.PI/2-.08);
    [-1,1].forEach(s=>dgChain(k,'tail3',[[0,.568,-1.4],[s*.04,.57,-1.37],[s*.075,.574,-1.33]],.009,.0012,obs,obs2,4))},
  wing:{piv:[.062,.556,.2],base:.36,amp:.55,r:[.016,.012,.008],bow:.03,scallop:.24,glowEdge:5,
    spread:{S:[0,0,0],E:[.2,.09,-.04],W:[.42,.15,.06],R:[-.01,-.08,-.36],tips:[[.98,.06,-.1],[.86,-.01,-.38],[.63,-.04,-.58],[.36,-.05,-.6]]},
    fold:{S:[0,0,0],E:[.03,-.005,-.14],W:[.05,.11,-.02],R:[-.01,-.08,-.36],tips:[[.068,.06,-.56],[.074,.015,-.53],[.074,-.03,-.48],[.068,-.068,-.4]]}},
  wpal(C,K){return {root:new THREE.Color(0x140c0a),edge:new THREE.Color().setHSL(.045,.7,.22),band:new THREE.Color().setHSL(.04,.75,.28),bone:new THREE.Color(0x1e1614),claw:new THREE.Color(0x0e0a08),vein:.7}}};

// ---------------- Elderdrake: an ancient, regal dragon ----------------
// Long and elegant (it was a wide barrel on pillar legs with a block of a head): a long graceful neck, a narrow deep chest,
// long legs, a long tail ending in a spearhead blade. A long regal head with a crown of swept ivory horns (one great pair
// curving back, a lesser pair and a row of cheek horns), chin spikes, a heavy brow over gold eyes. Obsidian-plum scales
// with a pale bronze edge line, bronze belly plates, tall slender blade spines down the neck and back; broad notched wings.
DG186.Q.Elderdrake={eyeCol:0xffc830,headZ:.54,
  body:[
    [.99,.665,.013,.01,.008,{head:1}],[.97,.667,.029,.021,.013,{head:1}],[.935,.671,.04,.029,.017,{head:1}],[.89,.677,.048,.035,.02,{head:1}],
    [.84,.685,.054,.041,.022,{head:1}],[.79,.695,.06,.047,.024,{head:1}],[.745,.707,.067,.054,.026,{head:1}],[.705,.716,.073,.059,.029,{head:1}],
    [.665,.72,.078,.061,.034,{head:1}],[.625,.717,.079,.059,.041,{head:1}],[.585,.706,.07,.055,.048,{head:1}],[.54,.69,.06,.051,.054,dgW('head','neck',.35)],
    [.49,.665,.055,.052,.058,dgW('neck','head',.25)],[.44,.632,.057,.054,.062,{neck:1}],[.39,.596,.063,.059,.07,{neck:1}],[.34,.558,.074,.069,.088,dgW('neck','chest',.4)],
    [.29,.526,.092,.088,.115,dgW('chest','neck',.25)],[.23,.506,.114,.105,.145,{chest:1},2.4],[.16,.494,.122,.109,.152,{chest:1},2.4],[.08,.488,.116,.105,.136,dgW('chest','spine',.4),2.2],
    [0,.485,.1,.097,.108,{spine:1}],[-.09,.485,.096,.095,.1,dgW('spine','pelvis',.5)],[-.18,.487,.106,.1,.104,dgW('pelvis','spine',.2),2.4],[-.27,.488,.108,.101,.1,{pelvis:1},2.4],
    [-.36,.484,.09,.085,.08,dgW('pelvis','tail0',.45)],[-.47,.48,.071,.067,.061,dgW('tail0','tail1',.25)],[-.6,.486,.057,.054,.049,dgW('tail0','tail1',.75)],
    [-.74,.497,.046,.043,.039,{tail1:1}],[-.88,.513,.037,.035,.031,dgW('tail1','tail2',.5)],[-1.01,.53,.03,.028,.025,{tail2:1}],[-1.13,.547,.023,.021,.019,dgW('tail2','tail3',.5)],
    [-1.24,.559,.016,.015,.013,{tail3:1}],[-1.33,.566,.009,.008,.007,{tail3:1}]],
  head:{hinge:.665,jz:[.6,.628,.655,.685,.725,.77,.82,.87,.915,.952],dep:z=>z<.67?.036:.036-(z-.67)*.07,jw:.74},
  eye:{z:.71,t:1.1,len:.026,h:.0075,tilt:.24},nos:[.022,.672,.965],
  teeth:{up:[[.945,.015,.0046],[.915,.021,.0056],[.88,.015,.0046],[.845,.014,.0044],[.81,.014,.0044],[.775,.013,.0042],[.74,.012,.004],[.705,.011,.0038]],
    lo:[[.93,.015,.0036],[.89,.02,.004],[.85,.015,.0036],[.81,.015,.0036],[.77,.014,.0034],[.73,.013,.0034],[.695,.012,.0032]]},
  feet:[{b:'fr2',x:.104,z:.252,o:{n:3,len:.064,r:.0125,spread:.42,out:.08,dew:.038}},{b:'hr2',x:.114,z:-.233,o:{n:3,len:.07,r:.0135,spread:.4,out:.08,dew:.044}}],
  bumps:[[[.055,.765,.712],[.026,.012,.04],.013],[[.074,.696,.64],[.028,.022,.036],.009],[[.022,.674,.965],[.012,.01,.014],.005],[[.055,.745,.62],[.032,.03,.034],.007],
    [[.115,.52,.2],[.05,.065,.075],.013],[[.11,.52,-.25],[.05,.065,.075],.013]],
  ridge:z=>z>.56?0:z>.3?.009:z>-.4?.012:z>-1.25?.01*(1+(z+.4)*.6):0,
  spineZ:[.52,-1.2,.058,.085],spine:z=>{const h=z>.3?.04:z>-.4?.058-Math.abs(z-.0)*.035:.04+(z+.4)*.03;return h<.012?null:[h,z>-.4?.012:.009]},
  legs:dgLegs(i=>i<3?1.08:1.05,i=>i<3?1.08:1.05,.006,.006),
  pal(C){const main=dgHSL(C,.15,.17),bel=new THREE.Color().setHSL(.085,.32,.34).lerp(main,.1);
    return {main,back:dgHSL(C,.13,.09),dark:dgHSL(C,.1,.05),side:new THREE.Color().setHSL(.08,.2,.26).lerp(main,.35),bel,throat:new THREE.Color().setHSL(.08,.22,.22).lerp(main,.25),
      edge:new THREE.Color().setHSL(.09,.34,.32),lip:new THREE.Color(0x150d10),mouth:new THREE.Color(0x340c10),tongue:new THREE.Color(0x52202a),sock:new THREE.Color(0x080506),
      tooth:0xe0d6bc,claw:0x2a2420,claw2:0xb8ac90,horn:0xcabb98,horn2:0x4a3e32,spine:0x2a2228,spine2:0x9a8a6e,toe:dgHSL(C,.12,.08).getHex(),toe2:dgHSL(C,.1,.06).getHex()}},
  paint(o,K,p,n,r,s,c,i,part){dgPaintQ(this,o,K,p,n,r,s,c,i,part)},
  paintX(o,K,p,n,r,s,c,i,part){const z=p[2];if(part!='body')return;
    // ancient scales: a pale bronze edge line where the dark back meets the flank, bronze under the jaw and down the throat
    if(z<.5&&z>-1.2&&s>.32&&s<.55)o.lerp(K.edge,.45*(1-Math.abs(s-.43)/.12));
    if(z>.6&&s>.6)o.lerp(K.back,.3)},
  kit(k,c,C,red,K){dgKitQ(this,k,c,C,red,K)},
  kitX(k,c,C,red,K){const B=this.body;
    [-1,1].forEach(s=>{
      // a heavy brow over the eye; the crown: a great pair of horns sweeping back and up, a lesser pair, three cheek horns
      dgBrow(k,s,B,this.eye,dkShade(K.back.getHex(),1.3),.01);
      dgChain(k,'head',dgHornPts([s*.036,.758,.632],[s*.25,.45,-1],[s*.03,.07,.0],.3,5),.017,.002,K.horn2,K.horn,5);
      dgChain(k,'head',dgHornPts([s*.058,.738,.612],[s*.5,.12,-1],[0,-.02,-.01],.16,4),.011,.0015,K.horn2,K.horn,5);
      for(let i=0;i<3;i++)dgChain(k,'head',dgHornPts([s*(.074-i*.003),.7-i*.016,.61-i*.008],[s*.55,-.1-i*.18,-1],[0,-.01,0],.07-i*.012,2),.008,.0015,K.horn2,K.horn,4);
      // chin spikes under the lower jaw
      [.86,.8].forEach((z,i)=>{const h=dgAt(B,z),y=h.y-h.b-.03+i*.004;dgChain(k,'jaw',[[s*.014,y+.006,z],[s*.02,y-.02,z-.03],[s*.024,y-.035,z-.07]],.0065,.0012,K.horn2,K.horn,4)})});
    // a small nose horn
    dgChain(k,'head',[[0,.69,.93],[0,.708,.91],[0,.718,.885]],.008,.0012,K.horn2,K.horn,4);
    // the spearhead blade at the tail tip
    k.p('tail3','oct','c',K.spine,0,.566,-1.4,.045,.012,.09);k.p('tail3','oct','c',K.spine2,0,.566,-1.39,.03,.016,.06)},
  wing:{piv:[.085,.575,.2],base:.32,amp:.48,r:[.02,.015,.0095],bow:.03,scallop:.26,glowVein:4,
    spread:{S:[0,0,0],E:[.2,.09,-.03],W:[.4,.15,.06],R:[-.01,-.08,-.38],tips:[[.94,.07,-.08],[.84,.0,-.37],[.62,-.04,-.56],[.36,-.05,-.6]]},
    fold:{S:[0,0,0],E:[.035,-.005,-.14],W:[.055,.11,-.02],R:[-.01,-.08,-.38],tips:[[.074,.06,-.55],[.08,.015,-.52],[.08,-.03,-.47],[.074,-.07,-.4]]}},
  wpal(C,K){return {root:K.back.clone().lerp(new THREE.Color(0x1a1418),.2),edge:K.main.clone().lerp(new THREE.Color(0x4a3a2a),.4),band:K.dark.clone(),bone:new THREE.Color(0x6a5e4c),claw:new THREE.Color(0xb8ac90),vein:.78}}};

// ---------------- hooks: the three drakes on the Drakelet rig ----------------
LP186.grade.Drakelet=[.5,.5];LP186.grade.Pyrewing=[.55,.5];LP186.grade.Elderdrake=[.5,.5];LP186.grade.Gravewyrm=[.5,.5];LP186.grade.Venomcoil=[.55,.5];
if(EVO100.D.Drakelet)EVO100.D.Drakelet.wing=null;   // the wings carry their own evolution (dgWingShape)
{const D=LPR.Drakelet,g0=D.geo,k0=D.kit,p0=D.post;
  const des=c=>{const sp=rv137('Drakelet',c);return DG186.on&&DG186.Q[sp]?[sp,DG186.Q[sp]]:null};
  D.geo=function(C,c){const q=des(c);if(q)return dgQGeo(q[1],C,q[0]);return g0.apply(this,arguments)};
  D.kit=function(k,c,C,red){const q=des(c);if(q)return q[1].kit(k,c,C,red,q[1].pal(C));return k0.apply(this,arguments)};
  D.post=function(x,c,C,mat){const q=des(c);if(q)return dgWings(x,c,C,mat,q[0],q[1].wing,q[1].wpal(C,q[1].pal(C)));return p0.apply(this,arguments)};
  // anchors for the colour-variant extras (lpExtras): the crown and the crest line of each body
  const anc=sp=>{const Q=DG186.Q[sp],B=Q.body,t=z=>{const q=dgAt(B,z);return q.y+q.a};return {head:['head',0,t(Q.eye.z-.06)+.004,Q.eye.z-.06],back:[['neck',0,t(.42),.42],['chest',0,t(.2),.2],['spine',0,t(0),0],['pelvis',0,t(-.24),-.24],['tail1',0,t(-.65),-.65]]}};
  const A={};['Drakelet','Pyrewing','Elderdrake'].forEach(sp=>{A[sp]=anc(sp)});
  Object.defineProperty(D,'head',{configurable:true,get(){const sp=RV137.cur.Drakelet||'Drakelet';return DG186.on&&A[sp]?A[sp].head:['head',0,.78,.56]},set(v){}});
  Object.defineProperty(D,'back',{configurable:true,get(){const sp=RV137.cur.Drakelet||'Drakelet';return DG186.on&&A[sp]?A[sp].back:[]},set(v){}})}

// ======================================================================== serpents ========================================================================
// Gravewyrm skeleton: tail3 -1.35 … pelvis -.25, spine 0, chest .2, neck .38, head (0,.32,.5), jaw (0,.27,.6), all near the ground;
// 'slither' turns them about y. Gravewyrm lies low with its head held up; Venomcoil rears: the neck rises into a hood and the head
// is held high, so its lower jaw hangs on a hinge of its own on the head bone (the jaw bone is far below it) that copies the jaw
// bone's turn every frame.
DG186.S={};
// body rings from the profile functions: radius R(z), lift L(z), sideways curve X(z); rows → section (as WY137)
function dgSRings(D,z0,z1,dz){const R=[];for(let z=z0;z<=z1+1e-6;z+=dz){const r=D.R(z),b=wyrmBones(z);R.push({p:[D.X(z),r*.74+.006+D.L(z),z],rx:r,ryT:r*.88,ryB:r*.74,w:dgW(b[0],b[1],b[2]),z})}return R}
function dgSGeo(D,C,sp){const K=D.pal(C),H=D.head,bmp=dgBumps(D.bumps||[]),HR=D.headRows;
  const sculpt=(p,n,r,s,c)=>{let d=bmp(p);if(s>.8&&D.ridge){const h=D.ridge(r.z);if(h)d+=h*Math.pow((s-.8)/.2,1.6)}return d};
  const paint=part=>(o,p,n,r,s,c,i)=>D.paint.call(D,o,K,p,n,r,s,c,i,part);
  const hr=HR.map(q=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],w:q[5]||{head:1},z:q[0],hd:1}));
  const lofts=[];
  if(D.neck){// the reared body: ground rings, then the neck rising into the hood (capped), the head its own loft
    lofts.push({rings:dgSRings(D,-1.66,D.neck[0][0]-.06,.1).concat(D.neck.map(q=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],w:q[5],z:q[0],hood:q[6]||0}))),seg:16,capA:1,capB:1,sculpt,paint:paint('body')});
    lofts.push({rings:hr,seg:16,capA:1,capB:2,sculpt,paint:paint('body')})}
  else lofts.push({rings:dgSRings(D,-1.66,HR[0][0]-.06,.1).concat(hr),seg:16,capA:1,capB:2,sculpt,paint:paint('body')});
  const jaw={rings:dgJaw(HR,H).map(r=>D.ownJaw?Object.assign(r,{w:{head:1}}):r),seg:12,capB:1,paint:paint('jaw')};
  if(D.ownJaw)return dg186Geo('DG186|'+sp+'|'+C,'Gravewyrm',lofts);
  return dg186Geo('DG186|'+sp+'|'+C,'Gravewyrm',lofts.concat([jaw]))}
// the hinged lower jaw of a reared head: its loft, lower teeth and tongue, on a pivot at the hinge on the head bone
function dgSJaw(x,D,C,sp,mat){const K=D.pal(C),H=D.head,HR=D.headRows,hz=H.hinge,ha=dgAt(HR,hz),hy=ha.y-ha.b;
  const G=dg186Geo('DG186J|'+sp+'|'+C,'Gravewyrm',[{rings:dgJaw(HR,H).map(r=>Object.assign(r,{w:{head:1}})),seg:12,capB:1,paint:(o,p,n,r,s,c,i)=>D.paint.call(D,o,K,p,n,r,s,c,i,'jaw')}]);
  const piv=lpPart(x.S,x.bones,'head',G,mat,0,hy,hz,1,1,1);piv.children[0].position.set(0,-hy,-hz);
  const k=dkKit();D.jawKit(k,K);dkBake(k.P,null,'DG186JK|'+sp+'|'+C).forEach(m=>{m.position.set(0,-hy,-hz);m.castShadow=true;piv.add(m)});
  x.dgJaw=piv}
{const f=rigAnim;rigAnim=function(x,now,mv,sp){const r=f.apply(this,arguments);if(x&&x.dgJaw&&x.bones&&x.bones.jaw)x.dgJaw.rotation.x=Math.max(0,x.bones.jaw.rotation.x-.08)*1.1;/* the idle chew (~.04-.07) leaves it shut */return r}}
// the shared serpent paint: scutes under the belly, the lip line, palate, sockets, nostrils; D.paintX adds the species' marks
function dgPaintS(D,o,K,p,n,r,s,c,i,part){const z=p[2],x=Math.abs(p[0]),hz=D.headZ,mz=D.head.hinge-.03;
  if(part=='jaw'){if(s>.25){o.copy(x<r.rx*.4?K.tongue:K.mouth);return}o.copy(K.throat);if(s>-.3)o.copy(K.main).lerp(K.lip,.3);if(s>.05)o.copy(K.lip);if(D.paintX)D.paintX(o,K,p,n,r,s,c,i,part);return}
  o.copy(K.main);if(s>.45)o.lerp(K.back,Math.min(1,(s-.45)/.45)*.85);
  if(!r.hd&&!r.hood&&s<-.42){o.copy(K.bel);if(i%2)o.multiplyScalar(.8);if(s>-.6)o.lerp(K.main,.5)}
  if(r.hd){if(s<-.2&&z<mz+.02)o.copy(K.throat);
    const inJ=x<r.rx*D.head.jw*.86;
    if(z>mz&&s<-.2&&(s>-.82||!inJ))o.lerp(K.lip,.5+(s<-.5?.35:0));
    if(z>mz&&s<=-.82&&inJ)o.copy(K.mouth);
    const E=D._eye||(D._eye=dgSurf(D.headRows,D.eye.z,D.eye.t,1).p),de=dgD(p,E),ER=D.eye.sock||.03;if(de<ER)o.lerp(K.sock,Math.min(1,(ER-de)/(ER*.45)));
    if(dgD(p,D.nos)<.016)o.lerp(K.sock,.85)}
  if(D.paintX)D.paintX(o,K,p,n,r,s,c,i,part)}
// the shared serpent kit: eyes, the upper teeth and fangs, forked tongue (on the jaw), back spines
function dgKitS(D,k,c,C,red,K){const HR=D.headRows,H=D.head;
  [-1,1].forEach(s=>{
    {const E=D.eye,q=dgSurf(HR,E.z,E.t,s);dgEye(k,s,q.p,q.n,E.len,E.h,red?0xff2a2a:D.eyeCol,{tilt:E.tilt==null?.12:E.tilt})}
    dgBrow(k,s,HR,D.eye,D.browCol!=null?D.browCol:K.back.getHex(),D.eye.brow||.009);
    D.teeth.up.forEach(q=>{const h=dgAt(HR,q[0]);dgTooth(k,'head',q[3]?K.fang:K.tooth,[s*h.w*(q[4]||.84),h.y-h.b*.5,q[0]],[s*.04,-1,q[3]?.22:.1],q[1]+h.b*.5,q[2])})});
  if(!D.ownJaw)D.jawKit(k,K);
  if(D.spine)for(let z=D.spineZ[0];z>D.spineZ[1];z-=D.spineZ[2]){const sp=D.spine(z);if(!sp)continue;const r=D.R(z),top=r*.74+.006+D.L(z)+r*.88+(D.ridge?D.ridge(z):0),bn=wyrmBones(z)[0];
    dgChain(k,bn,[[D.X(z),top-sp[1],z+sp[1]*.8],[D.X(z),top+sp[0]*.55,z-sp[0]*.3],[D.X(z),top+sp[0],z-sp[0]*.8]],sp[1],.0015,K.spine,K.spine2,4)}
  if(D.kitX)D.kitX(k,c,C,red,K)}
// lower teeth and a forked tongue on the jaw (bone 'jaw' or, for an own jaw, the pivot's frame: bone name ignored there)
function dgSJawKit(D,k,K){const HR=D.headRows,H=D.head,bn='jaw';
  [-1,1].forEach(s=>D.teeth.lo.forEach(q=>{const h=dgAt(HR,q[0]),jr=h.w*H.jw*.7;dgTooth(k,bn,K.tooth,[s*jr,h.y-h.b-.002,q[0]],[s*-.05,1,.05],q[1],q[2])}));
  const a=dgAt(HR,H.hinge+.02),zt=H.jz[H.jz.length-1]+.02,b=dgAt(HR,zt-.03);
  k.L(bn,'c',K.tongue.getHex(),[0,a.y-a.b-.004,H.hinge+.02],[0,b.y-b.b-.002,zt-.03],.011,.006,5);
  [-1,1].forEach(s=>k.L(bn,'c',K.tongue.getHex(),[0,b.y-b.b-.002,zt-.03],[s*.012,b.y-b.b+.004,zt+.015],.005,.0012,4))}

// ---------------- Gravewyrm: a grave serpent ----------------
// The pale skull dome on its crown is gone. Now: a heavy, flat, viper-wedge head whose face is painted as a bone mask (pale
// over the snout and brow, dark sunken sockets round sickly eyes, black nostril pits), two grave-bone horns that grow from
// behind the eyes and sweep back along the skull before curling out (a ram's sweep, low and close, not a lid), bony brow
// ridges and a short crest of vertebra spines running from the nape down the back; a dark moss-grey body with pale rib bands
// painted across the flanks (bones showing through the hide), pale belly scutes, a bone spike on the tail.
DG186.S.Gravewyrm={eyeCol:0xd0e040,headZ:.4,
  R:z=>{const T=[[-1.66,.008],[-1.56,.025],[-1.44,.045],[-1.3,.066],[-1.15,.088],[-1,.106],[-.85,.122],[-.7,.135],[-.55,.145],[-.4,.152],[-.25,.155],[-.1,.153],[.03,.146],[.14,.133],[.24,.118],[.32,.104],[.4,.095]];
    for(let i=0;i<T.length-1;i++)if(z<=T[i+1][0])return T[i][1]+(T[i+1][1]-T[i][1])*Math.max(0,(z-T[i][0])/(T[i+1][0]-T[i][0]));return .095},
  L:z=>z<=0?0:.2*dgSm(z/.4),X:z=>z<.15?Math.sin(z*3.4+.6)*.06*Math.min(1,(.15-z)*3):0,
  headRows:[[.4,.3,.096,.072,.064,dgW('neck','head',.5)],[.45,.318,.112,.074,.06],[.5,.328,.12,.074,.053],[.55,.334,.118,.071,.046],[.6,.337,.109,.066,.039],[.65,.337,.096,.059,.034],
    [.7,.335,.082,.051,.03],[.75,.332,.067,.042,.026],[.8,.328,.051,.033,.021],[.84,.325,.035,.024,.016],[.87,.323,.018,.012,.009]],
  head:{hinge:.56,jz:[.47,.51,.54,.57,.61,.66,.71,.76,.81,.85],dep:z=>z<.57?.034:.034-(z-.57)*.06,jw:.78},
  eye:{z:.635,t:.92,len:.03,h:.008,tilt:.1,sock:.032,brow:.0105},nos:[.022,.333,.857],browCol:0xa89a7c,
  teeth:{up:[[.835,.03,.0055,1,.7],[.79,.012,.004],[.75,.012,.004],[.71,.011,.0038],[.67,.011,.0036],[.63,.01,.0034],[.595,.009,.0032]],lo:[[.8,.013,.003],[.75,.012,.003],[.7,.012,.003],[.65,.011,.003],[.61,.01,.0028]]},
  bumps:[[[.06,.375,.645],[.03,.012,.04],.012],[[.1,.34,.53],[.03,.025,.04],.01],[[.022,.336,.856],[.012,.01,.014],.004]],
  ridge:z=>z>.42?0:z>-1.4?.009:0,
  spineZ:[.36,-1.45,.11],spine:z=>{const h=z>0?.03:.022+z*.004;return h<.012?null:[h,.009]},
  pal(C){const main=dgHSL(C,.17,.18),bel=new THREE.Color().setHSL(.12,.2,.4);
    return {main,back:dgHSL(C,.15,.1),dark:dgHSL(C,.1,.04),bel,rib:new THREE.Color().setHSL(.11,.18,.4),throat:new THREE.Color().setHSL(.12,.14,.24).lerp(main,.3),
      bone:new THREE.Color().setHSL(.11,.18,.42),lip:new THREE.Color(0x14120e),mouth:new THREE.Color(0x2a0c0e),tongue:new THREE.Color(0x4a1a22),sock:new THREE.Color(0x060605),
      tooth:0xd8d0b8,fang:0xe8e0c8,spine:0x5a5040,spine2:0xb0a486,horn:0xc0b494,horn2:0x4a4234,moss:new THREE.Color().setHSL(.2,.3,.12)}},
  paint(o,K,p,n,r,s,c,i,part){dgPaintS(this,o,K,p,n,r,s,c,i,part)},
  paintX(o,K,p,n,r,s,c,i,part){const z=p[2];if(part!='body')return;
    if(!r.hd){// rib bands: pale bone arcs across the flanks on every third ring of the trunk, moss in the dark of the back
      if(z<.3&&z>-1.1&&i%3==0&&s>-.45&&s<.75)o.lerp(K.rib,.75*(1-Math.abs(s-.15)/.6));
      if(s>.55&&i%3==1)o.lerp(K.moss,.35);return}
    // the bone mask: the snout and brow pale, darkening toward the cheeks, the crown behind the eyes dark
    if(z>.56&&s>-.15){const m=Math.min(1,(s+.15)/.4)*Math.min(1,(z-.56)/.06);o.lerp(K.bone,.75*m);if(z>.79&&s>.3)o.lerp(K.bone,.1)}
    if(z<.6&&s>.35)o.lerp(K.back,.4)},
  kit(k,c,C,red,K){dgKitS(this,k,c,C,red,K)},
  jawKit(k,K){dgSJawKit(this,k,K)},
  kitX(k,c,C,red,K){const HR=this.headRows;
    [-1,1].forEach(s=>{
      // grave-bone horns: from behind the eye, back along the skull, then curling out and down at the tips
      // (low along the skull from behind the eye, past the back of the head, curling down beside the neck)
      const a=dgSurf(HR,.6,.8,s),b=dgSurf(HR,.53,.86,s),e=dgSurf(HR,.46,.95,s),p2=add3(add3(e.p,mul3(e.n,.016)),[0,0,-.02]),p3=add3(p2,[s*.03,-.022,-.055]);
      dgChain(k,'head',[add3(a.p,mul3(a.n,-.005)),add3(b.p,mul3(b.n,.008)),p2,p3,add3(p3,[s*.018,-.04,-.004])],.0145,.002,K.horn2,K.horn,5);
      // two short bone spurs on the cheek behind the mouth
      [0,1].forEach(j=>{const q=dgSurf(HR,.49-j*.035,1.5+j*.15,s);dgChain(k,'head',[add3(q.p,mul3(q.n,-.004)),add3(q.p,add3(mul3(q.n,.02),[0,0,-.025])),add3(q.p,add3(mul3(q.n,.03),[0,-.004,-.05]))],.007,.0012,K.horn2,K.horn,4)})});
    // the tail ends in a bone spike
    {const z=-1.6,r=this.R(z),y=r*.74+.006;dgChain(k,'tail3',[[this.X(z),y,z+.04],[this.X(z),y+.004,z-.05],[this.X(z),y+.012,z-.13]],.016,.002,K.horn2,K.horn,5)}}};

// ---------------- Venomcoil: a king cobra ----------------
// Reared: the body lies in coils on the ground, then the neck rises into a broad hood (the neck itself, flattened, not a
// disc stuck on it), olive-black with a pale throat banded in dark bars and pale chevrons down its back; the head is a
// rounded cobra head with big head plates painted on, venom-yellow eyes under heavy brows, two long fangs at the front of
// the upper jaw, a lower jaw on its own hinge with teeth and a forked tongue; venom-yellow bands down the body.
DG186.S.Venomcoil={eyeCol:0xc8ff3a,headZ:.3,ownJaw:1,
  R:z=>{const T=[[-1.66,.008],[-1.56,.024],[-1.44,.042],[-1.3,.062],[-1.15,.082],[-1,.098],[-.85,.112],[-.7,.123],[-.55,.131],[-.4,.136],[-.25,.138],[-.1,.136],[.0,.13]];
    for(let i=0;i<T.length-1;i++)if(z<=T[i+1][0])return T[i][1]+(T[i+1][1]-T[i][1])*Math.max(0,(z-T[i][0])/(T[i+1][0]-T[i][0]));return .13},
  L:z=>0,X:z=>z<.0?Math.sin(z*3.4+.6)*.07*Math.min(1,(-z)*3):0,
  // the rising neck: [z, y, half width, back, front, weights, hood]
  neck:[[.04,.12,.128,.11,.096,{chest:.6,spine:.4}],[.11,.16,.12,.1,.092,{chest:1}],[.16,.22,.112,.09,.086,{chest:.7,neck:.3}],[.195,.29,.124,.068,.07,{neck:.7,chest:.3},.5],
    [.212,.35,.17,.048,.054,{neck:1},1],[.224,.41,.225,.04,.046,{neck:1},1],[.233,.465,.238,.036,.042,{neck:.9,head:.1},1],[.241,.515,.205,.036,.042,{neck:.75,head:.25},1],[.248,.552,.14,.04,.046,{neck:.55,head:.45},1],
    [.252,.58,.092,.046,.048,{neck:.35,head:.65},.4],[.26,.605,.058,.045,.045,{head:1}]],
  headRows:[[.25,.6,.05,.042,.04],[.29,.624,.07,.052,.042],[.33,.636,.08,.055,.04],[.37,.642,.083,.054,.036],[.41,.643,.08,.051,.032],[.45,.641,.072,.045,.028],
    [.49,.637,.06,.038,.024],[.525,.633,.045,.03,.019],[.552,.63,.028,.02,.013],[.568,.628,.012,.009,.007]],
  head:{hinge:.355,jz:[.31,.335,.36,.39,.43,.47,.505,.535,.555],dep:z=>z<.37?.03:.03-(z-.37)*.075,jw:.76},
  eye:{z:.43,t:.98,len:.026,h:.0075,tilt:.08,sock:.028,brow:.0095},nos:[.017,.636,.553],
  teeth:{up:[[.528,.038,.0058,1,.66],[.49,.01,.0034],[.455,.01,.0034],[.42,.009,.0032],[.385,.009,.003]],lo:[[.5,.011,.0028],[.465,.011,.0028],[.43,.01,.0028],[.395,.01,.0026]]},
  bumps:[[[.05,.672,.44],[.026,.01,.04],.01],[[.075,.632,.36],[.025,.022,.036],.008],[[.017,.637,.552],[.01,.008,.012],.003]],
  ridge:z=>z>.0?0:z>-1.4?.007:0,
  pal(C){const main=dgHSL(C,.24,.13),bel=new THREE.Color().setHSL(.15,.32,.36);
    return {main,back:dgHSL(C,.2,.05),dark:dgHSL(C,.14,.03),bel,band:new THREE.Color().setHSL(.17,.55,.3),throat:new THREE.Color().setHSL(.15,.28,.34),bar:dgHSL(C,.2,.05),
      plate:dgHSL(C,.22,.075),lip:new THREE.Color(0x10120a),mouth:new THREE.Color(0x2e0c10),tongue:new THREE.Color(0x3a0e1a),sock:new THREE.Color(0x050604),
      tooth:0xd8d4bc,fang:0xeee8d0,spine:0x1a1c10,spine2:0x6a6a3a,spec:new THREE.Color().setHSL(.15,.38,.4)}},
  paint(o,K,p,n,r,s,c,i,part){dgPaintS(this,o,K,p,n,r,s,c,i,part)},
  paintX(o,K,p,n,r,s,c,i,part){const z=p[2];if(part!='body')return;
    if(r.hood){// the hood: a pale throat crossed by dark bars in front, the dark back with a pale rim
      if(s<0){o.copy(K.throat);if(i%2==1&&Math.abs(p[0])<r.rx*.7)o.lerp(K.bar,.75);return}
      o.copy(K.back);if(Math.abs(c)>.85)o.lerp(K.spec,.35);return}
    if(r.hd){// big head plates: darker seams between paler plates on the crown, a pale lip scale row
      if(s>.4&&z>.33&&z<.53&&Math.abs(p[0])<.012)o.lerp(K.dark,.5);if(s>-.2&&s<.15&&z>.35)o.lerp(K.throat,.25);return}
    // venom bands on the coils (every fourth ring), a dark back
    if(z<.1&&z>-1.45&&i%4==2&&s>-.4)o.lerp(K.band,.75)},
  kit(k,c,C,red,K){dgKitS(this,k,c,C,red,K)},
  jawKit(k,K){dgSJawKit(this,k,K)},
  kitX(k,c,C,red,K){const HR=this.headRows;
    // the spectacle on the back of the hood: two pale rings joined by a bar, lying flush in the hide (dark centres)
    const back=(x,y)=>{const N=this.neck;let i=0;while(i<N.length-2&&N[i+1][1]<y)i++;const a=N[i],b=N[i+1],t=Math.max(0,Math.min(1,(y-a[1])/(b[1]-a[1]))),w=a[2]+(b[2]-a[2])*t,th=a[3]+(b[3]-a[3])*t,z=a[0]+(b[0]-a[0])*t;
      const u=Math.min(.98,Math.abs(x)/w);return [x,y,z-th*Math.sqrt(1-u*u)-.001]};
    // pale chevrons lying flush on the back of the hood (a king cobra's bars, pointing down the neck)
    [[.42,.13,.05],[.475,.15,.055],[.525,.11,.045]].forEach(q=>[-1,1].forEach(s=>{const a=back(0,q[0]-q[2]*.5),b=back(s*q[1],q[0]+q[2]*.5);k.L('neck','c',K.spec.getHex(),a,b,.0065,.005,4)}));
    // cheek venom glands (a soft swelling, painted)
    // a short barb at the tail tip
    {const z=-1.6,r=this.R(z),y=r*.74+.006;dgChain(k,'tail3',[[this.X(z),y,z+.03],[this.X(z),y+.003,z-.04],[this.X(z),y+.008,z-.1]],.012,.0015,K.spine,K.spine2,4)}},
  post(x,c,C,mat){dgSJaw(x,this,C,'Venomcoil',mat)}};

// ---------------- hooks: the two serpents on the Gravewyrm rig ----------------
{const D=LPR.Gravewyrm,g0=D.geo,k0=D.kit,p0=D.post;
  const des=c=>{const sp=rv137('Gravewyrm',c);return DG186.on&&DG186.S[sp]?[sp,DG186.S[sp]]:null};
  D.geo=function(C,c){const q=des(c);if(q)return dgSGeo(q[1],C,q[0]);return g0.apply(this,arguments)};
  D.kit=function(k,c,C,red){const q=des(c);if(q)return q[1].kit(k,c,C,red,q[1].pal(C));return k0.apply(this,arguments)};
  D.post=function(x,c,C,mat){const q=des(c);if(q){if(q[1].post)q[1].post(x,c,C,mat);return}if(p0)return p0.apply(this,arguments)};
  const anc=sp=>{const Q=DG186.S[sp],HR=Q.headRows,t=z=>{const q=dgAt(HR,z);return q.y+q.a},b=z=>{const r=Q.R(z);return r*.74+.006+Q.L(z)+r*.88};
    return {head:['head',0,t(Q.eye.z-.05)+.004,Q.eye.z-.05],back:Q.neck?[['spine',0,b(-.05),-.05],['pelvis',0,b(-.27),-.27],['tail0',0,b(-.52),-.52]]:[['chest',0,b(.2),.2],['spine',0,b(0),0],['pelvis',0,b(-.27),-.27],['tail0',0,b(-.52),-.52]]}};
  const A={};['Gravewyrm','Venomcoil'].forEach(sp=>{A[sp]=anc(sp)});
  Object.defineProperty(D,'head',{configurable:true,get(){const sp=RV137.cur.Gravewyrm||'Gravewyrm';return DG186.on&&A[sp]?A[sp].head:['head',0,.46,.55]},set(v){}});
  Object.defineProperty(D,'back',{configurable:true,get(){const sp=RV137.cur.Gravewyrm||'Gravewyrm';return DG186.on&&A[sp]?A[sp].back:[]},set(v){}})}

// ======================================================================== evolution looks ========================================================================
// One theme per species, every level keeps the last and adds a visible step (the owner's model is the Foxlet: horns, crest,
// armour, glowing marks, a more regal look; never clutter). Levels by stage (1710): tier 1-2 0/1/2/4, tier 3-4 1/2/3/5, tier 5
// 2/3/4/5. Parts are placed on the new bodies from their own rows (dgSurf) or by rays (E.on / E.top), skinned like the hide.
//  * Drakelet, ember drake: L1 a second pair of horns, embers in the throat scales · L2 tall sail-spines on the back, cheek frills ·
//    L3 dark scale armour over chest and shoulders, glowing vents beside the spine, the sail tips glow · L4 a crown of horns
//    tipped in gold, a brow gem, molten scales under the belly · L5 a flame crest down the neck, burning eyes, a burning spade
//  * Pyrewing, magma wyvern: L1 more lava seams (neck, tail), ember horn tips · L2 the cheek frill and tail blade burn, obsidian
//    elbow spurs · L3 obsidian plates on neck and chest, a magma heart, glowing seams by the spine · L4 an obsidian crown with
//    molten tips, a brow gem, molten veins in the wings · L5 a burning mane, wings burning at the edge, blazing eyes
//  * Elderdrake, ancient sovereign: L1 carved runes on the shoulders, bronze rings on the great horns · L2 gilded horn tips,
//    rings on the lesser horns · L3 bronze-rimmed regal plates, gilded spine caps · L4 a golden circlet with a gem, glowing runes
//    down the wing arms · L5 dragonfire: glowing throat and jaw vents, burning eyes, a flame crest
//  * Gravewyrm, grave serpent: L1 grave-light in the sockets, venom on the fangs, a second pair of bone horns · L2 a hood of
//    bone ribs and ragged skin behind the head · L3 bone plates down the back with carved glowing runes · L4 a crown of bone
//    horns, glowing veins in the hood, a bone blade on the tail · L5 ghost flames along the spine, burning eyes
//  * Venomcoil, cobra king: L1 dripping fangs, glowing venom glands, the spectacle's eyes glow · L2 a fringe of spines round
//    the hood, glowing venom bands · L3 an armoured crown of head plates, the spectacle blazes · L4 a cobra crown of curved
//    spines, a brow gem, glowing hood ribs · L5 a venom crest of glowing spines on the hood rim, burning eyes, venom dripping
DG186.E={};
// a point on a drake's head surface lifted (k > 0) or sunk (k < 0) along its normal
function dgHS(B,z,t,s,k){const q=dgSurf(B,z,t,s);return add3(q.p,mul3(q.n,k||0))}
DG186.E.Drakelet=function(E,L,P,c,D){const B=D.body,K=D.pal(P.C),hb={bn:'head'},bone=0xa49678,boneD=0x3a3028,mainD=K.back.getHex();
  // L1: a second, longer pair of horns above the first, bone cheek frills, embers glowing in the throat scales
  [-1,1].forEach(s=>{E.horn(dgHS(B,.615,.3,s,-.004),[s*.22,.7,-1],[s*.01,-.05,-.03],.2+.025*L,.013,'c',boneD,5,hb,L>=4?P.trim:bone);
    for(let i=0;i<3;i++){const b=dgHS(B,.585-i*.012,1.5+i*.28,s,-.004);E.L(b,add3(b,[s*(.06+.004*L),.015-i*.025,-.065]),.009,.0012,'c',i%2?boneD:mainD,4,hb)}
    [.44,.38,.32].forEach(z=>{const a=dgSurf(B,z,2.35,s),b=dgSurf(B,z-.05,2.35,s);E.L(add3(a.p,mul3(a.n,.0012)),add3(b.p,mul3(b.n,.0012)),.0048,.0034,'g',P.glow,3,{vs:1})})});
  if(L>=2){// a dorsal sail: tall spines over the shoulders and back with a dark membrane between them (its edge glows from L3)
    const S=[];for(let z=.305;z>-.36;z-=.065){const q=dgAt(B,z),top=q.y+q.a+D.ridge(z),h=.075-Math.abs(z-.02)*.07+.006*(L-2);S.push({z,top,h,base:[0,top-.006,z],tip:[0,top+h,z-.03]})}
    S.forEach((q,i)=>{E.L([0,q.top-.012,q.z+.016],q.tip,.012,.0015,'c',mainD,4);if(L>=3&&i%2==0)E.L(lerp3(q.base,q.tip,.7),add3(q.tip,[0,.004,-.002]),.005,.001,'g',P.glow,3);
      const n=S[i+1];if(n)E.fan(q.base,[lerp3(q.base,q.tip,.86),lerp3(n.base,n.tip,.86),n.base],K.dark.getHex(),L>=3?P.glowD:K.back.getHex(),'c')})}
  if(L>=3){// scale armour across the chest and shoulders (bone-rimmed), glowing vents beside the spine
    E.shell((x,y,z,nx,ny,nz)=>z>.1&&z<.36&&y>.47&&ny>-.25,.013,'c',new THREE.Color(0x4a3e46).lerp(K.side,.4).getHex(),{rimCol:bone});
    [.05,-.15].forEach(z=>[-1,1].forEach(s=>{const a=dgSurf(B,z+.025,.5,s),b=dgSurf(B,z-.025,.5,s);E.L(add3(a.p,mul3(a.n,.0012)),add3(b.p,mul3(b.n,.0012)),.0048,.0048,'g',P.glow,3,{vs:1})}))}
  if(L>=4){// a crown of four horns tipped in gold, a gem on the brow, molten scales under the belly
    [-1,1].forEach(s=>[0,1].forEach(j=>E.horn(dgHS(B,.655-j*.03,.22+j*.2,s,-.004),[s*(.15+j*.3),1,-.45],[0,0,-.04],.1-j*.015,.009,'c',boneD,4,hb,P.trim)));
    E.gem({p:dgHS(B,.745,0,1,.002),n:dgSurf(B,.745,0,1).n},.015,P.glow,hb);
    E.shell((x,y,z,nx,ny)=>ny<-.6&&z>-.3&&z<.3,.004,'g',P.glowD,{rim:false})}
  if(L>=5){// a flame crest down the neck, burning eyes, a burning spade
    for(let i=0;i<5;i++){const z=.5-i*.05,q=dgAt(B,z),top=q.y+q.a;E.L([0,top-.008,z],[0,top+.09-i*.008,z-.07],.017,.0015,'g',i%2?P.glow:P.glow2,4)}
    [-1,1].forEach(s=>{const e=dgSurf(B,D.eye.z,D.eye.t,s).p;E.L(add3(e,[s*.003,.004,-.012]),add3(e,[s*.03,.012,-.1]),.0045,.0008,'g',P.glow2,3,hb)});
    E.pd('cone4','g',P.glow,[0,.557,-1.35],[0,0,-1],[.036,.09,.008],[0,1,0],{bn:'tail3'})}};
DG186.E.Pyrewing=function(E,L,P,c,D){const B=D.body,K=D.pal(P.C),hb={bn:'head'},obs=K.spine,obs2=K.spine2;
  // L1: lava seams spread up the neck and down the tail, the horn tips smoulder
  [-1,1].forEach(s=>{[[.45,'neck',[[.9,0],[1.2,-.03],[1.5,-.05]]]].forEach(q=>{const P2=q[2].map(u=>dgSurf(B,q[0]+u[1],u[0],s));
      for(let i=0;i<P2.length-1;i++)E.L(add3(P2[i].p,mul3(P2[i].n,.0008)),add3(P2[i+1].p,mul3(P2[i+1].n,.0008)),.0042,.0034,'g',i%2?P.glow:P.glow2,3,{vs:1})});
    const H=dgHornPts([s*.034,.758,.63],[s*.28,.42,-1],[s*.02,.03,-.02],.3,5),t=H[5],d=nrm3(sub3(H[5],H[4]));E.L(sub3(t,mul3(d,.02)),add3(t,mul3(d,.025+.005*L)),.0035,.0008,'g',P.glow,3,hb)});
  // the obsidian blades down the back glow molten at their tips
  for(let z=D.spineZ[0],j=0;z>-.45;z-=D.spineZ[2],j++){const sp=D.spine(z);if(!sp)continue;const q=dgAt(B,z),top=q.y+q.a+D.ridge(z),h=sp[0]*(L>=2&&z<.35?1.5:1),m=[0,top+h*.55,z-h*.25],tip=[0,top+h,z-h*.75];
    if(L>=2&&z<.35)E.L([0,top-.01,z+.012],tip,sp[1]*1.25,.0015,'c',obs,4);if(j%2==0)E.L(lerp3(m,tip,.35),add3(tip,mul3(nrm3(sub3(tip,m)),.004)),sp[1]*.5,.001,'g',P.glow,3)}
  if(L>=2){// the cheek frill burns, a bigger flame blade on the tail, obsidian spurs on the elbows
    [-1,1].forEach(s=>{const hub=[s*.052,.692,.612],tips=[[s*.13,.73,.53],[s*.15,.69,.51],[s*.135,.645,.52]].map(t=>lerp3(hub,t,.9));E.fan(add3(hub,[s*.002,0,0]),tips.map(t=>add3(t,[s*.002,0,0])),0x3a0c04,L>=4?P.glow:P.glowD,'c',hb);
      const el=s<0?'fl1':'fr1';E.L([s*.1,.215,.218],[s*.1,.25,.17],.009,.0012,'c',obs,4,{bn:el})});
    E.pd('cone4','g',P.glow2,[0,.585,-1.6],[0,.15,-1],[.01,.14,.06],[0,1,0],{bn:'tail3'})}
  if(L>=3){// obsidian plates on the neck and chest rimmed with embers, a magma heart in the breast, seams beside the spine
    E.shell((x,y,z,nx,ny,nz)=>z>.14&&z<.46&&y>.5&&ny>-.15,.013,'c',0x2a2226,{rimCol:P.glow});
    const ch=E.on([0,.43,1.5],[0,0,-1]);if(ch)E.gem({p:add3(ch.p,mul3(ch.n,.003)),n:ch.n},.018,P.glow);
    [.07,-.13].forEach(z=>[-1,1].forEach(s=>{const a=dgSurf(B,z+.022,.4,s),b=dgSurf(B,z-.022,.4,s);E.L(add3(a.p,mul3(a.n,.0012)),add3(b.p,mul3(b.n,.0012)),.004,.004,'g',P.glow,3,{vs:1})}))}
  if(L>=4){// an obsidian crown of spikes with molten tips round the back of the skull, a brow gem (the wings get molten veins)
    for(let i=-2;i<=2;i++){const s=i<0?-1:1,t=Math.abs(i)*.42,b=dgHS(B,.6+Math.abs(i)*.006,t,s||1,-.004),d=[i*.3,1,-.55];E.horn(b,d,[0,-.01,-.04],.08-Math.abs(i)*.012,.008,'c',obs,4,hb,P.glow)}
    E.gem({p:dgHS(B,.77,0,1,.002),n:dgSurf(B,.77,0,1).n},.013,P.glow,hb)}
  if(L>=5){// a burning mane down the neck and shoulders, blazing eyes (the wings burn at the edge)
    for(let i=0;i<7;i++){const z=.52-i*.05,q=dgAt(B,z),top=q.y+q.a;E.L([0,top-.008,z],[0,top+.09-i*.006,z-.07],.017,.0015,'g',i%2?P.glow:P.glow2,4)}
    [-1,1].forEach(s=>{const e=dgSurf(B,D.eye.z,D.eye.t,s).p;E.L(add3(e,[s*.003,.004,-.012]),add3(e,[s*.03,.014,-.1]),.0045,.0008,'g',P.glow2,3,hb)})}};
DG186.E.Elderdrake=function(E,L,P,c,D){const B=D.body,K=D.pal(P.C),hb={bn:'head'},gold=L>=4?P.gold:P.trim;
  const great=s=>dgHornPts([s*.036,.758,.632],[s*.25,.45,-1],[s*.03,.07,.0],.3,5),lesser=s=>dgHornPts([s*.058,.738,.612],[s*.5,.12,-1],[0,-.02,-.01],.16,4);
  const ring=(pts,t,r,col)=>{const i=Math.floor(t*(pts.length-1)),f=t*(pts.length-1)-i,p=lerp3(pts[i],pts[Math.min(i+1,pts.length-1)],f),d=sub3(pts[Math.min(i+1,pts.length-1)],pts[i]);E.pd('ring','m',col,p,d,[r,r*1.3,r],null,hb)};
  // L1: carved runes glowing on the shoulders, bronze rings on the great horns
  [-1,1].forEach(s=>{const h=E.on([s*.5,.52,.2],[-s,0,0]);if(h)E.rune({p:add3(h.p,mul3(h.n,.003)),n:h.n},[0,1,0],.034,P.glow);ring(great(s),.3,.018,P.trim);
    const H=great(s),d=nrm3(sub3(H[5],H[4]));E.L(sub3(H[5],mul3(d,.04)),add3(H[5],mul3(d,.015)),.0065,.0012,'m',gold,4,hb)});
  if(L>=2){// gilded tips on the great horns, rings on the lesser horns
    [-1,1].forEach(s=>{ring(lesser(s),.45,.012,P.trim);ring(great(s),.62,.013,gold)});
    for(let i=0;i<5;i++){const z=.5-i*.045,q=dgAt(B,z),top=q.y+q.a;E.L([0,top-.01,z+.01],[0,top+.07-i*.006+.006*(L-2),z-.06],.012,.0015,'c',K.spine,4);E.L([0,top+.045-i*.004,z-.035],[0,top+.072-i*.006+.006*(L-2),z-.061],.0045,.001,'m',gold,4)}}
  if(L>=3){// regal plates over the chest and shoulders rimmed in bronze, gilded caps on the tall spines of the back
    E.shell((x,y,z,nx,ny,nz)=>z>.1&&z<.36&&y>.5&&ny>-.2,.014,'m',new THREE.Color(P.metal).lerp(new THREE.Color(0x8a6a3a),.4).getHex(),{rimCol:P.trim});
    for(let z=D.spineZ[0];z>-.4;z-=D.spineZ[2]){const sp=D.spine(z);if(!sp||z<-.3)continue;const q=dgAt(B,z),top=q.y+q.a+D.ridge(z),h=sp[0],tip=[0,top+h,z-h*.75],m=[0,top+h*.55,z-h*.25];E.L(lerp3(m,tip,.45),add3(tip,mul3(nrm3(sub3(tip,m)),.004)),.0045,.0012,'m',gold,4)}}
  if(L>=4){// a golden circlet across the brow with a gem (the wings get glowing rune lines down the arms)
    const arc=[];for(let i=-3;i<=3;i++){const s=i<0?-1:1,t=Math.abs(i)/3*1.15;arc.push(dgHS(B,.7-Math.abs(i)*.012,t,s,.004))}
    for(let i=0;i<arc.length-1;i++)E.L(arc[i],arc[i+1],.0055,.0055,'m',P.gold,4,hb);
    E.gem({p:dgHS(B,.7,0,1,.006),n:dgSurf(B,.7,0,1).n},.016,P.glow,hb)}
  if(L>=5){// dragonfire: glowing vents along the throat and the jaw corners, burning eyes, a flame crest on the neck
    [-1,1].forEach(s=>{[.48,.42,.36].forEach(z=>{const a=dgSurf(B,z,2.3,s),b=dgSurf(B,z-.04,2.3,s);E.L(add3(a.p,mul3(a.n,.0012)),add3(b.p,mul3(b.n,.0012)),.0045,.0032,'g',P.glow,3,{vs:1})});
      const e=dgSurf(B,D.eye.z,D.eye.t,s).p;E.L(add3(e,[s*.003,.004,-.012]),add3(e,[s*.03,.014,-.11]),.0048,.0008,'g',P.glow2,3,hb)});
    for(let i=0;i<5;i++){const z=.5-i*.055,q=dgAt(B,z),top=q.y+q.a;E.L([0,top-.008,z],[0,top+.09-i*.008,z-.07],.016,.0015,'g',i%2?P.glow:P.glow2,4)}}};
DG186.E.Gravewyrm=function(E,L,P,c,D){const HR=D.headRows,K=D.pal(P.C),hb={bn:'head'},bone=0xc0b494,boneD=0x4a4234;
  // L1: grave-light in the sockets, venom on the long fangs, a second pair of bone horns from the crown
  [-1,1].forEach(s=>{const e=dgSurf(HR,D.eye.z,D.eye.t,s).p;E.L(add3(e,[s*.002,.003,-.014]),add3(e,[s*.012,.006,-.05]),.004,.0012,'g',P.glow,3,hb);
    const f=D.teeth.up[0],h=dgAt(HR,f[0]),tip=[s*h.w*f[4]+s*.04*.0,h.y-h.b-f[1],f[0]+.006];E.L(add3(tip,[0,.006,0]),add3(tip,[0,-.022,.002]),.003,.0012,'g',P.glow,3,hb);
    [.6,.66].forEach((z,j)=>{const q=dgSurf(HR,z,1.62,s);E.L(add3(q.p,mul3(q.n,-.004)),add3(q.p,add3(mul3(q.n,.022+.004*L),[0,-.006,-.03])),.0065,.0012,'c',j?bone:0x8a7e64,4,hb)})});
  if(L>=2){// a hood of bone ribs behind the head with ragged skin between them
    [-1,1].forEach(s=>{const base=[s*.05,.33,.39],pts=[[s*.06,.42,.42],[s*.14,.47,.39],[s*.22,.45,.35],[s*.26,.38,.32],[s*.25,.3,.3],[s*.18,.24,.3]];
      E.fan(base,pts,K.dark.getHex(),L>=4?new THREE.Color(K.main).lerp(new THREE.Color(P.glowD),.35).getHex():K.back.getHex(),'c',{bn:'neck'});pts.slice(1,5).forEach(p=>E.L(base,add3(p,mul3(nrm3(sub3(p,base)),.01)),.0065,.002,'c',bone,4,{bn:'neck'}))})}
  if(L>=3){// bone plates down the back with carved runes that glow
    [[.25,.08],[.02,-.16],[-.24,-.42],[-.5,-.7]].forEach((q,k)=>E.shell((x,y,z,nx,ny)=>z<q[0]&&z>q[1]&&ny>.6,.009,'c',k%2?0x8a7e64:0xa89a7c,{rimCol:0x5a5040}));
    [.15,-.07,-.33].forEach(z=>{const h=E.top(D.X(z)+.03,z);if(h)E.rune({p:add3(h.p,mul3(h.n,.012)),n:h.n},[0,0,1],.026,P.glow)})}
  if(L>=4){// a crown of bone horns, glowing veins in the hood, a bone blade on the tail
    // grave-light cracks across the bone mask (lying in it), not more horns on the crown
    [-1,1].forEach(s=>{const P3=[[.79,.25],[.74,.42],[.7,.3],[.66,.5]].map(q=>add3(dgSurf(HR,q[0],q[1],s).p,[0,.0015,0]));for(let i=0;i<P3.length-1;i++)E.L(P3[i],P3[i+1],.0032,.0028,'g',P.glow,3,hb)});
    [-1,1].forEach(s=>[[.13,.46,.4],[.22,.42,.35],[.22,.32,.31]].forEach(q=>E.L([s*.05,.33,.39],[s*q[0],q[1],q[2]],.0032,.002,'g',P.glow,3,{bn:'neck'})));
    E.pd('oct','c',bone,[D.X(-1.75),.03,-1.79],[0,0,-1],[.04,.07,.012],[0,1,0],{bn:'tail3'})}
  if(L>=5){// ghost flames along the spine, burning eyes
    [.3,.05,-.2,-.45,-.7].forEach((z,i)=>{const h=E.top(D.X(z),z);if(h)E.L(add3(h.p,mul3(h.n,-.004)),E.add(h.p,E.nrm([0,1,-.7]),.1-i*.008),.018,.0015,'g',i%2?P.glow:P.glow2,4)});
    [-1,1].forEach(s=>{const e=dgSurf(HR,D.eye.z,D.eye.t,s).p;E.L(add3(e,[s*.003,.004,-.012]),add3(e,[s*.03,.012,-.1]),.0045,.0008,'g',P.glow2,3,hb)})}};
DG186.E.Venomcoil=function(E,L,P,c,D){const HR=D.headRows,N=D.neck,K=D.pal(P.C),hb={bn:'head'},nb={bn:'neck'};
  const rim=(i,s)=>{const q=N[i];return [s*q[2],q[1],q[0]]};
  // L1: venom on the fangs, glowing venom glands behind the mouth, the spectacle's eyes glow
  [-1,1].forEach(s=>{const f=D.teeth.up[0],h=dgAt(HR,f[0]),tip=[s*h.w*f[4],h.y-h.b-f[1]+.004,f[0]+.008];E.L(add3(tip,[0,.004,0]),add3(tip,[0,-.026,.002]),.0032,.0012,'g',P.glow,3,hb);
    const g=dgSurf(HR,.375,1.62,s);E.pd('sph','g',P.glowD,add3(g.p,mul3(g.n,.001)),g.n,[.016,.003,.024],[0,0,1],hb)});
  if(L>=2){// a fringe of short dark spines round the hood's rim, venom bands glowing along the back
    [4,5,6,7].forEach(i=>[-1,1].forEach(s=>{const p=rim(i,s);E.L(add3(p,[-s*.01,0,0]),add3(p,[s*(.035+.004*L),.012,-.012]),.006,.0012,'c',K.spine,4,nb)}));
    [-.2,-.55,-.9].forEach(z=>{const h=E.top(D.X(z),z);if(h)E.L(add3(h.p,[-.025,-.006,0]),add3(h.p,[.025,-.006,0]),.0035,.0035,'g',P.glow,3,{vs:1})})}
  if(L>=3){// an armoured crown: dark plates over the head rimmed in venom
    E.shell((x,y,z,nx,ny)=>z>.3&&z<.5&&ny>.55&&y>.6,.006,'c',K.dark.getHex(),{rimCol:P.glowD})}
  if(L>=4){// a cobra crown of curved spines rising behind the head, a brow gem, glowing ribs down the front of the hood
    for(let i=-2;i<=2;i++){const s=i<0?-1:1,b=dgHS(HR,.31+Math.abs(i)*.006,Math.abs(i)*.45,s||1,-.004);E.horn(b,[i*.25,1,-.35],[0,-.01,-.04],.085-Math.abs(i)*.012,.0075,'c',K.spine,4,hb,P.glow)}
    E.gem({p:dgHS(HR,.45,0,1,.003),n:dgSurf(HR,.45,0,1).n},.012,P.glow,hb);
    [-1,1].forEach(s=>[.4,.47].forEach(y=>{const q=N.find(r=>r[1]>=y)||N[5],z=q[0]+q[4]+.001;E.L([s*.02,y,z],[s*q[2]*.75,y-.015,z-.01],.003,.002,'g',P.glow,3,nb)}))}
  if(L>=5){// a venom crest of glowing spine tips round the hood, burning eyes, venom dripping from the jaw
    [4,5,6,7].forEach(i=>[-1,1].forEach(s=>{const p=rim(i,s);E.L(add3(p,[s*(.03+.004*L),.01,-.01]),add3(p,[s*(.05+.004*L),.016,-.016]),.004,.0008,'g',P.glow2,3,nb)}));
    [-1,1].forEach(s=>{const e=dgSurf(HR,D.eye.z,D.eye.t,s).p;E.L(add3(e,[s*.003,.004,-.012]),add3(e,[s*.03,.012,-.09]),.0042,.0008,'g',P.glow2,3,hb)})}};
// the rigs' designs dispatch to the species
{const D=EVO100.D.Drakelet,b0=D.build;D.build=function(E,L,P,c){const sp=RV137.cur.Drakelet||'Drakelet';if(DG186.on&&DG186.E[sp]&&DG186.Q[sp])return DG186.E[sp](E,L,P,c,DG186.Q[sp]);return b0.apply(this,arguments)}}
{const D=EVO100.D.Gravewyrm,b0=D.build;D.build=function(E,L,P,c){const sp=RV137.cur.Gravewyrm||'Gravewyrm';if(DG186.on&&DG186.E[sp]&&DG186.S[sp])return DG186.E[sp](E,L,P,c,DG186.S[sp]);return b0.apply(this,arguments)}}
// the wing evolution: Pyrewing veins glow from L4, Elderdrake rune lines from L4, Drakelet ember veins at L5
DG186.Q.Pyrewing.wing.glowVein=4;DG186.Q.Drakelet.wing.glowVein=5;
