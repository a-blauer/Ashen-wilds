// ================= v144 The Glowmire Crystal — Kindlelight II main quest: the hatch, the Seeping Lair, Vorraxis, the crystal =================
// Chapter 2 of Kindlelight's main quest line (chapter 1, The Lantern Road, is v143). In Kindlelight II the gateway to III is sealed.
//  * Clear the Glowmire Warren (the camp of instance II furthest from its entrance) and a hatch grinds open in the middle of it; it
//    stays open from then on. F at the hatch: down into the Seeping Lair.
//  * The Seeping Lair is Kindlelight's unused Wave Trial instance (INSL[4], k 4: a sealed round arena ~14 tiles across in radius, half
//    the Den's arena), dressed as a caustic goo cave: a wet rock floor veined with glowing ooze, boulder walls, stalagmites, ooze falls,
//    glowing fungus, Akidon husks, a ladder up to the hatch, and at the back a dais with the floating Glowmire Crystal.
//  * Vorraxis, the Seeping King (model 3031, moves 3032) waits in front of the crystal. Walking close starts the fight: the ladder seals
//    with ooze (and recall is blocked) until he falls or you do. A wipe resets him. Fought once (MQ144.st ≥ 2: he never returns).
//  * When he dies the ooze shell around the crystal bursts; F at the dais claims the Glowmire Crystal (st 3): the gateway at the end
//    of Kindlelight II wakes (its F prompt is locked until then; the crystal floats above the arch afterwards).
// State MQ144.st: 0 · 1 hatch open · 2 Vorraxis slain · 3 crystal claimed. Done also when III has been reached (mq144Done). Saved as
// x2.mq144 {st, seen}. A save made in the lair loads at the hatch. Co-op: local to each player (e.boss is never shared, so each
// player in the lair fights their own Vorraxis); partners' kills still clear the camp for you.
var MQ144={st:0,seen:0,name:'The Glowmire Crystal',boss:'Vorraxis',title:'the Seeping King',lv:7,S:null,LS:null,e:null,trkK:'',t:0,err:0,flood:0,floodT:0,ft:0,isl:[],sacs:[]};
function mq144Done(){return MQ144.st>=3||insReach(0)>=2}
function mq144In2(){try{const I=curIns();return !!I&&I.g===1}catch(_){return false}}
function mq144InLair(){try{const I=curIns();return !!I&&I.g===4}catch(_){return false}}
function mq144Next(){try{const t=typeof TH112!='undefined'&&TH112&&TH112.byG&&TH112.byG[2];return t&&t.nm?t.nm:PMAP[0].ins[2].n}catch(_){return 'the Rotwood'}}
// the lair: Kindlelight's Wave Trial instance becomes the Seeping Lair (name and level only; it keeps its grid place)
var MB144L=(()=>{const T=INSL[4];try{T.n='The Seeping Lair';T.rn='The Seeping Lair';T.lv=[MQ144.lv,MQ144.lv]}catch(_){}
  const cx=T.wa[0],cz=T.wa[1];return {T,cx,cz,y:GH(cx,cz),ent:{x:cx,z:cz+10.2},lad:{x:cx,z:cz+12.4},home:{x:cx,z:cz-2.2},dais:{x:cx,z:cz-10.6},r:11.6,hr:12.6}})();
function mb144DaisSpot(){return new THREE.Vector3(MB144L.dais.x,0,MB144L.dais.z+2.1)}
// the camp with the hatch: Kindlelight II's camp furthest from the entrance
function mq144Camp(){if(MQ144.C!==undefined)return MQ144.C;const I=INSL[1];let b=null,bd=-1;try{CAMPS.forEach(C=>{if(C.ig!==1)return;const d=Math.hypot(C.x-I.en[0],C.z-I.en[1]);if(d>bd){bd=d;b=C}})}catch(_){}return MQ144.C=b}
function mq144HatchSpot(){if(MQ144.hs)return MQ144.hs;const C=mq144Camp();if(!C)return null;let best=null;
  for(let r=0;r<=4&&!best;r+=.5)for(let a=0;a<6.28&&!best;a+=.35){const x=C.x+Math.cos(a)*r,z=C.z+Math.sin(a)*r;if(!solid(Math.round(x),Math.round(z))&&!solid(Math.round(x+1),Math.round(z))&&!solid(Math.round(x),Math.round(z+1))&&!solid(Math.round(x-1),Math.round(z))&&!solid(Math.round(x),Math.round(z-1)))best={x,z}}
  return MQ144.hs=best||{x:C.x,z:C.z}}

// ---------------- models: the hatch, the lair, the crystal ----------------
var MB144G={};
function mb144Mats(){return MB144G.m||(MB144G.m={rock:new THREE.MeshStandardMaterial({color:0x2c2c27,roughness:.85,flatShading:true}),rock2:new THREE.MeshStandardMaterial({color:0x3a3830,roughness:.9,flatShading:true}),
  wet:new THREE.MeshStandardMaterial({color:0x1b1d16,roughness:.32,metalness:.22,flatShading:true}),bone:new THREE.MeshStandardMaterial({color:0xb8ae8c,roughness:.7,flatShading:true}),
  chit:new THREE.MeshStandardMaterial({color:0x17180f,roughness:.38,metalness:.25,flatShading:true}),ooze:new THREE.MeshStandardMaterial({color:0x1e4a0e,emissive:0x5ad01a,emissiveIntensity:.8,roughness:.25,flatShading:true}),
  glow:new THREE.MeshBasicMaterial({color:0xb8ff3a}),cap:new THREE.MeshBasicMaterial({color:0x9aff4a}),wood:new THREE.MeshStandardMaterial({color:0x3e2c1c,roughness:.9,flatShading:true}),
  iron:new THREE.MeshStandardMaterial({color:0x34343a,roughness:.5,metalness:.55,flatShading:true}),crys:new THREE.MeshStandardMaterial({color:0x7aff4a,emissive:0x5aff2a,emissiveIntensity:1.1,roughness:.15,metalness:.1,flatShading:true,transparent:true,opacity:.92})})}
function mb144Hatch(){const M=mb144Mats(),g=new THREE.Group();g.userData.psNo=1;
  g.add(lgGroup('MB144|hatchRim',k=>{for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.p('','dod','c',i%2?0x3a3830:0x2c2c27,Math.sin(a)*1.25,.08,Math.cos(a)*1.25,.32,.22,.26,i,a,0)}
    k.p('','tor','m',0x34343a,0,.12,0,1.05,.16,1.05);k.p('','ring','m',0x50525a,0,.2,0,1.06,.5,1.06);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.2;k.p('','cone4','c',0x17180f,Math.sin(a)*1.45,.15,Math.cos(a)*1.45,.12,.4,.08,-.5*Math.cos(a),a,.5*Math.sin(a))}
    k.p('','box','m',0x222226,0,.2,-1.0,.5,.12,.18)},.14));
  // the shaft: a dark mouth, a green glow from below, the top rungs of a ladder
  const mouth=new THREE.Mesh(svG('mb_hm',()=>new THREE.CircleGeometry(.95,20).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:0x050806}));mouth.position.y=.13;g.add(mouth);
  const glo=new THREE.Mesh(svG('mb_hg',()=>new THREE.CircleGeometry(.8,20).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:0x5ad01a,map:SPR,transparent:true,opacity:.0,blending:THREE.AdditiveBlending,depthWrite:false}));glo.position.y=.15;g.add(glo);
  const lad=lgGroup('MB144|hatchLad',k=>{[-1,1].forEach(s=>k.p('','box','c',0x3e2c1c,s*.28,-.3,.3,.06,1.0,.06));for(let i=0;i<3;i++)k.p('','box','c',0x56402a,0,-.05-i*.28,.3,.58,.05,.05)},.12);g.add(lad);
  // the lid on its hinge (at -z): iron, riveted, crusted with chitin, an ooze rune
  const hinge=new THREE.Group();hinge.position.set(0,.2,-.95);g.add(hinge);
  const lid=lgGroup('MB144|hatchLid',k=>{k.p('','cyl','m',0x34343a,0,0,.95,.95,.1,.95);k.p('','ring','m',0x50525a,0,.06,.95,.8,.4,.8);
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;k.p('','sph','m',0xa8a090,Math.sin(a)*.82,.06,.95+Math.cos(a)*.82,.03)}
    k.p('','box','m',0x222226,0,.07,.95,1.6,.04,.12);k.p('','box','m',0x222226,0,.07,.95,.12,.04,1.6);k.p('','ring','m',0x50525a,0,.09,1.65,.12,.6,.12,Math.PI/2,0,0);
    for(let i=0;i<5;i++){const a=i*1.3,r=.3+i*.09;k.p('','dod','c',0x17180f,Math.sin(a)*r,.08,.95+Math.cos(a)*r,.14,.06,.12,0,a,0)}
    k.p('','tor','g',0x9aff3a,0,.075,.95,.32,.01,.32);k.p('','oct','g',0xb8ff3a,0,.08,.95,.08,.02,.12)},.12);hinge.add(lid);
  return {g,hinge,glo}}
