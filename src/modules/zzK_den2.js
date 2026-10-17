// ================= v86 den 2: The Frozen Sepulchre — the Rime Wraith, Ghost of Burningeye Summit =================
// The den: a frozen crater. A cracked ice lake with frost runes at the heart, snow fields around it, a jagged wall of
// snow-capped rock and ice spires (two great spires lean together over the entrance), the wraith's ice-bound sarcophagus
// at the back, four iron Warmfires and five challengers frozen in ice where they fell.
// Signature mechanics (on top of its orbs / fade / prison / clones / beam / mines / wave pool):
//  1. DEEP COLD   — away from a lit Warmfire you chill (HUD meter). Chilled −15% speed, Freezing −30%, at 100% you freeze
//                   solid for 1.5s and take a hit. Standing in a fire's warm circle thaws you fast. Rate rises per phase.
//  2. SNUFF       — every ~15s/12s/10s the wraith draws the heat out of the Warmfire nearest it (a frost stream + a red
//                   circle on the fire): it goes dark and bursts with frost. Stand beside a dark fire for 2s to rekindle it.
//                   Phase III snuffs two at once. At least one fire always stays lit.
//  3. THAW        — the frozen challengers crack (glowing cracks, shaking, red circle) and burst free as Thawed thralls:
//                   two at Phase II, more from the Phase II pool, one after every Whiteout.
//  4. WHITEOUT    — Phase III: the wraith vanishes into a blizzard (thick white fog, driving snow, cold ×1.7) while ice
//                   lances fall where you stand; it re-forms beside you with a frost nova. Forced on entering Phase III.
// Co-op: every mechanic starts from a relayed BMV move (kqBmv) or from the boss state, and each player only takes damage
// from their own copy, so nothing hits twice. Fires snuffed by the wraith match on both screens (nearest to the boss);
// a rekindle is local. Thralls are only spawned by the player who runs the boss.
var RW={g:null,ice:null,iceT:null,flm:null,flm2:null,warm:null,rl:null,blk:null,atm:null};
function rwAuth(A){return !(typeof MP!='undefined'&&MP.on&&AF&&AF.i===A.i&&typeof mpBossAuth=='function'&&mpBossAuth(A.i)!==MP.me)}
function rwEntA(A){const p=PMAP[A.i],P=p.path||[];let q=p.wp[p.wp.length-2];for(let k=P.length-1;k>=0;k--){if(Math.hypot(P[k][0]-A.cx,P[k][1]-A.cz)>21){q=P[k];break}}return Math.atan2(q[1]-A.cz,q[0]-A.cx)}
const rwAD=(a,b)=>{let d=a-b;return Math.atan2(Math.sin(d),Math.cos(d))};
// a matrix that leans an object outward (lean>0) or inward around the den centre, then spins it
function rwTM(x,y,z,sx,sy,sz,a,lean,spin){const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(-Math.sin(a),0,Math.cos(a)),-lean),q2=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),spin||0);
  return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),q.multiply(q2),new THREE.Vector3(sx,sy,sz))}
function rwMats(){if(RW.ice)return;
  RW.ice=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.22,metalness:.12,side:THREE.DoubleSide});RW.ice.userData.lps=1;
  RW.iceT=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.15,metalness:.1,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide});RW.iceT.userData.lps=1;
  RW.flm=new THREE.MeshBasicMaterial({color:0xff8a2a});RW.flm2=new THREE.MeshBasicMaterial({color:0xffe08a});RW.flm.userData.lps=RW.flm2.userData.lps=1;
  RW.warm=new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide});
  RW.warmD=new THREE.MeshBasicMaterial({color:0xff8a30,transparent:true,opacity:.09,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide});
  RW.gRing=new THREE.RingGeometry(3.0,3.22,48).rotateX(-Math.PI/2);RW.gDisc=new THREE.CircleGeometry(3.0,40).rotateX(-Math.PI/2);RW.gRl=new THREE.RingGeometry(.86,1,40).rotateX(-Math.PI/2)}
