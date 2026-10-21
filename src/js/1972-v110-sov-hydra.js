// ================= v110/v112 Sovereign 1 — The Crest Hydra (Hillside Crest) =================
// Model (v112): a scaled serpent mound coiled in the mere. The coils carry ridged dorsal plates, spines, side scales, a
// pale belly band, glowing venom veins, barnacles, hanging weed and old trophies (broken spears with rags, a sunken
// shield, a rusted chain, a sword in the flank, a skull on the back spine). A thick trunk rises from the coils into a
// muscular yoke; three necks (five segments each) grow out of it through flared root sleeves, every segment with a
// ball joint cap, overlapping plates, belly scutes and side scales so no gap opens at any bend. Each head has a plated
// skull, brow ridges, glowing eyes, nostrils, two pairs of horns, cheek spikes and frills, a fanged jaw with a throat,
// a forked tongue (it flicks), and a crest fan of spines and membrane. A plated tail ends in a spiked club.
// Every pose lists every joint (missing ones = rest), so moves blend in and out of the idle without a snap.
// Pattern (learnable):
//  any range ── Fang Strike: one head (the one on your side) rears back, mouth wide, then strikes down a line at you.
//              Serpent Fury (Phase I): left, centre, right in a fixed rhythm — sidestep three times.
//              Undertow (new): all three heads rear, then plunge into the mere; three wakes race under the water to
//              where you stand and burst as venom geysers (red circles, one after another) — keep moving.
//  close    ── Neck Sweep: all three heads drop low to one side, then sweep the front — dash through it or get far away.
//              Coil Surge: the coils tighten and the water bursts out in a ring around the body.
//  behind   ── Tail Slam: the tail rears up behind it and crashes down along a line.
//  far      ── Venom Spit: the centre head gulps and lobs three globs onto you; they leave burning pools.
//              Mire Rush (new): the Hydra draws all three heads back like a coiled spring (a long red lane shows), then
//              surges down the lane with a bow wave and all three jaws snap at its end — step off the lane.
//  Phase II (55%) "The Crests Flare": the crests glow and spread, the veins burn; adds Venom Breath (three cones: left
//              and right first, then the centre — stand in the centre gap, then leave it), Venom Deluge (drops rain
//              around you; keep moving), Serpent Fury in four strikes, and
//              Venom Maelstrom (new): the necks splay out, a red ring marks the reach, then the Hydra spins one and a
//              half turns spraying three venom streams across the ring — leave the ring or dash through a stream.
//  Every move has a cooldown; the Hydra is staggered when its posture breaks (big moves finish first).
var HYD={col:0x7ac850,ven:0x9aff4a,crest:0xd8ff60,foam:0xcfeee0};
// ---------------- model ----------------
// orient mesh o so its local +Z points along f and +Y toward u
function hydQ(o,f,u){const z=f.clone().normalize(),x=new THREE.Vector3().crossVectors(u,z).normalize(),y=new THREE.Vector3().crossVectors(z,x);o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));return o}
function hydOn(R,j,geo,mat,p,f,u,sx,sy,sz){const m=svM(R,j,geo,mat,p.x,p.y,p.z,0,0,0,sx,sy,sz);return hydQ(m,f,u)}
// the coil spiral (outer end dips under the mere bed, inner end rises into the trunk)
function hydCoilP(k){const a=k*Math.PI*3.3+.6,r=3.35-1.75*k,y=.55+1.3*k+.18*Math.sin(k*9)-.95*Math.pow(Math.max(0,1-k/.14),2);return new THREE.Vector3(Math.sin(a)*r,y,Math.cos(a)*r)}
function hydCoilF(k){const V3=THREE.Vector3,p=hydCoilP(k),t=hydCoilP(Math.min(1,k+.004)).sub(hydCoilP(Math.max(0,k-.004))).normalize(),a=k*Math.PI*3.3+.6,
  up=new V3(0,1,0),u=up.clone().addScaledVector(t,-t.dot(up)).normalize(),rad=new V3(Math.sin(a),0,Math.cos(a));rad.addScaledVector(t,-t.dot(rad)).addScaledVector(u,-u.dot(rad)).normalize();
  return {p,t,u,rad,rx:1.05-.3*k,ry:.9-.22*k}}
// a point on the tube's surface: th = angle from the top toward the outside
function hydCoilS(F,th,o){o=o==null?1:o;return F.p.clone().addScaledVector(F.rad,Math.sin(th)*F.rx*o).addScaledVector(F.u,Math.cos(th)*F.ry*o)}
function hydCoilN(F,th){return F.rad.clone().multiplyScalar(Math.sin(th)/F.rx).addScaledVector(F.u,Math.cos(th)/F.ry).normalize()}
// the trunk profile [y, rx, rz, oz] and the chest band [y, rx, rz, oz]; points on their surfaces (a = angle from the front)
var HYDT=[[-.2,1.8,1.8,0],[1.1,1.62,1.52,0],[2.0,1.42,1.28,-.04],[2.7,1.6,1.16,-.08],[3.3,1.42,.98,-.14],[3.7,.95,.7,-.2],[3.9,.4,.35,-.22]],
  HYDC=[[.2,.95,.5,1.32],[1.4,.9,.48,1.2],[2.4,.85,.42,1.02],[3.1,.6,.3,.82]];
function hydProf(T,y){let i=0;while(i<T.length-2&&T[i+1][0]<y)i++;const A=T[i],B=T[i+1],k=Math.max(0,Math.min(1,(y-A[0])/(B[0]-A[0])));return [A[1]+(B[1]-A[1])*k,A[2]+(B[2]-A[2])*k,A[3]+(B[3]-A[3])*k]}
function hydTrunk(y,a,o){o=o==null?1:o;const [rx,rz,oz]=hydProf(HYDT,y);return new THREE.Vector3(Math.sin(a)*rx*o,y,oz+Math.cos(a)*rz*o)}
function hydTrunkN(y,a,up){const [rx,rz]=hydProf(HYDT,y);return new THREE.Vector3(Math.sin(a)/rx,up||0,Math.cos(a)/rz).normalize()}
var HYDG={
  plate:()=>svG('hy2_pl',()=>svLoftZ([[0,.5,.05,0,0],[.45,.47,.08,0,.03],[.8,.25,.06,0,.02],[1.0,.03,.02,0,0]],4)),
  scale:()=>svG('hy2_sc',()=>new THREE.OctahedronGeometry(1,0)),
  ball:()=>svG('hy2_ball',()=>svLump(1,1,.05,5)),
  lump:()=>svG('hy2_lump',()=>svLump(1,0,.3,8)),
  spine:()=>svG('hy2_spn',()=>svHorn(.11,.55,0,-.22,4,3)),
  spike:()=>svG('hy2_spk',()=>svHorn(.08,.4,0,0,4,2)),
  fang:()=>svG('hy2_fg',()=>svHorn(.045,.26,0,0,4,2)),
  rod:()=>svG('hy2_rod',()=>new THREE.CylinderGeometry(.045,.05,1,5,1).rotateX(Math.PI/2).toNonIndexed())};
