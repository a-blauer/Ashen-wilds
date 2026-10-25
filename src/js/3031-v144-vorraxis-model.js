// ================= v144 Vorraxis, the Seeping King — the model, poses and procedural animation =================
// The mini boss under the Glowmire Warren (Kindlelight II; the fight and the lair are in 3033, the moves in 3032). An Akorror
// grown huge and old: a hunched mantis-backed predator on digitigrade legs, ~1.5× an Akorror's height, built like a Sovereign
// (rigid parts hung on named joints, the v110 engine's svRig / svJ / svM kit, merged per joint and material by svMerge).
//  * Body: a glowing caustic-ooze core (emissive, it pulses with his breathing) wrapped in overlapping chitin scales (mb144Cover:
//    rows of curved shield-scales shingled down the body, each turned to the surface). The gaps between them show the ooze: it seeps
//    between his scales. Scale pattern: black chitin, dark olive, and pale bone scales laid out as chevron bands down the back, rings
//    on the limbs and a tiger-stripe on the tail (MB144.pat), with bone-tipped dorsal spikes along the spine.
//  * Head: a long armoured skull with a crest of swept-back horns, glowing compound eyes, two hooked mandibles on their own joints,
//    fangs and ooze drooling from the maw. Arms: layered pauldrons, plated forearms with great serrated scythe blades and four-taloned
//    hands. Legs: muscled scaled thighs, plated shins, hock spurs, three toes and a dewclaw. Tail: six joints of banded plates and
//    spikes ending in a swollen ooze sac and a barbed stinger.
//  * About 2× the triangles of a normal Akorror (~4.8k → ~9.7k; MB144.tris is measured on the first build).
// Joints (L = +x, the model's left): root · hips · spine · chest · neck · head · jawL/R · shL/R · elL/R · blL/R (scythe) · wrL/R · thL/R · knL/R ·
// hkL/R · ftL/R · tail0..tail5. Poses (MB144P) are offsets from the rest pose, mirrored with '~' (svPose).
var MB144={col:0x9aff2a,ooze:0x3a9a12,acid:0xb8ff3a,tris:0,pat:null,sheet:{}};
// a curved shield-scale: outline in the plate's plane (x across, y along the body, the tip at -y), a raised centre ridge, a thin
// underside; +z is the surface normal
function mb144ScaleGeo(){return svG('mb_sc',()=>{const o=[[0,.5],[.42,.22],[.46,-.12],[.26,-.4],[0,-.62],[-.26,-.4],[-.46,-.12],[-.42,.22]],th=.16,pos=[];
  const top=o.map(([x,y])=>[x,y,(1-Math.hypot(x*1.3,y))*.06+(y<-.3?.05:0)]),bot=o.map(([x,y])=>[x*.86,y*.86,-th*.5]),c=[0,-.05,th],cb=[0,0,-th*.5];
  const T=(a,b,d)=>pos.push(a[0],a[1],a[2],b[0],b[1],b[2],d[0],d[1],d[2]);
  for(let i=0;i<o.length;i++){const j=(i+1)%o.length;T(c,top[i],top[j]);T(cb,bot[j],bot[i]);T(top[i],bot[i],bot[j]);T(top[i],bot[j],top[j])}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g})}
// cover a loft (rings [y, rx, rz, ox, oz] along the joint's +Y, like svLoft) with shingled scales. o: n (scales per row), rows,
// size (scale length), lift (tip tilt out), skip(t, u) (t = angle, 0 front · u = 0..1 along), mat(t, u, row, k) → material,
// dir (+1: tips point down the rings, toward the first ring; -1: toward the last), out (extra offset), jitter
function mb144Cover(R,j,rings,o){const V3=THREE.Vector3,n=o.n||10,rows=o.rows||5,sz=o.size||.2,lift=o.lift==null?.32:o.lift,dir=o.dir||1,y0=rings[0][0],y1=rings[rings.length-1][0];
  const at=y=>{let i=0;while(i<rings.length-2&&y>rings[i+1][0])i++;const a=rings[i],b=rings[i+1],k=Math.max(0,Math.min(1,(y-a[0])/((b[0]-a[0])||1))),L=(p,q)=>(p||0)+((q||0)-(p||0))*k;return [L(a[1],b[1]),L(a[2],b[2]),L(a[3],b[3]),L(a[4],b[4])]};
  const geo=mb144ScaleGeo(),rn=svRng(o.seed||7),M=new THREE.Matrix4(),X=new V3(),Y=new V3(),Z=new V3(),out=[];
  for(let r=0;r<rows;r++){const u=rows>1?r/(rows-1):.5,y=y0+(y1-y0)*(.06+.88*u),[rx,rz,ox,oz]=at(y);
    for(let k=0;k<n;k++){const t=(k+(r%2?.5:0))/n*Math.PI*2+(o.rot||0);if(o.skip&&o.skip(t,u,r,k))continue;
      const s=Math.sin(t),c=Math.cos(t),px=(ox||0)+s*rx,pz=(oz||0)+c*rz;
      // normal of the ellipse (and the slope of the loft), tangent along the body
      Z.set(s/Math.max(.01,rx),0,c/Math.max(.01,rz)).normalize();
      Y.set(0,dir,0);Y.addScaledVector(Z,-Y.dot(Z)).normalize();X.crossVectors(Y,Z).normalize();
      M.makeBasis(X,Y,Z);const q=new THREE.Quaternion().setFromRotationMatrix(M).multiply(new THREE.Quaternion().setFromAxisAngle(new V3(1,0,0),-lift));
      const w=sz*(o.w||1)*(.9+rn()*.2)*(o.wk?o.wk(t,u):1),l=sz*(.9+rn()*.2)*(o.wk?o.wk(t,u):1),off=(o.out||.0)+sz*.05;
      const m=new THREE.Mesh(geo,o.mat(t,u,r,k));m.position.set(px+Z.x*off,y+Z.y*off,pz+Z.z*off);m.quaternion.copy(q);m.scale.set(w,l,sz*.9);m.castShadow=true;
      (typeof j=='string'?R.J[j]:j).add(m);m.userData.lpsSkip=1;out.push(m)}}
  return out}
