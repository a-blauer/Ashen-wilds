// ================= v186 round 3 (owner, Nov 1 2026): trait objects hidden, bird wings, fangs, skulls, Hivemother =================
// Owner: "Remove the trait objects from the companions- they add too much clutter, I still want the traits present just not
// visually." The traits (Horned, Spiked, Armored, Bulky, Universal) and the colour variants keep their stats and colours; the
// parts they hung on the body (horns, back spikes, the war harness, crystal shards, the Bulky stretch) are no longer drawn.
lpExtras=function(){};
{const f=lpRig;lpRig=function(c,n,D){const g=f.apply(this,arguments);try{if(c&&c.tr=='Bulky'&&g&&g.b)g.b.scale.set(1,1,1)}catch(e){}return g}}
// Owner: "bird companion wings dont smoothly retract their wings after an attack". At the end of an attack the shared animation
// switched the flap from its attack strength to its rest strength in one frame, and the fold began from there: the wings
// jumped. The fold now eases back more slowly, and the wing angle itself is eased toward the animation's angle every frame,
// so a change of flap strength blends over a few frames.
{const f=bw184Anim;bw184Anim=function(x,now){const B=x.bw184,t0=B&&B.t,f0=B?B.f:0;
  const r=f.apply(this,arguments);try{if(!B)return r;const dt=t0?Math.min(.1,Math.max(0,(now-t0)/1000)):0;
    // a slower fold back (the original eased at 5/s toward folded, 10/s toward spread)
    if(B.f>f0&&B.force==null){const fo=B.f;B.f=f0+(B.f-f0)*.55;if(1-fo>.02)x.wings.forEach(wg=>{if(wg.bw&&wg.p)wg.p.rotation.z*=(1-B.f)/(1-fo)});const lv=Math.round(B.f*BW184.lv);if(lv!=B.W.lv){B.W.lv=lv;const geo=bw184Geo(B.W.key,B.W.d,lv);B.W.m.forEach(m=>m.geometry=geo)}}
    const a=dt>0?1-Math.exp(-dt*14):1;x.wings.forEach(wg=>{if(!wg.bw||!wg.p)return;const z=wg.p.rotation.z;if(wg._rz==null||!dt)wg._rz=z;else wg._rz+=(z-wg._rz)*a;wg.p.rotation.z=wg._rz})}catch(e){}return r}}
// Owner: "Lichbone (eyes and nose dont seem right for a skeleton)", "Boneling (too simple, eyes and nose dont seem right for
// skeleton)". The skulls had a black box for each socket with a glowing bar in it and a slot cut in each cheek for a nose. Now
// a hound's skull: round eye sockets set into the skull, facing forward and out, a dark hollow with a small soul-fire point
// deep inside and a bony brow ridge over each; the nasal opening is one dark pear-shaped hole on the front of the snout; and
// the cheekbones sweep back under the sockets.
function sk186Skull(k,P,o){const dark=0x070505,nrm=v=>{const l=Math.hypot(...v);return v.map(a=>a/l)};
  [-1,1].forEach(s=>{const n=nrm([s*.72,.3,.62]),c=P([s*o.ex,o.ey,o.ez]),r=hm186Rot(n),q=P([s*o.ex+n[0]*.007,o.ey+n[1]*.007,o.ez+n[2]*.007]);
    k.p('head','sph2','c',dark,c[0],c[1],c[2],o.er,.014,o.er*.9,r[0],r[1],r[2]);                                  // the socket
    k.p('head','sph','g',o.glow,q[0],q[1],q[2],o.er*.34,o.er*.34,o.er*.34);                                    // the soul-fire point
    const b0=P([s*(o.ex-.03),o.ey+o.er*.85,o.ez-.01]),b1=P([s*(o.ex+.022),o.ey+o.er*.6,o.ez+.005]);k.L('head','c',o.bone,b0,b1,.009,.006,5);  // brow ridge
    const z0=P([s*(o.ex+.008),o.ey-o.er*1.05,o.ez-.005]),z1=P([s*(o.ex+.018),o.ey-o.er*1.2,o.ez-.07]);k.L('head','c',o.boneD,z0,z1,.011,.009,5)}); // cheekbone
  const nz=P([0,o.ny,o.nz]),rn=hm186Rot(nrm([0,.25,1]));k.p('head','sph2','c',dark,nz[0],nz[1],nz[2],o.nw,.008,o.nh,rn[0],rn[1],rn[2])}
{const D=LPR.Boneling,k0=D.kit;D.kit=function(k,c,C,red){const p0=k.p;
  k.p=function(bn,geo){if(bn=='head'&&geo=='box')return k;return p0.apply(k,arguments)};   // the old socket / brow / nose boxes
  let r;try{r=k0.apply(this,arguments)}finally{k.p=p0}
  try{const lich=rv137('Boneling',c)=='Lichbone',K=lich?LB150.cols(C):boneCols(C),bone=K.bone.getHex(),glow=red?0xff2a2a:K.glow.getHex();
    sk186Skull(k,boneP,lich?{ex:.066,ey:.705,ez:.57,er:.044,ny:.64,nz:.79,nw:.015,nh:.024,bone,boneD:dkShade(bone,.86),glow}
                           :{ex:.058,ey:.627,ez:.57,er:.04,ny:.572,nz:.75,nw:.014,nh:.022,bone,boneD:dkShade(bone,.86),glow})}catch(e){console.error('sk186',e)}
  return r}}
