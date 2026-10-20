// ================= v86 den 0 — Argus, the Hundred-Eyed: THE DROWNED HOLLOW =================
// A sunken bog hollow in Kindlelight: peat floor, black pools, a wall of arching roots, dead trees and staring eye-growths.
// Mechanics (on top of Argus's pounce/charge/rain/adds/triple):
//  1. Watching Stalks — six eye-stalks ring the hollow. They tremble and part their lids (tell), then sweep a yellow gaze cone
//     across the ground. Standing in a gaze builds SEEN (3 pips); at 3 you are MARKED and Argus leaps on you (red circle).
//     Four root pillars block the gaze (the cone visibly stops at them). Stalks can be struck down (open eyes take +60%);
//     a burst eye makes Argus reel. Phase II/III: more eyes wake at once and burst stalks regrow at each phase change.
//  2. The Great Eye (BMV 'argusgaze') — Argus's brow-eye locks a slow-tracking beam onto you; break line of sight behind a
//     pillar, outrun it, or dash. Standing in it also fills SEEN.
//  3. Phase III — Lights Out: the hollow goes dark around your lantern and Argus melts into the shadows (BMV 'argstalk'),
//     its eyes glint where it will burst out along a red line.
//  Bog pools slow you (Mired) — mind where you dodge.
// Shared helpers for both of my dens (d01*) live here; zzK_den1.js (the Crest Hydra) uses them.
var D01={g:{},m:{}};
function d01Auth(A){try{return !MP.on||mpBossAuth(A.i)===MP.me}catch(_){return true}}
// run a den move as the boss driver so co-op relays it (the kqBmv wrapper only relays from inside the boss AI)
function d01Cast(k,e,A,en){const o=MP.inAI;MP.inAI=1;try{return BMV[k](e,A,en||1)}finally{MP.inAI=o}}
const d01Ad=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
// polar angle (x=cos, z=sin) of the road into the den
function d01Ent(A){const P=PMAP[A.i].path,p=P[Math.max(0,P.length-14)];return Math.atan2(p[1]-A.cz,p[0]-A.cx)}
function d01Cyl(rt,rb,s){const k=rt.toFixed(2)+'|'+rb.toFixed(2)+'|'+(s||6);return D01.g[k]||(D01.g[k]=new THREE.CylinderGeometry(rt,rb,1,s||6,1))}
const D01UP=new THREE.Vector3(0,1,0);
function d01Seg(S,a,b,ra,rb,col,s){const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length();if(L<1e-3)return;d.multiplyScalar(1/L);
  S.geo(d01Cyl(Math.max(.012,rb),Math.max(.012,ra),s),new THREE.Matrix4().compose(new THREE.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),new THREE.Quaternion().setFromUnitVectors(D01UP,d),new THREE.Vector3(1,L,1)),col)}
function d01Bez(p0,p1,p2,n){const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push([0,1,2].map(j=>u*u*p0[j]+2*u*t*p1[j]+t*t*p2[j]))}return o}
// a bent, tapering tube through points (roots, branches, necks); col may be fn(t)
function d01Tube(S,P,r0,r1,col,s,joint){const n=P.length-1;for(let i=0;i<n;i++){const ra=r0+(r1-r0)*i/n,rb=r0+(r1-r0)*(i+1)/n,c=typeof col=='function'?col(i/n):col;
  d01Seg(S,P[i],P[i+1],ra,rb,c,s);if(joint!==false&&i>0)S.geo(ARKG.oct,arkM4(P[i][0],P[i][1],P[i][2],ra*1.02),c)}}
D01.sph=new THREE.SphereGeometry(1,8,6);
function d01Mat(k){if(D01.m[k])return D01.m[k];let m;
  if(k=='glow')m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
  else if(k=='dead')m=new THREE.MeshBasicMaterial({vertexColors:true,color:0x3a3530});
  else if(k=='water')m=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.15,metalness:.4,side:THREE.DoubleSide});
  else if(k=='char')m=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.95,color:0x3a3430,side:THREE.DoubleSide});
  else m=arkMat();
  m.userData.lps=1;return D01.m[k]=m}
// small health bar (the game's own bar), hidden until the thing is hurt
function d01Bar(col){const b=bar(false);b.fill.material.color.setHex(col);b.visible=false;b.scale.setScalar(1.7);return b}
function d01BarSet(b,x,y,z,r){b.visible=true;b.position.set(x,y,z);b.quaternion.copy(cam.quaternion);r=Math.max(.001,r);b.fill.scale.x=r;b.fill.position.x=-(1-r)/2}
function d01Buff(n,i,ms,d,s){const t=nowP()+ms;let b=hero.buffs.find(q=>q.n==n);if(b){b.t=t;b.d=d;return b}b={n,i,s:s||{},t,d};hero.buffs.push(b);hsDirty();return b}
function d01Unbuff(n){const k=hero.buffs.length;hero.buffs=hero.buffs.filter(b=>b.n!=n);if(hero.buffs.length!=k)hsDirty()}
// a ray from (ox,oz) along unit (dx,dz): length until it meets a pillar circle [x,z,r] or leaves the den circle
function d01Clip(ox,oz,dx,dz,L,P,A,R){
  if(A){const fx=ox-A.cx,fz=oz-A.cz,b=fx*dx+fz*dz,c=fx*fx+fz*fz-R*R,h=b*b-c;if(h>0)L=Math.min(L,Math.max(0,-b+Math.sqrt(h)))}
  for(let i=0;i<P.length;i++){const p=P[i],fx=p[0]-ox,fz=p[1]-oz,t=fx*dx+fz*dz;if(t<-p[2]||t-p[2]>L)continue;const q=fx*fx+fz*fz-t*t,r2=p[2]*p[2];if(q<r2){const h=t-Math.sqrt(r2-q);if(h<L)L=Math.max(0,h)}}
  return L}
// a ground fan (gaze cone) whose rays stop at pillars; positions rewritten in place each frame
function d01Fan(n,col,op){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array((n-1)*9),3));
  const m=new THREE.Mesh(g,d01Add(col,op));m.renderOrder=18;m.frustumCulled=false;m.visible=false;m.userData.n=n;return m}
