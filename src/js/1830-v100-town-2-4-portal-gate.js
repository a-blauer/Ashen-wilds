// ================= v100 town (2/4): one portal gate per zone, each on its own island dressed in the zone's theme =================
// The six PORT portals (zz_portal.js) keep their disc / swirl / chains and their prompts; they move from the old Portal
// Court to TWN100_PG[i] (w0_world.js) and get a themed frame, a dais, a signpost and scenery taken from the zone's own
// decoration kinds (WD.T, zzN_world.js), merged per island into one lit mesh + one glowing mesh (+ mist for two zones).
// The old court floor, rune stone and their colliders are removed; PCOURT is now a crossroads with a fingerpost.
// Locked portals: chains across a grey disc (portalRefresh), plus the island's lanterns/braziers stay dark (TWN100_P[i].glow).
var TWN100_P=[];
// themed frame kits (local: portal disc centred at y=1.62, x=0, facing +z; opening |x|<1.1)
function TWN100_frameK(k,i){const R=k.R,S=(c,f)=>dkShade(c,f);
  // dais: a ring of flagstones (colour per theme) and two steps at the front
  const dc=[0x4e5a44,0x8a8a7a,0xb8c4d0,0xc8956a,0x4a4a52,0x3a3034][i];
  for(let ring=0;ring<2;ring++){const r0=1.0+ring*1.15,n=Math.round(r0*5.5);for(let j=0;j<n;j++){const a=(j+(ring%2)*.5)/n*6.283;
    k.as('stone',()=>k.p('c',R()<.3?S(dc,.85):R()<.3?S(dc,1.12):dc,'box',Math.cos(a)*(r0+.5),.06,Math.sin(a)*(r0+.5),1.05,.14+R()*.04,r0*6.283/n*.92,0,-a,0,.1))}}
  k.as('ashlar',()=>{k.p('c',S(dc,.9),'box',0,.1,2.75,2.6,.2,.5,0,0,0,.04);k.p('c',dc,'box',0,.05,3.15,3.2,.1,.4,0,0,0,.04)});
  if(i==0){// Kindlelight: two twisted root-trunks that meet in a gnarled arch, moss, hanging lanterns
    [-1,1].forEach(s=>{let p=[s*1.35,-.2,0];for(let j=0;j<6;j++){const q=[s*(1.3+Math.sin(j*1.3)*.14),.6+j*.55,Math.cos(j*1.7)*.12];k.as('bark',()=>k.L('c',0x3e3428,p,q,.24-j*.018,'log'));p=q}
      [0,1.6,3.1,4.4].forEach((a,j)=>k.as('bark',()=>k.L('c',0x3a3026,[s*1.35,.3,0],[s*1.35+Math.cos(a)*1.1,-.1,Math.sin(a)*.9],.12,'log')));
      [[.15,.9],[-.1,1.9],[.12,2.7]].forEach(([dz,y])=>k.p('c',0x4a7a34,'ico',s*1.34,y,dz+.2,.22,.14,.18,0,0,0,.1))});
    const n=8;for(let j=0;j<n;j++){const a0=Math.PI*j/n,a1=Math.PI*(j+1)/n;k.as('bark',()=>k.L('c',0x3e3428,[Math.cos(a0)*1.3,3.35+Math.sin(a0)*.75,0],[Math.cos(a1)*1.3,3.35+Math.sin(a1)*.75,0],.17,'log'))}
    for(let j=0;j<6;j++){const x=-1.0+j*.4;k.p('c',0x5a7a34,'cone4',x,3.7+Math.sin(j)*.1-.25,.12,.06,.5+R()*.3,.06,Math.PI,0,0,.03)}
    [-1,1].forEach(s=>{k.L('m',TWC.iron,[s*.75,3.85,.15],[s*.75,3.35,.15],.012,'cyl6',0);k.p('m',TWC.iron,'cone4',s*.75,3.3,.15,.13,.1,.13,0,Math.PI/4,0,0);k.p('g',0xc8ff6a,'box',s*.75,3.12,.15,.12,.2,.12)})}
  else if(i==1){// Hillside Crest: a trilithon of weathered standing stones with a carved serpent on the lintel
    [-1,1].forEach(s=>{k.as('stone',()=>{k.p('c',0x8a8a80,'box',s*1.55,1.75,0,.72,3.6,.62,0,s*.06,s*.03,.16);k.p('c',0x6a8a4a,'ico',s*1.55,.25,.3,.4,.2,.25,0,0,0,.1)})});
    k.as('stone',()=>k.p('c',0x9a9488,'box',0,3.75,0,4.2,.66,.7,0,0,.02,.14));
    for(let j=0;j<12;j++){const x=-1.7+j*.31,y=3.75+Math.sin(j*.9)*.18;k.p('c',j==11?0x3a7a4a:0x3a8a5a,'ico',x,y,.38,.15,.12,.08,0,0,0,.02)}
    k.p('c',0x3a8a5a,'cone4',1.95,3.78,.38,.14,.3,.08,0,0,-Math.PI/2,0);[-1,1].forEach(s=>k.p('g',0xffd060,'oct',1.88,3.82,.4+s*.03,.03,.03,.02));
    [[-1.9,.15],[1.9,.2],[-2.3,-.6],[2.2,.8]].forEach(([x,z],j)=>{for(let q=0;q<4;q++)k.p('c',[0xf0e060,0xe86a9a,0xffffff,0x9a7aff][(j+q)%4],'oct',x+Math.cos(q*1.7)*.2,.22,z+Math.sin(q*1.7)*.2,.06,.05,.06)})}
  else if(i==2){// Burningeye Summit: pillars of blue ice crystals capped with snow, an ice lintel hung with icicles
    [-1,1].forEach(s=>{for(let j=0;j<5;j++){const y=.4+j*.68;k.p('c',[0x9ad0f0,0xbfe4ff,0x7ab8e0][j%3],'oct',s*1.4+(R()-.5)*.1,y,0,.34,.5,.34,0,R(),(R()-.5)*.2,.06)}
      k.p('g',0xbfe8ff,'oct',s*1.4,3.55,0,.22,.55,.22,0,0,s*.15);k.p('c',0xf4f8ff,'sph',s*1.4,3.2,0,.4,.16,.36,0,0,0,.08);
      [0,1,2].forEach(j=>k.p('g',0x9ad8ff,'oct',s*(1.9+j*.2),.3,(j-1)*.45,.12,.45-j*.08,.12,(j-1)*.3,0,s*.3))});
    k.p('c',0xd8ecff,'box',0,3.35,0,3.6,.42,.66,0,0,0,.1);k.p('c',0xf4f8ff,'box',0,3.6,0,3.7,.16,.72,0,0,0,.08);
    for(let j=0;j<9;j++)k.p('c',0xc8e8ff,'cone4',-1.5+j*.375,3.0,(j%2?.2:-.15),.06,.35+R()*.3,.06,Math.PI,0,0,.02)}
  else if(i==3){// Searing Sands: a sandstone gateway, banded lintel, a brass sun disc, wind-worn blocks
    [-1,1].forEach(s=>{let y=0;for(let j=0;j<5;j++){const bh=.62+R()*.1;k.as('ashlar',()=>k.p('c',j%2?0xc8956a:0xd8a878,'box',s*1.55+(R()-.5)*.06,y+bh/2,0,.85-j*.03,bh-.03,.8-j*.03,0,(R()-.5)*.1,0,.12));y+=bh}
      k.as('ashlar',()=>k.p('c',0xb88458,'box',s*1.55,.12,0,1.1,.24,1.05,0,0,0,.06))});
    k.as('ashlar',()=>{k.p('c',0xd0a070,'box',0,3.55,0,4.3,.6,.9,0,0,0,.1);k.p('c',0x9a6a44,'box',0,3.55,.47,4.0,.16,.04,0,0,0,0);k.p('c',0xe0b884,'box',0,3.95,0,3.6,.2,.75,0,0,0,.08)});
    k.as('brass',()=>{k.p('m',0xd8a840,'cyl8',0,4.45,.05,.42,.08,.42,Math.PI/2,0,0,0);for(let j=0;j<8;j++){const a=j/8*6.283;k.p('m',0xd8a840,'cone4',Math.cos(a)*.55,4.45+Math.sin(a)*.55,.05,.06,.22,.04,0,0,a-Math.PI/2,0)}});
    [[-2.2,.6],[2.4,-.4]].forEach(([x,z])=>k.as('ashlar',()=>k.p('c',0xc8956a,'box',x,.18,z,.6,.36,.5,0,R(),.2,.1)))}
  else if(i==4){// The Dirge: a gothic grave-arch of dark stone, iron spikes, a skull keystone and ghost lanterns
    [-1,1].forEach(s=>{twStones(k,0x4e4c56,s*1.5-.35,0,s*1.5+.35,0,0,3.0,.62,.36);k.as('stone',()=>k.p('c',0x5a5862,'box',s*1.5,3.08,0,.82,.16,.74,0,0,0,.04));
      k.p('c',0x4e4c56,'cone4',s*1.5,3.5,0,.34,.7,.34,0,Math.PI/4,0,.04)});
    const n=9;for(let j=0;j<n;j++){const t=(j+.5)/n,a=Math.PI*t,x=-Math.cos(a)*1.25,y=3.0+Math.sin(a)*(.95+.35*(1-Math.abs(t-.5)*2));k.as('stone',()=>k.p('c',j%2?0x5a5862:0x4a4852,'box',x,y,0,.42,.38,.62,0,0,-(a-Math.PI/2)*.9,.06))}
    k.p('c',0xd8d0b8,'ico',0,4.25,.32,.18,.15,.14,0,0,0,.03);[-1,1].forEach(s=>k.p('c',0x141018,'box',s*.06,4.27,.45,.04,.04,.02));
    for(let j=0;j<7;j++)k.p('m',0x2a2a30,'cone4',-1.1+j*.367,4.0+Math.sin(j/6*Math.PI)*.5,-.2,.03,.25,.03,0,0,0,0);
    [-1,1].forEach(s=>{k.L('m',0x2a2a30,[s*2.05,0,.4],[s*2.05,2.1,.4],.04,'cyl6',0);k.L('m',0x2a2a30,[s*2.05,2.1,.4],[s*1.8,2.1,.4],.02,'box',0);k.p('m',0x2a2a30,'cone4',s*1.8,2.02,.4,.12,.1,.12,0,Math.PI/4,0,0);k.p('g',0x8affd0,'box',s*1.8,1.86,.4,.12,.2,.12)})}
  else{// The Citadel: black-and-crimson castle arch, gargoyle blocks, banners, braziers
    [-1,1].forEach(s=>{twStones(k,0x3a3238,s*1.55-.42,0,s*1.55+.42,0,0,3.4,.8,.42);k.as('ashlar',()=>k.p('c',0x4a3e44,'box',s*1.55,3.48,0,.98,.18,.9,0,0,0,.04));
      k.p('c',0x2a2228,'box',s*1.55,3.8,.1,.4,.42,.6,0,0,0,.06);[-1,1].forEach(q=>k.p('c',0x2a2228,'cone4',s*1.55+q*.16,3.7,.4,.05,.26,.12,-.5,0,q*.4,0));
      kdBanner(k,s*1.55,3.25,.44,0,0x7a0c18,.62,2.0);kdBrazier(k,s*2.45,1.0,0,.9)});
    const n=9;for(let j=0;j<n;j++){const t=(j+.5)/n,a=Math.PI*t,x=-Math.cos(a)*1.15,y=3.3+Math.sin(a)*1.0;k.as('stone',()=>k.p('c',j%2?0x3a3238:0x4a3e44,'box',x,y,0,.46,.4,.72,0,0,-(a-Math.PI/2),.05))}
    k.as('brass',()=>k.p('m',TWC.gold,'oct',0,4.42,.32,.16,.22,.04))}}
