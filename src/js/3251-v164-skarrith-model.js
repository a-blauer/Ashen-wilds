// ================= v164 Skarrith, the Mountain Coil — the detailed model =================
// The owner: "The snake chasing you needs a lot more detail — he looks way too chunky and low poly." v164 rebuilds the serpent
// (3161's head, instanced box segments and their layout are gone; 3250 poses it, the hooks are the same: ch153Snake builds it,
// ch153SnakeLay lays the body along the spine points, head / jaw / hood are posed by ch153SnakeAnim).
//  * Body (ch153SnakeLay): one smooth tube along a Catmull-Rom curve through the spine points (CH164B.sub rings between two
//    points, CH164B.ns sides, analytic normals), rebuilt in place each frame in one geometry made once per level (~4.5k
//    vertices). The cross-section is wider than tall with a flatter belly. Its skin is a painted canvas texture with a bump map
//    (ch164SkinTex): shingled keeled scales in staggered rows (each row overlaps the one behind it), a dorsal chain of black
//    diamonds with bronze rims, dark flank blotches, and the wide pale ventral plates of the belly. The texture is laid by body
//    length divided by the resting radius, so the scales ride with the body and shrink toward the tail. Along the spine: keeled
//    dorsal scutes and swept spines (two InstancedMeshes placed on the tube's own frame).
//  * Head (ch153SnakeHead): sculpted lofts (ch164Loft: a wedge skull and snout; a hinged lower jaw), heavy brow ridges, glossy
//    head shields, a crown of swept horns and a crest, slit-pupil glowing eyes in dark sockets, nostrils and heat pits, rows of
//    teeth, two great fangs that swing forward as the jaw opens, a dark red mouth, a forked tongue that flicks, venom dripping
//    from the fangs (ch164HeadAnim), and a ribbed cobra hood (pale banded front, a dark scaled back with two eye-spots).
//  * Materials: smooth MeshStandard (no flat shading) of its own, kept out of 2420's see-through fade. Textures, materials and
//    the fixed geometries are made once and shared (CH164B); nothing is made per frame.
var CH164B={sub:4,ns:22,sp:1.32,vk:.2,tex:null,m:null};
// ---------------- textures ----------------
function ch164SkinTex(){if(CH164B.tex)return CH164B.tex;const N=512,mk=()=>{const c=document.createElement('canvas');c.width=c.height=N;return c},cA=mk(),cB=mk(),X=cA.getContext('2d'),B=cB.getContext('2d'),R=ch153R(16401);
  const COLS=26,ROWS=18,cw=N/COLS,rh=N/ROWS,BL=.655,BH=.845;
  // around the body u: 0 the right flank, .25 the spine, .5 the left flank, .75 the belly
  const dTop=u=>{const d=((u-.25)%1+1)%1;return Math.min(d,1-d)};
  const col=(u,v)=>{const d=dTop(u);let c;
    if(d<.3){const k=d/.3;c=[30+14*k,38+16*k,22+8*k]}else{const k=Math.min(1,(d-.3)/.1);c=[44+46*k,54+34*k,30+24*k]}
    const q=d*3.4+Math.abs(((v*2)%1)-.5)*1.25;if(q<.4)c=[13,15,9];else if(q<.52)c=[124,96,40];          // the dorsal diamonds, bronze rims
    const l=Math.abs(d-.19)*6+Math.abs((((v*2+.5)%1+1)%1)-.5)*2.3;if(l<.3)c=[12,14,9];else if(l<.38)c=[86,72,34];   // flank blotches
    const j=.88+R()*.24;return c.map(x=>Math.round(Math.min(255,x*j)))};
  const shape=(g,cx,cy)=>{g.beginPath();g.moveTo(cx,cy-rh*.85);g.bezierCurveTo(cx+cw*.8,cy-rh*.62,cx+cw*.74,cy+rh*.32,cx,cy+rh*.74);g.bezierCurveTo(cx-cw*.74,cy+rh*.32,cx-cw*.8,cy-rh*.62,cx,cy-rh*.85);g.closePath()};
  const rgb=(c,k)=>'rgb('+c.map(v=>Math.max(0,Math.min(255,v*k|0))).join(',')+')';
  const scale=(cx,cy,c)=>{for(const ox of [-N,0,N])for(const oy of [-N,0,N]){const x=cx+ox,y=cy+oy;if(x<-cw||x>N+cw||y<-rh*1.2||y>N+rh*1.2)continue;
    const gr=X.createLinearGradient(x,y-rh*.6,x,y+rh*.7);gr.addColorStop(0,rgb(c,.5));gr.addColorStop(.55,rgb(c,1));gr.addColorStop(1,rgb(c,1.3));
    shape(X,x,y);X.fillStyle=gr;X.fill();X.lineWidth=1.4;X.strokeStyle='rgba(5,7,3,.9)';X.stroke();
    X.beginPath();X.moveTo(x,y-rh*.2);X.lineTo(x,y+rh*.55);X.lineWidth=1.1;X.strokeStyle='rgba('+c.map(v=>Math.min(255,v*1.7+14|0)).join(',')+',.5)';X.stroke();   // the keel
    const gb=B.createRadialGradient(x,y+rh*.12,1,x,y,rh*.85);gb.addColorStop(0,'#fff');gb.addColorStop(.55,'#a0a0a0');gb.addColorStop(1,'#1a1a1a');shape(B,x,y);B.fillStyle=gb;B.fill();B.lineWidth=1.6;B.strokeStyle='#000';B.stroke();
    B.beginPath();B.moveTo(x,y-rh*.2);B.lineTo(x,y+rh*.55);B.lineWidth=1.2;B.strokeStyle='#fff';B.stroke()}};
  X.fillStyle='#0e1209';X.fillRect(0,0,N,N);B.fillStyle='#000';B.fillRect(0,0,N,N);
  // the scales, from the tail end of the tile toward the head, so each row lies over the one behind it
  for(let r=ROWS;r>=-1;r--)for(let c=0;c<COLS;c++){const u=(c+(r&1?.5:0)+.5)/COLS,v=(r+.5)/ROWS;if(dTop(u)>.45)continue;scale(u*N,v*N,col(u,((v%1)+1)%1))}
  // the ventral plates of the belly: wide, pale, each overlapping the one behind
  const PR=7,ph=N/PR,x0=BL*N,x1=BH*N;
  for(let r=PR;r>=-1;r--)for(const oy of [0,N,-N]){const yy=r*ph+oy;if(yy<-ph*1.5||yy>N+ph)continue;
    const path=G=>{G.beginPath();G.moveTo(x0,yy);G.lineTo(x1,yy);G.lineTo(x1,yy+ph*1.02);G.quadraticCurveTo((x0+x1)/2,yy+ph*1.36,x0,yy+ph*1.02);G.closePath()};
    const g=X.createLinearGradient(0,yy,0,yy+ph*1.3);g.addColorStop(0,'#4a3e22');g.addColorStop(.3,'#a8966a');g.addColorStop(1,'#c8b686');path(X);X.fillStyle=g;X.fill();
    const gs=X.createLinearGradient(x0,0,x1,0);gs.addColorStop(0,'rgba(16,14,6,.7)');gs.addColorStop(.22,'rgba(0,0,0,0)');gs.addColorStop(.78,'rgba(0,0,0,0)');gs.addColorStop(1,'rgba(16,14,6,.7)');path(X);X.fillStyle=gs;X.fill();
    X.lineWidth=2;X.strokeStyle='rgba(34,26,12,.95)';X.stroke();
    const gb=B.createLinearGradient(0,yy,0,yy+ph*1.3);gb.addColorStop(0,'#000');gb.addColorStop(.3,'#c8c8c8');gb.addColorStop(1,'#f0f0f0');path(B);B.fillStyle=gb;B.fill();B.lineWidth=2.5;B.strokeStyle='#000';B.stroke()}
  const t=c=>{const x=new THREE.CanvasTexture(c);x.wrapS=x.wrapT=THREE.RepeatWrapping;try{x.anisotropy=Math.min(8,ren.capabilities.getMaxAnisotropy())}catch(_){}return x};
  return CH164B.tex={map:t(cA),bump:t(cB)}}
