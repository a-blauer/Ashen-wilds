// ================= v146 Argus, the Hundred-Eyed — a new model, and the fight to the Vorraxis standard =================
// The owner asked for Argus' model to be redone completely (same idea: a giant bog-wolf covered in eyes). argBuild146
// replaces argBuild (1971) and builds every part anew on the same skeleton (the joint names and rest positions stay, so
// the v110/v112 poses and moves keep working).
//  * Silhouette: a hulking, hunched bog-wolf — a deep chest and shoulder hump, a gaunt waist, heavy haunches, long gaunt legs,
//    a long skull-like muzzle under a pair of branching bog-elk antlers, a bony tail.
//  * Coat: ~340 shingled fur tufts laid in rows over the body (dark on the back, mossy-grey on the flanks, pale on the belly),
//    each turned to the surface and lifted at the tip; a torn window in the hide on each flank shows the ribs, a dark
//    membrane and glowing amber veins; a shaggy mane of long tufts and bone quills; bog moss, hanging weed, glowing
//    mushrooms and roots tangled round the legs.
//  * Bone: vertebrae and spurs along the spine, exposed tendons on the forelegs, elbow and hock spurs, long black claws.
//  * The eyes: more than fifty lidded eyes with slit pupils over the flanks, neck, legs, tail and face (a cluster of six
//    along each side of the muzzle, the great brow eye in the forehead) — they blink, half-shut in Phase I, staring in II.
//  * Trophies: the riveted iron collar with its broken chain and skull, a trophy belt, three broken spears with rags.
//  * Motion: ears, jaw, tail, the mane and the hanging weed follow through on springs.
// The fight (all Phase II):
//  * Den change, "The Drowned Fog": a low bog fog fills the hollow and will-o'-wisps drift through it toward you; touching
//    one bursts it (damage, Hexed: slowed).
//  * Signature mechanic, The Hundred Eyes: Argus sinks into the fog (only his eyes show; warded) and four great Watcher Eyes
//    open on the walls of the hollow, each firing at you. Shut all four and he is dragged out of the fog, BROKEN. If any
//    still watch when the gaze completes he heals (10%) and every eye fires at once: a storm of bolts on your trail.
//  * Effects: eye bolts streak and crack the floor, the gaze beam scorches a trail, the furrow spikes burst into amber
//    shards, the pounce lands in a wall of mud and shards, every claw hit throws sparks and blood.
var ARG146={col:0xffd040,tor:[[-2.6,.28,.32,0,.32],[-2.3,.62,.66,0,.18],[-1.85,.84,.86,0,.06],[-1.3,.8,.8,0,.0],[-.7,.58,.64,0,.02],[-.15,.62,.7,0,-.06],[.4,.86,1.0,0,-.16],[.95,1.04,1.14,0,-.18],[1.45,1.08,1.14,0,-.02],[1.9,.96,1.02,0,.26],[2.25,.68,.74,0,.48],[2.5,.44,.52,0,.6]]};
function argBuild146(R,e){}
if(SVB[0]){SVB[0].build=argBuild146;
  SVB[0].spr={earL:[60,8,.6],earR:[60,8,.6],jaw:[80,10,.2],t0:[40,6,1.2],t1:[32,5,1.5],t2:[26,4,1.8],t3:[22,3.5,2],antL:[120,16,0],antR:[120,16,0]}}
// ---------------- Phase II: "The Drowned Fog" ----------------
function arg146Fog(A,e){const D=sk146Den(A);if(D.ph2)return;D.ph2=1;const y0=GH(A.cx,A.cz),fog=[];
  for(let k=0;k<30;k++){const s=kqSpr(0x8a9a7a,6+Math.random()*5);s.material=s.material.clone();s.material.blending=THREE.NormalBlending;s.material.opacity=0;const a=Math.random()*6.283,r=Math.random()*(ARENA_R-1);
    s.position.set(A.cx+Math.cos(a)*r,y0+.6+Math.random()*1.1,A.cz+Math.sin(a)*r);s.userData.a=a;s.userData.r=r;s.userData.w=(Math.random()-.5)*.08;s.renderOrder=25;sk146DenAdd(A,s);fog.push(s)}
  D.fog={fog,wisps:[],t:2,dT:0};D.spores=sk146DenAdd(A,sk146Weather(A,'spores',0xc8ff8a,240));
  try{banner('🌫 THE DROWNED FOG','Bog fog fills the hollow — will-o’-wisps drift toward you','Keep clear of the wisps')}catch(_){}svSnd('hiss',1,.4)}
