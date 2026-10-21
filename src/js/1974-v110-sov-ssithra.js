// ================= v110 / v112 Sovereign 3 — Ssith'ra the Endless (Searing Sands) =================
// v112 model: a wurm-centipede in layered armour. The head has a skull dome under three overlapping crown plates, brow
// ridges and cheek plates, a bone under-jaw, a crest of five horns and two great swept horns bound with iron bands and
// faded prayer rags, eight ember eyes, glowing rune scars, a burning maw ringed with teeth, two great serrated mandibles
// (on jointed caps), jointed palps and two-jointed antennae, and a collar frill that sleeves the neck. Fourteen body
// segments taper to a forked stinger tail; each one is a dorsal tergite with a flared back rim (it overlaps the segment
// behind like shingles), a keel ridge with a rune, side pleurites, a bone belly plate, a membrane sleeve that reaches
// into the segment in front (no gap at any bend), glowing veins, bone studs, dorsal spines and side spikes; some carry
// impaled skulls, iron rings with chains or rags. Every leg is coxa cap + femur + knee cap + tibia + claw.
// The body is a chain hanging from the back of the head: each segment wants to lie on the path the head has taken (it
// really slithers), and is then pulled to a fixed distance from the one in front of it, so rearing, lunging and
// burrowing never tear the neck or the body apart. A control joint ('ctl') lets move tracks arch and sway the body.
// Pattern (learnable):
//  close    ── Mandible Snap: it rears a little and the mandibles spread wide (hiss), then a short lunge and a snap.
//  mid      ── Rearing Slam: the head rises high above you and trembles — then crashes down along a line. Long recovery.
//              Acid Spray: it rears to mid height and sweeps acid left to right across the front (three beats).
//              Sinkhole (v112): she drives her jaws into the sand; a spiral vortex opens under you and drags you to its
//              centre for ~1.5 s, then the centre caves in (red circle). Run out against the pull, or dash (breaks it).
//  mid-far  ── Sun Lance (v112): she rears, the maw gathers a white-gold glare (red line shows), then a beam scorches the
//              line and molten-glass spikes run along it. Phase II: the glass bursts again 0.6 s later.
//  far      ── Sand Charge: the head drops low, then it charges straight down a line.
//              Burrow: she dives under the sand; a ripple hunts you; when the ripple stops, MOVE — she bursts out there.
//              Whether she will burrow AGAIN is decided when she dives (from the move's seed, so co-op partners see the
//              same): if so only her head (and a bit of neck) bursts out, bites, and goes straight back under; only the
//              last surfacing of a chain brings the whole body out (it pours out of the hole, head first).
//  flank    ── Quill Volley (v112): with you beside or behind her she arches her back like a bow (rattling) and flings
//              bone quills onto red circles around you (8; 11 in Phase II). They stick in the sand as bone spikes.
//  Phase II (55%) "The Endless Hunger": its seams, veins and runes glow like a forge; adds Triple Burrow (head, head,
//              then the whole body) and Molten Spit (globs arc onto you and your path), and the snap becomes a double.
var SSR={col:0xff7a30,acid:0xc8ff40,sand:0xd8b070,glass:0xffc860,bone:0xf0dcb0,N:14,L:1.05,D:4.6,NK:.85,sc:[],sp:[],off:[],y:[],v0:null};
(function(){for(let k=0;k<SSR.N;k++){const s=k<10?1-.02*k:.82-.08*(k-9);SSR.sc.push(s);SSR.y.push(.35+.7*s);SSR.sp.push(k?SSR.L*(SSR.sc[k-1]+s)/2:SSR.NK);SSR.off.push(k?SSR.off[k-1]+SSR.sp[k]:0)}})();
// point a mesh's +Z along (dx,dy,dz), its +Y toward 'up' (so a horn's bend goes the right way)
function ssrDir(o,dx,dy,dz,ux,uy,uz){const V3=THREE.Vector3,z=new V3(dx,dy,dz).normalize(),u=new V3(ux||0,uy==null?1:uy,uz||0);let x=new V3().crossVectors(u,z);if(x.lengthSq()<1e-6)x.set(1,0,0);x.normalize();
  const y=new V3().crossVectors(z,x);o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));return o}
// shared effect materials (glass spikes, bone quills, sandstone), made once
function ssrFxM(k){const M=SSR.fm||(SSR.fm={});if(M[k])return M[k];
  M[k]=k==='glass'?new THREE.MeshStandardMaterial({color:0xffb050,emissive:0x8a3208,emissiveIntensity:1,roughness:.15,metalness:.1,transparent:true,opacity:.85,flatShading:true})
    :k==='bone'?new THREE.MeshStandardMaterial({color:0xe2cca2,roughness:.6,flatShading:true}):new THREE.MeshStandardMaterial({color:0x8a6a42,roughness:.95,flatShading:true});return M[k]}