function hydBuild(R,e){
  const sk=svMat(R,0x173020,{roughness:.58,metalness:.18,emissive:0x030803}),sk2=svMat(R,0x2a4a26,{roughness:.55,metalness:.14}),bel=svMat(R,0x8a8258,{roughness:.8,emissive:0x080602}),
    dk=svMat(R,0x0c1a10,{roughness:.45,metalness:.25}),horn=svMat(R,0xa49878,{roughness:.55}),fang=svMat(R,0xd8d0b8,{roughness:.4}),gum=svMat(R,0x4e1020,{roughness:.6,emissive:0x0c0206}),
    mem=svMat(R,0x4a1a22,{roughness:.6,side:THREE.DoubleSide,emissive:0x100204}),weed=svMat(R,0x1e2a14,{roughness:.9,side:THREE.DoubleSide}),
    wood=svMat(R,0x4a3624,{roughness:.9}),iron=svMat(R,0x5a4c40,{roughness:.55,metalness:.55}),
    eye=svGlowMat(R,0xe8ff60),crestG=svGlowMat(R,0x5a7a30),vein=svGlowMat(R,0x2c5a1c);R.crestG=crestG;R.memM=mem;R.veinG=vein;R.eyeG=eye;
  const V3=THREE.Vector3,J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),G=HYDG;
  J('root',null,0,0,0);J('body','root',0,0,0);
  // ---- the coils ----
  svM(R,'body',svG('hy2_coil',()=>{const P=[],Rr=[];for(let i=0;i<=56;i++){const k=i/56;P.push(hydCoilP(k).toArray());Rr.push([1.05-.3*k,.9-.22*k])}return svTube(P,Rr,12)}),sk);
  svM(R,'body',svG('hy2_coilb',()=>{const P=[],Rr=[];for(let i=0;i<=44;i++){const k=i/44,F=hydCoilF(k),q=hydCoilS(F,Math.PI*1.18,.62);P.push(q.toArray());Rr.push([.5-.12*k,.42-.1*k])}return svTube(P,Rr,6)}),bel);
  for(let i=2;i<=54;i++){const k=i/56,F=hydCoilF(k),back=F.t.clone().negate();
    // dorsal plates (shingles pointing to the outer end), every third one a spine
    hydOn(R,'body',G.plate(),dk,hydCoilS(F,0,.96),back,F.u,F.rx*1.15,1,.62);
    if(i%3===0)hydOn(R,'body',G.spine(),horn,hydCoilS(F,0,.98),F.u.clone().multiplyScalar(.8).addScaledVector(back,.6),back.clone().negate(),1.1+.6*(1-k));
    // two rows of side scales on the outer flank
    [.95,1.55].forEach((th,r)=>{if((i+r)%2)return;const n=hydCoilN(F,th);hydOn(R,'body',G.scale(),sk2,hydCoilS(F,th,.97),back,n,.24*F.rx,.08,.3)});
    // barnacles low on the outer turn
    if(k<.45&&i%4===1)for(let b=0;b<3;b++){const th=1.75+b*.18,n=hydCoilN(F,th);hydOn(R,'body',G.lump(),horn,hydCoilS(F,th,.98),n,back,.1+.04*b,.1+.04*b,.07)}}
  // venom veins along the outer flank and under the plates
  [[1.15,.05],[-.9,.04]].forEach(([th,w],q)=>svM(R,'body',svG('hy2_vn'+q,()=>{const P=[];for(let i=3;i<=52;i++){const F=hydCoilF(i/56);P.push(hydCoilS(F,th+.12*Math.sin(i*.9),1.0).toArray())}return svTube(P,w,4)}),vein));
  // hanging weed
  for(let i=0;i<9;i++){const k=.06+i*.1,F=hydCoilF(k),s=hydCoilS(F,1.55,.99),dn=new V3(0,-1,0);
    svM(R,'body',svG('hy2_wd'+i,()=>{const P=[s,s.clone().addScaledVector(F.rad,.18).addScaledVector(dn,.35),s.clone().addScaledVector(F.rad,.12).addScaledVector(dn,.8).addScaledVector(F.t,.1),s.clone().addScaledVector(F.rad,.05).addScaledVector(dn,1.3)].map(v=>v.toArray());
      return svTube(P,[[.13,.015],[.11,.015],[.08,.012],[.02,.01]],4,{cap:false})}),weed)}
  // ---- the trunk and the yoke the necks grow from ----
  svM(R,'body',svG('hy2_trk',()=>svLoft(HYDT.map(([y,rx,rz,oz])=>[y,rx,rz,0,oz]),12)),sk);
  [[1.28,2.7,-.08,1.0],[-1.28,2.7,-.08,1.0],[0,3.05,.2,1.0]].forEach(([x,y,z,s])=>svM(R,'body',G.ball(),sk,x,y,z,0,0,0,s*.95,s*.9,s));
  // chest: the pale belly front with scute ridges, two veins
  svM(R,'body',svG('hy2_chst',()=>svLoft(HYDC.map(([y,rx,rz,oz])=>[y,rx,rz,0,oz]),8)),bel);
  for(let r=0;r<7;r++){const y=.45+r*.4,[rx,rz,oz]=hydProf(HYDC,y);svM(R,'body',G.scale(),bel,0,y,oz+rz-.05,-.25,0,0,rx*.88,.07,.16)}
  [-1,1].forEach(q=>svM(R,'body',svG('hy2_cv'+q,()=>{const P=[];for(let i=0;i<=8;i++){const y=.3+i*.37;P.push(hydTrunk(y,q*(.82+.12*Math.sin(i*1.3)),1.0).toArray())}return svTube(P,.05,4)}),vein));
  // back armour: three rows of big overlapping plates and a ridge of spines
  for(let r=0;r<4;r++)for(let c=-2;c<=2;c++){const a=Math.PI+c*.42+(r%2)*.21,y=1.25+r*.62;hydOn(R,'body',G.plate(),dk,hydTrunk(y,a,1.0),new V3(0,-1,0),hydTrunkN(y,a,.35),1.0,1.2,.85)}
  for(let r=0;r<6;r++){const y=.8+r*.5;hydOn(R,'body',G.spine(),horn,hydTrunk(y,Math.PI,.97),new V3(0,.55,-.83),new V3(0,1,0),1.6-r*.08)}
  // ---- trophies ----
  // broken spears with rags
  [[.32,.3,.6],[.55,-.2,.9],[.78,.1,1.1]].forEach(([k,sd,ln],i)=>{const F=hydCoilF(k),s=hydCoilS(F,.5+sd,.9),d=F.u.clone().multiplyScalar(.8).addScaledVector(F.rad,.55).addScaledVector(F.t,.25*(i-1)).normalize();
    hydOn(R,'body',G.rod(),wood,s.clone().addScaledVector(d,ln*.8),d,F.t,1,1,ln*2);
    hydOn(R,'body',G.spike(),wood,s.clone().addScaledVector(d,ln*1.8),d,F.t,.9,.9,.5);
    svM(R,'body',svG('hy2_rag'+i,()=>{const a=s.clone().addScaledVector(d,ln*1.35),P=[a,a.clone().add(new V3(.06,-.4,.05)),a.clone().add(new V3(.14,-.85,.02))].map(v=>v.toArray());return svTube(P,[[.2,.012],[.16,.012],[.06,.01]],4,{cap:false})}),weed)});
  // a sunken shield on the outer turn
  {const F=hydCoilF(.2),s=hydCoilS(F,1.35,1.02),n=hydCoilN(F,1.35);hydOn(R,'body',svG('hy2_shd',()=>new THREE.CylinderGeometry(.62,.62,.07,9,1).rotateX(Math.PI/2).toNonIndexed()),iron,s,n,F.t);
    hydOn(R,'body',G.lump(),iron,s.clone().addScaledVector(n,.07),n,F.t,.16,.16,.1);
    hydOn(R,'body',svG('hy2_shr',()=>new THREE.TorusGeometry(.62,.05,4,9).toNonIndexed()),wood,s.clone().addScaledVector(n,.02),n,F.t)}
  // a rusted chain draped over the coils
  {const F0=hydCoilF(.42),F1=hydCoilF(.5),a=hydCoilS(F0,.2,1.02),b=hydCoilS(F1,.9,1.02),N=10;for(let i=0;i<N;i++){const k=i/(N-1),p=a.clone().lerp(b,k);p.y+=.25*Math.sin(k*Math.PI)-.05;
    const q=a.clone().lerp(b,Math.min(1,k+.05)).sub(a.clone().lerp(b,Math.max(0,k-.05)));hydOn(R,'body',svG('hy2_lnk',()=>new THREE.TorusGeometry(.12,.032,4,6).scale(1,1.5,1).rotateX(Math.PI/2).toNonIndexed()),iron,p,q,i%2?new V3(0,1,0):F0.rad)}}
  // a sword in the flank
  {const p=hydTrunk(1.75,-1.2,1.0),d=hydTrunkN(1.75,-1.2,.3),bd=d.clone().negate();hydOn(R,'body',svG('hy2_swd',()=>{const g=svBlade([[-.07,0],[.07,0],[.06,1.1],[0,1.25],[-.06,1.1]],.03);g.rotateX(Math.PI/2);return g.index?g.toNonIndexed():g}),iron,p.clone().addScaledVector(d,.6),bd,new V3(0,1,0));
    hydOn(R,'body',G.rod(),wood,p.clone().addScaledVector(d,.82),d,new V3(0,1,0),1.1,1.1,.36);hydOn(R,'body',G.scale(),iron,p.clone().addScaledVector(d,.62),d,new V3(0,1,0),.28,.05,.05);hydOn(R,'body',G.lump(),iron,p.clone().addScaledVector(d,1.02),d,new V3(0,1,0),.06,.06,.06)}
  // a skull impaled on the tallest back spine
  {const b=hydTrunk(2.55,Math.PI,.95),d=new V3(0,.75,-.66).normalize(),p=b.clone().addScaledVector(d,.85);hydOn(R,'body',G.spike(),horn,b,d,new V3(0,0,1),1.4,1.4,2.9);
    svM(R,'body',G.lump(),horn,p.x,p.y,p.z,0,0,0,.26,.24,.3);svM(R,'body',G.scale(),gum,.09,p.y+.03,p.z-.24,0,0,0,.06,.06,.04);svM(R,'body',G.scale(),gum,-.09,p.y+.03,p.z-.24,0,0,0,.06,.06,.04);
    svM(R,'body',G.lump(),horn,p.x,p.y-.2,p.z-.12,0,0,0,.17,.08,.18)}
  // ---- three necks (five segments each), heads ----
  const NK=[['C',0,3.2,.35,0],['L',1.05,2.9,-.1,.35],['R',-1.05,2.9,-.1,-.35]];
  NK.forEach(([s,x,y,z,ry])=>{let p='body';for(let k=0;k<5;k++){const n='n'+k+s,r0=.8-.075*k,r1=r0-.075;J(n,p,k?0:x,k?0:y,k?.92:z,k?.2:-1.2,k?0:ry,0);
      svM(R,n,svG('hy2_nk'+k,()=>svLoftZ([[-.12,r0*.97,r0*.89],[.25,r0*1.01,r0*.93,0,.01],[.6,(r0+r1)*.5,(r0+r1)*.46,0,.01],[1.0,r1*.98,r1*.9]],10)),sk);
      svM(R,n,G.ball(),sk,0,0,0,0,0,0,r0*.96,r0*.88,r0*.96);
      if(k===0)svM(R,n,svG('hy2_nsl',()=>svLoftZ([[-1.25,r0*1.5,r0*1.32,0,-.12],[-.7,r0*1.3,r0*1.16,0,-.06],[-.2,r0*1.06,r0*.96],[.1,r0*.99,r0*.9]],10)),sk);
      svM(R,n,svG('hy2_nb'+k,()=>svLoftZ([[-.1,r0*.6,r0*.28,0,-r0*.7],[.98,r1*.6,r1*.28,0,-r1*.7]],6)),bel);
      for(let f=0;f<3;f++)svM(R,n,G.scale(),bel,0,-r0*.93+f*.01,.12+f*.3,0,0,0,r0*.55,.06,.12);
      // dorsal shingles and a spine
      for(let f=0;f<2;f++)svM(R,n,G.plate(),dk,0,r0*.86-f*.02,.5+f*.45,.14,Math.PI,0,r0*1.25,1,.6);
      if(k<4)svM(R,n,G.spine(),bel,0,r0*.88,.35,-1.85,0,0,1.1-k*.1);
      // side scales
      [-1,1].forEach(q=>{for(let f=0;f<3;f++)for(let rw=0;rw<2;rw++){const a=q*(1.05+rw*.55),rr=r0-(r0-r1)*(f/3),zz=.1+f*.3+rw*.15;const m=svM(R,n,G.scale(),dk,Math.sin(a)*rr*.93,Math.cos(a)*rr*.86,zz,0,0,0,.16,.05,.2);
        hydQ(m,new V3(0,0,-1),new V3(Math.sin(a),Math.cos(a),0))}});
      if(k===4)[-1,1].forEach(q=>{for(let f=0;f<3;f++){const m=svM(R,n,G.scale(),vein,q*r0*.9,-.05,.25+f*.17,0,0,0,.03,.15,.05);m.rotation.z=q*.3}});
      p=n}
    const h=J('h'+s,p,0,0,.92,.6);
    svM(R,h,G.ball(),sk,0,0,0,0,0,0,.48,.45,.5);
    // skull (cranium + snout), brow ridges, nasal plates
    svM(R,h,svG('hy2_hd',()=>svLoftZ([[-.42,.44,.42,0,.12],[-.05,.56,.48,0,.14],[.35,.54,.42,0,.16],[.75,.42,.32,0,.12],[1.15,.3,.22,0,.04],[1.5,.17,.12,0,-.04],[1.6,.07,.05,0,-.06]],10)),sk);
    [-1,1].forEach(q=>svM(R,h,svG('hy2_brw',()=>svLoftZ([[-.1,.16,.08],[.35,.15,.09,0,.02],[.75,.03,.03]],5)),dk,q*.3,.5,.12,-.1,q*.22,q*.12));
    for(let f=0;f<4;f++){const zz=.62+f*.26,ty=[.42,.34,.24,.13][f];svM(R,h,G.plate(),dk,0,ty-.02,zz+.16,.02,Math.PI,0,.44-f*.07,.8,.3)}
    for(let f=0;f<3;f++)svM(R,h,G.plate(),dk,0,.58-f*.02,-.22+f*.24,.06,Math.PI,0,.56,.8,.32);
    [-1,1].forEach(q=>{svM(R,h,G.lump(),gum,q*.1,.06,1.5,0,0,0,.05,.04,.05);
      // eyes (slit, glowing) with a socket ridge
      svM(R,h,svG('hy2_eye',()=>new THREE.SphereGeometry(.1,6,5).scale(1,.6,1.3).toNonIndexed()),eye,q*.44,.3,.5,0,q*.35,0);
      // horns: a big back-swept pair and a smaller lower pair; cheek spikes
      svM(R,h,svG('hy2_hn',()=>svHorn(.13,1.25,0,.38,6,5)),horn,q*.3,.5,-.1,-2.6,q*.35,0);
      svM(R,h,svG('hy2_hn2',()=>svHorn(.08,.7,0,.2,5,4)),horn,q*.42,.28,-.25,-2.85,q*.7,0);
      for(let f=0;f<3;f++)svM(R,h,G.spike(),horn,q*(.5-.03*f),.02-.03*f,-.1+f*.22,0,q*(2.3-.15*f),0,.8,.8,.9);
      // upper fangs
      for(let f=0;f<5;f++){const zz=.42+f*.18;svM(R,h,G.fang(),fang,q*(.41-.2*(zz-.2)/1.1+.02),-.13,zz,1.65,0,0)}
      svM(R,h,G.fang(),fang,q*.12,-.12,1.32,1.7,0,0,1.3,1.3,1.4);
      // cheek frill: three spines and a membrane
      const fr=svM(R,h,svG('hy2_cfm',()=>{const P=[[0,0,0],[.15,.42,-.55],[.38,.12,-.62],[.4,-.2,-.42]],pos=[];for(let i=1;i<3;i++)pos.push(...P[0],...P[i],...P[i+1]);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g}),mem,q*.5,.12,-.12,0,0,0,q,1,1);
      [[.42,-.55],[.12,-.62],[-.2,-.42]].forEach(([yy,zz])=>{const m=svM(R,h,G.spike(),horn,q*.5,.12,-.12,0,0,0,.6,.6,1.6);hydQ(m,new V3(q*(yy===.12?.38:yy>0?.15:.4),yy,zz),new V3(q,0,0))})});
    // the throat: dark flesh behind the jaw, seen when the mouth opens; the palate
    svM(R,h,svG('hy2_thr',()=>svLoftZ([[-.3,.34,.24,0,-.22],[.35,.3,.16,0,-.24],[.9,.18,.06,0,-.18]],7)),gum);
    svM(R,h,svG('hy2_pal',()=>svLoftZ([[.05,.36,.05,0,-.27],[1.3,.13,.04,0,-.2]],6)),gum);
    // the crest: a fan of spines with membrane between them, glowing nodes
    const cr=J('cr'+s,'h'+s,0,.5,-.2);for(let f=0;f<7;f++){const a=-1.2+f*.4;svM(R,cr,svG('hy2_cs',()=>svHorn(.07,1.25,0,-.25,4,4)),horn,0,0,0,-2.2+Math.abs(a)*.2,a,0)}
    svM(R,cr,svG('hy2_mem',()=>{const P=[0,0,0];for(let f=0;f<=6;f++){const a=-1.2+f*.4;P.push(Math.sin(a)*1.05,Math.cos(a)*.9,-.55)}const pos=[];for(let f=0;f<6;f++)pos.push(0,0,0,P[3+f*3],P[4+f*3],P[5+f*3],P[6+f*3],P[7+f*3],P[8+f*3]);
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g}),mem,0,0,0,-.35,0,0);
    for(let f=0;f<5;f++){const a=-.8+f*.4;svM(R,cr,svG('hy2_cg',()=>new THREE.OctahedronGeometry(.07,0)),crestG,Math.sin(a)*.7,Math.cos(a)*.6+.05,-.42)}
    svM(R,cr,G.lump(),horn,0,0,0,0,0,0,.2,.16,.22);
    // the jaw: hinge, plated chin, lower fangs, a forked tongue
    const jw=J('j'+s,'h'+s,0,-.2,.05);
    svM(R,jw,svG('hy2_jw',()=>svLoftZ([[-.32,.42,.22,0,-.1],[.2,.4,.17,0,-.06],[.7,.3,.11,0,-.03],[1.3,.15,.07,0,0],[1.42,.06,.04]],8)),sk);
    svM(R,jw,svG('hy2_chn',()=>svLoftZ([[-.2,.3,.08,0,-.25],[.9,.18,.05,0,-.12],[1.3,.06,.03,0,-.06]],6)),bel);
    [-1,1].forEach(q=>{svM(R,jw,G.lump(),sk,q*.4,-.02,-.12,0,0,0,.16,.16,.2);
      for(let f=0;f<4;f++)svM(R,jw,G.fang(),fang,q*(.27-.045*f),.04,.48+f*.2,-1.6,0,0);
      svM(R,jw,G.spike(),fang,q*.18,-.28,.6,.9,q*.2,0,.6,.6,.7)});
    const tn=J('tn'+s,'j'+s,0,.02,.15);
    svM(R,tn,svG('hy2_tg',()=>svLoftZ([[0,.1,.03],[.8,.06,.02]],5)),gum);
    [-1,1].forEach(q=>svM(R,tn,svG('hy2_tf',()=>svHorn(.025,.28,0,0,4,2)),gum,q*.02,0,.78,0,q*.22,0))});
  // ---- the tail: six plated segments with ball joints, a spiked club ----
  let p='body';for(let k=0;k<6;k++){const n='t'+k,r=.72-.1*k,r1=r-.1;J(n,p,0,k?0:.62,k?-1.0:-2.75,k?-.04:0,0,0);
    svM(R,n,svG('hy2_t'+k,()=>svLoftZ([[.12,r*.98,r*.86],[-.5,(r+r1)*.52,(r+r1)*.45,0,.01],[-1.04,r1*.98,r1*.86]],9)),sk);
    svM(R,n,G.ball(),sk,0,0,0,0,0,0,r*.96,r*.86,r*.96);
    if(k===0)svM(R,n,svG('hy2_tsl',()=>svLoftZ([[1.5,r*1.45,r*1.3,0,-.15],[.8,r*1.25,r*1.1,0,-.06],[.1,r*1.02,r*.9]],9)),sk);
    svM(R,n,svG('hy2_tb'+k,()=>svLoftZ([[.1,r*.6,r*.26,0,-r*.68],[-1.0,r1*.6,r1*.26,0,-r1*.68]],6)),bel);
    for(let f=0;f<2;f++)svM(R,n,G.plate(),dk,0,r*.84,-.05-f*.45,.14,Math.PI,0,r*1.3,1,.6);
    svM(R,n,G.spine(),bel,0,r*.86,-.45,-1.85,0,0,1-.08*k);
    [-1,1].forEach(q=>{for(let f=0;f<2;f++){const a=q*1.2;const m=svM(R,n,G.scale(),dk,Math.sin(a)*r*.9,Math.cos(a)*r*.82,-.2-f*.45,0,0,0,.15,.05,.19);hydQ(m,new V3(0,0,-1),new V3(Math.sin(a),Math.cos(a),0))}});
    p=n}
  svM(R,'t5',G.lump(),dk,0,0,-1.05,0,0,0,.36,.3,.5);
  svM(R,'t5',svG('hy2_tc',()=>svHorn(.24,1.2,0,.3,6,5)),horn,0,0,-1.2,-3.0,0,0);
  for(let f=0;f<5;f++){const a=f/5*6.283;const m=svM(R,'t5',G.spike(),horn,Math.sin(a)*.26,Math.cos(a)*.22,-1.05,0,0,0,1.1,1.1,1.3);hydQ(m,new V3(Math.sin(a),Math.cos(a),-.6),new V3(0,0,-1))}
  svM(R,'t5',G.scale(),vein,0,.25,-.75,0,0,0,.05,.05,.3);
}
// ---------------- animation ----------------
var HYDJN=(()=>{const L=['body'];['C','L','R'].forEach(s=>{for(let k=0;k<5;k++)L.push('n'+k+s);L.push('h'+s,'cr'+s,'j'+s,'tn'+s)});for(let k=0;k<6;k++)L.push('t'+k);return L})();
// the base layer: breathing, a slow weave of the necks, heads that follow you, a swaying tail; slithering adds a body sway
function hydLoco(e,S,O,dt,now){const t=now/1000,a=Math.min(1,S.spd/1.4),m=e.m;
  const tg=AF?Math.max(-1.1,Math.min(1.1,svAng(svYawTo(m,pl.position)-m.rotation.y))):0;S.hdy=(S.hdy||0)+(tg-(S.hdy||0))*Math.min(1,dt*2.5);const dy=S.hdy;
  O.body[4]+=.05*Math.sin(t*1.2);O.body[1]+=.04*Math.sin(t*.4)+.07*a*Math.sin(t*2.2);O.body[2]+=.03*a*Math.sin(t*2.2+1);
  [['C',0],['L',2.1],['R',4.2]].forEach(([s,ph])=>{for(let k=0;k<5;k++){const o=O['n'+k+s];o[0]+=.06*Math.sin(t*1.3+ph-k*.55)*(1+.6*a);o[1]+=.08*Math.sin(t*.8+ph-k*.6)+dy*.045;o[2]+=.03*Math.sin(t*.7+ph-k*.4)}
    O['h'+s][0]+=.06*Math.sin(t*1.7+ph);O['h'+s][1]+=dy*.1;O['j'+s][0]+=.06+.06*Math.max(0,Math.sin(t*1.1+ph*1.7));O['cr'+s][0]+=.05*Math.sin(t*2+ph)});
  for(let k=0;k<6;k++){const o=O['t'+k];o[1]+=Math.sin(t*1.1-k*.6)*(.07+.03*k)*(1+a*1.5);o[0]+=.03*Math.sin(t*.9-k*.5)}}
