// ================= v220: the Hatchery, rebuilt to stand out =================
// Owner (Nov 11 2026): "refresh the hatchery station to make it more appealing and stand out (still have it look more
// elaborate with each upgrade)". It was a small straw nest with a brazier (a thatched shelter from level 2, a few crystals at 3):
// the lowest thing in town, and levels 0 and 1 looked the same.
// Now it is a round brood house built around a big nest, one look per level (0-3), each adding to the last:
//  * 0 Brood Nest: flagstones, a great woven nest with three big speckled eggs, a wattle windbreak behind it, a carved brood
//    pole with a wooden egg on top, two lanterns and the Hatchery's banner, a warming brazier, a basket of straw.
//  * 1 Brood House: six timber posts carry a tall conical thatched roof with a carved egg finial; lanterns hang in the front
//    spans, a second brazier, egg crates.
//  * 2 Hatchery Rotunda: turned stone columns, a stone ring beam, a blue slate bell roof with a brass band and a brass egg,
//    glowing heat stones round the nest, two caged incubators on pedestals, banners on the front columns.
//  * 3 Grand Hatchery: a great glowing crystal egg in brass claws on top of the roof (it pulses, motes circle it), crystal
//    shards round the nest, rune stones and the rune ring on the floor.
// The nest holds one egg per hatching slot (3 + level); the middle egg rocks now and then. You can walk in under the roof.
// The model is built with the v190 decoration kit (turned profiles, beams, tubes) into the town kit, so it keeps Duskhold's
// textures and gets the same smooth ground shading. Co-op: built from the kingdom's Hatchery level like every station
// (the level a partner sees is the host's), only deterministic numbers; the animation runs from the clock.
var HT220={on:true,k:null,egg:[[0,0],[.3,.03],[.44,.14],[.5,.3],[.47,.5],[.36,.72],[.2,.9],[0,.98]],
  eggC:[0xe8dcc0,0xd8a84a,0x8fcdb6,0xc87a5a,0xb49ad8,0x8aa0c8],N:6,R:1.8,wood:0x4e3a2a,woodD:0x35281d,slate:0x3a4a66,geo:null};
function ht220At(a,r){return [Math.sin(a)*r,Math.cos(a)*r]}     // a = 0 is the front (+z)
function ht220Egg(k,x,y,z,s,col,rx,rz,ry,t,mt){dc190P(k,t||'c',col,dt168Lathe(HT220.egg,9),dt168Mx(x,y,z,rx||0,ry||0,rz||0,s,s,s),mt||'plain');
  if(!t||t=='c')dc190P(k,'c',dt168Mix(col,0x3a2a20,.38),dt168Lathe([[.468,.2],[.512,.3],[.486,.44],[.46,.3]],9),dt168Mx(x,y,z,rx||0,ry||0,rz||0,s,s,s),'plain')}
function ht220Nest(k,R,n){dc190L(k,'c',0xb0924c,[[0,.12],[.45,.12],[.62,.17],[.8,.34],[.98,.42],[1.1,.32],[1.13,.12],[1.02,0],[0,0]],11,0,.1,0,.2,R,'straw');
  for(let i=0;i<16;i++){const a=i/16*6.283+k.R()*.3,r=R*(.86+k.R()*.2),[x,z]=ht220At(a,r),[x2,z2]=ht220At(a+.5+k.R()*.5,r+.08);dc190Rod(k,'c',i%3?0x9a7c40:0x7a5e34,[x,.3+k.R()*.18,z],[x2,.36+k.R()*.2,z2],.018,'straw',5)}
  const E=[[0,0],[.42,.18],[-.4,.24],[.06,-.44],[-.3,-.3],[.4,-.28]];
  for(let i=1;i<n&&i<E.length;i++){const [x,z]=E[i];ht220Egg(k,x*R,.2,z*R,.5*R,HT220.eggC[i%6],(k.R()-.5)*.5,(k.R()-.5)*.5,i)}}