function d01FanSet(m,ox,oz,yaw,half,maxL,P,A,y){const n=m.userData.n,a=m.geometry.attributes.position.array;let px=0,pz=0,k=0;
  for(let i=0;i<n;i++){const ay=yaw+(i/(n-1)*2-1)*half,dx=Math.sin(ay),dz=Math.cos(ay),L=d01Clip(ox,oz,dx,dz,maxL,P,A,ARENA_R+.3),x=ox+dx*L,z=oz+dz*L;
    if(i>0){a[k++]=ox;a[k++]=y;a[k++]=oz;a[k++]=px;a[k++]=y;a[k++]=pz;a[k++]=x;a[k++]=y;a[k++]=z}px=x;pz=z}
  m.geometry.attributes.position.needsUpdate=true}
// a flat strip on the ground from o along yaw (beams)
function d01Strip(col,op){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(18),3));const m=new THREE.Mesh(g,d01Add(col,op));m.renderOrder=18;m.frustumCulled=false;m.visible=false;return m}
function d01StripSet(m,ox,oz,dx,dz,L,w,y){const a=m.geometry.attributes.position.array,nx=-dz*w/2,nz=dx*w/2,ex=ox+dx*L,ez=oz+dz*L;
  const v=[ox+nx,oz+nz,ex+nx,ez+nz,ex-nx,ez-nz,ox+nx,oz+nz,ex-nx,ez-nz,ox-nx,oz-nz];for(let i=0;i<6;i++){a[i*3]=v[i*2];a[i*3+1]=y;a[i*3+2]=v[i*2+1]}m.geometry.attributes.position.needsUpdate=true}
// melee/AoE hits reach den objects (stalks, necks): area() is what every hero swing and splash goes through
function d01InArc(p,r,dir,half,x,z,rad){const dx=x-p.x,dz=z-p.z,L=Math.hypot(dx,dz);if(L>r+rad)return false;
  if(dir&&half<3&&L>.6&&Math.acos(Math.max(-1,Math.min(1,(dx*dir.x+dz*dir.z)/L)))>half+.35)return false;return true}
{const f=area;area=function(p,r,dm,s,dir,half){const out=f.apply(this,arguments);
  try{const A=AF,D=A&&DEN[A.i];if(D&&D.hitA&&A.f&&!(s&&s.cc)&&dm>0&&p)D.hitA(A,p,r,dm,s,dir,half==null?1.2:half)}catch(err){console.error('den hit',err)}return out}}
// a tiny HUD line for den status (below the boss bar)
function d01Hud(html,col){let d=document.getElementById('d01hud');if(!html){if(d)d.style.display='none';return}
  if(!d){d=document.createElement('div');d.id='d01hud';d.style.cssText='margin:6px auto 0;display:inline-block;background:rgba(14,12,8,.84);border:1px solid #8a7a3a;color:#ffe9a8;border-radius:8px;padding:3px 12px;font:700 12px system-ui,sans-serif;pointer-events:none;text-align:center;white-space:nowrap;text-shadow:0 1px 2px #000';($('boss')||document.body).appendChild(d)}
  d.style.display='inline-block';if(d._h!==html){d._h=html;d.innerHTML=html}if(col&&d._c!==col){d._c=col;d.style.borderColor=col}}
// timers that follow the game clock (pauses with the game, works with the test's virtual clock)
function d01After(Q,t,fn){Q.push({t,fn})}
function d01Run(Q,dt){for(let i=Q.length-1;i>=0;i--){const q=Q[i];q.t-=dt;if(q.t<=0){Q.splice(i,1);try{q.fn()}catch(err){console.error('den timer',err)}}}}
// an eye growth: fleshy pustule, glowing eyeball, iris and slit, facing yaw
function d01Eye(S,G,x,y,z,yaw,s,iris,flesh){const fx=Math.sin(yaw),fz=Math.cos(yaw);
  S.geo(D01.sph,arkM4(x,y,z,s,s*.9,s,0,yaw),flesh||0x4a2a34);
  S.geo(ARKG.cyl6,arkM4(x+fx*s*.55,y,z+fz*s*.55,s*.62,s*.18,s*.62,Math.PI/2,yaw),arkShade(flesh||0x4a2a34,.8));
  G.geo(D01.sph,arkM4(x+fx*s*.5,y,z+fz*s*.5,s*.55,s*.5,s*.55,0,yaw),0xd8ccaa);
  G.geo(D01.sph,arkM4(x+fx*s*.98,y,z+fz*s*.98,s*.3,s*.3,s*.1,0,yaw),iris||0xffd040);
  G.geo(ARKG.box,arkM4(x+fx*s*1.06,y,z+fz*s*1.06,s*.07,s*.42,s*.04,0,yaw),0x050302)}

// ---------------- the den ----------------
var AR={st:[],pil:[],pools:[],q:[],seen:0,sN:0,sT:0,ph:1,dk:0,dkT:0,wt:4,beam:null,mark:null,A:null,v:new THREE.Vector3(),o:new THREE.Vector3(),d:new THREE.Vector3()};
const AR_BARK=[0x4a3828,0x3e3022,0x54402e,0x352a1c],AR_MUD=[0x2a2618,0x2e2a1a,0x262214,0x30301c,0x24281a],AR_MOSS=[0x34401e,0x3a4622,0x2e3a1c];
function arPillar(S,G,x,z,R){const y=GH(x,z);
  for(let j=0;j<3;j++){const pts=[];for(let i=0;i<=7;i++){const t=i/7,th=j*2.094+t*2.6,rr=.5*(1-.3*t);pts.push([x+Math.cos(th)*rr,y-.1+t*3.7,z+Math.sin(th)*rr])}
    d01Tube(S,pts,.46,.22,t=>t>.55&&j==1?AR_MOSS[1]:AR_BARK[j],6)}
  for(let k=0;k<6;k++){const a=k/6*6.283+R()*.4;d01Tube(S,d01Bez([x+Math.cos(a)*.4,y+1.2,z+Math.sin(a)*.4],[x+Math.cos(a)*1.15,y+.7,z+Math.sin(a)*1.15],[x+Math.cos(a)*1.75,y-.15,z+Math.sin(a)*1.75],4),.32,.08,AR_BARK[k%4],5)}
  for(let k=0;k<5;k++){const a=k/5*6.283+R(),h=.5+R()*.9;S.geo(ARKG.cone4,arkM4(x+Math.cos(a)*.32,y+3.6+h/2,z+Math.sin(a)*.32,.13,h,.13,Math.sin(a)*.3,0,-Math.cos(a)*.3),k%2?0x4a3a2a:0x5a4a36)}
  // shelf fungus and a staring eye knot
  for(let k=0;k<3;k++){const a=R()*6.283,h=.8+R()*2.2;G.geo(ARKG.cyl6,arkM4(x+Math.cos(a)*.52,y+h,z+Math.sin(a)*.52,.24,.05,.24),0x8ad04a)}
  const a=R()*6.283;d01Eye(S,G,x+Math.sin(a)*.5,y+2.3,z+Math.cos(a)*.5,a,.3,0xffb020)}
