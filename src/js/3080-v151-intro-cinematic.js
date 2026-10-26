// ================= v151: intro cinematic (plays once for every new character, after "Begin your journey") =================
// A woodland at golden hour → a rat sniffing the forest floor → a celestial titan hand comes down from the sky, grips the
// ground and tears it open → the rat clings to the edge, it crumbles and he falls into the glowing core → a distorted voice
// speaks to him → he jolts and becomes the upright rat → the light clears into focus on Duskhold and the game begins.
// It has its own canvas + renderer over the page (#ic151). While it plays (IC151.on) the main loop only re-arms itself,
// so the world, tweens and timers wait; it resumes for the last 3 s while the white light clears off the real game view.
// Every shot is a pure function of the time t (ic151Frame), so tests can render it frame by frame: test/v151_intro.py.
// Skip: the Skip button, Esc, Enter or Space. Not played under test automation (navigator.webdriver) unless window.KQ_INTRO.
var IC151={on:false,run:false,S:null,len:59.4,skipT:55.0,cut:55.9,live:null,
  // the narration lines (shown as text). Edit freely.
  lines:[{a:37.0,b:40.3,s:'Innocence…'},{a:40.7,b:44.5,s:'you shall live again… through me…'},{a:44.9,b:48.3,s:'…as an upright.'}],
  voiceUrl:null,speak:false}; // narration is text only; speak:true uses the browser's voice, voiceUrl a recorded voice line (played at the first line's time)
function ic151H(x){x=Math.sin(x*12.9898+4.1414)*43758.5453;return x-Math.floor(x)}
function ic151Rng(s){s=s|0||1;return function(){s=(s*16807)%2147483647;return (s-1)/2147483646}}
function ic151K(t,a,b){return t<=a?0:t>=b?1:(t-a)/(b-a)}
function ic151Io(k){return k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2}
function ic151Sm(k){return k*k*(3-2*k)}
function ic151Oc(k){return 1-Math.pow(1-k,3)}
function ic151M(x,y,z,rx,ry,rz,sx,sy,sz){const s=sx==null?1:sx;return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(s,sy==null?s:sy,sz==null?s:sz))}
// shared-vertex jitter: equal positions move together, so the faceted shapes stay closed
function ic151Jit(g,amt,seed){g=g.index?g.toNonIndexed():g;const a=g.attributes.position.array;
  for(let i=0;i<a.length;i+=3){const k=Math.round(a[i]*997)*.37+Math.round(a[i+1]*997)*.71+Math.round(a[i+2]*997)*.13+(seed||0)*3.1;
    a[i]+=(ic151H(k)-.5)*amt;a[i+1]+=(ic151H(k+1.3)-.5)*amt;a[i+2]+=(ic151H(k+2.7)-.5)*amt}return g}
// merge kit: everything static goes into one vertex-coloured geometry (the game's flat-shaded v83 look)
function ic151Kit(){const P=[],C=[],c=new THREE.Color();
  return {P,C,
    add(g,col,m,vary){const n=g.index?g.toNonIndexed():g.clone();if(m)n.applyMatrix4(m);const a=n.attributes.position.array,v=vary==null?.08:vary;c.set(col);
      for(let i=0;i<a.length;i+=9){const f=1+v*(ic151H(a[i]*3.1+a[i+1]*7.7+a[i+2]*1.3)-.5)*2;for(let j=0;j<9;j++)P.push(a[i+j]);for(let j=0;j<3;j++)C.push(c.r*f,c.g*f,c.b*f)}
      n.dispose();if(n!==g&&g.dispose)g.dispose()},
    tri(A,B,D,col,vary){c.set(col);const v=vary==null?.08:vary,f=1+v*(ic151H(A[0]*3.1+B[1]*7.7+D[2]*1.3+A[2])-.5)*2;P.push(A[0],A[1],A[2],B[0],B[1],B[2],D[0],D[1],D[2]);for(let j=0;j<3;j++)C.push(c.r*f,c.g*f,c.b*f)},
    triC(A,B,D,ca,cb,cd){P.push(A[0],A[1],A[2],B[0],B[1],B[2],D[0],D[1],D[2]);C.push(ca.r,ca.g,ca.b,cb.r,cb.g,cb.b,cd.r,cd.g,cd.b)},
    geo(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();g.computeBoundingSphere();return g}}}
function ic151Mat(o){return new THREE.MeshStandardMaterial(Object.assign({vertexColors:true,flatShading:true,roughness:.95,metalness:0,side:THREE.DoubleSide},o||{}))}
function ic151Tex(draw,w,h){const c=document.createElement('canvas');c.width=w||64;c.height=h||64;draw(c.getContext('2d'),c.width,c.height);const t=new THREE.CanvasTexture(c);return t}
function ic151Dot(){return ic151Tex((x,w,h)=>{const g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.8)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)})}
// ground height (plates and the meadow share it, so the tear starts seamless)
function ic151Y(x,z){return .06*Math.sin(x*.9)*Math.cos(z*.7)+.04*Math.sin(x*2.1+z*1.7)}
// the tear: four rings of plates around the centre; boundary b of ring i is a wobbly circle shared by both neighbours
var IC151B=[0,2.4,4.6,7.0,9.6];
function ic151Rb(b,th){if(!b)return 0;return IC151B[b]+Math.sin(th*3+b*1.7)*.16+Math.sin(th*7+b*2.3)*.09+Math.sin(th*13+b)*.04}

// ---------------- woodland pieces ----------------
function ic151Pine(k,x,z,s,R){const y0=ic151Y(x,z)-.1;k.add(ic151Jit(new THREE.CylinderGeometry(.1*s,.2*s,2.4*s,6),.04*s,x),0x4a3424,ic151M(x,y0+1.2*s,z));
  const G=[0x2c5530,0x31602f,0x284a2a,0x3a6a34];for(let i=0;i<4;i++){const r=(1.55-i*.3)*s,h=(1.9-i*.18)*s,y=y0+(1.2+i*.95)*s;
    k.add(ic151Jit(new THREE.ConeGeometry(r,h,7,1),.14*s,x+i),G[(i+(R()*4|0))%4],ic151M(x,y+h/2,z,(R()-.5)*.1,R()*6,(R()-.5)*.1))}}
function ic151Oak(k,x,z,s,R,pal){const y0=ic151Y(x,z)-.1,tr=0x5a4030;k.add(ic151Jit(new THREE.CylinderGeometry(.15*s,.28*s,2.8*s,6),.05*s,z),tr,ic151M(x,y0+1.4*s,z));
  [[.7,.5],[-.6,2.6]].forEach(([tl,ry])=>k.add(new THREE.CylinderGeometry(.05*s,.09*s,1.3*s,5),tr,ic151M(x+Math.sin(ry)*.35*s,y0+2.3*s,z+Math.cos(ry)*.35*s,tl,ry,0)));
  const n=5+(R()*3|0);for(let i=0;i<n;i++){const a=i/n*6.28+R(),d=i?(.7+R()*.5)*s:0,r=(i?.85+R()*.45:1.35)*s;
    k.add(ic151Jit(new THREE.IcosahedronGeometry(r,0),.22*r,i+x),pal[(i+(R()*pal.length|0))%pal.length],ic151M(x+Math.cos(a)*d,y0+(3.1+R()*.9+(i?0:.5))*s,z+Math.sin(a)*d,R(),R()*6,R(),1,.82,1))}}
function ic151Birch(k,x,z,s,R){const y0=ic151Y(x,z)-.1;k.add(ic151Jit(new THREE.CylinderGeometry(.08*s,.13*s,3.4*s,6),.03*s,x),0xd8d2c4,ic151M(x,y0+1.7*s,z,(R()-.5)*.08,0,(R()-.5)*.08));
  for(let i=0;i<4;i++)k.add(new THREE.CylinderGeometry(.135*s,.135*s,.08*s,6),0x2a2420,ic151M(x,y0+(.5+i*.7+R()*.2)*s,z,0,R()*3,0,1,1,.8));
  const P=[0x6f9a42,0x7aa648,0x8aa848,0x648c3a];for(let i=0;i<5;i++){const r=(.6+R()*.4)*s;k.add(ic151Jit(new THREE.IcosahedronGeometry(r,0),.2*r,i+z),P[i%4],ic151M(x+(R()-.5)*1.1*s,y0+(3.1+R()*1.3)*s,z+(R()-.5)*1.1*s,R(),R(),R(),1,1.15,1))}}
function ic151Bush(k,x,z,s,R){const y0=ic151Y(x,z);const P=[0x3f6a2e,0x4a7a36,0x365e2a];for(let i=0;i<3;i++){const r=(.45+R()*.3)*s;k.add(ic151Jit(new THREE.IcosahedronGeometry(r,0),.2*r,i+x),P[i],ic151M(x+(R()-.5)*.8*s,y0+r*.6,z+(R()-.5)*.8*s,R(),R(),R(),1,.75,1))}
  if(R()<.5)for(let i=0;i<4;i++)k.add(new THREE.OctahedronGeometry(.05*s,0),R()<.5?0xb83a3a:0xe8d070,ic151M(x+(R()-.5)*.9*s,y0+.55*s+R()*.2*s,z+(R()-.5)*.9*s),.02)}
function ic151Rock(k,x,z,s,R){k.add(ic151Jit(new THREE.DodecahedronGeometry(s,0),.3*s,x*z),[0x77706a,0x6a655e,0x837a6e][R()*3|0],ic151M(x,ic151Y(x,z)+s*.2,z,R(),R()*6,R(),1,.55+R()*.3,1));
  if(R()<.6)k.add(ic151Jit(new THREE.DodecahedronGeometry(s*.5,0),.15*s,z),0x4f6e34,ic151M(x+s*.3,ic151Y(x,z)+s*.62,z,R(),0,R(),1,.25,1))}
function ic151Fern(k,x,z,s,R){const y0=ic151Y(x,z);for(let i=0;i<6;i++){const a=i/6*6.28+R()*.4;k.add(new THREE.ConeGeometry(.09*s,.8*s,3,1),[0x3f7a34,0x4a8a3a,0x36702e][i%3],ic151M(x+Math.cos(a)*.3*s,y0+.25*s,z+Math.sin(a)*.3*s,Math.sin(a)*1.05,0,-Math.cos(a)*1.05,1,1,.35))}}
function ic151Tuft(k,x,z,s,R,cols){const y0=ic151Y(x,z);for(let i=0;i<3;i++){const h=(.2+R()*.16)*s;k.add(new THREE.ConeGeometry(.026*s,h,3,1),cols[(R()*cols.length)|0],ic151M(x+(R()-.5)*.08,y0+h/2-.01,z+(R()-.5)*.08,(R()-.5)*.6,R()*6,(R()-.5)*.6),.1)}}
function ic151Flower(k,x,z,R){const y0=ic151Y(x,z),h=.1+R()*.08;k.add(new THREE.CylinderGeometry(.006,.006,h,3),0x4a7a36,ic151M(x,y0+h/2,z),0);
  k.add(new THREE.OctahedronGeometry(.032,0),[0xf0d050,0xf0f0e8,0xb070d0,0xe07a50,0x80a0f0][(R()*5)|0],ic151M(x,y0+h,z,R(),R(),R(),1,.6,1),.05)}
function ic151Mush(k,x,z,s,R){const y0=ic151Y(x,z);k.add(new THREE.CylinderGeometry(.028*s,.04*s,.15*s,6),0xe0d8c8,ic151M(x,y0+.075*s,z),.04);
  k.add(new THREE.ConeGeometry(.1*s,.08*s,7,1),R()<.6?0xa8322a:0xc89a5a,ic151M(x,y0+.18*s,z,(R()-.5)*.3,0,(R()-.5)*.3),.05);
  for(let i=0;i<3;i++)k.add(new THREE.OctahedronGeometry(.013*s,0),0xf0e8e0,ic151M(x+(R()-.5)*.09*s,y0+.2*s,z+(R()-.5)*.09*s),0)}
function ic151Log(k,x,z,s,ry){k.add(ic151Jit(new THREE.CylinderGeometry(.22*s,.26*s,3*s,8),.05*s,x),0x4a3424,ic151M(x,ic151Y(x,z)+.2*s,z,0,ry,Math.PI/2));
  k.add(new THREE.CylinderGeometry(.2*s,.2*s,.02,8),0x9a7a50,ic151M(x+Math.cos(ry)*1.51*s,ic151Y(x,z)+.2*s,z-Math.sin(ry)*1.51*s,0,ry,Math.PI/2));
  for(let i=0;i<4;i++)k.add(new THREE.IcosahedronGeometry(.12*s,0),0x4f7a36,ic151M(x+Math.cos(ry)*(i-1.5)*.7*s,ic151Y(x,z)+.42*s,z-Math.sin(ry)*(i-1.5)*.7*s,i,i,i,1,.4,1))}
function ic151Litter(k,x,z,R){const a=R()*6.28,y=ic151Y(x,z)+.012,s=.05+R()*.05;k.tri([x+Math.cos(a)*s,y,z+Math.sin(a)*s],[x+Math.cos(a+2.3)*s*.6,y,z+Math.sin(a+2.3)*s*.6],[x+Math.cos(a-2.3)*s*.6,y,z+Math.sin(a-2.3)*s*.6],[0x8a5a2a,0xa8702e,0x6a4a2a,0xb08a3a][(R()*4)|0],.1)}

// ---------------- the world: meadow, tear plates, chasm, trees, sky, clouds ----------------
function ic151World(S){const sc=S.sc,R=ic151Rng(1337),GR=[0x4f6e34,0x56763a,0x47672f,0x5b7a3c],TF=[0x6a8a3e,0x5b7d36,0x7a9446,0x4c6c30];
  const mat=S.mat=ic151Mat();
  // meadow (outside the tear): polar grid from boundary 4 to the horizon, hills far out
  {const k=ic151Kit(),RS=[0,10.4,11.6,13,15,18,22,27,34,43,55,70,90,120,160,220,320],NA=140,P=[];
    const hill=(r,th)=>r<38?0:Math.pow((r-38)/20,1.3)*(1.4+Math.sin(th*3+1)*.9+Math.sin(th*7)*.5);
    for(let i=0;i<RS.length;i++){const row=[];for(let a=0;a<=NA;a++){const th=a/NA*Math.PI*2,r=i?RS[i]*(1+(i>1?(ic151H(a*7.1+i)-.5)*.05:0)):ic151Rb(4,th),x=Math.cos(th)*r,z=Math.sin(th)*r;row.push([x,ic151Y(x,z)+hill(r,th),z])}P.push(row)}
    for(let i=0;i<RS.length-1;i++)for(let a=0;a<NA;a++){const A=P[i][a],B=P[i][a+1],C=P[i+1][a+1],D=P[i+1][a],c=GR[(ic151H(a*3.7+i*11.3)*4)|0];k.tri(A,C,B,c,.12);k.tri(A,D,C,c,.12)}
    const m=new THREE.Mesh(k.geo(),mat);m.receiveShadow=true;sc.add(m)}
  S.GR=GR;S.TF=TF;
  // the chasm under the plates: dark rock walls into a pale blue glow far below
  {const k=ic151Kit(),NA=140,ROWS=[[0,1],[-2.6,1],[-8,1.05],[-20,1],[-40,.9],[-62,.78],[-82,.66],[-96,.6]],CL=[0x2e2620,0x2a221e,0x231e22,0x1c2a4a,0x24508a,0x4a8ad8,0x9ccaf8,0xdaf0ff].map(c=>new THREE.Color(c)),P=[];
    for(let i=0;i<ROWS.length;i++){const row=[];for(let a=0;a<=NA;a++){const th=a/NA*Math.PI*2,j=i>1?(ic151H(a*5.3+i*7.7)-.5)*1.4:0,r=ic151Rb(4,th)*ROWS[i][1]+j;row.push([Math.cos(th)*r,ROWS[i][0]+(i>1?(ic151H(a+i)-.5)*1.5:0),Math.sin(th)*r])}P.push(row)}
    for(let i=0;i<ROWS.length-1;i++)for(let a=0;a<NA;a++){const f=1+(ic151H(a*1.7+i)-.5)*.25,ca=CL[i].clone().multiplyScalar(f),cb=CL[i+1].clone().multiplyScalar(f);
      k.triC(P[i][a],P[i+1][a+1],P[i][a+1],ca,cb,ca);k.triC(P[i][a],P[i+1][a],P[i+1][a+1],ca,cb,cb)}
    const m=new THREE.Mesh(k.geo(),new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:false}));sc.add(m);S.chasm=m;
    const d=new THREE.Mesh(new THREE.CircleGeometry(7,18),new THREE.MeshBasicMaterial({color:0xeaf6ff,fog:false}));d.rotation.x=-Math.PI/2;d.position.y=-95;sc.add(d);
    const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:S.dot,color:0x9fd4ff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,opacity:.9}));gl.scale.set(60,60,1);gl.position.y=-80;sc.add(gl);S.cglow=gl}
  // sky dome + low-poly clouds + light shafts + pollen
  {S.skyU={top:{value:new THREE.Color()},mid:{value:new THREE.Color()},bot:{value:new THREE.Color()},sunC:{value:new THREE.Color(0xffe0a0)},sunD:{value:new THREE.Vector3(-.3,.62,-1).normalize()},sunK:{value:1},hole:{value:0}};
    const m=new THREE.ShaderMaterial({uniforms:S.skyU,side:THREE.BackSide,depthWrite:false,fog:false,
      vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform vec3 top,mid,bot,sunC,sunD;uniform float sunK,hole;varying vec3 vD;void main(){vec3 d=normalize(vD);float h=d.y;vec3 c=h>0.?mix(mid,top,pow(h,.55)):mix(mid,bot,min(1.,-h*4.));float s=max(0.,dot(d,sunD));c+=sunC*(pow(s,6.)*.4+pow(s,300.)*2.)*sunK;float u=smoothstep(.72,.98,h);c=mix(c,vec3(.78,.86,1.),u*hole);gl_FragColor=vec4(c,1.);}'});
    S.sky=new THREE.Mesh(new THREE.SphereGeometry(500,24,14),m);S.sky.renderOrder=-10;sc.add(S.sky);
    S.cloudM=ic151Mat({fog:false,emissive:0x8a7a70,emissiveIntensity:1,side:THREE.FrontSide,roughness:1,flatShading:false,transparent:true,opacity:.92});S.clouds=[];
    for(let n=0;n<34;n++){const k=ic151Kit(),a=R()*6.283,r=25+R()*190,cx=Math.cos(a)*r,cz=Math.sin(a)*r,cy=78+R()*40,np=5+(R()*4|0);
      for(let i=0;i<np;i++){const s=5+R()*7,ii=i/(np-1)-.5;k.add(ic151Jit(new THREE.IcosahedronGeometry(s,1),s*.07,n*9+i),[0xffffff,0xfff6ee,0xf4ecf4][i%3],ic151M(ii*26+(R()-.5)*5,(1-Math.abs(ii)*1.6)*s*.35,(R()-.5)*9,R(),R(),R(),1,.55,1),.04)}
      const m=new THREE.Mesh(k.geo(),S.cloudM);m.position.set(cx,cy,cz);m.userData.b=new THREE.Vector3(cx,cy,cz);sc.add(m);S.clouds.push(m)}
    const shT=ic151Tex((x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(255,240,200,0)');g.addColorStop(.25,'rgba(255,236,190,.9)');g.addColorStop(1,'rgba(255,230,180,0)');x.fillStyle=g;x.fillRect(0,0,w,h);
      const g2=x.createLinearGradient(0,0,w,0);g2.addColorStop(0,'rgba(0,0,0,1)');g2.addColorStop(.5,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,0,1)');x.globalCompositeOperation='destination-out';x.fillStyle=g2;x.fillRect(0,0,w,h)},64,128);
    S.shaftM=new THREE.MeshBasicMaterial({map:shT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false,opacity:.14});S.shafts=new THREE.Group();
    const sd=S.skyU.sunD.value;for(let n=0;n<7;n++){const w=1.6+R()*2.8,p=new THREE.Mesh(new THREE.PlaneGeometry(w,34),S.shaftM),x=-16+R()*30,z=-6-R()*14;
      p.position.set(x,9,z);p.rotation.set(-.62,(R()-.5)*.5+.25,0,'YXZ');p.userData.ph=R()*6;S.shafts.add(p);const p2=p.clone();p2.rotation.y+=Math.PI/2;S.shafts.add(p2)}
    sc.add(S.shafts);
    const N=500,pp=new Float32Array(N*3),pd=[];for(let i=0;i<N;i++){pd.push([(R()-.5)*30,R()*7,(R()-.5)*30-3,R()*6,.2+R()*.5])}
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));S.pollen={d:pd,g:pg,m:new THREE.PointsMaterial({map:S.dot,size:.09,color:0xffe8b0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.8})};
    S.pollen.o=new THREE.Points(pg,S.pollen.m);S.pollen.o.frustumCulled=false;sc.add(S.pollen.o)}
  // dust burst at the impact, pebbles off the edges, light rising out of the tear
  {const N=700,pd=[],R2=ic151Rng(77);for(let i=0;i<N;i++){const k=i%5,a=R2()*6.283,sp=2+R2()*7;pd.push({k,a,v:[Math.cos(a)*sp*.6,3+R2()*8,Math.sin(a)*sp*.6],t0:i%2?19.4+R2()*.6:21.0+R2()*1.2,s:R2()})}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));S.dust={d:pd,g,m:new THREE.PointsMaterial({map:S.dot,size:.32,color:0x8a7a62,transparent:true,depthWrite:false,opacity:.75})};
    S.dust.o=new THREE.Points(g,S.dust.m);S.dust.o.frustumCulled=false;sc.add(S.dust.o);
    const M=420,g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.BufferAttribute(new Float32Array(M*3),3));S.rise={d:Array.from({length:M},()=>[R2()*6.283,Math.sqrt(R2())*8.5,R2()*60,1+R2()*3]),g:g2,m:new THREE.PointsMaterial({map:S.dot,size:.22,color:0xa8dcff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0,fog:false})};
    S.rise.o=new THREE.Points(g2,S.rise.m);S.rise.o.frustumCulled=false;sc.add(S.rise.o)}
  // lights
  S.hemi=new THREE.HemisphereLight(0xcfe0ff,0x4a3a24,.75);sc.add(S.hemi);
  S.sun=new THREE.DirectionalLight(0xffd59a,1.35);const sd=S.skyU.sunD.value;S.sun.position.set(sd.x*60,sd.y*60,sd.z*60);S.sun.target.position.set(0,0,0);sc.add(S.sun,S.sun.target);
  S.sun.castShadow=true;S.sun.shadow.mapSize.set(2048,2048);Object.assign(S.sun.shadow.camera,{left:-26,right:26,top:26,bottom:-26,near:5,far:140});S.sun.shadow.bias=-.0008;
  S.moon=new THREE.DirectionalLight(0xb8c8ff,0);S.moon.position.set(-10,60,-20);sc.add(S.moon);
  S.blue=new THREE.PointLight(0x7ac0ff,0,34,1.2);S.blue.position.set(0,-5,0);sc.add(S.blue);
  S.blue2=new THREE.PointLight(0x9ad0ff,0,90,1);S.blue2.position.set(0,-55,0);sc.add(S.blue2);
  sc.fog=new THREE.FogExp2(0xc8b88a,.016)}
