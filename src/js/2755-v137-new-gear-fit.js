// ================= v137: new armour — the line's base shape plus its motif, measured onto the finished body =================
// Each of the 72 new armour pieces is one of the existing worn shapes (A137L: the line's base shape per slot), in the line's
// palette, with the line's motif built on top: chains, bones, thorns, candles, spikes, eyes, fangs, feathers, roots, antlers,
// skulls, moons, knives, webs, vials, ribbons, crystals, scrolls or runes.
//  * Motif parts are placed after the whole hero is built (gkLater: after the hood, cape and quiver), on the outside of
//    what is there: each spot is measured as the convex hull of the built triangles round it (a7Ring) and pushed out by a
//    small clearance, so nothing sinks into the body or the armour underneath, whatever the animal.
//  * Parts ride the bone of their spot (head, chest, spine, pelvis, upper arm, shin) or blended torso weights for long
//    pieces (chain drapes, rib bones, vines), so they move with the body.
//  * The item picture runs the same builders over the class's animal (mdItemKit), so it shows the same piece.
// ---------------- descriptor ----------------
{const f=mdGD;mdGD=function(it){const d=f.apply(this,arguments);try{const t=d&&v137T(it);if(t&&t.a7){const L=t.a7,si={helm:0,chest:1,boots:2}[t.sl];
  d.st=L[5][si];d.a7=L;d.si=si;d.mot=L[4];d.key=(d.key||it.tp+'.'+(it.r|0))+'|a7'}}catch(e){console.warn('v137 mdGD',e)}return d}}
// ---------------- measuring ----------------
var A7X={torso:/^(a[LR]|cp|tl|lh|rh|neck|head)/,head:/^(a[LR]|cp|tl|lh|rh|pelvis|spine)/,legL:/^(?!lh[12])/,legR:/^(?!rh[12])/,armL:/^(?!aL)/,armR:/^(?!aR)/};
// a horizontal section (y ± h) of what is built: its hull, centre and the point at angle th pushed out by clr
// a section from points (x, z): its centre (of the convex hull) and, round that centre, the farthest point in each of 48 angle
// bins. A spot at angle th sits just outside the farthest point of its bin and the two next to it: it follows hollows (the
// chest beside a tabard, the neck under a collar) instead of bridging them as a convex hull would, and still clears all
// that is there.
function a7Sec(Q,y){const H=gkHull(Q);let cx=0,cz=0;H.forEach(q=>{cx+=q[0];cz+=q[1]});if(H.length){cx/=H.length;cz/=H.length}
  const N=48,Rb=new Array(N).fill(0);Q.forEach(q=>{const dx=q[0]-cx,dz=q[1]-cz,a=Math.atan2(dx,dz),b=((Math.round(a/(Math.PI*2)*N)%N)+N)%N;Rb[b]=Math.max(Rb[b],Math.hypot(dx,dz))});
  return {H,y,c:[cx,cz],ok:H.length>=3,at(th,clr,yy){const b=((Math.round(th/(Math.PI*2)*N)%N)+N)%N;let r=Math.max(Rb[b],Rb[(b+1)%N],Rb[(b+N-1)%N]);if(!r)r=gkHullR(H,cx,cz,th);
    return {p:[cx+Math.sin(th)*(r+(clr||0)),yy==null?y:yy,cz+Math.cos(th)*(r+(clr||0))],n:[Math.sin(th),0,Math.cos(th)],r}}}}
function a7Ring(B,y,h,ex,filt){const p=gkPts(B,y-h,y+h,filt,ex),Q=[];for(let i=0;i<p.length;i+=3)Q.push([p[i],p[i+2]]);return a7Sec(Q,y)}
// highest point of what is built in a box (x0..x1, z0..z1) between y0 and y1
function a7Top(B,y0,y1,ex,filt){const p=gkPts(B,y0,y1,filt,ex);let b=null;for(let i=0;i<p.length;i+=3)if(!b||p[i+1]>b[1])b=[p[i],p[i+1],p[i+2]];return b}
// ---------------- placing a small kit in a local frame (origin on the surface, +z out, +y up) ----------------
function a7M(p,n,u,sc){const V=THREE.Vector3,Z=new V(...n).normalize(),U=new V(...u),Y=U.sub(Z.clone().multiplyScalar(U.dot(Z)));if(Y.lengthSq()<1e-6)Y.set(0,0,1).sub(Z.clone().multiplyScalar(Z.z));Y.normalize();
  const X=new V().crossVectors(Y,Z).normalize();return new THREE.Matrix4().makeBasis(X.multiplyScalar(sc),Y.multiplyScalar(sc),Z.multiplyScalar(sc)).setPosition(p[0],p[1],p[2])}
