// ================= v186: companion bodies remodelled with the detail recipe (owner, Nov 1 2026) =================
// Owner: "We recently improved your modeling technique and I want to update our companions with your new methods."
// The companions were lofts of 6-8 sided rings with a random brightness per vertex (lpGeo, 0610): boxy bodies, stick legs and
// speckled colour. docs/MODEL_DETAIL_RECIPE.md: detail from colour, shading and good bends, not triangles. For the 12 companion
// skeletons (every species and colour variant, never an enemy: their keys start with E137) the loft is now built by lp186Geo:
//  * smoother outline and bends: each ring band gets a ring in between (Catmull-Rom along the loft, never thinner than the
//    straight line, its weights the mix of both neighbours: up to 4 bones), and 6-10 sided lofts get twice the sides
//    (the faceted look stays: flat shading, ~4x the faces of a 300-700 triangle body);
//  * seated limbs (recipe 4b): a leg loft that grows from the chest / pelvis starts with a shoulder or haunch mass sunk into
//    the body, so the leg no longer leaves the flank as a stick;
//  * baked shading instead of random speckle (recipe 2.1/2.2): top light, darker toward the feet and underneath, cool in
//    the shadows, crease / ridge from the welded surface (cavity), no per-vertex noise.
// Paint functions still get the ORIGINAL ring index (their stripes and spots stay where they were designed).
var LP186={on:true,cav:0,lo:false,rigs:null,split:2,sides:2,seat:1,stat:{},
  // palette grade (recipe 2.1: "saturated bodies look like toys"): the body and its painted kit keep their hue but are held
  // under a saturation / lightness ceiling [s, l]; per species where the old colours read as candy
  // optional [s, l, tint, amount]: first a pull toward an earthy tint (the candy hue itself)
  // (the colours are linear and go through ACES, so a linear saturation of .4 still reads strongly on screen)
  grade:{def:[.38,.5],Foxlet:[.5,.45],Emberlynx:[.42,.4,0x6a3a1e,.25],Gloomcap:[.22,.34,0x4a3430,.35],Sporelord:[.24,.34,0x34402e,.3],Mossfrog:[.32,.36],Bogmaw:[.32,.36],Drakelet:[.2,.34,0x3a3040,.3],
    Pyrewing:[.4,.38],Venomcoil:[.24,.3,0x3a3a24,.3],Gravewyrm:[.3,.4],Hivemother:[.5,.4],Lumenwisp:[.25,.6],Skyhawk:[.25,.42],Stormtalon:[.28,.4],
    Rocsovereign:[.36,.44],Batwing:[.25,.36],Duskwing:[.26,.36]}};
var LP186H={},LP186T={};
function lp186Sp(n){try{return (typeof RV137!='undefined'&&RV137.cur&&RV137.cur[n])||n}catch(e){return n}}
function lp186GradeC(c,g){if(g[2]!=null)c.lerp(LP186T[g[2]]||(LP186T[g[2]]=new THREE.Color(g[2])),g[3]||.3);c.getHSL(LP186H);let s=LP186H.s,l=LP186H.l;if(s>g[0])s=g[0]+(s-g[0])*.12;if(l>g[1])l=g[1]+(l-g[1])*.22;if(s!==LP186H.s||l!==LP186H.l)c.setHSL(LP186H.h,s,l);return c}
function lp186Grade(n){const sp=lp186Sp(n);return LP186.grade[sp]||LP186.grade[n]||LP186.grade.def}
function lp186Comp(key,n){if(!LP186.on||!key||/^E137/.test(key))return false;
  if(!LP186.rigs){try{LP186.rigs=new Set(SPK.map(s=>rigOf(s)))}catch(e){return false}}return LP186.rigs.has(n)}
