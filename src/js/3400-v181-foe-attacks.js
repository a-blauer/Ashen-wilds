// ================= v181: foe attacks — every humanoid foe's blows solved on its own skeleton =================
// Owner: "does the weapon actually swing during the attack and does the attack look natural and fluid? … This is a big
// problem if it's not right." The foes played the hero's baked swing tracks (joint angles made for the hero's body and its
// one-handed grip), so on other proportions, stoops, two-handed weapons and polearms the blow did not land on the target:
// the orc's axe ended raised out to the side, the gharial's halberd barely moved, the off hand flailed by the head.
//
// Now each attack is described by WHERE THINGS GO, and solved every frame on the foe's own skeleton:
//   * the weapon hand's path (relative to the shoulders, in arm lengths, in the body's frame: +x toward the weapon arm,
//     +y up, +z toward the target), the elbow's direction, the weapon's direction (the blade or head lags behind the hand in
//     the wind-up and whips through at the hit) and which way its edge faces (the edge leads);
//   * the body: hips turning before the shoulders, chest twist, lean into the blow, side bend, pelvis drop and weight shift
//     (the legs are solved so the feet stay exactly where they stood);
//   * the off hand: on the haft of a two-hander, polearm or casting staff, a counterbalance for one-handers, the shield up.
// Two-bone IK puts the arm there (elbow toward its pole, a real hinge), and the hand turns so the weapon — which never moves
// inside the fist (the carry grip) — points where the description says, within what a wrist can do (flex / extend 65°,
// ulnar 35°, radial 20°, forearm turn 100°; at most 15° of tilt and 45° of roll left to the weapon in the fist, FA_FIST).
// Timeline (gameplay unchanged): s = 0→1 wind-up, 1→2 act, 2→3 recovery. Melee contact at s = 1.45 (the game's act k .45);
// projectiles leave at s = 1 (the act's start); slams and rainfire land at s = 2 (the act's end). Keys are played with a
// monotone cubic per channel: anticipation (coil, then a held, creeping coil), a fast whip into the hit, follow-through past
// it, a settle with a little overshoot. Heavier foes heave into the coil later and settle slower; daggers and ghouls snap.
// (review, Oct 31) Melee downswings begin inside the wind-up (a smooth time remap, S.rm) so the blow is visible over ~5
// frames; the weapon lifts out to the side, the follow-through ends low in front, and the recovery draws the hand in first
// (and is clamped never to reach further toward the target than the hit, S.zHit) so it can't read as a second blow.
// Blend: from the pose the earlier layers made (walk/idle, stance) into this one over the start of the wind-up and back over
// the end of the recovery; a cancelled attack (stun, death) fades out over 0.15 s. The body group's whole-body tilt and
// lunge (mTick's m.pose) is left out for the moves driven here: the lean comes from the hips and spine, feet planted.
// Regular humanoid foes only (FA_K); Sovereigns, the abeksi actors and every other model are untouched.
var FA={on:true};
// hum key -> c: class, hv: heaviness 0 (quick) … 1 (slow and heavy), sh: carries a shield, arm: unarmed style
var FA_K={
  brigand:{c:'one',hv:.3},orc:{c:'one',hv:.55},troll:{c:'one',hv:.85},hob:{c:'one',hv:.35},skel:{c:'one',hv:.2,sh:1},nagaw:{c:'one',hv:.4,sh:1},
  executioner:{c:'two',hv:.8},giant:{c:'two',hv:1},jotun:{c:'two',hv:1},vampk:{c:'two',hv:.55},knight:{c:'two',hv:.6},
  gharial:{c:'pole',hv:.6},
  vamp:{c:'dag',hv:0},bandit:{c:'dag',hv:0},ss165zealot:{c:'dag',hv:.05},
  tombpriest:{c:'staff',hv:.5},trollsh:{c:'staff',hv:.6},cultist:{c:'staff',hv:.4},shaman:{c:'staff',hv:.45},ss165caller:{c:'staff',hv:.4},
  vampm:{c:'staff',hv:.35},nagas:{c:'staff',hv:.4},revenant:{c:'staff',hv:.5},
  sling:{c:'sling',hv:.1},archer:{c:'bow',hv:.3},nagaa:{c:'bow',hv:.3},
  selem:{c:'claw',arm:'golem',hv:.6,alt:1},
  ghoul:{c:'claw',arm:'rake',hv:0,alt:1},dgwretch:{c:'claw',arm:'rake',hv:.1,alt:1},nosferatu:{c:'claw',arm:'rake',hv:.2,alt:1},wendigo:{c:'claw',arm:'rake',hv:.15,alt:1},
  akidon:{c:'claw',arm:'rake',hv:.3,alt:1},akorror:{c:'claw',arm:'rake',hv:.2,alt:1},lichen:{c:'claw',arm:'rake',hv:.5,alt:1},gargoyle:{c:'claw',arm:'rake',hv:.5,alt:1},
  yeti:{c:'claw',arm:'brute',hv:.8,alt:1},amalgam:{c:'claw',arm:'brute',hv:.9,alt:1},
  saltgolem:{c:'claw',arm:'golem',hv:1,alt:1},colossus:{c:'claw',arm:'golem',hv:1},drowned:{c:'claw',arm:'golem',hv:.7}
};
// where the off fist holds a two-handed handle (weapon units from the weapon's own handle point; − = toward the head)
var FA_OT={gs:.17,ga:-.27,hammer:-.27,halberd:-.75,staff:.32};
// the moves this file animates (others keep the older poses); the real move name is read from the enemy (signature moves
// reuse these animation names with other timings)
var FA_MOVES={strike:1,slam:1,bolt:1,rainfire:1,throw:1};
// ---------------- tracks: keys -> channels -> monotone cubic ----------------
// key fields: s; H hand [x,y,z] (arm lengths from the shoulder line: hs=1 at the weapon shoulder, 0 at the midline);
// D weapon direction; E edge facing; P elbow pole; O off hand (from the off shoulder), OP its elbow pole; ow off-hand weight;
// ot haft point (weapon units along the handle) for two-handed grips; oc the off fist slid along the haft toward the weapon
// hand (0 = its own grip, 1 = most of the way; a two-hander's coil); rw / orw wrist flex (unarmed); body: py hip yaw,
// sy spine yaw, cy chest yaw (+ = toward the weapon side), sx lean forward, sz side bend (+ = toward the weapon side), hx head
// pitch, dy pelvis drop and fz / fx weight shift forward / sideways (leg lengths).
var FA_CH={H:3,D:3,E:3,P:3,O:3,OP:3,hs:1,os:1,ow:1,ot:1,rw:1,orw:1,py:1,sy:1,cy:1,sx:1,sz:1,hx:1,dy:1,fz:1,fx:1,ad:1,ah:1,ew:1,oc:1};
var FA_DEF={H:[0,-.9,.2],D:[0,.8,.6],E:[0,0,1],P:[.4,-.9,-.3],O:[-.05,-.9,.12],OP:[-.4,-.9,-.3],hs:1,os:1,ow:1,ot:0,rw:0,orw:0,py:0,sy:0,cy:0,sx:0,sz:0,hx:0,dy:0,fz:0,fx:0,ad:0,ah:0,ew:1,oc:0};
function faTrack(keys,o){
  o=o||{};const K=[],cur=Object.assign({},FA_DEF,o.def||{});
  keys.forEach(k=>{for(const c in k)if(c!='s')cur[c]=k[c];const q={s:k.s};for(const c in FA_CH)q[c]=Array.isArray(cur[c])?cur[c].slice():cur[c];K.push(q)});
  const T=K.map(k=>k.s),C=[];
  /* an impact key (o.brk: a slam's landing): every channel arrives at full speed and stops dead there, instead of easing
     into it (the hammer struck the ground already at rest). Incoming tangent 1.5 x the segment's slope, outgoing 0. */
  const BK=(o.brk||[]).map(x=>T.indexOf(x)).filter(i=>i>0&&i<T.length-1);
  for(const c in FA_CH){const n=FA_CH[c];for(let j=0;j<n;j++){const Y=K.map(k=>n>1?k[c][j]:k[c]),M=V100A_mono(T,Y),MI=Array.from(M),MO=Array.from(M);
    BK.forEach(i=>{const sl=(Y[i]-Y[i-1])/((T[i]-T[i-1])||1e-6);MI[i]=1.5*sl;MO[i]=0;if(Math.abs(MO[i-1])>2.5*Math.abs(sl))MO[i-1]=2.5*sl});
    C.push({c,j,n,Y,MI,MO})}}
  const out={};for(const c in FA_CH)out[c]=FA_CH[c]>1?[0,0,0]:0;
  const f=function(s){const n=T.length;let x=Math.max(T[0],Math.min(T[n-1],s)),i=0;while(i<n-2&&x>T[i+1])i++;
    const h=(T[i+1]-T[i])||1e-6,t=(x-T[i])/h,t2=t*t,t3=t2*t,a=2*t3-3*t2+1,b=(t3-2*t2+t)*h,c2=-2*t3+3*t2,d=(t3-t2)*h;
    for(let m=0;m<C.length;m++){const q=C[m],v=a*q.Y[i]+b*q.MO[i]+c2*q.Y[i+1]+d*q.MI[i+1];if(q.n>1)out[q.c][q.j]=v;else out[q.c]=v}
    return out};
  f.keys=K;f.o=o;return f}
