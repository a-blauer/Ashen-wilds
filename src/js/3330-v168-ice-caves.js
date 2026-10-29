// ================= v168 Ice caves: the Frozen Maw's cave mouths rebuilt =================
// The owner: "Ice cave entrance in Burningeye Summit 1 looks wrong. The cave structure itself is super jagged and needs more detail.
// The entrance itself has an object in it. Same with the cave entrance once Gorthrak dies."
// Before: the mouths (3152 gb151CaveMouth outside, and the passage at the back of the cave) were piles of svLump rocks: icosahedra
// whose every triangle corner was jittered on its own (cracked, spiky), and two of the big rocks reached into the throat (the back
// rock of the mound and the inner jamb stones), so a pale lump stood in the opening; a bright glow sprite hung in the throat too.
// Now every cave opening is one builder, gb168Cave(o):
//  * a passage (an arch-shaped tunnel lining, ~9 deep, bending a little and narrowing) whose rock darkens with depth to black, a
//    floor of snow that fades into the dark, and a black end: it reads as a passage running into the mountain;
//  * the rock round it: smooth sculpted masses (a rounded rim, two buttresses, a block over the arch and the hill behind), with
//    layered strata ledges, snow settled on every upward face and dark undersides (vertex colours, smooth shading);
//  * nothing may enter the opening: every vertex of the rock that falls inside the passage's shape (extended out in front of the
//    mouth too) is pushed out to its wall (gb168Push), and the hill behind has its triangles inside the passage cut away;
//  * ice: a glacier cap on top, a lip of clear ice along the arch with icicles hanging from it (never lower than head height over
//    the way in), icicles just inside the throat, a frozen fall down one buttress, frost crystals at the foot, snow drifts on both
//    sides of the threshold;
//  * an optional plug of ancient ice shaped to the arch (the fight's seal at the cave mouth, the wall over the passage).
// Used by 3152: gb151CaveMouth (the mouth at the end of Burningeye I) and gb151LairBuild (the way out to Burningeye I, with
// daylight at its end, and the passage at the back, black until Gorthrak dies, then a cold blue glow far down it).
var GB168={m:null,tris:0};
function gb168H(x,y,z,s){const n=Math.sin(x*127.1+y*311.7+z*74.7+s*19.19)*43758.5453;return n-Math.floor(n)}
function gb168N(x,y,z,s){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=x-ix,fy=y-iy,fz=z-iz,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz),
  L=(a,b,t)=>a+(b-a)*t,h=(i,j,k)=>gb168H(ix+i,iy+j,iz+k,s);
  return L(L(L(h(0,0,0),h(1,0,0),u),L(h(0,1,0),h(1,1,0),u),v),L(L(h(0,0,1),h(1,0,1),u),L(h(0,1,1),h(1,1,1),u),v),w)*2-1}
function gb168F(x,y,z,s,o){let a=0,f=1,amp=1,t=0;for(let i=0;i<(o||4);i++){a+=gb168N(x*f,y*f,z*f,s+i*7)*amp;t+=amp;f*=2.03;amp*=.5}return a/t}
function gb168Mats(){return GB168.m||(GB168.m={
  rock:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.88,metalness:.02,side:THREE.DoubleSide}),
  tun:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,side:THREE.DoubleSide}),
  ice:new THREE.MeshStandardMaterial({color:0x9fd4f0,emissive:0x16466e,emissiveIntensity:.42,roughness:.1,metalness:.12,transparent:true,opacity:.86}),
  ice2:new THREE.MeshStandardMaterial({color:0xc4e8fa,emissive:0x2a6a9a,emissiveIntensity:.3,roughness:.06,metalness:.1,transparent:true,opacity:.7,depthWrite:false}),
  snow:new THREE.MeshStandardMaterial({color:0xe8f0f6,roughness:.95}),
  plug:new THREE.MeshStandardMaterial({color:0xa8dcf4,emissive:0x1e5a8a,emissiveIntensity:.5,roughness:.08,metalness:.15,transparent:true,opacity:.74,depthWrite:false}),
  dark:new THREE.MeshBasicMaterial({color:0x010203,fog:false}),
  glint:new THREE.MeshStandardMaterial({color:0x6ab8e8,emissive:0x2a7ab8,emissiveIntensity:.9,roughness:.1})})}
