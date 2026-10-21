// ================= v110: Sovereigns fight like souls bosses — the shared engine =================
// Every Sovereign (BOSSES[i], registered as SVB[i] by the files after this one) gets:
//  * a new hand-built model: rigid parts hung on named joints (R.J), faceted low-poly, glowing accents. It sits inside the
//    old enemy group e.m (scaled 1/e.m.bs so the model is authored in world units); the old skinned body is hidden.
//  * an animator: a procedural base layer (idle breathing, walking, slithering, floating: B.loco) and an action layer
//    (keyframed tracks of poses: [time, pose, ease]); the action fades in over the base and back out.
//  * moves = timelines: wind-up (the readable tell, often with a held trembling key and a glow), strike (a few frames:
//    the hit is checked once, at that moment, so a dash through it with i-frames is a clean dodge — and a Perfect Dodge),
//    recovery (the punish window). A move turns toward you only until its lock moment, then commits.
//    Ground warnings: area / ranged attacks show the standard red warning for their whole wind-up; melee swings only show a
//    faint outline in the last fraction of a second, so the animation is the tell. Every hit leaves a short flash of the
//    area it covered (learn the reach) and most swings draw a weapon trail.
//  * a pattern AI per boss: moves are chosen by range and angle (in front / behind) with cooldowns and fixed combo
//    strings, so the same situation brings the same few answers — learnable.
//  * poise: damage fills a posture meter (yellow bar under the boss bar); when it breaks the boss is STAGGERED for a
//    couple of seconds and takes +35% damage. Big moves have armour (the break waits until the move ends).
//  * two phases: at B.ph2 health the boss performs an awakening (invulnerable, a roar and a push-back shockwave), changes
//    its look, gains new moves and rests less between attacks.
// The den hazards of v86 (eye-stalks, necks from the water, cold, quicksand, rot, chalices, …) are switched off: the den
// is the stage (its scenery, seal and colliders stay), the boss is the fight.
// Co-op: the boss driver (mpBossAuth) picks every move and relays it as BMV 'sv<i>_<move>' with a seed; partners play
// the same timeline (same random choices) and are hit on their own screens. Root motion keeps the partner's own copy in
// step (the position sync pauses while a move moves the boss).
var SVB=[];         // per boss index: the boss definition (build, poses, moves, loco, ai)
var SVX={on:true,gc:{},log:[],st:{casts:0,hits:0,stag:0},V:[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()]};
// ---------------- small maths ----------------
var svEase={l:k=>k,i:k=>k*k*k,o:k=>1-Math.pow(1-k,3),io:k=>k*k*(3-2*k),s:k=>1-Math.pow(1-k,5),b:k=>{const c=1.7;return 1+(c+1)*Math.pow(k-1,3)+c*Math.pow(k-1,2)}};
function svRng(seed){let s=Math.floor(Math.abs(+seed||1)*7919)%2147483646+1;return ()=>((s=s*16807%2147483647)-1)/2147483646}
function svAng(a){return Math.atan2(Math.sin(a),Math.cos(a))}
function svYawTo(m,p){return Math.atan2(p.x-m.position.x,p.z-m.position.z)}
// ---------------- geometry kit (cached: one copy per key) ----------------
function svG(k,f){return SVX.gc[k]||(SVX.gc[k]=(()=>{const g=f();g.userData.lps=1;return g})())}
// a loft along +Y: rings = [[y, rx, rz, ox, oz], ...]; n sides; faceted (non-indexed); caps at both ends
function svLoft(rings,n,o){o=o||{};const pos=[],R=rings.map(([y,rx,rz,ox,oz])=>{const a=[];for(let i=0;i<n;i++){const t=(i/n)*Math.PI*2+(o.rot||0);a.push([(ox||0)+Math.sin(t)*rx,y,(oz||0)+Math.cos(t)*rz])}return a});
  const dsc=rings[rings.length-1][0]<rings[0][0],tri=(a,b,c)=>{if(dsc){const q=b;b=c;c=q}pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2])};
  for(let r=0;r<R.length-1;r++)for(let i=0;i<n;i++){const j=(i+1)%n,a=R[r][i],b=R[r][j],c=R[r+1][j],d=R[r+1][i];tri(a,b,c);tri(a,c,d)}
  if(o.cap!==false){const c0=[R[0].reduce((s,p)=>s+p[0],0)/n,rings[0][0]-(o.tip0||0)*(dsc?-1:1),R[0].reduce((s,p)=>s+p[2],0)/n],L=R[R.length-1],y1=rings[rings.length-1][0],c1=[L.reduce((s,p)=>s+p[0],0)/n,y1+(o.tip||0)*(dsc?-1:1),L.reduce((s,p)=>s+p[2],0)/n];
    for(let i=0;i<n;i++){const j=(i+1)%n;tri(c0,R[0][j],R[0][i]);tri(c1,L[i],L[j])}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g}
// a loft along +Z (for necks, tails, snouts): rings = [[z, rx, ry, ox, oy], ...]
function svLoftZ(rings,n,o){const g=svLoft(rings.map(([z,rx,ry,ox,oy])=>[z,rx,ry,ox,-(oy||0)]),n,o);g.rotateX(Math.PI/2);g.computeVertexNormals();return g}
// a tube along a 3D path: pts = [[x,y,z],...], rad = number or [r per point] (or [rx,ry] pairs); n sides; caps
function svTube(pts,rad,n,o){o=o||{};const V3=THREE.Vector3,P=pts.map(p=>new V3(p[0],p[1],p[2])),N=P.length,pos=[],R=[];let up=new V3(0,1,0);
  for(let i=0;i<N;i++){const t=new V3().subVectors(P[Math.min(N-1,i+1)],P[Math.max(0,i-1)]).normalize();if(Math.abs(t.dot(up))>.95)up=new V3(1,0,0);
    const b=new V3().crossVectors(t,up).normalize(),u=new V3().crossVectors(b,t).normalize();up=u.clone();
    const r=Array.isArray(rad)?rad[i]:rad,rx=Array.isArray(r)?r[0]:r,ry=Array.isArray(r)?r[1]:r,ring=[];
    for(let k=0;k<n;k++){const a=k/n*Math.PI*2;ring.push(new V3().copy(P[i]).addScaledVector(b,Math.cos(a)*rx).addScaledVector(u,Math.sin(a)*ry))}R.push(ring)}
  const tri=(a,b,c)=>pos.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);
  for(let i=0;i<N-1;i++)for(let k=0;k<n;k++){const j=(k+1)%n,a=R[i][k],b=R[i][j],c=R[i+1][j],d=R[i+1][k];tri(a,c,b);tri(a,d,c)}
  if(o.cap!==false){for(let k=0;k<n;k++){const j=(k+1)%n;tri(P[0],R[0][k],R[0][j]);tri(P[N-1],R[N-1][j],R[N-1][k])}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g}
