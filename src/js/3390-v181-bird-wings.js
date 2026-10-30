// ================= v181: feathered wings for the bird companions (Skyhawk, Stormtalon, Rocsovereign) =================
// Owner (Oct 30 2026): "All of our bird companions aren't quite right- specifically their wings and details. Let's clean them
// up and bring them up to standard with other models."
// Each wing was one flat fan of triangles from a single hub (lpwWing), always held straight out to the side and black on its
// underside. Now every wing is built from feathers: a jointed arm (humerus, forearm, hand) along the leading edge, primaries
// on the hand, secondaries on the forearm, tertials by the body, three rows of coverts over them, an alula at the wrist and
// pale under-coverts below. Every feather is a thin two-sided blade (its own colour above and below, barred, darker tips).
// The shape follows the species: Skyhawk a broad rounded hawk wing, Stormtalon a long narrow pointed falcon wing, Rocsovereign
// a broad eagle wing whose outer primaries spread into "fingers".
// The wing folds: three key shapes (spread, half-open, folded along the flank) are built for every wing and blended on the
// CPU into shared geometries at 11 steps (BW181.lv), so instances share them and nothing is made per creature. Standing, the
// wing lies folded on the flank (primaries crossing over the rump, every feather pushed just outside the body, `bw181Push`);
// walking it half opens and beats a little; running opens it more; attacking, flying and wing abilities spread it fully
// (`bw181Anim` after rigAnim, which also scales the shoulder flap down while folded).
// Evolution: the wing grows 6% per level (as before) and gains darker covert edges, bright flight-feather tips and a trimmed
// leading edge (the old evo100Wing only worked on lpwWing fans).
var BW181={lv:10,G:{},
  // per species: shoulder z, arm lengths [humerus, forearm, hand], arm radii, primaries / secondaries, colours
  sp:{
    Skyhawk:{T:()=>HWK_BODY,zs:.15,arm:[.13,.2,.15],rad:[.03,.024,.016],
      nP:10,pL:[.27,.37,.36],pW:.044,pTip:'round',pFing:4,notch:.72,pFan:[1.25,.04],
      nS:10,sL:.25,sW:.046,tL:.21,tW:.05,base:.2,amp:.5},
    Stormtalon:{T:()=>ST150.body,zs:.15,arm:[.13,.24,.22],rad:[.026,.02,.014],
      nP:10,pL:[.3,.52,.56],pW:.036,pTip:'point',pFing:0,notch:1,pFan:[1.2,.1],
      nS:10,sL:.2,sW:.04,tL:.19,tW:.042,base:.2,amp:.5},
    Rocsovereign:{T:()=>RS150.body,zs:.14,arm:[.15,.24,.17],rad:[.038,.03,.02],
      nP:10,pL:[.31,.45,.43],pW:.05,pTip:'round',pFing:6,notch:.55,pFan:[1.3,-.22],
      nS:12,sL:.32,sW:.056,tL:.26,tW:.06,base:.18,amp:.45}},
  // the three key poses: joint angles in the wing plane (from the span direction toward the back), the plane (back V and
  // up N), and how far the folded wing sits out from the shoulder
  pose:{sp:{ph:[.18,-.1,.3],V:[0,-.04,-1],N:[0,1,.12]},fo:{ph:[1.38,-1.6,1.52],V:[-.17,-.1,-1],N:[1,.3,0]}}};
// colours per species (THREE.Color): cov(erts), covD, fl(ight), bar, tip, und(er), undBar, lin(ing), lead (leading edge)
function bw181Cols(sp,C){const c=x=>new THREE.Color(x),mul=(a,k)=>a.clone().multiplyScalar(k),mix=(a,b,t)=>a.clone().lerp(b instanceof THREE.Color?b:c(b),t);
  if(sp=='Stormtalon'){const m=lpMain(C,.2),fl=mix(mul(m,.38),0x14161c,.45);
    return {cov:mul(m,.88),covD:mul(m,.62),fl,bar:mix(fl,0x5a6474,.35),tip:c(0x101216),und:c(0xc8ccd2).lerp(m,.12),undBar:mix(fl,0xc8ccd2,.45),lin:c(0xdfe2e6).lerp(m,.08),lead:c(0xa8b8c8)}}
  if(sp=='Rocsovereign'){const m=lpMain(C,.25),dk=mix(mul(m,.32),0x2a1e14,.35),cream=c(0xe8d8b0).lerp(m,.25);
    return {cov:m.clone(),covD:mul(m,.6),fl:dk,bar:mix(dk,cream,.42),tip:c(0x1a140e),und:mix(cream,dk,.12),undBar:mix(dk,cream,.25),lin:cream.clone(),lead:mix(cream,m,.35)}}
  const m=lpMain(C,.22),fl=mix(mul(m,.5),0x3a3024,.3),bel=c(0xd8ccb0);
  return {cov:m.clone(),covD:mul(m,.68),fl,bar:mul(fl,.62),tip:mix(mul(m,.25),0x221c18,.5),und:mix(bel,m,.15),undBar:mix(fl,bel,.35),lin:mix(bel,m,.18),lead:mul(m,1.12)}}
