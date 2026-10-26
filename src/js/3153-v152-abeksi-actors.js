// ================= v152 Abeksi — the snakes: routines, eyes, ears =================
// Each snake of the plan (3151 N) is an actor: a Naga model (3154 poses) with a routine, a pair of eyes and a pair of ears.
// They are not enemies (nothing to fight, nothing in `enemies`), and each player sneaks through their own copy (co-op safe).
//  * Routines: sentry (stands, turns its head and body through an arc), patrol (a loop of waypoints, a look-round at each stop),
//    lantern (a slow patrol carrying a lantern: sees further, lights what it looks at; the tower lamp only sweeps), walker
//    (a citizen's errands, maybe carrying a cage or a platter), talk (pairs: one talks, one listens, they swap), sit / work
//    (busy: eating, haggling, stirring, chopping, turning spits, feeding rats, sweeping, forking hay; busy eyes see less).
//  * Eyes (ab152Sees): a cone (AB152V.half by kind) out to a range (AB152V.rng) that shrinks when the hero crouches (crouchK) and
//    in the dark (darkK, from the light level at the hero, ab152Light); a ring right round them (near); line of sight on the
//    city grid: buildings, tall cover and cloth (laundry) block everything, low cover blocks a crouching hero.
//  * Suspicion (0..100, AB152V.rate per second while seen, closer = faster; it fades after AB152V.hold s unseen): 30 → stop and
//    look (yellow "?"), 60 → walk over to look (investigate, orange "?"), 100 → caught (red "!"; 3155 sends the hero back).
//  * Ears (ab152Hear): walking upright makes noise (AB152V.noise.walk tiles), a dash more, walking upright past a rat pen sets the
//    rats squealing (noise at the pen). A snake that hears turns to the sound; hearing again sends it to investigate.
//  * The view cones are drawn on the ground (fans clipped by what blocks sight), so the hero can read every pair of eyes.
var AB152V={rng:{guard:10,lantern:12.5,civ:7,busy:5,tower:15},half:{guard:.87,civ:.72,busy:.55,tower:.32},near:{stand:2.0,crouch:1.05},crouchK:.7,darkK:.6,
  rate:[48,150],hold:.9,decay:26,look:30,go:60,catch:100,noise:{walk:4.2,dash:8,rats:6.5},spd:{inv:1.55,ret:1.25}};
