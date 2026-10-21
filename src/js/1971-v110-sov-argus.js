// ================= v110 Sovereign 0 — Argus, the Hundred-Eyed (Kindlelight) — model and moves reworked in v112 =================
// A gaunt bog-wolf the size of a hut. v112 model: a matted hide pulled over a bare ribcage (bone ribs and glowing amber veins
// between them), overlapping bark scales down the spine and over the shoulders and haunches (pauldron-like plates), a mane of
// bone quills, antler horns, torn ears, fangs, a rusted iron collar with rivets and a broken chain still hanging from it (a
// hunter's skull for a trophy), a trophy belt of bones round the waist and three broken spears stuck in its back. Every joint
// has a cap (elbows, wrists, knees, hocks, tail segments) so nothing gapes at any pose. And the eyes: thirty-odd of them on
// hide, legs, neck, face and the tail tip, half-lidded in Phase I and staring wide in Phase II (the veins burn brighter too).
// Pattern (learnable):
//  close in front ── Rending Claws: right paw rises and trembles → sweep; often chained into the left backhand, then a bite.
//  close behind  ── Tail Lash: it looks back over its shoulder (the tell), then the tail sweeps the rear arc.
//  close, any side ─ Whirling Rend (v112): it coils low, twisted, and shudders → spins a full turn, claws and tail out
//                   (circle round it, knock-back). It reels dizzily afterwards: punish it.
//  mid           ── Lunging Bite: it coils low, then lunges along a line (step aside, don't back away).
//                   Amber Furrow (v112): it rears up on its hind legs, paws glowing → slams them down and a line of amber
//                   spikes rips through the ground toward you, one circle after another (sidestep the line).
//                   Phase II: three furrows fan out at once.
//  far           ── Leaping Pounce (crouch, then a high leap onto where you stood; long recovery: punish it)
//                   or the Hundred-Eyed Gaze (it rears, the brow eye charges, a beam fires down a line).
//  Phase II (55%) ─ "The Eyes Open": a howl and a push-back. New: Eye Barrage (bolts rain on your trail, keep moving),
//                   Blinding Flare (it hunches and every eye brightens — get out of the circle) and Searing Sweep (v112: it
//                   sits back with its head turned aside, the brow eye charges, then the beam sweeps across the whole red
//                   cone in front of it — get behind it or dash through the beam). Combos get longer.
// Every move has a cooldown; the engine's svPick also refuses a move just used.
var ARG={col:0xffd040,dim:0xa87a1c,vein:0x6a3a0c,veinH:0xffa018,amb:0xd89a30,
  // the torso loft (body space): [z, rx, ry, ox, oy]
  TOR:[[-2.5,.26,.3,0,.3],[-2.2,.58,.62,0,.16],[-1.75,.78,.8,0,.06],[-1.15,.74,.74,0,.02],[-.5,.6,.66,0,.02],[.15,.74,.86,0,-.1],[.75,.94,1.08,0,-.18],[1.3,1.0,1.08,0,-.02],[1.8,.9,.96,0,.28],[2.2,.62,.68,0,.5],[2.45,.42,.5,0,.62]]};
// torso radius at z: [rx, ry, oy]
function argTor(z){const T=ARG.TOR;if(z<=T[0][0])return [T[0][1],T[0][2],T[0][4]];for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(z<=b[0]){const k=(z-a[0])/(b[0]-a[0]);return [a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k,a[4]+(b[4]-a[4])*k]}}
  const L=T[T.length-1];return [L[1],L[2],L[4]]}
