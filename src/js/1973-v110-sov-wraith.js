// ================= v110 Sovereign 2 — The Rime Wraith (Burningeye Summit) — v112 model and moves =================
// A floating reaper of the summit. v112 model: a deep frost hood framing a fanged skull (hinged jaw, brow ridge, burning
// eyes), an iron-banded ice crown; a fur collar over a frosted mantle; an open rib cage with a frozen heart that glows; a
// spine of vertebrae with ice spurs; layered iron pauldrons (riveted, ice shards growing out of them); bone arms with
// ball joints at shoulder, elbow and wrist, twin forearm bones, riveted bracers, bell sleeves in tatters; a double robe
// (an inner bell and an outer over-robe) ringed with glowing runes, belt trophies (chained skulls, icicles) and a hem that
// frays into fourteen swaying strips; Phase II adds a halo of ice shards circling the crown.
// The scythe: a long iron-shod haft gripped in the right fist (the fingers curl round it), a skull at the socket, and a
// curved ice blade at the LOWER end: at rest the wraith carries it low in front with the blade hanging point-down toward
// the snow (v112 fix: the old model held it with the blade pointing up). Every scythe pose is written as an aim
// (haft direction + blade direction, body frame) and the wrist angles are solved once from the rig (rwrAim), so the fist
// stays on the haft and every swing travels tip-first, edge leading (checked by test/v112_wraith.py).
// Pattern (learnable):
//  close in front ── Reaping Sweep: the scythe is drawn back to its right (tremble), then a wide sweep; it almost always
//                   rolls the blade over and reverses into a second sweep — wait for the second one before you punish.
//                   Frostbrand Rend (new): it crouches and hooks the blade into the snow (tremble, frost gathers on the
//                   edge), then rips it upward: a short rising cut in front, then a crescent of frost runs straight ahead in
//                   three bursts along a red lane — sidestep the lane, never retreat down it.
//  mid           ── Overhead Cleave: the scythe is raised high and held; a line slam, then ice bursts along the same line a
//                   heartbeat later (don't step back into it).
//  far           ── Glide Reap: it drifts back, then rushes straight through you with the blade low.
//                   Icicle Volley: five icicles gather over its head and fire one by one at your feet; keep moving.
//                   Wraith Chains (new): the left claw points at you and a spectral chain shoots along a long red lane;
//                   if it binds you, you are dragged in and reaped by a downward hook. Sidestep the lane or dash through it.
//  close, any    ── Frost Nova: arms rise, frost crystals gather around it — leave the circle.
//  Phase II (55%) "The Blizzard Wakes": the crown blazes and the halo appears; adds Winter's Step (it vanishes in a snow
//                   burst and re-forms behind you with a sweep), Glacial Prison (ice bursts under you, then a ring around
//                   that spot: step out, then back in), a reaping spin after the double sweep, and
//                   Rime Maelstrom (new): it rises in a funnel of snow and whirls the scythe overhead in two full turns
//                   (a red ring 2.6–6.2 around it twice: hug its robe or stay outside the ring; the snow drags you in a
//                   little), then crashes down (a red circle of 4 at its feet: get out).
// Every move has a cooldown (cd) so the wraith does not repeat itself.
var RWR={col:0x9ad8ff,ice:0xd8f4ff,deep:0x4a90d8,HB:2.15,HT:1.55,BS:.85,idle:null,G:[-.483,.739,1.739]};// G = how the haft sits in the fist (scy joint rest rotation)
// the blade outline: p = out from the haft (blade length), q = along the haft past its end (the hook); spine on -q, the
// concave cutting edge on +q
RWR.bl=[[0,-.24],[.55,-.32],[1.0,-.27],[1.12,-.42],[1.28,-.25],[1.85,.04],[2.3,.55],[2.55,1.25],[2.24,.8],[1.85,.42],[1.3,.18],[.7,.12],[.2,.16],[0,.2]];
// a point on the blade in scythe-joint space (the haft runs along local Z, the blade hangs along local -Y)
function rwrBP(p,q){const s=RWR.BS;return [0,-p*s,-RWR.HB-q*s]}
function rwrBuild(R,e){
  const robe=svMat(R,0x1a2232,{roughness:.95,emissive:0x05080f,side:THREE.DoubleSide}),robe2=svMat(R,0x2a3850,{roughness:.9,side:THREE.DoubleSide}),
    fur=svMat(R,0x96a2b4,{roughness:1,emissive:0x080c12}),bone=svMat(R,0xd8dce4,{roughness:.55,emissive:0x101418}),
    ice=svMat(R,0xa8dcff,{roughness:.15,metalness:.1,emissive:0x3a88c0,transparent:true,opacity:.97}),ice2=svMat(R,0x8ac8f0,{roughness:.2,emissive:0x1a4a7a}),
    iron=svMat(R,0x3a404c,{roughness:.45,metalness:.65,emissive:0x05070a}),wood=svMat(R,0x2a2430,{roughness:.6,metalness:.3}),
    eye=svGlowMat(R,0x9ae8ff),rune=svGlowMat(R,0x6ab0e0);R.crownG=rune;R.iceM=ice;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz);
  // a mesh whose rotation is yaw-then-tilt (order YXZ): aim +Z of a horn by (tilt up, yaw)
  const MY=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>{const o=svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz);o.rotation.order='YXZ';return o};
  const riv=(j,x,y,z,s)=>svM(R,j,svG('rw_rv',()=>svLump(.045,0,.2,5)),iron,x,y,z,0,0,0,s||1);
  const glyph=(j,x,y,z,ry,k)=>{svM(R,j,svG('rw_g0',()=>new THREE.BoxGeometry(.035,.24,.02).toNonIndexed()),rune,x,y,z,0,ry,0);
    svM(R,j,svG('rw_g1',()=>new THREE.BoxGeometry(.13,.03,.02).toNonIndexed()),rune,x,y+(k%2?.06:-.05),z,0,ry,k%3?.5:-.5)};
  J('root',null,0,0,0);J('body','root',0,2.5,0);J('robe','body',0,0,0);J('chest','body',0,.05,0);
  // ---- robe: an inner bell and a shorter over-robe, a ring of glowing runes, belt trophies, a frayed hem ----
  svM(R,'robe',svG('rw_rb',()=>svLoft([[.18,.5,.44],[-.5,.74,.66],[-1.2,1.0,.9],[-1.92,1.24,1.1]],12,{cap:false})),robe);
  svM(R,'robe',svG('rw_rb2',()=>svLoft([[.24,.57,.51],[-.4,.84,.76],[-1.12,1.11,1.0]],9,{cap:false,rot:.35})),robe2);
  for(let k=0;k<9;k++){const a=k/9*6.283+.35+.35,l=.45+.2*((k*5)%3);svM(R,'robe',svG('rw_fl'+(k%3),()=>svBlade([[-.3,0],[.3,0],[.18,-.35-.1*(k%3)],[.02,-.6-.12*(k%3)],[-.12,-.32]],.025)),robe2,Math.sin(a)*1.08,-1.05,Math.cos(a)*.98,-.12,a,0,1,l*2,1)}
  for(let k=0;k<12;k++){const a=k/12*6.283+.26;glyph('robe',Math.sin(a)*1.14,-1.58,Math.cos(a)*1.02,a,k)}
  // belt trophies: chained skulls and icicles hanging from the belt
  [[.42,.36,1],[-.5,.28,-1],[.12,.52,1]].forEach(([x,z,s],k)=>{const y1=-.42-.12*k;svM(R,'robe',svG('rw_tc'+k,()=>svTube([[x,.08,z],[x+s*.02,(.08+y1)/2,z+.06],[x+s*.04,y1+.1,z+.1]],.022,4)),iron);
    svM(R,'robe',svG('rw_ts',()=>svLump(.11,1,.2,11)),bone,x+s*.04,y1,z+.12,0,0,0,.9,1,1);[-1,1].forEach(q=>svM(R,'robe',svG('rw_tse',()=>new THREE.SphereGeometry(.025,4,3).toNonIndexed()),eye,x+s*.04+q*.04,y1+.01,z+.22))});
  for(let k=0;k<8;k++){const a=(k-3.5)*.38;MY('robe',svG('rw_bi',()=>svHorn(.05,.32,0,0,4,2)),ice,Math.sin(a)*.6,.02,Math.cos(a)*.53,1.45,a,0,1,1,1+.3*(k%2))}
  for(let k=0;k<14;k++){const a=k/14*6.283+.2,l=.9+.45*Math.sin(k*2.3)+.3*(k%2),n='tt'+k;J(n,'robe',Math.sin(a)*1.16,-1.86,Math.cos(a)*1.03,.15*Math.cos(a),0,-.15*Math.sin(a));
    svM(R,n,svG('rw_tt'+(k%3),()=>svBlade([[-.22,.06],[.22,.06],[.12,-.6-(k%3)*.15],[.18,-1.0-(k%3)*.2],[0,-1.35-(k%3)*.25],[-.1,-.9],[-.2,-.5]],.03)),k%2?robe:robe2,0,0,0,0,a,0,1,l,1)}
  // ---- torso: a dark core, a cage of ribs round a frozen heart, a spine with ice spurs, a mantle and a fur collar ----
  svM(R,'chest',svG('rw_ch',()=>svLoft([[-.05,.47,.4],[.5,.6,.45],[1.0,.7,.5,0,-.04],[1.4,.48,.4]],10)),robe2);
  svM(R,'chest',svG('rw_bt',()=>svLoft([[-.04,.53,.47],[.2,.55,.49]],12)),iron);
  svM(R,'chest',svG('rw_bk',()=>svLump(.12,1,.15,7)),bone,0,.1,.5,0,0,0,1,.9,.8);[-1,1].forEach(s=>svM(R,'chest',svG('rw_bke',()=>new THREE.SphereGeometry(.03,4,3).toNonIndexed()),eye,s*.045,.12,.6));
  for(let k=0;k<6;k++)riv('chest',Math.sin(k*1.05+.5)*.55,.1,Math.cos(k*1.05+.5)*.49);
  for(let k=0;k<5;k++){const y=.42+k*.19,w=.66-.05*Math.abs(k-2.2);[-1,1].forEach(s=>svM(R,'chest',svG('rw_rib'+k+(s>0?'a':'b'),()=>svTube([[s*.2,y+.05,-.44],[s*w,y,-.15],[s*(w+.02),y-.06,.18],[s*.4,y-.1,.44],[s*.1,y-.08,.53]],[.04,.05,.05,.045,.035],5)),bone))}
  svM(R,'chest',svG('rw_st',()=>svLoft([[.42,.06,.04,0,.53],[1.25,.08,.05,0,.5]],5)),bone);
  svM(R,'chest',svG('rw_hr',()=>svLump(.17,0,.35,9)),ice2,-.08,.82,.4,0,0,0,1,1.25,.75);R.heart=svSpr(R,'chest',RWR.col,.8,-.08,.82,.52);
  for(let k=0;k<7;k++){svM(R,'chest',svG('rw_vt',()=>svLump(.085,0,.25,4)),bone,0,.08+k*.2,-.43-.04*Math.sin(k*.6),0,0,0,1.2,.8,1);if(k%2===0)MY('chest',svG('rw_vs',()=>svHorn(.05,.3,0,.08,4,2)),ice,0,.1+k*.2,-.47,.5,Math.PI,0)}
  svM(R,'chest',svG('rw_mt',()=>svLoft([[.92,.9,.66],[1.2,.98,.73],[1.46,.62,.5]],10,{cap:false})),robe);
  for(let k=0;k<16;k++){const a=k/16*6.283;MY('chest',svG('rw_fr'+(k%2),()=>svHorn(.12,.46+.12*(k%2),0,.18,4,2)),fur,Math.sin(a)*.56,1.36+.04*(k%2),Math.cos(a)*.46,-.75-.2*(k%2),a,0)}
  // crossed iron straps with rivets and a rune clasp
  [-1,1].forEach(s=>{svM(R,'chest',svG('rw_sp'+(s>0?'a':'b'),()=>svTube([[s*.62,1.25,.28],[s*.35,.95,.55],[0,.62,.6],[-s*.35,.3,.55],[-s*.55,.1,.4]],.04,4)),iron);[[.35,.95,.57],[-.35,.3,.57]].forEach(([x,y,z])=>riv('chest',s*x,y,z,.9))});
  svM(R,'chest',svG('rw_cl',()=>svLump(.1,0,.2,12)),iron,0,.62,.62,0,0,0,1,1,.6);glyph('chest',0,.62,.69,0,1);
  // ---- head: neck vertebrae, a deep hood with a heavy brim, a fanged skull with a hinged jaw, an iron and ice crown ----
  J('neck','chest',0,1.38,0);for(let k=0;k<3;k++)svM(R,'neck',svG('rw_nv',()=>svLump(.11,0,.2,13)),bone,0,.04+k*.12,-.04,0,0,0,1,.7,1);
  J('head','neck',0,.3,.05);
  svM(R,'head',svG('rw_hd',()=>svLoft([[-.22,.5,.5,0,-.1],[.2,.56,.58,0,-.06],[.6,.5,.52,0,-.13],[.95,.24,.28,0,-.32],[1.25,.04,.05,0,-.6]],10,{cap:false})),robe);
  svM(R,'head',svG('rw_hd2',()=>svLoft([[-.15,.44,.44,0,-.14],[.55,.44,.45,0,-.17]],9,{cap:false})),robe2);
  svM(R,'head',svG('rw_brim',()=>svTube([[-.44,-.15,.3],[-.48,.25,.4],[-.34,.6,.42],[0,.74,.44],[.34,.6,.42],[.48,.25,.4],[.44,-.15,.3]],[.06,.08,.09,.1,.09,.08,.06],5,{cap:true})),robe);
  for(let k=0;k<4;k++)svM(R,'head',svG('rw_ht'+(k%2),()=>svBlade([[-.12,0],[.12,0],[.06,-.5-.15*(k%2)],[0,-.7-.2*(k%2)],[-.07,-.4]],.025)),robe,(k-1.5)*.22,.95-.1*Math.abs(k-1.5),-.42,.4,0,0);
  svM(R,'head',svG('rw_sk',()=>svLump(.3,1,.15,8)),bone,0,.3,.2,0,0,0,.9,1,1.05);
  svM(R,'head',svG('rw_brw',()=>svTube([[-.22,.36,.38],[-.1,.4,.47],[0,.38,.49],[.1,.4,.47],[.22,.36,.38]],.05,4)),bone);
  [-1,1].forEach(s=>{svM(R,'head',svG('rw_chk',()=>svLump(.08,0,.2,14)),bone,s*.2,.17,.36,0,0,0,1.2,.8,1);
    svM(R,'head',svG('rw_ey',()=>new THREE.SphereGeometry(.065,6,5).toNonIndexed()),eye,s*.11,.3,.44);svSpr(R,'head',RWR.col,.5,s*.11,.3,.5)});
  svM(R,'head',svG('rw_ns',()=>{const g=new THREE.ConeGeometry(.05,.1,3);g.rotateX(Math.PI);return g.toNonIndexed()}),robe,0,.2,.47);
  for(let k=0;k<6;k++){const a=(k-2.5)*.26;svM(R,'head',svG('rw_tu',()=>{const g=new THREE.ConeGeometry(.026,.11,4);g.rotateX(Math.PI);return g.toNonIndexed()}),bone,Math.sin(a)*.2,.07,.2+Math.cos(a)*.24)}
  J('jaw','head',0,.1,.18);svM(R,'jaw',svG('rw_jw',()=>svTube([[-.2,.02,-.02],[-.19,-.1,.12],[0,-.15,.27],[.19,-.1,.12],[.2,.02,-.02]],[.045,.05,.06,.05,.045],5)),bone);
  for(let k=0;k<6;k++){const a=(k-2.5)*.26;svM(R,'jaw',svG('rw_tl',()=>new THREE.ConeGeometry(.024,.1,4).toNonIndexed()),bone,Math.sin(a)*.18,-.07,.02+Math.cos(a)*.21)}
  const cw=J('crown','head',0,.62,-.02);svM(R,cw,svG('rw_cwb',()=>svLoft([[-.08,.42,.42],[.06,.44,.44]],12)),iron);
  for(let k=0;k<9;k++){const a=(k-4)*.36;MY(cw,svG('rw_cw'+(k%2),()=>svHorn(.08,.6+.45*(1-Math.abs(k-4)/4),0,-.12,5,3)),ice,Math.sin(a)*.42,.02,Math.cos(a)*.4-.04,-1.25+Math.abs(a)*.18,a,0)}
  svM(R,cw,svG('rw_cwr',()=>{const q=new THREE.TorusGeometry(.43,.04,4,14);q.rotateX(Math.PI/2);return q.toNonIndexed()}),rune,0,.08,0);
  svM(R,cw,svG('rw_gem',()=>svLump(.08,0,.1,15)),ice2,0,0,.45,0,0,0,1,1.4,.6);
  // the Phase II halo: ice shards circling the crown
  const hl=J('halo','head',0,.9,-.05);for(let k=0;k<7;k++){const a=k/7*6.283;MY(hl,svG('rw_hl',()=>svHorn(.07,.55,0,0,4,2)),ice,Math.sin(a)*.78,0,Math.cos(a)*.78,-1.35,a,0)}
  svM(R,hl,svG('rw_hlr',()=>{const q=new THREE.TorusGeometry(.78,.02,3,20);q.rotateX(Math.PI/2);return q.toNonIndexed()}),rune);hl.visible=false;
  // ---- arms: ball joints, iron pauldrons, bell sleeves, twin forearm bones, bracers, clawed hands ----
  [-1,1].forEach(s=>{const L=s>0?'L':'R',sh='sh'+L,el='el'+L,hd='hd'+L;
    J(sh,'chest',s*.8,1.18,0,0,0,s*.25);
    svM(R,sh,svG('rw_sb',()=>svLump(.2,1,.12,4)),bone);
    svM(R,sh,svG('rw_pd1',()=>svLoft([[.3,.05,.05],[.2,.3,.29],[0,.4,.37],[-.16,.42,.39]],9,{cap:false})),iron,s*.04,0,0);
    svM(R,sh,svG('rw_pd2',()=>svLoft([[-.08,.45,.42],[-.32,.44,.41]],9,{cap:false})),iron,s*.04,0,0);
    svM(R,sh,svG('rw_pd3',()=>svLoft([[-.28,.44,.41],[-.5,.41,.38]],9,{cap:false})),iron,s*.04,0,0);
    for(let k=0;k<7;k++){const a=k/7*6.283;riv(sh,s*.04+Math.sin(a)*.44,-.2,Math.cos(a)*.41,.8);if(k%2)riv(sh,s*.04+Math.sin(a+.4)*.41,-.42,Math.cos(a+.4)*.38,.7)}
    [[1.2,.3,.95,.18],[.9,.1,.7,-.12],[1.5,.5,.6,.02]].forEach(([a,t,l,z],k)=>MY(sh,svG('rw_ps'+k,()=>svHorn(.1,l,0,0,5,3)),ice,s*.18,.2,z,-1.2+t,s*a,0));
    svM(R,sh,svG('rw_ua',()=>svLoft([[0,.12,.12],[-.18,.085,.085],[-.95,.075,.075],[-1.15,.11,.11]],6)),bone);
    svM(R,sh,svG('rw_sl',()=>svLoft([[-.3,.27,.26],[-.62,.37,.35],[-.92,.45,.42]],9,{cap:false})),robe2);
    for(let k=0;k<5;k++){const a=k/5*6.283+.3;svM(R,sh,svG('rw_slt'+(k%2),()=>svBlade([[-.13,.04],[.13,.04],[.05,-.42-.1*(k%2)],[-.08,-.3]],.02)),robe2,Math.sin(a)*.44,-.9,Math.cos(a)*.41,0,a,0)}
    J(el,sh,0,-1.15,0,-.3);svM(R,el,svG('rw_eb',()=>svLump(.13,1,.12,5)),bone);MY(el,svG('rw_es',()=>svHorn(.06,.38,0,.1,4,2)),ice,0,.02,-.1,-.3,Math.PI,0);
    [-1,1].forEach(q=>svM(R,el,svG('rw_fa'+q,()=>svLoft([[0,.06,.06,q*.035,0],[-1.0,.05,.05,q*.035,0]],5)),bone));
    svM(R,el,svG('rw_br',()=>svLoft([[-.46,.12,.115],[-.98,.14,.135]],8,{cap:false})),iron);svM(R,el,svG('rw_brr',()=>svLoft([[-1.0,.155,.15],[-.94,.155,.15]],8)),ice2);
    for(let k=0;k<4;k++){const a=k/4*6.283+.4;riv(el,Math.sin(a)*.13,-.6,Math.cos(a)*.125,.7)}
    [0,1,2].forEach(k=>MY(el,svG('rw_bs',()=>svHorn(.04,.26,0,0,4,2)),ice,s*.08,-.58-.15*k,-.1,-.5,Math.PI+s*.5,0));
    J(hd,el,0,-1.05,0);svM(R,hd,svG('rw_wb',()=>svLump(.1,1,.1,6)),bone);svM(R,hd,svG('rw_pm',()=>svLump(.12,0,.2,2)),bone,0,-.13,0,0,0,0,.9,1,.65);
    if(s>0){// the left claw is open (it conducts icicles and casts the chains)
      for(let k=0;k<4;k++){const x=(k-1.5)*.065,dz=.02*Math.abs(k-1.5);svM(R,hd,svG('rw_lf'+k,()=>svTube([[x,-.18,0],[x*1.15,-.36,.05-dz],[x*1.3,-.52,.13-dz]],[.035,.03,.025],4)),bone);
        MY(hd,svG('rw_lc',()=>svHorn(.03,.3,0,-.08,4,3)),ice,x*1.3,-.52,.13-dz,1.25,0,0)}
      svM(R,hd,svG('rw_lth',()=>svTube([[.0,-.1,.06],[-.08,-.22,.14],[-.08,-.36,.22]],[.035,.03,.024],4)),bone);MY(hd,svG('rw_lc',()=>svHorn(.03,.3,0,-.08,4,3)),ice,-.08,-.36,.22,1.0,0,0)}});
  // ---- the scythe (in the right fist): haft along local Z, the pommel up (+Z), the blade at the lower end (-Z), hanging along -Y ----
  const sc=J('scy','hdR',0,-.16,0,RWR.G[0],RWR.G[1],RWR.G[2]),HB=RWR.HB,HT=RWR.HT;R.blade=sc;
  // the right fist closes round the haft (the fingers hang on the scythe joint so they always wrap it)
  {const P=[[.1,.08],[.13,-.02],[.08,-.12],[-.02,-.14],[-.1,-.08],[-.11,.01]];
    [-.1,-.035,.035,.1].forEach((z,k)=>svM(R,sc,svG('rw_gf'+k,()=>svTube(P.map(([x,y])=>[-x,y,z]),[.04,.038,.034,.03,.026,.02],4)),bone));
    svM(R,sc,svG('rw_gt',()=>svTube([[.08,.06,.06],[.12,-.02,.13],[.05,-.12,.16],[-.05,-.12,.16]],[.04,.035,.03,.02],4)),bone);
    [-.1,.035].forEach(z=>riv(sc,.11,.01,z,.6))}
  svM(R,sc,svG('rw_hf',()=>svLoftZ([[-HB,.07,.07],[-1.0,.062,.062],[.6,.058,.058],[HT,.065,.065]],6)),wood);
  svM(R,sc,svG('rw_gw',()=>svLoftZ([[-.3,.08,.08],[.3,.08,.08]],6)),robe2);
  [.75,1.25,-.75,-1.5].forEach(z=>svM(R,sc,svG('rw_bd',()=>svLoftZ([[-.06,.092,.092],[.06,.092,.092]],6)),iron,0,0,z));
  [[.05,.06,-1.15,1],[-.05,-.04,.95,2],[.04,-.06,-1.8,3]].forEach(([x,y,z,k])=>svM(R,sc,svG('rw_fc'+k,()=>svLump(.07,0,.4,20+k)),ice2,x,y,z,0,0,0,1,1,1.8));
  svM(R,sc,svG('rw_pc',()=>svLoftZ([[HT-.12,.1,.1],[HT+.05,.08,.08]],6)),iron);svM(R,sc,svG('rw_pp',()=>svHorn(.08,.55,0,0,5,3)),ice,0,0,HT+.02);
  svM(R,sc,svG('rw_sko',()=>svLoftZ([[-HB+.34,.085,.085],[-HB+.14,.13,.13],[-HB-.14,.13,.13],[-HB-.24,.08,.08]],7)),iron);
  [0,1,2,3].forEach(k=>riv(sc,Math.sin(k*1.57+.78)*.13,Math.cos(k*1.57+.78)*.13,-HB,.7));
  svM(R,sc,svG('rw_ssk',()=>svLump(.13,1,.15,16)),bone,0,.17,-HB+.12,0,0,0,.9,1,1);[-1,1].forEach(q=>svM(R,sc,svG('rw_sse',()=>new THREE.SphereGeometry(.03,4,3).toNonIndexed()),eye,q*.05,.22,-HB+.24));
  svM(R,sc,svG('rw_sbs',()=>svHorn(.07,.55,0,.12,4,3)),ice2,0,.14,-HB-.1,-Math.PI/2+.5,0,0);
  svM(R,sc,svG('rw_bl3',()=>{const g=svBlade(RWR.bl,.05);g.applyMatrix4(new THREE.Matrix4().set(0,0,1,0,-1,0,0,0,0,-1,0,0,0,0,0,1));g.computeVertexNormals();return g}),ice,0,0,-HB,0,0,0,RWR.BS);
  [[.5,.0],[.95,.02],[1.5,.05],[1.95,.35]].forEach(([p,q],k)=>[-1,1].forEach(x=>{const P=rwrBP(p,q);svM(R,sc,svG('rw_bg'+(k%2),()=>new THREE.BoxGeometry(.012,.05,k%2?.2:.12).toNonIndexed()),rune,x*.062,P[1],P[2],k*.5,0,0)}));
}
// ---------------- scythe aims: wrist angles solved from the rig ----------------
// a pose may carry aim:[hx,hy,hz, ux,uy,uz] in the body frame: h = haft direction from the fist to the blade, u = the way
// the blade points (its length). The right wrist (hdR) angles are solved so the scythe (rigid in the fist) matches, the
// solution nearest the previous one is kept so tracks never roll the long way round.
function rwrAimSolve(R,pose,ref){const J=R.J;
  for(const k in J){const g=J[k],r0=g.userData.r0,p0=g.userData.p0,o=k==='hdR'?[0,0,0]:(pose[k]||[]);g.rotation.set(r0.x+(o[0]||0),r0.y+(o[1]||0),r0.z+(o[2]||0));g.position.set(p0.x+(o[3]||0),p0.y+(o[4]||0),p0.z+(o[5]||0))}
  R.root.updateMatrixWorld(true);const A=pose.aim,V=THREE.Vector3,h=new V(A[0],A[1],A[2]).normalize(),u=new V(A[3],A[4],A[5]);u.addScaledVector(h,-u.dot(h)).normalize();
  const Y=u.clone().negate(),Z=h.clone().negate(),X=new V().crossVectors(Y,Z),Mb=new THREE.Matrix4().makeBasis(X,Y,Z);
  const bw=new THREE.Matrix4().extractRotation(J.body.matrixWorld),hw=new THREE.Matrix4().extractRotation(J.hdR.matrixWorld);
  const g0=J.scy.userData.r0,Gi=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(g0.x,g0.y,g0.z)).invert(),loc=hw.clone().invert().multiply(bw.multiply(Mb)).multiply(Gi),E=new THREE.Euler().setFromRotationMatrix(loc,'XYZ'),P=Math.PI;
  const near=(v,r)=>{while(v-r>P)v-=2*P;while(v-r<-P)v+=2*P;return v};
  const c1=[E.x,E.y,E.z],c2=[E.x+P,P-E.y,E.z+P];let best=null,bd=1e9;
  for(const c of [c1,c2]){const v=c.map((x,i)=>near(x,ref[i])),d=v.reduce((s,x,i)=>s+(x-ref[i])*(x-ref[i]),0);if(d<bd){bd=d;best=v}}
  return best}