function ab152Busy(a){return a.role=='sit'||a.role=='work'||a.role=='spit'}
function ab152Kind(a){return a.o.sweep?'tower':a.role=='lantern'?'lantern':a.role=='sentry'||a.role=='patrol'?'guard':ab152Busy(a)&&a.st=='routine'?'busy':'civ'}
// ---------------- the city grid ----------------
// cls: 0 open, 1 low cover, 2 tall (buildings, stacks), 3 cloth (hides, walkable); sol: solid for walking
function ab152Grid(P,I){const Wd=P.W,Hd=P.H,cls=new Uint8Array(Wd*Hd),sol=new Uint8Array(Wd*Hd),yard=new Uint8Array(Wd*Hd),[a0,b0,a1,b1]=P.IN;
  for(let v=0;v<Hd;v++)for(let u=0;u<Wd;u++)if(u<a0||u>a1||v<b0||v>b1){cls[v*Wd+u]=2;sol[v*Wd+u]=1}
  P.B.forEach(([u0,v0,u1,v1])=>{for(let v=v0;v<v1;v++)for(let u=u0;u<u1;u++){cls[v*Wd+u]=2;sol[v*Wd+u]=1}
    for(let v=v0-1;v<=v1;v++)for(let u=u0-1;u<=u1;u++)if(u>=0&&v>=0&&u<Wd&&v<Hd&&cls[v*Wd+u]!==2)yard[v*Wd+u]=0});
  const fp=[];P.C.forEach(([k,u,v,r])=>{const K=AB152_K[k];if(!K)return;let [w,d,c,so]=K;if(Math.abs(Math.sin(r))>.7){const t=w;w=d;d=t}
    const x0=u-w/2+.5,z0=v-d/2+.5;for(let z=Math.floor(z0+.01);z<Math.ceil(z0+d-.01);z++)for(let x=Math.floor(x0+.01);x<Math.ceil(x0+w-.01);x++){if(x<0||z<0||x>=Wd||z>=Hd)continue;const i=z*Wd+x;
      if(c)cls[i]=Math.max(cls[i],c==3?3:c);if(so){sol[i]=1;fp.push(i)}}});
  // yards: open tiles enclosed between houses of one block (the street texture skips them): tiles next to a building on two
  // opposite sides within 3 tiles count as yard
  for(let v=b0;v<=b1;v++)for(let u=a0;u<=a1;u++){const i=v*Wd+u;if(cls[i]==2)continue;let n=0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([du,dv])=>{for(let s=1;s<=3;s++){const j=(v+dv*s)*Wd+u+du*s;if(cls[j]==2&&sol[j]){n++;break}}});if(n>=3)yard[i]=1}
  // roof heights (world y) for the camera: buildings and the outer wall
  const top=new Float32Array(Wd*Hd);for(let i=0;i<Wd*Hd;i++)if(cls[i]==2&&sol[i])top[i]=1.6+7.8;
  P.B.forEach(([u0,v0,u1,v1,st,sty])=>{const h=1.6+(sty=='tower'?2.3*st+.8:sty=='hall'?3.4:sty=='barn'?4.4:sty=='ruin'?2.6:2.3*st)+.55;for(let v=v0;v<v1;v++)for(let u=u0;u<u1;u++)top[v*Wd+u]=h});
  return {W:Wd,H:Hd,cls,sol,yard,fp,top}}
function ab152Cls(G,u,v){const x=Math.round(u),z=Math.round(v);if(x<0||z<0||x>=G.W||z>=G.H)return 2;return G.cls[z*G.W+x]}
// line of sight from (au,av) to (bu,bv) in plan coordinates; low cover blocks only a crouching target
function ab152LOS(G,au,av,bu,bv,cr){const L=Math.hypot(bu-au,bv-av);if(L<.8)return true;const n=Math.ceil(L/.3);
  for(let i=1;i<n;i++){const t=i/n;if(t*L<.55||(1-t)*L<.45)continue;const c=ab152Cls(G,au+(bu-au)*t,av+(bv-av)*t);if(c>=2)return false;if(c==1&&cr&&(1-t)*L<4.5)return false}return true}
// how lit a spot is (0 dark .. 1 bright): the city's lights, a little moonlight, and the lanterns the snakes carry
function ab152Light(u,v){const S=AB152.S;if(!S)return 1;let L=.12;for(const q of S.lights){const d=Math.hypot(u-q.u,v-q.v);if(d<q.r)L=Math.max(L,1-d/q.r*.85)}
  for(const a of S.acts)if(a.lamp&&a.g){const d=Math.hypot(u-a.u,v-a.v);if(d<5)L=Math.max(L,1-d/5*.7)}return Math.min(1,L)}
