// ================= v171: rock past the map's edge, a floor under it (no black, no void) =================
// Owner (Oct 29 2026): "Instead of having black on the outside of the map, can we extend the edge of the map's terrain width so its
// past the viewable area? We could also extend the map floor to that edge as well. This way they would just be looking through a
// semi transparent object and if they turned the camera they couldn't see more than that."
// Every zone instance is land (its fields, rimmed by walls) in a deep void basin inside its rectangle, 6 tiles of void from the next.
// Three parts:
//  1. ed171Fill (at load, from 0045, before the ground is built): the void round the land, out to the rectangle's edge, becomes
//     rock that carries on from the rim: the nearest rim's height, smoothed, rising gently outward (ED171.k / cap) with some
//     roughness. Where walkable ground itself meets the void (a ledge, a lip) the rock lies 26 below it instead, so drops stay
//     drops. Holes enclosed by land (chasms, pits: not reached from the rectangle's edge) stay as they are.
//  2. the apron (ed171Apron, the instance you are in): the same rock carried on past the rectangle, ED171.M tiles out (well past
//     the fog), from the edge's own heights (exact at the edge, smoothed further out), with a short skirt under its inner edge.
//     The ground inside the rectangle stops exactly at its edge (0061), so the two meet there. Same look as the ground (a copy of its
//     material, colours taken from the edge).
//  3. the floor (ed171Floor): a flat sheet just under the lowest ground of the instance, under the land and the rock and out to
//     the apron's end (not under enclosed holes), so from inside the rock there is always ground below.
// From inside the rock (camera in a wall or out past the edge) the ground's faces are glass (3190, 3355): you look through rock
// at the hero, the floor below and more rock — never black, never the space under the map.
var ED171={VT:-6,k:.3,cap:9,n:3,k2:.22,cap2:8,M:104,on:true,cur:null,st:{fill:0,ms:0,apron:0,floor:0}};
// 1. the fill (runs inside 0045's height-map block: only what exists by then — HF, W, H, MAP, INSL, smt, fbm2 — may be used)
function ed171Fill(){const t0=Date.now(),VT=-6,K=.3,CAP=9,NZ=3,DROP=26;let nf=0;   // ED171 (below) does not exist yet: its numbers are repeated here
  for(const I of INSL){if(!I)continue;const nx=I.w+1,nz=I.h+1,N=nx*nz,x0=I.x0,y0=I.y0;
    const HI=(i,j)=>(j+HPD)*HW+i+HPD,hv=new Float32Array(N),st=new Uint8Array(N);   // st: 0 void, 1 land, 2 fill (void reached from the edge)
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,h=HF[HI(x0+i,y0+j)];hv[k]=h;st[k]=h>=VT?1:0}
    // void reached from the rectangle's edge
    const q=new Int32Array(N);let qh=0,qt=0;
    for(let i=0;i<nx;i++)for(const j of [0,nz-1]){const k=j*nx+i;if(!st[k]){st[k]=2;q[qt++]=k}}
    for(let j=1;j<nz-1;j++)for(const i of [0,nx-1]){const k=j*nx+i;if(!st[k]){st[k]=2;q[qt++]=k}}
    while(qh<qt){const k=q[qh++],i=k%nx,j=(k/nx)|0;
      if(i>0&&!st[k-1]){st[k-1]=2;q[qt++]=k-1}if(i<nx-1&&!st[k+1]){st[k+1]=2;q[qt++]=k+1}
      if(j>0&&!st[k-nx]){st[k-nx]=2;q[qt++]=k-nx}if(j<nz-1&&!st[k+nx]){st[k+nx]=2;q[qt++]=k+nx}}
    if(!qt)continue;let land=0;for(let k=0;k<N;k++)if(st[k]===1){land=1;break}if(!land)continue;
    // distance to the nearest land, that land's height and whether you can walk there (two chamfer passes)
    const d=new Float32Array(N),hc=new Float32Array(N),wk=new Uint8Array(N);
    // a ledge: land at the void within 3.5 tiles of walkable ground (rim tiles reach 2.6 past it) and no higher than the land round it
    // (+2.5 over the lowest within 4 tiles); a wall's top is further from the ground you walk on, or stands above it
    for(let k=0;k<N;k++){if(st[k]===2){d[k]=1e9;hc[k]=0;continue}d[k]=0;hc[k]=hv[k];if(st[k]!==1)continue;const i=k%nx,j=(k/nx)|0;
      if(!((i>0&&st[k-1]===2)||(i<nx-1&&st[k+1]===2)||(j>0&&st[k-nx]===2)||(j<nz-1&&st[k+nx]===2)))continue;
      const dw=MAP.DW[Math.min(H-1,y0+j)*W+Math.min(W-1,x0+i)];if(dw==null||dw>=3.5)continue;let mn=1e9;
      for(let dj=-4;dj<=4;dj++)for(let di=-4;di<=4;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const k2=jj*nx+ii;if(st[k2]===1&&hv[k2]<mn)mn=hv[k2]}
      wk[k]=hv[k]<mn+2.5?1:0}
    const rel=(k,k2,c)=>{if(st[k]!==2||st[k2]===0)return;const v=d[k2]+c;if(v<d[k]){d[k]=v;hc[k]=hc[k2];wk[k]=wk[k2]}};
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;if(i>0)rel(k,k-1,1);if(j>0){rel(k,k-nx,1);if(i>0)rel(k,k-nx-1,1.414);if(i<nx-1)rel(k,k-nx+1,1.414)}}
    for(let j=nz-1;j>=0;j--)for(let i=nx-1;i>=0;i--){const k=j*nx+i;if(i<nx-1)rel(k,k+1,1);if(j<nz-1){rel(k,k+nx,1);if(i<nx-1)rel(k,k+nx+1,1.414);if(i>0)rel(k,k+nx-1,1.414)}}
    // where the land you can walk on meets the void (a ledge, a lip: Hilltop Ascent, roads to the edge) the drop stays a drop: the
    // rock lies DROP below it there, rising back slowly; next to a wall it carries on from the wall's top. Smoothed across (land fixed).
    let a=new Float32Array(N),b=new Float32Array(N);for(let k=0;k<N;k++)a[k]=st[k]===2?hc[k]-(wk[k]?DROP:0):hv[k];
    for(let p=0;p<6;p++){for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;if(st[k]!==2){b[k]=a[k];continue}let s=0,n=0;
        for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const k2=jj*nx+ii;if(st[k2]===0)continue;s+=a[k2];n++}
        b[k]=n?s/n:a[k]}const t=a;a=b;b=t}
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;if(st[k]!==2||d[k]>=1e8)continue;const x=x0+i,z=y0+j,dd=d[k],dr=wk[k]?Math.max(0,dd-3):dd;
      HF[HI(x,z)]=a[k]+Math.min(CAP,dr*K)+NZ*(fbm2(x*.06+31,z*.06+17,3)-.5)*2*smt(1,10,dd);nf++}
    I.ed171=1}
  window.ED171F={fill:nf,ms:Date.now()-t0}}