// the eye: a glowing yellow-green iris with a vertical slit (at the sphere's +x, u = .5)
function ch164IrisTex(){if(CH164B.iris)return CH164B.iris;const c=document.createElement('canvas');c.width=128;c.height=64;const x=c.getContext('2d');
  x.fillStyle='#1a1004';x.fillRect(0,0,128,64);
  const g=x.createRadialGradient(64,32,2,64,32,31);g.addColorStop(0,'#fdffb0');g.addColorStop(.3,'#e4f448');g.addColorStop(.72,'#d08a0a');g.addColorStop(.93,'#5a2a02');g.addColorStop(1,'#1a0c02');
  x.fillStyle=g;x.beginPath();x.ellipse(64,32,31,30,0,0,7);x.fill();
  x.strokeStyle='rgba(120,60,0,.45)';x.lineWidth=1;for(let i=0;i<40;i++){const a=i/40*6.283;x.beginPath();x.moveTo(64+Math.cos(a)*8,32+Math.sin(a)*8);x.lineTo(64+Math.cos(a)*29,32+Math.sin(a)*28);x.stroke()}
  x.fillStyle='#040201';x.beginPath();x.ellipse(64,32,3.4,27,0,0,7);x.fill();
  x.fillStyle='rgba(255,255,230,.85)';x.beginPath();x.ellipse(56,22,3,2.2,0,0,7);x.fill();
  return CH164B.iris=new THREE.CanvasTexture(c)}
