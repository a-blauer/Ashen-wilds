// ================= v196: Duskhold in a round meadow — the kingdom's walls, tiles, outskirts and dressing =================
// Owner (Nov 3 2026): "Instead of a floating rock, I want the landmass to be field or meadow surrounded by tall trees (trees will be
// the edge of the map) ... the landmass to be circular ... Duskhold also seems a bit crowded when full upgraded so make it grow larger."
// The map itself is drawn in 0045 (DM196: meadow, forest, the six portal rooms and the paths to them; lots DM196_LOT in rings).
// This file replaces the rectangle-based kingdom code with the round one:
//  * kf109() keeps its shape ({s, WX, SZ}) for older callers, with WX = SZ = R, the radius of the round walls at stage s
//    (DM196.WR: 21 · 30 · 30.5 · 31 · 31.5 · 40). kfIn109 / kfAve109 test the circle and the two avenues (north and south gates).
//  * the wall ring is a circle of straight wall stretches (kdSegK) between towers, two gatehouses (north: portals I-III,
//    south: IV-VI); the map tiles follow (dm196Tiles: 'W' ring, open gates, the lots).
//  * the outskirts (harvestable pines, dead trees, rocks, bushes and grass, gathered once: 3074) fill the meadow between the walls
//    and the forest; the lantern posts, benches and crates, the market stalls and the kingdom buildings (1850) move to the rings.
//  * everything the old square left in the town group (the v83 Trading Post and Tavern, gates, signposts, side towers) is hidden
//    except the fountain; the new buildings come from 3630.
// Old saves: building lots keep their ids (the buildings simply stand in the new rings); a hero standing where the old town was is
// moved to the plaza (TWN100_fixPos). The outskirts' gathered list (x2.out148) belonged to the old candidates and starts over.
var DM196S={R:-1};
function dm196WR(s){return DM196.WR[Math.max(0,Math.min(5,s|0))]}
kf109=function(){if(typeof KF109=='undefined'||!KF109)return {s:-1,WX:DM196.WR[5],SZ:DM196.WR[5],R:DM196.WR[5]};const s=KF109.s>=0?KF109.s:kfStage109(),R=dm196WR(s);return {s,WX:R,SZ:R,R}};
kfIn109=function(x,z,m){return Math.hypot(x,z)<kf109().R-.9-(m||0)};
kfAve109=function(x,z,m){m=m||0;const r=Math.hypot(x,z);return Math.abs(x)<KF109_AVE+m&&r>10.5-m&&r<kf109().R+m};
TWN100_L=function(){const T=TOWNS[0],F=kf109();return {T,R:TS,WX:F.R,IW:F.R,SZ:F.R,st:F.s}};
// ---------------- the walls ----------------
// angle a (clockwise from north) on the ring of radius R, town-local
function dm196P(a,R){return [R*Math.sin(a),-R*Math.cos(a)]}
var DM196_GZ=1.85; // half the gate opening
function dm196Ring(R){const gA=Math.asin(DM196_GZ/R),n=Math.max(6,Math.round((Math.PI-2*gA)*R/4.4)),seg=[],tw=[];
  [0,1].forEach(h=>{const a0=h*Math.PI+gA,a1=(h+1)*Math.PI-gA;for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/n,b=a0+(a1-a0)*(i+1)/n;seg.push({a,b,h:(Math.cos((a+b)/2)>0)?0:1})}
    for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,big=i>0&&i<n&&i%Math.max(2,Math.round(n/3))==0;if(i==0||i==n||big||i%2==0)tw.push({a,big,gate:i==0||i==n,h:Math.cos(a)>0?0:1})}});
  return {seg,tw,gA}}
TWN100_ringK=function(k,lv,part){const R=kf109().R,G=dm196Ring(R);
  G.seg.forEach(s=>{if(s.h!==part)return;const p=dm196P(s.a,R),q=dm196P(s.b,R),dx=q[0]-p[0],dz=q[1]-p[1],L=Math.hypot(dx,dz);k.at((p[0]+q[0])/2,0,(p[1]+q[1])/2,()=>kdSegK(k,lv,L+.35),Math.atan2(-dz,dx))});
  G.tw.forEach((t,i)=>{if(t.h!==part)return;const [x,z]=dm196P(t.a,R);k.at(x,0,z,()=>t.big?TWN100_tower(k,lv,1.45,4.2):TWN100_tower(k,lv,t.gate?1.05:.95,t.gate?3.6:3.1),t.a*1.7+i)});
  // the gatehouses: north (part 0) and south (part 1); the town is on the gate's local +x
  if(part==0)k.at(0,0,-R,()=>kdGateK(k,lv),-Math.PI/2);else k.at(0,0,R,()=>kdGateK(k,lv),Math.PI/2)};