function arBuild(A){
  const R=ARK.rng(9100),cx=A.cx,cz=A.cz,y0=GH(cx,cz),ent=d01Ent(A),gap=(a,w)=>Math.abs(d01Ad(a,ent))<(w||.5),P=(a,r)=>[cx+Math.cos(a)*r,cz+Math.sin(a)*r],P3=(a,r,y)=>{const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;return [x,y==null?GH(x,z):y,z]};
  AR.A=A;AR.ent=ent;
  const F=arkSoup(9101),W=arkSoup(9102),G=arkSoup(9103),S=arkSoup(9104);
  // --- root pillars (cover that blocks the gaze) ---
  for(let k=0;k<4;k++){const a=ent+Math.PI/4+k*Math.PI/2+(R()-.5)*.2,[x,z]=P(a,6.4+R()*.6);AR.pil.push([x,z,1.15]);arPillar(S,G,x,z,R);
    for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const tx=Math.round(x)+dx,tz=Math.round(z)+dz;if(Math.hypot(tx-x,tz-z)<1.2)denBlock(tx,tz)}}
  // --- bog floor: a jagged peat disc that sinks into the ground at its rim ---
  const RS=[0,1.5,3,4.5,6,7.5,9,10.5,12,13.4,14.7,15.9,17.2],N=44,vt=RS.map((r,i)=>[...Array(N)].map((_,k)=>{
    const a=(k+.5*(i%2))/N*6.283+(i?(R()-.5)*.07:0),rr=r+(i&&i<RS.length-1?(R()-.5)*.8:0),x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr;
    return [x,i>=RS.length-1?GH(x,z)-.14:GH(x,z)+.04+R()*.05,z]}));
  for(let i=0;i<RS.length-1;i++)for(let k=0;k<N;k++){const a=vt[i][k],b=vt[i][(k+1)%N],c=vt[i+1][(k+1)%N],d=vt[i+1][k],mo=R()<.15+.35*(i/RS.length);
    const col=(mo?AR_MOSS:AR_MUD)[(R()*3)|0];F.tri(a,b,c,col);F.tri(a,c,d,arkShade(col,.9+R()*.18))}
  // --- black pools with a scum rim (wading through them slows you) ---
  for(let t=0;t<80&&AR.pools.length<6;t++){const a=R()*6.283,r=3.4+R()*8.6,[x,z]=P(a,r),pr=1.3+R()*1.1;
    if(AR.pools.some(p=>Math.hypot(p[0]-x,p[1]-z)<p[2]+pr+1.4)||AR.pil.some(p=>Math.hypot(p[0]-x,p[1]-z)<pr+2.1)||(gap(a,.6)&&r>8))continue;AR.pools.push([x,z,pr])}
  AR.pools.forEach(([x,z,pr])=>{const n=11,pts=[...Array(n)].map((_,k)=>{const a=k/n*6.283,rr=pr*(.82+R()*.3);return [Math.cos(a)*rr,Math.sin(a)*rr]}),y=GH(x,z);
    for(let k=0;k<n;k++){const p=pts[k],q=pts[(k+1)%n];W.tri([x,y+.115,z],[x+q[0],y+.115,z+q[1]],[x+p[0],y+.115,z+p[1]],[0x0c1610,0x101c12,0x0a120c][k%3],.2);
      F.quad([x+p[0],y+.105,z+p[1]],[x+q[0],y+.105,z+q[1]],[x+q[0]*1.28,y+.07,z+q[1]*1.28],[x+p[0]*1.28,y+.07,z+p[1]*1.28],AR_MOSS[k%3],.2)}
    // a faint glowing scum line marks each pool in the dark, with glowing algae flecks
    for(let k=0;k<n;k++){const p=pts[k],q=pts[(k+1)%n];G.quad([x+p[0]*.97,y+.118,z+p[1]*.97],[x+q[0]*.97,y+.118,z+q[1]*.97],[x+q[0]*1.06,y+.118,z+q[1]*1.06],[x+p[0]*1.06,y+.118,z+p[1]*1.06],k%2?0x2e5a22:0x37682a,.2)}
    for(let k=0;k<7;k++){const a=R()*6.283,rr=R()*pr*.75,sx=x+Math.cos(a)*rr,sz=z+Math.sin(a)*rr,s=.08+R()*.14;G.tri([sx,y+.125,sz-s],[sx-s,y+.125,sz+s*.6],[sx+s,y+.125,sz+s*.6],k%3?0x3a6a24:0x6a9a34,.2)}
    // drowned snag
    if(R()<.6){const a=R()*6.283;d01Tube(S,d01Bez([x,y-.2,z],[x+Math.cos(a)*.5,y+.9,z+Math.sin(a)*.5],[x+Math.cos(a)*1.1,y+1.3+R(),z+Math.sin(a)*1.1],3),.14,.04,AR_BARK[3],5)}});
  // --- the wall: earth mounds, arching roots, dead trees, glowing fungus and staring eye-growths ---
  for(let a=0;a<6.283;a+=.15){if(gap(a,.46))continue;for(let q=0;q<2;q++){const r=15.2+R()*2.6,[x,z]=P(a+(R()-.5)*.12,r),s=1+R()*1.4,h=.6+R()*1.1+(r-15)*.3;
    S.geo(ARK.rock[(R()*4)|0],arkM4(x,GH(x,z)+h*.3,z,s,h,s*1.1,0,R()*6),(cy,n)=>n.y>.45?AR_MOSS[(R()*3)|0]:AR_MUD[(R()*5)|0])}}
  [-1,1].forEach(sd=>{const a=ent+sd*.52,[x,z]=P(a,15.4);S.geo(ARK.rock[sd>0?1:2],arkM4(x,GH(x,z)+.6,z,1.6,1.8,1.5,0,R()*6),(cy,n)=>n.y>.5?AR_MOSS[0]:0x2a2a22);
    for(let k=0;k<3;k++){const b=a+sd*(.05+k*.06);{const p0=P3(b,17.5),p1=P3(b,16,y0+3.2+k*.5),p2=P3(a+(R()-.5)*.08,14.9,y0-.2);p0[1]-=.2;d01Tube(S,d01Bez(p0,p1,p2,7),.45,.16,AR_BARK[k],6)}}});
  for(let k=0;k<15;k++){const a=ent+.62+k/14*(6.283-1.24)+(R()-.5)*.1,a2=a+(R()-.5)*.4,[x0,z0]=P(a,18.4),[x1,z1]=P((a+a2)/2,16.4),[x2,z2]=P(a2,14.4),h=3+R()*1.8;
    d01Tube(S,d01Bez([x0,GH(x0,z0)-.4,z0],[x1,y0+h*1.6,z1],[x2,y0-.25,z2],9),.62,.2,t=>t>.2&&t<.65&&R()<.5?AR_MOSS[1]:AR_BARK[(R()*3)|0],6);
    if(R()<.6){const [x3,z3]=P(a2+(R()-.5)*.3,13.9);d01Tube(S,d01Bez([x1,y0+h*.75,z1],[(x1+x3)/2,y0+h*.7,(z1+z3)/2],[x3,y0-.1,z3],5),.2,.06,AR_BARK[3],5)}}
  for(let k=0;k<7;k++){const a=ent+.95+k/6*(6.283-1.9)+(R()-.5)*.2,[x,z]=P(a,16.8+R()*1.2),y=GH(x,z),H=5.5+R()*2.5,lx=(R()-.5)*1.2,lz=(R()-.5)*1.2,tr=[];
    for(let i=0;i<=5;i++){const t=i/5;tr.push([x+lx*t*t+Math.sin(t*5+k)*.18,y-.2+H*t,z+lz*t*t+Math.cos(t*4+k)*.18])}
    d01Tube(S,tr,.6,.12,AR_BARK[k%3],6);
    for(let b=0;b<5;b++){const p=tr[2+(b%3)],ba=R()*6.283,L=1.4+R()*1.6,e2=[p[0]+Math.cos(ba)*L,p[1]+.5+R()*1.2,p[2]+Math.sin(ba)*L];
      d01Tube(S,d01Bez(p,[(p[0]+e2[0])/2,p[1]+.6,(p[2]+e2[2])/2],e2,3),.17,.03,AR_BARK[(b+1)%3],5);
      if(R()<.75){const h=1+R()*1.4;S.geo(ARKG.box,arkM4(e2[0],e2[1]-h/2,e2[2],.07,h,.07,0,R()*3),0x56644a)}}
    for(let r=0;r<4;r++){const ra=R()*6.283;d01Tube(S,d01Bez([x,y+.8,z],[x+Math.cos(ra)*.9,y+.3,z+Math.sin(ra)*.9],[x+Math.cos(ra)*1.6,y-.2,z+Math.sin(ra)*1.6],3),.28,.06,AR_BARK[r%3],5)}}
  for(let k=0;k<40;k++){const a=R()*6.283;if(gap(a,.5))continue;const [x,z]=P(a,14.2+R()*1.3),y=GH(x,z);
    for(let m=0;m<2+(R()*3|0);m++){const mx=x+(R()-.5)*.7,mz=z+(R()-.5)*.7,h=.15+R()*.35,s=.08+R()*.12;S.geo(ARKG.cyl5,arkM4(mx,y+h/2,mz,s*.35,h,s*.35),0xb8b090);
      G.geo(ARKG.cone5,arkM4(mx,y+h+s*.25,mz,s,s*.5,s),R()<.5?0xb8ff6a:0x8ae05a)}}
  for(let k=0;k<18;k++){const a=R()*6.283;if(gap(a,.55))continue;const [x,z]=P(a,15+R()*.8),y=GH(x,z)+.6+R()*1.8;
    d01Eye(S,G,x,y,z,Math.atan2(cx-x,cz-z)+(R()-.5)*.6,.22+R()*.25,[0xffd040,0xffa020,0xe8ff60,0xff6a2a][k%4])}
  // --- the eye-stalks (animated, one group each; the meshes share geometry) ---
  {const B=arkSoup(9106);B.geo(ARK.rock[0],arkM4(0,.2,0,1.0,.55,1.0),(cy,n)=>n.y>.5?AR_MOSS[0]:0x3a2830);B.geo(ARK.rock[2],arkM4(.4,.1,-.3,.6,.4,.6),0x4a2c36);
    const sp=d01Bez([0,0,0],[0,1.8,-.15],[0,3.0,.42],6);d01Tube(B,sp,.42,.22,t=>[0x4a2c38,0x3e2430][(t*6|0)%2],7);
    for(let v=0;v<3;v++){const a=v*2.1;d01Tube(B,sp.map((p,i)=>[p[0]+Math.cos(a+i*.5)*(.44-.03*i),p[1],p[2]+Math.sin(a+i*.5)*(.44-.03*i)]),.05,.03,0x7a1a2a,4,false)}
    for(let k=0;k<4;k++){const a=k*1.57+.4;d01Tube(B,d01Bez([0,.4,0],[Math.cos(a)*.8,.4,Math.sin(a)*.8],[Math.cos(a)*1.4,-.1,Math.sin(a)*1.4],3),.18,.05,0x3e2430,5)}
    const E=arkSoup(9107);E.geo(D01.sph,arkM4(0,0,0,.56),0xe0d4b4);E.geo(D01.sph,arkM4(0,0,.42,.36,.36,.16),0xb87808);E.geo(D01.sph,arkM4(0,0,.47,.3,.3,.12),0xffd040);E.geo(ARKG.box,arkM4(0,0,.58,.07,.4,.04),0x050302);
    for(let k=0;k<5;k++){const a=k*1.25;E.geo(ARKG.box,arkM4(Math.cos(a)*.3,Math.sin(a)*.3,.43,.02,.2,.02,0,0,a),0xa02020)}
    const LU=arkSoup(9108),LL=arkSoup(9109);LU.geo(new THREE.SphereGeometry(.63,10,5,0,6.283,0,Math.PI/2),arkM4(0,0,0,1),0x4e2e3a);LL.geo(new THREE.SphereGeometry(.62,10,5,0,6.283,Math.PI/2,Math.PI/2),arkM4(0,0,0,1),0x48283a);
    const gB=B.mesh().geometry,gE=E.mesh().geometry,gU=LU.mesh().geometry,gL=LL.mesh().geometry;
    for(let k=0;k<6;k++){const a=ent+.78+k/5*(6.283-1.56),[x,z]=P(a,12.9),y=GH(x,z),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=Math.atan2(cx-x,cz-z);
      const body=new THREE.Mesh(gB,d01Mat('std'));body.castShadow=true;g.add(body);
      const eye=new THREE.Group();eye.position.set(0,3.25,.5);g.add(eye);const ball=new THREE.Mesh(gE,d01Mat('glow'));eye.add(ball);
      const lu=new THREE.Mesh(gU,d01Mat('std')),ll=new THREE.Mesh(gL,d01Mat('std'));eye.add(lu,ll);
      const spr=kqSpr(0xffd040,1.4);spr.position.set(0,0,.7);spr.visible=false;eye.add(spr);
      const fan=d01Fan(20,0xffe060,.3*arFanK());A.g.add(g,fan);
      denBlock(x,z);
      AR.st.push({i:k,g,eye,ball,lu,ll,spr,fan,x,z,gy:g.rotation.y,ox:x+Math.sin(g.rotation.y)*.5,oz:z+Math.cos(g.rotation.y)*.5,st:'closed',t:0,hp:1,hpM:1,lid:0,hb:d01Bar(0xffd040),p:new THREE.Vector3(x,y+3.25,z),hit:0})}}
  // --- the seal: roots that knot across the entrance ---
  {const L=arkSoup(9110);for(let k=0;k<5;k++){const h=.8+k*.55,s=k%2?1:-1,[x0,z0]=P(ent-.56*s,15.6),[x1,z1]=P(ent+.56*s,15.6),[xm,zm]=P(ent+(R()-.5)*.2,14.3+R()*.6);
      d01Tube(L,d01Bez([x0,y0-.3,z0],[xm,y0+h*2,zm],[x1,y0+h*.6,z1],9),.42-.04*k,.2,AR_BARK[k%3],6)}
    for(let k=0;k<9;k++){const a=ent-.46+k/8*.92,[x,z]=P(a,14.5+R()*1.2),h=2.4+R()*1.4,b=a+(R()-.5)*.2;
      const pts=d01Bez([x,y0-.3,z],[x+(R()-.5),y0+h*.6,z+(R()-.5)],P3(b,14.8,y0+h),5);d01Tube(L,pts,.32,.04,AR_BARK[(k+1)%3],5);
      for(let t=1;t<5;t+=2){const p=pts[t];L.geo(ARKG.cone4,arkM4(p[0],p[1],p[2],.07,.35,.07,R()*2,R()*6,R()*2),0x5a4a36)}
      if(k%3==1){const p=pts[3];d01Eye(L,L,p[0],p[1],p[2],Math.atan2(cx-p[0],cz-p[2]),.22,0xffd040)}}
    const m=L.mesh();m.scale.y=.02;m.visible=false;A.g.add(m);AR.seal=m}
  // --- dynamic: the Great Eye's beam, the stalker's glinting eyes, the MARKED sigil ---
  AR.bm=d01Strip(0xffd040,.5);AR.bm3=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),d01Add(0xffe080,.55));AR.bm3.renderOrder=19;AR.bm3.visible=false;AR.bm3.frustumCulled=false;A.g.add(AR.bm,AR.bm3);
  AR.eyes=new THREE.Group();[-.32,.32].forEach(o=>{const s=kqSpr(0xffd040,.7);s.position.x=o;AR.eyes.add(s)});AR.eyes.visible=false;A.g.add(AR.eyes);
  AR.wisp=[];for(let k=0;k<7;k++){const a=ent+.8+k/6*(6.283-1.6),[x,z]=P(a,14.6+R()*1.5),w=kqSpr(k%2?0xb8ff6a:0x9adf5a,.9);w.position.set(x,y0+1.5,z);w.userData.b=[x,z,R()*6];A.g.add(w);AR.wisp.push(w)}
  AR.mk=kqSpr(0xff3a2a,1.4);AR.mk.visible=false;A.g.add(AR.mk);
  // static meshes: floor, pool water, glow (eyes/fungus), scenery
  const fm=F.mesh(d01Mat('std'));fm.castShadow=false;fm.receiveShadow=true;const wm=W.mesh(d01Mat('water'));wm.castShadow=false;
  const gm=G.mesh(d01Mat('glow'));gm.castShadow=false;gm.receiveShadow=false;A.g.add(fm,wm,gm,S.mesh(d01Mat('std')));
  // idle: stalks sway and look about, lids blink, while nobody fights here
  TANIM.push({x:cx,z:cz,f:now=>{AR.wisp.forEach(w=>{const b=w.userData.b;w.position.set(b[0]+Math.sin(now/2100+b[2])*.6,y0+1.3+Math.sin(now/900+b[2])*.4,b[1]+Math.cos(now/1900+b[2])*.6)});if(A.f)return;AR.st.forEach((T,i)=>{if(T.st!='closed')return;T.g.rotation.z=Math.sin(now/900+i*1.7)*.035;T.eye.rotation.y=Math.sin(now/1700+i)*.5;
    const bl=(Math.sin(now/2300+i*2.3)>.97)?0:.55;T.lid+=(bl-T.lid)*.15;arLids(T,T.lid)})}});
}
function arLids(T,k){T.lu.rotation.x=-1.25*k;T.ll.rotation.x=1.0*k}
function arReset(T){T.st='closed';T.t=0;T.spr.visible=false;T.fan.visible=false;T.hb.visible=false;T.ball.material=d01Mat('glow');T.g.rotation.set(0,T.gy,0);T.eye.scale.setScalar(1);T.eye.rotation.y=0;T.lid=0;arLids(T,0)}

