// ================= v146 Sovereigns to the Vorraxis standard — the shared kit =================
// The v146 overhaul (3051–3056, one file per Sovereign) brings every Sovereign up to the v144 Vorraxis standard
// (docs/BOSS_RECIPE.md): a Phase II that changes the den, one signature mechanic with a success and a failure outcome, richer
// ability effects, more detailed models and fluid secondary motion. This file is the shared part:
//  1. Secondary motion (sk146Spring): joints listed in B.spr = {joint:[stiffness, damping, inertia]} follow their animated
//     rotation through a damped spring instead of snapping to it, and lag behind the body's turning and acceleration. Cloth,
//     capes, hair, tails, wings, chains and heads get follow-through and overlap: the boss reads as weight, not keyframes.
//  2. Effects (sk146*): debris chunks with gravity and bounce, liquid droplets that splat, flash lights (two pooled point
//     lights reused), branching ground cracks, vertical shock walls, swarms (bats, crows, flies, ice shards, embers), weather
//     over a den (rain, snow, ash, spores, fog), columns, a beam between two points. Blade trails also throw sparks at the tip.
//  3. Signature mechanics: damage reduction while channelling (e.sv.dr), den props players must break (sk146Props, built on
//     the v86 dqProp toolkit: targetable, no XP or loot, cleared with the den), tethers from props to the boss, an expanding
//     ring wave to dash through, the generic "broken" stagger move and a heal pop.
//  4. Den state (sk146Den): A.s146 holds each fight's extra scenery and hazards; sk146DenClear removes all of it when the fight
//     ends (win, wipe or leaving), so a reset den is the same as a fresh one.
// Co-op: like the moves themselves, the effects run on every player's screen from the relayed move; props are local (each
// player breaks their own copies), the outcome on the driver decides the boss's health (synced).
var SK146={lt:[],fl:0,ck:{},sw:{},on:true,err:0};
// ---------------- 1. secondary motion ----------------
function sk146Spring(e,dt){const S=e.sv,B=S.B,sp=B.spr;if(!sp||!S.R)return;const J=S.R.J,m=e.m;
  if(!S.sk)S.sk={};const st=S.sk;
  // the body's turning (yaw rate) and acceleration (forward), for inertia
  const y=m.rotation.y,yr=dt>0?svAng(y-(S.skY==null?y:S.skY))/dt:0;S.skY=y;const sp0=S.spd||0,ac=dt>0?(sp0-(S.skS==null?sp0:S.skS))/dt:0;S.skS=sp0;
  S.skYr=(S.skYr||0)+(Math.max(-6,Math.min(6,yr))-(S.skYr||0))*Math.min(1,dt*10);S.skAc=(S.skAc||0)+(Math.max(-20,Math.min(20,ac))-(S.skAc||0))*Math.min(1,dt*8);
  for(const k in sp){const g=J[k];if(!g)continue;const [kk,dd,inr]=sp[k],q=st[k]||(st[k]={x:g.rotation.x,y:g.rotation.y,z:g.rotation.z,vx:0,vy:0,vz:0});
    if(!(dt>0)||dt>.25){q.x=g.rotation.x;q.y=g.rotation.y;q.z=g.rotation.z;q.vx=q.vy=q.vz=0;continue}
    // the target: the animated rotation, pushed by inertia (turning swings it sideways, acceleration drags it back)
    const i=inr||0,tx=g.rotation.x+S.skAc*.012*i,ty=g.rotation.y-S.skYr*.06*i,tz=g.rotation.z-S.skYr*.05*i;
    const ax=kk*(tx-q.x)-dd*q.vx,ay=kk*(ty-q.y)-dd*q.vy,az=kk*(tz-q.z)-dd*q.vz;q.vx+=ax*dt;q.vy+=ay*dt;q.vz+=az*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;
    // never further than ~.9 rad from the animation (no wild flailing)
    const cl=(a,b)=>Math.max(b-.9,Math.min(b+.9,a));q.x=cl(q.x,tx);q.y=cl(q.y,ty);q.z=cl(q.z,tz);g.rotation.set(q.x,q.y,q.z)}}
{const f=svApply;svApply=function(e,dt,now){const r=f.apply(this,arguments);try{if(e&&e.sv&&SK146.on)sk146Spring(e,dt||0)}catch(err){if(!SK146.err++)console.error('v146 spring',err)}return r}}
// ---------------- 2. effects ----------------
// two flash lights, reused (they are pooled sources: the nearest 4 lights in the scene are drawn)
function sk146Flash(p,col,I,dist,ms){let L=SK146.lt.find(l=>!l.userData.busy);if(!L){if(SK146.lt.length<2){L=new THREE.PointLight(0xffffff,0,8,1.6);scene.add(L);SK146.lt.push(L)}else L=SK146.lt[(SK146.fl++)%2]}
  L.userData.busy=1;L.color.setHex(col);L.distance=dist||9;L.position.set(p.x,(p.y||GH(p.x,p.z))+1.2,p.z);const I0=I||3,T=(ms||420)/1000;let t=0;L.userData.tok=(L.userData.tok||0)+1;const tok=L.userData.tok;
  kqFx({tick(dt){t+=dt||0;if(L.userData.tok!==tok)return false;const k=t/T;L.intensity=I0*(k<.12?k/.12:Math.pow(1-(k-.12)/.88,2));if(k>=1){L.intensity=0;L.userData.busy=0;return false}return true},end(){}})}