kdWalls=function(T,lv){const K=kdState(),o=kdOld(T);if(K.wg){T.g.remove(K.wg);K.wg=null}
  o.gate.forEach(q=>q.visible=false);o.tw.forEach(q=>q.visible=false);o.ban.forEach(q=>q.visible=false);
  const g=new THREE.Group(),F=kf109();g.name='kdWalls';
  [0,1].forEach(part=>{const key='TWNRING196|'+lv+'|'+part+'|'+F.R;let k=null;if(!twHas(key)){k=twKit(611+lv*3+part);const ts=twStones;twStones=TWN100_coarse;try{TWN100_ringK(k,lv,part)}finally{twStones=ts}}const pg=twGroup(k,key);pg.name='kdWalls'+part;g.add(pg)});
  K.wg=g;T.g.add(g);K.wst=F.s;
  const cols=[],lamps=[],G=dm196Ring(F.R);G.tw.forEach(t=>{const [x,z]=dm196P(t.a,F.R);cols.push({x:T.cx+x,z:T.cy+z,r:t.big?1.45:t.gate?1.05:.95})});
  [-1,1].forEach(gz=>[-1,1].forEach(q=>{lamps.push([T.cx+q*2.75,T.ph+1.2,T.cy+gz*(F.R-1.25)]);if(lv>=3)lamps.push([T.cx+q*2.75,T.ph+1.2,T.cy+gz*(F.R+1.25)])}));
  kdCol(T,K.wcol=K.wcol||[],cols);K.wl=lv;return lamps};
// the ring's two halves are drawn only within ~56 tiles of their half
{const f0=townTick;townTick=function(now,pp){f0.apply(this,arguments);try{const K=KGD,T=TOWNS[0];if(!K||!K.wg||!T.g.visible)return;const z=pp.z-T.cy;
  K.wg.children.forEach((g,i)=>{g.visible=i==0?z<56:z>-56})}catch(_){}}}
// ---------------- map tiles: the wall ring, the open gates, the lots ----------------
kfTiles109=function(F){const T=TOWNS[0],RX=Math.ceil(DM196.WR[5]+2);
  if(!KF109.base){KF109.base=new Map();for(let dz=-RX;dz<=RX;dz++)for(let dx=-RX;dx<=RX;dx++){const x=T.cx+dx,y=T.cy+dz,t=y*W+x;let b=MAP[y][x];if(b=='W'||(b=='B'&&KL103.tiles.has(t)))b=Math.hypot(dx,dz)<11.2||Math.abs(dx)<1.6?'P':'.';KF109.base.set(t,b)}}
  const R=F.R;for(let dz=-RX;dz<=RX;dz++)for(let dx=-RX;dx<=RX;dx++){const x=T.cx+dx,y=T.cy+dz,t=y*W+x,b=KF109.base.get(t);if(b==null||b=='#')continue;const r=Math.hypot(dx,dz);let c=b;
    if(Math.abs(r-R)<.8)c=Math.abs(dx)<DM196_GZ-.25?(b=='B'?'P':b):'W';
    if(c!='W'&&KL103.tiles.has(t))c='B';
    if(MAP[y][x]!==c){MAP[y][x]=c;try{mmPaint(x,y)}catch(_){}}}};
// the plaza's flagstones only (the streets are paved in the ground's own paint)
kfPave109=function(){const T=TOWNS[0];if(T.pave){if(T.pave.parent)T.pave.parent.remove(T.pave);try{T.pave.material.dispose()}catch(_){}T.pave=null}
  const R=dkRng(77),L=[];for(let y=T.cy-42;y<=T.cy+42;y++)for(let x=T.cx-42;x<=T.cx+42;x++){if(MAP[y]&&MAP[y][x]=='P'&&Math.hypot(x-T.cx,y-T.cy)>2.6)L.push([x,y])}
  if(!L.length)return;if(!KF109.pg){const g=new THREE.CircleGeometry(.5,6);g.rotateX(-Math.PI/2);const pa=g.attributes.position;for(let i=1;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),h=twH(Math.round(x*50),0,Math.round(z*50),5);pa.setX(i,x*(.86+h*.26));pa.setZ(i,z*(.86+h*.26))}
    const n=g.toNonIndexed();n.computeVertexNormals();n.userData.lps=1;KF109.pg=n}
  const m=new THREE.InstancedMesh(KF109.pg,new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),L.length*2),d=new THREE.Object3D(),c=new THREE.Color();m.material.userData.lps=1;
  let i=0;L.forEach(([x,y])=>{const two=R()<.4;for(let j=0;j<(two?2:1);j++){const ox=two?(j?.24:-.24):(R()-.5)*.12,oz=(R()-.5)*(two?.4:.12);d.position.set(x+ox,GH(x+ox,y+oz)+.025+j*.004,y+oz);d.rotation.set((R()-.5)*.05,R()*6.28,(R()-.5)*.05);
    const s=two?.55+R()*.18:.86+R()*.3;d.scale.set(s,1,s*(.8+R()*.3));d.updateMatrix();m.setMatrixAt(i,d.matrix);const v=.62+R()*.32,w=R();c.setRGB(.44*v*(1+w*.08),.42*v,.41*v*(1.06-w*.08));m.setColorAt(i,c);i++}});
  m.count=i;m.receiveShadow=true;m.castShadow=false;m.userData.lpsSkip=1;m.name='pave109';scene.add(m);T.pave=m};