// the arch: a superellipse from the left foot over the top to the right foot ([x, y] from the floor centre)
const GB168P=2.6;
function gb168Arch(W,H,t){const ph=Math.PI*(1-t),c=Math.cos(ph),s=Math.max(0,Math.sin(ph)),e=2/GB168P;return [W*Math.sign(c)*Math.pow(Math.abs(c),e),H*Math.pow(s,e)]}
// the passage's shape at depth z (z > 0 is in front of the mouth): width, height, sideways bend
function gb168Sec(o,z){const d=Math.max(0,-z),k=Math.min(1,d/o.D);return {W:o.W*(1-.2*k),H:o.H*(1-.22*k),x:Math.sin(d*.33)*.55*Math.min(1,d/3)}}
// is (x, y, z) inside the passage (or the open air straight in front of it)? r < 1 inside, r = 1 on its wall
function gb168R(o,x,y,z){if(z<-o.D-.4)return 9;const S=gb168Sec(o,z),X=Math.abs(x-S.x)/S.W,Y=Math.max(0,y)/S.H;return Math.pow(Math.pow(X,GB168P)+Math.pow(Y,GB168P),1/GB168P)}
// push a vertex out of the passage to its wall plus a margin (more inside the tunnel, so the lining always shows in front of the rock)
function gb168Push(o,v){const r=gb168R(o,v.x,v.y,v.z);if(r>=1.0||v.y>o.H*1.6)return false;const S=gb168Sec(o,v.z),m=.36*Math.max(0,Math.min(1,(.8-v.z)/1.2));
  let X=(v.x-S.x)/S.W,Y=Math.max(0,v.y)/S.H;if(r<1e-3){X=v.x<S.x?-1:1;Y=0}else{X/=r;Y/=r}
  const nx=X,ny=Y,nl=Math.hypot(nx,ny)||1;v.x=S.x+X*S.W+nx/nl*m;if(v.y>0)v.y=Y*S.H+ny/nl*m;return true}
// a sculpted rock mass: a sphere pushed about by noise, layered ledges, then out of the passage (mode 'push': pieces beside it are
// pushed to its wall, anything deep inside is cut away; 'cut': the hill behind loses every triangle inside); strata with snow on top
function gb168Mass(o,cx,cy,cz,sx,sy,sz,seed,mode,seg){const S0=seg||56,g=new THREE.SphereGeometry(1,S0,Math.round(S0*.7)),P=g.attributes.position,v=new THREE.Vector3(),cut=[];
  for(let i=0;i<P.count;i++){v.set(P.getX(i),P.getY(i),P.getZ(i));
    // the shape: broad lumps and hollows, then finer weathering; tops flattened into shelves (mesa-like, not domes)
    const n=gb168F(v.x*.9,v.y*1.1,v.z*.9,seed,4),n2=gb168F(v.x*3.2,v.y*3.2,v.z*3.2,seed+3,3);let k=1+.26*n+.035*n2;
    let yy=v.y*k;if(yy>.45)yy=.45+(yy-.45)*.45;
    // strata: tilted, unevenly spaced layers that stand out as ledges where the noise allows
    const wx=cx+v.x*sx*k,wy=cy+yy*sy,wz=cz+v.z*sz*k,ph=wy*1.05+wx*.12+.55*gb168N(wx*.25,wy*.3,wz*.25,seed+9),led=(ph%1+1)%1,st=Math.max(0,gb168N(wx*.4,wy*.2,wz*.4,seed+10)+.2);
    const lk=1+(led<.18?led/.18:(1-led)/.82)*.065*st;
    v.set(cx+v.x*sx*k*lk,cy+yy*sy*(lk>1?1+(lk-1)*.3:1),cz+v.z*sz*k*lk);if(v.y<-1.6)v.y=-1.6;
    const r=mode!=='none'&&v.y<o.H*1.6?gb168R(o,v.x,v.y,v.z):9;if(mode==='cut'?r<1.06&&v.z<.8:r<.6)cut[i]=1;else if(mode==='push')gb168Push(o,v);
    P.setXYZ(i,v.x,v.y,v.z)}
  if(cut.length){const I=g.index.array,keep=[];for(let i=0;i<I.length;i+=3)if(!cut[I[i]]&&!cut[I[i+1]]&&!cut[I[i+2]])keep.push(I[i],I[i+1],I[i+2]);g.setIndex(keep)}
  g.computeVertexNormals();gb168Paint(g,seed,o);return g}
