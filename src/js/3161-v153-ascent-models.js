// ================= v153 The Hilltop Ascent — models =================
//  * Skarrith, the Mountain Coil (ch153Snake): a serpent ~60 tiles long. The head is a rigid group (skull, snout, brow ridges, glowing
//    eyes, a hinged lower jaw with fangs and a forked tongue, a spread cobra hood with eye-spots, a horn crest). The body is 46
//    instanced segments (two band patterns, tapering to the tail) laid along the trail behind the head each frame (3162).
//  * The course: boulders, logs, spikes, tunnel pillars, gap edges, the plank bridge with ropes, the tunnel arches, the summit
//    crack, rolling rockslide boulders, venom globs, landing warnings and puddles.
//  * The uphill road at the far edge of Mistmere (Hillside Crest II), which replaces its gateway to III.
var CH153M={col:{sk:0x2e3a22,skD:0x1c2416,belly:0xb8a870,band:0x5a6a2a,hood:0x3a4a28,spot:0xd8c060,eye:0xf0ff60,fang:0xf0e8d0,mouth:0x6a1a1a,tongue:0xc02030,horn:0x3a3020},
  rock:[0x6a645a,0x7a7266,0x5a554c,0x8a8274],wood:0x5a4028,woodD:0x3a2818,woodL:0x7a5a38,rope:0x9a8a5a,venom:0x8aff3a,venomD:0x3a8a12};
function ch153R(seed){return ab152R(seed)}
// ---------------- the serpent ----------------
function ch153SnakeHead(){const C=CH153M.col,g=new THREE.Group();g.userData.psNo=1;
  g.add(lgGroup('CH153|head',k=>{
    k.p('','sph2','c',C.sk,0,.1,0,1.15,.72,1.55);k.p('','sph2','c',C.skD,0,.42,-.1,1.0,.42,1.35);           // skull, dark crown
    k.p('','box','c',C.sk,0,-.05,1.35,1.2,.62,1.4,.12,0,0);k.p('','box','c',C.skD,0,.26,1.4,1.0,.18,1.3,.12,0,0);   // snout
    [-1,1].forEach(s=>{k.p('','box','c',C.skD,s*.62,.42,.55,.4,.22,1.1,0,s*.25,s*.25);                        // brow ridges
      k.p('','sph','g',C.eye,s*.72,.36,.75,.2,.16,.26);k.p('','box','c',0x080806,s*.78,.36,.83,.04,.2,.12);      // eyes, slit pupils
      k.p('','sph','c',0x0a0806,s*.25,.18,2.02,.08,.06,.06);                                                   // nostrils
      for(let i=0;i<4;i++)k.p('','cone4','c',C.horn,s*(.3+i*.12),.62-i*.06,-.2-i*.42,.12,.5-i*.07,.12,-1.1,0,s*.3)});   // horn crest
    for(let i=0;i<6;i++)k.p('','box','c',i%2?C.band:C.skD,0,.55,-.4-i*.32,.5,.1,.24,0,0,0);
    // upper fangs and teeth
    [-1,1].forEach(s=>{k.p('','cone','c',C.fang,s*.45,-.48,1.85,.09,.55,.09,Math.PI,0,0);for(let i=0;i<5;i++)k.p('','cone4','c',C.fang,s*(.52-i*.02),-.36,.6+i*.25,.05,.18,.05,Math.PI,0,0)});
    k.p('','box','c',C.mouth,0,-.33,.9,1.0,.05,1.9)},0));
  // the lower jaw hinges at the back of the head
  const jaw=new THREE.Group();jaw.position.set(0,-.25,-.35);g.add(jaw);
  jaw.add(lgGroup('CH153|jaw',k=>{k.p('','box','c',C.sk,0,-.18,1.2,1.1,.28,2.4,0,0,0);k.p('','box','c',C.belly,0,-.3,1.2,.9,.06,2.2);k.p('','box','c',C.mouth,0,-.03,1.2,.9,.04,2.2);
    [-1,1].forEach(s=>{for(let i=0;i<5;i++)k.p('','cone4','c',C.fang,s*(.42-i*.02),0,.6+i*.38,.05,.2,.05)});
    k.L('','c',C.tongue,[0,-.02,.3],[0,-.04,2.0],.07,.05,5);[-1,1].forEach(s=>k.L('','c',C.tongue,[0,-.04,2.0],[s*.16,-.02,2.5],.04,.01,4))},0));
  g.userData.jaw=jaw;
  // the hood: two great fans behind the head, eye-spots on their backs
  const hood=lgGroup('CH153|hood',k=>{[-1,1].forEach(s=>{k.p('','sph2','c',C.hood,s*1.25,.15,-.85,1.1,1.25,.18,0,s*.5,s*.15);k.p('','sph2','c',C.belly,s*1.24,.1,-.75,.9,1.05,.12,0,s*.5,s*.15);
    k.p('','sph','c',C.spot,s*1.35,.35,-1.0,.32,.32,.06,0,s*.5,0);k.p('','sph','c',0x101008,s*1.36,.35,-1.03,.16,.16,.06,0,s*.5,0);
    for(let i=0;i<4;i++)k.L('','c',C.skD,[s*.4,0,-.8],[s*(1.6+i*.15),.9-i*.55,-1.0],.05,.03,4)})},0);
  hood.scale.set(.72,.85,1);g.add(hood);g.userData.hood=hood;
  g.scale.setScalar(1.35);return g}
