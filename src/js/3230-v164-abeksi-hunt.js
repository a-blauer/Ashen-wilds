// ================= v164 Abeksi (owner): a real fight, eyes that hunt, elite guards at the bell, a gate you can't miss =================
// Owner: "abeksi city residents are too easy when they become aggressive. Also make any abeksi path towards you and attack if you're in
// their line of sight. When the bell tolls, it summons 2 elite guards each time instead." and "make the exit gate in the abeksi city
// much more obvious that it's the escape when you choose to kill your way to the exit, and make it more detailed."
//  * Tougher (ab157Rouse wrapper): guards ×AB164.g (health, attack), townsfolk no longer half-strength (AB157K.civ 1 / .85, was .55 / .6),
//    every city fighter moves ×AB164.spd (walkM wrapper, m.userData.spk164) and attacks AB164.cdK faster (aiLod wrapper), up to
//    AB157K.cap (12, was 10) fighting at once.
//  * They path (eTarget wrapper, ab164Route): a city fighter that cannot see its target walks down the street flow field (AB158.fl,
//    3193) towards it, AB164.look steps ahead at a time, instead of walking into a wall; with the target in sight it goes straight in.
//  * Eyes that hunt (ab164Sight, on the alarm's host every 0.25 s): while the city is roused, any resident on the street who has a
//    clear line of sight (ab152LOS) to a hero within AB164.see tiles joins the hunt (runs the flow field, 3193's ab158Step, and
//    turns into an enemy within AB158.eng steps). Roof folk stay where they are.
//  * The bell (ab158Call redefined): each toll (the first and every AB158.bell.re s after) summons AB164.elN elite guards instead of
//    calling residents: real enemies (elite, a level above the city, a crested helm), placed out of every hero's sight
//    AB164.elR street steps away, hunting at once (e.hunt, e.ab164e). At most AB164.elMax alive. They leave when the city calms.
//  * The gate (ab164GateBuild): the old plank slab (AB152KB.gate) is replaced by a gatehouse porch on the Gate Yard's tower: two
//    carved pylons with serpent reliefs and rearing jade serpents with braziers on top, a stone arch with a serpent-skull keystone,
//    a battlement walk (the tower lamp's guard stands on it now), crimson banners, a mosaic in the porch floor and two iron-bound
//    doors. The plan (ab164Plan) gives the pylons footprints and moves four crates out of the porch. When the bell tolls the doors
//    swing open on a lit passage and the way out is marked everywhere: a pillar of light over the gate (seen over the roofs), a
//    floating "ESCAPE" sign, braziers flaring, glowing chevrons on the street along the shortest way there (AB164.G.dg, a flow
//    field from the porch), an arrow at the screen's edge with the distance (#ab164ga), a mark on the minimap and the tracker line.
//    Everything is local and deterministic (co-op partners see the same gate).
var AB164={g:{hp:1.5,atk:1.3},spd:1.85,cdK:.35,look:3,see:28,elN:2,elLv:1,elHp:1.15,elMax:8,elR:[16,30],el:[],tS:0,G:null,v:164};
AB157K.cap=12;AB157K.civ.hp=1;AB157K.civ.atk=.85;
// ---------------- tougher, faster ----------------
function ab164Buff(e,k){const c=e.c;let r=1;try{r=Math.max(.01,Math.min(1,c.h/M(c)))}catch(_){}c.st.hp*=k.hp;c.st.pa*=k.atk;c.st.ma*=k.atk;try{c.h=Math.max(1,Math.round(M(c)*r))}catch(_){c.h=Math.round(c.st.hp*r)}}
function ab164Fighter(e){e.ab164f=1;try{e.m.userData.spk164=AB164.spd}catch(_){}}
{const f=ab157Rouse;ab157Rouse=function(a){const e=f.apply(this,arguments);if(e){try{if(e.ab157&&e.ab157.g)ab164Buff(e,AB164.g)}catch(_){}ab164Fighter(e)}return e}}
{const f=walkM;walkM=function(o,dx,dz){const k=o&&o.userData&&o.userData.spk164;if(k&&AB157A.on){dx*=k;dz*=k}return f.call(this,o,dx,dz)}}
{const f=aiLod;aiLod=function(e,dpl,dt){const r=f.apply(this,arguments);if(e&&e.ab164f&&r>0&&!e.atk&&AB157A.on)e.cd-=r*AB164.cdK;return r}}
// ---------------- pathing: down the street flow when the target is out of sight ----------------
function ab164Down(G,D,x,y){let best=D[y*G.W+x],bx=x,by=y;
  for(const [dx,dy] of AB158N8){const nx=x+dx,ny=y+dy;if(!ab158Ok(G,nx,ny))continue;if(dx&&dy&&(!ab158Ok(G,x+dx,y)||!ab158Ok(G,x,y+dy)))continue;
    const d=D[ny*G.W+nx]+(dx&&dy?.45:0);if(d<best){best=d;bx=nx;by=ny}}return [bx,by]}
function ab164Route(e,tg){if(!AB157A.on||!AB152.S||!AB158.fl||!tg||!tg.position||!ab152In())return tg;const S=AB152.S,G=S.G,I=S.I,D=AB158.fl,P=e.m.position;
  const u=P.x-I.x0,v=P.z-I.y0,tu=tg.position.x-I.x0,tv=tg.position.z-I.y0;if(Math.hypot(tu-u,tv-v)<2.2||ab152LOS(G,u,v,tu,tv,false))return tg;
  let x=Math.round(u),y=Math.round(v);if(!ab158Ok(G,x,y)){const o=ab157Open(S,u,v);x=Math.round(o[0]);y=Math.round(o[1]);if(!ab158Ok(G,x,y))return tg}
  if(D[y*G.W+x]>=65535)return tg;
  for(let s=0;s<AB164.look;s++){const [nx,ny]=ab164Down(G,D,x,y);if(nx===x&&ny===y)break;x=nx;y=ny}
  const W=e.ab164w||(e.ab164w={position:new THREE.Vector3(),ab164w:1});W.position.set(I.x0+x,P.y,I.y0+y);e.cd=Math.max(e.cd,.25);return W}
{const f=eTarget;eTarget=function(e,m,dpl){const tg=f.apply(this,arguments);if(!e||!e.ab164f||e.dead||e.mir)return tg;try{return ab164Route(e,tg)}catch(_){return tg}}}
// ---------------- eyes that hunt ----------------
function ab164Sight(now){if(now-AB164.tS<250)return 0;AB164.tS=now;const S=AB152.S,G=S.G,hs=ab158Heroes();let n=0;
  for(const a of ab157Res()){if(a.dead||a.e||a.hunt||a.net1||(a.o.lift||0)>=1)continue;
    for(const [hu,hv] of hs){if(Math.hypot(hu-a.u,hv-a.v)>AB164.see||!ab152LOS(G,a.u,a.v,hu,hv,false))continue;a.hunt=1;a.halt=1;a.st='look';a.sus=0;n++;break}}
  return n}
