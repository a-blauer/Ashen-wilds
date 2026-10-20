// ================= v100 anim: weighty, readable basic attack swings + a natural bow carry =================
// Why: the v85 swing tracks were joint-angle guesses: blades often travelled sideways or along odd arcs, the body barely
// took part, and the keys were mixed with a single ease each. v100 bakes every hero melee basic attack from a description
// of the strike itself (test/v100_anim_moves.js): where the weapon hand goes along a real swing arc (forehand: high on the
// weapon side → across → low past the off hip; backhand: the mirror; overhead: up behind the head → straight down in
// front; thrusts: straight out), which way the blade points (it lags behind the hand in the wind-up and whips through at
// contact), and what the body does (weight back → front foot, hips turn before the shoulders, chest twist and lean into
// the blow, knees bend, the off hand counterbalances or rides the handle of a two-hander, the head stays on the target).
// test/v100_anim_bake.js solves the arm angles for those targets with a small IK on the real (v99) skeleton and sets the
// pelvis drop so the lower foot stays on the ground; the result is V100A_K (zzN_zz_anim0_data.js).
// Timing beats per swing (fractions of the game's own duration, unchanged): settle into the wind-up (anticipation, a short
// hold at full coil) → accelerate (hips first) → contact exactly at .42 (the game's hit moment) → follow-through past the
// target → recover with a small overshoot → rest. Heavy weapons coil longer and recover slower; daggers/claws are snappy.
// Keys are played with monotone cubic interpolation per channel (smooth, no unwanted overshoot) plus a small per-channel
// time offset (hips and legs lead, the wrist trails). New pose channels: spine side-bend (sz), chest twist (cy), hip yaw
// (lhy/rhy, keeps the feet pointing forward while the pelvis turns), ankles (la/ra), off-arm roll (ly), wrist deviation
// (rz/lq). Gameplay is untouched: same hit moments, durations, cooldowns, ranges and damage — only bone rotations change.
// Bow: the carry grip now holds the bow at the riser low at the side, limbs near vertical, string facing out (away from the
// leg), the arm relaxed (V100A_BOW); shots still use the v85/v91 draw.
var V100A_LAG={py:-.03,pz:-.025,dy:-.02,lh:-.03,rh:-.03,lk:-.03,rk:-.03,lhy:-.03,rhy:-.03,la:-.03,ra:-.03,sy:-.012,sx:-.01,sz:-.01,cy:-.004,hx:-.02,hy:-.02,
  ax:0,ay:0,az:0,ex:.004,rw:.012,rz:.012,lx:.01,ly:.01,lz:.01,le:.016,lw:.02,lq:.02};
// extra channels on the hero/humanoid skeleton (key -> [bone, axis]); legs get the moving-blend treatment like the old ones
(function(){const X={sz:['spine','z'],cy:['chest','y'],lhy:['lh0','y'],rhy:['rh0','y'],la:['lh2','x'],ra:['rh2','x'],ly:['aL0','y'],rz:['aR2','z'],lq:['aL2','z']};
  for(const k in X)HACH[k]=X[k];['lhy','rhy','la','ra'].forEach(k=>HA_LEGS[k]=1);
  Object.assign(ATK_REST,{sz:0,cy:0,lhy:0,rhy:0,la:0,ra:0,ly:0,rz:0,lq:0})})();
// monotone cubic (Fritsch–Carlson) through the keys of one channel
function V100A_mono(T,Y){const n=T.length,m=new Float64Array(n),d=new Float64Array(n);
  for(let i=0;i<n-1;i++)d[i]=(Y[i+1]-Y[i])/((T[i+1]-T[i])||1e-6);
  m[0]=0;m[n-1]=0;for(let i=1;i<n-1;i++){if(d[i-1]*d[i]<=0)m[i]=0;else{const w1=2*(T[i+1]-T[i])+(T[i]-T[i-1]),w2=(T[i+1]-T[i])+2*(T[i]-T[i-1]);m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i])}}
  return m}
// a playable track from baked keys: B = {ch:[names], keys:[[k, e, v...], ...]}; returns k -> pose (one reused object)
function V100A_track(B){
  const ch=B.ch,K=B.keys,n=K.length,T=K.map(q=>q[0]),C=[],o={};
  ch.forEach((c,j)=>{const Y=K.map(q=>q[2+j]);C.push({c,Y,M:V100A_mono(T,Y),lag:V100A_LAG[c]||0})});
  const f=function(k){
    for(let j=0;j<C.length;j++){const q=C[j];let x=k-q.lag*(k<.97?1:0);if(x<0)x=0;else if(x>1)x=1;
      let i=0;while(i<n-2&&x>T[i+1])i++;const h=(T[i+1]-T[i])||1e-6,t=(x-T[i])/h,t2=t*t,t3=t2*t;
      o[q.c]=(2*t3-3*t2+1)*q.Y[i]+(t3-2*t2+t)*h*q.M[i]+(-2*t3+3*t2)*q.Y[i+1]+(t3-t2)*h*q.M[i+1]}
    return o};
  f.v100=1;return f}
