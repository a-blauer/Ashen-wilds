// ================= v151 The Mountain Drill — Burningeye Summit III main quest: drill through the mountain into the Sovereign's Den =================
// Chapter 3 of Burningeye Summit's main quest line (1 The Frozen Maw 3152 · 2 The Frozen Gate 3160). The gateway to the Den at the end of
// Stormcrown (Burningeye III) is gone: the road ends at a sheer face of the mountain, and before it stands a great essence drill, its bit
// against the rock, wired to four control boxes round the yard.
//  * F at the drill's console starts the drill: a special event that cannot be stopped (the hero is held in the drill yard, no recall)
//    until the mountain is bored through (MQ170.need, 90 s of drilling) or the hero falls (the drill winds down and the bore is lost).
//  * The drill only turns while all four control boxes are lit and running. Each box starts dark: F switches it on. Running boxes fail
//    on their own: one FREEZES (F opens the Thaw window: hold the heater and keep the needle in the green band until the ice is gone) or
//    MALFUNCTIONS (the Rewire window: drag each loose wire to the socket of its colour).
//  * Frost Trolls come up the road and out of the snow and go for the boxes, not for you: a troll that reaches a box raises its fists
//    (a warning ring) and SMASHES it (the Rebuild window: drag each broken piece back into its place). Hit a troll and it turns on you.
//  * The repair windows do not pause the game: the drill and the trolls keep going while you work, you cannot move, and a hit knocks
//    you away from the box (the window closes).
//  * Bored through: the rock face bursts open on a tunnel; F at it goes to the Sovereign's Den.
// State MQ170.st: 0 · 1 the tunnel is open. Done also when the Den has been reached (mq170Done). Saved as x2.mq170 {st}. A save made
// mid-drill loads with the drill at rest. Co-op: local to each player (the trolls are minions, never shared).
var MQ170={name:'The Mountain Drill',st:0,S:null,E:null,err:0,t:0,trkK:'',need:90,lv:25,leash:16.5,W:null,
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
// a control box: an iron cabinet with a lever, gauges and a status lamp; an ice crust (frozen), sparks (fault), broken pieces (smashed)
function dr170Box(i){const M=dr170Mats(),k=gb151Kit(),g=new THREE.Group();g.userData.psNo=1;
  k.m(svG('db_c',()=>new THREE.BoxGeometry(1.0,1.3,.7)),M.iron,0,.8,0);k.m(svG('db_b',()=>new THREE.BoxGeometry(1.2,.16,.9)),M.iron2,0,.08,0);k.m(svG('db_p',()=>new THREE.BoxGeometry(.8,.9,.04)),M.panel,0,.85,.36);
  for(let q=0;q<2;q++){k.m(svG('db_g',()=>new THREE.CylinderGeometry(.12,.12,.04,12)),M.brass,-.2+q*.4,1.1,.39,Math.PI/2,0,0);k.m(svG('db_gf',()=>new THREE.CircleGeometry(.09,10)),M.snow,-.2+q*.4,1.1,.41)}
  k.m(svG('db_l',()=>new THREE.CylinderGeometry(.03,.03,.45,6)),M.steel,.25,.65,.5,.5,0,0);k.m(svG('db_lk',()=>new THREE.SphereGeometry(.07,8,6)),M.rubber,.25,.85,.62);
  k.m(svG('db_cb',()=>svTube([[0,.1,-.35],[0,.05,-.9],[0,.04,-1.6]],.07,6)),M.rubber,0,0,0);k.m(svG('db_ro',()=>new THREE.BoxGeometry(1.1,.12,.8)),M.iron2,0,1.5,0);
  const body=k.done();g.add(body);
  const lamp=new THREE.Mesh(svG('db_lm',()=>new THREE.SphereGeometry(.16,10,8)),new THREE.MeshBasicMaterial({color:0x5a6470}));lamp.position.set(0,1.7,0);g.add(lamp);
  const halo=kqSpr(0x7aff8a,1.1);halo.material=halo.material.clone();halo.position.copy(lamp.position);g.add(halo);
  // the frozen crust
  const ice=new THREE.Group();g.add(ice);const ki=gb151Kit();ki.lump(1,1850+i,M.glass,0,.8,0,.8,.95,.6,0,.2);for(let q=0;q<5;q++)ki.crys(q,dr170Mats().glass,(q-2)*.22,1.45,.1,(q-2)*.3,1,.3,.07,.3+q%2*.2);ice.add(ki.done());ice.visible=false;
  // the broken pieces (smashed): the panel torn off, a gauge, the lever lying in the snow
  const brk=new THREE.Group();g.add(brk);const kp=gb151Kit();kp.m(svG('db_p',()=>new THREE.BoxGeometry(.8,.9,.04)),M.panel,.5,.05,.9,-Math.PI/2+.2,.4,0);kp.m(svG('db_g',()=>new THREE.CylinderGeometry(.12,.12,.04,12)),M.brass,-.6,.03,.7);
  kp.m(svG('db_l',()=>new THREE.CylinderGeometry(.03,.03,.45,6)),M.steel,-.3,.03,1.1,Math.PI/2,0,.7);brk.add(kp.done());brk.visible=false;
  return {g,body,lamp,halo,ice,brk,i}}
// the console at the drill's back: a lectern of levers and a big wheel
function dr170Console(){const M=dr170Mats(),k=gb151Kit();k.m(svG('dc_b',()=>new THREE.BoxGeometry(1.4,1.1,.7)),M.iron,0,.55,0);k.m(svG('dc_t',()=>new THREE.BoxGeometry(1.5,.12,.9)),M.iron2,0,1.15,0,-.3,0,0);
  for(let i=0;i<3;i++)k.m(svG('dc_lv',()=>new THREE.CylinderGeometry(.03,.03,.5,6)),M.steel,-.4+i*.4,1.4,.1,-.3,0,0);k.m(svG('dc_w',()=>new THREE.TorusGeometry(.32,.04,5,14)),M.brass,0,1.55,-.25,.2,0,0);
  const g=k.done();g.userData.psNo=1;return g}
KQSH151.ddrill2=()=>dr170Drill().g;KQSH151.ddrill=()=>{const g=new THREE.Group(),c=dr170Cliff(),d=dr170Drill();g.add(c.g);d.g.position.z=4.4;g.add(d.g);return g};KQSH151.dbox=()=>{const b=dr170Box(0);b.ice.visible=true;return b.g};KQSH151.dbox2=()=>{const b=dr170Box(1);b.brk.visible=true;b.body.rotation.z=.35;return b.g};

// ---------------- the world ----------------
function mq170Build(){if(MQ170.S)return MQ170.S;const R=mq170Plan(),G=R.g,S={box:[]};MQ170.S=S;const y=(p)=>GH(p.x,p.z);
  S.cliff=dr170Cliff();S.cliff.g.position.set(R.face.x,y(R.face),R.face.z);S.cliff.g.rotation.y=G.ry;scene.add(S.cliff.g);
  S.drill=dr170Drill();S.drill.g.position.set(R.drill.x,y(R.drill),R.drill.z);S.drill.g.rotation.y=G.ry;scene.add(S.drill.g);S.d0=S.drill.g.position.clone();
  S.con=dr170Console();S.con.position.set(R.con.x,y(R.con),R.con.z);S.con.rotation.y=G.ry;scene.add(S.con);
  R.box.forEach((b,i)=>{const B=dr170Box(i);B.g.position.set(b.x,y(b),b.z);B.g.rotation.y=Math.atan2(R.drill.x-b.x,R.drill.z-b.z);scene.add(B.g);B.x=b.x;B.z=b.z;S.box.push(B)});
  S.tunT=MQ170.tunT||[];
  S.lt=new THREE.PointLight(0x7ad8ff,0,10,1.6);S.lt.position.set(R.drill.x,y(R.drill)+4,R.drill.z);scene.add(S.lt);
  try{const r=RPORT.find(q=>q.k=='next'&&q.ig===insG(2,2));if(r){r.g.visible=false;MQ170.rp=r}}catch(_){}
  mq170Sync();return S}
function mq170Sync(){const S=MQ170.S;if(!S)return;const open=mq170Done(),E=MQ170.E;S.cliff.tun.visible=open;S.cliff.bore.visible=!open;
  S.tunT.forEach(k=>{if(open)CBLK.delete(k);else CBLK.add(k)});
  if(!E){S.cliff.bore.scale.set(open?.01:.01,open?.01:.01,1);S.drill.g.position.copy(S.d0)}
  S.box.forEach((B,i)=>dr170BoxLook(B,E?E.box[i].s:(open?'on':'off')))}
function dr170BoxLook(B,st){const c={off:0x3a4048,on:0x7aff8a,frozen:0x8ad8ff,fault:0xffb040,smashed:0x2a2020}[st]||0x3a4048;B.lamp.material.color.setHex(c);B.halo.material.color.setHex(st=='smashed'?0xff3a2a:c);
  B.halo.visible=st!='off';B.ice.visible=st=='frozen';B.brk.visible=st=='smashed';B.body.rotation.set(st=='smashed'?.25:0,0,st=='smashed'?.3:0);B.body.position.y=st=='smashed'?-.12:0}

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
// a box changes state (with its effect and a line in the log)
function dr170Set(i,s,why){const E=MQ170.E;if(!E)return;const b=E.box[i],B=MQ170.S.box[i],was=b.s;if(was===s)return;b.s=s;dr170BoxLook(B,s);MQ170.trkK='';const p=new THREE.Vector3(B.x,0,B.z);
  if(s==='on'){burst(gY(p,1.7),0x7aff8a,20,1.2,1.2,.5);svSnd('bell',.6,1.6);b.tf=12+Math.random()*12}
  else if(s==='frozen'){burst(gY(p,1),0xd8f4ff,30,1.5,1.5,.7);svSnd('crack',.9,1.2);popT(gY(p,2),'❄ FROZEN','#8ad8ff',true)}
  else if(s==='fault'){burst(gY(p,1.4),0xffd07a,30,2,2,.4);svSnd('zap',1,1);popT(gY(p,2),'⚡ MALFUNCTION','#ffb040',true)}
  else if(s==='smashed'){try{sk146Debris(gY(p,1),dr170Mats().iron,8,.15,4,5,1.3)}catch(_){}burst(gY(p,1),0xffa07a,30,2,2,.5);shake(.25);svSnd('heavy',1.1,.9);svSnd('crack',.8,1.4);popT(gY(p,2),'💥 SMASHED','#ff5a4a',true)}
  if(was==='on'&&s!=='on')say((s==='smashed'?'💥 ':s==='frozen'?'❄️ ':'⚡ ')+'The '+MQ170.bn[i].toLowerCase()+' is '+MQ170.stN[s]+': the drill stops!');
  const W=MQ170.W;if(W&&W.i===i&&s==='smashed'&&W.k!=='rebuild')dr170Close(false)}
function mq170ETick(dt,now){const E=MQ170.E,R=mq170Plan(),S=MQ170.S;if(!E||!S)return;E.t+=dt;
  if(hero.hp<=0||!mq170In3())return mq170Fail(hero.hp<=0?'dead':'left');
  {const p=pl.position,dx=p.x-R.yard.x,dz=p.z-R.yard.z,d=Math.hypot(dx,dz);if(d>MQ170.leash){p.x=R.yard.x+dx/d*MQ170.leash;p.z=R.yard.z+dz/d*MQ170.leash;if(now-(E.lw||0)>2500){E.lw=now;say('⚙️ You cannot leave the drill now!')}}}
  // drilling: only with all four boxes running
  const run=E.box.every(b=>b.s==='on');if(run!==!!E.run){E.run=run?1:0;MQ170.trkK='';svSnd(run?'charge':'hiss',.8,run?.7:.9)}
  if(run){E.prog=Math.min(MQ170.need,E.prog+dt);E.box.forEach((b,i)=>{b.tf-=dt;if(b.tf<=0)dr170Set(i,Math.random()<.55?'frozen':'fault')})}
  const k=E.prog/MQ170.need;S.drill.bit.rotation.z+=dt*(run?14:Math.max(0,(S.drill.bitV||0)));S.drill.bitV=run?14:Math.max(0,(S.drill.bitV||0)-dt*10);
  S.drill.g.position.copy(S.d0).add(new THREE.Vector3(-R.g.fx*k*1.6,0,-R.g.fz*k*1.6));S.cliff.bore.scale.set(.2+1.9*k,.2+1.9*k,1);S.lt.intensity=run?1.2+.4*Math.sin(now/60):.3;
  S.drill.glow.material.opacity=run?.9:.35;if(run&&Math.random()<dt*24){const p=new THREE.Vector3(R.face.x+(Math.random()-.5)*2.4,GH(R.face.x,R.face.z)+1.2+Math.random()*2.2,R.face.z);p.x+=R.g.fx*.6;p.z+=R.g.fz*.6;burst(p,Math.random()<.5?0xffd07a:0x9aa0a8,2,2.4,2,.5)}
  if(run&&Math.random()<dt*3)shake(.05);if(run&&Math.random()<dt*2){const c=new THREE.Vector3();S.drill.g.localToWorld(c.set(.6,5.6,1.8));burst(c,0xd8d8d8,3,.4,2,1.4)}
  // Frost Trolls for the boxes: more as the bore deepens
  E.trT-=dt;const live=enemies.filter(e=>e.dr170t&&!e.dead).length;
  if(E.trT<=0){E.trT=Math.max(5.5,10-k*4.5)+Math.random()*2;const n=Math.min(1+(k>.35?1:0)+(k>.75&&Math.random()<.5?1:0),6-live);
    for(let i=0;i<n;i++){let x=0,z=0,okp=false;for(let tr=0;tr<16&&!okp;tr++){const a=Math.random()*6.283,r=17+Math.random()*4,qx=R.yard.x+Math.sin(a)*r,qz=R.yard.z+Math.cos(a)*r;
        if((Math.sin(a)*R.g.fx+Math.cos(a)*R.g.fz)<-.15)continue;if(R.ok(qx,qz,.6)&&!solid(Math.round(qx),Math.round(qz))){x=qx;z=qz;okp=true}}
      if(!okp)continue;let e=null;try{e=spawnEnemy('troll',x,z,MQ170.lv,{minion:1})}catch(err){console.error('v151 troll',err)}if(!e)continue;
      e.dr170t=1;e.agg=0;e.c.n='Frost Troll Wrecker';e.dr={ph:'go',b:-1,t:0};const p=new THREE.Vector3(x,0,z);burst(gY(p,.5),0xe8f0f8,30,2,1.5,.8);svDecal(p,0xc8d8e8,1.6,2,.6)}
    if(n>0&&!E.hint){E.hint=1;say('🧌 Frost Trolls are going for the control boxes! Hit one and it will come for you instead.')}}
  if(E.prog>=MQ170.need)mq170Win();
  dr170WTick(dt,now);if(now-(E.hu||0)>150){E.hu=now;dr170Hud()}}
// a wrecker troll: walks to a box, raises its fists over it (a warning ring), smashes it; once hit it fights you instead
function dr170Troll(e,dt,now){const E=MQ170.E,S=MQ170.S;if(!E||!S){try{removeE(e)}catch(_){}return}const D=e.dr,m=e.m;
  const pick=()=>{const L=E.box.map((b,i)=>({i,b})).filter(q=>q.b.s!=='smashed'),on=L.filter(q=>q.b.s==='on'),C=on.length?on:L;if(!C.length)return -1;
    let best=C[0].i,bd=1e9;C.forEach(q=>{const B=S.box[q.i],d=Math.hypot(B.x-m.position.x,B.z-m.position.z)+Math.random()*6;if(d<bd){bd=d;best=q.i}});return best};
  if(D.b<0||E.box[D.b].s==='smashed'&&D.ph==='go'){D.b=pick();if(D.b<0){animC(m,now,false,0);return}}
  const B=S.box[D.b],dx=B.x-m.position.x,dz=B.z-m.position.z,L=Math.hypot(dx,dz);
  if(D.ph==='go'){m.ak=null;if(L>1.9){const sp=1.9;walkM(m,dx/L*sp*dt,dz/L*sp*dt);m.rotation.y=Math.atan2(dx,dz);animC(m,now,true,sp)}
    else{D.ph='wind';D.t=1.5;m.rotation.y=Math.atan2(dx,dz);try{D.w=svWarn({k:'c',r:1.3},{x:B.x,z:B.z,a:0},1.5,{col:0xff6a2a})}catch(_){}popT(gY(B.g.position,2.4),'⚠ A TROLL IS SMASHING A BOX','#ff9a5a')}}
  else if(D.ph==='wind'){D.t-=dt;m.ak={n:'slam',ph:0,k:Math.min(1,1-D.t/1.5)};animC(m,now,false,0);if(D.t<=0){D.ph='hit';D.t=.25}}
  else if(D.ph==='hit'){D.t-=dt;m.ak={n:'slam',ph:1,k:Math.min(1,1-D.t/.25)};animC(m,now,false,0);if(D.t<=0){if(E.box[D.b].s!=='smashed')dr170Set(D.b,'smashed');D.ph='rec';D.t=.8}}
  else{D.t-=dt;m.ak={n:'slam',ph:2,k:Math.max(0,D.t/.8)};animC(m,now,false,0);if(D.t<=0){m.ak=null;D.ph='go';D.b=-1}}}
{const f=eTick;eTick=function(e,dt,now){if(e&&e.dr170t&&!e.angry&&!e.dead){if(dt>0)try{dr170Troll(e,dt,now)}catch(err){if(!MQ170.err++)console.error('v151 wrecker',err)}return true}return f.apply(this,arguments)}}
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.dr170t&&!e.angry&&!e.dead&&d>0){e.angry=1;e.agg=1;e.hunt=1;e.m.ak=null;if(e.dr&&e.dr.w&&e.dr.w.kill)try{e.dr.w.kill()}catch(_){}dn(e.m.position,'!','#ff6a3a',-40,800)}return f.apply(this,arguments)}}
// the boxes' prompts and the console's
function mq170Prompt(){if(!mq170In3()||!MQ170.S)return null;const P=pl.position,R=mq170Plan(),E=MQ170.E;
  if(E){if(MQ170.W)return {label:'🔧 Repairing · Esc to step away',fn:()=>{}};
    for(const B of MQ170.S.box){if(Math.hypot(P.x-B.x,P.z-B.z)>2.3)continue;const b=E.box[B.i],n=MQ170.bn[B.i];
      if(b.s==='off')return {label:'F · Switch on the '+n.toLowerCase(),fn:()=>dr170Set(B.i,'on')};if(b.s==='on')return {label:'✅ The '+n.toLowerCase()+' is running',fn:()=>{}};
      if(b.s==='frozen')return {label:'F · Thaw the '+n.toLowerCase(),fn:()=>dr170Open(B.i,'thaw')};if(b.s==='fault')return {label:'F · Rewire the '+n.toLowerCase(),fn:()=>dr170Open(B.i,'wire')};
      return {label:'F · Rebuild the '+n.toLowerCase(),fn:()=>dr170Open(B.i,'rebuild')}}
    return {label:'⚙️ The drill: '+Math.round(E.prog/MQ170.need*100)+'% · boxes running '+E.box.filter(b=>b.s==='on').length+'/4',fn:()=>{}}}
  if(Math.hypot(P.x-R.con.x,P.z-R.con.z)<2.6)return mq170Done()?{label:'F · Into the tunnel to '+mq170Den(),fn:()=>mq170Through()}:{label:'F · Start the drill (no turning back)',fn:()=>mq170Start()};
  const T=R.L(0,-.6);if(Math.hypot(P.x-T.x,P.z-T.z)<4.6){if(mq170Done())return {label:'F · Into the tunnel to '+mq170Den(),fn:()=>mq170Through()};return {label:'🔒 Sheer rock: the way to the Den is through the mountain',fn:()=>say('⚙️ The drill at the end of the road could bore through. Its console is at the back.')}}
  return null}
{const f=worldPrompt;worldPrompt=function(){try{const r=mq170Prompt();if(r)return r}catch(e){if(!MQ170.err++)console.warn('v151 drill prompt',e)}return f.apply(this,arguments)}}
{const f=portalPrompt;portalPrompt=function(){try{if(mq170In3()&&MQ170.S){const R=mq170Plan(),P=pl.position;if(MQ170.E||Math.hypot(P.x-R.g.x,P.z-R.g.z)<5)return null}}catch(_){}return f.apply(this,arguments)}}
{const f=doRecall;doRecall=function(){if(MQ170.E)return say('⚙️ You cannot leave the drill now. Bore through, or fall trying.');return f.apply(this,arguments)}}
{const f=toggleMount;toggleMount=function(){if(MQ170.E)return say('⚙️ No mount will come near the roaring drill.');return f.apply(this,arguments)}}