const RW_WARM=3.1,RW_COL=0x9ad8ff;
// ---------------- the frozen challenger statues ----------------
function rwStatue(A,x,z,face,v,R){
  const y=GH(x,z),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=face;g.scale.setScalar(1.2);A.g.add(g);
  const F=arkSoup(7300+v*13+A.i),fz=0x3e4b60,fzd=0x2a3242,stl=0x9aa6b8;
  // a frost-blackened figure: legs, torso, head, arms posed as it fell
  const lean=[0,.12,-.1,.25,0][v%5],kneel=v%5==3;
  F.geo(ARKG.box,arkM4(-.17,kneel?.3:.5,0,.2,kneel?.6:1,.24,kneel?-.9:0),fzd);F.geo(ARKG.box,arkM4(.17,.5,kneel?.15:0,.2,1,.24),fzd);
  F.geo(ARKG.box,arkM4(0,kneel?.95:1.32,0,.62,.72,.36,lean),fz);F.geo(ARKG.box,arkM4(0,kneel?1.36:1.74,0,.7,.14,.4,lean),arkShade(fz,.85));
  F.geo(ARK.rock[v%4],arkM4(0,kneel?1.58:1.98,lean*.4,.21,.25,.22),fz);
  const arms=[[[-.42,1.55,.15,-2.6],[.42,1.35,.25,-.6]],[[-.42,1.3,.2,-1.2],[.42,1.3,.2,-1.2]],[[-.4,1.55,0,-2.9],[.4,1.55,0,-2.9]],[[-.4,1.05,.25,-1.3],[.42,1.1,.3,-.4]],[[-.45,1.35,.05,-.3],[.45,1.6,.15,-2.3]]][v%5];
  arms.forEach(([ax,ay,az,rx],i)=>{F.geo(ARKG.box,arkM4(ax,ay+(kneel?-.38:0),az,.15,.7,.16,rx,0,ax<0?.2:-.2),fz);
    if(i==(v%2)){const hx=ax,hy=ay+(kneel?-.38:0)-Math.cos(rx)*.38,hz=az+Math.sin(-rx)*.38;F.geo(ARKG.box,arkM4(hx,hy-Math.cos(rx)*.55,hz-Math.sin(rx)*.55,.06,1.1,.11,rx),stl)}});
  if(v%3==1)F.geo(ARKG.cyl6,arkM4(.5,1.25,.3,.42,.07,.42,1.4,0,.3),arkShade(stl,.8));   // shield
  const fig=F.mesh();g.add(fig);
  // the ice that holds it: a leaning hexagonal block and a few shards
  const I=arkSoup(7400+v*7+A.i),ic=(cy,n)=>arkMix(0x5aa8d8,0xcdeefc,Math.min(1,Math.max(0,cy/2.8))*.6+(n.y>.5?.3:0));
  I.geo(ARKG.cyl6,arkM4(0,1.15,0,.82,2.5,.72,(R()-.5)*.08,R(),(R()-.5)*.08),ic,.1);
  for(let k=0;k<4;k++){const a=k*1.6+R(),r=.75;I.geo(ARKG.cone5,arkM4(Math.cos(a)*r,.55+R()*.4,Math.sin(a)*r,.22+R()*.12,1.1+R()*1.2,.22,Math.sin(a)*.35,0,-Math.cos(a)*.35),ic,.1)}
  const ice=I.mesh(RW.iceT);ice.castShadow=false;ice.renderOrder=2;g.add(ice);
  // what is left after it breaks: a jagged ring of stumps
  const B=arkSoup(7500+v);for(let k=0;k<7;k++){const a=k/7*6.283+R()*.4,r=.55+R()*.3;B.geo(ARKG.cone5,arkM4(Math.cos(a)*r,.18,Math.sin(a)*r,.2,.35+R()*.4,.2,Math.sin(a)*.4,0,-Math.cos(a)*.4),ic,.1)}
  B.geo(ARK.rock[1],arkM4(0,.04,0,.9,.12,.9),0xdfeef8);
  const brk=B.mesh(RW.ice);brk.visible=false;g.add(brk);
  const gl=kqSpr(RW_COL,.1);gl.position.y=1.3;gl.visible=false;g.add(gl);
  return {g,fig,ice,brk,gl,x,z,p:new THREE.Vector3(x,0,z),ok:true,crk:0}}
