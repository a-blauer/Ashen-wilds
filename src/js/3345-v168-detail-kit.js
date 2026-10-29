// ================= v168 detail kit: smoother, carved, weathered set pieces =================
// Owner: "check all newer quest elements so they don't look too low-poly (the angel graves look way too low detail); bring everything
// up to par and make them look correct physically". The v151–v165 set pieces were built from the v54/v83 primitives (6-8 sided
// cylinders, boxes, dodecahedra). This kit adds the shapes to sculpt them properly; everything still bakes through lgGroup (one mesh
// per material kind, shared geometry cached by its numbers) or, for scattered decorations, into one vertex-coloured geometry.
//  * dt168Lathe(profile, n): a turned solid; n 4 = a square section (plinths, mouldings, obelisks) with faces on x/z.
//  * dt168BBox(w,h,d,b): a box with bevelled edges (centred like BoxGeometry). dt168Ext(key, outline, depth, bevel): an extruded
//    outline in x/y (headstones, crosses, blades), centred on z.
//  * dt168Rock(seed, detail, jag, crag): a lumpy stone (noise by position, so it stays watertight; crag: angular, from a dodecahedron). dt168Mound(seed): a heaped mound.
//  * dt168Sweep(rings, n): a vertical body of elliptical rings with drapery folds (robes); ch164Tube (3251) for limbs and stems.
//  * dt168Wing(k, side, root, o): a folded feathered wing (rows of feathers on a membrane); dt168Angel(k, o): a robed mourning angel
//    (o.pose 'kneel': face in its hands, wings raised; 'stand': hands joined in prayer, wings folded down).
//  * dt168Group(key, build, W): lgGroup + weathering baked into the vertex colours once (W per material kind: grime toward the
//    ground, mottling, rain streaks, moss on upward faces, lichen spots). dt168BakeGeo(parts, W): the same as one geometry.
// Everything here is a hoisted function (the world's decorations are made at load in 0070, before this file runs); DT168 is lazy.
var DT168;
function dt168(){return DT168||(DT168={g:{}})}
function dt168Mix(a,b,t){return new THREE.Color(a).lerp(new THREE.Color(b),t).getHex()}   // lgCol (0780's const is not there yet at load)
function dt168Geo(k,f){const C=dt168().g;if(!C[k]){const g=f();g.userData.lps=1;C[k]=g}return C[k]}
// ---------------- noise ----------------
function dt168H(x,y,z,s){const k=Math.sin(x*127.1+y*311.7+z*74.7+(s||0)*17.31)*43758.5453;return k-Math.floor(k)}
function dt168N(x,y,z,s){const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),fx=x-i,fy=y-j,fz=z-k,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz),h=dt168H;
  const a=h(i,j,k,s)*(1-u)+h(i+1,j,k,s)*u,b=h(i,j+1,k,s)*(1-u)+h(i+1,j+1,k,s)*u,c=h(i,j,k+1,s)*(1-u)+h(i+1,j,k+1,s)*u,d=h(i,j+1,k+1,s)*(1-u)+h(i+1,j+1,k+1,s)*u;
  return (a*(1-v)+b*v)*(1-w)+(c*(1-v)+d*v)*w}
function dt168Fbm(x,y,z,s){return dt168N(x,y,z,s)*.55+dt168N(x*2.13,y*2.13,z*2.13,(s||0)+1)*.3+dt168N(x*4.37,y*4.37,z*4.37,(s||0)+2)*.15}
// ---------------- shapes ----------------
function dt168Lathe(pr,n){n=n||24;return dt168Geo('L'+n+':'+pr.map(p=>(+p[0]).toFixed(3)+','+(+p[1]).toFixed(3)).join(';'),()=>{const sq=n==4,k=sq?Math.SQRT2:1;
  return new THREE.LatheGeometry(pr.map(p=>new THREE.Vector2(Math.max(0,p[0]*k),p[1])),n,sq?Math.PI/4:0,Math.PI*2)})}
function dt168BBox(w,h,d,b,bs){b=Math.max(.002,Math.min(b==null?.04:b,w/2-.002,h/2-.002,d/2-.002));bs=bs||2;return dt168Geo('B'+[w,h,d,b].map(v=>v.toFixed(3)).join(',')+(bs==2?'':':'+bs),()=>{
  const x=w/2-b,z=d/2-b,s=new THREE.Shape();s.moveTo(-x,-z);s.lineTo(x,-z);s.lineTo(x,z);s.lineTo(-x,z);s.lineTo(-x,-z);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,h-2*b),steps:1,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:bs,curveSegments:1});
  g.rotateX(-Math.PI/2);g.translate(0,-(h-2*b)/2,0);g.computeVertexNormals();return g})}
