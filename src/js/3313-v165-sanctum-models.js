// ================= v165 The Hidden Sanctum — models =================
// The Sanctum is built from instanced stone: flagstones on every floor tile, ashlar courses along every wall, skull rows in the
// ossuary walls. Traps and puzzle pieces are groups of their own (they move). Everything is made once, the first time you go down.
var DG165SM={c:{st:0x4a4a4c,st2:0x3c3c40,st3:0x5a5854,moss:0x2e3a2c,iron:0x26282c,rust:0x5a3420,bone:0xb8b098,bone2:0x8a8270,wood:0x2e2418,blood:0x3a0a0a}};
function dg165SAt(I,u,v){return [I.x0+u,I.y0+v]}
// flagstones on every floor tile (the chasm's bridge has its own slabs)
function dg165SFloor(I){const C=dg165SCfg(),R=svRng(5150),w=I.w,h=I.h,ok=new Uint8Array(w*h),kind=new Array(w*h),L=[];
  for(let v=0;v<h;v++)for(let u=0;u<w;u++){const k=dg165SanFloor(u+.5,v+.5);if(k&&k!='pit'&&k!='bridge'){ok[v*w+u]=1;kind[v*w+u]=k}}
  // greedy: each free tile starts a slab of a random size that still fits on free floor tiles of the same hall
  for(let v=0;v<h;v++)for(let u=0;u<w;u++){const i=v*w+u;if(ok[i]!==1)continue;const k=kind[i],r=R();let sw=1,sh=1;
    const free=(a,b)=>a<w&&b<h&&ok[b*w+a]===1&&kind[b*w+a]===k;
    if(r<.3&&free(u+1,v)&&free(u,v+1)&&free(u+1,v+1)){sw=2;sh=2}else if(r<.55&&free(u+1,v))sw=2;else if(r<.75&&free(u,v+1))sh=2;
    for(let a=0;a<sw;a++)for(let b=0;b<sh;b++)ok[(v+b)*w+u+a]=2;L.push([u+(sw-1)/2,v+(sh-1)/2,sw,sh,k])}
  const g=dt168BBox(1,.2,1,.035),m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95,metalness:0,flatShading:true}),M=new THREE.InstancedMesh(g,m,L.length)   /* v168: bevelled slabs, tight joints */,o=new THREE.Object3D(),c=new THREE.Color();
  L.forEach(([u,v,sw,sh,k],i)=>{const r=R(),[x,z]=dg165SAt(I,u,v);o.position.set(x,C.F0-.08+(R()-.5)*.05,z);o.rotation.set((R()-.5)*.035,(R()-.5)*.05,(R()-.5)*.035);o.scale.set(sw-.02-R()*.02,1,sh-.02-R()*.02);o.updateMatrix();M.setMatrixAt(i,o.matrix);
    const b=k=='tomb'||k=='gal'?.24:.27;c.setRGB(b+r*.07,b+r*.07+.008,b+r*.06+.012);if(R()<.14)c.lerp(new THREE.Color(DG165SM.c.moss),.45);if(R()<.05)c.multiplyScalar(.55);M.setColorAt(i,c)});
  M.instanceMatrix.needsUpdate=true;if(M.instanceColor)M.instanceColor.needsUpdate=true;M.receiveShadow=true;M.frustumCulled=false;return M}
