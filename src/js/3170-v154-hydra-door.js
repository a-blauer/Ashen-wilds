// ================= v154 The Gate of the Hydra — Hillside Crest III main quest (chapter 3) =================
// The Galecliffs' gateway to the Sovereign's Den is gone: at the far edge of the gateway clearing a massive old stone door is set
// into the mountain, carved with the Crest Hydra — five serpent heads with open mouths like wind-horns. Behind it, inside the
// mountain, the Hydra dwells in a hidden oasis (the Den). The door opens to "The Five Winds":
//  1. Five Wind Stones stand across the windswept plateau (HD154.plan: off the road at 12 / 30 / 48 / 66 / 84 % of it, on open
//     ground, away from the entrance, the door, the camps and each other; marked on the minimap and the N map). Each is a carved
//     monolith topped by a bronze serpent vane. F turns the vane an eighth of a turn. Pointed at the door, the wind streams from the
//     stone to the door in a ribbon of light and one of the Hydra's heads wakes (its mouth glows and hums its note). One step off,
//     the stone hums and a short gust shows which way the wind wants to go.
//  2. With all five winds flowing, the heads sing the Song of the Mother at the door: they light and sound in an order. Strike the
//     five chime stones before the door (F, each matching a head by colour and note) in the same order. Three verses: 3, 4, 5 notes.
//     A wrong stone: the heads hiss and the verse is sung again.
//  3. The last verse: the seals crack, the wind roars in, the doors grind open on the green light and mist of the oasis inside.
//     F at the open doors: into the Hydra's Oasis (the Den). Done also when the Den was reached (old saves, cheats).
// State HD154: st (0 not seen · 1 found · 2 open), vane[5] (0..7), on[5] (aligned), v (verse 0..3), saved as x2.hd154.
// Co-op: each player turns their own stones and sings their own song (like the sigils).
var HD154={st:0,vane:[0,0,0,0,0],on:[0,0,0,0,0],v:0,S:null,song:null,err:0,name:'The Gate of the Hydra',
  col:[0x5aff9a,0x4ad8ff,0xffd040,0xff7a4a,0xd88aff],css:['#5aff9a','#4ad8ff','#ffd040','#ff7a4a','#d88aff'],nm:['the Jade Wind','the Sky Wind','the Sun Wind','the Ember Wind','the Dusk Wind'],
  pitch:[1.0,1.12,1.26,1.5,1.68],verses:[3,4,5]};
function hd154Done(){return HD154.st>=2||insReach(1)>=3}
function hd154In(){try{const I=curIns();return !!I&&I.g===7}catch(_){return false}}
function hd154N(){return HD154.on.filter(Boolean).length}
// ---------------- where things stand ----------------
function hd154Plan(){if(hd154Plan.c)return hd154Plan.c;const I=INSL[7],P=I.path,N=P.length,DW=MAP.DW,G=SP152.gates.hydra;
  const door=G&&G.spot?G.spot:sp152GateSpot(7,10.5);
  const props=new Set();try{MAP.props.forEach(q=>props.add(q[1]*W+q[0]))}catch(_){}
  const ok=(x,z,m)=>{const X=Math.round(x),Z=Math.round(z),t=MAP[Z]&&MAP[Z][X];if(!t||t=='#'||t=='r'||t=='R'||t=='~'||props.has(Z*W+X)||CBLK.has(Z*W+X))return false;const J=insAt(X,Z);if(!J||J.g!==7)return false;return DW[Z*W+X]<-m};
  const tan=i=>{const a=P[Math.max(0,i-3)],b=P[Math.min(N-1,i+3)];let dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;return [dx/L,dz/L]};
  const roadD=(x,z)=>{let d=1e9;for(let i=0;i<N;i+=2){const q=P[i];d=Math.min(d,Math.hypot(x-q[0],z-q[1]))}return d};
  const avoid=[[I.en[0],I.en[1],20],[door.x,door.z,24]].concat((I.cl||[]).map(c=>[c[0],c[1],15]));
  const st=[],fr=[.12,.3,.48,.66,.84];
  for(const m of [2.6,1.8,1.2])for(let j=0;j<5;j++){if(st[j])continue;const ix=Math.round((N-1)*fr[j]),sd=j%2?-1:1;let got=null;
    for(const b of [11,13,9,15,8,17,6])for(const side of [sd,-sd])for(const da of [0,6,-6,12,-12,18,-18]){if(got)break;const k=Math.max(0,Math.min(N-1,ix+da)),q=P[k],t=tan(k),x=q[0]-t[1]*b*side,z=q[1]+t[0]*b*side;
      if(!ok(x,z,m)||!ok(x+1.2,z,m*.6)||!ok(x-1.2,z,m*.6)||!ok(x,z+1.2,m*.6)||!ok(x,z-1.2,m*.6)||roadD(x,z)<5)continue;
      if(!avoid.every(([px,pz,r])=>Math.hypot(x-px,z-pz)>=r))continue;if(!st.every(o=>!o||Math.hypot(x-o.x,z-o.z)>=26))continue;got={x:Math.round(x),z:Math.round(z),i:j}}
    if(got)st[j]=got}
  for(let j=0;j<5;j++)if(!st[j]){const ix=Math.round((N-1)*fr[j]),q=P[ix],t=tan(ix);st[j]={x:Math.round(q[0]-t[1]*5),z:Math.round(q[1]+t[0]*5),i:j,fb:1}}
  // the bearing from each stone to the door, as one of eight vane steps (0 = +z, then a quarter-turn-by-two clockwise from above)
  st.forEach(o=>{const a=Math.atan2(door.x-o.x,door.z-o.z);o.want=((Math.round(a/(Math.PI/4))%8)+8)%8});
  // the chime stones: an arc before the door
  const ch=[],ca=Math.cos(door.ry),sa=Math.sin(door.ry);for(let j=0;j<5;j++){const a=(j-2)*.42,o=Math.sin(a)*6.6,d=Math.cos(a)*6.6-.4;ch.push({x:door.x+ca*o+sa*d,z:door.z-sa*o+ca*d,i:j})}
  return hd154Plan.c={door,st,ch}}