// Owner: "Direfang fangs are not connected to his mouth properly." The sabre fangs rooted at the outer corner of the muzzle,
// below the edge of the upper lip, so they hung beside the mouth. Their roots now sit inside the upper jaw, a little in from
// the side, with a dark lip fold over each root; the fang keeps its length and curve.
// Round 3 review: the old armoured brow (a round bone cap over the skull, three plank plates stepping down the muzzle and
// their scar gouges) read as a hat and planks nailed to the snout: gone. The heavy brow ridges over the eyes stay.
{const f=df150Kit;df150Kit=function(k,c,C,red){const p0=k.p;
  k.p=function(bn,geo,t,col,x,y,z,sx){if(bn=='head'&&((geo=='hem'&&col===0xb4a68a)||(geo=='box'&&col===0x3a2c22)||(geo=='box'&&x===0&&(col===0xb4a68a||col===0x7a6e5a)&&z>.7&&z<.84&&sx<.075)))return k;return p0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.p=p0}}}
{const f=df150Kit;df150Kit=function(k,c,C,red){const L0=k.L,iv=0xece2c8;
  k.L=function(bn,t,col,a,b,r1,r2,seg){if(bn=='head'&&col===iv&&a&&Math.abs(Math.abs(a[0])-.062)<1e-6&&a[1]===.64&&a[2]===.86){const s=Math.sign(a[0]);
      L0.call(k,'head','c',0x2a1a1a,[s*.05,.655,.835],[s*.056,.642,.87],.016,.014,5);   // the lip fold over the root
      return L0.call(k,bn,t,col,[s*.05,.662,.852],[s*.058,.56,.874],.019,.013,seg)}
    if(bn=='head'&&col===iv&&a&&Math.abs(Math.abs(a[0])-.066)<1e-6&&a[1]===.55&&a[2]===.875){const s=Math.sign(a[0]);return L0.call(k,bn,t,col,[s*.058,.56,.874],[s*.052,.47,.86],r1,r2,seg)}
    return L0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.L=L0}}}
// Owner: "(other stages also have a floating bit at tip of beak)". The evolution's metal / gold beak caps were drawn at the
// old jointed beak's tip, out in the air in front of the one-piece beak; they are gone.
{const D=EVO100.D.Skyhawk,b0=D.build;D.build=function(E,L,P,c){const L0=E.L;
  E.L=function(a,b,r1,r2,t,col,seg,o){if(o&&o.bn=='head'&&a&&b&&!a[0]&&!b[0]&&a[2]>.55&&b[2]>.55&&b[1]<a[1])return E;return L0.apply(E,arguments)};
  try{return b0.apply(this,arguments)}finally{E.L=L0}}}
