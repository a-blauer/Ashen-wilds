// ================= v151 The Frozen Gate — Burningeye Summit II main quest: the flamespitter, the workbench, melting the gate =================
// Chapter 2 of Burningeye Summit's main quest line (1 The Frozen Maw is 3152, 3 The Mountain Drill is 3170). The gateway at the end
// of The Rimecaverns (Burningeye II) is gone: in its place stands a great stone gate filled with a wall of ancient ice.
//  * The parts: three pieces of an essence-charged flamespitter lie in salvage caches around II (Essence Core, Ember Nozzle, Bellows
//    Tank; mq160Plan puts them off the road at 28%, 52% and 76% of II's road). An elite stands guard over each (a Frost Wendigo, a
//    Frost Troll, a Rimeshell Crawler); kill it and F at the cache takes the part. A faint orange beacon over each shows from afar.
//  * The workbench beside the gate: F with all three parts assembles the flamespitter (it rests on the bench).
//  * F at the bench (or the gate) with the flamespitter assembled starts the melt, a special event that cannot be stopped: the
//    hero is held in the gate yard (no recall, no walking out) until the gate is melted or the hero falls (then the gate freezes
//    over again, the flamespitter goes back on the bench and it can be tried again).
//      C (or F, or tapping the prompt) picks the flamespitter up / drops it. Carrying it you are slower and cannot swing or cast.
//      Hold the left mouse button to spray flame where you aim. On the gate it melts the ice (MQ160.melt, 60 s of flame in all).
//      The flamespitter heats while it fires: 5 s of spraying (MQ160.heatT) and it overheats, and must cool right down (MQ160.coolT)
//      before it fires again. Drop it to fight while it cools.
//      Ice spiders come from all round the yard all the time, faster as the melt goes on, and always run at you. The flame kills a
//      spider at once, but each kill burns MQ160.kc of the flamespitter's essence charge (MQ160.charge): spend it when you are
//      surrounded. With the charge spent the flame still melts, but no longer kills.
//  * Melted: the ice bursts, the gate opens on a road of cold light; F at it goes to Stormcrown (Burningeye III).
// State MQ160.st: 0 finding parts · 1 all three parts · 2 assembled · 3 the gate is open. p[3] the parts taken. Done also when III has
// been reached (mq160Done). Saved as x2.mq160 {st, p}. A save made mid-melt loads with the flamespitter on the bench. Co-op: local to each
// player (the spiders are minions, never shared; each player melts their own gate).
var MQ160={name:'The Frozen Gate',st:0,p:[0,0,0],gk:[0,0,0],fd:[0,0,0],S:null,E:null,err:0,t:0,trkK:'',melt:60,heatT:5,coolT:4,charge:100,kc:8,lv:22,gl:24,see:28,leash:15.5,
  parts:[{k:'core',n:'Essence Core',ic:'🔮',g:'wendigo'},{k:'nozzle',n:'Ember Nozzle',ic:'🔥',g:'troll'},{k:'tank',n:'Bellows Tank',ic:'🛢️',g:'rimecrawler'}]};
function mq160Ins(){try{return curIns()}catch(_){return null}}
function mq160In2(){const I=mq160Ins();return !!I&&I.g===insG(2,1)}
function mq160N(){return MQ160.p.filter(Boolean).length}
function mq160Done(){return MQ160.st>=3||insReach(2)>=2}
function mq160Next(){try{const t=typeof TH112!='undefined'&&TH112&&TH112.byG&&TH112.byG[insG(2,2)];return t&&t.nm?t.nm:PMAP[2].ins[2].n}catch(_){return 'Stormcrown'}}
// ---------------- where things stand (a pure function of the map data: 1680's place() keeps decorations off them) ----------------
function mq160Plan(){if(mq160Plan.c)return mq160Plan.c;const I=INSL[insG(2,1)],P=I.path,N=P.length,q=P[Math.max(0,N-14)],gx=I.ba[0],gz=I.ba[1],ry=Math.atan2(q[0]-gx,q[1]-gz);
  const fx=Math.sin(ry),fz=Math.cos(ry),sx=Math.cos(ry),sz=-Math.sin(ry),DW=MAP.DW;
  const ok=(x,z,m)=>{const X=Math.round(x),Z=Math.round(z);if(X<1||Z<1||X>=W-1||Z>=H-1)return false;const t=MAP[Z]&&MAP[Z][X];if(!t||t=='#'||t=='r'||t=='~'||t=='H')return false;const J=insAt(X,Z);if(!J||J.g!==I.g)return false;return DW[Z*W+X]<-(m==null?1:m)};
  const R={gate:{x:gx,z:gz,ry,fx,fz,sx,sz},ok,cache:[null,null,null],keep:[]};
  // the workbench: beside the gate on whichever side is open, a little toward the road
  let bs=1;for(const s of [1,-1]){const x=gx+sx*s*7+fx*2,z=gz+sz*s*7+fz*2;if(ok(x,z,1.5)){bs=s;break}}R.bench={x:gx+sx*bs*7+fx*2,z:gz+sz*bs*7+fz*2,ry,s:bs};
  R.yard={x:gx+fx*6,z:gz+fz*6};
  // the caches: off the road at 28 / 52 / 76% of II's road, alternating sides, on open ground away from camps and each other
  const tan=i=>{const a=P[Math.max(0,i-3)],b=P[Math.min(N-1,i+3)];let dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;return [dx/L,dz/L]};
  const avoid=[[I.en[0],I.en[1],20],[gx,gz,22]].concat((I.cl||[]).map(c=>[c[0],c[1],16])),fr=[.28,.52,.76];
  for(const T of [{m:2.4,sep:30,av:1},{m:1.6,sep:22,av:.75},{m:1.1,sep:14,av:.5}])for(let j=0;j<3;j++){if(R.cache[j])continue;const ix=Math.round((N-1)*fr[j]),sd=j%2?-1:1;let got=null;
    for(const b of [12,10,14,9,16,7])for(const side of [sd,-sd])for(const da of [0,6,-6,12,-12]){if(got)break;const k=Math.max(0,Math.min(N-1,ix+da)),p=P[k],t=tan(k),x=p[0]-t[1]*b*side,z=p[1]+t[0]*b*side;
      if(!ok(x,z,T.m)||!avoid.every(([px,pz,r])=>Math.hypot(x-px,z-pz)>=r*T.av)||!R.cache.every(o=>!o||Math.hypot(x-o.x,z-o.z)>=T.sep))continue;got={x:Math.round(x*2)/2,z:Math.round(z*2)/2,i:j,ry:Math.atan2(p[0]-x,p[1]-z)}}
    if(got)R.cache[j]=got}
  for(let j=0;j<3;j++)if(!R.cache[j]){const ix=Math.round((N-1)*fr[j]),p=P[ix],t=tan(ix);R.cache[j]={x:p[0]-t[1]*5,z:p[1]+t[0]*5,i:j,ry:0,fb:1}}
  R.keep.push([gx-fx*1.5,gz-fz*1.5,8.5],[R.bench.x,R.bench.z,3.8]);R.cache.forEach(o=>R.keep.push([o.x,o.z,4.5]));
  return mq160Plan.c=R}
function mq160Keep(g,x,z){if(g!==insG(2,1))return false;try{for(const k of mq160Plan().keep)if(Math.hypot(x-k[0],z-k[1])<k[2])return true}catch(e){if(!mq160Keep.e){mq160Keep.e=1;console.warn('v151 gate keep',e)}}return false}
// roaming groups stay out of the gate yard and away from the caches (the guards are the fight there)
{const f=rosterBuild;rosterBuild=function(r){const o=f.apply(this,arguments);try{if(r===insG(2,1)&&ROST.r===r){const R=mq160Plan(),L=[[R.yard.x,R.yard.z,24]].concat(R.cache.map(c=>[c.x,c.z,14]));
    ROST.slots=ROST.slots.filter(s=>!(s.wild&&L.some(q=>Math.hypot((s.hx==null?s.x:s.hx)-q[0],(s.hz==null?s.z:s.hz)-q[1])<q[2])))}}catch(e){console.warn('v151 gate roster',e)}return o}}

