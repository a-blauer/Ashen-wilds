// ================= v165 The Hidden Sanctum — the level =================
// Beneath the Keeper's grave (3312) a stair goes down into the Low Sanctum, built to keep intruders from the Drowned Crypts below.
// It is played once: through the Keeper's Tomb at its bottom you come out in The Dirge II, and from then on the grave's stair
// leads straight there. Halls, in order (plan dg165SanPlan, 3310; local u/v, world = I.x0+u-.5, I.y0+v-.5):
//  1 The Stair Hall           arrival; the stair back up to the graveyard.
//  2 The Hall of Pendulums    five crescent blades sweep across a narrow hall at their own pace: time each one.
//  3 The Spike Hall           the floor's spike plates rise in bands that roll toward you (a red glow just before they rise).
//  4 The Antechamber + Fire Walk   a pressure plate lifts the portcullis at the far end of a corridor of fire-breathing skulls for
//                             DG165SP.gateT seconds: run it before the gate drops again (timed).
//  5 The Chasm                a bridge of slabs over a black drop; each slab cracks under your feet and falls a moment later.
//                             Falling costs health and puts you back at the chasm's edge with the bridge whole again.
//  6 The Closing Walls        the doors slam, spiked walls grind in from both sides; turn the four weeping knights to face the
//                             altar before the walls meet (timed: DG165SP.cwT). The dead in the walls' niches climb out to stop you.
//  7 The Ossuary Gallery      bones in the walls, cages overhead; something passes in the dark.
//  8 The Keeper's Tomb        the flooded stair down: F · Descend into the Drowned Crypts.
// Checkpoints at the start of halls 1, 3, 4, 5, 6, 7 (DG165Q.s.cp). Dying wakes you at the last checkpoint, healed; the hall you
// died in starts over. Inside: companions wait above, no mount, no recall (the stair back up is in the first hall).
var DG165S={S:null,err:0,fall:null,cw:null,gate:null,scare:{},hT:0};
var DG165SP={amp:.62,armL:6.5,pivot:7.6,spkStep:.62,spkWarn:.36,jetPer:2.9,jetOn:1.25,gateT:16,cwT:42,cwEnd:4.6,cwStart:20,slabT:.75,fallT:1.1};
function dg165SIn(){return sp152Here('sanctum')}
function dg165SI(){return sp152I('sanctum')}
function dg165SW(u,v){const I=dg165SI();return [I.x0+u-.5,I.y0+v-.5]}
function dg165SL(x,z){const I=dg165SI();return [x-I.x0+.5,z-I.y0+.5]}
function dg165SY(){return dg165SCfg().F0}
// ---------------- building it ----------------
function dg165SBuild(){if(DG165S.S)return DG165S.S;const I=dg165SI(),P=dg165SanPlan(),F0=dg165SY(),root=new THREE.Group();root.name='Sanctum';scene.add(root);
  const S={I,P,root,spots:[],fl:[],pend:[],jets:[],slabs:[],statues:[],t:0};DG165S.S=S;
  const at=(u,v,y)=>{const [x,z]=dg165SW(u,v);return [x,y==null?F0:y,z]},put=(o,u,v,ry,y)=>{const q=at(u,v,y);o.position.set(q[0],q[1],q[2]);o.rotation.y=ry||0;root.add(o);return o};
  root.add(dg165SFloor(I));dg165SWalls(I).forEach(m=>root.add(m));
  // sconces along the walls: every few tiles on alternate sides of each hall
  const R=svRng(5300),sc=[];const wallAt=(u,v,du,dv)=>{const k=dg165SanFloor(u+.5,v+.5),n=dg165SanFloor(u+du+.5,v+dv+.5);return k&&k!='pit'&&k!='bridge'&&!n};
  for(let v=0;v<I.h;v+=1)for(let u=0;u<I.w;u+=1)for(const [du,dv] of [[1,0],[-1,0],[0,1],[0,-1]])if(wallAt(u,v,du,dv)&&((u*7+v*13+(du+2)*5+(dv+2)*3)%11)==0)sc.push([u,v,du,dv]);
  [84,92,100].forEach(v=>{sc.push([58,v,-1,0]);sc.push([101,v,1,0])});[150,186,200].forEach(v=>{if(wallAt(40,v,-1,0))sc.push([40,v,-1,0])});
  const scK=lgGroup('DG165|sconce',dg165SconceKit,0);
  sc.forEach(([u,v,du,dv])=>{const g=scK.clone();const q=at(u+.5+du*.47,v+.5+dv*.47,F0+2.4);g.position.set(q[0],q[1],q[2]);g.rotation.y=Math.atan2(-du,-dv);root.add(g);
    const fx=q[0]-du*.27,fz=q[2]-dv*.27,f=dg165Flame(root,fx,q[1]+.42,fz,.34,0xffa040);S.fl.push(f);S.spots.push({x:fx,y:q[1]+.6,z:fz,c:0xffa050,i:2.0,r:11,ph:R()*6})});
  // braziers in the corners of the big halls, soul lights over the chasm
  const brK=lgGroup('DG165|brazier',dg165BrazierKit,0);[[60,80],[100,80],[60,108],[100,108],[70,10],[90,10],[70,28],[90,28],[60,162],[68,162],[88,212],[96,212],[89,216],[95,216],[89,248.4],[95,248.4],[78,288],[106,288],[78,318],[106,318]].forEach(([u,v])=>{const g=brK.clone();put(g,u,v,0);const q=at(u,v);const f=dg165Flame(root,q[0],q[1]+1.32,q[2],.55,0xff9a40);S.fl.push(f);S.spots.push({x:q[0],y:q[1]+1.9,z:q[2],c:0xff9040,i:2.4,r:13,ph:R()*6});const [x,z]=dg165SW(u,v);CBLK.add(Math.round(z)*W+Math.round(x))});
  [[64,170],[78,183],[80,195],[90,203]].forEach(([u,v])=>{const q=at(u,v,dg165SY()+3.2);const f=kqSpr(0x7affc0,.7);f.position.set(q[0],q[1],q[2]);root.add(f);S.fl.push(f);S.spots.push({x:q[0],y:q[1],z:q[2],c:0x6affb0,i:1.6,r:12,fq:1.3,ph:R()*6})});
  // clutter: bones, rubble, coffins, urns, skeletons, cobwebs, chains and cages, per hall
  const D=[],add=(kind,u,v)=>D.push([kind,u,v]);
  for(let i=0;i<180;i++){const u=40+R()*72,v=8+R()*312,k=dg165SanFloor(u,v);if(!k||k=='pit'||k=='bridge'||k=='spike'||k=='pend'||k=='flame'||k=='walls')continue;
    const near=(du,dv)=>!dg165SanFloor(u+du,v+dv);const edge=near(1.6,0)||near(-1.6,0)||near(0,1.6)||near(0,-1.6);if(!edge&&k!='tomb'&&k!='entry')continue;
    add(['bones','rubble','bones','urns','coffin','skeleton','rubble'][(R()*7)|0],u,v)}
  [[70,10],[90,10],[69,28],[91,28]].forEach(q=>add('web',q[0],q[1]));[[78,32],[82,76]].forEach(q=>add('web',q[0],q[1]));[[59,80],[101,80],[59,108],[101,108]].forEach(q=>add('web',q[0],q[1]));
  for(let v=254;v<284;v+=6)add('cage',89.5+((v/6)%2)*5,v);for(let v=252;v<286;v+=4)add('chains',v%8?89:95,v);[[80,296],[104,296],[80,312],[104,312]].forEach(q=>add('coffin',q[0],q[1]));
  root.add(lgGroup('DG165|sclutter',k=>{const RR=svRng(5301);D.forEach(([kind,u,v])=>{const [x,y,z]=at(u,v);dg165ClutterKit(k,RR,kind,x,y,z)})},0));
  // the stair back up (north wall of the Stair Hall)
  S.up=put(lgGroup('DG165|supstair',k=>{for(let i=0;i<7;i++)k.p('','box','c',lgCol(0x4a4a4e,0x1a1a1c,i/7),0,.1+i*.32,-i*.42,2.6,.3,.5);[-1,1].forEach(s=>k.p('','box','c',0x3a3a3e,s*1.45,1.4,-1.4,.3,2.8,3));
    k.p('','box','c',0x050505,0,2.6,-3.2,2.6,2.4,.1);k.p('','box','c',0x3a3a3e,0,4.1,-1.4,3.2,.4,3.2)},0),80,9.6,0);
  // the Hall of Pendulums: five blades on beams across the hall
  const pK=dg165Pendulum;P.pend.forEach((q,i)=>{const g=pK();const w=at(80,q.v,F0+DG165SP.pivot);g.position.set(w[0],w[1],w[2]);root.add(g);S.pend.push({g,arm:g.userData.arm,q,th:0,u:80,v:q.v})});
  // a corpse impaled on the third blade (it swings with it)
  {const a=S.pend[2].arm;a.add(lgGroup('DG165|pcorpse',k=>{const C=DG165SM.c;k.p('','sph','c',C.bone,0,-5.5,.3,.16,.17,.18);k.p('','box','c',0x2a2018,0,-6.0,.3,.42,.6,.24);for(let i=0;i<4;i++)k.p('','ring','c',C.bone2,0,-5.85-i*.1,.32,.16,.3,.08,0,0,Math.PI/2);
    [-1,1].forEach(s=>{k.L('','c',C.bone,[s*.2,-5.8,.3],[s*.5,-6.4,.3],.03,.025,4);k.L('','c',C.bone,[s*.1,-6.3,.3],[s*.18,-7.1,.3],.035,.03,4)})},0))}
  // the Spike Hall: plates baked into one group, the spikes instanced, a warning glow instanced
  {const Q=P.spk,cols=(Q.u1-Q.u0)/Q.cs,rows=(Q.v1-Q.v0)/Q.cs;S.spk={cols,rows,h:new Float32Array(cols*rows),up:new Uint8Array(cols*rows),k:-1};
    root.add(lgGroup('DG165|splates',k=>{const kk=dkKit();dg165SpikePlateKit(kk);for(let c=0;c<cols;c++)for(let r=0;r<rows;r++){const [x,y,z]=at(Q.u0+c*Q.cs+1,Q.v0+r*Q.cs+1);kk.P.forEach(p=>{const m=p.m.clone();m.premultiply(new THREE.Matrix4().makeTranslation(x,y,z));k.P.push(Object.assign({},p,{m}))})}},0));
    const mat=new THREE.MeshStandardMaterial({color:0xc8ccd4,metalness:.15,roughness:.45,flatShading:true}),M=new THREE.InstancedMesh(dg165SpikesGeo(),mat,cols*rows);M.frustumCulled=false;root.add(M);S.spk.M=M;
    const gm=new THREE.MeshBasicMaterial({color:0xff3010,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),GM=new THREE.InstancedMesh(new THREE.PlaneGeometry(1.8,1.8).rotateX(-Math.PI/2),gm,cols*rows);GM.frustumCulled=false;root.add(GM);S.spk.G=GM;
    // three dead adventurers lie on the spikes as a warning
    root.add(lgGroup('DG165|sskel',k=>{const RR=svRng(5310);[[64,90],[88,96],[96,86]].forEach(q=>{const [x,y,z]=at(q[0],q[1]);dg165ClutterKit(k,RR,'skeleton',x,y+.02,z)})},0))}
  // the Antechamber's plate, the Fire Walk's skulls and the portcullis at its end
  S.plate=put(lgGroup('DG165|plate',dg165PlateKit,0),P.plate[0],P.plate[1],0);
  const nzK=lgGroup('DG165|nozzle',dg165NozzleKit,0);
  P.jets.forEach((q,i)=>{const u=q.side<0?P.R.flame[0]+.05:P.R.flame[2]-.05,g=nzK.clone(),w=at(u,q.v,F0+1.15);g.position.set(w[0],w[1],w[2]);g.rotation.y=q.side<0?Math.PI/2:-Math.PI/2;root.add(g);
    // the flame: three nested additive cones along the corridor's width (scaled by the tick)
    const fl=new THREE.Group();fl.position.set(w[0],w[1],w[2]);fl.rotation.y=q.side<0?Math.PI/2:-Math.PI/2;root.add(fl);
    [[0xff5010,.55,.85],[0xffa030,.38,.7],[0xfff0a0,.2,.6]].forEach(([c,r,o])=>{const m=new THREE.Mesh(svG('dg165fc'+r,()=>new THREE.ConeGeometry(r,6,10,1,true).rotateX(-Math.PI/2).translate(0,0,3.1)),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));fl.add(m)});
    fl.scale.set(1,1,.001);S.jets.push({q,fl,u,on:0,x:w[0],z:w[2]});S.spots.push({x:w[0]+(q.side<0?1:-1)*2.8,y:F0+1.3,z:w[2],c:0xff7020,i:0,r:9,jet:i})});
  {const G=P.gate,g=dg165Portcullis(G.u1-G.u0,4.2);put(g,(G.u0+G.u1)/2,G.v,0);S.gateM=g;S.gateY=F0}
  // the Chasm: slabs, faint green ghost lights far below
  P.bridge.forEach((q,i)=>{const g=put(lgGroup('DG165|slab'+(i%6),k=>dg165SlabKit(k,i%6),0),q[0],q[1],(i%4)*Math.PI/2);S.slabs.push({g,u:q[0],v:q[1],st:0,t:0,y0:F0,tiles:[]})});
  S.slabs.forEach(s=>{for(let du=-1;du<1;du++)for(let dv=-1;dv<1;dv++){const [x,z]=dg165SW(s.u+du+.5,s.v+dv+.5);s.tiles.push(Math.round(z)*W+Math.round(x))}});
  for(let i=0;i<14;i++){const [x,,z]=at(42+R()*60,162+R()*50);const f=kqSpr(0x3aff9a,.9+R());f.material=f.material.clone();f.material.opacity=.3;f.position.set(x,3+R()*6,z);root.add(f);S.fl.push(f)}
  // the chasm's depths: a cold green glow far below (sprites, so nothing shows through in patches)
  for(let i=0;i<16;i++){const [x,,z]=at(44+R()*56,163+R()*48);const f=kqSpr(0x1a8a5a,7+R()*6);f.material=f.material.clone();f.material.opacity=.22;f.position.set(x,dg165SCfg().pit+1.5,z);root.add(f)}
  [[50,175],[96,170],[52,200],[70,192]].forEach(([u,v])=>{const q=at(u,v,dg165SCfg().pit+3);S.spots.push({x:q[0],y:q[1],z:q[2],c:0x3aff9a,i:2.4,r:20,fq:.8,ph:R()*6})});
  // the Closing Walls: two spiked walls, the two doors, four weeping knights round the altar
  {const C=P.cw,len=C.doorS-C.doorN,wK=lgGroup('DG165|cwall',k=>dg165CWallKit(k,len),0);S.cwL=put(wK,C.mid-DG165SP.cwStart-.5,(C.doorN+C.doorS)/2,0);S.cwR=put(wK.clone(),C.mid+DG165SP.cwStart+.5,(C.doorN+C.doorS)/2,Math.PI);
    S.cwL.visible=S.cwR.visible=false;
    const dN=dg165Portcullis(12,4.2);put(dN,92,C.doorN-.15,0);S.doorN=dN;const dS=dg165Portcullis(8,4.2);put(dS,92,C.doorS,0);S.doorS=dS;
    put(lgGroup('DG165|altar',dg165AltarKit,0),P.altar[0],P.altar[1],0);const sK=lgGroup('DG165|statue',dg165StatueKit,0);
    P.statues.forEach((q,i)=>{const g=sK.clone();put(g,q[0],q[1],0);S.statues.push({g,u:q[0],v:q[1],f:0,want:i,yaw:0,anim:null})});
    S.spots.push({x:at(92,232.5)[0],y:F0+1.6,z:at(92,232.5)[2],c:0x9affc8,i:1.2,r:12,fq:2})}
  // the Keeper's Tomb: his sarcophagus (the lid slides), coffins along the walls, the flooded stair
  {S.sarc=put(lgGroup('DG165|sarc',k=>dg165SarcKit(k,false),0),P.keeper[0],P.keeper[1],0);S.lid=put(lgGroup('DG165|lid',k=>dg165SarcKit(k,true),0),P.keeper[0],P.keeper[1],0);
    S.stair=put(lgGroup('DG165|flood',dg165FloodStairKit,0),P.exit[0],P.exit[1]+1.4,Math.PI);
    const wm=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x1a8a6a,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    const w=at(P.exit[0],P.exit[1]+2.6,F0-1.0);wm.position.set(w[0],w[1],w[2]);root.add(wm);S.water=wm;S.spots.push({x:w[0],y:F0,z:w[2],c:0x3affb0,i:1.6,r:9,fq:1.5})}
  // the solid bits: altar, statues, sarcophagus
  const blk=(u,v,r)=>{for(let du=-r;du<=r;du+=.5)for(let dv=-r;dv<=r;dv+=.5){if(du*du+dv*dv>r*r)continue;const [x,z]=dg165SW(u+du,v+dv);CBLK.add(Math.round(z)*W+Math.round(x))}};
  blk(P.altar[0],P.altar[1],1.1);P.statues.forEach(q=>blk(q[0],q[1],.7));blk(P.keeper[0],P.keeper[1]-.8,.8);blk(P.keeper[0],P.keeper[1]+.6,.8);
  S.pool=dg165LPool(10,11);dg165SDoors();return S}