function rwrAim(B,R){if(B._aim)return;B._aim=1;try{
  let ref=[0,0,0];const id=RWR.idleP;RWR.idle=Object.assign({},id);RWR.idle.hdR=ref=rwrAimSolve(R,id,ref);delete RWR.idle.aim;delete RWR.idle.body;
  // solve each pose from the idle solution (and from its predecessor for the chained sweeps)
  const order=['rUp','rHit','rRec','rUp2','rHit2'];const seen=new Set();
  const go=(k,r)=>{const p=B.P[k];if(!p||!p.aim||seen.has(k))return r;seen.add(k);const v=rwrAimSolve(R,p,r);p.hdR=v;return v};
  let r=ref;order.forEach(k=>{r=go(k,r)});for(const k in B.P)go(k,ref);
  for(const k in B.P)delete B.P[k].aim}
  catch(err){console.error('rw aim',err)}
  for(const k in R.J){const g=R.J[k];g.rotation.set(g.userData.r0.x,g.userData.r0.y,g.userData.r0.z);g.position.copy(g.userData.p0)}}
// the idle carry: right forearm forward, the scythe angled down and forward, the blade hanging point-down in front
RWR.idleP={body:[0,0,0],shR:[0.52,0.51,-1.23],elR:[-1.58,-0.67,0],shL:[-.55,0,.2],elL:[-.8,0,0],hdL:[.2,0,0],aim:[-.12,-.12,1,  0,-1,-.1]};
function rwrLoco(e,S,O,dt,now){const t=now/1000,a=Math.min(1,S.spd/2.5);
  O.body[4]+=.18*Math.sin(t*1.3);O.body[0]+=.12*a;O.body[2]+=.03*Math.sin(t*.9);O.body[1]+=.04*Math.sin(t*.7);
  O.chest[0]+=.03*Math.sin(t*1.3+.6);O.robe[0]+=-.14*a+.03*Math.sin(t*1.7);O.robe[2]+=.04*Math.sin(t*1.1);
  for(let k=0;k<14;k++){const o=O['tt'+k];o[0]+=.12*Math.sin(t*2.4+k*1.3)+.3*a;o[2]+=.08*Math.sin(t*1.9+k)}
  O.neck[0]+=.04*Math.sin(t*.9);O.head[1]+=.15*Math.sin(t*.6);O.head[0]+=.05*Math.sin(t*.9+1);O.jaw[0]+=.05+.04*Math.sin(t*2.1);O.halo[1]+=(t*1.1)%6.2832;
  const I=RWR.idle;if(I)for(const k in I){const v=I[k],o=O[k];if(o)for(let q=0;q<v.length;q++)o[q]+=v[q]}
  O.shR[0]+=.04*Math.sin(t*1.2);O.shL[0]+=.05*Math.sin(t*1.4+1);O.elL[0]+=.06*Math.sin(t*1.1);O.hdL[0]+=.08*Math.sin(t*1.6)}
