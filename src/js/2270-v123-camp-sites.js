// ================= v123: camp sites — every camp is a place of its own =================
// The 54 field camps (6 zones x 3 field instances x 3 camps) were built from ~20 shared outpost recipes with a wooden name
// sign at the edge. Now every camp has:
//   - its own size: C.r (8..16 tiles) instead of the fixed CAMP_R 12. The garrison spreads over C.sp (≈ 0.62 r), the zone
//     map circle, the HUD camp label, the zone decorations' keep-out ring and the roaming groups' keep-out ring follow it.
//   - its own ground: the heightfield is shaped round the camp at load (bowls, mounds, ridges, terraces, shelves, dunes,
//     crags; cs123Terrain, called from 0045 right after the heights are made, so grass, trees and harvest nodes sit on the
//     new ground) and the tiles under it are repainted (cs123Map, from the end of the 0045 map build).
//   - its own set pieces matching its name (CS123B[key], built lazily like before by buildCamp, which this file replaces).
//   - no sign: walking into a camp shows a small title card in the zone's lettering instead (cs123Card).
// Everything is seeded from the camp's position, so co-op partners see the same camp (the old seed was Math.random).
// Camp key = 'z_k_j': zone, field instance (0 = I), camp number in that instance (the order of I.cl, as n3Camps uses).
// The plan is a hoisted function so 0045 and 0250 can read it long before this file runs.

function cs123H(x,y){const n=Math.sin(x*12.9898+y*78.233)*43758.5453;return n-Math.floor(n)}
// terrain ops (tile units, heights in world units) — t: list of
//   ['bowl',depth,floor]  sunk floor (floor = flat share of r)      ['mound',h,top]  raised top (top = flat share of r)
//   ['ridge',h,at,width]  a raised rim at at*r                       ['tiers',n,h]    n steps up to the centre (h<0: down)
//   ['shelf',h,soft]      one half raised (direction C.ang)          ['tilt',h]       a slope across the camp
//   ['bumps',h,freq]      hummocks                                   ['dunes',h,freq] sand waves
//   ['spire',h,dx,dz,rad] a crag at an offset                        ['dip',h,dx,dz,rad] a hollow at an offset (h<0)
// lv: how strongly the ground inside is levelled first (default .85). gt: tile painted under the camp ('.', 'a' or 'g').
function cs123Plan(){if(cs123Plan.P)return cs123Plan.P;
  const P={
  // ---------------- Kindlelight ----------------
  '0_0_0':{n:'Caustic Pool',r:13,t:[['bowl',1.7,.45]],gt:'a',sub:'A sunken basin where the goo pools and eats through bone'},
  '0_0_1':{n:'Maggot Nest',r:8,t:[['mound',1.3,.3],['bumps',.22,.35]],gt:'.',sub:'A heap of rotten earth, writhing with grubs'},
  '0_0_2':{n:'Spitter Mire',r:12,t:[['bumps',.55,.22],['dip',-.7,3.5,-2.5,3],['dip',-.6,-4,3,2.6]],gt:'g',wet:0.35,sub:'Hummocks and sour puddles, crusted with spit'},
  '0_1_0':{n:'Amalgam Seep',r:15,t:[['tilt',2.2],['bumps',.18,.3]],gt:'a',lv:.9,sub:'Goo wells up from the rock and runs downhill in glowing rills'},
  '0_1_1':{n:'Akidon Brood',r:10,t:[['ridge',1.5,.85,2.2],['bowl',.5,.5]],gt:'.',sub:'A ringed hollow where the larvae hang to pupate'},
  '0_1_2':{n:'Glowmire Warren',r:13,t:[['mound',1.8,.4],['bumps',.28,.25]],gt:'a',sub:'A burrow-riddled knoll lit by glowing fungus'},
  '0_2_0':{n:'Lichen Grove',r:14,t:[['mound',.8,.1],['bumps',.35,.18]],gt:'g',sub:'Fallen giants furred with pale, breathing lichen'},
  '0_2_1':{n:'Akorror Hive',r:11,t:[['mound',2.4,.38]],gt:'.',sub:'A resin spire hums on a mound of chewed wood'},
  '0_2_2':{n:'Rotheart Hollow',r:8,t:[['bowl',2,.4]],gt:'a',sub:'In the hollow, a dead tree\'s heart still glows'},
  // ---------------- Hillside Crest ----------------
  '1_0_0':{n:'Serpent Warcamp',r:15,t:[['ridge',1.2,.95,1.8]],lv:1,gt:'.',sub:'An earthwork ring round the serpent host\'s tents'},
  '1_0_1':{n:'Serpent Shrine',r:11,t:[['tiers',3,2.4]],lv:1,gt:'a',sub:'Three terraces climb to the coiled idol'},
  '1_0_2':{n:'Archer Outpost',r:9,t:[['shelf',1.5,.35]],gt:'.',sub:'A bluff where the archers watch the road'},
  '1_1_0':{n:'Croaker Shallows',r:14,t:[['bowl',.9,.7],['bumps',.4,.2]],gt:'g',wet:0.3,sub:'Warm shallows thick with lily pads and croaking'},
  '1_1_1':{n:'Reaver Wallow',r:12,t:[['bumps',.5,.2],['dip',-.9,0,0,6.5]],gt:'.',sub:'Churned mud, half-sunk logs and gnawed bones'},
  '1_1_2':{n:'Drowned Serpent Shrine',r:13,t:[['bowl',1.4,.55],['bumps',.45,.2]],gt:'a',wet:0.4,sub:'A serpent shrine the lake swallowed long ago'},
  '1_2_0':{n:'Basilisk Roost',r:10,t:[['mound',1.4,.25],['spire',2.4,-2.5,-2.5,4.2],['bumps',.35,.3]],gt:'.',sub:'Stone that was once something else stares from the crag'},
  '1_2_1':{n:'Shellback Rocks',r:12,t:[['bumps',.45,.25],['dip',-.8,3.5,2.5,2.6],['dip',-.7,-3.5,-3,2.2]],gt:'a',wet:0.3,sub:'Broad shells and tide pools on a windy shelf'},
  '1_2_2':{n:'Cliffside Lair',r:15,t:[['shelf',2.2,.32]],gt:'.',sub:'A cave mouth gapes in the cliff face'},
  // ---------------- Burningeye Summit ----------------
  '2_0_0':{n:'Troll Den',r:14,t:[['bumps',.55,.2],['spire',2.8,0,-6.5,6]],gt:'.',sub:'Slabs leaned together for a troll\'s roof, and bones beneath'},
  '2_0_1':{n:'Yeti Cave',r:10,t:[['mound',1,.2],['spire',2.4,0,-4.5,5]],gt:'a',sub:'A snowbound cave, its mouth hung with icicles'},
  '2_0_2':{n:'Rimecaller Circle',r:12,t:[['mound',1,.75]],lv:1,gt:'a',sub:'Ice monoliths ring a circle of frozen runes'},
  '2_1_0':{n:'Rimeshell Nest',r:11,t:[['bowl',1.3,.4],['bumps',.25,.3]],gt:'a',sub:'Crystal shells crowd a frozen hollow'},
  '2_1_1':{n:'Wendigo Larder',r:8,t:[['bowl',.9,.45]],gt:'.',sub:'Meat hangs from the racks. Not all of it is animal'},
  '2_1_2':{n:'Frozen Hollow',r:14,t:[['bowl',2,.5]],gt:'a',sub:'A frozen lake, and shapes trapped beneath the ice'},
  '2_2_0':{n:'Jotun Hold',r:16,t:[['tiers',2,2.6],['ridge',.6,.93,1.5]],lv:1,gt:'.',sub:'A giant\'s hall of broken walls and a throne of stone'},
  '2_2_1':{n:'Harpy Eyrie',r:10,t:[['mound',.9,.2],['spire',3.2,1.5,-1.5,4],['spire',2.2,-3.5,2.5,3]],gt:'.',sub:'Nests of bone and twig crown the wind-cut pillars'},
  '2_2_2':{n:'Stormcaller Ring',r:13,t:[['ridge',1.4,.88,2]],lv:1,gt:'.',sub:'Scorched stones ring a rod that drinks the lightning'},
  // ---------------- Searing Sands ----------------
  '3_0_0':{n:'Scorpion Nest',r:11,t:[['bowl',1.4,.35],['bumps',.2,.35]],gt:'a',sub:'A sand pit riddled with burrows and shed husks'},
  '3_0_1':{n:'Elemental Ruins',r:15,t:[['tiers',2,1.5],['bumps',.14,.3]],gt:'.',sub:'Toppled sandstone round a core of living flame'},
  '3_0_2':{n:'Sun-bleached Bones',r:13,t:[['dunes',.6,.35]],gt:'g',sub:'The bones of something vast, picked clean by the sun'},
  '3_1_0':{n:'Temple Sanctum',r:14,t:[['tiers',3,2.2]],lv:1,gt:'.',sub:'A stepped sanctum behind the temple gate'},
  '3_1_1':{n:'Scarab Hatchery',r:10,t:[['bowl',1,.45],['bumps',.28,.35]],gt:'a',sub:'Amber eggs glow in the warm sand'},
  '3_1_2':{n:'Priests\' Necropolis',r:13,t:[['mound',.6,.8]],lv:1,gt:'.',sub:'Rows of sarcophagi under watching obelisks'},
  '3_2_0':{n:'Salt Pillars',r:13,t:[],lv:1,gt:'a',sub:'White salt pillars rise from a cracked pan'},
  '3_2_1':{n:'Wyrm Hollow',r:12,t:[['bowl',1.9,.25]],gt:'.',sub:'A sinkhole churned by something huge below'},
  '3_2_2':{n:'Bleached Oasis',r:14,t:[['bowl',1.1,.5]],gt:'a',sub:'Dead palms round a pool that dried to salt'},
  // ---------------- The Dirge ----------------
  '4_0_0':{n:'Open Crypt',r:12,t:[['dip',-1.4,0,1.5,3.4]],lv:1,gt:'.',sub:'The crypt stands open, its stair leading down'},
  '4_0_1':{n:'Ghoul Feasting Pit',r:11,t:[['bowl',2.3,.42]],gt:'.',sub:'The ghouls drag their meals down into the pit'},
  '4_0_2':{n:'Ossuary',r:14,t:[['mound',1.2,.62]],lv:1,gt:'a',sub:'Walls of skulls stacked by patient hands'},
  '4_1_0':{n:'Sunken Ossuary',r:13,t:[['bowl',1.3,.55],['bumps',.45,.2]],gt:'a',wet:0.35,sub:'Half-drowned tombs leaning in black water'},
  '4_1_1':{n:'Wailing Pool',r:9,t:[['bowl',1.1,.45]],gt:'a',sub:'The pool glows where the drowned still weep'},
  '4_1_2':{n:'Flooded Vault',r:15,t:[['bowl',1,.7],['ridge',1,.9,1.6],['bumps',.4,.22]],gt:'.',wet:0.35,sub:'A vault\'s broken walls hold back the floodwater'},
  '4_2_0':{n:'Colossus Barrow',r:16,t:[['mound',2,.5]],gt:'g',sub:'A barrow raised over a colossus, its bones breaking through'},
  '4_2_1':{n:'Hound Pit',r:9,t:[['bowl',1.8,.5]],gt:'.',sub:'Chains and gnawed bones at the bottom of the pit'},
  '4_2_2':{n:'Field of Skulls',r:15,t:[['bumps',.45,.22]],gt:'a',sub:'Skulls on stakes, as far as the fog allows'},
  // ---------------- The Citadel ----------------
  '5_0_0':{n:'Blood Coven',r:12,t:[['tiers',2,1]],lv:1,gt:'.',sub:'Red candles burn round a basin of blood'},
  '5_0_1':{n:'Blood Roost',r:10,t:[['mound',1.1,.2],['spire',2.4,0,-2,4]],gt:'.',sub:'A dead tree heavy with sleeping bats'},
  '5_0_2':{n:'Knight Barracks',r:15,t:[],lv:1,gt:'.',sub:'The blood knights drill on a ground of packed earth'},
  '5_1_0':{n:'Gargoyle Parapet',r:13,t:[['shelf',1.9,.32]],gt:'.',sub:'A broken parapet where stone things perch'},
  '5_1_1':{n:'Hound Kennels',r:11,t:[],lv:1,gt:'.',sub:'Iron cages and the smell of wet fur'},
  '5_1_2':{n:'Siege Breach',r:16,t:[['bumps',.5,.2],['ridge',.9,.86,2]],gt:'.',sub:'Rubble and wrecked engines where the wall came down'},
  '5_2_0':{n:'Execution Yard',r:12,t:[['mound',.8,.85]],lv:1,gt:'.',sub:'The block is never dry'},
  '5_2_1':{n:'Nosferatu Crypt',r:10,t:[['bowl',1.2,.55]],gt:'a',sub:'A mausoleum sunk into a cold hollow'},
  '5_2_2':{n:'Blood Garden',r:14,t:[['tiers',2,.9]],lv:1,gt:'g',sub:'Red roses fed on something richer than rain'}};
  return cs123Plan.P=P}
function cs123At(z,k,j){return cs123Plan()[z+'_'+k+'_'+j]||null}
// the radius of camp j in instance I (decoration keep-out rings use it before CAMPS exists)
function cs123Rad(I,j){const D=I&&I.fld?cs123At(I.z,I.k,j):null;return D?D.r:12}
// the camp's facing (shelves, tilts and the builders' main axis): seeded by position
function cs123Ang(x,z){return cs123H(Math.round(x),Math.round(z))*6.283}
function cs123Op(o,dx,dz,d,r,ca,sa,sd,x,y){const q=o[0],a=o[1];
  if(q=='mound')return a*(1-smt(o[2]*r,r,d));
  if(q=='bowl')return -a*(1-smt(o[2]*r,r*.95,d));
  if(q=='ridge'){const u=(d-o[2]*r)/(o[3]||2);return a*Math.exp(-u*u)}
  // v168: the top terrace is a flat plateau (v ends at n + .9 instead of n): before, the last step only reached its full height at the
  // centre point, so the top was a cone and the Serpent Shrine's idol (and every tiers camp's centrepiece) sat on its tip, ~.8 up
  if(q=='tiers'){const n=o[1],h=o[2],v=Math.max(0,Math.min(1,1-d/(r*.95)))*(n+.9),f=Math.floor(v);return h*Math.min(n,f+smt(.74,1,v-f))/n}
  if(q=='shelf'){const p=(dx*ca+dz*sa)/r+(fbm2(x*.18+sd,y*.18,2)-.5)*.35,s=o[2]||.2;return a*smt(-s,s,p)*(1-smt(r*.7,r*1.02,d))}
  if(q=='tilt'){const p=(dx*ca+dz*sa)/r;return a*p*(1-smt(r*.8,r*1.1,d))}
  if(q=='bumps'){const f=o[2]||.25;return a*(fbm2(x*f+sd,y*f+sd*.7,3)-.5)*2.2}
  if(q=='dunes'){const f=o[2]||.35,p=dx*ca+dz*sa,p2=-dx*sa+dz*ca;return a*Math.sin(p*f+Math.sin(p2*.18)*1.5)}
  if(q=='spire'||q=='dip'){const ux=dx-o[2],uz=dz-o[3],e=Math.hypot(ux,uz)/o[4];if(e>=1)return 0;const w=1-e*e;return a*w*w}
  return 0}
// heights: called from 0045 right after HF is filled (before the terrain mesh, trees, grass and nodes are placed)
function cs123Terrain(){const P=cs123Plan(),DW=MAP.DW,ix=(i,j)=>(j+HPD)*HW+i+HPD;
  INSL.forEach(I=>{if(!I.fld)return;I.cl.forEach((c,j)=>{const D=P[I.z+'_'+I.k+'_'+j];if(!D)return;
    const cx=Math.round(c[0]),cz=Math.round(c[1]),r=D.r,Rb=Math.min(r+4,17),an=cs123Ang(cx,cz),ca=Math.cos(an),sa=Math.sin(an),sd=cs123H(cz,cx)*100,lv=D.lv==null?.85:D.lv;
    const ok=(x,y)=>x>0&&y>0&&x<W-1&&y<H-1&&MAP[y][x]&&MAP[y][x]!='~'&&DW[y*W+x]<0&&insAt(x,y)===I;
    let s=0,n=0;const r7=Math.ceil(r*.7);for(let y=cz-r7;y<=cz+r7;y++)for(let x=cx-r7;x<=cx+r7;x++)if(Math.hypot(x-cx,y-cz)<r*.7&&ok(x,y)){s+=HF[ix(x,y)];n++}
    const base=n?s/n:HF[ix(cx,cz)],R1=Math.ceil(Rb)+1;
    const L=[];let mn=1e9;
    for(let y=cz-R1;y<=cz+R1;y++)for(let x=cx-R1;x<=cx+R1;x++){const d=Math.hypot(x-cx,y-cz);if(d>Rb||!ok(x,y))continue;
      const k=ix(x,y),wl=lv*(1-smt(r*.8,Rb,d));let h=HF[k]*(1-wl)+base*wl,dv=0;
      for(const o of D.t)dv+=cs123Op(o,x-cx,y-cz,d,r,ca,sa,sd,x,y);
      h+=dv*(1-smt(r*.92,Rb,d));L.push(k,h,1-smt(r*.92,Rb,d));if(d<r)mn=Math.min(mn,h)}
    // dry camps stay above the water surface (y .02) everywhere; wet ones sink so their lowest ground is D.wet under it
    const sh=D.wet?(-D.wet-mn):Math.max(0,.4-mn);
    for(let i=0;i<L.length;i+=3)HF[L[i]]=L[i+1]+sh*L[i+2]})})}
// tiles: called at the end of the 0045 map build (only '.', 'g' and 'a' are swapped, so walking, water and nodes don't change)
function cs123Map(m){const P=cs123Plan();
  INSL.forEach(I=>{if(!I.fld)return;I.cl.forEach((c,j)=>{const D=P[I.z+'_'+I.k+'_'+j];if(!D||!D.gt)return;const cx=Math.round(c[0]),cz=Math.round(c[1]),R=D.r*.88,R1=Math.ceil(R*1.3);
    for(let y=cz-R1;y<=cz+R1;y++)for(let x=cx-R1;x<=cx+R1;x++){const t=m[y]&&m[y][x];if(!t||'.ga'.indexOf(t)<0||insAt(x,y)!==I)continue;
      const a=Math.atan2(y-cz,x-cx),lim=R*(.84+.16*Math.sin(a*3+cx)+.08*Math.sin(a*7+cz));const dd=Math.hypot(x-cx,y-cz);if(dd<lim&&cs123H(x*1.7,y*2.3)<1.15-dd/lim*.7)m[y][x]=D.gt}})})}
// sizes and seeds on the CAMPS records: called from 0250 right after CAMPS is made
function cs123Setup(){const n={};CAMPS.forEach(C=>{const I=INSL[C.ig];if(!I)return;const j=n[C.ig]=(n[C.ig]==null?0:n[C.ig]+1),D=I.fld?cs123At(I.z,I.k,j):null;
  C.j=j;C.key=I.z+'_'+I.k+'_'+j;C.des=D;C.r=D?D.r:12;C.sp=Math.max(4.5,Math.min(9.5,C.r*.62));C.ang=cs123Ang(C.x,C.z);C.seed=1+Math.floor(cs123H(C.x+.5,C.z-.5)*2e6)})}

