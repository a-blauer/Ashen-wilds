// ================= v78: Mounts are back — ten hand-built mount models, sold only at the Stable in Duskhold (build it at the Steward) =================

// ---------------- 1. the mounts ----------------
var MOUNT_OLD={dusthound:1,bogstrider:1,ashwarg:2,mossback:2,cinderlynx:3,webrunner:3,bonecharger:4,galeroc:4,nightwarg:5,obsidrake:5};
{const NEW={
  pony:{n:'Duskmane Pony',i:'🐴',t:1,d:'A shaggy little pony bred in Duskhold. Steady, cheerful and never in a hurry to stop.'},
  boar:{n:'Tuskback Boar',i:'🐗',t:1,d:'Low, wide and bristling. It charges through brush like it holds a grudge against it.'},
  stag:{n:'Gravewood Stag',i:'🦌',t:2,d:'A pale stag from the haunted woods, crowned with antlers like bare branches.'},
  ram:{n:'Ironhorn Ram',i:'🐏',t:2,d:'A woolly mountain ram with curling iron-hard horns. Sure-footed on any slope.'},
  charger:{n:'Emberhoof Charger',i:'🐎',t:3,d:'A barded warhorse whose mane smoulders with living embers.'},
  raptor:{n:'Dune Strider',i:'🦖',t:3,d:'A two-legged sand runner. Its stride eats the road in great bounds.'},
  panther:{n:'Shadowstalk Panther',i:'🐆',t:4,d:'A silent black cat with glowing eyes. You barely feel it move.'},
  destrier:{n:'Bone Destrier',i:'💀',t:4,d:'A skeletal warhorse wreathed in ghost-fire. It never tires and never blinks.'},
  direwolf:{n:'Dread Wolf',i:'🐺',t:5,d:'A huge wolf from beyond the portals, with eyes like coals and a howl that empties camps.'},
  drake:{n:'Cinderwing Drake',i:'🐲',t:5,d:'A young drake broken to the saddle. Its belly glows with banked fire.'}};
  for(const k in MOUNTS)delete MOUNTS[k];Object.assign(MOUNTS,NEW);MNTK.length=0;Object.keys(NEW).forEach(k=>MNTK.push(k))}

