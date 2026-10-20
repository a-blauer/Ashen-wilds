// ================= v93: grip — how every weapon sits in the hand =================
// Why weapons looked wrong before v93: every weapon model is built with its grip at the origin and the blade/head along −y
// (lgWpnKit, v89 tier models), and refreshGear / mkHumanoid put it in the hand with one fixed tilt (rotation.x = −1). With the
// relaxed arm (forearm ~30° forward) that tilt lays swords, axe heads and hafts flat, pointing straight ahead; the bow was
// attached at its string (its model origin), so the hand held the string.
//
// v93 gives every weapon type two grips in the hand bone's frame and eases between them:
//   carry  — idle and walking: blades and heads up (edge forward), the fist on the handle; great weapons rest on the shoulder;
//            polearms and staves stand upright; the bow is held at the riser, upright, string behind the hand; flail chains hang.
//   strike — attacks, casts, bow/crossbow shots: the grip the v85 attack tracks (and the v85/v91 bow draws) were tuned with.
// Into an attack the hand turns to the strike grip in ~0.05 s (the hero: by 18% of the swing), back to carry in ~0.28 s. Through the strike itself
// (hero: 22–58% of the swing, foes: the act phase) edged weapons turn about their own axis so the edge leads the swing
// (measured from how the tip moves); thrusts and slow moves keep their spin.
// Holding a weapon upright also bends the elbow a little (GRIP[type].el, added on top of the idle/walk arm pose).
// Covers the hero, co-op partners, the bag (#hv) and character-creation previews (all via refreshGear) and humanoid foes
// (mkHumanoid). Bow string/arrow helpers (bowFxSet, eBowFxSet) are wrapped so the drawn string uses the same grip.
//
// Table: t = tilt of the blade/head from straight up (+ = top forward, π = hanging down), el = extra elbow bend (rad, − = more),
// sp = spin about the handle (−π/2 turns the edge / axe bit / hammer face forward), rl = lean (+ = top toward the body),
// hold = model point that sits in the fist (default the grip centre at the origin), edge = 1 one-sided bit (+x), 2 double edge.
var GRIP_H=Math.PI/2;
var GRIP={
  sword:  {t:.15, el:-.45,sp:-GRIP_H,edge:2},
  axe:    {t:.15, el:-.45,sp:GRIP_H,edge:1},                           // one-sided bit: +π/2 turns the bit toward the target
  axes:   {t:.15, el:-.45,sp:GRIP_H,edge:1},
  mace:   {t:.15, el:-.45,sp:0},
  club:   {t:.12, el:-.45,sp:0},
  hammer: {t:.15, el:-.45,sp:-GRIP_H},
  dagger: {t:.6,  el:-.4, sp:-GRIP_H,edge:2},
  knives: {t:.6,  el:-.4, sp:-GRIP_H,edge:2},
  gs:     {t:-.3, el:-.75,sp:-GRIP_H,rl:.12,hold:[0,.02,0],edge:2},    // resting on the shoulder
  ga:     {t:-.3, el:-.75,sp:-GRIP_H,rl:.12,edge:2},
  halberd:{t:.1,  el:-.3, sp:GRIP_H,hold:[0,-.2,0],edge:1},            // upright, butt near the ground, axe blade forward, back-spike behind
  staff:  {t:.08, el:-.35,sp:0},
  flail:  {t:1.2, el:-.45,sp:0,chain:1},                               // haft forward, chain and ball hang
  wand:   {t:1.05,el:-.4, sp:0},                                       // pointing forward and up
  crossbow:{t:1.83,el:-.15,sp:0},                                      // stock level, bow arms across the front
  sling:  {t:Math.PI,el:0,sp:0},                                       // hangs from the fist
  claws:  {same:1},                                                    // strapped over the fist: one grip
  orb:    {t:Math.PI,el:-.6,sp:0,hold:[0,-.2,0]},                      // held by its stem, orb on top (left hand)
  bow:    {bow:1},                                                     // left hand, at the riser (see gripCarry)
  shield: {shield:1}                                                   // left forearm, face out
};
// the forearm's pitch in the idle pose (animHero: upper arm ax −.2 + elbow ex −.3 on the right, le −.25 on the left)
var GRIP_B={R:-.5,L:-.25},GRIP_AN=[0,-.035,.015];
// strike grips (the pre-v93 placement in refreshGear / zzA_arsenal / mkHumanoid)
function gripStrikeOf(ty,side){
  if(ty=='bow')return {r:[0,GRIP_H,0],p:[-.05,-.02,.05],hold:[-.555,0,0]};
  if(ty=='shield')return null;
  if(ty=='claws')return {r:[-.2,0,0],p:[0,-.02,.02]};
  if(ty=='crossbow')return {r:[-1.45,0,0],p:[0,-.02,.06]};
  if(ty=='orb')return {r:[0,0,0],p:[0,-.16,.1]};
  return {r:[-1,0,0],p:[0,-.03,.02]}}