// ---------------- the repair windows (they do not pause the game) ----------------
(function(){const st=document.createElement('style');st.textContent=`
#dr170w{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:30;width:380px;max-width:92%;padding:10px 12px 12px;border-radius:10px;user-select:none;touch-action:none;
  background:linear-gradient(180deg,#2a3038,#1a1e24);border:2px solid #6a7480;box-shadow:0 10px 40px rgba(0,0,0,.7),inset 0 0 0 1px rgba(255,255,255,.06);font:13px/1.35 system-ui,sans-serif;color:#e0e6ec}
#dr170w .hd{display:flex;justify-content:space-between;align-items:center;font-family:Cinzel,Georgia,serif;letter-spacing:.08em;font-size:13px;color:#ffd07a;margin-bottom:6px}
#dr170w .x{cursor:pointer;background:#3a2020;border:1px solid #8a4040;color:#ffb0a0;border-radius:4px;padding:0 7px;font:700 13px system-ui}
#dr170w .tip{color:#9aa8b4;font-size:11.5px;margin-bottom:8px}#dr170w .pane{position:relative;height:230px;border-radius:6px;background:#11151a;border:1px solid #3a424c;overflow:hidden}
#dr170w svg{position:absolute;inset:0;width:100%;height:100%}#dr170w .pc{position:absolute;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px;cursor:grab;
  background:#3a424c;border:2px solid #8a96a4;box-shadow:0 3px 8px rgba(0,0,0,.6)}#dr170w .sl{position:absolute;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:8px;border:2px dashed #5a6470;display:flex;align-items:center;justify-content:center;font-size:26px;opacity:.35}
#dr170w .ok{color:#7aff8a}#dr170w .hb{position:absolute;right:18px;bottom:16px;width:120px;height:54px;border-radius:8px;background:linear-gradient(180deg,#8a3a1a,#5a2410);border:2px solid #ff9a5a;color:#ffe0c0;font:700 14px system-ui;cursor:pointer}
#dr170w .hb.on{background:linear-gradient(180deg,#ff7a2a,#c04a10)}`;document.head.appendChild(st)})();
function dr170Open(i,kind){if(!MQ170.E||MQ170.W)return;const st=document.getElementById('stage')||document.body;let el=document.getElementById('dr170w');if(!el){el=document.createElement('div');el.id='dr170w';st.appendChild(el)}
  const W={i,kind,el,hp:hero.hp,lock:pl.position.clone(),done:0,t:0};MQ170.W=W;try{if(typeof orbEnd=='function'&&typeof orb!='undefined'&&orb)orbEnd()}catch(_){}atkHeld=false;
  const ttl={thaw:'❄ Thaw the box',wire:'⚡ Rewire the box',rebuild:'🔩 Rebuild the box'}[kind],tip={thaw:'Hold the heater (or Space) and keep the needle in the green band until the ice is gone. Too hot and the ice refreezes.',
    wire:'Drag each loose wire on the left to the socket of its colour on the right.',rebuild:'Drag each broken piece back into its place on the panel.'}[kind];
  el.innerHTML=`<div class="hd"><span>${ttl} · ${MQ170.bn[i]}</span><span class="x">✕</span></div><div class="tip">${tip}</div><div class="pane"></div>`;el.style.display='block';
  el.querySelector('.x').onclick=()=>dr170Close(false);W.pane=el.querySelector('.pane');({thaw:dr170Thaw,wire:dr170Wire,rebuild:dr170Rebuild})[kind](W);svSnd('click',.6,1)}
