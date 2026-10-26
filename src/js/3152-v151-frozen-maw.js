// ================= v151 The Frozen Maw — Burningeye Summit I main quest: the ice cave, Gorthrak the Glacierback, the passage to II =================
// Chapter 1 of Burningeye Summit's main quest line (2 The Frozen Gate · 3 The Mountain Drill are 3160 and 3170). The gateway at the
// end of Burningeye Summit I is gone: in its place the road ends at the mouth of an ice cave.
//  * F at the cave mouth: into the Frozen Maw = Burningeye's unused Wave Trial instance (INSL[14], renamed, Lv 21; the round arena
//    of the old trial), dressed as a glacier cave: a frozen rock floor veined with blue ice and drifted with snow, walls of dark rock
//    and blue crystal hung with icicles, frozen falls, a mammoth frozen in a block of ice, the troll's throne of ice and bone, six
//    great ice pillars round the floor, and at the back a passage sealed by a wall of ice.
//  * Gorthrak the Glacierback (model 3150, moves 3151) waits before his throne. Walking close starts the fight: a wall of ice closes
//    the cave mouth (recall is blocked) until he falls or you do. A wipe resets him. Fought once (MQ151.st ≥ 2: he never returns).
//  * The ice pillars: a charge that runs into one shatters it and leaves him dazed; in his Glacial Rampage every pillar he hits
//    cracks his shell (three: SHATTERED). They grow back when he starts a Rampage, and after the fight.
//  * When he dies the ice wall over the passage at the back bursts: the frozen passage leads to The Rimecaverns (Burningeye II).
// State MQ151.st: 0 · 1 entered · 2 Gorthrak slain (the passage is open) · 3 through the passage. Done also when II has been reached
// (mq151Done). Saved as x2.mq151 {st, seen}. A save made in the cave loads at the cave mouth. Co-op: local to each player (like
// Vorraxis: e.boss is never shared, so each player in the cave fights their own Gorthrak).
var MQ151={st:0,seen:0,name:'The Frozen Maw',boss:'Gorthrak',title:'the Glacierback',lv:21,LS:null,CM:null,e:null,trkK:'',t:0,err:0,quake:0,qT:0,sh:[],pil:[]};
function mq151Done(){return MQ151.st>=3||insReach(2)>=1}
function mq151Ins(){try{return curIns()}catch(_){return null}}
function mq151In1(){const I=mq151Ins();return !!I&&I.g===insG(2,0)}
function mq151InCave(){const I=mq151Ins();return !!I&&I.g===insG(2,4)}
function mq151Next(){try{const t=typeof TH112!='undefined'&&TH112&&TH112.byG&&TH112.byG[insG(2,1)];return t&&t.nm?t.nm:PMAP[2].ins[1].n}catch(_){return 'the Rimecaverns'}}
// the cave: Burningeye's Wave Trial instance becomes the Frozen Maw (name and level only; it keeps its grid place)
var GB151L=(()=>{const T=INSL[insG(2,4)];try{T.n='The Frozen Maw';T.rn='The Frozen Maw';T.lv=[MQ151.lv,MQ151.lv]}catch(_){}
  const cx=T.wa[0],cz=T.wa[1],ta=2.44;return {T,cx,cz,y:GH(cx,cz),ent:{x:cx,z:cz+10.2},mouth:{x:cx,z:cz+12.5},home:{x:cx,z:cz-3.2},throne:{x:cx,z:cz-10.8},
    tun:{x:cx+Math.sin(ta)*12.6,z:cz+Math.cos(ta)*12.6,a:ta},tunIn:{x:cx+Math.sin(ta)*10.9,z:cz+Math.cos(ta)*10.9},r:11.6,hr:12.6,
    pil:[30,90,150,210,270,330].map(d=>{const a=d*Math.PI/180;return {a,x:cx+Math.sin(a)*7.1,z:cz+Math.cos(a)*7.1}}),
    shl:[70,200,300].map(d=>{const a=d*Math.PI/180;return {a,x:cx+Math.sin(a)*11.1,z:cz+Math.cos(a)*11.1}})}})();
// the cave's own atmosphere (the v112 per-instance blend, ia112): a dim blue glacier cave, the hero's lantern lit
try{if(typeof TH112!='undefined'&&TH112&&TH112.byG&&!TH112.byG[insG(2,4)])TH112.byG[insG(2,4)]={z:2,k:4,g:insG(2,4),nm:'The Frozen Maw',sub:'A glacier cave beneath Burningeye Summit',
  a:{fog:.036,fc:0x0c1a2e,fcA:.9,sun:.28,hemi:.6,env:'dim',ex:1.02,sat:1.12,vig:1.55,sky:0,lan:1,pt:'sparkle',pc:0xbfe8ff,po:.7,wamb:1.2}}}catch(e){console.warn('v151 theme',e)}
// the old Wave Trial's "Leave trial" portal (if any is left) stays hidden
try{RPORT.forEach(r=>{if(r.k=='wave'&&r.pi===2)r.g.visible=false})}catch(_){}
// the old trial's war-camp dressing (stakes, skull pikes, banners, the flagstone dais: 0760 ARK_TRIAL) is not part of the cave
try{if(typeof ARK_TRIAL!='undefined'&&ARK_TRIAL[2]){ARK_TRIAL[2].visible=false;if(ARK_TRIAL[2].parent)ARK_TRIAL[2].parent.remove(ARK_TRIAL[2])}}catch(_){}
// the gateway at the end of Burningeye I (a pure function of the map data, so 1680's place() can keep decorations off the cave mouth)
function mq151Gate(){if(mq151Gate.c)return mq151Gate.c;const I=INSL[insG(2,0)],P=I.path,q=P[Math.max(0,P.length-14)],x=I.ba[0],z=I.ba[1],ry=Math.atan2(q[0]-x,q[1]-z);
  return mq151Gate.c={x,z,ry,fx:Math.sin(ry),fz:Math.cos(ry)}}
function mq151Keep(g,x,z){if(g!==insG(2,0))return false;try{const G=mq151Gate(),bx=G.x-G.fx*3,bz=G.z-G.fz*3;return Math.hypot(x-bx,z-bz)<10.5}catch(_){return false}}

// ---------------- materials and the build kit ----------------
var GB151G={};
function gb151Mats(){return GB151G.m||(GB151G.m={rock:new THREE.MeshStandardMaterial({color:0x3e444e,roughness:.9,flatShading:true}),rock2:new THREE.MeshStandardMaterial({color:0x545c66,roughness:.9,flatShading:true}),
  dark:new THREE.MeshStandardMaterial({color:0x22262c,roughness:.95,flatShading:true}),snow:new THREE.MeshStandardMaterial({color:0xe6eef4,roughness:.95,flatShading:true}),
  ice:new THREE.MeshStandardMaterial({color:0x9ad8ff,emissive:0x1a5a8a,emissiveIntensity:.55,roughness:.1,metalness:.15,transparent:true,opacity:.88,flatShading:true}),
  ice2:new THREE.MeshStandardMaterial({color:0x5a9ad0,emissive:0x0e3a6a,emissiveIntensity:.55,roughness:.15,metalness:.12,transparent:true,opacity:.9,flatShading:true}),
  glass:new THREE.MeshStandardMaterial({color:0xbfe8ff,emissive:0x2a6aa0,emissiveIntensity:.35,roughness:.05,metalness:.2,transparent:true,opacity:.5,depthWrite:false,flatShading:true}),
  bone:new THREE.MeshStandardMaterial({color:0xcfc4a4,roughness:.7,flatShading:true}),tusk:new THREE.MeshStandardMaterial({color:0xd8ccaa,roughness:.55,flatShading:true}),
  fur:new THREE.MeshStandardMaterial({color:0x6a645a,roughness:.95,flatShading:true}),wood:new THREE.MeshStandardMaterial({color:0x3e2c1c,roughness:.9,flatShading:true}),
  iron:new THREE.MeshStandardMaterial({color:0x3a3d44,roughness:.45,metalness:.6,flatShading:true}),hide:new THREE.MeshStandardMaterial({color:0x4a3e30,roughness:.9,flatShading:true}),
  void:new THREE.MeshBasicMaterial({color:0x020304,fog:false}),tun:new THREE.MeshBasicMaterial({color:0x0a0d12,side:THREE.BackSide,fog:false})})}