// ---------------- the earth breaking: fracture pieces ----------------
// One slab of earth from a polygon [[x,z],...]: grass on top, soil and rock strata down the sides, roots underneath.
// Built in world rest coordinates; its physics proxy (contact points, spheres, mass, inertia) is in c.body.
function ic151Trees(S,extra){const sc=S.sc,mat=S.mat,R=ic151Rng(1338),TF=S.TF;
  // trees and undergrowth: a dense treeline all round; the view lanes the shots look down are kept open
  {const k=ic151Kit(),lane=(x,z,dx,dz,w)=>{const L=Math.hypot(dx,dz),u=dx/L,v=dz/L,p=x*u+z*v,q=Math.abs(-x*v+z*u);return p>-2&&q<w+p*.12};
    const free=(x,z)=>!(lane(x,z,.66,.75,8.5)||lane(x,z,.42,.9,5)||lane(x,z,.92,-.39,6.5)||(extra||[]).some(e=>lane(x,z,e[0],e[1],e[2]))),OAK=[[0x3f6a2e,0x4a7a36,0x365e2a,0x557f3a],[0x4a7a36,0x5b8a3a,0x6a8a34,0x3f6a2e],[0x7a8a34,0x8a9a3a,0x5b7a32,0xa08a3a]];
    for(let n=0;n<420;n++){const a=R()*6.283,r=11.5+Math.pow(R(),1.25)*68,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!free(x,z))continue;
      const s=.9+R()*.75,q=R();if(q<.42)ic151Pine(k,x,z,s*1.25,R);else if(q<.82)ic151Oak(k,x,z,s,R,OAK[(R()*3)|0]);else ic151Birch(k,x,z,s,R)}
    for(let n=0;n<260;n++){const a=R()*6.283,r=10.2+R()*45,x=Math.cos(a)*r,z=Math.sin(a)*r,q=R();
      if(q<.35)ic151Bush(k,x,z,.8+R()*.8,R);else if(q<.55)ic151Rock(k,x,z,.25+R()*.6,R);else if(q<.8)ic151Fern(k,x,z,.8+R()*.6,R);else ic151Mush(k,x,z,.9+R()*.6,R)}
    ic151Log(k,13.5,-4.5,1,.6);ic151Log(k,-6,12.5,.9,2.1);ic151Rock(k,11.2,6.8,.9,R);ic151Rock(k,-10.8,-3,1.2,R);
    for(let n=0;n<1600;n++){const a=R()*6.283,r=9.7+Math.pow(R(),1.6)*34,x=Math.cos(a)*r,z=Math.sin(a)*r;const q=R();
      if(q<.72)ic151Tuft(k,x,z,r<16?.55+R()*.3:1+R()*.6,R,TF);else if(q<.86)ic151Flower(k,x,z,R);else ic151Litter(k,x,z,R)}
    const m=new THREE.Mesh(k.geo(),mat);m.castShadow=true;m.receiveShadow=true;sc.add(m)}}
function ic151Piece(S,pts,idx,R,taper){taper=taper||0;const n=pts.length,GR=S.GR,TF=S.TF;let cx=0,cz=0,A2=0;
  for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n],cr=p[0]*q[1]-q[0]*p[1];A2+=cr;cx+=(p[0]+q[0])*cr;cz+=(p[1]+q[1])*cr}const area=Math.abs(A2/2);cx/=3*A2;cz/=3*A2;
  const k=ic151Kit(),Y=ic151Y,D=[0,-.32,-1.05,-2.3],SC=[0x5a4030,0x6e5036,0x5e4a3e,0x534a44],seed=idx*31+7;
  const sh=(p,d)=>{const h=ic151H(p[0]*13.1+p[1]*7.3+d*3.3),q=d<1?1:1-d*(.04+taper)-.05*h,ox=(p[0]-cx)*(1-q),oz=(p[1]-cz)*(1-q);return [p[0]-ox,Y(p[0],p[1])+D[d]-(d?h*.25:0),p[1]-oz]};
  const top=[cx,Y(cx,cz),cz],gc=GR[(seed*7)%4],bot=[cx,-3.2+Y(cx,cz)-ic151H(seed)*.6,cz];
  for(let a=0;a<n;a++){const p=pts[a],q=pts[(a+1)%n];k.tri(top,[p[0],Y(p[0],p[1]),p[1]],[q[0],Y(q[0],q[1]),q[1]],ic151H(a*1.7+seed)<.18?GR[(a+seed)%4]:gc,.1);
    for(let d=0;d<3;d++){const A=sh(p,d),B=sh(q,d),C=sh(q,d+1),E=sh(p,d+1),c=SC[d+(ic151H(a+d*5+seed)<.2?1:0)];k.tri(A,C,B,c,.14);k.tri(A,E,C,c,.14)}
    k.tri(bot,sh(q,3),sh(p,3),SC[3],.12)}
  const inside=(x,z)=>{let c=false;for(let a=0,b=n-1;a<n;b=a++){const pa=pts[a],pb=pts[b];if((pa[1]>z)!=(pb[1]>z)&&x<(pb[0]-pa[0])*(z-pa[1])/(pb[1]-pa[1])+pa[0])c=!c}return c};
  const edgeD=(x,z)=>{let m=1e9;for(let a=0;a<n;a++){const A=pts[a],B=pts[(a+1)%n],ex=B[0]-A[0],ez=B[1]-A[1],L=ex*ex+ez*ez||1;let t=((x-A[0])*ex+(z-A[1])*ez)/L;t=Math.max(0,Math.min(1,t));m=Math.min(m,Math.hypot(A[0]+ex*t-x,A[1]+ez*t-z))}return m};
  let minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;pts.forEach(p=>{minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minZ=Math.min(minZ,p[1]);maxZ=Math.max(maxZ,p[1])});
  for(let t=0;t<area*5;t++){const x=minX+R()*(maxX-minX),z=minZ+R()*(maxZ-minZ);if(!inside(x,z))continue;
    const q=R();if(q<.75)ic151Tuft(k,x,z,.45+R()*.3,R,TF);else if(q<.88)ic151Flower(k,x,z,R);else if(q<.97)ic151Litter(k,x,z,R);else ic151Mush(k,x,z,.8+R()*.5,R)}
  if(area>5&&R()<.35){const x=cx+(R()-.5)*.6,z=cz+(R()-.5)*.6;if(inside(x,z)&&edgeD(x,z)>.8)(R()<.5?ic151Bush:ic151Fern)(k,x,z,.7,R)}
  for(let t=0,m=0;t<60&&m<Math.min(16,3+area*1.6);t++){const x=minX+R()*(maxX-minX),z=minZ+R()*(maxZ-minZ);if(!inside(x,z))continue;m++;const L=.5+R()*1.3,y0=Y(x,z)-1.0-R()*1.3;
    k.add(new THREE.ConeGeometry(.035+R()*.04,L,4,1),R()<.5?0x7a5a3a:0x5e4630,ic151M(x,y0-L/2,z,Math.PI+(R()-.5)*.7,R()*6,(R()-.5)*.7),.15);
    if(R()<.5)k.add(new THREE.ConeGeometry(.02,L*.6,3,1),0x8a6a48,ic151M(x+(R()-.5)*.3,y0-L*.45,z+(R()-.5)*.3,Math.PI+(R()-.5)*1.4,0,(R()-.5)*1.4),.1)}
  const m=new THREE.Mesh(k.geo(),S.mat);m.matrixAutoUpdate=false;m.castShadow=true;m.receiveShadow=true;S.sc.add(m);
  // physics proxy (local to the centre of mass)
  const x0=[cx,-1.2,cz],P=[],BI=[],SPH=[],step=Math.max(1,Math.ceil(n/12));
  for(let i=0;i<n;i+=step){const p=pts[i],b=sh(p,3);P.push(p[0]-x0[0],Y(p[0],p[1])-x0[1],p[1]-x0[2]);BI.push(P.length/3);P.push(b[0]-x0[0],b[1]-x0[1],b[2]-x0[2])}
  for(let gx=minX+.6;gx<maxX;gx+=1.15)for(let gz=minZ+.6;gz<maxZ;gz+=1.15)if(inside(gx,gz)&&edgeD(gx,gz)>.6)[-.6,-1.7].forEach(y=>SPH.push(gx-x0[0],y-x0[1],gz-x0[2],.56));
  if(!SPH.length){const r=Math.max(.25,Math.min(.56,edgeD(cx,cz)-.03));[-.6,-1.7].forEach(y=>SPH.push(0,y-x0[1],0,r))}
  let Rb=0;for(let i=0;i<P.length;i+=3)Rb=Math.max(Rb,Math.hypot(P[i],P[i+1],P[i+2]));const mass=Math.max(.3,area*2.3),w=maxX-minX,d=maxZ-minZ,h=2.4;
  const body={x0,pts:new Float32Array(P),bot:BI,sph:new Float32Array(SPH),R:Rb+.6,im:1/mass,Ib:[12/(mass*(h*h+d*d)),12/(mass*(w*w+d*d)),12/(mass*(w*w+h*h))],area};
  return {pts,m,c:new THREE.Vector3(cx,0,cz),area,r:R(),grip:-1,body,idx}}
// break the hole into pieces: a seed under every fingertip (the slabs the hand rips up), a long slab for the rat that
// rests on the meadow's lip, and Poisson-scattered seeds for the rest (smaller rubble towards the middle)
function ic151Shatter(S){const V=THREE.Vector3,R=ic151Rng(2024),NB=140,B=[];for(let a=0;a<NB;a++){const th=a/NB*Math.PI*2,r=ic151Rb(4,th);B.push([Math.cos(th)*r,Math.sin(th)*r])}
  const TP=S.tip0.map(m=>[m.elements[12],m.elements[14]]),th=S.thR,ray=(r,a)=>[Math.cos(a)*r,Math.sin(a)*r],seeds=[];
  seeds.push({p:[0,0],chunk:1});for(let k=0;k<5;k++)seeds.push({p:ray(2.5,th+k*Math.PI*.4),chunk:1});TP.forEach((p,f)=>seeds.push({p,grip:f,chunk:1}));seeds.push({p:ray(7.1,th),rat:1});
  for(let n=0;n<5000&&seeds.length<64;n++){const r=Math.sqrt(R())*9.1,a=R()*6.283,p=ray(r,a),md=r<4?1.85:2.3;let ok=true;
    if(r<4.8){continue}for(const q of seeds){const dd=Math.hypot(p[0]-q.p[0],p[1]-q.p[1]);if(dd<(q.rat?2.8:q.grip!=null?2.4:md)){ok=false;break}}if(ok)seeds.push({p})}
  const clip=(P,nx,nz,c)=>{const o=[];for(let i=0;i<P.length;i++){const A=P[i],Bp=P[(i+1)%P.length],da=A[0]*nx+A[1]*nz-c,db=Bp[0]*nx+Bp[1]*nz-c;if(da<=0)o.push(A);if((da<=0)!=(db<=0)){const t=da/(da-db);o.push([A[0]+(Bp[0]-A[0])*t,A[1]+(Bp[1]-A[1])*t])}}return o};
  S.cells=[];seeds.forEach((sd,i)=>{let P=B.slice();for(let j=0;j<seeds.length&&P.length>2;j++){if(j==i)continue;const q=seeds[j].p,nx=q[0]-sd.p[0],nz=q[1]-sd.p[1];if(nx*nx+nz*nz>110)continue;
      const mx=(q[0]+sd.p[0])/2,mz=(q[1]+sd.p[1])/2;P=clip(P,nx,nz,mx*nx+mz*nz)}
    const Q=[];P.forEach(p=>{const l=Q[Q.length-1];if(!l||Math.hypot(p[0]-l[0],p[1]-l[1])>1e-4)Q.push(p)});while(Q.length>2&&Math.hypot(Q[0][0]-Q[Q.length-1][0],Q[0][1]-Q[Q.length-1][1])<1e-4)Q.pop();
    if(Q.length<3)return;const c=ic151Piece(S,Q,i,R,sd.chunk&&sd.grip==null&&Math.hypot(sd.p[0],sd.p[1])>.1?.09:0);c.grip=sd.grip!=null?sd.grip:-1;c.chunk=!!sd.chunk;c.seed=sd.p;if(sd.rat)S.rcell=c;
    if(c.chunk){const rr=Math.hypot(sd.p[0],sd.p[1]);c.tr=rr<.1?null:sd.grip!=null?21.12+c.r*.25:(c.r<.4?null:23.4+c.r*3.5)}S.cells.push(c)});
  // the rat's slab hinges on the meadow's lip; where its inner edge crosses his line
  {const c=S.rcell,rr=ic151Rb(4,th),dx=Math.cos(th),dz=Math.sin(th);c.qo=new V(dx*rr,0,dz*rr);c.tg=new V(-dz,0,dx);let best=1e9;
    for(let i=0;i<c.pts.length;i++){const A=c.pts[i],Bp=c.pts[(i+1)%c.pts.length],ex=Bp[0]-A[0],ez=Bp[1]-A[1],den=dx*ez-dz*ex;if(Math.abs(den)<1e-9)continue;
      const r=(A[0]*ez-A[1]*ex)/den,u=(A[0]*dz-A[1]*dx)/den;if(u>=0&&u<=1&&r>.5&&r<rr-.8)best=Math.min(best,r)}S.rEdgeR=best<1e8?best:4.8}
  // glowing crack lines along every break, spreading out from the fingers
  {const L=[],a=[],dt=(x,z)=>Math.min(...TP.map(p=>Math.hypot(x-p[0],z-p[1])));S.cells.forEach(c=>{const p=c.pts;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];
      L.push(p[i][0],ic151Y(p[i][0],p[i][1])+.03,p[i][1],q[0],ic151Y(q[0],q[1])+.03,q[1]);a.push(dt(p[i][0],p[i][1]),dt(q[0],q[1]))}});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(L,3));g.setAttribute('ar',new THREE.Float32BufferAttribute(a,1));S.crackU={uR:{value:0},uA:{value:0}};
    const m=new THREE.ShaderMaterial({uniforms:S.crackU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:'attribute float ar;varying float vR;void main(){vR=ar;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform float uR,uA;varying float vR;void main(){float k=smoothstep(uR+.5,uR-.5,vR);gl_FragColor=vec4(vec3(.55,.85,1.)*k*uA,1.);}'});
    S.cracks=new THREE.LineSegments(g,m);S.sc.add(S.cracks)}}
function ic151CellAt(S,x,z){for(const c of S.cells){const p=c.pts,n=p.length;let ins=false;for(let a=0,b=n-1;a<n;b=a++){const pa=p[a],pb=p[b];if((pa[1]>z)!=(pb[1]>z)&&x<(pb[0]-pa[0])*(z-pa[1])/(pb[1]-pa[1])+pa[0])ins=!ins}if(ins)return c}return null}

// ---------------- the earth breaking: physics ----------------
// A small rigid-body simulation run once (time-sliced while the opening plays; all at once in tests): gravity, contacts
// with the meadow lip, the chasm walls and the ground still under the hole (which gives way from the middle outwards, so
// pieces tip over the edge of what is left before they drop), piece-on-piece contacts through sphere clusters, friction,
// resting pieces asleep until touched or undermined. The slabs in the fingers and the rat's slab are moved by the story
// and push the others. States are recorded at 60 Hz; frames interpolate them, so every frame is a function of t.
function ic151Ropen(th,t){return t<21.1?-1:4.2+7.8*ic151Sm(ic151K(t,21.1,24.4))*(1+.12*Math.sin(3*th+1.3)+.08*Math.sin(7*th+.4))}
var IC151FY=[-2.6,-8,-20,-40,-62,-82,-96],IC151FF=[1,1.05,1,.9,.78,.66,.6];
function ic151Env(x,y,z,t){const r=Math.sqrt(x*x+z*z),th=Math.atan2(z,x),rb=ic151Rb(4,th);let f=1;
  if(y<-2.6){if(y<=-96)f=.6;else for(let i=0;i<6;i++)if(y<=IC151FY[i]&&y>IC151FY[i+1]){f=IC151FF[i]+(IC151FF[i+1]-IC151FF[i])*(IC151FY[i]-y)/(IC151FY[i]-IC151FY[i+1]);break}}
  const d=Math.max(rb*f-r,y-ic151Y(x,z)),ro=ic151Ropen(th,t);return ro>rb+1?d:Math.min(d,Math.max(y+2.62,-(y+7),ro-r))}
function ic151Qr(q,x,y,z,o){const qx=q[0],qy=q[1],qz=q[2],qw=q[3],tx=2*(qy*z-qz*y),ty=2*(qz*x-qx*z),tz=2*(qx*y-qy*x);o[0]=x+qw*tx+qy*tz-qz*ty;o[1]=y+qw*ty+qz*tx-qx*tz;o[2]=z+qw*tz+qx*ty-qy*tx;return o}
function ic151PhysKin(S,b,t,M){const c=b.c;if(c===S.rcell)ic151RatCellM(S,t,M);else ic151ChunkM(S,t,M);return M}
function ic151PhysInit(S){const P=S.phys={T0:IC151G.imp,T1:34.9,dt:1/240,n:0,done:false,ev:[],B:[],M:new THREE.Matrix4(),Q:new THREE.Quaternion(),Vv:new THREE.Vector3(),Vs:new THREE.Vector3()};
  P.t=P.T0;P.nF=Math.ceil((P.T1-P.T0)*60)+2;
  S.cells.forEach(c=>{const b=c.body;b.c=c;b.kin=c.chunk||c===S.rcell;b.tr=c.chunk?c.tr:null;b.sleep=!b.kin;b.x=b.x0.slice();b.q=[0,0,0,1];b.v=[0,0,0];b.w=[0,0,0];b.still=0;b.lastEv=-9;
    b.wp=new Float32Array(b.pts.length);b.ws=new Float32Array(b.sph.length);b.rec=new Float32Array(P.nF*7);b.nr=0;P.B.push(b)});
  P.dyn=P.B.filter(b=>!b.kin);ic151PhysRec(S);return P}
function ic151PhysAll(S){return S.phys.B}
function ic151PhysRec(S){const P=S.phys,f=Math.round((P.t-P.T0)*60);if(f>=P.nF)return;P.B.forEach(b=>{b.rec.set([b.x[0],b.x[1],b.x[2],b.q[0],b.q[1],b.q[2],b.q[3]],f*7);b.nr=f+1});P.nf=f+1}
function ic151PhysStep(S){const P=S.phys,dt=P.dt,t=P.t+dt,G=12.2,B=P.B,o=[0,0,0],o2=[0,0,0],K=ic151K;
  const cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const Iw=(b,u)=>{if(b.kin||b.sleep)return [0,0,0];const qc=[-b.q[0],-b.q[1],-b.q[2],b.q[3]],l=ic151Qr(qc,u[0],u[1],u[2],[0,0,0]);l[0]*=b.Ib[0];l[1]*=b.Ib[1];l[2]*=b.Ib[2];return ic151Qr(b.q,l[0],l[1],l[2],[0,0,0])};
  const im=b=>b.kin||b.sleep?0:b.im,vel=(b,r)=>{const c=cr(b.w,r);return [b.v[0]+c[0],b.v[1]+c[1],b.v[2]+c[2]]};
  const push=(b,r,J)=>{if(b.kin||b.sleep)return;b.v[0]+=J[0]*b.im;b.v[1]+=J[1]*b.im;b.v[2]+=J[2]*b.im;const a=Iw(b,cr(r,J));b.w[0]+=a[0];b.w[1]+=a[1];b.w[2]+=a[2]};
  const kn=(b,r,n)=>{if(b.kin||b.sleep)return 0;const a=cr(Iw(b,cr(r,n)),r);return b.im+dot(n,a)};
  // the story-driven slabs
  if(t>IC151G.g0-.02){ic151HandAt(S,S.hand,t);S.hand.g.updateMatrixWorld(true)}
  B.forEach(b=>{if(b.kin&&b.tr!=null&&t>=b.tr){b.kin=false;b.sleep=false;b.tr=null}});P.dyn=B.filter(b=>!b.kin);
  B.forEach(b=>{if(!b.kin)return;ic151PhysKin(S,b,t,P.M);const x=P.Vv.set(b.x0[0],b.x0[1],b.x0[2]).applyMatrix4(P.M);P.Q.setFromRotationMatrix(P.M);
    const q=[P.Q.x,P.Q.y,P.Q.z,P.Q.w],dq=[q[3]*-b.q[0]+q[0]*b.q[3]+q[1]*-b.q[2]-q[2]*-b.q[1],q[3]*-b.q[1]+q[1]*b.q[3]+q[2]*-b.q[0]-q[0]*-b.q[2],q[3]*-b.q[2]+q[2]*b.q[3]+q[0]*-b.q[1]-q[1]*-b.q[0],q[3]*b.q[3]-q[0]*-b.q[0]-q[1]*-b.q[1]-q[2]*-b.q[2]],sg=dq[3]<0?-1:1;
    b.v=[(x.x-b.x[0])/dt,(x.y-b.x[1])/dt,(x.z-b.x[2])/dt];b.w=[2*sg*dq[0]/dt,2*sg*dq[1]/dt,2*sg*dq[2]/dt];b.x=[x.x,x.y,x.z];b.q=q});
  // undermined pieces wake up
  if(P.n%4==0)P.dyn.forEach(b=>{if(!b.sleep)return;for(const i of b.bot){ic151Qr(b.q,b.pts[i*3],b.pts[i*3+1],b.pts[i*3+2],o);const x=b.x[0]+o[0],z=b.x[2]+o[2],r=Math.hypot(x,z);if(r<ic151Ropen(Math.atan2(z,x),t)){b.sleep=false;b.why=b.why||['support',t];break}}});
  P.dyn.forEach(b=>{if(b.sleep)return;b.v[1]-=G*dt;const lv=1-.04*dt,av=1-.5*dt;for(let i=0;i<3;i++){b.v[i]*=lv;b.w[i]*=av}});
  // world positions of contact points and spheres
  B.forEach(b=>{for(let i=0;i<b.pts.length;i+=3){ic151Qr(b.q,b.pts[i],b.pts[i+1],b.pts[i+2],o);b.wp[i]=b.x[0]+o[0];b.wp[i+1]=b.x[1]+o[1];b.wp[i+2]=b.x[2]+o[2]}
    for(let i=0;i<b.sph.length;i+=4){ic151Qr(b.q,b.sph[i],b.sph[i+1],b.sph[i+2],o);b.ws[i]=b.x[0]+o[0];b.ws[i+1]=b.x[1]+o[1];b.ws[i+2]=b.x[2]+o[2];b.ws[i+3]=b.sph[i+3]}});
  const corr=new Map(),addC=(b,n,d)=>{if(b.kin||b.sleep)return;const c=corr.get(b);if(!c||d>c[3])corr.set(b,[n[0],n[1],n[2],d])},ev=(b,x,y,z,s)=>{if(t-b.lastEv<.3||P.ev.length>300)return;b.lastEv=t;P.ev.push({t,x,y,z,s})};
  for(let it=0;it<2;it++){
    // against the ground, lip and walls
    P.dyn.forEach(b=>{if(b.sleep)return;for(let i=0;i<b.wp.length;i+=3){const x=b.wp[i],y=b.wp[i+1],z=b.wp[i+2],d=ic151Env(x,y,z,t);if(d>=0)continue;const e=.03;
      let n=[ic151Env(x+e,y,z,t)-ic151Env(x-e,y,z,t),ic151Env(x,y+e,z,t)-ic151Env(x,y-e,z,t),ic151Env(x,y,z+e,t)-ic151Env(x,y,z-e,t)];const l=Math.hypot(n[0],n[1],n[2])||1;n=[n[0]/l,n[1]/l,n[2]/l];
      const r=[x-b.x[0],y-b.x[1],z-b.x[2]],vp=vel(b,r),vn=dot(vp,n);addC(b,n,-d);if(vn>=0)continue;if(it==0&&vn<-3.5)ev(b,x,y,z,Math.min(1,(-vn-3)/7)*(.5+b.area/8));
      const j=-(1.08)*vn/kn(b,r,n);push(b,r,[n[0]*j,n[1]*j,n[2]*j]);const v2=vel(b,r),vn2=dot(v2,n),vt=[v2[0]-n[0]*vn2,v2[1]-n[1]*vn2,v2[2]-n[2]*vn2],lt=Math.hypot(vt[0],vt[1],vt[2]);
      if(lt>1e-5){const tt=[vt[0]/lt,vt[1]/lt,vt[2]/lt],jt=Math.min(lt/kn(b,r,tt),.55*j);push(b,r,[-tt[0]*jt,-tt[1]*jt,-tt[2]*jt])}}});
    // piece against piece
    for(let a=0;a<B.length;a++){const A=B[a];for(let c=a+1;c<B.length;c++){const C=B[c];if((A.kin||A.sleep)&&(C.kin||C.sleep))continue;
      const dx=A.x[0]-C.x[0],dy=A.x[1]-C.x[1],dz=A.x[2]-C.x[2],rr=A.R+C.R;if(dx*dx+dy*dy+dz*dz>rr*rr)continue;
      for(let i=0;i<A.ws.length;i+=4)for(let j=0;j<C.ws.length;j+=4){const ex=A.ws[i]-C.ws[j],ey=A.ws[i+1]-C.ws[j+1],ez=A.ws[i+2]-C.ws[j+2],sr=A.ws[i+3]+C.ws[j+3],d2=ex*ex+ey*ey+ez*ez;if(d2>=sr*sr||d2<1e-10)continue;
        const dd=Math.sqrt(d2),n=[ex/dd,ey/dd,ez/dd],pen=sr-dd,pt=[C.ws[j]+n[0]*(C.ws[j+3]-pen/2),C.ws[j+1]+n[1]*(C.ws[j+3]-pen/2),C.ws[j+2]+n[2]*(C.ws[j+3]-pen/2)];
        const ra=[pt[0]-A.x[0],pt[1]-A.x[1],pt[2]-A.x[2]],rc=[pt[0]-C.x[0],pt[1]-C.x[1],pt[2]-C.x[2]],va=vel(A,ra),vc=vel(C,rc),vr=[va[0]-vc[0],va[1]-vc[1],va[2]-vc[2]],vn=dot(vr,n);
        if(A.sleep&&(vn<-.25||pen>.05)){A.sleep=false;A.why=A.why||['hit',t,C.kin?'kin':'dyn',+vn.toFixed(2),+pen.toFixed(3)]}if(C.sleep&&(vn<-.25||pen>.05)){C.sleep=false;C.why=C.why||['hit',t,A.kin?'kin':'dyn',+vn.toFixed(2),+pen.toFixed(3)]}
        const ia=im(A),ic=im(C);if(ia+ic>0){addC(A,n,pen*ic/(ia+ic)*0+pen*(ia/(ia+ic)));addC(C,[-n[0],-n[1],-n[2]],pen*(ic/(ia+ic)))}
        if(vn>=0)continue;if(it==0&&vn<-4)ev(A.kin?C:A,pt[0],pt[1],pt[2],Math.min(1,(-vn-3.5)/7)*.6);
        const k=kn(A,ra,n)+kn(C,rc,n);if(k<=0)continue;const jn=-1.05*vn/k;push(A,ra,[n[0]*jn,n[1]*jn,n[2]*jn]);push(C,rc,[-n[0]*jn,-n[1]*jn,-n[2]*jn]);
        const va2=vel(A,ra),vc2=vel(C,rc),w2=[va2[0]-vc2[0],va2[1]-vc2[1],va2[2]-vc2[2]],vn2=dot(w2,n),vt=[w2[0]-n[0]*vn2,w2[1]-n[1]*vn2,w2[2]-n[2]*vn2],lt=Math.hypot(vt[0],vt[1],vt[2]);
        if(lt>1e-5){const tt=[vt[0]/lt,vt[1]/lt,vt[2]/lt],kt=kn(A,ra,tt)+kn(C,rc,tt);if(kt>0){const jt=Math.min(lt/kt,.45*jn);push(A,ra,[-tt[0]*jt,-tt[1]*jt,-tt[2]*jt]);push(C,rc,[tt[0]*jt,tt[1]*jt,tt[2]*jt])}}}}}}
  corr.forEach((c,b)=>{const k=Math.max(0,c[3]-.005)*.5;b.x[0]+=c[0]*k;b.x[1]+=c[1]*k;b.x[2]+=c[2]*k});
  P.dyn.forEach(b=>{if(b.sleep)return;for(let i=0;i<3;i++)b.x[i]+=b.v[i]*dt;const q=b.q,w=b.w,h=dt*.5,nq=[q[0]+h*(w[0]*q[3]+w[1]*q[2]-w[2]*q[1]),q[1]+h*(w[1]*q[3]+w[2]*q[0]-w[0]*q[2]),q[2]+h*(w[2]*q[3]+w[0]*q[1]-w[1]*q[0]),q[3]-h*(w[0]*q[0]+w[1]*q[1]+w[2]*q[2])],l=Math.hypot(...nq);b.q=nq.map(v=>v/l);
    if(dot(b.v,b.v)<.012&&dot(b.w,b.w)<.012){b.still+=dt;if(b.still>.5){b.sleep=true;b.v=[0,0,0];b.w=[0,0,0]}}else b.still=0;if(b.x[1]<-110){b.sleep=true;b.v=[0,0,0];b.w=[0,0,0]}});
  P.t=t;P.n++;if(P.n%4==0)ic151PhysRec(S);if(P.t>=P.T1)P.done=true}