// scenery for each island: [WD kind, count, min radius, max radius, solid]
var TWN100_DECO=[
 [['k_tree',3,5.6,7.6,1],['k_roots',2,4.8,6.6,0],['k_fern',9,3.4,7.8,0],['k_glow',6,3.2,7.2,0],['k_lamp',3,4.2,5.4,1],['k_stump',2,4.5,7,0],['k_stone',4,3.8,7.6,0],['k_reeds',4,5.5,7.8,0]],
 [['h_stone',7,6.2,6.6,1],['h_flowers',8,3.4,7.6,0],['h_flowers2',6,3.4,7.6,0],['h_grass',8,4,7.8,0],['h_shrine',1,5.6,6.4,1],['h_cairn',2,4.6,7.2,0],['h_totem',2,4.4,5.2,1],['h_bush',3,6,7.8,0]],
 [['b_pine',5,5.6,7.8,1],['b_crystal',4,3.8,7,1],['b_rock',2,6,7.6,1],['b_drift',6,3.6,7.8,0],['b_ice',6,3.4,7.6,0],['b_cairn',2,4.4,5.4,0],['b_tree',1,6,7.4,1],['b_bones',2,4,6.5,0]],
 [['s_pillar',3,5.6,7.4,1],['s_wall',2,6.2,7.4,1],['s_rib',1,5.8,6.8,1],['s_skull',3,3.6,7,0],['s_ripple',5,3.6,7.6,0],['s_cactus',3,5,7.6,1],['s_shrub',4,4,7.8,0],['s_barrel',3,4,7.4,0]],
 [['d_graves',3,5,7.4,1],['d_cross',5,3.8,7.6,0],['d_fence',4,6.8,7.2,0],['d_tree',2,6,7.6,1],['d_angel',1,5.4,6.2,1],['d_candles',4,3.4,6.4,0],['d_lamp',2,4.4,5.2,1],['d_skulls',2,3.8,7,0]],
 [['c_wall',3,6.2,7.6,1],['c_statue',2,5.4,6.4,1],['c_gargoyle',2,4.6,5.2,1],['c_banner',2,5,6.6,1],['c_brazier',2,4.2,5,1],['c_column',3,5.4,7.6,1],['c_rubble',5,3.6,7.6,0],['c_candela',2,3.8,6,0],['c_blood',2,3.4,6,0]]];
