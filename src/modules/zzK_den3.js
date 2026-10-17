// ================= v86 den 3: The Sunken Pit — Ssith'ra the Endless, Devourer of the Searing Sands =================
// The den: a sand-drowned amphitheatre. Rippled sand slopes down to a dark sinkhole at the heart; three tiers of broken
// sandstone seating ring the pit with half-buried columns on top; the bones of a colossal serpent arch over the back wall;
// two obelisks flank the way in, and four great columns stand half-sunk in the arena floor.
// Signature mechanics (on top of tail sweep / acid spit / meteor mines):
//  1. QUICKSAND VORTEX — the sinkhole churns (swirl speeds up, sand rings rush inward, 1s warning) and drags you toward
//                        the pit for 6s; its core (2.6) grinds you (damage + 'Sinking' slow). Walk or dash against it.
//                        Pull 1.5 / 2.0 / 2.6 by phase; forced on entering Phase III.
//  2. BURROW & ERUPT   — it dives (big sand burst); a moving sand mound hunts you, stops, a red circle marks the spot and it
//                        bursts out. Phase II+ adds three sand geysers around it; Phase III dives twice. After the final
//                        eruption it is EXPOSED for 2.8s: ×1.6 damage (gold marker, "WEAK POINT").
//  3. RAM              — a long red lane: it charges to the wall. Lure it into one of the four half-sunk columns and it
//                        smashes the column and gets its head STUCK for 3.6s (×1.6 damage). Columns stay broken for the
//                        fight. Phase III rams twice when it misses.
//  4. SANDSTORM        — Phase II signature (forced on entering it): thick dust and driving sand cut visibility for 8s while
//                        its body segments lash up out of the sand under you (red circles, one every 0.7s / 0.5s in III).
// Co-op: all start from relayed BMV moves; damage is local to each player; the player who runs the boss moves it while
// it burrows (others follow the synced position). Exposure multiplies damage before co-op relays it.
var SS={tm:null,scr:new THREE.Vector3(),atm:null};
function ssAuth(A){return !(typeof MP!='undefined'&&MP.on&&AF&&AF.i===A.i&&typeof mpBossAuth=='function'&&mpBossAuth(A.i)!==MP.me)}
function ssEntA(A){const p=PMAP[A.i],P=p.path||[];let q=p.wp[p.wp.length-2];for(let k=P.length-1;k>=0;k--){if(Math.hypot(P[k][0]-A.cx,P[k][1]-A.cz)>21){q=P[k];break}}return Math.atan2(q[1]-A.cz,q[0]-A.cx)}
const ssAD=(a,b)=>{let d=a-b;return Math.atan2(Math.sin(d),Math.cos(d))};
const SS_COL=0xff7a30,SS_SAND=0xd9b273,SS_CORE=3.0;
function ssTM(x,y,z,sx,sy,sz,qx,qy,qz,ang,spin){const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(qx,qy,qz).normalize(),ang),q2=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),spin||0);
  return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),q.multiply(q2),new THREE.Vector3(sx,sy,sz))}
// a centipede segment chain bursting out of the sand (used by the sandstorm lashes)
function ssTail(R){const S=arkSoup(8800+(R()*1000|0)),dk=0x6a2a18,or=SS_COL;
  for(let i=0;i<6;i++){const y=i*.55,r=.5-i*.06,c=i%2?dk:arkMix(or,dk,.25);S.geo(ARKG.cyl6,arkM4(Math.sin(i*.5)*.18,y+.3,0,r,.5,r*.9,0,i*.4,Math.sin(i*.6)*.15),c,.1);
    [-1,1].forEach(s=>S.geo(ARKG.cone4,arkM4(s*(r+.22),y+.3,0,.07,.5,.07,0,0,s*1.9),0x2a1208))}
  S.geo(ARKG.cone5,arkM4(Math.sin(3)*.18,3.65,0,.2,.8,.2),0xffd0a0);
  const m=S.mesh();m.visible=false;return m}
