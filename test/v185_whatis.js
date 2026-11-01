// v185 helper: what stands at given spots. opt.pts = [[x,z,r,label],...]. For each spot the hero is put there (lazy camps and
// set pieces get built), then the scattered decorations (WD) within r and every scene mesh whose bounds reach within r are listed:
// the top group's name, the mesh's name, geometry type and size, material type and colour, and a few code hints (userData keys).
async(opt)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms)),out=[],V=THREE.Vector3;
  const rootOf=o=>{let a=o,p=[];while(a.parent&&a.parent!==scene){p.push(a.name||'');a=a.parent}return {r:a,path:p.filter(Boolean).slice(0,3).join('<')}};
  for(const [x,z,r,lab] of opt.pts){toPos(x+.5,z+.5,0);for(let i=0;i<3;i++){await W8(150);try{rosterTick()}catch(_){}}try{loop(performance.now())}catch(_){}
    const R={lab,x,z,g:+GH(x,z).toFixed(2),ins:(insAt(x,z)||{}).n,wd:[],mesh:[]};
    WD.list.forEach(d=>{const dd=Math.hypot(d.x-x,d.z-z);if(dd<r)R.wd.push([d.k,+d.x.toFixed(1),+d.z.toFixed(1),+d.s.toFixed(2),d.h185||(d.st176&&d.st176.sx===0?'hid':'')])});
    const seen=new Map();
    scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.visible&&false)return;const g=o.geometry;if(!g||!g.attributes.position)return;if(!g.boundingSphere)g.computeBoundingSphere();o.updateWorldMatrix(true,false);
      const c=g.boundingSphere.center.clone().applyMatrix4(o.matrixWorld),rad=g.boundingSphere.radius*new V().setFromMatrixScale(o.matrixWorld).length()/1.732;
      if(Math.hypot(c.x-x,c.z-z)>r+rad||rad>80)return;const {r:rt,path}=rootOf(o),m=Array.isArray(o.material)?o.material[0]:o.material;
      if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox.clone().applyMatrix4(o.matrixWorld),sz=b.getSize(new V());
      const key=(rt.name||rt.type)+'|'+(o.name||'')+'|'+(m&&m.type)+'|'+(m&&m.color?m.color.getHexString():'')+'|'+g.type;const e=seen.get(key);
      if(e){e.n++;return}const it={root:rt.name||rt.type,path,name:o.name,geo:g.type,verts:g.attributes.position.count,mat:m&&m.type,col:m&&m.color?'#'+m.color.getHexString():null,vc:!!(m&&m.vertexColors),map:!!(m&&m.map),
        tr:!!(m&&m.transparent),op:m&&m.opacity,at:[+c.x.toFixed(1),+(c.y-GH(c.x,c.z)).toFixed(2),+c.z.toFixed(1)],size:[+sz.x.toFixed(2),+sz.y.toFixed(2),+sz.z.toFixed(2)],ud:Object.keys(o.userData||{}).slice(0,5).join(','),rud:Object.keys(rt.userData||{}).slice(0,6).join(','),n:1};
      seen.set(key,it);R.mesh.push(it)});
    R.mesh.sort((a,b)=>Math.hypot(a.at[0]-x,a.at[2]-z)-Math.hypot(b.at[0]-x,b.at[2]-z));R.mesh=R.mesh.slice(0,opt.max||40);out.push(R)}
  return out}
