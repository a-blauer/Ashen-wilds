// ================= v232 ending A: "the land breathes" (the fight-him ending; plan 'breath' on 4069's player) =================
// Owner (Nov 13 2026): "After killing him- the essence is released from him and is absorbed back into the ground- the camera pans
// to different areas throughout the game and shows life being breathed back into the land- eluding to the restoration of the
// natural balance."
//   0     the Hollow Beneath: Ythrael on his knees on the stone; the six essences pour out of him in six streams, arc over and sink
//         into the six marks of the floor; he empties, falls and fades; a last ring of light runs out over the stone
//   1–6   the six zones in the game's order (the road of each zone's first instance): a wave of that zone's essence runs over the
//         ground ahead of the camera; behind it grass and flowers stand up, motes rise, the fog thins and the colour comes back
//   7     Duskhold: the hero by the fountain in morning light, the camera lifts to the sky; the title card
// Everything is a function of t. What it shows it builds itself (a stand-in Ythrael, sprites, sprouts) and frees at the end;
// the Hollow's own dressing is only shown for shot 0 (built first if the hero has never stood there).
var EB232={T0:9.0,dz:4.4,T7:35.4,
  pal:[[0xdff5c8,0xffffff,0x9be36a],[0xffe36a,0xff9ad0,0x8fe07a],[0xcfeaff,0xffffff,0x9fe0d0],[0xffb04a,0xff6a5a,0x9fd66a],[0xe8dcff,0xffffff,0x9ad0a0],[0xff5a6a,0xffe0e0,0x8fd07a]],
  words:['The bog remembers green.','The hills, their rain.','The peak, its thaw.','The sands, their wells.','The graves, their quiet.','The court, its dawn.']};
function eb232H(i){return ic151H(i*1.37+.11)}
function eb232Merge(L){const A=[];L.forEach(g=>{const q=g.index?g.toNonIndexed():g,P=q.attributes.position.array;for(let i=0;i<P.length;i++)A.push(P[i]);g.dispose()});const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(A,3));return o}
function eb232SprMat(col,op){const m=kqSpr(col,1).material.clone();m.opacity=op==null?1:op;m.fog=false;m.depthWrite=false;return m}
// one zone's patch of new life round O: sprouts (two instanced meshes), motes and the wave's ring of lights
function eb232Patch(S,z,O,f){const g=new THREE.Group(),pal=EB232.pal[z],ess=YT232.ess[z],V=THREE.Vector3,ins=(()=>{try{const J=insAt(Math.round(O.x),Math.round(O.z));return J?J.g:null}catch(_){return null}})();
  const pts=[];for(let i=0;i<900&&pts.length<340;i++){const a=eb232H(i+z*977)*6.2832,r=2+Math.sqrt(eb232H(i*3+z*31))*46,x=O.x+Math.sin(a)*r,zz=O.z+Math.cos(a)*r;let b=false;try{b=zc214Blk(x,zz,ins)}catch(_){}if(b)continue;pts.push({x,z:zz,y:GH(x,zz),d:r,k:eb232H(i*7+z),s:.7+eb232H(i*11+z)*.9,ry:eb232H(i*13)*6.28})}
  const tuftG=(()=>{const q=[];for(let b=0;b<4;b++){const c=new THREE.ConeGeometry(.07,.5+b*.12,3);c.translate(0,.25+b*.06,0);c.rotateZ((b-1.5)*.32);c.rotateY(b*1.7);q.push(c)}return eb232Merge(q)})();
  const bloomG=(()=>{const st=new THREE.ConeGeometry(.03,.55,3);st.translate(0,.275,0);const hd=new THREE.OctahedronGeometry(.13,0);hd.scale(1,.6,1);hd.translate(0,.6,0);return eb232Merge([st,hd])})();
  const A=pts.filter(p=>p.k<.62),B=pts.filter(p=>p.k>=.62),mk=(geo,L,cols)=>{const m=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:0xffffff}),Math.max(1,L.length));m.frustumCulled=false;const c=new THREE.Color();L.forEach((p,i)=>{c.setHex(cols[(p.k*97|0)%cols.length]);c.multiplyScalar(.75+.25*p.s/1.6);m.setColorAt(i,c)});if(m.instanceColor)m.instanceColor.needsUpdate=true;g.add(m);return m};
  const tm=mk(tuftG,A,[pal[2],0x6fbf5a,0x9fd66a]),bm=mk(bloomG,B,[pal[0],pal[1],pal[0]]);
  const mm=eb232SprMat(pal[0],.9),motes=pts.filter((p,i)=>i%4===0).map(p=>{const s=new THREE.Sprite(mm);s.scale.setScalar(.22);g.add(s);return {s,p}});
  const wm=eb232SprMat(ess,.95),wave=[];for(let i=0;i<56;i++){const s=new THREE.Sprite(wm);g.add(s);wave.push(s)}
  g.visible=false;ec232Own(S,g);return {g,A,B,tm,bm,motes,wave,O,f,M:new THREE.Matrix4(),Q:new THREE.Quaternion(),E:new THREE.Euler(),P:new V(),Sc:new V()}}