function ssBuild(A){
  const R=ARK.rng(8100+A.i),y0=GH(A.cx,A.cz),ea=ssEntA(A),GAP=.38,cx=A.cx,cz=A.cz;
  const D=A.dn={ea,cols:[],ph:1,vx:null,st:null,er:null,ram:null,vxCD:0,stCD:0,tails:[],buff:null,swS:.25,ok:false};
  const inGap=a=>Math.abs(ssAD(a,ea))<GAP,P=(a,r)=>[cx+Math.cos(a)*r,cz+Math.sin(a)*r];
  const sand=SS_SAND,sandD=0xb98d52,stone=0xc49a64,stoneD=0x8a6440,bone=0xe6d8b8;
  // ---- floor: rippled sand sloping into the sinkhole ----
  const F=arkSoup(8200+A.i);
  [[4.2,5.2,16],[5.2,6.2,18],[6.2,8.0,22],[8.0,9.9,26],[9.9,11.9,30],[11.9,13.9,34],[13.9,15.9,40]].forEach(([r0,r1,n],ri)=>{const off=R()*6.283;
    for(let k=0;k<n;k++){const a0=off+k/n*6.283,a1=off+(k+1)/n*6.283,pts=[P(a0,r0),P(a0+.003,r1),P(a1+.003,r1),P(a1,r0)],t=ri/6;
      const yt=pts.map((p,i)=>GH(p[0],p[1])+.05+(i==1||i==2?(ri+1):ri)*.025+R()*.04),c=arkMix(arkMix(0xa87a44,sand,Math.min(1,t*1.6)),0xffe6b0,R()*.12);F.slab(pts,yt,y0-.25,c,sandD)}});
  // ripples: thin raised arcs
  for(let r=5.0;r<15.4;r+=.75){const n=Math.round(r*4),off=R()*6.283;for(let k=0;k<n;k++){if(R()<.35)continue;const a0=off+k/n*6.283,a1=a0+5.2/n+R()*.02,w=.09,rr=r+Math.sin(a0*3+r)*.25,yy=y0+.07+(r-3.2)/12.7*.17+.04;
    const p=(q,a)=>{const [x,z]=P(a,q);return [x,yy,z]};F.quad(p(rr-w,a0),p(rr-w,a1),p(rr+w,a1),p(rr+w,a0),arkShade(sand,.82),.08)}}
  // the sinkhole: darker rings toward the middle
  for(let i=0;i<10;i++){const r0=i*.42,r1=(i+1)*.42,n=28,c=arkMix(0x140a04,0xa87a44,Math.pow(i/9.5,1.4));for(let k=0;k<n;k++){const a0=k/n*6.283,a1=(k+1)/n*6.283,p=(q,a)=>{const [x,z]=P(a,q);return [x,y0+.06+i*.004,z]};
    if(i==0)F.tri(p(0,0),p(r1,a1),p(r1,a0),c,.06);else F.quad(p(r0,a0),p(r0,a1),p(r1,a1),p(r1,a0),c,.06)}}
  // bones in the sand
  for(let k=0;k<20;k++){const a=R()*6.283,r=5+R()*9.5;if(inGap(a)&&r>12)continue;const [x,z]=P(a,r),y=y0+.12;
    if(k%4==0){F.geo(ARK.rock[k%4],arkM4(x,y+.12,z,.28,.24,.34,0,R()*6),bone);F.geo(ARKG.box,arkM4(x+.12,y+.06,z,.08,.06,.1,0,R()*6),0x2a2018)}
    else if(k%4==1){for(let q=0;q<4;q++)F.geo(ARKG.cyl5,ssTM(x+q*.18,y+.05,z+(R()-.5)*.3,.05,.9,.05,1,0,0,1.5,R()),bone)}
    else if(k%4==2)F.geo(ARKG.box,ssTM(x,y,z,.16,.12,1.4,0,1,0,R()*3,0),bone);
    else F.geo(ARK.rock[k%4],arkM4(x,y,z,.6+R()*.5,.15,.5+R()*.4,0,R()*6),arkShade(stone,.9))}
  const floor=F.mesh();floor.castShadow=false;A.g.add(floor);
  // ---- the amphitheatre: three broken sandstone tiers, columns on top, dunes spilling down ----
  const S=arkSoup(8300+A.i);
  for(let t=0;t<3;t++){const r0=15.9+t*1.9,r1=r0+1.95,h=.8*(t+1),n=Math.round(r1*6.283/2.7),off=R()*.3;
    for(let k=0;k<n;k++){const a0=off+k/n*6.283+.005,a1=off+(k+1)/n*6.283-.005,am=(a0+a1)/2;if(inGap(am))continue;if(R()<.07)continue;
      const sink=R()<.15?R()*.4:0,tl=0,pts=[P(a0,r0),P(a0,r1),P(am,r1),P(a1,r1),P(a1,r0),P(am,r0)],yb=GH(pts[0][0],pts[0][1]);if(yb<y0-1)continue;
      const yt=pts.map((p,i)=>Math.max(GH(p[0],p[1]),y0)+h-sink+(i<3?tl:-tl)*.5),c=arkShade(0xd6b680,.93+R()*.1);S.slab(pts,yt,y0-.3,c,arkShade(0xa47a4a,.85+R()*.2))}}
  // dunes heaped against the tiers
  for(let k=0;k<60;k++){const a=k/60*6.283+R()*.08;if(inGap(a))continue;const r=15.4+R()*2.6,[x,z]=P(a,r),s=1.2+R()*1.3,y=Math.max(GH(x,z),y0);
    S.geo(ARK.rock[k%4],arkM4(x,y+.1,z,s*1.5,.5+R()*.9,s,0,a+1.57),(cy,n)=>n.y>.25?arkMix(sand,0xf2d8a0,R()*.4):sandD,.08)}
  // columns on the top tier: standing, broken, toppled
  for(let k=0;k<26;k++){const a=k/26*6.283+.1;if(Math.abs(ssAD(a,ea))<GAP+.12)continue;const r=21.1,[x,z]=P(a,r),y=Math.max(GH(x,z),y0)+2.55;if(GH(x,z)<y0-1)continue;
    const kind=k%3;if(kind==2&&R()<.6){const b=a+1.57+(R()-.5)*.6;S.geo(ARKG.cyl6,ssTM(x,y+.4,z,.42,3.6,.42,Math.cos(b),0,Math.sin(b),1.5,0),arkShade(stone,.95));continue}
    const h=kind==0?4.5+R()*1.6:1.5+R()*1.8;S.geo(ARKG.cyl6,arkM4(x,y+h/2,z,.42,h,.42,(R()-.5)*.06,R(),(R()-.5)*.06),arkShade(stone,.95+R()*.15));
    S.geo(ARKG.box,arkM4(x,y+.12,z,1.05,.25,1.05,0,a),arkShade(stone,.8));if(kind==0){S.geo(ARKG.box,arkM4(x,y+h+.15,z,1.1,.3,1.1,0,a),arkShade(stone,1.05));if(k%2==0)S.geo(ARKG.box,arkM4(x+Math.cos(a+1.57)*1.4,y+h+.5,z+Math.sin(a+1.57)*1.4,2.6,.4,.7,0,-a),arkShade(stone,.9))}}
  // the obelisks at the way in, with a fallen block between
  [-1,1].forEach(s=>{const a=ea+s*(GAP+.04),[x,z]=P(a,16.6),y=Math.max(GH(x,z),y0);S.geo(ARKG.box,arkM4(x,y+.3,z,1.6,.6,1.6,0,-a),arkShade(stone,.75));
    S.geo(ARKG.cyl5,arkM4(x,y+3.6,z,.75,6.2,.75,0,.6,0),arkShade(stone,1.02));S.geo(ARKG.cone5,arkM4(x,y+7.3,z,.75,1.3,.75,0,.6,0),0xe8c070);
    for(let q=0;q<3;q++)S.geo(ARKG.cyl5,arkM4(x,y+1.6+q*1.6,z,.8,.12,.8,0,.6,0),arkShade(stoneD,.9));
    S.geo(ARK.rock[s>0?0:3],arkM4(x+Math.cos(a)*1.2,y+.3,z+Math.sin(a)*1.2,1.3,.7,1.1,0,a),(cy,n)=>n.y>.4?sand:sandD)});
  // the bones of a colossal serpent arching over the back of the pit
  {const ab=ea+Math.PI;for(let k=-7;k<=7;k++){const a=ab+k*.085,[x,z]=P(a,20.2),y=Math.max(GH(x,z),y0)+2.6;S.geo(ARK.rock[(k+8)%4],arkM4(x,y+.35,z,.8,.6,.9,0,a),bone);
      if(k%2==0&&Math.abs(k)<7){[0].forEach(()=>{let px=x,pz=z,py=y+.5;for(let s=0;s<7;s++){const u=(s+1)/7,r=20.2-u*4.4,h=y+.5+Math.sin(u*Math.PI*.85)*6.2,[nx,nz]=P(a+(k<0?-1:1)*u*.05,r),mx=(px+nx)/2,mz=(pz+nz)/2,my=(py+h)/2,L=Math.hypot(nx-px,nz-pz,h-py);
        const dir=new THREE.Vector3(nx-px,h-py,nz-pz).normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir),M=new THREE.Matrix4().compose(new THREE.Vector3(mx,my,mz),q,new THREE.Vector3(.24-s*.02,L+.12,.27-s*.02));
        S.geo(ARKG.cyl6,M,arkShade(bone,.92+s*.02),.06);px=nx;pz=nz;py=h}})}}
    const [sx,sz]=P(ab+.75,19.4),sy=Math.max(GH(sx,sz),y0)+2.6,fa=-(ab+.75)+Math.PI;S.geo(ARK.rock[2],arkM4(sx,sy+.9,sz,1.5,1.0,2.4,0,fa),bone);S.geo(ARKG.box,ssTM(sx,sy+.3,sz,1.6,.35,2.2,1,0,0,.3,fa),arkShade(bone,.9));
    [-1,1].forEach(q=>{S.geo(ARKG.oct,arkM4(sx+Math.cos(fa)*q*.6,sy+1.2,sz-Math.sin(fa)*q*.6,.32,.22,.3),0x1a0e08);S.geo(ARKG.cone5,ssTM(sx+Math.cos(fa)*q*.5,sy+.1,sz-Math.sin(fa)*q*.5,.15,.9,.15,1,0,0,Math.PI,0),bone)})}
  // a toppled statue head half-buried to the side
  {const a=ea+2.1,[x,z]=P(a,17.2),y=Math.max(GH(x,z),y0)+1.1;S.geo(ARKG.box,ssTM(x,y+.6,z,1.6,2.0,1.4,Math.cos(a),0,Math.sin(a),.5,-a),arkShade(stone,1.05));S.geo(ARKG.box,ssTM(x+.2,y+1.0,z,.4,.25,.9,Math.cos(a),0,Math.sin(a),.5,-a),0x2a1a10);S.geo(ARKG.cone4,ssTM(x,y+1.9,z,1.0,.9,1.0,Math.cos(a),0,Math.sin(a),.5,-a+.78),0xe8c070)}
  A.g.add(S.mesh());
  // ---- the four half-sunk columns inside the pit (the ram smashes them) ----
  for(let k=0;k<4;k++){const a=ea+Math.PI/4+k*Math.PI/2,[x,z]=P(a,8.6),y=GH(x,z),lean=.12+R()*.08,la=R()*6.283;
    const C=arkSoup(8400+k),tm=(yy,h,s)=>ssTM(x+Math.cos(la)*lean*yy,y+yy,z+Math.sin(la)*lean*yy,s,h,s,-Math.sin(la),0,Math.cos(la),-lean,R());
    C.geo(ARKG.cyl6,tm(1.5,3.0,.85),(cy,n)=>arkShade(stone,.85+(cy-y)*.06),.12);C.geo(ARKG.cyl6,tm(.35,.4,1.05),arkShade(stone,.8));C.geo(ARKG.box,tm(3.15,.35,1.25),arkShade(stone,1.05));
    for(let q=0;q<4;q++){const b=q*1.57+la,rr=1.1;C.geo(ARK.rock[q],arkM4(x+Math.cos(b)*rr,y+.05,z+Math.sin(b)*rr,.9,.35,.8,0,b),(cy,n)=>n.y>.3?sand:sandD,.08)}
    const col=C.mesh();A.g.add(col);
    const B2=arkSoup(8500+k);for(let q=0;q<8;q++){const b=R()*6.283,rr=R()*1.6;B2.geo(ARK.rock[q%4],arkM4(x+Math.cos(b)*rr,y+.15,z+Math.sin(b)*rr,.35+R()*.4,.25+R()*.3,.35+R()*.3,R(),R()*6,0),arkShade(stone,.8+R()*.3))}
    B2.geo(ARKG.cyl6,tm(.4,.7,.85),arkShade(stone,.85));const rub=B2.mesh();rub.visible=false;A.g.add(rub);
    const tiles=[[0,0],[1,0],[-1,0],[0,1],[0,-1]].map(([i,j])=>[Math.round(x)+i,Math.round(z)+j]);tiles.forEach(t=>denBlock(t[0],t[1]));
    D.cols.push({x,z,p:new THREE.Vector3(x,0,z),col,rub,tiles,ok:true})}
  // ---- the sinkhole swirl (spins faster when the vortex wakes) ----
  {const W=arkSoup(8600);for(let arm=0;arm<5;arm++){for(let s=0;s<16;s++){const u0=s/16,u1=(s+1)/16,f=(u,o)=>{const r=.4+u*3.9,a=arm/5*6.283+u*2.6+o;return [Math.cos(a)*r,.0,Math.sin(a)*r]},w=.18*(1-u0*.5);
      W.quad(f(u0,-w),f(u0,w),f(u1,w),f(u1,-w),arkMix(0x2a1608,0xe8c890,u0*.9),.08)}}
    const sw=W.mesh(new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide}));sw.material.userData.lps=1;sw.castShadow=sw.receiveShadow=false;sw.position.set(cx,y0+.1,cz);sw.renderOrder=3;A.g.add(sw);D.sw=sw}
  // inward-rushing sand rings for the vortex
  D.vr=[0,1,2].map(i=>{const m=new THREE.Mesh(new THREE.RingGeometry(.94,1,64).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xf0d090,transparent:true,opacity:0,depthWrite:false,depthTest:false,side:THREE.DoubleSide}));
    m.position.set(cx,y0+.14,cz);m.renderOrder=18;m.visible=false;A.g.add(m);return m});
  // the burrowing mound and the exposure marker
  {const M=arkSoup(8700);M.geo(ARK.rock[0],arkM4(0,0,0,1.6,.7,1.9),(cy,n)=>n.y>.3?arkMix(sand,0xf0d8a0,.3):sandD,.1);for(let q=0;q<5;q++){const b=q*1.26;M.geo(ARK.rock[q%4],arkM4(Math.cos(b)*1.5,0,Math.sin(b)*1.5,.5,.3,.5,0,b),sandD)}
    const m=M.mesh();m.visible=false;scene.add(m);D.mound=m}
  {const g=new THREE.Group(),s1=kqSpr(0xffd040,2.2),r=new THREE.Mesh(new THREE.RingGeometry(.8,1,32),new THREE.MeshBasicMaterial({color:0xffd040,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide}));r.renderOrder=22;g.add(s1,r);g.visible=false;scene.add(g);D.mark=g;D.markR=r}
  // the lashing tails (a small pool, reused)
  for(let k=0;k<6;k++){const m=ssTail(R);A.g.add(m);D.tails.push({m,t:0,p:new THREE.Vector3()})}
  // ---- the seal: a curtain of whirling sand ----
  {const g=new THREE.CylinderGeometry(14.7,15.1,6,72,3,true).translate(0,3,0),pa=g.attributes.position,col=[],c=new THREE.Color();
    for(let i=0;i<pa.count;i++){const a=Math.atan2(pa.getZ(i),pa.getX(i)),y=pa.getY(i),k=.55+.45*Math.sin(a*23+y*1.3)*Math.sin(a*7-y);c.set(arkMix(0x8a5a2a,0xf0d098,k));col.push(c.r,c.g,c.b)}
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.62,depthWrite:false,side:THREE.DoubleSide}));m.material.userData.lps=1;g.userData.lps=1;m.position.set(cx,y0-.2,cz);m.visible=false;m.renderOrder=4;A.g.add(m);D.seal=m}
  // ---- solid tiers: block the ring of tiles behind the pit (leave the entrance open) ----
  for(let z=Math.floor(cz-19);z<=cz+19;z++)for(let x=Math.floor(cx-19);x<=cx+19;x++){const r=Math.hypot(x-cx,z-cz);if(r<16.0||r>18.8)continue;if(inGap(Math.atan2(z-cz,x-cx)))continue;denBlock(x,z)}
  TANIM.push({x:cx,z:cz,f:now=>{const dt=Math.min(.05,(now-(D._tn||now))/1000);D._tn=now;D.sw.rotation.y-=dt*D.swS}});
  D.ok=true}