// ---------------- moves ----------------
// one relayed move per stalk, so a co-op partner sees the same eyes wake
for(let k=0;k<6;k++)kqBmv('arEye'+k,function(e,A,en){const T=AR.st[k];if(T&&A.i===0&&T.st=='closed'){T.st='wake';T.t=0;T.spr.visible=true;T.spr.scale.setScalar(.3);burst(T.p,0xffd040,10,1,1,.5)}return {d:0,lock:0}});
// the Great Eye: a slow-tracking beam from Argus's brow, stopped by root pillars
kqBmv('argusgaze',function(e,A,en){const o=e.m.position;AR.beam={warm:1.05*en,t:e.bs.ph>=3?3.2:2.5,yaw:Math.atan2(pl.position.x-o.x,pl.position.z-o.z),tick:0,e};
  e.bs.face=1;kqBossCast(e,0xffd040,1000*en);say('👁 Argus opens its Great Eye — break line of sight behind a root pillar!');sfx('power',.6);return {d:1.05*en+AR.beam.t+.5,lock:1}});
// Lights Out: melt into the dark, then burst out along a red line from where its eyes glint
kqBmv('argstalk',function(e,A,en){if(e.hid)return {d:.5,lock:0};bxHide(e,true);burst(gY(e.m.position,1),0x14140c,40,3,2,.9);burst(gY(e.m.position,1.6),0xffd040,16,2,1,.5);
  say('👁 Argus melts into the dark… watch for its eyes!');
  d01After(AR.q,1.1*en,()=>{if(!A.f||e.dead){bxHide(e,false);return}const a=Math.atan2(pl.position.z-A.cz,pl.position.x-A.cx)+Math.PI+(Math.random()-.5)*1.4,sx=A.cx+Math.cos(a)*12.3*DK,sz=A.cz+Math.sin(a)*12.3*DK;
    const dx=pl.position.x-sx,dz=pl.position.z-sz,dl=Math.hypot(dx,dz)||1,d=V(dx/dl,0,dz/dl),L=Math.min(25,dl+7);AR.eyes.position.set(sx,GH(sx,sz)+2.3,sz);AR.eyes.rotation.y=Math.atan2(d.x,d.z);AR.eyes.visible=true;
    tele(V(sx,0,sz),0,.95*en,()=>{AR.eyes.visible=false;if(!A.f||e.dead){bxHide(e,false);return}e.m.position.set(sx,0,sz);bxHide(e,false);e.m.rotation.y=Math.atan2(d.x,d.z);
      e.bs.dash={x:d.x,z:d.z,t:L/22,h:0,sp:22};burst(gY(e.m.position,1),0xffd040,30,4,2,.6);shake(.2);sfx('boom',.5)},{w:2.8,l:L,d})});
  return {d:(1.1+.95+1.3)*en,lock:1}});