// a point on the torso surface: th = 0 on the spine, PI/2 on the flank, PI under the belly; sd = side; k = radius factor
function argTS(z,th,k,sd){const [rx,ry,oy]=argTor(z);return [sd*Math.sin(th)*rx*k,oy+Math.cos(th)*ry*k,z]}
function argBuild(R,e){
  const fur=svMat(R,0x2a2232,{roughness:.96,emissive:0x2a1838}),fur2=svMat(R,0x3e3648,{roughness:.95,emissive:0x1c1424}),hide=svMat(R,0x4a3428,{roughness:.75,emissive:0x0c0604}),bark=svMat(R,0x3a2e22,{roughness:.9,emissive:0x0a0604}),
    bone=svMat(R,0xc4b494,{roughness:.6,emissive:0x40341c}),claw=svMat(R,0x141016,{roughness:.4,metalness:.2}),gum=svMat(R,0x6a1c24,{roughness:.6,emissive:0x200408}),lid=fur2,
    iron=svMat(R,0x3a3430,{roughness:.5,metalness:.65,emissive:0x0a0806}),
    iris=svGlowMat(R,ARG.dim),vein=svGlowMat(R,ARG.vein),slit=claw;R.iris=iris;R.vein=vein;R.eyes=[];
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),V3=THREE.Vector3,Z=new V3(0,0,1);
  const aim=(m,x,y,z)=>{m.quaternion.setFromUnitVectors(Z,new V3(x,y,z).normalize());return m};
  // shared shapes
  const gDome=svG('ag_dome',()=>new THREE.SphereGeometry(1,7,3,0,Math.PI*2,0,Math.PI/2).toNonIndexed()),gBall=svG('ag_ball',()=>svLump(1,0,.12,21)),
    gStrand=svG('ag_tf',()=>svHorn(.18,.75,0,-.25,4,3)),gRiv=svG('ag_riv',()=>svLump(.07,0,.15,5)),gClaw=svG('ag_cl',()=>svHorn(.06,.42,0,-.18,4,3)),gToe=svG('ag_toe',()=>svLump(.1,0,.25,8));
  const skull=(j,x,y,z,s,ry)=>{svM(R,j,svG('ag_sk',()=>svLump(.16,1,.12,31)),bone,x,y,z,0,ry||0,0,s,s*.85,s*1.15);svM(R,j,svG('ag_skj',()=>new THREE.BoxGeometry(.18,.06,.14)),bone,x,y-.13*s,z+.06*s,0,ry||0,0,s);
    [-1,1].forEach(q=>svM(R,j,svG('ag_sks',()=>svLump(.045,0,.1,6)),slit,x+q*.06*s*Math.cos(ry||0),y+.02*s,z+.13*s,0,0,0,s))};
  J('root',null,0,0,0);J('body','root',0,2.55,0);J('chest','body',0,0,.6);J('hips','body',0,0,-.9);
  // ---- torso: haunches, a gaunt waist, a deep ribcage and a hunched shoulder hump ----
  svM(R,'body',svG('ag_tor',()=>svLoftZ(ARG.TOR,12)),fur);
  svM(R,'body',svG('ag_hmp',()=>svLump(.8,1,.25,11)),fur,0,.75,1.55,0,0,0,1.05,.7,1.15);
  // mane of bone quills on the shoulders, thinning toward the rump
  const QS=[[2.1,1.15,1.35],[1.85,1.25,1.5],[1.6,1.22,1.6],[1.35,1.15,1.45],[1.1,1.0,1.25],[.8,.92,1.05],[.45,.85,.85],[.1,.78,.7],[-.3,.7,.55],[-.75,.72,.5],[-1.2,.78,.45],[-1.65,.8,.38],[-2.05,.66,.3]];
  QS.forEach(([z,y,h],k)=>{[0,1,-1].forEach(sd=>{if(sd&&(k>8||k%2))return;svM(R,'body',svG('ag_q'+(k%3),()=>svHorn(.12,1,0,-.42-.12*(k%3),5,5)),bone,sd*.32,y-(sd?.12:0),z,-1.25+(sd?.2:0)-.04*k,sd*.35,sd*.25,1,1,h*(sd?.7:1))})});
  // overlapping bark scales down the spine (three rows, each scale tilted back over the next)
  for(let z=-2.15;z<1.0;z+=.3){[0,1,-1].forEach(sd=>{const th=sd?.62:0,[x,y]=argTS(z,th,.97,sd||1);const w=sd?.36:.44;
    svM(R,'body',gDome,bark,sd?x:0,y,z,-.32,0,-(sd||0)*th,w,.15,.42)})}
  // bare ribs arching over the flanks, glowing veins between them
  [-.3,.05,.4,.75].forEach((z,k)=>[-1,1].forEach(sd=>{const P=[];for(let q=0;q<7;q++){const th=.78+q*.27;P.push(argTS(z+Math.sin(q*.5)*.06,th,1.035+.02*Math.sin(q*.9),sd))}
    svM(R,'body',svG('ag_rib'+k+sd,()=>svTube(P,.06,5)),bone)}));
  [-.12,.22,.57,.92,-.6,-1.0].forEach((z,k)=>[-1,1].forEach(sd=>{const P=[];for(let q=0;q<8;q++){const th=.9+q*.16;P.push(argTS(z+Math.sin(q*1.7+k)*.06,th,1.012,sd))}
    svM(R,'body',svG('ag_vn'+k+sd,()=>svTube(P,.026,4)),vein)}));
  // ragged fur hanging from the belly and the flanks
  for(let k=0;k<20;k++){const sd=k%2?1:-1,z=-2.0+(k>>1)*.42;const [x,y]=argTS(z,2.5,.96,sd);svM(R,'body',gStrand,fur2,x,y,z,2.5,sd*.25,sd*.35,1,1+.25*Math.sin(k*1.3),1)}
  // bark plates over the haunches and the front of the shoulders
  [[1.75,.35,.92,.9],[-1.45,.25,.8,1.1],[-1.9,.15,.66,.9]].forEach(([z,y,x,s])=>[-1,1].forEach(sd=>svM(R,'body',gDome,bark,sd*x*.95,y,z,.15,0,-sd*1.25,.4*s,.13,.5*s)));
  // the trophy belt round the gaunt waist: a strap, rivets, bones and a skull hanging from cords
  {const P=[];for(let q=0;q<=16;q++){const th=q/16*Math.PI*2;const [x,y]=argTS(-.62,th,1.04,1);P.push([x,y,-.62+.05*Math.cos(th)])}svM(R,'body',svG('ag_belt',()=>svTube(P,.08,5,{cap:false})),hide);
    for(let q=0;q<10;q++){const th=.3+q*.29;[-1,1].forEach(sd=>{const [x,y]=argTS(-.62,th,1.11,sd);svM(R,'body',gRiv,iron,x,y,-.62+.05*Math.cos(th))})}
    [[1,1.75,0],[1,2.05,1],[-1,1.9,2],[-1,2.2,3]].forEach(([sd,th,k])=>{const [x,y]=argTS(-.62+(k%2?.18:-.12),th,1.1,sd);
      svM(R,'body',svG('ag_cord',()=>svTube([[0,0,0],[0,-.18,.02],[0,-.34,0]],.018,3)),hide,x,y,-.62+(k%2?.18:-.12));
      if(k===0)skull('body',x+sd*.04,y-.48,-.74,.95,sd*1.2);else svM(R,'body',svG('ag_tok',()=>svHorn(.05,.3,0,.06,4,3)),bone,x,y-.36,-.62+(k%2?.18:-.12),1.6,0,0)})}
  // three broken hunters' spears stuck in its back
  [[.42,.7,-.55,.6,1,-.5,1.1],[-.5,.62,.25,-.8,.9,.25,.85],[.3,.95,-1.55,.35,1,-.2,.95]].forEach(([x,y,z,dx,dy,dz,l],k)=>{
    aim(svM(R,'body',svG('ag_sp'+k,()=>svLoftZ([[-.5,.05,.05],[l*.8,.045,.045],[l,.03,.05,.02,.01]],5)),bark,x,y,z),dx,dy,dz);
    aim(svM(R,'body',svG('ag_spw',()=>svLoftZ([[0,.075,.075],[.16,.075,.075]],5)),hide,x+dx*.1,y+dy*.1,z+dz*.1),dx,dy,dz)});
  // ---- neck: iron collar (rivets, a broken chain with a skull), mane ----
  J('neck','chest',0,.45,1.55,-.42);svM(R,'neck',svG('ag_nk',()=>svLoftZ([[-.1,.55,.6],[.55,.46,.5,0,.1],[1.2,.36,.4,0,.18],[1.45,.3,.34,0,.2]],8)),fur);
  for(let k=0;k<7;k++)svM(R,'neck',svG('ag_mn',()=>svHorn(.14,.85,0,-.3,4,3)),fur2,0,.42-.02*k,.1+k*.2,-1.3,0,0,1.4,1.2,1);
  for(let k=0;k<6;k++)[-1,1].forEach(sd=>svM(R,'neck',gStrand,fur2,sd*.48,-.05-.06*k,.05+k*.2,2.6,sd*.6,sd*.7,1.1,1,1));
  {const ring=(z,k)=>{const P=[];for(let q=0;q<=16;q++){const t=q/16*Math.PI*2,rx=.55-(.09*(z+.1)/.65),ry=.6-(.1*(z+.1)/.65),oy=.1*(z+.1)/.65;P.push([Math.sin(t)*rx*k,oy+Math.cos(t)*ry*k,z])}return P};
    svM(R,'neck',svG('ag_col',()=>svTube(ring(.18,1.07),.09,6,{cap:false})),iron);svM(R,'neck',svG('ag_col2',()=>svTube(ring(.36,1.06),.05,5,{cap:false})),iron);
    for(let q=0;q<12;q++){const t=q/12*Math.PI*2;svM(R,'neck',gRiv,iron,Math.sin(t)*.6,.04+Math.cos(t)*.66,.18)}
    // the chain hangs straight down (neck space: down = (0,-.91,-.41))
    const g=svG('ag_lk',()=>new THREE.TorusGeometry(.085,.03,4,6).toNonIndexed());let px=.12,py=-.6,pz=.12;
    for(let q=0;q<6;q++){svM(R,'neck',g,iron,px,py,pz,q%2?0:Math.PI/2,0,1.15);py-=.13*.91;pz-=.13*.41;px+=.01}
    skull('neck',px,py-.12,pz-.06,1,0)}
  // ---- head: skull, brow ridges, horns, ears, cheek ruff, fangs, forehead runes ----
  J('head','neck',0,.2,1.2,.42);
  svM(R,'head',svG('ag_hd',()=>svLoftZ([[-.42,.4,.42,0,.08],[-.05,.46,.46,0,.1],[.35,.38,.36,0,.03],[.75,.25,.25,0,-.05],[1.15,.17,.16,0,-.08],[1.38,.11,.1,0,-.1]],8)),fur);
  svM(R,'head',svG('ag_ns',()=>svLump(.13,0,.2,2)),claw,0,-.04,1.4);
  svM(R,'head',gDome,bark,0,.25,.95,-.1,0,0,.14,.07,.42);svM(R,'head',gDome,bark,0,.35,.55,-.18,0,0,.2,.08,.3);
  for(let k=0;k<5;k++)[-1,1].forEach(s=>svM(R,'head',svG('ag_tu',()=>svHorn(.04,.24,0,0,4,2)),bone,s*(.16-.015*k),-.15,.6+k*.15,1.6,0,0));
  [-1,1].forEach(s=>{svM(R,'head',svG('ag_fg',()=>svHorn(.06,.42,0,.06,5,3)),bone,s*.15,-.12,.98,1.62,0,0);
    svM(R,'head',svG('ag_hn',()=>svHorn(.13,1.45,.0,.7,6,6)),bone,s*.28,.32,-.1,-2.55,s*.5,0);svM(R,'head',svG('ag_hn2',()=>svHorn(.07,.6,0,.25,5,4)),bone,s*.42,.2,.05,-2.2,s*1.1,0);
    for(let k=0;k<3;k++)svM(R,'head',svG('ag_hr',()=>svLump(.09,0,.2,17)),bone,s*(.29+.02*k),.38+.1*k,-.2-.13*k,0,0,0,1.15-.12*k);
    svM(R,'head',gDome,bark,s*.22,.36,.22,-.25,0,-s*.55,.2,.09,.26);
    for(let k=0;k<4;k++)svM(R,'head',gStrand,fur2,s*.4,.12-.1*k,-.05+.06*k,0,Math.PI+s*.55,s*.4,.8,.8,.8+.15*k);
    for(let k=0;k<3;k++)svM(R,'head',svG('ag_run',()=>new THREE.BoxGeometry(.035,.035,.16)),vein,s*(.11+.07*k),.47-.035*k,.3-.06*k,-.2,s*(.5+.25*k),0)});
  R.J.head.scale.setScalar(1.25);
  // ears (their own joints: they twitch)
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('ear'+L,'head',s*.3,.36,-.18,-.55,0,-s*.45);
    svM(R,'ear'+L,svG('ag_ear',()=>svLoft([[-.05,.15,.06],[.3,.12,.045,0,.02],[.45,.07,.03,0,.04],[.62,.015,.015,0,.06]],4)),fur);
    svM(R,'ear'+L,svG('ag_ein',()=>svLoft([[0,.09,.02,0,.04],[.38,.04,.015,0,.06]],4)),gum);
    if(s>0)svM(R,'ear'+L,svG('ag_er',()=>new THREE.TorusGeometry(.06,.016,4,8).toNonIndexed()),iron,.08,.22,0,0,Math.PI/2,0)});
  J('jaw','head',0,-.18,.05);
  svM(R,'jaw',svG('ag_jw',()=>svLoftZ([[-.05,.32,.12],[.55,.22,.1,0,-.03],[1.15,.12,.07,0,0]],7)),fur);
  svM(R,'jaw',svG('ag_tg',()=>svLoftZ([[.1,.18,.04,0,.08],[.9,.08,.03,0,.07]],6)),gum);
  for(let k=0;k<5;k++)[-1,1].forEach(s=>svM(R,'jaw',svG('ag_tl',()=>svHorn(.035,.2,0,0,4,2)),bone,s*(.17-.018*k),.07,.4+k*.15,-1.55,0,0));
  [-1,1].forEach(s=>{svM(R,'jaw',svG('ag_fg2',()=>svHorn(.045,.3,0,-.04,5,3)),bone,s*.12,.06,.95,-1.55,0,0);
    for(let k=0;k<3;k++)svM(R,'jaw',gStrand,fur2,s*.12,-.1,.1+.2*k,2.3,0,s*.15,.6,.6,.7)});
  // the great brow eye
  J('brow','head',0,.38,.42);svM(R,'brow',svG('ag_bl',()=>svLump(.26,1,.15,9)),lid,0,0,0,0,0,0,1.15,.8,.8);
  R.big=svM(R,'brow',svG('ag_be',()=>new THREE.SphereGeometry(.2,10,8)),iris,0,.02,.12);svM(R,'brow',svG('ag_bs',()=>new THREE.BoxGeometry(.05,.3,.02)),slit,0,.02,.32);
  R.bigSpr=svSpr(R,'brow',ARG.col,.01,0,.02,.35);
  // ---- legs: long gaunt forelegs under bark pauldrons, digitigrade hind legs; caps at every joint ----
  [-1,1].forEach(s=>{const L=s>0?'L':'R';
    J('sh'+L,'chest',s*.74,-.25,.7);svM(R,'sh'+L,svG('ag_ua',()=>svLoft([[.35,.44,.5],[-.15,.46,.52,0,.04],[-.65,.32,.36,0,-.02],[-1.22,.2,.24]],8)),fur);
    svM(R,'sh'+L,gDome,bark,s*.38,.1,0,0,0,-s*Math.PI/2,.46,.18,.5);svM(R,'sh'+L,gDome,bark,s*.36,-.3,.03,0,0,-s*1.45,.34,.15,.4);
    svM(R,'sh'+L,svG('ag_ps',()=>svHorn(.07,.42,0,.12,5,3)),bone,s*.6,.3,-.1,-.5,s*1.2,0);svM(R,'sh'+L,svG('ag_ps',()=>svHorn(.07,.42,0,.12,5,3)),bone,s*.58,.05,-.2,-.2,s*1.5,0);
    for(let k=0;k<4;k++)svM(R,'sh'+L,gStrand,fur2,s*.1*(k-1.5),-.5-.12*k,-.32,2.9,0,s*.2*(k-1.5),.9,.9,.9);
    J('el'+L,'sh'+L,0,-1.2,0);svM(R,'el'+L,svG('ag_fa',()=>svLoft([[.08,.22,.25],[-.45,.2,.22,0,.03],[-1.08,.13,.15]],7)),fur);svM(R,'el'+L,gStrand,fur2,0,-.15,-.15,2.7,0,0,.8,.8,.7);
    svM(R,'el'+L,gBall,fur,0,0,0,0,0,0,.235,.25,.25);svM(R,'el'+L,svG('ag_es',()=>svHorn(.08,.5,0,.18,5,3)),bone,0,.02,-.18,-.3,Math.PI,0);
    svM(R,'el'+L,gDome,bark,0,-.42,.15,Math.PI/2,0,0,.19,.11,.34);svM(R,'el'+L,gDome,bark,0,-.75,.12,Math.PI/2,0,0,.15,.09,.26);
    J('pw'+L,'el'+L,0,-1.1,0);svM(R,'pw'+L,svG('ag_pw',()=>svLump(.24,0,.25,4)),fur,0,-.06,.12,0,0,0,1,.6,1.4);svM(R,'pw'+L,gBall,fur,0,.02,0,0,0,0,.155,.17,.16);
    for(let c=0;c<4;c++){svM(R,'pw'+L,gToe,fur,(c-1.5)*.1,-.08,.28);svM(R,'pw'+L,gClaw,claw,(c-1.5)*.1,-.08,.32,.25,0,0)}
    svM(R,'pw'+L,gClaw,claw,-s*.15,.1,-.02,.6,Math.PI-s*.4,0,.7);
    J('hp'+L,'hips',s*.6,-.2,-.45);svM(R,'hp'+L,svG('ag_th',()=>svLoft([[.35,.5,.62,0,-.05],[-.3,.46,.56,0,.1],[-.75,.3,.36,0,.22],[-1.08,.19,.22,0,.32]],8)),fur);
    svM(R,'hp'+L,gDome,bark,s*.46,-.02,.02,0,0,-s*Math.PI/2,.46,.16,.52);svM(R,'hp'+L,gDome,bark,s*.36,-.45,.15,0,0,-s*1.42,.3,.13,.36);
    for(let k=0;k<4;k++)svM(R,'hp'+L,gStrand,fur2,s*.08*(k-1.5),-.35-.1*k,-.5,2.75,0,s*.2*(k-1.5),1,1,.95);
    J('kn'+L,'hp'+L,0,-1.05,.34);svM(R,'kn'+L,svG('ag_sh',()=>svLoft([[.05,.17,.2],[-.85,.12,.14,0,-.4]],6)),fur2);svM(R,'kn'+L,gBall,fur2,0,0,0,0,0,0,.2,.21,.22);
    svM(R,'kn'+L,gDome,bark,0,-.08,.12,1.2,0,0,.16,.1,.2);
    J('hk'+L,'kn'+L,0,-.85,-.42);svM(R,'hk'+L,svG('ag_hk',()=>svLoft([[.05,.12,.13],[-.55,.1,.12,0,.08]],5)),fur2);svM(R,'hk'+L,gBall,fur2,0,0,0,0,0,0,.14,.15,.15);
    svM(R,'hk'+L,svG('ag_hs',()=>svHorn(.06,.36,0,.1,5,3)),bone,0,.02,-.1,-.25,Math.PI,0);
    svM(R,'hk'+L,svG('ag_pw',()=>svLump(.24,0,.25,4)),fur,0,-.62,.18,0,0,0,.85,.55,1.25);
    for(let c=0;c<3;c++){svM(R,'hk'+L,gToe,fur,(c-1)*.1,-.66,.32,0,0,0,.85);svM(R,'hk'+L,gClaw,claw,(c-1)*.1,-.66,.38,.25,0,0)}});
  // ---- tail: four segments, capped, bone spikes along the top, a barbed tip ----
  J('t0','hips',0,.22,-1.4,.5);let pp='t0';[.55,.5,.45].forEach((l,k)=>{J('t'+(k+1),pp,0,0,-l);pp='t'+(k+1)});
  ['t0','t1','t2','t3'].forEach((n,k)=>{const r=.24-.045*k;svM(R,n,svG('ag_t'+k,()=>svLoftZ([[0,r,r],[-.6,r*.8,r*.8]],6)),fur);svM(R,n,gBall,fur,0,0,0,0,0,0,r*1.02);
    svM(R,n,gStrand,fur2,0,.1,-.3,2.6,0,0);[-1,1].forEach(sd=>svM(R,n,gStrand,fur2,sd*r*.8,-.05,-.25,2.4,sd*.3,sd*.6,.7,.7,.7));
    svM(R,n,svG('ag_ts',()=>svHorn(.07,.38,0,-.12,5,3)),bone,0,r*.85,-.2,-1.1,Math.PI,0,1-.12*k)});
  [[0,0],[1,.5],[-1,.5],[0,-1]].forEach(([x,y])=>svM(R,'t3',svG('ag_tb',()=>svHorn(.07,.5,0,.1,5,3)),bone,x*.06,y*.05,-.62,y*.5,Math.PI+x*.45,0));
  // ---- the hundred eyes: lids, irises, slits on hide, legs, neck, face and tail (lid and slit merged into the joint) ----
  const eye=(jn,x,y,z,dx,dy,dz,sc)=>{const g=new THREE.Group();g.position.set(x,y,z);g.quaternion.setFromUnitVectors(Z,new V3(dx,dy,dz).normalize());g.updateMatrix();
    const J0=R.J[jn],m1=svM(R,J0,svG('ag_lid',()=>svLump(1,0,.2,5)),lid,0,0,0,0,0,0,sc*1.15,sc*.9,sc*.7),ir=svM(R,J0,svG('ag_eye',()=>new THREE.SphereGeometry(1,8,6)),iris,0,0,sc*.4,0,0,0,sc*.82,sc*.62,sc*.5),
      m3=svM(R,J0,svG('ag_slit',()=>new THREE.BoxGeometry(.18,1,.1)),slit,0,0,sc*.85,0,0,0,sc,sc*.85,sc);
    [m1,ir,m3].forEach(m=>{m.updateMatrix();m.applyMatrix4(g.matrix)});ir.userData.noMerge=1;R.eyes.push({ir,s:sc,b:((R.eyes.length*2.39)%6)})};
  const EY=[['chest',.92,.25,.3],['chest',.98,-.15,.75],['chest',.86,.45,1.15],['chest',.7,-.55,.2],['chest',.6,.75,.55],['chest',.95,.05,-.25],
    ['hips',.78,.25,-.6],['hips',.7,-.1,-1.0],['hips',.55,.45,.0],['neck',.5,.1,.55],['neck',.42,.25,1.0],['shL',.36,-.3,.12],['hpL',.43,-.25,.1],['head',.36,.15,.25],
    ['head',.27,.1,.62],['elL',.2,-.55,.05],['body',.66,-.42,-.25]];
  EY.forEach(([j,x,y,z],k)=>[-1,1].forEach(s=>{if(s<0&&k%5==4&&j!=='head')return;const jn=s<0?j.replace(/L$/,'R'):j,sc=(.11+.05*((k*7)%3))*(j==='head'&&k>13?.75:j==='elL'?.7:1);
    eye(jn,s*x,y,z,s,y*.6,j==='head'?.9:.15,sc)}));
  eye('t1',0,.2,-.25,0,1,-.3,.12);eye('t3',0,0,-.5,0,.2,-1,.13);eye('neck',0,-.48,.7,0,-1,.3,.12);
  R.root.traverse(o=>{if(o.isMesh)o.castShadow=true});
}
// procedural base: breathing, a seamless walk (smooth paw lifts), ear twitches, a swaying tail
function argLoco(e,S,O,dt,now){const t=now/1000,sp=Math.min(1.6,S.spd/2.4);S.gp=(S.gp||0)+dt*(2.2+S.spd*1.25);const g=S.gp,a=Math.min(1,sp);
  const br=Math.sin(t*1.6);O.body[4]+=.05*br*(1-a)+.07*(.5-.5*Math.cos(g*2))*a;O.body[0]+=.02*br;O.chest[0]+=-.02*br;O.body[2]+=.035*Math.sin(g)*a;
  O.neck[0]+=.05*Math.sin(t*.9)*(1-a)-.05*Math.sin(g*2)*a;O.neck[1]+=.12*Math.sin(t*.53)*(1-a*.6);O.head[1]+=.1*Math.sin(t*.71+1)*(1-a*.5);O.head[0]+=.04*Math.sin(g*2+.6)*a;O.jaw[0]+=.04+.03*Math.sin(t*2.3);
  // ears: a slow drift plus a quick twitch now and then (smooth bump, no snap)
  const tw=q=>{const u=(t+q)%4.7;return u<.35?Math.sin(u/.35*Math.PI):0};O.earL[0]+=.06*Math.sin(t*.8)-.25*tw(0);O.earR[0]+=.06*Math.sin(t*.8+1)-.25*tw(2.3);O.earL[2]+=.08*tw(0);O.earR[2]+=-.08*tw(2.3);
  // gait: diagonal pairs; lifts are squared so they ease in and out of the ground contact
  const lift=c=>c>0?c*c:0;
  [['L',0],['R',Math.PI]].forEach(([s,ph])=>{const fs=Math.sin(g+ph)*.5*a,fc=lift(Math.cos(g+ph)),hs=Math.sin(g+ph+Math.PI)*.45*a,hc=lift(Math.cos(g+ph+Math.PI));
    O['sh'+s][0]+=-fs;O['el'+s][0]+=fc*.75*a;O['pw'+s][0]+=-fc*.55*a;
    O['hp'+s][0]+=-hs;O['kn'+s][0]+=hc*.5*a;O['hk'+s][0]+=-hc*.6*a});
  ['t0','t1','t2','t3'].forEach((n,k)=>{O[n][1]+=Math.sin(t*1.7-k*.7)*(.12+.05*k)*(1+a);O[n][0]+=-.05*k+.04*Math.sin(t*1.1-k)})}
