// ---------- Effects ----------
// v186 (owner, Nov 1 2026: "improve the visual effects on all of our character spells and abilities significantly"): every
// spell draws through these few shapes (burst, ring, arc, bolt; kqsPillar / kqsBeam in 1000), so they were rebuilt:
//  * particles: each one has its own size, is born white-hot and cools to its colour, then fades to a dark ember; a share
//    of every burst are small fast sparks that fly further and hang longer; puffs swell and slow down (drag) as they fade;
//    a big burst also gives a short soft flash at its centre (pooled sprites);
//  * ring: a soft shockwave (bright leading edge with a glow trailing inside, eased out) plus a second thin echo and a
//    ground glow that fades quickly;  arc: a swept crescent, bright at the outer edge, with a white-hot core line and sparks;
//  * bolt: crossed glowing ribbons (a white core in a coloured glow) that re-strike twice during their life, with forks.
// Signatures, the co-op relay (MPV.FX) and the evolved wrappers (2700) are unchanged.
var FX186={tex:{},fl:[],fi:0,dot:null};
function fx186Tex(k){if(FX186.tex[k])return FX186.tex[k];const S=k=='beam'?64:128,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),C=S/2;
  if(k=='ring'){// transparent middle, a glow rising to a sharp bright rim at .94, a quick fall outside
    const gr=g.createRadialGradient(C,C,0,C,C,C);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.55,'rgba(255,255,255,.05)');gr.addColorStop(.8,'rgba(255,255,255,.35)');
    gr.addColorStop(.92,'rgba(255,255,255,1)');gr.addColorStop(.96,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S)}
  else if(k=='zone'){// a lingering field: a faint fill, a soft inner swirl of rays, a bright rim
    const gr=g.createRadialGradient(C,C,0,C,C,C);gr.addColorStop(0,'rgba(255,255,255,.08)');gr.addColorStop(.7,'rgba(255,255,255,.12)');gr.addColorStop(.88,'rgba(255,255,255,.45)');
    gr.addColorStop(.95,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S);
    g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=2;for(let i=0;i<12;i++){const a=i/12*Math.PI*2;g.beginPath();g.arc(C,C,C*(.3+.08*(i%3)),a,a+.7);g.stroke()}}
  else if(k=='thin'){const gr=g.createRadialGradient(C,C,0,C,C,C);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.86,'rgba(255,255,255,0)');gr.addColorStop(.93,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S)}
  else if(k=='soft'){const gr=g.createRadialGradient(C,C,0,C,C,C);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.6)');gr.addColorStop(.6,'rgba(255,255,255,.15)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S)}
  else if(k=='beam'){const gr=g.createLinearGradient(0,0,0,S);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.38,'rgba(255,255,255,.35)');gr.addColorStop(.5,'rgba(255,255,255,1)');gr.addColorStop(.62,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S)}
  else if(k=='vgrad'){const gr=g.createLinearGradient(0,S,0,0);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S)}
  const t=new THREE.CanvasTexture(c);return FX186.tex[k]=t}
function fx186Mat(col,map,op){return new THREE.MeshBasicMaterial({color:col,map:map||null,transparent:true,opacity:op==null?1:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})}
var G_FXDISC=null,G_FXQ=null,G_FXCYL=null;
function fx186Disc(){return G_FXDISC||(G_FXDISC=(()=>{const g=new THREE.PlaneGeometry(2,2);g.rotateX(-Math.PI/2);return g})())}
// a short soft flash at p (pooled sprites: nothing to free)
function fx186Flash(p,col,s,ms){if(!p)return;try{if(typeof ABX!='undefined'&&ABX.ctx)return}catch(_){} // the pooled sprites live in the world scene, never on the preview stage
if(FX186.fl.length<14){const m=new THREE.SpriteMaterial({map:fx186Tex('soft'),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0});
    const sp=new THREE.Sprite(m);sp.userData.lpsSkip=1;sp.renderOrder=35;sp.visible=false;FX186.fl.push({sp,t:0})}
  const f=FX186.fl[FX186.fi++%FX186.fl.length],sp=f.sp,c=new THREE.Color(col);c.lerp(new THREE.Color(0xffffff),.35);sp.material.color.copy(c);sp.position.set(p.x,p.y,p.z);sp.visible=true;
  if(sp.parent!==scene)THREE.Object3D.prototype.add.call(scene,sp);const id=++f.t;ms=ms||160;s=s||1;
  tw(ms,k=>{if(f.t!==id)return;const u=k<.2?k/.2:1;sp.scale.setScalar(s*(.55+.45*u)*(1+k*.3));sp.material.opacity=.85*(1-k)*(1-k)},()=>{if(f.t===id){sp.visible=false;sp.material.opacity=0}})}