// ashlar courses along every wall: each floor tile next to rock gets a column of blocks on that side (courses of mixed heights,
// one long block or two short ones, a few fallen out), buttresses every few tiles, a cornice along the top, skulls in the ossuary
function dg165SWalls(I){const C=dg165SCfg(),L=[],sk=[],R=svRng(5151);
  const fl=(u,v)=>{const k=dg165SanFloor(u+.5,v+.5);return k&&k!='pit'?k:k=='pit'?'pit':null};
  const CH=[.5,.62,.74];
  for(let v=0;v<I.h;v++)for(let u=0;u<I.w;u++){const k=fl(u,v);if(!k||k=='pit'||k=='bridge')continue;
    for(const [du,dv] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=fl(u+du,v+dv);if(n)continue;const ossu=k=='gal'||k=='tomb',bx=I.x0+u+du*.75,bz=I.y0+v+dv*.75;
      let y=C.F0,c=0;while(y<C.F0+4.3){const hgt=CH[(R()*3)|0],two=R()<.45,n2=two?2:1;
        for(let b=0;b<n2;b++){if(R()<.035&&c>1)continue;const t=n2==1?0:(b?.25:-.25)+(R()-.5)*.04,len=(n2==1?.98:.48)-R()*.03;
          L.push([bx+(dv?t:0)+du*(R()-.5)*.06,y+hgt/2,bz+(du?t:0)+dv*(R()-.5)*.06,du?.5:len,hgt*.95,du?len:.5,R(),ossu?1:0]);
          if(ossu&&c>=1&&y<C.F0+3.2&&R()<.85)sk.push([I.x0+u+du*.45+(dv?t:0),y+hgt/2,I.y0+v+dv*.45+(du?t:0),Math.atan2(-du,-dv),n2])}
        y+=hgt;c++}
      // the cornice and, every few tiles, a buttress
      L.push([bx-du*.08,C.F0+4.45,bz-dv*.08,du?.75:1.02,.28,du?1.02:.75,.3,2]);
      if(((u*31+v*17)%5)==0){L.push([I.x0+u+du*.42,C.F0+2.2,I.y0+v+dv*.42,du?.36:.7,4.4,du?.7:.36,.5,3]);L.push([I.x0+u+du*.38,C.F0+.25,I.y0+v+dv*.38,du?.5:.86,.5,du?.86:.5,.6,3])}}}
  const g=dt168BBox(1,1,1,.06),m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.92,flatShading:true}),M=new THREE.InstancedMesh(g,m,L.length)   /* v168: bevelled ashlar */,o=new THREE.Object3D(),c=new THREE.Color();
  L.forEach((q,i)=>{o.position.set(q[0],q[1],q[2]);o.rotation.set((R()-.5)*.03,(R()-.5)*.04,(R()-.5)*.03);o.scale.set(q[3],q[4],q[5]);o.updateMatrix();M.setMatrixAt(i,o.matrix);
    const b=q[7]==1?.2:q[7]==2?.17:q[7]==3?.23:.22,r=q[6];c.setRGB(b+r*.07,b+r*.065,b+r*.055);if(r<.1&&q[7]<2)c.lerp(new THREE.Color(DG165SM.c.moss),.55);if(r>.96)c.multiplyScalar(.6);M.setColorAt(i,c)});
  M.instanceMatrix.needsUpdate=true;if(M.instanceColor)M.instanceColor.needsUpdate=true;M.castShadow=false;M.receiveShadow=true;M.frustumCulled=false;
  // skulls stacked in the ossuary walls, looking out from their niches, with dark eye sockets
  const sg=new THREE.IcosahedronGeometry(.1,1);sg.scale(1,1.05,1.2);const sm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,flatShading:true}),N=sk.reduce((a,q)=>a+(q[4]==1?3:2),0),S=new THREE.InstancedMesh(sg,sm,N);
  const eg=new THREE.SphereGeometry(.03,5,3),E=new THREE.InstancedMesh(eg,new THREE.MeshBasicMaterial({color:0x050404}),N*2);let n=0;
  sk.forEach(q=>{const a=q[3],m2=q[4]==1?3:2,sp=q[4]==1?.3:.22;for(let j=0;j<m2;j++){const lt=(j-(m2-1)/2)*sp,x=q[0]+Math.cos(a)*lt,z=q[2]-Math.sin(a)*lt,y=q[1]+(R()-.5)*.08,ry=a+(R()-.5)*.6,s=.85+R()*.3;
    o.position.set(x,y,z);o.rotation.set((R()-.5)*.35,ry,(R()-.5)*.25);o.scale.setScalar(s);o.updateMatrix();S.setMatrixAt(n,o.matrix);const r=R();c.setRGB(.42+r*.12,.38+r*.1,.3+r*.08);S.setColorAt(n,c);
    for(let e=0;e<2;e++){const ex=(e?.034:-.034)*s,fx=Math.sin(ry)*.105*s,fz=Math.cos(ry)*.105*s;o.position.set(x+Math.cos(ry)*ex+fx,y+.012*s,z-Math.sin(ry)*ex+fz);o.rotation.set(0,0,0);o.scale.setScalar(s);o.updateMatrix();E.setMatrixAt(n*2+e,o.matrix)}n++}});
  [S,E].forEach(q=>{q.instanceMatrix.needsUpdate=true;if(q.instanceColor)q.instanceColor.needsUpdate=true;q.frustumCulled=false});
  return [M,S,E]}