function rwrPost(e,S,dt,now){const R=S.R,on=S.ph>1;R.crownG.color.setHex(on?0xd8f8ff:0x6ab0e0);R.J.halo.visible=on;
  if(R.heart)R.heart.scale.setScalar(R.heart.userData.s0*(1+.18*Math.sin(now/260)));
  if(Math.random()<dt*(on?14:5)){const p=svWP(e,'robe',(Math.random()-.5)*2,-1.9,(Math.random()-.5)*2);burst(p,0xe8f8ff,1,.6,.3,1.2)}
  if(Math.random()<dt*1.5){const p=svWP(e,'jaw',0,-.1,.3);burst(p,0xe8f8ff,1,.25,.2,.8)}
  e.m.visible=!S.gone&&e.m.visible}
// poses. aim = scythe direction (see rwrAimSolve). Swing aims follow the swing: u points along the way the blade travels.
var RWRP={
  // reaping sweep: drawn back to the right, sweep to the left; the blade rolls over for the return sweep
  rUp:{body:[0,-.7,.1],chest:[0,-.3,0],shR:[-1.18,-1.15,-1.18],elR:[-1.46,-0.15,0],shL:[-1.0,0,-.3],elL:[-.9,0,0],head:[0,.3,0],robe:[0,.2,0],aim:[-.95,-.12,-.32, -.32,-.12,.95]},
  rHit:{body:[.1,.75,-.08,0,0,.6],chest:[0,.35,0],shR:[-1.09,0.12,0.63],elR:[-0.7,-0.05,0.03],shL:[-1.2,0,.75],elL:[-.4,0,0],head:[0,-.2,0],robe:[-.2,-.3,0],aim:[.48,-.14,.88, .88,-.1,-.48]},
  rRec:{body:[.05,.5,0],chest:[0,.2,0],shR:[0.39,1.09,-1.13],elR:[-1.2,-0.72,0],shL:[-.9,0,.4],elL:[-.6,0,0],aim:[.45,-.45,.75, .2,-1,-.2]},
  rUp2:{body:[0,.75,.05],chest:[0,.35,0],shR:[-1.43,2.16,-0.43],elR:[-1.24,-0.12,0.26],shL:[-1.25,0,.9],elL:[-.4,0,0],head:[0,-.3,0],aim:[1,-.12,.07, -.07,-.12,1]},
  rHit2:{body:[.1,-.7,.08,0,0,.5],chest:[0,-.35,0],shR:[0.98,0.36,-2.07],elR:[-1.29,0,0.08],shL:[-1.1,0,-.2],elL:[-.8,0,0],head:[0,.25,0],robe:[-.2,.3,0],aim:[-.56,-.15,.82, -.82,-.12,-.56]},
  // overhead cleave: the blade raised up behind, then chopped down point-first into the snow
  oUp:{body:[-.25,0,0,0,.4,-.2],chest:[-.2,0,0],shR:[-1.27,1.05,-1.36],elR:[-1.2,-0.72,0],shL:[-2.5,0,.25],elL:[-.4,0,0],head:[-.2,0,0],robe:[.1,0,0],aim:[-.05,.76,-.64, 0,.64,.76]},
  oHit:{body:[.45,0,0,0,-.55,.4],chest:[.3,0,0],shR:[0.46,1.36,-1.65],elR:[-0.55,0.54,0],shL:[-.95,0,.2],elL:[-.2,0,0],head:[.3,0,0],robe:[-.3,0,0],aim:[-.05,-.32,.95, 0,-.95,-.32]},
  oRec:{body:[.25,0,0,0,-.35,.2],chest:[.15,0,0],shR:[0.45,1.32,-1.52],elR:[-0.59,-0.32,0],shL:[-.85,0,.2],aim:[-.05,-.15,.99, 0,-.99,-.15]},
  // glide reap: lean back with the blade trailing low, rush, sweep through
  gBack:{body:[-.3,-.4,0,0,.3,-.4],shR:[-0.36,-1.84,-0.41],elR:[-1.56,0.02,-0.11],shL:[-.6,0,.2],robe:[.3,0,0],head:[.1,.2,0],aim:[-.6,-.35,-.8, -.8,-.3,.6]},
  gRush:{body:[.55,.3,0,0,-.4,.3],shR:[-0.21,-1.12,0.05],elR:[-1.61,-0.82,-0.01],shL:[-1.3,0,.4],robe:[-.6,0,0],head:[-.25,-.2,0],aim:[-.99,-.2,-.13, -.13,-.2,.99]},
  gCut:{body:[.2,.7,0,0,0,.2],shR:[-0.97,0.47,0.5],elR:[-0.84,0.2,-0.01],shL:[-1.1,0,.8],robe:[-.4,-.2,0],aim:[.3,-.2,.95, .95,-.15,-.3]},
  // frost nova
  nUp:{body:[-.15,0,0,0,.6,0],shR:[-0.76,0.68,-2.15],elR:[-1.39,0.01,0.05],shL:[-2.4,0,.7],elL:[-.2,0,0],head:[-.45,0,0],jaw:[.35,0,0],robe:[.25,0,0],aim:[1,.15,0, 0,1,0]},
  nDn:{body:[.25,0,0,0,-.5,0],shR:[0.36,-0.31,-0.91],elR:[-1.41,-0.64,0],shL:[-.4,0,1.2],elL:[0,0,0],head:[.2,0,0],jaw:[.5,0,0],robe:[-.3,0,0],aim:[-.9,-.4,.1, 0,-1,0]},
  // icicle volley: the left claw conducts, the scythe stays low
  vUp:{body:[-.1,0,0,0,.3,0],shL:[-2.7,0,.2],elL:[-.1,0,0],hdL:[-.4,0,0],shR:[0.56,0.57,-1.27],elR:[-1.45,-0.26,0],head:[-.3,0,0],aim:[-.12,-.3,1, 0,-1,-.1]},
  vThr:{body:[.1,0,0,0,.2,0],shL:[-1.4,0,.1],elL:[-.1,0,0],hdL:[.3,0,0],shR:[0.54,0.54,-1.28],elR:[-1.51,-0.87,0.02],head:[0,0,0],aim:[-.12,-.3,1, 0,-1,-.1]},
  // roar / phase change
  roar:{body:[-.35,0,0,0,.8,0],chest:[-.25,0,0],shR:[-0.7,-0.06,-1.04],elR:[-1.22,-0.01,0],shL:[-1.8,0,1.1],elL:[-.3,0,0],hdL:[-.3,0,0],head:[-.6,0,0],jaw:[.6,0,0],robe:[.3,0,0],aim:[-.8,.5,.3, 0,-.3,1]},
  hunch:{body:[.35,0,0,0,-.6,0],chest:[.3,0,0],shR:[0.51,0.49,-0.94],elR:[-1.5,-0.71,0],shL:[-.2,0,.2],elL:[-1.2,0,0],head:[.5,0,0],jaw:[.1,0,0],robe:[-.3,0,0],aim:[-.15,-.35,.9, 0,-1,-.3]},
  // reaping spin (Phase II third hit): arms out, the model itself turns (no unwinding)
  spin:{body:[.1,0,0,0,.2,0],chest:[0,.2,0],shR:[-1.3,-1.01,-1.3],elR:[-1.49,-1.17,0],shL:[-1.1,0,.9],elL:[-.4,0,0],robe:[-.5,0,0],aim:[-.93,-.12,.36, .36,-.05,.93]},
  stag:{body:[.45,0,.2,0,-1.2,0],chest:[.35,0,0],head:[.6,0,.3],jaw:[.4,0,0],shR:[0.8,0.72,-0.94],elR:[-0.85,-0.29,0.01],shL:[.2,0,.5],elL:[-.4,0,0],robe:[-.4,0,0],aim:[-.4,-.3,.85, -1,-.2,0]},
  dead:{body:[1.3,0,.3,0,-2.2,0],chest:[.4,0,0],head:[.8,0,0],jaw:[.7,0,0],shR:[0.53,-0.51,0.5],elR:[-1.05,1,0],shL:[.5,0,.7],robe:[-.8,0,0],aim:[-.5,-.2,.8, -1,0,0]},
  // ---- v112 specials ----
  // Frostbrand Rend: crouch, the blade hooked into the snow at its right front; rip it up and over to the left
  fbLow:{body:[.4,-.45,0,0,-.5,.2],chest:[.25,-.2,0],shR:[-0.25,-0.75,0.68],elR:[-1.16,-0.08,-0.02],shL:[-.9,0,.5],elL:[-1.1,0,0],hdL:[.4,0,0],head:[.15,.3,0],robe:[-.25,.15,0],aim:[-.35,-.55,.75, .35,.8,.3]},
  fbRise:{body:[-.3,.6,0,0,.6,-.2],chest:[-.25,.3,0],shR:[-1.61,-0.1,0.74],elR:[-1.35,-0.88,-0.02],shL:[-1.6,0,1.0],elL:[-.3,0,0],head:[-.35,-.25,0],jaw:[.35,0,0],robe:[.3,-.2,0],aim:[.5,.8,-.2, .3,.35,-.9]},
  fbRec:{body:[-.1,.3,0,0,.2,0],chest:[0,.15,0],shR:[-0.11,0.9,-1.15],elR:[-1.4,-0.81,0],shL:[-.8,0,.4],elL:[-.6,0,0],aim:[.35,.2,.9, .2,-1,0]},
  // Wraith Chains: the left claw thrusts out (the chain flies), yanks back, and the scythe hooks down
  chCast:{body:[.1,-.35,0,0,.1,0],chest:[.05,-.3,0],shL:[-1.55,0,.15],elL:[-.05,0,0],hdL:[.3,0,0],shR:[0.71,-1.27,0.63],elR:[-1.58,0.02,-0.02],head:[.05,.3,0],jaw:[.3,0,0],robe:[-.1,.2,0],aim:[-.6,-.3,-.75, -.2,-.3,.9]},
  chPull:{body:[-.3,.25,0,0,.3,-.3],chest:[-.2,.3,0],shL:[-.5,0,.3],elL:[-1.9,0,0],hdL:[-.4,0,0],shR:[-1.28,0.01,-1.67],elR:[-1.77,0.1,0],head:[-.2,0,0],jaw:[.45,0,0],robe:[.25,0,0],aim:[-.35,.85,.3, 0,.3,.95]},
  chReap:{body:[.5,-.1,0,0,-.4,.4],chest:[.3,-.1,0],shR:[0.73,1.46,-1.97],elR:[-0.46,0.53,0],shL:[-.7,0,.3],elL:[-1.3,0,0],head:[.25,0,0],jaw:[.2,0,0],robe:[-.35,0,0],aim:[-.15,-.3,.95, 0,-.95,-.3]},
  // Rime Maelstrom: it rises, whirls the scythe flat over its head (the model turns), then crashes down
  mxRise:{body:[-.1,0,0,0,1.6,0],chest:[-.1,0,0],shR:[-1.96,-0.51,0.6],elR:[-1.11,0.31,0],shL:[-2.3,0,.9],elL:[-.3,0,0],hdL:[-.3,0,0],head:[-.4,0,0],jaw:[.4,0,0],robe:[.35,0,0],aim:[-.95,.12,.1, 0,.05,1]},
  mxWhirl:{body:[.1,0,0,0,1.9,0],chest:[0,.2,0],shR:[-1.3,-0.01,-1.68],elR:[-1.37,0,0],shL:[-2.0,0,1.2],elL:[-.2,0,0],head:[-.1,0,0],jaw:[.25,0,0],robe:[-.3,0,0],aim:[-.97,.05,.2, .2,0,1]},
  mxSlam:{body:[.5,0,0,0,-.6,0],chest:[.35,0,0],shR:[0.17,1.34,-1.34],elR:[-0.58,0.24,0],shL:[-.9,0,.2],elL:[-.1,0,0],head:[.4,0,0],jaw:[.5,0,0],robe:[-.4,0,0],aim:[-.05,-.32,.95, 0,-.95,-.32]}};
