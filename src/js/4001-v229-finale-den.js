// ================= v229: the fountain's finale, part 2 of 3 — the den under Duskhold =================
// "Follows the essence down inside the fountain — underneath the duskhold. It is a massive underground den" where the Voice waits.
// One group (FN229D.Y below the town, nothing else is drawn while the camera is in it): the fountain's throat (a stone well shaft the
// essence falls down), a cavern 88 across and 36 high, the pool the essence gathers in, a ring of leaning black stones cut with
// glowing marks, roots of the meadow's trees through the roof, stalactites, drifting black smoke and dark orbs (his magic).
// Den-local frame: origin = the middle of the pool, +y up; he squats on the pool's north shore (FN229D.at) facing the pool (+z), so
// cameras work from the south. Everything is seeded (the same den on every screen) and drawn with fn229Mat (4000).
var FN229D={Y:-300,R:44,H:36,shR:2.6,shH:40,pool:6,at:[0,0,-10],hole:[0,0,-10],holeR:4.2,
  // ground kept clear for the cameras' sight lines: [x0, z0, x1, z1, radius] (and the whole south sector, fn229DenOpen)
  keep:[[16.5,-2,2,-8,2.6],[0,-10,3,-20,3.8],[0,-10,8,-2,3]],stones:[68,134,153,207,232,292]};
function fn229DenOpen(x,z,pad){const D=FN229D,r=Math.hypot(x,z);pad=pad||0;if(Math.abs(Math.atan2(x,z))<.8&&r<40)return false;if(Math.hypot(x-D.at[0],z-D.at[2])<5+pad)return false;
  return !D.keep.some(k=>{const dx=k[2]-k[0],dz=k[3]-k[1],L=dx*dx+dz*dz,u=Math.max(0,Math.min(1,((x-k[0])*dx+(z-k[1])*dz)/L));return Math.hypot(x-k[0]-dx*u,z-k[1]-dz*u)<k[4]+pad})}
function fn229DenShell(a,e){const D=FN229D,ce=Math.cos(e),se=Math.sin(e),top=fn229Sm(fn229K(e,1.2,1.512)),x=Math.sin(a)*ce,z=Math.cos(a)*ce,
    n=fn229Fbm(x*2.3+5,se*2.6,z*2.3+9)-.5,n2=fn229Nz(x*7+1,se*9,z*7)-.5,led=Math.sin(se*16+n*6)*.012,k=1+(n*.26+n2*.05+led)*(1-top);return [x*D.R*k,se*D.H*(1+(n*.1)*(1-top)),z*D.R*k]}
// the roof's height over a floor point (roughly: the shell without its bumps)
function fn229DenCeil(x,z){const D=FN229D,r=Math.min(.98,Math.hypot(x,z)/D.R);return D.H*Math.sqrt(1-r*r)}
function fn229DenFloor(x,z){const D=FN229D,r=Math.hypot(x,z),a=Math.atan2(x,z);if(r<D.pool-.6)return -1.3;
  const rim=Math.exp(-Math.pow((r-D.pool-.3)/.8,2))*.42,far=fn229Sm(fn229K(r,16,44)),n=(fn229Fbm(x*.16+3,0,z*.16+7)-.5)*(.25+3.2*far)+(fn229Nz(x*.7,2,z*.7)-.5)*(.1+.5*far);
  return fn229Lerp(-1.3,rim+n+far*far*4.5,fn229Sm(fn229K(r,D.pool-.6,D.pool)))}