// Argus's movement and pool: the Great Eye replaces the generic beam; Phase III adds the stalk from the dark
BSTY[0].pool=[['pounce','charge','argusgaze'],['rain','adds'],['triple','argusgaze','argstalk']];

// ---------------- the fight ----------------
function arStart(A,e){AR.st.forEach(T=>{arReset(T);T.hpM=T.hp=Math.round(paceM0(e.c)*.03)});AR.q.length=0;AR.seen=0;AR.sN=0;AR.ph=1;AR.wt=3.5;AR.beam=null;AR.mark=null;AR.dkT=0;AR.n=0;
  setTimeout(()=>{if(A.f)say('👁 The Drowned Hollow. Its eye-stalks watch — hide behind the root pillars, and strike the stalks down.')},1400)}
function arPhase(A,e,ph){const dead=AR.st.filter(T=>T.st=='dead');
  dead.forEach(T=>{arReset(T);T.hp=T.hpM;T.g.scale.setScalar(.1);burst(T.p,0x7ac84a,20,2,2,.6);tw(900,k=>T.g.scale.setScalar(.1+.9*k))});
  if(dead.length)say('🌱 The hollow sprouts new eyes!');
  if(ph>=3){AR.dkT=1;AR.wt=Math.min(AR.wt,4);setTimeout(()=>{if(A.f)banner('👁 LIGHTS OUT','The Drowned Hollow sinks into darkness','Only your lantern — and its eyes — remain')},1400)}}