function rwrSpikes(c,an,L,w,dm){const e=c.e,mat=c.R.iceM;for(let d=1.5;d<L;d+=1.1){const p=new THREE.Vector3(an.x+Math.sin(an.a)*d+(Math.random()-.5)*w*.6,0,an.z+Math.cos(an.a)*d+(Math.random()-.5)*w*.6);svSpike(p,mat,1.6+Math.random()*1.2,.32,1.3,.5);burst(gY(p,.3),RWR.ice,4,1.5,2,.5)}
  svSnd('ice',1);shake(.2);svHitNow(e,{k:'l',w,l:L},an,dm,{col:RWR.ice})}
function rwrRing(c,an,r0,r1,n,dm){const e=c.e,mat=c.R.iceM;for(let k=0;k<n;k++){const a=k/n*6.283,r=r0+(r1-r0)*Math.random(),p=new THREE.Vector3(an.x+Math.cos(a)*r,0,an.z+Math.sin(a)*r);svSpike(p,mat,1.4+Math.random(),.3,1.2,.5)}
  svSnd('ice',1,.8);svHitNow(e,r0>0?{k:'r',r0,r:r1}:{k:'c',r:r1},an,dm,{col:RWR.ice})}
function rwrIcicle(c,i){const e=c.e,S=c.S,R=S.R,L=S.icc||[];const o=L[i];if(!o)return;const p=o.getWorldPosition(new THREE.Vector3());o.visible=false;
  const q=c.inA(pl.position.clone(),.8),S2={k:'c',r:1.7},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,.6));svSnd('whoosh',.5,1.6);
  const m=new THREE.Mesh(svG('rw_icm',()=>{const g=new THREE.ConeGeometry(.22,1.4,5);g.rotateX(Math.PI/2);return g}),R.iceM);
  svShot(p,new THREE.Vector3(q.x,GH(q.x,q.z)+.2,q.z),.6,RWR.ice,.8,.8,P=>{if(e.dead||!AF)return;burst(P,RWR.ice,20,2.4,2,.5);svSnd('ice',.7,1.3);svDecal(P,0xcfefff,1.5,3,.5);svHitNow(e,S2,an,.85,{col:RWR.ice})},m)}