// ---------------- the attacks ----------------
var FA_A={};
function faBuild(){
  const R0={s:0,H:[0,-.85,.25],D:[0,.8,.6],E:[0,0,1],P:[.4,-.9,-.3],O:[-.05,-.9,.12],OP:[-.4,-.9,-.3],hs:1,ow:1,ot:0,py:0,sy:0,cy:0,sx:0,sz:0,dy:0,fz:0,fx:0,ad:0,ah:0};
  const RE=Object.assign({},R0,{s:3});
  // ---- one-handed (axe, club, sword): A forehand diagonal (high on the weapon side → low past the off hip), B overhead chop
  // (a lift key first takes the weapon up outside the head; the follow-through finishes low in front, across toward the off
  // hip; the recovery draws the hand in to the body first and lets the weapon rise close in, never further out than the hit)
  const REC1=[{s:2.3,H:[-.15,-.55,.18],E:[0,-.3,1],P:[.6,-.8,-.4],py:-.18,sy:-.1,cy:-.04,sx:.18,sz:.03,dy:-.06,fz:.06},
    {s:2.6,H:[-.05,-.42,.15],D:[-.05,.45,.88],E:[0,0,1],P:[.5,-.9,-.3],py:-.06,sy:-.03,cy:0,sx:.08,sz:0,dy:-.03,fz:.02,O:[-.05,-.85,.1],OP:[-.4,-.9,-.3]},
    {s:2.85,H:[0,-.65,.2],D:[0,.85,.5]},RE];
  FA_A.oneA=faTrack([R0,
    {s:.25,H:[.35,-.3,.1],D:[.7,.55,.25],E:[0,1,0],P:[1,-.4,-.3],py:.15,sy:.08,O:[.08,-.55,.4]},
    {s:.55,H:[.25,.35,-.3],D:[.4,-.3,-.85],E:[0,1,0],P:[1,.3,-.4],py:.35,sy:.2,cy:.1,sx:-.04,sz:-.06,dy:-.02,fz:-.05,O:[.15,-.3,.6],OP:[-.7,-.6,-.2]},
    {s:1,H:[.3,.42,-.36],D:[.4,-.35,-.83],py:.42,sy:.25,cy:.12,sx:-.06,sz:-.08,dy:-.03,fz:-.07,O:[.18,-.28,.62]},
    {s:1.18,H:[.2,.45,.15],D:[.25,.4,-.88],E:[0,1,0],P:[1,-.1,-.4],py:.15,sy:.05,cy:0,sx:.05,sz:0,dy:-.04,fz:0,O:[.05,-.5,.3]},
    {s:1.30,H:[-.05,.25,.6],D:[.08,.97,-.2],E:[-.4,-.3,.9],P:[.9,-.3,-.4],py:-.15,sy:-.12,cy:-.06,sx:.2,sz:.04,dy:-.05,fz:.08},
    {s:1.45,H:[-.3,-.25,.7],D:[-.35,.5,.8],E:[-.5,-.85,.1],P:[.8,-.6,-.1],py:-.25,sy:-.2,cy:-.1,sx:.25,sz:.06,dy:-.07,fz:.1,O:[-.1,-.7,-.15],OP:[-.6,-.6,-.6],ad:0,ah:0},
    {s:1.75,H:[-.45,-.55,.58],D:[-.4,.2,.9],E:[-.2,-1,.15],P:[.7,-.7,-.2],py:-.38,sy:-.24,cy:-.12,sx:.3,sz:.08,dy:-.09,fz:.12},
    {s:2,H:[-.42,-.65,.5],D:[-.35,0,.94],py:-.36,sy:-.22,cy:-.1,sx:.28,dy:-.09,fz:.11},
    ].concat(REC1.map(k=>k.s==2.3?Object.assign({},k,{D:[-.15,.5,.85]}):k)));
  FA_A.oneB=faTrack([R0,
    {s:.25,H:[.3,-.15,.12],D:[.65,.6,.2],E:[0,1,0],P:[1,-.3,-.3],py:.08,O:[.08,-.55,.4]},
    {s:.55,H:[0,.62,-.12],D:[.15,-.4,-.9],E:[0,1,0],P:[.9,.5,-.4],py:.18,sy:.1,sx:-.1,sz:-.03,dy:-.01,fz:-.05,O:[.15,-.25,.6],OP:[-.7,-.6,-.2]},
    {s:1,H:[-.02,.7,-.15],D:[.15,-.45,-.88],py:.2,sy:.12,sx:-.13,sz:-.04,dy:-.02,fz:-.06,O:[.18,-.22,.62]},
    {s:1.18,H:[-.05,.66,.22],D:[.05,.4,-.92],E:[0,1,0],P:[.9,.1,-.4],py:.05,sy:.02,sx:0,sz:0,dy:-.04,fz:0,O:[.05,-.5,.3]},
    {s:1.30,H:[-.15,.25,.6],D:[0,.97,-.2],E:[0,-.3,1],P:[.8,-.3,-.5],py:-.08,sy:-.05,sx:.28,dy:-.06,fz:.09},
    {s:1.45,H:[-.2,-.25,.7],D:[-.1,.48,.87],E:[0,-1,0],P:[.8,-.6,-.1],py:-.12,sy:-.08,sx:.32,dy:-.08,fz:.1,O:[-.1,-.7,-.15],OP:[-.6,-.6,-.6],ad:0,ah:0},
    {s:1.75,H:[-.25,-.55,.62],D:[-.1,.25,1],E:[0,-1,.15],P:[.7,-.7,-.2],sx:.36,dy:-.1,fz:.12},
    {s:2,H:[-.25,-.65,.52],D:[-.1,.02,1],sx:.34,dy:-.1,fz:.11}].concat(REC1.map(k=>k.s==2.3?Object.assign({},k,{D:[-.05,.5,.85],py:-.06,sy:-.04,cy:0}):k)));
  // ---- one-handed slam: a leaping overhead chop into the ground (contact at the act's end), the off arm up for balance
  FA_A.oneS=faTrack([R0,
    {s:.35,H:[.05,-.72,.22],D:[.05,.6,.8],E:[0,-.3,1],P:[.5,-.8,-.4],O:[-.05,-.75,.2],OP:[-.6,-.7,-.4],sx:.18,dy:-.08,fz:-.02},
    {s:.75,H:[0,.82,-.12],D:[.15,.4,-.9],E:[0,1,0],P:[.9,.5,-.3],O:[-.15,.7,.05],OP:[-.9,.4,-.2],py:.12,sy:.06,sx:-.2,sz:-.03,dy:.01,fz:-.04},
    {s:1.05,H:[-.02,.88,-.15],D:[.15,.45,-.88],sx:-.23},
    /* (the arc follows the fist's own geometry, the handle across the forearm: over the top the head hangs behind, then it
       stands up over a forward-reaching forearm, angles down onto the target over a lowering one, and lands level in front
       of hands pulled down and in, forearms hanging, elbows forward; the slam's earlier keys pointed the handle along the
       forearm, which no wrist can, and the blade spun in the hand all the way down) */
    {s:1.35,H:[-.02,.8,.12],D:[.12,.4,-.9],E:[0,1,0],P:[.9,.1,-.4],O:[-.1,.6,.25],py:.04,sx:-.08,dy:0},
    {s:1.6,H:[-.1,.32,.58],D:[0,.97,-.2],E:[0,-.3,1],P:[.8,-.3,-.5],O:[-.05,.1,.45],sx:.2,dy:-.05,fz:.04},
    {s:1.82,H:[-.12,-.2,.62],D:[-.05,.55,.83],E:[0,-1,.2],P:[.75,-.5,-.2],sx:.4,dy:-.12,fz:.07},
    {s:2,H:[-.12,-.74,.34],D:[-.05,-.2,1],E:[0,-1,0],P:[.6,.1,.8],O:[.05,-.75,.45],OP:[-.6,-.6,-.3],py:-.08,sx:.55,dy:-.2,fz:.1,ah:1},
    {s:2.25,H:[-.12,-.76,.33],D:[-.05,-.3,1],sx:.52,dy:-.19},
    {s:2.6,H:[-.1,-.55,.45],D:[0,.5,.85],E:[0,0,1],P:[.5,-.9,-.2],O:[-.05,-.8,.15],OP:[-.4,-.9,-.3],py:-.03,sx:.18,dy:-.06,fz:.03,ah:0},
    RE],{hw:[1.2,2.0],hwf:.02,hit:2,brk:[2]});
  // ---- two-handed (great axe, hammer, greatsword): A overhead smash, B big diagonal; hands together at the midline, the
  // off fist on the haft (ot: how far along the handle, from the weapon's own handle point)
  const T0=Object.assign({},R0,{ow:1});
  const REC2=[{s:2.3,H:[.05,-.55,.15],hs:.3,E:[0,-.3,1],P:[.6,-.8,-.4],OP:[-.6,-.8,-.4],py:-.05,sy:-.03,cy:0,sx:.25,sz:0,dy:-.08,fz:.06},
    {s:2.6,H:[.1,-.38,.18],hs:.45,D:[.15,.55,.82],E:[0,0,1],py:0,sy:0,sx:.1,dy:-.03,fz:.02},
    Object.assign({},RE,{s:2.85,ow:0}),RE];
  FA_A.twoA=faTrack([T0,
    {s:.25,H:[.3,-.1,.2],hs:.4,D:[.6,.65,0],E:[0,1,0],P:[1,-.3,-.3],OP:[-.6,-.6,-.2],py:.12,sy:.05},
    {s:.6,H:[.12,.72,-.15],hs:0,D:[.25,-.35,-.9],E:[0,1,0],P:[.9,.4,-.3],OP:[-.9,.4,-.3],oc:1,py:.25,sy:.12,cy:.05,sx:-.15,sz:-.05,dy:-.03,fz:-.07},
    {s:1,H:[.12,.78,-.18],D:[.25,-.4,-.88],py:.28,sy:.14,sx:-.18,sz:-.06,dy:-.04,fz:-.08},
    {s:1.18,H:[.05,.8,.1],D:[.08,.4,-.91],E:[0,1,0],P:[.9,.1,-.4],OP:[-.9,.1,-.4],oc:.6,py:.1,sy:.03,cy:0,sx:-.02,sz:0,dy:-.04,fz:0},
    {s:1.30,H:[0,.3,.6],D:[0,.97,-.2],E:[0,-.3,1],P:[.8,-.3,-.5],OP:[-.8,-.3,-.5],oc:0,py:-.03,sx:.32,dy:-.08,fz:.1},
    {s:1.45,H:[0,-.25,.7],D:[0,.5,.86],E:[0,-1,0],P:[.8,-.6,-.1],OP:[-.8,-.6,-.1],py:-.05,sy:-.05,sx:.38,dy:-.1,fz:.12,ad:0,ah:0},
    {s:1.75,H:[0,-.55,.6],D:[0,.2,1],E:[0,-1,.2],P:[.7,-.7,-.2],OP:[-.7,-.7,-.2],sx:.45,dy:-.13,fz:.14},
    {s:2,H:[0,-.68,.5],D:[0,-.05,1],sx:.43,dy:-.13,fz:.13}].concat(REC2.map(k=>k.s==2.3?Object.assign({},k,{D:[.05,.5,.85]}):k)));
  FA_A.twoB=faTrack([T0,
    {s:.25,H:[.35,-.1,.15],hs:.4,D:[.7,.6,-.05],E:[0,1,0],P:[1,-.3,-.3],OP:[-.6,-.6,-.2],py:.18,sy:.08},
    {s:.6,H:[.32,.58,-.2],hs:0,D:[.5,-.3,-.8],E:[.1,1,0],P:[1,.3,-.4],OP:[-.9,.2,-.3],oc:1,py:.4,sy:.22,cy:.1,sx:-.08,sz:-.1,dy:-.04,fz:-.07},
    {s:1,H:[.35,.62,-.24],D:[.5,-.35,-.78],py:.48,sy:.26,cy:.12,sx:-.1,sz:-.12,dy:-.05,fz:-.08},
    {s:1.18,H:[.35,.6,.2],D:[.3,.4,-.87],E:[0,1,0],P:[1,-.1,-.4],OP:[-.8,-.1,-.4],oc:.6,py:.2,sy:.1,cy:.04,sx:0,sz:-.04},
    {s:1.30,H:[.12,.3,.6],D:[.1,.97,-.2],E:[-.6,-.3,.7],P:[.8,-.3,-.5],OP:[-.8,-.3,-.5],oc:0,py:-.15,sy:-.12,sx:.24,dy:-.07,fz:.1},
    {s:1.45,H:[-.05,-.25,.7],D:[-.3,.5,.8],E:[-.6,-.8,.1],P:[.8,-.6,-.1],OP:[-.8,-.6,-.1],py:-.25,sy:-.2,cy:-.1,sx:.3,sz:.06,dy:-.1,fz:.12,ad:0,ah:0},
    {s:1.75,H:[-.3,-.52,.5],D:[-.4,.2,.9],E:[-.3,-1,.2],P:[.7,-.7,-.2],OP:[-.7,-.7,-.2],oc:1,py:-.45,sy:-.28,cy:-.12,sx:.35,sz:.08,dy:-.12,fz:.13},
    {s:2,H:[-.28,-.62,.44],D:[-.35,0,.94],py:-.42,sy:-.26,sx:.33,dy:-.12}].concat(REC2.map(k=>k.s==2.3?Object.assign({},k,{H:[0,-.55,.15],D:[-.15,.5,.85],py:-.15,sy:-.08,oc:.3}):
      /* (the hands come back out to the weapon side before the blade stands up: it rose in front of the face) */k.s==2.6?Object.assign({},k,{H:[.2,-.45,.16],hs:.8,D:[.3,.5,.81]}):k)));
  FA_A.twoS=faTrack([T0,
    {s:.35,H:[.05,-.55,.3],hs:.3,D:[.1,.6,.8],E:[0,-.3,1],P:[.5,-.8,-.4],OP:[-.5,-.8,-.4],sx:.2,dy:-.1,fz:-.02},
    {s:.75,H:[.08,.85,-.12],D:[.25,.3,-.92],P:[.9,.4,-.3],OP:[-.9,.4,-.3],oc:1,py:.12,sy:.05,sx:-.22,sz:-.03,dy:.01,fz:-.05},
    {s:1.05,H:[.08,.9,-.15],D:[.25,.35,-.9],sx:-.25},
    /* (the same arc as the one-handed slam: the head behind over the top, standing up, angled down, landing level) */
    {s:1.35,H:[.05,.82,.1],D:[.08,.4,-.91],E:[0,1,0],P:[.9,.1,-.4],OP:[-.9,.1,-.4],oc:.6,py:.04,sx:-.1,dy:0},
    {s:1.6,H:[0,.35,.58],D:[0,.97,-.2],E:[0,-.3,1],P:[.8,-.3,-.5],OP:[-.8,-.3,-.5],oc:0,sx:.2,dy:-.05,fz:.04},
    {s:1.82,H:[0,-.2,.62],D:[0,.55,.83],E:[0,-1,.2],P:[.8,-.5,-.2],OP:[-.8,-.5,-.2],oc:.5,sx:.42,dy:-.14,fz:.08},
    {s:2,H:[0,-.72,.34],D:[0,-.2,1],E:[0,-1,0],P:[.6,.1,.8],OP:[-.6,.1,.8],oc:1,py:-.04,sx:.58,dy:-.22,fz:.1,ah:1},
    {s:2.25,H:[0,-.74,.33],D:[0,-.3,1],sx:.55,dy:-.21},
    /* (the hands come back out to the weapon side before the blade stands up: it rose in front of the face) */
    {s:2.6,H:[.2,-.45,.2],hs:.8,D:[.3,.5,.81],E:[0,0,1],P:[.5,-.9,-.2],OP:[-.5,-.9,-.2],oc:.3,py:0,sx:.2,dy:-.07,fz:.03,ah:0},
    Object.assign({},RE,{s:2.88,ow:0}),RE],{hw:[1.2,2.0],hwf:.02,hit:2,brk:[2]});
  // ---- polearm (halberd): A thrust (rear hand drives from the hip, spike at the target), B sweeping chop with the axe blade
  FA_A.poleA=faTrack([T0,
    {s:.4,ew:0},{s:.6,H:[.15,-.5,-.15],hs:.6,D:[-.06,.05,1],E:[0,1,0],ad:1,P:[.6,-.8,-.4],OP:[-.6,-.8,0],py:.4,sy:.2,cy:.05,sx:.05,sz:-.04,dy:-.05,fz:-.08},
    {s:1,H:[.18,-.5,-.22],py:.45,sy:.22,sx:.06,dy:-.06,fz:-.1},
    {s:1.3,H:[.08,-.46,.05],py:.1,sy:.05,sx:.14,dy:-.07,fz:.04},
    {s:1.45,H:[0,-.43,.24],D:[-.06,.05,1],py:-.3,sy:-.18,cy:-.06,sx:.26,sz:.03,dy:-.1,fz:.2,ad:1},
    {s:1.75,H:[-.02,-.43,.27],D:[-.06,.03,1],py:-.32,sy:-.19,sx:.27,dy:-.1,fz:.21,ad:0},
    {s:2,H:[0,-.45,.2],py:-.24,sy:-.12,sx:.2,dy:-.08,fz:.15},
    {s:2.45,H:[.1,-.47,.05],hs:.8,D:[0,.45,.9],ew:1,py:0,sy:0,cy:0,sx:.06,sz:0,dy:-.03,fz:.03},
    Object.assign({},RE,{s:2.85,ow:0}),RE]);
  FA_A.poleB=faTrack([T0,
    {s:.6,H:[.25,.2,-.12],hs:.5,D:[.35,.7,-.6],E:[.1,.5,.8],P:[1,-.1,-.4],OP:[-.8,-.5,-.2],py:.4,sy:.2,cy:.1,sx:-.08,sz:-.06,dy:-.03,fz:-.06},
    {s:1,H:[.28,.3,-.2],D:[.35,.8,-.5],py:.46,sy:.24,cy:.12,sx:-.1,sz:-.08,dy:-.04,fz:-.08},
    {s:1.25,H:[.2,.2,.25],D:[.15,.95,.3],E:[-.3,0,1],py:.2,sy:.1,cy:.04,sx:0,sz:-.02},
    {s:1.35,H:[0,-.32,.27],hs:.6,D:[.05,.45,.9],py:-.15,sy:-.12,cy:-.06,sx:.28,sz:.04,dy:-.09,fz:.11,E:[-.3,-.8,.4]},
    {s:1.45,H:[0,-.42,.25],hs:.6,D:[-.1,-.22,1],E:[-.1,-1,0],P:[.8,-.5,0],OP:[-.7,-.6,.1],py:-.2,sy:-.18,cy:-.1,sx:.3,sz:.05,dy:-.1,fz:.12,ad:1},
    {s:1.75,H:[-.05,-.46,.28],D:[-.3,-.5,.8],E:[-.2,-1,.2],py:-.38,sy:-.25,cy:-.12,sx:.32,sz:.06,dy:-.12,fz:.13,ad:0},
    {s:2,H:[-.05,-.48,.26],D:[-.3,-.55,.78],py:-.36,sy:-.23,sx:.3,dy:-.12},
    {s:2.25,H:[-.04,-.5,.15],hs:.6,D:[-.22,-.45,.86],E:[0,-.3,1],P:[.6,-.8,-.4],py:-.2,sy:-.12,cy:-.05,sx:.2,dy:-.07,fz:.06},
    {s:2.42,H:[-.03,-.5,.17],hs:.7,D:[-.15,.2,.97]},
    {s:2.65,H:[-.01,-.62,.2],hs:.8,D:[-.05,.7,.7],E:[0,0,1],P:[.6,-.8,-.2],OP:[-.6,-.8,-.2],py:-.05,sy:-.03,cy:0,sx:.1,sz:0,dy:-.03,fz:.03},
    Object.assign({},RE,{s:2.85,ow:0}),RE]);
  // ---- dagger: A a quick low thrust from the hip into the gut, B a fast slash from high across; the off hand reaches to grab
  FA_A.dagA=faTrack([Object.assign({},R0,{ew:0}),
    {s:.45,H:[.08,-.5,-.25],D:[-.2,.35,1],E:[0,1,0],ad:0,ah:1,P:[.5,-.7,-.6],O:[.15,-.3,.55],OP:[-.7,-.6,-.2],py:.3,sy:.2,cy:.08,sx:.12,sz:-.04,dy:-.05,fz:-.05},
    {s:1,H:[.1,-.48,-.3],D:[-.2,.35,1],py:.34,sy:.22,cy:.1,sx:.14,dy:-.06,fz:-.06,O:[.18,-.28,.58]},
    {s:1.25,H:[0,-.4,.3],D:[-.2,.35,1]},
    {s:1.45,H:[-.15,-.25,.85],D:[-.2,.35,1],P:[.6,-.7,-.2],py:-.35,sy:-.2,cy:-.08,sx:.25,sz:.04,dy:-.08,fz:.14,O:[-.1,-.65,-.15],OP:[-.6,-.6,-.6],ah:1},
    {s:1.75,H:[-.17,-.27,.88],D:[-.2,.3,1],py:-.38,sy:-.22,sx:.27,dy:-.09,fz:.15,ah:0,ad:0},
    {s:2.1,H:[-.05,-.45,.45],D:[0,.4,1],py:-.15,sy:-.08,cy:0,sx:.12,dy:-.05,fz:.05,O:[-.05,-.8,.1],OP:[-.4,-.9,-.3]},
    RE]);
  /* (the slash keeps the blade across the forearm, as a fist holds it: back over the shoulder in the coil, standing up over
     the forward-reaching forearm as it sweeps across, the edge leading; it pointed along the forearm before, past the wrist) */
  FA_A.dagB=faTrack([R0,
    {s:.45,H:[.25,.3,-.1],D:[.45,.25,-.85],E:[-.8,.5,-.1],P:[1,-.1,-.4],O:[.15,-.3,.55],OP:[-.7,-.6,-.2],py:.32,sy:.2,cy:.1,sx:.06,sz:-.06,dy:-.04,fz:-.05},
    {s:1,H:[.28,.34,-.14],D:[.45,.28,-.85],py:.36,sy:.22,cy:.12,sx:.05,dy:-.05,fz:-.06,ah:1},
    {s:1.3,H:[.15,-.05,.62],D:[.3,.8,.5],E:[-.8,-.3,.4],py:-.15,sy:-.1,sx:.18,fz:.1},
    {s:1.45,H:[-.25,-.15,.7],D:[-.15,.75,.65],E:[-.9,-.3,0],P:[.8,-.5,0],py:-.3,sy:-.2,cy:-.1,sx:.22,sz:.05,dy:-.07,fz:.12,O:[-.1,-.65,-.15],OP:[-.6,-.6,-.6],ah:1,ad:0},
    {s:1.75,H:[-.5,-.4,.5],D:[-.55,.55,.6],E:[-.4,-1,.1],py:-.42,sy:-.26,cy:-.12,sx:.26,dy:-.08,fz:.13,ah:0},
    {s:2.1,H:[-.2,-.5,.4],D:[-.1,.3,1],E:[0,0,1],py:-.15,sy:-.08,cy:0,sx:.1,sz:0,dy:-.04,fz:.05,O:[-.05,-.8,.1],OP:[-.4,-.9,-.3]},
    RE]);
  // ---- staff cast (bolt; the bolt leaves at the act's start, s = 1): raise and gather with both hands on the staff, a held
  // charge, then thrust the staff head at the target; the off hand rides the staff
  FA_A.cast=faTrack([Object.assign({},R0,{ow:0}),
    {s:.2,ow:1},
    {s:.5,H:[.14,.1,.14],hs:.62,D:[.25,.95,-.1],E:[0,0,1],P:[.8,-.4,-.4],OP:[-.8,-.4,-.3],py:.2,sy:.1,cy:.05,sx:-.08,sz:-.03,hx:-.06,dy:-.02,fz:-.05},
    {s:.74,H:[.14,.25,.09],hs:.62,D:[.22,.9,-.3],py:.25,sy:.12,cy:.06,sx:-.12,sz:-.04,hx:-.08,dy:-.03,fz:-.06},
    {s:1,H:[-.05,.05,.62],D:[0,.75,.66],P:[.7,-.6,-.1],OP:[-.7,-.6,-.1],py:-.15,sy:-.1,cy:-.04,sx:.2,sz:.02,hx:0,dy:-.05,fz:.08},
    {s:1.3,H:[-.05,.02,.6],D:[0,.78,.62],py:-.18,sy:-.12,sx:.22,dy:-.06,fz:.09},
    {s:2,H:[-.02,-.1,.48],D:[0,.85,.52],py:-.1,sy:-.06,sx:.15,dy:-.04,fz:.06,ow:.8},
    /* the off hand lets go of the staff as it comes down */{s:2.2,ow:.4},
    {s:2.5,H:[0,-.5,.35],hs:.8,D:[0,.9,.4],P:[.5,-.9,-.3],OP:[-.5,-.9,-.3],py:0,sy:0,cy:0,sx:.04,sz:0,dy:-.01,fz:.01,ow:.2},
    Object.assign({},RE,{s:2.8,ow:0}),Object.assign({},RE,{ow:0})]);
  // ---- rainfire (casters; the fire lands at the act's end, s = 2): the staff raised high overhead, the off hand open and
  // lifted, a long gathering call, then staff and hand drive down toward the target
  FA_A.rain=faTrack([Object.assign({},R0,{ow:1}),
    {s:.5,H:[0,.7,.05],hs:.2,D:[0,1,.1],E:[0,0,1],P:[.9,.2,-.3],O:[-.1,.72,.15],OP:[-.9,.2,-.3],sx:-.1,hx:-.15,dy:0,py:.05},
    {s:1,H:[0,.82,0],D:[0,1,-.05],sx:-.16,hx:-.2,O:[-.12,.8,.1]},
    {s:1.5,H:[0,.65,.3],D:[0,.9,.4],sx:-.05,hx:-.1,O:[-.1,.6,.35]},
    {s:2,H:[-.05,-.1,.6],D:[0,-.15,1],P:[.7,-.6,0],O:[-.1,-.25,.62],OP:[-.7,-.6,0],sx:.25,hx:0,dy:-.07,fz:.08,py:-.1},
    {s:2.35,H:[-.05,-.12,.56],D:[0,-.16,1],sx:.24,dy:-.07,fz:.08},
    {s:2.7,H:[0,-.5,.35],D:[0,.9,.4],P:[.5,-.9,-.3],O:[-.05,-.85,.12],OP:[-.4,-.9,-.3],sx:.05,dy:-.01,fz:.01,py:0},
    RE]);
  // ---- sling (throw; the stone leaves at s = 1): whirl in an upright circle beside the body (clear of the head), faster and
  // faster, then a sidearm release up at the target
  {const K=[R0,{s:.12,H:[.3,-.1,.1],D:[.2,-.6,.8],E:[0,0,1],P:[1,-.4,-.3],py:.12,sy:.06,sx:-.02,O:[.15,-.3,.5],OP:[-.7,-.6,-.2]}];
    const th=t=>Math.PI*2*(2.5*(t*t*.5+t*.5))-Math.PI/2;
    for(let i=1;i<=14;i++){const t=i/14,u=.12+t*.83,a=th(t),r=.16;
      K.push({s:u,H:[.45,.05+r*Math.sin(a),.05+r*Math.cos(a)],D:[.5,.85*Math.sin(a),.85*Math.cos(a)],P:[1,-.3,-.3],py:.12+.12*t,sy:.06+.06*t,sx:-.02-.04*t})}
    K.push({s:1,H:[.12,0,.65],D:[0,.5,.87],P:[.8,-.6,-.2],py:-.2,sy:-.12,cy:-.05,sx:.15,dy:-.04,fz:.08,O:[-.1,-.6,-.1],OP:[-.6,-.6,-.6]},
      {s:1.4,H:[-.15,-.15,.6],D:[-.3,-.3,.9],py:-.3,sy:-.18,sx:.2,dy:-.05,fz:.09},
      {s:2.2,H:[-.1,-.6,.35],D:[0,-1,0],P:[.4,-.9,-.3],py:-.08,sy:-.04,cy:0,sx:.06,dy:-.02,fz:.03,O:[-.05,-.85,.12],OP:[-.4,-.9,-.3]},RE);
    FA_A.sling=faTrack(K)}
  // ---- bow (throw; the arrow leaves at s = 1): raise the bow at the target and turn side-on, nock, draw to the cheek with
  // the elbow high, a held aim, release (the string hand flicks back past the ear), hold the follow-through, lower
  FA_A.bow=faTrack([Object.assign({},R0,{H:[0,-.9,.15],ow:0,O:[-.05,-.9,.12]}),
    {s:.3,H:[-.55,-.02,.72],hs:1,P:[.6,-.6,-.5],O:[.05,-.02,.95],OP:[-.6,-.7,0],ow:1,py:.35,sy:.2,cy:.08,sx:.02,hx:0,dy:-.03},
    {s:.85,H:[0,.2,.08],hs:.35,P:[1,.3,-.7],O:[.05,.02,.97],py:.5,sy:.3,cy:.12,sx:.04,dy:-.04},
    {s:1,H:[0,.2,.07],hs:.35,O:[.05,.02,.97]},
    {s:1.12,H:[.05,.24,-.15],hs:.7,P:[1,.2,-.4],O:[.05,.04,.96],py:.52,sy:.32},
    {s:1.6,H:[.05,.2,-.12],O:[.05,.02,.95]},
    {s:2.3,H:[0,-.7,.2],hs:1,P:[.4,-.9,-.3],O:[.0,-.5,.5],OP:[-.5,-.8,-.2],ow:.6,py:.1,sy:.05,cy:0,sx:0,dy:-.01},
    Object.assign({},R0,{s:3,H:[0,-.9,.15],ow:0,O:[-.05,-.9,.12]})]);
  // ---- unarmed (claws, fists, a fist round a club or anchor); repeats alternate arms where the foe has two
  const U0=Object.assign({},R0,{H:[0,-.9,.15],rw:0,orw:0});
  FA_A.rake=faTrack([U0,
    {s:.45,H:[.3,.35,-.15],rw:.7,P:[1,.2,-.4],O:[.1,-.4,.45],OP:[-.7,-.6,-.2],py:.35,sy:.2,cy:.1,sx:.1,sz:-.05,dy:-.05,fz:-.05},
    {s:1,H:[.33,.4,-.2],rw:.8,py:.4,sy:.22,cy:.12,sx:.12,dy:-.06,fz:-.06},
    {s:1.3,H:[.1,.25,.45],rw:.4},
    {s:1.45,H:[-.35,-.1,.8],rw:-.45,P:[.8,-.5,.1],py:-.3,sy:-.2,cy:-.1,sx:.3,sz:.05,dy:-.08,fz:.12,O:[-.1,-.6,-.1],OP:[-.6,-.6,-.6],ah:1},
    {s:1.75,H:[-.6,-.55,.45],rw:-.55,py:-.45,sy:-.26,cy:-.12,sx:.35,dy:-.09,fz:.13,ah:0},
    {s:2.2,H:[-.2,-.7,.3],rw:-.1,P:[.5,-.9,-.2],py:-.15,sy:-.08,cy:0,sx:.12,sz:0,dy:-.04,fz:.05,O:[-.05,-.85,.12],OP:[-.4,-.9,-.3]},
    Object.assign({},U0,{s:3})]);
  FA_A.brute=faTrack([U0,
    {s:.5,H:[.35,-.05,-.4],rw:.2,P:[.6,-.3,-1],O:[.15,-.2,.5],OP:[-.8,-.5,-.2],py:.45,sy:.3,cy:.15,sx:.05,sz:-.06,dy:-.04,fz:-.08},
    {s:1,H:[.38,-.02,-.45],py:.5,sy:.32,cy:.16,sx:.06,dy:-.05,fz:-.09},
    {s:1.3,H:[.15,0,.4],P:[1,.1,-.4]},
    {s:1.45,H:[-.3,0,.8],rw:0,P:[1,.2,-.1],py:-.35,sy:-.25,cy:-.1,sx:.2,sz:.05,dy:-.08,fz:.12,O:[-.05,-.55,-.1],OP:[-.6,-.6,-.6],ah:1},
    {s:1.75,H:[-.55,-.15,.55],py:-.5,sy:-.3,cy:-.12,sx:.25,dy:-.09,fz:.13,ah:0},
    {s:2.25,H:[-.15,-.65,.35],P:[.5,-.9,-.2],py:-.15,sy:-.08,cy:0,sx:.1,sz:0,dy:-.04,fz:.05,O:[-.05,-.85,.12],OP:[-.4,-.9,-.3]},
    Object.assign({},U0,{s:3})]);
  FA_A.golem=faTrack([U0,
    {s:.25,H:[.38,-.3,.1],rw:.2,P:[1,-.4,-.3],py:.06},
    {s:.55,H:[.25,.7,-.1],rw:.2,P:[.9,.5,-.3],O:[.12,-.25,.5],OP:[-.7,-.6,-.2],py:.15,sy:.08,sx:-.12,sz:-.04,dy:-.02,fz:-.05},
    {s:1,H:[.24,.76,-.14],rw:.25,sx:-.15,py:.18,sy:.1,fz:-.06},
    {s:1.3,H:[.05,.58,.4],rw:.3,P:[.9,.2,-.2],sx:0},
    {s:1.45,H:[-.2,-.1,.75],rw:.35,P:[.5,.6,-.6],py:-.12,sy:-.08,sx:.32,dy:-.1,fz:.1,O:[-.1,-.6,-.1],OP:[-.6,-.6,-.6],ah:1},
    {s:1.75,H:[-.25,-.6,.6],rw:.4,P:[.4,.3,-.7],sx:.38,dy:-.12,fz:.12,ah:0},
    {s:2.3,H:[-.12,-.7,.3],rw:0,P:[.5,-.9,-.2],py:-.04,sy:-.02,sx:.12,dy:-.04,fz:.04,O:[-.05,-.85,.12],OP:[-.4,-.9,-.3]},
    Object.assign({},U0,{s:3})]);
  // ---- unarmed cast (the sand elemental's bolt): both hands drawn in to the chest, then pushed out at the target
  FA_A.castU=faTrack([Object.assign({},U0,{O:[-.05,-.9,.15]}),
    {s:.5,H:[-.05,-.25,.2],hs:.6,rw:.6,P:[.8,-.6,-.4],O:[.05,-.25,.2],os:.6,orw:.6,OP:[-.8,-.6,-.4],sx:-.08,dy:-.03,fz:-.05,hx:-.05},
    {s:.95,H:[-.05,-.2,.15],rw:.7,O:[.05,-.2,.15],orw:.7,sx:-.12,fz:-.06},
    {s:1.05,H:[-.15,-.05,.78],rw:-.5,P:[.7,-.6,0],O:[.15,-.05,.78],orw:-.5,OP:[-.7,-.6,0],sx:.2,dy:-.06,fz:.1,hx:0},
    {s:1.5,H:[-.15,-.08,.75],sx:.2},
    {s:2.3,H:[0,-.7,.3],hs:1,rw:0,P:[.5,-.9,-.2],O:[-.05,-.85,.12],os:1,orw:0,OP:[-.4,-.9,-.3],sx:.04,dy:-.01,fz:.01},
    Object.assign({},U0,{s:3})]);
}
// (track names, for the tests)
function faNames(){for(const k in FA_A)FA_A[k].nm=k}
// which track plays: class, move, the foe's attack count (repeats alternate)
function faPick(S,n){
  const c=S.K.c;
  if(c=='one'){if(n=='strike')return S.n%2?FA_A.oneB:FA_A.oneA;if(n=='slam')return FA_A.oneS}
  if(c=='two'){if(n=='strike')return S.n%3==2?FA_A.twoB:FA_A.twoA;if(n=='slam'||n=='rainfire')return FA_A.twoS}
  if(c=='pole'){if(n=='strike')return S.n%2?FA_A.poleA:FA_A.poleB}
  if(c=='dag'){if(n=='strike')return S.n%2?FA_A.dagA:FA_A.dagB}
  if(c=='staff'){if(n=='bolt')return FA_A.cast;if(n=='rainfire')return FA_A.rain}
  if(c=='sling'){if(n=='throw')return FA_A.sling;if(n=='strike')return S.n%2?FA_A.oneB:FA_A.oneA}
  if(c=='bow'){if(n=='throw')return FA_A.bow}
  if(c=='claw'){if(n=='strike')return FA_A[S.K.arm]||FA_A.rake;if(n=='bolt')return FA_A.castU}
  return null}