function eb232PatchTick(Z,k,t){const R=2+46*ic151Oc(Math.min(1,k*1.25)),set=(m,L)=>{L.forEach((p,i)=>{let s=Math.max(0,Math.min(1,(R-p.d)/4));s=s<=0?0:(1+.35*Math.sin(Math.min(1,s)*Math.PI))*s*p.s*(1+.06*Math.sin(t*2.4+p.ry));
      Z.E.set(0,p.ry,.08*Math.sin(t*1.7+p.ry));Z.Q.setFromEuler(Z.E);Z.P.set(p.x,p.y,p.z);Z.Sc.set(s,s,s);Z.M.compose(Z.P,Z.Q,Z.Sc);m.setMatrixAt(i,Z.M)});m.instanceMatrix.needsUpdate=true};
  set(Z.tm,Z.A);set(Z.bm,Z.B);
  Z.motes.forEach(({s,p},i)=>{const on=R>p.d+1,u=(t*.22+eb232H(i*5))%1;s.visible=on;if(on){s.position.set(p.x+.3*Math.sin(t+i),p.y+.3+u*4.2,p.z+.3*Math.cos(t*1.3+i));s.scale.setScalar(.16+.14*Math.sin(u*Math.PI))}});
  const fade=1-ic151K(k,.72,.95);Z.wave.forEach((s,i)=>{const a=i/Z.wave.length*6.2832+t*.15,x=Z.O.x+Math.sin(a)*R,z=Z.O.z+Math.cos(a)*R;s.position.set(x,GH(x,z)+.5+.25*Math.sin(t*5+i),z);s.scale.setScalar((2.2+.8*Math.sin(t*6+i*1.7))*fade+.01);s.visible=fade>.01})}