// ---------------- building the actors ----------------
function ab152MakeActor(sp,I){const [id,look,role,u,v,ry,o0]=sp,o=o0||{},key=look=='w'?'nagaw':look=='a'?'nagaa':'nagas';
  const g=mkHumanoid(key);g.userData.psNo=1;g.userData.ab152=id;const h=g.h;h.userData.rest=czRest103(h);
  const guard=role=='sentry'||role=='patrol'||(role=='lantern'&&!o.sweep);
  // civilians put their weapons away; tools in their hands instead
  if(!guard||o.chef){['aR2','aL2'].forEach(b=>{const bn=h.bones[b];if(bn)bn.children.slice().forEach(c=>{if(!c.isBone)bn.remove(c)})})}
  else if(role=='lantern'){const bn=h.bones.aL2;bn.children.slice().forEach(c=>{if(!c.isBone)bn.remove(c)})}
  const pose=o.pose||(role=='talk'?'talk':role=='sentry'?'guard':role=='sit'?'sit':'idle'),tk=o.carry||(o.chef?'cleaver':{stir:'ladle',chop:'cleaver',sweep:'broom',fork:'fork',hammer:'hammer',sitEat:'bone',eatStand:'bone'}[pose])||(role=='lantern'?'lantern':null);
  if(tk){const t=ab152Tool(tk);if(t){const hand=tk=='lantern'?h.bones.aL2:h.bones.aR2;t.rotation.x=tk=='cage'||tk=='platter'?0:-1.0;t.position.set(0,-.03,.02);if(tk=='cage'){t.position.set(.18,-.05,.22);t.rotation.set(0,0,Math.PI/2)}hand.add(t);g.userData.tool=t}}
  const [x,z]=[I.x0+u,I.y0+v];g.position.set(x,1.6,z);g.rotation.y=ry;
  const sd=[...id].reduce((h,c)=>h*31+c.charCodeAt(0),7)%100000+11,rnd=ab152R(sd);
  const a={id,role,look,o,g,h,pose,sd,rnd,home:{u,v,ry},u,v,yaw:ry,hy:0,ht:0,st:'routine',sus:0,unseen:9,seen:0,t:rnd()*20,tph:rnd()*8,pi:0,wait:o.path?(o.path[0][2]||0):0,
    path:o.path?o.path.map(q=>[q[0],q[1],q[2]||0]):null,spd:o.spd||1.2,lamp:role=='lantern',mv:0,mark:null,cone:null,glT:2+rnd()*4,gl:0,tgt:null,inv:0,ear:0};
  if(o.with)a.tph=(id.charCodeAt(id.length-1)%2)*3.2;
  return a}
// reset to the start of its routine (a checkpoint restart)
function ab152ResetActor(a){a.rnd=ab152R(a.sd);a.t=a.rnd()*20;a.tph=a.rnd()*8;a.glT=2+a.rnd()*4;a.gl=0;a.ht=0;a.u=a.home.u;a.v=a.home.v;a.yaw=a.home.ry;a.hy=0;a.st='routine';a.sus=0;a.unseen=9;a.seen=0;a.pi=0;a.wait=a.path?(a.path[0][2]||0):0;a.tgt=null;a.inv=0;a.ear=0;a.mv=0;
  if(a.path){a.u=a.path[0][0];a.v=a.path[0][1]}}
// ---------------- the brain ----------------
function ab152Turn(a,want,rate,dt){let d=want-a.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));a.yaw+=Math.max(-rate*dt,Math.min(rate*dt,d));return Math.abs(d)}
function ab152Step(a,tu,tv,sp,dt){const G=AB152.S.G,du=tu-a.u,dv=tv-a.v,L=Math.hypot(du,dv);if(L<.08){a.mv=0;return true}
  ab152Turn(a,Math.atan2(du,dv),4.2,dt);const s=Math.min(L,sp*dt),nu=a.u+du/L*s,nv=a.v+dv/L*s,c=G.sol[Math.round(nv)*G.W+Math.round(nu)];
  if(c&&a.st!='routine'){a.mv=0;return true}a.u=nu;a.v=nv;a.mv=sp;return L-s<.08}