// ---------------- the set-piece kit ----------------
// Shared low-poly geometries (never disposed: merges copy them). Animated pieces (CS123.an) and breakable boxes stay
// separate meshes; everything else is merged by material when the camp is built (one draw call per colour).
var CS123={an:[],G:null,card:{C:null,t:0,seen:{}}};
function cs123Geo(){if(CS123.G)return CS123.G;const T=THREE;
  CS123.G={box:G_BOX,cyl:new T.CylinderGeometry(1,1,1,7),cyl4:new T.CylinderGeometry(1,1,1,4),hex:new T.CylinderGeometry(1,1,1,6),tcyl:new T.CylinderGeometry(.6,1,1,7),
    cone:new T.ConeGeometry(1,1,7),cone4:new T.ConeGeometry(1,1,4),sph:new T.SphereGeometry(1,8,6),hemi:new T.SphereGeometry(1,9,4,0,Math.PI*2,0,Math.PI/2),
    ico:new T.IcosahedronGeometry(1,0),oct:G_OCT,dod:CG.dod,tor:new T.TorusGeometry(1,.18,5,12),arc:new T.TorusGeometry(1,.1,4,8,Math.PI),
    disc:new T.CircleGeometry(1,14),ring:new T.RingGeometry(.82,1,18),pln:G_PLN,link:new T.TorusGeometry(1,.3,3,6)};
  return CS123.G}
// merge every static mesh under g (nested groups too) by material; breakable boxes and kept (animated) meshes stay
function cs123Merge(g){g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),M=new THREE.Matrix4(),by=new Map(),rm=[];
  const walk=o=>{for(const c of o.children){if(c.userData.box||c.userData.keep)continue;
    if(c.isMesh){if(c.material.map)continue;M.multiplyMatrices(inv,c.matrixWorld);let e=by.get(c.material);if(!e)by.set(c.material,e={geo:[],sh:false});
      const gg=c.geometry.index?c.geometry.toNonIndexed():c.geometry.clone();if(gg.attributes.uv)gg.deleteAttribute('uv');gg.applyMatrix4(M);e.geo.push(gg);e.sh=e.sh||c.castShadow;rm.push(c)}
    else walk(c)}};
  walk(g);rm.forEach(o=>{if(o.userData.own)o.geometry.dispose();o.parent.remove(o)});
  // drop groups left empty
  const prune=o=>{for(const c of o.children.slice()){if(c.userData.box||c.isMesh)continue;prune(c);if(!c.children.length)o.remove(c)}};prune(g);
  by.forEach((e,mat)=>{let n=0;e.geo.forEach(q=>n+=q.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3);let off=0;
    e.geo.forEach(q=>{P.set(q.attributes.position.array,off*3);if(q.attributes.normal)N.set(q.attributes.normal.array,off*3);off+=q.attributes.position.count;q.dispose()});
    const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(P,3));bg.setAttribute('normal',new THREE.BufferAttribute(N,3));bg.computeBoundingSphere();
    let m;if(!mat.transparent&&!mat.isMeshBasicMaterial){const P2=bg.attributes.position,cl=new Float32Array(P2.count*3);
      for(let i=0;i+2<P2.count;i+=3){const q=Math.sin(P2.getX(i)*12.9898+P2.getY(i)*78.233+P2.getZ(i)*37.719)*43758.5453,v=.8+.32*(q-Math.floor(q));for(let k=0;k<9;k++)cl[i*3+k]=v}
      bg.setAttribute('color',new THREE.BufferAttribute(cl,3));if(!CMC.has(mat)){const c=mat.clone();c.vertexColors=true;c.flatShading=true;c.userData.lps=1;CMC.set(mat,c)}m=new THREE.Mesh(bg,CMC.get(mat))}
    else m=new THREE.Mesh(bg,mat);
    m.castShadow=e.sh&&!mat.transparent;m.receiveShadow=true;m.matrixAutoUpdate=false;m.updateMatrix();g.add(m)})}