// a brazier on a tripod of iron (its fire is a flame sprite added by the builder at local y 1.25)
function dg165BrazierKit(k){const C=DG165SM.c;for(let i=0;i<3;i++){const a=i/3*6.283;k.L('','m',C.iron,[Math.cos(a)*.42,0,Math.sin(a)*.42],[Math.cos(a)*.22,1.0,Math.sin(a)*.22],.035,.03,4)}
  k.p('','cyl','m',C.iron,0,1.08,0,.42,.22,.42);k.p('','ring','m',C.rust,0,1.18,0,.44,.5,.44);for(let i=0;i<6;i++)k.p('','dod','c',i%2?0x2a1408:0x5a2a10,(Math.random()-.5)*.4,1.2,(Math.random()-.5)*.4,.1,.07,.1);k.p('','sph','g',0xff8a30,0,1.2,0,.22,.06,.22)}
// ---------------- trap and puzzle pieces ----------------
// a pendulum: beam across the corridor, a long iron arm, a great crescent blade (pivot at the group's origin, swings round local z)
function dg165Pendulum(){const g=new THREE.Group(),C=DG165SM.c;
  g.add(dt168G('DG165|pbeam',k=>{k.p('','box','c',C.wood,0,0,0,8.6,.5,.6);[-1,1].forEach(s=>k.p('','box','m',C.iron,s*3.9,0,0,.18,.6,.7));k.p('','cyl','m',C.iron,0,0,0,.16,.9,.16,Math.PI/2,0,0)},0));
  const arm=new THREE.Group();g.add(arm);g.userData.arm=arm;
  arm.add(dt168G('DG165|parm',k=>{k.L('','m',C.iron,[0,0,0],[0,-6.6,0],.07,.06,6);for(let i=0;i<4;i++)k.p('','ring','m',C.rust,0,-1.2-i*1.4,0,.1,.5,.1);
    // the blade: a crescent of dark iron with a bright edge, notched and stained
    const sh=new THREE.Shape();sh.moveTo(-1.5,.2);sh.quadraticCurveTo(0,-.55,1.5,.2);sh.quadraticCurveTo(0,-1.25,-1.5,.2);
    const bg=new THREE.ExtrudeGeometry(sh,{depth:.06,bevelEnabled:true,bevelThickness:.03,bevelSize:.04,bevelSegments:1,curveSegments:10});bg.translate(0,0,-.03);
    k.p('',bg,'m',0x3a3c42,0,-6.5,0,1,1,1);k.p('','box','m',C.iron,0,-6.55,0,.5,.4,.14);k.p('','sph','m',C.rust,0,-6.5,0,.16);
    for(let i=0;i<5;i++)k.p('','box','c',C.blood,-1+i*.5,-7.05+Math.abs(i-2)*.12,.05,.18,.06,.01)},0));
  return g}
// one spike trap cell (2×2 tiles): an iron grate plate; the spikes are a separate group that rises
function dg165SpikePlateKit(k){const C=DG165SM.c;k.p('','box','m',0x2a2c30,0,.02,0,1.92,.06,1.92);for(let i=0;i<4;i++)for(let j=0;j<4;j++)k.p('','box','c',0x0a0a0a,-.72+i*.48,.055,-.72+j*.48,.16,.01,.16)}
function dg165SpikesGeo(){return svG('dg165spk',()=>{const parts=[];const R=svRng(77);for(let i=0;i<4;i++)for(let j=0;j<4;j++){const c=new THREE.ConeGeometry(.07,.95+R()*.2,5);c.translate(-.72+i*.48,.48,-.72+j*.48);parts.push(c.toNonIndexed())}
  return svMergeGeo(parts)})}