function ch153SegGeo(v){return lgBake((()=>{const C=CH153M.col,k=dkKit();
  k.p('','sph2','c',v?C.band:C.sk,0,0,0,1,.86,1.05);k.p('','sph2','c',C.belly,0,-.28,0,.82,.6,.92);
  k.p('','sph2','c',v?C.skD:C.band,0,.5,0,.55,.36,.95);for(let i=0;i<3;i++)k.p('','cone4','c',C.horn,0,.78,-.4+i*.4,.1,.3-i*.03,.1,-.5,0,0);
  [-1,1].forEach(s=>k.p('','sph','c',C.skD,s*.7,.25,0,.3,.42,.8));return k.P})(),'CH153|seg'+v,0)}
function ch153Snake(parent,n){const g=new THREE.Group();g.userData.psNo=1;parent.add(g);const head=ch153SnakeHead();g.add(head);
  const segs=[0,1].map(v=>{const ms=ch153SegGeo(v);return ms.map(m=>{const q=new THREE.InstancedMesh(m.geometry,m.material,Math.ceil(n/2));q.frustumCulled=false;q.castShadow=true;q.userData.psNo=1;g.add(q);return q})});
  // its own copies of the materials (the shared scenery ones carry the see-through fade, 2420) and kept out of the fade's scan:
  // the serpent must stay solid when it strikes past the camera
  g.userData.noFade135=1;const MC=new Map();g.traverse(o=>{if(o.isMesh&&o.material){if(!MC.has(o.material)){const c=o.material.clone();c.onBeforeCompile=THREE.Material.prototype.onBeforeCompile;
    c.customProgramCacheKey=THREE.Material.prototype.customProgramCacheKey;c.userData={noFade135:1};MC.set(o.material,c)}o.material=MC.get(o.material)}});
  return {g,head,jaw:head.userData.jaw,hood:head.userData.hood,segs,n,m:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(0,0,0,'YXZ'),p:new THREE.Vector3(),sc:new THREE.Vector3()}}
// lay the body: pts[i] = [x,y,z,radius] from the neck back to the tail tip
function ch153SnakeLay(S,pts){for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[Math.min(pts.length-1,i+1)],c=pts[Math.max(0,i-1)],dx=c[0]-b[0],dy=c[1]-b[1],dz=c[2]-b[2];
    S.e.set(-Math.atan2(dy,Math.hypot(dx,dz)),Math.atan2(dx,dz),0);S.q.setFromEuler(S.e);S.p.set(a[0],a[1],a[2]);const r=a[3];S.sc.set(r,r,r*1.12);S.m.compose(S.p,S.q,S.sc);
    S.segs[i%2].forEach(q=>q.setMatrixAt(i>>1,S.m))}
  S.segs.forEach(L=>L.forEach(q=>q.instanceMatrix.needsUpdate=true))}
