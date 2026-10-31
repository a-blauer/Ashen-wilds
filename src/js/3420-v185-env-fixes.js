// ================= v185: every instance checked (owner, Oct 31 2026) =================
// "Thoroughly check every part of every instance and zone and fix or remodel any clipping objects, poorly done models (such
// as the tents with black squares inside) or abnormalities in the terrain." Survey: test/v185_survey.py (pictures of every
// instance), test/v185_audit.py (measured: clipping, floating, terrain). Fixes are in the files that build each thing; the
// new models are here (hoisted functions only: camps and decorations are built at load, long before this file runs).
//
// ---- tents (remodelled) ----
// The old tents were a 4-sided cone with a black box stood in front for a door (half of it inside the wall, half sticking
// out: a black square) and an A-frame of two slanted boxes, open at both ends, with a black square box in one end. Now:
//  * ep185Tent: a six-pole hide tent. The hide sags between the poles, the poles cross above the top, the door is a real
//    opening: a dark recess cut into the front face with its two flaps tied back against the wall; a muddy hem; guy ropes to
//    pegs. The hide runs on below the ground (a skirt) so the tent never floats on a slope.
//  * ep185ATent: a ridge tent of hide over a ridge pole: closed back, a door in the front gable (recess + tied-back flaps),
//    crossed poles at both ends, sagging panels, a skirt, ropes and pegs.
// Both are one geometry with their own colours (painted, not built: hem, flaps, poles, the dark doorway), cached per look.
function ep185Geo(){const P=[],C=[];
  const v=(a)=>a,col=(h)=>{const c=new THREE.Color(h);return [c.r,c.g,c.b]};
  // every triangle is wound to face away from (s>0) or toward (s<0) a reference point K.O(centroid) gives: no face shows its back
  const K={O:null};
  const tri=(a,b,c,ca,cb,cc)=>{cb=cb||ca;cc=cc||ca;if(K.O){const m=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],o=K.O(m),u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],w=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],
      N=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];if(((m[0]-o.p[0])*N[0]+(m[1]-o.p[1])*N[1]+(m[2]-o.p[2])*N[2])*o.s<0){const t=b;b=c;c=t;const tc=cb;cb=cc;cc=tc}}
    P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);C.push(...ca,...cb,...cc)};
  const quad=(a,b,c,d,ca,cb,cc,cd)=>{tri(a,b,c,ca,cb,cc);tri(a,c,d,ca,cc,cd||ca)};
  const both=(a,b,c,ca,cb)=>{const o=K.O;K.O=null;tri(a,b,c,ca);tri(a,c,b,cb||ca);K.O=o};
  // a thin prism (n sides) from p to q, radius r0 at p and r1 at q
  const rod=(p,q,r0,r1,h,n)=>{n=n||4;const d=[q[0]-p[0],q[1]-p[1],q[2]-p[2]],L=Math.hypot(...d)||1,u=d.map(x=>x/L),t=Math.abs(u[1])<.9?[0,1,0]:[1,0,0];
    let a=[u[1]*t[2]-u[2]*t[1],u[2]*t[0]-u[0]*t[2],u[0]*t[1]-u[1]*t[0]];const al=Math.hypot(...a);a=a.map(x=>x/al);const b=[u[1]*a[2]-u[2]*a[1],u[2]*a[0]-u[0]*a[2],u[0]*a[1]-u[1]*a[0]];
    const ring=(o,r)=>{const R=[];for(let i=0;i<n;i++){const t2=i/n*6.283+.4;R.push([o[0]+(a[0]*Math.cos(t2)+b[0]*Math.sin(t2))*r,o[1]+(a[1]*Math.cos(t2)+b[1]*Math.sin(t2))*r,o[2]+(a[2]*Math.cos(t2)+b[2]*Math.sin(t2))*r])}return R};
    const A=ring(p,r0),B=ring(q,r1),c=col(h),c2=c.map(x=>x*.8),o=K.O;
    K.O=m=>{const t=Math.max(0,Math.min(1,((m[0]-p[0])*u[0]+(m[1]-p[1])*u[1]+(m[2]-p[2])*u[2])/L));return {p:[p[0]+d[0]*t,p[1]+d[1]*t,p[2]+d[2]*t],s:1}};
    for(let i=0;i<n;i++){const j=(i+1)%n;quad(A[i],A[j],B[j],B[i],c2,c2,c,c)}
    K.O=()=>({p:[(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2],s:1});for(let i=1;i<n-1;i++){tri(B[0],B[i],B[i+1],c);tri(A[0],A[i+1],A[i],c2)}K.O=o};
  const done=()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
    g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData.lps=1;return g};
  return Object.assign(K,{P,C,tri,quad,both,rod,col,done})}