// ---------------- build ----------------
function rwBuild(A){
  rwMats();const R=ARK.rng(9100+A.i),y0=GH(A.cx,A.cz),ea=rwEntA(A),GAP=.36,cx=A.cx,cz=A.cz;
  const D=A.dn={ea,cold:0,tier:0,br:[],st:[],ph:1,snT:0,whCD:0,wh:null,frz:0,buff:null,thawN:1,ok:false};
  const inGap=a=>Math.abs(rwAD(a,ea))<GAP;
  const P=(a,r)=>[cx+Math.cos(a)*r,cz+Math.sin(a)*r];
  // ---- floor: the cracked ice lake ----
  const L=arkSoup(9200+A.i);
  [[0,1.7,1],[1.7,3.3,7],[3.3,4.9,10],[4.9,6.5,14],[6.5,8.1,17]].forEach(([r0,r1,n],ri)=>{const off=R()*6.283;
    for(let k=0;k<n;k++){const a0=off+k/n*6.283,a1=off+(k+1)/n*6.283,gp=.07,pts=[];
      const cs=n==1?[...Array(7)].map((_,i)=>[r1-gp,i/7*6.283]):[[r0+gp,a0+.05/r1],[r1-gp,a0+.03/r1+(R()-.5)*.08],[r1-gp,(a0+a1)/2+(R()-.5)*.1],[r1-gp,a1-.03/r1],[r0+gp,a1-.05/r1]];
      cs.forEach(([r,a])=>{const jr=r+(R()-.5)*.25;pts.push(P(a,jr))});
      const yt=pts.map(p=>GH(p[0],p[1])+.05+R()*.025),t=ri/4,top=arkMix(arkMix(0x3a78a8,0x7fbadc,t),0xd8f0ff,R()*.15);
      L.slab(pts,yt,y0-.2,top,arkShade(top,.6))}});
  // frost bubbles under the ice
  for(let k=0;k<26;k++){const a=R()*6.283,r=R()*7.6,[x,z]=P(a,r);L.geo(ARKG.oct,arkM4(x,y0+.085,z,.08+R()*.1,.01,.08+R()*.1,0,R()*3),0xe8f8ff,.05)}
  const lake=L.mesh(RW.ice);lake.castShadow=false;A.g.add(lake);
  // ---- floor: snow field from the lake to the wall, with drifts ----
  const S=arkSoup(9300+A.i),snow=0xe2e9f2,shad=0xa9bad0;
  [[8.1,9.9,22],[9.9,11.8,27],[11.8,13.7,32],[13.7,15.8,38]].forEach(([r0,r1,n],ri)=>{const off=R()*6.283;
    for(let k=0;k<n;k++){const a0=off+k/n*6.283,a1=off+(k+1)/n*6.283,pts=[P(a0,r0),P(a0+.004,r1),P(a1+.004,r1),P(a1,r0)];
      const yt=pts.map((p,i)=>GH(p[0],p[1])+.06+(i==1||i==2?ri*.03:0)+R()*.08);S.slab(pts,yt,y0-.25,arkMix(snow,shad,R()*.35),shad)}});
  for(let k=0;k<34;k++){let a=R()*6.283;const r=9+R()*6.4,[x,z]=P(a,r),s=.6+R()*1.2;if(inGap(a)&&r>13)continue;
    S.geo(ARK.rock[k%4],arkM4(x,y0+.02,z,s*1.4,.18+R()*.22,s,0,a+1.57),(cy,n)=>n.y>.3?arkMix(snow,0xffffff,.3):shad,.08)}
  // drift banks heaped against the wall
  for(let k=0;k<70;k++){const a=k/70*6.283+R()*.05;if(inGap(a))continue;const r=15.2+R()*1.2,[x,z]=P(a,r),s=1.1+R()*.9;
    S.geo(ARK.rock[k%4],arkM4(x,y0+.15,z,s*1.3,.55+R()*.5,s,0,a+1.57),(cy,n)=>n.y>.2?arkMix(snow,0xffffff,R()*.3):shad,.08)}
  // ---- the crater wall: snow-capped slate rock and ice spires ----
  const slate=0x343b48,iceC=(cy,y1,h)=>arkMix(0x4d94c0,0xdff6ff,Math.max(0,Math.min(1,(cy-y1)/h)));
  const rockC=y=>(cy,n)=>n.y>.55?arkMix(0xf2f6fa,0xd8e4f0,R()*.5):arkShade(slate,.75+R()*.4+(cy-y)*.03);
  for(let k=0;k<64;k++){const a=k/64*6.283+(R()-.5)*.06;if(inGap(a))continue;
    // inner row: low boulders
    {const r=16.1+R()*.9,[x,z]=P(a,r),y=GH(x,z);if(y>y0-1){const s=1.1+R()*.9;S.geo(ARK.rock[k%4],arkM4(x,y+s*.25,z,s*1.2,s*(.7+R()*.5),s,R()*.3,R()*6,0),rockC(y))}}
    // outer row: big crags
    {const r=18.6+R()*2.2,[x,z]=P(a,r),y=GH(x,z);if(y>y0-1){const s=2.2+R()*1.8;S.geo(ARK.rock[(k+2)%4],arkM4(x,y+s*.35,z,s*1.1,s*(.9+R()*.9),s,R()*.3,R()*6,0),rockC(y))}}
    // ice spires growing out of the wall, leaning outward
    if(k%2==0||R()<.3){const r=16.9+R()*1.6,[x,z]=P(a,r),y=GH(x,z),h=2.4+R()*4.2,w=.35+R()*.5;if(y>y0-1)S.geo(ARKG.cone5,rwTM(x,y+h/2-.2,z,w,h,w*.9,a,.12+R()*.2,R()*3),(cy)=>iceC(cy,y,h),.12);
      if(R()<.5){const h2=h*.55,[x2,z2]=P(a+.05,r+.6);S.geo(ARKG.cone4,rwTM(x2,y+h2/2-.2,z2,w*.6,h2,w*.6,a+.05,.35,R()*3),(cy)=>iceC(cy,y,h2),.12)}}}
  // the entrance: two great spires lean together into a broken arch
  [-1,1].forEach(s=>{const a=ea+s*(GAP+.03),r=16.4,[x,z]=P(a,r),y=GH(x,z),h=8.5;
    const tq=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(Math.cos(a),0,Math.sin(a)),s*.32),M=new THREE.Matrix4().compose(new THREE.Vector3(x,y+h/2-.3,z),tq,new THREE.Vector3(1.05,h,.95));
    S.geo(ARKG.cone5,M,(cy)=>iceC(cy,y,h),.1);
    const M2=new THREE.Matrix4().compose(new THREE.Vector3(x+Math.cos(a)*.9,y+2.2,z+Math.sin(a)*.9),tq,new THREE.Vector3(.7,4.4,.7));S.geo(ARKG.cone4,M2,(cy)=>iceC(cy,y,4.4),.1);
    S.geo(ARK.rock[s>0?1:2],arkM4(x,y+.5,z,1.6,1.1,1.5,0,a),rockC(y))});
  // ---- the sarcophagus at the back: a stepped ice dais, an upright coffin bound in crystal ----
  {const a=ea+Math.PI,[x,z]=P(a,17.2),y=GH(x,z),ry=-a-Math.PI/2;
    [[3.6,.35,2.8],[2.8,.35,2.1],[2.0,.35,1.5]].forEach(([w,h,d],i)=>S.geo(ARKG.box,arkM4(x,y+h/2+i*h,z,w,h,d,0,ry),arkMix(0x8fb4cc,0xd0e6f4,i*.3)));
    const cy=y+1.05;S.geo(ARKG.box,rwTM(x,cy+1.3,z,1.05,2.6,.7,a,-.08,ry),0x2c3446);S.geo(ARKG.box,rwTM(x-Math.cos(a)*.4,cy+1.3,z-Math.sin(a)*.4,.85,2.3,.12,a,-.08,ry),0x46546a);
    S.geo(ARKG.box,arkM4(x+Math.cos(a+1.57)*1.9,y+.2,z+Math.sin(a+1.57)*1.9,1.0,.15,2.5,.1,ry+.4,.2),0x2c3446);   // the fallen lid
    for(let k=0;k<7;k++){const b=a+(k-3)*.3,rr=1.2+R()*.6,xx=x+Math.cos(b)*rr,zz=z+Math.sin(b)*rr,h=3+R()*3.5;S.geo(ARKG.cone5,rwTM(xx,y+h/2,zz,.45+R()*.3,h,.42,b,.2*(k-3)/3,R()*3),(c)=>iceC(c,y,h),.1)}}
  // ---- bones and broken arms of earlier challengers ----
  for(let k=0;k<16;k++){const a=R()*6.283,r=9+R()*5.2;if(inGap(a))continue;const [x,z]=P(a,r),y=GH(x,z)+.1;
    if(k%3==0)S.geo(ARK.rock[k%4],arkM4(x,y+.08,z,.17,.19,.2,0,R()*6),0xd8d0bc);
    else if(k%3==1){S.geo(ARKG.box,arkM4(x,y+.45,z,.06,1.0,.12,(R()-.5)*.6,R()*3,(R()-.5)*.5),0x9aa4b2);S.geo(ARKG.box,arkM4(x,y+.82,z,.32,.06,.08,0,R()*3),0x5a5040)}
    else for(let q=0;q<3;q++)S.geo(ARKG.cyl5,arkM4(x+(R()-.5)*.6,y+.04,z+(R()-.5)*.6,.05,.5,.05,1.57,R()*3,0),0xd8d0bc)}
  // ---- the Warmfires: stone ring, iron tripod and bowl (the flame, glow and warm circle are separate) ----
  for(let k=0;k<4;k++){const a=ea+Math.PI/4+k*Math.PI/2,[x,z]=P(a,8.2),y=GH(x,z);
    for(let q=0;q<7;q++){const b=q/7*6.283;S.geo(ARK.rock[q%4],arkM4(x+Math.cos(b)*.62,y+.1,z+Math.sin(b)*.62,.24,.18,.22,0,b),arkShade(0x5a6270,.8+R()*.4))}
    for(let l=0;l<3;l++){const la=l*2.094;S.geo(ARKG.box,arkM4(x+Math.cos(la)*.2,y+.5,z+Math.sin(la)*.2,.06,.95,.06,Math.sin(la)*.25,0,-Math.cos(la)*.25),0x26242a)}
    S.geo(ARKG.cone5,arkM4(x,y+1.05,z,.52,.34,.52,Math.PI),0x2c2a30);S.geo(ARKG.cyl5,arkM4(x,y+1.2,z,.55,.06,.55),0x46424a);S.geo(ARK.rock[k%4],arkM4(x,y+1.18,z,.3,.1,.3),0x1a1210);
    const fl=new THREE.Group();fl.position.set(x,y+1.45,z);const o=new THREE.Mesh(ARKG.cone5,RW.flm);o.scale.set(.42,.9,.42);fl.add(o);const ic=new THREE.Mesh(ARKG.cone4,RW.flm2);ic.scale.set(.24,.55,.24);ic.position.y=-.12;fl.add(ic);
    fl.traverse(q=>{if(q.isMesh)q.castShadow=false});A.g.add(fl);
    const gl=kqSpr(0xff9a40,3.4);gl.position.set(x,y+1.6,z);A.g.add(gl);
    const wr=new THREE.Mesh(RW.gRing,RW.warm),wd=new THREE.Mesh(RW.gDisc,RW.warmD);[wr,wd].forEach(m=>{m.position.set(x,y+.13,z);m.renderOrder=18;m.visible=false;m.frustumCulled=false;A.g.add(m)});
    const rl=new THREE.Mesh(RW.gRl,new THREE.MeshBasicMaterial({color:0xffb050,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide}));rl.position.set(x,y+.15,z);rl.renderOrder=19;rl.visible=false;A.g.add(rl);
    denBlock(x,z);D.br.push({x,z,y,p:new THREE.Vector3(x,0,z),fl,gl,wr,wd,rl,lit:true,rk:0,snf:0,ph:R()*6})}
  // ---- the frozen challengers ----
  [62,108,180,252,298].forEach((dg,v)=>{const a=ea+dg*Math.PI/180,[x,z]=P(a,11.4);const st=rwStatue(A,x,z,Math.atan2(-Math.cos(a),-Math.sin(a))+(R()-.5)*.8,v,R);denBlock(x,z);D.st.push(st)});
  const wallM=S.mesh();A.g.add(wallM);
  // ---- glowing frost runes in the lake ----
  const G=arkSoup(9400+A.i),rc=0xbfeaff;
  for(let k=0;k<12;k++){const a=k/12*6.283,[x,z]=P(a,4.15);arkRune(G,x,y0+.1,z,a+1.57,1.25,rc,R)}
  [[3.55,.05],[4.75,.05],[1.6,.05]].forEach(([r,w])=>{for(let k=0;k<48;k++){const a0=k/48*6.283,a1=(k+1)/48*6.283,p=(rr,a)=>{const [x,z]=P(a,rr);return [x,y0+.1,z]};G.quad(p(r-w,a0),p(r-w,a1),p(r+w,a1),p(r+w,a0),rc,.05)}});
  const rm=G.mesh(new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));rm.castShadow=rm.receiveShadow=false;rm.material.userData.lps=1;A.g.add(rm);D.rune=rm;
  // ---- the seal: a ring of ice shards that bursts out of the snow ----
  const W=arkSoup(9500+A.i);for(let k=0;k<84;k++){const a=k/84*6.283,r=14.5+(R()-.5)*.5,[x,z]=P(a,r),h=1.6+R()*2.4+(k%3==0?1.4:0),w=.35+R()*.35;
    W.geo(ARKG.cone5,rwTM(x,y0+h/2-.3,z,w,h,w,a,(R()-.5)*.3,R()*3),(c)=>iceC(c,y0,h),.12)}
  const seal=W.mesh(RW.ice);seal.visible=false;seal.castShadow=false;A.g.add(seal);D.seal=seal;
  // ---- solid wall: block the ring of tiles behind the rocks (leave the entrance open) ----
  for(let z=Math.floor(cz-19);z<=cz+19;z++)for(let x=Math.floor(cx-19);x<=cx+19;x++){const r=Math.hypot(x-cx,z-cz);if(r<15.9||r>18.6)continue;if(inGap(Math.atan2(z-cz,x-cx)))continue;denBlock(x,z)}
  // flame flicker (also while no fight runs)
  TANIM.push({x:cx,z:cz,f:now=>{D.br.forEach(B=>{if(!B.fl.visible)return;const q=1+.16*Math.sin(now/85+B.ph)+.08*Math.sin(now/37+B.ph*2);B.fl.scale.set(1,q,1);B.fl.rotation.y=now/400+B.ph})}});
  D.ok=true}
