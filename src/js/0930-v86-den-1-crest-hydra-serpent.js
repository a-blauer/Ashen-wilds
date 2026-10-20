// ================= v86 den 1 — The Crest Hydra: THE SERPENT MERE =================
// A half-flooded ruined serpent temple on Hillside Crest: a shallow mere over a sunken mosaic floor, raised stepping stones,
// a broken colonnade with serpent reliefs, serpent idols at the gate and four serpent-fire braziers.
// Mechanics (on top of the Hydra's spit/tongue/beam/mines/spores and its Cataclysm):
//  1. Brood Necks — serpent heads burst from the water (red circle first). They bite along a red line when you are close and
//     lob venom (red circle + pool) when you are far. Each has its own health. SEVER one and the Hydra takes a wound — but the
//     stump regrows as TWO heads (shrinking green ring = time left) unless you SEAR it: touch a brazier to pick up
//     Serpent-fire, then touch the stump. While 3+ necks live the Hydra is Brood-guarded (takes 35% less damage).
//     More necks are kept up in later phases and stumps regrow faster.
//  2. Tidal Surge (BMV 'tide') — the Hydra rears and the stones glow blue; a wall of water rolls out from it. Stand on a raised
//     stone or dash through the crest, or be swept away. Phase II+: two surges back to back.
// Uses the d01* helpers from zzK_den0.js.
var HY={necks:[],slots:[],stones:[],braz:[],q:[],waves:[],fire:0,clk:0,ph:1,nt:3,lastAtk:0,glow:0,gk:0,wl:0,gen:0,guard:false,byp:0,A:null,
  v:new THREE.Vector3(),o:new THREE.Vector3(),d:new THREE.Vector3()};
const HY_NS=1.35,HY_STONE=[0xb8b09a,0xa8a08a,0xc4bca4,0x9a937e],HY_MOSS=[0x6a8a3a,0x5a7a34,0x7a9a44],HY_COL=0x7ac850;
function hyMat(k){if(D01.m[k])return D01.m[k];let m;
  if(k=='mere')m=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.1,metalness:.3,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide});
  else if(k=='curtain')m=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.1,metalness:.2,transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide});
  m.userData.lps=1;return D01.m[k]=m}
function hyColumn(S,G,x,z,h,R,broken){const y=GH(x,z),st=HY_STONE[(R()*4)|0];
  S.geo(ARKG.box,arkM4(x,y+.15,z,1.4,.3,1.4,0,R()*.2),arkShade(st,.8));S.geo(d01Cyl(.5,.56,8),arkM4(x,y+.3+h/2,z,1,h,1),st);
  // a serpent relief winding up the shaft
  const n=Math.floor(h*4);for(let i=0;i<n;i++){const t=i/n,a=t*9.5,yy=y+.45+t*(h-.3);S.geo(ARKG.box,arkM4(x+Math.cos(a)*.55,yy,z+Math.sin(a)*.55,.16,.22,.16,0,-a),i==n-1?0x5a8a4a:arkMix(st,0x4a7a40,.45))}
  if(!broken){S.geo(ARKG.box,arkM4(x,y+.3+h+.15,z,1.3,.3,1.3),arkShade(st,1.08));S.geo(ARKG.box,arkM4(x,y+.3+h+.38,z,1.0,.18,1.0),arkShade(st,.9))}
  else{for(let k=0;k<3;k++)S.geo(ARKG.cone4,arkM4(x+(R()-.5)*.5,y+.3+h+.1,z+(R()-.5)*.5,.25,.35+R()*.3,.25,0,R()*6),st);
    // fallen drums beside it
    for(let k=0;k<2;k++){const a=R()*6.283,d=1.4+k*1.2,fx=x+Math.cos(a)*d,fz=z+Math.sin(a)*d;S.geo(d01Cyl(.5,.5,8),arkM4(fx,GH(fx,fz)+.42,fz,1,.95,1,Math.PI/2,a,0),arkShade(st,.9+R()*.2))}}
  if(R()<.6)S.geo(ARK.rock[(R()*4)|0],arkM4(x,y+.1,z,1.0,.25,1.0),HY_MOSS[0])}
function hyIdol(S,G,x,z,yaw){const y=GH(x,z),st=0x9a947e,fx=Math.sin(yaw),fz=Math.cos(yaw);
  S.geo(ARKG.box,arkM4(x,y+.6,z,1.6,1.2,1.6,0,yaw),arkShade(st,.85));S.geo(ARKG.box,arkM4(x,y+1.25,z,1.8,.15,1.8,0,yaw),arkShade(st,.7));
  const P=d01Bez([x-fx*.3,y+1.2,z-fz*.3],[x-fx*.6,y+3.4,z-fz*.6],[x+fx*.7,y+4.1,z+fz*.7],6);d01Tube(S,P,.5,.34,t=>t>.5?arkShade(st,1.05):st,8);
  for(let i=0;i<5;i++){const p=P[i+1];S.geo(ARKG.cone4,arkM4(p[0]-fx*.35,p[1]+.25,p[2]-fz*.35,.12,.5,.12,-.6*fz,0,.6*fx),0x6a6452)}
  const h=P[6],hx=h[0]+fx*.35,hz=h[2]+fz*.35,hy=h[1]+.05;
  S.geo(ARKG.box,arkM4(hx,hy+.1,hz,.8,.45,1.1,0,yaw),st);S.geo(ARKG.cone4,arkM4(hx+fx*.75,hy+.12,hz+fz*.75,.38,.7,.2,Math.PI/2,yaw,Math.PI/4),arkShade(st,.95));
  S.geo(ARKG.box,arkM4(hx+fx*.35,hy-.35,hz+fz*.35,.62,.12,.8,.35,yaw),arkShade(st,.8));
  [-1,1].forEach(s=>{const sx=Math.cos(yaw)*s,sz=-Math.sin(yaw)*s;G.geo(ARKG.box,arkM4(hx+sx*.36+fx*.2,hy+.22,hz+sz*.36+fz*.2,.08,.1,.18,0,yaw),0x9aff5a);
    S.geo(ARKG.cone4,arkM4(hx+sx*.3-fx*.35,hy+.45,hz+sz*.3-fz*.35,.1,.6,.1,-.9*fz,0,.9*fx),0xd0c4a0);
    S.geo(ARKG.cone4,arkM4(hx+sx*.2+fx*.75,hy-.12,hz+sz*.2+fz*.75,.05,.25,.05,Math.PI),0xf0eadc)})}