function svMergeGeo(L){let n=0;L.forEach(g=>n+=g.attributes.position.count);const pos=new Float32Array(n*3);let j=0;L.forEach(g=>{pos.set(g.attributes.position.array,j);j+=g.attributes.position.array.length;g.dispose()});
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.computeVertexNormals();return G}
// a fire-breathing skull set into a wall (local +z points out of the wall)
function dg165NozzleKit(k){const C=DG165SM.c;k.p('','box','c',C.st2,0,0,-.15,.9,.9,.3);k.p('','sph','c',C.bone2,0,.05,.05,.32,.34,.3);k.p('','box','c',C.bone2,0,-.18,.12,.24,.14,.2);
  [-1,1].forEach(s=>k.p('','sph','c',0x080606,s*.12,.1,.28,.08,.08,.05));k.p('','box','c',0x080404,0,-.12,.26,.18,.1,.06);k.p('','box','c',0x1a1008,0,-.02,.33,.04,.02,.02)}
function dg165Portcullis(w,h){const g=new THREE.Group(),C=DG165SM.c;g.add(dt168G('DG165|pc'+w,k=>{const n=Math.round(w/.42);for(let i=0;i<=n;i++){const x=-w/2+i*w/n;k.L('','m',C.iron,[x,0,0],[x,h,0],.045,.045,5);k.p('','cone4','m',C.rust,x,-.12,0,.06,.24,.06,Math.PI)}
  for(let j=0;j<6;j++)k.L('','m',C.rust,[-w/2,.3+j*h/6,0],[w/2,.3+j*h/6,0],.04,.04,4)},0));return g}
function dg165PlateKit(k){k.p('','box','c',0x3a3a3e,0,.02,0,1.6,.05,1.6);k.p('','box','m',0x5a4a2a,0,.06,0,1.2,.06,1.2);k.p('','box','c',0x0a0a0a,0,.1,0,.8,.01,.8);
  for(let i=0;i<4;i++)k.p('','box','m',0x8a6a2a,Math.cos(i*Math.PI/2)*.42,.1,Math.sin(i*Math.PI/2)*.42,.14,.02,.14,0,Math.PI/4,0)}
// a chasm slab: a 2×2 stone block on a rough pillar of rock that drops into the dark
function dg165SlabKit(k,i){const R=svRng(600+i),C=DG165SM.c;k.p('','box','c',lgCol(C.st,C.st3,R()),0,-.2,0,1.9,.42,1.9,(R()-.5)*.03,(R()-.5)*.1,(R()-.5)*.03);
  for(let j=0;j<4;j++)k.p('','dod','c',lgCol(C.st2,0x201e1c,j/4),(R()-.5)*.8,-.9-j*1.6,(R()-.5)*.8,.75-j*.12,1.1,.75-j*.12,R(),R(),R());
  for(let j=0;j<3;j++)k.p('','box','c',0x161616,(R()-.5)*1.2,.02,(R()-.5)*1.2,.5+R()*.4,.01,.03,0,R()*3,0)}
// the closing wall: a slab of black stone bristling with iron spikes (local +x is the side that faces the room)
function dg165CWallKit(k,len){const C=DG165SM.c,R=svRng(91);k.p('','box','c',0x2a2a2e,0,2.1,0,1.0,4.2,len);for(let i=0;i<Math.floor(len/1.2);i++)for(let j=0;j<3;j++){const z=-len/2+.6+i*1.2+(j%2)*.6,y=.7+j*1.3;
  k.p('','cone4','m',lgCol(C.iron,C.rust,R()*.6),.75,y,z,.09,.6,.09,0,0,-Math.PI/2)}for(let i=0;i<6;i++)k.p('','box','m',C.rust,.52,.3+i*.7,0,.06,.08,len)}