// the hood: the front (pale, ribbed, two dark bands, throat scales) and the back (dark scales, two eye-spots joined by a spectacle)
function ch164HoodTex(){if(CH164B.hood)return CH164B.hood;const W=256,H=128,mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c},F=mk(),Bk=mk(),f=F.getContext('2d'),b=Bk.getContext('2d'),R=ch153R(16433);
  let g=f.createLinearGradient(0,0,0,H);g.addColorStop(0,'#7a6c44');g.addColorStop(.5,'#5c5232');g.addColorStop(.85,'#2e2a16');g.addColorStop(1,'#10100a');f.fillStyle=g;f.fillRect(0,0,W,H);
  [[.42,.08],[.7,.07]].forEach(([v,w])=>{const y=v*H,gg=f.createLinearGradient(0,y-w*H,0,y+w*H);gg.addColorStop(0,'rgba(30,26,12,0)');gg.addColorStop(.5,'rgba(30,26,12,.8)');gg.addColorStop(1,'rgba(30,26,12,0)');f.fillStyle=gg;f.fillRect(0,y-w*H,W,w*H*2)});
  for(let i=0;i<=9;i++){const x=i/9*W;f.strokeStyle='rgba(50,42,20,.85)';f.lineWidth=3;f.beginPath();f.moveTo(x,0);f.lineTo(x,H);f.stroke()}
  for(let y=3;y<H*.86;y+=8){f.fillStyle='rgba(176,160,108,.6)';f.beginPath();f.ellipse(W/2,y+3,15,3.2,0,0,7);f.fill();f.strokeStyle='rgba(60,50,24,.6)';f.lineWidth=1;f.stroke()}
  for(let i=0;i<160;i++){f.fillStyle='rgba(30,24,10,'+(.2+R()*.35).toFixed(2)+')';f.beginPath();f.arc(R()*W,R()*H*.95,.6+R()*1.6,0,7);f.fill()}
  b.fillStyle='#10150b';b.fillRect(0,0,W,H);
  for(let r=-1;r<14;r++)for(let c=-1;c<28;c++){const x=(c+(r&1?.5:0))*W/27,y=r*H/13,k=.75+R()*.5;const gr=b.createLinearGradient(x,y-5,x,y+6);gr.addColorStop(0,'rgb(12,16,8)');gr.addColorStop(1,'rgb('+(48*k|0)+','+(58*k|0)+','+(30*k|0)+')');
    b.fillStyle=gr;b.beginPath();b.ellipse(x,y,5.4,6.4,0,0,7);b.fill();b.strokeStyle='rgba(4,6,2,.9)';b.lineWidth=1;b.stroke()}
  [.3,.7].forEach(u=>{const x=u*W,y=.5*H;b.fillStyle='#d8c88e';b.beginPath();b.ellipse(x,y,25,23,0,0,7);b.fill();b.fillStyle='#1a160c';b.beginPath();b.ellipse(x,y,18,16.5,0,0,7);b.fill();
    b.fillStyle='#080604';b.beginPath();b.ellipse(x,y,13,12,0,0,7);b.fill();b.fillStyle='rgba(232,216,160,.7)';b.beginPath();b.ellipse(x-5,y-5,3,2.4,0,0,7);b.fill()});
  b.strokeStyle='#cbb87e';b.lineWidth=5;b.beginPath();b.moveTo(.3*W+6,.5*H+22);b.quadraticCurveTo(.5*W,1.02*H,.7*W-6,.5*H+22);b.stroke();
  return CH164B.hood={f:new THREE.CanvasTexture(F),b:new THREE.CanvasTexture(Bk)}}
// ---------------- materials ----------------
function ch164Mats(){if(CH164B.m)return CH164B.m;const T=ch164SkinTex(),H=ch164HoodTex(),
  std=o=>{const m=new THREE.MeshStandardMaterial(Object.assign({roughness:.6,metalness:.08},o));m.userData.noFade135=1;return m};
  const M={skin:std({map:T.map,bumpMap:T.bump,bumpScale:.045,roughness:.46,metalness:.18}),
    plate:std({color:0x1a2112,roughness:.42,metalness:.25}),bone:std({color:0xe4d8b8,roughness:.3,metalness:.04}),horn:std({color:0x2c2318,roughness:.4,metalness:.2}),
    mouth:std({color:0x5c1016,roughness:.45,emissive:0x1c0306}),tongue:std({color:0x6a0a18,roughness:.3,emissive:0x160004}),dark:std({color:0x060705,roughness:.8}),
    eye:new THREE.MeshBasicMaterial({map:ch164IrisTex(),fog:false}),
    venom:std({color:0x84f030,emissive:0x3cb012,emissiveIntensity:1,roughness:.12,metalness:0,transparent:true,opacity:.92}),
    hoodF:std({map:H.f,roughness:.58}),hoodB:std({map:H.b,roughness:.45,metalness:.15})};
  M.eye.userData.noFade135=1;return CH164B.m=M}
// ---------------- geometry kit ----------------
// a loft along +z: rings [z, half width, top height, bottom height, centre y, centre x]; e < 1 makes the section boxier.
// Indexed, smooth normals (the seam's two copies averaged), uv: u around (0 the right flank, .25 the top), v along (z / vl)
function ch164Loft(rings,n,o){o=o||{};const e=o.e==null?1:o.e,vl=o.vl||1,pos=[],uv=[],idx=[],NR=rings.length,W=n+1;let acc=0;
  for(let r=0;r<NR;r++){const q=rings[r];if(r)acc+=Math.hypot(q[0]-rings[r-1][0],(q[4]||0)-(rings[r-1][4]||0));
    for(let k=0;k<=n;k++){const a=k/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a),cx=Math.sign(c)*Math.pow(Math.abs(c),e),sy=Math.sign(s)*Math.pow(Math.abs(s),e);
      pos.push((q[5]||0)+cx*q[1],(q[4]||0)+sy*(s>=0?q[2]:q[3]),q[0]);uv.push(k/n,acc/vl)}}
  for(let r=0;r<NR-1;r++)for(let k=0;k<n;k++){const a=r*W+k,b=a+1,c=a+W,d=c+1;idx.push(a,b,c,b,d,c)}
  const cap=(r,dz,front)=>{const q=rings[r],ci=pos.length/3;pos.push(q[5]||0,q[4]||0,q[0]+dz);uv.push(.5,front?acc/vl:0);for(let k=0;k<n;k++){const a=r*W+k;if(front)idx.push(a,a+1,ci);else idx.push(a+1,a,ci)}};
  if(o.tip!=null)cap(NR-1,o.tip,1);if(o.back!=null)cap(0,-o.back,0);
  return ch164Geo(pos,uv,idx,NR,W)}
