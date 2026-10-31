// ================= v181: cage bodies — one connected, smoothed surface per creature =================
// Owner (Oct 30 2026): "our humanoid toolkit is bad — the arms don't connect to the body and the shoulders are placed
// incorrectly"; "heads have no neck and the facial detail looks cluttered and lost".
// The md / a181 bodies were separate tubes (torso, arms, legs, head) pushed into each other, with faces made of small boxes
// glued on. A cage body is modelled the way a character artist box-models a low-poly figure: one coarse quad cage of the whole
// body — torso rings, the arms and legs extruded out of the torso's side and bottom, the neck out of its top, the head
// continuing from the neck — smoothed once by Catmull-Clark subdivision. So the shoulder (deltoid cap, armpit), the hips and
// the neck are real joined shapes, and the face (sockets, brow ridge, cheekbones, nose, jaw) is pushed and pulled out of the
// head itself. Bone weights are set on the cage and smoothed with it, so joints bend softly.
// The skeleton is the humanoid one (same bone names, every animation plays) with its rest joints where this body puts them:
// a v99 plan (`cg181Plan`) is registered for the model's preset, so mkBones builds the bones there; the body is built
// directly in that space (B.kqPre='none': no proportion warp).
// Clothes and armour come from the body's own surface (`cg181Shell`: chosen faces pushed out along the normals, rims tucked
// to the skin), so they fit exactly and bend with it.
var CG181={on:true};
// ---------------- the cage: vertices carry [x,y,z, w0..wn] (one weight per bone), faces carry a part tag and an inside point ----------------
function cgMesh(B){return {B,nb:B.O.length,V:[],F:[]}}
function cgW(B,w){const o=[];w.forEach(([n,x])=>o.push([mdBI(B,n),x]));return o}
function cgVert(M,p,w){const a=new Float64Array(3+M.nb);a[0]=p[0];a[1]=p[1];a[2]=p[2];let t=0;w.forEach(q=>t+=q[1]);cgW(M.B,w).forEach(([i,x])=>a[3+i]+=x/(t||1));M.V.push(a);return M.V.length-1}
function cgFace(M,v,part,ref){M.F.push({v,part,ref})}
// a ring of n vertices round centre c: u = "outward" axis, f = "front" axis (unit, perpendicular), radii ru (along u) and
// per-vertex: angle φ_j = a0 + dir*j*2π/n from u toward f; rf / rb = radius toward +f / −f; push(j,φ) → extra radius
function cgRing(M,c,u,fv,n,ru,rf,rb,w,o){o=o||{};const out=[];for(let j=0;j<n;j++){const a=(o.a0||0)+(o.dir||1)*j*Math.PI*2/n,ca=Math.cos(a),sa=Math.sin(a),e=o.push?o.push(j,a):0,
    r1=ru+e,r2=(sa>=0?rf:rb)+e;const p=[c[0]+u[0]*ca*r1+fv[0]*sa*r2,c[1]+u[1]*ca*r1+fv[1]*sa*r2,c[2]+u[2]*ca*r1+fv[2]*sa*r2];out.push(cgVert(M,p,typeof w=='function'?w(j,a):w))}return out}
function cgBand(M,A,Bv,part,ref,skip){const n=A.length;for(let j=0;j<n;j++){if(skip&&skip(j))continue;cgFace(M,[A[j],A[(j+1)%n],Bv[(j+1)%n],Bv[j]],part,typeof ref=='function'?ref(j):ref)}}
// close a ring with quads round a centre vertex (n even)
function cgCap(M,R,cp,w,part,ref){const c=cgVert(M,cp,w),n=R.length;for(let j=0;j<n;j+=2)cgFace(M,[R[j],R[(j+1)%n],R[(j+2)%n],c],part,ref||null);return c}
// make every face point away from its inside point (or the part's centroid)
function cgOrient(M){const V=M.V;M.F.forEach(f=>{const v=f.v.map(i=>V[i]);let nx=0,ny=0,nz=0,cx=0,cy=0,cz=0;for(let i=0;i<v.length;i++){const a=v[i],b=v[(i+1)%v.length];nx+=(a[1]-b[1])*(a[2]+b[2]);ny+=(a[2]-b[2])*(a[0]+b[0]);nz+=(a[0]-b[0])*(a[1]+b[1]);cx+=a[0];cy+=a[1];cz+=a[2]}
  cx/=v.length;cy/=v.length;cz/=v.length;const r=f.ref;if(!r)return;if(nx*(cx-r[0])+ny*(cy-r[1])+nz*(cz-r[2])<0)f.v.reverse()})}
// one Catmull-Clark step (n-gons in, quads out); every attribute (position and weights) is smoothed the same way
function cgSub(M){const V=M.V,D=V[0].length,F=M.F,E=new Map(),NV=[],add=(a,b,t)=>{for(let i=0;i<D;i++)a[i]+=b[i]*t;return a};
  const fp=F.map(f=>{const p=new Float64Array(D);f.v.forEach(i=>add(p,V[i],1/f.v.length));return p});
  F.forEach((f,fi)=>{const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],b=f.v[(i+1)%n],k=a<b?a+'_'+b:b+'_'+a;let e=E.get(k);if(!e){e={a:Math.min(a,b),b:Math.max(a,b),f:[]};E.set(k,e)}e.f.push(fi)}});
  const out={B:M.B,nb:M.nb,V:[],F:[]},vid=new Map(),eid=new Map(),fid=[];
  const vf=V.map(()=>[]),ve=V.map(()=>[]);F.forEach((f,fi)=>f.v.forEach(i=>vf[i].push(fi)));E.forEach(e=>{ve[e.a].push(e);ve[e.b].push(e)});
  E.forEach((e,k)=>{const p=new Float64Array(D);if(e.f.length==2){add(p,V[e.a],.25);add(p,V[e.b],.25);add(p,fp[e.f[0]],.25);add(p,fp[e.f[1]],.25)}else{add(p,V[e.a],.5);add(p,V[e.b],.5)}out.V.push(p);eid.set(k,out.V.length-1)});
  V.forEach((P,i)=>{if(!vf[i].length)return;const n=ve[i].length,bd=ve[i].filter(e=>e.f.length<2),p=new Float64Array(D);
    if(bd.length){add(p,P,.75);bd.forEach(e=>{add(p,V[e.a==i?e.b:e.a],.125)})}
    else{const Q=new Float64Array(D),R=new Float64Array(D);vf[i].forEach(fi=>add(Q,fp[fi],1/vf[i].length));ve[i].forEach(e=>{add(R,V[e.a],.5/n);add(R,V[e.b],.5/n)});add(p,Q,1/n);add(p,R,2/n);add(p,P,(n-3)/n)}
    out.V.push(p);vid.set(i,out.V.length-1)});
  F.forEach((f,fi)=>{out.V.push(fp[fi]);fid[fi]=out.V.length-1});
  const ek=(a,b)=>eid.get(a<b?a+'_'+b:b+'_'+a);
  F.forEach((f,fi)=>{const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],nx=f.v[(i+1)%n],pv=f.v[(i+n-1)%n];out.F.push({v:[vid.get(a),ek(a,nx),fid[fi],ek(pv,a)],part:f.part,ref:f.ref})}});
  return out}
// face info for colour / selection: centroid, normal, part
function cgInfo(M,f){const v=f.v.map(i=>M.V[i]),c=[0,0,0];let nx=0,ny=0,nz=0;for(let i=0;i<v.length;i++){const a=v[i],b=v[(i+1)%v.length];nx+=(a[1]-b[1])*(a[2]+b[2]);ny+=(a[2]-b[2])*(a[0]+b[0]);nz+=(a[0]-b[0])*(a[1]+b[1]);c[0]+=a[0];c[1]+=a[1];c[2]+=a[2]}
  const l=Math.hypot(nx,ny,nz)||1;return {x:c[0]/v.length,y:c[1]/v.length,z:c[2]/v.length,nx:nx/l,ny:ny/l,nz:nz/l,s:nz/l,c:nx/l,part:f.part,i:0}}