// 2. the apron: heights past the rectangle. The rectangle's edge as one loop (perimeter position s), raw and smoothed.
function ed171Edge(I){if(I._ed171E)return I._ed171E;const w=I.w,h=I.h,P=2*(w+h),raw=new Float32Array(P);
  for(let s=0;s<P;s++){const q=ed171S2P(I,s);raw[s]=GH(q[0],q[1])}
  const bl=(src,r)=>{const o=new Float32Array(P);let acc=0;for(let k=-r;k<=r;k++)acc+=src[((k%P)+P)%P];for(let s=0;s<P;s++){o[s]=acc/(2*r+1);acc+=src[(s+r+1)%P]-src[((s-r)%P+P)%P]}return o};
  const sm=bl(bl(raw,6),6);return I._ed171E={P,raw,sm}}
function ed171S2P(I,s){const w=I.w,h=I.h;if(s<=w)return [I.x0+s,I.y0];if(s<=w+h)return [I.x0+w,I.y0+s-w];if(s<=2*w+h)return [I.x0+w-(s-w-h),I.y0+h];return [I.x0,I.y0+h-(s-2*w-h)]}
function ed171P2S(I,x,z){const w=I.w,h=I.h,dx=x-I.x0,dz=z-I.y0;
  if(dz<=0)return Math.max(0,Math.min(w,dx));if(dx>=w)return w+Math.max(0,Math.min(h,dz));if(dz>=h)return w+h+Math.max(0,Math.min(w,w-dx));return 2*w+h+Math.max(0,Math.min(h,h-dz))}
