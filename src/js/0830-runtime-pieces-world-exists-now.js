// ================= runtime pieces (the world exists by now) =================
// Portal Court: flagstones, a stone curb, and rough stone portal frames
{const C=PCOURT;
  try{
    const old=scene.children.find(o=>o.isMesh&&o.geometry&&o.geometry.type=='RingGeometry'&&o.geometry.parameters&&Math.abs(o.geometry.parameters.outerRadius-17.5)<.01);
    if(old)old.material.color.setHex(0x34313a);
    const y0=GH(C[0],C[1]);let k=twKit(151);
    for(let ring=0;ring<7;ring++){const r0=3.2+ring*2.0,n=Math.round(r0*2.2);for(let i=0;i<n;i++){const a=(i+(ring%2)*.5)/n*Math.PI*2,r=r0+.95;
      k.p('c',k.R()<.25?0x4e4a54:k.R()<.3?0x6e6a72:0x5c5862,'box',Math.cos(a)*r,.05,Math.sin(a)*r,1.8,.1+k.R()*.04,r*Math.PI*2/n*.94,0,-a,0,.12)}}
    for(let i=0;i<44;i++){const a=i/44*Math.PI*2;k.p('c',k.R()<.3?TWC.stoneD:TWC.stone,'box',Math.cos(a)*17.65,.2,Math.sin(a)*17.65,.55,.4,2.55,0,-a,0,.18)}
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('c',TWC.stoneD,'box',Math.cos(a)*1.75,.08,Math.sin(a)*1.75,.6,.16,1.4,0,-a,0,.1)}
    const fl=twGroup(k,'COURT');fl.position.set(C[0],y0,C[1]);fl.children.forEach(m=>m.castShadow=false);scene.add(fl);
    // the rune stone on the plinth
    const rs=scene.children.find(o=>o.isGroup&&Math.abs(o.position.x-C[0])<.01&&Math.abs(o.position.z-C[1])<.01&&o.children.length==2);
    if(rs){const cyl=rs.children.find(m=>m.geometry===G_CYL);if(cyl){rs.remove(cyl);let k2=null;if(!twHas('RUNEP')){k2=twKit(153);twStoneRing(k2,TWC.stoneD,0,0,1.45,0,.62,.36);
        for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k2.p('c',0x3a3640,'box',Math.cos(a)*1.0,.7,Math.sin(a)*1.0,.5,.16,.9,0,-a,0,.1)}}
      twBake(k2?k2.P:[],'RUNEP',true).forEach(m=>rs.add(m))}}
    // portal frames: two stacked-stone pillars, a heavy lintel, a stepped base
    const frame=(w,h,key)=>{let k3=null;if(!twHas(key)){k3=twKit(155+w*10);
        [-1,1].forEach(s=>{for(let y=0,i=0;y<h;i++){const bh=.36+k3.R()*.12;k3.p('c',k3.R()<.3?TWC.stoneD:0x6a6672,'box',s*w/2+(k3.R()-.5)*.05,y+bh/2,0,.5+(i%2)*.08,bh-.03,.5+((i+1)%2)*.08,0,(k3.R()-.5)*.2,0,.16);y+=bh}});
        twStones(k3,0x4a4652,-w/2-.4,0,w/2+.4,0,h,h+.42,.62,.7);k3.p('c',0x3a3640,'tri',0,h+.42,0,1.2,.32,.5,0,0,0,.08);
        k3.p('c',0x5a5662,'box',0,.1,0,w+.9,.2,1.4,0,0,0,.08);k3.p('c',0x4a4652,'box',0,.25,0,w+.4,.12,1.0,0,0,0,.06);twPortalRods(k3,w,h)}
      return twGroup(k3,key)};
    PORT.forEach(P=>{const keep=new Set([P.disc,P.sw,P.ch]);P.g.children.slice().forEach(c=>{if(keep.has(c)||c.geometry===G_PLN||(c.material&&c.material.isMeshBasicMaterial))return;if(c.isMesh)P.g.remove(c)});
      const f=frame(2.5,3.15,'PFRM');P.g.add(f);P.g.children.forEach(c=>{if(c.geometry===G_OCT)c.position.y=3.4})});
    RPORT.forEach(R=>{if(R.g.userData.lpn)return;R.g.children.slice().forEach(c=>{if(c===R.disc||c.geometry===G_PLN||(c.material&&c.material.isMeshBasicMaterial))return;if(c.isMesh)R.g.remove(c)});R.g.add(frame(1.8,2.35,'RFRM'))});
  }catch(e){console.warn('town court',e)}}
