// ================= v101 anim: swings that read at game speed (timing, body drive, lunge) =================
// Why: v100 rebuilt the swing shapes, but the game played each swing in only ~190–340 ms with the wind-up squeezed into
// the first ~80–140 ms and the whole thing over long before the next swing was allowed (warrior: ~740 ms between swings).
// At the game camera that is a blur under the slash effect, so the new shapes looked the same as before.
// v101 keeps the v100 shapes and gameplay numbers (cooldowns, damage, ranges) but changes how a swing is played:
//  * wind-up: a longer, readable coil (hit lands up to ~100 ms later than before, scaled by weapon speed), with the
//    playback slow at the start of the coil and accelerating into contact;
//  * contact: the blade whips through, a short lunge carries the body into the blow (stopped by walls, off when mounted);
//  * follow-through + recovery: fills the time until the next swing is allowed (momentum carries past the target, then
//    settles), instead of snapping back to idle;
//  * the slash effect is a thinner, lighter band at the blade's reach so it no longer hides the body at contact;
//  * body: hip turn, chest twist, lean and knee bend are exaggerated so they show at the game camera on a phone.
// Only swingAnim (hero melee basic attacks) changes. Spins, bows, staffs/wands/orbs, skills and co-op partners are untouched.
var V100W={on:true,AMP:{sy:1.55,cy:1.6,py:1.6,sx:1.45,sz:1.4,dy:1.7,lk:1.35,rk:1.35,lh:1.3,rh:1.3,la:1.2,ra:1.2},
  EXTRA:.6,EXTRA_MAX:120,REC:1.1,LUNGE:.28,LUNGE_FIN:.5};
function V100W_pose(P,D,wind,rest){
  const A=V100W.AMP,o={},tc=wind/D;
  return function(u){
    let k;
    if(u<tc){const x=u/tc;k=.42*Math.pow(x,1.45)}                       // slow coil, accelerating into contact
    else{const y=(u-tc)/(1-tc);k=.42+.58*(1-Math.pow(1-y,1.7))}           // whip through, then a long settle
    const p=P(Math.min(1,Math.max(0,k)));
    for(const c in p){const a=A[c];o[c]=a&&rest[c]!=null?rest[c]+(p[c]-rest[c])*a:p[c]}
    return o}}
var SWFIN=0; // the next swing is a combo finisher (bigger lunge)
var SWNOL=0; // v127: the next swing is a throw (sling, throwing knives): no lunge, so a ranged weapon never walks you into the enemy
{const base=swingAnim;
swingAnim=function(st,ms,onHit){const fin1=!!SWFIN,nol=!!SWNOL;SWFIN=0;SWNOL=0;
  let P=null;try{P=atkPick(st|0)}catch(_){}
  if(!V100W.on||!P||!P.v100)return base.apply(this,arguments);
  try{atkMpSig()}catch(_){}
  ms=ms||300;
  const hit0=ms*.42,wind=hit0+Math.min(V100W.EXTRA_MAX,hit0*V100W.EXTRA),
    cd=atkCd>0?atkCd*1000:ms*2,D=Math.max(ms+wind-hit0,Math.min(cd*.9,wind+ms*V100W.REC)),
    fin=fin1; // set by the basic-attack callers just before the swing (0130, 0580)
  haPlay(D,V100W_pose(P,D,wind,ATK_REST),wind/D,onHit,.1);
  const A=HA.cur;if(!A)return;
  // lunge into the blow: from shortly before contact to shortly after
  // v121: SWLIM {e,stand} (set by 2250-v121-attack-step-to-range.js): the lunge only closes the gap to that enemy's
  // hitting range and stops there, so the hero never runs into or past the target
  const lim=typeof SWLIM!='undefined'?SWLIM:null;
  const L=nol?0:(fin?V100W.LUNGE_FIN:V100W.LUNGE),u0=Math.max(0,(wind-90)/D),u1=Math.min(1,(wind+70)/D);let done=0;
  A.tick=function(u){
    try{if(typeof riding!='undefined'&&riding)return;if(u<u0||done>=1)return;
      const t=Math.min(1,(u-u0)/(u1-u0)),s=t*t*(3-2*t);let dd=(s-done)*L;done=s;if(dd<=0)return;
      if(lim&&lim.e){const room=swRoom(lim);if(room<=0){done=1;return}dd=Math.min(dd,room)}
      const ry=pl.rotation.y,nx=pl.position.x+Math.sin(ry)*dd,nz=pl.position.z+Math.cos(ry)*dd;
      if(typeof solid=='function'&&(solid(nx,nz)||solid(nx+Math.sin(ry)*.35,nz+Math.cos(ry)*.35)))return;
      pl.position.x=nx;pl.position.z=nz}catch(_){}}}}
