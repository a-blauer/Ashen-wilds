// ================= v151: intro cinematic (plays once for every new character, after "Begin your journey") =================
// A woodland at golden hour → a rat sniffing the forest floor → a violent earthquake: the trees thrash, cracks race out, the
// meadow caves in and splits open (v151b) → the rat clings to the edge, it crumbles and he falls into the glowing core → a voice
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
function ic151Trees(S,extra){const sc=S.sc,R=ic151Rng(1338),TF=S.TF;
  // v151b: the trees and undergrowth thrash in the quake (S.quakeU.uQ = how hard, from ic151Q): the higher up, the more they swing
  S.quakeU={uQ:{value:0},uT:{value:0}};const mat=S.matT=ic151Mat();mat.onBeforeCompile=sh=>{sh.uniforms.uQ=S.quakeU.uQ;sh.uniforms.uT=S.quakeU.uT;
    sh.vertexShader='uniform float uQ,uT;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{float hh=max(0.,position.y-.12),ph=position.x*.31+position.z*.27;'+
      'transformed.x+=uQ*(hh*.034*sin(uT*13.+ph)+hh*hh*.0035*sin(uT*7.3+ph*1.7));transformed.z+=uQ*(hh*.03*cos(uT*11.+ph*1.3)+hh*hh*.003*sin(uT*6.1+ph));}')};
  // trees and undergrowth: a dense treeline all round; the view lanes the shots look down are kept open
  {const k=ic151Kit(),lane=(x,z,dx,dz,w)=>{const L=Math.hypot(dx,dz),u=dx/L,v=dz/L,p=x*u+z*v,q=Math.abs(-x*v+z*u);return p>-2&&q<w+p*.12};
    const free=(x,z)=>!(lane(x,z,.66,.75,8.5)||lane(x,z,.42,.9,5)||lane(x,z,.92,-.39,6.5)||(extra||[]).some(e=>lane(x,z,e[0],e[1],e[2]))),OAK=[[0x3f6a2e,0x4a7a36,0x365e2a,0x557f3a],[0x4a7a36,0x5b8a3a,0x6a8a34,0x3f6a2e],[0x7a8a34,0x8a9a3a,0x5b7a32,0xa08a3a]];
    for(let n=0;n<420;n++){const a=R()*6.283,r=11.5+Math.pow(R(),1.25)*68,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!free(x,z))continue;
      const s=.9+R()*.75,q=R();if(q<.42)ic151Pine(k,x,z,s*1.25,R);else if(q<.82)ic151Oak(k,x,z,s,R,OAK[(R()*3)|0]);else ic151Birch(k,x,z,s,R)}
    for(let n=0;n<260;n++){const a=R()*6.283,r=10.2+R()*45,x=Math.cos(a)*r,z=Math.sin(a)*r,q=R();if((extra||[]).some(e=>lane(x,z,e[0],e[1],e[2]*.6)))continue;
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
  seeds.push({p:[0,0]});for(let k=0;k<5;k++)seeds.push({p:ray(2.5,th+k*Math.PI*.4)});TP.forEach((p,f)=>seeds.push({p,grip:f}));seeds.push({p:ray(7.1,th),rat:1});
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
  // glowing crack lines along every break, spreading out from the middle (v151b: the quake)
  {const L=[],a=[],dt=(x,z)=>Math.hypot(x,z);S.cells.forEach(c=>{const p=c.pts;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];
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
function ic151PhysKin(S,b,t,M){ic151RatCellM(S,t,M);return M}   // the rat's slab is the only one the story moves
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
  S.cPt=new THREE.PointLight(0xdfeeff,0,8,1.4);S.cPt.position.set(0,.2,.8);sc.add(S.cPt);}

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
  S.V=THREE.Vector3;S.tmp={m:new THREE.Matrix4(),m2:new THREE.Matrix4(),q:new THREE.Quaternion(),v:new THREE.Vector3(),v2:new THREE.Vector3()};
  // v151b: no hand. Five points round the middle where the quake first splits the meadow (plates, cracks, rocks and dust start there)
  {const a0=Math.atan2(1.1,5.6)+.628;S.tip0=[0,1,2,3,4].map(k=>{const a=a0+k*1.2566+(k%2?.15:-.1),r=3.7+(k%3)*.3;return new THREE.Matrix4().makeTranslation(Math.cos(a)*r,0,Math.sin(a)*r)})}
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
  ic151Quake(S);ic151Core(S);S.hero=ic151Hero(S);if(S.hero){S.cs.add(S.hero);S.hero.visible=false}
  ic151PhysInit(S);if(IC151.cap)while(!ic151PhysRun(S,1e9));
  return S}
// the quake's set-up and its effects (rocks thrown up, cracks running out across the meadow, dust where pieces strike).
// Everything is a function of t.
function ic151Tear(S){const V=THREE.Vector3,R=ic151Rng(515);
  const TP=S.tip0.map(m=>new V().setFromMatrixPosition(m)),ang=TP.map(p=>Math.atan2(p.z,p.x));
  // rocks thrown up by the big jolt, more as the ground caves in
  {const N=170,g=ic151Jit(new THREE.DodecahedronGeometry(1,0),.3,7),mt=new THREE.MeshStandardMaterial({flatShading:true,roughness:.95}),im=new THREE.InstancedMesh(g,mt,N),C=new THREE.Color();
    S.rocks={m:im,d:[]};for(let i=0;i<N;i++){const f=i%5,b=i<110,o=TP[f],a=ang[f]+(R()-.5)*1.4,sp=b?2+R()*5:1+R()*3;
      S.rocks.d.push({o:new V(o.x,ic151Y(o.x,o.z)+.2,o.z),v:new V(Math.cos(a)*sp,b?4+R()*8:2+R()*4,Math.sin(a)*sp),t0:b?19.38+R()*.3:21.0+R()*1.4,s:.06+Math.pow(R(),2)*.32,sp:new V(R()*9,R()*9,R()*9)});
      im.setColorAt(i,C.set([0x4a3424,0x3a2a1c,0x6a655e,0x5a4030,0x4f6e34][(R()*5)|0]))}
    im.castShadow=true;im.frustumCulled=false;S.sc.add(im)}
  // cracks running out across the meadow from the split: a dark split with a blue light in it, growing outward
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
      const o=new THREE.Points(g,m);o.frustumCulled=false;S.sc.add(o);return {g,m,o,N}};S.efx={pu:mk(1800,1.0,0x7a6a56,.45,S.dot),ch:mk(1500,.09,0x2a1e14,1)}}}