function ssrBuild(R,e){
  const cara=svMat(R,0x3c130b,{roughness:.38,metalness:.32,emissive:0x120302}),cara2=svMat(R,0x5e2210,{roughness:.45,metalness:.26,emissive:0x0c0201}),
    bel=svMat(R,0xb48858,{roughness:.78}),leg=svMat(R,0x260b08,{roughness:.55,metalness:.18}),horn=svMat(R,0xdcc49c,{roughness:.55}),
    iron=svMat(R,0x4a4440,{roughness:.45,metalness:.65}),cloth=svMat(R,0x5a1810,{roughness:.95,side:THREE.DoubleSide}),
    eye=svGlowMat(R,0xffb040),maw=svGlowMat(R,0xff5a14),seam=svGlowMat(R,0x5a1a08);R.seam=seam;R.eye=eye;R.maw=maw;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),H='head',lump=(r,s)=>svG('s2_lp'+r+'_'+(s||1),()=>svLump(r,0,.18,s||1));
  J('root',null,0,0,0);J('ctl','root',0,0,0);J('head','root',0,1.25,.2);
  // ---- the head ----
  svM(R,H,svG('s2_sk',()=>svLoftZ([[-.85,.9,.68,0,.04],[-.35,1.06,.8,0,.12],[.25,1.04,.76,0,.1],[.75,.82,.56,0,0],[1.15,.52,.36,0,-.08],[1.38,.26,.2,0,-.12]],10)),cara);
  svM(R,H,svG('s2_cp1',()=>svLoftZ([[-.98,.8,.2,0,.66],[-.55,.96,.3,0,.74],[-.15,.9,.26,0,.72]],9)),cara2);
  svM(R,H,svG('s2_cp2',()=>svLoftZ([[-.3,.84,.22,0,.7],[.15,.92,.28,0,.76],[.55,.74,.22,0,.6]],9)),cara);
  svM(R,H,svG('s2_cp3',()=>svLoftZ([[.35,.72,.2,0,.56],[.75,.7,.22,0,.5],[1.08,.44,.14,0,.3]],8)),cara2);
  svM(R,H,svG('s2_uj',()=>svLoftZ([[-.75,.7,.42,0,-.32],[.4,.62,.36,0,-.34],[1.2,.3,.16,0,-.3]],8)),bel);
  for(let k=0;k<3;k++)svM(R,H,svG('s2_ujr',()=>svLoftZ([[-.06,.66,.12,0,-.66],[.06,.66,.12,0,-.66]],8)),leg,0,0,-.4+k*.42,0,0,0,1-k*.12,1,1);
  svM(R,H,svG('s2_col',()=>svLoftZ([[-1.2,.74,.6,0,-.02],[-.95,.86,.7,0,.02],[-.6,.96,.76,0,.06]],10)),leg);
  for(let i=0;i<7;i++){const th=(i-3)*.48,o=svM(R,H,svG('s2_fr',()=>svHorn(.11,.55,0,.12,5,3)),cara2,Math.sin(th)*.92,.04+Math.cos(th)*.74,-.95);ssrDir(o,Math.sin(th)*.6,Math.cos(th)*.55,-1)}
  [-1,1].forEach(s=>{
    svM(R,H,svG('s2_br'+s,()=>svLoftZ([[.28,.28,.14,s*.48,.42],[.62,.26,.13,s*.46,.4],[.95,.18,.09,s*.38,.28]],6)),cara2);
    svM(R,H,svG('s2_ck'+s,()=>svLoftZ([[-.5,.22,.42,s*.86,-.06],[.3,.21,.37,s*.84,-.1],[.75,.12,.24,s*.66,-.16]],6)),cara2);
    for(let i=0;i<4;i++){const o=svM(R,H,svG('s2_bsp',()=>svHorn(.06,.3,0,.08,4,2)),horn,s*(1.02-i*.04),.22-i*.03,-.4+i*.3);ssrDir(o,s,.45,-.3)}
    // great horns: swept back, iron-banded, a rag tied on
    const gp=[s*.66,.56,-.36],gd=[s*.55,.38,-1];svM(R,H,lump(.26,3),cara,gp[0],gp[1],gp[2]);ssrDir(svM(R,H,svG('s2_gh',()=>svHorn(.25,2.2,0,.75,6,7)),horn,gp[0],gp[1],gp[2]),gd[0],gd[1],gd[2]);
    const gn=new THREE.Vector3(gd[0],gd[1],gd[2]).normalize();[.45,.8].forEach((d,j)=>ssrDir(svM(R,H,svG('s2_band'+j,()=>new THREE.TorusGeometry(.2-j*.04,.045,4,9)),iron,gp[0]+gn.x*d,gp[1]+gn.y*d+j*.04,gp[2]+gn.z*d),gn.x,gn.y,gn.z));
    const rag=svM(R,H,svG('s2_rag',()=>svBlade([[-.12,0],[.12,0],[.14,-.55],[.06,-.46],[.02,-.7],[-.05,-.55],[-.13,-.62]],.02)),cloth,gp[0]+gn.x*.62,gp[1]+gn.y*.62-.06,gp[2]+gn.z*.62,.15,Math.PI/2,s*.25);
    // rune scar along the cheek
    svM(R,H,svG('s2_cv'+s,()=>svTube([[s*1.07,-.04,-.42],[s*1.05,-.08,.05],[s*.86,-.14,.5]],.03,4)),seam);
  });
  for(let k=0;k<5;k++){const x=(k-2)*.3,o=svM(R,H,svG('s2_cr'+(k%2),()=>svHorn(.13,.8+.3*(k%2),0,.28,5,4)),horn,x,.98-.05*Math.abs(k-2),-.62);ssrDir(o,x*.35,.6,-1)}
  [[.36,.34,.92,.11],[.56,.26,.74,.1],[.22,.5,.8,.08],[.64,.1,.52,.09]].forEach(([x,y,z,r])=>[-1,1].forEach(s=>svM(R,H,svG('s2_ey'+r,()=>new THREE.SphereGeometry(r,6,5)),eye,s*x,y,z)));
  [[0,1.06,-.5],[0,1.06,.12],[0,.74,.72]].forEach(p=>svM(R,H,svG('s2_ru',()=>new THREE.OctahedronGeometry(1,0)),seam,p[0],p[1],p[2],0,0,0,.11,.035,.2));
  svM(R,H,svG('s2_mw',()=>new THREE.SphereGeometry(.26,7,5)),maw,0,-.2,1.3,0,0,0,1,.62,.5);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,o=svM(R,H,svG('s2_tt',()=>svHorn(.045,.22,0,0,4,2)),horn,Math.cos(a)*.3,-.2+Math.sin(a)*.18,1.3);ssrDir(o,-Math.cos(a)*.6,-Math.sin(a)*.6,.7)}
  svSpr(R,H,SSR.col,.9,0,.4,.95);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';
    // mandibles: a jointed cap, a serrated curved blade, an armour plate at the base
    J('md'+L,H,s*.46,-.24,1.0,0,s*.25,0);svM(R,'md'+L,lump(.27,5),cara,0,0,0);
    svM(R,'md'+L,svG('s2_md'+s,()=>svTube([[0,0,0],[s*.22,-.04,.45],[s*.22,-.08,.95],[-s*.08,-.1,1.38],[-s*.5,-.08,1.62]],[.21,.19,.15,.1,.04],6)),horn);
    svM(R,'md'+L,svG('s2_mdp'+s,()=>svLoftZ([[-.05,.25,.2,s*.08,.05],[.6,.2,.16,s*.16,.02]],6)),cara2);
    [[.2,-.06,.62],[.14,-.08,.92],[.0,-.09,1.16],[-.2,-.09,1.38]].forEach(([x,y,z])=>ssrDir(svM(R,'md'+L,svG('s2_mdt',()=>svHorn(.05,.24,0,0,4,2)),iron,s*x,y,z),-s,0,.35));
    // palps
    J('p'+L,H,s*.3,-.42,1.12,.4,s*.3,0);svM(R,'p'+L,lump(.09,7),leg,0,0,0);svM(R,'p'+L,svG('s2_pp',()=>svTube([[0,0,0],[0,-.05,.28],[0,-.04,.45]],[.07,.06,.05],5)),leg);
    J('p2'+L,'p'+L,0,-.04,.45,.5,0,0);svM(R,'p2'+L,lump(.06,8),leg,0,0,0);svM(R,'p2'+L,svG('s2_pp2',()=>svHorn(.05,.36,0,-.1,4,3)),horn);
    // antennae: two jointed lengths
    J('an'+L,H,s*.4,.66,.75,-.6,s*.45,0);svM(R,'an'+L,lump(.1,9),leg,0,0,0);svM(R,'an'+L,svG('s2_an',()=>svTube([[0,0,0],[0,.05,.6],[0,.02,1.2]],[.065,.055,.045],5)),leg);
    J('an2'+L,'an'+L,0,.02,1.2,.35,0,0);svM(R,'an2'+L,lump(.06,4),leg,0,0,0);svM(R,'an2'+L,svG('s2_an2',()=>svHorn(.045,1.4,0,-.35,4,5)),leg)});
  // ---- the body: fourteen segments (placed along the chain every frame), each with a pair of legs ----
  for(let k=0;k<SSR.N;k++){const n='s'+k,sc=SSR.sc[k];J(n,'root',0,SSR.y[k],-(SSR.off[k]+1)).rotation.order='YXZ';
    const g=new THREE.Group();g.scale.setScalar(sc);R.J[n].add(g);const P=k%2?cara:cara2,Q=k%2?cara2:cara;
    svM(R,g,svG('s2_tg',()=>svLoftZ([[.62,.8,.5,0,.12],[.25,.98,.62,0,.18],[-.25,1.04,.66,0,.18],[-.6,1.08,.68,0,.16],[-.68,1.0,.6,0,.14]],10)),P);
    svM(R,g,svG('s2_rim',()=>svLoftZ([[-.46,1.1,.71,0,.17],[-.74,1.13,.73,0,.15]],10)),Q);
    svM(R,g,svG('s2_kl',()=>svLoftZ([[.52,.22,.14,0,.76],[0,.27,.17,0,.84],[-.62,.24,.15,0,.82]],6)),Q);
    svM(R,g,svG('s2_st',()=>svLoftZ([[.55,.68,.28,0,-.3],[-.55,.72,.3,0,-.3]],8)),bel);
    svM(R,g,svG('s2_slv',()=>svLoftZ([[1.02,.62,.4,0,.1],[.3,.78,.5,0,.12]],10)),leg);
    svM(R,g,svG('s2_ru',()=>new THREE.OctahedronGeometry(1,0)),seam,0,1.0,-.05,0,0,0,.1,.04,.2);
    for(let i=0;i<5;i++){const th=(i-2)*.5;svM(R,g,lump(.065,11),horn,Math.sin(th)*1.12,.16+Math.cos(th)*.73,-.6)}
    [-1,1].forEach(s=>{
      svM(R,g,svG('s2_pl'+s,()=>svLoftZ([[.42,.16,.34,s*.92,-.08],[-.45,.18,.4,s*.98,-.1]],6)),leg);
      svM(R,g,svG('s2_vn'+s,()=>svTube([[s*.45,.75,.25],[s*.48,.79,-.2],[s*.47,.8,-.55]],.034,4)),seam);
      ssrDir(svM(R,g,svG('s2_sp'+(k%3),()=>svHorn(.12,.65+.18*(k%3),0,-.22,5,4)),horn,s*.45,.72,-.15),s*.3,1,-.6);
      ssrDir(svM(R,g,svG('s2_ss',()=>svHorn(.1,.45,0,.1,4,3)),horn,s*1.02,.24,-.35),s,.2,-.45)});
    // trophies
    if(k===2||k===6||k===10){const s=k===6?-1:1;svM(R,g,lump(.19,k),horn,s*.57,1.12,-.39);svM(R,g,lump(.12,k+1),horn,s*.57,.98,-.27,0,0,0,1.1,.5,1);
      [-1,1].forEach(q=>svM(R,g,svG('s2_sock',()=>new THREE.SphereGeometry(.05,4,3)),leg,s*.57+q*.07,1.14,-.22))}
    if(k===1||k===4||k===7||k===11){svM(R,g,svG('s2_ring',()=>new THREE.TorusGeometry(.22,.045,4,10)),iron,1.12,-.05,.1,0,Math.PI/2,0);
      for(let i=0;i<3;i++)svM(R,g,svG('s2_lnk',()=>new THREE.TorusGeometry(.09,.03,4,6)),iron,1.13,-.3-i*.15,.1,0,i%2?0:Math.PI/2,0,1,1.5,1)}
    if(k===3||k===8){const s=k===3?-1:1;svM(R,g,svG('s2_cl',()=>svBlade([[-.2,0],[.2,0],[.22,-.75],[.1,-.62],[.05,-.9],[-.06,-.72],[-.17,-.85],[-.21,-.5]],.02)),cloth,s*1.02,.62,-.05,0,Math.PI/2,s*.32)}
    if(k===SSR.N-1){[-1,1].forEach(s=>svM(R,g,svG('s2_cc'+s,()=>svTube([[s*.3,.1,-.4],[s*.62,.16,-1.2],[s*.62,.26,-2.0],[s*.3,.38,-2.65]],[.15,.12,.07,.02],5)),horn));
      ssrDir(svM(R,g,svG('s2_stg',()=>svHorn(.22,1.6,0,.6,6,5)),horn,0,.35,-.55),0,.3,-1);svM(R,g,lump(.3,13),cara2,0,.2,-.7)}
    // legs: coxa cap, femur, knee cap / tibia, spur, claw
    const ls=.6+.4*sc;
    [-1,1].forEach(s=>{const L=s>0?'L':'R',lj=J('lg'+k+L,n,s*.84*sc,-.12*sc,.05*sc,0,0,s*1.2);lj.scale.setScalar(ls);
      svM(R,lj,lump(.2,2),leg,0,0,0);svM(R,lj,svG('s2_fm',()=>svLoft([[.05,.14,.16],[-.4,.12,.13],[-.72,.1,.11]],6)),leg);svM(R,lj,lump(.13,6),leg,0,-.72,0);
      const lk=J('lk'+k+L,lj,0,-.72,0,0,0,-s*.7);svM(R,lk,svG('s2_tb',()=>svHorn(.1,.66,0,0,5,3)),leg,0,0,0,Math.PI/2,0,0);
      svM(R,lk,svG('s2_cw',()=>svHorn(.055,.26,0,.05,4,2)),horn,0,-.62,0,Math.PI/2,0,0);ssrDir(svM(R,lk,svG('s2_spr',()=>svHorn(.035,.2,0,0,4,2)),horn,0,-.3,-.06),0,-.5,-1)})}
}
// the trail the head has taken (world space)
function ssrTrail(e,S,reset){const m=e.m,p=m.position;if(!S.tr||reset){S.tr=[];const a=m.rotation.y;for(let i=0;i<=SSR.N*4+8;i++)S.tr.push([p.x-Math.sin(a)*i*.3,p.z-Math.cos(a)*i*.3]);return}
  const q=S.tr[0],dq=Math.hypot(p.x-q[0],p.z-q[1]);if(dq>4.5)return ssrTrail(e,S,true);if(dq>.3){S.tr.unshift([p.x,p.z]);if(S.tr.length>SSR.N*4+12)S.tr.pop()}}