// the rim of the mouth: a thick weathered roll of rock following the arch (its feet sunk in the ground), never inside the opening
function gb168Rim(o,seed){const W=o.W,H=o.H,pts=[];for(let i=0;i<=24;i++){const t=i/24,[x,y]=gb168Arch(W+.62,H+.55,t);pts.push(new THREE.Vector3(x,i==0||i==24?-.9:y,.25+.12*Math.sin(t*9)))}
  const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),72,.78,14,false),P=g.attributes.position,N=g.attributes.normal,v=new THREE.Vector3();
  for(let i=0;i<P.count;i++){v.set(P.getX(i),P.getY(i),P.getZ(i));const n=gb168F(v.x*.9,v.y*.9,v.z*.9,seed,4),led=((v.y*1.05+.4*n)%1+1)%1,d=.32*n+(led<.18?.1:0);
    v.x+=N.getX(i)*d;v.y+=N.getY(i)*d;v.z+=N.getZ(i)*d;gb168Push(o,v);P.setXYZ(i,v.x,v.y,v.z)}
  g.computeVertexNormals();gb168Paint(g,seed,o);return g}
// strata, snow on upward faces, dark undersides
function gb168Paint(g,seed,o){const P=g.attributes.position,N=g.attributes.normal,C=new Float32Array(P.count*3),c=new THREE.Color(),A=new THREE.Color(0x30363e),B=new THREE.Color(0x4a525c),D=new THREE.Color(0x1e2228),Sn=new THREE.Color(0xe6eff6),Fr=new THREE.Color(0xa8cce4);
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),ny=N.getY(i),band=gb168F(x*.2,y*1.15+.5*gb168N(x*.3,0,z*.3,seed),z*.2,seed+5,2);
    c.copy(A).lerp(B,Math.max(0,Math.min(1,.5+band*1.3)));if(Math.abs(band)<.05)c.lerp(D,.45);
    const sn=Math.max(0,Math.min(1,(ny-.5+.2*gb168N(x*.6,y*.6,z*.6,seed+2))/.5));c.lerp(Sn,sn*(y>-.2?1:.3));
    if(ny<-.25)c.multiplyScalar(.62+.2*Math.max(0,ny+.25+.4));else if(ny<.25)c.lerp(Fr,.22*Math.max(0,gb168N(x*.7,y*.5,z*.7,seed+4)));
    C[i*3]=c.r;C[i*3+1]=c.g;C[i*3+2]=c.b}
  g.setAttribute('color',new THREE.BufferAttribute(C,3))}