// builds camp C into group g from its design (C.key); returns false when there is no design
function cs123Build(C,g){const Q=cs123Geo(),R=C.r;let s=C.seed;
  const rn=()=>(s=s*16807%2147483647)/2147483647,rr=(a,b)=>a+rn()*(b-a),pk=L=>L[Math.floor(rn()*L.length)],P2=Math.PI/2,TAU=6.283;
  const gy=(x,z)=>GH(C.x+x,C.z+z),ca=Math.cos(C.ang),sa=Math.sin(C.ang),AN=C.ang;
  const ax=(u,v)=>[u*ca-v*sa,u*sa+v*ca]; // u along the camp's axis, v across it
  const S=(c,o)=>sm(c,o),G=c=>gmat(c),T=(c,o)=>tm(c,o==null?.35:o);
  const put=(geo,mat,x,y,z,sx,sy,sz,rx,ry,rz)=>TQ(g,geo,mat,x,gy(x,z)+y,z,sx,sy,sz,rx,ry,rz);
  const putY=(geo,mat,x,Y,z,sx,sy,sz,rx,ry,rz)=>TQ(g,geo,mat,x,Y,z,sx,sy,sz,rx,ry,rz);
  // a local frame at (x,z) facing angle a: local x points along a, local z across; y is height above the ground there
  const sub=(x,z,a,y)=>{const sg=new THREE.Group();sg.position.set(x,gy(x,z)+(y||0),z);sg.rotation.y=-(a||0);g.add(sg);return sg};
  const blk=(x,z,r)=>{const cx=C.x+x,cz=C.z+z;if(r<.55){CBLK.add(Math.round(cz)*W+Math.round(cx));return}
    for(let j=Math.floor(cz-r);j<=Math.ceil(cz+r);j++)for(let i=Math.floor(cx-r);i<=Math.ceil(cx+r);i++)if(Math.hypot(i-cx,j-cz)<=r)CBLK.add(j*W+i)};
  const used=[],free=(x,z,r)=>used.every(u=>Math.hypot(u[0]-x,u[1]-z)>u[2]+r),take=(x,z,r)=>{used.push([x,z,r])};
  const spot=(r0,r1,rad)=>{for(let t=0;t<30;t++){const a=rn()*TAU,d=Math.sqrt(rr(r0*r0,r1*r1)),x=Math.cos(a)*d,z=Math.sin(a)*d;if(free(x,z,rad)){take(x,z,rad);return [x,z,a]}}return null};
  const scat=(n,r0,r1,rad,f)=>{for(let i=0;i<n;i++){const p=spot(r0,r1,rad);if(p)f(p[0],p[1],p[2],i)}};
  const ring=(n,r,f,j,a0)=>{j=j==null?.2:j;a0=a0==null?rn()*TAU:a0;for(let i=0;i<n;i++){const a=a0+i/n*TAU+rr(-j,j)*.6,d=r*rr(1-j*.3,1+j*.3);f(Math.cos(a)*d,Math.sin(a)*d,a,i)}};
  const keep=o=>{o.userData.keep=1;o.castShadow=false;return o};
  const anim=(o,k,a,sp)=>{keep(o);CS123.an.push({C,o,k,a:a||.2,sp:sp||1,y0:o.position.y,x0:o.position.x,z0:o.position.z,ph:rn()*TAU,s0:o.scale.clone()});return o};
  const flame=(x,y,z,col,k,inner)=>{k=k||1;const f1=put(Q.cone,G(col||0xff7a1a),x,y+.2*k,z,.2*k,.55*k,.2*k),f2=put(Q.cone,G(inner||0xffd36a),x,y+.14*k,z,.1*k,.32*k,.1*k);f1.castShadow=f2.castShadow=false;CFL.push(f1,f2);return f1};
  const halo=(x,z,r,col,op,y)=>{const o=put(Q.disc,T(col,op||.2),x,y||.05,z,r,r,1,-P2);o.castShadow=false;return o};
  // ground decals that follow the terrain (r0..r1 ring, wobbly edge)
  const patch=(x,z,r0,r1,col,op,lift,lob)=>{const geo=new THREE.RingGeometry(r0,r1,22,3),P=geo.attributes.position,sd=rn()*6;
    for(let k=0;k<P.count;k++){const px=P.getX(k),py=P.getY(k),an=Math.atan2(py,px),w=1+.14*Math.sin(an*(lob||5)+sd)+.07*Math.sin(an*11+sd*2),wx=x+px*w,wz=z-py*w;P.setXYZ(k,wx,GH(C.x+wx,C.z+wz)+(lift||.04),wz)}
    geo.computeVertexNormals();const o=op==null?.6:op,m=new THREE.Mesh(geo,sm(col,{transparent:true,opacity:o,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));m.receiveShadow=true;m.userData.own=1;g.add(m);
    if(r1-r0>1.2&&!patch.rim){patch.rim=1;try{patch(x,z,r1*.98,r1*1.14,col,o*.4,lift,lob)}finally{patch.rim=0}}return m};
  // ---- fire and light ----
  const fire=(x,z,col,k,inner)=>{k=k||1;ring(7,.55*k,(a,b)=>put(Q.sph,S(0x55514a),x+a,.08,z+b,.16*k,.12*k,.16*k),.1);
    put(Q.cyl,S(0x4a3020),x,.12,z,.07,.8*k,.07,0,.5,P2);put(Q.cyl,S(0x4a3020),x,.12,z,.07,.8*k,.07,0,-.9,P2);flame(x,.1,z,col,1.2*k,inner);halo(x,z,1.7*k,col||0xff9a3a,.2);take(x,z,.9*k)};
  const brazier=(x,z,col,h,inner)=>{h=h||1.1;blk(x,z,0);take(x,z,.45);put(Q.cyl,S(0x2a2420,{metalness:.6}),x,h/2,z,.06,h,.06);put(Q.tcyl,S(0x2a2420,{metalness:.6}),x,h+.02,z,.34,.24,.34,Math.PI);flame(x,h+.08,z,col||0xff6a1a,1,inner)};
  const torch=(x,z,col,h,inner)=>{h=h||1.8;blk(x,z,0);put(Q.cyl,S(0x3a2818),x,h/2,z,.05,h,.05);put(Q.tcyl,S(0x2a2420),x,h,z,.1,.18,.1,Math.PI);flame(x,h+.05,z,col,.8,inner)};
  const candle=(x,z,col,h,wax)=>{h=h||.3;put(Q.cyl,S(wax||0xe8e0c8),x,h/2,z,.05,h,.05);const f=put(Q.cone,G(col||0xffc060),x,h+.07,z,.04,.13,.04);f.castShadow=false;CFL.push(f)};
  const candles=(x,z,n,r,col,wax,h)=>{for(let i=0;i<n;i++){const a=rn()*TAU,d=rr(0,r);candle(x+Math.cos(a)*d,z+Math.sin(a)*d,col,(h||.3)*rr(.6,1.4),wax)}};
  // ---- stone ----
  const rock=(x,z,k,col,fl)=>{fl=fl||1;if(k>=.9)blk(x,z,k*.5);take(x,z,k*.6);return put(Q.dod,S(col||0x7a7670),x,k*.38*fl,z,k*rr(.8,1.2),k*rr(.55,.85)*fl,k*rr(.8,1.2),rr(0,3),rr(0,3),0)};
  const slab=(x,z,w,h,d,a,col,lean,tw)=>{blk(x,z,Math.max(.4,Math.min(w,d)*.45));take(x,z,Math.max(w,d)*.45);return put(Q.box,S(col),x,h/2-.15,z,w,h+.3,d,lean||0,-a,tw||0)};
  const pillar=(x,z,h,col,rad,brk)=>{rad=rad||.32;blk(x,z,rad>.5?rad:0);take(x,z,rad+.35);put(Q.cyl,S(col),x,h/2,z,rad,h,rad);put(Q.box,S(col),x,.12,z,rad*2.5,.24,rad*2.5,0,rr(0,1.5),0);
    if(brk){put(Q.cyl,S(col),x+rad*.2,h+.1,z,rad*.95,.4,rad*.95,rr(-.4,.4),0,rr(-.4,.4));put(Q.box,S(col),x+rad*2.6,.18,z+rr(-.6,.6),rad*1.6,rad*1.1,rad*1.4,0,rr(0,3),0)}
    else put(Q.box,S(col),x,h+.11,z,rad*2.6,.22,rad*2.6)};
  const fallen=(x,z,a,len,rad,col)=>{take(x,z,len*.5);for(let q=-len/2+.3;q<=len/2;q+=.8)blk(x+Math.cos(a)*q,z+Math.sin(a)*q,0);return put(Q.cyl,S(col),x,rad*.8,z,rad,len,rad,0,-a,P2)};
  const arch=(x,z,a,w,h,col,th)=>{th=th||.5;const nx=-Math.sin(a),nz=Math.cos(a);[-1,1].forEach(s=>{const px=x+nx*w/2*s,pz=z+nz*w/2*s;blk(px,pz,0);put(Q.box,S(col),px,h/2-.2,pz,th,h+.4,th,0,-a,0)});
    put(Q.box,S(col),x,h+th*.35,z,th*1.15,th*.8,w+th*1.4,0,-a,0);take(x,z,w*.5)}; // a = the way through
  const wall=(x,z,a,len,h,col,cren,th)=>{th=th||.55;const nx=Math.cos(a),nz=Math.sin(a),n=Math.max(1,Math.round(len/1.8)),sl=len/n;take(x,z,len*.5);
    for(let i=0;i<n;i++){const q=-len/2+sl*(i+.5),px=x+nx*q,pz=z+nz*q;blk(px-nx*sl*.25,pz-nz*sl*.25,0);blk(px+nx*sl*.25,pz+nz*sl*.25,0);
      put(Q.box,S(col),px,h/2-.3,pz,sl+.04,h+.6,th,0,-a,0);if(cren)put(Q.box,S(col),px,h+.12,pz,sl*.45,.44,th*1.05,0,-a,0)}}; // a = along the wall
  const rubble=(x,z,n,r,col)=>{for(let i=0;i<n;i++){const k=rr(.18,.5);put(Q.box,S(col),x+rr(-r,r),k*.25,z+rr(-r,r),k*rr(.8,1.4),k*rr(.5,1),k,rr(-.4,.4),rr(0,3),rr(-.4,.4))}};
  const obelisk=(x,z,h,col,gl,a)=>{blk(x,z,0);take(x,z,.6);a=a==null?rr(0,6):a;put(CG.tent,S(col),x,h/2,z,.55,h,.55,0,-a+Math.PI/4,0);
    if(gl){const r=put(Q.box,G(gl),x+Math.cos(a)*.25,h*.45,z+Math.sin(a)*.25,.03,h*.45,.1,0,-a,0);r.castShadow=false}};
  const runes=(x,z,r,col,n)=>{n=n||5;[1,.62].forEach(k=>{const o=put(Q.ring,G(col),x,.06,z,r*k,r*k,1,-P2);o.castShadow=false});
    for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+2)/n*TAU,x1=Math.cos(a)*r*.62,z1=Math.sin(a)*r*.62,x2=Math.cos(b)*r*.62,z2=Math.sin(b)*r*.62,l=Math.hypot(x2-x1,z2-z1);
      const ln=put(Q.box,G(col),x+(x1+x2)/2,.06,z+(z1+z2)/2,l,.012,.06,0,-Math.atan2(z2-z1,x2-x1),0);ln.castShadow=false}};
  const cracks=(x,z,r,col,n)=>{n=n||9;for(let i=0;i<n;i++){const a=rn()*TAU,d=rr(0,r),cx=x+Math.cos(a)*d,cz=z+Math.sin(a)*d,b=rn()*TAU,o=put(Q.box,G(col),cx,.04,cz,rr(.6,1.8),.012,.05,0,-b,0);o.castShadow=false}};
  // ---- camp gear ----
  const box=(x,z,fn)=>{const bg=new THREE.Group();bg.userData.box=1;bg.position.set(x,gy(x,z),z);fn(bg);g.add(bg);(C.boxes=C.boxes||[]).push({g:bg,x:C.x+x,z:C.z+z,b:0});take(x,z,.5)};
  const crate=(x,z,a)=>box(x,z,bg=>{const k=rr(.5,.68),r0=a==null?rr(0,1.5):a;TQ(bg,Q.box,S(0x7a5530),0,k/2,0,k,k,k,0,r0);TQ(bg,Q.box,S(0x4a3220),0,k/2,0,k*1.03,k*.12,k*1.03,0,r0);TQ(bg,Q.box,S(0x4a3220),0,k/2,0,k*.12,k*1.03,k*1.03,0,r0)});
  const barrel=(x,z,col)=>box(x,z,bg=>{TQ(bg,Q.cyl,S(col||0x6a4426),0,.4,0,.28,.8,.28);[.2,.62].forEach(y=>TQ(bg,Q.cyl,S(0x3a3430,{metalness:.5}),0,y,0,.3,.06,.3))});
  const urn=(x,z,col,k)=>box(x,z,bg=>{k=k||1;TQ(bg,Q.sph,S(col),0,.32*k,0,.28*k,.32*k,.28*k);TQ(bg,Q.cyl,S(col),0,.66*k,0,.12*k,.14*k,.12*k);TQ(bg,Q.cyl,S(col),0,.75*k,0,.17*k,.05*k,.17*k)});
  const pole=(x,z,h,col,r)=>put(Q.cyl,S(col||0x4a3020),x,h/2,z,r||.06,h,r||.06,rr(-.05,.05),0,rr(-.05,.05));
  const stake=(x,z,h,col)=>{blk(x,z,0);put(Q.cyl,S(col||0x5a3e24),x,h/2,z,.1,h,.1,rr(-.1,.1),0,rr(-.1,.1));put(Q.cone,S(col||0x5a3e24),x,h+.14,z,.1,.28,.1)};
  const palis=(x,z,a,len,h,col)=>{const nx=Math.cos(a),nz=Math.sin(a);for(let q=-len/2;q<=len/2;q+=.32)stake(x+nx*q+rr(-.04,.04),z+nz*q+rr(-.04,.04),h*rr(.85,1.1),col);take(x,z,len*.5)};
  const banner=(x,z,col,h,a,trim)=>{h=h||2.8;a=a==null?rr(0,TAU):a;const vx=-Math.sin(a),vz=Math.cos(a);blk(x,z,0);take(x,z,.35);put(Q.cyl,S(0x2a2018),x,h/2,z,.05,h,.05);
    put(Q.box,S(0x2a2018),x+vx*.4,h-.12,z+vz*.4,.05,.05,.9,0,-a,0);const b=put(Q.pln,S(col,{side:THREE.DoubleSide,emissive:col,emissiveIntensity:.15}),x+vx*.42,h-.75,z+vz*.42,.75,1.15,1,0,-a+P2,0);b.castShadow=false;
    if(trim)put(Q.box,S(trim),x+vx*.42,h-1.36,z+vz*.42,.03,.08,.76,0,-a,0)};
  const tent=(x,z,a,col,k)=>{k=k||1;blk(x,z,.95*k);take(x,z,1.4*k);put(CG.tent,S(col),x,.9*k,z,1.25*k,1.8*k,1.25*k,0,-a+Math.PI/4,0);
    put(Q.box,S(0x1a1410),x+Math.cos(a)*.6*k,.42*k,z+Math.sin(a)*.6*k,.06,.8*k,.5*k,0,-a,0);put(Q.cyl,S(0x4a3020),x,1.85*k,z,.04,.4*k,.04)}; // a = the door
  const aTent=(x,z,a,col,len,k)=>{k=k||1;len=len||2.6;const sg=sub(x,z,a,0);blk(x,z,1*k);take(x,z,len*.6);[-1,1].forEach(s=>TQ(sg,Q.box,S(col),0,.62*k,.52*k*s,len,.06,1.45*k,s*.92,0,0));
    [-1,1].forEach(s=>TQ(sg,Q.cyl,S(0x3a2818),len/2*s,.65*k,0,.04,1.3*k,.04));TQ(sg,Q.cyl,S(0x3a2818),0,1.3*k,0,.035,len+.2,.035,0,0,P2);TQ(sg,Q.box,S(0x120c08),len/2-.05,.42*k,0,.02,.7*k,.7*k);return sg};
  const table=(x,z,a,col)=>{const sg=sub(x,z,a,0);blk(x,z,0);take(x,z,.9);TQ(sg,Q.box,S(col||0x5a4028),0,.72,0,1.5,.08,.8);[-1,1].forEach(s=>[-1,1].forEach(t=>TQ(sg,Q.box,S(col||0x5a4028),.62*s,.36,.32*t,.08,.72,.08)));return sg};
  const rack=(x,z,a,wcol)=>{const sg=sub(x,z,a,0),Wd=S(0x4a3220);blk(x,z,.5);take(x,z,1.1);[-1,1].forEach(s=>TQ(sg,Q.cyl,Wd,0,.6,.8*s,.05,1.2,.05));
    [1.1,.45].forEach(y=>TQ(sg,Q.cyl,Wd,0,y,0,.04,1.7,.04,P2,0,0));for(let i=0;i<4;i++){const q=-.55+i*.37;TQ(sg,Q.cyl,S(0x5a4428),.12,.95,q,.025,1.9,.025,0,0,-.2);TQ(sg,Q.cone,S(wcol||0x9a9aa2,{metalness:.7,roughness:.35}),.31,1.94,q,.05,.3,.05,0,0,-.2)}};
  const dummy=(x,z,a)=>{const sg=sub(x,z,a,0);blk(x,z,0);take(x,z,.6);TQ(sg,Q.cyl,S(0x4a3220),0,.7,0,.05,1.4,.05);TQ(sg,Q.cyl,S(0x8a7a50),0,1.1,0,.26,.65,.22);TQ(sg,Q.sph,S(0x8a7a50),0,1.6,0,.18,.2,.18);TQ(sg,Q.cyl,S(0x4a3220),0,1.25,0,.04,1.1,.04,P2,0,0)};
  const drum=(x,z,col,k)=>{k=k||1;blk(x,z,0);take(x,z,.6*k);put(Q.cyl,S(col||0x6a4426),x,.45*k,z,.45*k,.9*k,.45*k);put(Q.cyl,S(0xd8c8a0),x,.91*k,z,.47*k,.03,.47*k);for(let i=0;i<6;i++){const a=i/6*TAU;put(Q.cyl4,S(0x8a7a50),x+Math.cos(a)*.46*k,.45*k,z+Math.sin(a)*.46*k,.015,.9*k,.015,0,0,.3)}};
  const cauldron=(x,z,col,k,liq,glow)=>{k=k||1;blk(x,z,.5*k);take(x,z,1*k);put(Q.sph,S(0x1e1e22,{metalness:.5}),x,.42*k,z,.55*k,.42*k,.55*k);const l=put(Q.disc,glow===false?S(liq||col):G(liq||col),x,.7*k,z,.45*k,.45*k,1,-P2);l.castShadow=false;fire(x,z,col||0xff6a1a,k)};
  const sack=(x,z,col)=>put(Q.sph,S(col||0x8a7a5a),x,.22,z,.28,.26,.24,0,rr(0,3),0);
  // ---- bones and death ----
  const skull=(x,y,z,k,col,a)=>{k=k||1;a=a==null?rr(0,TAU):a;const Y=gy(x,z)+y,M=S(col||0xe8e0c8);putY(Q.sph,M,x,Y+.17*k,z,.2*k,.18*k,.17*k,0,-a,0);putY(Q.box,M,x+Math.cos(a)*.09*k,Y+.05*k,z+Math.sin(a)*.09*k,.12*k,.08*k,.17*k,0,-a,0);
    const ex=Math.cos(a)*.16*k,ez=Math.sin(a)*.16*k,px=-Math.sin(a)*.075*k,pz=Math.cos(a)*.075*k;[-1,1].forEach(s=>{const o=putY(Q.sph,G(0x0a0808),x+ex+px*s,Y+.2*k,z+ez+pz*s,.045*k,.05*k,.045*k);o.castShadow=false})};
  const skullPole=(x,z,h,col)=>{h=h||1.9;blk(x,z,0);take(x,z,.3);pole(x,z,h,0x3a2818,.05);skull(x,h-.1,z,1.1,col)};
  const bones=(x,z,n,sp,col)=>{n=n||4;sp=sp||.6;for(let i=0;i<n;i++)put(Q.cyl4,S(col||0xe0d8c0),x+rr(-sp,sp),.04,z+rr(-sp,sp),.04,rr(.3,.7),.04,0,rr(0,TAU),P2);if(rn()<.6)skull(x+rr(-.3,.3),-.04,z+rr(-.3,.3),.9,col)};
  const bonePile=(x,z,k,col)=>{take(x,z,k);blk(x,z,k*.5);put(Q.sph,S(col||0xd8d0b8),x,-.1,z,k,k*.45,k*.9,0,rr(0,3),0);for(let i=0;i<Math.round(8*k);i++){const a=rn()*TAU,d=rr(0,k*.9);put(Q.cyl4,S(col||0xe0d8c0),x+Math.cos(a)*d,k*.45*(1-d/k)+.05,z+Math.sin(a)*d,.05,rr(.4,.9),.05,rr(-1,1),rr(0,3),P2)}
    for(let i=0;i<Math.round(3*k);i++){const a=rn()*TAU,d=rr(0,k*.7);skull(x+Math.cos(a)*d,k*.45*(1-d/k)-.05,z+Math.sin(a)*d,1,col)}};
  const ribcage=(x,z,a,k,col,n)=>{n=n||7;const sg=sub(x,z,a,-.2);for(let i=0;i<n;i++){const sc=(1.5-Math.abs(i-(n-1)/2)*.17)*k;TQ(sg,Q.arc,S(col),(i-(n-1)/2)*.62*k,0,0,sc*.85,sc*1.25,sc,0,P2,0)}
    TQ(sg,Q.cyl,S(col),0,.12,0,.14*k,n*.75*k,.14*k,0,0,P2);take(x,z,n*.32*k);[-1,1].forEach(s=>blk(x+Math.cos(a)*n*.3*k*s,z+Math.sin(a)*n*.3*k*s,0));return sg};
  const bigSkull=(x,z,a,k,col,horns,y)=>{const sg=sub(x,z,a,y||0),M=S(col);TQ(sg,Q.sph,M,0,.7*k,0,1.1*k,.8*k,.85*k);TQ(sg,Q.box,M,.85*k,.3*k,0,1*k,.45*k,.8*k,0,0,-.2);
    [-1,1].forEach(s=>{const o=TQ(sg,Q.sph,G(0x0a0606),.78*k,.85*k,.36*k*s,.2*k,.22*k,.2*k);o.castShadow=false;if(horns)TQ(sg,Q.cone,M,.1*k,1.3*k,.62*k*s,.14*k,1*k,.14*k,s*.7,0,-.5)});blk(x,z,.9*k);take(x,z,1.3*k);return sg};
  const femur=(x,z,a,len,col,y)=>{const sg=sub(x,z,a,y||0),M=S(col);TQ(sg,Q.cyl,M,0,.3,0,.22*len/4,len,.22*len/4,0,0,P2);[-1,1].forEach(s=>[-1,1].forEach(t=>TQ(sg,Q.sph,M,len/2*s,.3,.18*len/4*t,.3*len/4,.3*len/4,.3*len/4)));take(x,z,len*.5);blk(x,z,.5)};
  const grave=(x,z,a,col,kind)=>{const sg=sub(x,z,a,0),M=S(col||0x8a8a86);kind=kind==null?Math.floor(rn()*3):kind;blk(x,z,0);take(x,z,.5);const tl=rr(-.14,.14),tz=rr(-.1,.1);
    if(kind==0){TQ(sg,Q.box,M,0,.42,0,.14,.84,.56,tl,0,tz);TQ(sg,Q.cyl,M,0,.84,0,.28,.14,.28,tl,0,P2)}
    else if(kind==1){TQ(sg,Q.box,M,0,.55,0,.12,1.1,.12,tl,0,tz);TQ(sg,Q.box,M,0,.78,0,.12,.12,.6,tl,0,tz)}
    else{TQ(sg,Q.box,M,0,.3,0,.16,.6,.5,tl,0,tz);TQ(sg,Q.box,S(0x4a4034),-.65,.08,0,1.1,.2,.55)}};
  const coffin=(x,z,a,col,open)=>{const sg=sub(x,z,a,0),M=S(col||0x3a2a20);blk(x,z,0);take(x,z,1);TQ(sg,Q.box,M,0,.22,0,1.8,.4,.6);
    if(open){TQ(sg,Q.box,S(0x0e0a08),0,.43,0,1.6,.02,.46);TQ(sg,Q.box,M,.2,.08,.72,1.8,.08,.6,0,.25,.1)}else TQ(sg,Q.box,M,0,.46,0,1.86,.08,.66);return sg};
  const sarc=(x,z,a,col,tr)=>{const sg=sub(x,z,a,0),M=S(col);TQ(sg,Q.box,M,0,.45,0,2.1,.9,.9);TQ(sg,Q.box,M,0,.95,0,2.2,.14,1);TQ(sg,Q.box,S(tr||0xd8a830,{metalness:.6,roughness:.4}),0,.62,.46,1.8,.08,.02);
    TQ(sg,Q.sph,M,.8,1.12,0,.22,.16,.22);blk(x,z,1);take(x,z,1.3);return sg};
  const carcass=(x,z,a,k,col,ribCol)=>{const sg=sub(x,z,a,0),M=S(col||0x5a3a30);blk(x,z,.6*k);take(x,z,1.3*k);TQ(sg,Q.sph,M,0,.32*k,0,1.1*k,.42*k,.6*k);
    for(let i=0;i<4;i++)TQ(sg,Q.arc,S(ribCol||0xe0d4b8),(i-1.5)*.34*k,.42*k,0,.5*k,.55*k,.5*k,0,P2,0);[-1,1].forEach(s=>TQ(sg,Q.cyl,M,.4*k*s,.15*k,.55*k,.07*k,.7*k,.07*k,P2-.3,0,0));TQ(sg,Q.sph,M,1.15*k,.28*k,0,.35*k,.25*k,.28*k);return sg};
  // ---- water ----
  // a flat pool sunk to the lowest ground under it (the shore hides its edge); .userData.Y = its height
  const pool=(x,z,rx,rz,col,glow,op,dy)=>{let mn=1e9;[[0,0],[rx*.6,0],[-rx*.6,0],[0,rz*.6],[0,-rz*.6]].forEach(q=>mn=Math.min(mn,gy(x+q[0],z+q[1])));const y=Math.max(mn+(dy==null?.1:dy),.08)-gy(x,z);
    const mat=glow?G(col):S(col,op==null?{roughness:.12,metalness:.25}:{roughness:.12,metalness:.25,transparent:true,opacity:op});const o=put(Q.disc,mat,x,y,z,rx,rz,1,-P2,0,rr(0,3));o.castShadow=false;
    if(glow){const h=put(Q.disc,T(col,.2),x,y+.02,z,rx*1.3,rz*1.3,1,-P2);h.castShadow=false}take(x,z,Math.max(rx,rz)*.7);o.userData.Y=o.position.y;return o};
  const water=(x,z,rx,rz,col,op)=>{if(gy(x,z)<-.05){take(x,z,Math.max(rx,rz)*.7);return {userData:{Y:.02}}}return pool(x,z,rx,rz,col,false,op)};
  const lily=(x,Y,z,col)=>{const o=putY(Q.disc,S(col||0x3a7a3a),x,Y,z,rr(.25,.45),rr(.25,.45),1,-P2,0,rr(0,6));o.castShadow=false};
  // ---- growth ----
  const reeds=(x,z,col,n)=>{n=n||6;for(let i=0;i<n;i++){const ox=rr(-.45,.45),oz=rr(-.45,.45),h=rr(.7,1.3);put(Q.cyl4,S(col||0x5a7a3a),x+ox,h/2-.08,z+oz,.025,h,.025,rr(-.2,.2),0,rr(-.2,.2))}};   // v177: rooted (short reeds stood ~.1 above the ground)
  const shroom=(x,z,k,cap,glow)=>{put(Q.cyl,S(0xd8cdb0),x,k*.6,z,k*.14,k*1.2,k*.14);put(Q.sph,glow?S(cap,{emissive:cap,emissiveIntensity:.6}):S(cap),x,k*1.2,z,k*.6,k*.3,k*.6);[0,1,2].forEach(i=>put(Q.sph,S(0xf0e8d8),x+Math.cos(i*2.1)*k*.34,k*1.4,z+Math.sin(i*2.1)*k*.34,k*.08,k*.05,k*.08));if(k>1)blk(x,z,0)};
  const crystal=(x,z,k,col,gi)=>put(Q.oct,S(col,{emissive:col,emissiveIntensity:gi==null?.6:gi,roughness:.3}),x,k*.7,z,k*.3,k*.8,k*.3,rr(-.25,.25),rr(0,3),rr(-.25,.25));
  const crystals=(x,z,n,k,col,gi)=>{take(x,z,k*.8);for(let i=0;i<n;i++)crystal(x+rr(-k*.5,k*.5),z+rr(-k*.5,k*.5),k*rr(.5,1),col,gi)};
  const spike=(x,z,k,col)=>put(Q.cone,S(col||0x5a5662),x,k/2,z,k*.22,k,k*.22,rr(-.12,.12),0,rr(-.12,.12));
  const deadTree=(x,z,h,col,k,tips)=>{k=k||1;blk(x,z,0);take(x,z,.8*k);put(Q.tcyl,S(col),x,h/2,z,.22*k,h,.22*k,rr(-.08,.08),0,rr(-.08,.08));const n=3+Math.floor(rn()*3),T2=[];
    for(let i=0;i<n;i++){const a=rn()*TAU,y=h*rr(.45,.92),l=rr(.9,1.8)*k,bx=x+Math.cos(a)*l*.35,bz=z+Math.sin(a)*l*.35;put(Q.cyl4,S(col),bx,y+l*.25,bz,.06*k,l,.06*k,0,-a,-.9);T2.push([x+Math.cos(a)*l*.72,gy(x,z)+y+l*.55,z+Math.sin(a)*l*.72])}
    if(tips)tips.push(...T2)};
  const log=(x,z,a,len,rad,col,sink)=>{take(x,z,len*.45);const o=put(Q.cyl,S(col||0x3a3026),x,rad*.8-(sink||0),z,rad,len,rad,0,-a,P2);const nx=Math.cos(a),nz=Math.sin(a);for(let q=-len/2+.4;q<len/2;q+=.9)blk(x+nx*q,z+nz*q,0);return o};
  const stump=(x,z,col,h,k)=>{k=k||1;blk(x,z,0);h=h||rr(1,2.2);put(Q.tcyl,S(col||0x3a3026),x,h/2,z,.24*k,h,.28*k);put(Q.cyl4,S(col||0x3a3026),x+.3*k,h*.75,z,.06,1*k,.06,0,0,-.9);put(Q.cyl4,S(col||0x3a3026),x-.25*k,h*.6,z+.1,.05,.8*k,.05,.3,0,.8)};
  const web=(x,z,a,k,col)=>{const c=col||0xf0f0f0,ry=-a+P2,w=put(Q.ring,T(c,.4),x,1.4*k,z,1.3*k,1.3*k,1,0,ry,0);w.castShadow=false;for(let i=0;i<4;i++){const s2=put(Q.box,T(c,.35),x,1.4*k,z,.015,2.6*k,.015,0,ry,i*.785);s2.castShadow=false}
    const w2=put(Q.ring,T(c,.35),x,1.4*k,z,.6*k,.6*k,1,0,ry,0);w2.castShadow=false};
  const cocoon=(x,z,h,col)=>{put(Q.sph,S(col||0xe8e4dc),x,h,z,.25,.48,.25);const o=put(Q.cyl4,T(0xffffff,.5),x,h+.9,z,.01,1.4,.01);o.castShadow=false};
  const egg=(x,z,k,col,glow)=>put(Q.sph,glow?S(col,{emissive:col,emissiveIntensity:.65,roughness:.4}):S(col),x,k*.8,z,k*.6,k*.85,k*.6,rr(-.2,.2),0,rr(-.2,.2));
  const eggs=(x,z,n,k,col,glow)=>{take(x,z,k*1.3);for(let i=0;i<n;i++){const a=rn()*TAU,d=rr(0,k*1.1);egg(x+Math.cos(a)*d,z+Math.sin(a)*d,k*rr(.55,1),col,glow)}};
  const nest=(x,z,k,col,y,eggCol)=>{const Y=gy(x,z)+(y||0);putY(Q.tor,S(col||0x6a5030),x,Y+.25*k,z,1.3*k,1.3*k,1.4*k,P2);putY(Q.disc,S(0x4a3820),x,Y+.15*k,z,1.2*k,1.2*k,1,-P2);
    for(let i=0;i<3;i++)putY(Q.sph,S(eggCol||0xe8dcc0),x+rr(-.4,.4)*k,Y+.35*k,z+rr(-.4,.4)*k,.2*k,.26*k,.2*k);
    for(let i=0;i<10;i++){const a=rn()*TAU;putY(Q.cyl4,S(0x5a4428),x+Math.cos(a)*1.3*k,Y+.35*k,z+Math.sin(a)*1.3*k,.03,.9*k,.03,rr(1,2),a,0)}take(x,z,1.3*k)};
  const pod=(x,z,h,k,col,glow)=>{take(x,z,.6);put(Q.cyl4,S(0x3a3426),x,h/2,z,.05,h,.05);put(Q.cyl4,S(0x3a3426),x+.25,h+.05,z,.04,.6,.04,0,0,-1.2);
    const p=put(Q.sph,glow?S(col,{emissive:col,emissiveIntensity:.55}):S(col),x+.5,h-.55*k,z,.28*k,.55*k,.28*k);put(Q.cyl4,S(0x3a3426),x+.5,h-.02,z,.015,.2,.015);return p};
  const hole=(x,z,r,col)=>{const o=put(Q.disc,G(0x060404),x,.07,z,r,r*.8,1,-P2,0,rr(0,3));o.castShadow=false;put(Q.tor,S(col||0x5a4a3a),x,.03,z,r*1.05,r*.85,r*2.2,P2,0,0);take(x,z,r+.2)};
  const mound=(x,z,k,col,fl)=>put(Q.sph,S(col),x,-.12,z,k,k*(fl||.35),k*rr(.7,1.1),0,rr(0,3),0);
  // ---- figures and works ----
  const figure=(x,z,a,k,col,pose,hood,y)=>{const sg=sub(x,z,a,y||0),M=S(col);blk(x,z,0);take(x,z,.6*k);const Pz=pose||'stand';
    if(Pz=='kneel'){TQ(sg,Q.box,M,-.12*k,.16*k,.13*k,.55*k,.2*k,.17*k);TQ(sg,Q.box,M,.05*k,.3*k,-.13*k,.17*k,.6*k,.17*k)}
    else [-1,1].forEach(s=>TQ(sg,Q.box,M,0,.4*k,.13*k*s,.17*k,.8*k,.17*k,0,0,Pz=='cower'?.2:0));
    const hy=(Pz=='kneel'?.55:.8)*k,lean=Pz=='cower'?-.35:Pz=='kneel'?-.15:0;TQ(sg,Q.box,M,lean*.5*k,hy+.32*k,0,.26*k,.66*k,.5*k,0,0,lean);
    const hx=lean*1.3*k;TQ(sg,Q.sph,M,hx,hy+.8*k,0,.16*k,.19*k,.16*k);if(hood)TQ(sg,Q.cone,M,hx-.02*k,hy+.9*k,0,.24*k,.62*k,.24*k);
    const arm=(s,ry,rz,y2)=>TQ(sg,Q.box,M,.05*k,(y2||hy+.38*k),.33*k*s,.13*k,.62*k,.13*k,s*ry,0,rz);
    if(Pz=='raise'){arm(1,-.45,.2,hy+.75*k);arm(-1,-.45,.2,hy+.75*k)}else if(Pz=='cower'){arm(1,0,1.3,hy+.55*k);arm(-1,0,1.3,hy+.55*k)}else if(Pz=='kneel'){arm(1,0,.9,hy+.45*k);arm(-1,0,.9,hy+.45*k)}else{arm(1,-.12,.1);arm(-1,-.12,.1)}
    return sg};
  const gargoyle=(x,z,a,k,col,Y)=>{const sg=sub(x,z,a,Y||0),M=S(col);TQ(sg,Q.box,M,0,.5*k,0,.6*k,.7*k,.5*k,0,0,-.4);TQ(sg,Q.sph,M,.32*k,.98*k,0,.18*k,.2*k,.18*k);
    [-1,1].forEach(s=>{TQ(sg,Q.cone,M,.34*k,1.2*k,.1*k*s,.04*k,.2*k,.04*k);TQ(sg,Q.box,M,-.15*k,.95*k,.45*k*s,.55*k,.04*k,.6*k,s*.55,0,-.3);TQ(sg,Q.box,M,.25*k,.15*k,.18*k*s,.3*k,.3*k,.12*k);
      const e=TQ(sg,Q.sph,G(0xff3030),.48*k,1*k,.07*k*s,.03*k,.03*k,.03*k);e.castShadow=false});return sg};
  const serpent=(x,z,a,k,col,eye)=>{const sg=sub(x,z,a,0),M=S(col);blk(x,z,1*k);take(x,z,1.6*k);TQ(sg,Q.cyl,S(0x6a665a),0,.25*k,0,1.3*k,.5*k,1.3*k);
    for(let i=0;i<3;i++)TQ(sg,Q.tor,M,0,(.62+i*.32)*k,0,(1-i*.22)*k,(1-i*.22)*k,1.3*k,P2,0,0);
    TQ(sg,Q.cyl,M,.1*k,1.9*k,0,.2*k,1.3*k,.2*k,0,0,-.25);TQ(sg,Q.sph,M,.36*k,2.6*k,0,.34*k,.24*k,.28*k);TQ(sg,Q.box,M,.12*k,2.5*k,0,.1*k,.6*k,.95*k);
    [-1,1].forEach(s=>{const o=TQ(sg,Q.sph,G(eye||0xffd040),.62*k,2.66*k,.13*k*s,.05*k,.05*k,.05*k);o.castShadow=false});return sg};
  const cage=(x,z,k,col,y,occ)=>{const Y=gy(x,z)+(y||0),M=S(col||0x2a2a2e,{metalness:.6,roughness:.5});if(!y)blk(x,z,.6*k);take(x,z,.9*k);for(let i=0;i<10;i++){const a=i/10*TAU;putY(Q.cyl4,M,x+Math.cos(a)*.6*k,Y+.75*k,z+Math.sin(a)*.6*k,.03,1.5*k,.03)}
    putY(Q.cyl,M,x,Y+1.52*k,z,.66*k,.08,.66*k);putY(Q.cyl,M,x,Y+.04,z,.66*k,.08,.66*k);putY(Q.cone,M,x,Y+1.75*k,z,.5*k,.4*k,.5*k);
    if(occ){putY(Q.sph,S(0xe0d8c0),x,Y+.3*k,z,.17*k,.18*k,.17*k);putY(Q.cyl4,S(0xe0d8c0),x+.15,Y+.15,z,.04,.5*k,.04,0,.5,P2)}};
  const chainPost=(x,z,n,a)=>{blk(x,z,0);take(x,z,.6);a=a==null?rr(0,TAU):a;put(Q.cyl,S(0x2a2a2e,{metalness:.6}),x,.6,z,.08,1.2,.08);
    for(let i=0;i<(n||6);i++)put(Q.link,S(0x3a3a3e,{metalness:.7,roughness:.4}),x+Math.cos(a)*(.18+i*.19),.05,z+Math.sin(a)*(.18+i*.19),.09,.09,.09,P2,0,i%2?P2:0)};
  const gallows=(x,z,a,k)=>{k=k||1;const sg=sub(x,z,a,0),Wd=S(0x3a2a1c);blk(x,z,1.1*k);take(x,z,2*k);TQ(sg,Q.box,Wd,0,.35*k,0,2.4*k,.8*k,1.8*k);
    TQ(sg,Q.box,Wd,-.9*k,2.2*k,0,.18*k,3*k,.18*k);TQ(sg,Q.box,Wd,-.2*k,3.6*k,0,1.7*k,.16*k,.16*k);TQ(sg,Q.box,Wd,-.6*k,3.2*k,0,.12*k,.9*k,.1*k,0,0,.785);
    TQ(sg,Q.cyl4,S(0x8a7a50),.45*k,3.15*k,0,.02,.9*k,.02);TQ(sg,Q.tor,S(0x8a7a50),.45*k,2.6*k,0,.12*k,.16*k,.12*k,0,P2,0);
    for(let i=0;i<3;i++){const h=(.75-.24*(i+1))*k;TQ(sg,Q.box,Wd,1.38*k+i*.3*k,h/2,0,.3*k,h,1*k)}};
  const block=(x,z,a)=>{const sg=sub(x,z,a,0);blk(x,z,0);take(x,z,.7);TQ(sg,Q.cyl,S(0x5a3a24),0,.3,0,.4,.6,.4);const d=TQ(sg,Q.disc,G(0x6a0a10),0,.61,0,.3,.3,1,-P2);d.castShadow=false;
    TQ(sg,Q.cyl,S(0x3a2a1a),.1,.95,.1,.03,1,.03,0,0,.5);TQ(sg,Q.box,S(0x8a8a92,{metalness:.8,roughness:.3}),-.1,1.32,.1,.3,.34,.03,0,0,.5)};
  const stocks=(x,z,a)=>{const sg=sub(x,z,a,0),Wd=S(0x4a3220);blk(x,z,0);take(x,z,.8);[-1,1].forEach(s=>TQ(sg,Q.box,Wd,0,.45,.6*s,.12,.9,.12));TQ(sg,Q.box,Wd,0,.75,0,.14,.3,1.4)};
  const hedge=(x,z,a,len,h,col,rose)=>{const nx=Math.cos(a),nz=Math.sin(a),vx=-nz,vz=nx,n=Math.max(1,Math.round(len/1.6)),sl=len/n;take(x,z,len*.5);
    for(let i=0;i<n;i++){const q=-len/2+sl*(i+.5),px=x+nx*q,pz=z+nz*q;blk(px,pz,0);put(Q.box,S(col||0x1e2a1a),px,h/2-.15,pz,sl+.1,h+.3,.8,0,-a,0);
      for(let r2=0;r2<3;r2++){const sd=rn()<.5?-1:1,u=rr(-sl/2,sl/2);put(Q.sph,S(rose||0xb01020,{emissive:0x500008,emissiveIntensity:.4}),px+nx*u+vx*.42*sd,rr(.3,h),pz+nz*u+vz*.42*sd,.1,.1,.1)}}};
  const roseBush=(x,z,k,col)=>{take(x,z,.6*k);put(Q.sph,S(0x1e2a1a),x,.3*k,z,.5*k,.42*k,.5*k);for(let i=0;i<5;i++){const a=rn()*TAU;put(Q.sph,S(col||0xb01020,{emissive:0x500008,emissiveIntensity:.4}),x+Math.cos(a)*.42*k,rr(.3,.6)*k,z+Math.sin(a)*.42*k,.1,.1,.1)}};
  const fountain=(x,z,k,col,liq,glow)=>{blk(x,z,1.2*k);take(x,z,1.8*k);put(Q.cyl,S(col),x,.25*k,z,1.5*k,.5*k,1.5*k);const L=glow?G(liq):S(liq,{roughness:.1,metalness:.3}),o=put(Q.disc,L,x,.51*k,z,1.35*k,1.35*k,1,-P2);o.castShadow=false;
    put(Q.cyl,S(col),x,.9*k,z,.18*k,1.2*k,.18*k);put(Q.cyl,S(col),x,1.48*k,z,.6*k,.14*k,.6*k);const o2=put(Q.disc,L,x,1.56*k,z,.5*k,.5*k,1,-P2);o2.castShadow=false;put(Q.sph,S(col),x,1.78*k,z,.16*k,.22*k,.16*k)};
  const catapult=(x,z,a,k,broken)=>{const sg=sub(x,z,a,0),Wd=S(0x4a3220);blk(x,z,1.1*k);take(x,z,1.9*k);
    [-1,1].forEach(s=>{TQ(sg,Q.box,Wd,0,.25*k,.6*k*s,2.6*k,.2*k,.2*k);[-1,1].forEach(t=>TQ(sg,Q.cyl,S(0x3a2a1a),1*k*t,.35*k,.76*k*s,.35*k,.12*k,.35*k,P2,0,0));TQ(sg,Q.box,Wd,.1*k,.9*k,.6*k*s,.18*k,1.3*k,.18*k,0,0,-.35)});
    TQ(sg,Q.cyl,Wd,.3*k,1.45*k,0,.06*k,1.4*k,.06*k,P2,0,0);TQ(sg,Q.box,Wd,broken?-.4*k:-.55*k,broken?.5*k:1.5*k,0,2.4*k,.12*k,.14*k,0,0,broken?-.15:.6);TQ(sg,Q.hemi,Wd,broken?-1.6*k:-1.45*k,broken?.45*k:2.2*k,0,.3*k,.2*k,.3*k,Math.PI,0,0)};
  const ram=(x,z,a,k)=>{const sg=sub(x,z,a,0),Wd=S(0x4a3220);blk(x,z,1.2*k);take(x,z,2*k);[-1,1].forEach(s=>[-1,1].forEach(t=>{TQ(sg,Q.cyl,S(0x3a2a1a),1.1*k*t,.38*k,.85*k*s,.38*k,.12*k,.38*k,P2,0,0);TQ(sg,Q.box,Wd,1.1*k*t,1.2*k,.7*k*s,.16*k,1.8*k,.16*k,s*.22,0,0)}));
    TQ(sg,Q.cyl,S(0x3a2a1a),0,1.05*k,0,.24*k,3.6*k,.24*k,0,0,P2);TQ(sg,Q.cone,S(0x3a3a40,{metalness:.7}),1.95*k,1.05*k,0,.3*k,.5*k,.3*k,0,0,-P2);
    [-1,1].forEach(s=>TQ(sg,Q.box,S(0x5a4a38),0,2.05*k,.45*k*s,2.8*k,.08*k,1.05*k,s*.55,0,0))};
  const mausoleum=(x,z,a,k,col,roof)=>{const sg=sub(x,z,a,0),M=S(col);blk(x,z,1.6*k);take(x,z,2.4*k);TQ(sg,Q.box,M,0,.12*k,0,3.4*k,.36*k,3*k);TQ(sg,Q.box,M,-.2*k,1.3*k,0,2.6*k,2.2*k,2.4*k);
    [-1,1].forEach(s=>TQ(sg,Q.box,S(roof||col),-.2*k,2.72*k,.68*k*s,2.9*k,.14*k,1.65*k,s*.6,0,0));TQ(sg,Q.box,S(0x0a0808),1.11*k,1*k,0,.04,1.5*k,.9*k);
    [-1,1].forEach(s=>TQ(sg,Q.cyl,M,1.28*k,1.2*k,.95*k*s,.15*k,2.1*k,.15*k));TQ(sg,Q.box,M,1.24*k,2.35*k,0,.42*k,.3*k,2.3*k);TQ(sg,Q.cone4,M,-.2*k,3.55*k,0,.12*k,.6*k,.12*k);return sg};
  const well=(x,z,k,col,broken)=>{blk(x,z,.8*k);take(x,z,1.2*k);put(Q.cyl,S(col),x,.4*k,z,.8*k,.8*k,.8*k);const d=put(Q.disc,G(0x0a0806),x,.81*k,z,.62*k,.62*k,1,-P2);d.castShadow=false;
    if(broken){put(Q.box,S(0x4a3220),x+.75*k,.9*k,z,.1,1*k,.1,0,0,.3);rubble(x,z+1.1*k,4,.4,col)}else{[-1,1].forEach(s=>put(Q.box,S(0x4a3220),x+s*.75*k,1.2*k,z,.1,1.6*k,.1));put(Q.cyl,S(0x4a3220),x,1.9*k,z,.06,1.7*k,.06,0,0,P2);put(CG.tent,S(0x6a5a40),x,2.25*k,z,1*k,.6*k,.8*k,0,Math.PI/4,0)}};
  const palm=(x,z,h,dead)=>{blk(x,z,0);take(x,z,1);const lx=rr(-.25,.25),lz=rr(-.25,.25);put(Q.tcyl,S(0x6a5038),x+lx*h*.5,h/2,z+lz*h*.5,.16,h,.16,lz,0,-lx);
    const tx=x+lx*h,tz=z+lz*h,Y=gy(x,z)+h;const tl=dead?1.15:.35,fr=.75*Math.cos(tl)-.04,fy=Y-.75*Math.sin(tl)+.02;   // v177: each frond grows from the crown (their inner ends stood ~.3 above and beside it)
    for(let i=0;i<7;i++){const a=i/7*TAU+rr(-.2,.2);putY(Q.box,S(dead?0x8a6a3a:0x4a7a3a),tx+Math.cos(a)*fr,fy,tz+Math.sin(a)*fr,1.5,.04,.3,0,-a,-tl)}};
  const pylon=(x,z,a,h,col,tr)=>{const sg=sub(x,z,a,0),M=S(col);blk(x,z,.9);take(x,z,1.3);TQ(sg,Q.box,M,0,h/2-.2,0,1.6,h+.4,2.1);TQ(sg,Q.box,M,0,h+.15,0,1.9,.3,2.4);if(tr)TQ(sg,Q.box,S(tr,{metalness:.6,roughness:.4}),.81,h*.6,0,.03,h*.5,1.4)};
  const throne=(x,z,a,k,col)=>{const sg=sub(x,z,a,0),M=S(col);blk(x,z,1.2*k);take(x,z,1.8*k);TQ(sg,Q.box,M,0,.3*k,0,2.2*k,.6*k,2.2*k);TQ(sg,Q.box,M,.1*k,.95*k,0,1.4*k,.8*k,1.6*k);
    TQ(sg,Q.box,M,-.6*k,2.4*k,0,.4*k,3*k,1.8*k);[-1,1].forEach(s=>TQ(sg,Q.box,M,.1*k,1.6*k,.86*k*s,1.4*k,.5*k,.3*k));TQ(sg,Q.cone4,M,-.6*k,4.25*k,0,.6*k,.9*k,.9*k,0,Math.PI/4,0)};
  const leanTo=(x,z,a,k,col)=>{const sg=sub(x,z,a,0),M=S(col);blk(x,z,1.3*k);take(x,z,2.4*k);[-1,1].forEach(s=>TQ(sg,Q.box,M,0,1.05*k,.72*k*s,3.4*k,.32*k,2.4*k,s*1.0,0,0));
    TQ(sg,Q.box,S(0x0a0806),0,.6*k,0,3.2*k,1.2*k,.9*k)};
  const icicles=(x,Y,z,n,len,w,a)=>{const nx=-Math.sin(a),nz=Math.cos(a);for(let i=0;i<n;i++){const q=(n>1?i/(n-1)-.5:0)*w,l=len*rr(.45,1);putY(Q.cone,S(0xd8f0ff,{roughness:.2,emissive:0x6ab0d0,emissiveIntensity:.25}),x+nx*q,Y-l/2,z+nz*q,.08,l,.08,Math.PI,0,0)}};
  const ice=(x,z,k,col,gl)=>{if(k>1.2)blk(x,z,.5);else blk(x,z,0);take(x,z,k*.45);return put(Q.oct,S(col||0xbfe6ff,{roughness:.15,metalness:.1,emissive:gl||0x4a90c0,emissiveIntensity:.35}),x,k*.85,z,k*.32,k*1.1,k*.32,rr(-.15,.15),rr(0,3),rr(-.15,.15))};
  const shell=(x,z,k,col,a,ridge)=>{blk(x,z,k*.7);take(x,z,k*1.1);const sg=sub(x,z,a==null?rr(0,TAU):a,-.05);TQ(sg,Q.hemi,S(col),0,0,0,k*1.2,k*.6,k);
    for(let i=-1;i<=1;i++)TQ(sg,Q.box,S(ridge||0x3a3a2a),i*k*.5,k*.5-.08*Math.abs(i)*k,0,k*.14,k*.14,k*.85)};
  const meatRack=(x,z,a,col)=>{const sg=sub(x,z,a,0),Wd=S(0x3a2a1c);blk(x,z,.6);take(x,z,1.3);[-1,1].forEach(s=>TQ(sg,Q.cyl,Wd,0,1.1,1.1*s,.06,2.2,.06));TQ(sg,Q.cyl,Wd,0,2.15,0,.05,2.4,.05,P2,0,0);
    for(let i=0;i<3;i++){const q=-.7+i*.7,l=rr(.6,1);TQ(sg,Q.cyl4,S(0x8a7a50),0,1.95,q,.012,.4,.012);TQ(sg,Q.sph,S(col||0x7a2a24),0,1.75-l/2,q,.18,l/2,.15)}};
  const antlers=(x,z,h)=>{blk(x,z,0);take(x,z,.5);pole(x,z,h,0x3a2a1c,.07);skull(x,h-.25,z,1.3,0xe0d6c0);const Y=gy(x,z)+h,A=S(0xd8ccb0);
    [-1,1].forEach(s=>{putY(Q.cyl4,A,x+s*.25,Y+.15,z,.03,.6,.03,0,0,-s*.7);putY(Q.cyl4,A,x+s*.45,Y+.45,z,.025,.4,.025,0,0,s*.2);putY(Q.cyl4,A,x+s*.33,Y+.4,z+.08,.02,.3,.02,.5,0,-s*.4)})};
  const husk=(x,z,a,k,col)=>{const sg=sub(x,z,a,0),M=S(col||0xd8c090);take(x,z,1*k);for(let i=0;i<3;i++)TQ(sg,Q.sph,M,-i*.32*k,.14*k,0,.22*k,.14*k,.26*k);
    for(let i=0;i<4;i++)TQ(sg,Q.sph,M,-.95*k-i*.12*k,(.2+i*.18)*k,0,.1*k,.1*k,.1*k);TQ(sg,Q.cone,M,-1.22*k,.95*k,0,.05*k,.2*k,.05*k,0,0,-2.2);
    [-1,1].forEach(s=>TQ(sg,Q.box,M,.42*k,.12*k,.24*k*s,.3*k,.08*k,.12*k,0,s*.4,0))};
  const scarab=(x,z,a,k,col,gl)=>{const sg=sub(x,z,a,0),M=S(col,{metalness:.5,roughness:.4});blk(x,z,k>1?.6*k:0);take(x,z,.8*k);TQ(sg,Q.box,S(0xb8945a),0,.15*k,0,1.6*k,.3*k,1.2*k);
    TQ(sg,Q.hemi,M,-.1*k,.3*k,0,.7*k,.5*k,.55*k);TQ(sg,Q.sph,M,.55*k,.45*k,0,.22*k,.18*k,.26*k);TQ(sg,Q.box,M,-.1*k,.55*k,0,.9*k,.02,.02);[-1,1].forEach(s=>[-.3,0,.3].forEach(q=>TQ(sg,Q.box,M,q*k,.3*k,.6*k*s,.06*k,.06*k,.3*k,s*.4,0,0)));
    if(gl){const o=TQ(sg,Q.sph,G(gl),.73*k,.5*k,0,.06*k,.06*k,.06*k);o.castShadow=false}};
  const burrowMouth=(x,z,a,k,col)=>{const sg=sub(x,z,a,-.3*k);TQ(sg,Q.arc,S(col),0,0,0,1.1*k,1.2*k,2.6*k,0,P2,0);const d=TQ(sg,Q.disc,G(0x040302),-.15*k,.05,0,1*k,1*k,1,0,-P2,0);d.castShadow=false;take(x,z,1.3*k);blk(x-Math.cos(a)*.4,z-Math.sin(a)*.4,.6*k)};
  const steam=(x,z,col,k)=>{const o=put(Q.cone,T(col||0xb0ffa0,.18),x,1.1*(k||1),z,.4*(k||1),2.2*(k||1),.4*(k||1),Math.PI,0,0);anim(o,'puff',.25,.8)};
  const wisp=(x,y,z,col,k)=>{k=k||1;const sg=new THREE.Group();sg.position.set(x,gy(x,z)+y,z);TQ(sg,Q.sph,G(col),0,0,0,.09*k,.09*k,.09*k);TQ(sg,Q.sph,T(col,.22),0,0,0,.24*k,.24*k,.24*k);g.add(sg);anim(sg,'bob',.35,rr(.6,1.2));return sg};
  const ladder=(x,z,a,h,col)=>{const sg=sub(x,z,a,0),M=S(col||0x4a3220);take(x,z,.7);[-1,1].forEach(s=>TQ(sg,Q.box,M,.4,h/2,.28*s,.07,h,.07,0,0,-.35));for(let i=1;i<h/.4;i++){const y=i*.4*Math.cos(.35);TQ(sg,Q.box,M,.4+Math.tan(.35)*(y-h/2),y,0,.05,.05,.56)}};   // v177: rungs follow the rails' lean (they leaned the other way, off the ladder)
  // the camp's main axis: [u,v] → camp coordinates
  const A=(u,v)=>ax(u,v);
  const K={rn,rr,pk,gy,ax,A,AN,S,G,T,put,putY,sub,blk,take,free,spot,scat,ring,keep,anim,flame,halo,patch,fire,brazier,torch,candle,candles,rock,slab,pillar,fallen,arch,wall,rubble,obelisk,runes,cracks,
    box,crate,barrel,urn,pole,stake,palis,banner,tent,aTent,table,rack,dummy,drum,cauldron,sack,skull,skullPole,bones,bonePile,ribcage,bigSkull,femur,grave,coffin,sarc,carcass,reeds,shroom,crystal,crystals,spike,
    pool,water,lily,deadTree,log,stump,web,cocoon,egg,eggs,nest,pod,hole,mound,figure,gargoyle,serpent,cage,chainPost,gallows,block,stocks,hedge,roseBush,fountain,catapult,ram,mausoleum,well,palm,pylon,throne,leanTo,
    icicles,ice,shell,meatRack,antlers,husk,scarab,burrowMouth,steam,wisp,ladder,R,Q,P2,TAU};
  const B=cs123Designs(K)[C.key];if(!B)return false;
  B();return true}