// ---------------- atmosphere ----------------
function ssAtm(on){try{const Z=ZATM[3];if(!SS.atm)SS.atm={fog:Z.fog,fm:Z.fm,sun:Z.sun};
  if(on){Z.fog=.075;Z.fm=1.25;Z.sun=.8;ZP.mat.size=.2}else{Z.fog=SS.atm.fog;Z.fm=SS.atm.fm;Z.sun=SS.atm.sun;if(ZP.type=='sand')ZP.mat.size=.07}}catch(err){}}
// ---------------- columns ----------------
function ssBreak(A,C){C.ok=false;C.col.visible=false;C.rub.visible=true;C.tiles.forEach(t=>denUnblock(t[0],t[1]));
  const q=C.p;burst(gY(q,1.5),0xc49a64,60,5,4,1);burst(gY(q,.6),SS_SAND,40,4,2,.8);kqFlash(gY(q,1.5),0xffe0a0,5,300);ring(q,0xffd080,6,450);shake(.45);if(typeof sfx=='function')sfx('hit',.6)}
function ssExpose(A,e,sec,txt){e._ssX=nowP()+sec*1000;popT(e.m.position,txt,'#ffd040',true);ring(e.m.position,0xffd040,5,500)}
// ---------------- the Devourer's den moves (relayed like every Sovereign move) ----------------
kqBmv('vortex',function(e,A,en){const D=A.dn;if(!D||D.vx||D.vxCD>0)return BMV.tailsweep(e,A,en);const ph=e.bs.ph;
  D.vx={w:1.1,t:ph>=3?7.5:6,pull:[1.5,2.0,2.6][ph-1],tick:0};D.vxCD=15;kqBossCast(e,SS_COL,700);
  say('🌀 The Sunken Pit churns — the sand drags you toward the sinkhole! Walk or dash against it.');shake(.2);
  return {d:1.4*en,lock:0}});
