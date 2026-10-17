// ================= v83: low-poly Duskhold — hand-hewn timber and rough stone (Valheim style) =================
// Towns are built long before this code runs, so everything here is hoisted function declarations
// (they replace the older ones of the same name for the whole script) plus lazily-created vars.
// Shapes are merged per building into a few flat-shaded meshes; each face gets its own slightly
// different shade, corners are nudged a little so nothing looks machine-cut, and walls darken toward the ground.
var TWM,TWG,TWBK,TWC;
function twInit(){if(!TWBK)TWBK={};if(!TWC)TWC={wood:0x5a4433,woodD:0x3a2b20,woodL:0x7a6048,stone:0x7a766c,stoneD:0x5c5952,stoneL:0x8e897c,roof:0x45403e,thatch:0x5e4c36,iron:0x34343a,gold:0xc9a24a,cloth:0x7a2230,glow:0xffc870}}
function twMat(){if(TWM)return TWM;
  const f=o=>{const m=new THREE.MeshStandardMaterial(Object.assign({vertexColors:true,flatShading:true,roughness:.95,metalness:0},o));m.userData.lps=1;return m};
  TWM={c:f({}),m:f({roughness:.45,metalness:.55}),g:new THREE.MeshBasicMaterial({vertexColors:true})};TWM.g.userData.lps=1;return TWM}
function twGeo(){if(TWG)return TWG;
  const ni=g=>{const n=g.index?g.toNonIndexed():g;n.deleteAttribute('uv');n.deleteAttribute('normal');return n};
  const tri=new THREE.Shape();tri.moveTo(-.5,0);tri.lineTo(.5,0);tri.lineTo(0,1);tri.closePath();
  const tg=new THREE.ExtrudeGeometry(tri,{depth:1,bevelEnabled:false});tg.translate(0,0,-.5);
  TWG={box:ni(new THREE.BoxGeometry(1,1,1)),cyl6:ni(new THREE.CylinderGeometry(1,1,1,6)),log:ni(new THREE.CylinderGeometry(.86,1,1,6)),cyl8:ni(new THREE.CylinderGeometry(1,1,1,8)),
    frus8:ni(new THREE.CylinderGeometry(.62,1,1,8)),cone4:ni(new THREE.ConeGeometry(1,1,4)),cone6:ni(new THREE.ConeGeometry(1,1,6)),cone8:ni(new THREE.ConeGeometry(1,1,8)),
    dod:ni(new THREE.DodecahedronGeometry(1,0)),ico:ni(new THREE.IcosahedronGeometry(1,0)),oct:ni(new THREE.OctahedronGeometry(1,0)),sph:ni(new THREE.SphereGeometry(1,6,4)),tri:ni(tg)};
  return TWG}
function twH(x,y,z,s){const v=Math.sin(x*12.9898+y*78.233+z*37.719+s*4.17)*43758.5453;return v-Math.floor(v)}
// k.p(type,colour,shape,x,y,z,sx,sy,sz,rx,ry,rz,jitter) · k.L(type,colour,a,b,radius,shape,jitter): log between two points
// type: c = matte, m = metal, g = glowing
function twKit(seed){twInit();const P=[],R=dkRng(seed||11),E=new THREE.Euler(),UP=new THREE.Vector3(0,1,0);
  const push=(t,col,geo,pos,q,s,j)=>{P.push({t,col,geo,m:new THREE.Matrix4().compose(pos,q,s),j:j==null?.08:j,f:.9+.18*R()})};
  const k={P,R,
    p(t,col,geo,x,y,z,sx,sy,sz,rx,ry,rz,j){E.set(rx||0,ry||0,rz||0);push(t,col,typeof geo=='string'?twGeo()[geo]:geo,new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(E),new THREE.Vector3(sx,sy==null?sx:sy,sz==null?sx:sz),j);return k},
    L(t,col,a,b,r,geo,j){const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),len=d.length()||.001,q=new THREE.Quaternion().setFromUnitVectors(UP,d.normalize());
      q.multiply(new THREE.Quaternion().setFromAxisAngle(UP,R()*6.28));
      push(t,col,twGeo()[geo||'cyl6'],new THREE.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),q,new THREE.Vector3(r,len,r),j==null?.12:j);return k}};
  return k}
// merge a kit into one mesh per material type; cached by key
function twBake(P,key,ao){twInit();let gs=key&&TWBK[key];
  if(!gs){gs={};const by={};P.forEach(p=>(by[p.t]=by[p.t]||[]).push(p));
    const v=new THREE.Vector3(),c=new THREE.Color(),sc=new THREE.Vector3(),q=new THREE.Quaternion(),tp=new THREE.Vector3();
    for(const t in by){const pos=[],col=[];
      by[t].forEach(p=>{const pa=p.geo.attributes.position,n=pa.count,base=pos.length;p.m.decompose(tp,q,sc);
        const amp=(t=='g'?0:p.j)*Math.min(Math.abs(sc.x),Math.abs(sc.y),Math.abs(sc.z));c.set(p.col);
        for(let i=0;i<n;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);
          if(amp){const rx=Math.round(v.x*300)/300,ry=Math.round(v.y*300)/300,rz=Math.round(v.z*300)/300;v.x+=(twH(rx,ry,rz,1)-.5)*amp;v.y+=(twH(rx,ry,rz,2)-.5)*amp*.7;v.z+=(twH(rx,ry,rz,3)-.5)*amp}
          pos.push(v.x,v.y,v.z)}
        for(let i=0;i<n;i+=3){const k=base+i*3,cx=(pos[k]+pos[k+3]+pos[k+6])/3,cy=(pos[k+1]+pos[k+4]+pos[k+7])/3,cz=(pos[k+2]+pos[k+5]+pos[k+8])/3;
          let f=p.f*(t=='g'?1:.86+.22*twH(cx,cy,cz,9));if(ao&&t!='g')f*=.66+.34*Math.min(1,Math.max(0,cy/2));
          for(let r=0;r<3;r++)col.push(c.r*f,c.g*f,c.b*f)}});
      const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
      G.computeVertexNormals();G.computeBoundingSphere();G.userData.lps=1;gs[t]=G}
    if(key)TWBK[key]=gs}
  const M=twMat();return Object.keys(gs).map(t=>{const m=new THREE.Mesh(gs[t],M[t]);m.castShadow=t!='g';m.receiveShadow=true;m.userData.lpsSkip=1;return m})}
function twGroup(k,key,ao){const g=new THREE.Group();twBake(k?k.P:[],key,ao==null?true:ao).forEach(m=>g.add(m));return g}
function twHas(key){twInit();return !!TWBK[key]}

// ---------- building blocks ----------
// rough stone blocks in courses along a line (x0,z0)->(x1,z1)
function twStones(k,col,x0,z0,x1,z1,y0,y1,th,bl){const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz)||.01,ux=dx/L,uz=dz/L,ry=Math.atan2(-dz,dx);bl=bl||.62;
  let y=y0,row=0;while(y<y1-.04){const bh=Math.min(y1-y,.3+k.R()*.14);let u=row%2?-bl*.45:0;
    while(u<L-.02){const len=Math.min(L-Math.max(u,0),bl*(.7+k.R()*.6)),a=Math.max(u,0),m=a+len/2,sh=(k.R()-.5)*.12;
      if(len>.08)k.p('c',k.R()<.25?TWC.stoneD:k.R()<.3?TWC.stoneL:col,'box',x0+ux*m,y+bh/2,z0+uz*m,len-.025,bh-.025,th*(.94+k.R()*.12),sh*.3,ry,sh*.2,.16);u+=len}
    y+=bh;row++}}
// a round tower wall of stone blocks
function twStoneRing(k,col,cx,cz,r,y0,y1,th){let y=y0,row=0;const n=Math.max(7,Math.round(Math.PI*2*r/.85));
  while(y<y1-.04){const bh=Math.min(y1-y,.42+k.R()*.14);for(let i=0;i<n;i++){const a=(i+(row%2)*.5)/n*Math.PI*2,len=Math.PI*2*r/n;
      k.p('c',k.R()<.22?TWC.stoneD:k.R()<.25?TWC.stoneL:col,'box',cx+Math.cos(a)*r,y+bh/2,cz+Math.sin(a)*r,th,bh-.03,len*1.04,0,-a,0,.16)}
    y+=bh;row++}
  k.p('c',TWC.stoneD,'cyl8',cx,(y0+y1)/2,cz,r-th*.35,y1-y0,r-th*.35,0,0,0,0)}
// horizontal log wall between two points, logs sitting on y0 up to y1; ext = how far logs poke past the ends
function twLogs(k,col,x0,z0,x1,z1,y0,y1,r,ext){const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz)||.01,ux=dx/L,uz=dz/L;r=r||.13;let y=y0+r,i=0;
  while(y<y1+r*.2){const e0=(i%2?ext:-.02)*(.6+k.R()*.6),e1=(i%2?-.02:ext)*(.6+k.R()*.6),cc=k.R()<.2?TWC.woodD:k.R()<.25?TWC.woodL:col;
    k.L('c',cc,[x0-ux*e0,y,z0-uz*e0],[x1+ux*e1,y,z1+uz*e1],r*(.9+k.R()*.2),'cyl6',.1);y+=r*1.86;i++}}
// vertical planks
function twPlanks(k,col,x0,z0,x1,z1,y0,y1,w){const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz)||.01,ux=dx/L,uz=dz/L,ry=Math.atan2(-dz,dx);w=w||.24;const n=Math.max(1,Math.round(L/w));
  for(let i=0;i<n;i++){const m=(i+.5)*L/n,h=y1-y0-k.R()*.08;k.p('c',k.R()<.25?TWC.woodD:col,'box',x0+ux*m,y0+h/2,z0+uz*m,L/n-.02,h,.07,0,ry,(k.R()-.5)*.03,.1)}}