// debris: n chunks (mat, size s) thrown from p with speed v and lift up; they spin, bounce once and shrink away
function sk146Debris(p,mat,n,s,v,up,life){const g=svG('sk_db',()=>svLump(1,0,.5,146)),y0=GH(p.x,p.z),L=[];for(let k=0;k<n;k++){const o=new THREE.Mesh(g,mat),a=Math.random()*6.283,sp=v*(.4+Math.random()*.8),sz=s*(.5+Math.random()*.8);
    o.position.set(p.x,(p.y!=null&&p.y>y0?p.y:y0+.3),p.z);o.scale.setScalar(sz);o.castShadow=true;o.userData.lpsSkip=1;scene.add(o);L.push({o,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:up*(.6+Math.random()*.7),rx:(Math.random()-.5)*14,rz:(Math.random()-.5)*14,sz,b:0})}
  let t=0;const T=life||1.4;
  kqFx({tick(dt){dt=Math.min(.05,dt||0);t+=dt;for(const q of L){q.vy-=22*dt;q.o.position.x+=q.vx*dt;q.o.position.y+=q.vy*dt;q.o.position.z+=q.vz*dt;q.o.rotation.x+=q.rx*dt;q.o.rotation.z+=q.rz*dt;
      const gy=GH(q.o.position.x,q.o.position.z)+q.sz*.5;if(q.o.position.y<gy){q.o.position.y=gy;if(q.b<1&&q.vy<-2){q.vy*=-.35;q.vx*=.5;q.vz*=.5;q.b++}else{q.vy=0;q.vx*=.85;q.vz*=.85;q.rx*=.8;q.rz*=.8}}
      const k=t>T-.4?Math.max(.01,(T-t)/.4):1;q.o.scale.setScalar(q.sz*k)}return t<T},end(){L.forEach(q=>scene.remove(q.o))}})}
// droplets of a liquid (blood, ooze, water, magma): stretched along their velocity, they fall and leave small splats
function sk146Drops(p,col,n,v,up,o){o=o||{};const g=svG('sk_dr',()=>{const q=new THREE.SphereGeometry(1,5,4);return q}),m=new THREE.MeshBasicMaterial({color:col,fog:false}),y0=GH(p.x,p.z),L=[];
  for(let k=0;k<n;k++){const ms=new THREE.Mesh(g,m),a=Math.random()*6.283,sp=v*(.3+Math.random()*.9);ms.position.set(p.x+(Math.random()-.5)*.3,(p.y!=null?p.y:y0+.5),p.z+(Math.random()-.5)*.3);ms.userData.lpsSkip=1;ms.renderOrder=19;scene.add(ms);
    L.push({ms,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:up*(.5+Math.random()*.8),s:(o.s||.07)*(.6+Math.random()*.8),on:true})}
  let t=0,splat=0;
  kqFx({tick(dt){dt=Math.min(.05,dt||0);t+=dt;let alive=0;for(const q of L){if(!q.on)continue;alive++;q.vy-=20*dt;q.ms.position.x+=q.vx*dt;q.ms.position.y+=q.vy*dt;q.ms.position.z+=q.vz*dt;
      const v=Math.hypot(q.vx,q.vy,q.vz),st=Math.min(3,1+v*.12);q.ms.scale.set(q.s,q.s*st,q.s);q.ms.lookAt(q.ms.position.x+q.vx,q.ms.position.y+q.vy,q.ms.position.z+q.vz);q.ms.rotateX(Math.PI/2);
      if(q.ms.position.y<GH(q.ms.position.x,q.ms.position.z)+.05){q.on=false;q.ms.visible=false;if(splat<(o.splats==null?6:o.splats)){splat++;svDecal(q.ms.position,o.dc||col,.18+Math.random()*.22,o.dl||2.4,.7)}}}
    return alive>0&&t<3},end(){L.forEach(q=>scene.remove(q.ms));m.dispose()}})}
