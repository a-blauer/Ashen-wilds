// ================= v192: hero fit — the Ranger's bow after a shot, the Ranger's hoods and chest pieces, the Bard's lute hand =================
// Owner (Nov 2 2026):
//  1. "Ranger class holds bow wrong after shooting — but then corrects itself after a second or two."
//     Cause: v163 (3220, EDGE163) keeps the hands in the STRIKE grip for EDGE163.hold (2 s) after any attack, and all the time
//     while a monster hunts nearby, so a melee edge doesn't flip round between swings. The bow's strike grip is the shooting
//     hold (upright, held by the riser, gripStrikeOf 1270), meant for a raised bow arm. After the shot's pose (bowPose) ends,
//     the arm goes back to its low carry, but the grip stayed in the shooting hold: the bow hung upright by the hip, half
//     turned, until 2 s later the grip eased back to the v135 carry across the hips. Measured by test/v192_hero_fit.py.
//     Now a bow uses the strike grip only while a shot pose plays (eased in over 0.26 s) and goes back to the carry as the arm
//     lowers into the follow-through (last quarter of the draw), in a fight too. Melee weapons keep v163's hold.
//  2. "The helmet and chest pieces for the ranger class seem strange and don't fit his body well."
//     Cause: every Ranger hood is a v136 gkHood: cloth measured round EVERYTHING built before it (it is built last, gkLater),
//     each row the convex hull of what is there + clearance, and below the widest row the cloth "hangs" straight down. On the
//     weasel (the slimmest, most sloped body: TR .9 at the shoulders) the chest's loose decorations stick far out of the body:
//     the feathers and bone charms on the left shoulder (2540 mdExtra), the feather / spike shoulder fans of the coats, the
//     fur collar's tufts, the motif horns (2760) and the v178 tier V feather mantle (3372). The hood's hull went round their
//     tips, so its mantle became a stiff collar far wider than the shoulders, sitting high and flat like a tray with a gap
//     to the body (from behind: a flat disc above the shoulders). The weasel's coat skirts were hung round the belt pouches and
//     knife the same way: a wide bell round thin legs.
//     Now (a) a hood measures only the body and what lies on it: a point counts when it is within FIT192.near (FIT192.nearHead
//     above the neck) of the bare body's own section at that height; loose details are left out and now sit on / poke through
//     the cloth like trinkets; (b) the weasel's hood is cut closer (FIT192.loose, and below the neck no further than FIT192.cap
//     from the bare body: it drapes over the shoulders) and its face opening sits further back round the long muzzle; (c) the weasel's
//     skirts are measured the same way (FIT192.nearSk). The other four races keep their v136 hoods exactly (their bodies are
//     broad enough that the trinkets stay inside the cloth; v136_gear checks their hood clearance).
//  3. "Bard's hand is phasing through his instrument." The Duskhold Bard (hare, 1900 WK103.bard + 2995 bard141): his strumming
//     shoulder is behind the lute's bowl and bard141's IK bent the elbow down and back, so the forearm went straight through
//     the bowl and the paw came out of the sound hole, every frame of his loop (out/v192_bard_before.jpg). Now the paws reach
//     for the strings just in front of the soundboard and for the neck from behind, and the elbow direction is chosen so no
//     part of either arm enters the bowl (BARD192): the forearm comes over the bowl's upper edge.
// Co-op: all three are deterministic from what partners already receive (gear from the shared item templates and look; the
// partner's replayed shot ends with h.sw, after which 1270 already eases its bow to the carry; the Bard is town scenery).
var FIT192={on:true,bow:true,near:.06,nearHead:.05,loose:.012,cap:.055,skirt:true,bard:true};

