// helpers injected by limbs_*.py: build every creature model and find parts that touch nothing
window.LB={
 list(){
  const L=[];Object.keys(SP2).forEach(n=>L.push(['sp',n]));
  Object.keys(EN).forEach(k=>{if(!EN[k].hum&&!/^boss/.test(k))L.push(['en',k])});
  (typeof BOSSES!='undefined'?BOSSES:[]).forEach((d,i)=>{if(!d.hum&&d.sp)L.push(['bs',i+':'+d.sp])});
  if(typeof MOUNTS!='undefined'&&typeof mkMountRig=='function')Object.keys(MOUNTS).forEach(k=>L.push(['mt',k]));
  if(window.LB_VT){const V=[['Ember','Horned'],['Frost','Spiked'],['Golden','Armored'],['Shadow','Universal']];['Foxlet','Ashwolf','Boneling','Stoneshell','Mossfrog','Batwing','Skyhawk','Drakelet','Gravewyrm','Cryptspider','Gloomcap','Wispling'].forEach(n=>V.forEach(v=>L.push(['vt',n+'|'+v[0]+'|'+v[1]])))}
  return L;
 },
 make(ty,k){
  if(ty=='sp')return cr(mkC(k,10,0,''));
  if(ty=='vt'){const [n,v,tr]=k.split('|'),c=mkC(n,10,0,v);c.v=v;c.tr=tr;return cr(c)}
  if(ty=='en')return cr(enemyC(k,10,{}));
  if(ty=='bs'){const i=+k.split(':')[0],d=BOSSES[i],key='lbBoss'+i;EN[key]={n:d.name,e:'x',rig:d.sp,col:d.bc||d.col||0x888888,w:{hp:1,pa:1,ma:1,pd:1,md:1},mt:'p',moves:[],fam:famOf(d.sp)};S[key]=S[key]||{e:'x',c:d.col||0x888888};MSET[key]=[];const c=enemyC(key,30,{boss:1});return cr(c)}
  return mkMountRig(k);
 },
 pose(m,p){const now=p==2?5237:p==1?4321:0;try{if(m.rig)m.rig(now,!!p,p?3:0);else animC0(m,now,!!p,p?3:0)}catch(e){}},
 hook(){ if(window.__lbHook)return;window.__lbHook=1;
  const ob=bakeMesh;bakeMesh=function(parts,O,key,basic){const m=ob.apply(this,arguments);if(m){const list=parts.filter(p=>!!p.basic==basic);let off=0;m.userData.lbParts=list.map(p=>{let geo=p.geo;if(Math.max(p.sx,p.sy,p.sz)<.05)geo=geo===RS?RSL:geo===RC?RCL:geo===RY?RYL:geo;const n=geo.attributes.position.count,r={p:p,v0:off,n:n};off+=n;return r})}return m};
  // dkBake: remember which vertices belong to which kit part (per geometry)
  window.LBGP=new WeakMap();const od=dkBake;dkBake=function(P,O,key){const ms=od.apply(this,arguments);try{if(P&&P.length){const by={};P.forEach(p=>(by[p.t]=by[p.t]||[]).push(p));ms.forEach(m=>{if(LBGP.has(m.geometry))return;for(const t in by){let n=0;by[t].forEach(p=>n+=p.geo.attributes.position.count);if(n==m.geometry.attributes.position.count&&!LBGP.has(m.geometry)){let off=0;const v=new THREE.Vector3();LBGP.set(m.geometry,by[t].map(p=>{const c=p.geo.attributes.position.count,r={p:p,v0:off,n:c,at:v.setFromMatrixPosition(p.m).toArray()};off+=c;return r}));break}}})}}catch(e){console.error('lbhook',e)}return ms};
  // lpGeo: vertex range per loft
  const og=lpGeo;lpGeo=function(key,n,lofts){const G=og.apply(this,arguments);if(!G.userData.lbLofts){let off=0;G.userData.lbLofts=lofts.map((L,i)=>{const c=L.rings.length*(L.seg||8)+(L.capA?1:0)+(L.capB?1:0),r={v0:off,n:c,b:L.rings.map(r=>r.b[0]).filter((v,j,a)=>a.indexOf(v)==j).join(',')};off+=c;return r})}return G};
  for(const k in DKBK||{})if(/^LP/.test(k))delete DKBK[k];for(const k in LPG)delete LPG[k];for(const k in BK)delete BK[k];
 },
 // world-space triangle soup of a mesh, split into nodes
 nodes(g){
  const out=[],v=new THREE.Vector3(),inv=new THREE.Matrix4().copy(g.matrixWorld).invert();
  g.traverse(o=>{
   if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;if(o.visible===false)return;
   let vis=true;o.traverseAncestors(a=>{if(a.visible===false)vis=false});if(!vis)return;
   if(o.isSprite||o.isPoints||o.isLine)return;
   const G=o.geometry,P=G.attributes.position,N=P.count,W=new Float32Array(N*3);
   for(let i=0;i<N;i++){v.fromBufferAttribute(P,i);if(o.isSkinnedMesh)o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld).applyMatrix4(inv);W[i*3]=v.x;W[i*3+1]=v.y;W[i*3+2]=v.z}
   const I=G.index?G.index.array:null,T=I?I.length:N;
   const mk=(name,info,a,b,c0,c1)=>({name,info,W,I,t0:a,t1:b,vmin:c0,vmax:c1,mesh:o});
   const hx=c=>'#'+new THREE.Color(c).getHexString(),R3=a=>a.map(x=>+(+x).toFixed(3));
   if(o.userData.lbParts){o.userData.lbParts.forEach(r=>{const p=r.p;out.push(mk('part',{bn:p.bn,col:hx(p.col),at:R3([p.x,p.y,p.z]),sc:R3([p.sx,p.sy,p.sz]),geo:p.geo.type,basic:!!p.basic},0,T,r.v0,r.v0+r.n))})}
   else if(LBGP.has(G)){LBGP.get(G).forEach(r=>{const p=r.p;out.push(mk('kit',{bn:p.bn,col:hx(p.col),at:R3(r.at),geo:p.geo.type||'',t:p.t},0,T,r.v0,r.v0+r.n))})}
   else if(G.userData.lbLofts){G.userData.lbLofts.forEach((L,li)=>out.push(mk(li?'loft':'body',{loft:li,b:L.b},0,T,L.v0,L.v0+L.n)))}
   else{let nm=o.name||'';let a=o;while(!nm&&a.parent&&a!==g){a=a.parent;nm=a.name||''}out.push(mk(o.isSkinnedMesh?'skin':'mesh',{geo:G.type,col:o.material&&o.material.color?'#'+o.material.color.getHexString():'',name:nm,par:o.parent&&o.parent.parent&&o.parent.parent.isBone?'bone':'',at:o.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv).toArray().map(x=>+x.toFixed(3))},0,T,0,N))}
  });
  return out;
 },
 // sample surface points of a node (filtered to its vertex range) at spacing h
 pts(nd,h){const W=nd.W,I=nd.I,res=[];const T=I?I.length:W.length/3;
  for(let t=0;t<T;t+=3){const a=I?I[t]:t,b=I?I[t+1]:t+1,c=I?I[t+2]:t+2;if(a<nd.vmin||a>=nd.vmax)continue;
   const A=[W[a*3],W[a*3+1],W[a*3+2]],B=[W[b*3],W[b*3+1],W[b*3+2]],C=[W[c*3],W[c*3+1],W[c*3+2]],e=Math.max(Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2]),Math.hypot(A[0]-C[0],A[1]-C[1],A[2]-C[2]),Math.hypot(C[0]-B[0],C[1]-B[1],C[2]-B[2])),n=Math.min(40,Math.max(1,Math.ceil(e/h)));
   for(let i=0;i<=n;i++)for(let j=0;j<=n-i;j++){const u=i/n,w=j/n,z=1-u-w;res.push(A[0]*z+B[0]*u+C[0]*w,A[1]*z+B[1]*u+C[1]*w,A[2]*z+B[2]*u+C[2]*w)}}
  return res},
 // connected components by surface proximity; returns nodes not connected to the body
 check(g,thr){thr=thr||.03;const h=thr*.6;g.updateMatrixWorld(true);const sc=g.scale.x;const nodes=this.nodes(g);
  const grid=new Map(),key=(x,y,z)=>x+','+y+','+z,cs=thr;const par=nodes.map((_,i)=>i),f=i=>{while(par[i]!=i)i=par[i]=par[par[i]];return i},un=(a,b)=>{a=f(a);b=f(b);if(a!=b)par[a]=b};
  const P=nodes.map(n=>this.pts(n,h*sc));
  nodes.forEach((n,i)=>{const p=P[i];for(let k=0;k<p.length;k+=3){const kk=key(Math.floor(p[k]/(cs*sc)),Math.floor(p[k+1]/(cs*sc)),Math.floor(p[k+2]/(cs*sc)));let a=grid.get(kk);if(!a)grid.set(kk,a=[]);a.push(i,p[k],p[k+1],p[k+2])}});
  const T2=(thr*sc)**2;
  nodes.forEach((n,i)=>{const p=P[i];for(let k=0;k<p.length;k+=3){const gx=Math.floor(p[k]/(cs*sc)),gy=Math.floor(p[k+1]/(cs*sc)),gz=Math.floor(p[k+2]/(cs*sc));
   for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){const a=grid.get(key(gx+dx,gy+dy,gz+dz));if(!a)continue;for(let q=0;q<a.length;q+=4){const j=a[q];if(j==i||f(j)==f(i))continue;const d=(a[q+1]-p[k])**2+(a[q+2]-p[k+1])**2+(a[q+3]-p[k+2])**2;if(d<T2)un(i,j)}}}});
  // main = component holding the body (or the biggest)
  let main=nodes.findIndex(n=>n.name=='body');if(main<0){let best=-1;nodes.forEach((n,i)=>{if(P[i].length>best){best=P[i].length;main=i}})}
  const mr=f(main);const bad=[];nodes.forEach((n,i)=>{if(f(i)!=mr)bad.push(Object.assign({kind:n.name,comp:f(i),npts:P[i].length/3},n.info))});
  return {n:nodes.length,bad};
 }
};
