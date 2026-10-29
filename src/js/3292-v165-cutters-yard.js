// ================= v165 Searing Sands III · the salt-cutters' yard, the overlook, building the Sandskimmer =================
// The old gateway clearing at the end of the Salt Wastes is the salt-cutters' yard: an unfinished Sandskimmer hull on its cradle
// (trestles, scaffolding, a hoist), stacks of cut salt, a salt cart, a workbench, an awning over crates. Past the cradle the
// rim is cut away: a stone lip with a balustrade, two cairns with pennants and the cutters' slipway running down over the edge,
// and below it the deep desert to the horizon — dunes, mesas, a sandstorm wall in the distance and the Den's dark peak far off
// (ss165Vista: shown only in III, never fogged away).
//  * With the five parts (3290), F at the cradle builds the machine: the parts fly onto the hull one by one, sparks and hammering,
//    the turbine spins up. Then F · Board the Sandskimmer: the first time it starts the Sandstorm Run (3300); after that it rides
//    straight to the Den.
//  * Map (0045 hook ss165T3Map): the lip is walkable; terrain (ss165T3Terrain): the yard is flattened, the rim beyond the lip
//    falls away in a cliff. The map work is pure numbers (no seeded draws).
var CS165={g:null,err:0,R:null,bld:null,vis:null};
function ss165T3(DW){if(ss165T3.c)return ss165T3.c;const F=ss165F(2,DW),r=F.reach,T={F,r,y0:null,edge:r+3.4,cr:{a:r-6.2,b:0},plat:5.2};return ss165T3.c=T}
// the cut through the rim: how wide it is at a (the lip is walkable up to the edge; beyond, it widens as it falls away)
function ss165T3W(T,a){return a<T.edge?T.plat:T.plat+1.5+(a-T.edge)*.9}
function ss165T3Map(m,bio,DW){try{const T=ss165T3(DW),F=T.F,I=F.I;for(let a=T.r-3;a<T.edge;a+=.35)for(let b=-T.plat;b<=T.plat;b+=.35){const [x,z]=F.W2(a,b),X=Math.round(x),Z=Math.round(z);if(!m[Z]||insAt(X,Z)!==I)continue;
    if(Math.abs(b)>T.plat-.2&&a>T.r)continue;const t=m[Z][X];if(t!=='.'&&t!=='g'&&t!=='a')m[Z][X]='.';const k=Z*W+X;DW[k]=Math.min(DW[k],-Math.max(.6,Math.min(T.edge-a,T.plat-Math.abs(b))))}}catch(e){console.warn('v165 yard map',e)}}
function ss165T3Terrain(){const T=ss165T3(),F=T.F,I=F.I,HI=(i,j)=>(j+HPD)*HW+i+HPD;if(T.y0==null)T.y0=HF[HI(Math.round(F.x),Math.round(F.z))];const y0=T.y0;
  for(let j=Math.floor(F.z-45);j<=F.z+45;j++)for(let i=Math.floor(F.x-45);i<=F.x+45;i++){if(insAt(i,j)!==I)continue;const [a,b]=F.L2(i,j),k=HI(i,j);
    // the yard: flat round the cradle
    if(a>T.cr.a-6&&a<T.edge&&Math.abs(b)<T.plat+.5&&MAP[j]&&'.ga'.includes(MAP[j][i]||'x')){HF[k]=y0;continue}
    if(a<T.r-2)continue;const wn=ss165T3W(T,a),ab=Math.abs(b);if(ab>wn+3)continue;
    const drop=a<T.edge?y0:y0-42*smt(0,4.5,a-T.edge),w=smt(wn,wn+3,ab);HF[k]=drop*(1-w)+HF[k]*w}}