// gable roof: ridge along x (width w), slopes down to z=±(d/2+over), eaves at y=0; layered shingle rows
function twGable(k,col,w,d,rise,over,y0,trim){over=over==null?.35:over;y0=y0||0;const hd=d/2+over,L=Math.hypot(hd,rise),a=Math.atan2(rise,hd),W=w+over*2,rows=Math.max(3,Math.round(L/.42));
  [-1,1].forEach(s=>{for(let i=0;i<rows;i++){const t=(i+.5)/rows,cz=s*hd*(1-t),cy=y0+rise*t;
      k.p('c',k.R()<.3?dkShade(col,.82):k.R()<.3?dkShade(col,1.15):col,'box',(k.R()-.5)*.06,cy+.05,cz,W+(k.R()-.5)*.1,.1,L/rows*1.18,s*a+(k.R()-.5)*.04,0,(k.R()-.5)*.025,.14)}
    k.p('c',dkShade(col,.75),'box',0,y0+rise/2-.02,s*hd/2,W*.995,.06,L,s*a,0,0,0)});
  k.L('c',trim||TWC.woodD,[-W/2-.15,y0+rise+.08,0],[W/2+.15,y0+rise+.08,0],.11,'cyl6');
  // gable ends filled with planks, crossed bargeboards poking above the ridge
  [-1,1].forEach(s=>{k.p('c',TWC.wood,'tri',s*(w/2-.02),y0,0,hd*2-.12,rise-.04,.1,0,Math.PI/2,0,.04);
    [-1,1].forEach(q=>k.L('c',trim||TWC.woodD,[s*(W/2-.04),y0-.05,q*hd],[s*(W/2-.04),y0+rise+.35,-q*.22],.07,'box',.04))})}
// layered conical roof
function twCone(k,col,cx,y0,cz,r,h){const tiers=3;for(let i=0;i<tiers;i++){const t0=i/tiers,r0=r*(1-t0*.85),hh=h/tiers*1.25;
    k.p('c',i%2?dkShade(col,.88):col,i==tiers-1?'cone8':'frus8',cx,y0+h*t0+hh/2,cz,r0,hh,r0,0,(k.R()-.5)*.4,0,.12)}
  k.L('m',TWC.iron,[cx,y0+h*.9,cz],[cx,y0+h+.45,cz],.03,'cyl6',0)}
// iron-bound plank door
function twDoor(k,x,y,z,w,h,ry){const c=Math.cos(ry||0),s=Math.sin(ry||0),P=(lx,ly,lz)=>[x+lx*c+lz*s,y+ly,z-lx*s+lz*c];const n=Math.max(3,Math.round(w/.2));
  for(let i=0;i<n;i++){const lx=-w/2+(i+.5)*w/n,q=P(lx,h/2,0);k.p('c',k.R()<.3?TWC.woodD:0x4a3426,'box',q[0],q[1],q[2],w/n-.015,h-k.R()*.04,.07,0,ry||0,0,.05)}
  [h*.25,h*.75].forEach(hy=>{const q=P(0,hy,.045);k.p('m',TWC.iron,'box',q[0],q[1],q[2],w*.96,.06,.02,0,ry||0,0,0)});
  const q=P(w*.32,h*.48,.07);k.p('m',TWC.iron,'oct',q[0],q[1],q[2],.05,.05,.03)}
// glowing window with timber frame and shutters
function twWindow(k,x,y,z,w,h,ry,glow){const c=Math.cos(ry||0),s=Math.sin(ry||0),P=(lx,ly,lz)=>[x+lx*c+lz*s,y+ly,z-lx*s+lz*c];
  let q=P(0,0,0);k.p('g',glow||TWC.glow,'box',q[0],q[1],q[2],w,h,.03,0,ry||0,0);
  [[0,h/2+.04,w+.16,.09],[0,-h/2-.04,w+.2,.1]].forEach(f=>{q=P(0,f[1],.04);k.p('c',TWC.woodD,'box',q[0],q[1],q[2],f[2],f[3],.08,0,ry||0,0,.05)});
  [-1,1].forEach(sd=>{q=P(sd*(w/2+.04),0,.04);k.p('c',TWC.woodD,'box',q[0],q[1],q[2],.08,h+.08,.08,0,ry||0,0,.05);q=P(sd*(w/2+.2),0,.05);k.p('c',0x4a3426,'box',q[0],q[1],q[2],.26,h,.04,0,(ry||0)+sd*.35,0,.05)});
  q=P(0,0,.05);k.p('c',TWC.woodD,'box',q[0],q[1],q[2],.05,h,.04,0,ry||0,0,0)}
// a timber hall: stone footing, log walls, corner posts, gable roof
function twHall(k,o){const W1=o.w,D=o.d,y0=o.y0||.36,y1=o.h,r=.13,hx=W1/2-r,hz=D/2-r;
  twStones(k,TWC.stone,-W1/2-.15,D/2+.05,W1/2+.15,D/2+.05,0,y0,.32);twStones(k,TWC.stone,-W1/2-.15,-D/2-.05,W1/2+.15,-D/2-.05,0,y0,.32);
  twStones(k,TWC.stone,-W1/2-.05,-D/2,-W1/2-.05,D/2,0,y0,.3);twStones(k,TWC.stone,W1/2+.05,-D/2,W1/2+.05,D/2,0,y0,.3);
  k.p('c',TWC.stoneD,'box',0,y0/2,0,W1,y0,D,0,0,0,0);
  if(o.stoneWalls){twStones(k,o.wc||TWC.stone,-W1/2+.12,D/2-.12,W1/2-.12,D/2-.12,y0,y1,.26);twStones(k,o.wc||TWC.stone,-W1/2+.12,-D/2+.12,W1/2-.12,-D/2+.12,y0,y1,.26);
    twStones(k,o.wc||TWC.stone,-W1/2+.12,-D/2+.25,-W1/2+.12,D/2-.25,y0,y1,.26);twStones(k,o.wc||TWC.stone,W1/2-.12,-D/2+.25,W1/2-.12,D/2-.25,y0,y1,.26)}
  else{twLogs(k,o.wc||TWC.wood,-hx,hz,hx,hz,y0,y1,r,.22);twLogs(k,o.wc||TWC.wood,-hx,-hz,hx,-hz,y0,y1,r,.22);
    twLogs(k,o.wc||TWC.wood,-hx,-hz,-hx,hz,y0+r*.9,y1,r,.22);twLogs(k,o.wc||TWC.wood,hx,-hz,hx,hz,y0+r*.9,y1,r,.22)}
  [-1,1].forEach(s=>[-1,1].forEach(q=>k.L('c',o.pc||TWC.woodD,[s*(W1/2-.06),y0-.1,q*(D/2-.06)],[s*(W1/2-.06),y1+.12,q*(D/2-.06)],.17,'log')));
  k.L('c',o.pc||TWC.woodD,[-W1/2-.2,y1,D/2],[W1/2+.2,y1,D/2],.12,'box');k.L('c',o.pc||TWC.woodD,[-W1/2-.2,y1,-D/2],[W1/2+.2,y1,-D/2],.12,'box')}

// ---------- town props (same names, footprints and collisions as before) ----------
function roofP(w,d,rise,mat,over){over=over||.35;const col=mat&&mat.color?mat.color.getHex():TWC.roof,key='RF|'+[w,d,rise,over,col].join('|');
  let k=null;if(!twHas(key)){k=twKit(Math.round(w*97+d*13));twGable(k,col,w,d,rise,over,0)}const g=twGroup(k,key,false);return g}
function lamp(p,T,x,z,h){h=h||2.1;const wb=wbase(p,T);T.col.push({x:wb[0]+x,z:wb[1]+z,r:.2});const key='LMP|'+h;let k=null;
  if(!twHas(key)){k=twKit(31);k.L('c',TWC.woodD,[0,0,0],[0,h+.2,0],.08,'log');k.p('c',TWC.stoneD,'dod',0,.12,0,.2,.14,.2);
    k.L('c',TWC.woodD,[0,h+.05,0],[.36,h+.05,0],.04,'box');k.L('m',TWC.iron,[.32,h+.05,0],[.32,h-.1,0],.012,'cyl6',0);
    const lx=.32,ly=h-.28;k.p('m',TWC.iron,'cone4',lx,ly+.2,0,.17,.13,.17,0,Math.PI/4,0,0);k.p('m',TWC.iron,'box',lx,ly-.16,0,.2,.04,.2,0,0,0,0);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>k.p('m',TWC.iron,'box',lx+q[0]*.09,ly,q[1]*.09,.025,.32,.025,0,0,0,0));k.p('g',0xffd27a,'oct',lx,ly,0,.1,.15,.1)}
  const g=twGroup(k,key);g.position.set(x,0,z);g.rotation.y=Math.atan2(-x,-z)+Math.PI/2;p.add(g);TLAMP.push([wb[0]+x,h-.2,wb[1]+z])}