// the doors' tiles: blocked while shut
function dg165SBlkRow(u0,u1,v,on){for(let u=u0;u<u1;u++){const [x,z]=dg165SW(u+.5,v+.5),k=Math.round(z)*W+Math.round(x);if(on)CBLK.add(k);else CBLK.delete(k)}}
function dg165SDoors(){const S=DG165S.S;if(!S)return;const C=S.P.cw,cw=DG165S.cw,shutN=!!(cw&&cw.ph!='done'),shutS=!DG165Q.s.cw;
  // the gate at the end of the Fire Walk
  const G=S.P.gate,open=!!(DG165S.gate&&DG165S.gate.open)||DG165Q.s.cp>=3;dg165SBlkRow(G.u0,G.u1,Math.floor(G.v),!open);S.gateOpen=open;
  dg165SBlkRow(86,98,C.doorN-1,shutN);dg165SBlkRow(88,96,C.doorS,shutS);S.shutN=shutN;S.shutS=shutS}
// ---------------- each frame in the Sanctum ----------------
function dg165STick(dt,now){const inS=dg165SIn();
  if(!inS){const S=DG165S.S;if(S){S.root.visible=false;dg165LPoolTick(S.pool,S.spots,pl.position,0,false)}DG165S.fall=null;if(DG165S.cw&&DG165S.cw.ph=='run')dg165SCwReset();if(!DG165S.off){DG165S.off=1;dg165SHud()}return}
  DG165S.off=0;const S=dg165SBuild(),P=S.P,t=now/1000,F0=dg165SY(),H=pl.position,[hu,hv]=dg165SL(H.x,H.z),room=dg165SanFloor(hu,hv);S.root.visible=true;S.t+=dt;
  if(riding)try{dismount(true)}catch(_){}
  // checkpoints
  const cpAt=room=='spike'?1:room=='plate'||room=='flame'?2:(room=='ledge'&&hv<170)?3:room=='walls'&&hv>215.5?4:room=='gal'||room=='tomb'?5:0;
  if(cpAt>DG165Q.s.cp){DG165Q.s.cp=cpAt;try{pickup({ic:'✦',t:'Checkpoint',col:'#9ae8c8',sub:P.CP[cpAt][3]})}catch(_){}dg165Co('scp',cpAt)}
  // lights: the nearest sconces (the gallery's go out while something passes)
  dg165LPoolTick(S.pool,S.spots,H,t,!(DG165S.scare.dark>now));dg165FlTick(S.fl,t);
  const live=!(typeof AWD!='undefined'&&AWD.dead)&&!DG165S.fall;
  dg165SPend(S,dt,t,hu,hv,live);dg165SSpikes(S,dt,t,hu,hv,live);dg165SJets(S,dt,t,hu,hv,live);dg165SGate(S,dt,now,hu,hv);dg165SChasm(S,dt,now,hu,hv,room);dg165SCw(S,dt,now,hu,hv,room);dg165SScares(S,dt,now,hu,hv);
  if(S.water){S.water.material.opacity=.45+.12*Math.sin(t*1.7)}
  if(now-DG165S.hT>120){DG165S.hT=now;dg165SHud()}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{dg165STick(dt,now)}catch(e){if(!DG165S.err++)console.error('v165 sanctum',e)}return r}}