var GRIP_Q=new THREE.Quaternion(),GRIP_V=new THREE.Vector3(),GRIP_V2=new THREE.Vector3(),GRIP_E=new THREE.Euler();
function gripQ(rx,ry,rz,ord){return new THREE.Quaternion().setFromEuler(GRIP_E.set(rx,ry,rz||0,ord||'XYZ'))}
// carry grip of a type in a hand: {q, p (where the grip origin goes; null = from hold), hold, el}
function gripCarry(ty,side){
  const G=GRIP[ty]||GRIP.sword,B=GRIP_B[side]||-.5;
  if(G.same){const S=gripStrikeOf(ty,side);return {q:gripQ(...S.r),p:S.p.slice(),hold:[0,0,0],el:0}}
  if(G.bow)return {q:gripQ(-B,GRIP_H+.3,0,'ZXY'),p:null,hold:[-.555,0,0],an:[-.01,-.04,.02],el:0};
  if(G.shield)return {q:gripQ(-B+.35,-1.1,0,'ZXY'),p:[-.07,.05,.03],hold:[0,0,0],el:-.35};
  const el=G.el||0,rx=-Math.PI+G.t-B-el;
  return {q:gripQ(rx,G.sp||0,(side=='L'?-1:1)*(G.rl||0),'ZXY'),p:null,hold:G.hold||[0,0,0],el:el}}
// ---------------- flail: the chain and ball become a child that can swing from the end of the haft ----------------
var GRIP_FL={},GRIP_FLY=-.3;
function gripSplit(geo){
  let c=GRIP_FL[geo.uuid];if(c)return c;
  const pa=geo.attributes.position,ix=geo.index?geo.index.array:null,n=ix?ix.length:pa.count,A=[],Bi=[];
  for(let i=0;i<n;i+=3){const a=ix?ix[i]:i,b=ix?ix[i+1]:i+1,d=ix?ix[i+2]:i+2,y=(pa.getY(a)+pa.getY(b)+pa.getY(d))/3;(y<GRIP_FLY-.005?Bi:A).push(a,b,d)}
  const mk=I=>{const g=new THREE.BufferGeometry();for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);g.setIndex(I);g.computeBoundingSphere();g.userData.lps=1;return g};
  return GRIP_FL[geo.uuid]={a:mk(A),b:mk(Bi)}}
function gripFlail(g){
  if(!g||g.userData.chain)return;const P=new THREE.Group();P.position.set(0,GRIP_FLY,0);
  g.children.slice().forEach(m=>{if(!m.isMesh||!m.geometry)return;const s=gripSplit(m.geometry);if(!s.b.index.count)return;
    m.geometry=s.a;const m2=new THREE.Mesh(s.b,m.material);m2.castShadow=m.castShadow;m2.receiveShadow=m.receiveShadow;m2.position.y=-GRIP_FLY;P.add(m2)});
  if(P.children.length){g.add(P);g.userData.chain=P}}
{const f=mkWpn;mkWpn=function(type,col,r){const g=f.apply(this,arguments);try{if(type=='flail')gripFlail(g)}catch(e){}return g}}

