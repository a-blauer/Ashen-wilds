// ================= v165 The Sandstorm Run — what the storm throws at you =================
// The creatures of the earlier Sands instances, made for a chase (all run by this file's own AI; the host's world spawns them):
//  * Sun Scarabs ('scarab'): swarms that pour over the dunes from ahead and from behind, faster than the cruising Skimmer. One that
//    reaches the hull clings on and gnaws (the hull loses health while it holds); shoot them off, or boost: the turbine's kick
//    flings them away.
//  * Dune Scorpions ('scorp'): they wait at the edges of the course ahead, rear up and spit a venom glob where the Skimmer is
//    going (a ring on the sand shows where it lands: steer away). Left behind, they are gone.
//  * Desert worms: the sand ripples across half the course ahead (the tell), then a great worm bursts out and arcs over it and
//    dives again. Where its body meets the sand it smashes anything there; under the arch is safe. Shells drive it under early.
// The pace rises the further you get: more scarabs, scorpions closer together, worms more often.
var SR165F={wy:[],st:[],t:{sc:3,sp:6,wy:9},err:0,M:null};
function sr165FM(){if(SR165F.M)return SR165F.M;const M={skin:new THREE.MeshStandardMaterial({color:0xb88a58,roughness:.75,flatShading:true}),belly:new THREE.MeshStandardMaterial({color:0xd8b888,roughness:.8,flatShading:true}),
  mouth:new THREE.MeshStandardMaterial({color:0x3a1410,roughness:.6,flatShading:true}),tooth:new THREE.MeshStandardMaterial({color:0xf0e8d8,roughness:.4,flatShading:true}),
  venom:new THREE.MeshBasicMaterial({color:0x9ad040,transparent:true,opacity:.85}),ring:new THREE.MeshBasicMaterial({color:0x9ad040,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide})};return SR165F.M=M}
function sr165Host(){return typeof co151On!='function'||!co151On()||co151Host()}
function sr165Lv(){const I=sp152I('sandrun');return (I&&I.lv&&I.lv[0])||35}
// ---------------- spawning ----------------
function sr165Spawn(dt){const me=SR165.me;if(!me||SR165.ph!=='run'||!sr165Host())return;const P=sr165Path(),f=me.s/P.S,T=SR165F.t;
  // nothing in the last stretch before the cave, a breath after each checkpoint
  if(me.s>P.S-35)return;
  T.sc-=dt;if(T.sc<=0){T.sc=Math.max(3.6,8.5-f*5)+Math.random()*2;const n=3+Math.floor(f*4+Math.random()*2),behind=Math.random()<.4,s0=behind?me.s-16:me.s+38+Math.random()*10,sd=Math.random()<.5?-1:1;
    for(let i=0;i<n;i++){const [x,z]=P.at(s0+(Math.random()-.5)*6,sd*(SR165C.hw-1.2-Math.random()*3));sr165Foe('scarab',x,z,'sc')}
    if(f>.2&&!behind)say('🪲 Scarabs over the dunes!')}
  T.sp-=dt;if(T.sp<=0){T.sp=Math.max(5,11-f*6)+Math.random()*3;const k=f>.45&&Math.random()<.5?2:1;for(let i=0;i<k;i++){const sd=i?-1:(Math.random()<.5?-1:1),[x,z]=P.at(me.s+46+Math.random()*14+i*8,sd*(SR165C.hw-1.6));sr165Foe('scorp',x,z,'sp')}}
  T.wy-=dt;if(T.wy<=0&&f>.08){T.wy=Math.max(6.5,13-f*7)+Math.random()*3;const s=me.s+40+Math.random()*16,half=Math.random()<.5?-1:1,o0=half<0?-SR165C.hw+.5:-1.5+Math.random()*1.5,o1=half<0?1.5-Math.random()*1.5:SR165C.hw-.5;sr165Worm(s,o0,o1,true)}}
function sr165Foe(k,x,z,kind){let e=null;try{e=spawnEnemy(k,x,z,sr165Lv(),{agg:1})}catch(err){if(!SR165F.err++)console.warn('v165 run foe',err)}if(!e)return null;e.sr165=kind;e.agg=1;e.hunt=1;e.srT=Math.random()*2;
  burst(gY(e.m.position,.5),0xd8b080,14,1.6,1.4,.5);return e}
