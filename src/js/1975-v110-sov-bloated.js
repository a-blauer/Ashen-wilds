// ================= v110 / v112 Sovereign 4 — The Bloated One (The Dirge) =================
// A rot-king giant butcher. v112 model: a sagging stitched belly on a riveted iron belt hung with hide strips, skull and
// hook trophies; a hunched back of glowing pustules, bone spurs, chains and the broken blades of past challengers; a
// bandolier of butcher's knives; a layered spiked pauldron on the cleaver arm, a hide mantle and chain wraps on the left;
// leather bracers, shin wraps, clawed toes, a jaw with tusks and a nail-crown hammered into a small head. Every joint has
// a cap (shoulder balls, elbow, wrist, hip, knee and ankle caps, a waist roll, a thick neck) so no gap opens in any pose.
// He holds the cleaver like a butcher: the fist closes round a handle that points forward, the door-sized blade hangs
// below the handle line with its EDGE DOWN; every chop turns the wrist so the edge leads. The left fist holds a chained
// meat hook that swings under its own weight. Slow, heavy, and every blow lands with a delay you must learn.
// Pattern (learnable):
//  close in front ── Cleaver Chop: the cleaver rises overhead and HANGS there (wait for it…), then crashes down a line.
//                   Gut Sweep: the cleaver is hauled across to its left, then a wide flat sweep to its right; often a chop next.
//  close, any    ── Ground Pound: it lifts a leg high — the stomp sends a ring out around it.
//  mid           ── Bile Vomit: it rears back, the jaw drops and the belly heaves — a cone of bile, leaving a slowing pool.
//  mid, front    ── Butcher's Hook (v112): it whirls the chained hook overhead (red lane), then hurls it straight down the
//                   lane. Caught = dragged to his feet, and he follows with Tenderize, a quick cross-body hack. Sidestep the lane.
//  mid–far front ── Bone Furrow (v112): he hauls the cleaver back over his right shoulder (red lane), drives it into the
//                   ground and RIPS it forward: a fissure runs down the lane and bone spikes burst out of it one after another.
//  far           ── Belly Flop: a heavy jump onto where you stand; it lies there afterwards — the best punish of the fight.
//  Phase II (55%) "The Rot Spills": the belly splits into a toothed maw and glows; adds Butcher's Frenzy (chop, sweep,
//                   chop), Pustule Burst (the back erupts and rot rains around you — keep moving), the flop becomes a double,
//                   and Gorge (v112): arms flung wide, the maw gapes and he INHALES — a red circle and a pull toward him
//                   while rot motes and closing rings stream in — then a gut-blast fills the circle and leaves a rotting cloud.
//                   Walk against the pull and be outside the circle (or dash) when it blows.
//  Poise: heavy damage breaks his posture (stagger, +35% damage); the flop landings and the long recoveries are the windows.
var BLO={col:0x9aff6a,rot:0x6ad020,bile:0xb8d040};
// the parts of the giant use a few rings shared by the surface helpers
var BLO_BR=[[-1.3,.35,.3,0,.2],[-1.05,1.0,.95,0,.22],[-.6,1.38,1.36,0,.18],[0,1.5,1.45,0,.1],[.5,1.4,1.32,0,0],[.95,1.05,.95,0,-.1],[1.25,.5,.45,0,-.15]],
  BLO_CR=[[-.7,1.25,1.0],[-.2,1.4,1.1,0,-.05],[.25,1.45,1.12,0,-.12],[.7,1.35,1.05,0,-.25],[1.05,.95,.8,0,-.35]];
// a point on a lofted surface (rings [y,rx,rz,ox,oz]) at height y and angle a (0 = front, +PI/2 = +x), pushed out by off
function bloSrf(R0,y,a,off){let i=0;while(i<R0.length-2&&R0[i+1][0]<y)i++;const A=R0[i],B=R0[i+1],k=Math.max(0,Math.min(1,(y-A[0])/(B[0]-A[0]))),L=(u,v)=>(u||0)+((v||0)-(u||0))*k;
  const rx=L(A[1],B[1])+(off||0),rz=L(A[2],B[2])+(off||0);return [L(A[3],B[3])+Math.sin(a)*rx,y,L(A[4],B[4])+Math.cos(a)*rz]}
// aim a mesh's +Z along a direction (then roll about it)
function bloAim(m,d,roll){const v=new THREE.Vector3(d[0],d[1],d[2]).normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),v);
  if(roll)q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),roll));m.quaternion.copy(q);return m}