function ic151TearAt(S,t){const V=S.V,T=S.tmp,q=new THREE.Quaternion(),e=new THREE.Euler(),sv=new V();
  const R=S.rocks,on=t>19.35&&t<34;R.m.visible=on;if(on){R.d.forEach((d,i)=>{const u=t-d.t0;let s=d.s;const p=sv.copy(d.o);
      if(u<0){s=0}else{p.addScaledVector(d.v,u);p.y-=4.9*u*u;const rr=Math.hypot(p.x,p.z),gy=ic151Y(p.x,p.z);if(rr>ic151Rb(4,Math.atan2(p.z,p.x))&&p.y<gy){const vy=d.v.y,ul=(vy+Math.sqrt(vy*vy+19.6*(d.o.y-gy)))/9.8;p.copy(d.o).addScaledVector(d.v,ul);p.y=gy+s*.5;if(u-ul>1.5)s*=Math.max(0,1-(u-ul-1.5))}
        if(p.y<-60)s=0}
      T.m.compose(p,q.setFromEuler(e.set(d.sp.x*Math.max(u,0),d.sp.y*Math.max(u,0),d.sp.z*Math.max(u,0))),new V(s,s*.8,s));R.m.setMatrixAt(i,T.m)});R.m.instanceMatrix.needsUpdate=true}
  const cr=ic151K(t,17.3,21.6);S.crk.d.material.uniforms.uR.value=S.crk.g.material.uniforms.uR.value=Math.pow(cr,.7)*9;S.crk.g.material.uniforms.uA.value=1.4-ic151K(t,21,24)*1.05;S.crk.d.visible=S.crk.g.visible=t>17.3&&t<35;
  {const E=S.phys?S.phys.ev:[],pu=S.efx.pu.g.attributes.position.array,ch=S.efx.ch.g.attributes.position.array;pu.fill(-999);ch.fill(-999);
    E.forEach((e,i)=>{const u=t-e.t;if(u<0||u>1.9)return;for(let k=0;k<6;k++){const j=(i*6+k)*3;if(j>=pu.length)break;const h=ic151H(i*7.3+k*1.7),a=h*6.283,rr=(.4+1.7*Math.sqrt(u))*(.5+e.s);
        pu[j]=e.x+Math.cos(a)*rr;pu[j+1]=e.y+.2+.45*u+(ic151H(k+i)-.5)*.6;pu[j+2]=e.z+Math.sin(a)*rr}
      if(u<1.6)for(let k=0;k<5;k++){const j=(i*5+k)*3;if(j>=ch.length)break;const h=ic151H(i*3.1+k*5.3),a=h*6.283,sp=(2+3*ic151H(k*9.1+i))*(.5+e.s),vy=2+3*ic151H(k+i*2.2);
        ch[j]=e.x+Math.cos(a)*sp*u;ch[j+1]=e.y+vy*u-6.1*u*u;ch[j+2]=e.z+Math.sin(a)*sp*u}});
    S.efx.pu.g.attributes.position.needsUpdate=S.efx.ch.g.attributes.position.needsUpdate=true;S.efx.pu.o.visible=S.efx.ch.o.visible=t>19.35&&t<35}}