kqBmv('erupt',function(e,A,en){const D=A.dn;if(!D||D.er)return BMV.tailsweep(e,A,en);
  D.er={s:'dive',t:.45,n:e.bs.ph>=3?2:1,en};burst(gY(e.m.position,.4),SS_SAND,70,5,4,1);ring(e.m.position,SS_SAND,6,400);shake(.25);
  say('⚠ '+A.b.name+' dives into the sand — keep moving, then punish it when it surfaces!');return {d:6,lock:1}});
kqBmv('ram',function(e,A,en){const D=A.dn;if(!D||D.ram)return BMV.tailsweep(e,A,en);ssAim(A,e,D,e.bs.ph>=3?2:1,(e.bs.ph>=3?.8:.95)*en);
  if(!D.rh){D.rh=1;say('💡 Lure its charge into a column — its head gets stuck!')}return {d:5,lock:1}});
kqBmv('sandstorm',function(e,A,en){const D=A.dn;if(!D||D.st||D.stCD>0)return BMV.spit(e,A,en);
  D.st={t:8,nx:1.2};D.stCD=22;ssAtm(true);kqBossCast(e,SS_COL,600);banner('🌪 SANDSTORM',A.b.name+' whips up the desert','Its body lashes up from under the sand — watch for red circles');
  return {d:1.4*en,lock:0}});