// a little build kit: meshes under one root, merged per material at the end (svMerge) for few draw calls
function gb151Kit(){const R=svRig();svJ(R,'k',null,0,0,0);R.root.add(R.J.k);const k={R,
  m(g,mat,x,y,z,rx,ry,rz,sx,sy,sz){return svM(R,'k',g,mat,x,y,z,rx,ry,rz,sx,sy,sz)},
  lump(k2,seed,mat,x,y,z,sx,sy,sz,ry,j){return svM(R,'k',svG('gbk'+k2,()=>svLump(1,1,j||.3,seed)),mat,x,y,z,0,ry||0,0,sx,sy,sz)},
  crys(i,mat,x,y,z,dx,dy,dz,w,h){const o=svM(R,'k',gb151Crys(i%3,6,[.6,.7,.8][i%3]),mat,x,y,z,0,0,0,w,h,w);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx,dy,dz).normalize());return o},
  icl(mat,x,y,z,r,l){return svM(R,'k',svG('gbk_icl',()=>svHorn(1,1,0,0,6,3)),mat,x,y,z,Math.PI/2,0,0,r,r,l)},
  done(){svMerge(R);R.root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return R.root}};return k}
// ---------------- the cave mouth at the end of Burningeye I ----------------
function gb151CaveMouth(){const M=gb151Mats(),k=gb151Kit(),rn=svRng(1511);
  // the mound the cave runs into: a cliff of big rocks behind and to the sides, snow on top
  [[0,3.4,-7.4,6.4,4.6,3.4],[-5.2,2.2,-4.4,3.0,3.0,2.8],[5.3,2.3,-4.2,3.0,3.2,2.8],[-3.0,5.2,-6.2,3.0,2.6,2.6],[3.2,5.4,-6.4,3.2,2.4,2.6],[0,7.4,-7.6,3.8,2.0,2.6],[-6.6,1.0,-1.8,2.0,1.6,1.8],[6.8,1.1,-1.6,2.0,1.8,1.8],[-3.4,1.8,-3.0,1.6,2.0,1.6],[3.5,1.9,-3.0,1.6,2.1,1.6]].forEach(([x,y,z,sx,sy,sz],i)=>{
    k.lump(i%4,40+i,i%3?M.rock:M.rock2,x,y,z,sx,sy,sz,rn()*3,.3);if(i<8)k.lump(10+i%3,60+i,M.snow,x+(rn()-.5)*.6,y+sy*.74,z,sx*.75,sy*.28,sz*.75,rn()*3,.2)});
  // the arch round the opening: two jambs of stacked rocks and a lintel slab, icicles hanging from it
  [-1,1].forEach(s=>{for(let i=0;i<4;i++)k.lump(20+i,70+i+(s>0?5:0),i%2?M.rock2:M.rock,s*(2.55+rn()*.25+(i==3?-.3:0)),.7+i*1.05,-.7+rn()*.3,1.0+rn()*.25,.75,1.15,rn()*3,.25)});
  k.lump(24,80,M.rock,0,4.15,-.8,3.2,.8,1.4,0,.2);k.lump(25,81,M.snow,0,4.85,-.85,2.6,.32,1.1,0,.15);
  for(let i=0;i<13;i++){const x=-2.2+i*.37+(rn()-.5)*.1;k.icl(i%2?M.ice:M.ice2,x,3.55-rn()*.15,.1+rn()*.25,.1+rn()*.07,.5+rn()*.9)}
  // the throat: a dark tunnel running into the rock, black at its end
  k.m(svG('gbk_tun',()=>{const g=new THREE.CylinderGeometry(1.95,1.95,6,14,3,true);g.rotateX(Math.PI/2);g.translate(0,0,-3);return g}),M.tun,0,1.65,-.3,0,0,0,1,1.05,1);
  k.m(svG('gbk_th',()=>new THREE.CircleGeometry(1,20)),M.void,0,1.65,-6.1,0,0,0,2.2,2.3,1);
  k.m(svG('gbk_fl',()=>new THREE.PlaneGeometry(3.8,6).rotateX(-Math.PI/2)),M.dark,0,.08,-3.2);
  // ice crystals growing out of the rock
  [[-3.4,2.6,-1.4,-1,1,.3],[3.3,2.4,-1.2,1,1,.4],[-1.2,5.0,-3.2,-.4,1,-.3],[1.6,4.9,-3.0,.4,1,-.2],[-4.6,1.0,-.4,-1,.6,.5],[4.8,1.2,-.3,1,.6,.5]].forEach(([x,y,z,dx,dy,dz],i)=>{
    for(let q=0;q<3;q++)k.crys(i+q,q%2?M.ice2:M.ice,x+(rn()-.5)*.5,y+(rn()-.5)*.3,z+(rn()-.5)*.4,dx+(rn()-.5)*.6,dy,dz+(rn()-.5)*.6,.18+rn()*.12,.9+rn()*.9)});
  // frost on the ground before the mouth
  k.lump(30,90,M.snow,-1.2,.05,.9,1.3,.12,.9,0,.2);k.lump(31,91,M.snow,1.4,.05,1.1,1.1,.1,.8,0,.2);
  // a troll totem beside the mouth: a pole, a mammoth skull, bones and a ring of icicles
  k.m(svG('gbk_pole',()=>new THREE.CylinderGeometry(.09,.12,3.4,6)),M.wood,3.1,1.7,1.3,0,0,.05);k.lump(32,92,M.bone,3.1,3.45,1.3,.42,.32,.46,0,.15);
  [-1,1].forEach(s=>k.m(svG('gbk_tt',()=>svHorn(.07,1,0,.5,6,5)),M.tusk,3.1+s*.22,3.3,1.55,.5,s*.5,0,1,1,.9));
  for(let i=0;i<5;i++)k.m(svG('gbk_bn',()=>new THREE.CylinderGeometry(.04,.05,.5,5)),M.bone,3.1+Math.sin(i*1.3)*.2,2.6-i*.08,1.3+Math.cos(i*1.3)*.2,0,i,.3);
  for(let i=0;i<6;i++){const a=rn()*6.28,r=1.5+rn()*2.5;k.m(svG('gbk_bn',()=>new THREE.CylinderGeometry(.04,.05,.5,5)),M.bone,Math.cos(a)*r,.05,1.5+Math.sin(a)*r*.6,Math.PI/2,0,rn()*6)}
  const g=k.done();g.userData.psNo=1;
  const glow=kqSpr(0x5ab8ff,3.2);glow.material=glow.material.clone();glow.material.opacity=.45;glow.position.set(0,1.6,-4.5);g.add(glow);
  return {g,glow}}
function gb151MouthBuild(){if(MQ151.CM)return MQ151.CM;const G=mq151Gate(),C=gb151CaveMouth();C.g.position.set(G.x,GH(G.x,G.z),G.z);C.g.rotation.y=G.ry;scene.add(C.g);MQ151.CM=C;
  // the rock is solid: every tile under the mound and the arch except the throat
  const ca=Math.cos(G.ry),sa=Math.sin(G.ry);for(let lz=-9;lz<=0;lz++)for(let lx=-8;lx<=8;lx++){const inTh=Math.abs(lx)<=1&&lz>=-1;if(inTh)continue;const rr=Math.hypot(lx/8.2,(lz+4)/5.4);if(rr>1&&!(lz<=-2&&Math.abs(lx)<=7))continue;
    const wx=G.x+lx*ca+lz*sa,wz=G.z-lx*sa+lz*ca;CBLK.add(Math.round(wz)*W+Math.round(wx))}
  // the old gateway: gone (its record stays for older code; the cave mouth is the way on)
  try{const r=RPORT.find(q=>q.k=='next'&&q.ig===insG(2,0));if(r){r.g.visible=false;MQ151.rp=r}}catch(_){}
  return C}