// the pattern: chevrons down the back (pale where the angle from the spine is about the height band), rings on limbs
MB144.pat={back:(t,u)=>{const a=Math.abs(Math.atan2(Math.sin(t),Math.cos(t)));const b=Math.PI-a;const v=(u*3.2+b*.55)%1;return b<1.25&&v<.24?2:b<.35?1:(Math.round(u*9+a*1.7)%3==0?1:0)},
  ring:(u,n)=>{const v=(u*(n||3))%1;return v<.28?2:v<.5?1:0},tiger:(t,u)=>{const a=Math.abs(Math.atan2(Math.sin(t),Math.cos(t)));return ((u*6+Math.sin(a*2)*.4)%1)<.3&&a>1.2?2:a<1.0?3:0}};
function mb144Build(R,e){
  const chit=svMat(R,0x13140d,{roughness:.36,metalness:.28}),chit2=svMat(R,0x23251a,{roughness:.45,metalness:.18}),pale=svMat(R,0x8e8a66,{roughness:.55,metalness:.08}),
    belly=svMat(R,0x3a4026,{roughness:.6}),dark=svMat(R,0x08080a,{roughness:.5,metalness:.2}),fang=svMat(R,0xe2dcc4,{roughness:.45}),claw=svMat(R,0x1a1820,{roughness:.3,metalness:.45}),
    blade=svMat(R,0x262820,{roughness:.32,metalness:.5}),edge=svMat(R,0xb4ae8a,{roughness:.25,metalness:.55}),
    ooze=svMat(R,0x0d2406,{roughness:.3,metalness:.05,emissive:MB144.ooze,emissiveIntensity:.5}),eye=svGlowMat(R,0xd0ff4a),drip=svGlowMat(R,0xa8ff3a,.85);
  ooze.userData.e0=MB144.ooze;R.ooze=ooze;R.eyeM=eye;R.dripM=drip;const SM=[chit,chit2,pale,belly];
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),G=(k,f)=>svG('mb'+k,f),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz);
  const horn=(k,r,l,bx,by,n,seg)=>G('h'+k,()=>svHorn(r,l,bx,by,n||5,seg||4)),ball=(k,r,det)=>G('b'+k,()=>svLump(r,det==null?1:det,.12,40+k));
  // ---------------- the skeleton ----------------
  J('root',null,0,0,0);J('hips','root',0,1.85,0);J('spine','hips',0,.22,.06,.34);J('chest','spine',0,.5,0,.22);J('neck','chest',0,.6,.2,-.62);J('head','neck',0,.34,.04,-.12);R.J.head.scale.setScalar(1.25);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';
    J('sh'+L,'chest',s*.64,.36,.04,-.78,0,s*-.12);J('el'+L,'sh'+L,0,-.76,.02,-.85);J('wr'+L,'el'+L,0,-.7,.06,.35);
    J('th'+L,'hips',s*.36,-.08,-.02,-.12,0,s*-.04);J('kn'+L,'th'+L,0,-.78,.28,.0);J('hk'+L,'kn'+L,0,-.72,-.32,.0);J('ft'+L,'hk'+L,0,-.29,.06,.0);
    J('jaw'+L,'head',s*.11,-.07,.3,0,s*.15,0)});
  J('tail0','hips',0,.04,-.42,-.42);for(let i=1;i<6;i++)J('tail'+i,'tail'+(i-1),0,0,-.46+i*.025,i<4?.05:.3);
  // ---------------- hips and belly ----------------
  const hipR=[[-.3,.34,.32],[-.05,.46,.42],[.2,.44,.4],[.34,.36,.34]];Mm('hips',G('hc',()=>svLoft(hipR,12)),ooze);
  mb144Cover(R,'hips',hipR.map(q=>[q[0],q[1]*1.0,q[2]*1.0]),{n:14,rows:5,size:.29,seed:11,mat:(t,u,r,k)=>SM[MB144.pat.ring(u+(k%2)*.1,2)]});
  for(let k=0;k<3;k++)Mm('hips',G('bp',()=>svLoft([[-.06,.3,.08],[.06,.32,.09]],8)),belly,0,-.18+k*.15,.36,0,0,0,1-k*.05,1,1);
  // ---------------- spine / waist ----------------
  const spR=[[-.08,.42,.38,0,-.02],[.2,.38,.33,0,-.04],[.5,.46,.38,0,-.06]];Mm('spine',G('sc',()=>svLoft(spR,12)),ooze);
  mb144Cover(R,'spine',spR,{n:13,rows:4,size:.29,seed:12,skip:t=>Math.cos(t)>.72,mat:(t,u)=>SM[MB144.pat.back(t,u*.4)]});
  for(let k=0;k<3;k++)Mm('spine',G('vp',()=>svLoft([[-.07,.24,.07],[.07,.26,.08]],8)),k%2?belly:chit2,0,.02+k*.15,.31+k*.015,-.1,0,0);
  // ---------------- chest and back (the hump), dorsal spikes ----------------
  const chR=[[-.12,.5,.42,0,-.04],[.12,.6,.48,0,-.08],[.36,.64,.5,0,-.12],[.56,.52,.42,0,-.1],[.72,.3,.28,0,-.02]];Mm('chest',G('cc',()=>svLoft(chR,14)),ooze);
  mb144Cover(R,'chest',chR,{n:17,rows:7,size:.32,seed:13,skip:t=>Math.cos(t)>.78,mat:(t,u)=>SM[MB144.pat.back(t,.4+u*.6)]});
  for(let k=0;k<4;k++)Mm('chest',G('cp',()=>svLoft([[-.08,.3,.1],[.08,.33,.11]],8)),k%2?belly:pale,0,-.02+k*.15,.4+k*.03,-.18-k*.04,0,0,1-k*.06,1,1);
  for(let k=0;k<6;k++){const y=-.05+k*.14,h=.34+Math.sin(k/5*Math.PI)*.22;Mm('chest',horn('ds',.07,1,0,.0,5,3),dark,0,y,-.5+Math.sin(k*.6)*.04-.02*k,-2.25+k*.08,0,0,1,1,h);
    Mm('chest',horn('dt',.045,1,0,0,5,3),pale,0,y+Math.cos(-2.25)*h*.75,-.5-.02*k+Math.sin(-2.25)*h*-.2,-2.25+k*.08,0,0,1,1,h*.45)}
  [-1,1].forEach(s=>{for(let k=0;k<3;k++)Mm('chest',horn('sd',.05,1,0,0,4,3),pale,s*(.42-k*.05),.3+k*.14,-.44+k*.02,-2.0,s*.5,s*.3,1,1,.26-k*.04)});
  // ooze welling in the seams of the back and dripping
  for(let k=0;k<9;k++){const a=Math.PI+(k-4)*.32,y=.1+(k%3)*.18;Mm('chest',G('dr',()=>svHorn(.035,.14,0,0,5,2)),drip,Math.sin(a)*.6,y-.05,Math.cos(a)*.48-.08,Math.PI/2,0,0,1,1,.6+((k*3)%4)*.25)}
  // ---------------- neck and head ----------------
  const nkR=[[-.05,.24,.24],[.18,.2,.2],[.38,.18,.17]];Mm('neck',G('nc',()=>svLoft(nkR,10)),ooze);
  mb144Cover(R,'neck',nkR,{n:11,rows:4,size:.2,seed:14,skip:t=>Math.cos(t)>.6,mat:(t,u,r)=>SM[r%2?2:0]});
  Mm('neck',G('nb',()=>svLoft([[-.0,.18,.06],[.32,.15,.05]],7)),belly,0,0,.18);
  // the skull: a long armoured head along +z, a heavy brow, the crest of horns
  const hdR=[[-.2,.16,.13,0,.02],[-.05,.25,.2,0,.04],[.12,.25,.19,0,.02],[.28,.19,.14,0,-.02],[.42,.11,.08,0,-.05],[.5,.05,.04,0,-.06]];
  Mm('head',G('hd',()=>svLoftZ(hdR,12)),chit);Mm('head',G('hdo',()=>svLoftZ(hdR.map(q=>[q[0],q[1]*.94,q[2]*.94,q[3],q[4]-.02]),10)),ooze,0,-.015,0);
  // armour plates laid by hand on the skull: a ridge of brow plates down the snout, cheek plates, plates over the eyes
  const sc=mb144ScaleGeo(),hp=(m,x,y,z,rx,ry,rz,w,l)=>Mm('head',sc,m,x,y,z,rx,ry,rz,w,l,(w+l)*.4);
  for(let k=0;k<6;k++){const z=-.12+k*.1,w=.2-k*.018;hp(k%2?chit2:chit,0,.24-k*.02+(k>2?-.02*(k-2):0),z,-1.38-k*.05,0,0,w,w*1.15)}
  [-1,1].forEach(s=>{for(let k=0;k<4;k++){const z=-.08+k*.11;hp(k==1?pale:chit,s*(.2-k*.02),.08-k*.01,z,-.2,s*1.25,s*-.3,.12,.15)}
    for(let k=0;k<3;k++)hp(chit2,s*(.14-k*.02),.17-k*.015,.02+k*.12,-1.0,s*.55,0,.1,.12)});
  Mm('head',G('brw',()=>svLump(.13,1,.12,71)),chit2,0,.16,.16,0,0,0,1.9,.42,.9);
  // crest: five horns swept back off the crown (the middle one longest), bone tips
  [[-1,.75],[-.5,.9],[0,1.05],[.5,.9],[1,.75]].forEach(([u,l],i)=>{Mm('head',horn('cr',.065,1,0,.18,6,5),chit,u*.11,.22-Math.abs(u)*.03,-.06,-.2-Math.abs(u)*.1,u*.42+Math.PI,0,1,1,l*.62);
    Mm('head',horn('ct',.04,1,0,.1,5,3),pale,u*.11+Math.sin(u*.42)*-l*.3,.22+l*.16,-.06-l*.5,.05,u*.42+Math.PI,0,1,1,l*.3)});
  [-1,1].forEach(s=>Mm('head',horn('ch',.045,.34,0,.1,5,4),chit2,s*.21,.03,-.12,-.3,Math.PI+s*.6,0));
  // compound eyes (glowing, faceted) set into dark sockets, and two small ones above
  [-1,1].forEach(s=>{Mm('head',ball(5,.085,1),dark,s*.19,.1,.2,0,0,0,1,.85,1.1);Mm('head',G('ey',()=>new THREE.IcosahedronGeometry(.072,1)),eye,s*.2,.105,.215,0,0,0,1,.85,1.05);
    svSpr(R,'head',MB144.col,.32,s*.23,.1,.24);Mm('head',G('ey2',()=>new THREE.IcosahedronGeometry(.032,0)),eye,s*.1,.2,.33);
    for(let k=0;k<3;k++)Mm('head',G('ef',()=>new THREE.BoxGeometry(.004,.11,.004)),dark,s*(.25+k*.004),.105,.17+k*.035,0,0,s*.1)});
  // the maw: fangs, a glowing gullet, ooze drool
  Mm('head',G('mw',()=>svLoftZ([[.2,.11,.05],[.44,.07,.03]],8)),drip,0,-.08,0);
  [-1,1].forEach(s=>{for(let k=0;k<4;k++)Mm('head',horn('fg',.022,1,0,-.02,4,2),fang,s*(.03+k*.025),-.08,.44-k*.05,Math.PI/2+.25,0,s*.15,1,1,.14-k*.02);
    Mm('head',horn('fl',.034,.22,0,-.06,5,3),fang,s*.07,-.1,.42,Math.PI/2+.4,s*.2,0)});
  for(let k=0;k<3;k++)Mm('head',G('dl',()=>svTube([[0,0,0],[.01,-.12,.02],[0,-.26,.03]],[.016,.01,.004],5)),drip,-.04+k*.04,-.12,.42-k*.03);
  // mandibles on their joints: a hooked, serrated pincer each
  [-1,1].forEach(s=>{const L=s>0?'L':'R';Mm('jaw'+L,G('md',()=>svTube([[0,0,0],[.04,-.04,.12],[.03,-.06,.24],[-.04,-.05,.33],[-.1,-.03,.36]],[.04,.036,.03,.02,.006],6)),chit2,0,0,0,0,0,0,s,1,1);
    for(let k=0;k<3;k++)Mm('jaw'+L,horn('mt',.012,1,0,0,4,2),fang,s*(.02-k*.02),-.06,.16+k*.07,Math.PI/2,s*-1.2,0,1,1,.05);
    Mm('jaw'+L,G('mdg',()=>new THREE.IcosahedronGeometry(.02,0)),drip,s*-.08,-.05,.35)});
  // ---------------- arms: pauldrons, upper arm, plated forearm with the great scythe, four-taloned hand ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',sh='sh'+L,el='el'+L,wr='wr'+L;
    Mm(sh,ball(1,.24),ooze);
    for(let k=0;k<3;k++){Mm(sh,G('pd'+k,()=>svLump(.3-k*.04,1,.18,72+k)),k==1?pale:chit,s*(.04+k*.06),.12-k*.13,-.02,0,0,s*(.2+k*.35),1.15,.5,1.05);
      for(let q=0;q<2;q++)Mm(sh,horn('ps',.05,1,0,-.04,5,3),k==0?pale:dark,s*(.1+k*.07),.2-k*.1,-.14+q*.18,-1.2,0,s*(-.5-k*.25),1,1,.3-k*.06)}
    const uaR=[[.0,.18,.18],[-.36,.17,.16],[-.68,.13,.13]];Mm(sh,G('uc',()=>svLoft(uaR,10)),ooze);
    mb144Cover(R,sh,uaR,{n:10,rows:5,size:.2,seed:20+s,mat:(t,u)=>SM[MB144.pat.ring(u,2)]});
    Mm(el,ball(2,.14),ooze);Mm(el,G('ep',()=>svHorn(.07,.3,0,-.1,5,3)),chit,0,0,-.12,Math.PI*.95,0,0);
    const faR=[[.04,.14,.14],[-.3,.17,.16],[-.62,.12,.11]];Mm(el,G('fc',()=>svLoft(faR,10)),chit2);
    for(let k=0;k<4;k++)Mm(el,G('fp',()=>svLoft([[-.08,.18,.17],[.08,.19,.18]],9,{cap:false})),k%2?chit:pale,0,-.06-k*.15,0,0,0,0,1-k*.08,1,1-k*.08);
    // the scythe: a long curved blade from the back of the forearm sweeping forward and down past the paw, pale serrated edge
    const B=G('bl',()=>svBlade([[0,0],[.12,-.05],[.26,-.3],[.34,-.62],[.32,-.98],[.22,-1.3],[.06,-1.52],[-.02,-1.42],[.08,-1.18],[.12,-.84],[.08,-.5],[-.02,-.2]],.04)),
      BE=G('be',()=>svBlade([[.33,-.62],[.36,-.66],[.34,-1.0],[.24,-1.33],[.07,-1.56],[.05,-1.5],[.21,-1.29],[.3,-.98]],.05));
    // the blade lies in the forearm's YZ plane and curves down and back like a sickle (same turn on both arms)
    const bg=svJ(R,'bl'+L,el,s*.02,-.1,-.14,-.2,Math.PI/2,0);bg.scale.set(1.02,1.02,1);   // its own joint: trails are drawn along it
    Mm(bg,B,blade);Mm(bg,BE,edge);
    [[.36,-.62],[.36,-.86],[.31,-1.1],[.22,-1.32]].forEach(([x,y],k)=>Mm(bg,horn('sr',.022,1,0,0,4,2),edge,x,y,0,0,Math.PI/2,0,1,1,.08-k*.008));
    Mm(wr,ball(3,.1),chit2,0,-.04,.02,0,0,0,1.2,1,1.2);
    for(let f=0;f<3;f++){const a=(f-1)*.38;Mm(wr,horn('tl',.04,1,0,-.08,5,4),claw,Math.sin(a)*.08,-.08,.06,Math.PI/2+.5,a,0,1,1,.3+(f==1?.08:0))}
    Mm(wr,horn('tm',.035,.22,0,-.05,5,3),claw,s*-.09,-.04,0,Math.PI/2+.3,s*-.9,0)});
  // ---------------- legs ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',th='th'+L,kn='kn'+L,hk='hk'+L,ft='ft'+L;
    const tR=[[.04,.24,.22],[-.3,.26,.25,0,.06],[-.62,.17,.16,0,.12],[-.78,.12,.12,0,.16]];Mm(th,G('tc',()=>svLoft(tR,10)),ooze);
    mb144Cover(R,th,tR,{n:11,rows:6,size:.22,seed:30+s,mat:(t,u)=>SM[MB144.pat.ring(u+.15,2.5)]});
    Mm(kn,ball(4,.12),chit2);Mm(kn,horn('ks',.06,.3,0,.1,5,3),pale,0,.04,.1,-.6,0,0);
    const sR=[[0,.11,.11],[-.36,.09,.1,0,-.16],[-.7,.08,.08,0,-.32]];Mm(kn,G('shc',()=>svLoft(sR,8)),chit);
    for(let k=0;k<3;k++)Mm(kn,G('sp',()=>svLoft([[-.07,.12,.12],[.07,.13,.12]],8,{cap:false})),k==1?pale:chit2,0,-.15-k*.2,-.06-k*.1,-.42,0,0);
    Mm(hk,ball(6,.085),chit2);Mm(hk,horn('hs',.045,.32,0,.12,5,3),dark,0,0,-.06,Math.PI*.82,0,0);
    Mm(hk,G('mt',()=>svLoft([[0,.075,.07],[-.3,.07,.08,0,.06]],8)),chit2);
    Mm(ft,G('fo',()=>svLump(.12,1,.12,74)),chit,0,.02,.06,0,0,0,1.3,.55,1.4);
    for(let f=0;f<3;f++){const a=(f-1)*.42;Mm(ft,horn('to',.045,1,0,-.03,5,3),chit2,Math.sin(a)*.1,.0,.1,.0,a,0,1,1,.26);Mm(ft,horn('tc2',.03,1,0,-.06,5,3),claw,Math.sin(a)*.1+Math.sin(a)*.24,-.0,.1+Math.cos(a)*.24,.25,a,0,1,1,.16)}
    Mm(ft,horn('dw',.03,.18,0,.05,5,3),claw,0,.04,-.08,Math.PI+.4,0,0)});
  // ---------------- the tail: banded plates, spikes, the ooze sac and the stinger ----------------
  for(let i=0;i<6;i++){const r0=.3-i*.042,r1=.3-(i+1)*.042,j='tail'+i,tR=[[0,r0,r0*.92],[-.48,r1,r1*.92]];
    Mm(j,G('tl'+i,()=>svLoftZ(tR.map(q=>[q[0],q[1],q[2]]),10)),ooze);
    mb144Cover(R,j,[[0,r0*1.0,r0*.92],[.46,r1*1.0,r1*.92]],{n:9,rows:3,size:.14+r0*.42,seed:40+i,dir:1,skip:t=>Math.cos(t)>.85,mat:(t,u)=>SM[MB144.pat.tiger(t,(i+u)/6)]}).forEach(m=>{
      // the cover is authored along +Y: turn it to lie along -Z
      const p=m.position.clone(),q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2);m.position.set(p.x,p.z,-p.y);m.quaternion.premultiply(q)});
    Mm(j,horn('tsp',.05,1,0,-.02,5,3),i%2?pale:dark,0,r0*.9,-.2,-1.1,0,0,1,1,.22-i*.02)}
  Mm('tail5',G('sac',()=>svLump(.17,1,.15,75)),ooze,0,-.04,-.58,0,0,0,1,1,1.35);
  Mm('tail5',G('sk',()=>svLump(.14,1,.15,76)),chit,0,.06,-.5,0,0,0,1.15,.7,1.2);
  Mm('tail5',horn('stg',.06,.5,0,.22,6,5),fang,0,0,-.76,Math.PI,0,0);
  for(let k=0;k<4;k++){const a=k/4*6.283;Mm('tail5',horn('sb',.03,.16,0,0,4,2),edge,Math.sin(a)*.12,Math.cos(a)*.1,-.62,-Math.PI/2+Math.cos(a)*.8,0,-Math.sin(a)*.8)}
  // count the triangles once (the brief: about twice a normal Akorror)
  if(!MB144.tris){let n=0;R.root.traverse(o=>{if(o.isMesh){const g=o.geometry;n+=g.index?g.index.count/3:g.attributes.position.count/3}});MB144.tris=Math.round(n)}
  R.headJ='head'}