// ring weights → {bone: w}
function lp186W(r){const b=r.b,o={};if(r.w4)return Object.assign({},r.w4);o[b[0]]=(o[b[0]]||0)+1-(b[2]||0);if(b[2])o[b[1]]=(o[b[1]]||0)+b[2];return o}
function lp186Mix(a,b,t){const o={};for(const k in a)o[k]=(o[k]||0)+a[k]*(1-t);for(const k in b)o[k]=(o[k]||0)+b[k]*t;return o}
function lp186CR(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t;return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3)}
// the leg's first ring is skinned to the body (chest / pelvis / spine) and the second to a limb bone ending in 0
function lp186IsLeg(L){const r=L.rings;if(!r||r.length<3||!r[0].b)return false;const b0=r[0].b[0],b1=r[0].b[1]||'';return /^(chest|pelvis|spine|hips|body|torso)$/.test(b0)&&/0$/.test(b1)}
function lp186Refine(L){
  const R=L.rings,N=R.length;R.forEach((r,i)=>{if(r._oi==null)r._oi=i});
  let out=R;
  // seat a leg: one ring above the first, sunk up into the body (hidden inside it), so the leg grows out of the body mass
  // instead of starting at a cut-off disc; the old first ring swells a little (the muscle where the limb joins)
  if(LP186.seat&&lp186IsLeg(L)){const a=R[0],b=R[1],d=[a.p[0]-b.p[0],a.p[1]-b.p[1],a.p[2]-b.p[2]],l=Math.hypot(...d)||1,u=d.map(x=>x/l),k=Math.min(.45*l,(a.rx||.05)*.8);
    const seat=Object.assign({},a,{p:[a.p[0]+u[0]*k-Math.sign(a.p[0]||0)*a.rx*.3,a.p[1]+u[1]*k,a.p[2]+u[2]*k],rx:a.rx*.92,ryT:(a.ryT==null?a.rx:a.ryT)*1.02,ryB:(a.ryB==null?a.rx:a.ryB)*1.02,
      w4:(()=>{const w=lp186W(a),o={};for(const k2 in w)o[k2]=w[k2];const body=a.b[0];o[body]=(o[body]||0)+.6;const s=Object.values(o).reduce((x,y)=>x+y,0);for(const k2 in o)o[k2]/=s;return o})(),_oi:0,_seat:1});
    const inx=0;
    out=[seat,Object.assign({},a,{p:[a.p[0]+inx,a.p[1],a.p[2]],rx:a.rx*1.04,ryT:(a.ryT==null?a.rx:a.ryT)*1.06,ryB:(a.ryB==null?a.rx:a.ryB)*1.06})].concat(R.slice(1))}
  // a leg ends in a sole ring a little lower and narrower than its last ring: the paw / hoof kit pieces were set against
  // the old flat end cap, and the smoother, re-oriented end ring lifted it a few mm off them
  if(lp186IsLeg(L)&&out.length>=3){const z=out[out.length-1];out=out.concat([Object.assign({},z,{p:[z.p[0],z.p[1]-.008,z.p[2]],rx:z.rx*.9,ryT:(z.ryT==null?z.rx:z.ryT)*.9,ryB:(z.ryB==null?z.rx:z.ryB)*.9,_sole:1})])}
  if(!LP186.split||out.length<2)return Object.assign({},L,{rings:out});
  const M=out.length,res=[],NS=Math.max(1,LP186.split|0);
  for(let i=0;i<M;i++){res.push(out[i]);if(i==M-1)break;const a=out[i],b=out[i+1],p=out[Math.max(0,i-1)],q=out[Math.min(M-1,i+2)];
    // a tiny cap ring (nose tip, tail tip) keeps a straight taper
    const tip=(i==M-2&&b.rx<a.rx*.35)||(i==0&&a.rx<b.rx*.35);if(b._sole)continue;
    for(let s2=1;s2<=NS;s2++){const t=s2/(NS+1);
      const P=[0,1,2].map(j=>lp186CR(p.p[j],a.p[j],b.p[j],q.p[j],t)),rad=f=>{const va=a[f]==null?a.rx:a[f],vb=b[f]==null?b.rx:b[f],vp=p[f]==null?p.rx:p[f],vq=q[f]==null?q.rx:q[f],li=va+(vb-va)*t;
        return Math.max(li,Math.min(Math.max(va,vb)*1.06,lp186CR(vp,va,vb,vq,t)))},lin=f=>{const va=a[f]==null?a.rx:a[f],vb=b[f]==null?b.rx:b[f];return va+(vb-va)*t};
      const m=Object.assign({},t<.5?a:b,{p:tip?a.p.map((x,j)=>x+(b.p[j]-x)*t):P,rx:tip?lin('rx'):rad('rx'),ryT:tip?lin('ryT'):rad('ryT'),ryB:tip?lin('ryB'):rad('ryB'),
        w4:lp186Mix(lp186W(a),lp186W(b),t),_oi:(t<.5?a:b)._oi,_mid:1,j:0,_seat:0,_ra:a,_rb:b,_t:t});
      if(a.sqB||b.sqB)m.sqB=a.sqB&&b.sqB?a.sqB+(b.sqB-a.sqB)*t:0;res.push(m)}}
  return Object.assign({},L,{rings:res})}