// ---------------- the bell: two elite guards each toll ----------------
function ab164EliteLook(e){try{const b=e.m.h&&e.m.h.bones&&e.m.h.bones.head;if(!b)return;const M0=ab164Mats(),g=new THREE.Group();g.name='ab164crest';
    const crest=new THREE.Mesh(svG('ab164crest',()=>{const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(.05,.42,-.34,.5);s.quadraticCurveTo(-.12,.3,-.2,0);s.closePath();return new THREE.ExtrudeGeometry(s,{depth:.04,bevelEnabled:false}).translate(.08,0,-.02)}),M0.gold);
    crest.rotation.y=Math.PI/2;crest.position.set(0,.16,0);g.add(crest);
    const ring=new THREE.Mesh(svG('ab164crown',()=>new THREE.TorusGeometry(.17,.035,6,14).rotateX(Math.PI/2)),M0.gold);ring.position.y=.1;g.add(ring);
    [-1,1].forEach(s=>{const h=new THREE.Mesh(svG('ab164horn',()=>new THREE.ConeGeometry(.04,.26,6)),M0.gold);h.position.set(s*.13,.2,-.04);h.rotation.set(-.5,0,-s*.5);g.add(h)});
    g.scale.setScalar(1/Math.max(.2,e.m.bs||1));b.add(g)}catch(_){}}
function ab164Elites(n){if(!ab157Lead()||!AB152.S||!AB158.fl)return 0;const S=AB152.S,G=S.G,I=S.I,D=AB158.fl;
  AB164.el=AB164.el.filter(e=>!e.dead&&enemies.indexOf(e)>=0);n=Math.min(n,Math.max(0,AB164.elMax-AB164.el.length));if(!n)return 0;
  const hs=ab158Heroes(),C=[],[r0,r1]=AB164.elR,mid=(r0+r1)/2;
  for(let y=0;y<G.H;y++)for(let x=0;x<G.W;x++){const d=D[y*G.W+x];if(d<r0||d>r1||!ab158Ok(G,x,y))continue;let near=1e9,seen=0;
    for(const [hu,hv] of hs){const s=Math.hypot(hu-x,hv-y);near=Math.min(near,s);if(s<AB164.see+4&&ab152LOS(G,x,y,hu,hv,false)){seen=1;break}}
    if(!seen&&near<26)C.push([Math.abs(d-mid)+Math.random()*4,x,y])}
  C.sort((a,b)=>a[0]-b[0]);const out=[];for(const [,x,y] of C){if(out.length>=n)break;if(out.some(q=>Math.hypot(q[0]-x,q[1]-y)<4))continue;out.push([x,y])}
  const lv=(INSL[30]&&INSL[30].lv)||I.lv||[10,11];let k=0;
  out.forEach(([x,y])=>{let e=null;try{e=spawnEnemy('nagaw',I.x0+x,I.y0+y,Math.max(1,Math.min(MAXLV,lv[1]+AB164.elLv)),{agg:1,al:true})}catch(err){console.error('v164 elite',err)}if(!e)return;
    e.hunt=1;e.agg=1;e.ab157={ri:-1,g:true,el:1};e.ab164e=1;ab164Buff(e,{hp:AB164.elHp,atk:AB164.g.atk});ab164Fighter(e);
    e.c.n=(e.trait?e.trait+' ':'')+'Abeksi Elite Guard';ab164EliteLook(e);AB164.el.push(e);k++});
  if(k)say('🔔 The bell tolls · <b>'+(k==1?'an Abeksi elite guard answers':k+' Abeksi elite guards answer')+'</b> its call and hunt you');return 0}
ab158Call=function(n,r){try{return ab164Elites(AB164.elN)}catch(e){console.error('v164 bell',e);return 0}};
// an elite left far behind (out of the monsters' 30-tile wake range) keeps running the streets towards the heroes
function ab164ElTick(dt){if(!AB158.fl)return;const S=AB152.S,G=S.G,I=S.I,D=AB158.fl;AB164.el=AB164.el.filter(e=>!e.dead&&enemies.indexOf(e)>=0);
  for(const e of AB164.el){const P=e.m.position;let far=1e9;for(const [hu,hv] of ab158Heroes())far=Math.min(far,Math.hypot(hu+I.x0-P.x,hv+I.y0-P.z));if(far<28)continue;
    let x=Math.round(P.x-I.x0),y=Math.round(P.z-I.y0);if(!ab158Ok(G,x,y))continue;const [nx,ny]=ab164Down(G,D,x,y);if(nx===x&&ny===y)continue;
    const tx=I.x0+nx,tz=I.y0+ny,du=tx-P.x,dv=tz-P.z,L=Math.hypot(du,dv)||1,st=Math.min(L,AB158.spd.g*dt);P.x+=du/L*st;P.z+=dv/L*st;P.y=GH(P.x,P.z);e.m.rotation.y=Math.atan2(du,dv)}}
{const f=ab157AlarmTick;ab157AlarmTick=function(dt,now){const r=f.apply(this,arguments);try{if(ab157Lead()){ab164Sight(now);ab164ElTick(dt)}}catch(e){if(!AB164.err++)console.error('v164 hunt',e)}return r}}
AB164.err=0;
{const f=ab157Calm;ab157Calm=function(){const r=f.apply(this,arguments);try{AB164.el.forEach(e=>{if(!e.dead&&enemies.indexOf(e)>=0)removeE(e)});AB164.el=[]}catch(_){}return r}}

