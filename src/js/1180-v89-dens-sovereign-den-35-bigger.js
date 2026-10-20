// ================= v89 dens: every Sovereign den is 35% bigger =================
// The den files (zzK_den*.js) still build each den at its original size (radius 14 arena). Right after that, this file
// maps the whole den outward from its centre: horizontally by DK (1.35) and in height above the ground by DKY (1.15).
//  - world-space den meshes (floors, walls, soups) get every vertex moved: x,z scaled about the centre, y re-draped onto
//    the terrain at the new spot (height above ground × DKY)
//  - objects centred on the den (seals, curtains, the sinkhole swirl, the blood flood) are scaled in x/z
//  - placed objects (eye-stalks, statues, flames, warm circles, sprites) are moved, not resized (a few decorations grow)
//  - every stored mechanic position (pillars, pools, stepping stones, braziers, neck slots, Warmfires, statues, columns,
//    vats, corpse piles, pedestals, fountains, throne) is moved the same way; radii of things that grew are scaled
//  - the solid tiles (denBlock) are rebuilt as the scaled image of the old footprint; runtime denBlock/denUnblock of a
//    den object (statues, columns) blocks/unblocks its whole scaled footprint
// DK/DKY are defined at the top of the script (build/pN_dens.py), which also scales ARENA_R, the map clearing and the
// numbers inside the dens' runtime code.
var DENS={on:false,img:[],n:0};
function denMapXZ(A,x,z){return [A.cx+(x-A.cx)*DK,A.cz+(z-A.cz)*DK]}
function denMapY(A,x,y,z,nx,nz){return GH(nx,nz)+(y-GH(x,z))*DKY}
// move every vertex of a world-space geometry that lies in the den
function denMapGeo(A,g,seen){if(!g||!g.attributes||!g.attributes.position||seen.has(g))return;seen.add(g);const P=g.attributes.position,a=P.array;let n=0;
  for(let i=0;i<P.count;i++){const x=a[i*3],y=a[i*3+1],z=a[i*3+2];if(Math.hypot(x-A.cx,z-A.cz)>34)continue;const [nx,nz]=denMapXZ(A,x,z);a[i*3]=nx;a[i*3+1]=denMapY(A,x,y,z,nx,nz);a[i*3+2]=nz;n++}
  if(!n)return;P.needsUpdate=true;if(g.attributes.normal&&!g.index)g.computeVertexNormals();g.boundingBox=null;g.computeBoundingSphere();DENS.n+=n}
function denMapObj(A,o,seen,grow){
  const px=o.position.x,pz=o.position.z,d=Math.hypot(px-A.cx,pz-A.cz);
  if(d>60){ // a container at the world origin: its geometry/children are in world space
    if(o.geometry&&!o.isSprite)denMapGeo(A,o.geometry,seen);o.children.forEach(c=>denMapObj(A,c,seen,grow));return}
  if(o===A.wall)return;   // already built at the new ARENA_R
  if(d<.6){o.scale.x*=DK;o.scale.z*=DK;return}
  const [nx,nz]=denMapXZ(A,px,pz);o.position.set(nx,denMapY(A,px,o.position.y,pz,nx,nz),nz);
  if(grow&&grow.has(o)){o.scale.x*=DK;o.scale.z*=DK;o.scale.y*=grow.get(o)}}