// a tapered horn / claw / spike curving along a quadratic path: base radius r, length l, bend (x,y) at the tip
function svHorn(r,l,bx,by,n,seg){seg=seg||5;const pos=[];const P=[];for(let s=0;s<=seg;s++){const t=s/seg,rr=r*(1-t*.94);P.push({c:[bx*t*t,by*t*t,l*t],r:rr})}
  const ring=(p,k)=>{const a=[];for(let i=0;i<(n||5);i++){const t=i/(n||5)*Math.PI*2;a.push([p.c[0]+Math.cos(t)*p.r,p.c[1]+Math.sin(t)*p.r,p.c[2]])}return a};
  const R=P.map(ring),tri=(a,b,c)=>pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]),N=n||5;
  for(let s=0;s<seg;s++)for(let i=0;i<N;i++){const j=(i+1)%N,a=R[s][i],b=R[s][j],c=R[s+1][j],d=R[s+1][i];tri(a,b,c);tri(a,c,d)}
  const tip=[bx*1.1,by*1.1,l*1.04];for(let i=0;i<N;i++)tri(R[seg][i],R[seg][(i+1)%N],tip);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g}
// a jittered rock / crystal / lump
function svLump(r,det,j,seed){const g=new THREE.IcosahedronGeometry(r,det||0),P=g.attributes.position,rn=svRng(seed||3);for(let i=0;i<P.count;i++){const k=1+(rn()-.5)*(j||.3);P.setXYZ(i,P.getX(i)*k,P.getY(i)*k,P.getZ(i)*k)}
  const ng=g.index?g.toNonIndexed():g;ng.computeVertexNormals();return ng}
// a flat blade (sword / scythe / cleaver): outline points [x,y] in the XY plane, thickness th
function svBlade(pts,th){const s=new THREE.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));const g=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:th*.6,bevelSize:th*.5,bevelSegments:1});g.translate(0,0,-th/2);g.computeVertexNormals();return g}
// ---------------- rig building ----------------
function svRig(){return {root:new THREE.Group(),J:{},mats:[],glow:[],fx:[]}}
function svMat(R,col,o){const m=new THREE.MeshStandardMaterial(Object.assign({color:col,roughness:.82,metalness:.08,flatShading:true},o||{}));m.userData.e0=m.emissive.getHex();m.userData.ei0=m.emissiveIntensity;R.mats.push(m);return m}
function svGlowMat(R,col,op){const m=new THREE.MeshBasicMaterial({color:col,transparent:op!=null,opacity:op==null?1:op,fog:false});m.userData.c0=col;R.glow.push(m);return m}
function svJ(R,name,parent,x,y,z,rx,ry,rz){const g=new THREE.Group();g.name=name;g.position.set(x||0,y||0,z||0);g.rotation.set(rx||0,ry||0,rz||0);(parent?(typeof parent=='string'?R.J[parent]:parent):R.root).add(g);R.J[name]=g;return g}
function svM(R,j,geo,mat,x,y,z,rx,ry,rz,sx,sy,sz){const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.rotation.set(rx||0,ry||0,rz||0);if(sx!=null)m.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);m.castShadow=true;m.receiveShadow=false;
  (typeof j=='string'?R.J[j]:j).add(m);m.userData.lpsSkip=1;return m}
// glow sprite fixed to a joint (eyes, embers, charge-ups); returns the sprite (its .material is shared per colour)
function svSpr(R,j,col,s,x,y,z){const o=kqSpr(col,s);o.position.set(x||0,y||0,z||0);(typeof j=='string'?R.J[j]:j).add(o);o.userData.s0=s;return o}
function svRest(R){for(const k in R.J){const g=R.J[k];g.userData.p0=g.position.clone();g.userData.r0=new THREE.Vector3(g.rotation.x,g.rotation.y,g.rotation.z)}}
// ---------------- poses and tracks ----------------
// a pose is {joint:[rx,ry,rz] or [rx,ry,rz,px,py,pz]} of offsets from the rest pose. Name ending in '~' = mirrored
// (joints whose names end in L/R swap, and ry, rz, px flip).
function svMir(name){const L=name[name.length-1];return L==='L'?name.slice(0,-1)+'R':L==='R'?name.slice(0,-1)+'L':name}
function svPose(B,p){if(!p)return {};if(typeof p!=='string')return p;const c=B._pc||(B._pc={});if(c[p])return c[p];
  let o;if(p[p.length-1]==='~'){const s=svPose(B,p.slice(0,-1));o={};for(const k in s){const v=s[k].slice();v[1]=-v[1];v[2]=-v[2];if(v.length>3)v[3]=-v[3];o[svMir(k)]=v}}
  else{o=B.P[p];if(!o){console.warn('sv pose',p);o={}}}return c[p]=o}
// sample a track [{t,p,e,tr}] at time t into out (map of 6-arrays); the snapshot S.snap is the implicit key at t=0
function svSample(B,S,trk,t,out,now){for(const k in out)out[k]=null;
  let i=0;while(i<trk.length&&trk[i][0]<=t)i++;
  const a=i===0?S.snap:svPose(B,trk[i-1][1]),ta=i===0?0:trk[i-1][0];
  if(i>=trk.length){svCopy(out,a,1);svTrem(out,trk[trk.length-1],now);return out}
  const k1=trk[i],b=svPose(B,k1[1]),u=Math.max(0,Math.min(1,(t-ta)/Math.max(1e-4,k1[0]-ta))),f=(svEase[k1[2]||'io']||svEase.io)(u);
  const ks=new Set(Object.keys(a).concat(Object.keys(b)));
  for(const k of ks){const va=a[k],vb=b[k],o=out[k]||(out[k]=[0,0,0,0,0,0]);for(let q=0;q<6;q++){const x=va&&va[q]!=null?va[q]:0,y=vb&&vb[q]!=null?vb[q]:0;o[q]=x+(y-x)*f}}
  if(i>0&&trk[i-1][3]&&trk[i-1][1]===k1[1])svTrem(out,trk[i-1],now);return out}
function svCopy(out,a,w){for(const k in a){const v=a[k],o=out[k]||(out[k]=[0,0,0,0,0,0]);for(let q=0;q<6;q++)o[q]=v[q]!=null?v[q]*w:0}}
// a held key with a 4th field = tremble amount (shaking with effort before a big strike)
function svTrem(out,key,now){const a=key&&key[3];if(!a)return;let n=0;for(const k in out){const o=out[k];if(!o)continue;o[0]+=Math.sin(now/27+n)*a*.6;o[2]+=Math.cos(now/31+n*1.7)*a*.5;n++}}
// ---------------- warnings (red ground shapes) and hit shapes ----------------
// shape: {k:'c',r} circle · {k:'r',r0,r} ring · {k:'a',r,h,r0} cone (half-angle h) · {k:'l',w,l} line forward
// anchor: {x,z,a} (a = yaw: forward = (sin a, cos a), right = (cos a, -sin a))
function svIn(S,an,p,pad){pad=pad==null?.35:pad;const dx=p.x-an.x,dz=p.z-an.z,d=Math.hypot(dx,dz),aa=an.a||0;
  if(S.k==='c')return d<S.r+pad;if(S.k==='r')return d>S.r0-pad&&d<S.r+pad;
  const fz=dx*Math.sin(aa)+dz*Math.cos(aa),fx=dx*Math.cos(aa)-dz*Math.sin(aa);
  if(S.k==='a')return d<S.r+pad&&d>(S.r0||0)-pad&&(d<.8||Math.abs(Math.atan2(fx,fz))<S.h+pad/Math.max(1,d));
  if(S.k==='l')return fz>-pad-(S.b||0)&&fz<S.l+pad&&Math.abs(fx)<S.w/2+pad;return false}