function ab152Routine(a,dt){const o=a.o;a.mv=0;
  if(a.path){const q=a.path[a.pi];if(a.wait>0){a.wait-=dt;a.ht=a.role=='walker'?.35*Math.sin(a.t*.9):.9*Math.sin(a.t*1.3);return}
    if(ab152Step(a,q[0],q[1],a.spd,dt)){a.pi=(a.pi+1)%a.path.length;a.wait=a.path[a.pi][2]||0;const n=a.path[a.pi];if(Math.hypot(n[0]-a.u,n[1]-a.v)<.1){}}
    a.ht=a.role=='lantern'?.55*Math.sin(a.t*.8):0;return}
  // standing roles go back to their post if moved
  const H=a.home;if(Math.hypot(H.u-a.u,H.v-a.v)>.12){ab152Step(a,H.u,H.v,AB152V.spd.ret,dt);return}
  if(a.role=='sentry'||o.sweep){const w=(Math.PI*2)/(o.per||10),s=Math.sin(a.t*w+(o.ph||0)*6.283);ab152Turn(a,H.ry+(o.arc||1)*s,3,dt);a.ht=.25*Math.sin(a.t*w*2.3);return}
  ab152Turn(a,H.ry,3,dt);
  // busy and chatting snakes glance around now and then: that is when they can catch you
  a.glT-=dt;if(a.glT<=0){const R=a.rnd;a.gl=a.gl?0:(R()<.5?-1:1)*(.7+R()*.6);a.glT=a.gl?1.2+R()*1.4:3+R()*5}
  a.ht+=((a.gl||0)-a.ht)*Math.min(1,dt*3)}
// the hero is in the city's frame (u, v); cr = crouching; returns how fast suspicion rises (0 = not seen)
function ab152Sees(a,hu,hv,cr,lit){const kind=ab152Kind(a),du=hu-a.u,dv=hv-a.v,d=Math.hypot(du,dv);if(d>16)return 0;const G=AB152.S.G;
  const near=cr?AB152V.near.crouch:AB152V.near.stand;
  if(kind!='tower'&&d<near&&ab152LOS(G,a.u,a.v,hu,hv,false))return AB152V.rate[1]*1.4;
  let R=AB152V.rng[kind]*(cr?AB152V.crouchK:1);const half=AB152V.half[kind];
  if(kind!='tower'&&kind!='lantern')R*=1-(1-AB152V.darkK)*(1-Math.min(1,lit/.6));
  if(a.st!='routine')R*=1.25;
  if(d>R)return 0;const fy=a.yaw+a.hy;let df=Math.atan2(du,dv)-fy;df=Math.atan2(Math.sin(df),Math.cos(df));if(Math.abs(df)>half)return 0;
  if(!ab152LOS(G,a.u,a.v,hu,hv,cr&&!a.o.lift))return 0;   // raised watchers see over low cover
  return AB152V.rate[0]+AB152V.rate[1]*(1-d/R)}
// a sound at (u, v) with radius r (tiles): every calm snake in reach turns to it, a suspicious one comes to look
function ab152Hear(u,v,r,why){const S=AB152.S;if(!S)return;for(const a of S.acts){if(a.st=='caught')continue;const d=Math.hypot(a.u-u,a.v-v);if(d>r)continue;
    if(a.sus<AB152V.look+5){a.sus=Math.max(a.sus,AB152V.look+8);a.st='look';a.tgt=[u,v];a.unseen=0;a.ear=why||'noise'}else{a.sus=Math.max(a.sus,AB152V.go+5);a.st='investigate';a.tgt=[u,v];a.inv=0;a.unseen=0}}}