function ss165Keep3(g,x,z){if(g!==insG(3,2))return false;const T=ss165T3(),[a,b]=T.F.L2(x,z);return a>T.cr.a-9&&Math.abs(b)<ss165T3W(T,Math.max(a,T.r))+4}
// ---------------- the yard ----------------
function cs165Build(){if(CS165.g)return CS165.g;const T=ss165T3(),F=T.F,g=new THREE.Group();g.name='CuttersYard';scene.add(g);CS165.g=g;const y0=T.y0!=null?T.y0:GH(F.x,F.z),W2=F.W2,yw=F.yaw,R=dkRng(16570);
  const rot=(a,b)=>Math.atan2(a*F.fx+b*F.lx,a*F.fz+b*F.lz);
  const wood=0x7a5a38,wood2=0x5a3e24,saltc=0xf0ece4,salt2=0xe0d8cc,canvas=0xd8ccb0,red=0x8a2a1a,iron=0x4a4a50,stone=0xb8a888,stone2=0x9a8a70,rope=0xb89a68;
  g.add(dt168Group('CS165|yard',q=>{dt168Up(q);const P=(a,b,h)=>{const [x,z]=W2(a,b);return [x,y0+h,z]};const box=(c,a,b,h,sx,sy,sz,ry,rx,rz)=>{const p=P(a,b,h);q.p('','box','c',c,p[0],p[1],p[2],sx,sy,sz,rx||0,yw+(ry||0),rz||0)};
    const cyl=(c,a,b,h,r,l,rx,ry,rz)=>{const p=P(a,b,h);q.p('','cyl','c',c,p[0],p[1],p[2],r,l,r,rx||0,yw+(ry||0),rz||0)};const beam=(c,A,B,r)=>q.L('','c',c,P(...A),P(...B),r,r,5);
    const ca=T.cr.a;
    // the cradle: three trestles and chocks under the hull, a plank floor
    [-2.4,0,2.4].forEach(da=>{[-1,1].forEach(s=>{beam(wood2,[ca+da,s*1.9,0],[ca+da,s*1.2,.95],.09);beam(wood2,[ca+da,s*.5,0],[ca+da,s*1.2,.95],.09)});box(wood,ca+da,0,1.0,.3,.22,2.8)});
    for(let k=0;k<9;k++)box(k%2?wood:wood2,ca-4+k*1.0,0,.05,.95,.1,4.6+(R()-.5)*.3,(R()-.5)*.04);
    // scaffolding along the port side: poles, rails, planks, a ladder
    [-3,0,3].forEach(da=>{beam(wood2,[ca+da,-2.6,0],[ca+da,-2.6,3.4],.07);beam(wood2,[ca+da,-3.6,0],[ca+da,-3.6,3.4],.07)});
    [1.7,3.3].forEach(h=>{box(wood,ca,-3.1,h,6.4,.08,1.1);beam(wood2,[ca-3,-2.6,h+.6],[ca+3,-2.6,h+.6],.04);beam(wood2,[ca-3,-3.6,h+.6],[ca+3,-3.6,h+.6],.04)});
    beam(wood2,[ca+3.4,-2.8,0],[ca+3.6,-2.8,3.4],.04);beam(wood2,[ca+3.4,-3.4,0],[ca+3.6,-3.4,3.4],.04);for(let k=0;k<7;k++)beam(wood,[ca+3.42+k*.03,-2.8,.4+k*.45],[ca+3.42+k*.03,-3.4,.4+k*.45],.03);
    // the hoist: an A-frame derrick over the stern, a rope and a hook, a winch drum
    beam(wood2,[ca-4.6,-3.2,0],[ca-4.2,0,5.2],.12);beam(wood2,[ca-4.6,3.2,0],[ca-4.2,0,5.2],.12);beam(wood2,[ca-6.6,0,0],[ca-4.2,0,5.2],.1);beam(wood,[ca-4.2,0,5.15],[ca-2.6,0,5.0],.09);
    q.L('','c',rope,P(ca-2.7,0,5.0),P(ca-2.7,0,3.2),.02,.02,4);{const p=P(ca-2.7,0,3.1);q.p('','tor','c',iron,p[0],p[1],p[2],.12,.12,.04,Math.PI/2,0,0)}cyl(wood,ca-6.2,-.9,.6,.32,.8,0,0,Math.PI/2);
    // salt: stacks of cut blocks, a cart, loose blocks, salt dust heaps
    const stack=(a,b,n,ry)=>{for(let l=0;l<n;l++)for(let c=0;c<3-Math.floor(l/2);c++){box(R()<.3?salt2:saltc,a+(c-1)*.62+(l%2)*.3,b,.27+l*.52,.58,.5,.5,ry+(R()-.5)*.08)}};
    stack(ca+1,6.6,4,.1);stack(ca-2.5,7.2,3,-.2);stack(ca+4,-6.8,3,.3);stack(ca-6,-6.2,4,0);stack(T.r-3.5,6.4,2,.5);
    // the cart: a bed, two big wheels, shafts, blocks on it
    {const a=ca-1.2,b=-6.4;box(wood,a,b,.9,2.0,.12,1.2);[-1,1].forEach(s=>{const p=P(a,b+s*.68,.62);q.p('','cyl','c',wood2,p[0],p[1],p[2],.6,.08,.6,0,yw,Math.PI/2)});beam(wood2,[a+1,b-.45,.9],[a+2.6,b-.45,.4],.05);beam(wood2,[a+1,b+.45,.9],[a+2.6,b+.45,.4],.05);
      for(let c=0;c<4;c++)box(saltc,a-.5+(c%2)*.62,b+(c<2?-.28:.28),1.2,.56,.46,.46,R()*.1)}
    // the workbench with tools, an awning over crates and barrels, a brazier
    {const a=ca+4.8,b=5.6;box(wood2,a,b,.8,2.0,.1,.8);[-1,1].forEach(s=>[-1,1].forEach(t=>box(wood2,a+s*.85,b+t*.3,.4,.08,.8,.08)));box(iron,a-.4,b,.9,.5,.04,.12,.3);box(wood,a+.3,b+.1,.92,.08,.08,.5,-.4);box(iron,a+.32,b+.33,.94,.18,.1,.1,-.4)}
    {const a=ca-1,b=-9.2;[[-2,-.7],[2,-.7],[-2,.9],[2,.9]].forEach(([da,db],k)=>beam(wood2,[a+da,b+db,0],[a+da,b+db,db<0?2.9:2.2],.06));
      const p=P(a,b+.1,2.6);q.p('','box','c',canvas,p[0],p[1],p[2],4.4,.04,2.0,-.36,yw,0);for(let c=0;c<4;c++)box(c%2?wood:wood2,a-1.4+c*.95,b,.35,.7,.7,.7,R());cyl(wood,a+1.2,b+.3,.45,.3,.9)}
    {const a=ca+5.4,b=-3.6;cyl(iron,a,b,.5,.35,.12);[0,1,2].forEach(k=>{const an=k/3*Math.PI*2;beam(iron,[a+Math.cos(an)*.3,b+Math.sin(an)*.3,.48],[a+Math.cos(an)*.45,b+Math.sin(an)*.45,0],.03)})}
    // a signpost: the yard's name
    {const a=ca-8.5,b=4.4;beam(wood2,[a,b,0],[a,b,2.4],.07);box(wood,a,b+.6,2.05,.08,.38,1.3)}
    // the lip: dressed stones along the edge, a balustrade left and right of the slipway, two cairns with pennants
    const E=T.edge;for(let b=-T.plat;b<=T.plat;b+=.7){const p=P(E-.15+(R()-.5)*.1,b,-.05);q.p('','box','c',R()<.4?stone2:stone,p[0],p[1],p[2],.65,.3,.6,0,yw+(R()-.5)*.15,0)}
    [-1,1].forEach(s=>{for(let k=0;k<4;k++){const b=s*(2.2+k*.95);cyl(stone,E-.3,b,.45,.1,.9);q.p('','sph','c',stone2,...P(E-.3,b,.95),.13,.1,.13)}beam(rope,[E-.3,s*2.2,.82],[E-.3,s*5.05,.82],.025);
      const cb=s*(T.plat+.4);for(let k=0;k<5;k++){const p=P(E-1.2,cb,.3+k*.5);q.p('','dod','c',k%2?stone2:stone,p[0],p[1],p[2],.75-k*.1,.4,.75-k*.1,R(),R()*3,0)}beam(wood2,[E-1.2,cb,2.5],[E-1.2,cb,4.6],.05);
      const pp=P(E-1.2,cb-s*.5,4.3);q.p('','box','c',red,pp[0],pp[1],pp[2],.04,.5,1.0,0,yw+Math.PI/2,0)});
    // the slipway: two greased rails on a timber trestle running down over the edge
    for(let k=0;k<10;k++){const a0=E-1+k*1.6,h0=-k*1.25;[-1,1].forEach(s=>{const A=[a0,s*1.35,h0],B=[a0+1.6,s*1.35,h0-1.25];beam(k%2?wood:wood2,A,B,.1)});if(k>1){beam(wood2,[a0,-1.35,h0],[a0+.3,-1.35,h0-6],.08);beam(wood2,[a0,1.35,h0],[a0+.3,1.35,h0-6],.08)}
      box(wood2,a0+.8,0,h0-.7,.2,.14,2.9)}
  },CY168W,.08));
  // the machine on its cradle (bare hull until built)
  try{const Rg=svRig();sk165Build(Rg);svRest(Rg);svMerge(Rg);const [x,z]=W2(T.cr.a,0);Rg.root.position.set(x,y0+.62,z);Rg.root.rotation.y=yw;g.add(Rg.root);CS165.R=Rg;cs165Parts()}catch(e){console.error('v165 skimmer',e)}
  try{CS165.vis=ss165Vista(T,y0)}catch(e){console.error('v165 vista',e)}
  return g}