function ic151PhysRun(S,ms){const P=S.phys;if(!P||P.done)return true;const t0=performance.now();while(!P.done&&performance.now()-t0<ms)for(let i=0;i<8&&!P.done;i++)ic151PhysStep(S);return P.done}
function ic151PhysM(S,c,t,out){const P=S.phys,b=c.body;if(!P||!b.rec||t<=P.T0)return out.identity();const f=Math.max(0,Math.min(b.nr-1.001,(t-P.T0)*60));if(f<0||b.nr<1)return out.identity();
  const i=f|0,u=f-i,R=b.rec,a=i*7,c2=Math.min(b.nr-1,i+1)*7,V=P.Vs.set(R[a]+(R[c2]-R[a])*u,R[a+1]+(R[c2+1]-R[a+1])*u,R[a+2]+(R[c2+2]-R[a+2])*u);
  let d=R[a+3]*R[c2+3]+R[a+4]*R[c2+4]+R[a+5]*R[c2+5]+R[a+6]*R[c2+6];const sg=d<0?-1:1,q=P.Q.set(R[a+3]+(sg*R[c2+3]-R[a+3])*u,R[a+4]+(sg*R[c2+4]-R[a+4])*u,R[a+5]+(sg*R[c2+5]-R[a+5])*u,R[a+6]+(sg*R[c2+6]-R[a+6])*u).normalize();
  out.makeRotationFromQuaternion(q).setPosition(V);return out.multiply(P.M.makeTranslation(-b.x0[0],-b.x0[1],-b.x0[2]))}
// the rat's slab: hinged on the meadow's lip, it tips as the ground under it gives way, catches with a jolt, creaks,
// then lurches and breaks away
function ic151RatCellM(S,t,out){const c=S.rcell,qo=c.qo,K=ic151K;let a=0;
  if(t>19.35&&t<23)a=.006*Math.sin(t*37)*(1-K(t,21,23));
  if(t>23){const k=K(t,23,24.85);a+=.5*k*k;if(t>24.85){const u=t-24.85;a=.5-.035*Math.exp(-6*u)*Math.sin(16*u)}}
  if(t>25.4&&t<29.55)a+=Math.sin(t*5)*.012*Math.sin(t*1.3+1);
  let fall=0;if(t>29.55){const k=K(t,29.55,31.3);a+=.45*k*k;if(t>31.3){fall=t-31.3;a+=.51*fall}}
  out.makeTranslation(qo.x,0,qo.z).multiply(S.tmp.m2.makeRotationAxis(c.tg,a)).multiply(S.tmp.m.makeTranslation(-qo.x,0,-qo.z));
  if(fall){const n=S.nin0;out.premultiply(S.tmp.m.makeTranslation(n.x*1.5*fall,-6.1*fall*fall,n.z*1.5*fall))}return out}
// ---------------- the celestial hand ----------------
// One seamless, smooth skinned surface: a signed-distance hand (cupped palm, thumb mound, knuckles, tendons, veins, creased
// joints, nails) meshed once with surface nets in the open rest pose, skinned to the finger bones the poses drive.
// Built once per page (IC151.HG) and shared by both hands. Rest space: wrist at z=0, knuckles z≈8.4, palm faces -y.
var IC151FD=[{x:3.3,L:[4.2,2.8,2.1],r:.95,sp:.16},{x:1.1,L:[4.7,3.1,2.3],r:1.02,sp:.05},{x:-1.1,L:[4.4,2.9,2.1],r:.96,sp:-.06},{x:-3.2,L:[3.4,2.3,1.7],r:.82,sp:-.2},
  {x:4.7,y:-.3,z:2.8,L:[3.8,2.9],r:1.15,sp:.95,thumb:1}];
var IC151DIR=[0,1.35,-1];
function ic151HandVS(){return '#include <common>\n#include <skinning_pars_vertex>\nattribute vec3 aD;uniform float uPush;varying vec3 vW,vV,vL,vN,vD;\nvoid main(){\n#include <skinbase_vertex>\n#include <beginnormal_vertex>\n#include <skinnormal_vertex>\n#include <begin_vertex>\n#include <skinning_vertex>\n'+
  'transformed+=normalize(objectNormal)*uPush;vec4 w=modelMatrix*vec4(transformed,1.);vW=w.xyz;vL=position;vV=cameraPosition-w.xyz;vN=normalize(mat3(modelMatrix)*objectNormal);vD=aD;gl_Position=projectionMatrix*viewMatrix*w;}'}
// smoky celestial black: domain-warped smoke, nebula colours, spiral galaxies, stars; the edges dissolve into wisps.
// o.sp = up to 3 spirals [cx,cy,cz,R, ax,ay,az] in the mesh's rest space; o.vague (0..1) = faint outline;
// o.s = smoke scale; o.fh = fade out high up (the hand's arm). Shared code for the hand and the arm.
var IC151GLSL='float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}'+
  'float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}'+
  'float fbm(vec3 p){return n3(p)*.5+n3(p*2.03+3.1)*.27+n3(p*4.01+7.7)*.15+n3(p*8.1+1.3)*.08;}';
function ic151HandMat(glow,skin,o){o=o||{};const sp=(o.sp||[]).slice(0,3);while(sp.length<3)sp.push([0,0,0,1e-3,0,1,0]);
  const U={uT:{value:0},uG:{value:1},uA:{value:1},uPush:{value:glow?(o.push||.24):0},uV:{value:o.vague||0},uS:{value:o.s||.32},uFH:{value:o.fh==null?1:o.fh},uTB:{value:new THREE.Vector2(o.tb?o.tb[0]:0,o.tb?o.tb[1]:0)},
    uSp:{value:sp.map(q=>new THREE.Vector4(q[0],q[1],q[2],q[3]))},uAx:{value:sp.map(q=>new THREE.Vector3(q[4],q[5],q[6]).normalize())}};
  return new THREE.ShaderMaterial({uniforms:U,skinning:!!skin,transparent:true,depthWrite:!glow&&!o.vague,side:glow?THREE.BackSide:THREE.FrontSide,blending:glow?THREE.AdditiveBlending:THREE.NormalBlending,
  vertexShader:ic151HandVS(),
  fragmentShader:glow
    ?'uniform float uT,uG,uA,uS,uFH,uV;uniform vec2 uTB;varying vec3 vW,vV,vL,vN,vD;'+IC151GLSL+'void main(){vec3 v=normalize(vV);float f=pow(1.-abs(dot(normalize(vN),v)),2.2),w=fbm(vL*uS*1.3+vec3(0.,uT*.12,uT*.05));'+
      'float fa=mix(1.,smoothstep(175.,70.,vW.y),uFH),tb=uTB.y>0.?mix(.25,1.,1.-smoothstep(uTB.x,uTB.y,vL.y)):1.,fb=uV>.5?smoothstep(-300.,-120.,vL.y):1.;gl_FragColor=vec4(mix(vec3(.16,.07,.34),vec3(.1,.22,.55),w)*f*(.35+1.1*w)*uG*uA*fa*tb*fb*(1.-uV*.3),1.);}'
    :'uniform float uT,uG,uA,uV,uS,uFH;uniform vec2 uTB;uniform vec4 uSp[3];uniform vec3 uAx[3];varying vec3 vW,vV,vL,vN,vD;'+IC151GLSL+
     'vec3 spiral(vec3 p,vec4 s,vec3 ax){vec3 d=p-s.xyz;d-=ax*dot(d,ax);float r=length(d)/s.w;if(r>1.5)return vec3(0.);vec3 b1=normalize(cross(ax,abs(ax.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.))),b2=cross(ax,b1);'+
       'float a=atan(dot(d,b2),dot(d,b1)),arm=pow(.5+.5*cos(2.*(a-3.4*log(r+.04))-uT*.22),4.),fl=exp(-r*2.1),cr=exp(-r*r*45.);'+
       'return vec3(.5,.26,.9)*arm*fl*1.15+vec3(.25,.5,1.)*arm*fl*smoothstep(.25,.9,r)*.7+vec3(1.,.82,.95)*cr*1.5+vec3(.6,.4,1.)*fl*.12;}'+
     'void main(){vec3 n=normalize(vN),v=normalize(vV);if(!gl_FrontFacing)n=-n;float f=1.-abs(dot(n,v));vec3 q=vL*uS;'+
     'vec3 w=vec3(fbm(q+vec3(0.,uT*.07,0.)),fbm(q+vec3(5.2,1.3,uT*.05)),fbm(q+vec3(1.7,9.2,-uT*.045)));float sm=fbm(q*1.6+w*2.5+vec3(0.,-uT*.09,0.));'+
     'vec3 c=vec3(.012,.008,.026);c+=mix(vec3(.24,.05,.4),vec3(.05,.15,.5),w.x)*smoothstep(.42,.84,sm)*.95;'+
     'c+=vec3(.68,.12,.44)*smoothstep(.6,.9,fbm(q*2.7+w*1.3))*.5;c+=vec3(.05,.42,.5)*smoothstep(.64,.92,fbm(q*2.1-w*1.7+3.3))*.35;'+
     'for(int i=0;i<3;i++)c+=spiral(vL,uSp[i],uAx[i]);'+
     'vec3 s1=vL*2.2,ci=floor(s1),fr=fract(s1)-.5,of=vec3(h3(ci+1.3),h3(ci+2.7),h3(ci+4.1))-.5;float r=h3(ci);c+=vec3(1.,.95,.9)*smoothstep(.07,.0,length(fr-of*.6))*step(.82,r)*(.5+.5*sin(uT*2.6+r*60.))*2.2;'+
     'vec3 s2=vL*6.;c+=vec3(.75,.8,1.)*step(.962,h3(floor(s2)))*smoothstep(.2,.0,length(fract(s2)-.5))*.8;'+
     'c+=vec3(.5,.36,1.)*vD.x*(.45+.55*sin(uT*1.7-vL.z*.35+vL.x*.2))*.75+vec3(.55,.45,1.)*vD.z*.25;c=mix(c,vec3(.14,.11,.24)+vec3(.5,.45,.8)*pow(f,2.)*.4,vD.y*.55);'+
     'vec3 L=normalize(vec3(.3,1.,.45)),hv=normalize(L+v);c+=vec3(.55,.5,.85)*pow(max(0.,dot(n,hv)),40.)*.3+vec3(.42,.26,.9)*pow(f,2.6)*.7;'+
     'float edge=smoothstep(.38,.97,f+(sm-.5)*.6),a=uA*(1.-edge*.92);a*=mix(1.,.3+.7*pow(f,1.4)*smoothstep(.25,.7,sm+.25),uV);'+
     'if(uTB.y>0.)a*=mix(.16,1.,1.-smoothstep(uTB.x,uTB.y,vL.y));if(uV>.5)a*=smoothstep(-300.,-120.,vL.y);'+
     'float fa=mix(1.,smoothstep(175.,70.,vW.y),uFH);gl_FragColor=vec4(c*uG,a*fa);}'})}
// the rest-pose skeleton (also gives the joint positions the surface is built around)
function ic151HandBones(){const P=new THREE.Bone(),F=[],B=[P];IC151FD.forEach(d=>{const root=new THREE.Bone();root.position.set(d.x,d.y||0,d.z==null?8.4:d.z);P.add(root);B.push(root);
    let par=root,r=d.r;const s=[];d.L.forEach((L,si)=>{const sg=new THREE.Bone();if(si)sg.position.z=d.L[si-1];par.add(sg);B.push(sg);s.push(sg);par=sg;r*=.86});
    const tip=new THREE.Object3D();tip.position.z=d.L[d.L.length-1]+r*.3;par.add(tip);root.rotation.set(0,d.sp,d.thumb?-.5:0);F.push({root,s,tip,d})});
  P.updateMatrixWorld(true);return {P,F,B}}