// the slash arc: a thinner, lighter band out at the blade's reach, so the body's swing still shows through it
slashFx=function(d,st,rg){
  const g=new THREE.Group(),col=st==2?0xffe0a0:0xf2ead8,m=new THREE.Mesh(new THREE.RingGeometry(rg*.74,rg*1.0,28,1,st==2?.35:-1.05,st==2?2.4:2.1),addMat(col));
  m.material.opacity=.5;g.add(m);g.position.copy(gY(pl.position,st==2?.15:.85));const yaw=Math.atan2(d.x,d.z);
  if(st==2){m.rotation.y=Math.PI/2;g.rotation.y=yaw;m.position.y=0}else{m.rotation.x=-Math.PI/2;g.rotation.y=yaw-Math.PI/2;g.rotation.z=st?-.18:.18}
  scene.add(g);const s0=st==1?-1:1;
  tw(st==2?240:180,k=>{m.material.opacity=.5*(1-k)*(1-k);if(st<2)m.rotation.z=s0*(.6-k*.9);else m.rotation.x=-.4+k*.6;g.scale.setScalar(.9+k*.18)},()=>{scene.remove(g);m.geometry.dispose()})};

// ================= v100 evolve: species-specific evolution looks for every companion rig =================
// Before: every rig got the same generic rank ornaments (crOrn in c_ui.js: two brow cones, spine cones, a gold torus,
// a ring of gold cones) placed from the OLD rig's SPEC.hd/bk points, baked as 'LPO|…'. They looked bolted on.
// Now each of the 12 companion rigs (Foxlet, Ashwolf, Drakelet, Stoneshell, Mossfrog, Boneling, Batwing, Skyhawk,
// Cryptspider, Gloomcap, Wispling, Gravewyrm) has its own design in EVO100.D[rig] (files zzN_zz_evolve_*.js), drawn
// for its anatomy and theme, with five escalating levels (each keeps the previous level's parts and adds more):
//   level by evolution stage 0/1/2/3: tier 1-2 species 0/1/2/4, tier 3-4 1/2/3/5, tier 5 2/3/4/5 (the last stage is
//   always the legendary look); wild elites (c.al) are level 1, Sovereigns 4. Level 0 = no ornaments.
// How it fits in: lpRig is wrapped. While a design rig is built, crOrn does nothing (EVO100.cur). After the rig is
// built, the design runs on an "evolution kit" E (below) and the parts are baked into at most three skinned meshes
// (cloth/bone 'c', metal 'm', glow 'g'; shared dkM() materials, so no new shader programs) bound to the body's
// skeleton, so they move with idle, gait and attack animation. Wings (lpwWing meshes on the wing pivots) get an
// evolved copy of their geometry (bands, glowing veins, claws) — same mesh, no extra draw call.
// Placement uses the creature's real body surface: E.on / E.out / E.top cast rays against the rest-pose body geometry
// (LPR[rig].geo), and every part is skinned like the nearest body vertex (rigid parts: at their anchor; surface parts
// with {vs:1}: per vertex). So parts sit on the body and still fit if the body proportions change a little.
// The bake is cached per look (rig, level, palette), so the raycasts run once per look.
// Palette (E.P): accents derive from the species' signature-spell colour (falls back to the rig's own glow), then the
// colour variant (Ember / Frost / Shadow / Golden), rare variant, shiny; metal goes iron → blackened steel → steel with
// gold trim with level (gilded for Golden / shiny, black with blood-red trim for Shadow, silvered for Frost).
var EVO100={on:true,D:{},cache:{},surf:{},cur:null,wing:{},rays:0};
var EVO100_RV={Crimson:0xff3a3a,Azure:0x4a9aff,Verdant:0x5aff8a,Amethyst:0xc07aff,Albino:0xdff4ff,Obsidian:0xff5a1a};
function evo100Lv(c){if(!c||!c.g)return 0;if(c.boss)return 4;const e=Math.max(0,Math.min(3,c.evo|0)),q=typeof SP2!='undefined'&&SP2[c.g[0]];
  if(!q)return c.al?Math.max(1,e):e;const t=q[1]||1,b=[0,0,0,1,1,2][t]||0;
  return Math.min(5,e>=3?4+(t>=3?1:0):e+b)}
