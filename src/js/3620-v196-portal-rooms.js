// ================= v196: the forest round Duskhold's meadow and the six portal rooms =================
// Owner (Nov 3 2026): "I want each portal to have an entry way thats initially blocked (except the first one), but after unlocking
// the next biome that entry way opens leading into our next themed portal room ... the entry to the portals on the edges of the map
// (spaced out a little — each portal room is separate from each other and still themed)."
//  * The forest: tall trees stand on every forest tile ('#', 0045) near the open ground: round the meadow, along the six paths and
//    round each room. In the meadow's ring they are dusky pines and old oaks; along a path's outer half and round a room they take
//    that zone's look (bog trees and glowcaps, oaks, snowy pines, sandstone spires, dead black trees, blood-leafed trees). They are
//    instanced (one mesh per kind and sector, each with its own bounds so the sectors out of view are skipped), never chopped.
//  * The rooms: v100/v101's portal plazas (TWN100_island, TWN101_isle) now stand at the room centres (TWN100_PG in 0045). The
//    Portal Road (its arch, board and lantern posts) is gone.
//  * The entryways: a stone arch over each path where it leaves the meadow, the portal's name on a board (title only). Portals II-VI
//    start sealed: a wall of thorned roots, fallen stones and chains fills the arch (solid tiles), and a prompt says who must fall.
//    When the portal opens (its zone's previous Sovereign defeated, pUnlocked) the seal is gone: on the spot if you are there to see
//    it, with a burst of dust and a line in the log. Co-op: pUnlocked follows the shared progress (bossDone), so partners see the same.
var DM196P={trees:[],seal:[],arch:[],built:0};
// ---------------- tree kinds (unit trees, height ~1 = the kind's own scale) ----------------
function dm196Geo(parts){const P=[],C=[],c=new THREE.Color();parts.forEach(([geo,col,m])=>{const g=geo.index?geo.toNonIndexed():geo.clone();g.applyMatrix4(m);const pa=g.attributes.position;
    for(let i=0;i<pa.count;i++){P.push(pa.getX(i),pa.getY(i),pa.getZ(i));const y=pa.getY(i);c.setHex(col);const sh=.7+.3*Math.min(1,Math.max(0,y/11));C.push(c.r*sh,c.g*sh,c.b*sh)}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();return g}
function dm196M(x,y,z,sx,sy,sz,rx,ry,rz){const m=new THREE.Matrix4();m.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(sx,sy,sz));return m}
var DM196K={};
function dm196Kind(n){if(DM196K[n])return DM196K[n];const R=dkRng(n.length*131+n.charCodeAt(0)),Cy=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||6,1),Co=(r,h,s)=>new THREE.ConeGeometry(r,h,s||7,1),Ic=d=>new THREE.IcosahedronGeometry(1,d||0),L=[];
  if(n=='pine'||n=='snowpine'){L.push([Cy(.16,.3,4.4),0x3a2a1e,dm196M(0,2.2,0,1,1,1)]);
    for(let i=0;i<5;i++){const y=2.2+i*1.85,r=2.25-i*.38;L.push([Co(r,2.9-i*.18,8),[0x1c3324,0x203a28,0x24402c,0x1e3626,0x284530][i],dm196M((R()-.5)*.15,y+1.3,(R()-.5)*.15,1,1,1,0,R()*3,0)]);
      if(n=='snowpine')L.push([Co(r*.82,1.1,8),0xdde6ee,dm196M(0,y+2.35,0,1,1,1,0,R()*3,0)])}}
  else if(n=='oak'||n=='bog'||n=='blood'){const leaf=n=='oak'?[0x24402a,0x2e4c2e,0x355a32,0x2a4630]:n=='bog'?[0x22361e,0x2a3e22,0x1e2e1c,0x34462a]:[0x4a1418,0x5e1a1e,0x3e1016,0x6e2226],bark=n=='blood'?0x2a1a1a:0x34281c;
    L.push([Cy(.32,.62,5.2,7),bark,dm196M(0,2.6,0,1,1,1)]);[[1.1,4.2,.3,-.7],[-.9,4.6,-.5,.6]].forEach(([x,y,z,a])=>L.push([Cy(.12,.22,2.6,5),bark,dm196M(x*.5,y-.6,z*.5,1,1,1,a*.5,0,-x*.5)]));
    for(let i=0;i<7;i++){const a=i/7*6.283+R(),rr=i?1.5+R()*.6:0,y=i?5.1+R()*1.6:6.6,s=i?1.5+R()*.6:2.1;L.push([Ic(1),leaf[i%4],dm196M(Math.cos(a)*rr,y,Math.sin(a)*rr,s,s*.78,s,R(),R()*3,R())])}
    if(n!='blood')L.push([Ic(0),0x3e5a2a,dm196M(.35,1.1,.3,.5,.9,.32,0,.4,.2)]); // moss on the trunk
    if(n=='bog')for(let i=0;i<4;i++){const a=i*1.7;L.push([Cy(.02,.05,1.8,4),0x4a5a36,dm196M(Math.cos(a)*1.6,4.3,Math.sin(a)*1.6,1,1,1)])}} // hanging moss
  else if(n=='dead'){const bark=0x2a2420;L.push([Cy(.14,.42,6.4,6),bark,dm196M(0,3.2,0,1,1,1,0,0,.04)]);
    for(let i=0;i<6;i++){const a=i/6*6.283+R(),y=3+i*.6,l=1.4+R()*1.2;L.push([Cy(.04,.12,l,4),bark,dm196M(Math.cos(a)*l*.4,y+l*.25,Math.sin(a)*l*.4,1,1,1,Math.sin(a)*.9,0,-Math.cos(a)*.9)])}}
  else if(n=='spire'){[[0,0,1.2,6],[.9,.4,.7,3.6],[-.7,-.5,.8,4.4]].forEach(([x,z,r,h],i)=>{L.push([Cy(r*.55,r,h,6),[0xb08458,0xa07448,0xc09468][i],dm196M(x,h/2,z,1,1,1,0,R()*3,(R()-.5)*.1)]);
      L.push([Cy(r*.62,r*.6,.25,6),0x8a6440,dm196M(x,h*.55,z,1,1,1,0,R()*3,0)])})}
  else if(n=='cactus'){L.push([Cy(.32,.38,4.2,8),0x4a6a3a,dm196M(0,2.1,0,1,1,1)]);[[-1,2.2],[1,2.8]].forEach(([s,y])=>{L.push([Cy(.2,.22,1.0,7),0x4a6a3a,dm196M(s*.5,y,0,1,1,1,0,0,s*1.57)]);L.push([Cy(.2,.22,1.4,7),0x527444,dm196M(s*.95,y+.65,0,1,1,1)])})}
  const g=dm196Geo(L);g.computeBoundingBox();return DM196K[n]=g}