function ssAim(A,e,D,n,wind){const o=e.m.position.clone(),d=toPl(o);
  // distance to the den's edge along d
  const ox=o.x-A.cx,oz=o.z-A.cz,b=ox*d.x+oz*d.z,c=ox*ox+oz*oz-(ARENA_R-1.6)**2,L=Math.max(3,-b+Math.sqrt(Math.max(0,b*b-c)));
  tele(o,0,wind,()=>{},{w:3.2,l:L,d});kqBossCast(e,SS_COL,wind*900);
  D.ram={s:'wind',t:wind,d,o,L,n,run:0,hit:false}}
// ---------------- per-frame boss control while a den state runs ----------------
function ssAI(A,e,dt,now){const D=A.dn;if(!D)return false;const b=e.bs,S=BSTY[3],m=e.m;
  if(S._p0&&b.last===S._fk){S.pool=S._p0;S._p0=null}
  const force=k=>{if(S._p0)return;S._p0=S.pool;S._fk=k;S.pool=[[k],[k],[k]];b.last='';b.t=Math.min(b.t,.5)};
  if(b.ph>D.ph){D.ph=b.ph;if(b.ph==2){D.stCD=0;force('sandstorm')}else if(b.ph==3){D.vxCD=0;force('vortex')}}
  D.vxCD=Math.max(0,D.vxCD-dt);D.stCD=Math.max(0,D.stCD-dt);
  // exposed / stuck: it can't act
  if(e._ssX&&nowP()<e._ssX){if(!e.hid){animC(m,now,false,0);m.b.rotation.z=Math.sin(now/70)*.05;m.b.position.y-=.18}return true}
  if(e._ssX){e._ssX=0;m.b.rotation.z=0;if(!D.er&&!D.ram){b.lock=0;b.t=Math.min(b.t,.9)}}
  const auth=ssAuth(A);
  // ---- burrow & erupt ----
  if(D.er){const R2=D.er;R2.t-=dt;
    if(R2.s=='dive'){if(R2.t<=0){bxHide(e,true);R2.s='hunt';R2.t=e.bs.ph>=3?1.7:2.2;D.mound.visible=true;R2.tr=0}}
    else if(R2.s=='hunt'){const d=toPl(m.position);if(auth&&d2(pl.position,m.position)>.8){m.position.x+=d.x*6.5*dt;m.position.z+=d.z*6.5*dt;inArena(A,m.position,1.6);for(const C of D.cols){if(!C.ok)continue;const cx=m.position.x-C.x,cz=m.position.z-C.z,l=Math.hypot(cx,cz);if(l<2.2&&l>.01){m.position.x=C.x+cx/l*2.2;m.position.z=C.z+cz/l*2.2}}}
      D.mound.position.set(m.position.x,GH(m.position.x,m.position.z)+.05,m.position.z);D.mound.rotation.y+=dt*2;R2.tr-=dt;if(R2.tr<=0){R2.tr=.1;burst(gY(m.position,.3),SS_SAND,5,2,2,.5)}
      if(R2.t<=0){R2.s='tele';R2.t=1.0*R2.en;const q=m.position.clone();R2.q=q;tele(q,3.3,R2.t,()=>{})}}
    else if(R2.s=='tele'){D.mound.position.y=GH(R2.q.x,R2.q.z)+.05+Math.sin(now/40)*.08;if(Math.random()<.4)burst(gY(R2.q,.2),SS_SAND,3,2,2,.5);
      if(R2.t<=0){const q=R2.q;D.mound.visible=false;bxHide(e,false);m.position.set(q.x,0,q.z);ring(q,SS_COL,8,450);burst(gY(q,.6),SS_SAND,90,6,6,1.1);burst(gY(q,1),SS_COL,30,3,4,.7);shake(.4);
        if(d2(pl.position,q)<3.3&&hero.iv<=0)bossHit(e,1.5);
        if(e.bs.ph>=2){const a0=Math.random()*6.283;for(let k=0;k<3;k++){const a=a0+k*2.094,g=inArena(A,q.clone().add(V(Math.cos(a)*4.6,0,Math.sin(a)*4.6)),1);
          tele(g,2.0,.9,()=>{if(!A.f)return;burst(gY(g,.4),SS_SAND,50,3,7,1);ring(g,SS_SAND,4,350);if(d2(pl.position,g)<2.0)bossHit(e,.9)})}}
        R2.n--;if(R2.n>0){R2.s='dive';R2.t=.7}else{D.er=null;ssExpose(A,e,2.8,'EXPOSED! ×1.6');return true}}}
    if(D.er&&D.er.s!='hunt'&&D.er.s!='tele')animC(m,now,false,0);return true}
  // ---- ram ----
  if(D.ram){const Rm=D.ram;Rm.t-=dt;m.rotation.y=Math.atan2(Rm.d.x,Rm.d.z);
    if(Rm.s=='wind'){animC(m,now,true,.6);if(Rm.t<=0){Rm.s='run';Rm.run=0;shake(.12)}return true}
    if(Rm.s=='run'){const st=19*dt;Rm.run+=st;m.position.x+=Rm.d.x*st;m.position.z+=Rm.d.z*st;animC(m,now,true,9);if(Math.random()<.7)burst(gY(m.position,.3),SS_SAND,4,2,1.5,.5);
      if(!Rm.hit&&d2(pl.position,m.position)<2.7&&hero.iv<=0){Rm.hit=true;bossHit(e,1.6);const s=Math.sign(Rm.d.x*(pl.position.z-m.position.z)-Rm.d.z*(pl.position.x-m.position.x))||1;walk(pl,-Rm.d.z*s*1.6,Rm.d.x*s*1.6);dn(pl.position,'Trampled!','#ffb070',-20,700)}
      for(const C of D.cols){if(C.ok&&d2(C.p,m.position)<2.0){ssBreak(A,C);m.position.x-=Rm.d.x*.8;m.position.z-=Rm.d.z*.8;D.ram=null;ssExpose(A,e,3.6,'STUCK! ×1.6');say('💥 Its head is stuck in the rubble — strike now!');return true}}
      if(Rm.run>=Rm.L||Math.hypot(m.position.x-A.cx,m.position.z-A.cz)>ARENA_R-1.5){inArena(A,m.position,1.5);ring(m.position,SS_SAND,4,350);burst(gY(m.position,.5),SS_SAND,30,3,3,.6);shake(.2);Rm.s='daze';Rm.t=.8}return true}
    if(Rm.s=='daze'){animC(m,now,false,0);if(Rm.t<=0){Rm.n--;if(Rm.n>0)ssAim(A,e,D,Rm.n,.7);else{D.ram=null;b.lock=0;b.t=Math.min(b.t,.8)}}return true}}
  return false}
