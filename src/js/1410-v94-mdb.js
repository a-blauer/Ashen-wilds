// =====================================================================================================
function mdB(bones){const O=Object.keys(bones);return {O,bones,L:{c:mdBuf(),m:mdBuf(),g:mdBuf()},bi:{}}}
function mdBuf(){return {p:[],c:[],si:[],sw:[]}}
function mdBI(B,n){let i=B.bi[n];if(i==null){i=B.O.indexOf(n);if(i<0)throw new Error('md: no bone '+n);B.bi[n]=i}return i}
// weights [[bone,w],…] → 4 indices + 4 weights
function mdW(B,w){const si=[0,0,0,0],sw=[0,0,0,0];let t=0;for(let j=0;j<w.length&&j<4;j++){si[j]=mdBI(B,w[j][0]);sw[j]=w[j][1];t+=w[j][1]}if(t>0)for(let j=0;j<4;j++)sw[j]/=t;else sw[0]=1;return [si,sw]}
var MD_TC;
function mdTri(B,t,a,b,c,col){const L=B.L[t]||B.L.c,C=MD_TC||(MD_TC=new THREE.Color());C.setHex(col);
  for(const v of [a,b,c]){L.p.push(v.x,v.y,v.z);L.c.push(C.r,C.g,C.b);L.si.push(v.w[0][0],v.w[0][1],v.w[0][2],v.w[0][3]);L.sw.push(v.w[1][0],v.w[1][1],v.w[1][2],v.w[1][3])}}
// two-bone weight shorthand
function mdWb(a,b,t){return t<=0||a==b?[[a,1]]:t>=1?[[b,1]]:[[a,1-t],[b,t]]}
// Loft: R = rings {p:[x,y,z], rx, f (front / +up-side radius), b (back radius), w:[[bone,w]…], col?}
//   o: seg, t ('c'|'m'|'g'), col (hex or fn(m)→hex), keep (fn(m)→bool), off (shell offset), ref ([0,0,1] = "front"),
//      wf (fn(x,y,z,ring)→weights, overrides ring.w), capA/capB, rot (angle offset), sq (squareness 0..1 → boxier rings)
//   m (per face): {x,y,z centroid, s (+1 front … −1 back), c (side), i (ring position), r (ring)}
function mdLoft(B,R,o){
  o=o||{};const seg=o.seg||8,n=R.length,off=o.off||0,V=THREE.Vector3,t=o.t||'c',rows=[];if(n<2)return;
  const pts=R.map(r=>new V(r.p[0],r.p[1],r.p[2]));let U=null;
  for(let i=0;i<n;i++){
    const tg=pts[Math.min(i+1,n-1)].clone().sub(pts[Math.max(i-1,0)]);if(tg.lengthSq()<1e-12)tg.set(0,1,0);tg.normalize();
    let u=U?U.clone():new V(...(o.ref||[0,0,1]));u.sub(tg.clone().multiplyScalar(u.dot(tg)));
    if(u.lengthSq()<1e-6){u=new V(1,0,0);u.sub(tg.clone().multiplyScalar(u.dot(tg)))}u.normalize();U=u;
    const Sd=new V().crossVectors(u,tg),r=R[i],row=[],sq=o.sq||r.sq||0;
    for(let k=0;k<seg;k++){
      const a=Math.PI/2+(o.rot||0)+k/seg*Math.PI*2;let c=Math.cos(a),s=Math.sin(a);
      if(sq){const m=Math.max(Math.abs(c),Math.abs(s)),c2=c/m,s2=s/m;c=c+(c2-c)*sq;s=s+(s2-s)*sq}
      const ry=(s>0?(r.f==null?r.rx:r.f):(r.b==null?r.rx:r.b))+off,rx=r.rx+off;
      const x=pts[i].x+Sd.x*c*rx+u.x*s*ry,y=pts[i].y+Sd.y*c*rx+u.y*s*ry,z=pts[i].z+Sd.z*c*rx+u.z*s*ry;
      row.push({x,y,z,s:Math.sin(a),c:Math.cos(a),i,w:mdW(B,o.wf?o.wf(x,y,z,r,i):r.w)})}
    rows.push(row)}
  const face=(A,Bv,C)=>{const m={x:(A.x+Bv.x+C.x)/3,y:(A.y+Bv.y+C.y)/3,z:(A.z+Bv.z+C.z)/3,s:(A.s+Bv.s+C.s)/3,c:(A.c+Bv.c+C.c)/3,i:(A.i+Bv.i+C.i)/3};
    m.r=R[Math.min(n-1,Math.round(m.i))];if(o.keep&&!o.keep(m))return;
    const col=typeof o.col=='function'?o.col(m):(m.r.col!=null&&!o.colAll?m.r.col:o.col);mdTri(B,t,A,Bv,C,mdC(col==null?0x808080:col))};
  // one colour / keep decision per quad, so colour regions have straight edges
  const quad=(a,a1,b2,b3)=>{const m={x:(a.x+a1.x+b2.x+b3.x)/4,y:(a.y+a1.y+b2.y+b3.y)/4,z:(a.z+a1.z+b2.z+b3.z)/4,s:(a.s+a1.s+b2.s+b3.s)/4,c:(a.c+a1.c+b2.c+b3.c)/4,i:(a.i+b2.i)/2};
    m.r=R[Math.min(n-1,Math.round(m.i))];if(o.keep&&!o.keep(m))return;const cc=typeof o.col=='function'?o.col(m):(m.r.col!=null&&!o.colAll?m.r.col:o.col),col=mdC(cc==null?0x808080:cc);
    mdTri(B,t,a,a1,b2,col);mdTri(B,t,b2,a1,b3,col)};
  for(let i=0;i<n-1;i++)for(let k=0;k<seg;k++){const a=rows[i][k],a1=rows[i][(k+1)%seg],b2=rows[i+1][k],b3=rows[i+1][(k+1)%seg];quad(a,a1,b2,b3)}
  [[o.capA,0],[o.capB,n-1]].forEach(q=>{if(!q[0])return;const row=rows[q[1]],r=R[q[1]],cv={x:pts[q[1]].x,y:pts[q[1]].y,z:pts[q[1]].z,s:0,c:0,i:q[1],w:mdW(B,o.wf?o.wf(pts[q[1]].x,pts[q[1]].y,pts[q[1]].z,r,q[1]):r.w)};
    if(q[0]!==true&&q[0].dy){cv.y+=q[0].dy}if(q[0]!==true&&q[0].dz){cv.z+=q[0].dz}
    for(let k=0;k<seg;k++)face(cv,row[k],row[(k+1)%seg])})}