// ---------------- registry: the weapons a body holds ----------------
function gripReg(h){
  if(!h||!h.bones)return;const b=h.bones,L=[],seen=new Set();
  const add=(o,side)=>{if(!o||seen.has(o)||!o.userData||!o.userData.wt)return;seen.add(o);const ty=o.userData.wt;if(!GRIP[ty]&&ty!='sword')return;
    const S=gripStrikeOf(ty,side),C=gripCarry(ty,side),G=GRIP[ty]||{};
    const e={W:o,ty,side,C,edge:G.edge||0,chain:o.userData.chain||null,psi:G.sp||0,sp0:G.sp||0,tip:null,cw:null};
    if(S)e.S={q:gripQ(...S.r),p:S.p,hold:S.hold||null};else e.S=null;
    if(o.userData.s0g==null)o.userData.s0g=o.scale.x;L.push(e)};
  [['aR2','R'],['aL2','L']].forEach(([n,side])=>{const bn=b[n];if(bn)bn.children.forEach(o=>add(o,side))});
  h._grip=Object.assign(h._grip||{w:1,t:null},{L});
  gripTick(h,null,false)}
{const f=refreshGear;refreshGear=function(h){const r=f.apply(this,arguments);try{gripReg(h||pl)}catch(e){console.warn('grip',e)}return r}}
{const f=mkHumanoid;mkHumanoid=function(key){const g=f.apply(this,arguments);try{if(g&&g.h){g.h._grHum=1;gripReg(g.h)}}catch(e){console.warn('grip',e)}return g}}

// ---------------- per frame ----------------
const gripSS=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
function gripWrap(a){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a}
// now: animation clock (null = snap to the target, undefined = keep the current blend); el: add the elbow bend this call (only right after the arm pose was set)
function gripTick(h,now,el,att){
  const S=h&&h._grip;if(!S||!S.L.length)return;
  if(att==null)att=h===pl?!!(HA.cur||pl.sw||hero.chan):!!h.sw;
  let dt=0;
  if(now!==undefined){if(now!=null&&S.t!=null)dt=(now-S.t)/1000;
    if(now==null||S.t==null||dt<0||dt>.5){S.w=att?0:1;dt=0}
    else if(dt>0)S.w=att?Math.max(0,S.w-dt/.045):Math.min(1,S.w+dt/.28);
    // the hero's swings can be as short as 0.1 s: be in the strike grip by the end of the wind-up
    if(h===pl&&HA.cur&&HA.cur.k!=null)S.w=Math.min(S.w,Math.max(0,1-HA.cur.k/.18));
    if(now!=null)S.t=now}
  const w=gripSS(S.w),b=h.bones;
  // the edge only follows the blade through the strike itself (not the wind-up or the return)
  const edgeOK=h===pl?!!(HA.cur&&HA.cur.k>=.22&&HA.cur.k<=.58):h._grHum?!!h._grAct:true;
  let elR=0,elL=0;
  for(const e of S.L){const W=e.W;if(!W.parent)continue;
    const C=e.C,sx=W.scale.x;
    // carry
    const hc=C.hold;GRIP_V.set(hc[0]*sx,hc[1]*W.scale.y,hc[2]*W.scale.z).applyQuaternion(C.q);
    const an=C.an||GRIP_AN,pc=C.p?GRIP_V2.set(...C.p):GRIP_V2.set(an[0]-GRIP_V.x,an[1]-GRIP_V.y,an[2]-GRIP_V.z);
    if(!e.S||w>=.999){W.quaternion.copy(C.q);W.position.copy(pc);if(e.edge)e.psi=e.sp0;e.tip=null}
    else{
      // strike grip, turned about the handle so the edge leads
      if(!edgeOK)e.tip=null;else if(e.edge&&dt>0)gripEdge(h,e,dt);if(!e.edge)e.psi=0;
      GRIP_Q.copy(e.S.q).multiply(gripQ(0,e.edge?e.psi:0,0));
      const ps=e.S.hold?new THREE.Vector3(e.S.hold[0]*sx,e.S.hold[1],e.S.hold[2]).applyQuaternion(e.S.q).negate().add(GRIP_V.set(...e.S.p)):GRIP_V.set(...e.S.p);
      W.quaternion.copy(GRIP_Q).slerp(C.q,w);W.position.copy(ps).lerp(pc,w)}
    if(e.chain)gripChain(e,dt,w);
    if(e.side=='L')elL=Math.min(elL,C.el||0);else elR=Math.min(elR,C.el||0)}
  if(el&&b){if(elR&&b.aR1)b.aR1.rotation.x+=elR*w;if(elL&&b.aL1)b.aL1.rotation.x+=elL*w}}