function hyBuild(A){
  const R=ARK.rng(9200),cx=A.cx,cz=A.cz,y0=GH(cx,cz),ent=d01Ent(A),gap=(a,w)=>Math.abs(d01Ad(a,ent))<(w||.5),P=(a,r)=>[cx+Math.cos(a)*r,cz+Math.sin(a)*r],
    P3=(a,r,y)=>{const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;return [x,y==null?GH(x,z):y,z]};
  HY.A=A;HY.ent=ent;const WL=y0+.17;HY.wy=WL;
  const F=arkSoup(9201),Wt=arkSoup(9202),G=arkSoup(9203),S=arkSoup(9204),SG=arkSoup(9205);
  // --- the mere bed: a mosaic dais, then broken flagstones, then silt and pebbles, rising to a muddy bank ---
  const RS=[0,1.2,2.4,3.6,4.8,6,7.3,8.6,9.9,11.2,12.5,13.6,14.6,15.5,16.6],N=44,vt=RS.map((r,i)=>[...Array(N)].map((_,k)=>{
    const a=(k+.5*(i%2))/N*6.283+(i>4?(R()-.5)*.06:0),rr=r+(i>4&&i<RS.length-1?(R()-.5)*.5:0),x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr;
    const y=r<14.4?GH(x,z)+.02:r<15.6?GH(x,z)+.12:GH(x,z)-.12;return [x,y,z]}));
  for(let i=0;i<RS.length-1;i++)for(let k=0;k<N;k++){const a=vt[i][k],b=vt[i][(k+1)%N],c=vt[i+1][(k+1)%N],d=vt[i+1][k],r=RS[i];
    let col=r<4.8?((k+i)%2?0x3a7a5a:0x2e6a4e):r<8.6?HY_STONE[(k*3+i)%4]:r<14.4?[0x6a6a4a,0x5e6246,0x72705a,0x585c40][(R()*4)|0]:r<15.5?0x5a5232:HY_MOSS[(R()*3)|0];
    if(r>=4.8&&r<8.6&&R()<.2)col=0x4a5a3a;F.tri(a,b,c,col);F.tri(a,c,d,arkShade(col,.9+R()*.15))}
  // a coiled serpent inlaid in gold on the dais
  for(let i=0;i<70;i++){const t=i/70,a=t*11+.3,r=.4+t*4.1,[x,z]=P(a,r),s=.16+.12*Math.sin(t*Math.PI);G.geo(ARKG.box,arkM4(x,y0+.05,z,s*2.2,.02,s*1.4,0,-a),i>66?0x8affa0:i%2?0xc8b060:0xa89040)}
  // pebbles and sunken rubble
  for(let k=0;k<60;k++){const a=R()*6.283,r=5+R()*9.3,[x,z]=P(a,r),s=.1+R()*.3;F.geo(ARK.rock[k%4],arkM4(x,GH(x,z)+.04,z,s,s*.5,s,0,R()*6),arkShade(HY_STONE[k%4],.65+R()*.2))}
  // --- the water surface: one sheet over the whole floor, ragged at the bank ---
  {const WR=[0,2.5,5,7.5,10,12.5,14.2,15.1],WN=40;const wv=WR.map((r,i)=>[...Array(WN)].map((_,k)=>{const a=(k+.5*(i%2))/WN*6.283,rr=r+(i==WR.length-1?(R()-.5)*.8:0),x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr;return [x,WL,z]}));
    for(let i=0;i<WR.length-1;i++)for(let k=0;k<WN;k++){const a=wv[i][k],b=wv[i][(k+1)%WN],c=wv[i+1][(k+1)%WN],d=wv[i+1][k],col=[0x2e7a74,0x347e78,0x28706c,0x3a8a80][(R()*4)|0];
      Wt.tri(a,b,c,i>=WR.length-2?arkMix(col,0x9ad8c8,.3):col,.15);Wt.tri(a,c,d,arkShade(col,.95),.15)}}
  // --- raised stepping stones (safe from the surge) ---
  for(let k=0;k<5;k++){const a=ent+.95+k/4*(6.283-1.9),[x,z]=P(a,8.4);HY.stones.push([x,z,1.3])}
  [ent+Math.PI/2,ent-Math.PI/2].forEach(a=>{const [x,z]=P(a,4.9);HY.stones.push([x,z,1.2])});
  HY.stones.forEach(([x,z,r],k)=>{const y=GH(x,z),top=y+.34;S.geo(d01Cyl(r,r*1.12,6),arkM4(x,y+.1-.25,z,1,top-y+.5,1,0,k),arkShade(HY_STONE[k%4],.85));
    S.geo(d01Cyl(r*.98,r,6),arkM4(x,top-.03,z,1,.08,1,0,k),(cy,n)=>n.y>.5?HY_STONE[(k+1)%4]:arkShade(HY_STONE[k%4],.75));
    for(let j=0;j<6;j++){const a=j/6*6.283+k;S.geo(ARKG.box,arkM4(x+Math.cos(a)*r*.62,top+.02,z+Math.sin(a)*r*.62,.32,.03,.08,0,-a),0x6a8a3a)}
    S.geo(ARKG.box,arkM4(x,top+.025,z,.5,.03,.5,0,k+.4),0x5a8a4a);
    for(let j=0;j<6;j++){const a=j/6*6.283+k,b=(j+1)/6*6.283+k;SG.quad([x+Math.cos(a)*r*1.02,top+.06,z+Math.sin(a)*r*1.02],[x+Math.cos(b)*r*1.02,top+.06,z+Math.sin(b)*r*1.02],[x+Math.cos(b)*r*.8,top+.06,z+Math.sin(b)*r*.8],[x+Math.cos(a)*r*.8,top+.06,z+Math.sin(a)*r*.8],0x9ae8ff,.05)}});
  // --- the temple rim: a broken curb, the colonnade, idols at the gate, an arch behind the Hydra ---
  for(let k=0;k<54;k++){const a=k/54*6.283;if(gap(a,.42)||R()<.12)continue;const a1=a+6.283/54*.9,r=15.1,yb=GH(...P(a,r)),tl=(R()-.5)*.25;
    const pts=[P(a,r-.3),P(a1,r-.3),P(a1,r+.35),P(a,r+.35)],yt=pts.map(()=>yb+.42+tl+R()*.05);S.slab(pts,yt,yb-.3,HY_STONE[k%4],arkShade(HY_STONE[k%4],.7))}
  for(let k=0;k<12;k++){const a=ent+.7+k/11*(6.283-1.4),[x,z]=P(a+(R()-.5)*.05,16.4+R()*.5);if(Math.abs(d01Ad(a,ent+Math.PI))<.32)continue;const br=R()<.45;hyColumn(S,G,x,z,br?1.2+R()*1.6:3.8+R()*1.4,R,br)}
  {const a=ent+Math.PI,[x1,z1]=P(a-.24,17),[x2,z2]=P(a+.24,17);hyColumn(S,G,x1,z1,6,R,false);hyColumn(S,G,x2,z2,6,R,false);
    const yy=y0+6.9,yaw=Math.atan2(x2-x1,z2-z1),mx=(x1+x2)/2,mz=(z1+z2)/2,L=Math.hypot(x2-x1,z2-z1);
    S.geo(ARKG.box,arkM4(mx,yy,mz,1.1,.7,L+1.4,0,yaw),HY_STONE[2]);S.geo(ARKG.box,arkM4(mx,yy+.5,mz,.9,.3,L+.6,0,yaw),HY_STONE[1]);
    for(let i=0;i<9;i++){const t=i/8-.5,px=mx+Math.sin(yaw)*t*L,pz=mz+Math.cos(yaw)*t*L;S.geo(ARKG.box,arkM4(px-Math.cos(yaw)*.56,yy+Math.sin(i*1.4)*.15,pz+Math.sin(yaw)*.56,.06,.2,.5,0,yaw+i),0x4a7a40)}
    const [ix,iz]=P(a,18.6);hyIdol(S,G,ix,iz,Math.atan2(cx-ix,cz-iz))}
  [-1,1].forEach(s=>{const a=ent+s*.6,[x,z]=P(a,15.9);hyIdol(S,G,x,z,Math.atan2(cx-x,cz-z)-s*.35)});
  // reeds at the bank, lily pads on the water, wind-bent grass outside
  for(let k=0;k<40;k++){const a=R()*6.283;if(gap(a,.5))continue;const [x,z]=P(a,13.6+R()*1.3);if(HY.stones.some(p=>Math.hypot(p[0]-x,p[1]-z)<2))continue;
    for(let j=0;j<5;j++){const rx=x+(R()-.5)*.6,rz=z+(R()-.5)*.6,h=.8+R()*1.1;S.geo(ARKG.cone4,arkM4(rx,GH(rx,rz)+h/2,rz,.04,h,.04,(R()-.5)*.3,0,(R()-.5)*.3),R()<.5?0x8aa050:0x6a8a3a);
      if(R()<.3)S.geo(ARKG.cyl5,arkM4(rx,GH(rx,rz)+h*.8,rz,.06,.25,.06),0x5a3a1a)}}
  for(let k=0;k<26;k++){const a=R()*6.283,[x,z]=P(a,4+R()*9.5);if(HY.stones.some(p=>Math.hypot(p[0]-x,p[1]-z)<1.8))continue;const s=.3+R()*.3;
    S.geo(ARKG.cyl6,arkM4(x,WL+.02,z,s,.02,s,0,R()*6),R()<.5?0x4a8a3a:0x5a9a40);if(R()<.3)G.geo(ARKG.cone5,arkM4(x+.1,WL+.1,z,.1,.12,.1),R()<.5?0xfff0f0:0xffd0e0)}
  for(let k=0;k<70;k++){const a=R()*6.283,[x,z]=P(a,15.6+R()*3);if(gap(a,.45)&&Math.hypot(x-cx,z-cz)<17.5)continue;const y=GH(x,z);
    for(let j=0;j<3;j++){const h=.4+R()*.5;S.geo(ARKG.cone4,arkM4(x+(R()-.5)*.5,y+h/2,z+(R()-.5)*.5,.06,h,.06,.35,0,.2),HY_MOSS[(R()*3)|0])}}
  // tattered serpent pennants on poles
  for(let k=0;k<4;k++){const a=ent+1.2+k*1.3,[x,z]=P(a,15.4),y=GH(x,z),c=k%2?0x3a7a3a:0xb8a040;S.geo(ARKG.cyl5,arkM4(x,y+2.2,z,.07,4.4,.07),0x4a3424);
    const ta=-a+1.57,ca=Math.cos(ta),sa=Math.sin(ta),Q=(u,v)=>[x+u*ca*.5+u*u*.1,y+v,z-u*sa*.5];S.quad(Q(0,4.3),Q(1.6,4.2),Q(1.5,3.2),Q(0,3.3),c,.1);S.tri(Q(0,3.3),Q(1.5,3.2),Q(.6,2.5),arkShade(c,.85))}
  // --- serpent-fire braziers (touch one to carry the fire) ---
  [ent+1.3,ent-1.3,ent+Math.PI-.8,ent+Math.PI+.8].forEach((a,k)=>{const [x,z]=P(a,12.4),y=GH(x,z);
    S.geo(d01Cyl(.55,.7,6),arkM4(x,y+.35,z,1,.8,1,0,k),HY_STONE[1]);S.geo(d01Cyl(.4,.5,6),arkM4(x,y+.85,z,1,.2,1),HY_STONE[2]);
    S.geo(d01Cyl(.62,.3,8),arkM4(x,y+1.15,z,1,.4,1),0x8a6a2a);S.geo(d01Cyl(.66,.62,8),arkM4(x,y+1.37,z,1,.06,1),0xb8903a);
    [-1,1].forEach(s=>{const ox=Math.cos(a+1.57*s)*.66,oz=Math.sin(a+1.57*s)*.66;S.geo(ARKG.cone4,arkM4(x+ox,y+1.35,z+oz,.1,.35,.1,0,0,s*.6),0xb8903a)});
    const fg=new THREE.Group();fg.position.set(x,y+1.45,z);const o=new THREE.Mesh(ARKG.cone5,new THREE.MeshBasicMaterial({color:0x9aff5a}));o.scale.set(.42,.9,.42);o.position.y=.4;
    const ic=new THREE.Mesh(ARKG.cone4,new THREE.MeshBasicMaterial({color:0xf8ffb0}));ic.scale.set(.25,.6,.25);ic.position.y=.28;const sp=kqSpr(0x9aff5a,2.2);sp.position.y=.5;fg.add(o,ic,sp);
    fg.traverse(q=>{if(q.material)q.material.userData.lps=1});A.g.add(fg);HY.braz.push({x,z,fg,o,ic});denBlock(x,z)});
  // --- neck slots, the brood necks (a pool of six, sharing geometry) ---
  for(let k=0;k<9;k++){const a=ent+.62+k/8*(6.283-1.24),[x,z]=P(a,10.9);if(HY.stones.some(p=>Math.hypot(p[0]-x,p[1]-z)<2.4)||HY.braz.some(b=>Math.hypot(b.x-x,b.z-z)<2.2))continue;HY.slots.push([x,z])}
  for(let k=0;k<4;k++){const a=ent+Math.PI/4+k*Math.PI/2,[x,z]=P(a,6.4);if(HY.stones.some(p=>Math.hypot(p[0]-x,p[1]-z)<2.4))continue;HY.slots.push([x,z])}
  {const B=arkSoup(9206),E=arkSoup(9207),T=arkSoup(9208),sc=[0x3e6a3a,0x4e7a40,0x456e3a],P0=d01Bez([0,-.4,0],[0,2,-.4],[0,3.0,.45],8);
    d01Tube(B,P0,.46,.27,t=>sc[(t*8|0)%3],8);
    for(let i=1;i<8;i++){const p=P0[i];B.geo(ARKG.box,arkM4(p[0],p[1],p[2]+.3-.03*i,.34-.02*i,.1,.12,.2),0xc8b88a)}           // pale belly scutes
    for(let i=1;i<7;i++){const p=P0[i];B.geo(ARKG.cone4,arkM4(p[0],p[1]+.05,p[2]-.4+.03*i,.06,.32,.06,-.7,0,0),0xd0c4a0)}      // back fin spines
    const hx=0,hy=3.12,hz=.75;B.geo(ARKG.box,arkM4(hx,hy+.05,hz,.62,.4,.8),0x4e7a40);B.geo(ARKG.box,arkM4(hx,hy+.24,hz-.05,.5,.08,.7),0x2e4e2a);
    B.geo(ARKG.cone4,arkM4(hx,hy+.06,hz+.72,.3,.68,.16,Math.PI/2,0,Math.PI/4),0x5a8a48);B.geo(ARKG.box,arkM4(hx,hy-.24,hz+.35,.46,.12,.82,.32,0,0),0xb8a878);
    B.geo(ARKG.box,arkM4(hx,hy-.12,hz+.45,.4,.06,.6,.15,0,0),0x6a1018);
    [-1,1].forEach(s=>{B.geo(ARKG.cone4,arkM4(hx+s*.16,hy-.18,hz+.85,.04,.2,.04,Math.PI),0xf0eadc);B.geo(ARKG.cone4,arkM4(hx+s*.2,hy-.04,hz+.62,.035,.16,.035,Math.PI),0xf0eadc);
      B.geo(ARKG.cone4,arkM4(hx+s*.24,hy+.3,hz-.25,.07,.55,.07,-1.0,0,s*.35),0xd0c4a0);B.geo(ARKG.cone4,arkM4(hx+s*.32,hy+.12,hz-.2,.05,.4,.05,-1.2,0,s*.7),0xb8ac88);
      E.geo(ARKG.box,arkM4(hx+s*.3,hy+.14,hz+.25,.06,.09,.16,0,s*.3,0),0xffc020)});
    B.geo(ARKG.cone4,arkM4(hx,hy+.38,hz-.2,.08,.6,.08,-1.0),0xd0c4a0);
    const Pst=d01Bez([0,-.4,0],[0,.4,-.05],[0,.95,.05],3);d01Tube(T,Pst,.5,.42,t=>sc[(t*3|0)%3],8);T.geo(d01Cyl(.42,.42,8),arkM4(0,.97,.05,1,.06,1),0x8a1a1a);T.geo(d01Cyl(.24,.24,6),arkM4(0,1.0,.05,1,.03,1),0xc8b88a);
    for(let j=0;j<5;j++){const a=j*1.26;T.geo(ARKG.cone4,arkM4(Math.cos(a)*.35,1.0,.05+Math.sin(a)*.35,.08,.2,.08,Math.sin(a)*.6,0,-Math.cos(a)*.6),0x6a1018)}
    const gB=B.mesh().geometry,gE=E.mesh().geometry,gT=T.mesh().geometry,gR=new THREE.RingGeometry(.9,1.08,28);gR.rotateX(-Math.PI/2);
    for(let k=0;k<6;k++){const g=new THREE.Group(),piv=new THREE.Group();g.add(piv);const neck=new THREE.Mesh(gB,d01Mat('std')),eyes=new THREE.Mesh(gE,d01Mat('glow')),stump=new THREE.Mesh(gT,d01Mat('std'));
      neck.castShadow=true;piv.add(neck,eyes);g.add(stump);const rg=new THREE.Mesh(gR,d01Add(0x9aff5a,.7));rg.renderOrder=17;rg.position.y=(WL-y0+.04)/HY_NS;g.add(rg);g.visible=false;g.scale.setScalar(HY_NS);A.g.add(g);
      HY.necks.push({i:k,g,piv,neck,eyes,stump,rg,hb:d01Bar(HY_COL),st:'off',slot:-1,x:0,z:0,hp:1,hpM:1,t:0,T0:1,cd:2,atk:null,yaw:0,hit:0,p:new THREE.Vector3(),warn:0})}}
  // --- tidal surge walls and the brood-guard shell ---
  {// a curling wall of water: lathe profile (radius, height) — a sloped back, a tall face and a foaming lip that leans outward
    const pr=[[.93,0],[.96,.45],[.985,.85],[1.0,1.0],[1.02,1.08],[1.035,.98],[1.02,.6],[1.01,0]].map(q=>new THREE.Vector2(q[0],q[1])),g=new THREE.LatheGeometry(pr,56).toNonIndexed(),P=g.attributes.position,C=[];
    for(let i=0;i<P.count;i++){const y=P.getY(i),c=new THREE.Color(0x3a9a94).lerp(new THREE.Color(0xf0fffc),Math.min(1,Math.max(0,(y-.55)/.45)));C.push(c.r,c.g,c.b)}g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
    for(let k=0;k<2;k++){const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide}));
    m.material.userData.lps=1;m.visible=false;m.renderOrder=16;m.frustumCulled=false;A.g.add(m);HY.waves.push({ms:m,on:false,r:0,hit:false,safe:false})}}
  HY.shell=new THREE.Mesh(D01.sph,d01Add(0x9aff5a,.12));HY.shell.renderOrder=15;HY.shell.visible=false;A.g.add(HY.shell);
  HY.fl=kqSpr(0x9aff5a,1.1);HY.fl.visible=false;A.g.add(HY.fl);
  // --- the seal: the mere rises into a curtain of falling water across the gate ---
  {const C=arkSoup(9209);for(let k=0;k<13;k++){const a=ent-.42+k/12*.84,[x,z]=P(a,15.1+(k%2)*.35),h=3+R()*.9,r=.3+R()*.16;
      C.geo(d01Cyl(r*.7,r,7),arkM4(x,y0+h/2-.3,z,1,h,1,0,R()*6),(cy,n)=>cy>y0+h-.9?0xd8f4f0:[0x5ab8b0,0x4aa8a4,0x6ac8c0][k%3]);C.geo(D01.sph,arkM4(x,y0+h-.3,z,r*.9,r*.35,r*.9),0xe8fffa)}
    const m=C.mesh(hyMat('curtain'));m.castShadow=false;m.scale.y=.02;m.visible=false;A.g.add(m);HY.seal=m}
  // static meshes
  const fm=F.mesh(d01Mat('std'));fm.castShadow=false;const wm=Wt.mesh(hyMat('mere'));wm.castShadow=false;wm.receiveShadow=false;wm.renderOrder=2;HY.water=wm;
  const gm=G.mesh(d01Mat('glow'));gm.castShadow=false;const sg=SG.mesh(d01Add(0x9ae8ff,0));sg.material.vertexColors=true;sg.castShadow=false;sg.renderOrder=17;sg.visible=false;HY.sg=sg;
  A.g.add(fm,wm,gm,S.mesh(d01Mat('std')),sg);
  // idle: flames flicker and the mere breathes
  TANIM.push({x:cx,z:cz,f:now=>{HY.braz.forEach((b,i)=>{b.o.scale.y=.9*(1+.18*Math.sin(now/80+i*2));b.ic.scale.y=.6*(1+.25*Math.sin(now/60+i));b.o.rotation.y=now/400+i});
    wm.position.y=Math.sin(now/1300)*.025+HY.wl}});
}
function hyFreeNeck(){return HY.necks.find(N=>N.st=='off')}
function hySlotFree(s){return !HY.necks.some(N=>N.st!='off'&&N.slot===s)}
function hyLive(){let n=0;for(const N of HY.necks)if(N.st=='bub'||N.st=='rise'||N.st=='up')n++;return n}
function hyStumps(){let n=0;for(const N of HY.necks)if(N.st=='stump')n++;return n}
// a neck bursts up at slot s (a red circle first)
function hyRise(A,e,s,N){N=N||hyFreeNeck();if(!N||s<0||s>=HY.slots.length)return;const [x,z]=HY.slots[s],gen=HY.gen;
  N.slot=s;N.x=x;N.z=z;N.st='bub';N.t=0;N.g.visible=true;N.g.position.set(x,GH(x,z),z);N.piv.visible=false;N.stump.visible=false;N.rg.visible=false;N.hb.visible=false;N.atk=null;
  const q=V(x,0,z);tele(q,1.7,1.0*PACE.W,()=>{if(gen!==HY.gen||!A.f||N.st!='bub')return;N.st='rise';N.t=0;N.piv.visible=true;N.piv.scale.set(1,.05,1);N.hpM=N.hp=Math.round(paceM0(e.c)*.045);
    N.cd=1.4+Math.random();N.yaw=Math.atan2(pl.position.x-x,pl.position.z-z);burst(gY(q,.3),0x9ae8e0,30,3,4,.7);burst(gY(q,.3),HY_COL,12,2,3,.5);ring(q,0x9ae8e0,2.4,300);
    if(d2(pl.position,q)<1.7&&hero.iv<=0){bossHit(e,.6);dn(pl.position,'Erupted!','#9ae870',-20,700)}})}
