// ================= v172 creature remaster: shared anatomy helpers =================
// Reusable body parts for the remastered creatures (3360 kit). All positions are in the rig's model space (rest pose).
// Every helper builds lofts on bones and places detail from surface points (B.at), so nothing floats.
// ---------------- jaw hinge ----------------
// The rigs' jaw bone sits near the snout tip, so turning it swung the jaw like a lever. cm172Hinge makes it turn about a real
// hinge H (model space, behind the eye) by moving the jaw bone after every animation layer (the last animC wrapper).
// rest: idle jaw motion below this angle is absorbed, so the mouth stays shut at rest
function cm172Hinge(x,bone,H,rest){const b=x.bones[bone],S=x.S;if(!b||!S.bones[bone])return;const pa=S.bones[S.bones[bone][0]];
  const J=new CM_V(S.bones[bone][1],S.bones[bone][2],S.bones[bone][3]),Hd=new CM_V(pa[1],pa[2],pa[3]),Hv=cmV(H);
  (x.g.cm172fx=x.g.cm172fx||[]).push(()=>{if(rest)b.rotation.x=Math.max(0,b.rotation.x-rest);const v=J.clone().sub(Hv).applyEuler(b.rotation);b.position.copy(Hv).sub(Hd).add(v)})}
{const f=animC;animC=function(g){const r=f.apply(this,arguments);if(g&&g.cm172fx&&!g._aiNA){for(const h of g.cm172fx)h();}return r}}
// ---------------- colour helpers for body paint ----------------
// countershading: dark along the top (s > t1), pale underneath (s < t0); s = sin(angle) in a loft's section
function cmCounter(K,s,o){o=o||{};let c=cmCol(K.main);if(s>(o.t1==null?.45:o.t1))c.lerp(cmCol(K.back),Math.min(1,(s-(o.t1==null?.45:o.t1))*(o.k1||2.2)));
  if(s<(o.t0==null?-.2:o.t0))c.lerp(cmCol(K.belly),Math.min(1,((o.t0==null?-.2:o.t0)-s)*(o.k0||2)));return c.getHex()}
// ---------------- quadruped legs ----------------
// One leg as a loft through its joints. o: {side (+1 / -1 = which x), front (bool), x (lateral offset of the leg line),
//   pts: [[y, z, rx, ryF, ryB, weights], ...] from the top (on the body) to the ankle; paint(r,s,c,u) }
// The section's "top" faces forward (+z), so ryF is the front half-depth and ryB the back.
function cmLeg(B,o){const s=o.side,rings=o.pts.map(q=>({p:[s*(q[6]!=null?q[6]:o.x),q[0],q[1]],rx:q[2],ryT:q[3],ryB:q[4],b:q[5]}));
  return B.loft({rings,seg:o.seg||10,ref:[0,0,1],sub:o.sub==null?2:o.sub,capA:1,capB:0,name:o.name,paint:o.paint})}