// write faces into the md builder (layer t), coloured by col(m); keep(m) selects; P = per-vertex position override (shells)
function cgEmit(B,M,col,o){o=o||{};const t=o.t||'c',W=new Map(),wOf=i=>{let w=W.get(i);if(w)return w;const a=M.V[i],L=[];for(let j=3;j<a.length;j++)if(a[j]>1e-4)L.push([j-3,a[j]]);L.sort((p,q)=>q[1]-p[1]);const si=[0,0,0,0],sw=[0,0,0,0];let s=0;
    for(let j=0;j<4&&j<L.length;j++){si[j]=L[j][0];sw[j]=L[j][1];s+=L[j][1]}for(let j=0;j<4;j++)sw[j]/=s||1;if(!s)sw[0]=1;w=[si,sw];W.set(i,w);return w};
  // a per-vertex shade (o.shade or M.shade from cgShade) is multiplied into the face colour at each corner: baked crease
  // darkening / ridge wear / height light that blends smoothly across the faceted surface, at no triangle cost
  const sh=o.shade||M.shade,pos=o.pos||(i=>M.V[i]),vx=i=>{const p=pos(i);return {x:p[0],y:p[1],z:p[2],w:wOf(i),k:sh?sh[i]:1}};
  // o.vcol(m): a colour per corner instead of per face, for hides whose colour should flow (goo, moss, mottled skin) instead
  // of stepping face by face; m = {x,y,z, nx,ny,nz, s (=nz), c (=nx), part}. col(m) returning null on a face hands it to vcol.
  const VN=o.vcol?(M.N||cgNormals(M)):null,VC=new Map(),TC=new THREE.Color(),vc=(i,part)=>{const key=i+part;let q=VC.get(key);if(q)return q;const p=pos(i),n=VN[i];
    TC.setHex(mdC(o.vcol({x:p[0],y:p[1],z:p[2],nx:n[0],ny:n[1],nz:n[2],s:n[2],c:n[0],part})));q=[TC.r,TC.g,TC.b];VC.set(key,q);return q};
  M.F.forEach((f,fi)=>{const m=cgInfo(M,f);if(o.keep&&!o.keep(m,fi))return;const h=typeof col=='function'?col(m):col,v=f.v.map(vx);
    if(h==null&&o.vcol)v.forEach((x,j)=>x.rgb=vc(f.v[j],f.part));const c=mdC(h==null?0:h);mdTri(B,t,v[0],v[1],v[2],c);if(v.length==4)mdTri(B,t,v[0],v[2],v[3],c)})}
// baked shading per vertex of the smoothed body (docs/MODEL_DETAIL_RECIPE.md 2.2): cavity (creases darker, ridges lighter,
// Blender's "dirty vertex colours" angle, blurred), a height gradient (darker toward the feet) and a top light (down-facing
// darker). o: cav (strength, 1), blur (2), y0/y1 (feet / top heights), hk (height term .22), dk (down-facing term .14), min (.5)
function cgShade(M,o){o=o||{};const V=M.V,N=cgNormals(M),nb=V.map(()=>new Set());
  M.F.forEach(f=>f.v.forEach((a,i)=>{const b=f.v[(i+1)%f.v.length];nb[a].add(b);nb[b].add(a)}));
  let t=V.map((v,i)=>{let d=[0,0,0];nb[i].forEach(j=>{d=add3(d,nrm3(sub3(V[j],v)))});const l=Math.hypot(d[0],d[1],d[2]);if(l<1e-6)return .5;
    const c=(N[i][0]*d[0]+N[i][1]*d[1]+N[i][2]*d[2])/l;return Math.acos(Math.max(-1,Math.min(1,c)))/Math.PI});
  for(let k=0;k<(o.blur==null?2:o.blur);k++)t=t.map((x,i)=>{let s=x;nb[i].forEach(j=>s+=t[j]);return s/(nb[i].size+1)});
  let y0=o.y0,y1=o.y1;if(y0==null||y1==null){y0=1e9;y1=-1e9;V.forEach(v=>{y0=Math.min(y0,v[1]);y1=Math.max(y1,v[1])})}
  const cav=o.cav==null?1:o.cav,hk=o.hk==null?.22:o.hk,dk=o.dk==null?.14:o.dk,mn=o.min==null?.5:o.min;
  return t.map((x,i)=>{const c=x<.5?1-(.5-x)*3.2*cav:1+Math.min(.12,(x-.5)*1.2*cav),h=Math.max(0,Math.min(1,(V[i][1]-y0)/(y1-y0||1))),
    sm=h*h*(3-2*h);return Math.max(mn,Math.min(1.15,c*(1-hk+hk*sm)*(1-dk+dk*(.5*N[i][1]+.5))))})}
// smooth vertex normals of a mesh (area weighted)
function cgNormals(M){const N=M.V.map(()=>[0,0,0]);M.F.forEach(f=>{const v=f.v.map(i=>M.V[i]);let nx=0,ny=0,nz=0;for(let i=0;i<v.length;i++){const a=v[i],b=v[(i+1)%v.length];nx+=(a[1]-b[1])*(a[2]+b[2]);ny+=(a[2]-b[2])*(a[0]+b[0]);nz+=(a[0]-b[0])*(a[1]+b[1])}
  f.v.forEach(i=>{N[i][0]+=nx;N[i][1]+=ny;N[i][2]+=nz})});return N.map(n=>{const l=Math.hypot(n[0],n[1],n[2])||1;return [n[0]/l,n[1]/l,n[2]/l]})}
// a shell from the body surface: the faces sel(m) picks, pushed out along the normals by off (off(m-vertex) may vary); the
// rim (vertices on the edge of the selection) is tucked onto the skin, so a shell never stands loose
function cgShell(B,M,sel,off,col,o){o=o||{};const N=M.N||(M.N=cgNormals(M)),pick=M.F.map(f=>sel(cgInfo(M,f))),cnt=new Map();
  M.F.forEach((f,fi)=>{if(!pick[fi])return;const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],b=f.v[(i+1)%n],k=a<b?a+'_'+b:b+'_'+a;cnt.set(k,(cnt.get(k)||0)+1)}});
  const rim=new Set();M.F.forEach((f,fi)=>{if(!pick[fi])return;const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],b=f.v[(i+1)%n],k=a<b?a+'_'+b:b+'_'+a;if(cnt.get(k)==1){rim.add(a);rim.add(b)}}});
  const P=new Map(),pos=i=>{let p=P.get(i);if(p)return p;const v=M.V[i],n=N[i],d=(typeof off=='function'?off(v):off)*(rim.has(i)?(o.rim==null?.12:o.rim):1);p=[v[0]+n[0]*d,v[1]+n[1]*d,v[2]+n[2]*d];P.set(i,p);return p};
  cgEmit(B,M,col,{t:o.t,pos,keep:(m,fi)=>pick[fi]})}
// sculpt the smoothed surface: every vertex of the chosen parts moves along its normal by fn(x,y,z,n) (soft bumps and dents:
// nose, brow ridge, eye sockets, cheekbones…), so features keep their shape instead of melting in the subdivision
function cgSculpt(M,parts,fn){const N=cgNormals(M),pt=new Array(M.V.length);M.F.forEach(f=>f.v.forEach(i=>{if(pt[i]==null)pt[i]=f.part}));
  M.V.forEach((v,i)=>{if(!parts[pt[i]])return;const d=fn(v[0],v[1],v[2],N[i]);if(d){v[0]+=N[i][0]*d;v[1]+=N[i][1]*d;v[2]+=N[i][2]*d}});M.N=null}
// a soft bump: 1 at (x0,y0), falling off over sx / sy (Gaussian)
function cgG(x,y,x0,y0,sx,sy){const a=(x-x0)/sx,b=(y-y0)/sy;return Math.exp(-(a*a+b*b))}
// the surface point hit by a ray (origin p, direction d) on the smoothed body, or null
function cgRay(M,p,d,parts){let best=null,bt=1e9;const V=M.V,sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dt=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const tri=(a,b,c)=>{const e1=sub(b,a),e2=sub(c,a),h=cr(d,e2),det=dt(e1,h);if(Math.abs(det)<1e-12)return;const f=1/det,s=sub(p,a),u=f*dt(s,h);if(u<0||u>1)return;const q=cr(s,e1),v=f*dt(d,q);if(v<0||u+v>1)return;const t=f*dt(e2,q);if(t>1e-6&&t<bt){bt=t;best=[p[0]+d[0]*t,p[1]+d[1]*t,p[2]+d[2]*t]}};
  M.F.forEach(f=>{if(parts&&!parts[f.part])return;const v=f.v.map(i=>V[i]);tri(v[0],v[1],v[2]);if(v.length==4)tri(v[0],v[2],v[3])});return best}