// an outline [[x,y],...] extruded depth (bevel b included), centred on z; key names the outline
function dt168Ext(key,pts,depth,b,bs){b=b||0;return dt168Geo('E'+key+':'+depth.toFixed(3)+':'+b.toFixed(3),()=>{const s=new THREE.Shape(pts.map(p=>new THREE.Vector2(p[0],p[1])));
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,depth-2*b),steps:1,bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:bs||2,curveSegments:16});
  g.translate(0,0,-Math.max(.001,depth-2*b)/2);g.computeVertexNormals();return g})}
// outlines: a headstone with a rounded (k 1) or flattened (k < 1) arch top, from y0 to the shoulders at y1
function dt168ArchPts(w,y0,y1,k,n){const p=[[-w/2,y0],[w/2,y0],[w/2,y1]];n=n||14;for(let i=1;i<n;i++){const a=i/n*Math.PI;p.push([Math.cos(a)*w/2,y1+Math.sin(a)*w/2*k])}p.push([-w/2,y1]);return p}
function dt168Rock(seed,det,jag,crag){return dt168Geo('R'+seed+'_'+det+'_'+jag+(crag?'c':''),()=>{const g=new THREE.IcosahedronGeometry(1,det==null?1:det),P=g.attributes.position,j=jag==null?.45:jag,R=dkRng(seed*97+13),cut=[];
  // crag: fractured faces: the stone is cut by a few random planes (flat facets like split rock), then roughened a little
  if(crag)for(let c=0;c<7;c++){const a=R()*6.283,b=Math.acos(2*R()-1);cut.push([Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a),.62+R()*.25])}
  for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i),z=P.getZ(i);const k=1+(dt168Fbm(x*1.4+seed*.37,y*1.4,z*1.4,seed)-.5)*(crag?j*.4:j);x*=k;y*=k;z*=k;
    for(const [nx,ny,nz,d] of cut){const t=x*nx+y*ny+z*nz;if(t>d){x-=nx*(t-d);y-=ny*(t-d);z-=nz*(t-d)}}P.setXYZ(i,x,y,z)}g.computeVertexNormals();return g})}
// a heaped mound (radius 1, height 1 before scaling), its rim just below the ground
function dt168Mound(seed){return dt168Geo('M'+seed,()=>{const g=new THREE.SphereGeometry(1,22,12),P=g.attributes.position;   // closed: the lower half is pressed flat under the rim
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),n=dt168Fbm(x*2.6+seed,Math.max(0,y)*2.6,z*2.6,seed),n2=dt168N(x*7+seed,Math.max(0,y)*7,z*7,seed+4),k=1+(n-.5)*.3+(n2-.5)*.08;
    P.setXYZ(i,x*k,y>0?y*(.75+n*.5+(n2-.5)*.25)-.06:-.06+y*.04,z*k)}g.computeVertexNormals();return g})}
// a vertical body: rings [y, rx, r front (+z), r back (-z), cx, cz, fold, phase]; folds ripple the ring (o.fk ripples per turn; o.reg:
// even rounded lobes, as on a bundled column)
function dt168Sweep(key,rings,n,o){o=o||{};return dt168Geo('S'+key,()=>{const pos=[],idx=[],W=n+1,NR=rings.length,fk=o.fk||9;
  for(let r=0;r<NR;r++){const q=rings[r];for(let k=0;k<=n;k++){const a=k/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a),f=o.reg?1+(q[6]||0)*(2*Math.pow(Math.abs(Math.sin(a*fk/2)),.6)-1):1+(q[6]||0)*Math.sin(a*fk+(q[7]||0))*(.6+.4*Math.sin(a*3.1+r));
    pos.push((q[4]||0)+c*q[1]*f,q[0],(q[5]||0)+s*(s>=0?q[2]:q[3])*f)}}
  for(let r=0;r<NR-1;r++)for(let k=0;k<n;k++){const a=r*W+k,b=a+1,c=a+W,d=c+1;idx.push(a,c,b,b,c,d)}
  if(o.bot){const q=rings[0],ci=pos.length/3;pos.push(q[4]||0,q[0],q[5]||0);for(let k=0;k<n;k++)idx.push(ci,k,k+1)}
  if(o.top){const r=NR-1,q=rings[r],ci=pos.length/3;pos.push(q[4]||0,q[0]+(o.top>0?o.top:0),q[5]||0);for(let k=0;k<n;k++)idx.push(ci,r*W+k+1,r*W+k)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g})}