// ---------------- 2. mount models ----------------
function mkMountRig(k){
  const r=new THREE.Group(),b=new THREE.Group();r.add(b);r.b=b;const legs=[],sw=[];let wings=null,flame=[],tail=null,neck=null;
  const M=(c,o)=>sm(c,Object.assign({flatShading:true},o||{})),G=c=>gmat(c);
  const S={ // body length, height, width, leg (hip height), leg radius, neck length/angle, head len/w/h, colours
    pony:{L:1.35,H:.48,W:.36,leg:.58,lr:.065,nl:.55,na:.55,hl:.42,hw:.17,hh:.2,c:0x6a4a2e,c2:0x3a2618,m:0x1a120c,hoof:0x1a1410,eye:0x111111},
    boar:{L:1.3,H:.6,W:.46,leg:.38,lr:.08,nl:.2,na:1.2,hl:.46,hw:.26,hh:.3,c:0x4a3a30,c2:0x2a2018,m:0x1a1410,hoof:0x141010,eye:0xff6a2a},
    stag:{L:1.3,H:.42,W:.3,leg:.72,lr:.05,nl:.6,na:.42,hl:.38,hw:.14,hh:.17,c:0xb8ae9a,c2:0x6a6458,m:0x8a8270,hoof:0x2a2620,eye:0x9ad8ff},
    ram:{L:1.2,H:.55,W:.44,leg:.48,lr:.07,nl:.28,na:.8,hl:.34,hw:.17,hh:.2,c:0xd8ccb0,c2:0x3a3430,m:0xd8ccb0,hoof:0x1a1614,eye:0xe8c060},
    charger:{L:1.55,H:.55,W:.4,leg:.66,lr:.075,nl:.62,na:.5,hl:.46,hw:.18,hh:.22,c:0x2a1a14,c2:0x1a1010,m:0xff6a1a,hoof:0x111111,eye:0xffa040},
    raptor:{L:1.1,H:.5,W:.34,leg:.78,lr:.08,nl:.68,na:.45,hl:.56,hw:.16,hh:.2,c:0xc89a5a,c2:0x8a5a2a,m:0xd8483a,hoof:0x2a2018,eye:0xffd040},
    panther:{L:1.5,H:.42,W:.32,leg:.55,lr:.07,nl:.32,na:.95,hl:.36,hw:.2,hh:.18,c:0x18161e,c2:0x0e0c12,m:0x18161e,hoof:0x0e0c12,eye:0x8aff6a},
    destrier:{L:1.5,H:.52,W:.36,leg:.68,lr:.045,nl:.6,na:.5,hl:.46,hw:.15,hh:.2,c:0xd8d0b8,c2:0xb8ae94,m:0x6affc8,hoof:0x3a3a3a,eye:0x6affc8},
    direwolf:{L:1.55,H:.56,W:.4,leg:.66,lr:.08,nl:.42,na:.85,hl:.5,hw:.22,hh:.22,c:0x3a3636,c2:0x221f1f,m:0x4a4444,hoof:0x141212,eye:0xff2a1a},
    drake:{L:1.6,H:.56,W:.42,leg:.6,lr:.09,nl:.7,na:.6,hl:.5,hw:.2,hh:.2,c:0x3a1a24,c2:0x24101a,m:0x5a2030,hoof:0x18080e,eye:0xffb03a}
  }[k]||{};
  const L=S.L,H=S.H,Wd=S.W,leg=S.leg,top=leg+H*.95,mid=leg+H*.5,biped=k=='raptor',skel=k=='destrier';
  // torso
  if(skel){for(let i=0;i<6;i++){const z=-L*.32+i*L*.12,rr=new THREE.Mesh(new THREE.TorusGeometry(1,.09,4,10,Math.PI),M(S.c));rr.scale.set(Wd*.95,H*.5*(1-Math.abs(i-2.5)*.06),1);rr.rotation.z=Math.PI;rr.position.set(0,mid+H*.08,z);b.add(rr)}
    TQ(b,G_BOX,M(S.c),0,top-.04,0,.07,.07,L*1.05);TQ(b,G_BOX,M(S.c2),0,mid+.05,-L*.42,Wd*1.4,H*.45,.22);TQ(b,G_BOX,M(S.c2),0,mid+.1,L*.38,Wd*1.3,H*.5,.16);
    const core=TQ(b,G_OCT,G(S.m),0,mid,0,.12,.16,.12);flame.push(core)}
  else{TQ(b,G_SPH,M(S.c),0,mid,0,Wd,H*.5,L*.5);TQ(b,G_SPH,M(S.c),0,mid+H*.05,L*.28,Wd*1.04,H*.52,L*.26);TQ(b,G_SPH,M(S.c),0,mid+H*.02,-L*.3,Wd*1.02,H*.5,L*.24);
    TQ(b,G_SPH,M(S.c2),0,mid-H*.18,0,Wd*.82,H*.32,L*.42)}
  // legs
  const legAt=biped?[[-Wd*.55,-.02,0],[Wd*.55,-.02,Math.PI]]:[[-Wd*.62,L*.33,0],[Wd*.62,L*.33,Math.PI],[-Wd*.62,-L*.33,Math.PI],[Wd*.62,-L*.33,0]];
  legAt.forEach(([x,z,ph],i)=>{const hipY=leg+H*.18,u=hipY*.52,l=hipY-u,hip=new THREE.Group();hip.position.set(x,hipY,z);r.add(hip);
    TQ(hip,G_CYL,M(skel?S.c:i>1||biped?S.c:S.c),0,-u/2,0,S.lr*(biped?1.5:1.25),u,S.lr*(biped?1.6:1.3));
    const kn=new THREE.Group();kn.position.y=-u;hip.add(kn);TQ(kn,G_SPH,M(S.c2),0,0,0,S.lr*1.05,S.lr*1.05,S.lr*1.05);TQ(kn,G_CYL,M(S.c2),0,-l/2,0,S.lr*.8,l,S.lr*.8);
    if(biped){[-1,0,1].forEach(q=>TQ(kn,G_CONE,M(S.hoof),q*.06,-l+.03,.08,.03,.16,.03,1.4,0,0))}else TQ(kn,G_BOX,M(S.hoof),0,-l+.03,.02,S.lr*1.9,.07,S.lr*2.4);
    if(k=='charger'){TQ(hip,G_BOX,M(0x5a5e66,{metalness:.6,roughness:.4}),0,-u*.35,0,S.lr*2.8,u*.5,S.lr*2.8)}
    legs.push({hip,kn,ph,front:biped?i==0:i<2})});
  // neck + head
  neck=new THREE.Group();neck.position.set(0,biped?mid+H*.1:top-H*.2,biped?L*.38:L*.44);neck.rotation.x=S.na;b.add(neck);
  if(skel){TQ(neck,G_BOX,M(S.c),0,S.nl/2,0,.07,S.nl,.07);for(let i=0;i<4;i++)TQ(neck,G_BOX,M(S.c2),0,.08+i*S.nl*.22,0,.13,.05,.13)}
  else TQ(neck,G_CYL,M(S.c),0,S.nl/2,0,S.hw*.85,S.nl,S.hw*.9);
  const head=new THREE.Group();head.position.y=S.nl;head.rotation.x=-S.na+.32;neck.add(head);
  TQ(head,G_BOX,M(skel?S.c:S.c),0,0,S.hl*.25,S.hw*2,S.hh*1.2,S.hl*.6);TQ(head,G_BOX,M(skel?S.c2:S.c),0,-S.hh*.15,S.hl*.68,S.hw*1.55,S.hh*.85,S.hl*.5);
  if(k=='boar'){TQ(head,G_CYL,M(0xc89a8a),0,-S.hh*.1,S.hl*.95,S.hw*.55,.06,S.hw*.45,Math.PI/2)}
  [-1,1].forEach(s=>{TQ(head,G_BOX,G(S.eye),s*S.hw*.98,S.hh*.12,S.hl*.42,.025,.035,.05);
    if(!skel&&k!='raptor'&&k!='drake')TQ(head,G_CONE,M(S.c),s*S.hw*.62,S.hh*.75,S.hl*.02,.05,S.hh*.8,.035,-.25,0,s*.25)});
  // features
  const F=(geo,mat,x,y,z,sx,sy,sz,rx,ry,rz,p)=>TQ(p||head,geo,mat,x,y,z,sx,sy,sz,rx,ry,rz);
  if(k=='pony'||k=='charger'||k=='destrier'){for(let i=0;i<7;i++){const m=F(G_BOX,k=='pony'?M(S.m):G(S.m),0,.06+i*S.nl*.14,-S.hw*.75,.05,.12,.09+(i%2)*.03,.3,0,0,neck);if(k!='pony')flame.push(m)}}
  if(k=='boar'){[-1,1].forEach(s=>F(G_CONE,M(0xf0e8d0),s*S.hw*.7,-S.hh*.25,S.hl*.95,.035,.2,.035,-.5,0,-s*.3));for(let i=0;i<8;i++)F(G_CONE,M(S.m),0,top-.02,L*.35-i*L*.09,.05,.16+(i%2)*.06,.04,-.25,0,0,b)}
  if(k=='stag'){[-1,1].forEach(s=>{const a=new THREE.Group();a.position.set(s*S.hw*.5,S.hh*.6,S.hl*.1);a.rotation.z=-s*.35;head.add(a);
    TQ(a,G_CYL,M(0xe8e0cc),0,.22,0,.025,.44,.025);TQ(a,G_CYL,M(0xe8e0cc),s*.08,.36,.04,.02,.24,.02,0,0,-s*.8);TQ(a,G_CYL,M(0xe8e0cc),-s*.04,.32,.08,.018,.2,.018,.6,0,s*.3);TQ(a,G_CYL,M(0xe8e0cc),s*.03,.48,-.02,.018,.18,.018,-.4,0,-s*.4)})}
  if(k=='ram'){[-1,1].forEach(s=>{for(let i=0;i<7;i++){const a=i/7*Math.PI*1.6;F(G_SPH,M(0x6a6460,{metalness:.4}),s*(S.hw+.04+Math.sin(a)*.03),S.hh*.4+Math.cos(a)*.13,S.hl*.0-Math.sin(a)*.13,.055-i*.004,.055-i*.004,.055-i*.004)}});
    for(let i=0;i<9;i++)TQ(b,G_SPH,M(S.c),(i%3-1)*Wd*.55,top-.05+(i%2)*.04,-L*.32+Math.floor(i/3)*L*.3,.16,.12,.16)}
  if(k=='charger'){TQ(b,G_BOX,M(0x5a5e66,{metalness:.6,roughness:.4}),0,mid+.05,L*.38,Wd*2.25,H*.75,.3);TQ(b,G_BOX,M(0x7a1a1a),0,mid,-.05,Wd*2.15,H*.7,L*.62);
    F(G_BOX,M(0x5a5e66,{metalness:.6,roughness:.4}),0,S.hh*.25,S.hl*.45,S.hw*2.1,S.hh*.5,S.hl*.7);F(G_CONE,M(0x8a6a2a,{metalness:.6}),0,S.hh*.7,S.hl*.55,.03,.18,.03,.6,0,0)}
  if(k=='raptor'){for(let i=0;i<5;i++)F(G_CONE,M(S.m),0,S.hh*.6,S.hl*.1-i*.07,.03,.16+(i==1||i==2?.06:0),.02,-.5,0,0);
    [-1,1].forEach(s=>{const ar=new THREE.Group();ar.position.set(s*Wd*.8,mid,L*.3);ar.rotation.x=.9;b.add(ar);TQ(ar,G_CYL,M(S.c),0,-.12,0,.035,.24,.035);TQ(ar,G_CONE,M(S.hoof),0,-.26,.02,.02,.08,.02,Math.PI)})}
  if(k=='panther'||k=='direwolf'){if(k=='direwolf')for(let i=0;i<9;i++)TQ(b,G_CONE,M(S.m),(i%3-1)*.1,top+.02,L*.32-Math.floor(i/3)*.16,.07,.2,.05,-.6,0,(i%3-1)*.3);
    [-1,1].forEach(s=>F(G_CONE,M(0xe8e0d0),s*S.hw*.4,-S.hh*.45,S.hl*.85,.02,.08,.02,Math.PI))}
  if(k=='destrier'){[-1,1].forEach(s=>TQ(head,G_BOX,G(S.eye),s*S.hw*.98,S.hh*.12,S.hl*.42,.03,.05,.06))}
  if(k=='drake'){[-1,1].forEach(s=>{F(G_CONE,M(0x1a0a10),s*S.hw*.55,S.hh*.6,-S.hl*.05,.04,.3,.04,-.9,0,-s*.25);F(G_CONE,M(0x1a0a10),s*S.hw*.9,S.hh*.2,-S.hl*.05,.03,.2,.03,-1.2,0,-s*.6)});
    for(let i=0;i<9;i++)TQ(b,G_CONE,M(0x1a0a10),0,top+.02,L*.4-i*L*.1,.05,.14+(i%2)*.05,.04,-.35,0,0);
    const belly=TQ(b,G_SPH,G(0xff7a2a),0,mid-H*.3,0,Wd*.6,H*.12,L*.36);flame.push(belly);
    wings=[-1,1].map(s=>{const w=new THREE.Group();w.position.set(s*Wd*.75,top-.05,L*.18);b.add(w);const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(s*1.1,.35);sh.lineTo(s*1.25,-.05);sh.lineTo(s*.85,-.35);sh.lineTo(s*.5,-.55);sh.lineTo(0,-.45);sh.lineTo(0,0);
      const mem=new THREE.Mesh(new THREE.ShapeGeometry(sh),M(0x6a2030,{side:THREE.DoubleSide}));mem.rotation.x=-Math.PI/2;w.add(mem);
      [[1.1,.35],[1.25,-.05],[.85,-.35]].forEach(([x,z])=>{const v=new THREE.Vector3(s*x,0,-z),len=v.length(),bn=new THREE.Mesh(G_CYL,M(0x2a0e16));bn.scale.set(.025,len,.025);bn.position.copy(v).multiplyScalar(.5);bn.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());w.add(bn)});
      w.side=s;return w})}
  // tail
  tail=new THREE.Group();tail.position.set(0,biped?mid:top-H*.15,-L*.48);tail.rotation.x=biped?-1.75:(k=='panther'||k=='drake'?-1.9:-2.5);b.add(tail);
  const tl={pony:.55,boar:.2,stag:.18,ram:.18,charger:.6,raptor:.95,panther:.9,destrier:.5,direwolf:.6,drake:1.1}[k]||.4,tc=k=='pony'||k=='charger'?S.m:k=='destrier'?S.c:S.c;
  if(k=='charger'||k=='destrier'){for(let i=0;i<4;i++){const m=TQ(tail,G_BOX,G(S.m),0,tl*(i+.5)/4,0,.06,tl/4,.08);flame.push(m)}}
  else TQ(tail,G_CONE,M(tc),0,tl/2,0,biped||k=='drake'?.14:.08,tl,biped||k=='drake'?.12:.08,Math.PI);
  r.rig=(now,mv,sp)=>{const t=now/1000,ph=t*(sp||3)*2.3;
    legs.forEach(q=>{const a=mv?Math.sin(ph+q.ph+(q.front?0:.5)):0;q.hip.rotation.x=a*(biped?.7:.55);q.kn.rotation.x=mv?Math.max(0,-Math.cos(ph+q.ph))*(q.front?-.9:.9)*(biped?-1:1):0});
    b.position.y=mv?Math.abs(Math.sin(ph))*(biped?.06:.04):Math.sin(t*1.6)*.008;b.rotation.x=mv?Math.sin(ph*2)*.02:0;
    neck.rotation.x=S.na+(mv?Math.sin(ph*2)*.06:Math.sin(t*1.1)*.04);
    tail.rotation.z=Math.sin(t*(mv?6:2.2))*(mv?.18:.12);
    flame.forEach((m,i)=>{const f=.85+.25*Math.sin(t*9+i*1.7);m.scale.y=Math.abs(m.scale.y)/(m.userData.f||1)*f;m.userData.f=f});
    if(wings)wings.forEach(w=>{w.rotation.z=w.side*(mv?.25+Math.sin(ph)*.35:.55+Math.sin(t*1.4)*.05)})};
  r.seat=[top+(skel?.04:0),biped?-.05:-L*.04];
  return r;
}
mountModel=function(k){
  const r=mkMountRig(MOUNTS[k]?k:'pony'),g=new THREE.Group();g.add(r);g.r=r;g.seat=r.seat;
  const sd=new THREE.Group();sd.position.set(0,r.seat[0]-.06,r.seat[1]);g.add(sd);g.sd=sd;
  pm(sd,'box',0x7a2a2a,0,-.02,0,.62,.04,.72);pm(sd,'box',0x5a3020,0,.04,0,.42,.1,.55);pm(sd,'box',0x3a2014,0,.12,-.24,.4,.16,.08);pm(sd,'box',0xc8a24a,0,.1,.25,.08,.12,.06);
  [-1,1].forEach(s=>{pm(sd,'box',0x2a1a10,s*.25,-.2,0,.03,.36,.05);pm(sd,'box',0x8a8a92,s*.26,-.38,0,.08,.04,.12)});
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g};