function rwrIcicles(c,on){const S=c.S,R=S.R;if(S.icc){S.icc.forEach(o=>o.parent&&o.parent.remove(o));S.icc=null}if(!on)return;S.icc=[];
  for(let k=0;k<5;k++){const o=new THREE.Mesh(svG('rw_icm2',()=>{const g=new THREE.ConeGeometry(.22,1.4,5);g.rotateX(Math.PI);return g}),R.iceM);o.position.set((k-2)*.75,2.4+.2*Math.abs(k-2),-.2);o.scale.setScalar(.01);R.J.chest.add(o);S.icc.push(o)}}
// Winter's Step: vanish, re-form behind the hero
function rwrGone(e,on){const S=e.sv;S.gone=on;S.ghost=on;e.m.visible=!on;if(on){burst(gY(e.m.position,2),0xe8f8ff,70,4,3,1);svShock(e.m.position,RWR.ice,4,.4)}}
// the model turns a whole number of times over [t0,t1] (eased; no unwinding afterwards)
function rwrTurn(c,t0,t1,turns){const M=c.M,k=Math.max(0,Math.min(1,(c.t-t0)/(t1-t0))),a=turns*6.2832*svEase.io(k),p=M.an.turn||0;c.m.rotation.y+=a-p;M.an.turn=a}
// ---- v112 effects ----
// Frostbrand: a standing crescent of frost that runs along the facing, leaving frost and shards behind
function rwrCrescent(c,an,f0,f1,T){const g=svG('rw_crs',()=>{const s=[];for(let i=0;i<=12;i++){const a=-1.2+2.4*i/12;s.push([Math.sin(a)*1.6,1.5+Math.cos(a)*1.4])}for(let i=12;i>=0;i--){const a=-1.1+2.2*i/12;s.push([Math.sin(a)*1.25,1.5+Math.cos(a)*.95])}return svBlade(s,.08)});
  const m=new THREE.MeshBasicMaterial({color:0xcff0ff,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  const o=new THREE.Mesh(g,m);o.userData.lpsSkip=1;o.renderOrder=22;o.rotation.y=an.a;scene.add(o);let t=0,lt=0;const mat=c.R.iceM;
  kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/T),d=f0+(f1-f0)*k,x=an.x+Math.sin(an.a)*d,z=an.z+Math.cos(an.a)*d;o.position.set(x,GH(x,z)-.4,z);o.scale.set(1+.4*k,1+.25*Math.sin(k*3.14),1);m.opacity=.85*(1-k*k);
    if(t-lt>.09){lt=t;burst(gY(o.position,.4),RWR.ice,4,2,1.5,.5);svDecal(o.position,0xcfefff,1.1,2.4,.4);if(Math.random()<.6)svSpike(new THREE.Vector3(x+(Math.random()-.5)*1.4,0,z+(Math.random()-.5)*1.4),mat,.9+Math.random()*.6,.2,.9,.5)}
    return k<1},end(){scene.remove(o);m.dispose()}})}