// ---------------- helpers ----------------
var FA_v=[],FA_q=[];for(let i=0;i<24;i++){FA_v.push(new THREE.Vector3());FA_q.push(new THREE.Quaternion())}
var FA_M1=new THREE.Matrix4(),FA_M2=new THREE.Matrix4(),FA_SC=new THREE.Vector3(),FA_X=new THREE.Vector3(1,0,0),FA_NY=new THREE.Vector3(0,-1,0);
const faSS=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
function faWP(o,v){return v.setFromMatrixPosition(o.matrixWorld)}
function faWQ(o,q){o.matrixWorld.decompose(FA_SC,q,FA_SC);return q}
// set a bone's local rotation so its world rotation is Qw (parent's matrixWorld must be current); updates its subtree
function faSetW(bn,Qw){const pq=faWQ(bn.parent,FA_q[20]);bn.quaternion.copy(pq.invert().multiply(Qw));bn.updateMatrixWorld(true)}
// rotation taking local frame (ya, za) to world frame (yw, zw)
function faFrameQ(ya,za,yw,zw,q){const xa=FA_v[16].crossVectors(ya,za).normalize(),za2=FA_v[17].crossVectors(xa,ya),xw=FA_v[18].crossVectors(yw,zw).normalize(),zw2=FA_v[19].crossVectors(xw,yw);
  FA_M1.makeBasis(xw,yw,zw2);FA_M2.makeBasis(xa,ya,za2).transpose();FA_M1.multiply(FA_M2);return q.setFromRotationMatrix(FA_M1)}