// paving: irregular flagstones over the town's paved tiles, and lashing rails along the palisade
{try{const T=TOWNS[0],R=dkRng(77),L=[],Wl=[];
    for(let y=T.cy-34;y<=T.cy+(T.sz||TS)+13;y++)for(let x=Math.max(1,T.cx-TWN100_WX-4);x<=T.cx+TWN100_WX+4;x++){const t=MAP[y]&&MAP[y][x];if(t=='P')L.push([x,y]);else if(t=='W')Wl.push([x,y])}
    if(L.length){const sg=(()=>{const g=new THREE.CircleGeometry(.5,6);g.rotateX(-Math.PI/2);const pa=g.attributes.position;for(let i=1;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),h=twH(Math.round(x*50),0,Math.round(z*50),5);pa.setX(i,x*(.86+h*.26));pa.setZ(i,z*(.86+h*.26))}
        const n=g.toNonIndexed();n.computeVertexNormals();n.userData.lps=1;return n})();
      const N=L.length*2,m=new THREE.InstancedMesh(sg,new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),N),d=new THREE.Object3D(),c=new THREE.Color();m.material.userData.lps=1;
      let i=0;L.forEach(([x,y])=>{const two=R()<.4;for(let j=0;j<(two?2:1);j++){const ox=two?(j?.24:-.24):(R()-.5)*.12,oz=(R()-.5)*(two?.4:.12);d.position.set(x+ox,GH(x+ox,y+oz)+.025+j*.004,y+oz);d.rotation.set((R()-.5)*.05,R()*6.28,(R()-.5)*.05);
        const s=two?.55+R()*.18:.86+R()*.3;d.scale.set(s,1,s*(.8+R()*.3));d.updateMatrix();m.setMatrixAt(i,d.matrix);
        const v=.62+R()*.32,w=R();c.setRGB(.44*v*(1+w*.08),.42*v,.41*v*(1.06-w*.08));m.setColorAt(i,c);i++}});
      m.count=i;m.receiveShadow=true;m.castShadow=false;m.userData.lpsSkip=1;T.g.parent.add(m);T.pave=m}
    if(Wl.length){const set=new Set(Wl.map(([x,y])=>y*W+x)),bars=[];
      Wl.forEach(([x,y])=>{[[1,0],[0,1]].forEach(([dx,dy])=>{if(!set.has((y+dy)*W+x+dx))return;const mx=x+dx/2,my=y+dy/2,vx=T.cx-mx,vy=T.cy-my,l=Math.hypot(vx,vy)||1;
        [1.0,2.05].forEach(h=>bars.push([mx+vx/l*.42,h+GH(mx,my),my+vy/l*.42,dx?0:Math.PI/2]))})});
      const bg=twGeo().box,m=new THREE.InstancedMesh(bg,new THREE.MeshStandardMaterial({color:0x3a2a1e,roughness:.95,flatShading:true}),bars.length),d=new THREE.Object3D();m.material.userData.lps=1;
      bars.forEach((q,i)=>{d.position.set(q[0],q[1],q[2]);d.rotation.set(0,q[3],(R()-.5)*.06);d.scale.set(1.08,.12,.1);d.updateMatrix();m.setMatrixAt(i,d.matrix)});
      m.castShadow=true;m.receiveShadow=true;m.userData.lpsSkip=1;scene.add(m);KDRAIL=m}
  }catch(e){console.warn('town paving',e)}}