function tower(p,x,z,r,h,roofC,flag){const key='TWR|'+r+'|'+h+'|'+roofC+'|'+flag;let k=null;
  if(!twHas(key)){k=twKit(Math.round(r*100+h*7));
    twStoneRing(k,TWC.stone,0,0,r*1.08,0,.45,.36);twStoneRing(k,TWC.stone,0,0,r,.45,h,.32);
    // timber gallery with corbels under the roof
    const n=Math.max(8,Math.round(r*7));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;k.L('c',TWC.woodD,[Math.cos(a)*r*.9,h-.25,Math.sin(a)*r*.9],[Math.cos(a)*r*1.22,h+.05,Math.sin(a)*r*1.22],.06,'box')}
    k.p('c',TWC.wood,'cyl8',0,h+.12,0,r*1.24,.18,r*1.24,0,0,0,.05);
    for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2;k.p('c',k.R()<.3?TWC.woodD:TWC.wood,'box',Math.cos(a)*r*1.2,h+.42,Math.sin(a)*r*1.2,.07,.5,r*Math.PI*2/n*1.02,0,-a,0,.06)}
    twCone(k,roofC,0,h+.55,0,r*1.42,r*2.3);
    // arrow slits
    [0,2.1,4.2].forEach(a=>k.p('c',0x18141a,'box',Math.cos(a)*(r+.14),h*.6,Math.sin(a)*(r+.14),.08,.5,.16,0,-a,0,0));
    if(flag){const top=h+.55+r*2.3;k.L('c',TWC.woodD,[0,top-.3,0],[0,top+1.0,0],.035,'cyl6',0);
      k.p('c',flag,'box',.34,top+.72,0,.62,.36,.03,0,0,0,.08);k.p('c',flag,'tri',.72,top+.72,0,.36,.2,.03,0,0,-Math.PI/2,.05)}}
  const g=twGroup(k,key);g.position.set(x,0,z);g.rotation.y=(x*7.3+z*3.1)%6.28;p.add(g);return g}
function crate(p,x,z,s,y0){y0=y0||0;if(!y0)tc(p,x,z,s*.62);const key='CRT';let k=null;
  if(!twHas(key)){k=twKit(5);k.p('c',0x7a5a3a,'box',0,.5,0,.94,.94,.94,0,0,0,.05);
    [-1,1].forEach(a=>[-1,1].forEach(b=>{k.p('c',TWC.woodD,'box',a*.47,.5,b*.47,.1,1,.1,0,0,0,.04);k.p('c',TWC.woodD,'box',a*.47,b*.47+.5,0,.1,.1,1,0,0,0,.04);k.p('c',TWC.woodD,'box',0,a*.47+.5,b*.47,1,.1,.1,0,0,0,.04)}));
    [-1,1].forEach(a=>k.p('c',TWC.woodD,'box',a*.48,.5,0,.06,1.25,.1,Math.PI/4,0,0,.03))}
  const g=twGroup(k,key);g.scale.setScalar(s);g.position.set(x,y0,z);g.rotation.y=Math.random()*.4;p.add(g);return g}
function barrel(p,x,z,y0){y0=y0||0;tc(p,x,z,.36);const key='BRL';let k=null;
  if(!twHas(key)){k=twKit(6);[[.19,.32,.29],[.57,.32,.33],[.38,.33,.38]].forEach((q,i)=>k.p('c',0x7a5230,'cyl8',0,q[0],0,q[1],i==2?.08:.38,q[1],0,0,0,.03));
    k.p('c',0x7a5230,'frus8',0,.66,0,.33,.18,.33,0,0,0,.02);k.p('c',0x7a5230,'frus8',0,.1,0,.33,.2,.33,Math.PI,0,0,.02);
    [.12,.38,.64].forEach(h=>k.p('m',TWC.iron,'cyl8',0,h,0,.345,.045,.345,0,0,0,0));k.p('c',0x5a3c22,'cyl8',0,.765,0,.28,.02,.28,0,0,0,0)}
  const g=twGroup(k,key);g.position.set(x,y0,z);g.rotation.y=Math.random()*6.28;p.add(g);return g}
function bench(p,x,z,ry){tcb(p,x,z,.78,.26);const key='BNC';let k=null;
  if(!twHas(key)){k=twKit(8);k.L('c',0x6a4a2e,[-.75,.42,0],[.75,.42,0],.16,'cyl6');k.p('c',0x7a5a3a,'box',0,.5,0,1.5,.07,.34,0,0,0,.06);
    [-.55,.55].forEach(s=>{k.L('c',TWC.woodD,[s,0,0],[s,.38,0],.13,'log');k.L('c',TWC.woodD,[s,.45,-.17],[s,.95,-.24],.05,'box')});k.p('c',0x6a4a2e,'box',0,.85,-.23,1.5,.18,.06,-.12,0,0,.06)}
  const g=twGroup(k,key);g.position.set(x,0,z);g.rotation.y=ry||0;p.add(g);return g}
function planter(p,x,z,w){tcb(p,x,z,w/2,.3);const key='PLT|'+w;let k=null;
  if(!twHas(key)){k=twKit(9);twStones(k,TWC.stone,-w/2,.24,w/2,.24,0,.5,.12,.4);twStones(k,TWC.stone,-w/2,-.24,w/2,-.24,0,.5,.12,.4);
    [-1,1].forEach(s=>k.p('c',TWC.stone,'box',s*(w/2-.06),.25,0,.12,.5,.45,0,0,0,.1));k.p('c',0x3b2a1c,'box',0,.46,0,w*.92,.06,.4,0,0,0,0);
    for(let i=0;i<5;i++){const fx=(i-2)*w/5.4;k.p('c',[0x2f5a2a,0x3a6a30,0x2a4a26][i%3],'ico',fx,.66,0,.2,.17,.2,0,i,0,.1);
      [[.07,.04],[-.06,-.05],[0,.08]].forEach((q,j)=>k.p('c',[0x9a2a3a,0xb08a3a,0xd8d0c0,0x6a4a9a,0xb85a2a][(i+j)%5],'oct',fx+q[0],.82+j*.02,q[1],.045,.04,.045))}}
  const g=twGroup(k,key);g.position.set(x,0,z);p.add(g);return g}
function tree(p,x,z,s){tc(p,x,z,.3*s);const key='TTR';let k=null;
  if(!twHas(key)){k=twKit(12);k.L('c',0x4a3424,[0,0,0],[.05,1.5,.02],.15,'log');k.L('c',0x4a3424,[.03,1.0,0],[.4,1.5,.15],.07,'log');k.L('c',0x4a3424,[0,1.1,0],[-.35,1.6,-.1],.07,'log');
    [[0,1.95,0,.85],[.45,1.65,.2,.55],[-.4,1.75,-.2,.6],[.1,2.4,-.1,.55],[-.15,1.55,.35,.45]].forEach(([a,b,c,r],i)=>k.p('c',[0x2a4a26,0x335a2c,0x26422a][i%3],'ico',a,b,c,r,r*.82,r,i,i*.7,0,.18))}
  const g=twGroup(k,key);g.scale.setScalar(s);g.position.set(x,0,z);g.rotation.y=Math.random()*6.28;p.add(g);return g}
// banner hanging from a crossbar (used on walls)
function twBanner(col){const key='BAN|'+col;let k=null;if(!twHas(key)){k=twKit(14);k.L('c',TWC.woodD,[-.48,0,0],[.48,0,0],.04,'cyl6',0);
    [[-.48],[.48]].forEach(q=>k.p('m',TWC.iron,'oct',q[0],0,0,.06));k.p('c',col,'box',0,-.62,.02,.7,1.15,.03,0,0,0,.05);
    [-1,1].forEach(s=>k.p('c',col,'tri',s*.175,-1.2,.02,.35,.22,.03,0,0,Math.PI,.04));k.p('c',TWC.gold,'box',0,-.12,.04,.72,.07,.02,0,0,0,0);
    k.p('c',0x1a1414,'oct',0,-.62,.04,.16,.2,.02);k.p('c',TWC.gold,'oct',0,-.62,.05,.09,.12,.02)}return twGroup(k,key,false)}