// the bone weights of the built vertex nearest to p: a part laid on the surface moves exactly with what is under it
function a7NearW(B,p){let best=1e9,bi=-1,bt=null;for(const t of ['c','m','g']){const L=B.L[t];if(!L||!L.p.length)continue;const P=L.p;
    for(let i=0;i<P.length;i+=3){const dx=P[i]-p[0],dy=P[i+1]-p[1],dz=P[i+2]-p[2],d=dx*dx+dy*dy+dz*dz;if(d<best){best=d;bi=i/3;bt=L}}}
  // the dominant bone only (lower bone on a tie): a rigid part blended half-and-half across a joint would swing off the surface
  // by half the joint's bend; on one bone it stays where it was put
  if(!bt)return null;let bj=-1,bw=0;for(let j=0;j<4;j++){const v=bt.sw[bi*4+j],ix=bt.si[bi*4+j];if(v>bw+.02||(Math.abs(v-bw)<=.02&&bj>=0&&ix>bt.si[bi*4+bj])){bw=v;bj=j}}return bj<0?null:[[B.O[bt.si[bi*4+bj]],1]]}
function a7Put(k,bn,p,n,u,sc,build,w){const t=dkKit();build(t);const M=a7M(p,n,u,sc||1);t.P.forEach(q=>{const o={bn,geo:q.geo,t:q.t,col:q.col,m:M.clone().multiply(q.m)};if(w||q.w)o.w=w||q.w;k.P.push(o)})}
// a tube of segments along world points (each [x,y,z]) with weights wf(p)
function a7Tube(k,bn,pts,r0,r1,col,t,wf,sides){for(let i=0;i<pts.length-1;i++){const u0=i/(pts.length-1),u1=(i+1)/(pts.length-1);k.L(bn,t||'c',col,pts[i],pts[i+1],r0+(r1-r0)*u0,r0+(r1-r0)*u1,sides||5);if(wf)gkW(k,wf(pts[i]))}}
// a path over the torso: [y, angle] pairs → surface points (clearance clr), with the torso weights of their height
function a7TorsoPath(B,yt,clr,tf){const R={};return yt.map(([y,th])=>{const key=y.toFixed(3);const S=R[key]||(R[key]=a7Ring(B,y,.012,A7X.torso,tf));return S.ok?S.at(th,clr).p:null}).filter(Boolean)}
var A7W=p=>mdTorsoW(p[1]);
// ---------------- the motif on one piece ----------------
function a7Orn(B,P,d){const k=dkKit(),L=d.a7,mot=A7MOT[d.mot];if(!mot)return;const lv=Math.max(0,Math.min(4,d.lv==null?d.ti|0:d.lv)),
  C={M:d.M,A:d.A,T:d.T==null?MD_TRIM[d.ti|0]:d.T,G:d.G,gl:d.G!=null?d.G:L[3][1],acc:L[3][1],tr:L[3][2],bone:0xd8ccb0,dk:0x14100c,lv,r:d.r|0,ti:d.ti|0,cls:BR.R?BR.R.cls:null};
  if(d.sl=='helm')a7Helm(B,k,mot,C);else if(d.sl=='chest')a7Chest(B,P,k,mot,C);else if(d.sl=='boots')a7Boots(B,k,mot,C,d._a7n0?{n0:d._a7n0,n1:d._a7n1}:null);
  if(k.P.length)mdKit(B,k)}