// the life layer on top of everything (also during moves): tongue flicks, crest flutter, the Phase II glow
function hydPost(e,S,dt,now){const R=S.R,t=now/1000,on=S.ph>1;S.crk=(S.crk||0)+((on?1:0)-(S.crk||0))*Math.min(1,dt*1.5);const ck=S.crk;
  const k=.55+.45*Math.sin(now/180);R.crestG.color.setHex(HYD.crest).multiplyScalar(.25+ck*(.35+.4*k)+(1-ck)*.12);
  R.veinG.color.setHex(HYD.ven).multiplyScalar(.28+ck*(.3+.35*Math.sin(now/260))+.06*Math.sin(t*1.3));
  R.eyeG.color.setHex(on?0xffff90:0xe8ff60);
  ['C','L','R'].forEach((s,i)=>{const cr=R.J['cr'+s];cr.scale.setScalar(1+.25*ck);
    const tn=R.J['tn'+s],f=(t+i*1.9)%6.2;if(f<.7&&!e.dead){const x=Math.sin(f/.7*Math.PI);tn.position.z+=.62*x;tn.rotation.x+=.12*Math.sin(f*38)*x;R.J['j'+s].rotation.x+=.1*x}})}
var HYDP={
  rest:{},
  // fang strike, left head (mirror for the right); the centre head has its own
  rearL:{n0L:[-.35,-.15,0],n1L:[-.35,0,0],n2L:[-.3,0,0],n3L:[-.25,0,0],n4L:[-.1,0,0],hL:[-.55,0,0],jL:[.85,0,0],crL:[-.3,0,0],body:[0,.12,0],n0C:[0,.15,0],n0R:[.1,.2,0]},
  strL:{n0L:[.55,-.2,0],n1L:[.35,0,0],n2L:[.3,0,0],n3L:[.2,0,0],n4L:[.05,0,0],hL:[.15,0,0],jL:[.15,0,0],crL:[.25,0,0],body:[0,-.12,0,0,0,.1]},
  recL:{n0L:[.35,-.15,0],n1L:[.25,0,0],n2L:[.2,0,0],n3L:[.1,0,0],hL:[.2,0,0],jL:[.25,0,0]},
  rearC:{n0C:[-.3,0,0],n1C:[-.35,0,0],n2C:[-.3,0,0],n3C:[-.25,0,0],n4C:[-.1,0,0],hC:[-.55,0,0],jC:[.85,0,0],crC:[-.3,0,0],n0L:[0,.25,0],n0R:[0,-.25,0]},
  strC:{n0C:[.55,0,0],n1C:[.35,0,0],n2C:[.3,0,0],n3C:[.2,0,0],n4C:[.05,0,0],hC:[.15,0,0],jC:[.15,0,0],crC:[.25,0,0],body:[.04,0,0,0,0,.12]},
  recC:{n0C:[.35,0,0],n1C:[.25,0,0],n2C:[.2,0,0],n3C:[.1,0,0],hC:[.2,0,0],jC:[.25,0,0]},
  // neck sweep: all three heads low to the right, then across to the left
  lowR:{body:[0,-.5,0],n0C:[.45,-.4,0],n1C:[.3,-.2,0],n2C:[.2,0,0],hC:[.1,0,0],jC:[.6,0,0],n0L:[.45,-.55,0],n1L:[.3,-.2,0],n2L:[.2,0,0],hL:[.15,0,0],jL:[.6,0,0],n0R:[.45,-.3,0],n1R:[.3,-.25,0],n2R:[.2,0,0],hR:[.1,0,0],jR:[.6,0,0],t0:[0,.4,0],t1:[0,.2,0]},
  swpL:{body:[0,.6,0],n0C:[.5,.4,0],n1C:[.3,.25,0],n2C:[.2,0,0],hC:[.1,0,0],jC:[.3,0,0],n0L:[.5,.35,0],n1L:[.3,.2,0],n2L:[.2,0,0],hL:[.1,0,0],jL:[.3,0,0],n0R:[.5,.55,0],n1R:[.3,.3,0],n2R:[.2,0,0],hR:[.1,0,0],jR:[.3,0,0],t0:[0,-.45,0],t1:[0,-.25,0]},
  // spit: the centre head rears high and gulps, then thrusts
  gulp:{n0C:[-.45,0,0],n1C:[-.3,0,0],n2C:[-.25,0,0],n3C:[-.15,0,0],hC:[-.2,0,0],jC:[.05,0,0],crC:[-.4,0,0],n0L:[.1,.3,0],n0R:[.1,-.3,0]},
  spit:{n0C:[-.1,0,0],n1C:[.05,0,0],n2C:[.1,0,0],n3C:[.1,0,0],hC:[-.3,0,0],jC:[1.0,0,0],crC:[.2,0,0]},
  // tail slam (the tail points back: +rx lifts it)
  tUp:{t0:[.45,0,0],t1:[.3,0,0],t2:[.25,0,0],t3:[.15,0,0],t4:[.1,0,0],t5:[-.2,0,0],body:[-.05,0,0,0,0,.25],hC:[-.2,0,0],n0L:[-.15,-.4,0],n0R:[-.15,.4,0],jL:[.5,0,0],jR:[.5,0,0]},
  tDn:{t0:[-.22,0,0],t1:[-.06,0,0],t2:[.02,0,0],t3:[.04,0,0],t4:[.04,0,0],t5:[.08,0,0],body:[.04,0,0,0,0,-.2]},
  // coil surge: everything tightens, then bursts
  tight:{body:[0,0,0,0,-.35,0],n0C:[.3,0,0],n0L:[.3,.3,0],n0R:[.3,-.3,0],n1C:[.2,0,0],n1L:[.2,0,0],n1R:[.2,0,0],hC:[.3,0,0],hL:[.3,0,0],hR:[.3,0,0],jC:[.4,0,0],jL:[.4,0,0],jR:[.4,0,0],t0:[.1,0,0]},
  burst:{body:[0,0,0,0,.25,0],n0C:[-.3,0,0],n0L:[-.25,-.4,0],n0R:[-.25,.4,0],hC:[-.5,0,0],hL:[-.5,0,0],hR:[-.5,0,0],jC:[.9,0,0],jL:[.9,0,0],jR:[.9,0,0],crC:[-.3,0,0],crL:[-.3,0,0],crR:[-.3,0,0],t0:[.2,0,0],t1:[.1,0,0]},
  // roar (intro / awakening): all three heads to the sky
  roar:{n0C:[-.35,0,0],n1C:[-.3,0,0],n2C:[-.25,0,0],n3C:[-.2,0,0],hC:[-.9,0,0],jC:[1.0,0,0],crC:[-.4,0,0],n0L:[-.3,-.35,0],n1L:[-.25,0,0],n2L:[-.2,0,0],hL:[-.85,0,0],jL:[1.0,0,0],crL:[-.4,0,0],
    n0R:[-.3,.35,0],n1R:[-.25,0,0],n2R:[-.2,0,0],hR:[-.85,0,0],jR:[1.0,0,0],crR:[-.4,0,0],t0:[.3,0,0],t1:[.2,0,0]},
  // venom breath: side heads aim out, centre forward
  brW:{n0L:[-.2,.5,0],n0R:[-.2,-.5,0],n0C:[-.25,0,0],hL:[-.3,0,0],hR:[-.3,0,0],hC:[-.3,0,0],jL:[.2,0,0],jR:[.2,0,0],jC:[.2,0,0],crL:[-.3,0,0],crR:[-.3,0,0],crC:[-.3,0,0]},
  brS:{n0L:[.15,.65,0],n0R:[.15,-.65,0],n1L:[.15,0,0],n1R:[.15,0,0],hL:[.2,0,0],hR:[.2,0,0],jL:[1.0,0,0],jR:[1.0,0,0],n0C:[-.2,0,0],hC:[-.3,0,0],jC:[.3,0,0]},
  brC:{n0L:[0,.5,0],n0R:[0,-.5,0],hL:[0,0,0],hR:[0,0,0],jL:[.2,0,0],jR:[.2,0,0],n0C:[.2,0,0],n1C:[.15,0,0],hC:[.2,0,0],jC:[1.0,0,0]},
  // ---- v112: Mire Rush — coiled back like a spring, the thrust, the triple snap ----
  rushB:Object.assign(hyd3({n0:[.12,0,0],n1:[-.38,0,0],n2:[-.38,0,0],n3:[.3,0,0],n4:[.38,0,0],h:[.1,0,0],j:[.35,0,0],cr:[-.2,0,0]},-.22),{body:[-.06,0,0,0,-.25,-.7],t0:[.3,0,0],t1:[.2,0,0],t2:[.12,0,0]}),
  rushT:Object.assign(hyd3({n0:[.75,0,0],n1:[0,0,0],n2:[-.1,0,0],n3:[-.15,0,0],n4:[-.15,0,0],h:[-.5,0,0],j:[1.05,0,0],cr:[-.45,0,0]},-.1),{body:[.08,0,0,0,-.1,.9],t0:[-.15,0,0],t1:[-.1,0,0]}),
  rushS:Object.assign(hyd3({n0:[.82,0,0],n1:[.02,0,0],n2:[-.08,0,0],n3:[-.12,0,0],n4:[-.1,0,0],h:[-.25,0,0],j:[-.04,0,0],cr:[.2,0,0]},-.08),{body:[.1,0,0,0,-.15,1.0],t0:[-.1,0,0]}),
  // ---- v112: Undertow — rear up, plunge into the mere, heave below, rip free ----
  gyUp:Object.assign(hyd3({n0:[-.35,0,0],n1:[-.22,0,0],n2:[-.15,0,0],n3:[-.1,0,0],h:[-.55,0,0],j:[.75,0,0],cr:[-.45,0,0]},.18),{body:[-.05,0,0,0,.35,-.2],t0:[.25,0,0],t1:[.15,0,0]}),
  gyDn:Object.assign(hyd3({n0:[.95,0,0],n1:[.5,0,0],n2:[.35,0,0],n3:[.22,0,0],n4:[.2,0,0],h:[.6,0,0],j:[.3,0,0],cr:[.35,0,0]},.38),{body:[.12,0,0,0,-.3,.3],t0:[-.1,0,0]}),
  gyDn2:Object.assign(hyd3({n0:[1.0,0,0],n1:[.55,0,0],n2:[.38,0,0],n3:[.2,0,0],n4:[.15,0,0],h:[.55,0,0],j:[.2,0,0],cr:[.4,0,0]},.42),{body:[.15,0,0,0,-.42,.35],t0:[.12,.2,0],t1:[.1,.2,0]}),
  gyOut:Object.assign(hyd3({n0:[-.1,0,0],n1:[-.2,0,0],n2:[-.12,0,0],n3:[-.05,0,0],h:[-.25,0,0],j:[.1,0,0],cr:[-.2,0,0]},.15),{body:[0,0,0,0,.15,0],t0:[.15,0,0]}),
  // ---- v112: Venom Maelstrom — necks splayed out level, jaws wide, then the spin; spent at the end ----
  mlW:Object.assign(hyd3({n0:[.4,0,0],n1:[.12,0,0],n2:[0,0,0],n3:[-.1,0,0],n4:[-.15,0,0],h:[-.2,0,0],j:[.6,0,0],cr:[-.35,0,0]},.9),{n0C:[.55,0,0],body:[0,0,0,0,-.2,0],t0:[0,.45,0],t1:[0,.3,0]}),
  mlS:Object.assign(hyd3({n0:[.55,0,0],n1:[.18,0,0],n2:[.05,0,0],n3:[0,0,0],n4:[0,0,0],h:[.15,0,0],j:[1.0,0,0],cr:[-.5,0,0]},1.0),{n0C:[.65,0,0],body:[0,0,.06,0,-.3,0],t0:[0,.6,0],t1:[0,.4,0],t2:[0,.3,0]}),
  mlE:Object.assign(hyd3({n0:[.45,0,0],n1:[.25,0,0],n2:[.15,0,0],n3:[.1,0,0],h:[.35,0,0],j:[.5,0,0],cr:[.1,0,0]},.3),{body:[0,0,0,0,-.35,0]}),
  // stagger and death
  stag:{body:[0,0,.12,0,-.4,0],n0C:[.5,0,.2],n1C:[.35,0,.1],hC:[.5,0,.3],jC:[.6,0,0],n0L:[.6,-.3,.3],n1L:[.4,0,0],hL:[.5,0,0],jL:[.7,0,0],n0R:[.55,.3,-.2],n1R:[.4,0,0],hR:[.4,0,0],jR:[.5,0,0],t0:[-.1,.2,0]},
  dead:{body:[0,0,0,0,-1.0,0],n0C:[1.0,0,.2],n1C:[.4,0,0],n2C:[.2,0,0],hC:[.2,0,.4],jC:[.6,0,0],n0L:[1.0,-.5,.5],n1L:[.4,0,0],n2L:[.2,0,0],hL:[.2,0,0],jL:[.7,0,0],n0R:[.95,.5,-.4],n1R:[.4,0,0],n2R:[.2,0,0],hR:[.3,0,0],jR:[.5,0,0],t0:[-.2,0,0]}};