// flat shape points in local (u = right, v = forward): returns {pos:[u,v,...], idx}
function svShapeUV(S,k){const P=[],I=[];k=k==null?1:k;
  const sector=(r0,r1,a0,a1,nr,na)=>{for(let i=0;i<=nr;i++)for(let j=0;j<=na;j++){const r=r0+(r1-r0)*i/nr,a=a0+(a1-a0)*j/na;P.push(Math.sin(a)*r,Math.cos(a)*r)}
    for(let i=0;i<nr;i++)for(let j=0;j<na;j++){const A=i*(na+1)+j,B=A+1,C=A+na+1,D=C+1;I.push(A,C,B,B,C,D)}};
  if(S.k==='c')sector(0,S.r*k,-Math.PI,Math.PI,Math.max(2,Math.round(S.r*k*.9)),Math.max(20,Math.round(S.r*8)));
  else if(S.k==='r')sector(S.r0,S.r0+(S.r-S.r0)*k,-Math.PI,Math.PI,Math.max(1,Math.round((S.r-S.r0)*.8)),Math.max(24,Math.round(S.r*8)));
  else if(S.k==='a')sector(S.r0||0,(S.r0||0)+(S.r-(S.r0||0))*k,-S.h,S.h,Math.max(2,Math.round(S.r*.9)),Math.max(6,Math.round(S.h*S.r*2.4)));
  else if(S.k==='l'){const nl=Math.max(2,Math.round(S.l*k*.8)),b=-(S.b||0);for(let i=0;i<=nl;i++)for(let j=0;j<=2;j++)P.push(-S.w/2+S.w*j/2,b+(S.l*k-b)*i/nl);
    for(let i=0;i<nl;i++)for(let j=0;j<2;j++){const A=i*3+j,B=A+1,C=A+3,D=C+1;I.push(A,C,B,B,C,D)}}
  return {P,I}}
function svShapeGeo(S,an,k,lift){const {P,I}=svShapeUV(S,k),pos=new Float32Array(P.length/2*3),ca=Math.cos(an.a||0),sa=Math.sin(an.a||0);
  for(let i=0;i<P.length/2;i++){const u=P[i*2],v=P[i*2+1],x=an.x+u*ca+v*sa,z=an.z-u*sa+v*ca;pos[i*3]=x;pos[i*3+1]=GH(x,z)+(lift||.15);pos[i*3+2]=z}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(I);g.computeBoundingSphere();g.userData.lps=1;return g}
// a warning that fills over T seconds (game time); returns {kill()}
function svWarn(S,an,T,o){o=o||{};const D=(typeof KQ!='undefined'&&KQ.dim)||1,faint=!!o.faint,col=o.col||0xd01808;
  const mA=teleMat(col,(faint?.12:.3)*D),mF=teleMat(o.fc||0xff3010,(faint?.08:.16)*D),a=teleMesh(svShapeGeo(S,an,1),mA,20);let f=null,last=-1,t=0,dead=false;scene.add(a);
  let edge=null,mE=null;if(S.k==='c'||S.k==='r'){mE=teleMat(col===0xd01808?0xff2a10:col,faint?.4:.9);const eS={k:'r',r0:S.r*.95,r:S.r};edge=teleMesh(svShapeGeo(eS,an,1,.16),mE,21);scene.add(edge)}
  const W={o:a,f:null,edge,r:S.r||0,line:S.k!=='c',T,t:0,pos:{x:an.x,z:an.z},id:++DTL.n,sv:1};DTL.live.push(W);
  const kill=()=>{if(dead)return;dead=true;scene.remove(a);a.geometry.dispose();mA.dispose();if(f){scene.remove(f);f.geometry.dispose()}mF.dispose();if(edge){scene.remove(edge);edge.geometry.dispose();mE.dispose()}const j=DTL.live.indexOf(W);if(j>=0)DTL.live.splice(j,1)};
  kqFx({tick(dt){if(dead)return false;t+=dt||0;W.t=t;const k=Math.min(1,t/Math.max(.05,T)),q=Math.round((.12+.88*k)*16)/16;
    if(q!==last){last=q;if(f){scene.remove(f);f.geometry.dispose()}f=teleMesh(svShapeGeo(S,an,q,.155),mF,20);scene.add(f);W.f=f}
    mF.opacity=((faint?.06:.16)+(faint?.16:.34)*k)*D;if(mE)mE.opacity=(faint?.35:.9)*(k<.75?1:.8+.2*Math.abs(Math.sin(t*18)));
    if(t>=T+.02){kill();return false}return true},end:kill});
  return {kill}}
// the area a hit covered, flashed in the boss colour (learn the reach)
function svFlash(S,an,col,ms){const m=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide,fog:false});
  const o=teleMesh(svShapeGeo(S,an,1,.18),m,22);scene.add(o);let t=0;const T=(ms||320)/1000;
  kqFx({tick(dt){t+=dt||0;m.opacity=.42*(1-t/T);return t<T},end(){scene.remove(o);o.geometry.dispose();m.dispose()}})}
// ---------------- effects (all on the game clock) ----------------
// weapon trail: a ribbon between two points on a joint, sampled every frame while the move is in [t0,t1]
function svTrail(e,j,a,b,col,life){const S=e.sv,R=S.R,J=R.J[j];if(!J)return null;const N=18,pos=new Float32Array(N*2*3),g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));const al=new Float32Array(N*2*3);g.setAttribute('color',new THREE.BufferAttribute(al,3));
  const I=[];for(let i=0;i<N-1;i++){const A=i*2;I.push(A,A+1,A+2,A+1,A+3,A+2)}g.setIndex(I);g.userData.lps=1;
  const m=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  const o=new THREE.Mesh(g,m);o.frustumCulled=false;o.renderOrder=23;o.userData.lpsSkip=1;scene.add(o);
  const L=[],va=new THREE.Vector3(),vb=new THREE.Vector3(),c=new THREE.Color(col);let on=true,fade=0;const LF=life||.16;
  const T={stop(){on=false},o};
  kqFx({tick(dt){dt=dt||0;if(on&&!e.dead&&e.m.parent){e.m.updateMatrixWorld(true);va.set(a[0],a[1],a[2]);vb.set(b[0],b[1],b[2]);J.localToWorld(va);J.localToWorld(vb);L.unshift({a:va.clone(),b:vb.clone(),t:0});if(L.length>N)L.pop()}
    for(const q of L)q.t+=dt;while(L.length&&L[L.length-1].t>LF)L.pop();if(!on)fade+=dt;
    for(let i=0;i<N;i++){const q=L[Math.min(i,L.length-1)];if(!q){pos.fill(0);break}const k=Math.max(0,1-q.t/LF)*(1-Math.min(1,fade/.2));
      pos.set([q.a.x,q.a.y,q.a.z,q.b.x,q.b.y,q.b.z],i*6);al.set([c.r*k,c.g*k,c.b*k,c.r*k*.15,c.g*k*.15,c.b*k*.15],i*6)}
    g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;g.computeBoundingSphere();return on||fade<.25},end(){scene.remove(o);g.dispose();m.dispose()}});return T}