// data: [x,z,(r)] arrays, objects with x/z, Vector3s
function denMapA(A,q,r){const [x,z]=denMapXZ(A,q[0],q[1]);q[0]=x;q[1]=z;if(r&&q.length>2)q[2]*=DK;return q}
function denMapO(A,o){const [x,z]=denMapXZ(A,o.x,o.z);o.x=x;o.z=z;return o}
// per-den state that the den files keep outside A.g
function denMapState(A,grow){const i=A.i,D=A.dn;
  if(i===0&&typeof AR!='undefined'&&AR.A===A){AR.pil.forEach(p=>denMapA(A,p,1));AR.pools.forEach(p=>denMapA(A,p,1));
    AR.st.forEach(T=>{denMapO(A,T);T.ox=T.x+Math.sin(T.gy)*.5;T.oz=T.z+Math.cos(T.gy)*.5;T.p.set(T.x,GH(T.x,T.z)+3.25,T.z)});
    (AR.wisp||[]).forEach(w=>{const b=w.userData.b;if(b)denMapA(A,b)})}
  if(i===1&&typeof HY!='undefined'&&HY.A===A){HY.stones.forEach(s=>denMapA(A,s,1));HY.slots.forEach(s=>denMapA(A,s));HY.braz.forEach(b=>{denMapO(A,b);grow.set(b.fg,DKY)});
    HY.wy=GH(A.cx,A.cz)+.17*DKY}
  if(i===2&&D&&D.br){D.br.forEach(B=>{denMapO(A,B);B.y=GH(B.x,B.z);B.p.set(B.x,0,B.z);[B.wr,B.wd,B.gl].forEach(m=>m&&grow.set(m,1))});
    D.st.forEach(s=>{denMapO(A,s);s.p.set(s.x,0,s.z)})}
  if(i===3&&D&&D.cols){D.cols.forEach(C=>{denMapO(A,C);C.p.set(C.x,0,C.z);C.tiles=C.tiles.map(t=>denMapXZ(A,t[0],t[1]))})}
  if(i===4&&typeof D4!='undefined'&&D4.vats){D4.vats.forEach(v=>denMapA(A,v));D4.piles.forEach(p=>denMapA(A,p));
    A.g.children.forEach(o=>{const u=o.userData;if(o.isSprite&&u&&u.r!=null&&u.h!=null&&u.a!=null){u.r*=DK;u.h*=DKY}})}
  if(i===5&&typeof D5!='undefined'&&D5.ped){D5.ped.forEach(p=>denMapA(A,p));D5.fount.forEach(p=>denMapA(A,p));
    if(D5.L&&!D5.L._dk){const L0=D5.L;D5.L=(u,v)=>L0(u*DK,v*DK);D5.L._dk=1}}}
// solid tiles: the scaled image of each den's old footprint
function denRetile(){const W0=W,by=ARN.map(()=>new Set());
  DENB.forEach(k=>{const x=k%W0,z=(k-x)/W0;for(const A of ARN){if(Math.hypot(x-A.cx,z-A.cz)<26){by[A.i].add(k);break}}});
  by.forEach(S=>S.forEach(k=>{const x=k%W0,z=(k-x)/W0;denUnblock(x,z)}));
  ARN.forEach(A=>{const S=by[A.i],img=new Map(),R=Math.ceil(26*DK);if(!S.size){DENS.img[A.i]=img;return}
    for(let z=Math.floor(A.cz-R);z<=A.cz+R;z++)for(let x=Math.floor(A.cx-R);x<=A.cx+R;x++){const ox=Math.round(A.cx+(x-A.cx)/DK),oz=Math.round(A.cz+(z-A.cz)/DK),ok=oz*W0+ox;
      if(!S.has(ok))continue;const before=DENB.size;denBlock(x,z);if(DENB.size>before){if(!img.has(ok))img.set(ok,[]);img.get(ok).push(z*W0+x)}}
    DENS.img[A.i]=img})}
function denImg(x,z){if(!DENS.on)return null;for(const A of ARN){const m=DENS.img[A.i];if(!m||Math.hypot(x-A.cx,z-A.cz)>30)continue;
  const L=m.get(Math.round(A.cz+(z-A.cz)/DK)*W+Math.round(A.cx+(x-A.cx)/DK));if(L)return L}return null}
function denScaleAll(){if(DENS.on)return;
  ARN.forEach(A=>{try{const seen=new Set(),grow=new Map();denMapState(A,grow);A.g.children.slice().forEach(o=>denMapObj(A,o,seen,grow))}catch(err){console.error('den scale',A.i,err)}});
  try{denRetile()}catch(err){console.error('den retile',err)}
  DENS.on=true;
  // runtime blocks of den objects (Thawed statues, smashed columns) cover their whole scaled footprint
  {const fb=denBlock,fu=denUnblock;
    denBlock=function(x,z){const L=denImg(x,z);if(L){L.forEach(k=>{const tx=k%W;fb(tx,(k-tx)/W)});return}return fb(x,z)};
    denUnblock=function(x,z){const L=denImg(x,z);if(L){L.forEach(k=>{const tx=k%W;if(DENB.has(k)){DENB.delete(k);MAP[(k-tx)/W][tx]='a'}});return}return fu(x,z)}}}
try{denScaleAll()}catch(err){console.error('den scale',err)}