// ---------------- the humanoid cage from a spec ----------------
// S: {torso:[[y, rx, f, b, z]…] bottom→top (16-vertex rings; the arms leave from rings ia..ia+2), push(ringIndex,k,θ) → radius,
//   neck:[[y,rx,f,b,z]…], head:[[y,rx,f,b,z]…] (16-vertex rings, the last closed), face(ringIndex,k,θ) → radius,
//   arm:[{t (0 shoulder … 1 elbow … 2 wrist … 2.4 knuckles), r, rf, rb, o (outward bulge)}…], leg:[{t (0 hip … 1 knee … 2 ankle), r, rf, rb}…],
//   foot:{len, w, h}, J: joints {pelvis:[x,y,z]…} (the skeleton's rest pose)}
// returns {M (smoothed), S, at(y) torso ring at height y}
function cg181Body(B,S){const M=cgMesh(B),J=S.J,TW=y=>cgTorsoW(S,y),T16=S.n||24,H=T16/2,Q=T16/4;
  const tr=S.torso.map((q,i)=>cgRing(M,[0,q[0],q[4]||0],[1,0,0],[0,0,1],T16,q[1],q[2],q[3],TW(q[0]),{a0:0,push:S.push&&((j,a)=>S.push(i,j,a))}));
  // note: cgRing's angle runs from +x (u) toward +z (f); index j=0 is the right side, 4 the front, 8 the left, 12 the back
  const ia=S.armRing,cent=q=>[0,q[0],q[4]||0];
  // torso quads, leaving the two arm sockets open (columns round the sides, rings ia..ia+2)
  const sock=(i,j)=>i>=ia&&i<ia+2&&(j==T16-1||j==0||j==H-1||j==H);
  for(let i=0;i<tr.length-1;i++)cgBand(M,tr[i],tr[i+1],'torso',cent([(S.torso[i][0]+S.torso[i+1][0])/2,0,0,0,S.torso[i][4]||0]),j=>sock(i,j));
  // arms: the socket boundary (8 vertices) → rings down the arm
  [-1,1].forEach(s=>{const bn=s<0?'aL':'aR',a0=mdV0(J[bn+'0']),a1=mdV0(J[bn+'1']),a2=mdV0(J[bn+'2']),R0=tr[ia],R1=tr[ia+1],R2=tr[ia+2];
    const c1=s>0?[1,0,T16-1]:[H-1,H,H+1];   // the socket's three columns: front, side, back
    const root=[R0[c1[0]],R0[c1[1]],R0[c1[2]],R1[c1[2]],R2[c1[2]],R2[c1[1]],R2[c1[0]],R1[c1[0]]];
    // root order: front-low, armpit (inner), back-low, back-mid, back-top, top (outer), front-top, front-mid
    // the socket's outward direction (from the torso's axis through the socket's centre)
    const sc=root.reduce((a,i)=>add3(a,mul3(M.V[i].slice(0,3),1/8)),[0,0,0]),sO=nrm3([sc[0],0,sc[2]-(S.torso[ia+1][4]||0)]);
    const pts=S.arm.map(q=>{const t=q.t,p=t<=1?lerp3(a0,a1,t):t<=2?lerp3(a1,a2,t-1):add3(a2,mul3(nrm3(sub3(a2,a1)),(t-2)*.2));return p});
    let prev=root;S.arm.forEach((q,i)=>{const c=pts[i],dn=nrm3(sub3(pts[Math.min(i+1,pts.length-1)],i?pts[i-1]:[s*.04+a0[0]*.8,a0[1],a0[2]])),
      u0=nrm3(sub3([s,0,0],mul3(dn,dn[0]*s))),fv=nrm3(cross3(dn,u0)),f0=fv[2]<0?mul3(fv,-1):fv,
      // the forearm's twist: the wrist and hand turn by S.pron (the back of the hand toward the front), rising along the forearm
      tw=((S.pron&&S.pron[s])||0)*Math.max(0,Math.min(1,(q.t-1.3)/.65)),u=add3(mul3(u0,Math.cos(tw)),mul3(f0,Math.sin(tw))),f2=sub3(mul3(f0,Math.cos(tw)),mul3(u0,Math.sin(tw)));
      const w=q.t<.15?[['chest',.35],[bn+'0',.65]]:q.t<.9?[[bn+'0',1]]:q.t<1.1?[[bn+'0',.5],[bn+'1',.5]]:q.t<1.85?[[bn+'1',1]]:q.t<2.05?[[bn+'1',.4],[bn+'2',.6]]:[[bn+'2',1]];
      // the j order matches the root: j0 front-low(135°) … φ_j = (j−5)·45° from "outer" toward front
      // S.armK {'-1','1'}: one arm thicker than the other (non-human creatures needn't be symmetric)
      const K=(S.armK&&S.armK[s])||1,ring=[];for(let j=0;j<8;j++){const a=(j-5)*Math.PI/4,ca=Math.cos(a),sa=Math.sin(a),ro=(q.r+(ca>0?(q.o||0)*ca:0))*K,rf=(sa>=0?(q.rf||q.r):(q.rb||q.r))*K;
        let p=[c[0]+u[0]*ca*ro+f2[0]*sa*rf,c[1]+u[1]*ca*ro+f2[1]*sa*rf,c[2]+u[2]*ca*ro+f2[2]*sa*rf];
        // (S.j2) the shoulder grows out of the body: the first rings start from the socket pushed outward and only then
        // become the arm, so the arm is seated in the shoulder instead of folding back into a thin neck at the join
        if(S.j2&&i<2){const P=M.V[root[j]],b=i?.78:.42,o2=(i?.55:.3)*S.arm[0].r;p=lerp3([P[0]+sO[0]*o2,P[1]+sO[1]*o2,P[2]+sO[2]*o2],p,b)}
        ring.push(cgVert(M,p,w))}
      cgBand(M,prev,ring,'arm',c);prev=ring});
    cgCap(M,prev,add3(pts[pts.length-1],mul3(nrm3(sub3(a2,a1)),.012)),[[bn+'2',1]],'hand',pts[pts.length-2])});
  // a serpent body instead of legs (naga): the bottom ring flows on into the tail rings (S.tail: {p, r, w}), the front of the
  // torso becoming the underside of the tail
  if(S.tail){let prev=tr[0];const TL=S.tail,n=T16;TL.forEach((q,i)=>{const t=nrm3(sub3(TL[Math.min(i+1,TL.length-1)].p,i?TL[i-1].p:[0,S.torso[0][0],S.torso[0][4]||0])),
      u=nrm3(sub3([1,0,0],mul3(t,t[0]))),v=nrm3(cross3(t,u)),ring=[];for(let j=0;j<n;j++){const a=j*Math.PI*2/n,ca=Math.cos(a),sa=Math.sin(a),r1=q.r,r2=sa>=0?q.r*(q.fl||.82):q.r*(q.tp||.95);
        ring.push(cgVert(M,[q.p[0]+u[0]*ca*r1+v[0]*sa*r2,q.p[1]+u[1]*ca*r1+v[1]*sa*r2,q.p[2]+u[2]*ca*r1+v[2]*sa*r2],q.w))}
      cgBand(M,prev,ring,'tail',q.p);prev=ring});const L=TL[TL.length-1],P2=TL[TL.length-2];cgCap(M,prev,add3(L.p,mul3(nrm3(sub3(L.p,P2.p)),L.r*.8)),L.w,'tail',P2.p)}
  // legs: the bottom ring split in two halves with a crotch line
  const R=tr[0],y0=S.torso[0][0],q0=S.torso[0],cf=S.tail?0:cgVert(M,[0,y0-.03,q0[2]*.5+(q0[4]||0)],[['pelvis',1]]),cm=S.tail?0:cgVert(M,[0,y0-(S.j2?.3*S.leg[0].r+.02:.045),q0[4]||0],[['pelvis',1]]),cb=S.tail?0:cgVert(M,[0,y0-.03,-q0[3]*.5+(q0[4]||0)],[['pelvis',1]]);
  if(!S.tail)[-1,1].forEach(s=>{const l=s<0?'lh':'rh',h0=mdV0(J[l+'0']),k1=mdV0(J[l+'1']),k2=mdV0(J[l+'2']);
    // right half: front (j4) → side (j0) → back (j12): 4,3,2,1,0,15,14,13,12 · left: 4,5,…,12
    const half=[];for(let i=0;i<=H;i++)half.push(s>0?(Q-i+T16)%T16:Q+i);const root=half.map(j=>R[j]).concat([cb,cm,cf]),LN=root.length;
    let prev=root;S.leg.forEach((q,i)=>{const t=q.t,c=t<=1?lerp3(h0,k1,t):lerp3(k1,k2,Math.min(1,t-1)),w=t<.12?[['pelvis',.4],[l+'0',.6]]:t<.9?[[l+'0',1]]:t<1.1?[[l+'0',.5],[l+'1',.5]]:t<1.9?[[l+'1',1]]:[[l+'1',.4],[l+'2',.6]];
      const ring=[];for(let j=0;j<LN;j++){const a=(j<=H?90-j*180/H:[-135,180,135][j-H-1])*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),rf=sa>=0?(q.rf||q.r):(q.rb||q.r);
        let p=[c[0]+s*ca*(q.r+(ca>0?(q.o||0):0)),c[1],c[2]+sa*rf];
        // (S.j2) the thigh grows out of the hip: the first rings start from the hip ring and only then become the leg
        if(S.j2&&i<2){const P=M.V[root[j]],b=i?.8:.45;p=lerp3([P[0],P[1]-(i?.5:.3)*S.leg[0].r,P[2]],p,b)}
        ring.push(cgVert(M,p,w))}
      cgBand(M,prev,ring,'leg',c);prev=ring});
    cgCap(M,prev,[k2[0],k2[1]-.02,k2[2]],[[l+'2',1]],'leg',[k2[0],k2[1]+.1,k2[2]]);
    // the foot: a closed cage of its own (heel → toes), overlapping the ankle
    const F=S.foot,fw=F.w,fr=[],FR=[[-.05,.045,.034,.04],[-.01,.06,.042,.05],[.06,.04,.05,.036],[.12,.026,.052,.022],[.155,.018,.044,.014]];(F.lite?[FR[0],FR[2],FR[4]]:FR).forEach(([z,y,rx,ry],i)=>{
      fr.push(cgRing(M,[k2[0],y*F.h,k2[2]+z*F.len],[s,0,0],[0,1,0],8,rx*fw,ry*F.h,ry*F.h*.75,[[l+'2',1]],{}))});
    for(let i=0;i<fr.length-1;i++)cgBand(M,fr[i],fr[i+1],'foot',[k2[0],.03,k2[2]+.05]);cgCap(M,fr[0],[k2[0],.045*F.h,k2[2]-.06*F.len],[[l+'2',1]],'foot',[k2[0],.04,k2[2]+.03]);cgCap(M,fr[fr.length-1],[k2[0],.016*F.h,k2[2]+.165*F.len],[[l+'2',1]],'foot',[k2[0],.03,k2[2]+.05])});
  // the top of the torso: neck and head, one ring stack
  let prev=tr[tr.length-1];const NH=S.neck.concat(S.head),nN=S.neck.length;
  NH.forEach((q,i)=>{const hi=i-nN,w=cgNeckW(S,q[0]),ring=cgRing(M,[0,q[0],q[4]||0],[1,0,0],[0,0,1],T16,q[1],q[2],q[3],w,{push:hi>=0&&S.face?(j,a)=>S.face(hi,j,a):null});
    cgBand(M,prev,ring,i<nN?'neck':'head',[0,q[0],(q[4]||0)-.01]);prev=ring});
  const top=S.head[S.head.length-1];cgCap(M,prev,[0,top[0]+.012,(top[4]||0)-.004],[['head',1]],'head',[0,top[0]-.08,0]);
  cgOrient(M);const SM=cgSub(M);return {M:SM,S,cage:M}}