// expanding shockwave ring on the ground
function svShock(p,col,r,dur,w){const g=svG('shk',()=>new THREE.RingGeometry(.86,1,48,1).rotateX(-Math.PI/2)),m=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  const o=new THREE.Mesh(g,m);o.position.set(p.x,GH(p.x,p.z)+.2,p.z);o.renderOrder=22;o.userData.lpsSkip=1;scene.add(o);let t=0;const T=dur||.5;
  kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/T),s=.3+r*svEase.o(k);o.scale.set(s,1+(w||0),s);m.opacity=.85*(1-k);return k<1},end(){scene.remove(o);m.dispose()}})}
// a soft ground decal (scorch, frost, ichor, blood) that fades over life seconds
function svDecal(p,col,r,life,op){const g=svG('dec',()=>new THREE.CircleGeometry(1,20).rotateX(-Math.PI/2)),m=new THREE.MeshBasicMaterial({color:col,map:SPR,transparent:true,opacity:op||.55,depthWrite:false,fog:false});
  const o=new THREE.Mesh(g,m);o.position.set(p.x,GH(p.x,p.z)+.12,p.z);o.scale.setScalar(r);o.renderOrder=18;o.userData.lpsSkip=1;scene.add(o);let t=0;const T=life||3;
  kqFx({tick(dt){t+=dt||0;m.opacity=(op||.55)*Math.min(1,(T-t)/Math.min(1,T*.4));return t<T},end(){scene.remove(o);m.dispose()}});return o}
// a spike (ice, bone, rock, blood) bursting out of the ground and sinking back
function svSpike(p,mat,h,r,life,tilt){const g=svG('spk',()=>{const q=new THREE.ConeGeometry(1,1,5,1);q.translate(0,.5,0);return q.toNonIndexed()}),o=new THREE.Mesh(g,mat);
  const y0=GH(p.x,p.z);o.position.set(p.x,y0-h,p.z);o.scale.set(r,h,r);o.rotation.set((Math.random()-.5)*(tilt||.4),Math.random()*6,(Math.random()-.5)*(tilt||.4));o.castShadow=true;o.userData.lpsSkip=1;scene.add(o);let t=0;const T=life||1.4;
  kqFx({tick(dt){t+=dt||0;const up=Math.min(1,t/.09),dn=t>T-.35?(t-(T-.35))/.35:0;o.position.y=y0-h+h*svEase.o(up)-h*1.05*svEase.i(Math.min(1,dn));return t<T},end(){scene.remove(o)}});return o}
// a projectile flying from a to b over T seconds (arc height h), glow sprite + particle trail; onEnd at arrival
function svShot(a,b,T,col,sz,h,onEnd,mesh){const o=mesh||kqSpr(col,sz||1.2);o.position.copy(a);scene.add(o);let t=0;const s=a.clone(),ar=new THREE.Vector3();
  kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/T);ar.lerpVectors(s,b,k);ar.y+=Math.sin(k*Math.PI)*(h||0);if(mesh){const d=ar.clone().sub(o.position);if(d.lengthSq()>1e-6)o.lookAt(o.position.clone().add(d))}o.position.copy(ar);if(Math.random()<.7)burst(ar,col,1,.3,.2,.35);
    if(k>=1){try{onEnd&&onEnd(ar)}catch(err){console.error('sv shot',err)}return false}return true},end(){scene.remove(o)}});return o}
// a glow that swells on a joint for T seconds (the charge-up tell)
function svCharge(e,j,col,s,T,x,y,z){const R=e.sv.R;const o=svSpr(R,j,col,.01,x,y,z);let t=0;
  kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/T);o.scale.setScalar(.05+s*svEase.o(k)*(1+.12*Math.sin(t*30)));if(Math.random()<.4){const p=new THREE.Vector3();o.getWorldPosition(p);burst(p,col,1,.4,.4,.3)}return t<T&&!e.dead},end(){if(o.parent)o.parent.remove(o)}});return o}
// world position of a point on a joint
function svWP(e,j,x,y,z,out){out=out||new THREE.Vector3();const J=e.sv.R.J[j];out.set(x||0,y||0,z||0);if(!J)return out.copy(e.m.position);e.m.updateMatrixWorld(true);return J.localToWorld(out)}
// ---------------- sound (synthesised on the game's audio bus) ----------------
function svSnd(k,vol,pitch){try{if(SET.sfx===false)return;const a=AUD;if(!a||a.state!='running'||!NOISE)return;const t=a.currentTime;vol=(vol||1)*.9;const p=pitch||1;
  const env=(g,v,at,dec,hold)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol,t+at);if(hold)g.gain.setValueAtTime(v*vol,t+at+hold);g.gain.exponentialRampToValueAtTime(.001,t+at+(hold||0)+dec)};
  const osc=(type,f0,f1,dur,v,at,hold,vib)=>{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f0*p,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1*p),t+(hold||0)+dur);
    if(vib){const l=a.createOscillator(),lg=a.createGain();l.frequency.value=vib;lg.gain.value=f0*p*.06;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+(hold||0)+dur+.1)}
    env(g,v,at||.01,dur,hold);o.connect(g);g.connect(a.out);o.start(t);o.stop(t+(at||.01)+(hold||0)+dur+.05)};
  const noise=(ft,f0,f1,dur,v,q,at,hold)=>{const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NOISE;s.loop=true;f.type=ft;f.frequency.setValueAtTime(f0*p,t);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1*p),t+(hold||0)+dur);f.Q.value=q||1;
    env(g,v,at||.005,dur,hold);s.connect(f);f.connect(g);g.connect(a.out);s.start(t);s.stop(t+(at||.005)+(hold||0)+dur+.05)};
  ({roar:()=>{osc('sawtooth',95,55,1.1,.22,.12,.3,7);osc('sawtooth',142,80,1,.12,.1,.3,5);noise('lowpass',900,240,1.2,.35,1,.15,.25)},
    shriek:()=>{osc('sawtooth',620,380,.8,.1,.05,.15,11);osc('square',930,600,.7,.05,.05,.1,9);noise('bandpass',3000,1600,.8,.18,3,.05,.1)},
    whoosh:()=>{noise('bandpass',500,2600,.22,.42,1.2,.04)},
    swing:()=>{noise('bandpass',1800,500,.18,.5,1.6,.01);osc('triangle',300,120,.12,.08)},
    heavy:()=>{osc('sine',90,32,.6,.75);noise('lowpass',1300,90,.55,.6,1,.004);osc('triangle',60,30,.4,.3)},
    crack:()=>{noise('highpass',2600,1200,.14,.5,1,.002);osc('square',240,90,.1,.12)},
    charge:()=>{osc('sawtooth',110,440,.1,.08,.6,.0,6);osc('sine',220,880,.1,.1,.6);noise('bandpass',600,2400,.1,.12,4,.6)},
    hum:()=>{osc('sine',160,150,.6,.14,.25,.4,4);osc('triangle',320,300,.6,.06,.25,.4)},
    hiss:()=>{noise('highpass',4200,2800,.6,.3,1,.08,.15)},
    splash:()=>{noise('lowpass',2400,300,.5,.45,1,.005);osc('sine',220,70,.3,.2)},
    bell:()=>{osc('sine',196,196,1.6,.16,.005);osc('sine',392,392,1.2,.08,.005);osc('sine',588,580,.9,.05,.005)},
    ice:()=>{osc('sine',1800,2400,.25,.07,.002);osc('sine',2600,3100,.2,.05,.03);noise('highpass',5000,3000,.25,.18,1,.002)},
    squelch:()=>{noise('lowpass',700,140,.35,.5,2,.01);osc('sine',140,60,.3,.25)},
    blood:()=>{noise('bandpass',900,300,.4,.35,2,.01);osc('sawtooth',180,60,.4,.07)},
    step:()=>{osc('sine',70,40,.22,.35);noise('lowpass',500,100,.2,.2)},
    stag:()=>{osc('square',300,120,.5,.08);noise('bandpass',1600,400,.4,.3,2);osc('sine',80,40,.5,.4)},
    gong:()=>{osc('sine',110,104,2.4,.3,.005);osc('sine',165,160,2,.12,.005);osc('triangle',220,210,1.8,.08,.005);noise('lowpass',600,100,.6,.2,1,.005)}})[k]?.()}catch(_){}}