// ---------------- 1. the bow: no strike grip outside the shot ----------------
// For the player's own hero with a bow, the grip weight (S.w: 1 carry, 0 strike) is worked out here instead of by 1270 / 3220:
//  * strike grip only while a shot (or another action pose) plays; the last BOW192.tail of a bow draw (the arm already lowering
//    into the follow-through) counts as carry, so the bow turns back to the carry while the arm comes down;
//  * into the strike grip over BOW192.in s, from where the bow sits in the fist when the shot starts (1270 turned it in ~0.05 s and clamped it to the shot's first 18%: v163 found 60-104°
//    in one frame and kept the strike hold between shots to hide that); back to the carry over BOW192.out s (as before).
// Co-op partners' heroes already left the strike grip when the replayed shot ended (1270: att = h.sw); they are unchanged.
var BOW192={in:.26,out:.28,tail:.76};
function fit192Bow(h){const S=h&&h._grip;if(!S||!S.L)return false;for(const e of S.L)if(e.ty=='bow'&&e.W&&e.W.parent)return true;return false}
function fit192Draw(A){return !!A&&(A.pose===bowPose||(typeof fxaPose=='function'&&A.pose===fxaPose))}
{const f=gripTick;gripTick=function(h,now,el,att){
  if(!FIT192.on||!FIT192.bow||h!==pl||now==null||!h._grip||!fit192Bow(h))return f.apply(this,arguments);
  const S=h._grip,A=typeof HA!='undefined'?HA.cur:null,mv=!!(A&&A.mv164);
  const shoot=!!A&&!mv&&!(fit192Draw(A)&&A.k>=BOW192.tail);
  const dt=S.t!=null?(now-S.t)/1000:-1;
  // the carry is held steady in the hero's frame (2390 bow135Carry): while the arm swings up into the draw that target turns
  // with it against the hand, so the bow spun in the fist (v163_weapons: 218° in 0.1 s). From the frame a shot starts, the
  // carry is the bow's place in the hand at that moment (H._b192), and the hand turns it into the strike grip from there
  if(shoot&&!h._b192){const lf=h._b192f;if(lf)h._b192={q:lf.q.clone(),p:lf.p.clone()};else{const e=S.L.find(q=>q.ty=='bow'&&q.W&&q.W.parent);if(e)h._b192={q:e.W.quaternion.clone(),p:e.W.position.clone()}}}
  if(S.w==null||!(dt>=0)||dt>.5)S.w=shoot?0:1;
  else S.w=shoot?Math.max(0,S.w-dt/BOW192.in):Math.min(1,S.w+dt/BOW192.out);
  if(!shoot&&h._b192&&S.w>=.999)h._b192=null;
  S.t=now;if(A&&!mv)EDGE163.last=nowP();
  // the rest of the grip (placing the bow by that weight, the elbow, the hold) as before; undefined = keep the weight
  return f.call(this,h,undefined,el,att)}}
// while a shot plays the carry end of the blend is that hand-held snapshot (no spin in the fist while the arm swings up); over
// the shot's last quarter (the arm lowering) it turns into the v135 carry held in the hero's frame, which takes over after the
// shot. Runs after gripTick (2390's bow135Carry is wrapped: it runs last in animHero).
var FIT192_Q=null;
// the bow's final place in the hand each frame (the snapshot a shot starts from)
function fit192Keep(h){try{const S=h._grip,e=S&&S.L&&S.L.find(q=>q.ty=='bow'&&q.W&&q.W.parent);if(!e)return;const K=h._b192f||(h._b192f={q:new THREE.Quaternion(),p:new THREE.Vector3()});K.q.copy(e.W.quaternion);K.p.copy(e.W.position)}catch(_){}}
{const f=bow135Carry;bow135Carry=function(h){const L=h&&h._b192;if(!FIT192.on||h!==pl)return f.apply(this,arguments);if(!L){const r=f.apply(this,arguments);fit192Keep(h);return r}
  try{return fit192Carry(h,L)}finally{fit192Keep(h)}}}
function fit192Carry(h,L){
  const S=h._grip,A0=typeof HA!='undefined'?HA.cur:null,A=A0&&!A0.mv164?A0:null;   // after the shot (no A): the v135 carry (u = 1) until the grip is back
  const e=S&&S.L&&S.L.find(q=>q.ty=='bow'&&q.W&&q.W.parent);if(!e||!e.S)return;const w=gripSS(S.w==null?1:S.w);if(w<=1e-3)return;
  const Q=FIT192_Q||(FIT192_Q={a:new THREE.Quaternion(),b:new THREE.Quaternion(),t:new THREE.Quaternion(),c:new THREE.Quaternion()});
  let tq=L.q;const u=!A?1:fit192Draw(A)?Math.max(0,Math.min(1,(A.k-BOW192.tail)/(1-BOW192.tail))):0;
  if(u>0&&V100A_BOW.x135){const W=e.W,P=W.parent;P.updateWorldMatrix(true,false);h.getWorldQuaternion(Q.a);P.getWorldQuaternion(Q.b);
    Q.t.copy(Q.b.invert()).multiply(Q.a).multiply(bow135Q());tq=Q.c.copy(L.q).slerp(Q.t,u*u*(3-2*u))}
  const W=e.W,sx=W.scale.x,hd=e.S.hold,ps=hd?new THREE.Vector3(hd[0]*sx,hd[1],hd[2]).applyQuaternion(e.S.q).negate().add(new THREE.Vector3(...e.S.p)):new THREE.Vector3(...e.S.p);
  W.quaternion.copy(e.S.q).slerp(tq,w);
  // the riser stays in the hand (the carry's hold point at the anchor, as bow135Carry places it)
  const C=e.C,an=C.an||GRIP_AN,hv=new THREE.Vector3(C.hold[0]*sx,C.hold[1]*W.scale.y,C.hold[2]*W.scale.z).applyQuaternion(tq),pc=new THREE.Vector3(an[0]-hv.x,an[1]-hv.y,an[2]-hv.z);
  W.position.copy(ps).lerp(pc.lerp(L.p,1-u),w)}