function dr170Close(ok){const W=MQ170.W;if(!W)return;MQ170.W=null;try{W.off&&W.off()}catch(_){}const el=document.getElementById('dr170w');if(el){el.style.display='none';el.innerHTML=''}
  const E=MQ170.E;if(ok&&E){dr170Set(W.i,'on');say('🔧 The '+MQ170.bn[W.i].toLowerCase()+' is running again.')}}
function dr170Win(W){if(W.done)return;W.done=1;svSnd('bell',.8,1.4);setTimeout(()=>{if(MQ170.W===W)dr170Close(true)},350)}
function dr170WTick(dt,now){const W=MQ170.W;if(!W)return;W.t+=dt;
  // you stay at the box; a hit knocks you away from it
  pl.position.x=W.lock.x;pl.position.z=W.lock.z;pl.step=null;
  if(hero.hp<W.hp-.5){dr170Close(false);say('💢 Knocked away from the box!');return}W.hp=Math.max(W.hp,hero.hp);
  const b=MQ170.E&&MQ170.E.box[W.i];if(!b||b.s==='on'){dr170Close(false);return}
  if(W.tick)W.tick(dt)}
addEventListener('keydown',e=>{if(MQ170.W&&e.key==='Escape'){dr170Close(false);e.stopImmediatePropagation()}},true);
// Thaw: a heat gauge; holding the heater raises the needle, letting go lowers it; time in the green band melts the ice
function dr170Thaw(W){const lo=46+Math.random()*24,hi=lo+18;W.temp=10;W.melt=0;W.hold=0;
  W.pane.innerHTML=`<svg viewBox="0 0 380 230"><rect x="30" y="20" width="44" height="190" rx="8" fill="#1e252c" stroke="#5a6470"/><rect x="32" y="${210-hi*1.9}" width="40" height="${(hi-lo)*1.9}" fill="#2aff6a" opacity=".35"/>
    <rect x="32" y="${210-100*1.9}" width="40" height="${(100-92)*1.9}" fill="#ff3a2a" opacity=".35"/><rect class="nd" x="26" y="200" width="52" height="5" rx="2" fill="#ffd07a"/>
    <rect x="110" y="40" width="160" height="150" rx="10" fill="#9ad8ff" class="ic" opacity=".85"/><text x="190" y="120" text-anchor="middle" font-size="44">🧊</text>
    <rect x="110" y="200" width="160" height="10" rx="4" fill="#0a0e12" stroke="#3a424c"/><rect class="pg" x="110" y="200" width="0" height="10" rx="4" fill="#7ad8ff"/></svg><button class="hb">HOLD TO HEAT</button>`;
  const btn=W.pane.querySelector('.hb'),nd=W.pane.querySelector('.nd'),pg=W.pane.querySelector('.pg'),ic=W.pane.querySelector('.ic'),on=v=>{W.hold=v;btn.classList.toggle('on',!!v)};
  btn.onpointerdown=e=>{e.preventDefault();on(1)};btn.onpointerup=btn.onpointerleave=()=>on(0);
  const kd=e=>{if(e.key===' '){on(1);e.preventDefault();e.stopImmediatePropagation()}},ku=e=>{if(e.key===' ')on(0)};addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);W.off=()=>{removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true)};
  W.lo=lo;W.hi=hi;W.tick=dt=>{W.temp=Math.max(0,Math.min(100,W.temp+(W.hold?48:-32)*dt));if(W.temp>=92){W.melt=Math.max(0,W.melt-dt*.6)}else if(W.temp>=lo&&W.temp<=hi)W.melt=Math.min(1,W.melt+dt/2.4);
    nd.setAttribute('y',(210-W.temp*1.9-2).toFixed(1));pg.setAttribute('width',(160*W.melt).toFixed(1));ic.setAttribute('opacity',(.85*(1-W.melt)+.05).toFixed(2));if(W.melt>=1)dr170Win(W)}}