function hd154VaneYaw(k){return k*Math.PI/4}
// ---------------- models ----------------
var HD154C={st:0x8a8274,stD:0x5e584e,stL:0xb0a690,rock:[0x6a645a,0x7a7266,0x5a554c,0x8a8274],brz:0xb08a3a,brzD:0x6a4a1a,jade:0x3a9a6a,dark:0x0a0908};
function hd154DoorKit(){const C=HD154C;return lgGroup('HD154|door',k=>{const R=ab152R(3131);
  // the mountain: a broad cliff face of rock around the door
  for(let i=0;i<26;i++){const x=(R()-.5)*30,y=2+R()*16,z=-3-R()*4,s=2+R()*3;if(Math.abs(x)<7.4&&y<13)continue;k.p('','dod','c',C.rock[i%4],x,y,z,s,s*1.2,s,R()*3,R()*3,R()*3)}
  k.p('','box','c',C.rock[2],0,9,-5.2,32,18,4);
  // the frame: two great serpent pillars, the lintel with the Hydra's heads
  [-1,1].forEach(s=>{k.p('','box','c',C.st,s*6.2,6,-.8,2.2,12,2.2);k.p('','box','c',C.stL,s*6.2,.4,-.8,2.8,.8,2.8);
    for(let y=1.2;y<11.5;y+=.75)k.p('','tor','c',y%1.5<.75?C.stD:C.jade,s*6.2,y,-.8,1.25,.32,1.25,0,y*1.7,0);
    k.p('','sph','c',C.jade,s*6.2,12.4,-.2,.8,.6,1.0);k.p('','box','g',0xffd040,s*6.2+s*-.25,12.5,.6,.1,.08,.05);k.p('','box','g',0xffd040,s*6.2+s*.25,12.5,.6,.1,.08,.05)});
  k.p('','box','c',C.st,0,11.8,-.8,14.6,2.0,2.4);k.p('','box','c',C.stD,0,10.65,-.1,12.6,.3,1.4);
  for(let i=0;i<13;i++)k.p('','box','c',C.stL,-6+i,12.9,.42,.6,.16,.1,0,0,i%2?.6:-.6);
  // the Hydra relief: a coiled body in the middle of the lintel, five necks fanning up, their heads (sockets lit later)
  k.p('','tor','c',C.jade,0,12.1,.45,1.6,.6,1.6,Math.PI/2,0,0);k.p('','tor','c',lgCol(C.jade,0,.2),0,12.1,.55,1.0,.6,1.0,Math.PI/2,0,0);
  for(let j=0;j<5;j++){const a=(j-2)*.42,hx=Math.sin(a)*4.4,hy=12.1+Math.cos(a)*3.2;k.L('','c',C.jade,[Math.sin(a)*1.2,12.1+Math.cos(a)*.9,.5],[hx,hy,.75],.42,.32,7);
    k.p('','sph2','c',C.jade,hx,hy,.95,.62,.5,.8,-.4,a,0);k.p('','box','c',lgCol(C.jade,0,.3),hx,hy+.28,.95,.5,.14,.7,-.4,a,0);
    [-1,1].forEach(e=>k.p('','cone4','c',0xf0e8d0,hx+e*.18,hy-.34,1.4,.05,.2,.05,Math.PI-.4,a,0))}
  // the doorway's dark depth (seen when the doors open) and the steps
  k.p('','box','c',0x0a1a14,0,5.0,-1.9,10,10,.2);
  // a glimpse of the oasis beyond (hidden while the doors are shut): fronds, a pool's edge, glowing moss
  for(let i=0;i<9;i++){const s=i%2?1:-1,x=s*(1.6+(i%4)*.7),y=1.2+(i*37%5)*.9;k.p('','cone4','c',i%3?0x2a8a4a:0x3aa860,x,y,-1.5,.35,2.2,.08,0,0,s*(1.1+(i%3)*.3))}
  k.p('','box','g',0x3ae0b0,0,.08,-1.3,8.6,.06,.9);for(let i=0;i<6;i++)k.p('','sph','g',0x7affa0,-3.6+i*1.45,.25+(i%2)*.3,-1.75,.12)
  for(let i=0;i<4;i++)k.p('','box','c',i%2?C.st:C.stL,0,.12+i*.0,1.2+i*.9-3.0,14-i*.8,.24,1.0);
  // guardian statues, braziers and the inscription
  [-1,1].forEach(s=>{const x=s*9.4;k.p('','box','c',C.stD,x,.6,1.0,2.0,1.2,2.0);k.L('','c',C.jade,[x,1.2,1.0],[x,4.4,1.3],.6,.4,7);k.p('','hood','c',lgCol(C.jade,0,.25),x,4.0,1.05,1.4,1.7,.7);
    k.p('','sph','c',C.jade,x,4.6,1.55,.42,.32,.56);[-1,1].forEach(e=>k.p('','box','g',0xffc040,x+e*.16,4.66,2.06,.06,.05,.03))});
  k.p('','box','c',C.stL,0,1.0,3.4,3.6,1.4,.4,-.25,0,0);for(let i=0;i<5;i++)k.p('','box','c',C.stD,-1.3+i*.65,1.05,3.62,.4,.5,.04,-.25,0,0)},0)}