for(let k=0;k<16;k++)kqBmv('hyNeck'+k,function(e,A,en){if(A.i===1&&hySlotFree(k))hyRise(A,e,k);return {d:0,lock:0}});
// the surge: a ring wall of water rolls out from the Hydra
kqBmv('tide',function(e,A,en){const n=e.bs.ph>=2?2:1,W=1.25*en;kqBossCast(e,0x9ae8e0,W*1000);HY.glow=W+n*1.3+1.8;
  if(!HY.tideN++)banner('🌊 TIDAL SURGE','The Hydra calls up the mere','Climb onto a glowing stone — or dash through the wave');
  say('🌊 Tidal surge'+(n>1?' — two waves!':'!')+' Get onto a raised stone or dash through the crest.');
  for(let i=0;i<n;i++)d01After(HY.q,W+i*1.3,()=>{if(!A.f||e.dead)return;const w=HY.waves.find(q=>!q.on);if(!w)return;w.on=true;w.r=2.4;w.hit=false;w.safe=false;w.ms.visible=true;
    w.ms.position.set(A.cx,GH(A.cx,A.cz),A.cz);shake(.25);sfx('boom',.45);burst(gY(e.m.position,.5),0x9ae8e0,40,5,4,.8)});
  return {d:W+n*1.3+1.2,lock:1}});