function ch164Geo(pos,uv,idx,NR,W){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const N=g.attributes.normal;for(let r=0;r<NR;r++){const a=r*W,b=a+W-1,x=N.getX(a)+N.getX(b),y=N.getY(a)+N.getY(b),z=N.getZ(a)+N.getZ(b),l=Math.hypot(x,y,z)||1;N.setXYZ(a,x/l,y/l,z/l);N.setXYZ(b,x/l,y/l,z/l)}
  return g}
// a smooth tube along a 3D path (pts [[x,y,z]], rad: r or [rx,ry] per point), indexed; o.tip closes the end in a point
function ch164Tube(pts,rad,n,o){o=o||{};const V3=THREE.Vector3,P=pts.map(p=>new V3(p[0],p[1],p[2])),N=P.length,pos=[],uv=[],idx=[],W=n+1;let up=new V3(0,1,0),t=new V3();
  for(let i=0;i<N;i++){t.subVectors(P[Math.min(N-1,i+1)],P[Math.max(0,i-1)]).normalize();if(Math.abs(t.dot(up))>.97)up=Math.abs(t.x)<.9?new V3(1,0,0):new V3(0,0,1);
    const b=new V3().crossVectors(t,up).normalize(),u=new V3().crossVectors(b,t).normalize();up=u.clone();const r=Array.isArray(rad)?rad[i]:rad,rx=Array.isArray(r)?r[0]:r,ry=Array.isArray(r)?r[1]:r;
    for(let k=0;k<=n;k++){const a=k/n*Math.PI*2,p=P[i].clone().addScaledVector(b,Math.cos(a)*rx).addScaledVector(u,Math.sin(a)*ry);pos.push(p.x,p.y,p.z);uv.push(k/n,i/(N-1))}}
  for(let i=0;i<N-1;i++)for(let k=0;k<n;k++){const a=i*W+k,b=a+1,c=a+W,d=c+1;idx.push(a,c,b,b,c,d)}
  if(o.tip){const ci=pos.length/3,e=P[N-1].clone().addScaledVector(t,o.tip);pos.push(e.x,e.y,e.z);uv.push(.5,1);for(let k=0;k<n;k++){const a=(N-1)*W+k;idx.push(a+1,a,ci)}}
  return ch164Geo(pos,uv,idx,N,W)}
// a tapering horn / fang / spine along +z, bending toward (bx, by) at the tip
function ch164Horn(r,len,bx,by,n,seg){const pts=[],rad=[];for(let s=0;s<=seg;s++){const t=s/seg;pts.push([bx*t*t,by*t*t,len*t]);rad.push(Math.max(.003,r*Math.pow(1-t,.8)))}return ch164Tube(pts,rad,n,{tip:len*.05})}
// merge [geometry, matrix] parts into one indexed geometry (positions, normals, uvs); never mirror with a negative scale
function ch164Merge(parts){const pos=[],nor=[],uv=[],idx=[],v=new THREE.Vector3(),nm=new THREE.Matrix3();let off=0;
  for(const [g,m] of parts){const P=g.attributes.position,Nn=g.attributes.normal,U=g.attributes.uv;nm.getNormalMatrix(m);
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(m);pos.push(v.x,v.y,v.z);if(Nn){v.fromBufferAttribute(Nn,i).applyMatrix3(nm).normalize();nor.push(v.x,v.y,v.z)}else nor.push(0,1,0);uv.push(U?U.getX(i):0,U?U.getY(i):0)}
    if(g.index){const a=g.index.array;for(let i=0;i<a.length;i++)idx.push(a[i]+off)}else for(let i=0;i<P.count;i++)idx.push(i+off);off+=P.count}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));G.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));G.setIndex(idx);G.computeBoundingSphere();return G}
function ch164Mx(x,y,z,rx,ry,rz,sx,sy,sz,ord){const s=sx==null?1:sx;return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0,ord||'XYZ')),new THREE.Vector3(s,sy==null?s:sy,sz==null?s:sz))}
// a keeled scute: a shield plate (normal +y, its free tip toward -z: the tail), a raised keel
function ch164ScuteGeo(){if(CH164B.scG)return CH164B.scG;const o=[[0,.55],[.38,.38],[.5,.02],[.4,-.36],[0,-.72],[-.4,-.36],[-.5,.02],[-.38,.38]],pos=[],T=(a,b,c)=>pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
  const top=o.map(([x,z])=>[x,.1*(1-Math.abs(x)*1.7)+(z<-.3?.05:0),z]),bot=o.map(([x,z])=>[x*.84,-.1,z*.84]),k0=[0,.26,-.05],kb=[0,-.1,0],n=o.length;
  for(let i=0;i<n;i++){const j=(i+1)%n;T(k0,top[i],top[j]);T(top[i],bot[i],bot[j]);T(top[i],bot[j],top[j]);T(kb,bot[j],bot[i])}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return CH164B.scG=g}
