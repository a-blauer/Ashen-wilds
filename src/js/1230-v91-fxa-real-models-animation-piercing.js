// ================= v91 fxA: real models and animation for Piercing Arrow, Explosive Arrow, Call of the Wild, Shadow Clone =================
// How it works (read this before changing it):
// - Nothing here changes damage, ranges or hit areas: every number still comes from the old cast code.
//   The cast runs exactly as before (mana, cooldown, rank and class bonuses are computed there); this file only catches the
//   moment it would hurt something and replays it when the arrow visually gets there.
// - Piercing Arrow (k:'beam' in cast_base): during the cast, bolt() is muted and heroHit() records the hit value (a stand-in
//   target in the line gives us raw/mt/options even when nobody is in front). At the release of the bow draw a long glowing arrow
//   flies down the same 9 × 2.2 line from the hero; each enemy in that line takes the recorded hit when the arrow reaches it
//   (with a spark), so the damage is identical and lands when the arrow does.
// - Explosive Arrow (k:'shot'): launch() is recorded during the cast and called at the release (same speed, damage, life, burn),
//   so the old shot logic still decides the hit and the 2.2 splash. Its mesh is swapped for a bomb-pot arrow on a small visual
//   arc (the hit test is flat, so the arc ends on the target), with a sparking fuse and smoke; on impact: fireball, smoke,
//   debris, a scorch mark and a short light flash.
// - Both arrows play a heavy bow draw → hold → release (fxaPose, built on the v85 bowPose; release at FXA_DRAW.rel of FXA_DRAW.ms),
//   the special arrow is nocked on the string (it replaces the v85 nocked arrow while drawing) and leaves from the bow.
//   Other ranged weapons (crossbow, sling) play their normal v85 shot and the arrow leaves the hand.
// - Call of the Wild: KQH.r_wolf runs unchanged, but kqsWolf() returns the Ashwolf low-poly rig (crRig) with a ghost material
//   (fresnel rim, translucent, glowing eyes, wisps). kqsSummon still moves it and decides every bite; this file animates it with
//   the creature rig (animC → rigAnim walk/trot/gallop, and the v85 bite via lunge() timed so the jaws snap on the damage tick).
// - Shadow Clone: kqsShade() returns a copy of the hero's current model (body, gear, weapon; skinned meshes get their own skeleton
//   — fxaCloneHero, the same idea as SkeletonUtils.clone) drawn as smoky shadow with a violet rim; it walks with animHero and
//   strikes with the hero's own attack poses for the equipped weapon (ATK tracks), timed on the summon's strike.
// - Removal: the summons share geometry with the hero / creature caches, so their own end() only removes them and disposes the
//   materials and skeletons made here (never the shared geometry). Smoke, fire and debris come from one pooled group (FXA.root,
//   added once at load), so the scene's child count is the same before and after any effect.
// - Co-op: these abilities are not relayed to partners (partners only see the swing pose), so nothing to relay here.
var FXA={root:new THREE.Group(),pool:[],spool:[],live:[],MAX:240,G:null,dbg:{},on:{'Piercing Arrow':'pierce','Explosive Arrow':'explo'}};
var FXA_DRAW={ms:760,rel:.5},FXA_PSPD=46;
FXA.root.name='fxA';scene.add(FXA.root);
function fxaG(){if(FXA.G)return FXA.G;const st=new THREE.ConeGeometry(1,1,7,1,true);st.rotateX(-Math.PI/2);st.translate(0,0,-.5);   // streak: wide end at 0, tip at -1 (behind)
  FXA.G={ico:new THREE.IcosahedronGeometry(1,0),dod:new THREE.DodecahedronGeometry(1,0),box:new THREE.BoxGeometry(1,1,1),tet:new THREE.TetrahedronGeometry(1,0),streak:st,sph:new THREE.SphereGeometry(1,8,6)};
  Object.values(FXA.G).forEach(g=>g.userData.lps=1);return FXA.G}
// a material owned by an effect (disposed with it)
function fxaOwn(m){m.userData.fxaOwn=1;return m}
function fxaAdd(col,op){return fxaOwn(new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op==null?.9:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}))}
// remove o and dispose only what this file made (own materials, own geometry, own skeletons)
function fxaRm(o){if(!o)return;if(o.parent)o.parent.remove(o);o.traverse(q=>{if(q.material)(Array.isArray(q.material)?q.material:[q.material]).forEach(m=>{if(m.userData.fxaOwn)m.dispose()});
  if(q.geometry&&q.geometry.userData.fxaOwn)q.geometry.dispose();if(q.isSkinnedMesh&&q.userData.fxaSkel&&q.skeleton)q.skeleton.dispose()})}
