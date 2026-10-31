// v185 audit (run by v185_audit.py): every instance is visited (path every ~40 tiles, every camp, every set piece the
// instance records know), and at each visit the scenery built near the hero is measured:
//  * clip: a scattered decoration (WD) whose solid core stands inside another object (a camp, a quest set piece, a den, a
//    building: anything static in the scene that is not a character, the ground, water or an effect), or two WD solid cores
//    inside each other;
//  * terrain: spikes and pits (a tile far above / below all four neighbours), steps in walkable ground (a jump of more
//    than STEP between neighbouring walkable tiles), holes (void tiles with walkable land all round), NaN heights, ground
//    above the water in a pond;
//  * dark: flat near-black unlit pieces larger than 25 cm (the old tents' "black squares"), for a look at each.
// Returns {inst:[{n, clip:[...], terrain:{...}, dark:[...]}]} — positions in world tiles.
async(opt)=>{opt=opt||{};const W8=ms=>new Promise(r=>setTimeout(r,ms)),re=new RegExp(opt.flt||'.'),out={inst:[],t0:performance.now()};
  const DW=MAP.DW,TM=new Set((GTX.list||[]).map(t=>t.mat)),STEP=opt.step||1.25,GRID=.5,KEY=(x,z)=>Math.round(x/GRID)+','+Math.round(z/GRID);
  const isChar=o=>{let a=o;while(a&&a!==scene){if(a.isSkinnedMesh||a.isBone||(a.children&&a.children.some(c=>c.isSkinnedMesh)))return true;a=a.parent}return false};
  const rootOf=o=>{let a=o;while(a.parent&&a.parent!==scene)a=a.parent;return a};
  const T=WD.T,core=d=>{const S=T[d.k];if(!S||S.near||S.flat)return 0;if(!S.col&&!S.cast)return 0;
    if(S.__c==null){const b=new THREE.Box3();S.parts.forEach(p=>{if(p.glow||p.mat)return;p.g.computeBoundingBox();b.union(p.g.boundingBox)});const w=b.max.x-b.min.x,dd=b.max.z-b.min.z,h=b.max.y-b.min.y;
      const tree=/tree|pine|oak|palm|snag|spire|stalag|pillar|column|col$|obelisk|lamp|banner|totem|cross|stake|candela|brazier|statue|angel/.test(d.k);
      S.__c=tree?Math.min(.32,Math.min(w,dd)*.18):Math.min(w,dd)*.34;S.__h=h;S.__y0=b.min.y}
    const sc=S.sc||[1,1,1];return S.__c*d.s*Math.min(sc[0],sc[2])};
  const visit=async(x,z)=>{toPos(x,z,0);for(let i=0;i<3;i++){await W8(120);try{rosterTick()}catch(_){}try{if(typeof campTick=='function')campTick(.016,performance.now())}catch(_){}}
    try{loop(performance.now())}catch(_){}};
  // the static scenery near (x,z): world triangles sampled onto a 0.5 grid, per owner (the top group under the scene)
  const occ=(x,z,R)=>{const G=new Map(),v=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),own=new Map();let on=0;
    scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.geometry||!o.geometry.attributes.position)return;const m=Array.isArray(o.material)?o.material[0]:o.material;
      if(!m||m.isShaderMaterial||m.isMeshBasicMaterial||(m.transparent&&m.opacity<.9)||m.map&&o.userData&&o.userData.terrain)return;
      if(TM.has(m))return;
      if(o.geometry.boundingSphere==null)o.geometry.computeBoundingSphere();o.updateWorldMatrix(true,false);const bs=o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld);
      if(Math.hypot(bs.center.x-x,bs.center.z-z)>R+bs.radius||bs.radius>60)return;if(isChar(o))return;
      const r=rootOf(o);if(r===pl)return;let id=own.get(r);if(id==null){id=++on;own.set(r,id)}
      const P=o.geometry.attributes.position,I=o.geometry.index,n=I?I.count:P.count,M=o.matrixWorld;
      for(let t=0;t<n;t+=3){const ia=I?I.getX(t):t,ib=I?I.getX(t+1):t+1,ic=I?I.getX(t+2):t+2;a.fromBufferAttribute(P,ia).applyMatrix4(M);b.fromBufferAttribute(P,ib).applyMatrix4(M);c.fromBufferAttribute(P,ic).applyMatrix4(M);
        const L=Math.max(a.distanceTo(b),b.distanceTo(c),c.distanceTo(a)),k=Math.min(24,Math.max(1,Math.ceil(L/.35)));
        for(let i=0;i<=k;i++)for(let j=0;j<=k-i;j++){const u=i/k,w2=j/k;v.set(a.x+(b.x-a.x)*u+(c.x-a.x)*w2,a.y+(b.y-a.y)*u+(c.y-a.y)*w2,a.z+(b.z-a.z)*u+(c.z-a.z)*w2);
          const gh=GH(v.x,v.z),hy=v.y-gh;if(hy<.25||hy>3.2)continue;const K=KEY(v.x,v.z);let e=G.get(K);if(!e)G.set(K,e=new Map());const q=e.get(id);if(!q)e.set(id,[hy,hy]);else{if(hy<q[0])q[0]=hy;if(hy>q[1])q[1]=hy}}}});
    const names=new Map();own.forEach((id,r)=>names.set(id,(r.name||r.type)+(r.userData&&r.userData.kind?':'+r.userData.kind:'')));return {G,names}};
  const done=new Set();
  for(const I of INSL){if(I.tri||!re.test(I.n))continue;const R={n:I.n,g:I.g,clip:[],wdwd:[],terrain:{spike:[],pit:[],step:[],hole:[],nan:[],wet:[]},dark:[],visits:0};
    const inI=(x,z)=>x>=I.x0&&x<I.x0+I.w&&z>=I.y0&&z<I.y0+I.h;
    // where to stand: the path every ~40 tiles, every camp, the den / boss area, the entrance, and a coarse grid of walkable land
    const pts=[];const add=(x,z)=>{if(!inI(x,z)||GH(x,z)<-8)return;if(pts.every(p=>Math.hypot(p[0]-x,p[1]-z)>26))pts.push([x,z])};
    if(I.en)add(I.en[0],I.en[1]);(I.wp||[]).forEach(p=>add(p[0],p[1]));(I.path||[]).forEach((p,i)=>{if(i%12==0)add(p[0],p[1])});
    (typeof CAMPS!='undefined'?CAMPS:[]).forEach(C=>{if(inI(C.x,C.z))add(C.x,C.z)});if(I.ba)add(I.ba[0],I.ba[1]);
    for(let zz=I.y0+20;zz<I.y0+I.h;zz+=40)for(let xx=I.x0+20;xx<I.x0+I.w;xx+=40)if(DW[Math.round(zz)*W+Math.round(xx)]<-1)add(xx,zz);
    const wdIn=WD.list.filter(d=>inI(d.x,d.z)&&d.st176&&d.st176.sx!==0);
    for(const [px,pz] of pts){await visit(px,pz);R.visits++;const {G,names}=occ(px,pz,30);
      for(const d of wdIn){if(Math.hypot(d.x-px,d.z-pz)>26)continue;const id=d.k+'@'+d.x.toFixed(1)+','+d.z.toFixed(1);if(done.has(id))continue;
        const rc=core(d);if(rc<=.05)continue;const S=T[d.k],sc=S.sc||[1,1,1],h=(S.__h||1)*d.s*sc[1];let hit=new Map();
        for(let zz=d.z-rc;zz<=d.z+rc;zz+=GRID*.9)for(let xx=d.x-rc;xx<=d.x+rc;xx+=GRID*.9){if(Math.hypot(xx-d.x,zz-d.z)>rc)continue;const e=G.get(KEY(xx,zz));if(!e)continue;
          e.forEach((q,oid)=>{if(q[0]<Math.min(h,3.2)-.1)hit.set(oid,(hit.get(oid)||0)+1)})}
        hit.forEach((n,oid)=>{if(n>=2){done.add(id);R.clip.push({k:d.k,x:+d.x.toFixed(1),z:+d.z.toFixed(1),r:+rc.toFixed(2),into:names.get(oid),cells:n})}})}}
    // WD solid cores inside each other
    const sol=wdIn.map(d=>[d,core(d)]).filter(q=>q[1]>.05);
    for(let i=0;i<sol.length;i++)for(let j=i+1;j<sol.length;j++){const [a,ra]=sol[i],[b,rb]=sol[j],dd=Math.hypot(a.x-b.x,a.z-b.z);if(dd<(ra+rb)*.8)R.wdwd.push({a:a.k,b:b.k,x:+a.x.toFixed(1),z:+a.z.toFixed(1),d:+dd.toFixed(2),need:+(ra+rb).toFixed(2)})}
    // terrain
    const walk=(x,z)=>DW[z*W+x]<-.5&&MAP[z]&&MAP[z][x]!=='~';
    for(let z=I.y0+1;z<I.y0+I.h-1;z++)for(let x=I.x0+1;x<I.x0+I.w-1;x++){const h=GH(x,z);if(!isFinite(h)){R.terrain.nan.push([x,z]);continue}if(h<-20){
        if(walk(x+1,z)&&walk(x-1,z)&&walk(x,z+1)&&walk(x,z-1))R.terrain.hole.push([x,z]);continue}
      const n=[GH(x+1,z),GH(x-1,z),GH(x,z+1),GH(x,z-1)];if(n.some(q=>q<-20))continue;const mn=Math.min(...n),mx=Math.max(...n);
      if(h-mx>2.2)R.terrain.spike.push([x,z,+(h-mx).toFixed(1)]);if(mn-h>2.2)R.terrain.pit.push([x,z,+(mn-h).toFixed(1)]);
      if(walk(x,z)){for(const [dx,dz] of [[1,0],[0,1]])if(walk(x+dx,z+dz)){const s=Math.abs(GH(x+dx,z+dz)-h);if(s>STEP)R.terrain.step.push([x,z,+s.toFixed(1)])}}
      if(MAP[z][x]==='~'&&h>.35&&walk(x+1,z)+walk(x-1,z)+walk(x,z+1)+walk(x,z-1)<2)R.terrain.wet.push([x,z])}
    // near-black flat unlit pieces (black squares)
    scene.traverse(o=>{if(!o.isMesh||isChar(o))return;const m=o.material;if(!m||Array.isArray(m)||!m.isMeshBasicMaterial||m.transparent||m.vertexColors||m.map)return;
      const c=m.color;if(c.r+c.g+c.b>.15)return;o.updateWorldMatrix(true,false);const p=new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);if(!inI(p.x,p.z))return;
      o.geometry.computeBoundingBox();const s=new THREE.Vector3().setFromMatrixScale(o.matrixWorld),bb=o.geometry.boundingBox,sz=[(bb.max.x-bb.min.x)*s.x,(bb.max.y-bb.min.y)*s.y,(bb.max.z-bb.min.z)*s.z].sort((p,q)=>q-p);
      if(sz[1]>.25)R.dark.push({x:+p.x.toFixed(1),z:+p.z.toFixed(1),y:+(p.y-GH(p.x,p.z)).toFixed(2),sz:sz.map(v=>+v.toFixed(2)),root:rootOf(o).name||rootOf(o).type})});
    out.inst.push(R)}
  out.ms=Math.round(performance.now()-out.t0);return out}