function ic151HandGeo(){if(IC151.HG)return IC151.HG;const T0=performance.now(),V=THREE.Vector3,{P,F,B}=ic151HandBones(),bi=new Map();B.forEach((b,i)=>bi.set(b,i));
  // chains: joint points, radii, directions, up vectors (rest pose)
  const CH=F.map(Fi=>{const d=Fi.d,J=Fi.s.map(b=>b.getWorldPosition(new V()));const last=Fi.s[Fi.s.length-1],end=new V(0,0,d.L[d.L.length-1]).applyMatrix4(last.matrixWorld);J.push(end);
    const dir=end.clone().sub(J[0]).normalize(),up=new V(0,1,0).applyQuaternion(Fi.root.getWorldQuaternion(new THREE.Quaternion())),R=[];let r=d.r;for(let i=0;i<J.length;i++){R.push(r);r*=.86}
    const S=[0];for(let i=1;i<J.length;i++)S.push(S[i-1]+J[i].distanceTo(J[i-1]));return {d,J,R,dir,up,side:new V().crossVectors(dir,up).normalize(),S,bones:Fi.s.map(b=>bi.get(b))}});
  const dir=new V(...IC151DIR).normalize(),wa=new V(0,.05,1.6),wb=new V(0,.2,.6).addScaledVector(dir,3.2);
  // primitives: [type, ...]  rc = round cone (a,b,r1,r2), el = ellipsoid (c,r)
  const rc=(a,b,r1,r2)=>{const bx=b.x-a.x,by=b.y-a.y,bz=b.z-a.z,l2=bx*bx+by*by+bz*bz,rr=r1-r2;return [a.x,a.y,a.z,bx,by,bz,l2,rr,l2-rr*rr,1/l2,r1,r2]};
  const RC=(q,px,py,pz)=>{const pax=px-q[0],pay=py-q[1],paz=pz-q[2],y=pax*q[3]+pay*q[4]+paz*q[5],z=y-q[6],l2=q[6],ux=pax*l2-q[3]*y,uy=pay*l2-q[4]*y,uz=paz*l2-q[5]*y,x2=ux*ux+uy*uy+uz*uz,y2=y*y*l2,z2=z*z*l2,rr=q[7],a2=q[8],il2=q[9],k=Math.sign(rr)*rr*rr*x2;
    if(Math.sign(z)*a2*z2>k)return Math.sqrt(x2+z2)*il2-q[11];if(Math.sign(y)*a2*y2<k)return Math.sqrt(x2+y2)*il2-q[10];return (Math.sqrt(x2*a2*il2)+y*rr)*il2-q[10]};
  const EL=(px,py,pz,cx,cy,cz,rx,ry,rz)=>{const ax=(px-cx)/rx,ay=(py-cy)/ry,az=(pz-cz)/rz,k0=Math.sqrt(ax*ax+ay*ay+az*az),k1=Math.sqrt(ax*ax/(rx*rx)+ay*ay/(ry*ry)+az*az/(rz*rz));return k1<1e-9?-Math.min(rx,ry,rz):k0*(k0-1)/k1};
  const SM=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25},SX=(a,b,k)=>-SM(-a,-b,k);
  const FG=CH.map(c=>{const segs=[];for(let i=0;i<c.J.length-1;i++)segs.push(rc(c.J[i],c.J[i+1],c.R[i],c.R[i+1]));
    const dl=c.d.L.length-1,nl=c.J[dl].clone().lerp(c.J[dl+1],.62).addScaledVector(c.up,c.R[dl+1]*.86);
    return {c,segs,joints:c.J.slice(1,-1).map((j,i)=>[j,c.R[i+1]*1.07]),nail:nl,nr:[c.R[dl+1]*.74,c.R[dl+1]*.2,c.d.L[dl]*.42],bound:rc(c.J[0],c.J[c.J.length-1],c.R[0]+.6,c.R[c.R.length-1]+.6)}});
  const TEN=CH.slice(0,4).map(c=>rc(new V(c.J[0].x*.45,1.05,1.3),new V(c.J[0].x,1.02,7.7),.26,.3));
  const VEIN=[[[-1.4,1.25,.4],[-.9,1.3,2.6],[-1.8,1.25,4.6]],[[1.2,1.25,.2],[1.6,1.3,2.4],[2.4,1.25,4.4]],[[.1,1.3,1.6],[.5,1.35,3.2],[.2,1.3,4.8]]].flatMap(q=>[rc(new V(...q[0]),new V(...q[1]),.15,.14),rc(new V(...q[1]),new V(...q[2]),.14,.12)]);
  const THB=rc(new V(2.0,-.35,.9),CH[4].J[0],1.25,1.12),WR=rc(new V(wa.x/1.45,wa.y,wa.z),new V(wb.x/1.45,wb.y,wb.z),2.0,2.0);
  const palm=(x,y,z)=>{const tp=.8+.2*Math.min(1,Math.max(0,z/8)),qx=Math.abs((x-.15)/tp)-3.3,qy=Math.abs(y)-.25,qz=Math.abs(z-4.55)-3.05;
    const o=Math.sqrt(Math.max(qx,0)**2+Math.max(qy,0)**2+Math.max(qz,0)**2)+Math.min(Math.max(qx,qy,qz),0)-1.0;return o*tp};
  const sdf=(x,y,z)=>{let d=palm(x,y,z);d=SM(d,EL(x,y,z,.1,.55,4.6,3.6,.85,3.6),.6);d=SX(d,-EL(x,y,z,.3,-1.75,4.9,2.4,.75,2.8),.6);
    d=SM(d,EL(x,y,z,3.3,-.55,3.0,1.7,1.05,2.5),.7);d=SM(d,EL(x,y,z,-3.2,-.45,3.8,1.25,.9,3.2),.6);d=SM(d,RC(WR,x/1.45,y,z),1.3);d=SM(d,RC(THB,x,y,z),.8);
    for(const q of TEN)d=SM(d,RC(q,x,y,z),.3);for(const q of VEIN)d=SM(d,RC(q,x,y,z),.16);
    for(const g of FG){if(RC(g.bound,x,y,z)>d+.8)continue;let e=1e9;for(const q of g.segs)e=SM(e,RC(q,x,y,z),.22);for(const [j,r] of g.joints)e=SM(e,Math.hypot(x-j.x,y-j.y,z-j.z)-r,.16);
      const k0=g.c.J[0];e=SM(e,Math.hypot(x-k0.x,y-(k0.y+.3),z-(k0.z-.15))-g.c.R[0]*.98,.4);
      const nl=g.nail,u=g.c.up,sd=g.c.side,dr=g.c.dir,ox=x-nl.x,oy=y-nl.y,oz=z-nl.z;e=SM(e,EL(ox*sd.x+oy*sd.y+oz*sd.z,ox*u.x+oy*u.y+oz*u.z,ox*dr.x+oy*dr.y+oz*dr.z,0,0,0,g.nr[0],g.nr[1],g.nr[2]),.06);
      d=SM(d,e,g.c.d.thumb?.9:.75)}return d};
  // grid: coarse pass first, the fine pass only evaluates near the surface
  const h=.15,X0=-6.4,Y0=-2.4,Z0=-4.6,NX=Math.ceil((11.8-X0)/h)+1,NY=Math.ceil((4.5-Y0)/h)+1,NZ=Math.ceil((20-Z0)/h)+1,G=new Float32Array(NX*NY*NZ),C=4;
  const CX=Math.ceil(NX/C)+1,CY=Math.ceil(NY/C)+1,CZ=Math.ceil(NZ/C)+1,CG=new Float32Array(CX*CY*CZ),cd=h*C*1.75;
  for(let k=0;k<CZ;k++)for(let j=0;j<CY;j++)for(let i=0;i<CX;i++)CG[i+CX*(j+CY*k)]=sdf(X0+i*C*h,Y0+j*C*h,Z0+k*C*h);
  for(let k=0;k<NZ;k++){const ck=Math.min(CZ-2,(k/C)|0);for(let j=0;j<NY;j++){const cj=Math.min(CY-2,(j/C)|0);for(let i=0;i<NX;i++){const ci=Math.min(CX-2,(i/C)|0);
    let mn=1e9,v0=0;for(let c=0;c<8;c++){const v=CG[(ci+(c&1))+CX*((cj+(c>>1&1))+CY*(ck+(c>>2&1)))];if(Math.abs(v)<mn){mn=Math.abs(v);v0=v}}
    G[i+NX*(j+NY*k)]=mn>cd?v0:sdf(X0+i*h,Y0+j*h,Z0+k*h)}}}
  // surface nets
  const VI=new Int32Array(NX*NY*NZ).fill(-1),pos=[],E=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],cv=new Float32Array(8);
  for(let k=0;k<NZ-1;k++)for(let j=0;j<NY-1;j++)for(let i=0;i<NX-1;i++){let m=0;for(let c=0;c<8;c++){const v=G[(i+(c&1))+NX*((j+(c>>1&1))+NY*(k+(c>>2&1)))];cv[c]=v;if(v<0)m|=1<<c}
    if(m==0||m==255)continue;let sx=0,sy=0,sz=0,n=0;for(const [a,b] of E){const va=cv[a],vb=cv[b];if((va<0)==(vb<0))continue;const t=va/(va-vb);
      sx+=(a&1)+((b&1)-(a&1))*t;sy+=(a>>1&1)+((b>>1&1)-(a>>1&1))*t;sz+=(a>>2&1)+((b>>2&1)-(a>>2&1))*t;n++}
    VI[i+NX*(j+NY*k)]=pos.length/3;pos.push(X0+(i+sx/n)*h,Y0+(j+sy/n)*h,Z0+(k+sz/n)*h)}
  const nv=pos.length/3,nor=new Float32Array(nv*3),e=.04,grad=(x,y,z)=>{const gx=sdf(x+e,y,z)-sdf(x-e,y,z),gy=sdf(x,y+e,z)-sdf(x,y-e,z),gz=sdf(x,y,z+e)-sdf(x,y,z-e),l=Math.hypot(gx,gy,gz)||1;return [gx/l,gy/l,gz/l]};
  for(let v=0;v<nv;v++){let x=pos[v*3],y=pos[v*3+1],z=pos[v*3+2];const g=grad(x,y,z),d=sdf(x,y,z);x-=g[0]*d;y-=g[1]*d;z-=g[2]*d;pos[v*3]=x;pos[v*3+1]=y;pos[v*3+2]=z;const g2=grad(x,y,z);nor[v*3]=g2[0];nor[v*3+1]=g2[1];nor[v*3+2]=g2[2]}
  const idx=[],quad=(a,b,c,d)=>{if(a<0||b<0||c<0||d<0)return;for(const [p,q,r] of [[a,b,c],[a,c,d]]){const ux=pos[q*3]-pos[p*3],uy=pos[q*3+1]-pos[p*3+1],uz=pos[q*3+2]-pos[p*3+2],wx=pos[r*3]-pos[p*3],wy=pos[r*3+1]-pos[p*3+1],wz=pos[r*3+2]-pos[p*3+2];
    const cx=uy*wz-uz*wy,cy=uz*wx-ux*wz,cz=ux*wy-uy*wx,s=cx*(nor[p*3]+nor[q*3]+nor[r*3])+cy*(nor[p*3+1]+nor[q*3+1]+nor[r*3+1])+cz*(nor[p*3+2]+nor[q*3+2]+nor[r*3+2]);if(s>=0)idx.push(p,q,r);else idx.push(p,r,q)}};
  const at=(i,j,k)=>VI[i+NX*(j+NY*k)];
  for(let k=1;k<NZ-1;k++)for(let j=1;j<NY-1;j++)for(let i=1;i<NX-1;i++){const g0=G[i+NX*(j+NY*k)]<0;
    if((G[i+1+NX*(j+NY*k)]<0)!=g0)quad(at(i,j-1,k-1),at(i,j,k-1),at(i,j,k),at(i,j-1,k));
    if((G[i+NX*(j+1+NY*k)]<0)!=g0)quad(at(i-1,j,k-1),at(i,j,k-1),at(i,j,k),at(i-1,j,k));
    if((G[i+NX*(j+NY*(k+1))]<0)!=g0)quad(at(i-1,j-1,k),at(i,j-1,k),at(i,j,k),at(i-1,j,k))}
  // skin weights (palm + the nearest finger's bones, blended along the finger) and detail marks (veins, nails, joint seams)
  const SI=new Uint16Array(nv*4),SW=new Float32Array(nv*4),AD=new Float32Array(nv*3),bw=.55,ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)},tmp=new V();
  for(let v=0;v<nv;v++){const x=pos[v*3],y=pos[v*3+1],z=pos[v*3+2];let bf=-1,bd=1e9,bs=0,bc=null;
    CH.forEach((c,fi)=>{for(let i=0;i<c.J.length-1;i++){const A=c.J[i],Bj=c.J[i+1],abx=Bj.x-A.x,aby=Bj.y-A.y,abz=Bj.z-A.z,L2=abx*abx+aby*aby+abz*abz;let t=((x-A.x)*abx+(y-A.y)*aby+(z-A.z)*abz)/L2;
      const tr=t;t=Math.max(0,Math.min(1,t));const qx=A.x+abx*t-x,qy=A.y+aby*t-y,qz=A.z+abz*t-z,dd=Math.sqrt(qx*qx+qy*qy+qz*qz)-c.R[i];if(dd<bd){bd=dd;bf=fi;bs=c.S[i]+(i==0?tr:t)*Math.sqrt(L2);bc=[A.x+abx*t,A.y+aby*t,A.z+abz*t]}}});
    const c=CH[bf],w=[1,0,0,0];let near=bd<.9&&bs>-bw;
    if(near){const n=c.bones.length,hs=[];for(let b=0;b<n;b++)hs.push(ss(c.S[b]-bw,c.S[b]+bw,bs));w[0]=1-hs[0];for(let b=0;b<n;b++)w[b+1]=hs[b]-(b+1<n?hs[b+1]:0)}
    SI[v*4]=0;for(let b=0;b<3;b++)SI[v*4+1+b]=c.bones[Math.min(b,c.bones.length-1)];if(c.bones.length<3)w[3]=0;const sw=w[0]+w[1]+w[2]+w[3];for(let b=0;b<4;b++)SW[v*4+b]=w[b]/sw;
    // marks
    let vein=0,nail=0,jt=0;if(near&&bs>.3){const ox=x-bc[0],oy=y-bc[1],oz=z-bc[2],u=ox*c.up.x+oy*c.up.y+oz*c.up.z,sd=ox*c.side.x+oy*c.side.y+oz*c.side.z;
      if(u>0)vein=Math.exp(-((sd/.085)**2))*.75*ss(.3,1.2,bs)*(1-ss(c.S[c.S.length-1]-1.6,c.S[c.S.length-1]-.8,bs));
      for(let b=1;b<c.J.length-1;b++){const ax=(bs-c.S[b])/.075;jt=Math.max(jt,Math.exp(-ax*ax)*ss(-.3*c.R[b],.2*c.R[b],u))}
      const g=FG[bf],nl=g.nail,qx=x-nl.x,qy=y-nl.y,qz=z-nl.z,dn=EL(qx*c.side.x+qy*c.side.y+qz*c.side.z,qx*c.up.x+qy*c.up.y+qz*c.up.z,qx*c.dir.x+qy*c.dir.y+qz*c.dir.z,0,0,0,g.nr[0],g.nr[1],g.nr[2]);nail=ss(.07,-.02,dn)}
    else{const kn=(bs+bw)/bw;jt=y>.6&&bs>-bw*2&&bs<0?Math.exp(-((kn+.6)**2)*4)*.6:0}
    for(const q of VEIN){vein=Math.max(vein,ss(.12,-.02,RC(q,x,y,z))*1.1)}
    AD[v*3]=vein;AD[v*3+1]=nail;AD[v*3+2]=jt}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  g.setAttribute('aD',new THREE.BufferAttribute(AD,3));g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));g.setAttribute('skinWeight',new THREE.BufferAttribute(SW,4));g.setIndex(idx);g.computeBoundingSphere();
  // the forearm: a smooth tube from inside the wrist up into the sky, a glowing cuff at the wrist, veins and muscle along it
  const fp=[],fn=[],fd=[],fi=[],NA=56,base=new V(0,.2,.6),ux=new V(1,0,0),uw=new V().crossVectors(dir,ux).negate().normalize(),SS=[];
  for(let q=1.5;q<4.4;q+=.12)SS.push(q);for(let q=4.4;q<=7.2;q+=.4)SS.push(q);
  SS.forEach((q,ri)=>{const w0=ss(4,28,q),cuff=ss(2.05,2.2,q)*(1-ss(3.75,3.9,q)),rim=Math.exp(-(((q-2.2)/.08)**2))+Math.exp(-(((q-3.75)/.08)**2)),mus=ss(6,12,q)*(1-ss(16,26,q));
    const rx=2.98+(4.4-2.98)*w0+q*.005+cuff*.22+rim*.08,ry=2.06+(4.4-2.06)*ss(3,30,q)+q*.005+cuff*.22+rim*.08;
    for(let a=0;a<=NA;a++){const th=a/NA*Math.PI*2,ca=Math.cos(th),sa=Math.sin(th),bul=mus*(.42*Math.max(0,Math.sin(th-.2))**2+.25*Math.max(0,Math.cos(th*2+1))),
      c=base.clone().addScaledVector(dir,q).addScaledVector(ux,ca*(rx+bul*.6)).addScaledVector(uw,sa*(ry+bul));fp.push(c.x,c.y,c.z);
      let vein=0;[[.7,.035],[1.7,-.028],[2.6,.02],[4.1,-.03]].forEach(([a0,k])=>{let dth=th-a0-k*q;dth=Math.atan2(Math.sin(dth),Math.cos(dth));vein=Math.max(vein,Math.exp(-((dth*(rx+ry)*.5/.11)**2))*ss(4.5,9,q)*(1-ss(60,110,q)))});
      const rune=cuff*(Math.sin(th*24)>.6?1:0)*(Math.abs(q-2.97)<.38?1:0);fd.push(Math.max(vein*.8,rune*.9),0,Math.max(rim,cuff*.18))}});
  for(let r=0;r<SS.length-1;r++)for(let a=0;a<NA;a++){const i0=r*(NA+1)+a,i1=i0+1,i2=i0+NA+1,i3=i2+1;fi.push(i0,i2,i1,i1,i2,i3)}
  const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(fp,3));fg.setAttribute('aD',new THREE.Float32BufferAttribute(fd,3));fg.setIndex(fi);fg.computeVertexNormals();
  {const nm=fg.attributes.normal.array,pp=fg.attributes.position.array;for(let v=0;v<nm.length;v+=3){const px=pp[v]-base.x,py=pp[v+1]-base.y,pz=pp[v+2]-base.z,q=px*dir.x+py*dir.y+pz*dir.z,rx=px-dir.x*q,ry=py-dir.y*q,rz=pz-dir.z*q;if(nm[v]*rx+nm[v+1]*ry+nm[v+2]*rz<0){nm[v]=-nm[v];nm[v+1]=-nm[v+1];nm[v+2]=-nm[v+2]}}}
  fg.computeBoundingSphere();
  IC151.HG={g,fg,dir,nv,nt:idx.length/3,ms:Math.round(performance.now()-T0)};return IC151.HG}
function ic151Hand(S){const HG=ic151HandGeo(),SPH=[[.3,1.4,4.4,3.4,0,1,0],[.2,-1.4,5.0,2.9,0,-1,0],[3.4,-.6,2.9,1.6,.4,-1,-.2]],M=ic151HandMat(false,true,{sp:SPH}),Gm=ic151HandMat(true,true),Mf=ic151HandMat(false,false,{sp:[[0,3.6,-1.6,2.6,0,.83,.55]]}),Gf=ic151HandMat(true,false);
  const H={g:new THREE.Group(),root:new THREE.Group(),f:[],mats:[M,Gm,Mf,Gf],dir:HG.dir};H.g.add(H.root);
  const {P,F,B}=ic151HandBones();H.root.add(P);H.f=F;H.g.updateMatrixWorld(true);
  const sk=new THREE.Skeleton(B),m=new THREE.SkinnedMesh(HG.g,M),gm=new THREE.SkinnedMesh(HG.g,Gm);H.root.add(m,gm);H.g.updateMatrixWorld(true);m.bind(sk);gm.bind(sk,m.bindMatrix);
  [m,gm].forEach(o=>{o.frustumCulled=false});m.castShadow=true;H.mesh=m;
  const fa=new THREE.Mesh(HG.fg,Mf),fg=new THREE.Mesh(HG.fg,Gf);fa.frustumCulled=fg.frustumCulled=false;H.root.add(fa,fg);
  // star motes trailing off the hand
  const N=260,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));H.mote={g,d:Array.from({length:N},(_,i)=>[ic151H(i*1.1),ic151H(i*2.3),ic151H(i*3.7),ic151H(i*4.9)]),
    m:new THREE.PointsMaterial({map:S.dot,size:.5,color:0xd8c8ff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})};
  H.mote.o=new THREE.Points(g,H.mote.m);H.mote.o.frustumCulled=false;
  H.light=new THREE.PointLight(0xa890ff,0,90,1);H.light.position.set(0,-4,6);H.root.add(H.light);
  {const N=320,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));const B=[];H.f.forEach(F=>{B.push(F.root,...F.s,F.tip)});B.push(H.root.children[0]);
    H.smoke={g,B,d:Array.from({length:N},(_,i)=>[(ic151H(i*1.7)*B.length)|0,ic151H(i*2.9)-.5,ic151H(i*3.3)-.5,ic151H(i*4.1)-.5,ic151H(i*5.3),.7+ic151H(i*6.1)*.9]),
      m:new THREE.PointsMaterial({map:S.dot,size:3.2,color:0x241438,transparent:true,opacity:.32,depthWrite:false,fog:false})};H.smoke.o=new THREE.Points(g,H.smoke.m);H.smoke.o.frustumCulled=false}
  return H}
// pose: k = 0 open … 1 the fitted grip (each finger's own bend, ic151HandFit), spread fans the fingers out (the tear)
function ic151HandPose(H,k,spread){H.f.forEach(F=>{const d=F.d,ga=F.ga==null?.22:F.ga,gc=F.gc==null?1:F.gc;
  if(d.thumb){const tc=.1+(ga-.1)*k,y=d.sp+((F.gy==null?d.sp:F.gy)-d.sp)*k+.3*spread;F.root.rotation.set(tc*.6,y,-.5);F.s[0].rotation.x=.55*tc;F.s[1].rotation.x=.75*tc;return}
  const a=ga*k,c=.12+(gc-.12)*k;F.root.rotation.set(a,d.sp*(1+spread*1.6),0);F.s[0].rotation.x=.78*c;F.s[1].rotation.x=1.0*c;F.s[2].rotation.x=.8*c})}
function ic151HandT(H,t){H.mats.forEach(m=>m.uniforms.uT.value=t)}
// fit the hand once: palm over the tear's centre, each finger bent so its tip plunges just under the ground on a ring
// around the rat (ring 3 of the plates), the index tip at the rat's angle so the plate it grabs walls him in
function ic151HandFit(S,H){const V=THREE.Vector3,sc=1.2;H.sc=sc;H.g.rotation.set(0,0,0);H.g.position.set(0,0,0);H.root.scale.setScalar(sc);
  const place=(h,p)=>{H.root.rotation.set(p,0,0);H.root.position.set(0,0,0);H.g.updateMatrixWorld(true);const pc=new V(0,0,4.6).applyMatrix4(H.root.matrixWorld);H.root.position.set(-pc.x,h-pc.y,-pc.z);H.g.updateMatrixWorld(true);return H.root.position.clone()};
  const pose=k=>ic151HandPoseF(H,[k,k,k,k,k],[k,k,k,k,k],[0,0,0,0,0]),w=new V(),j1=new V(),j2=new V();H.pI=.14;H.pG=.04;
  const fit=(F,k,cost,A,B,da,db,set)=>{let best=1e9,ba=A[0],bb=B[0];for(let a=A[0];a<=A[1];a+=da)for(let b=B[0];b<=B[1];b+=db){set(a,b);pose(k);F.root.updateMatrixWorld(true);const c=cost();if(c<best){best=c;ba=a;bb=b}}set(ba,bb);return best};
  const tipCost=(F,T,wy,extra)=>()=>{F.tip.getWorldPosition(w);let c=(w.x-T.x)**2+(w.z-T.z)**2+wy*(w.y-T.y)**2;return c+(extra?extra():0)};
  H.impI=place(4.6,H.pI);const dirs=H.f.map(F=>{const p=(F.d.thumb?F.root:F.root).getWorldPosition(new V());p.y=0;const r=p.length();return {u:p.normalize(),r}});
  H.f.forEach((F,i)=>{const {u,r}=dirs[i],T=u.clone().multiplyScalar(Math.max(5.4,Math.min(7,r+1.2))).setY(-.6),last=F.s[F.s.length-1];
    const down=()=>{last.getWorldPosition(j1);F.tip.getWorldPosition(j2);const dy=(j2.y-j1.y)/(j2.distanceTo(j1)||1);return 2*Math.max(0,dy+.75)**2};
    if(F.d.thumb)fit(F,1,tipCost(F,T,3,down),[0,1.8],[-.5,2.8],.05,.05,(a,b)=>{F.tI=a;F.yI=b});else fit(F,1,tipCost(F,T,3,()=>down()+.02*(F.aI*F.aI+F.cI*F.cI)),[-.6,1.6],[0,1.6],.05,.04,(a,b)=>{F.aI=a;F.cI=b})});
  H.impG=place(2.3,H.pG);
  H.f.forEach((F,i)=>{const {u}=dirs[i],T=u.clone().multiplyScalar(F.d.thumb?2.4:2.3).setY(F.d.thumb?-3.0:-3.4),mid=F.s[1];
    const wrap=()=>{mid.getWorldPosition(j1);const r=Math.hypot(j1.x,j1.z);return 3*Math.max(0,(F.d.thumb?4.2:4.4)-r)**2+Math.max(0,-1.2-j1.y)**2};
    if(F.d.thumb)fit(F,2,tipCost(F,T,2,wrap),[0,2.2],[-.6,3],.05,.05,(a,b)=>{F.tG=a;F.yG=b});else fit(F,2,tipCost(F,T,2,()=>wrap()+.01*(F.aG*F.aG+F.cG*F.cG)),[-.4,2.2],[.3,2.0],.05,.04,(a,b)=>{F.aG=a;F.cG=b})});
  H.impI=place(4.6,H.pI);pose(1);H.g.updateMatrixWorld(true);H.imp=H.impI;
  // turn so the pierce points keep clear of the rat's line
  const th=H.f.map(F=>{F.tip.getWorldPosition(w);return Math.atan2(w.z,w.x)}),thR=Math.atan2(1.1,5.6),ad=a=>Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));let bY=0,bv=-1;
  for(let Y=0;Y<6.283;Y+=.02){const m=Math.min(...th.map(a=>ad(a-Y-thR)));if(m>bv+1e-6){bv=m;bY=Y}}H.g.rotation.y=bY;H.yaw=bY;H.g.updateMatrixWorld(true)}

// ---------------- the arm ----------------
// the arm reaching down from the sky: one long tube from the hand's cuff up along the hand's own line, dissolving into smoke
function ic151Giant(S){const H=S.hand,G={g:new THREE.Group()};H.g.add(G.g);
  const tube=(L,r0,r1)=>{const g=new THREE.CylinderGeometry(1,1,L,44,40,true);g.translate(0,L/2,0);const a=g.attributes.position.array;for(let i=0;i<a.length;i+=3){const u=a[i+1]/L,r=r0+(r1-r0)*Math.pow(u,.9)+.9*Math.sin(Math.PI*Math.min(1,u*5))*(.6+.4*Math.max(0,a[i+2]));a[i]*=r;a[i+2]*=r}
    g.computeVertexNormals();g.setAttribute('aD',new THREE.Float32BufferAttribute(new Float32Array(a.length),3));return g};
  G.L=300;const geo=tube(G.L,3.05,9);G.arm=new THREE.Mesh(geo,ic151HandMat(false,false,{s:.06,fh:0,tb:[40,230],sp:[[0,40,6,6,0,0,1],[0,105,8,9,.3,0,1]]}));G.armG=new THREE.Mesh(geo,ic151HandMat(true,false,{s:.06,fh:0,push:1.2,tb:[40,230]}));
  [G.arm,G.armG].forEach(o=>{o.frustumCulled=false;G.g.add(o)});G.mats=[G.arm.material,G.armG.material];S.giant=G;return G}
function ic151GiantAt(S,t){const G=S.giant,H=S.hand,V=S.V;if(!G)return;const vis=t>14.2&&t<35;G.g.visible=vis;if(!vis)return;
  const q=new THREE.Quaternion().setFromEuler(H.root.rotation),W=new V(0,.2,.6).addScaledVector(H.dir,4.6).multiplyScalar(H.sc).applyQuaternion(q).add(H.root.position),fwd=H.dir.clone().applyQuaternion(q).normalize();
  [G.arm,G.armG].forEach(o=>{o.position.copy(W);o.quaternion.setFromUnitVectors(new V(0,1,0),fwd)});G.mats.forEach(m=>{m.uniforms.uT.value=t;m.uniforms.uA.value=1})}