function evo100Pal(c,n,L){
  const D=EVO100.D[n],q=SP2[c.g[0]],s=q&&CSP[q[8]],C=c.cl[0];let glow=new THREE.Color(D.glow||0xff8a3a);
  if(s&&s.col&&!D.ownGlow){const t=new THREE.Color(s.col),h={};t.getHSL(h);if(h.s>.35&&h.l<.82)glow=t.setHSL(h.h,Math.max(.75,h.s),Math.min(.6,Math.max(.5,h.l)))}
  if(c.v=='Ember')glow.set(0xff6a1a);else if(c.v=='Frost')glow.set(0x8fe4ff);else if(c.v=='Shadow')glow.set(0xff2a3a);else if(c.v=='Golden')glow.set(0xffc840);
  if(c.rv&&EVO100_RV[c.rv])glow.set(EVO100_RV[c.rv]);if(c.shn)glow.set(0xfff0a0);
  // the shared metal material (dkM().m: metalness .62, no environment map) renders colours ~2x darker, so these are bright
  const gold=0xf0c860,bronze=0xc89058,iron=0x8a8e98;let metal=L>=4?0xa8acb8:L>=3?0x9a9ca6:iron,trim=L>=4?gold:bronze;
  if(c.v=='Golden'||c.shn){metal=L>=3?0xe0b860:bronze;trim=0xffe08a}
  else if(c.v=='Shadow'){metal=0x4a4652;trim=L>=3?0xc04050:0x6a6474}
  else if(c.v=='Frost'){metal=0xc0d0e0;trim=0xf0f8ff}
  const main=lpMain(C,.15),g2=glow.clone().lerp(new THREE.Color(0xffffff),.45);
  return {glow:glow.getHex(),glow2:g2.getHex(),glowD:glow.clone().multiplyScalar(.6).getHex(),metal,trim,iron,gold,
    bone:c.v=='Shadow'?0x8a8494:0xd6cab0,boneD:c.v=='Shadow'?0x5a5462:0xa89a7c,dark:0x161214,leather:0x3a2618,
    main:main.getHex(),mainD:main.clone().multiplyScalar(.55).getHex(),mainL:main.clone().lerp(new THREE.Color(0xd8cbb2),.35).getHex(),C}}
// ---- body surface of a rig (rest pose), for rays and skinning ----
function evo100Surf(n){if(EVO100.surf[n])return EVO100.surf[n];
  const D=LPR[n],C=0x808080,G=D.geo(C,{g:[n],cl:[C],v:'',tr:'',f:0,z:1,evo:0}),pa=G.attributes.position.array,I=G.index.array;
  const T=new Float32Array(I.length*3);for(let t=0;t<I.length;t++){T[t*3]=pa[I[t]*3];T[t*3+1]=pa[I[t]*3+1];T[t*3+2]=pa[I[t]*3+2]}
  return EVO100.surf[n]={P:pa,T:T,I:I,N:G.attributes.normal.array,SI:G.attributes.skinIndex.array,SW:G.attributes.skinWeight.array,O:Object.keys(SPEC[n].bones)}}
// nearest hit of the ray o + t·d (t > 0) with the body; returns {p,n,t} (n faces back toward the ray) or null
function evo100Ray(S,o,d){const T=S.T;let best=1e9,bi=-1;EVO100.rays++;
  const ox=o[0],oy=o[1],oz=o[2],dx=d[0],dy=d[1],dz=d[2];
  for(let i=0;i<T.length;i+=9){const ax=T[i],ay=T[i+1],az=T[i+2],e1x=T[i+3]-ax,e1y=T[i+4]-ay,e1z=T[i+5]-az,e2x=T[i+6]-ax,e2y=T[i+7]-ay,e2z=T[i+8]-az;
    const px=dy*e2z-dz*e2y,py=dz*e2x-dx*e2z,pz=dx*e2y-dy*e2x,det=e1x*px+e1y*py+e1z*pz;if(Math.abs(det)<1e-9)continue;const inv=1/det;
    const sx=ox-ax,sy=oy-ay,sz=oz-az,u=(sx*px+sy*py+sz*pz)*inv;if(u<0||u>1)continue;
    const qx=sy*e1z-sz*e1y,qy=sz*e1x-sx*e1z,qz=sx*e1y-sy*e1x,v=(dx*qx+dy*qy+dz*qz)*inv;if(v<0||u+v>1)continue;
    const t=(e2x*qx+e2y*qy+e2z*qz)*inv;if(t>1e-4&&t<best){best=t;bi=i}}
  if(bi<0)return null;const i=bi,e1=new THREE.Vector3(T[i+3]-T[i],T[i+4]-T[i+1],T[i+5]-T[i+2]),e2=new THREE.Vector3(T[i+6]-T[i],T[i+7]-T[i+1],T[i+8]-T[i+2]),nn=e1.cross(e2).normalize();
  if(nn.x*dx+nn.y*dy+nn.z*dz>0)nn.negate();return {p:[ox+dx*best,oy+dy*best,oz+dz*best],n:nn.toArray(),t:best}}
// skin weights of the body vertex nearest to p (optionally only vertices whose main bone is in the list)
function evo100Skin(S,p,only){const P=S.P,SI=S.SI,SW=S.SW;let b=1e9,k=-1;const ok=only?only.map(x=>S.O.indexOf(x)):null;
  for(let i=0,v=0;i<P.length;i+=3,v++){if(ok){const mb=SW[v*4]>=SW[v*4+1]?SI[v*4]:SI[v*4+1];if(ok.indexOf(mb)<0)continue}
    const d=(P[i]-p[0])**2+(P[i+1]-p[1])**2+(P[i+2]-p[2])**2;if(d<b){b=d;k=v}}
  if(k<0)return [0,0,0,0,1,0,0,0];return [SI[k*4],SI[k*4+1],SI[k*4+2],SI[k*4+3],SW[k*4],SW[k*4+1],SW[k*4+2],SW[k*4+3]]}