// ---------------- the head ----------------
// head units (the group is scaled 1.35); +z forward, +y up. The lower jaw hinges at CH164B.jp, the fangs at their roots.
CH164B.jp=[0,-.26,-.98];
function ch153SnakeHead(){const M=ch164Mats(),g=new THREE.Group();g.userData.psNo=1;g.userData.noFade135=1;
  const SPH=CH164B.sph||(CH164B.sph=new THREE.SphereGeometry(1,20,14)),I=new THREE.Matrix4(),mx=ch164Mx;
  const U={skin:[],plate:[],bone:[],horn:[],mouth:[],dark:[]},L={skin:[],plate:[],bone:[],mouth:[],dark:[]};
  // the skull and the snout: a wedge, widest at the temples (the jaw muscles), the snout flattening to a blunt tip
  const SK=[[-1.25,.78,.55,.34,.04],[-1.0,.99,.66,.42,.08],[-.65,1.14,.72,.44,.12],[-.25,1.12,.7,.4,.14],[.2,1.0,.63,.35,.14],[.65,.86,.55,.3,.11],[1.1,.72,.47,.26,.07],[1.5,.58,.39,.22,.03],[1.82,.45,.31,.18,0],[2.04,.3,.23,.13,-.02],[2.16,.14,.13,.08,-.03]];
  U.skin.push([ch164Loft(SK,30,{e:.82,vl:4.2,tip:.05,back:.04}),I]);
  [-1,1].forEach(s=>{
    // brow ridges: heavy and overhanging the eyes
    U.plate.push([ch164Tube([[s*.42,.55,1.42],[s*.64,.66,1.0],[s*.82,.63,.55],[s*.92,.53,.1],[s*.9,.42,-.35],[s*.82,.32,-.7]],[[.04,.03],[.13,.08],[.17,.11],[.15,.1],[.1,.07],[.04,.03]],14),I]);
    // eyes in dark sockets, the slit facing out and a little forward
    U.dark.push([SPH,mx(s*.73,.3,.74,0,0,0,.25,.22,.3)]);
    U.eye=U.eye||[];U.eye.push([SPH,mx(s*.79,.3,.77,0,s>0?-.45:Math.PI+.45,0,.19,.18,.19)]);
    // nostrils at the snout, heat pits below the eyes, the labial line
    U.dark.push([SPH,mx(s*.17,.1,2.02,0,0,0,.065,.04,.06)]);U.dark.push([SPH,mx(s*.5,-.02,1.5,0,s*.6,0,.06,.05,.045)]);
    // a crown of swept horns behind the brow, curling up
    for(let i=0;i<3;i++)U.horn.push([ch164Horn(.1-i*.015,.62-i*.1,0,.16,10,7),mx(s*(.82-i*.07),.56-i*.04,-.25-i*.33,-.42,Math.PI-s*(.45-i*.06),0,1,1,1,'YXZ')]);
    // head shields: supraoculars over the eyes, parietals behind, internasals on the snout
    U.plate.push([SPH,mx(s*.46,.6,.74,0,s*.12,-s*.38,.2,.05,.34)]);U.plate.push([SPH,mx(s*.3,.71,.1,0,s*.05,-s*.14,.24,.05,.36)]);U.plate.push([SPH,mx(s*.15,.43,1.58,-.18,0,-s*.2,.12,.035,.18)]);
    U.plate.push([SPH,mx(s*.27,.67,-.55,0,s*.1,-s*.18,.22,.045,.26)]);
    // upper teeth along the lip, and the great fangs (their own groups, below)
    for(let i=0;i<8;i++){const z=-.45+i*.24,w=(z<.2?1.05:z<1.1?.98-(z-.2)*.3:.7)*.86;U.bone.push([ch164Horn(.032,.13+(i%2)*.04,0,-.03,7,4),mx(s*w,-.24+z*.03,z,Math.PI/2,0,0)])}});
  U.plate.push([SPH,mx(0,.64,.8,0,0,0,.2,.045,.32)]);U.plate.push([SPH,mx(0,.32,1.96,-.5,0,0,.12,.04,.1)]);
  // the crest: short spines down the middle of the skull
  for(let i=0;i<5;i++)U.horn.push([ch164Horn(.07-i*.008,.32-i*.03,0,-.06,8,5),mx(0,.82-i*.06,-.2-i*.24,-(Math.PI/2+.75),0,0)]);
  // the roof of the mouth
  U.mouth.push([SPH,mx(0,-.25,.55,0,0,0,.66,.06,1.32)]);
  const mesh=(parts,mat,par)=>{if(!parts.length)return null;const m=new THREE.Mesh(ch164Merge(parts),mat);m.castShadow=true;m.userData.noFade135=1;par.add(m);return m};
  mesh(U.skin,M.skin,g);mesh(U.plate,M.plate,g);mesh(U.bone,M.bone,g);mesh(U.horn,M.horn,g);mesh(U.mouth,M.mouth,g);mesh(U.dark,M.dark,g);const em=mesh(U.eye,M.eye,g);if(em)em.castShadow=false;
  // the fangs: hinged at their roots, folded back along the palate when the jaw is shut, swinging forward as it opens
  const fangs=[-1,1].map(s=>{const f=new THREE.Group();f.position.set(s*.38,-.18,1.6);g.add(f);
    const m=new THREE.Mesh(CH164B.fangG||(CH164B.fangG=ch164Horn(.075,.86,0,-.24,12,9)),M.bone);m.rotation.x=Math.PI/2;m.castShadow=true;f.add(m);f.userData.tip=new THREE.Vector3(0,-.86,-.24);return f});
  // the lower jaw
  const jaw=new THREE.Group(),J=CH164B.jp;jaw.position.set(J[0],J[1],J[2]);g.add(jaw);
  const JW=[[-1.12,.86,.12,.24,-.36],[-.75,.98,.13,.28,-.4],[-.25,.94,.12,.27,-.41],[.3,.82,.1,.24,-.39],[.85,.68,.09,.2,-.35],[1.35,.54,.08,.17,-.31],[1.75,.4,.07,.14,-.27],[2.0,.26,.06,.11,-.24],[2.12,.12,.05,.07,-.22]];
  const jo=ch164Mx(-J[0],-J[1],-J[2]);L.skin.push([ch164Loft(JW,26,{e:.85,vl:4.2,tip:.04,back:.04}),jo]);
  L.mouth.push([SPH,new THREE.Matrix4().multiplyMatrices(jo,mx(0,-.29,.5,0,0,0,.66,.05,1.3))]);
  [-1,1].forEach(s=>{for(let i=0;i<7;i++){const z=-.3+i*.27,w=(z<.3?.9:.9-(z-.3)*.32)*.84;L.bone.push([ch164Horn(.03,.12+(i%2)*.03,0,.03,7,4),new THREE.Matrix4().multiplyMatrices(jo,mx(s*w,-.27,z,-Math.PI/2,0,0))])}
    L.plate.push([SPH,new THREE.Matrix4().multiplyMatrices(jo,mx(s*.3,-.62,1.2,.1,0,s*.3,.2,.04,.5))])});
  mesh(L.skin,M.skin,jaw);mesh(L.plate,M.plate,jaw);mesh(L.bone,M.bone,jaw);mesh(L.mouth,M.mouth,jaw);
  // the forked tongue (in the jaw; it flicks out: scale z)
  const tg=new THREE.Group();tg.position.set(0,-.27-J[1],.2-J[2]);jaw.add(tg);
  if(!CH164B.tgG){const a=ch164Tube([[0,0,0],[0,.02,.9],[0,.03,1.7],[0,.04,2.15]],[[.07,.035],[.06,.03],[.045,.025],[.035,.02]],10),
      f=[-1,1].map(s=>ch164Tube([[0,.04,2.1],[s*.08,.05,2.4],[s*.19,.07,2.7]],[.03,.018,.006],8,{tip:.03}));CH164B.tgG=ch164Merge([[a,new THREE.Matrix4()],[f[0],new THREE.Matrix4()],[f[1],new THREE.Matrix4()]])}
  const tm=new THREE.Mesh(CH164B.tgG,M.tongue);tg.add(tm);tg.scale.z=.25;
  // the hood
  const hood=ch164Hood(M);g.add(hood);
  g.userData.jaw=jaw;g.userData.hood=hood;g.userData.fangs=fangs;g.userData.tongue=tg;g.userData.eyeM=M.eye;
  g.scale.setScalar(1.35);return g}