// ---------------- the 54 camps ----------------
// Each design works in camp space (tiles from the camp centre); A(u,v) turns the camp's own axis (u along C.ang) into it.
// The ground shape each one stands on is in cs123Plan (same key).
function cs123Designs(K){
  const {rn,rr,pk,A,AN,S,G,T,put,putY,sub,blk,take,spot,scat,ring,anim,flame,halo,patch,fire,brazier,torch,candle,candles,rock,slab,pillar,fallen,arch,wall,rubble,obelisk,runes,cracks,
    crate,barrel,urn,pole,stake,palis,banner,tent,aTent,table,rack,dummy,drum,cauldron,sack,skull,skullPole,bones,bonePile,ribcage,bigSkull,femur,grave,coffin,sarc,carcass,
    reeds,shroom,crystal,crystals,spike,pool,water,lily,deadTree,log,stump,web,cocoon,egg,eggs,nest,pod,hole,mound,figure,gargoyle,serpent,cage,chainPost,gallows,block,stocks,hedge,roseBush,fountain,catapult,ram,mausoleum,well,palm,pylon,throne,leanTo,
    icicles,ice,shell,meatRack,antlers,husk,scarab,burrowMouth,steam,wisp,ladder,R,Q,P2,TAU,gy}=K;
  const out=(n,r0,f)=>ring(n,R*r0,f);                  // n things round a ring at r0 x the camp radius
  const edge=(n,f,rad)=>scat(n,R*.72,R*.98,rad||.6,f);  // n things scattered near the edge
  const dirAt=(x,z)=>Math.atan2(-z,-x);                 // facing the camp centre from (x,z)
  // palettes
  const GOO=0x6aff3a,MUD=0x2a2a1e,BONE=0xd8d0b0,ROT=0x3a3020,PALE=0xc8d8a0,
    BRZ=0xa07a3a,TEAL=0x2a6a5a,HIDE=0x4a6a3a,STONE=0x8a8a7a,MOSS=0x5a7a4a,WATER=0x3a6a7a,
    ICE=0xbfe6ff,SNOW=0xe8f0f8,GRAN=0x5a5e6a,BLUEF=0x6ad0ff,
    SANDS=0xc8a46a,GOLD=0xd8a830,BLEACH=0xf0e6cc,SALT=0xf4f4ee,AMBER=0xffa030,
    GST=0x7a7e86,DST=0x5a5e66,BONE2=0xd8d4c4,SPEC=0x9affe8,DWAT=0x1a2a2e,
    CST=0x3a3238,CST2=0x4a424a,BLOOD=0xa01020,BGL=0xff2040,IRON=0x2a2a2e,GTR=0xb08a3a,RCL=0x6a1018;
  return {
  // ======================= Kindlelight =======================
  '0_0_0':()=>{ // Caustic Pool: a sunken basin of glowing goo, steam, corroded remains on the slopes
    patch(0,0,.01,R*.62,0x1e2a14);patch(0,0,R*.6,R*.98,0x2a3a1a,.45);pool(0,0,R*.4,R*.36,GOO,true);
    for(let i=0;i<6;i++){const a=rn()*TAU,d=rr(0,R*.3),o=put(Q.sph,G(0xb0ff70),Math.cos(a)*d,.02,Math.sin(a)*d,.2,.12,.2);anim(o,'bob',.08,rr(1,2))}
    steam(rr(-2,2),rr(-2,2),0xb0ff90,1.3);steam(rr(-3,3),rr(-3,3),0xb0ff90,.9);steam(rr(-1,1),rr(-3,3),0xb0ff90,1.1);
    out(9,.64,(x,z)=>bones(x,z,3,.5,0xb8b890));out(6,.86,(x,z)=>deadTree(x,z,rr(2.4,3.6),0x6a7a5a,.9));
    out(10,.76,(x,z)=>{rock(x,z,rr(.6,1.1),0x34382c);halo(x,z,.55,GOO,.3,.3)});
    {const [x,z]=A(R*.33,1.2);put(Q.hemi,S(0x4a5a3a,{metalness:.6,roughness:.6}),x,-.05,z,.34,.3,.34)}
    {const [x,z]=A(-R*.3,-1.6);put(Q.disc,S(0x5a5a3a,{metalness:.5,roughness:.6}),x,.28,z,.52,.52,1,-1.15,rr(0,3),0);skull(x+.6,0,z,1,0xb8b890)}
    edge(7,(x,z)=>halo(x,z,rr(.4,.8),GOO,.3,.06))},
  '0_0_1':()=>{ // Maggot Nest: a rotting heap, a carcass on top, burrows and larva sacs
    patch(0,0,.01,R*.9,0x3a2a1a);carcass(0,0,AN,1.7,0x4a3a2a);
    out(6,.55,(x,z)=>hole(x,z,rr(.35,.55),0x3a2a1a));
    for(let i=0;i<3;i++){const p=spot(R*.3,R*.75,.8);if(p)eggs(p[0],p[1],5,.38,0xe8e0c0,false)}
    scat(12,R*.2,R*.9,.25,(x,z,a)=>put(Q.sph,S(0xe8dcc0,{emissive:0x302a10,emissiveIntensity:.4}),x,.1,z,.12,.1,.3,0,-a,0));
    for(let i=0;i<7;i++){const o=put(Q.sph,G(0x101008),rr(-1,1),rr(1.3,2.2),rr(-1,1),.04,.04,.04);anim(o,'orbit',.8,rr(2,3.5))}
    edge(4,(x,z)=>stump(x,z,ROT,rr(.8,1.4)))},
  '0_0_2':()=>{ // Spitter Mire: hummocks, sour puddles, spit-crusted stumps, an upturned wagon
    water(3.5,-2.5,2.6,2.2,0x4a6a2a,.8);water(-4,3,2.2,1.8,0x4a6a2a,.8);halo(3.5,-2.5,1.5,GOO,.18,.2);halo(-4,3,1.2,GOO,.18,.2);
    out(11,.82,(x,z)=>reeds(x,z,0x4a6a30,7));
    out(4,.55,(x,z)=>{stump(x,z,0x3a3424,rr(1.2,1.9));for(let i=0;i<3;i++){const o=put(Q.cone,G(0x8aff4a),x+rr(-.25,.25),rr(.6,1.4),z+rr(-.25,.25),.05,.25,.05,Math.PI,0,0);o.castShadow=false}});
    {const [x,z]=A(-R*.45,-R*.35),a=AN+.6,sg=sub(x,z,a,.2);TQ(sg,Q.box,S(0x4a3220),0,.55,0,2.6,.7,1.4,0,0,Math.PI*.9);[-1,1].forEach(s=>TQ(sg,Q.cyl,S(0x3a2818),.9*s,1.1,.75,.42,.1,.42,P2,0,0));blk(x,z,1);take(x,z,1.6);crate(x+1.2,z+1);barrel(x-1.3,z+.6)}
    edge(6,(x,z)=>halo(x,z,rr(.3,.6),GOO,.35,.08))},
  '0_1_0':()=>{ // Amalgam Seep: goo wells up from a rock and runs downhill in rills into a glowing pool
    const [sx,sz]=A(R*.62,0);rock(sx,sz,2.4,0x2a2e26);rock(sx+1,sz-1.4,1.4,0x2a2e26);halo(sx,sz,2.2,GOO,.25,.4);
    const [px,pz]=A(-R*.55,0);pool(px,pz,R*.26,R*.2,GOO,true);
    for(let i=-1;i<=1;i++){const [a0,b0]=A(R*.5,i*1.6),[a1,b1]=A(-R*.42,i*2.4);let x0=a0,z0=b0;const n=12;
      for(let q=1;q<=n;q++){const t=q/n,w=Math.sin(t*5+i*2)*.9,[ox,oz]=A(0,w),x1=a0+(a1-a0)*t+ox,z1=b0+(b1-b0)*t+oz,mx=(x0+x1)/2,mz=(z0+z1)/2,l=Math.hypot(x1-x0,z1-z0),y0=gy(x0,z0),y1=gy(x1,z1);
        const o=putY(Q.box,G(i?0x4aff2a:0x8aff4a),mx,(y0+y1)/2+.06,mz,l+.12,.03,.35,0,-Math.atan2(z1-z0,x1-x0),Math.atan2(y1-y0,l));o.castShadow=false;x0=x1;z0=z1}}
    out(7,.7,(x,z)=>{const n=3+Math.floor(rn()*3);take(x,z,1);for(let i=0;i<n;i++)put(Q.sph,S(0x5aaa3a,{emissive:0x2a8a1a,emissiveIntensity:.5,transparent:true,opacity:.85}),x+rr(-.5,.5),rr(.1,.5),z+rr(-.5,.5),rr(.35,.6),rr(.3,.5),rr(.35,.6));bones(x,z,2,.4,0xa8b090)});
    ribcage(...A(-R*.1,R*.45),AN+.4,.7,0xb8c0a0,5);edge(5,(x,z)=>deadTree(x,z,rr(2,3),0x3a4030,.8))},
  '0_1_1':()=>{ // Akidon Brood: a ringed hollow; larvae hang to pupate in glowing pods
    patch(0,0,.01,R*.75,0x2a2a1e);out(8,.48,(x,z)=>pod(x,z,rr(2.2,3),rr(.8,1.1),0xc8e070,true));
    out(4,.7,(x,z,a)=>{const sg=sub(x,z,a,0);TQ(sg,Q.hemi,S(0x6a5a3a),0,-.05,0,.7,.35,.5);TQ(sg,Q.box,S(0x4a3a24),0,.25,0,.12,.1,.5);take(x,z,.7)});
    {const p=spot(0,R*.3,1.2);if(p)eggs(p[0],p[1],7,.4,0xb0d080,true)}
    out(14,.86,(x,z)=>shroom(x,z,rr(.3,.6),pk([0x8aff6a,0x4ad8a0]),true));out(4,.95,(x,z)=>rock(x,z,rr(.7,1.1),0x3a3a30))},
  '0_1_2':()=>{ // Glowmire Warren: burrow mouths in a knoll, glowing fungus everywhere, spores drifting
    out(4,.6,(x,z)=>burrowMouth(x,z,dirAt(x,z)+Math.PI,rr(.9,1.2),0x3a3a2a));
    scat(10,1,R*.95,.6,(x,z)=>{const n=2+Math.floor(rn()*3),c=pk([0x5affb0,0x8aff5a,0x6ad8ff]);for(let i=0;i<n;i++)shroom(x+rr(-.4,.4),z+rr(-.4,.4),rr(.35,.9),c,true)});
    for(let i=0;i<2;i++){const a=AN+i*1.7,[x,z]=A(rr(-2,2),rr(-2,2)),sg=sub(x,z,a,-.4);TQ(sg,Q.arc,S(0x3a2a1a),0,0,0,2.4,2,2.4,0,0,0);take(x,z,1)}
    for(let i=0;i<8;i++)wisp(rr(-R*.7,R*.7),rr(1,2.6),rr(-R*.7,R*.7),pk([0x9affb8,0x6ad8ff]),.8)},
  '0_2_0':()=>{ // Lichen Grove: fallen giants furred with pale lichen, standing dead trunks, drifting spores
    for(let i=0;i<3;i++){const [x,z]=A(rr(-R*.5,R*.5),(i-1)*R*.38),a=AN+rr(-.5,.5),l=rr(5.5,8);log(x,z,a,l,rr(.55,.75),0x3a3226,.15);
      for(let q=0;q<5;q++){const t=rr(-l/2,l/2);put(Q.sph,S(PALE,{emissive:0x4a6a3a,emissiveIntensity:.35}),x+Math.cos(a)*t,1.1,z+Math.sin(a)*t,rr(.3,.5),.12,rr(.3,.5))}}
    out(6,.82,(x,z)=>{deadTree(x,z,rr(3,4.5),0x3a3428,1.1);put(Q.sph,S(PALE),x,rr(1,2),z,.32,.1,.32)});
    edge(6,(x,z)=>{rock(x,z,rr(.8,1.3),0x6a6a60);put(Q.hemi,S(PALE),x,.35,z,.6,.3,.6)});
    scat(8,0,R*.8,.4,(x,z)=>shroom(x,z,rr(.25,.45),0xd8e8a0,true));for(let i=0;i<10;i++)wisp(rr(-R*.8,R*.8),rr(.8,2.4),rr(-R*.8,R*.8),0xe0ffb0,.6)},
  '0_2_1':()=>{ // Akorror Hive: a humming resin spire on a mound of chewed wood
    const H=5.5,M=S(0x8a5a2a);blk(0,0,1.2);take(0,0,2);for(let i=0;i<6;i++){const t=i/6,r=1.5*(1-t*.75);put(Q.sph,M,rr(-.1,.1),H*t+.4,rr(-.1,.1),r,H/6*.8,r*rr(.9,1.1),0,rr(0,3),0)}
    for(let i=0;i<9;i++){const a=rn()*TAU,y=rr(.5,H*.85),r=1.5*(1-y/H*.75)*.95;const o=put(Q.sph,G(0xffb040),Math.cos(a)*r,y,Math.sin(a)*r,.14,.2,.14);o.castShadow=false}
    out(5,.55,(x,z)=>{blk(x,z,0);take(x,z,.6);put(Q.cyl,S(0xc88a2a,{emissive:0x6a3a08,emissiveIntensity:.4,transparent:true,opacity:.85}),x,1.1,z,.28,2.2,.28,rr(-.1,.1),0,rr(-.1,.1))});
    scat(14,R*.3,R*.95,.3,(x,z,a)=>put(Q.cone4,S(0x6a4a2a),x,.08,z,.08,rr(.5,1),.08,0,-a,P2));
    for(let i=0;i<2;i++){const p=spot(R*.35,R*.8,1);if(p)eggs(p[0],p[1],5,.35,AMBER,true)}
    for(let i=0;i<9;i++){const o=put(Q.sph,G(0xffd060),rr(-1,1),rr(1.5,4.5),rr(-1,1),.05,.05,.05);anim(o,'orbit',rr(1.6,2.6),rr(1.5,3))}},
  '0_2_2':()=>{ // Rotheart Hollow: a giant hollow stump with a glowing heart, rotting logs radiating out
    blk(0,0,1.4);take(0,0,2.2);for(let i=0;i<7;i++){const a=i/7*TAU;put(Q.box,S(0x2e261c),Math.cos(a)*1.25,1.3,Math.sin(a)*1.25,.55,2.8+rr(-.6,.6),.8,rr(-.12,.12),-a,rr(-.12,.12))}
    {const o=put(Q.ico,G(0xff3a2a),0,1.1,0,.45,.55,.45);anim(o,'pulse',.15,1.3);halo(0,0,2.2,0xff4a2a,.25,.1)}
    out(5,.55,(x,z,a)=>{log(x,z,a,rr(2.5,3.5),rr(.3,.4),0x2e261c,.1);put(Q.sph,S(0x6a7a3a),x,.45,z,.3,.1,.5)});
    out(8,.85,(x,z)=>shroom(x,z,rr(.35,.6),0xc03a2a,false));for(let i=0;i<5;i++){const a=rn()*TAU,sg=sub(Math.cos(a)*1.6,Math.sin(a)*1.6,a,-.35);TQ(sg,Q.arc,S(0x2e261c),.4,0,0,.9,.7,.6,0,P2,0)}},
  // ======================= Hillside Crest =======================
  '1_0_0':()=>{ // Serpent Warcamp: an earthwork ring, hide tents round a war fire, racks, drums, banners
    patch(0,0,.01,R*.8,0x5a4c36);cauldron(0,0,0xff6a1a,1.2,0x6a8a3a,false);
    out(5,.52,(x,z,a)=>tent(x,z,a+Math.PI,pk([HIDE,0x3a5a3a,0x5a6a3a]),1.25));
    out(4,.78,(x,z,a)=>banner(x,z,TEAL,3.2,a+P2,BRZ));
    for(let i=0;i<2;i++){const p=spot(R*.3,R*.7,1.2);if(p)rack(p[0],p[1],p[2]+P2)}
    for(let i=0;i<2;i++){const p=spot(R*.25,R*.6,.7);if(p)drum(p[0],p[1],0x5a3a24,1.1)}
    for(let i=0;i<3;i++){const a=AN+i*TAU/3+.5;const [x,z]=[Math.cos(a)*R*.92,Math.sin(a)*R*.92];palis(x,z,a+P2,R*.7,1.6,0x4a3a24)}
    scat(5,R*.35,R*.75,.6,(x,z,a,i)=>i%2?crate(x,z):barrel(x,z))},
  '1_0_1':()=>{ // Serpent Shrine: three terraces climb to a coiled idol; braziers on every step
    serpent(0,0,AN,1.25,0x6a7a5a,0xffd040);
    out(4,.45,(x,z)=>brazier(x,z,0xffa040,1));out(6,.8,(x,z)=>{candles(x,z,3,.3,0xffd060);urn(x+.5,z+.4,0x8a6a3a,.8)});
    out(4,.94,(x,z,a)=>{pillar(x,z,2.6,0x6a6a58,.34);put(Q.tor,S(0x5a7a5a),x,1.3,z,.42,.42,.6,P2,0,0);put(Q.tor,S(0x5a7a5a),x,1.9,z,.4,.4,.6,P2,0,0)});
    patch(0,0,.01,R*.32,0x6a6450);patch(0,0,R*.62,R*.66,0x5a5440,.5)},
  '1_0_2':()=>{ // Archer Outpost: a watchtower on the bluff, targets below, arrows and a stake line along the edge
    const [tx,tz]=A(R*.5,0);blk(tx,tz,.9);take(tx,tz,1.4);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>put(Q.cyl,S(0x4a3220),tx+a*.6,1.8,tz+b*.6,.08,3.6,.08));
    put(Q.box,S(0x6a4a2c),tx,3.5,tz,1.6,.12,1.6);[[0,-.76,0],[0,.76,0],[-.76,0,1],[.76,0,1]].forEach(([a,b,r])=>put(Q.box,S(0x5a3e24),tx+a,3.82,tz+b,r?.08:1.6,.55,r?1.6:.08));
    put(CG.tent,S(0x3a5a3a),tx,4.6,tz,1.3,.9,1.3,0,Math.PI/4,0);ladder(tx-.9,tz,0,3.4);
    for(let i=-1;i<=1;i+=2){const [x,z]=A(-R*.55,i*2.2),sg=sub(x,z,AN,0);TQ(sg,Q.box,S(0x4a3220),0,.6,0,.08,1.2,.08);TQ(sg,Q.cyl,S(0xd8c8a0),0,1.25,0,.55,.1,.55,0,0,P2);TQ(sg,Q.cyl,S(0xa02a1a),.03,1.25,0,.36,.1,.36,0,0,P2);TQ(sg,Q.cyl,S(0xd8c8a0),.06,1.25,0,.16,.1,.16,0,0,P2);blk(x,z,0);take(x,z,.7)}
    {const [x,z]=A(0,-R*.15);palis(x,z,AN+P2,R*.9,1.3,0x5a4028)}
    scat(4,R*.2,R*.8,.5,(x,z)=>{for(let i=0;i<5;i++)put(Q.cyl4,S(0x8a6a40),x+rr(-.1,.1),.45,z+rr(-.1,.1),.015,.9,.015,rr(-.2,.2),0,rr(-.2,.2))});crate(...A(R*.3,1.4));barrel(...A(R*.32,-1.3))},
  '1_1_0':()=>{ // Croaker Shallows: a warm shallow pond thick with lily pads, stepping stones, reeds, frog spawn
    const p=water(0,0,R*.6,R*.52,WATER,.82),Y=p.userData.Y;
    for(let i=0;i<22;i++){const a=rn()*TAU,d=rr(0,R*.5);lily(Math.cos(a)*d,Y+.02,Math.sin(a)*d*.85)}
    for(let i=0;i<6;i++){const t=(i/5-.5)*R*1.1,[x,z]=A(t,Math.sin(i)*1.2);putY(Q.dod,S(0x6a7a6a),x,Y-.05,z,.55,.25,.5,0,rr(0,3),0)}
    out(14,.72,(x,z)=>reeds(x,z,0x5a8a3a,6));for(let i=0;i<4;i++){const a=rn()*TAU,d=rr(1,R*.4);for(let q=0;q<9;q++)putY(Q.sph,S(0xd8f0c8,{emissive:0x3a6a3a,emissiveIntensity:.5}),Math.cos(a)*d+rr(-.3,.3),Y+.03,Math.sin(a)*d+rr(-.3,.3),.06,.04,.06)}
    edge(3,(x,z,a)=>log(x,z,a+P2,rr(2.5,3.5),.32,0x4a4030,.15))},
  '1_1_1':()=>{ // Reaver Wallow: churned mud, half-sunk logs, gnawed bones, mud banks
    pool(0,0,R*.4,R*.34,0x3a2a1a,false);patch(0,0,R*.3,R*.62,0x4a3a26);
    for(let i=0;i<3;i++){const [x,z]=A(rr(-2.5,2.5),(i-1)*2.2);log(x,z,AN+rr(-.6,.6),rr(3,4.5),.4,0x3a3022,.35)}
    out(6,.6,(x,z)=>bones(x,z,4,.6));out(3,.82,(x,z)=>{mound(x,z,rr(1.4,2),0x4a3a26,.4);take(x,z,1.5)});out(8,.9,(x,z)=>reeds(x,z,0x4a6a30,6));
    for(let i=0;i<3;i++){const [x,z]=A(rr(-R*.3,R*.3),rr(-R*.6,-R*.4)),o=put(Q.box,S(0x2a1e14),x,.03,z,3,.02,.4,0,-(AN+rr(-.3,.3)),0);o.castShadow=false}},
  '1_1_2':()=>{ // Drowned Serpent Shrine: a shrine the lake swallowed — tilted columns, a fallen serpent head, a broken arch
    const p=water(0,0,R*.48,R*.44,0x2a4a4a,.85),Y=p.userData.Y;
    out(5,.42,(x,z)=>{blk(x,z,0);take(x,z,.6);putY(Q.cyl,S(0x6a7a6a),x,Y+1,z,.32,2.6+rr(-.6,.6),.32,rr(-.3,.3),0,rr(-.3,.3))});
    {const [x,z]=A(R*.48,1),sg=sub(x,z,AN+2.4,-.5);TQ(sg,Q.sph,S(0x6a7a5a),0,.6,0,.9,.65,.75,0,0,.35);TQ(sg,Q.box,S(0x6a7a5a),-.4,.8,0,.3,1.2,2,0,0,.4);[-1,1].forEach(s=>TQ(sg,Q.sph,G(0x80ffd0),.72,.8,.28*s,.08,.08,.08));blk(x,z,1);take(x,z,1.5)}
    {const [x,z]=A(-R*.62,0);arch(x,z,AN,2.4,2.8,0x6a7a6a);rubble(x+1.2,z+1,5,.6,0x6a7a6a)}
    for(let i=0;i<8;i++){const a=rn()*TAU,d=rr(0,R*.4);lily(Math.cos(a)*d,Y+.02,Math.sin(a)*d,0x3a6a4a)}out(10,.75,(x,z)=>reeds(x,z,0x4a7a4a,5))},
  '1_2_0':()=>{ // Basilisk Roost: petrified victims stare from the crag; a stony nest on top
    nest(-2.5,-2.5,1.1,0x7a7468,0,0x8a9a7a);
    out(6,.62,(x,z,a)=>figure(x,z,a+Math.PI+rr(-.6,.6),rr(.95,1.15),0x8a8a86,pk(['cower','raise','stand','kneel'])));
    scat(12,1,R*.9,.3,(x,z)=>{const o=put(Q.cyl,S(0x4a6a3a,{metalness:.3,roughness:.4}),x,.04,z,.18,.03,.14,0,rr(0,3),0);o.castShadow=false});
    out(5,.9,(x,z)=>rock(x,z,rr(.9,1.5),0x7a7468))},
  '1_2_1':()=>{ // Shellback Rocks: broad shells and tide pools on a windy shelf
    water(3.5,2.5,2.2,1.8,WATER,.8);water(-3.5,-3,1.8,1.6,WATER,.8);
    shell(...A(R*.55,-R*.25),2.2,0x5a5a3a,AN+.5,0x3a3a26);
    out(9,.76,(x,z)=>{rock(x,z,rr(.9,1.5),0x7a7a6a,.55);for(let i=0;i<4;i++)put(Q.hemi,S(0xd8d4c4),x+rr(-.5,.5),.35,z+rr(-.5,.5),.12,.1,.12)});
    scat(6,1,R*.8,.4,(x,z)=>reeds(x,z,0x2a4a3a,4))},
  '1_2_2':()=>{ // Cliffside Lair: a cave mouth in the cliff face, fallen boulders below, a kill at the entrance
    const [cx,cz]=A(R*.16,0),a=AN+Math.PI,sg=sub(cx,cz,a,0);TQ(sg,Q.arc,S(0x5a5a52),.2,0,0,1.9,2.2,2.6,0,P2,0);const d=TQ(sg,Q.disc,G(0x050404),.6,.6,0,1.7,1.9,1,0,-P2,0);d.castShadow=false;blk(cx,cz,1.4);take(cx,cz,2.6);
    [-1,1].forEach(s=>{const [x,z]=A(R*.2,s*2.6);rock(x,z,rr(1.6,2.2),0x6a6a60)});
    const [kx,kz]=A(-R*.1,1.2);carcass(kx,kz,AN+1,1.1,0x6a5a48);bones(kx-1,kz+.6,4,.6);
    scat(6,R*.2,R*.8,1,(x,z)=>{const [u]=[x*Math.cos(AN)+z*Math.sin(AN)];if(u<0)rock(x,z,rr(.8,1.6),0x6a6a60)});
    scat(10,R*.3,R*.95,.4,(x,z,a)=>{const [u]=[x*Math.cos(AN)+z*Math.sin(AN)];if(u>2)for(let i=0;i<5;i++)put(Q.cyl4,S(0x8a8a4a),x+rr(-.2,.2),.3,z+rr(-.2,.2),.02,.6,.02,.4,0,.4)})},
  // ======================= Burningeye Summit =======================
  '2_0_0':()=>{ // Troll Den: a lean-to of slabs against the crag, a bone pile, a roasting spit, a stone seat
    leanTo(0,-4,0,1.5,GRAN);bonePile(-3.2,-2.4,1.3,0xd0c8b0);
    fire(0,1.2,0xff7a2a,1.2);[-1,1].forEach(s=>{put(Q.cyl4,S(0x3a2818),s*1.3,.6,1.2,.06,1.3,.06,0,0,s*.2)});put(Q.cyl,S(0x3a2818),0,1.2,1.2,.04,2.8,.04,0,0,P2);put(Q.sph,S(0x7a4a3a),0,1.15,1.2,.8,.35,.32);
    slab(2.6,.8,1.4,.9,1.2,.3,GRAN);slab(2.4,1.5,1.2,1.8,.35,.3,GRAN);
    [-1,1].forEach(s=>{const sg=sub(s*2.2,-1.4,s>0?0:Math.PI,-.2);TQ(sg,Q.arc,S(0xe8e0c8),0,0,0,1.6,2,1.2,P2*0,0,0)});
    out(6,.82,(x,z)=>rock(x,z,rr(1,1.8),0x5a5e6a));edge(4,(x,z)=>bones(x,z,4,.6))},
  '2_0_1':()=>{ // Yeti Cave: a snowbound cave mouth hung with icicles, drifts, a frozen kill
    const sg=sub(0,-3.4,P2,0);TQ(sg,Q.hemi,S(0x6a6e78),0,-.3,0,2.6,2.4,2.8);TQ(sg,Q.hemi,S(SNOW),0,1.4,0,2.2,.9,2.4);const d=TQ(sg,Q.disc,G(0x040406),2.55,.6,0,1.25,1.4,1,0,P2,0);d.castShadow=false;blk(0,-3.4,2);take(0,-3.4,2.8);
    icicles(-1.1,gy(0,-1)+2.1,-1,7,.9,2.2,0);
    out(7,.7,(x,z)=>mound(x,z,rr(.9,1.5),SNOW,.4));carcass(...A(-R*.3,R*.25),AN,1,0x8a9aa8,0xe8f0f8);
    edge(5,(x,z)=>ice(x,z,rr(.6,1.1)));scat(3,R*.3,R*.7,.6,(x,z)=>bones(x,z,3,.5,0xe8ecf0))},
  '2_0_2':()=>{ // Rimecaller Circle: ice monoliths round a ring of frozen runes, braziers of blue fire
    patch(0,0,.01,R*.62,0xd8e8f4);runes(0,0,R*.36,BLUEF,7);
    out(7,.72,(x,z)=>{ice(x,z,rr(2.4,3.2),ICE,0x4ab0f0)});out(3,.36,(x,z)=>brazier(x,z,BLUEF,1.1,0xd8f4ff));
    {const o=put(Q.oct,G(0xbff0ff),0,2.4,0,.35,.6,.35);anim(o,'spin',.8,1);halo(0,0,1.4,BLUEF,.25,.07)}
    edge(8,(x,z)=>crystal(x,z,rr(.3,.6),ICE,.4))},
  '2_1_0':()=>{ // Rimeshell Nest: crystal shells crowd a frozen hollow; frosted egg clutches and frozen webs
    patch(0,0,.01,R*.6,0xb8d0e0);out(6,.5,(x,z,a)=>{shell(x,z,rr(.8,1.2),0x8ab8d8,a,0xd8f0ff);crystals(x+rr(-.6,.6),z+rr(-.6,.6),3,.8,ICE,.5)});
    for(let i=0;i<3;i++){const p=spot(0,R*.35,1);if(p)eggs(p[0],p[1],6,.4,0xa0d8ff,true)}
    for(let i=0;i<2;i++){const p=spot(R*.6,R*.85,1);if(p)web(p[0],p[1],p[2],1.1,0xcfeaff)}edge(7,(x,z)=>ice(x,z,rr(.8,1.4)))},
  '2_1_1':()=>{ // Wendigo Larder: meat on racks, antler totems, bloody snow round a cold fire pit
    patch(0,0,.01,R*.85,0xe0e4ea);ring(7,.6,(x,z)=>put(Q.sph,S(0x55514a),x,.08,z,.16,.12,.16));put(Q.cyl,S(0x2a2018),0,.1,0,.06,.8,.06,0,.4,P2);
    out(3,.52,(x,z,a)=>meatRack(x,z,a+P2,0x7a2a24));out(3,.82,(x,z)=>antlers(x,z,rr(2.4,3)));
    scat(5,1,R*.85,.5,(x,z)=>patch(x,z,.01,rr(.5,1),0x8a1018,.55,.06));scat(4,1,R*.8,.5,(x,z)=>bones(x,z,3,.5))},
  '2_1_2':()=>{ // Frozen Hollow: a frozen lake with shapes trapped beneath, ice spikes round the rim
    const p=pool(0,0,R*.5,R*.46,0xc8e4f4,false,.9),Y=p.userData.Y;cracks(0,0,R*.42,0x6a90b0,14);
    // shapes trapped beneath the ice, and one caught half out of it
    for(let i=0;i<4;i++){const a=rn()*TAU,d=rr(1,R*.38),x=Math.cos(a)*d,z=Math.sin(a)*d,sg=sub(x,z,rn()*6,Y-.5-gy(x,z)),M=S(0x2a3a5a);sg.rotation.z=rr(-.8,.8);
      TQ(sg,Q.box,M,0,.3,0,.26,.66,.5);TQ(sg,Q.sph,M,0,.8,0,.16,.19,.16);[-1,1].forEach(s=>TQ(sg,Q.box,M,0,.55,.36*s,.12,.55,.12,0,0,s*1.2))}
    {const [x,z]=A(-R*.2,R*.15);figure(x,z,AN+1,1.1,0x8aa8c8,'raise',false,Y-gy(x,z)-.35);put(Q.ico,S(0xd8f0ff,{transparent:true,opacity:.45,roughness:.1}),x,.6,z,.75,.9,.7)}
    out(11,.8,(x,z)=>ice(x,z,rr(1,2),ICE,0x4a90c0));out(5,.92,(x,z)=>mound(x,z,rr(1,1.6),SNOW,.4))},
  '2_2_0':()=>{ // Jotun Hold: a giant's throne on the top tier, broken walls round the outer one, a fallen axe, a huge cauldron
    throne(...A(R*.2,0),AN+Math.PI,1.6,0x6a6e78);
    for(let i=0;i<5;i++){const a=AN+(i+.5)/5*TAU+rr(-.15,.15);if(Math.abs(Math.sin((a-AN)/2))<.25)continue;wall(Math.cos(a)*R*.8,Math.sin(a)*R*.8,a+P2,R*.6,rr(2.4,4),GRAN,true,.9)}
    {const [x,z]=A(-R*.42,R*.28);const sg=sub(x,z,AN+1.2,0);TQ(sg,Q.cyl,S(0x4a3220),0,.25,0,.2,6,.2,0,0,P2);TQ(sg,Q.box,S(0x7a7a82,{metalness:.7,roughness:.4}),2.8,.25,.7,1.2,.16,1.6,0,.2,0);blk(x,z,.6);take(x,z,3)}
    {const [x,z]=A(-R*.3,-R*.35);cauldron(x,z,0xff7a2a,1.9,0x8a3a1a,false)}
    {const [x,z]=A(R*.05,R*.4);banner(x,z,0x3a4a6a,4.2,AN,0xa0a0b0);const [x2,z2]=A(R*.05,-R*.4);banner(x2,z2,0x3a4a6a,4.2,AN,0xa0a0b0)}
    out(6,.62,(x,z)=>rock(x,z,rr(1,1.6),GRAN));{const [x,z]=A(-R*.15,0);femur(x,z,AN+.8,3.6,0xe0d8c0)}},
  '2_2_1':()=>{ // Harpy Eyrie: nests of bone and twig crown wind-cut pillars, feathers everywhere
    nest(1.5,-1.5,1.1,0x6a5a3a,.2);nest(-3.5,2.5,.9,0x6a5a3a,.2);
    out(3,.72,(x,z)=>{const h=rr(2.4,3.4);blk(x,z,.6);take(x,z,1);put(Q.hex,S(0x6a6e78),x,h/2,z,.65,h,.65,0,rr(0,1),0);nest(x,z,.7,0x5a4a2a,h)});
    scat(16,0,R*.95,.2,(x,z,a)=>{const o=put(Q.pln,S(pk([0x5a6a8a,0x8a9ab0,0x3a3a4a]),{side:THREE.DoubleSide}),x,.05,z,.12,.5,1,-P2,0,a);o.castShadow=false});
    scat(4,R*.3,R*.85,.5,(x,z)=>bones(x,z,3,.5));out(4,.95,(x,z)=>rock(x,z,rr(.8,1.3),GRAN))},
  '2_2_2':()=>{ // Stormcaller Ring: scorched standing stones on the rim; a metal rod in the middle drinks the lightning
    patch(0,0,.01,R*.55,0x2a2a30);cracks(0,0,R*.45,BLUEF,16);
    out(8,.86,(x,z,a)=>{slab(x,z,.9,rr(2.6,3.6),.6,a,0x3a3a40,rr(-.08,.08));const o=put(Q.box,G(BLUEF),x+Math.cos(a)*.05,1.6,z+Math.sin(a)*.05,.92,.4,.05,0,-a+P2,0);o.castShadow=false});
    blk(0,0,.6);take(0,0,1);put(Q.cyl,S(0x2a2a32,{metalness:.8,roughness:.3}),0,3.2,0,.14,6.4,.14);put(Q.cyl,S(0x2a2a32,{metalness:.8,roughness:.3}),0,.3,0,.7,.6,.7);
    for(let i=0;i<4;i++){const a=i/4*TAU;put(Q.cone,S(0x3a3a42,{metalness:.8}),Math.cos(a)*.25,6.5,Math.sin(a)*.25,.06,.8,.06,Math.sin(a)*.4,0,-Math.cos(a)*.4)}
    for(let i=0;i<3;i++){const o=put(Q.tor,G(BLUEF),0,2+i*1.4,0,.5-i*.08,.5-i*.08,.5,P2,0,0);anim(o,'spin',1,1.5+i*.6)}
    for(let i=0;i<6;i++)wisp(rr(-1.5,1.5),rr(1,5),rr(-1.5,1.5),0xbfe8ff,.6)},
  // ======================= Searing Sands =======================
  '3_0_0':()=>{ // Scorpion Nest: a sand pit riddled with burrows and shed husks
    patch(0,0,.01,R*.5,0xb89058);out(6,.42,(x,z)=>hole(x,z,rr(.45,.7),0xa08050));
    out(5,.76,(x,z)=>{mound(x,z,rr(1.2,1.8),0xc8a46a,.4);take(x,z,1.3)});scat(5,1,R*.85,.9,(x,z,a)=>husk(x,z,a,rr(.9,1.3)));
    edge(4,(x,z)=>rock(x,z,rr(.7,1.2),0xd8c8a0));scat(3,1,R*.8,.5,(x,z)=>bones(x,z,3,.5,BLEACH))},
  '3_0_1':()=>{ // Elemental Ruins: toppled sandstone round a floating core of living flame
    {const o=put(Q.oct,G(0xff8a2a),0,2.6,0,.6,.95,.6);anim(o,'spin',.6,1);const o2=put(Q.oct,T(0xffc060,.35),0,2.6,0,1,1.4,1);anim(o2,'pulse',.12,1.6);halo(0,0,2.6,0xff8a2a,.28,.08);
      for(let i=0;i<6;i++){const r=put(Q.dod,S(0x8a5a2a),Math.cos(i)*1.8,2.6+rr(-.6,.6),Math.sin(i)*1.8,.25,.22,.25);anim(r,'orbit',rr(1.6,2.2),rr(.5,.9))}cracks(0,0,2.4,0xff9a3a,10)}
    out(6,.5,(x,z)=>pillar(x,z,rr(1.4,3.6),SANDS,.38,rn()<.6));
    for(let i=0;i<2;i++){const p=spot(R*.65,R*.85,2.2);if(p)fallen(p[0],p[1],p[2]+P2+rr(-.4,.4),rr(3,4.5),.38,SANDS)}
    {const [x,z]=A(-R*.78,0);arch(x,z,AN,2.6,3.2,0xb8945a,.6);rubble(x,z+1.4,6,.8,SANDS)}edge(4,(x,z)=>rubble(x,z,5,.7,SANDS))},
  '3_0_2':()=>{ // Sun-bleached Bones: the ribcage and horned skull of something vast, picked clean
    ribcage(...A(-R*.08,0),AN,1.6,BLEACH,9);bigSkull(...A(R*.58,0),AN,1.4,BLEACH,true);
    scat(6,R*.3,R*.9,.6,(x,z)=>bones(x,z,4,.7,BLEACH));{const [x,z]=A(-R*.6,R*.4);const sg=sub(x,z,AN,0);TQ(sg,Q.cyl,S(0x4a3220),0,1.4,0,.05,2.8,.05,0,0,.25);TQ(sg,Q.pln,S(0x8a3a2a,{side:THREE.DoubleSide}),.55,2.2,0,.7,.9,1,0,0,.25);take(x,z,.5)}
    edge(5,(x,z)=>{for(let i=0;i<4;i++)put(Q.cyl4,S(0x6a5030),x+rr(-.3,.3),.25,z+rr(-.3,.3),.02,.6,.02,rr(-.6,.6),0,rr(-.6,.6))})},
  '3_1_0':()=>{ // Temple Sanctum: a gate of pylons on the outer step, scarab statues on the stair, an altar on top
    {const [x1,z1]=A(-R*.84,2.4),[x2,z2]=A(-R*.84,-2.4);pylon(x1,z1,AN,4.2,0xb8844a,GOLD);pylon(x2,z2,AN,4.2,0xb8844a,GOLD);const [lx,lz]=A(-R*.84,0);put(Q.box,S(0xb8844a),lx,4.3,lz,1.7,.6,6.2,0,-AN,0)}
    [-1,1].forEach(s=>{const [x,z]=A(-R*.45,s*2.4);scarab(x,z,AN+Math.PI,1.3,0x2a4a6a,0x60c0ff)});
    {const sg=sub(0,0,AN,0);TQ(sg,Q.box,S(0xb8944a),0,.5,0,1.8,1,1.1);TQ(sg,Q.box,S(GOLD,{metalness:.6,roughness:.4}),0,1.02,0,1.9,.06,1.2);const d=TQ(sg,Q.disc,G(0xffb040),0,1.07,0,.4,.4,1,-P2);d.castShadow=false;blk(0,0,.8);take(0,0,1.2)}
    out(4,.2,(x,z)=>brazier(x,z,0xffa040,1.2));out(6,.66,(x,z)=>urn(x,z,0xa0603a,.9))},
  '3_1_1':()=>{ // Scarab Hatchery: dung balls and glowing amber eggs in the warm sand
    out(6,.52,(x,z)=>{const k=rr(.6,1.1);blk(x,z,k>.9?.5:0);take(x,z,k);put(Q.ico,S(0x5a3a1e),x,k*.9,z,k,k,k,rr(0,3),rr(0,3),0)});
    for(let i=0;i<3;i++){const p=spot(0,R*.38,1);if(p)eggs(p[0],p[1],6,.35,AMBER,true)}
    scat(4,R*.5,R*.9,.7,(x,z)=>hole(x,z,rr(.35,.5),0xa08050));scat(6,1,R*.9,.4,(x,z,a)=>scarab(x,z,a,.35,0x2a6a5a))},
  '3_1_2':()=>{ // Priests' Necropolis: rows of sarcophagi under watching obelisks, jars and wrapped dead
    for(let r2=-1;r2<=1;r2+=2)for(let c=-1;c<=1;c++){const [x,z]=A(c*3.2,r2*2.8);sarc(x,z,AN+P2,0xc8a46a,GOLD)}
    out(4,.74,(x,z)=>obelisk(x,z,4.2,0xc8a868,0xffd06a,dirAt(x,z)));out(2,.45,(x,z)=>brazier(x,z,0xffa040,1.1));
    scat(5,R*.35,R*.9,.5,(x,z)=>urn(x,z,pk([0x9a6a3a,0x6a8a8a,0xb08a5a]),rr(.7,.95)));
    scat(3,R*.4,R*.85,.8,(x,z,a)=>{put(Q.cyl,S(0xd8ccaa),x,.22,z,.22,1.6,.22,0,-a,P2);put(Q.sph,S(0xd8ccaa),x+Math.cos(a)*.85,.22,z+Math.sin(a)*.85,.2,.2,.2)})},
  '3_2_0':()=>{ // Salt Pillars: white six-sided pillars rising from a cracked pan
    patch(0,0,.01,R*.92,SALT);cracks(0,0,R*.85,0x8a8270,26);
    out(8,.62,(x,z)=>{const h=rr(2.2,4.6);blk(x,z,.5);take(x,z,.9);put(Q.hex,S(SALT,{roughness:.4,emissive:0x302e2a,emissiveIntensity:.3}),x,h/2,z,rr(.45,.7),h,rr(.45,.7),rr(-.06,.06),rr(0,1),rr(-.06,.06));
      if(rn()<.6)put(Q.hex,S(SALT),x+rr(-.7,.7),.6,z+rr(-.7,.7),.3,1.2,.3,0,rr(0,1),rr(-.3,.3))});
    scat(4,1,R*.4,.8,(x,z)=>{const h=rr(1,2);put(Q.hex,S(SALT),x,h/2,z,.3,h,.3,0,rr(0,1),0);blk(x,z,0)});{const p=spot(R*.3,R*.7,.7);if(p){bones(p[0],p[1],5,.6,0xf8f4ec)}}},
  '3_2_1':()=>{ // Wyrm Hollow: a churned sinkhole round a tunnel, shed skin rings half buried
    hole(0,0,2.6,0xa08050);for(let i=0;i<16;i++){const t=i/16,a=t*TAU*1.6+AN,d=3+t*R*.5;mound(Math.cos(a)*d,Math.sin(a)*d,rr(.4,.7),0xc0985a,.5)}
    for(let i=0;i<6;i++){const t=i/5,a=AN+P2+t*1.6,d=R*.62,o=put(Q.tor,S(0xc8b080,{transparent:true,opacity:.85}),Math.cos(a)*d,0,Math.sin(a)*d,.9,.9,1.2,0,-a,0);o.castShadow=true}
    scat(4,R*.5,R*.9,.6,(x,z)=>bones(x,z,4,.6,BLEACH));edge(4,(x,z)=>rock(x,z,rr(.8,1.3),SALT))},
  '3_2_2':()=>{ // Bleached Oasis: dead palms round a pool that dried to salt, a ruined well, broken pots
    patch(0,0,.01,R*.42,0x8a6a4a);cracks(0,0,R*.38,0x3a2a1a,18);patch(0,0,R*.36,R*.48,SALT,.6);
    out(6,.56,(x,z)=>palm(x,z,rr(3.2,4.5),true));{const [x,z]=A(R*.72,0);well(x,z,1,0xb89a6a,true)}
    scat(5,R*.45,R*.9,.5,(x,z)=>urn(x,z,0xb08060,.8));edge(5,(x,z)=>rock(x,z,rr(.7,1.2),SALT))},
  // ======================= The Dirge =======================
  '4_0_0':()=>{ // Open Crypt: a stone doorway with a stair down into the earth, coffins dragged out
    {const sg=sub(0,4.3,-P2,0);[-1,1].forEach(s=>TQ(sg,Q.box,S(GST),0,1.4,1.2*s,.6,2.8,.6));TQ(sg,Q.box,S(GST),0,2.95,0,.8,.5,3.2);TQ(sg,Q.cone4,S(DST),0,3.6,0,.9,.8,1.6,0,Math.PI/4,0);
      const d=TQ(sg,Q.disc,G(0x040404),-.2,1.2,0,.9,1.2,1,0,-P2,0);d.castShadow=false;blk(-1.2,4.3,0);blk(1.2,4.3,0);take(0,4.3,1.6)}
    for(let i=0;i<5;i++){const z=3.2-i*.85;put(Q.box,S(DST),0,-.12-i*.04,z,2,.25,.8)}
    out(4,.5,(x,z,a)=>coffin(x,z,a+rr(-.5,.5),0x3a2a20,true));out(9,.78,(x,z,a)=>grave(x,z,a+Math.PI,0x8a8a86));
    [-1,1].forEach(s=>candles(s*1.4,3.2,4,.3,0x9ad8ff));edge(2,(x,z)=>deadTree(x,z,rr(2.8,3.6),0x2a2a30))},
  '4_0_1':()=>{ // Ghoul Feasting Pit: bone heaps and half-eaten kills at the bottom, meat hooks round the rim
    patch(0,0,.01,R*.45,0x3a2a26);bonePile(-1.5,-1,1.2);bonePile(2,1.5,.9);carcass(1.2,-2.4,AN,1,0x5a3a30);block(-2.2,2,AN);
    out(5,.86,(x,z)=>{blk(x,z,0);take(x,z,.5);pole(x,z,2.4,0x2a2018,.06);put(Q.box,S(0x2a2018),x+.3,2.3,z,.6,.05,.05);put(Q.tor,S(0x3a3a3e,{metalness:.7}),x+.55,1.95,z,.12,.2,.12,0,0,0);if(rn()<.6)put(Q.sph,S(0x6a2a24),x+.55,1.5,z,.2,.4,.18)});
    scat(5,1,R*.6,.6,(x,z)=>patch(x,z,.01,rr(.4,.8),0x4a0a10,.6,.05));scat(4,R*.4,R*.8,.5,(x,z)=>skull(x,-.02,z,1))},
  '4_0_2':()=>{ // Ossuary: walls of stacked skulls round a yard, a bone arch, skull pyramids
    // a skull wall: a bone-coloured core faced on both sides with rows of skulls (cheap ones: a head and an eye band)
    const sw=(x,z,a,len,h)=>{wall(x,z,a,len,h,0xc8c0a8,false,.7);const nx=Math.cos(a),nz=Math.sin(a),vx=-nz,vz=nx,SK=S(0xe0d8c0),EY=G(0x0a0808);
      for(let q=-len/2+.3;q<len/2;q+=.5)for(let y=.3;y<h;y+=.5)[-1,1].forEach(s=>{const px=x+nx*q+vx*.36*s,pz=z+nz*q+vz*.36*s,Y=gy(px,pz)+y;putY(Q.ico,SK,px,Y,pz,.2,.18,.2,0,rr(0,3),0);
        const e=putY(Q.box,EY,px+vx*.17*s,Y+.02,pz+vz*.17*s,.24,.06,.05,0,-a,0);e.castShadow=false})};
    [0,1,2].forEach(i=>{const a=AN+P2+i*P2,x=Math.cos(a)*R*.55,z=Math.sin(a)*R*.55;sw(x,z,a+P2,R*.7,1.4)});
    {const [x,z]=A(-R*.55,0),sg=sub(x,z,AN,0);TQ(sg,Q.arc,S(0xe0d8c0),0,0,0,1.6,2.2,1.6,0,P2,0);take(x,z,1)}
    out(2,.25,(x,z)=>{for(let l=0;l<4;l++){const n=4-l;for(let i=0;i<n;i++)for(let j=0;j<n;j++)skull(x+(i-(n-1)/2)*.36,l*.3,z+(j-(n-1)/2)*.36,1,0xe0d8c0)}blk(x,z,.6);take(x,z,1)});
    candles(0,0,7,1.6,0x9ad8ff);edge(4,(x,z)=>skullPole(x,z,rr(1.6,2.2)))},
  '4_1_0':()=>{ // Sunken Ossuary: half-drowned tombs leaning in black water, spectral lamps
    const p=water(0,0,R*.5,R*.45,DWAT,.92),Y=p.userData.Y;
    for(let i=0;i<3;i++){const a=AN+i*2.1,d=R*.32,x=Math.cos(a)*d,z=Math.sin(a)*d;blk(x,z,.6);take(x,z,1.2);putY(Q.box,S(DST),x,Y+.7,z,2.2,2,.6,rr(-.3,.3),-a,rr(-.25,.25))}
    for(let i=0;i<3;i++){const p2=spot(1,R*.4,1);if(p2){const sg=sub(p2[0],p2[1],p2[2],0);sg.position.y=Y;sg.rotation.z=rr(-.3,.3);TQ(sg,Q.box,S(0x2a2420),0,.05,0,1.8,.4,.6)}}
    out(5,.76,(x,z)=>pillar(x,z,rr(1.4,2.8),0x6a7064,.32,rn()<.6));out(3,.62,(x,z)=>torch(x,z,SPEC,2,0xe8fff8));out(8,.88,(x,z)=>reeds(x,z,0x3a4a3a,5))},
  '4_1_1':()=>{ // Wailing Pool: a glowing pool where the drowned weep; a hooded statue kneels at its edge
    pool(0,0,R*.42,R*.38,0x6ae8d8,true);{const [x,z]=A(R*.5,0);figure(x,z,AN+Math.PI,1.3,0x8a9a98,'kneel',true);put(Q.box,S(0x6a7068),x,.1,z,1.2,.3,1.2)}
    for(let i=0;i<6;i++){const a=rn()*TAU,d=rr(0,R*.5);wisp(Math.cos(a)*d,rr(.6,2),Math.sin(a)*d,SPEC,1)}
    out(10,.62,(x,z)=>candle(x,z,0x9affe8,rr(.2,.45)));out(8,.82,(x,z)=>reeds(x,z,0x4a5a4a,5))},
  '4_1_2':()=>{ // Flooded Vault: broken vault walls hold back the water, an iron gate, chained remains
    water(0,0,R*.56,R*.52,DWAT,.92);
    for(let i=0;i<6;i++){if(i==3)continue;const a=AN+i/6*TAU+.52,x=Math.cos(a)*R*.88,z=Math.sin(a)*R*.88;wall(x,z,a+P2,R*.78,rr(1.6,2.6),GST,false,.6)}
    {const a=AN+3/6*TAU+.52,x=Math.cos(a)*R*.88,z=Math.sin(a)*R*.88,sg=sub(x,z,a,0);[-1,1].forEach(s=>TQ(sg,Q.box,S(GST),0,1.4,1.5*s,.8,2.8,.8));for(let q=-1.1;q<=1.1;q+=.28)TQ(sg,Q.cyl4,S(IRON,{metalness:.6}),0,1.1,q,.03,2.2,.03,0,0,q>0?.15:0);TQ(sg,Q.box,S(IRON,{metalness:.6}),0,2.1,0,.08,.08,2.4)}
    out(4,.6,(x,z)=>{chainPost(x,z,7);bones(x+.6,z+.4,3,.4)});for(let i=0;i<2;i++){const p=spot(R*.3,R*.6,.6);if(p)crate(p[0],p[1])}},
  '4_2_0':()=>{ // Colossus Barrow: a barrow mound over a colossus, its bones breaking through, standing stones round it
    {const [x,z]=A(R*.48,0),sg=sub(x,z,AN,0);[-1,1].forEach(s=>TQ(sg,Q.box,S(GST),0,1.3,1.1*s,.7,2.6,.7));TQ(sg,Q.box,S(GST),0,2.75,0,1,.5,3.2);const d=TQ(sg,Q.disc,G(0x040404),-.3,1,0,.8,1.1,1,0,-P2,0);d.castShadow=false;blk(x,z,1);take(x,z,1.8)}
    femur(...A(-R*.1,R*.2),AN+.6,5,0xd8d4c4,-.3);bigSkull(...A(-R*.45,-R*.35),AN+2.4,2.2,0xd8d4c4,false,-.7);
    for(let i=0;i<4;i++){const [x,z]=A(rr(-R*.3,R*.2),(i<2?-1:1)*R*.48),sg=sub(x,z,AN+P2,-.6);TQ(sg,Q.arc,S(0xd8d4c4),0,0,0,1.8,2.6,1.8,0,P2,0)}
    out(7,.88,(x,z,a)=>slab(x,z,.9,rr(2.4,3.4),.5,a+P2,DST,rr(-.06,.06)));edge(3,(x,z,a)=>grave(x,z,a,0x6a6e70,1))},
  '4_2_1':()=>{ // Hound Pit: chain stakes and gnawed bones at the bottom of the pit, an iron cage
    patch(0,0,.01,R*.5,0x3a3632);out(5,.4,(x,z,a)=>chainPost(x,z,6,a));cage(...A(R*.55,0),1.2,IRON,0,true);
    scat(8,0,R*.7,.4,(x,z)=>bones(x,z,3,.5));{const [x,z]=A(-R*.5,R*.3);put(Q.box,S(0x3a2a1c),x,.2,z,1.4,.4,.5,0,-AN,0);blk(x,z,0);take(x,z,.8)}},
  '4_2_2':()=>{ // Field of Skulls: skulls on stakes as far as the fog allows, cairns of skulls
    out(10,.48,(x,z)=>skullPole(x,z,rr(1.5,2.3)));out(15,.82,(x,z)=>skullPole(x,z,rr(1.6,2.6)));
    out(3,.66,(x,z)=>{for(let l=0;l<3;l++){const n=3-l;for(let i=0;i<n*3;i++){const a=i/(n*3)*TAU;skull(x+Math.cos(a)*.3*n,l*.3,z+Math.sin(a)*.3*n,1.1,0xe0d8c0,a)}}blk(x,z,.5);take(x,z,1.1)});
    scat(14,0,R*.95,.3,(x,z)=>skull(x,-.03,z,1));{const [x,z]=A(0,0);banner(x+1,z+1,0x2a3a3a,3.6,AN,0x9ab0a8)}},
  // ======================= The Citadel =======================
  '5_0_0':()=>{ // Blood Coven: a blood altar on the dais, a ring of tall red candles, iron candelabras, red sigils
    {const sg=sub(0,0,AN,0);TQ(sg,Q.box,S(CST2),0,.55,0,2,1.1,1.2);TQ(sg,Q.box,S(GTR,{metalness:.6,roughness:.4}),0,1.12,0,2.1,.06,1.3);const d=TQ(sg,Q.disc,G(BGL),0,1.17,0,.7,.4,1,-P2);d.castShadow=false;blk(0,0,.9);take(0,0,1.4)}
    halo(0,0,1.8,BGL,.18,.1);out(9,.36,(x,z)=>candle(x,z,0xff6a40,rr(.6,1),0x8a0a14));
    out(4,.6,(x,z)=>{blk(x,z,0);take(x,z,.5);put(Q.cyl,S(IRON,{metalness:.6}),x,.8,z,.04,1.6,.04);put(Q.cyl,S(IRON,{metalness:.6}),x,1.6,z,.5,.04,.05,0,0,P2);[-1,0,1].forEach(q=>{put(Q.cyl,S(0x8a0a14),x+q*.45,1.75,z,.04,.3,.04);const f=put(Q.cone,G(0xff7a40),x+q*.45,1.97,z,.04,.13,.04);f.castShadow=false;CFL.push(f)})});
    runes(0,0,R*.5,0x8a0a1c,7);out(3,.86,(x,z,a)=>banner(x,z,RCL,3.2,a+P2,GTR))},
  '5_0_1':()=>{ // Blood Roost: a great dead tree on the crag, heavy with sleeping bats
    const tips=[];deadTree(0,-2,6.5,0x1a1416,1.6,tips);deadTree(...A(R*.5,R*.3),3.6,0x1a1416,1,tips);
    tips.forEach(t=>{for(let i=0;i<2;i++){const x=t[0]+rr(-.2,.2),z=t[2]+rr(-.2,.2);putY(Q.cone,S(0x140c10),x,t[1]-.35,z,.14,.5,.14,Math.PI,0,0);if(rn()<.5){const e=putY(Q.sph,G(0xff2030),x+.05,t[1]-.5,z,.025,.025,.025);e.castShadow=false}}});
    scat(6,0,R*.7,.6,(x,z)=>patch(x,z,.01,rr(.5,.9),0xc8c0b0,.5,.05));scat(5,1,R*.8,.3,(x,z)=>{const o=put(Q.cone,G(BGL),x,.05,z,.03,.1,.03);o.castShadow=false});
    edge(4,(x,z)=>rock(x,z,rr(.8,1.4),CST));scat(3,1,R*.8,.5,(x,z)=>bones(x,z,3,.5))},
  '5_0_2':()=>{ // Knight Barracks: a parade ground, racks, armour stands, dummies, a wall with banners, bunk tents
    patch(0,0,.01,R*.62,0x4a3c36);{const [x,z]=A(R*.78,0);wall(x,z,AN+P2,R*.9,3,CST2,true,.8);[-1,1].forEach(s=>{const [bx,bz]=A(R*.72,s*R*.25);banner(bx,bz,RCL,3.4,AN+P2,GTR)})}
    for(let i=-1;i<=1;i++){const [x,z]=A(R*.5,i*2.6);rack(x,z,AN+Math.PI,0xa0a0aa)}
    for(let i=0;i<4;i++){const [x,z]=A(rr(-R*.1,R*.2),(i-1.5)*2.4),sg=sub(x,z,AN+Math.PI,0);blk(x,z,0);take(x,z,.6);TQ(sg,Q.cyl,S(0x3a2818),0,.7,0,.05,1.4,.05);TQ(sg,Q.box,S(IRON,{metalness:.7,roughness:.35}),0,1.25,0,.3,.6,.55);TQ(sg,Q.sph,S(IRON,{metalness:.7,roughness:.35}),0,1.75,0,.18,.22,.18);[-1,1].forEach(s=>TQ(sg,Q.sph,S(IRON,{metalness:.7}),0,1.48,.32*s,.15,.12,.15))}
    for(let i=0;i<3;i++){const [x,z]=A(-R*.35,(i-1)*2.6);dummy(x,z,AN)}
    [-1,1].forEach(s=>{const [x,z]=A(-R*.7,s*R*.38);aTent(x,z,AN+P2,RCL,2.8,1.1)});scat(4,R*.5,R*.85,.6,(x,z,a,i)=>i%2?crate(x,z):barrel(x,z));{const [x,z]=A(-R*.7,0);brazier(x,z,0xff5a2a,1.3)}},
  '5_1_0':()=>{ // Gargoyle Parapet: a broken parapet along the shelf edge where stone things perch, rubble below
    for(let i=-2;i<=2;i++){if(i==1)continue;const [x,z]=A(R*.1,i*R*.36);wall(x,z,AN+P2,R*.3,1.6,CST2,true,.8);if(i!=0)gargoyle(x,z,AN+Math.PI,1.1,0x5a5458,1.6)}
    {const [x,z]=A(R*.1,R*.36);rubble(x-1.5,z,10,1.4,CST2)}
    scat(6,R*.2,R*.85,.6,(x,z)=>{if(x*Math.cos(AN)+z*Math.sin(AN)<-1)rubble(x,z,5,.7,CST2)});
    {const [x,z]=A(R*.55,0);banner(x,z,RCL,3.4,AN+P2,GTR);brazier(x+1.2,z+1.2,0xff4a2a,1.2)}{const [x,z]=A(-R*.45,R*.2);gargoyle(x,z,AN+2,1,0x5a5458,-.2);put(Q.box,S(CST2),x,.3,z,1,.7,1)}},
  '5_1_1':()=>{ // Hound Kennels: iron cages with bones inside, chains, bowls and straw
    patch(0,0,.01,R*.6,0x3a3430);for(let i=-1;i<=2;i++){const [x,z]=A(R*.45,(i-.5)*2.4);cage(x,z,1.15,IRON,0,rn()<.7)}
    {const [x,z]=A(-R*.1,-R*.5);for(let i=0;i<2;i++)chainPost(x+i*1.8,z,6,AN+P2)}
    scat(4,1,R*.7,.4,(x,z)=>{put(Q.cyl,S(IRON,{metalness:.6}),x,.08,z,.3,.16,.3);put(Q.disc,S(0x5a2a20),x,.17,z,.25,.25,1,-P2)});
    scat(6,1,R*.9,.5,(x,z)=>patch(x,z,.01,rr(.5,.9),0x9a8a4a,.6,.05));scat(4,1,R*.8,.5,(x,z)=>bones(x,z,3,.5));
    {const [x,z]=A(-R*.8,0);palis(x,z,AN+P2,R*.9,1.2,IRON)}},
  '5_1_2':()=>{ // Siege Breach: a fallen wall section with a breach, the ram that made it, a wrecked catapult, fires
    [-1,1].forEach(s=>{const [x,z]=A(R*.62,s*R*.42);wall(x,z,AN+P2,R*.5,rr(2.6,3.6),CST2,true,1)});{const [x,z]=A(R*.62,0);rubble(x,z,14,1.6,CST2);rock(x,z,1.4,CST2)}
    {const [x,z]=A(R*.15,-1);ram(x,z,AN,1.1)}{const [x,z]=A(-R*.45,R*.35);catapult(x,z,AN+.4,1.2,true)}
    for(let i=0;i<2;i++){const p=spot(R*.3,R*.7,.8);if(p){const sg=sub(p[0],p[1],p[2],0);take(p[0],p[1],1.2);[-1,1].forEach(s=>TQ(sg,Q.cyl,S(0x4a3220),0,.06,.3*s,.05,3,.05,0,0,P2));for(let q=-1.2;q<=1.2;q+=.4)TQ(sg,Q.cyl,S(0x4a3220),q,.06,0,.03,.6,.03,P2,0,0)}}
    out(3,.5,(x,z)=>fire(x,z,0xff6a2a,.9));scat(8,R*.2,R*.9,.8,(x,z)=>rock(x,z,rr(.5,1.1),CST2));out(2,.85,(x,z,a)=>banner(x,z,RCL,3,a,GTR))},
  '5_2_0':()=>{ // Execution Yard: a gallows, the block and its axe, stocks, a gibbet cage
    gallows(...A(R*.2,0),AN,1.15);block(...A(-R*.15,R*.3),AN);[-1,1].forEach(s=>stocks(...A(-R*.3,s*R*.45),AN+P2));
    {const [x,z]=A(-R*.45,-R*.1);blk(x,z,0);take(x,z,1);pole(x,z,3.6,0x2a2018,.09);put(Q.box,S(0x2a2018),x+.6,3.5,z,1.3,.1,.1);cage(x+1.1,z,.8,IRON,1.4,true)}
    scat(5,1,R*.7,.6,(x,z)=>patch(x,z,.01,rr(.5,.9),0x5a0a10,.6,.05));out(4,.85,(x,z)=>torch(x,z,0xff6a2a,2.1));
    {const [x,z]=A(-R*.75,0);palis(x,z,AN+P2,R*.8,.9,0x2a2018)}},
  '5_2_1':()=>{ // Nosferatu Crypt: a mausoleum sunk into a cold hollow, open coffins, cobwebs and bats under the eaves
    const [mx,mz]=A(R*.3,0);mausoleum(mx,mz,AN+Math.PI,1.1,CST2,0x2a2428);
    for(let i=0;i<6;i++){const [x,z]=A(R*.3+rr(-1.4,1.4),rr(-1.7,1.7));putY(Q.cone,S(0x140c10),x,gy(mx,mz)+2.3,z,.12,.4,.12,Math.PI,0,0)}
    out(3,.55,(x,z,a)=>coffin(x,z,a+rr(-.4,.4),0x2a1a1a,true));for(let i=0;i<2;i++){const p=spot(R*.5,R*.85,1);if(p)web(p[0],p[1],p[2],1,0xe0dcd8)}
    out(7,.86,(x,z,a)=>grave(x,z,a+Math.PI,0x5a5458));candles(...A(-R*.1,0),5,.8,0xff8a60,0x8a0a14)},
  '5_2_2':()=>{ // Blood Garden: hedges round the terraces, roses, a fountain of blood, thorny arches, marble statues
    fountain(0,0,1.3,0xb8b0b4,0xa01020,true);
    for(let i=0;i<8;i++){if(i%4==0)continue;const a=AN+i/8*TAU,x=Math.cos(a)*R*.72,z=Math.sin(a)*R*.72;hedge(x,z,a+P2,R*.48,1.2,0x1a261a)}
    [0,4].forEach(i=>{const a=AN+i/8*TAU,x=Math.cos(a)*R*.72,z=Math.sin(a)*R*.72,sg=sub(x,z,a,0);TQ(sg,Q.arc,S(0x1a1416),0,0,0,1.3,2.4,1.3,0,P2,0);for(let q=0;q<6;q++){const t=q/5*Math.PI;TQ(sg,Q.sph,S(0xb01020,{emissive:0x500008,emissiveIntensity:.4}),0,Math.sin(t)*2.4,Math.cos(t)*1.3,.12,.12,.12)}take(x,z,1)});
    out(6,.42,(x,z)=>roseBush(x,z,rr(.8,1.1)));out(3,.55,(x,z,a)=>{figure(x,z,a+Math.PI,1.2,0xd8d4d0,pk(['raise','stand']),false,.35);put(Q.box,S(0xb8b0b4),x,.15,z,.8,.4,.8)});
    out(2,.6,(x,z,a)=>{const sg=sub(x,z,a+P2,0);TQ(sg,Q.box,S(0xb8b0b4),0,.45,0,1.6,.12,.5);[-1,1].forEach(s=>TQ(sg,Q.box,S(0xb8b0b4),.6*s,.22,0,.15,.45,.4));take(x,z,.9)})}
  }}