// a branching ground crack that glows (col) and fades
function sk146CrackTex(seed){const k='c'+(seed%6);if(SK146.ck[k])return SK146.ck[k];const cv=document.createElement('canvas');cv.width=cv.height=256;const g=cv.getContext('2d'),rn=svRng(900+seed%6);g.translate(128,128);
  g.strokeStyle='#fff';g.lineCap='round';const br=(x,y,a,len,w,d)=>{if(d>4||len<6)return;let px=x,py=y;g.lineWidth=w;g.beginPath();g.moveTo(px,py);const n=4;for(let i=0;i<n;i++){a+=(rn()-.5)*.7;px+=Math.cos(a)*len/n;py+=Math.sin(a)*len/n;g.lineTo(px,py)}g.stroke();
    br(px,py,a+(rn()-.5)*.6,len*.72,w*.7,d+1);if(rn()<.65)br(x+(px-x)*.5,y+(py-y)*.5,a+(rn()<.5?1:-1)*(.6+rn()*.6),len*.55,w*.6,d+1)};
  const N=5+(rn()*3|0);for(let i=0;i<N;i++)br(0,0,i/N*6.283+rn()*.5,60+rn()*50,5,0);const gr=g.createRadialGradient(0,0,0,0,0,30);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(-30,-30,60,60);
  return SK146.ck[k]=new THREE.CanvasTexture(cv)}
function sk146Crack(p,col,r,life){const g=svG('sk_ck',()=>new THREE.PlaneGeometry(2,2).rotateX(-Math.PI/2)),m=new THREE.MeshBasicMaterial({color:col,map:sk146CrackTex((Math.random()*6)|0),transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-4}),
    dk=new THREE.MeshBasicMaterial({color:0x000000,map:m.map,transparent:true,opacity:.6,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3});
  const a=new THREE.Mesh(g,dk),b=new THREE.Mesh(g,m),y=GH(p.x,p.z);[a,b].forEach((o,i)=>{o.position.set(p.x,y+.13+i*.01,p.z);o.scale.setScalar(r);o.rotation.y=Math.random()*6.283;o.userData.lpsSkip=1;o.renderOrder=18+i;scene.add(o)});b.rotation.y=a.rotation.y;
  let t=0;const T=life||2.4;kqFx({tick(dt){t+=dt||0;const k=t/T;m.opacity=.95*(k<.15?1:Math.max(0,1-(k-.15)/.85))*(1+.15*Math.sin(t*20));dk.opacity=.6*Math.min(1,(1-k)*2);return k<1},end(){scene.remove(a);scene.remove(b);m.dispose();dk.dispose()}})}
// a vertical shock wall: an open cylinder that expands and fades (the air of a big impact)
function sk146Wall(p,col,r,h,dur){const g=svG('sk_wl',()=>{const q=new THREE.CylinderGeometry(1,1,1,40,1,true);q.translate(0,.5,0);return q}),m=new THREE.MeshBasicMaterial({color:col,map:SPR,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  const o=new THREE.Mesh(g,m);o.position.set(p.x,GH(p.x,p.z),p.z);o.userData.lpsSkip=1;o.renderOrder=22;scene.add(o);let t=0;const T=dur||.5;
  kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/T),s=.4+r*svEase.o(k);o.scale.set(s,(h||2)*(1-k*.6),s);m.opacity=.6*(1-k);return k<1},end(){scene.remove(o);m.dispose()}})}