// eyes: blink, open wide in Phase II, flare with the moves; veins burn with the eyes
function argPost(e,S,dt,now){const R=S.R,t=now/1000,open=S.ph>1?1:.45,fl=S.eyeF||0;S.eyeF=Math.max(0,fl-dt*1.5);
  R.eyes.forEach(E=>{let k=open;const bl=(t+E.b)%(S.ph>1?5.2:3.4);if(bl<.14)k*=.15+.85*Math.abs(bl-.07)/.07;E.ir.scale.y=E.s*.62*k*(1+fl*.3);E.ir.scale.x=E.s*.82*(1+fl*.3)});
  const c=S.ph>1?ARG.col:ARG.dim;if(R._ic!==c+fl){R._ic=c+fl;R.iris.color.setHex(c).lerp(new THREE.Color(0xffffff),Math.min(.85,fl*.6))}
  const vk=Math.min(1,(S.ph>1?.55:.12)+fl*.35+.08*Math.sin(t*2.2)),vq=Math.round(vk*40);if(R._vq!==vq){R._vq=vq;R.vein.color.setHex(ARG.vein).lerp(new THREE.Color(ARG.veinH),vq/40)}
  const bc=S.bigC||0;R.bigSpr.scale.setScalar(.05+bc*2.2+(S.ph>1?.25:0)*(1+.15*Math.sin(t*5)))}