// ================= the gate =================
// plan: the pylons' footprints (2x3 tiles each side of the 6-wide porch), four crates moved out of the porch, the tower lamp's guard
// up on the new battlement walk
AB152_K.pylon=[2,3,2,1];
AB152KB.gate=undefined;
function ab164Plan(P){if(P.v164)return P;P.v164=1;const mv={'70,186':[66,185],'80,186':[84,185],'69,187':[67,186],'81,187':[83,186]};
  P.C.forEach(c=>{const k=c[1]+','+c[2];if(mv[k]&&(c[0]=='cstack'||c[0]=='crate'||c[0]=='barrel')){c[1]=mv[k][0];c[2]=mv[k][1]}});
  P.C.push(['pylon',70.5,186,0],['pylon',78.5,186,0]);
  const g=P.N.find(n=>n[0]=='f3');if(g){g[3]=74.5;g[4]=185.1;g[6]=Object.assign({},g[6],{lift:8.2})}
  return P}
{const f=ab152Plan;ab152Plan=function(){const P=f.apply(this,arguments);try{if(P&&!P.v164)ab164Plan(P)}catch(e){console.error('v164 plan',e)}return P}}
var AB164GATE={u:74.5,v:187.5,porch:[[72,77],[185,186]]};
function ab164Mats(){return AB164.M||(AB164.M={
  stone:new THREE.MeshStandardMaterial({color:0xa08c6c,roughness:.92,flatShading:true}),stoneD:new THREE.MeshStandardMaterial({color:0x6a5a46,roughness:.95,flatShading:true}),
  stoneL:new THREE.MeshStandardMaterial({color:0xc4b090,roughness:.88,flatShading:true}),dark:new THREE.MeshStandardMaterial({color:0x241a12,roughness:1,flatShading:true}),vault:new THREE.MeshStandardMaterial({color:0x5a4c3c,roughness:.95,flatShading:true,side:THREE.DoubleSide}),
  wood:new THREE.MeshStandardMaterial({color:0x4e3420,roughness:.85,flatShading:true}),woodD:new THREE.MeshStandardMaterial({color:0x2e1e12,roughness:.9,flatShading:true}),
  iron:new THREE.MeshStandardMaterial({color:0x2c2e33,roughness:.42,metalness:.65,flatShading:true}),bronze:new THREE.MeshStandardMaterial({color:0x9a7232,roughness:.35,metalness:.75,flatShading:true}),
  gold:new THREE.MeshStandardMaterial({color:0xd8a844,roughness:.28,metalness:.85,emissive:0x2a1800,flatShading:true}),
  jade:new THREE.MeshStandardMaterial({color:0x2c8e68,roughness:.32,metalness:.22,emissive:0x06221a,flatShading:false}),
  jadeD:new THREE.MeshStandardMaterial({color:0x1c5a44,roughness:.4,metalness:.2,emissive:0x041610,flatShading:false}),
  eye:new THREE.MeshBasicMaterial({color:0xffb040}),tongue:new THREE.MeshStandardMaterial({color:0x8a1a22,roughness:.5,flatShading:true}),flame:new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:.92,depthWrite:false,blending:THREE.AdditiveBlending}),
  flameC:new THREE.MeshBasicMaterial({color:0xfff0b0,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending}),
  coal:new THREE.MeshStandardMaterial({color:0x3a1206,emissive:0xff4a10,emissiveIntensity:.8,roughness:1,flatShading:true})})}
// a swept tube along points with a radius per point (serpents: body, reliefs), smooth normals
function ab164Tube(pts,rad,seg,rs){const c=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),F=c.computeFrenetFrames(seg,false),pos=[],idx=[],n=rs||10;
  for(let i=0;i<=seg;i++){const t=i/seg,P=c.getPointAt(t),N=F.normals[i],B=F.binormals[i],r=typeof rad=='function'?rad(t):rad;
    for(let j=0;j<=n;j++){const a=j/n*Math.PI*2,cs=Math.cos(a),sn=Math.sin(a);pos.push(P.x+r*(cs*N.x+sn*B.x),P.y+r*(cs*N.y+sn*B.y),P.z+r*(cs*N.z+sn*B.z))}}
  for(let i=0;i<seg;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+n+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g}
// a serpent's head: snout, brow ridges, open jaw, fangs, a flared hood; eyes in the eye material (they glow red in the alarm)
function ab164HeadG(){if(AB164.HG)return AB164.HG;const G={};
  G.skull=svLoftZ([[-.16,.12,.1,0,.0],[-.05,.19,.13,0,.02],[.08,.23,.15,0,.035],[.2,.215,.13,0,.035],[.32,.17,.1,0,.025],[.44,.12,.072,0,.012],[.54,.07,.048,0,0],[.61,.028,.028,0,-.005]],10);
  G.jaw=svLoftZ([[-.02,.15,.04,0,0],[.15,.15,.04,0,0],[.32,.115,.034,0,0],[.46,.07,.026,0,0],[.54,.03,.018,0,0]],8).rotateX(.4).translate(0,-.085,.02);
  const h=new THREE.Shape();h.moveTo(0,-.42);h.bezierCurveTo(.34,-.36,.5,-.02,.42,.22);h.bezierCurveTo(.36,.36,.16,.4,0,.3);h.bezierCurveTo(-.16,.4,-.36,.36,-.42,.22);h.bezierCurveTo(-.5,-.02,-.34,-.36,0,-.42);
  G.hood=new THREE.ExtrudeGeometry(h,{depth:.035,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:1,curveSegments:10}).translate(0,-.12,-.2);
  {const P=G.hood.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i);P.setZ(i,P.getZ(i)-x*x*.45)}G.hood.computeVertexNormals()}
  G.brow=[-1,1].map(sd=>new THREE.BoxGeometry(.07,.035,.2).rotateY(-sd*.22).rotateZ(sd*.25).translate(sd*.12,.15,.2));
  G.eye=[-1,1].map(sd=>new THREE.SphereGeometry(.036,8,6).scale(1,.8,1.25).translate(sd*.135,.095,.29));
  G.fang=[-1,1].map(sd=>new THREE.ConeGeometry(.018,.13,6).rotateX(Math.PI).translate(sd*.072,-.07,.43));
  G.scale=[];for(let i=0;i<9;i++){const zz=-.05+i*.065;G.scale.push(new THREE.BoxGeometry(.09-i*.004,.012,.06).translate(0,.135+.02*Math.sin(i*.5)-i*.009,zz))}
  G.tongue=new THREE.BoxGeometry(.016,.008,.2).translate(0,-.06,.66);G.fork=[-1,1].map(sd=>new THREE.BoxGeometry(.012,.008,.08).rotateY(sd*.45).translate(sd*.02,-.06,.78));
  return AB164.HG=G}
// a serpent's head: a lofted skull, an open lower jaw, fangs, brow ridges, crown scales, a forked tongue and a flared hood behind;
// eyes in the eye material (they glow red in the alarm); built along +z and turned ry
function ab164Head(k,M,x,y,z,ry,s,mat){const G=ab164HeadG(),put=(g,m)=>k.m(g,m,x,y,z,0,ry,0,s,s,s);
  put(G.skull,mat);put(G.jaw,mat);put(G.hood,mat);G.brow.forEach(g=>put(g,mat));G.eye.forEach(g=>put(g,M.eye));G.fang.forEach(g=>put(g,M.stoneL));
  G.scale.forEach(g=>put(g,mat));put(G.tongue,M.tongue);G.fork.forEach(g=>put(g,M.tongue))}
