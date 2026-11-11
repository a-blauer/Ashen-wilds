// ================= v219: Searing Sands II's temple court (owner, Nov 10 2026) =================
// Owner: "The temple in searing sands 2 has no obvious entrance- and the correct entrance has dirt covering it and a black box in the
// entrance. The sealed urns in there show a goo as the portrait- please fix. One of the urns also spawns inside a statue. The coffin
// there also has floating discs- fix those. Also dont make the coffin transparent when the camera goes in it. Kheprit walks through
// the coffin when you start the mission, and cultists also walk through it.. make it solid and people have to go around it. When
// walking through the portal at the end of this mission you can see the bodies piled up that are only supposed to be visible when
// you come back to the temple."
//  * The urns (3282): a Sealed Urn is a hidden Sand Ooze carrying the urn model, so the target frame drew the ooze. The portrait is now
//    the urn itself (TS218.urnPic). Urns that stood in a statue, an obelisk or a column of the court (3280 lays them out on a ring that
//    crosses the statues' ring) are moved to the nearest clear spot (ts218Urns, at load, the same on every screen).
//  * The altar ("the coffin", 3280 'CY165|altar'): its two offering bowls hung in the air beside the slab and its gold bands stuck out
//    past its ends; the bowls now stand on posts on the top step, the bands run round the slab, the canopic jars sit on the step. It
//    never turns see-through for the camera (noFade135), and the slab and the posts are solid for everyone (CBLK).
//  * Kheprit walks from the altar to the rift stones round the dais, not across it (TS218.path, via rf165KhSpot).
//  * The heaped dead (3283 rf165After) appear only once the hero has left the court: the rift used to show them the moment the
//    hero stepped in (the state changes before the hero is moved).
//  * The entrance: below (ts218Gate).
var TS218={on:true,path:[[-3.2,4.9],[3.4,4.9],[7.6,2.6]],pick:.5,err:0};
// ---------- the urns: clear of the statues, obelisks and columns ----------
function ts218Obst(T){const O=[];
  for(let k=0;k<6;k++){const ang=Math.PI/6+k*Math.PI/3;O.push([Math.cos(ang)*13.9,Math.sin(ang)*13.9,1.7])}
  for(let k=0;k<4;k++){const ang=Math.PI/4+k*Math.PI/2;O.push([Math.cos(ang)*11.6,Math.sin(ang)*11.6,1.6])}
  for(let i=0;i<28;i++){const ang=i/28*Math.PI*2;O.push([Math.cos(ang)*T.col,Math.sin(ang)*T.col,1.3])}
  return O}
function ts218Urns(){const T=ss165T2();if(!T||!T.urns||T.u218)return;T.u218=1;const O=ts218Obst(T),free=(a,b,i)=>Math.hypot(a,b)<T.R-1.6&&Math.hypot(a,b)>4.4&&Math.hypot(a-T.rift.a,b)>4.5&&
    T.gates.every(g=>Math.hypot(a-g.a,b-g.b)>4.2)&&O.every(o=>Math.hypot(a-o[0],b-o[1])>o[2])&&T.urns.every((u,j)=>j===i||Math.hypot(u.a-a,u.b-b)>2.2);
  T.urns.forEach((u,i)=>{if(O.every(o=>Math.hypot(u.a-o[0],u.b-o[1])>o[2]))return;
    // the nearest clear spot: inward first, then round the ring
    let best=null,bd=1e9;for(let r=.4;r<=4;r+=.4)for(let k=0;k<16;k++){const ang=k/16*Math.PI*2,a=u.a+Math.cos(ang)*r,b=u.b+Math.sin(ang)*r;if(!free(a,b,i))continue;const d=r+(Math.hypot(a,b)>Math.hypot(u.a,u.b)?.3:0);if(d<bd){bd=d;best=[a,b]}}
    if(best){u.a=best[0];u.b=best[1];u.m218=1}})}