// a weeping knight statue on a turntable (its sword points where it faces: local +z)
// v168: a weeping knight, sculpted: a turned plinth with a bronze band, a mailed figure in a long surcoat, a cowl over the helm, both
// hands on the pommel of a sword stood point-down, stone tears
function dg165StatueKit(k){const C=DG165SM.c,s=0x68665e,s2=0x55534c,s3=0x74726a,i0=k.P.length;
  dt168P(k,dt168Lathe([[0,0],[.95,0],[.95,.28],[.9,.32],[.84,.34],[.82,.4],[.7,.44],[0,.44]],32),'c',s2,new THREE.Matrix4());dt168P(k,dt168Geo('kband',()=>new THREE.TorusGeometry(.86,.035,6,48).rotateX(Math.PI/2)),'m',0x4a3a22,dt168Mx(0,.37,0));
  dt168P(k,dt168Sweep('knight',[[.44,.42,.42,.4,0,0,.05],[.6,.4,.4,.38,0,0,.06],[1.0,.33,.3,.3,0,0,.05],[1.35,.27,.22,.24,0,0,.03],[1.5,.25,.2,.22,0,0,.02],[1.75,.3,.22,.22,0,.0,.01],[2.0,.36,.22,.21,0,.02,0],[2.2,.38,.21,.2,0,.03,0],[2.3,.3,.17,.17,0,.04,0],[2.38,.12,.1,.1,0,.05,0],[2.44,.09,.09,.09,0,.06,0]],26,{bot:1,fk:10}),'c',s,new THREE.Matrix4());
  dt168P(k,dt168BBox(.5,.07,.3,.02),'c',s2,dt168Mx(0,1.45,.02));   // the belt
  // the head bowed under a cowl falling to the shoulders
  dt168P(k,dt168Lathe([[0,-1],[.6,-.85],[.9,-.45],[1,0],[.9,.5],[.55,.85],[0,1]],16),'c',s3,dt168Mx(0,2.6,.06,-.5,0,0,.15,.18,.16));
  dt168P(k,dt168Sweep('kcowl',[[2.2,.4,.24,.24,0,.02,.03],[2.34,.3,.22,.26,0,.03,.03],[2.5,.22,.2,.24,0,.06,.02],[2.64,.2,.2,.21,0,.09,.01],[2.76,.17,.15,.18,0,.1,0],[2.84,.1,.08,.12,0,.08,0],[2.88,.02,.02,.03,0,.06,0]],22,{fk:11}),'c',s2,new THREE.Matrix4());
  // arms down to the hands folded on the pommel; the sword before it, point on the plinth
  [-1,1].forEach(sd=>{dt168T(k,'kua'+sd,'c',s,[[sd*.36,2.22,0],[sd*.38,2.0,.06],[sd*.3,1.82,.18]],[.09,.085,.08],10);dt168T(k,'kfa'+sd,'c',s,[[sd*.3,1.82,.18],[sd*.18,1.92,.36],[sd*.05,2.0,.44]],[.08,.075,.07],10);
    dt168P(k,dt168Lathe([[0,-1],[.8,-.6],[1,.1],[.7,.7],[0,1]],10),'c',s3,dt168Mx(sd*.045,2.02,.46,0,0,0,.06,.07,.08));dt168P(k,dt168BBox(.24,.16,.3,.05),'c',s2,dt168Mx(sd*.4,2.3,0,0,0,sd*.2))});
  dt168P(k,dt168Ext('kblade',[[-.045,0],[.045,0],[.04,-.95],[0,-1.1],[-.04,-.95]],.03,.008,1),'m',0x7a7a80,dt168Mx(0,1.94,.48,.04,0,0));
  dt168P(k,dt168BBox(.44,.05,.08,.015),'m',0x6a6a70,dt168Mx(0,1.96,.48));k.L('','c',0x3a2a1a,[0,1.98,.48],[0,2.1,.47],.022,.02,8);dt168P(k,dt168Lathe([[0,-1],[1,0],[0,1]],10),'m',0x6a6a70,dt168Mx(0,2.13,.47,0,0,0,.045));
  [-1,1].forEach(sd=>k.p('','box','c',0x2a2a2a,sd*.06,2.52,.21,.02,.14,.01));k.p('','box','g',0x8affc8,0,2.62,.21,.14,.03,.01)}
function dg165AltarKit(k){const C=DG165SM.c;k.p('','box','c',0x3a3a3e,0,.3,0,2.4,.6,1.6);k.p('','box','c',0x4a4a4e,0,.75,0,2.1,.3,1.3);k.p('','box','c',C.blood,0,.92,0,1.6,.02,.9);
  [-1,1].forEach(s=>{k.p('','sph','c',C.bone,s*.8,1.05,0,.16,.18,.2);dg165Candle(k,s*.5,.9,.4,.22);dg165Candle(k,s*.6,.9,-.35,.16)});for(let i=0;i<4;i++)k.p('','box','c',0x1a1a1c,-.9+i*.6,.4,.81,.3,.3,.02)}