// a rearing serpent coiled on a pylon top (relative to the pylon top centre), facing the yard (-z)
function ab164Statue(k,M,x,y,z,s){const C=[];for(let i=0;i<=26;i++){const t=i/26,a=t*Math.PI*4.2,r=(.85-.25*t)*s;C.push([x+Math.cos(a)*r,y+(.12+t*.55)*s,z+Math.sin(a)*r])}
  const top=C[C.length-1];[[x+.15*s,y+1.2*s,z-.05*s],[x+.05*s,y+1.95*s,z-.3*s],[x,y+2.4*s,z-.55*s]].forEach(p=>C.push(p));
  k.m(ab164Tube(C,t=>(.24-.13*t)*s*(t>.97?.9:1),110,12),M.jade,0,0,0);
  k.m(ab164Tube([[x+Math.cos(0)*.85*s,y+.12*s,z],[x+.9*s,y+.06*s,z+.4*s],[x+.55*s,y+.04*s,z+.85*s],[x+.1*s,y+.03*s,z+.95*s]],t=>(.22-.18*t)*s,24,8),M.jade,0,0,0);   // the tail tip curling round the base
  ab164Head(k,M,x,y+2.5*s,z-.62*s,Math.PI,s*1.15,M.jade);
  k.m(svG('ab164base',()=>new THREE.CylinderGeometry(1,1.08,1,10)),M.stoneL,x,y-.1*s,z,0,0,0,1.15*s,.25*s,1.15*s)}
function ab164Flame(g,M,x,y,z,s,list){const f=new THREE.Group();f.position.set(x,y,z);
  const o=new THREE.Mesh(svG('ab164fl',()=>new THREE.ConeGeometry(.28,1,8,1,true).translate(0,.5,0)),M.flame);o.scale.set(s,s,s);f.add(o);
  const c=new THREE.Mesh(svG('ab164flc',()=>new THREE.ConeGeometry(.15,.62,7,1,true).translate(0,.31,0)),M.flameC);c.scale.set(s,s,s);f.add(c);
  f.userData.psNo=1;g.add(f);list.push({m:f,s,ph:Math.random()*6});return f}
function ab164Brazier(k,M,x,y,z,s){k.m(svG('ab164bz',()=>new THREE.CylinderGeometry(.55,.3,.45,10,1,true)),M.bronze,x,y+.22*s,z,0,0,0,s,s,s);
  k.m(svG('ab164bzr',()=>new THREE.TorusGeometry(.55,.05,5,14).rotateX(Math.PI/2)),M.bronze,x,y+.45*s,z,0,0,0,s,s,s);
  k.m(svG('ab164coal',()=>new THREE.CylinderGeometry(.5,.45,.12,10)),M.coal,x,y+.38*s,z,0,0,0,s,s,s);
  [0,1,2].forEach(i=>{const a=i/3*Math.PI*2;k.m(svG('ab164bzl',()=>new THREE.CylinderGeometry(.04,.04,1,5)),M.iron,x+Math.cos(a)*.3*s,y-.1*s,z+Math.sin(a)*.3*s,Math.sin(a)*.25,0,-Math.cos(a)*.25,s,.5*s,s)})}
