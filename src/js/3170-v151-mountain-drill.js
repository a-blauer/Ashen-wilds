// ================= v151 The Mountain Drill — Burningeye Summit III main quest: drill through the mountain into the Sovereign's Den =================
// Chapter 3 of Burningeye Summit's main quest line (1 The Frozen Maw 3152 · 2 The Frozen Gate 3160). The gateway to the Den at the end of
// Stormcrown (Burningeye III) is gone: the road ends at a sheer face of the mountain, and before it stands a great essence drill, its bit
// against the rock, wired to four control boxes round the yard.
//  * F at the drill's console starts the drill: a special event that cannot be stopped (the hero is held in the drill yard, no recall)
//    until the mountain is bored through (MQ170.need, 90 s of drilling) or the hero falls (the drill winds down and the bore is lost).
//  * The drill bores at full speed while all four control boxes are lit and running; v168: with boxes offline it keeps boring, only
//    slower (×MQ170.slow = 0.4 for each box offline: 100% · 40% · 16% · 6%), and with none running it has no power. Each box starts
//    dark: F switches it on. Running boxes fail on their own: one FREEZES or MALFUNCTIONS.
//  * Frost Trolls come up the road and out of the snow and go for the boxes, not for you: a troll that reaches a box raises its fists
//    (a warning ring) and SMASHES it. Hit a troll and it turns on you.
//  * v168: each fix is timed work at the box with its own motion (no more mini-game windows): THAW with a torch (3 s), REWIRE with a
//    spanner on one knee (6 s), REBUILD with a hammer (10 s). The game keeps going while you work; moving or a hit stops the work,
//    and F carries on where it stopped (see the repairs section).
//  * Bored through: the rock face bursts open on a tunnel; F at it goes to the Sovereign's Den.
// State MQ170.st: 0 · 1 the tunnel is open. Done also when the Den has been reached (mq170Done). Saved as x2.mq170 {st}. A save made
// mid-drill loads with the drill at rest. Co-op: local to each player (the trolls are minions, never shared).
var MQ170={name:'The Mountain Drill',st:0,S:null,E:null,err:0,t:0,trkK:'',need:90,lv:25,leash:16.5,W:null,slow:.4,
  // v168: the repairs are timed (seconds of work at the box): thawing is quickest, rewiring takes longer, rebuilding longest
  rt:{thaw:3,wire:6,rebuild:10},
  bn:['North-west box','North-east box','South-west box','South-east box'],
  stN:{off:'dark',on:'running',frozen:'frozen',fault:'malfunctioning',smashed:'smashed'},
  stC:{off:'#5a6470',on:'#7aff8a',frozen:'#8ad8ff',fault:'#ffb040',smashed:'#ff5a4a'}};
function mq170Ins(){try{return curIns()}catch(_){return null}}
function mq170In3(){const I=mq170Ins();return !!I&&I.g===insG(2,2)}
function mq170Done(){return MQ170.st>=1||insReach(2)>=3}
function mq170Den(){try{return PMAP[2].ins[3].n}catch(_){return 'the Den'}}
// ---------------- where things stand (a pure function of the map data: 1680's place() keeps decorations off them) ----------------
function mq170Plan(){if(mq170Plan.c)return mq170Plan.c;const I=INSL[insG(2,2)],P=I.path,N=P.length,q=P[Math.max(0,N-14)],gx=I.ba[0],gz=I.ba[1],ry=Math.atan2(q[0]-gx,q[1]-gz);
  const fx=Math.sin(ry),fz=Math.cos(ry),sx=Math.cos(ry),sz=-Math.sin(ry),DW=MAP.DW,L=(lx,lz)=>({x:gx+lx*sx+lz*fx,z:gz+lx*sz+lz*fz});
  const ok=(x,z,m)=>{const X=Math.round(x),Z=Math.round(z);if(X<1||Z<1||X>=W-1||Z>=H-1)return false;const t=MAP[Z]&&MAP[Z][X];if(!t||t=='#'||t=='r'||t=='~'||t=='H')return false;const J=insAt(X,Z);if(!J||J.g!==I.g)return false;return DW[Z*W+X]<-(m==null?1:m)};
  // the cliff face 3 tiles behind the old gateway; the drill's bit against it; the console at the drill's back; four boxes round the yard
  const R={g:{x:gx,z:gz,ry,fx,fz,sx,sz},L,ok,face:L(0,-1.9),drill:L(0,2.6),con:L(0,8.8),yard:L(0,6),tun:L(0,-1.2),
    box:[L(-8.5,1.5),L(8.5,1.5),L(-7,11),L(7,11)],keep:[]};
  R.keep.push([L(0,-6).x,L(0,-6).z,12],[R.drill.x,R.drill.z,6.5],[R.con.x,R.con.z,3]);R.box.forEach(b=>R.keep.push([b.x,b.z,2.6]));
  return mq170Plan.c=R}
function mq170Keep(g,x,z){if(g!==insG(2,2))return false;try{for(const k of mq170Plan().keep)if(Math.hypot(x-k[0],z-k[1])<k[2])return true}catch(e){if(!mq170Keep.e){mq170Keep.e=1;console.warn('v151 drill keep',e)}}return false}
{const f=rosterBuild;rosterBuild=function(r){const o=f.apply(this,arguments);try{if(r===insG(2,2)&&ROST.r===r){const R=mq170Plan();
    ROST.slots=ROST.slots.filter(s=>!(s.wild&&Math.hypot((s.hx==null?s.x:s.hx)-R.yard.x,(s.hz==null?s.z:s.hz)-R.yard.z)<26))}}catch(e){console.warn('v151 drill roster',e)}return o}}

// solid from the start: the cliff, the drill's body (the boxes and the console are small: you walk round them); the bore (tunT) opens
function mq170Solid(){const R=mq170Plan();MQ170.tunT=[];for(let lz=-12;lz<=-2;lz++)for(let lx=-16;lx<=16;lx++){const p=R.L(lx,lz),k=Math.round(p.z)*W+Math.round(p.x);CBLK.add(k);if(lz>=-3&&Math.abs(lx)<=1)MQ170.tunT.push(k)}
  for(let lz=0;lz<=6;lz++)for(let lx=-1;lx<=1;lx++){const p=R.L(lx,lz);CBLK.add(Math.round(p.z)*W+Math.round(p.x))}}
try{mq170Solid()}catch(e){console.warn('v151 drill tiles',e)}
// ---------------- models ----------------
var DR170={m:null};
function dr170Mats(){if(DR170.m)return DR170.m;const S=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,flatShading:true},o||{}));
  return DR170.m={rock:S(0x4a4e58,{roughness:.92}),rock2:S(0x5e636c,{roughness:.9}),dark:S(0x24272e,{roughness:.95}),snow:S(0xe8eef4,{roughness:.95}),
    iron:S(0x3c3f46,{roughness:.42,metalness:.65}),iron2:S(0x26282e,{roughness:.5,metalness:.6}),steel:S(0xb4bcc6,{roughness:.25,metalness:.7}),brass:S(0xb08a3a,{roughness:.35,metalness:.75}),
    copper:S(0xa8603a,{roughness:.4,metalness:.7}),wood:S(0x5a3e26,{roughness:.9}),rubber:S(0x1a1a1e,{roughness:.8}),glass:S(0xbfe8ff,{emissive:0x2a6aa0,emissiveIntensity:.4,roughness:.04,metalness:.2,transparent:true,opacity:.6}),
    core:S(0x7ad8ff,{emissive:0x2aa8ff,emissiveIntensity:1.2,roughness:.2}),hot:S(0xff9a3a,{emissive:0xff5a10,emissiveIntensity:1.0}),void:new THREE.MeshBasicMaterial({color:0x040508,fog:false}),
    lampOff:S(0x2a3038,{roughness:.3}),panel:S(0x2e343c,{roughness:.6,metalness:.4})}}