var ARGP={
  // rending claws (right), mirrored for the left with '~'
  cUp:{body:[-.16,-.32,.1,0,.18,-.1],chest:[0,-.1,0],neck:[-.25,-.25,0],head:[.3,-.15,.1],jaw:[.35,0,0],shR:[-1.75,0,-.6],elR:[1.05,0,0],pwR:[.7,0,0],shL:[.2,0,.1],elL:[-.1,0,0],hips:[0,.12,0],earL:[-.4,0,0],earR:[-.4,0,0]},
  cHit:{body:[.14,.38,-.08,0,-.08,.35],chest:[.05,.15,0],neck:[.15,.3,0],head:[-.05,.25,0],jaw:[.1,0,0],shR:[-.85,0,.55],elR:[.15,0,0],pwR:[-.35,0,0],shL:[.25,0,0],hips:[0,-.15,0]},
  cRec:{body:[.06,.18,-.03,0,-.05,.12],neck:[.08,.15,0],shR:[-.35,0,.2],elR:[.25,0,0],hips:[0,-.06,0]},
  // lunging bite
  coil:{body:[.2,0,0,0,-.55,-.35],chest:[.08,0,0],neck:[.32,0,0],head:[-.38,0,0],jaw:[.3,0,0],shL:[.55,0,.08],shR:[.55,0,-.08],elL:[-.4,0,0],elR:[-.4,0,0],hpL:[-.45,0,0],hpR:[-.45,0,0],knL:[.75,0,0],knR:[.75,0,0],hkL:[-.4,0,0],hkR:[-.4,0,0],earL:[-.5,0,0],earR:[-.5,0,0]},
  lunge:{body:[-.08,0,0,0,.1,.3],neck:[-.15,0,0],head:[.28,0,0],jaw:[.8,0,0],shL:[-1.25,0,0],shR:[-1.1,0,0],elL:[-.15,0,0],elR:[-.3,0,0],hpL:[.75,0,0],hpR:[.6,0,0],knL:[-.35,0,0],knR:[-.3,0,0],t0:[-.3,0,0]},
  bite:{body:[.12,0,0,0,-.12,.35],neck:[.12,0,0],head:[.32,0,0],jaw:[-.06,0,0],shL:[-.35,0,0],shR:[-.25,0,0],hpL:[.3,0,0],hpR:[.25,0,0]},
  // tail lash: it looks back first
  look:{body:[0,-.32,0],hips:[0,.4,-.05],neck:[-.1,-.7,0],head:[.1,-.55,.1],jaw:[.25,0,0],t0:[-.65,.7,0],t1:[-.25,.45,0],t2:[-.15,.35,0],t3:[0,.25,0],hpL:[.2,0,0]},
  lash:{body:[0,.38,0],hips:[0,-.6,.05],neck:[.05,-.3,0],head:[0,-.25,0],t0:[-.35,-1.25,0],t1:[-.1,-.8,0],t2:[0,-.6,0],t3:[0,-.45,0],hpR:[.25,0,0]},
  // the gaze: rear up, the brow eye charges, fire
  rear:{body:[-.55,0,0,0,.35,-.45],chest:[-.05,0,0],hips:[.45,0,0],hpL:[.35,0,0],hpR:[.35,0,0],knL:[.35,0,0],knR:[.35,0,0],hkL:[-.5,0,0],hkR:[-.5,0,0],shL:[-.75,0,.1],shR:[-.75,0,-.1],elL:[1.25,0,0],elR:[1.25,0,0],pwL:[.6,0,0],pwR:[.6,0,0],neck:[.05,0,0],head:[.42,0,0],jaw:[.25,0,0],t0:[.3,0,0]},
  fire:{body:[-.42,0,0,0,.28,-.6],hips:[.38,0,0],hpL:[.3,0,0],hpR:[.3,0,0],knL:[.3,0,0],knR:[.3,0,0],hkL:[-.45,0,0],hkR:[-.45,0,0],shL:[-.55,0,.1],shR:[-.55,0,-.1],elL:[1.0,0,0],elR:[1.0,0,0],neck:[.2,0,0],head:[.28,0,0],jaw:[.6,0,0]},
  // pounce
  pcr:{body:[.22,0,0,0,-.7,-.35],chest:[.06,0,0],neck:[.25,0,0],head:[-.28,0,0],jaw:[.2,0,0],shL:[.5,0,.12],shR:[.5,0,-.12],elL:[-.55,0,0],elR:[-.55,0,0],hpL:[-.7,0,0],hpR:[-.7,0,0],knL:[1.05,0,0],knR:[1.05,0,0],hkL:[-.6,0,0],hkR:[-.6,0,0],t0:[.4,0,0],earL:[-.6,0,0],earR:[-.6,0,0]},
  air:{root:[0,0,0,0,3.6,0],body:[-.25,0,0],neck:[-.1,0,0],head:[.2,0,0],jaw:[.7,0,0],shL:[-1.35,0,.15],shR:[-1.35,0,-.15],elL:[-.2,0,0],elR:[-.2,0,0],pwL:[-.5,0,0],pwR:[-.5,0,0],hpL:[1.0,0,0],hpR:[1.0,0,0],knL:[-.6,0,0],knR:[-.6,0,0],t0:[-.5,0,0],t1:[-.2,0,0]},
  land:{root:[0,0,0,0,0,0],body:[.32,0,0,0,-.6,.15],neck:[.35,0,0],head:[.05,0,0],jaw:[.1,0,0],shL:[-.4,0,.3],shR:[-.4,0,-.3],elL:[.65,0,0],elR:[.65,0,0],hpL:[-.35,0,0],hpR:[-.35,0,0],knL:[.7,0,0],knR:[.7,0,0],hkL:[-.4,0,0],hkR:[-.4,0,0]},
  // howl (awakening) and the intro
  howl:{body:[-.62,0,0,0,.42,-.5],chest:[-.1,0,0],hips:[.45,0,0],hpL:[.35,0,0],hpR:[.35,0,0],hkL:[-.45,0,0],hkR:[-.45,0,0],neck:[-.75,0,0],head:[-.35,0,0],jaw:[1.0,0,0],shL:[-.9,0,.2],shR:[-.9,0,-.2],elL:[1.35,0,0],elR:[1.35,0,0],t0:[-.7,0,0],t1:[-.3,0,0],earL:[-.7,0,0],earR:[-.7,0,0]},
  low:{body:[.3,0,0,0,-.8,0],neck:[.55,0,0],head:[.2,0,0],jaw:[0,0,0],shL:[.35,0,.35],shR:[.35,0,-.35],elL:[-.3,0,0],elR:[-.3,0,0],hpL:[-.5,0,0],hpR:[-.5,0,0],knL:[.9,0,0],knR:[.9,0,0],hkL:[-.5,0,0],hkR:[-.5,0,0],t0:[.5,0,0]},
  // blinding flare: hunch, every eye brightens, then flash
  hunch:{body:[.25,0,0,0,-.5,-.1],chest:[.1,0,0],neck:[.4,0,0],head:[.35,0,0],shL:[.3,0,.45],shR:[.3,0,-.45],elL:[-.2,0,0],elR:[-.2,0,0],hpL:[-.4,0,.2],hpR:[-.4,0,-.2],knL:[.7,0,0],knR:[.7,0,0],t0:[.5,0,0],t1:[.3,0,0],earL:[-.6,0,.2],earR:[-.6,0,-.2]},
  flare:{body:[-.3,0,0,0,.25,0],neck:[-.35,0,0],head:[-.4,0,0],jaw:[1.0,0,0],shL:[-.4,0,-.25],shR:[-.4,0,.25],hpL:[.2,0,0],hpR:[.2,0,0],t0:[-.6,0,0]},
  // barrage: stand tall, eyes fire
  tall:{body:[-.18,0,0,0,.2,0],neck:[-.25,0,0],head:[.15,0,0],jaw:[.4,0,0],shL:[-.15,0,-.12],shR:[-.15,0,.12],t0:[-.4,0,0]},
  tallB:{body:[-.22,.12,0,0,.25,0],neck:[-.3,.12,0],head:[.12,0,0],jaw:[.5,0,0],t0:[-.45,.3,0]},
  // v112 whirling rend: coil low and twisted (legs splayed, tail wrapped forward), spin with everything flung out, reel
  wcoil:{body:[.12,.7,.08,0,-.6,-.1],chest:[.05,.25,0],hips:[0,-.55,0],neck:[.3,.55,.1],head:[-.25,.35,.15],jaw:[.45,0,0],shL:[.45,0,.5],shR:[.3,0,-.62],elL:[-.45,0,0],elR:[-.35,0,0],pwL:[.3,0,0],pwR:[.3,0,0],
    hpL:[-.5,0,.32],hpR:[-.5,0,-.32],knL:[.85,0,0],knR:[.85,0,0],hkL:[-.5,0,0],hkR:[-.5,0,0],t0:[.15,1.05,0],t1:[0,.6,0],t2:[0,.5,0],t3:[0,.4,0],earL:[-.6,0,.15],earR:[-.6,0,-.15]},
  wspin:{body:[-.05,-.45,-.28,0,-.25,0],chest:[0,-.2,0],hips:[0,.35,0],neck:[-.15,-.6,0],head:[.1,-.35,0],jaw:[.7,0,0],shL:[-.95,0,.95],shR:[-.95,0,-.95],elL:[.35,0,0],elR:[.35,0,0],pwL:[-.45,0,0],pwR:[-.45,0,0],
    hpL:[-.2,0,.3],hpR:[-.2,0,-.3],knL:[.45,0,0],knR:[.45,0,0],hkL:[-.3,0,0],hkR:[-.3,0,0],t0:[-.35,-1.1,0],t1:[0,-.55,0],t2:[0,-.45,0],t3:[0,-.35,0],earL:[-.7,0,0],earR:[-.7,0,0]},
  wdizzy:{body:[.25,-.1,-.12,0,-.45,0],neck:[.5,.15,-.22],head:[.3,-.15,.3],jaw:[.3,0,0],shL:[.2,0,.22],shR:[.32,0,-.15],elL:[-.25,0,0],elR:[-.1,0,0],hpL:[-.3,0,.12],hpR:[-.3,0,-.1],knL:[.5,0,0],knR:[.5,0,0],hkL:[-.25,0,0],hkR:[-.25,0,0],t0:[.3,.2,0],earL:[.3,0,.3],earR:[.2,0,-.3]},
  // v112 amber furrow: rear high on the hind legs, forepaws lifted and glowing, then slam them down
  frear:{body:[-.66,0,0,0,.56,-.6],chest:[-.1,0,0],hips:[.5,0,0],hpL:[.45,0,0],hpR:[.45,0,0],knL:[.25,0,0],knR:[.25,0,0],hkL:[-.62,0,0],hkR:[-.62,0,0],shL:[-1.8,0,.28],shR:[-1.8,0,-.28],elL:[.95,0,0],elR:[.95,0,0],pwL:[.85,0,0],pwR:[.85,0,0],
    neck:[-.2,0,0],head:[.4,0,0],jaw:[.45,0,0],t0:[.45,0,0],t1:[.2,0,0],earL:[-.5,0,0],earR:[-.5,0,0]},
  fslam:{body:[.36,0,0,0,-.62,.45],chest:[.08,0,0],hips:[-.15,0,0],hpL:[-.28,0,0],hpR:[-.28,0,0],knL:[.55,0,0],knR:[.55,0,0],hkL:[-.35,0,0],hkR:[-.35,0,0],shL:[-.6,0,.22],shR:[-.6,0,-.22],elL:[-.3,0,0],elR:[-.3,0,0],pwL:[.55,0,0],pwR:[.55,0,0],
    neck:[.42,0,0],head:[-.22,0,0],jaw:[.8,0,0],t0:[-.55,0,0],t1:[-.2,0,0],earL:[-.8,0,0],earR:[-.8,0,0]},
  // v112 searing sweep: sit back on the haunches, head turned to its left (mirrored: to its right) — the beam sweeps between
  swA:{body:[-.24,.1,0,0,-.18,-.35],chest:[0,.22,0],hips:[.28,0,0],hpL:[.38,0,0],hpR:[.38,0,0],knL:[.38,0,0],knR:[.38,0,0],hkL:[-.52,0,0],hkR:[-.52,0,0],shL:[-.4,0,.14],shR:[-.4,0,-.14],elL:[.55,0,0],elR:[.55,0,0],pwL:[.2,0,0],pwR:[.2,0,0],
    neck:[-.05,.6,.05],head:[.22,.42,.12],jaw:[.6,0,0],t0:[.3,-.5,0],t1:[0,-.3,0],earL:[-.6,0,0],earR:[-.6,0,0]},
  // stagger and death
  stag:{body:[.38,0,.28,0,-1.0,0],neck:[.6,0,.25],head:[.35,0,.35],jaw:[.5,0,0],shL:[.85,0,.5],shR:[.4,0,-.2],elL:[-1.1,0,0],elR:[-.4,0,0],hpL:[-.7,0,.2],hpR:[-.4,0,0],knL:[1.2,0,0],knR:[.9,0,0],hkL:[-.6,0,0],t0:[.6,0,0],t1:[.3,0,0],earL:[.5,0,.3],earR:[.4,0,-.3]},
  dead:{root:[0,0,1.42,0,-.1,0],body:[.1,0,0,0,-1.3,0],neck:[.3,.3,0],head:[.2,.2,0],jaw:[.7,0,0],shL:[-.4,0,.2],shR:[-.7,0,-.1],elL:[.3,0,0],hpL:[.3,0,0],hpR:[.5,0,0],knL:[-.4,0,0],t0:[.2,.4,0],t1:[0,.4,0],earL:[.6,0,0],earR:[.6,0,0]}};