function fxaMats(o){const L=[];o.traverse(q=>{if(q.material)(Array.isArray(q.material)?q.material:[q.material]).forEach(m=>{if(m.userData.fxaOwn&&!L.includes(m)){L.push(m);if(m.userData.op0==null)m.userData.op0=m.opacity}})});return L}
function fxaOp(L,k){L.forEach(m=>{m.opacity=m.userData.op0*k;if(m.userData.u)m.userData.u.fxK.value=m.userData.k0*k})}
// ---------------- pooled puffs: smoke, fire, motes, debris (one persistent group) ----------------
// o: col, r0, r1 (start/end size), life, v [x,y,z], g gravity, drag, op, add (additive), geo ('ico'|'dod'|'box'|'tet'), spin, fin (fade-in share), bounce
function fxaPuff(p,o){const G=fxaG(),sp=!!o.spr,pool=sp?FXA.spool:FXA.pool;let m=pool.pop();
  if(!m){const L=FXA.live.filter(q=>!!q.isSprite==sp);if(FXA.live.length>=FXA.MAX&&L.length){m=L[0];FXA.live.splice(FXA.live.indexOf(m),1)}
    else{m=sp?new THREE.Sprite(new THREE.SpriteMaterial({map:SPR,transparent:true,depthWrite:false})):new THREE.Mesh(G.ico,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false}));m.userData.lpsSkip=1;m.frustumCulled=false;FXA.root.add(m)}}
  const M=m.material;M.color.setHex(o.col==null?0x808080:o.col);M.blending=o.add||sp?THREE.AdditiveBlending:THREE.NormalBlending;M.opacity=0;if(!sp)m.geometry=G[o.geo||'ico'];
  m.position.copy(p);if(!sp)m.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);const r0=o.r0==null?.3:o.r0;m.scale.setScalar(r0);m.visible=true;m.renderOrder=o.add||sp?32:31;
  m.userData.f={age:0,life:o.life||1,r0,r1:o.r1==null?r0:o.r1,v:new THREE.Vector3(...(o.v||[0,0,0])),g:o.g||0,drag:o.drag||0,op:o.op==null?.8:o.op,spin:o.spin||0,fin:o.fin==null?.15:o.fin,bounce:o.bounce,sx:o.sx||1};
  FXA.live.push(m);return m}
function fxaTick(dt){if(!(dt>0))return;
  for(let i=FXA.live.length-1;i>=0;i--){const m=FXA.live[i],f=m.userData.f;f.age+=dt;const k=f.age/f.life;
    if(k>=1){m.visible=false;FXA.live.splice(i,1);(m.isSprite?FXA.spool:FXA.pool).push(m);continue}
    f.v.y-=f.g*dt;if(f.drag)f.v.multiplyScalar(Math.max(0,1-f.drag*dt));m.position.addScaledVector(f.v,dt);
    if(f.bounce){const gy=GH(m.position.x,m.position.z);if(m.position.y<gy+.04){m.position.y=gy+.04;if(f.v.y<0)f.v.y*=-f.bounce;f.v.x*=.6;f.v.z*=.6;f.spin*=.6}}
    if(f.spin&&!m.isSprite){m.rotation.x+=f.spin*dt;m.rotation.z+=f.spin*.7*dt}
    const s=f.r0+(f.r1-f.r0)*(1-Math.pow(1-k,2.2));m.scale.set(s*f.sx,s,s);
    m.material.opacity=f.op*(k<f.fin?k/f.fin:1)*(f.bounce?(k>.8?(1-k)/.2:1):Math.pow(1-k,1.3))}}
{const f=heroTick;heroTick=function(dt,now){const r=f.apply(this,arguments);try{fxaTick(dt)}catch(err){console.error('fxA',err)}return r}}
// a short light flash, borrowed from the dungeon torch lights (they are dark outside dungeons, so no new light is added)
function fxaFlash(p,col,I,ms){try{if(typeof DLT=='undefined')return;const l=DLT.find(q=>q.intensity==0&&!q.userData.fxa)||DLT[DLT.length-1];l.userData.fxa=1;l.color.setHex(col);l.distance=10;l.position.set(p.x,p.y+.8,p.z);
  tw(ms||380,k=>{l.intensity=I*Math.pow(1-k,1.6)},()=>{l.intensity=0;l.userData.fxa=0})}catch(_){}}
// fresnel shader on a standard material: rim glow (u.fxRim × fxK), alpha rising toward the rim (fxA0 in the middle), colours pulled toward fxBase
function fxaFres(o){const u={fxRim:{value:new THREE.Color(o.rim)},fxK:{value:o.k},fxP:{value:o.p||2.2},fxA0:{value:o.a0==null?.35:o.a0},fxBase:{value:new THREE.Color(o.base)},fxMix:{value:o.mix==null?.3:o.mix}};
  const m=fxaOwn(new THREE.MeshStandardMaterial({color:o.col||0xffffff,emissive:o.em||0,vertexColors:!!o.vc,skinning:!!o.skin,flatShading:true,roughness:.8,metalness:0,transparent:true,opacity:o.op,depthWrite:o.dw!==false,blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending,side:THREE.FrontSide}));
  m.userData.u=u;m.userData.k0=o.k;m.userData.lps=1;
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,u);
    sh.fragmentShader='uniform vec3 fxRim;uniform float fxK;uniform float fxP;uniform float fxA0;uniform vec3 fxBase;uniform float fxMix;\n'+sh.fragmentShader
      .replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb=mix(fxBase,diffuseColor.rgb,fxMix);')
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n float fxR=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),fxP);totalEmissiveRadiance+=fxRim*fxR*fxK;diffuseColor.a*=mix(fxA0,1.0,fxR);')};
  m.customProgramCacheKey=()=>'fxaFres';return m}