function TWN100_island(i){const p=TWN100_PG[i],P=PORT[i];if(!P)return;const y0=TOWNS[0].ph,face=Math.atan2(p.a[0]-p.x,p.a[1]-p.y),fx=Math.sin(face),fz=Math.cos(face);
  // move the portal: keep disc / swirl / chains, replace the frame and sign
  const keep=new Set([P.disc,P.sw,P.ch]);P.g.children.slice().forEach(c=>{if(!keep.has(c))P.g.remove(c)});
  [-1.25,1.25].forEach(lx=>{const wx=P.x+Math.cos(P.g.rotation.y)*lx,wz=P.z-Math.sin(P.g.rotation.y)*lx;CBLK.delete(Math.round(wz)*W+Math.round(wx))});
  P.x=p.x;P.z=p.y;P.g.position.set(p.x,GH(p.x,p.y),p.y);P.g.rotation.y=face;P.disc.position.y=P.sw.position.y=1.62;
  const key='TWNPF|'+i;let k=null;if(!twHas(key)){k=twKit(701+i*13);TWN100_frameK(k,i)}P.g.add(twGroup(k,key));
  const cs=Math.cos(face),sn=Math.sin(face),loc=(lx,lz)=>[p.x+lx*cs+lz*sn,p.y-lx*sn+lz*cs];
  [-1.45,1.45].forEach(lx=>{const q=loc(lx,0);CBLK.add(Math.round(q[1])*W+Math.round(q[0]))});
  // signpost to the right of the dais, facing the arrival spot
  {const q=loc(2.55,2.3),sg=twPostG(2.0,1.62,.62);sg.position.set(q[0],GH(q[0],q[1]),q[1]);sg.rotation.y=face;scene.add(sg);
    sign(sg,[{t:'Portal '+['I','II','III','IV','V','VI'][i]+' · '+PMAP[i].n,f:'700 36px'},{t:PMAP[i].ic+' Enemy level '+PMAP[i].lv[0]+'–'+PMAP[i].lv[1],f:'600 26px'}],2.0,.62,['#1e2a16','#2a3a1a','#1a2a3a','#4a3018','#1a1e22','#2a0c10'][i],'#f4ead0','#c9a24a',0,1.62,0,0,512,150);
    CBLK.add(Math.round(q[1])*W+Math.round(q[0]))}
  // scenery: themed WD kinds round the dais, keeping the front and every road that reaches the island clear
  const open=[face];TWN100_RD.forEach(L=>L.forEach(v=>{const d=Math.hypot(v[0]-p.x,v[1]-p.y);if(d<p.r+4&&d>1)open.push(Math.atan2(v[0]-p.x,v[1]-p.y))}));
  const clear=a=>open.every(o=>{let d=Math.abs(a-o)%6.283;if(d>Math.PI)d=6.283-d;return d>.62});
  const R=dkRng(901+i*37),lit=[],glo=[],m4=new THREE.Matrix4(),q4=new THREE.Quaternion(),e=new THREE.Euler(),UP=new THREE.Vector3(0,1,0),used=[[0,0,3.2]].concat(TWN101_used(i,face)); // v101: keep clear of the plaza's pillars, obelisk and bollards
  const cl=new THREE.Color();
  (TWN100_DECO[i]||[]).forEach(([kn,n,r0,r1,sol])=>{const S=WD&&WD.T&&WD.T[kn];if(!S)return;
    for(let j=0,tries=0;j<n&&tries<n*40;tries++){const ring=kn=='h_stone'||kn=='d_fence';let a=ring?face+Math.PI+(j-(n-1)/2)*.62:R()*6.283;
      if(kn=='k_lamp'||kn=='d_lamp'||kn=='h_totem'||kn=='c_gargoyle'||kn=='c_brazier'||kn=='b_cairn')a=face+(j%2?1:-1)*(.85+Math.floor(j/2)*.5);
      const rr=r0+R()*(r1-r0),lx=Math.sin(a)*rr,lz=Math.cos(a)*rr,wx=p.x+lx,wz=p.y+lz,sc=S.s[0]+R()*(S.s[1]-S.s[0]),rad=(sol?1.1:.5)*sc;
      if(!ring&&!clear(a))continue;if(used.some(u=>Math.hypot(u[0]-lx,u[1]-lz)<u[2]+rad))continue;if(MAP.DW[Math.round(wz)*W+Math.round(wx)]>-.8)continue;
      used.push([lx,lz,rad]);j++;
      const ry=ring?a+Math.PI/2:(kn.indexOf('lamp')>=0?a+Math.PI/2:R()*6.283),yy=GH(wx,wz)+(S.y||0)*(S.y>.2?1:sc);
      e.set(0,ry,0);q4.setFromEuler(e);m4.compose(new THREE.Vector3(wx,yy,wz),q4,new THREE.Vector3(sc*(S.sc?S.sc[0]:1),sc*(S.sc?S.sc[1]:1),sc*(S.sc?S.sc[2]:1)));
      const hh=((wx*73.13+wz*37.7)%1+1)%1;
      S.parts.forEach(pt=>{const g=pt.g.clone();g.applyMatrix4(m4);const tl=pt.glow?(S.gt||S.tint):S.tint,c=g.attributes.color;
        if(c){cl.setHex(tl?tl[Math.floor(hh*tl.length)%tl.length]:0xffffff);if(!pt.glow&&!pt.mat)cl.multiplyScalar(1-S.j/2+S.j*hh);for(let v=0;v<c.count;v++)c.setXYZ(v,c.getX(v)*cl.r,c.getY(v)*cl.g,c.getZ(v)*cl.b)}
        if(!pt.mat&&g.attributes.color)(pt.glow?glo:lit).push(g)});
      if(sol&&kn!='d_fence'){const cr=(S.col||.5)*sc;for(let tz=Math.floor(wz-cr);tz<=Math.ceil(wz+cr);tz++)for(let tx=Math.floor(wx-cr);tx<=Math.ceil(wx+cr);tx++)if(Math.hypot(tx-wx,tz-wz)<=cr+.2)CBLK.add(tz*W+tx);CBLK.add(Math.round(wz)*W+Math.round(wx))}}});
  const out={i,g:P.g,lit:null,glow:null};
  const toG=L=>{if(!L.length)return null;const g=NK.merge(L.map(q=>{if(!q.attributes.normal)q.computeVertexNormals();return q}));g.computeBoundingSphere();g.userData.lps=1;return g};
  {const g=toG(lit);if(g){const m=new THREE.Mesh(g,TWN100_mat('lit'));m.castShadow=true;m.receiveShadow=true;m.userData.lpsSkip=1;scene.add(m);out.lit=m}}
  {const g=toG(glo);if(g){const m=new THREE.Mesh(g,TWN100_mat('glow'));m.userData.lpsSkip=1;scene.add(m);out.glow=m}}
  // low drifting mist for the bog and the graveyard: a few flat soft quads (one mesh)
  if(i==0||i==4){const P2=[],U2=[];for(let j=0;j<7;j++){const a=R()*6.283,rr=1.5+R()*5,cx=p.x+Math.sin(a)*rr,cz=p.y+Math.cos(a)*rr,s=2.2+R()*2.4,yy=GH(cx,cz)+.3+R()*.25;
      [[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]].forEach(([u,v])=>{P2.push(cx+u*s,yy,cz+v*s);U2.push((u+1)/2,(v+1)/2)})}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P2,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U2,2));g.computeBoundingSphere();
    const m=new THREE.Mesh(g,TWN100_mat(i==0?'mistK':'mistD'));m.renderOrder=3;m.userData.lpsSkip=1;scene.add(m);out.mist=m}
  TWN100_P[i]=out;
  TANIM.push({x:p.x,z:p.y,f:now=>{if(P.sw.visible){P.sw.rotation.z=now*.0018+i;P.disc.material.opacity=.66+.12*Math.sin(now*.003+i)}}})}