// the mountain face: a wall of great rocks with snow on every ledge (local +z is toward the road)
function dr170Cliff(){const M=dr170Mats(),k=gb151Kit(),rn=svRng(1701);
  for(let row=0;row<3;row++)for(let i=0;i<9;i++){const x=(i-4)*3.4+(rn()-.5)*1.2,z=-1.5-row*2.4-rn()*1.2-Math.abs(i-4)*.35,y=1.4+row*3.4+rn()*.8,s=2.2+rn()*1.2-row*.2;
    k.lump(i%6,1710+row*10+i,(i+row)%3?M.rock:M.rock2,x,y,z,s*1.2,s*(1.15+rn()*.5),s,rn()*6,.3);if(rn()<.7)k.lump(10+i%3,1750+row*10+i,M.snow,x+(rn()-.5),y+s*.95,z+.3,s*.8,s*.22,s*.7,rn()*6,.2)}
  for(let i=0;i<7;i++){const x=(i-3)*4.2+(rn()-.5)*1.5;k.lump(20+i%4,1790+i,M.rock2,x,11.5+rn()*1.5,-8-rn()*2,3.4,2.6,2.6,rn()*6,.3);k.lump(24,1800+i,M.snow,x,13.6+rn(),-8,2.8,.6,2.2,rn()*6,.2)}
  // where the bit bites: a scarred, cracked patch; the tunnel behind (shown when bored through)
  k.lump(30,1810,M.dark,0,2.2,-1.1,1.9,1.9,.9,0,.25);
  const g=k.done();g.userData.psNo=1;
  const tun=new THREE.Group();g.add(tun);const kt=gb151Kit();kt.m(svG('dr_tun',()=>{const q=new THREE.CylinderGeometry(2.2,2.2,7,14,3,true);q.rotateX(Math.PI/2);q.translate(0,0,-3.5);return q}),new THREE.MeshBasicMaterial({color:0x0a0c12,side:THREE.BackSide,fog:false}),0,2.3,-.6,0,0,0,1,1.05,1);
  kt.m(svG('dr_tv',()=>new THREE.CircleGeometry(1,20)),M.void,0,2.3,-7.4,0,0,0,2.4,2.5,1);for(let i=0;i<8;i++){const a=i/8*6.283;kt.lump(31+i%3,1820+i,M.rock2,Math.cos(a)*2.6,2.3+Math.sin(a)*2.6,-.3,.8,.7,.7,a,.35)}
  for(let i=0;i<9;i++)kt.lump(35+i%3,1830+i,i%2?M.rock:M.rock2,(rn()-.5)*5,.25,1+rn()*2.5,.5+rn()*.4,.35,.5+rn()*.3,rn()*6,.35);
  tun.add(kt.done());tun.visible=false;const gl=kqSpr(0x7ad8ff,3.6);gl.material=gl.material.clone();gl.material.opacity=.5;gl.position.set(0,2.3,-5);tun.add(gl);
  // the bore growing in the rock while the drill turns
  const bore=new THREE.Mesh(svG('dr_bore',()=>new THREE.CircleGeometry(1,20)),M.void);bore.position.set(0,2.3,-.05);bore.scale.set(.01,.01,1);g.add(bore);
  return {g,tun,bore,gl}}
// the drill: a sled chassis, a copper boiler and chimney, an essence core, gears and pistons, the great fluted bit on its shaft
function dr170Drill(){const M=dr170Mats(),k=gb151Kit();
  // chassis: two runners, a deck, the operator's railing
  [-1,1].forEach(s=>{k.m(svG('dd_ru',()=>svTube([[0,.25,-3.2],[0,.15,-2.6],[0,.15,3.4],[0,.55,3.9]],.18,6)),M.iron2,s*1.7,0,0);for(let i=0;i<5;i++)k.m(svG('dd_rv',()=>new THREE.IcosahedronGeometry(.08,0)),M.brass,s*1.7,.38,-2.4+i*1.4)});
  k.m(svG('dd_dk',()=>new THREE.BoxGeometry(3.8,.35,7)),M.iron,0,.6,.3);k.m(svG('dd_dk2',()=>new THREE.BoxGeometry(4,.12,7.2)),M.wood,0,.82,.3);
  for(let i=0;i<6;i++)k.m(svG('dd_rp',()=>new THREE.CylinderGeometry(.04,.04,1.0,5)),M.iron,i<3?-1.8:1.8,1.35,2.6+(i%3)*.5);[-1,1].forEach(s=>k.m(svG('dd_rr',()=>new THREE.CylinderGeometry(.04,.04,1.2,5)),M.iron,s*1.8,1.85,3.1,Math.PI/2,0,0));
  // the boiler (copper drum, iron bands), the chimney, gauges
  k.m(svG('dd_bo',()=>{const q=new THREE.CylinderGeometry(1.2,1.2,3.4,14);q.rotateX(Math.PI/2);return q}),M.copper,0,2.1,.9);for(let i=0;i<4;i++)k.m(svG('dd_bb',()=>new THREE.TorusGeometry(1.22,.07,4,16)),M.iron2,0,2.1,-.5+i*.95);
  k.m(svG('dd_ch',()=>new THREE.CylinderGeometry(.28,.35,2.4,10)),M.iron2,.6,4.1,1.8);k.m(svG('dd_cc',()=>new THREE.CylinderGeometry(.42,.3,.35,10)),M.iron,.6,5.4,1.8);
  [-1,1].forEach(s=>{k.m(svG('dd_ga',()=>new THREE.CylinderGeometry(.22,.22,.08,12)),M.brass,s*.8,2.6,2.65,Math.PI/2,0,0);k.m(svG('dd_gf',()=>new THREE.CircleGeometry(.18,12)),M.snow,s*.8,2.6,2.7)});
  // the essence core in a cage on top
  k.m(svG('dd_cr',()=>{const q=new THREE.OctahedronGeometry(.42,0);q.scale(1,1.6,1);return q}),M.core,-.6,3.75,.3);for(let i=0;i<6;i++){const a=i/6*6.283;k.m(svG('dd_cb',()=>new THREE.CylinderGeometry(.03,.03,1.4,4)),M.iron,-.6+Math.sin(a)*.5,3.75,.3+Math.cos(a)*.5)}
  // gears and pistons along the sides
  [-1,1].forEach(s=>{k.m(svG('dd_gr',()=>{const q=new THREE.CylinderGeometry(.7,.7,.16,16);q.rotateZ(Math.PI/2);return q}),M.brass,s*1.95,1.6,-1.4);k.m(svG('dd_pi',()=>new THREE.CylinderGeometry(.12,.12,2.2,8)),M.steel,s*1.4,1.5,-2.1,Math.PI/2-.2,0,0)});
  // the front: a collar, the shaft
  k.m(svG('dd_co',()=>{const q=new THREE.CylinderGeometry(1.05,1.25,.8,14);q.rotateX(Math.PI/2);return q}),M.iron2,0,2.1,-1.3);
  const g=k.done();g.userData.psNo=1;
  // the bit spins on its own group: a fluted cone of steel with spiral cutting edges
  const bit=new THREE.Group();bit.position.set(0,2.1,-1.7);g.add(bit);const kb=gb151Kit();
  kb.m(svG('dd_bt',()=>{const q=new THREE.ConeGeometry(1.1,2.8,14,4);q.rotateX(-Math.PI/2);q.translate(0,0,-1.4);return q}),M.steel);kb.m(svG('dd_btp',()=>{const q=new THREE.ConeGeometry(.22,.5,8);q.rotateX(-Math.PI/2);q.translate(0,0,-2.75);return q}),M.hot);
  for(let i=0;i<4;i++)for(let j=0;j<6;j++){const t=j/6,a=i/4*6.283+t*3.2,r=1.0*(1-t)+.06;kb.m(svG('dd_bf',()=>new THREE.BoxGeometry(.08,.12,.45)),M.iron2,Math.cos(a)*r,Math.sin(a)*r,-t*2.5-.15,0,0,a)}
  bit.add(kb.done());
  const glow=kqSpr(0x7ad8ff,1.6);glow.material=glow.material.clone();glow.position.set(-.6,3.75,.3);g.add(glow);
  return {g,bit,glow}}
