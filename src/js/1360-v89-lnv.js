// =====================================================================================================
// variant per node tile (stable for every player and every reload)
function lnV(tg){const k=tg.y*W+tg.x,pk=typeof PROPK!='undefined'?PROPK[k]:null;
  if(tg.kind=='rock')return pk=='rock'&&lnHash(tg.x,tg.y,5)<.3?'iron':'stone';
  if(tg.kind=='bush')return lnHash(tg.x,tg.y,9)<.4?'berry':'fiber';
  return tg.kind}
var LN_LAB={tree:['Chop Wood','🪓 Chopping wood'],stone:['Mine Stone','⛏️ Mining stone'],iron:['Mine Iron Ore','⛏️ Mining iron ore'],crystal:['Mine Crystal Shards','⛏️ Mining crystal'],
  fiber:['Gather Plant Fiber','🌿 Gathering fiber'],berry:['Pick Berries & Fiber','🫐 Picking berries'],flower:['Pick Petals','🌸 Picking petals'],mush:['Pick Glow Caps','✨ Picking glow caps'],bones:['Collect Old Bones','🦴 Collecting bones'],
  mound:['Dig Soil','⛏️ Digging'],water:['Gather Clay & Water','🧱 Wading']};
function lnLabel(tg,prog){const v=lnV(tg),L=LN_LAB[v];if(!L)return null;let n=L[prog?1:0];
  if(!prog&&v=='stone'&&typeof PROPK!='undefined'){const pk=PROPK[tg.y*W+tg.x];if(pk=='grave')n='Mine Stone (gravestone)';else if(pk=='pillar')n='Mine Stone (old pillar)'}
  if(!prog&&v=='mound'&&typeof BDIG!='undefined'){try{const s=tg.soil||BDIG[MAP.bio[tg.y][tg.x]],it=ITEMS['t:'+s];if(it)n='Dig '+it.n}catch(_){}}
  return n}
{const f=promptTick;promptTick=function(){const r=f.apply(this,arguments);try{if(!PR||!PR.label)return r;let lab=null;
    if(gat&&gat.tg&&GK[gat.tg.kind]&&PR.label.indexOf(GK[gat.tg.kind][1])==0){const n=lnLabel(gat.tg,1);if(n)lab=PR.label.replace(GK[gat.tg.kind][1],n)}
    else if(!gat&&PR.label.indexOf('F · ')==0){const t=gTarget()||(typeof featMoving!='undefined'&&featMoving?null:groundTarget());if(t&&GK[t.kind]&&PR.label=='F · '+GK[t.kind][0]){const n=lnLabel(t,0);if(n)lab='F · '+n}}
    if(lab&&lab!=PR.label){PR.label=lab;const b=$('prompt');if(b&&!b.classList.contains('hide'))b.textContent=lab}}catch(_){}return r}}

