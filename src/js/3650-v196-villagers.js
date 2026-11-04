// ================= v196: villagers — gear that sits on the body, and a day in Duskhold =================
// Owner (Nov 3 2026): "fix villager outfits — right now if they have a job their equipment is floating behind their body (see fisherman
// as example)" · "add better villager animations for when theyre roaming the town. They should be engaging and living in duskhold. Make
// them sit and eat at a table in the Tavern, sit by the fountain, listen to bard etc."
//  * Gear (v104 czProps104: the fisher's rod and creel, the hunter's bow and quiver, the egg keeper's basket and crook, the gatherer's
//    rope, the sack and the tool) was placed at fixed offsets for the old human body; the animal bodies (v137/v142) are shaped and
//    sized per species, so it hung in the air. Now each piece is moved onto the body's real surface: a ray from outside toward the
//    body finds the fur (bind pose), and the piece's inner face is set just on it (dm196Snap). Pieces stay on their bone, so they move
//    with the body.
//  * Routines: an idle villager now picks something to do (seeded per villager, czRand103): eat at a table in the Inn (walks in
//    through the door, sits, lifts food and drink), warm up on the fireside bench, sit on the fountain's rim, rest on a plaza bench,
//    gather before the Bard's Stage to listen (sways and claps), browse a market stall, or stroll as before. Every seat is taken by
//    one villager at a time; a trip, a call home or goods to collect ends the activity at once.
//  * Poses are procedural on the town-folk skeleton (sit, eat, warm hands, listen, clap, browse), laid over the folk idle (ears and
//    tail still move). Co-op: every client runs the same routines from the shared kingdom (houses, citizens, shops).
var DM196V={spots:null,ver:-1,live:new WeakMap()};
// ---------------- gear on the body ----------------
function dm196BodyMeshes(g){return g.children.filter(q=>q.isSkinnedMesh||(q.isMesh&&q.userData&&q.userData.fk))}
function dm196Snap(g){try{const M=dm196BodyMeshes(g);if(!M.length)return;g.updateMatrixWorld(true);const rc=new THREE.Raycaster(),v=new THREE.Vector3(),c=new THREE.Vector3(),b=new THREE.Box3(),O=new THREE.Vector3();
  const pieces=[];const R=g.userData.role;if(R)R.children.forEach(p=>pieces.push(p));['sack'].forEach(k=>{if(g.userData[k])pieces.push(g.userData[k])});
  g.getWorldPosition(O);
  pieces.forEach(p=>{if(p.geometry&&p.geometry.type=='TorusGeometry'&&p.position.y>.05)return; // the mantle wraps the shoulders
    const wasV=p.visible;p.visible=true;b.setFromObject(p);p.visible=wasV;if(b.isEmpty())return;b.getCenter(c);
    // toward the body's middle line at the piece's height (in the horizontal plane)
    const d=new THREE.Vector3(O.x-c.x,0,O.z-c.z);if(d.lengthSq()<1e-4)return;d.normalize();
    const o=c.clone().addScaledVector(d,-1.2);rc.set(o,d);rc.far=3;const h=rc.intersectObjects(M,false)[0];if(!h)return;
    // the piece's own face toward the body (its bounding box corner furthest along d)
    let s=-1e9;for(let i=0;i<8;i++){v.set(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z);s=Math.max(s,v.dot(d))}
    const want=h.point.dot(d)+.012,mv=want-s;if(Math.abs(mv)<.004||Math.abs(mv)>.9)return;
    const w=d.clone().multiplyScalar(mv),par=p.parent;const q=par.getWorldQuaternion(new THREE.Quaternion()).invert(),sc=par.getWorldScale(new THREE.Vector3());
    w.applyQuaternion(q);w.set(w.x/sc.x,w.y/sc.y,w.z/sc.z);p.position.add(w);p.updateMatrixWorld(true)})}catch(e){console.warn('v196 gear',e)}}
{const f=czModel103;czModel103=function(c){const g=f.apply(this,arguments);try{const r0=g.rotation.y,p0=g.position.clone();g.rotation.set(0,0,0);g.position.set(0,0,0);dm196Snap(g);g.rotation.y=r0;g.position.copy(p0)}catch(e){console.warn('v196 gear',e)}return g}}
// ---------------- the places villagers go ----------------
function dm196Spots(){const T=TOWNS[0],sig=KL103.ver+'|'+kf109().s+'|'+(shopBuilt('bard')?1:0);if(DM196V.spots&&DM196V.ver===sig)return DM196V.spots;const S=[],keep=new Map();(DM196V.spots||[]).forEach(s=>{if(s.busy)keep.set(s.id,s.busy)});
  const add=o=>{o.id=o.k+'|'+o.x.toFixed(1)+'|'+o.z.toFixed(1);o.busy=keep.get(o.id)||null;S.push(o)};
  // the Inn: chairs and stools (eat), the fireside bench (warm), reached through the door
  const l=DM196I.l;if(l){const door=lotW103(l,0,5.3),inD=lotW103(l,0,2.6);
    DM196I.seats.forEach(s=>{const [x,z]=lotW103(l,s.x,s.z),[tx,tz]=lotW103(l,s.tx,s.tz),a=Math.hypot(s.x-s.tx,s.z-s.tz)||1,[ax,az]=lotW103(l,s.x+(s.x-s.tx)/a*.55,s.z+(s.z-s.tz)/a*.55);
      add({k:s.k,act:s.k=='bench'?'warm':'eat',x,z,ry:Math.atan2(tx-x,tz-z),sit:1,h:{chair:.38,stool:.52,bench:.32}[s.k],w:5,via:[door,inD,[ax,az]],inn:1})})}
  // the fountain's rim (eight places, facing out)
  for(let i=0;i<8;i++){const a=(i+.5)/8*6.283,x=T.cx+Math.sin(a)*2.42,z=T.cy-Math.cos(a)*2.42;add({k:'rim',act:'rim',x,z,ry:Math.atan2(Math.sin(a),-Math.cos(a)),sit:1,h:.62,w:3,app:[T.cx+Math.sin(a)*3.6,T.cy-Math.cos(a)*3.6]})}
  // the plaza benches (two places each)
  TWN100_WD.bench.forEach(([bx,bz,bry])=>{[-.4,.4].forEach(o=>{const x=T.cx+bx+Math.cos(bry)*o,z=T.cy+bz-Math.sin(bry)*o;add({k:'bench',act:'rest',x,z,ry:bry,sit:1,h:.44,w:2,app:[x+Math.sin(bry)*.8,z+Math.cos(bry)*.8]})})});
  // before the Bard's Stage: an arc of listeners facing the stage
  if(shopBuilt('bard')){const bl=lotOf103('bard');if(bl)for(let i=0;i<6;i++){const u=(i-2.5)*1.05,v=5.6+Math.abs(u)*.25,[x,z]=lotW103(bl,u,v),[sx,sz]=lotW103(bl,0,3);
    if(!kfIn109(x-T.cx,z-T.cy,.5)||dm196LotHit(x-T.cx,z-T.cy,0))continue;add({k:'listen',act:'listen',x,z,ry:Math.atan2(sx-x,sz-z),sit:0,w:3})}}
  // the market stalls: browse the wares
  KF109_STALL.forEach(([sx,sz,c,ry])=>{const x=T.cx+sx+Math.sin(ry)*1.25,z=T.cy+sz+Math.cos(ry)*1.25;add({k:'stall',act:'browse',x,z,ry:ry+Math.PI,sit:0,w:2})});
  DM196V.spots=S;DM196V.ver=sig;return S}