function ab164Canvas(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
// the passage seen through the open doors: arches receding to a bright way out
function ab164TunnelTex(){return ab164Canvas(512,384,(g,w,h)=>{g.fillStyle='#120c08';g.fillRect(0,0,w,h);const cx=w/2,cy=h*.6;
  for(let i=0;i<9;i++){const k=1-i/9,ww=w*.5*k*k+30,hh=h*.62*k*k+26;g.fillStyle='rgb('+(30+i*6)+','+(22+i*5)+','+(16+i*4)+')';g.beginPath();g.moveTo(cx-ww,cy+hh*.6);g.lineTo(cx-ww,cy-hh*.35);
    g.arc(cx,cy-hh*.35,ww,Math.PI,0);g.lineTo(cx+ww,cy+hh*.6);g.closePath();g.fill();g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=3*k+1;g.stroke()}
  const L=g.createRadialGradient(cx,cy-6,4,cx,cy-6,110);L.addColorStop(0,'rgba(255,246,214,1)');L.addColorStop(.35,'rgba(255,214,150,.85)');L.addColorStop(1,'rgba(255,170,90,0)');
  g.fillStyle=L;g.fillRect(0,0,w,h);g.fillStyle='rgba(255,236,190,.9)';g.beginPath();g.moveTo(cx-26,cy+24);g.lineTo(cx-26,cy-14);g.arc(cx,cy-14,26,Math.PI,0);g.lineTo(cx+26,cy+24);g.closePath();g.fill();
  const F=g.createLinearGradient(0,cy,0,h);F.addColorStop(0,'rgba(255,200,130,.35)');F.addColorStop(1,'rgba(255,200,130,0)');g.fillStyle=F;g.beginPath();g.moveTo(cx-26,cy+24);g.lineTo(cx+26,cy+24);g.lineTo(w*.9,h);g.lineTo(w*.1,h);g.closePath();g.fill()})}
function ab164BannerTex(){return ab164Canvas(128,512,(g,w,h)=>{const G=g.createLinearGradient(0,0,w,0);G.addColorStop(0,'#4a0c0a');G.addColorStop(.5,'#8a1a16');G.addColorStop(1,'#4a0c0a');g.fillStyle=G;g.fillRect(0,0,w,h);
  g.strokeStyle='#d8a844';g.lineWidth=6;g.strokeRect(8,8,w-16,h-60);g.lineWidth=2;g.strokeRect(16,16,w-32,h-76);
  g.fillStyle='#4a0c0a';g.beginPath();g.moveTo(0,h-52);g.lineTo(w/2,h);g.lineTo(w,h-52);g.lineTo(w,h);g.lineTo(0,h);g.closePath();g.globalCompositeOperation='destination-out';g.fill();g.globalCompositeOperation='source-over';
  g.strokeStyle='#e8b850';g.lineWidth=7;g.lineCap='round';g.beginPath();for(let i=0;i<=60;i++){const t=i/60,a=t*Math.PI*3.4,r=36*(1-t*.7);const x=w/2+Math.cos(a)*r,y=200+Math.sin(a)*r*.9-t*80;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
  g.fillStyle='#e8b850';g.beginPath();g.ellipse(w/2,108,13,18,0,0,Math.PI*2);g.fill();g.fillStyle='#8a1a16';g.fillRect(w/2-6,100,3,4);g.fillRect(w/2+3,100,3,4);
  g.fillStyle='#d8a844';for(let i=0;i<5;i++)g.fillRect(w/2-30+i*15,300+(i%2)*6,8,8)})}
function ab164MosaicTex(){return ab164Canvas(256,256,(g,w,h)=>{const c=w/2;g.fillStyle='#6a5a46';g.beginPath();g.arc(c,c,c-2,0,Math.PI*2);g.fill();
  for(let r=0;r<6;r++){const R0=c-8-r*18;for(let i=0;i<48;i++){const a=i/48*Math.PI*2;g.fillStyle=['#8a7a5a','#a08c6a','#7a6a4e'][(i+r)%3];g.fillRect(c+Math.cos(a)*R0-3,c+Math.sin(a)*R0-3,6,6)}}
  g.strokeStyle='#2c8e68';g.lineWidth=12;g.beginPath();g.arc(c,c,c-34,.25,Math.PI*2-.1);g.stroke();g.fillStyle='#2c8e68';g.beginPath();g.ellipse(c+(c-34),c-14,12,18,.3,0,Math.PI*2);g.fill();
  g.strokeStyle='#d8a844';g.lineWidth=3;g.beginPath();g.arc(c,c,c-6,0,Math.PI*2);g.stroke();g.beginPath();g.arc(c,c,40,0,Math.PI*2);g.stroke();
  g.fillStyle='#d8a844';g.beginPath();for(let i=0;i<8;i++){const a=i/8*Math.PI*2;g.lineTo(c+Math.cos(a)*30,c+Math.sin(a)*30);g.lineTo(c+Math.cos(a+.39)*12,c+Math.sin(a+.39)*12)}g.closePath();g.fill()})}
function ab164SignTex(){return ab164Canvas(256,256,(g,w,h)=>{const c=w/2;const R=g.createRadialGradient(c,c-8,10,c,c-8,120);R.addColorStop(0,'rgba(255,220,140,.95)');R.addColorStop(.55,'rgba(255,140,50,.55)');R.addColorStop(1,'rgba(255,90,30,0)');
  g.fillStyle=R;g.fillRect(0,0,w,h);g.fillStyle='#2a0e06';g.strokeStyle='#fff2c8';g.lineWidth=6;g.beginPath();g.moveTo(c-46,c+40);g.lineTo(c-46,c-14);g.arc(c,c-14,46,Math.PI,0);g.lineTo(c+46,c+40);g.closePath();g.fill();g.stroke();
  g.fillStyle='#fff2c8';g.beginPath();g.moveTo(c,c-44);g.lineTo(c+26,c-8);g.lineTo(c+10,c-8);g.lineTo(c+10,c+30);g.lineTo(c-10,c+30);g.lineTo(c-10,c-8);g.lineTo(c-26,c-8);g.closePath();g.fill();
  g.font='900 34px system-ui,sans-serif';g.textAlign='center';g.lineWidth=7;g.strokeStyle='#2a0e06';g.strokeText('ESCAPE',c,c+84);g.fillStyle='#ffe6a8';g.fillText('ESCAPE',c,c+84)})}
function ab164BeamTex(){return ab164Canvas(16,256,(g,w,h)=>{const G=g.createLinearGradient(0,h,0,0);G.addColorStop(0,'rgba(255,220,150,1)');G.addColorStop(.12,'rgba(255,170,80,.75)');G.addColorStop(.5,'rgba(255,110,50,.25)');G.addColorStop(1,'rgba(255,80,40,0)');g.fillStyle=G;g.fillRect(0,0,w,h)})}
// one door leaf, hinged at its outer edge (sd -1 left, 1 right); built along +x (left) / -x (right) from the hinge
function ab164Leaf(M,sd){const k=gb151Kit(),W=2.95,H=4.3,dir=-sd,rn=svRng(1640+sd*7),bx=svG('ab164box',()=>new THREE.BoxGeometry(1,1,1));
  for(let i=0;i<5;i++){const w=W/5;k.m(bx,i%2?M.wood:M.woodD,dir*(w*(i+.5)),H/2,0,0,0,0,w-.03,H,.2+rn()*.03)}
  [.55,1.6,2.7,3.75].forEach(y=>{k.m(bx,M.iron,dir*W/2,y,-.13,0,0,0,W-.06,.16,.05);for(let i=0;i<9;i++)k.m(svG('ab164riv',()=>new THREE.SphereGeometry(1,6,4)),M.iron,dir*(.18+i*(W-.36)/8),y,-.16,0,0,0,.035,.035,.03)});
  k.m(bx,M.iron,dir*.12,H/2,-.12,0,0,0,.14,H-.1,.05);   // the hinge strap
  [.9,2.2,3.5].forEach(y=>k.m(svG('ab164pin',()=>new THREE.CylinderGeometry(1,1,1,8)),M.iron,dir*.02,y,0,0,0,0,.07,.36,.07));
  // the half of the great serpent seal on the meeting edge and an iron ring knocker held in a bronze serpent's jaws
  k.m(svG('ab164seal'+sd,()=>{const h=new THREE.Shape();h.moveTo(0,-.85);h.absarc(0,0,.85,sd<0?Math.PI/2:-Math.PI/2,sd<0?Math.PI*1.5:Math.PI/2,false);h.closePath();return new THREE.ExtrudeGeometry(h,{depth:.06,bevelEnabled:false,curveSegments:16})}),M.bronze,dir*W,2.25,-.2);
  k.m(svG('ab164sealr',()=>new THREE.TorusGeometry(.62,.045,5,20,Math.PI)),M.gold,dir*W,2.25,-.21,0,0,sd<0?Math.PI/2:-Math.PI/2);
  k.m(svG('ab164knk',()=>new THREE.TorusGeometry(.2,.035,6,16)),M.iron,dir*(W-.75),1.35,-.2,0,0,0);ab164Head(k,M,dir*(W-.75),1.62,-.2,Math.PI,.42,M.bronze);
  for(let i=0;i<14;i++)k.m(svG('ab164stud',()=>new THREE.ConeGeometry(1,1,4)),M.iron,dir*(.4+(i%7)*.37),i<7?.95:3.2,-.14,-Math.PI/2,0,0,.05,.07,.05);
  return k.done()}
function ab164GateBuild(S){if(S.g164)return S.g164;const M=ab164Mats(),I=S.I,X=I.x0+AB164GATE.u,Z=I.y0+AB164GATE.v,Y=GH(X,Z-2),k=gb151Kit(),bx=svG('ab164box',()=>new THREE.BoxGeometry(1,1,1)),rn=svRng(1640);
  const root=new THREE.Group();root.name='ab164gate';root.position.set(X,Y,Z);root.userData.psNo=1;S.root.add(root);const fl=[];
  // the pylons: plinth, shaft with an inset panel, a serpent relief climbing it, bronze bands, cornice, merlons, a rearing serpent and a brazier
  [-1,1].forEach(s=>{const x=s*4;
    k.m(bx,M.stoneD,x,.55,-1.5,0,0,0,2.4,1.1,3.3);k.m(bx,M.stoneL,x,1.16,-1.5,0,0,0,2.3,.14,3.2);
    k.m(bx,M.stone,x,4.6,-1.45,0,0,0,2,7,2.9);
    k.m(bx,M.stoneD,x,4.4,-2.92,0,0,0,1.3,5.2,.1);k.m(bx,M.stoneL,x,7.05,-2.95,0,0,0,1.55,.16,.14);k.m(bx,M.stoneL,x,1.75,-2.95,0,0,0,1.55,.16,.14);
    for(let i=0;i<6;i++)k.m(bx,M.stoneD,x+s*.99,1.6+i*1.05,-1.45,0,0,0,.04,.05,2.9);   // coursing lines on the outer face
    const rel=[];for(let i=0;i<=16;i++){const t=i/16;rel.push([x+Math.sin(t*Math.PI*3)*.38,2.1+t*4.4,-3.0])}k.m(ab164Tube(rel,t=>.07+.08*Math.sin(Math.PI*Math.min(1,t*1.15)),70,8),M.jadeD,0,0,0);
    ab164Head(k,M,x,6.65,-3.02,Math.PI,.5,M.jadeD);
    [3.1,5.6].forEach(y=>k.m(bx,M.bronze,x,y,-2.97,0,0,0,1.38,.1,.06));
    k.m(bx,M.stoneL,x,8.25,-1.45,0,0,0,2.35,.4,3.25);k.m(bx,M.stone,x,8.75,-1.45,0,0,0,2.1,.6,3.0);
    for(let i=0;i<3;i++){k.m(bx,M.stoneL,x-.75+i*.75,9.3,-2.85,0,0,0,.42,.5,.28);k.m(bx,M.stoneL,x-.75+i*.75,9.3,-.05,0,0,0,.42,.5,.28)}
    ab164Statue(k,M,x,9.05,-1.3,.95);ab164Brazier(k,M,x+s*-.55,9.05,-2.55,.55);ab164Flame(root,M,x+s*-.55,9.32,-2.55,.75,fl);
    // the inner side walls of the porch: ashlar courses
    for(let i=0;i<5;i++)k.m(bx,i%2?M.stoneD:M.stone,s*3.02,.45+i*.85,-1.5,0,0,0,.05,.8,2.9)});
  // the arch: voussoirs round a semicircle (springing at 3.4), a serpent-skull keystone, spandrels and a frieze
  const yS=3.4,R0=3,nV=15;for(let i=0;i<nV;i++){const a0=Math.PI-(i+.5)/nV*Math.PI,cx=Math.cos(a0)*(R0+.35),cy=yS+Math.sin(a0)*(R0+.35),key=i==7;
    k.m(bx,key?M.stoneL:(i%2?M.stone:M.stoneL),cx,cy,-2.75,0,0,a0-Math.PI/2,key?.95:Math.PI*R0/nV*1.04,key?1.05:.72,key?.95:.62)}
  [-1,1].forEach(s=>{k.m(bx,M.stoneL,s*2.95,1.7,-2.75,0,0,0,.28,3.4,.62);k.m(bx,M.stoneL,s*3.0,yS,-2.78,0,0,0,.5,.18,.72)});   // jambs and impost blocks
  ab164Head(k,M,0,yS+R0+.4,-3.32,Math.PI,.62,M.stoneL);
  const rr=R0+.71,hy=Math.sqrt(rr*rr-9),th=Math.atan2(hy,3),sp=new THREE.Shape();sp.moveTo(-3,yS+hy);sp.lineTo(-3,8.0);sp.lineTo(3,8.0);sp.lineTo(3,yS+hy);sp.absarc(0,yS,rr,th,Math.PI-th,false);sp.closePath();
  k.m(svG('ab164spd',()=>new THREE.ExtrudeGeometry(sp,{depth:.62,bevelEnabled:false,curveSegments:20})),M.stone,0,0,-3.05);
  k.m(bx,M.stoneL,0,7.55,-3.12,0,0,0,6.1,.22,.2);for(let i=0;i<12;i++)k.m(bx,M.stoneD,-2.75+i*.5,7.3,-3.13,0,0,0,.22,.22,.08);   // frieze with dentils
  // the passage: a barrel vault, raised portcullis teeth, the tympanum over the doors with a serpent sun
  k.m(svG('ab164vault',()=>new THREE.CylinderGeometry(R0,R0,2.85,24,1,true,Math.PI/2,Math.PI).rotateX(Math.PI/2)),M.vault,0,yS,-1.55,0,0,0);
  for(let i=0;i<9;i++)k.m(svG('ab164tooth',()=>new THREE.ConeGeometry(1,1,4)),M.iron,-2.4+i*.6,4.75,-2.1,Math.PI,0,0,.06,.5,.06);k.m(bx,M.iron,0,5.0,-2.1,0,0,0,5.6,.12,.1);
  k.m(svG('ab164tym',()=>new THREE.CircleGeometry(R0,24,0,Math.PI)),M.stone,0,yS+.9,-.04,0,Math.PI,0,1,.72,1);
  for(let i=0;i<11;i++){const a=i/10*Math.PI;k.m(bx,M.gold,Math.cos(a)*1.25,yS+.95+Math.sin(a)*1.0,-.1,0,0,a-Math.PI/2,.08,.55,.05)}
  k.m(svG('ab164sun',()=>new THREE.CylinderGeometry(1,1,1,16)),M.gold,0,yS+1.05,-.12,Math.PI/2,0,0,.42,.06,.42);
  k.m(bx,M.stoneL,0,4.42,-.12,0,0,0,6,.25,.3);   // the lintel the doors close under
  // the battlement walk over the arch (the tower lamp's guard stands here) and its merlons
  k.m(bx,M.stoneL,0,8.1,-2.0,0,0,0,6.2,.22,2.3);for(let i=0;i<5;i++)k.m(bx,M.stone,-2.4+i*1.2,8.55,-3.0,0,0,0,.7,.7,.32);
  // the porch floor: worn flags and a threshold; a stepped apron spilling into the yard
  k.m(bx,M.stoneD,0,.03,-1.5,0,0,0,6,.06,3);k.m(bx,M.stoneL,0,.06,-.35,0,0,0,6,.08,.4);
  for(let r=0;r<3;r++)k.m(bx,r%2?M.stone:M.stoneL,0,.04-r*.01,-3.25-r*.45,0,0,0,10.6-r*.8+rn()*.2,.08,.5);
  // chains with lanterns hanging from the vault, bronze rings on the pylon fronts holding the banners
  [-1,1].forEach(s=>{for(let i=0;i<6;i++)k.m(svG('ab164link',()=>new THREE.TorusGeometry(.06,.016,4,8)),M.iron,s*1.6,5.6-i*.12,-1.6,0,i%2?Math.PI/2:0,0);
    k.m(svG('ab164lant',()=>new THREE.CylinderGeometry(.16,.12,.36,6)),M.iron,s*1.6,4.82,-1.6,0,0,0);k.m(bx,M.bronze,s*4,7.75,-3.05,0,0,0,1.0,.07,.12)});
  const stat=k.done();root.add(stat);
  stat.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  // the lanterns' glow (shared flame material), the eyes are in M.eye
  [-1,1].forEach(s=>{const m=new THREE.Mesh(svG('ab164lg',()=>new THREE.SphereGeometry(.11,8,6)),M.flameC);m.position.set(s*1.6,4.82,-1.6);root.add(m)});
  // the passage beyond the doors, the doors
  const tun=new THREE.Mesh(new THREE.PlaneGeometry(6,4.3),new THREE.MeshBasicMaterial({map:ab164TunnelTex()}));tun.position.set(0,2.15,-.16);tun.rotation.y=Math.PI;root.add(tun);
  const leaves=[-1,1].map(sd=>{const p=new THREE.Group();p.position.set(sd*2.95,0,-.34);p.add(ab164Leaf(M,sd));root.add(p);return p});
  // banners on the pylon fronts
  const bt=ab164BannerTex(),bm=new THREE.MeshStandardMaterial({map:bt,transparent:true,alphaTest:.4,side:THREE.DoubleSide,roughness:.85});
  const ban=[-1,1].map(s=>{const g=new THREE.PlaneGeometry(.95,3.8,1,8);g.translate(0,-1.9,0);const m=new THREE.Mesh(g,bm);m.position.set(s*4,7.7,-3.12);m.rotation.y=Math.PI;root.add(m);return m});
  // the porch mosaic
  const mos=new THREE.Mesh(new THREE.CircleGeometry(2.3,40).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:ab164MosaicTex(),roughness:.9,polygonOffset:true,polygonOffsetFactor:-2}));mos.position.set(0,.075,-1.65);root.add(mos);
  // the alarm's markers: a pillar of light, a floating ESCAPE sign, a glowing ring in the porch, a light (straight into the scene)
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.6,2.2,64,24,1,true).translate(0,32,0),new THREE.MeshBasicMaterial({map:ab164BeamTex(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,opacity:0}));
  beam.position.set(0,8.4,-1.6);beam.renderOrder=4;beam.visible=false;root.add(beam);
  const sign=new THREE.Sprite(new THREE.SpriteMaterial({map:ab164SignTex(),transparent:true,depthTest:false,depthWrite:false,fog:false}));sign.position.set(0,12.6,-1.6);sign.scale.set(3.4,3.4,1);sign.renderOrder=12;sign.visible=false;root.add(sign);
  const ring=new THREE.Mesh(new THREE.RingGeometry(2.2,2.55,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffb050,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
  ring.position.set(0,.1,-1.65);ring.renderOrder=5;ring.visible=false;root.add(ring);
  const lt=new THREE.PointLight(0xffa050,0,20,1.5);lt.position.set(X,Y+3.2,Z-2.6);scene.add(lt);
  root.updateMatrixWorld(true);
  return S.g164={root,leaves,fl,ban,beam,sign,ring,lt,k:0,want:0,eyeK:0,snd:0}}
// ---------------- the way to the gate: a street flow field from the porch, chevrons along it ----------------
function ab164GateFlow(S){if(S.dg164)return S.dg164;const G=S.G,W=G.W,N=W*G.H,D=new Uint16Array(N).fill(65535),q=new Int32Array(N);let h=0,t=0;
  const [[u0,u1],[v0,v1]]=AB164GATE.porch;for(let v=v0;v<=v1;v++)for(let u=u0;u<=u1;u++)if(ab158Ok(G,u,v)){const k=v*W+u;D[k]=0;q[t++]=k}
  while(h<t){const k=q[h++],x=k%W,y=(k-x)/W,d=D[k]+1;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const nx=x+dx,ny=y+dy;if(!ab158Ok(G,nx,ny))return;const j=ny*W+nx;if(D[j]>d){D[j]=d;q[t++]=j}})}
  return S.dg164=D}