function bloBuild(R,e){
  const fl=svMat(R,0x6e6c4c,{roughness:.8,emissive:0x0a0c04}),fl2=svMat(R,0x50563a,{roughness:.9}),bruise=svMat(R,0x4a3448,{roughness:.85}),
    iron=svMat(R,0x4a4440,{roughness:.5,metalness:.55}),rust=svMat(R,0x6a3a20,{roughness:.8,metalness:.3}),gold=svMat(R,0x8a7030,{roughness:.4,metalness:.7}),
    cloth=svMat(R,0x3a3028,{roughness:.95,side:THREE.DoubleSide}),bone=svMat(R,0xd8ccb0,{roughness:.6}),leath=svMat(R,0x2a1e16,{roughness:.9}),
    blood=svMat(R,0x4a0c08,{roughness:.35,metalness:.1}),steel=svMat(R,0x6e6a64,{roughness:.42,metalness:.65}),edge=svMat(R,0xbab4a6,{roughness:.25,metalness:.8}),
    pus=svGlowMat(R,0x6a9a30),eye=svGlowMat(R,0xd8ff70),vein=svGlowMat(R,0x3a5a1a);R.pus=pus;R.vein=vein;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),G=svG,P=Math.PI;
  const ord=(m,o)=>{m.rotation.order=o||'YXZ';return m};
  J('root',null,0,0,0);J('hips','root',0,2.25,0);J('spine','hips',0,.35,0);J('chest','spine',0,.95,-.1);J('belly','spine',0,-.15,.55);
  // ---- hips: pelvis, riveted iron belt over a leather belt, hide strips, chains and trophies ----
  svM(R,'hips',G('b2_hp',()=>svLoft([[-.6,1.0,.82],[-.2,1.2,.98],[.15,1.27,1.03],[.45,1.3,1.05]],12)),fl2);
  svM(R,'hips',G('b2_lb',()=>svLoft([[.05,1.33,1.09],[.25,1.33,1.09]],14)),leath);
  svM(R,'hips',G('b2_bt',()=>svLoft([[.22,1.38,1.13],[.5,1.38,1.13]],14)),iron);
  for(let k=0;k<14;k++){const a=k/14*P*2;svM(R,'hips',G('b2_rv',()=>new THREE.IcosahedronGeometry(.055,0)),gold,Math.sin(a)*1.41,.36,Math.cos(a)*1.16)}
  for(let k=0;k<6;k++){const a=1.3+k*.75;svM(R,'hips',G('b2_ch2',()=>new THREE.TorusGeometry(.15,.04,4,8)),rust,Math.sin(a)*1.43,.12-.12*(k%2),Math.cos(a)*1.18,0,a,0)}
  const strip=G('b2_strip',()=>svBlade([[-.17,0],[.17,0],[.15,-.9],[.07,-1.1],[.01,-.94],[-.07,-1.16],[-.16,-.86]],.03));
  [1.75,2.15,2.55,2.95,3.35,3.75,4.15,4.55].forEach((a,k)=>{const m=svM(R,'hips',strip,k%2?cloth:leath,Math.sin(a)*1.42,.24,Math.cos(a)*1.17,-.14,a,0,1,.85+.25*((k*7)%3)/2,1);ord(m)});
  // a hide flap between the legs, under the belly
  ord(svM(R,'hips',G('b2_flap',()=>svBlade([[-.4,0],[.4,0],[.36,-1.0],[.12,-1.25],[-.05,-1.05],[-.22,-1.2],[-.38,-.9]],.035)),cloth,0,.1,1.08,-.22,0,0));
  // trophies: two skulls and a meat hook hang from the belt on short chains
  [[1.95,1],[4.33,-1]].forEach(([a,s],k)=>{const x=Math.sin(a)*1.5,z=Math.cos(a)*1.25;
    for(let q=0;q<3;q++)svM(R,'hips',G('b2_lk',()=>new THREE.TorusGeometry(.07,.022,4,6)),iron,x,.18-q*.12,z,0,q%2?P/2:0,0);
    svM(R,'hips',G('b2_sk',()=>svLump(.17,1,.08,60)),bone,x,-.32,z,0,0,0,1,1.05,1.1);svM(R,'hips',G('b2_skj',()=>new THREE.BoxGeometry(.2,.08,.14)),bone,x+s*.01,-.48,z+.05*s);
    [-1,1].forEach(t=>svM(R,'hips',G('b2_ske',()=>new THREE.IcosahedronGeometry(.045,0)),leath,x+Math.cos(a)*t*.07,-.3,z-Math.sin(a)*t*.07+(Math.cos(a)>0?.0:0)))});
  svM(R,'hips',G('b2_mh',()=>svTube([[0,0,0],[0,-.3,0],[0,-.45,.05],[0,-.5,.17],[0,-.42,.27],[0,-.33,.26]],[.04,.04,.035,.03,.022,.01],5)),rust,Math.sin(3.6)*1.48,.05,Math.cos(3.6)*1.22,0,3.6,0);
  // ---- waist roll: fills the gap between pelvis and chest at the back and sides ----
  svM(R,'spine',G('b2_wr',()=>svLoft([[-.4,1.2,1.02,0,0],[.1,1.3,1.1,0,-.06],[.55,1.32,1.08,0,-.16]],12)),fl2);
  // ---- belly: a sagging, stitched gut with bruises and veins; the seam splits into a maw in Phase II ----
  svM(R,'belly',G('b2_bl',()=>svLoft(BLO_BR,14,{tip:.05,tip0:.05})),fl);
  const bs=(y,a,o)=>bloSrf(BLO_BR,y,a,o||0);
  // the seam: from the upper right of the belly down across to the lower left, a thread line with cross stitches
  const seam=[];for(let k=0;k<=9;k++){const u=k/9;seam.push(bs(.75-u*1.35,-.7+u*1.3,.02))}
  svM(R,'belly',G('b2_sm',()=>svTube(seam,.035,4,{cap:false})),leath);
  for(let k=0;k<seam.length-1;k++){const p=seam[k],q=seam[k+1],c=[(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2],d=[q[0]-p[0],q[1]-p[1],q[2]-p[2]],n=[c[0],0,c[2]-.1];
    const m=svM(R,'belly',G('b2_cs',()=>new THREE.BoxGeometry(.05,.34,.05)),leath,c[0],c[1],c[2]);const t=new THREE.Vector3(d[0],d[1],d[2]).normalize(),N=new THREE.Vector3(n[0],0,n[2]).normalize();
    N.addScaledVector(t,-t.dot(N)).normalize();const b=new THREE.Vector3().crossVectors(N,t);m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(t,b,N));m.rotateZ(.4*(k%2?1:-1))}
  [[.2,.95,.1,.45],[-.75,-.9,.05,.4],[.45,-.35,.08,.32],[-.35,1.35,.05,.3],[-.95,.2,.06,.28]].forEach(([y,a,o,r],k)=>{const p=bs(y,a,-.04);svM(R,'belly',G('b2_br'+k,()=>svLump(r,0,.25,40+k)),bruise,p[0],p[1],p[2],0,a,0,1,.85,.32)});
  // swollen veins over the gut (they glow in Phase II)
  [[[.9,.5],[.5,.75],[.15,.9],[-.2,1.15]],[[.9,-.4],[.55,-.55],[.3,-.95],[-.1,-1.2]],[[-.3,.25],[-.55,.45],[-.85,.35]],[[.3,-1.3],[0,-1.45],[-.4,-1.6]]].forEach((L,k)=>{
    svM(R,'belly',G('b2_vn'+k,()=>svTube(L.map(([y,a])=>bs(y,a,.015)),L.map((_,i)=>.045-i*.008),4)),vein)});
  svM(R,'belly',G('b2_nv',()=>new THREE.TorusGeometry(.12,.045,4,8)),fl2,...bs(-.15,.05,.0));
  svM(R,'belly',G('b2_fold',()=>svLoft([[-.25,1.15,.75,0,.3],[0,1.38,1.0,0,.28],[.18,1.3,.95,0,.22]],14,{cap:false})),fl2,0,-.8,0);
  // the maw (Phase II): a glowing split along the seam, ringed with teeth; opens wider while it gorges
  const maw=new THREE.Group();maw.name='maw';R.J.belly.add(maw);R.maw=maw;maw.visible=false;const mc=bs(.05,0,0);maw.position.set(mc[0],mc[1],mc[2]-.04);
  svM(R,maw,G('b2_gs',()=>svLump(.55,1,.12,22)),pus,0,0,.08,0,0,-.75,1.75,.42,.45);
  svM(R,maw,G('b2_gs2',()=>svLump(.45,0,.15,23)),blood,0,0,.02,0,0,-.75,2.0,.6,.42);
  for(let k=0;k<12;k++){const u=k/11*2-1,s=k%2?1:-1,x=u*.9,y=-u*.62+s*.2,m=svM(R,maw,G('b2_tt',()=>svHorn(.07,.3,0,.04,4,2)),bone,x,y,.3);bloAim(m,[-s*.2,-s*.95,.25])}
  // ---- chest: barrel chest, sagging pecs, a hunched back of pustules, bone spurs, chains and broken blades ----
  svM(R,'chest',G('b2_ch',()=>svLoft(BLO_CR,13)),fl);
  svM(R,'chest',G('b2_hm',()=>svLump(1.05,1,.12,24)),fl2,0,.6,-.75,0,0,0,1.3,.9,1);
  [-1,1].forEach(s=>{const p=bloSrf(BLO_CR,.15,s*.55,-.12);svM(R,'chest',G('b2_pc',()=>svLump(.55,1,.08,25)),fl,p[0],p[1],p[2],0,s*.4,0,1.1,.75,.55)});
  const hc=[0,.6,-.75],hr=[1.365,.945,1.05],hs=(x,y,z,o)=>{const v=new THREE.Vector3(x,y,z).normalize();return [hc[0]+v.x*hr[0]*(o||1),hc[1]+v.y*hr[1]*(o||1),hc[2]+v.z*hr[2]*(o||1),v]};
  R.pz=[];[[.45,.55,-1],[-.4,.7,-1],[0,.1,-1],[.75,0,-.85],[-.75,.1,-.85],[.15,.95,-.7],[-.2,-.35,-1]].forEach(([x,y,z],k)=>{const [px,py,pz,v]=hs(x,y,z,.97);
    svM(R,'chest',G('b2_pz'+(k%3),()=>svLump(.27,0,.2,30+k)),fl2,px,py,pz,0,0,0,1,1,.8);svM(R,'chest',G('b2_pg',()=>new THREE.IcosahedronGeometry(.17,1)),pus,px+v.x*.12,py+v.y*.12,pz+v.z*.12);
    const g=new THREE.Group();g.position.set(px+v.x*.2,py+v.y*.2,pz+v.z*.2);R.J.chest.add(g);R.pz.push(g)});
  // bone spurs along the ridge of the hump
  [[0,1,-.35],[.25,.9,-.6],[-.25,.85,-.65],[0,.75,-.8],[.5,.65,-.7],[-.5,.6,-.75]].forEach(([x,y,z],k)=>{const [px,py,pz,v]=hs(x,y,z,.92);const m=svM(R,'chest',G('b2_sp'+(k%2),()=>svHorn(.11+.03*(k%2),.55+.15*(k%2),0,.12,5,3)),bone,px,py,pz);bloAim(m,[v.x,v.y+.3,v.z])});
  // broken blades and arrows of past challengers, stuck in his back
  [[[.6,.2,-1],[.5,.4,-.9],.6],[[-.55,.55,-1],[-.6,.5,-.8],-.5]].forEach(([d,a,rl],k)=>{const [px,py,pz]=hs(d[0],d[1],d[2],.9);const g=new THREE.Group();g.position.set(px,py,pz);R.J.chest.add(g);bloAim(g,a,rl);
    svM(R,g,G('b2_sw',()=>svBlade([[-.09,0],[.09,0],[.09,.62],[.03,.78],[-.04,.66],[-.09,.7]],.03).rotateX(P/2)),steel,0,0,-.2);
    svM(R,g,G('b2_sg',()=>new THREE.BoxGeometry(.42,.07,.07)),rust,0,0,.45);svM(R,g,G('b2_swh',()=>svLoft([[0,.05,.05],[.32,.045,.045]],5).rotateX(P/2)),leath,0,0,.47)});
  [[.3,.35,-1],[.95,.4,-.6],[-.15,-.1,-1]].forEach((d,k)=>{const [px,py,pz,v]=hs(d[0],d[1],d[2],.95);const g=new THREE.Group();g.position.set(px,py,pz);R.J.chest.add(g);bloAim(g,[v.x+.2,v.y+.4,v.z]);
    svM(R,g,G('b2_ar',()=>svLoft([[-.1,.025,.025],[.75,.025,.025]],4).rotateX(P/2)),leath);for(let q=0;q<3;q++)svM(R,g,G('b2_af',()=>new THREE.BoxGeometry(.01,.14,.2)),cloth,0,0,.68,0,0,q*P/3)});
  // chains draped across the back from shoulder to shoulder
  for(let k=0;k<13;k++){const u=k/12,x=-1.15+u*2.3,sag=Math.sin(u*P)*.55,[px,py,pz]=hs(x*.75,.7-sag,-1,1.02);svM(R,'chest',G('b2_cl',()=>new THREE.TorusGeometry(.1,.03,4,7)),iron,px,py,pz,0,k%2?P/2:0,k%2?0:.3)}
  // a bandolier of butcher's knives from the right shoulder across the chest to the left flank
  const bd=[];for(let k=0;k<=8;k++){const u=k/8;bd.push(bloSrf(BLO_CR,.95-u*1.55,-1.05+u*2.0,.05))}
  svM(R,'chest',G('b2_bd',()=>svTube(bd,bd.map(()=>[.13,.035]),4,{cap:false})),leath);
  [2,4,6].forEach((k,q)=>{const p=bd[k];const g=new THREE.Group();g.position.set(p[0],p[1],p[2]+.05);R.J.chest.add(g);g.rotation.set(0,0,.4-q*.15);
    svM(R,g,G('b2_kn',()=>svBlade([[0,0],[.1,0],[.1,-.45],[0,-.62],[-.03,-.3]],.02)),steel,0,-.1,.02);svM(R,g,G('b2_kh',()=>new THREE.BoxGeometry(.08,.24,.06)),rust,.05,.1,.02);
    svM(R,g,G('b2_bk',()=>new THREE.BoxGeometry(.2,.06,.04)),gold,.05,-.02,.0)});
  // a hide mantle round the neck and an iron gorget at the throat
  for(let k=0;k<14;k++){const a=k/14*P*2,p=bloSrf(BLO_CR,.95,a,.02);const m=svM(R,'chest',G('b2_mt',()=>svBlade([[-.22,0],[.22,0],[.18,-.55],[.04,-.7],[-.1,-.52],[-.2,-.62]],.03)),k%3?cloth:leath,p[0],p[1]+.12,p[2],-.55,a,0);ord(m)}
  [-1,0,1].forEach(s=>{const p=bloSrf(BLO_CR,.9,s*.38,.04);svM(R,'chest',G('b2_gg',()=>new THREE.BoxGeometry(.38,.42,.08)),iron,p[0],p[1],p[2],-.35,s*.38,0);
    svM(R,'chest',G('b2_rv',()=>new THREE.IcosahedronGeometry(.055,0)),gold,p[0]+Math.sin(s*.38)*.06,p[1]+.12,p[2]+.05)});
  // ---- neck and head: a thick neck, jowls, a heavy brow, tusked jaw, a nail-crown hammered in ----
  J('neck','chest',0,1.0,.35);J('head','neck',0,.25,.1);J('jaw','head',0,-.08,.1);
  svM(R,'neck',G('b2_nk',()=>svLoft([[-.45,.8,.72,0,-.12],[0,.64,.6],[.35,.5,.5,0,.05]],10)),fl);
  svM(R,'neck',G('b2_dc',()=>svLump(.45,1,.1,27)),fl2,0,-.02,.42,0,0,0,1.15,.55,.75);
  svM(R,'head',G('b2_hd',()=>svLump(.48,1,.1,26)),fl,0,.15,0,0,0,0,1,1.05,.95);
  svM(R,'head',G('b2_bw',()=>svLoft([[-.4,.08,.1],[.4,.08,.1]],6).rotateZ(P/2)),fl2,0,.33,.37,0,0,0);
  svM(R,'head',G('b2_ns',()=>svLump(.12,0,.2,61)),fl2,0,.16,.48,0,0,0,1,1.2,1);
  [-1,1].forEach(s=>{svM(R,'head',G('b2_ey',()=>new THREE.IcosahedronGeometry(.07,1)),eye,s*.17,.24,.41);
    svM(R,'head',G('b2_jl',()=>svLump(.2,0,.15,62)),fl,s*.29,-.02,.28,0,0,0,1,1.25,.8);svM(R,'head',G('b2_er',()=>svLump(.13,0,.2,63)),fl2,s*.46,.16,-.04,0,0,0,.45,1,.7)});
  for(let k=0;k<5;k++)svM(R,'head',G('b2_ut',()=>new THREE.ConeGeometry(.035,.12,4)),bone,(k-2)*.07,-.04,.42,P,0,0);
  svM(R,'head',G('b2_cr',()=>svLoft([[0,.43,.43],[.22,.45,.45]],10,{cap:false})),gold,0,.42,0);
  for(let k=0;k<8;k++){const a=k/8*P*2;svM(R,'head',G('b2_nl',()=>svHorn(.04,.45,0,0,4,2)),rust,Math.sin(a)*.43,.6,Math.cos(a)*.43,-P/2+.25*Math.cos(a),a,0)}
  for(let k=0;k<5;k++){const a=(k-2)*.5,m=svM(R,'head',G('b2_csp',()=>svHorn(.06,.32,0,0,4,2)),gold,Math.sin(a)*.45,.6,Math.cos(a)*.45);bloAim(m,[Math.sin(a)*.3,1,Math.cos(a)*.3])}
  [-1,0,1].forEach(s=>svM(R,'head',G('b2_gm',()=>new THREE.OctahedronGeometry(.06,0)),pus,s*.22,.53,.41));
  [[-.12,.18],[.2,.12]].forEach(([x,l])=>svM(R,'head',G('b2_bt'+l,()=>new THREE.BoxGeometry(.035,l*2.2,.03)),blood,x,.45-l,.43,-.25,0,0));
  svM(R,'jaw',G('b2_jw',()=>svLoft([[-.22,.36,.3],[.1,.44,.38]],9)),fl2,0,-.1,.0);
  for(let k=0;k<4;k++)svM(R,'jaw',G('b2_lt',()=>new THREE.ConeGeometry(.03,.1,4)),bone,(k-1.5)*.08,.02,.33);
  [-1,1].forEach(s=>{const m=svM(R,'jaw',G('b2_tk',()=>svHorn(.065,.36,.06,.12,5,3)),bone,s*.24,.0,.28);bloAim(m,[s*.25,1,.35])});
  // ---- arms: shoulder balls, layered pauldron (right), mantle and chains (left), elbow caps, bracers, fists ----
  const fist=(L,s)=>{svM(R,'hd'+L,G('b2_wc',()=>svLump(.34,1,.06,64)),fl,0,0,0);
    svM(R,'hd'+L,G('b2_pl',()=>svLump(.3,1,.08,65)),fl,s*.06,-.14,-.02,0,0,0,1,1.05,1.25);
    // four fingers curl round the handle axis (+Z through (0,-.3,.08)), knuckles out, nails at the tips
    for(let k=0;k<4;k++){const z=-.17+k*.13;svM(R,'hd'+L,G('b2_fg',()=>new THREE.TorusGeometry(.17,.075,5,8,4.3)),fl,0,-.3,.08+z,0,0,-P/2-2.15+s*.35);
      const th=-P/2+s*.35+2.15;svM(R,'hd'+L,G('b2_nl2',()=>new THREE.ConeGeometry(.04,.1,4)),bone,Math.cos(th)*.2,-.3+Math.sin(th)*.2,.08+z,0,0,th)}
    svM(R,'hd'+L,G('b2_tb',()=>svTube([[s*.2,-.12,.18],[s*.17,-.2,.32],[s*.06,-.24,.38]],[.085,.075,.06],5)),fl)};
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('sh'+L,'chest',s*1.35,.75,0,0,0,s*.15);
    svM(R,'sh'+L,G('b2_sb',()=>svLump(.62,1,.06,66)),fl,0,0,0);
    svM(R,'sh'+L,G('b2_ua',()=>svLoft([[.25,.62,.62],[-.45,.58,.56],[-1.2,.43,.43]],10)),fl);
    svM(R,'sh'+L,G('b2_bc',()=>svLoft([[-.62,.6,.58],[-.78,.58,.56]],10)),leath);
    J('el'+L,'sh'+L,0,-1.25,0,-.2);svM(R,'el'+L,G('b2_ec',()=>svLump(.46,1,.06,67)),fl2,0,0,0);
    svM(R,'el'+L,G('b2_fa',()=>svLoft([[.1,.44,.44],[-.6,.46,.44],[-1.1,.34,.34]],9)),fl2);
    svM(R,'el'+L,G('b2_br',()=>svLoft([[-.42,.5,.48],[-.75,.47,.45],[-1.02,.39,.39]],9)),leath);
    for(let k=0;k<5;k++){const a=k/5*P*2;svM(R,'el'+L,G('b2_st',()=>new THREE.IcosahedronGeometry(.06,0)),iron,Math.sin(a)*.48,-.6,Math.cos(a)*.46)}
    for(let k=0;k<3;k++){const m=svM(R,'el'+L,G('b2_bs',()=>svHorn(.07,.3,0,0,4,2)),iron,s*.46,-.5-k*.2,-.05);bloAim(m,[s,.15,-.3])}
    J('hd'+L,'el'+L,0,-1.15,0);fist(L,s)});
  // right shoulder: a three-lame spiked pauldron, riveted
  svM(R,'shR',G('b2_pd',()=>svLoft([[-.2,.8,.8],[.15,.74,.74],[.42,.5,.5],[.55,.12,.12]],10)),iron,-.05,.12,0,0,0,-.3);
  svM(R,'shR',G('b2_pd1',()=>svLoft([[-.12,.76,.74],[.08,.74,.72]],10)),iron,-.03,-.22,0,0,0,-.18);
  svM(R,'shR',G('b2_pd2',()=>svLoft([[-.12,.7,.68],[.08,.68,.66]],10)),rust,-.02,-.45,0,0,0,-.1);
  for(let k=0;k<3;k++){const m=svM(R,'shR',G('b2_ps',()=>svHorn(.12,.6,0,.15,5,3)),iron,-.25-k*.12,.55-k*.1,(k-1)*.35);bloAim(m,[-.7,1,(k-1)*.3])}
  for(let k=0;k<8;k++){const a=k/8*P*2;svM(R,'shR',G('b2_rv',()=>new THREE.IcosahedronGeometry(.055,0)),gold,-.05+Math.sin(a)*.8,.0,Math.cos(a)*.8)}
  // left shoulder: a hide drape and a wrap of chain round the upper arm
  for(let k=0;k<6;k++){const a=-1.2+k*.5;const m=svM(R,'shL',G('b2_hd2',()=>svBlade([[-.25,0],[.25,0],[.2,-.6],[.05,-.78],[-.12,-.58],[-.22,-.7]],.03)),k%2?cloth:leath,Math.sin(a+P/2)*.66,.45,Math.cos(a+P/2)*.62,-.35,a+P/2,0);ord(m)}
  for(let k=0;k<7;k++){const a=k/7*P*2;svM(R,'shL',G('b2_cw',()=>new THREE.TorusGeometry(.09,.028,4,6)),iron,Math.sin(a)*.6,-.3-k*.05,Math.cos(a)*.58,0,a,P/2)}
  // ---- the cleaver: handle forward from the right fist, blade below the handle line, EDGE DOWN ----
  const cv=J('clv','hdR',0,-.3,.08,0,0,0);
  svM(R,cv,G('b2_hl',()=>svLoft([[-.5,.1,.1],[.95,.11,.11]],6).rotateX(P/2)),leath);
  [-.48,.45,.86].forEach(z=>svM(R,cv,G('b2_hb',()=>svLoft([[-.05,.13,.13],[.05,.13,.13]],6).rotateX(P/2)),iron,0,0,z));
  svM(R,cv,G('b2_pr',()=>new THREE.TorusGeometry(.13,.035,4,8)),iron,0,0,-.66,0,P/2,0);
  svM(R,cv,G('b2_bl2',()=>{const s=new THREE.Shape();[[.82,.24],[2.1,.28],[3.0,.32],[3.16,.12],[3.14,-1.12],[2.98,-1.3],[2.35,-1.26],[2.24,-1.18],[2.13,-1.27],[1.45,-1.24],[1.36,-1.16],[1.27,-1.22],[.95,-1.16],[.82,-.9]].forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));
    const h=new THREE.Path();for(let i=0;i<=8;i++){const a=-i/8*P*2;i?h.lineTo(2.78+Math.cos(a)*.14,.0+Math.sin(a)*.14):h.moveTo(2.92,0)}s.holes.push(h);
    const g=new THREE.ExtrudeGeometry(s,{depth:.08,bevelEnabled:true,bevelThickness:.04,bevelSize:.03,bevelSegments:1});g.translate(0,0,-.04);g.rotateY(-P/2);g.computeVertexNormals();return g}),steel);
  svM(R,cv,G('b2_spn',()=>new THREE.BoxGeometry(.16,.1,2.2)),iron,0,.28,1.98,-.025,0,0);
  svM(R,cv,G('b2_edg',()=>new THREE.BoxGeometry(.05,.1,2.15)),edge,0,-1.2,2.0,.02,0,0);
  for(let k=0;k<3;k++)svM(R,cv,G('b2_crv',()=>new THREE.IcosahedronGeometry(.06,0)),gold,0,.08-k*.32,.95);
  [[1.7,-.75,.32],[2.45,-.95,.26],[1.15,-.4,.2]].forEach(([z,y,r],k)=>[-1,1].forEach(s=>svM(R,cv,G('b2_bld'+k,()=>svLump(r,0,.35,70+k)),blood,s*.065,y,z,0,0,0,.12,1,1.4)));
  // the hook: a chain hanging from the left fist with a meat hook; it swings free (a plain group posed in post)
  const hk=new THREE.Group();hk.name='hook';hk.position.set(0,-.3,.36);R.J.hdL.add(hk);R.hk=hk;
  for(let k=0;k<8;k++)svM(R,hk,G('b2_hl1',()=>new THREE.TorusGeometry(.08,.026,4,7)),iron,0,-.06-k*.13,0,0,k%2?P/2:0,P/2);
  svM(R,hk,G('b2_hk',()=>svTube([[0,0,0],[0,-.35,0],[0,-.58,.06],[0,-.66,.22],[0,-.56,.36],[0,-.42,.36]],[.07,.07,.065,.055,.04,.015],6)),rust,0,-1.08,0);
  svM(R,hk,G('b2_hkb',()=>svHorn(.04,.16,0,0,4,2)),rust,0,-1.5,.36,-P/2-.4,0,0);
  // ---- legs: hip caps, thighs, knee caps with iron guards, wrapped shins, clawed feet ----
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('th'+L,'hips',s*.72,-.3,0);svM(R,'th'+L,G('b2_hc',()=>svLump(.6,1,.06,68)),fl2,0,0,0);
    svM(R,'th'+L,G('b2_th',()=>svLoft([[.1,.6,.62],[-.6,.52,.54],[-1.05,.4,.42]],10)),fl2);
    J('kn'+L,'th'+L,0,-1.05,0);svM(R,'kn'+L,G('b2_kc',()=>svLump(.42,1,.06,69)),fl,0,0,0);
    svM(R,'kn'+L,G('b2_kg',()=>svLoft([[-.25,.3,.12],[.0,.36,.16],[.25,.3,.12]],7)),iron,0,.02,.36);
    {const m=svM(R,'kn'+L,G('b2_ks',()=>svHorn(.08,.3,0,0,4,2)),iron,0,.05,.48);bloAim(m,[0,.2,1])}
    svM(R,'kn'+L,G('b2_sh',()=>svLoft([[.05,.39,.41],[-.85,.33,.35]],9)),fl);
    [-.25,-.45,-.65].forEach((y,k)=>svM(R,'kn'+L,G('b2_sw'+k,()=>svLoft([[-.07,.4-k*.025,.42-k*.025],[.07,.4-k*.025,.42-k*.025]],9)),cloth,0,y,0,.15*(k%2?1:-1),0,.1));
    J('ft'+L,'kn'+L,0,-.88,0);svM(R,'ft'+L,G('b2_ac',()=>svLump(.35,1,.06,71)),fl2,0,0,0);
    svM(R,'ft'+L,G('b2_ft',()=>svLump(.38,1,.1,31)),fl2,0,-.15,.22,0,0,0,1.05,.5,1.45);
    for(let k=0;k<3;k++){const x=(k-1)*.2;svM(R,'ft'+L,G('b2_toe',()=>svLump(.13,0,.15,72)),fl2,x,-.2,.72,0,0,0,1,.8,1.2);
      const m=svM(R,'ft'+L,G('b2_cw2',()=>svHorn(.06,.2,0,-.08,4,2)),bone,x,-.2,.82);bloAim(m,[0,-.35,1])}
    svM(R,'ft'+L,G('b2_fw',()=>svLoft([[.0,.37,.39],[.25,.37,.39]],9,{cap:false})),cloth,0,.05,0)});
}
function bloLoco(e,S,O,dt,now){const t=now/1000,a=Math.min(1,S.spd/1.6);S.gp=(S.gp||0)+dt*(1.6+S.spd*1.4);const g=S.gp;
  const br=Math.sin(t*1.1);O.belly[4]+=.03*br;O.chest[0]+=.02*br;O.hips[4]+=.08*Math.abs(Math.sin(g))*a;O.hips[2]+=.08*Math.sin(g)*a;O.chest[2]+=-.06*Math.sin(g)*a;
  O.head[1]+=.1*Math.sin(t*.5);O.head[0]+=.05*Math.sin(t*.8);O.jaw[0]+=.04+.03*Math.sin(t*1.1+1);
  ['L','R'].forEach((s,j)=>{const ph=g+j*Math.PI,sw=Math.sin(ph)*.45*a,lf=Math.max(0,Math.cos(ph))*.6*a;O['th'+s][0]+=-sw;O['kn'+s][0]+=lf;O['ft'+s][0]+=-lf*.3;
    O['th'+s][2]+=(j?-1:1)*.08});
  // left fist holds the hook chain loosely; the right arm carries the cleaver low, handle forward, edge down
  const st=BLOP.stand;for(const k of ['shL','elL','hdL','shR','elR','hdR'])for(let q=0;q<3;q++)O[k][q]+=st[k][q];
  O.shL[0]+=.2*Math.sin(g+Math.PI)*a+.04*br;O.shR[0]+=.1*Math.sin(g)*a+.02*br;O.hdR[0]+=-.06*Math.sin(g)*a}