BSTY[1].pool=[['spit','tongue','tide'],['beam','mines','tide'],['spores','tide']];
// the Hydra is guarded while 3+ of its brood live (not for wounds from severing/searing, and never twice in co-op)
{const f=hurt;hurt=function(e,d,s,c,dot){try{if(e&&!e.dead&&e.boss&&e.ar===1&&HY.guard&&!HY.byp&&AF&&AF.i===1&&!MP.ap&&d>0&&d<1e8){d=Math.max(1,Math.round(d*.65));
  if(nowP()-(HY.gT||0)>1500){HY.gT=nowP();popT(e.m.position,'🛡 Brood-guarded','#9ae870')}}}catch(_){}return f.call(this,e,d,s,c,dot)}}
function hyWound(e,k,col){if(!e||e.dead)return;HY.byp=1;try{hurt(e,Math.round(M(e.c)*k),{col})}finally{HY.byp=0}}
function hyHitNeck(A,N,dm){if(N.st!='up'&&N.st!='rise')return;const d=Math.max(1,Math.round(dm*.8));N.hp-=d;N.hit=.2;dn(N.p,d,'#c8ff9a',-10,700);burst(N.p,0x3a7a20,8,2,1,.4);
  if(N.hp<=0)hySever(A,N)}
function hySever(A,N){const e=bossEnt(A.i),ph=e?e.bs.ph:1;N.st='stump';N.T0=N.t=[9,7.5,6][ph-1];N.atk=null;N.piv.visible=false;N.stump.visible=true;N.stump.material=d01Mat('std');N.rg.visible=true;N.hb.visible=false;N.warn=0;
  burst(N.p,0x3a8a20,50,4,3,.8);burst(N.p,0x8a1a1a,20,3,2,.6);ring(V(N.x,0,N.z),HY_COL,3,350);shake(.2);sfx('brk',.6);popT(N.p,'SEVERED!','#c8ff9a',true);hyWound(e,.025,HY_COL);
  if(!HY.sevN++)say('🔥 Sear the stump with fire from a serpent brazier — or it grows back as TWO heads!')}