// ---------------- doors reachable (v109's flood fill, inside the round walls) ----------------
kfDoors109=function(){const T=TOWNS[0],F=kf109(),st=.5,R=F.R,x0=-R,z0=-R,nx=Math.floor(2*R/st)+1,nz=nx,seen=new Uint8Array(nx*nz),q=[];
  const free=(i,j)=>{const lx=x0+i*st,lz=z0+j*st;if(Math.hypot(lx,lz)>R-.6)return false;const x=T.cx+lx,z=T.cy+lz;return !solid(x,z)&&!tcHit(x,z)};
  const at=(x,z)=>{const i=Math.round((x-T.cx-x0)/st),j=Math.round((z-T.cy-z0)/st);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i};
  let s0=at(T.sp[0],T.sp[1]);if(s0<0)return [];seen[s0]=1;q.push(s0);
  while(q.length){const c=q.pop(),i=c%nx,j=(c/nx)|0;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const k=jj*nx+ii;if(seen[k])continue;seen[k]=free(ii,jj)?1:2;if(seen[k]==1)q.push(k)}}
  const reach=(x,z)=>{for(let dz=-1;dz<=1;dz+=st)for(let dx=-1;dx<=1;dx+=st){if(dx*dx+dz*dz>1.01)continue;const k=at(x+dx,z+dz);if(k>=0&&seen[k]==1)return true}return false};
  const bad=[];for(const k in SH.pos){if(!lotBuilt103(k))continue;const l=lotOf103(k);if(!l)continue;const [x,z]=lotDoor103(l);if(Math.hypot(x-T.cx,z-T.cy)>R-.9||!reach(x,z))bad.push(k)}return bad};
// ---------------- lantern posts, benches, crates (ward dressing) ----------------
// lantern posts on the inner side of the walls (every ~24 degrees, clear of the gates and the lots) and round the plaza's edge
TWN100_lpFor=function(F){const L=[],R=F.R||F.SZ,lotHit=(x,z,p)=>dm196LotHit(x,z,p);
  for(let d=12;d<360;d+=24){const a=d*Math.PI/180;if(Math.abs(Math.sin(a))*(R-1.3)<4.2)continue;const [x,z]=dm196P(a,R-1.3);if(!lotHit(x,z,.9))L.push([x,z])}
  [30,90,150,210,270,330].forEach(d=>{const [x,z]=dm196P(d*Math.PI/180,11.6);if(!lotHit(x,z,1.1)&&Math.abs(x)>2.2)L.push([x,z])});
  L.push([-2.6,-(R-2.4)],[2.6,-(R-2.4)],[-2.6,R-2.4],[2.6,R-2.4]);return L};