var DM196_THEME=[['bog','bog','dead'],['oak','oak','pine'],['snowpine','snowpine','dead'],['spire','spire','cactus'],['dead','dead','pine'],['blood','dead','blood']];
var DM196_TINT=[[0x8a9a7a,0xa0b090],[0xa8c498,0xc0d8a8],[0xd0dce8,0xe8f0f8],[0xe0c8a0,0xc8b088],[0x8a9098,0xa0a8b0],[0xb08890,0xa07078]];
// ---------------- the forest ----------------
function dm196Forest(){const T=TOWNS[0],D=DM196,R=dkRng(19607),pick=[],S=1.75;
  for(let y=D.y0;y<D.y0+D.ny;y+=S)for(let x=D.x0;x<D.x0+D.nx;x+=S){const px=x+(R()-.5)*S*.9,pz=y+(R()-.5)*S*.9,X=Math.round(px),Z=Math.round(pz),wd=dm196Wd(X,Z);
    if(wd==null||wd<1.05||wd>8.5||MAP[Z][X]!=='#'||!(MAP.DW[Z*W+X]<-.6))continue;if(R()>1.05-wd*.06)continue;
    const r=Math.hypot(px-T.cx,pz-T.cy),ri=dm196Room(px,pz,D.FR+1),pi=ri>=0?ri:dm196Path(px,pz,D.FR+1),th=pi>=0&&(ri>=0||r>D.RM+4)?pi:-1;
    const k=th>=0?DM196_THEME[th][Math.floor(R()*3)]:(R()<.62?'pine':R()<.75?'dead':'oak'),s=(th==3?.85:1)*(.9+R()*.55)*(1+Math.min(.35,(wd-1)*.05)),ry=R()*6.283;
    const tint=th>=0?DM196_TINT[th][R()<.5?0:1]:[0x9aa896,0xb0bca8,0x8a9888][Math.floor(R()*3)];
    pick.push({x:px,z:pz,k,s,ry,tint,sec:Math.floor((Math.atan2(px-T.cx,pz-T.cy)+Math.PI)/6.283*12)%12})}
  // one instanced mesh per kind and sector; each sector's geometry carries the bounds of its own trees
  const by={},m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),c=new THREE.Color();pick.forEach(p=>{(by[p.k+'|'+p.sec]=by[p.k+'|'+p.sec]||[]).push(p)});
  const mat=DM196P.mat||(DM196P.mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,flatShading:true}));mat.userData.lps=1;
  Object.keys(by).forEach(key=>{const L=by[key],base=dm196Kind(key.split('|')[0]),g=base.clone();let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
    L.forEach(p=>{x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);z0=Math.min(z0,p.z);z1=Math.max(z1,p.z)});
    const hgt=(base.boundingBox.max.y)*1.5;g.boundingSphere=new THREE.Sphere(new THREE.Vector3((x0+x1)/2,T.ph+hgt/2,(z0+z1)/2),Math.hypot(x1-x0,z1-z0,hgt)/2+4);
    const im=new THREE.InstancedMesh(g,mat,L.length);
    L.forEach((p,i)=>{e.set(0,p.ry,0);q.setFromEuler(e);m4.compose(new THREE.Vector3(p.x,GH(p.x,p.z)-.15,p.z),q,new THREE.Vector3(p.s,p.s,p.s));im.setMatrixAt(i,m4);c.setHex(p.tint);im.setColorAt(i,c)});
    im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
    // the instanced mesh sits at the origin: its bounds are the trees' own (world) bounds
    im.geometry.boundingSphere=g.boundingSphere;im.receiveShadow=true;im.castShadow=false;im.userData.lpsSkip=1;im.userData.dm196=1;im.name='dm196forest';scene.add(im);DM196P.trees.push(im)});
  DM196P.n=pick.length}