// ---------------- the rat (a real, four-legged rat) ----------------
function ic151Rat(S,fur){const M=ic151Mat({roughness:.85}),G=()=>new THREE.Group(),FC=new THREE.Color(fur),BL=FC.clone().lerp(new THREE.Color(0xd8c8b8),.45).getHex(),PK=0xd8988e,FU=FC.getHex();
  const mesh=(list,par)=>{const k=ic151Kit();list.forEach(a=>k.add(a[0],a[1],a[2],a[3]==null?.05:a[3]));const m=new THREE.Mesh(k.geo(),M);m.castShadow=true;par.add(m);return m};
  const sph=(r,w,h)=>ic151Jit(new THREE.SphereGeometry(r,w||8,h||6),r*.12,r*100);
  const R={root:G(),hip:G(),head:G(),snout:G(),L:{},tail:[],M};R.root.rotation.order='YXZ';R.root.add(R.hip);R.hip.position.set(0,.13,-.09);
  mesh([[sph(.14),FU,ic151M(0,.035,.13,0,0,0,1,.85,1.55)],[sph(.125),FU,ic151M(0,.03,0,0,0,0,1.05,.95,1.1)],[sph(.1),FU,ic151M(0,.02,.26,-.2,0,0,1,.95,1.1)],
    [sph(.11),BL,ic151M(0,-.025,.13,0,0,0,.78,.6,1.35)],[sph(.08),FU,ic151M(0,.08,.05,0,0,0,1.1,.6,1.2)]],R.hip);
  R.hip.add(R.head);R.head.position.set(0,.06,.33);
  mesh([[sph(.082),FU,ic151M(0,.01,.035,0,0,0,1,.9,1.2)],[sph(.05),BL,ic151M(0,-.035,.06,0,0,0,1,.6,1.3)],
    [sph(.045),FU,ic151M(.06,.085,-.005,-.2,.5,.3,1,1,.3)],[sph(.045),FU,ic151M(-.06,.085,-.005,-.2,-.5,-.3,1,1,.3)],
    [sph(.033),PK,ic151M(.063,.088,.006,-.2,.5,.3,1,1,.22)],[sph(.033),PK,ic151M(-.063,.088,.006,-.2,-.5,-.3,1,1,.22)]],R.head);
  R.eyes=[1,-1].map(sd=>{const e=G();e.position.set(sd*.05,.03,.07);R.head.add(e);const b=mesh([[new THREE.SphereGeometry(.019,6,4),0x0c0808,null,0]],e),h=mesh([[new THREE.SphereGeometry(.006,4,3),0xffffff,ic151M(.008,.01,.014),0]],e);return {e,b,h}});
  R.eye=c=>R.eyes.forEach(o=>{o.e.scale.set(1,1-.88*c,1);o.e.rotation.z=(o.e.position.x>0?-1:1)*.25*c;o.h.visible=c<.5});
  R.head.add(R.snout);R.snout.position.set(0,-.005,.1);
  {const c=new THREE.ConeGeometry(.056,.12,7,1);c.rotateX(Math.PI/2);c.translate(0,0,.05);mesh([[ic151Jit(c,.008,3),FU],[new THREE.SphereGeometry(.018,6,4),PK,ic151M(0,.004,.112),0]],R.snout);
    const W=[];for(let s=-1;s<=1;s+=2)for(let i=0;i<3;i++)W.push(s*.03,0,.08,s*.16,.03-i*.025,.02+i*.02);const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(W,3));
    R.snout.add(new THREE.LineSegments(wg,new THREE.LineBasicMaterial({color:0xe8e0d8,transparent:true,opacity:.75})))}
  // legs: pivot → upper → lower → paw
  [['FL',.062,-.05,.25,.05,.038,0],['FR',-.062,-.05,.25,.05,.038,0],['HL',.078,-.02,.0,.065,.05,1],['HR',-.078,-.02,.0,.065,.05,1]].forEach(([n,x,y,z,u,l,hind])=>{
    const p=G();p.position.set(x,y,z);R.hip.add(p);const lo=G();lo.position.y=-u;p.add(lo);
    mesh([[new THREE.CylinderGeometry(.026,hind?.034:.022,u,6),FU,ic151M(0,-u/2,0)],hind?[sph(.055),FU,ic151M(0,-.005,-.01,0,0,0,.6,1,1)]:[sph(.028),FU,ic151M(0,0,0)]],p);
    mesh([[new THREE.CylinderGeometry(.014,.018,l,5),hind?FU:PK,ic151M(0,-l/2,hind?-.01:0,hind?.25:0,0,0)],[sph(.022),PK,ic151M(0,-l,hind?.02:.012,0,0,0,1,.45,hind?2:1.5)]],lo);
    const paw=G();paw.position.set(0,-l,.02);lo.add(paw);R.L[n]={p,lo,paw,u,l,hind:!!hind,x,y,z}});
  // tail: 12 links
  let par=R.hip;for(let i=0;i<12;i++){const g=G();g.position.z=i?-.042:-.13;g.position.y=i?0:.0;par.add(g);const r=.022*(1-i/13)+.004;
    const c=new THREE.CylinderGeometry(r*.85,r,.046,5);c.rotateX(Math.PI/2);c.translate(0,0,-.021);mesh([[c,i<1?FU:PK,null,.06]],g);R.tail.push(g);par=g}
  return R}
// pose: P = {ph gait phase, g gait 0..1, rear, hy, hp head yaw/pitch, sn sniff, cr crouch, tr tremble, hang, fl flail, curl, sp spasm}
function ic151RatPose(R,P,t){if(P.ik)return ic151RatPoseIK(R,P,t);const g=P.g||0,ph=P.ph||0,rear=P.rear||0,hang=P.hang||0,fl=P.fl||0,curl=P.curl||0,cr=P.cr||0,tr=P.tr||0,sp=P.sp||0,out=P.out||0;if(R.eye)R.eye(P.eye||0);
  const n=(a,b)=>Math.sin(t*a+b)*.6+Math.sin(t*a*1.7+b*2.1)*.4;
  R.hip.position.y=.13-cr*.045+Math.abs(Math.sin(ph))*.014*g+(tr?n(55,1)*.004*tr:0);R.hip.rotation.set(-rear*1.05+(P.hx||0)+sp*n(31,2)*.3,sp*n(27,5)*.3,(tr?n(47,3)*.03*tr:0)+sp*n(23,1)*.25);
  const legs={FL:0,FR:Math.PI,HL:Math.PI,HR:0};for(const k in legs){const L=R.L[k],f=ph+legs[k],hind=k[0]=='H';
    let ux=Math.sin(f)*.75*g,lx=Math.max(0,-Math.cos(f))*(hind?-.7:.7)*g;
    if(!hind){ux+=-rear*.5-hang*2.75+fl*n(17,f)*.9;lx+=rear*.6+hang*.25}else{ux+=rear*.35+hang*n(14,f)*.6+fl*n(15,f+1)*.9;lx+=-hang*.3}
    ux+=curl*(hind?-1.1:1.2)+sp*n(19,f*3)*.8;lx+=curl*(hind?1.4:-1.5);const sd=k[1]=='L'?1:-1,dr=Math.sin(t*.8+f*1.3)*.12*out;
    if(out){ux+=(hind?1.35:-1.45)*out+dr;lx+=(hind?.35:-.25)*out-dr*.5}L.p.rotation.x=ux;L.lo.rotation.x=lx;L.p.rotation.z=-sd*hang*.25+fl*n(13,f)*.3+sd*out*(hind?.85:1.0)+sd*dr*.6;L.p.scale.set(1,1+.45*out,1)}
  R.head.rotation.set((P.hp||0)+rear*.75+curl*.7+(P.sn||0)*Math.sin(t*9)*.06+sp*n(29,4)*.4,(P.hy||0)+sp*n(21,7)*.5,(P.hr||0));
  R.snout.rotation.x=(P.sn||0)*Math.sin(t*42)*.09;R.snout.scale.z=1+(P.sn||0)*Math.max(0,Math.sin(t*42))*.07;
  R.tail.forEach((s,i)=>{s.rotation.y=Math.sin(t*2.2-i*.5)*.16*(P.tw==null?1:P.tw)*(1-out*.75)+Math.sin(t*.6-i*.35)*.05*out+curl*.42+fl*n(9,i)*.3+(P.ty||0);s.rotation.x=(i<3?-.08:.04)*(1-out)+hang*(i<2?-.4:.05)+curl*.05+fl*n(11,i*.7)*.2})}

// legs on the ground: a distance-driven gait (trot when walking, bound when running) with planted feet, each leg a
// two-bone IK (elbows back, knees forward); the body bobs, sways and leans into turns, the head steadies, the tail lags
var IC151GO={trot:{FL:0,HR:0,FR:.5,HL:.5},bound:{FL:0,FR:.08,HL:.5,HR:.58}};
function ic151RatPoseIK(R,P,t){if(R.eye)R.eye(P.eye||0);const gp=P.gph||0,ga=P.gamp||0,bd=P.bound||0,rear=P.rear||0,cr=P.cr||0,tr=P.tr||0,turn=Math.max(-3,Math.min(3,P.turn||0)),T2=Math.PI*2;
  const jit=(a,b)=>Math.sin(t*a+b)*.6+Math.sin(t*a*1.7+b*2.1)*.4,bob=ga*(1-bd)*.007*(1-Math.cos(2*T2*gp))/2+ga*bd*.012*(1-Math.cos(T2*gp))/2;
  R.hip.position.set(0,.116-cr*.036+bob+(P.hop||0)+tr*jit(55,1)*.003,-.09);
  R.hip.rotation.set(-rear*1.05+bd*ga*.13*Math.sin(T2*gp)+(P.hx||0),ga*(1-bd)*.05*Math.sin(T2*gp)+tr*jit(43,2)*.02,-turn*.05+tr*jit(47,3)*.025);R.hip.updateMatrix();
  const HI=new THREE.Matrix4().copy(R.hip.matrix).invert(),O=bd>.5?IC151GO.bound:IC151GO.trot,stride=P.stride||.15,duty=P.duty||.6,lift=P.lift||.035,v=new THREE.Vector3();
  for(const k in R.L){const L=R.L[k],hind=L.hind;let ph=(gp+O[k])%1;if(ph<0)ph+=1;let dz=0,dy=0;
    if(ph<duty)dz=stride*(.5-ph/duty);else{const u=(ph-duty)/(1-duty);dz=stride*(-.5+ic151Sm(u));dy=lift*Math.sin(Math.PI*u)}
    // the foot's target in the rat's own frame, then in the hip's
    v.set(L.x*1.05,.014+(P.hop||0)+dy*ga,(hind?-.09-.005:-.09+.26)+dz*ga);
    if(!hind&&rear>0){const tk=new THREE.Vector3(L.x*.8,L.y-.035,L.z+.05).applyMatrix4(R.hip.matrix);v.lerp(tk,Math.min(1,rear*1.3))}
    v.applyMatrix4(HI);const dx=v.x-L.x,dyy=v.y-L.y,dzz=v.z-L.z,Dl=Math.hypot(dyy,dzz),u=L.u,l=L.l,D=Math.max(Math.abs(u-l)+1e-3,Math.min(u+l-1e-4,Dl)),phi=Math.atan2(-dzz,-dyy);
    const A=Math.acos(Math.max(-1,Math.min(1,(u*u+D*D-l*l)/(2*u*D)))),Bk=Math.acos(Math.max(-1,Math.min(1,(u*u+l*l-D*D)/(2*u*l))));
    L.p.rotation.set(hind?phi-A:phi+A,0,Math.asin(Math.max(-.5,Math.min(.5,dx/Math.max(.02,Math.hypot(dx,Dl))))));L.lo.rotation.x=hind?Math.PI-Bk:-(Math.PI-Bk);L.p.scale.set(1,1,1)}
  const sn=P.sn||0;R.head.rotation.set((P.hp||0)+rear*.75-bd*ga*.13*Math.sin(T2*gp)+sn*Math.sin(t*9)*.05+tr*jit(37,4)*.02,(P.hy||0)-ga*(1-bd)*.04*Math.sin(T2*gp)+turn*.06,0);
  R.snout.rotation.x=sn*Math.sin(t*42)*.09;R.snout.scale.z=1+sn*Math.max(0,Math.sin(t*42))*.07;
  const tw=P.tw==null?.6:P.tw,tk=P.tuck||0;R.tail.forEach((s,i)=>{s.rotation.y=Math.sin(t*2.2-i*.5)*.12*tw*(1-ga*.6)+ga*.12*Math.sin(T2*gp-i*.45)*(1-bd)-turn*.035*(i/6)+(P.ty||0);
    s.rotation.x=(i<3?-.08-ga*bd*.08:.04)+tk*(i<4?.16:-.02)+bd*ga*.05*Math.sin(T2*gp-i*.6)})}
// the rat's path through the opening (and the run, and the slide), sampled once: a smooth spline through the keys with
// eased stops; the heading follows the motion through a damped spring (or the idle facing when he stands); the gait
// phase advances with the distance actually walked, so the feet stay planted
function ic151RatTrack(S){const th=S.thR,cs=Math.cos(th),sn=Math.sin(th),IN=Math.atan2(-cs,-sn),OUT=Math.atan2(cs,sn),ad=a=>Math.atan2(Math.sin(a),Math.cos(a));
  const PK=[[5.8,11.4,1.35,0],[7.0,9.8,.8,0],[8.2,8.25,.6,0],[9.3,6.9,.3,0],[10.25,6.0,.1,1],[11.3,6.0,.1,1],[11.95,5.66,.16,1],[13.95,5.66,.16,1],[15.2,5.62,.14,1],[16.6,5.5,.12,1],[20.4,5.45,.12,1],
    [21.25,6.0,.32,0],[22.15,6.85,-.02,0],[23.05,7.6,.14,0],[23.65,7.92,.12,1]];
  const ev=t=>{if(t<=PK[0][0])return [PK[0][1],PK[0][2]];const n=PK.length;if(t>=PK[n-1][0])return [PK[n-1][1],PK[n-1][2]];let i=0;while(t>PK[i+1][0])i++;const a=PK[i],b=PK[i+1],h=b[0]-a[0],s=(t-a[0])/h,s2=s*s,s3=s2*s;
    const tg=(j,c)=>{const q=PK[j];if(q[3]||j==0||j==n-1)return 0;return (PK[j+1][c]-PK[j-1][c])/(PK[j+1][0]-PK[j-1][0])};
    return [1,2].map(c=>(2*s3-3*s2+1)*a[c]+(s3-2*s2+s)*tg(i,c)*h+(-2*s3+3*s2)*b[c]+(s3-s2)*tg(i+1,c)*h)};
  const slide=t=>{const sl=Math.pow(ic151K(t,23.7,25.45),2),rE=S.rEdgeR+.12;return [7.92-(7.92-rE)*sl,.12+Math.sin(t*5.3)*.04*sl]};
  const YK=[[5.8,0],[10.0,0],[10.4,-.15],[11.2,.3],[12.0,.2],[14.0,.35],[16.0,.4],[20.0,.4]],yI=t=>IN+ic151Kf(YK,t);
  const DT=1/120,T0=5.8,T1=25.45,N=Math.ceil((T1-T0)/DT)+1,A=new Float32Array(N*6);let yaw=yI(T0),yv=0,gph=0,lx=0,lz=0;
  for(let i=0;i<N;i++){const t=T0+i*DT,sl=t>=23.7,[r,lat]=sl?slide(t):ev(t),x=cs*r-sn*lat,z=sn*r+cs*lat;if(i==0){lx=x;lz=z}
    const vx=(x-lx)/DT,vz=(z-lz)/DT,spd=i?Math.hypot(vx,vz):0;lx=x;lz=z;let tg;
    if(sl)tg=OUT;else{const w=ic151Sm(Math.min(1,Math.max(0,(spd-.08)/.25)));tg=yI(t)+w*ad(Math.atan2(vx,vz)-yI(t))}
    yv+=(121*ad(tg-yaw)-2*.9*11*yv)*DT;yaw+=yv*DT;const stride=.085+.035*Math.min(spd,3);gph+=sl?9*DT:spd*DT/stride;A.set([r,lat,yaw,yv,sl?1.6:spd,gph],i*6)}
  S.rtrk={T0,DT,N,A}}
function ic151Kf(K,t){const n=K.length;if(t<=K[0][0])return K[0][1];if(t>=K[n-1][0])return K[n-1][1];let i=0;while(t>K[i+1][0])i++;const a=K[i],b=K[i+1];return a[1]+(b[1]-a[1])*ic151Sm((t-a[0])/(b[0]-a[0]))}
var IC151RK={sn:[[5.8,.35],[10.1,.4],[10.4,1],[11.2,1],[11.45,.3],[11.9,.4],[12.15,1],[13.3,1],[13.6,.3],[14.0,0]],
  hp:[[5.8,.12],[10.0,.15],[10.45,.42],[11.2,.42],[11.5,.1],[12.1,0],[13.3,-.1],[13.6,-.2],[14.2,-.75],[15.5,-.7],[16.5,-.55],[19.3,-.6],[19.6,-.2],[20.4,-.12],[23.6,-.15],[24.2,.15]],
  hy:[[5.8,0],[10.4,0],[10.8,.35],[11.2,-.3],[11.5,0],[12.35,.5],[12.85,-.5],[13.25,.2],[13.55,0],[14.5,.15],[16,.2],[19.4,.15],[20.3,0]],
  rear:[[11.95,0],[12.25,1],[13.15,1],[13.5,0],[14.45,0],[14.8,.6],[15.3,.6],[15.65,0]],
  cr:[[15.4,0],[16.6,.75],[19.3,.85],[19.4,1],[20.3,1],[20.6,.25],[23.6,.3],[24.2,.6]],
  tr:[[15.6,0],[16.5,.8],[19.4,1],[20.3,.4],[20.7,.15]],tw:[[5.8,.6],[15.3,.6],[16.2,.15],[20.3,.15],[20.8,1]],tuck:[[15.4,0],[16.4,1],[20.3,1],[20.8,0]]};

// ---------------- the core (where he is remade) ----------------
function ic151Core(S){const sc=S.cs=new THREE.Scene(),R=ic151Rng(4242);
  S.coreU={uT:{value:0},uB:{value:1}};
  const bg=new THREE.Mesh(new THREE.SphereGeometry(80,32,16),new THREE.ShaderMaterial({uniforms:S.coreU,side:THREE.BackSide,depthWrite:false,
    vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float uT,uB;varying vec3 vD;void main(){vec3 d=normalize(vD);float a=atan(d.z,d.x),e=d.y;float sw=.5+.5*sin(a*5.+e*7.+uT*.35)*sin(a*3.-uT*.2+e*4.);'+
      'vec3 c=mix(vec3(.30,.40,.66),vec3(.78,.86,.98),.35+.4*sw);c=mix(c,vec3(.16,.22,.44),smoothstep(.15,-.9,e));c=mix(c,vec3(.22,.24,.5),smoothstep(.3,1.,e)*.6);c+=vec3(.9,.95,1.)*pow(max(0.,1.-abs(e)),8.)*.25;gl_FragColor=vec4(c*uB,1.);}'}));sc.add(bg);
  S.cglow2=new THREE.Sprite(new THREE.SpriteMaterial({map:S.dot,color:0xdcecff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.4}));S.cglow2.scale.set(4.2,4.2,1);S.cglow2.position.set(0,0,-1.2);sc.add(S.cglow2);
  S.flash=new THREE.Sprite(new THREE.SpriteMaterial({map:S.dot,color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,opacity:0}));S.flash.renderOrder=20;sc.add(S.flash);
  S.halos=[];for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(.62+i*.22,.005,3,96),new THREE.MeshBasicMaterial({color:0xcfe2ff,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}));m.userData.a=[R()*3,R()*3,.1+R()*.2];sc.add(m);S.halos.push(m)}
  S.rip=[];for(let i=0;i<9;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(1,.02,4,48),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=Math.PI/2;sc.add(m);S.rip.push(m)}
  const N=900,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));S.cm={d:Array.from({length:N},()=>[R()*6.283,1+R()*9,(R()-.5)*8,R()*10,.3+R()]),g,m:new THREE.PointsMaterial({map:S.dot,size:.06,color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.9})};
  S.cm.o=new THREE.Points(g,S.cm.m);S.cm.o.frustumCulled=false;sc.add(S.cm.o);
  S.cAmb=new THREE.HemisphereLight(0xdce8ff,0x3a4a80,.7);sc.add(S.cAmb);S.cKey=new THREE.DirectionalLight(0xfff4e8,.85);S.cKey.position.set(1.5,3,2.5);sc.add(S.cKey);
  S.cPt=new THREE.PointLight(0xdfeeff,0,8,1.4);S.cPt.position.set(0,.2,.8);sc.add(S.cPt);
  // the open celestial palm far below him, cradling the light
  const H=S.hand2=ic151Hand(S);H.g.position.set(0,-7.5,-2);H.g.rotation.set(0,0,0);H.root.rotation.set(-.15,Math.PI,Math.PI);H.root.scale.setScalar(.75);H.root.position.set(0,0,3.6);ic151HandPose(H,.32,.15);sc.add(H.g)}

// ---------------- the upright rat (the game's own rat hero model, bare) ----------------
function ic151Hero(S){try{const D=BRD[1],L=(typeof hero!='undefined'&&hero.cls=='warrior'&&hero.look)||{};BR.bare=true;let h;
  try{h=buildHero();h.mdLook=Object.assign({skin:D.fur[0],eye:D.eye[0],build:1,height:1},L,{race:1});refreshGear(h,'warrior',{})}finally{BR.bare=false}
  h.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh)o.visible=false;if(o.isMesh)o.frustumCulled=false});
  // let the game's idle layers, tail and cape springs settle once, then keep that standing pose as the base
  for(let i=0;i<260;i++){try{animHero(900000+i*16,false,h)}catch(_){}}h.position.set(0,0,0);h.rotation.set(0,0,0);
  const B=h.bones||{},base={};for(const k in B){const o=B[k];base[k]=[o.rotation.x,o.rotation.y,o.rotation.z,o.position.x,o.position.y,o.position.z]}h.userData.base=base;return h}
  catch(e){console.warn('intro hero',e);return null}}
// the new body: crouched in the light, rises, looks at his new paw, then up. Pure function of t (offsets on the settled base).
function ic151HeroPose(Hh,t){const B=Hh.bones,base=Hh.userData.base;if(!B||!base)return;
  for(const k in base){const o=B[k],v=base[k];if(!o)continue;o.rotation.set(v[0],v[1],v[2]);o.position.set(v[3],v[4],v[5])}
  const A=(n,x,y,z)=>{const o=B[n];if(o){o.rotation.x+=x;o.rotation.y+=y;o.rotation.z+=z}},K=ic151K,Sm=ic151Sm,Io=ic151Io;
  const cr=1-Io(K(t,52.2,54.0)),lk=Sm(K(t,53.5,54.3))*(1-Sm(K(t,55.0,55.6))),up=Sm(K(t,55.0,55.7)),br=Math.sin(t*2.1),tw=K(t,51.9,52.5);
  const P=IC151.HP||{};const g=(k,d)=>P[k]==null?d:P[k];
  // crouch: hunched, knees bent, arms drawn in; trembling as the change settles
  A('spine',g('sp',.55)*cr+.02*br,0,0);A('chest',g('ch',.35)*cr+.015*br,0,(1-tw)*Math.sin(t*40)*.04);A('neck',g('nk',-.2)*cr,0,0);A('head',g('hd',-.15)*cr,0,0);
  A('lh0',g('th',-.9)*cr,0,0);A('rh0',g('th',-.9)*cr,0,0);A('lh1',g('kn',1.4)*cr,0,0);A('rh1',g('kn',1.4)*cr,0,0);A('lh2',g('an',-.5)*cr,0,0);A('rh2',g('an',-.5)*cr,0,0);
  A('aL0',g('ua',-.5)*cr,0,0);A('aR0',g('ua',-.5)*cr,0,0);A('aL1',g('el',1.1)*cr,0,0);A('aR1',g('el',1.1)*cr,0,0);
  // looks at his right paw: arm comes up, elbow bends, head turns down to it
  A('aR0',g('pr0x',-.6)*lk,g('pr0y',0)*lk,g('pr0z',-.5)*lk);A('aR1',g('pr1x',1.9)*lk,g('pr1y',0)*lk,0);A('aR2',g('pr2x',.3)*lk,g('pr2y',.9)*lk,0);
  A('head',g('lhx',.5)*lk-up*.12,g('lhy',.45)*lk,0);A('neck',g('lnx',.15)*lk,g('lny',.2)*lk,0);
  // tail and cape: a slow sway of our own (the springs are not run during the intro)
  for(let i=0;i<11;i++)A('tl'+i,0,Math.sin(t*1.6-i*.45)*.06,0);for(let i=0;i<3;i++)A('cp'+i,Math.sin(t*1.3-i*.6)*.03,0,0);if(IC151.HB)for(const n in IC151.HB){const v=IC151.HB[n];A(n,v[0],v[1],v[2])}}