TWN100_WD={crate:[[-6.4,-8.6,0],[6.6,-8.4,1]],bench:[[-5.9,6.4,-.65],[5.9,6.4,.65]],benchZ:0};
TWN100_wardK=function(k,F){const lampK=(x,z,ry)=>k.at(x,0,z,()=>{const h=2.3;k.as('bark',()=>k.L('c',TWC.woodD,[0,0,0],[0,h+.2,0],.08,'log'));k.p('c',TWC.stoneD,'dod',0,.12,0,.2,.14,.2);
      k.as('wood',()=>k.L('c',TWC.woodD,[0,h+.05,0],[.36,h+.05,0],.04,'box'));k.L('m',TWC.iron,[.32,h+.05,0],[.32,h-.1,0],.012,'cyl6',0);
      const lx=.32,ly=h-.28;k.p('m',TWC.iron,'cone4',lx,ly+.2,0,.17,.13,.17,0,Math.PI/4,0,0);k.p('m',TWC.iron,'box',lx,ly-.16,0,.2,.04,.2,0,0,0,0);
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>k.p('m',TWC.iron,'box',lx+q[0]*.09,ly,q[1]*.09,.025,.32,.025,0,0,0,0));k.p('g',0xffd27a,'oct',lx,ly,0,.1,.15,.1)},ry);
  // the lamp arm points toward the plaza
  TWN100_lpFor(F).forEach(([x,z])=>lampK(x,z,Math.atan2(z,-x)));
  TWN100_WD.crate.forEach(([x,z,b])=>{if(b)TWN100_barrel(k,x,z,1);else{TWN100_crate(k,x,z,.62,.2);TWN100_crate(k,x-.1,z+.1,.4,.6);k.at(0,.62,0,()=>TWN100_crate(k,x,z,.38,1.1))}});
  TWN100_WD.bench.forEach(([x,z,ry])=>k.at(x,0,z,()=>{k.as('bark',()=>k.L('c',0x6a4a2e,[-.75,.42,0],[.75,.42,0],.16,'cyl6'));k.as('board',()=>k.p('c',0x7a5a3a,'box',0,.5,0,1.5,.07,.34,0,0,0,.06));
    [-.55,.55].forEach(s=>{k.as('bark',()=>k.L('c',TWC.woodD,[s,0,0],[s,.38,0],.13,'log'));k.as('wood',()=>k.L('c',TWC.woodD,[s,.45,-.17],[s,.95,-.24],.05,'box'))});k.as('board',()=>k.p('c',0x6a4a2e,'box',0,.85,-.23,1.5,.18,.06,-.12,0,0,.06))},ry))};
kfWard109=function(F){const T=TOWNS[0];if(KF109.ward){T.g.remove(KF109.ward);KF109.ward=null}
  KF109.wardLamps.forEach(l=>{const i=TLAMP.indexOf(l);if(i>=0)TLAMP.splice(i,1)});KF109.wardLamps=[];
  TWN100_LP=TWN100_lpFor(F);const key='TWNWARD196|'+F.s;let k=null;if(!twHas(key)){k=twKit(951+F.s);TWN100_wardK(k,F)}const g=twGroup(k,key);g.name='wardDress';T.g.add(g);KF109.ward=g;
  const cols=[];TWN100_LP.forEach(([x,z])=>{const a=Math.atan2(z,-x),lx=x+Math.cos(a)*.32,lz=z-Math.sin(a)*.32,l=[T.cx+lx,T.ph+2.0,T.cy+lz];TLAMP.push(l);KF109.wardLamps.push(l);cols.push({x:T.cx+x,z:T.cy+z,r:.2})});
  TWN100_WD.crate.forEach(([x,z,b])=>cols.push({x:T.cx+x,z:T.cy+z,r:b?.36:.45}));TWN100_WD.bench.forEach(([x,z])=>cols.push({x:T.cx+x,z:T.cy+z,r:.6}));kfColSet109(KF109.wardCol,cols)};
// ---------------- the two market stalls: on the plaza's north-east edge ----------------
KF109_STALL=[[8.6,-4.2,0x7a3a2a,-1.15],[9.6,1.0,0x2a3a7a,-1.6]];
kfStalls109=function(){const T=TOWNS[0];if(KF109.stalls)return;const g=new THREE.Group();g.name='stalls109';
  KF109_STALL.forEach(([x,z,c,ry])=>{const st=new THREE.Group();st.position.set(x,0,z);st.rotation.y=ry;twStall(st,c);g.add(st)});
  {let k=null;if(!twHas('STALL196X')){k=twKit(977);TWN100_crate(k,10.2,-6.2,.55,.3);TWN100_crate(k,10.6,-5.5,.4,.9);TWN100_barrel(k,10.9,3.2,.9)}g.add(twGroup(k,'STALL196X'))}
  T.g.add(g);KF109.stalls=g;kfColSet109(KF109.stallCol,KF109_STALL.map(([x,z])=>({x:T.cx+x,z:T.cy+z,r:.95})).concat([{x:T.cx+10.4,z:T.cy-5.9,r:.55},{x:T.cx+10.9,z:T.cy+3.2,r:.3}]))};