// ---------------- arrow models (origin at the nock, flying along +z) ----------------
// Piercing Arrow: long pale-ash shaft with silver bands, swept glowing fletching, a barbed spectral head; glow shell + light streak
function fxaPierceModel(){const g=new THREE.Group(),col=0xfff0c0;
  g.add(lgGroup('FXA_PA',k=>{k.L('','c',0xcdbb94,[0,0,0],[0,0,1.18],.019,.016,5);                                 // shaft
    [.18,.95].forEach(z=>k.p('','cyl','m',0xb8bcc4,0,0,z,.026,.03,.026,Math.PI/2,0,0));                              // silver bands
    k.p('','cyl','c',0x5a3a26,0,0,.08,.024,.05,.024,Math.PI/2,0,0);                                                     // nock
    k.p('','cone4','g',0xfff6dc,0,0,1.33,.05,.3,.02,Math.PI/2,0,0);                                                     // spectral blade
    k.p('','cone4','g',0xffe7a0,0,0,1.24,.075,.08,.018,Math.PI/2,0,Math.PI/2);                                          // flared shoulder
    [-1,1].forEach(s=>k.p('','cone4','g',0xffe7a0,s*.06,0,1.17,.02,.13,.01,-Math.PI/2+s*.5,0,0).p('','cone4','g',0xffe7a0,s*.07,0,1.17,.016,.12,.01,-Math.PI/2,s*.55,0)); // barbs
    [0,1,2].forEach(i=>{const a=i/3*Math.PI*2+Math.PI/2;k.p('',lgSlab('fxapf',[[0,0],[.075,.05],[.07,.26],[0,.3]],.002),'g',i?0xfff2c8:0xffc860,Math.cos(a)*.016,Math.sin(a)*.016,.06,1,1,1,Math.PI/2,0,a-Math.PI/2)})},.12));
  const G=fxaG(),glow=new THREE.Mesh(G.sph,fxaAdd(col,.55));glow.scale.set(.09,.09,.26);glow.position.z=1.3;g.add(glow);
  const sh=new THREE.Mesh(G.sph,fxaAdd(col,.16));sh.scale.set(.07,.07,.75);sh.position.z=.7;g.add(sh);
  g.userData.glow=glow;g.traverse(o=>o.userData.lpsSkip=1);return g}
// Explosive Arrow: dark shaft, red fletching, a clay fire-pot lashed on behind an iron tip, tarred rope bands, a fuse with a spark
function fxaBombModel(){const g=new THREE.Group();
  g.add(lgGroup('FXA_EA',k=>{k.L('','c',0x6a4e34,[0,0,0],[0,0,.86],.018,.018,5);
    k.p('','cyl','c',0x3a2a1a,0,0,.08,.023,.05,.023,Math.PI/2,0,0);
    [0,1,2].forEach(i=>{const a=i/3*Math.PI*2+Math.PI/2;k.p('',lgSlab('fxaef',[[0,0],[.06,.04],[.06,.2],[0,.23]],.002),'c',i?0x9a2a1a:0x2a2a2a,Math.cos(a)*.016,Math.sin(a)*.016,.05,1,1,1,Math.PI/2,0,a-Math.PI/2)});
    k.p('','sph','c',0x8a4a2a,0,0,.86,.11,.105,.135);                                       // clay pot
    k.p('','cyl','c',0x6a3a20,0,0,.99,.045,.05,.045,Math.PI/2,0,0);                         // neck
    [.8,.92].forEach(z=>k.p('','ring','c',0x2a2016,0,0,z,.105,.5,.105,Math.PI/2,0,0));     // tarred rope bands
    k.p('','ring','c',0x2a2016,0,0,.86,.115,.6,.115,0,0,0);
    k.p('','cone4','m',0x55585e,0,0,1.07,.04,.1,.04,Math.PI/2,0,0);                        // iron tip
    k.L('','c',0x1a1410,[.0,.09,.9],[.0,.17,.82],.008,.006,4);                              // fuse
    k.p('','box','c',0x4a3a26,0,0,.62,.026,.026,.14)},.18));                                 // binding wrap
  const sp=new THREE.Sprite(fxaOwn(new THREE.SpriteMaterial({map:SPR,color:0xffc060,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})));sp.position.set(0,.18,.81);sp.scale.setScalar(.22);g.add(sp);
  g.userData.spark=sp;g.traverse(o=>o.userData.lpsSkip=1);return g}

// ---------------- heavy bow draw → hold → release ----------------
function fxaPose(k){
  const N={lx:-1.45,lz:-.3,lw:1.45,le:-.05,ax:0,az:1.4,ay:-1.15,ex:-.6,sy:.4,py:.1,sx:.02,hx:-.02,hy:-.45,dy:0,rk:0,lk:0};
  const D={lx:-1.52,lz:-.44,lw:1.52,le:0,ax:.04,az:1.42,ay:-.45,ex:-2.85,sy:.86,py:.24,sx:-.1,hx:-.08,hy:-.9,dy:-.04,rk:.22,lk:.12};
  const X={lx:-1.44,lz:-.38,lw:1.44,le:-.08,ax:-.08,az:1.55,ay:.05,ex:-1.15,sy:.82,py:.22,sx:-.05,hx:-.1,hy:-.9,dy:-.03,rk:.18,lk:.1};
  const R={lx:-.3,lz:0,lw:0,le:-.25,ax:-.2,az:0,ay:0,ex:-.3,sy:0,py:0,sx:.03,hx:0,hy:0,dy:0,rk:0,lk:0},rel=FXA_DRAW.rel;
  if(k<.12)return haMix(N,N,0);
  if(k<.42)return haMix(N,D,haIO((k-.12)/.3));                                         // slow heavy draw
  if(k<rel){const P=haMix(D,D,0),t=(k-.42)/(rel-.42);P.ex+=.035*Math.sin(t*Math.PI*5)*t;P.ax+=.02*Math.sin(t*Math.PI*7)*t;return P} // hold at anchor, straining
  if(k<rel+.05){const P=haMix(D,X,haOut((k-rel)/.05));P.sx-=.06*Math.sin((k-rel)/.05*Math.PI);return P}   // release snap + recoil
  if(k<.74)return X;
  return haMix(X,R,haIO((k-.74)/.26))}
