// ================= v83: low-poly arenas — Sovereign arenas, wave-trial grounds, secret boulders, fishing bobber =================
// Built from flat-shaded, vertex-painted facets (same look as the low-poly companions).
// Purely visual: arena size, collisions, seal wall behaviour and every interaction stay as they were.
var ARK={rng:s=>()=>(s=s*16807%2147483647)/2147483647,mt:{}};
// a growing non-indexed triangle soup; every face gets one mottled colour, so it reads as hand-painted facets
function arkSoup(seed){
  const P=[],C=[],R=ARK.rng(seed||7),c=new THREE.Color(),V3=THREE.Vector3,va=new V3(),vb=new V3(),vc=new V3();
  const S={R,
    tri(a,b,d,col,j){c.set(col);const k=1+((R()-.5)*(j==null?.16:j));P.push(a[0],a[1],a[2],b[0],b[1],b[2],d[0],d[1],d[2]);for(let i=0;i<3;i++)C.push(c.r*k,c.g*k,c.b*k)},
    quad(a,b,d,e,col,j){c.set(col);const k=1+((R()-.5)*(j==null?.16:j)),cc=[c.r*k,c.g*k,c.b*k];
      [a,b,d,a,d,e].forEach(p=>{P.push(p[0],p[1],p[2]);C.push(cc[0],cc[1],cc[2])})},
    // any three.js geometry, placed by a matrix; col(centroidY, normal) -> hex
    geo(g,m,col,j){const q=g.index?g.toNonIndexed():g,p=q.attributes.position;
      for(let i=0;i<p.count;i+=3){va.fromBufferAttribute(p,i).applyMatrix4(m);vb.fromBufferAttribute(p,i+1).applyMatrix4(m);vc.fromBufferAttribute(p,i+2).applyMatrix4(m);
        const n=new V3().subVectors(vc,vb).cross(new V3().subVectors(va,vb)).normalize(),cy=(va.y+vb.y+vc.y)/3;
        S.tri(va.toArray(),vb.toArray(),vc.toArray(),typeof col=='function'?col(cy,n):col,j)}},
    // a slab: polygon (array of [x,z]) with its own top height per corner, sides down to yb
    slab(pts,yt,yb,top,side){const n=pts.length,cx=pts.reduce((a,p)=>a+p[0],0)/n,cz=pts.reduce((a,p)=>a+p[1],0)/n,cy=yt.reduce((a,b)=>a+b,0)/n;
      for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n];S.tri([cx,cy,cz],[q[0],yt[(i+1)%n],q[1]],[p[0],yt[i],p[1]],top,.1);
        S.quad([p[0],yt[i],p[1]],[q[0],yt[(i+1)%n],q[1]],[q[0],yb,q[1]],[p[0],yb,p[1]],side,.12)}},
    mesh(mat){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
      g.computeVertexNormals();g.computeBoundingSphere();g.userData.lps=1;const m=new THREE.Mesh(g,mat||arkMat());m.castShadow=true;m.receiveShadow=true;return m},
    n:()=>P.length/9};
  return S}
function arkMat(k){k=k||'std';if(ARK.mt[k])return ARK.mt[k];
  const o={std:{roughness:.95},iron:{roughness:.6,metalness:.35},glow:null}[k];
  const m=o?new THREE.MeshStandardMaterial(Object.assign({vertexColors:true,flatShading:true,side:THREE.DoubleSide},o)):new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
  m.userData.lps=1;return ARK.mt[k]=m}
const arkM4=(x,y,z,sx,sy,sz,rx,ry,rz)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(sx,sy==null?sx:sy,sz==null?sx:sz));
// jittered low-poly rock (icosahedron)
ARK.rock=(()=>{const L=[];for(let v=0;v<4;v++){const g0=new THREE.IcosahedronGeometry(1,0),g=g0.index?g0.toNonIndexed():g0,p=g.attributes.position,R=ARK.rng(31+v*17),key={};
  for(let i=0;i<p.count;i++){const k=[p.getX(i),p.getY(i),p.getZ(i)].map(n=>n.toFixed(3)).join();if(!key[k])key[k]=[.82+R()*.36,.82+R()*.36,.82+R()*.36];const s=key[k];p.setXYZ(i,p.getX(i)*s[0],p.getY(i)*s[1],p.getZ(i)*s[2])}
  L.push(g)}return L})();