function bloPost(e,S,dt,now){const R=S.R,on=S.ph>1,k=.6+.4*Math.sin(now/220);R.pus.color.setHex(on?0xb8ff50:0x6a9a30);if(on)R.pus.color.multiplyScalar(k);
  R.vein.color.setHex(on?0x8aff40:0x3a5a1a);if(on)R.vein.color.multiplyScalar(.7+.3*k);R.maw.visible=on;
  const hv=S.heave||0;R.J.belly.scale.set(1+.12*hv,1+.18*hv,1+.15*hv);S.heave=Math.max(0,hv-dt*.6);
  const mo=S.mawO||0;R.maw.scale.set(1+.15*mo,1+1.4*mo,1+.3*mo);
  // the hook hangs under its own weight: it eases toward "straight down" in the boss's frame (a damped swing)
  const H=R.hk;if(H){const Q=SVX.bq||(SVX.bq={a:new THREE.Quaternion(),b:new THREE.Quaternion(),c:new THREE.Quaternion()});R.J.hdL.getWorldQuaternion(Q.a);R.root.getWorldQuaternion(Q.b);
    Q.c.copy(Q.a).invert().multiply(Q.b);if(!S.hkQ)S.hkQ=Q.b.clone();S.hkV=S.hkV||0;S.hkQ.slerp(Q.b,Math.min(1,dt*7));Q.c.copy(Q.a).invert().multiply(S.hkQ);H.quaternion.copy(Q.c);H.visible=!S.hkOut}
  if(on&&Math.random()<dt*4){const p=svWP(e,'belly',(Math.random()-.5)*.6,-.3,1.4);burst(p,BLO.rot,1,.4,-.2,.8)}}