function fxaIsBow(){let wt=null;try{wt=typeof atkWT=='function'?atkWT():null}catch(_){}return !wt||wt=='bow'}
// draw, then fire(origin,dir) at the release; kind picks the nocked model
function fxaDraw(kind,fire){
  const bow=fxaIsBow(),ms=FXA_DRAW.ms,rel=FXA_DRAW.rel,nk=kind=='explo'?fxaBombModel():fxaPierceModel();nk.visible=false;nk.scale.setScalar(.82);scene.add(nk);
  const sync=show=>{const F=typeof BOW_FX!='undefined'?BOW_FX:null;if(!show||!F||!F.g.visible||!F.arrow.visible){nk.visible=false;return}
    F.arrow.updateMatrixWorld(true);const q=new THREE.Quaternion(),d=new THREE.Vector3(0,0,1);F.arrow.getWorldQuaternion(q);d.applyQuaternion(q);
    F.arrow.getWorldPosition(nk.position);nk.position.addScaledVector(d,-.42*.82);nk.quaternion.copy(q);F.arrow.visible=false;nk.visible=true};
  try{if(bow){haPlay(ms,fxaPose,2,null,.16);const A=HA.cur;
      if(A){A.tick=k=>{bowFxSet(k<.12||k>=rel?0:k<.42?gaSS(.12,.42,k)*.97+.03:1,k<.12?haOut(k/.12):k<.78?1:1-haIO(Math.min(1,(k-.78)/.2)));sync(k<rel)};A.end=()=>{bowFxSet(0,0);nk.visible=false}}}
    else bowAnim(ms*.8)}catch(err){console.error('fxA draw',err)}
  kqsSnd('draw');
  return FXA.pend=kqsObj({after:[],life:ms*rel/1000,tick:()=>{if(party.length&&!hero.dash)face(aimDir())},end:o=>{
    const d=aimDir(),P=pl.position;let org;
    if(nk.visible){org=nk.position.clone()}else{org=gY(P,1.3).addScaledVector(d,.55);try{if(!bow&&pl.bones&&pl.bones.aR2){pl.updateMatrixWorld(true);pl.bones.aR2.getWorldPosition(org)}}catch(_){}}
    fxaRm(nk);if(FXA.pend===o)FXA.pend=null;if(o.abort||!party.length)return;face(d);try{fire(org,d)}catch(err){console.error('fxA fire',err)}
    o.after.forEach(fn=>{try{fn()}catch(err){console.error(err)}})}})}
// talent extras that ride on the cast (Splinter Shot's side arrows) leave with the arrow, not before the draw
{const f=typeof lpCast=='function'?lpCast:null;if(f)lpCast=function(sk){if(sk&&FXA.on[sk.n]&&FXA.pend&&FXA.pend.age<.01){const a=arguments,t=this;FXA.pend.after.push(()=>f.apply(t,a));return}return f.apply(this,arguments)}}

