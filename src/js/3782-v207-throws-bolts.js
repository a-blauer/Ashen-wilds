// ================= v207b: throwing knives that vary, crossbow bolts that look like bolts (owner, Nov 8 2026) =================
// Owner: "throwing knife attack animation is too snappy and doesn't seem fluid. Instead of the character doing the same stiff
// throwing animation, make his stance cycle through slightly different throwing animations so it seems more natural." · "Bolts from
// crossbow look odd coming out — check to see if they're sideways or just too big".
//  1. Knives (KN207): every throw plays the baked knife throw with one of KN207.V variations layered on top (a low side-arm whip,
//     a high overhand, a stepping flick, the plain throw), in a cycle that doesn't repeat for 5 throws. Each variation is an offset
//     on the body's channels that swells in during the wind-up and fades out in the recovery (sin envelope), so every throw starts
//     and ends in the same stance and the throws flow into each other. The throw is also given a little more time (KN207.ms: the
//     knife leaves ~35 ms later; the swing recovery of v207 still fills the gap to the next throw). Partners see it: the hero's
//     pose is sampled from the played pose for them (2170).
//  2. Bolts (BL207): they were not sideways; they were the arrow model scaled 1.5×: a 1.3-tile arrow with wide feather fins.
//     A crossbow now shoots a real bolt (KQ207|bolt): short (~0.7), a thick shaft, a square iron head and two small stiff vanes,
//     at its true size. Partners' ghost shots build the same bolt (the 'L' message gains a field at the end: 1 = bolt).
var KN207={i:0,ms:[220,520],order:[0,1,2,0,3],
  // channel offsets at full strength (radians / units of the v100 tracks: sy spine yaw, sx lean, sz roll, py hips, ax/ay/az the throwing
  // shoulder, ex elbow, rw wrist, lx/lz/le the off arm, lk/rk knees, dy crouch, hx head pitch)
  V:[{},
     {sy:-.14,sz:.07,py:-.08,az:.22,ex:-.12,rw:.15,lz:.12,lk:.12,rk:.1,dy:-.035,hx:.04},          // a low side-arm whip
     {sx:.14,ax:-.32,ex:.14,sy:.08,cy:.08,lx:-.22,le:-.18,hx:-.06,rk:.1},                          // a high overhand, leaning in
     {py:.14,sy:.1,ay:.12,rw:.2,lh:-.14,rh:.1,lk:.14,dy:-.02,lx:.12}]};                         // a quick flick off a short step
function kn207Wrap(T,v){if(!v||!Object.keys(v).length)return T;const o={};
  const g=function(k){const p=T(k),e=Math.pow(Math.sin(Math.PI*Math.max(0,Math.min(1,k))),.8);for(const c in p)o[c]=p[c];for(const c in v)o[c]=(o[c]||0)+v[c]*e;return o};
  g.v100=T.v100;return g}
{const f=atkPick;atkPick=function(st){const T=f.apply(this,arguments);
  try{if(KN207.on!==false&&T&&atkWT()==='knives'&&KN207.cur!=null)return kn207Wrap(T,KN207.V[KN207.cur])}catch(_){}return T}}
// the throw: the next variation, a little more time
{const f=WBEH.knives;WBEH.knives=function(C,s,raw,d,spdK,base){KN207.cur=KN207.order[KN207.i++%KN207.order.length];
  const sa=swingAnim;swingAnim=function(st,ms,cb){return sa.call(this,st,Math.max(KN207.ms[0],base*KN207.ms[1]),cb)};
  try{return f.apply(this,arguments)}finally{swingAnim=sa}}}

// ---------------- crossbow bolts ----------------
var BL207={len:.68};
function bl207Mesh(){return lgGroup('KQ207|bolt',k=>{
  k.L('','c',0x5a4026,[0,0,-.3],[0,0,.25],.024,.022,6);                                         // the shaft
  k.p('','cyl','m',0x4a4e56,0,0,.255,.03,.03,.03,Math.PI/2,0,0);                                  // an iron collar
  k.p('','cone4','m',0x5c6068,0,0,.33,.046,.15,.046,Math.PI/2,0,Math.PI/4);                       // the square head
  k.p('','box','c',0x3a2a1a,0,.032,-.25,.006,.06,.12);k.p('','box','c',0x3a2a1a,0,-.032,-.25,.006,.06,.12);   // two stiff vanes
  k.p('','cyl','c',0x2a1e12,0,0,-.31,.026,.02,.026,Math.PI/2,0,0)},.1)}                          // the nock
function bl207Swap(sh){if(!sh||!sh.m)return;const o=sh.m,b=bl207Mesh();b.position.copy(o.position);b.quaternion.copy(o.quaternion);b.userData.lpsSkip=1;
  if(o.parent)o.parent.add(b);if(o.parent)o.parent.remove(o);sh.m=b;sh.bolt207=1}
WBEH.crossbow=function(C,s,raw,d,spdK,base){atkCd=base;bowAnim(base*700);setTimeout(()=>{if(!party.length)return;const d2_=aimDir();face(d2_);
  launch(pl.position,d2_,32,{col:0xc8b080,arrow:1,mt:'p',pierce:99,basic:1,wfx:'xbow',bolt:1},raw,.75);
  const sh=shots[shots.length-1];if(sh){bl207Swap(sh);try{const q=xbowMuzzle116();if(q){sh.m.position.copy(q).addScaledVector(d2_,.3);sh.m.lookAt(sh.m.position.clone().add(d2_))}}catch(_){}}
  sfx('arrow');shake(.05)},base*380)};   // as 0580's, with the bolt at its own size (was the arrow scaled 1.5×)