// Wraith Chains: a chain of glowing links from the left claw along the lane; it reels back in (with the hero if bound)
function rwrChain(c,an,L,caught){const e=c.e,N=26,G=svG('rw_lnk',()=>{const q=new THREE.TorusGeometry(.2,.055,4,8);return q.toNonIndexed()});
  const m=new THREE.MeshBasicMaterial({color:0xa8e4ff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});const grp=new THREE.Group();grp.userData.lpsSkip=1;
  for(let i=0;i<N;i++){const o=new THREE.Mesh(G,m);o.userData.lpsSkip=1;grp.add(o)}scene.add(grp);let t=0;const T1=.14,T2=.5,a=new THREE.Vector3(),b=new THREE.Vector3(),d=new THREE.Vector3();
  kqFx({tick(dt){t+=dt||0;if(e.dead||!e.m.parent)return false;svWP(e,'hdL',0,-.4,.1,a);
    const ext=t<T1?svEase.o(t/T1):1-svEase.io(Math.min(1,(t-T1)/T2)),len=caught?Math.max(.5,a.distanceTo(gY(pl.position,1.2))):L*ext;
    const end=caught?gY(pl.position,1.2):b.set(an.x+Math.sin(an.a)*L,a.y-.6,an.z+Math.cos(an.a)*L);d.subVectors(end,a).normalize();const n=Math.max(2,Math.min(N,Math.round(len/.34)));
    grp.children.forEach((o,i)=>{o.visible=i<n;if(i>=n)return;o.position.copy(a).addScaledVector(d,len*i/(n-1));o.lookAt(o.position.clone().add(d));o.rotateZ(i%2?1.57:0)});m.opacity=.9*(t<T1+T2*.7?1:Math.max(0,1-(t-T1-T2*.7)/(T2*.3)));
    if(Math.random()<.5)burst(grp.children[Math.floor(Math.random()*n)].position,RWR.ice,1,.4,.3,.4);return t<T1+T2},end(){scene.remove(grp);m.dispose()}})}
// Rime Maelstrom: a funnel of snow spinning round the wraith while it whirls
function rwrFunnel(c,T){const e=c.e,g=svG('rw_fun',()=>svLoft([[0,1.2,1.2],[2.5,2.6,2.6],[5.5,4.6,4.6],[7,5.4,5.4]],16,{cap:false})),
  m=new THREE.MeshBasicMaterial({color:0xd8f0ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false,wireframe:true}),
  m2=new THREE.MeshBasicMaterial({color:0x9ad8ff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,fog:false});
  const o=new THREE.Mesh(g,m),o2=new THREE.Mesh(g,m2);o2.scale.set(.92,1,.92);o.userData.lpsSkip=o2.userData.lpsSkip=1;o.renderOrder=o2.renderOrder=21;scene.add(o);scene.add(o2);let t=0;
  kqFx({tick(dt){t+=dt||0;if(e.dead||!e.m.parent)return false;const k=t/T,p=e.m.position;o.position.set(p.x,GH(p.x,p.z)-.3,p.z);o2.position.copy(o.position);o.rotation.y+=dt*7;o2.rotation.y-=dt*4;
    const f=Math.min(1,k*5,(1-k)*6);m.opacity=.45*f;m2.opacity=.12*f;if(Math.random()<.9){const a=Math.random()*6.283,r=2+Math.random()*4;burst(new THREE.Vector3(p.x+Math.cos(a)*r,GH(p.x,p.z)+.5+Math.random()*4,p.z+Math.sin(a)*r),0xe8f8ff,1,.8,.6,.6)}return t<T},
    end(){scene.remove(o);scene.remove(o2);m.dispose();m2.dispose()}})}