// Rewire: four coloured wire ends on the left, the four sockets on the right in another order; drag each to its colour
function dr170Wire(W){const C=['#ff4a4a','#4a9aff','#ffd040','#d05aff'],ord=[0,1,2,3].sort(()=>Math.random()-.5),y=k=>36+k*52;W.con=[0,0,0,0];
  W.pane.innerHTML=`<svg viewBox="0 0 380 230">${C.map((c,k)=>`<rect x="6" y="${y(k)-9}" width="40" height="18" rx="4" fill="${c}"/><circle class="w" data-k="${k}" cx="52" cy="${y(k)}" r="11" fill="${c}" stroke="#fff" stroke-width="2"/>`).join('')}
    ${ord.map((k,j)=>`<rect x="334" y="${y(j)-9}" width="40" height="18" rx="4" fill="${C[k]}"/><circle class="s" data-k="${k}" data-j="${j}" cx="328" cy="${y(j)}" r="12" fill="#11151a" stroke="${C[k]}" stroke-width="3"/>`).join('')}<g class="ln"></g></svg>`;
  const sv=W.pane.querySelector('svg'),ln=W.pane.querySelector('.ln'),pt=e=>{const r=sv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*380,(e.clientY-r.top)/r.height*230]};let drag=null;
  const line=(k,x2,y2,keep)=>{const L=document.createElementNS('http://www.w3.org/2000/svg','line');L.setAttribute('x1',52);L.setAttribute('y1',y(k));L.setAttribute('x2',x2);L.setAttribute('y2',y2);L.setAttribute('stroke',C[k]);L.setAttribute('stroke-width',9);L.setAttribute('stroke-linecap','round');if(!keep)L.setAttribute('opacity',.85);ln.appendChild(L);return L};
  sv.querySelectorAll('.w').forEach(c=>c.onpointerdown=e=>{const k=+c.dataset.k;if(W.con[k])return;e.preventDefault();try{sv.setPointerCapture(e.pointerId)}catch(_){}const [x,yy]=pt(e);drag={k,L:line(k,x,yy)}});
  sv.onpointermove=e=>{if(!drag)return;const [x,yy]=pt(e);drag.L.setAttribute('x2',x);drag.L.setAttribute('y2',yy)};
  sv.onpointerup=e=>{if(!drag)return;const [x,yy]=pt(e);let hit=null;sv.querySelectorAll('.s').forEach(s=>{const j=+s.dataset.j;if(Math.hypot(x-328,yy-y(j))<24)hit=s});const k=drag.k;
    if(hit&&+hit.dataset.k===k)dr170WireSet(W,k);else{drag.L.remove();if(hit)svSnd('zap',.4,1.6)}drag=null};
  W.setK=k=>{const j=ord.indexOf(k);line(k,328,y(j),1);W.con[k]=1;svSnd('click',.6,1.4);if(W.con.every(Boolean))dr170Win(W)}}
