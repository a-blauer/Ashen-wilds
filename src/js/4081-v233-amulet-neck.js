// ================= v233: a worn amulet hangs round the neck (owner, Nov 14 2026) =================
// Owner: "worn amulets dont seem to go around the neck like they should. Please check placement and fix."
// What was there (2115, 2790): the "chain" was a flat band 5 cm thick laid at the height where the torso is as wide as the chain
// — a hoop as wide as the shoulders, lying on them like a yoke (over armour: a second collar), with two short strands to the pendant.
// Now the chain is a thin loop measured on the hero that was just built (am233Chain, called by 2115 and 2790 in place of the band):
//  * the body, outfit and armour already in the builder are the surface (their triangles on the trunk and neck: not the head,
//    arms or legs), found with rays (am233Tris, am233Ray);
//  * the neck's base is where the neck stops widening into the shoulders (am233Base); the chain passes behind the neck there,
//    hugs its sides (the first surface out from the neck's middle, or a collar close round it), comes forward over the collar
//    bones and runs down the chest's surface to the pendant in a V (the front surface, so it lies over armour, never inside it);
//  * the pendant sits on that same surface.
// The bind pose is measured, the links ride the chest bone like before. If the measuring fails (no neck found) the old band is built.
// Co-op: the hero model is built from the equipment a partner already receives, so partners see the same chain.
var AM233={on:true,r:.0042,lift:.03,drop:.003,a0:.95,capB:1.3,capF:1.3,err:0,last:null};
function am233Tris(B,y0,y1){const T=[],bad=n=>/^(head|a[LR]\d|lh\d|rh\d|cp\d)/.test(n)&&n!=='chest';
  for(const t in B.L){const L=B.L[t],p=L.p,si=L.si,sw=L.sw;for(let i=0,v=0;i+8<p.length;i+=9,v+=3){const ya=p[i+1],yb=p[i+4],yc=p[i+7];if(Math.max(ya,yb,yc)<y0||Math.min(ya,yb,yc)>y1)continue;
      let skip=false;for(let q=0;q<3&&!skip;q++){const o=(v+q)*4;let bi=0,bw=-1;for(let j=0;j<4;j++)if(sw[o+j]>bw){bw=sw[o+j];bi=si[o+j]}if(bad(B.O[bi]))skip=true}
      if(!skip)T.push(p[i],p[i+1],p[i+2],p[i+3],p[i+4],p[i+5],p[i+6],p[i+7],p[i+8])}}
  return T}
// every hit of the ray (o + t·d, t > 0) on the triangles, nearest first
function am233Ray(T,ox,oy,oz,dx,dy,dz){const H=[];for(let i=0;i<T.length;i+=9){const ax=T[i],ay=T[i+1],az=T[i+2],e1x=T[i+3]-ax,e1y=T[i+4]-ay,e1z=T[i+5]-az,e2x=T[i+6]-ax,e2y=T[i+7]-ay,e2z=T[i+8]-az,
      px=dy*e2z-dz*e2y,py=dz*e2x-dx*e2z,pz=dx*e2y-dy*e2x,det=e1x*px+e1y*py+e1z*pz;if(det>-1e-12&&det<1e-12)continue;const inv=1/det,tx=ox-ax,ty=oy-ay,tz=oz-az,u=(tx*px+ty*py+tz*pz)*inv;if(u<-1e-6||u>1+1e-6)continue;
      const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x,w=(dx*qx+dy*qy+dz*qz)*inv;if(w<-1e-6||u+w>1+1e-6)continue;const t=(e2x*qx+e2y*qy+e2z*qz)*inv;if(t>1e-5)H.push(t)}
  return H.sort((a,b)=>a-b)}