// a door leaf: carved panels, the wind sigil, studs, a ring handle; origin at its hinge (side s = −1 left, +1 right)
function hd154Leaf(s){const C=HD154C;return lgGroup('HD154|leaf'+s,k=>{const w=5.0,cx=-s*w/2;
  k.p('','box','c',C.st,cx,4.9,0,w,9.8,.9);k.p('','box','c',C.stD,cx,4.9,.46,w-.6,9.2,.06);
  for(let r=0;r<3;r++)k.p('','box','c',C.stL,cx,1.8+r*3.0,.5,w-1.2,2.4,.08);
  k.p('','tor','c',C.brz,-s*(w-.3),5.6,.55,2.0,.3,2.0,Math.PI/2,0,0);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('','box','c',C.brzD,-s*(w-.3)+Math.cos(a)*1.4,5.6+Math.sin(a)*1.4,.58,.5,.12,.06,0,0,a)}
  for(let y=.6;y<9.6;y+=1.2)for(let x=.4;x<w;x+=1.1)k.p('','sph','m',C.brz,-s*x,y,.52,.09);
  k.p('','ring','m',C.brz,-s*(w-1.2),4.2,.62,.45,.6,.45,Math.PI/2,0,0);
  k.p('','box','m',C.brzD,cx,2.0,.5,w,.3,.1);k.p('','box','m',C.brzD,cx,7.8,.5,w,.3,.1)},0)}
// the seals across the closed doors (they crack and fall when the song is sung)
function hd154Seals(){const C=HD154C;return lgGroup('HD154|seals',k=>{[2.4,5.0,7.6].forEach(y=>{k.p('','box','m',C.brz,0,y,.8,10.6,.5,.3);k.p('','cyl','m',C.brzD,0,y,.95,.6,.2,.6,Math.PI/2,0,0)})},0)}
function hd154Chime(j){const C=HD154C;return lgGroup('HD154|chime'+j,k=>{k.p('','box','c',C.stD,0,.25,0,1.2,.5,1.2);k.p('','box','c',C.st,0,1.4,0,.8,1.8,.6,0,0,(j-2)*.04);
  for(let i=0;i<3;i++)k.p('','box','c',C.stL,0,.9+i*.5,.31,.5,.08,.02,0,0,(i%2?.6:-.6))},0)}
