// ================= v181: the naga — a serpent body instead of legs =================
// The v94 / v137 naga were lizard-men standing on two legs with a short tail. Now: a human upper body (scaled, a pale ventral
// plate running down the belly) that flows at the hips into a heavy snake body which lies on the ground and trails ~1.7 m
// behind in an S-curve, a cobra hood flaring behind a reptilian head (slit eyes, no nose, a lipless mouth with fangs).
// The snake body hangs on five tail bones of its own (nt0–nt4, added to the humanoid skeleton of these three foes only):
// they are children of the body mesh, not of the pelvis, so the coils stay on the ground whatever the upper body does (hip
// bob, lean, twist), and they sway in a slither wave (faster and wider on the move). The legs are not built at all; the
// humanoid animations still drive the arms, spine and head, so every naga move plays as before.
var NAGA181={keys:{nagaw:1,nagaa:1,nagas:1},
  // name, parent, rest position (model space, before the foe's scale)
  bones:[['nt0',null,0,.3,-.05],['nt1','nt0',0,.115,-.32],['nt2','nt1',-.13,.098,-.66],['nt3','nt2',.06,.082,-1.0],['nt4','nt3',.15,.058,-1.32]],
  amp:[.05,.1,.16,.2,.24],sc:1.3};
Object.assign(AW_PROP99.PRE,{v181n:{pelvis:[.96,1.05,.92],spine:[.9,1.22,.88],chest:[.96,1.14,.92],neck:[1,1.45,1],head:.78,arm:[1.28,.98],hand:.92,leg:[1,1],foot:1,cape:[1.2,1]}});
function n181Rig(g){const h=g.h,body=huBody(h);if(!body||!body.skeleton)return;const sk=body.skeleton,abs={},nb=[],by={};
  NAGA181.bones.forEach(([n,p,x,y,z])=>{const b=new THREE.Bone();b.name=n;abs[n]=[x,y,z];by[n]=b;if(p){const a=abs[p];b.position.set(x-a[0],y-a[1],z-a[2]);by[p].add(b)}else{b.position.set(x,y,z);body.add(b)}nb.push(b)});
  const inv=nb.map(b=>new THREE.Matrix4().makeTranslation(abs[b.name][0],abs[b.name][1],abs[b.name][2]).premultiply(body.bindMatrix).invert());
  const S=new THREE.Skeleton(sk.bones.concat(nb),sk.boneInverses.map(m=>m.clone()).concat(inv));
  h.children.forEach(o=>{if(o.isSkinnedMesh&&o.skeleton===sk)o.bind(S,o.bindMatrix)});h.nt=nb;g.n181=1}
{const f=mkHumanoid;mkHumanoid=function(key){const g=f.apply(this,arguments);if(A181.on&&NAGA181.keys[key]&&g&&g.h){try{n181Rig(g)}catch(e){console.error('v181 naga rig',e)}}return g}}
// the slither: a travelling wave down the tail bones (the coils stay on the ground: rotations about the vertical only)
{const f=humAnim;humAnim=function(g,now,mv){const r=f.apply(this,arguments);try{const N=g&&g.h&&g.h.nt;if(N){const k=mv?1:.4,sp=mv?.0062:.0024;
  N.forEach((b,i)=>{b.rotation.y=Math.sin(now*sp-i*1.25)*NAGA181.amp[i]*k*(mv?1.6:1)});N[0].rotation.y+=g.ak&&g.ak.n=='spin'?0:0}}catch(e){}return r}}

a181Reg('nagaw',function(B,P,k,L){},'v181n');

a181Reg('nagaa',function(B,P,k,L){},'v181n');

a181Reg('nagas',function(B,P,k,L){},'v181n');

// no legs: no knee bend in their stance (ST179); a little lean, the arms ready
ST179.nagaw={sx:.1,hx:-.08,az:.04,lz:-.05,le:-.15};   /* (round 2) small: the arms rest along the body (snug) */ST179.nagaa={sx:.08,hx:-.06,lz:-.06};ST179.nagas={sx:.08,hx:-.06,lz:-.06,le:-.25};
Object.keys(NAGA181.keys).forEach(k=>{if(HUMLOOK[k])HUMLOOK[k].sc=(HUMLOOK[k].sc||1)*NAGA181.sc});
