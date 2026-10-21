// ---------- Effects ----------
const NP=700,pa=new Float32Array(NP*3),pcol=new Float32Array(NP*3),pv=new Float32Array(NP*3),pbase=new Float32Array(NP*3),plf=new Float32Array(NP),pmx=new Float32Array(NP).fill(1);let pix=0;
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pa,3));pg.setAttribute('color',new THREE.BufferAttribute(pcol,3));
const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:.4,map:SPR,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));pts.frustumCulled=false;scene.add(pts);
function burst(p,col,n,sp,up,life){
  const c=new THREE.Color(col);
  for(let i=0;i<n;i++){const j=pix++%NP,a=Math.random()*6.28,r=Math.random()*sp;
    pa.set([p.x,p.y,p.z],j*3);pv.set([Math.cos(a)*r,up*(.3+Math.random()),Math.sin(a)*r],j*3);pbase.set([c.r,c.g,c.b],j*3);plf[j]=pmx[j]=life*(.6+Math.random()*.4)}
}
function fxStep(dt){
  for(let j=0;j<NP;j++){
    if(plf[j]<=0){pcol[j*3]=pcol[j*3+1]=pcol[j*3+2]=0;continue}
    plf[j]-=dt;const k=Math.max(0,plf[j]/pmx[j]);
    for(let a=0;a<3;a++){pa[j*3+a]+=pv[j*3+a]*dt;pcol[j*3+a]=pbase[j*3+a]*k}
    pv[j*3+1]-=1.5*dt;
  }
  pg.attributes.position.needsUpdate=true;pg.attributes.color.needsUpdate=true;
}
const addMat=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
// one shared ring shape (it only scales); each ring's own material is freed when it fades out
var G_RING=null;
function ring(pos,col,r,ms){G_RING=G_RING||new THREE.RingGeometry(.4,.55,32);
  const m=new THREE.Mesh(G_RING,addMat(col));m.rotation.x=-Math.PI/2;m.position.copy(gY(pos,.12));scene.add(m);
  tw(ms,k=>{m.scale.setScalar(1+k*r);m.material.opacity=1-k},()=>{scene.remove(m);m.material.dispose()});
}
function arc(pos,d,col,r,ms){
  const g=new THREE.Group(),m=new THREE.Mesh(new THREE.RingGeometry(r*.55,r,20,1,-.9,1.8),addMat(col));
  m.rotation.x=-Math.PI/2;g.add(m);g.rotation.y=Math.atan2(-d.z,d.x);g.position.copy(gY(pos,.5));scene.add(g);
  tw(ms,k=>{m.material.opacity=1-k;g.scale.setScalar(.8+k*.4)},()=>{scene.remove(g);m.geometry.dispose();m.material.dispose()});
}
function bolt(a,b,col){
  for(let t=0;t<2;t++){
    const pts2=[];for(let i=0;i<=9;i++){const p=a.clone().lerp(b,i/9);if(i&&i<9){p.x+=(Math.random()-.5)*.8;p.z+=(Math.random()-.5)*.8;p.y+=(Math.random()-.5)*.4}pts2.push(p)}
    const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts2),new THREE.LineBasicMaterial({color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    scene.add(l);tw(240,k=>l.material.opacity=1-k,()=>{scene.remove(l);l.geometry.dispose();l.material.dispose()});
  }
}