function arg146Wisp(A){const D=A.s146,y0=GH(A.cx,A.cz),a=Math.random()*6.283,r=ARENA_R-1.5,o=kqSpr(0x9aff8a,1.1),c=kqSpr(0xffffff,.4);o.add(c);o.position.set(A.cx+Math.cos(a)*r,y0+1.1,A.cz+Math.sin(a)*r);sk146DenAdd(A,o);
  const w={o,t:0,life:14,ph:Math.random()*6};D.fog.wisps.push(w);return w}
function arg146FogTick(A,e,dt){const D=A.s146,F=D&&D.fog;if(!F)return;F.fog.forEach(s=>{s.userData.a+=dt*s.userData.w;s.position.x=A.cx+Math.cos(s.userData.a)*s.userData.r;s.position.z=A.cz+Math.sin(s.userData.a)*s.userData.r;s.material.opacity=Math.min(.38,s.material.opacity+dt*.12)});
  F.t-=dt;if(F.t<=0&&F.wisps.length<5&&sk146In(A)){F.t=3.5;arg146Wisp(A)}
  const P=pl.position;F.wisps.slice().forEach(w=>{w.t+=dt;const o=w.o,dx=P.x-o.position.x,dz=P.z-o.position.z,d=Math.hypot(dx,dz)||1,sp=1.1;o.position.x+=dx/d*sp*dt+Math.sin(w.t*1.7+w.ph)*dt*.8;o.position.z+=dz/d*sp*dt+Math.cos(w.t*1.3+w.ph)*dt*.8;
    o.position.y=GH(o.position.x,o.position.z)+1.0+.25*Math.sin(w.t*2.3+w.ph);o.scale.setScalar(1.1*(1+.15*Math.sin(w.t*9)));if(Math.random()<dt*6)burst(o.position.clone(),0x9aff8a,1,.2,.3,.5);
    const hit=sk146In(A)&&e&&!e.dead&&d<1.0&&!(hero.iv>0);if(hit||w.t>w.life){if(hit){hitHero(e,.35,'m');dqDebuff('Hexed','👁',{mspd:-.3},2200,'A will-o’-wisp burst on you: −30% move speed');D.deb='Hexed';burst(o.position.clone(),0x9aff8a,30,3,2,.6);sk146Flash(o.position,0x9aff8a,3,8,400);svSnd('crack',.8,1.5)}
      if(o.parent)o.parent.remove(o);F.wisps.splice(F.wisps.indexOf(w),1)}})}
{const B=SVB[0];if(B){const t0=B.denTick,c0=B.denClear;
  B.denTick=function(A,e,dt,now){try{t0&&t0.apply(this,arguments)}catch(_){}try{if(A.f&&e&&e.sv&&e.sv.ph>1&&!sk146Den(A).ph2)arg146Fog(A,e);arg146FogTick(A,e,dt)}catch(err){if(!SK146.err++)console.error('v146 fog',err)}};
  B.denClear=function(A,won){try{c0&&c0.apply(this,arguments)}catch(_){}sk146DenClear(A);const e=sk146Boss(A);if(e&&e.sv&&e.sv.gone146){e.sv.gone146=0;e.sv.ghost=0;e.m.visible=true}}}}