// ---- models (base at y=0, about one tile wide; painted absolute colours, instance colour = white unless noted) ----
var LNM=(()=>{if(typeof NK=='undefined')return null;const {fin,tr,merge,hs}=NK,G=THREE;
  const C=(hex,k)=>{k=k||1;return [((hex>>16)&255)/255*k,((hex>>8)&255)/255*k,(hex&255)/255*k]};
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  const sh=(c,ny,h,r,lo)=>{const v=(ny<-.3?.6:(lo||.78)+.3*h)*(.86+.26*r);return [c[0]*v,c[1]*v,c[2]*v]};
  // ---- stone: pale layered boulders ----
  const stP=(h,ny,r,x,y,z)=>{const band=Math.floor((y+.05)*11)%2?.86:1.04;let c=C(0xa8a49c);if(ny>.6)c=C(0xbab6ac);return sh(c.map(v=>v*band),ny,h,r)};
  const stone=merge([fin(tr(new G.DodecahedronGeometry(.42,0),0,.28,0,0,.3,0,[1.18,.78,1]),{j:.1,sd:101,paint:stP}),fin(tr(new G.DodecahedronGeometry(.24,0),.36,.14,.16,0,1,0,[1,.8,1]),{j:.06,sd:102,paint:stP}),
    fin(tr(new G.BoxGeometry(.34,.14,.26,1,1,1),-.34,.07,-.14,0,.5,.12),{j:.04,sd:103,paint:stP})]);
  // ---- iron: dark rusty rock with orange veins and bright metal nuggets ----
  const irP=(h,ny,r,x,y,z)=>{const vein=Math.abs(Math.sin(x*9+y*13+z*7))<.13;return sh(vein?C(0xc8642a,1.1):r>.7?C(0x6e4c3e):C(0x4c4644),ny,h,r,.72)};
  const ironR=merge([fin(tr(new G.DodecahedronGeometry(.44,0),0,.3,0,0,0,0,[1.1,.85,1]),{j:.12,sd:111,paint:irP}),fin(tr(new G.DodecahedronGeometry(.22,0),-.34,.12,.18),{j:.06,sd:112,paint:irP})]);
  const nug=(x,y,z,s,sd)=>fin(tr(new G.OctahedronGeometry(s,0),x,y,z,hs(sd,1,2)*2,hs(sd,3,4)*2,0,[1,1.3,1]),{j:s*.3,sd,paint:(h,ny,r)=>{const v=.85+.4*r;return C(0xc8ccd4,v)}});
  const ironN=merge([nug(.18,.58,.22,.1,113),nug(-.2,.5,.26,.08,114),nug(.36,.32,-.12,.09,115),nug(-.08,.62,-.2,.07,116),nug(-.42,.24,.06,.07,117)]);
  // ---- crystal: dark rock base with tall glowing shards ----
  const cbase=fin(tr(new G.DodecahedronGeometry(.3,0),0,.12,0,0,0,0,[1.25,.55,1.1]),{j:.08,sd:121,paint:(h,ny,r)=>sh(C(0x4a4a5a),ny,h,r)});
  const sp=(x,z,hh,rr,rx,rz,sd)=>fin(tr(new G.OctahedronGeometry(1,0),0,0,0,0,0,0,[rr,hh,rr]).rotateX(rx).rotateZ(rz).translate(x,hh*.85,z),{j:.02,sd,paint:(h,ny,r)=>{const v=.62+.55*h+.15*r;return [v*.75,v*.95,v*1.1]}});
  const shards=merge([sp(0,0,.62,.13,0,0,122),sp(.18,.1,.42,.1,.2,-.35,123),sp(-.17,.06,.46,.1,-.1,.4,124),sp(.04,-.18,.34,.08,-.4,.1,125)]);
  // ---- fiber grass: tall pale blades with seed heads ----
  const blades=[];for(let i=0;i<11;i++){const a=i/11*6.283+hs(i,1,3),r0=.05+hs(i,2,5)*.12,hh=.55+hs(i,3,7)*.45,lean=.18+hs(i,4,8)*.22;
    blades.push(fin(tr(new G.ConeGeometry(.045,hh,3,2),0,hh/2,0,0,0,0,[1,1,.45]).rotateY(a).rotateZ(lean*Math.cos(a)).rotateX(-lean*Math.sin(a)).translate(Math.cos(a)*r0,0,Math.sin(a)*r0),{j:.01,sd:130+i,paint:(h)=>mix(C(0x6a8a34),C(0xe0cc7a),Math.min(1,h*1.2))}))}
  for(let i=0;i<4;i++){const a=i/4*6.283+.6,hh=.95+hs(i,9,9)*.2;blades.push(fin(tr(new G.OctahedronGeometry(.05,0),Math.cos(a)*.16,hh,Math.sin(a)*.16,0,0,0,[1,2.4,1]),{sd:150+i,paint:()=>C(0xd8b860)}))}
  const fiber=merge(blades);
  // ---- berry bush: round dark leaves with red berries ----
  const lf=(h,ny,r)=>sh(ny<-.3?C(0x1e3a1c):C(0x2f6a2a),ny,h,r);
  const bbush=merge([fin(tr(new G.IcosahedronGeometry(.36,0),0,.34,0),{j:.08,sd:161,paint:lf}),fin(tr(new G.IcosahedronGeometry(.26,0),.24,.24,.12),{j:.06,sd:162,paint:lf}),fin(tr(new G.IcosahedronGeometry(.24,0),-.22,.22,-.12),{j:.06,sd:163,paint:lf})]);
  const bb=[];[[0,.34,0,.36],[.24,.24,.12,.26],[-.22,.22,-.12,.24]].forEach(([cx,cy,cz,rr],q)=>{for(let i=0;i<6;i++){const u=hs(q,i,1)*6.283,v=.15+hs(i,q,2)*1.25,x=cx+Math.cos(u)*Math.sin(v)*rr*1.02,y=cy+Math.cos(v)*rr*.98,z=cz+Math.sin(u)*Math.sin(v)*rr*1.02;
    bb.push(fin(tr(new G.IcosahedronGeometry(.052,0),x,y,z),{sd:170+q*10+i,paint:(h,ny,r)=>C(r>.75?0xff6a7a:0xd81e3a)}))}});
  const berries=merge(bb);
  // ---- flowers: leaf rosette, stems, big blooms (petals take the instance colour) ----
  const fl=[],pt=[];
  for(let i=0;i<5;i++){const a=i/5*6.283;fl.push(fin(tr(new G.IcosahedronGeometry(.1,0),Math.cos(a)*.14,.03,Math.sin(a)*.14,0,-a,0,[1.6,.25,.7]),{sd:180+i,paint:(h,ny,r)=>sh(C(0x3c7a30),ny,h,r)}))}
  [[0,0,.42],[.16,.08,.32],[-.13,.12,.28]].forEach(([x,z,hh],q)=>{fl.push(fin(tr(new G.CylinderGeometry(.012,.016,hh,3),x,hh/2,z),{sd:190+q,paint:()=>C(0x4a8a3a)}));
    fl.push(fin(tr(new G.OctahedronGeometry(.035,0),x,hh+.012,z),{sd:195+q,paint:()=>C(0xffd23a,1.2)}));
    for(let i=0;i<5;i++){const a=i/5*6.283+q;pt.push(fin(tr(new G.IcosahedronGeometry(.06,0),x+Math.cos(a)*.065,hh,z+Math.sin(a)*.065,0,-a,0,[1.5,.3,.9]),{sd:200+q*10+i,paint:(h,ny,r)=>{const v=.95+.2*r;return [v,v,v]}}))}});
  const fstem=merge(fl),fpet=merge(pt);
  // ---- glow caps: three mushrooms, glowing caps with pale spots ----
  const ms=[],mc=[];[[0,0,.3,.17],[.17,.09,.2,.12],[-.14,.11,.16,.1]].forEach(([x,z,hh,rr],q)=>{
    ms.push(fin(tr(new G.CylinderGeometry(rr*.28,rr*.38,hh,5),x,hh/2,z),{sd:210+q,paint:(h,ny,r)=>sh(C(0xe0d8c4),ny,h,r)}));
    mc.push(fin(tr(new G.SphereGeometry(rr,7,3,0,6.283,0,Math.PI/2),x,hh-.02,z,0,0,0,[1,.75,1]),{j:.012,sd:220+q,paint:(h,ny,r)=>r>.8&&ny>.2?[1.6,1.6,1.6]:[.85+.25*h,.85+.25*h,.85+.25*h]}))});
  const mstem=merge(ms),mcap=merge(mc);
  // ---- bones: skull, ribs and a long bone ----
  const bn=(h,ny,r)=>sh(C(0xe4dac0),ny,h,r,.84),dk=()=>C(0x2a2018);
  const skull=[fin(tr(new G.IcosahedronGeometry(.15,1),0,.14,0,0,0,0,[1,.9,1.15]),{j:.015,sd:231,paint:bn}),fin(tr(new G.BoxGeometry(.16,.07,.1),0,.05,.13),{j:.01,sd:232,paint:bn}),
    fin(tr(new G.IcosahedronGeometry(.04,0),.055,.15,.15),{sd:233,paint:dk}),fin(tr(new G.IcosahedronGeometry(.04,0),-.055,.15,.15),{sd:234,paint:dk})].map(g=>g.rotateY(.5).translate(.15,0,.12));
  const ribs=[];for(let i=0;i<4;i++)ribs.push(fin(tr(new G.TorusGeometry(.16-i*.015,.02,3,6,Math.PI),-.2+i*.09,.0,-.12,0,Math.PI/2,0),{sd:240+i,paint:bn}));
  const lb=[fin(tr(new G.CylinderGeometry(.03,.03,.5,4),0,0,0,0,0,Math.PI/2),{sd:250,paint:bn}),fin(tr(new G.IcosahedronGeometry(.055,0),.26,0,0),{sd:251,paint:bn}),fin(tr(new G.IcosahedronGeometry(.055,0),-.26,0,0),{sd:252,paint:bn})].map(g=>g.rotateY(-.7).translate(-.05,.04,.22));
  const bones=merge([...skull,...ribs,...lb]);
  // part: [geometry, glow (basic material), colour (hex | 'flw' = per-node flower colour), sway]
  return {
    stone:{base:'rock',parts:[[stone,0,0xffffff,0]]},
    iron:{base:'rock',parts:[[ironR,0,0xffffff,0],[ironN,1,0xffffff,0]]},
    crystal:{base:'crystal',parts:[[cbase,0,0xffffff,0],[shards,1,0x8ad8ff,0]]},
    fiber:{base:'bush',parts:[[fiber,0,0xffffff,.12]]},
    berry:{base:'bush',parts:[[bbush,0,0xffffff,.04],[berries,1,0xffffff,.04]]},
    flower:{base:'flower',parts:[[fstem,0,0xffffff,.12],[fpet,1,'flw',.12]]},
    mush:{base:'mush',parts:[[mstem,0,0xffffff,0],[mcap,1,0xd078ff,0]]},
    bones:{base:'bones',parts:[[bones,0,0xffffff,0]]}}})();