// the gate's stone and the workbench are solid from the start; the opening is solid ice until it melts (mq160Sync frees it)
function mq160Solid(){const R=mq160Plan(),G=R.gate,B=R.bench,W2=(lx,lz)=>[G.x+lx*G.sx+lz*G.fx,G.z+lx*G.sz+lz*G.fz];MQ160.iceT=[];
  for(let lz=-2;lz<=0;lz++)for(let lx=-5;lx<=5;lx++){const [wx,wz]=W2(lx,lz),key=Math.round(wz)*W+Math.round(wx);if(Math.abs(lx)<=3)MQ160.iceT.push(key);CBLK.add(key)}
  for(let lz=-1;lz<=0;lz++)for(let lx=-1;lx<=1;lx++){const x=B.x+lx*G.sx+lz*G.fx,z=B.z+lx*G.sz+lz*G.fz;CBLK.add(Math.round(z)*W+Math.round(x))}}
try{mq160Solid()}catch(e){console.warn('v151 gate tiles',e)}
// ---------------- the ice spider ----------------
SPEC.Iceskitter=Object.assign({},SPEC.Cryptspider);
LPR.Iceskitter=Object.assign({},LPR.Cryptspider,{geo(C,c){return n3Recolor('isk|'+C,LPR.Cryptspider.geo(C,c),0x7a1410,0xcfeeff,.25)},
  kit(k,c,C,red){LPR.Cryptspider.kit(k,c,C,red);
    // a spine of ice crystals along the abdomen, frost-blue eyes, icicle fangs
    [[0,.7,-.3,.05,.26,0,0],[.07,.67,-.36,.04,.2,.35,-.5],[-.07,.67,-.24,.04,.21,-.35,.5],[0,.66,-.44,.035,.18,0,-.3],[.05,.64,-.18,.03,.14,.3,.6]].forEach((q,i)=>{const bn=q[2]<-.4?'tail1':q[2]<-.28?'tail0':'pelvis';
      k.p(bn,'cone4','g',i%2?0xbfeaff:0x7ad8ff,q[0],q[1]+q[4]*.35,q[2],q[3],q[4],q[3],q[5],0,q[6])});
    for(let i=0;i<6;i++)k.p('head','sph','g',red?0xff2a2a:0xbff4ff,(i%3-1)*.035,.52+(i>2?.03:0),.5,.013);
    [-1,1].forEach(s=>k.p('head','cone4','c',0xe8f8ff,s*.04,.44,.55,.012,.08,.012,Math.PI*.6,0,s*.2))}});
EN.icespider={n:'Ice Spider',e:'🕷️',rig:'Iceskitter',col:0x9ac8e8,sc:.82,w:{hp:.42,pa:.85,ma:.5,pd:.55,md:.7},mt:'p',moves:['bite','pounce'],fam:'Swarm'};
try{S.icespider=S.icespider||{e:'🕷️',c:0x9ac8e8,h:'X',t:'x',hp:20,a:8,d:5};MSET.icespider=EN.icespider.moves}catch(_){}
{const f=eTarget;eTarget=function(e,m,dpl){if(e&&e.fs160sp&&!e.dead)return pl;return f.apply(this,arguments)}}

// ---------------- models ----------------
var FS160={m:null,obj:null,held:null,tmp:null};
function fs160Mats(){if(FS160.m)return FS160.m;const S=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,flatShading:true},o||{}));
  return FS160.m={stone:S(0x5c6068,{roughness:.92}),stone2:S(0x40444c,{roughness:.95}),carve:S(0x2c3036),snow:S(0xe6eef4,{roughness:.95}),
    ice:S(0x9ad8ff,{emissive:0x1a5a8a,emissiveIntensity:.5,roughness:.08,metalness:.15,transparent:true,opacity:.86}),ice2:S(0x6aa8e0,{emissive:0x0e3a6a,emissiveIntensity:.5,roughness:.12,metalness:.12,transparent:true,opacity:.9}),
    glass:S(0xbfe8ff,{emissive:0x2a6aa0,emissiveIntensity:.4,roughness:.04,metalness:.2,transparent:true,opacity:.62}),
    rune:new THREE.MeshBasicMaterial({color:0x5ab8ff}),bone:S(0xcfc4a4,{roughness:.7}),horn:S(0x3a3024,{roughness:.6}),
    wood:S(0x5a3e26,{roughness:.9}),wood2:S(0x3e2a18,{roughness:.92}),iron:S(0x3a3d44,{roughness:.42,metalness:.65}),iron2:S(0x24262c,{roughness:.5,metalness:.6}),
    brass:S(0xb08a3a,{roughness:.35,metalness:.75}),copper:S(0xb0643a,{roughness:.4,metalness:.7}),leath:S(0x4a3420,{roughness:.85}),
    ember:new THREE.MeshBasicMaterial({color:0xff8a2a}),core:S(0xffa040,{emissive:0xff6a10,emissiveIntensity:1.3,roughness:.2,transparent:true,opacity:.92}),
    coal:S(0x2a1a14,{emissive:0xff4a10,emissiveIntensity:.9}),cloth:S(0x6a2a1a,{roughness:.95}),void:new THREE.MeshBasicMaterial({color:0x050608,fog:false})}}
// a kit like the cave's: meshes under one joint, merged per material
function fs160Kit(){return gb151Kit()}
// the great gate: two carved pillars, a lintel with a horned skull, steps; a wall of ice in the opening (its own group, it melts)
function fs160Gate(){const M=fs160Mats(),k=fs160Kit(),rn=svRng(1601);
  [-1,1].forEach(s=>{const x=s*3.7;k.m(svG('fg_p',()=>svLoft([[0,.95,.95],[.3,.9,.9],[6.6,.82,.82],[7.0,.95,.95]],8,{rot:Math.PI/8})),M.stone,x,0,0);
    k.m(svG('fg_c',()=>svLoft([[0,1.15,1.15],[.5,1.1,1.1]],8,{rot:Math.PI/8})),M.stone2,x,6.9,0);k.m(svG('fg_b',()=>svLoft([[0,1.2,1.2],[.6,1.05,1.05]],8,{rot:Math.PI/8})),M.stone2,x,0,0);
    for(let i=0;i<4;i++){k.m(svG('fg_band',()=>svLoft([[0,.86,.86],[.12,.86,.86]],8,{cap:false,rot:Math.PI/8})),M.carve,x,1.6+i*1.35,0);k.m(svG('fg_rn',()=>new THREE.BoxGeometry(.22,.5,.04)),M.rune,x,2.2+i*1.35,.85,0,0,(i%2?.3:-.3))}
    k.lump(1+(s>0?0:1),1610+s,M.snow,x,7.55,0,1.0,.28,1.0,0,.2);
    for(let i=0;i<5;i++)k.icl(i%2?M.ice:M.ice2,x+(rn()-.5)*1.4,6.85,.95+(rn()-.5)*.2,.08+rn()*.05,.5+rn()*.7)});
  // the lintel and the horned skull over the opening
  k.m(svG('fg_l',()=>new THREE.BoxGeometry(9.6,1.3,1.6)),M.stone,0,7.55,0);k.m(svG('fg_l2',()=>new THREE.BoxGeometry(10.2,.3,1.9)),M.stone2,0,8.3,0);k.lump(3,1612,M.snow,0,8.55,0,4.4,.26,.9,0,.15);
  k.lump(4,1613,M.bone,0,7.55,.85,.62,.55,.42,0,.15);[-1,1].forEach(s=>{k.m(svG('fg_h',()=>svHorn(.16,1,0,.8,6,6)),M.horn,s*.45,7.8,.9,-.4,s*1.1,0,1,1,1.4);k.m(svG('fg_e',()=>new THREE.IcosahedronGeometry(.1,0)),M.rune,s*.2,7.65,1.22)});
  for(let i=0;i<16;i++)k.icl(i%2?M.ice:M.ice2,-3.0+i*.4+(rn()-.5)*.1,6.85,.55+rn()*.3,.1+rn()*.06,.6+rn()*1.0);
  // the steps
  k.m(svG('fg_s1',()=>new THREE.BoxGeometry(9,.3,2.2)),M.stone2,0,.15,1.4);k.m(svG('fg_s2',()=>new THREE.BoxGeometry(8,.3,1.2)),M.stone,0,.42,.9);
  // the road beyond: dark until the gate opens, then a road of cold light
  k.m(svG('fg_v',()=>new THREE.PlaneGeometry(5.8,6.7)),M.void,0,3.4,-.6);
  const g=k.done();g.userData.psNo=1;
  // the ice wall (melts: it sinks and thins from the top, drips and steams)
  const ice=new THREE.Group();g.add(ice);const kk=fs160Kit();
  kk.m(svG('fg_iw',()=>{const q=new THREE.BoxGeometry(5.9,6.7,1.5,5,6,2),P=q.attributes.position,r=svRng(1620);for(let i=0;i<P.count;i++){P.setX(i,P.getX(i)+(r()-.5)*.25);P.setZ(i,P.getZ(i)+(r()-.5)*.35)}q.translate(0,3.35,0);return q.toNonIndexed()}),M.glass,0,0,.1);
  for(let i=0;i<14;i++){const x=-2.6+rn()*5.2,y=.2+rn()*5.6;kk.crys(i,i%2?M.ice:M.ice2,x,y,.55+rn()*.3,(rn()-.5)*.8,(rn()-.5)*.5+.2,1,.18+rn()*.14,.5+rn()*.9)}
  for(let i=0;i<8;i++)kk.crys(20+i,M.ice,-2.8+i*.8,0,.4,(rn()-.5)*.4,1,.3,.35+rn()*.2,1.4+rn()*1.8);
  kk.lump(5,1621,M.carve,-.6,2.4,-.1,.5,.9,.4,0,.25);kk.lump(6,1622,M.carve,.9,1.6,-.2,.4,.55,.35,0,.3);   // shapes frozen deep in the ice
  const iw=kk.done();ice.add(iw);
  const glow=kqSpr(0x7ad8ff,5);glow.material=glow.material.clone();glow.material.opacity=0;glow.position.set(0,3.2,-.8);g.add(glow);
  const hot=kqSpr(0xff8a3a,1.6);hot.material=hot.material.clone();hot.material.opacity=0;g.add(hot);
  const pud=new THREE.Mesh(svG('fg_pd',()=>new THREE.CircleGeometry(1,20).rotateX(-Math.PI/2)),new THREE.MeshStandardMaterial({color:0x8ab8d8,roughness:.05,metalness:.4,transparent:true,opacity:.7,polygonOffset:true,polygonOffsetFactor:-3}));
  pud.position.set(0,.6,1.6);pud.scale.set(.01,1,.01);pud.material.userData.noFade135=1;g.add(pud);
  return {g,ice,glow,hot,pud}}