var BLOP={
  // the idle carry (added to the loco layer; also the end key of the moves so the fade back is seamless)
  stand:{shL:[-.05,0,.22],elL:[-.45,0,0],hdL:[.25,0,0],shR:[-.05,0,-.3],elR:[-.12,0,0],hdR:[.47,.07,.2]},
  // cleaver chop (overhead, long hang)
  cUp:{hips:[0,.15,0],spine:[-.15,0,0],chest:[-.2,.2,0],shR:[-2.75,0,-.2],elR:[-.35,.7,0],hdR:[1.41,.28,.66],shL:[-.4,0,.5],elL:[-.6,0,0],head:[-.15,0,0],jaw:[.25,0,0],thR:[.2,0,0],thL:[-.25,0,0],knL:[.3,0,0]},
  cDn:{hips:[0,-.1,0,0,-.3],spine:[.3,0,0],chest:[.35,-.1,0],shR:[-.7,0,-.1],elR:[0,0,0],hdR:[.38,.03,.18],shL:[.3,0,.6],head:[.3,0,0],jaw:[.1,0,0],thR:[-.35,0,0],knR:[.5,0,0],thL:[.2,0,0]},
  cRec:{spine:[.2,0,0],chest:[.2,0,0],shR:[-.6,0,-.15],hdR:[.69,.01,.12],head:[.1,0,0],elR:[0,0,0]},
  // gut sweep (to its right)
  sUp:{hips:[0,.4,0],chest:[0,.5,0],shR:[-1.4,0,.9],elR:[-.7,1.2,0],hdR:[1.44,-.54,-1.05],shL:[-.5,0,.2],head:[0,-.2,0]},
  sHit:{hips:[0,-.35,0,0,-.1,.2],chest:[.1,-.4,0],shR:[-1.35,0,-1],elR:[-.1,.5,0],hdR:[1.45,-.81,-1.15],shL:[-.2,0,.7],head:[0,.3,0]},
  sRec:{hips:[0,-.2,0],chest:[0,-.3,0],shR:[-.9,0,-.8],elR:[-.3,.4,0],hdR:[.85,.39,.97]},
  // ground pound (left foot)
  pUp:{hips:[0,0,-.15,0,.25],thL:[-1.5,0,.25],knL:[1.4,0,0],ftL:[.2,0,0],thR:[.1,0,0],chest:[-.15,0,.12],shL:[-.4,0,.9],shR:[-.4,0,-.9],hdR:[.67,.18,.71],elR:[0,.1,0]},
  pDn:{hips:[0,0,.05,0,-.35],thL:[-.15,0,.15],knL:[.4,0,0],thR:[-.3,0,0],knR:[.6,0,0],chest:[.25,0,0],shL:[-.2,0,.6],shR:[-.2,0,-.6],hdR:[.34,.03,.44],elR:[0,-.2,0]},
  // bile vomit
  vBack:{spine:[-.35,0,0],chest:[-.35,0,0],head:[-.5,0,0],jaw:[.25,0,0],shL:[-.2,0,.9],shR:[-.2,0,-.9],hdR:[.89,.27,.76],hips:[0,0,0,0,-.05,-.25],elR:[0,.3,0]},
  vOut:{spine:[.35,0,0],chest:[.4,0,0],head:[.2,0,0],jaw:[.75,0,0],shL:[-.5,0,.6],shR:[-.5,0,-.6],hdR:[.3,.02,.49],hips:[0,0,0,0,-.1,.2],elR:[0,-.3,0]},
  // belly flop
  fCr:{hips:[0,0,0,0,-.55],spine:[.25,0,0],chest:[.2,0,0],thL:[-.9,0,0],thR:[-.9,0,0],knL:[1.5,0,0],knR:[1.5,0,0],ftL:[-.5,0,0],ftR:[-.5,0,0],shL:[.4,0,.4],shR:[.4,0,-.4],hdR:[-.42,-.13,.56],elR:[0,-.3,0]},
  fAir:{root:[0,0,0,0,4.2],hips:[-.3,0,0],spine:[-.2,0,0],thL:[-.6,0,0],thR:[-.6,0,0],knL:[.8,0,0],knR:[.8,0,0],shL:[-2.4,0,.6],shR:[-2.4,0,-.6],elL:[-.4,0,0],elR:[-.4,1.5,0],hdR:[1.43,1.23,1.21],head:[-.4,0,0],jaw:[.4,0,0]},
  fLand:{root:[0,0,0,0,-.8,1.2],hips:[1.35,0,0,0,-.6],spine:[.2,0,0],chest:[.1,0,0],thL:[.3,0,0],thR:[.3,0,0],shL:[-2.6,0,.5],shR:[-2.6,0,-.5],hdR:[1.03,-.17,-.57],head:[-.8,0,0],elR:[0,.7,0]},
  fUp:{root:[0,0,0,0,-.3,.5],hips:[.6,0,0,0,-.3],spine:[.2,0,0],thL:[-.7,0,0],thR:[-.4,0,0],knL:[1.2,0,0],knR:[.8,0,0],shL:[-.6,0,.4],shR:[-.4,0,-.5],hdR:[-.14,-.06,.67],head:[-.2,0,0],elR:[0,-.4,0]},
  // roar / phase change
  roar:{spine:[-.3,0,0],chest:[-.35,0,0],head:[-.6,0,0],jaw:[.7,0,0],shL:[-1.6,0,1.2],shR:[-1.6,0,-1.2],elL:[-.4,0,0],elR:[-.4,.9,0],hdR:[1.05,.23,.3],thL:[-.2,0,.15],thR:[-.2,0,-.15],knL:[.3,0,0],knR:[.3,0,0]},
  hunch:{hips:[0,0,0,0,-.3],spine:[.35,0,0],chest:[.35,0,0],head:[.4,0,0],shL:[.2,0,.3],shR:[.2,0,-.3],elL:[-1.1,0,0],elR:[-1.1,-.4,0],hdR:[.57,0,.02],knL:[.5,0,0],knR:[.5,0,0],thL:[-.4,0,0],thR:[-.4,0,0]},
  // pustule burst
  pzB:{spine:[.25,0,0],chest:[.4,0,0],head:[.5,0,0],jaw:[.4,0,0],shL:[-.2,0,1.2],shR:[-.2,0,-1.2],elL:[-.6,0,0],elR:[-.6,-.6,0],hdR:[.84,.08,.73],hips:[0,0,0,0,-.35]},
  stag:{hips:[.2,0,.15,0,-.9],spine:[.35,0,.1],chest:[.3,0,0],head:[.6,0,.3],jaw:[.5,0,0],thL:[-1,0,.2],thR:[-.5,0,-.1],knL:[1.6,0,0],knR:[1.1,0,0],shL:[.5,0,.6],shR:[-.1,0,-.5],hdR:[.71,-.48,-1.06],elR:[-.7,0,0]},
  dead:{root:[0,0,0,0,-.6,1],hips:[1.4,0,.2,0,-.7],spine:[.2,0,0],head:[-.5,.4,0],jaw:[.6,0,0],shL:[-2.8,0,1],shR:[-2.6,0,-1],thL:[.2,0,0],thR:[.3,0,0],hdR:[.54,.07,-.21],elR:[0,.8,0]},
  // ---- v112: Butcher's Hook — the left arm whirls the chain overhead, hurls the hook, then yanks it home ----
  hkWind:{hips:[0,-.25,0],spine:[-.1,-.15,0],chest:[-.1,-.35,0],head:[0,.35,0],shL:[-2.3,0,.75],elL:[-.9,0,0],hdL:[.3,0,0],shR:[-.15,0,-.45],elR:[-.4,.3,0],hdR:[.62,.11,.57],thL:[-.15,0,.1],thR:[.2,0,-.05]},
  hkSpA:{hips:[0,-.3,0],spine:[-.1,-.15,0],chest:[-.1,-.45,0],head:[0,.4,0],shL:[-2.7,.4,.45],elL:[-.6,0,0],hdL:[.1,0,.3],shR:[-.15,0,-.5],elR:[-.4,.4,0],hdR:[.48,.13,.68],thL:[-.15,0,.1],thR:[.2,0,-.05]},
  hkSpB:{hips:[0,-.3,0],spine:[-.12,-.2,0],chest:[-.1,-.5,0],head:[0,.42,0],shL:[-2.5,-.4,1.1],elL:[-1,0,0],hdL:[.4,0,-.3],shR:[-.15,0,-.5],elR:[-.4,.5,0],hdR:[.41,.11,.72],thL:[-.15,0,.1],thR:[.2,0,-.05]},
  hkThrow:{hips:[0,.3,0,0,-.1,.25],spine:[.2,.2,0],chest:[.25,.45,0],head:[.1,-.3,0],shL:[-1.45,0,-.15],elL:[-.05,0,0],hdL:[-.1,0,0],shR:[.2,0,-.5],elR:[-.5,-1.2,0],hdR:[.43,-.09,-.06],thL:[-.45,0,0],knL:[.35,0,0],thR:[.3,0,0]},
  hkPull:{hips:[0,-.2,0,0,-.15,-.3],spine:[-.25,-.15,0],chest:[-.25,-.35,0],head:[-.15,.25,0],shL:[-.35,0,.35],elL:[-1.6,0,0],hdL:[.3,0,0],shR:[-.5,0,-.4],elR:[-.6,.8,0],hdR:[1.3,.44,.75],thL:[.25,0,0],thR:[-.35,0,0],knR:[.4,0,0]},
  // Tenderize (after a catch): the cleaver crosses to the left shoulder, then a short diagonal hack down to the right
  hcUp:{hips:[0,.35,0],spine:[-.05,.1,0],chest:[-.1,.45,0],head:[0,-.25,0],shR:[-2,0,.75],elR:[-1.35,1.1,0],hdR:[1.43,-.14,-.66],shL:[-.4,0,.35],elL:[-.9,0,0],thL:[-.2,0,0]},
  hcHit:{hips:[0,-.25,0,0,-.2,.25],spine:[.3,-.05,0],chest:[.3,-.25,0],head:[.2,.2,0],shR:[-1,0,-.55],elR:[-.2,-.1,0],hdR:[.55,.08,.63],shL:[-.2,0,.6],elL:[-.6,0,0],thR:[-.35,0,0],knR:[.45,0,0]},
  // ---- v112: Gorge (Phase II) — arms flung wide, the maw gapes and he inhales; then doubles over in a gut-blast ----
  gWide:{hips:[0,0,0,0,-.15,-.2],spine:[-.3,0,0],chest:[-.35,0,0],head:[-.45,0,0],jaw:[.6,0,0],shL:[-.9,0,1.45],shR:[-.9,0,-1.45],elL:[-.25,0,0],elR:[-.25,.7,0],hdR:[1.39,.53,.84],thL:[0,0,.2],thR:[0,0,-.2],knL:[.2,0,0],knR:[.2,0,0]},
  gSuck:{hips:[0,0,0,0,-.25,-.35],spine:[-.42,0,0],chest:[-.45,0,0],head:[-.6,0,0],jaw:[.85,0,0],shL:[-1.25,0,1.55],shR:[-1.25,0,-1.55],elL:[-.45,0,0],elR:[-.45,1.3,0],hdR:[1.38,.57,.91],thL:[.1,0,.25],thR:[.1,0,-.25],knL:[.3,0,0],knR:[.3,0,0]},
  gBlast:{hips:[0,0,0,0,-.45,.35],spine:[.5,0,0],chest:[.5,0,0],head:[.35,0,0],jaw:[.9,0,0],shL:[.35,0,.7],shR:[.35,0,-.7],elL:[-1.2,0,0],elR:[-1.2,-.6,0],hdR:[.38,-.06,.21],thL:[-.45,0,.2],thR:[-.45,0,-.2],knL:[.75,0,0],knR:[.75,0,0],ftL:[-.25,0,0],ftR:[-.25,0,0]},
  // ---- v112: Bone Furrow — the cleaver hauled back over the right shoulder, driven point-first into the ground, ripped forward ----
  buWind:{hips:[0,-.4,0,0,-.1,-.15],spine:[-.15,-.25,0],chest:[-.2,-.45,.1],head:[0,.5,0],shR:[-2.45,0,-.9],elR:[-1,-.9,0],hdR:[1.46,.44,1.1],shL:[-.9,0,.4],elL:[-.8,0,0],thR:[.3,0,-.1],thL:[-.3,0,.1],knL:[.3,0,0]},
  buSlam:{hips:[0,.2,0,0,-.6,.35],spine:[.4,.1,0],chest:[.35,.2,0],head:[.35,-.2,0],shR:[-1.2,0,-.1],elR:[-.25,-.4,0],hdR:[1.22,-.1,-.22],shL:[-.5,0,.45],elL:[-.9,0,0],thR:[-.6,0,0],knR:[.8,0,0],thL:[.35,0,0],knL:[.45,0,0],ftR:[-.2,0,0]},
  buRip:{hips:[0,.1,0,0,-.2,.5],spine:[.05,.1,0],chest:[0,.15,0],head:[-.1,-.1,0],jaw:[.35,0,0],shR:[-1.9,0,-.35],elR:[-.2,.1,0],hdR:[1.18,0,.13],shL:[-.2,0,.7],elL:[-.5,0,0],thR:[-.55,0,0],knR:[.4,0,0],thL:[.4,0,0]}};