// ---------------- 3. riding (mounting was switched off in an earlier version) ----------------
toggleMount=function(){
  if(riding)return dismount(true);
  if(!party.length||uiOpen())return;
  if(!mounts.length)return say('You have no mount yet. Build the Stable at the Stronghold Steward in Duskhold, then buy one there with gold.');
  if(inCombatNow())return say('You cannot summon a mount in combat.');
  if(typeof gat!='undefined'&&gat)gat=null;if(hero.chan)return;
  const m=mOf(mActive)||mounts[0];mActive=m.id;riding=m;mModel=mountModel(m.k);mModel.position.copy(pl.position);mModel.rotation.y=pl.rotation.y;scene.add(mModel);
  mLast={x:pl.position.x,z:pl.position.z};burst(gY(pl.position,.6),0xd8c8a0,30,2,2,.6);ring(pl.position,0xffe0a0,2.4,400);say('🐎 You mount your '+m.n+' (speed '+m.spd+').');hud()};
openMounts=function(){if(uiOpen()&&$('xw').classList.contains('hide'))return;if(!$('xw').classList.contains('hide')&&xwMode=='mounts')return closeX();openX('mounts')};
try{$('mntBtn').style.removeProperty('display');$('mntBtn').classList.remove('hide')}catch(_){}
{const p=document.querySelector('.wrap>.sub');if(p&&!/V ride/.test(p.textContent))p.textContent=p.textContent.replace('T recall to Duskhold','T recall to Duskhold · V ride mount · H mounts')}