var TWN100_M={};
function TWN100_mat(k){if(TWN100_M[k])return TWN100_M[k];let m;
  if(k=='lit'){m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true});m.userData.lps=1}
  else if(k=='glow')m=new THREE.MeshBasicMaterial({vertexColors:true});
  else m=new THREE.MeshBasicMaterial({map:WD.mistT,color:k=='mistK'?0x9ac8a0:0x8ab8b0,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide,fog:true});
  return TWN100_M[k]=m}
// the old Portal Court: floor, curb, rune stone and their colliders go; a fingerpost marks the crossroads
function TWN100_court(){const C=PCOURT;
  scene.children.slice().forEach(o=>{if(Math.abs(o.position.x-C[0])<.01&&Math.abs(o.position.z-C[1])<.01&&o!==pl)scene.remove(o)});
  CBLK.delete(C[1]*W+C[0]);
  const key='TWNFP';let k=null;if(!twHas(key)){k=twKit(777);k.as('bark',()=>k.L('c',TWC.woodD,[0,-.1,0],[0,3.1,0],.11,'log'));k.p('c',TWC.stoneD,'dod',0,.12,0,.34,.22,.34);
    [[0,2.65],[1.2,2.2],[2.5,1.75],[3.6,2.45]].forEach(([a,y])=>k.at(0,y,0,()=>{k.as('board',()=>k.p('c',0x5a3d20,'box',.75,0,0,1.25,.3,.06,0,0,0,.03));k.as('wood',()=>k.p('c',0x5a3d20,'tri',1.48,0,0,.3,.22,.06,0,0,-Math.PI/2,.02))},a))}
  const g=twGroup(k,key);g.position.set(C[0]-2.6,GH(C[0]-2.6,C[1]-2.6),C[1]-2.6);g.rotation.y=Math.PI/2;scene.add(g);CBLK.add(Math.round(C[1]-2.6)*W+Math.round(C[0]-2.6));TWN100.fp=g}