function bloPool(c,p,r,life,nm){const e=c.e,S2={k:'c',r};let tk=0,t=0;svDecal(p,0x8ac030,r,life,.55);svDecal(p,0x2a3a08,r*.75,life,.5);
  kqFx({tick(dt){t+=dt||0;tk-=dt||0;if(!AF||e.dead)return false;if(Math.random()<.25)burst(gY(p,.2).add(new THREE.Vector3((Math.random()-.5)*r,0,(Math.random()-.5)*r)),BLO.bile,1,.3,.6,.7);
    if(svIn(S2,{x:p.x,z:p.z,a:0},pl.position,0)){dqDebuff(nm||'Bile','🤢',{mspd:-.35},600,'Slowed by bile');if(tk<=0&&hero.iv<=0&&hero.hp>0){tk=.6;bossHit(e,.18)}}return t<life}})}
function bloSplat(p,n,r){burst(gY(p,.3),BLO.rot,n||30,r||3,2.5,.7);burst(gY(p,.3),0x4a3a2a,(n||30)/2,(r||3)*.8,2,.6);svShock(p,0x9ab060,(r||3)*1.2,.45);svDecal(p,0x3a4010,(r||3)*.6,3,.5)}
function bloGlob(c,from,q,T){const e=c.e,S2={k:'c',r:2.1},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,T));
  svShot(from,new THREE.Vector3(q.x,GH(q.x,q.z)+.2,q.z),T,BLO.rot,1.3,6,P=>{if(e.dead||!AF)return;bloSplat(P,18,2);svSnd('squelch',.6,1.1);svHitNow(e,S2,an,.85,{col:BLO.rot});if(c.rnd()<.4)bloPool(c,P,1.7,3.5)})}