function dm196Pick(o){const S=dm196Spots(),free=S.filter(s=>!s.busy);if(!free.length||czRand103(o)<.22)return null;let t=0;free.forEach(s=>t+=s.w);let u=czRand103(o)*t;for(const s of free){u-=s.w;if(u<=0)return s}return free[0]}
function dm196Free(o){if(o.act&&o.act.s&&o.act.s.busy===o)o.act.s.busy=null;o.act=null}
// ---------------- poses (rest pose + offsets, on the folk skeleton) ----------------
// every offset is written down (DM196V.cur) and taken off again before the next frame: the folk idle layers its own motion
// additively over whatever the bones hold (idlAp), so offsets left in place would pile up
function dm196R(g,k,x,y,z){const b=g.bones[k];if(!b)return;x=x||0;y=y||0;z=z||0;b.rotation.x+=x;b.rotation.y+=y;b.rotation.z+=z;if(DM196V.cur)DM196V.cur.push([b,x,y,z])}
function dm196Undo(o){const L=o._pz;if(!L)return;for(const [b,x,y,z,py] of L){if(py!=null){b.position.y=py;continue}b.rotation.x-=x;b.rotation.y-=y;b.rotation.z-=z}o._pz=null}
function dm196Sit(g,h){const B=g.bones,R=g.userData.rest;if(!B.pelvis||!R)return;
  // thighs forward, shins down; the pelvis drops so the seat carries it (h = seat height)
  const drop=Math.max(0,(g.userData.hipY||.55)-(h+.07));if(DM196V.cur)DM196V.cur.push([B.pelvis,0,0,0,B.pelvis.position.y]);B.pelvis.position.y=R.pelvis[4]-drop/(g.userData.sy||1);
  ['lh0','rh0'].forEach(k=>dm196R(g,k,-1.42,0,0));['lh1','rh1'].forEach(k=>dm196R(g,k,1.38,0,0));['lh2','rh2'].forEach(k=>dm196R(g,k,.08,0,0));dm196R(g,'spine',.06)}