// ---------- the town ----------
function buildTown(T){
  T_cur=T;T.pal=Object.assign({},T.pal,{wall:0x6a5644,wood:0x4a3828,roof:0x3e3a40,stone:0x6e6a62});
  const P=T.pal,g=new THREE.Group();g.position.set(T.cx,T.ph,T.cy);scene.add(g);T.g=g;
  // ---------- gates, towers, name banners ----------
  [-1,1].forEach(s=>{const x=s*TS;
    [-2.3,2.3].forEach(z=>tower(g,x,z,.95,3.1,P.roof,P.ban));
    const key='GATE';let k=null;
    if(!twHas(key)){k=twKit(21);twStones(k,TWC.stone,0,-1.95,0,1.95,2.42,3.08,1.36,.55);
      k.L('c',TWC.woodD,[0,2.25,-1.6],[0,2.25,1.6],.17,'box');[-1.6,1.6].forEach(z=>k.L('c',TWC.woodD,[0,0,z],[0,2.35,z],.13,'log'));
      for(let i=0;i<7;i++){const z=-1.4+i*.467;k.L('m',TWC.iron,[0,1.62,z],[0,2.2,z],.025,'cyl6',0);k.p('m',TWC.iron,'cone4',0,1.55,z,.04,.12,.04,Math.PI,0,0,0)}
      k.L('m',TWC.iron,[0,1.75,-1.55],[0,1.75,1.55],.03,'box',0);
      [-1,1].forEach(q=>k.p('c',TWC.woodD,'box',q*.69,2.75,0,.04,1.0,3.75,0,0,0,.02))}
    const gt=twGroup(k,key);gt.position.set(x,0,0);g.add(gt);
    const t=txTex([{t:T.n.toUpperCase(),f:'700 46px'},{t:'· safe haven ·',f:'600 24px'}],512,128,'#14181f','#f4e9c8','#c9a24a');
    [-1,1].forEach(q=>{const o=TQ(g,G_PLN,signMat(t),x+q*.72,2.75,0,3.6,.9,1,0,q*Math.PI/2,0);o.castShadow=false});
    lamp(g,T,x-s*1.7,-3.1);lamp(g,T,x-s*1.7,3.1);
  });
  [-1,1].forEach(sx=>[-1,1].forEach(sz=>tower(g,sx*TS,sz*TS,1.45,4.2,P.roof,P.ban)));
  const TS0=TS/TK,_c0=T.col.length,_l0=TLAMP.length;let _pend=T.col.length;
  g.add=function(...os){os.forEach(o=>{const lx=o.position.x,lz=o.position.z;for(let q=_pend;q<T.col.length;q++){const c=T.col[q];if(Math.abs(c.x-T.cx-lx)<.7&&Math.abs(c.z-T.cy-lz)<.7&&!c._s){c.x+=lx*(TK-1);c.z+=lz*(TK-1);c._s=1}}_pend=T.col.length;o.position.x*=TK;o.position.z*=TK});return THREE.Group.prototype.add.apply(this,os)};
  // zone signposts by the gates
  const zs=(x,z,ry,l1,l2)=>{tc(g,x,z,.15);const key='ZSP';let k=null;
    if(!twHas(key)){k=twKit(23);k.L('c',TWC.woodD,[0,0,0],[0,1.95,0],.07,'log');k.p('c',TWC.stoneD,'dod',0,.1,0,.22,.14,.22);
      k.p('c',0x5a3d20,'box',0,1.62,-.02,1.64,.54,.06,0,0,0,.04);k.p('c',TWC.woodD,'box',0,1.9,-.02,1.7,.06,.08,0,0,0,.03);k.p('c',TWC.woodD,'box',0,1.34,-.02,1.7,.06,.08,0,0,0,.03);
      k.p('c',0x5a3d20,'tri',.95,1.62,-.02,.54,.22,.06,0,0,-Math.PI/2,.03)}
    const sg=twGroup(k,key);sg.position.set(x,0,z);sg.rotation.y=ry;g.add(sg);
    sign(sg,[{t:l1,f:'700 30px'},{t:l2,f:'600 24px'}],1.5,.44,'#5a3d20','#f4e9c8','#2e1f12',0,1.62,.03,0,420,120)};
  const lv=i=>'Lv '+TIER_LV[i][0]+'–'+TIER_LV[i][1];
  zs(TS0-2.6,3.6,0,'→ '+ZN[T.i].toUpperCase(),'Enemy '+lv(T.i));
  if(T.i>0)zs(-TS0+2.6,3.6,0,'← '+ZN[T.i-1].toUpperCase(),'Enemy '+lv(T.i-1));
  // ---------- fountain: octagonal stone basin, tiered bowls ----------
  {const f=new THREE.Group();g.add(f);const wat=sm(0x3f9fd8,{roughness:.1,metalness:.1,emissive:0x1a5a8a,emissiveIntensity:.55,transparent:true,opacity:.9});
    const key='FTN';let k=null;
    if(!twHas(key)){k=twKit(40);twStoneRing(k,TWC.stoneL,0,0,2.3,0,.62,.32);
      for(let i=0;i<12;i++){const a=(i+.5)/12*Math.PI*2;k.p('c',TWC.stone,'box',Math.cos(a)*2.32,.68,Math.sin(a)*2.32,.42,.14,1.26,0,-a,0,.08)}
      k.p('c',TWC.stoneD,'cyl8',0,.25,0,2.15,.5,2.15,0,0,0,0);
      k.p('c',TWC.stone,'cyl8',0,.95,0,.44,.9,.44,0,Math.PI/8,0,.1);k.p('c',TWC.stoneL,'frus8',0,1.36,0,1.15,.2,1.15,Math.PI,0,0,.08);
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('c',TWC.stone,'box',Math.cos(a)*1.08,1.5,Math.sin(a)*1.08,.2,.12,.86,0,-a,0,.06)}
      k.p('c',TWC.stone,'cyl8',0,1.85,0,.21,.8,.21,0,0,0,.08);k.p('c',TWC.stoneL,'frus8',0,2.2,0,.62,.12,.62,Math.PI,0,0,.06);
      for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;k.p('c',TWC.stoneD,'box',Math.cos(a)*.3,1.75,Math.sin(a)*.3,.08,.3,.14,0,-a,.3,.05)}
      k.p('m',0xb08a3a,'oct',0,2.52,0,.16,.22,.16)}
    twBake(k?k.P:[],key,true).forEach(m=>f.add(m));
    TQ(f,G_CYL,wat,0,.52,0,2.12,.06,2.12);TQ(f,G_CYL,wat,0,1.48,0,1.0,.05,1.0);TQ(f,G_CYL,wat,0,2.27,0,.54,.04,.54);
    const dm=new THREE.MeshBasicMaterial({color:0xbfe8ff,transparent:true,opacity:.85}),dr=[],dg=new THREE.OctahedronGeometry(1,0);
    for(let k2=0;k2<44;k2++){const d=new THREE.Mesh(dg,dm);d.scale.setScalar(.055);f.add(d);dr.push([d,k2%3,(k2/3|0)/15,Math.random()*6.28])}
    TANIM.push({x:T.cx,z:T.cy,f:now=>{const t0=now/1000;dr.forEach(([d,s,ph,th])=>{const t=(t0*.9+ph)%1;let r,y;
      if(s==0){r=.15+.4*t;y=2.3+.55*Math.sin(Math.PI*t)}else if(s==1){r=.6+.5*t;y=2.3-.85*t*t}else{r=1.1+.95*t;y=1.5-.95*t*t}
      d.position.set(Math.cos(th)*r,y,Math.sin(th)*r)})}});
  }
  // ---------- Trading Post (centre): log hall with striped awning ----------
  {const b=new THREE.Group();b.position.set(0,0,-10.5);g.add(b);const W1=4.8,D=4;
    const key='TPOST';let k=null;
    if(!twHas(key)){k=twKit(51);twHall(k,{w:W1,d:D,h:2.96});twGable(k,TWC.thatch,W1,D,1.5,.35,2.96);
      // chimney
      twStones(k,TWC.stone,1.45,-.6,1.95,-.6,2.4,4.65,.5,.5);k.p('c',TWC.stoneD,'box',1.7,4.7,-.6,.62,.12,.62,0,0,0,.05);
      twDoor(k,0,.36,D/2+.02,1.0,1.75,0);k.L('c',TWC.woodD,[-.62,.36,D/2+.06],[-.62,2.22,D/2+.06],.07,'box');k.L('c',TWC.woodD,[.62,.36,D/2+.06],[.62,2.22,D/2+.06],.07,'box');k.L('c',TWC.woodD,[-.75,2.2,D/2+.07],[.75,2.2,D/2+.07],.08,'box');
      [-1.75,1.75].forEach(x=>twWindow(k,x,1.7,D/2+.04,.66,.56,0,0xffd27a));
      // awning: striped cloth on poles
      for(let i=0;i<6;i++)k.p('c',i%2?0xd8ccb0:P.ban,'box',-2.2+4.4/6*(i+.5),2.12,D/2+.7,4.4/6,.05,1.5,.35,0,0,.04);
      [-2.1,2.1].forEach(x=>k.L('c',TWC.woodD,[x,0,D/2+1.38],[x,1.95,D/2+1.38],.05,'log'));k.L('c',TWC.woodD,[-2.3,1.88,D/2+1.38],[2.3,1.88,D/2+1.38],.05,'box');
      // counter
      twPlanks(k,0x6a4a2e,-1.5,3.85,1.5,3.85,0,.96,.25);twPlanks(k,0x6a4a2e,-1.5,3.15,1.5,3.15,0,.96,.25);k.p('c',0x5a3c24,'box',0,.99,3.5,3.2,.09,.85,0,0,0,.06);
      [-1,-.7,-.4].forEach((x,i)=>{for(let q=0;q<3+i;q++)k.p('m',0xd8b040,'cyl8',x,1.07+q*.05,3.3,.12,.05,.12,0,0,0,0)});
      k.p('c',0x8a7a5a,'box',.55,1.12,3.45,.34,.05,.2,0,0,0,.02);k.L('m',TWC.iron,[.55,1.12,3.45],[.55,1.45,3.45],.015,'cyl6',0);[.4,.7].forEach(x=>k.p('m',0x9a9a9a,'cyl8',x,1.17,3.5,.07,.03,.07,0,0,0,0));
      [[1.0,0xc83a3a],[1.2,0x3a7ad8],[1.4,0x3ac87a]].forEach(([x,c])=>{k.p('g',c,'oct',x,1.14,3.62,.06,.1,.06);k.p('c',0xd8c8a0,'cyl6',x,1.25,3.62,.025,.05,.025)})}
    twBake(k?k.P:[],key,true).forEach(m=>b.add(m));
    sign(b,[{t:'TRADING POST',f:'700 56px'},{t:'· goods bought & sold ·',f:'600 26px'}],2.9,.62,'#2e1f12','#ffd88a','#c9a24a',0,2.78,D/2+.14,0,512,150);
    TQ(b,G_CYL,sm(0xe0b83a,{metalness:.7,roughness:.3,emissive:0x6a4a00,emissiveIntensity:.5}),0,4.1,D/2+.25,.5,.07,.5,Math.PI/2);
    tcb(b,0,3.5,1.6,.42);crate(b,-2.6,2.5,.55);barrel(b,2.6,2.5);
    npc(b,0,2.7,{robe:0x2a4a7a,trim:0xc9a24a,hat:'cap',hatC:0x6a2a2a,label:'Merchant',ry:0});
  }
  // ---------- Magic Shop (east): dark stone hall with a wizard's tower ----------
  {const b=new THREE.Group();T.mvG=b;T.mvArr=T.col;const mvc0=T.col.length;b.position.set(9.5,0,-10.5);g.add(b);const W1=5.8,D=4,mst=0x5a5668,tr=0x2c2150,gl=0xaee6ff;
    const key='MAGIC';let k=null;
    if(!twHas(key)){k=twKit(61);twHall(k,{w:W1,d:D,h:2.76,stoneWalls:1,wc:mst,pc:tr});twGable(k,0x2e2848,W1,D,1.3,.35,2.76,tr);
      twStoneRing(k,0x4e4a5c,-2.0,-.4,1.12,0,5.96,.34);
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.L('c',tr,[-2+Math.cos(a)*1.0,5.7,-.4+Math.sin(a)*1.0],[-2+Math.cos(a)*1.32,6.05,-.4+Math.sin(a)*1.32],.06,'box')}
      k.p('c',tr,'cyl8',-2.0,6.1,-.4,1.36,.16,1.36,0,0,0,.04);twCone(k,0x2e2060,-2.0,6.15,-.4,1.6,2.4);
      [0,1,2].forEach(i=>twWindow(k,-2.0+(i-1)*.62,3.4+(i%2)*.8,.74+.06*(1-Math.abs(i-1)),.26,.5,(i-1)*.45,gl));
      twDoor(k,.7,.36,D/2+.02,.9,1.5,0);
      for(let i=0;i<7;i++){const a=Math.PI*i/6;k.p('c',0x4e4a5c,'box',.7+Math.cos(a)*.55,1.86+Math.sin(a)*.5,D/2+.08,.18,.2,.14,0,0,a+Math.PI/2,.08)}
      [-.5,.5].forEach(x=>k.p('c',0x4e4a5c,'box',.7+x*1.1,1.1,D/2+.08,.16,1.5,.14,0,0,0,.08));
      [-1.7,2.4].forEach(x=>twWindow(k,x,1.65,D/2+.04,.5,.9,0,gl));
      k.p('c',0x6a6678,'cyl8',2.5,.38,3.3,.3,.76,.3,0,0,0,.08);k.p('m',0xd8b44a,'box',2.5,.8,3.3,.4,.04,.4,0,0,0,0);
      [-1,1].forEach(s=>k.p('c',0x3a3348,'dod',.7+s*1.4,.15,3.9,.16,.12,.16))}
    twBake(k?k.P:[],key,true).forEach(m=>b.add(m));
    const ring=TQ(b,new THREE.TorusGeometry(1.35,.07,4,12),sm(0xd8b44a,{emissive:0x8a6a00,emissiveIntensity:.8,metalness:.6}),-2.0,4.5,-.4,1,1,1,Math.PI/2);
    const fin=TQ(b,G_OCT,gmat(0xffe08a),-2.0,8.75,-.4,.2,.2,.2);
    sign(b,[{t:'ARCANE SHOP',f:'700 56px'},{t:'✦ spells · scrolls · wonders ✦',f:'600 26px'}],2.6,.5,'#1c1236','#cdb6ff','#9a7aff',.5,2.62,D/2+.17,0,512,150);
    const rune=new THREE.Mesh(new THREE.RingGeometry(.9,1.1,12),new THREE.MeshBasicMaterial({color:0x7a4aff,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide}));rune.rotation.x=-Math.PI/2;rune.position.set(.7,.05,3.9);b.add(rune);
    const rune2=new THREE.Mesh(new THREE.RingGeometry(.35,.55,5),rune.material);rune2.rotation.x=-Math.PI/2;rune2.position.set(.7,.055,3.9);b.add(rune2);
    const cr=TQ(b,G_OCT,gmat(0x9ae0ff),2.5,1.25,3.3,.26,.34,.26);
    const stars=[0,1,2,3].map(i=>TQ(b,G_OCT,gmat(0xffe08a),0,0,0,.14,.14,.14));
    tc(b,2.5,3.3,.36);
    npc(b,.7,2.8,{robe:0x5a3aa0,trim:0xd8b44a,hat:'wiz',hatC:0x2e2078,label:'Magic Vendor',ry:0});
    const px=T.cx+9.5,pz=T.cy-10.5;
    TANIM.push({x:px,z:pz,f:now=>{rune.rotation.z=now/2200;rune2.rotation.z=-now/1500;cr.position.y=1.3+Math.sin(now/600)*.1;cr.rotation.y=now/700;fin.scale.setScalar(.2+.04*Math.sin(now/260));ring.rotation.z=now/1800;
      stars.forEach((s,i)=>{const a=now/1100+i*1.571;s.position.set(-2.0+Math.cos(a)*1.55,5.3+Math.sin(now/700+i)*.3,-.4+Math.sin(a)*1.55);s.rotation.y=now/400})}});
  T.mvCol=T.col.slice(mvc0);
  }
  // ---------- Tavern (west): stone ground floor, jettied timber upper floor ----------
  {const b=new THREE.Group();b.position.set(-9.5,0,-10.5);g.add(b);const W1=5.8,D=4;
    const key='TAVERN';let k=null;
    if(!twHas(key)){k=twKit(71);twHall(k,{w:W1,d:D,h:2.5,stoneWalls:1});
      // upper floor: overhanging joists, log walls
      for(let i=0;i<9;i++){const x=-W1/2+.1+i*(W1-.2)/8;k.L('c',TWC.woodD,[x,2.56,-D/2-.32],[x,2.56,D/2+.32],.08,'box')}
      const U=(W1+.4)/2,V=(D+.5)/2;k.p('c',TWC.woodD,'box',0,2.62,.05,W1+.5,.08,D+.6,0,0,0,.03);
      twLogs(k,TWC.wood,-U+.13,V-.08,U-.13,V-.08,2.66,4.1,.12,.2);twLogs(k,TWC.wood,-U+.13,-V+.18,U-.13,-V+.18,2.66,4.1,.12,.2);
      twLogs(k,TWC.wood,-U+.13,-V+.18,-U+.13,V-.08,2.78,4.1,.12,.2);twLogs(k,TWC.wood,U-.13,-V+.18,U-.13,V-.08,2.78,4.1,.12,.2);
      [-1,1].forEach(s=>[-1,1].forEach(q=>k.L('c',TWC.woodD,[s*(U-.05),2.62,q*(V-.05)+.05],[s*(U-.05),4.2,q*(V-.05)+.05],.14,'log')));
      [-1.4,1.4].forEach(x=>k.L('c',TWC.woodD,[x,2.66,V+.02],[x,4.1,V+.02],.07,'box'));
      twGable(k,TWC.thatch,W1+.4,D+.5,1.8,.4,4.1);
      twStones(k,TWC.stone,1.68,-.9,2.52,-.9,3.0,7.0,.85,.45);k.p('c',TWC.stoneD,'box',2.1,7.05,-.9,1.0,.18,1.0,0,0,0,.05);
      twDoor(k,0,.36,D/2+.02,1.15,1.6,0);
      for(let i=0;i<7;i++){const a=Math.PI*i/6;k.p('c',TWC.stoneL,'box',Math.cos(a)*.72,1.98+Math.sin(a)*.5,D/2+.1,.22,.22,.16,0,0,a+Math.PI/2,.08)}
      [-.72,.72].forEach(x=>k.p('c',TWC.stoneL,'box',x,1.15,D/2+.1,.2,1.6,.16,0,0,0,.08));
      k.p('c',TWC.stoneD,'box',0,.12,D/2+.4,2.0,.24,.6,0,0,0,.08);
      [-2.0,2.0].forEach(x=>twWindow(k,x,1.6,D/2+.04,.72,.7,0,0xffb347));
      [-2.1,2.1].forEach(x=>twWindow(k,x,3.4,V+.06,.6,.6,0,0xffb347));
      [-1,1].forEach(s=>{k.L('m',TWC.iron,[s*1.75,2.95,D/2+.25],[s*1.75,2.95,D/2+.75],.02,'box',0);k.L('m',TWC.iron,[s*1.75,2.95,D/2+.72],[s*1.75,2.78,D/2+.72],.01,'cyl6',0);
        k.p('m',TWC.iron,'cone4',s*1.75,2.74,D/2+.72,.14,.1,.14,0,Math.PI/4,0,0);k.p('g',0xffc870,'box',s*1.75,2.58,D/2+.72,.16,.24,.16)});
      // outdoor table and stools
      k.L('c',0x5a3c24,[-2.4,0,3.4],[-2.4,.66,3.4],.09,'log');k.p('c',0x7a5230,'cyl8',-2.4,.7,3.4,.52,.08,.52,0,0,0,.05);
      [[-.7,0],[.7,0],[0,.7],[0,-.7]].forEach(([a,c])=>k.p('c',0x6a4a2a,'cyl6',-2.4+a,.22,3.4+c,.2,.44,.2,0,a+c,0,.08));
      [[-.15,.05],[.2,-.1]].forEach(([a,c])=>{k.p('c',0x8a6a3a,'cyl6',-2.4+a,.82,3.4+c,.07,.16,.07,0,0,0,0);k.p('c',0xf4ecd0,'cyl6',-2.4+a,.91,3.4+c,.07,.04,.07,0,0,0,0)})}
    twBake(k?k.P:[],key,true).forEach(m=>b.add(m));
    sign(b,[{t:T.tav.toUpperCase(),f:'700 52px'},{t:'🍺 INN & ALE · BEDS FOR WEARY HEROES 🛏️',f:'600 24px'}],2.8,.62,'#2e1f12','#ffd88a','#c9a24a',0,3.35,(D+.5)/2+.13,0,512,150);
    tc(b,-2.4,3.4,.95);
    npc(b,1.45,2.75,{robe:0x6a3a2a,trim:0x2a1a12,hat:'chef',apron:1,label:'Innkeeper',ry:0});
    const px=T.cx-9.5+2.1,pz=T.cy-10.5-.9,sm2=new THREE.MeshBasicMaterial({color:0xcfcac0,transparent:true,opacity:.35,depthWrite:false}),pf=[],pg=new THREE.IcosahedronGeometry(1,0);
    for(let k2=0;k2<7;k2++){const o=new THREE.Mesh(pg,sm2);b.add(o);pf.push([o,k2/7])}
    TANIM.push({x:px,z:pz,f:now=>{pf.forEach(([o,ph])=>{const t=(now/3200+ph)%1;o.position.set(2.1+Math.sin(t*6+ph*9)*.25+t*.6,7.2+t*2.6,-.9+Math.cos(t*5+ph*7)*.2);o.scale.setScalar(Math.sin(Math.PI*t)*.42+.02)})}});
  }
  // ---------- plaza dressing (low props only so the camera never loses the hero) ----------
  bench(g,-6.2,5.2,0);bench(g,6.2,5.2,0);
  planter(g,-11.4,5.6,2.0);planter(g,11.4,5.6,2.0);
  tree(g,-12.2,12.0,1);tree(g,12.2,12.0,1.1);tree(g,-12.4,8.6,.8);
  // cart and hay
  {tc(g,11.4,8.4,1.05);const key='CART';let k=null;
    if(!twHas(key)){k=twKit(81);twPlanks(k,0x7a5230,-.9,.5,.9,.5,.35,.75,.3);twPlanks(k,0x7a5230,-.9,-.5,.9,-.5,.35,.75,.3);k.p('c',0x6a4628,'box',0,.38,0,1.8,.08,1.0,0,0,0,.04);
      [-1,1].forEach(s=>twPlanks(k,0x6a4628,s*.9,-.5,s*.9,.5,.35,.72,.3));k.L('c',TWC.woodD,[0,.4,-.5],[0,.4,.5],.05,'box');
      [-1,1].forEach(s=>[-1,1].forEach(q=>{k.p('c',0x3a2a1a,'cyl8',s*.7,.4,q*.58,.4,.08,.4,Math.PI/2,0,0,.03);k.p('m',TWC.iron,'cyl8',s*.7,.4,q*.62,.08,.06,.08,Math.PI/2,0,0,0)}));
      k.L('c',TWC.woodD,[.9,.42,-.2],[1.9,.2,-.25],.05,'box');k.L('c',TWC.woodD,[.9,.42,.2],[1.9,.2,.25],.05,'box');
      for(let i=0;i<4;i++)k.p('c',0xc8a850,'cyl8',-.6+i*.4,.92,0,.22,.6,.22,0,0,Math.PI/2,.12)}
    const c=twGroup(k,key);c.position.set(11.4,0,8.4);c.rotation.y=-.5;g.add(c)}
  crate(g,-12.3,10.4,.7);crate(g,-11.5,10.9,.55);barrel(g,-11.8,9.6);tc(g,-8,12.2,.5);
  {const key='HAY';let k=null;if(!twHas(key)){k=twKit(83);k.p('c',0xc8a850,'cyl8',0,.45,0,.45,.8,.45,0,0,Math.PI/2,.12);[-.25,.25].forEach(x=>k.p('c',0x6a5a30,'cyl8',x,.45,0,.47,.04,.47,0,0,Math.PI/2,0))}
    const h=twGroup(k,key);h.position.set(-8,0,12.2);g.add(h)}
  lamp(g,T,-12.6,-3.6);lamp(g,T,12.6,-3.6);lamp(g,T,-6.5,9.8);lamp(g,T,6.5,9.8);
  // banners on the walls
  [[0,-TS0+.62,0],[0,TS0-.62,Math.PI],[-TS0+.62,8,Math.PI/2],[TS0-.62,8,-Math.PI/2]].forEach(([x,z,ry])=>{const bn=twBanner(P.ban);bn.position.set(x,2.2,z);bn.rotation.y=ry;g.add(bn)});
  delete g.add;for(let q=_l0;q<TLAMP.length;q++){const L=TLAMP[q];L[0]=T.cx+(L[0]-T.cx)*TK;L[2]=T.cy+(L[2]-T.cy)*TK}
  g.traverse(o=>{if(o.isMesh&&o.parent!==g)o.matrixAutoUpdate=true});
}