function ssrLoco(e,S,O,dt,now){const t=now/1000,a=Math.min(1,S.spd/2.5);S.gp=(S.gp||0)+dt*(3+S.spd*2.2);
  O.head[4]+=.08*Math.sin(t*1.3);O.head[1]+=.12*Math.sin(t*.7);O.head[0]+=.05*Math.sin(t*1.1);O.mdL[1]+=.08*Math.sin(t*2.2);O.mdR[1]-=.08*Math.sin(t*2.2);
  O.anL[0]+=.15*Math.sin(t*1.9);O.anR[0]+=.15*Math.sin(t*1.9+1);O.an2L[0]+=.2*Math.sin(t*1.9-.8);O.an2R[0]+=.2*Math.sin(t*1.9+.2);
  O.pL[0]+=.22*Math.sin(t*3.1);O.pR[0]+=.22*Math.sin(t*3.1+1.4);O.p2L[0]+=.3*Math.sin(t*3.1-.9);O.p2R[0]+=.3*Math.sin(t*3.1+.5);
  for(let k=0;k<SSR.N;k++)['L','R'].forEach((s,j)=>{const ph=S.gp-k*.75+j*Math.PI,sw=Math.sin(ph)*(.1+.45*a),lf=Math.max(0,Math.cos(ph))*(.06+.32*a),sg=j?-1:1;
    O['lg'+k+s][1]+=sw;O['lg'+k+s][2]+=sg*lf;O['lk'+k+s][2]-=sg*lf*.6})}