try{ts218Urns()}catch(e){console.warn('v219 urns',e)}
// the urn's portrait: the urn, not the hidden ooze
{const f=setTarget;setTarget=function(e){const r=f.apply(this,arguments);try{if(TS218.on&&e&&e.kh165u!=null&&TPV.sc){if(TPV.m)TPV.sc.remove(TPV.m);
    const g=new THREE.Group();g.add(kh165UrnModel(e.kh165u));g.rig=function(){};g.rotation.y=.55;g.updateMatrixWorld(true);TPV.sc.add(g);TPV.m=g;
    const bb=new THREE.Box3().setFromObject(g),c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3()),q=Math.max(sz.x,sz.y,sz.z);
    TPV.cam.position.set(c.x+q*.3,c.y+q*.32,c.z+q*1.45);TPV.cam.lookAt(c.x,c.y+sz.y*.06,c.z);portraitDraw(performance.now())}}catch(err){console.warn('v219 urn portrait',err)}return r}}
// ---------- the altar ----------
function ts218Altar(q){dt168Up(q);const T=ss165T2(),F=T.F,W2=F.W2,y0=T.y0,yw=F.yaw,sd=[0xc8a070,0xbc9464,0xd2ac7c,0xb08858],sdD=0x8a6a44,gl=0x2a1a0e,gold=0xd8a840,A=T.altar;
  const [ax,az]=W2(A.a,A.b);
  // the stepped dais (top at y0 + .9, its lining to .915)
  [[6.8,.3],[5.6,.6],[4.4,.9]].forEach(([w,h],k)=>q.p('','box','c',k==1?sd[1]:sd[0],ax,y0+h-.15,az,w,.3,w,0,yw,0).p('','box','c',sdD,ax,y0+h+.005,az,w+.04,.02,w+.04,0,yw,0));
  // the slab (long along the court's axis) and its cap
  q.p('','box','c',sd[2],ax,y0+1.35,az,1.9,.9,3.8,0,yw,0).p('','box','c',sdD,ax,y0+1.82,az,2.1,.12,4.0,0,yw,0);
  const fig=(aa,bb,w,l,ang)=>{const [x,z]=W2(A.a+aa,A.b+bb);q.p('','box','c',gl,x,y0+1.89,z,w,.02,l,0,yw+ang,0)};
  fig(1.35,0,.42,.5,0);fig(.6,0,.6,.9,0);fig(-.55,0,.75,1.2,0);[-1,1].forEach(s=>{[.85,.55,.25].forEach((aa,k)=>fig(aa-.1,s*.62,.06,.9,s*(.9-k*.5)));fig(.95,s*.5,.06,.7,s*-.6)});
  // canopic jars at the corners of the top step, standing on it
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([a,b])=>{const [x,z]=W2(A.a+a*1.85,A.b+b*1.85);q.p('','cyl','c',0xd8c0a0,x,y0+1.165,z,.2,.5,.2).p('','sph','c',[0x6a5a3a,0x8a6a4a,0x5a4a3a,0x7a6a4a][(a+1)+(b+1)/2],x,y0+1.48,z,.17,.16,.17)});
  // offering bowls of coals on posts beside the slab
  [-1,1].forEach(s=>{const [x,z]=W2(A.a,A.b+s*1.55);q.p('','cyl','c',sdD,x,y0+1.215,z,.11,.6,.11).p('','cyl','c',sd[3],x,y0+.95,z,.2,.07,.2).p('','cyl','m',0x6a4a24,x,y0+1.565,z,.28,.1,.28).p('','sph','g',0xff8a3a,x,y0+1.62,z,.22,.06,.22);CY165.fires.push([x,y0+1.7,z])});
  // gold bands round the slab, just under the cap: across each end, along each side
  [-1,1].forEach(s=>{const [x,z]=W2(A.a+s*1.955,A.b);q.p('','box','m',gold,x,y0+1.62,z,1.9,.08,.02,0,yw,0)});
  [-1,1].forEach(s=>{const [x,z]=W2(A.a,A.b+s*.955);q.p('','box','m',gold,x,y0+1.62,z,.02,.08,3.8,0,yw,0)})}
{const f=dt168Group;dt168Group=function(key,build,W,mot){if(TS218.on&&key==='CY165|altar'){const g=f.call(this,key,ts218Altar,W,mot);
    // never see-through: its own materials, kept out of the camera fade
    try{g.traverse(o=>{if(o.isMesh&&o.material)o.material=ts218NoFade(o.material)})}catch(_){}
    try{ts218Solid()}catch(e){console.warn('v219 altar solid',e)}return g}
  return f.apply(this,arguments)}}