// the parts and the flamespitter (built along +z, the nozzle forward; origin at the rear grip)
function fs160PartModel(i,k,o){const M=fs160Mats();o=o||{x:0,y:0,z:0};const X=o.x,Y=o.y,Z=o.z;
  if(i===0){// the Essence Core: a glowing crystal in an iron cage with brass caps
    k.m(svG('fp_c',()=>{const q=new THREE.OctahedronGeometry(.11,0);q.scale(1,1.5,1);return q}),M.core,X,Y,Z);
    [-1,1].forEach(s=>k.m(svG('fp_cc',()=>new THREE.CylinderGeometry(.13,.13,.05,8)),M.brass,X,Y+s*.17,Z));
    for(let q=0;q<6;q++){const a=q/6*6.283;k.m(svG('fp_cb',()=>new THREE.CylinderGeometry(.012,.012,.34,4)),M.iron,X+Math.sin(a)*.12,Y,Z+Math.cos(a)*.12)}}
  else if(i===1){// the Ember Nozzle: an iron barrel, cooling fins, a flared mouth, a brass collar
    k.m(svG('fp_n',()=>{const q=new THREE.CylinderGeometry(.05,.06,.5,8);q.rotateX(Math.PI/2);return q}),M.iron2,X,Y,Z);
    k.m(svG('fp_nm',()=>{const q=new THREE.CylinderGeometry(.1,.055,.12,10,1,true);q.rotateX(Math.PI/2);return q}),M.iron,X,Y,Z+.3);
    for(let q=0;q<3;q++)k.m(svG('fp_nf',()=>{const g=new THREE.CylinderGeometry(.085,.085,.02,10);g.rotateX(Math.PI/2);return g}),M.iron,X,Y,Z-.12+q*.09);
    k.m(svG('fp_nc',()=>{const g=new THREE.CylinderGeometry(.075,.075,.06,10);g.rotateX(Math.PI/2);return g}),M.brass,X,Y,Z-.24)}
  else{// the Bellows Tank: a copper tank with iron bands, a gauge and a valve wheel
    k.m(svG('fp_t',()=>{const q=new THREE.CylinderGeometry(.11,.11,.36,10);q.rotateX(Math.PI/2);return q}),M.copper,X,Y,Z);
    [-1,1].forEach(s=>k.m(svG('fp_te',()=>new THREE.SphereGeometry(.11,10,6,0,6.283,0,Math.PI/2)),M.copper,X,Y,Z+s*.18,s*Math.PI/2,0,0));
    [-1,0,1].forEach(s=>k.m(svG('fp_tb',()=>{const g=new THREE.TorusGeometry(.115,.012,4,12);return g}),M.iron,X,Y,Z+s*.12));
    k.m(svG('fp_tg',()=>new THREE.CylinderGeometry(.04,.04,.02,10)),M.brass,X+.08,Y+.08,Z,0,0,-.8);k.m(svG('fp_tv',()=>new THREE.TorusGeometry(.04,.008,4,8)),M.iron,X,Y+.14,Z+.05,Math.PI/2,0,0)}}
function fs160Spitter(){const M=fs160Mats(),k=fs160Kit();
  fs160PartModel(2,k,{x:0,y:.05,z:-.02});fs160PartModel(0,k,{x:0,y:.06,z:.27});fs160PartModel(1,k,{x:0,y:.06,z:.64});
  // the frame: a spine bar, the rear grip, the fore grip, straps
  k.m(svG('fs_sp',()=>new THREE.BoxGeometry(.03,.03,.92)),M.iron,0,-.06,.32);
  k.m(svG('fs_g',()=>new THREE.CylinderGeometry(.025,.025,.16,6)),M.leath,0,-.12,0,.25,0,0);k.m(svG('fs_g2',()=>new THREE.CylinderGeometry(.025,.025,.14,6)),M.leath,0,-.11,.46,.1,0,0);
  k.m(svG('fs_tr',()=>new THREE.TorusGeometry(.05,.008,4,8)),M.brass,0,-.1,.06,Math.PI/2,0,0);
  const g=k.done();const pil=kqSpr(0x6ad8ff,.18);pil.position.set(0,.06,.98);g.add(pil);
  // the grip points for the hero's hands
  const gR=new THREE.Object3D();gR.position.set(0,-.12,0);g.add(gR);const gL=new THREE.Object3D();gL.position.set(0,-.11,.46);g.add(gL);const tip=new THREE.Object3D();tip.position.set(0,.06,1.0);g.add(tip);
  g.userData={gR,gL,tip,pil,psNo:1};return g}