// the head: what is built above the neck, leaving out the ears (they poke through helms and hoods); the top is the highest
// section still at least half as wide as the head (so spikes, plumes and points do not count as the crown)
// the head is measured without the ears and without the muzzle in front of where it starts (a beak or snout is not a brow)
function a7EarF(){const D=BR.on&&BR.R;if(!D)return null;const mz=(D.muzzleZ==null?.1:D.muzzleZ)+.02;return D.earE?(x,y,z)=>z<mz&&!brEarIn(D,x,y,z,[1.5,1.35,2.5]):(x,y,z)=>z<mz}
function a7Head(B){const ef=a7EarF(),D=BR.on&&BR.R;
  // on an animal: the helm's surface over the crown of its skull (the first 7 cm above the bone; crests, plumes, horns and hat
  // crowns above that do not count)
  if(D&&D.SN){const cz=D.crownZ==null?-.05:D.crownZ,st=brSkullAt(D,cz).top,p=gkPts(B,st-.01,st+.07,(x,y,z)=>Math.abs(x)<.035&&Math.abs(z-cz)<.04,A7X.head);
    let ty=st+.005;for(let i=0;i<p.length;i+=3)ty=Math.max(ty,p[i+1]);return {top:[0,ty,cz],y:ty,ef}}
  const p=gkPts(B,1.0,1.8,ef,A7X.head);if(p.length<9)return null;const W={};
  for(let i=0;i<p.length;i+=3){const k=Math.round(p[i+1]*100),w=W[k]||(W[k]=[9,-9]);w[0]=Math.min(w[0],p[i]);w[1]=Math.max(w[1],p[i])}
  let mx=0;for(const k in W)mx=Math.max(mx,W[k][1]-W[k][0]);let ty=0;for(const k in W)if(W[k][1]-W[k][0]>=mx*.5)ty=Math.max(ty,k/100);
  const S=a7Ring(B,ty-.01,.012,A7X.head,ef);return {top:[0,ty,S.ok?S.c[1]:0],y:ty,ef}}
function a7Helm(B,k,mot,C){const H=a7Head(B);if(!H)return;const hw=[['head',1]],S=(dy,h)=>a7Ring(B,H.y-dy,h||.02,A7X.head,H.ef);
  const D=BR.on&&BR.R,ctx={B,k,C,H,S,bn:'head',w:hw,ear:(p)=>D&&D.earE&&brEarIn(D,p[0],p[1],p[2],[1.5,1.35,2.5])};if(mot.helm)mot.helm(ctx)}
// the top of a shoulder: the highest section of what is built on the upper arm that is still at least half as wide as the
// shoulder piece (so spikes and seals standing on it do not count), centred on that section
function a7ShTop(B,s){const p=gkPts(B,.78,1.3,(x,y,z)=>s*x>.1&&Math.abs(z)<.16,s<0?A7X.armL:A7X.armR);if(p.length<9)return null;const W={};
  for(let i=0;i<p.length;i+=3){const k=Math.round(p[i+1]*100),w=W[k]||(W[k]={a:9,b:-9,x:0,z:0,n:0});w.a=Math.min(w.a,p[i+2]);w.b=Math.max(w.b,p[i+2]);w.x+=p[i];w.z+=p[i+2];w.n++}
  let mx=0;for(const k in W)mx=Math.max(mx,W[k].b-W[k].a);let best=null;for(const k in W){const w=W[k];if(w.b-w.a>=mx*.5&&(!best||+k>best.k))best={k:+k,w}}
  return best?[best.w.x/best.w.n,best.k/100+.006,best.w.z/best.w.n]:null}
function a7Chest(B,P,k,mot,C){const tf=(x,y,z)=>{const q=mdTorsoAt(P,Math.max(.5,Math.min(1,y)));return Math.abs(x)<q.rx+.07},ctx={B,P,k,C,bn:'chest',
  S:(y,h)=>a7Ring(B,y,h||.02,A7X.torso,tf),
  sh:s=>{const t=a7ShTop(B,s);return t?{p:t,bn:s<0?'aL0':'aR0'}:null},
  path:(yt,clr)=>a7TorsoPath(B,yt,clr,tf)};if(mot.chest)mot.chest(ctx)}