// a copy of a shared material that the camera fade (2420 f135Patch) leaves alone: built fresh (the shared one's shader hook may
// already carry the fade), with the v183 paint (3410) put back the way it is on the original (one copy per original)
function ts218NoFade(o){const K=TS218.mats||(TS218.mats=new Map());if(K.has(o))return K.get(o);const m=o.clone(),P=THREE.Material.prototype;
  if(Object.prototype.hasOwnProperty.call(m,'onBeforeCompile'))delete m.onBeforeCompile;if(Object.prototype.hasOwnProperty.call(m,'customProgramCacheKey'))delete m.customProgramCacheKey;
  if(o.defines)m.defines=JSON.parse(JSON.stringify(o.defines));m.userData=Object.assign({},o.userData,{noFade135:1});
  try{if(typeof ep183Hook=='function'&&o.defines&&o.defines.ENVDET!==undefined)ep183Hook(m)}catch(_){}m.needsUpdate=true;K.set(o,m);return m}
// the slab and the bowls' posts are solid (a rectangle along the slab, tiles whose middle lies inside it)
function ts218Solid(){const T=ss165T2(),F=T.F,A=T.altar,[cx,cz]=F.W2(A.a,A.b),ha=2.35,hb=1.85;
  for(let j=Math.floor(cz-4);j<=cz+4;j++)for(let i=Math.floor(cx-4);i<=cx+4;i++){const dx=i-cx,dz=j-cz,a=dx*F.fx+dz*F.fz,b=dx*F.lx+dz*F.lz;if(Math.abs(a)<=ha&&Math.abs(b)<=hb)CBLK.add(j*W+i)}
  // the court's wall is solid all round (it was only drawn: a hero could walk in through it anywhere); the way in is the road's gate
  const RW=T.R+.9,G0=T.gates[0];for(let j=Math.floor(F.z-RW-2);j<=F.z+RW+2;j++)for(let i=Math.floor(F.x-RW-2);i<=F.x+RW+2;i++){const [a,b]=F.L2(i,j),d=Math.hypot(a,b);
    if(Math.abs(d-RW)>.75)continue;if(Math.abs(b-G0.b)<1.45&&a<0)continue;CBLK.add(j*W+i)}}
// ---------- Kheprit goes round the dais to the rift stones ----------
// while he walks (RF165.E set, not yet channelling) rf165KhSpot gives the next corner of TS218.path (on the side he starts from),
// then the stones; a corner counts as reached within TS218.pick
{const f=rf165KhSpot;rf165KhSpot=function(){const E=typeof RF165!='undefined'&&RF165.E,K=typeof KH165W!='undefined'&&KH165W.e;if(!TS218.on||!E||E.go||!K)return f.apply(this,arguments);
  try{const T=ss165T2(),F=T.F,P=K.m.position;if(E.w218==null){const dx=P.x-F.x,dz=P.z-F.z;E.w218=0;E.s218=(dx*F.lx+dz*F.lz)>=0?1:-1;
      // already past the dais (a retry from where he fell): straight on
      if(dx*F.fx+dz*F.fz>T.altar.a+3)E.w218=TS218.path.length}
    while(E.w218<TS218.path.length){const c=TS218.path[E.w218],[x,z]=F.W2(c[0],c[1]*E.s218);if(Math.hypot(P.x-x,P.z-z)>TS218.pick)return {x,z,y:T.y0};E.w218++}}catch(_){}
  return f.apply(this,arguments)}}
