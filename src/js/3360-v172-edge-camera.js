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
// and once more right before the main view is drawn: anything that moved the camera after the main loop's update (an arrival
// snap, a shake) is held inside the map too (seen on a fast machine: the camera left in the rim's rock past the edge)
{const f=POST.render;POST.render=function(){try{if(CAM172.on&&!(typeof IC151!='undefined'&&IC151.on)&&typeof pl!='undefined'&&pl){const x=cam.position.x,y=cam.position.y,z=cam.position.z;
    cam172Hold(pl.position,cam.position);if(cam.position.x!==x||cam.position.y!==y||cam.position.z!==z){cam.lookAt(look);cam.updateMatrixWorld();FADE.cam.value.copy(cam.position)}}}catch(_){}
  return f.apply(this,arguments)}}