// the forest's far side: a dark wall of undergrowth and trunks standing on the edge of the ground (where the void begins), so
// nothing of the sky shows between the trees at eye height; it fades into the fog like the woods behind it
function dm196Backdrop(){const D=DM196,P=[],C=[],c0=new THREE.Color(0x0c140e),c1=new THREE.Color(0x1a2a1c),T=TOWNS[0];
  const g=(x,y)=>{if(x<D.x0||y<D.y0||x>=D.x0+D.nx||y>=D.y0+D.ny)return 99;return MAP.DW[y*W+x]};
  const quad=(ax,az,bx,bz)=>{const ya=GH(ax,az)-2.5,yb=GH(bx,bz)-2.5,h=15+2*Math.sin(ax*.7+az*.3);P.push(ax,ya,az,bx,yb,bz,bx,yb+h,bz,ax,ya,az,bx,yb+h,bz,ax,ya+h,az);[0,0,1,0,1,1].forEach(t=>{const q=c0.clone().lerp(c1,t);C.push(q.r,q.g,q.b)})};
  for(let y=D.y0;y<D.y0+D.ny-1;y++)for(let x=D.x0;x<D.x0+D.nx-1;x++){const a=g(x,y)<0;if(a!==(g(x+1,y)<0))quad(x+.5,y-.5,x+.5,y+.5);if(a!==(g(x,y+1)<0))quad(x-.5,y+.5,x+.5,y+.5)}
  if(!P.length)return;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));geo.computeVertexNormals();geo.computeBoundingSphere();
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:true}));m.userData.lpsSkip=1;m.name='dm196backdrop';m.castShadow=false;m.receiveShadow=false;scene.add(m);DM196P.bd=m}
// ---------------- the entryways ----------------
// the frame of entry i in world coords: c = centre of the arch on the path, f = the way in (unit, from the meadow toward the room)
function dm196EntF(i){const T=TOWNS[0],c=DM196.rooms[i],L=Math.hypot(c[0],c[1]),f=[c[0]/L,c[1]/L],r=DM196.RM+.6;return {x:T.cx+f[0]*r,z:T.cy+f[1]*r,f,ry:Math.atan2(f[0],f[1])}}
function dm196ArchK(k,i){const col=PMAP[i].col,dc=[0x5a5e4a,0x8a8a7a,0xa8b4c0,0xb88a62,0x4e4e56,0x4a3436][i],S=(c,f)=>dkShade(c,f),R=k.R,w=DM196.cw+.55;
  // two piers, a round arch of voussoirs, a keystone with the portal's colour, ivy and moss
  [-1,1].forEach(s=>{twStones(k,S(dc,.92),s*w-.45,0,s*w+.45,0,0,3.4,.9,.5);k.as('ashlar',()=>{k.p('c',S(dc,1.08),'box',s*w,3.45,0,1.2,.16,1.15,0,0,0,.03);k.p('c',S(dc,.8),'box',s*w,.14,0,1.25,.28,1.2,0,0,0,.03)});
    for(let j=0;j<5;j++)k.as('leaf',()=>k.p('c',[0x24402a,0x2e4a30,0x35602e][j%3],'ico',s*(w+.52),.5+j*.6,(R()-.5)*.5,.16,.42,.3,0,R()*3,0,.12))});
  const n=11;for(let j=0;j<n;j++){const a=Math.PI*(j+.5)/n,x=Math.cos(a)*w,y=3.5+Math.sin(a)*w*.72;k.as('ashlar',()=>k.p('c',S(dc,j==5?1.15:.95+R()*.1),'box',x,y,0,.62,.5,1.0,0,0,a-Math.PI/2,.05))}
  k.p('m',col,'oct',0,3.5+w*.72+.42,.52,.22,.3,.12);k.p('m',col,'oct',0,3.5+w*.72+.42,-.52,.22,.3,.12);
  for(let j=0;j<8;j++){const a=Math.PI*(.1+j*.1);k.as('leaf',()=>k.p('c',[0x24402a,0x35602e,0x2e4a30][j%3],'ico',Math.cos(a)*(w+.3),3.5+Math.sin(a)*w*.72+.35,(R()-.5)*.4,.28,.18,.4,0,R()*3,0,.12))}}