// ---------------- the signature: The Hundred Eyes ----------------
function arg146Watcher(){const g=new THREE.Group(),flesh=new THREE.MeshStandardMaterial({color:0x3a2a2a,roughness:.7,flatShading:true,emissive:0x0a0404}),bk=new THREE.MeshStandardMaterial({color:0x2e2418,roughness:.9,flatShading:true}),
    irm=new THREE.MeshBasicMaterial({color:0xffd040}),wh=new THREE.MeshStandardMaterial({color:0xd8ccb0,roughness:.35,emissive:0x2a2414});
  const mound=new THREE.Mesh(svG('a46wm',()=>svLump(1.2,1,.35,60)),flesh);mound.scale.set(1,1.1,.6);mound.position.y=1.8;g.add(mound);
  const ball=new THREE.Mesh(svG('a46wb',()=>new THREE.SphereGeometry(.75,14,10)),wh);ball.position.set(0,1.9,.45);g.add(ball);
  const ir=new THREE.Mesh(svG('a46wi',()=>new THREE.SphereGeometry(.42,12,8)),irm);ir.position.set(0,1.9,.85);ir.scale.set(1,1,.4);g.add(ir);
  const sl=new THREE.Mesh(svG('a46ws',()=>new THREE.BoxGeometry(.12,.6,.05)),new THREE.MeshBasicMaterial({color:0x0a0806}));sl.position.set(0,1.9,1.0);g.add(sl);
  [-1,1].forEach(s=>{const l=new THREE.Mesh(svG('a46wl',()=>svLump(.8,1,.2,61)),bk);l.scale.set(1.15,.4,.6);l.position.set(0,1.9+s*.62,.4);l.userData.s=s;g.add(l);(g.userData.lids=g.userData.lids||[]).push(l)});
  for(let k=0;k<6;k++){const a=k/6*6.283,v=new THREE.Mesh(svG('a46wv',()=>svTube([[0,0,0],[.4,.2,.1],[.9,.1,.2]],.04,4)),new THREE.MeshBasicMaterial({color:0xa06a1c}));v.position.set(0,1.9,.3);v.rotation.z=a;g.add(v)}
  const gl=kqSpr(0xffd040,1.8);gl.position.set(0,1.9,1.05);g.add(gl);return {g,ir,gl,mats:[flesh,bk,irm,wh,sl.material]}}
function arg146EyesStart(c){}
function arg146EyesCleanup(c){const S=c.S,M=c.M,e=c.e;S.dr=0;if(S.gone146){S.gone146=0;S.ghost=0;e.m.visible=true;for(let k=0;k<14;k++)burst(gY(e.m.position,1+Math.random()*2),0x8a9a7a,3,2,1.5,.8)}
  if(!M)return;if(M.an.ghost&&M.an.ghost.parent)M.an.ghost.parent.remove(M.an.ghost);(M.an.props||[]).forEach(p=>{if(!p._gone)dqPropGone(p,false)})}
function arg146EyesEnd(c,broken){const e=c.e,M=c.M;if(M.an.done2)return;M.an.done2=1;
  if(broken){arg146EyesCleanup(c);svEndMove(e,true);svCast(e,'broken');sk146Wall(e.m.position,0x8a9a7a,6,3,.6);try{banner('💔 DRAGGED FROM THE FOG','Every Watcher Eye is shut','Strike now!')}catch(_){}return}
  // the gaze completes: he heals and every eye fires at once, on your trail
  const live=sk146Alive(M.an.props);sk146Heal(e,.1,ARG.col);arg146EyesCleanup(c);svSnd('roar',1.1,.8);shake(.4);
  for(let k=0;k<12;k++)setTimeout(()=>{if(e.dead||!AF)return;const d=pl.mvd&&nowP()-pl.mvd.t<300?pl.mvd:{x:0,z:0},q=new THREE.Vector3(pl.position.x+d.x*1.6+(Math.random()-.5)*2,0,pl.position.z+d.z*1.6+(Math.random()-.5)*2),S2={k:'c',r:1.7},an={x:q.x,z:q.z,a:0};
    const from=live.length&&!live[k%live.length]._gone?gY(live[k%live.length].m.position,1.9):gY(e.m.position,3);svWarn(S2,an,.7);svShot(from,new THREE.Vector3(q.x,GH(q.x,q.z)+.3,q.z),.7,ARG.col,1.2,3,Pp=>{if(e.dead||!AF)return;burst(Pp,ARG.col,16,2.4,2,.5);sk146Crack(Pp,0xffb030,1.3,1.8);svHitNow(e,S2,an,.8,{})})},k*170)}