function hySear(A,N){const e=bossEnt(A.i);N.st='seared';N.t=12;N.rg.visible=false;N.stump.material=d01Mat('char');const q=V(N.x,0,N.z);
  burst(gY(q,1),0xffa020,40,3,4,.8);burst(gY(q,1),0x9aff5a,20,2,3,.6);ring(q,0xffa020,2.6,350);sfx('power',.5);popT(gY(q,1.5),'SEARED!','#ffb040',true);hyWound(e,.035,0xffa020);
  if(!HY.searN++)say('🔥 Seared shut — that head will not return.')}
function hyNeckTick(A,e,N,dt,now,ph){
  if(N.st=='off'||N.st=='bub')return;
  const gy=GH(N.x,N.z);
  if(N.st=='stump'){N.t-=dt;const k=Math.max(0,N.t/N.T0);N.rg.scale.setScalar(.55+1.5*k);N.rg.material.opacity=k<.3?.45+.45*Math.sin(now/60):.7;
    if(Math.random()<.15){HY.v.set(N.x+(Math.random()-.5),HY.wy,N.z+(Math.random()-.5));burst(HY.v,0x9ae8e0,1,.5,1,.4)}
    if(N.t<2.2&&!N.warn){N.warn=1;popT(V(N.x,gy+1.5,N.z),'⚠ Regrowing!','#ff8a5a')}
    if(HY.fire>HY.clk&&Math.hypot(pl.position.x-N.x,pl.position.z-N.z)<1.9){hySear(A,N);return}
    if(N.t<=0){// two heads: this one and a neighbour
      const s=N.slot;N.stump.visible=false;N.rg.visible=false;N.st='off';hyRise(A,e,s,N);
      if(hyLive()+hyStumps()<6){let best=-1,bd=1e9;HY.slots.forEach((q,j)=>{if(!hySlotFree(j))return;const d=Math.hypot(q[0]-N.x,q[1]-N.z);if(d<bd){bd=d;best=j}});if(best>=0)hyRise(A,e,best)}
      popT(V(N.x,gy+2,N.z),'TWO HEADS!','#ff8a5a',true);if(!HY.twoN++)say('🐍 The stump splits into two heads!')}
    return}
  if(N.st=='seared'){N.t-=dt;if(N.t<1)N.g.position.y=gy-(1-N.t)*1.2;if(N.t<=0){N.st='off';N.g.visible=false;N.g.position.y=gy;N.stump.visible=false}return}
  // living neck: face the hero, sway, attack
  const ty=Math.atan2(pl.position.x-N.x,pl.position.z-N.z);N.yaw+=Math.max(-3*dt,Math.min(3*dt,d01Ad(ty,N.yaw)));N.g.rotation.y=N.yaw;
  const fx=Math.sin(N.yaw),fz=Math.cos(N.yaw);N.p.set(N.x+fx*.8*HY_NS,gy+3*HY_NS,N.z+fz*.8*HY_NS);
  if(N.st=='rise'){N.t+=dt;const k=Math.min(1,N.t/.7);N.piv.scale.set(1,.05+.95*(1-Math.pow(1-k,3)),1);if(k>=1){N.st='up';N.piv.scale.set(1,1,1)}}
  if(N.hp<N.hpM)d01BarSet(N.hb,N.x,gy+4.3*HY_NS,N.z,N.hp/N.hpM);
  let rx=Math.sin(now/600+N.i*1.3)*.06,rz=Math.sin(now/800+N.i)*.08;
  if(N.hit>0){N.hit-=dt;rx-=.25*Math.sin(N.hit*30)}
  if(N.st=='up'){
    if(!N.atk){N.cd-=dt;if(N.cd<=0&&HY.clk-HY.lastAtk>.75*PACE.I&&hero.hp>0){HY.lastAtk=HY.clk;const L=Math.hypot(pl.position.x-N.x,pl.position.z-N.z),o=V(N.x,0,N.z);
      if(L<6.8){const d=V(fx,0,fz);N.atk={k:'bite',t:0,T:.85*PACE.W};tele(o,0,.85*PACE.W,()=>{if(!A.f||N.st!='up')return;for(let s=1;s<6.5;s+=1)burst(gY(o.clone().addScaledVector(d,s),.6),HY_COL,2,1,1,.3);
          if(inLine(pl.position,o,d,6.5,2)&&hero.iv<=0){bossHit(e,.9);dn(pl.position,'Bitten!','#9ae870',-20,600)}},{w:2,l:6.5,d})}
      else if(L<17*DK){const q=pl.position.clone();N.atk={k:'spit',t:0,T:1.1*PACE.W};kqLob(A,N.p.clone(),q,1.1*PACE.W,0x9aff3a,1.6);
        tele(q,1.8,1.1*PACE.W,()=>{if(!A.f)return;burst(gY(q,.3),0x9aff3a,16,2,2,.5);if(d2(pl.position,q)<1.8&&hero.iv<=0)bossHit(e,.6);bxPool(A,q,1.8,4,0x6aff3a,.15)})}
      N.cd=(2.8+Math.random()*1.4)*(ph>=3?.75:1)*PACE.I}}
    else{const a=N.atk;a.t+=dt;const u=a.t/a.T;
      if(a.k=='bite'){if(u<1)rx-=.45*u;else if(u<1.25)rx+=-.45+1.6*((u-1)/.25);else if(u<1.9)rx+=1.15*(1-(u-1.25)/.65);else N.atk=null}
      else{if(u<.35)rx-=.5*(u/.35);else if(u<.55)rx+=-.5+.8*((u-.35)/.2);else if(u<1)rx+=.3*(1-(u-.55)/.45);else N.atk=null}}}
  N.piv.rotation.x=rx;N.piv.rotation.z=rz}