// ---------------- the old square's dressing: everything except the fountain stays hidden ----------------
kfLegacy109=function(F){const T=TOWNS[0];
  if(!KF109.leg){const K=typeof KGD!='undefined'&&KGD||{},own=new Set([].concat(K.wcol||[],K.pcol||[],...Object.values(K.up||{}).map(u=>u.col||[]),...Object.values(DC103.col||{}),
      ...Object.values(typeof HS103!='undefined'&&HS103?HS103.g:{}).map(o=>o.c||[]),...Object.values(TWN100_S.col||{}),KF109.wardCol,KF109.stallCol,KF109.wcol,DM196S.col||[]));
    const skip=new Set([K.wg,KF109.ward,KF109.stalls,K.pg].filter(Boolean));Object.values(K.up||{}).forEach(u=>{if(u.g)skip.add(u.g)});
    const inSq=(x,z)=>Math.abs(x)<44&&Math.abs(z)<56;
    KF109.leg={g:T.g.children.filter(o=>!skip.has(o)&&(Math.abs(o.position.x)+Math.abs(o.position.z)>.5)&&inSq(o.position.x,o.position.z)&&!/^kd|^deco|^house|^wardDress|^stalls109|^kfwild|^dm196/.test(o.name||'')).map(o=>({o,v:o.visible})),
      c:T.col.filter(c=>!own.has(c)&&inSq(c.x-T.cx,c.z-T.cy)&&Math.hypot(c.x-T.cx,c.z-T.cy)>2.8).map(c=>({c}))}}
  KF109.leg.g.forEach(q=>{q.o.visible=false});
  KF109.leg.c.forEach(q=>{const i=T.col.indexOf(q.c);if(i>=0)T.col.splice(i,1)})};
// ---------------- lots: a hit test against every lot and fixed building footprint ----------------
var DM196L=null;function dm196L(){return DM196L||(DM196L=dm196Lots())}
function dm196LotHit(x,z,p){p=p||0;return dm196L().some(l=>{const fx=Math.sin(l.ry),fz=Math.cos(l.ry),dx=x-l.x,dz=z-l.z,u=dx*fz-dz*fx,v=dx*fx+dz*fz;return Math.abs(u)<(l.w||3.5)+p&&Math.abs(v)<(l.d||3.5)+p})}
// the spots kept clear for paths: the avenues, each lot's door yard, the gates and the room paths
function dm196Way(x,z,p){p=p||0;const r=Math.hypot(x,z);if(Math.abs(x)<KF109_AVE+p&&r>9)return true;
  return dm196L().some(l=>{const d=[l.x+Math.sin(l.ry)*((l.d||3.5)+1),l.z+Math.cos(l.ry)*((l.d||3.5)+1)];return Math.hypot(x-d[0],z-d[1])<1.8+p})}
// ---------------- the outskirts: between the walls and the forest ----------------
KF109_NOWILD.length=0;
kfWildCand109=function(){if(KF109.cand)return KF109.cand;const T=TOWNS[0],R=dkRng(4242),L=[];
  const ents=TWN100_RD.map(L2=>[L2[0][0]-T.cx,L2[0][1]-T.cy]);
  for(let z=-46;z<=46;z+=2.5)for(let x=-46;x<=46;x+=2.5){const px=x+(R()-.5)*2.1,pz=z+(R()-.5)*2.1,u=R(),s=.75+R()*.6,ry=R()*6.28,r=Math.hypot(px,pz);
    if(r>DM196.RM-1.6||r<DM196.WR[0]+2.6)continue;const X=Math.round(T.cx+px),Z=Math.round(T.cy+pz),t=MAP[Z]&&MAP[Z][X];if(!(t=='.'||t=='g'||t=='a'))continue;
    if(Math.abs(px)<4.4||ents.some(e=>Math.hypot(px-e[0],pz-e[1])<6))continue;
    const ar=Math.abs(dm196Ang(px,pz))*180/Math.PI;if(r>41.3&&r<44.1&&(ar<31||ar>149))continue; // the outer path between the gates and the rooms
    L.push({x:px,z:pz,t:u<.3?(u<.12?'dead':'pine'):u<.5?'rock':u<.8?'bush':'grass',s,ry})}
  L.forEach((p,i)=>{p.ci=i});return KF109.cand=L};