var V100A={on:true,T:{}};
// build all tracks from the baked data (re-run after re-baking in the page)
function V100A_build(){const D=typeof V100A_K!='undefined'?V100A_K:null;V100A.T={};if(!D)return;
  for(const n in D.mv)V100A.T[n]=V100A_track({ch:D.ch,keys:D.mv[n]})}
// which baked move plays for weapon wt at combo step st (null = keep the v85 track)
var V100A_MAP={sword:['sword0','sword1','sword2'],gs:['gs0','gs1','gs2'],ga:['ga0','ga1','ga2'],mace:['mace0','mace1','mace2'],hammer:['mace0','mace1','hammer2'],
  flail:null,axes:['axes0','axes1','axes2','axes3'],dagger:['dag0','dag1','dag2','dag3'],claws:['claw0','claw1','claw2','claw3','claw4'],
  halberd:['hal0','hal1','hal2'],knives:['knives'],sling:['sling']};
{const f=atkPick;atkPick=function(st){
  try{if(V100A.on){if(!V100A.T.sword0)V100A_build();
    const wt=atkWT(),L=V100A_MAP[wt]||(MW[wt]||wt=='staff'||wt=='bow'||wt=='crossbow'||wt=='wand'||wt=='orb'?null:V100A_MAP.sword);
    if(L){const N=MW[wt]?MW[wt].N:(CLS[hero.cls]||{}).atk=='melee4'?4:3,step=MW[wt]?((combo|0)+N-1)%N:(L.length==4?((combo|0)+N-1)%N:st);
      const T=V100A.T[L[Math.min(L.length-1,Math.max(0,step))]];if(T)return T}}}catch(e){console.warn('v100 anim',e)}
  return f.apply(this,arguments)}}
// co-op partners: their swing plays the new forehand/backhand
{const f=mpSwingRH;mpSwingRH=function(h){if(!V100A.on||!V100A.T.sword0){try{V100A_build()}catch(_){}}const T0=V100A.T.sword0,T1=V100A.T.sword1;
  if(!T0||!T1||h.sw||!h.bones)return f.apply(this,arguments);h.sw=1;const b=h.bones,T=(h._sn=((h._sn|0)+1)%2)?T1:T0;
  tw(300,k=>{const P=T(k);for(const c in P){if(HA_LEGS[c])continue;const ch=HACH[c];if(ch&&b[ch[0]])b[ch[0]].rotation[ch[1]]=P[c]}},()=>{h.sw=0})}}

// ---------------- bow carry (idle, walking, combat-ready, riding, previews, archer foes) ----------------
// The bow model is a deep C: the riser sits .555 in front of the string and the limb tips are ±.6 above/below it, so held
// upright at a hanging hand the lower limb touched the ground and swept through the legs when walking. Now it is carried like
// a hunter carries a longbow: the left hand on the riser, the bow tipped forward-down (phi) and turned a little out (psi),
// string behind the hand, the lower limb trailing back clear of the leg; the arm hangs relaxed, slightly out from the body
// with a soft elbow. Shots are untouched (the v93 strike grip takes over at the start of a shot, as before).
var V100A_BOW={phi:.28,psi:.2,roll:-.08,lx:-.06,lz:-.13,le:-.22,sw:.65,an:[0,-.045,.015]};
function V100A_bowQ(){const B=V100A_BOW,E=THREE.Euler,Q=THREE.Quaternion,V3=THREE.Vector3;
  // model axes: +x riser→string, +y upper limb. Wanted (hero frame): string back-up, limb up-forward, yawed out
  const X=new V3(0,Math.sin(B.phi),-Math.cos(B.phi)),Y=new V3(0,Math.cos(B.phi),Math.sin(B.phi)),Z=new V3().crossVectors(X,Y);
  const m=new THREE.Matrix4().makeBasis(X,Y,Z),q=new Q().setFromRotationMatrix(m);
  q.premultiply(new Q().setFromEuler(new E(0,B.psi,B.roll)));
  // undo the nominal hand orientation (relaxed carry arm: upper arm lx/lz, elbow on top of the walk layer's −.25)
  const qh=new Q().setFromEuler(new E(B.lx,0,B.lz)).multiply(new Q().setFromEuler(new E(-.25+B.le,0,0)));
  return qh.invert().multiply(q)}
{const f=gripCarry;gripCarry=function(ty,side){const r=f.apply(this,arguments);
  if(ty=='bow'&&V100A.on){try{r.q=V100A_bowQ();r.an=V100A_BOW.an.slice()}catch(e){}}return r}}