var EP185T;
function ep185Lift(h){const c=new THREE.Color(h),l=.3*c.r+.59*c.g+.11*c.b;if(l<.16)c.lerp(new THREE.Color(0x4a3a2c),Math.min(1,(.16-l)/.16)*.7);return c.getHex()}   // a hide never near-black
function ep185Tent(o){o=o||{};const r=o.r||1.25,h=o.h||1.8,hide=ep185Lift(o.hide==null?0x5a4632:o.hide),pole=o.pole==null?0x3a2818:o.pole,n=o.n||6,sk=.35;
  const key='T|'+[r,h,hide,pole,n,o.rope===false?0:1].join('|');EP185T=EP185T||{};if(EP185T[key])return EP185T[key];
  const K=ep185Geo(),{tri,quad,both,rod,col}=K,hc=col(hide),dk=hc.map(x=>x*.42),mud=hc.map((x,i)=>x*.55+[.05,.04,.03][i]),fl=hc.map(x=>Math.min(1,x*1.12)),flI=hc.map(x=>x*.5),blk=col(0x0c0907),jamb=hc.map(x=>x*.3);
  const ap=[0,h,0],R=y=>r*(h-y)/h;   // the hide's radius at height y (a cone through the pole tops)
  const cor=i=>{const a=(i+.5)/n*6.283;return [Math.cos(a),Math.sin(a)]},at=(i,y,s)=>{const c=cor(i),rr=R(y)*(s||1);return [c[0]*rr,y,c[1]*rr]};
  K.O=m=>({p:[0,m[1]*.5,0],s:1});   // the hide faces out from the tent's axis
  for(let i=0;i<n;i++){const j=(i+1)%n,a0=(i+.5)/n*6.283,a1=(j+.5)/n*6.283,am=(a0+a1+(j===0?6.283:0))/2,
      c0=at(i,-sk),c1=at(j,-sk),g0=at(i,.12*h),g1=at(j,.12*h),M=[Math.cos(am)*R(.42*h)*.86,.42*h,Math.sin(am)*R(.42*h)*.86],B=[Math.cos(am)*R(-sk)*.93,-sk,Math.sin(am)*R(-sk)*.93];
    const front=i===n-1;   // the face around angle 0 (+x) holds the door
    if(!front){tri(c0,B,M,mud,mud,hc);tri(B,c1,M,mud,mud,hc);tri(c1,ap,M,hc,hc,hc);tri(ap,c0,M,hc,hc,hc);continue}
    // the door: an opening in this face (E1, E2 on the base edge, T up the face), recessed, its flaps tied back
    const lerp=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];
    const E1=lerp(c0,c1,.3),E2=lerp(c0,c1,.7),T=lerp(lerp(c0,c1,.5),ap,.55);
    tri(c0,E1,T,mud,mud,hc);tri(c0,T,ap,mud,hc,hc);tri(E2,c1,T,mud,mud,hc);tri(T,c1,ap,hc,mud,hc);
    const nx=Math.cos(am),nz=Math.sin(am),dep=r*.34,inn=p=>[p[0]-nx*dep,p[1],p[2]-nz*dep];
    const I1=inn(lerp(E1,E2,.06)),I2=inn(lerp(E2,E1,.06)),It=inn(T);
    const Dc=[(E1[0]+E2[0])/2-nx*dep*.5,T[1]*.3,(E1[2]+E2[2])/2-nz*dep*.5];K.O=()=>({p:Dc,s:-1});   // the jambs face into the doorway
    tri(E1,I1,It,jamb,blk,blk);tri(E1,It,T,jamb,blk,jamb);tri(T,It,I2,jamb,blk,blk);tri(T,I2,E2,jamb,blk,jamb);
    K.O=()=>({p:[0,0,0],s:1});tri(I1,I2,It,blk);K.O=m=>({p:[0,m[1]*.5,0],s:1});
    const off=.03,fo=p=>[p[0]+nx*off,p[1]+off*.4,p[2]+nz*off];
    const F1=fo(lerp(lerp(c0,E1,.25),ap,.22)),F2=fo(lerp(lerp(c1,E2,.25),ap,.22));
    both(fo(E1),F1,fo(T),fl,flI);both(fo(E2),fo(T),F2,fl,flI);
    rod(lerp(F1,T,.5),lerp(F1,c0,.25),.012,.012,0x2a1e14,3);rod(lerp(F2,T,.5),lerp(F2,c1,.25),.012,.012,0x2a1e14,3)}
  // the poles: up each ridge from below the ground to above the top, crossing there
  for(let i=0;i<n;i++){const c=cor(i),b=[c[0]*R(-sk)*1.02,-sk,c[1]*R(-sk)*1.02],t=[-c[0]*r*.13,h*1.18,-c[1]*r*.13];rod(b,t,.035*r,.026*r,pole,4)}
  // guy ropes from every other pole to a peg
  if(o.rope!==false)for(let i=0;i<n;i+=2){const c=cor(i),p=[c[0]*R(.55*h)*1.03,.55*h,c[1]*R(.55*h)*1.03],g=[c[0]*r*1.5,-.04,c[1]*r*1.5];rod(p,g,.011,.011,0x6a5a42,3);rod([g[0],-.3,g[2]],[g[0],.16,g[2]],.03,.02,pole,4)}
  return EP185T[key]=K.done()}