// a wattle windbreak round the back
function ht220Wattle(k,r,a0,a1,h){const n=9,W=0x6a5236;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,[x,z]=ht220At(a,r);dc190Rod(k,'c',HT220.woodD,[x,0,z],[x,h+.08,z],.04,'bark',6,.7)}
  [.22,.44,.66,.86].forEach((y,j)=>{const P=[],Rr=[];for(let i=0;i<=n*2;i++){const a=a0+(a1-a0)*i/(n*2),[x,z]=ht220At(a,r+((i+j)%2?.045:-.045));P.push([x,y*h,z]);Rr.push(.026)}dc190Tube(k,'c',j%2?W:0x7a6040,P,Rr,5,'wood')})}
function ht220Brazier(k,x,z,c,s){kdBrazier(k,x,z,0,s||.85);c.push([x,z,.3])}
function ht220Basket(k,x,z,s){dc190L(k,'c',0x9a7a44,[[0,0],[.2,0],[.27,.2],[.29,.24],[.25,.24],[.2,.06],[0,.06]],9,x,0,z,0,s,'straw');for(let i=0;i<3;i++)ht220Egg(k,x+(i-1)*.09*s,.07*s,z+(i%2?.06:-.04)*s,.2*s,HT220.eggC[(i+2)%6],.2*i,.3-.3*i,i)}
// one caged incubator: pedestal, egg, four iron ribs and a ring
function ht220Cage(k,x,z,col,c){const I=0x2c2c32,B=0xa8843a;dc190L(k,'c',0x6c6872,[[0,0],[.3,0],[.3,.1],[.2,.16],[.17,.6],[.26,.68],[.28,.76],[0,.76]],8,x,0,z,.3,1,'ashlar');
  dc190L(k,'c',0xb0924c,[[0,.76],[.22,.76],[.25,.84],[.16,.82],[0,.8]],8,x,0,z,0,1,'straw');ht220Egg(k,x,.8,z,.42,col,0,0,.6);
  for(let i=0;i<4;i++){const a=i/4*6.283+.4,cx=Math.cos(a),cz=Math.sin(a);dc190Tube(k,'m',I,[[x+cx*.27,.76,z+cz*.27],[x+cx*.31,1.0,z+cz*.31],[x+cx*.24,1.26,z+cz*.24],[x+cx*.06,1.4,z+cz*.06]],[.014,.014,.013,.012],5,'iron')}
  dc190L(k,'m',B,[[0,1.38],[.08,1.38],[.07,1.44],[.02,1.5],[0,1.56]],6,x,0,z,0,1,'brass');c.push([x,z,.34])}
// corner dressing of the lot (as the other stations get in 3630): boulders, moss, flower pots, glow stones
function ht220Corners(k,lv){const R=dkRng(7220+lv*13);[[-2.9,-2.9],[2.9,-2.9],[-2.9,2.6],[2.9,2.6]].forEach(([x,z],i)=>{dc190Stone(k,[0x5a5662,0x4e4a54,0x66626c][i%3],x,.2,z,.42+R()*.2,.3,.4,i+3);dm196Moss(k,x,.42,z,.8,i);
    if(lv>=1)dm196Pot(k,x+(x<0?.6:-.6),z,i+5,.8)})}