// one pose for all three heads (side necks spread by sp: + = outward)
function hyd3(o,sp){const r={};['C','L','R'].forEach(s=>{for(const k in o){const v=o[k].slice();if(k==='n0'&&s!=='C'&&sp)v[1]=(v[1]||0)+(s==='L'?sp:-sp);r[k+s]=v}});return r}
// every pose names every joint (rest = 0): a track then never hands a joint back to the idle layer half-way (no snap)
for(const k in HYDP){const P=HYDP[k];HYDJN.forEach(j=>{if(!P[j])P[j]=[0,0,0]})}
// ---------------- helpers for the moves ----------------
// which head: the one on the hero's side
function hydSide(e){const da=svAng(svYawTo(e.m,pl.position)-e.m.rotation.y);return da>.35?'L':da<-.35?'R':'C'}
function hydBase(c,s){return svWP(c.e,'n0'+s,0,0,0)}
function hydMouth(c,s){return svWP(c.e,'h'+s,0,-.1,1.3)}
function hydLine(c,s){const p=hydBase(c,s),q=c.inA(pl.position.clone(),.6);return {x:p.x,z:p.z,a:Math.atan2(q.x-p.x,q.z-p.z)}}
function hydPool(c,p,r,life){const e=c.e,o=svDecal(p,0x5aff2a,r,life,.5),S2={k:'c',r};let tk=0,t=0;svDecal(p,0x1a3a08,r*.8,life,.4);
  kqFx({tick(dt){t+=dt||0;tk-=dt||0;if(!AF||e.dead)return false;if(Math.random()<.3)burst(gY(p,.2).add(new THREE.Vector3((Math.random()-.5)*r,0,(Math.random()-.5)*r)),HYD.ven,1,.3,.8,.6);
    if(tk<=0&&hero.iv<=0&&hero.hp>0&&svIn(S2,{x:p.x,z:p.z,a:0},pl.position,0)){tk=.5;bossHit(e,.22);dqDebuff('Venom','🟢',{mspd:-.25},800,'Slowed by venom')}return t<life}})}