function ssrSS(q){q=Math.max(0,Math.min(1,q));return q*q*(3-2*q)}
// lay the body out: every segment wants its spot on the trail (raised by rearing / the arch control, sunk by burrowing),
// then is pulled to a fixed distance from the one in front of it (the first from the back of the head)
function ssrPost(e,S,dt,now){const R=S.R,m=e.m;ssrTrail(e,S);const tr=S.tr,h=R.J.head,ca=Math.cos(m.rotation.y),sa=Math.sin(m.rotation.y),N=SSR.N,DP=SSR.D;
  const bur=!!(S.mv&&S.mv.D.bur);
  // under the sand with no burrow running (a stagger / awakening cut the chain, or a partner never got the follow-up): surface
  if(S.gone&&!bur&&!S.dieM){S.gI=(S.gI||0)+dt;if(S.mv||S.gI>.6)ssrGone(e,false)}else S.gI=0;
  if(S.hdOnly&&!bur){S.hdOnly=0;S.emT=0}
  if(!S.gone&&S.emT!=null){S.emT+=dt;if(S.emT>3)S.emT=null}
  if(S.skT!=null)S.skT+=dt;
  h.updateMatrix();const nk=(SSR.v0||(SSR.v0=new THREE.Vector3())).set(0,-.02,-.62).applyMatrix4(h.matrix);
  const ctl=S.O.ctl||[0,0,0],arch=ctl[0],wav=ctl[1];
  // rearing uses up body length: the lying part slides forward under the raised head (no straight lifted plank)
  const slack=Math.max(0,nk.y-1.2)*1.05,pts=[[m.position.x,m.position.z]].concat(tr),w0=Math.max(.1,-nk.z)+SSR.NK-slack,want=SSR.off.map((o,k)=>Math.max(.35+k*.3,w0+o));
  const P=[];let acc=0,seg=0;for(let i=1;i<pts.length&&seg<N;i++){const a=pts[i-1],b=pts[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);while(seg<N&&acc+l>=want[seg]){const u=l>1e-6?(want[seg]-acc)/l:0;P.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]);seg++}acc+=l}
  while(P.length<N){const L=P.length?P[P.length-1]:[m.position.x,m.position.z];P.push([L[0]-sa*SSR.L,L[1]-ca*SSR.L])}
  const y0=GH(m.position.x,m.position.z),rear=Math.max(0,nk.y-1.1);let px=nk.x,py=nk.y,pz=nk.z;
  for(let k=0;k<N;k++){const J=R.J['s'+k],w=P[k],dx=w[0]-m.position.x,dz=w[1]-m.position.z,gk=GH(w[0],w[1])-y0,f=Math.max(0,1-(k+1)/6),u=Math.min(1,Math.max(0,(k-1)/9));
    const lx=dx*ca-dz*sa+wav*Math.sin(k*.85-now/140)*Math.min(1,k/2),lz=dx*sa+dz*ca;
    let dep=S.hdOnly?DP:0;if(S.emT!=null)dep=Math.max(dep,DP*ssrSS((k+1-S.emT*14)/2.5));if(S.skT!=null)dep=Math.max(dep,DP*ssrSS((S.skT*15-k)/2.5));
    const ty=SSR.y[k]+.06*Math.sin(now/300-k*.6)+rear*.45*Math.pow(f,1.5)+arch*Math.sin(Math.PI*u)+gk-dep;
    const ddx=lx-px,ddy=ty-py,ddz=lz-pz,dl=Math.hypot(ddx,ddy,ddz)||1e-3,sp=SSR.sp[k];
    let nx=px+ddx/dl*sp,nz=pz+ddz/dl*sp,ny=py+ddy/dl*sp;const fl=gk+.45*SSR.sc[k];
    if(dep<.05&&ny<fl){ny=Math.min(fl,py+sp*.98);const hz=Math.sqrt(Math.max(0,sp*sp-(ny-py)*(ny-py))),hl=Math.hypot(ddx,ddz)||1e-3;nx=px+ddx/hl*hz;nz=pz+ddz/hl*hz}
    J.position.set(nx,ny,nz);const fx=px-nx,fy=py-ny,fz=pz-nz;J.rotation.set(-Math.atan2(fy,Math.hypot(fx,fz)),Math.atan2(fx,fz),Math.sin(now/400-k*.5)*.05);
    J.visible=ny-gk>-2.4;px=nx;py=ny;pz=nz}
  const on=S.ph>1,gl=on?.55+.45*Math.sin(now/150):0;R.seam.color.setHex(on?0xff7a20:0x7a2408);if(on)R.seam.color.multiplyScalar(.5+.5*gl);
  R.maw.color.setHex(on?0xffa040:0xff5a14);
  m.visible=!S.gone&&m.visible}
var SSRP={
  // mandible snap
  sOpen:{head:[-.25,0,0,0,.7,-.2],mdL:[0,.75,0],mdR:[0,-.75,0],anL:[-.4,0,0],anR:[-.4,0,0],pL:[-.5,0,0],pR:[-.5,0,0]},
  sSnap:{head:[.15,0,0,0,.2,.5],mdL:[0,-.25,0],mdR:[0,.25,0],pL:[.3,0,0],pR:[.3,0,0]},
  sRec:{head:[.05,0,0,0,.1,.2],mdL:[0,.1,0],mdR:[0,-.1,0]},
  // rearing slam
  rUp:{head:[-.75,0,0,0,4.6,-.6],mdL:[0,.5,0],mdR:[0,-.5,0],anL:[-.6,0,0],anR:[-.6,0,0],an2L:[-.3,0,0],an2R:[-.3,0,0],ctl:[.4,0,0]},
  rDn:{head:[.45,0,0,0,-.35,1.1],mdL:[0,.2,0],mdR:[0,-.2,0]},
  rRec:{head:[.3,0,0,0,-.25,.8],mdL:[0,.15,0],mdR:[0,-.15,0]},
  // acid spray: mid rear, head sweeps
  aUp:{head:[-.35,.75,0,0,2.2,-.2],mdL:[0,.6,0],mdR:[0,-.6,0]},
  aMid:{head:[-.2,0,0,0,2.1,0],mdL:[0,.65,0],mdR:[0,-.65,0]},
  aEnd:{head:[-.2,-.75,0,0,2.0,0],mdL:[0,.6,0],mdR:[0,-.6,0]},
  // charge
  cLow:{head:[.35,0,0,0,-.5,-.3],mdL:[0,.5,0],mdR:[0,-.5,0],anL:[.5,0,0],anR:[.5,0,0]},
  cRun:{head:[.2,0,0,0,-.3,.2],mdL:[0,.35,0],mdR:[0,-.35,0],anL:[.8,0,0],anR:[.8,0,0],an2L:[.4,0,0],an2R:[.4,0,0]},
  // burrow: dive, under, the full eruption, and the head-only pop (she is going under again)
  dive:{head:[1.2,0,0,0,-2.5,.6],anL:[.9,0,0],anR:[.9,0,0]},
  under:{head:[1.2,0,0,0,-4,0]},
  erupt:{head:[-.9,0,0,0,4.2,0],mdL:[0,.8,0],mdR:[0,-.8,0],anL:[-.8,0,0],anR:[-.8,0,0]},
  hPop:{head:[-.5,0,0,0,1.35,.15],mdL:[0,.9,0],mdR:[0,-.9,0],anL:[-.7,0,0],anR:[-.7,0,0],pL:[-.5,0,0],pR:[-.5,0,0]},
  hBite:{head:[.2,0,0,0,1.05,.55],mdL:[0,-.28,0],mdR:[0,.28,0],pL:[.3,0,0],pR:[.3,0,0]},
  hLook:{head:[-.25,.3,.08,0,1.2,.25],mdL:[0,.35,0],mdR:[0,-.35,0],anL:[.3,0,0],anR:[.1,0,0]},
  hDive:{head:[1.15,0,0,0,-4.2,.5],mdL:[0,.1,0],mdR:[0,-.1,0],anL:[.9,0,0],anR:[.9,0,0]},
  // v112 Sun Lance: rear, aim, fire (recoil)
  gUp:{head:[-.6,0,0,0,2.7,-.55],mdL:[0,.9,0],mdR:[0,-.9,0],anL:[.7,0,0],anR:[.7,0,0],an2L:[.3,0,0],an2R:[.3,0,0],pL:[-.6,0,0],pR:[-.6,0,0],ctl:[.5,0,0]},
  gAim:{head:[-.12,0,0,0,2.4,-.35],mdL:[0,1.05,0],mdR:[0,-1.05,0],anL:[.9,0,0],anR:[.9,0,0],an2L:[.4,0,0],an2R:[.4,0,0],pL:[-.8,0,0],pR:[-.8,0,0],ctl:[.7,0,0]},
  gFire:{head:[-.34,0,0,0,2.65,-.8],mdL:[0,1.15,0],mdR:[0,-1.15,0],anL:[.5,0,0],anR:[.5,0,0],ctl:[.6,0,0]},
  // v112 Sinkhole: jaws into the sand, churn side to side, rip up
  kDig:{head:[.95,0,0,0,-1.05,.95],mdL:[0,.95,0],mdR:[0,-.95,0],pL:[.5,0,0],pR:[.5,0,0],anL:[-.3,0,0],anR:[-.3,0,0],ctl:[-.1,0,0]},
  kChurn:{head:[1.05,.3,.18,0,-1.15,1.0],mdL:[0,.6,0],mdR:[0,-1.0,0],anL:[-.5,0,0],anR:[0,0,0],ctl:[0,.55,0]},
  kRip:{head:[-.75,0,0,0,2.3,-.1],mdL:[0,-.25,0],mdR:[0,.25,0],anL:[-.9,0,0],anR:[-.9,0,0],ctl:[.3,0,0]},
  // v112 Quill Volley: tuck, arch the back like a bow, fling
  qTuck:{head:[.3,0,0,0,-.35,-.45],mdL:[0,-.12,0],mdR:[0,.12,0],anL:[-.9,0,0],anR:[-.9,0,0],ctl:[.7,0,0]},
  qArch:{head:[.5,0,0,0,-.5,-.65],mdL:[0,-.15,0],mdR:[0,.15,0],anL:[-1.1,0,0],anR:[-1.1,0,0],an2L:[-.4,0,0],an2R:[-.4,0,0],ctl:[2.1,0,0]},
  qFling:{head:[-.35,0,0,0,.3,-.15],mdL:[0,.7,0],mdR:[0,-.7,0],anL:[.2,0,0],anR:[.2,0,0],ctl:[.6,0,0]},
  // roar
  roar:{head:[-.9,0,0,0,3.6,-.4],mdL:[0,.9,0],mdR:[0,-.9,0],anL:[-.9,0,0],anR:[-.9,0,0],ctl:[.3,0,0]},
  coil:{head:[.3,0,0,0,-.4,-.4],mdL:[0,.2,0],mdR:[0,-.2,0]},
  stag:{head:[.5,0,.6,0,-.6,0],mdL:[0,.8,0],mdR:[0,-.2,0],anL:[.6,0,0],anR:[.2,0,0]},
  dead:{head:[.6,0,1.2,0,-.9,0],mdL:[0,.9,0],mdR:[0,-.9,0]}};