// v151b: the quake's extras, built once: birds bursting from the far treeline, leaves shaken loose, pebbles hopping on the meadow
function ic151Quake(S){const R=ic151Rng(4141),V=THREE.Vector3;
  {const g=new THREE.BufferGeometry(),P=[0,0,.1, 0,0,-.08, -.36,.1,-.04, 0,0,.1, .36,.1,-.04, 0,0,-.08];g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();
    const N=46,m=new THREE.InstancedMesh(g,new THREE.MeshBasicMaterial({color:0x1d1a22,side:THREE.DoubleSide}),N);m.frustumCulled=false;S.sc.add(m);
    S.birds={m,d:Array.from({length:N},(_,i)=>{const a=3.75+(R()-.5)*1.7,r=13+R()*10,v=new V(Math.cos(a)*(1+R()*2),2.4+R()*2.2,Math.sin(a)*(1+R()*2)).normalize().multiplyScalar(5+R()*3);
      return {o:new V(Math.cos(a)*r,4.5+R()*4,Math.sin(a)*r),v,t0:15.05+Math.pow(R(),1.6)*2.2+(i%9==0?3.6:0),ph:R()*6.283,s:1.5+R()*.8,wob:R()*6.283}})}}
  {const N=520,g=new THREE.BufferGeometry(),C=new Float32Array(N*3),c=new THREE.Color();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));
    for(let i=0;i<N;i++){c.set([0x4a7a36,0x6a8a34,0x8a9a3a,0xa08a3a,0x3f6a2e][i%5]);C.set([c.r,c.g,c.b],i*3)}g.setAttribute('color',new THREE.BufferAttribute(C,3));
    const o=new THREE.Points(g,new THREE.PointsMaterial({size:.12,vertexColors:true,transparent:true,opacity:.95,depthWrite:false}));o.frustumCulled=false;S.sc.add(o);
    S.leaves={g,o,d:Array.from({length:N},()=>{const a=R()*6.283,r=12+R()*16;return {x:Math.cos(a)*r,z:Math.sin(a)*r,y:3+R()*5.5,t0:14.4+R()*6.5+(R()<.3?2.5:0),f:.7+R()*.8,ph:R()*6.283}})}}
  {const N=90,im=new THREE.InstancedMesh(ic151Jit(new THREE.DodecahedronGeometry(1,0),.3,11),new THREE.MeshStandardMaterial({flatShading:true,roughness:.95}),N),C=new THREE.Color();im.castShadow=true;im.frustumCulled=false;
    S.hops={m:im,d:Array.from({length:N},(_,i)=>{const a=R()*6.283,r=Math.sqrt(R())*15+.8;im.setColorAt(i,C.set([0x5a4030,0x6a655e,0x4a3424,0x77706a][i%4]));return {x:Math.cos(a)*r,z:Math.sin(a)*r,s:.03+R()*.06,w:13+R()*9,ph:R()*6.283,sp:new V(R()*6,R()*6,R()*6)}})};S.sc.add(im)}}
function ic151QuakeAt(S,t){const V=S.V,T=S.tmp,q=ic151Q(t),qu=new THREE.Quaternion(),e=new THREE.Euler(),v=new V(),sc=new V();S.quakeU.uQ.value=t<34?q:0;S.quakeU.uT.value=t;
  const B=S.birds,on=t>15&&t<26;B.m.visible=on;if(on){B.d.forEach((d,i)=>{const u=t-d.t0;if(u<0){T.m.makeScale(0,0,0)}else{v.copy(d.o).addScaledVector(d.v,u);v.y+=Math.sin(u*2+d.wob)*.3;
      const fl=Math.sin(t*19+d.ph);T.m.compose(v,qu.setFromEuler(e.set(0,Math.atan2(d.v.x,d.v.z),Math.sin(u+d.wob)*.2)),sc.set(d.s,d.s*fl,d.s))}B.m.setMatrixAt(i,T.m)});B.m.instanceMatrix.needsUpdate=true}
  const Lf=S.leaves,la=Lf.g.attributes.position.array,lo=t>14.3&&t<30;Lf.o.visible=lo;if(lo)Lf.d.forEach((d,i)=>{const u=t-d.t0;if(u<0||u>7){la[i*3+1]=-999;return}
    la[i*3]=d.x+Math.sin(u*1.7+d.ph)*.7+u*.25;la[i*3+1]=Math.max(.03,d.y-d.f*u);la[i*3+2]=d.z+Math.cos(u*1.3+d.ph)*.6});Lf.g.attributes.position.needsUpdate=true;
  const H=S.hops,ho=t>14&&t<24;H.m.visible=ho;if(ho){const a=Math.min(1,q);H.d.forEach((d,i)=>{const r=Math.hypot(d.x,d.z);let s=d.s;
      if(t>21.1&&r<ic151Ropen(Math.atan2(d.z,d.x),t)+.2)s=0;const y=ic151Y(d.x,d.z)+s*.6+Math.abs(Math.sin(t*d.w+d.ph))*(.02+.1*d.s/.09)*a;
      T.m.compose(v.set(d.x,y,d.z),qu.setFromEuler(e.set(d.sp.x*t*a,d.sp.y*t*a,d.sp.z*t*a)),sc.set(s,s*.8,s));H.m.setMatrixAt(i,T.m)});H.m.instanceMatrix.needsUpdate=true}}