// ---------------- hooks ----------------
// buildCamp: the design when there is one (no sign), else the old outpost
{const f=buildCamp;buildCamp=function(C){if(C.g)return;if(!C.des)return f.apply(this,arguments);
  const g=new THREE.Group();g.position.set(C.x,0,C.z);let ok=false;
  try{ok=cs123Build(C,g)}catch(e){console.warn('v123 camp',C.key,e)}
  if(!ok){C.boxes=[];CS123.an=CS123.an.filter(a=>a.C!==C);return f.apply(this,arguments)}
  cs123Merge(g);scene.add(g);C.g=g;C.v123=1}}
// animated pieces: bob, spin, pulse, orbit, puff — only for camps that are shown and near
function cs123Tick(dt,now){const L=CS123.an;if(!L.length)return;const p=pl.position,t=now*.001;
  for(let i=0;i<L.length;i++){const a=L[i],C=a.C;if(!C.g||!C.g.visible)continue;if(Math.abs(C.x-p.x)>60||Math.abs(C.z-p.z)>60)continue;const o=a.o,w=t*a.sp+a.ph;
    if(a.k=='bob')o.position.y=a.y0+Math.sin(w)*a.a;
    else if(a.k=='spin'){o.rotation.y+=dt*a.sp;o.position.y=a.y0+Math.sin(w)*.15}
    else if(a.k=='pulse'){const s=1+Math.sin(w*2.2)*a.a;o.scale.set(a.s0.x*s,a.s0.y*s,a.s0.z*s)}
    else if(a.k=='orbit'){o.position.set(a.x0+Math.cos(w)*a.a,a.y0+Math.sin(w*1.7)*.25,a.z0+Math.sin(w)*a.a)}
    else if(a.k=='puff'){const q=(w*.25)%1;o.scale.set(a.s0.x*(.6+q*.8),a.s0.y*(.5+q),a.s0.z*(.6+q*.8));o.position.y=a.y0+q*1.2;o.material.opacity=.22*(1-q)}}}