// the lining of the passage: rings of the arch down to depth D, pushed outward by noise; darker the deeper it goes
function gb168Tunnel(o){const NI=30,NZ=Math.round(o.D*2.4),pos=[],col=[],idx=[],c=new THREE.Color(),R1=new THREE.Color(0x4a525c),R2=new THREE.Color(0x343a42),Fr=new THREE.Color(0xc8e2f2),day=o.end==='day';
  for(let j=0;j<=NZ;j++){const z=.45-(o.D+.45)*j/NZ,d=Math.max(0,-z),S=gb168Sec(o,z);
    for(let i=0;i<=NI;i++){const t=i/NI,[ax,ay]=gb168Arch(1,1,t),nl=Math.hypot(ax,ay*o.W/o.H)||1,nx=ax/nl,ny=(ay*o.W/o.H)/nl,
        n=gb168F(ax*2.2+z*.7,ay*2.2,z*.55,o.seed,4),led=((ay*o.H*1.15+.3*n)%1+1)%1,push=.04+.2*(.5+.5*n)+(led<.14?.05:0);
      const x=S.x+ax*S.W+nx*push,y=ay*S.H+ny*push;pos.push(x,y<.02?-.05:y,z);
      const band=gb168F(0,y*2.4+n*.6,z*.3,o.seed+5,3);c.copy(R1).lerp(R2,Math.max(0,Math.min(1,.5+band*1.8)));
      if(d<2.2&&ay>.45)c.lerp(Fr,(1-d/2.2)*.55*Math.max(0,gb168N(x*2.4,y*2.4,z*2.4,o.seed+8)+.3));
      let k=Math.exp(-d*o.fall);if(day)k=Math.max(k,Math.exp(-(o.D-d)*.55)*1.25);c.multiplyScalar(Math.max(.025,Math.min(1.2,k)));col.push(c.r,c.g,c.b)}}
  for(let j=0;j<NZ;j++)for(let i=0;i<NI;i++){const a=j*(NI+1)+i,b=a+NI+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g}
// the floor: snow at the threshold fading into the dark
function gb168Floor(o){const NX=8,NZ=Math.round((o.D+2.4)*2),pos=[],col=[],idx=[],c=new THREE.Color(),Sn=new THREE.Color(0xdde8f0),Dk=new THREE.Color(0x3a4048),day=o.end==='day';
  for(let j=0;j<=NZ;j++){const z=2.2-(o.D+2.4)*j/NZ,d=Math.max(0,-z),S=gb168Sec(o,z),w=z>.4?S.W+.6*(z-.4):S.W;
    for(let i=0;i<=NX;i++){const u=i/NX*2-1,x=S.x+u*w*1.02,y=.03+.07*Math.max(0,gb168N(x*1.6,0,z*1.6,o.seed+11))*(d<3?1:.3);pos.push(x,y,z);
      c.copy(Dk).lerp(Sn,Math.max(0,Math.min(1,1-d/3.2+.2*gb168N(x*2,0,z*2,o.seed+12))));let k=Math.exp(-Math.max(0,d-.6)*o.fall*1.1);if(day)k=Math.max(k,Math.exp(-(o.D-d)*.55)*1.25);
      c.multiplyScalar(Math.max(.03,Math.min(1.2,k)));col.push(c.r,c.g,c.b)}}
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+NX+1;idx.push(a,a+1,b,b,a+1,b+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g}
// the arch's shape as a flat outline (the passage's end, the ice plug)
function gb168Shape(o,z,k){const S=gb168Sec(o,z),sh=new THREE.Shape();for(let i=0;i<=24;i++){const [x,y]=gb168Arch(S.W*k,S.H*k,i/24);if(i)sh.lineTo(S.x+x,y);else sh.moveTo(S.x+x,y)}sh.closePath();return sh}
// an icicle: a smooth tapering spike hanging from y 0 to -1
function gb168IcicleG(){return svG('gb168icl',()=>new THREE.LatheGeometry([[0,-1],[.1,-.82],[.28,-.55],[.55,-.25],[.85,-.06],[1,0],[0,.02]].map(([x,y])=>new THREE.Vector2(x,y)),9))}
// a smooth blob (ice caps, snow drifts)
function gb168Blob(seed,amp,seg){const g=new THREE.SphereGeometry(1,seg||28,Math.round((seg||28)*.6)),P=g.attributes.position;
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),k=1+(amp||.18)*gb168F(x*1.4,y*1.4,z*1.4,seed,3);P.setXYZ(i,x*k,y*k,z*k)}g.computeVertexNormals();return g}
// the whole opening. o: {W, H, D (depth), seed, end:'dark'|'day', massif (the rock round it), hill (the hill behind), plug (an ice plug at depth), out (snow drifts outside)}
function gb168Cave(o){o=Object.assign({W:2.3,H:3.6,D:9,seed:1,end:'dark'},o);o.fall=o.fall||3.6/o.D;const M=gb168Mats(),g=new THREE.Group(),rn=svRng(o.seed*31+7),add=(geo,mat,sh)=>{const m=new THREE.Mesh(geo,mat);m.castShadow=sh!==false;m.receiveShadow=true;g.add(m);return m};
  const R={g,o};
  // the passage
  add(gb168Tunnel(o),M.tun,false);R.floor=add(gb168Floor(o),M.tun,false);
  R.endM=o.end==='day'?new THREE.MeshBasicMaterial({color:0xd6e8f4,fog:false}):M.dark.clone();
  {const e=add(new THREE.ShapeGeometry(gb168Shape(o,-o.D,1.12),6),R.endM,false);e.position.z=-o.D+.02;R.end=e}
  // the rock round it
  const W=o.W,H=o.H;
  if(o.massif!==false){
    add(gb168Rim(o,o.seed+1),M.rock);                                                                          // the rim: a weathered frame round the mouth
    add(gb168Mass(o,-W-2.1,1.3,-1.2,2.5,3.3,3.0,o.seed+2,'push'),M.rock);add(gb168Mass(o,W+2.2,1.2,-1.0,2.6,3.1,2.9,o.seed+3,'push'),M.rock); // buttresses
    add(gb168Mass(o,0,H+1.3,-1.7,W+2.6,2.0,2.8,o.seed+4,'push'),M.rock);                                      // the block over the arch
    add(gb168Mass(o,-W-4.4,.4,-3.6,2.6,2.2,3.0,o.seed+6,'push',36),M.rock);add(gb168Mass(o,W+4.6,.5,-3.3,2.7,2.3,2.8,o.seed+7,'push',36),M.rock); // spurs
    if(o.hill!==false){add(gb168Mass(o,0,2.6,-7.8,W+7.2,H+4.4,6.8,o.seed+5,'cut',80),M.rock);                  // the hill behind, and crags on it
      [[-3.4,H+4.2,-6.2,2.2,1.9,2.0],[3.1,H+3.6,-7.4,2.6,2.2,2.2],[.6,H+5.6,-9.6,2.4,2.0,2.4]].forEach(([x,y,z,a,b,c],i)=>add(gb168Mass(o,x,y,z,a,b,c,o.seed+60+i,'push',40),M.rock))}
    // the glacier cap on top and over the shoulders
    [[0,H+2.55,-2.4,W+1.8,.5,2.0],[-W-1.6,3.7,-2.2,1.6,.45,1.7],[-.8,H+4.9,-6.0,3.6,.6,2.8]].forEach(([x,y,z,sx,sy,sz],i)=>{if(o.hill===false&&i==2)return;
      const m=add(gb168Blob(o.seed+20+i,.22,32),M.ice,false);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.y=rn()*3});
    // a frozen fall down the left buttress
    {const f=new THREE.PlaneGeometry(1.8,4.2,6,14),P=f.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i);P.setZ(i,.25*Math.sin(x*5+y*.8)+.12*gb168N(x*3,y*2,0,o.seed+30)+(y<-1.6?(-1.6-y)*.35:0))}f.computeVertexNormals();
      const m=add(f,M.ice2,false);m.position.set(-W-1.3,2.0,.9);m.rotation.set(-.12,.5,0)}}
  // the ice lip along the arch, icicles from it (over the way in they stop at head height), and short icicles inside the throat
  {const pts=[];for(let i=0;i<=20;i++){const t=.1+.8*i/20,[x,y]=gb168Arch(W+.32,H+.3,t);pts.push(new THREE.Vector3(x,y,.62+.08*Math.sin(i*1.7)))}
    const lip=add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.26,8,false),M.ice,false);lip.scale.set(1,1,1);
    const IG=gb168IcicleG();for(let i=0;i<34;i++){const t=.12+.76*rn(),[x,y]=gb168Arch(W+.26,H+.18,t);if(y<1.4)continue;const over=Math.abs(x)<W*.9,L0=.25+Math.pow(rn(),1.6)*1.7,L=over?Math.min(L0,Math.max(.15,y-2.35)):L0;
      const m=add(IG,i%3?M.ice:M.ice2,false);m.position.set(x+(rn()-.5)*.1,y+.05,.5+(rn()-.5)*.25);const r=.05+.06*Math.min(1,L/1.2)+rn()*.03;m.scale.set(r,L,r)}
    for(let i=0;i<18;i++){const d=.3+rn()*3.2,z=-d,S=gb168Sec(o,z),t=.25+.5*rn(),[x,y]=gb168Arch(S.W*.97,S.H*.97,t),L=.15+rn()*.55;if(y-L<2.3&&Math.abs(x)<S.W*.8)continue;
      const m=add(IG,M.ice,false);m.position.set(S.x+x,y,z);const r=.035+rn()*.04;m.scale.set(r,L,r)}}
  // faint glints of ice deep in the walls: the passage goes on
  for(let i=0;i<7;i++){const d=3.2+rn()*(o.D-4),z=-d,S=gb168Sec(o,z),t=rn()<.5?.08+rn()*.2:.72+rn()*.2,[x,y]=gb168Arch(S.W*.98,S.H*.98,t);const m=add(gb151Crys(i%3,6,.7),M.glint,false);
    m.position.set(S.x+x,Math.max(.2,y*.8),z);m.scale.set(.06,.18+rn()*.2,.06);m.rotation.set(rn()-.5,0,(x<0?-1:1)*(.6+rn()*.5))}
  // snow drifts on both sides of the threshold (out of the way in) and frost crystals at the foot of the buttresses
  if(o.out!==false){[[-W-.7,1.3,1.9,.42,1.5],[W+.8,1.1,1.7,.38,1.4],[-W-2.4,2.4,2.2,.5,1.6],[W+2.6,2.2,2.0,.45,1.5],[0,2.4,1.6,.12,1.0]].forEach(([x,z,sx,sy,sz],i)=>{
      const m=add(gb168Blob(o.seed+40+i,.15,24),M.snow,false);const v=new THREE.Vector3(x,0,z);if(i<4)gb168Push(o,v);m.position.set(v.x,-sy*.25,z);m.scale.set(sx,sy,sz);m.rotation.y=rn()*3});
    [[-W-1.0,.9,-1],[W+1.1,.7,1],[-W-3.4,1.6,-1]].forEach(([x,z,s],i)=>{for(let q=0;q<4;q++){const m=add(gb151Crys(q%3,6,[.6,.7,.8][q%3]),q%2?M.ice:M.ice2);const h=.5+rn()*.9,w=.12+rn()*.1;
      m.position.set(x+(rn()-.5)*.7,-.05,z+(rn()-.5)*.6);m.scale.set(w,h,w);m.rotation.set((rn()-.5)*.5,rn()*3,s*(.15+rn()*.35))}})}
  // the plug of ancient ice that seals the passage (shown and hidden by its owner)
  if(o.plug!=null){const z=-o.plug,sh=gb168Shape(o,z,1.03),pg=new THREE.Group(),geo=new THREE.ExtrudeGeometry(sh,{depth:.7,bevelEnabled:true,bevelThickness:.18,bevelSize:.14,bevelSegments:3,curveSegments:6});
    geo.translate(0,0,z-.35);const P=geo.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),zz=P.getZ(i);if(zz>z+.3)P.setZ(i,zz+.12*gb168N(x*1.4,y*1.4,0,o.seed+50))}geo.computeVertexNormals();
    const pm=new THREE.Mesh(geo,M.plug);pm.renderOrder=2;pg.add(pm);
    for(let i=0;i<9;i++){const S=gb168Sec(o,z),m=new THREE.Mesh(gb151Crys(i%3,6,.75),i%2?M.ice:M.ice2);m.position.set(S.x+(rn()-.5)*S.W*1.4,rn()*S.H*.6,z+.3+rn()*.3);m.scale.set(.25+rn()*.2,.9+rn()*1.6,.25);m.rotation.set((rn()-.5)*.4,rn()*3,(rn()-.5)*.6);pg.add(m)}
    g.add(pg);R.plug=pg;R.plugM=M.plug}
  g.traverse(q=>{if(q.isMesh)GB168.tris+=q.geometry.index?q.geometry.index.count/3:q.geometry.attributes.position.count/3});
  return R}