// the pendulums: each swings at its own pace; a blade near the bottom of its swing cuts whoever is in its path
function dg165SPend(S,dt,t,hu,hv,live){const A=DG165SP.amp;for(const p of S.pend){const q=p.q,th=A*Math.sin(t*q.w+q.ph),w=A*q.w*Math.cos(t*q.w+q.ph);p.arm.rotation.z=th;
    const bu=80+DG165SP.armL*Math.sin(th),by=DG165SP.pivot-DG165SP.armL*Math.cos(th);
    if(Math.abs(th)<.12&&!p.wh&&Math.abs(hv-q.v)<9){p.wh=1;try{dg165Snd('scrape',.25,1.6);svSnd('whoosh',.35,.7)}catch(_){}}else if(Math.abs(th)>.3)p.wh=0;
    if(live&&Math.abs(hv-q.v)<.62&&Math.abs(hu-bu)<1.25&&by<1.7&&Math.abs(w)>.4){if(dg165Hurt(.3,'SLASHED')){const d=hv<q.v?-1:1;pl.step={x:0,z:d,sp:7,t:.22};burst(gY(pl.position,1.1),0x8a0a0a,18,3,2,.5)}}}}
// the spike hall: bands of raised spikes rolling toward the entrance; a red glow warns of the next row
function dg165SSpikes(S,dt,t,hu,hv,live){const Q=S.P.spk,K=S.spk,st=DG165SP.spkStep,k=Math.floor(t/st),fr=t/st-k,warn=fr>1-DG165SP.spkWarn/st,F0=dg165SY(),o=dg165SSpikes.o||(dg165SSpikes.o=new THREE.Object3D());
  const upAt=(c,r,kk)=>((r+kk+(((c>>2)&1)*2))%4)<2;let mv=false,gw=false;
  const hc=Math.floor((hu-Q.u0)/Q.cs),hr=Math.floor((hv-Q.v0)/Q.cs),inG=hc>=0&&hr>=0&&hc<K.cols&&hr<K.rows;
  for(let c=0;c<K.cols;c++)for(let r=0;r<K.rows;r++){const i=c*K.rows+r,u=upAt(c,r,k),want=u?1:0;let h=K.h[i];if(h!==want){h+=(want-h)*Math.min(1,dt*(want?28:9));if(Math.abs(h-want)<.01)h=want;K.h[i]=h;mv=true}
    if(u&&!K.up[i]&&Math.abs(c-hc)<6&&Math.abs(r-hr)<5&&Math.random()<.25)dg165Snd('spikes',.18,.9+Math.random()*.3);K.up[i]=u?1:0;
    const [x,z]=dg165SW(Q.u0+c*Q.cs+1,Q.v0+r*Q.cs+1);o.position.set(x,F0-1.0+h*1.0,z);o.rotation.set(0,0,0);o.scale.set(1,1,1);o.updateMatrix();K.M.setMatrixAt(i,o.matrix);
    const g=warn&&!u&&upAt(c,r,k+1);o.position.set(x,F0+.07,z);o.scale.setScalar(g?1:.0001);o.updateMatrix();K.G.setMatrixAt(i,o.matrix);gw=gw||g}
  K.M.instanceMatrix.needsUpdate=true;K.G.instanceMatrix.needsUpdate=true;K.G.material.opacity=.35+.3*Math.sin(t*30);
  if(live&&inG){const i=hc*K.rows+hr;if(K.h[i]>.55)dg165Hurt(.24,'IMPALED')}}