function ssrSand(p,n,r){burst(gY(p,.3),SSR.sand,n||40,r||4,3.5,.9);svShock(p,SSR.sand,(r||4)*1.2,.5);svDecal(p,0x6a4a24,(r||4)*.7,3,.5)}
// hide under the sand (on) / come out: head = only the head and a bit of neck (she will burrow again), else the whole body
// pours out of the hole head first
function ssrGone(e,on,head,quiet){const S=e.sv;S.gone=!!on;S.ghost=!!on;e.m.visible=!on;
  if(on){S.hdOnly=0;S.emT=null;S.skT=null;if(!quiet)ssrSand(e.m.position,50,3)}
  else{S.hdOnly=head?1:0;S.emT=head?null:0;S.skT=null;ssrTrail(e,S,true)}}
// the ripple that hunts the hero for T seconds
function ssrHunt(c,T,sp){const e=c.e,S=c.S,m=e.m,id=S.ripId=(S.ripId||0)+1;S.rip=1;let t=0;
  kqFx({tick(dt){t+=dt||0;if(S.ripId!==id||!S.rip||e.dead)return false;const d=V().subVectors(pl.position,m.position).setY(0),l=d.length();if(l>.4)walkM(m,d.x/l*Math.min(l,sp*dt),d.z/l*Math.min(l,sp*dt));
    if(Math.random()<.9)burst(gY(m.position,.15),SSR.sand,3,1.6,1.4,.6);if(Math.random()<dt*6)svSnd('step',.35,.6);return t<T}})}
// one burrow: (dive from the surface, or start already under) → hunt T → warning W → burst out (head only, then back
// under — or the whole body). o: {from:'under', head, T, W, r, dm, sp, nx, wt, ph, rg, cd, go}
function ssrBur(o){const sf=o.from!=='under',h0=sf?1.5:.05,tw=h0+o.T,tb=tw+o.W,hd=!!o.head;
  const trk=sf?[[.45,'cLow','io'],[.8,'dive','i'],[1.4,'under','l']]:[[.05,'under','l']];trk.push([tb-.02,'under','l']);
  if(hd)trk.push([tb+.2,'hPop','o'],[tb+.38,'hBite','s'],[tb+.7,'hLook','io'],[tb+.95,'hLook','l'],[tb+1.25,'hDive','i']);
  else trk.push([tb+.28,'erupt','o'],[tb+.8,'erupt','l'],[tb+1.3,'sRec','io']);
  const ev=[];
  if(sf)ev.push([.15,c=>svSnd('hiss',.6,.5)],[.5,c=>{c.S.skT=0;ssrSand(c.wp('head',0,0,1),40,2.6);svSnd('heavy',.8,.6)}],[1.45,c=>ssrGone(c.e,true)]);
  ev.push([h0,c=>ssrHunt(c,o.T,o.sp||9)],
    [tw,c=>{c.S.rip=0;const an={x:c.m.position.x,z:c.m.position.z,a:0};c.M.an.bu=an;c.M.warn.push(svWarn({k:'c',r:o.r},an,o.W));svSnd('hum',.6,.5)}],
    [tb,c=>{const e=c.e,an=c.M.an.bu;e.m.position.set(an.x,0,an.z);e.m.rotation.y=svYawTo(e.m,pl.position);ssrGone(e,false,hd);
      ssrSand(e.m.position,hd?60:100,hd?3.2:4.6);shake(hd?.3:.45);svSnd('heavy',hd?.9:1.15);svSnd(hd?'hiss':'roar',.8,hd?1.4:1.25);
      svHitNow(e,{k:'c',r:o.r},an,o.dm,{kb:hd?3:4.5,col:SSR.sand})}]);
  if(hd)ev.push([tb+.4,c=>svSnd('crack',.8,1)],[tb+1.0,c=>{ssrSand(c.m.position,30,2.4);svSnd('hiss',.5,.6)}],[tb+1.26,c=>ssrGone(c.e,true,0,1)]);
  return {bur:1,head:hd,wt:o.wt||0,ph:o.ph,r:o.rg,a:'any',cd:o.cd||0,dur:tb+(hd?1.3:1.35),armor:1,inv:[sf?.5:0,tb-.05],trk,rm:sf?[[.5,1.4,3,'io']]:null,
    trn:(sf?[[0,.5,2.5]]:[]).concat([[tb,tb+(hd?.6:.4),2.5]]),ev,nx:o.nx,rec:hd?0:.6,go:o.go,
    end(c,silent){c.S.rip=0;c.S.skT=null;if(c.S.gone&&(silent||!hd))ssrGone(c.e,false)}}}
function ssrGlob(c,q,T){const e=c.e,S2={k:'c',r:2},an={x:q.x,z:q.z,a:0},o=svWP(e,'head',0,.2,1.3);c.M.warn.push(svWarn(S2,an,T));
  svShot(o,new THREE.Vector3(q.x,GH(q.x,q.z)+.2,q.z),T,SSR.col,1.4,5,P=>{if(e.dead||!AF)return;burst(P,SSR.col,26,2.6,2.5,.6);svDecal(P,0x2a0800,1.8,3.5,.6);svSnd('squelch',.6,.8);svHitNow(e,S2,an,.85,{col:SSR.col})})}