function argEyeBolt(c,i){const e=c.e,S=c.S,R=S.R,E=R.eyes[(i*7+3)%R.eyes.length],p=new THREE.Vector3();E.ir.getWorldPosition(p);
  const q=c.inA(pl.position.clone().add(new THREE.Vector3(((pl.mvd&&pl.mvd.x)||0)*.9,0,((pl.mvd&&pl.mvd.z)||0)*.9)),.8),S2={k:'c',r:1.9},an={x:q.x,z:q.z,a:0},T=.72;
  S.eyeF=1;kqFlash(p,ARG.col,1.4,200);svSnd('crack',.5,1.6);c.M.warn.push(svWarn(S2,an,T));
  svShot(p,new THREE.Vector3(q.x,GH(q.x,q.z)+.3,q.z),T,ARG.col,1.3,3.5,P=>{if(e.dead||!AF)return;burst(P,ARG.col,18,2.5,2.4,.5);svShock(P,ARG.col,1.9,.3);svDecal(P,0x3a2a08,1.4,2.4,.5);svHitNow(e,S2,an,.75,{})})}
function argBeamGeo(){return svG('ag_bm',()=>{const q=new THREE.CylinderGeometry(1,1,1,8,1,true);q.translate(0,.5,0);q.rotateX(Math.PI/2);return q})}
function argBeam(c,an,L){const e=c.e,o=svWP(e,'brow',0,.02,.3),end=new THREE.Vector3(an.x+Math.sin(an.a)*L,0,an.z+Math.cos(an.a)*L);end.y=GH(end.x,end.z)+.4;
  const d=end.clone().sub(o),len=d.length(),g=argBeamGeo();
  const m1=new THREE.MeshBasicMaterial({color:ARG.col,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),m2=new THREE.MeshBasicMaterial({color:0xfff8e0,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  const b1=new THREE.Mesh(g,m1),b2=new THREE.Mesh(g,m2);[b1,b2].forEach(b=>{b.position.copy(o);b.lookAt(end);b.renderOrder=24;b.frustumCulled=false;scene.add(b)});b1.scale.set(.7,.7,len);b2.scale.set(.22,.22,len);
  let t=0;shake(.25);svSnd('charge',.4,2);kqFlash(o,0xffffff,4,260);for(let s=2;s<L;s+=1.4){const q=new THREE.Vector3(an.x+Math.sin(an.a)*s,0,an.z+Math.cos(an.a)*s);burst(gY(q,.3),ARG.col,3,1.2,1.6,.5);if(s%2.8<1.4)svDecal(q,0x2a1a04,1.1,3,.6)}
  kqFx({tick(dt){t+=dt||0;const k=t/.42;b1.scale.x=b1.scale.y=.7*(1-k*.8);b2.scale.x=b2.scale.y=.22*(1-k);m1.opacity=.8*(1-k);return k<1},end(){scene.remove(b1,b2);m1.dispose();m2.dispose()}})}
// ---- v112 effects ----
// whirling rend: two golden scything rings that sweep round the boss as it spins (custom meshes on the game clock)
function argWhirlFx(c){const e=c.e,m=e.m,p=m.position.clone(),y0=GH(p.x,p.z);const L=[];
  [[1.15,ARG.col,.85,1.45],[.55,0xfff0c0,1,1.25]].forEach(([h,col,op,arc])=>{const g=svG('ag_wr'+arc,()=>new THREE.RingGeometry(.84,1,40,1,0,Math.PI*arc).rotateX(-Math.PI/2)),
    mt=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),o=new THREE.Mesh(g,mt);
    o.position.set(p.x,y0+h,p.z);o.renderOrder=23;o.userData.lpsSkip=1;scene.add(o);L.push({o,mt,op})});
  let t=0;const T=.55;kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/T);L.forEach((q,i)=>{const s=2+4.3*svEase.o(k);q.o.scale.set(s,1,s);q.o.rotation.y=m.rotation.y+(i?.8:0)-k*5;q.mt.opacity=q.op*(1-k*k)});return k<1&&!e.dead},
    end(){L.forEach(q=>{scene.remove(q.o);q.mt.dispose()})}})}
