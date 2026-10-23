// v135: for every field instance, look round from points along its road just above the horizon and list large objects hit far away
(async()=>{const out={},rc=new THREE.Raycaster();rc.camera=cam;const V3=THREE.Vector3;
 const M=[];scene.traverse(o=>{if((o.isMesh||o.isInstancedMesh)&&!o.isSkinnedMesh)M.push(o)});
 const name=o=>{const L=[];for(let p=o;p&&p!==scene;p=p.parent)L.push((p.name||p.type)+(p.userData&&Object.keys(p.userData).length?'{'+Object.keys(p.userData).slice(0,4).join(',')+'}':''));return L.slice(0,4).join('<')};
 for(const I of INSL){if(!I.fld)continue;const hits={};
  for(const k of [16,Math.floor(I.path.length/2),I.path.length-20]){const q=I.path[Math.max(0,Math.min(I.path.length-1,k))],y=GH(q[0],q[1])+2.5,o=new V3(q[0],y,q[1]);
   for(let a=0;a<24;a++)for(const el of [.06,.16,.3]){const d=new V3(Math.sin(a/24*6.283)*Math.cos(el),Math.sin(el),Math.cos(a/24*6.283)*Math.cos(el));rc.set(o,d);rc.far=600;
    let I2=[];try{I2=rc.intersectObjects(M,false)}catch(_){}const h=I2.find(x=>x.object.visible);if(!h||h.distance<45)continue;
    const b=new THREE.Box3().setFromObject(h.object),sz=b.getSize(new V3());const key=name(h.object);
    const hi=hits[key]||(hits[key]={n:0,dist:0,size:[sz.x,sz.y,sz.z].map(v=>+v.toFixed(0)),pt:[h.point.x,h.point.y,h.point.z].map(v=>+v.toFixed(0)),ins:(()=>{const J=insAt(Math.round(h.point.x),Math.round(h.point.z));return J?J.n:'void/none'})()});hi.n++;hi.dist=Math.max(hi.dist,+h.distance.toFixed(0))}}
  out[I.n]=hits}
 return out})()