// piecewise-linear lookup in [v0, v(.7), v1]
function bw181PL(a,u){return u<.7?a[0]+(a[1]-a[0])*u/.7:a[1]+(a[2]-a[1])*(u-.7)/.3}
// width profile of a blade along its length t (0 root .. 1 tip)
function bw181WF(t,shape,notch){let w=t<.18?.45+.55*t/.18:1;
  if(shape=='point'){if(t>.45)w*=Math.max(0,1-(t-.45)/.55)*.9+.1*(1-t)}
  else if(shape=='lance'){if(t>.3)w*=Math.max(0,1-(t-.3)/.7)}
  else{const te=.7;if(t>te)w*=Math.sqrt(Math.max(0,1-Math.pow((t-te)/(1-te),2)))}
  if(notch<1&&t>.42)w*=notch+(1-notch)*Math.max(0,(.5-t)/.08);  // emarginated outer primaries: the "fingers"
  return w}
// push a point (model space, right side) out of the body loft T so it clears it by clr; returns the displacement or null
function bw181Push(T,x,y,z,clr){const z0=T[0][0];let zh=T[T.length-1][0];for(let i=0;i<T.length;i++)if(T[i][6]){zh=T[i][0];break}
  if(z<z0||z>zh)return null;const q=dh150At(T,z),dy=y-q.y,h=dy>0?q.a:q.b,u=x/q.w,v=dy/h,r=Math.hypot(u,v);if(r<1e-4)return null;
  const rad=Math.hypot(u*q.w,v*h)/r,rt=1.035+clr/rad;if(r>=rt)return null;const k=rt/r;return [x*k-x,dy*k-dy,0]}