function dm196Pose(o,now){const g=o.g,A=o.act,t=now/1000+(o.i||0)*1.7;if(!A||!g.bones)return;const s=A.s;DM196V.cur=o._pz=[];try{dm196Pose0(o,g,A,s,t)}finally{DM196V.cur=null}}
function dm196Pose0(o,g,A,s,t){
  if(s.sit){dm196Sit(g,s.h);
    if(A.a=='eat'){const p=(t*.45+o.i*.3)%3,lift=p<1?Math.sin(p*Math.PI):0;dm196R(g,'aR0',-.55-1.05*lift,0,-.1);dm196R(g,'aR1',-.6-.9*lift,0,0);dm196R(g,'aL0',-.5,0,.12);dm196R(g,'aL1',-.7,0,0);dm196R(g,'head',.18-.2*lift,0,0);dm196R(g,'spine',.08)}
    else if(A.a=='warm'){dm196R(g,'aR0',-.95,0,-.05);dm196R(g,'aL0',-.95,0,.05);dm196R(g,'aR1',-.35);dm196R(g,'aL1',-.35);dm196R(g,'head',.05,.15*Math.sin(t*.4))}
    else if(A.a=='rim'){const sw=Math.sin(t*1.6+o.i);dm196R(g,'lh1',.25*sw);dm196R(g,'rh1',-.25*sw);dm196R(g,'head',-.05,.5*Math.sin(t*.35+o.i),0);dm196R(g,'aL0',-.15,0,.25);dm196R(g,'aR0',-.15,0,-.25)}
    else{dm196R(g,'head',.08,.35*Math.sin(t*.3+o.i),0);dm196R(g,'aL0',-.35,0,.1);dm196R(g,'aR0',-.35,0,-.1);dm196R(g,'aL1',-.5);dm196R(g,'aR1',-.5)}}
  else if(A.a=='listen'){const sw=Math.sin(t*2.1+o.i),cl=((t*.5+o.i*.37)%4)<1.1;dm196R(g,'spine',0,0,.07*sw);dm196R(g,'chest',0,.08*sw,.04*sw);dm196R(g,'head',-.08,.1*sw,.08*sw);
    if(cl){const k=Math.abs(Math.sin(t*9));dm196R(g,'aL0',-1.0,0,.55-.25*k);dm196R(g,'aR0',-1.0,0,-.55+.25*k);dm196R(g,'aL1',-.9);dm196R(g,'aR1',-.9)}}
  else if(A.a=='browse'){const p=(t*.35+o.i)%4,r=p<1.2?Math.sin(p/1.2*Math.PI):0;dm196R(g,'spine',.12);dm196R(g,'head',.25,.3*Math.sin(t*.5+o.i),0);dm196R(g,'aR0',-.4-.8*r,0,-.1);dm196R(g,'aR1',-.4)}}