// piece transform at time t
// v151b: how hard the ground shakes at time t (0 = still; ~1 = violent; spikes at the jolt, the cave-in and when the edge breaks)
function ic151Q(t){const K=ic151K,Sm=ic151Sm,ex=(a,h,d)=>t>a?h*Math.exp(-(t-a)*d):0;
  let q=.34*Sm(K(t,14,15.2))+.32*Sm(K(t,16.4,19.2))-.36*K(t,24.4,26.5)-.3*K(t,30,33.5);q=Math.max(0,q)*(1+.3*Math.sin(t*2.3)*Math.sin(t*.9+1));
  return q+ex(19.35,1.1,2.6)+ex(21.1,.45,2)+ex(24.4,.3,2.5)+ex(27.45,.28,3)+ex(29.55,.5,2.2)}
// v151b: before the ground gives way every plate heaves and rocks on its own (a few cm, a big lurch at the jolt), easing
// out by 21.1 s when the physics takes over from rest
function ic151Heave(S,c,t,out){const K=ic151K,A=(.012*ic151Sm(K(t,14,15.2))+.018*ic151Sm(K(t,16.4,19.2))+(t>19.35?.14*Math.exp(-(t-19.35)*3.2):0))*(1-K(t,20.5,21.1));if(A<1e-5)return out;
  const sd=c.seed||[0,0],ph=ic151H(sd[0]*3.1+sd[1]*1.7)*6.283,w=10+ic151H(sd[0]+sd[1]*2.3)*7,dy=A*Math.sin(t*w+ph),an=A*.2*Math.sin(t*w*.8+ph*2),T=S.tmp;
  const m=T.mh||(T.mh=new THREE.Matrix4()),q=T.qh||(T.qh=new THREE.Quaternion()),v=T.vh||(T.vh=new THREE.Vector3()),C=c.c;
  q.setFromAxisAngle(v.set(Math.sin(ph*1.3),0,Math.cos(ph*1.7)).normalize(),an);m.makeRotationFromQuaternion(q);
  m.premultiply(T.m.makeTranslation(C.x,C.y+dy,C.z)).multiply(T.m2.makeTranslation(-C.x,-C.y,-C.z));return out.premultiply(m)}