// ---------------- HUD: the Deep Cold meter + frost vignette ----------------
function rwHud(on){let h=document.getElementById('rwCold');
  if(!h){if(!on)return;h=document.createElement('div');h.id='rwCold';h.className='glass';
    h.style.cssText='position:absolute;left:50%;transform:translateX(-50%);width:min(300px,38%);padding:5px 10px;z-index:2;text-align:center;font-size:.72rem;font-weight:700;color:#d8f0ff;pointer-events:none';
    h.innerHTML='<div style="display:flex;justify-content:space-between"><span>❄ Deep Cold <span id="rwCt"></span></span><span id="rwCf"></span></div><div class="meter" style="margin-top:3px;height:7px"><i id="rwCb" style="background:linear-gradient(90deg,#9ad8ff,#e8f8ff);width:0%"></i></div>';
    const b=document.getElementById('boss');(b&&b.parentNode||document.body).appendChild(h);
    const v=document.createElement('div');v.id='rwVig';v.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 48%,rgba(170,215,255,.55) 85%,rgba(225,245,255,.85) 100%)';document.body.appendChild(v)}
  h.style.display=on?'':'none';const v=document.getElementById('rwVig');if(v&&!on)v.style.opacity=0;
  if(on){const b=document.getElementById('boss');h.style.top=b?(b.offsetTop+b.offsetHeight+6)+'px':'100px'}}