const NP=900,pa=new Float32Array(NP*3),pcol=new Float32Array(NP*3),pv=new Float32Array(NP*3),pbase=new Float32Array(NP*3),plf=new Float32Array(NP),pmx=new Float32Array(NP).fill(1),psz=new Float32Array(NP),ps0=new Float32Array(NP),pty=new Uint8Array(NP);let pix=0;
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pa,3));pg.setAttribute('color',new THREE.BufferAttribute(pcol,3));pg.setAttribute('psz',new THREE.BufferAttribute(psz,1));
const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:.5,map:SPR,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));pts.frustumCulled=false;scene.add(pts);
// per-particle size: gl_PointSize × psz
pts.material.onBeforeCompile=sh=>{sh.vertexShader='attribute float psz;\n'+sh.vertexShader.replace('gl_PointSize = size;','gl_PointSize = size * psz;')};
pts.material.customProgramCacheKey=()=>'fx186pts';
function burst(p,col,n,sp,up,life){
  const c=new THREE.Color(col);n=n|0;
  for(let i=0;i<n;i++){const j=pix++%NP,a=Math.random()*6.28,spark=Math.random()<.24,r=Math.random()*sp*(spark?1.45:1),L=life*(.6+Math.random()*.4)*(spark?1.35:1);
    pa[j*3]=p.x;pa[j*3+1]=p.y;pa[j*3+2]=p.z;pv[j*3]=Math.cos(a)*r;pv[j*3+1]=up*(.3+Math.random())*(spark?1.25:1);pv[j*3+2]=Math.sin(a)*r;
    pbase[j*3]=c.r;pbase[j*3+1]=c.g;pbase[j*3+2]=c.b;plf[j]=pmx[j]=L;pty[j]=spark?1:0;ps0[j]=spark?.3+Math.random()*.25:.6+Math.random()*.9;psz[j]=0}
  if(n>=10)fx186Flash(p,col,Math.min(2.8,.7+sp*.38),Math.min(240,120+n*3));
}
function fxStep(dt){const dr=Math.max(0,1-dt*2.4);
  for(let j=0;j<NP;j++){
    if(plf[j]<=0){if(psz[j]){pcol[j*3]=pcol[j*3+1]=pcol[j*3+2]=0;psz[j]=0}continue}
    plf[j]-=dt;const k=Math.max(0,plf[j]/pmx[j]),sp=pty[j];
    // born white-hot, cools to its colour, fades to a dark ember
    const hot=k>.78?(k-.78)/.22:0,fade=sp?Math.pow(k,.6):Math.pow(k,.85),w=hot*(sp?.7:.45);
    for(let a=0;a<3;a++){pa[j*3+a]+=pv[j*3+a]*dt;const b=pbase[j*3+a];pcol[j*3+a]=(b+(1-b)*w)*fade*(sp?1.15:1)}
    if(sp){pv[j*3+1]-=1.1*dt;psz[j]=ps0[j]*(.6+.4*k)}
    else{pv[j*3+1]-=1.5*dt;pv[j*3]*=dr;pv[j*3+2]*=dr;psz[j]=ps0[j]*(k>.85?.55+.45*(1-k)/.15:1+.45*(1-k))}
  }
  pg.attributes.position.needsUpdate=true;pg.attributes.color.needsUpdate=true;pg.attributes.psz.needsUpdate=true;
}
const addMat=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
// one shared ring shape (it only scales); each ring's own materials are freed when it fades out
var G_RING=null;
function ring(pos,col,r,ms){G_RING=G_RING||(()=>{const g=new THREE.PlaneGeometry(2,2);return g})();
  const m=new THREE.Mesh(G_RING,fx186Mat(col,fx186Tex('ring'))),R1=.55*(1+r),c2=new THREE.Color(col).lerp(new THREE.Color(0xffffff),.5);m.rotation.x=-Math.PI/2;m.position.copy(gY(pos,.12));m.userData.lpsSkip=1;m.renderOrder=31;scene.add(m);
  const e=new THREE.Mesh(fx186Disc(),fx186Mat(c2,fx186Tex('thin'),0)),d=new THREE.Mesh(fx186Disc(),fx186Mat(col,fx186Tex('soft'),0));e.position.y=d.position.y=.01;m.add(e,d);
  e.rotation.x=d.rotation.x=Math.PI/2;e.userData.lpsSkip=d.userData.lpsSkip=1;
  // a bigger ring also raises a low wall of light that thins as it spreads (volume, not just a decal)
  let w=null;if(r>=1.5){G_FXCYL=G_FXCYL||(()=>{const g=new THREE.CylinderGeometry(1,1,1,40,1,true);g.translate(0,.5,0);return g})();w=new THREE.Mesh(G_FXCYL,fx186Mat(col,fx186Tex('vgrad'),0));w.userData.lpsSkip=1;w.renderOrder=31;w.position.copy(gY(pos,.05));scene.add(w)}
  tw(ms,k=>{const ez=1-Math.pow(1-k,2.6),rr=.45+(R1-.45)*ez;m.scale.setScalar(rr);m.material.opacity=Math.pow(1-k,1.4);
    const k2=Math.max(0,(k-.12)/.88);e.scale.setScalar(.82);e.material.opacity=k2>0?.9*(1-k2):0;
    d.scale.setScalar(.7);d.material.opacity=.55*Math.max(0,1-k/.38);
    if(w){const rw=rr*.96;w.scale.set(rw,Math.min(1.1,.25+R1*.12)*(1-k*.8),rw);w.material.opacity=.45*Math.pow(1-k,1.6)}},()=>{scene.remove(m);m.material.dispose();e.material.dispose();d.material.dispose();if(w){scene.remove(w);w.material.dispose()}});
}
// the crescent's colour: dark at the inner edge, bright at the outer, the trailing end fading
function arc(pos,d,col,r,ms){
  const geo=new THREE.RingGeometry(r*.5,r,24,4,-.95,1.9),P=geo.attributes.position,cl=[];for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),rr=Math.hypot(x,y),u=(rr-r*.5)/(r*.5),a=(Math.atan2(y,x)+.95)/1.9;
    const v=Math.pow(Math.max(0,u),1.6)*(.35+.65*Math.min(1,a*1.3));cl.push(v,v,v)}geo.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));
  const g=new THREE.Group(),m=new THREE.Mesh(geo,addMat(col));m.material.vertexColors=true;
  const cg=new THREE.RingGeometry(r*.94,r*1.0,24,1,-.8,1.6),c=new THREE.Mesh(cg,addMat(new THREE.Color(col).lerp(new THREE.Color(0xffffff),.65)));
  m.rotation.x=c.rotation.x=-Math.PI/2;m.userData.lpsSkip=c.userData.lpsSkip=1;g.add(m,c);g.rotation.y=Math.atan2(-d.z,d.x);g.position.copy(gY(pos,.5));scene.add(g);
  // sparks thrown off the outer edge
  try{const a0=Math.atan2(-d.z,d.x);for(let i=0;i<3;i++){const a=a0+(i-1)*.6,q=new THREE.Vector3(pos.x+Math.cos(a)*r,0,pos.z-Math.sin(a)*r);q.y=GH(q.x,q.z)+.5;burst(q,col,3,1.2,1.2,.45)}}catch(_){}
  tw(ms,k=>{m.material.opacity=Math.pow(1-k,1.2);c.material.opacity=(1-k)*(1-k);g.scale.setScalar(.8+(1-Math.pow(1-k,2))*.45);g.rotation.z=0},()=>{scene.remove(g);geo.dispose();cg.dispose();m.material.dispose();c.material.dispose()});
}
// v186 lightning: crossed ribbons along a jagged path (a white core in a coloured glow), forks, re-strikes twice
function fx186Path(a,b,n,amp){const P=[];for(let i=0;i<=n;i++){const p=a.clone().lerp(b,i/n);if(i&&i<n){const e=Math.sin(i/n*Math.PI);p.x+=(Math.random()-.5)*amp*e;p.z+=(Math.random()-.5)*amp*e;p.y+=(Math.random()-.5)*amp*.55*e}P.push(p)}return P}
function fx186Ribbon(P,w,pos,uv){// two crossed strips per segment (horizontal + vertical), 6 vertices each
  for(let i=0;i<P.length-1;i++){const A=P[i],B=P[i+1],dx=B.x-A.x,dz=B.z-A.z,l=Math.hypot(dx,dz)||1,sx=-dz/l*w,sz=dx/l*w;
    [[sx,0,sz],[0,w,0]].forEach(o=>{const a0=[A.x-o[0],A.y-o[1],A.z-o[2]],a1=[A.x+o[0],A.y+o[1],A.z+o[2]],b0=[B.x-o[0],B.y-o[1],B.z-o[2]],b1=[B.x+o[0],B.y+o[1],B.z+o[2]];
      pos.push(...a0,...a1,...b1,...a0,...b1,...b0);uv.push(0,0,0,1,1,1,0,0,1,1,1,0)})}}