// the fire walk: skull mouths breathe fire across the corridor in a rolling pattern
function dg165SJets(S,dt,t,hu,hv,live){const per=DG165SP.jetPer,on=DG165SP.jetOn;S.jets.forEach((J,i)=>{const ph=((t+J.q.ph)%per+per)%per,a=ph<on,pre=!a&&ph>per-.45;
    const k=a?Math.min(1,ph/.12)*(ph>on-.15?(on-ph)/.15:1):0;J.fl.scale.set(.6+k*.5+Math.sin(t*40+i)*.05*k,.6+k*.5,Math.max(.001,k));J.fl.visible=k>.002;
    if(a&&!J.on){J.on=1;if(Math.abs(hv-J.q.v)<14)dg165Snd('fire',.5,.9+Math.random()*.2)}if(!a)J.on=0;
    if(pre&&Math.random()<.3)burst(V(J.x,dg165SY()+1.15,J.z),0xff6020,1,.3,.4,.3);if(k>.3&&Math.random()<.6)burst(V(J.x+(J.q.side<0?1:-1)*(1+Math.random()*4.5),dg165SY()+1.0+Math.random()*.4,J.z+(Math.random()-.5)*.6),0xffa040,2,1,1.2,.35);
    const sp=S.spots.find(q=>q.jet===i);if(sp)sp.i=k*2.4;
    if(live&&k>.6&&Math.abs(hv-J.q.v)<.95&&hu>S.P.R.flame[0]&&hu<S.P.R.flame[2]){if(dg165Hurt(.22,'BURNED','#ffb040')){pl.step={x:0,z:hv<J.q.v?-1:1,sp:6,t:.18}}}})}