function dr170WireSet(W,k){if(W.con[k])return;W.pane.querySelectorAll('line').forEach(L=>{if(L.getAttribute('opacity'))L.remove()});W.setK(k)}
// Rebuild: four broken pieces scattered; drag each into its outlined place on the panel
function dr170Rebuild(W){const P=[['⚙️',120,70],['🔩',250,70],['🎚️',120,165],['🧭',250,165]],put=[0,0,0,0];W.put=put;
  W.pane.innerHTML=`<svg viewBox="0 0 380 230"><rect x="70" y="20" width="240" height="195" rx="12" fill="#232a32" stroke="#5a6470" stroke-width="2"/></svg>`+P.map((p,k)=>`<div class="sl" data-k="${k}" style="left:${p[1]/380*100}%;top:${p[2]/230*100}%">${p[0]}</div>`).join('')
    +P.map((p,k)=>{const x=k<2?28+Math.random()*16:338-Math.random()*16,yy=40+k%2*80+Math.random()*60;return `<div class="pc" data-k="${k}" style="left:${x/380*100}%;top:${yy/230*100}%;transform:rotate(${(Math.random()-.5)*60}deg)">${p[0]}</div>`}).join('');
  const pane=W.pane;let drag=null;
  pane.querySelectorAll('.pc').forEach(el=>el.onpointerdown=e=>{const k=+el.dataset.k;if(put[k])return;e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}drag={k,el};el.style.cursor='grabbing';el.style.zIndex=5});
  pane.onpointermove=e=>{if(!drag)return;const r=pane.getBoundingClientRect();drag.el.style.left=((e.clientX-r.left)/r.width*100)+'%';drag.el.style.top=((e.clientY-r.top)/r.height*100)+'%'};
  pane.onpointerup=e=>{if(!drag)return;const r=pane.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*380,yy=(e.clientY-r.top)/r.height*230,k=drag.k,p=P[k];
    if(Math.hypot(x-p[1],yy-p[2])<36)dr170Put(W,k);else{const sl=P.findIndex(q=>Math.hypot(x-q[1],yy-q[2])<36);if(sl>=0)svSnd('zap',.4,1.6)}drag.el.style.cursor='grab';drag.el.style.zIndex='';drag=null};
  W.P=P}
