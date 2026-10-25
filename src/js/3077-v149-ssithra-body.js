// ================= v149 Ssith'ra's body: one creature, never through itself =================
// The v112 body was fourteen rigid armour blocks that each tried to sit on the path the head had taken. Turning around
// in place, circling the hero or a burrow chain folded that path back on itself, so the body passed through itself and
// through the head, the neck could bend 180°, and at every bend the blocks opened gaps that showed the sand behind them.
// v149 replaces the body layout (B.post) and adds to the model (B.build); the head, the poses and every move stay.
//  * The chain (ssr149Post): the path the body follows is the body itself (where every segment was last frame) plus
//    where the neck has gone since, so it still slithers along its path when it moves. Then, from the neck back:
//      - heights first (rearing, the bow-arch, the ground, burrowing), each segment at a fixed 3D distance from the one in
//        front, so a reared neck takes up body length instead of tearing away;
//      - the neck can bend at most ~60° from the head's line, every other joint ~22° from the one in front: the body
//        curves, it can never fold (a full ring needs 16+ segments; there are 14);
//      - self-avoidance: a segment that would sink into the head or into a segment two or more further forward is
//        pushed out sideways and put back at its fixed distance. When it spins in place the front of the body swings
//        round behind the head and the rest coils after it.
//    The body leans into its turns.
//  * One body (ssr149Body): a continuous flesh core runs inside the armour, from inside the skull through every segment
//    to the stinger (a tube rebuilt along a smooth curve every frame), so bends show dark sinew between the plates, never
//    a gap. It glows at the seams like the runes (brighter in Phase II). The rigid neck sleeves it replaces are gone.
//    The armour is remodelled to sit on it: each segment wears a domed dorsal shield (no longer a full barrel), narrow at
//    the front where it tucks under the shield in front and flared at the back, so the back is one shingled run of
//    plates; the flesh shows along the flanks between the shields, the side plates (moved in onto the flesh) and the
//    belly plates. One pattern all the way down (dark shield, bronze trailing rim and keel) instead of alternating
//    blocks; studs, runes, veins, trophies, rings and rags moved onto the new shield surface.
var SSR149={th0:1.05,th:.38,rs:.7,sides:12,per:3,pour:21,n:0};
// the dive plunges a little deeper and sooner, so the body can follow the head down the hole before she vanishes
SSRP.dive.head=[1.25,0,0,0,-3.3,.7];
// ---------------- the model: flesh core, consistent plates ----------------
function ssr149Body(R){const gc=SVX.gc,G=k=>gc[k];let A=null,Bm=null;
  ['s1','s0'].forEach((n,i)=>{const g=R.J[n]&&R.J[n].children.find(o=>o.isGroup);if(!g)return;const t=g.children.find(o=>o.geometry===G('s2_tg'));if(t){if(i)Bm=t.material;else A=t.material}});
  // a domed dorsal shield instead of a full barrel (the flesh shows along the flanks, between shield, side plates and
  // belly plate, all the way down), tucked narrow at the front under the shield in front and flared at the back
  const tg=svG('s9_tg',()=>svLoftZ([[.64,.58,.27,0,.46],[.32,.75,.35,0,.5],[-.12,.81,.38,0,.52],[-.5,.84,.38,0,.51],[-.74,.86,.35,0,.48]],14)),
    rim=svG('s9_rim',()=>svLoftZ([[-.58,.885,.37,0,.5],[-.82,.9,.335,0,.47]],14));
  for(let k=0;k<SSR.N;k++){const g=R.J['s'+k].children.find(o=>o.isGroup);if(!g)continue;let st=0;
    g.children.slice().forEach(o=>{if(!o.isMesh)return;const q=o.geometry,P=o.position,sx=Math.sign(P.x)||1;
      if(q===G('s2_slv')){g.remove(o);return}
      if(q===G('s2_tg')){o.geometry=tg;if(A)o.material=A;return}
      if(q===G('s2_rim')){o.geometry=rim;if(Bm)o.material=Bm;return}
      if(q===G('s2_kl')){P.y+=.08;if(Bm)o.material=Bm;return}
      if(q===G('s2_lp0.065_11')){const th=(st++-2)*.6;P.set(Math.sin(th)*.84,.51+Math.cos(th)*.38,-.6);return}
      if(q===G('s2_ru')){P.y=.93;return}
      if(q===G('s2_st')){o.scale.set(.84,.9,1);P.y+=.03;return}
      if(q===G('s2_vn1')||q===G('s2_vn-1')){P.y+=.07;return}
      if(q===G('s2_pl1')||q===G('s2_pl-1')){P.x-=sx*.14;return}
      if(q===G('s2_ss')){P.set(sx*.88,.2,P.z);return}
      if(q===G('s2_ring')){P.x=.98;return}if(q===G('s2_lnk')){P.x=.99;return}
      if(q===G('s2_cl')){P.x=sx*.84;return}
      if(q===G('s2_sock')||(q&&/^s2_lp0\.(19|12)_/.test(Object.keys(gc).find(key=>gc[key]===q)||''))){P.y-=.2;return}})}
  // the flesh core: rings along a curve through the inside of the head, the neck, every segment and the stinger
  const NS=SSR149.sides,NR=(SSR.N+2)*SSR149.per+1,pos=new Float32Array(NR*NS*3),idx=[];
  for(let r=0;r<NR-1;r++)for(let s=0;s<NS;s++){const a=r*NS+s,b=r*NS+(s+1)%NS,c=a+NS,d=b+NS;idx.push(a,c,b,b,c,d)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setIndex(idx);
  const mat=svMat(R,0x2e0f09,{roughness:.62,metalness:.12,emissive:0x2a0802,flatShading:false});
  const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=true;mesh.frustumCulled=false;mesh.userData.noMerge=1;mesh.userData.lpsSkip=1;R.root.add(mesh);
  R.v149={mesh,geo,mat,NR,NS,P:[],U:[]}}
{const B=SVB[3];if(B){const b0=B.build;B.build=function(R,e){b0.apply(this,arguments);try{ssr149Body(R)}catch(err){console.error('v149 body',err)}}}}
// the path resets with the trail (placing, surfacing after a burrow)
{const f=ssrTrail;ssrTrail=function(e,S,reset){if(reset&&S)S.c149=null;return f.apply(this,arguments)}}
// ---------------- the chain ----------------
function ssr149Post(e,S,dt,now){const R=S.R,m=e.m,N=SSR.N,DP=SSR.D,V3=THREE.Vector3;ssrTrail(e,S);
  const bur=!!(S.mv&&S.mv.D.bur);
  // (as v112) under the sand with no burrow running: surface; the head-only and emerge timers
  if(S.gone&&!bur&&!S.dieM){S.gI=(S.gI||0)+dt;if(S.mv||S.gI>.6)ssrGone(e,false)}else S.gI=0;
  if(S.hdOnly&&!bur){S.hdOnly=0;S.emT=0}
  if(!S.gone&&S.emT!=null){S.emT+=dt;if(S.emT>3)S.emT=null}
  if(S.skT!=null)S.skT+=dt;
  const h=R.J.head;h.updateMatrix();const T=SSR149.t||(SSR149.t={a:new V3(),b:new V3(),c:new V3(),d:new V3()});
  const nk=T.a.set(0,-.02,-.62).applyMatrix4(h.matrix),hb=T.b.set(0,-.02,-1.62).applyMatrix4(h.matrix).sub(nk);
  const ya=m.rotation.y,ca=Math.cos(ya),sa=Math.sin(ya),mx=m.position.x,mz=m.position.z,y0=GH(mx,mz);
  const toW=(lx,lz)=>[mx+lx*ca+lz*sa,mz-lx*sa+lz*ca];
  const nW=toW(nk.x,nk.z);let hx=hb.x*ca+hb.z*sa,hz=-hb.x*sa+hb.z*ca,hl=Math.hypot(hx,hz);if(hl<1e-3){hx=-sa;hz=-ca;hl=1}hx/=hl;hz/=hl;
  let C=S.c149;
  if(!C||Math.hypot(nW[0]-C.nk[0],nW[1]-C.nk[1])>4.5){C=S.c149={nk:nW.slice(),P:[],Y:[]};let d=0;for(let k=0;k<N;k++){d+=SSR.sp[k];C.P.push([nW[0]-sa*d,nW[1]-ca*d]);C.Y.push(SSR.y[k])}}
  const ctl=S.O.ctl||[0,0,0],arch=ctl[0],wav=ctl[1],rear=Math.max(0,nk.y-1.1);
  // 1. heights: what each segment wants, then a fixed 3D distance from the one in front (the rest is horizontal spacing)
  // diving: once the neck is under the sand, the body slides along its path into the hole the head made and goes straight
  // down it (SSR149.pour segments a second, all of it under before v112's moment of vanishing); segments already in the
  // hole stay below the one in front, so the body bends down over the rim of the hole and never sinks in place or folds
  const nU=nk.y-(GH(nW[0],nW[1])-y0)<-.15;if(S.skT==null)C.pt=0;else if(nU||C.pt)C.pt=(C.pt||0)+dt;
  // rearing: the raised part of the body is one smooth curve, steep under the neck and landing flat, over more segments
  // the higher it rears (a cobra, not a post on a plank)
  const nL=Math.min(N-3,Math.max(2,rear/.42));
  const pour=C.pt?C.pt*SSR149.pour*SSR.L:0,dep=[],hs=[],Y=[],tin=[],G=[];let py=nk.y,cs=0;
  for(let k=0;k<N;k++){cs+=SSR.sp[k];const w=C.P[k],gk=GH(w[0],w[1])-y0,ru=(k+1)/(nL+1),u=Math.min(1,Math.max(0,(k-1)/9));
    let dp=S.hdOnly?DP:0;if(S.emT!=null)dp=Math.max(dp,DP*ssrSS((k+1-S.emT*14)/2.5));
    const inH=pour>cs-.3&&(!k||tin[k-1]);tin.push(inH);if(inH)dp=Math.max(dp,DP*1.6);dep.push(dp);
    G.push(gk);let y=SSR.y[k]+.06*Math.sin(now/300-k*.6)+(ru<1?rear*(1-ru)*(1-ru):0)+arch*Math.sin(Math.PI*u)+gk-dp;const fl=gk+.45*SSR.sc[k];if(dp<.05&&y<fl)y=fl;
    if(inH)y=Math.min(y,py);
    const sp=SSR.sp[k],dy=Math.max(-.95*sp,Math.min(.95*sp,y-py));y=py+dy;Y.push(y);hs.push(Math.sqrt(sp*sp-dy*dy));py=y}
  // 2. wishes: walk the path (the neck now → the neck last frame → the body last frame → on past the tail)
  const Q=[nW,C.nk].concat(C.P),tl=C.P[N-1],tp=C.P[N-2];{const dx=tl[0]-tp[0],dz=tl[1]-tp[1],l=Math.hypot(dx,dz)||1;Q.push([tl[0]+dx/l*60,tl[1]+dz/l*60])}
  const WA=[];{let a=0,sh=0;for(let k=0;k<N;k++){a+=hs[k];if(tin[k])sh=a;WA.push(Math.max(.02*(k+1),a-sh))}}
  const W=[];{let acc=0,seg=0;for(let i=1;i<Q.length&&seg<N;i++){const a=Q[i-1],b=Q[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);
    while(seg<N&&acc+l>=WA[seg]){const q=l>1e-6?(WA[seg]-acc)/l:0;W.push([a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q]);seg++}acc+=l}
    while(W.length<N){const L=W.length?W[W.length-1]:nW;W.push([L[0]-sa*SSR.L,L[1]-ca*SSR.L])}}
  // the head as two spheres (world) for self-avoidance
  const HS=[[0,.25,.15,.9],[0,-.05,1.0,.58]].map(q=>{const p=T.c.set(q[0],q[1],q[2]).applyMatrix4(h.matrix),w=toW(p.x,p.z);return [w[0],p.y,w[1],q[3]]});
  // 3. the chain from the neck back: bend limits, self-avoidance, fixed spacing
  const P=[];let px=nW[0],pz=nW[1],dx0=hx,dz0=hz,turn=0;
  for(let k=0;k<N;k++){let wx=W[k][0],wz=W[k][1];
    if(wav){const lx=-dz0,lz=dx0,o=wav*Math.sin(k*.85-now/140)*Math.min(1,k/2)*.35;wx+=lx*o;wz+=lz*o}
    let dx=wx-px,dz=wz-pz,l=Math.hypot(dx,dz);if(l<1e-4){dx=dx0;dz=dz0;l=1}dx/=l;dz/=l;
    const th=k?SSR149.th:SSR149.th0,cr=dx0*dz-dz0*dx,dt0=dx0*dx+dz0*dz,an=Math.atan2(cr,dt0);
    if(Math.abs(an)>th){const a=Math.sign(an)*th,c=Math.cos(a),s=Math.sin(a);dx=dx0*c-dz0*s;dz=dx0*s+dz0*c}
    let x=px+dx*hs[k],z=pz+dz*hs[k];const rk=SSR149.rs*SSR.sc[k],yk=Y[k];
    const under=j=>Y[j]-G[j]<-SSR149.rs*SSR.sc[j]*1.3;
    if(!under(k))for(let it=0;it<2;it++){let moved=0;
      const push=(ox,oy,oz,ro)=>{const ddx=x-ox,ddz=z-oz,ddy=yk-oy,d3=Math.hypot(ddx,ddy,ddz),o=ro+rk-d3;if(o<=0)return;let hx2=ddx,hz2=ddz,hl2=Math.hypot(hx2,hz2);
        if(hl2<1e-3){hx2=-dz;hz2=dx;hl2=1}const need=Math.sqrt(Math.max(0,(ro+rk)*(ro+rk)-ddy*ddy))-hl2;if(need>0){x+=hx2/hl2*need;z+=hz2/hl2*need;moved=1}};
      if(k>0)for(const q of HS)push(q[0],q[1],q[2],q[3]);
      for(let j=0;j<k-1;j++)if(!under(j))push(P[j][0],Y[j],P[j][1],SSR149.rs*SSR.sc[j]);
      if(!moved)break;const ex=x-px,ez=z-pz,el=Math.hypot(ex,ez)||1;x=px+ex/el*hs[k];z=pz+ez/el*hs[k]}
    const ndx=x-px,ndz=z-pz,nl=Math.hypot(ndx,ndz)||1;const ux=ndx/nl,uz=ndz/nl;if(k)turn=dx0*uz-dz0*ux;P.push([x,z,turn]);dx0=ux;dz0=uz;px=x;pz=z}
  C.nk=nW.slice();C.P=P.map(p=>[p[0],p[1]]);
  // 4. the joints (local to the boss), facing the one in front, leaning into the turn
  let lx=nk.x,ly=nk.y,lz=nk.z;
  for(let k=0;k<N;k++){const J=R.J['s'+k],w=P[k],ddx=w[0]-mx,ddz=w[1]-mz,x=ddx*ca-ddz*sa,z=ddx*sa+ddz*ca,y=Y[k],gk=GH(w[0],w[1])-y0;
    J.position.set(x,y,z);const fx=lx-x,fy=ly-y,fz=lz-z;J.rotation.set(-Math.atan2(fy,Math.hypot(fx,fz)),Math.atan2(fx,fz),Math.sin(now/400-k*.5)*.05+Math.max(-.35,Math.min(.35,(w[2]||0)*1.4)));
    J.visible=y-gk>-2.4;lx=x;ly=y;lz=z}
  try{ssr149Core(e,S,now)}catch(err){if(!SSR149.n++)console.error('v149 core',err)}
  // (as v112) the forge glow of the seams and maw
  const on=S.ph>1,gl=on?.55+.45*Math.sin(now/150):0;R.seam.color.setHex(on?0xff7a20:0x7a2408);if(on)R.seam.color.multiplyScalar(.5+.5*gl);
  R.maw.color.setHex(on?0xffa040:0xff5a14);
  m.visible=!S.gone&&m.visible}
// the flesh core along a smooth curve through the head, the neck, the segments and the stinger
function ssr149Core(e,S,now){const R=S.R,B=R.v149;if(!B)return;const V3=THREE.Vector3,h=R.J.head,N=SSR.N;
  const pts=B.P,rad=B.U;pts.length=0;rad.length=0;
  pts.push(new V3(0,.08,-.15).applyMatrix4(h.matrix),new V3(0,-.02,-.75).applyMatrix4(h.matrix));rad.push([.5,.46],[.56,.48]);
  for(let k=0;k<N;k++){const J=R.J['s'+k],s=SSR.sc[k],p=J.position.clone();const up=new V3(0,1,0).applyEuler(J.rotation);p.addScaledVector(up,.06*s);pts.push(p);rad.push([.6*s,.5*s])}
  {const J=R.J['s'+(N-1)],s=SSR.sc[N-1],f=new V3(0,0,-1).applyEuler(J.rotation);pts.push(J.position.clone().addScaledVector(f,.85*s));rad.push([.16,.14])}
  const cv=new THREE.CatmullRomCurve3(pts,false,'centripetal'),NR=B.NR,NS=B.NS,pa=B.geo.attributes.position.array,L=pts.length-1;
  const on=S.ph>1,pr=on?.5+.5*Math.sin(now/150):.35+.15*Math.sin(now/600);
  let U=new V3(0,1,0);const Tg=new V3(),X=new V3(),Y=new V3(),c=new V3(),up=new V3(0,1,0);
  for(let r=0;r<NR;r++){const t=r/(NR-1);cv.getPoint(t,c);cv.getTangent(t,Tg);
    const f=t*L,i0=Math.min(L-1,Math.floor(f)),q=f-i0,rx=rad[i0][0]+(rad[i0+1][0]-rad[i0][0])*q,ry=rad[i0][1]+(rad[i0+1][1]-rad[i0][1])*q;
    // up: world up where the core lies flat, carried along (no flips) where it stands up
    const w=up.clone().addScaledVector(Tg,-up.dot(Tg)),wl=w.length();U.addScaledVector(Tg,-U.dot(Tg));if(U.lengthSq()<1e-6)U.copy(w);U.normalize();
    if(wl>.2)U.lerp(w.multiplyScalar(1/wl),Math.min(1,wl*wl)).normalize();X.crossVectors(U,Tg).normalize();Y.crossVectors(Tg,X).normalize();
    for(let s=0;s<NS;s++){const a=s/NS*Math.PI*2,cx=Math.cos(a)*rx,cy=Math.sin(a)*ry,j=(r*NS+s)*3;pa[j]=c.x+X.x*cx+Y.x*cy;pa[j+1]=c.y+X.y*cx+Y.y*cy;pa[j+2]=c.z+X.z*cx+Y.z*cy}}
  B.geo.attributes.position.needsUpdate=true;B.geo.computeVertexNormals();
  // the core smoulders at the seams like the runes; brighter, pulsing with the forge in Phase II (the hit flash still wins)
  const E=SSR149.ec||(SSR149.ec=new THREE.Color());E.setHex(on?0xff5a10:0x5a1404).multiplyScalar(on?.25+.35*pr:.35+.2*pr);B.mat.userData.e0=E.getHex();if(!S.fl)B.mat.emissive.copy(E)}
{const B=SVB[3];if(B){const p146=B.post;
  // v146's post ran the v112 layout, then sprinkled sand from the seams: keep the sand, use the v149 layout
  B.post=function(e,S,dt,now){ssr149Post(e,S,dt,now);try{if(!S.gone&&Math.random()<dt*7){const k=(Math.random()*SSR.N)|0,p=svWP(e,'s'+k,(Math.random()-.5)*.8,.2,0);burst(p,SSR146.sand,1,.4,.3,.8)}}catch(_){}};
  B.post149=p146}}