// ---------------- 2. hoods measure the body and what lies on it ----------------
// the bare body's section at height y: the hull radius per angle of the body triangles only (BR body builders: GL176.body
// counted parts + the skinned body lofts built before any gear). We take the body sections from the build itself: every
// triangle built before the first piece of gear (B.__fit192n0, set when the chest / helm / boots start) is "body".
function fit192Mark(B){if(!B||!B.L||B.__fit192n0)return;const n={};for(const t in B.L)n[t]=B.L[t].p.length;B.__fit192n0=n}
['mdChest','mdHelm','mdBoots','mdChestPre'].forEach(nm=>{const f=window[nm];if(typeof f!='function')return;window[nm]=function(B){try{if(B&&B.L)fit192Mark(B)}catch(_){}return f.apply(this,arguments)}});
// the class outfit's base pieces (no chest item) go on through O.base / O.extra: mark before them too
{const f=mdHead;mdHead=function(B){const r=f.apply(this,arguments);try{if(B&&B.L&&!B.__fit192h){const n={};for(const t in B.L)n[t]=B.L[t].p.length;B.__fit192h=n}}catch(_){}return r}}
// body sections: per height bin (2 cm), the 2-D hull of the body's points
function fit192Body(B){if(B.__fit192S)return B.__fit192S;const n0=B.__fit192h||B.__fit192n0;if(!n0)return null;const pts=[];
  ['c','m','g'].forEach(t=>{const L=B.L[t];if(!L)return;const p=L.p,e=Math.min(p.length,n0[t]||0);for(let i=0;i<e;i+=3){const y=p[i+1];if(y>.25)pts.push(p[i],y,p[i+2])}});
  const bins=new Map(),bw=.02;for(let i=0;i<pts.length;i+=3){const k=Math.round(pts[i+1]/bw);let a=bins.get(k);if(!a)bins.set(k,a=[]);a.push([pts[i],pts[i+2]])}
  const H=new Map();bins.forEach((a,k)=>H.set(k,gkHull(a)));return B.__fit192S={H,bw}}
// distance of (x, z) outside the body hull at height y (0 inside); no section there → 0 (keep)
function fit192Out(S,x,y,z){const k=Math.round(y/S.bw);let h=S.H.get(k);if(!h||h.length<3){h=S.H.get(k-1)||S.H.get(k+1);if(!h||h.length<3)return 0}
  // inside test + distance to the polygon
  let inside=false,dm=1e9;for(let i=0,j=h.length-1;i<h.length;j=i++){const a=h[i],b=h[j];
    if(((a[1]>z)!=(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1]+1e-12)+a[0]))inside=!inside;
    const ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez||1e-12,t=Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[1])*ez)/L2)),dx=a[0]+ex*t-x,dz=a[1]+ez*t-z;dm=Math.min(dm,Math.hypot(dx,dz))}
  return inside?0:dm}
// while a hood is measured, gkPts leaves out points far from the body (loose details); the head (above the neck) keeps a
// tighter limit so whiskers and the muzzle tip do not widen the cowl
var FIT192_HOOD=null;
{const f=gkPts;gkPts=function(B,y0,y1,filt,exRe){const H=FIT192_HOOD;if(!FIT192.on||!H||H.B!==B)return f.apply(this,arguments);const S=H.S;
  const f2=(x,y,z)=>{if(filt&&!filt(x,y,z))return false;const lim=y>H.yNeck?FIT192.nearHead:FIT192.near;return fit192Out(S,x,y,z)<=lim};
  return f.call(this,B,y0,y1,f2,exRe)}}