function dr170Put(W,k){if(W.put[k])return;W.put[k]=1;const el=W.pane.querySelector('.pc[data-k="'+k+'"]'),p=W.P[k];if(el){el.style.left=p[1]/380*100+'%';el.style.top=p[2]/230*100+'%';el.style.transform='none';el.style.borderColor='#7aff8a';el.style.cursor='default'}
  const sl=W.pane.querySelector('.sl[data-k="'+k+'"]');if(sl)sl.style.opacity=0;svSnd('heavy',.4,1.8);if(W.put.every(Boolean))dr170Win(W)}
// tests: finish the open window as a player would
function dr170Solve(){const W=MQ170.W;if(!W)return false;if(W.kind==='thaw'){W.melt=1;W.tick&&W.tick(0)}else if(W.kind==='wire')[0,1,2,3].forEach(k=>dr170WireSet(W,k));else [0,1,2,3].forEach(k=>dr170Put(W,k));return true}
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
  const k=E.prog/MQ170.need,run=E.box.every(b=>b.s==='on'),live=enemies.filter(e=>e.dr170t&&!e.dead).length;
  el.innerHTML=`<div class="t"><span>⚙️ ${run?'Drilling':'The drill has stopped'}</span><span>${Math.round(k*100)}%</span></div><div class="bar"><i style="width:${(k*100).toFixed(1)}%"></i></div>
  <div class="bx">${E.box.map((b,i)=>`<div class="b"><i style="background:${MQ170.stC[b.s]};box-shadow:0 0 6px ${MQ170.stC[b.s]}"></i>${['NW','NE','SW','SE'][i]} · ${MQ170.stN[b.s]}</div>`).join('')}</div>
  <div class="t" style="margin-top:4px"><span>Frost Trolls: ${live}</span><span>${run?'':'switch on / repair every box'}</span></div>`}
