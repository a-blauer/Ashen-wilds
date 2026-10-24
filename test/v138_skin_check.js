// v138: every enemy kind (plain + elite) and every companion species/evolution: skinned meshes whose skin indices point past
// their skeleton's bones, weights that don't sum to 1, or vertices that skin to NaN. (The GPU reads garbage for those.)
(()=>{window.requestAnimationFrame=()=>0;POST.render=()=>{};window._vt=performance.now()+1e5;
  const STEP=n=>{for(let i=0;i<n;i++){_vt+=16;loop(_vt);scene.updateMatrixWorld()}};
  insArrive(INSL[insG(0,0)]);STEP(5);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});ROST.slots=[];
  const bad={},v=new THREE.Vector3();
  function chk(tag,g){g.updateMatrixWorld(true);g.traverse(o=>{if(!o.isSkinnedMesh)return;const G=o.geometry,SI=G.attributes.skinIndex,SW=G.attributes.skinWeight;if(!SI||!SW)return;
    const nb=o.skeleton.bones.length;let over=0,wbad=0,nan=0,mx=0,miss=0;
    for(let i=0;i<SI.count;i++){let s=0;for(let c=0;c<SI.itemSize;c++){const ix=SI.getComponent?SI.getComponent(i,c):SI.array[i*SI.itemSize+c],w=SW.getComponent?SW.getComponent(i,c):SW.array[i*SW.itemSize+c];s+=w;if(w>0){mx=Math.max(mx,ix);if(ix>=nb)over++;else if(!o.skeleton.bones[ix])miss++}}if(Math.abs(s-1)>.02)wbad++}
    const st=Math.max(1,Math.floor(G.attributes.position.count/200));for(let i=0;i<G.attributes.position.count;i+=st){v.fromBufferAttribute(G.attributes.position,i);try{o.boneTransform(i,v)}catch(_){nan++;continue}if(!isFinite(v.x+v.y+v.z))nan++}
    const bmOk=o.skeleton.boneMatrices.length>=nb*16;
    if(over||wbad||nan||miss||!bmOk)(bad[tag]=bad[tag]||[]).push({mesh:o.name||'',nb,mx,over,wbad,nan,miss,bmOk,verts:SI.count})})}
  const keys=Object.keys(EN).filter(k=>!k.startsWith('boss')&&(EN[k].rig||EN[k].hum));const p=pl.position;
  for(const al of [0,1])for(const k of keys){const e=spawnEnemy(k,p.x+4,p.z,20,{al});STEP(3);chk('E:'+k+(al?'*':''),e.m);removeE(e)}
  for(const n in SP2)for(let ev=0;ev<4;ev++){try{const c=mkC(n,20,0);c.evo=ev;const g=cr(c);chk('C:'+n+ev,g)}catch(x){bad['C:'+n+ev]=String(x).slice(0,100)}}
  return {n:Object.keys(bad).length,bad}})()