function ed171Lk(a,P,s){const i=Math.floor(s),f=s-i;return a[((i%P)+P)%P]*(1-f)+a[(((i+1)%P)+P)%P]*f}
// the height at (x, z) past the rectangle (null inside it)
function ed171H(I,x,z){if(!I||!I.ed171)return null;const qx=Math.max(I.x0,Math.min(I.x0+I.w,x)),qz=Math.max(I.y0,Math.min(I.y0+I.h,z)),d=Math.hypot(x-qx,z-qz);if(d<=0)return null;
  const E=ed171Edge(I),s=ed171P2S(I,qx,qz),b=ed171Lk(E.raw,E.P,s)*(1-smt(0,16,d))+ed171Lk(E.sm,E.P,s)*smt(0,16,d);
  return b+Math.min(ED171.cap2,d*ED171.k2)+ED171.n*(fbm2(x*.05+7,z*.05+3,3)-.5)*2*smt(2,14,d)}
// the steps out from the edge: 2 tiles to 16, 4 to 48, then 8
function ed171Steps(M){const a=[0];let d=0;while(d<M){d+=d<16?2:d<48?4:8;a.push(Math.min(M,d))}return a}
function ed171Axis(a0,len,M){const o=ed171Steps(M),xs=[];for(let i=o.length-1;i>0;i--)xs.push(a0-o[i]);for(let v=0;v<len;v+=2)xs.push(a0+v);xs.push(a0+len);for(let i=1;i<o.length;i++)xs.push(a0+len+o[i]);return xs}
function ed171Mat(I){const T=GTX.main,base=T.mat;if(ED171.mat)return ED171.mat;
  const m=base.clone();m.side=THREE.DoubleSide;m.flatShading=true;m.userData=Object.assign({},base.userData);m.userData.ed171=1;
  m.stencilWrite=base.stencilWrite;m.stencilRef=base.stencilRef;m.stencilFunc=base.stencilFunc;m.stencilZPass=base.stencilZPass;m.stencilFail=base.stencilFail;m.stencilZFail=base.stencilZFail;m.stencilWriteMask=base.stencilWriteMask;m.stencilFuncMask=base.stencilFuncMask;
  const U=ED171.R={value:new THREE.Vector4(0,0,1,1)};
  m.onBeforeCompile=(sh,rn)=>{base.onBeforeCompile.call(base,sh,rn);sh.uniforms.uEdR=U;
    sh.fragmentShader=sh.fragmentShader.replace('#define GH169_VOID\n','').replace(CL135_GLSL,'')
      .replace('#include <common>','#include <common>\nuniform vec4 uEdR;').replace('vec2 fc=fi+co;','vec2 fc=clamp(fi+co,uEdR.xy+.5,uEdR.zw-.5);')};
  const k0=base.customProgramCacheKey();m.customProgramCacheKey=()=>k0+'ed171';return ED171.mat=m}
function ed171Apron(I){const xs=ed171Axis(I.x0,I.w,ED171.M),zs=ed171Axis(I.y0,I.h,ED171.M),nx=xs.length,nz=zs.length,T=GTX.main;
  const vid=new Int32Array(nx*nz).fill(-1),pos=[],uv=[],idx=[];
  const inR=(x,z)=>x>=I.x0&&x<=I.x0+I.w&&z>=I.y0&&z<=I.y0+I.h;
  const V=(i,j)=>{const k=j*nx+i;if(vid[k]>=0)return vid[k];const x=xs[i],z=zs[j];let y=ed171H(I,x,z);if(y==null)y=GH(x,z);
    const qx=Math.max(I.x0+.5,Math.min(I.x0+I.w-.5,x)),qz=Math.max(I.y0+.5,Math.min(I.y0+I.h-.5,z));
    pos.push(x,y,z);uv.push((qx-T.x0+.5)/T.w,1-(qz-T.y0+.5)/T.h);return vid[k]=pos.length/3-1};
  for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const cx=(xs[i]+xs[i+1])/2,cz=(zs[j]+zs[j+1])/2;if(inR(cx,cz))continue;
    const a=V(i,j),b=V(i+1,j),c=V(i,j+1),d=V(i+1,j+1);if((i+j)&1)idx.push(a,c,b,b,c,d);else idx.push(a,c,d,a,d,b)}
  // the skirt under the inner edge: hides any sliver between the ground's edge and the apron's (they meet on 2-tile steps)
  const ring=[];for(let s=0;s<2*(I.w+I.h);s+=1)ring.push(ed171S2P(I,s));ring.push(ring[0]);
  for(let r=0;r<ring.length-1;r++){const p=ring[r],n=ring[r+1],ya=GH(p[0],p[1]),yb=GH(n[0],n[1]),b0=pos.length/3;
    const ua=[(Math.max(I.x0+.5,Math.min(I.x0+I.w-.5,p[0]))-T.x0+.5)/T.w,1-(Math.max(I.y0+.5,Math.min(I.y0+I.h-.5,p[1]))-T.y0+.5)/T.h];
    pos.push(p[0],ya+.05,p[1],n[0],yb+.05,n[1],p[0],ya-5,p[1],n[0],yb-5,n[1]);uv.push(ua[0],ua[1],ua[0],ua[1],ua[0],ua[1],ua[0],ua[1]);idx.push(b0,b0+2,b0+1,b0+1,b0+2,b0+3)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();g.computeBoundingBox();
  const m=new THREE.Mesh(g,ed171Mat(I));m.name='ed171Apron';m.receiveShadow=true;m.castShadow=false;m.userData.cast=false;m.userData.noFade135=1;m.userData.psNo=1;
  ED171.st.apron=idx.length/3;return m}