// a stand-alone mesh of one node kind (tests and previews)
function lnModel(v){const D=LNM&&LNM[v];if(!D)return null;const g=new THREE.Group();D.parts.forEach(([geo,glow,col])=>{const m=new THREE.Mesh(geo,lnMat(glow,v=='flower'));if(col!=0xffffff)m.material=m.material.clone(),m.material.color.setHex(col=='flw'?0xe86a9a:col);g.add(m)});return g}
function lnMat(glow,ds){const m=glow?new THREE.MeshBasicMaterial({vertexColors:true}):new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,flatShading:true});if(ds)m.side=THREE.DoubleSide;m.userData.lps=1;return m}

// ---- swap the old prop instances for the new models (same tiles, scale, regrowth and colliders) ----
function lnSwapNodes(){if(!LNM||typeof VIL=='undefined'||typeof PK=='undefined'||typeof CHL=='undefined')return 0;
  const OFF={rock:.25,bones:.1,bush:.25,mush:.15,crystal:.35,flower:.12},FLWc=typeof FLW!='undefined'?FLW:[0xf0e060,0xe86a9a,0xffffff,0x9a7aff];
  const NEAR={flower:1,bones:1,mush:1},m4=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),scl=new THREE.Vector3(),d=new THREE.Object3D(),cc2=new THREE.Color();
  // chunks by key
  const CK={};CHL.forEach(c=>{const k=Math.round((c.box.min.z+2)/CHN)*100+Math.round((c.box.min.x+2)/CHN);CK[k]=c});
  let swapped=0;
  Object.keys(OFF).forEach(k=>{const old=VIL.find(v=>v.geo===PK[k][0]);if(!old)return;const L=MAP.props.filter(p=>p[2]==k);if(L.length!==old.n)return;
    // group this kind's nodes by variant
    const byV={};L.forEach((p,i)=>{const v=lnV({kind:k=='rock'?'rock':k,x:p[0],y:p[1]});const vv=k=='rock'?v:k=='bush'?v:k;(byV[vv]=byV[vv]||[]).push(i)});
    const rep={},src=L.map((p,i)=>{const e=(NODE[p[1]*W+p[0]]||[]).find(e=>e[0]===old&&e[1]===i);if(e&&e[2])return e[2].clone();const M=new THREE.Matrix4();old.getMatrixAt(i,M);return M});// old index -> [[virtual mesh, index], ...]
    Object.keys(byV).forEach(vk=>{const D=LNM[vk];if(!D)return;const ids=byV[vk];
      D.parts.forEach(([geo,glow,col,sway])=>{const v=inst(geo,ids.length,!glow,!!NEAR[k]);VIL.pop();v.material=lnMat(glow,k=='flower');v.sway=sway;v.off=0;
        ids.forEach((i,j)=>{const p=L[i];src[i].decompose(pos,q,scl);const s=scl.x,y0=pos.y-OFF[k]*s;
          d.position.set(pos.x,y0-.02*s,pos.z);d.rotation.set(0,lnHash(p[0],p[1],3)*6.283,0);d.scale.setScalar(s*(({flower:1.45,mush:1.35,bones:1.2,crystal:1.1})[k]||1));d.updateMatrix();v.setMatrixAt(j,d.matrix);
          cc2.setHex(col=='flw'?FLWc[(p[0]+p[1])%4]:col);if(col!=0xffffff||glow)cc2.offsetHSL(0,0,(lnHash(p[0],p[1],7)-.5)*.08);else{const t=.92+lnHash(p[0],p[1],7)*.16;cc2.setRGB(t,t,t)}v.setColorAt(j,cc2);
          (rep[i]=rep[i]||[]).push([v,j])});
        lnChunk(v,CK)})});
    // re-point the node registry (keeps hidden/depleted state) and drop the old meshes
    L.forEach((p,i)=>{const key=p[1]*W+p[0],arr=NODE[key];if(!arr||!rep[i])return;
      for(let a=arr.length-1;a>=0;a--){const e=arr[a];if(e[0]!==old||e[1]!==i)continue;const hid=!!e[2];arr.splice(a,1);
        rep[i].forEach(([v,j])=>{const n=[v,j,null];if(hid){n[2]=new THREE.Matrix4();v.getMatrixAt(j,n[2]);v.setMatrixAt(j,ZM)}arr.push(n)})}});
    new Set(old.cm||[]).forEach(mesh=>{if(!mesh)return;scene.remove(mesh);CHL.forEach(c=>{let x=c.ms.indexOf(mesh);if(x>=0)c.ms.splice(x,1);x=c.ns.indexOf(mesh);if(x>=0)c.ns.splice(x,1)})});
    old.cm=null;old.n=0;swapped+=L.length});
  CHL.forEach(c=>{c.on=null;c.non=null});return swapped}