function cgTorsoW(S,y){const J=S.J,p=J.pelvis[1],sp=J.spine[1],ch=J.chest[1],nk=J.neck[1];
  return y<=p?[['pelvis',1]]:y<=sp?mdWb('pelvis','spine',(y-p)/(sp-p)):y<=ch?mdWb('spine','chest',(y-sp)/(ch-sp)):y<=nk-.04?[['chest',1]]:mdWb('chest','neck',Math.min(1,(y-nk+.04)/.06))}
function cgNeckW(S,y){const J=S.J,nk=J.neck[1],hd=J.head[1];return y<=nk?mdWb('chest','neck',.6):y<hd-.02?mdWb('neck','head',Math.max(0,(y-nk)/(hd-.02-nk))*.7):[['head',1]]}
function mdV0(a){return [a[0],a[1],a[2]]}
function lerp3(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
function add3(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]}function sub3(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]}function mul3(a,t){return [a[0]*t,a[1]*t,a[2]*t]}
function nrm3(a){const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]}function cross3(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
// the skeleton's rest pose for a cage body: a v99 plan with these joint positions (no warp)
function cg181Plan(name,J){const S=AW_PROP99,names=Object.keys(HB),abs={},N={},M={},id=[1,0,0,0,1,0,0,0,1];names.forEach(n=>{abs[n]=[HB[n][1],HB[n][2],HB[n][3]];N[n]=(J[n]||abs[n]).slice();M[n]=id});
  let m=S.plans.get(HB);if(!m){m={};S.plans.set(HB,m)}m[name]={names,abs,N,M,idx:names.map(n=>({a:abs[n],n:N[n],M:M[n]})),lift:0,hip:N.pelvis[1]};return m[name]}
// a cage foe: the body builder gets (B, P, k, C) with C = the smoothed body; registered like the a181 foes
function cg181Reg(key,S,fn){const pn='cg181_'+key;cg181Plan(pn,S.J);a181Reg(key,function(B,P,k,L){B.kqPre='none';if(S.extra)S.extra.forEach(n=>{if(B.O.indexOf(n)<0)B.O.push(n)});const C=cg181Body(B,S);P.cg=C;k.B181=B;fn(B,P,k,C,S);cgSeat(k,C.M,0)},pn);(CG181.keys||(CG181.keys={}))[key]=1}
// ring helpers for specs: where on the torso / head a point is
function cgAt(list,y){for(let i=0;i<list.length-1;i++){const a=list[i],b=list[i+1];if(y<=b[0]){const t=Math.max(0,(y-a[0])/(b[0]-a[0]));return a.map((v,j)=>v+(b[j]-v)*t)}}return list[list.length-1]}

// ===================================================================== Vampire Thrall (cage prototype) =====================================================================
// Gaunt and hunched: ribs, collarbones and shoulder blades under ash-grey skin; long, thin arms that grow out of the shoulders;
// a long neck into a narrow skull with deep eye sockets, a hard brow, high cheekbones over hollow cheeks, a long nose and a
// lipless mouth with fangs. Wears an open, torn crimson coat (shoulders, back, upper arms), ragged breeches, an iron collar.
// ---------------- (v181 refine) the vampires' own helpers (va_…): shells that replace the skin under them, clean hands, toes ----------------
// a shell whose rim lies on the skin; the skin under it is not drawn (va_Body draws the rest of the body at the end), so a
// covered body costs no extra triangles. col(m) colours per face; o.vcol(m) per corner (colour that flows, no blocky patches);
// the body's baked shade (M.shade) darkens creases on the shell too
function va_Sh(B,M,sel,off,col,o){o=o||{};const N=M.N||(M.N=cgNormals(M)),pick=M.F.map(f=>sel(cgInfo(M,f))),cnt=new Map();
  M.F.forEach((f,fi)=>{if(!pick[fi])return;const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],b=f.v[(i+1)%n],k=a<b?a+'_'+b:b+'_'+a;cnt.set(k,(cnt.get(k)||0)+1)}});
  const rim=new Set();cnt.forEach((c,k)=>{if(c==1)k.split('_').forEach(x=>rim.add(+x))});
  const P=new Map(),pos=i=>{let p=P.get(i);if(p)return p;const v=M.V[i],n=N[i],d=rim.has(i)?0:(typeof off=='function'?off(v):off);p=[v[0]+n[0]*d,v[1]+n[1]*d,v[2]+n[2]*d];P.set(i,p);return p};
  cgEmit(B,M,col,{t:o.t,pos,vcol:o.vcol,keep:(m,fi)=>pick[fi]});if(!o.show)(M.vaHide||(M.vaHide=[])).push(pick);return pick}
