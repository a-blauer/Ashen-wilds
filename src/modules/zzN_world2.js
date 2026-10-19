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
chunkVis=function(){
  if(CVG.n!==CHL.length)cvgBuild();
  cam.updateMatrixWorld();PM.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);FR.setFromProjectionMatrix(PM);
  const p=pl.position,B=CVG.B,R=Math.max(FARR,NEARR)+48,test=c=>{const d=c.box.distanceToPoint(p),inF=d<20||FR.intersectsBox(c.box),on=!inRealm&&d<FARR&&inF,non=!inRealm&&d<NEARR&&(d<12||inF),cs=d<34;
    if(on!==c.on||(on&&cs!==c.cs)){c.on=on;c.cs=cs;c.ms.forEach(m=>{m.visible=on;m.castShadow=on&&cs&&m.userData.cast})}
    if(non!==c.non){c.non=non;c.ns.forEach(m=>{m.visible=non;m.castShadow=false})}
    if(c.on||c.non)CVG.live.add(c);else CVG.live.delete(c)};
  const F=++CVG.f;
  if(!inRealm)for(let gz=Math.floor((p.z-R)/B);gz<=Math.floor((p.z+R)/B);gz++)for(let gx=Math.floor((p.x-R)/B);gx<=Math.floor((p.x+R)/B);gx++){const L=CVG.g.get(gz*1000+gx);if(L)for(const c of L){c.cvf=F;test(c)}}
  for(const c of CVG.live)if(c.cvf!==F)test(c);
};

// ---- 2. realm island vs. the zones ----
var RLV={on:null,hid:[],n:0};
function rlvSync(force){try{if(typeof RLG=='undefined')return;const on=!!inRealm;
  if(on===RLV.on&&!force)return;
  if(on!==RLV.on){RLV.on=on;RLG.visible=on;if(!on){RLV.hid.forEach(o=>{if(o.userData.rlvH){o.visible=true;delete o.userData.rlvH}});RLV.hid=[]}}
  if(on)for(const o of scene.children){if(!o.visible||o===RLG||o.isLight||o.isCamera)continue;const x=o.position.x,z=o.position.z;
    if(x===0&&z===0)continue;if(regionAt(Math.round(x),Math.round(z))<0)continue;
    if(Math.abs(x-RX-RN/2)>260||Math.abs(z-RZ-RN/2)>260)continue;o.visible=false;o.userData.rlvH=1;RLV.hid.push(o)}
}catch(err){console.warn('realm view',err)}}
{const f=realmEnv;realmEnv=function(on){const r=f.apply(this,arguments);rlvSync(true);return r}}
// things that switch themselves back on (or appear) while in the realm are caught every half second
{const f=atmos;atmos=function(dt,now){f.apply(this,arguments);rlvSync(inRealm&&++RLV.n%30==0)}}
rlvSync(true);