// a feather blade along +x (0..1), width along y (±.5), a thin curved sheet (the 'c' material is two-sided; the wing has a membrane)
function dt168Feather(){return dt168Geo('feather',()=>{const up=[],dn=[];for(let i=1;i<10;i++){const t=i/10,w=.5*Math.pow(Math.sin(Math.PI*Math.min(1,t*.92+.04)),.75)*(t>.8?1-(t-.8)*2.2:1);up.push(new THREE.Vector2(t,w*1.05));dn.unshift(new THREE.Vector2(t,-w*.85))}
  const g=new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0,0)].concat(up,[new THREE.Vector2(1.04,.02)],dn))),P=g.attributes.position;
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i);P.setZ(i,.05*Math.sin(Math.PI*Math.min(1,x))+.06*y*y)}g.computeVertexNormals();return g})}
// push a part with a ready matrix (dkKit parts are {bn, geo, t, col, m})
function dt168P(k,geo,t,col,m){k.P.push({bn:'',geo,t,col,m});return k}
function dt168Mx(x,y,z,rx,ry,rz,sx,sy,sz,ord){return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0,ord||'XYZ')),new THREE.Vector3(sx==null?1:sx,sy==null?(sx==null?1:sx):sy,sz==null?(sx==null?1:sx):sz))}
// a matrix from an x axis (dir) and an out axis (z), scaled (sx, sy, sz), at p
function dt168Basis(p,dir,out,sx,sy,sz){const X=dir.clone().normalize(),Y=new THREE.Vector3().crossVectors(out,X).normalize(),Z=new THREE.Vector3().crossVectors(X,Y);
  const m=new THREE.Matrix4().makeBasis(X,Y,Z);m.scale(new THREE.Vector3(sx,sy,sz==null?1:sz));m.setPosition(p);return m}
// a smooth tube part (ch164Tube: pts, radii, sides) in the kit
function dt168T(k,key,t,col,pts,rad,n,tip){return dt168P(k,dt168Geo('T'+key,()=>ch164Tube(pts,rad,n||10,tip?{tip}:{})),t,col,new THREE.Matrix4())}
// ---------------- the angel ----------------
// one folded wing (side s ±1) from the shoulder blade (root [x,y,z]); o.sc size, o.spread (out from straight back), o.lift (how high
// the primaries rise: 1 raised over the head, 0 hanging), o.col / o.col2 (feather / covert stone), o.key (cache key)
function dt168Wing(k,s,root,o){const V3=THREE.Vector3,sc=o.sc||1,sp=o.spread==null?.42:o.spread,lift=o.lift==null?1:o.lift,R=new V3(root[0],root[1],root[2]);
  const B=new V3(s*Math.sin(sp),0,-Math.cos(sp)),U=new V3(s*.12,1,0).normalize(),O=new V3().crossVectors(B,U).normalize().multiplyScalar(s);
  const P2=(u,v,w)=>R.clone().addScaledVector(B,u*sc).addScaledVector(U,v*sc).addScaledVector(O,(w||0)*sc+.06*u*u*sc);
  const D2=(th)=>B.clone().multiplyScalar(Math.cos(th)).addScaledVector(U,Math.sin(th));
  const le=t=>[.02+.3*Math.sin(t*1.45)*(.55+.45*lift),.05+1.12*t*(.6+.4*lift)];   // the leading edge, root (t 0) to the wrist / top (t 1)
  const fth=dt168Feather(),c1=o.col,c2=o.col2==null?o.col:o.col2,N=13,mem=[];
  // flight feathers: from the top (pointing up and back) round to the bottom (hanging down behind)
  for(let i=0;i<N;i++){const t=i/(N-1),q=le(1-t*.98),th=(1.25*lift+.15*(1-lift))-(2.95+.25*(1-lift))*Math.pow(t,.85),L=(t<.3?.95-.5*t:.6+.6*(t-.3))*(i==0?.9:1),
      p=P2(q[0],q[1],-.02+.004*i),d=D2(th);dt168P(k,fth,'c',dt168Mix(c1,c2,(i%3)*.12),dt168Basis(p,d,O,L*sc,.24*sc,1));mem.push([q[0]+Math.cos(th)*L*.55,q[1]+Math.sin(th)*L*.55])}
  // coverts in two rows over them, then the small marginal feathers on the leading edge
  [[11,.5,.2,.025],[9,.28,.16,.05],[7,.15,.12,.07]].forEach(([n,L,wd,w],r)=>{for(let i=0;i<n;i++){const t=(i+.5)/n,q=le(1-t*.95),th=(1.15*lift+.1*(1-lift))-(2.8+.2*(1-lift))*Math.pow(t,.85)+.08*r;
    dt168P(k,fth,'c',dt168Mix(c2,c1,.25*r+(i%2)*.1),dt168Basis(P2(q[0]-.02*r,q[1],w),D2(th),O,L*sc*(1+.15*Math.sin(i*1.7)),wd*sc,1))}});
  // the membrane under the feathers (no gaps between them) and the arm along the leading edge
  const pts=[];for(let i=0;i<=8;i++){const q=le(i/8);pts.push([q[0],q[1]])}for(let i=mem.length-1;i>=0;i--)pts.push(mem[i]);
  {const g=dt168Geo('wm'+o.key+s,()=>{const flat=dt168Ext('wmo'+o.key,pts,.05,.015,1).clone(),A=flat.attributes.position;
      for(let i=0;i<A.count;i++){const p=P2(A.getX(i),A.getY(i),A.getZ(i)/sc+.0);A.setXYZ(i,p.x,p.y,p.z)}flat.computeVertexNormals();return flat});dt168P(k,g,'c',dt168Mix(c2,0x202020,.1),new THREE.Matrix4())}
  const arm=[];for(let i=0;i<=10;i++){const q=le(i/10),p=P2(q[0]-.03,q[1],.0);arm.push([p.x,p.y,p.z])}
  dt168T(k,'warm'+o.key+s,'c',c2,arm,arm.map((_,i)=>(.075-.04*i/10)*sc),9)}
