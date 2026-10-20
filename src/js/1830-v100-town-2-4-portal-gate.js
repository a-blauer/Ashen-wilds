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
    sign(sg,[{t:PMAP[i].ic+' '+PMAP[i].n,f:'700 40px'},{t:'Enemy level '+PMAP[i].lv[0]+'–'+PMAP[i].lv[1],f:'600 26px'}],2.0,.62,['#1e2a16','#2a3a1a','#1a2a3a','#4a3018','#1a1e22','#2a0c10'][i],'#f4ead0','#c9a24a',0,1.62,0,0,512,150);
    CBLK.add(Math.round(q[1])*W+Math.round(q[0]))}
  // scenery: themed WD kinds round the dais, keeping the front and every road that reaches the island clear
  const open=[face];TWN100_RD.forEach(L=>L.forEach(v=>{const d=Math.hypot(v[0]-p.x,v[1]-p.y);if(d<p.r+4&&d>1)open.push(Math.atan2(v[0]-p.x,v[1]-p.y))}));
  const clear=a=>open.every(o=>{let d=Math.abs(a-o)%6.283;if(d>Math.PI)d=6.283-d;return d>.62});
  const R=dkRng(901+i*37),lit=[],glo=[],m4=new THREE.Matrix4(),q4=new THREE.Quaternion(),e=new THREE.Euler(),UP=new THREE.Vector3(0,1,0),used=[[0,0,3.2]];
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
    lab((u?'🌀 ':'🔒 ')+p.n,x,y+(q.y<T.cy?-16:16),u?'#efe6ff':'#9a96a6')});
  {const [x,y]=P(CYD.x,CYD.y);lab('🌲 Courtyard',x,y,'#c8f0b0')}
  {const [x,y]=P(T.cx,T.cy+30);lab('⚒️ Market ward',x,y,'#ffe6b0')}}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{const P=(x,z)=>[(x-(cx-vw/2)+.5)*w/vw,(z-(cy-vh/2)+.5)*h/vh];
  PMAP.forEach((p,i)=>{const q=TWN100_PG[i],[x,y]=P(q.x,q.y);if(x<-6||y<-6||x>w+6||y>h+6)return;mmX.fillStyle=pUnlocked(i)?'#'+p.col.toString(16).padStart(6,'0'):'#4a4a52';mmX.beginPath();mmX.arc(x,y,4.5,0,6.28);mmX.fill();mmX.strokeStyle='#000';mmX.lineWidth=1;mmX.stroke()})}catch(_){}}}