// strike spin from the tip's motion (in the body's own frame, so running or turning does not count)
var GRIP_TQ=new THREE.Quaternion(),GRIP_TQ2=new THREE.Quaternion();
function gripEdge(h,e,dt){
  const W=e.W,bn=W.parent;bn.updateWorldMatrix(true,false);
  const tip=new THREE.Vector3(0,-.6,0).applyQuaternion(e.S.q).add(new THREE.Vector3(...e.S.p)).applyMatrix4(bn.matrixWorld);h.worldToLocal(tip);
  const prev=e.tip;e.tip=tip;if(!prev)return;
  const v=tip.clone().sub(prev).divideScalar(dt);
  // velocity → the strike frame before the spin: inverse(body→hand rotation × strike rotation)
  h.getWorldQuaternion(GRIP_TQ);bn.getWorldQuaternion(GRIP_TQ2);GRIP_TQ.invert().multiply(GRIP_TQ2).multiply(e.S.q).invert();v.applyQuaternion(GRIP_TQ);
  const sp=Math.hypot(v.x,v.z);if(sp<1.6||sp<Math.abs(v.y)*.35)return;
  let tg=Math.atan2(-v.z,v.x);
  if(e.edge==2){const d=gripWrap(tg-e.psi);if(Math.abs(d)>Math.PI/2)tg=gripWrap(tg+Math.PI)}
  e.psi=gripWrap(e.psi+gripWrap(tg-e.psi)*(1-Math.exp(-dt*120)))}
// flail chain: hangs while carried, trails the haft while striking (with a little lag)
function gripChain(e,dt,w){
  const P=e.chain,W=e.W;W.updateWorldMatrix(true,false);W.getWorldQuaternion(GRIP_TQ);
  const ax=new THREE.Vector3(0,-1,0).applyQuaternion(GRIP_TQ),T=ax.clone().lerp(new THREE.Vector3(0,-1,0),w).normalize();
  if(!e.cw||dt<=0||dt>.3)e.cw=T.clone();else e.cw.lerp(T,1-Math.exp(-dt*(9+6*(1-w)))).normalize();
  const loc=e.cw.clone().applyQuaternion(GRIP_TQ.invert());P.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),loc)}
{const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);try{h=h||pl;if(h&&h._grip&&!h._grHum)gripTick(h,now,h===pl||!h.sw)}catch(e){}return r}}
{const f=humAnim;humAnim=function(g,now,mv){const r=f.apply(this,arguments);try{const h=g.h;if(h&&h._grip){h._grAct=!!(g.ak&&g.ak.ph==1);gripTick(h,now,!g.ak,!!g.ak)}}catch(e){}return r}}
// the drawn string and nocked arrow follow the bow wherever the grip puts it (the old helpers moved the bow from string to riser)
{const f=bowFxSet;bowFxSet=function(k,g){try{const W=(pl.gearG||[]).find(o=>o.userData&&o.userData.wt=='bow'&&o.parent);
    if(W&&pl._grip){const u=W.userData;g=g||0;if(u.s0==null)u.s0=u.s0g!=null?u.s0g:W.scale.x;const sx=u.s0*(1-.6*g+.12*(k||0)*g);W.scale.x=sx;
      gripTick(pl,undefined,false);u.p0=W.position.clone();u.p0.z+=g*.555*sx}}catch(e){}return f.apply(this,arguments)}}
{const f=eBowFxSet;eBowFxSet=function(g,k,gr){try{const W=g.bowW,h=g.h;
    if(W&&h&&h._grip){const u=W.userData;gr=gr||0;if(u.s0==null)u.s0=u.s0g!=null?u.s0g:W.scale.x;const sx=u.s0*(1-.6*gr+.12*(k||0)*gr);W.scale.x=sx;
      gripTick(h,undefined,false);u.p0=W.position.clone();u.p0.z+=gr*.555*sx}}catch(e){}return f.apply(this,arguments)}}

