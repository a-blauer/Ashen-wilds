// v114 armour clipping check (injected by test/v114_clip.py). Builds a hero (class animal + items) with every triangle
// tagged: which builder made it (body / helm / chest / boots / outfit / cape / amulet / ring) and the axis point it was built
// around (the ring centre line of its loft, or the centre of its rigid part), so each triangle knows its outward direction.
//  * poke: a body triangle with armour just beneath its surface (inward ray hits armour)  -> fur shows through the gear
//  * hide: an armour triangle with body just above its surface (outward ray hits body)     -> gear buried in the body
// Checked in the bind pose (before the v99 warp, the same space for body and armour) and in posed frames (CPU skinning).
window.CLIP={
  lab:'body',tags:null,ax:null,R:null,
  hook(){if(CLIP._h)return;CLIP._h=1;const W=window;
    const lab=(n,l)=>{const f=W[n];W[n]=function(){const o=CLIP.lab;CLIP.lab=l;try{return f.apply(this,arguments)}finally{CLIP.lab=o}}};
    ['mdBody','mdHead','brPaws','brTail','brShoulders','brToes'].forEach(n=>lab(n,'body'));
    lab('mdHelm','helm');lab('mdChest','chest');lab('mdBoots','boots');lab('mdCape','cape');lab('mdAmulet','amulet');lab('mdRingW','ring');
    {const f=W.mdLoft;W.mdLoft=function(B,R,o){const oR=CLIP.R,oA=CLIP.ax,oS=CLIP.sub;CLIP.R=R;CLIP.ax=null;CLIP.sub='loft'+R.length;try{return f.apply(this,arguments)}finally{CLIP.R=oR;CLIP.ax=oA;CLIP.sub=oS}}}
    {const f=W.mdKit;W.mdKit=function(B,k){if(!CLIP.tags)return f.apply(this,arguments);const G=dkG(),gn=g=>{for(const n in G)if(G[n]===g)return n;return 'taper'};for(const p of k.P){const e=p.m.elements,oA=CLIP.ax,oR=CLIP.R,oS=CLIP.sub;CLIP.ax=[e[12],e[13],e[14]];CLIP.R=null;CLIP.sub=gn(p.geo)+'@'+e[12].toFixed(2)+','+e[13].toFixed(2)+','+e[14].toFixed(2);try{f.call(this,B,{P:[p]})}finally{CLIP.ax=oA;CLIP.R=oR;CLIP.sub=oS}}}}
    {const f=W.mdTri;W.mdTri=function(B,t,a,b,c,col){const r=f.apply(this,arguments);if(CLIP.tags&&B.__clip){const key=B.L[t]?t:'c';
        const cx=(a.x+b.x+c.x)/3,cy=(a.y+b.y+c.y)/3,cz=(a.z+b.z+c.z)/3;let A=CLIP.ax;
        if(!A&&CLIP.R){const R=CLIP.R;let best=1e9;for(let i=0;i+1<R.length;i++){const p=R[i].p,q=R[i+1].p,dx=q[0]-p[0],dy=q[1]-p[1],dz=q[2]-p[2],L2=dx*dx+dy*dy+dz*dz||1e-9;
            let u=((cx-p[0])*dx+(cy-p[1])*dy+(cz-p[2])*dz)/L2;u=Math.max(0,Math.min(1,u));const X=p[0]+dx*u,Y=p[1]+dy*u,Z=p[2]+dz*u,d=(cx-X)**2+(cy-Y)**2+(cz-Z)**2;if(d<best){best=d;A=[X,Y,Z]}}
          if(R.length==1)A=R[0].p.slice()}
        (B.__clip[key]||(B.__clip[key]=[])).push({l:CLIP.lab,a:A||[cx,cy,cz],u:CLIP.sub})}return r}}
    {const f=W.mdHeroB;W.mdHeroB=function(){const o=CLIP.lab;CLIP.lab='outfit';try{return f.apply(this,arguments)}finally{CLIP.lab=o}}}
    {const f=W.mdB;W.mdB=function(){const B=f.apply(this,arguments);if(CLIP.tags)B.__clip={};return B}}},
  // build (bind pose, pre-warp): returns triangles [{v:[9 numbers], l, a, w:[bone weights of vertex 0]}]
  build(cls,E,look){CLIP.hook();CLIP.tags=1;let B;const keep=BR_CLS[cls];if(CLIP.human)delete BR_CLS[cls];try{const D=BRD[keep],L=Object.assign({skin:D.fur[2]||D.fur[0],eye:D.eye[0],build:1,height:1,race:D.id},look||{});const LN=mdLookN(L,cls);if(CLIP.human){LN.race=0;LN.skin=0xc8a080}B=mdHeroB(cls,LN,E||{})}finally{CLIP.tags=null;BR_CLS[cls]=keep}
    const T=[];for(const t in B.L){const L=B.L[t],tg=(B.__clip||{})[t]||[],n=L.p.length/9;for(let i=0;i<n;i++){const g=tg[i]||{l:'?',a:null};T.push({v:L.p.slice(i*9,i*9+9),l:g.l,a:g.a,u:g.u,si:L.si.slice(i*12,i*12+4),sw:L.sw.slice(i*12,i*12+4),t})}}
    return {T,B}},
  // uniform grid over triangles
  grid(T,cs){const G=new Map(),k=(x,y,z)=>x+','+y+','+z;T.forEach((tr,i)=>{const v=tr.v;let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;for(let j=0;j<9;j+=3){x0=Math.min(x0,v[j]);x1=Math.max(x1,v[j]);y0=Math.min(y0,v[j+1]);y1=Math.max(y1,v[j+1]);z0=Math.min(z0,v[j+2]);z1=Math.max(z1,v[j+2])}
      for(let x=Math.floor(x0/cs);x<=Math.floor(x1/cs);x++)for(let y=Math.floor(y0/cs);y<=Math.floor(y1/cs);y++)for(let z=Math.floor(z0/cs);z<=Math.floor(z1/cs);z++){const kk=k(x,y,z);let a=G.get(kk);if(!a)G.set(kk,a=[]);a.push(i)}});return {G,cs,k}},
  // segment o → o+d·len against the grid triangles: nearest hit distance or -1
  ray(g,T,o,d,len){const cs=g.cs,seen=new Set();let best=-1;const steps=Math.ceil(len/(cs*.5))+1;
    for(let s=0;s<=steps;s++){const t=len*s/steps,x=Math.floor((o[0]+d[0]*t)/cs),y=Math.floor((o[1]+d[1]*t)/cs),z=Math.floor((o[2]+d[2]*t)/cs);const a=g.G.get(g.k(x,y,z));if(!a)continue;
      for(const i of a){if(seen.has(i))continue;seen.add(i);const h=CLIP.tri(o,d,T[i].v);if(h>.0015&&h<=len&&(best<0||h<best))best=h}}return best},
  tri(o,d,v){const e1=[v[3]-v[0],v[4]-v[1],v[5]-v[2]],e2=[v[6]-v[0],v[7]-v[1],v[8]-v[2]],p=[d[1]*e2[2]-d[2]*e2[1],d[2]*e2[0]-d[0]*e2[2],d[0]*e2[1]-d[1]*e2[0]],det=e1[0]*p[0]+e1[1]*p[1]+e1[2]*p[2];
    if(Math.abs(det)<1e-12)return -1;const id=1/det,s=[o[0]-v[0],o[1]-v[1],o[2]-v[2]],u=(s[0]*p[0]+s[1]*p[1]+s[2]*p[2])*id;if(u<0||u>1)return -1;
    const q=[s[1]*e1[2]-s[2]*e1[1],s[2]*e1[0]-s[0]*e1[2],s[0]*e1[1]-s[1]*e1[0]],w=(d[0]*q[0]+d[1]*q[1]+d[2]*q[2])*id;if(w<0||u+w>1)return -1;return (e2[0]*q[0]+e2[1]*q[1]+e2[2]*q[2])*id},
  // the check on a set of triangles (positions in T[i].v, axis points in T[i].a)
  check(T,o){o=o||{};const len=o.len||.03,body=[],arm=[];T.forEach((t,i)=>{if(t.l=='body')body.push(i);else arm.push(i)});
    const TA=arm.map(i=>T[i]),TB=body.map(i=>T[i]),gA=CLIP.grid(TA,.03),gB=CLIP.grid(TB,.03),res={poke:{},hide:{},nPoke:0,nHide:0,samples:[]},bn=HB?Object.keys(o.bones||HB):[];
    const dom=t=>{let j=0;for(let k=1;k<4;k++)if(t.sw[k]>t.sw[j])j=k;return (o.names||bn)[t.si[j]]||'?'};
    const cen=v=>[(v[0]+v[3]+v[6])/3,(v[1]+v[4]+v[7])/3,(v[2]+v[5]+v[8])/3];
    const out=(c,a)=>{const d=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],L=Math.hypot(d[0],d[1],d[2]);return L<1e-6?null:[d[0]/L,d[1]/L,d[2]/L,L]};
    TB.forEach(t=>{const c=cen(t.v),u=out(c,t.a);if(!u)return;const L=Math.min(len,u[3]*.6),h=CLIP.ray(gA,TA,c,[-u[0],-u[1],-u[2]],L);
      if(h>0){const k=dom(t);res.poke[k]=(res.poke[k]||0)+1;res.nPoke++;if(k=='head'){res.sub=res.sub||{};res.sub[t.u]=(res.sub[t.u]||0)+1}if(res.samples.length<400)res.samples.push(['poke',k,c.map(x=>+x.toFixed(3))])}});
    TA.forEach(t=>{const c=cen(t.v),u=out(c,t.a);if(!u)return;const h=CLIP.ray(gB,TB,c,[u[0],u[1],u[2]],len);
      if(h>0){const k=t.l+':'+dom(t);res.hide[k]=(res.hide[k]||0)+1;res.nHide++;if(res.samples.length<400)res.samples.push(['hide',k,c.map(x=>+x.toFixed(3))])}});
    res.nBody=TB.length;res.nArm=TA.length;return res},
  // posed: CPU-skin every triangle vertex and axis point with the model's skeleton in its current pose
  posed(h,T){const body=huBody(h),sk=body.skeleton;sk.update();const bm=sk.boneMatrices,BI=body.bindMatrix,BIi=body.bindMatrixInverse,v=new THREE.Vector3(),s=new THREE.Vector3(),M=new THREE.Matrix4(),tmp=new THREE.Vector3();
    const skin=(x,y,z,si,sw)=>{v.set(x,y,z).applyMatrix4(BI);s.set(0,0,0);for(let k=0;k<4;k++){const w=sw[k];if(!w)continue;M.fromArray(bm,si[k]*16);tmp.copy(v).applyMatrix4(M).multiplyScalar(w);s.add(tmp)}s.applyMatrix4(BIi);return [s.x,s.y,s.z]};
    return T.map(t=>{const p=[];for(let j=0;j<3;j++){const q=skin(t.v[j*3],t.v[j*3+1],t.v[j*3+2],t.si,t.sw);p.push(q[0],q[1],q[2])}const a=t.a?skin(t.a[0],t.a[1],t.a[2],t.si,t.sw):null;return Object.assign({},t,{v:p,a})})},
  // warp the bind-pose triangles the way mdBake does (v99 + race plan), so they match the skinned geometry
  warp(B,T){const pl=AW_PROP99.plan(B.bones,B.kqPre),L={p:[],si:[],sw:[]};T.forEach(t=>{for(let j=0;j<3;j++){L.p.push(t.v[j*3],t.v[j*3+1],t.v[j*3+2]);L.si.push(...t.si);L.sw.push(...t.sw)}if(t.a){L.p.push(...t.a);L.si.push(...t.si);L.sw.push(...t.sw)}});
    const fake={L:{x:L},bones:B.bones,kqPre:B.kqPre,kqDone:0};const keep=AW_PROP99;// reuse the module's warp through mdBake's hook
    (function(){const P=L.p,I=pl.idx,mul=(M,x,y,z)=>[M[0]*x+M[1]*y+M[2]*z,M[3]*x+M[4]*y+M[5]*z,M[6]*x+M[7]*y+M[8]*z],n=P.length/3;
      for(let v=0;v<n;v++){const x=P[v*3],y=P[v*3+1],z=P[v*3+2];let X=0,Y=0,Z=0,W=0;for(let j=0;j<4;j++){const w=L.sw[v*4+j];if(!(w>0))continue;const b=I[L.si[v*4+j]];if(!b)continue;const o=mul(b.M,x-b.a[0],y-b.a[1],z-b.a[2]);X+=w*(b.n[0]+o[0]);Y+=w*(b.n[1]+o[1]);Z+=w*(b.n[2]+o[2]);W+=w}
        if(W>0){P[v*3]=X/W;P[v*3+1]=Y/W;P[v*3+2]=Z/W}}})();
    let k=0;return T.map(t=>{const v=L.p.slice(k,k+9);k+=9;let a=null;if(t.a){a=L.p.slice(k,k+3);k+=3}return Object.assign({},t,{v,a})})}
};
// debug picture: the model in its idle pose with every poke (red) and hide (yellow) point of the posed idle check marked
CLIP.shot=function(cls,E,views){const D=brOf(cls),h=buildHero();h.mdLook={skin:D.fur[2]||D.fur[0],eye:D.eye[0],build:1,height:1,race:D.id};refreshGear(h,cls,E);
  let Tm=7e5;for(let t=0;t<900;t+=16){Tm+=16;animHero(Tm,false,h);h.position.set(0,0,0)}if(CLIP.poseMv){if(!V100A.T.sword0)V100A_build();const PT=V100A.T[CLIP.poseMv](CLIP.poseK);for(const c in PT){const ch=HACH[c];if(ch&&h.bones[ch[0]])h.bones[ch[0]].rotation[ch[1]]=PT[c]}}h.updateMatrixWorld(true);
  const {T,B}=CLIP.build(cls,E),P=CLIP.posed(h,CLIP.warp(B,T)),r=CLIP.check(P,{names:B.O});
  const FW=330,FH=330,rd=CLIP.rd||(CLIP.rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true}));rd.setSize(FW,FH);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x2c3036);sc.add(new THREE.HemisphereLight(0xc8d0dc,0x3a3028,.9));const dl=new THREE.DirectionalLight(0xfff0d8,1);dl.position.set(2,4,4);sc.add(dl);sc.add(h);
  h.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh)o.visible=false});
  const g=new THREE.SphereGeometry(.006,6,4),mr=new THREE.MeshBasicMaterial({color:0xff2020,depthTest:false}),my=new THREE.MeshBasicMaterial({color:0xffe000,depthTest:false});
  r.samples.forEach(s=>{const m=new THREE.Mesh(g,s[0]=='poke'?mr:my);m.position.set(...s[2]);m.renderOrder=9;sc.add(m)});
  const pc=new THREE.PerspectiveCamera(26,1,.01,50),cnv=document.createElement('canvas');cnv.width=FW*views.length;cnv.height=FH;const x=cnv.getContext('2d');
  views.forEach((v,i)=>{const c=new THREE.Vector3(...v.c),d=new THREE.Vector3(...v.d).normalize().multiplyScalar(v.r);pc.position.copy(c).add(d);pc.lookAt(c);rd.render(sc,pc);x.drawImage(rd.domElement,i*FW,0)});
  return {img:cnv.toDataURL('image/jpeg',.9),n:[r.nPoke,r.nHide],poke:r.poke,hide:r.hide,sub:r.sub,smp:r.samples.filter(x=>/amulet|ring|aR2|chest:chest|chest:aR0|helm/.test(x[1])).slice(0,60)}};