// ---------------- the cave ----------------
function gb151PillarModel(i){const M=gb151Mats(),g=new THREE.Group(),rn=svRng(1520+i);g.userData.psNo=1;
  const base=new THREE.Mesh(svG('gbp_b',()=>svLump(1,1,.3,1521)),M.rock);base.scale.set(1.0,.4,.95);base.position.y=.1;g.add(base);
  const sn=new THREE.Mesh(svG('gbp_s',()=>svLump(1,1,.2,1522)),M.snow);sn.scale.set(.85,.16,.8);sn.position.y=.36;g.add(sn);
  const top=new THREE.Group();g.add(top);const big=new THREE.Mesh(gb151Crys(1,6,.82),M.ice);big.scale.set(.56,3.5,.56);big.position.y=.3;big.rotation.y=rn()*3;top.add(big);
  for(let k=0;k<4;k++){const a=k/4*6.28+rn(),o=new THREE.Mesh(gb151Crys(k%3,6,.7),k%2?M.ice2:M.ice);o.scale.set(.24,1.1+rn()*.9,.24);o.position.set(Math.sin(a)*.5,.2,Math.cos(a)*.5);o.rotation.set(Math.cos(a)*.35,0,-Math.sin(a)*.35);top.add(o)}
  const core=kqSpr(0x7ad8ff,1.1);core.material=core.material.clone();core.material.opacity=.3;core.position.y=1.7;top.add(core);
  const stump=new THREE.Mesh(gb151Crys(2,6,.5),M.ice2);stump.scale.set(.8,.9,.8);stump.position.y=.25;stump.visible=false;g.add(stump);
  return {g,top,core,stump}}