// ---- the evolution kit: parts in model space, skinned at bake time ----
var EVO100_V=new THREE.Vector3(),EVO100_UP=new THREE.Vector3(0,1,0);
function evo100Kit(n,L,P,seed){
  const S=evo100Surf(n),parts=[],R=dkRng(seed||7),V3=(a)=>new THREE.Vector3(a[0],a[1],a[2]),Q=new THREE.Quaternion(),E0=new THREE.Euler();
  const nrm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]},add=(a,b,k)=>[a[0]+b[0]*(k==null?1:k),a[1]+b[1]*(k==null?1:k),a[2]+b[2]*(k==null?1:k)];
  const G=typeof dkG=='function'?dkG():null;
  const push=(geo,t,col,m,o)=>{o=o||{};parts.push({geo:typeof geo=='string'?G[geo]:geo,t:t,col:col,m:m,at:o.at||[m.elements[12],m.elements[13],m.elements[14]],vs:o.vs,bn:o.bn,only:o.only,j:o.j==null?.08:o.j});return E};
  const E={n,L,P,S,R,parts,bones:SPEC[n].bones,nrm,add,
    bone(bn){const b=SPEC[n].bones[bn];return b?[b[1],b[2],b[3]]:[0,0,0]},
    // ray from p along d (p outside the body) → first surface point {p,n}; out(): same from a point inside the body
    on(p,d){return evo100Ray(S,p,nrm(d))},out(o,d){return evo100Ray(S,o,nrm(d))},
    // top of the body at (x,z): {p,n} or null
    top(x,z){return evo100Ray(S,[x,4,z],[0,-1,0])},
    // part from geometry name/object, type t ('c','m','g'), colour, position, scale [sx,sy,sz] or s, rotation [rx,ry,rz]
    p(geo,t,col,pos,s,rot,o){E0.set(...(rot||[0,0,0]));Q.setFromEuler(E0);const sc=Array.isArray(s)?s:[s,s,s];
      return push(geo,t,col,new THREE.Matrix4().compose(V3(pos),Q.clone(),V3(sc)),o)},
    // part with its local +y along dir (and local +z toward fwd when given)
    pd(geo,t,col,pos,dir,s,fwd,o){const Y=V3(nrm(dir));let M=new THREE.Matrix4();
      if(fwd){const F=V3(fwd);F.sub(Y.clone().multiplyScalar(F.dot(Y)));if(F.lengthSq()<1e-8)F.set(0,0,1).sub(Y.clone().multiplyScalar(Y.z));F.normalize();const X=new THREE.Vector3().crossVectors(Y,F);M.makeBasis(X,Y,F)}
      else{Q.setFromUnitVectors(EVO100_UP,Y);M.makeRotationFromQuaternion(Q)}
      const sc=Array.isArray(s)?s:[s,s,s];M.scale(V3(sc));M.setPosition(V3(pos));return push(geo,t,col,M,o)},
    // tapered limb a → b
    L(a,b,r1,r2,t,col,seg,o){const d=V3(b).sub(V3(a)),len=d.length()||.001;Q.setFromUnitVectors(EVO100_UP,d.normalize());
      return push(dkTaper(r1,r2==null?r1:r2,len,seg||5),t,col,new THREE.Matrix4().compose(V3(a).add(V3(b)).multiplyScalar(.5),Q.clone(),new THREE.Vector3(1,1,1)),Object.assign({at:a},o))},
    // bent horn / tendril through points, radius r0 → r1
    chain(pts,r0,r1,t,col,seg,o){const N=pts.length-1;for(let i=0;i<N;i++){const k0=i/N,k1=(i+1)/N;E.L(pts[i],pts[i+1],r0+(r1-r0)*k0,r0+(r1-r0)*k1,t,col,seg,Object.assign({at:pts[0]},o))}return E},
    // curved horn from base along dir, bending toward bend (a vector), length len, base radius r
    horn(base,dir,bend,len,r,t,col,seg,o,tipCol){const d=nrm(dir),pts=[];for(let i=0;i<=4;i++){const s=i/4;pts.push(add(add(base,d,len*s),bend,len*s*s))}
      for(let i=0;i<4;i++)E.L(pts[i],pts[i+1],r*(1-i/4)+.002,i==3?.001:r*(1-(i+1)/4)+.002,t,i==3&&tipCol!=null?tipCol:col,seg,Object.assign({at:base},o));return pts[4]},
    // flat armour plate lying on the surface at hit h (or point + normal): w across, l along fwd, th thick
    plate(at,nm,fwd,w,l,th,t,col,geo,o){return E.pd(geo||'box',t,col,add(at,nm,th*.3),nm,[w,th,l],fwd,Object.assign({vs:1},o))},
    // loop around a limb/neck: rays from the inside point c in the plane ⟂ axis, pushed out by off; tube radius r
    band(c,axis,off,r,t,col,N,o){N=N||10;const A=V3(nrm(axis)),U=new THREE.Vector3(),W=new THREE.Vector3();U.set(1,0,0);if(Math.abs(A.dot(U))>.9)U.set(0,1,0);U.sub(A.clone().multiplyScalar(A.dot(U))).normalize();W.crossVectors(A,U);
      const pts=[];for(let k=0;k<N;k++){const a=k/N*Math.PI*2,d=U.clone().multiplyScalar(Math.cos(a)).add(W.clone().multiplyScalar(Math.sin(a))).toArray(),h=evo100Ray(S,c,d);
        pts.push(h?add(h.p,d,off):add(c,d,off+.05))}
      for(let k=0;k<N;k++)E.L(pts[k],pts[(k+1)%N],r,r,t,col,4,Object.assign({vs:1},o));return pts},
    // small glowing rune glyph lying on the surface (three strokes)
    rune(h,fwd,sz,col,o){const n=h.n,F=V3(fwd).sub(V3(n).multiplyScalar(V3(fwd).dot(V3(n)))).normalize(),X=new THREE.Vector3().crossVectors(V3(n),F),p0=add(h.p,n,.0015);
      const st=(a,b)=>E.L(add(add(p0,F.toArray(),a[1]*sz),X.toArray(),a[0]*sz),add(add(p0,F.toArray(),b[1]*sz),X.toArray(),b[0]*sz),sz*.09,sz*.09,'g',col||P.glow,3,Object.assign({vs:1},o));
      const k=(R()*3)|0;st([0,-1],[0,1]);if(k==0){st([-.5,.4],[0,1]);st([.5,.4],[0,1])}else if(k==1){st([0,.2],[.6,-.4]);st([0,.2],[-.6,-.4])}else{st([-.55,0],[.55,0]);st([.5,-.8],[0,-1])}return E},
    // gem in a metal setting on the surface
    gem(h,sz,col,o){E.pd('cyl','m',P.trim,add(h.p,h.n,sz*.15),h.n,[sz*1.25,sz*.35,sz*1.25],null,o);return E.pd('oct','g',col||P.glow,add(h.p,h.n,sz*.6),h.n,[sz*.8,sz*.95,sz*.8],null,o)},
    // hanging charm (tooth / claw) under point p
    fang(p,len,col,o){return E.pd('cone4','c',col||P.bone,add(p,[0,-len*.5,0]),[0,-1,0],[len*.22,len,len*.22],null,Object.assign({at:p},o))},
    // armour/mantle shell: every body triangle that passes sel is copied and pushed out along the
    // vertex normals by off (+ lift(x,y,z) if given); col = hex or (x,y,z,i)=>hex; a rim (edge thickness) closes the
    // open border. Skinned exactly like the body, so it bends with it. Returns the number of triangles.
    shell(sel,off,t,col,o){// sel(x,y,z,nx,ny,nz) is called with each triangle's centre and mean vertex normal
      o=o||{};const I=S.I,Pp=S.P,Nn=S.N,pos=[],nor=[],cols=[],sk=[],edges={};let nt=0;
      const cen=(a,b,c,A)=>(A[a*3]+A[b*3]+A[c*3])/3,cy=(a,b,c,A)=>(A[a*3+1]+A[b*3+1]+A[c*3+1])/3,cz=(a,b,c,A)=>(A[a*3+2]+A[b*3+2]+A[c*3+2])/3;
      const vo=v=>{const x=Pp[v*3],y=Pp[v*3+1],z=Pp[v*3+2],k=off+(o.lift?o.lift(x,y,z):0);return [x+Nn[v*3]*k,y+Nn[v*3+1]*k,z+Nn[v*3+2]*k]};
      for(let t3=0;t3<I.length;t3+=3){const a=I[t3],b=I[t3+1],c=I[t3+2];if(!sel(cen(a,b,c,Pp),cy(a,b,c,Pp),cz(a,b,c,Pp),cen(a,b,c,Nn),cy(a,b,c,Nn),cz(a,b,c,Nn)))continue;nt++;
        const cc=typeof col=='function'?col(Pp[a*3]/3+Pp[b*3]/3+Pp[c*3]/3,Pp[a*3+1]/3+Pp[b*3+1]/3+Pp[c*3+1]/3,Pp[a*3+2]/3+Pp[b*3+2]/3+Pp[c*3+2]/3,nt):col;
        [a,b,c].forEach(v=>{pos.push(vo(v));cols.push(cc);sk.push(v)});
        [[a,b],[b,c],[c,a]].forEach(e=>{const k=e[0]<e[1]?e[0]+'_'+e[1]:e[1]+'_'+e[0];edges[k]=edges[k]?null:[e[0],e[1],cc]})}
      if(o.rim!==false)for(const k in edges){const e=edges[k];if(!e)continue;const A=vo(e[0]),B=vo(e[1]),a0=[Pp[e[0]*3],Pp[e[0]*3+1],Pp[e[0]*3+2]],b0=[Pp[e[1]*3],Pp[e[1]*3+1],Pp[e[1]*3+2]],rc=o.rimCol!=null?o.rimCol:e[2];
        [[A,e[0]],[B,e[1]],[b0,e[1]],[A,e[0]],[b0,e[1]],[a0,e[0]],[B,e[1]],[A,e[0]],[b0,e[1]],[b0,e[1]],[A,e[0]],[a0,e[0]]].forEach(q=>{pos.push(q[0]);cols.push(rc);sk.push(q[1])})}
      parts.push({raw:{pos,cols,sk},t:t});return nt},
    // membrane: triangle fan hub → pts[i] → pts[i+1] (double-sided material), colour from hub (c0) to edge (c1)
    fan(hub,pts,c0,c1,t,o){const P0=[],C0=[],a=new THREE.Color(c0),b=new THREE.Color(c1==null?c0:c1);
      for(let i=0;i<pts.length-1;i++){P0.push(...hub,...pts[i],...pts[i+1]);C0.push(a.r,a.g,a.b,b.r,b.g,b.b,b.r,b.g,b.b)}
      const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P0,3));G.computeVertexNormals();
      parts.push({tri:G,cols:C0,t:t||'c',o:o||{}});return E},
    // free skinned loft (extra tails, plumes): rings [{p,r,ry,col,sk:[bone,bone,t]}], ref up vector
    loft(rings,seg,t,o){parts.push({loft:rings,seg:seg||6,t:t||'c',ref:(o&&o.ref)||[0,1,0],j:(o&&o.j)||0});return E},
    jit(a){return (R()-.5)*2*(a||1)}};
  return E}