// old saves: mounts from the old roster become the new mount of the same tier; mount eggs are refunded
function mFix(){const byT=T=>MNTK.filter(k=>MOUNTS[k].t==T);
  (mounts||[]).forEach(m=>{if(!MOUNTS[m.k]){const L=byT(MOUNT_OLD[m.k]||1);m.k=L[m.id%L.length]||'pony';m.n=MOUNTS[m.k].n}});
  if(meggs&&meggs.length){const g=meggs.reduce((a,e)=>a+Math.round(MPRICE[(e.t||1)-1]*.3),0);gold+=g;meggs=[];say('🥚 Your old mount eggs were sold for '+g+' gold. Mounts are now bought at the Stable.')}
  if(riding&&!mModel)riding=null}
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{mFix();hud()}catch(err){console.warn(err)}return r}}

// ---------------- 4. the Stable: a buildable Duskhold shop ----------------
SHOPS.push({k:'stable',n:'Stable',i:'🐎',g:800,m:[['wood',20],['fiber',12]],d:'Buy mounts for gold. Ride with V for a big boost to move speed.'});
var STB={x:-7,z:-8,g:null,col:[],npc:null,site:null};
function stableBuild(){const T=TOWNS[0];if(!T||STB.g)return;const P=T.pal||{wood:0x4a3020,roof:0x3a2a3a},x=T.cx+STB.x,z=T.cy+STB.z,b=new THREE.Group(),prev=T_cur,c0=T.col.length;if(!P.wood)P.wood=0x4a3020;if(!P.roof)P.roof=0x3a2a3a;
  b.position.set(x,GH(x,z),z);b.rotation.y=Math.PI;
  {
    TQ(b,G_BOX,sm(0xc8a850),0,.03,0,3.6,.06,2.0);
    [-1,1].forEach(s=>[-1,1].forEach(q=>TQ(b,G_BOX,sm(P.wood),s*1.7,1.2,q*.9,.16,2.4,.16)));
    TQ(b,G_BOX,sm(P.wood),0,1.0,.95,3.6,2.0,.1);[-1,1].forEach(s=>TQ(b,G_BOX,sm(P.wood),s*1.75,.62,0,.1,1.24,1.82));
    TQ(b,G_BOX,sm(P.roof),0,2.52,-.02,4.1,.12,2.6,-.24);TQ(b,G_BOX,sm(P.wood),0,2.28,-.95,3.7,.12,.12);
    TQ(b,G_CYL,sm(0xd8bc5a),1.2,.3,.5,.32,.62,.32,0,0,Math.PI/2);TQ(b,G_CYL,sm(0xd8bc5a),1.15,.82,.55,.3,.6,.3,0,0,Math.PI/2);
    TQ(b,G_BOX,sm(0x6a4a2a),-1.1,.26,.55,.9,.36,.36);TQ(b,G_BOX,sm(0x3a7ac0,{emissive:0x1a3a6a,emissiveIntensity:.3}),-1.1,.42,.55,.8,.04,.26);
    sign(b,[{t:'STABLE',f:'700 56px'},{t:'mounts for sale',f:'600 24px'}],2.2,.52,'#2e1f12','#ffd88a','#c9a24a',0,2.62,-1.0,Math.PI,512,140);
  }
  T.col.push({x,z,hx:1.85,hz:1.05});
  const dm=mountModel('pony');dm.scale.setScalar(.8);dm.position.set(.1,.06,.1);dm.rotation.y=Math.PI/2;b.add(dm);
  scene.add(b);STB.g=b;
  const nx=x,nz=z+1.9,ng=new THREE.Group(),nc=[];T_cur={col:nc,cx:0,cy:0};
  try{npc(ng,nx,nz,{robe:0x5a4a2a,trim:0x2a1a10,hat:'cap',hatC:0x6a4a1a,label:'Stable Master',ry:0})}finally{T_cur=prev}
  ng.position.y=GH(nx,nz);scene.add(ng);STB.npc=ng;nc.forEach(q=>T.col.push(q));
  STB.col=T.col.slice(c0);STB.n=[nx,nz];
  TANIM.push({x,z,f:now=>{if(STB.g&&STB.g.visible&&dm.r.rig)dm.r.rig(now,false,0)}});
}
function stableSync(){const T=TOWNS[0];if(!T)return;try{stableBuild()}catch(err){console.warn('stable',err);return}const on=shopBuilt('stable');
  if(STB.g)STB.g.visible=on;if(STB.npc)STB.npc.visible=on;
  STB.col.forEach(q=>{const i=T.col.indexOf(q);if(on&&i<0)T.col.push(q);else if(!on&&i>=0)T.col.splice(i,1)});
  if(!on&&!STB.site)STB.site=shSite(T.cx+STB.x,T.cy+STB.z+1.2,'🐎 Stable');else if(on&&STB.site){scene.remove(STB.site);STB.site=null}}
{const f=shApply;shApply=function(){const r=f.apply(this,arguments);try{stableSync()}catch(err){console.warn(err)}return r}}
{const f=townPortalPrompt;townPortalPrompt=function(T){const r=f(T);if(r)return r;if(!T||T!==TOWNS[0])return null;const x=TOWNS[0].cx+STB.x,z=TOWNS[0].cy+STB.z,d=Math.hypot(pl.position.x-x,pl.position.z-(z+1.4));
  if(d<2.6)return shopBuilt('stable')?{label:'F · Stable Master',fn:()=>openX('stable',0)}:{label:'🔨 Stable · build it at the Stronghold Steward',fn:()=>{shTab='shops';openX('hold')}};return null}}