function gb151LairBuild(){if(MQ151.LS)return MQ151.LS;const L=GB151L,M=gb151Mats(),root=new THREE.Group();root.name='FrozenMaw';scene.add(root);const LS={root,lights:[],falls:[],t:0};MQ151.LS=LS;
  const rn=svRng(1515),y=(x,z)=>GH(x,z);
  // the floor: frozen grey-blue rock, snow drifts, cracks, glowing ice veins (painted)
  {const cv=document.createElement('canvas');cv.width=cv.height=512;const c=cv.getContext('2d');c.fillStyle='#4a525c';c.fillRect(0,0,512,512);
    for(let i=0;i<1300;i++){const g=62+rn()*30|0;c.fillStyle=`rgba(${g},${g+6},${g+14},.5)`;c.beginPath();c.arc(rn()*512,rn()*512,2+rn()*10,0,6.283);c.fill()}
    for(let i=0;i<40;i++){const x=rn()*512,z=rn()*512,r=14+rn()*46,gr=c.createRadialGradient(x,z,0,x,z,r);gr.addColorStop(0,'rgba(236,244,250,.85)');gr.addColorStop(1,'rgba(236,244,250,0)');c.fillStyle=gr;c.beginPath();c.arc(x,z,r,0,6.283);c.fill()}
    c.strokeStyle='rgba(16,20,28,.6)';c.lineWidth=2;for(let i=0;i<46;i++){c.beginPath();let x=rn()*512,z=rn()*512;c.moveTo(x,z);for(let k=0;k<6;k++){x+=(rn()-.5)*60;z+=(rn()-.5)*60;c.lineTo(x,z)}c.stroke()}
    const em=document.createElement('canvas');em.width=em.height=512;const e2=em.getContext('2d');e2.fillStyle='#000';e2.fillRect(0,0,512,512);
    for(let i=0;i<26;i++){e2.strokeStyle=`rgba(${60+rn()*50|0},${170+rn()*60|0},255,${.45+rn()*.4})`;e2.lineWidth=1.2+rn()*2.6;e2.beginPath();let x=256+(rn()-.5)*460,z=256+(rn()-.5)*460;e2.moveTo(x,z);
      for(let k=0;k<8;k++){x+=(rn()-.5)*70;z+=(rn()-.5)*70;e2.lineTo(x,z)}e2.stroke()}
    const al=document.createElement('canvas');al.width=al.height=128;const a2=al.getContext('2d'),gr=a2.createRadialGradient(64,64,48,64,64,64);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#000');a2.fillStyle=gr;a2.fillRect(0,0,128,128);
    const R0=15.5,geo=new THREE.PlaneGeometry(R0*2,R0*2,44,44);geo.rotateX(-Math.PI/2);const P=geo.attributes.position;for(let k=0;k<P.count;k++){const x=P.getX(k)+L.cx,z=P.getZ(k)+L.cz;P.setXYZ(k,x,y(x,z)+.04,z)}geo.computeVertexNormals();
    const fm=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(cv),emissiveMap:new THREE.CanvasTexture(em),emissive:0x5ab8ff,emissiveIntensity:.5,roughness:.5,metalness:.12,transparent:true,alphaMap:new THREE.CanvasTexture(al),polygonOffset:true,polygonOffsetFactor:-2});
    fm.userData.noFade135=1;const fl=new THREE.Mesh(geo,fm);fl.receiveShadow=true;fl.userData.noFade135=1;root.add(fl);LS.floorM=fm}
  // sheets of smooth ice on the floor (shiny patches)
  for(let i=0;i<7;i++){const a=rn()*6.28,r=3+rn()*7,x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r;if(Math.hypot(x-L.home.x,z-L.home.z)<2.5)continue;
    const o=new THREE.Mesh(svG('gb_sheet',()=>new THREE.CircleGeometry(1,16).rotateX(-Math.PI/2)),new THREE.MeshStandardMaterial({color:0xbfe0f0,roughness:.05,metalness:.35,transparent:true,opacity:.55,polygonOffset:true,polygonOffsetFactor:-3}));
    o.position.set(x,y(x,z)+.06,z);o.scale.set(1.2+rn()*1.4,1,.8+rn()*1.1);o.rotation.y=rn()*3;o.material.userData.noFade135=1;o.userData.noFade135=1;root.add(o)}
  // the walls: dark rock and blue ice, snow on their shoulders, icicles hanging off them; gaps for the mouth (south) and the passage
  const K=gb151Kit(),gap=a=>{const d=x=>Math.abs(Math.atan2(Math.sin(x),Math.cos(x)));return d(a-0)<.17||d(a-L.tun.a)<.2};
  for(let i=0;i<36;i++){const a=i/36*Math.PI*2+rn()*.1;if(gap(a))continue;const r=15.0+rn()*1.6,x=Math.sin(a)*r,z=Math.cos(a)*r,s=1.6+rn()*1.5,yy=y(L.cx+x,L.cz+z)-L.y;
    K.lump(i%6,100+i,i%5==0?M.ice2:i%2?M.rock:M.rock2,x,yy+s*.3,z,s*1.3,s*(1.15+rn()*.6),s*1.2,rn()*6,.35);
    if(i%2==0)K.lump(10+i%3,140+i,M.snow,x*.97,yy+s*1.2,z*.97,s*.9,s*.25,s*.8,rn()*6,.2);
    if(i%3==0)for(let q=0;q<4;q++){const qa=a+(rn()-.5)*.12,qr=r-1.3-rn()*.5;K.icl(q%2?M.ice:M.ice2,Math.sin(qa)*qr,yy+2.2+rn()*1.6,Math.cos(qa)*qr,.12+rn()*.08,.7+rn()*1.1)}
    if(i%4==1){const qr=r-1.2;for(let q=0;q<3;q++)K.crys(i+q,q%2?M.ice2:M.ice,Math.sin(a)*qr+(rn()-.5)*.6,yy+.4+rn()*1.6,Math.cos(a)*qr+(rn()-.5)*.6,-Math.sin(a)+(rn()-.5)*.6,.8,-Math.cos(a)+(rn()-.5)*.6,.2+rn()*.15,1.0+rn()*1.4)}}
  // stalagmites of ice near the wall, snow drifts
  for(let i=0;i<20;i++){const a=rn()*Math.PI*2,r=12.4+rn()*2.2,x=Math.sin(a)*r,z=Math.cos(a)*r;if(gap(a)||Math.hypot(L.cx+x-L.throne.x,L.cz+z-L.throne.z)<3)continue;K.crys(i,i%3?M.ice:M.ice2,x,y(L.cx+x,L.cz+z)-L.y-.1,z,(rn()-.5)*.3,1,(rn()-.5)*.3,.25+rn()*.2,1.2+rn()*2.2)}
  for(let i=0;i<10;i++){const a=rn()*Math.PI*2,r=11.8+rn()*1.8,x=Math.sin(a)*r,z=Math.cos(a)*r;if(gap(a))continue;K.lump(20+i%3,160+i,M.snow,x,y(L.cx+x,L.cz+z)-L.y,z,1.4+rn(),.32,1.0+rn()*.6,rn()*6,.2)}
  // the throne: blocks of ice stacked into a seat, a mammoth's rib cage arching behind it, skulls, a fur pelt
  {const tx=L.throne.x-L.cx,tz=L.throne.z-L.cz,ty=y(L.throne.x,L.throne.z)-L.y;
    [[0,.45,0,2.0,.9,1.4],[0,1.1,-.7,1.8,1.4,.6],[-1.3,.8,-.1,.6,1.0,1.1],[1.3,.8,-.1,.6,1.0,1.1]].forEach(([x,yy,z,sx,sy,sz],i)=>K.lump(30+i,170+i,i%2?M.ice2:M.ice,tx+x,ty+yy,tz+z,sx*.6,sy*.6,sz*.6,0,.15));
    K.lump(34,175,M.fur,tx,ty+.95,tz+.1,1.0,.12,.7,0,.25);
    for(let k=0;k<6;k++){const xx=(k-2.5)*.55;K.m(svG('gb_rib',()=>svTube([[0,0,0],[0,1.4,-.5],[0,2.6,-.3],[0,3.3,.4]],[.12,.1,.08,.04],6)),M.bone,tx+xx,ty+.2,tz-1.5,0,0,(k-2.5)*-.08,1,1-Math.abs(k-2.5)*.08,1)}
    K.m(svG('gb_spine',()=>svTube([[-1.8,0,0],[0,.25,0],[1.8,0,0]],.14,6)),M.bone,tx,ty+.25,tz-1.6);
    for(let k=0;k<3;k++){K.lump(35+k,180+k,M.bone,tx-1.2+k*1.2,ty+2.0+(k==1?.3:0),tz-.95,.3,.26,.3,0,.15)}
    [-1,1].forEach(s=>K.m(svG('gb_tt',()=>svHorn(.12,1,0,.9,6,6)),M.tusk,tx+s*1.6,ty+.6,tz-.4,.3,s*.9,0,1,1,2.2))}
  // a mammoth frozen in a block of ice by the west wall, its tusks breaking out; frozen shields and blades of old challengers
  {const a=4.6,x=Math.sin(a)*10.6,z=Math.cos(a)*10.6,yy=y(L.cx+x,L.cz+z)-L.y;K.lump(40,190,M.dark,x,yy+1.2,z,1.5,1.0,1.1,a,.3);K.lump(41,191,M.fur,x+.3,yy+1.6,z,1.0,.7,.8,a,.3);
    K.lump(42,192,M.glass,x,yy+1.3,z,2.2,1.7,1.7,a,.18);[-1,1].forEach(s=>K.m(svG('gb_mt',()=>svHorn(.14,1,0,1.1,6,6)),M.tusk,x+Math.cos(a)*1.4,yy+1.0,z-Math.sin(a)*1.4+s*.5,.2,a+Math.PI/2+s*.3,0,1,1,1.8))}
  for(let i=0;i<6;i++){const a=rn()*6.28,r=8.5+rn()*3.2,x=Math.sin(a)*r,z=Math.cos(a)*r,yy=y(L.cx+x,L.cz+z)-L.y;if(Math.hypot(L.cx+x-L.ent.x,L.cz+z-L.ent.z)<2.5)continue;
    if(i%2)K.m(svG('gb_shd',()=>new THREE.CylinderGeometry(.45,.45,.06,10)),M.iron,x,yy+.08,z,(rn()-.5)*.4,0,(rn()-.5)*.4);else K.m(svG('gb_bld',()=>new THREE.BoxGeometry(.08,.02,1.1)),M.iron,x,yy+.05,z,0,rn()*6,0);
    K.lump(43,195+i,M.ice,x,yy+.05,z,.7,.15,.6,rn()*3,.2);for(let q=0;q<3;q++)K.m(svG('gb_bn',()=>new THREE.CylinderGeometry(.05,.06,.6,5)),M.bone,x+(rn()-.5)*1.4,yy+.06,z+(rn()-.5)*1.4,Math.PI/2,0,rn()*6)}
  const KR=K.done();KR.position.set(L.cx,L.y,L.cz);root.add(KR);
  // frozen falls down the walls (translucent, slowly shimmering)
  [1.3,3.3,5.3].forEach((a,i)=>{const r=13.9,x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r,yy=y(x,z),fall=new THREE.Mesh(svG('gb_fall',()=>{const g=new THREE.PlaneGeometry(2.2,6.4,4,8),P=g.attributes.position,rr=svRng(77);for(let k=0;k<P.count;k++)P.setZ(k,(rr()-.5)*.35);g.computeVertexNormals();return g}),
      new THREE.MeshStandardMaterial({color:0xbfe8ff,emissive:0x3a8ac8,emissiveIntensity:.4,roughness:.05,metalness:.2,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false,flatShading:true}));
    fall.material.userData.noFade135=1;fall.position.set(x,yy+3.0,z);fall.rotation.y=a+Math.PI;root.add(fall);LS.falls.push({m:fall,x,z,yy,ph:i*1.7})});
  // the six ice pillars
  LS.pil=L.pil.map((q,i)=>{const P=gb151PillarModel(i);P.g.position.set(q.x,y(q.x,q.z),q.z);P.g.rotation.y=q.a;root.add(P.g);return Object.assign(P,{x:q.x,z:q.z,ok:1,i,gr:1})});MQ151.pil=LS.pil;
  // the cave mouth (south): daylight, a ward of ice that closes it during the fight
  {const m=L.mouth,my=y(m.x,m.z),day=kqSpr(0xdff0ff,5);day.position.set(m.x,my+2.2,m.z+1.4);root.add(day);

    const seal=new THREE.Mesh(svG('gb_seal',()=>{const g=new THREE.CylinderGeometry(2.4,2.6,4.2,10,3,true,-1.1,2.2),P=g.attributes.position,rr=svRng(88);for(let k=0;k<P.count;k++){P.setX(k,P.getX(k)*(1+(rr()-.5)*.12));P.setZ(k,P.getZ(k)*(1+(rr()-.5)*.12))}g.computeVertexNormals();return g}),M.glass);
    seal.position.set(m.x,my+2.0,m.z+1.6);seal.rotation.y=Math.PI;seal.visible=false;root.add(seal);LS.seal=seal;
    const lt=new THREE.PointLight(0xcfe8ff,1.0,10,1.6);lt.position.set(m.x,my+2.4,m.z-.5);scene.add(lt);LS.lights.push(lt)}
  // the passage at the back: a dark throat, sealed by a wall of ice until he falls
  {const t=L.tun,ty=y(t.x,t.z),tg=new THREE.Group();tg.position.set(t.x,ty,t.z);tg.rotation.y=t.a+Math.PI;root.add(tg);
    {const k=gb151Kit(),r2=svRng(1533);[-1,1].forEach(s=>{for(let i=0;i<3;i++)k.lump(50+i,200+i+(s>0?4:0),i%2?M.rock2:M.rock,s*(2.1+r2()*.2),.7+i*1.0,-.9+r2()*.3,.95+r2()*.2,.72,1.1,r2()*3,.25)});
      k.lump(54,210,M.rock,0,3.4,-1.0,2.7,.75,1.3,0,.2);k.lump(55,211,M.snow,0,4.05,-1.05,2.1,.28,1.0,0,.15);[[-3.4,2.2,-2.2,2.0,2.6,2.0],[3.4,2.3,-2.2,2.0,2.7,2.0],[0,4.6,-2.6,3.2,1.6,2.0]].forEach(([x,y,z,sx,sy,sz],i)=>k.lump(56+i,212+i,M.rock2,x,y,z,sx,sy,sz,r2()*3,.3));
      for(let i=0;i<10;i++)k.icl(i%2?M.ice:M.ice2,-1.7+i*.38,2.85-r2()*.15,-.2+r2()*.25,.09+r2()*.06,.4+r2()*.7);
      k.m(svG('gbk_tun',()=>{const g=new THREE.CylinderGeometry(1.95,1.95,6,14,3,true);g.rotateX(Math.PI/2);g.translate(0,0,-3);return g}),M.tun,0,1.45,-.6,0,0,0,.85,.9,1);
      k.m(svG('gbk_th',()=>new THREE.CircleGeometry(1,20)),M.void,0,1.45,-5.6,0,0,0,1.8,1.9,1);tg.add(k.done())}
    const glo=kqSpr(0x5ab8ff,2.6);glo.material=glo.material.clone();glo.material.opacity=0;glo.position.set(0,1.5,-3.5);tg.add(glo);LS.tglo=glo;
    const wall=new THREE.Group();tg.add(wall);for(let k=0;k<9;k++){const o=new THREE.Mesh(gb151Crys(k%3,6,.75),k%2?M.ice:M.ice2);o.position.set((k%3-1)*.8+(rn()-.5)*.3,0,-.6+(rn()-.5)*.3);o.scale.set(.5+rn()*.2,2.4+rn()*1.0,.5);o.rotation.set((rn()-.5)*.2,rn()*3,(k%3-1)*-.18);wall.add(o)}
    const slab=new THREE.Mesh(svG('gb_tsl',()=>svLump(1,1,.2,1530)),M.glass);slab.scale.set(1.8,1.8,.6);slab.position.set(0,1.5,-.5);wall.add(slab);LS.twall=wall;
    const lt=new THREE.PointLight(0x5ab8ff,0,11,1.6);lt.position.set(t.x,ty+2.2,t.z);scene.add(lt);LS.lights.push(lt);LS.tlt=lt}
  // the throne's cold light
  {const tl=new THREE.PointLight(0x8ad0ff,1.4,15,1.5);tl.position.set(L.throne.x,y(L.throne.x,L.throne.z)+3,L.throne.z+1);scene.add(tl);LS.lights.push(tl)}
  gb151LairSync();return LS}