// boots: heights in the motifs are for a boot about .32 tall (a knee-high greave); c.Y scales them to the boot's own top
// (its highest point, from the triangles the boot added), so a low shoe gets its cuff details at its own cuff
// boots are measured on the boot alone (the triangles its builder added, R = {n0, n1} per material): the leg's axis, the boot's
// top, and each ring round it, so a cape, coat hem or skirt flap next to the leg never counts
function a7PtsR(B,y0,y1,R){const out=[];['c','m','g'].forEach(t=>{const L=B.L[t];if(!L)return;const p=L.p,a=R.n0[t]||0,b=R.n1&&R.n1[t]!=null?R.n1[t]:p.length;
  for(let i=a;i+8<b;i+=9){const ay=p[i+1],by=p[i+4],cy=p[i+7];if(Math.max(ay,by,cy)<y0||Math.min(ay,by,cy)>y1)continue;const ax=p[i],az=p[i+2],bx=p[i+3],bz=p[i+5],cx=p[i+6],cz=p[i+8];
    const e=Math.max(Math.hypot(ax-bx,ay-by,az-bz),Math.hypot(bx-cx,by-cy,bz-cz),Math.hypot(cx-ax,cy-ay,cz-az)),n=Math.max(1,Math.min(8,Math.ceil(e/.012)));
    for(let u=0;u<=n;u++)for(let v=0;v<=n-u;v++){const w=n-u-v,x=(ax*u+bx*v+cx*w)/n,y=(ay*u+by*v+cy*w)/n,z=(az*u+bz*v+cz*w)/n;if(y>=y0&&y<=y1)out.push(x,y,z)}}});return out}
function a7RingP(p,y,keep){const Q=[];for(let i=0;i<p.length;i+=3)if(!keep||keep(p[i],p[i+1],p[i+2]))Q.push([p[i],p[i+2]]);return a7Sec(Q,y)}
function a7Boots(B,k,mot,C,R){let top=.32;const L={'-1':[0,0,0],'1':[0,0,0]};
  if(R){const p=a7PtsR(B,-1,.6,R);let m=0;for(let i=0;i<p.length;i+=3){m=Math.max(m,p[i+1]);const q=L[p[i]<0?'-1':'1'];q[0]+=p[i];q[1]+=p[i+2];q[2]++}if(m>.08)top=m}
  // the raven's robe hides its legs above the shin: its boot details go where they show
  if(BR.on&&BR.R&&BR.R.key=='raven')top=Math.min(top,.2);
  [-1,1].forEach(s=>{const q=L[s<0?'-1':'1'],cx=q[2]?q[0]/q[2]:s*.09,cz=q[2]?q[1]/q[2]:.02,side=(x,yy,z)=>s*x>0&&(x-cx)*(x-cx)+(z-cz)*(z-cz)<.0144,
    ctx={B,k,C,s,top,Y:y=>y*top/.32,bn:s<0?'lh1':'rh1',nw:p=>a7NearW(B,p),
      S:(y,h)=>R?a7RingP(a7PtsR(B,y-(h||.02),y+(h||.02),R),y,side):a7Ring(B,y,h||.02,s<0?A7X.legL:A7X.legR,side)};{const q=ctx.S(ctx.Y(.15),.02);ctx.ls=q.ok?Math.max(.45,Math.min(1,q.at(0,0).r/.065)):1}if(mot.boots)mot.boots(ctx)})}
// wrapping the builders: the motif goes on after the piece (and, in a hero, after everything else)
{const c=mdChest,h=mdHelm,b=mdBoots;
  mdChest=function(B,P,d){const r=c.apply(this,arguments);if(d&&d.a7)gkLater(B,B2=>{try{a7Orn(B2,P,d)}catch(e){console.warn('v137 chest motif',e)}});return r};
  // the motif replaces the v136 class details of heavy helms (spikes, plume, brow cross): the class look comes from the line
  mdHelm=function(B,P,d){let r;if(d&&d.a7&&d.a=='heavy'&&BR.on&&BR.R){const R0=BR.R;BR.R=Object.create(R0,{cls:{value:null}});try{r=h.apply(this,arguments)}finally{BR.R=R0}}else r=h.apply(this,arguments);if(d&&d.a7)gkLater(B,B2=>{try{a7Orn(B2,P,d)}catch(e){console.warn('v137 helm motif',e)}});return r};
  mdBoots=function(B,P,d){if(d&&d.a7){d._a7n0={};for(const t in B.L)d._a7n0[t]=B.L[t].p.length}const r=b.apply(this,arguments);if(d&&d.a7){d._a7n1={};for(const t in B.L)d._a7n1[t]=B.L[t].p.length}if(d&&d.a7)gkLater(B,B2=>{try{a7Orn(B2,P,d)}catch(e){console.warn('v137 boots motif',e)}});return r}}