// bake kit parts → {c,m,g} BufferGeometries with 4-bone skinning
function evo100Bake(E){
  const S=E.S,by={},col=new THREE.Color(),v=new THREE.Vector3(),nm=new THREE.Matrix3(),nv=new THREE.Vector3(),R=dkRng(91);
  const out=t=>by[t]||(by[t]={pos:[],nor:[],col:[],si:[],sw:[],idx:[],n:0});
  const bIdx=b=>{const i=S.O.indexOf(b);return i<0?0:i};
  E.parts.forEach(p=>{const o=out(p.t);
    if(p.raw){const r=p.raw,SI=S.SI,SW=S.SW;for(let i=0;i<r.pos.length;i++){const q=r.pos[i],v=r.sk[i],f=.92+R()*.12;col.set(r.cols[i]);
        o.pos.push(q[0],q[1],q[2]);o.nor.push(0,1,0);o.col.push(col.r*f,col.g*f,col.b*f);o.si.push(SI[v*4],SI[v*4+1],SI[v*4+2],SI[v*4+3]);o.sw.push(SW[v*4],SW[v*4+1],SW[v*4+2],SW[v*4+3]);o.idx.push(o.n++)}
      o.flat=1;return}
    if(p.tri){const pa=p.tri.attributes.position,na=p.tri.attributes.normal;let sk=p.o.bn?[bIdx(p.o.bn),0,0,0,1,0,0,0]:p.o.at?evo100Skin(S,p.o.at,p.o.only):null;
      for(let i=0;i<pa.count;i++){o.pos.push(pa.getX(i),pa.getY(i),pa.getZ(i));o.nor.push(na.getX(i),na.getY(i),na.getZ(i));const f=.92+R()*.12;o.col.push(p.cols[i*3]*f,p.cols[i*3+1]*f,p.cols[i*3+2]*f);
        const s2=sk||evo100Skin(S,[pa.getX(i),pa.getY(i),pa.getZ(i)],p.o.only);o.si.push(s2[0],s2[1],s2[2],s2[3]);o.sw.push(s2[4],s2[5],s2[6],s2[7]);o.idx.push(o.n++)}return}
    if(p.loft){// skinned loft: rings around a centre line, per-ring bones
      const rings=p.loft,seg=p.seg,base=o.n,ref=new THREE.Vector3(...p.ref),pts=rings.map(r=>new THREE.Vector3(...r.p));
      rings.forEach((r,i)=>{const tg=pts[Math.min(i+1,pts.length-1)].clone().sub(pts[Math.max(i-1,0)]).normalize(),U=ref.clone().sub(tg.clone().multiplyScalar(ref.dot(tg))).normalize(),Sd=new THREE.Vector3().crossVectors(U,tg);
        const sk=r.sk?[bIdx(r.sk[0]),bIdx(r.sk[1]),0,0,1-(r.sk[2]||0),r.sk[2]||0,0,0]:evo100Skin(S,r.p);col.set(r.col);
        for(let k=0;k<seg;k++){const a=Math.PI/2+k/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a),ry=r.ry==null?r.r:r.ry,jj=p.j?1+(R()-.5)*p.j:1;
          v.copy(pts[i]).addScaledVector(Sd,c*r.r*jj).addScaledVector(U,s*ry*jj);o.pos.push(v.x,v.y,v.z);o.nor.push(Sd.x*c+U.x*s,Sd.y*c+U.y*s,Sd.z*c+U.z*s);
          const f=.9+R()*.14;o.col.push(col.r*f,col.g*f,col.b*f);o.si.push(sk[0],sk[1],sk[2],sk[3]);o.sw.push(sk[4],sk[5],sk[6],sk[7])}});
      for(let i=0;i<rings.length-1;i++)for(let k=0;k<seg;k++){const a=base+i*seg+k,a1=base+i*seg+(k+1)%seg;o.idx.push(a,a1,a+seg,a+seg,a1,a1+seg)}
      // tip cap
      const last=rings.length-1,ci=base+rings.length*seg,tp=pts[last];o.pos.push(tp.x,tp.y,tp.z);o.nor.push(0,1,0);col.set(rings[last].col);o.col.push(col.r,col.g,col.b);
      const sk=rings[last].sk?[bIdx(rings[last].sk[0]),bIdx(rings[last].sk[1]),0,0,1-(rings[last].sk[2]||0),rings[last].sk[2]||0,0,0]:evo100Skin(S,rings[last].p);o.si.push(sk[0],sk[1],sk[2],sk[3]);o.sw.push(sk[4],sk[5],sk[6],sk[7]);
      for(let k=0;k<seg;k++)o.idx.push(ci,base+last*seg+k,base+last*seg+(k+1)%seg);
      o.n=ci+1;return}
    const g=p.geo,pa=g.attributes.position,na=g.attributes.normal,N=pa.count,f=1-p.j*.5+R()*p.j;col.set(p.col).multiplyScalar(f);nm.getNormalMatrix(p.m);
    let sk=null;if(p.bn)sk=[bIdx(p.bn),0,0,0,1,0,0,0];else if(!p.vs)sk=evo100Skin(S,p.at,p.only);
    for(let i=0;i<N;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);o.pos.push(v.x,v.y,v.z);nv.fromBufferAttribute(na,i).applyMatrix3(nm).normalize();o.nor.push(nv.x,nv.y,nv.z);o.col.push(col.r,col.g,col.b);
      const s=sk||evo100Skin(S,[v.x,v.y,v.z],p.only);o.si.push(s[0],s[1],s[2],s[3]);o.sw.push(s[4],s[5],s[6],s[7])}
    if(g.index){const ix=g.index.array;for(let i=0;i<ix.length;i++)o.idx.push(ix[i]+o.n)}else for(let i=0;i<N;i++)o.idx.push(i+o.n);o.n+=N});
  const res={};for(const t in by){const o=by[t];if(!o.n)continue;const G=new THREE.BufferGeometry();
    G.setAttribute('position',new THREE.Float32BufferAttribute(o.pos,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(o.nor,3));G.setAttribute('color',new THREE.Float32BufferAttribute(o.col,3));
    G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(o.si,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(o.sw,4));G.setIndex(o.idx);if(o.flat)G.computeVertexNormals();G.computeBoundingSphere();res[t]=G}
  return res}