// ---------- palisade logs (instanced per wall tile; used by a build patch) ----------
function twPaliLog(){const g=new THREE.CylinderGeometry(.15,.2,1,6,2);const pa=g.attributes.position;
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),h=twH(Math.round(x*100),Math.round(y*100),Math.round(z*100),4);if(Math.abs(y)<.4){pa.setX(i,x*(.9+h*.2));pa.setZ(i,z*(.9+h*.2))}}
  const n=g.toNonIndexed();n.computeVertexNormals();n.userData.lps=1;return n}
function twPaliTip(){const g=new THREE.ConeGeometry(.15,.62,6,1);g.translate(0,.03,0);const pa=g.attributes.position;for(let i=0;i<pa.count;i++)if(pa.getY(i)>.3){pa.setX(i,.03);pa.setZ(i,-.02)}
  const n=g.toNonIndexed();n.computeVertexNormals();n.userData.lps=1;return n}

// ---------- cooking hearth + alchemy table (same spots and colliders as before) ----------
function rwStations(){
  TPRT.forEach((p,ti)=>{const T=TOWNS[ti],g0=p.g,x=g0.position.x,z=g0.position.z,ry=g0.rotation.y;if(g0.parent)g0.parent.remove(g0);T.rp=null;
    const g=new THREE.Group(),y=GH(x,z);g.position.set(x,y,z);g.rotation.y=ry;scene.add(g);
    let k=null;if(!twHas('STC')){k=twKit(91);
      // hearth: ring of rough stones, logs, fire, iron tripod and pot
      for(let i=0;i<10;i++){const a=i/10*Math.PI*2;k.p('c',i%3?TWC.stone:TWC.stoneD,'dod',-1.25+Math.cos(a)*.6,.18,Math.sin(a)*.6,.17,.16,.17,i,i,0,.2)}
      k.p('c',0x1e1a18,'cyl8',-1.25,.05,0,.55,.1,.55,0,0,0,0);
      [[.4,.2],[-.3,.5],[.1,-.6]].forEach(q=>k.L('c',0x3a2616,[-1.25-q[0]*.5,.18,-q[1]*.5],[-1.25+q[0]*.5,.26,q[1]*.5],.07,'log'));
      k.p('g',0xff7a20,'cone4',-1.25,.55,0,.26,.55,.26,0,.3,0).p('g',0xffc040,'cone4',-1.25,.48,0,.15,.38,.15,0,1.1,0);
      [0,1,2].forEach(i=>{const a=i/3*Math.PI*2;k.L('m',TWC.iron,[-1.25+Math.cos(a)*.55,0,Math.sin(a)*.55],[-1.25,1.45,0],.03,'cyl6',0)});
      k.L('m',TWC.iron,[-1.25,1.45,0],[-1.25,1.08,0],.012,'cyl6',0);k.p('m',0x26262a,'sph',-1.25,.88,0,.32,.26,.32,0,0,0,0).p('m',0x3a3a40,'cyl8',-1.25,1.08,0,.3,.04,.3,0,0,0,0).p('c',0x3a5a2a,'cyl8',-1.25,1.11,0,.26,.02,.26,0,0,0,0)}
    const G1=twGroup(k,'STC');k=null;
    if(!twHas('STA')){k=twKit(93);
      // alchemy table: split-log top on trestles, bottles, a book and a candle
      k.p('c',0x5a3c24,'box',1.25,.82,0,1.5,.09,.75,0,0,0,.05);[-.35,0,.35].forEach(z=>k.p('c',0x4a3020,'box',1.25,.875,z,1.52,.02,.2,0,0,0,.02));
      [-1,1].forEach(s=>{k.L('c',TWC.woodD,[1.25+s*.62,0,-.3],[1.25+s*.62,.8,.0],.05,'box');k.L('c',TWC.woodD,[1.25+s*.62,0,.3],[1.25+s*.62,.8,.0],.05,'box')});
      k.L('c',TWC.woodD,[.63,.3,0],[1.87,.3,0],.04,'box');
      [[.55,.2,0x7aff6a],[.35,-.15,0xb070ff],[.8,-.1,0xff5a3a],[.15,.18,0x5ad8ff]].forEach((q,i)=>{k.p('g',q[2],'oct',1.25+q[0]-.5,.98+i%2*.05,q[1],.07,.13+i%2*.05,.07);k.p('c',0x2a2016,'cyl6',1.25+q[0]-.5,1.12+i%2*.1,q[1],.025,.06,.025,0,0,0,0)});
      k.p('c',0x4a1a1a,'box',.6,.92,.05,.32,.1,.24,0,.3,0,.03).p('c',0xc8bc98,'box',.6,.98,.05,.3,.02,.22,0,.3,0,0).p('c',0x6a6458,'cyl8',1.75,.92,.15,.12,.1,.12,0,0,0,.03).p('c',0xe8dcc0,'cyl6',1.85,.97,-.2,.03,.12,.03,0,0,0,0).p('g',0xffd070,'oct',1.85,1.06,-.2,.025,.04,.025)}
    const G2=twGroup(k,'STA');g.add(G1,G2);T.stG={c:G1,a:G2};
    sign(G1,[{t:'🍳 Hearth',f:'700 40px'}],1.1,.34,'#3a2414','#ffe6c0',null,-1.25,2.05,.0,0);sign(G2,[{t:'⚗️ Alchemy',f:'700 40px'}],1.1,.34,'#2a1a3a','#efe6ff',null,1.25,1.75,-.3,0);
    const c=Math.cos(ry),s=Math.sin(ry),wp=lx=>[x+lx*c,z-lx*s];T.st2={c:wp(-1.25),a:wp(1.25)};RW_ST.push(T.st2);
    T.col.push({x:T.st2.c[0],z:T.st2.c[1],r:.7},{x:T.st2.a[0],z:T.st2.a[1],r:.8});
  });TPRT.length=0;
}