// ---------------- poses (offsets from rest: [rx, ry, rz, px, py, pz]) ----------------
var MB144P={
  idle:{},
  // Scythe Rend: right scythe up and back, the diagonal cut, left cut, both raised high, the crossing double cut
  rUp:{hips:[0,-.35,0],spine:[0,-.25,0],chest:[-.1,-.35,0],shR:[-1.5,0,-.9],elR:[-.3,0,0],shL:[.2,0,.3],elL:[-.2,0,0],head:[0,.25,0],thL:[-.45,0,0],knL:[.4,0,0],tail0:[0,.3,0],tail1:[0,.2,0]},
  rCut:{hips:[.05,.4,0,0,-.08,.3],spine:[.1,.3,0],chest:[.2,.45,0],shR:[.35,0,.55],elR:[.1,0,0],shL:[-.5,0,.2],head:[.1,-.3,0],thL:[-.65,0,0],knL:[.55,0,0],hkL:[-.2,0,0],thR:[.35,0,0],tail0:[0,-.4,0],tail1:[0,-.3,0]},
  lUp:{hips:[0,.35,0],spine:[0,.25,0],chest:[-.1,.35,0],shL:[-1.5,0,.9],elL:[-.3,0,0],shR:[.2,0,-.3],elR:[-.2,0,0],head:[0,-.25,0],thR:[-.45,0,0],knR:[.4,0,0],tail0:[0,-.3,0]},
  lCut:{hips:[.05,-.4,0,0,-.08,.3],spine:[.1,-.3,0],chest:[.2,-.45,0],shL:[.35,0,-.55],elL:[.1,0,0],shR:[-.5,0,-.2],head:[.1,.3,0],thR:[-.65,0,0],knR:[.55,0,0],hkR:[-.2,0,0],thL:[.35,0,0],tail0:[0,.4,0],tail1:[0,.3,0]},
  xUp:{hips:[-.15,0,0,0,.12,-.15],spine:[-.25,0,0],chest:[-.35,0,0],neck:[-.2,0,0],head:[-.35,0,0],shL:[-2.2,0,.35],elL:[-.5,0,0],shR:[-2.2,0,-.35],elR:[-.5,0,0],thL:[-.25,0,0],knL:[.3,0,0],thR:[.15,0,0],tail0:[.35,0,0],tail1:[.2,0,0],tail2:[.15,0,0],jawL:[0,.4,0],jawR:[0,-.4,0]},
  xCut:{hips:[.25,0,0,0,-.35,.55],spine:[.35,0,0],chest:[.35,0,0],neck:[.1,0,0],head:[.25,0,0],shL:[.45,0,-.65],elL:[.15,0,0],shR:[.45,0,.65],elR:[.15,0,0],thL:[-.9,0,0],knL:[.85,0,0],hkL:[-.35,0,0],thR:[.5,0,0],knR:[.3,0,0],tail0:[-.4,0,0],tail1:[-.2,0,0]},
  cRec:{hips:[0,0,0,0,-.04,0],shL:[-.2,0,.1],shR:[-.2,0,-.1]},
  // Caustic Lunge: low, scythes swept back, the dash with jaws wide
  luLow:{hips:[.3,0,0,0,-.45,-.25],spine:[.25,0,0],chest:[.15,0,0],neck:[.15,0,0],head:[-.25,0,0],shL:[1.1,0,.5],elL:[-.4,0,0],shR:[1.1,0,-.5],elR:[-.4,0,0],thL:[-.7,0,0],knL:[1.05,0,0],hkL:[-.5,0,0],thR:[-.35,0,0],knR:[.9,0,0],hkR:[-.45,0,0],tail0:[.3,0,0],tail1:[.25,0,0],tail2:[.2,0,0],jawL:[0,.3,0],jawR:[0,-.3,0]},
  luGo:{hips:[.45,0,0,0,-.25,.4],spine:[.3,0,0],chest:[.2,0,0],neck:[-.1,0,0],head:[-.2,0,0],shL:[-.9,0,.6],elL:[-.2,0,0],shR:[-.9,0,-.6],elR:[-.2,0,0],thL:[-1.1,0,0],knL:[.6,0,0],thR:[.75,0,0],knR:[.25,0,0],hkR:[.3,0,0],tail0:[-.25,0,0],tail1:[-.15,0,0],jawL:[0,.75,0],jawR:[0,-.75,0]},
  luBite:{hips:[.4,0,0,0,-.3,.45],spine:[.3,0,0],chest:[.25,0,0],neck:[.25,0,0],head:[.35,0,0],shL:[-.4,0,.7],shR:[-.4,0,-.7],thL:[-1.0,0,0],knL:[.7,0,0],thR:[.6,0,0],knR:[.3,0,0],jawL:[0,-.25,0],jawR:[0,.25,0]},
  // Tail Lash: he winds the tail to one side, then whips round
  tlWind:{hips:[0,.6,0,0,-.15,0],spine:[0,.35,0],chest:[0,.25,0],head:[0,-.5,0],shL:[-.4,0,.6],shR:[-.4,0,-.6],thL:[-.3,0,0],knL:[.45,0,0],thR:[-.1,0,0],knR:[.4,0,0],tail0:[-.15,1.0,0],tail1:[0,.55,0],tail2:[0,.4,0],tail3:[0,.3,0]},
  tlWhip:{hips:[0,-.8,0,0,-.2,0],spine:[0,-.4,0],chest:[0,-.3,0],head:[0,.6,0],shL:[-.4,0,.7],shR:[-.4,0,-.7],thL:[-.1,0,0],knL:[.5,0,0],thR:[-.35,0,0],knR:[.5,0,0],tail0:[-.1,-1.2,0],tail1:[0,-.6,0],tail2:[0,-.45,0],tail3:[0,-.35,0]},
  // Ooze Geyser: rears up, scythes raised, then stabs both into the floor
  gUp:{hips:[-.25,0,0,0,.18,-.1],spine:[-.3,0,0],chest:[-.3,0,0],neck:[-.3,0,0],head:[-.5,0,0],shL:[-2.4,0,.5],elL:[.1,0,0],shR:[-2.4,0,-.5],elR:[.1,0,0],thL:[-.2,0,0],thR:[.1,0,0],tail0:[.45,0,0],tail1:[.25,0,0],jawL:[0,.55,0],jawR:[0,-.55,0]},
  gStab:{hips:[.45,0,0,0,-.55,.2],spine:[.4,0,0],chest:[.35,0,0],neck:[.2,0,0],head:[.1,0,0],shL:[-.2,0,-.25],elL:[.35,0,0],wrL:[.3,0,0],shR:[-.2,0,.25],elR:[.35,0,0],wrR:[.3,0,0],thL:[-.85,0,0],knL:[1.0,0,0],hkL:[-.4,0,0],thR:[-.5,0,0],knR:[1.0,0,0],hkR:[-.45,0,0],tail0:[-.2,0,0]},
  // Spine Volley: arches back, dorsal spines bristle, snaps forward
  vArch:{hips:[-.2,0,0,0,.05,-.15],spine:[-.35,0,0],chest:[-.4,0,0],neck:[.1,0,0],head:[.2,0,0],shL:[.6,0,.9],elL:[-.6,0,0],shR:[.6,0,-.9],elR:[-.6,0,0],tail0:[.5,0,0],tail1:[.3,0,0],tail2:[.25,0,0]},
  vSnap:{hips:[.2,0,0,0,-.12,.15],spine:[.3,0,0],chest:[.35,0,0],neck:[-.1,0,0],head:[-.1,0,0],shL:[-.4,0,.8],shR:[-.4,0,-.8],jawL:[0,.5,0],jawR:[0,-.5,0],tail0:[-.2,0,0]},
  // Carapace Burst: curls in on himself, trembling, then flings everything open
  curl:{hips:[.35,0,0,0,-.6,0],spine:[.45,0,0],chest:[.45,0,0],neck:[.3,0,0],head:[.4,0,0],shL:[-.3,0,-.75],elL:[-1.0,0,0],shR:[-.3,0,.75],elR:[-1.0,0,0],thL:[-.9,0,0],knL:[1.15,0,0],hkL:[-.5,0,0],thR:[-.9,0,0],knR:[1.15,0,0],hkR:[-.5,0,0],tail0:[.6,0,0],tail1:[.5,0,0],tail2:[.4,0,0],tail3:[.3,0,0]},
  burst:{hips:[-.25,0,0,0,.08,0],spine:[-.35,0,0],chest:[-.45,0,0],neck:[-.35,0,0],head:[-.55,0,0],shL:[-1.2,0,1.25],elL:[.05,0,0],shR:[-1.2,0,-1.25],elR:[.05,0,0],thL:[.15,0,0],thR:[.15,0,0],tail0:[-.3,0,0],tail1:[-.2,0,0],jawL:[0,.85,0],jawR:[0,-.85,0]},
  // Phase II: the awakening roar; the siphon crouch (scythes sunk into the dais); frenzy
  roar:{hips:[-.15,0,0,0,.1,0],spine:[-.3,0,0],chest:[-.35,0,0],neck:[-.4,0,0],head:[-.6,0,0],shL:[-1.6,0,1.1],elL:[-.3,0,0],shR:[-1.6,0,-1.1],elR:[-.3,0,0],jawL:[0,.9,0],jawR:[0,-.9,0],tail0:[.4,0,0],tail1:[.3,0,0]},
  siph:{hips:[.35,0,0,0,-.5,0],spine:[.3,0,0],chest:[.2,0,0],neck:[-.2,0,0],head:[-.35,0,0],shL:[-.5,0,-.3],elL:[.3,0,0],wrL:[.4,0,0],shR:[-.5,0,.3],elR:[.3,0,0],wrR:[.4,0,0],thL:[-.8,0,0],knL:[1.0,0,0],hkL:[-.4,0,0],thR:[-.8,0,0],knR:[1.0,0,0],hkR:[-.4,0,0],jawL:[0,.5,0],jawR:[0,-.5,0],tail0:[.35,0,0],tail1:[.3,0,0]},
  leap:{hips:[-.3,0,0,0,1.2,0],spine:[-.2,0,0],chest:[-.2,0,0],shL:[-2,0,.6],shR:[-2,0,-.6],thL:[-.9,0,0],knL:[1.3,0,0],thR:[-.9,0,0],knR:[1.3,0,0],tail0:[.6,0,0],tail1:[.4,0,0]},
  stag:{hips:[.2,.2,.15,0,-.55,0],spine:[.35,0,.1],chest:[.3,0,.1],neck:[.3,0,0],head:[.55,.3,.3],shL:[.4,0,.5],elL:[-.3,0,0],shR:[.6,0,-.3],elR:[-.2,0,0],thL:[-1.1,0,0],knL:[1.3,0,0],thR:[-.4,0,0],knR:[1.0,0,0],tail0:[-.3,.4,0],tail1:[0,.3,0],jawL:[0,.5,0],jawR:[0,-.2,0]},
  dead:{root:[0,0,0,0,-1.3,0],hips:[-.4,0,.5,0,0,0],spine:[-.2,0,.2],chest:[-.3,0,.2],neck:[-.3,0,0],head:[-.4,.5,0],shL:[-.4,0,1.2],shR:[.2,0,-.9],thL:[-1.4,0,0],knL:[1.6,0,0],thR:[-1.2,0,0],knR:[1.7,0,0],tail0:[0,.5,0],tail1:[0,.4,0],jawL:[0,.6,0],jawR:[0,-.6,0]}};