function dg165SconceKit(k){const C=DG165SM.c;k.p('','box','m',C.iron,0,0,-.08,.12,.4,.06);k.L('','m',C.iron,[0,0,-.06],[0,.12,.24],.03,.03,4);k.p('','cyl','m',C.iron,0,.16,.27,.1,.12,.1);k.p('','cyl','c',0x2a1a10,0,.24,.27,.06,.1,.06)}
// v168: the Keeper's sarcophagus: a moulded chest on a plinth, carved panels; the lid with a bevelled edge and the Keeper's effigy
// lying on it, hands joined on the breast (the lid slides as one piece)
function dg165SarcKit(k,lid){const C=DG165SM.c,s=0x4e4c48,s2=0x3a3834,s3=0x5a5850;
  dt168P(k,dt168Lathe([[0,0],[.75,0],[.75,.12],[.7,.16],[.66,.2],[.64,.26],[.62,.3],[.62,.82],[.66,.86],[.68,.9],[0,.9]],4),'c',s,dt168Mx(0,0,0,0,0,0,1,1,2.6/1.3));
  for(let i=0;i<3;i++)[-1,1].forEach(sd=>{dt168P(k,dt168BBox(.02,.36,.62,.01),'c',s2,dt168Mx(sd*.635,.56,-.86+i*.86));dt168P(k,dt168Lathe([[0,-1],[.8,-.6],[1,0],[.8,.6],[0,1]],8),'c',C.bone,dt168Mx(sd*.645,.56,-.86+i*.86,0,0,0,.02,.1,.1))});
  [-1,1].forEach(sd=>dt168P(k,dt168BBox(.86,.36,.02,.01),'c',s2,dt168Mx(0,.56,sd*1.245)));
  if(lid){dt168P(k,dt168BBox(1.36,.16,2.66,.05),'c',lgCol(s,0x6a6860,.3),dt168Mx(0,.98,0));
    dt168P(k,dt168Sweep('effigy',[[0,.24,.18,.12,0,0,.04],[.3,.26,.17,.12,0,0,.05],[.7,.28,.16,.12,0,0,.04],[1.1,.3,.15,.12,0,0,.03],[1.4,.32,.13,.12,0,0,.02],[1.62,.26,.11,.11,0,0,.01],[1.7,.12,.08,.08,0,0,0],[1.74,.08,.06,.06,0,0,0]],20,{bot:1,top:.02,fk:9}),'c',s3,dt168Mx(0,1.15,1.05,-Math.PI/2,0,0));
    dt168P(k,dt168Lathe([[0,-1],[.6,-.85],[.9,-.45],[1,0],[.9,.5],[.55,.85],[0,1]],14),'c',s3,dt168Mx(0,1.16,-.82,-Math.PI/2,0,0,.15,.18,.13));
    dt168P(k,dt168Lathe([[0,0],[.18,0],[.2,.05],[.16,.12],[0,.14]],14),'c',s2,dt168Mx(0,1.08,-.85,-Math.PI/2,0,0,1,1,1));   // the stone pillow
    [-1,1].forEach(sd=>{dt168T(k,'efa'+sd,'c',s3,[[sd*.28,1.16,-.45],[sd*.24,1.2,-.15],[sd*.06,1.27,-.25]],[.06,.055,.05],8);dt168P(k,dt168Lathe([[0,-1],[.8,-.6],[1,0],[.7,.7],[0,1]],8),'c',s3,dt168Mx(sd*.025,1.32,-.3,-.6,0,0,.035,.08,.03))})}}