// one actor, one frame: senses → suspicion → behaviour → pose/model
function ab152ActTick(a,dt,now,H){a.t+=dt;const o=a.o;
  // perception (only while the hero is free to be caught)
  let rate=0;if(H.live)rate=ab152Sees(a,H.u,H.v,H.cr,H.lit);
  if(rate>0){a.sus=Math.min(100,a.sus+rate*dt);a.unseen=0;a.seen=1;a.last=[H.u,H.v]}else{a.seen=0;a.unseen+=dt;if(a.unseen>AB152V.hold)a.sus=Math.max(0,a.sus-AB152V.decay*dt)}
  if(a.sus>=AB152V.catch&&H.live){a.st='caught';return 'caught'}
  if(a.st=='routine'||a.st=='return'){if(a.sus>=AB152V.go){a.st='investigate';a.tgt=a.last||[H.u,H.v];a.inv=0}else if(a.sus>=AB152V.look){a.st='look';a.tgt=a.last||[H.u,H.v]}}
  else if(a.st=='look'){if(a.seen&&a.last)a.tgt=a.last;if(a.sus>=AB152V.go){a.st='investigate';a.inv=0}else if(a.sus<=4&&a.unseen>1.5)a.st='return'}
  else if(a.st=='investigate'&&a.seen&&a.last)a.tgt=a.last;
  // behaviour
  if(a.st=='routine')ab152Routine(a,dt);
  else if(a.st=='look'){a.mv=0;const T=a.tgt;if(T&&!o.sweep)ab152Turn(a,Math.atan2(T[0]-a.u,T[1]-a.v),2.6,dt);a.ht*=.9}
  else if(a.st=='investigate'){const T=a.tgt;if(o.sweep||a.role=='sit'){a.mv=0;if(T)ab152Turn(a,Math.atan2(T[0]-a.u,T[1]-a.v),2.6,dt)}   // the tower lamp and seated folk only stare
    else if(T&&Math.hypot(T[0]-a.u,T[1]-a.v)>1.4&&a.inv<8){a.inv+=dt;ab152Step(a,T[0],T[1],AB152V.spd.inv,dt)}
    else{a.mv=0;a.inv+=dt;a.ht=1.1*Math.sin(a.inv*1.9);if(a.inv>5.5&&!a.seen){a.st='return';a.sus=Math.min(a.sus,AB152V.look-6)}}}
  else if(a.st=='return'){const H0=a.home,q=a.path?a.path[a.pi]:[H0.u,H0.v];if(ab152Step(a,q[0],q[1],AB152V.spd.ret,dt)){a.st='routine';if(!a.path)a.yaw=a.yaw}a.ht*=.9}
  // head turn follows a.ht smoothly (and the yaw offset used by the eyes)
  a.hy+=((a.st=='look'||a.st=='investigate'?0:a.ht)*.6-a.hy)*Math.min(1,dt*4);
  return null}
// the model: place it, pick walk or pose, write the bones
function ab152ActPose(a,now,dt,vis){const g=a.g,I=AB152.S.I;g.visible=vis;if(!vis)return;const x=I.x0+a.u,z=I.y0+a.v;g.position.set(x,GH(x,z)+(a.o.lift||0),z);g.rotation.y=a.yaw;
  const h=a.h;czReset103(h);h._idl=null;const st=a.st;
  if(a.mv>0){g.rig(now,true,a.mv);const ov=a.o.carry||(a.lamp?'lantern':null);if(ov&&AB152P[ov])ab152Apply(h,ov,a.t,a,true);return}
  const name=st=='caught'?'caught':(st=='look'||st=='investigate')?(ab152Busy(a)&&a.role=='sit'?a.pose:'alert'):a.path?(a.role=='walker'?'idle':'look'):a.pose;
  a.ht2=st=='routine'?a.ht:a.hy;ab152Apply(h,name,a.t,a,false)}
function ab152Apply(h,name,t,a,overlay){const f=AB152P[name]||AB152P.idle,B=h.bones,R=h.userData.rest;
  const P=(bn,rx,ry,rz)=>{const b=B[bn];if(!b)return;b.rotation.x+=rx||0;b.rotation.y+=ry||0;b.rotation.z+=rz||0};
  P.dy=v=>{const p=B.pelvis;if(p)p.position.y+=v};
  if(overlay){['aL0','aL1','aL2','aR0','aR1','aR2','head'].forEach(k=>{const r=R[k],b=B[k];if(r&&b)b.rotation.set(r[0],r[1],r[2])})}
  const S={ht:a.ht2!=null?a.ht2:a.ht,tph:a.tph};f(P,t,S)}