// only the weasel: the other four races' hoods fit their bodies and keep their v136 shape exactly (v136_gear hood clearance)
{const f=gkHood;gkHood=function(B,P,o){if(!FIT192.on||!B||!B.L||!BR.on||!BR.R||BR.R.key!='weasel')return f.apply(this,arguments);let S=null;try{S=fit192Body(B)}catch(_){S=null}
  if(!S)return f.apply(this,arguments);const D=BR.R,o2=Object.assign({},o||{});
  // the weasel: the opening further back and the cut lower round the long muzzle
  {const er=D.eyeR||.021;o2.zf=o2.zf!=null?o2.zf:D.EYEP[2]-er-.024;o2.yJaw=o2.yJaw||D.EYEP[1]-.1;o2.loose=Math.min(o2.loose==null?.03:o2.loose,FIT192.loose)}
  const prev=FIT192_HOOD;FIT192_HOOD={B,S,yNeck:1.06};let Hd;try{Hd=f.call(this,B,P,o2)}finally{FIT192_HOOD=prev}
  return Hd}}
// the cap: gkHood builds its grid and then its surfaces (gkSurf); the first gkSurf call of a measured hood gets the grid, whose
// vertices are shared with the lining and the rim, so moving them here moves the whole hood
{const f=gkSurf;gkSurf=function(B,G,o){const H=FIT192_HOOD;if(H&&H.B===B&&!H.cap&&G&&G.length>2&&G[0]&&G[0][0]&&G[0][0].cz!=null){H.cap=1;try{fit192Cap(H.S,G)}catch(e){console.warn('v192 hood cap',e)}}return f.apply(this,arguments)}}
function fit192Cap(S,G){const cap=FIT192.cap;G.forEach(row=>row.forEach(v=>{if(v.y>1.05)return;const k=Math.round(v.y/S.bw);let h=null;for(const d of [0,-1,1]){const q=S.H.get(k+d);if(q&&q.length>2){h=q;break}}if(!h)return;
  const cz=v.cz||0,dx=v.x,dz=v.z-cz,L=Math.hypot(dx,dz);if(L<1e-6)return;const R=gkHullR(h,0,cz,Math.atan2(dx,dz));if(!(R>0))return;const lim=R+cap;
  if(L>lim){const k2=lim/L;v.x=dx*k2;v.z=cz+dz*k2}}))}
// the same body filter for the weasel's chest skirts: the coat skirt and the v136 hunting skirt are measured round the hips and
// legs (gkSkirt: hull of what is built there, never narrowing downward). On the weasel's slim hips the belt pouches, the
// skinning knife and the coat's own flare were the widest things there, so the skirt hung from them as a wide bell round a thin
// torso. Now only the body and what lies on it (within FIT192.nearSk of the bare body's section) is measured.
FIT192.nearSk=.035;
{const f=gkSkirt;gkSkirt=function(B,P,o){if(!FIT192.on||!FIT192.skirt||!BR.on||!BR.R||BR.R.key!='weasel'||!B||!B.L)return f.apply(this,arguments);let S=null;try{S=fit192Body(B)}catch(_){}
  if(!S)return f.apply(this,arguments);o=o||{};const sk=o.skip;
  const o2=Object.assign({},o,{skip:(x,y,z)=>(sk&&sk(x,y,z))||fit192Out(S,x,y,z)>FIT192.nearSk});return f.call(this,B,P,o2)}}

// ---------------- 3. the Bard's paws on the lute ----------------
// bard141 (2995) reaches its two targets with fc116IK, with a fixed elbow direction. Its strum target lay just in front of the
// bowl's middle, but the strumming shoulder is BEHIND the bowl: with the elbow down and back the forearm went straight through
// the bowl and the paw came out of the sound hole (out/v192_bard_before.jpg; every frame of his loop). Now:
//  * the strum paw reaches for the strings between the sound hole and the neck (just in front of the soundboard), the neck paw
//    holds the neck from behind; both move as before (strum, sliding along the neck);
//  * the elbow direction is searched (BARD192.poles, a few per arm, the last choice tried first): the first one whose arm
//    (upper arm, forearm, paw) stays outside the bowl's ellipsoid by BARD192.pad wins, so the forearm comes over the bowl's
//    upper edge, like a lute player's. Kept per bard, so it does not flip from frame to frame.
var BARD192={strum:[.0,.17,.11],neck:[.0,.42,-.05],sw:.03,nk:.05,pad:1.08,out:.035,
  poles:[[-1,-.3,-.6],[-1,.2,-.5],[-1,-.8,-.4],[-.6,.6,-.8],[-1,0,.3],[-.3,-1,-.9],[-1,-1,-.5],[-1,.6,0],[-.4,.9,-.3],[-1,.4,.6],[0,1,-.4],[-1,-.2,.8]]};