function hydGlob(c,from,q,T,big){const e=c.e,S2={k:'c',r:big?2.4:2},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,T));
  const g=new THREE.Mesh(svG('hy_glob',()=>new THREE.IcosahedronGeometry(.35,0)),kqBas(HYD.ven));g.scale.setScalar(big?1.4:1);
  svShot(from,new THREE.Vector3(q.x,GH(q.x,q.z)+.2,q.z),T,HYD.ven,1,4,P=>{if(e.dead||!AF)return;burst(P,HYD.ven,22,2.4,2,.6);svSnd('splash',.6,1.3);svHitNow(e,S2,an,big?.9:.8,{});hydPool(c,P,big?2.2:1.8,4)},g)}
function hydBreath(c,s,a0,T){const e=c.e,S2={k:'a',r:10,h:.42},o=hydBase(c,s),an={x:o.x,z:o.z,a:c.m.rotation.y+a0};svFlash(S2,an,HYD.ven,700);
  const m=hydMouth(c,s);for(let k=0;k<26;k++){const d=2+Math.random()*8,a=an.a+(Math.random()-.5)*.8;burst(new THREE.Vector3(o.x+Math.sin(a)*d,GH(o.x,o.z)+1+Math.random()*2.5,o.z+Math.cos(a)*d),HYD.ven,2,1.4,.6,.9)}
  burst(m,HYD.ven,20,3,1,.6);svSnd('hiss',.9,.8);svHitNow(e,S2,an,1.1,{flash:false,on:()=>dqDebuff('Venom','🟢',{mspd:-.3},2500,'Slowed by venom')})}