try{TWN100_court();for(let i=0;i<PORT.length;i++)TWN100_island(i);portalRefresh()}catch(e){console.warn('v100 portals',e)}
// locked islands: lanterns and braziers dark until the portal opens
{const f=portalRefresh;portalRefresh=function(){const r=f.apply(this,arguments);try{TWN100_P.forEach(q=>{if(q&&q.glow)q.glow.visible=pUnlocked(q.i)})}catch(_){}return r}}
try{portalRefresh()}catch(_){}
// world map labels (called from the patched openWMap) and minimap pips
function TWN100_wmap(g,P,lab,s){const T=TOWNS[0];
  PMAP.forEach((p,i)=>{const q=TWN100_PG[i],[x,y]=P(q.x,q.y),u=pUnlocked(i),c='#'+p.col.toString(16).padStart(6,'0');g.fillStyle=u?c:'#4a4a52';g.beginPath();g.arc(x,y,7,0,6.28);g.fill();g.strokeStyle='#000';g.lineWidth=1.5;g.stroke();
    lab((u?'🌀 ':'🔒 ')+['I','II','III','IV','V','VI'][i]+' · '+p.n,x,y+20,u?'#efe6ff':'#9a96a6')});
  {const [x,y]=P(TOWNS[0].cx,TOWNS[0].cy+34);lab('🏘️ South Ward',x,y,'#e8dcc0')}
  {const [x,y]=P(PCOURT[0]-17,PCOURT[1]+2);lab('🛤️ Portal Road',x,y,'#ffe6b0')}}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{const P=(x,z)=>[(x-(cx-vw/2)+.5)*w/vw,(z-(cy-vh/2)+.5)*h/vh];
  PMAP.forEach((p,i)=>{const q=TWN100_PG[i],[x,y]=P(q.x,q.y);if(x<-6||y<-6||x>w+6||y>h+6)return;mmX.fillStyle=pUnlocked(i)?'#'+p.col.toString(16).padStart(6,'0'):'#4a4a52';mmX.beginPath();mmX.arc(x,y,4.5,0,6.28);mmX.fill();mmX.strokeStyle='#000';mmX.lineWidth=1;mmX.stroke()})}catch(_){}}}

// ================= v101 town: the Portal Road — six portals in order, each on a grander plaza =================
// Portals I..VI stand in order along one straight road running south from the Grand Square's gate (TWN100_PG in
// w0_world.js: alternating east/west, each facing the road). Every plaza now has an outer flagstone ring with a curb, a
// semicircle of six rune pillars behind the portal (runes and braziers light up once that portal is open), a glowing rune
// circle round the dais, two banner poles in the zone's colour, stone bollards round the edge and a numbered obelisk
// (I..VI) by the entrance. The road gets a stone arch at the gate with a board listing the portals in order, lantern posts
// that are lit as far as the furthest open portal, and a beacon of light over the next portal to clear.
var TWN101_RN=['I','II','III','IV','V','VI'],TWN101={x:[],seg:[],beacon:null,arch:null,lamps:[]};
// plaza layout in the island's local frame (x right, z toward the road); shared by the builder and TWN100_island's scenery
function TWN101_lay(i){const r=TWN100_PG[i]?TWN100_PG[i].r:10,P=[],B=[];
  for(let j=0;j<6;j++){const a=Math.PI+(j-2.5)*.42;P.push([Math.sin(a)*7.6,Math.cos(a)*7.6])}
  for(let j=0;j<16;j++){const a=j/16*6.283;if(Math.cos(a)>.72)continue;B.push([Math.sin(a)*(r-1.0),Math.cos(a)*(r-1.0)])}
  return {r,pil:P,bol:B,ob:[-2.6,r-1.6],br:[[-1.9,r-.6],[1.9,r-.6]],ban:[[-2.6,-.6],[2.6,-.6]]}}