function hyStart(A,e){HY.gen++;HY.necks.forEach(hyOff);HY.q.length=0;HY.waves.forEach(w=>{w.on=false;w.ms.visible=false});HY.ph=1;HY.nt=2.2;HY.fire=0;HY.clk=0;HY.glow=0;HY.guard=false;HY.tideN=HY.tideN||0;
  setTimeout(()=>{if(A.f)say('🐍 The Serpent Mere. Sever its brood necks, then sear the stumps with serpent-fire from the braziers.')},1400)}
function hyOff(N){N.st='off';N.g.visible=false;N.atk=null;N.hb.visible=false;N.rg.visible=false;N.stump.visible=false;N.piv.visible=true;N.piv.scale.set(1,1,1);N.slot=-1}
function hyTick(A,e,dt,now){
  const ph=e.bs.ph,auth=d01Auth(A);HY.clk+=dt;
  if(ph!==HY.ph){if(ph>HY.ph){HY.nt=Math.min(HY.nt,1);say(ph==2?'🐍 More heads stir beneath the mere!':'🐍 The whole brood rises — the mere boils!')}HY.ph=ph}
  d01Run(HY.q,dt);
  // the driver brings up necks (relayed so a partner sees them too)
  if(auth&&!e.dead){HY.nt-=dt;if(HY.nt<=0){const live=hyLive(),want=[2,3,4][ph-1];HY.nt=1;
    if(live<want&&live+hyStumps()<6){const fr=HY.slots.map((_,j)=>j).filter(j=>hySlotFree(j)&&Math.hypot(HY.slots[j][0]-pl.position.x,HY.slots[j][1]-pl.position.z)>2.5);
      if(fr.length){d01Cast('hyNeck'+fr[Math.random()*fr.length|0],e,A,1);HY.nt=live<want-1?1.6:[5,4.2,3.4][ph-1]*PACE.I}}}}
  for(const N of HY.necks)hyNeckTick(A,e,N,dt,now,ph);
  // brood guard
  const live=hyLive();HY.guard=live>=3;HY.shell.visible=HY.guard&&!e.hid;if(HY.guard){const bs=e.m.bs||4;HY.shell.position.set(e.m.position.x,GH(e.m.position.x,e.m.position.z)+bs*.35,e.m.position.z);HY.shell.scale.setScalar(bs*.75+.1*Math.sin(now/200));HY.shell.material.opacity=.1+.05*Math.sin(now/150)}
  // braziers give serpent-fire
  for(const b of HY.braz)if(Math.hypot(pl.position.x-b.x,pl.position.z-b.z)<2.25&&hero.hp>0){if(HY.fire-HY.clk<9.5){if(HY.fire<HY.clk)popT(pl.position,'🔥 Serpent-fire!','#ffb040',true);burst(gY(pl.position,1.2),0x9aff5a,14,2,2,.5)}
    HY.fire=HY.clk+10;d01Buff('Serpent-fire','🔥',10000,'Touch a severed stump to sear it shut')}
  const fire=HY.fire>HY.clk;HY.fl.visible=fire;if(fire){HY.fl.position.set(pl.position.x+Math.sin(pl.rotation.y+.6)*.5,pl.position.y+1.4,pl.position.z+Math.cos(pl.rotation.y+.6)*.5);HY.fl.scale.setScalar(1+.25*Math.sin(now/60));if(Math.random()<.3)burst(HY.fl.position,0x9aff5a,1,.3,.8,.4)}
  else if(hero.buffs.some(b=>b.n=='Serpent-fire'))d01Unbuff('Serpent-fire');
  // tidal surges
  const on=hyOnStone(pl.position.x,pl.position.z),dc=Math.hypot(pl.position.x-A.cx,pl.position.z-A.cz);let anyW=false;
  for(const w of HY.waves){if(!w.on)continue;anyW=true;w.r+=7.2*dt;const k=w.r/(ARENA_R+.5);w.ms.scale.set(w.r,1.8*(1-.45*k),w.r);w.ms.material.opacity=.85*(1-.55*k);
    for(let j=0;j<3;j++){const a=Math.random()*6.283;HY.v.set(A.cx+Math.cos(a)*w.r,HY.wy+1.2*(1-.45*k),A.cz+Math.sin(a)*w.r);burst(HY.v,0xe8fffa,1,1,1.5,.4)}
    if(!w.hit&&Math.abs(dc-w.r)<.85&&hero.hp>0){if(on){if(!w.safe){w.safe=true;popT(pl.position,'Safe!','#9ae8ff')}}else if(hero.iv<=0){w.hit=true;bossHit(e,1.25);
      const q=inArena(A,pl.position.clone().add(V((pl.position.x-A.cx)/(dc||1)*2.4,0,(pl.position.z-A.cz)/(dc||1)*2.4)),1);if(!solid(q.x,q.z)){pl.position.x=q.x;pl.position.z=q.z}dn(pl.position,'Swept away!','#9ae8ff',-20,800)}}
    if(w.r>ARENA_R+.6){w.on=false;w.ms.visible=false}}
  HY.wl+=((anyW?.2:0)-HY.wl)*Math.min(1,dt*3);
  HY.glow=Math.max(0,HY.glow-dt);HY.gk+=((HY.glow>0?1:0)-HY.gk)*Math.min(1,dt*5);HY.sg.visible=HY.gk>.02;HY.sg.material.opacity=HY.gk*(.55+.3*Math.sin(now/90));
  // strikes from range
  d01Shots(HY.shot||(HY.shot=(p,dm)=>{for(const N of HY.necks){if(N.st!='up'&&N.st!='rise')continue;if(Math.hypot(p.x-N.p.x,p.z-N.p.z)<1.1||Math.hypot(p.x-N.x,p.z-N.z)<.9){hyHitNeck(HY.A,N,dm);return true}}return false}));
  // HUD (a few times a second)
  HY.hT=(HY.hT||0)-dt;if(HY.hT>0)return;HY.hT=.12;const st=hyStumps(),f=fire?Math.ceil(HY.fire-HY.clk):0;
  d01Hud('🐍 Heads '+live+(st?' &nbsp;·&nbsp; <b style="color:#ff8a5a">Stumps regrowing '+st+'</b>':'')+(HY.guard?' &nbsp;·&nbsp; <b style="color:#9ae870">🛡 Brood-guarded</b>':'')+(f?' &nbsp;·&nbsp; <b style="color:#ffb040">🔥 '+f+'s</b>':''),HY.guard?'#9ae870':fire?'#ffb040':'#5a7a3a')}