// the model for Hatchery level lv (0-3)
function ht220Build(k,lv){const c=[],C=DC190C,H=HT220,col=SHU.find(u=>u.k=='hatch').col,N=H.N,R=H.R,P=[];for(let i=0;i<N;i++)P.push(ht220At((i+.5)/N*6.283,R));
  // the floor: flagstones (a low round plinth you walk onto)
  dc190L(k,'c',lv>=2?0x77737c:0x66626a,[[0,0],[lv>=1?2.3:1.9,0],[lv>=1?2.26:1.86,.07],[0,.08]],12,0,0,0,.26,1,'flag');
  if(lv>=2)dc190L(k,'c',0x55525c,[[1.02,.08],[1.34,.08],[1.3,.13],[1.06,.13],[1.02,.08]],12,0,0,0,0,1,'ashlar');
  ht220Nest(k,lv>=2?.92:1,3+lv);c.push([0,0,1.08]);
  ht220Wattle(k,lv>=1?2.08:1.7,Math.PI-1.2,Math.PI+1.2,lv>=2?.6:.95);
  ht220Brazier(k,1.45,1.55,c);if(lv>=1)ht220Brazier(k,-1.45,1.55,c);
  ht220Basket(k,-1.35,.95-(lv>=1?2.3:0),1);
  if(lv==0){// the brood pole: a carved post, a wooden egg, a cross arm with two lanterns and the banner
    const z=-1.25;dc190L(k,'c',0x55525c,[[0,0],[.26,0],[.26,.16],[.16,.24],[0,.24]],6,0,0,z,0,1,'ashlar');dc190Beam(k,'c',H.wood,[0,.2,z],[0,3.0,z],.17,.17,'wood');
    dc190Beam(k,'c',H.woodD,[-.85,2.55,z],[.85,2.55,z],.11,.12,'wood');[-1,1].forEach(s=>{dc190Tube(k,'c',H.woodD,[[s*.08,2.1,z],[s*.3,2.36,z],[s*.5,2.5,z]],[.045,.04,.035],5,'wood');
      dc190Rod(k,'m',C.iron,[s*.78,2.5,z],[s*.78,2.3,z],.01,'iron',4);dc190Lantern(k,s*.78,2.0,z,1.1,0xffc870)});
    dc190L(k,'c',H.woodD,[[0,2.98],[.2,2.98],[.22,3.06],[.12,3.1],[0,3.1]],8,0,0,z,0,1,'wood');ht220Egg(k,0,3.08,z,.56,0xa88a5a,0,0,0,'c','wood');
    dc190Banner(k,0,2.5,z+.09,0,col,.5,.95,0xcfc4a8);c.push([0,z,.22])}
  if(lv==1){// timber posts with stone feet and braces, a ring of beams
    P.forEach(([x,z],i)=>{dc190L(k,'c',0x55525c,[[0,0],[.22,0],[.22,.16],[.15,.22],[0,.22]],4,x,0,z,(i+.5)/N*6.283,1,'ashlar');dc190Beam(k,'c',H.wood,[x,.2,z],[x,2.5,z],.16,.16,'wood');c.push([x,z,.2]);
      const [nx,nz]=P[(i+1)%N],dx=nx-x,dz=nz-z;dc190Beam(k,'c',H.woodD,[x,2.52,z],[nx,2.52,nz],.14,.16,'wood');
      dc190Tube(k,'c',H.woodD,[[x,2.0,z],[x+dx*.14,2.3,z+dz*.14],[x+dx*.27,2.46,z+dz*.27]],[.05,.045,.04],5,'wood');dc190Tube(k,'c',H.woodD,[[nx,2.0,nz],[nx-dx*.14,2.3,nz-dz*.14],[nx-dx*.27,2.46,nz-dz*.27]],[.05,.045,.04],5,'wood')});
    // the thatched roof in three shaggy tiers, a carved egg on top
    dc190L(k,'c',0x8a7440,[[0,2.6],[2.42,2.5],[2.5,2.6],[1.9,3.02],[0,3.05]],12,0,0,0,.26,1,'thatch');
    dc190L(k,'c',0x9a8248,[[0,2.95],[1.82,2.9],[1.9,3.0],[1.2,3.55],[0,3.6]],12,0,0,0,0,1,'thatch');
    dc190L(k,'c',0xa88e50,[[0,3.45],[1.14,3.42],[1.2,3.52],[.5,4.1],[.16,4.3],[0,4.32]],12,0,0,0,.26,1,'thatch');
    dc190L(k,'c',H.woodD,[[0,4.24],[.2,4.24],[.22,4.34],[.12,4.38],[0,4.38]],8,0,0,0,0,1,'wood');ht220Egg(k,0,4.36,0,.6,0xa88a5a,0,0,0,'c','wood')}
  if(lv>=2){// turned stone columns, a stone ring beam, the slate bell roof
    P.forEach(([x,z],i)=>{dc190L(k,'c',C.st,[[0,0],[.3,0],[.3,.16],[.22,.22],[.19,.3],[.17,2.2],[.2,2.3],[.28,2.38],[.28,2.5],[0,2.5]],8,x,0,z,0,1,'ashlar');c.push([x,z,.24])});
    dc190L(k,'c',C.stL,[[1.52,2.5],[2.1,2.5],[2.14,2.62],[2.1,2.78],[1.52,2.78],[1.52,2.5]],12,0,0,0,.26,1,'ashlar');
    dc190L(k,'c',H.slate,[[0,2.84],[2.34,2.78],[2.42,2.9],[2.1,3.3],[1.58,3.85],[.95,4.35],[.42,4.7],[.2,4.84],[0,4.86]],12,0,0,0,.26,1,'slate');
    dc190L(k,'m',C.brass,[[2.28,2.76],[2.46,2.82],[2.46,2.92],[2.3,2.9]],12,0,0,0,.26,1,'brass');dc190L(k,'m',C.brass,[[.9,4.32],[1.02,4.3],[1.02,4.4],[.9,4.42]],12,0,0,0,.26,1,'brass');
    dc190L(k,'m',C.brass,[[0,4.8],[.26,4.8],[.3,4.9],[.2,4.98],[.12,5.06],[0,5.06]],8,0,0,0,0,1,'brass');
    if(lv==2)ht220Egg(k,0,5.04,0,.62,C.brass,0,0,0,'m','brass');
    // heat stones glowing round the nest
    for(let i=0;i<10;i++){const [x,z]=ht220At(i/10*6.283+.2,1.18);dc190P(k,'g',i%2?0xff8a3a:0xffb050,dt168Rock(150+i,1,.4,1),dt168Mx(x,.15,z,0,i,0,.085,.06,.085))}
    ht220Cage(k,-2.55,1.1,H.eggC[4],c);ht220Cage(k,2.55,.3,H.eggC[2],c);
    [0,N-1].forEach(i=>{const a=(i+.5)/N*6.283,[x,z]=ht220At(a,R+.2);dc190Banner(k,x,2.36,z,a,col,.42,1.25,0xcfc4a8)})}
  // lanterns in the front spans (levels 1-3)
  if(lv>=1)[N-1,0,1,N-2].forEach((i,j)=>{if(j>1&&lv<2)return;const a=(i+1)/N*6.283,[x,z]=ht220At(a,R*.866-.02);dc190Rod(k,'m',C.iron,[x,2.46,z],[x,2.24,z],.01,'iron',4);dc190Lantern(k,x,1.94,z,1.15,lv>=3?0xc8b0ff:0xffc870)});
  if(lv>=3){// brass claws for the crystal egg (the egg itself is alive: ht220Anim), crystal shards, rune stones
    for(let i=0;i<4;i++){const a=i/4*6.283+.78,cx=Math.cos(a),cz=Math.sin(a);dc190Tube(k,'m',C.brass,[[cx*.2,5.0,cz*.2],[cx*.36,5.16,cz*.36],[cx*.4,5.42,cz*.4],[cx*.3,5.6,cz*.3]],[.035,.032,.026,.012],5,'brass',1)}
    [[.9,1.3],[-.9,1.25],[2.3,1.2],[-2.3,1.3],[3.5,1.15]].forEach(([a,r],i)=>{const [x,z]=ht220At(a,r);[[0,0,.3,0],[.1,.05,.2,.4],[-.08,.06,.17,-.35]].forEach(([dx,dz,h,rz],j)=>dc190P(k,'g',[0xaee6ff,0xc8b0ff,0x9affd8][(i+j)%3],dt168Lathe([[0,0],[.3,.12],[.26,.7],[0,1]],5),dt168Mx(x+dx,.1,z+dz,rz*.5,i+j,rz,h*.9,h*1.7,h*.9)))});
    [[-2.4,2.2],[2.4,2.2],[-2.75,-.9],[2.75,-.9]].forEach(([x,z],i)=>{dc190L(k,'c',C.obs,[[0,0],[.24,0],[.2,.12],[.15,1.0],[.06,1.22],[0,1.25]],4,x,0,z,.4+i,1,'ashlar');dc190P(k,'g',C.vio,dt168Lathe([[0,0],[.5,.5],[0,1]],4),dt168Mx(x,.56,z,0,.4+i+.785,0,.2,.3,.2));c.push([x,z,.26])})}
  ht220Corners(k,lv);return c}