// a control box: an iron cabinet with a status lamp; its front parts (the panel, the two gauges, the lever) are separate pieces, so a
// smashed box lies in pieces and is rebuilt piece by piece (v168). An ice crust (frozen) and three loose cables (fault) hang on it.
function dr170Box(i){const M=dr170Mats(),k=gb151Kit(),g=new THREE.Group();g.userData.psNo=1;
  k.m(svG('db_c',()=>new THREE.BoxGeometry(1.0,1.3,.7)),M.iron,0,.8,0);k.m(svG('db_b',()=>new THREE.BoxGeometry(1.2,.16,.9)),M.iron2,0,.08,0);
  k.m(svG('db_cb',()=>svTube([[0,.1,-.35],[0,.05,-.9],[0,.04,-1.6]],.07,6)),M.rubber,0,0,0);k.m(svG('db_ro',()=>new THREE.BoxGeometry(1.1,.12,.8)),M.iron2,0,1.5,0);
  const body=k.done();g.add(body);
  const lamp=new THREE.Mesh(svG('db_lm',()=>new THREE.SphereGeometry(.16,10,8)),new THREE.MeshBasicMaterial({color:0x5a6470}));lamp.position.set(0,1.7,0);g.add(lamp);
  const halo=kqSpr(0x7aff8a,1.1);halo.material=halo.material.clone();halo.position.copy(lamp.position);g.add(halo);
  // the front pieces: {o: the piece, on: [x,y,z,rx,ry,rz] mounted, off: lying in the snow}
  const piece=(fn,on,off)=>{const kk=gb151Kit();fn(kk);const o=kk.done();g.add(o);o.position.set(on[0],on[1],on[2]);return {o,on,off}};
  const parts=[
    piece(kk=>{kk.m(svG('db_p',()=>new THREE.BoxGeometry(.8,.9,.04)),M.panel,0,0,0);for(let q=0;q<3;q++)kk.m(svG('db_so',()=>new THREE.CylinderGeometry(.05,.05,.04,8)),M.brass,-.25+q*.25,-.3,.03,Math.PI/2,0,0)},[0,.85,.37,0,0,0],[.55,.05,.95,-Math.PI/2+.2,.4,0]),
    piece(kk=>{for(let q=0;q<2;q++){kk.m(svG('db_g',()=>new THREE.CylinderGeometry(.12,.12,.04,12)),M.brass,-.2+q*.4,0,.02,Math.PI/2,0,0);kk.m(svG('db_gf',()=>new THREE.CircleGeometry(.09,10)),M.snow,-.2+q*.4,0,.045)}},[0,1.1,.39,0,0,0],[-.6,.06,.75,-Math.PI/2,0,.6]),
    piece(kk=>{kk.m(svG('db_l',()=>new THREE.CylinderGeometry(.03,.03,.45,6)),M.steel,0,0,0,.5,0,0);kk.m(svG('db_lk',()=>new THREE.SphereGeometry(.07,8,6)),M.rubber,0,.2,.11)},[.25,.68,.5,0,0,0],[-.3,.05,1.15,Math.PI/2,0,.7])];
  // the frozen crust
  const ice=new THREE.Group();g.add(ice);const ki=gb151Kit();ki.lump(1,1850+i,M.glass,0,.8,0,.8,.95,.6,0,.2);for(let q=0;q<5;q++)ki.crys(q,dr170Mats().glass,(q-2)*.22,1.45,.1,(q-2)*.3,1,.3,.07,.3+q%2*.2);ice.add(ki.done());ice.visible=false;
  // the loose cables (a malfunction): each swings from the cabinet's foot; rewired, it stands up into its socket on the panel
  const wir=new THREE.Group();g.add(wir);const cab=[0xc84a3a,0x4a8ad8,0xd8b040].map((c,q)=>{const p=new THREE.Group();p.position.set(-.25+q*.25,.2,.42);wir.add(p);
    const m=new THREE.Mesh(svG('db_wr',()=>{const q2=new THREE.CylinderGeometry(.025,.025,.35,5);q2.translate(0,.175,0);return q2}),new THREE.MeshStandardMaterial({color:c,roughness:.6,flatShading:true}));m.castShadow=true;p.add(m);
    const tip=new THREE.Mesh(svG('db_wt',()=>new THREE.CylinderGeometry(.04,.03,.07,6)),M.copper);tip.position.y=.35;p.add(tip);p.userData.a0=1.75+q*.18;return p});wir.visible=false;
  const B={g,body,lamp,halo,ice,wir,cab,parts,i};dr170Part(B,'on',0);return B}
// how far a repair has come shows on the box: the ice melts down, the cables stand up into their sockets one by one, the pieces
// the cabinet is heaved upright first, then the pieces jump back into place one by one (p 0..1 for state s; 'on' = whole, 'off' = whole and dark)
function dr170Part(B,s,p){const sm=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
  B.ice.visible=s==='frozen'&&p<.97;if(B.ice.visible)B.ice.scale.set(1-.3*p,Math.max(.04,1-.95*sm(p)),1-.3*p);
  B.wir.visible=s==='fault';if(s==='fault')B.cab.forEach((c,q)=>{const t=sm((p-q*.3)/.22);c.rotation.x=c.userData.a0*(1-t)+(t<1?.12*Math.sin(nowP()/260+q*2):0)});
  const sh=s==='smashed';B.parts.forEach((P,q)=>{const t=sh?sm((p-.2-q*.26)/.16):1,a=P.off,b=P.on,o=P.o;
    o.position.set(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t+Math.sin(Math.PI*t)*.45,a[2]+(b[2]-a[2])*t);o.rotation.set(a[3]+(b[3]-a[3])*t,a[4]+(b[4]-a[4])*t,a[5]+(b[5]-a[5])*t)});
  const tl=sh?1-sm(p/.15):0;B.body.rotation.set(.25*tl,0,.3*tl);B.body.position.y=-.12*tl}
// the console at the drill's back: a lectern of levers and a big wheel
function dr170Console(){const M=dr170Mats(),k=gb151Kit();k.m(svG('dc_b',()=>new THREE.BoxGeometry(1.4,1.1,.7)),M.iron,0,.55,0);k.m(svG('dc_t',()=>new THREE.BoxGeometry(1.5,.12,.9)),M.iron2,0,1.15,0,-.3,0,0);
  for(let i=0;i<3;i++)k.m(svG('dc_lv',()=>new THREE.CylinderGeometry(.03,.03,.5,6)),M.steel,-.4+i*.4,1.4,.1,-.3,0,0);k.m(svG('dc_w',()=>new THREE.TorusGeometry(.32,.04,5,14)),M.brass,0,1.55,-.25,.2,0,0);
  const g=k.done();g.userData.psNo=1;return g}
KQSH151.ddrill2=()=>dr170Drill().g;KQSH151.ddrill=()=>{const g=new THREE.Group(),c=dr170Cliff(),d=dr170Drill();g.add(c.g);d.g.position.z=4.4;g.add(d.g);return g};KQSH151.dbox=()=>{const b=dr170Box(0);dr170Part(b,'frozen',0);return b.g};KQSH151.dbox2=()=>{const b=dr170Box(1);dr170Part(b,'smashed',0);return b.g};KQSH151.dbox3=()=>{const b=dr170Box(2);dr170Part(b,'fault',0);return b.g};

// ---------------- the world ----------------
function mq170Build(){if(MQ170.S)return MQ170.S;const R=mq170Plan(),G=R.g,S={box:[]};MQ170.S=S;const y=(p)=>GH(p.x,p.z);
  S.cliff=dr170Cliff();S.cliff.g.position.set(R.face.x,y(R.face),R.face.z);S.cliff.g.rotation.y=G.ry;scene.add(S.cliff.g);
  S.drill=dr170Drill();S.drill.g.position.set(R.drill.x,y(R.drill),R.drill.z);S.drill.g.rotation.y=G.ry;scene.add(S.drill.g);S.d0=S.drill.g.position.clone();
  S.con=dr170Console();S.con.position.set(R.con.x,y(R.con),R.con.z);S.con.rotation.y=G.ry;scene.add(S.con);
  R.box.forEach((b,i)=>{const B=dr170Box(i);B.g.position.set(b.x,y(b),b.z);B.g.rotation.y=Math.atan2(R.drill.x-b.x,R.drill.z-b.z);scene.add(B.g);B.x=b.x;B.z=b.z;S.box.push(B)});
  S.tunT=MQ170.tunT||[];
  S.lt=new THREE.PointLight(0x7ad8ff,0,10,1.6);S.lt.position.set(R.drill.x,y(R.drill)+4,R.drill.z);scene.add(S.lt);
  S.tl=new THREE.PointLight(0xff8a3a,0,6,1.8);S.tl.position.set(R.yard.x,-50,R.yard.z);scene.add(S.tl);   // v168: the repair torch's light
  try{const r=RPORT.find(q=>q.k=='next'&&q.ig===insG(2,2));if(r){r.g.visible=false;MQ170.rp=r}}catch(_){}
  mq170Sync();return S}
function mq170Sync(){const S=MQ170.S;if(!S)return;const open=mq170Done(),E=MQ170.E;S.cliff.tun.visible=open;S.cliff.bore.visible=!open;
  S.tunT.forEach(k=>{if(open)CBLK.delete(k);else CBLK.add(k)});
  if(!E){S.cliff.bore.scale.set(open?.01:.01,open?.01:.01,1);S.drill.g.position.copy(S.d0)}
  S.box.forEach((B,i)=>dr170BoxLook(B,E?E.box[i].s:(open?'on':'off')))}
function dr170BoxLook(B,st){const c={off:0x3a4048,on:0x7aff8a,frozen:0x8ad8ff,fault:0xffb040,smashed:0x2a2020}[st]||0x3a4048;B.lamp.material.color.setHex(c);B.halo.material.color.setHex(st=='smashed'?0xff3a2a:c);
  B.halo.visible=st!='off';dr170Part(B,st,0)}

// ---------------- the event ----------------
function mq170Start(){if(MQ170.E||mq170Done())return;const R=mq170Plan();if(riding)try{dismount()}catch(_){}
  MQ170.E={t:0,prog:0,box:[0,1,2,3].map(i=>({s:'off',tf:9+Math.random()*8+i*2})),trT:6,live:[],run:0,hint:0};MQ170.trkK='';mq170Sync();
  shake(.25);svSnd('heavy',1.1,.6);setTimeout(()=>svSnd('charge',1,.5),300);svShock(new THREE.Vector3(R.yard.x,0,R.yard.z),0x7ad8ff,MQ170.leash,.8);
  try{zt116Show(ZT116.Z[2],'Stormcrown','The Mountain Drill','The drill wakes, and the trolls hear it','Keep all four control boxes running','z2')}catch(_){}
  say('⚙️ The drill wakes! Switch on all four control boxes (F at each). Keep them running: the drill only bores while every box is lit.');dr170Hud()}