// evolved copy of a wing geometry (lpwWing triangle soup: hub fans first, then strut prisms): finer membrane with
// colour bands toward the edge, accent spots/veins, glowing struts and claws at the outline tips from level 3
function evo100Wing(geo,L,P,key,o){
  if(EVO100.wing[key])return EVO100.wing[key];o=o||{};
  const pa=geo.attributes.position.array,ca=geo.attributes.color.array,nT=pa.length/9,hub=[pa[0],pa[1],pa[2]],P0=[],C0=[],R=dkRng(13),c=new THREE.Color(),c2=new THREE.Color();
  const sc=1+(o.grow||.05)*L,isHub=t=>Math.abs(pa[t*9]-hub[0])+Math.abs(pa[t*9+1]-hub[1])+Math.abs(pa[t*9+2]-hub[2])<1e-6;
  let mx=0;for(let t=0;t<nT;t++)if(isHub(t))for(let k=1;k<3;k++)mx=Math.max(mx,Math.hypot(pa[t*9+k*3]-hub[0],pa[t*9+k*3+2]-hub[2]));
  const accent=new THREE.Color(o.accent!=null?o.accent:P.mainD).lerp(new THREE.Color(P.glowD),.35).multiplyScalar(.7),edge=new THREE.Color(o.edge!=null?o.edge:P.dark),glow=new THREE.Color(P.glow);
  const put=(p,cc)=>{P0.push(p[0]*sc,p[1]*sc,p[2]*sc);C0.push(cc.r,cc.g,cc.b)};
  let fan=0;for(let t=0;t<nT;t++){const q=[0,1,2].map(k=>[pa[t*9+k*3],pa[t*9+k*3+1],pa[t*9+k*3+2]]),qc=[0,1,2].map(k=>new THREE.Color(ca[t*9+k*3],ca[t*9+k*3+1],ca[t*9+k*3+2]));
    if(!isHub(t)){// strut: glowing at high level
      q.forEach((p,k)=>{c.copy(qc[k]);if(L>=4&&o.veins!==false&&k==2)c.lerp(glow,.7);else if(L>=3)c.lerp(edge,.4);put(p,c)});continue}
    fan++;const B=3,lerp=(a,b,s)=>[a[0]+(b[0]-a[0])*s,a[1]+(b[1]-a[1])*s,a[2]+(b[2]-a[2])*s];
    const ring=s=>[lerp(q[0],q[1],s),lerp(q[0],q[2],s)],colAt=(p,s,k)=>{c.copy(qc[0]).lerp(qc[1],s*s);
      if(L>=2&&s>.66)c.lerp(edge,.5);if(L>=2&&s>.3&&s<=.66&&(fan+k)%2==0)c.lerp(accent,.55);if(L>=4&&s>.3&&s<=.66&&(fan%4)==1)c.lerp(glow,.45);return c.multiplyScalar(.92+R()*.12)};
    for(let b=0;b<B;b++){const s0=b/B,s1=(b+1)/B,a=b?ring(s0):[q[0],q[0]],z=ring(s1);
      if(!b){put(q[0],colAt(q[0],0,0));put(z[0],colAt(z[0],s1,0));put(z[1],colAt(z[1],s1,1))}
      else{put(a[0],colAt(a[0],s0,0));put(z[0],colAt(z[0],s1,0));put(z[1],colAt(z[1],s1,1));put(a[0],colAt(a[0],s0,0));put(z[1],colAt(z[1],s1,1));put(a[1],colAt(a[1],s0,1))}}
    // claw at the outer tip of every other fan edge from level 3
    if(L>=3&&o.claws!==false&&fan%2==1){const tp=q[1],d=[tp[0]-hub[0],0,tp[2]-hub[2]],l=Math.hypot(d[0],d[2])||1;if(l>mx*.72){const u=[d[0]/l,0,d[2]/l],w=.022*(1+.15*(L-3)),len=.06*(1+.2*(L-3));
      const base1=[tp[0]-u[2]*w,tp[1],tp[2]+u[0]*w],base2=[tp[0]+u[2]*w,tp[1],tp[2]-u[0]*w],tip=[tp[0]+u[0]*len,tp[1]-.01,tp[2]+u[2]*len];c2.set(o.claw!=null?o.claw:P.bone);
      put(base1,c2);put(tip,c2);put(base2,c2)}}}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P0,3));G.setAttribute('color',new THREE.Float32BufferAttribute(C0,3));G.computeVertexNormals();
  return EVO100.wing[key]=G}