function hd154Stone(){const C=HD154C;return lgGroup('HD154|stone',k=>{const R=ab152R(77);k.p('','box','c',C.stD,0,.3,0,2.6,.6,2.6);
  k.p('','cyl','c',C.stD,0,2.6,0,.7,4.2,.7);k.p('','cyl','c',C.st,0,.9,0,.85,.6,.85);
  for(let i=0;i<3;i++){const y=1.6+i*1.1;k.p('','tor','c',C.stL,0,y,0,.76,.12,.76);for(let q=0;q<4;q++){const a=q*Math.PI/2+i*.4;k.p('','box','c',C.dark,Math.sin(a)*.66,y+.5,Math.cos(a)*.66,.34,.12,.06,0,a,0)}}
  // a jade serpent coiling up the monolith, its head under the vane
  for(let i=0;i<34;i++){const t=i/33,a=t*Math.PI*4.2,y=.9+t*3.6,r=.78;k.p('','sph','c',i%3?C.jade:lgCol(C.jade,0,.25),Math.sin(a)*r,y,Math.cos(a)*r,.2-.06*t,.17-.05*t,.2-.06*t)}
  k.p('','box','c',C.stL,0,4.75,0,1.0,.24,1.0);for(let i=0;i<5;i++)k.p('','dod','c',C.rock[i%4],(R()-.5)*3,.15,(R()-.5)*3,.3,.2,.3)},0)}
function hd154Vane(){const C=HD154C;return lgGroup('HD154|vane',k=>{k.p('','cyl','m',C.brz,0,.5,0,.06,1.0,.06);
  // a bronze serpent: the head points where the vane points (+z), the tail a fin catching the wind
  k.L('','m',C.brz,[0,1.0,-1.1],[0,1.05,.6],.12,.16,6);k.p('','sph2','m',C.brz,0,1.08,.85,.22,.17,.34);k.p('','box','g',0xffd060,0,1.13,1.05,.12,.03,.03);
  k.p('','box','m',C.brzD,0,1.2,-1.0,.04,.7,.7,.5,0,0)},0)}