// the plate and the gate: standing on the plate lifts the portcullis; it drops again when the time runs out
function dg165SGate(S,dt,now,hu,hv){const P=S.P,G=P.gate,F0=dg165SY();let g=DG165S.gate;
  if(DG165Q.s.cp>=3){if(!g||!g.open){DG165S.gate={open:1,t:0,y:1,perm:1};dg165SDoors()}}
  else{const onP=Math.hypot(hu-P.plate[0],hv-P.plate[1])<.95;
    if(onP&&!(g&&g.open)){DG165S.gate=g={open:1,t:DG165SP.gateT,y:g?g.y:0};dg165SDoors();dg165Snd('slam',.5,1.6);dg165Snd('grind',.8,1.1);say('⚙ The plate sinks under your feet. Far down the hall, chains rattle: the portcullis is rising!');S.plate.position.y=F0-.05;dg165Co('gate',1)}
    if(g&&g.open&&!g.perm){g.t-=dt;if(Math.floor(g.t)!==Math.floor(g.t+dt)&&g.t>0)dg165Snd('chime',.18,g.t<5?1.6:1.1);
      if(g.t<=0){g.open=0;S.plate.position.y=F0;dg165Snd('slam',1,.8);shake(.15);
        // anyone under the gate is pushed back to the near side
        if(Math.abs(hv-G.v)<.9&&hu>G.u0&&hu<G.u1){const [x,z]=dg165SW(hu,G.v-1.2);pl.position.x=x;pl.position.z=z}
        dg165SDoors();if(hv<G.v)say('⛓ The portcullis crashes down. Step on the plate again.')}}}
  g=DG165S.gate;const tgt=g&&g.open?1:0;if(g){g.y=(g.y||0)+(tgt-(g.y||0))*Math.min(1,dt*(tgt?2.2:14))}const y=g?g.y:0;if(S.gateM)S.gateM.position.y=F0+y*3.8}
// the chasm: a slab under you cracks, then falls; on a fallen slab you fall
function dg165SChasm(S,dt,now,hu,hv,room){const F0=dg165SY(),H=pl.position;let on=null;
  if(room=='bridge')for(const s of S.slabs)if(Math.abs(hu-s.u)<1&&Math.abs(hv-s.v)<1){on=s;break}
  for(const s of S.slabs){if(s.st==1){s.t+=dt;s.g.position.x+=(Math.random()-.5)*.03;s.g.position.z+=(Math.random()-.5)*.03;if(Math.random()<dt*14)burst(V(s.g.position.x+(Math.random()-.5)*1.8,F0-.3,s.g.position.z+(Math.random()-.5)*1.8),0x5a5650,1,.4,.2,.6);
      if(s.t>=DG165SP.slabT){s.st=2;s.t=0;s.tiles.forEach(k=>CBLK.add(k));dg165Snd('crumble',.8,.9);dg165Snd('thud',.4,.7)}}
    else if(s.st==2){s.t+=dt;s.g.position.y=F0-s.t*s.t*9;s.g.rotation.x+=dt*.6;if(s.t>2.2){s.st=3;s.g.visible=false}}}
  if(on&&on.st==0&&!DG165S.fall){on.st=1;on.t=0;try{svSnd('crack',.5,.8+Math.random()*.3)}catch(_){}}
  // standing on a slab: the hero stands on its top (the ground beneath the bridge is the chasm floor far below)
  if(room=='bridge'&&on&&on.st<2&&!DG165S.fall)H.y=F0+(on.st==1?Math.sin(now/30)*.02:0);
  else if(room=='bridge'&&!DG165S.fall&&!(typeof AWD!='undefined'&&AWD.dead))dg165SFall();
  if(DG165S.fall){const Fl=DG165S.fall;Fl.t+=dt;Fl.y-=Fl.vy*dt;Fl.vy+=dt*22;H.y=Fl.y;if(Fl.t>DG165SP.fallT&&!Fl.done){Fl.done=1;fadeTo(()=>{DG165S.fall=null;dg165SChasmReset();
      const c=dg165SSpot(3);toPos(c.x,c.z,Math.PI);hero.hp=Math.max(1,hero.hp-Math.round(heroMax()*.3));try{hud()}catch(_){}say('💀 You fell into the chasm. You claw your way back up to its edge…')})}}}