function ssrSpray(c,a0){const e=c.e,o=svWP(e,'head',0,0,1.2),S2={k:'a',r:9,h:.38},an={x:e.m.position.x,z:e.m.position.z,a:e.m.rotation.y+a0};
  for(let k=0;k<22;k++){const d=1.5+Math.random()*7.5,a=an.a+(Math.random()-.5)*.7;burst(new THREE.Vector3(an.x+Math.sin(a)*d,GH(an.x,an.z)+.3+Math.random()*1.5,an.z+Math.cos(a)*d),SSR.acid,2,1,1.2,.6)}
  burst(o,SSR.acid,16,3,1,.5);svSnd('hiss',.8,1.1);svHitNow(e,S2,an,.9,{col:SSR.acid,on:()=>dqDebuff('Acid','🟡',{pdP:-.15},3000,'Armour melting')});
  for(let d=3;d<9;d+=2.5)svDecal(new THREE.Vector3(an.x+Math.sin(an.a)*d,0,an.z+Math.cos(an.a)*d),0x3a5a08,1.2,2.5,.4)}
// ---- v112 effects ----
// Sun Lance: a white-gold beam from the maw down the line, then molten-glass spikes running out along it
function ssrBeam(c,an,L){const e=c.e,o=svWP(e,'head',0,-.2,1.45),end=new THREE.Vector3(an.x+Math.sin(an.a)*L,0,an.z+Math.cos(an.a)*L);end.y=GH(end.x,end.z)+.3;
  const len=end.distanceTo(o),g=svG('ss_bm',()=>{const q=new THREE.CylinderGeometry(1,1,1,8,1,true);q.translate(0,.5,0);q.rotateX(Math.PI/2);return q});
  const mk=(r,col,op)=>{const mt=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
    const b=new THREE.Mesh(g,mt);b.position.copy(o);b.lookAt(end);b.scale.set(r,r,len);b.renderOrder=24;b.frustumCulled=false;b.userData.lpsSkip=1;scene.add(b);return b};
  const core=mk(.2,0xfff4c8,1),halo=mk(.6,0xff9a30,.55);let t=0;burst(o,0xfff0b0,20,2,1.5,.4);
  kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/.55),w=1+.25*Math.sin(t*60);core.scale.x=core.scale.y=.2*(1-k)*w+.01;halo.scale.x=halo.scale.y=.6*(1-k*.7)*w;halo.material.opacity=.55*(1-k);core.material.opacity=1-k;return t<.55},
    end(){[core,halo].forEach(b=>{scene.remove(b);b.material.dispose()})}});
  const ds=[];for(let d=1.4;d<L;d+=1.45)ds.push(d);let tt=0,i=0;const life=c.S.ph>1?1.9:1.5;
  kqFx({tick(dt){tt+=dt||0;while(i<ds.length&&tt>=ds[i]/38){const d=ds[i++],p=new THREE.Vector3(an.x+Math.sin(an.a)*d+(Math.random()-.5)*.9,0,an.z+Math.cos(an.a)*d+(Math.random()-.5)*.9);
      svSpike(p,ssrFxM('glass'),1+Math.random()*.9,.26+Math.random()*.15,life,.8);svDecal(p,0x3a1404,1.1,4,.55);burst(gY(p,.4),SSR.glass,6,1.2,2,.5)}return i<ds.length}})}
// Sinkhole: a spinning spiral of sand streaks over a dark pit
function ssrVortex(an,T){const g=svG('ss_vx',()=>{const pos=[],f=(a0,u)=>{const r=.3+5.3*u,th=a0+(1-u)*3.4,wd=.15+.55*u;return [Math.sin(th)*r,Math.cos(th)*r,Math.sin(th)*(r+wd),Math.cos(th)*(r+wd)]};
    for(let a=0;a<4;a++){const a0=a*Math.PI/2;for(let i=0;i<24;i++){const A=f(a0,i/24),B=f(a0,(i+1)/24);pos.push(A[0],0,A[1],B[0],0,B[1],B[2],0,B[3],A[0],0,A[1],B[2],0,B[3],A[2],0,A[3])}}
    const q=new THREE.BufferGeometry();q.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));return q});
  const y=GH(an.x,an.z),mk=(col,op,add)=>{const m=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});
    const o=new THREE.Mesh(g,m);o.position.set(an.x,y+.17+(add?.02:0),an.z);o.renderOrder=19;o.userData.lpsSkip=1;o.userData.op=op;scene.add(o);return o};
  const A=mk(0x2a1808,.72,0),B=mk(0xe8c890,.3,1);B.rotation.y=Math.PI/4;const pit=svDecal(new THREE.Vector3(an.x,0,an.z),0x1a0e04,2.7,T+.4,.75);let t=0;
  kqFx({tick(dt){dt=dt||0;t+=dt;const k=t<.35?t/.35:t>T?Math.max(0,1-(t-T)/.3):1;A.rotation.y+=dt*(1.6+t*1.6);B.rotation.y+=dt*(2.4+t*2);A.material.opacity=A.userData.op*k;B.material.opacity=B.userData.op*k;
    if(t<T&&Math.random()<.8){const r=1+Math.random()*4.5,a=Math.random()*6.28;burst(new THREE.Vector3(an.x+Math.cos(a)*r,y+.25,an.z+Math.sin(a)*r),SSR.sand,1,.3,.5,.5)}return t<T+.3},
    end(){[A,B].forEach(o=>{scene.remove(o);o.material.dispose()})}})}
function ssrCollapse(an){const p=new THREE.Vector3(an.x,0,an.z);ssrSand(p,110,3.4);svShock(p,0x8a5a28,5,.6,.4);shake(.45);svSnd('heavy',1.2,.7);svSnd('roar',.6,1.4);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2+.3;svSpike(new THREE.Vector3(an.x+Math.cos(a)*2.1,0,an.z+Math.sin(a)*2.1),ssrFxM('rock'),1.3+(i%3)*.3,.42,1.6,.9)}}
// Quill Volley: one bone quill arcing from a back segment onto a red circle; it sticks in the sand as a bone spike
function ssrQuill(c,from,q,T,i){const e=c.e,S2={k:'c',r:1.5},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,T));
  const mesh=new THREE.Mesh(svG('ss_ql',()=>{const g=svHorn(.1,1.2,0,0,5,3);g.translate(0,0,-.6);return g}),ssrFxM('bone'));mesh.castShadow=true;mesh.userData.lpsSkip=1;
  svShot(from,new THREE.Vector3(q.x,GH(q.x,q.z)+.3,q.z),T,SSR.bone,.5,3.5+(i%3),P=>{if(e.dead||!AF)return;svSpike(new THREE.Vector3(q.x,0,q.z),ssrFxM('bone'),1.1,.12,2.2,.5);svDecal(P,0x4a1a0a,1.2,3,.45);
    burst(P,0xe8d4a8,10,1.6,1.6,.45);svSnd('crack',.45,1.1+(i%4)*.12);svHitNow(e,S2,an,.75,{col:SSR.bone})},mesh)}