// the wind ribbon: a glowing tube arcing from a stone to the door, its stripes flowing towards the door
function hd154Ribbon(a,b,col){const mid=new THREE.Vector3((a.x+b.x)/2,Math.max(a.y,b.y)+3+a.distanceTo(b)*.05,(a.z+b.z)/2),c=new THREE.QuadraticBezierCurve3(a,mid,b);
  const g=new THREE.TubeGeometry(c,Math.max(40,Math.round(a.distanceTo(b)/2)),.5,8,false),
    m=new THREE.ShaderMaterial({uniforms:{t:{value:0},col:{value:new THREE.Color(col)},op:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform float t,op;uniform vec3 col;varying vec2 vU;void main(){float s=.5+.5*sin(vU.x*120.-t*6.);gl_FragColor=vec4(col*1.4,op*(.45+.55*s*s));}'});
  const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.userData.psNo=1;mesh.userData.noFade135=1;return mesh}
// ---------------- the world ----------------
function hd154Build(){if(HD154.S)return HD154.S;const Pl=hd154Plan(),D=Pl.door,root=new THREE.Group();root.name='HydraGate';root.userData.noFade135=1;scene.add(root);
  const S={root,stones:[],chimes:[],heads:[],ribbons:[],t:0,leafs:[]};HD154.S=S;
  // a new game: every serpent starts a few turns away from the door (a save sets them itself); a stone's wind flows only when it faces the door
  if(!HD154.vInit){HD154.vInit=1;HD154.vane=Pl.st.map((o,j)=>(o.want+3+j%3)%8)}HD154.on=HD154.vane.map((v,j)=>v===Pl.st[j].want?1:0);
  // the door assembly (local +z faces the clearing)
  const dg=new THREE.Group();dg.position.set(D.x,GH(D.x,D.z),D.z);dg.rotation.y=D.ry;root.add(dg);dg.add(hd154DoorKit());S.dg=dg;
  [-1,1].forEach(s=>{const h=new THREE.Group();h.position.set(s*5.0,0,-.6);dg.add(h);h.add(hd154Leaf(s));S.leafs.push({g:h,s})});
  S.seals=hd154Seals();S.seals.position.set(0,0,-.6);dg.add(S.seals);
  // the heads' glowing mouths
  for(let j=0;j<5;j++){const a=(j-2)*.42,hx=Math.sin(a)*4.4,hy=12.1+Math.cos(a)*3.2,m=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),new THREE.MeshBasicMaterial({color:HD154.col[j],fog:false}));
    m.position.set(hx,hy-.25,1.45);m.visible=false;dg.add(m);const halo=mq143Halo(HD154.col[j],2.4);halo.position.copy(m.position);halo.visible=false;dg.add(halo);S.heads.push({m,halo,k:0,f:0})}
  // the oasis light inside (shown when the doors open)
  S.glow=ab152Pool(4.5,0x9affc8);S.glow.position.set(0,.06,-1.2);S.glow.visible=false;dg.add(S.glow);S.mist=ab152Pool(5.5,0x6affb0);S.mist.rotation.x=Math.PI/2;S.mist.position.set(0,4.6,-1.7);S.mist.visible=false;dg.add(S.mist);
  S.lt=new THREE.PointLight(0x9affc0,0,22,1.4);S.lt.position.set(D.x+D.ux*1.5,GH(D.x,D.z)+4,D.z+D.uz*1.5);scene.add(S.lt);
  // colliders: the wall and the frame (the doorway too while it is shut), the chime stones
  const ca=Math.cos(D.ry),sa=Math.sin(D.ry),blk=(o,d)=>{const x=D.x+ca*o+sa*d,z=D.z-sa*o+ca*d;CBLK.add(Math.round(z)*W+Math.round(x))};
  for(let o=-16;o<=16;o+=.6)for(let d=-6;d<=-1.6;d+=.6)blk(o,d);for(let o=-7.4;o<=7.4;o+=.6)blk(o,-.8);[-1,1].forEach(s=>{for(let d=-1.6;d<=1.6;d+=.6)blk(s*9.4,d+1)});
  S.blkDoor=[];for(let o=-4.8;o<=4.8;o+=.6){const x=D.x+ca*o+sa*-.2,z=D.z-sa*o+ca*-.2,k=Math.round(z)*W+Math.round(x);CBLK.add(k);S.blkDoor.push(k)}
  Pl.ch.forEach((c,j)=>{const m=hd154Chime(j);m.position.set(c.x,GH(c.x,c.z),c.z);m.rotation.y=D.ry;root.add(m);const cr=new THREE.Mesh(new THREE.OctahedronGeometry(.32,0),new THREE.MeshBasicMaterial({color:HD154.col[j],fog:false}));
    cr.position.set(c.x,GH(c.x,c.z)+2.65,c.z);root.add(cr);const halo=mq143Halo(HD154.col[j],1.4);halo.position.copy(cr.position);halo.visible=false;root.add(halo);S.chimes.push({c,m,cr,halo,f:0});CBLK.add(Math.round(c.z)*W+Math.round(c.x))});
  // the wind stones
  Pl.st.forEach((o,j)=>{const g=hd154Stone();g.position.set(o.x,GH(o.x,o.z),o.z);root.add(g);const v=hd154Vane();v.position.set(o.x,GH(o.x,o.z)+4.85,o.z);root.add(v);
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.28,0),new THREE.MeshBasicMaterial({color:HD154.col[j],fog:false}));gem.position.set(o.x,GH(o.x,o.z)+3.2,o.z+.72);gem.visible=false;root.add(gem);
    const a=new THREE.Vector3(o.x,GH(o.x,o.z)+5.6,o.z);dg.updateMatrixWorld(true);const b=S.heads[j].m.getWorldPosition(new THREE.Vector3());
    const rb=hd154Ribbon(a,b,HD154.col[j]);rb.visible=false;root.add(rb);S.ribbons.push(rb);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,40,10,1,true),new THREE.MeshBasicMaterial({color:HD154.col[j],transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    beam.position.set(o.x,GH(o.x,o.z)+20,o.z);beam.userData.psNo=1;root.add(beam);
    S.stones.push({o,g,v,gem,rb,beam,spin:0,hum:0});[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dz])=>CBLK.add((o.z+dz)*W+o.x+dx))});
  hd154Sync();return S}
function hd154Sync(){const S=HD154.S;if(!S)return;const done=hd154Done();
  S.stones.forEach((q,j)=>{const on=done||!!HD154.on[j];q.v.rotation.y=hd154VaneYaw(done?q.o.want:HD154.vane[j]);q.gem.visible=on;q.rb.visible=on&&!done;q.beam.material.opacity=on?.04:.12});
  S.heads.forEach((h,j)=>{const on=done||!!HD154.on[j];h.m.visible=on;h.halo.visible=on});
  const open=done?1:0;S.leafs.forEach(l=>l.g.rotation.y=-l.s*1.35*open);S.seals.visible=!done;S.glow.visible=!!open;S.mist.visible=!!open;S.mist.material.opacity=.6;S.lt.intensity=open?1.6:0;
  if(open)S.blkDoor.forEach(k=>CBLK.delete(k));else S.blkDoor.forEach(k=>CBLK.add(k))}