function ep185ATent(o){o=o||{};const L=o.len||2.6,Wd=o.w||1,H=o.h||1.35,hide=ep185Lift(o.hide==null?0x5a4632:o.hide),pole=o.pole==null?0x3a2818:o.pole,sk=.3;
  const key='A|'+[L,Wd,H,hide,pole,o.rope===false?0:1].join('|');EP185T=EP185T||{};if(EP185T[key])return EP185T[key];
  const K=ep185Geo(),{tri,quad,both,rod,col}=K,hc=col(hide),mud=hc.map((x,i)=>x*.55+[.05,.04,.03][i]),fl=hc.map(x=>Math.min(1,x*1.12)),flI=hc.map(x=>x*.5),blk=col(0x0c0907),jamb=hc.map(x=>x*.3);
  const X=L/2,Wy=y=>Wd*(H-y)/H;   // half-width at height y
  const rg0=[-X,H,0],rg1=[X,H,0];K.O=m=>({p:[Math.max(-X+.5,Math.min(X-.5,m[0])),Math.min(m[1],H*.3)-.6,0],s:1});   // the hide faces out
  [-1,1].forEach(s=>{const e0=[-X,-sk,s*Wy(-sk)],e1=[X,-sk,s*Wy(-sk)],m0=[-X,.45*H,s*Wy(.45*H)],m1=[X,.45*H,s*Wy(.45*H)],mc=[0,.45*H,s*Wy(.45*H)*.9],ec=[0,-sk,s*Wy(-sk)*.97],rc=[0,H*.985,0];
    const w=(a,b,c,ca,cb,cc)=>s>0?tri(a,b,c,ca,cb,cc):tri(a,c,b,ca,cc,cb);
    w(rg0,rc,mc,hc,hc,hc);w(rg0,mc,m0,hc,hc,hc);w(rc,rg1,m1,hc,hc,hc);w(rc,m1,mc,hc,hc,hc);
    w(m0,mc,ec,hc,hc,mud);w(m0,ec,e0,hc,mud,mud);w(mc,m1,e1,hc,hc,mud);w(mc,e1,ec,hc,mud,mud)});
  // the back gable, closed
  {const a=[-X,-sk,-Wy(-sk)],b=[-X,-sk,Wy(-sk)],m=[-X,.45*H,0];tri(a,b,m,mud,mud,hc);tri(b,rg0,m,mud,hc,hc);tri(rg0,a,m,hc,mud,hc)}
  // the front gable: a door with a recess and tied-back flaps
  {const a=[X,-sk,-Wy(-sk)],b=[X,-sk,Wy(-sk)],E1=[X,-sk,-Wd*.42],E2=[X,-sk,Wd*.42],T=[X,H*.72,0],dep=.4,I1=[X-dep,-sk,-Wd*.4],I2=[X-dep,-sk,Wd*.4],It=[X-dep,H*.7,0];
    tri(a,rg1,E1,mud,hc,mud);tri(E1,rg1,T,mud,hc,hc);tri(T,rg1,E2,hc,hc,mud);tri(E2,rg1,b,mud,hc,mud);
    K.O=()=>({p:[X-dep*.5,H*.25,0],s:-1});quad(E1,T,It,I1,jamb,jamb,blk,blk);quad(T,E2,I2,It,jamb,jamb,blk,blk);K.O=()=>({p:[0,H*.3,0],s:1});tri(I1,It,I2,blk);
    const F1=[X+.05,.25*H,-Wd*.72],F2=[X+.05,.25*H,Wd*.72];both([X+.03,-sk,-Wd*.42],[X+.03,H*.72,0],F1,fl,flI);both([X+.03,H*.72,0],[X+.03,-sk,Wd*.42],F2,fl,flI);
    rod(F1,[X+.02,.35*H,-Wd*.6],.012,.012,0x2a1e14,3);rod(F2,[X+.02,.35*H,Wd*.6],.012,.012,0x2a1e14,3)}
  // ridge pole and crossed poles at both ends
  rod([-X-.22,H*1.02,0],[X+.22,H*1.02,0],.032,.032,pole,5);
  [-1,1].forEach(e=>[-1,1].forEach(s=>rod([e*(X+.03),-sk,s*Wy(-sk)*1.02],[e*(X+.06),H*1.22,-s*Wd*.2],.03,.024,pole,4)));
  if(o.rope!==false)[-1].forEach(e=>{const g=[e*(X+1.1),-.04,0];   // the back only: no rope across the doorway
rod([e*(X+.2),H*1.02,0],g,.011,.011,0x6a5a42,3);rod([g[0],-.3,g[2]],[g[0],.16,g[2]],.03,.02,pole,4)});
  return EP185T[key]=K.done()}