// ---- v112 effect helpers ----
// the flying hook: a hook mesh and a chain of links drawn from the left fist to it; out over T0, held, reeled back over T1.
// pos(k) gives the hook position (0 = fist .. 1 = the end of the lane); returns {pull(T1)}
function bloHookFx(c,end,T0){const e=c.e,R=c.R,g=new THREE.Group(),mI=R.mats.find(m=>m.metalness>.5)||R.mats[0],mR=R.mats[4]||mI;
  const hook=new THREE.Mesh(svG('b2_hk',()=>null),mR);hook.scale.setScalar(1.15);g.add(hook);const N=34,links=[];for(let i=0;i<N;i++){const l=new THREE.Mesh(svG('b2_hl1',()=>null),mI);l.scale.setScalar(1.15);g.add(l);links.push(l)}
  g.traverse(o=>{o.userData.lpsSkip=1;o.frustumCulled=false});scene.add(g);let t=0,ph=0,T1=.4,k=0;const a=new THREE.Vector3(),b=new THREE.Vector3(),d=new THREE.Vector3(),st=c.S;st.hkOut=1;
  const F={k:0,t:0,pull(T){ph=1;t=0;T1=T},dead:false,pos:new THREE.Vector3()};
  kqFx({tick(dt){dt=dt||0;t+=dt;if(e.dead||!e.m.parent||F.dead){st.hkOut=0;return false}
    svWP(e,'hdL',0,-.35,.3,a);if(ph===0)k=svEase.o(Math.min(1,t/T0));else k=1-svEase.io(Math.min(1,t/T1));
    b.lerpVectors(a,end,k);b.y=a.y+(end.y-a.y)*k+Math.sin(k*Math.PI)*.8*(ph?0:1);F.pos.copy(b);F.k=k;hook.position.copy(b);d.subVectors(b,a);const L=d.length()||1;
    hook.lookAt(b.x+d.x/L,b.y+d.y/L,b.z+d.z/L);hook.rotateX(-Math.PI/2);
    for(let i=0;i<N;i++){const u=(i+.5)/N,l=links[i];l.position.lerpVectors(a,b,u);l.position.y-=Math.sin(u*Math.PI)*Math.min(.6,L*.04)*(ph?1.5:.4);l.lookAt(b);l.rotateY(Math.PI/2);if(i%2)l.rotateX(Math.PI/2);l.visible=L>.3}
    if(Math.random()<.5)burst(b,0xb0a090,1,.2,.1,.25);if(ph===1&&t>=T1){st.hkOut=0;return false}return true},end(){scene.remove(g);st.hkOut=0}});return F}