function mq170Fail(why){const E=MQ170.E;if(!E)return;MQ170.E=null;MQ170.trkK='';dr170Close(false);
  enemies.slice().forEach(e=>{if(e.dr170t&&!e.dead){burst(gY(e.m.position,1),0xe8f0f8,20,1.6,1.4,.6);try{removeE(e)}catch(_){}}});mq170Sync();dr170Hud();svSnd('heavy',.9,.5);
  say(why==='dead'?'⚙️ You fall, and the drill grinds to a halt. The bore collapses: start the drill again.':'⚙️ The drill grinds to a halt.')}
function mq170Win(){const E=MQ170.E;MQ170.E=null;MQ170.st=1;MQ170.trkK='';dr170Close(false);const R=mq170Plan(),p=new THREE.Vector3(R.face.x,0,R.face.z);
  enemies.slice().forEach(e=>{if(e.dr170t&&!e.dead){burst(gY(e.m.position,1),0xe8f0f8,20,1.6,1.4,.6);try{removeE(e)}catch(_){}}});
  try{sk146Debris(gY(p,2.5),dr170Mats().rock,26,.4,8,8,2)}catch(_){}burst(gY(p,2.5),0xd8d8d8,120,5,4,1.2);svShock(p,0xbfe8ff,9,.8);shake(.6);svSnd('crack',1.4,.4);svSnd('heavy',1.4,.5);svSnd('bell',1,.7);
  mq170Sync();dr170Hud();
  setTimeout(()=>{try{zt116Show(ZT116.Z[2],'Burningeye Summit · Main Quest','Through the Mountain','The drill bursts through the rock','A tunnel leads to '+mq170Den(),'z2');mSfx('victory')}catch(_){}
    say('⚙️ The drill has bored through the mountain! The tunnel leads to '+mq170Den()+'.')},800)}
function mq170Through(){MQ170.st=1;MQ170.trkK='';try{insGo(PMAP[2].ins[3])}catch(err){console.error('v151 tunnel',err)}}
// a box is switched on or repaired: here, or (a co-op partner) on the host's world too
function dr170Fix(i){if(co151On()&&!co151Host()){co151Send(['d3o',i]);const E=MQ170.E;if(E){E.fq=E.fq||{};E.fq[i]=nowP()+4000}}dr170Set(i,'on')}
// a box changes state (with its effect and a line in the log)
function dr170Set(i,s,why){const E=MQ170.E;if(!E)return;const b=E.box[i],B=MQ170.S.box[i],was=b.s;if(was===s)return;
  const W=MQ170.W;if(W&&W.i===i)dr170Close(false);b.s=s;b.rp=0;dr170BoxLook(B,s);MQ170.trkK='';const p=new THREE.Vector3(B.x,0,B.z);
  if(s==='on'){burst(gY(p,1.7),0x7aff8a,20,1.2,1.2,.5);svSnd('bell',.6,1.6);b.tf=12+Math.random()*12}
  else if(s==='frozen'){burst(gY(p,1),0xd8f4ff,30,1.5,1.5,.7);svSnd('crack',.9,1.2);popT(gY(p,2),'❄ FROZEN','#8ad8ff',true)}
  else if(s==='fault'){burst(gY(p,1.4),0xffd07a,30,2,2,.4);svSnd('zap',1,1);popT(gY(p,2),'⚡ MALFUNCTION','#ffb040',true)}
  else if(s==='smashed'){try{sk146Debris(gY(p,1),dr170Mats().iron,8,.15,4,5,1.3)}catch(_){}burst(gY(p,1),0xffa07a,30,2,2,.5);shake(.25);svSnd('heavy',1.1,.9);svSnd('crack',.8,1.4);popT(gY(p,2),'💥 SMASHED','#ff5a4a',true)}
  if(was==='on'&&s!=='on'){const r=dr170Rate(E);say((s==='smashed'?'💥 ':s==='frozen'?'❄️ ':'⚡ ')+'The '+MQ170.bn[i].toLowerCase()+' is '+MQ170.stN[s]+': '+(r>0?'the drill slows to '+Math.round(r*100)+'% speed!':'the drill has no power!'))}}
// v168: the drill keeps boring with boxes offline, only slower: ×0.4 for each box that is not running (1 · 0.4 · 0.16 · 0.064);
// with all four offline it has no power at all
function dr170Off(E){return E?E.box.filter(b=>b.s!=='on').length:4}
function dr170Rate(E){const n=dr170Off(E);return n>=4?0:Math.pow(MQ170.slow,n)}
function mq170ETick(dt,now,al){const E=MQ170.E,R=mq170Plan(),S=MQ170.S;if(!E||!S)return;E.t+=dt;
  // co-op (3180): the region host runs the drill (progress, failures, trolls, the end); partners switch on and repair boxes
  const co=co151On(),host=co151Host();
  if(!mq170In3())return mq170Fail('left');
  if(!co&&hero.hp<=0)return mq170Fail('dead');
  if(co&&host&&!co151Standing())return mq170Fail('dead');
  if(hero.hp>0){const p=pl.position,dx=p.x-R.yard.x,dz=p.z-R.yard.z,d=Math.hypot(dx,dz);if(d>MQ170.leash){p.x=R.yard.x+dx/d*MQ170.leash;p.z=R.yard.z+dz/d*MQ170.leash;if(now-(E.lw||0)>2500){E.lw=now;say('⚙️ You cannot leave the drill now!')}}}
  // drilling: full speed with all four boxes running, slower with each box offline (dr170Rate), stopped with none running
  const rate=dr170Rate(E),run=rate>0,full=rate>=1;if(rate!==E.rate){const up=rate>(E.rate||0);E.rate=rate;E.run=full?1:0;MQ170.trkK='';svSnd(up?'charge':'hiss',.8,up?.7:.9)}
  // running boxes fail on their own while the drill turns
  if(run&&host){E.prog=Math.min(MQ170.need,E.prog+dt*rate);E.box.forEach((b,i)=>{if(b.s!=='on')return;b.tf-=dt;if(b.tf<=0)dr170Set(i,Math.random()<.55?'frozen':'fault')})}
  const k=E.prog/MQ170.need,bv=14*rate;S.drill.bitV=Math.max(bv,(S.drill.bitV||0)-dt*10);S.drill.bit.rotation.z+=dt*S.drill.bitV;
  S.drill.g.position.copy(S.d0).add(new THREE.Vector3(-R.g.fx*k*1.6,0,-R.g.fz*k*1.6));S.cliff.bore.scale.set(.2+1.9*k,.2+1.9*k,1);S.lt.intensity=run?.5+.7*rate+.4*rate*Math.sin(now/60):.3;
  S.drill.glow.material.opacity=run?.45+.45*rate:.35;if(run&&Math.random()<dt*24*rate){const p=new THREE.Vector3(R.face.x+(Math.random()-.5)*2.4,GH(R.face.x,R.face.z)+1.2+Math.random()*2.2,R.face.z);p.x+=R.g.fx*.6;p.z+=R.g.fz*.6;burst(p,Math.random()<.5?0xffd07a:0x9aa0a8,2,2.4,2,.5)}
  if(run&&Math.random()<dt*3*rate)shake(.05);if(run&&Math.random()<dt*(.6+1.4*rate)){const c=new THREE.Vector3();S.drill.g.localToWorld(c.set(.6,5.6,1.8));burst(c,0xd8d8d8,3,.4,2,1.4)}
  // Frost Trolls for the boxes: more as the bore deepens
  if(host){E.trT-=dt;const live=enemies.filter(e=>e.dr170t&&!e.dead).length;
  if(E.trT<=0){E.trT=Math.max(5.5,10-k*4.5)+Math.random()*2;const n=Math.min(1+(k>.35?1:0)+(k>.75&&Math.random()<.5?1:0)+(co&&k>.2?1:0),(co?8:6)-live);
    for(let i=0;i<n;i++){let x=0,z=0,okp=false;for(let tr=0;tr<16&&!okp;tr++){const a=Math.random()*6.283,r=17+Math.random()*4,qx=R.yard.x+Math.sin(a)*r,qz=R.yard.z+Math.cos(a)*r;
        if((Math.sin(a)*R.g.fx+Math.cos(a)*R.g.fz)<-.15)continue;if(R.ok(qx,qz,.6)&&!solid(Math.round(qx),Math.round(qz))){x=qx;z=qz;okp=true}}
      if(!okp)continue;let e=null;try{e=spawnEnemy('troll',x,z,MQ170.lv,{minion:co?0:1})}catch(err){console.error('v151 troll',err)}if(!e)continue;
      e.dr170t=1;e.agg=0;e.c.n='Frost Troll Wrecker';e.dr={ph:'go',b:-1,t:0};const p=new THREE.Vector3(x,0,z);burst(gY(p,.5),0xe8f0f8,30,2,1.5,.8);svDecal(p,0xc8d8e8,1.6,2,.6)}
    if(n>0&&!E.hint){E.hint=1;say('🧌 Frost Trolls are going for the control boxes! Hit one and it will come for you instead.')}}
  if(E.prog>=MQ170.need)return mq170Win()}
  if(co&&host)co170Sync(now);
  dr170WTick(dt,now,al);if(now-(E.hu||0)>150){E.hu=now;dr170Hud()}}
