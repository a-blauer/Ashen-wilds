// ================= v141: gathering has its own animations and tools =================
// Every gathering kind used to replay the equipped weapon's basic swing (featTick → swingAnim) with the weapon in hand.
// Now each kind has its own motion and, where it fits, a tool in the hand instead of the weapon (the weapon is hidden while
// gathering and comes back when it ends):
//   chopping a tree   - a hatchet, a level two-handed swing into the trunk at waist height
//   mining rock/crystal - a pickaxe, raised overhead and brought down with a bend of the knees
//   digging a mound    - a spade, pushed down with the weight forward, then levered back
//   foraging (fibre, berries, petals, glow caps, bones) - no tool: crouched, reaching down with one hand then the other
//   wading for clay    - no tool: bent over, scooping with both hands
//   fishing            - a rod: a cast, then the rod held out low, a sharp lift when a fish strikes
// The hatchet and pickaxe ride in the hand through the v93 grip layer (weapon types axes and hammer); the spade and the rod are
// aimed in the world every frame after the animation (spade: down into the ground ahead, rod: out ahead and up). Foraging and
// wading put the weapon away and use bare hands. The motions are ordinary attack tracks (haPlay) with no hit.
var SK141={tool:null,kind:null,hid:[],rod:null,line:null,fishT:0};
// ---------------- tools ----------------
function sk141Mat(c,r){return new THREE.MeshStandardMaterial({color:c,roughness:r==null?.75:r,metalness:r!=null&&r<.5?.5:0,flatShading:true})}
function sk141Part(g,geo,mat,x,y,z,rx,ry,rz){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;g.add(m);return m}
function sk141Tool(kind){const g=new THREE.Group(),wood=sk141Mat(0x6a4a2c),wd=sk141Mat(0x4a3220),iron=sk141Mat(0x8a8e96,.45),dark=sk141Mat(0x3a3c42,.5),leather=sk141Mat(0x3a2418);
  const cyl=(r1,r2,h)=>new THREE.CylinderGeometry(r1,r2,h,7),box=(x,y,z)=>new THREE.BoxGeometry(x,y,z);
  if(kind=='hatchet'){sk141Part(g,cyl(.02,.024,.56),wood,0,-.18,0);sk141Part(g,cyl(.027,.027,.08),leather,0,.02,0);
    sk141Part(g,box(.07,.09,.045),dark,.02,-.42,0);const b=new THREE.Shape();b.moveTo(0,-.05);b.lineTo(.13,-.085);b.quadraticCurveTo(.16,0,.13,.085);b.lineTo(0,.05);b.lineTo(0,-.05);
    const bl=new THREE.Mesh(new THREE.ExtrudeGeometry(b,{depth:.016,bevelEnabled:false}),iron);bl.position.set(.04,-.42,-.008);g.add(bl);g.userData.wt='axes'}
  else if(kind=='pick'){sk141Part(g,cyl(.021,.025,.66),wood,0,-.22,0);sk141Part(g,cyl(.028,.028,.1),leather,0,.04,0);
    sk141Part(g,box(.06,.07,.06),dark,0,-.53,0);[-1,1].forEach(s=>{sk141Part(g,box(.17,.035,.035),iron,s*.11,-.53+(.02),0,0,0,s*.18);sk141Part(g,new THREE.ConeGeometry(.02,.09,5),iron,s*.235,-.49,0,0,0,-s*Math.PI/2+s*.35)});g.userData.wt='hammer'}
  else if(kind=='spade'){sk141Part(g,cyl(.02,.022,.86),wood,0,-.34,0);sk141Part(g,box(.14,.025,.03),wd,0,.1,0);[-1,1].forEach(s=>sk141Part(g,cyl(.012,.012,.08),wd,s*.06,.06,0,0,0,s*.6));
    sk141Part(g,box(.05,.1,.04),dark,0,-.8,0);sk141Part(g,box(.17,.22,.018),iron,0,-.94,0);sk141Part(g,new THREE.ConeGeometry(.12,.08,4,1),iron,0,-1.07,0,Math.PI,Math.PI/4,0).scale.set(1,1,.15);g.userData.aim='spade'}
  else if(kind=='rod'){const L=1.55;sk141Part(g,cyl(.006,.017,L),wood,0,-L/2+.12,0);sk141Part(g,cyl(.022,.022,.16),leather,0,.04,0);
    sk141Part(g,cyl(.032,.032,.03),dark,.035,-.04,0,0,0,Math.PI/2);for(let i=1;i<5;i++)sk141Part(g,new THREE.TorusGeometry(.012,.003,4,8),iron,.012,.12-L*i/5,0,0,Math.PI/2,0);
    g.userData.tipY=.12-L}
  g.userData.sk141=kind;return g}