// the neck's middle at a height (on the line from the neck bone to the head bone)
function am233Mid(B,y){const n=B.bones.neck,h=B.bones.head,t=(y-n[2])/((h[2]-n[2])||1);return [n[1]+(h[1]-n[1])*t,y,n[3]+(h[3]-n[3])*t]}
// out from the neck's middle at angle a (0 = forward, + = the hero's left): the surface a chain would lie on (the first one, or
// one close outside it — a collar, a ruff — up to cap × as far)
function am233Out(T,B,y,a,cap){const c=am233Mid(B,y),dx=Math.sin(a),dz=Math.cos(a),H=am233Ray(T,c[0],y,c[2],dx,0,dz);if(!H.length)return null;let r=H[0];const lim=r*cap+.012;for(const t of H)if(t<=lim)r=t;return {r,dx,dz,c}}
// the height of the neck's base: going down from the head, where the neck starts to widen into the shoulders
function am233Base(T,B){const n=B.bones.neck,h=B.bones.head,R=[];for(let y=h[2];y>=n[2]-.1;y-=.005){const a=am233Out(T,B,y,Math.PI/2,1),b=am233Out(T,B,y,-Math.PI/2,1),f=am233Out(T,B,y,0,1),k=am233Out(T,B,y,Math.PI,1);
    if(a&&b&&f&&k)R.push([y,(a.r+b.r)/2])}
  if(R.length<4)return null;let m=1e9;R.forEach(q=>{if(q[1]<m)m=q[1]});let yb=null,yt=null;for(const q of R){if(q[1]<=m*1.3+.004){yb=q[0];if(yt==null)yt=q[0]}else if(yb!=null&&q[1]>m*1.6)break}
  return yb==null?null:{y:yb,top:yt,r:m}}
// the chain. k: the kit to add to; yp: the pendant's height. Returns {z: the chest's surface at the pendant} or null (not built).
function am233Chain(B,P,k,gold,yp){if(!AM233.on)return null;try{const A=AM233,T=am233Tris(B,yp-.12,B.bones.head[2]+.02);A.why='';if(T.length<90){A.why='tris '+T.length;return null}const nb=am233Base(T,B);if(!nb){A.why='base';return null}
    const front=(x,y)=>{const H=am233Ray(T,x,y,1.5,0,0,-1);return H.length?1.5-H[0]:null},zp=front(0,yp+.02);if(zp==null){A.why='front';return null}
    // behind and beside the neck: from the nape (a = π) round to a0 either side, sinking from up to lift above the base (never above the neck) to just above it
    const pts=[],N=8,yn=Math.max(nb.y+.004,Math.min(nb.y+A.lift,nb.top-.003)),ys=nb.y+A.drop,rmax=nb.r*1.4+.012;for(let i=0;i<=N;i++){const u=i/N,a=Math.PI-(Math.PI-A.a0)*u,y=yn+(ys-yn)*u*u,q=am233Out(T,B,y,a,A.capB);if(!q){A.why='loop '+i;return null}const r=Math.min(q.r,rmax)+A.r+.002;pts.push([q.c[0]+q.dx*r,y,q.c[2]+q.dz*r])}
    // down the chest to the pendant: on the front surface, never behind the line from the neck to the pendant
    const e=pts[N],M=6,tip=[0,yp+.02,zp+A.r+.004];for(let i=1;i<M;i++){const u=i/M,x=e[0]*(1-u),y=e[1]+(tip[1]-e[1])*(u*.85+u*u*.15),z=front(x,y),zl=e[2]+(tip[2]-e[2])*u;pts.push([x,y,Math.max(zl,z==null?zl:z+A.r+.003)])}
    pts.push(tip);
    // no link dives under the next (a collar's edge): ease single dips
    for(let i=N+1;i<pts.length-1;i++){const m=(pts[i-1][2]+pts[i+1][2])/2;if(pts[i][2]<m-.02)pts[i][2]=m-.02}
    [1,-1].forEach(s=>{for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];if(s<0&&i===0&&Math.abs(a[0])<1e-4){k.L('chest','m',gold,a,[-b[0],b[1],b[2]],A.r,A.r,4);continue}k.L('chest','m',gold,[s*a[0],a[1],a[2]],[s*b[0],b[1],b[2]],A.r,A.r,4)}});
    // a small clasp at the nape
    k.p('chest','sph','m',gold,pts[0][0],pts[0][1],pts[0][2],A.r*1.9);
    AM233.last={base:nb,pts,zp};return {z:zp,pts,base:nb}}catch(err){if(!AM233.err++)console.warn('v233 amulet',err);return null}}