// a wrecker troll: walks to a box, raises its fists over it (a warning ring), smashes it; once hit it fights you instead
function dr170Troll(e,dt,now){const E=MQ170.E,S=MQ170.S;if(!E||!S){try{removeE(e)}catch(_){}return}const D=e.dr,m=e.m;
  const pick=()=>{const L=E.box.map((b,i)=>({i,b})).filter(q=>q.b.s!=='smashed'),on=L.filter(q=>q.b.s==='on'),C=on.length?on:L;if(!C.length)return -1;
    let best=C[0].i,bd=1e9;C.forEach(q=>{const B=S.box[q.i],d=Math.hypot(B.x-m.position.x,B.z-m.position.z)+Math.random()*6;if(d<bd){bd=d;best=q.i}});return best};
  if(D.b<0||E.box[D.b].s==='smashed'&&D.ph==='go'){D.b=pick();if(D.b<0){animC(m,now,false,0);return}}
  const B=S.box[D.b],dx=B.x-m.position.x,dz=B.z-m.position.z,L=Math.hypot(dx,dz);
  if(D.ph==='go'){m.ak=null;if(L>1.9){const sp=1.9;walkM(m,dx/L*sp*dt,dz/L*sp*dt);m.rotation.y=Math.atan2(dx,dz);animC(m,now,true,sp)}
    else{D.ph='wind';D.t=1.5;m.rotation.y=Math.atan2(dx,dz);if(co151On()&&e.nid)co151Send(['d3w',e.nid,D.b]);try{D.w=svWarn({k:'c',r:1.3},{x:B.x,z:B.z,a:0},1.5,{col:0xff6a2a})}catch(_){}popT(gY(B.g.position,2.4),'⚠ A TROLL IS SMASHING A BOX','#ff9a5a')}}
  else if(D.ph==='wind'){D.t-=dt;m.ak={n:'slam',ph:0,k:Math.min(1,1-D.t/1.5)};animC(m,now,false,0);if(D.t<=0){D.ph='hit';D.t=.25}}
  else if(D.ph==='hit'){D.t-=dt;m.ak={n:'slam',ph:1,k:Math.min(1,1-D.t/.25)};animC(m,now,false,0);if(D.t<=0){if(E.box[D.b].s!=='smashed')dr170Set(D.b,'smashed');D.ph='rec';D.t=.8}}
  else{D.t-=dt;m.ak={n:'slam',ph:2,k:Math.max(0,D.t/.8)};animC(m,now,false,0);if(D.t<=0){m.ak=null;D.ph='go';D.b=-1}}}
{const f=eTick;eTick=function(e,dt,now){if(e&&e.dr170t&&!e.angry&&!e.dead){if(dt>0)try{dr170Troll(e,dt,now)}catch(err){if(!MQ170.err++)console.error('v151 wrecker',err)}return true}return f.apply(this,arguments)}}
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.dr170t&&!e.angry&&!e.dead&&d>0){e.angry=1;e.agg=1;e.hunt=1;e.m.ak=null;if(e.dr&&e.dr.w&&e.dr.w.kill)try{e.dr.w.kill()}catch(_){}dn(e.m.position,'!','#ff6a3a',-40,800)}return f.apply(this,arguments)}}
// the boxes' prompts and the console's
function mq170Prompt(){if(!mq170In3()||!MQ170.S)return null;const P=pl.position,R=mq170Plan(),E=MQ170.E;
  if(E){const W=MQ170.W;if(W)return {label:'🔧 '+DR170W.kn[W.kind]+' the '+MQ170.bn[W.i].toLowerCase()+' · '+Math.round((E.box[W.i].rp||0)*100)+'% · move or Esc to stop',fn:()=>{}};
    for(const B of MQ170.S.box){if(Math.hypot(P.x-B.x,P.z-B.z)>2.3)continue;const b=E.box[B.i],n=MQ170.bn[B.i];
      if(b.s==='off')return {label:'F · Switch on the '+n.toLowerCase(),fn:()=>dr170Fix(B.i)};if(b.s==='on')return {label:'✅ The '+n.toLowerCase()+' is running',fn:()=>{}};
      const kd=dr170Kind(b.s),rp=b.rp||0;
      return {label:'F · '+(rp>0?'Carry on: '+DR170W.vb[kd].toLowerCase()+' the '+n.toLowerCase()+' ('+Math.round(rp*100)+'% done)':DR170W.vb[kd]+' the '+n.toLowerCase()+' ('+MQ170.rt[kd]+' s)'),fn:()=>dr170Open(B.i,kd)}}
    return {label:'⚙️ The drill: '+Math.round(E.prog/MQ170.need*100)+'% · '+dr170Speed(E),fn:()=>{}}}
  if(Math.hypot(P.x-R.con.x,P.z-R.con.z)<2.6)return mq170Done()?{label:'F · Into the tunnel to '+mq170Den(),fn:()=>mq170Through()}:{label:'F · Start the drill (no turning back)',fn:()=>mq170Start()};
  const T=R.L(0,-.6);if(Math.hypot(P.x-T.x,P.z-T.z)<4.6){if(mq170Done())return {label:'F · Into the tunnel to '+mq170Den(),fn:()=>mq170Through()};return {label:'🔒 Sheer rock: the way to the Den is through the mountain',fn:()=>say('⚙️ The drill at the end of the road could bore through. Its console is at the back.')}}
  return null}
{const f=worldPrompt;worldPrompt=function(){try{const r=mq170Prompt();if(r)return r}catch(e){if(!MQ170.err++)console.warn('v151 drill prompt',e)}return f.apply(this,arguments)}}
{const f=portalPrompt;portalPrompt=function(){try{if(mq170In3()&&MQ170.S){const R=mq170Plan(),P=pl.position;if(MQ170.E||Math.hypot(P.x-R.g.x,P.z-R.g.z)<5)return null}}catch(_){}return f.apply(this,arguments)}}
{const f=doRecall;doRecall=function(){if(MQ170.E)return say('⚙️ You cannot leave the drill now. Bore through, or fall trying.');return f.apply(this,arguments)}}
{const f=toggleMount;toggleMount=function(){if(MQ170.E)return say('⚙️ No mount will come near the roaring drill.');return f.apply(this,arguments)}}

// ---------------- the repairs (v168: timed work at the box, each with its own motion; they do not pause the game) ----------------
// (they replace v151's Thaw / Rewire / Rebuild mini-game windows.) F at a broken box starts the work: the hero steps up to the box,
// faces it and works while a ring over the box fills:
//  * Thaw (MQ170.rt 3 s): a lit torch held out to the ice and waved slowly over it; the crust melts down and steams away.
//  * Rewire (6 s): down on one knee at the panel, a spanner turning in one hand, the other pushing each loose cable up into its socket.
//  * Rebuild (10 s): a hammer brought down on the cabinet again and again, the other hand bracing it; the cabinet is knocked upright
//    and the panel, the gauges and the lever jump back into place one by one.
// Moving (or Esc, or a dodge) steps away and a hit knocks you away: the work stops, but what is done stays done (E.box[i].rp), so F
// again carries on from there. The box changing state (a troll smashing a frozen box) starts that box's work afresh.
var DR170W={kn:{thaw:'Thawing',wire:'Rewiring',rebuild:'Rebuilding'},vb:{thaw:'Thaw',wire:'Rewire',rebuild:'Rebuild'},ic:{thaw:'🔥',wire:'🔧',rebuild:'🔨'},
  sd:{thaw:1.2,wire:.8,rebuild:1.0},col:{thaw:'#ffb060',wire:'#ffd040',rebuild:'#ff8a5a'},tools:{},tool:null,hid:[],rest:null,kT:null};   // kT: pictures hold the motion at this progress