// motes and closing rings stream into the boss while he gorges (game clock); stop() ends it
function bloInhale(c,T){const e=c.e,P=[],rings=[],gR=svG('b2_ir',()=>new THREE.RingGeometry(.9,1,40,1).rotateX(-Math.PI/2));let t=0,nr=0,on=true;
  const F={stop(){on=false}};
  kqFx({tick(dt){dt=dt||0;t+=dt;if(e.dead||!e.m.parent)on=false;const c0=e.m.position;
    if(on&&t<T){for(let i=0;i<2;i++){const a=Math.random()*6.283,r=7+Math.random()*6,o=kqSpr(i?BLO.rot:0xc8d890,.35+Math.random()*.35);o.position.set(c0.x+Math.cos(a)*r,GH(c0.x,c0.z)+.4+Math.random()*2.6,c0.z+Math.sin(a)*r);scene.add(o);P.push({o,a,r,y:o.position.y,v:4+Math.random()*4})}
      if(t>nr){nr=t+.32;const m=new THREE.MeshBasicMaterial({color:BLO.col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),o=new THREE.Mesh(gR,m);o.renderOrder=22;scene.add(o);rings.push({o,m,t:0})}}
    for(let i=P.length-1;i>=0;i--){const q=P[i];q.r-=q.v*dt;q.a+=dt*.9;q.v+=dt*6;const tgt=GH(c0.x,c0.z)+2.6;q.y+=(tgt-q.y)*Math.min(1,dt*2);q.o.position.set(c0.x+Math.cos(q.a)*q.r,q.y,c0.z+Math.sin(q.a)*q.r);
      if(q.r<1.2){scene.remove(q.o);P.splice(i,1)}}
    for(let i=rings.length-1;i>=0;i--){const q=rings[i];q.t+=dt;const k=Math.min(1,q.t/.9),s=11*(1-svEase.i(k))+.6;q.o.scale.set(s,1,s);q.o.position.set(c0.x,GH(c0.x,c0.z)+.22,c0.z);q.m.opacity=.6*Math.sin(k*Math.PI);
      if(k>=1){scene.remove(q.o);q.m.dispose();rings.splice(i,1)}}
    return on&&t<T||P.length>0||rings.length>0},end(){P.forEach(q=>scene.remove(q.o));rings.forEach(q=>{scene.remove(q.o);q.m.dispose()})}});return F}
// a lingering rot cloud: green puffs rising over a pool that slows and rots
function bloGas(c,p,r,life){bloPool(c,p,r,life,'Rotting');let t=0;kqFx({tick(dt){t+=dt||0;if(Math.random()<.6){const a=Math.random()*6.283,d=Math.random()*r;const q=new THREE.Vector3(p.x+Math.cos(a)*d,GH(p.x,p.z)+.3,p.z+Math.sin(a)*d);burst(q,Math.random()<.5?0x6a9020:0x9ab060,2,.4,1.4,1.2)}return t<life&&!c.e.dead}})}
function bloBoneMat(){return BLO.bm||(BLO.bm=new THREE.MeshStandardMaterial({color:0xd8ccb0,roughness:.6,flatShading:true}))}
var BLOM={
  intro:{dur:3.0,trk:[[.5,'hunch','io'],[1.2,'hunch','l',.02],[1.8,'roar','o'],[2.6,'roar','l',.03],[3.0,'stand','io']],trn:[[0,3,1]],
    ev:[[.3,c=>svSnd('squelch',.8,.6)],[1.75,c=>{svSnd('roar',1.2,.6);shake(.45);svShock(c.m.position,BLO.col,8,.8);c.S.heave=1}]]},
  chop:{wt:10,cd:3.5,r:[0,8],a:'f',dur:2.35,lock:1.05,trk:[[.6,'cUp','io'],[1.25,'cUp','l',.025],[1.38,'cDn','s'],[1.95,'cRec','io'],[2.35,'stand','io']],
    hit:[{t:1.36,s:{k:'l',w:3,l:8.5,b:0},f:.6,dm:1.6,w:.4,fx:(c,an)=>{const p=new THREE.Vector3(an.x+Math.sin(an.a)*5,0,an.z+Math.cos(an.a)*5);bloSplat(p,40,3);shake(.45);svSnd('heavy',1.2,.9)}}],
    tr:[[1.22,1.42,'clv',[0,-1.2,3.05],[0,-1.15,1.1],0xd8ffb0,.2]],ev:[[.35,c=>svSnd('hum',.4,.7)],[1.26,c=>svSnd('swing',1,.5)]],nx:[['sweep',.3,8]],rec:.45},
  sweep:{wt:9,cd:3.5,r:[0,7.5],a:'f',mel:1,dur:1.7,lock:.7,trk:[[.65,'sUp','io'],[.88,'sUp','l',.02],[1.05,'sHit','s'],[1.35,'sRec','io'],[1.7,'stand','io']],
    hit:[{t:1.02,s:{k:'a',r:7.2,h:1.35},f:0,dm:1.3,kb:2.5}],tr:[[.9,1.12,'clv',[0,-1.2,3.05],[0,-1.15,1.1],0xd8ffb0,.2]],ev:[[.92,c=>svSnd('swing',1.1,.55)]],nx:[['chop',.45,8]],rec:.3},
  stomp:{wt:8,cd:6,r:[0,6.5],a:'any',dur:1.9,armor:1,trn:[[0,.4,1.5]],trk:[[.75,'pUp','io'],[.98,'pUp','l',.02],[1.1,'pDn','s'],[1.5,'pDn','l'],[1.9,'stand','io']],
    hit:[{t:1.08,s:{k:'c',r:6},dm:1.3,w:.85,kb:3.5,fx:c=>{svShock(c.m.position,0x9ab060,7,.55);bloSplat(c.m.position,40,3.5);shake(.5);svSnd('heavy',1.2,.7)}}],ev:[[.4,c=>svSnd('hum',.4,.5)]],rec:.4},
  vomit:{wt:7,cd:8,r:[0,10],a:'f',dur:2.5,lock:.85,armor:1,trn:[[0,.85,2]],trk:[[.75,'vBack','io'],[1.05,'vBack','l',.02],[1.2,'vOut','s'],[1.9,'vOut','l'],[2.5,'stand','io']],
    hit:[{t:1.2,s:{k:'a',r:9.5,h:.55},f:.5,dm:1.0,w:.7,on:()=>dqDebuff('Bile','🤢',{mspd:-.35},2500,'Slowed by bile'),fx:(c,an)=>{const m=svWP(c.e,'jaw',0,-.1,.5);
      for(let k=0;k<40;k++){const d=1+Math.random()*8,a=an.a+(Math.random()-.5)*1;burst(new THREE.Vector3(an.x+Math.sin(a)*d,GH(an.x,an.z)+.5+Math.random()*1.2,an.z+Math.cos(a)*d),BLO.bile,2,1,.6,.8)}
      burst(m,BLO.bile,30,3,.5,.7);bloPool(c,new THREE.Vector3(an.x+Math.sin(an.a)*5.5,0,an.z+Math.cos(an.a)*5.5),2.8,5);svSnd('squelch',1.2,.6)}}],
    ev:[[.4,c=>{svSnd('squelch',.8,.5);c.S.heave=1.4}]],rec:.45},
  flop:{wt:8,cd:9,r:[5,22],a:'fs',dur:3.2,lock:.85,armor:1,trn:[[0,.85,3]],trk:[[.75,'fCr','io'],[.9,'fCr','l',.02],[1.25,'fAir','o'],[1.6,'fLand','i'],[2.6,'fLand','l'],[3.0,'fUp','io'],[3.2,'stand','io']],
    rm:[[.92,1.6,'tgt','l',.6,24]],hit:[{t:1.6,s:{k:'c',r:4.8},o:'tgt',dm:1.7,w:.8,kb:3,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);svShock(p,0x9ab060,7,.6);bloSplat(p,70,4.5);shake(.6);svSnd('heavy',1.4,.6);svSnd('squelch',1,.5)}}],
    ev:[[.9,c=>svSnd('whoosh',1,.5)]],nx:[['flop2',.0]],rec:.3},
  // ---- v112: Butcher's Hook (mid range, in front): whirl, hurl down a lane, reel in; a catch drags you in for Tenderize ----
  hook:{wt:8,cd:9,r:[4.5,14],a:'f',dur:2.75,lock:.72,trn:[[0,.72,2.6]],
    trk:[[.4,'hkWind','io'],[.6,'hkSpA','io'],[.8,'hkSpB','io'],[1.0,'hkSpA','io'],[1.14,'hkWind','io',.015],[1.3,'hkThrow','s'],[1.62,'hkThrow','l'],[1.98,'hkPull','o'],[2.3,'hkPull','io'],[2.75,'stand','io']],
    hit:[{t:1.44,s:{k:'l',w:1.5,l:13.5},f:.8,dm:.9,w:.72,col:0xd8c8a0,on:c=>{c.M.an.caught=1;dqDebuff('Hooked','🪝',{mspd:-1},900,'Caught on the hook');svSnd('blood',1,.9);
      burst(gY(pl.position,1.2),0x8a1010,24,2,1.5,.6);svDecal(pl.position,0x3a0606,1.2,2.5,.5)},
      fx:(c,an,hit)=>{if(!hit){const p=new THREE.Vector3(an.x+Math.sin(an.a)*13.5,0,an.z+Math.cos(an.a)*13.5);burst(gY(p,.3),0x8a7a60,14,1.5,1.2,.5);svSnd('crack',.6,.7)}}}],
    ev:[[.45,c=>svSnd('whoosh',.7,.7)],[.75,c=>svSnd('whoosh',.8,.8)],[1.0,c=>svSnd('whoosh',.9,.9)],
      [1.3,c=>{const a=c.m.rotation.y,p=c.m.position,end=new THREE.Vector3(p.x+Math.sin(a)*14.3,GH(p.x,p.z)+1,p.z+Math.cos(a)*14.3);c.M.an.hk=bloHookFx(c,end,.16);svSnd('swing',1.1,.8);svSnd('crack',.5,1.5)}],
      [1.62,c=>{const F=c.M.an.hk;if(F)F.pull(.42);svSnd('crack',.6,.6);if(c.M.an.caught){const m=c.m,a=m.rotation.y;c.M.an.dst={x:m.position.x+Math.sin(a)*3.2,z:m.position.z+Math.cos(a)*3.2}}}]],
    tk(c,dt){const M=c.M;if(M.an.caught&&M.an.dst&&M.t<2.08&&hero.hp>0){const k=Math.min(1,dt*7),dx=M.an.dst.x-pl.position.x,dz=M.an.dst.z-pl.position.z;if(Math.hypot(dx,dz)>.2)walk(pl,dx*k,dz*k)}},
    end(c){const F=c.M.an.hk;if(F)F.dead=true;c.S.hkOut=0},nx:[['hookChop',1,5]],rec:.4},
  hookChop:{dur:1.55,lock:.3,mel:1,trn:[[0,.3,3]],trk:[[.3,'hcUp','io'],[.42,'hcUp','l',.02],[.56,'hcHit','s'],[1.0,'hcHit','l'],[1.55,'stand','io']],
    hit:[{t:.54,s:{k:'a',r:5,h:.75},f:0,dm:1.25,kb:2,fx:(c,an)=>{const p=c.at(3.2,-.6);burst(gY(p,.4),0x8a1010,20,2,1.2,.5);svDecal(p,0x3a0606,1.3,2.5,.5);shake(.3);svSnd('heavy',.9,1.1)}}],
    tr:[[.42,.62,'clv',[0,-1.2,3.05],[0,-1.15,1.1],0xd8ffb0,.18]],ev:[[.42,c=>svSnd('swing',1,.7)]],rec:.35},
  // ---- v112: Bone Furrow (mid–far, in front): cleaver driven into the ground and ripped forward; bone spikes race down the lane ----
  furrow:{wt:7,cd:9,r:[5,16],a:'f',dur:2.9,lock:.55,armor:1,trn:[[0,.55,2.2]],
    trk:[[.5,'buWind','io'],[.95,'buWind','l',.03],[1.15,'buSlam','s'],[1.4,'buSlam','l'],[1.68,'buRip','o'],[2.3,'buRip','l'],[2.9,'stand','io']],
    hit:[{t:1.45,s:{k:'l',w:2.6,l:13.5},f:2.4,w:.9,nohit:1,flash:false}],
    tr:[[1.0,1.2,'clv',[0,-1.2,3.05],[0,-1.15,1.1],0xd8ffb0,.2],[1.42,1.72,'clv',[0,-1.2,3.05],[0,-1.15,1.1],0xb0ff80,.3]],
    ev:[[.3,c=>svSnd('hum',.45,.6)],[1.0,c=>svSnd('swing',1.1,.45)],
      [1.15,c=>{const p=c.at(3.4,-.6);svShock(p,0xb0a080,2.5,.35);burst(gY(p,.3),0x5a4a3a,30,2.5,2.5,.6);svDecal(p,0x1a1408,1.6,4,.6);shake(.4);svSnd('heavy',1.1,.8)}],
      [1.42,c=>svSnd('crack',1,.5)]].concat([0,1,2,3,4,5,6,7].map(k=>[1.45+k*.07,c=>{const m=c.m,a=m.rotation.y,f=3.4+k*1.6,x=(k%2?.35:-.35),p=c.at(f,x),an={x:p.x,z:p.z,a};
        const mat=bloBoneMat();for(let q=0;q<3;q++){const o=new THREE.Vector3(p.x+(Math.random()-.5)*1.1,0,p.z+(Math.random()-.5)*1.1);svSpike(o,mat,1.3+Math.random()*1.1+(q?0:.6),.22+Math.random()*.12,1.3,.7)}
        svDecal(p,0x1a1408,1.3,4,.55);burst(gY(p,.3),0x6a5a40,14,1.6,2.2,.5);if(k%2===0)svSnd('crack',.7,.7+k*.06);if(k===2||k===6)shake(.2);
        if(!c.M.an.fh&&c.hit({k:'c',r:1.45},an,1.15,{kb:2.2,col:0xd8ccb0}))c.M.an.fh=1}])),rec:.5},
  // ---- Phase II ----
  awaken:{dur:3.4,inv:[0,3.4],armor:1,trk:[[.5,'hunch','io'],[1.25,'hunch','l',.035],[1.7,'roar','o'],[2.9,'roar','l',.03],[3.4,'stand','io']],trn:[[0,3,1]],
    hit:[{t:1.75,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.2,fx:c=>{svShock(c.m.position,BLO.col,10,.8);bloSplat(c.m.position,90,6)}}],
    ev:[[.05,c=>{banner('THE ROT SPILLS','The Bloated One bursts open','');svSnd('squelch',1,.4)}],[1.25,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.heave=2;flash('rgba(160,255,90,.3)');svSnd('roar',1.3,.55);shake(.6)}]]},
  frenzy:{wt:9,cd:9,ph:2,r:[0,8],a:'f',dur:3.6,lock:.6,armor:1,trn:[[0,.6,3],[1.2,1.5,3],[2.2,2.55,3]],
    trk:[[.55,'cUp','io'],[.72,'cUp','l',.02],[.85,'cDn','s'],[1.3,'sUp','io'],[1.62,'sHit','s'],[2.1,'cUp','io'],[2.55,'cUp','l',.03],[2.68,'cDn','s'],[3.2,'cRec','io'],[3.6,'stand','io']],
    hit:[{t:.83,s:{k:'l',w:3,l:8.5},f:.6,dm:1.3,w:.35,fx:(c,an)=>{bloSplat(new THREE.Vector3(an.x+Math.sin(an.a)*5,0,an.z+Math.cos(an.a)*5),30,2.5);shake(.35);svSnd('heavy',1,1)}},
      {t:1.6,s:{k:'a',r:7.2,h:1.35},dm:1.2,mel:1,kb:2.5},{t:2.66,s:{k:'l',w:3.4,l:9},f:.6,dm:1.7,w:.4,fx:(c,an)=>{bloSplat(new THREE.Vector3(an.x+Math.sin(an.a)*5,0,an.z+Math.cos(an.a)*5),60,3.5);shake(.55);svSnd('heavy',1.3,.8)}}],
    tr:[[.72,.9,'clv',[0,-1.2,3.05],[0,-1.15,1.1],0xd8ffb0,.2],[1.45,1.68,'clv',[0,-1.2,3.05],[0,-1.15,1.1],0xd8ffb0,.2],[2.56,2.74,'clv',[0,-1.2,3.05],[0,-1.15,1.1],0xd8ffb0,.2]],
    ev:[[.75,c=>svSnd('swing',1,.6)],[1.5,c=>svSnd('swing',1,.5)],[2.58,c=>svSnd('swing',1.1,.45)]],rec:.6},
  burst:{wt:7,cd:13,ph:2,r:[0,40],a:'any',dur:3.0,armor:1,trn:[[0,3,1.5]],trk:[[.6,'hunch','io'],[1.1,'hunch','l',.03],[1.3,'pzB','s'],[2.4,'pzB','l'],[3.0,'stand','io']],
    ev:[[.3,c=>{svSnd('squelch',.9,.5);c.S.heave=1}],[1.3,c=>{svSnd('squelch',1.2,.8);shake(.3);c.R.pz.forEach(g=>{const p=new THREE.Vector3();g.getWorldPosition(p);burst(p,BLO.rot,20,3,4,.7)})}]].concat(
      [0,1,2,3,4,5,6,7].map(i=>[1.35+i*.13,c=>{const from=new THREE.Vector3();c.R.pz[i%c.R.pz.length].getWorldPosition(from);const a=c.rnd()*6.283,r=i<2?0:1.5+c.rnd()*4.5,d=pl.mvd&&nowP()-pl.mvd.t<300?pl.mvd:{x:0,z:0};
        const q=c.inA(pl.position.clone().add(new THREE.Vector3(Math.cos(a)*r+d.x*i*.4,0,Math.sin(a)*r+d.z*i*.4)),.8);bloGlob(c,from,q,1.0+i*.05)}])),rec:.5},
  flop2:{ph:2,dur:3.0,lock:.6,armor:1,trn:[[0,.6,3]],trk:[[.45,'fUp','io'],[.6,'fCr','io'],[1.0,'fAir','o'],[1.35,'fLand','i'],[2.4,'fLand','l'],[2.8,'fUp','io'],[3.0,'stand','io']],
    rm:[[.65,1.35,'tgt','l',.6,24]],hit:[{t:1.35,s:{k:'c',r:5.2},o:'tgt',dm:1.8,w:.7,kb:3,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);svShock(p,0x9ab060,8,.6);bloSplat(p,80,5);shake(.65);svSnd('heavy',1.5,.55);bloPool(c,p,3,5)}}],
    ev:[[.65,c=>svSnd('whoosh',1,.45)]],rec:.4},
  // ---- v112: Gorge (Phase II, any side, close–mid): inhale (pull + red circle), then a gut-blast and a rotting cloud ----
  gorge:{wt:7,cd:14,ph:2,r:[0,12],a:'any',dur:3.4,armor:1,trn:[[0,.6,1.5]],
    trk:[[.55,'gWide','io'],[.85,'gSuck','io'],[1.9,'gSuck','l',.025],[2.15,'gBlast','s'],[2.75,'gBlast','l'],[3.4,'stand','io']],
    hit:[{t:2.15,s:{k:'c',r:5.5},dm:1.5,w:1.25,kb:4.5,col:0xb8ff60,fx:c=>{const p=c.m.position.clone();svShock(p,BLO.col,8,.6);svShock(p,0x6a9020,6,.9,.5);bloSplat(p,70,5);
      const m=svWP(c.e,'belly',0,0,1.6);burst(m,BLO.rot,50,5,1.5,.8);burst(m,0xc8d890,30,4,2.5,.9);bloGas(c,p,4.2,3.5);shake(.6);svSnd('roar',1,.8);svSnd('squelch',1.3,.45)}}],
    ev:[[.35,c=>{svSnd('squelch',.8,.6);c.S.heave=.8}],[.8,c=>{c.M.an.inh=bloInhale(c,1.15);svSnd('hiss',1.1,.5);svSnd('hum',.6,.4)}],[1.35,c=>svSnd('hiss',1,.42)],
      [2.0,c=>{const F=c.M.an.inh;if(F)F.stop();c.S.heave=1.6}]],
    tk(c,dt){const M=c.M,t=M.t,S=c.S;S.mawO=t<.6?t/.6*.4:t<1.95?.4+.6*Math.min(1,(t-.6)/1.0):t<2.25?1:Math.max(0,1-(t-2.25)/.9);
      if(t>.85&&t<1.98&&hero.hp>0&&!(hero.iv>0)){const m=c.m.position,dx=m.x-pl.position.x,dz=m.z-pl.position.z,L=Math.hypot(dx,dz);
        if(L<15&&L>S.body+.9){const f=2.7*dt*(1-L/18);walk(pl,dx/L*f,dz/L*f)}}},
    end(c){c.S.mawO=0;const F=c.M.an.inh;if(F)F.stop()},rec:.55}};