// world-axis offsets (the scenery code's lx/lz) of everything solid on the plaza, with a radius
function TWN101_used(i,face){const L=TWN101_lay(i),c=Math.cos(face),s=Math.sin(face),w=(q,r)=>[q[0]*c+q[1]*s,-q[0]*s+q[1]*c,r];
  return L.pil.map(q=>w(q,1.1)).concat(L.bol.map(q=>w(q,.6)),[w(L.ob,1.3)],L.br.map(q=>w(q,.8)),L.ban.map(q=>w(q,.5)))}
function TWN101_isle(i){
  const p=TWN100_PG[i],P=PORT[i];if(!p||!P)return;const T=TOWNS[0],face=Math.atan2(p.a[0]-p.x,p.a[1]-p.y),cs=Math.cos(face),sn=Math.sin(face),L=TWN101_lay(i);
  const loc=(lx,lz)=>[p.x+lx*cs+lz*sn,p.y-lx*sn+lz*cs],col=PMAP[i].col,dc=[0x4e5a44,0x8a8a7a,0xb8c4d0,0xc8956a,0x4a4a52,0x3a3034][i];
  const blk=(q,r)=>{const w=loc(q[0],q[1]);for(let tz=Math.floor(w[1]-r);tz<=Math.ceil(w[1]+r);tz++)for(let tx=Math.floor(w[0]-r);tx<=Math.ceil(w[0]+r);tx++)if(Math.hypot(tx-w[0],tz-w[1])<=r+.2)CBLK.add(tz*W+tx)};
  const kL='TWN101L|'+i,kG='TWN101G|'+i;let k=null,kg=null;
  if(!twHas(kL)){k=twKit(1101+i*7);kg=twKit(1201+i*7);const S=(c,f)=>dkShade(c,f),R=k.R;
    // outer flagstone rings and a curb
    for(let ring=0;ring<3;ring++){const r0=3.45+ring*1.05,n=Math.round(r0*5);for(let j=0;j<n;j++){const a=(j+(ring%2)*.5)/n*6.283;
      k.as('stone',()=>k.p('c',R()<.35?S(dc,.82):R()<.3?S(dc,1.1):S(dc,.95),'box',Math.cos(a)*r0,.05,Math.sin(a)*r0,.98,.1+R()*.04,r0*6.283/n*.92,0,-a,0,.1))}}
    {const r0=6.55,n=36;for(let j=0;j<n;j++){const a=j/n*6.283;k.as('ashlar',()=>k.p('c',S(dc,.75),'box',Math.cos(a)*r0,.13,Math.sin(a)*r0,.36,.26,r0*6.283/n*.96,0,-a,0,.06))}}
    // glowing rune circle round the dais
    {const r0=3.0,n=26;for(let j=0;j<n;j++){const a=j/n*6.283,a2=(j+.62)/n*6.283;kg.p('g',col,'box',Math.cos((a+a2)/2)*r0,.2,Math.sin((a+a2)/2)*r0,.07,.04,r0*(a2-a),0,-(a+a2)/2,0,0);
      if(j%3==0)kg.p('g',col,'box',Math.cos(a)*(r0+.3),.2,Math.sin(a)*(r0+.3),.34,.04,.07,0,-a,0,0)}}
    // six rune pillars in a semicircle behind the portal
    L.pil.forEach(([x,z])=>{const a=Math.atan2(x,z);twStones(k,S(dc,.9),x-.32,z,x+.32,z,0,3.1,.64,.36);
      k.as('ashlar',()=>{k.p('c',S(dc,1.05),'box',x,3.18,z,.86,.16,.86,0,0,0,.03);k.p('c',S(dc,.8),'box',x,.12,z,.95,.24,.95,0,0,0,.03)});
      kdBrazier(k,x,z,3.26,.55);kg.p('g',col,'oct',x,3.7,z,.16,.3,.16);
      [1.15,1.75,2.35].forEach(y=>kg.p('g',col,'box',x-Math.sin(a)*.35,y,z-Math.cos(a)*.35,.14,.18,.03,0,a,0,0))});
    // banner poles either side of the frame
    L.ban.forEach(([x,z])=>{k.as('bark',()=>k.L('c',TWC.woodD,[x,0,z],[x,4.6,z],.07,'log'));k.p('m',TWC.gold,'oct',x,4.72,z,.09,.14,.09);kdBanner(k,x,4.35,z+.08,0,col,.62,1.9)});
    // bollards round the edge, the front left open toward the road
    L.bol.forEach(([x,z])=>{k.as('stone',()=>k.p('c',S(dc,.85),'cyl8',x,.32,z,.22,.64,.22,0,0,0,.04));k.p('c',S(dc,1.1),'sph',x,.7,z,.2,.14,.2,0,0,0,.02)});
    // the numbered obelisk by the entrance, and two braziers flanking the way in
    {const [x,z]=L.ob;k.as('ashlar',()=>{k.p('c',S(dc,.7),'box',x,.2,z,1.3,.4,1.3,0,0,0,.03);k.p('c',S(dc,.9),'frus8',x,2.0,z,.5,3.2,.5,0,Math.PI/8,0,.04)});
      k.p('m',TWC.gold,'oct',x,3.75,z,.22,.32,.22);kg.p('g',col,'oct',x,3.75,z,.12,.2,.12)}
    L.br.forEach(([x,z])=>{twStones(k,S(dc,.85),x-.3,z,x+.3,z,0,.9,.6,.3);kdBrazier(k,x,z,.9,.8)})}
  const g=twGroup(k,kL),gg=twGroup(kg,kG);[g,gg].forEach(o=>{o.position.set(p.x,GH(p.x,p.y),p.y);o.rotation.y=face;o.userData.lpsSkip=1;scene.add(o)});
  // the numeral on the obelisk (on the faces toward the road and toward the portal)
  {const [x,z]=L.ob;[[0,.27],[Math.PI,-.27]].forEach(([ry,dz])=>sign(g,[{t:TWN101_RN[i],f:'800 110px'},{t:PMAP[i].n,f:'700 28px'}],.86,1.0,'#17120e','#f4e2a8','#c9a24a',x,2.15,z+dz,ry,256,300))}
  L.pil.forEach(q=>blk(q,.5));L.bol.forEach(q=>blk(q,.15));blk(L.ob,.7);L.br.forEach(q=>blk(q,.35));L.ban.forEach(q=>blk(q,.12));
  TWN101.x[i]={g,gg,lamps:L.pil.map(q=>{const w=loc(q[0],q[1]);return [w[0],T.ph+3.9,w[1]]}).concat(L.br.map(q=>{const w=loc(q[0],q[1]);return [w[0],T.ph+1.6,w[1]]}))}}