function hydSplash(p,n){burst(gY(p,.2),0xbfe8e0,n||30,4,4,.7);svShock(p,0xbfe8e0,5,.5)}
// a short-lived additive mesh (shared geometry, own material) animated by fn(k, mesh, material); removed when done
function hydFxMesh(geo,col,T,fn,op){const m=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op==null?.7:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  const o=new THREE.Mesh(geo,m);o.renderOrder=22;o.frustumCulled=false;o.userData.lpsSkip=1;scene.add(o);let t=0;
  kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/T);try{fn(k,o,m)}catch(_){}return k<1},end(){scene.remove(o);m.dispose()}});return o}
// Mire Rush: a V-shaped bow wave riding in front of the body, foam along the flanks
function hydWake(c,T){const e=c.e,g=svG('hy2_bow',()=>{const pos=[],w=(x0,z0,x1,z1,h)=>{pos.push(x0,0,z0,x1,0,z1,x1,h,z1,x0,0,z0,x1,h,z1,x0,h*.6,z0)};w(0,0,2.6,-3.2,1.1);w(0,0,-2.6,-3.2,1.1);w(0,0,1.1,-.6,1.5);w(0,0,-1.1,-.6,1.5);
    const q=new THREE.BufferGeometry();q.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));q.computeVertexNormals();return q});
  hydFxMesh(g,HYD.foam,T,(k,o,m)=>{const a=e.m.rotation.y,p=e.m.position,f=3.4;o.position.set(p.x+Math.sin(a)*f,GH(p.x,p.z)+.05,p.z+Math.cos(a)*f);o.rotation.set(0,a,0);
    const s=.6+.6*Math.sin(Math.min(1,k*1.3)*Math.PI*.5);o.scale.set(s,s*(1+.15*Math.sin(k*40)),s);m.opacity=.55*(k<.8?1:(1-k)/.2);
    if(Math.random()<.8){const x=(Math.random()-.5)*5;burst(new THREE.Vector3(o.position.x+Math.cos(a)*x,o.position.y+.3,o.position.z-Math.sin(a)*x),HYD.foam,2,1.6,3,.5)}},.55);
  let t=0,dd=0;kqFx({tick(dt){t+=dt||0;dd+=dt||0;if(dd>.09&&!e.dead){dd=0;svDecal(e.m.position,0x9ad0c0,3.2,1.6,.28)}return t<T}})}
// three jaws snapping shut: a white flash of teeth at each mouth
function hydSnap(c){['L','C','R'].forEach((s,i)=>{const p=hydMouth(c,s);burst(p,0xfff4d8,10,2.2,1,.35);burst(p,HYD.ven,6,1.5,.6,.4);
  const g=svG('hy2_snap',()=>new THREE.RingGeometry(.4,1,8,1).toNonIndexed());hydFxMesh(g,0xfff4d0,.22,(k,o,m)=>{o.position.copy(p);o.lookAt(cam.position);o.scale.setScalar(.5+1.6*k);m.opacity=.9*(1-k)},.9)})}
// Undertow: a hump of water racing under the surface to q, then a venom geyser bursts there
function hydUndertow(c,s,T){const e=c.e,from=hydMouth(c,s),q=c.inA(pl.position.clone(),.8),S2={k:'c',r:2.3},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,T));
  const a0=new THREE.Vector3(from.x,GH(from.x,from.z)+.1,from.z),b=new THREE.Vector3(q.x,GH(q.x,q.z)+.1,q.z);
  const hump=new THREE.Mesh(svG('hy2_hump',()=>{const g=new THREE.ConeGeometry(1,1,7,1,true);g.scale(.9,.55,1.6);g.translate(0,.25,0);return g.toNonIndexed()}),kqBas(0x6fa898));hump.userData.lpsSkip=1;
  burst(a0,HYD.foam,8,2.5,3,.5);svShock(a0,HYD.foam,2.5,.35);
  svShot(a0,b,T,0x8fc0b0,1.0,0,P=>{if(e.dead||!AF)return;hydGeyser(c,P,S2,an)},hump);
  let t=0,dd=0;kqFx({tick(dt){t+=dt||0;dd+=dt||0;if(dd>.08){dd=0;svDecal(hump.position,0x8fc8b8,1.1,1.2,.3)}return t<T&&!!hump.parent}})}
function hydGeyser(c,P,S2,an){const e=c.e;svSnd('splash',1,.8);svSnd('hiss',.6,1.2);shake(.15);burst(gY(P,.3),HYD.ven,30,2.5,9,.9);burst(gY(P,.3),HYD.foam,30,3,6,.8);svShock(P,HYD.ven,3.2,.45);svDecal(P,0x4adf2a,2.6,3,.45);
  svHitNow(e,S2,an,1.0,{kb:2,on:()=>dqDebuff('Venom','🟢',{mspd:-.25},1500,'Slowed by venom')});
  const col=svG('hy2_gys',()=>{const g=new THREE.CylinderGeometry(.55,1.3,1,9,4,true);g.translate(0,.5,0);const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setX(i,p.getX(i)*(1+.15*Math.sin(i*1.7)));p.setZ(i,p.getZ(i)*(1+.15*Math.cos(i*2.3)));if(y>.9)p.setY(i,y+.12*Math.sin(i))}return g.toNonIndexed()});
  const y0=GH(P.x,P.z);hydFxMesh(col,HYD.ven,1.0,(k,o,m)=>{const up=k<.25?svEase.o(k/.25):1-svEase.i((k-.25)/.75);o.position.set(P.x,y0,P.z);o.scale.set(1+.4*k,.2+6.5*up,1+.4*k);o.rotation.y=k*4;m.opacity=.65*(1-k*.7)},.65);
  hydFxMesh(col,HYD.foam,.8,(k,o,m)=>{const up=k<.2?svEase.o(k/.2):1-svEase.i((k-.2)/.8);o.position.set(P.x,y0,P.z);o.scale.set(.6,.2+7.5*up,.6);o.rotation.y=-k*5;m.opacity=.5*(1-k)},.5)}