// A digitigrade paw at the end of a leg: pad block, toes with knuckles and claws. o: {side, x, z (paw centre), y (ankle y),
//   bone, len, wide, toes (4), claw colour, col (fur), pad (dark), name}
function cmPaw(B,o){const s=o.side,x=s*o.x,len=o.len||.06,wd=o.wide||.04,h=o.h||.026,bn=o.bone,col=o.col,dk=o.pad||0x1a1614,cl=o.claw||0x141214;
  // the paw: a short loft from the ankle down and forward to the toes
  const P=B.loft({rings:[{p:[x,o.y,o.z-len*.55],rx:wd*.66,ryT:h*.9,ryB:h*.9,b:bn},{p:[x,h*.95,o.z-len*.1],rx:wd*.9,ryT:h,ryB:h*.9,b:bn},
      {p:[x,h*.8,o.z+len*.32],rx:wd,ryT:h*.85,ryB:h*.8,b:bn},{p:[x,h*.6,o.z+len*.55],rx:wd*.8,ryT:h*.6,ryB:h*.55,b:bn}],
    seg:8,sub:1,capA:1,capB:2,name:o.name,paint:(r,ss)=>ss<-.55?dk:col});
  // toes: knuckle lumps over the front, each with a claw
  const n=o.toes||4;for(let i=0;i<n;i++){const t=n>1?i/(n-1)-.5:0;
    const p=new CM_V(x+t*wd*1.6,h*.62,o.z+len*.52-Math.abs(t)*len*.18);
    B.put('hide',cmBlob(11+i,.08,6),p,{s:[wd*.34,h*.62,len*.3],W:B.W(bn),col,nm:'toe'});
    B.spike('b',{p:new CM_V(p.x,h*.42,p.z+len*.22),n:new CM_V(0,-.45,1).normalize(),W:B.W(bn)},len*.36,wd*.12,{col:cl,col2:cmMix(cl,0x5a5048,.4),n:4,seg:3,sink:.9,nm:'claw'})}
  // the big pad underneath
  B.put('hide',cmBlob(5,.06,6),new CM_V(x,h*.25,o.z+len*.05),{s:[wd*.7,h*.3,len*.36],W:B.W(bn),col:dk,nm:'pad'});
  return P}
// ---------------- heads ----------------
// An almond eye in a socket under a brow: dark socket, the eye (glow slot), a brow ridge over it. q = surface point on the
// skull (B.at) where the eye sits; o: {r (eye half-length), col (iris glow), lid (lid/socket colour), brow (brow colour), side}
function cmEye(B,q,o){const r=o.r||.016,W=q.W,n=q.n.clone(),t=q.t.clone();
  // socket: a dark almond pressed into the skull
  B.put('hide',cmSph(10,6),q.p.clone().addScaledVector(n,-r*.25),{ax:{y:t,z:n},s:[r*1.25,r*1.45,r*.55],W,col:o.lid||0x0e0c0c,nm:'socket'});
  // the eye: a flattened almond, slightly sunk
  B.put('g',cmSph(10,6),q.p.clone().addScaledVector(n,-r*.05),{ax:{y:t,z:n},s:[r*.55,r*1.0,r*.4],W,paint:l=>Math.hypot(l.x*1.3,l.y)<(o.pr||.34)?(o.pupil||0x120804):o.col,nm:'eye'});
  // the brow: a heavy ridge above, angled down toward the nose (the stern look)
  if(o.brow!=null){const up=new CM_V().crossVectors(t,n).normalize();if(up.y<0)up.negate();
    B.put('hide',cmBlob(21,.05,8),q.p.clone().addScaledVector(up,r*(o.bh||.95)).addScaledVector(n,-r*.05),{ax:{y:t.clone().addScaledVector(up,-(o.ba==null?.35:o.ba)).normalize(),z:n},s:[r*.75,r*1.9,r*.6],W,col:o.brow,nm:'brow'})}}
// a row of teeth along a jaw edge: pts = surface points (from B.at), each tooth pointing along dir (down for the upper row)
function cmTeeth(B,pts,o){pts.forEach((q,i)=>{const big=o.fang&&o.fang.indexOf(i)>=0;B.spike('b',{p:q.p,n:cmV(o.dir),W:q.W},(big?o.fl:o.l)||.02,(big?o.fr:o.r)||.006,{col:o.col||0xe6dcc4,col2:o.col2||0xc8b896,n:5,sink:.5,nm:'tooth'})})}
// ---------------- fur ----------------
// a mane / ruff / saddle of fur locks over a loft: rows of locks shingled toward the loft's end (or start with back:1)
// o: {u0,u1,a0,a1,rows,n,size,w,lift,col(a,u,r,k) or K+mode}
function cmFur(B,name,o){return B.cover(name,Object.assign({geo:'lock',sl:'f',lift:.32,w:.55,th:.5},o))}