function cs165Parts(){const R=CS165.R;if(!R)return;const C3=SS165.c3,b=!!C3.built;for(let i=0;i<5;i++)sk165PartShow(R,i,b||!!(CS165.fit&&CS165.fit&(1<<i)))}
// ---------------- the deep desert below the overlook (only seen from III) ----------------
function ss165Vista(T,y0){const F=T.F,g=new THREE.Group();g.name='DesertVista';const [ox,oz]=F.W2(T.edge,0);g.position.set(ox,y0,oz);g.rotation.y=F.yaw;scene.add(g);
  const haze=new THREE.Color(0xd8b890),sand=new THREE.Color(0xd2a868),sand2=new THREE.Color(0xa87848),shade=new THREE.Color(0x8a5a38),c=new THREE.Color();
  // the dune sea: local z = out over the desert, x across; long crescent dunes across the wind, shaded by hand (no lights, no fog)
  const fogC=scene.fog&&scene.fog.color?scene.fog.color.clone():haze.clone();haze.lerp(fogC,.5);
  {const N=170,S=1600,geo=new THREE.PlaneGeometry(S,S,N,N);geo.rotateX(-Math.PI/2);geo.translate(0,0,S/2-30);const P=geo.attributes.position,col=new Float32Array(P.count*3);
    const H=(x,z)=>{const u=x*.8+z*.35,v=z*.9-x*.3;return Math.pow(Math.abs(Math.sin(u*.022+Math.sin(v*.007)*2.2)),1.8)*22+Math.sin(v*.013+u*.005)*9+Math.sin(x*.06+z*.037)*1.5},L=new THREE.Vector3(-.55,.62,.55).normalize(),n=new THREE.Vector3();
    for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),d=Math.hypot(x,z),edge=smt(25,90,z);P.setY(i,-44+H(x,z)*edge);
      n.set(-(H(x+2,z)-H(x-2,z))*edge/4,1,-(H(x,z+2)-H(x,z-2))*edge/4).normalize();const sh=.42+.75*Math.max(0,n.dot(L));
      c.copy(sand).lerp(sand2,.5+.5*Math.sin(x*.01+z*.013)).multiplyScalar(sh);c.lerp(haze,smt(90,1100,d)*.9);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
    geo.setAttribute('color',new THREE.BufferAttribute(col,3));const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,fog:false}));m.userData.lpsSkip=1;g.add(m)}
  // mesas and rock fins on the way out (hazed by distance)
  {const rn=dkRng(16580),mat=new THREE.MeshBasicMaterial({vertexColors:true,fog:false});const parts=[];
    for(let k=0;k<16;k++){const d=140+rn()*700,a=(rn()-.5)*1.6,x=Math.sin(a)*d,z=Math.cos(a)*d,w=20+rn()*60,h=18+rn()*50,gg=new THREE.CylinderGeometry(w*.8,w,h,7,1);gg.translate(x,-44+h/2,z);
      const cc=new THREE.Color(0x9a5a38).lerp(haze,smt(100,900,d)*.95),n=gg.attributes.position.count,cl=new Float32Array(n*3);for(let i=0;i<n;i++){const y=gg.attributes.position.getY(i);const q=cc.clone().multiplyScalar(y>-40+h*.9?1.0:.72+.25*((i*7)%5)/5);cl[i*3]=q.r;cl[i*3+1]=q.g;cl[i*3+2]=q.b}
      gg.setAttribute('color',new THREE.BufferAttribute(cl,3));parts.push(gg.index?gg.toNonIndexed():gg)}
    // the Den: a dark peak far off to the right, a cave mouth with a dull glow
    {const gg=new THREE.ConeGeometry(120,190,9,1);gg.translate(-260,-40+95,820);const n=gg.attributes.position.count,cl=new Float32Array(n*3),cc=new THREE.Color(0x5a3a2a).lerp(haze,.55);for(let i=0;i<n;i++){cl[i*3]=cc.r;cl[i*3+1]=cc.g;cl[i*3+2]=cc.b}gg.setAttribute('color',new THREE.BufferAttribute(cl,3));parts.push(gg.toNonIndexed())}
    parts.forEach(p=>{const m=new THREE.Mesh(p,mat);m.userData.lpsSkip=1;g.add(m)});
    const glow=new THREE.Mesh(new THREE.CircleGeometry(9,12),new THREE.MeshBasicMaterial({color:0xff7a3a,transparent:true,opacity:.55,fog:false}));glow.position.set(-232,-20,742);glow.rotation.y=Math.PI*.85;g.add(glow)}
  // the sandstorm on the horizon: a slow, churning wall of dust
  {const cv=document.createElement('canvas');cv.width=256;cv.height=128;const x=cv.getContext('2d'),gr=x.createLinearGradient(0,0,0,128);gr.addColorStop(0,'rgba(200,160,110,0)');gr.addColorStop(.35,'rgba(170,120,80,.7)');gr.addColorStop(1,'rgba(120,80,50,.95)');x.fillStyle=gr;x.fillRect(0,0,256,128);
    for(let i=0;i<220;i++){x.fillStyle='rgba('+(140+Math.random()*60|0)+','+(100+Math.random()*40|0)+',70,'+(Math.random()*.25)+')';x.beginPath();x.arc(Math.random()*256,30+Math.random()*98,6+Math.random()*22,0,7);x.fill()}
    const tx=new THREE.CanvasTexture(cv);tx.wrapS=THREE.RepeatWrapping;tx.repeat.set(4,1);const m=new THREE.Mesh(new THREE.CylinderGeometry(980,980,210,40,1,true,-1.0,2.0),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,fog:false,side:THREE.DoubleSide}));
    m.position.set(0,-40+90,0);m.rotation.y=Math.PI;g.add(m);CS165.storm=tx}
  // dust devils wandering on the near dunes
  CS165.dev=[];for(let k=0;k<3;k++){const d=new THREE.Mesh(svG('cs_dev',()=>{const q=new THREE.ConeGeometry(4,26,10,1,true);q.rotateX(Math.PI);q.translate(0,13,0);return q}),new THREE.MeshBasicMaterial({color:0xc8a070,transparent:true,opacity:.22,depthWrite:false,fog:false,side:THREE.DoubleSide}));
    g.add(d);CS165.dev.push({m:d,a:k*2.1,r:120+k*90})}
  return g}