// welded cavity per vertex: <1 in creases, >1 on ridges (recipe 2.2); positions welded across lofts at 1 mm
function lp186Cavity(P,IX){const n=P.length/3,key=new Map(),id=new Int32Array(n);let u=0;
  for(let i=0;i<n;i++){const k=Math.round(P[i*3]*1000)+','+Math.round(P[i*3+1]*1000)+','+Math.round(P[i*3+2]*1000);let v=key.get(k);if(v==null){v=u++;key.set(k,v)}id[i]=v}
  const U=new Float32Array(u*3),cnt=new Float32Array(u),Nn=new Float32Array(u*3),nb=Array.from({length:u},()=>new Set());
  for(let i=0;i<n;i++){const v=id[i];U[v*3]+=P[i*3];U[v*3+1]+=P[i*3+1];U[v*3+2]+=P[i*3+2];cnt[v]++}
  for(let v=0;v<u;v++){U[v*3]/=cnt[v];U[v*3+1]/=cnt[v];U[v*3+2]/=cnt[v]}
  for(let t=0;t<IX.length;t+=3){const a=id[IX[t]],b=id[IX[t+1]],c=id[IX[t+2]];if(a==b||b==c||a==c)continue;
    const ax=U[a*3],ay=U[a*3+1],az=U[a*3+2],e1=[U[b*3]-ax,U[b*3+1]-ay,U[b*3+2]-az],e2=[U[c*3]-ax,U[c*3+1]-ay,U[c*3+2]-az],
      nx=e1[1]*e2[2]-e1[2]*e2[1],ny=e1[2]*e2[0]-e1[0]*e2[2],nz=e1[0]*e2[1]-e1[1]*e2[0];
    [a,b,c].forEach(v=>{Nn[v*3]+=nx;Nn[v*3+1]+=ny;Nn[v*3+2]+=nz});nb[a].add(b);nb[a].add(c);nb[b].add(a);nb[b].add(c);nb[c].add(a);nb[c].add(b)}
  let T=new Float32Array(u);
  for(let v=0;v<u;v++){const ln=Math.hypot(Nn[v*3],Nn[v*3+1],Nn[v*3+2])||1;let dx=0,dy=0,dz=0;nb[v].forEach(j=>{const x=U[j*3]-U[v*3],y=U[j*3+1]-U[v*3+1],z=U[j*3+2]-U[v*3+2],l=Math.hypot(x,y,z)||1;dx+=x/l;dy+=y/l;dz+=z/l});
    const l=Math.hypot(dx,dy,dz);if(l<1e-6){T[v]=.5;continue}const c=(Nn[v*3]*dx+Nn[v*3+1]*dy+Nn[v*3+2]*dz)/(ln*l);T[v]=Math.acos(Math.max(-1,Math.min(1,c)))/Math.PI}
  for(let k=0;k<4;k++){const T2=new Float32Array(u);for(let v=0;v<u;v++){let s=T[v];nb[v].forEach(j=>s+=T[j]);T2[v]=s/(nb[v].size+1)}T=T2}
  const out=new Float32Array(n);for(let i=0;i<n;i++){const x=T[id[i]];out[i]=x<.5?1-Math.min(.16,(.5-x)*.7):1+Math.min(.05,(x-.5)*.3)}
  return out}