// the workbench: timbers, a vise, tools, a brazier of coals, crates and a rack
function fs160Bench(){const M=fs160Mats(),k=fs160Kit(),rn=svRng(1630);
  k.m(svG('fb_t',()=>new THREE.BoxGeometry(2.6,.16,1.1)),M.wood,0,1.0,0);k.m(svG('fb_t2',()=>new THREE.BoxGeometry(2.7,.06,1.2)),M.wood2,0,.92,0);
  [[-1.15,-.42],[1.15,-.42],[-1.15,.42],[1.15,.42]].forEach(([x,z])=>k.m(svG('fb_l',()=>new THREE.BoxGeometry(.16,.92,.16)),M.wood2,x,.46,z));
  k.m(svG('fb_sh',()=>new THREE.BoxGeometry(2.4,.06,.9)),M.wood2,0,.32,0);
  // the vise, a hammer, tongs, a file, scrap
  k.m(svG('fb_v',()=>new THREE.BoxGeometry(.24,.2,.2)),M.iron,1.0,1.18,.36);k.m(svG('fb_vs',()=>new THREE.CylinderGeometry(.02,.02,.4,5)),M.iron,1.0,1.18,.58,Math.PI/2,0,0);
  k.m(svG('fb_hh',()=>new THREE.CylinderGeometry(.025,.025,.42,5)),M.wood2,-.7,1.1,.25,0,0,Math.PI/2);k.m(svG('fb_hd',()=>new THREE.BoxGeometry(.1,.12,.16)),M.iron2,-.9,1.12,.25);
  k.m(svG('fb_tg',()=>new THREE.BoxGeometry(.5,.025,.04)),M.iron,-.3,1.1,-.3,0,.4,0);k.m(svG('fb_tg2',()=>new THREE.BoxGeometry(.5,.025,.04)),M.iron,-.3,1.1,-.26,0,.5,0);
  for(let i=0;i<5;i++)k.m(svG('fb_sc',()=>new THREE.BoxGeometry(.12,.03,.08)),i%2?M.brass:M.iron,-.2+rn()*.8,1.1,-.4+rn()*.3,0,rn()*3,0);
  // the rack at the back with hanging tools, a lantern hook
  [-1,1].forEach(s=>k.m(svG('fb_r',()=>new THREE.BoxGeometry(.1,1.6,.1)),M.wood2,s*1.2,1.8,-.62));k.m(svG('fb_rb',()=>new THREE.BoxGeometry(2.5,.1,.1)),M.wood2,0,2.55,-.62);
  for(let i=0;i<4;i++)k.m(svG('fb_ht',()=>new THREE.BoxGeometry(.05,.5,.05)),M.iron,-.8+i*.5,2.2,-.6,0,0,(i%2?.1:-.1));
  // an anvil on a stump, a brazier of glowing coals on iron legs, crates
  k.m(svG('fb_st',()=>new THREE.CylinderGeometry(.35,.42,.7,8)),M.wood2,-2.0,.35,.4);k.m(svG('fb_an',()=>new THREE.BoxGeometry(.6,.25,.28)),M.iron2,-2.0,.82,.4);k.m(svG('fb_ah',()=>new THREE.ConeGeometry(.12,.32,4)),M.iron2,-2.4,.86,.4,0,0,Math.PI/2);
  k.m(svG('fb_br',()=>new THREE.CylinderGeometry(.42,.28,.3,10,1,true)),M.iron,2.0,1.0,.5);for(let i=0;i<3;i++){const a=i/3*6.283;k.m(svG('fb_bl',()=>new THREE.CylinderGeometry(.03,.03,.9,4)),M.iron,2.0+Math.sin(a)*.3,.45,.5+Math.cos(a)*.3,Math.cos(a)*.2,0,-Math.sin(a)*.2)}
  for(let i=0;i<7;i++)k.lump(7,1631+i,M.coal,2.0+(rn()-.5)*.5,1.08,.5+(rn()-.5)*.5,.1,.07,.1,rn()*3,.3);
  k.m(svG('fb_cr',()=>new THREE.BoxGeometry(.7,.6,.6)),M.wood,-1.6,.3,-1.0,0,.3,0);k.m(svG('fb_cr2',()=>new THREE.BoxGeometry(.5,.45,.5)),M.wood2,-1.5,.82,-1.0,0,.6,0);
  k.lump(8,1638,M.snow,0,1.1,-.45,1.1,.06,.2,0,.2);
  const g=k.done();g.userData.psNo=1;const fl=kqSpr(0xff7a2a,1.3);fl.position.set(2.0,1.35,.5);g.add(fl);g.userData.fl=fl;return g}