// ---------------- the wing ----------------
// builds the three key shapes of the right wing in the shoulder's space: {P:[spread, half, folded] Float32Arrays, C, piv}
function bw181Build(sp,C,L,P){
  const D=BW181.sp[sp],T=D.T(),V3=THREE.Vector3,K=bw181Cols(sp,C),sc=1+.06*L;
  const q=dh150At(T,D.zs),piv=[q.w*.62,q.y+q.a*.62,D.zs];
  // evolution colours
  if(L>=2){K.covEdge=K.covD.clone().lerp(new THREE.Color(P.dark),.45)}
  if(L>=3){K.glowTip=new THREE.Color(P.glow)}
  if(L>=4){K.lead=K.cov.clone().lerp(new THREE.Color(P.trim),.4)}
  if(L>=5){K.bar=K.bar.clone().lerp(new THREE.Color(P.glowD),.3)}
  const POS=[[],[],[]],COL=[];
  // pose frames (t 0 spread, .5 half, 1 folded)
  const B0=BW181.pose.sp,B1=BW181.pose.fo,mkQ=(V,N0)=>{const v=new V3(...V).normalize(),n=new V3(...N0);n.sub(v.clone().multiplyScalar(n.dot(v))).normalize();
      const u=new V3().crossVectors(v,n);return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(u,v,n))};
  const qa=mkQ(B0.V,B0.N),qb=mkQ(B1.V,B1.N);
  const F=[0,.5,1].map(t=>{const Q=qa.clone().slerp(qb,t),U=new V3(1,0,0).applyQuaternion(Q),V=new V3(0,1,0).applyQuaternion(Q),N=new V3(0,0,1).applyQuaternion(Q);
    const ph=[0,1,2].map(i=>B0.ph[i]+(B1.ph[i]-B0.ph[i])*t),A=D.arm.map(l=>l*sc);
    const S=[0,0],E=[S[0]+A[0]*Math.cos(ph[0]),S[1]+A[0]*Math.sin(ph[0])],W=[E[0]+A[1]*Math.cos(ph[1]),E[1]+A[1]*Math.sin(ph[1])],H=[W[0]+A[2]*Math.cos(ph[2]),W[1]+A[2]*Math.sin(ph[2])];
    const O=new V3(q.w*.32*t,-.01*t,-.01*t);
    return {t,U,V,N,ph,S,E,W,H,O,kb:.55*(1-t),lm:1+.25*t,aW:W[0]}});
  // (a, b, n) in the wing plane of frame f → shoulder space
  const map=(f,a,b,n)=>f.O.clone().addScaledVector(f.U,a).addScaledVector(f.V,b).addScaledVector(f.N,n+f.kb*Math.pow(Math.max(0,a-f.aW),2));
  const dir=(f,th)=>f.U.clone().multiplyScalar(Math.cos(th)).addScaledVector(f.V,Math.sin(th)).normalize();
  const tc=new THREE.Color();
  const tri=(vs,k,ia,ib,ic)=>{POS[k].push(vs[ia].x,vs[ia].y,vs[ia].z,vs[ib].x,vs[ib].y,vs[ib].z,vs[ic].x,vs[ic].y,vs[ic].z)};
  const colTri=c=>{for(let i=0;i<3;i++)COL.push(c.r,c.g,c.b)};
  // one feather: per pose g(f) → {r:[a,b], th, n}; len, w (half width), shape, notch, ns (stations), kind (colour scheme)
  const blade=(g,o)=>{const ST=o.ns==4?[0,.35,.72,1]:o.ns==5?[0,.25,.55,.8,1]:[0,.14,.32,.52,.7,.86,1],len=o.len*sc,w=o.w*sc,th=Math.max(.0025,w*.09);
    let first=true;
    F.forEach((f,k)=>{const G=g(f),R=map(f,G.r[0],G.r[1],G.n*f.lm),d=dir(f,G.th),n=f.N.clone(),lw=new V3().crossVectors(d,n).normalize(),dr=o.droop==null?.05:o.droop;
      const rows=ST.map(t=>{const wf=bw181WF(t,o.shape,o.notch==null?1:o.notch),cam=.14*w*wf,c=R.clone().addScaledVector(d,len*t).addScaledVector(n,-dr*len*t*t*(1-f.t*.7));
        const p=bw181Push(T,c.x+piv[0],c.y+piv[1],c.z+piv[2],.008+Math.max(0,G.n)*f.lm);if(p)c.add(new V3(...p));
        return [c.clone().addScaledVector(lw,w*.75*wf).addScaledVector(n,-cam*.3),c.clone().addScaledVector(n,th*.5+cam),c.clone().addScaledVector(n,-th*.5+cam*.8),c.clone().addScaledVector(lw,-w*1.25*wf).addScaledVector(n,-cam*.3)]});
      for(let i=0;i<ST.length-1;i++){const a=rows[i],b=rows[i+1],vs=[a[0],a[1],a[2],a[3],b[0],b[1],b[2],b[3]],tm=(ST[i]+ST[i+1])/2;
        // top: lead, rachis, trail
        tri(vs,k,0,1,4);tri(vs,k,1,5,4);tri(vs,k,1,3,5);tri(vs,k,3,7,5);
        // bottom
        tri(vs,k,0,6,2);tri(vs,k,0,4,6);tri(vs,k,2,6,3);tri(vs,k,3,6,7);
        if(first){const top=[o.col(tm,0,1).clone(),o.col(tm,1,1).clone()],bot=[o.col(tm,0,0).clone(),o.col(tm,1,0).clone()];colTri(top[0]);colTri(top[0]);colTri(top[1]);colTri(top[1]);colTri(bot[0]);colTri(bot[0]);colTri(bot[1]);colTri(bot[1])}}
      first=false})};
  // colour schemes
  const flight=(nb,j)=>(t,side,top)=>{if(top){if(t>.86)return K.glowTip&&t>.9?tc.copy(K.tip).lerp(K.glowTip,.4):tc.copy(K.tip);const b=Math.floor((t-.2)*nb);tc.copy(t>.2&&b%2==1?K.bar:K.fl);if(side)tc.multiplyScalar(.9);return tc.multiplyScalar(.96+.08*((j*7)%3)/2)}
      if(t>.88)return tc.copy(K.tip).lerp(K.und,.25);const b=Math.floor((t-.15)*(nb+1));return tc.copy(t>.15&&b%2==1?K.undBar:K.und)};
  const covert=(base,j)=>(t,side,top)=>{if(!top)return tc.copy(K.lin);tc.copy(base);if(t>.78&&K.covEdge)tc.lerp(K.covEdge,.6);else if(t>.8)tc.multiplyScalar(.84);if(side)tc.multiplyScalar(.93);return tc.multiplyScalar(.97+.05*((j*5)%4)/3)};
  const lin=(t,side,top)=>top?tc.copy(K.cov).multiplyScalar(.85):tc.copy(K.lin).multiplyScalar(t>.7?.9:1);
  // ---- primaries (0 inner .. nP-1 outer) along the hand ----
  const nP=D.nP,nS=D.nS,lerp=(a,b,t)=>a+(b-a)*t;
  for(let i=0;i<nP;i++){const u=i/(nP-1),fing=i>=nP-D.pFing,Lp=bw181PL(D.pL,u);
    blade(f=>{const s=lerp(.06,.9,u),r=[f.W[0]+(f.H[0]-f.W[0])*s,f.W[1]+(f.H[1]-f.W[1])*s];
      const thS=f.ph[2]+lerp(D.pFan[0],D.pFan[1],Math.pow(u,.8)),thF=1.53+.008*i,th=lerp(thS,thF,f.t);
      return {r,th,n:.0012*(nP-1-i)}},{len:Lp,w:D.pW*(fing?.92:1),shape:D.pTip,notch:fing?D.notch:1,col:flight(4,i),droop:.06})}
  // ---- secondaries (0 at the wrist .. nS-1 at the elbow) along the forearm ----
  for(let j=0;j<nS;j++){const v=j/(nS-1);
    blade(f=>{const s=.04+.92*v,r=[f.W[0]+(f.E[0]-f.W[0])*s,f.W[1]+(f.E[1]-f.W[1])*s];
      const thS=f.ph[1]+1.5+.28*v,thF=1.24+.2*v;return {r,th:lerp(thS,thF,f.t),n:.004+.0012*j}},{len:D.sL*(1-.08*v),w:D.sW,shape:'round',col:flight(3,j+3),droop:.04})}
  // ---- tertials: long inner feathers by the body ----
  for(let j=0;j<3;j++)blade(f=>{const s=.1+.18*j,r=[f.E[0]+(f.S[0]-f.E[0])*s,f.E[1]+(f.S[1]-f.E[1])*s];return {r,th:lerp(1.85+.1*j,1.47+.03*j,f.t),n:.009+.001*j}},
    {len:D.tL*(1-.12*j),w:D.tW,shape:'round',col:covert(j%2?K.covD:K.cov,j),droop:.03});
  // ---- greater coverts (over the secondaries and the inner primaries) ----
  for(let j=0;j<nS;j++){const v=j/(nS-1);blade(f=>{const s=.04+.92*v,r=[f.W[0]+(f.E[0]-f.W[0])*s,f.W[1]+(f.E[1]-f.W[1])*s],th=lerp(f.ph[1]+1.5+.28*v,1.24+.2*v,f.t),d=[Math.cos(th),Math.sin(th)];
      return {r:[r[0]-d[0]*.012*sc,r[1]-d[1]*.012*sc],th,n:.0065+.0008*j}},{len:D.sL*.46,w:D.sW*.95,shape:'round',ns:5,col:covert(K.cov,j),droop:.02})}
  for(let i=0;i<nP-1;i++){const u=i/(nP-1);blade(f=>{const s=lerp(.06,.9,u),r=[f.W[0]+(f.H[0]-f.W[0])*s,f.W[1]+(f.H[1]-f.W[1])*s],th=lerp(f.ph[2]+lerp(D.pFan[0],D.pFan[1],Math.pow(u,.8)),1.53+.008*i,f.t);
      return {r,th,n:.007+.001*(nP-1-i)}},{len:bw181PL(D.pL,u)*.36,w:D.pW*.9,shape:'round',ns:5,col:covert(K.covD,i),droop:.02})}
  // ---- median coverts ----
  for(let j=0;j<nS;j++){const v=j/(nS-1);blade(f=>{const s=.02+.96*v,r=[f.W[0]+(f.E[0]-f.W[0])*s,f.W[1]+(f.E[1]-f.W[1])*s],th=lerp(f.ph[1]+1.45+.3*v,1.3+.16*v,f.t);
      return {r,th,n:.011+.0006*j}},{len:D.sL*.28,w:D.sW*.85,shape:'round',ns:4,col:covert(K.cov,j+1),droop:0})}
  // ---- lesser and marginal coverts along the arm (the leading edge) ----
  const NL=12;for(let j=0;j<NL;j++){const v=j/(NL-1);blade(f=>{// along the path shoulder → elbow → wrist → part of the hand
      const seg=v<.3?[f.S,f.E,v/.3]:v<.8?[f.E,f.W,(v-.3)/.5]:[f.W,f.H,(v-.8)/.2*.55],r=[seg[0][0]+(seg[1][0]-seg[0][0])*seg[2],seg[0][1]+(seg[1][1]-seg[0][1])*seg[2]];
      const th=v<.3?lerp(1.9,1.45,f.t):v<.8?lerp(f.ph[1]+1.45,1.32,f.t):lerp(f.ph[2]+1.35,1.45,f.t);return {r,th,n:.015+.0006*j}},
      {len:.1*(1+.2*Math.sin(j*2.3)),w:.035,shape:'round',ns:4,col:(t,side,top)=>top?tc.copy(t<.5?K.lead:K.cov).multiplyScalar(.95+.1*(j%2)):tc.copy(K.lin),droop:0})}
  // ---- alula: three small feathers on the thumb at the wrist ----
  for(let j=0;j<3;j++)blade(f=>({r:[f.W[0]+.01*j,f.W[1]-.008*j],th:lerp(f.ph[2]-.3-.18*j,1.5,f.t),n:.014+.001*j}),{len:.07+.02*j,w:.022,shape:'lance',ns:4,col:covert(K.covD,j),droop:0});
  // ---- under-coverts (the pale lining beneath) ----
  for(let j=0;j<nS;j+=1){const v=j/(nS-1);blade(f=>{const s=.04+.92*v,r=[f.W[0]+(f.E[0]-f.W[0])*s,f.W[1]+(f.E[1]-f.W[1])*s];return {r,th:lerp(f.ph[1]+1.5+.28*v,1.24+.2*v,f.t),n:-.006}},
      {len:D.sL*.42,w:D.sW,shape:'round',ns:4,col:lin,droop:0})}
  for(let i=0;i<nP-2;i++){const u=i/(nP-1);blade(f=>{const s=lerp(.06,.9,u),r=[f.W[0]+(f.H[0]-f.W[0])*s,f.W[1]+(f.H[1]-f.W[1])*s];
      return {r,th:lerp(f.ph[2]+lerp(D.pFan[0],D.pFan[1],Math.pow(u,.8)),1.53,f.t),n:-.006}},{len:bw181PL(D.pL,u)*.33,w:D.pW,shape:'round',ns:4,col:lin,droop:0})}
  // ---- the arm: a flattened tube along the leading edge (shoulder → elbow → wrist → hand) ----
  {const NR=8;let first=true;F.forEach((f,k)=>{const path=[];const add=(A,B,n)=>{for(let i=0;i<n;i++){const t=i/n;path.push([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t])}};
      add(f.S,f.E,3);add(f.E,f.W,4);add(f.W,[f.W[0]+(f.H[0]-f.W[0])*.62,f.W[1]+(f.H[1]-f.W[1])*.62],2);path.push([f.W[0]+(f.H[0]-f.W[0])*.62,f.W[1]+(f.H[1]-f.W[1])*.62]);
      const R=D.rad.map(r=>r*sc),rad=i=>{const t=i/(path.length-1);return t<.35?R[0]+(R[1]-R[0])*t/.35:t<.78?R[1]+(R[2]-R[1])*(t-.35)/.43:R[2]*(1-(t-.78)/.22*.6)};
      const rings=path.map((p,i)=>{const c=map(f,p[0],p[1],.004),nx=path[Math.min(i+1,path.length-1)],pv=path[Math.max(i-1,0)],ax=map(f,nx[0],nx[1],.004).sub(map(f,pv[0],pv[1],.004)).normalize(),
        o1=new V3().crossVectors(ax,f.N).normalize(),o2=new V3().crossVectors(o1,ax).normalize(),r=rad(i);
        const out=[];for(let s=0;s<NR;s++){const a=s/NR*Math.PI*2;out.push(c.clone().addScaledVector(o1,Math.cos(a)*r).addScaledVector(o2,Math.sin(a)*r*.62))}return out});
      for(let i=0;i<rings.length-1;i++)for(let s=0;s<NR;s++){const s1=(s+1)%NR,vs=[rings[i][s],rings[i][s1],rings[i+1][s],rings[i+1][s1]];tri(vs,k,0,2,1);tri(vs,k,1,2,3);
        if(first){const up=Math.sin((s+.5)/NR*Math.PI*2)>0;tc.copy(up?K.cov:K.lin);if(Math.cos((s+.5)/NR*Math.PI*2)>.5)tc.copy(K.lead);colTri(tc);colTri(tc)}}
      // close the hand end
      const e=rings[rings.length-1],ce=e.reduce((a,b)=>a.add(b),new V3()).multiplyScalar(1/NR);for(let s=0;s<NR;s++){const s1=(s+1)%NR,vs=[e[s],e[s1],ce];tri(vs,k,0,1,2);if(first)colTri(tc.copy(K.cov))}
      first=false})}
  return {P:POS.map(a=>new Float32Array(a)),C:new Float32Array(COL),piv}}
