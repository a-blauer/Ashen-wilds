// =====================================================================================================
function lnUncover(S){
  if(!S||S.broken||S.unc||!S.g)return;S.unc=1;
  const p=V(S.x,0,S.z),g=S.g,b=S.body;sfx('blunt',.8);burst(gY(p,1),0xffb050,18,1.6,2,.5);dn(p,'Uncovering...','#fde68a',-20,700);
  const gl=new THREE.Mesh(new THREE.SphereGeometry(1.25,8,6),new THREE.MeshBasicMaterial({color:0xffb050,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));gl.position.y=.95;g.add(gl);
  tw(650,k=>{if(!S.g)return;g.rotation.z=Math.sin(k*40)*.05*(1-k*.3);g.rotation.x=Math.cos(k*33)*.04;g.scale.setScalar(1+k*.08);gl.material.opacity=k*.45;
    if(Math.random()<.35)burst(gY(p,.4+Math.random()),0x8a8478,3,1.2,1.5,.35)},
    ()=>{try{g.remove(gl)}catch(_){}if(S.g){S.g.rotation.set(0,0,0);S.g.scale.setScalar(1)}S.unc=0;breakBoulder(S)})}
function lnSecretPrompt(){if(typeof SECRETS=='undefined')return null;const P=pl.position;let best=null,bd=2.8;
  for(const S of SECRETS)if(S.k=='boulder'&&!S.broken&&S.g){const d=Math.hypot(P.x-S.x,P.z-S.z);if(d<bd){bd=d;best=S}}
  if(!best)return null;const S=best;
  return S.unc?{label:'🗝️ Uncovering the secret...',fn:()=>{}}:{label:'F · Uncover the secret (cracked boulder)',fn:()=>lnUncover(S)}}

// =====================================================================================================
// 2. treasure maps