// ---------------- turning a vane ----------------
function hd154Turn(j){const q=HD154.S.stones[j],was=!!HD154.on[j];HD154.vane[j]=(HD154.vane[j]+1)%8;q.spin=1;try{svSnd('crack',.6,1.6);svSnd('whoosh',.5,.8)}catch(_){}
  const ok=HD154.vane[j]===q.o.want;HD154.on[j]=ok?1:0;if(HD154.st<1)HD154.st=1;
  if(ok&&!was){setTimeout(()=>{try{svSnd('bell',1,HD154.pitch[j]);svSnd('hum',.8,HD154.pitch[j]);burst(q.gem.position,HD154.col[j],30,2,2.4,.8)}catch(_){}
      const n=hd154N();say('🌬 The Wind Stone sings. <b>'+HD154.nm[j]+'</b> streams to the great door · '+n+' of 5'+(n>=5?' — the Hydra stirs. Go to the door.':''));
      if(n>=5)try{zt116Show(ZT116.Z[1],'Hillside Crest · Main Quest','The Five Winds','All five winds reach the Gate of the Hydra','Sing the Song of the Mother at the door','z1')}catch(_){}},350)}
  else if(was&&!ok)say('🌬 The wind turns away from the door. '+HD154.nm[j]+' falls silent.');
  else if(!ok){const d=Math.min((q.o.want-HD154.vane[j]+8)%8,(HD154.vane[j]-q.o.want+8)%8);if(d==1){q.hum=1.6;try{svSnd('hum',.5,.8)}catch(_){}say('🌬 The stone hums: almost.')}}
  hd154Sync()}
// ---------------- the Song of the Mother ----------------
function hd154SongSeq(v){const R=ab152R(4441+v*97),n=HD154.verses[v],s=[];let last=-1;for(let i=0;i<n;i++){let k=Math.floor(R()*5);if(k===last)k=(k+1+Math.floor(R()*4))%5;s.push(k);last=k}return s}
function hd154SongStart(){if(HD154.song||hd154Done()||hd154N()<5||HD154.v>=3)return;HD154.song={seq:hd154SongSeq(HD154.v),i:0,t:-1.2,mode:'sing',in:0};
  say('🐍 The Hydra sings verse '+(HD154.v+1)+' of 3. Watch the heads and the chime stones light up, then strike the chime stones in the same order.')}
function hd154Strike(j){const G=HD154.song,S=HD154.S;if(!G||G.mode!='play')return;const c=S.chimes[j];c.f=1;try{svSnd('bell',1,HD154.pitch[j])}catch(_){}S.heads[j].f=1;
  if(G.seq[G.in]===j){G.in++;if(G.in>=G.seq.length){G.mode='done';G.t=0;HD154.v++;try{svSnd('gong',1,1)}catch(_){}
      if(HD154.v>=3){setTimeout(()=>hd154Open(),900)}else{say('🐍 The verse rings true ('+HD154.v+' of 3).');setTimeout(()=>{HD154.song=null;hd154SongStart()},2200)}}}
  else{G.mode='wrong';G.t=0;try{svSnd('hiss',1.2,.9);flash('rgba(255,60,30,.5)');shake(.15)}catch(_){}say('🐍 The heads hiss: wrong stone. The verse is sung again.');setTimeout(()=>{if(HD154.song&&HD154.song.mode=='wrong'){HD154.song.mode='sing';HD154.song.i=0;HD154.song.t=-.8;HD154.song.in=0}},1600)}}
function hd154SongTick(dt){const G=HD154.song,S=HD154.S;if(!G)return;G.t+=dt;
  if(G.mode=='sing'){const step=.95;if(G.t>=0){const i=Math.floor(G.t/step);if(i!==G.last&&i<G.seq.length){G.last=i;const j=G.seq[i];S.heads[j].f=1;S.chimes[j].f=1;try{svSnd('bell',.9,HD154.pitch[j]);svSnd('hum',.5,HD154.pitch[j])}catch(_){}}
      if(G.t>=G.seq.length*step+.3){G.mode='play';G.in=0;G.last=null;say('🐍 Your turn: strike the chime stones in the order the heads sang.')}}}}