function hyOnStone(x,z){for(const s of HY.stones)if(Math.hypot(x-s[0],z-s[1])<s[2]-.05)return true;return false}
function hyClear(A,won){HY.gen++;HY.necks.forEach(hyOff);HY.q.length=0;HY.waves.forEach(w=>{w.on=false;w.ms.visible=false});HY.fire=0;HY.fl.visible=false;HY.glow=0;HY.gk=0;HY.sg.visible=false;HY.wl=0;
  HY.guard=false;HY.shell.visible=false;d01Hud(null);d01Unbuff('Serpent-fire')}
function hySeal(A,on){const m=HY.seal;if(!m)return;const y0=GH(A.cx,A.cz);
  if(on){m.visible=true;const s0=m.scale.y;tw(900,k=>m.scale.y=s0+(1-s0)*(1-Math.pow(1-k,2)));for(let k=0;k<8;k++){const a=HY.ent-.4+k/7*.8;burst(V(A.cx+Math.cos(a)*15.2*DK,y0+.3,A.cz+Math.sin(a)*15.2*DK),0x9ae8e0,14,2,5,.7)}shake(.15)}
  else{const s0=m.scale.y;tw(800,k=>m.scale.y=Math.max(.02,s0*(1-k)),()=>{if(!HY.A.f)m.visible=false})}}
// the boss's own floating health bar is hidden in the den (the top boss bar shows its health; up close it covered the view)
DEN[1]={build:hyBuild,start:hyStart,tick:hyTick,clear:hyClear,seal:hySeal,
  ai(A,e){if(e.hb)e.hb.visible=false;return false},
  hitA(A,p,r,dm,s,dir,half){for(const N of HY.necks){if(N.st!='up'&&N.st!='rise')continue;if(d01InArc(p,r,dir,half,N.x,N.z,1.1)||d01InArc(p,r,dir,half,N.p.x,N.p.z,.9))hyHitNeck(A,N,dm)}}};
// the raised stones carry you (also outside the fight) and the curtain ripples
{const f=arenaTick;arenaTick=function(dt,now){f.apply(this,arguments);try{const A=HY.A;if(!A)return;const p=pl.position;if(Math.abs(p.x-A.cx)>16*DK||Math.abs(p.z-A.cz)>16*DK)return;
  if(hyOnStone(p.x,p.z))p.y=GH(p.x,p.z)+.34*DKY}catch(_){}}}