// Venom Maelstrom: one stream per head, from the mouth out along the head's bearing to the ground
function hydStreams(c){const e=c.e,M=c.M,g=svG('hy2_strm',()=>{const q=new THREE.CylinderGeometry(.75,.18,1,7,3,true);q.translate(0,.5,0);q.rotateX(Math.PI/2);return q.toNonIndexed()});
  M.st=['L','C','R'].map(s=>{const m=new THREE.MeshBasicMaterial({color:HYD.ven,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),o=new THREE.Mesh(g,m);o.frustumCulled=false;o.renderOrder=22;o.userData.lpsSkip=1;scene.add(o);return {s,o,m}});
  M.fx.push(()=>{(M.st||[]).forEach(q=>{scene.remove(q.o);q.m.dispose()});M.st=null})}
function hydStreamTick(c,dt,on){const e=c.e,M=c.M,m=e.m;if(!M.st)return;M.ht=Math.max(0,(M.ht||0)-dt);M.dc=(M.dc||0)+dt;const drop=M.dc>.22;if(drop)M.dc=0;
  M.st.forEach(q=>{const mo=hydMouth(c,q.s),a=Math.atan2(mo.x-m.position.x,mo.z-m.position.z),gp=new THREE.Vector3(m.position.x+Math.sin(a)*9.5,0,m.position.z+Math.cos(a)*9.5);gp.y=GH(gp.x,gp.z)+.1;
    q.o.position.copy(mo);const d=gp.clone().sub(mo),L=d.length();q.o.lookAt(gp);q.o.scale.set(1+.15*Math.sin(c.t*31),1+.15*Math.cos(c.t*27),L);q.m.opacity+=((on?.62:0)-q.m.opacity)*Math.min(1,dt*10);
    if(!on)return;if(Math.random()<.9){const r=3+Math.random()*6.5;burst(new THREE.Vector3(m.position.x+Math.sin(a)*r,GH(m.position.x,m.position.z)+.4,m.position.z+Math.cos(a)*r),HYD.ven,2,1.2,2.4,.6)}
    if(drop)svDecal(new THREE.Vector3(m.position.x+Math.sin(a)*(4+Math.random()*5),0,m.position.z+Math.cos(a)*(4+Math.random()*5)),0x4adf2a,1.1,2.4,.32);
    if(M.ht<=0&&svIn({k:'a',r:10,r0:2.8,h:.2},{x:m.position.x,z:m.position.z,a},pl.position,.25)){if(svHitNow(e,{k:'a',r:10,r0:2.8,h:.2},{x:m.position.x,z:m.position.z,a},.75,{flash:false,on:()=>dqDebuff('Venom','🟢',{mspd:-.3},1800,'Slowed by venom')}))M.ht=.5}})}
// ---------------- moves ----------------
var HYDM={
  intro:{dur:2.8,trk:[[.4,'tight','io'],[1.0,'tight','l',.02],[1.6,'roar','o'],[2.4,'roar','l',.02],[2.8,'recC','io']],trn:[[0,2.8,1]],
    ev:[[.3,c=>svSnd('hiss',.7,.6)],[1.55,c=>{svSnd('roar',1,1.15);svSnd('shriek',.5,.8);shake(.35);hydSplash(c.m.position,40)}]]},
  bite:{wt:10,cd:3,r:[0,13],a:'any',dur:1.75,lock:.62,
    go(c){c.M.s=hydSide(c.e);const s=c.M.s;c.M.D=Object.assign({},c.M.D,{trk:s==='C'?[[.55,'rearC','io'],[.72,'rearC','l',.015],[.9,'strC','s'],[1.25,'recC','l'],[1.75,'recC','io']]:[[.55,'rear'+(s==='L'?'L':'L~'),'io'],[.72,'rear'+(s==='L'?'L':'L~'),'l',.015],[.9,'str'+(s==='L'?'L':'L~'),'s'],[1.25,'rec'+(s==='L'?'L':'L~'),'l'],[1.75,'rec'+(s==='L'?'L':'L~'),'io']]});c.S.trk=c.M.D.trk},
    hit:[{t:.9,s:{k:'l',w:2.6,l:10.5,b:0},o:c=>hydLine(c,c.M.s),dm:1.2,w:.55,fx:(c,an)=>{const p=new THREE.Vector3(an.x+Math.sin(an.a)*8,0,an.z+Math.cos(an.a)*8);hydSplash(p,24);svSnd('crack',.8,.8);shake(.18)}}],
    ev:[[.25,c=>svSnd('hiss',.7)],[.8,c=>svSnd('whoosh',.8,.9)]],nx:[['bite',.3]],rec:.15},
  fury:{wt:7,cd:8,r:[0,13],a:'f',dur:2.9,lock:.5,trn:[[0,2.6,2.6]],
    trk:[[.45,'rearL','io'],[.6,'rearL','l',.015],[.78,'strL','s'],[.98,'rearL~','io'],[1.36,'strL~','s'],[1.56,'rearC','io'],[1.98,'strC','s'],[2.5,'recC','l'],[2.9,'recC','io']],
    hit:[{t:.78,s:{k:'l',w:2.5,l:10.5},o:c=>hydLine(c,'L'),dm:1,w:.45},{t:1.36,s:{k:'l',w:2.5,l:10.5},o:c=>hydLine(c,'R'),dm:1,w:.45},{t:1.98,s:{k:'l',w:2.8,l:11},o:c=>hydLine(c,'C'),dm:1.3,w:.5,fx:(c,an)=>{hydSplash(new THREE.Vector3(an.x+Math.sin(an.a)*8,0,an.z+Math.cos(an.a)*8),30);shake(.25)}}],
    ev:[[.3,c=>svSnd('hiss',.8)],[.7,c=>svSnd('whoosh',.7)],[1.28,c=>svSnd('whoosh',.7,1.1)],[1.9,c=>svSnd('whoosh',.9,.8)]],rec:.55},
  sweep:{wt:9,cd:6,r:[0,8.5],a:'f',dur:2.0,lock:.7,armor:1,trk:[[.6,'lowR','io'],[.92,'lowR','l',.02],[1.15,'swpL','o'],[1.55,'swpL','l'],[2.0,'recC','io']],
    hit:[{t:1.08,s:{k:'a',r:8.6,h:1.25},f:0,dm:1.3,w:.5,kb:3}],tr:[[.95,1.2,'hC',[0,0,1.2],[0,0,0],0xbfe8a0,.22]],ev:[[.35,c=>svSnd('hiss',.8,.7)],[.98,c=>{svSnd('whoosh',1,.6);svSnd('splash',.5)}]],rec:.35},
  coil:{wt:6,cd:7,r:[0,5.5],a:'any',dur:1.9,armor:1,trk:[[.5,'tight','io'],[1.0,'tight','l',.025],[1.15,'burst','s'],[1.9,'recC','io']],
    hit:[{t:1.12,s:{k:'c',r:6.2},dm:1.1,w:.95,kb:4,fx:c=>{hydSplash(c.m.position,60);svShock(c.m.position,0xbfe8e0,7,.6);shake(.3);svSnd('splash',1,.7)}}],ev:[[.3,c=>svSnd('hum',.5,.6)]],rec:.4},
  tail:{wt:11,cd:5,r:[0,13],a:'b',dur:1.9,lock:.5,trn:[[0,.1,1]],trk:[[.65,'tUp','io'],[.85,'tUp','l',.02],[1.05,'tDn','s'],[1.9,'rest','io']],
    hit:[{t:1.02,s:{k:'l',w:3,l:11},o:c=>{const p=svWP(c.e,'t0',0,0,0);return {x:p.x,z:p.z,a:c.m.rotation.y+Math.PI}},dm:1.35,w:.75,fx:(c,an)=>{for(let d=3;d<11;d+=2.5)hydSplash(new THREE.Vector3(an.x+Math.sin(an.a)*d,0,an.z+Math.cos(an.a)*d),14);shake(.3);svSnd('heavy',1)}}],
    tr:[[.88,1.1,'t5',[0,0,-1.6],[0,0,-.4],0xbfe8e0,.2]],ev:[[.4,c=>svSnd('hiss',.5,.5)]],rec:.3},
  spit:{wt:8,cd:7,r:[6,40],a:'any',dur:2.3,lock:.9,trk:[[.6,'gulp','io'],[1.0,'gulp','l',.02],[1.15,'spit','s'],[1.5,'spit','l'],[2.3,'recC','io']],
    ev:[[.3,c=>svSnd('squelch',.7,.8)],[1.15,c=>{const m=hydMouth(c,'C');svSnd('squelch',.8,1.2);[0,1,2].forEach(i=>{const off=[[0,0],[3,-1.4],[-3,-1.4]][i],a=svYawTo(c.m,pl.position),
      q=c.inA(pl.position.clone().add(new THREE.Vector3(Math.cos(a)*off[0]+Math.sin(a)*off[1],0,-Math.sin(a)*off[0]+Math.cos(a)*off[1])),.8);hydGlob(c,m,q,.85+i*.12)})}]],rec:.4},
  // ---- v112: Mire Rush (far): a red lane, the spring-back, the surge with a bow wave, three jaws snap at its end ----
  rush:{wt:8,cd:10,r:[7.5,22],a:'f',dur:2.7,armor:1,trn:[[0,.35,3]],
    trk:[[.5,'rushB','io'],[.95,'rushB','l',.02],[1.22,'rushT','s'],[1.42,'rushS','s'],[1.7,'rushS','l'],[2.7,'rest','io']],
    rm:[[1.0,1.45,'tgt','o',3.2,11]],
    hit:[{t:1.42,s:{k:'l',w:4.6,l:15.5,b:.5},f:0,dm:1.4,w:1.05,kb:3,fx:(c,an,hit)=>{hydSnap(c);shake(.3);svSnd('crack',1,.7);svSnd('heavy',.7,1.2);hydSplash(c.at(4.5),40)}}],
    ev:[[.2,c=>{svSnd('hiss',.8,.55);svSnd('step',.8)}],[.6,c=>{svCharge(c.e,'hC',HYD.ven,1.4,.45,0,.3,.6)}],[.98,c=>{svSnd('roar',.8,1.35);svSnd('whoosh',1,.5);hydWake(c,.55);burst(gY(c.m.position,.3),HYD.foam,40,5,3,.6)}],
      [1.3,c=>svSnd('splash',.9,.9)],[1.48,c=>svSnd('crack',.8,1.1)],[1.55,c=>svSnd('crack',.7,1.25)]],
    tr:[[1.0,1.45,'hL',[0,-.1,1.4],[0,.3,.2],HYD.foam,.25],[1.0,1.45,'hR',[0,-.1,1.4],[0,.3,.2],HYD.foam,.25]],rec:.45},
  // ---- v112: Undertow (any range): the heads plunge, three wakes run to you under the water, venom geysers burst ----
  geyser:{wt:7,cd:12,r:[4,30],a:'any',dur:3.6,armor:1,trn:[[0,1.0,1.6]],
    trk:[[.6,'gyUp','io'],[.92,'gyUp','l',.02],[1.15,'gyDn','i'],[1.6,'gyDn2','io'],[2.1,'gyDn','io'],[2.6,'gyDn2','io',.015],[3.0,'gyOut','o'],[3.6,'rest','io']],
    ev:[[.2,c=>{svSnd('hiss',.8,.7);svSnd('hum',.5,.5)}],[.55,c=>svSnd('shriek',.4,1.2)],[1.12,c=>{shake(.25);svSnd('splash',1,.6);['L','C','R'].forEach(s=>{const p=hydMouth(c,s);burst(gY(p,.3),HYD.foam,10,3,3,.5);svShock(p,HYD.foam,3.5,.5)})}],
      [1.2,c=>hydUndertow(c,'L',.95)],[1.6,c=>hydUndertow(c,'R',.95)],[2.0,c=>hydUndertow(c,'C',1.0)],[2.5,c=>svSnd('squelch',.6,.7)],[2.95,c=>{svSnd('splash',.8,1.1);['L','C','R'].forEach(s=>burst(hydMouth(c,s),HYD.foam,8,2,3,.5))}]],rec:.45},
  // ---- Phase II ----
  awaken:{dur:3.4,inv:[0,3.4],armor:1,trk:[[.5,'tight','io'],[1.1,'tight','l',.03],[1.7,'roar','o'],[2.9,'roar','l',.02],[3.4,'recC','io']],trn:[[0,3,1]],
    hit:[{t:1.75,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.2,fx:c=>{hydSplash(c.m.position,80);svShock(c.m.position,HYD.crest,10,.8)}}],
    ev:[[.05,c=>{banner('THE CRESTS FLARE','The Hydra rises in fury','');svSnd('hiss',.9,.5)}],[1.1,c=>{c.S.ph=2;c.e.bs.ph=2;flash('rgba(160,255,90,.3)');svSnd('roar',1.2,1.1);svSnd('shriek',.7,.9);shake(.5)}]]},
  breath:{wt:9,cd:10,ph:2,r:[0,12],a:'f',dur:3.2,lock:.6,armor:1,trn:[[0,.6,2]],trk:[[.6,'brW','io'],[1.15,'brW','l',.02],[1.35,'brS','o'],[1.9,'brS','l'],[2.05,'brC','io'],[2.5,'brC','l'],[3.2,'recC','io']],
    hit:[{t:1.38,s:{k:'a',r:10,h:.42},o:c=>{const p=hydBase(c,'L');return {x:p.x,z:p.z,a:c.m.rotation.y+.62}},nohit:1,w:1.0,fx:c=>hydBreath(c,'L',.62)},
      {t:1.38,s:{k:'a',r:10,h:.42},o:c=>{const p=hydBase(c,'R');return {x:p.x,z:p.z,a:c.m.rotation.y-.62}},nohit:1,w:1.0,fx:c=>hydBreath(c,'R',-.62)},
      {t:2.2,s:{k:'a',r:10,h:.42},o:c=>{const p=hydBase(c,'C');return {x:p.x,z:p.z,a:c.m.rotation.y}},nohit:1,w:.7,fx:c=>hydBreath(c,'C',0)}],
    ev:[[.35,c=>svSnd('charge',.6,.5)]],rec:.5},
  deluge:{wt:7,cd:14,ph:2,r:[0,40],a:'any',dur:3.4,armor:1,trk:[[.55,'gulp','io'],[.95,'gulp','l',.02],[1.1,'roar','s'],[1.6,'roar','l'],[2.4,'recC','io'],[3.4,'recC','l']],
    ev:[[.3,c=>svSnd('squelch',.8,.7)],[1.1,c=>{const m=hydMouth(c,'C');svShot(m,m.clone().add(new THREE.Vector3(0,9,0)),.45,HYD.ven,2.4,0);svSnd('splash',.8,1.4)}]].concat(
      [0,1,2,3,4,5,6,7,8].map(i=>[1.45+i*.2,c=>{const a=i*2.4+c.rnd(),r=i==8?0:2.6+(i%3)*1.4,q=c.inA(pl.position.clone().add(new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r)),.8);
        hydGlob(c,new THREE.Vector3(q.x+(c.rnd()-.5)*2,GH(q.x,q.z)+12,q.z+(c.rnd()-.5)*2),q,.9,i==8)}])),rec:.5},
  furyX:{wt:6,cd:9,ph:2,r:[0,13],a:'f',dur:3.0,lock:.4,trn:[[0,2.8,3]],
    trk:[[.38,'rearC','io'],[.52,'rearC','l',.015],[.68,'strC','s'],[.85,'rearL','io'],[1.18,'strL','s'],[1.3,'rearL~','io'],[1.62,'strL~','s'],[1.78,'rearC','io'],[2.18,'strC','s'],[2.6,'recC','l'],[3.0,'recC','io']],
    hit:[{t:.68,s:{k:'l',w:2.6,l:11},o:c=>hydLine(c,'C'),dm:1,w:.4},{t:1.18,s:{k:'l',w:2.5,l:10.5},o:c=>hydLine(c,'L'),dm:1,w:.4},{t:1.62,s:{k:'l',w:2.5,l:10.5},o:c=>hydLine(c,'R'),dm:1,w:.4},
      {t:2.18,s:{k:'l',w:3,l:11.5},o:c=>hydLine(c,'C'),dm:1.4,w:.5,fx:(c,an)=>{hydSplash(new THREE.Vector3(an.x+Math.sin(an.a)*8,0,an.z+Math.cos(an.a)*8),40);shake(.3)}}],
    ev:[[.25,c=>svSnd('hiss',.9)],[.6,c=>svSnd('whoosh',.7)],[1.1,c=>svSnd('whoosh',.7,1.1)],[1.55,c=>svSnd('whoosh',.7,1.2)],[2.1,c=>svSnd('whoosh',1,.8)]],rec:.6},
  // ---- v112: Venom Maelstrom (Phase II, close/mid): a red ring, the necks splay, one and a half turns of venom streams ----
  maelstrom:{wt:7,cd:16,ph:2,r:[0,10.5],a:'any',dur:4.6,armor:1,trn:[[0,.5,2]],
    trk:[[.7,'mlW','io'],[1.3,'mlW','l',.025],[1.6,'mlS','o'],[3.7,'mlS','l',.01],[4.05,'mlE','io'],[4.6,'rest','io']],
    hit:[{t:1.55,s:{k:'r',r0:2.8,r:10},nohit:1,w:1.35,flash:false}],
    go(c){c.M.dir=c.rnd()<.5?-1:1},
    ev:[[.25,c=>{svSnd('charge',.7,.45);['L','C','R'].forEach(s=>svCharge(c.e,'h'+s,HYD.ven,1.1,1.25,0,-.1,1.3))}],[1.0,c=>hydStreams(c)],[1.55,c=>{svSnd('roar',.9,1.3);svSnd('hiss',1,.7);shake(.2)}],
      [2.1,c=>svSnd('whoosh',.8,.7)],[2.6,c=>svSnd('hiss',.9,.8)],[3.1,c=>svSnd('whoosh',.8,.8)],[3.6,c=>svSnd('hiss',.7,.9)],[3.75,c=>{svShock(c.m.position,HYD.ven,10,.6);burst(gY(c.m.position,1),HYD.ven,40,6,3,.8)}]],
    tk(c,dt){const t=c.t,T0=1.55,T1=3.75;if(t>T0&&t-dt<T1){const k0=Math.max(0,Math.min(1,(t-dt-T0)/(T1-T0))),k1=Math.max(0,Math.min(1,(t-T0)/(T1-T0)));c.m.rotation.y+=c.M.dir*Math.PI*3*(svEase.io(k1)-svEase.io(k0))}
      hydStreamTick(c,dt,t>T0&&t<T1)},rec:.6}};
