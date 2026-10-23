// ================= v135: the ability preview no longer moves the hero in the world =================
// The preview (2240) lends the real hero model `pl` to its stage, and the stage uses the hero's own world coordinates. The main
// loop kept running meanwhile and read pl.position every frame, so a dash, leap or blink on the stage moved the camera, made the
// companions run after it, pulled monsters and could carry the hero through the world. Now each main-loop frame sees the hero at
// the spot it stood when the preview opened (ABX.w), and the stage gets its own position back afterwards.
var ABX135={p:null,r:0};
{const f=loop;loop=function(now){if(!(typeof ABX!='undefined'&&ABX.on&&!ABX.ctx&&ABX.w))return f.apply(this,arguments);
  const S=ABX135.p||(ABX135.p=new THREE.Vector3());S.copy(pl.position);ABX135.r=pl.rotation.y;
  pl.position.copy(ABX.w.pos);pl.rotation.y=ABX.w.ry;
  try{return f.apply(this,arguments)}finally{if(ABX.on&&ABX.w){pl.position.copy(S);pl.rotation.y=ABX135.r}}}}