function rwHudSet(D){if(!((D._hk=(D._hk|0)+1)%20)){const b=document.getElementById('boss'),h=document.getElementById('rwCold');if(b&&h&&b.offsetHeight)h.style.top=(b.offsetTop+b.offsetHeight+6)+'px'}
  const c=Math.round(D.cold);if(c!==D._hc){D._hc=c;const b=document.getElementById('rwCb');if(b)b.style.width=c+'%';const t=document.getElementById('rwCt');if(t)t.textContent=D.frz>0?'· FROZEN':c>=67?'· Freezing':c>=34?'· Chilled':'';
    const v=document.getElementById('rwVig');if(v)v.style.opacity=Math.max(0,(c-25)/75).toFixed(2)}
  const n=D.br.filter(B=>B.lit).length;if(n!==D._hn){D._hn=n;const f=document.getElementById('rwCf');if(f)f.textContent='🔥 Warmfires '+n+'/4'}}
// ---------------- fires ----------------
function rwFire(A,B,on){B.lit=on;B.fl.visible=B.gl.visible=on;const f=A.f;B.wr.visible=B.wd.visible=on&&f;B.rk=0;B.rl.visible=false}
function rwSnuff(A,B){rwFire(A,B,false);burst(V(B.x,B.y+1.5,B.z),0x9aa8c0,26,1.2,2.4,1.2);burst(V(B.x,B.y+1.4,B.z),RW_COL,18,2,1.5,.6);ring(B.p,RW_COL,4,420);
  if(typeof sfx=='function')sfx('zap',.4)}