function bolt(a,b,col){
  const L=a.distanceTo(b),n=Math.max(6,Math.min(16,Math.round(L*2.2))),amp=Math.min(.9,.25+L*.08),c2=new THREE.Color(col).lerp(new THREE.Color(0xffffff),.75);
  const geo=new THREE.BufferGeometry(),gc=new THREE.BufferGeometry(),mG=fx186Mat(col,fx186Tex('beam'),.9),mC=fx186Mat(c2,fx186Tex('beam'),1),o=new THREE.Group();
  const mk=()=>{const P=fx186Path(a,b,n,amp),pos=[],uv=[],pc=[],uc=[];fx186Ribbon(P,.2,pos,uv);fx186Ribbon(P,.055,pc,uc);
    // one or two forks from the middle
    for(let f=0;f<(L>3?2:1);f++){const i=1+((Math.random()*(P.length-2))|0),s=P[i],e=s.clone().add(new THREE.Vector3((Math.random()-.5)*1.6,(Math.random()-.3)*.8,(Math.random()-.5)*1.6).multiplyScalar(Math.min(1.4,.4+L*.12)));
      const F=fx186Path(s,e,4,.35);fx186Ribbon(F,.11,pos,uv);fx186Ribbon(F,.03,pc,uc)}
    // re-strikes write into the same buffers (a replaced attribute would leave its GPU buffer behind)
    const put=(G,k,A,n)=>{const q=G.attributes[k];if(q&&q.array.length==A.length){q.array.set(A);q.needsUpdate=true}else G.setAttribute(k,new THREE.Float32BufferAttribute(A,n))};
    put(geo,'position',pos,3);put(geo,'uv',uv,2);put(gc,'position',pc,3);put(gc,'uv',uc,2)};
  mk();const g1=new THREE.Mesh(geo,mG),g2=new THREE.Mesh(gc,mC);g1.frustumCulled=g2.frustumCulled=false;g1.userData.lpsSkip=g2.userData.lpsSkip=1;g1.renderOrder=g2.renderOrder=33;o.add(g1,g2);scene.add(o);
  try{burst(b,col,5,1.6,1.4,.35)}catch(_){}
  let st=0;tw(300,k=>{const s=k<.33?0:k<.66?1:2;if(s!=st){st=s;mk()}const f=(1-k)*(s==st?.75+.25*Math.random():1);mG.opacity=.9*f;mC.opacity=f},()=>{scene.remove(o);geo.dispose();gc.dispose();mG.dispose();mC.dispose()});
}