// a belt: a band of the torso between y−h and y+h pushed out by off, replacing the skin under it
function va_Belt(B,M,y,h,off,col,t){va_Sh(B,M,m=>m.part=='torso'&&Math.abs(m.y-y)<h,off,col,{t})}
// the body's skin, leaving out every face a va_Sh shell covers
function va_Body(B,M,col,vcol){const H=M.vaHide||[];cgEmit(B,M,col,{vcol,keep:(m,fi)=>!H.some(p=>p[fi])})}
// the hand's frame, turned by S.pron like the cage's hand: d down the hand, u the back of the hand, f across the knuckles
function va_HF(S,s){const bn=s<0?'aL':'aR',a1=S.J[bn+'1'],a2=S.J[bn+'2'],d=nrm3(sub3(a2,a1)),u0=nrm3(sub3([s,0,0],mul3(d,d[0]*s))),fv=nrm3(cross3(d,u0)),f0=fv[2]<0?mul3(fv,-1):fv,tw=(S.pron&&S.pron[s])||0;
  return {bn,a2,d,u:add3(mul3(u0,Math.cos(tw)),mul3(f0,Math.sin(tw))),f:sub3(mul3(f0,Math.cos(tw)),mul3(u0,Math.sin(tw)))}}
// one digit as a single rounded, tapering loft (no separate knuckle balls and sticks): rooted inside the hand or foot, bending
// by curl at each joint about ax, the last segment (and a claw beyond it) in the nail colour
function va_Digit(B,bn,p,dir,ax,len,n,curl,r,col,nail,claw,seg){const W=[[bn,1]],q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(ax[0],ax[1],ax[2]).normalize(),curl),dd=new THREE.Vector3(dir[0],dir[1],dir[2]).normalize(),D=()=>[dd.x,dd.y,dd.z];
  const R=[{p:sub3(p,mul3(D(),r*1.8)),rx:r*.85,w:W},{p:p.slice(),rx:r,w:W}];let a=p.slice();
  for(let i=0;i<n;i++){a=add3(a,mul3(D(),len/n));if(i<n-1)dd.applyQuaternion(q);R.push({p:a,rx:r*(1-.32*(i+1)/n),w:W})}
  if(claw){dd.applyQuaternion(q);a=add3(a,mul3(D(),claw));R.push({p:a,rx:r*.14,w:W})}
  R.forEach(x=>{x.f=x.rx;x.b=x.rx});const nr=R.length,ni=claw?nr-2:nr-1.55;mdLoft(B,R,{seg:seg||4,ref:ax,capB:true,col:m=>nail!=null&&m.i>ni?nail:col})}
// a loft with a colour per corner (o.vcol({x,y,z,i,a,c,s}) → hex): rings R {p, rx (across, along ref×tangent), f / b (thickness
// toward +ref / −ref), w}, o.push(i,a) → extra radius, o.capB closes the end; the colour flows corner to corner
function va_LoftV(B,R,o){const seg=o.seg||12,n=R.length,rows=[];let U=null;
  for(let i=0;i<n;i++){const tg=nrm3(sub3(R[Math.min(i+1,n-1)].p,R[Math.max(i-1,0)].p));let u=U||o.ref;u=nrm3(sub3(u,mul3(tg,u[0]*tg[0]+u[1]*tg[1]+u[2]*tg[2])));U=u;const sd=cross3(u,tg),r=R[i],w=mdW(B,r.w),row=[];
    for(let k=0;k<seg;k++){const a=Math.PI/2+k/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a),e=o.push?o.push(i,a):0,rx=r.rx+e,ry=(s>0?r.f:r.b)+e,p=add3(add3(r.p,mul3(sd,c*rx)),mul3(u,s*ry));
      const C=new THREE.Color(mdC(o.vcol({x:p[0],y:p[1],z:p[2],i,a,c,s})));row.push({x:p[0],y:p[1],z:p[2],w,rgb:[C.r,C.g,C.b]})}rows.push(row)}
  for(let i=0;i<n-1;i++)for(let k=0;k<seg;k++){const A=rows[i][k],A1=rows[i][(k+1)%seg],B2=rows[i+1][k],B3=rows[i+1][(k+1)%seg];mdTri(B,'c',A,A1,B2,0);mdTri(B,'c',B2,A1,B3,0)}
  if(o.capB){const r=rows[n-1],L=R[n-1],cp=add3(L.p,mul3(nrm3(sub3(L.p,R[n-2].p)),Math.min(L.f,L.b)*.6)),mid=r[0].rgb.map((v,j)=>r.reduce((q,x)=>q+x.rgb[j],0)/seg),cv={x:cp[0],y:cp[1],z:cp[2],w:r[0].w,rgb:mid};
    for(let k=0;k<seg;k++)mdTri(B,'c',cv,r[(k+1)%seg],r[k],0)}}
// a hand growing out of the cage's palm: o {col, nail, kind 'claw'|'open'|'fist', len, r, claw}. Open and clawed hands get
// separate rounded, tapering finger lofts; a closed fist is ONE rounded mitten mass curling round the grip (the fingers don't
// change its outline), a low bumpy knuckle ridge, the finger gaps painted as thin dark lines, and the thumb as its own rounded
// loft crossing in front of the folded fingers
function va_Hand(B,S,s,o){const F=va_HF(S,s),bn=F.bn+'2',hs=S.hand||1,kn=add3(F.a2,mul3(F.d,.072*hs)),L=(o.len||1)*.075,r=o.r||.0072,ax=nrm3(cross3(F.u,F.d)),W=[[bn,1]];
  const P=(b,x,y)=>add3(add3(b,mul3(F.f,x)),mul3(F.u,y)),D=(a,b,c)=>nrm3(add3(add3(mul3(F.d,a),mul3(F.u,b)),mul3(F.f,c)));
  if(o.kind=='fist'){const k=r/.0072*hs,Q=(dd,uu)=>add3(add3(F.a2,mul3(F.d,dd*k)),mul3(F.u,uu*k)),gap=mdSh(o.col,.38),lt=mdSh(o.col,1.08);
    // the mitten: from inside the palm over the knuckles, folding back toward the palm (+u = the back of the hand)
    const R=[{p:Q(.05,.001),rx:.031*k,f:.014*k,b:.014*k,w:W},{p:Q(.076,.002),rx:.033*k,f:.017*k,b:.014*k,w:W},{p:Q(.094,-.012),rx:.032*k,f:.015*k,b:.013*k,w:W},
      {p:Q(.098,-.032),rx:.03*k,f:.013*k,b:.012*k,w:W},{p:Q(.088,-.046),rx:.028*k,f:.011*k,b:.01*k,w:W}];
    va_LoftV(B,R,{seg:12,ref:F.u,capB:true,push:(i,a)=>i==1&&Math.sin(a)>.3&&![-.5,0,.5].some(q=>Math.abs(Math.cos(a)-q)<.05)?.0028*k:0 /* knuckles: raised between the finger gaps */,
      vcol:m=>{if(m.i>=2&&[-.5,0,.5].some(q=>Math.abs(m.c-q)<.05))return gap;return m.i==1&&m.s>.3?lt:o.col}});
    // the thumb, crossing in front of the folded fingers
    const T=[{p:P(add3(F.a2,mul3(F.d,.03*k)),.02*k,-.004*k),rx:.011*k,f:.011*k,b:.011*k,w:W},{p:P(add3(F.a2,mul3(F.d,.06*k)),.03*k,-.022*k),rx:.0115*k,f:.0105*k,b:.0105*k,w:W},
      {p:P(add3(F.a2,mul3(F.d,.082*k)),.014*k,-.04*k),rx:.0095*k,f:.009*k,b:.009*k,w:W},{p:P(add3(F.a2,mul3(F.d,.086*k)),-.006*k,-.046*k),rx:.008*k,f:.0075*k,b:.0075*k,w:W}];
    va_LoftV(B,T,{seg:6,ref:F.u,capB:true,vcol:m=>m.i>2.5?mdSh(o.col,.9):o.col});return}
  for(let i=0;i<4;i++){const z=(1.5-i)*.0155,l=L*(i==3?.8:i==0?.93:1);va_Digit(B,bn,P(kn,z,-.002),D(1,-.12,z*.6),ax,l,3,o.kind=='claw'?.34:.16,r,o.col,o.nail,o.claw||0)}
  va_Digit(B,bn,P(add3(F.a2,mul3(F.d,.032)),.02,-.006),D(.6,-.3,.75),nrm3(cross3(F.u,F.f)),L*.6,2,.3,r*1.15,o.col,o.nail,(o.claw||0)*.6)}
// five lofted toes from the front of the foot (the big toe on the inside), an optional claw on each
function va_Toes(B,S,s,col,claw,nail){const l=s<0?'lh2':'rh2',A=S.J[l],L=S.foot.len,W=S.foot.w,tz=A[2]+.135*L;
  for(let i=0;i<5;i++){const x=A[0]-s*(2-i)*.017*W,r=(i==0?.0105:.0082-.0005*i)*W;va_Digit(B,l,[x,.021,tz],[-s*(2-i)*.08,-.3,1],[1,0,0],.03-.002*i,1,.35,r,col,claw?nail:null,claw||0,4)}}