// trail points on the blade (scythe joint space): near the tip and near the heel
var RWT=[rwrBP(2.25,.75),rwrBP(.55,.05)];
function rwrTr(t0,t1,life){return [t0,t1,'scy',RWT[0],RWT[1],0xbfe8ff,life||.2]}
var RWRM={
  intro:{dur:2.8,trk:[[.4,'hunch','io'],[1.1,'hunch','l',.02],[1.7,'roar','o'],[2.4,'roar','l',.02],[2.8,'rRec','io']],trn:[[0,2.8,1]],
    ev:[[.3,c=>svSnd('hum',.6,.8)],[1.6,c=>{svSnd('shriek',.9,.7);svSnd('ice',1,.6);shake(.3);svShock(c.m.position,RWR.ice,8,.7);burst(gY(c.m.position,2.5),RWR.ice,60,5,3,1)}]]},
  reap:{wt:10,cd:3,r:[0,7.2],a:'f',mel:1,dur:1.35,lock:.52,trk:[[.55,'rUp','io'],[.7,'rUp','l',.02],[.86,'rHit','s'],[1.05,'rRec','io'],[1.35,'rRec','l']],
    hit:[{t:.84,s:{k:'a',r:7,h:1.35},f:-.3,dm:1.1}],tr:[rwrTr(.7,.95)],ev:[[.25,c=>svSnd('hum',.3,1.4)],[.76,c=>svSnd('swing',1,.8)]],nx:[['reap2',.8,9]],rec:.1},
  reap2:{dur:1.45,mel:1,lock:.3,trk:[[.32,'rUp2','io'],[.44,'rUp2','l',.015],[.6,'rHit2','s'],[.95,'rRec','io'],[1.45,'rRec','l']],
    hit:[{t:.58,s:{k:'a',r:7,h:1.35},f:-.3,dm:1.1}],tr:[rwrTr(.44,.7)],ev:[[.5,c=>svSnd('swing',1,.7)]],nx:[['spinR',.5,8]],rec:.35},
  spinR:{dur:1.6,ph:2,mel:1,lock:.25,trk:[[.3,'rUp','io'],[.4,'rUp','l',.02],[.55,'spin','o'],[.85,'spin','l'],[1.15,'rRec','io'],[1.6,'rRec','l']],
    tk(c){rwrTurn(c,.4,.85,1)},hit:[{t:.62,s:{k:'c',r:7.2},dm:1.25,w:.5}],tr:[rwrTr(.42,.85,.25)],ev:[[.42,c=>svSnd('whoosh',1,.6)]],rec:.5},
  cleave:{wt:8,cd:6,r:[2.5,10],a:'f',dur:2.3,lock:.85,armor:1,trk:[[.7,'oUp','io'],[1.0,'oUp','l',.025],[1.12,'oHit','s'],[1.7,'oRec','l'],[2.3,'rRec','io']],
    hit:[{t:1.1,s:{k:'l',w:2.6,l:9,b:0},f:.5,dm:1.45,w:.4,fx:(c,an)=>{shake(.35);svSnd('heavy',1,1.2);for(let d=2;d<9;d+=1.5)burst(gY(new THREE.Vector3(an.x+Math.sin(an.a)*d,0,an.z+Math.cos(an.a)*d),.3),RWR.ice,6,2,2,.5);c.M.an.cl=an}},
      {t:1.68,s:{k:'l',w:3.2,l:11,b:0},f:.5,dm:1.1,w:.5,nohit:1,fx:(c,an)=>rwrSpikes(c,c.M.an.cl||an,11,3.2,1.1)}],
    tr:[rwrTr(1.0,1.18)],ev:[[.3,c=>svSnd('hum',.5,1)],[1.0,c=>svSnd('swing',1,.6)]],rec:.4},
  glide:{wt:8,cd:8,r:[7,26],a:'f',dur:2.2,lock:.9,armor:1,trn:[[0,.9,3]],trk:[[.55,'gBack','io'],[.88,'gBack','l',.02],[1.1,'gRush','o'],[1.35,'gCut','s'],[2.2,'rRec','io']],
    rm:[[.2,.85,-2.2,'io'],[.92,1.36,'tgt','o',-3,24]],hit:[{t:1.3,s:{k:'l',w:3.2,l:16,b:0},f:0,dm:1.35,w:.75}],
    tr:[rwrTr(.95,1.4,.22)],ev:[[.92,c=>{svSnd('whoosh',1.2,.7);burst(gY(c.m.position,1),RWR.ice,40,3,1,.8)}],[1.28,c=>svSnd('swing',1,.6)]],
    tk(c,dt){if(c.M.t>.9&&c.M.t<1.36&&Math.random()<.8)burst(gY(c.m.position,.8),0xe8f8ff,3,1,.5,.9)},rec:.45},
  nova:{wt:7,cd:9,r:[0,6.5],a:'any',dur:2.2,armor:1,trn:[[0,.5,2]],trk:[[.55,'nUp','io'],[1.2,'nUp','l',.025],[1.35,'nDn','s'],[2.2,'rRec','io']],
    hit:[{t:1.33,s:{k:'c',r:7},dm:1.4,w:1.15,nohit:1,fx:c=>{rwrRing(c,{x:c.m.position.x,z:c.m.position.z},0,7,22,1.4);svShock(c.m.position,RWR.ice,8,.5);flash('rgba(200,240,255,.3)')}}],
    ev:[[.2,c=>{svSnd('charge',.6,.8);for(let k=0;k<6;k++){const a=k/6*6.283;svCharge(c.e,'chest',RWR.ice,1.2,1.1,Math.sin(a)*1.4,.5,Math.cos(a)*1.4)}}]],rec:.5},
  icicles:{wt:7,cd:10,r:[8,45],a:'any',dur:3.0,armor:1,trn:[[0,3,2.5]],trk:[[.5,'vUp','io'],[1.0,'vUp','l',.02],[1.15,'vThr','s'],[1.5,'vUp','io'],[1.65,'vThr','s'],[2.0,'vUp','io'],[2.3,'vThr','s'],[3.0,'rRec','io']],
    go(c){rwrIcicles(c,true)},tk(c,dt){const L=c.S.icc;if(L)L.forEach((o,k)=>{if(o.visible)o.scale.setScalar(Math.min(1,Math.max(.01,(c.M.t-.15*k)/.5)))})},end(c){rwrIcicles(c,false)},
    ev:[[.15,c=>svSnd('ice',.8,.7)]].concat([0,1,2,3,4].map(i=>[1.1+i*.32,c=>rwrIcicle(c,i)])),rec:.4},
  // ---- v112: Frostbrand Rend (close, in front) ----
  frostbrand:{wt:7,cd:9,r:[0,7.5],a:'f',dur:2.45,lock:.8,armor:1,trk:[[.6,'fbLow','io'],[1.0,'fbLow','l',.025],[1.2,'fbRise','s'],[1.6,'fbRise','l'],[2.45,'fbRec','io']],
    hit:[{t:1.12,s:{k:'a',r:6,h:.8},f:-.2,dm:1.3,mel:1,w:.32,fx:(c,an)=>{shake(.3);svSnd('crack',1,.8);svSnd('ice',1,.7);rwrCrescent(c,an,2,11.5,.95);burst(c.wp('scy',...rwrBP(1.5,.4)),RWR.ice,30,3,2,.6)}},
      ...[3.3,5.7,8.2].map((f,i)=>({t:1.45+i*.25,s:{k:'l',w:2.6,l:3.2,b:0},f,dm:1,w:.6,col:RWR.ice}))],
    tr:[rwrTr(1.0,1.3,.24)],
    ev:[[.15,c=>svSnd('hum',.5,.7)],[.6,c=>{svSnd('charge',.5,1.3);svCharge(c.e,'scy',RWR.ice,1.1,.55,...rwrBP(1.4,.3));const p=c.wp('scy',...rwrBP(2.3,.9));svDecal(p,0xcfefff,1.4,2.2,.5);burst(p,RWR.ice,16,2,1.5,.5)}],[1.02,c=>svSnd('swing',1.1,.65)]],
    tk(c,dt){if(c.M.t>.6&&c.M.t<1.05&&Math.random()<dt*20)burst(c.wp('scy',...rwrBP(2.3,.9)),0xe8f8ff,2,1,1,.5)},rec:.4},
  // ---- v112: Wraith Chains (far, in front) ----
  wraithchain:{wt:7,cd:12,r:[6,20],a:'f',dur:2.9,lock:.8,armor:1,trk:[[.5,'chCast','io'],[.85,'chCast','l',.02],[1.05,'chCast','l'],[1.35,'chPull','o'],[1.75,'chPull','l',.02],[1.95,'chReap','s'],[2.9,'rRec','io']],
    hit:[{t:1.0,s:{k:'l',w:1.8,l:20,b:0},f:.5,dm:.7,w:.8,col:RWR.ice,
        on:(c,an)=>{c.M.an.caught=1;const q=c.inA(c.at(3.4),1),dx=q.x-pl.position.x,dz=q.z-pl.position.z,D=Math.hypot(dx,dz)||1;pl.step={x:dx/D,z:dz/D,t:.4,sp:D/.4}},
        fx:(c,an,hit)=>{rwrChain(c,an,20,hit);svSnd(hit?'crack':'whoosh',1,hit?.6:1.4);if(hit){svDecal(pl.position,0xcfefff,1.2,2,.5);burst(gY(pl.position,1.2),RWR.ice,24,2.5,2,.5)}}},
      {t:1.93,s:{k:'a',r:5,h:.9},f:-.3,dm:1.35,mel:1,w:.32,fx:(c,an,hit)=>{svSnd('heavy',.7,1.4);const p=c.wp('scy',...rwrBP(2.3,.9));svDecal(p,0xcfefff,1.5,2.5,.5);burst(p,RWR.ice,20,2.5,2,.5)}}],
    tr:[rwrTr(1.75,2.05,.22)],
    ev:[[.3,c=>{svSnd('bell',.7,1.2);svCharge(c.e,'hdL',RWR.ice,.9,.6,0,-.35,.1)}],[.95,c=>svSnd('bell',.9,.8)],[1.7,c=>svSnd('swing',1,.7)]],rec:.45},
  // ---- Phase II ----
  awaken:{dur:3.3,inv:[0,3.3],armor:1,trk:[[.5,'hunch','io'],[1.2,'hunch','l',.03],[1.6,'roar','o'],[2.8,'roar','l',.02],[3.3,'rRec','io']],trn:[[0,3,1]],
    hit:[{t:1.65,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.2,fx:c=>{svShock(c.m.position,RWR.ice,10,.8);burst(gY(c.m.position,2),0xffffff,90,6,3,1.2)}}],
    ev:[[.05,c=>{banner('THE BLIZZARD WAKES','The Rime Wraith calls the storm','');svSnd('hum',.8,.6)}],[1.2,c=>{c.S.ph=2;c.e.bs.ph=2;flash('rgba(220,245,255,.45)');svSnd('shriek',1.1,.6);shake(.5)}]]},
  step:{wt:8,cd:9,ph:2,r:[0,30],a:'any',dur:2.7,armor:1,trn:[[0,.1,1]],trk:[[.35,'hunch','io'],[.5,'hunch','l'],[1.4,'rUp','io'],[1.62,'rUp','l',.02],[1.8,'rHit','s'],[2.2,'rRec','io'],[2.7,'rRec','l']],
    ev:[[.4,c=>{rwrGone(c.e,true);svSnd('whoosh',1,.5)}],[1.25,c=>{const e=c.e,m=e.m,d=pl.mvd&&nowP()-pl.mvd.t<300?pl.mvd:{x:Math.sin(pl.rotation.y),z:Math.cos(pl.rotation.y)},q=c.inA(pl.position.clone().add(new THREE.Vector3(-d.x*4.2,0,-d.z*4.2)),2.5);
      m.position.set(q.x,0,q.z);m.rotation.y=svYawTo(m,pl.position);rwrGone(e,false);svSnd('bell',.8,1.6);burst(gY(q,2),RWR.ice,60,3,2,.8);svShock(q,RWR.ice,3,.3)}]],
    hit:[{t:1.78,s:{k:'a',r:7,h:1.35},f:-.3,dm:1.25,w:.45}],tr:[rwrTr(1.64,1.9)],end(c){if(c.S.gone)rwrGone(c.e,false)},inv:[.4,1.25],rec:.4},
  prison:{wt:7,cd:11,ph:2,r:[0,16],a:'any',dur:2.8,armor:1,trn:[[0,2.8,2]],trk:[[.5,'vUp','io'],[1.25,'vUp','l',.02],[1.4,'nDn','s'],[1.9,'nUp','io'],[2.05,'nDn','s'],[2.8,'rRec','io']],
    hit:[{t:1.4,s:{k:'c',r:3.2},o:'tgt',dm:1.2,w:1.1,nohit:1,fx:(c,an)=>{c.M.an.pr=an;rwrRing(c,an,0,3.2,14,1.2)}},
      {t:2.05,s:{k:'r',r0:3.2,r:6.8},o:c=>c.M.an.pr||c.inA(pl.position.clone()),dm:1.2,w:.6,nohit:1,fx:(c,an)=>rwrRing(c,c.M.an.pr||an,3.2,6.8,26,1.2)}],
    ev:[[.2,c=>svSnd('charge',.6,1.1)]],rec:.4},
  // ---- v112: Rime Maelstrom (Phase II, close, any side) ----
  maelstrom:{wt:7,cd:14,ph:2,r:[0,9],a:'any',dur:3.7,armor:1,trn:[[0,.5,2]],trk:[[.6,'mxRise','io'],[1.0,'mxRise','l',.02],[1.25,'mxWhirl','o'],[2.2,'mxWhirl','l'],[2.5,'mxRise','io'],[2.78,'mxSlam','i'],[3.7,'rRec','io']],
    tk(c,dt){rwrTurn(c,1.05,2.3,2);const M=c.M;if(M.t>1.0&&M.t<2.4&&hero.hp>0){const dx=c.m.position.x-pl.position.x,dz=c.m.position.z-pl.position.z,L=Math.hypot(dx,dz);
      if(L>2.8&&L<12&&!(pl.step&&pl.step.t>0)){const k=Math.min(L-2.8,.9*dt);if(typeof plBlocked!='function'||!plBlocked(pl.position.x+dx/L*k,pl.position.z+dz/L*k)){pl.position.x+=dx/L*k;pl.position.z+=dz/L*k}}}},
    hit:[{t:1.6,s:{k:'r',r0:2.6,r:6.2},dm:1.1,w:1.0,col:RWR.ice,fx:c=>{svShock(c.m.position,RWR.ice,6.2,.35);svSnd('swing',1,.6)}},
      {t:2.1,s:{k:'r',r0:2.6,r:6.2},dm:1.1,w:.5,col:RWR.ice,fx:c=>{svShock(c.m.position,RWR.ice,6.2,.35);svSnd('swing',1,.55)}},
      {t:2.76,s:{k:'c',r:4},dm:1.4,w:.6,fx:c=>{shake(.45);svSnd('heavy',1,.9);svSnd('ice',1,.6);svShock(c.m.position,RWR.ice,5,.5);svDecal(c.m.position,0xcfefff,4.5,3.5,.55);
        for(let k=0;k<12;k++){const a=k/12*6.283,r=1.5+2.3*((k*7)%5)/5,p=new THREE.Vector3(c.m.position.x+Math.cos(a)*r,0,c.m.position.z+Math.sin(a)*r);svSpike(p,c.R.iceM,1.2+Math.random(),.28,1.1,.5)}burst(gY(c.m.position,1),0xffffff,60,5,2.5,.8)}}],
    tr:[rwrTr(1.05,2.3,.3),rwrTr(2.5,2.85)],
    ev:[[.2,c=>{svSnd('roar',.6,1.3);rwrFunnel(c,2.2)}],[1.1,c=>svSnd('whoosh',1.1,.5)],[1.7,c=>svSnd('whoosh',1.1,.6)],[2.5,c=>svSnd('hum',.6,1.2)]],rec:.5}};