// ---------------- procedural base layer: breathing, the digitigrade walk, tail undulation, head tracking, mandibles ----------------
function mb144Loco(e,S,O,dt,now){const t=now/1000,sp=S.spd||0,a=Math.min(1,sp/2.4);S.gp=(S.gp||0)+dt*(1.6+sp*2.1);const g=S.gp,br=Math.sin(t*1.25);
  O.hips[4]+=.035*br+.07*Math.abs(Math.sin(g))*a;O.hips[0]+=.06*a;O.chest[0]+=.03*br;O.neck[0]+=-.02*br;
  // walk: digitigrade legs (thigh swing, knee lift, hock flick), the body rolls with each step, arms sway with the scythes held ready
  ['L','R'].forEach((s,j)=>{const ph=g+j*Math.PI,sw=Math.sin(ph),lf=Math.max(0,Math.cos(ph));
    O['th'+s][0]+=-sw*.55*a;O['kn'+s][0]+=lf*.55*a;O['hk'+s][0]+=-lf*.35*a+sw*.1*a;O['ft'+s][0]+=lf*.3*a;
    O['sh'+s][0]+=(j?1:-1)*sw*.12*a+.03*br;O['el'+s][0]+=-.04*br-.05*a});
  O.hips[2]+=Math.sin(g)*.05*a;O.hips[1]+=Math.sin(g)*.06*a;O.chest[1]+=-Math.sin(g)*.06*a;
  // tail: a wave travels down it, wider when walking
  for(let i=0;i<6;i++){const w=Math.sin(t*1.6-i*.75)*(.08+.06*a)*(1+i*.18),l=Math.sin(t*1.1-i*.6)*.04;O['tail'+i][1]+=w;O['tail'+i][0]+=l}
  // the head follows the hero (out of moves), the mandibles twitch
  const m=e.m,hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,yaw=svAng(Math.atan2(hx,hz)-m.rotation.y),k=S.mv?0:Math.min(1,Math.abs(yaw)<1.6?1:0);
  S.hy=(S.hy||0)+((Math.max(-.7,Math.min(.7,yaw))*k)-(S.hy||0))*Math.min(1,dt*3);O.head[1]+=S.hy*.6;O.neck[1]+=S.hy*.4;
  const tw=Math.max(0,Math.sin(t*3.1)*Math.sin(t*1.7))*.25;O.jawL[1]+=tw+.05*br;O.jawR[1]-=tw+.05*br}