// ---------------- build / time line ----------------
function ic151Build(W,Hh){const S={W,H:Hh};S.dot=ic151Dot();
  const rd=S.rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:!!IC151.cap});rd.setPixelRatio(IC151.cap?1:Math.min(devicePixelRatio||1,1.5));rd.setSize(W,Hh);
  rd.shadowMap.enabled=true;rd.shadowMap.type=THREE.PCFSoftShadowMap;rd.toneMapping=THREE.NoToneMapping; // the game's own colour pipeline
  S.sc=new THREE.Scene();S.cam=new THREE.PerspectiveCamera(45,W/Hh,.03,1100);
  ic151World(S);
  S.hand=ic151Hand(S);S.sc.add(S.hand.g,S.hand.mote.o,S.hand.smoke.o);ic151HandFit(S,S.hand);ic151Track(S.hand);
  // which plates the fingertips grab, and the rat's plate
  S.V=THREE.Vector3;S.tmp={m:new THREE.Matrix4(),m2:new THREE.Matrix4(),q:new THREE.Quaternion(),v:new THREE.Vector3(),v2:new THREE.Vector3()};
  S.hand.g.updateMatrixWorld(true);S.tip0=S.hand.f.map(F=>F.tip.matrixWorld.clone());
  {const A=S.tip0[0],ai=Math.atan2(A.elements[14],A.elements[12])+.62;ic151Trees(S,[[Math.cos(ai),Math.sin(ai),7]])}
  S.thR=Math.atan2(1.1,5.6);S.nin0=new THREE.Vector3(-Math.cos(S.thR),0,-Math.sin(S.thR));ic151Shatter(S);
  ic151Tear(S);
  ic151RatTrack(S);
  const fur=(typeof BRD!='undefined'&&BRD[1]&&BRD[1].fur[0])||'#5e5248';
  S.rat=ic151Rat(S,(typeof hero!='undefined'&&hero.cls=='warrior'&&hero.look&&hero.look.skin)||fur);S.sc.add(S.rat.root);
  // the lump of earth under his paws (falls with him), pebbles
  {const k=ic151Kit();k.add(ic151Jit(new THREE.DodecahedronGeometry(.13,0),.05,3),0x4a3424,ic151M(0,-.05,0,0,0,0,1.5,.8,1));k.add(ic151Jit(new THREE.DodecahedronGeometry(.07,0),.03,4),0x5a4030,ic151M(.14,-.03,.02));
    k.add(new THREE.ConeGeometry(.02,.15,3),0x5b7d36,ic151M(-.05,.04,0,.3,0,.2));S.lump=new THREE.Mesh(k.geo(),S.mat);S.lump.castShadow=true;S.sc.add(S.lump);
    const N=40,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));S.peb={g,m:new THREE.PointsMaterial({color:0x4a3a2a,size:.035,transparent:true,opacity:1})};S.peb.o=new THREE.Points(g,S.peb.m);S.peb.o.frustumCulled=false;S.sc.add(S.peb.o)}
  ic151Giant(S);ic151Core(S);S.hero=ic151Hero(S);if(S.hero){S.cs.add(S.hero);S.hero.visible=false}
  ic151PhysInit(S);if(IC151.cap)while(!ic151PhysRun(S,1e9));
  return S}
// the tear: grip/drag set-up and its effects (dirt mounds at the fingers, flying rocks, cracks across the meadow, dirt pouring
// off the lifted slabs). Everything is a function of t.
function ic151Tear(S){const V=THREE.Vector3,H=S.hand,R=ic151Rng(515);
  ic151HandAt(S,H,IC151G.g1);H.g.updateMatrixWorld(true);S.R1i=H.root.matrixWorld.clone().invert();
  const TP=S.tip0.map(m=>new V().setFromMatrixPosition(m)),ang=TP.map(p=>Math.atan2(p.z,p.x));
  // the lump of earth the fist closes round: soil, stones and roots under the centre slabs (it rises with the hand)
  {const core=S.cells.filter(c=>c.chunk&&c.grip<0),inC=(x,z)=>core.some(c=>{const p=c.pts,n=p.length;let ins=false;for(let a=0,b=n-1;a<n;b=a++){const pa=p[a],pb=p[b];if((pa[1]>z)!=(pb[1]>z)&&x<(pb[0]-pa[0])*(z-pa[1])/(pb[1]-pa[1])+pa[0])ins=!ins}return ins});
    const NA=40,RC=[];for(let a=0;a<NA;a++){const th=a/NA*6.283;let r=.2;while(r<7&&inC(Math.cos(th)*r,Math.sin(th)*r))r+=.05;RC.push(r-.15)}
    const LV=[[-2.2,.97],[-2.9,.93],[-3.7,.8],[-4.5,.6],[-5.2,.36],[-5.7,.12]],COL=[0x4a3424,0x3e2c1e,0x352619,0x2e2016,0x281c12,0x22180f],k=ic151Kit(),P=LV.map(([y,f],i)=>RC.map((r,a)=>{const th=a/NA*6.283,j=1+(ic151H(a*3.1+i*7.7)-.5)*.16;return [Math.cos(th)*r*f*j,y+(ic151H(a+i*13)-.5)*.35,Math.sin(th)*r*f*j]}));
    for(let i=0;i<LV.length-1;i++)for(let a=0;a<NA;a++){const b=(a+1)%NA,c=COL[i+(ic151H(a*1.3+i)<.2?1:0)];k.tri(P[i][a],P[i+1][b],P[i][b],c,.16);k.tri(P[i][a],P[i+1][a],P[i+1][b],c,.16)}
    const L=LV.length-1;for(let a=0;a<NA;a++)k.tri([0,-5.95,0],P[L][(a+1)%NA],P[L][a],COL[5],.12);
    for(let i=0;i<26;i++){const th=R()*6.283,lv=1+(R()*3|0),r=RC[(th/6.283*NA|0)%NA]*LV[lv][1],sz=.18+R()*.35;k.add(ic151Jit(new THREE.DodecahedronGeometry(sz,0),sz*.3,i),[0x6a655e,0x55504a,0x7a6a5a][i%3],ic151M(Math.cos(th)*r,LV[lv][0],Math.sin(th)*r,R()*3,R()*3,R()*3),.12)}
    for(let i=0;i<40;i++){const th=R()*6.283,lv=2+(R()*3|0),r=RC[(th/6.283*NA|0)%NA]*LV[lv][1]*.95,L2=.6+R()*1.8;k.add(new THREE.ConeGeometry(.05+R()*.05,L2,4,1),R()<.5?0x7a5a3a:0x5e4630,ic151M(Math.cos(th)*r,LV[lv][0]-L2*.4,Math.sin(th)*r,Math.PI+(R()-.5)*.9,R()*6,(R()-.5)*.9),.14)}
    const m=new THREE.Mesh(k.geo(),S.mat);m.matrixAutoUpdate=false;m.castShadow=true;S.sc.add(m);S.bulb={m,c:new V(0,0,0),bulb:true}}
  S.lift=S.cells.filter(c=>c.chunk).concat([S.bulb]);
  // dirt mounds heaped round each finger where it went in (they move with the plate it holds)
  S.mounds=TP.map((p,f)=>{const k=ic151Kit(),Rm=ic151Rng(90+f),y=ic151Y(p.x,p.z);for(let i=0;i<14;i++){const a=i/14*6.283+Rm()*.4,r=1.05+Rm()*.55,s=.22+Rm()*.3;
      k.add(ic151Jit(new THREE.DodecahedronGeometry(s,0),s*.3,i+f*20),[0x3d2c1e,0x4a3424,0x5a4030,0x33261a][i%4],ic151M(Math.cos(a)*r,s*.35,Math.sin(a)*r,Rm()*3,Rm()*3,Rm()*3,1,.6,1),.12)}
    for(let i=0;i<5;i++){const a=Rm()*6.283,r=1.3+Rm()*.5;k.add(new THREE.ConeGeometry(.12,.5,3),0x4f7a36,ic151M(Math.cos(a)*r,.35,Math.sin(a)*r,(Rm()-.5)*1.4,0,(Rm()-.5)*1.4))}
    k.add(ic151Jit(new THREE.CylinderGeometry(1.25,1.6,.3,14,1,true),.12,f),0x2e2018,ic151M(0,.1,0));
    const m=new THREE.Mesh(k.geo(),S.mat);m.matrixAutoUpdate=false;m.castShadow=true;m.receiveShadow=true;S.sc.add(m);return {m,p:new V(p.x,y,p.z),cell:ic151CellAt(S,p.x,p.z)}});
  // rocks thrown up by the impact, more as the slab tears
  {const N=170,g=ic151Jit(new THREE.DodecahedronGeometry(1,0),.3,7),mt=new THREE.MeshStandardMaterial({flatShading:true,roughness:.95}),im=new THREE.InstancedMesh(g,mt,N),C=new THREE.Color();
    S.rocks={m:im,d:[]};for(let i=0;i<N;i++){const f=i%5,b=i<110,o=TP[f],a=ang[f]+(R()-.5)*1.4,sp=b?2+R()*5:1+R()*3;
      S.rocks.d.push({o:new V(o.x,ic151Y(o.x,o.z)+.2,o.z),v:new V(Math.cos(a)*sp,b?4+R()*8:2+R()*4,Math.sin(a)*sp),t0:b?19.38+R()*.3:21.0+R()*1.4,s:.06+Math.pow(R(),2)*.32,sp:new V(R()*9,R()*9,R()*9)});
      im.setColorAt(i,C.set([0x4a3424,0x3a2a1c,0x6a655e,0x5a4030,0x4f6e34][(R()*5)|0]))}
    im.castShadow=true;im.frustumCulled=false;S.sc.add(im)}
  // cracks running out across the meadow from every finger: a dark split with a blue light in it, growing outward
  {const dk=[],gl=[],du=[],gu=[];TP.forEach((p,f)=>{const a0=ang[f],Rc=ic151Rng(300+f);
      const run=(x,z,a,len,w,u0,dep)=>{let u=u0;for(let n=0;n<len;n++){const L=.45+Rc()*.5,na=a+(Rc()-.5)*.9,nx=x+Math.cos(na)*L,nz=z+Math.sin(na)*L,ww=w*(1-n/len*.7);
        [[dk,du,ww],[gl,gu,ww*.38]].forEach(([P,U,W])=>{const px=-Math.sin(na)*W,pz=Math.cos(na)*W,y0=ic151Y(x,z)+.035,y1=ic151Y(nx,nz)+.035;
          P.push(x-px,y0,z-pz,x+px,y0,z+pz,nx+px,y1,nz+pz,x-px,y0,z-pz,nx+px,y1,nz+pz,nx-px,y1,nz-pz);U.push(u,u,u+L,u,u+L,u+L)});
        if(dep<1&&Rc()<.18)run(nx,nz,na+(Rc()<.5?.8:-.8),3+(Rc()*4|0),ww*.7,u+L,dep+1);x=nx;z=nz;u+=L;a=a*.6+na*.4}};
      const r0=ic151Rb(4,a0)-.2;run(Math.cos(a0)*r0,Math.sin(a0)*r0,a0,10+(Rc()*6|0),.3,0,0)});
    const mk=(P,U,glow)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('u',new THREE.Float32BufferAttribute(U,1));
      const m=new THREE.ShaderMaterial({uniforms:{uR:{value:0},uA:{value:1}},transparent:true,depthWrite:false,blending:glow?THREE.AdditiveBlending:THREE.NormalBlending,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide,
        vertexShader:'attribute float u;varying float vU;void main(){vU=u;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:glow?'uniform float uR,uA;varying float vU;void main(){float k=smoothstep(uR,uR-.4,vU);gl_FragColor=vec4(vec3(.5,.8,1.)*k*uA,1.);}':'uniform float uR;varying float vU;void main(){float k=smoothstep(uR,uR-.15,vU);gl_FragColor=vec4(.07,.045,.03,k*.95);}'});
      const o=new THREE.Mesh(g,m);o.frustumCulled=false;o.renderOrder=2;S.sc.add(o);return o};
    S.crk={d:mk(dk,du,false),g:mk(gl,gu,true)}}
  // dust and chips where falling pieces strike the walls and each other (the simulation records the impacts)
  {const mk=(N,sz,col,op,map)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));const m=new THREE.PointsMaterial({map:map||null,size:sz,color:col,transparent:true,opacity:op,depthWrite:false});
      const o=new THREE.Points(g,m);o.frustumCulled=false;S.sc.add(o);return {g,m,o,N}};S.efx={pu:mk(1800,1.0,0x7a6a56,.45,S.dot),ch:mk(1500,.09,0x2a1e14,1)}}
  // dirt pouring off the undersides of the lifted slabs
  {const N=700,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));const L=S.lift;
    S.pour={g,d:Array.from({length:N},()=>{const c=R()<.45?S.bulb:L[(R()*L.length)|0];return {c,p:c.bulb?new V((R()-.5)*5,-3.6-R()*2.2,(R()-.5)*5):new V(c.c.x+(R()-.5)*2.4,-1.4-R()*1.1,c.c.z+(R()-.5)*2.4),ph:R()*1.6,s:R()}}),
      m:new THREE.PointsMaterial({color:0x3a2a1c,size:.11,transparent:true,opacity:.95,depthWrite:false})};S.pour.o=new THREE.Points(g,S.pour.m);S.pour.o.frustumCulled=false;S.sc.add(S.pour.o)}}
function ic151TearAt(S,t){const V=S.V,T=S.tmp,q=new THREE.Quaternion(),e=new THREE.Euler(),sv=new V();
  S.mounds.forEach(M=>{const g=ic151Oc(ic151K(t,19.36,19.62)),m=M.m.matrix;if(M.cell)m.copy(M.cell.m.matrix);else m.identity();
    m.multiply(T.m2.compose(M.p,q.set(0,0,0,1),sv.set(.3+.7*g,.2+.8*g+Math.max(0,Math.sin(ic151K(t,19.36,19.7)*Math.PI))*.35,.3+.7*g)));M.m.matrixWorldNeedsUpdate=true;M.m.visible=t>19.35&&t<35});
  const R=S.rocks,on=t>19.35&&t<34;R.m.visible=on;if(on){R.d.forEach((d,i)=>{const u=t-d.t0;let s=d.s;const p=sv.copy(d.o);
      if(u<0){s=0}else{p.addScaledVector(d.v,u);p.y-=4.9*u*u;const rr=Math.hypot(p.x,p.z),gy=ic151Y(p.x,p.z);if(rr>ic151Rb(4,Math.atan2(p.z,p.x))&&p.y<gy){const vy=d.v.y,ul=(vy+Math.sqrt(vy*vy+19.6*(d.o.y-gy)))/9.8;p.copy(d.o).addScaledVector(d.v,ul);p.y=gy+s*.5;if(u-ul>1.5)s*=Math.max(0,1-(u-ul-1.5))}
        if(p.y<-60)s=0}
      T.m.compose(p,q.setFromEuler(e.set(d.sp.x*Math.max(u,0),d.sp.y*Math.max(u,0),d.sp.z*Math.max(u,0))),new V(s,s*.8,s));R.m.setMatrixAt(i,T.m)});R.m.instanceMatrix.needsUpdate=true}
  const cr=ic151K(t,19.4,21.6);S.crk.d.material.uniforms.uR.value=S.crk.g.material.uniforms.uR.value=Math.pow(cr,.7)*9;S.crk.g.material.uniforms.uA.value=1.4-ic151K(t,21,24)*1.05;S.crk.d.visible=S.crk.g.visible=t>19.38&&t<35;
  {const E=S.phys?S.phys.ev:[],pu=S.efx.pu.g.attributes.position.array,ch=S.efx.ch.g.attributes.position.array;pu.fill(-999);ch.fill(-999);
    E.forEach((e,i)=>{const u=t-e.t;if(u<0||u>1.9)return;for(let k=0;k<6;k++){const j=(i*6+k)*3;if(j>=pu.length)break;const h=ic151H(i*7.3+k*1.7),a=h*6.283,rr=(.4+1.7*Math.sqrt(u))*(.5+e.s);
        pu[j]=e.x+Math.cos(a)*rr;pu[j+1]=e.y+.2+.45*u+(ic151H(k+i)-.5)*.6;pu[j+2]=e.z+Math.sin(a)*rr}
      if(u<1.6)for(let k=0;k<5;k++){const j=(i*5+k)*3;if(j>=ch.length)break;const h=ic151H(i*3.1+k*5.3),a=h*6.283,sp=(2+3*ic151H(k*9.1+i))*(.5+e.s),vy=2+3*ic151H(k+i*2.2);
        ch[j]=e.x+Math.cos(a)*sp*u;ch[j+1]=e.y+vy*u-6.1*u*u;ch[j+2]=e.z+Math.sin(a)*sp*u}});
    S.efx.pu.g.attributes.position.needsUpdate=S.efx.ch.g.attributes.position.needsUpdate=true;S.efx.pu.o.visible=S.efx.ch.o.visible=t>19.35&&t<35}
  const pa=S.pour.g.attributes.position.array,po=t>21.0&&t<34;S.pour.o.visible=po;if(po)S.pour.d.forEach((d,i)=>{const c=d.c,brk=c.tr!=null&&t>c.tr+.3,u=(t+d.ph)%1.6,w=sv.copy(d.p).applyMatrix4(c.m.matrix);
    if(brk||u>1.5-d.s*.4){pa[i*3+1]=-999;return}pa[i*3]=w.x;pa[i*3+1]=w.y-4.9*u*u;pa[i*3+2]=w.z});S.pour.g.attributes.position.needsUpdate=true;S.pour.m.opacity=.95*ic151K(t,21,21.6)}
// piece transform at time t
function ic151ChunkM(S,t,out){if(t<=IC151G.g1)return out.makeTranslation(0,.16*ic151Sm(ic151K(t,IC151G.g0,IC151G.g1)),0);return out.copy(S.hand.root.matrixWorld).multiply(S.R1i).premultiply(S.tmp.m.makeTranslation(0,.16,0))}
function ic151CellM(S,c,t,out){if(c.chunk){if(c.tr!=null&&t>=c.tr)return ic151PhysM(S,c,t,out);return ic151ChunkM(S,t,out)}
  if(c===S.rcell)return ic151RatCellM(S,t,out);return ic151PhysM(S,c,t,out)}
// ---------------- the hand's motion ----------------
// A motion track computed once at 240 Hz: the main path is a smooth spline (arcing descent, a hover and wind-up, an
// accelerating strike, a hard stop as the fingers punch into the soil with a small recoil, then a heavy heave that dips,
// strains, breaks free, overshoots and settles); wrist angles and every finger joint follow their targets through damped
// springs, so they lag, overshoot and settle on their own (fingers cascade one after another, tips trail the knuckles).
var IC151G={imp:19.35,g0:19.62,g1:20.6,off:.6};
function ic151Herm(K,t){const n=K.length;if(t<=K[0][0])return K[0][1];if(t>=K[n-1][0])return K[n-1][1];let i=0;while(t>K[i+1][0])i++;
  const a=K[i],b=K[i+1],h=b[0]-a[0],s=(t-a[0])/h,s2=s*s,s3=s2*s;return (2*s3-3*s2+1)*a[1]+(s3-2*s2+s)*a[2]*h+(-2*s3+3*s2)*b[1]+(s3-s2)*b[2]*h}
function ic151Bump(t,a,m,b){return t<=a||t>=b?0:t<m?ic151Sm((t-a)/(m-a)):1-ic151Sm((t-m)/(b-m))}
function ic151S5(k){return k*k*k*(k*(k*6-15)+10)}
var IC151DK=[[14,330,-80],[16.6,70,-42],[17.7,33,-9],[18.25,30.8,0],[18.55,31.8,0],[19.35,0,-82]];
var IC151PK=[[14,.62,0],[16.8,.4,-.05],[17.7,.3,-.1],[18.25,.1,0],[18.5,.07,0],[18.95,.24,0],[19.35,.22,0],[20.9,.1,0]];
function ic151HandPrim(t,dirY){const K=ic151K,Sm=ic151Sm,imp=IC151G.imp;let d,lift;
  if(t<imp){d=ic151Herm(IC151DK,t);lift=.35*Math.sin(t*1.25)*(1-Sm(K(t,17.6,18.6)))}
  else{d=0;const v=-82*dirY,P=1.0,td=2*P/-v,u=t-imp;lift=u<td?v*u+(v*v/(2*P))*u*u/2:-.85-.15*Math.exp(-7*(u-td))*Math.cos(16*(u-td));
    lift+=-.3*ic151Bump(t,20.62,20.8,21.0)+.5*Sm(K(t,20.8,21.4))+7.0*ic151S5(K(t,21.1,22.6))+.35*ic151Bump(t,22.3,22.75,23.6)+3*Sm(K(t,23,33))}
  const lat=.9*Math.sin(t*.37+.5)*(1-Sm(K(t,17.6,19.0)))+.2*Math.sin(t*.8+1)*Sm(K(t,21.8,23.5));return [d,lift,lat]}
function ic151HandTgt(t,o){const K=ic151K,Sm=ic151Sm,imp=IC151G.imp;
  o[3]=ic151Herm(IC151PK,t)-.2-.12*Sm(K(t,21.2,22.8))+.04*Sm(K(t,24,33));
  o[4]=.07*Math.sin(t*.5+.4)*(1-Sm(K(t,17.8,19)))+.08*Sm(K(t,21.6,23.4))*(1-Sm(K(t,26,32)))+.03*Math.sin(t*.7)*Sm(K(t,23,26));
  o[5]=.07*Math.sin(t*.31+1.2)*(1-Sm(K(t,17.6,19)))+.04*Sm(K(t,21.5,23.5));
  for(let f=0;f<5;f++){const ord=f==4?1.5:f,cas=f==4?2:3-f;let k=.28+.07*Math.sin(t*1.15+f*.9);
    const op=Sm(K(t,16.7+ord*.07,17.9+ord*.07));k+=(-.08+.03*Math.sin(t*2+f)-k)*op;
    k-=.08*Sm(K(t,17.95,18.22))*(1-Sm(K(t,18.25+ord*.03,18.5)));const st=Sm(K(t,18.28+ord*.03,18.7+ord*.02));k+=(1-k)*st;
    if(t>imp)k+=.05*Sm(K(t,imp,imp+.05));k+=.95*ic151Io(K(t,19.62+cas*.1,20.45+cas*.1))+.03*Sm(K(t,21.4,22.4));
    k+=.012*Math.sin(t*27+f*2)*Sm(K(t,19.6,20))*(1-Sm(K(t,24,26)));o[6+f]=k;o[11+f]=k;
    let sp=.1+.05*Math.sin(t*.9+f);sp+=(.5-sp)*Sm(K(t,17.0+ord*.06,18.1+ord*.06));sp+=(.06-sp)*Sm(K(t,18.35,18.85));sp+=.04*Sm(K(t,21.35+ord*.07,23.4+ord*.07));o[16+f]=sp}}
function ic151Track(H){const DT=1/240,T0=14,T1=35.3,N=Math.ceil((T1-T0)/DT)+1,C=21,A=new Float32Array(N*C),o=new Float32Array(C),x=new Float32Array(C),v=new Float32Array(C),dy=H.dir.y;
  const SP=[];for(let c=0;c<C;c++)SP.push(c==3?[7,.55]:c==4?[6,.5]:c==5?[5,.6]:c>=6&&c<11?(c==10?[12,.5]:[15,.42]):c>=11&&c<16?(c==15?[9,.45]:[9,.38]):c>=16?[8,.62]:null);
  ic151HandTgt(T0,o);for(let c=3;c<C;c++)x[c]=o[c];
  for(let i=0;i<N;i++){const t=T0+i*DT;ic151HandTgt(t,o);const pr=ic151HandPrim(t,dy);x[0]=pr[0];x[1]=pr[1];x[2]=pr[2];
    for(let c=3;c<C;c++){const [w,z]=SP[c];v[c]+=(w*w*(o[c]-x[c])-2*z*w*v[c])*DT;x[c]+=v[c]*DT}A.set(x,i*C)}
  H.trk={T0,DT,N,C,A}}