var EP185M;
function ep185Mat(){if(!EP185M){EP185M=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true});EP185M.userData.lps=1}return EP185M}
// a tent mesh placed like the old ones: door toward (cos a, sin a) on the ground at (x,z) in a camp's frame (2270 / 0250 / 3242)
function ep185TentMesh(geo){const m=new THREE.Mesh(geo,ep185Mat());m.castShadow=true;m.receiveShadow=true;m.userData.keep=1;return m}
// ---- the scattered decorations tidied once at load (ep185Tidy, from 1680 wdGen before the grade) ----
// Pieces without a collider (rubble, loose rocks, logs, bank pines, dead trees, bones ...) were placed without looking at each
// other or at the pieces with colliders, so rubble lay through tents, a log through a boulder, pines through pines. And a piece
// could stand over the void past a cliff edge, or stand upright against a cliff face with its crown in the rock. Each piece now
// gets a solid core (a tree's trunk, a rock's middle); walking from the most important (collider pieces, then the biggest) down,
// a piece whose core lies inside one already kept is hidden; so is a piece over the void, a tall piece with the ground rising
// into its crown or falling away under it. Hidden = drawn at scale 0 (env177Seat); a hidden piece with a collider gives its tiles
// back. Stats in EP185TIDY.
var EP185TIDY;
function ep185KindInfo(S){if(S.__e185)return S.__e185;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9,glow=true;
  (S.parts||[]).forEach(p=>{if(p.mat)return;if(!p.glow)glow=false;const P=p.g&&p.g.attributes.position;if(!P)return;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z}});
  const sc=S.sc||[1,1,1],w=Math.min(x1-x0,z1-z0)*Math.min(sc[0],sc[2]),W2=Math.max(x1-x0,z1-z0)*Math.max(sc[0],sc[2]),h=(y1-y0)*sc[1],
    tree=/tree|pine|oak|palm|snag|spire|stalag|pillar|column|col$|obelisk|lamp|banner|totem|cross|stake|candela|brazier|statue|angel|spike|flag|gshroom/.test(S.k),
    solid=!glow&&!S.near&&!S.flat&&h>.25&&isFinite(h)&&!(S.parts||[]).some(p=>p.mat),core=tree?Math.min(.34,Math.max(.12,w*.16)):w*.34;
  const rocky=/spire|stalag|column|pillar|col$|rock|crys|ice|salt|obelisk/.test(S.k);   // rock grown from rock: may lean into a cliff
  return S.__e185={solid,core:Math.max(.1,core),h,w:W2,tall:h>W2*1.2&&h>1.2&&!rocky,tree}}