// clamp
function va_C(v,a,b){return Math.max(a,Math.min(b,v))}
// the baked shade (cgShade), kept softer on the parts in soft {part: share kept}: a sculpted face is full of small creases at
// this resolution, and full-strength crease darkening breaks it into dark facets
function va_Shade(M,o,soft){const sh=cgShade(M,o),pt=new Array(M.V.length);M.F.forEach(f=>f.v.forEach(i=>{if(pt[i]==null)pt[i]=f.part}));
  return sh.map((v,i)=>{const k=soft&&soft[pt[i]];return k==null?v:1-(1-v)*k})}
// a head of fewer rings, at the heights (base head coordinates) where the profile turns: throat, jaw, chin, mouth, nose base,
// cheekbone, below the eyes, eyes, brow, forehead, top (the rings are read off the base head), with the base's jaw
// angle and hollow cheeks pushed by height instead of by ring number; o.jaw / o.cheek scale them
var va_HY=[1.52,1.538,1.555,1.572,1.59,1.608,1.626,1.644,1.68,1.73];
function va_Head(HY,hs,o){o=o||{};return {head:HY.map(y=>cgAt(CG181.base.head,y)),facePush:(i,j,a)=>{const y=HY[i],ca=Math.cos(a),sa=Math.sin(a),side=Math.abs(ca);let e=0;
  if(y<1.545&&sa>-.2&&side>.6)e+=.006*(o.jaw==null?1:o.jaw);if(y>1.56&&y<1.585&&sa>.4&&side>.3&&side<.8)e-=.008*(o.cheek==null?1:o.cheek);return e*(hs||1)}}}
// a hair shell (as cgHair) that replaces the skin under it
function va_Hair(B,M,S,o){const line=o.line||1.672,peak=o.peak||0,nape=S.hp(0,o.nape||1.56,0)[1];
  va_Sh(B,M,m=>{if(m.part!='head'&&!(o.neck&&m.part=='neck'&&m.s<-.2))return false;const by=(m.y-S.nb)/(S.hs*(S.hy||1))+1.52,bx=m.x/S.hs;if(m.y<nape)return false;
    return m.s<(o.side==null?.1:o.side)||by>line-peak*Math.exp(-(bx/.022)*(bx/.022))+(Math.abs(bx)>.05?-.004:0)},v=>(o.thick||.016)*Math.min(1,Math.max(.35,(v[1]-nape)/(.12*S.hs))),null,
    {vcol:m=>mdMix(o.col,mdSh(o.col,1.9),va_C(n3Sn(m.x*.4,m.y*3,m.z*.4,30,1)-.2,0,.8))})}