function sk141ToolOf(k){return k=='tree'?'hatchet':(k=='rock'||k=='crystal')?'pick':k=='mound'?'spade':'hands'}
function sk141Show(kind){if(SK141.kind===kind)return;sk141Hide();if(!kind||!pl||!pl.bones||!pl.bones.aR2)return;
  try{(pl.gearG||[]).forEach(o=>{if(o&&o.visible){o.visible=false;SK141.hid.push(o)}});if(kind=='hands'){SK141.kind=kind;return}const t=sk141Tool(kind);
    if(kind=='rod'){t.rotation.set(-1.25,0,.12);t.position.set(0,-.03,.03)}else{t.rotation.x=-1.0;t.position.set(0,-.03,.02)}
    pl.bones.aR2.add(t);SK141.tool=t;SK141.kind=kind;if(t.userData.wt){try{gripReg(pl)}catch(_){}}}catch(e){console.warn('sk141 tool',e)}}
function sk141Hide(){const t=SK141.tool;SK141.tool=null;SK141.kind=null;if(t){if(t.parent)t.parent.remove(t);t.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}});try{gripReg(pl)}catch(_){}}
  SK141.hid.forEach(o=>o.visible=true);SK141.hid=[];if(SK141.line){scene.remove(SK141.line);SK141.line.geometry.dispose();SK141.line.material.dispose();SK141.line=null}}
