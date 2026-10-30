// v178 gear audit (injected by test/v178_gear_audit.py, after v114_clip_lib.js).
// Floating pieces: the gear's triangles are split into connected pieces (vertices welded by position); a piece is attached when one
// of its vertices lies within GA.eps of another piece's (or the body's) surface, or one of its edges passes through another surface.
// Starting from the body (worn gear) or the grip (weapons), every piece reached through attached pieces is fine; the rest float.
// Posed frames reuse the bind pose's pieces, so a piece that comes away from what it sits on while the hero moves is found too.
window.GA={eps:.005,
  key(x,y,z){return Math.round(x*2500)+','+Math.round(y*2500)+','+Math.round(z*2500)},
  // pieces of the triangles whose index passes sel: comp[i] = piece id (or -1), n = count
  comps(T,sel){const par=[],find=a=>{while(par[a]!==a){par[a]=par[par[a]];a=par[a]}return a},uni=(a,b)=>{a=find(a);b=find(b);if(a!==b)par[a]=b};
    const V=new Map(),comp=new Int32Array(T.length).fill(-1);T.forEach((t,i)=>{par[i]=i;if(!sel(t,i))return;const v=t.v;for(let j=0;j<9;j+=3){const k=GA.key(v[j],v[j+1],v[j+2]),o=V.get(k);if(o==null)V.set(k,i);else uni(i,o)}});
    const id=new Map();let n=0;T.forEach((t,i)=>{if(!sel(t,i))return;const r=find(i);let c=id.get(r);if(c==null){c=n++;id.set(r,c)}comp[i]=c});return {comp,n}},
  // closest distance from point p to triangle v (9 numbers)
  ptTri(p,v){const ax=v[0],ay=v[1],az=v[2],abx=v[3]-ax,aby=v[4]-ay,abz=v[5]-az,acx=v[6]-ax,acy=v[7]-ay,acz=v[8]-az,apx=p[0]-ax,apy=p[1]-ay,apz=p[2]-az;
    const d1=abx*apx+aby*apy+abz*apz,d2=acx*apx+acy*apy+acz*apz;let qx,qy,qz;
    if(d1<=0&&d2<=0){qx=ax;qy=ay;qz=az}else{const bpx=p[0]-v[3],bpy=p[1]-v[4],bpz=p[2]-v[5],d3=abx*bpx+aby*bpy+abz*bpz,d4=acx*bpx+acy*bpy+acz*bpz;
      if(d3>=0&&d4<=d3){qx=v[3];qy=v[4];qz=v[5]}else{const vc=d1*d4-d3*d2;
        if(vc<=0&&d1>=0&&d3<=0){const w=d1/(d1-d3);qx=ax+abx*w;qy=ay+aby*w;qz=az+abz*w}else{const cpx=p[0]-v[6],cpy=p[1]-v[7],cpz=p[2]-v[8],d5=abx*cpx+aby*cpy+abz*cpz,d6=acx*cpx+acy*cpy+acz*cpz;
          if(d6>=0&&d5<=d6){qx=v[6];qy=v[7];qz=v[8]}else{const vb=d5*d2-d1*d6;
            if(vb<=0&&d2>=0&&d6<=0){const w=d2/(d2-d6);qx=ax+acx*w;qy=ay+acy*w;qz=az+acz*w}else{const va=d3*d6-d5*d4;
              if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0){const w=(d4-d3)/((d4-d3)+(d5-d6));qx=v[3]+(v[6]-v[3])*w;qy=v[4]+(v[7]-v[4])*w;qz=v[5]+(v[8]-v[5])*w}
              else{const dn=1/(va+vb+vc),vv=vb*dn,ww=vc*dn;qx=ax+abx*vv+acx*ww;qy=ay+aby*vv+acy*ww;qz=az+abz*vv+acz*ww}}}}}}
    return Math.hypot(p[0]-qx,p[1]-qy,p[2]-qz)},
  // links between pieces: L[c] = Set of piece ids it touches (-2 = the body / anchor)
  links(T,C,isAnchor,eps){eps=eps||GA.eps;const g=CLIP.grid(T,.02),L=[];for(let c=0;c<C.n;c++)L.push(new Set());
    const owner=i=>C.comp[i]>=0?C.comp[i]:(isAnchor(T[i],i)?-2:-3);
    const byC=[];T.forEach((t,i)=>{const c=C.comp[i];if(c>=0)(byC[c]=byC[c]||[]).push(i)});
    const near=(p,c,acc)=>{const cs=g.cs,x0=Math.floor((p[0]-eps)/cs),x1=Math.floor((p[0]+eps)/cs),y0=Math.floor((p[1]-eps)/cs),y1=Math.floor((p[1]+eps)/cs),z0=Math.floor((p[2]-eps)/cs),z1=Math.floor((p[2]+eps)/cs);
      for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++){const a=g.G.get(g.k(x,y,z));if(!a)continue;for(const i of a){const o=owner(i);if(o===c||o===-3||acc.has(o))continue;if(GA.ptTri(p,T[i].v)<=eps)acc.add(o)}}};
    for(let c=0;c<C.n;c++){const acc=L[c],seen=new Set();for(const i of byC[c]){const v=T[i].v;for(let j=0;j<9;j+=3){const k=GA.key(v[j],v[j+1],v[j+2]);if(seen.has(k))continue;seen.add(k);near([v[j],v[j+1],v[j+2]],c,acc)}
        // centroid too (big flat triangles lying on a surface)
        near([(v[0]+v[3]+v[6])/3,(v[1]+v[4]+v[7])/3,(v[2]+v[5]+v[8])/3],c,acc)}
      if(acc.size)continue;
      // edges through another surface
      for(const i of byC[c]){const v=T[i].v;for(const [a,b] of [[0,3],[3,6],[6,0]]){const o=[v[a],v[a+1],v[a+2]],d=[v[b]-v[a],v[b+1]-v[a+1],v[b+2]-v[a+2]],len=Math.hypot(d[0],d[1],d[2]);if(len<1e-6)continue;
          const u=[d[0]/len,d[1]/len,d[2]/len],cs=g.cs,steps=Math.ceil(len/(cs*.5))+1,sn=new Set();
          for(let s=0;s<=steps;s++){const t=len*s/steps,a2=g.G.get(g.k(Math.floor((o[0]+u[0]*t)/cs),Math.floor((o[1]+u[1]*t)/cs),Math.floor((o[2]+u[2]*t)/cs)));if(!a2)continue;
            for(const q of a2){if(sn.has(q))continue;sn.add(q);const ow=owner(q);if(ow===c||ow===-3)continue;const h=CLIP.tri(o,u,T[q].v);if(h>=0&&h<=len)acc.add(ow)}}}}}
    for(let c=0;c<C.n;c++)L[c].forEach(o=>{if(o>=0)L[o].add(c)});return L},
  // pieces not reached from the anchor; groups of floating pieces that touch each other are one cluster
  floating(L,n){const ok=new Uint8Array(n),q=[];for(let c=0;c<n;c++)if(L[c].has(-2)){ok[c]=1;q.push(c)}
    while(q.length){const c=q.pop();L[c].forEach(o=>{if(o>=0&&!ok[o]){ok[o]=1;q.push(o)}})}
    const cl=[],done=new Uint8Array(n);for(let c=0;c<n;c++){if(ok[c]||done[c])continue;const g=[c];done[c]=1;for(let j=0;j<g.length;j++)L[g[j]].forEach(o=>{if(o>=0&&!ok[o]&&!done[o]){done[o]=1;g.push(o)}});cl.push(g)}return cl},
  // describe a cluster: size, centre, labels, the gap to the nearest other surface (searched up to 6 cm)
  describe(T,C,g,isAnchor){const S=new Set(g),idx=[];T.forEach((t,i)=>{if(S.has(C.comp[i]))idx.push(i)});const b=[1e9,1e9,1e9,-1e9,-1e9,-1e9],lab={};let nv=0;
    idx.forEach(i=>{const v=T[i].v;for(let j=0;j<9;j+=3)for(let a=0;a<3;a++){b[a]=Math.min(b[a],v[j+a]);b[a+3]=Math.max(b[a+3],v[j+a])}const k=T[i].l+(T[i].u?' '+T[i].u:'');lab[k]=(lab[k]||0)+1});
    const sz=Math.hypot(b[3]-b[0],b[4]-b[1],b[5]-b[2]),c=[(b[0]+b[3])/2,(b[1]+b[4])/2,(b[2]+b[5])/2];
    // gap: from a sample of the cluster's vertices to any triangle outside it
    let gap=1;const R=.06,cand=[];T.forEach((t,i)=>{if(S.has(C.comp[i]))return;const v=t.v;for(let j=0;j<9;j+=3)if(v[j]>b[0]-R&&v[j]<b[3]+R&&v[j+1]>b[1]-R&&v[j+1]<b[4]+R&&v[j+2]>b[2]-R&&v[j+2]<b[5]+R){cand.push(i);break}});
    const st=Math.max(1,Math.floor(idx.length/60));for(let q=0;q<idx.length;q+=st){const v=T[idx[q]].v;for(let j=0;j<9;j+=3){const p=[v[j],v[j+1],v[j+2]];for(const i of cand){const d=GA.ptTri(p,T[i].v);if(d<gap)gap=d}}}
    const top=Object.entries(lab).sort((x,y)=>y[1]-x[1]).slice(0,3).map(x=>x[0]);
    return {n:idx.length,sz:+sz.toFixed(3),c:c.map(x=>+x.toFixed(3)),gap:+gap.toFixed(4),lab:top}},
  // one worn combo: build, pieces, bind + posed checks; returns floating clusters per frame and clip counts
  worn(cls,E,mv,opt){opt=opt||{};const {T,B}=CLIP.build(cls,E),gear=t=>t.l!='body',body=t=>t.l=='body';const C=GA.comps(T,gear);
    const res={nTri:T.length,nGear:0,pieces:C.n,bind:[],posed:{}};T.forEach(t=>{if(t.l!='body')res.nGear++});
    const L=GA.links(T,C,body),F=GA.floating(L,C.n);res.bind=F.map(g=>GA.describe(T,C,g,body)).filter(d=>d.sz>.004).sort((a,b)=>b.sz-a.sz);
    const bad=new Set();F.forEach(g=>g.forEach(c=>bad.add(c)));
    if(opt.clip)res.clip=(()=>{const r=CLIP.check(T,{names:B.O});return {poke:r.nPoke,hide:r.nHide,ph:r.poke,hh:r.hide}})();
    if(opt.posed!==false){const D=brOf(cls),h=buildHero();h.mdLook={skin:D.fur[2]||D.fur[0],eye:D.eye[0],build:1,height:1,race:D.id};refreshGear(h,cls,Object.assign({},E));
      const W=CLIP.warp(B,T);let Tm=GA.Tm||(GA.Tm=8e5);const frames=[];
      for(let t=0;t<900;t+=16){Tm+=16;animHero(Tm,true,h);h.position.set(0,0,0)}h.updateMatrixWorld(true);frames.push(['run',CLIP.posed(h,W)]);
      if(mv&&V100A.T[mv]){const P=V100A.T[mv](.62),b=h.bones;for(const c in P){const ch=HACH[c];if(ch&&b[ch[0]])b[ch[0]].rotation[ch[1]]=P[c]}h.updateMatrixWorld(true);frames.push(['strike',CLIP.posed(h,W)])}
      GA.Tm=Tm;
      frames.forEach(([nm,P])=>{const L2=GA.links(P,C,body,GA.eps*2.5),F2=GA.floating(L2,C.n),out=[];F2.forEach(g=>{if(g.every(c=>bad.has(c)))return;const d=GA.describe(P,C,g,body);if(d.sz>.004&&d.gap>GA.eps*2.5)out.push(d)});res.posed[nm]=out.sort((a,b)=>b.gap-a.gap)})}
    return res},
  // a weapon / shield kit alone: anchored at the grip (the pieces within 3 cm of the origin; shields: the biggest piece)
  kit(it){const k=dkKit();v89Kit(k,it);const T=[],v=new THREE.Vector3();
    k.P.forEach((p,pi)=>{const g=p.geo,pa=g.attributes.position,ix=g.index?g.index.array:null,cnt=ix?ix.length:pa.count,P=[];for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);P.push(v.x,v.y,v.z)}
      const e=p.m.elements,u=(g.type||'geo').replace('Geometry','').replace('Buffer','')+'#'+pi+'@'+e[12].toFixed(2)+','+e[13].toFixed(2)+','+e[14].toFixed(2);
      for(let i=0;i+2<cnt;i+=3){const a=ix?ix[i]:i,b=ix?ix[i+1]:i+1,c=ix?ix[i+2]:i+2;T.push({v:[P[a*3],P[a*3+1],P[a*3+2],P[b*3],P[b*3+1],P[b*3+2],P[c*3],P[c*3+1],P[c*3+2]],l:p.t,u,pi})}});
    const C=GA.comps(T,()=>true);let anc=new Set();const t=itT(it);
    if(t.sl=='offhand'){const cnt={};C.comp.forEach(c=>cnt[c]=(cnt[c]||0)+1);let best=-1,bn=0;for(const c in cnt)if(cnt[c]>bn){bn=cnt[c];best=+c}anc.add(best)}
    else{let best=1e9,bc=-1;T.forEach((tr,i)=>{const d=GA.ptTri([0,0,0],tr.v);if(d<.03)anc.add(C.comp[i]);if(d<best){best=d;bc=C.comp[i]}});if(!anc.size)anc.add(bc)}
    const L=GA.links(T,C,()=>false);anc.forEach(c=>L[c].add(-2));const F=GA.floating(L,C.n);
    return {nTri:T.length,pieces:C.n,parts:k.P.length,float:F.map(g=>GA.describe(T,C,g,()=>false)).filter(d=>d.sz>.004).sort((a,b)=>b.sz-a.sz)}}
};
// picture: the built triangles (after the v99 warp, as drawn in the bind pose) — body grey, gear tan, floating pieces magenta;
// views: front, back, side and close-ups on the first floating clusters
GA.pic=function(cls,E,opt){opt=opt||{};const {T,B}=CLIP.build(cls,E),W=CLIP.warp(B,T),gear=t=>t.l!='body',body=t=>t.l=='body',C=GA.comps(T,gear),L=GA.links(T,C,body),F=GA.floating(L,C.n);
  const bad=new Set();F.forEach(g=>{const d=GA.describe(T,C,g,body);if(d.sz>=(opt.minsz||.012)&&d.gap>.007)g.forEach(c=>bad.add(c))});
  const pos=[],col=[],cc=new THREE.Color();W.forEach((t,i)=>{for(let j=0;j<9;j++)pos.push(t.v[j]);const c=C.comp[i];cc.setHex(c<0?0x6a6a6a:bad.has(c)?0xff00ff:(t.t=='m'?0x9aa0a8:t.t=='g'?0x50c0ff:0xa08a60));for(let j=0;j<3;j++)col.push(cc.r,cc.g,cc.b)});
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('color',new THREE.Float32BufferAttribute(col,3));G.computeVertexNormals();
  const M=new THREE.Mesh(G,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,side:THREE.DoubleSide}));
  const FW=300,FH=300,rd=GA.rd||(GA.rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true}));rd.setSize(FW,FH);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x24272c);sc.add(new THREE.HemisphereLight(0xd0d8e0,0x403830,.9));const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(2,4,4);sc.add(dl);sc.add(M);
  // floating cluster centres in the warped space
  const cen=[];F.forEach(g=>{if(!bad.has(g[0]))return;const S=new Set(g);const b=new THREE.Box3();W.forEach((t,i)=>{if(S.has(C.comp[i]))for(let j=0;j<9;j+=3)b.expandByPoint(new THREE.Vector3(t.v[j],t.v[j+1],t.v[j+2]))});cen.push(b.getCenter(new THREE.Vector3()))});
  const views=[{c:[0,.75,0],d:[0,.15,1],r:2.4},{c:[0,.75,0],d:[-.3,.2,-1],r:2.4},{c:[0,.75,0],d:[1,.1,0],r:2.4}];cen.slice(0,opt.n||3).forEach(p=>views.push({c:p.toArray(),d:[p.x*3+.3,.4,p.z*3+.6],r:.45}));
  const pc=new THREE.PerspectiveCamera(30,1,.01,50),cnv=document.createElement('canvas');cnv.width=FW*views.length;cnv.height=FH;const x=cnv.getContext('2d');
  views.forEach((v,i)=>{const c=new THREE.Vector3(...v.c),d=new THREE.Vector3(...v.d).normalize().multiplyScalar(v.r);pc.position.copy(c).add(d);pc.lookAt(c);rd.render(sc,pc);x.drawImage(rd.domElement,i*FW,0)});
  G.dispose();return cnv.toDataURL('image/jpeg',.88)};
