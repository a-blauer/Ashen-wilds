// v176 test: every scattered decoration kind (WD) — parts that touch nothing above the ground — and every placed piece — the gap
// under its base (lowest point over each spot of its footprint). Run by v176_env.py.
async()=>{
  // Audit every WD decoration kind: detached parts in its model, base above 0, and per placed instance the gap under its base.
  const T=WD.T,res={kinds:{},nlist:WD.list.length};
  const comps=(geos)=>{ // geos: [{g,glow}] -> clusters of connected triangles, then clusters joined when bboxes touch
    const P=[],C=[];let off=0;const key=new Map();const par=[];const find=a=>{while(par[a]!==a){par[a]=par[par[a]];a=par[a]}return a};
    const tris=[];geos.forEach((p,pi)=>{const g=p.g,pos=g.attributes.position,idx=g.index;const n=idx?idx.count:pos.count;
      const vid=i=>{const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),k=Math.round(x*500)+','+Math.round(y*500)+','+Math.round(z*500);let v=key.get(k);if(v==null){v=P.length/3;P.push(x,y,z);key.set(k,v);par.push(v)}return v};
      for(let t=0;t<n;t+=3){const a=vid(idx?idx.getX(t):t),b=vid(idx?idx.getX(t+1):t+1),c=vid(idx?idx.getX(t+2):t+2);tris.push([a,b,c,pi]);par[find(a)]=find(b);par[find(b)]=find(c)}});
    const box={};for(const t of tris){const r=find(t[0]);const B=box[r]||(box[r]={mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9],n:0,glow:!!geos[t[3]].glow,part:t[3]});B.n++;for(let j=0;j<3;j++){const v=t[j];for(let a=0;a<3;a++){const q=P[v*3+a];if(q<B.mn[a])B.mn[a]=q;if(q>B.mx[a])B.mx[a]=q}}}
    const L=Object.values(box);return {L,P}};
  for(const k in T){const S=T[k];if(!S.parts||!S.parts.length)continue;const {L,P}=comps(S.parts);
    let mnY=1e9,mxY=-1e9,mnX=1e9,mxX=-1e9,mnZ=1e9,mxZ=-1e9;L.forEach(B=>{mnY=Math.min(mnY,B.mn[1]);mxY=Math.max(mxY,B.mx[1]);mnX=Math.min(mnX,B.mn[0]);mxX=Math.max(mxX,B.mx[0]);mnZ=Math.min(mnZ,B.mn[2]);mxZ=Math.max(mxZ,B.mx[2])});
    const size=Math.max(mxY-mnY,mxX-mnX,mxZ-mnZ),tol=Math.max(.012,size*.006);
    // join clusters by bbox overlap
    const n=L.length,pp=L.map((_,i)=>i),f=a=>{while(pp[a]!==a)a=pp[a]=pp[pp[a]];return a};
    const ov=(A,B)=>A.mn[0]<=B.mx[0]+tol&&B.mn[0]<=A.mx[0]+tol&&A.mn[1]<=B.mx[1]+tol&&B.mn[1]<=A.mx[1]+tol&&A.mn[2]<=B.mx[2]+tol&&B.mn[2]<=A.mx[2]+tol;
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(ov(L[i],L[j]))pp[f(i)]=f(j);
    const grp={};L.forEach((B,i)=>{const r=f(i);const G=grp[r]||(grp[r]={mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9],n:0,glow:true,c:0});G.n+=B.n;G.c++;G.glow=G.glow&&B.glow;for(let a=0;a<3;a++){G.mn[a]=Math.min(G.mn[a],B.mn[a]);G.mx[a]=Math.max(G.mx[a],B.mx[a])}});
    const GL=Object.values(grp);const ground=S.abs!=null?0:Math.max(0,mnY);
    const det=GL.filter(G=>G.mn[1]>Math.max(.05,mnY+Math.max(.03,size*.01))).map(G=>({tris:G.n,glow:G.glow,mn:G.mn.map(v=>+v.toFixed(2)),mx:G.mx.map(v=>+v.toFixed(2))}));
    let tris=0;S.parts.forEach(p=>{const g=p.g;tris+=(g.index?g.index.count:g.attributes.position.count)/3});
    // bottom vertices (for the slope check)
    const hh=mxY-mnY,ww=Math.max(mxX-mnX,mxZ-mnZ),ln=hh<ww*1.2,lm=new Map();for(let i=0;i<P.length;i+=3)if(P[i+1]<=mnY+Math.max(.03,hh*(ln?.2:.07))){const q=Math.round(P[i]*50)+','+Math.round(P[i+2]*50),o=lm.get(q);if(!o||P[i+1]<o[1])lm.set(q,[P[i],P[i+1],P[i+2]])}const low=[].concat(...lm.values());
    res.kinds[k]={tris,mnY:+mnY.toFixed(3),h:+(mxY-mnY).toFixed(2),w:+(mxX-mnX).toFixed(2),d:+(mxZ-mnZ).toFixed(2),y:S.y,abs:S.abs,sc:S.sc,s:S.s,near:S.near,det,low,n:0,gaps:[],sunk:[]}}
  // instances: the real instance matrices of each kind's first part
  const g2k=new Map();for(const k in T)if(T[k].parts&&T[k].parts[0])g2k.set(T[k].parts[0].g,k);const M4=new THREE.Matrix4(),v=new THREE.Vector3();res.hid={};
  for(const m of WD.ms){const k=g2k.get(m.geometry);if(!k)continue;const K=res.kinds[k],S=T[k];if(S.abs!=null||S.parts.some(p=>p.mat))continue;
    for(let j=0;j<m.count;j++){m.getMatrixAt(j,M4);const e=M4.elements;K.n++;if(Math.abs(e[0])+Math.abs(e[1])+Math.abs(e[2])<1e-6){const x=Math.round(e[12]),z=Math.round(e[14]);(res.hid[k]=res.hid[k]||[]).push([x,z,MAP.DW[z*W+x]]);continue}
      let mx=-1e9,mn=1e9;const L=K.low;for(let i=0;i<L.length;i+=3){v.set(L[i],L[i+1],L[i+2]).applyMatrix4(M4);const g=v.y-GH(v.x,v.z);if(g>mx)mx=g;if(g<mn)mn=g}
      const x=Math.round(e[12]),z=Math.round(e[14]);K.gaps.push([+mx.toFixed(2),+mn.toFixed(2),x,z,MAP.DW[z*W+x]])}}
  res.E=typeof ENV176!='undefined'?ENV176:null;
  for(const k in res.kinds){const K=res.kinds[k];delete K.low;const g=K.gaps.map(a=>a[0]).sort((a,b)=>a-b);K.gMax=g.length?g[g.length-1]:0;K.gP90=g.length?g[Math.floor(g.length*.9)]:0;K.gMed=g.length?g[Math.floor(g.length*.5)]:0;
    K.nFloat=K.gaps.filter(a=>a[0]>.12).length;K.worst=K.gaps.sort((a,b)=>b[0]-a[0]).slice(0,4);delete K.gaps;delete K.sunk}
  return res}