// rigid dkKit parts (k.P) merged in with one bone each (or ring weights via p.w)
var MD_KV,MD_KE;
function mdKit(B,k){const v=MD_KV||(MD_KV=new THREE.Vector3());
  k.P.forEach(p=>{const g=p.geo,pa=g.attributes.position,ix=g.index?g.index.array:null,cnt=ix?ix.length:pa.count,bn=p.bn||B.O[0],w=mdW(B,p.w||[[bn,1]]),col=mdC(p.col);
    const V=[];for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);V.push({x:v.x,y:v.y,z:v.z,w})}
    for(let i=0;i+2<cnt;i+=3){const a=ix?ix[i]:i,b=ix?ix[i+1]:i+1,c=ix?ix[i+2]:i+2;mdTri(B,p.t=='m'?'m':p.t=='g'?'g':'c',V[a],V[b],V[c],col)}})}
function mdBake(B){const out={};
  for(const t in B.L){const L=B.L[t];if(!L.p.length)continue;const G=new THREE.BufferGeometry();
    G.setAttribute('position',new THREE.Float32BufferAttribute(L.p,3));G.setAttribute('color',new THREE.Float32BufferAttribute(L.c,3));
    G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(L.si,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(L.sw,4));
    G.computeVertexNormals();G.computeBoundingSphere();G.userData.lps=1;G.userData.md=1;out[t]=G}
  return out}
// cached build: key → {c,m,g}; hero keys are evicted (oldest first, only when no model uses them)
function mdGeo(key,build,evict){const S=mdS();let e=S.G.get(key);
  if(e){S.G.delete(key);S.G.set(key,e);return e.g}
  const t0=performance.now();const B=build();e={g:mdBake(B),use:0,ev:!!evict};S.G.set(key,e);S.stat.built++;S.stat.ms+=performance.now()-t0;
  if(evict){let n=0;S.G.forEach(q=>{if(q.ev)n++});if(n>S.cap)for(const [k,q] of S.G){if(n<=S.cap)break;if(q.ev&&q.use<=0&&k!==key){for(const t in q.g)q.g[t].dispose();S.G.delete(k);n--}}}
  return e.g}
function mdUse(key,d){const e=mdS().G.get(key);if(e)e.use+=d}

// =====================================================================================================
// body profile (HB skeleton; town folk use idlNB — the arms follow whatever bones the table has)