// stable window: every mount, for gold
XR.stable=()=>{
  const P=c=>`<span class="gp${gold<c?' poor':''}">${c} 🪙</span>`;if(!mSel||!MOUNTS[mSel])mSel=MNTK[0];
  $('xwT').textContent='🐎 Stable Master';$('xwS').innerHTML='Duskhold · 🪙 <b>'+gold+'</b>';
  let sale='';for(let T=1;T<=5;T++){const c=MPRICE[T-1];sale+=`<div class="sec">Tier ${T} · speed ${MBASE[T-1]}-${MBASE[T-1]+6}</div><div class="rows">`+MNTK.filter(k=>MOUNTS[k].t==T).map(k=>{const D=MOUNTS[k],own=mounts.some(m=>m.k==k);
    return `<div class="rw${mSel==k?' on':''}" data-msel="${k}" style="--rc:${RAR[T-1][1]}"><span class="rn">${D.i} <b>${D.n}</b>${own?' <em style="color:#6ee7b7">owned</em>':''}<small>${D.d}</small></span><span class="ra">${P(c)}<button class="pri" data-mbuy="${k}" ${gold<c?'disabled':''}>Buy</button></span></div>`}).join('')+'</div>'}
  const mine=mounts.map(m=>mRow(m,`${mActive==m.id?'':`<button data-mact="${m.id}">Ride this</button>`}<button data-msell="${m.id}" title="Sell for ${Math.round(MPRICE[MOUNTS[m.k].t-1]*.3)} gold">Sell</button>`)).join('')||'<div class="mut" style="padding:6px 8px">You have no mounts yet.</div>';
  $('xwB').innerHTML=`<div class="xcols"><div>${sale}<div class="sec">Your mounts</div><div class="rows">${mine}</div></div><div>${mDetail(mSel)}</div></div>`;
  $('xwF').innerHTML='<span class="mut dtl">Press V to ride and to dismount. Mounts get faster the more you ride them. You cannot summon a mount in combat, and attacking dismounts you.</span>';mPreview(mSel)};
{const f=XR.mounts;XR.mounts=()=>{f();if(!mounts.length)$('xwB').innerHTML=`<div class="mut" style="padding:10px">No mounts yet. Build the Stable at the Stronghold Steward in Duskhold, then buy a mount there with gold.</div>`}}
mDetail=function(k){const D=MOUNTS[k];if(!D)return '';return `<div id="xwPv" class="pvbox"></div><div class="dh" style="text-align:center">${D.i} ${D.n}</div><div class="mut" style="font-size:.74rem;text-align:center;padding:0 8px">${D.d}<br>Tier ${D.t} · ${MPRICE[D.t-1]} gold · born with speed ${MBASE[D.t-1]}-${MBASE[D.t-1]+6} · grows up to +${MCAP} by riding</div>`};