// ---------------- the course ----------------
function ch153Ob(k){const C=CH153M;switch(k){
  case 'boulder':return lgGroup('CH153|boulder',q=>{const R=ch153R(41);q.p('','dod','c',C.rock[0],0,.95,0,1.25,1.05,1.15,.3,.5,.2);q.p('','dod','c',C.rock[1],.5,.5,.6,.6,.5,.55,1,2,0);q.p('','dod','c',C.rock[2],-.6,.35,-.5,.5,.4,.5,2,1,1);
    for(let i=0;i<5;i++)q.p('','dod','c',C.rock[i%4],(R()-.5)*2.6,.1,(R()-.5)*2.2,.2+R()*.2,.15,.2)},0);
  case 'log':return lgGroup('CH153|log',q=>{q.p('','cyl','c',C.wood,0,.42,0,.42,6.6,.42,0,0,Math.PI/2);q.p('','cyl','c',C.woodL,3.32,.42,0,.36,.04,.36,0,0,Math.PI/2);q.p('','cyl','c',C.woodL,-3.32,.42,0,.36,.04,.36,0,0,Math.PI/2);
    for(let i=0;i<4;i++){const x=-2.2+i*1.4;q.L('','c',C.woodD,[x,.6,0],[x+.4,1.3,(i%2-.5)*.8],.08,.03,4)}for(let i=0;i<8;i++)q.p('','box','c',0x4a5a2a,-2.8+i*.8,.84,(i%2-.5)*.2,.3,.06,.24,0,i,0)},0);
  case 'spike':return lgGroup('CH153|spike',q=>{q.p('','cone','c',C.rock[2],0,1.2,0,.7,2.4,.7);q.p('','cone','c',C.rock[0],.35,.6,.2,.35,1.2,.35);q.p('','dod','c',C.rock[1],0,.1,0,.9,.25,.9)},0);
  case 'pillar':return lgGroup('CH153|pillar',q=>{q.p('','cone','c',C.rock[2],0,1.6,0,.75,3.2,.75);q.p('','cone','c',C.rock[0],0,4.6,0,.75,3.2,.75,Math.PI,0,0);q.p('','cyl','c',C.rock[3],0,3.15,0,.32,.9,.32)},0);
  case 'gapEdge':return lgGroup('CH153|gapEdge',q=>{const R=ch153R(9);for(let i=0;i<7;i++)q.p('','dod','c',C.rock[i%4],-2.6+i*.86,-.05,(R()-.5)*.4,.35,.25,.3,R(),R(),R())},0);
  case 'slide':return lgGroup('CH153|slide',q=>{q.p('','dod','c',C.rock[1],0,0,0,1.0,.95,1.0,.4,.2,.7);q.p('','dod','c',C.rock[2],.3,.35,.2,.45,.4,.45,1,0,0)},0)}
  return null}
function ch153Plank(){return lgGroup('CH153|plank',q=>{const C=CH153M;q.p('','box','c',C.woodL,0,0,0,3.6,.1,.55);q.p('','box','c',C.woodD,0,.02,-.2,3.62,.04,.06);q.p('','box','c',C.woodD,0,.02,.2,3.62,.04,.06)},0)}
function ch153Post(){return lgGroup('CH153|post',q=>{const C=CH153M;q.p('','cyl','c',C.woodD,0,.6,0,.09,1.9,.09);q.p('','cyl','c',C.rope,0,1.2,0,.12,.12,.12)},0)}
function ch153Arch(){return lgGroup('CH153|arch',q=>{const C=CH153M,R=ch153R(77);[-1,1].forEach(s=>{q.p('','box','c',C.rock[2],s*3.6,2.4,0,1.6,5.2,2.6);for(let i=0;i<3;i++)q.p('','dod','c',C.rock[i],s*(3.4+R()*.6),1+i*1.5,(R()-.5)*1.6,.9,.8,.9,R(),R(),R())});
  q.p('','box','c',C.rock[0],0,5.4,0,8.6,1.4,2.7);for(let i=0;i<4;i++)q.p('','cone','c',C.rock[3],-2.4+i*1.6,4.5,(R()-.5)*1.2,.22,.8,.22,Math.PI,0,0)},0)}
function ch153Crack(){return lgGroup('CH153|crack',q=>{const C=CH153M,R=ch153R(1313);
  [-1,1].forEach(s=>{for(let i=0;i<6;i++){const sz=1.6+R()*1.4;q.p('','dod','c',C.rock[i%4],s*(1.7+sz*.7+R()*.6),sz*.8+R()*3,(R()-.5)*2,sz,sz*1.4,sz,R()*3,R()*3,R()*3)}
    q.p('','box','c',C.rock[2],s*2.6,3.6,-1.0,2.6,7.2,3.6,0,0,s*.06)});
  q.p('','box','c',C.rock[0],0,7.6,-1,7.6,1.8,4);q.p('','box','c',0x050404,0,1.8,-.5,1.5,3.6,.1);
  for(let i=0;i<5;i++)q.p('','dod','c',C.rock[3],(R()-.5)*1.4,4.0+i*.5,.2,.25,.4,.25,R(),R(),R())},0)}