// two-bone IK: b2's origin to world point T, the middle joint toward world direction pole; bz = +1 (arm: the forearm folds
// toward the upper arm's local +z) or −1 (leg: the shin folds toward −z). Sets b0 and b1 (local), matrices updated.
function faIK(b0,b1,b2,T,pole,bz){
  const S=faWP(b0,FA_v[0]),E=faWP(b1,FA_v[1]),W=faWP(b2,FA_v[2]),l1=S.distanceTo(E),l2=E.distanceTo(W);
  const n=FA_v[3].subVectors(T,S);let d=n.length();if(d<1e-6||l1<1e-6||l2<1e-6)return;n.multiplyScalar(1/d);
  d=Math.max(Math.abs(l1-l2)+1e-3,Math.min((l1+l2)*.9995,d));
  const a=(l1*l1-l2*l2+d*d)/(2*d),hh=Math.sqrt(Math.max(0,l1*l1-a*a));
  const pp=FA_v[4].copy(pole).addScaledVector(n,-pole.dot(n));if(pp.lengthSq()<1e-9){pp.set(0,0,1).addScaledVector(n,-n.z);if(pp.lengthSq()<1e-9)pp.set(1,0,0)}pp.normalize();
  const Eg=FA_v[5].copy(S).addScaledVector(n,a).addScaledVector(pp,hh),U=FA_v[6].subVectors(Eg,S).normalize(),Tg=FA_v[7].copy(S).addScaledVector(n,d),F=FA_v[8].subVectors(Tg,Eg).normalize();
  /* the bend's direction: the forearm folds back toward the line, i.e. away from the pole; a little of −pole is added so a
     nearly straight limb keeps the same roll (it fell back to +pole below a threshold and the forearm flipped over) */
  const bd=FA_v[9].copy(F).addScaledVector(U,-F.dot(U)).addScaledVector(FA_v[13].copy(pp).addScaledVector(U,-pp.dot(U)),-.02);if(bd.lengthSq()<1e-12)bd.copy(pp).negate();bd.normalize();
  const u1=FA_v[10].copy(b1.position).normalize(),za=FA_v[11].set(0,0,bz).addScaledVector(u1,-u1.z*bz).normalize();
  faSetW(b0,faFrameQ(u1,za,U,bd,FA_q[0]));
  // the lower bone: its child's rest direction onto the forearm / shin direction
  const q0=faWQ(b0,FA_q[1]).invert(),Fl=FA_v[12].copy(F).applyQuaternion(q0),u2=FA_v[13].copy(b2.position).normalize();
  b1.quaternion.setFromUnitVectors(u2,Fl);b1.updateMatrixWorld(true)}
// limit a local rotation: twist about axis (unit) to mt, the rest (swing) to ms
function faClamp(q,ax,ms,mt){const d=q.x*ax.x+q.y*ax.y+q.z*ax.z,tw=FA_q[21].set(ax.x*d,ax.y*d,ax.z*d,q.w);if(tw.lengthSq()<1e-9)tw.identity();else tw.normalize();
  const sw=FA_q[22].copy(q).multiply(FA_q[23].copy(tw).invert());
  const lim=(r,m)=>{if(r.w<0){r.x=-r.x;r.y=-r.y;r.z=-r.z;r.w=-r.w}const an=2*Math.acos(Math.min(1,r.w));if(an>m)r.copy(FA_q[23].identity().slerp(r,m/an))};
  lim(sw,ms);lim(tw,mt);return q.copy(sw).multiply(tw)}
// put a hand's local rotation lq on b2, with half its twist about the forearm's axis u2 taken by the forearm b1 itself
// (pronation turns the whole forearm, not just the wrist)
function faTwist(b1,b2,lq,u2){const d=lq.x*u2.x+lq.y*u2.y+lq.z*u2.z,tw=FA_q[21].set(u2.x*d,u2.y*d,u2.z*d,lq.w);if(tw.lengthSq()<1e-9)tw.identity();else tw.normalize();
  if(tw.w<0){tw.x=-tw.x;tw.y=-tw.y;tw.z=-tw.z;tw.w=-tw.w}const th=FA_q[22].identity().slerp(tw,.5);
  b1.quaternion.multiply(th);b1.updateMatrixWorld(true);b2.quaternion.copy(th.invert().multiply(lq));b2.updateMatrixWorld(true)}
// The wrist, as a real one moves (owner: the weapon must never visibly angle inside a closed fist). A local hand rotation
// splits into the forearm's turn about its own axis (pronation, shared with the forearm by faTwist) and the wrist's bend:
// about the axis along the handle (flexion / extension, which turns the weapon about its own handle) and about the axis
// across it (radial / ulnar deviation, which changes the angle between handle and forearm). hH = the handle's axis in the
// hand's frame (the carry grip). Limits: flex / extend 65°, ulnar 35°, radial 20°, pronation 100°. Past them only a little
// is left to the weapon in the fist: 15° of tilt and 45° of roll about the round handle (FA_FIST).
var FA_WL={flex:1.13,uln:.61,rad:.35,tw:1.75},FA_FIST={tilt:.26,roll:.785};
// most a weapon may turn per 1/30 s (radians): aim d (ds in the strike's few fastest frames), roll about the handle r, the
// elbow's place on its circle p, the weapon inside the fist f
var FA_RATE={free:0,d:.5,ds:1.16,r:.35,p:.5,f:.08,s:.36};
// (the forearm turn is kept continuous from frame to frame, ref = last frame's: read in (-180°, 180°] it wrapped from -181° to
// +179°, and the clamp then turned the hand over by 200° in one frame)
function faWristParts(lq,u2,hH,o,ref){const d=lq.x*u2.x+lq.y*u2.y+lq.z*u2.z;let tw=2*Math.atan2(d,lq.w);if(tw>Math.PI)tw-=2*Math.PI;if(tw<-Math.PI)tw+=2*Math.PI;
  if(ref!=null&&isFinite(ref))tw+=2*Math.PI*Math.round((ref-tw)/(2*Math.PI));
  const tq=FA_q[21].setFromAxisAngle(u2,tw),sq=FA_q[22].copy(lq).multiply(FA_q[23].copy(tq).invert());if(sq.w<0){sq.x=-sq.x;sq.y=-sq.y;sq.z=-sq.z;sq.w=-sq.w}
  const sa=2*Math.acos(Math.min(1,sq.w)),sn=Math.sqrt(Math.max(0,1-sq.w*sq.w)),k=sn>1e-6?sa/sn:2;
  const f=o.f||(o.f=hH.clone().addScaledVector(u2,-hH.dot(u2)).normalize()),dv=o.dv||(o.dv=new THREE.Vector3().crossVectors(u2,f));
  /* + deviation turns the weapon's head away from the elbow (ulnar, as in a chop) */
  if(o.sg==null){o.sg=1;const hd=hH.clone().negate(),t=hd.clone().applyAxisAngle(dv,.1);if(t.dot(u2)<hd.dot(u2))o.sg=-1}
  o.tw=tw;o.flex=(sq.x*f.x+sq.y*f.y+sq.z*f.z)*k;o.dev=(sq.x*dv.x+sq.y*dv.y+sq.z*dv.z)*k*o.sg;return o}
function faWristClamp(lq,u2,hH,o){faWristParts(lq,u2,hH,o,o.tw);const fl=Math.max(-FA_WL.flex,Math.min(FA_WL.flex,o.flex)),dv=Math.max(-FA_WL.rad,Math.min(FA_WL.uln,o.dev)),tw=Math.max(-FA_WL.tw,Math.min(FA_WL.tw,o.tw));
  const v=o.f.clone().multiplyScalar(fl).addScaledVector(o.dv,dv*o.sg),an=v.length(),sq=an>1e-9?new THREE.Quaternion().setFromAxisAngle(v.multiplyScalar(1/an),an):new THREE.Quaternion();
  return lq.copy(sq).multiply(new THREE.Quaternion().setFromAxisAngle(u2,tw))}