// a salvage cache: a broken sled, a split crate, a barrel; the part sits on top under an orange beacon
function fs160Cache(i){const M=fs160Mats(),k=fs160Kit(),rn=svRng(1640+i);
  [-1,1].forEach(s=>k.m(svG('fc_ru',()=>svTube([[0,.05,-1.0],[0,.03,.6],[0,.25,.95]],.04,5)),M.iron,s*.5,0,0));
  k.m(svG('fc_bd',()=>new THREE.BoxGeometry(1.2,.08,1.6)),M.wood,0,.32,0,0,0,.08);for(let q=0;q<4;q++)k.m(svG('fc_bp',()=>new THREE.BoxGeometry(.06,.3,.06)),M.wood2,(q%2?.55:-.55),.18,q<2?-.6:.6);
  k.m(svG('fc_cr',()=>new THREE.BoxGeometry(.6,.5,.6)),M.wood,.1,.62,-.3,0,.3,.05);k.m(svG('fc_cr2',()=>new THREE.BoxGeometry(.5,.08,.6)),M.wood2,.75,.06,.6,0,.9,.3);
  k.m(svG('fc_ba',()=>new THREE.CylinderGeometry(.26,.24,.6,10)),M.wood2,-.9,.3,.8,0,0,1.4);k.m(svG('fc_bb',()=>new THREE.TorusGeometry(.26,.02,4,12)),M.iron,-.9,.3,.6,0,Math.PI/2,0);
  k.lump(9,1645+i,M.snow,.0,.42,.4,.6,.08,.5,0,.2);k.lump(10,1648+i,M.snow,-.4,.05,-.9,.9,.12,.6,0,.25);
  fs160PartModel(i,k,{x:.1,y:1.07,z:-.3});
  const g=k.done();g.userData.psNo=1;
  const bc=new THREE.Mesh(svG('fc_bm',()=>{const q=new THREE.CylinderGeometry(.22,.4,26,10,1,true);q.translate(0,13,0);return q}),new THREE.MeshBasicMaterial({color:0xff9a3a,map:SPR,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  bc.position.y=1;bc.userData.lpsSkip=1;bc.renderOrder=20;g.add(bc);const gl=kqSpr(0xff9a3a,1.1);gl.material=gl.material.clone();gl.position.set(.1,1.1,-.3);g.add(gl);
  g.userData.bc=bc;g.userData.gl=gl;return g}
KQSH151.fgate=()=>fs160Gate().g;KQSH151.fbench=()=>{const g=fs160Bench(),s=fs160Spitter();s.position.set(0,1.25,0);s.rotation.y=Math.PI/2;s.scale.setScalar(1.25);g.add(s);return g};
KQSH151.fspitter=()=>{const g=fs160Spitter();g.scale.setScalar(2);return g};KQSH151.fcache=()=>fs160Cache(0);

// ---------------- the world: build, sync ----------------
function mq160Build(){if(MQ160.S)return MQ160.S;const R=mq160Plan(),G=R.gate,S={cache:[]};MQ160.S=S;
  const gt=fs160Gate();gt.g.position.set(G.x,GH(G.x,G.z),G.z);gt.g.rotation.y=G.ry;scene.add(gt.g);S.gate=gt;
  S.iceT=MQ160.iceT||[];
  S.bench=fs160Bench();const B=R.bench;S.bench.position.set(B.x,GH(B.x,B.z),B.z);S.bench.rotation.y=B.ry;scene.add(S.bench);
  S.blt=new THREE.PointLight(0xff8a3a,1.1,8,1.6);S.blt.position.set(B.x+G.sx*2,GH(B.x,B.z)+1.6,B.z+G.sz*2);scene.add(S.blt);
  R.cache.forEach((c,i)=>{const g=fs160Cache(i);g.position.set(c.x,GH(c.x,c.z),c.z);g.rotation.y=c.ry;scene.add(g);S.cache.push({g,x:c.x,z:c.z,i})});
  S.sp=fs160Spitter();S.sp.scale.setScalar(1.25);scene.add(S.sp);
  try{const r=RPORT.find(q=>q.k=='next'&&q.ig===insG(2,1));if(r){r.g.visible=false;MQ160.rp=r}}catch(_){}
  mq160Sync();return S}
function mq160BenchSpot(){const R=mq160Plan(),B=R.bench,G=R.gate;return new THREE.Vector3(B.x,GH(B.x,B.z)+1.25,B.z)}
// where the flamespitter is: carried (on the hero), on the ground (dropped in the yard), on the bench, or nowhere (not assembled)
function mq160Sync(){const S=MQ160.S;if(!S)return;const E=MQ160.E,open=MQ160.st>=3||mq160Done();
  S.iceT.forEach(k=>{if(open)CBLK.delete(k);else CBLK.add(k)});S.gate.ice.visible=!open;S.gate.glow.material.opacity=open?.5:0;
  S.cache.forEach(c=>{c.g.visible=!MQ160.p[c.i]||false;c.g.userData.gl.visible=!MQ160.p[c.i];c.g.userData.bc.visible=!MQ160.p[c.i]});
  const sp=S.sp;if(E&&E.carry){if(sp.parent!==pl){pl.add(sp);sp.position.set(0,.66,.18);sp.rotation.set(0,0,0);sp.scale.setScalar(1/(pl.scale.x||1))}}
  else{if(sp.parent!==scene)scene.add(sp);sp.scale.setScalar(1.25);
    if(E&&E.gp){sp.position.copy(E.gp);sp.rotation.set(0,E.gry||0,.35)}else{const b=mq160BenchSpot(),R=mq160Plan();sp.position.copy(b);sp.rotation.set(0,R.bench.ry+Math.PI/2,0)}}
  sp.visible=MQ160.st>=2&&!open||!!E;
  if(!E)S.gate.ice.scale.set(1,1,1)}

// ---------------- the guards and the parts ----------------
function mq160Guard(i){const R=mq160Plan(),c=R.cache[i],P=MQ160.parts[i];let e=null;
  try{e=spawnEnemy(P.g,c.x+Math.sin(c.ry)*2.4,c.z+Math.cos(c.ry)*2.4,MQ160.gl,{al:1})}catch(err){console.error('v151 guard',err)}
  if(!e)return null;e.fs160g=i;e.wx=c.x;e.wz=c.z;e.ev=1;e.c.n=(e.trait?e.trait+' ':'')+'Warden of the '+P.n;MQ160['g'+i]=e;
  svDecal(new THREE.Vector3(e.m.position.x,0,e.m.position.z),0x2a3a5a,1.4,2,.6);return e}
function mq160Take(i){if(MQ160.p[i])return;MQ160.p[i]=1;MQ160.trkK='';const P=MQ160.parts[i],c=MQ160.S&&MQ160.S.cache[i];
  if(c){burst(new THREE.Vector3(c.x,GH(c.x,c.z)+1.1,c.z),0xffa040,40,2,2,.8);svShock(new THREE.Vector3(c.x,0,c.z),0xffa040,3,.4)}
  try{mSfx('rare');sfx('chime')}catch(_){}try{pickup({ic:P.ic,t:P.n,col:'#ffb060',sub:'A part of the essence-charged flamespitter ('+mq160N()+'/3)',r:4})}catch(_){}
  if(mq160N()>=3&&MQ160.st<1)MQ160.st=1;mq160Sync();
  say(mq160N()>=3?'🔧 You have every part. Assemble the flamespitter at the workbench beside the frozen gate.':'🔧 '+P.n+' recovered ('+mq160N()+'/3).')}
function mq160Assemble(){if(MQ160.st!==1)return;MQ160.st=2;MQ160.trkK='';const S=MQ160.S,b=mq160BenchSpot();mq160Sync();
  burst(b,0xffa040,60,2,2,.8);svShock(new THREE.Vector3(b.x,0,b.z),0xffd080,3,.5);svSnd('heavy',.8,1.6);setTimeout(()=>svSnd('heavy',.7,1.8),250);setTimeout(()=>{svSnd('charge',.8,1.2);burst(b,0x6ad8ff,30,1,1.5,.6)},600);
  try{zt116Show(ZT116.Z[2],'Burningeye Summit · Main Quest','The Flamespitter','Essence core, ember nozzle and bellows tank, bolted into one','F at the bench to begin melting the gate','z2')}catch(_){}
  say('🔥 The essence-charged flamespitter is assembled. When you are ready, F at the bench to begin melting the frozen gate: once it starts there is no turning back.')}

// ---------------- the melt (the special event) ----------------
function mq160Start(){if(MQ160.E||MQ160.st!==2)return;const R=mq160Plan();
  if(riding)try{dismount()}catch(_){}
  MQ160.E={t:0,melt:0,heat:0,ovh:0,charge:MQ160.charge,carry:0,fire:0,spT:3,live:[],kills:0,burned:0,gp:null,gry:0,hint:0};MQ160.trkK='';mq160Sync();
  shake(.2);svSnd('charge',1,.6);svShock(new THREE.Vector3(R.yard.x,0,R.yard.z),0xffa040,MQ160.leash,.8);
  try{zt116Show(ZT116.Z[2],'The Frozen Gate','Melt the Gate','The ice cracks and the spiders wake','C picks up the flamespitter · hold left click to spray','z2')}catch(_){}
  say('🔥 The melt begins! Pick up the flamespitter (C), hold the left mouse button on the gate. It overheats after 5 s: drop it (C) and fight while it cools.');fs160Hud()}
function mq160Fail(why){const E=MQ160.E;if(!E)return;MQ160.E=null;MQ160.trkK='';
  enemies.slice().forEach(e=>{if(e.fs160sp&&!e.dead){burst(gY(e.m.position,.4),0xbfe8ff,14,1.4,1.2,.6);try{removeE(e)}catch(_){}}});
  mq160Sync();const S=MQ160.S;if(S){S.gate.ice.scale.set(1,1,1);S.gate.pud.scale.set(.01,1,.01);S.gate.hot.material.opacity=0}fs160Hud();svSnd('crack',1,.6);
  say(why==='dead'?'🧊 You fall, and the gate freezes over again. The flamespitter is back on the bench: try again.':'🧊 The gate freezes over again.')}
function mq160Win(){const E=MQ160.E;MQ160.E=null;MQ160.st=3;MQ160.trkK='';const S=MQ160.S,R=mq160Plan(),G=R.gate,p=new THREE.Vector3(G.x+G.fx*.5,0,G.z+G.fz*.5);
  enemies.slice().forEach(e=>{if(e.fs160sp&&!e.dead){burst(gY(e.m.position,.4),0xbfe8ff,14,1.4,1.2,.6);try{removeE(e)}catch(_){}}});
  try{sk146Debris(gY(p,3),fs160Mats().ice,24,.32,7,8,1.8)}catch(_){}burst(gY(p,3),0xd8f4ff,120,4,4,1.1);svShock(p,0xbfe8ff,8,.8);shake(.5);svSnd('crack',1.4,.5);svSnd('bell',1,.8);
  mq160Sync();fs160Hud();
  setTimeout(()=>{try{zt116Show(ZT116.Z[2],'Burningeye Summit · Main Quest','The Gate Is Open','The ancient ice bursts from the gate','The road to '+mq160Next()+' lies beyond','z2');mSfx('victory')}catch(_){}
    say('🔥 The frozen gate is melted through. The road to '+mq160Next()+' lies beyond it.')},700)}
// the flamespitter: picked up, dropped
function mq160Carry(on){const E=MQ160.E;if(!E)return;if(on){E.carry=1;E.gp=null;svSnd('heavy',.6,1.5);try{if(tgt)setTarget(null)}catch(_){}}
  else{E.carry=0;E.fire=0;const f=V(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y));E.gp=new THREE.Vector3(pl.position.x+f.x*.7,GH(pl.position.x+f.x*.7,pl.position.z+f.z*.7)+.18,pl.position.z+f.z*.7);E.gry=pl.rotation.y+Math.PI/2;svSnd('heavy',.6,1.3)}
  mq160Sync();fs160Hud()}
function mq160NearSpit(){const E=MQ160.E;if(!E||E.carry)return false;const p=E.gp||mq160BenchSpot();return Math.hypot(pl.position.x-p.x,pl.position.z-p.z)<2.4}
function mq160Toggle(){const E=MQ160.E;if(!E)return false;if(E.carry){mq160Carry(false);return true}if(mq160NearSpit()){mq160Carry(true);return true}say('🔥 The flamespitter is out of reach: walk over to it to pick it up.');return true}
// the aim: the mouse on the ground (or the facing)
function fs160Aim(){try{if(typeof orb!='undefined'&&orb)return camFwd().setY(0).normalize()}catch(_){}const f=V(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y));
  if(typeof mOn=='undefined'||!mOn)return f;const d=V().subVectors(mg,pl.position);d.y=0;return d.lengthSq()>.05?d.normalize():f}
function fs160Flame(d,live){const S=MQ160.S,tip=S&&S.sp.userData.tip;if(!tip)return;const p=new THREE.Vector3();tip.getWorldPosition(p);
  if(!FS160.fl){const g=svG('fs_flc',()=>{const q=new THREE.ConeGeometry(1,1,10,1,true);q.translate(0,-.5,0);q.rotateX(-Math.PI/2);return q});
    FS160.fl=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xff7a1a,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));FS160.fl.userData.lpsSkip=1;FS160.fl.renderOrder=22;scene.add(FS160.fl);
    FS160.fl2=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xffd07a,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));FS160.fl2.userData.lpsSkip=1;FS160.fl2.renderOrder=23;scene.add(FS160.fl2)}
  const F=FS160.fl,F2=FS160.fl2;F.visible=F2.visible=!!live;if(!live)return;const t=nowP()/1000,L=5.6+.5*Math.sin(t*23);
  F.position.copy(p);F.lookAt(p.clone().add(d));F.scale.set(1.25+.2*Math.sin(t*31),1.0+.2*Math.cos(t*27),L);F2.position.copy(p);F2.lookAt(p.clone().add(d));F2.scale.set(.5,.45,L*.6);
  F.material.opacity=.36+.12*Math.sin(t*41);F2.material.opacity=.42+.12*Math.cos(t*37);for(let k=0;k<5;k++){const u=Math.random(),q=p.clone().addScaledVector(d,.4+u*L*.95);q.x+=(Math.random()-.5)*(.2+u*1.4);q.z+=(Math.random()-.5)*(.2+u*1.4);q.y+=(Math.random()-.3)*(.2+u*.8);burst(q,k%3?0xff6a1a:0xffd07a,1,.5+u,.9,.3+u*.2)}}