function lp186Geo(key,n,lofts,seed){
  const O=Object.keys(SPEC[n].bones),P=[],Cc=[],SI=[],SW=[],IX=[],R=dkRng(seed||77),V=THREE.Vector3,tmp=new THREE.Color();
  const bi=b=>{const i=O.indexOf(b);if(i<0)throw new Error('lp: no bone '+b+' in '+n);return i};
  const skin=r=>{const w=lp186W(r),e=Object.keys(w).map(k=>[bi(k),w[k]]).filter(q=>q[1]>.015).sort((a,b)=>b[1]-a[1]).slice(0,4),s=e.reduce((x,q)=>x+q[1],0)||1;
    while(e.length<4)e.push([0,0]);SI.push(e[0][0],e[1][0],e[2][0],e[3][0]);SW.push(e[0][1]/s,e[1][1]/s,e[2][1]/s,e[3][1]/s)};
  lofts.map(L=>lp186Refine(L)).forEach(L=>{
    const rings=L.rings,seg0=L.seg||8,seg=(LP186.sides>1&&seg0>=6&&seg0<=10)?seg0*LP186.sides:seg0,ref=new V(...(L.ref||[0,1,0])),base=P.length/3,pts=rings.map(r=>new V(r.p[0],r.p[1],r.p[2]));
    const ka=k=>{const a=Math.PI/2+(L.rot||0)+k/seg*Math.PI*2;return [Math.sin(a),Math.cos(a)]},tA=new THREE.Color(),tB=new THREE.Color(),tA2=new THREE.Color(),tB2=new THREE.Color();
    const colAt=(r,sc,out)=>{if(r._ra){L.paint(tA,r._ra,sc[0],sc[1],r._ra._oi);L.paint(tB,r._rb,sc[0],sc[1],r._rb._oi);return out.copy(tA).lerp(tB,r._t)}L.paint(out,r,sc[0],sc[1],r._oi);return out};
    rings.forEach((r,i)=>{
      const tg=pts[Math.min(i+1,pts.length-1)].clone().sub(pts[Math.max(i-1,0)]).normalize(),U=ref.clone().sub(tg.clone().multiplyScalar(ref.dot(tg))).normalize(),Sd=new V().crossVectors(U,tg);
      for(let k=0;k<seg;k++){
        const a=Math.PI/2+(L.rot||0)+k/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a),ry=s>0?(r.ryT==null?r.rx:r.ryT):(r.ryB==null?r.rx:r.ryB),j=r.j?1+(R()-.5)*r.j*.6:1;
        const q2=s<0&&r.sqB?2/r.sqB:0,cq=q2?Math.sign(c)*Math.abs(c)**q2:c,sq=q2?-(Math.abs(s)**q2):s;
        P.push(pts[i].x+(Sd.x*cq*r.rx+U.x*sq*ry)*j,pts[i].y+(Sd.y*cq*r.rx+U.y*sq*ry)*j,pts[i].z+(Sd.z*cq*r.rx+U.z*sq*ry)*j);
        // the colour is the ORIGINAL design's colour at this spot: painted at the original rings and the original sides and
        // blended between them (a paint that hashes the ring index would otherwise smear into stripes along the new rings)
        if(seg!==seg0&&k%2){colAt(r,ka(k-1),tA2);colAt(r,ka(k+1),tB2);tmp.copy(tA2).lerp(tB2,.5)}else colAt(r,ka(k),tmp);
        Cc.push(tmp.r,tmp.g,tmp.b);skin(r)}});
    for(let i=0;i<rings.length-1;i++)for(let k=0;k<seg;k++){const a=base+i*seg+k,a1=base+i*seg+(k+1)%seg,b2=a+seg,b3=a1+seg;IX.push(a,a1,b2,b2,a1,b3)}
    [[L.capA,0],[L.capB,rings.length-1]].forEach(q=>{if(!q[0])return;const r=rings[q[1]],ci=P.length/3;P.push(pts[q[1]].x,pts[q[1]].y,pts[q[1]].z);
      const o=base+q[1]*seg;L.paint(tmp,r,q[1]?1:-1,0,r._oi);Cc.push(tmp.r,tmp.g,tmp.b);skin(r);
      for(let k=0;k<seg;k++){const a=o+k,a1=o+(k+1)%seg;if(q[1])IX.push(ci,a,a1);else IX.push(ci,a1,a)}});
  });
  const G=new THREE.BufferGeometry();
  G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4));
  G.setIndex(IX);G.computeVertexNormals();
  // baked shading: value = top light x height x cavity, a cool shift into the shadows (all kept inside .5..1.1)
  const N=G.attributes.normal.array,nv=P.length/3;let y0=1e9,y1=-1e9;for(let i=0;i<nv;i++){y0=Math.min(y0,P[i*3+1]);y1=Math.max(y1,P[i*3+1])}
  const GR=lp186Grade(n);for(let i=0;i<nv;i++){tmp.setRGB(Cc[i*3],Cc[i*3+1],Cc[i*3+2]);lp186GradeC(tmp,GR);Cc[i*3]=tmp.r;Cc[i*3+1]=tmp.g;Cc[i*3+2]=tmp.b}
  const H=Math.max(.05,y1-y0),cav=LP186.cav?lp186Cavity(P,IX):new Float32Array(nv).fill(1),cool=new THREE.Color(0x3a4258),warm=new THREE.Color(0xffe2c0);
  for(let i=0;i<nv;i++){const ny=N[i*3+1],h=Math.max(0,Math.min(1,(P[i*3+1]-y0)/H)),hs=h*h*(3-2*h);
    let f=(.84+.2*(.5*ny+.5))*(.74+.26*Math.min(1,hs*1.6))*cav[i];f=Math.max(.5,Math.min(1.12,f));
    tmp.setRGB(Cc[i*3],Cc[i*3+1],Cc[i*3+2]).multiplyScalar(f);
    const sh=Math.max(0,-ny)*.22+(1-Math.min(1,hs*1.8))*.08;if(sh>0)tmp.lerp(cool.clone().multiplyScalar(tmp.r*.3+tmp.g*.59+tmp.b*.11+.05),Math.min(.25,sh));
    if(ny>.55)tmp.lerp(warm.clone().multiplyScalar(tmp.r*.3+tmp.g*.59+tmp.b*.11),(ny-.55)*.1);
    Cc[i*3]=tmp.r;Cc[i*3+1]=tmp.g;Cc[i*3+2]=tmp.b}
  G.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));G.computeBoundingSphere();
  LP186.stat[key]=IX.length/3;return G}