// the road: an arch at the start with a board listing the portals in order, lantern posts lit as far as the furthest open portal
function TWN101_road(){const T=TOWNS[0],X=PCOURT[0],y0=T.cy+T.sz+2,yN=TWN100_PG[TWN100_PG.length-1].y+3,AY=PCOURT[1]+3;
  if(TWN100.fp){scene.remove(TWN100.fp);CBLK.delete(Math.round(PCOURT[1]-2.6)*W+Math.round(PCOURT[0]-2.6));TWN100.fp=null}
  // lantern posts on both sides every 9 tiles (skipping the branches); each belongs to the stretch before portal j
  const posts=[];for(let y=y0+6;y<=yN;y+=9)[-1,1].forEach(s=>{if(TWN100_PG.some(p=>Math.abs(p.y-y)<3.4&&Math.sign(p.x-X)==s))return;const j=TWN100_PG.findIndex(p=>p.y>=y-1);posts.push([X+s*2.7,y,s,j<0?TWN100_PG.length-1:j])});
  if(!twHas('TWN101R')){const k=twKit(1301);
    posts.forEach(([x,y,s])=>k.at(x-X,0,y-y0,()=>{const h=2.6;k.as('ashlar',()=>k.p('c',TWC.stoneD,'box',0,.15,0,.5,.3,.5,0,0,0,.03));k.as('bark',()=>k.L('c',TWC.woodD,[0,.25,0],[0,h+.2,0],.08,'log'));
      k.as('wood',()=>k.L('c',TWC.woodD,[0,h,0],[-s*.4,h,0],.05,'box'));k.L('m',TWC.iron,[-s*.36,h,0],[-s*.36,h-.12,0],.012,'cyl6',0);
      k.p('m',TWC.iron,'cone4',-s*.36,h-.24,0,.17,.13,.17,0,Math.PI/4,0,0);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>k.p('m',TWC.iron,'box',-s*.36+q[0]*.09,h-.44,q[1]*.09,.025,.3,.025,0,0,0,0))}));
    // the arch: two stone piers and a lintel with merlons, braziers on top
    [-1,1].forEach(s=>{twStones(k,TWC.stone,s*3.4-.6,AY-y0,s*3.4+.6,AY-y0,0,4.0,1.2,.6);k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',s*3.4,4.05,AY-y0,1.4,.14,1.4,0,0,0,.03));kdBrazier(k,s*3.4,AY-y0,4.12,.8);kdBanner(k,s*3.4,3.7,AY-y0-.72,Math.PI,TOWNS[0].pal.ban||0x7a2230,.7,1.6)});
    twStones(k,TWC.stone,-4.0,AY-y0,4.0,AY-y0,4.0,4.9,1.0,.6);k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',0,4.95,AY-y0,8.6,.12,1.1,0,0,0,.02));
    // the board listing the portals, on two posts at the side of the road
    [-1.1,1.1].forEach(dx=>k.as('bark',()=>k.L('c',TWC.woodD,[-5.5,0,AY-y0-3.0+dx],[-5.5,3.3,AY-y0-3.0+dx],.09,'log')));
    k.as('board',()=>k.p('c',0x4a3420,'box',-5.5,2.05,AY-y0-3.0,.12,2.4,2.9,0,0,0,.02));
    TWN101.rk=k}
  const g=twGroup(TWN101.rk||null,'TWN101R');g.position.set(X,T.ph,y0);scene.add(g);TWN101.arch=g;
  sign(g,[{t:'THE PORTAL ROAD',f:'800 60px'},{t:'Portals I to VI, in order',f:'600 30px'}],5.6,1.0,'#2a1c12','#f4e2a8','#c9a24a',0,4.45,AY-y0-.62,Math.PI,640,120);
  sign(g,[{t:'DUSKHOLD',f:'800 60px'},{t:'The Grand Square',f:'600 30px'}],5.6,1.0,'#2a1c12','#f4e2a8','#c9a24a',0,4.45,AY-y0+.62,0,640,120);
  TWN101.board=g;TWN101_board();
  // one glow mesh per stretch, so lanterns past the furthest open portal stay dark
  TWN101.seg=TWN100_PG.map((p,j)=>{const key='TWN101RG|'+j,ps=posts.filter(q=>q[3]==j);if(!ps.length)return null;let k=null;if(!twHas(key)){k=twKit(1311+j);ps.forEach(([x,y,s])=>k.p('g',0xffd27a,'oct',x-X-s*.36,2.16,y-y0,.1,.15,.1))}
    const gg=twGroup(k,key);gg.position.set(X,T.ph,y0);scene.add(gg);return {g:gg,lamps:ps.map(([x,y,s])=>[x-s*.36,T.ph+2.1,y])}});
  // colliders: posts and arch piers
  posts.forEach(([x,y])=>CBLK.add(Math.round(y)*W+Math.round(x)));[-1,1].forEach(s=>{for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)CBLK.add(Math.round(AY+dz*.5)*W+Math.round(X+s*3.4+dx*.5))});
  for(let dz=0;dz<=3;dz++)CBLK.add(Math.round(AY-4.0+dz*.7)*W+Math.round(X-5.5))}
