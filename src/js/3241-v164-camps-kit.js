// ================= v164: camps (2/3): building, merging, lights =================
// buildCamp (replaces v123's wrapper; the old outpost builder stays the fallback): the v123 design is built on the camp's core
// (cs123Build with C.r = C.rc for the call), then cs164Dress (3242) dresses the settlement ring, the fence, the gates, the
// outskirts and the trail with the same kit (cs123Designs is wrapped so the dressing runs inside the same build: same seeded
// stream, same occupancy list, same tile blocking).
// Merging (cs164Merge, replaces cs123Merge for these camps): every static mesh is baked into a few big meshes, one per material
// *kind* (lit / lit casting shadows / glow / each transparency, metal or emissive look), with the part's colour baked into vertex
// colours (lit parts also get the v123 per-face shade), so a camp is ~10-20 draw calls however many colours it uses. The
// materials are shared by every camp (CS164.M, never disposed). Breakable boxes are merged per box (one mesh per box look);
// animated pieces stay separate as before (cs123Tick).
// Lights: each camp has 1-2 point lights (a bonfire, a gate brazier or its glow) added straight to the scene (the v98 pool
// picks the nearest ones); they are on only while the camp is shown and within 70 tiles, with a slow flicker.
var CS164={M:new Map(),lights:[],pend:null,st:{},box:10,small:.3,lod:52};
// glowing (emissive) parts share one material per strength: their glow is their own baked colour times the strength (shader patch)
function cs164Glow(mat){if(!(mat.emissiveIntensity>0&&mat.emissive&&mat.emissive.getHex()))return 0;const e=mat.emissive,c=mat.color,le=e.r*.3+e.g*.59+e.b*.11,lc=Math.max(.05,c.r*.3+c.g*.59+c.b*.11);
  return Math.max(.1,Math.min(1.2,Math.round(mat.emissiveIntensity*Math.min(2,le/lc)*5)/5))}
function cs164Mat(mat){const q=v=>Math.round(v*10)/10,lit=!mat.isMeshBasicMaterial;
  const mt=lit?(mat.metalness>.3?.6:0):0,ro=lit?(mat.roughness<.3?.2:mat.roughness<.65?.45:.9):1,gl=lit?cs164Glow(mat):0;
  const key=[mat.type,mat.transparent?Math.max(.1,q(mat.opacity)):1,mat.side,mat.depthWrite?1:0,mat.polygonOffset?mat.polygonOffsetFactor:0,mt,ro,gl,mat.fog===false?0:1].join('|');
  let m=CS164.M.get(key);if(m)return m;
  m=mat.clone();m.color=new THREE.Color(1,1,1);m.vertexColors=true;if(lit){m.metalness=mt;m.roughness=ro;m.flatShading=true}m.map=null;m.userData={lps:1,v164:1};
  if(mat.transparent)m.opacity=Math.max(.1,q(mat.opacity));
  if(gl){m.emissive=new THREE.Color(0,0,0);m.emissiveIntensity=1;m.userData.noFade135=1;const k=gl.toFixed(2);
    m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('vec3 totalEmissiveRadiance = emissive;','vec3 totalEmissiveRadiance = vColor * '+k+';')};m.customProgramCacheKey=()=>'v164g'+k}
  CS164.M.set(key,m);return m}
// one part's geometry in the target frame M with its colour baked in (lit parts: a per-face shade like v123)
function cs164Bake(src,M,col,shade){const gg=src.index?src.toNonIndexed():src.clone();['uv','uv2','color'].forEach(a=>{if(gg.attributes[a])gg.deleteAttribute(a)});
  gg.applyMatrix4(M);const P=gg.attributes.position,n=P.count,cl=new Float32Array(n*3);
  for(let i=0;i<n;i+=3){let f=1;if(shade){const q=Math.sin(P.getX(i)*12.9898+P.getY(i)*78.233+P.getZ(i)*37.719)*43758.5453;f=.8+.32*(q-Math.floor(q))}
    for(let k=0;k<3&&i+k<n;k++){cl[(i+k)*3]=col.r*f;cl[(i+k)*3+1]=col.g*f;cl[(i+k)*3+2]=col.b*f}}
  gg.setAttribute('color',new THREE.BufferAttribute(cl,3));if(!gg.attributes.normal)gg.computeVertexNormals();return gg}
function cs164Join(list){let n=0;list.forEach(q=>n+=q.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),Cc=new Float32Array(n*3);let off=0;
  list.forEach(q=>{P.set(q.attributes.position.array,off*3);N.set(q.attributes.normal.array,off*3);Cc.set(q.attributes.color.array,off*3);off+=q.attributes.position.count;q.dispose()});
  const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(P,3));bg.setAttribute('normal',new THREE.BufferAttribute(N,3));bg.setAttribute('color',new THREE.BufferAttribute(Cc,3));
  bg.computeBoundingSphere();bg.userData.lps=1;return bg}