function mb144Crystal(){const M=mb144Mats(),g=new THREE.Group();g.userData.psNo=1;
  const main=new THREE.Mesh(svG('mb_cr',()=>{const q=new THREE.OctahedronGeometry(.42,0);q.scale(1,2.1,1);return q.toNonIndexed()}),M.crys);g.add(main);
  const core=kqSpr(0xd8ff7a,2.4);g.add(core);const sh=[];for(let i=0;i<5;i++){const o=new THREE.Mesh(svG('mb_cs',()=>{const q=new THREE.OctahedronGeometry(.13,0);q.scale(1,2.2,1);return q.toNonIndexed()}),M.crys);g.add(o);sh.push(o)}
  return {g,main,core,sh}}
// the lair dressing: floor, walls, stalagmites, ooze falls and pools, fungus, husks, the dais and the ladder
function mb144LairBuild(){if(MQ144.LS)return MQ144.LS;const L=MB144L,M=mb144Mats(),root=new THREE.Group();root.name='SeepingLair';scene.add(root);const LS={root,lights:[],falls:[],t:0};MQ144.LS=LS;
  const rn=svRng(1441),y=(x,z)=>GH(x,z);
  // the floor: wet dark rock, cracks, glowing ooze veins (painted), soft edge
  {const cv=document.createElement('canvas');cv.width=cv.height=512;const c=cv.getContext('2d');c.fillStyle='#1c1d17';c.fillRect(0,0,512,512);
    for(let i=0;i<1400;i++){const g=20+rn()*28|0;c.fillStyle=`rgba(${g},${g+3},${g-4},.5)`;c.beginPath();c.arc(rn()*512,rn()*512,2+rn()*10,0,6.283);c.fill()}
    c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=2;for(let i=0;i<40;i++){c.beginPath();let x=rn()*512,z=rn()*512;c.moveTo(x,z);for(let k=0;k<6;k++){x+=(rn()-.5)*60;z+=(rn()-.5)*60;c.lineTo(x,z)}c.stroke()}
    const em=document.createElement('canvas');em.width=em.height=512;const e2=em.getContext('2d');e2.fillStyle='#000';e2.fillRect(0,0,512,512);
    for(let i=0;i<22;i++){e2.strokeStyle=`rgba(${90+rn()*60|0},255,${40+rn()*40|0},${.5+rn()*.4})`;e2.lineWidth=1.5+rn()*3;e2.beginPath();let x=256+(rn()-.5)*460,z=256+(rn()-.5)*460;e2.moveTo(x,z);
      for(let k=0;k<8;k++){x+=(rn()-.5)*70;z+=(rn()-.5)*70;e2.lineTo(x,z)}e2.stroke()}
    for(let i=0;i<18;i++){const x=256+(rn()-.5)*440,z=256+(rn()-.5)*440,r=6+rn()*18,gr=e2.createRadialGradient(x,z,0,x,z,r);gr.addColorStop(0,'rgba(170,255,70,.9)');gr.addColorStop(1,'rgba(0,0,0,0)');e2.fillStyle=gr;e2.beginPath();e2.arc(x,z,r,0,6.283);e2.fill()}
    const al=document.createElement('canvas');al.width=al.height=128;const a2=al.getContext('2d'),gr=a2.createRadialGradient(64,64,48,64,64,64);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#000');a2.fillStyle=gr;a2.fillRect(0,0,128,128);
    const R0=15.5,geo=new THREE.PlaneGeometry(R0*2,R0*2,44,44);geo.rotateX(-Math.PI/2);const P=geo.attributes.position;for(let k=0;k<P.count;k++){const x=P.getX(k)+L.cx,z=P.getZ(k)+L.cz;P.setXYZ(k,x,y(x,z)+.04,z)}geo.computeVertexNormals();
    const fm=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(cv),emissiveMap:new THREE.CanvasTexture(em),emissive:0x6ae02a,emissiveIntensity:.55,roughness:.42,metalness:.18,transparent:true,alphaMap:new THREE.CanvasTexture(al),polygonOffset:true,polygonOffsetFactor:-2});
    fm.userData.noFade135=1;const fl=new THREE.Mesh(geo,fm);fl.receiveShadow=true;fl.userData.noFade135=1;root.add(fl);LS.floorM=fm}
  // the walls: overlapping boulders on the slope round the arena, wet ones near the ooze falls
  const lump=(k,r,det,j)=>svG('mbl'+k,()=>svLump(r,det,j||.35,90+k));
  for(let i=0;i<34;i++){const a=i/34*Math.PI*2+rn()*.12;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a))-Math.PI/2)<.12)continue;   // the ladder's gap (south, +z)
    const r=14.4+rn()*1.6,x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r,s=1.6+rn()*1.6,o=new THREE.Mesh(lump(i%6,1,1),i%5==0?M.wet:i%2?M.rock:M.rock2);
    o.position.set(x,y(x,z)+s*.25,z);o.scale.set(s*1.3,s*(1.4+rn()*.8),s*1.2);o.rotation.set(rn()*.5,rn()*6.28,rn()*.5);o.castShadow=true;o.receiveShadow=true;root.add(o)}
  for(let i=0;i<22;i++){const a=rn()*Math.PI*2,r=12.6+rn()*2.4,x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r;if(Math.hypot(x-L.lad.x,z-L.lad.z)<2.4)continue;
    const h=1.4+rn()*2.6,o=new THREE.Mesh(svG('mb_sg',()=>{const q=new THREE.ConeGeometry(1,1,6,2);q.translate(0,.5,0);return q.toNonIndexed()}),i%4==0?M.wet:M.rock2);
    o.position.set(x,y(x,z)-.1,z);o.scale.set(.32+h*.12,h,.32+h*.12);o.rotation.set((rn()-.5)*.2,rn()*6,(rn()-.5)*.2);o.castShadow=true;root.add(o);
    if(i%3==0){const t=new THREE.Mesh(svG('mb_sg2',()=>{const q=new THREE.ConeGeometry(1,1,6,1);q.translate(0,.5,0);return q.toNonIndexed()}),M.ooze);t.position.set(x+.3,y(x,z)-.1,z+.2);t.scale.set(.18,h*.5,.18);root.add(t)}}
  // ooze falls down the walls into glowing pools (decorative: the pools at the edge only hurt in Phase II, see the flood)
  [0.6,2.3,3.9,5.4].forEach((a,i)=>{const r=14.2,x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r,yy=y(x,z),fall=new THREE.Mesh(svG('mb_fl',()=>new THREE.PlaneGeometry(1.1,5.2,1,6)),
      new THREE.MeshBasicMaterial({color:0x9aff3a,map:SPR,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    fall.position.set(x,yy+2.4,z);fall.rotation.y=a;fall.userData.lpsSkip=1;root.add(fall);LS.falls.push({m:fall,x,z,yy,ph:i*1.7});
    const pool=new THREE.Mesh(svG('mb_pl',()=>new THREE.CircleGeometry(1,22).rotateX(-Math.PI/2)),new THREE.MeshStandardMaterial({color:0x1e4a0e,emissive:0x5ad01a,emissiveIntensity:.9,roughness:.15,transparent:true,opacity:.9,polygonOffset:true,polygonOffsetFactor:-3}));
    const px=L.cx+Math.sin(a)*12.8,pz=L.cz+Math.cos(a)*12.8;pool.position.set(px,y(px,pz)+.06,pz);pool.scale.set(1.8,1,1.3);pool.rotation.y=a;pool.userData.noFade135=1;pool.material.userData.noFade135=1;root.add(pool);
    if(i%2==0){const lt=new THREE.PointLight(0x7aff3a,1.1,9,1.7);lt.position.set(px,y(px,pz)+.8,pz);scene.add(lt);LS.lights.push(lt)}});
  // glowing fungus clusters and Akidon husks, bones
  for(let i=0;i<14;i++){const a=rn()*Math.PI*2,r=11.4+rn()*2.4,x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r;if(Math.hypot(x-L.lad.x,z-L.lad.z)<2.2||Math.hypot(x-L.dais.x,z-L.dais.z)<2.6)continue;
    const g=lgGroup('MB144|fung'+(i%3),k=>{const n=3+(i%3);for(let q=0;q<n;q++){const ax=(q-n/2)*.18,h=.18+q%2*.14;k.p('','cyl','c',0xc8c0a0,ax,h/2,(q%2)*.12,.03,h,.03);k.p('','hem','g',q%2?0x9aff4a:0xc8ff6a,ax,h,(q%2)*.12,.1-.01*q,.06,.1-.01*q)}},.1);
    g.position.set(x,y(x,z),z);g.rotation.y=rn()*6;root.add(g)}
  for(let i=0;i<7;i++){const a=rn()*Math.PI*2,r=8.5+rn()*4,x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r;if(Math.hypot(x-L.lad.x,z-L.lad.z)<2.4||Math.hypot(x-L.dais.x,z-L.dais.z)<2.8)continue;
    const g=lgGroup('MB144|husk'+(i%2),k=>{k.p('','sph2','c',0x1a1b12,0,.18,0,.42,.22,.3);for(let q=0;q<4;q++)k.p('','hem','c',q%2?0x2a2c1e:0x1a1b12,0,.3,-.2+q*.14,.3-.03*q,.08,.08,-1.2,0,0);
      for(let q=0;q<4;q++){const s=q%2?1:-1;k.L('','c',0x14150e,[s*.25,.12,-.1+q*.08],[s*.6,0,-.2+q*.14],.025,.01,4)}k.p('','box','c',0xb8ae8c,.5,.03,.3,.4,.04,.04,0,.6,0);k.p('','box','c',0xb8ae8c,.3,.03,.45,.3,.04,.04,0,-.4,0)},.12);
    g.position.set(x,y(x,z),z);g.rotation.y=rn()*6;root.add(g)}
  // the dais: stacked rock, ooze running down it, bones round its foot
  {const d=L.dais,dy=y(d.x,d.z);[[0,0,0,2.1,.55,1.8,0],[0,.5,0,1.6,.5,1.4,1],[0,.95,0,1.1,.4,1.0,2]].forEach(([ox,oy,oz,sx,sy,sz,k])=>{const o=new THREE.Mesh(lump(10+k,1,1,.25),k==1?M.wet:M.rock);
      o.position.set(d.x+ox,dy+oy+sy*.5,d.z+oz);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;root.add(o)});
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.3,o=new THREE.Mesh(svG('mb_dr',()=>new THREE.PlaneGeometry(.18,1.3)),M.ooze);o.position.set(d.x+Math.sin(a)*1.25,dy+.75,d.z+Math.cos(a)*1.1);o.rotation.set(0,a,-.15);root.add(o)}
    for(let i=0;i<5;i++){const a=rn()*6.28,o=new THREE.Mesh(svG('mb_bn',()=>new THREE.CylinderGeometry(.04,.05,.6,5).toNonIndexed()),M.bone);o.position.set(d.x+Math.sin(a)*2.1,dy+.05,d.z+Math.cos(a)*1.8);o.rotation.set(Math.PI/2,0,rn()*6);root.add(o)}
    for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++)if(Math.hypot(i,j)<=1.8)CBLK.add(Math.round(d.z+j)*W+Math.round(d.x+i));
    const C=mb144Crystal();C.g.position.set(d.x,dy+2.55,d.z);root.add(C.g);LS.cr=C;LS.crY=dy+2.55;
    const lt=new THREE.PointLight(0x9aff4a,1.8,14,1.5);lt.position.set(d.x,dy+2.6,d.z);scene.add(lt);LS.lights.push(lt);LS.crL=lt;
    const shell=new THREE.Mesh(svG('mb_shl',()=>new THREE.IcosahedronGeometry(1.15,1)),new THREE.MeshStandardMaterial({color:0x3a8a1a,emissive:0x2a7a10,emissiveIntensity:.6,roughness:.2,transparent:true,opacity:.42,depthWrite:false,flatShading:true}));
    shell.material.userData.noFade135=1;shell.position.copy(C.g.position);shell.scale.set(1,1.45,1);root.add(shell);LS.shell=shell}
  // the ladder up to the hatch, a faint light from the shaft, the ooze seal (shown in the fight)
  {const l=L.lad,ly=y(l.x,l.z),g=lgGroup('MB144|ladder',k=>{[-1,1].forEach(s=>k.L('','c',0x3e2c1c,[s*.32,0,0],[s*.32,5.6,1.5],.05,.05,5));for(let i=0;i<11;i++){const u=i/10;k.p('','box','c',0x56402a,0,.3+u*5.1,u*1.38,.7,.06,.07)}
      k.p('','box','m',0x34343a,0,5.5,1.45,.9,.05,.05)},.12);g.position.set(l.x,ly,l.z);root.add(g);
    const sky=kqSpr(0xd0e8c0,3.5);sky.position.set(l.x,ly+6.2,l.z+1.6);root.add(sky);
    const seal=new THREE.Mesh(svG('mb_seal',()=>new THREE.SphereGeometry(1.4,14,8,0,Math.PI*2,0,Math.PI/2)),new THREE.MeshStandardMaterial({color:0x2a6a14,emissive:0x4ac018,emissiveIntensity:.7,transparent:true,opacity:.6,roughness:.2,depthWrite:false,flatShading:true}));
    seal.material.userData.noFade135=1;seal.position.set(l.x,ly,l.z+.2);seal.scale.set(1.2,1.6,.9);seal.visible=false;root.add(seal);LS.seal=seal}
  // the Phase II flood ring and the deluge sheet (hidden until used)
  {const ring=new THREE.Mesh(svG('mb_fr',()=>new THREE.RingGeometry(10.6,15.5,64,2).rotateX(-Math.PI/2)),new THREE.MeshStandardMaterial({color:0x2a6a10,emissive:0x5ad01a,emissiveIntensity:.8,transparent:true,opacity:0,roughness:.12,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));
    ring.material.userData.noFade135=1;ring.position.set(L.cx,L.y+.12,L.cz);ring.visible=false;root.add(ring);LS.flood=ring;
    const sheet=new THREE.Mesh(svG('mb_fs',()=>new THREE.CircleGeometry(15,64).rotateX(-Math.PI/2)),new THREE.MeshStandardMaterial({color:0x2a6a10,emissive:0x5ad01a,emissiveIntensity:.9,transparent:true,opacity:0,roughness:.12,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));
    sheet.material.userData.noFade135=1;sheet.position.set(L.cx,L.y+.1,L.cz);sheet.visible=false;root.add(sheet);LS.sheet=sheet}
  mb144LairSync();return LS}
function mb144LairSync(){const LS=MQ144.LS;if(!LS)return;const alive=MQ144.st<2;LS.shell.visible=alive;LS.cr.g.visible=MQ144.st<3;LS.crL.intensity=MQ144.st<3?1.8:.4;LS.seal.visible=!!(MB144A&&MB144A.f)}

// ---------------- the fight ----------------
var MB144B={name:'Vorraxis',col:MB144.col,body:1.55,ph2:.55,poise:.1,headJ:'head',turnA:3.5,edge:1.5,
  ai:{pref:3.4,walk:2.3,run:3.8,turn:2.7,rest:[.75,1.35],ph2r:.68,strafe:.5},
  build:mb144Build,loco:mb144Loco,post:mb144Post,P:MB144P,M:MB144M,
  stag:[[.25,'stag','o'],[2.2,'stag','l',.025],[2.75,'cRec','io']],stagT:2.75,
  die:[[.4,'stag','o'],[1.3,'dead','i'],[2.1,'dead','l']]};
MB144B.M.stagger=svStagDef(MB144B);
function mb144Spawn(){if(MQ144.e&&!MQ144.e.dead&&enemies.includes(MQ144.e))return MQ144.e;if(MQ144.st>=2)return null;const L=MB144L,key='vorraxis';
  if(!EN[key])EN[key]=Object.assign({},EN.akorror,{n:'Vorraxis',e:'🦂'});try{MSET[key]=[]}catch(_){}
  const c=enemyC(key,MQ144.lv,{boss:1});c.n='Vorraxis';const m=cr(c);m.position.set(L.home.x,0,L.home.z);m.rotation.y=0;scene.add(m);
  const hb=bar(true);hb.scale.setScalar(3);
  const e={c,m,hb,boss:1,mb144:1,tier:4,home:[L.home.x,L.home.z],cd:1,ch:0,vx:0,vz:0,agg:0,bs:{t:99,lock:0,ph:1,last:'',ult:99,pb:99},wx:L.home.x,wz:L.home.z,wt:0,dots:[]};enemies.push(e);
  m.children.forEach(o=>{o.visible=false});const R=svRig();mb144Build(R,e);svRest(R);try{svMerge(R)}catch(err){console.error('mb merge',err)}const bs=m.bs||m.scale.x||1;R.root.scale.setScalar(1/bs);R.root.name='svmb';m.add(R.root);
  const O={};for(const k in R.J)O[k]=[0,0,0,0,0,0];
  e.sv={i:'mb',B:MB144B,R,O,P:{},snap:{},aw:0,trk:null,tt:0,mv:null,ph:1,rest:1.5,last:[],cd:{},po:0,poT:0,stg:0,inv:0,spd:0,lp:m.position.clone(),hero:1,body:MB144B.body,on:false,wait:0,act:0,fl:0,chg:0,dr:0};
  MB144A={cx:L.cx,cz:L.cz,r:L.r,hr:L.hr,y:L.y,f:false};svApply(e,0,performance.now());MQ144.e=e;return e}
function mb144Start(e){const S=e.sv,A=MB144A;if(!A||A.f)return;A.f=true;e.agg=1;S.on=false;S.ph=1;e.bs.ph=1;S.rest=1;S.po=0;MQ144.ft=0;mb144LairSync();
  if(riding)try{dismount()}catch(_){}try{setTarget(e)}catch(_){}
  try{zt116Show(ZT116.Z[0],'The Seeping Lair','Vorraxis','the Seeping King · guardian of the Glowmire Crystal','The ooze has sealed the way out','z0')}catch(_){}
  svSnd('hiss',1,.6)}
// back to the start (a wipe, or the hero left the lair): full health, home, Phase I, the flood and every leftover gone
function mb144Reset(why){const e=MQ144.e,A=MB144A;if(A)A.f=false;mb144Flood(false);mb144ClearExtras();mb144LairSync();if(!e||e.dead)return;const S=e.sv;
  svEndMove(e,true);S.stgM=null;S.on=false;S.ph=1;e.bs.ph=1;S.po=0;S.stg=0;S.inv=0;S.cd={};S.dr=0;S.chg=0;S.chgT=0;S.last=[];S.sipN=0;e.agg=0;e.c.h=M(e.c);
  e.m.position.set(MB144L.home.x,0,MB144L.home.z);e.m.rotation.y=0;if(why)setTimeout(()=>say('🦂 Vorraxis sinks back into the ooze before his crystal. He waits.'),900)}
function mb144ClearExtras(){MQ144.sacs.slice().forEach(s=>{try{if(!s.dead)removeE(s)}catch(_){}});MQ144.sacs=[];MQ144.isl.forEach(o=>{try{if(o.g.parent)o.g.parent.remove(o.g);if(o.ring&&o.ring.parent)o.ring.parent.remove(o.ring)}catch(_){}});MQ144.isl=[];
  const LS=MQ144.LS;if(LS){LS.sheet.visible=false;LS.sheet.material.opacity=0;if(LS.beam){LS.beam.parent&&LS.beam.parent.remove(LS.beam);LS.beam=null}}}
function mb144Heal(e,f){if(!e||e.dead)return;const h=Math.round(M(e.c)*f);e.c.h=Math.min(M(e.c),e.c.h+h);dn(e.m.position,'+'+h,'#9aff6a',-20,1400);burst(gY(e.m.position,1.5),0xb8ff3a,40,3,2,.7)}
// Phase II: the edge of the lair floods (stand inside the ring or take caustic damage)
function mb144Flood(on){MQ144.flood=on?1:0;const LS=MQ144.LS;if(!LS)return;LS.flood.visible=true;const m=LS.flood.material,o0=m.opacity;
  tw(on?1400:700,k=>{m.opacity=on?.82*k:o0*(1-k)},()=>{if(!on)LS.flood.visible=false})}
// Crystal Siphon: three sacs swell round the lair, a beam runs from the crystal into him
function mb144SiphonStart(e){const L=MB144L,LS=MQ144.LS;mb144ClearExtras();MQ144.sacs=[];const hp=Math.max(60,Math.round(M(e.c)*.016)),a0=Math.random()*Math.PI*2;
  for(let i=0;i<3;i++){const a=a0+i*Math.PI*2/3,r=7.4+Math.random()*1.4,x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r;let s=null;try{s=spawnEnemy('goo',x,z,MQ144.lv,{minion:1})}catch(err){console.error('mb sac',err)}
    if(!s)continue;s.mbSac=1;s.agg=0;s.c.n='Ooze Sac';s.c.st.hp=hp;s.c.h=hp;s.m.children.forEach(o=>{o.visible=false});const bs=s.m.bs||s.m.scale.x||1;
    const g=new THREE.Group();g.scale.setScalar(1/bs);const M2=mb144Mats(),body=new THREE.Mesh(svG('mb_sac',()=>svLump(.55,1,.25,121)),M2.ooze),crust=new THREE.Mesh(svG('mb_sacc',()=>svLump(.5,1,.3,122)),M2.chit);
    body.position.y=.55;crust.position.y=.25;crust.scale.set(1.25,.55,1.25);g.add(body,crust);for(let k=0;k<5;k++){const sp=new THREE.Mesh(svG('mb_sacs',()=>svHorn(.05,.32,0,.05,4,2)),M2.chit);const aa=k/5*6.28;sp.position.set(Math.sin(aa)*.5,.35,Math.cos(aa)*.5);sp.rotation.set(-.6,aa,0);g.add(sp)}
    s.m.add(g);s.sacG=body;MQ144.sacs.push(s);burst(gY(s.m.position,.6),0xb8ff3a,30,2,2,.6);svShock(s.m.position,0xb8ff3a,2.4,.4)}
  if(LS){const beam=new THREE.Mesh(svG('mb_bm',()=>{const g=new THREE.CylinderGeometry(.12,.2,1,8,1,true);g.translate(0,.5,0);g.rotateX(Math.PI/2);return g}),new THREE.MeshBasicMaterial({color:0xb8ff3a,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    beam.userData.lpsSkip=1;beam.renderOrder=22;LS.root.add(beam);LS.beam=beam}
  MQ144.sacN=MQ144.sacs.length;say('🟢 Vorraxis drinks from the crystal! Burst the three ooze sacs before the siphon completes.');svSnd('charge',.8,.5)}
function mb144SiphonEnd(e,interrupted){const LS=MQ144.LS;if(LS&&LS.beam){LS.beam.parent&&LS.beam.parent.remove(LS.beam);LS.beam.material.dispose();LS.beam=null}
  MQ144.sacs.slice().forEach(s=>{if(!s.dead){burst(gY(s.m.position,.6),0x6a8a3a,20,1.5,1.5,.6);try{removeE(s)}catch(_){}}});MQ144.sacs=[]}
function mb144SacPop(s){if(s.dead)return;s.dead=1;s.c.h=0;try{s.hb.visible=false}catch(_){}if(typeof tgt!='undefined'&&tgt===s)try{setTarget(null)}catch(_){}
  const p=s.m.position.clone();burst(gY(p,.6),0xb8ff3a,50,3,3,.8);svShock(p,0xb8ff3a,3,.4);svDecal(p,0x2a5a10,1.8,3,.6);svSnd('squelch',1,1);setTimeout(()=>{try{removeE(s)}catch(_){}},60);
  const i=MQ144.sacs.indexOf(s);if(i>=0)MQ144.sacs.splice(i,1);const e=MQ144.e;
  if(e&&!e.dead){const d=Math.round(M(e.c)*.04);e.c.h=Math.max(1,e.c.h-d);dn(e.m.position,d,'#d8ff7a',-20,1200);
    if(!MQ144.sacs.length&&e.sv.mv&&e.sv.mv.id==='siphon'){svEndMove(e,true);svCast(e,'broken')}
    else popT(p,MQ144.sacs.length+' sac'+(MQ144.sacs.length==1?'':'s')+' left','#d8ff7a')}}
// the deluge (siphon complete): three stone islands rise, then the whole floor floods
function mb144Islands(e){const L=MB144L,LS=MQ144.LS,M2=mb144Mats();MQ144.isl.forEach(o=>{if(o.g.parent)o.g.parent.remove(o.g)});MQ144.isl=[];const a0=Math.random()*Math.PI*2;
  for(let i=0;i<3;i++){const a=a0+i*Math.PI*2/3+(Math.random()-.5)*.5,r=4.5+Math.random()*3.6,x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r,g=new THREE.Group(),y0=GH(x,z);
    const top=new THREE.Mesh(svG('mb_is',()=>svLump(1.0,1,.2,131)),M2.rock2);top.scale.set(1.8,.55,1.8);top.position.y=.2;g.add(top);
    const ring=new THREE.Mesh(svG('mb_isr',()=>new THREE.RingGeometry(1.75,1.95,32).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:0x8ae8ff,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    ring.position.y=.62;g.add(ring);g.position.set(x,y0-.6,z);LS.root.add(g);tw(900,k=>g.position.y=y0-.6+.6*svEase.o(k));MQ144.isl.push({g,x,z,ring})}
  LS.sheet.visible=true;tw(2200,k=>LS.sheet.material.opacity=.0+.55*k);
  say('⚠ The lair floods! Get onto a stone island!');try{banner('⚠ DELUGE','Get onto a glowing stone island!','')}catch(_){}}
function mb144Deluge(e){const LS=MQ144.LS,P=pl.position;const safe=MQ144.isl.some(o=>Math.hypot(P.x-o.x,P.z-o.z)<1.95);
  LS.sheet.material.opacity=.85;svShock(new THREE.Vector3(MB144L.cx,0,MB144L.cz),0xb8ff3a,14,.9);shake(.45);svSnd('splash',1.4,.6);svSnd('roar',.8,1.1);
  for(let i=0;i<40;i++){const a=Math.random()*6.283,r=Math.random()*12.5;burst(gY(new THREE.Vector3(MB144L.cx+Math.cos(a)*r,0,MB144L.cz+Math.sin(a)*r),.3),0xb8ff3a,3,1.5,3,.7)}
  if(!safe&&hero.hp>0&&!(hero.iv>0)){bossHit(e,2.6);dqDebuff(MB144_DEB[0],MB144_DEB[1],MB144_DEB[2],5000,MB144_DEB[3])}else if(safe)dn(P,'Safe!','#9ae8ff',-20,1200);
  setTimeout(()=>{if(!LS)return;tw(1400,k=>LS.sheet.material.opacity=.85*(1-k),()=>{LS.sheet.visible=false});MQ144.isl.forEach(o=>{const y1=o.g.position.y;tw(1200,k=>o.g.position.y=y1-.7*k,()=>{if(o.g.parent)o.g.parent.remove(o.g)})});MQ144.isl=[]},1300)}
// he falls: the crystal's shell bursts
function mb144Won(e){const A=MB144A;if(A)A.f=false;MQ144.st=Math.max(MQ144.st,2);MQ144.trkK='';mb144Flood(false);mb144ClearExtras();
  const LS=MQ144.LS;setTimeout(()=>{if(!LS)return;const p=LS.shell.position;burst(p,0xb8ff3a,80,4,3,1);svShock(new THREE.Vector3(p.x,0,p.z),0xd8ff7a,6,.7);svSnd('crack',1,.7);svSnd('bell',.8,1);mb144LairSync()},1800);
  setTimeout(()=>{try{zt116Show(ZT116.Z[0],'The Seeping Lair','Vorraxis Falls','The ooze shell around the Glowmire Crystal bursts','Claim the crystal on its dais','z0');mSfx('victory')}catch(_){}say('🦂 Vorraxis, the Seeping King, is slain. Claim the Glowmire Crystal.')},2300);
  try{hud()}catch(_){}}
function mq144Claim(){if(MQ144.st!==2)return;MQ144.st=3;MQ144.trkK='';const LS=MQ144.LS,p=LS?LS.cr.g.position.clone():pl.position.clone();
  if(LS){const g=LS.cr.g,s=g.position.clone();tw(900,k=>{g.position.lerpVectors(s,gY(pl.position,1.4),svEase.io(k));g.scale.setScalar(1-k*.7)},()=>{g.visible=false;g.scale.setScalar(1);g.position.copy(s);mb144LairSync()})}
  burst(p,0xd8ff7a,60,3,3,1);try{mSfx('rare');sfx('chime')}catch(_){}try{pickup({ic:'💠',t:'The Glowmire Crystal',col:'#d8ff7a',sub:'The gateway to '+mq144Next()+' answers it',r:4})}catch(_){}
  setTimeout(()=>{try{zt116Show(ZT116.Z[0],'Kindlelight · Main Quest','The Glowmire Crystal','The gateway to '+mq144Next()+' answers the crystal’s call','The Glowmire Crystal · complete','z0')}catch(_){}say('🌀 The gateway at the end of '+PMAP[0].ins[1].n+' is awake.')},1000);mq144GateSync()}

// ---------------- moving between the hatch and the lair ----------------
function mq144Enter(){fadeTo(()=>{const L=MB144L;toPos(L.ent.x,L.ent.z,0);
  setTimeout(()=>{try{zt116Show(ZT116.Z[0],'Kindlelight · '+PMAP[0].ins[1].n,'The Seeping Lair',MQ144.st<2?'Something vast breathes in the dark beneath the Warren':'The lair is quiet now','','z0')}catch(_){}},300)})}
function mq144Leave(){const h=mq144HatchSpot();if(!h)return;fadeTo(()=>{toPos(h.x+1.8,h.z+.4,Math.PI/2)})}
// a save made in the lair loads at the hatch (2440 would send it home)
{const f=wv135Out;wv135Out=function(){try{if(mq144InLair()){const h=mq144HatchSpot();if(h){toPos(h.x+1.8,h.z+.4,Math.PI/2);return}}}catch(_){}return f.apply(this,arguments)}}
{const f=doRecall;doRecall=function(){if(MB144A&&MB144A.f&&mq144InLair())return say('🦂 The ooze has sealed the lair. There is no escape.');return f.apply(this,arguments)}}

// ---------------- prompts ----------------
function mq144Prompt(){const P=pl.position;
  if(mq144In2()&&MQ144.st>=1){const h=mq144HatchSpot();if(h&&Math.hypot(P.x-h.x,P.z-h.z)<1.9)return {label:'F · Descend into the hatch',fn:()=>mq144Enter()}}
  if(mq144InLair()){const L=MB144L;if(MB144A&&MB144A.f)return null;
    if(Math.hypot(P.x-L.lad.x,P.z-L.lad.z)<2.2)return {label:'F · Climb back up to the '+((mq144Camp()&&mq144Camp().th&&mq144Camp().th.n)||'Warren'),fn:()=>mq144Leave()};
    if(MQ144.st===2&&Math.hypot(P.x-L.dais.x,P.z-L.dais.z)<3.4)return {label:'F · Claim the Glowmire Crystal',fn:()=>mq144Claim()}}
  return null}
{const f=worldPrompt;worldPrompt=function(){try{const r=mq144Prompt();if(r)return r}catch(e){if(!MQ144.err++)console.warn('v144 prompt',e)}return f.apply(this,arguments)}}
function mq144AtGate(){const P=pl.position;for(const r of RPORT)if(r.k=='next'&&r.ig===1&&Math.hypot(P.x-r.x,P.z-r.z)<2.8)return true;return false}
{const f=portalPrompt;portalPrompt=function(){const r=f.apply(this,arguments);try{if(r&&!mq144Done()&&mq144AtGate())return {label:'🔒 The gateway is sealed · it answers only to the Glowmire Crystal',fn:()=>say('🌀 The arch is choked with hardened ooze. Something beneath the '+((mq144Camp()&&mq144Camp().th&&mq144Camp().th.n)||'furthest camp')+' holds the key.')}}catch(_){}return r}}
// the gateway of II: dormant until the crystal is claimed; then the crystal floats over the arch
function mq144GateSync(){const r=RPORT.find(q=>q.k=='next'&&q.ig===1);if(!r)return;if(!MQ144.gc)MQ144.gc=r.disc.material.color.getHex();const on=mq144Done(),m=r.disc.material;
  m.color.copy(new THREE.Color(0x141a12).lerp(new THREE.Color(MQ144.gc),on?1:0));m.opacity=on?.8:.3;
  if(on&&!MQ144.gcr){const C=mb144Crystal();C.g.scale.setScalar(.55);C.g.position.set(0,3.6,0);r.g.add(C.g);MQ144.gcr=C}if(MQ144.gcr)MQ144.gcr.g.visible=on}

// ---------------- the tracker (chapter 2 in the main-quest box, in Kindlelight II and the lair) ----------------
{const f=mq143Trk;mq143Trk=function(){try{if(mq144In2()||mq144InLair()){MQ143.trkK='';return mq144Trk()}}catch(err){if(!MQ144.err++)console.warn('v144 trk',err)}MQ144.trkK='';return f.apply(this,arguments)}}
function mq144Trk(){const el=$('mqt143');if(!el)return;
  const hide=(typeof uiOpen=='function'&&uiOpen())||(mq144Done()&&insReach(0)>=2);
  const st=mq144Done()?3:MQ144.st,lair=mq144InLair(),fight=!!(MB144A&&MB144A.f),key=(hide?'h':'s')+st+lair+fight;if(key===MQ144.trkK)return;MQ144.trkK=key;
  if(hide){el.classList.add('hide');mq143TrkPos();return}
  const C=mq144Camp(),cn=(C&&C.th&&C.th.n)||'the furthest camp',o=(a,b)=>`<div class="o"><span>${a}</span>${b!=null?'<b>'+b+'</b>':''}</div>`;
  let h='<div class="k">⚜ Main quest</div><div class="h">'+MQ144.name+'</div>';
  if(st==0)h+=o('Clear the '+cn+(lair?'':' (the furthest camp)'));
  else if(st==1)h+=lair?o(fight?'Slay Vorraxis, the Seeping King':'Face Vorraxis before the crystal'):o('Descend through the hatch beneath the '+cn);
  else if(st==2)h+=o(lair?'Claim the Glowmire Crystal on its dais':'Claim the crystal in the Seeping Lair');
  else h+='<div class="o d"><span>Step through the gateway to '+mq144Next()+'</span></div>';
  el.innerHTML=h;el.classList.remove('hide');mq143TrkPos()}

// ---------------- the minimap and the N map: the hatch ----------------
function mq144Marks(g,P,k){if(!mq144In2()||MQ144.st<1)return;const h=mq144HatchSpot();if(!h)return;const q=P(h.x,h.z);if(!q)return;g.save();g.translate(q[0],q[1]);g.scale(k,k);
  g.beginPath();g.arc(0,0,5,0,6.28);g.fillStyle='#34343a';g.fill();g.lineWidth=1.6/k;g.strokeStyle='#d8ff7a';g.stroke();g.beginPath();g.arc(0,0,2.2,0,6.28);g.fillStyle='#9aff3a';g.fill();g.restore()}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{mq144Marks(mmX,(x,z)=>{const X=(x-(cx-vw/2)+.5)*w/vw,Y=(z-(cy-vh/2)+.5)*h/vh;return X<-6||Y<-6||X>w+6||Y>h+6?null:[X,Y]},1)}catch(_){}}}
{const f=openWMap;openWMap=function(){const r0=f.apply(this,arguments);try{const I=INSL[1];if(mq144In2()&&MQ144.st>=1){const c=$('wmc'),g=c.getContext('2d'),k=Math.min(1060/I.w,640/I.h),h=mq144HatchSpot();
  mq144Marks(g,(x,z)=>[(x-I.x0+.5)*k,(z-I.y0+.5)*k],1.5);g.font='700 12px system-ui,sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';const x=(h.x-I.x0+.5)*k,y=(h.z-I.y0+.5)*k;g.strokeText('Hatch',x,y-14);g.fillStyle='#d8ff7a';g.fillText('Hatch',x,y-14)}}catch(e){console.warn('v144 wmap',e)}return r0}}

// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.mq144={v:144,st:MQ144.st,seen:MQ144.seen|0}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.mq144;MQ144.st=q&&typeof q=='object'?Math.max(0,Math.min(3,q.st|0)):0;MQ144.seen=q&&q.seen|0;MQ144.trkK='';
    if(MB144A&&MB144A.f)mb144Reset();if(MQ144.e&&MQ144.st>=2&&!MQ144.e.dead){try{removeE(MQ144.e)}catch(_){}MQ144.e=null}mb144LairSync();mq144GateSync()}catch(err){console.warn('v144 load',err)}return r}}

// ---------------- hooks: his AI instead of the enemy loop, the sacs, damage reduction, his death, the HUD ----------------
{const f=eTick;eTick=function(e,dt,now){if(e&&e.mb144){try{mb144AI(e,dt,now)}catch(err){if(!MQ144.err++)console.error('v144 ai',err)}return true}
  if(e&&e.mbSac){try{if(e.hb)e.hb.visible=!e.dead;if(e.sacG){const t=now/1000+e.m.position.x;e.sacG.scale.set(1+.08*Math.sin(t*5),1+.12*Math.sin(t*5+1),1+.08*Math.cos(t*5))}
      if(Math.random()<dt*4)burst(gY(e.m.position,.8),0xb8ff3a,1,.3,.6,.6)}catch(_){}return true}
  return f.apply(this,arguments)}}
{const f=kill;kill=function(e){if(e&&e.mbSac){try{mb144SacPop(e)}catch(err){console.error('mb sac pop',err)}return}const r=f.apply(this,arguments);if(e&&e.mb144)try{mb144Won(e)}catch(err){console.error('v144 won',err)}return r}}
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.mb144&&e.sv&&!e.dead){if(!(MB144A&&MB144A.f)&&mq144InLair()&&hero.hp>0)mb144Start(e);
    if(e.sv.dr>0){d=Math.max(1,Math.round(d*e.sv.dr));if(nowP()-(e.sv.drT||0)>700){e.sv.drT=nowP();dn(e.m.position,'Shielded','#9aff6a',-30,600)}}}
  return f.call(this,e,d,s,crit,dot)}}