function ic151HandP(H,t){const T=H.trk,f=Math.max(0,Math.min(T.N-1.001,(t-T.T0)/T.DT)),i=f|0,u=f-i,A=T.A,C=T.C,g=c=>A[i*C+c]*(1-u)+A[(i+1)*C+c]*u;
  const K=[],KD=[],SP=[];for(let q=0;q<5;q++){K.push(g(6+q));KD.push(g(11+q));SP.push(g(16+q))}
  const imp=IC151G.imp,Sm=ic151Sm,KK=ic151K,amp=(t>imp?.12*Math.exp(-(t-imp)*7):0)+.045*Sm(KK(t,19.7,20.2))*(1-Sm(KK(t,23.6,25)))+.02*Sm(KK(t,23.5,24))*(1-Sm(KK(t,30,33))),
    nz=(a,b,c)=>amp*(Math.sin(t*a)+.6*Math.sin(t*b+1)+.4*Math.sin(t*c+2))*.5;
  const gK=ic151Io(KK(t,IC151G.g0,IC151G.g1-.05)),base=H.impI.clone().lerp(H.impG,gK);
  return {pos:base.addScaledVector(H.dir,g(0)).add(new THREE.Vector3(g(2)+nz(31.7,47.3,67.1),g(1)+nz(29.3,43.9,71.3),nz(33.1,51.7,61.9))),pitch:H.pI+(H.pG-H.pI)*gK+g(3),roll:g(4),yaw:g(5),K,KD,SP}}
function ic151FingerAC(F,k){const d=F.d;if(d.thumb){const tI=F.tI==null?.5:F.tI,yI=F.yI==null?d.sp:F.yI,tG=F.tG==null?tI:F.tG,yG=F.yG==null?yI:F.yG;
    if(k<=1)return [.1+(tI-.1)*k,d.sp+(yI-d.sp)*k];const u=k-1;return [tI+(tG-tI)*u,yI+(yG-yI)*u]}
  const aI=F.aI==null?.2:F.aI,cI=F.cI==null?.9:F.cI,aG=F.aG==null?aI:F.aG,cG=F.cG==null?cI:F.cG;if(k<=1)return [aI*k,.12+(cI-.12)*k];const u=k-1;return [aI+(aG-aI)*u,cI+(cG-cI)*u]}
function ic151HandPoseF(H,K,KD,SP){H.f.forEach((F,i)=>{const d=F.d,s=SP[i],A=ic151FingerAC(F,K[i]),B=ic151FingerAC(F,KD[i]);
  if(d.thumb){F.root.rotation.set(A[0]*.6,A[1]+.3*s,-.5);F.s[0].rotation.x=.55*A[0];F.s[1].rotation.x=.75*B[0];return}
  F.root.rotation.set(A[0],d.sp*(1+s*1.6),0);F.s[0].rotation.x=.78*A[1];F.s[1].rotation.x=1.0*B[1];F.s[2].rotation.x=.8*B[1]})}
function ic151HandAt(S,H,t){const P=ic151HandP(H,t),imp=IC151G.imp;H.root.position.copy(P.pos);H.root.rotation.set(P.pitch,P.yaw,P.roll);ic151HandPoseF(H,P.K,P.KD,P.SP);
  const vis=t>14.2&&t<35;H.g.visible=vis;H.mote.o.visible=vis;H.light.intensity=vis?ic151K(t,16,19.4)*1.3:0;H.mats.forEach(m=>{m.uniforms.uG.value=1+(t>imp?Math.max(0,1-(t-imp)*1.5)*.35:0)})}
// the rat's world placement at time t (or null after he has fallen out of the world scene)
function ic151RatAt(S,t){const R=S.rat,T=S.tmp,V=S.V,th=S.thR,cs=Math.cos(th),sn=Math.sin(th),P={};
  const onR=(r,lat,yaw,hy)=>{const x=cs*r-sn*lat,z=sn*r+cs*lat;return {x,z,y:ic151Y(x,z),yaw}};
  let q,local=true;const IN=Math.atan2(-cs,-sn),OUT=Math.atan2(cs,sn); // yaw that faces the centre / away from it
  if(t<25.45){const T=S.rtrk,f=Math.max(0,Math.min(T.N-1.001,(t-T.T0)/T.DT)),i=f|0,u=f-i,g=c=>T.A[i*6+c]*(1-u)+T.A[(i+1)*6+c]*u,KF=IC151RK,kf=n=>ic151Kf(KF[n],t);
    q=onR(g(0),g(1),g(2));const spd=g(4),sl=t>=23.7;q.y+=t>19.38&&t<19.78?Math.sin(ic151K(t,19.38,19.78)*Math.PI)*.15:0;
    P.ik=1;P.gph=g(5);P.gamp=sl?1:ic151Sm(Math.min(1,spd/.35));P.bound=sl?.8:ic151Sm(ic151K(spd,1.4,2.0));P.stride=sl?.1:.085+.035*Math.min(spd,3);P.duty=.62-.18*P.bound;P.lift=.016+.012*P.bound;P.turn=g(3);
    P.sn=kf('sn');P.hp=kf('hp');P.hy=kf('hy');P.rear=kf('rear');P.cr=kf('cr');P.tr=kf('tr');P.tw=kf('tw');P.tuck=kf('tuck');if(sl){P.hx=-.15*ic151K(t,23,24.85)}}
  else local=false;
  const plate=S.cellM||(S.cellM=new THREE.Matrix4());ic151CellM(S,S.rcell,t,plate);
  // the inner edge under him (world)
  const re=S.rEdgeR,E=new V(cs*re,ic151Y(cs*re,sn*re),sn*re).applyMatrix4(plate),nin=new V(-cs,0,-sn);S.edge=E;S.nin=nin;
  if(local){const L=T.m.compose(new V(q.x,q.y,q.z),T.q.setFromEuler(new THREE.Euler(0,q.yaw,0)),new V(1,1,1)),W=T.m2.copy(plate).multiply(L);
    W.decompose(R.root.position,R.root.quaternion,R.root.scale);R.root.scale.setScalar(1);ic151RatPose(R,P,t);return true}
  // hanging from the edge, then falling
  const hangK=ic151Sm(ic151K(t,25.45,25.8)),drop=t>29.62?t-29.62:0,slip=ic151Sm(ic151K(t,27.4,27.6))*.06-ic151Sm(ic151K(t,27.8,28.3))*.05;
  P.hang=hangK*(1-ic151K(t,29.7,30.2)*.6);P.hp=(t>27.6&&t<29.65?.5:-.6)+Math.sin(t*3)*.1;P.hy=Math.sin(t*1.3)*.3;P.tw=.4;P.fl=drop?1:.25+ic151K(t,27.3,27.6)*(1-ic151K(t,28,28.6))*.8;P.tr=.6;P.ty=0;
  R.root.rotation.set(-Math.PI/2*hangK+(drop?drop*1.3:0),Math.atan2(-nin.x,-nin.z),drop?Math.sin(drop*2)*.6:0);R.root.position.set(0,0,0);R.root.scale.setScalar(1);ic151RatPose(R,P,t);
  R.root.updateMatrixWorld(true);const pw=R.L.FL.paw.getWorldPosition(new V()).add(R.L.FR.paw.getWorldPosition(new V())).multiplyScalar(.5);
  const tgt=E.clone().addScaledVector(nin,.03).add(new V(0,-.01-slip,0));
  if(hangK<1){const rh=S.rEdgeR+.12,L=T.m.compose(new V(cs*rh,ic151Y(cs*rh,sn*rh),sn*rh),T.q.setFromEuler(new THREE.Euler(0,OUT,0)),new V(1,1,1)),W=T.m2.copy(plate).multiply(L),p0=new V().setFromMatrixPosition(W);
    R.root.position.copy(p0.lerp(tgt.clone().sub(pw),hangK))}else R.root.position.copy(tgt).sub(pw);
  if(drop){R.root.position.y-=.5*7*drop*drop;R.root.position.addScaledVector(nin,Math.min(drop,4)*.7)}
  S.hangP=tgt;return true}
// camera at time t: {p, l, fov, roll}
function ic151Cam(S,t){const V=S.V,L=(a,b,k)=>a.clone().lerp(b,k);let p,l,fov=45,roll=0;
  const rp=S.rat.root.position;
  if(t<15){const k=ic151Io(ic151K(t,.3,7.4));p=L(new V(7.2,8.6,15.5),new V(6.4,.62,5.0),k);l=L(new V(-3,10.5,-30),new V(4.6,.25,1.2),k);
    if(t>6.5){const f=ic151Sm(ic151K(t,6.5,8.8)),f2=ic151Sm(ic151K(t,9,14));p=L(p,new V(6.25,.6,2.8),f2);l=L(l,rp.clone().add(new V(0,.16+ic151Sm(ic151K(t,13.5,14.5))*.3,0)),f*.85)}fov=46}
  else if(t<17.4){const k=ic151K(t,15,17.4);p=L(new V(15.5,1.5,17.5),new V(14.6,1.7,16.6),k);l=S.palmW.clone().lerp(new V(0,8,0),.25);fov=56}
  else if(t<18.95){const k=ic151K(t,17.4,19.4);p=L(new V(6.6,.2,2.1),new V(6.5,.19,2.02),k);const pw=S.palmW.clone();pw.y=Math.max(4,pw.y);l=pw.lerp(rp,.32);fov=66;roll=-.06}
  else if(t<20.6){const k=ic151Sm(ic151K(t,18.95,20.6)),A=S.tip0[0],B=S.tip0[1],ai=Math.atan2(A.elements[14],A.elements[12])+.62,r=19+k*1.8,c=new V(A.elements[12]+B.elements[12],0,A.elements[14]+B.elements[14]).multiplyScalar(.5);
    p=new V(Math.cos(ai)*r,2.6+k*.8,Math.sin(ai)*r);l=c.setY(2.6+k*.6);fov=52}
  else if(t<22.6){const k=ic151Sm(ic151K(t,20.6,22.6));p=L(new V(25,10.5,-9.5),new V(27.5,9.5,-10.5),k);l=L(new V(.5,2.6,0),new V(.8,8.5,.3),k);fov=52}
  else if(t<23.7){const k=ic151Sm(ic151K(t,22.6,23.7)),n=S.nin,tg=new V(-n.z,0,n.x);p=rp.clone().addScaledVector(n,-2.6+.5*k).addScaledVector(tg,.9).add(new V(0,.75+.1*k,0));l=rp.clone().addScaledVector(n,1.8).add(new V(0,-.35,0));fov=52}
  else if(t<25.45){const k=ic151Sm(ic151K(t,23.7,25.45)),n=S.nin,tg=new V(-n.z,0,n.x),c=rp.clone().lerp(S.edge,.25*k);p=c.clone().addScaledVector(tg,2.9-.4*k).addScaledVector(n,.5+.5*k).add(new V(0,1.0-.35*k,0));l=c.addScaledVector(n,-.3+.6*k).add(new V(0,.1-.2*k,0));fov=47}
  else if(t<27.6){const E=S.edge,n=S.nin,tg=new V(-n.z,0,n.x),k=ic151K(t,25.45,27.6);p=E.clone().addScaledVector(tg,1.25+k*.15).addScaledVector(n,.95).add(new V(0,-.25+k*.05,0));l=E.clone().addScaledVector(n,.05).add(new V(0,-.28,0));fov=42}
  else if(t<29.75){const E=S.edge,n=S.nin,k=ic151K(t,27.6,29.75);p=E.clone().addScaledVector(n,-.42+k*.06).add(new V(0,.95-k*.08,0));p.addScaledVector(new V(-n.z,0,n.x),.12);l=E.clone().addScaledVector(n,.3).add(new V(0,-1.1,0));fov=50}
  else{if(!S.anc){const th=S.thR,re=S.rEdgeR,M=ic151RatCellM(S,29.62,new THREE.Matrix4());S.anc=new V(Math.cos(th)*re,ic151Y(Math.cos(th)*re,Math.sin(th)*re),Math.sin(th)*re).applyMatrix4(M)}
    const n=S.nin,k=ic151Sm(ic151K(t,29.75,34.5));p=S.anc.clone().addScaledVector(n,.6+k*.9).add(new V(.05,.85-k*1.6,0));
    const rr=Math.hypot(p.x,p.z),lim=.62*ic151Rb(4,Math.atan2(p.z,p.x));if(rr>lim){p.x*=lim/rr;p.z*=lim/rr}l=rp.clone();fov=50+k*6}
  const shk=t>19.35&&t<30?(t<20.4?.12:.035)*(1-ic151K(t,19.35,21))+.02*ic151K(t,21,22)*(1-ic151K(t,28,30)):0;
  if(shk){p=p.clone().add(new V(Math.sin(t*61)*shk,Math.sin(t*53+1)*shk,Math.sin(t*47+2)*shk*.6))}
  return {p,l,fov,roll}}
// one frame of the cinematic: positions everything for time t and renders it
function ic151Frame(S,t){const V=S.V,cam=S.cam,core=t>=35;
  if(!core){
    // light: golden hour → the dark the hand brings → blue from below
    const dk=ic151Sm(ic151K(t,13.6,17.5)),bl=ic151K(t,20,24),C=(a,b,k)=>new THREE.Color(a).lerp(new THREE.Color(b),k);
    S.skyU.top.value.copy(C(0x5a86c8,0x140f2a,dk));S.skyU.mid.value.copy(C(0xf2c98a,0x3a2a5a,dk));S.skyU.bot.value.copy(C(0xb89a6a,0x1a1424,dk));S.skyU.sunK.value=1-dk;S.skyU.hole.value=ic151K(t,15,18.5)*(1-ic151K(t,26,30)*.5);
    S.sc.fog.color.copy(C(0xc8b88a,0x2a2448,dk).lerp(new THREE.Color(0x203a5a),bl*.5));S.sc.fog.density=.016-dk*.004;
    S.sun.intensity=1.35*(1-dk*.85);S.hemi.intensity=.75-dk*.35;S.hemi.color.copy(C(0xcfe0ff,0x8a90c8,dk));S.hemi.groundColor.copy(C(0x4a3a24,0x2a2a40,dk).lerp(new THREE.Color(0x2a5080),bl));
    S.moon.intensity=dk*.9;S.blue.intensity=ic151K(t,19.8,23)*1.5;S.blue2.intensity=ic151K(t,22,26)*2.2;S.cloudM.color.copy(C(0xffffff,0x8a86b8,dk));S.cloudM.emissive.copy(C(0x8a7a70,0x2e2a58,dk));
    S.shaftM.opacity=.14*(1-dk);S.shafts.visible=dk<1;S.shafts.children.forEach(s=>s.material.opacity=S.shaftM.opacity);
    S.pollen.m.opacity=.8*(1-dk);const pa=S.pollen.g.attributes.position.array;S.pollen.d.forEach((d,i)=>{pa[i*3]=d[0]+Math.sin(t*d[4]+d[3])*.6;pa[i*3+1]=d[1]+Math.sin(t*d[4]*.7+d[3]*2)*.4;pa[i*3+2]=d[2]+Math.cos(t*d[4]*.8+d[3])*.6});S.pollen.g.attributes.position.needsUpdate=true;
    // clouds part around the descending hand
    const op=ic151Sm(ic151K(t,14.4,18.4));S.clouds.forEach(c=>{const b=c.userData.b,h=Math.hypot(b.x-0,b.z+30);c.position.set(b.x+Math.sin(t*.03+b.z)*2,b.y,b.z);if(h<90){const s=(90-h)/90*op*40;c.position.x+=(b.x)/(h+1)*s;c.position.z+=(b.z+30)/(h+1)*s}});
    ic151HandAt(S,S.hand,t);ic151HandT(S.hand,t);ic151GiantAt(S,t);S.hand.g.updateMatrixWorld(true);S.palmW=new V(0,0,4.6).applyMatrix4(S.hand.root.matrixWorld);
    S.cells.forEach(c=>{ic151CellM(S,c,t,c.m.matrix);c.m.matrixWorldNeedsUpdate=true;c.m.visible=c.c.clone().applyMatrix4(c.m.matrix).y>-90});
    ic151ChunkM(S,t,S.bulb.m.matrix);S.bulb.m.matrixWorldNeedsUpdate=true;S.bulb.m.visible=t>19.35&&t<35;ic151TearAt(S,t);
    S.crackU.uR.value=ic151K(t,19.45,21.2)*13;S.crackU.uA.value=ic151K(t,19.5,19.8)*(1-ic151K(t,21.4,22.4))*1.6;S.cracks.visible=t>19.4&&t<22.5;
    // dust, rising light, hand motes
    const da=S.dust.g.attributes.position.array,tp=S.tip0;S.dust.d.forEach((d,i)=>{const p=new V().setFromMatrixPosition(tp[d.k]);const e=t-d.t0;if(e<0||e>4){da[i*3+1]=-999;return}
      da[i*3]=p.x+d.v[0]*e;da[i*3+1]=Math.max(-.1,.2+d.v[1]*e-4.9*e*e*.6);da[i*3+2]=p.z+d.v[2]*e});S.dust.g.attributes.position.needsUpdate=true;S.dust.m.opacity=.75*(1-ic151K(t,23,25.5));S.dust.o.visible=t>19.4&&t<25.6;
    const ra=S.rise.g.attributes.position.array;S.rise.d.forEach((d,i)=>{const y=-60+((d[2]+t*d[3]*4)%64);ra[i*3]=Math.cos(d[0]+t*.1)*d[1];ra[i*3+1]=y;ra[i*3+2]=Math.sin(d[0]+t*.1)*d[1]});S.rise.g.attributes.position.needsUpdate=true;S.rise.m.opacity=ic151K(t,21.5,24)*.9;
    const H=S.hand,ma=H.mote.g.attributes.position.array,pc=new V(0,0,4.6).applyMatrix4(H.root.matrixWorld);H.mote.d.forEach((d,i)=>{const e=(t*.25+d[3])%1;ma[i*3]=pc.x+(d[0]-.5)*16*H.sc+Math.sin(t+d[1]*9)*2;ma[i*3+1]=pc.y+8*H.sc*(d[1]-.2)+e*14;ma[i*3+2]=pc.z+(d[2]-.5)*16*H.sc});H.mote.g.attributes.position.needsUpdate=true;H.mote.m.opacity=.6*(1-ic151K(t,30,34));
    {const Sm=H.smoke,sa=Sm.g.attributes.position.array,wp=new V();Sm.o.visible=H.g.visible;if(Sm.o.visible)Sm.d.forEach((d,i)=>{const age=(t*.45/d[5]+d[4])%1;Sm.B[d[0]].getWorldPosition(wp);
      const sw=age*6.283*.5+i;sa[i*3]=wp.x+d[1]*3+Math.sin(sw)*age*3;sa[i*3+1]=wp.y+d[2]*2+age*age*9;sa[i*3+2]=wp.z+d[3]*3+Math.cos(sw)*age*3});Sm.g.attributes.position.needsUpdate=true;Sm.m.opacity=.32*ic151K(t,14.5,16)*(1-ic151K(t,31,34))}
    // the rat, the lump under his paws, pebbles
    if(S.rat.root.parent!==S.sc)S.sc.add(S.rat.root);ic151RatAt(S,t);S.rat.root.visible=t>6&&t<34.8;
    const E=S.edge,n=S.nin;if(t<29.62){S.lump.position.copy(E).addScaledVector(n,-.02);S.lump.rotation.set(0,Math.atan2(n.x,n.z),0)}else{const d=t-29.62;S.lump.position.copy(S.hangP||E).add(new V(0,-.5*7.6*d*d,0)).addScaledVector(n,Math.min(d,4)*.68);S.lump.rotation.set(d*2,d,d*1.5)}
    S.lump.visible=t>22&&t<33;
    const pb=S.peb.g.attributes.position.array;for(let i=0;i<40;i++){const t0=25.6+ic151H(i*3.3)*4.6+(i%3?0:1.7),e=t-t0;if(e<0||e>2.5){pb[i*3+1]=-999;continue}
      pb[i*3]=E.x+n.x*.05+(ic151H(i*7.1)-.5)*.3;pb[i*3+1]=E.y-.02-4.9*e*e;pb[i*3+2]=E.z+n.z*.05+(ic151H(i*5.7)-.5)*.3}S.peb.g.attributes.position.needsUpdate=true;
    S.cglow.material.opacity=.9*ic151K(t,21,24)+ic151K(t,31,34.5)*.6;
    const c=ic151Cam(S,t);cam.position.copy(c.p);cam.up.set(Math.sin(c.roll),Math.cos(c.roll),0);cam.lookAt(c.l);cam.fov=c.fov;cam.near=t>25.4&&t<30?.02:.05;cam.updateProjectionMatrix();
    S.sky.position.copy(cam.position);S.rd.render(S.sc,cam);return}
  // ---- the core ----
  const R=S.rat;if(R.root.parent!==S.cs){S.cs.add(R.root)}
  S.coreU.uT.value=t;S.coreU.uB.value=1+ic151K(t,47,51.9)*.3-ic151K(t,52,53.5)*.15;ic151HandT(S.hand2,t);
  const jolt=[48.2,48.75,49.2,49.6,49.95,50.25,50.55,50.8,51.02,51.22],jk=jolt.reduce((s,j)=>s+(t>j?Math.exp(-(t-j)*9):0),0);
  const sq=ic151K(t,48,51.4),swap=t>=51.9;
  if(!swap){const bob=Math.sin(t*.7)*.04,P={out:1-.35*ic151Sm(sq),eye:1,tw:.2,hp:.08+Math.sin(t*.5)*.05,sp:Math.min(1.2,jk*.9)*sq,rear:ic151Sm(ic151K(t,50,51.4))*.9,hx:0};
    R.root.visible=true;R.root.position.set(0,bob-.1+P.rear*.05,0);const ca=t<48?.7-ic151Sm(ic151K(t,35,48))*.9:-.2+ic151K(t,48,51.9)*.15;R.root.rotation.set(.12+Math.sin(t*.45)*.06,ca+1.0+Math.sin(t*.21)*.12+(jk*sq*.6),-.32*(1-sq)+Math.sin(t*.37)*.08+jk*sq*.3);const g=1+ic151K(t,50,51.6)*.55+jk*sq*.08;R.root.scale.set(g,g*(1+ic151K(t,50.2,51.6)*.3),g);ic151RatPose(R,P,t)}
  else R.root.visible=false;
  const Hh=S.hero;if(Hh){Hh.visible=swap;if(swap){const k=ic151Io(ic151K(t,52.2,54.0)),cr=1-k;ic151HeroPose(Hh,t);Hh.position.set(0,-.62-cr*.1,0);Hh.rotation.set(0,.55-k*.35,0);Hh.updateMatrixWorld(true)}}
  const fl=ic151K(t,51.3,51.9)*(1-ic151K(t,52.0,53.3));S.flash.material.opacity=fl;S.flash.scale.setScalar(.5+fl*7);S.flash.position.set(0,.1,0);
  S.cPt.intensity=1.2+jk*sq*3+fl*4;S.cglow2.material.opacity=.38+ic151K(t,47,51.5)*.3-ic151K(t,53,55)*.15;
  S.halos.forEach((h,i)=>{const a=h.userData.a;h.rotation.set(a[0]+t*a[2],a[1]+t*a[2]*.7,0);h.scale.setScalar(1+ic151K(t,51.6,53)*.5);h.material.opacity=.22-ic151K(t,48,50)*.08+ic151K(t,52,53)*.12});
  S.rip.forEach((r,i)=>{const j=jolt[i]||99,e=t-j;r.visible=e>0&&e<1.2;if(r.visible){r.scale.setScalar(.3+e*2.4);r.material.opacity=(1-e/1.2)*.7;r.position.y=-.05}});
  const cm=S.cm.g.attributes.position.array,pull=1+ic151K(t,48,51.5)*1.5;S.cm.d.forEach((d,i)=>{const e=((t*.08*d[4]*pull)+d[3]/10)%1,r=d[1]*(1-e)+.25,a=d[0]+t*.15*d[4]+e*2;cm[i*3]=Math.cos(a)*r;cm[i*3+1]=d[2]*(1-e)*.6;cm[i*3+2]=Math.sin(a)*r});S.cm.g.attributes.position.needsUpdate=true;
  let p,l=new V(0,0,0),fov=40;
  if(t<48){const k=ic151Sm(ic151K(t,35,48)),a=.7-k*.9,r=2.6-k*1.05;p=new V(Math.sin(a)*r,-.42+k*.18+Math.sin(t*.3)*.05,Math.cos(a)*r);l=new V(0,-.02,0)}
  else if(t<51.9){const k=ic151K(t,48,51.9),a=-.2+k*.15,r=1.55-k*.15;p=new V(Math.sin(a)*r+Math.sin(t*31)*.006*jk,.18,Math.cos(a)*r);l=new V(0,.05+k*.1,0)}
  else{const k=ic151Io(ic151K(t,51.9,55.4));p=new V(.45+k*.35,-.5+k*.05,2.3+k*.7);l=new V(0,.1+k*.05,0);fov=40}
  cam.position.copy(p);cam.up.set(0,1,0);cam.lookAt(l);cam.fov=fov;cam.near=.03;cam.updateProjectionMatrix();S.rd.render(S.cs,cam)}