// ---------- the dead: only once the hero has left the court ----------
// kh165Sync removes the standing Kheprit and calls rf165After when the chapter is done; if that happens while this hero is in the
// court with the living Warden there (the run into the rift, or a partner's), the heaps wait until this hero is elsewhere
{const f=kh165Sync;kh165Sync=function(){const live=!!(typeof KH165W!='undefined'&&KH165W.e)&&ss165Here(1);TS218.live=live;try{return f.apply(this,arguments)}finally{TS218.live=false}}}
{const f=rf165After;rf165After=function(){if(TS218.on&&(TS218.live||TS218.pend)&&ss165Here(1)){TS218.pend=1;return}TS218.pend=0;return f.apply(this,arguments)}}
// while they wait, the rift still turns and still takes a hero who runs in (rf165Tick only does that once the heaps exist)
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{if(TS218.pend){if(!ss165Here(1)){TS218.pend=0;rf165After();if(RF165.aft)RF165.aft.visible=false}
    else if(!RF165.E){rf165RiftK(1,now/1000);rf165Enter()}}}catch(e){if(!TS218.err++)console.warn('v219 after',e)}return r}}
// ---------- the entrance (ts218Gate) ----------
// The road comes down into the court through the gate at its near end (T.gates[0]), but the court's rim bank (3280
// ss165T2Terrain: the ground rises 1.2 per tile beyond the court's edge) heaped a hump of sand across the gateway, and the gateway
// was filled with a black box (the "dark doorway" all three gates had). Now:
//  * the ground through the road's gate is level with the court's floor out to just past the pylons, then rises gently to the road
//    (TS218.road: the corridor's half width, its blend at the sides; the terrain mesh there is redrawn from the new heights);
//  * the road's gateway is open, paved through, with a brazier burning either side of it outside;
//  * the two side gates, which lead nowhere a hero can go, are shut with sealed stone doors instead of black boxes.
TS218.road={hw:2.9,edge:1.6,flat:2.4,ramp:6.5,reach:9};
function ts218RoadH(T,a,h0,yr){const R=T.R,u=-a-R;if(u<=TS218.road.flat-1)return T.y0;const k=Math.min(1,Math.max(0,(u-TS218.road.flat+1)/TS218.road.ramp));return T.y0+(yr-T.y0)*k*k*(3-2*k)}
function ts218Road(){const T=ss165T2(),F=T.F,Rd=TS218.road,HI=(i,j)=>(j+HPD)*HW+i+HPD;if(T.y0==null)return;
  // the road's own height a little way out (where the bank no longer reaches)
  let yr=T.y0;{const [x,z]=F.W2(-T.R-Rd.reach,0);yr=Math.min(T.y0+1.2,Math.max(T.y0,GH(x,z)))}
  let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,n=0;
  for(let a=-T.R-Rd.reach;a<=-T.R+1;a+=.5)for(let b=-Rd.hw-Rd.edge-1;b<=Rd.hw+Rd.edge+1;b+=.5){const [x,z]=F.W2(a,b),i=Math.round(x),j=Math.round(z),[la,lb]=F.L2(i,j);
    if(la>-T.R+.6||la<-T.R-Rd.reach)continue;const ab=Math.abs(lb);if(ab>Rd.hw+Rd.edge)continue;const k=HI(i,j),h0=HF[k],t=ts218RoadH(T,la,h0,yr),w=ab<=Rd.hw?1:1-Math.min(1,(ab-Rd.hw)/Rd.edge),wo=la<-T.R-Rd.reach+2?(la+T.R+Rd.reach)/2:1,ww=w*w*(3-2*w)*Math.max(0,Math.min(1,wo));
    const h=h0+(Math.min(h0,t)-h0)*ww;if(h!==h0){HF[k]=h;n++;x0=Math.min(x0,i);z0=Math.min(z0,j);x1=Math.max(x1,i);z1=Math.max(z1,j)}}
  if(n)ts218Redraw(x0-1,z0-1,x1+1,z1+1);TS218.roadN=n;TS218.yr=yr}
