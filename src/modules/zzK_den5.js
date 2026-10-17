// ================= v86 den 5: The Crimson Throne Hall — Lord Vaelric, the Crimson King (final boss) =================
// A ruined gothic throne hall: checkered marble under a long crimson carpet, a moat of blood around the floor, a ring of
// clustered pillars and pointed arches, stained-glass lancets and a rose window, candelabras, banners, two blood
// fountains and the throne on its dais. The gate drops an iron portcullis and a curtain of blood when the fight begins.
// Mechanics (uses the dq* toolkit from zzK_den4.js):
//  • Blood Chalices — golden chalices rise on the four pedestals; while one stands a blood tether heals Vaelric. Shatter them.
//  • Bat Swarm      — he bursts into bats that sweep the hall along red lanes (2/3/4 sweeps), then reforms with a burst.
//  • Crimson Doubles (phase 2+) — he splits into four; all four channel blood lances at you. Only the real one casts a
//                     shadow: hit him to shatter every copy and stagger him (copies can be cut down one by one too).
//  • Blood Moon (phase 2+) — the hall floods with blood; only the pale moonlight shafts are safe (they drift in phase 3).
//  • The Crimson Rite (phase 3 finale) — he rises before his throne, warded, while four blood obelisks feed a sigil.
//                     Break all four to bring him crashing down (stunned, +50% damage); if the rite completes, a
//                     Crimson Cataclysm hits the whole hall — dash through it.
var D5={};
function d5Build(A){
  const cx=A.cx,cz=A.cz,y0=GH(cx,cz),TAU=DQ.TAU,R=ARK.rng(5500),ea=dqEntry(A),fa=ea+Math.PI,GAP=.196;A.dqA=ea;
  const F={x:Math.cos(fa),z:Math.sin(fa)},Rt={x:-Math.sin(fa),z:Math.cos(fa)},L=(u,v)=>[cx+F.x*u+Rt.x*v,cz+F.z*u+Rt.z*v],RY=Math.atan2(F.x,F.z);
  const P=(a,r)=>[cx+Math.cos(a)*r,cz+Math.sin(a)*r];
  const S=arkSoup(5501),I=arkSoup(5502),G=arkSoup(5503),W=arkSoup(5508),WG=arkSoup(5509),stone=0x4a4048,dstone=0x2e282e,gold=0xb08a3a,crim=0x7a0c1a;
  D5.L=L;D5.fa=fa;
  // ---- floor: checkered marble on a dark bed, crimson carpet with gold borders, gold inlay ring ----
  {const pts=[...Array(48)].map((_,i)=>P(i/48*TAU,14.5));S.slab(pts,pts.map(()=>y0+.02),y0-.3,0x161216,0x161216)}
  const T=1.6;for(let j=-10;j<=10;j++)for(let i=-10;i<=10;i++){const u=i*T,v=j*T,cs=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[u+a*(T/2-.03),v+b*(T/2-.03)]);
    if(Math.max(...cs.map(([a,b])=>Math.hypot(a,b)))>14.45)continue;const pts=cs.map(([a,b])=>L(a,b)),cr=R()<.06;
    const col=cr?0x1a1416:((i+j)&1)?arkShade(0x2b2228,.85+R()*.25):arkShade(0x6a2630,.8+R()*.3);S.slab(pts,pts.map(p=>GH(p[0],p[1])+.05),y0-.05,col,0x120e10)}
  {const strip=(u0,u1,v0,v1,col,y)=>{const a=L(u0,v0),b=L(u1,v0),c=L(u1,v1),d=L(u0,v1),q=p=>[p[0],y0+y,p[1]];S.quad(q(a),q(b),q(c),q(d),col,.06)};
    for(let u=-14.3;u<10.4;u+=1.3){const u1=Math.min(10.4,u+1.3);strip(u,u1,-1.25,1.25,arkShade(crim,.9+R()*.15),.085);strip(u,u1,-1.45,-1.25,gold,.086);strip(u,u1,1.25,1.45,gold,.086)}
    for(let k=0;k<6;k++){strip(-1.6+k*2.4,-1.0+k*2.4,-.5,.5,0x5a0814,.088)}}
  for(let k=0;k<64;k++){const a0=k/64*TAU,a1=(k+1)/64*TAU,p=(a,r)=>{const [x,z]=P(a,r);return [x,y0+.06,z]};if(dqAng((a0+a1)/2,ea)<.12)continue;S.quad(p(a0,13.55),p(a1,13.55),p(a1,13.75),p(a0,13.75),gold,.05)}
  // ---- the moat of blood, its curbs and the gate bridge ----
  for(let k=0;k<72;k++){const a0=k/72*TAU,a1=(k+1)/72*TAU,am=(a0+a1)/2;if(dqAng(am,ea)<.16)continue;const p=(a,r,y)=>{const [x,z]=P(a,r);return [x,y,z]};
    G.quad(p(a0,14.45,y0-.08),p(a1,14.45,y0-.08),p(a1,15.9,y0-.08),p(a0,15.9,y0-.08),R()<.25?0x8a1424:0x56060f,.15);
    S.slab([P(a0,14.3),P(a1,14.3),P(a1,14.5),P(a0,14.5)],[0,0,0,0].map(()=>y0+.28),y0-.4,arkShade(dstone,1.2),dstone);
    S.slab([P(a0,15.88),P(a1,15.88),P(a1,16.1),P(a0,16.1)],[0,0,0,0].map(()=>y0+.38),y0-.4,arkShade(dstone,1.2),dstone)}
  {const tq=-Math.sin(ea),tz=Math.cos(ea),B=(r,s)=>[cx+Math.cos(ea)*r+tq*s,cz+Math.sin(ea)*r+tz*s];S.slab([B(14.2,-1.9),B(16.6,-1.9),B(16.6,1.9),B(14.2,1.9)],[0,0,0,0].map(()=>y0+.1),y0-.45,arkShade(stone,.95),dstone);
    [-1.85,1.85].forEach(s=>{for(let r=14.4;r<16.6;r+=.55){const [x,z]=B(r,s);S.geo(ARKG.cyl6,arkM4(x,y0+.45,z,.1,.7,.1),arkShade(stone,1.1))}const [x,z]=B(15.4,s);S.geo(ARKG.box,arkM4(x,y0+.84,z,.18,.1,2.3,0,Math.atan2(Math.cos(ea),Math.sin(ea))),arkShade(stone,1.2))})}
  // ---- colonnade: clustered gothic pillars, pointed arches, entablature ----
  const NP=16,PR=16.65,pa=k=>ea+(k+.5)*TAU/NP,cap=9.9;
  for(let k=0;k<NP;k++){const a=pa(k),[x,z]=P(a,PR),ry=Math.PI/2-a,c=arkShade(stone,.9+R()*.2);
    W.geo(ARKG.box,arkM4(x,y0+.35,z,1.35,.7,1.35,0,ry),arkShade(stone,.7));W.geo(ARKG.box,arkM4(x,y0+.82,z,1.1,.24,1.1,0,ry),arkShade(stone,.8));
    W.geo(ARKG.cyl6,arkM4(x,y0+.94+4.3,z,.48,8.6,.48,0,ry),c);for(let q=0;q<4;q++){const qa=q*Math.PI/2+Math.PI/4,ox=Math.cos(qa)*.5,oz=Math.sin(qa)*.5;W.geo(ARKG.cyl5,arkM4(x+ox,y0+.94+4.3,z+oz,.16,8.6,.16),arkShade(c,.9))}
    W.geo(ARKG.box,arkM4(x,y0+9.65,z,1.25,.5,1.25,0,ry),arkShade(stone,1.05));W.geo(ARKG.box,arkM4(x,y0+cap,z,1.45,.22,1.45,0,ry),arkShade(stone,.8))}
  for(let k=0;k<NP;k++){const [x1,z1]=P(pa(k),PR),[x2,z2]=P(pa(k+1),PR),dx=x2-x1,dz=z2-z1,ch=Math.hypot(dx,dz),ry=Math.atan2(-dz,dx),rise=2.2,half=ch/2,len=Math.hypot(half,rise),tilt=Math.atan2(rise,half);
    const mx=(x1+x2)/2,mz=(z1+z2)/2;W.geo(ARKG.box,arkM4(x1+dx/4,y0+cap+rise/2,z1+dz/4,len,.42,.7,0,ry,tilt),arkShade(stone,.95));W.geo(ARKG.box,arkM4(mx+dx/4-dx/2+dx/2,y0+cap+rise/2,mz+dz/4,len,.42,.7,0,ry,-tilt),arkShade(stone,.95));
    W.geo(ARKG.box,arkM4(mx,y0+cap+2.75,mz,ch+.3,.6,.9,0,ry),arkShade(stone,.75));W.geo(ARKG.box,arkM4(mx,y0+cap+3.15,mz,ch+.5,.2,1.1,0,ry),arkShade(stone,.6));
    W.geo(ARKG.cone4,arkM4(mx,y0+cap+2.45,mz,.22,.5,.22,Math.PI,0),arkShade(stone,.8))}
  // ---- outer wall with stained-glass lancets; a rose window behind the throne ----
  const pane=[0xa01028,0x5a1a7a,0xc89a30,0x2a3a9a,0xc02040,0x7a2a9a],glass=[];D5.glass=glass;
  for(let k=0;k<NP;k++){const a0=pa(k),a1=pa(k+1),am=(a0+a1)/2,gate=k==NP-1;if(gate)continue;const [x,z]=P(am,18.25),ch=2*18.25*Math.sin((a1-a0)/2)+.4,ry=Math.PI/2-am;
    W.geo(ARKG.box,arkM4(x,y0+6.7,z,ch,13.4,.8,0,ry),arkShade(0x3a3238,.85+R()*.2));
    const tx=-Math.sin(am),tz=Math.cos(am),[bx,bz]=P(am,17.82),Q=(u,v)=>[bx+tx*u,y0+v,bz+tz*u],rose=dqAng(am,fa)<.1;
    if(rose){const rc=[bx,y0+8.6,bz],seg=16;for(let s=0;s<seg;s++){const s0=s/seg*TAU,s1=(s+1)/seg*TAU,pp=(an,rr)=>[bx+tx*Math.cos(an)*rr,y0+8.6+Math.sin(an)*rr,bz+tz*Math.cos(an)*rr];
        WG.quad(pp(s0+.03,.55),pp(s1-.03,.55),pp(s1-.03,2.2),pp(s0+.03,2.2),pane[s%2?0:4],.1);WG.tri(pp(s0+.05,2.32),pp(s1-.05,2.32),pp((s0+s1)/2,2.75),pane[s%3==0?2:1],.1)}
      WG.geo(ARKG.cyl6,arkM4(rc[0],rc[1],rc[2],.45,.06,.45,Math.PI/2,ry,0),0xffc860);W.geo(ARKG.cyl6,arkM4(rc[0]-Math.cos(am)*.05,rc[1],rc[2]-Math.sin(am)*.05,2.95,.2,2.95,Math.PI/2,ry,0),arkShade(stone,.7))}
    const top=rose?5.6:8.3,w=rose?.75:.85;for(let c=0;c<3;c++)for(let r=0;r<6;r++){const u0=-w+c*(2*w/3)+.05,u1=-w+(c+1)*(2*w/3)-.05,v0=2.6+r*((top-2.6)/6)+.05,v1=2.6+(r+1)*((top-2.6)/6)-.05;WG.quad(Q(u0,v0),Q(u1,v0),Q(u1,v1),Q(u0,v1),pane[(c+r*2+k)%pane.length],.12)}
    WG.tri(Q(-w+.05,top+.08),Q(w-.05,top+.08),Q(0,top+1.5),pane[(k+2)%pane.length],.1);
    [-w-.12,w+.12].forEach(u=>{const [jx,jz]=[bx+tx*u,bz+tz*u];W.geo(ARKG.box,arkM4(jx,y0+(top+2.4)/2+.6,jz,.22,top-1.6,.3,0,ry),arkShade(stone,.8))});W.geo(ARKG.box,arkM4(bx,y0+2.5,bz,2*w+.5,.22,.36,0,ry),arkShade(stone,.8))}
  // banners on the inner face of the pillars (not the two flanking the gate)
  for(let k=0;k<NP;k++){if(k==0||k==NP-1)continue;const a=pa(k),[x,z]=P(a,PR-.78),tx=-Math.sin(a),tz=Math.cos(a),Q=(u,v)=>[x+tx*u,y0+v,z+tz*u],w=.5;
    W.quad(Q(-w,8.6),Q(w,8.6),Q(w,4.2),Q(-w,4.2),crim,.08);W.tri(Q(-w,4.2),Q(0,4.2),Q(-w,3.5),crim);W.tri(Q(0,4.2),Q(w,4.2),Q(w,3.5),crim);
    W.quad(Q(-w,8.6),Q(w,8.6),Q(w,8.4),Q(-w,8.4),gold,.05);W.quad(Q(-.06,7.6),Q(.06,7.6),Q(.06,5.0),Q(-.06,5.0),gold,.05);W.quad(Q(0,7.1),Q(.32,6.6),Q(0,6.1),Q(-.32,6.6),gold,.05);
    I.geo(ARKG.cyl5,arkM4(x,y0+8.7,z,.05,1.25,.05,Math.PI/2,Math.PI/2-a+Math.PI/2,0),0x2a2420)}
  // ---- candelabras around the floor's edge ----
  const fl=[];for(let k=0;k<12;k++){const a=ea+(k+.5)*TAU/12;if(dqAng(a,ea)<.3||dqAng(a,fa)<.3)continue;const [x,z]=P(a,13.85),y=y0+.06;
    for(let l=0;l<3;l++){const la=l*2.094+a;I.geo(ARKG.box,arkM4(x+Math.cos(la)*.22,y+.18,z+Math.sin(la)*.22,.05,.4,.05,Math.sin(la)*.6,0,-Math.cos(la)*.6),0x2a2420)}
    I.geo(ARKG.cyl5,arkM4(x,y+1.25,z,.05,2.3,.05),0x2a2420);I.geo(ARKG.cone5,arkM4(x,y+.42,z,.12,.2,.12),0x34302a);
    const tx=-Math.sin(a),tz=Math.cos(a);[[-.5,2.25],[0,2.55],[.5,2.25]].forEach(([u,h])=>{const cx2=x+tx*u,cz2=z+tz*u;if(u)I.geo(ARKG.box,arkM4(x+tx*u/2,y+h-.18,z+tz*u/2,.04,.04,.55,0,Math.atan2(tx,tz),0),0x2a2420);
      I.geo(ARKG.cyl6,arkM4(cx2,y+h-.05,cz2,.11,.06,.11),gold);S.geo(ARKG.cyl6,arkM4(cx2,y+h+.15,cz2,.06,.36,.06),0xe8dcc0);fl.push([cx2,y+h+.42,cz2])})}
  fl.forEach(([x,y,z])=>{G.geo(ARKG.cone4,arkM4(x,y,z,.075,.22,.075,0,R()),0xffa040);G.geo(ARKG.cone4,arkM4(x,y-.03,z,.04,.13,.04,0,R()),0xfff0c0)});
  // ---- the throne on its dais ----
  {const step=(u0,u1,w,h,c)=>{const pts=[L(u0,-w),L(u1,-w),L(u1,w),L(u0,w)];S.slab(pts,pts.map(()=>y0+h),y0-.05,c,arkShade(c,.7))};
    step(10.5,13.9,3.4,.16,arkShade(dstone,1.4));step(11.2,13.9,2.7,.32,arkShade(0x5a2630,.9));step(11.9,13.9,2.1,.48,arkShade(dstone,1.5));
    {const strip=(u0,u1,v,col,y)=>{const pts=[L(u0,-v),L(u1,-v),L(u1,v),L(u0,v)];S.quad(...pts.map(p=>[p[0],y0+y,p[1]]),col,.05)};strip(10.5,10.75,1.25,crim,.17);strip(11.2,11.45,1.25,crim,.33);strip(11.9,12.6,1.25,crim,.49)}
    const [tx,tz]=L(13.1,0),y=y0+.48,ry=RY;S.geo(ARKG.box,arkM4(tx,y+.35,tz,1.7,.7,1.3,0,ry),arkShade(0x2a1a20,1.1));S.geo(ARKG.box,arkM4(tx,y+.75,tz,1.45,.14,1.1,0,ry),0x8a1022);
    const [bx,bz]=L(13.7,0);S.geo(ARKG.box,arkM4(bx,y+2.6,bz,1.8,4.4,.35,0,ry),arkShade(0x2a1a20,1.1));S.geo(ARKG.box,arkM4(bx-F.x*.05,y+2.4,bz-F.z*.05,1.2,3.0,.3,0,ry),0x7a0c1a);
    [-.7,0,.7].forEach((v,i)=>{const [sx,sz]=L(13.7,v);S.geo(ARKG.cone4,arkM4(sx,y+5.2+(i==1?.5:0),sz,.22,i==1?1.6:1.1,.22,0,ry+Math.PI/4),arkShade(0x2a1a20,1.2));G.geo(ARKG.oct,arkM4(sx,y+4.6+(i==1?.3:0),sz-0,.14),0xff3050)});
    [-1,1].forEach(s=>{const [ax,az]=L(13.0,s*.95);S.geo(ARKG.box,arkM4(ax,y+1.05,az,.25,.25,1.3,0,ry),arkShade(0x2a1a20,1.3));dqSkull(S,...L(12.35,s*.95).flatMap((q,i)=>i?[y+1.0,q]:[q]),RY+Math.PI,.3,0xd8cfb4)});
    const [gx,gz]=L(13.62,0);G.geo(ARKG.oct,arkM4(gx,y+4.1,gz,.32,.4,.12,0,ry),0xff2040);
    [[11.9,13.9,2.1]].forEach(([u0,u1,w])=>{for(let u=u0;u<=u1;u+=.8)for(let v=-w;v<=w;v+=.8)denBlock(...L(u,v))})}
  // ---- two blood fountains flanking the dais ----
  D5.fount=[];[-1,1].forEach(s=>{const [x,z]=L(9.6,s*5.5);D5.fount.push([x,z]);dqDisc(x,z,1.45).forEach(([i,j])=>denBlock(i,j));
    S.geo(ARKG.cyl6,arkM4(x,y0+.3,z,1.4,.6,1.4,0,.26),arkShade(stone,1.0));S.geo(ARKG.cyl6,arkM4(x,y0+.62,z,1.48,.1,1.48,0,.26),arkShade(stone,1.25));G.geo(ARKG.cyl6,arkM4(x,y0+.58,z,1.25,.04,1.25,0,.26),0x6a0612);
    S.geo(ARKG.cyl6,arkM4(x,y0+1.2,z,.24,1.3,.24),arkShade(stone,1.1));S.geo(ARKG.cone5,arkM4(x,y0+1.95,z,.8,.42,.8,Math.PI),arkShade(stone,1.15));G.geo(ARKG.cyl5,arkM4(x,y0+2.15,z,.72,.04,.72),0x8a0a18);
    S.geo(ARKG.cyl6,arkM4(x,y0+2.45,z,.12,.6,.12),arkShade(stone,1.1));G.geo(ARKG.oct,arkM4(x,y0+2.85,z,.16,.24,.16),0xff2a40);
    for(let q=0;q<6;q++){const qa=q/6*TAU,o=.74,ox=x+Math.cos(qa)*o,oz=z+Math.sin(qa)*o,t={x:-Math.sin(qa),z:Math.cos(qa)},Q=(u,v,r)=>[x+Math.cos(qa)*r+t.x*u,y0+v,z+Math.sin(qa)*r+t.z*u];G.quad(Q(-.06,2.12,.76),Q(.06,2.12,.76),Q(.05,.62,.95),Q(-.05,.62,.95),0x9a0c20,.15)}});
  // ---- four chalice pedestals ----
  D5.ped=[];[50,130,-50,-130].forEach(dg=>{const ang=dg*Math.PI/180,[x,z]=L(Math.cos(ang)*8.4,Math.sin(ang)*8.4);D5.ped.push([x,z]);denBlock(x,z);
    S.geo(ARKG.box,arkM4(x,y0+.12,z,1.0,.24,1.0,0,RY),arkShade(stone,.9));S.geo(ARKG.cyl6,arkM4(x,y0+.62,z,.3,.8,.3,0,.2),arkShade(stone,1.15));S.geo(ARKG.box,arkM4(x,y0+1.07,z,.8,.12,.8,0,RY),arkShade(stone,.95));I.geo(ARKG.cyl6,arkM4(x,y0+1.0,z,.36,.05,.36),gold)});
  dqWall(A,14.95,18.9,ea,GAP*.95);
  dqMesh(A,S,arkMat('std'));dqMesh(A,I,arkMat('iron'));const gm=dqMesh(A,G,arkMat('glow'),false);gm.receiveShadow=false;
  dqMesh(A,W,d5Cut(arkMat('std'),A));const wg=dqMesh(A,WG,d5Cut(arkMat('glow'),A),false);wg.receiveShadow=false;
  // ---- live pieces ----
  // portcullis between the gate pillars + the blood curtain
  {const PC=arkSoup(5504),[x1,z1]=P(pa(NP-1),PR),[x2,z2]=P(pa(0),PR),n=12;for(let b=0;b<=n;b++){const t=.06+.88*b/n,x=x1+(x2-x1)*t,z=z1+(z2-z1)*t;PC.geo(ARKG.cyl5,arkM4(x,y0+2.6,z,.07,5.2,.07),0x2a2226);PC.geo(ARKG.cone4,arkM4(x,y0-.1,z,.09,.35,.09,Math.PI),0x3a3236)}
    const ry=Math.atan2(-(z2-z1),x2-x1);[.6,1.9,3.2,4.5].forEach(h=>PC.geo(ARKG.box,arkM4((x1+x2)/2,y0+h,(z1+z2)/2,Math.hypot(x2-x1,z2-z1)-.8,.1,.09,0,ry),0x2a2226));
    const g=new THREE.Group();g.add(PC.mesh(d5Cut(arkMat('iron'),A)));g.position.y=5.6;A.g.add(g);D5.gate=g}
  const cur=dqCurtain(14.3,4.2,0xff1030);cur.position.set(cx,y0+2.1,cz);A.g.add(cur);D5.cur=cur;
  // the Crimson Rite sigil (hidden until the rite)
  {const RS=arkSoup(5505),line=(a,b,w,col)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),nx=-dz/l*w,nz=dx/l*w,y=y0+.1;RS.quad([a[0]+nx,y,a[1]+nz],[b[0]+nx,y,b[1]+nz],[b[0]-nx,y,b[1]-nz],[a[0]-nx,y,a[1]-nz],col,.05)};
    [[6.9,.09],[6.3,.06],[3.4,.07]].forEach(([r,w])=>{for(let k=0;k<64;k++)line(P(k/64*TAU,r),P((k+1)/64*TAU,r),w,0xff2040)});
    const st=[...Array(8)].map((_,k)=>P(fa+Math.PI/4+k*TAU/8,6.3));for(let k=0;k<8;k++)line(st[k],st[(k+3)%8],.06,0xff3050);
    const RR=ARK.rng(77);for(let k=0;k<20;k++){const a=k/20*TAU,[x,z]=P(a,6.6);arkRune(RS,x,y0+.1,z,a+1.57,1.0,0xff4060,RR)}
    const m=RS.mesh(new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.material.userData.lps=1;m.castShadow=false;m.visible=false;m.renderOrder=16;A.g.add(m);D5.sigil=m}
  // Blood Moon: the flood and three moonlight shafts
  {const g=new THREE.CircleGeometry(14.45,64);g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x6a0010,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6}));m.position.set(cx,y0+.14,cz);m.visible=false;m.renderOrder=15;A.g.add(m);D5.flood=m;
    const rg=new THREE.RingGeometry(.5,14.4,64,3);rg.rotateX(-Math.PI/2);const rm=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,wireframe:true}));rm.position.set(cx,y0+.16,cz);rm.visible=false;A.g.add(rm);D5.ripple=rm;
    D5.moon=[];for(let k=0;k<3;k++){const gr=new THREE.Group(),d=new THREE.Mesh(dqG('disc'),new THREE.MeshBasicMaterial({color:0xcfe0ff,transparent:true,opacity:.0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false})),ed=new THREE.Mesh(dqG('edge'),new THREE.MeshBasicMaterial({color:0xeef4ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false}));
      d.renderOrder=22;ed.renderOrder=23;d.position.y=ed.position.y=.17;const sh=dqCurtain(1,1,0x9ab8ff);sh.geometry=(()=>{const q=new THREE.CylinderGeometry(.55,1,1,20,1,true),p=q.attributes.position,c=[];for(let i=0;i<p.count;i++){const t=p.getY(i)>0?.08:1;c.push(.6*t,.72*t,1*t)}q.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return q})();
      sh.position.y=7;sh.renderOrder=9;gr.add(d,ed,sh);gr.visible=false;A.g.add(gr);D5.moon.push({g:gr,d,ed,sh,x:0,z:0})}}
  // bats (a reusable flock)
  {const B=arkSoup(5506);B.geo(ARKG.oct,arkM4(0,0,0,.16,.14,.26),0x1a0a10);B.geo(ARKG.oct,arkM4(0,.06,.2,.09),0x220c12);B.geo(ARKG.oct,arkM4(.04,.08,.28,.025),0xff2030);B.geo(ARKG.oct,arkM4(-.04,.08,.28,.025),0xff2030);
    const body=B.mesh(arkMat('glow')),W=arkSoup(5507);W.tri([0,0,.1],[.75,.05,-.05],[.55,-.05,.22],0x3a0e16);W.tri([0,0,.1],[.55,-.05,.22],[.25,0,-.2],0x2a0a12);W.tri([.55,-.05,.22],[.75,.05,-.05],[.9,-.1,.3],0x3a0e16);const wing=W.mesh(arkMat('glow'));
    D5.bats=[];for(let k=0;k<20;k++){const g=new THREE.Group(),b=new THREE.Mesh(body.geometry,body.material),l=new THREE.Mesh(wing.geometry,wing.material),r=new THREE.Mesh(wing.geometry,wing.material);r.scale.x=-1;g.add(b,l,r);g.visible=false;g.scale.setScalar(1.3);scene.add(g);D5.bats.push({g,l,r,on:0,ph:k*.7})}}
  // tether beams (chalices / obelisks → Vaelric)
  {const g=new THREE.CylinderGeometry(.07,.07,1,6,1,true);g.translate(0,.5,0);D5.tg=g;D5.tm=new THREE.MeshBasicMaterial({color:0xff1a3a,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false});D5.tm.userData.lps=1}
  // the red mood overlay for the Blood Moon and the rite progress bar
  {const st=$('stage');if(st){const d=document.createElement('div');d.id='d5tint';d.style.cssText='position:absolute;inset:0;pointer-events:none;opacity:0;z-index:1;background:radial-gradient(ellipse at center,rgba(120,0,20,.05) 35%,rgba(150,0,25,.55) 100%)';st.appendChild(d);D5.tint=d;
    const b=document.createElement('div');b.id='d5rite';b.style.cssText='position:absolute;left:50%;top:112px;transform:translateX(-50%);z-index:6;pointer-events:none;display:none;min-width:260px;padding:5px 12px;border-radius:9px;background:rgba(30,4,10,.85);border:1px solid #c0203a;color:#ffd0d8;font:700 12px system-ui,sans-serif;text-align:center';
    b.innerHTML='<div id="d5riteT">🩸 THE CRIMSON RITE</div><div style="height:8px;margin-top:4px;background:#2a0810;border-radius:4px;overflow:hidden"><i id="d5riteB" style="display:block;height:100%;width:0;background:linear-gradient(90deg,#ff2040,#ff8090)"></i></div>';st.appendChild(b);D5.riteEl=b}}
  // ambient life: fountains spurt, rose window and candles breathe
  TANIM.push({x:cx,z:cz,f:now=>{if(Math.random()<.18){const [x,z]=D5.fount[(Math.random()*2)|0];burst(V(x+(Math.random()-.5)*.6,y0+2.3,z+(Math.random()-.5)*.6),0xc01028,2,.8,1.6,.6)}}});
  A.b.ult=0;   // the Blood Moon and the Crimson Rite replace the generic Cataclysm
}
// ---------------- helpers ----------------
// cutaway: the tall walls, pillars and arches on the camera's side dissolve (dithered) when the camera is outside the hall
function d5Cut(base,A){const m=base.clone();m.userData.lps=1;const U={value:new THREE.Vector4(A.cx,A.cz,GH(A.cx,A.cz),1)};
  m.onBeforeCompile=sh=>{sh.uniforms.uCam=FADE.cam;sh.uniforms.uCut=U;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWPc;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWPc=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uCam;uniform vec4 uCut;varying vec3 vWPc;').replace('void main() {',`void main() {
    {vec2 cp=uCam.xz-uCut.xy,fp=vWPc.xz-uCut.xy;float lc=length(cp),lf=length(fp);
     if(uCut.w>.5&&lc>9.&&lf>12.&&vWPc.y>uCut.z+1.1){float c=dot(fp/lf,cp/lc);float f=1.-smoothstep(.15,.5,c)*smoothstep(9.,13.,lc);
       float dh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(f<dh)discard;}}`)};
  m.customProgramCacheKey=()=>'d5cut'+base.type;return m}
function d5Tether(S,from,e){const m=new THREE.Mesh(D5.tg,D5.tm);m.frustumCulled=false;m.renderOrder=12;scene.add(m);const t={m,from,e,pulse:Math.random()};S.teth.push(t);return t}
function d5TetherTick(S,now){for(let i=S.teth.length-1;i>=0;i--){const t=S.teth[i];if(t.dead||!t.from.m.parent||t.e.dead){scene.remove(t.m);S.teth.splice(i,1);continue}
  const a=DQ.v.copy(t.from.m.position);a.y+=t.from.dprop.cupY||1.4;const b=DQ.v2.copy(t.e.m.position);b.y+=GH(b.x,b.z)-b.y+2.6+(t.e.dqLift||0);t.m.visible=!t.e.hid;
  t.m.position.copy(a);b.sub(a);const l=b.length();if(l<.01)continue;t.m.scale.set(1+.4*Math.sin(now/90+i),l,1+.4*Math.sin(now/90+i));b.multiplyScalar(1/l);t.m.quaternion.setFromUnitVectors(DQ.up,b);
  if(Math.random()<.25){const k=(now/700+t.pulse)%1;burst(DQ.v.copy(a).addScaledVector(b,l*k),0xff2040,1,.2,.3,.4)}}}
function d5Clear(S){(S.teth||[]).forEach(t=>scene.remove(t.m));S.teth=[]}
function d5Hide(on){D5.bats.forEach(b=>{if(!on){b.on=0;b.g.visible=false}})}
// a flock of bats flying from a to b over dur seconds (positions only; reused meshes)
function d5Flock(S,a,b,dur,n,h){const L=D5.bats.filter(q=>!q.on).slice(0,n||14);const f={t:0,dur,a:a.clone(),b:b.clone(),L,h:h||1.6};L.forEach((q,i)=>{q.on=1;q.o=[(Math.random()-.5)*2.6,Math.random()*1.4,(Math.random()-.5)*2.6,Math.random()*.25];q.g.visible=true});
  S.fx.push({tick(dt){f.t+=dt;const k=Math.min(1,f.t/f.dur),now=nowP(),dx=f.b.x-f.a.x,dz=f.b.z-f.a.z,ry=Math.atan2(dx,dz);
    f.L.forEach(q=>{const kk=Math.max(0,Math.min(1,(k-q.o[3]*.3)/(1-q.o[3]*.3))),x=f.a.x+dx*kk+q.o[0]*Math.sin(kk*Math.PI),z=f.a.z+dz*kk+q.o[2]*Math.sin(kk*Math.PI);q.g.position.set(x,GH(x,z)+f.h+q.o[1]+Math.sin(now/120+q.ph)*.2,z);q.g.rotation.y=ry;const w=Math.sin(now/45+q.ph*3)*.9;q.l.rotation.z=w;q.r.rotation.z=-w});
    if(k>=1){f.L.forEach(q=>{q.on=0;q.g.visible=false});return false}return true},end(){f.L.forEach(q=>{q.on=0;q.g.visible=false})}})}
// ---------------- mechanics ----------------
// Blood Chalices: n of the four pedestals, chosen by idx so co-op peers agree
function d5Chalices(e,A,idx){const S=A.dq;if(!S)return;const n=Math.min(4,[0,2,3,4][S.ph]||2),order=[[0,2,1,3],[1,3,0,2],[0,3,1,2],[2,1,3,0]][idx%4];let k=0;
  for(const pi of order){if(k>=n)break;if(S.chal.some(c=>!c._gone&&c.dprop.pi===pi))continue;k++;const [x,z]=D5.ped[pi];
    const g=new THREE.Group(),gm=new THREE.MeshStandardMaterial({color:0xd8a840,metalness:.75,roughness:.3,flatShading:true,emissive:0x3a2008});gm.userData.lps=1;
    const st=new THREE.Mesh(ARKG.cyl6,gm);st.scale.set(.07,.4,.07);st.position.y=1.35;const bs=new THREE.Mesh(ARKG.cyl6,gm);bs.scale.set(.22,.06,.22);bs.position.y=1.16;const cup=new THREE.Mesh(ARKG.cone5,gm);cup.scale.set(.34,.42,.34);cup.rotation.x=Math.PI;cup.position.y=1.72;
    const bl=new THREE.Mesh(ARKG.cyl5,new THREE.MeshBasicMaterial({color:0xc0102a}));bl.scale.set(.3,.03,.3);bl.position.y=1.9;const gl=kqSpr(0xff2040,1.3);gl.position.y=1.95;g.add(st,bs,cup,bl,gl);g.position.y=-1.2;
    let t=0;const p=dqProp(A,x,z,{n:'Blood Chalice',frac:S.ph>=3?.03:.026,mesh:g,hbY:2.5,hbS:.8,cupY:1.9,pi,
      tick(pe,dt,now){t+=dt;g.position.y=-1.2*Math.max(0,1-t/.8);g.rotation.y+=dt*.8;gl.scale.setScalar(1.1+.3*Math.sin(now/150));if(Math.random()<dt*5)burst(gY(pe.m.position,1.95),0xff2040,1,.3,.8,.5)},
      die(pe,killed){gm.dispose();bl.material.dispose();if(killed){burst(gY(pe.m.position,1.7),0xd8a840,24,3,3,.6);burst(gY(pe.m.position,1.6),0xc0102a,30,3,2,.7);popT(pe.m.position,'🩸 SHATTERED','#ffb0c0');sfx&&sfx('brk',.6)}}});
    S.chal.push(p);d5Tether(S,p,e);burst(V(x,GH(x,z)+1.2,z),0xff2040,30,2,3,.6)}
  if(!S.chSeen){S.chSeen=1;banner('🩸 BLOOD CHALICES','They feed Lord Vaelric while they stand','Shatter them!')}else say('🩸 Blood chalices rise again — shatter them before they heal Vaelric!')}
// Bat Swarm
function d5Bats(e,A,en,idx){const S=A.dq,n=[0,2,3,4][S.ph]||2,rng=ARK.rng(1000+idx*37+((S.batN=(S.batN|0)+1)*7)),gap=1.05*en,W=3.4,y0=GH(A.cx,A.cz);
  bxHide(e,true);burst(gY(e.m.position,1.6),0x2a0810,50,3,3,.8);burst(gY(e.m.position,1.6),0xff2040,20,2,2,.6);d5Flock(S,e.m.position,V(A.cx,0,A.cz),.6*en,10,2.6);say('🦇 Vaelric bursts into a swarm of bats!');
  let last=null;for(let k=0;k<n;k++){const th=rng()*Math.PI;dqAfter(S,.55*en+k*gap,()=>{if(!A.f||e.dead)return;const d=V(Math.sin(th),0,Math.cos(th)),c=pl.position,
      // chord of the hall through the hero along d
      ox=c.x-A.cx,oz=c.z-A.cz,b=ox*d.x+oz*d.z,cc=ox*ox+oz*oz-13.4*13.4,disc=Math.sqrt(Math.max(0,b*b-cc)),t0=-b-disc,t1=-b+disc,s=V(c.x+d.x*t0,0,c.z+d.z*t0),f=V(c.x+d.x*t1,0,c.z+d.z*t1),len=t1-t0;
    if(k%2){s.copy(f);f.set(c.x+d.x*t0,0,c.z+d.z*t0);d.multiplyScalar(-1)}last=f;
    dqWarn(S,{x:s.x,z:s.z,y:y0,d,l:len,w:W,t:.95*en,fn:()=>{if(!A.f||e.dead)return;d5Flock(S,s,f,.5,14,1.5);dqAfter(S,.22,()=>{if(!A.f||e.dead)return;shake(.12);
      if(inLine(pl.position,s,d,len,W)&&hero.iv<=0){bossHit(e,1.0);dn(pl.position,'Drained!','#ff6080',-20,800);if(dqAuth(A))e.c.h=Math.min(M(e.c),e.c.h+M(e.c)*.015)}})}})})}
  dqAfter(S,.55*en+n*gap+.6,()=>{if(!A.f||e.dead){bxHide(e,false);return}const q=inArena(A,(last||pl.position).clone(),2.2);e.m.position.set(q.x,0,q.z);bxHide(e,false);burst(gY(q,1.5),0x2a0810,50,3,3,.8);burst(gY(q,1.5),0xff2040,30,3,3,.7);
    dqWarn(S,{x:q.x,z:q.z,r:3,t:.6*en,fn:()=>{if(!A.f||e.dead)return;ring(q,0xff2040,6,350);burst(gY(q,.4),0xff2040,30,4,3,.6);if(d2(pl.position,q)<3&&hero.iv<=0)bossHit(e,.85)}})});
  return .55*en+n*gap+.6+.6*en}
// Crimson Doubles: four Vaelrics around you; only the real one casts a shadow
function d5Mirror(e,A,en,idx){const S=A.dq,c=pl.position.clone(),a0=Math.random()*6.283,real=idx%4,T=2.5*en,y0=GH(A.cx,A.cz),spots=[];
  for(let k=0;k<4;k++){const a=a0+k*Math.PI/2,q=inArena(A,c.clone().add(V(Math.cos(a)*6.5,0,Math.sin(a)*6.5)),2);spots.push(q)}
  burst(gY(e.m.position,1.5),0x2a0810,40,3,3,.7);const M0={done:false,ws:[],clones:[]};S.mir=M0;
  const fire=(o,w)=>{const d=V().subVectors(c,o).setY(0).normalize();return dqWarn(S,{x:o.x,z:o.z,y:y0,d,l:15,w:1.9,t:T,fn:()=>{if(!A.f||e.dead||M0.done)return;kqSweep(A,o,d,15,.3,0xff2040,'orb');
      dqAfter(S,.3,()=>{if(!A.f||e.dead)return;for(let s=1;s<15;s+=1.5)burst(gY(o.clone().addScaledVector(d,s),.6),0xff2040,2,1,1,.4);if(!M0.hit&&inLine(pl.position,o,d,15,1.9)&&hero.iv<=0){M0.hit=1;bossHit(e,1.15)}})}})};
  spots.forEach((q,k)=>{if(k==real){e.m.position.set(q.x,0,q.z);burst(gY(q,1.5),0xff2040,20,2,2,.5);M0.ws.push(fire(q));return}
    const mdl=cr(e.c);mdl.scale.setScalar(e.m.bs);mdl.traverse(o=>{if(o.isMesh){o.castShadow=false}});mdl.rotation.y=Math.atan2(c.x-q.x,c.z-q.z);
    let w=null;const p=dqProp(A,q.x,q.z,{n:'Crimson Double',frac:.014,mesh:mdl,hbY:5.2,hbS:.8,
      tick(pe,dt,now){mdl.rotation.y=Math.atan2(pl.position.x-pe.m.position.x,pl.position.z-pe.m.position.z);try{mdl.ak={n:'bolt',ph:0,k:Math.min(1,(w?w.t:0)/T)};animC(mdl,now,false,0)}catch(err){}if(Math.random()<dt*8)burst(gY(pe.m.position,1+Math.random()*3),0xff2040,1,.3,.6,.5)},
      die(pe,killed){if(w)w.kill();burst(gY(pe.m.position,2),0x2a0810,40,3,3,.7);burst(gY(pe.m.position,2),0xff2040,16,2,2,.5);d5Flock(S,pe.m.position,pe.m.position.clone().add(V((Math.random()-.5)*16,0,(Math.random()-.5)*16)),.7,5,2.4);if(killed)popT(pe.m.position,'✖ A COPY','#ffb0c0')}});
    burst(gY(q,1.5),0xff2040,20,2,2,.5);w=fire(q);M0.clones.push(p)});
  // the real one's shadow
  const sd=new THREE.Mesh(dqG('disc'),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6}));sd.renderOrder=16;scene.add(sd);
  S.fx.push({tick(){if(M0.done||e.dead||!A.f){scene.remove(sd);sd.material.dispose();return false}sd.position.set(e.m.position.x,GH(e.m.position.x,e.m.position.z)+.12,e.m.position.z);sd.scale.setScalar(1.6+.1*Math.sin(nowP()/200));return true},end(){scene.remove(sd);sd.material.dispose()}});
  e.dqOnHit=()=>{if(M0.done)return;M0.done=true;e.dqOnHit=null;M0.ws.forEach(w=>w.kill());M0.clones.slice().forEach(p=>dqPropGone(p,false));popT(e.m.position,'⚡ INTERRUPTED!','#ffe08a',true);
    e.bs.lock=Math.max(e.bs.lock,1.6);e.bs.t=Math.max(e.bs.t,2.0);e.dqVul=nowP()+3000;e.dqVulK=1.25;ring(e.m.position,0xffe08a,4,300);shake(.15)};
  dqAfter(S,T+.5,()=>{if(M0.done)return;M0.done=true;e.dqOnHit=null;M0.clones.slice().forEach(p=>dqPropGone(p,false))});
  if(!S.mirSeen){S.mirSeen=1;banner('🪞 CRIMSON DOUBLES','Only the real Vaelric casts a shadow','Strike him to shatter the copies')}else say('🪞 Vaelric splits — find the one with a shadow!');
  return T+.6}
// Blood Moon
function d5Moon(e,A,en,idx){const S=A.dq;if(S.moon)return 0;const rng=ARK.rng(300+idx*53+(S.moonN=(S.moonN|0)+1)*11),n=S.ph>=3?2:3,spots=[];
  for(let tries=0;spots.length<n&&tries<60;tries++){const a=rng()*6.283,r=3.5+rng()*7,x=A.cx+Math.cos(a)*r,z=A.cz+Math.sin(a)*r;if(solid(x,z)||spots.some(s=>Math.hypot(s.x-x,s.z-z)<6))continue;spots.push({x,z,a,r,va:(rng()<.5?-1:1)*(.12+rng()*.08)})}
  S.moon={t:0,warn:3.4*Math.min(1.2,en/1.1),dur:6.5,spots,hz:0};D5.flood.visible=D5.ripple.visible=true;
  spots.forEach((s,k)=>{const m=D5.moon[k];m.g.visible=true;m.s=s});
  banner('🌑 BLOOD MOON','The hall floods with blood','Stand in the pale moonlight!');shake(.2);return S.moon.warn}
function d5MoonTick(A,e,dt,now){const S=A.dq,Mn=S.moon;if(!Mn)return;Mn.t+=dt;const y0=GH(A.cx,A.cz),w=Mn.warn,end=w+Mn.dur,fin=end+1.3;
  const k=Mn.t<w?Mn.t/w:Mn.t<end?1:Math.max(0,1-(Mn.t-end)/1.3),flood=Mn.t>=w&&Mn.t<end;
  D5.flood.material.opacity=Mn.t<w?.22*k:.72*k;D5.flood.position.y=y0+.1+.06*k;D5.ripple.material.opacity=(flood?.18:.06)*k;D5.ripple.rotation.y+=dt*.15;if(D5.tint)D5.tint.style.opacity=(.55+.25*Math.sin(now/300))*k;
  Mn.spots.forEach((s,i)=>{const m=D5.moon[i];if(S.ph>=3&&Mn.t>w*.6){s.a+=s.va*dt;s.x=A.cx+Math.cos(s.a)*s.r;s.z=A.cz+Math.sin(s.a)*s.r}const rr=2.3;m.g.position.set(s.x,y0,s.z);m.d.scale.setScalar(rr);m.ed.scale.setScalar(rr);m.sh.scale.set(rr,16,rr);m.sh.position.y=8;
    m.d.material.opacity=.32*Math.min(1,Mn.t/1)*(Mn.t>end?k:1);m.ed.material.opacity=.8*Math.min(1,Mn.t/1)*(Mn.t>end?k:1);m.sh.material.opacity=.55*Math.min(1,Mn.t/1)*(Mn.t>end?k:1);m.sh.visible=true});
  if(flood&&Math.random()<dt*14){const a=Math.random()*6.283,r=Math.random()*14;burst(V(A.cx+Math.cos(a)*r,y0+.2,A.cz+Math.sin(a)*r),0xc01028,2,.6,1,.6)}
  if(flood){const safe=Mn.spots.some(s=>Math.hypot(pl.position.x-s.x,pl.position.z-s.z)<2.3);if(!safe){dqDebuff('Wading','🩸',{mspd:-.2},500,'Wading through blood');Mn.hz-=dt;if(Mn.hz<=0&&hero.iv<=0&&!e.dead){Mn.hz=.5;bossHit(e,.34);if(dqAuth(A))e.c.h=Math.min(M(e.c),e.c.h+M(e.c)*.004)}}else Mn.hz=Math.min(Mn.hz,.15)}
  if(Mn.t>=fin)d5MoonEnd(A)}
function d5MoonEnd(A){const S=A.dq;if(S)S.moon=null;D5.flood.visible=D5.ripple.visible=false;D5.flood.material.opacity=0;D5.moon.forEach(m=>{m.g.visible=false});if(D5.tint)D5.tint.style.opacity=0;dqUndebuff('Wading')}
// The Crimson Rite
function d5Rite(e,A,en){const S=A.dq;if(S.rite||S.riteDone)return;S.riteDone=1;const T=24,R={t:0,T,ob:[],harass:2.5,fin:false};S.rite=R;
  if(S.mir&&!S.mir.done&&e.dqOnHit)e.dqOnHit();if(S.moon)d5MoonEnd(A);if(e.hid)bxHide(e,false);e.bs.dash=null;
  const [tx,tz]=D5.L(10.4,0);burst(gY(e.m.position,1.5),0x2a0810,40,3,3,.7);e.m.position.set(tx,0,tz);burst(V(tx,GH(tx,tz)+2,tz),0xff2040,60,4,4,.9);
  e.dqImm='Warded';e.dqLift=0;const bar=new THREE.Mesh(dqG('ico'),new THREE.MeshBasicMaterial({color:0xff2040,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(bar);R.bar=bar;
  D5.sigil.visible=true;banner('🩸 THE CRIMSON RITE','Vaelric is warded while the blood obelisks feed the sigil','Destroy all four obelisks!');shake(.4);flash&&flash('rgba(255,30,60,.35)');
  for(let k=0;k<4;k++){const a=D5.fa+Math.PI/4+k*Math.PI/2,x=A.cx+Math.cos(a)*6.3,z=A.cz+Math.sin(a)*6.3;
    const g=new THREE.Group(),om=new THREE.MeshStandardMaterial({color:0x2a1a22,roughness:.5,flatShading:true,emissive:0x3a0008});om.userData.lps=1;const o=new THREE.Mesh(ARKG.box,om);o.scale.set(.75,3.6,.75);o.position.y=1.8;const tp=new THREE.Mesh(ARKG.cone4,om);tp.scale.set(.55,.8,.55);tp.position.y=4.0;tp.rotation.y=Math.PI/4;
    const rm=new THREE.MeshBasicMaterial({color:0xff2040});[.9,1.7,2.5,3.2].forEach((h,i)=>{for(let s=0;s<4;s++){const q=new THREE.Mesh(ARKG.box,rm);q.scale.set(.32,.1,.02);q.position.set(Math.sin(s*Math.PI/2)*.39,h,Math.cos(s*Math.PI/2)*.39);q.rotation.y=s*Math.PI/2;if(i%2)q.rotation.z=.6;g.add(q)}});
    const gl=kqSpr(0xff2040,1.6);gl.position.y=4.3;g.add(o,tp,gl);g.position.y=-4.4;let t=0;
    const p=dqProp(A,x,z,{n:'Blood Obelisk',frac:.036,mesh:g,hbY:5.0,hbS:1,cupY:4.2,
      tick(pe,dt,now){t+=dt;g.position.y=-4.4*Math.max(0,1-t/1.1);gl.scale.setScalar(1.4+.4*Math.sin(now/130+k));if(Math.random()<dt*6)burst(gY(pe.m.position,1+Math.random()*3),0xff2040,1,.3,1,.5)},
      die(pe,killed){om.dispose();rm.dispose();burst(gY(pe.m.position,2),0x2a1a22,40,4,4,.8);burst(gY(pe.m.position,3),0xff2040,30,3,3,.7);if(killed){popT(pe.m.position,'⛓ OBELISK BROKEN','#ffb0c0');shake(.2);sfx&&sfx('brk',.7)}}});
    R.ob.push(p);d5Tether(S,p,e)}
  if(D5.riteEl)D5.riteEl.style.display='block'}
function d5RiteEnd(A,e,broken){const S=A.dq,R=S.rite;if(!R||R.fin)return;R.fin=true;S.rite=null;e.dqImm=0;e.dqLift=0;if(R.bar){scene.remove(R.bar);R.bar.material.dispose()}
  R.ob.slice().forEach(p=>dqPropGone(p,false));D5.sigil.visible=false;D5.sigil.material.opacity=0;if(D5.riteEl)D5.riteEl.style.display='none';
  if(broken){S.stun=4.5;e.dqVul=nowP()+6500;e.dqVulK=1.5;e.bs.lock=Math.max(e.bs.lock,4.5);e.bs.t=Math.max(e.bs.t,5);banner('⛓ THE RITE IS BROKEN','Vaelric crashes to the floor','+50% damage — strike now!');ring(e.m.position,0xffe08a,6,500);shake(.5);burst(gY(e.m.position,1.5),0xff2040,80,5,4,1)}
  else{flash&&flash('rgba(255,20,40,.6)');shake(.8);for(let k=0;k<50;k++){const a=Math.random()*6.283,r=Math.random()*14;burst(V(A.cx+Math.cos(a)*r,GH(A.cx,A.cz)+.4,A.cz+Math.sin(a)*r),0xff2040,4,3,4,.8)}ring(V(A.cx,0,A.cz),0xff2040,14,700);
    if(hero.iv>0)dn(pl.position,'Dodged!','#bfe3ff',-20,1200);else{const d=Math.round(heroMax()*.55);hero.hp-=d;hero.lastHit=nowP();heroFlinch&&heroFlinch();dn(pl.position,d,'#ff3a2a');if(hero.hp<=0)down()}
    if(dqAuth(A))e.c.h=Math.min(M(e.c),e.c.h+M(e.c)*.1);banner('🩸 CRIMSON CATACLYSM','The rite is complete — Vaelric drinks deep','')}}
// ---------------- BMV moves (relayed to co-op peers) ----------------
kqBmv('bloodfan',function(e,A,en){const S=A.dq,o=e.m.position.clone(),a0=Math.atan2(pl.position.x-o.x,pl.position.z-o.z),n=[0,3,4,5][S?S.ph:1]||3,T=.95*en;let hit=false;kqBossCast(e,0xff2040,T*800);dqPose(e,'bolt',T*.8,.3);
  for(let i=0;i<n;i++){const da=(i-(n-1)/2)*.3,d=V(Math.sin(a0+da),0,Math.cos(a0+da));kqSweep(A,o,d,15,T,0xff2040,'orb');
    tele(o,0,T,()=>{if(!A.f)return;for(let s=1;s<15;s+=1.3)burst(gY(o.clone().addScaledVector(d,s),.6),0xff2040,2,1,1.5,.4);if(!hit&&inLine(pl.position,o,d,15,1.9)&&hero.iv<=0){hit=true;bossHit(e,1.1)}},{w:1.9,l:15,d})}
  return {d:1.5*en,lock:1}});
kqBmv('batswarm',function(e,A,en){const S=A.dq;if(!S||S.rite)return BMV.bloodfan(e,A,en);const d=d5Bats(e,A,en,dqDec(en));return {d,lock:1}});
kqBmv('mirror',function(e,A,en){const S=A.dq;if(!S||S.rite||(S.mir&&!S.mir.done))return BMV.bloodfan(e,A,en);const d=d5Mirror(e,A,en,dqDec(en));return {d,lock:1}});
kqBmv('bloodmoon',function(e,A,en){const S=A.dq;if(S&&!S.rite)d5Moon(e,A,en,dqDec(en));return {d:.6*en,lock:0}});
kqBmv('chalices',function(e,A,en){const S=A.dq;if(S){kqBossCast(e,0xff2040,500);d5Chalices(e,A,dqDec(en))}return {d:.8*en,lock:0}});
kqBmv('rite',function(e,A,en){const S=A.dq;if(S)d5Rite(e,A,en);return {d:.5,lock:0}});
kqBmv('riteend',function(e,A,en){const S=A.dq;if(S&&S.rite)d5RiteEnd(A,e,dqDec(en)===0);return {d:.5,lock:0}});
// ---------------- den hooks ----------------
DEN[5]={
  build:d5Build,
  start(A,e){const S=dqState(A);dqReset(S);d5Clear(S);Object.assign(S,{ph:1,chal:[],teth:[],chT:3.5,chFirst:1,moonT:0,moon:null,mir:null,rite:null,riteDone:0,stun:0,healAcc:0,healT:0});
    BSTY[5]=Object.assign(BSTY[5]||{m:'blink',sp:1.8},{m:'blink',sp:1.8,pool:[['bloodfan','dive','batswarm'],['mirror','beam','bloodfan','prison'],['batswarm','cross','mirror','bloodfan']]});
    e.dqImm=0;e.dqLift=0;e.dqOnHit=null;setTimeout(()=>{if(A.f)say('🩸 The Crimson Throne Hall: shatter the blood chalices, watch for the one true shadow, and seek the moonlight when the Blood Moon rises.')},2400)},
  ai(A,e,dt,now){const S=A.dq;if(!S)return false;
    if(S.rite){const R=S.rite,m=e.m;e.agg=1;const v=V().subVectors(pl.position,m.position);m.rotation.y=Math.atan2(v.x,v.z);animC(m,now,false,0);bxTick(A,e,dt,now);
      e.dqLift=Math.min(2.2,(e.dqLift||0)+dt*2);m.b.position.y+=(e.dqLift+Math.sin(now/400)*.15)/(m.bs||1);if(m.ak==null)m.ak={n:'rainfire',ph:0,k:1};return true}
    if(S.stun>0){S.stun-=dt;animC(e.m,now,false,0);bxTick(A,e,dt,now);e.m.ak={n:'slam',ph:2,k:Math.min(1,S.stun)};if(Math.random()<dt*6)burst(gY(e.m.position,3.6),0xffe08a,1,.6,.4,.5);if(S.stun<=0)e.m.ak=null;return true}
    return false},
  tick(A,e,dt,now){const S=A.dq;if(!S||!S.chal)return;dqRun(S,dt);d5TetherTick(S,now);const auth=dqAuth(A),ph=e.bs.ph||1;
    if(ph>S.ph){S.ph=ph;if(ph==2){S.chT=Math.min(S.chT,2.5);S.moonT=7}if(ph==3){dqAfter(S,1.2,()=>{if(A.f&&!e.dead)dqCast(e,A,'rite',1.2)})}}
    S.chal=S.chal.filter(p=>!p._gone);
    if(auth&&!e.dead){
      if(!S.rite&&!S.chal.length){S.chT-=dt;if(S.chT<=0){S.chT=S.ph>=3?20:26;dqCast(e,A,'chalices',dqEnc(1.2,(Math.random()*4)|0))}}
      if(S.ph>=2&&!S.rite&&!S.moon){S.moonT-=dt;if(S.moonT<=0){S.moonT=S.ph>=3?20:25;dqCast(e,A,'bloodmoon',dqEnc(1.2,(Math.random()*10)|0))}}
      // chalices heal him
      const n=S.chal.length;if(n){const h=M(e.c)*[0,.004,.005,.006][S.ph]*n*dt,h0=e.c.h;e.c.h=Math.min(M(e.c),e.c.h+h);S.healAcc+=e.c.h-h0}
      S.healT-=dt;if(S.healT<=0){S.healT=1.2;if(S.healAcc>=1){dn(e.m.position,'+'+Math.round(S.healAcc),'#ff7090',-50,900);S.healAcc=0}}
      // the rite: harass from the throne, then complete
      const R=S.rite;if(R){R.harass-=dt;if(R.harass<=0){R.harass=3.3;dqCast(e,A,R.hk=!R.hk?'rain':'bloodfan',1.2)}
        if(R.ob.every(p=>p._gone))dqCast(e,A,'riteend',dqEnc(1.2,0));else if(R.t>=R.T)dqCast(e,A,'riteend',dqEnc(1.2,1))}}
    const R=S.rite;if(R){R.t+=dt;const k=Math.min(1,R.t/R.T);D5.sigil.material.opacity=.35+.5*k+.12*Math.sin(now/(200-120*k));D5.sigil.rotation.y=0;
      if(R.bar){R.bar.position.set(e.m.position.x,GH(e.m.position.x,e.m.position.z)+2.6+(e.dqLift||0),e.m.position.z);R.bar.scale.setScalar(2.4+.1*Math.sin(now/150));R.bar.material.opacity=.18+.08*Math.sin(now/120)}
      const b=$('d5riteB');if(b)b.style.width=(k*100).toFixed(1)+'%';const tl=$('d5riteT');if(tl)tl.textContent='🩸 THE CRIMSON RITE · '+R.ob.filter(p=>!p._gone).length+' obelisk'+(R.ob.filter(p=>!p._gone).length==1?'':'s')+' left · '+Math.max(0,Math.ceil(R.T-R.t))+'s';
      if(R.T-R.t<3.2&&!R.warned){R.warned=1;banner('⚠ THE RITE IS ALMOST COMPLETE','Dash the moment it ends!','');dqWarn(S,{x:A.cx,z:A.cz,r:13.6,t:Math.max(.5,R.T-R.t)})}
      if(!auth&&R.t>R.T+3)d5RiteEnd(A,e,R.ob.every(p=>p._gone))}
    d5MoonTick(A,e,dt,now);
    // stained glass and moat breathe with the phases
    if(D5.cur.visible)D5.cur.material.opacity=.42+.1*Math.sin(now/240)},
  clear(A,won){const S=A.dq;if(!S)return;if(S.rite){S.rite.fin=true;if(S.rite.bar)scene.remove(S.rite.bar);S.rite=null}dqReset(S);d5Clear(S);d5MoonEnd(A);S.chal=[];S.mir=null;S.stun=0;
    D5.sigil.visible=false;if(D5.riteEl)D5.riteEl.style.display='none';D5.bats.forEach(b=>{b.on=0;b.g.visible=false});
    const e=bossEnt(A.i)||enemies.find(q=>q.ar===A.i);if(e){e.dqImm=0;e.dqLift=0;e.dqOnHit=null;e.dqVul=0;e.bs.face=0;if(e.m)e.m.ak=null;if(e.hid)bxHide(e,false)}
    if(won){const y0=GH(A.cx,A.cz);flash&&flash('rgba(255,60,80,.4)');for(let k=0;k<4;k++){const [x,z]=D5.ped[k];burst(V(x,y0+1.2,z),0xffd060,30,3,4,.9)}ring(V(A.cx,0,A.cz),0xffd060,12,900)}},
  seal(A,on){const g=D5.gate,c=D5.cur;if(on){c.visible=true;tw(450,k=>{g.position.y=5.6*(1-k*k)},()=>{shake(.3)});tw(700,k=>c.material.opacity=.45*k)}
    else{tw(1500,k=>{g.position.y=5.6*k});tw(800,k=>c.material.opacity=.45*(1-k),()=>{if(!A.f)c.visible=false})}}
};