// a column (geyser of blood / pillar of frost / fire / light): an inner core, an outer twisting sleeve and a crown
function sk146Column(p,col,core,r,h,life){const y0=GH(p.x,p.z),mk=(k,rt,rb)=>svG(k,()=>{const q=new THREE.CylinderGeometry(rt,rb,1,12,4,true);q.translate(0,.5,0);const P=q.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i),a=Math.atan2(P.getZ(i),P.getX(i)),w=1+.18*Math.sin(a*3+y*7);P.setX(i,P.getX(i)*w);P.setZ(i,P.getZ(i)*w)}q.computeVertexNormals();return q});
  const m1=new THREE.MeshBasicMaterial({color:core,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),m2=new THREE.MeshBasicMaterial({color:col,map:SPR,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  const a=new THREE.Mesh(mk('sk_c1',.35,.55),m1),b=new THREE.Mesh(mk('sk_c2',.7,1.0),m2),cr=kqSpr(col,1);cr.material=cr.material.clone();[a,b,cr].forEach(o=>{o.position.set(p.x,y0,p.z);o.userData.lpsSkip=1;o.renderOrder=21;scene.add(o)});
  let t=0;const T=life||.9;
  kqFx({tick(dt){t+=dt||0;const k=t/T,up=Math.sin(Math.min(1,k)*Math.PI),H=h*(k<.3?svEase.o(k/.3):1)*(k>.6?Math.max(.05,1-(k-.6)/.4):1);a.scale.set(r,H,r);b.scale.set(r*(1+.3*k),H*.92,r*(1+.3*k));b.rotation.y+=dt*6;a.rotation.y-=dt*4;
    cr.position.y=y0+H;cr.scale.setScalar(r*3.2*(.5+up));m1.opacity=.9*up;m2.opacity=.7*up;cr.material.opacity=up;if(Math.random()<.6)burst(new THREE.Vector3(p.x,y0+H*Math.random(),p.z),col,1,.8,1.2,.5);return k<1},
    end(){[a,b,cr].forEach(o=>scene.remove(o));m1.dispose();m2.dispose();cr.material.dispose()}})}
// a beam between two points (getters a(), b()) for T seconds (tethers, drains); returns {stop()}
function sk146Beam(a,b,col,w,T){const g=svG('sk_bm',()=>{const q=new THREE.CylinderGeometry(1,1,1,8,1,true);q.translate(0,.5,0);q.rotateX(Math.PI/2);return q}),m=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),
    m2=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  const o=new THREE.Mesh(g,m),c=new THREE.Mesh(g,m2);o.userData.lpsSkip=1;c.userData.lpsSkip=1;o.renderOrder=22;c.renderOrder=23;o.frustumCulled=c.frustumCulled=false;scene.add(o);scene.add(c);let t=0,on=true;
  kqFx({tick(dt){t+=dt||0;if(!on||(T&&t>T))return false;const A=a(),B=b();if(!A||!B)return false;const d=B.distanceTo(A);o.position.copy(A);o.lookAt(B);c.position.copy(A);c.lookAt(B);
    const fl=1+.35*Math.sin(t*23)+.2*Math.sin(t*37);o.scale.set(w*fl,w*fl,d);c.scale.set(w*.3,w*.3,d);m.opacity=.55+.2*Math.sin(t*17);
    if(Math.random()<.5){const q=A.clone().lerp(B,Math.random());burst(q,col,1,.3,.3,.4)}return true},end(){scene.remove(o);scene.remove(c);m.dispose();m2.dispose()}});
  return {stop(){on=false}}}
// a swarm: n small flappers (type 'bat' | 'crow' | 'fly' | 'shard' | 'ember') from a to b over T seconds, wobbling
function sk146SwarmGeo(type){if(SK146.sw[type])return SK146.sw[type];let g;
  if(type==='shard'){g=new THREE.OctahedronGeometry(.5,0);g.scale(.35,1,.35)}else if(type==='ember'||type==='fly'){g=new THREE.OctahedronGeometry(.25,0)}
  else{const P=[0,0,.25, -1,.05,-.1, -.35,0,-.25, 0,0,.25, -.35,0,-.25, 0,0,-.2, 0,0,.25, 1,.05,-.1, .35,0,-.25, 0,0,.25, .35,0,-.25, 0,0,-.2];g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals()}
  return SK146.sw[type]=g}
function sk146Swarm(a,b,n,col,type,T,o){o=o||{};const g=sk146SwarmGeo(type),m=type==='ember'||type==='shard'?new THREE.MeshBasicMaterial({color:col,fog:false}):new THREE.MeshStandardMaterial({color:col,roughness:.8,side:THREE.DoubleSide,flatShading:true,emissive:o.em||0});const L=[];
  for(let k=0;k<n;k++){const ms=new THREE.Mesh(g,m),sc=(o.s||.35)*(.7+Math.random()*.6);ms.scale.setScalar(sc);ms.userData.lpsSkip=1;scene.add(ms);L.push({ms,ph:Math.random()*6.283,off:new THREE.Vector3((Math.random()-.5)*(o.spread||2.5),(Math.random()-.5)*(o.spread||2.5)*.6,(Math.random()-.5)*(o.spread||2.5)),d:Math.random()*.25,sc})}
  let t=0;const A=a.clone?a.clone():a,B=b.clone?b.clone():b,P=new THREE.Vector3(),prev=new THREE.Vector3();
  kqFx({tick(dt){t+=dt||0;let any=false;for(const q of L){const k=Math.max(0,Math.min(1,(t-q.d)/T));if(k<1)any=true;prev.copy(q.ms.position);P.lerpVectors(A,B,svEase.io(k));P.y+=Math.sin(k*Math.PI)*(o.arc||1.5);
      const w=Math.sin(k*Math.PI);P.x+=q.off.x*w+Math.sin(t*5+q.ph)*.3;P.y+=q.off.y*w+Math.sin(t*7+q.ph)*.2;P.z+=q.off.z*w+Math.cos(t*5+q.ph)*.3;q.ms.position.copy(P);
      if(prev.distanceToSquared(P)>1e-6)q.ms.lookAt(P.clone().add(P.clone().sub(prev)));if(type==='bat'||type==='crow'){const f=Math.sin(t*(type==='bat'?28:18)+q.ph);q.ms.scale.set(q.sc*(.4+.6*Math.abs(f)),q.sc,q.sc)}else q.ms.rotation.z+=dt*8;
      q.ms.visible=k>0&&k<1}return any},end(){L.forEach(q=>scene.remove(q.ms));m.dispose()}})}
// weather over a den: 'rain' | 'snow' | 'ash' | 'spores' | 'embers' (points falling inside the den radius); returns {stop(), o}
function sk146Weather(A,kind,col,n){const N=n||600,R=ARENA_R+2,pos=new Float32Array(N*3),vel=new Float32Array(N),y0=GH(A.cx,A.cz);for(let i=0;i<N;i++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R;pos[i*3]=A.cx+Math.cos(a)*r;pos[i*3+1]=y0+Math.random()*12;pos[i*3+2]=A.cz+Math.sin(a)*r;vel[i]=.7+Math.random()*.6}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const sz={rain:.09,snow:.16,ash:.12,spores:.14,embers:.14}[kind]||.12,sp={rain:16,snow:2.2,ash:1.4,spores:.7,embers:-1.6}[kind]||2;
  const m=new THREE.PointsMaterial({color:col,size:sz,map:SPR,transparent:true,opacity:0,depthWrite:false,blending:kind==='ash'?THREE.NormalBlending:THREE.AdditiveBlending,fog:false});
  const o=new THREE.Points(g,m);o.frustumCulled=false;o.userData.lpsSkip=1;o.renderOrder=17;scene.add(o);let on=true,t=0,op=0;
  kqFx({tick(dt){dt=Math.min(.05,dt||0);t+=dt;op+=((on?1:0)-op)*Math.min(1,dt*1.5);m.opacity=.85*op;const P=g.attributes.position.array;
    for(let i=0;i<N;i++){P[i*3+1]-=sp*vel[i]*dt;P[i*3]+=Math.sin(t*.7+i)*dt*(kind==='rain'?0:.4);if(sp>0?P[i*3+1]<y0:P[i*3+1]>y0+12){P[i*3+1]=sp>0?y0+12:y0;}}
    g.attributes.position.needsUpdate=true;if(!on&&op<.02)return false;return true},end(){scene.remove(o);g.dispose();m.dispose()}});
  return {stop(){on=false},o}}
// blade trails throw sparks off the tip while they draw
{const f=svTrail;svTrail=function(e,j,a,b,col,life){const T=f.apply(this,arguments);try{if(T&&e&&e.sv){let on=true,t=0;const st=T.stop;T.stop=function(){on=false;return st.apply(this,arguments)};const v=new THREE.Vector3(),J=e.sv.R.J[j];
    kqFx({tick(dt){t+=dt||0;if(!on||e.dead||!J)return false;if(Math.random()<.85){v.set(a[0],a[1],a[2]);e.m.updateMatrixWorld(true);J.localToWorld(v);burst(v,col,1,1.4,.5,.3)}return t<3},end(){}})}}catch(_){}return T}}
// impacts for every hit that has no effect of its own: a spray of the boss's liquid (or sparks) and a flash where it lands on
// the hero, a puff of debris/sparks along the swing's reach when it misses. o: {liq: droplet colour, sp: spark colour, dust}
function sk146AutoFx(M,o){for(const id in M){const D=M[id];if(!D||!D.hit)continue;D.hit.forEach(h=>{if(h.fx||h.nohit||!(h.dm>0))return;
  h.fx=(c,an,hit)=>{try{const S=h.s,a=an.a||0,fw=S.k==='a'?S.r*.6:S.k==='l'?Math.min(4,S.l*.5):S.k==='r'?(S.r0+S.r)/2:S.r*.5,p=new THREE.Vector3(an.x+Math.sin(a)*fw,0,an.z+Math.cos(a)*fw);
    if(hit){const q=gY(pl.position,1.1);if(o.liq!=null)sk146Drops(q,o.liq,10,3.5,4,{splats:3});burst(q,o.sp||0xffffff,14,3,2,.4);sk146Flash(q,o.sp||0xffffff,2.2,7,260)}
    else{burst(gY(p,.9),o.sp||0xffffff,8,2.2,1,.35);if(o.dust!=null&&(S.k==='c'||S.k==='r'))burst(gY(p,.2),o.dust,10,2,1.2,.6)}}catch(_){}}})}}
// ---------------- 3. signature mechanics ----------------
// damage reduction while channelling (S.dr = share of the damage that still lands); Vorraxis keeps his own (3033)
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.sv&&!e.mb144&&!e.dead&&e.sv.dr>0&&e.sv.dr<1){d=Math.max(1,Math.round(d*e.sv.dr));if(nowP()-(e.sv.drT||0)>700){e.sv.drT=nowP();dn(e.m.position,'Warded','#ffd0a0',-30,600)}}return f.call(this,e,d,s,crit,dot)}}
// den props for a mechanic: list of {x,z,n,frac,mesh,hbY,tick,die}; returns the props (in enemies; dqProp handles kill/clear)
function sk146Props(A,list){const out=[];list.forEach(o=>{try{out.push(dqProp(A,o.x,o.z,o))}catch(err){console.error('v146 prop',err)}});return out}
function sk146Alive(L){return (L||[]).filter(p=>p&&!p.dead&&!p._gone)}
// a tether from a prop to the boss's joint j (stops when either is gone)
function sk146Tether(p,e,j,col,w){return sk146Beam(()=>p.dead||p._gone?null:gY(p.m.position,p.dprop&&p.dprop.cupY||1.6),()=>e.dead?null:svWP(e,j||'chest',0,0,0),col,w||.09)}
// an expanding ring wave (dash through it): from p, radius r0 → r1 over T, band width bw; hits once; returns nothing
function sk146RingWave(e,p,r0,r1,T,bw,dm,col,o){o=o||{};const g=svG('sk_rw',()=>{const q=new THREE.CylinderGeometry(1,1,1,64,1,true);q.translate(0,.5,0);return q}),m=new THREE.MeshBasicMaterial({color:col,map:SPR,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),
    fl=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),fg=new THREE.Mesh(svG('sk_rf',()=>new THREE.RingGeometry(.9,1,64,1).rotateX(-Math.PI/2)),fl);
  const o1=new THREE.Mesh(g,m);o1.position.set(p.x,GH(p.x,p.z),p.z);fg.position.set(p.x,GH(p.x,p.z)+.16,p.z);[o1,fg].forEach(q=>{q.userData.lpsSkip=1;q.renderOrder=22;scene.add(q)});let t=0,hit=false;svSnd('whoosh',1.2,.6);
  kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/T),r=r0+(r1-r0)*k;o1.scale.set(r,(o.h||1.8)*(1-k*.3),r);fg.scale.set(r,1,r);m.opacity=.85*(1-k*.5);fl.opacity=.35*(1-k);
      if(Math.random()<.9){const a=Math.random()*6.283;burst(new THREE.Vector3(p.x+Math.cos(a)*r,GH(p.x,p.z)+.5,p.z+Math.sin(a)*r),col,2,1,1.5,.4)}
      if(!hit&&!e.dead&&hero.hp>0){const d=Math.hypot(pl.position.x-p.x,pl.position.z-p.z);if(Math.abs(d-r)<bw/2+.3){hit=true;svHitNow(e,{k:'c',r:99},{x:p.x,z:p.z,a:0},dm,{flash:false,on:o.on})}}
      return k<1&&!e.dead},end(){scene.remove(o1);scene.remove(fg);m.dispose();fl.dispose()}})}