// venom: the glob, the warning on the ground, the puddle
function ch153Glob(){const m=new THREE.Mesh(ch153Glob.g||(ch153Glob.g=new THREE.SphereGeometry(.42,10,8)),ch153Glob.m||(ch153Glob.m=new THREE.MeshBasicMaterial({color:CH153M.venom,fog:false})));m.userData.psNo=1;return m}
function ch153WarnMat(){return new THREE.ShaderMaterial({uniforms:{k:{value:0},col:{value:new THREE.Color(0x9aff40)}},transparent:true,depthWrite:false,
  vertexShader:'varying vec2 vU;void main(){vU=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform float k;uniform vec3 col;varying vec2 vU;void main(){float r=length(vU);if(r>1.)discard;float ring=smoothstep(.86,.94,r)*(1.-smoothstep(.97,1.,r));float fill=step(r,k)*.32;gl_FragColor=vec4(col,max(ring*.9,fill));}'})}
function ch153Warn(){const m=new THREE.Mesh(ch153Warn.g||(ch153Warn.g=new THREE.PlaneGeometry(2,2).rotateX(-Math.PI/2)),ch153WarnMat());m.renderOrder=4;m.userData.psNo=1;return m}
function ch153Pool(){const m=new THREE.Mesh(ch153Pool.g||(ch153Pool.g=new THREE.CircleGeometry(1,20).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:0x6adf20,transparent:true,opacity:.72,depthWrite:false}));m.renderOrder=3;m.userData.psNo=1;return m}
// ---------------- the uphill road at the far edge of Mistmere ----------------
function ch153GateModel(s){const C=CH153M,g=new THREE.Group();g.userData.psNo=1;
  g.add(lgGroup('CH153|road',q=>{const R=ch153R(808);
    // a worn road climbing away out of the clearing between two rising shoulders of rock, stone steps, a waymarker, a carved serpent
    for(let i=0;i<9;i++){const z=-.6-i*.9,y=.08+i*.42;q.p('','box','c',i%2?0x8a7a5e:0x7a6c52,0,y,z,2.6,.24,1.0,-.42,0,0);q.p('','box','c',0x5a5040,0,y-.5,z,2.8,.8,1.0)}
    [-1,1].forEach(sd=>{for(let i=0;i<8;i++){const sz=.8+R()*1.1;q.p('','dod','c',C.rock[i%4],sd*(2.1+sz*.6+R()*.8),sz*.6+i*.45+R()*.8,-.8-i*1.0,sz,sz*1.25,sz,R()*3,R()*3,R()*3)}});
    for(let i=0;i<4;i++)q.p('','cone','c',0x2f5a32,(i%2?1:-1)*(3.6+R()),2.6+i*.9,-3-i*1.6,.8,2.2,.8);
    q.L('','c',C.woodD,[1.5,0,.6],[1.5,1.6,.6],.06,.05,5);q.p('','box','c',C.woodL,1.5,1.45,.62,.9,.3,.06,0,0,-.12);q.p('','box','c',0x2a2018,1.52,1.45,.66,.7,.06,.02,0,0,-.12);
    q.L('','c',0x3a6a4a,[-1.8,.25,.7],[-1.2,.35,1.6],.24,.18,7);q.p('','hood','c',0x2a5a3a,-1.1,.5,1.75,.7,.8,.35,1.3,0,.2)},0));
  g.position.set(s.x,GH(s.x,s.z),s.z);g.rotation.y=s.ry;scene.add(g);
  const ca=Math.cos(s.ry),sa=Math.sin(s.ry);for(let o=-4.6;o<=4.6;o+=.6)for(let d=-7;d<=-.6;d+=.6){if(Math.abs(o)<1.2&&d>-1.6)continue;const x=s.x+ca*o+sa*d,z=s.z-sa*o+ca*d;CBLK.add(Math.round(z)*W+Math.round(x))}
  return g}