// ---------------- the living parts (not baked): the rocking egg, the crystal egg and its motes ----------------
function ht220Geo(){if(HT220.geo)return HT220.geo;const eg=new THREE.LatheGeometry(HT220.egg.map(p=>new THREE.Vector2(p[0],p[1])),10),oc=new THREE.OctahedronGeometry(1,0);
  return HT220.geo={eg,oc,m0:new THREE.MeshLambertMaterial({color:0xe8dcc0,flatShading:true}),m1:new THREE.MeshLambertMaterial({color:0x5a4634,flatShading:true}),
    cry:new THREE.MeshLambertMaterial({color:0xb9a2ff,emissive:0x6a48e0,flatShading:true}),halo:new THREE.MeshBasicMaterial({color:0x9a7aff,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false}),
    mote:new THREE.MeshBasicMaterial({color:0xd8c8ff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false})}}
function ht220Anim(g,l){const lv=l-1,G=ht220Geo(),R=lv>=2?.92:1,mk=(geo,mat)=>{const m=new THREE.Mesh(geo,mat);m.userData.lpsSkip=1;return m};
  // the middle egg of the nest: rocks for a moment every few seconds
  const e=new THREE.Group(),sh=mk(G.eg,G.m0),band=mk(G.eg,G.m1);sh.scale.setScalar(.5*R);band.scale.set(.515*R,.09*R,.515*R);band.position.y=.14*R;sh.castShadow=true;e.add(sh);e.add(band);e.position.set(0,.2,0);e.userData.lpsSkip=1;e.userData.ht220='egg';g.add(e);
  let cr=null,halo=null,M=[];
  if(lv>=3){cr=mk(G.eg,G.cry);cr.scale.setScalar(.95);cr.position.y=5.12;cr.userData.ht220='crystal';g.add(cr);halo=mk(G.eg,G.halo);halo.position.y=5.02;g.add(halo);
    for(let i=0;i<5;i++){const m=mk(G.oc,G.mote);m.scale.setScalar(.045);g.add(m);M.push(m)}}
  g.userData.psNo=1;
  return now=>{const t=now/1000,u=(t%7.3)/1.3,k=u<1?Math.sin(u*Math.PI)*Math.sin(u*Math.PI*5):0;e.rotation.z=.16*k;e.rotation.x=.07*k;
    if(cr){const p=.5+.5*Math.sin(t*1.7);cr.rotation.y=t*.35;cr.material.emissiveIntensity=.75+.5*p;halo.scale.setScalar(1.12+.1*p);halo.rotation.y=-t*.2;
      M.forEach((m,i)=>{const a=t*(.6+i*.07)+i*1.257,r=.72+.1*Math.sin(t*1.3+i);m.position.set(Math.cos(a)*r,5.6+.32*Math.sin(t*.9+i*1.9),Math.sin(a)*r);m.rotation.y=t*2+i})}}}