function sr165FoesReset(){enemies.slice().forEach(e=>{if(e.sr165)try{removeE(e)}catch(_){}});SR165F.wy.forEach(w=>{if(w.g)scene.remove(w.g);if(w.rip)scene.remove(w.rip)});SR165F.wy=[];SR165.wy=SR165F.wy;
  SR165F.st.forEach(q=>{scene.remove(q.m);scene.remove(q.r)});SR165F.st=[];SR165F.t={sc:3,sp:6,wy:9};SR165.V.forEach(V=>V.cling.length=0)}
// ---------------- the scarabs and scorpions (their own AI: eTick returns true for them) ----------------
function sr165Near(p){let b=null,bd=1e9;SR165.V.forEach(V=>{if(V.wreck)return;const d=Math.hypot(V.x-p.x,V.z-p.z);if(d<bd){bd=d;b=V}});return [b,bd]}
function sr165FoeAI(e,dt,now){const m=e.m,P=sr165Path(),me=SR165.me;if(!SR165.on||SR165.ph!=='run'){animC(m,now,false,0);return}
  const [V,d]=sr165Near(m.position);if(!V){animC(m,now,false,0);return}
  // far behind: gone
  const q=P.near(m.position.x,m.position.z);if(q.s<V.s-30||d>90){removeE(e);return}
  if(e.sr165==='sc'){
    if(e.cl){const C=e.cl;if(C.V.wreck||!SR165.V.includes(C.V)){e.cl=null;return}const fx=Math.sin(C.V.h),fz=Math.cos(C.V.h),lx=fz,lz=-fx;m.position.set(C.V.x+fx*C.f+lx*C.l,C.V.y+.9,C.V.z+fz*C.f+lz*C.l);m.rotation.y=C.V.h+(C.l>0?-Math.PI/2:Math.PI/2);
      sr165Hurt(C.V,dt*2.4,'scarab');animC(m,now,true,4);if(Math.random()<dt*2)burst(gY(m.position,.2),0xc8a878,3,.8,.8,.3);
      // the turbine's kick flings them off
      if(C.V.boost&&Math.random()<dt*2.2){e.cl=null;const i=C.V.cling.indexOf(e);if(i>=0)C.V.cling.splice(i,1);e.vx=lx*(C.l>0?1:-1)*14;e.vz=lz*(C.l>0?1:-1)*14;try{hurt(e,M(e.c)*.5,{col:0x9ae8ff},false)}catch(_){}popT(m.position,'Flung off!','#9ae8ff')}
      return}
    // run at the hull (they lead it a little), cling when close
    const fx=Math.sin(V.h),fz=Math.cos(V.h),tx=V.x+fx*Math.max(0,V.v)*.35,tz=V.z+fz*Math.max(0,V.v)*.35,dx=tx-m.position.x,dz=tz-m.position.z,L=Math.hypot(dx,dz)||1,sp=Math.min(20,Math.max(9,V.v+5));
    m.position.x+=dx/L*sp*dt+(e.vx||0)*dt;m.position.z+=dz/L*sp*dt+(e.vz||0)*dt;e.vx=(e.vx||0)*.9;e.vz=(e.vz||0)*.9;m.position.y=GH(m.position.x,m.position.z);m.rotation.y=Math.atan2(dx,dz);animC(m,now,true,sp*.4);
    if(d<2.8&&V.cling.length<6){const lx=fz,lz=-fx,rx=m.position.x-V.x,rz=m.position.z-V.z;e.cl={V,f:Math.max(-2.6,Math.min(2.6,rx*fx+rz*fz)),l:(rx*lx+rz*lz)>0?1.35:-1.35};V.cling.push(e);if(V===me)say('🪲 A scarab clings to the hull! Shoot it off — or boost!')}
    return}
  if(e.sr165==='sp'){// stand at the edge, face the Skimmer, spit venom where it is going
    m.rotation.y=Math.atan2(V.x-m.position.x,V.z-m.position.z);animC(m,now,false,0);e.srT-=dt;
    if(e.srT<=0&&d<46&&d>6){e.srT=2.6+Math.random()*1.2;const T=Math.min(1.6,.5+d/30),px=V.x+Math.sin(V.h)*V.v*T,pz=V.z+Math.cos(V.h)*V.v*T;sr165Sting(gY(m.position,1.4),px,pz,T)}}}
{const f=eTick;eTick=function(e,dt,now){if(e&&e.sr165){try{sr165FoeAI(e,dt,now)}catch(err){if(!SR165F.err++)console.warn('v165 foe ai',err)}return true}return f.apply(this,arguments)}}
// a venom glob: a ring on the sand where it will land, the glob arcing there
function sr165Sting(from,x,z,T){const M=sr165FM(),y=GH(x,z),r=new THREE.Mesh(svG('sr_ring',()=>new THREE.RingGeometry(2.2,2.7,24)),M.ring);r.rotation.x=-Math.PI/2;r.position.set(x,y+.1,z);scene.add(r);
  const g=new THREE.Mesh(svG('sr_glob',()=>new THREE.SphereGeometry(.35,8,6)),M.venom);g.position.copy(from);scene.add(g);const q={m:g,r,t:0,T,a:from.clone(),b:new THREE.Vector3(x,y+.3,z)};SR165F.st.push(q);svSnd('hiss',.4,1.3)}