function dm196SealK(k,i){const R=k.R,w=DM196.cw+.1,root=[0x2a2018,0x33261c,0x241a14][i%3],thorn=0x4a4036;
  // a tangle of thick roots grown across the way, fallen stones at its foot, iron chains and a sealed lock in the portal's colour
  for(let j=0;j<14;j++){const y0=.1+R()*3.2,a=(R()-.5)*1.2,x0=-w,x1=w,dz=(R()-.5)*.5;k.as('bark',()=>k.L('c',R()<.5?root:0x1e1610,[x0,y0,dz],[x1,y0+Math.tan(a)*2*w*.35,dz+(R()-.5)*.4],.1+R()*.12,'log'))}
  for(let j=0;j<20;j++){const x=(R()-.5)*2*w,y=.2+R()*3.3;k.L('c',thorn,[x,y,.15],[x+(R()-.5)*.2,y+.25,.42+R()*.2],.03,'cone6')}
  for(let j=0;j<7;j++)k.as('stone',()=>k.p('c',[0x5a5662,0x4e4a54,0x66626c][j%3],'dod',(R()-.5)*2*w,.25+R()*.2,.2+(R()-.5)*.6,.4+R()*.3,.3+R()*.25,.4+R()*.3,0,R()*3,0,.18));
  [[-w,2.6,w,1.0],[-w,1.1,w,2.5]].forEach(([x0,y0,x1,y1])=>{const n=12;for(let j=0;j<n;j++){const t=(j+.5)/n;k.p('m',TWC.iron,'box',x0+(x1-x0)*t,y0+(y1-y0)*t-.12*Math.sin(t*Math.PI),.48,.14,.07,.04,0,0,Math.atan2(y1-y0,x1-x0)+(j%2)*1.57,0)}});
  k.p('m',TWC.iron,'box',0,1.8,.52,.42,.5,.12,0,0,0,.04);k.p('g',PMAP[i].col,'oct',0,1.8,.6,.12,.14,.06)}