function gb151LairSync(){const LS=MQ151.LS;if(!LS)return;const open=MQ151.st>=2;LS.twall.visible=!open;LS.tglo.material.opacity=open?.55:0;LS.tlt.userData.on=open?1.4:0;LS.seal.visible=!!(GB151A&&GB151A.f)}
// ---------------- pillars ----------------
function gb151PillarAt(x,z,rad){for(const P of MQ151.pil)if(P.ok&&Math.hypot(x-P.x,z-P.z)<rad)return P;return null}
function gb151PillarBreak(P){if(!P||!P.ok)return;P.ok=0;P.top.visible=false;P.stump.visible=true;const p=new THREE.Vector3(P.x,0,P.z);
  try{sk146Debris(gY(p,2),gb151Mats().ice,14,.3,6,7,1.6)}catch(_){}burst(gY(p,2.2),0xd8f4ff,90,3.5,3,.9);svShock(p,0xbfe8ff,4.5,.5);svSnd('crack',1.3,.55);svSnd('heavy',1.1,.7);shake(.45)}
function gb151PillarsGrow(){MQ151.pil.forEach(P=>{if(P.ok)return;P.ok=1;P.top.visible=true;P.stump.visible=false;P.top.scale.set(1,.01,1);tw(900,k=>P.top.scale.set(1,Math.max(.01,svEase.o(k)),1));burst(new THREE.Vector3(P.x,GH(P.x,P.z)+1,P.z),0x9ad8ff,30,1.5,3,.7)})}
// a charge ran into a pillar: it shatters; a normal charge leaves him dazed, a Rampage charge also cracks his shell
function gb151Crash(e,P,ramp){const S=e.sv;gb151PillarBreak(P);
  if(ramp&&S.rp){S.crk=(S.crk||0)+1;S.rp.hit++;popT(e.m.position,S.crk>=3?'THE SHELL BREAKS!':'SHELL CRACKED '+S.crk+'/3','#bfe8ff',true);try{flash('rgba(190,230,255,.25)')}catch(_){}}
  svEndMove(e,true);svCast(e,'crash')}
// ---------------- the Glacial Rampage (the controller's part: the three charges and the outcome) ----------------
function gb151RampStart(e){const S=e.sv;gb151PillarsGrow();S.rp={n:0,hit:0};S.crk=0;S.dr=.15;S.rpN=(S.rpN||0)+1;
  say('🧊 Gorthrak armours himself in glacier ice! Stand in front of an ice pillar and make him charge into it.');try{banner('🧊 GLACIAL RAMPAGE','Make him charge into the ice pillars to crack his shell','')}catch(_){}}
function gb151RampNext(e){const S=e.sv,R=S.rp;if(!R)return false;if(S.crk>=3){S.rp=null;S.dr=0;svCast(e,'broken');return true}
  if(R.n<3){R.n++;svCast(e,'rcharge');return true}
  S.rp=null;svCast(e,'rfail');setTimeout(()=>{if(e.sv)e.sv.dr=0},4700);return true}
