// ================= v180: companion bodies hold together (owner, Oct 30 2026) =================
// "Carefully check all companions for unattached pieces, accessories and limbs; keep their anatomy non-cartoony."
// test/v180_comp_float.py builds every species × evolution × trait × variant × fusion and fails on any piece of mesh that
// floats free of the body. Fixes live in the files that build each part (marked v180); helpers shared by them are here.

// A hanging chain of interlocked oval links on bone bn (a dkKit k): the first link's top end sits at top, the chain runs
// along dir (default straight down), n links of half-width r; links alternate between two planes at right angles and each
// overlaps the next, so the pieces touch (the old chains were rings spaced apart that hung in the air).
function lk180Chain(k,bn,t,cols,top,n,r,dir){const D=new THREE.Vector3(...(dir||[0,-1,0])).normalize(),U=new THREE.Vector3(1,0,0);
  if(Math.abs(U.dot(D))>.9)U.set(0,0,1);U.sub(D.clone().multiplyScalar(U.dot(D))).normalize();const W=new THREE.Vector3().crossVectors(D,U),L=r*1.35,sp=2*L*.92;
  for(let i=0;i<n;i++)lk180Link(k,bn,t,Array.isArray(cols)?cols[i%cols.length]:cols,new THREE.Vector3(...top).addScaledVector(D,L+i*sp),D,i%2?W:U,r);
  return new THREE.Vector3(...top).addScaledVector(D,2*L+(n-1)*sp).toArray()}
// one oval link at centre c (Vector3), long axis along D, lying in the plane of D and A (unit vectors at right angles)
function lk180Link(k,bn,t,col,c,D,A,r){const L=r*1.35,Z=new THREE.Vector3().crossVectors(D,A),N=new THREE.Vector3().crossVectors(Z,D),M=new THREE.Matrix4().makeBasis(D,N,Z);
  M.scale(new THREE.Vector3(L,r*1.6,r));M.setPosition(c);k.P.push({bn,geo:dkG().ring,t,col,m:M})}
// a closed loop of links round a centre (a chain belt): ellipse radii rx, rz at height y (+ wave(a)), n links of half-width r
function lk180Loop(k,bn,t,cols,cx,cz,rx,rz,y,n,r,wave){for(let i=0;i<n;i++){const a=i/n*Math.PI*2,c=new THREE.Vector3(cx+Math.sin(a)*rx,y+(wave?wave(a):0),cz+Math.cos(a)*rz),
    D=new THREE.Vector3(Math.cos(a)*rx,0,-Math.sin(a)*rz).normalize(),A=i%2?new THREE.Vector3(0,1,0):new THREE.Vector3(Math.sin(a),0,Math.cos(a));
  lk180Link(k,bn,t,Array.isArray(cols)?cols[i%cols.length]:cols,c,D,A,r)}}
// the same chain for an evolution kit E (EVO100): links as E.pd parts, options o (bn / at / vs) passed through
function lk180EChain(E,t,col,top,n,r,dir,o){const D=new THREE.Vector3(...(dir||[0,-1,0])).normalize(),U=new THREE.Vector3(1,0,0);
  if(Math.abs(U.dot(D))>.9)U.set(0,0,1);U.sub(D.clone().multiplyScalar(U.dot(D))).normalize();const W=new THREE.Vector3().crossVectors(D,U),L=r*1.35,sp=2*L*.92;
  for(let i=0;i<n;i++){const A=i%2?W:U,N=new THREE.Vector3().crossVectors(new THREE.Vector3().crossVectors(D,A),D),c=new THREE.Vector3(...top).addScaledVector(D,L+i*sp);
    E.pd('ring',t,col,c.toArray(),N.toArray(),[r,r*1.6,L],D.toArray(),Object.assign({at:top},o))}
  return new THREE.Vector3(...top).addScaledVector(D,2*L+(n-1)*sp).toArray()}

// Nearest point on a body geometry's rest-pose surface to p: {p:[x,y,z], n:[outward normal], d:distance}. G = an indexed
// BufferGeometry (an LPR body from lpGeo). Used to set kit parts onto the body they belong to.
// bone (optional): only the surface skinned mostly to that bone index
function lk180Near(G,p,bone){const P=G.attributes.position.array,I=G.index?G.index.array:null,n=I?I.length:P.length/3,V=THREE.Vector3,SI=G.attributes.skinIndex,SW=G.attributes.skinWeight,
    a=new V(),b=new V(),c=new V(),q=new V(...p),t=new THREE.Triangle(),o=new V();let best=1e9,bp=null,bn=null;
  const mb=v=>{let b=SI.getX(v),w=SW.getX(v);if(SW.getY(v)>w){w=SW.getY(v);b=SI.getY(v)}if(SW.getZ(v)>w){w=SW.getZ(v);b=SI.getZ(v)}return b};
  for(let i=0;i<n;i+=3){const ia=I?I[i]:i,ib=I?I[i+1]:i+1,ic=I?I[i+2]:i+2;if(bone!=null&&SI&&mb(ia)!==bone)continue;a.fromArray(P,ia*3);b.fromArray(P,ib*3);c.fromArray(P,ic*3);t.set(a,b,c);t.closestPointToPoint(q,o);
    const d=o.distanceToSquared(q);if(d<best){best=d;bp=o.toArray();bn=t.getNormal(new V()).toArray()}}
  if(!bp)return bone!=null?lk180Near(G,p):{p:p.slice(),n:[0,1,0],d:0};
  // the triangle normal can face in (winding): point it away from the body's centre line
  const out=[bp[0],bp[1]-(G.boundingSphere||(G.computeBoundingSphere(),G.boundingSphere)).center.y,0];if(bn[0]*out[0]+bn[1]*out[1]<0)bn=bn.map(v=>-v);
  return {p:bp,n:bn,d:Math.sqrt(best)}}

// The highest point of a body geometry's surface straight above (x, z), or null when the body does not reach there.
var LK180M=null;
function lk180Top(G,x,z){LK180M=LK180M||new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
  const m=LK180M;m.geometry=G;if(!G.boundingSphere)G.computeBoundingSphere();const rc=new THREE.Raycaster(new THREE.Vector3(x,5,z),new THREE.Vector3(0,-1,0));
  const h=rc.intersectObject(m,false);return h.length?h[0].point.y:null}