function mb144Hud(){const e=MQ144.e,on=!!(e&&!e.dead&&MB144A&&MB144A.f&&mq144InLair());let p=document.getElementById('mbPo');if(!on){if(p)p.style.display='none';return}
  const b=$('boss');if(!b)return;b.classList.remove('hide');$('bossN').textContent='🦂 Vorraxis · the Seeping King · Phase '+(e.sv.ph>1?'II':'I');$('bossB').style.width=Math.max(0,100*e.c.h/M(e.c))+'%';
  if(!p){p=document.createElement('div');p.id='mbPo';p.style.cssText='height:5px;margin:4px auto 0;width:70%;background:rgba(0,0,0,.6);border:1px solid rgba(255,216,96,.35);border-radius:2px;overflow:hidden';p.innerHTML='<i style="display:block;height:100%;width:0;background:linear-gradient(90deg,#c89020,#ffe080);transition:width .12s"></i>';const mt=b.querySelector('.meter');if(mt)mt.after(p);else b.appendChild(p)}
  const S=e.sv;
  p.style.display='block';p.firstChild.style.width=(S.stg>0?100:Math.min(100,S.po*100)).toFixed(1)+'%';p.firstChild.style.background=S.stg>0?'#fff4c0':'linear-gradient(90deg,#c89020,#ffe080)'}
{const f=hud;hud=function(){const r=f.apply(this,arguments);try{mb144Hud()}catch(_){}return r}}
// his AI: the Sovereign engine's moves, picks and rests; his own footwork and arena
function mb144AI(e,dt,now){const S=e.sv,A=MB144A,m=e.m;if(!A)return;if(e.hb)e.hb.visible=false;m.visible=mq144InLair();
  const dx=m.position.x-S.lp.x,dz=m.position.z-S.lp.z;S.lp.copy(m.position);const ms=dt>0?Math.hypot(dx,dz)/dt:0;S.spd+=((ms>12?0:ms)-S.spd)*Math.min(1,dt*8);
  for(const k in S.cd)S.cd[k]=Math.max(0,S.cd[k]-dt);S.inv=Math.max(0,S.inv-dt);
  if(!(S.mv&&S.mv.id==='siphon'))S.chg=(S.chg||0)+((S.chgT||0)-(S.chg||0))*Math.min(1,dt*3);
  // the hero's velocity (aimed geysers)
  {const p=pl.position;if(S.hp0&&dt>0){const vx=(p.x-S.hp0.x)/dt,vz=(p.z-S.hp0.z)/dt,a=Math.min(1,dt*6);if(Math.hypot(vx,vz)<20){S.hv=S.hv||{x:0,z:0};S.hv.x+=(vx-S.hv.x)*a;S.hv.z+=(vz-S.hv.z)*a}}S.hp0={x:p.x,z:p.z}}
  if(!A.f){// waiting before his crystal: breathe, face the entrance, heal; the fight starts when you come close
    if(S.mv)svEndMove(e,true);e.agg=0;const hx=MB144L.home.x-m.position.x,hz=MB144L.home.z-m.position.z,hl=Math.hypot(hx,hz);
    if(hl>.6){walkM(m,hx/hl*2*dt,hz/hl*2*dt);m.rotation.y=Math.atan2(hx,hz)}else m.rotation.y+=svAng(0-m.rotation.y)*Math.min(1,dt*2);
    e.c.h=Math.min(M(e.c),e.c.h+M(e.c)*dt*.2);S.po=0;
    if(mq144InLair()&&hero.hp>0&&MQ144.st<2&&Math.hypot(pl.position.x-m.position.x,pl.position.z-m.position.z)<9.5)mb144Start(e);
    svApply(e,dt,now);return}
  // the fight ends if the hero falls or leaves
  if(hero.hp<=0||!mq144InLair()||(typeof AWD!='undefined'&&AWD.dead)){mb144Reset(true);svApply(e,dt,now);return}
  MQ144.ft+=dt;e.agg=1;
  if(!S.on){S.on=true;S.ph=1;e.bs.ph=1;S.rest=1;S.po=0;svCast(e,'intro')}
  if(now-S.poT>3500)S.po=Math.max(0,S.po-dt*.1);
  if(S.mv)svTickMove(e,dt,now);
  else if(S.ph===1&&e.c.h/M(e.c)<=MB144B.ph2)svCast(e,'awaken');
  else{mb144Move(e,dt);S.rest-=dt;if(S.rest<=0){const id=svPick(e);if(id)svCast(e,id);else S.rest=.25}}
  mb144Clamp(m.position,MB144B.edge);
  // keep the hero in the lair and out of his body
  {const p=pl.position,hx=p.x-A.cx,hz=p.z-A.cz,hd=Math.hypot(hx,hz);if(hd>A.hr){p.x=A.cx+hx/hd*A.hr;p.z=A.cz+hz/hd*A.hr}}
  if(!S.ghost&&!S.rmOn&&hero.hp>0){const hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,hl=Math.hypot(hx,hz),R0=S.body;if(hl<R0&&hl>.001){const k=R0-hl;pl.position.x+=hx/hl*k;pl.position.z+=hz/hl*k}}
  // Phase II: the flooded edge burns
  if(MQ144.flood&&hero.hp>0){const d=Math.hypot(pl.position.x-A.cx,pl.position.z-A.cz);MQ144.floodT-=dt;if(d>10.6&&MQ144.floodT<=0&&!(hero.iv>0)){MQ144.floodT=.6;hitHero(e,.2,'m');dqDebuff(MB144_DEB[0],MB144_DEB[1],MB144_DEB[2],1200,MB144_DEB[3]);burst(gY(pl.position,.4),0xb8ff3a,8,.8,1,.5)}}
  svApply(e,dt,now)}