(function(){const J={pelvis:[0,.98,0],spine:[0,1.1,0],chest:[0,1.27,0],neck:[0,1.44,.01],head:[0,1.53,.02],
    lh0:[-.085,.92,0],lh1:[-.095,.49,.025],lh2:[-.1,.085,0],rh0:[.085,.92,0],rh1:[.095,.49,.025],rh2:[.1,.085,0],
    aL0:[-.175,1.385,-.005],aL1:[-.205,1.1,-.03],aL2:[-.215,.84,.0],aR0:[.175,1.385,-.005],aR1:[.205,1.1,-.03],aR2:[.215,.84,0],
    cp0:[0,1.38,-.13],cp1:[0,1.0,-.18],cp2:[0,.62,-.22]};
  const S={J,armRing:4,
    // groin, hips, waist, lower ribs, chest (armpit), mid socket, shoulder line, trapezius
    torso:[[.89,.118,.085,.095],[.97,.135,.086,.106],[1.06,.108,.064,.084],[1.16,.124,.082,.09],[1.27,.146,.1,.1],[1.335,.158,.094,.102],[1.4,.15,.068,.094],[1.44,.085,.058,.075,.004]],
    push:(i,j,a)=>{const ca=Math.cos(a),sa=Math.sin(a);let e=0;
      if(i==4&&sa>.6)e+=.008*(Math.abs(ca)>.15&&Math.abs(ca)<.7?1:-.6);   // pectorals either side of the sternum
      if(i==2&&sa>.5)e-=.01;                                               // the sunken belly
      if((i==4||i==5)&&sa<-.5&&Math.abs(ca)>.2&&Math.abs(ca)<.75)e+=.012; // shoulder blades
      if(i==6&&sa>.3&&Math.abs(ca)>.3&&Math.abs(ca)<.85)e+=.006;            // collarbones
      return e},
    neck:[[1.47,.052,.05,.056,.008],[1.5,.054,.054,.056,.014]],
    // throat/jaw, chin, mouth, cheek, nose, eyes, brow, forehead, crown, top
    // throat, under the chin, chin, mouth, upper lip, nose base, cheekbone, below the eyes, eyes, brow, above the brow, forehead ×2, crown, top
    head:[[1.52,.058,.064,.058,.018],[1.535,.062,.08,.064,.017],[1.548,.065,.092,.068,.016],[1.562,.069,.098,.074,.015],[1.576,.073,.1,.08,.014],[1.59,.077,.1,.085,.013],[1.605,.08,.098,.09,.012],
      [1.62,.082,.094,.094,.011],[1.634,.082,.093,.097,.01],[1.648,.082,.096,.099,.009],[1.664,.08,.094,.1,.008],[1.682,.077,.088,.1,.006],[1.7,.07,.076,.094,.004],[1.716,.058,.06,.082,.002],[1.73,.034,.034,.05,0]],
    face:(i,j,a)=>{const ca=Math.cos(a),sa=Math.sin(a),side=Math.abs(ca);let e=0;
      if(i==0&&sa>-.2&&side>.6)e+=.006;                        // the jaw's angle
      if((i==3||i==4)&&sa>.4&&side>.3&&side<.8)e-=.008;        // hollow cheeks
      return e},
    arm:[{t:.06,r:.05,o:.012},{t:.32,r:.042},{t:.62,r:.038,rf:.042},{t:.95,r:.034,rb:.04},{t:1.25,r:.036},{t:1.6,r:.03},{t:1.94,r:.024,rf:.026},{t:2.18,r:.017,rf:.034,rb:.03},{t:2.38,r:.015,rf:.034,rb:.028}],
    leg:[{t:.12,r:.078},{t:.45,r:.07,rf:.074},{t:.8,r:.056},{t:1.0,r:.048,rf:.054},{t:1.22,r:.05,rb:.058},{t:1.55,r:.04},{t:1.88,r:.032},{t:2.0,r:.034}],
    foot:{len:1.05,w:1,h:1}};
  const sk=0x625860,sk2=0x483e46,skL=0x6c626a,sock=0x140c10,lip=0x2a0c12,co=0x4a0c16,co2=0x2e0710,br=0x1e161a,ir=0x3a3434;
  const FACE=(x,y,z,n)=>{if(n[2]<.1)return 0;const f=Math.min(1,n[2]*1.6),ax=Math.abs(x);let d=0;
    d+=.024*cgG(x,y,0,1.596,.01,.013)+.013*cgG(x,y,0,1.616,.008,.012);            // the nose: a ridge down from the brow to a hooked tip
    [-1,1].forEach(s=>{d-=.017*cgG(x,y,s*.036,1.629,.016,.01);                     // deep eye sockets
      d+=.009*cgG(x,y,s*.056,1.6,.014,.01);d-=.011*cgG(x,y,s*.047,1.567,.016,.014);  // high cheekbones over hollow cheeks
      d+=.004*cgG(x,y,s*.01,1.585,.006,.004)});                                      // nostril wings
    d+=.011*cgG(x,y,0,1.648,.05,.006);                                              // the brow ridge
    d-=.005*cgG(x,y,0,1.558,.022,.0035);d+=.01*cgG(x,y,0,1.538,.018,.012);           // the mouth line, the chin
    return d*f};
  CG181.base=S;CG181.faceGaunt=FACE;S.pron={'-1':1.1};
  // (v181 refine) the Thrall's own body, built from the base above by cgHuman like every cage foe (the base itself is not
  // changed): 16 columns round the body, shoulder sockets as tall as the arm with the arms grown out of them and the thighs
  // out of the hips (sock, j2: the seated limbs), 10 head rings where the profile turns, one ring less in the forearm, one
  // less in the thigh and two in the shin, a lighter foot; a little narrower at the waist (gaunt)
  const T=cgHuman(Object.assign({n:16,sock:1,j2:1,footLite:1,rw:[1,1,.9,.95,1,1,1,1],arm:S.arm.filter((q,i)=>i!=5),leg:S.leg.filter((q,i)=>i!=2&&i!=5&&i!=6)},va_Head(va_HY,1)));
  T.pron=S.pron;
  cg181Reg('vamp',T,function(B,P,k,C){const M=C.M,EY=1.629,EX=.036,JJ=T.J,cl=va_C;cgSculpt(M,{head:1},FACE);
    M.shade=va_Shade(M,{cav:1,blur:3,y0:0,y1:1.75,hk:.26,dk:.1},{head:.35,neck:.4});   // baked creases, ridges and height light (no triangles)
    // the skin: smooth ash-grey, cooler and darker on the back; ribs, sternum and a sunken belly as soft painted shadow;
    // hollow cheeks, bruised under-eyes and dark sockets round the burning eyes
    const skinV=m=>{const n=n3Sn(m.x,m.y,m.z,7,2);let c=mdMix(skL,0x544858,cl((n-.45)*1.2,0,.35));
      if(m.nz<-.2)c=mdMix(c,sk2,cl((-m.nz-.2)*1.2,0,.75));
      if(m.part=='torso'&&m.nz>.2){const f=cl((m.y-1.1)/.04,0,1)*cl((1.31-m.y)/.04,0,1),ph=(((m.y+1.8*m.x*m.x-1.1)/.042)%1+1)%1,rb=Math.exp(-Math.pow((ph-.5)/.17,2));
        c=mdSh(c,1-.34*rb*f*cl((Math.abs(m.x)-.01)/.02,0,1));
        if(m.y>1.14&&m.y<1.33)c=mdSh(c,1-.12*Math.exp(-Math.pow(m.x/.009,2)));
        if(m.y<1.11&&m.y>.99)c=mdSh(c,1-.1*Math.exp(-Math.pow((m.y-1.05)/.03,2)))}
      if(m.part=='head'||m.part=='neck')[-1,1].forEach(s=>{c=mdMix(c,0x3a2a3a,.25*cgG(m.x,m.y,s*.05,1.57,.015,.013));
        c=mdMix(c,0x4a2840,.35*cgG(m.x,m.y,s*.04,1.614,.016,.006));if(m.nz>.2)c=mdMix(c,sock,cl(1.3*cgG(m.x,m.y,s*EX,EY,.02,.013),0,1))});
      if((m.part=='head'&&m.y<1.565)||m.part=='neck')c=mdSh(c,1.3);   /* the stoop tips the jaw and throat down, away from the light: painted paler */
      if(m.part=='hand')c=mdSh(c,.92);return c};
    // crisp regions: the lip line, breeches with a torn, uneven hem, a belt and an iron buckle, the rest flows (null → skinV)
    const col=m=>{if(m.part=='head'&&m.s>.3&&Math.abs(m.y-1.558)<.005&&Math.abs(m.x)<.026)return lip;
      if(m.part=='torso'&&m.y<1.03){if(m.y>.995&&m.s>-.99)return m.s>.8&&Math.abs(m.x)<.016?ir:0x2a1a16;return mdSh(br,m.s<-.3?.85:1)}
      if(m.part=='leg'&&m.y>.31+.035*Math.sin(Math.atan2(m.x-Math.sign(m.x)*.1,m.z)*3+Math.sign(m.x)))return mdSh(br,m.s<-.3?.85:1);return null};
    // the open coat (shoulders, back, upper arms), torn at the hem; dark seams, the back and the hem darker
    va_Sh(B,M,m=>(m.part=='torso'&&m.y>1.0&&!(m.s>.45&&Math.abs(m.x)<.05+(1.42-m.y)*.12)&&!(m.y<1.08&&a181H(Math.round(m.x*40),Math.round(m.z*40))<.5))||(m.part=='arm'&&m.y>1.16&&!(m.y<1.2&&a181H(Math.round(m.x*50),Math.round(m.z*50))<.45)),.014,
      m=>{let c=m.s<-.4?mdSh(co,.86):co;if(m.y<1.12)c=mdMix(c,co2,.55);if(m.s<-.5&&Math.abs(m.x)<.006)c=co2;if(m.part=='arm'&&m.y<1.22)c=mdMix(c,co2,.4);return c});
    // lank hair: a shell over the crown and the back of the skull
    va_Sh(B,M,m=>m.part=='head'&&m.y>1.58&&(m.s<.1||m.y>1.672-.022*Math.exp(-(m.x/.022)*(m.x/.022))+(Math.abs(m.x)>.05?-.004:0)),v=>.018*Math.min(1,Math.max(.35,(v[1]-1.56)/.12)),null,{vcol:m=>mdMix(0x120c0e,0x24181e,cl(n3Sn(m.x*.4,m.y*3,m.z*.4,30,1),0,1))});
    va_Body(B,M,col,skinV);
    // eyes burning in the sockets, pointed ears grown from the skull, fangs
    [-1,1].forEach(s=>{const p=cgRay(M,[s*EX,EY,.3],[0,0,-1]);if(p)k.p('head','sph','g',0xff2a30,p[0],p[1],p[2]+.001,.009,.006,.005,0,0,s*.25);
      const f=cgRay(M,[s*.013,1.554,.3],[0,0,-1]);if(f)k.p('head','cone4','c',0xe8e0d0,f[0],f[1]-.01,f[2]-.003,.005,.022,.005,Math.PI)});
    cgEars(k,M,T,sk,1.632,.06,.55,.8,.013,0x4a3440);
    // long clawed fingers on the left hand, the right one closed round the dagger; toes with small dark nails
    [-1,1].forEach(s=>{va_Hand(B,T,s,s>0?{col:sk,nail:0x1a1214,kind:'fist',len:.9}:{col:sk,nail:0x1a1214,kind:'claw',len:1.3,claw:.03});va_Toes(B,T,s,sk2,.01,0x1a1214)});
    // locks of hair down the nape
    for(let i=0;i<10;i++){const a=Math.PI*(.62+i*.085)*(i%2?1:-1),o=[Math.sin(a)*.3,1.64+a181H(i,3)*.05,Math.cos(a)*.3],p=cgRay(M,o,nrm3([-o[0],0,-o[2]]));if(!p)continue;
      const e=[p[0]*1.25,1.47-a181H(i,5)*.05,p[2]*1.2-.02];k.L('head','c',i%2?0x120c0e:0x1e1418,p,[(p[0]+e[0])/2,(p[1]+e[1])/2+.02,(p[2]+e[2])/2],.014,.01,4).L('neck','c',i%2?0x120c0e:0x1e1418,[(p[0]+e[0])/2,(p[1]+e[1])/2+.02,(p[2]+e[2])/2],e,.01,.002,4)}
    // an iron collar
    const nk=cgRay(M,[0,1.475,.3],[0,0,-1]);mdLoft(B,[{p:[0,1.462,.008],rx:.064,f:.064,b:.066,w:[['neck',1]]},{p:[0,1.49,.012],rx:.062,f:.062,b:.064,w:[['neck',1]]}],{seg:14,t:'m',col:ir});
    if(nk)k.p('neck','tor','m',mdSh(ir,.8),0,1.47,nk[2]+.012,.012,.006,.014,Math.PI/2,0,0)});
})();
// ---------------- fur: layered shells with ragged clump edges ----------------
// A fur layer is a shell over the faces sel(m) picks, pushed out along the normals by off (lumpy: smooth noise stretched
// downward, so clumps run with the fall of the fur), its top edge tucked onto the skin. Its lower edge breaks into solid
// pointed clumps: each clump closes the gap between the shell and the skin (outer face, inner face, two sides), hangs down by
// len (uneven), and leans out. One connected piece per layer, bent by the same bone weights as the skin under it.
// o: {off, len, col, col2 (groove colour), jag (0..1 length spread), w (clump width in rim edges), seed, t}
function cgFur(B,M,sel,o){const N=M.N||(M.N=cgNormals(M)),V=M.V,pick=M.F.map(f=>sel(cgInfo(M,f))),cnt=new Map(),ef=new Map(),seed=o.seed||0;
  M.F.forEach((f,fi)=>{if(!pick[fi])return;const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],b=f.v[(i+1)%n],k=a<b?a+'_'+b:b+'_'+a;cnt.set(k,(cnt.get(k)||0)+1);ef.set(k,[fi,a,b])}});
  const rim=new Set(),low=[];cnt.forEach((c,k)=>{if(c!=1)return;const [fi,a,b]=ef.get(k),m=cgInfo(M,M.F[fi]),my=(V[a][1]+V[b][1])/2;rim.add(a);rim.add(b);if(m.y>my+.002)low.push([a,b])});
  const lb=o.lump||[.35,1.3],lf=o.freq||24,lump=v=>{const n=n3Sn(v[0]*1.6,v[1]*.3,v[2]*1.6,lf,seed);return lb[0]+lb[1]*n*n},P=new Map(),pos=i=>{let p=P.get(i);if(p)return p;const v=V[i],n=N[i],d=o.off*lump(v)*(rim.has(i)?(low.some(e=>e[0]==i||e[1]==i)?1:.1):1);p=[v[0]+n[0]*d,v[1]+n[1]*d,v[2]+n[2]*d];P.set(i,p);return p};
  const groove=v=>n3Sn(v[0]*1.4,v[1]*.35,v[2]*1.4,22,seed)<.42,col=m=>{const c=a181Nz(o.col,m,.3,18,seed);return o.col2!=null&&groove([m.x,m.y,m.z])?o.col2:c};
  cgEmit(B,M,col,{t:o.t,pos,keep:(m,fi)=>pick[fi]});
  // clumps along the lower edge: the rim is walked as loops and cut into runs of 2–4 edges; each run hangs as one wide, solid
  // clump (outer and inner faces fanned to its tip, closed at its two ends), uneven in length
  const W=new Map(),wOf=i=>{let w=W.get(i);if(w)return w;const a=V[i],L=[];for(let j=3;j<a.length;j++)if(a[j]>1e-4)L.push([j-3,a[j]]);L.sort((p,q)=>q[1]-p[1]);const si=[0,0,0,0],sw=[0,0,0,0];let s=0;for(let j=0;j<4&&j<L.length;j++){si[j]=L[j][0];sw[j]=L[j][1];s+=L[j][1]}for(let j=0;j<4;j++)sw[j]/=s||1;w=[si,sw];W.set(i,w);return w};
  const vx=(p,i)=>({x:p[0],y:p[1],z:p[2],w:wOf(i)}),t=o.t||'c',nx=new Map();low.forEach(([a,b])=>{nx.set(a,b)});const used=new Set();let ci=0;
  low.forEach(([a0])=>{if(used.has(a0))return;const loop=[];let v=a0;while(v!=null&&!used.has(v)){used.add(v);loop.push(v);v=nx.get(v)}
    for(let i=0;i<loop.length-1;){const n=Math.min(loop.length-1-i,2+Math.floor(a181H(ci,seed,7)*3)),run=loop.slice(i,i+n+1);i+=n;ci++;
      const h=a181H(ci,seed,3),L=o.len*(1-(o.jag==null?.6:o.jag)*h),mid=lerp3(pos(run[0]),pos(run[run.length-1]),.5),nn=nrm3(run.reduce((q,j)=>add3(q,N[j]),[0,0,0]));
      const tip=[mid[0]+nn[0]*L*.35,mid[1]-L,mid[2]+nn[2]*L*.35],c=mdC(h<.25&&o.col2!=null?o.col2:mdSh(o.col,.8+a181H(ci,9,seed)*.28)),T=vx(tip,run[Math.floor(run.length/2)]);
      for(let j=0;j<run.length-1;j++){const p=run[j],q=run[j+1];mdTri(B,t,vx(pos(p),p),T,vx(pos(q),q),c);mdTri(B,t,vx(V[q],q),T,vx(V[p],p),c)}
      const f=run[0],l=run[run.length-1];mdTri(B,t,vx(V[f],f),T,vx(pos(f),f),c);mdTri(B,t,vx(pos(l),l),T,vx(V[l],l),c)}})}// a wandering edge height for a fur layer: y0 moved up and down by amp round the body (so no layer ends on a level line)