// ---------- the Stable: an open timber lean-to ----------
function stableBuild(){const T=TOWNS[0];if(!T||STB.g)return;const P=T.pal||{wood:0x4a3020,roof:0x3a2a3a},x=T.cx+STB.x,z=T.cy+STB.z,b=new THREE.Group(),prev=T_cur,c0=T.col.length;if(!P.wood)P.wood=0x4a3020;if(!P.roof)P.roof=0x3a2a3a;
  b.position.set(x,GH(x,z),z);b.rotation.y=Math.PI;
  let k=null;if(!twHas('STABLE')){k=twKit(101);
    k.p('c',0xb89a50,'box',0,.03,0,3.5,.06,1.9,0,0,0,.02);for(let i=0;i<14;i++)k.p('c',0xc8a850,'box',-1.6+k.R()*3.2,.07,-.8+k.R()*1.6,.3,.02,.06,0,k.R()*3,0,0);
    [-1,1].forEach(s=>[-1,1].forEach(q=>k.L('c',TWC.woodD,[s*1.7,0,q*.9],[s*1.7,q>0?2.42:2.05,q*.9],.1,'log')));
    twPlanks(k,TWC.wood,-1.72,.93,1.72,.93,0,2.0,.26);[-1,1].forEach(s=>twPlanks(k,TWC.wood,s*1.74,-.85,s*1.74,.85,0,1.24,.26));
    k.L('c',TWC.woodD,[-1.9,2.28,-.95],[1.9,2.28,-.95],.07,'box');k.L('c',TWC.woodD,[-1.9,2.46,.92],[1.9,2.46,.92],.08,'box');
    for(let i=0;i<9;i++){const xx=-1.9+i*3.8/8;k.L('c',TWC.woodD,[xx,2.5,1.05],[xx,2.2,-1.15],.035,'box')}
    for(let i=0;i<5;i++){const t=i/5;k.p('c',k.R()<.4?dkShade(TWC.thatch,.85):TWC.thatch,'box',(k.R()-.5)*.06,2.6-t*.42+.04,1.1-t*2.5-.25,4.15,.1,.58,-.17+(k.R()-.5)*.04,0,0,.12)}
    k.p('c',0xc8a850,'cyl8',1.2,.3,.5,.32,.62,.32,0,0,Math.PI/2,.12);k.p('c',0xc8a850,'cyl8',1.15,.82,.55,.3,.6,.3,0,0,Math.PI/2,.12);
    twPlanks(k,0x5a3c22,-1.55,.72,-.65,.72,0,.4,.15);k.p('c',0x5a3c22,'box',-1.1,.2,.38,.92,.4,.06,0,0,0,.03);k.p('c',0x3a6a90,'box',-1.1,.4,.55,.8,.03,.26,0,0,0,0);
    k.L('m',TWC.iron,[-.3,1.5,.9],[-.3,1.5,.82],.03,'cyl6',0);k.p('m',TWC.iron,'cyl8',-.3,1.5,.78,.12,.03,.12,Math.PI/2,0,0,0)}
  twBake(k?k.P:[],'STABLE',true).forEach(m=>b.add(m));
  sign(b,[{t:'STABLE',f:'700 56px'},{t:'mounts for sale',f:'600 24px'}],2.2,.52,'#2e1f12','#ffd88a','#c9a24a',0,2.62,-1.04,Math.PI,512,140);
  T.col.push({x,z,hx:1.85,hz:1.05});
  const dm=mountModel('pony');dm.scale.setScalar(.8);dm.position.set(.1,.06,.1);dm.rotation.y=Math.PI/2;b.add(dm);
  scene.add(b);STB.g=b;
  const nx=x,nz=z+1.9,ng=new THREE.Group(),nc=[];T_cur={col:nc,cx:0,cy:0};
  try{npc(ng,nx,nz,{robe:0x5a4a2a,trim:0x2a1a10,hat:'cap',hatC:0x6a4a1a,label:'Stable Master',ry:0})}finally{T_cur=prev}
  ng.position.y=GH(nx,nz);scene.add(ng);STB.npc=ng;nc.forEach(q=>T.col.push(q));
  STB.col=T.col.slice(c0);STB.n=[nx,nz];
  TANIM.push({x,z,f:now=>{if(STB.g&&STB.g.visible&&dm.r.rig)dm.r.rig(now,false,0)}});
}