// fewer draw calls: the static meshes hanging on the same joint with the same material become one mesh (flat shading
// needs positions only). Meshes that animate on their own (userData.noMerge) stay separate.
function svMerge(R){let n0=0,n1=0;const parents=new Set();R.root.traverse(o=>{if(o.isMesh&&o.parent)parents.add(o.parent)});
  parents.forEach(P=>{const by=new Map();P.children.slice().forEach(o=>{if(!o.isMesh||o.userData.noMerge||!o.geometry||!o.geometry.attributes.position)return;n0++;const k=o.material.uuid;if(!by.has(k))by.set(k,[]);by.get(k).push(o)});
    by.forEach(L=>{if(L.length<2){n1+=L.length;return}let tot=0;const parts=L.map(o=>{o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,a=g.attributes.position;tot+=a.count;return {a,m:o.matrix,tmp:g!==o.geometry?g:null}});
      const pos=new Float32Array(tot*3),v=new THREE.Vector3();let j=0;parts.forEach(q=>{for(let i=0;i<q.a.count;i++){v.fromBufferAttribute(q.a,i).applyMatrix4(q.m);pos[j++]=v.x;pos[j++]=v.y;pos[j++]=v.z}if(q.tmp)q.tmp.dispose()});
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.computeVertexNormals();g.userData.lps=1;g.userData.svOwn=1;
      const m=new THREE.Mesh(g,L[0].material);m.castShadow=true;m.userData.lpsSkip=1;L.forEach(o=>P.remove(o));P.add(m);n1++})});
  R.mergeN=[n0,n1];return R.mergeN}
// ---------------- the boss state ----------------
function svAuth(e){try{return !(MP&&MP.on)||!AF||AF.i!==e.ar||mpBossAuth(e.ar)===MP.me}catch(_){return true}}
function svMake(e,i){const B=SVB[i];if(!B)return;const m=e.m;
  m.children.forEach(o=>{o.visible=false});
  const R=svRig();B.build(R,e);svRest(R);try{svMerge(R)}catch(err){console.error('sv merge',err)}const bs=m.bs||m.scale.x||1;R.root.scale.setScalar(1/bs);R.root.name='sv'+i;m.add(R.root);
  const O={};for(const k in R.J)O[k]=[0,0,0,0,0,0];
  e.sv={i,B,R,O,P:{},snap:{},aw:0,trk:null,tt:0,mv:null,ph:1,rest:1.5,last:[],cd:{},po:0,poT:0,stg:0,inv:0,spd:0,lp:m.position.clone(),hero:1,body:B.body||2.2,on:false,wait:0,act:0,fl:0};
  B.init&&B.init(e,R);svApply(e,0,performance.now())}
// apply the pose layers to the joints
function svApply(e,dt,now){const S=e.sv,R=S.R,B=S.B,O=S.O;for(const k in O){const o=O[k];o[0]=o[1]=o[2]=o[3]=o[4]=o[5]=0}
  try{B.loco&&B.loco(e,S,O,dt,now)}catch(err){if(!SVX.le){SVX.le=1;console.error('sv loco',err)}}
  const act=!!(S.mv||S.stgM||S.dieM);S.aw+=((act?1:0)-S.aw)*Math.min(1,dt*(act?16:6));if(dt===0)S.aw=act?1:0;
  if(S.trk&&S.aw>.001){const P=svSample(B,S,S.trk,S.tt,S.P,now),w=S.aw;for(const k in P){const p=P[k],o=O[k];if(!p||!o)continue;for(let q=0;q<6;q++)o[q]+=(p[q]-o[q])*w}}
  else if(S.aw<=.001)S.trk=null;
  for(const k in O){const g=R.J[k],o=O[k],r0=g.userData.r0,p0=g.userData.p0;g.rotation.set(r0.x+o[0],r0.y+o[1],r0.z+o[2]);g.position.set(p0.x+o[3],p0.y+o[4],p0.z+o[5])}
  // the hit flash: every lit material glows briefly
  const fx=e.m.flT?(now-e.m.flT)/200:2,fl=fx>=0&&fx<1?(1-fx)*(1-fx):0;if(Math.abs(fl-S.fl)>.01||(fl===0&&S.fl!==0)){S.fl=fl;const W=SVX.fw||(SVX.fw=new THREE.Color(0xffd8b0));for(const m of R.mats){m.emissive.setHex(m.userData.e0);if(fl>0)m.emissive.lerp(W,fl*.6);m.emissiveIntensity=1}}
  try{B.post&&B.post(e,S,dt,now)}catch(err){if(!SVX.lp){SVX.lp=1;console.error('sv post',err)}}}
function svSnapNow(S){S.snap={};for(const k in S.O)S.snap[k]=S.O[k].slice()}
// ---------------- moves ----------------
// move def: {dur, trk, trn:[[t0,t1,rate]], rm:[[t0,t1,dist|'tgt',ease,stop]], hit:[{t,s,dm,w,o,col,kb,fx,faint}], ev:[[t,fn]], tk(c,dt), armor, inv:[t0,t1],
//            r:[min,max] range, a:'f'|'b'|'s'|'any', wt, cd, ph, nx:[[id,p]], rec (extra rest), mel (melee: faint warnings)}
function svStart(e,id,seed){const S=e.sv;if(!S||e.dead)return false;const D=S.B.M[id];if(!D){console.warn('sv move',id);return false}
  svEndMove(e,true);svSnapNow(S);const now=performance.now();
  S.mv={id,D,t:0,seed:seed||1,rnd:svRng(seed||1),done:new Set(),warn:[],an:{},fx:[],tr:[]};S.trk=D.trk;S.tt=0;S.cd[id]=(D.cd||0);S.last.unshift(id);S.last.length=4;SVX.st.casts++;
  if(SVX.log.length<3000)SVX.log.push([S.i,id,+((typeof PACE!='undefined'&&PACE.clk)||0).toFixed(2)]);
  const c=svCtx(e);try{D.go&&D.go(c)}catch(err){console.error('sv go',id,err)}return true}