// o: {pose 'kneel'|'stand', y0 (where it stands), s (stone), s2 (darker), s3 (paler), key}
function dt168Angel(k,o){const Y=o.y0||0,sA=o.s,sB=o.s2,sC=o.s3,kn=o.pose=='kneel',key=o.key||o.pose,V3=THREE.Vector3;
  if(kn){// kneeling, sitting back on its heels, leaning over its knees, face buried in its hands
    const rg=[[0,.6,.8,.52,0,.12,.05,0],[.06,.62,.82,.54,0,.13,.06,.5],[.2,.58,.76,.5,0,.12,.055,1],[.36,.5,.6,.46,0,.07,.045,1.5],[.52,.42,.38,.42,0,.0,.03,2],
      [.7,.39,.3,.34,0,-.02,.02,2.4],[.88,.41,.3,.31,0,.03,.012,2.7],[1.04,.44,.27,.27,0,.1,.008,3],[1.13,.38,.22,.23,0,.14,0,0],[1.2,.2,.14,.15,0,.18,0,0],[1.27,.1,.09,.1,0,.22,0,0]];
    dt168P(k,dt168Sweep('ak',rg.map(q=>{const r=q.slice();r[0]+=Y;return r}),28,{bot:1,fk:11}),'c',sA,new THREE.Matrix4());
    // hem pooling on the plinth and the toes of the folded feet behind
    for(let i=0;i<9;i++){const a=-1.1+i*.28;dt168P(k,dt168Rock(30+i,1,.3),'c',dt168Mix(sA,sB,.2),dt168Mx(Math.sin(a)*.66,Y+.03,.12+Math.cos(a)*.78,0,a,0,.16,.06,.12))}
    // the head, bowed, under a veil that falls to the shoulders
    dt168P(k,dt168Lathe([[0,-1],[.55,-.85],[.85,-.5],[1,0],[.88,.5],[.55,.85],[0,1]],18),'c',sC,dt168Mx(0,Y+1.36,.36,.75,0,0,.14,.17,.15));
    const vl=[[1.08,.4,.24,.3,0,.08,.03,0],[1.18,.3,.2,.27,0,.12,.03,.6],[1.28,.2,.16,.22,0,.2,.02,1],[1.38,.17,.16,.2,0,.28,.01,1.4],[1.47,.15,.13,.17,0,.33,0,0],[1.53,.09,.08,.11,0,.36,0,0],[1.56,.02,.02,.03,0,.37,0,0]];
    dt168P(k,dt168Sweep('akv',vl.map(q=>{const r=q.slice();r[0]+=Y;return r}),24,{fk:13}),'c',sB,new THREE.Matrix4());
    // arms in wide sleeves, the hands over the face
    [-1,1].forEach(s=>{const sh=[s*.36,Y+1.08,.14],el=[s*.33,Y+.8,.5],wr=[s*.12,Y+1.2,.52],hd=[s*.07,Y+1.34,.5];
      dt168T(k,key+'ua'+s,'c',sA,[sh,[s*.38,Y+.95,.3],el],[.085,.08,.075],10);dt168T(k,key+'fa'+s,'c',sA,[el,[s*.22,Y+1.0,.54],[s*.14,Y+1.14,.54],wr],[.075,.08,.09,.1],12);
      dt168P(k,dt168Lathe([[0,-1],[.7,-.7],[1,0],[.8,.6],[0,1]],12),'c',sC,dt168Mx(hd[0],hd[1],hd[2],.5,0,s*.25,.05,.085,.03));
      for(let f=0;f<4;f++)dt168T(k,key+'fg'+s+f,'c',sC,[[hd[0]+s*(-.03+f*.018),hd[1]+.06,hd[2]+.02],[hd[0]+s*(-.04+f*.02),hd[1]+.14,hd[2]-.02]],[.014,.011],6,.01)});
    dt168Wing(k,-1,[-.2,Y+1.02,-.16],{sc:1.15,spread:.5,lift:1,col:sA,col2:sC,key:key+'w'});dt168Wing(k,1,[.2,Y+1.02,-.16],{sc:1.15,spread:.5,lift:1,col:sA,col2:sC,key:key+'w'})}
  else{// standing, head bowed over hands joined in prayer, wings folded down
    const rg=[[0,.4,.46,.38,0,.03,.07,0],[.08,.38,.43,.36,0,.03,.07,.4],[.4,.31,.3,.29,0,.02,.06,.9],[.8,.26,.21,.23,0,.01,.04,1.3],[1.04,.23,.17,.2,0,.0,.02,1.6],
      [1.26,.26,.19,.19,0,.02,.01,1.8],[1.42,.28,.16,.17,0,.03,.005,2],[1.5,.2,.12,.13,0,.04,0,0],[1.57,.08,.07,.07,0,.05,0,0]];
    dt168P(k,dt168Sweep('as',rg.map(q=>{const r=q.slice();r[0]+=Y;return r}),26,{bot:1,fk:12}),'c',sA,new THREE.Matrix4());
    dt168P(k,dt168Lathe([[0,-1],[.55,-.85],[.85,-.5],[1,0],[.88,.5],[.55,.85],[0,1]],16),'c',sC,dt168Mx(0,Y+1.7,.08,.5,0,0,.12,.145,.13));
    const vl=[[1.4,.29,.18,.2,0,.0,.02,0],[1.52,.2,.13,.16,0,.02,.02,.6],[1.62,.15,.12,.16,0,.05,.01,1],[1.72,.14,.13,.15,0,.08,0,0],[1.8,.1,.09,.11,0,.1,0,0],[1.85,.02,.02,.02,0,.11,0,0]];
    dt168P(k,dt168Sweep('asv',vl.map(q=>{const r=q.slice();r[0]+=Y;return r}),20,{fk:13}),'c',sB,new THREE.Matrix4());
    [-1,1].forEach(s=>{const sh=[s*.27,Y+1.42,0],el=[s*.25,Y+1.12,.1],wr=[s*.05,Y+1.3,.27];dt168T(k,key+'ua'+s,'c',sA,[sh,[s*.29,Y+1.27,.03],el],[.075,.07,.07],9);
      dt168T(k,key+'fa'+s,'c',sA,[el,[s*.16,Y+1.2,.22],wr],[.07,.08,.1],9);dt168P(k,dt168Lathe([[0,-1],[.7,-.7],[1,0],[.8,.6],[0,1]],10),'c',sC,dt168Mx(s*.022,Y+1.4,.28,-.15,0,0,.03,.09,.05))});
    dt168Wing(k,-1,[-.14,Y+1.32,-.1],{sc:.85,spread:.45,lift:.7,col:sA,col2:sC,key:key+'w'});dt168Wing(k,1,[.14,Y+1.32,-.1],{sc:.85,spread:.45,lift:.7,col:sA,col2:sC,key:key+'w'})}}