function dm196Entries(){const T=TOWNS[0];
  for(let i=0;i<6;i++){const E=dm196EntF(i),kA='DM196ARCH|'+i,kS='DM196SEAL|'+i;let ka=null,ks=null;if(!twHas(kA)){ka=twKit(1601+i*7);dm196ArchK(ka,i)}
    const g=twGroup(ka,kA);g.position.set(E.x,GH(E.x,E.z),E.z);g.rotation.y=E.ry;g.name='dm196arch';g.userData.lpsSkip=1;scene.add(g);
    sign(g,[{t:'Portal '+['I','II','III','IV','V','VI'][i]+' · '+PMAP[i].n,f:'700 40px'}],2.6,.5,['#1e2a16','#2a3a1a','#1a2a3a','#4a3018','#1a1e22','#2a0c10'][i],'#f4ead0','#c9a24a',0,3.0,-.56,Math.PI,512,100);
    // the piers are solid
    const lat=[-E.f[1],E.f[0]],w=DM196.cw+.55;[-1,1].forEach(s=>{const x=E.x+lat[0]*s*w,z=E.z+lat[1]*s*w;for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)if(dx*dx+dz*dz<2)CBLK.add(Math.round(z+dz*.4)*W+Math.round(x+dx*.4))});
    DM196P.arch[i]=g;
    if(i==0){DM196P.seal[i]=null;continue}
    if(!twHas(kS)){ks=twKit(1701+i*7);dm196SealK(ks,i)}const sg=twGroup(ks,kS);sg.position.copy(g.position);sg.rotation.y=E.ry;sg.name='dm196seal';sg.userData.lpsSkip=1;scene.add(sg);
    const tiles=[];for(let a=-.8;a<=1.4;a+=.4)for(let b=-DM196.cw-.4;b<=DM196.cw+.4;b+=.4){const x=E.x+E.f[0]*a+lat[0]*b,z=E.z+E.f[1]*a+lat[1]*b,t=Math.round(z)*W+Math.round(x);if(tiles.indexOf(t)<0)tiles.push(t)}
    DM196P.seal[i]={g:sg,tiles,open:null,i,x:E.x,z:E.z}}
  dm196SealSync(true)}