// amber furrow: a cluster of amber spikes at one circle of the line (the hit is checked once per move)
function argSpikeMat(){return ARG.spk||(ARG.spk=new THREE.MeshStandardMaterial({color:ARG.amb,emissive:0x6a3400,roughness:.35,metalness:.15,flatShading:true}))}
function argSpikeAt(c,an,k,li){const p=new THREE.Vector3(an.x,0,an.z),A=c.A,mat=argSpikeMat();
  if(A&&Math.hypot(p.x-A.cx,p.z-A.cz)>ARENA_R-1)return;
  const rn=c.rnd;for(let q=0;q<3;q++){const a=rn()*6.28,r=q?.55+rn()*.4:0;svSpike(new THREE.Vector3(p.x+Math.cos(a)*r,0,p.z+Math.sin(a)*r),mat,q?1.1+rn()*.6:2.1+k*.08,q?.26:.42,1.25+k*.03,.6)}
  burst(gY(p,.4),ARG.amb,10,2.4,2.6,.5);burst(gY(p,.2),0x3a2c1c,8,2,1.5,.6);svDecal(p,0x241608,1.5,3.2,.6);
  if(li===0){svSnd('crack',.55,.8+k*.07);if(k===0)shake(.2)}
  if(!c.M.an.got&&c.hit({k:'c',r:1.45},an,.95,{kb:1.6}))c.M.an.got=1}
function argFurrow(ph,lines){const hit=[],N=7;lines.forEach((da,li)=>{for(let k=0;k<N;k++){const d=2.7+k*1.9,t=1.2+k*.085;
    hit.push({t,s:{k:'c',r:1.45},w:t-.42,nohit:1,o:c=>{const a=c.m.rotation.y+da,p=c.m.position;return {x:p.x+Math.sin(a)*d,z:p.z+Math.cos(a)*d,a}},fx:(c,an)=>argSpikeAt(c,an,k,li)})}});
  return {wt:7,cd:8,r:[5.5,16],a:'f',ph,ph1only:ph===1,dur:2.75,lock:.38,armor:1,trn:[[0,.38,3.2]],
    trk:[[.55,'frear','io'],[1.02,'frear','l',.025],[1.17,'fslam','s'],[1.9,'fslam','l',.008],[2.75,'cRec','io']],hit,
    ev:[[.12,c=>{svSnd('hiss',.45,.7);c.S.eyeF=.6}],[.45,c=>{svSnd('charge',.5,.55);svCharge(c.e,'pwL',ARG.amb,1.2,.75,0,-.1,.2);svCharge(c.e,'pwR',ARG.amb,1.2,.75,0,-.1,.2)}],
      [1.16,c=>{svSnd('heavy',1,.85);shake(.35);[[-1,'pwR'],[1,'pwL']].forEach(([s,j])=>{const p=svWP(c.e,j,0,-.1,.2);p.y=0;svShock(p,ARG.amb,2.6,.4);burst(gY(p,.3),0x5a4a30,20,3,2.4,.6)})}]],rec:.35}}