function cs164Merge(g){g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),M=new THREE.Matrix4(),by=new Map(),rm=[];
  const isLit=m=>!m.isMeshBasicMaterial&&!m.transparent;
  // a breakable box: its parts become one mesh per look, in the box's own frame (it still scales and hides as one group)
  const box=bg=>{const L=new Map(),old=[];bg.children.forEach(c=>{if(!c.isMesh||Array.isArray(c.material)||c.material.map)return;c.updateMatrix();const mm=cs164Mat(c.material);
      let e=L.get(mm);if(!e)L.set(mm,e=[]);e.push(cs164Bake(c.geometry,c.matrix,c.material.color,isLit(c.material)));old.push(c)});
    old.forEach(c=>{if(c.userData.own)c.geometry.dispose();bg.remove(c)});
    L.forEach((e,mm)=>{const m=new THREE.Mesh(cs164Join(e),mm);m.castShadow=isLit(mm);m.receiveShadow=true;bg.add(m)})};
  const walk=o=>{for(const c of o.children.slice()){if(c.userData.keep)continue;if(c.userData.box){box(c);continue}
    if(c.isMesh){const mat=c.material;if(Array.isArray(mat)||mat.map)continue;M.multiplyMatrices(inv,c.matrixWorld);const lit=isLit(mat),mm=cs164Mat(mat);
      // small clutter (under CS164.small tiles across) goes in meshes of its own that hide when the hero is far (LOD) and cast no shadow
      if(!c.geometry.boundingSphere)c.geometry.computeBoundingSphere();const sc=Math.max(Math.abs(c.scale.x),Math.abs(c.scale.y),Math.abs(c.scale.z)),sm=c.geometry.boundingSphere.radius*sc<CS164.small;
      const cast=lit&&c.castShadow&&!sm,key=mm.uuid+(cast?'+':'')+(sm?'s':'');
      let e=by.get(key);if(!e)by.set(key,e={mm,cast,sm,geo:[]});e.geo.push(cs164Bake(c.geometry,M,mat.color,lit));rm.push(c)}
    else walk(c)}};
  walk(g);rm.forEach(o=>{if(o.userData.own)o.geometry.dispose();o.parent.remove(o)});
  const prune=o=>{for(const c of o.children.slice()){if(c.userData.box||c.isMesh)continue;prune(c);if(!c.children.length)o.remove(c)}};prune(g);
  let dc=0,tri=0;by.forEach(e=>{const bg=cs164Join(e.geo),m=new THREE.Mesh(bg,e.mm);m.castShadow=e.cast;m.receiveShadow=true;m.matrixAutoUpdate=false;m.updateMatrix();if(e.sm){m.userData.v164s=1;(g.userData.v164s=g.userData.v164s||[]).push(m)}g.add(m);dc++;tri+=bg.attributes.position.count/3});
  return {dc,tri:Math.round(tri)}}
// draw calls and triangles of a built camp (tests)
function cs164Stats(C){let dc=0,tri=0;if(C&&C.g)C.g.traverse(o=>{if(o.isMesh&&o.visible!==false){dc++;const g=o.geometry;tri+=(g.index?g.index.count:g.attributes.position.count)/3}});return {dc,tri:Math.round(tri)}}

// the dressing runs inside the core design's build (same kit K)
{const f=cs123Designs;cs123Designs=function(K){const D=f.apply(this,arguments),C=CS164.cur;
  if(C&&C.site&&D[C.key]){const b=D[C.key];D[C.key]=()=>{b();try{cs164Dress(C,K)}catch(e){console.warn('v164 dress',C.key,e)}}}return D}}
{const f=buildCamp;buildCamp=function(C){if(C.g)return;if(!C.des||!C.site||typeof cs164Dress!='function')return f.apply(this,arguments);
  const g=new THREE.Group();g.position.set(C.x,0,C.z);let ok=false;const r=C.r,T0=performance.now();CS164.cur=C;CS164.pend=[];C.boxes=[];
  try{C.r=C.rc;ok=cs123Build(C,g)}catch(e){console.warn('v164 camp',C.key,e)}finally{C.r=r;CS164.cur=null}
  if(!ok){C.boxes=[];CS164.pend=null;CS123.an=CS123.an.filter(a=>a.C!==C);return f.apply(this,arguments)}
  // at most CS164.box breakable boxes (the first ones: the core's own); the rest stay as scenery merged with the camp
  if(C.boxes.length>CS164.box){C.boxes.slice(CS164.box).forEach(b=>{b.g.userData.box=0});C.boxes.length=CS164.box}
  const st=cs164Merge(g);scene.add(g);C.g=g;C.v123=1;C.v164=1;
  (CS164.pend||[]).forEach(q=>{const l=new THREE.PointLight(q.c,q.i,q.d||15,1.6);l.position.set(C.x+q.x,q.y,C.z+q.z);l.visible=false;l.userData.v164=1;scene.add(l);CS164.lights.push({C,l,i:q.i,ph:q.x*3.1+q.z})});
  CS164.pend=null;CS164.st[C.key]={ms:Math.round(performance.now()-T0),dc:st.dc,tri:st.tri,boxes:C.boxes.length}}}
// lights: on while the camp is shown and near, with a slow flicker
function cs164LTick(now){const p=pl.position,t=now*.001;
  // LOD: a camp's small clutter shows only within CS164.lod tiles of the hero
  for(let i=0;i<CAMPS.length;i++){const C=CAMPS[i],q=C.g&&C.g.userData.v164s;if(!q)continue;const on=Math.hypot(C.x-p.x,C.z-p.z)<CS164.lod+C.r;if(q.on!==on){q.on=on;q.forEach(m=>{m.visible=on})}}
  const L=CS164.lights;if(!L.length)return;
  for(let i=0;i<L.length;i++){const q=L[i],C=q.C,on=!!(C.g&&C.g.visible)&&Math.abs(C.x-p.x)<70&&Math.abs(C.z-p.z)<70;if(q.l.visible!==on)q.l.visible=on;
    if(on)q.l.intensity=q.i*(1+.1*Math.sin(t*6.3+q.ph)+.05*Math.sin(t*13.7+q.ph*2))}}
{const f=campTick;campTick=function(dt,now){f.apply(this,arguments);try{cs164LTick(now)}catch(e){if(!CS164.le){CS164.le=1;console.warn('v164 lights',e)}}}}