// the camp's title card when you walk in (once per visit; again after you've been away a while)
document.head.insertAdjacentHTML('beforeend',`<style>
#ztc116.camp123{top:17%;min-width:min(380px,86%);padding:12px 26px 10px}#ztc116.camp123.on{animation:zt116 3.8s ease forwards}
#ztc116.camp123 .ztt{font-size:clamp(1.25rem,3.2vw,2rem);letter-spacing:.05em}#ztc116.camp123 .ztd{width:min(260px,70%);margin:4px auto}#ztc116.camp123 .ztd svg{width:18px;height:18px}
#ztc116.camp123 .zts{font-size:.86rem}#ztc116.camp123 .ztk,#ztc116.camp123 .ztf{font-size:.62rem}
</style>`);
function cs123Card(now){const st=CS123.card,p=pl.position;let C=null;
  for(const Q of CAMPS){if(!Q.des||!Q.g)continue;if(Math.hypot(Q.x-p.x,Q.z-p.z)<Q.r*.92){C=Q;break}}
  if(C===st.C)return;const prev=st.C;st.C=C;if(!C)return;
  if(prev===null&&now-(st.seen[C.key]||-1e9)<90000)return;st.seen[C.key]=now;
  if(typeof zt116Show!='function'||typeof ZT116=='undefined')return;const el=ZT116.el;if(el&&/\bon\b/.test(el.className)&&!/camp123/.test(el.className))return; // a zone card is up
  const I=INSL[C.ig],Tz=ZT116.Z[I.z]||ZT116.Z[0],cl=typeof campCleared=='function'&&campCleared(C);
  zt116Show(Tz,PMAP[I.z].n+' · Camp',C.th.n,C.des.sub,cl?'Cleared':'Garrison Lv '+zoneLv(C.x,C.z),'z'+I.z+' camp123');clearTimeout(ZT116.tm);ZT116.tm=setTimeout(()=>{if(ZT116.el)ZT116.el.className=''},3800)}
{const f=campTick;campTick=function(dt,now){f.apply(this,arguments);try{cs123Tick(dt,now);if(now-CS123.card.t>350){CS123.card.t=now;cs123Card(now)}}catch(e){}}}
// the garrison: build the instance's camps first (their pieces block tiles), then spread each camp's slots over its own size
{const f=rosterBuild;rosterBuild=function(r){const o=f.apply(this,arguments);try{if(ROST.r!==r)return o;
  CAMPS.forEach(C=>{if(C.ig===r&&C.des&&!C.g)buildCamp(C)});
  ROST.slots.forEach(s=>{const C=s.camp;if(!C||!C.des||s.on)return;let x=s.x,z=s.z,n=0;
    do{const a=Math.random()*6.283,d=Math.sqrt(Math.random())*C.sp;x=Math.round(C.x+Math.cos(a)*d);z=Math.round(C.z+Math.sin(a)*d);n++}while(solid(x,z)&&n<40);
    if(n<40){s.x=x;s.z=z;s.lv=Math.min(MAXLV,zoneLv(x,z)+(s.al?2:0))}})}catch(e){console.warn('v123 roster',e)}return o}}
