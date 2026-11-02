// ================= v186: weapon basic attacks (owner's list): wand, orb, dagger finisher, claws, one throwing knife =================
// 1. Wand (owner: "when attacking with wand, the characters hand spins"). The raven's carry hold (2220 FC116) faded out at the
//    start of every wand attack and back in after it. Each fade blended the wrist from the attack track's pose to the carry pose
//    by "swing the shaft to its carry direction, then twist": the attack track pointed the wand nearly opposite to the carry
//    direction, so that swing was close to 180° and its axis jumped from frame to frame. The wand tumbled end over end in three
//    frames (117° in one 16 ms tick, test/v186_weapon_anims.py), then turned back between attacks. Now the hold never lets go in
//    a basic attack: the arm stays on the hold's IK and the wand flick is keyed as hand places and wand directions
//    (WA186.wand: draw up and back, snap forward at the release, follow through, back to the carry), so the wrist is solved
//    the same way in every frame and never blends between two unrelated turns.
// 2. Orb (owner: "after attacking with the orb, the character turns it to the side before attacking again"). v141 kept the orb's
//    palm hold through the attack by lifting the beast arm-hold weight with the attack's own ease (orb141K), but that weight
//    falls to 0 at the end of the attack while the real hold (H._brS.a, which the attack had pulled down) only comes back over
//    ~0.4 s: in between the hand dropped to the bone pose, palm turned in, the orb on its side by the hip. Both fixes use one
//    hold weight of their own (H._wa186) that stays at 1 through basic wand / orb attacks and the gaps between them, and only
//    fades for other actions (abilities), at the same rates as the beast hold.
var WA186={on:true,up:5,down:14,
  // wand flick keys [k, hand [out, fwd, down] from the shoulder (m), wand direction [up, out, fwd]]; null = the carry hold
  wand:[[0,null,null],[.2,[.15,.12,.1],[.5,.1,.85]],[.3,[.15,.1,.08],[.58,.1,.8]],[.385,[.1,.36,.1],[.14,.03,1]],[.5,[.09,.38,.14],[-.1,0,1]],[.8,null,null],[1,null,null]]};
// the wand track keeps only the body (twist into the flick, lean, knees, off arm): the weapon arm is the hold's IK, and the old
// track's raised arm (ax −2.1, ex −1.6) under it rolled the forearm ~80° in two frames, which the paw then had to undo
ATK.wand=atkTrack([[0,ATK_REST],[.24,atkEyes({sy:.35,py:.15,sx:-.08,lx:-.6,lz:.2,le:-1.1,lh:-.1,rh:.15,rk:.15,dy:-.02}),'out'],
  [.385,atkEyes({sy:-.25,py:-.18,sx:.14,lx:-.3,le:-.9,lh:-.25,rh:.18,lk:.25,dy:-.04}),'in'],[.5,atkEyes({sy:-.3,py:-.2,sx:.16,lx:-.3,le:-.9,lh:-.25,rh:.18,lk:.25,dy:-.04}),'out'],[1,ATK_REST,'io']]);
function wa186Basic(A,wt){return !!(A&&wt&&((wt=='wand'&&A.pose===ATK.wand)||(wt=='orb'&&A.pose===ATK.orb)))}
function wa186Key(K,k,C){const sm=x=>x*x*(3-2*x),hc=C.hand,dc=C.dir||[0,0,1];let i=0;while(i<K.length-2&&k>K[i+1][0])i++;
  const A=K[i],B=K[i+1],t=sm(Math.max(0,Math.min(1,(k-A[0])/((B[0]-A[0])||1)))),h0=A[1]||hc,h1=B[1]||hc,d0=A[2]||dc,d1=B[2]||dc;
  const d=d0.map((v,j)=>v+(d1[j]-v)*t),l=Math.hypot(d[0],d[1],d[2])||1;return {hand:h0.map((v,j)=>v+(h1[j]-v)*t),dir:d.map(v=>v/l)}}
{const f=fc116Apply;fc116Apply=function(H){
  if(!WA186.on||H!==pl||!H||!H._brS)return f.apply(this,arguments);
  const W=(H.gearG||[]).find(o=>o&&o.userData&&(o.userData.wt=='wand'||o.userData.wt=='orb')&&o.parent);if(!W)return f.apply(this,arguments);
  const wt=W.userData.wt,A=typeof HA!='undefined'?HA.cur:null,basic=wa186Basic(A,wt),now=performance.now();
  // the hold weight: 1 through basic attacks and the gaps between them, eases out for other actions (abilities) and back in
  let g=H._wa186==null?1:H._wa186;const dt=Math.min(.1,Math.max(0,(now-(H._wa186t==null?now:H._wa186t))/1000));
  if(H._wa186t!==now){H._wa186t=now;const out=A&&!basic&&!A.mv164;g=out?Math.max(0,g-dt*WA186.down):Math.min(1,g+dt*(basic?WA186.down:WA186.up));H._wa186=g}
  const S=H._brS,a0=S.a,C=FC116.H[wt],h0=C.hand,d0=C.dir;
  try{S.a=Math.max(a0,g);
    if(wt=='wand'&&basic){const P=wa186Key(WA186.wand,Math.max(0,Math.min(1,A.k||0)),C);C.hand=P.hand;C.dir=P.dir}
    return f.apply(this,arguments)}
  finally{S.a=a0;C.hand=h0;C.dir=d0}}}