// ---------------- thaw: a statue cracks and a thrall breaks out ----------------
function rwThaw(A,e,n,en){const D=A.dn;const L=D.st.filter(s=>s.ok&&!s.crk).sort((a,b)=>d2(a.p,pl.position)-d2(b.p,pl.position)).slice(0,n);
  L.forEach((s,j)=>{s.crk=1;const T=(1.8+j*.35)*(en||1);s.gl.visible=true;
    kqTimed(T,k=>{s.g.position.x=s.x+(Math.random()-.5)*.08*k;s.g.position.z=s.z+(Math.random()-.5)*.08*k;s.gl.scale.setScalar(.5+3.5*k);if(Math.random()<.25+k*.5)burst(V(s.x,GH(s.x,s.z)+.4+Math.random()*2.2,s.z),0xe8f8ff,2,1,1.2,.5)},
      ab=>{s.g.position.set(s.x,GH(s.x,s.z),s.z);s.gl.visible=false;s.crk=0;if(ab)return;
        s.ok=false;s.fig.visible=s.ice.visible=false;s.brk.visible=true;denUnblock(s.x,s.z);
        const q=V(s.x,0,s.z);burst(gY(q,1.2),0xe8f8ff,50,4,4,.9);burst(gY(q,.8),RW_COL,30,3,3,.7);kqFlash(gY(q,1.2),RW_COL,4,260);ring(q,RW_COL,5,400);shake(.18);
        if(rwAuth(A)&&e&&!e.dead){const live=enemies.filter(x=>x.minion&&!x.dead&&d2(x.m.position,V(A.cx,0,A.cz))<ARENA_R).length;
          if(live<6){const m=spawnEnemy(j%2?'troll':'yeti',s.x,s.z,Math.max(1,e.c.l-4),{minion:1,agg:1});if(m){m.agg=1;m.c.n='Thawed '+m.c.n}}}},()=>A.f);
    tele(s.p,2.4,T,()=>{if(A.f&&d2(pl.position,s.p)<2.4)bossHit(e,1.0)})});
  if(L.length)say('🧊 The frozen challengers crack free!');return L.length}
// ---------------- the wraith's den moves (wrapped like every Sovereign move so co-op relays them) ----------------
kqBmv('snuff',function(e,A,en){const D=A.dn;if(!D)return {d:.4,lock:0};const lit=D.br.filter(B=>B.lit&&!B.snf).sort((a,b)=>d2(a.p,e.m.position)-d2(b.p,e.m.position));
  const n=Math.min(e.bs.ph>=3?2:1,lit.length-1);if(n<=0)return BMV.orbs(e,A,en);
  kqBossCast(e,RW_COL,1100*en);
  lit.slice(0,n).forEach((B,j)=>{B.snf=1;const T=(1.5+j*.5)*en;
    kqTimed(T,k=>{const p=kqMouth(e),t=Math.random(),h=V(p.x+(B.x-p.x)*t,p.y+(B.y+1.5-p.y)*t+Math.sin(t*Math.PI)*1.2,p.z+(B.z-p.z)*t);burst(h,RW_COL,1,.3,.3,.5);if(Math.random()<.5)burst(V(B.x,B.y+1.5,B.z),0xd8f0ff,1,.4,.8,.4);
        B.fl.scale.x=B.fl.scale.z=1-.6*k},
      ab=>{B.snf=0;B.fl.scale.x=B.fl.scale.z=1;if(!ab&&B.lit)rwSnuff(A,B)},()=>A.f);
    tele(B.p,RW_WARM+.2,T,()=>{if(!A.f)return;burst(V(B.x,B.y+.5,B.z),0xe8f8ff,40,4,2,.7);if(d2(pl.position,B.p)<RW_WARM+.2)bossHit(e,.9)})});
  say(n>1?'❄ The Rime Wraith drains two Warmfires — step out of the frost, then rekindle them!':'❄ The Rime Wraith drains a Warmfire — step out of the frost, then rekindle it!');
  return {d:1.7*en,lock:1}});
kqBmv('thaw',function(e,A,en){const D=A.dn;if(!D)return {d:.4,lock:0};kqBossCast(e,RW_COL,900*en);const n=rwThaw(A,e,D.thawN||1,en);D.thawN=1;if(!n)return BMV.wave(e,A,en);return {d:1.5*en,lock:1}});
kqBmv('whiteout',function(e,A,en){const D=A.dn;if(!D||D.wh||D.whCD>0)return BMV.mines(e,A,en);
  D.wh={t:7.5,nx:1.4};D.whCD=24;burst(gY(e.m.position,1.4),RW_COL,60,3,3,1);kqFlash(gY(e.m.position,1.6),0xffffff,6,400);bxHide(e,true);
  banner('❄ WHITEOUT','The Rime Wraith vanishes into the blizzard','Stay by a Warmfire and keep moving — ice falls where you stand');rwAtm(true);
  return {d:8.6,lock:1}});