// the generic "torn out of the channel" stagger (a long one); B = the boss def, pose names from its table
function sk146Broken(B,dur,down,up){return {dur,inv:null,trk:[[.3,down,'o'],[dur-.6,down,'l',.03],[dur,up||'cRec','io']],go(c){const S=c.S;S.stg=c.M.D.dur;S.dr=0;svSnd('stag',1.2,.8);popT(c.m.position,'BROKEN!','#ffd860',true);
    burst(gY(c.m.position,2),0xffe08a,60,4,3,.8);svShock(c.m.position,0xffd860,6,.6);sk146Flash(c.m.position,0xffe0a0,4,12,600);shake(.4)},
  tk(c,dt){c.S.stg=Math.max(0,c.M.D.dur-c.M.t);if(Math.random()<dt*8){const p=svWP(c.e,c.B.headJ||'root',0,0,0);burst(p,0xffe08a,1,.5,.6,.5)}},end(c){c.S.stg=0}}}
// a heal pop (a channel that completed)
function sk146Heal(e,f,col){if(!e||e.dead)return 0;const h=Math.round(M(e.c)*f);e.c.h=Math.min(M(e.c),e.c.h+h);dn(e.m.position,'+'+h,'#ff9a9a',-20,1400);burst(gY(e.m.position,1.8),col||0xff6a6a,50,3,2.5,.8);sk146Flash(e.m.position,col||0xff6a6a,3,12,700);return h}
// ---------------- 4. den state ----------------
function sk146Den(A){return A.s146||(A.s146={objs:[],fx:[],props:[],t:0,ph2:0})}
function sk146DenAdd(A,o){const D=sk146Den(A);D.objs.push(o);if(o.isObject3D&&!o.parent)scene.add(o);return o}
function sk146DenClear(A){const D=A.s146;if(!D)return;D.objs.forEach(o=>{try{if(o.stop)o.stop();else if(o.isObject3D&&o.parent)o.parent.remove(o);if(o.kill)o.kill()}catch(_){}});D.objs=[];
  (D.props||[]).forEach(p=>{try{if(!p._gone)dqPropGone(p,false)}catch(_){}});D.props=[];D.ph2=0;D.t=0;D.sig=null;
  try{dqUndebuff&&D.deb&&dqUndebuff(D.deb)}catch(_){}}
// the boss entity of a den
function sk146Boss(A){try{return bossEnt(A.i)}catch(_){return null}}
// is the hero standing in a den's fight
function sk146In(A){return !!(A&&A.f&&AF===A&&hero.hp>0)}