function arEyeYaw(T){return Math.atan2(pl.position.x-T.ox,pl.position.z-T.oz)}
function arStalk(A,e,T,dt,now,ph){
  if(T.hit>0){T.hit-=dt;T.g.rotation.x=-.12*Math.sin(T.hit*40)}else if(T.st!='dead')T.g.rotation.x=0;
  if(T.hb.visible||(T.hp<T.hpM&&T.st!='dead'))d01BarSet(T.hb,T.x,GH(T.x,T.z)+4.7,T.z,T.hp/T.hpM);
  if(T.st=='closed'){T.g.rotation.z=Math.sin(now/900+T.i*1.7)*.03;T.lid+=(0-T.lid)*Math.min(1,dt*6);arLids(T,T.lid);return false}
  if(T.st=='dead')return false;
  const half=.27,y=GH(T.ox,T.oz)+.2;
  if(T.st=='wake'){T.t+=dt;const k=Math.min(1,T.t/(1.15*PACE.W));T.g.rotation.z=Math.sin(now/28)*.06*k;T.lid=.35*k;arLids(T,T.lid);T.spr.scale.setScalar(.4+1.6*k);
    const yw=arEyeYaw(T);T.eye.rotation.y=Math.max(-1.1,Math.min(1.1,d01Ad(yw,T.gy)));
    T.fan.visible=true;T.fan.material.opacity=arFanK()*(.05+.07*(Math.sin(now/70)*.5+.5));d01FanSet(T.fan,T.ox,T.oz,T.gy+T.eye.rotation.y,half,26*DK,AR.pil,A,y);
    if(k>=1){T.st='open';T.t=0;T.dur=[4.2,4.6,5][ph-1];const sw=ph>=3?1.6:1.3,sd=Math.random()<.5?1:-1;T.y0=yw-sd*sw/2;T.y1=yw+sd*sw/2;sfx('zap',.35)}
    return false}
  if(T.st=='open'){T.t+=dt;const u=Math.min(1,T.t/T.dur),s=u*u*(3-2*u),yaw=T.y0+(T.y1-T.y0)*s;T.g.rotation.z=Math.sin(now/300+T.i)*.02;T.lid+=(1-T.lid)*Math.min(1,dt*8);arLids(T,T.lid);
    T.eye.rotation.y=Math.max(-1.3,Math.min(1.3,d01Ad(yaw,T.gy)));const wy=T.gy+T.eye.rotation.y;T.fan.visible=true;T.fan.material.opacity=arFanK()*(.3+.06*Math.sin(now/90));
    d01FanSet(T.fan,T.ox,T.oz,wy,half,26*DK,AR.pil,A,y);T.spr.scale.setScalar(1.8+.3*Math.sin(now/80));
    if(u>=1){T.st='shut';T.t=0;T.fan.visible=false;T.spr.visible=false}
    // is the hero in this gaze, with nothing in between?
    const dx=pl.position.x-T.ox,dz=pl.position.z-T.oz,L=Math.hypot(dx,dz);if(L<.5||hero.hp<=0)return false;
    if(Math.abs(d01Ad(Math.atan2(dx,dz),wy))>half)return false;return d01Clip(T.ox,T.oz,dx/L,dz/L,26*DK,AR.pil,null,0)>=L-.3}
  if(T.st=='shut'){T.t+=dt;T.lid=Math.max(0,1-T.t/.5);arLids(T,T.lid);if(T.t>=.5){T.st='closed';T.eye.rotation.y=0}return false}
  return false}