function hd154Open(){if(HD154.st>=2)return;HD154.song=null;HD154.op={t:0};try{zt116Show(ZT116.Z[1],'Hillside Crest · Main Quest','The Gate Opens','The Song of the Mother is sung','Beyond lies the Hydra’s Oasis','z1');svSnd('gong',1.2,.7)}catch(_){}}
function hd154OpenTick(dt){const O=HD154.op,S=HD154.S;if(!O)return;O.t+=dt;const T=O.t;
  if(T>.4&&!O.cr){O.cr=1;try{svSnd('crack',1.3,.6);shake(.35);burst(S.seals.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,5,0)),0xb08a3a,50,4,3,1.2)}catch(_){}S.seals.visible=false}
  if(T>1.0&&T<5.2){const k=Math.min(1,(T-1.0)/4.0),e=k*k*(3-2*k);S.leafs.forEach(l=>l.g.rotation.y=-l.s*1.35*e);if(Math.random()<dt*6)try{shake(.08)}catch(_){}
    if(!O.gr){O.gr=1;try{svSnd('heavy',1.3,.5)}catch(_){}}S.glow.visible=true;S.glow.material.opacity=.55*e;S.mist.visible=true;S.mist.material.opacity=.6*e;S.lt.intensity=1.6*e}
  if(T>2.2&&!O.roar){O.roar=1;try{svSnd('roar',1.1,.7)}catch(_){}}
  if(T>5.4&&!O.fin){O.fin=1;HD154.st=2;HD154.op=null;hd154Sync();say('🐍 The Gate of the Hydra stands open. Green light and the sound of water spill out of the mountain.')}}
// ---------------- prompts ----------------
{const f=worldPrompt;worldPrompt=function(){try{if(hd154In()&&HD154.S){const P=pl.position,S=HD154.S;
    for(let j=0;j<5;j++){const q=S.stones[j];if(Math.hypot(P.x-q.o.x,P.z-q.o.z)<2.8){if(hd154Done())return null;
      return {label:'F · Turn the Wind Stone’s serpent'+(HD154.on[j]?' (its wind reaches the door)':''),fn:()=>hd154Turn(j)}}}
    if(!hd154Done()&&HD154.song&&HD154.song.mode=='play')for(let j=0;j<5;j++){const c=S.chimes[j].c;if(Math.hypot(P.x-c.x,P.z-c.z)<1.9)return {label:'F · Strike the '+['jade','sky','sun','ember','dusk'][j]+' chime stone',fn:()=>hd154Strike(j)}}}}catch(e){if(!HD154.err++)console.warn('v154 prompt',e)}
  return f.apply(this,arguments)}}
sp152Gate('hydra',{ig:7,r:5.2,where:()=>sp152GateSpot(7,10.5),build:s=>{HD154.S=null;const S=hd154Build();return S.root},
  prompt(s){if(hd154Done()&&!HD154.op){const N=INSL[8];return {label:'F · Enter the Hydra’s Oasis ('+BOSSES[1].name+')',fn:()=>insGo(N)}}
    if(HD154.op)return null;const n=hd154N();
    if(n<5)return {label:'🔒 The Gate of the Hydra · '+n+'/5 winds reach it',fn:()=>say('🐍 Carved on the door: “Five winds from the five stones; sing them as the Mother wakes.” Five Wind Stones stand on the plateau (marked on your map). Turn each serpent to face this door.')};
    if(!HD154.song)return {label:'F · Listen to the Hydra’s song (verse '+(HD154.v+1)+' of 3)',fn:()=>hd154SongStart()};
    return null}});
// ---------------- each frame in III ----------------
function hd154Tick(dt,now){if(!hd154In()||!HD154.S){if(HD154.S&&HD154.S.lt)HD154.S.lt.intensity=hd154In()&&hd154Done()?1.6:0;return}const S=HD154.S,t=now/1000;
  S.ribbons.forEach(r=>{r.material.uniforms.t.value=t;const tg=r.visible?1:0;r.material.uniforms.op.value+=(tg*.9-r.material.uniforms.op.value)*Math.min(1,dt*2)});
  S.stones.forEach((q,j)=>{q.gem.rotation.y+=dt*1.5;if(q.spin>0){q.spin=Math.max(0,q.spin-dt*3);q.v.position.y+=Math.sin(q.spin*12)*.01}
    if(q.hum>0){q.hum-=dt;if(Math.random()<dt*8)try{const a=Math.atan2(HD154.S.dg.position.x-q.o.x,HD154.S.dg.position.z-q.o.z);burst(new THREE.Vector3(q.o.x+Math.sin(a)*1.5,GH(q.o.x,q.o.z)+4.5,q.o.z+Math.cos(a)*1.5),0xffffff,3,.6,.4,.6)}catch(_){}}
    q.beam.material.opacity=(HD154.on[j]||hd154Done()?.03:.1+.03*Math.sin(t*2+j))});
  S.heads.forEach((h,j)=>{h.f=Math.max(0,h.f-dt*1.8);const on=hd154Done()||!!HD154.on[j];h.m.visible=on||h.f>0;h.halo.visible=h.m.visible;const s=2.0+1.2*h.f+.2*Math.sin(t*3+j);h.halo.scale.set(s,s,1);h.m.scale.setScalar(1+.8*h.f)});
  S.chimes.forEach((c,j)=>{c.f=Math.max(0,c.f-dt*2.2);c.halo.visible=c.f>0||(HD154.song&&HD154.song.mode=='play');const s=1.2+1.6*c.f;c.halo.scale.set(s,s,1);c.cr.rotation.y+=dt;c.cr.position.y=GH(c.c.x,c.c.z)+2.65+.06*Math.sin(t*2+j)});
  hd154SongTick(dt);hd154OpenTick(dt);
  // leaving the door area mid-song pauses it
  if(HD154.song){const D=hd154Plan().door;if(Math.hypot(pl.position.x-D.x,pl.position.z-D.z)>30){HD154.song=null;say('🐍 You walked away from the song. Return to the door to hear it again.')}}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{hd154Tick(dt,now)}catch(e){if(!HD154.err++)console.error('v154 hydra',e)}return r}}