function ep185Tidy(T,L,col){const R=EP185TIDY={n:L.length,overlap:0,void:0,cliff:0,ms:0,list:[]},t0=performance.now(),G=new Map(),C=4,key=(x,z)=>Math.floor(x/C)+','+Math.floor(z/C);
  const hide=(d,why)=>{d.h185=why;R[why]++;if(R.list.length<400)R.list.push([why,d.k,+d.x.toFixed(1),+d.z.toFixed(1)]);if(d.col&&d.tl&&col)d.tl.forEach(k=>col.delete(k))};
  const cand=[];for(const d of L){const S=T[d.k];if(!S||S.abs!=null)continue;const K=ep185KindInfo(S);
    // over the void: nothing under its middle, or (a solid piece) under one side of its core
    const g0=GH(d.x,d.z);if(!(g0>-4)){hide(d,'void');continue}
    if(K.solid){const r=Math.max(.3,K.core*d.s);let lo=1e9,hi=-1e9;for(let i=0;i<8;i++){const a=i*.785,g=GH(d.x+Math.cos(a)*r,d.z+Math.sin(a)*r);if(g<lo)lo=g;if(g>hi)hi=g}
      if(!(lo>-4)){hide(d,'void');continue}
      // a tall piece: the ground rising into its crown (it stands against a cliff face) or falling away under it (a cliff lip)
      if(K.tall){const rc=Math.max(.6,K.w*.38*d.s);let up=-1e9,dn=1e9;for(let i=0;i<8;i++){const a=i*.785,g=GH(d.x+Math.cos(a)*rc,d.z+Math.sin(a)*rc);if(g>up)up=g;if(g<dn)dn=g}
        if(up-g0>Math.max(1.1,K.h*d.s*.4)||g0-dn>Math.max(1.4,K.h*d.s*.45)){hide(d,'cliff');continue}}
      cand.push([d,K.core*d.s,(d.col?100:0)+K.core*d.s*(K.tree?.6:1)+K.h*d.s*.05])}}
  cand.sort((a,b)=>b[2]-a[2]);
  for(const [d,r] of cand){let hit=null;const gx=Math.floor(d.x/C),gz=Math.floor(d.z/C);
    for(let j=gz-1;j<=gz+1&&!hit;j++)for(let i=gx-1;i<=gx+1&&!hit;i++){const B=G.get(i+','+j);if(B)for(const q of B)if(Math.hypot(q[0].x-d.x,q[0].z-d.z)<(q[1]+r)*.85){hit=q;break}}
    if(hit&&!d.col){hide(d,'overlap');continue}
    const k=key(d.x,d.z);let B=G.get(k);if(!B)G.set(k,B=[]);B.push([d,r])}
  R.ms=Math.round(performance.now()-t0);return R}
