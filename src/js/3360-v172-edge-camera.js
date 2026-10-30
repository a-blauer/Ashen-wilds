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
var CAM172={on:true,vt:-6,r1:1.2,r2:8,min:2,minAb:1.2,step:.35,ab:.35,why:'',st:{d:0,cut:0}};   // minAb: a house can come closer (over the shoulder) than the map's edge
const CAM172A=[0,1,2,3,4,5,6,7].map(i=>[Math.sin(i*Math.PI/4),Math.cos(i*Math.PI/4)]);
function cam172Void(x,z,r){if(GH(x,z)<CAM172.vt)return true;for(const [a,b] of CAM172A)if(GH(x+a*r,z+b*r)<CAM172.vt)return true;return false}
// v176 (owner: "with the buildings in the Abeksi city just have them behave like the edge of the map and have the camera get
// closer to the character"): inside an Abeksi building (its box from the plan, as 3152 builds it, roof included) counts as out of
// the map too, so the camera slides in instead of going behind a house
function cam172Ab(x,y,z,I){if(!I||I.g!==30||typeof ab152Plan!='function')return false;const P=ab152Plan(),u=x-I.x0+.5,v=z-I.y0+.5,m=CAM172.ab;
  for(const B of P.B){if(u>B[0]-m&&u<B[2]+m&&v>B[1]-m&&v<B[3]+m){const s=B[4],st=B[5],H=st=='tower'?2.3*s+.8:st=='hall'?3.4:st=='barn'?3:st=='ruin'?3:2.3*s;if(y<1.6+H+1.2)return true}}
  return false}
function cam172Ok(x,y,z,I){
  if(I&&(x<I.x0+.5||z<I.y0+.5||x>I.x0+I.w-.5||z>I.y0+I.h-.5))return false;
  CAM172.why='';if(cam172Ab(x,y,z,I)){CAM172.why='ab';return false}
  if(cam172Void(x,z,CAM172.r1))return false;
  if(y<GH(x,z)-.05){for(const r of [3,5.5,CAM172.r2])if(cam172Void(x,z,r))return false}
  return true}
// how far back the camera may go along its line from the hero's chest (P = the hero's feet), at most d
function cam172Reach(P,yaw,pitch,d){if(!CAM172.on)return d;let I=null;try{const k=cvKey();I=k>=0?INSL[k]:null}catch(_){}
  const ox=Math.sin(yaw)*Math.cos(pitch),oy=Math.sin(pitch),oz=Math.cos(yaw)*Math.cos(pitch),y0=P.y+1.1;
  for(let s=1;s<=d+.6;s+=CAM172.step){if(!cam172Ok(P.x+ox*s,y0+oy*s,P.z+oz*s,I)){const r=Math.min(d,Math.max(CAM172.why=='ab'?CAM172.minAb:CAM172.min,s-.7));CAM172.st.d=r;CAM172.st.cut++;return r}}
  CAM172.st.d=d;return d}
// the camera itself trails its target (0104 lerps it there over a few frames): while it catches up (turning toward an edge, zooming
// out) it must not pass the edge either, so its actual spot is held inside the map too (no lag here)
const CAM172V=new THREE.Vector3();
function cam172Hold(P,c){if(!CAM172.on)return;let I=null;try{const k=cvKey();I=k>=0?INSL[k]:null}catch(_){}
  const y0=P.y+1.1,d=CAM172V.set(c.x-P.x,c.y-y0,c.z-P.z),L=d.length();if(L<CAM172.minAb)return;d.multiplyScalar(1/L);
  for(let s=1;s<=L;s+=CAM172.step)if(!cam172Ok(P.x+d.x*s,y0+d.y*s,P.z+d.z*s,I)){const r=Math.min(L,Math.max(CAM172.why=='ab'?CAM172.minAb:CAM172.min,s-.7));c.set(P.x+d.x*r,y0+d.y*r,P.z+d.z*r);CAM172.st.hold=(CAM172.st.hold||0)+1;return}}
// and once more right before the main view is drawn: anything that moved the camera after the main loop's update (an arrival
// snap, a shake) is held inside the map too (seen on a fast machine: the camera left in the rim's rock past the edge)
{const f=POST.render;POST.render=function(){try{if(CAM172.on&&!(typeof IC151!='undefined'&&IC151.on)&&typeof pl!='undefined'&&pl){const x=cam.position.x,y=cam.position.y,z=cam.position.z;
    cam172Hold(pl.position,cam.position);if(cam.position.x!==x||cam.position.y!==y||cam.position.z!==z){cam.lookAt(look);cam.updateMatrixWorld();FADE.cam.value.copy(cam.position)}}}catch(_){}
  return f.apply(this,arguments)}}