// ---------------- the switch ----------------
if(typeof KDU!='undefined'&&KDU.hatch&&HT220.on){
  KDU.hatch.b=function(k,l){const cl=ht220Build(k,Math.max(0,Math.min(3,(l|0)-1)));HT220.k=k;return cl};KDU.hatch.b.v196=1;
  // after the kit is baked: the decoration shading (only when it was just built), then the rune ring on the floor
  KDU.hatch.ring=function(g,l){try{if(HT220.k){dc190Shade(HT220.k,'KDU|hatch220|'+l);HT220.k=null}}catch(e){console.warn('v220 hatchery shade',e)}
    if(l<4)return;const m=new THREE.Mesh(new THREE.RingGeometry(1.42,1.6,24),new THREE.MeshBasicMaterial({color:0x9a7aff,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.1;m.userData.lpsSkip=1;g.add(m);return m};
  KDU.hatch.anim=function(g,l){try{return ht220Anim(g,l)}catch(e){console.warn('v220 hatchery',e);return null}};
  // the model has one look per Hatchery level 0-3 (kdUp gets 1-4), under its own cache key (the old model was cached as KDU|hatch|n)
  {const f=kdUp;kdUp=function(T,key,l){if(key!=='hatch')return f.apply(this,arguments);const hk=twHas,gk=twGroup,mp=x=>typeof x=='string'&&x.indexOf('KDU|hatch|')==0?'KDU|hatch220|'+x.slice(10):x;
    twHas=function(x){return hk(mp(x))};twGroup=function(k,x,ao){return gk(k,mp(x),ao)};try{return f.call(this,T,key,(l|0)+1)}finally{twHas=hk;twGroup=gk}}}
  try{const K=kdState();if(K.up&&K.up.hatch)K.up.hatch.l=-9;kdSync()}catch(e){console.warn('v220 hatchery',e)}}