function svCtx(e){const S=e.sv,M=S.mv;const A=ARN[S.i];
  return {e,S,M,A,B:S.B,R:S.R,m:e.m,t:M?M.t:0,rnd:M?M.rnd:Math.random,
    fwd(o){o=o||new THREE.Vector3();const a=e.m.rotation.y;return o.set(Math.sin(a),0,Math.cos(a))},
    at(f,x){const a=e.m.rotation.y,p=e.m.position;return new THREE.Vector3(p.x+Math.sin(a)*(f||0)+Math.cos(a)*(x||0),0,p.z+Math.cos(a)*(f||0)-Math.sin(a)*(x||0))},
    hero(){return pl.position},wp(j,x,y,z){return svWP(e,j,x,y,z)},inA(p,mg){return inArena(A,p,mg==null?1.2:mg)},
    hit(s,an,dm,o){return svHitNow(e,s,an,dm,o||{})}}}
function svEndMove(e,silent){const S=e.sv;if(!S||!S.mv)return;const M=S.mv;if(silent)M.warn.forEach(w=>w&&w.kill&&w.kill());M.tr.forEach(t=>t&&t.stop&&t.stop());M.fx.forEach(f=>{try{f()}catch(_){}});
  try{M.D.end&&M.D.end(svCtx(e),silent)}catch(err){console.error('sv end',err)}S.mv=null;S.rmOn=0}
function svAnchor(e,h,c){const m=e.m,a=m.rotation.y;
  if(h.o==='tgt'){const p=c.inA(pl.position.clone(),.6);return {x:p.x,z:p.z,a:svYawTo(m,p)}}
  if(typeof h.o==='function'){const r=h.o(c);return {x:r.x,z:r.z,a:r.a!=null?r.a:a}}
  const f=h.f||0,x=h.x||0;return {x:m.position.x+Math.sin(a)*f+Math.cos(a)*x,z:m.position.z+Math.cos(a)*f-Math.sin(a)*x,a:a+(h.ay||0)}}
function svHitNow(e,s,an,dm,o){const S=e.sv;if(!AF||AF.i!==S.i||e.dead)return false;let hit=false;
  if(o.flash!==false)svFlash(s,an,o.col||S.B.col,o.fms);
  if(hero.hp>0&&svIn(s,an,pl.position,o.pad)){hit=true;SVX.st.hits++;if(o.pre)try{o.pre()}catch(_){}
    const iv=hero.iv>0;bossHit(e,dm);
    if(!iv&&hero.hp>0){if(o.kb){const dx=pl.position.x-an.x,dz=pl.position.z-an.z,l=Math.hypot(dx,dz)||1,A=ARN[S.i],q=inArena(A,pl.position.clone().add(new THREE.Vector3(dx/l*o.kb,0,dz/l*o.kb)),1);pl.step={x:(q.x-pl.position.x)/(o.kb||1),z:(q.z-pl.position.z)/(o.kb||1),t:.22,sp:(o.kb||1)/.22}}
      if(o.on)try{o.on()}catch(err){console.error('sv on hit',err)}}}
  return hit}
function svTickMove(e,dt,now){const S=e.sv,M=S.mv;if(!M)return;const D=M.D,m=e.m,t0=M.t,t1=t0+dt;M.t=t1;S.tt=t1;const c=svCtx(e);c.t=t1;
  // facing: turn toward the hero inside the turn windows
  const trn=D.trn||[[0,D.lock!=null?D.lock:.35,S.B.turnA||4]];for(const w of trn)if(t1>w[0]&&t0<w[1]){const da=svAng(svYawTo(m,pl.position)-m.rotation.y);m.rotation.y+=Math.max(-w[2]*dt,Math.min(w[2]*dt,da))}
  // root motion along the facing
  S.rmOn=0;if(D.rm)for(const r of D.rm){if(t1<=r[0]||t0>=r[1])continue;S.rmOn=1;
    if(M.an['rm'+r[0]]==null){const L=d2(pl.position,m.position);M.an['rm'+r[0]]=typeof r[2]==='number'?r[2]:Math.max(0,Math.min(r[5]||99,L-(r[4]||S.body+1.2)))}
    const dist=M.an['rm'+r[0]],E=svEase[r[3]||'io'],k0=Math.max(0,(t0-r[0])/(r[1]-r[0])),k1=Math.min(1,(t1-r[0])/(r[1]-r[0])),dd=dist*(E(k1)-E(k0)),a=m.rotation.y;
    walkM(m,Math.sin(a)*dd,Math.cos(a)*dd)}
  // warnings, then the hits
  if(D.hit)D.hit.forEach((h,i)=>{const w=h.w!=null?h.w:(D.mel||h.mel?.32:.9);
    if(!M.done.has('w'+i)&&t1>=h.t-w){M.done.add('w'+i);const an=svAnchor(e,h,c);M.an['h'+i]=an;if(w>0&&h.show!==false){const W=svWarn(h.s,an,Math.max(.05,h.t-Math.max(t0,h.t-w)),{faint:D.mel||h.mel||h.faint,col:h.wc});M.warn.push(W)}}
    if(!M.done.has('h'+i)&&t1>=h.t){M.done.add('h'+i);let an=M.an['h'+i];if(!an||h.track)an=svAnchor(e,h,c);
      if(h.pre)try{h.pre(c,an)}catch(err){console.error('sv pre',err)}
      const hit=h.nohit?false:svHitNow(e,h.s,an,h.dm||1,{kb:h.kb,col:h.col,on:h.on?()=>h.on(c,an):null,flash:h.flash,fms:h.fms});
      if(h.fx)try{h.fx(c,an,hit)}catch(err){console.error('sv fx',err)}}});
  if(D.ev)D.ev.forEach((v,i)=>{if(!M.done.has('e'+i)&&t1>=v[0]){M.done.add('e'+i);try{v[1](c)}catch(err){console.error('sv ev',M.id,err)}}});
  if(D.tr)D.tr.forEach((v,i)=>{if(!M.done.has('t'+i)&&t1>=v[0]){M.done.add('t'+i);M.tr.push(svTrail(e,v[2],v[3],v[4],v[5]||S.B.col,v[6]))}if(M.done.has('t'+i)&&!M.done.has('u'+i)&&t1>=v[1]){M.done.add('u'+i);const T=M.tr[M.tr.length-1];T&&T.stop()}});
  if(D.tk)try{D.tk(c,dt)}catch(err){console.error('sv tk',err)}
  if(M===S.mv&&t1>=D.dur){svEndMove(e);svAfterMove(e,M)}}
// after a move: a combo follow-up, or a rest (the punish window)
function svAfterMove(e,M){const S=e.sv,D=M.D;if(!svAuth(e)||e.dead)return;
  if(S.qStag){S.qStag=0;svCast(e,'stagger');return}
  if(S.ph===1&&S.B.ph2&&e.c.h/M_(e)<=S.B.ph2&&S.B.M.awaken){svCast(e,'awaken');return}
  if(D.nx){const L=d2(pl.position,e.m.position);for(const [id,p,mx] of D.nx){const N=S.B.M[id];if(!N||(N.ph||1)>S.ph)continue;if(mx!=null&&L>mx)continue;if(M.rnd()<p){svCast(e,id);return}}}
  const ai=S.B.ai||{},r=ai.rest||[.8,1.4];S.rest=(r[0]+Math.random()*(r[1]-r[0]))*(S.ph>1?(ai.ph2r||.72):1)+(D.rec||0)}