// 4. Claws (owner: "optimize how the assassin holds the claw weapons so it looks more natural"). The claws were put in every
//    hand with one fixed turn (rotation.x −.2, 0580 / 1270 GRIP.claws), tuned on the old human fist: on the cat's paw the
//    gauntlet sat crooked across the wrist and the blades hung down or out to the side instead of running along the paw. Now
//    each paw is measured from its own skinned mesh (fc117Frame, 2220: finger direction d, palm side c, palm centre) and the
//    claw is strapped on it: the blades (the model's −y) run along the fingers, in line with the forearm, their hooks (+z)
//    curling toward the palm like a cat's claws, the gauntlet over the back of the paw. The baked claw combo (claw0..claw4,
//    1705) is solved with this same mount (test/v186_bake.py sets V100B_CLAW from cl186Mount), so the blades point where the
//    keys ask.
var CL186={on:true,back:.6,slide:-.025};   // back: gauntlet centre toward the back of the paw (paw thicknesses); slide: along the fingers (m)
function cl186Mount(H,side){const Fp=H&&H.bones&&fc117Frame(H,'a'+side+'2');if(!Fp)return null;const V=THREE.Vector3;
  const c=Fp.c.clone().addScaledVector(Fp.d,-Fp.c.dot(Fp.d)).normalize();
  const q=fc117Basis(new V(0,-1,0),new V(0,0,1),Fp.d.clone().normalize(),c);
  const p=Fp.palm.clone().addScaledVector(c,-Fp.thick*CL186.back).addScaledVector(Fp.d,CL186.slide);
  return {q,p}}
{const f=gripReg;gripReg=function(h){const r=f.apply(this,arguments);
  try{if(CL186.on&&h&&h._grip&&h._race){let ch=0;for(const e of h._grip.L){if(e.ty!='claws')continue;const M=cl186Mount(h,e.side);if(!M)continue;
      const p=[M.p.x,M.p.y,M.p.z];e.C={q:M.q,p,hold:[0,0,0],el:0};e.S={q:M.q.clone(),p:p.slice(),hold:null};ch=1}
    if(ch)gripTick(h,null,false)}}catch(e){if(!CL186.err){CL186.err=1;console.warn('v186 claws',e)}}
  return r}}
try{if(typeof pl!='undefined'&&pl&&pl.bones&&pl._grip)gripReg(pl)}catch(_){}

// 5. Throwing knives (owner: "only throw 1 knife at a time ... comparable damage"). A throw was a fan of 3 knives (5 every 4th
//    throw), .6 rad apart, each knife WB127.knife (.7) of the attack, a second knife of the same throw on the same enemy WB127.knDup
//    (.2). On one enemy only the middle knife usually landed (a normal foe at 2 m or more: .7 a throw); close up or on a big foe
//    the side knives landed too (up to ~1 a throw). Now each throw is one knife straight at the aim, worth WB127.knife1 of the
//    attack (v186_knife.py measures the damage per second against one foe, normal / elite / boss-sized, near and far, before and
//    after). It still pierces to a second enemy (WB127.knPierce) and can still cause bleeding (WFX.knife).
WB127.knife1=.77;
WDESC.knives='Throws one knife at a time, straight at your target. It pierces a second enemy and can cause bleeding.';
WBEH.knives=function(C,s,raw,d,spdK,base){atkCd=base;knN++;SWNOL=1;swingAnim(0,Math.max(170,base*420),()=>{const d2_=aimDir();face(d2_);
  launch(pl.position,d2_,26,{col:0xd8dde6,arrow:1,mt:'p',basic:1,wfx:'knife',pierce:WB127.knPierce},raw*WB127.knife1,.5);const sh=shots[shots.length-1];if(sh)sh.m.scale.set(.7,.7,.55);sfx('stab')})};