var BARD192_T=null;
function bard192Out(L,bowl,b0,b1,b2){const T=BARD192_T,V=THREE.Vector3,mi=T.mi.copy(bowl.matrixWorld).invert(),a=b0.getWorldPosition(T.a),e=b1.getWorldPosition(T.e),w=b2.getWorldPosition(T.w);
  const tip=T.t.copy(w).sub(e).normalize().multiplyScalar(.07).add(w);let m=9;const R=.17;
  const chk=p=>{const l=T.l.copy(p).applyMatrix4(mi);m=Math.min(m,Math.hypot(l.x,l.y,l.z)/R)};
  for(let j=3;j<=10;j++)chk(T.p.copy(a).lerp(e,j/10));for(let j=0;j<=10;j++)chk(T.p.copy(e).lerp(w,j/10));for(let j=1;j<=4;j++)chk(T.p.copy(w).lerp(tip,j/4));return m}
if(typeof bard141=='function'){const f0=bard141;bard141=function(n,now){if(!FIT192.on||!FIT192.bard)return f0.apply(this,arguments);
  const S=n._wk,B=n.bones,L=S&&S.tool;if(!L||!B||!B.pelvis||!B.chest||!B.aL0||!B.aR0||!L.children[0])return f0.apply(this,arguments);
  f0.apply(this,arguments);   // places the lute
  {const V0=THREE.Vector3,fw=new V0(0,0,1).applyQuaternion(L.quaternion);fw.y=0;if(fw.lengthSq()>1e-6){fw.normalize();L.position.addScaledVector(fw,BARD192.out)}L.updateMatrixWorld(true)}
  const V=THREE.Vector3;if(!BARD192_T)BARD192_T={mi:new THREE.Matrix4(),a:new V(),e:new V(),w:new V(),t:new V(),l:new V(),p:new V()};
  const t=now/1000+(S.t0||0);n.updateMatrixWorld(true);L.updateMatrixWorld(true);const bowl=L.children[0];bowl.updateMatrixWorld(true);
  const W=p=>L.localToWorld(new V(p[0],p[1],p[2])),loc=b=>n.worldToLocal(b.getWorldPosition(new V()));
  const rs=Math.sign(loc(B.aR0).x)||-1,s=Math.sin(t*9.5),f=Math.sin(t*2.1),C=BARD192;
  const TS=W([C.strum[0],C.strum[1]+C.sw*s,C.strum[2]]),TN=W([C.neck[0],C.neck[1]+C.nk*f,C.neck[2]]);
  // arm side: k = 'L' strums (the town rig's aL is the figure's right), 'R' holds the neck; pole x sign: out to that arm's side
  const arm=(k,T,sx)=>{const b0=B['a'+k+'0'],b1=B['a'+k+'1'],b2=B['a'+k+'2'],q0=b0.quaternion.clone(),q1=b1.quaternion.clone(),q2=b2.quaternion.clone();
    const memo=S['b192'+k]|0,order=[memo].concat(C.poles.map((_,i)=>i).filter(i=>i!==memo));let best=-1,bv=-1;
    for(const i of order){const pp=C.poles[i];b0.quaternion.copy(q0);b1.quaternion.copy(q1);b2.quaternion.copy(q2);b0.updateMatrixWorld(true);
      try{fc116IK(b0.getWorldPosition(new V()),b0,b1,b2,T,new V(sx*pp[0],pp[1],pp[2]).transformDirection(n.matrixWorld),1)}catch(e){continue}
      const v=bard192Out(L,bowl,b0,b1,b2);if(v>=C.pad){best=i;bv=v;break}if(v>bv){bv=v;best=i}}
    if(best<0)return;S['b192'+k]=best;const pp=C.poles[best];
    b0.quaternion.copy(q0);b1.quaternion.copy(q1);b2.quaternion.copy(q2);b0.updateMatrixWorld(true);
    try{fc116IK(b0.getWorldPosition(new V()),b0,b1,b2,T,new V(sx*pp[0],pp[1],pp[2]).transformDirection(n.matrixWorld),1)}catch(e){}};
  try{arm('L',TS,-rs);arm('R',TN,rs)}catch(e){if(!BARD192.err){BARD192.err=1;console.warn('v192 bard',e)}}}}