// push a world point out of a cave's opening (C from gb168Cave, its group placed in the world)
function gb168PushW(C,v){C.g.updateMatrixWorld(true);const inv=C.inv||(C.inv=new THREE.Matrix4().copy(C.g.matrixWorld).invert()),q=v.clone().applyMatrix4(inv);if(gb168R(C.o,q.x,q.y,q.z)>=1.15)return false;
  const S=gb168Sec(C.o,q.z),X=(q.x-S.x)/S.W,Y=Math.max(0,q.y)/S.H,r=Math.max(1e-3,gb168R(C.o,q.x,q.y,q.z)),k=1.15/r;q.x=S.x+X*k*S.W;if(q.y>0)q.y=Y*k*S.H;v.copy(q.applyMatrix4(C.g.matrixWorld));return true}
// a smooth rock for the cave walls (unit size; strata and snow in its vertex colours), cached per variant
function gb168RockG(k){return svG('gb168rk'+k,()=>gb168Mass({W:1,H:1,D:1},0,0,0,1,1,1,300+k*13,'none',30))}
// many transformed copies of indexed geometries with colours as one geometry (one draw call)
function gb168Merge(L,fix){let nv=0,ni=0;L.forEach(([g])=>{nv+=g.attributes.position.count;ni+=g.index.count});const P=new Float32Array(nv*3),N=new Float32Array(nv*3),C=new Float32Array(nv*3),I=new Uint32Array(ni),v=new THREE.Vector3(),nm=new THREE.Matrix3();let o=0,q=0;
  L.forEach(([g,m])=>{nm.getNormalMatrix(m);const p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color;
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m);if(fix)fix(v);P.set([v.x,v.y,v.z],(o+i)*3);v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();N.set([v.x,v.y,v.z],(o+i)*3);if(c)C.set([c.getX(i),c.getY(i),c.getZ(i)],(o+i)*3);else C.fill(1,(o+i)*3,(o+i)*3+3)}
    const ix=g.index.array;for(let i=0;i<ix.length;i++)I[q+i]=ix[i]+o;o+=p.count;q+=ix.length});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));g.setIndex(new THREE.BufferAttribute(I,1));return g}