// ---------------- motions ----------------
const SK141E=atkEyes;
var SK141_T={
  chop:{ms:620,t:atkTrack([[0,ATK_REST],
    [.34,SK141E({sy:.7,py:.3,sx:.05,ax:-1.25,az:.75,ex:-1.35,lx:-1.1,lz:-.15,le:-1.3,rw:.35,lw:.2,lk:.25,rk:.15,lh:-.1,dy:-.05}),'out'],
    [.52,SK141E({sy:-.25,py:-.15,sx:.12,ax:-1.45,az:-.15,ex:-.35,lx:-1.35,lz:.35,le:-.45,rw:-.1,lk:.3,rk:.2,dy:-.08}),'in2'],
    [.66,SK141E({sy:-.32,py:-.18,sx:.14,ax:-1.42,az:-.2,ex:-.38,lx:-1.32,lz:.38,le:-.48,lk:.3,rk:.2,dy:-.08}),'out'],
    [1,SK141E({sy:.2,py:.1,ax:-.9,az:.3,ex:-1.1,lx:-.8,le:-1.0,dy:-.04}),'io']])},
  mine:{ms:680,t:atkTrack([[0,ATK_REST],
    [.4,SK141E({sx:-.18,hx:-.25,ax:-2.85,az:.12,ex:-1.0,lx:-2.75,lz:-.12,le:-1.05,rw:.3,lw:.3,lk:.1,rk:.1,dy:.01}),'out'],
    [.56,SK141E({sx:.5,hx:.2,ax:-1.05,az:.05,ex:-.25,lx:-1.0,lz:-.05,le:-.3,rw:-.2,lw:-.2,lk:.45,rk:.45,lh:-.3,rh:-.3,dy:-.14}),'in'],
    [.72,SK141E({sx:.52,hx:.22,ax:-1.0,ex:-.3,lx:-.95,le:-.35,lk:.45,rk:.45,lh:-.3,rh:-.3,dy:-.14}),'lin'],
    [1,SK141E({sx:.15,ax:-1.3,ex:-.8,lx:-1.2,le:-.85,lk:.2,rk:.2,dy:-.05}),'io']])},
  dig:{ms:760,t:atkTrack([[0,ATK_REST],
    [.3,SK141E({sx:.25,ax:-1.3,ex:-.6,lx:-1.55,le:-1.2,lz:.15,lk:.35,rk:.1,lh:-.35,dy:-.08}),'out'],
    [.5,SK141E({sx:.45,hx:.2,ax:-.95,ex:-.2,lx:-1.2,le:-.9,lz:.15,lk:.55,rk:.25,lh:-.45,rh:-.1,dy:-.16}),'in2'],
    [.78,SK141E({sx:.05,hx:-.05,sy:.2,ax:-1.5,az:.2,ex:-1.1,lx:-1.0,le:-.5,lk:.2,rk:.1,dy:-.05}),'out'],
    [1,SK141E({sx:.2,ax:-1.25,ex:-.7,lx:-1.4,le:-1.1,lk:.3,dy:-.08}),'io']])},
  forage:{ms:820,t:atkTrack([[0,SK141E({sx:.55,hx:.3,dy:-.3,lk:1.15,rk:1.15,lh:-.95,rh:-.95,ax:-.6,ex:-.6,lx:-.5,le:-.6})],
    [.3,SK141E({sx:.62,hx:.35,dy:-.32,lk:1.2,rk:1.15,lh:-1.0,rh:-.95,ax:-1.25,az:-.15,ex:-.2,rw:.3,lx:-.5,le:-.7}),'out'],
    [.45,SK141E({sx:.6,hx:.3,dy:-.32,lk:1.2,rk:1.15,lh:-1.0,rh:-.95,ax:-.85,az:-.1,ex:-1.4,rw:-.4,lx:-.5,le:-.7}),'in2'],
    [.72,SK141E({sx:.62,hx:.35,dy:-.32,lk:1.15,rk:1.2,lh:-.95,rh:-1.0,lx:-1.25,lz:.15,le:-.2,lw:.3,ax:-.6,ex:-.6}),'io'],
    [.88,SK141E({sx:.6,hx:.3,dy:-.32,lk:1.15,rk:1.2,lh:-.95,rh:-1.0,lx:-.85,lz:.1,le:-1.4,lw:-.4,ax:-.6,ex:-.6}),'in2'],
    [1,SK141E({sx:.55,hx:.3,dy:-.3,lk:1.15,rk:1.15,lh:-.95,rh:-.95,ax:-.6,ex:-.6,lx:-.5,le:-.6}),'io']])},
  wade:{ms:900,t:atkTrack([[0,SK141E({sx:.6,hx:.25,dy:-.18,lk:.6,rk:.6,lh:-.55,rh:-.55,ax:-.9,ex:-.4,lx:-.9,le:-.4})],
    [.4,SK141E({sx:.75,hx:.3,dy:-.22,lk:.7,rk:.7,lh:-.65,rh:-.65,ax:-1.05,az:-.25,ex:-.15,lx:-1.05,lz:.25,le:-.15,rw:.5,lw:.5}),'out'],
    [.7,SK141E({sx:.45,hx:.15,dy:-.15,lk:.55,rk:.55,lh:-.5,rh:-.5,ax:-1.35,az:-.3,ex:-1.4,lx:-1.35,lz:.3,le:-1.4,rw:-.3,lw:-.3}),'io'],
    [1,SK141E({sx:.6,hx:.25,dy:-.18,lk:.6,rk:.6,lh:-.55,rh:-.55,ax:-.9,ex:-.4,lx:-.9,le:-.4}),'io']])},
  cast:{ms:900,t:atkTrack([[0,ATK_REST],
    [.35,SK141E({sy:.35,sx:-.1,ax:-2.6,az:.25,ex:-.9,rw:.4,lx:-.6,le:-.9,lk:.15,dy:-.02}),'out'],
    [.55,SK141E({sy:-.1,sx:.15,ax:-1.2,az:.1,ex:-.25,rw:-.3,lx:-.7,le:-.8,rk:.2,lh:-.15,dy:-.04}),'in2'],
    [1,SK141E({sx:.06,ax:-.95,az:.08,ex:-.55,rw:-.1,lx:-.85,lz:.2,le:-1.15,dy:-.03}),'io']])},
  hold:{ms:1400,t:atkTrack([[0,SK141E({sx:.06,ax:-.95,az:.08,ex:-.55,rw:-.1,lx:-.85,lz:.2,le:-1.15,dy:-.03})],
    [.5,SK141E({sx:.08,ax:-.98,az:.08,ex:-.5,rw:-.12,lx:-.88,lz:.2,le:-1.1,dy:-.035}),'io'],
    [1,SK141E({sx:.06,ax:-.95,az:.08,ex:-.55,rw:-.1,lx:-.85,lz:.2,le:-1.15,dy:-.03}),'io']])},
  jerk:{ms:520,t:atkTrack([[0,SK141E({sx:.06,ax:-.95,az:.08,ex:-.55,rw:-.1,lx:-.85,lz:.2,le:-1.15,dy:-.03})],
    [.3,SK141E({sx:-.12,hx:-.15,ax:-1.75,az:.12,ex:-1.15,rw:.25,lx:-1.3,lz:.25,le:-1.5,lk:.1,rk:.25,lh:.1,dy:-.01}),'out'],
    [1,SK141E({sx:.06,ax:-.95,az:.08,ex:-.55,rw:-.1,lx:-.85,lz:.2,le:-1.15,dy:-.03}),'io']])}};
function sk141Motion(kind){return kind=='tree'?'chop':(kind=='rock'||kind=='crystal')?'mine':kind=='mound'?'dig':kind=='water'?'wade':'forage'}
// featTick calls swingAnim every 0.5 s while gathering: play the gathering motion instead, and wait for it to finish
{const f=swingAnim;swingAnim=function(st,ms,onHit){try{if(typeof gat!='undefined'&&gat&&gat.tg&&!onHit){const M=SK141_T[sk141Motion(gat.tg.kind)];
    sk141Show(sk141ToolOf(gat.tg.kind));haPlay(M.ms,M.t,2,null,.2);gat.sw=M.ms/1000*.98;return}}catch(e){console.warn('sk141',e)}return f.apply(this,arguments)}}