function gb151Shelters(e){gb151ShelterClear();const M=gb151Mats(),LS=MQ151.LS;
  GB151L.shl.forEach((q,i)=>{const g=new THREE.Group(),y0=GH(q.x,q.z);g.position.set(q.x,y0-1.2,q.z);g.rotation.y=q.a+Math.PI;
    const slab=new THREE.Mesh(svG('gb_shs',()=>svLump(1,1,.25,1540)),M.rock2);slab.scale.set(1.9,.4,1.6);slab.position.set(0,2.6,.2);g.add(slab);
    [-1,1].forEach(s=>{const leg=new THREE.Mesh(svG('gb_shl',()=>svLump(1,1,.3,1541)),M.rock);leg.scale.set(.45,1.3,.5);leg.position.set(s*1.3,1.2,.4);g.add(leg)});
    const ring=new THREE.Mesh(svG('gb_shr',()=>new THREE.RingGeometry(1.75,1.95,32).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:0x9ae8ff,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    ring.position.set(0,1.25,0);g.add(ring);LS.root.add(g);tw(900,k=>g.position.y=y0-1.2+1.2*svEase.o(k));MQ151.sh.push({g,x:q.x,z:q.z,ring})});
  say('⚠ The shell holds! The ceiling is coming down: get under a rock shelter at the cave wall!');try{banner('⚠ AVALANCHE','Get under a glowing rock shelter at the cave wall!','')}catch(_){}}
function gb151ShelterClear(){MQ151.sh.forEach(o=>{try{if(o.g.parent)o.g.parent.remove(o.g)}catch(_){}});MQ151.sh=[]}
function gb151Avalanche(e){const P=pl.position,safe=MQ151.sh.some(o=>Math.hypot(P.x-o.x,P.z-o.z)<2.0),L=GB151L;shake(.7);svSnd('heavy',1.4,.5);svSnd('crack',1.2,.5);svSnd('roar',.8,1.2);
  for(let i=0;i<26;i++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*11.5,p=new THREE.Vector3(L.cx+Math.sin(a)*r,0,L.cz+Math.cos(a)*r);if(MQ151.sh.some(o=>Math.hypot(p.x-o.x,p.z-o.z)<2.2))continue;setTimeout(()=>gb151Icicle(p,Math.random()<.4,.3),Math.random()*500)}
  setTimeout(()=>{if(!GB151A||!GB151A.f)return;if(!safe&&hero.hp>0&&!(hero.iv>0)){bossHit(e,2.4);gb151Frost(2)}else if(safe)dn(P,'Sheltered!','#9ae8ff',-20,1200)},420);
  setTimeout(()=>{MQ151.sh.forEach(o=>{const y1=o.g.position.y;tw(1200,k=>o.g.position.y=y1-1.3*k,()=>{if(o.g.parent)o.g.parent.remove(o.g)})});MQ151.sh=[]},1800)}
// Phase II: the Maw groans; icicles keep falling near you (a warning, then the fall)
function gb151Quake(on){MQ151.quake=on?1:0;MQ151.qT=1.5}
function gb151QuakeTick(e,dt){if(!MQ151.quake||!GB151A||!GB151A.f)return;const S=e.sv;if(S.rp||(S.mv&&(S.mv.id==='rfail'||S.mv.id==='rampage')))return;MQ151.qT-=dt;if(MQ151.qT>0)return;MQ151.qT=1.4+Math.random()*1.0;
  const v=S.hv||{x:0,z:0},a=Math.random()*6.283,r=Math.random()*2.6,p=gb151HeroIn(new THREE.Vector3(pl.position.x+v.x*.6+Math.cos(a)*r,0,pl.position.z+v.z*.6+Math.sin(a)*r));
  const an={x:p.x,z:p.z,a:0},W=svWarn({k:'c',r:1.3},an,.95,{});setTimeout(()=>{if(GB151A&&GB151A.f)gb151Icicle(p,false,.32)},630);
  setTimeout(()=>{if(!GB151A||!GB151A.f||e.dead)return;if(svIn({k:'c',r:1.3},an,pl.position,.25)&&hero.hp>0&&!(hero.iv>0)){bossHit(e,.6);gb151Frost(1)}},950)}

// ---------------- the fight ----------------
var GB151B={name:'Gorthrak',col:GB151.col,body:1.9,ph2:.55,poise:.1,headJ:'head',turnA:3.2,edge:1.9,
  ai:{pref:3.6,walk:2.2,run:3.6,turn:2.4,rest:[.8,1.4],ph2r:.68,strafe:.45},
  build:gb151Build,loco:gb151Loco,post:gb151Post,P:GB151P,M:GB151M,spr:{earL:[60,8,1],earR:[60,8,1],loinF:[34,6,1.5],loinB:[34,6,1.5]},
  stag:[[.25,'stag','o'],[2.2,'stag','l',.025],[2.75,'rec','io']],stagT:2.75,
  die:[[.4,'stag','o'],[1.4,'dead','i'],[2.3,'dead','l']]};
GB151B.M.stagger=svStagDef(GB151B);
function gb151Spawn(){if(MQ151.e&&!MQ151.e.dead&&enemies.includes(MQ151.e))return MQ151.e;if(MQ151.st>=2)return null;const L=GB151L,key='gorthrak';
  if(!EN[key])EN[key]=Object.assign({},EN.troll,{n:'Gorthrak',e:'🧌'});try{MSET[key]=[]}catch(_){}
  const c=enemyC(key,MQ151.lv,{boss:1});c.n='Gorthrak';const m=cr(c);m.position.set(L.home.x,0,L.home.z);m.rotation.y=0;scene.add(m);
  const hb=bar(true);hb.scale.setScalar(3);
  const e={c,m,hb,boss:1,gb151:1,tier:4,home:[L.home.x,L.home.z],cd:1,ch:0,vx:0,vz:0,agg:0,bs:{t:99,lock:0,ph:1,last:'',ult:99,pb:99},wx:L.home.x,wz:L.home.z,wt:0,dots:[]};enemies.push(e);
  m.children.forEach(o=>{o.visible=false});const R=svRig();gb151Build(R,e);svRest(R);try{svMerge(R)}catch(err){console.error('gb merge',err)}const bs=m.bs||m.scale.x||1;R.root.scale.setScalar(1/bs);R.root.name='svgb';m.add(R.root);
  const O={};for(const k in R.J)O[k]=[0,0,0,0,0,0];
  e.sv={i:'gb',B:GB151B,R,O,P:{},snap:{},aw:0,trk:null,tt:0,mv:null,ph:1,rest:1.5,last:[],cd:{},po:0,poT:0,stg:0,inv:0,spd:0,lp:m.position.clone(),hero:1,body:GB151B.body,on:false,wait:0,act:0,fl:0,chg:0,dr:0,shell:0,crk:0};
  GB151A={cx:L.cx,cz:L.cz,r:L.r,hr:L.hr,y:L.y,f:false};svApply(e,0,performance.now());MQ151.e=e;return e}
function gb151Start(e){const S=e.sv,A=GB151A;if(!A||A.f)return;A.f=true;e.agg=1;S.on=false;S.ph=1;e.bs.ph=1;S.rest=1;S.po=0;MQ151.ft=0;gb151LairSync();
  if(riding)try{dismount()}catch(_){}try{setTarget(e)}catch(_){}
  try{zt116Show(ZT116.Z[2],'The Frozen Maw','Gorthrak','the Glacierback · warlord of the frozen deep','A wall of ice has sealed the way out','z2')}catch(_){}
  svSnd('crack',1,.6)}
// back to the start (a wipe, or the hero left the cave): full health, home, Phase I, pillars regrown, every leftover gone
function gb151Reset(why){const e=MQ151.e,A=GB151A;if(A)A.f=false;gb151Quake(false);gb151ShelterClear();gb151PillarsGrow();gb151FbSet(0);gb151LairSync();if(!e||e.dead)return;const S=e.sv;
  svEndMove(e,true);S.stgM=null;S.on=false;S.ph=1;e.bs.ph=1;S.po=0;S.stg=0;S.inv=0;S.cd={};S.dr=0;S.chg=0;S.chgT=0;S.last=[];S.rpN=0;S.rp=null;S.shell=0;S.crk=0;gb151HandRock(e,false);e.agg=0;e.c.h=M(e.c);
  e.m.position.set(GB151L.home.x,0,GB151L.home.z);e.m.rotation.y=0;if(why)setTimeout(()=>say('🧌 Gorthrak lumbers back to his throne and settles down. He waits.'),900)}
// he falls: the ice over the passage bursts
function gb151Won(e){const A=GB151A;if(A)A.f=false;MQ151.st=Math.max(MQ151.st,2);MQ151.trkK='';gb151Quake(false);gb151ShelterClear();gb151FbSet(0);
  const LS=MQ151.LS;setTimeout(()=>{if(!LS)return;const t=GB151L.tun,p=new THREE.Vector3(t.x,0,t.z);try{sk146Debris(gY(p,2),gb151Mats().ice,18,.3,7,7,1.8)}catch(_){}burst(gY(p,2),0xd8f4ff,90,4,3,1);svShock(p,0xbfe8ff,6,.7);svSnd('crack',1.3,.5);svSnd('bell',.8,.9);shake(.4);gb151LairSync()},1800);
  setTimeout(()=>{try{zt116Show(ZT116.Z[2],'The Frozen Maw','Gorthrak Falls','The wall of ice over the passage at the back of the cave bursts','The frozen passage leads to '+mq151Next(),'z2');mSfx('victory')}catch(_){}say('🧌 Gorthrak the Glacierback is slain. The frozen passage at the back of the cave is open.')},2400);
  try{hud()}catch(_){}}
// ---------------- moving in and out ----------------
function mq151Enter(){if(MQ151.st<1){MQ151.st=1;MQ151.trkK=''}fadeTo(()=>{const L=GB151L;toPos(L.ent.x,L.ent.z,0);
  setTimeout(()=>{try{zt116Show(ZT116.Z[2],'Burningeye Summit · '+PMAP[2].ins[0].n.replace(/^Burningeye Summit /,''),'The Frozen Maw',MQ151.st<2?'Something huge breathes frost in the dark':'The cave is quiet now','','z2')}catch(_){}},300)})}
function mq151Leave(){const G=mq151Gate();fadeTo(()=>{toPos(G.x+G.fx*3.2,G.z+G.fz*3.2,G.ry)})}
function mq151Through(){MQ151.st=3;MQ151.trkK='';try{insGo(PMAP[2].ins[1])}catch(err){console.error('v151 passage',err)}}
// a save made in the cave loads at the cave mouth (2440 would send it home)
{const f=wv135Out;wv135Out=function(){try{if(mq151InCave()){const G=mq151Gate();toPos(G.x+G.fx*3.2,G.z+G.fz*3.2,G.ry);return}}catch(_){}return f.apply(this,arguments)}}
{const f=doRecall;doRecall=function(){if(GB151A&&GB151A.f&&mq151InCave())return say('🧊 A wall of ice has sealed the cave. There is no escape.');return f.apply(this,arguments)}}
// ---------------- prompts ----------------
function mq151Prompt(){const P=pl.position;if(!mq151InCave())return null;const L=GB151L;if(GB151A&&GB151A.f)return null;
  if(Math.hypot(P.x-L.mouth.x,P.z-L.mouth.z)<2.6)return {label:'F · Leave the cave (back to '+PMAP[2].ins[0].n+')',fn:()=>mq151Leave()};
  if(Math.hypot(P.x-L.tunIn.x,P.z-L.tunIn.z)<2.8)return MQ151.st>=2?{label:'F · Take the frozen passage to '+mq151Next(),fn:()=>mq151Through()}:{label:'🔒 The passage is sealed by a wall of ice',fn:()=>say('🧊 A wall of ancient ice seals the passage. The troll who sits on that throne keeps it shut.')};
  return null}
{const f=worldPrompt;worldPrompt=function(){try{const r=mq151Prompt();if(r)return r}catch(e){if(!MQ151.err++)console.warn('v151 prompt',e)}return f.apply(this,arguments)}}
function mq151AtGate(){if(!mq151In1())return false;const G=mq151Gate(),P=pl.position;return Math.hypot(P.x-(G.x+G.fx*.8),P.z-(G.z+G.fz*.8))<3.2}
{const f=portalPrompt;portalPrompt=function(){try{if(mq151AtGate())return {label:'F · Enter the ice cave'+(MQ151.st>=2?' (the passage to '+mq151Next()+')':' · the Frozen Maw'),fn:()=>mq151Enter()}}catch(_){}return f.apply(this,arguments)}}
// ---------------- the tracker (chapter 1 in the main-quest box, in Burningeye I and the cave) ----------------
(function(){const st=document.createElement('style');st.textContent='#mqt143.z2 .k{color:#8ac8e8}#mqt143.z2 .h{color:#d4f0ff}';document.head.appendChild(st)})();
{const f=mq143Trk;mq143Trk=function(){try{if(mq151In1()||mq151InCave()){MQ143.trkK='';return mq151Trk()}}catch(err){if(!MQ151.err++)console.warn('v151 trk',err)}MQ151.trkK='';return f.apply(this,arguments)}}
function mq151Trk(){const el=$('mqt143');if(!el)return;const hide=(typeof uiOpen=='function'&&uiOpen())||(mq151Done()&&mq151In1()&&insReach(2)>=1);
  const st=mq151Done()?3:MQ151.st,cave=mq151InCave(),fight=!!(GB151A&&GB151A.f),key=(hide?'h':'s')+st+cave+fight;if(key===MQ151.trkK)return;MQ151.trkK=key;
  if(hide){el.classList.add('hide');mq143TrkPos();return}
  const o=a=>`<div class="o"><span>${a}</span></div>`;let h='<div class="k">⚜ Main quest · Burningeye Summit</div><div class="h">'+MQ151.name+'</div>';
  if(st<=1&&!cave)h+=o('Find the ice cave at the end of the road');
  else if(st<=1)h+=o(fight?'Slay Gorthrak the Glacierback':'Face the troll on the throne of ice');
  else if(st==2)h+=o(cave?'Take the frozen passage at the back of the cave':'Go through the Frozen Maw to '+mq151Next());
  else h+='<div class="o d"><span>Go through the Frozen Maw to '+mq151Next()+'</span></div>';
  el.innerHTML=h;el.classList.add('z2');el.classList.remove('hide');mq143TrkPos()}
// the tracker box keeps its zone class only in Burningeye (the Kindlelight chapters draw without it)
{const f=mq143Trk;mq143Trk=function(){const r=f.apply(this,arguments);try{const el=$('mqt143'),I=mq151Ins();if(el&&!(I&&I.z===2))el.classList.remove('z2')}catch(_){}return r}}
// ---------------- the N map: the ice cave ----------------
{const f=openWMap;openWMap=function(){const r0=f.apply(this,arguments);try{const I=INSL[insG(2,0)];if(mq151In1()){const c=$('wmc'),g=c.getContext('2d'),k=Math.min(1060/I.w,640/I.h),G=mq151Gate(),x=(G.x-I.x0+.5)*k,y=(G.z-I.y0+.5)*k;
  g.font='700 12px system-ui,sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText('Ice Cave',x,y-14);g.fillStyle='#bfe8ff';g.fillText('Ice Cave',x,y-14)}}catch(e){console.warn('v151 wmap',e)}return r0}}
// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.mq151={v:151,st:MQ151.st,seen:MQ151.seen|0}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.mq151;MQ151.st=q&&typeof q=='object'?Math.max(0,Math.min(3,q.st|0)):0;MQ151.seen=q&&q.seen|0;MQ151.trkK='';
    if(GB151A&&GB151A.f)gb151Reset();if(MQ151.e&&MQ151.st>=2&&!MQ151.e.dead){try{removeE(MQ151.e)}catch(_){}MQ151.e=null}gb151LairSync()}catch(err){console.warn('v151 load',err)}return r}}
// ---------------- hooks: his AI, his death, starting the fight, the HUD ----------------
{const f=eTick;eTick=function(e,dt,now){if(e&&e.gb151){try{gb151AI(e,dt,now)}catch(err){if(!MQ151.err++)console.error('v151 ai',err)}return true}return f.apply(this,arguments)}}
{const f=kill;kill=function(e){const r=f.apply(this,arguments);if(e&&e.gb151)try{gb151Won(e)}catch(err){console.error('v151 won',err)}return r}}
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.gb151&&e.sv&&!e.dead&&!(GB151A&&GB151A.f)&&mq151InCave()&&hero.hp>0)gb151Start(e);return f.apply(this,arguments)}}
function gb151Hud(){const e=MQ151.e,on=!!(e&&!e.dead&&GB151A&&GB151A.f&&mq151InCave());let p=document.getElementById('gbPo');if(!on){if(p)p.style.display='none';return}
  const b=$('boss');if(!b)return;b.classList.remove('hide');const S=e.sv;$('bossN').textContent='🧌 Gorthrak · the Glacierback · Phase '+(S.ph>1?'II':'I')+(S.shell>0?' · ice shell '+(S.crk||0)+'/3 cracked':'');$('bossB').style.width=Math.max(0,100*e.c.h/M(e.c))+'%';
  if(!p){p=document.createElement('div');p.id='gbPo';p.style.cssText='height:5px;margin:4px auto 0;width:70%;background:rgba(0,0,0,.6);border:1px solid rgba(255,216,96,.35);border-radius:2px;overflow:hidden';p.innerHTML='<i style="display:block;height:100%;width:0;background:linear-gradient(90deg,#c89020,#ffe080);transition:width .12s"></i>';const mt=b.querySelector('.meter');if(mt)mt.after(p);else b.appendChild(p)}
  p.style.display='block';p.firstChild.style.width=(S.stg>0?100:Math.min(100,S.po*100)).toFixed(1)+'%';p.firstChild.style.background=S.stg>0?'#fff4c0':'linear-gradient(90deg,#c89020,#ffe080)'}
{const f=hud;hud=function(){const r=f.apply(this,arguments);try{gb151Hud()}catch(_){}return r}}
// his AI: the Sovereign engine's moves, picks and rests; his own footwork, the pillars and the cave
function gb151AI(e,dt,now){const S=e.sv,A=GB151A,m=e.m;if(!A)return;if(e.hb)e.hb.visible=false;m.visible=mq151InCave();
  const dx=m.position.x-S.lp.x,dz=m.position.z-S.lp.z;S.lp.copy(m.position);const ms=dt>0?Math.hypot(dx,dz)/dt:0;S.spd+=((ms>12?0:ms)-S.spd)*Math.min(1,dt*8);
  for(const k in S.cd)S.cd[k]=Math.max(0,S.cd[k]-dt);S.inv=Math.max(0,S.inv-dt);gb151FrostTick();
  if(!(S.mv&&S.mv.id==='rampage'))S.chg=(S.chg||0)+((S.chgT||0)-(S.chg||0))*Math.min(1,dt*3);
  if(!S.rp&&!(S.mv&&(S.mv.id==='rampage'||S.mv.id==='rfail'||S.mv.id==='crash'||S.mv.id==='rcharge')))S.shell=Math.max(0,(S.shell||0)-dt*.8);
  {const p=pl.position;if(S.hp0&&dt>0){const vx=(p.x-S.hp0.x)/dt,vz=(p.z-S.hp0.z)/dt,a=Math.min(1,dt*6);if(Math.hypot(vx,vz)<20){S.hv=S.hv||{x:0,z:0};S.hv.x+=(vx-S.hv.x)*a;S.hv.z+=(vz-S.hv.z)*a}}S.hp0={x:p.x,z:p.z}}
  if(!A.f){// waiting before his throne: breathe, face the cave mouth, heal; the fight starts when you come close
    if(S.mv)svEndMove(e,true);e.agg=0;const hx=GB151L.home.x-m.position.x,hz=GB151L.home.z-m.position.z,hl=Math.hypot(hx,hz);
    if(hl>.6){walkM(m,hx/hl*2*dt,hz/hl*2*dt);m.rotation.y=Math.atan2(hx,hz)}else m.rotation.y+=svAng(0-m.rotation.y)*Math.min(1,dt*2);
    e.c.h=Math.min(M(e.c),e.c.h+M(e.c)*dt*.2);S.po=0;
    if(mq151InCave()&&hero.hp>0&&MQ151.st<2&&Math.hypot(pl.position.x-m.position.x,pl.position.z-m.position.z)<9.5)gb151Start(e);
    svApply(e,dt,now);return}
  if(hero.hp<=0||!mq151InCave()||(typeof AWD!='undefined'&&AWD.dead)){gb151Reset(true);svApply(e,dt,now);return}
  MQ151.ft=(MQ151.ft||0)+dt;e.agg=1;
  if(!S.on){S.on=true;S.ph=1;e.bs.ph=1;S.rest=1;S.po=0;svCast(e,'intro')}
  if(now-S.poT>3500)S.po=Math.max(0,S.po-dt*.1);
  // troll blood: he heals while his Rampage shell holds
  if(S.rp&&S.dr>0)e.c.h=Math.min(M(e.c),e.c.h+M(e.c)*dt*.006);
  if(S.mv)svTickMove(e,dt,now);
  else if(S.rp&&gb151RampNext(e)){}
  else if(S.ph===1&&e.c.h/M(e.c)<=GB151B.ph2)svCast(e,'awaken');
  else{gb151Move(e,dt);S.rest-=dt;if(S.rest<=0){const id=svPick(e);if(id)svCast(e,id);else S.rest=.25}}
  gb151Clamp(m.position,GB151B.edge);gb151QuakeTick(e,dt);
  // keep the hero in the cave, out of his body and out of the pillars; keep him out of the pillars too (except a charge, which crashes)
  {const p=pl.position,hx=p.x-A.cx,hz=p.z-A.cz,hd=Math.hypot(hx,hz);if(hd>A.hr){p.x=A.cx+hx/hd*A.hr;p.z=A.cz+hz/hd*A.hr}}
  if(!S.ghost&&!S.rmOn&&hero.hp>0){const hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,hl=Math.hypot(hx,hz),R0=S.body;if(hl<R0&&hl>.001){const k=R0-hl;pl.position.x+=hx/hl*k;pl.position.z+=hz/hl*k}}
  for(const P of MQ151.pil){if(!P.ok)continue;const push=(o,r)=>{const qx=o.x-P.x,qz=o.z-P.z,ql=Math.hypot(qx,qz);if(ql<r&&ql>.001){o.x=P.x+qx/ql*r;o.z=P.z+qz/ql*r}};push(pl.position,1.15);if(!(S.mv&&(S.mv.id==='charge'||S.mv.id==='rcharge')))push(m.position,S.body+.9)}
  svApply(e,dt,now)}