// ---------------- the routine ----------------
{const f=czStep103;czStep103=function(o,dt,now){dm196Undo(o);const c=o.c,idle=!(c.task&&c.t0)&&!c.bag&&!(c.task&&c.wf);
  if(!idle){if(o.act){dm196Free(o);o.mode='';o.path=null;o.wait=1}return f.apply(this,arguments)}
  const A=o.act;
  if(!A&&o.mode!='walk'&&(o.wait||0)-dt<=0){const s=dm196Pick(o);if(s){const g=o.g,way=[];let P=null;
      if(s.inn){P=czPath103(g.position.x,g.position.z,s.via[0][0],s.via[0][1]);if(P)P=P.concat([s.via[1],s.via[2],[s.x,s.z]])}
      else{const ap=s.app||[s.x,s.z];P=czPath103(g.position.x,g.position.z,ap[0],ap[1]);if(P&&s.app)P=P.concat([[s.x,s.z]])}
      if(P&&czLen103(P)>.3){s.busy=o;o.act={s,a:s.act,ph:'go',t:0,dur:(s.inn?22:14)+czRand103(o)*(s.inn?30:20)};o.path=P;o.len=czLen103(P);o.d=0;o.mode='walk'}else o.wait=2+czRand103(o)*3}}
  if(o.act&&o.act.ph=='go'&&o.mode!='walk'){const s=o.act.s;if(Math.hypot(o.g.position.x-s.x,o.g.position.z-s.z)<.6){o.act.ph='do';o.act.t=0}else{dm196Free(o);o.wait=2}}
  if(o.act&&o.act.ph=='do'){o.wait=99;o.mode='';const r=f.apply(this,arguments),s=o.act.s,g=o.g;g.position.set(s.x,TOWNS[0].ph,s.z);o.ry=s.ry;g.rotation.y=s.ry;
    if(g.visible&&Math.hypot(g.position.x-pl.position.x,g.position.z-pl.position.z)<40)dm196Pose(o,now);
    o.act.t+=dt;if(o.act.t>o.act.dur){// get up and walk back out (the Inn: past the tables to the door)
      const P=s.inn?[[s.x,s.z],s.via[2],s.via[1],s.via[0]]:[[s.x,s.z],s.app||[s.x+Math.sin(s.ry)*1.2,s.z+Math.cos(s.ry)*1.2]];
      dm196Free(o);o.path=P;o.len=czLen103(P);o.d=0;o.mode='walk';o.wait=0;dm196Undo(o);if(g.userData.rest)czReset103(g)}
    return r}
  if(o.act&&o.act.ph=='go')o.wait=99;
  const r=f.apply(this,arguments);if(o.mode==''&&!o.act&&o.wait>12)o.wait=3+czRand103(o)*6;return r}}
// seats are free again when the villagers are rebuilt; each body remembers its hip height (for the sitting drop)
{const f=czSpawn103;czSpawn103=function(){(DM196V.spots||[]).forEach(s=>s.busy=null);const r=f.apply(this,arguments);try{CZ103.live.forEach(o=>{const g=o.g;g.updateMatrixWorld(true);const v=new THREE.Vector3();if(g.bones&&g.bones.lh0){g.bones.lh0.getWorldPosition(v);g.userData.hipY=v.y-g.position.y}
  o.wait=2+(o.i||0)*1.3})}catch(e){console.warn('v196 villagers',e)}return r}}
{const f=czClear103;czClear103=function(){(DM196V.spots||[]).forEach(s=>s.busy=null);return f.apply(this,arguments)}}