// v148's outskirts builder with the round walls: inside the walls (and on any lot or the kingdom buildings) nothing grows
kfWild109=function(F){const T=TOWNS[0];if(KF109.wild){T.g.remove(KF109.wild);KF109.wild=null}
  if(OUT148.key&&typeof TWBK!='undefined'&&TWBK[OUT148.key]){try{Object.values(TWBK[OUT148.key]).forEach(g=>g.dispose&&g.dispose())}catch(_){}delete TWBK[OUT148.key]}
  const fixed=T.col.filter(c=>KF109.wcol.indexOf(c)<0&&!(KF109.leg&&KF109.leg.c.some(q=>q.c===c)));
  const keep=kfWildCand109().filter(p=>{if(OUT148.h.has(p.ci))return false;if(Math.hypot(p.x,p.z)<F.R+2.4)return false;if(dm196LotHit(p.x,p.z,1.4)&&Math.hypot(p.x,p.z)<F.R+5)return false;
    if(dm196L().some(l=>l.fix&&l.r>30&&Math.hypot(p.x-l.x,p.z-l.z)<(l.w||3.5)+3.2))return false;
    return !fixed.some(c=>{const dx=T.cx+p.x-c.x,dz=T.cy+p.z-c.z;return c.r!=null?dx*dx+dz*dz<(c.r+1.4)*(c.r+1.4):Math.abs(dx)<c.hx+1.4&&Math.abs(dz)<c.hz+1.4})});
  KF109.wsel={s:F.s,L:keep};const key='KFWILD196|'+F.s+'|'+(OUT148.n=(OUT148.n|0)+1);OUT148.key=key;const k=twKit(4243+F.s),RG=[];
  keep.forEach(p=>{const {x,z,s,ry}=p,a=k.P.length;
    if(p.t=='pine'){k.as('bark',()=>k.L('c',0x3a2a1c,[x,0,z],[x,1.2*s,z],.14*s,'log'));k.as('leaf',()=>[[1.0,1.15,1.5],[1.6,.9,1.25],[2.2,.62,1.0]].forEach(([y,r,h],j)=>k.p('c',[0x1e3626,0x24402a,0x2a4a30][j],'cone6',x,y*s,z,r*s,h*s,r*s,0,ry+j,0,.08)))}
    else if(p.t=='dead'){k.as('bark',()=>{k.L('c',0x2e2620,[x,0,z],[x+.1*s,2.4*s,z+.05],.15*s,'log');k.L('c',0x2e2620,[x+.05,1.5*s,z],[x+.8*s*Math.cos(ry),2.2*s,z+.8*s*Math.sin(ry)],.06*s,'log');k.L('c',0x2e2620,[x+.05,1.9*s,z],[x-.6*s*Math.cos(ry),2.6*s,z-.6*s*Math.sin(ry)],.05*s,'log')})}
    else if(p.t=='rock'){k.as('stone',()=>{k.p('c',[0x5a5662,0x4e4a54,0x66626c][Math.floor(s*7)%3],'dod',x,.22*s,z,.55*s,.42*s,.5*s,0,ry,0,.18);if(s>1)k.p('c',0x4e4a54,'dod',x+.5*s,.12*s,z+.3*s,.3*s,.24*s,.3*s,0,ry*2,0,.2);
      k.as('leaf',()=>k.p('c',0x3a5a2e,'ico',x+.12*s,.42*s,z-.08*s,.3*s,.07*s,.26*s,0,ry,0,.1))})} // v196: moss on the rocks
    else if(p.t=='bush'){k.as('leaf',()=>[[0,0],[.35,.2],[-.3,.25]].forEach(([a,b],j)=>k.p('c',[0x24402a,0x2e4a30,0x35502e][j],'ico',x+a*s,.3*s,z+b*s,.42*s,.34*s,.42*s,0,ry+j,0,.12)));
      [0,1,2].forEach(j=>k.p('c',[0xd8c8e8,0xc87a9a,0xe8d890][(j+Math.round(s*9))%3],'oct',x+Math.cos(ry+j*2.1)*.33*s,.52*s,z+Math.sin(ry+j*2.1)*.33*s,.06,.05,.06))} // v196: wildflowers
    else{for(let j=0;j<3;j++)k.p('c',[0x4a5a34,0x3e5030][j%2],'cone4',x+(j-1)*.15,.18*s,z+(j%2)*.12,.07,.36*s,.07,0,j,(j-1)*.2,.1)}
    RG.push([a,k.P.length])});
  const P=k.P.slice(),g=twGroup(k,key);g.name='kfwild';T.g.add(g);KF109.wild=g;g.traverse(o=>{if(o.isMesh)o.castShadow=false});
  const off={},cnt=P.map(q=>q.geo.attributes.position.count),st=P.map((q,j)=>{const o=off[q.t]|0;off[q.t]=o+cnt[j];return o});
  const M={};g.children.forEach(m=>{for(const t in TWBK[key])if(TWBK[key][t]===m.geometry)M[t]=m.geometry});
  OUT148.rg=keep.map((p,i)=>{const [a,b]=RG[i],L=[];for(let j=a;j<b;j++){const q=P[j];if(M[q.t])L.push([M[q.t],st[j],cnt[j]])}return L});
  kfColSet109(KF109.wcol,keep.map(p=>{if(p.t!='pine'&&p.t!='dead'&&p.t!='rock')return null;const c={x:T.cx+p.x,z:T.cy+p.z,r:p.t=='rock'?.4*p.s:.3};p.col148=c;return c}).filter(Boolean));
  try{if(typeof OUT141!='undefined')OUT141.src=null}catch(_){}};
