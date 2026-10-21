// ================= v113: after every zone file has registered its creatures =================
// the camps of field instances II and III take their instance's camp themes; the new names show in the animation viewer
try{n3Camps()}catch(e){console.error('v113 camps',e)}
Object.keys(N3.def).forEach(k=>{const D=N3.def[k];if(D.rig&&D.rig.spit)SPITC[D.rig.name]=D.rig.spit});