// ---------------- the world tick ----------------
function mq170Tick(dt,now){const in3=mq170In3(),t=now/1000;
  if(in3&&!MQ170.S)try{mq170Build()}catch(err){console.error('v151 drill build',err);MQ170.err++}
  const S=MQ170.S;if(!S)return;[S.cliff.g,S.drill.g,S.con].concat(S.box.map(b=>b.g)).forEach(o=>o.visible=in3);if(!in3)S.lt.intensity=0;
  if(in3){S.box.forEach((B,i)=>{const s=MQ170.E?MQ170.E.box[i].s:mq170Done()?'on':'off';B.halo.scale.setScalar(1.1*(1+.15*Math.sin(t*(s=='on'?3:8)+i)));
      if(s==='fault'&&Math.random()<dt*14){const p=new THREE.Vector3(B.x,GH(B.x,B.z)+.9+Math.random()*.6,B.z);burst(p,0xffd07a,3,2.2,1.6,.3)}if(s==='frozen'&&Math.random()<dt*3)burst(new THREE.Vector3(B.x,GH(B.x,B.z)+1.5,B.z),0xd8f4ff,1,.2,.4,1)});
    if(mq170Done()){S.cliff.gl.material.opacity=.45+.12*Math.sin(t*2)}}
  if(MQ170.E)try{mq170ETick(dt,now)}catch(err){if(!MQ170.err++)console.error('v151 drill',err)}
  if(now-MQ170.t>400){MQ170.t=now;try{if(in3)mq143Trk()}catch(_){}}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{mq170Tick(dt,now)}catch(err){if(!MQ170.err++)console.warn('v151 drill tick',err)}return r}}