// ---------------- the minimap and the N map ----------------
function hd154Marks(g,P,k){if(!hd154In()||!HD154.S)return;const Pl=hd154Plan(),done=hd154Done();
  Pl.st.forEach((o,j)=>{const q=P(o.x,o.z);if(!q)return;const on=done||HD154.on[j];g.save();g.translate(q[0],q[1]);g.scale(k,k);g.beginPath();g.moveTo(0,-5);g.lineTo(4,4);g.lineTo(-4,4);g.closePath();
    g.fillStyle=on?HD154.css[j]:'#5a5448';g.fill();g.lineWidth=1.2/k;g.strokeStyle='#1a140a';g.stroke();g.restore()});
  const D=Pl.door,q=P(D.x,D.z);if(q){g.save();g.translate(q[0],q[1]);g.scale(k,k);g.fillStyle=done?'#9affc0':'#c8a860';g.strokeStyle='#1a140a';g.lineWidth=1.4/k;g.fillRect(-4,-5,8,10);g.strokeRect(-4,-5,8,10);g.restore()}}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{hd154Marks(mmX,(x,z)=>{const X=(x-(cx-vw/2)+.5)*w/vw,Y=(z-(cy-vh/2)+.5)*h/vh;return X<-6||Y<-6||X>w+6||Y>h+6?null:[X,Y]},1)}catch(_){}}}
{const f=openWMap;openWMap=function(){const r0=f.apply(this,arguments);try{const I=INSL[7];if(hd154In()){const c=$('wmc'),g=c.getContext('2d'),k=Math.min(1060/I.w,640/I.h);hd154Marks(g,(x,z)=>[(x-I.x0+.5)*k,(z-I.y0+.5)*k],1.6)}}catch(e){console.warn('v154 wmap',e)}return r0}}
// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.hd154={v:154,st:HD154.st,vane:HD154.vane.slice(),on:HD154.on.slice(),vs:HD154.v}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.hd154;HD154.st=0;HD154.on=[0,0,0,0,0];HD154.v=0;HD154.song=null;HD154.op=null;
    let P=null;try{P=hd154Plan()}catch(_){}HD154.vane=[0,1,2,3,4].map(j=>P?(P.st[j].want+3+j%3)%8:j);HD154.vInit=P?1:0;
    if(q&&typeof q=='object'){HD154.st=Math.max(0,Math.min(2,q.st|0));if(Array.isArray(q.vane)){q.vane.forEach((v,j)=>{if(j<5)HD154.vane[j]=((v|0)%8+8)%8});HD154.vInit=1}HD154.v=Math.max(0,Math.min(3,q.vs|0));
      if(P)HD154.on=HD154.vane.map((v,j)=>v===P.st[j].want?1:0)}
    if(HD154.S)hd154Sync()}catch(e){console.warn('v154 load',e)}return r}}
// ---------------- the tracker ----------------
SP152.trk.hydra=I=>{if(I.g!==7||hd154Done())return null;const n=hd154N();
  if(n<5)return {name:HD154.name,lines:[['Wind Stones turned to the door',n+'/5'],['Turn each stone’s serpent to face the great door']]};
  return {name:HD154.name,lines:[['Sing the Song of the Mother at the door'],['Verses sung',HD154.v+'/3']]}};
// ---------------- the cheat "All quests complete" (3060) also finishes the Hillside Crest chapters ----------------
{const f=cheatQuests147;cheatQuests147=function(){let n=0;try{if(AB152Q.st<2){AB152Q.st=2;n++}if(CH153Q.st<2){CH153Q.st=2;n++}if(HD154.st<2){HD154.st=2;HD154.song=null;HD154.op=null;n++;hd154Sync()}}catch(e){console.warn('v154 cheat',e)}
  const r=f.apply(this,arguments);if(n)try{say('📜 Cheat: '+n+' Hillside Crest main quest chapter'+(n==1?'':'s')+' marked complete.')}catch(_){}return (r|0)+n}}