function sr165StingTick(dt){SR165F.st=SR165F.st.filter(q=>{q.t+=dt;const k=Math.min(1,q.t/q.T);q.m.position.lerpVectors(q.a,q.b,k);q.m.position.y+=Math.sin(k*Math.PI)*5;q.r.scale.setScalar(1.2-k*.2);
    if(k>=1){burst(q.b,0x9ad040,26,2.4,1.6,.6);svSnd('squelch',.5,1);if(!q.noHit)SR165.V.forEach(V=>{if(!V.wreck&&Math.hypot(V.x-q.b.x,V.z-q.b.z)<3.0)sr165Hurt(V,7,'venom')});scene.remove(q.m);scene.remove(q.r);return false}return true})}
// ---------------- the worms ----------------
function sr165WormMesh(){const M=sr165FM(),g=new THREE.Group(),segs=[];for(let i=0;i<18;i++){const r=1.15-i*.035,m=new THREE.Mesh(svG('sr_seg',()=>new THREE.SphereGeometry(1,10,8)),i%2?M.skin:M.belly);m.scale.set(r,r,r*.9);g.add(m);segs.push(m)}
  const head=new THREE.Group();const jaw=new THREE.Mesh(svG('sr_mouth',()=>{const q=new THREE.CylinderGeometry(1.25,.9,1.0,10,1,true);q.rotateX(Math.PI/2);return q}),M.skin);head.add(jaw);
  const throat=new THREE.Mesh(svG('sr_thr',()=>new THREE.CircleGeometry(1.15,10)),M.mouth);throat.position.z=-.1;head.add(throat);
  for(let k=0;k<10;k++){const a=k/10*Math.PI*2,t=new THREE.Mesh(svG('sr_tooth',()=>{const q=new THREE.ConeGeometry(.12,.55,4);q.rotateX(-Math.PI/2);return q}),M.tooth);t.position.set(Math.cos(a)*1.0,Math.sin(a)*1.0,.45);t.lookAt(0,0,-1.5);head.add(t)}
  g.add(head);return {g,segs,head}}
function sr165Worm(s,o0,o1,own,ab){const P=sr165Path();if(SR165F.wy.length>3)return;const W={s,o0,o1,t:0,ph:'tell',hp:4,hitV:new Set(),id:Math.random()};
  const [ax,az]=P.at(s,o0),[bx,bz]=P.at(s+(Math.random()-.5)*6,o1);W.a=new THREE.Vector3(ax,GH(ax,az),az);W.b=new THREE.Vector3(bx,GH(bx,bz),bz);if(Math.random()<.5){const q=W.a;W.a=W.b;W.b=q}if(ab&&ab.length===4&&ab.every(isFinite)){W.a.set(ab[0],GH(ab[0],ab[1]),ab[1]);W.b.set(ab[2],GH(ab[2],ab[3]),ab[3])}
  const rip=new THREE.Mesh(new THREE.PlaneGeometry(1,2.2),new THREE.MeshBasicMaterial({map:sr165SwirlTex(),transparent:true,opacity:.0,depthWrite:false}));rip.rotation.x=-Math.PI/2;W.rip=rip;scene.add(rip);
  SR165F.wy.push(W);SR165.wy=SR165F.wy;if(own&&typeof co165Worm=='function')co165Worm(W);return W}