// ---------------- page layer: canvas, letterbox, subtitles, fades, skip ----------------
function ic151Css(){if(document.getElementById('ic151css'))return;const s=document.createElement('style');s.id='ic151css';s.textContent=
  '#ic151{position:fixed;inset:0;z-index:2147483000;background:#000;overflow:hidden;cursor:none;user-select:none}#ic151 canvas{position:absolute;inset:0;width:100%!important;height:100%!important;display:block}'+
  '#ic151 .lb{position:absolute;left:0;right:0;height:0;background:#000;z-index:3;pointer-events:none}#ic151 .lb.t{top:0}#ic151 .lb.b{bottom:0}'+
  '#ic151 .fd{position:absolute;inset:0;pointer-events:none;z-index:4;opacity:0}#ic151 .fw{background:radial-gradient(circle at 50% 50%,#fff 0%,#f2f8ff 55%,#dfeaff 100%)}#ic151 .fk{background:#000}'+
  '#ic151 .sub{position:absolute;left:6%;right:6%;bottom:17vh;text-align:center;z-index:5;pointer-events:none;font-family:"IM Fell English SC","Cinzel Decorative",Georgia,serif;font-size:clamp(20px,3.2vw,44px);letter-spacing:.06em;color:#ffffff;line-height:1.2}'+
  '#ic151 .sub span{display:inline-block;white-space:pre;text-shadow:0 0 3px rgba(10,16,50,.95),0 0 14px rgba(14,24,70,.85),-2px 0 rgba(90,200,255,.6),2px 0 rgba(255,120,220,.5)}'+
  '#ic151 .skip{position:absolute;right:22px;bottom:calc(11vh + 14px);z-index:6;cursor:pointer;background:rgba(10,8,16,.45);color:#e8e0d0;border:1px solid rgba(232,224,208,.35);border-radius:4px;font:600 13px/1 "Cinzel Decorative",Georgia,serif;letter-spacing:.08em;padding:8px 14px;opacity:.7}'+
  '#ic151 .skip:hover{opacity:1;background:rgba(30,24,40,.7)}#ic151.rv{background:transparent;cursor:default}#ic151.rv canvas,#ic151.rv .skip{display:none}';document.head.appendChild(s)}
function ic151Dom(S,t){const D=S.dom;if(!D)return;const lb=(11*(1-ic151Sm(ic151K(t,IC151.lbA||56.6,IC151.lbB||58.4))))+'vh';D.lt.style.height=lb;D.lb.style.height=lb;
  const w=Math.max(ic151K(t,34.0,35.0)*(1-ic151K(t,35.05,36.4)),ic151K(t,51.4,51.85)*.92*(1-ic151K(t,51.9,52.8)),ic151K(t,54.6,55.7)*(1-ic151K(t,56.0,58.9)));D.fw.style.opacity=w.toFixed(3);
  D.fk.style.opacity=(1-ic151K(t,0,1.8)+ (t>14.93&&t<15.0?1:0)).toFixed(3);
  const rv=t>=IC151.cut;if(D.rv!==rv){D.rv=rv;D.el.classList.toggle('rv',rv);S.rd.domElement.style.display=rv?'none':'block';D.skip.style.visibility=rv?'hidden':'';D.el.style.background=rv?'transparent':'#000'}
  if(typeof ren!='undefined'&&ren.domElement){const g=ren.domElement;g.style.transition='none';if(rv&&t<59.3){const k=ic151Oc(ic151K(t,56.0,59.2));g.style.filter='blur('+((1-k)*14).toFixed(2)+'px) brightness('+(1+(1-k)*.9).toFixed(3)+') saturate('+(.6+k*.4).toFixed(3)+')'}else g.style.filter=''}
  // subtitles: letters drift in out of a blur, the line breathes and glitches like a voice through deep water
  const L=IC151.lines.find(x=>t>=x.a-.1&&t<x.b+.6);if(L!==D.cur){D.cur=L;D.sub.innerHTML='';if(L){D.sp=[];L.s.split(/( )/).forEach(w=>{if(!w)return;let box=D.sub;if(w!==' '){box=document.createElement('span');box.className='w';D.sub.appendChild(box)}for(const ch of w){const e=document.createElement('span');e.textContent=ch;box.appendChild(e);D.sp.push(e)}})}}
  if(L){const out=ic151K(t,L.b,L.b+.6);D.sp.forEach((e,i)=>{const k=ic151K(t,L.a+i*.045,L.a+i*.045+.55),fr=Math.floor(t*14),gl=ic151H(fr*1.7+i*3.1)>.93?1:0,jx=(ic151H(fr+i*.7)-.5)*2.4*(1+gl*3),jy=(ic151H(fr*1.3+i)-.5)*1.6;
    e.style.opacity=(k*(1-out)*(.85+.15*Math.sin(t*7+i))).toFixed(3);e.style.filter='blur('+((1-k)*7+out*6+gl*1.5).toFixed(2)+'px)';e.style.transform='translate('+jx.toFixed(2)+'px,'+(jy+(1-k)*8).toFixed(2)+'px) scale('+(1+(1-k)*.25).toFixed(3)+')'})}}
function ic151Layer(S){ic151Css();const el=document.createElement('div');el.id='ic151';el.innerHTML='<div class="lb t"></div><div class="lb b"></div><div class="sub"></div><div class="fd fw"></div><div class="fd fk"></div><button class="skip">Skip ›</button>';
  el.insertBefore(S.rd.domElement,el.firstChild);document.body.appendChild(el);
  S.dom={el,lt:el.querySelector('.lb.t'),lb:el.querySelector('.lb.b'),sub:el.querySelector('.sub'),fw:el.querySelector('.fw'),fk:el.querySelector('.fk'),skip:el.querySelector('.skip'),cur:null,sp:[]}}

// ---------------- sound: the score and effects, scheduled from t=0 (works offline too, so tests can render it) ----------------
function ic151Score(ac,out,T0){const NB=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  const rv=ac.createConvolver(),IR=ac.createBuffer(2,ac.sampleRate*3.6,ac.sampleRate);for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.6)}rv.buffer=IR;
  const wet=ac.createGain();wet.gain.value=.55;rv.connect(wet);wet.connect(out);
  const T=x=>T0+x,G=(v)=>{const g=ac.createGain();g.gain.value=v||0;return g};
  const env=(g,a,pk,at,hold,rel)=>{g.gain.setValueAtTime(0,T(a));g.gain.linearRampToValueAtTime(pk,T(a+at));g.gain.setValueAtTime(pk,T(a+at+hold));g.gain.linearRampToValueAtTime(0,T(a+at+hold+rel))};
  const send=(n,dry,w)=>{const d=G(dry==null?1:dry);n.connect(d);d.connect(out);if(w){const s=G(w);n.connect(s);s.connect(rv)}};
  const osc=(type,f,a,dur,pk,at,rel,o)=>{o=o||{};const s=ac.createOscillator();s.type=type;s.frequency.setValueAtTime(f,T(a));if(o.f2)s.frequency.exponentialRampToValueAtTime(o.f2,T(a+(o.ft||dur)));if(o.det)s.detune.value=o.det;
    const g=G(0);env(g,a,pk,at,Math.max(0,dur-at-rel),rel);let n=g;s.connect(g);if(o.lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(o.lp,T(a));if(o.lp2)f.frequency.linearRampToValueAtTime(o.lp2,T(a+dur));g.connect(f);n=f}
    if(o.pan!=null&&ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=o.pan;n.connect(p);n=p}send(n,o.dry,o.wet);s.start(T(a));s.stop(T(a+dur+.05));return s};
  const noise=(a,dur,pk,at,rel,ft,f,q,o)=>{o=o||{};const s=ac.createBufferSource();s.buffer=NB;s.loop=true;const fl=ac.createBiquadFilter();fl.type=ft;fl.frequency.setValueAtTime(f,T(a));if(o.f2)fl.frequency.exponentialRampToValueAtTime(o.f2,T(a+dur));fl.Q.value=q||1;
    const g=G(0);env(g,a,pk,at,Math.max(0,dur-at-rel),rel);s.connect(fl);fl.connect(g);let n=g;if(o.pan!=null&&ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=o.pan;g.connect(p);n=p}send(n,o.dry,o.wet);s.start(T(a),Math.random());s.stop(T(a+dur+.05))};
  const R=ic151Rng(99);
  // woodland: warm pad, a soft pipe melody, wind, birds
  [220,277.18,329.63,440,554.37].forEach((f,i)=>osc('triangle',f,0,15.2,.016,3,2.6,{det:(i-2)*4,lp:1400,wet:.6}));
  [[1.2,659.25,1.4],[2.6,880,1.2],[3.9,739.99,1.6],[5.8,659.25,1.2],[7.0,554.37,2.2],[9.4,659.25,1.1],[10.6,587.33,1.4],[12.0,554.37,2.6]].forEach(([a,f,d])=>{osc('sine',f,a,d,.05,.12,.7,{wet:.9});osc('sine',f*2,a,d*.6,.008,.1,.4,{wet:.9})});
  noise(0,16,.05,3,3,'bandpass',500,.6,{wet:.3});noise(0,16,.018,4,3,'highpass',3500,.4,{wet:.2});
  [2.1,3.4,5.2,6.0,7.6,8.7,10.4,11.7,12.9].forEach((a,i)=>{const n=2+(i%3),p=R()*1.6-.8,b=2600+R()*1800;for(let j=0;j<n;j++)osc('sine',b,a+j*.11,.07,.035,.01,.05,{f2:b*1.5,ft:.06,pan:p,wet:.5})});
  // the rat: sniffs and squeaks
  [7.4,7.9,8.5,9.8,10.05,10.3,11.15,11.4,12.4,12.6,12.8,13.0].forEach(a=>noise(a,.07,.09,.01,.05,'bandpass',5200,2.2,{pan:.25}));
  [[13.65,3600,4300,.12],[20.35,4200,5200,.16],[22.65,4600,3900,.22],[23.6,4300,5400,.14],[25.45,5000,3600,.3],[27.5,4600,5600,.18],[28.6,4800,4200,.14],[29.68,5200,3000,.6]].forEach(([a,f,f2,d])=>{osc('sine',f,a,d,.05,.01,d*.4,{f2,wet:.4,pan:.2});osc('square',f/2,a,d,.006,.01,d*.4,{f2:f2/2,lp:3000})});
  // the dark arrives: drone, a choir of light, the descent
  osc('sawtooth',41.2,13.6,18,.12,5,4,{lp:70,lp2:520,det:-6});osc('sawtooth',41.7,13.6,18,.1,5,4,{lp:70,lp2:480,det:7});
  [329.63,392,493.88,659.25,987.77].forEach((f,i)=>osc('sine',f,14.6+i*.35,6.5,.022,2.8,1.5,{wet:1,dry:.6,det:(i%2?5:-5)}));
  [1318.5,1975.5,2637].forEach((f,i)=>osc('sine',f,15.5+i*.4,5,.006,2,1,{wet:1,dry:.3}));
  noise(17.0,2.45,.32,2.3,.05,'bandpass',220,1.2,{f2:2600,wet:.5});
  // impact and the tearing of the earth
  osc('sine',72,19.35,2.6,.75,.005,2.4,{f2:26,ft:2});noise(19.35,3,.6,.005,2.9,'lowpass',500,.7,{wet:.6});noise(19.35,.25,.45,.002,.22,'highpass',1800,.7);
  noise(19.4,12,.3,.4,3,'lowpass',130,.9,{wet:.3});noise(20.5,10,.08,1,2,'bandpass',700,.8,{wet:.4});
  for(let i=0;i<70;i++){const a=19.6+R()*11.5;noise(a,.05+R()*.08,.1+R()*.14,.003,.05,'bandpass',900+R()*2600,1.5,{pan:R()*1.6-.8,wet:.3})}
  [24.4,25.1,26.6,28.0,31.4].forEach(a=>{osc('sine',55,a,1.4,.35,.01,1.3,{f2:30,ft:1.2});noise(a,1.3,.25,.01,1.2,'lowpass',400,.8,{wet:.5})});
  [220,261.63,329.63,440,880].forEach((f,i)=>osc('sine',f,21+i*.5,13.5-i*.5,.018,3,2,{wet:1,dry:.5,det:i*3}));
  // the edge crumbles, the fall
  noise(29.6,.8,.35,.01,.7,'lowpass',900,.8,{wet:.5});noise(29.8,4.8,.34,3.8,.8,'bandpass',300,1,{f2:3200,wet:.6});osc('sine',110,29.9,4.6,.06,3,1.2,{f2:880,wet:.8});
  // the core: pale light
  [174.61,261.63,349.23,440,523.25,698.46].forEach((f,i)=>osc('sine',f,34.6+i*.25,21,.02,3,3,{wet:1,dry:.55,det:(i%2?6:-6)}));
  // (no voice sound under the lines: the narration is text only)
  // the change: a heart that races, bones that crack, a rising tone, the flash, the resolve
  [47.6,48.2,48.75,49.2,49.6,49.95,50.25,50.55,50.8,51.02,51.22].forEach((a,i)=>{osc('sine',58,a,.28,.6,.005,.26,{f2:38,ft:.25});if(i>0)noise(a+.02,.06,.26,.002,.05,'highpass',2400,.8,{wet:.4,pan:(i%2?.3:-.3)})});
  osc('sawtooth',110,48.2,3.6,.07,3.3,.2,{f2:440,lp:400,lp2:3000,wet:.6});noise(50.2,1.65,.25,1.6,.05,'highpass',1200,.6,{f2:8000,wet:.8});
  [440,554.37,659.25,880,1108.73,1318.5].forEach((f,i)=>osc('sine',f,51.85,6.5,.04,.25,5.5,{wet:1.3,dry:.6,det:i*2}));osc('sine',55,51.85,3.5,.5,.01,3.3,{f2:41});noise(51.85,3,.3,.01,2.9,'lowpass',900,.7,{wet:1});
  [146.83,220,293.66,369.99,440].forEach((f,i)=>osc('triangle',f,55.2,4.3,.022,1.4,2.4,{wet:1,dry:.6,lp:2000}))}
// the browser's own voice for the lines (low, slow, a woman's voice when the system has one)
function ic151Speak(t0){if(IC151.voiceUrl){const a=new Audio(IC151.voiceUrl);IC151.live.voice=a;IC151.live.timers.push(setTimeout(()=>{try{a.play()}catch(_){}},Math.max(0,(IC151.lines[0].a-t0)*1000)));return}
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;try{speechSynthesis.getVoices()}catch(_){}
  const pick=()=>{const vs=speechSynthesis.getVoices()||[];return vs.find(x=>/female|woman|samantha|victoria|zira|aria|jenny|libby|sonia|moira|tessa|fiona|karen|serena|google uk english female/i.test(x.name)&&/^en/i.test(x.lang))||vs.find(x=>/^en/i.test(x.lang))};
  IC151.lines.forEach(L=>{if(L.a<t0)return;IC151.live.timers.push(setTimeout(()=>{try{const u=new SpeechSynthesisUtterance(L.s.replace(/…/g,'...'));const v=pick();if(v)u.voice=v;u.pitch=.55;u.rate=.72;u.volume=1;speechSynthesis.speak(u)}catch(_){}},(L.a-t0)*1000+60))})}

// ---------------- play / skip / finish ----------------
function ic151Want(){if(window.KQ_INTRO)return true;if(window.AW_NOTITLE||navigator.webdriver)return false;try{if(typeof SET!='undefined'&&SET.intro===0)return false}catch(_){}return true}
function ic151Play(done){if(IC151.run)return;let S;try{S=ic151Build(innerWidth,innerHeight)}catch(e){console.warn('intro build',e);if(done)done();return}
  IC151.S=S;IC151.run=true;IC151.on=true;IC151.done=done;ic151Layer(S);const L=IC151.live={t0:performance.now(),off:0,timers:[],ac:null,raf:0};
  try{const AC=window.AudioContext||window.webkitAudioContext,ac=L.ac=new AC(),out=ac.createGain(),cp=ac.createDynamicsCompressor();out.gain.value=.9;out.connect(cp);cp.connect(ac.destination);L.out=out;if(ac.resume)ac.resume();ic151Score(ac,out,ac.currentTime+.05)}catch(e){console.warn('intro sound',e)}
  try{if(typeof MU!='undefined'&&MU.g&&MU.a){L.mu=1;MU.g.gain.setTargetAtTime(0,MU.a.currentTime,.1)}}catch(_){}
  if(IC151.speak)try{ic151Speak(0)}catch(_){}  // text only for now (IC151.speak=true turns the browser voice back on)
  const onKey=e=>{if(!IC151.run)return;if(IC151.on){e.stopImmediatePropagation();e.preventDefault();if(e.type=='keydown'&&/^(Escape|Enter| |Spacebar)$/.test(e.key))ic151Skip()}};L.onKey=onKey;
  addEventListener('keydown',onKey,true);addEventListener('keyup',onKey,true);S.dom.skip.onclick=e=>{e.stopPropagation();ic151Skip()};
  S.dom.el.addEventListener('mousemove',()=>{S.dom.el.style.cursor='default';clearTimeout(L.cur);L.cur=setTimeout(()=>{if(S.dom)S.dom.el.style.cursor=''},1500)});
  L.rs=()=>{try{S.rd.setSize(innerWidth,innerHeight);S.cam.aspect=innerWidth/innerHeight;S.cam.updateProjectionMatrix()}catch(_){}};addEventListener('resize',L.rs);
  const tick=now=>{if(!IC151.run)return;L.raf=requestAnimationFrame(tick);const t=(now-L.t0)/1000+L.off;if(S.phys&&!S.phys.done)try{ic151PhysRun(S,t>18.9?1e9:6)}catch(e){console.warn('intro physics',e);S.phys.done=true}ic151Seek(t)};L.raf=requestAnimationFrame(tick)}
// render/apply time t (live play and tests). Past the cut the game runs again under the clearing light.
function ic151Seek(t){const S=IC151.S;if(!S)return;if(t<IC151.cut){IC151.on=true;try{ic151Frame(S,t)}catch(e){console.warn('intro frame',e);IC151.err=String(e&&e.stack||e);t=IC151.cut}}
  if(t>=IC151.cut&&IC151.on){IC151.on=false;try{if(IC151.live&&IC151.live.mu&&typeof muVol=='function')muVol()}catch(_){}try{if(typeof K!='undefined')for(const k in K)K[k]=false}catch(_){}}
  ic151Dom(S,t);if(t>=IC151.len)ic151End()}
function ic151Skip(){const L=IC151.live;if(!L||!IC151.on)return;const t=(performance.now()-L.t0)/1000+L.off;if(t>=IC151.skipT)return;L.off+=IC151.skipT-t;
  L.timers.forEach(clearTimeout);L.timers=[];try{speechSynthesis.cancel()}catch(_){}try{if(L.voice)L.voice.pause()}catch(_){}
  try{if(L.out){L.out.gain.cancelScheduledValues(L.ac.currentTime);L.out.gain.setTargetAtTime(0,L.ac.currentTime,.12)}}catch(_){}}
function ic151End(){if(!IC151.run)return;IC151.run=false;IC151.on=false;const S=IC151.S,L=IC151.live;IC151.S=null;
  try{if(L){cancelAnimationFrame(L.raf);L.timers.forEach(clearTimeout);removeEventListener('keydown',L.onKey,true);removeEventListener('keyup',L.onKey,true);removeEventListener('resize',L.rs);
    if(L.ac){const ac=L.ac;try{L.out.gain.setTargetAtTime(0,ac.currentTime,.3)}catch(_){}setTimeout(()=>{try{ac.close()}catch(_){}},1500)}if(L.mu&&typeof muVol=='function')muVol()}}catch(_){}
  try{if(typeof ren!='undefined'){ren.domElement.style.filter='';const g=ren.domElement;requestAnimationFrame(()=>{g.style.transition=''})}}catch(_){}
  try{if(S){if(S.hero&&S.hero.parent)S.hero.parent.remove(S.hero);S.dom.el.remove();
    [S.sc,S.cs].forEach(sc=>sc.traverse(o=>{if(o===S.hero||(S.hero&&isDesc(o,S.hero)))return;if(o.geometry)o.geometry.dispose();if(o.material)[].concat(o.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}));
    S.dot.dispose();S.rd.dispose();S.rd.forceContextLoss()}}catch(e){console.warn('intro end',e)}
  function isDesc(o,p){for(;o;o=o.parent)if(o===p)return true;return false}
  const q=IC151.q||[];IC151.q=[];q.forEach(f=>{try{f()}catch(_){}});const d=IC151.done;IC151.done=null;if(d)try{d()}catch(_){}}
// capture mode for tests: build at a fixed size, no sound, no clock; then call ic151Seek(t) per frame
function ic151Cap(w,h){IC151.cap=true;const T0=performance.now(),S=ic151Build(w,h);S.buildMs=Math.round(performance.now()-T0);IC151.S=S;IC151.run=true;IC151.on=true;ic151Layer(S);S.dom.skip.style.display='none';const P=S.phys;return {cells:S.cells.length,grips:S.cells.filter(c=>c.grip>=0).map(c=>c.grip),rat:!!S.rcell,edge:S.rEdgeR,hs:S.hand.sc,hero:!!S.hero,arm:!!(S.giant&&S.giant.arm),giant:!!(S.giant&&S.giant.body),rtrk:S.rtrk?S.rtrk.N:0,chunk:S.cells.filter(c=>c.chunk).length,ms:S.buildMs,phys:{done:P.done,ev:P.ev.length,moved:P.dyn.filter(b=>b.rec[(b.nr-1)*7+1]<-5).length,dyn:P.dyn.length}}}
// the welcome banner waits until the light has cleared
{const f=banner;banner=function(){if(IC151.run){const a=arguments,s=this;(IC151.q=IC151.q||[]).push(()=>f.apply(s,a));return}return f.apply(this,arguments)}}
// the main loop waits while the cinematic plays
{const f=loop;loop=function(now){if(IC151.on){requestAnimationFrame(loop);last=now;return}return f.apply(this,arguments)}}
// new characters get the intro
{const f=ccBegin;ccBegin=function(){const r=f.apply(this,arguments);try{if(ic151Want())ic151Play()}catch(e){console.warn('intro',e)}return r}}