// wild creatures of a companion species (enemies: c.en) roam in dozens per zone: they get a lighter body (one ring in
// between, the original sides) under their own cache key, flat-shaded like the other enemies (recipe §1 budgets)
{const f=lpGeo;lpGeo=function(key,n,lofts,seed){if(!lp186Comp(key,n))return f.apply(this,arguments);
  if(LP186.lo){key=key+'|lo';if(LPG[key])return LPG[key];const s0=LP186.split,d0=LP186.sides;LP186.split=1;LP186.sides=1;try{return LPG[key]=lp186Geo(key,n,lofts,seed)}catch(e){console.error('lp186',key,e);return f.apply(this,arguments)}finally{LP186.split=s0;LP186.sides=d0}}
  if(LPG[key])return LPG[key];
  try{return LPG[key]=lp186Geo(key,n,lofts,seed)}catch(e){console.error('lp186',key,e);return f.apply(this,arguments)}}}
// the painted kit (eyes, warts, teeth, horns, ears: the 'c' layer of LP| bakes) gets the same grade; glow and metal keep theirs.
// Tapered parts (fur tufts, manes, horns, spines, claws) are shaded along their length: darker at the root where they leave
// the body, lighter toward the tip (recipe 4b: smooth per-corner colour on fur instead of one flat colour per clump).
// feathers and fur: neighbouring blades / tufts of similar colour blend 40% toward their local mean (the alternating
// light / dark feathers read as a checkerboard of blocks; v184's "lumpy feathers"), parts of clearly different colour
// (teeth against lips, a cream bib against the back) keep theirs
function lp186IsFeather(g){try{return typeof BD184!='undefined'&&BD184.G&&Object.values(BD184.G).indexOf(g)>=0}catch(e){return false}}
function lp186IsTuft(g){const pr=g&&g.parameters;return !!(pr&&pr.radiusBottom!=null&&pr.height>0&&pr.radiusBottom>pr.radiusTop*2.5&&pr.height>pr.radiusBottom*2)}
function lp186Smooth(P){const Q=P.filter(p=>p.t==='c'&&p.col!=null&&(lp186IsFeather(p.geo)||lp186IsTuft(p.geo)));if(Q.length<4)return P;
  const C=Q.map(p=>new THREE.Color(p.col)),X=Q.map(p=>[p.m.elements[12],p.m.elements[13],p.m.elements[14]]),out=new Map(),R2=.085*.085;
  Q.forEach((p,i)=>{let r=0,g=0,b=0,w=0;for(let j=0;j<Q.length;j++){const dx=X[i][0]-X[j][0],dy=X[i][1]-X[j][1],dz=X[i][2]-X[j][2];if(dx*dx+dy*dy+dz*dz>R2)continue;
      const dc=Math.abs(C[i].r-C[j].r)+Math.abs(C[i].g-C[j].g)+Math.abs(C[i].b-C[j].b);if(dc>.55)continue;r+=C[j].r;g+=C[j].g;b+=C[j].b;w++}
    if(w>1){const c=C[i].clone().lerp(new THREE.Color(r/w,g/w,b/w),.6);out.set(p,c.getHex())}});
  return P.map(p=>out.has(p)?Object.assign({},p,{col:out.get(p)}):p)}