Object.assign(ARGP,{sink:{body:[.35,0,0,0,-1.1,0],neck:[.5,0,0],head:[.2,0,0],jaw:[.2,0,0],shL:[.5,0,.5],shR:[.5,0,-.5],elL:[-.3,0,0],elR:[-.3,0,0],hpL:[-.6,0,.3],hpR:[-.6,0,-.3],knL:[1.0,0,0],knR:[1.0,0,0],hkL:[-.5,0,0],hkR:[-.5,0,0],t0:[.6,0,0],earL:[-.8,0,0],earR:[-.8,0,0]}});
Object.assign(ARGM,{
  hundred:{wt:(e,L)=>e.sv.heN?9:30,cd:30,ph:2,r:[0,40],a:'any',armor:1,dur:11.4,inv:[0,1.0],trn:[[0,.4,2]],
    trk:[[.7,'sink','io'],[10.2,'sink','l',.01],[10.8,'howl','o'],[11.4,'cRec','io']],
    go(c){c.S.heN=(c.S.heN||0)+1;svSnd('whoosh',1,.5)},
    ev:[[.8,c=>arg146EyesStart(c)],[10.3,c=>arg146EyesEnd(c,false)]],
    tk(c,dt){const M=c.M,e=c.e;if(c.S.gone146){e.m.visible=false;if(M.an.ghost){M.an.ghost.position.copy(gY(e.m.position,2.4+.2*Math.sin(c.t*2)));M.an.ghost.scale.setScalar(2.2*(1+.1*Math.sin(c.t*6)))}}
      if(M.an.props&&c.t>1.4&&c.t<10.3&&!M.an.done2&&!sk146Alive(M.an.props).length)arg146EyesEnd(c,true)},
    end(c){arg146EyesCleanup(c)},rec:.6},
  broken:sk146Broken(SVB[0],4.6,'stag','cRec')});
// ---------------- richer effects ----------------
{const f=argEyeBolt;argEyeBolt=function(c,i){f.apply(this,arguments);try{const q=c.inA(pl.position.clone().add(new THREE.Vector3(((pl.mvd&&pl.mvd.x)||0)*.9,0,((pl.mvd&&pl.mvd.z)||0)*.9)),.8),p=new THREE.Vector3(q.x,0,q.z);
  setTimeout(()=>{if(c.e.dead||!AF)return;sk146Crack(p,0xffb030,1.3,2);sk146Flash(p,ARG.col,2,7,260)},720)}catch(_){}}}
{const f=argSpikeAt;argSpikeAt=function(c,an,k,li){const r=f.apply(this,arguments);try{if(k%2===0)sk146Debris(new THREE.Vector3(an.x,0,an.z),argSpikeMat(),3,.08,2.5,4,1)}catch(_){}return r}}
{const P=ARGM.pounce;if(P&&P.hit)P.hit.forEach(h=>{const f=h.fx;h.fx=function(c,an,hit){f&&f.apply(this,arguments);try{const p=c.m.position;sk146Wall(p,0x8a9a7a,5,2.4,.5);sk146Crack(p,0xffb030,3,2.6);sk146Debris(p,argSpikeMat(),8,.1,4,5,1.3);sk146Flash(p,ARG.col,3,10,400)}catch(_){}}})}
{const W=ARGM.whirl;if(W&&W.hit)W.hit.forEach(h=>{const f=h.fx;h.fx=function(c,an,hit){f&&f.apply(this,arguments);try{sk146Wall(c.m.position,ARG.col,5.5,2,.45)}catch(_){}}})}
sk146AutoFx(ARGM,{liq:0x6a1c24,sp:0xffd060,dust:0x5a5040});
try{svRegMoves(0)}catch(_){}
try{DSTXT[0].atk.push(['👁 The Hundred Eyes','Phase II: Argus sinks into the fog (warded; only his eyes show) and four great Watcher Eyes open on the walls, each firing at you.','Shut all four: he is dragged out of the fog BROKEN. If any still watch when the gaze completes he heals and every eye fires on your trail — keep moving.'],
  ['🌫 The Drowned Fog','Phase II: bog fog fills the hollow and will-o’-wisps drift toward you.','Keep clear of the wisps: one bursting on you slows you.'])}catch(_){}