// the board's text (which portals are open / cleared)
function TWN101_board(){const g=TWN101.board;if(!g)return;const T=TOWNS[0],AY=PCOURT[1]+3,y0=T.cy+T.sz+2;
  const L=[{t:'THE SIX PORTALS',f:'800 40px'}].concat(PMAP.map((p,i)=>({t:TWN101_RN[i]+'  '+p.n+'  ·  Lv '+p.lv[0]+'–'+p.lv[1]+(pDone(i)?'  ✓':pUnlocked(i)?'':'  🔒'),f:'600 26px'})));
  // repaint only when the text changed (this runs every second); free the old board's canvas texture
  const key=L.map(l=>l.t).join('|');if(TWN101.bs&&TWN101.bk===key)return;TWN101.bk=key;
  if(TWN101.bs){const sg=TWN101.bs.parent;g.remove(sg);sg.traverse(o=>{const m=o.material,t=m&&m.map;if(!t||typeof SGNR=='undefined'||!SGNR)return;const k=SGNR.findIndex(r=>r.t===t);if(k>=0){SGNR.splice(k,1);t.dispose();m.dispose()}});TWN101.bs=null}
  TWN101.bs=sign(g,L,2.7,2.2,'#1e1610','#f4e9c8','#c9a24a',-5.42,2.05,AY-y0-3.0,Math.PI/2,512,420)}
// the beacon: a column of light over the next portal to clear
function TWN101_beacon(){let n=-1;for(let i=0;i<TWN100_PG.length;i++)if(pUnlocked(i)&&!pDone(i)){n=i;break}
  if(!TWN101.beacon){const geo=new THREE.CylinderGeometry(.8,1.7,46,20,1,true);geo.translate(0,23,0);
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    m.userData.lpsSkip=1;m.renderOrder=4;m.castShadow=false;scene.add(m);TWN101.beacon=m;
    TANIM.push({get x(){return m.position.x},get z(){return m.position.z},f:now=>{if(m.visible){m.material.opacity=.15+.07*Math.sin(now/420);m.rotation.y=now/2600}}})}
  const m=TWN101.beacon;if(n<0){m.visible=false;return}const p=TWN100_PG[n];m.visible=true;m.position.set(p.x,GH(p.x,p.y),p.y);m.material.color.setHex(PMAP[n].col)}
// keep everything in step with which portals are open
function TWN101_sync(){try{let far=-1;TWN100_PG.forEach((p,i)=>{if(pUnlocked(i))far=i});
  TWN101.x.forEach((q,i)=>{if(q&&q.gg)q.gg.visible=pUnlocked(i)});TWN101.seg.forEach((q,j)=>{if(q)q.g.visible=j<=far});
  // lamps (point lights) for the open plazas and the lit stretch of road
  TWN101.lamps.forEach(l=>{const i=TLAMP.indexOf(l);if(i>=0)TLAMP.splice(i,1)});TWN101.lamps=[];
  TWN101.x.forEach((q,i)=>{if(q&&pUnlocked(i))q.lamps.forEach(l=>TWN101.lamps.push(l))});TWN101.seg.forEach((q,j)=>{if(q&&j<=far)q.lamps.forEach(l=>TWN101.lamps.push(l))});
  TWN101.lamps.forEach(l=>TLAMP.push(l));TWN101_beacon();TWN101_board()}catch(e){console.warn('v101 portal road',e)}}
try{for(let i=0;i<TWN100_PG.length;i++)TWN101_isle(i);TWN101_road();TWN101_sync()}catch(e){console.warn('v101 portals',e)}
// the old side gates (x = ±TS) are gone from the Grand Square: their name boards, the lamps that flanked them and the
// "→ Kindlelight" zone signpost go too (gatehouses, towers and banners were already hidden by kdWalls)
try{const T=TOWNS[0],v=new THREE.Vector3(),gl=(lx,lz)=>Math.abs(Math.abs(lx)-19.3)<.25&&Math.abs(Math.abs(lz)-3.1)<.25,zs=(lx,lz)=>Math.abs(lx-17.1)<.35&&Math.abs(lz-5.4)<.35;T.g.updateMatrixWorld(true);
  T.g.children.slice().forEach(o=>{o.getWorldPosition(v);const lx=v.x-T.cx,lz=v.z-T.cy,ax=Math.abs(lx);
    if(o.isMesh&&o.geometry===G_PLN&&ax>19.9&&ax<22.1&&Math.abs(lz)<.3)o.visible=false;else if(o.isGroup&&(gl(lx,lz)||zs(lx,lz)))T.g.remove(o)});
  for(let i=T.col.length-1;i>=0;i--){const c=T.col[i];if(gl(c.x-T.cx,c.z-T.cy)||zs(c.x-T.cx,c.z-T.cy))T.col.splice(i,1)}
  for(let i=TLAMP.length-1;i>=0;i--){const l=TLAMP[i];if(gl(l[0]-T.cx,l[2]-T.cy))TLAMP.splice(i,1)}}catch(e){console.warn('v101 old gates',e)}
{const f=portalRefresh;portalRefresh=function(){const r=f.apply(this,arguments);TWN101_sync();return r}}