// ---------------- the tracker (chapter 3 in the main-quest box, in Burningeye III) ----------------
{const f=mq143Trk;mq143Trk=function(){try{if(mq170In3()){MQ143.trkK='';return mq170Trk()}}catch(err){if(!MQ170.err++)console.warn('v151 drill trk',err)}MQ170.trkK='';return f.apply(this,arguments)}}
function mq170Trk(){const el=$('mqt143');if(!el)return;const hide=(typeof uiOpen=='function'&&uiOpen())||(mq170Done()&&insReach(2)>=3),E=MQ170.E;
  const key=(hide?'h':'s')+mq170Done()+'|'+(E?Math.round(E.prog)+E.box.map(b=>b.s[0]).join(''):'-');if(key===MQ170.trkK)return;MQ170.trkK=key;
  if(hide){el.classList.add('hide');mq143TrkPos();return}
  const o=(a,b,d)=>`<div class="o${d?' d':''}"><span>${a}</span>${b!=null?'<b>'+b+'</b>':''}</div>`;let h='<div class="k">⚜ Main quest · Burningeye Summit</div><div class="h">'+MQ170.name+'</div>';
  if(mq170Done())h+=o('Enter the tunnel to '+mq170Den(),null,1);
  else if(E)h+=o('Keep all four control boxes running',E.box.filter(b=>b.s==='on').length+'/4')+o('Bore through the mountain',Math.round(E.prog/MQ170.need*100)+'%');
  else h+=o('Start the great drill at the end of the road');
  el.innerHTML=h;el.classList.add('z2');el.classList.remove('hide');mq143TrkPos()}
// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.mq170={v:151,st:MQ170.st}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.mq170;if(MQ170.E)mq170Fail('left');MQ170.st=q&&typeof q=='object'?Math.max(0,Math.min(1,q.st|0)):0;MQ170.trkK='';mq170Sync()}catch(err){console.warn('v151 drill load',err)}return r}}