function dr170Kind(s){return s==='frozen'?'thaw':s==='fault'?'wire':s==='smashed'?'rebuild':null}
function dr170Open(i,kind){const E=MQ170.E,S=MQ170.S;if(!E||!S||MQ170.W||hero.hp<=0)return;const b=E.box[i],B=S.box[i];if(!b||!B)return;kind=dr170Kind(b.s);if(!kind)return;
  if(riding)try{dismount()}catch(_){}try{if(typeof orbEnd=='function'&&typeof orb!='undefined'&&orb)orbEnd()}catch(_){}atkHeld=false;
  // step up to the box's front (its panel faces the drill), facing it
  const P=pl.position,dx=Math.sin(B.g.rotation.y),dz=Math.cos(B.g.rotation.y);
  const sd=DR170W.sd[kind],lk=new THREE.Vector3(B.x+dx*sd,0,B.z+dz*sd);if(solid(Math.round(lk.x),Math.round(lk.z)))lk.set(P.x,0,P.z);
  P.x=lk.x;P.z=lk.z;pl.step=null;hero.dash=null;
  const W={i,kind,lock:lk,hp:hero.hp,ry:Math.atan2(B.x-lk.x,B.z-lk.z),t:0,need:MQ170.rt[kind],k0:0,seat:dr170Seats(kind,b.rp||0)};MQ170.W=W;pl.rotation.y=W.ry;
  dr170Tool(kind);try{const T=DR170_T[kind];haPlay(T.ms,T.t,2,null,.25);if(HA.cur)HA.cur.dr170=1}catch(_){}svSnd(kind==='thaw'?'hiss':kind==='wire'?'hum':'heavy',.5,1.3);dr170Ring()}
// stop working: ok = the repair is finished (the box runs again)
function dr170Close(ok){const W=MQ170.W;if(!W)return;MQ170.W=null;dr170Tool(null);try{if(HA.cur&&HA.cur.dr170)haCancel(false)}catch(_){}dr170Ring();
  const E=MQ170.E;if(ok&&E){dr170Fix(W.i);say('🔧 The '+MQ170.bn[W.i].toLowerCase()+' is running again.')}}
function dr170Win(W){W=W||MQ170.W;if(!W||MQ170.W!==W)return;const b=MQ170.E&&MQ170.E.box[W.i];if(b)b.rp=1;dr170Close(true)}
// tests: finish the repair in hand at once
function dr170Solve(){const W=MQ170.W;if(!W)return false;dr170Win(W);return true}
// the steps of a repair already done (cables seated; the cabinet upright, then each piece back): a sound and a burst as each lands
function dr170Seats(kind,p){return kind==='wire'?[.22,.52,.82].filter(x=>p>=x).length:kind==='rebuild'?[.15,.36,.62,.88].filter(x=>p>=x).length:0}
function dr170WTick(dt,now,al){const W=MQ170.W;if(!W)return;const E=MQ170.E,b=E&&E.box[W.i],B=MQ170.S&&MQ170.S.box[W.i];
  if(!b||!B||dr170Kind(b.s)!==W.kind){dr170Close(false);return}
  const pc=()=>Math.round((b.rp||0)*100)+'%',n=MQ170.bn[W.i].toLowerCase();
  if(hero.hp<W.hp-.5){dr170Close(false);pl.step={x:-Math.sin(W.ry),z:-Math.cos(W.ry),sp:7,t:.14};say('💢 Knocked away from the '+n+' ('+pc()+' done): F to carry on.');return}
  if(al>0||hero.dash||hero.hp<=0){dr170Close(false);if(hero.hp>0)say('🔧 You step away from the '+n+' ('+pc()+' done): F to carry on.');return}
  W.hp=Math.max(W.hp,hero.hp);pl.position.x=W.lock.x;pl.position.z=W.lock.z;pl.step=null;pl.rotation.y=W.ry;
  W.t+=dt;b.rp=Math.min(1,(b.rp||0)+dt/W.need);
  // the motion: a loop of the kind's body track (the hands are put on the tools after the animation, dr170Aim)
  const T=DR170_T[W.kind];if(!HA.cur||HA.cur.pose!==T.t){haPlay(T.ms,T.t,2,null,.25);if(HA.cur)HA.cur.dr170=1}
  try{dr170Fx(W,B,b,dt,now)}catch(e){if(!MQ170.err++)console.warn('v168 repair fx',e)}dr170Part(B,b.s,b.rp);dr170Ring();
  if(b.rp>=1)dr170Close(true)}
addEventListener('keydown',e=>{if(MQ170.W&&e.key==='Escape'){dr170Close(false);e.stopImmediatePropagation()}},true);
// ---- the tools: a torch, a spanner, a hammer (each built along +y from the grip; placed in the world every frame) ----
function dr170ToolMk(kind){const M=dr170Mats(),g=new THREE.Group(),S=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8,flatShading:true},o||{}));
  const add=(geo,mat,x,y,z,rx,ry,rz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;g.add(m);return m};
  if(kind==='thaw'){add(new THREE.CylinderGeometry(.022,.028,.5,7),M.wood,0,.1,0);add(new THREE.CylinderGeometry(.05,.04,.14,8),S(0x3a2a1c,{roughness:.95}),0,.4,0);
    add(new THREE.TorusGeometry(.044,.011,4,10),M.iron2,0,.33,0,Math.PI/2,0,0);
    // the flame: stays upright (turned back against the torch every frame), flickers
    const fl=new THREE.Group();fl.position.y=.48;g.add(fl);const F=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
    const c1=new THREE.Mesh(new THREE.ConeGeometry(.075,.3,7),F(0xff6a1a,.85));c1.position.y=.1;fl.add(c1);const c2=new THREE.Mesh(new THREE.ConeGeometry(.045,.2,6),F(0xffd060,.95));c2.position.y=.07;fl.add(c2);
    const gl=kqSpr(0xff8a2a,.55);gl.material=gl.material.clone();gl.material.opacity=.7;gl.position.y=.08;fl.add(gl);g.userData.fl=fl;g.userData.cn=[c1,c2];g.userData.gl=gl}
  else if(kind==='wire'){const st=M.steel;add(new THREE.BoxGeometry(.035,.3,.016),st,0,.12,0);add(new THREE.BoxGeometry(.06,.05,.018),st,0,.29,0);
    [-1,1].forEach(s=>add(new THREE.BoxGeometry(.016,.06,.018),st,s*.025,.335,0));add(new THREE.CylinderGeometry(.024,.024,.12,6),S(0x8a2a1a),0,-.02,0)}
  else{add(new THREE.CylinderGeometry(.02,.026,.48,7),M.wood,0,.15,0);add(new THREE.CylinderGeometry(.028,.028,.1,7),S(0x3a2418,{roughness:.95}),0,-.04,0);
    add(new THREE.BoxGeometry(.12,.12,.3),M.iron,0,.42,0);add(new THREE.BoxGeometry(.135,.135,.05),M.iron2,0,.42,.15);add(new THREE.BoxGeometry(.13,.13,.04),M.iron2,0,.42,-.14)}
  g.userData.k=kind;g.visible=false;scene.add(g);return g}
function dr170Tool(kind){const D=DR170W;if(D.tool){D.tool.visible=false;D.tool=null}D.hid.forEach(o=>o.visible=true);D.hid=[];const S=MQ170.S;if(S&&S.tl)S.tl.intensity=0;
  if(!kind||!pl)return;try{const t=D.tools[kind]||(D.tools[kind]=dr170ToolMk(kind));t.visible=true;D.tool=t;(pl.gearG||[]).forEach(o=>{if(o&&o.visible){o.visible=false;D.hid.push(o)}})}catch(e){console.warn('v168 tool',e)}}
// ---- the body motions (ordinary attack tracks with no hit, looped while working) ----
var DR170_T=(function(){const E=atkEyes,T={};
  // thaw: standing, leaning in a little, the free arm raised to shield the face from the heat
  const th=x=>E(Object.assign({sx:.14,dy:-.04,lk:.2,rk:.1,lh:-.12,lx:-1.05,lz:.35,le:-1.45,hx:.12},x));
  T.thaw={ms:1800,t:atkTrack([[0,th({})],[.5,th({sx:.2,sy:.1,dy:-.06,hx:.18})],[1,th({})]],true)};
  // rewire: down on one knee at the panel, bent in to it
  const wr=x=>E(Object.assign({sx:.38,dy:-.46,lh:-1.45,lk:1.5,rh:.35,rk:1.75,hx:.3},x));
  T.wire={ms:1300,t:atkTrack([[0,wr({})],[.5,wr({sx:.44,sy:-.08})],[1,wr({})]],true)};
  // rebuild: feet apart, rising up with the swing and bending into the blow (dr170Aim moves the hammer from the same progress)
  const rb=x=>E(Object.assign({sx:.16,dy:-.06,lk:.3,rk:.22,lh:-.2,rh:.1},x));
  T.rebuild={ms:900,t:atkTrack([[0,rb({})],[.45,rb({sx:-.06,sy:.2,dy:-.01,lk:.15,rk:.12}),'io'],[.6,rb({sx:.32,sy:-.12,dy:-.12,lk:.4,rk:.3}),'in2'],[1,rb({}),'io']],true)};
  return T})();