ec232Reg('breath',{len:44.6,cut:42.6,skipT:41.4,fade:'#000',
  dips:[[9.0,.5],[13.4,.3],[17.8,.3],[22.2,.3],[26.6,.3],[31.0,.3],[35.4,.45]],
  lines:[{a:1.2,b:4.2,s:'It was never his.'},{a:5.0,b:8.2,s:'What he drank, the ground takes back.'}].concat([0,1,2,3,4,5].map(i=>({a:9.7+i*4.4,b:12.6+i*4.4,s:['The bog remembers green.','The hills, their rain.','The peak, its thaw.','The sands, their wells.','The graves, their quiet.','The court, its dawn.'][i]}))).concat([{a:36.2,b:39.2,s:'No Sovereign. No Voice. Only the land, breathing.'}]),
  title:{a:39.4,b:42.6,h:'The Wilds Breathe',s:'THE BALANCE IS RESTORED'},
  build(S){const V=THREE.Vector3,D=YT232D,L=D.L;S.D=D;
    // shot 0: the Hollow (its dressing built if need be), a stand-in Ythrael, the streams
    if(!D.LS)try{wk232Lair(D)}catch(e){console.warn('eb232 lair',e)}S.ls=D.LS;if(D.e&&D.e.m)ec232Vis(S,D.e.m,false);
    const v=S.v=zc214Rig(D.B,L.cx,L.cz+1.5,0);v.sv.ph=3;v.sv.wk=1;v.sv.tru=1;S.own.push(v.m);
    S.vmats=[];v.sv.R.root.traverse(o=>{if(o.material&&!S.vmats.includes(o.material))S.vmats.push(o.material)});
    const g0=S.g0=new THREE.Group();ec232Own(S,g0);S.str=YT232.ess.map((col,i)=>{const m=eb232SprMat(col,.95),a=i/6*6.2832+.5236,sp=[];for(let j=0;j<26;j++){const s=new THREE.Sprite(m);g0.add(s);sp.push(s)}
      const ring=new THREE.Mesh(new THREE.RingGeometry(.82,1,40,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));ring.position.set(L.cx+Math.sin(a)*7.6,L.y+.2,L.cz+Math.cos(a)*7.6);g0.add(ring);
      return {sp,ring,a,to:new V(L.cx+Math.sin(a)*7.6,L.y+.15,L.cz+Math.cos(a)*7.6)}});
    S.big=new THREE.Mesh(new THREE.RingGeometry(.9,1,72,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));S.big.position.set(L.cx,L.y+.25,L.cz);g0.add(S.big);
    // shots 1–6: a patch of new life on each zone's road
    S.Z=[0,1,2,3,4,5].map(z=>{try{const g=insG(z,0),R=zc214Road(g,z===0?.3:.36),O=new V(R.x+R.fx*15,0,R.z+R.fz*15);return Object.assign(eb232Patch(S,z,O,R),{R,gi:g})}catch(e){console.warn('eb232 zone',z,e);return null}});
    // shot 7: Duskhold
    const T=TOWNS[0];S.T=T;S.y0=GH(T.cx,T.cy);S.H=new V(T.cx+2.4,0,T.cy+3.6);S.H.y=GH(S.H.x,S.H.z);
    S.Z7=eb232Patch(S,1,new V(T.cx,0,T.cy),{fx:0,fz:-1})},
  frame(S,t,dt,now){const V=THREE.Vector3,K=ic151K,Sm=ic151Sm,Io=ic151Io,D=S.D,L=D.L,E=EB232;let i=0,k=0,c;
    if(t<E.T0){i=0;k=t/E.T0}else if(t<E.T7){i=1+Math.min(5,Math.floor((t-E.T0)/E.dz));k=(t-E.T0-(i-1)*E.dz)/E.dz}else{i=7;k=K(t,E.T7,42.6)}
    try{TOD=i===0?S.save.tod:i<7?.07+.012*i:.1+.06*k}catch(_){}
    if(S.ls){S.ls.root.visible=i===0;S.ls.lights.forEach(l=>{if(i===0){if(l.userData.wk0!=null){l.intensity=l.userData.wk0;l.userData.wk0=null}}else{if(l.userData.wk0==null)l.userData.wk0=l.intensity;l.intensity=0}})}
    S.v.m.visible=i===0;S.g0.visible=i===0;S.Z.forEach((Z,j)=>{if(Z)Z.g.visible=i===j+1});S.Z7.g.visible=i===7;
    if(i===0){pl.visible=false;try{D.tick&&D.tick(D,dt,now,t)}catch(_){}
      // he kneels, is torn open, empties, falls
      zc214RigPose(S.v,[[0,'kneel','l'],[1.6,'stag','io'],[5.6,'stag','l',.03],[7.2,'dead','i']],t,dt,now);
      const fd=1-Sm(K(t,5.8,8.2));S.vmats.forEach(m=>{if(m.userData.eb0==null){m.userData.eb0=m.opacity==null?1:m.opacity;m.transparent=true}m.opacity=m.userData.eb0*fd});S.v.m.scale.setScalar(1-.12*(1-fd));
      const hp=svWP(S.v,'heart',0,0,.2),flow=Sm(K(t,1.5,2.4))*(1-Sm(K(t,6.6,7.8)));
      S.str.forEach((Q,si)=>{const mid=new V((hp.x+Q.to.x)/2+Math.sin(Q.a+1.2)*2.2,L.y+8.5,(hp.z+Q.to.z)/2+Math.cos(Q.a+1.2)*2.2);
        Q.sp.forEach((s,j)=>{const u=(t*.42+j/Q.sp.length+si*.13)%1,a=1-u,x=a*a*hp.x+2*a*u*mid.x+u*u*Q.to.x,y=a*a*hp.y+2*a*u*mid.y+u*u*(Q.to.y-.8),z=a*a*hp.z+2*a*u*mid.z+u*u*Q.to.z,w=.16*Math.sin(t*9+j*2.1);
          s.position.set(x+w,y,z+w);s.scale.setScalar((.5+.9*Math.sin(u*Math.PI))*flow+.001);s.visible=flow>.01});
        const rk=((t-2.6)*.5+si*.17)%1;Q.ring.scale.setScalar(.4+rk*4.2);Q.ring.material.opacity=t>2.6?.75*(1-rk)*Math.min(1,flow+.25*(1-K(t,7.4,8.4))):0});
      const bk=K(t,6.9,8.9);S.big.scale.setScalar(.5+bk*24);S.big.material.opacity=.9*Math.sin(bk*Math.PI);
      try{if(S.ls.floorM)S.ls.floorM.emissiveIntensity=.5+1.1*flow+1.4*Math.sin(bk*Math.PI)}catch(_){}
      const q=Io(K(t,0,8.8));c={p:new V(L.cx+2.6+3.6*q,L.y+1.7+14.5*q,L.cz+8+10.5*q),l:new V(L.cx,L.y+2.2-1.9*q,L.cz+1.2-1.2*q),fov:46+6*q,F:new V(L.cx,L.y,L.cz),i}}
    else if(i<7){const Z=S.Z[i-1];pl.visible=false;if(!Z){c={p:new V(S.T.cx,S.y0+9,S.T.cy+14),l:new V(S.T.cx,S.y0+2,S.T.cy),fov:50,i}}else{eb232PatchTick(Z,k,t);const R=Z.R,e=Io(k),px=R.x+R.fx*(-7+13*e)+R.sx*3.2,pz=R.z+R.fz*(-7+13*e)+R.sz*3.2,lx=R.x+R.fx*(15+9*e),lz=R.z+R.fz*(15+9*e);
        c={p:new V(px,GH(px,pz)+7.2-1.8*e,pz),l:new V(lx,GH(lx,lz)+1.2,lz),fov:52,F:new V(R.x+R.fx*8,0,R.z+R.fz*8),i,grade:'saturate('+(.5+.95*Sm(K(k,.1,.8))).toFixed(3)+') brightness('+(.78+(.4+[.75,0,0,0,.45,.5][i-1])*Sm(K(k,.1,.8))).toFixed(3)+')',fogK:1-(.7+[.2,0,0,0,.15,.15][i-1])*Sm(K(k,.15,.85))}}}
    else{const T=S.T,y0=S.y0;pl.visible=true;pl.position.copy(S.H);pl.rotation.y=Math.atan2(T.cx-S.H.x,T.cy-S.H.z);try{animHero(now,false)}catch(_){}eb232PatchTick(S.Z7,Math.min(1,k*1.5),t);const e=Io(k);
      c={p:new V(T.cx+6.5-2*e,y0+2.2+9*e,T.cy+10.5+3.5*e),l:new V(T.cx+.6,y0+1.8+9*e*e,T.cy-9*e),fov:50,F:new V(T.cx,0,T.cy),i,grade:'saturate('+(1.05+.3*e).toFixed(3)+') brightness('+(1.02+.14*e).toFixed(3)+')',fogK:1-.6*e}}
    return c},
  after(S,t,c){if(c.fogK!=null)try{scene.fog.density*=c.fogK}catch(_){}},
  back(S){try{const R=S.v.sv.R;R.mats.forEach(m=>m.dispose());R.glow.forEach(m=>m.dispose())}catch(_){}
    try{const D=S.D,here=wk232In(D);if(S.ls){S.ls.root.visible=here;if(S.ls.floorM)S.ls.floorM.emissiveIntensity=.42}}catch(_){}},
  score(ac,out,T0,S){const E=EB232,D=[146.83,220,293.66,369.99,440];
    ec232Air(ac,out,T0,9,180,1400,.22);ec232Pad(ac,out,T0+.2,9.2,[73.42,110,146.83],.3,'triangle',3,3);ec232Bell(ac,out,T0+7,293.66,.18,5);
    [0,1,2,3,4,5].forEach(i=>{const t=T0+E.T0+i*E.dz,f=[146.83,164.81,185,196,220,246.94][i];ec232Bell(ac,out,t+.15,f*2,.16,4);ec232Pad(ac,out,t,E.dz+1.2,[f,f*1.5,f*2,f*2.52],.2+.02*i,'sine',1.4,1.6);ec232Air(ac,out,t+.3,3.4,500,2600,.07)});
    ec232Pad(ac,out,T0+E.T7-.2,9.6,[146.83,220,293.66,369.99,440,587.33],.42,'sine',2.5,4);ec232Pad(ac,out,T0+E.T7,9,[73.42,146.83],.2,'triangle',2,4);[0,1.2,2.4,3.9].forEach((d,j)=>ec232Bell(ac,out,T0+E.T7+1+d,[587.33,739.99,880,1174.66][j],.12,5))}});