function cgEdge(m,y0,amp,seed){return y0+amp*(n3Sn(m.x*2.2,0,m.z*2.2,10,seed||0)-.5)*2.4}
// ---------------- every attached part is seated in the body ----------------
// Owner (Oct 30 2026): "nosferatu's ears are not attached … a common issue — fix permanently". A part placed with its base on
// the surface only touches it at one spot; on a curved head or limb the rest of its base stands off, a visible gap. After a cage
// foe's builder has placed its parts (ears, horns, spikes, eyes, teeth, fingers, locks of hair), cgSeat checks each part that is
// close to the body: its deepest vertex must sink into the skin by a depth that grows with the part's size (3–8 mm); if not,
// the part is pushed in along the skin's normal until it does. Parts hung on something else (a shell, another part: farther
// than 3.5 cm from the skin) are left alone; p.noSeat opts a part out. The test v179_enemy_parts checks the same ("seated").
function cgSeat(k,M,n0){const N=M.N||(M.N=cgNormals(M)),V=M.V,cs=.03,G=new Map(),key=(a,b,c)=>a+','+b+','+c;
  V.forEach((v,i)=>{const kk=key(Math.floor(v[0]/cs),Math.floor(v[1]/cs),Math.floor(v[2]/cs));let L=G.get(kk);if(!L)G.set(kk,L=[]);L.push(i)});
  const near=p=>{let b=-1,bd=1e9;const x=Math.floor(p[0]/cs),y=Math.floor(p[1]/cs),z=Math.floor(p[2]/cs);for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++)for(let e=-1;e<=1;e++){const L=G.get(key(x+a,y+c,z+e));
    if(L)L.forEach(i=>{const v=V[i],d=(v[0]-p[0])*(v[0]-p[0])+(v[1]-p[1])*(v[1]-p[1])+(v[2]-p[2])*(v[2]-p[2]);if(d<bd){bd=d;b=i}})}return b<0?null:[b,Math.sqrt(bd)]};
  const v=new THREE.Vector3();let moved=0;const I=[],PT=[],BB=[];
  for(let pi=n0||0;pi<k.P.length;pi++){const p=k.P[pi];if(p.noSeat)continue;const pa=p.geo.attributes.position,pts=[];for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);pts.push([v.x,v.y,v.z])}
    const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];pts.forEach(q=>{for(let j=0;j<3;j++){mn[j]=Math.min(mn[j],q[j]);mx[j]=Math.max(mx[j],q[j])}});I.push(pi);PT.push(pts);BB.push([mn,mx])}
  // parts that touch each other (a finger's segments, a strap and its buckle) are seated together, as one group
  const par=I.map((_,i)=>i),f=i=>{while(par[i]!=i)i=par[i]=par[par[i]];return i},e=.004;
  for(let i=0;i<I.length;i++)for(let j=i+1;j<I.length;j++){const a=BB[i],b=BB[j];if(a[0][0]>b[1][0]+e||b[0][0]>a[1][0]+e||a[0][1]>b[1][1]+e||b[0][1]>a[1][1]+e||a[0][2]>b[1][2]+e||b[0][2]>a[1][2]+e)continue;
    let hit=false;for(const q of PT[i]){for(const r of PT[j]){if((q[0]-r[0])**2+(q[1]-r[1])**2+(q[2]-r[2])**2<e*e*4){hit=true;break}}if(hit)break}if(hit)par[f(i)]=f(j)}
  const G2=new Map();I.forEach((_,i)=>{const r=f(i);if(!G2.has(r))G2.set(r,[]);G2.get(r).push(i)});
  G2.forEach(L=>{const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];let best=-1e9,bn=null,dmin=1e9;
    L.forEach(i=>{for(let j=0;j<3;j++){mn[j]=Math.min(mn[j],BB[i][0][j]);mx[j]=Math.max(mx[j],BB[i][1][j])}PT[i].forEach(q=>{const r=near(q);if(!r)return;const s=V[r[0]],n=N[r[0]],dep=(s[0]-q[0])*n[0]+(s[1]-q[1])*n[1]+(s[2]-q[2])*n[2];dmin=Math.min(dmin,r[1]);if(dep>best){best=dep;bn=n}})});
    const size=Math.hypot(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2]);if(!bn||dmin>.035||size>.45)return;const want=Math.max(.004,Math.min(.01,size*.15));if(best>=want)return;const t=want-best,T=new THREE.Matrix4().makeTranslation(-bn[0]*t,-bn[1]*t,-bn[2]*t);
    L.forEach(i=>k.P[I[i]].m.premultiply(T));moved++});
  CG181.seated=(CG181.seated||0)+moved;return moved}