// the hammer's swing: [progress, arm angle, hammer angle] (radians above the hero's forward, in the plane of the blow)
var DR170_SW=[[0,-.2,-.5],[.45,1.25,2.4],[.6,-.1,-.4],[1,-.2,-.5]];
function dr170Sw(k){const K=DR170_SW;let i=0;while(i<K.length-2&&k>K[i+1][0])i++;const a=K[i],b=K[i+1],t0=Math.max(0,Math.min(1,(k-a[0])/((b[0]-a[0])||1))),t=i==1?t0*t0:t0*t0*(3-2*t0);
  return [a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
// after every animation layer: the tool in the world and the hands on it (two-bone arm IK); the arm bones are put back next frame
function dr170Restore(){const R=DR170W.rest;DR170W.rest=null;if(R)R.forEach(r=>r.o.quaternion.copy(r.q))}
function dr170Aim(now){const W=MQ170.W,t=DR170W.tool,S=MQ170.S;if(!W||!t||!S)return;const B=S.box[W.i],b=pl.bones;if(!B||!b||!b.aR0||!b.aR1||!b.aR2||!b.aL0||!b.aL1||!b.aL2||typeof fc116IK!='function')return;
  const V=THREE.Vector3,up=new V(0,1,0),f=new V(Math.sin(W.ry),0,Math.cos(W.ry));pl.updateMatrixWorld(true);B.g.updateMatrixWorld(true);
  const hs=Math.sign(pl.worldToLocal(b.aR0.getWorldPosition(new V())).x)||1,s=new V(f.z,0,-f.x).multiplyScalar(hs),sR=b.aR0.getWorldPosition(new V()),sL=b.aL0.getWorldPosition(new V());
  const BL=(x,y,z)=>B.g.localToWorld(new V(x,y,z)),T=now/1000,dn=new V(0,-1,0);
  DR170W.rest=[b.aR0,b.aR1,b.aR2,b.aL0,b.aL1,b.aL2].map(o=>({o,q:o.quaternion.clone()}));
  const ik=(R,tg,pole)=>{try{if(R)fc116IK(sR,b.aR0,b.aR1,b.aR2,tg,pole,1);else fc116IK(sL,b.aL0,b.aL1,b.aL2,tg,pole,1)}catch(e){if(!DR170W.ie){DR170W.ie=1;console.warn('v168 ik',e)}}};
  // everything is measured from the hero's own shoulder and arm (the races differ a lot in size); the tools are scaled to the arm
  const A=Math.max(.15,sR.distanceTo(b.aR1.getWorldPosition(new V()))+b.aR1.getWorldPosition(new V()).distanceTo(b.aR2.getWorldPosition(new V()))),ts=Math.max(.7,Math.min(2.2,A/.34));t.scale.setScalar(ts);
  let d,hand,x=null;
  if(W.kind==='thaw'){
    // the torch held out and up, its flame on the ice, waved slowly across it
    hand=sR.clone().addScaledVector(f,.75*A).addScaledVector(up,.3*A+.12*A*Math.sin(T*1.7)).addScaledVector(s,.1*A+.22*A*Math.sin(T*2.3));
    d=f.clone().multiplyScalar(.8).addScaledVector(up,.62).addScaledVector(s,-.12-.2*Math.sin(T*2.3)).normalize()}
  else if(W.kind==='wire'){
    // the spanner on the panel by the cable being seated, turning back and forth; the other hand on that cable's end
    const q=Math.min(2,dr170Seats('wire',(MQ170.E.box[W.i].rp||0))),c=B.cab[q],head=BL(-.25+q*.25+.08,.66,.44);
    d=f.clone().multiplyScalar(.9).addScaledVector(up,.15).addScaledVector(s,.25).normalize();hand=head.clone().addScaledVector(d,-.3*ts);
    const tw=.6*Math.sin(T*7);x=s.clone().applyAxisAngle(d,tw);
    if(c){c.updateMatrixWorld(true);const ct=c.localToWorld(new V(0,.36,0)).addScaledVector(f,-.04);ik(false,ct,s.clone().multiplyScalar(-.6).add(dn))}}
  else{
    // the hammer: up over the shoulder, then down onto the cabinet (the blow lands at .6 of the loop)
    const k=HA.cur&&HA.cur.pose===DR170_T.rebuild.t?HA.cur.k:0,[al,th]=dr170Sw(k),sh=sR.clone().addScaledVector(s,-.15*A);
    hand=sh.clone().addScaledVector(f,.9*A*Math.cos(al)).addScaledVector(up,.9*A*Math.sin(al));d=f.clone().multiplyScalar(Math.cos(th)).addScaledVector(up,Math.sin(th)).normalize();
    x=s.clone();
    // the blow lands: sparks and a clang where the head meets the iron
    if(W.k0<.6&&k>=.6){const hp=hand.clone().addScaledVector(d,.4*ts);burst(hp,0xffd07a,10,2.2,1.6,.3);burst(hp,0x9aa0a8,4,1.4,1.4,.5);svSnd('heavy',.35,1.9);shake(.06)}W.k0=k;
    // the other hand out low to the cabinet, steadying it
    ik(false,sL.clone().addScaledVector(f,.85*A).addScaledVector(up,-.25*A).addScaledVector(s,.1*A),s.clone().multiplyScalar(-.7).add(dn))}
  // the tool: its +y along d (a spanner and a hammer turned about it too), the hand on its grip
  const y=d.clone(),x0=x||new V().crossVectors(y,s),xx=x0.clone().addScaledVector(y,-x0.dot(y));if(xx.lengthSq()<1e-6)xx.set(1,0,0);xx.normalize();
  const z=new V().crossVectors(xx,y).normalize();t.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xx,y,z));
  ik(true,hand,s.clone().multiplyScalar(.6).add(dn));
  // the grip in the hand (if the arm falls short of where the tool wanted to be, the tool follows the hand)
  try{b.aR2.getWorldPosition(t.position)}catch(_){t.position.copy(hand)}t.updateMatrixWorld(true);
  if(t.userData.fl){const fl=t.userData.fl;fl.quaternion.copy(t.quaternion).invert();const fk=1+.18*Math.sin(T*23)+.12*Math.sin(T*37);t.userData.cn.forEach((c,q)=>c.scale.set(1,fk*(1+q*.1),1));t.userData.gl.scale.setScalar(.9*fk);
    const tl=S.tl;if(tl){fl.getWorldPosition(tl.position);tl.position.y+=.12;tl.intensity=.9*fk}}}
{const f=animHero;animHero=function(now,mv,h){const me=(h||pl)===pl;if(me){dr170Restore();if(MQ170.W){pl.rotation.y=MQ170.W.ry;if(DR170W.kT!=null&&HA.cur&&HA.cur.dr170)HA.cur.k=DR170W.kT}}const r=f.apply(this,arguments);
  try{if(me&&MQ170.W)dr170Aim(now)}catch(e){if(!DR170W.ae){DR170W.ae=1;console.warn('v168 aim',e)}}return r}}
// ---- what the work does to the box, frame by frame ----
function dr170Fx(W,B,b,dt,now){const p=b.rp||0,V=THREE.Vector3,g=B.g,BL=(x,y,z)=>g.localToWorld(new V(x,y,z));g.updateMatrixWorld(true);const n=dr170Seats(W.kind,p);
  if(W.kind==='thaw'){const t=DR170W.tool;if(t&&t.userData.fl&&Math.random()<dt*30){const q=t.userData.fl.getWorldPosition(new V());q.y+=.12;burst(q,Math.random()<.5?0xffa040:0xffd070,1,.3,1.1,.35)}
    if(Math.random()<dt*9)burst(BL((Math.random()-.5)*.7,.5+Math.random()*.9*(1-p),.4),0xe8eef4,1,.25,1.2,1.1);
    if(Math.random()<dt*6)burst(BL((Math.random()-.5)*.8,.25+Math.random()*.6,.38),0x8ad8ff,1,.15,-.6,.6);
    if(Math.random()<dt*1.2)svSnd('hiss',.18,1.4+Math.random()*.4)}
  else if(W.kind==='wire'){const q=Math.min(2,n);if(Math.random()<dt*9*(1-p*.7))burst(BL(-.25+q*.25,.6+Math.random()*.2,.48),0xffe07a,2,1.8,1.4,.25);
    if(Math.random()<dt*1.5)svSnd('hum',.12,1.6)}
  else if(Math.random()<dt*3)burst(BL((Math.random()-.5)*.8,.1,.6),0x9aa0a8,1,.6,.8,.5);
  if(n>W.seat){W.seat=n;if(W.kind==='wire'){burst(BL(-.25+(n-1)*.25,.55,.45),0x7aff8a,10,1.2,1,.35);svSnd('bell',.3,2.2)}
    else if(W.kind==='rebuild'){const P=n>1?B.parts[n-2]:null,q=P?BL(P.on[0],P.on[1],P.on[2]+.05):BL(0,.8,.4);burst(q,0xffd07a,14,2,1.6,.35);svSnd('heavy',.55,n>1?1.5:.9);if(n===1)shake(.12)}}}