// the tool goes away (and the weapon comes back) as soon as gathering or fishing stops
{const f=heroTick;heroTick=function(dt,now){const r=f.apply(this,arguments);try{
  const gth=typeof gat!='undefined'&&gat&&gat.tg,fsh=typeof fishing!='undefined'&&fishing;
  if(SK141.kind&&!gth&&!fsh)sk141Hide();
  if(gth&&!SK141.kind&&sk141ToolOf(gat.tg.kind))sk141Show(sk141ToolOf(gat.tg.kind));
  if(fsh)sk141Fish(dt)}catch(e){if(!SK141.err){SK141.err=1;console.warn('sk141 tick',e)}}return r}}
// ---------------- fishing ----------------
{const f=fishStart;fishStart=function(w){const was=fishing;const r=f.apply(this,arguments);try{if(!was&&fishing){sk141Show('rod');haPlay(SK141_T.cast.ms,SK141_T.cast.t,2,null,.2);SK141.fishT=SK141_T.cast.ms/1000;SK141.ph=fishing.ph}}catch(e){console.warn('sk141 fish',e)}return r}}
function sk141Fish(dt){const F=fishing;if(!SK141.tool||SK141.kind!='rod')sk141Show('rod');
  // a strike: a sharp lift of the rod; otherwise keep holding it out
  if(F.ph!==SK141.ph){const bite=F.ph=='bite'||F.ph=='fight';SK141.ph=F.ph;if(bite){haPlay(SK141_T.jerk.ms,SK141_T.jerk.t,2,null,.12);SK141.fishT=SK141_T.jerk.ms/1000}}
  SK141.fishT-=dt;if(SK141.fishT<=0&&!HA.cur){haPlay(SK141_T.hold.ms,SK141_T.hold.t,2,null,.25);SK141.fishT=SK141_T.hold.ms/1000}
  // the line: from the rod's tip to the bobber (or straight down into the water ahead before it lands)
  try{const t=SK141.tool;t.updateWorldMatrix(true,false);const tip=new THREE.Vector3(0,t.userData.tipY||-1.4,0).applyMatrix4(t.matrixWorld);
    let end=null;const bob=F.bob&&(F.bob.position||F.bob.m&&F.bob.m.position);if(bob)end=bob.clone();
    else{const d=new THREE.Vector3(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y));end=pl.position.clone().addScaledVector(d,3);end.y=GH(end.x,end.z)+.05}
    if(!SK141.line){const g=new THREE.BufferGeometry().setFromPoints([tip,end]);SK141.line=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xe8e4d8,transparent:true,opacity:.75}));SK141.line.frustumCulled=false;scene.add(SK141.line)}
    const P=SK141.line.geometry.attributes.position;P.setXYZ(0,tip.x,tip.y,tip.z);P.setXYZ(1,end.x,end.y,end.z);P.needsUpdate=true}catch(_){}}
// spade and rod: aimed in the world after every animation layer (the hand carries them, the direction is fixed)
{const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);try{const t=SK141.tool;if(t&&(h||pl)===pl&&t.parent){const V=THREE.Vector3,Q=THREE.Quaternion;
  const fw=new V(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y));let d=null;
  if(SK141.kind=='rod')d=fw.clone().multiplyScalar(Math.cos(.5)).add(new V(0,Math.sin(.5)+(HA.cur&&HA.cur.pose===SK141_T.jerk.t?.35*Math.sin(Math.PI*Math.min(1,HA.cur.k*1.6)):0),0));
  else if(SK141.kind=='spade'){const k=HA.cur&&HA.cur.pose===SK141_T.dig.t?HA.cur.k:0,lev=k>.5?Math.sin(Math.PI*Math.min(1,(k-.5)/.5))*.55:0;d=fw.clone().multiplyScalar(.42+lev).add(new V(0,-1,0))}
  if(d){d.normalize();t.parent.updateWorldMatrix(true,false);const pq=t.parent.getWorldQuaternion(new Q()),wq=new Q().setFromUnitVectors(new V(0,-1,0),d);
    if(SK141.kind=='spade'){const tw=new Q().setFromAxisAngle(d,Math.atan2(fw.x,fw.z));wq.premultiply(tw)}
    t.quaternion.copy(pq.invert().multiply(wq));t.position.set(0,-.03,.03)}}}catch(e){if(!SK141.err2){SK141.err2=1;console.warn('sk141 aim',e)}}return r}}