// search the elbow's place on its circle (φ) and the hand's roll about the weapon axis together. Returns {pole, Qh}.
// q0·(roll about Dw) = candidate hand rotation. Cost: past the wrist's limits (heavily past what the fist may take), a mild
// pull toward a neutral wrist, the edge off its direction (weight ew; inside the edge window only rolls near the edge's are
// tried), the elbow away from the designed pole, and change from last frame.
var FA_BQ=[new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion()],FA_BV=[];for(let i=0;i<12;i++)FA_BV.push(new THREE.Vector3());
function faBest(b0,b1,b2,T,poleD,q0,Dw,edH,Ew,ew,eSg,prev,hH,hard,lim,twRef,home){
  const V=FA_BV,Q=FA_BQ,S=faWP(b0,V[0]),l1=S.distanceTo(faWP(b1,V[1])),l2=faWP(b1,V[1]).distanceTo(faWP(b2,V[2]));
  const n=V[3].subVectors(T,S);let d=n.length();n.multiplyScalar(1/(d||1));d=Math.max(Math.abs(l1-l2)+1e-3,Math.min((l1+l2)*.9995,d));
  const a=(l1*l1-l2*l2+d*d)/(2*d),hh=Math.sqrt(Math.max(0,l1*l1-a*a)),C=V[4].copy(S).addScaledVector(n,a),Tg=V[5].copy(S).addScaledVector(n,d);
  const e1=V[6].copy(poleD).addScaledVector(n,-poleD.dot(n));if(e1.lengthSq()<1e-9){e1.set(0,0,1).addScaledVector(n,-n.z);if(e1.lengthSq()<1e-9)e1.set(1,0,0)}e1.normalize();
  const e2=V[7].crossVectors(n,e1);
  const u1=b1.position.clone().normalize(),za=new THREE.Vector3(0,0,1).addScaledVector(u1,-u1.z).normalize(),u2=b2.position.clone().normalize();
  const E=V[8],U=V[9],F=V[10],bd=V[11],R0=Q[1],q1l=Q[2],Q1=Q[3],Qh=Q[4],tmpQ=new THREE.Quaternion(),tmpQ2v=new THREE.Vector3(),Fl=new THREE.Vector3(),ed=new THREE.Vector3(),wo={};
  let best=null;
  /* last frame's elbow, found on this frame's circle (the pole moves with the keys: "the same elbow" is a place, not an angle) */
  if(prev&&prev.E){const v=prev.E.clone().sub(C);prev={ph:Math.atan2(v.dot(e2),v.dot(e1)),ro:0}}
  const evalAt=(ph,ro,far)=>{
    E.copy(C).addScaledVector(e1,hh*Math.cos(ph)).addScaledVector(e2,hh*Math.sin(ph));U.subVectors(E,S).normalize();F.subVectors(Tg,E).normalize();
    bd.copy(F).addScaledVector(U,-F.dot(U));{const pc=tmpQ2v.copy(e1).multiplyScalar(Math.cos(ph)).addScaledVector(e2,Math.sin(ph));bd.addScaledVector(pc.addScaledVector(U,-pc.dot(U)),-.02)}if(bd.lengthSq()<1e-12)bd.copy(e1).multiplyScalar(-Math.cos(ph)).addScaledVector(e2,-Math.sin(ph));bd.normalize();
    faFrameQ(u1,za,U,bd,R0);Fl.copy(F).applyQuaternion(tmpQ.copy(R0).invert());q1l.setFromUnitVectors(u2,Fl);Q1.copy(R0).multiply(q1l);
    Qh.setFromAxisAngle(Dw,ro).multiply(q0);const lq=tmpQ.copy(Q1).invert().multiply(Qh);faWristParts(lq,u2,hH,wo,twRef);
    const exF=Math.max(0,Math.abs(wo.flex)-FA_WL.flex),exD=Math.max(0,wo.dev-FA_WL.uln,-wo.dev-FA_WL.rad),exT=Math.max(0,Math.abs(wo.tw)-FA_WL.tw),tilt=Math.hypot(exD,exT);
    let c=60*Math.pow(Math.max(0,tilt-FA_FIST.tilt*.8),2)+60*Math.pow(Math.max(0,exF-FA_FIST.roll*.8),2)+3*tilt*tilt+1.5*exF*exF
      +.15*wo.flex*wo.flex+.4*wo.dev*wo.dev+.12*wo.tw*wo.tw+(1-Math.cos(ph))*.35
      +(home&&home.kt>0?home.kt*Math.pow(Math.atan2(Math.sin(wo.tw-home.ht),Math.cos(wo.tw-home.ht)),2):0)
      +(home&&home.k>0?home.k*(Math.pow(wo.tw-home.tw,2)+Math.pow(wo.flex-home.flex,2)+Math.pow(wo.dev-home.dev,2)+2*(1-Math.cos(ph))):0);
    let ee=0;if(Ew&&ew>0){ed.copy(edH).applyQuaternion(Qh);ed.addScaledVector(Dw,-ed.dot(Dw));const el=ed.length();if(el>1e-6){const cs=eSg?eSg*ed.dot(Ew)/el:Math.abs(ed.dot(Ew)/el);ee=Math.acos(Math.max(-1,Math.min(1,cs)))}c+=ee*ee*(hard?6:.8*ew)}
    // keep close to last frame's choice (no flicker between two equally good solutions). The change is costed per second, not
    // per frame (divided by the frame's length, fk = 1 at 30 fps): at 60 fps the same motion takes the same path
    if(prev){const dp=Math.atan2(Math.sin(ph-prev.ph),Math.cos(ph-prev.ph)),dr=Math.atan2(Math.sin(ro-prev.ro),Math.cos(ro-prev.ro)),ik=1/((lim&&lim.fk)||1);c+=far?(lim.fs?.6*(dp*dp+dr*dr)*ik:2+.4*(dp*dp+dr*dr)*ik):(dp*dp+dr*dr)*(lim?1:.6)*ik}
    if(!best||c<best.c)best={c,ph,ro,ee,tilt,exF};if(FA.dbg&&!far&&(!FA.dbg.bn||c<FA.dbg.bn.c))FA.dbg.bn={c:+c.toFixed(2),ee:+(ee*57.3).toFixed(0),tilt:+(tilt*57.3).toFixed(0),exF:+(exF*57.3).toFixed(0),w:[wo.flex,wo.dev,wo.tw].map(x=>+(x*57.3).toFixed(0)),ext:+(d/(l1+l2)).toFixed(3),dph:prev?+((ph-prev.ph)*57.3).toFixed(0):null,ro:+(ro*57.3).toFixed(0),ref:twRef!=null?+(twRef*57.3).toFixed(0):null}};if(FA.dbg)FA.dbg.bn=null;
  // rolls to try: from last frame's hand (q0 = it, carried to the new aim) no further than lim allows; the first frame all
  // round. The edge's own roll is tried too (within the limit).
  if(lim&&prev){const ns=8;let aE=null;
    if(Ew&&ew>0){ed.copy(edH).applyQuaternion(q0);ed.addScaledVector(Dw,-ed.dot(Dw));const t=Ew.clone().addScaledVector(Dw,-Ew.dot(Dw)).multiplyScalar(eSg||1);
      if(ed.lengthSq()>1e-8&&t.lengthSq()>1e-8){ed.normalize();t.normalize();if(!eSg&&ed.dot(t)<0)t.negate();aE=Math.atan2(new THREE.Vector3().crossVectors(ed,t).dot(Dw),ed.dot(t));aE=Math.max(-lim.ro,Math.min(lim.ro,aE))}}
    for(let i=-ns;i<=ns;i++)for(let j=-ns;j<=ns;j++)evalAt(prev.ph+lim.ph*i/ns,lim.ro*j/ns);
    if(aE!=null)for(let i=-ns;i<=ns;i++)evalAt(prev.ph+lim.ph*i/ns,aE);
    /* a far better pose elsewhere (the near one ran out of wrist) may still be taken: the change costs, and the hand's own
       turn limit spreads it over frames */
    /* (only inside the blow: in the slow parts of the move a swap shows as the hand turning back and forth) */
    if(!lim.nf)for(let i=0;i<16;i++)for(let j=0;j<12;j++)evalAt((i-8)*Math.PI/8,j*Math.PI/6-Math.PI,1)}
  else{for(let i=0;i<16;i++)for(let j=0;j<12;j++)evalAt((i-8)*Math.PI/8,j*Math.PI/6);
    const p0=best.ph,r0=best.ro;for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)if(i||j)evalAt(p0+i*Math.PI/40,r0+j*Math.PI/40)}
  const pole=new THREE.Vector3().copy(e1).multiplyScalar(Math.cos(best.ph)).addScaledVector(e2,Math.sin(best.ph));
  return {pole,Qh:new THREE.Quaternion().setFromAxisAngle(Dw,best.ro).multiply(q0),c:best.c,ee:best.ee,ph:best.ph,ro:best.ro,tilt:best.tilt}}
// the off fist's world turn on a two-handed haft (see the off hand in faApply): handle axis as in its own carry grip, palm
// normal (the hand's +z, where the grip anchor sits) = the weapon hand's palm mirrored across the body, leaning toward the
// weapon side and away from the body (from the chest out to the grip, square to the handle: up behind the head the hand is
// under the handle, in front of the chest behind it)
function faOffQ(S,we,Ww,toW,m2,pw,bc){const ya=new THREE.Vector3(0,1,0).applyQuaternion(Ww).normalize(),hO=new THREE.Vector3(0,1,0).applyQuaternion(S.oC).normalize(),
    pL=new THREE.Vector3(0,0,1).addScaledVector(hO,-hO.z).normalize();
  const mq=faWQ(m2,new THREE.Quaternion()),pm=new THREE.Vector3(0,0,1).applyQuaternion(mq),bq=faWQ(S.mA[0].parent,new THREE.Quaternion()),bi=bq.clone().invert();
  const pb=pm.applyQuaternion(bi);pb.x=-pb.x;const aw=pw.clone().sub(bc);aw.addScaledVector(ya,-aw.dot(ya));if(aw.lengthSq()>1e-8)aw.normalize();const want=pb.applyQuaternion(bq).add(toW([.5,0,0],new THREE.Vector3())).addScaledVector(aw,.5);want.addScaledVector(ya,-want.dot(ya));
  if(want.lengthSq()<1e-6)want.copy(toW([1,0,0],new THREE.Vector3())).addScaledVector(ya,-ya.dot(toW([1,0,0],new THREE.Vector3())));
  /* (followed on game time, 40 ms: the weapon hand's palm can turn over quickly as a staff is swung from the gather into
     the thrust, and the off fist flipped round the shaft in a frame) */
  want.normalize();if(S.oW&&S.dt>0){want.lerp(S.oW,Math.exp(-S.dt/.04));want.addScaledVector(ya,-want.dot(ya));if(want.lengthSq()<1e-6)want.copy(S.oW)}S.oW=want.clone().normalize();
  if(FA.dbg)FA.dbg.ofq={pb:pb.toArray().map(x=>+x.toFixed(2)),aw:aw.toArray().map(x=>+x.toFixed(2)),want:want.clone().normalize().toArray().map(x=>+x.toFixed(2)),ya:ya.toArray().map(x=>+x.toFixed(2))};
  return faFrameQ(hO,pL,ya,want.normalize(),new THREE.Quaternion()).clone()}
// turn the weapon in the fist by Rp from its carry grip, keeping the point held in the fist where it is
function faSetFist(we,Rp){const W=we.W,hd=we.C.hold,h=new THREE.Vector3(hd[0]*W.scale.x,hd[1]*W.scale.y,hd[2]*W.scale.z),ph=h.clone().applyQuaternion(W.quaternion).add(W.position);
  W.quaternion.copy(Rp).multiply(we.C.q);W.position.copy(ph.sub(h.applyQuaternion(W.quaternion)));W.updateMatrixWorld(true)}
// the weapon a hand holds (grip registry entry)
function faWpn(h,side){const S=h._grip;if(!S||!S.L)return null;for(const e of S.L)if(e.side==side&&e.W&&e.W.parent)return e;return null}
// THE ARM'S WAY OF HOLDING THE WEAPON AT THE HIT, worked out before the swing. An arm can hold a weapon in one place two ways
// (forearm turned palm-down with the wrist bent one way, or turned palm-up and bent the other), and which one the hit needs
// depends on the body and the weapon. Found only frame by frame, the arm kept the coil's way into the blow and swapped at the
// contact (the blade turned over as it landed; at 30 and 60 fps on different frames). So when an attack begins, the hit's
// pose is solved once (body, arm, weapon aim and edge, at the hit's key), and through the early, fast part of the downswing
// the forearm is drawn toward that way (S.fam), so any swap happens while the weapon is high and moving fast.
function faHitFam(g,S){
  const T=S.T,th=S.tHit,we=S.we;if(!T||th==null||!we||!we.edge)return null;
  const h=g.h,b=h.bones,keep={};for(const n in S.base)keep[n]=b[n].quaternion.clone();const pp=b.pelvis.position.clone();
  let out=null;
  try{const P=T(th),side=S.side,mesh=b.pelvis.parent,am=S.am;g.updateMatrixWorld(true);const mq=faWQ(mesh,new THREE.Quaternion()),toW=(arr,v)=>v.set(arr[0]*side,arr[1],arr[2]).applyQuaternion(mq);
    const pos=t=>{const Q=T(t),dn=Math.hypot(Q.D[0],Q.D[1],Q.D[2])||1;return new THREE.Vector3(Q.hs*S.hwU+Q.H[0]+Q.D[0]/dn*S.wlU,Q.H[1]+Q.D[1]/dn*S.wlU,Q.H[2]+Q.D[2]/dn*S.wlU)};
    const lead=pos(th+.03).sub(pos(th-.03)),Pk=T(th),Dk=new THREE.Vector3(Pk.D[0],Pk.D[1],Pk.D[2]).normalize();lead.addScaledVector(Dk,-lead.dot(Dk));
    const Q=T(th);   /* (T's result is shared: read it again after pos()) */
    b.pelvis.rotation.y+=Q.py*side*am;b.spine.rotation.y+=Q.sy*side*am;if(b.chest)b.chest.rotation.y+=Q.cy*side*am;b.spine.rotation.x+=Q.sx*am;b.spine.rotation.z-=Q.sz*side*am;
    if(S.legs){b.pelvis.position.y+=Q.dy*S.LL*am;b.pelvis.position.z+=Q.fz*S.LL*am;b.pelvis.position.x+=Q.fx*side*S.LL*am}
    b.pelvis.updateMatrixWorld(true);
    const m0=S.mA[0],m1=S.mA[1],m2=S.mA[2],sm=faWP(m0,new THREE.Vector3()),so=faWP(S.oA[0],new THREE.Vector3()),mid=sm.clone().add(so).multiplyScalar(.5),hw=sm.distanceTo(so)/2,A=S.U,sideW=toW([1,0,0],new THREE.Vector3());
    const H=Q.H.slice();if(Q.ah){if(S.slm){const want=(S.gy+.14*S.sc-S.slm[1]*S.wl-mid.y)/A;H[1]+=Q.ah*Math.max(-.45,Math.min(.4,want-S.slm[0]))}else{const want=(S.tgY+.12*S.wl-mid.y)/A;H[1]+=Q.ah*Math.max(-.45,Math.min(.4,want-H[1]))}}
    const tgt=mid.clone().addScaledVector(sideW,Q.hs*hw).add(toW(H,new THREE.Vector3()).multiplyScalar(A));
    {const dv=tgt.clone().sub(sm),dl=dv.length(),mx=.95*S.A;if(dl>mx)tgt.copy(sm).addScaledVector(dv,mx/dl)}
    const Dw=toW(Q.D,new THREE.Vector3()).normalize();
    if(Q.ad){const y=Math.max(-.85,Math.min(.35,(S.tgY-tgt.y)/(S.wl||1))),y2=Dw.y+(y-Dw.y)*Q.ad,hl=Math.hypot(Dw.x,Dw.z)||1,k=Math.sqrt(1-y2*y2)/hl;Dw.set(Dw.x*k,y2,Dw.z*k)}
    const Wq=we.W.quaternion,headH=FA_NY.clone().applyQuaternion(Wq),edH=FA_X.clone().applyQuaternion(Wq),hH=new THREE.Vector3(0,1,0).applyQuaternion(we.C.q).normalize();
    const Eb=lead.lengthSq()>1e-6?lead.normalize():new THREE.Vector3(Q.E[0],Q.E[1],Q.E[2]).normalize(),Ew=toW([Eb.x,Eb.y,Eb.z],new THREE.Vector3()).normalize();
    const r=faBest(m0,m1,m2,tgt,toW(Q.P,new THREE.Vector3()).normalize(),new THREE.Quaternion().setFromUnitVectors(headH,Dw),Dw,edH,Ew,Q.ew,we.edge==2?0:1,null,hH,true,null,null,null);
    faIK(m0,m1,m2,tgt,r.pole,1);const lq=faWQ(m1,new THREE.Quaternion()).invert().multiply(r.Qh),wo=faWristParts(lq,m2.position.clone().normalize(),hH,{},null);
    out={tw:wo.tw,s0:(T.o.hw||[1.02])[0]-.2}}
  catch(e){out=null}
  for(const n in keep)b[n].quaternion.copy(keep[n]);b.pelvis.position.copy(pp);g.updateMatrixWorld(true);
  return out}