// ---------- construction sites: sign, lumber stack, stones, a half-raised frame ----------
function shSite(x,z,label){const g=new THREE.Group();g.position.set(x,GH(x,z),z);const T=TOWNS[0];g.rotation.y=Math.atan2(T.sp[0]-x,T.sp[1]-z);
  let k=null;if(!twHas('SITE')){k=twKit(111);
    k.L('c',TWC.woodD,[0,0,0],[0,1.62,0],.06,'log');k.p('c',0x5a3d20,'box',0,1.35,.04,1.15,.5,.05,0,0,0,.04);
    for(let i=0;i<5;i++)k.L('c',[TWC.wood,TWC.woodL,TWC.wood][i%3],[-1.55,.1+(i>2?.17:0),-.6+(i%3)*.17+(i>2?.08:0)],[-.45,.1+(i>2?.17:0),-.6+(i%3)*.17+(i>2?.08:0)],.085,'log');
    [[1.0,.12,-.4,.2],[1.3,.1,-.1,.16],[1.15,.28,-.25,.15],[.85,.09,-.05,.13]].forEach(q=>k.p('c',TWC.stone,'dod',q[0],q[1],q[2],q[3],q[3]*.8,q[3],q[0],q[1],0,.2));
    [-1,1].forEach(s=>k.L('c',TWC.woodL,[s*.9,0,-1.0],[s*.9,1.5,-1.0],.06,'box'));k.L('c',TWC.woodL,[-1.0,1.45,-1.0],[1.0,1.45,-1.0],.05,'box');k.L('c',TWC.woodL,[-.9,.1,-1.0],[.9,1.4,-1.0],.04,'box');
    k.L('m',TWC.iron,[.25,0,-.3],[.42,.55,-.25],.02,'cyl6',0);k.p('m',TWC.iron,'box',.44,.58,-.25,.16,.07,.05,0,0,.3,0)}
  twBake(k?k.P:[],'SITE',true).forEach(m=>g.add(m));
  sign(g,[{t:label,f:'700 30px'},{t:'🔨 build at the Steward',f:'600 20px'}],1.05,.44,'#2a1c10','#ffe6c0',null,0,1.35,.075,0);scene.add(g);return g}

// ---------- the Steward's desk and the stronghold upgrade banners ----------
function shBuild(){const T=TOWNS[0];if(!T)return;
  if(!SHM.st){const x=T.cx-14,z=T.cy+7,g=new THREE.Group(),prev=T_cur;T_cur={col:[],cx:0,cy:0};
    npc(g,x,z,{robe:0x2a3550,trim:0xd8b44a,hat:'cap',hatC:0x1a2236,label:'Stronghold Steward',ry:Math.atan2(T.cx-x,T.cy-z)});T_cur=prev;
    let k=null;if(!twHas('DESK')){k=twKit(121);k.p('c',0x4a3020,'box',0,.86,0,.92,.08,.62,0,0,0,.04);[-1,1].forEach(s=>[-1,1].forEach(q=>k.L('c',TWC.woodD,[s*.4,0,q*.25],[s*.4,.84,q*.25],.04,'box')));
      k.p('c',0xe8dcc0,'box',0,.92,0,.6,.02,.4,0,.1,0,0).p('c',0x2a2a30,'cyl6',.3,.95,.15,.04,.08,.04,0,0,0,0).p('c',0xe8e0d0,'box',.32,1.02,.15,.01,.12,.04,0,0,.4,0);
      k.p('c',0x5a3c24,'box',-.25,.95,-.12,.24,.1,.2,0,0,0,.03)}
    const tb=twGroup(k,'DESK');tb.position.set(x+1.1,0,z+.2);g.add(tb);
    g.position.y=GH(x,z);scene.add(g);SHM.st={g,x,z}}
  const sp=SHU.map((u,i)=>{const an=i/SHU.length*6.283+Math.PI/6;return [T.cx+Math.cos(an)*6.6,T.cy+Math.sin(an)*6.6]});
  SHU.forEach((u,i)=>{const l=shL(u.k),o=SHM.pil[u.k];if(o&&o.l===l)return;if(o)scene.remove(o.g);if(!l){delete SHM.pil[u.k];return}
    const [x,z]=sp[i],g=new THREE.Group();g.position.set(x,GH(x,z),z);
    const key='SHP|'+u.col;let k=null;if(!twHas(key)){k=twKit(131);
      [[0,0,.42,.2],[.3,.3,.22,.16],[-.32,-.25,.24,.15],[.28,-.3,.2,.13],[-.3,.3,.2,.14]].forEach(q=>k.p('c',k.R()<.4?TWC.stoneD:TWC.stone,'dod',q[0],q[3]*.6,q[1],q[2],q[3],q[2],q[0],q[1],0,.2));k.L('c',TWC.woodD,[0,.1,0],[0,3.05,0],.075,'log');k.L('c',TWC.woodD,[-.52,2.95,0],[.52,2.95,0],.05,'box');
      k.p('c',u.col,'box',0,2.2,.07,.85,1.4,.03,0,0,0,.05);[-1,1].forEach(s=>k.p('c',u.col,'tri',s*.2125,1.38,.07,.425,.24,.03,0,0,Math.PI,.04));
      k.p('c',TWC.gold,'box',0,2.86,.09,.86,.06,.02,0,0,0,0);[-1,1].forEach(s=>k.p('m',TWC.iron,'oct',s*.52,2.95,0,.06))}
    twBake(k?k.P:[],key,true).forEach(m=>{if(m.material===twMat().c)m.castShadow=true;g.add(m)});
    for(let q=0;q<l;q++){const r=new THREE.Mesh(new THREE.TorusGeometry(.18,.035,4,10),new THREE.MeshBasicMaterial({color:0xffd870}));r.position.set(0,2.62-q*.46,.11);g.add(r)}
    const lb=document.createElement('canvas');lb.width=128;lb.height=128;const c2=lb.getContext('2d');c2.font='80px serif';c2.textAlign='center';c2.textBaseline='middle';c2.fillText(u.i,64,70);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(lb),transparent:true,depthWrite:false}));s.scale.set(.7,.7,1);s.position.set(0,3.4,0);g.add(s);
    scene.add(g);SHM.pil[u.k]={g,l}})}