// footwork: close to his preferred range, circle when there, a short back-off when crowded; slides along the cave's edge
function gb151Move(e,dt){const S=e.sv,ai=GB151B.ai,m=e.m,v=V().subVectors(pl.position,m.position).setY(0),L=v.length()||.01;
  const da=svAng(Math.atan2(v.x,v.z)-m.rotation.y),tr=ai.turn*(S.ph>1?1.2:1);m.rotation.y+=Math.max(-tr*dt,Math.min(tr*dt,da));
  let sp=0,ux=0,uz=0;const ws=ai.walk*(S.ph>1?1.15:1);
  if(L>ai.pref+1.2){sp=L>ai.pref+7?ai.run:ws;ux=v.x/L;uz=v.z/L}else if(L<2.0){sp=ws*.6;ux=-v.x/L;uz=-v.z/L}
  else{S.sdT=(S.sdT||0)-dt;if(S.sdT<=0){S.sdT=1.8+Math.random()*2.2;S.sd=Math.random()<.5?-1:1}sp=ws*ai.strafe;ux=-v.z/L*(S.sd||1);uz=v.x/L*(S.sd||1)}
  const A=GB151A,rx=m.position.x-A.cx,rz=m.position.z-A.cz,rl=Math.hypot(rx,rz)||.01;if(rl>A.r-2.5){const nx=rx/rl,nz=rz/rl,out=ux*nx+uz*nz;if(out>0){ux-=nx*out;uz-=nz*out}}
  if(sp>0&&Math.abs(da)<1.4)walkM(m,ux*sp*dt,uz*sp*dt);else sp=0;S.walkSp=sp}