const ARKG={cyl6:new THREE.CylinderGeometry(1,1,1,6),cyl5:new THREE.CylinderGeometry(1,1,1,5),cone5:new THREE.ConeGeometry(1,1,5),cone4:new THREE.ConeGeometry(1,1,4),box:new THREE.BoxGeometry(1,1,1),oct:new THREE.OctahedronGeometry(1,0)};
const arkShade=(hex,k)=>{const c=new THREE.Color(hex);c.multiplyScalar(k);return c.getHex()};
const arkMix=(a,b,t)=>new THREE.Color(a).lerp(new THREE.Color(b),t).getHex();

// ---------------- 1. Sovereign arenas: flagstone floor, rune inlay, iron braziers, ruined standing stones ----------------
// stone tint per arena so each realm keeps its own feel
const ARK_STONE=[0x57534a,0x6a6458,0x7c8088,0x6e5a46,0x4e5450,0x4a3e44];
function arkRune(S,x,y,z,a,s,col,R){
  // a rune glyph: a stave and two or three branches, laid flat on the stone
  const pat=[[[0,-1,0,1],[0,.2,.6,.8]],[[0,-1,0,1],[0,1,.6,.4],[0,0,.6,-.4]],[[0,-1,0,1],[-.6,.6,.6,-.2]],[[-.4,-1,0,1],[0,1,.4,-1],[-.2,0,.2,0]],[[0,-1,0,1],[0,.4,.55,.9],[0,.4,-.55,.9]]][Math.floor(R()*5)];
  const ca=Math.cos(a),sa=Math.sin(a),w=.07*s,P=(u,v)=>[x+(u*ca-v*sa)*s*.32,y,z+(u*sa+v*ca)*s*.32];
  pat.forEach(([u0,v0,u1,v1])=>{const du=u1-u0,dv=v1-v0,l=Math.hypot(du,dv)||1,nu=-dv/l*w/(s*.32),nv=du/l*w/(s*.32);
    S.quad(P(u0+nu,v0+nv),P(u1+nu,v1+nv),P(u1-nu,v1-nv),P(u0-nu,v0-nv),col,.05)})}