GA.kitPic=function(it){const k=dkKit();v89Kit(k,it);const r=GA.kit(it);const FW=320,FH=320,rd=GA.rd||(GA.rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true}));rd.setSize(FW,FH);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x24272c);sc.add(new THREE.HemisphereLight(0xd0d8e0,0x403830,.9));const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(2,4,4);sc.add(dl);
  const bad=new Set();r.float.forEach(d=>d.lab.forEach(l=>{const m=/#(\d+)@/.exec(l);if(m)bad.add(+m[1])}));const g=new THREE.Group();
  k.P.forEach((p,i)=>{const m=new THREE.Mesh(p.geo,new THREE.MeshLambertMaterial({color:bad.has(i)?0xff00ff:p.col,flatShading:true}));m.matrixAutoUpdate=false;m.matrix.copy(p.m);g.add(m)});sc.add(g);g.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(g),c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3()).length(),pc=new THREE.PerspectiveCamera(30,1,.01,50),cnv=document.createElement('canvas');cnv.width=FW*2;cnv.height=FH;const x=cnv.getContext('2d');
  [[.6,.2,1],[-1,.2,-.4]].forEach((d,i)=>{pc.position.copy(c).add(new THREE.Vector3(...d).normalize().multiplyScalar(sz*1.4+.05));pc.lookAt(c);rd.render(sc,pc);x.drawImage(rd.domElement,i*FW,0)});
  sc.remove(g);g.children.forEach(m=>m.material.dispose());return cnv.toDataURL('image/jpeg',.88)};