// rock tones
var FN229DC={rock:[.21,.22,.27],rockD:[.1,.105,.14],rockL:[.33,.34,.4],wet:[.14,.15,.24],obs:[.035,.03,.05],root:[.13,.09,.08],rootL:[.24,.17,.13],ston:[.3,.28,.34],brass:[.5,.38,.16]};
function fn229Den(){const V=THREE.Vector3,D=FN229D,C=FN229DC,g=new THREE.Group(),S={g,U:{},rocks:[],orbs:[],mono:[]};g.name='fn229den';g.userData.psNo=1;
  const mr=S.mRock=fn229Mat({grime:.34,rim:.35,em:0xc060ff,emK:0}),rng=fn229Rng(229);
  const mesh=(B,mat,par)=>{const m=new THREE.Mesh(fn229Geo(B),mat||mr);m.userData.lpsSkip=1;m.frustumCulled=false;(par||g).add(m);return m};
  const tone=(p,ny)=>{const n=fn229Fbm(p[0]*.21+2,p[1]*.3,p[2]*.21+4),st=.5+.5*Math.sin(p[1]*1.7+n*5);let c=fn229Mx(C.rockD,C.rock,st*.7+n*.5);if(ny>.4)c=fn229Mx(c,C.rockL,.45*ny);return fn229Sh(c,.75+.5*n)};
  // --- the cavern's shell (seen from inside) ---
  {const B=fn229Buf(),NA=44,NE=13,eM=Math.acos(D.shR/D.R),R=[];for(let i=0;i<=NE;i++){const e=eM*Math.pow(i/NE,.92),r=[];for(let j=0;j<NA;j++)r.push(fn229DenShell(j/NA*6.2832,e));R.push(r)}
    S.shellTop=R[NE][0][1];fn229Loft(B,R,(i,j,c)=>tone(c,-.2+i/NE*.2),{cap0:false,cap1:false});mesh(B)}
  // --- the floor ---
  {const B=fn229Buf(),NA=44,rs=[0,2.5,5.2,5.9,6.4,7.2,8.6,10.5,13,16,20,25,31,38,48],R=rs.map(r=>{const q=[];for(let j=0;j<NA;j++){const a=j/NA*6.2832+(r*.13),x=Math.sin(a)*r,z=Math.cos(a)*r;q.push([x,fn229DenFloor(x,z),z])}return q});
    fn229Loft(B,R,(i,j,c)=>{const r=Math.hypot(c[0],c[2]);let col=tone(c,.8);if(r<7.4)col=fn229Mx(col,C.wet,.6);if(r<5.9)col=fn229Sh(C.wet,.5);return col},{cap0:true,cap1:false});mesh(B)}
  // --- the fountain's throat: a well shaft of dressed stone rings high up, raw rock and roots lower down ---
  {const B=fn229Buf(),NA=14,y0=S.shellTop-.6,N=16,R=[];for(let i=0;i<=N;i++){const y=y0+i/N*D.shH,r=[];for(let j=0;j<NA;j++){const a=j/NA*6.2832,st=i>=9,k=st?(i%2?1:1.07):1+(fn229Nz(Math.sin(a)*2,y*.3,Math.cos(a)*2)-.5)*.3;
        r.push([Math.sin(a)*(D.shR+.15)*k,y,Math.cos(a)*(D.shR+.15)*k])}R.push(r)}
    fn229Loft(B,R,(i,j,c)=>i>=9?fn229Sh(fn229Mx(C.ston,C.rockD,(i%2?.15:.55)+(j%3==0?.2:0)),.7+.45*fn229H(i,j,2)):tone(c,0),{cap0:false,cap1:true,
      em:(i,j,p)=>i>=10&&i%2==0&&j%2==0?1:0});
    S.shaft=mesh(B,S.mShaft=fn229Mat({grime:.3,rim:.3,em:0x9a84ff,emK:.3,iri:.15}));S.shaftY=[y0,y0+D.shH]}
  // --- the pool: essence (3795's shader), mist, the falling thread of essence from the throat ---
  {const pool=new THREE.Mesh(new THREE.CircleGeometry(D.pool-.25,48).rotateX(-Math.PI/2),se208Iri({op:.93,glow:.55,side:THREE.DoubleSide}));pool.position.y=-.22;pool.renderOrder=3;g.add(pool);S.pool=pool;
    const hS=S.shaftY[1]+2,st=new THREE.Mesh(new THREE.CylinderGeometry(.16,.24,hS,10,24,true),se208Iri({op:.78,flow:.9,strk:1,glow:.9}));st.position.y=hS/2-.2;st.renderOrder=5;g.add(st);S.stream=st;
    const halo=new THREE.Mesh(new THREE.CylinderGeometry(.5,.62,hS,10,1,true),se208Iri({op:.13,flow:.5,strk:1,glow:.6,add:1}));halo.position.y=hS/2-.2;halo.renderOrder=5;g.add(halo);S.halo=halo;
    const mi=(n,o,y)=>{const p=se208Mist(n,o);p.position.y=y;g.add(p);return p};
    S.mist=[mi(200,{r:D.pool-.4,h:1.1,sz:1.4,op:.2,spd:.04,seed:2291,up:.06},-.2),mi(90,{r:1.5,h:3.2,sz:.9,op:.36,spd:.1,seed:2292,up:.5},-.2),mi(46,{r:2.2,h:7,sz:.2,op:.8,spd:.07,seed:2293,up:.3,add:1},-.2)];
    
    // one mote for every Sovereign poured, circling the thread
    S.motes=[];const mg=S.moteG=new THREE.OctahedronGeometry(.07,0);for(let i=0;i<6;i++){const m=new THREE.Mesh(mg,new THREE.MeshBasicMaterial({color:typeof se208Col=='function'?se208Col(i):0xffffff,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false}));m.userData.lpsSkip=1;m.renderOrder=7;g.add(m);S.motes.push(m)}
    se208Skip(g)}
  // --- stalagmites and stalactites (none south of the pool where the cameras work, none over his shore) ---
  {const B=fn229Buf(),spike=(x,y,z,h,r,dn)=>{const n=5,lean=[(rng()-.5)*.25,dn?-1:1,(rng()-.5)*.25],R=[[0,r],[.35,r*.62],[.7,r*.3]].map(q=>fn229Ring(n,0,q[1],q[1]).map(p=>[x+p[0]+lean[0]*h*q[0],y+(dn?-1:1)*h*q[0],z+p[2]+lean[2]*h*q[0]]));
      const tip=[x+lean[0]*h,y+(dn?-1:1)*h,z+lean[2]*h];fn229Loft(B,R,(i,j,c)=>tone(c,.3),{cap0:false,cap1:false});const L=R[2];for(let j=0;j<n;j++)fn229Tri(B,L[j],L[(j+1)%n],tip,tone(tip,.5))};
    for(let i=0;i<70;i++){const a=rng()*6.2832,r=14+rng()*28,x=Math.sin(a)*r,z=Math.cos(a)*r;if(!fn229DenOpen(x,z,1.5))continue;
      const h=1.5+rng()*rng()*9;spike(x,fn229DenFloor(x,z)-.3,z,h,.35+h*.11,false)}
    for(let i=0;i<110;i++){const a=rng()*6.2832,r=7+rng()*33,x=Math.sin(a)*r,z=Math.cos(a)*r;if(Math.hypot(x-D.hole[0],z-D.hole[2])<D.holeR+2.5)continue;if(Math.abs(Math.atan2(x,z))<.85&&r<34)continue;const h=1.5+rng()*rng()*10;spike(x,fn229DenCeil(x,z)+1.2,z,h+1.2,.3+h*.09,true)}
    mesh(B)}
  // --- roots of the meadow's trees, through the roof round the throat (north half only: the descent's camera comes down the south side) ---
  {const B=fn229Buf();for(let i=0;i<13;i++){const a=Math.PI*(.55+.9*rng()),r0=3.2+rng()*6,len=7+rng()*13,x0=Math.sin(a)*r0,z0=Math.cos(a)*r0;if(Math.hypot(x0-D.hole[0],z0-D.hole[2])<D.holeR+3.2)continue;const y0=fn229DenCeil(x0,z0)+1.5,th=.35+rng()*.3,w1=rng()*6,w2=rng()*6,R=[];
      for(let s=0;s<=7;s++){const u=s/7,x=x0+Math.sin(u*3+w1)*1.3*u+Math.sin(a)*u*2,z=z0+Math.cos(u*2.4+w2)*1.3*u+Math.cos(a)*u*2,y=y0-len*u;R.push(fn229Ring(5,0,th*(1-u*.86),th*(1-u*.86)).map(p=>[x+p[0],y,z+p[2]]))}
      fn229Loft(B,R,(q,j,c)=>fn229Sh(fn229Mx(C.root,C.rootL,.5+.5*Math.sin(j*2.5+q)),.7+.5*fn229H(q,j,i)),{cap0:false,cap1:true})}mesh(B)}
  // --- his black stones: seven leaning shards of obsidian round the pool, cut with marks that wake as he feeds ---
  {const mo=S.mObs=fn229Mat({grime:.1,rim:.5,em:0xb040ff,emK:.5});D.stones.forEach((deg,i)=>{const a=deg*Math.PI/180,r=11.8+(i%2)*1.5,x=Math.sin(a)*r,z=Math.cos(a)*r;
      const B=fn229Buf(),h=6.5+fn229H(i,1,3)*4.5,w=.95+fn229H(i,2,3)*.5,R=[[0,w,w*.62],[.3,w*.92,w*.55],[.7,w*.6,w*.4],[1,w*.12,w*.1]].map((q,n)=>fn229Ring(5,q[0]*h,q[1],q[2]).map(p=>[p[0]+(n==2?.25:0),p[1],p[2]]));
      fn229Loft(B,R,(q,j,c)=>fn229Sh(C.obs,.6+1.6*fn229H(q,j,i)),{cap0:false,cap1:true});
      // marks cut into the face that looks at the pool: small bright slivers
      for(let q=0;q<6;q++){const y=h*(.16+.1*q),ww=w*(.9-.55*y/h)*.5,x0=(fn229H(q,i,4)-.5)*ww,zf=w*.62*(1-.45*y/h)+.03+(y>h*.3?.12*(y/h):0),d=.07+.05*fn229H(q,i,5),tl=(fn229H(q,i,6)-.5)*.5;
        fn229Tri(B,[x0-d*.3+.25*(y>h*.5?1:0),y-d*2.4,zf],[x0+d*.3+.25*(y>h*.5?1:0),y-d*2.4+tl*d,zf],[x0+tl*d+.25*(y>h*.5?1:0),y+d*2.4,zf-.06],[.9,.5,1],{e:1})}
      const m=mesh(B,mo);m.position.set(x,fn229DenFloor(x,z)-.4,z);m.rotation.set(0,a+Math.PI,0);m.rotateX(-.2-.12*fn229H(i,5,3));S.mono.push(m)})}
  // --- dark orbs: lightless spheres with a violet edge, drifting over the stones ---
  {const mo=S.mOrb=fn229Mat({grime:0,rim:5});const og=S.orbG=new THREE.IcosahedronGeometry(1,1).toNonIndexed();og.setAttribute('color',new THREE.BufferAttribute(new Float32Array(og.attributes.position.count*3).fill(.004),3));
    ['em','rv'].forEach(k=>og.setAttribute(k,new THREE.BufferAttribute(new Float32Array(og.attributes.position.count),1)));
    for(let i=0;i<5;i++){const m=new THREE.Mesh(og,mo);m.userData.lpsSkip=1;m.userData.a=i/5*6.2832+.6;m.userData.r=10+2.5*fn229H(i,7,1);m.userData.y=7+4*fn229H(i,8,1);m.scale.setScalar(.5+.4*fn229H(i,9,1));g.add(m);S.orbs.push(m)}}
  // --- black smoke: off the stones, and coiling round him ---
  S.smoke=[];S.mono.forEach((m,i)=>{const p=fn229Smoke(26,{r:1.1,h:9,sz:2.6,op:.5,spd:.07,seed:40+i});p.position.copy(m.position);g.add(p);S.smoke.push(p)});
  S.coil=fn229Smoke(150,{r:1,h:1,sz:1.2,op:0,spd:.3,seed:77,helix:1});g.add(S.coil);
  S.spark=fn229Smoke(120,{r:1,h:1,sz:.3,op:0,spd:.42,seed:78,helix:1,add:1,col:0xe060ff});g.add(S.spark);
  // --- the way out: a ragged hole to the dusk sky, the light that falls through it, the rock that comes down ---
  {const hx=D.hole[0],hz=D.hole[2],hy=fn229DenCeil(hx,hz)-1.6;S.holeY=hy;const hg=S.holeG=new THREE.Group();hg.position.set(hx,hy,hz);hg.visible=false;g.add(hg);
    const sky=new THREE.Mesh(new THREE.CircleGeometry(D.holeR,9).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color(1.5,1.35,2.2),fog:false,side:THREE.DoubleSide}));sky.userData.lpsSkip=1;hg.add(sky);S.sky=sky;
    const B=fn229Buf();for(let i=0;i<16;i++){const a=i/16*6.2832,r=D.holeR*(.82+.3*fn229H(i,1,6)),len=1.2+2.2*fn229H(i,2,6);fn229Cone(B,[Math.sin(a)*(r+1),-.2-.8*fn229H(i,3,6),Math.cos(a)*(r+1)],[-Math.sin(a)*.8,-.5,-Math.cos(a)*.8],len,.9,4,C.rockD,C.rock)}
    mesh(B,mr,hg);
    const sm=S.mShaftL=new THREE.ShaderMaterial({uniforms:{t:FN229.L.t,op:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
      vertexShader:'varying vec2 vU;varying vec3 vP;void main(){vU=uv;vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform float t,op;varying vec2 vU;varying vec3 vP;void main(){float s=.55+.45*sin(vU.x*37.+sin(vU.x*11.)*3.+t*.2);float a=op*pow(vU.y,1.6)*(.12+.3*s)*smoothstep(0.,.08,vU.y);gl_FragColor=vec4(vec3(.8,.8,1.)*a,a);}'});
    sm.userData.lpsSkip=1;const cone=new THREE.Mesh(new THREE.CylinderGeometry(D.holeR*.92,D.holeR*1.9,hy+1.5,20,1,true),sm);cone.position.set(0,-(hy+1.5)/2,0);cone.userData.lpsSkip=1;cone.renderOrder=6;hg.add(cone);S.shaftL=cone;
    S.dust=se208Mist(90,{r:D.holeR*1.2,h:hy,sz:.3,op:.0,spd:.05,seed:2295,up:.3,add:1});S.dust.position.set(hx,0,hz);g.add(S.dust);
    const rg=S.rockG=new THREE.IcosahedronGeometry(1,0).toNonIndexed(),n=rg.attributes.position.count,cc=new Float32Array(n*3);for(let i=0;i<n;i+=3){const k=.6+.9*fn229H(i,2,2);for(let q=0;q<3;q++){cc[(i+q)*3]=C.rock[0]*k;cc[(i+q)*3+1]=C.rock[1]*k;cc[(i+q)*3+2]=C.rock[2]*k}}
    rg.setAttribute('color',new THREE.BufferAttribute(cc,3));['em','rv'].forEach(k=>rg.setAttribute(k,new THREE.BufferAttribute(new Float32Array(n),1)));
    for(let i=0;i<34;i++){const a=rng()*6.2832,r=Math.sqrt(rng())*D.holeR*1.25,m=new THREE.Mesh(rg,mr);m.userData.lpsSkip=1;m.visible=false;const s=.35+rng()*rng()*1.7;m.scale.set(s,s*(.6+rng()*.7),s*(.7+rng()*.6));
      m.userData.p0=new V(hx+Math.sin(a)*r,hy-.5,hz+Math.cos(a)*r);m.userData.v=new V(Math.sin(a)*(1+rng()*4),-1-rng()*5,Math.cos(a)*(1+rng()*4));m.userData.w=new V(rng()*4-2,rng()*4-2,rng()*4-2);m.userData.d=rng()*.7;g.add(m);S.rocks.push(m)}
    // the lance of black fire he breaks the roof with
    const lm=S.mLance=fn229Mat({grime:0,rim:7,tr:1,op:1});const lg=new THREE.CylinderGeometry(.3,.5,1,7,1,true).translate(0,.5,0).toNonIndexed(),ln=lg.attributes.position.count;lg.setAttribute('color',new THREE.BufferAttribute(new Float32Array(ln*3).fill(.003),3));
    ['em','rv'].forEach(k=>lg.setAttribute(k,new THREE.BufferAttribute(new Float32Array(ln),1)));S.lance=new THREE.Mesh(lg,lm);S.lance.userData.lpsSkip=1;S.lance.visible=false;g.add(S.lance);
    S.lanceG=new THREE.Mesh(new THREE.CylinderGeometry(.5,1,1,9,1,true).translate(0,.5,0),new THREE.MeshBasicMaterial({color:new THREE.Color(1.3,.25,1.8),transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    S.lanceG.userData.lpsSkip=1;S.lanceG.visible=false;S.lanceG.renderOrder=7;g.add(S.lanceG)}
  g.traverse(o=>{o.userData.lpsSkip=1});g.position.set(TOWNS[0].cx,D.Y,TOWNS[0].cy);g.visible=false;return S}
// black smoke (or bright sparks): points animated in the shader. Plain: a column of radius r, height h. Helix: wound round a centre
// (uniforms c, hr = radius, hh = height, tw = turns) for the coils round him.
var FN229_SMOKE={
  v:'uniform float t,vh,sz,h,r,hr,hh,tw,hel;uniform vec3 c;attribute vec4 sd;varying float vA;\n#include <fog_pars_vertex>\n'+
    'void main(){float l=fract(sd.z+t*sd.w);vec3 p;if(hel>.5){float a=sd.x+l*6.2832*tw+t*.9;float rr=hr*(.55+.6*sd.y)*(1.-.35*l);p=c+vec3(cos(a)*rr,l*hh,sin(a)*rr);}'+
    'else{float a=sd.x+l*2.4*(sd.y>.5?1.:-1.)+sin(t*.6+sd.x*3.)*.4;float rr=r*(.2+.8*sd.y)*(1.+l*.9);p=position+vec3(cos(a)*rr,l*h,sin(a)*rr);}'+
    'vec4 mvPosition=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mvPosition;gl_PointSize=clamp(sz*(.5+l*1.2)*projectionMatrix[1][1]*vh*.5/max(.1,-mvPosition.z),1.,220.);vA=sin(l*3.1416)*(.45+.55*sd.y);\n#include <fog_vertex>\n}',
  f:'uniform float op;uniform vec3 col;varying float vA;\n#include <fog_pars_fragment>\nvoid main(){vec2 q=gl_PointCoord-.5;float d=length(q);if(d>.5)discard;float s=smoothstep(.5,.05,d);gl_FragColor=vec4(col,op*vA*s);\n#include <fog_fragment>\n}'};
function fn229Smoke(n,o){o=o||{};const g=new THREE.BufferGeometry(),P=new Float32Array(n*3),Sd=new Float32Array(n*4),R=fn229Rng(o.seed||7);
  for(let i=0;i<n;i++){Sd[i*4]=R()*6.283;Sd[i*4+1]=R();Sd[i*4+2]=R();Sd[i*4+3]=(o.spd||.1)*(.6+.8*R())}
  g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('sd',new THREE.BufferAttribute(Sd,4));
  const U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{sz:{value:o.sz||1},h:{value:o.h||3},r:{value:o.r||1},op:{value:o.op==null?.5:o.op},hr:{value:1},hh:{value:1},tw:{value:2},hel:{value:o.helix?1:0},
    c:{value:new THREE.Vector3()},col:{value:new THREE.Color(o.col==null?0x06040a:o.col)}}]);U.t=FN229.L.t;U.vh=SE208.U.vh;
  const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:FN229_SMOKE.v,fragmentShader:FN229_SMOKE.f,transparent:true,depthWrite:false,fog:!o.add,blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending});m.userData.lpsSkip=1;
  const p=new THREE.Points(g,m);p.frustumCulled=false;p.renderOrder=o.add?8:5;p.userData.lpsSkip=1;return p}