// footwork: close to his preferred range, circle when there, a short back-off when crowded; slides along the lair's edge
function mb144Move(e,dt){const S=e.sv,ai=MB144B.ai,m=e.m,v=V().subVectors(pl.position,m.position).setY(0),L=v.length()||.01;
  const da=svAng(Math.atan2(v.x,v.z)-m.rotation.y),tr=ai.turn*(S.ph>1?1.2:1);m.rotation.y+=Math.max(-tr*dt,Math.min(tr*dt,da));
  let sp=0,ux=0,uz=0;const ws=ai.walk*(S.ph>1?1.15:1);
  if(L>ai.pref+1.2){sp=L>ai.pref+7?ai.run:ws;ux=v.x/L;uz=v.z/L}else if(L<1.8){sp=ws*.6;ux=-v.x/L;uz=-v.z/L}
  else{S.sdT=(S.sdT||0)-dt;if(S.sdT<=0){S.sdT=1.8+Math.random()*2.2;S.sd=Math.random()<.5?-1:1}sp=ws*ai.strafe;ux=-v.z/L*(S.sd||1);uz=v.x/L*(S.sd||1)}
  const A=MB144A,rx=m.position.x-A.cx,rz=m.position.z-A.cz,rl=Math.hypot(rx,rz)||.01;if(rl>A.r-2.5){const nx=rx/rl,nz=rz/rl,out=ux*nx+uz*nz;if(out>0){ux-=nx*out;uz-=nz*out}}
  if(sp>0&&Math.abs(da)<1.4)walkM(m,ux*sp*dt,uz*sp*dt);else sp=0;S.walkSp=sp}

