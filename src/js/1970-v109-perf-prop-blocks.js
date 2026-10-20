// ================= v109 perf_blocks: props drawn in 64x64 blocks instead of 32x32 chunks =================
// buildVI splits every prop type (VIL: rocks, tree parts, bushes, flowers...) into one InstancedMesh per 32x32-tile
// visibility chunk, so a view showing ~17 chunks drew each of ~19 prop types ~17 times: ~200 of a frame's ~350 draw
// calls. At load this file regroups each prop type's chunk meshes four at a time into one InstancedMesh per 64x64 block
// (the same instances, copied in the same order per chunk), so a view draws each type ~4-6 times.
//  * View distance stays per prop, not per block: the prop materials' wind shader (windMat) gets a cut-off. An instance
//    farther than uFar9 (= FARR + PB.pad tiles, set every frame) from the hero collapses to a point and draws nothing,
//    so the horizon is where it was (it no longer steps by whole 32-tile chunks).
//  * Gathering nodes, loot nodes and anything else that moves or hides one prop goes through VIL.setMatrixAt, which
//    uses v.cm / v.cl (mesh + index): those are remapped to the block mesh, so nothing else changes.
//  * Blocks are new CHL chunk records (box = the 64x64 block); chunkVis, the v106 instance filter (cvOK), the shadow
//    pass (1630) and the static containers (1640, psChunks) treat them like any other chunk. The near-only grass layer
//    (v.near) and the v89 decoration chunks (already 64x64, `c.wd`) are left as they are.
// PB.on=false before load keeps the 32x32 meshes (for A/B checks). PB.st: blocks made, meshes merged, draw calls saved.
var PB={on:typeof window=='undefined'||!window.AW_NOBLOCKS,N:64,pad:20,far:{value:124},st:{blocks:0,merged:0,types:0,skipped:0,ms:0}};
// the wind shader with a far cut-off (instanced meshes only); a separate program key so unpatched materials are unaffected
function pbFarMat(mat){if(!mat||mat.userData.far9)return;const ob=mat.onBeforeCompile;if(typeof ob!='function')return;mat.userData.far9=1;
  mat.onBeforeCompile=function(sh,r){ob.call(this,sh,r);sh.uniforms.uFar9=PB.far;sh.uniforms.uPl9=FADE.pl;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uFar9;uniform vec3 uPl9;').replace('#include <project_vertex>',`#ifdef USE_INSTANCING
    {vec4 ip9=modelMatrix*instanceMatrix[3];vec2 d9=ip9.xz-uPl9.xz;if(dot(d9,d9)>uFar9*uFar9)transformed=vec3(0.);}
    #endif
    #include <project_vertex>`)};
  const ck=mat.customProgramCacheKey,k0=ck?ck.call(mat):'';mat.customProgramCacheKey=()=>k0+'|far9';mat.needsUpdate=true}
// windMat called again later (e.g. a rebuilt prop type) keeps the cut-off
{const f=windMat;windMat=function(mat){const had=mat&&mat.userData&&mat.userData.far9;if(had)mat.userData.far9=0;const r=f.apply(this,arguments);if(had)pbFarMat(mat);return r}}
function pbBuild(){if(!PB.on||typeof VIL=='undefined'||typeof CHL=='undefined')return 0;const T0=performance.now(),N=PB.N;
  const own=new Map();for(const c of CHL){if(c.wd||c.pb)continue;for(const m of c.ms)own.set(m,c)}
  const blocks={};let types=0;
  VIL.forEach(v=>{if(v.near||!v.cm||!v.n)return;const ms=[...new Set(v.cm)].filter(m=>m&&own.has(m));if(ms.length<2)return;
    // a mesh whose draw count was changed by other code is left alone (its hidden tail would show if merged)
    if(ms.some(m=>m.count!==m.instanceMatrix.count||m.geometry!==v.geo||m.material!==v.material)){PB.st.skipped++;return}
    const grp={};ms.forEach(m=>{const b=own.get(m).box,k=Math.floor((b.min.z+2)/N)*1000+Math.floor((b.min.x+2)/N);(grp[k]=grp[k]||[]).push(m)});
    let any=false;
    for(const k in grp){const L=grp[k];if(L.length<2)continue;any=true;
      let n=0;const off=new Map();L.forEach(m=>{off.set(m,n);n+=m.count});
      const nm=new THREE.InstancedMesh(v.geo,v.material,n),col=new Float32Array(n*3);
      L.forEach(m=>{const o=off.get(m);nm.instanceMatrix.array.set(m.instanceMatrix.array.subarray(0,m.count*16),o*16);if(m.instanceColor)col.set(m.instanceColor.array.subarray(0,m.count*3),o*3);else col.fill(1,o*3,(o+m.count)*3)});
      nm.instanceColor=new THREE.InstancedBufferAttribute(col,3);
      const m0=L[0];nm.castShadow=false;nm.receiveShadow=m0.receiveShadow;nm.frustumCulled=false;nm.visible=false;nm.renderOrder=m0.renderOrder;nm.userData=Object.assign({},m0.userData,{pb:1});
      nm.matrixAutoUpdate=false;nm.updateMatrix();
      for(let i=0;i<v.n;i++){const o=off.get(v.cm[i]);if(o!==undefined){v.cl[i]=o+v.cl[i];v.cm[i]=nm}}
      const bx=Math.floor(k%1000),bz=Math.floor(k/1000);
      const B=blocks[k]||(blocks[k]={ms:[],ns:[],on:false,non:false,pb:1,box:new THREE.Box3(new THREE.Vector3(bx*N-2,-3,bz*N-2),new THREE.Vector3((bx+1)*N+2,40,(bz+1)*N+2))});
      B.ms.push(nm);
      L.forEach(m=>{const c=own.get(m),j=c.ms.indexOf(m);if(j>=0)c.ms.splice(j,1);if(m.parent)m.parent.remove(m);PB.st.merged++});
      scene.add(nm)}
    if(any){types++;pbFarMat(v.material)}});
  const add=Object.values(blocks);add.forEach(b=>CHL.push(b));PB.st.blocks=add.length;PB.st.types=types;
  // every chunk recomputes its visibility from scratch on the next chunkVis
  CHL.forEach(c=>{c.on=null;c.non=null});try{if(typeof CVG!='undefined')CVG.n=-1}catch(_){}
  try{if(typeof psChunks=='function')psChunks()}catch(e){console.warn('blocks psChunks',e)}
  PB.st.ms=Math.round(performance.now()-T0);return add.length}
try{pbBuild()}catch(e){console.warn('prop blocks',e);PB.st.err=String(e)}
// the cut-off follows the quality level's view distance
{const f=chunkVis;chunkVis=function(){PB.far.value=FARR+PB.pad;return f.apply(this,arguments)}}
