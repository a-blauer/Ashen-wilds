// ================= v219: The Black Channel's raft — the drowned keep coming, the Hulk slams like one (owner, Nov 10 2026) =================
// Owner: "When doing the raft mission- the enemies got staggered every time they were hit so the threat of them breaking the raft was a
// lot less than it should be- especially for the elite. Improve the elite's animation when hes attached to the raft and attacking as
// well- and make the raft rock less when he slams it"
//  * Staggering (3316 rt165WTick): any hit on a clinging drowned cancelled what it was doing (its rake too, before the rake landed)
//    and made it flinch, so steady fire kept every plank safe. Now the Drowned Hulk never flinches, and a Wretch flinches only
//    when hit while it is not already tearing or lunging, at most once every RF218.cd seconds: their attacks land.
//  * The Hulk's attack on the planks is its own slam (RF218 pose 'hslam'): it hauls itself up out of the water, both arms high over
//    its head with a roar, holds there (the warning), then hammers both fists down on the planks with its whole body behind them,
//    and drags itself back onto its elbows. Clinging, it heaves its shoulders slowly and lifts its head to look over the deck.
//  * The rocking: a Hulk's slam rocked the raft hard (a 1.6 kick to its roll); it now rocks it about a third as much (RF218.rock).
// Co-op: the host's drowned reach partners as before; partners' copies of a Hulk use the same new poses (3316 rt165Mirror).
var RF218={on:true,cd:2.6,rock:.35,hulk:false};
// ---------- no stagger lock ----------
{const f=rt165WTick;rt165WTick=function(e,w,dt,now){if(RF218.on&&w&&e&&e.c){const hurt=e.c.h<w.hp-.5;
    if(hurt){const t=now/1000,busy=w.act&&(w.act.k==='rake'||w.act.k==='lunge');if(w.hulk||busy||t-(w.fl218||-99)<RF218.cd)w.hp=e.c.h;else w.fl218=t}}
  const o=RF218.hulk;RF218.hulk=!!(w&&w.hulk);
  try{const r=f.apply(this,arguments);
    // the Hulk's body rises with the slam's wind-up and drops into the blow
    try{if(RF218.on&&w&&w.hulk&&w.st==='cling'&&w.act&&w.act.k==='rake'&&e.m){const k=Math.min(1,w.act.t/w.act.T);e.m.position.y+=rf218Rise(k)}}catch(_){}
    return r}finally{RF218.hulk=o}}}
{const f=rt165Mirror;rt165Mirror=function(e,w){const o=RF218.hulk;RF218.hulk=!!(w&&w.hulk);try{return f.apply(this,arguments)}finally{RF218.hulk=o}}}
// ---------- less rocking ----------
{const f=rt165Rake;rt165Rake=function(R,w){const r0=R&&R.rollV;const r=f.apply(this,arguments);try{if(RF218.on&&w&&w.hulk&&R&&r0!=null)R.rollV=r0+(R.rollV-r0)*RF218.rock}catch(_){}return r}}
// ---------- the Hulk's poses ----------
function rf218Rise(a){const up=a<.42?a/.42:a<.5?1-(a-.42)/.08:0,e=up*up*(3-2*up);return .5*e-(a>=.5&&a<.62?.12*Math.sin((a-.5)/.12*Math.PI):0)}
// keys: on the planks (K0) → both arms high overhead, rearing back (K1, by .42) → fists down on the planks, body thrown forward
// (K2, by .52, held to .6) → back onto the elbows (K0, by 1)
var RF218K=[{pitch:.62,sp:.2,ch:.12,nk:-.1,hx:-.5,ax:-1.25,az:.45,ae:-.55,aw:.35},{pitch:.08,sp:-.18,ch:-.22,nk:-.3,hx:-.95,ax:-3.0,az:.28,ae:-.2,aw:-.3},{pitch:1.08,sp:.5,ch:.42,nk:.05,hx:.05,ax:-.85,az:.5,ae:-.12,aw:.3}];
function rf218Slam(a,t,ph){const sm=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},K=RF218K,L=(A,B,u)=>{const o={};for(const k in A)o[k]=A[k]+(B[k]-A[k])*u;return o};
  const q=a<.42?L(K[0],K[1],sm(a/.42)):a<.52?L(K[1],K[2],Math.pow((a-.42)/.1,2)):a<.6?K[2]:L(K[2],K[0],sm((a-.6)/.4));
  const hold=a>.3&&a<.42?.05*Math.sin(t*40):0,arm=(d)=>({x:q.ax+d,z:q.az,e:q.ae,w:q.aw});
  return {pitch:q.pitch,roll:0,sp:q.sp,ch:q.ch,nk:q.nk,hx:q.hx,hy:.06*Math.sin(t*2+ph),hz:0,arms:[arm(hold),arm(-hold)],legs:{k:a*4,a:.25,b:.3,kb:.6}}}
function rf218Cling(t,ph){const s=Math.sin,w=t*.8+ph,look=Math.max(0,s(w*.37));
  return {pitch:.5+.06*s(w),roll:.04*s(w*.7),sp:.14+.06*s(w),ch:.2+.08*s(w*1.1),nk:-.1-.15*look,hx:-.35-.2*look+.08*s(w*.9),hy:.45*s(w*.31),hz:.08*s(w*.5),
    arms:[{x:-1.35+.12*s(w),z:.62+.06*s(w*1.3),e:-.75+.12*s(w*1.1),w:.4},{x:-1.35+.12*s(w+1.9),z:.62+.06*s(w*1.3+1),e:-.75+.12*s(w*1.1+1),w:.4}],legs:{k:w,a:.18,b:.3,kb:.6}}}
{const f=dg165WPose;dg165WPose=function(st,t,ph,k){if(RF218.on&&RF218.hulk){try{if(st==='rake')return rf218Slam(k&&k.k!=null?k.k:0,t,ph);if(st==='cling')return rf218Cling(t,ph)}catch(_){}}return f.apply(this,arguments)}}