function arHitStalk(A,T,dm){if(T.st=='dead')return;const open=T.st=='open'||T.st=='wake',d=Math.max(1,Math.round(dm*.8*(open?1.6:1)));T.hp-=d;T.hit=.18;
  dn(T.p,(open?'👁 ':'')+d,open?'#ffd040':'#c8b890',-10,700);burst(T.p,open?0xffd040:0x8a3a4a,8,2,1,.4);if(T.hp<=0)arKillStalk(A,T)}
function arKillStalk(A,T){T.st='dead';T.hp=0;T.fan.visible=false;T.spr.visible=false;T.hb.visible=false;T.ball.material=d01Mat('dead');T.lid=.6;arLids(T,.6);
  tw(500,k=>{T.g.rotation.x=.55*k;T.eye.scale.setScalar(1-.35*k)});burst(T.p,0xffd040,40,4,3,.8);burst(T.p,0x5a1020,30,3,2,.7);ring(V(T.x,0,T.z),0xffd040,3,350);shake(.15);sfx('brk',.6);
  popT(T.p,'EYE BURST!','#ffd040',true);const e=bossEnt(A.i);if(e&&!e.dead){hurt(e,Math.round(M(e.c)*.025),{col:0xffd040});e.bs.t=Math.max(e.bs.t,1)+.8;burst(gY(e.m.position,1.6),0xffd040,20,2,2,.5)}
  if(!AR.n++)say('👁 An eye-stalk bursts — Argus reels!')}
function arMark(A,e,auth){AR.mark={t:0,done:false};popT(pl.position,'👁 MARKED!','#ff5a3a',true);say('👁 You are MARKED — Argus leaps for you! Get out of the red circle!');sfx('horn',.5);shake(.12)}
function arLeap(A,e){const q=inArena(A,pl.position.clone());AR.pil.forEach(p=>{const dx=q.x-p[0],dz=q.z-p[1],l=Math.hypot(dx,dz);if(l<p[2]+1.4){q.x=p[0]+dx/(l||1)*(p[2]+1.4);q.z=p[1]+dz/(l||1)*(p[2]+1.4)}});
  tele(q,3,1.0*PACE.W,()=>{if(AR.mark)AR.mark=null;if(!A.f)return;ring(q,0xffd040,7,400);burst(gY(q,.4),0xffd040,40,4,3,.7);shake(.3);if(d2(pl.position,q)<3&&hero.iv<=0)bossHit(e,1.5)});
  jumpTo(e,q,1.0*PACE.W,5.5);e.bs.lock=Math.max(e.bs.lock,1.9);e.bs.t=Math.max(e.bs.t,2*PACE.I);e.bs.last='pounce'}
// a non-driving co-op player: the open eyes strike at the marked spot instead of Argus leaping
function arBolts(A,e){const q=pl.position.clone(),src=AR.st.find(T=>T.st=='open')||AR.st.find(T=>T.st!='dead');if(src)kqFall(A,q,1.0*PACE.W,0xffd040,'orb',1.2,src.p);
  tele(q,2.6,1.0*PACE.W,()=>{if(AR.mark)AR.mark=null;if(!A.f)return;ring(q,0xffd040,5,350);burst(gY(q,.4),0xffd040,30,3,3,.6);if(d2(pl.position,q)<2.6&&hero.iv<=0)bossHit(e,1.3)})}
function arBeamTick(A,e,dt,now){const b=AR.beam,m=e.m,bs=m.bs||3,ph=e.bs.ph;
  const ty=Math.atan2(pl.position.x-m.position.x,pl.position.z-m.position.z),turn=(b.warm>0?4:ph>=3?1.2:.85)*dt,dy=d01Ad(ty,b.yaw);b.yaw+=Math.max(-turn,Math.min(turn,dy));m.rotation.y=b.yaw;
  const dx=Math.sin(b.yaw),dz=Math.cos(b.yaw),ox=m.position.x+dx*.4*bs,oz=m.position.z+dz*.4*bs,L=d01Clip(ox,oz,dx,dz,26*DK,AR.pil,A,ARENA_R+.3),gy=GH(ox,oz);
  const w=b.warm>0?.22:1.5;d01StripSet(AR.bm,ox,oz,dx,dz,L,w,gy+.2);AR.bm.visible=true;AR.bm.material.opacity=b.warm>0?.35+.25*Math.sin(now/50):.55;
  const ey=gy+Math.min(5,.85*bs),ex=ox+dx*L,ez=oz+dz*L;AR.bm3.visible=b.warm<=0;AR.bm3.position.set((ox+ex)/2,(ey+gy+.6)/2,(oz+ez)/2);AR.o.set(ex,gy+.6,ez);AR.bm3.lookAt(AR.o);
  AR.bm3.scale.set(.35+.08*Math.sin(now/40),.35,Math.hypot(L,ey-gy-.6));
  let hit=false;
  if(b.warm>0){b.warm-=dt;return false}
  b.t-=dt;b.tick-=dt;if(Math.random()<.6){AR.v.set(ox+dx*L*Math.random(),gy+.4,oz+dz*L*Math.random());burst(AR.v,0xffd040,2,.6,1.2,.3)}
  AR.o.set(ox,0,oz);AR.d.set(dx,0,dz);if(inLine(pl.position,AR.o,AR.d,L,1.6)&&hero.hp>0){hit=true;if(b.tick<=0&&hero.iv<=0){b.tick=.3;bossHit(e,.42)}}
  if(b.t<=0){AR.beam=null;AR.bm.visible=AR.bm3.visible=false;e.bs.face=0}
  return hit}