function arkArena(A){
  const g=A.g,R=ARK.rng(1000+A.i*77),st=ARK_STONE[A.i%ARK_STONE.length],col=A.b.col,y0=GH(A.cx,A.cz);
  // hide the old painted floor and the old braziers (they are rebuilt below)
  g.children.slice().forEach(o=>{if(o===A.wall)return;if(o.isMesh&&((o.material&&o.material.map)||o.geometry===G_CYL||(A.fx0||[]).includes(o)))g.remove(o)});
  const F=arkSoup(2000+A.i);
  // flagstone rings: centre disc, then rings of slabs with dark gaps between them
  const rings=[[0,1.6,1],[1.6,3.0,7],[3.0,4.6,11],[4.6,6.2,16],[6.2,7.8,21],[7.8,9.4,27],[9.4,11.0,31],[11.0,12.6,36],[12.6,14.3,42]];
  rings.forEach(([r0,r1,n],ri)=>{const off=R()*6.283;
    for(let k=0;k<n;k++){
      if(ri==rings.length-1&&R()<.18)continue;          // broken rim
      const a0=off+k/n*6.283,a1=off+(k+1)/n*6.283,ga=.05/Math.max(1,r1),pts=[],gap=.06;
      const cs=n==1?[...Array(7)].map((_,i)=>[r1-gap,i/7*6.283]):[[r0+gap,a0+ga+.4*ga],[r1-gap,a0+ga],[r1-gap,a1-ga],[r0+gap,a1-ga-.4*ga]];
      cs.forEach(([r,a])=>{const jr=r+(R()-.5)*.12,ja=a+(R()-.5)*.02;pts.push([A.cx+Math.cos(ja)*jr,A.cz+Math.sin(ja)*jr])});
      const tl=(R()-.5)*.05,lift=.06+R()*.05,yt=pts.map(p=>GH(p[0],p[1])+lift+tl*(p[0]-A.cx)/8),yb=Math.min(...pts.map(p=>GH(p[0],p[1])))-.12;
      const shade=.78+R()*.4,top=ri==1||ri==7?arkMix(arkShade(st,shade*.8),col,.08):arkShade(st,shade);
      F.slab(pts,yt,yb,ri==rings.length-1&&R()<.3?arkMix(top,0x3a4a2a,.35):top,arkShade(st,.55))}});
  // a few loose stones and rubble on the rim
  for(let k=0;k<16;k++){const a=R()*6.283,r=ARENA_R+.4+R()*1.6,x=A.cx+Math.cos(a)*r,z=A.cz+Math.sin(a)*r,s=.12+R()*.22;
    F.geo(ARK.rock[k%4],arkM4(x,GH(x,z)+s*.3,z,s,s*.6,s,0,R()*6),arkShade(st,.7+R()*.3))}
  const floor=F.mesh();floor.castShadow=false;g.add(floor);
  // rune inlay (glows in the Sovereign's colour)
  const G=arkSoup(3000+A.i),rc=arkMix(col,0xffffff,.15);
  for(let k=0;k<24;k++){const a=k/24*6.283,x=A.cx+Math.cos(a)*11.8,z=A.cz+Math.sin(a)*11.8;arkRune(G,x,GH(x,z)+.13,z,a+1.57,1.4,rc,R)}
  for(let k=0;k<8;k++){const a=k/8*6.283+.2,x=A.cx+Math.cos(a)*2.3,z=A.cz+Math.sin(a)*2.3;arkRune(G,x,GH(x,z)+.13,z,a+1.57,1.1,rc,R)}
  // thin inlaid circles
  [[11.05,.07],[12.55,.07],[1.62,.06]].forEach(([r,w])=>{for(let k=0;k<48;k++){const a0=k/48*6.283,a1=(k+1)/48*6.283,p=(rr,a)=>{const x=A.cx+Math.cos(a)*rr,z=A.cz+Math.sin(a)*rr;return [x,GH(x,z)+.125,z]};
    G.quad(p(r-w,a0),p(r-w,a1),p(r+w,a1),p(r+w,a0),rc,.05)}});
  const rm=G.mesh();rm.castShadow=false;rm.receiveShadow=false;rm.material=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide});rm.material.userData.lps=1;g.add(rm);A.lpRune=rm;
  // braziers at the four entrances: stone plinth, iron bowl on three legs, faceted flame
  const B=arkSoup(4000+A.i),iron=0x2c2a2e,fl=[];
  for(let k=0;k<4;k++){const a=k*Math.PI/2;[-1,1].forEach(s=>{const aa=a+s*.2,x=A.cx+Math.cos(aa)*(ARENA_R+.8),z=A.cz+Math.sin(aa)*(ARENA_R+.8),y=GH(x,z);
    B.geo(ARKG.cyl6,arkM4(x,y+.18,z,.42,.36,.42,0,R()),arkShade(st,.75));B.geo(ARKG.cyl6,arkM4(x,y+.42,z,.3,.14,.3,0,R()),arkShade(st,.95));
    for(let l=0;l<3;l++){const la=l*2.094;B.geo(ARKG.box,arkM4(x+Math.cos(la)*.14,y+.68,z+Math.sin(la)*.14,.045,.42,.045,Math.sin(la)*.25,0,-Math.cos(la)*.25),iron)}
    B.geo(ARKG.cone5,arkM4(x,y+.98,z,.36,.26,.36,Math.PI),iron);B.geo(ARKG.cyl5,arkM4(x,y+1.1,z,.38,.05,.38),arkShade(iron,1.4));
    B.geo(ARK.rock[k%4],arkM4(x,y+1.08,z,.2,.1,.2),0x1a1210);
    // flame: kept as its own mesh so the arena's flicker animation still drives it
    const f=new THREE.Group();f.position.set(x,y+1.3,z);f.scale.set(.28,.6,.28);
    const o=new THREE.Mesh(ARKG.cone5,new THREE.MeshBasicMaterial({color:col}));o.position.y=0;o.rotation.y=R()*6;f.add(o);
    const ic=new THREE.Mesh(ARKG.cone4,new THREE.MeshBasicMaterial({color:arkMix(col,0xfff2c0,.6)}));ic.scale.set(.55,.7,.55);ic.position.y=-.12;f.add(ic);
    f.traverse(q=>{if(q.isMesh){q.castShadow=false;q.material.userData.lps=1;q.geometry.userData.lps=1}});g.add(f);fl.push(f)})}
  // ruined standing stones around the edge of the bowl (between the entrances)
  for(let k=0;k<12;k++){const a=k/12*6.283+.26;if(Math.abs(((a%(Math.PI/2))+Math.PI/2)%(Math.PI/2)-Math.PI/4)>Math.PI/4-.33)continue;
    const r=ARENA_R+2.9+R()*.6,x=A.cx+Math.cos(a)*r,z=A.cz+Math.sin(a)*r,y=GH(x,z),h=1.4+R()*1.6,tl=(R()-.5)*.25;
    B.geo(ARKG.box,arkM4(x,y+h/2-.2,z,.55+R()*.2,h,.4+R()*.15,tl,-a+1.57,(R()-.5)*.2),arkShade(st,.8+R()*.3));
    if(R()<.6)B.geo(ARKG.box,arkM4(x,y+h-.15,z,.62,.22,.5,tl,-a+1.57,0),arkShade(st,.65));
    if(R()<.5){const rx=x+(R()-.5)*1.2,rz=z+(R()-.5)*1.2;B.geo(ARK.rock[k%4],arkM4(rx,GH(rx,rz)+.1,rz,.35,.25,.3,0,R()*6),arkShade(st,.7))}}
  g.add(B.mesh());
  A.fx0=fl;
  // seal wall: keep it round enough when the style pass lowers segment counts
  if(A.wall){const og=A.wall.geometry,p=og.parameters;A.wall.geometry=new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom,p.height,40,1,true);A.wall.geometry.userData.lps=1}
}
try{if(typeof ARN!='undefined')ARN.forEach(A=>{try{arkArena(A)}catch(e){console.error('lowpoly arena',A.i,e)}})}catch(e){console.error('lowpoly arenas',e)}