function dg165SFall(){if(DG165S.fall)return;DG165S.fall={t:0,y:pl.position.y,vy:1};dg165Snd('scream',.7,.8);dg165Fear(1);try{svSnd('whoosh',.6,.5)}catch(_){}}
function dg165SChasmReset(){const S=DG165S.S;if(!S)return;const F0=dg165SY();S.slabs.forEach(s=>{s.st=0;s.t=0;s.g.visible=true;const [x,z]=dg165SW(s.u,s.v);s.g.position.set(x,F0,z);s.g.rotation.x=0;s.tiles.forEach(k=>CBLK.delete(k))})}
// the closing walls
function dg165SCwReset(){const S=DG165S.S;DG165S.cw=null;enemies.slice().forEach(e=>{if(e.dg165cw&&!e.dead)try{removeE(e)}catch(_){}});if(S){S.cwL.visible=S.cwR.visible=false;S.statues.forEach(s=>{s.anim=null})}dg165SDoors()}
function dg165SCwStart(S){const R=svRng(Math.floor(performance.now())%9973+11);DG165S.cw={ph:'run',t:0,half:DG165SP.cwStart,sp:0,gT:0};
  S.statues.forEach(s=>{const g=[0,2,1,3][s.want];s.f=(g+1+Math.floor(R()*3))%4;s.yaw=dg165SFaceYaw(s.f);s.g.rotation.y=s.yaw;s.anim=null});S.cwL.visible=S.cwR.visible=true;
  dg165SDoors();dg165Snd('slam',1.1,.8);shake(.35);dg165Fear(.7);setTimeout(()=>{dg165Snd('grind',1,.8);dg165Snd('rumble',.8,1)},350);
  dg165Title('The Closing Walls','The doors slam shut. The walls begin to move.','Turn the four knights to face the altar','The Hidden Sanctum');
  say('⚔ The walls are closing! Turn each weeping knight (F) until it faces the altar.');dg165Co('cw',1)}
// facing 0 = +v (south), 1 = +u (east), 2 = −v (north), 3 = −u (west); the statues are N, S, W, E of the altar and want 0, 2, 1, 3
function dg165SFaceYaw(f){return [0,Math.PI/2,Math.PI,-Math.PI/2][f&3]}
function dg165SCw(S,dt,now,hu,hv,room){const C=S.P.cw,cw=DG165S.cw,F0=dg165SY();
  if(!cw){if(!DG165Q.s.cw&&room=='walls'&&hv>217.2&&!(typeof AWD!='undefined'&&AWD.dead))dg165SCwStart(S);
    if(DG165Q.s.cw&&S.cwL.visible){S.cwL.visible=S.cwR.visible=false}
    S.doorN.position.y=F0+3.9*(S.shutN?0:1);S.doorS.position.y=F0+(DG165Q.s.cw?3.9:0);return}
  // statues turning
  S.statues.forEach(s=>{if(s.anim){s.anim.t+=dt;const k=Math.min(1,s.anim.t/.6),e=k*k*(3-2*k);s.g.rotation.y=s.anim.a+(s.anim.b-s.anim.a)*e;if(k>=1){s.anim=null;s.yaw=s.g.rotation.y}}});
  const ok=S.statues.every(s=>s.f===[0,2,1,3][s.want]&&!s.anim);
  if(cw.ph=='run'){cw.t+=dt;cw.half=DG165SP.cwStart-(DG165SP.cwStart-DG165SP.cwEnd)*Math.min(1,cw.t/DG165SP.cwT);cw.gT-=dt;if(cw.gT<=0){cw.gT=1.25;dg165Snd('grind',.7,.75+Math.random()*.1)}
    dg165Fear(.2+.6*cw.t/DG165SP.cwT);if(cw.t>DG165SP.cwT*.7&&Math.random()<dt*2)dg165Snd('heart',.6,1+cw.t/DG165SP.cwT*.4);
    // the dead in the walls' niches climb out (and are crushed if they are still there when the walls pass)
    if(!cw.sk1&&cw.t>5){cw.sk1=1;dg165SCwDead(S,2)}if(!cw.sk2&&cw.t>17){cw.sk2=1;dg165SCwDead(S,2)}
    if(ok){cw.ph='done';cw.t=0;DG165Q.s.cw=1;dg165SDoors();dg165Snd('chime',.8,1);dg165Snd('choir',.8,1.1);dg165Snd('grind',.8,1.3);
      dg165Title('The Walls Fall Still','The knights look upon the altar. The walls draw back.','The way on is open','The Hidden Sanctum');say('✦ The walls grind back into the dark. The far door rises.');dg165Co('cw',2)}
    else if(cw.t>=DG165SP.cwT){cw.ph='slam';cw.t=0;dg165Snd('slam',1.2,.6);dg165Snd('rumble',1,1);shake(.8)}}
  else if(cw.ph=='slam'){cw.t+=dt;cw.half=Math.max(.4,DG165SP.cwEnd-cw.t*18);if(cw.half<=.45&&!cw.crushed){cw.crushed=1;flash('rgba(120,0,0,.85)');dg165Snd('splint',1,.6);
      if(room=='walls')dg165Hurt(9,'CRUSHED','#ff2020',true)}if(cw.t>3&&!(typeof AWD!='undefined'&&AWD.dead))dg165SCwReset()}
  else if(cw.ph=='done'){cw.t+=dt;cw.half=Math.min(DG165SP.cwStart,cw.half+dt*6);if(cw.half>=DG165SP.cwStart){DG165S.cw=null;S.cwL.visible=S.cwR.visible=false;dg165SDoors()}}
  // the walls and the hero: they push you inward
  const [xl]=dg165SW(C.mid-cw.half,0),[xr]=dg165SW(C.mid+cw.half,0);S.cwL.position.x=xl-.5;S.cwR.position.x=xr+.5;
  if(room=='walls'){const H=pl.position;if(H.x<xl+.55)H.x=xl+.55;if(H.x>xr-.55)H.x=xr-.55}
  enemies.slice().forEach(e=>{if(!e.dg165cw||e.dead)return;const x=e.m.position.x;if(x<xl+.4||x>xr-.4){burst(gY(e.m.position,1),0xc8c0a8,24,3,2,.6);try{e.c.h=0;kill(e)}catch(_){try{removeE(e)}catch(__){}}}});
  S.doorN.position.y=F0+3.9*(S.shutN?0:1);S.doorS.position.y=F0+(DG165Q.s.cw?3.9:0)}