// 3. the floor: just under the instance's lowest ground; not under enclosed holes (still void after the fill)
function ed171Floor(I){let mn=1e9;for(let z=I.y0;z<=I.y0+I.h;z+=2)for(let x=I.x0;x<=I.x0+I.w;x+=2){const h=GH(x,z);if(h>=ED171.VT&&h<mn)mn=h}if(mn>1e8)mn=0;
  const y=mn-.4,M=ED171.M,S=4,x0=I.x0-M,z0=I.y0-M,nx=Math.ceil((I.w+2*M)/S),nz=Math.ceil((I.h+2*M)/S),pos=[],idx=[];
  const hole=(cx,cz)=>{if(cx+S<I.x0||cz+S<I.y0||cx>I.x0+I.w||cz>I.y0+I.h)return false;
    for(let z=cz;z<=cz+S;z+=1)for(let x=cx;x<=cx+S;x+=1){if(x<I.x0||z<I.y0||x>I.x0+I.w||z>I.y0+I.h)continue;if(GH(x,z)<ED171.VT)return true}return false};
  for(let j=0;j<nz;j++){let run=-1;const cz=z0+j*S;
    for(let i=0;i<=nx;i++){const ok=i<nx&&!hole(x0+i*S,cz);
      if(ok&&run<0)run=i;
      if(!ok&&run>=0){const a=x0+run*S,b=x0+i*S,v=pos.length/3;pos.push(a,y,cz,b,y,cz,a,y,cz+S,b,y,cz+S);idx.push(v,v+2,v+1,v+1,v+2,v+3);run=-1}}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
  let c=[60,56,50];try{const b=BIOMES[PMAP[I.z].bi].gnd;if(b)c=b}catch(_){}
  const mat=new THREE.MeshStandardMaterial({color:new THREE.Color(c[0]/255*.42,c[1]/255*.4,c[2]/255*.38),roughness:1,metalness:0});mat.userData.ed171F=1;gh169Clear(mat);
  const m=new THREE.Mesh(g,mat);m.name='ed171Floor';m.receiveShadow=false;m.castShadow=false;m.userData.cast=false;m.userData.noFade135=1;m.userData.psNo=1;
  ED171.st.floor=idx.length/3;ED171.st.fy=+y.toFixed(2);return m}
// keep the apron and floor of the instance you are in (built on arrival, the last one freed)
function ed171Tick(){const k=cvKey(),I=k>=0?INSL[k]:null,on=ED171.on&&!!I&&!!I.ed171;const C=ED171.cur;
  if(C&&(!on||C.k!==k)){[C.a,C.f].forEach(o=>{if(!o)return;scene.remove(o);o.geometry.dispose();if(o.material!==ED171.mat)o.material.dispose()});ED171.cur=null}
  if(!on||ED171.cur)return;
  try{const a=ed171Apron(I),f=ed171Floor(I);ED171.R.value.set(I.x0,I.y0,I.x0+I.w,I.y0+I.h);scene.add(a);scene.add(f);ED171.cur={k,a,f}}
  catch(e){console.warn('v171 edge rock',e);ED171.on=false}}
{const f=POST.render;POST.render=function(){try{ed171Tick()}catch(e){if(!ED171.err){ED171.err=1;console.warn('v171 edge tick',e)}}return f.apply(this,arguments)}}