BLOM.flop.nx=[['flop2',.55,26]];
svReg(4,{name:'Bloated One',col:BLO.col,body:2.4,ph2:.55,poise:.19,headJ:'head',turnA:2.6,
  ai:{pref:5,walk:1.7,run:2.6,turn:1.5,rest:[.95,1.6],ph2r:.72,strafe:.3},
  build:bloBuild,loco:bloLoco,post:bloPost,P:BLOP,M:BLOM,
  stag:[[.3,'stag','o'],[2.2,'stag','l',.03],[2.8,'stand','io']],stagT:2.8,
  die:[[.5,'stag','o'],[1.4,'dead','i'],[2.1,'dead','l']],
  homeY(A){const a=A.dqA!=null?A.dqA:0;return Math.atan2(Math.cos(a),Math.sin(a))},
  reset(e){if(e.sv){e.sv.mawO=0;e.sv.hkOut=0}},
  dying(e,t){if(t>1.3&&t<1.35){bloSplat(e.m.position,80,4);shake(.4)}}});
// ---- the den's warning sign: the current moveset (v110 + v112) ----
DSTXT[4]={den:'The Charnel Pit',zone:'The Dirge',
  atk:[['🔪 Cleaver Chop','He raises the cleaver overhead and HOLDS it, then it crashes down a line in front of him.','Wait for the drop, then step to the side — don\'t dodge early.'],
   ['🌀 Gut Sweep','The cleaver is hauled across to his left, then swept flat to his right in a wide arc in front. Often followed by a chop.','Back out of reach, or get behind him; dash through the swing.'],
   ['🦶 Ground Pound','He lifts one leg high; the stomp throws a ring out all around him.','Leave the red circle while the leg is up, or dash as it lands.'],
   ['🤮 Bile Vomit','He rears back, the jaw drops and the belly heaves: a long cone of bile that leaves a slowing pool.','Step out of the cone to the side; don\'t fight in the pool.'],
   ['🪝 Butcher\'s Hook','He whirls a chained hook overhead (a red lane in front), then hurls it straight down the lane. If it catches you, you are dragged to his feet and he hacks at you (Tenderize).','Sidestep the lane while the hook whirls; if caught, dash away from the hack.'],
   ['🦴 Bone Furrow','He hauls the cleaver back over his shoulder (a long red lane), drives it into the ground and rips it forward: bone spikes burst up the lane one after another.','Step off the lane before the cleaver lands; the spikes travel away from him.'],
   ['💥 Belly Flop','From range he leaps onto where you stand (red circle) — then lies there.','Run out of the circle; punish him while he lies on the ground.'],
   ['⚔ Butcher\'s Frenzy','Phase II: chop, sweep, chop in one string.','Keep to his sides and count the three blows.'],
   ['☣ Pustule Burst','Phase II: the pustules on his back burst and rot rains onto red circles around you.','Keep moving; the globs follow where you were heading.'],
   ['🫁 Gorge','Phase II: arms flung wide, his belly-maw gapes and he INHALES, pulling you toward him (red circle around him), then a gut-blast fills the circle and leaves a rotting cloud.','Walk against the pull and be outside the circle when it blows — or dash at the blast. Stay out of the cloud.'],
   ['🐸 Double Flop','Phase II: the belly flop is often followed by a second leap.','After the first landing, run again — then punish.']],
  weak:['POSTURE: heavy hits fill the yellow bar under his health; when it breaks he is STAGGERED for a few seconds and takes +35% damage.',
   'His biggest moves (stomp, vomit, flop, furrow, frenzy, gorge) carry armour — the stagger waits until the move ends.',
   'Every blow has a long, readable wind-up and a long recovery: the flop landing, the furrow and the gorge leave him open.',
   'Bile pools and the rot cloud slow you — keep the fight on clean ground.',
   'Phase II begins at 55% health with "The Rot Spills".']};