// the gathered list of an older save belonged to the old candidates
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.dm196=1;return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{if(!(s&&s.dm196)){OUT148.h=new Set();OUT148.hint=0}}catch(_){}return r}}
// ---------------- the kingdom buildings (granary, chapel, barracks, keep) on ring C ----------------
// 1850 builds them at the old square's corners; each site is moved whole (its parts keep their places relative to each other)
var DM196_PR=[{o:[-28.5,40],k:'granary',z:1},{o:[28.6,37.5],k:'chapel',z:1},{o:[-25.5,-17.1],k:'barracks',z:0},{o:[28.1,-16.3],k:'keep',z:0}];
function dm196PrSite(x,z){let b=null,bd=12;DM196_PR.forEach(s=>{const d=Math.hypot(x-s.o[0],z-s.o[1]);if(d<bd){bd=d;b=s}});return b}
// a point of the old layout -> [x, z, extra turn] in the new one (sites turned so their long side runs along the ring)
function dm196PrMap(x,z){const s=dm196PrSite(x,z);if(!s)return null;const l=dm196L().find(q=>q.id==s.k),th=-l.ry,rho=s.z?Math.PI/2-th:-th,c=Math.cos(rho),sn=Math.sin(rho),dx=x-s.o[0],dz=z-s.o[1];
  return [l.x+dx*c+dz*sn,l.z-dx*sn+dz*c,rho]}
{const f=TWN100_prK;TWN100_prK=function(k,lv){const at=k.at,T=TOWNS[0],R=kf109().R;let depth=0;
  k.at=function(x,y,z,fn,ry){if(depth==0){const m=dm196PrMap(x,z);if(m){depth++;try{return at.call(k,m[0],y,m[1],fn,(ry||0)+m[2])}finally{depth--}}
      if(Math.abs(Math.abs(x)-4.4)<.01&&Math.abs(z-13.2)<.01){depth++;try{return at.call(k,x,y,9.6,fn,ry)}finally{depth--}}} // the statues of the fallen flank the plaza's south way
    depth++;try{return at.call(k,x,y,z,fn,ry)}finally{depth--}};
  const bz=kdBrazier;kdBrazier=function(k2,x,z,y0,s){if(depth==0&&Math.abs(z-(TOWNS[0].sz||51))<.01&&Math.abs(Math.abs(x)-2.3)<.01)z=R;return bz.apply(this,[k2,x,z,y0,s])};
  try{return f.apply(this,arguments)}finally{k.at=at;kdBrazier=bz}}}
kdPrestige=function(T,P){const K=kdState(),o=kdOld(T);o.ban.forEach(q=>q.visible=false);let lv=0;TWN100_PR.forEach((t,i)=>{if(P>=t)lv=i+1});const st=kf109().s;if(K.pr===lv&&K.prs===st)return null;K.pr=lv;K.prs=st;
  if(K.pg){T.g.remove(K.pg);K.pg=null}if(!lv){kdCol(T,K.pcol=K.pcol||[],[]);return []}
  const key='KDP196|'+lv+'|'+st;let k=null;if(!twHas(key)){k=twKit(521+lv);TWN100_prK(k,lv)}const g=twGroup(k,key);g.name='kdPrestige';T.g.add(g);K.pg=g;
  const lamps=[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sz])=>[T.cx+sx*4.6,T.ph+1.5,T.cy+sz*4.6]),c=[];
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>c.push({x:T.cx+sx*4.6,z:T.cy+sz*4.6,r:.42}));
  const B=(x,z,hx,hz)=>{const m=dm196PrMap(x,z);if(!m)return;const a=Math.abs(Math.sin(m[2])),q=Math.abs(Math.cos(m[2]));c.push({x:T.cx+m[0],z:T.cy+m[1],hx:hx*q+hz*a,hz:hx*a+hz*q})};
  if(lv>=2){B(-28.5,35.5,1.75,2.1);B(-28.5,44.5,1.45,1.45)}
  if(lv>=3){B(28.6,35.5,2.1,3.0);B(28.6,39.5,1.3,1.3)}
  if(lv>=4){B(-28.6,-16.8,2.5,2.2);B(-22.4,-17.4,1.1,1.1)}
  if(lv>=5){B(24.8,-16.4,2.4,3.4);{const m=dm196PrMap(31.4,-16.2);c.push({x:T.cx+m[0],z:T.cy+m[1],r:1.7})}}
  if(lv>=6)[-1,1].forEach(s=>c.push({x:T.cx+s*4.4,z:T.cy+9.6,r:.75}));
  kdCol(T,K.pcol=K.pcol||[],c);if(lv>=5)[-1,1].forEach(s=>lamps.push([T.cx+s*2.3,T.ph+5.5,T.cy+kf109().R]));return lamps};