// ---------------- per foe state ----------------
var FA_BN=['pelvis','spine','chest','neck','head','aR0','aR1','aR2','aL0','aL1','aL2','lh0','lh1','lh2','rh0','rh1','rh2'];
function faState(g){
  if(g._fa!==undefined)return g._fa;g._fa=null;
  const h=g.h,b=h&&h.bones,key=g.hk179,K=key&&FA_K[key];
  if(!K||!b||!b.aR0||!b.aL0||!b.spine||g._bo)return null;
  if(!FA_A.oneA){faBuild();faNames()}
  const S={K,key,n:0,ph:-1,base:{},last:null,fo:0,dirty:0,legs:!!(b.lh0&&b.lh1&&b.lh2&&b.rh0&&b.rh1&&b.rh2&&!h.nt)};
  FA_BN.forEach(n=>{if(b[n])S.base[n]=new THREE.Quaternion()});S.py0=0;
  return g._fa=S}
// (the Euler values are kept exactly: the idle layer recognises its own last write by exact value, and a quaternion round
// trip would make it add its fidget again every frame)
function faSnap(S,b){if(!S.be)S.be={};for(const n in S.base){const r=b[n].rotation;S.base[n].copy(b[n].quaternion);(S.be[n]||(S.be[n]=[0,0,0])).splice(0,3,r.x,r.y,r.z)}S.pp=(S.pp||new THREE.Vector3()).copy(b.pelvis.position)}
function faRestore(S,b){for(const n in S.base){const e=S.be[n];b[n].rotation.set(e[0],e[1],e[2])}b.pelvis.position.copy(S.pp)}
// the move a foe is really doing (signature moves borrow these animation names with other timings)
function faMove(g,a){const e=g._ie,n=e&&e.atk&&e.atk.n;return n||a.n}
function faDrives(g,S,a){if(!FA.on||!a)return false;const n=faMove(g,a);if(!FA_MOVES[n]||a.n!==n)return false;return !!faPick(S,n)}
// ---------------- the solve ----------------
function faApply(g,S,a,now){
  const h=g.h,b=h.bones,T=S.T,s=a.ph==0?S.sw(a.k):a.ph==1?1+a.k:2+S.sr(1-a.k),sT=S.rm?S.rm(s):s;
  // WEAPON FACING (owner: a hard rule). The edge follows its keys all through the swing; once the downswing moves toward
  // the target (the track's edge window, T.o.hw) it is turned onto the head's travel along the track. A two-edged blade
  // picks its side once per swing. NOTHING JUMPS (owner: "the weapons flip around in the hand right before the swing"):
  // the weapon's aim turns at most FA_RATE.d (FA_RATE.ds in the strike) and its roll about the handle FA_RATE.r per 1/30 s,
  // the elbow FA_RATE.p, the weapon inside the fist FA_RATE.f, and each frame starts from the last frame's hand (carried
  // along to the new aim), so the solver can never swap to another solution from one frame to the next.
  let lead=null;const hwin=T.o.hw||[1.02,1.75],hwf=T.o.hwf||.35;let hardK=S.we&&S.we.edge?faSS((sT-hwin[0]+.25)/.25)*faSS((hwin[1]+hwf-sT)/hwf):0;
  const pos=t=>{const Q=T(t),dn=Math.hypot(Q.D[0],Q.D[1],Q.D[2])||1;return new THREE.Vector3(Q.hs*S.hwU+Q.H[0]+Q.D[0]/dn*S.wlU,Q.H[1]+Q.D[1]/dn*S.wlU,Q.H[2]+Q.D[2]/dn*S.wlU)};
  // through the coil the blade is already turned the way the downswing will need it (the edge on the coming travel,
  // carried back to the weapon's present direction), so the edge is in place when the window opens — no turn-over then
  let prep=null,kp=0;if(S.we&&S.we.edge&&sT>.35&&sT<hwin[0]+.15){const su=hwin[0]+.15,v=pos(su+.03).sub(pos(su-.03)),Qa=T(su),Qn=T(sT),da=new THREE.Vector3(Qa.D[0],Qa.D[1],Qa.D[2]).normalize(),dn=new THREE.Vector3(Qn.D[0],Qn.D[1],Qn.D[2]).normalize();
    v.addScaledVector(da,-v.dot(da));if(v.length()>.02){v.normalize().applyQuaternion(new THREE.Quaternion().setFromUnitVectors(da,dn));v.addScaledVector(dn,-v.dot(dn));if(v.lengthSq()>1e-4){prep=v.normalize();kp=faSS((sT-.35)/.3)}}}
  if(hardK>0){
    const v=pos(sT+.03).sub(pos(sT-.03)),Q=T(sT),d=new THREE.Vector3(Q.D[0],Q.D[1],Q.D[2]).normalize();v.addScaledVector(d,-v.dot(d));if(v.length()>.02)lead=v.normalize();
    /* only once the head moves toward the target (in the coil it follows the keys): by the track and by the real head's own
       last move (a head still finishing its coil, behind its keys, is not yet leading with anything); once on, it stays on */
    if(!S.hkOn){hardK*=lead?faSS((lead.z+.25)/.4):0;if(S.tv){const fz=new THREE.Vector3(0,0,1).applyQuaternion(faWQ(b.pelvis.parent,new THREE.Quaternion()));hardK*=faSS((S.tv.dot(fz)+.25)/.4)}}if(hardK>.5)S.hkOn=1}
  const P=T(sT);S.sT=sT;S.hardK=hardK;
  // the blow's few fastest frames (a strike's downswing to just past the hit, a slam's to its landing): the turn limits open up.
  // The arm may swap to its other way of holding the weapon (forearm turned the other way round) only early in them, while the
  // weapon is still high and moving fast, never in the last frames into the hit (it turned the blade over at the contact)
  const th0=S.tHit!=null?S.tHit:S.mv=='strike'?1.45:1,inF=sT>th0-.35&&sT<th0+.15;
  // blend in over the start of the wind-up, out over the end of the recovery
  const w=faSS(s/.35)*faSS((3-s)/.8);if(w<=1e-4)return;
  const side=S.side,mesh=b.pelvis.parent;
  g.updateMatrixWorld(true);
  // the stance's own weapon hand and elbow (the earlier layers' pose): the end of the recovery comes back to exactly these,
  // so the blend back has nothing left to turn (it spun the weapon round its handle in the last frames)
  const hb=faSS((sT-2.12)/.75),qHb=hb>0?faWQ(S.mA[2],new THREE.Quaternion()):null,eHb=hb>0?faWP(S.mA[1],new THREE.Vector3()).sub(faWP(S.mA[0],new THREE.Vector3())):null;
  const mq=faWQ(mesh,FA_q[2]).clone(),toW=(arr,v)=>v.set(arr[0]*side,arr[1],arr[2]).applyQuaternion(mq);
  // feet where the earlier layers put them
  let fL,fR,qL,qR;if(S.legs){fL=faWP(b.lh2,new THREE.Vector3());fR=faWP(b.rh2,new THREE.Vector3());qL=faWQ(b.lh2,new THREE.Quaternion());qR=faWQ(b.rh2,new THREE.Quaternion())}
  // ---- body ----
  const am=S.am;
  b.pelvis.rotation.y+=P.py*side*w*am;b.spine.rotation.y+=P.sy*side*w*am;if(b.chest)b.chest.rotation.y+=P.cy*side*w*am;
  b.spine.rotation.x+=P.sx*w*am;b.spine.rotation.z-=P.sz*side*w*am;
  if(b.head){b.head.rotation.y-=(P.py+P.sy+P.cy)*side*w*am*.7;b.head.rotation.x+=(-P.sx*.6+P.hx)*w*am}
  if(S.legs){const LL=S.LL;b.pelvis.position.y+=P.dy*LL*w*am;b.pelvis.position.z+=P.fz*LL*w*am;b.pelvis.position.x+=P.fx*side*LL*w*am}
  b.pelvis.updateMatrixWorld(true);
  if(S.legs){const pole=toW([0,0,1],FA_v[14]).clone();
    [[b.lh0,b.lh1,b.lh2,fL,qL,-1],[b.rh0,b.rh1,b.rh2,fR,qR,1]].forEach(([b0,b1,b2,f,q,sd])=>{
      const pl=pole.clone().add(toW([.15*sd*side,0,0],FA_v[15]));faIK(b0,b1,b2,f,pl,-1);faSetW(b2,q)})}
  // ---- arms ----
  const m0=S.mA[0],m1=S.mA[1],m2=S.mA[2],o0=S.oA[0],o1=S.oA[1],o2=S.oA[2];
  const sm=faWP(m0,FA_v[20]).clone(),so=faWP(o0,FA_v[21]).clone(),mid=sm.clone().add(so).multiplyScalar(.5),hw=sm.distanceTo(so)/2,A=S.U;
  const sideW=toW([1,0,0],new THREE.Vector3());
  // hand target, with the hit raised or lowered toward the target's chest (ad = how much this key aims)
  // (at the hit the hand goes to where the weapon's head lands on the target's chest: hand a little above, head angled down;
  // a slam's hand goes as low as puts the head, at its keyed angle, on the ground in front, whatever the arm and weapon size)
  const H=P.H.slice();if(P.ah){if(S.slm){/* (a slam: the whole downswing shifted by what the landing key needs, so the hand keeps its
    speed into the ground) */const want=(S.gy+.14*S.sc-S.slm[1]*S.wl-mid.y)/A;H[1]+=P.ah*Math.max(-.45,Math.min(.4,want-S.slm[0]))}
    else{const want=(S.tgY+.12*S.wl-mid.y)/A;H[1]+=P.ah*Math.max(-.45,Math.min(.4,want-(S.ahH!=null?S.ahH:H[1])))}}
  const tgt=mid.clone().addScaledVector(sideW,P.hs*hw).add(toW(H,new THREE.Vector3()).multiplyScalar(A));
  /* never quite out of reach: a locked-straight arm has no elbow to turn on, and the solver's choice of how the forearm is
     turned then jumped from frame to frame (the slam's landing) */
  {const sh=faWP(m0,FA_v[22]),dv=FA_v[23].subVectors(tgt,sh),dl=dv.length(),mx=.95*S.A;if(dl>mx)tgt.copy(sh).addScaledVector(dv,mx/dl)}
  const pole=toW(P.P,new THREE.Vector3()).normalize();
  // hand: aim the weapon (head along D, edge toward E), or a natural wrist with flex rw
  const we=S.we,u2=m2.position.clone().normalize();
  if(we){const Wq=we.W.quaternion,headH=FA_NY.clone().applyQuaternion(Wq),edH=FA_X.clone().applyQuaternion(Wq),Dw=toW(P.D,new THREE.Vector3()).normalize();
    /* the swing starts from where the weapon really is (a sling hangs, a staff stands): the aim eases from the carry's own
       direction to the keys over the first part of the wind-up */
    if(!S.D0){const d=FA_NY.clone().applyQuaternion(faWQ(we.W,new THREE.Quaternion()));S.D0=d}if(sT<.4)Dw.lerp(S.D0,1-faSS(sT/.4)).normalize();
    if(P.ad){const sy=sm.y+(tgt.y-sm.y),y=Math.max(-.85,Math.min(.35,(S.tgY-sy)/(S.wl||1))),y2=Dw.y+(y-Dw.y)*P.ad,hl=Math.hypot(Dw.x,Dw.z)||1,k=Math.sqrt(1-y2*y2)/hl;Dw.set(Dw.x*k,y2,Dw.z*k)}
    /* a slam's weapon rests where it struck (it trailed its aim a little at the impact and crept on after it, against the
       recovery's reach limit: it rocked back and forth on the ground), then lifts with the recovery */
    if(T.o.brk&&S.Dimp&&S.tHit!=null&&sT>S.tHit){const k=1-faSS((sT-S.tHit-.12)/.25);if(k>0)Dw.lerp(S.Dimp,k).normalize()}
    const fk=Math.max(.25,Math.min(3,(S.dt||1/30)*30));
    // the aim turns no faster than FA_RATE allows (the clamps below still hold)
    if(S.Dp){const lim=(inF?FA_RATE.ds:FA_RATE.d)*fk,c=Math.max(-1,Math.min(1,S.Dp.dot(Dw))),an=Math.acos(c);
      if(an>lim){const ax=new THREE.Vector3().crossVectors(S.Dp,Dw);if(ax.lengthSq()<1e-10)ax.set(0,1,0).cross(S.Dp);if(ax.lengthSq()<1e-10)ax.set(1,0,0);Dw.copy(S.Dp).applyAxisAngle(ax.normalize(),lim).normalize()}}
    // the recovery never takes the head further toward the target than it was at the hit (it was read as a second blow)
    {const fw=toW([0,0,1],new THREE.Vector3()),zh=tgt.clone().sub(faWP(b.pelvis,FA_v[22])).dot(fw);
      const zt=zh+Dw.dot(fw)*S.wl;   /* the head's reach at the hit, interpolated between the frames either side of s 1.45 */
      const th=S.tHit;if(th!=null&&sT>=th&&S.zHit==null)S.zHit=S.zp&&S.zp[0]<th?S.zp[1]+(zt-S.zp[1])*Math.min(1,(th-S.zp[0])/Math.max(1e-4,sT-S.zp[0])):zt;
      S.zp=[sT,zt];
      /* (eased in: the follow-through may reach on past the hit, the allowance shrinking smoothly to nothing by the recovery;
         a clamp switched on all at once lifted the weapon back up mid-follow-through, read as a flicker) */
      if(th!=null&&sT>th&&S.zHit!=null&&S.wl>0){const ex=th>1.9?0:.6*S.wl*(1-faSS((sT-th-.05)/(1.86-th-.05))),zL=(S.zHitA!=null?Math.min(S.zHit,S.zHitA):S.zHit)+.02*S.sc+ex,dz=Dw.dot(fw);S.zL=zL;let lim=(zL-zh)/S.wl;
        /* the hand draws back first (no lift of the weapon against its swing: that read as a flicker), the weapon turns up
           only for the rest */
        if(dz>lim&&th<1.9){const mv=Math.min((dz-lim)*S.wl,.25*S.A*faSS((1.95-sT)/.15));tgt.addScaledVector(fw,-mv);lim+=mv/S.wl}
        if(dz>lim){const c=Math.max(-1,Math.min(1,lim)),r=Dw.clone().addScaledVector(fw,-dz),rl=r.length();if(rl>1e-6)Dw.copy(r.multiplyScalar(Math.sqrt(1-c*c)/rl)).addScaledVector(fw,c)}}}
    // never through the ground: the head stays a little above the foe's feet
    {const fl=S.gy+.09*S.sc,hy=tgt.y;if(hy+Dw.y*S.wl<fl){const y2=Math.max(-1,Math.min(1,(fl-hy)/(S.wl||1))),hl=Math.hypot(Dw.x,Dw.z)||1,k=Math.sqrt(Math.max(0,1-y2*y2))/hl;Dw.set(Dw.x*k||0,y2,Dw.z*k||Math.sqrt(Math.max(0,1-y2*y2)))}}
    // any hand orientation with the weapon along Dw: a roll about Dw of this one
    const q0=S.Dp&&S.Qp?new THREE.Quaternion().setFromUnitVectors(S.Dp,Dw).multiply(S.Qp):new THREE.Quaternion().setFromUnitVectors(headH,Dw);
    if(FA.dbg){FA.dbg.dd=S.Dp?+(S.Dp.angleTo(Dw)*57.3).toFixed(1):null;FA.dbg.q0d=S.Hp?+(2*Math.acos(Math.min(1,Math.abs(S.Hp.dot(q0))))*57.3).toFixed(1):null;FA.dbg.qpd=S.Hp&&S.Qp?+(2*Math.acos(Math.min(1,Math.abs(S.Hp.dot(S.Qp))))*57.3).toFixed(1):null}
    S.Dp=Dw.clone();
    const Eb=new THREE.Vector3(P.E[0],P.E[1],P.E[2]).normalize();if(prep&&kp>0)Eb.lerp(prep,kp*(1-hardK)).normalize();if(lead)Eb.lerp(lead,hardK).normalize();
    let ew=we.edge?P.ew*Math.max(hardK,faSS(sT/.3)*faSS((2.35-sT)/.3),1.3*kp*(1-hardK)):0;
    let Ew=we.edge?toW([Eb.x,Eb.y,Eb.z],new THREE.Vector3()).normalize():null;
    /* a two-edged blade picks its side once, as the downswing starts (before that either edge will do) */if(we.edge==2&&hardK>0&&!S.eSg){const e0=edH.clone().applyQuaternion(q0);S.eSg=e0.dot(Ew)<0?-1:1}const eSg=we.edge==2?(S.eSg||0):1;
    const hH=S.hH||(S.hH=new THREE.Vector3(0,1,0).applyQuaternion(we.C.q).normalize());
    // choose the roll and where the elbow goes together: a natural wrist first, the edge leading, the elbow near its pole
    const r=faBest(m0,m1,m2,tgt,pole,q0,Dw,edH,Ew,ew,eSg,S.bp,hH,!!(we.edge&&hardK>.5&&P.ew>0),S.bp?{ro:(inF?2.5:1)*FA_RATE.r*fk,ph:(inF?2:1)*FA_RATE.p*fk,fs:(inF&&sT<th0-.12)||FA_RATE.free,fk,nf:sT<hwin[0]-.3||sT>th0+.2}:null,S.bp&&S.wo?S.wo.tw:null,(S.wh||S.fam)?{tw:S.wh?S.wh.tw:0,flex:S.wh?S.wh.flex:0,dev:S.wh?S.wh.dev:0,k:S.wh?3*faSS((sT-2.15)/.35):0,ht:S.fam?S.fam.tw:0,kt:S.fam?1.5*faSS((sT-S.fam.s0)/.15)*faSS((th0+.2-sT)/.15):0}:null);S.Qp=r.Qh.clone();
    if(hb>0){r.Qh.slerp(qHb,hb);const n=tgt.clone().sub(faWP(m0,new THREE.Vector3())).normalize(),pb=eHb.clone().addScaledVector(n,-eHb.dot(n));if(pb.lengthSq()>1e-8)r.pole.lerp(pb.normalize(),hb).normalize();S.Qp=r.Qh.clone()}
    faIK(m0,m1,m2,tgt,r.pole,1);S.bp={E:faWP(m1,new THREE.Vector3()),ph:r.ph};
    const q1=faWQ(m1,FA_q[3]),lq=q1.clone().invert().multiply(r.Qh);faWristClamp(lq,u2,hH,S.wo||(S.wo={}));if(!S.wh){S.wh={tw:S.wo.tw,flex:S.wo.flex,dev:S.wo.dev};}if(FA.dbg){const o=S.wo;FA.dbg.wp=[o.flex,o.dev,o.tw].map(x=>+(x*57.3).toFixed(0));FA.dbg.rt=+(r.tilt*57.3).toFixed(0);FA.dbg.fa=+(Math.acos(Math.max(-1,Math.min(1,faWP(m2,new THREE.Vector3()).sub(faWP(m1,new THREE.Vector3())).normalize().dot(Dw))))*57.3).toFixed(0);FA.dbg.carry=+(Math.acos(Math.max(-1,Math.min(1,-hH.dot(u2))))*57.3).toFixed(0)}faTwist(m1,m2,lq,u2);
    const hHw=q=>(S.hH||new THREE.Vector3(0,1,0)).clone().applyQuaternion(q).normalize();
    // and the hand itself never turns faster than that (a key the wrist can't reach makes the weapon lag, never jump)
    {const qa=faWQ(m2,new THREE.Quaternion());if(S.Hp){let ch=0;
      /* its turn about the weapon's handle (what spins the blade) is held to FA_RATE.s */
      {const d=qa.clone().multiply(S.Hp.clone().invert()),ax=hHw(qa);let sp=2*Math.atan2(d.x*ax.x+d.y*ax.y+d.z*ax.z,d.w);if(sp>Math.PI)sp-=2*Math.PI;if(sp<-Math.PI)sp+=2*Math.PI;
        const ls=FA_RATE.s*(inF?1:.85)*fk;if(Math.abs(sp)>ls){qa.premultiply(new THREE.Quaternion().setFromAxisAngle(ax,-(sp-Math.sign(sp)*ls)));ch=1}}
      const an=2*Math.acos(Math.min(1,Math.abs(S.Hp.dot(qa)))),lim=(inF?FA_RATE.ds:FA_RATE.d)*fk;
      if(an>lim){const tq=qa.clone();qa.copy(S.Hp).slerp(tq,lim/an);ch|=2}
      /* outside the blow the hand follows its solved turn through a short smoothing (35 ms, on game time): two nearly equal
         solutions no longer make it turn back and forth from frame to frame */
      if(S.dt>0&&!(we.edge?sT>hwin[0]-.3&&sT<th0+.25:sT>th0-.15&&sT<th0+.15)){const tq=qa.clone();qa.copy(S.Hp).slerp(tq,1-Math.exp(-S.dt/.035));ch|=4}
      if(FA.dbg)FA.dbg.ch=ch;if(ch)faSetW(m2,qa)}S.Hq0=S.Hp;S.Hp=qa.clone()}
    // the little the wrist can't give, the weapon makes inside the fist: never more than FA_FIST (15° of tilt, 45° of roll
    // about the round handle), so it never visibly angles in the closed hand
    {const W=we.W,qa=faWQ(m2,new THREE.Quaternion()),R=qa.clone().invert().multiply(r.Qh),d=R.x*hH.x+R.y*hH.y+R.z*hH.z;let ro=2*Math.atan2(d,R.w);if(ro>Math.PI)ro-=2*Math.PI;if(ro<-Math.PI)ro+=2*Math.PI;
      const tq=new THREE.Quaternion().setFromAxisAngle(hH,Math.max(-FA_FIST.roll,Math.min(FA_FIST.roll,ro))),sq=R.clone().multiply(new THREE.Quaternion().setFromAxisAngle(hH,ro).invert());
      if(sq.w<0){sq.x=-sq.x;sq.y=-sq.y;sq.z=-sq.z;sq.w=-sq.w}const ta=2*Math.acos(Math.min(1,sq.w));if(ta>FA_FIST.tilt)sq.copy(new THREE.Quaternion().slerp(sq,FA_FIST.tilt/ta));
      const Rp=sq.multiply(tq);if(S.Rf){const an=2*Math.acos(Math.min(1,Math.abs(S.Rf.dot(Rp)))),lim=FA_RATE.f*(inF?4:1)*fk;if(an>lim){const tR=Rp.clone();Rp.copy(S.Rf).slerp(tR,lim/an)}}
      S.Rf=Rp.clone();/* (blended in and out with the pose, w) */faSetFist(we,new THREE.Quaternion().slerp(Rp,w));
      {const tp=W.localToWorld(new THREE.Vector3(0,-(W.userData.faLen||.8),0));if(S.tp){const dv=tp.clone().sub(S.tp);if(dv.length()>.004*S.sc)S.tv=dv.normalize()}S.tp=tp}
      if(T.o.brk&&S.tHit!=null&&sT>=S.tHit&&!S.Dimp)S.Dimp=FA_NY.clone().applyQuaternion(faWQ(W,new THREE.Quaternion()));
      /* the head's real reach at the hit (the weapon may trail its aim a little): the recovery is held to the smaller one */
      {const th=S.tHit,fw=toW([0,0,1],new THREE.Vector3()),z=W.localToWorld(new THREE.Vector3(0,-(W.userData.faLen||.8),0)).sub(faWP(b.pelvis,new THREE.Vector3())).dot(fw);
        /* and if the real head (trailing its aim) is still further out than that, the hand turns it back this frame */
        if(th!=null&&sT>th+.02&&S.zL!=null&&z>S.zL){const hp=faWP(m2,new THREE.Vector3()),tp=W.localToWorld(new THREE.Vector3(0,-(W.userData.faLen||.8),0)),v=tp.sub(hp),vp=v.clone().addScaledVector(fw,-v.dot(fw)),ax=new THREE.Vector3().crossVectors(v,fw);
          const bud=S.Hq0&&sT<2?(inF?FA_RATE.ds:FA_RATE.d)*fk-2*Math.acos(Math.min(1,Math.abs(S.Hq0.dot(faWQ(m2,new THREE.Quaternion()))))):.22;
          if(ax.lengthSq()>1e-10&&bud>0){const th2=Math.min(.22,.1*fk,bud,(z-S.zL)/Math.max(.05*S.wl,vp.length()));faSetW(m2,faWQ(m2,new THREE.Quaternion()).premultiply(new THREE.Quaternion().setFromAxisAngle(ax.normalize(),-th2)));S.Hp=faWQ(m2,new THREE.Quaternion());if(FA.dbg)FA.dbg.cl=+(th2*57.3).toFixed(1)}}
        if(th!=null&&sT>=th&&S.zHitA==null)S.zHitA=S.zpA&&S.zpA[0]<th?S.zpA[1]+(z-S.zpA[1])*Math.min(1,(th-S.zpA[0])/Math.max(1e-4,sT-S.zpA[0])):z;S.zpA=[sT,z]}
      // how far the weapon ended from its aim (diagnostic for authoring: a key the arm can't reach shows here)
      const got=FA_NY.clone().applyQuaternion(faWQ(W,new THREE.Quaternion())),err=Math.acos(Math.max(-1,Math.min(1,got.dot(Dw))));if(w>.5&&err>(S.errM||0)){S.errM=err;S.errS=sT}}
    if(FA.dbg){FA.dbg.s=s;FA.dbg.want=Dw.clone();FA.dbg.head=FA_NY.clone().applyQuaternion(faWQ(we.W,new THREE.Quaternion()));FA.dbg.c=r.c;FA.dbg.sw=r.sw;FA.dbg.tw=r.tw;FA.dbg.ee=r.ee}}
  else{faIK(m0,m1,m2,tgt,pole,1);if(P.rw){const lq=new THREE.Quaternion().setFromAxisAngle(FA_X,P.rw);m2.quaternion.copy(lq);m2.updateMatrixWorld(true)}}
  // ---- off hand ----
  if(P.ow>1e-3){let ot=null;
    if(S.haft&&we){
      // on the haft: the off fist round the handle at weapon point ot, closing on it from the near side (owner: the off hand
      // gripped the staff from the far side, its forearm across the chest). The handle runs through the fist as in the off
      // hand's own carry (thumb toward the same end); the palm faces the way the weapon hand's palm does, mirrored across
      // the body (both hands on the body's side of the shaft, palms away from the body, knuckles out, as on a quarterstaff)
      // (the grip slides along the handle, up to 0.3 weapon units, if the off arm can't reach its point)
      const Ww=faWQ(we.W,new THREE.Quaternion()),oL=faWP(o0,FA_v[22]).distanceTo(faWP(o1,FA_v[23]))+faWP(o1,FA_v[22]).distanceTo(faWP(o2,FA_v[23]));
      let pw=null,bc=1e9;for(let k=-6;k<=6;k++){const p2=we.W.localToWorld(new THREE.Vector3(0,S.ot0*(1-.6*Math.max(0,Math.min(1,P.oc)))+P.ot+k*.05,0)),c=10*Math.max(0,p2.distanceTo(so)-.97*oL)+Math.abs(k)*.05*.02;if(c<bc){bc=c;pw=p2}}
      const qh=faOffQ(S,we,Ww,toW,m2,pw,faWP(S.mA[0].parent,new THREE.Vector3()));
      const an=S.oAn.clone().multiplyScalar(o2.matrixWorld.getMaxScaleOnAxis()).applyQuaternion(qh);ot=pw.sub(an);
      const op=toW(P.OP,new THREE.Vector3()).normalize(),l2o=faWP(o1,FA_v[22]).distanceTo(faWP(o2,FA_v[23])),ei=ot.clone().addScaledVector(o2.position.clone().normalize().applyQuaternion(qh),-l2o).sub(so);
      if(ei.lengthSq()>1e-8){const ke=S.K.c=="staff"?.65:.9;op.multiplyScalar(1-ke).addScaledVector(ei.normalize(),ke).normalize()}
      /* and the elbow kept on the shoulder's side of the shaft, so the forearm comes to the grip from there, never across */
      {const ya=new THREE.Vector3(0,1,0).applyQuaternion(Ww).normalize(),aw=so.clone().sub(pw);aw.addScaledVector(ya,-aw.dot(ya));if(aw.lengthSq()>1e-8)op.addScaledVector(aw.normalize(),.15).normalize()}
      if(FA.dbg)FA.dbg.oo=[+bc.toFixed(3),+(ot.distanceTo(so)/oL).toFixed(3)];
      /* (if the wrist can't turn the whole way, the fist's grip point lands elsewhere: the wrist is moved so the grip point
         is on the shaft for the turn the hand really has, and the arm solved again) */
      const u2o=o2.position.clone().normalize(),anL=S.oAn.clone().multiplyScalar(o2.matrixWorld.getMaxScaleOnAxis()),gp=ot.clone().add(an);let lq2=null;ot=ot.clone();
      for(let it=0;it<3;it++){faIK(o0,o1,o2,ot,op,1);const q1o=faWQ(o1,new THREE.Quaternion());lq2=q1o.clone().invert().multiply(qh);faClamp(lq2,u2o,1.3,2.6);
        const qr=q1o.multiply(lq2),miss=gp.clone().sub(faWP(o2,new THREE.Vector3()).add(anL.clone().applyQuaternion(qr)));if(FA.dbg)FA.dbg.om=[it,+(miss.length()/S.sc).toFixed(3)];if(miss.length()<.002*S.sc)break;ot.add(miss)}
      faTwist(o1,o2,lq2,u2o)}
    else if(S.bw){
      // the bow held out at the target in the off fist: limbs upright (top a little forward), string toward the archer
      ot=mid.clone().addScaledVector(sideW,-P.os*hw).add(toW(P.O,new THREE.Vector3()).multiplyScalar(A));
      faIK(o0,o1,o2,ot,toW(P.OP,new THREE.Vector3()).normalize(),1);
      const W=S.bw.W,yw=toW([0,1,.12],new THREE.Vector3()).normalize(),xw=toW([.12,0,-1],new THREE.Vector3()).normalize();
      const Qw=faFrameQ(new THREE.Vector3(0,1,0),new THREE.Vector3(1,0,0),yw,xw,new THREE.Quaternion()),qh=Qw.multiply(W.quaternion.clone().invert());
      const q1o=faWQ(o1,new THREE.Quaternion()),u2o=o2.position.clone().normalize(),lq2=q1o.clone().invert().multiply(qh);faClamp(lq2,u2o,1.3,2.2);
      const k=faSS(P.ow);o2.quaternion.copy(S.base[o2.name]).slerp(lq2,k);o2.updateMatrixWorld(true)}
    else if(S.shN){
      // the shield held up in front of the chest, face toward the target, pushed out a little at the hit
      const push=.12*Math.exp(-Math.pow((s-1.45)/.22,2));ot=mid.clone().addScaledVector(sideW,-hw).add(toW([.2,-.38+push*.3,.45+push],new THREE.Vector3()).multiplyScalar(A));
      faIK(o0,o1,o2,ot,toW([-.8,-.6,-.15],new THREE.Vector3()).normalize(),1);
      const q1o=faWQ(o1,new THREE.Quaternion()),nc=S.shN.clone().applyQuaternion(q1o),nd=toW([-.25,.1,1],new THREE.Vector3()).normalize();
      const qh=new THREE.Quaternion().setFromUnitVectors(nc,nd).multiply(q1o),lq2=q1o.invert().multiply(qh);faClamp(lq2,o2.position.clone().normalize(),1.3,1.6);o2.quaternion.copy(lq2);o2.updateMatrixWorld(true)}
    else{ot=mid.clone().addScaledVector(sideW,-P.os*hw).add(toW(P.O,new THREE.Vector3()).multiplyScalar(A));
      faIK(o0,o1,o2,ot,toW(P.OP,new THREE.Vector3()).normalize(),1);
      if(P.orw){o2.quaternion.copy(S.base[o2.name]);o2.rotateX(P.orw)}o2.updateMatrixWorld(true)}}
  // ---- blend every touched bone from the earlier layers' pose by w (the off arm by w·ow; the bow arm blends itself) ----
  /* (on a haft the fist holds on fully until it really lets go, then leaves it: a fist 5 % of the way to its rest pose was
     already off the shaft while still "holding" it) */
  const ow=w*Math.min(1,P.ow),owk=S.haft&&we?w*faSS((Math.min(1,P.ow)-.3)/.62):ow;S.owE=ow;
  for(const n in S.base){const bn=b[n];if(!bn)continue;let k=w;if(bn===o0||bn===o1||bn===o2)k=owk;
    if(n=='pelvis'||n=='spine'||n=='chest'||n=='head')continue;   // already scaled by w
    if(S.legs&&/^(lh|rh)/.test(n))k=Math.min(1,w*3);   // solved from the weighted pelvis: planted for most of the blend
    if(S.bw&&bn===o2)k=w;
    if(k<1)bn.quaternion.copy(S.base[n].clone().slerp(bn.quaternion,k))}
  // the drawn string and nocked arrow (the bow foes' own helper): drawn from the nock (s .3) to the anchor (.85), loose at s = 1
  // the weapon's spin about its own handle in the world, on the final (blended) pose: at most FA_RATE.s per 1/30 s, made up
  // by the round handle turning in the fist (within FA_FIST.roll) — the hand's turn can't flip the blade over in one frame
  if(we&&we.W.parent){g.updateMatrixWorld(true);const W=we.W,hH=S.hH,fk=Math.max(.25,Math.min(3,(S.dt||1/30)*30)),qw=faWQ(W,new THREE.Quaternion());
    if(S.Wq&&hH){const d=qw.clone().multiply(S.Wq.clone().invert()),ax=new THREE.Vector3(0,1,0).applyQuaternion(qw);let sp=2*Math.atan2(d.x*ax.x+d.y*ax.y+d.z*ax.z,d.w);if(sp>Math.PI)sp-=2*Math.PI;if(sp<-Math.PI)sp+=2*Math.PI;
      const lm=FA_RATE.s*fk;if(Math.abs(sp)>lm){const Rp=W.quaternion.clone().multiply(we.C.q.clone().invert());let rc=2*Math.atan2(Rp.x*hH.x+Rp.y*hH.y+Rp.z*hH.z,Rp.w);if(rc>Math.PI)rc-=2*Math.PI;if(rc<-Math.PI)rc+=2*Math.PI;
        const dl=Math.max(-FA_FIST.roll,Math.min(FA_FIST.roll,rc-(sp-Math.sign(sp)*lm)))-rc;Rp.multiply(new THREE.Quaternion().setFromAxisAngle(hH,dl));if(FA.dbg)FA.dbg.fsp=+(dl*57.3).toFixed(1);faSetFist(we,Rp);S.Rf=Rp.clone();qw.copy(faWQ(W,new THREE.Quaternion()))}}
    S.Wq=qw}
  if(S.bw&&g.bowW){g.updateMatrixWorld(true);const dr=s<.3||s>=1?0:faSS((s-.3)/.55)*.97+.03,gr=w*faSS((s-.15)/.15)*faSS((2.2-s)/.3);try{eBowFxSet(g,dr,gr)}catch(e){}}
  S.dirty=1}