// ---------------- 2. wave-trial grounds: a war-camp ring of stakes, skull pikes and torn banners ----------------
function arkTrial(p,i){
  const R=ARK.rng(5000+i*31),cx=p.wa[0],cz=p.wa[1],S=arkSoup(5100+i),wood=0x4a3424,dwood=0x2e2018,bone=0xd8ccb0,cloth=[0x5a1a1a,0x3a2a4a,0x4a3a1a][i%3];
  // trampled flagstone dais at the centre, with a burnt fire ring
  for(let k=0;k<9;k++){const a0=k/9*6.283,a1=(k+1)/9*6.283,pts=[[0,.05],[0,1.15],[1,1.15],[1,.05]].map(([u,r])=>{const a=a0+(a1-a0)*u+(u?-.03:.03),rr=r*(2.2+(R()-.5)*.2);return [cx+Math.cos(a)*rr,cz+Math.sin(a)*rr]});
    const yt=pts.map(q=>GH(q[0],q[1])+.07+R()*.03);S.slab(pts,yt,Math.min(...yt)-.25,arkShade(0x5a4e40,.7+R()*.35),0x2e2820)}
  for(let k=0;k<7;k++){const a=k/7*6.283,x=cx+Math.cos(a)*.55,z=cz+Math.sin(a)*.55;S.geo(ARK.rock[k%4],arkM4(x,GH(x,z)+.12,z,.17,.12,.15,0,a),arkShade(0x5a5650,.8+R()*.3))}
  S.geo(ARKG.cyl6,arkM4(cx,GH(cx,cz)+.1,cz,.4,.03,.4),0x1a1210);
  for(let k=0;k<4;k++){const a=k*1.57+R(),x=cx+Math.cos(a)*.15,z=cz+Math.sin(a)*.15;S.geo(ARKG.cyl5,arkM4(x,GH(x,z)+.16,z,.05,.55,.05,1.45,a,0),0x241a12)}
  // palisade fragments, skull pikes and banners around the edge of the clearing
  for(let k=0;k<26;k++){const a=k/26*6.283+(R()-.5)*.08;if(Math.abs(Math.sin((a-1.5708)/2))<.13)continue;  // leave the south side open (exit portal)
    let r=0;const y0=GH(cx,cz);for(let rr=13.5;rr>=10.2;rr-=.3){const xx=cx+Math.cos(a)*rr,zz=cz+Math.sin(a)*rr,t=MAP[Math.round(zz)]&&MAP[Math.round(zz)][Math.round(xx)];if(Math.abs(GH(xx,zz)-y0)<.6&&t&&!'r#R~W'.includes(t)){r=rr;break}}
    if(!r)continue;const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,y=GH(x,z);
    if(k%5==2){ // banner pole
      S.geo(ARKG.cyl5,arkM4(x,y+1.6,z,.07,3.2,.07,0,R()),dwood);S.geo(ARKG.box,arkM4(x,y+3.05,z,.9,.07,.07,0,-a),dwood);
      const ta=-a+1.57,ca=Math.cos(ta),sa=Math.sin(ta),P=(u,v)=>[x+u*ca*.45,y+v,z-u*sa*.45];
      S.quad(P(-1,3.0),P(1,3.0),P(1,1.9),P(-1,1.9),cloth,.1);S.tri(P(-1,1.9),P(0,1.9),P(-1,1.45),cloth);S.tri(P(0,1.9),P(1,1.9),P(1,1.55),cloth);
      S.quad(P(1,3.0),P(-1,3.0),P(-1,1.9),P(1,1.9),arkShade(cloth,.7),.1);continue}
    if(k%5==4){ // skull pike
      S.geo(ARKG.cyl5,arkM4(x,y+1.1,z,.045,2.2,.045,(R()-.5)*.15,0,(R()-.5)*.15),dwood);
      S.geo(ARK.rock[k%4],arkM4(x,y+2.25,z,.17,.2,.19,0,-a+Math.PI/2),bone);S.geo(ARKG.box,arkM4(x,y+2.13,z,.13,.08,.12,0,-a),arkShade(bone,.85));
      [-1,1].forEach(s=>{const ea=-a+Math.PI,ex=x+Math.cos(a+Math.PI)*.15+Math.cos(a+1.57)*s*.06,ez=z+Math.sin(a+Math.PI)*.15+Math.sin(a+1.57)*s*.06;S.geo(ARKG.oct,arkM4(ex,y+2.27,ez,.04),0x0a0806)});continue}
    // sharpened stakes, leaning outward
    const n=2+Math.floor(R()*2);for(let q=0;q<n;q++){const o=(q-(n-1)/2)*.32,sx=x+Math.cos(a+1.57)*o,sz=z+Math.sin(a+1.57)*o,h=1.3+R()*.9,lean=.18+R()*.12,sy=GH(sx,sz);
      const q2=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(-Math.sin(a),0,Math.cos(a)),lean);
      const M=new THREE.Matrix4().compose(new THREE.Vector3(sx+Math.cos(a)*lean*h*.5,sy+h/2,sz+Math.sin(a)*lean*h*.5),q2,new THREE.Vector3(.09,h,.09));
      S.geo(ARKG.cyl5,M,arkShade(wood,.8+R()*.3));
      const T=new THREE.Matrix4().compose(new THREE.Vector3(sx+Math.cos(a)*lean*(h+.12),sy+h+.12,sz+Math.sin(a)*lean*(h+.12)),q2,new THREE.Vector3(.09,.25,.09));S.geo(ARKG.cone5,T,0xb8a07a)}}
  const m=S.mesh();m.position.set(0,0,0);scene.add(m);return m}