function dg165SCwDead(S,n){const lv=dg165Lv(20),C=S.P.cw;for(let i=0;i<n;i++){const sd=i%2?1:-1,v=C.doorN+6+Math.random()*24,u=C.mid+sd*(DG165S.cw.half-1.2),[x,z]=dg165SW(u,v);
  setTimeout(()=>{try{if(!DG165S.cw||DG165S.cw.ph!='run')return;const e=spawnEnemy(i%2?'skeleton':'ghoul',x,z,lv[1],{agg:1,minion:1});if(e){e.agg=1;e.hunt=1;e.dg165cw=1;e.dg165r=1;burst(gY(V(x,0,z),1),0xc8c0a8,20,2,2,.6);dg165Snd('gasp',.6,.7)}}catch(err){console.warn('v165 cw dead',err)}},i*600)}}
function dg165STurn(i){const S=DG165S.S,s=S&&S.statues[i];if(!s||s.anim||!DG165S.cw||DG165S.cw.ph!='run')return;const a=s.g.rotation.y;s.f=(s.f+1)&3;s.anim={t:0,a,b:a+Math.PI/2};dg165Snd('grind',.6,1.4);dg165Co('turn',i,s.f)}
// scares: the gallery's passing shade, the Keeper's lid
function dg165SScares(S,dt,now,hu,hv){const sc=DG165S.scare;
  if(!sc.gal&&hv>262&&hv<284){sc.gal=1;sc.dark=now+2400;dg165Snd('wail',.9,.9);dg165Fear(1);setTimeout(()=>dg165Snd('whisper',.7,.8),900);setTimeout(()=>dg165Snd('whisper',.6,1.1),1500);
    const g=new THREE.Group(),[x0,z0]=dg165SW(86,hv+5),[x1,z1]=dg165SW(98,hv+2);g.position.set(x0,dg165SY()+1.6,z0);S.root.add(g);
    for(let i=0;i<9;i++){const s=kqSpr(i<3?0xd8fff0:0x6affd0,i<3?.9:.6+i*.12);s.material=s.material.clone();s.material.opacity=.5-i*.04;s.position.set(-i*.25,i<3?.4-i*.3:-.3-i*.12,0);g.add(s)}
    let t=0;kqFx({tick(d){t+=(d||.016);const k=Math.min(1,t/1.3);g.position.set(x0+(x1-x0)*k,dg165SY()+1.6+Math.sin(t*9)*.2,z0+(z1-z0)*k);g.children.forEach(s=>s.material.opacity*=.995);if(k>=1){S.root.remove(g);g.children.forEach(s=>s.material.dispose());return false}return true},end(){if(g.parent)S.root.remove(g)}})}
  if(!sc.tomb&&hv>291){sc.tomb=1;dg165Snd('grind',1,.7);shake(.2);let t=0;const L=S.lid,z0=L.position.z;
    kqFx({tick(d){t+=(d||.016);const k=Math.min(1,t/2.2);L.position.z=z0+k*.7;L.rotation.y=k*.25;if(k>=1){setTimeout(()=>{dg165Snd('whisper',.8,.7);say('🕯 <i>“…below… what lies below, I keep…”</i>')},600);return false}return true},end(){}})}
  if(S.water&&hv>296&&Math.random()<dt*3){const [x,z]=dg165SW(92+(Math.random()-.5)*2,318);burst(V(x,dg165SY()-.8,z),0x6affd0,1,.2,.6,1)}}
// ---------------- getting in and out ----------------
function dg165SSpot(i){const P=dg165SanPlan(),c=P.CP[Math.max(0,Math.min(P.CP.length-1,i|0))],[x,z]=dg165SW(c[0],c[1]);return {x,z,ry:c[2],name:c[3]}}
function dg165SRestart(){dg165SBuild();DG165S.fall=null;dg165SChasmReset();dg165SCwReset();if(DG165Q.s.cp<3)DG165S.gate=null;dg165SDoors();
  const c=dg165SSpot(DG165Q.s.cp);toPos(c.x,c.z,Math.PI);try{pl.rotation.y=0}catch(_){}try{if(riding)dismount(true)}catch(_){}hud()}
function dg165SEnter(){if(AF)return;try{if(riding)dismount(true)}catch(_){}const first=DG165Q.s.st<1;DG165Q.s.st=Math.max(1,DG165Q.s.st);
  fadeTo(()=>{dg165SRestart();setTimeout(()=>{dg165Title('The Hidden Sanctum','Beneath the Keeper’s grave',first?'Traps guard every hall · watch, then move':'Checkpoint · '+dg165SSpot(DG165Q.s.cp).name)},350);
    if(first)setTimeout(()=>{say('🕯 The Keeper built this place to keep the living out. Watch each trap’s rhythm before you move.');dg165Snd('drone',.8,1)},1600)});try{dg165Co('enter',0)}catch(_){}}
function dg165SLeave(){const G=dg165GravePlan().G[DG165G.K];fadeTo(()=>{toPos(G.x+Math.sin(G.ry)*2.6,G.z+Math.cos(G.ry)*2.6,G.ry)})}
function dg165SFinish(){if(DG165Q.s.st>=2&&!dg165SIn())return;DG165Q.s.st=2;dg165Snd('splash',1,.8);
  fadeTo(()=>{const N=INSL[21];insArrive(N);insMark(N);setTimeout(()=>{dg165Title('Out of the Sanctum','You swim down the flooded stair and surface in the vaults below','Onward through '+N.n);try{mSfx('victory')}catch(_){}},400);
    say('🕯 You passed through the Keeper’s Sanctum. <b>'+N.n+'</b> lies ahead.')});try{dg165Co('sout',0)}catch(_){}}
function dg165SRise(){hero.hp=heroMax();hero.mp=mpMax();try{party.forEach(c=>c.h=M(c))}catch(_){}dg165SRestart();try{say('✦ Checkpoint · '+dg165SSpot(DG165Q.s.cp).name)}catch(_){}try{ui()}catch(_){}}
{const f=down_base;down_base=function(){if(!(dg165SIn()&&DG165S.S))return f.apply(this,arguments);
  if(typeof awDie=='function'&&typeof AWD!='undefined'){if(AWD.dead)return;awDie(()=>dg165SRise())}else dg165SRise()}}