HYDM.fury.ph1only=1;
svReg(1,{name:'Hydra',col:HYD.col,body:3.0,ph2:.55,poise:.17,headJ:'hC',turnA:2.4,edge:4,
  ai:{pref:7,walk:1.3,turn:1.6,rest:[.8,1.5],ph2r:.72,strafe:.25,style:'slither'},
  build:hydBuild,loco:hydLoco,post:hydPost,P:HYDP,M:HYDM,
  stag:[[.3,'stag','o'],[2.1,'stag','l',.02],[2.7,'recC','io']],stagT:2.7,
  die:[[.5,'stag','o'],[1.3,'dead','i'],[2.1,'dead','l']],
  homeY(A){const a=typeof HY!='undefined'&&HY.ent!=null?HY.ent:0;return Math.atan2(Math.cos(a),Math.sin(a))},
  dying(e,t){if(t>.6&&t<.7)hydSplash(e.m.position,60)}});
// ---------------- the den's warning sign (v112: the current moveset) ----------------
DSTXT[1]={den:'The Serpent Mere',zone:'Hillside Crest',
  atk:[['🐍 Fang Strike','The head on your side rears back, mouth wide, then strikes down a straight line at you (sometimes twice).','Sidestep the line as the head snaps forward, or dash through it.'],
   ['🐍 Serpent Fury','Phase I: left, right, then centre head strike in a fixed rhythm (Phase II: four strikes, centre first and last).','Sidestep each strike in turn — keep the rhythm.'],
   ['🌀 Neck Sweep','Close in front: all three heads drop low to its right, then sweep across the front.','Dash through the sweep or get well out of reach.'],
   ['💧 Coil Surge','Close: the coils tighten and a ring of water bursts from the body.','Back off when the coils clench — the red circle shows the reach.'],
   ['🦎 Tail Slam','Behind it: the tail rears up and crashes down along a line.','Don\'t linger behind it; step off the line.'],
   ['🟢 Venom Spit','At range: the centre head gulps and lobs three globs that leave venom pools.','Leave the red circles and stay out of the green pools (they slow you).'],
   ['🌊 Mire Rush','At range: it draws its heads back like a spring while a long red lane shows, then surges down the lane behind a bow wave and all three jaws snap at its end.','Step sideways off the lane — never run straight back along it.'],
   ['⛲ Undertow','All three heads plunge into the mere; three wakes race under the water to where you stand and burst as venom geysers, one after another.','Keep moving: step out of each red circle before its geyser erupts.'],
   ['☁ Venom Breath','Phase II: the side heads breathe cones to the left and right, then the centre head breathes forward.','Stand in the centre gap for the first two, then leave it.'],
   ['☔ Venom Deluge','Phase II: venom rains down on circles around you, the last one on you.','Keep moving between the circles.'],
   ['🌪 Venom Maelstrom','Phase II: the necks splay out, a red ring marks the reach, then it spins one and a half turns spraying three venom streams across the ring.','Get outside the ring, or dash through a stream as it passes.']],
  weak:['Posture: every hit fills its posture bar (yellow, under its health). When it breaks the Hydra is STAGGERED for a few seconds and takes +35% damage.',
   'Big moves (Neck Sweep, Coil Surge, Mire Rush, Undertow, Breath, Deluge, Maelstrom) cannot be interrupted — the stagger waits until they end. Punish the recovery after each attack.',
   'It is slow to turn: the tail covers its back, but its flanks are open after a Fang Strike or a Mire Rush.',
   'Phase II begins at 55% health with an invulnerable roar and a push-back wave — back away when the crests flare.']};