function ab164Chev(S){if(S.ch164)return S.ch164;const sh=new THREE.Shape();sh.moveTo(-.55,.25);sh.lineTo(0,-.3);sh.lineTo(.55,.25);sh.lineTo(.55,.0);sh.lineTo(0,-.55);sh.lineTo(-.55,0);sh.closePath();
  const g=new THREE.ShapeGeometry(sh).rotateX(-Math.PI/2),m=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
  const n=14,im=new THREE.InstancedMesh(g,m,n);im.count=0;im.renderOrder=4;im.frustumCulled=false;im.userData.psNo=1;for(let i=0;i<n;i++)im.setColorAt(i,new THREE.Color(0xffa040));S.root.add(im);
  return S.ch164={im,n,path:[],t:0}}
var AB164O=new THREE.Object3D(),AB164C=new THREE.Color();
function ab164ChevTick(S,now,on){const C=ab164Chev(S),im=C.im;if(!on){im.count=0;return}const G=S.G,I=S.I,D=ab164GateFlow(S),H=AB152H;
  if(now-C.t>200){C.t=now;const L=[];let x=Math.round(H.u),y=Math.round(H.v);if(!ab158Ok(G,x,y)){const o=ab157Open(S,H.u,H.v);x=Math.round(o[0]);y=Math.round(o[1])}
    if(ab158Ok(G,x,y)&&D[y*G.W+x]<65535){for(let s=0;s<44;s++){L.push([x,y]);const [nx,ny]=ab164Down(G,D,x,y);if(nx===x&&ny===y)break;x=nx;y=ny}}C.path=L}
  const L=C.path;let n=0;if(L.length>5){for(let i=4;i<L.length-2&&n<C.n;i+=3){const a=L[i],b=L[Math.min(L.length-1,i+2)],p=L[i-1],q=L[i+1];
      const px=(a[0]*2+p[0]+q[0])/4,pz=(a[1]*2+p[1]+q[1])/4,wx=I.x0+px,wz=I.y0+pz;AB164O.position.set(wx,GH(wx,wz)+.08,wz);AB164O.rotation.set(0,Math.atan2(b[0]-a[0],b[1]-a[1]),0);
      const s=.9+.12*Math.sin(now/180-i*.5);AB164O.scale.set(s,1,s);AB164O.updateMatrix();im.setMatrixAt(n,AB164O.matrix);
      const w=.35+.65*Math.max(0,Math.sin(now/160-i*.42));AB164C.setRGB(1*w+.2,.62*w+.08,.22*w);im.setColorAt(n,AB164C);n++}}
  im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true}