// searing sweep: the brow beam follows the head across the cone; the hit is a wedge between last frame's and this frame's angle
function argSweepYaw(e){const a=svWP(e,'brow',0,0,0),b=svWP(e,'brow',0,0,1);return Math.atan2(b.x-a.x,b.z-a.z)}
function argSweepStart(c){const e=c.e,M=c.M,g=argBeamGeo(),L=21;
  const m1=new THREE.MeshBasicMaterial({color:ARG.col,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),m2=new THREE.MeshBasicMaterial({color:0xfff6d8,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  const b1=new THREE.Mesh(g,m1),b2=new THREE.Mesh(g,m2),tip=kqSpr(0xffe090,2.6);[b1,b2].forEach(b=>{b.renderOrder=24;b.frustumCulled=false;scene.add(b)});scene.add(tip);
  const B={b1,b2,tip,m1,m2,L,y:argSweepYaw(e),t:0,dc:0,kill(){scene.remove(b1,b2,tip);m1.dispose();m2.dispose()}};M.an.sw=B;M.fx.push(()=>B.kill());
  kqFlash(svWP(e,'brow',0,.02,.3),0xffffff,4,260);svSnd('charge',.5,2.2);svSnd('hum',.8,.8);shake(.2);argSweepTick(c,0)}
function argSweepTick(c,dt){const e=c.e,M=c.M,B=M.an.sw;if(!B)return;const m=e.m,o=svWP(e,'brow',0,.02,.3),y1=argSweepYaw(e),y0=B.y;B.y=y1;B.t+=dt;
  const end=new THREE.Vector3(m.position.x+Math.sin(y1)*B.L,0,m.position.z+Math.cos(y1)*B.L);end.y=GH(end.x,end.z)+.3;const len=o.distanceTo(end),w=1+.12*Math.sin(B.t*40);
  [B.b1,B.b2].forEach(b=>{b.position.copy(o);b.lookAt(end)});B.b1.scale.set(.62*w,.62*w,len);B.b2.scale.set(.2,.2,len);B.tip.position.copy(end);
  B.dc-=dt;if(B.dc<=0){B.dc=.07;const s=4+c.rnd()*(B.L-4),q=new THREE.Vector3(m.position.x+Math.sin(y1)*s,0,m.position.z+Math.cos(y1)*s);svDecal(end,0x2a1804,1.3,3.2,.6);svDecal(q,0x2a1804,.9,2.4,.45);burst(gY(end,.3),ARG.col,5,2,2.2,.45)}
  if(!M.an.got&&dt>0&&AF){const da=svAng(y1-y0),an={x:m.position.x,z:m.position.z,a:y0+da/2},S={k:'a',r:B.L+.5,h:Math.abs(da)/2+.07};
    if(svIn(S,an,pl.position,.35)&&svHitNow(e,S,an,1.5,{flash:false,kb:2}))M.an.got=1}}
var ARGM={
  intro:{dur:2.6,trk:[[.3,'low','io'],[.9,'low','io',.01],[1.5,'howl','o'],[2.2,'howl','l',.02],[2.6,'cRec','io']],trn:[[0,2.6,1.5]],
    ev:[[.95,c=>{c.S.eyeF=1.2;svSnd('hum',.6)}],[1.45,c=>{svSnd('roar',1);shake(.35);c.S.bigC=.4;svShock(c.m.position,ARG.col,8,.8)}],[2.4,c=>{c.S.bigC=0}]]},
  claw:{wt:10,cd:2.4,r:[0,6.2],a:'f',mel:1,dur:1.3,lock:.48,trk:[[.5,'cUp','io'],[.66,'cUp','l',.02],[.8,'cHit','s'],[1.0,'cRec','io'],[1.3,'cRec','io']],
    hit:[{t:.78,s:{k:'a',r:5.6,h:1.05},f:.3,dm:1.05}],tr:[[.68,.86,'pwR',[0,-.1,.75],[0,0,0],0xffe8a0]],ev:[[.18,c=>svSnd('hum',.25,1.5)],[.7,c=>svSnd('swing',.8)]],
    nx:[['claw2',.65,7]],rec:.2},
  claw2:{dur:1.15,mel:1,lock:.3,trk:[[.36,'cUp~','io'],[.5,'cUp~','l',.02],[.64,'cHit~','s'],[.85,'cRec~','io'],[1.15,'cRec~','io']],
    hit:[{t:.62,s:{k:'a',r:5.6,h:1.05},f:.3,dm:1.05}],tr:[[.52,.7,'pwL',[0,-.1,.75],[0,0,0],0xffe8a0]],ev:[[.55,c=>svSnd('swing',.8,.9)]],
    nx:[['snapF',.45,9],['flare',.3,6]],rec:.15},
  snapF:{dur:1.4,mel:1,lock:.45,trk:[[.4,'coil','io'],[.56,'coil','l',.015],[.78,'lunge','o'],[.9,'bite','s'],[1.4,'cRec','io']],
    rm:[[.58,.9,'tgt','o',1.3,6]],hit:[{t:.88,s:{k:'a',r:4.2,h:.6},f:1.2,dm:1.25,track:1,show:false}],ev:[[.58,c=>svSnd('whoosh',.8)],[.88,c=>{svSnd('crack',.8,.7);shake(.15)}]]},
  snap:{wt:8,cd:4.5,r:[4.5,11],a:'f',dur:1.75,lock:.62,trk:[[.55,'coil','io'],[.78,'coil','l',.02],[1.02,'lunge','o'],[1.14,'bite','s'],[1.75,'cRec','io']],
    rm:[[.82,1.14,9,'o']],hit:[{t:1.12,s:{k:'l',w:3,l:10.5,b:.5},f:0,dm:1.3,w:.62}],ev:[[.3,c=>svSnd('hiss',.4,.6)],[.82,c=>svSnd('whoosh',1)],[1.12,c=>{svSnd('crack',.9,.6);shake(.2);burst(gY(c.at(3),1.2),0xffe0b0,12,2,1.5,.4)}]],
    nx:[['claw',.35,6]],rec:.3},
  tail:{wt:12,cd:3.5,r:[0,7.5],a:'sb',mel:1,dur:1.3,lock:.3,trn:[[0,.3,2]],trk:[[.45,'look','io'],[.62,'look','l',.015],[.82,'lash','s'],[1.3,'cRec','io']],
    hit:[{t:.8,s:{k:'a',r:6.4,h:1.25},f:-.6,ay:Math.PI,dm:1.1,kb:3}],tr:[[.66,.9,'t3',[0,0,-.6],[0,0,0],0xc8a060]],ev:[[.3,c=>svSnd('hiss',.5)],[.72,c=>svSnd('whoosh',.9,.8)]],rec:.25},
  gaze:{wt:7,cd:7,r:[8,60],a:'any',dur:2.6,lock:1.15,trn:[[0,1.15,3]],armor:1,trk:[[.6,'rear','io'],[1.25,'rear','l',.025],[1.4,'fire','s'],[2.0,'fire','l'],[2.6,'cRec','io']],
    hit:[{t:1.38,s:{k:'l',w:2.4,l:30,b:0},f:1.5,dm:1.45,w:.95,fx:(c,an)=>argBeam(c,an,30)}],
    ev:[[.25,c=>{svSnd('charge',.7);svCharge(c.e,'brow',ARG.col,2.4,1.1,0,.02,.3)}],[.3,c=>{c.S.bigC=0}]],
    tk(c,dt){c.S.bigC=Math.min(1,c.M.t/1.3)*(c.M.t<1.45?1:0)},end(c){c.S.bigC=0},nx:[['gaze2',.0]],rec:.5},
  gaze2:{dur:1.6,lock:.62,ph:2,trn:[[0,.62,3.4]],armor:1,trk:[[.3,'rear','io'],[.68,'rear','l',.025],[.8,'fire','s'],[1.6,'cRec','io']],
    hit:[{t:.78,s:{k:'l',w:2.4,l:30,b:0},f:1.5,dm:1.35,w:.6,fx:(c,an)=>argBeam(c,an,30)}],ev:[[.05,c=>{svSnd('charge',.6,1.2);svCharge(c.e,'brow',ARG.col,2,.7,0,.02,.3)}]],rec:.6},
  pounce:{wt:9,cd:6,r:[6.5,24],a:'fs',dur:2.1,lock:.6,armor:1,trn:[[0,.6,4]],trk:[[.5,'pcr','io'],[.62,'pcr','l',.02],[.92,'air','o'],[1.2,'land','i'],[1.75,'land','l'],[2.1,'cRec','io']],
    rm:[[.64,1.2,'tgt','l',.3,26]],hit:[{t:1.2,s:{k:'c',r:3.8},o:'tgt',dm:1.5,w:.62,kb:2.5,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);svShock(p,0xc8b080,5,.5);burst(gY(p,.4),0x5a4a30,40,4,3,.8);svDecal(p,0x1a1408,3,4,.6);shake(.4);svSnd('heavy',1)}}],
    ev:[[.62,c=>svSnd('whoosh',1,.7)]],rec:.35},
  // ---- v112: Whirling Rend (close, any side) ----
  whirl:{wt:7,cd:9,r:[0,6],a:'any',dur:2.45,lock:.5,trn:[[0,.5,3]],trk:[[.45,'wcoil','io'],[.86,'wcoil','l',.025],[1.0,'wspin','o'],[1.42,'wspin','l'],[1.72,'wdizzy','io'],[2.1,'wdizzy','l',.012],[2.45,'cRec','io']],
    hit:[{t:1.12,s:{k:'c',r:6},dm:1.2,w:.86,kb:3.5,fx:(c,an)=>{svShock(c.m.position,ARG.col,6.5,.45);svDecal(c.m.position,0x1a1208,4.5,3.5,.5);burst(gY(c.m.position,1.3),0x2a2232,30,6,2,.7);burst(gY(c.m.position,1),ARG.col,24,7,1.5,.45);shake(.3)}}],
    ev:[[.12,c=>{svSnd('hiss',.5,1.2);c.S.eyeF=.8}],[.6,c=>svSnd('hum',.4,1.6)],
      [.88,c=>{c.M.an.y0=c.m.rotation.y;svSnd('whoosh',1,.65);const tr=[svTrail(c.e,'pwR',[0,-.1,.75],[0,0,0],0xffe8a0,.24),svTrail(c.e,'pwL',[0,-.1,.75],[0,0,0],0xffe8a0,.24),svTrail(c.e,'t3',[0,0,-.7],[0,0,0],0xc8a060,.24)];c.M.an.tr=tr;tr.forEach(q=>q&&c.M.tr.push(q))}],
      [1.0,c=>{argWhirlFx(c);svSnd('swing',1,.7)}],[1.2,c=>svSnd('swing',.8,.9)],[1.5,c=>{(c.M.an.tr||[]).forEach(q=>q&&q.stop())}],[1.75,c=>svSnd('step',.6)]],
    // the spin turns the boss itself one full turn (eased), so the facing is unchanged afterwards and nothing unwinds
    tk(c,dt){const M=c.M;if(M.an.y0==null)return;const k=Math.max(0,Math.min(1,(M.t-.88)/.62)),k0=M.an.k0||0;if(k===k0)return;M.an.k0=k;c.m.rotation.y-=Math.PI*2*(svEase.io(k)-svEase.io(k0))},rec:.45},
  // ---- v112: Amber Furrow (mid range; three lines in Phase II) ----
  furrow:argFurrow(1,[0]),
  furrow3:argFurrow(2,[0,-.42,.42]),
  // ---- Phase II ----
  awaken:{dur:3.2,inv:[0,3.2],armor:1,trk:[[.4,'low','io'],[1.0,'low','l',.03],[1.45,'howl','o'],[2.6,'howl','l',.025],[3.2,'cRec','io']],trn:[[0,3,1]],
    hit:[{t:1.5,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.1,fx:c=>{svShock(c.m.position,ARG.col,10,.7);svShock(c.m.position,0xffffff,6,.45)}}],
    ev:[[.05,c=>{banner('THE EYES OPEN','Argus wakes every eye','');svSnd('hum',.8,.7)}],[1.0,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.eyeF=2;flash('rgba(255,210,80,.35)');svSnd('roar',1.1,.85);shake(.5)}],[1.6,c=>svSnd('shriek',.6,.6)]]},
  barrage:{wt:8,cd:10,ph:2,r:[5,40],a:'any',dur:3.0,armor:1,trn:[[0,3,2.2]],trk:[[.4,'tall','io'],[.7,'tall','l',.02],[1.0,'tallB','io'],[1.5,'tall','io'],[2.0,'tallB','io'],[2.4,'tall','io'],[3.0,'cRec','io']],
    ev:[[.15,c=>{svSnd('hum',.7,1.3);c.S.eyeF=1.2}]].concat([0,1,2,3,4,5,6].map(i=>[.55+i*.3,c=>argEyeBolt(c,i)])),rec:.4},
  flare:{wt:7,cd:8,ph:2,r:[0,7],a:'any',dur:2.2,armor:1,trn:[[0,.4,2]],trk:[[.45,'hunch','io'],[1.25,'hunch','l',.03],[1.38,'flare','s'],[1.8,'flare','l'],[2.2,'cRec','io']],
    hit:[{t:1.36,s:{k:'c',r:7},dm:1.6,w:1.25,fx:c=>{kqFlash(gY(c.m.position,2.5),0xffffff,14,420);flash('rgba(255,240,180,.45)');svShock(c.m.position,ARG.col,8,.45);burst(gY(c.m.position,2),ARG.col,60,6,4,.7);svSnd('crack',1,.5);shake(.35)}}],
    tk(c,dt){c.S.eyeF=c.M.t<1.4?Math.min(2,c.M.t*1.6):0},ev:[[.2,c=>svSnd('charge',.6,.6)]],rec:.6},
  // ---- v112: Searing Sweep (Phase II, in front) ----
  sweep:{wt:7,cd:11,ph:2,r:[4,20],a:'fs',dur:3.4,lock:.3,trn:[[0,.3,3]],armor:1,
    trk:[[.6,'swA','io'],[1.32,'swA','l',.025],[2.35,'swA~','io'],[2.7,'swA~','l'],[3.4,'cRec','io']],
    hit:[{t:1.32,s:{k:'a',r:21.5,h:1.32},f:0,nohit:1,w:1.0}],
    ev:[[.15,c=>{svSnd('hiss',.5,.5);c.S.eyeF=1}],[.45,c=>{svSnd('charge',.7,.8);svCharge(c.e,'brow',ARG.col,2.6,.9,0,.02,.3)}],[1.32,c=>argSweepStart(c)],[2.4,c=>{const B=c.M.an.sw;if(B){B.kill();c.M.an.sw=null}svSnd('hiss',.4,.8)}]],
    tk(c,dt){const t=c.M.t;c.S.bigC=t<1.32?Math.min(1,t/1.2):t<2.4?.7:0;c.S.eyeF=t>1.3&&t<2.4?1.2:c.S.eyeF;if(c.M.an.sw&&t<2.4)argSweepTick(c,dt)},end(c){c.S.bigC=0},rec:.55}};