function M_(e){return M(e.c)}
// cast = start locally and relay to co-op partners (the seed rides in en as 1+seed/1000: the relay clamps en to 0.5..2)
function svCast(e,id,seed){const S=e.sv;seed=Math.max(1,Math.min(998,Math.round(seed||(1+Math.random()*997))));const k='sv'+S.i+'_'+id;
  if(BMV[k]){const o=MP.inAI;MP.inAI=1;try{BMV[k](e,ARN[S.i],1+seed/1000)}finally{MP.inAI=o}}else svStart(e,id,seed)}
function svRegMoves(i){const B=SVB[i];for(const id in B.M){const k='sv'+i+'_'+id;if(BMV[k])continue;kqBmv(k,function(e,A,en){if(e&&e.sv&&e.sv.i===i)svStart(e,id,Math.max(1,Math.round(((+en||1)-1)*1000)));return {d:0,lock:0}})}}
// ---------------- the AI ----------------
// v112: no repeats — a move used in either of the last two casts is not picked (if nothing else fits, only the very last
// one is barred), and the 3rd/4th most recent are half as likely.
function svPick(e,loose){const S=e.sv,B=S.B,m=e.m,L=d2(pl.position,m.position),ang=Math.abs(svAng(svYawTo(m,pl.position)-m.rotation.y));
  const side=ang<1.0?'f':ang>2.1?'b':'s',C=[];let tot=0;
  for(const id in B.M){const D=B.M[id];if(!D.wt||(D.ph||1)>S.ph||(D.ph1only&&S.ph>1))continue;if((S.cd[id]||0)>0)continue;
    const r=D.r||[0,99];if(L<r[0]||L>r[1])continue;const a=D.a||'f';if(a!=='any'&&!(a===side||(a==='fs'&&side!=='b')||(a==='sb'&&side!=='f')))continue;
    if(S.last[0]===id||(!loose&&S.last[1]===id))continue;if(D.when&&!D.when(e,L,side))continue;
    let w=typeof D.wt==='function'?D.wt(e,L,side):D.wt;if(S.last[2]===id||S.last[3]===id)w*=.5;if(w>0){C.push([id,w]);tot+=w}}
  if(!C.length)return loose?null:svPick(e,1);let u=Math.random()*tot;for(const [id,w] of C){u-=w;if(u<=0)return id}return C[C.length-1][0]}
function svMoveFree(e,dt,now){const S=e.sv,B=S.B,ai=B.ai||{},m=e.m,A=ARN[S.i],v=V().subVectors(pl.position,m.position).setY(0),L=v.length()||.01;
  // face the hero
  const da=svAng(Math.atan2(v.x,v.z)-m.rotation.y),tr=(ai.turn||2.4)*(S.ph>1?1.2:1);m.rotation.y+=Math.max(-tr*dt,Math.min(tr*dt,da));
  let sp=0,ux=0,uz=0;const pref=ai.pref||5,ws=(ai.walk||2.2)*(S.ph>1?(ai.ph2s||1.15):1);
  if(ai.style!=='root'){if(L>pref+1.2){sp=L>pref+8&&ai.run?ai.run:ws;ux=v.x/L;uz=v.z/L}
    else if(L<pref-2.2&&ai.back){sp=ws*.55;ux=-v.x/L;uz=-v.z/L}
    else{S.sd=S.sd||1;S.sdT=(S.sdT||0)-dt;if(S.sdT<=0){S.sdT=2+Math.random()*2.5;S.sd=Math.random()<.5?-1:1}sp=ws*(ai.strafe==null?.45:ai.strafe);ux=-v.z/L*S.sd;uz=v.x/L*S.sd}}
  if(sp>0&&Math.abs(da)<1.4){walkM(m,ux*sp*dt,uz*sp*dt)}else sp=0;
  S.walkSp=sp}
function svAI(e,dt,now){const S=e.sv,A=arenaOf(e),m=e.m,B=S.B;if(!A)return;
  if(AF===A&&A.f){m.visible=true;if(e.hb)e.hb.visible=false}
  const auth=svAuth(e);if(e.bs){e.bs.pb=99;e.bs.t=99;e.bs.ult=99}
  // speed for the walk cycle (from the actual motion, so partners animate too)
  const dx=m.position.x-S.lp.x,dz=m.position.z-S.lp.z;S.lp.copy(m.position);const ms=dt>0?Math.hypot(dx,dz)/dt:0;S.spd+=((ms>12?0:ms)-S.spd)*Math.min(1,dt*8);
  for(const k in S.cd)S.cd[k]=Math.max(0,S.cd[k]-dt);S.inv=Math.max(0,S.inv-dt);
  if(!A.f){// out of the fight: walk home, heal, idle
    if(S.mv)svEndMove(e,true);S.stgM=null;S.on=false;e.agg=0;const hx=A.cx-m.position.x,hz=A.cz-m.position.z,hl=Math.hypot(hx,hz);
    if(hl>.8){walkM(m,hx/hl*2.2*dt,hz/hl*2.2*dt);m.rotation.y=Math.atan2(hx,hz)}else if(B.homeY!=null){m.rotation.y+=svAng(B.homeY(A)-m.rotation.y)*Math.min(1,dt*2)}
    e.c.h=Math.min(M(e.c),e.c.h+M(e.c)*dt*.2);S.po=0;svApply(e,dt,now);return}
  e.agg=1;
  if(!S.on){S.on=true;S.ph=1;e.bs.ph=1;S.rest=1;S.po=0;if(auth&&B.M.intro)svCast(e,'intro')}
  // peers follow the driver's phase from the health sync
  if(!auth&&S.ph===1&&B.ph2&&e.c.h/M(e.c)<=B.ph2-.02){S.ph=2;e.bs.ph=2;try{B.awake&&B.awake(e,true)}catch(_){}}
  // poise drains when it is not being hit
  if(now-S.poT>3500)S.po=Math.max(0,S.po-dt*.12);
  if(S.mv)svTickMove(e,dt,now);
  else if(auth){
    if(S.ph===1&&B.ph2&&e.c.h/M(e.c)<=B.ph2&&B.M.awaken)svCast(e,'awaken');
    else{svMoveFree(e,dt,now);S.rest-=dt;if(S.rest<=0){const id=svPick(e);if(id)svCast(e,id);else S.rest=.25}}}
  else{const da=svAng(svYawTo(m,pl.position)-m.rotation.y);m.rotation.y+=Math.max(-2*dt,Math.min(2*dt,da))}
  // keep inside the den, push the hero out of the body
  const cdx=m.position.x-A.cx,cdz=m.position.z-A.cz,cl=Math.hypot(cdx,cdz),lim=ARENA_R-(B.edge||2);if(cl>lim){m.position.x=A.cx+cdx/cl*lim;m.position.z=A.cz+cdz/cl*lim}
  if(!S.ghost&&!S.rmOn&&hero.hp>0){const hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,hl=Math.hypot(hx,hz),R0=S.body;if(hl<R0&&hl>.001){const k=(R0-hl);if(typeof plBlocked!='function'||!plBlocked(pl.position.x+hx/hl*k,pl.position.z+hz/hl*k)){pl.position.x+=hx/hl*k;pl.position.z+=hz/hl*k}}}
  svApply(e,dt,now)}