// ---------------- Piercing Arrow ----------------
function fxaPierceFire(cap,org,d){
  const P=pl.position.clone(),A=fxaPierceModel(),G=fxaG(),col=0xfff0c0;A.position.copy(org);A.lookAt(org.clone().add(d));scene.add(A);
  const st=new THREE.Mesh(G.streak,fxaAdd(col,.5)),st2=new THREE.Mesh(G.streak,fxaAdd(0xffd890,.18));st.scale.set(.05,.05,.01);st2.scale.set(.16,.16,.01);[st,st2].forEach(m=>{m.userData.lpsSkip=1;m.renderOrder=33;m.position.z=.9;A.add(m)});
  const hit=new Set(),s0=(org.x-P.x)*d.x+(org.z-P.z)*d.z,y1=GH(P.x,P.z)+1.05,dbg=FXA.dbg.pierce={hits:[],s:0};let s=s0,fade=0,pt=0;
  fxaPuff(org.clone(),{spr:1,col:0xfff0c0,r0:.4,r1:1.4,life:.22,op:.9,fin:.01});burst(org,col,12,1.4,.6,.35);kqsSnd('snipe');sfx('arrow');
  kqsObj({life:1.2,tick:(dt,now,o)=>{if(!(dt>0))return;
    if(fade){fade+=dt;const k=Math.min(1,fade/.14);A.scale.setScalar(1-k*.6);fxaOp(fxaMats(A),1-k);return k<1}
    const sp=s;s+=FXA_PSPD*dt;dbg.s=+(s).toFixed(2);
    const x=P.x+d.x*s,z=P.z+d.z*s,u=Math.min(1,(s-s0)/3);A.position.set(x,org.y+(y1-org.y)*u,z);
    const L=Math.min(2.8,(s-s0)*.9);st.scale.z=L;st2.scale.z=L*.7;A.userData.glow.scale.setScalar(.09+.02*Math.sin(now/30));A.userData.glow.scale.z=.26;
    pt-=dt;if(pt<=0){pt=.018;fxaPuff(A.position.clone().addScaledVector(d,.2),{col:0xffeab0,r0:.06,r1:.01,life:.32,op:.6,add:1,v:[(Math.random()-.5)*.6,(Math.random()-.2)*.5,(Math.random()-.5)*.6],fin:.01})}
    // the same line the old beam used, hit as the arrow passes
    enemies.forEach(e=>{if(e.dead||hit.has(e))return;const vx=e.m.position.x-P.x,vz=e.m.position.z-P.z,a=vx*d.x+vz*d.z,w=Math.abs(vx*d.z-vz*d.x);
      if(a>0&&a<9&&w<1.1&&a<=s&&a>sp-1.5){hit.add(e);heroHit(e,cap[0],cap[1],Object.assign({},cap[2]));dbg.hits.push([+a.toFixed(2),+s.toFixed(2)]);
        const q=gY(e.m.position,1);fxaPuff(q,{spr:1,col:0xffffff,r0:.5,r1:1.6,life:.18,op:1,fin:.01});fxaPuff(q,{spr:1,col:0xffc860,r0:1.2,r1:2.6,life:.3,op:.6,fin:.01});
        burst(q,col,16,2.2,1.4,.4);burst(q,0xffffff,6,1,1,.25)}});
    if(s>=10.2){fade=.0001}}}).fxaA=A;
  const o=KQS.objs[KQS.objs.length-1];const e0=o.end;o.end=x=>{fxaRm(A);e0&&e0(x)}}

// ---------------- Explosive Arrow ----------------
function fxaExploFire(cap,org,d){
  const n0=shots.length,P=pl.position;launch(P,d,cap[0],cap[1],cap[2],cap[3]);if(shots.length<=n0)return;
  const sh=shots[shots.length-1],old=sh.m,G=new THREE.Group(),vis=fxaBombModel(),life=cap[3]||1.1;
  G.position.copy(old.position);G.quaternion.copy(old.quaternion);G.add(vis);vis.position.z=-.55;scene.remove(old);if(old.material)old.material.dispose();sh.m=G;scene.add(G);sh.fxa=1;
  // where the flat hit test will most likely meet something: the first enemy on the line, else the end of the flight
  let D=cap[0]*life;enemies.forEach(e=>{if(e.dead)return;const vx=e.m.position.x-G.position.x,vz=e.m.position.z-G.position.z,a=vx*d.x+vz*d.z,w=Math.abs(vx*d.z-vz*d.x);if(a>0&&w<.8+(e.boss?1.2:0)&&a<D)D=Math.max(.8,a-.5)});
  const p0=G.position.clone(),h0=Math.max(-.25,Math.min(.45,org.y-p0.y)),H=Math.min(1.1,.11*D);let pt=0,last=G.position.clone();
  sfx('arrow');
  kqsObj({life:life+.6,tick:(dt,now)=>{
    if(!shots.includes(sh)){const hitIt=sh.hit&&sh.hit.size>0||sh.d01;const p=last.clone();if(hitIt)fxaBoom(p,cap[1]);else fxaFizz(p);fxaRm(G);return false}
    last.copy(G.position);if(!(dt>0))return;
    const t=(G.position.x-p0.x)*d.x+(G.position.z-p0.z)*d.z,u=Math.min(1,t/D),y=h0*(1-u)+H*4*u*(1-u),dy=(-h0+H*4*(1-2*u))/D;
    vis.position.y=u<1?y:0;vis.rotation.x=u<1?-Math.atan(dy):0;
    const sp=vis.userData.spark;sp.scale.setScalar(.16+Math.random()*.14);
    pt-=dt;if(pt<=0){pt=.028;const f=new THREE.Vector3(0,.18,.26).applyMatrix4(vis.matrixWorld.copy(G.matrixWorld).multiply(vis.matrix));
      fxaPuff(f,{col:0x5a5450,r0:.07,r1:.45,life:1.0,op:.42,v:[(Math.random()-.5)*.3,.5+Math.random()*.3,(Math.random()-.5)*.3],drag:1.5,fin:.08,geo:'dod'});
      if(Math.random()<.6)fxaPuff(f,{col:0xffa040,r0:.03,r1:.0,life:.3,op:.9,add:1,v:[(Math.random()-.5)*1.5,Math.random()*1.2,(Math.random()-.5)*1.5],g:3,fin:.01})}},
   end:o=>{if(G.parent){fxaRm(G)}}})}