// ---------------- per-frame hazards ----------------
function ssTick(A,e,dt,now){const D=A.dn;if(!D)return;const P=pl.position,v=SS.scr;
  if(D.seal&&D.seal.visible)D.seal.rotation.y+=dt*.9;
  // exposure marker over the head
  const xp=e._ssX&&nowP()<e._ssX;D.mark.visible=!!xp;if(xp){const p=kqMouth(e);D.mark.position.set(p.x,p.y+1.6,p.z);D.mark.scale.setScalar(1+.15*Math.sin(now/90));D.markR.rotation.x=-Math.PI/2;D.markR.rotation.z+=dt*3}
  // quicksand vortex
  if(D.vx){const X=D.vx;D.swS=X.w>0?.25+4*(1.1-X.w):4.5;
    if(X.w>0){X.w-=dt;if(Math.random()<.5){const a=Math.random()*6.283,r=2+Math.random()*4;v.set(A.cx+Math.cos(a)*r,GH(A.cx,A.cz)+.3,A.cz+Math.sin(a)*r);burst(v,SS_SAND,2,1,1.5,.5)}}
    else{X.t-=dt;const dx=A.cx-P.x,dz=A.cz-P.z,d=Math.hypot(dx,dz)||1,sp=X.pull*(.45+.55*(1-Math.min(d,14)/14))*(hero.iv>0?.5:1);if(d>.3&&hero.hp>0)walk(pl,dx/d*sp*dt,dz/d*sp*dt);
      D.vr.forEach((m,i)=>{const k=((now/1000*.55+i/3)%1),r=13.5*(1-k)+.5;m.visible=true;m.scale.setScalar(r);m.material.opacity=.55*Math.min(1,k*4)*(1-k)});
      if(Math.random()<.8){const a=Math.random()*6.283,r=3+Math.random()*10;v.set(A.cx+Math.cos(a)*r,GH(A.cx,A.cz)+.25,A.cz+Math.sin(a)*r);burst(v,0xe8c890,2,.6,.5,.6)}
      X.tick-=dt;const core=d<SS_CORE;if(core&&X.tick<=0&&hero.iv<=0){X.tick=.5;bossHit(e,e.bs.ph>=3?.45:.35);dn(P,'Sinking!','#ffcf8a',-20,500)}
      ssSink(D,core);
      if(X.t<=0){D.vx=null;D.vr.forEach(m=>m.visible=false);D.swS=.25;ssSink(D,false)}}}
  // sandstorm: lashing segments
  if(D.st){const T=D.st;T.t-=dt;T.nx-=dt;try{const ps=ZP.pos,N=ZP.N,w=10*dt;for(let i=0;i<N;i++){ps[i*3]+=w;ps[i*3+2]+=w*.3}}catch(err){}
    if(T.nx<=0&&T.t>.9){T.nx=e.bs.ph>=3?.5:.7;const mv=pl.mvd||{x:0,z:0},q=inArena(A,P.clone().add(V((Math.random()-.5)*2.6+(mv.x||0)*1.2,0,(Math.random()-.5)*2.6+(mv.z||0)*1.2)),1);
      tele(q,1.5,.9,()=>{if(!A.f)return;ssLash(D,q);burst(gY(q,.4),SS_SAND,30,3,4,.7);if(d2(pl.position,q)<1.5)bossHit(e,.8)})}
    if(T.t<=0){D.st=null;ssAtm(false)}}
  for(const L of D.tails){if(L.t<=0)continue;L.t-=dt;const k=1-L.t/1.1,y=k<.2?-3.8+3.8*(k/.2):k<.55?0:-3.8*((k-.55)/.45);L.m.position.y=GH(L.p.x,L.p.z)+y;L.m.rotation.y+=dt*1.5;if(L.t<=0)L.m.visible=false}}