// per frame: what moves by itself (t seconds); the director sets the rest (S.coil / S.spark uniforms, the hole, the lance)
function fn229DenTick(S,t){const D=FN229D;S.motes.forEach((m,i)=>{const a=t*.5+i/6*6.2832,r=1.1+.25*Math.sin(t*.9+i*2);m.position.set(Math.sin(a)*r,2.6+1.1*Math.sin(t*.6+i*1.4)+i*.25,Math.cos(a)*r);m.rotation.set(t,t*1.3,0)});
  S.orbs.forEach((m,i)=>{const u=m.userData,a=u.a+t*.08*(i%2?1:-1);m.position.set(Math.sin(a)*u.r,u.y+Math.sin(t*.5+i*2)*.8,Math.cos(a)*u.r)});S.stream.rotation.y=t*.3}
// the roof breaks at t0: rocks fall (pure function of the time since), the sky shows, light and dust come down
function fn229DenBreak(S,u){const D=FN229D,on=u>=0;S.holeG.visible=on;if(!on){S.rocks.forEach(m=>m.visible=false);S.dust.material.uniforms.op.value=0;return}
  S.mShaftL.uniforms.op.value=.5*fn229Sm(fn229K(u,.1,1.4));S.dust.material.uniforms.op.value=.9*fn229Sm(fn229K(u,.3,1.6));
  S.rocks.forEach(m=>{const q=m.userData;let v=u-q.d*.5;if(v<0){m.visible=false;return}
    if(q.tl==null){let tl=1;for(let n=0;n<3;n++){const fy=fn229DenFloor(q.p0.x+q.v.x*tl,q.p0.z+q.v.z*tl)+m.scale.y*.5;tl=(q.v.y+Math.sqrt(q.v.y*q.v.y+36*(q.p0.y-fy)))/18}q.tl=tl}
    const land=v>=q.tl;v=Math.min(v,q.tl);m.position.set(q.p0.x+q.v.x*v,q.p0.y+q.v.y*v-9*v*v,q.p0.z+q.v.z*v);m.rotation.set(q.w.x*v,q.w.y*v,q.w.z*v);
    m.visible=!land||Math.hypot(m.position.x-D.at[0],m.position.z-D.at[2])>2.4})}
function fn229DenFree(S){if(!S)return;const g=S.g;if(g.parent)g.parent.remove(g);g.traverse(o=>{if(o.geometry&&!o.geometry.userData.keep)o.geometry.dispose();if(o.material&&o.material.dispose)o.material.dispose()})}