function arTick(A,e,dt,now){
  const ph=e.bs.ph,auth=d01Auth(A);
  if(ph!==AR.ph){if(ph>AR.ph)arPhase(A,e,ph);AR.ph=ph}
  d01Run(AR.q,dt);
  // the driver decides which eyes wake (relayed to co-op partners)
  if(auth&&!e.dead){AR.wt-=dt;if(AR.wt<=0){const free=AR.st.filter(T=>T.st=='closed');let n=Math.min(ph,free.length);
    while(n-->0){const T=free.splice(Math.random()*free.length|0,1)[0];d01Cast('arEye'+T.i,e,A,1)}AR.wt=([8.5,8,7.2][ph-1]+Math.random()*1.5)*PACE.I}}
  let seen=false;for(let i=0;i<AR.st.length;i++)if(arStalk(A,e,AR.st[i],dt,now,ph))seen=true;
  if(AR.beam){if(e.dead||e.hid){AR.beam=null;AR.bm.visible=AR.bm3.visible=false;e.bs.face=0}else if(arBeamTick(A,e,dt,now))seen=true}
  // SEEN stacks → MARKED → Argus leaps
  if(seen){AR.seen+=dt*(ph>=3?2.1:1.75);AR.sT=now}else if(now-AR.sT>700)AR.seen=Math.max(0,AR.seen-dt*.5);
  const sn=Math.floor(AR.seen);if(sn>AR.sN&&sn<3)popT(pl.position,'👁 SEEN '+sn+'/3','#ffd040');AR.sN=sn;
  if(AR.seen>=3&&!AR.mark&&hero.hp>0){AR.seen=0;AR.sN=0;arMark(A,e)}
  if(AR.mark){const k=AR.mark;k.t+=dt;AR.mk.visible=true;AR.mk.position.set(pl.position.x,pl.position.y+3.1+.15*Math.sin(now/90),pl.position.z);AR.mk.scale.setScalar(1.2+.3*Math.sin(now/70));
    if(!k.done){if(!auth){k.done=true;arBolts(A,e)}else if((!e.jmp&&!e.hid&&!e.bs.dash&&!e.spin&&!e.fly&&(!AR.beam)&&(e.bs.lock<=.05||k.t>1.6))){k.done=true;if(AR.beam){AR.beam=null;AR.bm.visible=AR.bm3.visible=false;e.bs.face=0}arLeap(A,e)}}
    if(k.t>4)AR.mark=null}else AR.mk.visible=false;
  if(seen&&Math.random()<.25)burst(gY(pl.position,1.2),0xffd040,1,.4,.6,.4);
  // strikes from range
  d01Shots(AR.shot||(AR.shot=(p,dm)=>{for(const T of AR.st){if(T.st=='dead')continue;if(Math.hypot(p.x-T.x,p.z-T.z)<1.1||Math.hypot(p.x-T.ox,p.z-T.oz)<.9){arHitStalk(AR.A,T,dm);return true}}return false}));
  // bog pools: wading slows
  let mired=false;for(const p of AR.pools)if(Math.hypot(pl.position.x-p[0],pl.position.z-p[1])<p[2]*.9){mired=true;break}
  if(mired){if(!AR.mired)popT(pl.position,'Mired!','#8aa060');d01Buff('Mired','🟫',400,'Wading through bog water: slowed',{mspd:-.3})}AR.mired=mired;
  // HUD (a few times a second)
  AR.hT=(AR.hT||0)-dt;if(AR.hT<=0||AR.mark){AR.hT=.12;const alive=AR.st.filter(T=>T.st!='dead').length,pip=[0,1,2].map(i=>AR.seen>=i+1?'<b style="color:#ff6a3a">◉</b>':AR.seen>i?'<b style="color:#ffd040">◍</b>':'<span style="opacity:.45">○</span>').join(' ');
  d01Hud(AR.mark?'<b style="color:#ff5a3a">👁 MARKED — MOVE!</b>':'👁 Seen '+pip+' &nbsp;·&nbsp; Eye-stalks '+alive+'/6'+(seen?' &nbsp;<b style="color:#ffd040">IN GAZE</b>':''),AR.mark?'#ff5a3a':seen?'#ffd040':'#8a7a3a');}
  AR.dkT=ph>=3?1:0}
function arClear(A,won){AR.q.length=0;AR.st.forEach(arReset);AR.beam=null;AR.bm.visible=AR.bm3.visible=false;AR.mark=null;AR.mk.visible=false;AR.eyes.visible=false;AR.seen=0;AR.dkT=0;
  d01Hud(null);d01Unbuff('Mired');const e=bossEnt(A.i);if(e){e.bs.face=0;if(e.hid)bxHide(e,false)}}
function arSeal(A,on){const m=AR.seal;if(!m)return;const y0=GH(A.cx,A.cz);
  if(on){m.visible=true;const s0=m.scale.y;tw(800,k=>m.scale.y=s0+(1-s0)*(1-Math.pow(1-k,3)));for(let k=0;k<8;k++){const a=AR.ent-.45+k/7*.9;burst(V(A.cx+Math.cos(a)*15*DK,y0+.4,A.cz+Math.sin(a)*15*DK),0x3a2c20,10,2,3,.6)}shake(.2)}
  else{const s0=m.scale.y;tw(700,k=>m.scale.y=Math.max(.02,s0*(1-k)),()=>{if(!AR.A.f)m.visible=false})}}
// the boss's own floating health bar is hidden in the den (the top boss bar shows its health; up close it covered the view)
DEN[0]={build:arBuild,start:arStart,tick:arTick,clear:arClear,seal:arSeal,
  ai(A,e){if(e.hb)e.hb.visible=false;return false},
  hitA(A,p,r,dm,s,dir,half){for(const T of AR.st){if(T.st=='dead')continue;if(d01InArc(p,r,dir,half,T.x,T.z,1.0))arHitStalk(A,T,dm)}}};
// Lights Out: dim the world toward the lantern while the hollow is dark
{const f=atmos;atmos=function(dt,now){f.apply(this,arguments);
  try{AR.dk+=((AR.dkT&&AF&&AF.i===0?1:0)-AR.dk)*Math.min(1,(dt||.016)*.8);const k=AR.dk;if(k<.004)return;
    sun.intensity*=1-.85*k;hemi.intensity*=1-.75*k;scene.fog.color.multiplyScalar(1-.6*k);scene.fog.density+=.03*k;scene.background=scene.fog.color;
    torch.intensity=Math.max(torch.intensity,1.2)*(1+.6*k);if(typeof POST!='undefined'&&POST.u){POST.u.vig.value+=1.1*k;POST.u.ex.value*=1-.18*k}}catch(_){}}}