function fxaFizz(p){for(let i=0;i<4;i++)fxaPuff(p.clone(),{col:0x6a6460,r0:.15,r1:.6,life:.9,op:.4,v:[(Math.random()-.5),.6,(Math.random()-.5)],drag:1,geo:'dod'})}
function fxaBoom(p,s){
  const g=gY(p,0),c=g.clone();c.y=Math.max(p.y-.4,g.y+.35);const R=2.2;
  fxaFlash(c,0xff9040,7,420);shake(.22);kqsSnd('boom');
  fxaPuff(c.clone(),{spr:1,col:0xffc070,r0:1,r1:2.8,life:.2,op:.8,fin:.01});fxaPuff(c.clone(),{col:0xffe8a0,r0:.3,r1:1.4,life:.14,op:1,add:1,fin:.01});
  for(let i=0;i<11;i++){const a=Math.random()*6.28,r=Math.random()*.9,y=Math.random()*.9;fxaPuff(new THREE.Vector3(c.x+Math.cos(a)*r,c.y+y-.2,c.z+Math.sin(a)*r),{col:[0xffe070,0xff9a2a,0xff6a10,0xd03a10][i%4],r0:.25,r1:.8+Math.random()*.6,life:.3+Math.random()*.3,op:.9,add:1,v:[Math.cos(a)*2.2*r,1+y*2,Math.sin(a)*2.2*r],drag:3,fin:.05,geo:'dod'})}
  for(let i=0;i<9;i++){const a=i/9*6.28+Math.random()*.5,r=.3+Math.random()*.7;fxaPuff(new THREE.Vector3(c.x+Math.cos(a)*r,c.y+.2,c.z+Math.sin(a)*r),{col:i%3?0x221e1a:0x3a322c,r0:.4,r1:1.4+Math.random()*.7,life:1.6+Math.random()*.8,op:.72,v:[Math.cos(a)*1.6,1.1+Math.random()*.8,Math.sin(a)*1.6],drag:1.4,fin:.14,geo:'dod'})}
  for(let i=0;i<12;i++){const a=Math.random()*6.28,v=3+Math.random()*4;fxaPuff(c.clone(),{col:[0x3a2a1e,0x8a4a2a,0x5a4a3a][i%3],r0:.05+Math.random()*.07,life:1.1+Math.random()*.5,op:1,v:[Math.cos(a)*v,3.5+Math.random()*5,Math.sin(a)*v],g:16,spin:12,bounce:.35,geo:i%2?'box':'tet',fin:.01})}
  for(let i=0;i<10;i++){const a=i/10*6.28;fxaPuff(new THREE.Vector3(g.x+Math.cos(a)*.6,g.y+.15,g.z+Math.sin(a)*.6),{col:0x7a6a50,r0:.25,r1:.8,life:.9,op:.45,v:[Math.cos(a)*4.5,.3,Math.sin(a)*4.5],drag:3.5,fin:.05,geo:'dod'})}
  burst(c,0xffa040,50,4.5,4,.7);burst(c,0xffe080,20,2,3,.4);
  fxaScorch(g,R*.85)}
// burnt ground: an uneven dark blotch with glowing embers that cool, draped on the terrain, fades in 6 s
function fxaScorch(p,R){
  const geo=new THREE.CircleGeometry(1,18,Math.random()*6);geo.userData.fxaOwn=1;const pa=geo.attributes.position;
  for(let i=1;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),a=Math.atan2(y,x),k=.75+.25*Math.sin(a*3+p.x)*Math.sin(a*5+p.z)+Math.random()*.12;pa.setXY(i,x*k,y*k)}
  const m=kqsDrapeM(geo,fxaOwn(new THREE.MeshBasicMaterial({color:0x0c0806,transparent:true,opacity:.72,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})),27);
  const g2=new THREE.RingGeometry(.35,.95,18,1);g2.userData.fxaOwn=1;const e=kqsDrapeM(g2,fxaAdd(0xff5a10,.55),28);
  const fn=(u,v)=>[p.x+u*R,p.z-v*R];kqsDrape(m,fn,.06);kqsDrape(e,fn,.08);
  kqsObj({life:6,tick:(dt,now,o)=>{const k=o.age/6;m.material.opacity=.72*(k<.7?1:1-(k-.7)/.3);e.material.opacity=.55*Math.max(0,1-o.age/1.4)*(.75+.25*Math.sin(now/60))},end:()=>{fxaRm(m);fxaRm(e)}})}

// ---------------- the cast hook: record, draw, release ----------------
{const f=cast_base;cast_base=function(i){let sk=null;try{sk=heroSkills()[i]}catch(_){}const kind=sk&&FXA.on[sk.n];
  if(!kind||(kind=='pierce'&&sk.k!='beam')||(kind=='explo'&&sk.k!='shot'))return f.apply(this,arguments);
  const cd0=hero.cd['s'+i]||0,cap=[];let r;
  if(kind=='pierce'){const hh=heroHit,bb=bolt,d=aimDir(),stand={dead:false,m:{position:pl.position.clone().addScaledVector(d,3)},c:{},boss:0};
    heroHit=function(e,raw,mt,o){if(e===stand){if(!cap.length)cap.push(raw,mt,o||{});return 0}return hh.apply(this,arguments)};bolt=function(){};
    enemies.forEach=function(cb,t){return Array.prototype.forEach.call([stand],cb,t)};
    try{r=f.apply(this,arguments)}finally{delete enemies.forEach;heroHit=hh;bolt=bb}}
  else{const ll=launch;launch=function(pos,dd,spd,s,dm,life){cap.push(spd,s,dm,life)};try{r=f.apply(this,arguments)}finally{launch=ll}}
  if((hero.cd['s'+i]||0)<=cd0||!cap.length)return r;  // the cast did not go off
  fxaDraw(kind,(org,d)=>kind=='pierce'?fxaPierceFire(cap,org,d):fxaExploFire(cap,org,d));return r}}