function lp186TaperShade(meshes,P){try{const M=dkM(),m=meshes.find(q=>q.material===M.c);if(!m)return;const G=m.geometry;if(G.userData.lp186)return;G.userData.lp186=1;
    const C=G.attributes.color;let off=0;P.filter(p=>p.t==='c').forEach(p=>{const g=p.geo,pa=g.attributes.position,n=pa.count,pr=g.parameters;
      if(pr&&pr.radiusBottom!=null&&pr.height>0&&pr.radiusBottom>pr.radiusTop*1.6&&pr.height>pr.radiusBottom*1.4){const h=pr.height;
        for(let i=0;i<n;i++){const t=Math.max(0,Math.min(1,pa.getY(i)/h+.5)),k=.66+.46*Math.pow(t,.8);C.setXYZ(off+i,C.getX(off+i)*k,C.getY(off+i)*k,C.getZ(off+i)*k)}}
      else if(lp186IsFeather(g)){for(let i=0;i<n;i++){const t=Math.max(0,Math.min(1,pa.getY(i))),k=.74+.32*t;C.setXYZ(off+i,C.getX(off+i)*k,C.getY(off+i)*k,C.getZ(off+i)*k)}}
      off+=n});C.needsUpdate=true}catch(e){}}
{const f=dkBake;dkBake=function(P,O,key){if(key&&/^LP\|/.test(key)&&LP186.on){const n=key.split('|')[1];if(lp186Comp('LP|',n)){const fresh=!(DKBK&&DKBK[key]);
    if(fresh){const GR=lp186Grade(n),c=new THREE.Color();P=P.map(p=>{if(p.t!=='c'||p.col==null)return p;c.set(p.col);c.getHSL(LP186H);if(LP186H.s>.75&&LP186H.l>.42)return p;lp186GradeC(c,GR);return Object.assign({},p,{col:c.getHex()})});P=lp186Smooth(P)}
    const r=f.call(this,P,O,key);if(fresh)lp186TaperShade(r,P);return r}}return f.call(this,P,O,key)}}