// ---------------- what the hero sees of the snakes: view cones, "?" and "!" ----------------
var AB152CN={N:22};
// a fan on the ground, brightest near the eyes and fading out to its rim (f: 0 at the snake, 1 at the rim)
function ab152ConeMat(){return new THREE.ShaderMaterial({uniforms:{col:{value:new THREE.Color(0xfff0a0)},op:{value:.16}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
  vertexShader:'attribute float f;varying float vF;void main(){vF=f;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 col;uniform float op;varying float vF;void main(){float a=op*(1.-vF*vF*.75)*smoothstep(0.,.08,vF);gl_FragColor=vec4(col,a);}'})}
function ab152ConeMake(){const N=AB152CN.N,g=new THREE.BufferGeometry(),pos=new Float32Array((N+2)*3),f=new Float32Array(N+2).fill(1),idx=[];f[0]=0;for(let i=1;i<=N;i++)idx.push(0,i,i+1);
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('f',new THREE.BufferAttribute(f,1));g.setIndex(idx);
  const m=new THREE.Mesh(g,ab152ConeMat());m.frustumCulled=false;m.renderOrder=3;m.userData.psNo=1;return m}
function ab152ConeTick(a,I,G,cr){const c=a.cone;if(!c)return;const kind=ab152Kind(a),N=AB152CN.N;let R=AB152V.rng[kind]*(cr?AB152V.crouchK:1);if(a.st!='routine')R*=1.25;
  const half=AB152V.half[kind],fy=a.yaw+a.hy,p=c.geometry.attributes.position,y=GH(I.x0+a.u,I.y0+a.v)+.06;p.setXYZ(0,I.x0+a.u,y,I.y0+a.v);
  for(let i=0;i<=N;i++){const an=fy-half+2*half*i/N,su=Math.sin(an),sv=Math.cos(an);let L=R;
    for(let s=.5;s<=R;s+=.5){const c2=ab152Cls(G,a.u+su*s,a.v+sv*s);if(c2>=2){L=s-.25;break}}
    p.setXYZ(i+1,I.x0+a.u+su*L,y,I.y0+a.v+sv*L)}
  p.needsUpdate=true;const col=a.st=='caught'?0xff3020:a.sus>=AB152V.go?0xff8a2a:a.sus>=AB152V.look?0xffd040:0xfff0a0,U=c.material.uniforms;U.col.value.setHex(col);
  U.op.value=a.st=='caught'?.42:a.sus>8?.26+.16*a.sus/100:.2}
function ab152MarkTex(ch,col){const k=ch+col;AB152CN.tx=AB152CN.tx||{};if(AB152CN.tx[k])return AB152CN.tx[k];const c=document.createElement('canvas');c.width=64;c.height=80;const x=c.getContext('2d');
  x.font='900 66px Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='#120a04';x.strokeText(ch,32,42);x.fillStyle=col;x.fillText(ch,32,42);return AB152CN.tx[k]=new THREE.CanvasTexture(c)}
function ab152MarkTick(a,now){if(!a.mark){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:ab152MarkTex('?','#ffe060'),transparent:true,depthWrite:false,fog:false}));sp.scale.set(.42,.52,1);sp.renderOrder=6;sp.userData.psNo=1;AB152.S.root.add(sp);a.mark=sp}
  const m=a.mark,show=a.g.visible&&(a.sus>3||a.st=='caught');m.visible=show;if(!show)return;
  const ch=a.st=='caught'?'!':'?',col=a.st=='caught'?'#ff3a20':a.sus>=AB152V.go?'#ff9a30':'#ffe060';m.material.map=ab152MarkTex(ch,col);
  const s=a.st=='caught'?.6:.3+.25*a.sus/100;m.scale.set(s*.82,s,1);m.material.opacity=a.st=='caught'?1:.45+.55*a.sus/100;
  m.position.set(a.g.position.x,a.g.position.y+2.0+.06*Math.sin(now/180),a.g.position.z)}