// ---------------- poise, stagger, invulnerability, death ----------------
function svPoise(e,d){const S=e.sv;if(!S||e.dead||S.mv&&S.mv.id==='stagger'||S.mv&&S.mv.id==='awaken'||!svAuth(e))return;
  const P=M(e.c)*(S.B.poise||.075)*(S.ph>1?1.15:1)*1.5/((typeof PACE!='undefined'&&PACE.hp)||1.5); // v112: posture as before the ×3 healthS.po=Math.min(1,S.po+d/P);S.poT=performance.now();
  if(S.po>=1){S.po=0;const arm=S.mv&&S.mv.D.armor;if(arm)S.qStag=1;else svCast(e,'stagger')}}
// the generic stagger move (every boss gives its own track as B.stag)
function svStagDef(B){return {dur:B.stagT||2.6,trk:B.stag,inv:null,go(c){const S=c.S;S.stg=c.M.D.dur;SVX.st.stag++;svSnd('stag',1);popT(c.m.position,'STAGGERED','#ffd860',true);
    burst(gY(c.m.position,2.2),0xffe08a,40,3,3,.7);svShock(c.m.position,0xffd860,4,.4);try{S.B.onStag&&S.B.onStag(c)}catch(_){}},
  tk(c,dt){c.S.stg=Math.max(0,c.M.D.dur-c.M.t);if(Math.random()<dt*7){const p=svWP(c.e,c.B.headJ||'root',0,0,0);burst(p,0xffe08a,1,.5,.6,.5)}},end(c){c.S.stg=0}}}
// ---------------- hooks into the game ----------------
{const f=spawnBoss;spawnBoss=function(i){const e=f.apply(this,arguments);try{if(SVX.on&&e&&SVB[i])svMake(e,i)}catch(err){console.error('sv make',i,err)}return e}}
{const f=bossAI;bossAI=function(e,dt,now){if(e&&e.sv){try{svAI(e,dt||0,now||performance.now())}catch(err){if((SVX.ae=(SVX.ae||0)+1)<6)console.error('sv ai',err)}return}return f.apply(this,arguments)}}
// the enemy loop skips models more than 30 tiles away: a den is bigger than that
{const f=mpAct;mpAct=function(e){if(e&&e.sv&&AF&&AF.i===e.ar)return true;return f.apply(this,arguments)}}
// co-op: the partner's copy keeps its own root motion while a move moves the boss
{const f=eTick;eTick=function(e,dt,now){if(e&&e.sv&&e.sv.rmOn){const x=e.m.position.x,z=e.m.position.z,r=f.apply(this,arguments);e.m.position.x=x;e.m.position.z=z;return r}return f.apply(this,arguments)}}
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.sv&&!e.dead){const S=e.sv;
    if(S.inv>0||S.mv&&S.mv.D.inv&&S.mv.t>=S.mv.D.inv[0]&&S.mv.t<=S.mv.D.inv[1]){if(nowP()-(S.ivT||0)>500){S.ivT=nowP();dn(e.m.position,'Immune','#c8c0b0',-30,600)}return 0}
    if(S.stg>0)d=Math.round(d*1.35);const h0=e.c.h,r=f.call(this,e,d,s,crit,dot);if(!dot)svPoise(e,Math.max(0,h0-e.c.h));return r}return f.apply(this,arguments)}}
// death: the boss plays its fall before the body shrinks away
{const f=kill;kill=function(e){if(e&&e.sv&&!e.sv.dying){const S=e.sv;S.dying=1;svEndMove(e,true);S.stgM=null;
    if(S.B.die){svSnapNow(S);S.dieM=1;S.trk=S.B.die;S.tt=0;e.m._ssDead=1;const T=2.1;let t=0;svSnd('roar',.9,.7);
      kqFx({tick(dt){t+=dt||0;S.tt=t;try{svApply(e,dt||0,performance.now())}catch(_){}try{S.B.dying&&S.B.dying(e,t)}catch(_){}return t<T&&!!e.m.parent},end(){}})}}
  return f.apply(this,arguments)}}
{const f=removeE;removeE=function(e){const r=f.apply(this,arguments);try{if(e&&e.sv){e.sv.R.mats.forEach(m=>m.dispose());e.sv.R.glow.forEach(m=>m.dispose());e.sv.R.root.traverse(o=>{if(o.geometry&&o.geometry.userData.svOwn)o.geometry.dispose()})}}catch(_){}return r}}
// the dens: scenery, seal and colliders stay; their hazards, HUD lines and special targets are off while the boss fights its own way
function svDenTakeover(){DEN.forEach((D,i)=>{if(!D||!SVB[i]||D._sv)return;D._sv=1;const c0=D.clear;
  D.start=function(A,e){['d01hud','rwCold','rwVig','d5tint','d5rite'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none'});try{SVB[i].denStart&&SVB[i].denStart(A,e)}catch(err){console.error('sv den start',err)}};
  D.tick=function(A,e,dt,now){try{SVB[i].denTick&&SVB[i].denTick(A,e,dt,now)}catch(err){}};D.ai=null;D.hitA=null;
  D.clear=function(A,won){try{c0&&c0.call(this,A,won)}catch(_){}['d01hud','rwCold','rwVig','d5tint','d5rite'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none'});
    const e=bossEnt(A.i)||enemies.find(q=>q.ar===A.i);if(e&&e.sv&&!e.sv.dying){const S=e.sv;svEndMove(e,true);S.on=false;S.ph=1;S.po=0;S.stg=0;S.inv=0;S.cd={};if(e.bs)e.bs.ph=1;try{S.B.reset&&S.B.reset(e)}catch(err){console.error('sv reset',err)}}
    try{SVB[i].denClear&&SVB[i].denClear(A,won)}catch(_){}}})}
// HUD: a posture bar under the boss's health bar
{const f=bossHudX;bossHudX=function(){const r=f.apply(this,arguments);try{const e=AF&&bossEnt(AF.i);let p=document.getElementById('svPo');
  if(!e||!e.sv){if(p)p.style.display='none';return r}
  if(!p){p=document.createElement('div');p.id='svPo';p.style.cssText='height:5px;margin:4px auto 0;width:70%;background:rgba(0,0,0,.6);border:1px solid rgba(255,216,96,.35);border-radius:2px;overflow:hidden';p.innerHTML='<i style="display:block;height:100%;width:0;background:linear-gradient(90deg,#c89020,#ffe080);transition:width .12s"></i>';const b=$('boss'),mt=b&&b.querySelector('.meter');if(mt)mt.after(p);else if(b)b.appendChild(p)}
  p.style.display='block';const S=e.sv;p.firstChild.style.width=(S.stg>0?100:S.po*100).toFixed(1)+'%';p.firstChild.style.background=S.stg>0?'#fff4c0':'linear-gradient(90deg,#c89020,#ffe080)'}catch(_){}return r}}
// register a boss: moves become relayable BMV entries, the stagger move is added, the den is taken over
function svReg(i,B){B.M.stagger=B.M.stagger||svStagDef(B);SVB[i]=B;svRegMoves(i);svDenTakeover();
  // a boss that is already standing in its den (the game was loaded before this ran) gets its new model now
  enemies.forEach(e=>{if(e.boss&&e.ar===i&&!e.sv&&!e.dead)try{svMake(e,i)}catch(err){console.error('sv make late',err)}})}
