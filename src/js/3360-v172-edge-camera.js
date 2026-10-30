// ================= v172: the camera stays inside the map at its outer edge =================
// Owner (Oct 29 2026): "when my camera goes past the edge of the map I can see literally everything" — v169-v171 tried to change
// what is seen out there (glass, black, then rock); none stopped the camera going there. Those are rolled back (the v164 speckled
// window is back, owner: "I'd rather do the old large speckled window"). Now, like most third-person games, the camera slides in
// toward the hero when backing it up would take it out of the map, and glides back out when there is room (camDD's own smoothing in
// 0104: fast in, slow out). Only the map's outer edge does this; caves, walls inside the map and houses work as before (v157: the
// camera keeps its distance, the window shows the hero).
// "Out of the map" for a camera spot (cam172Ok):
//   * past the instance's rectangle;
//   * over the void (ground below CAM172.vt) or within CAM172.r1 of it;
//   * inside the rock (below the ground there) within CAM172.r2 of the void: the rim's wall at the edge of the map. Deeper inside
//     the map (a cave's wall) the camera may stand in the rock as before.
// Duskhold (no instance) uses the same rule: the island's edge is void too.
var CAM172={on:true,vt:-6,r1:1.2,r2:8,min:2,step:.35,st:{d:0,cut:0}};
const CAM172A=[0,1,2,3,4,5,6,7].map(i=>[Math.sin(i*Math.PI/4),Math.cos(i*Math.PI/4)]);
function cam172Void(x,z,r){if(GH(x,z)<CAM172.vt)return true;for(const [a,b] of CAM172A)if(GH(x+a*r,z+b*r)<CAM172.vt)return true;return false}
function cam172Ok(x,y,z,I){
  if(I&&(x<I.x0+.5||z<I.y0+.5||x>I.x0+I.w-.5||z>I.y0+I.h-.5))return false;
  if(cam172Void(x,z,CAM172.r1))return false;
  if(y<GH(x,z)-.05){for(const r of [3,5.5,CAM172.r2])if(cam172Void(x,z,r))return false}
  return true}
// how far back the camera may go along its line from the hero's chest (P = the hero's feet), at most d
function cam172Reach(P,yaw,pitch,d){if(!CAM172.on)return d;let I=null;try{const k=cvKey();I=k>=0?INSL[k]:null}catch(_){}
  const ox=Math.sin(yaw)*Math.cos(pitch),oy=Math.sin(pitch),oz=Math.cos(yaw)*Math.cos(pitch),y0=P.y+1.1;
  for(let s=1;s<=d+.6;s+=CAM172.step){if(!cam172Ok(P.x+ox*s,y0+oy*s,P.z+oz*s,I)){const r=Math.max(CAM172.min,Math.min(d,s-.7));CAM172.st.d=r;CAM172.st.cut++;return r}}
  CAM172.st.d=d;return d}