// ---------------- building ----------------
function cs165CanBuild(){return SS165.c3.got===31&&!SS165.c3.built}
function cs165Assemble(own){if(CS165.bld||SS165.c3.built)return;if(typeof co151On=='function'&&co151On()&&own&&typeof co165Build=='function')co165Build();CS165.bld={t:0,k:0};CS165.fit=0;cs165Parts();
  say('⚙️ You haul the parts onto the cradle and set to work…');try{zt116Show(ZT116.Z[3],'Searing Sands · Main Quest','The Sandskimmer','Built from salt-locked parts','','z3')}catch(_){}}
function cs165BuildTick(dt){const B=CS165.bld,R=CS165.R;if(!B||!R)return;B.t+=dt;const order=[1,0,4,3,2];
  while(B.k<5&&B.t>.9+B.k*1.25){const i=order[B.k++],to=new THREE.Vector3();R.part[i].getWorldPosition(to);to.y+=1.2;const m=sk165PartMesh(i);m.scale.setScalar(.6);
    svShot(gY(pl.position,1.4),to,.6,0xfff0d0,1,2.5,()=>{CS165.fit|=1<<i;cs165Parts();burst(to,0xffd070,30,1.8,1.6,.6);burst(to,0xffffff,10,2.4,2.4,.3);svSnd('heavy',.6,1.1);svSnd('crack',.4,1.8)},m)}
  if(Math.random()<dt*10&&B.k>0){const p=R.root.position.clone();p.x+=(Math.random()-.5)*3;p.z+=(Math.random()-.5)*3;p.y+=1.5;burst(p,0xffc040,3,1.6,1.4,.3)}
  if(B.t>7.6){CS165.bld=null;SS165.c3.built=1;SS165.c3.st=1;SS165.trkK='';cs165Parts();CS165.spin=1;svSnd('roar',.4,1.6);shake(.2);
    say('🛷 The Sandskimmer stands finished on its cradle, its great turbine turning over. Board it (F) to ride into the desert.')}}