// ---------------- the screen-edge arrow ----------------
(function(){const st=document.createElement('style');st.textContent=`#ab164ga{position:fixed;z-index:6;pointer-events:none;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:2px;
  font:800 12px system-ui,sans-serif;color:#ffe6b0;text-shadow:0 1px 3px #000,0 0 8px rgba(255,120,40,.8);letter-spacing:.04em;white-space:nowrap}#ab164ga.hide{display:none}
  #ab164ga i{display:block;width:0;height:0;border-left:13px solid transparent;border-right:13px solid transparent;border-bottom:26px solid #ffb040;filter:drop-shadow(0 0 6px rgba(255,110,30,.95)) drop-shadow(0 1px 1px #000)}
  #ab164ga span{padding:2px 8px;border-radius:9px;background:rgba(40,8,4,.72);border:1px solid rgba(255,150,70,.6)}`;document.head.appendChild(st);
  const d=document.createElement('div');d.id='ab164ga';d.className='hide';d.innerHTML='<i></i><span>City Gate</span>';document.body.appendChild(d)})();
var AB164V=new THREE.Vector3();
function ab164Arrow(S,on){const el=$('ab164ga');if(!el)return;if(!on||typeof uiOpen=='function'&&uiOpen()){el.classList.add('hide');return}const I=S.I,gx=I.x0+AB164GATE.u,gz=I.y0+AB164GATE.v-1.6,gy=GH(gx,gz)+5.5;
  const r=(typeof ren!='undefined'&&ren.domElement)?ren.domElement.getBoundingClientRect():{left:0,top:0,width:innerWidth,height:innerHeight};
  AB164V.set(gx,gy,gz).project(cam);let x=AB164V.x,y=AB164V.y;const behind=AB164V.z>1;if(behind){x=-x;y=-y}
  const dist=Math.round(Math.hypot(pl.position.x-gx,pl.position.z-gz)),inV=!behind&&Math.abs(x)<.86&&Math.abs(y)<.8,ar=el.firstChild,lb=el.lastChild;
  let ang=0;if(!inV){const m=Math.max(Math.abs(x)/.9,Math.abs(y)/.82);x/=m;y/=m;ang=Math.atan2(x,y)}else{ang=Math.PI}
  el.style.left=(r.left+(x+1)/2*r.width)+'px';el.style.top=(r.top+(1-y)/2*r.height)+'px';ar.style.transform='rotate('+ang+'rad)';
  lb.textContent=(dist<4?'Press F · Escape':'City Gate · '+dist+' m');el.classList.remove('hide')}