// ---- paint helpers for models (hoisted: decorations are built at load) ----
// ep185Facet: an unlit (glowing) model has no shading, so its faces read as flat paper: shade each face by its own facing
// (a light from above and in front), in its colours. ep185Snow: snow on everything turned up, above a height, in the colours.
function ep185Facet(g,lo,hi){lo=lo==null?.5:lo;hi=hi==null?1.08:hi;const P=g.attributes.position,C=g.attributes.color;if(!C)return g;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),L=new THREE.Vector3(.35,.85,.4).normalize();
  for(let i=0;i+2<P.count;i+=3){a.fromBufferAttribute(P,i);b.fromBufferAttribute(P,i+1);c.fromBufferAttribute(P,i+2);const n=b.sub(a).cross(c.sub(a)).normalize(),k=lo+(hi-lo)*(.5+.5*n.dot(L));
    for(let j=0;j<3;j++)C.setXYZ(i+j,C.getX(i+j)*k,C.getY(i+j)*k,C.getZ(i+j)*k)}C.needsUpdate=true;return g}
function ep185Snow(g,y0,ny){const P=g.attributes.position,C=g.attributes.color;if(!C)return g;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i+2<P.count;i+=3){a.fromBufferAttribute(P,i);b.fromBufferAttribute(P,i+1);c.fromBufferAttribute(P,i+2);const cy=(a.y+b.y+c.y)/3,n=b.clone().sub(a).cross(c.clone().sub(a)).normalize();
    if(cy>y0&&n.y>ny){const t=Math.min(1,(n.y-ny)/(1-ny)*1.6);for(let j=0;j<3;j++){const r=C.getX(i+j),gg=C.getY(i+j),bb=C.getZ(i+j);C.setXYZ(i+j,r+(.93-r)*t,gg+(.95-gg)*t,bb+(1-bb)*t)}}}
  C.needsUpdate=true;return g}
// ---- soft light pools (camp halos, fire glows): a radial fade instead of a flat disc with a hard edge ----
var EP185S;
function ep185Soft(col,op){EP185S=EP185S||{m:{}};const k=col+'|'+op;if(EP185S.m[k])return EP185S.m[k];
  if(!EP185S.t){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
    r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.6)');r.addColorStop(.7,'rgba(255,255,255,.18)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);EP185S.t=new THREE.CanvasTexture(c)}
  const m=new THREE.MeshBasicMaterial({color:col,map:EP185S.t,transparent:true,opacity:Math.min(1,op*1.7),depthWrite:false,side:THREE.DoubleSide});m.userData.lps=1;return EP185S.m[k]=m}
// ---- doorways and holes: dark with depth instead of a flat pure-black panel ----
// A doorway: near-black at the top, the floor inside faintly lit at the bottom, the jambs a shade lighter at the sides. A hole or a
// burrow mouth: black in the middle fading to dark earth at the rim. Unlit (they are openings, not surfaces); one material each.
function ep185Grad(kind){EP185S=EP185S||{m:{}};const k='g|'+kind;if(EP185S.m[k])return EP185S.m[k];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  if(kind==='door'){const v=g.createLinearGradient(0,0,0,64);v.addColorStop(0,'#050404');v.addColorStop(.55,'#0b0907');v.addColorStop(1,'#2a2119');g.fillStyle=v;g.fillRect(0,0,64,64);
    const h=g.createLinearGradient(0,0,64,0);h.addColorStop(0,'rgba(60,46,34,.55)');h.addColorStop(.18,'rgba(0,0,0,0)');h.addColorStop(.82,'rgba(0,0,0,0)');h.addColorStop(1,'rgba(60,46,34,.55)');g.fillStyle=h;g.fillRect(0,0,64,64)}
  else{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'#020202');r.addColorStop(.55,'#0a0806');r.addColorStop(.85,'#21190f');r.addColorStop(1,'#3a2c1e');g.fillStyle=r;g.fillRect(0,0,64,64)}
  const t=new THREE.CanvasTexture(c);const m=new THREE.MeshBasicMaterial({map:t});m.userData.lps=1;return EP185S.m[k]=m}