// the shared geometry of a wing at fold level i (0 spread .. BW181.lv folded), made on first use
function bw181Geo(key,d,i){const G=BW181.G[key]||(BW181.G[key]={d,g:[]});if(G.g[i])return G.g[i];
  const f=i/BW181.lv,P=G.d.P,o=new Float32Array(P[0].length);let A,B,t;if(f<=.5){A=P[0];B=P[1];t=f*2}else{A=P[1];B=P[2];t=(f-.5)*2}
  for(let j=0;j<o.length;j++)o[j]=A[j]+(B[j]-A[j])*t;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(o,3));g.setAttribute('color',new THREE.BufferAttribute(G.d.C,3));
  g.computeVertexNormals();g.computeBoundingSphere();g.userData.bw181=1;return G.g[i]=g}
// hang the pair on the chest; x.bw181 drives the fold
function bw181Wings(x,c,C,mat,sp){const L=typeof evo100Lv=='function'&&EVO100.D.Skyhawk?evo100Lv(c):0,P=L?evo100Pal(c,'Skyhawk',L):{};
  const key=sp+'|'+C+'|'+L+'|'+(L?[P.glow,P.trim,P.dark].join(','):''),D=BW181.sp[sp];
  const d=(BW181.G[key]&&BW181.G[key].d)||bw181Build(sp,C,L,P),g=bw181Geo(key,d,BW181.lv);
  const W={key,d,lv:BW181.lv,m:[]};x.bw181={f:1,t:0,W};if(x.g)x.g.bw181=x.bw181; // g.bw181.force = a fixed fold (tests, previews)
  [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,'chest',g,mat,s*d.piv[0],d.piv[1],d.piv[2],s,1,1,0,0,0);W.m.push(p.children[0]);x.wings.push({p,s,base:D.base,amp:D.amp,bw:1})})}