// ---------------- the world tick: the hatch, the lair, the gateway ----------------
function mq144Tick(dt,now){const in2=mq144In2(),lair=mq144InLair(),t=now/1000;
  // Kindlelight II: the hatch appears once the Glowmire Warren is cleared
  if(in2){const C=mq144Camp();if(!MQ144.H&&MQ144.st>=1)mq144HatchBuild(false);
    if(MQ144.st===0&&C&&typeof campCleared=='function'&&campCleared(C)){MQ144.st=1;MQ144.trkK='';mq144HatchBuild(true)}
    if(!MQ144.gs){MQ144.gs=1;mq144GateSync()}
    if(MQ144.H){const H=MQ144.H;H.glo.material.opacity=.45+.15*Math.sin(t*2.2);if(Math.random()<dt*2.5){const h=mq144HatchSpot();burst(new THREE.Vector3(h.x,GH(h.x,h.z)+.3,h.z),0x9aff3a,1,.2,1.2,.7)}}
    if(MQ144.gcr){const g=MQ144.gcr.g;g.rotation.y+=dt*.8;g.position.y=3.6+.12*Math.sin(t*1.6)}}
  if(MQ144.H)MQ144.H.g.visible=in2;
  // the lair
  if(lair){if(!MQ144.LS)try{mb144LairBuild()}catch(err){console.error('v144 lair',err);MQ144.err++}
    if(MQ144.st<2&&!(MQ144.e&&enemies.includes(MQ144.e)))try{mb144Spawn()}catch(err){console.error('v144 spawn',err);MQ144.err++}
    if(!MQ144.seen){MQ144.seen=1}}
  const LS=MQ144.LS;if(LS){LS.root.visible=lair;LS.lights.forEach(l=>{if(!lair){if(l.userData.v144==null)l.userData.v144=l.intensity;l.intensity=0}else if(l.userData.v144!=null){l.intensity=l.userData.v144;l.userData.v144=null}});
    if(lair){const C=LS.cr;C.g.rotation.y+=dt*.6;C.g.position.y=LS.crY+.15*Math.sin(t*1.3);C.sh.forEach((o,i)=>{const a=t*.9+i*1.257;o.position.set(Math.sin(a)*.75,Math.sin(t*1.7+i)*.35,Math.cos(a)*.75);o.rotation.y=-a});
      const e=MQ144.e,sip=!!(e&&e.sv&&e.sv.mv&&e.sv.mv.id==='siphon'&&e.sv.mv.t>1.05&&e.sv.mv.t<9.9);C.core.scale.setScalar((sip?3.4:2.4)*(1+.08*Math.sin(t*(sip?9:2))));
      LS.crL.intensity=MQ144.st<3?(sip?2.8+.8*Math.sin(t*9):1.6+.3*Math.sin(t*1.3)):.35;if(LS.shell.visible)LS.shell.rotation.y-=dt*.2;
      LS.falls.forEach(f=>{f.m.material.opacity=.45+.15*Math.sin(t*3+f.ph);if(Math.random()<dt*3)burst(new THREE.Vector3(f.x,f.yy+.2,f.z),0x9aff3a,2,.5,1.4,.5)});
      LS.floorM.emissiveIntensity=.5+.1*Math.sin(t*.9)+(MQ144.flood?.15:0);if(LS.flood.visible)LS.flood.rotation.y+=dt*.05;
      // the siphon beam: crystal → his chest
      if(LS.beam&&e&&!e.dead){const a=C.g.position,b=svWP(e,'chest',0,.3,.2),d=b.clone().sub(a);LS.beam.position.copy(a);LS.beam.lookAt(b);LS.beam.scale.set(1+.3*Math.sin(t*20),1+.3*Math.sin(t*17),d.length());LS.beam.material.opacity=.55+.25*Math.sin(t*23);
        if(Math.random()<dt*20){const q=a.clone().lerp(b,Math.random());burst(q,0xd8ff7a,1,.2,.2,.4)}}
      if(MQ144.isl.length)MQ144.isl.forEach(o=>{o.ring.material.opacity=.55+.3*Math.sin(t*8)})}}
  if(now-MQ144.t>400){MQ144.t=now;try{mq143Trk()}catch(_){}}}
