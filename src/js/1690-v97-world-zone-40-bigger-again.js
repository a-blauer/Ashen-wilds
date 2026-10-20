// ================= v97 world: every zone 40% bigger again =================
// Layout: w0_world.js (PMS=1.82: zones 473x491, 20-24 road waypoints, 6-7 branches, 6 road clearings, 8 camps);
// grid W=1559,H=1010 in build/pN_world.py; split ground texture and the dungeon offset in build/pN_world2.py;
// 130 roaming groups in zz7_v71.js (ROST_G); old-layout saves (wl 97) in zzN_world.js. This file:
//  1. chunkVis only looks at the chunks near you (there are ~1,100 visibility chunks now, was ~620)
//  2. the realm island (RX/RZ 1000) now sits just south of The Dirge's edge: it is hidden while you are in the world,
//     and the zone scenery near it is hidden while you are in the realm

// ---- 1. chunk visibility from a coarse grid ----
// Same rule as the base chunkVis (draw within FARR and in view, small props within NEARR, shadows within 34), but each
// frame only the chunks in grid cells around the hero plus the ones that are currently shown are tested.
var CVG={n:-1,B:128,g:new Map(),live:new Set(),f:0};
function cvgBuild(){const B=CVG.B;CVG.g=new Map();CVG.live=new Set();CVG.n=CHL.length;
  CHL.forEach(c=>{const k=Math.floor((c.box.min.z+c.box.max.z)/2/B)*1000+Math.floor((c.box.min.x+c.box.max.x)/2/B);let L=CVG.g.get(k);if(!L)CVG.g.set(k,L=[]);L.push(c);if(c.on||c.non)CVG.live.add(c)})}
// v106: only the chunks touching the zone instance you are in (or, outside the zones, the ones west of them: Duskhold and
// the Portal Road) draw; the other instances sit across the void and are separate maps now
var CVA={k:null,r:null};
function cvKey(){const I=curIns();return I?I.g:-1}
function cvOK(c,k){if(c.cvk===k)return c.cvok;if(CVA.k!==k){CVA.k=k;const I=k>=0?INSL[k]:null;CVA.r=I?[I.x0-3,I.y0-3,I.x0+I.w+3,I.y0+I.h+3]:[-1e5,-1e5,PM_X0-3,1e5]}
  const r=CVA.r,b=c.box;c.cvk=k;c.cvok=b.max.x>=r[0]&&b.min.x<=r[2]&&b.max.z>=r[1]&&b.min.z<=r[3];return c.cvok}
function chunkVis(){
  if(CVG.n!==CHL.length)cvgBuild();
  cam.updateMatrixWorld();PM.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);FR.setFromProjectionMatrix(PM);
  const p=pl.position,B=CVG.B,R=Math.max(FARR,NEARR)+48,ak=cvKey(),test=c=>{const ok=cvOK(c,ak),d=c.box.distanceToPoint(p),inF=d<20||FR.intersectsBox(c.box),on=ok&&d<FARR&&inF,non=ok&&d<NEARR&&(d<12||inF),cs=d<34;
    if(on!==c.on||(on&&cs!==c.cs)){c.on=on;c.cs=cs;c.ms.forEach(m=>{m.visible=on;m.castShadow=on&&cs&&m.userData.cast})}
    if(non!==c.non){c.non=non;c.ns.forEach(m=>{m.visible=non;m.castShadow=false})}
    if(c.on||c.non)CVG.live.add(c);else CVG.live.delete(c)};
  const F=++CVG.f;
  for(let gz=Math.floor((p.z-R)/B);gz<=Math.floor((p.z+R)/B);gz++)for(let gx=Math.floor((p.x-R)/B);gx<=Math.floor((p.x+R)/B);gx++){const L=CVG.g.get(gz*1000+gx);if(L)for(const c of L){c.cvf=F;test(c)}}
  for(const c of CVG.live)if(c.cvf!==F)test(c);
}

// ---- 2. realm island vs. the zones ----
// things that switch themselves back on (or appear) while in the realm are caught every half second