// after the shared animation: fold toward the creature's state, pick the shared geometry for that fold, scale the flap
function bw181Anim(x,now){const B=x.bw181,g=x.g,G=(g&&g._ga)||{},S=x.spec;const dt=B.t?Math.min(.1,Math.max(0,(now-B.t)/1000)):0;B.t=now;
  const w=G.w||0,run=typeof gaSS=='function'?gaSS(.3,1.4,G.Fr||0):0,m5=g&&g._m105;
  let tgt=1-w*(.45+.4*run);if((g&&(g.atk||g.ak||g._lk!=null||g.lk||g._bo))||S.anim=='fly'||(m5&&m5.M&&m5.M.wing))tgt=0; // attacks (enemy moves g.ak, companion lunges g._lk / g.lk), flight, wing abilities
  if(B.force!=null)B.f=tgt=B.force;
  B.f+=(tgt-B.f)*(1-Math.exp(-dt*(tgt<B.f?10:5)));if(Math.abs(B.f-tgt)<.002)B.f=tgt;
  const lv=Math.round(B.f*BW181.lv);if(lv!=B.W.lv){B.W.lv=lv;const geo=bw181Geo(B.W.key,B.W.d,lv);B.W.m.forEach(m=>m.geometry=geo)}
  const k=1-B.f;x.wings.forEach(wg=>{if(wg.bw)wg.p.rotation.z*=k})}
{const f=rigAnim;rigAnim=function(x,now,mv,sp){const r=f.apply(this,arguments);if(x&&x.bw181)try{bw181Anim(x,now)}catch(e){console.error('bw181',e)}return r}}
// the three birds' post() builds these wings (the harpy and the Gale Roc mount on the base Skyhawk body get them too)
{const D=LPR.Skyhawk;D.post=function(x,c,C,mat){bw181Wings(x,c,C,mat,rv137('Skyhawk',c))}}