function ic151CellM(S,c,t,out){if(c===S.rcell)ic151RatCellM(S,t,out);else ic151PhysM(S,c,t,out);return t>14&&t<21.1?ic151Heave(S,c,t,out):out}
// v151b: the quake times (the old impact time is the big jolt; the physics starts there)
var IC151G={imp:19.35,g0:19.62,g1:20.6,off:.6};
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
  // v151b, the quake: the forest thrashing and birds bursting up (wide) → low by the rat as the cracks race out and the jolt hits →
  // across the meadow as the plates heave → high and wide as the middle caves in and splits open into the glow
  else if(t<17.4){const k=ic151Sm(ic151K(t,15,17.4));p=L(new V(15.8,3.1,14.4),new V(14.4,2.7,13.1),k);l=L(new V(-4.5,4.4,-6.5),new V(-3.2,3.2,-5.2),k);fov=50}
  else if(t<19.6){const k=ic151K(t,17.4,19.6);p=L(new V(7.6,.95,2.7),new V(7.35,.88,2.55),k);l=rp.clone().add(new V(0,.12,0)).lerp(new V(0,-.2,0),.38+.12*k);fov=56;roll=-.04}
  else if(t<21.0){const k=ic151Sm(ic151K(t,19.6,21.0)),A=S.tip0[0],B=S.tip0[1],ai=Math.atan2(A.elements[14],A.elements[12])+.62,r=19+k*1.4,c=new V(A.elements[12]+B.elements[12],0,A.elements[14]+B.elements[14]).multiplyScalar(.5);
    p=new V(Math.cos(ai)*r,2.4+k*.6,Math.sin(ai)*r);l=c.setY(.7+k*.2);fov=52}
  else if(t<22.6){const k=ic151Sm(ic151K(t,21.0,22.6));p=L(new V(25,10.5,-9.5),new V(27.5,9.6,-10.5),k);l=L(new V(.5,.8,0),new V(.3,-2.4,.2),k);fov=52}
  else if(t<23.7){const k=ic151Sm(ic151K(t,22.6,23.7)),n=S.nin,tg=new V(-n.z,0,n.x);p=rp.clone().addScaledVector(n,-2.6+.5*k).addScaledVector(tg,.9).add(new V(0,.75+.1*k,0));l=rp.clone().addScaledVector(n,1.8).add(new V(0,-.35,0));fov=52}
  else if(t<25.45){const k=ic151Sm(ic151K(t,23.7,25.45)),n=S.nin,tg=new V(-n.z,0,n.x),c=rp.clone().lerp(S.edge,.25*k);p=c.clone().addScaledVector(tg,2.9-.4*k).addScaledVector(n,.5+.5*k).add(new V(0,1.0-.35*k,0));l=c.addScaledVector(n,-.3+.6*k).add(new V(0,.1-.2*k,0));fov=47}
  else if(t<27.6){const E=S.edge,n=S.nin,tg=new V(-n.z,0,n.x),k=ic151K(t,25.45,27.6);p=E.clone().addScaledVector(tg,1.25+k*.15).addScaledVector(n,.95).add(new V(0,-.25+k*.05,0));l=E.clone().addScaledVector(n,.05).add(new V(0,-.28,0));fov=42}
  else if(t<29.75){const E=S.edge,n=S.nin,k=ic151K(t,27.6,29.75);p=E.clone().addScaledVector(n,-.42+k*.06).add(new V(0,.95-k*.08,0));p.addScaledVector(new V(-n.z,0,n.x),.12);l=E.clone().addScaledVector(n,.3).add(new V(0,-1.1,0));fov=50}
  else{if(!S.anc){const th=S.thR,re=S.rEdgeR,M=ic151RatCellM(S,29.62,new THREE.Matrix4());S.anc=new V(Math.cos(th)*re,ic151Y(Math.cos(th)*re,Math.sin(th)*re),Math.sin(th)*re).applyMatrix4(M)}
    const n=S.nin,k=ic151Sm(ic151K(t,29.75,34.5));p=S.anc.clone().addScaledVector(n,.6+k*.9).add(new V(.05,.85-k*1.6,0));
    const rr=Math.hypot(p.x,p.z),lim=.62*ic151Rb(4,Math.atan2(p.z,p.x));if(rr>lim){p.x*=lim/rr;p.z*=lim/rr}l=rp.clone();fov=50+k*6}
  // v151b: the camera shakes with the quake (less in the close shots at the edge, where it is a hand's width away)
  const shk=t<34?ic151Q(t)*(t>25.45&&t<29.75?.018:.045):0;
  if(shk>1e-4){p=p.clone().add(new V(Math.sin(t*61)*shk+Math.sin(t*23.7)*shk*.6,Math.sin(t*53+1)*shk+Math.sin(t*17.3+2)*shk*.5,Math.sin(t*47+2)*shk*.6));roll+=Math.sin(t*29+.5)*shk*.12}
  return {p,l,fov,roll}}