// remember the final pose (for a fade-out when an attack is cut short)
function faKeep(S,b){if(!S.last)S.last={};for(const n in S.base){(S.last[n]||(S.last[n]=new THREE.Quaternion())).copy(b[n].quaternion)}S.lp=(S.lp||new THREE.Vector3()).copy(b.pelvis.position)}
function faFade(S,b,dt){S.fo=Math.max(0,S.fo-dt/.15);const k=faSS(S.fo);for(const n in S.last)b[n].quaternion.slerp(S.last[n],k);b.pelvis.position.lerp(S.lp,k);S.dirty=1}
// set up a new attack: track, side, sizes
function faBegin(g,S,a){
  const h=g.h,b=h.bones,n=faMove(g,a);S.n++;S.T=faPick(S,n);S.mv=n;S.side=S.K.alt&&n=='strike'&&S.n%2==0?-1:1;
  const R=['aR0','aR1','aR2'].map(x=>b[x]),L=['aL0','aL1','aL2'].map(x=>b[x]);S.mA=S.side>0?R:L;S.oA=S.side>0?L:R;
  g.updateMatrixWorld(true);
  const p=k=>faWP(k,new THREE.Vector3());S.A=p(S.mA[0]).distanceTo(p(S.mA[1]))+p(S.mA[1]).distanceTo(p(S.mA[2]));
  // the size the swing is drawn at: the arm's length, but no more than 1.6 torsos (a troll's or amalgam's very long arms
  // would otherwise sweep huge arcs)
  S.U=Math.min(S.A,1.6*Math.max(.05,p(S.mA[0]).y-p(b.pelvis).y));
  S.LL=S.legs?b.lh1.position.length()+b.lh2.position.length():0;
  S.hwU=p(S.mA[0]).distanceTo(p(S.oA[0]))/2/S.U;
  // the target's chest height (the hero stands ~1.8 tall), in world units above the foe's feet
  const g0=g.getWorldPosition(new THREE.Vector3());S.tgY=g0.y+1.15;S.gy=g0.y;S.sc=g.bs||1;
  S.we=faWpn(h,S.side>0?'R':'L');S.wl=0;
  if(S.we){const W=S.we.W;if(W.userData.faLen==null){const bb=new THREE.Box3();W.traverse(o=>{if(o.isMesh&&o.geometry){o.geometry.computeBoundingBox();bb.union(o.geometry.boundingBox)}});W.userData.faLen=Math.max(.2,-bb.min.y);W.userData.faTail=Math.max(0,bb.max.y)}
    S.wl=W.userData.faLen*W.matrixWorld.getMaxScaleOnAxis()}
  S.wlU=S.wl/S.U;
  const K=S.K,hv=K.hv||0;S.am=1;S.haft=0;S.shN=null;S.bw=null;S.zHit=null;S.zp=null;S.bp=null;S.eSg=0;S.Dp=null;S.Qp=null;S.Rf=null;S.Hp=null;S.Hq0=null;S.Wq=null;S.wh=null;S.zHitA=null;S.zpA=null;S.zL=null;S.D0=null;S.hkOn=0;S.oW=null;S.Dimp=null;S.tp=null;S.tv=null;S.errM=0;S.errS=null;S.hH=null;S.wo=null;S.tHit=S.T&&S.T.o.hit!=null?S.T.o.hit:n=='strike'?1.45:n=='bolt'?1:n=='rainfire'?2:null;
  // melee strikes: the downswing starts inside the wind-up (at s = a, the last ~20–30 %) and accelerates into the hit at
  // s 1.45, so the blow travels over ~5 frames instead of 2; brutes start a little earlier, daggers and ghouls later
  /* a slam's landing key: the hand's height and the weapon's slope there (the hand is placed so the head lands on the ground) */
  /* a strike's hit key: the hand's height there (the blow is shifted up or down by what the hit needs, its shape kept) */
  S.ahH=null;if(S.T&&n=='strike'&&S.tHit!=null){const Q=S.T(S.tHit);if(Q.ah>.5)S.ahH=Q.H[1]}
  S.slm=null;if(S.T&&S.T.o.hit>1.9){const Q=S.T(S.T.o.hit),dn=Math.hypot(Q.D[0],Q.D[1],Q.D[2])||1;S.slm=[Q.H[1],Q.D[1]/dn]}
  S.rm=null;if(n=='strike'){const a=hv>=.7?.7:hv<=.1?.8:.75,X=[0,a-.25,a,1.45,3],Y=[0,.55,1,1.45,3],M=V100A_mono(X,Y);
    S.rm=x=>{let i=0;while(i<3&&x>X[i+1])i++;const h2=X[i+1]-X[i],t=Math.max(0,Math.min(1,(x-X[i])/h2)),t2=t*t,t3=t2*t;return (2*t3-3*t2+1)*Y[i]+(t3-2*t2+t)*h2*M[i]+(-2*t3+3*t2)*Y[i+1]+(t3-t2)*h2*M[i+1]}}
  S.fam=null;if(FA.fam&&S.we&&S.we.edge&&(n=='strike'||n=='slam'))S.fam=faHitFam(g,S);
  if(K.c=='bow'){const e=faWpn(h,'L');if(e&&e.ty=='bow')S.bw=e}
  if((K.c=='two'||K.c=='pole'||(K.c=='staff'&&S.T!==FA_A.rain))&&S.we){const os=S.side>0?'L':'R';S.haft=1;S.ot0=FA_OT[S.we.ty]||0;S.oC=gripCarry(S.we.ty,os).q.clone();
    const gd=h._gripD&&(h._gripD[os]||(h._gripD[S.side>0?'R':'L']&&[-h._gripD[S.side>0?'R':'L'][0],h._gripD[S.side>0?'R':'L'][1],h._gripD[S.side>0?'R':'L'][2]]));
    S.oAn=new THREE.Vector3(GRIP_AN[0]*(os=='L'?-1:1)+(gd?gd[0]:0),GRIP_AN[1]+(gd?gd[1]:0),GRIP_AN[2]+(gd?gd[2]:0))}
  // a shield on the off arm: which way its face points in the hand's frame (it faces out from the body when carried)
  const se=faWpn(h,S.side>0?'L':'R');if(K.sh&&se&&se.ty=='shield'){const qb=faWQ(S.oA[2],new THREE.Quaternion()).invert(),mq=faWQ(b.pelvis.parent,new THREE.Quaternion());
    S.shN=new THREE.Vector3(-S.side,0,0).applyQuaternion(mq).applyQuaternion(qb).normalize()}
  // wind-up time warp: heavy foes heave into the coil later, quick ones snap into it and hold; recovery: heavy settle slower
  const pw=1+hv*.6,pq=1.25-hv*.35;S.sw=k=>k<=0?0:k>=1?1:hv>.5?Math.pow(k,pw):1-Math.pow(1-k,pq);S.sr=x=>x<=0?0:x>=1?1:x+(x*x*(3-2*x)-x)*(.4+.4*hv);   /* an eased recovery: no snap off the follow-through, heavy foes settle slower */
  S.ph=a.ph}