// ---------------- evolution looks: fewer, more cohesive pieces (owner: "reduce visual clutter from traits and evolution
// accessories - make them more cohesive") ----------------
// Applied to every species' evolution design through its kit E (the designs in 1720-1770, 2600, 3110-3140, 3390, 3397):
//  * no hanging charms (teeth, bones and gems on strings dangled from collars and harnesses on most species);
//  * runes only from look level 3, at most two per creature, laid in the darker glow (they read as glowing noise);
//  * no thin rings round the legs (cuffs and rune bands on wrists and ankles); collars and harness straps stay;
//  * one set gem at most; every part takes its exact palette colour (no random brightness per piece); glowing strokes
//    and flames are capped at 16, the rest drawn in the dark body colour;
//  * spike rows (EVO100_M.ridge) 20% shorter; no gold crown spikes.
var EVO186={on:true};
{const f=evo100Kit;evo100Kit=function(n,L,P,seed){const E=f.apply(this,arguments);if(!EVO186.on)return E;
  const run={rune:0,gem:0,glow:0},rune=E.rune,gem=E.gem,band=E.band,push0=E.p,pd0=E.pd,L0=E.L;
  const onLeg=h=>{try{const k=evo100Skin(E.S,h.p);const b=E.S.O[k[4]>=k[5]?k[0]:k[1]]||'';return /^(fl|fr|hl|hr)\d/.test(b)}catch(e){return false}};
  E.rune=function(h,fwd,sz,col,o){if(L<3||run.rune>=2||!h||onLeg(h))return E;run.rune++;return rune.call(E,h,fwd,sz*.9,col==null||col===P.glow?P.glowD:col,o)};
  E.gem=function(h,sz,col,o){if(run.gem>=1)return E;run.gem++;return gem.apply(E,arguments)};
  E.band=function(c,axis,off,r,t,col,N,o){if(r<=.009&&c&&c[1]<.3&&Math.abs(axis[1])>.6)return [];return band.apply(E,arguments)};
  // glow is the accent (recipe: under ~5% of the surface): after 14 glowing pieces the rest are drawn in the dark body colour
  const dimG=new THREE.Color(P.glowD).lerp(new THREE.Color(P.mainD),.6).getHex();
  // (only strokes and flames, E.L, count: set marks such as an eclipse ring or a gem keep their glow)
  const fix=(k,cap)=>function(){const n0=E.parts.length,r=k.apply(E,arguments);for(let i=n0;i<E.parts.length;i++){const q=E.parts[i];if(q.j!=null)q.j=0;
      if(cap&&q.t==='g'&&!q.raw&&!q.tri&&!q.loft){if(++run.glow>16){q.t='c';q.col=dimG}}}return r};
  E.p=fix(push0);E.L=fix(L0,1);
  // gold crown spikes (rows of small gold cones on brows and helms) are gone
  {const pdf=fix(pd0);E.pd=function(geo,t,col){if(geo=='cone4'&&t=='m'&&col===P.gold)return E;return pdf.apply(E,arguments)}}
  // near-black armour shells read as holes in the body: they take the dark body colour instead
  const sh0=E.shell,dk2=new THREE.Color(P.dark).lerp(new THREE.Color(P.mainD),.65).getHex();
  // a shell coloured triangle by triangle in turn (i%2, i%3: a checkerboard) takes the average of its colours instead
  E.shell=function(sel,off,t,col,o){if(col===P.dark)col=dk2;else if(typeof col=='function'){const f0=col,smp=[];for(let i=0;i<6;i++)smp.push(f0(.05,.4,.05,i));
      if(smp.some(v=>v!==smp[0])&&f0(.05,.4,.05,0)===f0(-.1,.3,-.2,0)){const m=new THREE.Color(0);smp.forEach(v=>m.add(new THREE.Color(v===P.dark?dk2:v)));col=m.multiplyScalar(1/6).getHex()}
      else col=function(){const v=f0.apply(this,arguments);return v===P.dark?dk2:v}}
    return sh0.call(E,sel,off,t,col,o)};
  return E}}
{const ch=EVO100_M.charm;EVO100_M.charm=function(E){return EVO186.on?E:ch.apply(this,arguments)}}
{const rg=EVO100_M.ridge;EVO100_M.ridge=function(E,zs,t,col,lean,x,tipCol,o){if(EVO186.on)zs=zs.map(q=>[q[0],q[1]*.8,q[2]*.9]);return rg.call(this,E,zs,t,col,lean,x,tipCol,o)}}
// one palette for the gear: iron and leather lean toward the creature's own dark colour, gold trim only on the last looks
{const f=evo100Pal;evo100Pal=function(c,n,L){const P=f.apply(this,arguments);if(!EVO186.on)return P;const mix=(a,b,t)=>new THREE.Color(a).lerp(new THREE.Color(b),t).getHex();
  P.metal=mix(P.metal,P.mainD,.3);P.iron=mix(P.iron,P.mainD,.35);P.leather=mix(P.leather,P.mainD,.35);if(L<4)P.trim=mix(P.trim,P.metal,.45);P.bone=mix(P.bone,0x8a8070,.25);return P}}