function mq160ETick(dt,now){const E=MQ160.E,R=mq160Plan(),G=R.gate,S=MQ160.S;if(!E||!S)return;E.t+=dt;
  if(hero.hp<=0||!mq160In2())return mq160Fail(hero.hp<=0?'dead':'left');
  // held in the gate yard
  {const p=pl.position,dx=p.x-R.yard.x,dz=p.z-R.yard.z,d=Math.hypot(dx,dz);if(d>MQ160.leash){p.x=R.yard.x+dx/d*MQ160.leash;p.z=R.yard.z+dz/d*MQ160.leash;if(now-(E.lw||0)>2500){E.lw=now;say('🧊 The cold holds you in the gate yard: melt the gate!')}}}
  // carrying: slower, no swings or spells (see the swing / cast wrappers)
  if(E.carry)dqDebuff('Hauling the flamespitter','🔥',{mspd:-.15},400,'Carrying the flamespitter: −15% move speed, no attacks or spells');
  // spraying
  const want=E.carry&&!E.ovh&&typeof atkHeld!='undefined'&&atkHeld&&!(typeof uiOpen=='function'&&uiOpen());
  if(want){E.fire=1;E.heat=Math.min(1,E.heat+dt/MQ160.heatT);if(E.heat>=1){E.ovh=1;E.fire=0;svSnd('hiss',1.1,.7);popT(pl.position,'OVERHEATED','#ff7a3a',true);say('♨️ The flamespitter has overheated! Drop it (C) and fight while it cools.')}}
  else{E.fire=0;E.heat=Math.max(0,E.heat-dt/MQ160.coolT);if(E.ovh&&E.heat<=0){E.ovh=0;svSnd('bell',.5,1.6);dn(pl.position,'Cooled','#ffd080',-30,900)}}
  const d=fs160Aim();if(E.fire){face(d);fs160Flame(d,true);if(Math.random()<dt*6)svSnd('whoosh',.35,.6+Math.random()*.2)}else fs160Flame(d,false);
  if(E.carry&&E.ovh&&Math.random()<dt*10){const tip=new THREE.Vector3();S.sp.userData.tip.getWorldPosition(tip);burst(tip,0xd8d8d8,1,.3,1.2,.8)}
  // the flame on the gate melts it
  const gp=new THREE.Vector3(G.x+G.fx*.9,0,G.z+G.fz*.9);let onGate=false;
  if(E.fire){const hx=gp.x-pl.position.x,hz=gp.z-pl.position.z,hd=Math.hypot(hx,hz),ca=(hx*d.x+hz*d.z)/(hd||1);if(hd<7.4&&(ca>.82||hd<2.2)){onGate=true;E.melt=Math.min(MQ160.melt,E.melt+dt);MQ160.trkK=''}}
  {const k=E.melt/MQ160.melt,ice=S.gate.ice;ice.scale.set(1-.12*k,Math.max(.05,1-.85*k),1-.35*k);S.gate.pud.scale.set(.5+3.2*k,1,.4+1.4*k);
    const hot=S.gate.hot;hot.material.opacity=onGate?.7+.2*Math.sin(now/40):Math.max(0,hot.material.opacity-dt*2);if(onGate){const y=Math.max(.6,6*Math.max(.05,1-.85*k)*.55);hot.position.set((Math.random()-.5)*.2,y,1.0);
      if(Math.random()<dt*20){const w=new THREE.Vector3();hot.getWorldPosition(w);burst(w,0xf0f4f8,1,.5,1.6,1.1);burst(w,0x8ad0ff,1,.4,-1.2,.6)}if(Math.random()<dt*2)svSnd('hiss',.5,1.3)}}
  // the flame burns spiders: each kill spends essence charge
  if(E.fire){const R2=6.2;for(const e of enemies){if(!e.fs160sp||e.dead)continue;const hx=e.m.position.x-pl.position.x,hz=e.m.position.z-pl.position.z,hd=Math.hypot(hx,hz);if(hd>R2)continue;const ca=(hx*d.x+hz*d.z)/(hd||1);if(ca<.86&&hd>1.4)continue;
    if(E.charge>=MQ160.kc){E.charge-=MQ160.kc;E.burned++;burst(gY(e.m.position,.4),0xff8a2a,24,1.8,2,.6);try{hurt(e,1e9,{col:'#ff9a3a'},false)}catch(_){}if(!e.dead)try{removeE(e)}catch(_){}}
    else if(!E.spent){E.spent=1;popT(pl.position,'CHARGE SPENT','#ffb060',true);say('💠 The essence charge is spent: the flame still melts the gate, but it will not kill spiders any more.')}}}
  // ice spiders: from all round the yard, all the time, faster as the melt goes on; always at you
  E.spT-=dt;const live=enemies.filter(e=>e.fs160sp&&!e.dead).length;
  if(E.spT<=0){const k=E.melt/MQ160.melt;E.spT=Math.max(.9,2.5-k*1.4-E.t*.004);let n=1+(Math.random()<.25+k*.5?1:0)+(k>.6&&Math.random()<.35?1:0);n=Math.min(n,16-live);
    for(let i=0;i<n;i++){let x=0,z=0,okp=false;for(let tr=0;tr<14&&!okp;tr++){const a=Math.random()*6.283,r=15+Math.random()*4,qx=R.yard.x+Math.sin(a)*r,qz=R.yard.z+Math.cos(a)*r;
        if((Math.sin(a)*G.fx+Math.cos(a)*G.fz)<-.3)continue;if(R.ok(qx,qz,.4)&&!solid(Math.round(qx),Math.round(qz))&&Math.hypot(qx-pl.position.x,qz-pl.position.z)>8){x=qx;z=qz;okp=true}}
      if(!okp)continue;let e=null;try{e=spawnEnemy('icespider',x,z,MQ160.lv,{agg:1,minion:1})}catch(err){console.error('v151 spider',err)}
      if(!e)continue;e.fs160sp=1;e.hunt=1;e.agg=1;e.wx=pl.position.x;e.wz=pl.position.z;e.m.rotation.y=Math.atan2(pl.position.x-x,pl.position.z-z);
      const p=new THREE.Vector3(x,0,z);svDecal(p,0x8ab8d8,1.1,2,.6);burst(gY(p,.3),0xd8f4ff,14,1.2,1.6,.7);svSpike(p,gb151IceMat(),.7,.2,.6,.4)}}
  if(E.melt>=MQ160.melt)mq160Win();
  if(now-(E.hu||0)>120){E.hu=now;fs160Hud()}}