var SSRM={
  intro:{dur:2.8,trk:[[.5,'coil','io'],[1.1,'coil','l',.02],[1.7,'roar','o'],[2.4,'roar','l',.025],[2.8,'sRec','io']],trn:[[0,2.8,1]],
    ev:[[.3,c=>svSnd('hiss',.8,.5)],[1.6,c=>{svSnd('roar',1.1,.8);shake(.4);ssrSand(c.m.position,80,5)}]]},
  snap:{wt:10,r:[0,6.5],a:'f',mel:1,cd:2.5,dur:1.3,lock:.5,trk:[[.5,'sOpen','io'],[.66,'sOpen','l',.02],[.82,'sSnap','s'],[1.3,'sRec','io']],rm:[[.66,.82,2.2,'o']],
    hit:[{t:.8,s:{k:'a',r:5.6,h:.75},f:.6,dm:1.15,track:1,show:false}],ev:[[.25,c=>svSnd('hiss',.7,1.2)],[.8,c=>{svSnd('crack',.9,.8);shake(.12)}]],nx:[['snap2',.0]],rec:.25},
  snap2:{ph:2,dur:1.0,mel:1,lock:.25,trk:[[.25,'sOpen','io'],[.38,'sOpen','l',.02],[.52,'sSnap','s'],[1.0,'sRec','io']],rm:[[.38,.52,2,'o']],
    hit:[{t:.5,s:{k:'a',r:5.6,h:.75},f:.6,dm:1.1,track:1,show:false}],ev:[[.5,c=>{svSnd('crack',.9,.9);shake(.12)}]],rec:.3},
  slam:{wt:9,r:[3,11],a:'f',cd:6,dur:2.35,lock:1.0,armor:1,trk:[[.75,'rUp','io'],[1.1,'rUp','l',.03],[1.28,'rDn','i'],[1.85,'rRec','l'],[2.35,'sRec','io']],
    hit:[{t:1.26,s:{k:'l',w:3.4,l:9.5,b:0},f:.5,dm:1.55,w:.5,fx:(c,an)=>{for(let d=2;d<9;d+=2.2)ssrSand(new THREE.Vector3(an.x+Math.sin(an.a)*d,0,an.z+Math.cos(an.a)*d),16,2);shake(.45);svSnd('heavy',1.1)}}],
    ev:[[.3,c=>svSnd('hiss',.8,.7)],[1.05,c=>svSnd('whoosh',1,.5)]],rec:.4},
  spray:{wt:7,r:[0,10],a:'f',cd:7,dur:2.4,lock:.75,armor:1,trn:[[0,.75,2.5]],trk:[[.6,'aUp','io'],[.95,'aUp','l',.02],[1.25,'aMid','l'],[1.55,'aEnd','l'],[2.4,'sRec','io']],
    hit:[{t:1.0,s:{k:'a',r:9,h:.38},ay:.75,dm:0,nohit:1,w:.55,fx:c=>ssrSpray(c,.75)},{t:1.28,s:{k:'a',r:9,h:.38},dm:0,nohit:1,w:.6,fx:c=>ssrSpray(c,0)},{t:1.56,s:{k:'a',r:9,h:.38},ay:-.75,dm:0,nohit:1,w:.6,fx:c=>ssrSpray(c,-.75)}],
    ev:[[.3,c=>svSnd('squelch',.8,.6)]],rec:.4},
  charge:{wt:8,r:[8,30],a:'f',cd:6,dur:2.4,lock:.9,armor:1,trn:[[0,.9,3]],trk:[[.6,'cLow','io'],[.9,'cLow','l',.02],[1.05,'cRun','o'],[1.75,'cRun','l'],[2.4,'sRec','io']],
    rm:[[.95,1.75,17,'l']],hit:[{t:1.2,s:{k:'l',w:3.4,l:18,b:0},f:0,dm:1.4,w:1.0,kb:4,show:true}],
    ev:[[.4,c=>{svSnd('hiss',.7,.6);burst(gY(c.m.position,.3),SSR.sand,20,2,1,.6)}],[.95,c=>{svSnd('roar',.8,1.2);shake(.2)}]],
    tk(c,dt){if(c.M.t>.95&&c.M.t<1.75){burst(gY(c.m.position,.2),SSR.sand,4,2,1.5,.6);if(Math.random()<dt*8)svSnd('step',.5,.7);}},rec:.5},
  // burrow: when she dives she decides (from the seed) whether she will burrow again; if so this surfacing is head-only
  burrow:ssrBur({T:1.7,W:.8,r:3.8,dm:1.5,wt:7,rg:[6,40],cd:10,go(c){const more=c.rnd()<(c.S.ph>1?.55:.4);c.M.more=more?1:0;if(more){c.M.D=SSRM.burrowH;c.S.trk=SSRM.burrowH.trk}}}),
  burrowH:ssrBur({head:1,T:1.7,W:.8,r:3.2,dm:1.3,nx:[['burrowC',1]]}),
  // the chain continues from under the sand: B pops the head again, C (always the last) brings the whole body out
  burrowB:ssrBur({from:'under',head:1,T:.95,W:.6,r:3.4,dm:1.2,sp:10,nx:[['burrowC',1]]}),
  burrowC:ssrBur({from:'under',T:1.0,W:.65,r:4.2,dm:1.4,sp:10}),
  // ---- v112: three new attacks ----
  glare:{wt:7,r:[6,22],a:'f',cd:9,dur:3.0,lock:1.0,armor:1,trn:[[0,1.0,2.6]],
    trk:[[.55,'gUp','io'],[1.0,'gAim','io'],[1.55,'gAim','l',.022],[1.68,'gFire','s'],[2.25,'gFire','l',.012],[3.0,'sRec','io']],
    hit:[{t:1.68,s:{k:'l',w:2.4,l:17,b:0},f:0,dm:1.45,w:.68,col:SSR.glass,fx:(c,an)=>{ssrBeam(c,an,17);shake(.3);svSnd('crack',1,.6);svSnd('whoosh',1,1.4)}}],
    ev:[[.15,c=>svSnd('hiss',.7,.9)],[.55,c=>{svCharge(c.e,'head',0xffd070,2.8,1.15,0,-.2,1.5);svSnd('charge',1,.7)}],[1.05,c=>svSnd('hum',.8,1.3)],
      [1.72,c=>{const an=c.M.an.h0;if(c.S.ph>1&&an)c.M.warn.push(svWarn({k:'l',w:2.4,l:17,b:0},an,.6,{col:0xff8a10}))}],
      [2.32,c=>{const an=c.M.an.h0;if(c.S.ph<2||!an)return;svHitNow(c.e,{k:'l',w:2.4,l:17,b:0},an,1.1,{col:SSR.glass});
        for(let d=1.5;d<17;d+=1.2){const x=an.x+Math.sin(an.a)*d,z=an.z+Math.cos(an.a)*d;burst(new THREE.Vector3(x,GH(x,z)+.6,z),SSR.glass,5,2.4,3,.6)}svSnd('ice',1,.6);shake(.25)}]],rec:.4},
  sinkhole:{wt:6,r:[3,13],a:'f',cd:11,dur:3.4,lock:.7,armor:1,trn:[[0,.7,2.6]],
    trk:[[.5,'kDig','i'],[.75,'kDig','l',.02],[1.05,'kChurn','io'],[1.35,'kChurn~','io'],[1.65,'kChurn','io'],[1.95,'kChurn~','io'],[2.25,'kDig','io'],[2.45,'kRip','o'],[2.9,'kRip','l'],[3.4,'sRec','io']],
    hit:[{t:2.45,s:{k:'c',r:2.6},o:c=>c.M.an.vx||c.at(6),dm:1.5,w:1.55,kb:2,col:SSR.sand,fx:(c,an)=>ssrCollapse(an)}],
    ev:[[.25,c=>svSnd('hiss',.7,.45)],[.72,c=>{const p=c.inA(pl.position.clone(),1.5);c.M.an.vx={x:p.x,z:p.z,a:0};ssrVortex(c.M.an.vx,1.75);ssrSand(c.wp('head',0,-.5,1.3),30,2);svSnd('heavy',.7,.55);shake(.2)}],
      [1.1,c=>svSnd('step',.7,.4)],[1.6,c=>svSnd('step',.8,.45)],[2.1,c=>svSnd('hiss',.6,.35)]],
    tk(c,dt){const an=c.M.an.vx;if(c.M.t<1.05&&c.M.t>.75&&Math.random()<dt*20)burst(c.wp('head',0,-.6,1.3),SSR.sand,2,1,1.2,.4);
      if(!an||c.M.t<.8||c.M.t>2.4||hero.hp<=0||hero.iv>0)return;const dx=an.x-pl.position.x,dz=an.z-pl.position.z,d=Math.hypot(dx,dz);if(d>6.2||d<.35)return;
      const sp=Math.min(d-.3,(c.S.ph>1?3.0:2.4)*(1-d/6.2*.45)*dt),nx=pl.position.x+dx/d*sp,nz=pl.position.z+dz/d*sp;
      if(typeof plBlocked!='function'||!plBlocked(nx,nz)){pl.position.x=nx;pl.position.z=nz}},rec:.4},
  quills:{wt:(e,L,side)=>side==='f'?3:9,r:[0,13],a:'any',cd:10,dur:2.9,lock:1.0,armor:1,trn:[[0,.6,1.5]],
    trk:[[.45,'qTuck','io'],[1.0,'qArch','io'],[1.3,'qArch','l',.025],[1.4,'qFling','s'],[1.85,'qFling','l'],[2.9,'sRec','io']],
    ev:[[.2,c=>svSnd('crack',.5,1.7)],[.6,c=>svSnd('hiss',.6,1.6)],[1.05,c=>svSnd('crack',.6,1.4)],
      [1.4,c=>{const n=c.S.ph>1?11:8,hp=pl.position.clone();for(let i=0;i<n;i++){const a=c.rnd()*Math.PI*2,r=i===0?0:1.8+c.rnd()*4.6,q=c.inA(new THREE.Vector3(hp.x+Math.cos(a)*r,0,hp.z+Math.sin(a)*r),1);
        const k=2+Math.floor(c.rnd()*9);ssrQuill(c,c.wp('s'+k,0,1.1,0),q,.75+i*.06,i)}svSnd('whoosh',1,.8);svSnd('crack',.9,.7);shake(.2)}]],
    tk(c,dt){if(c.M.t>.5&&c.M.t<1.4&&Math.random()<dt*14){const k=2+Math.floor(Math.random()*9);burst(c.wp('s'+k,0,1,0),0xe8d4a8,2,.6,1.2,.4)}},rec:.45},
  // ---- Phase II ----
  awaken:{dur:3.3,inv:[0,3.3],armor:1,trk:[[.5,'coil','io'],[1.2,'coil','l',.03],[1.7,'roar','o'],[2.8,'roar','l',.02],[3.3,'sRec','io']],trn:[[0,3,1]],
    hit:[{t:1.75,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.2,fx:c=>{ssrSand(c.m.position,120,7);svShock(c.m.position,SSR.col,10,.8)}}],
    ev:[[.05,c=>{banner('THE ENDLESS HUNGER',"Ssith'ra burns from within",'');svSnd('hiss',.9,.4)}],[1.2,c=>{c.S.ph=2;c.e.bs.ph=2;flash('rgba(255,140,60,.35)');svSnd('roar',1.2,.75);shake(.55)}]]},
  // Triple Burrow: head, head, then the whole body (geysers → burrowB → burrowC)
  geysers:ssrBur({head:1,T:1.1,W:.6,r:3.4,dm:1.2,sp:10,wt:8,ph:2,rg:[0,40],cd:14,nx:[['burrowB',1]]}),
  spit:{wt:7,ph:2,r:[5,40],a:'any',cd:8,dur:2.6,armor:1,trn:[[0,2.6,2.5]],trk:[[.5,'aMid','io'],[.8,'aMid','l',.02],[.95,'sSnap','s'],[1.25,'aMid','io'],[1.4,'sSnap','s'],[1.7,'aMid','io'],[1.85,'sSnap','s'],[2.6,'sRec','io']],
    ev:[[.3,c=>svSnd('squelch',.8,.6)]].concat([[.95,0],[1.4,1],[1.85,2]].map(([t,i])=>[t,c=>{const d=pl.mvd&&nowP()-pl.mvd.t<300?pl.mvd:{x:0,z:0};[0,1].forEach(j=>{const q=c.inA(pl.position.clone().add(new THREE.Vector3(d.x*(1.5+j*2.2),0,d.z*(1.5+j*2.2))),.8);ssrGlob(c,q,.75)})}])),rec:.45}};