// the Dirge's scattered mourning angel (1680's 'd_angel', instanced): a standing angel praying on a moulded plinth
function dt168AngelDeco(){const C=dt168();if(C.deco)return C.deco;const k=dkKit(),sA=0x8a8a90,sB=0x6e6e74,sC=0x9a9aa0;
  dt168P(k,dt168Lathe([[0,-.45],[.56,-.45],[.56,.3],[.53,.34],[.46,.36],[.44,.42],[.4,.46],[.4,.9],[.43,.93],[.47,.98],[.48,1.03],[.45,1.06],[0,1.06]],4),'c',sB,new THREE.Matrix4());
  dt168Angel(k,{pose:'stand',y0:1.06,s:sA,s2:sB,s3:sC,key:'deco'});
  return C.deco=dt168BakeGeo(k.P,{g:[.9,.4],n:.18,s:.3,m:[0x3a4a34,1,.32],l:[0x9a9a7a,.6],sd:3})}
// ---------------- weathering, baked into the vertex colours ----------------
// W: {g:[height, amount] grime toward y0, n: mottling, s: rain streaks, m:[hex, amount, min ny] moss, l:[hex, amount] lichen, y0, sd}
function dt168Weather(G,W){const P=G.attributes.position,N=G.attributes.normal,C=G.attributes.color;if(!C)return;const mc=W.m?new THREE.Color(W.m[0]):null,lc=W.l?new THREE.Color(W.l[0]):null,c=new THREE.Color(),y0=W.y0||0,sd=W.sd||7;
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),ny=N?N.getY(i):0;c.setRGB(C.getX(i),C.getY(i),C.getZ(i));let f=1;
    if(W.g)f*=1-W.g[1]*Math.max(0,Math.min(1,1-(y-y0)/W.g[0]));
    if(W.n)f*=1+(dt168Fbm(x*3.1,y*3.1,z*3.1,sd)-.5)*W.n*2;
    if(W.s)f*=1-W.s*Math.max(0,dt168N(x*11+z*7,y*.7,z*11-x*3,sd+5)-.5)*2*(ny<.5?1:.3);
    c.multiplyScalar(f);
    if(mc){const m=Math.max(0,Math.min(1,(ny-W.m[2])/(1-W.m[2])))*Math.max(0,dt168Fbm(x*2.3,y*2.3,z*2.3,sd+9)*1.8-.55)+Math.max(0,1-(y-y0)/.35)*.5*dt168N(x*5,y*5,z*5,sd+3);c.lerp(mc,Math.min(1,m*W.m[1]))}
    if(lc){const l=dt168N(x*7.3,y*7.3,z*7.3,sd+13);if(l>.72)c.lerp(lc,Math.min(1,(l-.72)*3.5*W.l[1]))}
    C.setXYZ(i,c.r,c.g,c.b)}C.needsUpdate=true}