// no swings or spells while carrying; C toggles the flamespitter during the melt (instead of the Character window)
{const f=swing;swing=function(){if(MQ160.E&&MQ160.E.carry)return;return f.apply(this,arguments)}}
{const f=cast;cast=function(){if(MQ160.E&&MQ160.E.carry){if(nowP()-(FS160.ct||0)>1500){FS160.ct=nowP();say('🔥 Drop the flamespitter (C) to use your abilities.')}return}return f.apply(this,arguments)}}
{const f=openTal;openTal=function(){if(MQ160.E&&$('tal').classList.contains('hide')){mq160Toggle();return}return f.apply(this,arguments)}}
{const f=doRecall;doRecall=function(){if(MQ160.E)return say('🧊 The cold holds you in the gate yard. Melt the gate, or fall trying.');return f.apply(this,arguments)}}
{const f=toggleMount;toggleMount=function(){if(MQ160.E)return say('🧊 No mount will come into the gate yard now.');return f.apply(this,arguments)}}
// the hero's hands on the grips while carrying (arm IK after every animation layer); the held weapon is put away
function fs160Hold(){const E=MQ160.E,S=MQ160.S;const G=pl._grip;const on=!!(E&&E.carry&&S&&S.sp.parent===pl);
  if(G&&G.L)G.L.forEach(q=>{if(q.W){if(on){if(q.W.userData.fs160v==null)q.W.userData.fs160v=q.W.visible;q.W.visible=false}else if(q.W.userData.fs160v!=null){q.W.visible=q.W.userData.fs160v;q.W.userData.fs160v=null}}});
  if(!on)return;const b=pl.bones;if(!b||!b.aR0||!b.aR1||!b.aR2||!b.aL0||!b.aL1||!b.aL2||typeof fc116IK!='function')return;
  pl.updateMatrixWorld(true);const V3=THREE.Vector3,sp=S.sp,gR=sp.userData.gR.getWorldPosition(new V3()),gL=sp.userData.gL.getWorldPosition(new V3());
  const sR=b.aR0.getWorldPosition(new V3()),sL=b.aL0.getWorldPosition(new V3()),rt=new V3(sR.x-sL.x,0,sR.z-sL.z).normalize(),dn=new V3(0,-1,0);
  fc116IK(sR,b.aR0,b.aR1,b.aR2,gR,rt.clone().multiplyScalar(.7).add(dn),1);fc116IK(sL,b.aL0,b.aL1,b.aL2,gL,rt.clone().multiplyScalar(-.7).add(dn),1)}
{const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);try{if(!h||h===pl)fs160Hold()}catch(e){if(!FS160.he){FS160.he=1;console.warn('v151 hold',e)}}return r}}
// ---------------- the event HUD ----------------
(function(){const st=document.createElement('style');st.textContent=`
#fs160{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:7;width:300px;max-width:70vw;pointer-events:none;padding:6px 10px 7px;border-radius:8px;
  background:linear-gradient(180deg,rgba(12,20,34,.86),rgba(8,12,22,.9));border:1px solid rgba(140,200,255,.35);box-shadow:0 4px 18px rgba(0,0,0,.5);font:12px/1.35 system-ui,sans-serif;color:#d8e8f4}
#fs160.hide{display:none}#fs160 .t{font-family:Cinzel,Georgia,serif;letter-spacing:.12em;font-size:10px;text-transform:uppercase;color:#8ac8e8;display:flex;justify-content:space-between}
#fs160 .bar{height:6px;margin:2px 0 4px;background:rgba(0,0,0,.55);border-radius:3px;overflow:hidden;border:1px solid rgba(255,255,255,.08)}#fs160 .bar i{display:block;height:100%}
#fs160 .m i{background:linear-gradient(90deg,#5ab8ff,#d8f4ff)}#fs160 .h i{background:linear-gradient(90deg,#ffb040,#ff4a1a)}#fs160 .h.ov i{background:#ff2a1a;animation:fs160b .4s infinite alternate}
#fs160 .c i{background:linear-gradient(90deg,#ff8a2a,#ffd07a)}#fs160 .k{color:#9ab0c4;font-size:11px;margin-top:2px}#fs160 b{color:#fff}
@keyframes fs160b{from{opacity:.45}to{opacity:1}}`;document.head.appendChild(st)})();
function fs160Hud(){let el=document.getElementById('fs160');const E=MQ160.E;if(!E){if(el)el.classList.add('hide');return}
  if(!el){el=document.createElement('div');el.id='fs160';($('stage')||document.body).appendChild(el)}el.classList.remove('hide');
  const m=E.melt/MQ160.melt,live=enemies.filter(e=>e.fs160sp&&!e.dead).length;
  el.innerHTML=`<div class="t"><span>🔥 Melting the Frozen Gate</span><span>${Math.round(m*100)}%</span></div><div class="bar m"><i style="width:${(m*100).toFixed(1)}%"></i></div>
  <div class="t"><span>${E.ovh?'♨️ Overheated · cooling':'Heat'}</span><span>${E.carry?(E.fire?'spraying':'held'):'on the ground'}</span></div><div class="bar h${E.ovh?' ov':''}"><i style="width:${(E.heat*100).toFixed(1)}%"></i></div>
  <div class="t"><span>💠 Essence charge</span><span>${Math.round(E.charge)}</span></div><div class="bar c"><i style="width:${(E.charge/MQ160.charge*100).toFixed(1)}%"></i></div>
  <div class="k"><b>C</b> ${E.carry?'drop':'pick up'} the flamespitter · <b>hold left click</b> to spray · ice spiders: <b>${live}</b></div>`}

// ---------------- prompts ----------------
function mq160Prompt(){if(!mq160In2()||!MQ160.S)return null;const P=pl.position,R=mq160Plan(),E=MQ160.E;
  if(E){if(!E.carry&&mq160NearSpit())return {label:'C · Pick up the flamespitter',fn:()=>mq160Carry(true)};return {label:E.carry?'🔥 Hold left click to spray · C to drop':'🔥 The melt is under way',fn:()=>{if(E.carry)mq160Carry(false)}}}
  for(const c of MQ160.S.cache){if(MQ160.p[c.i])continue;if(Math.hypot(P.x-c.x,P.z-c.z)>2.8)continue;const g=MQ160['g'+c.i],P2=MQ160.parts[c.i];
    if(g&&!g.dead&&enemies.includes(g))return {label:'⚔️ The '+P2.n+' is guarded · defeat its warden',fn:()=>say('⚔️ Its warden will not let you take the '+P2.n+'.')};
    return {label:'F · Take the '+P2.n,fn:()=>mq160Take(c.i)}}
  const B=R.bench;if(Math.hypot(P.x-B.x,P.z-B.z)<2.9){if(MQ160.st===0){const miss=MQ160.parts.filter((q,i)=>!MQ160.p[i]).map(q=>q.n);return {label:'🔧 The workbench · flamespitter parts '+mq160N()+'/3',fn:()=>say('🔧 Still missing: '+miss.join(', ')+'. Look for the orange beacons around '+PMAP[2].ins[1].n+'.')}}
    if(MQ160.st===1)return {label:'F · Assemble the flamespitter',fn:()=>mq160Assemble()};if(MQ160.st===2)return {label:'F · Begin melting the frozen gate (no turning back)',fn:()=>mq160Start()}}
  const G=R.gate;if(Math.hypot(P.x-(G.x+G.fx*2),P.z-(G.z+G.fz*2))<3.2){if(mq160Done())return {label:'F · Through the gate to '+mq160Next(),fn:()=>mq160Through()};
    if(MQ160.st===2)return {label:'F · Begin melting the frozen gate (no turning back)',fn:()=>mq160Start()};return {label:'🔒 A wall of ancient ice seals the gate',fn:()=>say('🧊 Ancient ice fills the gate. Something hot enough could melt it: the workbench beside it has plans for a flamespitter ('+mq160N()+'/3 parts).')}}
  return null}