// ---------- visitor shop stalls (called from a build patch) ----------
function twStall(st,col){let k=null;const key='STALL|'+col;
  if(!twHas(key)){k=twKit(141);twPlanks(k,0x4a3020,-.8,.25,.8,.25,0,1.0,.22);k.p('c',0x4a3020,'box',0,.5,0,1.6,1,.42,0,0,0,.04);
    k.p('c',0x6a4a2e,'box',0,1.03,0,1.72,.07,.62,0,0,0,.04);
    [-.8,.8].forEach(x=>{k.L('c',TWC.woodD,[x,0,-.9],[x,2.62,-.9],.05,'log');k.L('c',TWC.woodD,[x,0,.28],[x,2.1,.28],.045,'log')});
    for(let i=0;i<5;i++)k.p('c',i%2?col:dkShade(col,.7),'box',-.8+(i+.5)*1.6/5,2.55-.0,-.55,1.6/5+.01,.05,1.15,.36,0,0,.04);
    [[-.5,0x8a6a3a],[-.15,0x6a4a9a],[.25,0xb08a3a],[.55,0x3a6a5a]].forEach(([x,c])=>k.p('c',c,'box',x,1.15,.05,.18,.16,.18,0,x*3,0,.08));
    [-1,1].forEach(s=>k.p('c',0x9a8a6a,'cyl8',s*.55,.18,.55,.2,.36,.2,0,0,0,.08))}
  twBake(k?k.P:[],key,true).forEach(m=>st.add(m))}

// ================= runtime pieces (the world exists by now) =================
// Portal Court: flagstones, a stone curb, and rough stone portal frames
{const C=PCOURT;
  try{
    const old=scene.children.find(o=>o.isMesh&&o.geometry&&o.geometry.type=='RingGeometry'&&o.geometry.parameters&&Math.abs(o.geometry.parameters.outerRadius-17.5)<.01);
    if(old)old.material.color.setHex(0x34313a);
    const y0=GH(C[0],C[1]);let k=twKit(151);
    for(let ring=0;ring<7;ring++){const r0=3.2+ring*2.0,n=Math.round(r0*2.2);for(let i=0;i<n;i++){const a=(i+(ring%2)*.5)/n*Math.PI*2,r=r0+.95;
      k.p('c',k.R()<.25?0x4e4a54:k.R()<.3?0x6e6a72:0x5c5862,'box',Math.cos(a)*r,.05,Math.sin(a)*r,1.8,.1+k.R()*.04,r*Math.PI*2/n*.94,0,-a,0,.12)}}
    for(let i=0;i<44;i++){const a=i/44*Math.PI*2;k.p('c',k.R()<.3?TWC.stoneD:TWC.stone,'box',Math.cos(a)*17.65,.2,Math.sin(a)*17.65,.55,.4,2.55,0,-a,0,.18)}
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('c',TWC.stoneD,'box',Math.cos(a)*1.75,.08,Math.sin(a)*1.75,.6,.16,1.4,0,-a,0,.1)}
    const fl=twGroup(k,'COURT');fl.position.set(C[0],y0,C[1]);fl.children.forEach(m=>m.castShadow=false);scene.add(fl);
    // the rune stone on the plinth
    const rs=scene.children.find(o=>o.isGroup&&Math.abs(o.position.x-C[0])<.01&&Math.abs(o.position.z-C[1])<.01&&o.children.length==2);
    if(rs){const cyl=rs.children.find(m=>m.geometry===G_CYL);if(cyl){rs.remove(cyl);let k2=null;if(!twHas('RUNEP')){k2=twKit(153);twStoneRing(k2,TWC.stoneD,0,0,1.45,0,.62,.36);
        for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k2.p('c',0x3a3640,'box',Math.cos(a)*1.0,.7,Math.sin(a)*1.0,.5,.16,.9,0,-a,0,.1)}}
      twBake(k2?k2.P:[],'RUNEP',true).forEach(m=>rs.add(m))}}
    // portal frames: two stacked-stone pillars, a heavy lintel, a stepped base
    const frame=(w,h,key)=>{let k3=null;if(!twHas(key)){k3=twKit(155+w*10);
        [-1,1].forEach(s=>{for(let y=0,i=0;y<h;i++){const bh=.36+k3.R()*.12;k3.p('c',k3.R()<.3?TWC.stoneD:0x6a6672,'box',s*w/2+(k3.R()-.5)*.05,y+bh/2,0,.5+(i%2)*.08,bh-.03,.5+((i+1)%2)*.08,0,(k3.R()-.5)*.2,0,.16);y+=bh}});
        twStones(k3,0x4a4652,-w/2-.4,0,w/2+.4,0,h,h+.42,.62,.7);k3.p('c',0x3a3640,'tri',0,h+.42,0,1.2,.32,.5,0,0,0,.08);
        k3.p('c',0x5a5662,'box',0,.1,0,w+.9,.2,1.4,0,0,0,.08);k3.p('c',0x4a4652,'box',0,.25,0,w+.4,.12,1.0,0,0,0,.06)}
      return twGroup(k3,key)};
    PORT.forEach(P=>{const keep=new Set([P.disc,P.sw,P.ch]);P.g.children.slice().forEach(c=>{if(keep.has(c)||c.geometry===G_PLN||(c.material&&c.material.isMeshBasicMaterial))return;if(c.isMesh)P.g.remove(c)});
      const f=frame(2.5,3.15,'PFRM');P.g.add(f);P.g.children.forEach(c=>{if(c.geometry===G_OCT)c.position.y=3.4})});
    RPORT.forEach(R=>{R.g.children.slice().forEach(c=>{if(c===R.disc||c.geometry===G_PLN||(c.material&&c.material.isMeshBasicMaterial))return;if(c.isMesh)R.g.remove(c)});R.g.add(frame(1.8,2.35,'RFRM'))});
  }catch(e){console.warn('town court',e)}}
// paving: irregular flagstones over the town's paved tiles, and lashing rails along the palisade
{try{const T=TOWNS[0],R=dkRng(77),L=[],Wl=[];
    for(let y=T.cy-34;y<=T.cy+34;y++)for(let x=T.cx-34;x<=T.cx+40;x++){const t=MAP[y]&&MAP[y][x];if(t=='P')L.push([x,y]);else if(t=='W')Wl.push([x,y])}
    if(L.length){const sg=(()=>{const g=new THREE.CircleGeometry(.5,6);g.rotateX(-Math.PI/2);const pa=g.attributes.position;for(let i=1;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),h=twH(Math.round(x*50),0,Math.round(z*50),5);pa.setX(i,x*(.86+h*.26));pa.setZ(i,z*(.86+h*.26))}
        const n=g.toNonIndexed();n.computeVertexNormals();n.userData.lps=1;return n})();
      const N=L.length*2,m=new THREE.InstancedMesh(sg,new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),N),d=new THREE.Object3D(),c=new THREE.Color();m.material.userData.lps=1;
      let i=0;L.forEach(([x,y])=>{const two=R()<.4;for(let j=0;j<(two?2:1);j++){const ox=two?(j?.24:-.24):(R()-.5)*.12,oz=(R()-.5)*(two?.4:.12);d.position.set(x+ox,GH(x+ox,y+oz)+.025+j*.004,y+oz);d.rotation.set((R()-.5)*.05,R()*6.28,(R()-.5)*.05);
        const s=two?.55+R()*.18:.86+R()*.3;d.scale.set(s,1,s*(.8+R()*.3));d.updateMatrix();m.setMatrixAt(i,d.matrix);
        const v=.62+R()*.32,w=R();c.setRGB(.44*v*(1+w*.08),.42*v,.41*v*(1.06-w*.08));m.setColorAt(i,c);i++}});
      m.count=i;m.receiveShadow=true;m.castShadow=false;m.userData.lpsSkip=1;T.g.parent.add(m);T.pave=m}
    if(Wl.length){const set=new Set(Wl.map(([x,y])=>y*W+x)),bars=[];
      Wl.forEach(([x,y])=>{[[1,0],[0,1]].forEach(([dx,dy])=>{if(!set.has((y+dy)*W+x+dx))return;const mx=x+dx/2,my=y+dy/2,vx=T.cx-mx,vy=T.cy-my,l=Math.hypot(vx,vy)||1;
        [1.0,2.05].forEach(h=>bars.push([mx+vx/l*.42,h+GH(mx,my),my+vy/l*.42,dx?0:Math.PI/2]))})});
      const bg=twGeo().box,m=new THREE.InstancedMesh(bg,new THREE.MeshStandardMaterial({color:0x3a2a1e,roughness:.95,flatShading:true}),bars.length),d=new THREE.Object3D();m.material.userData.lps=1;
      bars.forEach((q,i)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(0,q[3],(R()-.5)*.06);d.scale.set(1.08,.12,.1);d.updateMatrix();m.setMatrixAt(i,d.matrix)});
      m.castShadow=true;m.receiveShadow=true;m.userData.lpsSkip=1;scene.add(m)}
  }catch(e){console.warn('town paving',e)}}