// the hood: a ribbed fan around the back of the head and the neck, cupped forward, scalloped between the ribs
function ch164HoodGeo(){if(CH164B.hoodG)return CH164B.hoodG;const NU=40,NV=10,NRib=9,F0=-1.95,F1=1.95,R0=.88,pos=[],uv=[],idx=[],back=[];
  const at=(u,v)=>{const f=F0+(F1-F0)*u,af=Math.abs(f),rib=Math.pow(Math.abs(Math.cos(u*NRib*Math.PI)),3),
      r1=(1.12+.72*Math.pow(Math.sin(Math.min(Math.PI/2,af*1.05)),1.3)-.25*Math.max(0,af-1.5))*(1-.08*(1-rib)*v*v),p=R0+(r1-R0)*v;
    return [Math.sin(f)*p*1.06,Math.cos(f)*p*.9+.14,-1.0-.12*(p-R0)+.3*v*v*(.4+.6*Math.min(1,af))+.05*rib*v]};
  for(let j=0;j<=NV;j++)for(let i=0;i<=NU;i++){const p=at(i/NU,j/NV);pos.push(p[0],p[1],p[2]);uv.push(i/NU,j/NV)}
  const W=NU+1;for(let j=0;j<NV;j++)for(let i=0;i<NU;i++){const a=j*W+i,b=a+1,c=a+W,d=c+1;idx.push(a,b,c,b,d,c);back.push(a,c,b,b,c,d)}
  const mk=(P,I)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(I);g.computeVertexNormals();return g};
  const bp=pos.slice();for(let i=2;i<bp.length;i+=3)bp[i]-=.035;
  // the ribs: raised ridges on the front
  const ribs=[];for(let k=1;k<NRib;k++){const u=k/NRib,pts=[];for(let j=0;j<=6;j++){const p=at(u,j/6*.97);pts.push([p[0],p[1],p[2]+.025])}ribs.push([ch164Tube(pts,[.045,.04,.035,.03,.024,.016,.008],6),new THREE.Matrix4()])}
  return CH164B.hoodG={f:mk(pos,idx),b:mk(bp,back),r:ch164Merge(ribs)}}