function mq144HatchBuild(reveal){const h=mq144HatchSpot();if(!h)return;if(!MQ144.H){const H=mb144Hatch();H.g.position.set(h.x,GH(h.x,h.z),h.z);H.g.rotation.y=Math.atan2(INSL[1].en[0]-h.x,INSL[1].en[1]-h.z);scene.add(H.g);MQ144.H=H;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(i||j)CBLK.add(Math.round(h.z+j)*W+Math.round(h.x+i))}
  const H=MQ144.H;if(!reveal){H.hinge.rotation.x=-1.95;return}
  // the reveal: the ground shudders, the lid bursts up and falls open
  H.hinge.rotation.x=0;const p=new THREE.Vector3(h.x,GH(h.x,h.z),h.z);shake(.3);svSnd('heavy',1,.7);burst(gY(p,.3),0x3a3428,40,3,2,.7);svShock(p,0x9aff3a,4,.6);
  setTimeout(()=>{svSnd('crack',1,.6);burst(gY(p,.5),0x9aff3a,50,2.5,4,.9);tw(900,k=>{H.hinge.rotation.x=-1.95*svEase.b(k)})},500);
  setTimeout(()=>{try{zt116Show(ZT116.Z[0],'Kindlelight · Main Quest',MQ144.name,'Beneath the '+((mq144Camp()&&mq144Camp().th&&mq144Camp().th.n)||'Warren')+' a hatch grinds open','Descend into the dark','z0')}catch(_){}
    say('🕳 A hatch has opened in the middle of the camp. Something below holds the key to the sealed gateway.')},900)}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{mq144Tick(dt,now)}catch(err){if(!MQ144.err++)console.warn('v144 tick',err)}return r}}