// one frame of the cinematic: positions everything for time t and renders it
function ic151Frame(S,t){const V=S.V,cam=S.cam,core=t>=35;
  if(!core){
    // light: golden hour → the quake darkens it (dust and a strange dusk) → blue from below
    const dk=.88*ic151Sm(ic151K(t,13.6,17.5)),bl=ic151K(t,20,24),C=(a,b,k)=>new THREE.Color(a).lerp(new THREE.Color(b),k);
    S.skyU.top.value.copy(C(0x5a86c8,0x140f2a,dk));S.skyU.mid.value.copy(C(0xf2c98a,0x3a2a5a,dk));S.skyU.bot.value.copy(C(0xb89a6a,0x1a1424,dk));S.skyU.sunK.value=1-dk;S.skyU.hole.value=0;
    S.sc.fog.color.copy(C(0xc8b88a,0x2a2448,dk).lerp(new THREE.Color(0x203a5a),bl*.5));S.sc.fog.density=.016-dk*.004;
    S.sun.intensity=1.35*(1-dk*.85);S.hemi.intensity=.75-dk*.35;S.hemi.color.copy(C(0xcfe0ff,0x8a90c8,dk));S.hemi.groundColor.copy(C(0x4a3a24,0x2a2a40,dk).lerp(new THREE.Color(0x2a5080),bl));
    S.moon.intensity=dk*.9;S.blue.intensity=ic151K(t,19.8,23)*1.5;S.blue2.intensity=ic151K(t,22,26)*2.2;S.cloudM.color.copy(C(0xffffff,0x8a86b8,dk));S.cloudM.emissive.copy(C(0x8a7a70,0x2e2a58,dk));
    S.shaftM.opacity=.14*(1-dk);S.shafts.visible=dk<1;S.shafts.children.forEach(s=>s.material.opacity=S.shaftM.opacity);
    S.pollen.m.opacity=.8*(1-dk);const pa=S.pollen.g.attributes.position.array;S.pollen.d.forEach((d,i)=>{pa[i*3]=d[0]+Math.sin(t*d[4]+d[3])*.6;pa[i*3+1]=d[1]+Math.sin(t*d[4]*.7+d[3]*2)*.4;pa[i*3+2]=d[2]+Math.cos(t*d[4]*.8+d[3])*.6});S.pollen.g.attributes.position.needsUpdate=true;
    S.clouds.forEach(c=>{const b=c.userData.b;c.position.set(b.x+Math.sin(t*.03+b.z)*2,b.y,b.z)});
    S.cells.forEach(c=>{ic151CellM(S,c,t,c.m.matrix);c.m.matrixWorldNeedsUpdate=true;c.m.visible=c.c.clone().applyMatrix4(c.m.matrix).y>-90});
    ic151TearAt(S,t);ic151QuakeAt(S,t);
    S.crackU.uR.value=ic151K(t,17.2,20.9)*13;S.crackU.uA.value=ic151K(t,17.2,17.6)*(1-ic151K(t,21.4,22.4))*1.6;S.cracks.visible=t>17.2&&t<22.5;
    // dust, rising light
    const da=S.dust.g.attributes.position.array,tp=S.tip0;S.dust.d.forEach((d,i)=>{const p=new V().setFromMatrixPosition(tp[d.k]);const e=t-d.t0;if(e<0||e>4){da[i*3+1]=-999;return}
      da[i*3]=p.x+d.v[0]*e;da[i*3+1]=Math.max(-.1,.2+d.v[1]*e-4.9*e*e*.6);da[i*3+2]=p.z+d.v[2]*e});S.dust.g.attributes.position.needsUpdate=true;S.dust.m.opacity=.75*(1-ic151K(t,23,25.5));S.dust.o.visible=t>19.4&&t<25.6;
    const ra=S.rise.g.attributes.position.array;S.rise.d.forEach((d,i)=>{const y=-60+((d[2]+t*d[3]*4)%64);ra[i*3]=Math.cos(d[0]+t*.1)*d[1];ra[i*3+1]=y;ra[i*3+2]=Math.sin(d[0]+t*.1)*d[1]});S.rise.g.attributes.position.needsUpdate=true;S.rise.m.opacity=ic151K(t,21.5,24)*.9;
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
  S.coreU.uT.value=t;S.coreU.uB.value=1+ic151K(t,47,51.9)*.3-ic151K(t,52,53.5)*.15;
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
  '#ic151 .skip:hover{opacity:1;background:rgba(30,24,40,.7)}#ic151.rv{background:transparent;cursor:default}#ic151.rv canvas,#ic151.rv .skip{display:none}#ic151.p2 .skip{display:block}';document.head.appendChild(s)}
function ic151Dom(S,t){const D=S.dom;if(!D)return;const lb=(11*(1-ic151Sm(ic151K(t,IC151.lbA||56.6,IC151.lbB||58.4))))+'vh';D.lt.style.height=lb;D.lb.style.height=lb;
  const w=Math.max(ic151K(t,34.0,35.0)*(1-ic151K(t,35.05,36.4)),ic151K(t,51.4,51.85)*.92*(1-ic151K(t,51.9,52.8)),ic151K(t,54.6,55.7)*(1-ic151K(t,56.0,58.9)));D.fw.style.opacity=w.toFixed(3);
  D.fk.style.opacity=(1-ic151K(t,0,1.8)+ (t>14.93&&t<15.0?1:0)).toFixed(3);
  const rv=t>=IC151.cut;if(D.rv!==rv){D.rv=rv;D.el.classList.toggle('rv',rv);S.rd.domElement.style.display=rv?'none':'block';D.skip.style.visibility=rv&&IC151.mode!=='p2'?'hidden':'';D.el.style.background=rv?'transparent':'#000'}
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
  // v151b, the quake: a drone, a rumble that builds from deep below, tremor thuds, creaking trunks, leaves, birds bursting off, the ground cracking
  osc('sawtooth',41.2,13.6,18,.12,5,4,{lp:70,lp2:520,det:-6});osc('sawtooth',41.7,13.6,18,.1,5,4,{lp:70,lp2:480,det:7});
  noise(14.0,5.6,.3,2.4,.3,'lowpass',80,.9,{f2:170,wet:.3});noise(14.2,5.3,.06,2,.4,'bandpass',260,.8,{f2:520,wet:.4});
  [14.3,14.95,15.6,16.15,16.8,17.35,17.9,18.4,18.8,19.1].forEach((a,i)=>osc('sine',34+R()*10,a,.55,.16+i*.025,.01,.5,{f2:24,ft:.45}));
  for(let i=0;i<9;i++){const a=15+R()*4.2;noise(a,.35+R()*.4,.05+R()*.04,.05,.25,'bandpass',300+R()*350,4,{f2:200+R()*200,pan:R()*1.6-.8,wet:.4})}
  noise(14.6,6,.04,1.6,2,'highpass',3000,.5,{wet:.3});
  for(let i=0;i<34;i++){const a=15.05+Math.pow(R(),1.4)*1.9,f=2800+R()*1700;osc('sine',f,a,.06,.03,.008,.04,{f2:f*(1.2+R()*.3),ft:.05,pan:R()*1.6-.8,wet:.5})}
  noise(15.1,1.4,.05,.1,1.1,'highpass',1800,.6,{pan:-.2,wet:.3});
  for(let i=0;i<30;i++){const a=16.9+Math.pow(R(),.8)*2.4;noise(a,.04+R()*.07,.12+R()*.16,.002,.05,'bandpass',1100+R()*2600,1.6,{pan:R()*1.6-.8,wet:.35})}
  // the jolt and the ground caving in
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
// v151c: mode 'p1' = part one only (a new game: the woodland → the change, then the hero creator), 'p2' = part two only
// (after "Begin your journey": the light clears on Duskhold), 'all' = the whole film (tests and the video)
function ic151Play(done,mode){if(IC151.run)return;mode=mode||'all';IC151.mode=mode;let S;try{S=mode==='p2'?ic151BuildP2(innerWidth,innerHeight):ic151Build(innerWidth,innerHeight)}catch(e){console.warn('intro build',e);IC151.mode='all';if(done)done();return}
  IC151.S=S;IC151.run=true;IC151.on=true;IC151.done=done;ic151Layer(S);if(mode==='p2')S.dom.el.classList.add('p2');const L=IC151.live={t0:performance.now(),off:mode==='p2'?IC151.cut:0,timers:[],ac:null,raf:0};
  try{const AC=window.AudioContext||window.webkitAudioContext,ac=L.ac=new AC(),out=ac.createGain(),cp=ac.createDynamicsCompressor();out.gain.value=.9;out.connect(cp);cp.connect(ac.destination);L.out=out;if(ac.resume)ac.resume();if(mode==='p2'){if(typeof ic151ScoreD=='function')ic151ScoreD(ac,out,ac.currentTime+.05-IC151.cut)}else ic151Score(ac,out,ac.currentTime+.05)}catch(e){console.warn('intro sound',e)}
  try{if(typeof MU!='undefined'&&MU.g&&MU.a){L.mu=1;MU.g.gain.setTargetAtTime(0,MU.a.currentTime,.1)}}catch(_){}
  if(IC151.speak)try{ic151Speak(0)}catch(_){}  // text only for now (IC151.speak=true turns the browser voice back on)
  const onKey=e=>{if(!IC151.run)return;if(IC151.on){e.stopImmediatePropagation();e.preventDefault();if(e.type=='keydown'&&/^(Escape|Enter| |Spacebar)$/.test(e.key))ic151Skip()}};L.onKey=onKey;
  addEventListener('keydown',onKey,true);addEventListener('keyup',onKey,true);S.dom.skip.onclick=e=>{e.stopPropagation();ic151Skip()};
  S.dom.el.addEventListener('mousemove',()=>{S.dom.el.style.cursor='default';clearTimeout(L.cur);L.cur=setTimeout(()=>{if(S.dom)S.dom.el.style.cursor=''},1500)});
  L.rs=()=>{try{S.rd.setSize(innerWidth,innerHeight);S.cam.aspect=innerWidth/innerHeight;S.cam.updateProjectionMatrix()}catch(_){}};addEventListener('resize',L.rs);
  const tick=now=>{if(!IC151.run)return;L.raf=requestAnimationFrame(tick);const t=Math.max(L.off,(now-L.t0)/1000+L.off);if(mode==='p1'&&t>=IC151.p1End){ic151P1Out();return}if(S.phys&&!S.phys.done)try{ic151PhysRun(S,t>18.9?1e9:6)}catch(e){console.warn('intro physics',e);S.phys.done=true}ic151Seek(t)};L.raf=requestAnimationFrame(tick)}
// render/apply time t (live play and tests). Past the cut the game runs again under the clearing light.
function ic151Seek(t){const S=IC151.S;if(!S)return;if(t<IC151.cut){IC151.on=true;try{ic151Frame(S,t)}catch(e){console.warn('intro frame',e);IC151.err=String(e&&e.stack||e);t=IC151.cut}}
  if(t>=IC151.cut&&IC151.on){IC151.on=false;try{if(IC151.live&&IC151.live.mu&&typeof muVol=='function')muVol()}catch(_){}try{if(typeof K!='undefined')for(const k in K)K[k]=false}catch(_){}}
  ic151Dom(S,t);if(t>=IC151.len)ic151End()}
function ic151Skip(){const L=IC151.live;if(!L||!IC151.on)return;const t=(performance.now()-L.t0)/1000+L.off,to=IC151.mode==='p1'?IC151.p1End:IC151.skipT;if(t>=to)return;L.off+=to-t;
  L.timers.forEach(clearTimeout);L.timers=[];try{speechSynthesis.cancel()}catch(_){}try{if(L.voice)L.voice.pause()}catch(_){}
  try{if(L.out){L.out.gain.cancelScheduledValues(L.ac.currentTime);L.out.gain.setTargetAtTime(0,L.ac.currentTime,.12)}}catch(_){}}
function ic151End(){if(!IC151.run)return;IC151.run=false;IC151.on=false;const S=IC151.S,L=IC151.live;IC151.S=null;
  try{if(L){cancelAnimationFrame(L.raf);L.timers.forEach(clearTimeout);removeEventListener('keydown',L.onKey,true);removeEventListener('keyup',L.onKey,true);removeEventListener('resize',L.rs);
    if(L.ac){const ac=L.ac;try{L.out.gain.setTargetAtTime(0,ac.currentTime,.3)}catch(_){}setTimeout(()=>{try{ac.close()}catch(_){}},1500)}if(L.mu&&typeof muVol=='function')muVol()}}catch(_){}
  try{if(typeof ren!='undefined'){ren.domElement.style.filter='';const g=ren.domElement;requestAnimationFrame(()=>{g.style.transition=''})}}catch(_){}
  try{if(S){if(S.hero&&S.hero.parent)S.hero.parent.remove(S.hero);S.dom.el.remove();
    [S.sc,S.cs].forEach(sc=>sc&&sc.traverse(o=>{if(o===S.hero||(S.hero&&isDesc(o,S.hero)))return;if(o.geometry)o.geometry.dispose();if(o.material)[].concat(o.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}));
    S.dot.dispose();S.rd.dispose();S.rd.forceContextLoss()}}catch(e){console.warn('intro end',e)}
  function isDesc(o,p){for(;o;o=o.parent)if(o===p)return true;return false}
  IC151.mode='all';const q=IC151.q||[];IC151.q=[];q.forEach(f=>{try{f()}catch(_){}});const d=IC151.done;IC151.done=null;if(d)try{d()}catch(_){}}
// capture mode for tests: build at a fixed size, no sound, no clock; then call ic151Seek(t) per frame
function ic151Cap(w,h){IC151.cap=true;const T0=performance.now(),S=ic151Build(w,h);S.buildMs=Math.round(performance.now()-T0);IC151.S=S;IC151.run=true;IC151.on=true;ic151Layer(S);S.dom.skip.style.display='none';const P=S.phys;return {cells:S.cells.length,split:S.cells.filter(c=>c.grip>=0).length,rat:!!S.rcell,edge:S.rEdgeR,hero:!!S.hero,hand:!!(S.hand||S.hand2||S.giant),quake:!!(S.quakeU&&S.birds&&S.leaves&&S.hops),rtrk:S.rtrk?S.rtrk.N:0,ms:S.buildMs,phys:{done:P.done,ev:P.ev.length,moved:P.dyn.filter(b=>b.rec[(b.nr-1)*7+1]<-5).length,dyn:P.dyn.length}}}
// the welcome banner waits until the light has cleared
{const f=banner;banner=function(){if(IC151.run){const a=arguments,s=this;(IC151.q=IC151.q||[]).push(()=>f.apply(s,a));return}return f.apply(this,arguments)}}
// the main loop waits while the cinematic plays
{const f=loop;loop=function(now){if(IC151.on){requestAnimationFrame(loop);last=now;return}return f.apply(this,arguments)}}
// new characters: part one plays when a new game starts (3082), part two after "Begin your journey"
{const f=ccBegin;ccBegin=function(){const r=f.apply(this,arguments);try{if(IC151.run&&IC151.mode==='p1')ic151End();if(ic151Want())ic151Play(null,'p2')}catch(e){console.warn('intro',e)}return r}}