// prompts inside: the knights, the flooded stair, the stair back up
{const f=worldPrompt;worldPrompt=function(){try{if(dg165SIn()&&DG165S.S){const S=DG165S.S,[hu,hv]=dg165SL(pl.position.x,pl.position.z);
    if(DG165S.cw&&DG165S.cw.ph=='run'){let best=-1,bd=2.3;S.statues.forEach((s,i)=>{const d=Math.hypot(hu-s.u,hv-s.v);if(d<bd){bd=d;best=i}});
      if(best>=0){const s=S.statues[best],good=s.f===[0,2,1,3][s.want];return {label:(good?'✦ This knight faces the altar · F · turn it anyway':'F · Turn the weeping knight'),fn:()=>dg165STurn(best)}}}
    if(Math.hypot(hu-S.P.exit[0],hv-S.P.exit[1])<2.4)return {label:'F · Descend the flooded stair into '+INSL[21].n,fn:()=>dg165SFinish()};
    if(Math.hypot(hu-80,hv-10.4)<2.4)return {label:'F · Climb back up to the graveyard ('+INSL[20].n+')',fn:()=>dg165SLeave()}}}catch(e){if(!DG165S.err++)console.warn('v165 sanctum prompt',e)}return f.apply(this,arguments)}}
// ---------------- the rules while inside ----------------
SP152.R.sanctum={park:1,noMount:'🕯 No mount down here: the halls are too narrow.',noRecall:'🕯 The Keeper’s wards hold you. Go on, or climb back up the stair in the first hall.',
  onLoad(){DG165Q.s.st=Math.max(1,DG165Q.s.st);setTimeout(()=>{try{dg165SRestart()}catch(e){console.warn('v165 sanctum load',e)}},0)}};
// ---------------- the HUD: the hall, the timers ----------------
(function(){const st=document.createElement('style');st.textContent=`
#dg165sh{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:6;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:4px;color:#dfe8e2;font:600 12px system-ui,sans-serif;text-shadow:0 1px 2px #000}
#dg165sh.hide{display:none}#dg165sh .nm{font:600 13px 'IM Fell English SC',Cinzel,Georgia,serif;letter-spacing:.08em;color:#bfe8d6;padding:3px 12px;border-radius:12px;background:rgba(6,10,9,.6);border:1px solid rgba(140,220,190,.25)}
#dg165sh .tm{display:none;align-items:center;gap:8px;padding:4px 10px;border-radius:10px;background:rgba(20,6,6,.7);border:1px solid rgba(255,120,90,.35)}#dg165sh .tm.on{display:flex}
#dg165sh .tm i{display:block;width:180px;height:7px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden}#dg165sh .tm i b{display:block;height:100%;background:linear-gradient(90deg,#ff3a20,#ffb040)}
#dg165sh .tm.hot{animation:dg165p .5s infinite alternate}@keyframes dg165p{to{border-color:#ff5030;box-shadow:0 0 14px rgba(255,60,30,.6)}}`;document.head.appendChild(st);
  const d=document.createElement('div');d.id='dg165sh';d.className='hide';d.innerHTML='<div class="nm"></div><div class="tm"><span class="tx"></span><i><b></b></i></div>';document.body.appendChild(d)})();
var DG165SN={entry:'The Stair Hall',pend:'The Hall of Pendulums',spike:'The Spike Hall',plate:'The Antechamber',flame:'The Fire Walk',ledge:'The Chasm',bridge:'The Chasm',pit:'The Chasm',chasm:'The Chasm',walls:'The Closing Walls',gal:'The Ossuary Gallery',tomb:'The Keeper’s Tomb'};
function dg165SHud(){const el=$('dg165sh');if(!el)return;const on=dg165SIn()&&!!DG165S.S&&!(typeof uiOpen=='function'&&uiOpen());el.classList.toggle('hide',!on);if(!on)return;
  const [hu,hv]=dg165SL(pl.position.x,pl.position.z),room=dg165SanFloor(hu,hv);el.querySelector('.nm').textContent='🕯 '+(DG165SN[room]||'The Hidden Sanctum');
  const tm=el.querySelector('.tm'),g=DG165S.gate,cw=DG165S.cw;let txt=null,k=0;
  if(cw&&cw.ph=='run'){const left=Math.max(0,DG165SP.cwT-cw.t);txt='The walls close in · '+left.toFixed(0)+' s';k=left/DG165SP.cwT}
  else if(g&&g.open&&!g.perm&&g.t>0){txt='⛓ The gate falls in '+g.t.toFixed(1)+' s';k=g.t/DG165SP.gateT}
  tm.classList.toggle('on',!!txt);tm.classList.toggle('hot',!!txt&&k<.3);if(txt){tm.querySelector('.tx').textContent=txt;tm.querySelector('b').style.width=(k*100).toFixed(1)+'%'}}
// ---------------- the tracker ----------------
SP152.trk.sanctum=I=>{if(I.sp!=='sanctum')return null;const c=DG165Q.s.cp,P=dg165SanPlan(),[hu,hv]=dg165SL(pl.position.x,pl.position.z),room=dg165SanFloor(hu,hv);
  const tip={pend:'Time the blades',spike:'Cross in the gaps between the spikes',plate:'Step on the plate, then run',flame:'Through the fire before the gate falls',ledge:'Keep moving: the slabs crumble',bridge:'Keep moving: the slabs crumble',walls:DG165Q.s.cw?'The way on is open':'Turn the knights to face the altar',gal:'Onward, into the dark',tomb:'Descend the flooded stair'}[room]||'Find the way down';
  return {name:'The Hidden Sanctum',lines:[[tip],['Checkpoint',P.CP[c][3]],['Reach the Drowned Crypts',null,1]]}};
// ---------------- the atmosphere: a crypt lit only by its own fires ----------------
sp152Theme('sanctum',{nm:'The Hidden Sanctum',sub:'Beneath the Keeper’s grave',a:{fog:.06,fc:0x060a09,fcA:.96,sun:.12,hemi:.36,env:'dark',ex:1.0,sat:.9,vig:1.85,sky:0,pt:'mote',pc:0x9affd0,po:.3}});
// placeholder for the co-op sender (3318 replaces it)
function dg165Co(){}