// build chunked InstancedMeshes for a virtual mesh (same scheme as buildVI)
function lnChunk(v,CK){windMat(v.material,v.sway||0,v.off);const g={};v.cm=new Array(v.n);v.cl=new Int32Array(v.n);
  for(let i=0;i<v.n;i++){const cx=Math.max(0,Math.floor(v.M[i*16+12]/CHN)),cz=Math.max(0,Math.floor(v.M[i*16+14]/CHN)),k=cz*100+cx;(g[k]=g[k]||[]).push(i)}
  for(const k in g){const ids=g[k],mesh=new THREE.InstancedMesh(v.geo,v.material,ids.length),col=new Float32Array(ids.length*3);
    ids.forEach((i,j)=>{mesh.instanceMatrix.array.set(v.M.subarray(i*16,i*16+16),j*16);col.set(v.C.subarray(i*3,i*3+3),j*3);v.cm[i]=mesh;v.cl[i]=j});
    mesh.instanceColor=new THREE.InstancedBufferAttribute(col,3);mesh.castShadow=false;mesh.userData.cast=!!v.cast;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.visible=false;scene.add(mesh);
    let c=CK[k];if(!c){c=CK[k]={ms:[],ns:[],on:false,non:false,box:new THREE.Box3(new THREE.Vector3((k%100)*CHN-2,-3,Math.floor(k/100)*CHN-2),new THREE.Vector3((k%100+1)*CHN+2,40,(Math.floor(k/100)+1)*CHN+2))};CHL.push(c)}
    c[v.near?'ns':'ms'].push(mesh)}}
try{LN.swapped=lnSwapNodes()}catch(e){console.warn('loot nodes',e);LN.swapErr=String(e)}