// the bird wings and tail fans are built from bw184Cols outside the kit bake: the same grade
{const f=bw184Cols;bw184Cols=function(sp,C){const K=f.apply(this,arguments);if(!LP186.on)return K;const g=LP186.grade[sp]||LP186.grade.def,o={};
  for(const k in K){const v=K[k];o[k]=v&&v.isColor?lp186GradeC(v.clone(),g):v}return o}}
// membrane wings (Drakelet, Pyrewing, Elderdrake, Batwing, Duskwing) take the grade of the creature being built
{const f=lpRig;lpRig=function(c,n,D){const o=LP186.cur,lo=LP186.lo;LP186.cur=n;LP186.lo=!!(c&&c.en);try{return f.apply(this,arguments)}finally{LP186.cur=o;LP186.lo=lo}}}
{const f=lpwWing;lpwWing=function(key,outline,hub,sticks,cA,cB,cS,bands){if(!LP186.on||!LP186.cur||!lp186Comp('LP|',LP186.cur))return f.apply(this,arguments);
  const g=lp186Grade(LP186.cur),gr=c=>c==null?c:lp186GradeC(new THREE.Color(c),g).getHex();
  return f.call(this,key+'|g186',outline,hub,sticks,gr(cA),gr(cB),gr(cS),bands)}}
// Body and wing materials of companions (copies, the shared lpMat stays for enemies):
//  * the body is smooth-shaded: with ~4x the faces, flat shading turned every long loft band into a light / dark stripe
//    (reviewer: "melon stripes"); the outline stays faceted and the kit parts keep their flat facets;
//  * a membrane wing lets a little light through (a thin skin seen from below read as a black slab)
var LP186M=new Map();
function lp186Mat(m,kind){const k=m.uuid+'|'+kind;let q=LP186M.get(k);if(q)return q;q=m.clone();
  if(kind=='body'){q.flatShading=false}
  else{const ob=q.onBeforeCompile;q.onBeforeCompile=function(sh,r){if(ob)ob.call(this,sh,r);sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*.32;')};
    q.customProgramCacheKey=()=>'lp186wing'}
  q.needsUpdate=true;LP186M.set(k,q);return q}
{const f=lpRig;lpRig=function(c,n,D){const g=f.apply(this,arguments);if(!g||!LP186.on||!lp186Comp('LP|',n)||(c&&c.en))return g;
  try{const W=(typeof LPWG!='undefined'?Object.values(LPWG):[]).concat(typeof EVO100!='undefined'&&EVO100.wing?Object.values(EVO100.wing):[]);g.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material))return;
      if(o.isSkinnedMesh&&o.parent===g.b&&o.material.vertexColors&&o.material.flatShading&&!o.userData.evo100&&o.geometry&&o.geometry.index&&LP186.stat[Object.keys(LPG).find(k=>LPG[k]===o.geometry)]!=null){o.material=lp186Mat(o.material,'body')}
      else if(!o.isSkinnedMesh&&W.indexOf(o.geometry)>=0)o.material=lp186Mat(o.material,'wing')})}catch(e){console.error('lp186 mat',e)}
  return g}}
// the evolution rays always use the full body (one surface per rig, shared by companions and wild elites)
{const f=evo100Surf;evo100Surf=function(){const o=LP186.lo;LP186.lo=false;try{return f.apply(this,arguments)}finally{LP186.lo=o}}}