// ---------------- atmosphere: blizzard on, blizzard off ----------------
function rwAtm(on){try{const Z=ZATM[2];if(!RW.atm)RW.atm={fog:Z.fog,fm:Z.fm,sun:Z.sun};
  if(on){Z.fog=.085;Z.fm=1.55;Z.sun=.75;ZP.mat.size=.28}else{Z.fog=RW.atm.fog;Z.fm=RW.atm.fm;Z.sun=RW.atm.sun;if(ZP.type=='snow')ZP.mat.size=.14}}catch(err){}}
// ---------------- the hero freezes solid ----------------
function rwBlock(){if(RW.blk)return RW.blk;rwMats();const S=arkSoup(9600),R=S.R;
  S.geo(ARKG.cyl6,arkM4(0,.95,0,.75,1.9,.7),(cy,n)=>arkMix(0xa8dcf0,0xf0faff,cy/2),.1);
  for(let k=0;k<6;k++){const a=k/6*6.283;S.geo(ARKG.cone5,arkM4(Math.cos(a)*.6,.6+R()*.5,Math.sin(a)*.6,.2,.9+R()*.6,.2,Math.sin(a)*.4,0,-Math.cos(a)*.4),0xd8f0ff,.1)}
  const m=S.mesh(RW.iceT);m.castShadow=false;m.renderOrder=3;return RW.blk=m}
function rwBuff(D,tier){const nm='Deep Cold',sp=[0,-.15,-.3][tier]||0;
  if(!tier){if(D.buff){hero.buffs=hero.buffs.filter(b=>b!==D.buff);D.buff=null;hsDirty()}return}
  if(!D.buff||!hero.buffs.includes(D.buff)){hero.buffs=hero.buffs.filter(b=>b.n!=nm);D.buff={n:nm,i:'❄️',s:{mspd:sp},t:nowP()+1500,d:tier>1?'Freezing: −30% move speed':'Chilled: −15% move speed'};hero.buffs.push(D.buff)}
  else{D.buff.s.mspd=sp;D.buff.d=tier>1?'Freezing: −30% move speed':'Chilled: −15% move speed'}hsDirty()}
