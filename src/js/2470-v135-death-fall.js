// ================= v135: monsters fall over and fade out when they die =================
// kill_base (0120) topples the body onto its side over 0.64 s (death135Ease: accelerates like a fall), lifted by death135Lift so
// it lies on the ground rather than half under it, leaves it lying 1.5 s, then death135Fade fades it out over 0.9 s and removes it.
// The fade works on copies of the model's materials (enemy kits share theirs), freed again once the body is gone.
function death135Ease(k){return k<1?k*k*(1.6-.6*k):1}
function death135Lift(m){try{const b=m.userData.d135L;if(b!=null)return b;const B=new THREE.Box3().setFromObject(m.b||m),s=B.getSize(new THREE.Vector3()),sc=m.scale.x||1;
  const L=Math.min(s.x,s.y)/sc*.32;m.userData.d135L=L;return L}catch(_){return 0}}
function death135Fade(g,done){const L=[];
  try{g.traverse(o=>{if(!(o.isMesh||o.isSkinnedMesh)||!o.material||o.userData.d135)return;o.userData.d135=1;o.castShadow=false;
    const M=Array.isArray(o.material)?o.material:[o.material],C=M.map(m=>{const c=m.clone();c.userData=Object.assign({},m.userData,{d135:1});c.transparent=true;c.userData.o0=m.opacity==null?1:m.opacity;L.push(c);return c});
    o.material=Array.isArray(o.material)?C:C[0]})}catch(e){console.warn('v135 death fade',e)}
  const fin=()=>{try{done&&done()}finally{L.forEach(c=>{try{c.dispose()}catch(_){}})}};
  if(!L.length){fin();return}
  tw(900,k=>{const a=1-k*k;for(const c of L)c.opacity=c.userData.o0*a},fin)}