SSRM.snap.nx=[['snap2',.65,8]];
svReg(3,{name:"Ssith'ra",col:SSR.col,body:1.9,ph2:.55,poise:.17,headJ:'head',turnA:3.2,edge:2.5,
  ai:{pref:5,walk:3.0,run:5,turn:2.0,rest:[.7,1.3],ph2r:.7,strafe:.55},
  build:ssrBuild,loco:ssrLoco,post:ssrPost,P:SSRP,M:SSRM,
  init(e){ssrTrail(e,e.sv,true)},
  stag:[[.3,'stag','o'],[2.0,'stag','l',.03],[2.6,'sRec','io']],stagT:2.6,
  die:[[.5,'stag','o'],[1.3,'dead','i'],[2.1,'dead','l']],
  homeY(A){const a=A.dn&&A.dn.ea!=null?A.dn.ea:0;return Math.atan2(Math.cos(a),Math.sin(a))},
  reset(e){const S=e.sv;if(S.gone)ssrGone(e,false);S.rip=0;S.ripId=(S.ripId||0)+1;S.hdOnly=0;S.emT=null;S.skT=null;ssrTrail(e,S,true)}});
// the den's warning sign (v112: the current moveset)
DSTXT[3]={den:'The Sunken Pit',zone:'Searing Sands',
  atk:[['🦂 Mandible Snap','Close in front: her mandibles spread wide with a hiss, then she lunges and snaps (twice in a row from Phase II).','Back off or dash sideways the moment the mandibles open.'],
   ['🔨 Rearing Slam','She rears high above you and trembles, then crashes her head down along a red line.','Step off the line. The long recovery after it is your opening.'],
   ['🟡 Acid Spray','She rears to mid height and sweeps acid across her front in three beats (left, centre, right). Acid melts your armour for 3 s.','Get beside or behind her, or dash through a beat that has already passed.'],
   ['💨 Sand Charge','From far away the head drops low, then she charges straight down a long red lane.','Sidestep the lane — don\'t run straight away from it.'],
   ['🕳 Burrow','She dives under the sand and a ripple hunts you; when it stops, a red circle marks where she bursts out. If only her HEAD comes out she is going under again at once; her whole body comes out only on the last eruption.','Leave the circle the moment the ripple stops. Strike when the whole body is out.'],
   ['☀ Sun Lance','She rears and her maw gathers a white-gold glare while a red line shows its path; a beam scorches the line and molten-glass spikes run along it. In Phase II the glass bursts again a moment later.','Sidestep the line before it fires — and in Phase II don\'t step back onto it.'],
   ['🌀 Sinkhole','She drives her jaws into the sand: a spiral vortex opens under you and drags you toward its centre, then the centre caves in (red circle).','Run out against the pull, or dash (it breaks the pull), before the centre collapses.'],
   ['🦴 Quill Volley','Stand beside or behind her and she arches her back like a bow, rattling, then flings bone quills onto red circles around you (more in Phase II).','Keep moving between the circles; they land a moment after she arches.'],
   ['🔥 Triple Burrow','Phase II: three eruptions in a row — twice only her head bursts out and dives again, the third time her whole body.','Keep moving; punish the third, full-body eruption.'],
   ['☄ Molten Spit','Phase II: globs of molten sand arc onto you and onto where you are heading.','Change direction while they fly.']],
  weak:['Posture: your hits fill the yellow bar under her health. When it breaks she is STAGGERED for 2.6 s and takes +35% damage. Big moves (slam, spray, charge, burrows, Sun Lance, Sinkhole, Quill Volley) finish before she reels.',
   'Openings: the long recoveries after Rearing Slam, Sand Charge, Sun Lance and a full-body eruption.',
   'Under the sand she cannot be hurt. A head-only surfacing can be struck, but she dives again at once.',
   'Phase II at 55% ("The Endless Hunger"): her seams glow like a forge and she rests less between attacks.']};