// ---------------- den hooks ----------------
DEN[2]={build:rwBuild,
  start(A,e){const D=A.dn;if(!D)return;D.cold=0;D.tier=0;D.ph=1;D.snT=11;D.whCD=0;D.wh=null;D.frz=0;D.thawN=1;D._hc=D._hn=-1;D.warn=0;
    D.br.forEach(B=>rwFire(A,B,true));D.br.forEach(B=>{B.wr.visible=B.wd.visible=true});rwHud(true);
    setTimeout(()=>{if(A.f)say('🔥 Deep Cold: away from a Warmfire you freeze. Stand in a fire\'s warm circle to thaw.')},1800)},
  ai(A,e,dt,now){const D=A.dn;if(!D)return false;const b=e.bs,S=BSTY[2];
    // a forced move has been picked: give the pool back
    if(S._p0&&b.last===S._fk){S.pool=S._p0;S._p0=null}
    const force=k=>{if(S._p0)return;S._p0=S.pool;S._fk=k;S.pool=[[k],[k],[k]];b.last='';b.t=Math.min(b.t,.5)};
    if(b.ph>D.ph){D.ph=b.ph;if(b.ph==2){D.thawN=2;force('thaw')}else if(b.ph==3){D.whCD=0;force('whiteout')}}
    D.whCD=Math.max(0,D.whCD-dt);D.snT-=dt;
    if(D.snT<=0&&!D.wh&&!e.hid&&b.t<1.2){const lit=D.br.filter(B=>B.lit&&!B.snf).length;if(lit>1){force('snuff');D.snT=[15,12,10][b.ph-1]}else D.snT=3}
    return false},
  tick(A,e,dt,now){const D=A.dn;if(!D)return;const ph=e.bs.ph,P=pl.position;
    // fires: rekindle by standing beside a dark one
    let warm=false;
    for(const B of D.br){const d=d2(P,B.p);
      if(B.lit){if(d<RW_WARM&&!B.snf)warm=true;B.wr.material.opacity=.32+.12*Math.sin(now/240+B.ph);continue}
      if(!B.snf&&d<2.4&&hero.hp>0){B.rk+=dt/2.0;if(Math.random()<.3)burst(V(B.x,B.y+1.3,B.z),0xffa040,2,.5,1,.5)}else B.rk=Math.max(0,B.rk-dt*.6);
      B.rl.visible=B.rk>0;if(B.rk>0)B.rl.scale.setScalar(2.4-2.0*B.rk);
      if(B.rk>=1){rwFire(A,B,true);ring(B.p,0xffa040,4,400);burst(V(B.x,B.y+1.5,B.z),0xffb050,40,2,3,.8);popT(V(B.x,0,B.z),'🔥 Rekindled!','#ffc070')}}
    // deep cold
    if(D.frz>0){D.frz-=dt;if(RW.blk)RW.blk.position.set(P.x,GH(P.x,P.z),P.z);
      if(D.frz<=0){if(RW.blk)scene.remove(RW.blk);hero.buffs=hero.buffs.filter(b=>b.n!='Frozen');hsDirty();burst(gY(P,1),0xe8f8ff,40,3,3,.7);D.cold=45}}
    else{const rate=[5.5,7,8.5][ph-1]*(D.wh?1.7:1);D.cold=warm?Math.max(0,D.cold-30*dt):Math.min(100,D.cold+rate*dt);
      if(D.cold>=85&&!D.warn){D.warn=1;popT(P,'❄ Freezing! Get to a fire!','#bfe8ff')}if(D.cold<70)D.warn=0;
      if(D.cold>=100&&hero.hp>0){D.frz=1.5;D.cold=100;const m=rwBlock();m.position.set(P.x,GH(P.x,P.z),P.z);scene.add(m);
        hero.buffs=hero.buffs.filter(b=>b.n!='Frozen');hero.buffs.push({n:'Frozen',i:'🧊',s:{mspd:-1},t:nowP()+1500,d:'Frozen solid'});hsDirty();
        popT(P,'🧊 FROZEN SOLID','#d8f4ff',true);burst(gY(P,1),RW_COL,40,2,2,.6);shake(.2);if(hero.iv<=0)bossHit(e,.7)}}
    const tier=D.frz>0?2:D.cold>=67?2:D.cold>=34?1:0;if(tier!==D.tier){D.tier=tier;rwBuff(D,tier)}if(D.buff)D.buff.t=now+1500;
    if(D.cold>50&&Math.random()<dt*D.cold/30)burst(gY(P,.8+Math.random()),0xe8f8ff,1,.4,.6,.6);
    rwHudSet(D);
    // whiteout: driving snow, falling ice, then the wraith re-forms beside you
    if(D.wh){const W2=D.wh;W2.t-=dt;W2.nx-=dt;
      try{const ps=ZP.pos,N=ZP.N,w=14*dt;for(let i=0;i<N;i++){ps[i*3]+=w;ps[i*3+1]-=w*.4}}catch(err){}
      if(W2.nx<=0&&W2.t>.8){W2.nx=1.15;const q=inArena(A,P.clone().add(V((Math.random()-.5)*1.4,0,(Math.random()-.5)*1.4)));kqFall(A,q,.95,RW_COL,'spike',1.3);
        tele(q,1.8,.95,()=>{if(!A.f)return;burst(gY(q,.4),0xe8f8ff,24,2,2,.5);ring(q,RW_COL,3,300);if(d2(pl.position,q)<1.8)bossHit(e,1)})}
      if(W2.t<=0){D.wh=null;rwAtm(false);const a=Math.random()*6.283,q=inArena(A,P.clone().add(V(Math.cos(a)*5,0,Math.sin(a)*5)),2);e.m.position.set(q.x,0,q.z);bxHide(e,false);
        burst(gY(q,1.4),RW_COL,60,3,3,1);kqFlash(gY(q,1.5),0xffffff,5,400);const o=q.clone();tele(o,4.2,1.0,()=>{if(!A.f)return;ring(o,RW_COL,8,420);burst(gY(o,.5),0xe8f8ff,60,5,3,.8);shake(.25);if(d2(pl.position,o)<4.2)bossHit(e,1.3)});
        say('❄ The blizzard breaks — the wraith re-forms beside you!');rwThaw(A,e,1,1)}}},
  clear(A,won){const D=A.dn;if(!D)return;D.wh=null;rwAtm(false);D.frz=0;D.cold=0;if(RW.blk)scene.remove(RW.blk);
    hero.buffs=hero.buffs.filter(b=>b.n!='Deep Cold'&&b.n!='Frozen');D.buff=null;D.tier=0;hsDirty();rwHud(false);
    D.br.forEach(B=>{B.snf=0;B.fl.scale.set(1,1,1);rwFire(A,B,true);B.wr.visible=B.wd.visible=false});
    D.st.forEach(s=>{s.ok=true;s.crk=0;s.fig.visible=s.ice.visible=true;s.brk.visible=false;s.gl.visible=false;s.g.position.set(s.x,GH(s.x,s.z),s.z);denBlock(s.x,s.z)});
    const S=BSTY[2];if(S._p0){S.pool=S._p0;S._p0=null}},
  seal(A,on){const D=A.dn;if(!D)return;const s=D.seal,y1=-4.2;if(on){s.visible=true;s.position.y=y1;
      tw(650,k=>{s.position.y=y1*(1-k*k*(3-2*k))},()=>{});shake(.25)}
    else tw(800,k=>{s.position.y=y1*k},()=>{if(!A.f)s.visible=false})}};
// the wraith's moves: snuff and thaw join its pool; whiteout is its Phase III signature
if(BSTY[2])BSTY[2].pool=[['orbs','fade','prison'],['clones','beam','thaw'],['mines','wave','whiteout']];