// ---- ponds with round shores (from 3370 env177Banks, at load) ----
// A pond is a set of water tiles, so its shore (where the ground dips under the water level) followed the tile grid: right
// angles, ruler-straight 45° sides and a sawtooth of terrain triangles along the bank. The ground within 3 tiles of the water
// (water and walkable land only, never a wall) is smoothed three times, so the shore line rounds off. Walking is unchanged
// (water tiles still block), the water's edge moves at most half a tile.
function ep185Ponds(){const T0=performance.now(),wet=(x,y)=>MAP[y]&&MAP[y][x]=='~',DW=MAP.DW,near=new Uint8Array(W*H);let n=0;
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(wet(x,y)&&insAt(x,y))for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const X=x+dx,Y=y+dy;if(X<1||Y<1||X>=W-1||Y>=H-1)continue;const k=Y*W+X;if(!near[k]&&(wet(X,Y)||DW[k]<0)){near[k]=1;n++}}
  const idx=[];for(let k=0;k<W*H;k++)if(near[k])idx.push(k);const hk=k=>((Math.floor(k/W))+HPD)*HW+(k%W)+HPD,tmp=new Float32Array(idx.length);
  for(let pass=0;pass<3;pass++){idx.forEach((k,i)=>{const c=hk(k);let s=HF[c]*4,w=4;for(const [dx,dy,q] of [[1,0,2],[-1,0,2],[0,1,2],[0,-1,2],[1,1,1],[1,-1,1],[-1,1,1],[-1,-1,1]]){const kk=k+dy*W+dx;if(!near[kk])continue;s+=HF[c+dy*HW+dx]*q;w+=q}tmp[i]=s/w});
    idx.forEach((k,i)=>{HF[hk(k)]=tmp[i]})}
  return {tiles:n,ms:Math.round(performance.now()-T0)}}
// camp pieces are merged by material and each face got a random shade (.8-1.12): a speckle the eye reads as noise. Now a smooth
// variation over space at the face's middle (the v183 bake and detail paint add the rest).
function ep185Mottle(ax,ay,az,bx,by,bz,cx,cy,cz){const x=(ax+bx+cx)/3,y=(ay+by+cy)/3,z=(az+bz+cz)/3;
  return .93+.07*Math.sin(x*.83+z*.37+1.3)*Math.cos(z*.71-x*.29+.4)+.04*Math.sin(y*1.7+x*.23)}
// ---- ground splats with ragged edges (blood, droppings, salt): a perfect disc read as a paper plate ----
var EP185B;
function ep185Blob(i){EP185B=EP185B||[];i=((i|0)%5+5)%5;if(EP185B[i])return EP185B[i];const n=18,P=[0,0,0],idx=[];let s=i*97+13;const rnd=()=>(s=s*16807%2147483647)/2147483647;
  const rr=[];for(let k=0;k<n;k++)rr.push(.62+.5*rnd());for(let k=0;k<n;k++){const r=(rr[k]*2+rr[(k+1)%n]+rr[(k+n-1)%n])/4,a=k/n*6.2832;P.push(Math.cos(a)*r,Math.sin(a)*r,0)}
  for(let k=0;k<n;k++)idx.push(0,1+k,1+(k+1)%n);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(idx);
  g.setAttribute('uv',new THREE.Float32BufferAttribute(P.map((v,j)=>j%3==2?null:v*.5+.5).filter(v=>v!==null),2));g.computeVertexNormals();g.userData.lps=1;return EP185B[i]=g}
