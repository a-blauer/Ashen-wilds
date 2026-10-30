// v176 test: every other scenery object in the zone instances (camps, gateways, set pieces, dens) after visiting each instance:
// lit parts that touch nothing and hang above the ground. Run by v176_env.py.
async()=>{
  // every top-level scenery object in the zone instances (not instanced decorations, not characters): parts that touch nothing and hang above the ground
  const out=[],V3=THREE.Vector3,v=new V3(),skipped={skin:0,big:0,town:0};const t0=performance.now();
  {const wait=ms=>new Promise(r=>setTimeout(r,ms));let T=performance.now();const vis=[];
   for(let i=0;i<INSL.length;i++){const I=INSL[i];if(!I||!I.ba)continue;try{toPos(I.ba[0],I.ba[1]);await wait(50);for(let k=0;k<8;k++){T+=33;homeTick(1/30,T)}if(I.en){toPos(I.en[0],I.en[1]);for(let k=0;k<8;k++){T+=33;homeTick(1/30,T)}}vis.push(I.n)}catch(e){vis.push('ERR '+I.n+' '+e)}}
   window.__vis=vis}
  scene.updateMatrixWorld(true);
  const objs=scene.children.filter(o=>!o.isInstancedMesh&&!o.isLight&&!o.isCamera&&o!==pl);
  const ALL=new Map(),PEND=[];
  const actors=new Set();try{enemies.forEach(e=>e&&e.m&&actors.add(e.m));fols.forEach(f=>f&&actors.add(f))}catch(_){}
  const under=c=>{for(let p=c;p;p=p.parent){if(p.isBone||p.isSkinnedMesh)return true}return false};
  for(const o of objs){let skin=actors.has(o),ms=[];o.traverse(c=>{if(under(c))return;if(c.isMesh&&!c.isInstancedMesh&&c.geometry&&c.geometry.attributes.position&&!(c.material&&c.material.isPointsMaterial)){c.__lit=c.visible!==false&&!(c.material&&(c.material.transparent||c.material.isMeshBasicMaterial||c.material.isShaderMaterial));ms.push(c)}});
    if(skin){skipped.skin++;continue}if(!ms.length)continue;
    const B=new THREE.Box3().setFromObject(o);if(!isFinite(B.min.x))continue;const sz=B.getSize(new V3());
    // huge or out-of-zone objects are not reported, but their pieces still count as something to touch
    const big=sz.x>220||sz.z>220;if(big)skipped.big++;
    const cx=(B.min.x+B.max.x)/2,cz=(B.min.z+B.max.z)/2,I=big?null:insAt(Math.round(cx),Math.round(cz));if(!I&&!big)skipped.town++;
    // connected pieces (shared corners) of every mesh, in world space
    const comps=[];let nv=0;
    for(const m of ms){const g=m.geometry,P=g.attributes.position,ix=g.index,n=ix?ix.count:P.count;if(P.count>200000)continue;nv+=P.count;if(nv>4000000)break;
      const key=new Map(),par=[],vid=[],wp=new Float32Array(P.count*3);
      for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld);wp[i*3]=v.x;wp[i*3+1]=v.y;wp[i*3+2]=v.z;const k=Math.round(v.x*400)+','+Math.round(v.y*400)+','+Math.round(v.z*400);let q=key.get(k);if(q==null){q=par.length;par.push(q);key.set(k,q)}vid.push(q)}
      const f=a=>{while(par[a]!==a){par[a]=par[par[a]];a=par[a]}return a};
      for(let t=0;t<n;t+=3){const a=vid[ix?ix.getX(t):t],b=vid[ix?ix.getX(t+1):t+1],c=vid[ix?ix.getX(t+2):t+2];par[f(a)]=f(b);par[f(b)]=f(c)}
      const bx=new Map();for(let i=0;i<P.count;i++){const r=f(vid[i]);let q=bx.get(r);if(!q){q={mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9],n:0,lit:m.__lit,m:m.name||m.parent&&m.parent.name||''};bx.set(r,q)}q.n++;for(let a=0;a<3;a++){const w=wp[i*3+a];if(w<q.mn[a])q.mn[a]=w;if(w>q.mx[a])q.mx[a]=w}}
      bx.forEach(q=>comps.push(q))}
    const oid=objs.indexOf(o);comps.forEach(c=>{const k=Math.floor(c.mn[0]/4)+','+Math.floor(c.mn[2]/4);(ALL.get(k)||ALL.set(k,[]).get(k)).push([oid,c])});
    if(!I)continue;
    // join by touching boxes, then check each group's floor
    const n=comps.length,pp=comps.map((_,i)=>i),f=a=>{while(pp[a]!==a)a=pp[a]=pp[pp[a]];return a},tol=.03;
    const srt=comps.map((c,i)=>i).sort((a,b)=>comps[a].mn[0]-comps[b].mn[0]);
    for(let ii=0;ii<n;ii++){const i=srt[ii],A=comps[i];for(let jj=ii+1;jj<n;jj++){const j=srt[jj],C=comps[j];if(C.mn[0]>A.mx[0]+tol)break;
      if(A.mn[1]<=C.mx[1]+tol&&C.mn[1]<=A.mx[1]+tol&&A.mn[2]<=C.mx[2]+tol&&C.mn[2]<=A.mx[2]+tol)pp[f(i)]=f(j)}}
    const G=new Map();comps.forEach((c,i)=>{const r=f(i);let q=G.get(r);if(!q){q={mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9],n:0,c:0,lit:true,m:c.m};G.set(r,q)}q.n+=c.n;q.lit=q.lit&&c.lit;q.c++;for(let a=0;a<3;a++){q.mn[a]=Math.min(q.mn[a],c.mn[a]);q.mx[a]=Math.max(q.mx[a],c.mx[a])}});
    const fl=[];G.forEach(q=>{let gmax=-1e9;for(const [x,z] of [[q.mn[0],q.mn[2]],[q.mx[0],q.mn[2]],[q.mn[0],q.mx[2]],[q.mx[0],q.mx[2]],[(q.mn[0]+q.mx[0])/2,(q.mn[2]+q.mx[2])/2]])gmax=Math.max(gmax,GH(x,z));
      const gap=q.mn[1]-gmax;if(gap>.08&&q.n>=6&&q.lit)fl.push({gap:+gap.toFixed(2),n:q.n,c:q.c,at:[+((q.mn[0]+q.mx[0])/2).toFixed(1),+q.mn[1].toFixed(2),+((q.mn[2]+q.mx[2])/2).toFixed(1)],sz:[+(q.mx[0]-q.mn[0]).toFixed(2),+(q.mx[1]-q.mn[1]).toFixed(2),+(q.mx[2]-q.mn[2]).toFixed(2)],m:q.m})});
    // main body: the group with the most vertices
    let tris=0;ms.forEach(m=>{const g=m.geometry;tris+=(g.index?g.index.count:g.attributes.position.count)/3});
    fl.sort((a,b)=>b.gap-a.gap);if(fl.length>40)fl.length=40;if(fl.length)PEND.push([objs.indexOf(o),fl]);if(fl.length)out.push({ins:I.n,name:o.name||'',ud:Object.keys(o.userData).slice(0,4).join(','),pos:[+cx.toFixed(1),+B.min.y.toFixed(1),+cz.toFixed(1)],sz:[+sz.x.toFixed(1),+sz.y.toFixed(1),+sz.z.toFixed(1)],tris:Math.round(tris),groups:G.size,fl,nfl:fl.length})}
  // a group touching a piece of another object (a camp's parts are baked into several groups) is attached
  {const tol=.03,touch=(q,oi)=>{const x0=Math.floor((q.mn[0]-4)/4),x1=Math.floor(q.mx[0]/4),z0=Math.floor((q.mn[2]-4)/4),z1=Math.floor(q.mx[2]/4);
     for(let X=x0;X<=x1;X++)for(let Z=z0;Z<=z1;Z++){const L=ALL.get(X+','+Z);if(!L)continue;for(const [id,c] of L){if(id===oi)continue;
       if(q.mn[0]<=c.mx[0]+tol&&c.mn[0]<=q.mx[0]+tol&&q.mn[1]<=c.mx[1]+tol&&c.mn[1]<=q.mx[1]+tol&&q.mn[2]<=c.mx[2]+tol&&c.mn[2]<=q.mx[2]+tol)return true}}return false};
   PEND.forEach(([oi,fl])=>{for(let i=fl.length-1;i>=0;i--){const f=fl[i],q={mn:[f.at[0]-f.sz[0]/2,f.at[1],f.at[2]-f.sz[2]/2],mx:[f.at[0]+f.sz[0]/2,f.at[1]+f.sz[1],f.at[2]+f.sz[2]/2]};if(touch(q,oi))fl.splice(i,1)}});
   for(let i=out.length-1;i>=0;i--){out[i].nfl=out[i].fl.length;if(!out[i].fl.length)out.splice(i,1)}}
  // the old instanced props (0070: grove trees, rocks, grass): gap under the base on slopes
  const vil=[];try{VIL.forEach((V,vi)=>{const P=V.geo.attributes.position;let mn=1e9,mx=-1e9;for(let i=0;i<P.count;i++){mn=Math.min(mn,P.getY(i));mx=Math.max(mx,P.getY(i))}
    const lo=new Map();for(let i=0;i<P.count;i++)if(P.getY(i)<=mn+Math.max(.03,(mx-mn)*.07)){const k=Math.round(P.getX(i)*50)+','+Math.round(P.getZ(i)*50),q=lo.get(k);if(!q||P.getY(i)<q[1])lo.set(k,[P.getX(i),P.getY(i),P.getZ(i)])}
    const L=[...lo.values()],M4=new THREE.Matrix4();let nf=0,gm=0,w=null;for(let i=0;i<V.n;i++){M4.fromArray(V.M,i*16);const e=M4.elements;if(Math.abs(e[0])+Math.abs(e[1])+Math.abs(e[2])<1e-6)continue;const x=e[12],z=e[14];if(!insAt(Math.round(x),Math.round(z)))continue;
      let g=-1e9;for(const p of L){v.set(p[0],p[1],p[2]).applyMatrix4(M4);g=Math.max(g,v.y-GH(v.x,v.z))}if(g>.12){nf++;if(g>gm){gm=g;w=[Math.round(x),Math.round(z),MAP.DW[Math.round(z)*W+Math.round(x)]]}}}
    vil.push({vi,n:V.n,h:+(mx-mn).toFixed(2),near:!!V.near,nf,gm:+gm.toFixed(2),w})})}catch(e){vil.push(String(e))}
  return {vis:window.__vis,out,skipped,vil,ms:Math.round(performance.now()-t0),nobj:objs.length}}