// the ring over the box: how far the work has come
(function(){const st=document.createElement('style');st.textContent=`
#dr170r{position:absolute;z-index:8;transform:translate(-50%,-100%);pointer-events:none;text-align:center;font:600 11.5px/1.25 system-ui,sans-serif;color:#f0e6d8;text-shadow:0 1px 3px #000;white-space:nowrap}
#dr170r.hide{display:none}#dr170r svg{display:block;margin:0 auto 2px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.7))}#dr170r .s{color:#b8a890;font-weight:500;font-size:10.5px}`;document.head.appendChild(st)})();
function dr170Ring(){let el=document.getElementById('dr170r');const W=MQ170.W,S=MQ170.S;if(!W||!S||!MQ170.E){if(el)el.classList.add('hide');return}
  if(!el){el=document.createElement('div');el.id='dr170r';($('stage')||document.body).appendChild(el)}el.classList.remove('hide');
  const B=S.box[W.i],p=MQ170.E.box[W.i].rp||0,c=DR170W.col[W.kind],L=2*Math.PI*21,left=Math.max(0,(1-p)*W.need);
  const k=W.kind+Math.round(p*100);if(el.dataset.k!==k){el.dataset.k=k;el.innerHTML=`<svg width="54" height="54" viewBox="0 0 54 54"><circle cx="27" cy="27" r="21" fill="rgba(10,12,16,.72)" stroke="rgba(255,255,255,.12)" stroke-width="5"/>
    <circle cx="27" cy="27" r="21" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(L*p).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 27 27)"/>
    <text x="27" y="33" text-anchor="middle" font-size="17">${DR170W.ic[W.kind]}</text></svg>${DR170W.kn[W.kind]} · ${Math.round(p*100)}%<div class="s">${left.toFixed(1)} s left · move or Esc to stop</div>`}
  try{const v=gY(B.g.position,2.9).project(cam),s=$('stage');el.style.left=((v.x*.5+.5)*s.clientWidth).toFixed(0)+'px';el.style.top=((-v.y*.5+.5)*s.clientHeight).toFixed(0)+'px'}catch(_){}}
// no swings or spells while repairing
{const f=swing;swing=function(){if(MQ170.W)return;return f.apply(this,arguments)}}
{const f=cast;cast=function(){if(MQ170.W)return;return f.apply(this,arguments)}}
// ---------------- the event HUD ----------------
(function(){const st=document.createElement('style');st.textContent=`
#dr170h{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:7;width:320px;max-width:72vw;pointer-events:none;padding:6px 10px 8px;border-radius:8px;
  background:linear-gradient(180deg,rgba(20,24,30,.88),rgba(10,12,16,.92));border:1px solid rgba(255,208,122,.35);box-shadow:0 4px 18px rgba(0,0,0,.5);font:12px/1.35 system-ui,sans-serif;color:#e0e6ec}
#dr170h.hide{display:none}#dr170h .t{font-family:Cinzel,Georgia,serif;letter-spacing:.12em;font-size:10px;text-transform:uppercase;color:#ffd07a;display:flex;justify-content:space-between}
#dr170h .bar{height:7px;margin:3px 0 6px;background:rgba(0,0,0,.55);border-radius:3px;overflow:hidden}#dr170h .bar i{display:block;height:100%;background:linear-gradient(90deg,#c88a3a,#ffe0a0)}
#dr170h .bx{display:flex;gap:6px;justify-content:space-between}#dr170h .b{flex:1;text-align:center;padding:3px 2px;border-radius:5px;background:rgba(0,0,0,.4);font-size:10.5px;border:1px solid rgba(255,255,255,.08)}
#dr170h .b i{display:block;width:10px;height:10px;border-radius:50%;margin:0 auto 2px}`;document.head.appendChild(st)})();
function dr170Hud(){let el=document.getElementById('dr170h');const E=MQ170.E;if(!E){if(el)el.classList.add('hide');return}if(!el){el=document.createElement('div');el.id='dr170h';($('stage')||document.body).appendChild(el)}el.classList.remove('hide');
  const k=E.prog/MQ170.need,r=dr170Rate(E),off=dr170Off(E),live=enemies.filter(e=>e.dr170t&&!e.dead).length;
  el.innerHTML=`<div class="t"><span>⚙️ ${r>=1?'Drilling at full speed':r>0?'Drilling slowly':'The drill has stopped'}</span><span>${Math.round(k*100)}%</span></div><div class="bar"><i style="width:${(k*100).toFixed(1)}%;${r<1?'background:linear-gradient(90deg,#8a5a2a,#c8a060)':''}"></i></div>
  <div class="sp" style="text-align:center;margin:-3px 0 5px;font-size:11px;color:${r>=1?'#7aff8a':r>0?'#ffb040':'#ff6a5a'}">${dr170Speed(E)}</div>
  <div class="bx">${E.box.map((b,i)=>`<div class="b"><i style="background:${MQ170.stC[b.s]};box-shadow:0 0 6px ${MQ170.stC[b.s]}"></i>${['NW','NE','SW','SE'][i]} · ${MQ170.stN[b.s]}</div>`).join('')}</div>
  <div class="t" style="margin-top:4px"><span>Frost Trolls: ${live}</span><span>${off?'switch on / repair every box':''}</span></div>`}
// the drill's speed in plain words
function dr170Speed(E){const r=dr170Rate(E),n=dr170Off(E);return r>=1?'All four boxes running: full speed':r>0?n+' box'+(n>1?'es':'')+' offline: '+Math.round(r*100)+'% speed':'No box running: no power'}
// ---------------- the world tick ----------------
function mq170Tick(dt,now,al){const in3=mq170In3(),t=now/1000;
  if(in3&&!MQ170.S)try{mq170Build()}catch(err){console.error('v151 drill build',err);MQ170.err++}
  const S=MQ170.S;if(!S)return;[S.cliff.g,S.drill.g,S.con].concat(S.box.map(b=>b.g)).forEach(o=>o.visible=in3);if(!in3)S.lt.intensity=0;
  if(in3){S.box.forEach((B,i)=>{const s=MQ170.E?MQ170.E.box[i].s:mq170Done()?'on':'off';B.halo.scale.setScalar(1.1*(1+.15*Math.sin(t*(s=='on'?3:8)+i)));
      if(s==='fault'&&Math.random()<dt*14*(1-.8*((MQ170.E&&MQ170.E.box[i].rp)||0))){const p=new THREE.Vector3(B.x,GH(B.x,B.z)+.9+Math.random()*.6,B.z);burst(p,0xffd07a,3,2.2,1.6,.3)}if(s==='frozen'&&Math.random()<dt*3*(1-((MQ170.E&&MQ170.E.box[i].rp)||0)))burst(new THREE.Vector3(B.x,GH(B.x,B.z)+1.5,B.z),0xd8f4ff,1,.2,.4,1)});
    if(mq170Done()){S.cliff.gl.material.opacity=.45+.12*Math.sin(t*2)}}
  if(MQ170.E)try{mq170ETick(dt,now,al)}catch(err){if(!MQ170.err++)console.error('v151 drill',err)}
  if(now-MQ170.t>400){MQ170.t=now;try{if(in3)mq143Trk()}catch(_){}}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{mq170Tick(dt,now,al)}catch(err){if(!MQ170.err++)console.warn('v151 drill tick',err)}return r}}
// ---------------- the tracker (chapter 3 in the main-quest box, in Burningeye III) ----------------
{const f=mq143Trk;mq143Trk=function(){try{if(mq170In3()){MQ143.trkK='';return mq170Trk()}}catch(err){if(!MQ170.err++)console.warn('v151 drill trk',err)}MQ170.trkK='';return f.apply(this,arguments)}}
function mq170Trk(){const el=$('mqt143');if(!el)return;const hide=(typeof uiOpen=='function'&&uiOpen())||(mq170Done()&&insReach(2)>=3),E=MQ170.E;
  const key=(hide?'h':'s')+mq170Done()+'|'+(E?Math.round(E.prog)+E.box.map(b=>b.s[0]).join(''):'-');if(key===MQ170.trkK)return;MQ170.trkK=key;
  if(hide){el.classList.add('hide');mq143TrkPos();return}
  const o=(a,b,d)=>`<div class="o${d?' d':''}"><span>${a}</span>${b!=null?'<b>'+b+'</b>':''}</div>`;let h='<div class="k">⚜ Main quest · Burningeye Summit</div><div class="h">'+MQ170.name+'</div>';
  if(mq170Done())h+=o('Enter the tunnel to '+mq170Den(),null,1);
  else if(E)h+=o('Keep all four control boxes running',E.box.filter(b=>b.s==='on').length+'/4')+o('Bore through the mountain',Math.round(E.prog/MQ170.need*100)+'%')+o('Drill speed',Math.round(dr170Rate(E)*100)+'%');
  else h+=o('Start the great drill at the end of the road');
  el.innerHTML=h;el.classList.add('z2');el.classList.remove('hide');mq143TrkPos()}
// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.mq170={v:151,st:MQ170.st}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.mq170;if(MQ170.E)mq170Fail('left');MQ170.st=q&&typeof q=='object'?Math.max(0,Math.min(1,q.st|0)):0;MQ170.trkK='';mq170Sync()}catch(err){console.warn('v151 drill load',err)}return r}}