function ssLash(D,q){const L=D.tails.find(t=>t.t<=0);if(!L)return;L.t=1.1;L.p.copy(q);L.m.position.set(q.x,GH(q.x,q.z)-3.8,q.z);L.m.rotation.set((Math.random()-.5)*.3,Math.random()*6,(Math.random()-.5)*.3);L.m.visible=true}
function ssSink(D,on){if(on){if(!D.buff||!hero.buffs.includes(D.buff)){hero.buffs=hero.buffs.filter(b=>b.n!='Sinking');D.buff={n:'Sinking',i:'⏳',s:{mspd:-.35},t:nowP()+600,d:'Quicksand: −35% move speed'};hero.buffs.push(D.buff);hsDirty()}D.buff.t=nowP()+600}
  else if(D.buff){hero.buffs=hero.buffs.filter(b=>b!==D.buff);D.buff=null;hsDirty()}}
// exposed: hits land ×1.6
{const f=hurt;hurt=function(e,d,s,c,dot){if(e&&e.ar===3&&e._ssX&&!e.hid&&nowP()<e._ssX&&d>0){arguments[1]=d*1.6;if(nowP()-(e._ssW||0)>500){e._ssW=nowP();dn(e.m.position,'WEAK POINT','#ffd040',-60,700)}}return f.apply(this,arguments)}}
// ---------------- den hooks ----------------
DEN[3]={build:ssBuild,ai:ssAI,tick:ssTick,
  start(A,e){const D=A.dn;if(!D)return;D.ph=1;D.vx=D.st=D.er=D.ram=null;D.vxCD=6;D.stCD=0;D.rh=0;e._ssX=0;
    setTimeout(()=>{if(A.f)say('🏜️ The Sunken Pit: stay off the sinkhole, and use the columns — its charge can get stuck in them.')},1800)},
  clear(A,won){const D=A.dn;if(!D)return;const e=bossEnt(A.i)||enemies.find(x=>x.ar===A.i);
    D.vx=D.st=D.er=D.ram=null;ssAtm(false);D.vr.forEach(m=>m.visible=false);D.swS=.25;D.mound.visible=false;D.mark.visible=false;ssSink(D,false);
    D.tails.forEach(L=>{L.t=0;L.m.visible=false});if(e){e._ssX=0;e.m.b.rotation.z=0}
    D.cols.forEach(C=>{C.ok=true;C.col.visible=true;C.rub.visible=false;C.tiles.forEach(t=>denBlock(t[0],t[1]))});
    const S=BSTY[3];if(S._p0){S.pool=S._p0;S._p0=null}},
  seal(A,on){const D=A.dn;if(!D)return;const s=D.seal;if(on){s.visible=true;s.scale.y=.01;burst(V(A.cx,GH(A.cx,A.cz)+.5,A.cz),SS_SAND,1,1,1,.1);tw(700,k=>{s.scale.y=Math.max(.01,k)},()=>{});shake(.2)}
    else tw(700,k=>{s.scale.y=Math.max(.01,1-k)},()=>{if(!A.f)s.visible=false})}};
if(BSTY[3])BSTY[3].pool=[['erupt','tailsweep','ram','vortex'],['sandstorm','spit','mines'],['erupt','ram']];