// ---------------- Call of the Wild: the ghost wolf ----------------
function fxaGhostWolf(){
  const c={g:['Ashwolf'],cl:[0x9ad0ff],v:'',tr:'',f:0,z:1.22,evo:0,mods:[]};let g;
  try{g=crRig(c,'Ashwolf')}catch(err){console.error('fxA wolf',err);return null}
  const body=fxaFres({col:0x8ae8f0,vc:1,skin:1,em:0x06323c,rim:0x6ffff0,k:2.2,p:1.8,a0:.3,base:0x2a98b0,mix:.45,op:.72,dw:true});
  const eyes=fxaOwn(new THREE.MeshBasicMaterial({color:0xe8fffa,skinning:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  g.traverse(o=>{if(!o.isMesh)return;o.castShadow=false;o.material=o.material&&o.material.isMeshBasicMaterial?eyes:body;o.renderOrder=30;o.userData.lpsSkip=1});
  // eye glow sprites on the head bone
  let head=null;g.traverse(o=>{if(o.isBone&&o.name=='head')head=o});
  if(head){const S=SPEC.Ashwolf,r=S.bones.head;[-1,1].forEach(s=>{const q=lpT('Ashwolf',[s*.083,.634,.58]),sp=new THREE.Sprite(fxaOwn(new THREE.SpriteMaterial({map:SPR,color:0x9ffff0,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})));
    sp.position.set(q[0]-r[1],q[1]-r[2],q[2]-r[3]);sp.scale.setScalar(.12);head.add(sp)})}
  g.userData.fxaKind='wolf';g.userData.sc0=g.scale.x;return g}
// ---------------- Shadow Clone: a copy of the hero ----------------
// clone the hero's hierarchy (bones, skinned body, gear, weapon) without lights/sprites/hidden parts; every skinned mesh gets a
// skeleton made of the cloned bones (what SkeletonUtils.clone does), geometry is shared with the hero
function fxaCloneHero(src){
  const map=new Map(),skin=[];
  const keep=o=>!(o.isLight||o.isSprite||o.isPoints||o.isLine||o.userData.fxaNo)&&(o.visible||o.isBone||fxaHasBone(o));
  const rec=o=>{let n;if(o.isBone)n=new THREE.Bone();else if(o.isSkinnedMesh){n=new THREE.SkinnedMesh(o.geometry,o.material);skin.push([o,n])}else if(o.isMesh)n=new THREE.Mesh(o.geometry,o.material);else n=new THREE.Group();
    n.name=o.name;n.position.copy(o.position);n.quaternion.copy(o.quaternion);n.scale.copy(o.scale);n.visible=o.visible;n.frustumCulled=false;n.renderOrder=o.renderOrder;n.matrixAutoUpdate=o.matrixAutoUpdate;if(!n.matrixAutoUpdate)n.matrix.copy(o.matrix);
    if(o.isBone&&o.userData.y0!=null)n.userData.y0=o.userData.y0;map.set(o,n);o.children.forEach(ch=>{if(keep(ch))n.add(rec(ch))});return n};
  const root=rec(src);root.position.set(0,0,0);root.rotation.set(0,0,0);
  skin.forEach(([o,n])=>{const sk=o.skeleton;if(!sk){return}const B=sk.bones.map(b=>map.get(b)||null);if(B.some(b=>!b)){n.visible=false;return}
    n.bindMode=o.bindMode;n.bind(new THREE.Skeleton(B,sk.boneInverses.map(m=>m.clone())),o.bindMatrix.clone());n.userData.fxaSkel=1});
  const bones={};for(const k in (src.bones||{})){const b=map.get(src.bones[k]);if(b)bones[k]=b}root.bones=bones;return root}
function fxaHasBone(o){let b=false;o.traverse(q=>{if(q.isBone)b=true});return b}
function fxaShadowClone(){
  let h;try{pl.updateMatrixWorld(true);h=fxaCloneHero(pl)}catch(err){console.error('fxA clone',err);return null}
  const M={},mat=(skin,vc)=>M[skin+'|'+vc]||(M[skin+'|'+vc]=fxaFres({col:0x1c1626,vc,skin,em:0x050209,rim:0x9a62ff,k:.95,p:3.2,a0:.86,base:0x08050d,mix:vc?.12:0,op:.9,dw:true}));
  h.traverse(o=>{if(!o.isMesh)return;const vc=!!(o.geometry&&o.geometry.attributes.color);o.material=mat(!!o.isSkinnedMesh,vc);o.castShadow=false;o.userData.lpsSkip=1});
  const g=new THREE.Group();g.add(h);g.userData.h=h;g.userData.fxaKind='clone';return g}

// ---------------- summon look & animation (wraps kqsSummon's tick and end) ----------------
function fxaSumHook(o,S,kind){
  const m=S.mesh,mats=fxaMats(m),T={t:0,atk:null,n:0,wp:0};let mv0=null;
  fxaOp(mats,0);
  const t0=o.tick;o.tick=function(dt,now,ob){const p=m.position.clone(),ti=S.ti;const keep=t0.apply(this,arguments);
    const mv=dt>0&&Math.hypot(m.position.x-p.x,m.position.z-p.z)>.002*Math.max(1,dt*60);T.t+=dt>0?dt:0;
    // fade in over .45 s
    const fin=Math.min(1,T.t/.45);fxaOp(mats,fin);
    const tg=S.tgt,reach=tg?S.reach+(tg.boss?1.2:0):0,L=tg?d2(tg.m.position,m.position):99,nearT=tg&&L<=reach+.15;
    if(kind=='wolf'){
      // bite: the v85 creature bite (anticipation → snap at 55% of 380 ms) started so the snap lands on the damage tick
      if(nearT&&!m.atk&&S.ti>0&&S.ti<=.22&&typeof lunge=='function'){m.lk=1;lunge(m,tg.m.position,()=>{m.lk=0})}
      try{animC(m,now,mv,S.spd)}catch(_){}
      T.wp-=dt;if(T.wp<=0&&dt>0){T.wp=mv?.05:.12;const q=m.position.clone();q.y+=.5+Math.random()*.4;q.x+=(Math.random()-.5)*.5;q.z+=(Math.random()-.5)*.5;
        fxaPuff(q,{col:Math.random()<.5?0x7ff0e0:0x9ad0ff,r0:.12,r1:.42,life:.9,op:.22*fin,add:1,v:[(Math.random()-.5)*.3,.35,(Math.random()-.5)*.3],drag:1,fin:.2,geo:'dod'})}}
    else{
      const h=m.userData.h;
      // strike: the hero's own attack pose for the equipped weapon, hit frame (42%) on the damage tick
      if(nearT&&!T.atk&&S.ti>0&&S.ti<=.17){let set=null;try{const wt=atkWT();set=wt=='claws'?ATK.claws:wt=='axes'?ATK.axes:wt=='knives'?ATK.knives:ATK.dagger}catch(_){}
        if(set){const L2=Array.isArray(set)?set:[set];T.atk={k:0,ms:.4,pose:L2[T.n++%L2.length]}}}
      h.sw=!!T.atk;try{animHero(now,mv,h)}catch(_){}
      if(T.atk&&dt>0){const A=T.atk;A.k=Math.min(1,A.k+dt/A.ms);const P=A.pose(A.k),b=h.bones,Lw=h._L||{},mw=h._ga?h._ga.w:0;
        for(const c in ATK_REST){if(c=='dy')continue;const ch=HACH[c];if(!ch||!b[ch[0]])continue;let dd=(P[c]!=null?P[c]:ATK_REST[c])-ATK_REST[c];if(HA_LEGS[c])dd*=1-.85*mw;b[ch[0]].rotation[ch[1]]=(Lw[c]!=null?Lw[c]:0)+dd}
        if(A.k>=1)T.atk=null}
      T.wp-=dt;if(T.wp<=0&&dt>0){T.wp=mv?.04:.09;const q=m.position.clone();q.y+=.3+Math.random()*1.3;q.x+=(Math.random()-.5)*.6;q.z+=(Math.random()-.5)*.6;
        fxaPuff(q,{col:Math.random()<.7?0x140a1e:0x2a1640,r0:.12,r1:.5,life:1.1,op:.38*fin,v:[(Math.random()-.5)*.3,.5,(Math.random()-.5)*.3],drag:1,fin:.2,geo:'dod'});
        if(Math.random()<.35)fxaPuff(q,{col:0x9a6ae0,r0:.05,r1:.0,life:.6,op:.7*fin,add:1,v:[0,.6,0],fin:.1})}}
    return keep};
  o.end=function(ob){const p=m.position.clone();burst(gY(p,.8),S.col,24,1.4,2,.5);
    // dissolve: fade out, sinking wisps rising off it
    for(let i=0;i<10;i++){const q=p.clone();q.y=GH(p.x,p.z)+.2+Math.random()*1.4;q.x+=(Math.random()-.5)*.8;q.z+=(Math.random()-.5)*.8;
      fxaPuff(q,kind=='wolf'?{col:0x7ff0e0,r0:.15,r1:.6,life:1,op:.3,add:1,v:[0,.8,0],drag:1,geo:'dod'}:{col:0x1a0e26,r0:.18,r1:.7,life:1.2,op:.45,v:[0,.7,0],drag:1,geo:'dod'})}
    let k=0;kqsObj({life:.5,tick:(dt)=>{k+=dt;fxaOp(mats,Math.max(0,1-k/.5));if(kind=='wolf')m.scale.setScalar(m.userData.sc0*(1+.15*k/.5))},end:()=>fxaRm(m)})};
  return o}
// swap the models inside the unchanged handlers
function fxaSwap(key,kind,model,mk){const f=KQH[key];if(typeof f!='function')return;
  KQH[key]=function(c){const W=window[model],S=kqsSummon;let made=null;
    window[model]=function(){made=mk();return made||W.apply(this,arguments)};
    kqsSummon=function(o){if(made&&o.mesh===made){o.wolf=0;o.hum=0;return fxaSumHook(S.apply(this,arguments),o,kind)}return S.apply(this,arguments)};
    try{return f.apply(this,arguments)}finally{window[model]=W;kqsSummon=S}}}
fxaSwap('r_wolf','wolf','kqsWolf',fxaGhostWolf);
fxaSwap('a_clone','clone','kqsShade',fxaShadowClone);