// re-register models built before this file loaded (the hero), so they use the new carry
try{if(typeof pl!='undefined'&&pl&&pl.bones&&pl._grip)gripReg(pl)}catch(_){}
// the relaxed carry arm, blended by the grip's carry weight (0 while shooting)
function V100A_bowArm(h){const S=h&&h._grip;if(!S||!S.L||!V100A.on)return;let bow=null;for(const e of S.L)if(e.ty=='bow'&&e.W&&e.W.parent){bow=e;break}if(!bow)return;
  const w=gripSS(S.w==null?1:S.w);if(w<=1e-3)return;const b=h.bones,B=V100A_BOW,mw=h._ga?h._ga.w:0;
  // the bow arm barely swings while walking (the bow is carried steady, clear of the legs)
  b.aL0.rotation.x*=1-B.sw*w*mw;
  b.aL0.rotation.x+=B.lx*w;b.aL0.rotation.z+=B.lz*w;b.aL1.rotation.x+=B.le*w}
{const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);try{h=h||pl;if(h&&h.bones&&!(h===pl&&typeof riding!='undefined'&&riding))V100A_bowArm(h)}catch(e){}return r}}

// ---------------- humanoid foes: the same strikes on their own phase timings ----------------
// g.ak = {n, ph 0 wind-up k 0→1, ph 1 act k 0→1 (strike hits at k .45), ph 2 recover k 1→0}. The wind-up holds at full coil
// (the dodge tell keeps its tremble), the act phase runs the baked track from coil through contact (.45 of the act = the hero
// track's .42) and on into the follow-through, the recovery settles back to the walk layer. Foes alternate forehand/backhand
// strikes; slams use the overhead (two-handed for great weapons and hammers). Other moves keep the v85 poses.
var V100A_HUM={strike:['sword0','sword1'],slam:['sword2'],bite:['sword0','sword1'],pounce:['sword2']};
var V100A_HUM2={gs:{strike:['gs0','gs1'],slam:['gs2']},hammer:{strike:['mace0','mace1'],slam:['hammer2']},club:{strike:['mace0','mace1'],slam:['mace2']},
  axe:{strike:['sword0','sword1'],slam:['ga2']},dagger:{strike:['dag0','dag2'],slam:['dag3']}};
// map the foe phase onto the hero track's k: wind-up 0 → hold (.3), act 0 → .45 hits at .42, then on to the follow (.6), recover .6 → 1
function V100A_humK(ph,k){return ph==0?.3*(1-Math.pow(1-Math.min(1,k/.85),2)):ph==1?(k<.45?.3+.12*(k/.45):.42+.18*((k-.45)/.55)):.6+.4*(1-k)}
// foes: the shield / off arm keeps the foe's own look (skeleton shield up), so only the weapon arm and body come from the track
var V100A_HUMOFF={lx:1,ly:1,lz:1,le:1,lw:1,lq:1};
{const f=humAtkPose;humAtkPose=function(n,ph,k,now,g){
  try{if(V100A.on&&V100A_HUM[n]){if(!V100A.T.sword0)V100A_build();const wt=g&&g._v100wt,L=(wt&&V100A_HUM2[wt]&&V100A_HUM2[wt][n=='bite'?'strike':n=='pounce'?'slam':n])||V100A_HUM[n];
    const T=V100A.T[L[(g&&g._v100n|0)%L.length]];
    if(T){const P=T(V100A_humK(ph,k)),o=g&&g._v100o||(g?(g._v100o={}):{});const two=/^(gs|ga|hal)/.test(L[0]);
      for(const c in P){if(!two&&V100A_HUMOFF[c]){o[c]=ATK_REST[c]+(c=='lx'?-.5:c=='le'?-.9:c=='lz'?-.2:0);continue}o[c]=P[c]}
      // the rest pose of the hero tracks is the hero's arm rest; foes add these as offsets from ATK_REST like the v85 poses
      if(ph==0&&k>.72){const tr=(k-.72)/.28;o.ax+=Math.sin(now/32)*.05*tr;o.lx+=Math.sin(now/37)*.035*tr;o.sx+=Math.sin(now/45)*.018*tr}
      return o}}}catch(e){}
  return f.apply(this,arguments)}}
// the v85 humAnim wrapper now passes the model (build/pN_zz_anim.py); remember its weapon type and count its attacks so
// consecutive strikes alternate forehand / backhand (m.ak is rebuilt every tick, so count wind-up starts)
{const f=humAnim;humAnim=function(g,now,mv){const a=g.ak;try{if(V100A.on){const ph=a?a.ph:-1;
    if(g._v100wt==null){const W=g.h&&g.h.bones&&g.h.bones.aR2.children.find(o=>o.userData&&o.userData.wt);g._v100wt=W?W.userData.wt:''}
    if(ph==0&&g._v100ph!==0)g._v100n=(g._v100n|0)+1;g._v100ph=ph}}catch(_){}
  return f.apply(this,arguments)}}