// after the pose: the ooze pulses (brighter in Phase II and while charging), drips fall, the eyes flare
function mb144Post(e,S,dt,now){const R=S.R,t=now/1000,ph2=S.ph>1,ch=S.chg||0;
  const k=(ph2?.85:.5)+.18*Math.sin(t*1.25)+ch*1.3;R.ooze.emissiveIntensity=k;if(ph2)R.ooze.emissive.setHex(0x5ad01a);
  R.eyeM.color.setHex(ch>.3?0xf4ffb0:0xd0ff4a);
  if(!S.dieM&&Math.random()<dt*(ph2?14:7)){const js=['chest','spine','hips','shL','shR','thL','thR','tail1','tail3'],j=js[Math.floor(Math.random()*js.length)];
    const p=svWP(e,j,(Math.random()-.5)*.6,(Math.random()-.5)*.4,(Math.random()-.5)*.5);burst(p,MB144.acid,1,.15,-.6,.8)}
  if(!S.dieM&&Math.random()<dt*2.2){const p=svWP(e,'head',0,-.12,.42);burst(p,MB144.acid,1,.05,-1.2,.7)}}
// preview (v143_look PROPS=boss / bossP:<pose>): the merged model, optionally in a pose
MB144.sheet.boss=()=>{const R=svRig();mb144Build(R,null);svRest(R);svMerge(R);return R.root};
MB144.pose=(root,R,name)=>{const P=svPose({P:MB144P},name);for(const k in P){const g=R.J[k],o=P[k];if(!g)continue;const r0=g.userData.r0,p0=g.userData.p0;g.rotation.set(r0.x+o[0],r0.y+o[1],r0.z+o[2]);g.position.set(p0.x+(o[3]||0),p0.y+(o[4]||0),p0.z+(o[5]||0))}};