// the world's scenery standing where a passage runs (the edge stones and boulders of the zone, 1680 / 2280 v124Edge: the Frozen Maw's
// passages run out past the old arena's edge, where a snowy boulder stood in the opening): hidden (scaled to nothing)
function gb168Clear(C){let n=0;try{if(typeof WD=='undefined'||!WD||!WD.ms)return 0;C.g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(C.g.matrixWorld).invert(),m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),Z=new THREE.Matrix4().makeScale(0,0,0);
  const c=new THREE.Vector3().setFromMatrixPosition(C.g.matrixWorld),R=C.o.D+C.o.W+7;
  WD.ms.forEach(M=>{if(!M.isInstancedMesh)return;let ch=0;for(let j=0;j<M.count;j++){M.getMatrixAt(j,m);m.decompose(p,q,s);if(Math.abs(p.x-c.x)>R||Math.abs(p.z-c.z)>R||s.x===0)continue;const r=Math.max(s.x,s.z)*.6,l=p.clone().applyMatrix4(inv);
      if(l.z<-C.o.D-2.5-r||l.z>.9+r)continue;const S=gb168Sec(C.o,Math.max(l.z,-C.o.D));if(Math.abs(l.x-S.x)<S.W+r+1.2&&p.y<c.y+S.H+3){M.setMatrixAt(j,Z);ch=1;n++}}if(ch)M.instanceMatrix.needsUpdate=true})}catch(err){console.warn('v168 clear',err)}
  return n}
// the passage floor laid over the ground where the ground inside rises above it (the land behind the old arena's edge climbs), and
// the snow apron in front of the mouth on the ground; call once the cave's group stands in the world
function gb168Ground(C){try{const f=C.floor;if(!f)return;C.g.updateMatrixWorld(true);const M=C.g.matrixWorld,inv=new THREE.Matrix4().copy(M).invert(),P=f.geometry.attributes.position,v=new THREE.Vector3(),y0=C.g.position.y;let up=0;
  for(let i=0;i<P.count;i++){v.set(P.getX(i),P.getY(i),P.getZ(i)).applyMatrix4(M);const h=GH(v.x,v.z)+.04,ly=P.getY(i),z=P.getZ(i),want=z>.4?h-y0+(ly-.03):Math.max(ly,h-y0);if(Math.abs(want-ly)>.001){P.setY(i,want);up=Math.max(up,want-ly)}}
  P.needsUpdate=true;f.geometry.computeVertexNormals();f.geometry.computeBoundingSphere();C.up=+up.toFixed(2)}catch(err){console.warn('v168 ground',err)}}