// sealed while the portal is locked; opening it (not at load) shakes the roots loose with a burst of dust
function dm196SealSync(quiet){DM196P.seal.forEach(S=>{if(!S)return;const op=!!pUnlocked(S.i);if(S.open===op)return;const was=S.open;S.open=op;S.g.visible=!op;
  S.tiles.forEach(t=>{if(op)CBLK.delete(t);else CBLK.add(t)});
  if(op&&was===false&&!quiet){try{const v=new THREE.Vector3(S.x,GH(S.x,S.z)+1.2,S.z);burst(v,0x8a7a62,40,3,3,1.2);say('🌿 The way to Portal '+['I','II','III','IV','V','VI'][S.i]+' · '+PMAP[S.i].n+' is open.')}catch(_){}}
  if(!op){try{const p=pl.position;if(S.tiles.indexOf(Math.round(p.z)*W+Math.round(p.x))>=0)toPos(S.x-dm196EntF(S.i).f[0]*2.5,S.z-dm196EntF(S.i).f[1]*2.5)}catch(_){}}})}
{const f=portalRefresh;portalRefresh=function(){const r=f.apply(this,arguments);try{if(DM196P.built)dm196SealSync(false)}catch(e){console.warn('v196 seals',e)}return r}}
// a sealed entry tells who must fall
{const f=worldPrompt;worldPrompt=function(){try{const P=pl.position;for(const S of DM196P.seal){if(!S||S.open)continue;if(Math.hypot(P.x-S.x,P.z-S.z)<3.4){const i=S.i;
    return {label:'🔒 Portal '+['I','II','III','IV','V','VI'][i]+' is sealed · defeat '+BOSSES[i-1].name+' in '+PMAP[i-1].n,fn:()=>openX('bosses')}}}}catch(_){}return f.apply(this,arguments)}}
// ---------------- the Portal Road is gone ----------------
function dm196NoRoad(){try{if(TWN101.arch){scene.remove(TWN101.arch);TWN101.arch=null;TWN101.board=null;TWN101.bs=null}
  (TWN101.seg||[]).forEach(q=>{if(q&&q.g)scene.remove(q.g)});TWN101.seg=[];
  const T=TOWNS[0],X=PCOURT[0],AY=PCOURT[1]+3;[-1,1].forEach(s=>{for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)CBLK.delete(Math.round(AY+dz*.5)*W+Math.round(X+s*3.4+dx*.5))});
  for(let dz=0;dz<=3;dz++)CBLK.delete(Math.round(AY-4.0+dz*.7)*W+Math.round(X-5.5));
  // the road's lantern posts (every 9 tiles south of the old gate, both sides)
  const y0=T.cy+(T.sz||51)+2;for(let y=y0+6;y<=y0+200;y+=9)[-1,1].forEach(s=>CBLK.delete(Math.round(y)*W+Math.round(X+s*2.7)))}catch(e){console.warn('v196 road',e)}}
TWN101_road=function(){};TWN101_board=function(){};
// the world map and minimap: the portals only (no South Ward, no Portal Road labels)
TWN100_wmap=function(g,P,lab){PMAP.forEach((p,i)=>{const q=TWN100_PG[i],[x,y]=P(q.x,q.y),u=pUnlocked(i),c='#'+p.col.toString(16).padStart(6,'0');g.fillStyle=u?c:'#4a4a52';g.beginPath();g.arc(x,y,7,0,6.28);g.fill();g.strokeStyle='#000';g.lineWidth=1.5;g.stroke();
  lab((u?'🌀 ':'🔒 ')+['I','II','III','IV','V','VI'][i]+' · '+p.n,x,y+20,u?'#efe6ff':'#9a96a6')})};
// ---------------- signs: the title only ----------------
// owner: "touch up all signs and remove all the descriptors on each sign. Keep them simple with just the title."
{const f=signPaint;signPaint=function(c,lines,bg,fg,bd,np){const L=Array.isArray(lines)&&lines.length>1?[Object.assign({},lines[0],{f:(lines[0].f||'700 40px').replace(/\d+px/,m=>Math.round(parseInt(m)*1.18)+'px')})]:lines;return f.call(this,c,L,bg,fg,bd,np)}}
function dm196Signs(){try{(SGNR||[]).forEach(r=>{if(r&&r.c&&r.a&&Array.isArray(r.a[0])&&r.a[0].length>1){signPaint(r.c,...r.a);r.t.needsUpdate=true}})}catch(e){console.warn('v196 signs',e)}}
// ---------------- build ----------------
try{dm196NoRoad();dm196Forest();dm196Backdrop();dm196Entries();dm196Signs();DM196P.built=1;portalRefresh()}catch(e){console.warn('v196 rooms',e)}