// add the evolution look to a built low-poly rig
function evo100Apply(g,c,n){
  const D=EVO100.D[n],L=evo100Lv(c);if(!D||!L)return;
  const body=g.b.children.find(m=>m.isSkinnedMesh&&m.skeleton);if(!body)return;
  const P=evo100Pal(c,n,L),key='EVO|'+n+'|'+L+'|'+[P.glow,P.metal,P.trim,P.bone,P.main].join(',')+'|'+(c.v=='Shadow'?1:0);
  let gs=EVO100.cache[key];
  if(!gs){const E=evo100Kit(n,L,P,L*31+7);D.build(E,L,P,c);gs=EVO100.cache[key]=evo100Bake(E)}
  const M=dkM();['c','m','g'].forEach(t=>{if(!gs[t])return;const m=new THREE.SkinnedMesh(gs[t],M[t]);m.castShadow=t!='g';m.frustumCulled=false;m.userData.evo100=1;
    g.b.add(m);m.bind(body.skeleton,body.bindMatrix)});
  // evolved wings
  if(D.wing){const W=Object.values(LPWG);g.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&W.indexOf(o.geometry)>=0){const k0=Object.keys(LPWG).find(k=>LPWG[k]===o.geometry);
    o.geometry=evo100Wing(o.geometry,L,P,k0+'|'+L+'|'+P.glow+'|'+P.bone,D.wing)}})}
  g.evo100=L}
{const f=lpRig;lpRig=function(c,n,D){const own=EVO100.on&&EVO100.D[n];const pc=EVO100.cur;EVO100.cur=own?n:null;let g;
  try{g=f.apply(this,arguments)}finally{EVO100.cur=pc}
  if(own&&g){try{evo100Apply(g,c,n)}catch(e){console.error('evo100',n,e)}}return g}}
// the old generic rank ornaments are skipped for rigs with their own evolution design
{const f=crOrn;crOrn=function(){if(EVO100.cur)return;return f.apply(this,arguments)}}