var ARK_TRIAL=[];try{if(typeof PMAP!='undefined')PMAP.forEach((p,i)=>{try{ARK_TRIAL.push(arkTrial(p,i))}catch(e){console.error('lowpoly trial',i,e)}})}catch(e){}

// ---------------- 3. cracked secret boulders ----------------
if(typeof buildSecret=='function'){
  buildSecret=function(S){
    const g=new THREE.Group();g.position.set(S.x,GH(S.x,S.z),S.z);
    const B=arkSoup(6000+S.id),R=B.R,st=0x726c62;
    // three big chunks split by the glowing cracks, mossy on top
    [[0,.9,0,1.15,1.0,1.05,0],[.55,.55,.35,.7,.6,.65,1],[-.5,.5,-.3,.75,.55,.7,2],[.1,.3,-.6,.5,.35,.5,3]].forEach(([x,y,z,sx,sy,sz,v])=>
      B.geo(ARK.rock[v],arkM4(x,y,z,sx,sy,sz,R()*.4,R()*6,R()*.3),(cy,n)=>n.y>.55&&cy>1.2?arkMix(st,0x4a6a34,.55):arkShade(st,n.y<-.2?.55:.8+R()*.35)));
    for(let k=0;k<6;k++){const a=R()*6.283,r=1.2+R()*.6;B.geo(ARK.rock[k%4],arkM4(Math.cos(a)*r,.08,Math.sin(a)*r,.12+R()*.12,.08,.12+R()*.1,0,R()*6),arkShade(st,.7))}
    const b=B.mesh();g.add(b);
    const G=arkSoup(6100+S.id);
    [[0,1.2,.9,.5],[.5,.9,.8,-.6],[-.4,1.4,.75,.9]].forEach(([x,y,z,r])=>{const c=Math.cos(r),s=Math.sin(r),P=(u,v)=>[x+(u*c-v*s)*.03,y+(u*s+v*c)*.3,z+.03];
      G.quad(P(-1,-1),P(1,-1),P(1,1),P(-1,1),0xffb050,.1);G.quad(P(-1,1.1),P(1,1.1),P(.3,1.8),P(-.3,1.8),0xffd080,.1)});
    const gm=G.mesh(new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}));gm.material.userData.lps=1;gm.castShadow=false;g.add(gm);
    S.body=b;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)CBLK.add((S.z+j)*W+S.x+i);
    scene.add(g);S.g=g};
  try{SECRETS.forEach(S=>{if(S.g&&!S.broken){scene.remove(S.g);S.g=null;buildSecret(S)}})}catch(e){console.error('lowpoly secrets',e)}
}

// ---------------- 4. fishing bobber: a carved red-and-bone float with a little quill ----------------
ARK.bob=(()=>{const S=arkSoup(77);S.geo(new THREE.OctahedronGeometry(1,0),arkM4(0,.0,0,.11,.1,.11),(cy,n)=>n.y>0?0xc8301e:0xe8dcc0,.08);
  S.geo(ARKG.cyl5,arkM4(0,.14,0,.018,.16,.018),0x2a1a10);S.geo(ARKG.cone4,arkM4(0,.25,0,.03,.08,.012),0xe8dcc0);const m=S.mesh();return m.geometry})();
if(typeof fishStart=='function'){const f=fishStart;fishStart=function(){const r=f.apply(this,arguments);try{const b=fishing&&fishing.bob;if(b&&b.isMesh){b.geometry=ARK.bob;b.material=arkMat();b.castShadow=true}}catch(e){}return r}}