// the windmill's sails follow the granary
{const f=TWN100_mill;TWN100_mill=function(T,on){const r=f.apply(this,arguments);try{if(TWN100_MILL&&!TWN100_MILL.dm196){TWN100_MILL.dm196=1;const m=dm196PrMap(-28.5+1.85,44.5);
  TWN100_MILL.position.set(T.cx+m[0],T.ph+5.1,T.cy+m[1]);TWN100_MILL.rotation.y=Math.PI/2+m[2];const a=TANIM.find(q=>q.x===T.cx-28.5+1.85);if(a){a.x=TWN100_MILL.position.x;a.z=TWN100_MILL.position.z}}}catch(e){console.warn('v196 mill',e)}return r}}
// ---------------- names, arriving, old saves ----------------
{const f=areaName;areaName=function(){try{const T=TOWNS[0],x=pl.position.x,z=pl.position.z;if(curMap()<0&&townAt(x,z,0)==0){const RN=['I','II','III','IV','V','VI'],ri=dm196Room(x,z,1),pi=ri>=0?ri:dm196Path(x,z,1);
    if(pi>=0&&Math.hypot(x-T.cx,z-T.cy)>DM196.RM-1)return PMAP[pi].ic+' Portal '+RN[pi]+' · '+PMAP[pi].n;
    if(!kfIn109(x-T.cx,z-T.cy,0))return '🌾 Duskhold · the Meadow';return Math.hypot(x-T.cx,z-T.cy)<11.5?'⛲ Duskhold · the Plaza':'🏰 Duskhold'}}catch(_){}return f.apply(this,arguments)}}
TWN100_fixPos=function(x,z){if(x==null){x=pl.position.x;z=pl.position.z}if(regionAt(Math.round(x),Math.round(z))>=0)return null;if(TWN100_ok(x,z)){if(Math.hypot(pl.position.x-x,pl.position.z-z)>.5)toPos(x,z);return 'kept'}
  for(let r=1;r<7;r++)for(let a=0;a<6.283;a+=.5){const qx=x+Math.cos(a)*r,qz=z+Math.sin(a)*r;if(TWN100_ok(qx,qz)){toPos(qx,qz);return 'near'}}
  toPos(START[0],START[1]);return 'start'};
// a save from before v196 stood in the old town, 16 tiles further west: send it to the plaza
{const f=loadGame;loadGame=function(){const s=typeof saveInfo=='function'?saveInfo():null;const r=f.apply(this,arguments);try{const p=s&&s.pos,x2=s&&s.x2;
  if(p&&!p.realm&&p.x<PM_X0&&!(x2&&x2.dm196)){toPos(START[0],START[1]);TWN100.mig='v196'}}catch(e){console.warn('v196 load',e)}return r}}
// the citizens' walking grid covers the round town (and the meadow round it)
CZ103.x0=-47;CZ103.z0=-47;CZ103.nx=95;CZ103.nz=95;CZ103.ver=-1;CZ103.grid=null;
czGate103=function(){const T=TOWNS[0];return [T.cx,T.cy+kf109().R+3.5]};
czSpots103=function(){const T=TOWNS[0],L=LOT103.map(l=>lotDoor103(l)),F=kf109();
  [0,40,80,120,160,200,240,280,320].forEach(d=>{const p=dm196P(d*Math.PI/180,8.6);L.push([T.cx+p[0],T.cy+p[1]])});
  [20,60,100,140,220,260,300,340].forEach(d=>{const p=dm196P(d*Math.PI/180,20.6);L.push([T.cx+p[0],T.cy+p[1]])});
  if(F.R>31.6)[10,55,100,135,225,260,305,350].forEach(d=>{const p=dm196P(d*Math.PI/180,30.6);L.push([T.cx+p[0],T.cy+p[1]])});
  return L.filter(([x,z])=>kfIn109(x-T.cx,z-T.cy,1))};
// ---------------- apply now (the kingdom was set up by the older files with the old shapes) ----------------
try{KF109.base=null;KF109.cand=null;KF109.wsel=null;KF109.leg=null;if(typeof KGD!='undefined'&&KGD){KGD.wl=-1;KGD.pr=-1}kfApply109(true)}catch(e){console.warn('v196 apply',e)}
// the Steward's plan of the town: framed on the round walls (v103 framed the long square from its north wall)
{const f=lotPlan103;lotPlan103=function(cv,opt){const k0=kf109;kf109=function(){const F=k0();return Object.assign({},F,{WX:F.R,SZ:20})};try{return f.apply(this,arguments)}finally{kf109=k0}}}