// lgGroup, then weather the cached geometries once (W per kind: {c:{...}, m:{...}})
function dt168Group(key,build,W,mot){const g=lgGroup(key,build,mot==null?.06:mot),gs=typeof LGB!='undefined'&&LGB[key];
  if(W&&gs)for(const t in gs){const w=W[t];if(w&&!gs[t].userData.w168){dt168Weather(gs[t],w);gs[t].userData.w168=1}}return g}
// every part into one geometry with vertex colours (scattered decorations are instanced from it)
function dt168BakeGeo(P,W){const pos=[],nor=[],col=[],idx=[],v=new THREE.Vector3(),c=new THREE.Color(),nm=new THREE.Matrix3();let off=0;
  P.forEach(p=>{const g=p.geo,pa=g.attributes.position,na=g.attributes.normal,n=pa.count;c.set(p.col);nm.getNormalMatrix(p.m);
    for(let i=0;i<n;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);pos.push(v.x,v.y,v.z);if(na){v.fromBufferAttribute(na,i).applyMatrix3(nm).normalize();nor.push(v.x,v.y,v.z)}else nor.push(0,1,0);col.push(c.r,c.g,c.b)}
    if(g.index){const ix=g.index.array;for(let i=0;i<ix.length;i++)idx.push(ix[i]+off)}else for(let i=0;i<n;i++)idx.push(i+off);off+=n});
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));G.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  G.setIndex(idx);if(W)dt168Weather(G,W);G.computeBoundingSphere();return G}
// ---------------- upgrading an existing kit ----------------
// dt168Up(k, o): from here on the kit's primitives come out finer: boxes bevelled (b: the bevel as a share of the smallest side, cap
// o.b), cylinders / cones / spheres / rings / tapers with more sides, dodecahedron rocks lumpy. Old builders call it first and keep
// their numbers (a set piece's layout, colliders and logic are unchanged). o.nb: no bevels (only rounder shapes); o.bmin: bevel only
// boxes whose smallest side is over it (a city of thousands of boxes: walls and blocks, not the trim).
function dt168Up(k,o){o=o||{};if(k.up168)return k;k.up168=1;const p0=k.p,L0=k.L,G=()=>{const D=dt168();return D.ug||(D.ug={cyl:new THREE.CylinderGeometry(1,1,1,20),cone:new THREE.ConeGeometry(1,1,16),
    sph:new THREE.SphereGeometry(1,16,11),sph2:new THREE.SphereGeometry(1,18,13),hem:new THREE.SphereGeometry(1,18,7,0,Math.PI*2,0,Math.PI/2),tor:new THREE.CylinderGeometry(1,.82,1,18),
    skirt:new THREE.CylinderGeometry(.55,1,1,22,1,true),tube:new THREE.CylinderGeometry(1,1,1,18,1,true),ring:new THREE.TorusGeometry(1,.12,7,28).rotateX(Math.PI/2)})},bmax=o.b==null?.06:o.b;let sd=0;
  k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){if(typeof geo=='string'){const sy1=sy==null?sx:sy,sz1=sz==null?sx:sz;
      if(geo=='box'&&!o.nb){const m=Math.min(Math.abs(sx),Math.abs(sy1),Math.abs(sz1));if(m>(o.bmin||.035))return p0.call(k,bn,dt168BBox(Math.abs(sx),Math.abs(sy1),Math.abs(sz1),Math.min(bmax,m*.14),o.bs||1),t,col,x,y,z,1,1,1,rx,ry,rz)}
      else if(geo=='dod')return p0.call(k,bn,dt168Rock(150+(sd++)%12,1,.5,1),t,col,x,y,z,sx*1.12,sy1*1.12,sz1*1.12,rx,ry,rz);
      else if(Math.max(Math.abs(sx),Math.abs(sy1),Math.abs(sz1))>.07&&Math.min(Math.abs(sx),Math.abs(sz1))>.045){const U=G()[geo];if(U)geo=U}}
    return p0.call(k,bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz)};
  k.L=function(bn,t,col,a,b,r1,r2,seg){const r=Math.max(r1,r2==null?r1:r2);return L0.call(k,bn,t,col,a,b,r1,r2,Math.max(seg||6,r>.2?18:r>.06?12:r>.025?8:seg||6))};
  return k}