// ---------------- boarding ----------------
function cs165Board(){if(!SS165.c3.built)return;if(SS165.run.st>=1||typeof sr165Start!='function'){say('🛷 You ride the Sandskimmer down the slipway and out across the deep desert to the Den…');try{insGo(INSL[insG(3,3)])}catch(e){console.error('v165 to den',e)}return}
  try{sr165Start(true)}catch(e){console.error('v165 run start',e)}}
function cs165Prompt(){if(!ss165Here(2)||!CS165.g)return null;const T=ss165T3(),P=pl.position,[x,z]=T.F.W2(T.cr.a,0),d=Math.hypot(P.x-x,P.z-z);if(d>5.2||CS165.bld)return null;const C3=SS165.c3;
  if(C3.built)return {label:'F · Board the Sandskimmer'+(SS165.run.st>=1?' · ride to the Den':' · ride into the sandstorm'),fn:()=>cs165Board()};
  if(cs165CanBuild())return {label:'F · Build the Sandskimmer (5/5 parts)',fn:()=>cs165Assemble(true)};
  return {label:'🛷 The salt-cutters’ unfinished Sandskimmer · '+ss165Bits(C3.got)+'/5 parts · mine them out of the salt columns',fn:()=>say('🧂 Its parts are locked in the great salt columns along the road through the Wastes. Mine them out with a pick.')}}
{const f=worldPrompt;worldPrompt=function(){try{const r=cs165Prompt();if(r)return r}catch(e){if(!CS165.err++)console.warn('v165 yard prompt',e)}return f.apply(this,arguments)}}
function cs165Tick(dt,now){const here=ss165Here(2);if(here&&!CS165.g)try{cs165Build()}catch(e){console.error('v165 yard build',e);CS165.err++;CS165.g=CS165.g||new THREE.Group()}if(!CS165.g)return;
  CS165.g.visible=here;if(CS165.vis)CS165.vis.visible=here;if(!here)return;const t=now/1000,R=CS165.R;
  cs165BuildTick(dt);
  if(R){const sp=SS165.c3.built?(CS165.spin?8:1.2):0;R.J.fan.rotation.z+=dt*sp;R.J.sail.rotation.y=Math.sin(t*2.3)*.35;const j=SS165.c3.built?.1+.06*Math.sin(t*9):0;R.jetM[0].opacity=j;R.jetM[1].opacity=j*.3;if(CS165.spin)CS165.spin=Math.max(0,CS165.spin-dt*.12)}
  if(CS165.storm)CS165.storm.offset.x=(t*.004)%1;
  if(CS165.dev)CS165.dev.forEach((d,k)=>{d.a+=dt*.05;d.m.position.set(Math.sin(d.a*1.3+k)*d.r*.5,-40,140+d.r+Math.cos(d.a)*60);d.m.rotation.y+=dt*2})}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{cs165Tick(dt,now)}catch(e){if(!CS165.err++)console.warn('v165 yard tick',e)}return r}}
SS165L.push(()=>{CS165.bld=null;CS165.fit=0;cs165Parts()});