// ---------------- each frame in the city ----------------
function ab164GateTick(dt,now){const S=AB152.S;if(!S)return;const Q=ab164GateBuild(S),on=!!AB157A.on&&ab152In(),t=now/1000,M=ab164Mats();
  Q.want=on?1:0;if(on&&!Q.snd){Q.snd=1;try{svSnd('heavy',.9,.45);setTimeout(()=>{try{svSnd('crack',.5,.4)}catch(_){}},500)}catch(_){}}if(!on)Q.snd=0;
  Q.k+=Math.sign(Q.want-Q.k)*Math.min(Math.abs(Q.want-Q.k),dt*(on?.5:1.5));const e=Q.k<.5?2*Q.k*Q.k:1-Math.pow(-2*Q.k+2,2)/2;
  Q.leaves[0].rotation.y=e*1.5;Q.leaves[1].rotation.y=-e*1.5;
  Q.eyeK+=((on?1:0)-Q.eyeK)*Math.min(1,dt*3);M.eye.color.setRGB(1,.69-.55*Q.eyeK,.25-.2*Q.eyeK);
  Q.fl.forEach(f=>{const s=f.s*(1+.6*Q.eyeK)*(1+.12*Math.sin(t*11+f.ph)*Math.sin(t*4.3+f.ph));f.m.scale.set(f.s*(1+.4*Q.eyeK),s,f.s*(1+.4*Q.eyeK))});
  Q.ban.forEach((b,i)=>{b.rotation.x=.05*Math.sin(t*1.3+i*2)+.03*Math.sin(t*3.1+i)});
  const vis=Q.k>.02||on;Q.beam.visible=Q.sign.visible=Q.ring.visible=vis;
  if(vis){Q.beam.material.opacity=Q.k*(.62+.12*Math.sin(t*2.4));Q.beam.rotation.y+=dt*.2;const p=1+.08*Math.sin(t*3.2);Q.sign.scale.set(3.4*p,3.4*p,1);Q.sign.position.y=12.6+.3*Math.sin(t*1.6);Q.sign.material.opacity=Math.min(1,Q.k*1.4);
    Q.ring.material.opacity=Q.k*(.45+.35*Math.sin(t*4));const rs=1+.05*Math.sin(t*4);Q.ring.scale.set(rs,1,rs)}
  Q.lt.intensity=Q.k*(2.6+.4*Math.sin(t*7.1));
  ab164ChevTick(S,now,on&&Q.k>.3);ab164Arrow(S,on)}
{const f=ab152WorldTick;ab152WorldTick=function(dt,now){const r=f.apply(this,arguments);try{ab164GateTick(dt,now)}catch(e){if(!AB164.err++)console.error('v164 gate',e)}return r}}
// hide the arrow the moment the hero is out of the city
{const f=ab152Tick;ab152Tick=function(dt,now){const r=f.apply(this,arguments);try{if(!ab152In()){const el=$('ab164ga');if(el&&!el.classList.contains('hide'))el.classList.add('hide')}}catch(_){}return r}}
// the minimap: the gate, gold and pulsing, while the city hunts you
function ab164Marks(g,P,k){if(!AB157A.on||!AB152.S||!ab152In())return;const I=AB152.S.I,q=P(I.x0+AB164GATE.u,I.y0+AB164GATE.v-1);if(!q)return;const p=1+.18*Math.sin(performance.now()/160);
  g.save();g.translate(q[0],q[1]);g.scale(k*p,k*p);g.beginPath();g.arc(0,0,8,0,Math.PI*2);g.fillStyle='rgba(255,150,50,.35)';g.fill();
  g.beginPath();g.moveTo(-4.5,5);g.lineTo(-4.5,-1);g.arc(0,-1,4.5,Math.PI,0);g.lineTo(4.5,5);g.closePath();g.fillStyle='#ffc060';g.fill();g.lineWidth=1.4/k;g.strokeStyle='#2a0e06';g.stroke();g.restore()}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{ab164Marks(mmX,(x,z)=>{const X=(x-(cx-vw/2)+.5)*w/vw,Y=(z-(cy-vh/2)+.5)*h/vh;
    return [Math.max(4,Math.min(w-4,X)),Math.max(4,Math.min(h-4,Y))]},1)}catch(_){}}}
// the tracker: how far the gate is
{const f=SP152.trk.abeksi;SP152.trk.abeksi=I=>{const r=f(I);try{if(r&&I&&I.sp==='abeksi'&&AB157A.on&&AB152.S){const S=AB152.S,D=ab164GateFlow(S),x=Math.round(AB152H.u),y=Math.round(AB152H.v),d=ab158Ok(S.G,x,y)?D[y*S.G.W+x]:65535;
    r.lines=r.lines.map(l=>/city gate/.test(l[0])?['⛩ Escape through the city gate (Gate Yard)',d<65535?d+' steps · follow the glowing arrows':'follow the pillar of light']:l)}}catch(_){}return r}}