// lgGroup with the kit upgraded and the result weathered (W optional)
function dt168G(key,build,W,mot){return dt168Group(key,k=>{dt168Up(k);build(k)},W||null,mot==null?.05:mot)}
// ---------------- small props ----------------
// apply M (before their own matrices) to the parts added since index i0: tilt a headstone about its foot, lift it to the ground
function dt168Xf(k,i0,M){for(let i=i0;i<k.P.length;i++)k.P[i].m=M.clone().multiply(k.P[i].m);return k}
// a barked log along y (radius 1, length 1, centred, like CylinderGeometry(1,1,1)): ridged bark, sawn ends
function dt168Log(sd){sd=sd%6;return dt168Geo('log'+sd,()=>{const g=new THREE.CylinderGeometry(1,1,1,12,3),P=g.attributes.position;
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),r=Math.hypot(x,z);if(r<.5)continue;const a=Math.atan2(z,x),k=1+.06*Math.sin(a*7+sd)*(.6+.4*Math.sin(y*9+sd))+(dt168N(a*2,y*5,sd,sd)-.5)*.1;P.setX(i,x*k);P.setZ(i,z*k)}
  g.computeVertexNormals();return g})}
// a tuft of grass blades (base at 0, ~h tall), bent outward
function dt168Tuft(sd,n,h){return dt168Geo('tuft'+sd+'_'+n+'_'+h,()=>{const pos=[],R=dkRng(sd*31+7);n=n||7;h=h||.3;
  for(let i=0;i<n;i++){const a=R()*6.283,l=h*(.6+R()*.6),w=.018+R()*.012,b=.25+R()*.5,ox=(R()-.5)*.08,oz=(R()-.5)*.08,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
    const P=t=>[ox+ca*b*l*t*t,l*t,oz+sa*b*l*t*t],p0=P(0),p1=P(.5),p2=P(1);
    pos.push(p0[0]-px*w,p0[1],p0[2]-pz*w, p0[0]+px*w,p0[1],p0[2]+pz*w, p1[0]+px*w*.6,p1[1],p1[2]+pz*w*.6, p0[0]-px*w,p0[1],p0[2]-pz*w, p1[0]+px*w*.6,p1[1],p1[2]+pz*w*.6, p1[0]-px*w*.6,p1[1],p1[2]-pz*w*.6,
      p1[0]-px*w*.6,p1[1],p1[2]-pz*w*.6, p1[0]+px*w*.6,p1[1],p1[2]+pz*w*.6, p2[0],p2[1],p2[2])}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g})}