// rubble, bones and other clutter for the floors
function dg165ClutterKit(k,R,kind,x,y,z){const C=DG165SM.c;
  if(kind=='bones'){for(let i=0;i<6;i++)k.L('','c',lgCol(C.bone,C.bone2,R()),[x+(R()-.5)*.8,y+.04,z+(R()-.5)*.8],[x+(R()-.5)*.8,y+.05,z+(R()-.5)*.8],.03,.025,4);k.p('','sph','c',C.bone,x+(R()-.5)*.4,y+.12,z+(R()-.5)*.4,.13,.14,.16,R(),R(),R())}
  else if(kind=='rubble'){for(let i=0;i<7;i++)k.p('','dod','c',lgCol(C.st,C.st2,R()),x+(R()-.5)*1.6,y+.08,z+(R()-.5)*1.6,.15+R()*.25,.12+R()*.2,.15+R()*.25,R()*3,R()*3,R()*3)}
  else if(kind=='skeleton'){// a sprawled dead adventurer
    k.p('','sph','c',C.bone,x,y+.12,z,.13,.14,.16);for(let i=0;i<5;i++)k.p('','ring','c',C.bone2,x,y+.08,z+.25+i*.09,.14,.3,.07,0,0,Math.PI/2);k.L('','c',C.bone,[x,y+.06,z+.2],[x,y+.06,z+.8],.025,.025,4);
    [-1,1].forEach(s=>{k.L('','c',C.bone,[x+s*.12,y+.06,z+.3],[x+s*.45,y+.04,z+.15],.02,.02,4);k.L('','c',C.bone,[x+s*.08,y+.06,z+.8],[x+s*.2,y+.04,z+1.4],.025,.02,4)});
    k.p('','box','c',0x2a2018,x+.3,y+.05,z+.6,.4,.06,.3,0,R(),0)}
  else if(kind=='coffin'){k.p('','box','c',C.wood,x,y+.2,z,.7,.36,1.8,0,R()*.4,0);k.p('','box','c',lgCol(C.wood,0,.3),x+.3,y+.1,z+.2,.7,.06,1.8,.2,R()*.6+.4,.3)}
  else if(kind=='urns'){for(let i=0;i<3;i++){const a=R()*6.28,r=R()*.6;k.p('','sph','c',lgCol(0x4a3a2a,0x2a2018,R()),x+Math.cos(a)*r,y+.25,z+Math.sin(a)*r,.18,.28,.18)}}
  else if(kind=='chains'){const h=2.2+R()*1.2;for(let i=0;i<10;i++)k.p('','ring','m',i%2?C.iron:C.rust,x,y+3.9-i*h/10,z,.05,.5,.05,i%2?Math.PI/2:0,0,0);k.p('','cone4','m',C.iron,x,y+3.85-h,z,.06,.18,.06,Math.PI)}
  else if(kind=='cage'){const y0=y+1.8+R()*.8;for(let i=0;i<8;i++){const a=i/8*6.283;k.L('','m',C.iron,[x+Math.cos(a)*.42,y0,z+Math.sin(a)*.42],[x+Math.cos(a)*.42,y0+1.4,z+Math.sin(a)*.42],.02,.02,3)}
    [0,1.4].forEach(d=>k.p('','ring','m',C.rust,x,y0+d,z,.44,.4,.44));k.L('','m',C.iron,[x,y0+1.4,z],[x,y+4.2,z],.02,.02,3);k.p('','sph','c',C.bone,x,y0+.2,z,.13,.14,.16);k.L('','c',C.bone,[x,y0+.2,z],[x+.1,y0+.9,z],.03,.03,4)}
  else if(kind=='web'){const s=.9+R()*.8;for(let i=0;i<7;i++){const a=i/7*Math.PI*.5;k.L('','c',0xb8b8b0,[x,y,z],[x+Math.cos(a)*s,y-Math.sin(a)*s,z],.005,.004,3)}for(let j=1;j<4;j++)for(let i=0;i<6;i++){const a=i/7*Math.PI*.5,b=(i+1)/7*Math.PI*.5,r=s*j/4;
    k.L('','c',0x9a9a92,[x+Math.cos(a)*r,y-Math.sin(a)*r,z],[x+Math.cos(b)*r,y-Math.sin(b)*r,z],.004,.004,3)}}}
// the flooded stair at the bottom of the Keeper's Tomb: steps going down into green-lit black water
function dg165FloodStairKit(k){const C=DG165SM.c;for(let i=0;i<8;i++)k.p('','box','c',lgCol(0x3e3e42,0x1a2420,i/8),0,-.15-i*.3,-i*.45,2.6,.3,.45);
  [-1,1].forEach(s=>{k.p('','box','c',C.st2,s*1.5,.6,-1.6,.4,1.6,3.8);k.p('','box','c',C.st,s*1.5,1.5,-1.6,.5,.2,3.9)});k.p('','box','c',C.st2,0,1.9,-3.4,3.4,.5,.5);
  k.p('','box','c',0x1a3a32,0,-1.0,-2.0,2.6,.02,3);for(let i=0;i<5;i++)k.p('','sph','c',C.bone,(i-2)*.4,-.98,-1.2-i*.3,.1,.05,.12)}