// the terrain mesh over a box of tiles, from the heights as they are now (buildTerrain in 0060 puts a vertex on every tile)
function ts218Redraw(x0,z0,x1,z1){(typeof CHL!='undefined'?CHL:[]).forEach(c=>(c.ms||[]).forEach(m=>{const g=m&&m.geometry;if(!g||m.isInstancedMesh||!g.attributes.uv||!g.index)return;const P=g.attributes.position,N=g.attributes.normal;let ch=0;
    for(let k=0;k<P.count;k++){const x=P.getX(k),z=P.getZ(k);if(x<x0||x>x1||z<z0||z>z1||x!==Math.round(x)||z!==Math.round(z))continue;const y=GHv(x,z);if(Math.abs(P.getY(k)-y)<1e-4)continue;P.setY(k,y);
      if(N){const gx=GHv(x-1,z)-GHv(x+1,z),gz=GHv(x,z-1)-GHv(x,z+1),l=Math.hypot(gx,2,gz);N.setXYZ(k,gx/l,2/l,gz/l)}ch++}
    if(ch){P.needsUpdate=true;if(N)N.needsUpdate=true;g.computeBoundingSphere();g.computeBoundingBox()}}))}
try{ts218Road()}catch(e){console.warn('v219 temple road',e)}
// the court's scenery: the road's gateway open and paved, braziers outside it, the side gates sealed
{const f=dt168Group;dt168Group=function(key,build,W,mot){if(!TS218.on||key!=='CY165|court')return f.apply(this,arguments);
  const T=ss165T2(),F=T.F,G0=T.gates[0],[rx,rz]=F.W2(G0.a+Math.cos(G0.ang)*.7,G0.b+Math.sin(G0.ang)*.7);
  const b2=q=>{const p0=q.p;q.p=function(n,geo,t,col,x,y,z,sx,sy,sz,ax,ay,az){if(col===0x080402){
        if(Math.hypot(x-rx,z-rz)<.6){ts218Gateway(q,p0,T);return q}
        // a side gate: a sealed door of dressed stone, a seam down the middle, two bronze bands and a sun disc
        p0.call(q,n,geo,t,0x8a6a44,x,y,z,sx,sy,sz*.9,ax,ay,az);p0.call(q,'','box','c',0x5a4430,x,y,z,.06,sy*.98,sz*.95,ax,ay,az);
        [1.2,3.6].forEach(h=>p0.call(q,'','box','m',0x8a6a3a,x,y-sy/2+h,z,sx*.98,.12,sz*1.05,ax,ay,az));p0.call(q,'','cyl','m',0xd8a840,x,y+.6,z,.32,sz*1.1,.32,Math.PI/2,ay,0);return q}
      return p0.apply(q,arguments)};try{build(q)}finally{q.p=p0}};
  return f.call(this,key,b2,W,mot)}}
// the open gateway: flagstones from the court's floor out between the pylons, a step down the ramp, braziers either side outside
function ts218Gateway(q,p,T){const F=T.F,W2=F.W2,y0=T.y0,yw=F.yaw,sd=[0xc8a070,0xbc9464,0xd2ac7c,0xb08858],R=T.R;
  for(let a=-R+.2;a>=-R-TS218.road.flat+.2;a-=1.5)for(let b=-1.2;b<=1.21;b+=1.2){const [x,z]=W2(a,b);p.call(q,'','box','c',sd[(Math.round(a*3+b*7)%4+4)%4],x,y0+.02,z,1.16,.1,1.44,0,yw,0)}
  // a worn threshold stone between the pylons
  {const [x,z]=W2(-R-.2,0);p.call(q,'','box','c',0x9a7a50,x,y0+.06,z,2.9,.14,.9,0,yw,0)}
  [-1,1].forEach(s=>{const a=-R-TS218.road.flat-.6,b=s*2.3,[x,z]=W2(a,b),g=GH(x,z);[0,1,2].forEach(j=>{const aa=j*2.09;q.L('','m',0x3a3c42,[x+Math.cos(aa)*.32,g,z+Math.sin(aa)*.32],[x,g+1.0,z],.025,.025,4)});
    p.call(q,'','cyl','m',0x4a3a2a,x,g+1.05,z,.34,.2,.34);p.call(q,'','sph','g',0xff7a2a,x,g+1.16,z,.27,.1,.27);CY165.fires.push([x,g+1.3,z])})}