function ch164Hood(M){const G=ch164HoodGeo(),h=new THREE.Group();[[G.f,M.hoodF],[G.b,M.hoodB],[G.r,M.plate]].forEach(([g,m])=>{const x=new THREE.Mesh(g,m);x.castShadow=true;x.userData.noFade135=1;h.add(x)});return h}
// ---------------- the whole serpent ----------------
// the resting radius along the body (f: 0 inside the skull, 1 the neck, n the last spine point): used for the scales' size
function ch164Rad(f,n){if(f<=1)return 1.3+.25*f;const i=f-1;return 1.55*(1-Math.pow(Math.min(1,i/n),1.6)*.82)}
function ch153Snake(parent,n){const M=ch164Mats(),g=new THREE.Group();g.userData.psNo=1;g.userData.noFade135=1;parent.add(g);
  const head=ch153SnakeHead();g.add(head);
  const NS=CH164B.ns,SUB=CH164B.sub,NP=n+2,NR=(NP-1)*SUB+1,W=NS+1,pos=new Float32Array(NR*W*3),nor=new Float32Array(NR*W*3),uv=new Float32Array(NR*W*2),idx=[];
  let v=0;for(let r=0;r<NR;r++){if(r)v+=CH164B.sp/SUB/Math.max(.3,ch164Rad(r/SUB,n))*CH164B.vk*1.55;for(let k=0;k<=NS;k++){uv[(r*W+k)*2]=k/NS;uv[(r*W+k)*2+1]=v}}
  for(let r=0;r<NR-1;r++)for(let k=0;k<NS;k++){const a=r*W+k,b=a+1,c=a+W,d=c+1;idx.push(a,b,c,b,d,c)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.setIndex(idx);
  const body=new THREE.Mesh(geo,M.skin);body.frustumCulled=false;body.castShadow=true;body.receiveShadow=true;body.userData.noFade135=1;g.add(body);
  // dorsal scutes (every 2nd ring, the front 88%) and spines (every point, the front 72%)
  const scR=[],spR=[];for(let r=SUB;r<NR*.88;r+=2)scR.push(r);for(let r=SUB;r<NR*.72;r+=SUB)spR.push(r);
  const inst=(geo2,mat,list)=>{const q=new THREE.InstancedMesh(geo2,mat,list.length);q.frustumCulled=false;q.castShadow=true;q.userData.noFade135=1;q.instanceMatrix.setUsage(THREE.DynamicDrawUsage);g.add(q);return q};
  const sc=inst(ch164ScuteGeo(),M.plate,scR),sp=inst(CH164B.spG||(CH164B.spG=ch164Horn(.2,1,0,.5,8,5).rotateX(-Math.PI/2)),M.horn,spR);
  // venom drips from the fang tips
  const drips=[0,1].map(i=>{const m=new THREE.Mesh(CH164B.sph,M.venom);m.visible=false;m.castShadow=false;g.add(m);return {m,t:-Math.random(),v:0,i}});
  const V3=THREE.Vector3;
  return {g,head,jaw:head.userData.jaw,hood:head.userData.hood,fangs:head.userData.fangs,tongue:head.userData.tongue,eyeM:head.userData.eyeM,n,NR,NP,body:geo,sc,sp,scR,spR,drips,
    C:Array.from({length:NP},()=>[0,0,0,0]),F:{c:new Float32Array(NR*3),x:new Float32Array(NR*3),y:new Float32Array(NR*3),t:new Float32Array(NR*3),r:new Float32Array(NR)},
    v:{a:new V3(),b:new V3(),c:new V3(),d:new V3(),T:new V3(),U:new V3(),X:new V3(),Y:new V3(),w:new V3(),up:new V3(0,1,0),m:new THREE.Matrix4(),h:new V3()},lt:0}}
// lay the body: pts[i] = [x, y, z, radius] from the neck back toward the tail (3250's ch153SnakeAnim)
function ch153SnakeLay(S,pts){const n=pts.length,SUB=CH164B.sub,NS=CH164B.ns,W=NS+1,NP=S.NP,NR=S.NR,C=S.C,V=S.v,F=S.F;
  S.head.updateMatrix();const hp=V.h.set(0,.08,-.9).applyMatrix4(S.head.matrix);
  C[0][0]=hp.x;C[0][1]=hp.y;C[0][2]=hp.z;C[0][3]=S.head.visible?Math.min(1.25,(pts[0]?pts[0][3]:1)*.82):0;
  for(let i=0;i<n&&i<NP-2;i++){const p=pts[i],q=C[i+1];q[0]=p[0];q[1]=p[1];q[2]=p[2];q[3]=p[3]}
  {const a=C[NP-2],b=C[NP-3],q=C[NP-1];q[0]=a[0]+(a[0]-b[0])*.85;q[1]=a[1]+(a[1]-b[1])*.85;q[2]=a[2]+(a[2]-b[2])*.85;q[3]=0}
  const P=S.body.attributes.position.array,Nn=S.body.attributes.normal.array,T=V.T,U=V.U,X=V.X,Y=V.Y,w=V.w,up=V.up;U.set(0,1,0);T.set(0,0,1);
  for(let r=0;r<NR;r++){const f=r/SUB,i=Math.min(NP-2,Math.floor(f)),t=f-i,p0=C[Math.max(0,i-1)],p1=C[i],p2=C[i+1],p3=C[Math.min(NP-1,i+2)],t2=t*t,t3=t2*t;
    let cx,cy,cz;{const a=k=>.5*(2*p1[k]+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3),d=k=>.5*((-p0[k]+p2[k])+2*(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t+3*(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t2);
      cx=a(0);cy=a(1);cz=a(2);const dx=d(0),dy=d(1),dz=d(2),l=Math.hypot(dx,dy,dz);if(l>1e-5)T.set(dx/l,dy/l,dz/l)}
    const rr=p1[3]+(p2[3]-p1[3])*t;
    // up: world up where the body lies flat, carried along (no flips) where it stands up (the emergence)
    w.copy(up).addScaledVector(T,-up.dot(T));const wl=w.length();U.addScaledVector(T,-U.dot(T));if(U.lengthSq()<1e-6)U.copy(w);U.normalize();
    if(wl>.2)U.lerp(w.multiplyScalar(1/wl),Math.min(1,wl*wl)).normalize();X.crossVectors(U,T).normalize();Y.crossVectors(T,X).normalize();
    const rx=rr*1.06,ryt=rr*.94,ryb=rr*.74;
    for(let k=0;k<=NS;k++){const a=k/NS*Math.PI*2,c=Math.cos(a),s=Math.sin(a),ry=s>=0?ryt:ryb,j=(r*W+k)*3;
      P[j]=cx+X.x*c*rx+Y.x*s*ry;P[j+1]=cy+X.y*c*rx+Y.y*s*ry;P[j+2]=cz+X.z*c*rx+Y.z*s*ry;
      let nx=X.x*c/Math.max(.01,rx)+Y.x*s/Math.max(.01,ry),ny=X.y*c/Math.max(.01,rx)+Y.y*s/Math.max(.01,ry),nz=X.z*c/Math.max(.01,rx)+Y.z*s/Math.max(.01,ry);const nl=Math.hypot(nx,ny,nz)||1;Nn[j]=nx/nl;Nn[j+1]=ny/nl;Nn[j+2]=nz/nl}
    const j=r*3;F.c[j]=cx;F.c[j+1]=cy;F.c[j+2]=cz;F.x[j]=X.x;F.x[j+1]=X.y;F.x[j+2]=X.z;F.y[j]=Y.x;F.y[j+1]=Y.y;F.y[j+2]=Y.z;F.t[j]=T.x;F.t[j+1]=T.y;F.t[j+2]=T.z;F.r[r]=rr}
  S.body.attributes.position.needsUpdate=true;S.body.attributes.normal.needsUpdate=true;
  // the scutes and spines sit on the spine of the tube, facing forward (toward the head)
  const m=V.m,a=V.a,b=V.b,c=V.c,d=V.d;
  const place=(q,list,lift,sx,sy,sz)=>{list.forEach((r,i)=>{const j=r*3,rr=F.r[r];if(rr<.05){m.makeScale(0,0,0);q.setMatrixAt(i,m);return}
      b.set(F.y[j],F.y[j+1],F.y[j+2]);c.set(-F.t[j],-F.t[j+1],-F.t[j+2]);a.crossVectors(b,c);d.set(F.c[j],F.c[j+1],F.c[j+2]).addScaledVector(b,rr*.94*lift);
      m.makeBasis(a,b,c);m.scale(V.h.set(sx*rr,sy*rr,sz*rr));m.setPosition(d);q.setMatrixAt(i,m)});q.instanceMatrix.needsUpdate=true};
  place(S.sc,S.scR,.97,.5,.42,.5);place(S.sp,S.spR,.99,.42,.5,.42)}
// the head's own motion each frame: fangs swing with the jaw, the tongue flicks, the eyes pulse, venom drips from the fangs
function ch164HeadAnim(S,t,jaw,rear){const dt=Math.min(.1,Math.max(0,t-(S.lt||t)));S.lt=t;
  const fo=Math.min(1,Math.max(0,(jaw-.12)/.6));S.fangs.forEach(f=>{f.rotation.x=-1.25*(1-fo)});
  const ph=(t*.42)%1,out=ph<.22?Math.sin(ph/.22*Math.PI):0,tg=S.tongue;tg.scale.z=.25+.85*out*(jaw<.85?1:.4);tg.rotation.x=.12*out*Math.sin(t*31);tg.rotation.y=.18*out*Math.sin(t*23);
  if(S.eyeM)S.eyeM.color.setScalar(.82+.18*Math.sin(t*2.6)+.15*rear);
  S.head.updateMatrixWorld(true);const V=S.v;
  S.drips.forEach((d,i)=>{d.t+=dt;const f=S.fangs[i];if(d.t<0){d.m.visible=false;return}
    if(d.t<.75){if(fo<.25){d.m.visible=false;return}const tip=f.localToWorld(V.c.copy(f.userData.tip));d.m.visible=true;d.m.position.copy(tip);const k=d.t/.75,sc=.04+.07*k;d.m.scale.set(sc,sc*(1+k*.9),sc);d.m.position.y-=sc*.6;d.v=0}
    else{d.v+=22*dt;d.m.position.y-=d.v*dt;d.m.scale.y*=1+dt*.6;if(d.t>1.35){d.t=-.25-Math.random()*.9;d.m.visible=false}}})}
