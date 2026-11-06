// ================= v202 free the bone textures of models that left the scene =================
// Owner, Nov 6 2026 (an article on three.js lag; "Just fix the leak"). Every skinned model (monsters, folk, companions,
// mounts) has a Skeleton, and three.js r128 gives each skeleton a small float texture of its bone matrices the first time
// it is drawn. Removing the model from the scene never freed that texture, so every trip between instances left ~12
// behind in GPU memory (measured: 58 -> 165 textures over 10 round trips Kindlelight I <-> II, with ~70 skeletons in the
// scene the whole time). Every SK202.every ms, `sk202Sweep` lists the skeletons of every skinned mesh in the scene
// (hidden ones too) and frees the bone texture of any skeleton it saw last time that is no longer there.
// Safe for anything that comes back: r128 builds a fresh bone texture (and copies the bone matrices) whenever a skeleton
// without one is drawn, so a model put back in the scene, or drawn in another scene, just gets a new one.
// Local GPU housekeeping only: nothing changes in play or looks, nothing to relay in co-op.
var SK202={on:true,every:2000,t:0,reg:new Set(),freed:0,err:0};
function sk202Sweep(){
  const live=new Set();
  scene.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton)live.add(o.skeleton)});
  for(const s of SK202.reg)if(!live.has(s)){if(s.boneTexture){s.dispose();SK202.freed++}SK202.reg.delete(s)}
  for(const s of live)SK202.reg.add(s);
  return SK202.freed}
{const f=loop;loop=function(now){const r=f.apply(this,arguments);
  try{if(SK202.on){const t=performance.now();if(t-SK202.t>SK202.every){SK202.t=t;sk202Sweep()}}}
  catch(e){if(!SK202.err){SK202.err=1;console.error('sk202',e)}}
  return r}}