svReg(2,{name:'Rime Wraith',col:RWR.col,body:1.6,ph2:.55,poise:.17,headJ:'head',turnA:4.5,
  ai:{pref:5,walk:2.6,run:4,turn:2.6,rest:[.75,1.35],ph2r:.7,strafe:.6,back:1},
  build:rwrBuild,loco:rwrLoco,post:rwrPost,P:RWRP,M:RWRM,init(e,R){rwrAim(SVB[2],R)},
  stag:[[.3,'stag','o'],[2.0,'stag','l',.02],[2.6,'rRec','io']],stagT:2.6,
  die:[[.5,'stag','o'],[1.4,'dead','i'],[2.1,'dead','l']],
  homeY(A){const a=A.dn&&A.dn.ea!=null?A.dn.ea:0;return Math.atan2(Math.cos(a),Math.sin(a))},
  reset(e){if(e.sv.gone)rwrGone(e,false);rwrIcicles({S:e.sv},false)},
  dying(e,t){if(Math.random()<.5)burst(gY(e.m.position,1.5+Math.random()*2),0xe8f8ff,3,1.5,1,1)}});
// ---- the den's warning sign: the current moveset (v112) ----
DSTXT[2]={den:'The Frozen Sepulchre',zone:'Burningeye Summit',
  atk:[['🌙 Reaping Sweep','In front, close: the scythe is drawn back to its right (it trembles), then a wide sweep — and almost always a second sweep back the other way.','Back out of reach or dash through the swing; punish only after the second sweep.'],
   ['🪓 Overhead Cleave','It raises the scythe high and holds it, then slams a long line in front; a moment later ice spikes burst along the same line.','Step to the side of the line, and don\'t step back into it when the spikes rise.'],
   ['💨 Glide Reap','From afar it drifts back, then rushes straight through you with the blade low along a long red lane.','Sidestep the lane — running straight away doesn\'t work.'],
   ['🧊 Icicle Volley','Five icicles gather over its head and fire one by one at red circles under your feet.','Keep moving; don\'t stop inside a circle.'],
   ['❄ Frost Nova','Its arms rise and frost crystals gather around it, then ice bursts out in a big circle.','Leave the red circle before the arms come down.'],
   ['🔪 Frostbrand Rend','Close, in front: it crouches and hooks the blade into the snow (frost gathers on the edge), then rips it upward and a crescent of frost runs straight ahead in three bursts.','Get to its side; never retreat down the red lane — the crescent outruns you.'],
   ['⛓ Wraith Chains','From afar its left claw points at you and a spectral chain flies down a long red lane. If it binds you, you are dragged in front of it and reaped by a downward hook.','Sidestep the lane or dash through it as the chain flies; if you are caught, dash at once.'],
   ['👻 Winter\'s Step','Phase II: it vanishes in a burst of snow and re-forms behind you with a sweep.','Turn and move as soon as it fades; the sweep comes from behind.'],
   ['🦴 Glacial Prison','Phase II: ice bursts in a circle under you, then in a ring around that same spot.','Step out of the circle, then step back into the middle before the ring.'],
   ['🌀 Reaping Spin','Phase II: after the double sweep it may spin all the way round with the scythe out.','Stay well out of reach until the spin ends.'],
   ['🌪 Rime Maelstrom','Phase II: it rises in a funnel of snow (the wind drags you in) and whirls the scythe overhead twice — a red ring around it each time — then crashes down in a red circle at its feet.','Hug its robe inside the ring (or stay outside it) through the whirls, then get out before the crash.']],
  weak:['POSTURE: every hit fills the yellow bar under its health. When it breaks, the wraith is STAGGERED for a few seconds and takes +35% damage — save your strongest attacks for that moment.',
   'Big moves (Cleave, Glide, Nova, Volley, Frostbrand, Chains, Maelstrom) can\'t be interrupted: a break during one lands as soon as the move ends.',
   'Every attack is telegraphed: melee swings show a faint outline just before they land, area attacks a red warning for the whole wind-up. A dash through the strike dodges it.',
   'At 55% health it wakes the blizzard (Phase II): it rests less between attacks and gains new moves. The Warmfires and deep cold of the old den are gone.']};