// Phase II combo strings
ARGM.claw2.nx=[['snapF',.45,9],['flare',.3,7],['whirl',.2,5]];
svReg(0,{name:'Argus',col:ARG.col,body:2.3,ph2:.55,poise:.17,headJ:'head',turnA:4,
  ai:{pref:4.6,walk:2.6,run:4.2,turn:2.2,rest:[.9,1.6],ph2r:.7,strafe:.4},
  build:argBuild,loco:argLoco,post:argPost,P:ARGP,M:ARGM,
  stag:[[.25,'stag','o'],[2.0,'stag','l',.02],[2.6,'cRec','io']],stagT:2.6,
  die:[[.4,'stag','o'],[1.2,'dead','i'],[2.1,'dead','l']],
  homeY(A){return Math.atan2(Math.cos(AR&&AR.ent!=null?AR.ent:0),Math.sin(AR&&AR.ent!=null?AR.ent:0))},
  awake(e){e.sv.eyeF=1},reset(e){e.sv.eyeF=0;e.sv.bigC=0},
  dying(e,t){if(t<1.5)e.sv.eyeF=Math.max(0,1-t)}});
// ---- the den's warning sign (v112: the current moveset) ----
DSTXT[0]={den:'The Drowned Hollow',zone:'Kindlelight',
  atk:[['🐾 Rending Claws','In front and close: the right paw rises and trembles, then rakes a wide arc; often followed by a left backhand and a snapping bite.','Dash through the swing toward its open side, or step back out of the arc once the paw rises.'],
   ['🦴 Tail Lash','Behind or beside it: it looks back over its shoulder, then the tail sweeps the rear arc and knocks you away.','When it turns its head toward you from the side, get out of the rear arc or dash through the tail.'],
   ['🐺 Lunging Bite','Mid range: it coils low, then lunges down a red lane and bites.','Step sideways off the lane — backing away straight keeps you in it.'],
   ['🌀 Whirling Rend','Close, on any side: it coils low and twisted and shudders, then spins a full turn with claws and tail out (red circle, knock-back).','Leave the circle during the shudder, or dash through as it spins. It reels afterwards — punish it.'],
   ['🟠 Amber Furrow','Mid range: it rears up on its hind legs with glowing paws, slams them down and amber spikes burst along a line of red circles toward you. Phase II: three lines fan out.','Sidestep the line (in Phase II, stand between the lines or close to its flank).'],
   ['☄ Leaping Pounce','From afar: it crouches, leaps high and lands on the red circle where you stood.','Move or dash out of the circle as it lands, then punish the long recovery.'],
   ['👁 Hundred-Eyed Gaze','From afar: it rears, the brow eye swells with light, then a beam fires down a long red lane.','Step off the lane before the beam fires; it cannot turn once it has locked on.'],
   ['🌕 The Eyes Open','At about half health: a howl with a push-back blast round it; it cannot be hurt while it howls. Every eye opens and it rests less.','Back off and wait for the howl to end.'],
   ['✨ Eye Barrage','Phase II: it stands tall and its eyes fire bolts that land on red circles where you are heading.','Keep moving and change direction; don\'t stand still.'],
   ['💥 Blinding Flare','Phase II, close: it hunches and every eye brightens, then a blast fills a big red circle.','Run out of the circle while it hunches.'],
   ['🔆 Searing Sweep','Phase II: it sits back with its head turned aside while the brow eye charges, then the beam sweeps across the whole red cone in front of it.','Get behind or beside it, or dash through the beam as it passes.']],
  weak:['The yellow posture bar under its health fills as you hit it; when it breaks Argus is STAGGERED for a few seconds and takes +35% damage. Rearing and leaping moves finish before the stagger.',
   'Every attack has a readable wind-up (raised paw, look over the shoulder, coil, rear, swelling eye); a dash at the moment of the strike passes through it.',
   'Punish the recoveries: after the Pounce, the Whirling Rend (it reels), the Amber Furrow and the Searing Sweep it stands open for a moment.',
   'Its flank and rear are safest outside Phase II\'s flare — stay close and to the side rather than far in front of the eyes.']};
