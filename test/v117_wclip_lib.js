// v116 weapon clipping meter (injected by test/v117_wclip.py).
// The posed hero's body + outfit + armour vertices (CPU-skinned, arm/hand vertices left out) give a "shell": for every 2.5 cm
// height band and 24 sectors round the body axis, the furthest reach of the shell. A weapon vertex whose distance from the axis is
// less than the shell's reach in its band and sector (minus a small margin) is inside the robe / armour. Points within GRIP_R of
// the holding hand are ignored (the paw closes round the grip).
window.WCLIP={
  SB:.025,NS:24,GRIP_R:.1,MARGIN:.012,
  armBone(n){return /^a[LR][0-2]$/.test(n)||/^f[LR]/.test(n)||/^(fi|th|pw|cl)/.test(n)},
  shell(H){H.updateMatrixWorld(true);const V=THREE.Vector3,sp=H.bones.spine||H.bones.hips||H.bones.root,ax=sp.getWorldPosition(new V()),S=new Map(),v=new V();let y0=1e9,y1=-1e9;
    H.traverse(o=>{if(!o.isSkinnedMesh||!o.visible)return;const P=o.geometry.attributes.position,SI=o.geometry.attributes.skinIndex,SW=o.geometry.attributes.skinWeight,bn=o.skeleton.bones;
      for(let i=0;i<P.count;i++){let best=0,bw=-1;const ws=[SW.getX(i),SW.getY(i),SW.getZ(i),SW.getW(i)],is=[SI.getX(i),SI.getY(i),SI.getZ(i),SI.getW(i)];for(let j=0;j<4;j++){if(ws[j]>bw){bw=ws[j];best=is[j]}}const b=bn[best];
        const name=b&&(b.userData.kqn||b.name||'');if(WCLIP.armBone(name)||WCLIP.armBone(WCLIP.boneKey(H,b)))continue;
        v.fromBufferAttribute(P,i);o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld);
        const dx=v.x-ax.x,dz=v.z-ax.z,r=Math.hypot(dx,dz),s=Math.floor(((Math.atan2(dz,dx)+Math.PI)/(2*Math.PI))*WCLIP.NS)%WCLIP.NS,bnd=Math.floor(v.y/WCLIP.SB),k=bnd*64+s;
        if(!(S.get(k)>=r))S.set(k,r);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y)}});
    return {S,ax,y0,y1}},
  boneKey(H,b){if(!H._bk){H._bk=new Map();for(const n in H.bones)H._bk.set(H.bones[n],n)}return H._bk.get(b)||''},
  reach(sh,x,y,z){const dx=x-sh.ax.x,dz=z-sh.ax.z,s=Math.floor(((Math.atan2(dz,dx)+Math.PI)/(2*Math.PI))*WCLIP.NS)%WCLIP.NS,b=Math.floor(y/WCLIP.SB);
    // the band's sector and its two neighbours (a thin robe edge between samples still counts)
    let R=-1;for(const ds of [-1,0,1]){const r=sh.S.get(b*64+((s+ds+WCLIP.NS)%WCLIP.NS));if(r>R)R=r}return R},
  // returns {n: weapon points checked, inside: points inside the shell, depth: deepest (m), pts:[sample of inside points]}
  measure(H){const sh=WCLIP.shell(H),V=THREE.Vector3,out={n:0,inside:0,depth:0,pts:[]},v=new V();
    (H.gearG||[]).forEach(W=>{if(!W||!W.userData||!W.userData.wt)return;const hb=W.parent,hp=hb?hb.getWorldPosition(new V()):null;
      W.traverse(o=>{if(!o.isMesh||!o.visible||!o.geometry)return;const P=o.geometry.attributes.position;if(!P)return;
        for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);if(hp&&v.distanceTo(hp)<WCLIP.GRIP_R)continue;out.n++;
          if(v.y<sh.y0||v.y>sh.y1)continue;const R=WCLIP.reach(sh,v.x,v.y,v.z);if(R<0)continue;const r=Math.hypot(v.x-sh.ax.x,v.z-sh.ax.z),d=R-WCLIP.MARGIN-r;
          if(d>0){out.inside++;if(d>out.depth)out.depth=d;if(out.pts.length<400)out.pts.push([v.x,v.y,v.z])}}})});
    out.depth=+out.depth.toFixed(3);return out}};