// ---------------- hooks ----------------
{const f=humAnim;humAnim=function(g,now,mv){
  let S=null;try{S=g&&g.h&&faState(g)}catch(e){S=null}
  if(!S)return f.apply(this,arguments);
  const b=g.h.bones,a=g.ak;
  try{if(S.dirty){faRestore(S,b);S.dirty=0}}catch(e){}
  let drive=false;try{drive=faDrives(g,S,a)}catch(e){drive=false}
  // the earlier layers make the plain walk/idle/stance pose (no attack): this file adds the attack on top
  if(drive)g.ak=null;
  let r;try{r=f.apply(this,arguments)}finally{if(drive){g.ak=a;g.h.sw=true}}
  try{const dt=S.t0==null?0:Math.min(.1,Math.max(0,(now-S.t0)/1000));S.t0=now;
    faSnap(S,b);
    if(drive){if(S.ph<0||(a.ph==0&&S.ph!=0))faBegin(g,S,a);S.ph=a.ph;S.dt=dt;faApply(g,S,a,now);faKeep(S,b);S.fo=1}
    else{S.ph=-1;if(S.fo>0&&S.last)faFade(S,b,dt)}}
  catch(e){if(!FA.err){FA.err=1;console.warn('foe attack',e)}}
  return r}}
// mTick tilts and lunges the whole body group (m.pose); for the attacks driven here the body does that itself, feet planted
{const f=animC;animC=function(g,now,mv,sp){const r=f.apply(this,arguments);
  try{const S=g&&g._fa;if(S&&S.ph>=0&&g.b&&g.ak){const x=g.flT?(now-g.flT)/260:2,fl=x>=0&&x<1?Math.pow(1-x,2):0;g.b.rotation.x=-.45*fl;g.b.position.z=-.18*fl}}catch(e){}
  return r}}