// ---------------- the world tick: the cave mouth, the cave ----------------
function mq151Tick(dt,now){const in1=mq151In1(),cave=mq151InCave(),t=now/1000;
  if(in1&&!MQ151.CM)try{gb151MouthBuild()}catch(err){console.error('v151 mouth',err);MQ151.err++}
  if(MQ151.CM){MQ151.CM.g.visible=in1;if(in1){MQ151.CM.glow.material.opacity=.38+.1*Math.sin(t*1.3);const G=mq151Gate();if(Math.random()<dt*3)burst(new THREE.Vector3(G.x+(Math.random()-.5)*3,GH(G.x,G.z)+.4+Math.random()*2,G.z+(Math.random()-.5)*.6),0xe8f6ff,1,.2,.4,1)}}
  if(cave){if(!MQ151.LS)try{gb151LairBuild()}catch(err){console.error('v151 lair',err);MQ151.err++}
    if(MQ151.st<2&&!(MQ151.e&&enemies.includes(MQ151.e)))try{gb151Spawn()}catch(err){console.error('v151 spawn',err);MQ151.err++}
    if(!MQ151.seen)MQ151.seen=1;if(MQ151.st<1){MQ151.st=1;MQ151.trkK=''}}
  const LS=MQ151.LS;if(LS){LS.root.visible=cave;LS.lights.forEach(l=>{const want=l===LS.tlt?(l.userData.on||0):l.userData.i0!=null?l.userData.i0:(l.userData.i0=l.intensity);l.intensity=cave?want:0});
    if(cave){LS.falls.forEach(f=>{f.m.material.emissiveIntensity=.35+.12*Math.sin(t*1.4+f.ph)});LS.floorM.emissiveIntensity=.45+.08*Math.sin(t*.8)+(MQ151.quake?.12:0);
      const ramp=!!(MQ151.e&&MQ151.e.sv&&MQ151.e.sv.rp);MQ151.pil.forEach((P,i)=>{if(P.ok){P.core.material.opacity=ramp?.6+.3*Math.sin(t*7+i):.3+.06*Math.sin(t*1.2+i)}});
      if(MQ151.sh.length)MQ151.sh.forEach(o=>{o.ring.material.opacity=.55+.3*Math.sin(t*8)});
      if(Math.random()<dt*4){const m=GB151L.mouth;burst(new THREE.Vector3(m.x+(Math.random()-.5)*3,GH(m.x,m.z)+3+Math.random(),m.z+(Math.random()-.5)*2),0xeef6ff,1,.2,-.5,1.6)}
      if(LS.seal.visible)LS.seal.material.opacity=.45+.08*Math.sin(t*2)}}
  if(now-MQ151.t>400){MQ151.t=now;try{if(in1||cave)mq143Trk()}catch(_){}}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{mq151Tick(dt,now)}catch(err){if(!MQ151.err++)console.warn('v151 tick',err)}return r}}