function mq160Through(){MQ160.st=3;MQ160.trkK='';try{insGo(PMAP[2].ins[2])}catch(err){console.error('v151 gate',err)}}
{const f=worldPrompt;worldPrompt=function(){try{const r=mq160Prompt();if(r)return r}catch(e){if(!MQ160.err++)console.warn('v151 gate prompt',e)}return f.apply(this,arguments)}}
{const f=portalPrompt;portalPrompt=function(){try{if(mq160In2()&&MQ160.S){const R=mq160Plan(),G=R.gate,P=pl.position;if(MQ160.E||Math.hypot(P.x-G.x,P.z-G.z)<4)return null}}catch(_){}return f.apply(this,arguments)}}
// ---------------- the world tick ----------------
function mq160Tick(dt,now){const in2=mq160In2(),t=now/1000;
  if(in2&&!MQ160.S)try{mq160Build()}catch(err){console.error('v151 gate build',err);MQ160.err++}
  const S=MQ160.S;if(!S)return;[S.gate.g,S.bench,S.sp].forEach(o=>{if(o.parent===scene)o.visible=in2&&(o!==S.sp||MQ160.st>=2&&!mq160Done()||!!MQ160.E)});S.cache.forEach(c=>c.g.visible=in2&&!MQ160.p[c.i]);S.blt.intensity=in2?1.1+.25*Math.sin(t*7)+.15*Math.sin(t*13):0;
  if(in2){const P=pl.position;
    // the caches: found when you come close, their warden rises; the beacons pulse
    S.cache.forEach(c=>{if(MQ160.p[c.i])return;const d=Math.hypot(P.x-c.x,P.z-c.z);c.g.userData.bc.material.opacity=.1+.04*Math.sin(t*1.5+c.i);c.g.userData.gl.scale.setScalar(1.1*(1+.12*Math.sin(t*3+c.i)));
      if(d<MQ160.see){if(!MQ160.fd[c.i]){MQ160.fd[c.i]=1;MQ160.trkK='';try{zt116Show(ZT116.Z[2],'Burningeye Summit · Main Quest','A Salvage Cache','The '+MQ160.parts[c.i].n+' lies here, and something guards it','Defeat its warden, then take the part','z2')}catch(_){}}
        const g=MQ160['g'+c.i];if(!MQ160.gk[c.i]&&!(g&&!g.dead&&enemies.includes(g)))mq160Guard(c.i)}});
    // the gate: steam off the ice while it melts, the open road glows
    if(mq160Done()){S.gate.glow.material.opacity=.45+.1*Math.sin(t*2);if(Math.random()<dt*4){const R=mq160Plan(),G=R.gate;burst(new THREE.Vector3(G.x+(Math.random()-.5)*4,GH(G.x,G.z)+1+Math.random()*4,G.z),0x9ad8ff,1,.2,.6,1)}}
    S.bench.userData.fl.scale.setScalar(1.2+.3*Math.sin(t*11));if(S.sp.userData.pil)S.sp.userData.pil.visible=!!MQ160.E}
  if(MQ160.E)try{mq160ETick(dt,now)}catch(err){if(!MQ160.err++)console.error('v151 melt',err)}
  if(now-MQ160.t>400){MQ160.t=now;try{if(in2)mq143Trk()}catch(_){}}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{mq160Tick(dt,now)}catch(err){if(!MQ160.err++)console.warn('v151 gate tick',err)}return r}}
// a guard's death frees its part
{const f=kill;kill=function(e){const r=f.apply(this,arguments);try{if(e&&e.fs160g!=null){MQ160.gk[e.fs160g]=1;MQ160.trkK='';const P=MQ160.parts[e.fs160g];setTimeout(()=>say('🔧 The warden falls. Take the '+P.n+' from the cache.'),600)}}catch(_){}return r}}
// ---------------- the tracker (chapter 2 in the main-quest box, in Burningeye II) ----------------
{const f=mq143Trk;mq143Trk=function(){try{if(mq160In2()){MQ143.trkK='';return mq160Trk()}}catch(err){if(!MQ160.err++)console.warn('v151 gate trk',err)}MQ160.trkK='';return f.apply(this,arguments)}}
function mq160Trk(){const el=$('mqt143');if(!el)return;const hide=(typeof uiOpen=='function'&&uiOpen())||(mq160Done()&&insReach(2)>=2),E=MQ160.E;
  const key=(hide?'h':'s')+MQ160.st+'|'+MQ160.p.join('')+MQ160.gk.join('')+MQ160.fd.join('')+'|'+(E?Math.round(E.melt):'-')+mq160Done();if(key===MQ160.trkK)return;MQ160.trkK=key;
  if(hide){el.classList.add('hide');mq143TrkPos();return}
  const o=(a,b,d)=>`<div class="o${d?' d':''}"><span>${a}</span>${b!=null?'<b>'+b+'</b>':''}</div>`;let h='<div class="k">⚜ Main quest · Burningeye Summit</div><div class="h">'+MQ160.name+'</div>';
  if(mq160Done())h+=o('Go through the gate to '+mq160Next(),null,1);
  else if(E)h+=o('Melt the gate with the flamespitter',Math.round(E.melt/MQ160.melt*100)+'%');
  else if(MQ160.st===2)h+=o('Begin the melt at the workbench');
  else if(MQ160.st===1)h+=o('Assemble the flamespitter at the workbench');
  else{h+=o('Recover the flamespitter parts',mq160N()+'/3');MQ160.parts.forEach((P,i)=>{h+=o((MQ160.p[i]?'✓ ':MQ160.fd[i]?'• ':'· ')+P.n+(MQ160.p[i]?'':MQ160.fd[i]?(MQ160.gk[i]?' (unguarded)':' (guarded)'):''),null,MQ160.p[i])});if(MQ160.fd.filter(Boolean).length<3)h+=o('Look for the orange beacons')}
  el.innerHTML=h;el.classList.add('z2');el.classList.remove('hide');mq143TrkPos()}
// ---------------- the minimap and the N map: caches, the workbench ----------------
function mq160Marks(g,P,k){if(!mq160In2())return;const R=mq160Plan();R.cache.forEach((c,i)=>{if(!MQ160.fd[i]||MQ160.p[i])return;const q=P(c.x,c.z);if(!q)return;g.save();g.translate(q[0],q[1]);g.scale(k,k);
    g.beginPath();g.rect(-4,-4,8,8);g.fillStyle='#2a1a0c';g.fill();g.lineWidth=1.6/k;g.strokeStyle='#ffa040';g.stroke();g.beginPath();g.arc(0,0,1.8,0,6.283);g.fillStyle='#ffd07a';g.fill();g.restore()});
  const q=P(R.bench.x,R.bench.z);if(q){g.save();g.translate(q[0],q[1]);g.scale(k,k);g.beginPath();g.arc(0,0,4.5,0,6.283);g.fillStyle='#1a1410';g.fill();g.lineWidth=1.6/k;g.strokeStyle='#ff8a3a';g.stroke();g.beginPath();g.moveTo(-2,2);g.lineTo(2,-2);g.strokeStyle='#ffd07a';g.stroke();g.restore()}}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{mq160Marks(mmX,(x,z)=>{const X=(x-(cx-vw/2)+.5)*w/vw,Y=(z-(cy-vh/2)+.5)*h/vh;return X<-6||Y<-6||X>w+6||Y>h+6?null:[X,Y]},1)}catch(_){}}}
{const f=openWMap;openWMap=function(){const r0=f.apply(this,arguments);try{const I=INSL[insG(2,1)];if(mq160In2()){const c=$('wmc'),g=c.getContext('2d'),k=Math.min(1060/I.w,640/I.h),T=(x,z)=>[(x-I.x0+.5)*k,(z-I.y0+.5)*k],R=mq160Plan();
  mq160Marks(g,T,1.5);g.font='700 12px system-ui,sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';
  const lab=(x,z,t,c)=>{const [X,Y]=T(x,z);g.strokeText(t,X,Y-14);g.fillStyle=c;g.fillText(t,X,Y-14)};lab(R.bench.x,R.bench.z,'Workbench','#ffb060');lab(R.gate.x,R.gate.z,mq160Done()?'Gate (open)':'Frozen Gate','#bfe8ff');
  R.cache.forEach((c,i)=>{if(MQ160.fd[i]&&!MQ160.p[i])lab(c.x,c.z,MQ160.parts[i].n,'#ffd07a')})}}catch(e){console.warn('v151 gate wmap',e)}return r0}}
// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.mq160={v:151,st:MQ160.st,p:MQ160.p.slice(),fd:MQ160.fd.slice()}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.mq160,arr=a=>[0,1,2].map(i=>a&&a[i]?1:0);if(MQ160.E)mq160Fail('left');
    MQ160.p=arr(q&&q.p);MQ160.fd=arr(q&&q.fd);MQ160.gk=MQ160.p.slice();MQ160.st=q&&typeof q=='object'?Math.max(0,Math.min(3,q.st|0)):0;if(MQ160.st<1&&mq160N()>=3)MQ160.st=1;MQ160.trkK='';
    [0,1,2].forEach(i=>{const g=MQ160['g'+i];if(g&&!g.dead)try{removeE(g)}catch(_){}MQ160['g'+i]=null});mq160Sync()}catch(err){console.warn('v151 gate load',err)}return r}}