// a skull (about s .2 tall) at (x,y,z) facing +z turned ry: cranium, cheekbones, jaw, dark sockets and nose
// lv 1: the full skull (cheekbones, teeth); lv 0 (small or many): cranium, face, jaw, sockets
function dt168SkullGeo(lv){return dt168Geo('skull'+lv,()=>{const k=dkKit(),hi=lv>0,eg=dt168Lathe([[0,-1],[.6,-.8],[.95,-.3],[1,.15],[.85,.6],[.45,.92],[0,1]],hi?12:8),sp=hi?dt168Lathe([[0,-1],[.8,-.6],[1,0],[.8,.6],[0,1]],8):dt168Lathe([[0,-1],[1,0],[0,1]],6);
  dt168P(k,eg,'c',0xffffff,dt168Mx(0,.06,-.01,-.25,0,0,.47,.5,.56));dt168P(k,dt168BBox(.56,.3,.42,hi?.1:.06,hi?2:1),'c',0xffffff,dt168Mx(0,-.16,.12));dt168P(k,dt168BBox(.4,.16,.3,hi?.07:.05,hi?2:1),'c',0xe8e8e8,dt168Mx(0,-.38,.16));
  if(hi){[-1,1].forEach(q=>dt168P(k,sp,'c',0xffffff,dt168Mx(q*.26,-.2,.2,0,0,0,.09,.07,.1)));for(let i=0;i<6;i++)dt168P(k,dt168BBox(.045,.06,.03,.01),'c',0xffffff,dt168Mx(-.13+i*.052,-.33,.32))}
  const B=dt168BakeGeo(k.P),d=dkKit();[-1,1].forEach(q=>dt168P(d,sp,'c',0xffffff,dt168Mx(q*.17,-.08,.33,0,0,0,.12,.11,.08)));dt168P(d,dt168Lathe([[0,0],[1,0],[0,1]],3),'c',0xffffff,dt168Mx(0,-.25,.37,Math.PI,0,0,.05,.09,.04));
  B.userData.dark=dt168BakeGeo(d.P);return B})}
// a skull (about s tall) at (x,y,z) facing +z turned ry; lv as above (default: full when s > .25)
function dt168Skull(k,x,y,z,ry,s,col,dark,lv){const G=dt168SkullGeo(lv==null?(s>.25?1:0):lv),M=dt168Mx(x,y,z,0,ry||0,0,s/.95,s/.95,s/.95);dt168P(k,G,'c',col,M);dt168P(k,G.userData.dark,'c',dark||0x0a0908,M.clone());return k}
// an iron lantern (hexagonal frame, glass, cap and ring), its bottom at y; the glass is 'g' (glow) in colour gl
function dt168Lantern(k,x,y,z,s,gl,iron){s=s||1;iron=iron||0x2a2c30;const M=(dx,dy,dz,sx)=>dt168Mx(x+dx*s,y+dy*s,z+dz*s,0,0,0,sx*s,sx*s,sx*s);
  dt168P(k,dt168Lathe([[0,0],[.1,0],[.11,.02],[.09,.04],[0,.04]],6),'m',iron,M(0,0,0,1));
  dt168P(k,dt168Lathe([[0,-.01],[.075,0],[.075,.2],[0,.21]],6),'g',gl||0x9affd0,M(0,.04,0,1));
  for(let i=0;i<6;i++){const a=i/6*6.283+.52;k.L('','m',iron,[x+Math.cos(a)*.088*s,y+.03*s,z+Math.sin(a)*.088*s],[x+Math.cos(a)*.088*s,y+.25*s,z+Math.sin(a)*.088*s],.007*s,.007*s,4)}
  dt168P(k,dt168Lathe([[0,0],[.11,0],[.115,.015],[.07,.08],[.03,.11],[.02,.14],[0,.15]],6),'m',iron,M(0,.24,0,1));
  dt168P(k,dt168Geo('lring',()=>new THREE.TorusGeometry(1,.18,5,12)),'m',iron,dt168Mx(x,y+.42*s,z,0,0,0,.03*s,.03*s,.03*s))}
// a wax candle with drips and a pool at its foot (base at y)
function dt168Candle(k,x,y,z,h,col){h=h||.22;col=col||0xd0c4a2;const r=.034;dt168P(k,dt168Lathe([[0,0],[r*1.05,0],[r,h*.6],[r*.97,h],[r*.6,h+.008],[0,h+.012]],10),'c',col,dt168Mx(x,y,z));
  for(let i=0;i<3;i++){const a=i*2.3+x*7;dt168P(k,dt168Lathe([[0,-1],[.8,-.6],[1,.2],[.6,.8],[0,1]],6),'c',dt168Mix(col,0xfff4d8,.2),dt168Mx(x+Math.cos(a)*r,y+h*(.55+i*.13),z+Math.sin(a)*r,0,a,0,.012,.03+i*.008,.012))}
  dt168P(k,dt168Lathe([[0,0],[.06,0],[.055,.012],[0,.016]],10),'c',dt168Mix(col,0x8a7a5a,.25),dt168Mx(x,y,z));dt168P(k,dt168Lathe([[0,0],[.004,0],[.003,.025],[0,.03]],5),'c',0x1a1410,dt168Mx(x,y+h+.008,z))}