function sr165WormAt(W,u){const p=W.a.clone().lerp(W.b,u);p.y=Math.max(W.a.y,W.b.y)*0+((W.a.y*(1-u)+W.b.y*u))+Math.sin(Math.PI*u)*6.5-1.2;return p}
function sr165WormTick(dt){SR165F.wy=SR165F.wy.filter(W=>{W.t+=dt;
    if(W.ph==='tell'){// a ripple runs across the course and the sand shakes
      const k=Math.min(1,W.t/1.7),mid=W.a.clone().lerp(W.b,.5),L=W.a.distanceTo(W.b);W.rip.position.set(mid.x,mid.y+.12,mid.z);W.rip.rotation.z=-Math.atan2(W.b.z-W.a.z,W.b.x-W.a.x);W.rip.scale.set(L*k,1,1);W.rip.material.opacity=.7;
      if(Math.random()<dt*30){const p=W.a.clone().lerp(W.b,Math.random()*k);burst(gY(p,.2),0xd8b080,2,1.2,1.4,.5)}
      if(W.t>=1.7){W.ph='up';W.t=0;const w=sr165WormMesh();W.g=w.g;W.segs=w.segs;W.head=w.head;scene.add(W.g);svSnd('roar',.55,.7);shake(.25);burst(gY(W.a,.4),0xd8b080,50,3.4,3,.8)}return true}
    if(W.rip){W.rip.material.opacity=Math.max(0,W.rip.material.opacity-dt);}
    // the head runs along the arc; the body follows; then it is gone under the sand
    const sp=W.ph==='down'?1.2:.62,uh=W.t*sp;let any=false;W.segs.forEach((m,i)=>{const u=uh-i*.06;m.visible=u>0&&u<1;if(!m.visible)return;any=true;m.position.copy(sr165WormAt(W,u));if(m.position.y<GH(m.position.x,m.position.z)-1.2)m.visible=false});
    W.head.visible=uh>0&&uh<1;if(W.head.visible){const p=sr165WormAt(W,uh),p2=sr165WormAt(W,Math.min(1,uh+.02));W.head.position.copy(p);W.head.lookAt(p.clone().add(p.clone().sub(p2)).multiplyScalar(1));W.head.lookAt(p2)}
    if(Math.random()<dt*20&&W.head.visible){burst(gY(uh<.2?W.a:W.b,.3),0xd8b080,3,2,2,.5)}
    // what it smashes: where its body is low (near either end)
    SR165.V.forEach(V=>{if(V.wreck||W.hitV.has(V))return;for(const m of W.segs){if(!m.visible||m.position.y-V.y>2.6)continue;if(Math.hypot(m.position.x-V.x,m.position.z-V.z)<2.4){W.hitV.add(V);sr165Hurt(V,18,'worm');V.v*=.3;V.bump=.6;svSnd('heavy',.9,.6);burst(gY(V.m.position,1.5),0xd8b080,40,3,3,.7);if(V===SR165.me)say('🪱 The worm slams into the Skimmer!');break}}});
    if(uh-18*.06>1||(!any&&W.t>1)){scene.remove(W.g);scene.remove(W.rip);return false}return true})}
// ---------------- what the shells can hit ----------------
function sr165FoeList(){const L=[];enemies.forEach(e=>{if(!e.sr165||e.dead)return;L.push({p:gY(e.m.position,.6),r:e.sr165==='sp'?1.5:.9,hit:k=>{try{hurt(e,M(e.c)*(e.sr165==='sp'?.3:.62)*k,{col:0xffc060},Math.random()<.15)}catch(_){}
      if(e.dead&&e.cl){const i=e.cl.V.cling.indexOf(e);if(i>=0)e.cl.V.cling.splice(i,1);e.cl=null}}})});
  SR165F.wy.forEach(W=>{if(W.ph==='tell'||!W.segs)return;[0,5,10].forEach(i=>{const m=i?W.segs[i]:W.head;if(m&&m.visible)L.push({p:m.position.clone(),r:1.4,hit:k=>{W.hp-=k;burst(m.position,0xffc060,10,1.6,1.4,.4);if(W.hp<=0&&W.ph!=='down'){W.ph='down';popT(m.position,'Driven under!','#ffe080',true);svSnd('shriek',.6,1.1)}}})})});return L}
// ---------------- the tick ----------------
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{if(SR165.on&&sr165In()){sr165Spawn(dt);sr165WormTick(dt);sr165StingTick(dt)}}catch(e){if(!SR165F.err++)console.warn('v165 run foes',e)}return r}}
