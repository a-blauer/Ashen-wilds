// ================= v113: field instances II and III of every zone get creatures of their own =================
// v112 gave instances II and III their own look; v113 gives them their own monsters. Every zone has two new creatures in
// II and two more in III (24 in all, one file per zone: 2010 … 2060). Instance I keeps the zone's original roster.
// Kindlelight follows the owner's story (the Caustic Goo evolves into the Amalgam, the Bloat Maggot's larvae become the
// Akidon, which grows into the Akorror; the Lichen is the forest's own earth risen up); the other zones get creatures
// that fit their theme (Hillside Crest: cold-blooded beasts of the mere and the cliffs, and so on).
//
// A creature is registered with n3Def(key, D):
//   D.n, D.e (emoji), D.fam, D.mt, D.w (stat weights), D.ranged, D.weak (orange weak spot on its back)
//   humanoid:  D.hum = HUMLOOK entry ({skin, tunic, cape, pants, sc, wpn, wcol}); D.body(B,P,k,L) builds the model with the
//              v94 humanoid toolkit (mdBody/mdHead/mdLoft/dkKit…); D.brute = the v99 'brute' proportions (see 0010 BRUTE)
//   creature:  D.rig = {name, base (an existing rig: Mossfrog, Cryptspider, …), col, sc, kit(k,c,C,red), spec (SPEC overrides)}
//              the body is the base rig's low-poly body in the creature's colour; kit adds its own rigid detail parts
//   D.moves = [basic, signature, signature]: the basic is one of strike / bite / spit / throw / bolt (the AI paces those),
//   the two signatures are n3Mv moves no other monster uses (v107 rule, checked by test/v107_sig.py).
//   D.basic = {strike:'animName'} plays the creature's own animation for its basic attack.
// The instance rosters (roaming groups and the three camps of each field instance) are set with n3Zone(zone, k, R).
//
// Animation: every new move has its own keyframed track, sampled with the v100 monotone cubic so the motion is smooth:
//   time runs wind-up 0→1, act 1→2, recovery 2→3 (a strike usually lands around 1.4); channels hold their last key and
//   the track returns to rest at 3.
//   humanoids (n3Hum): the v85/v100 pose channels as absolute values like HUM_ATK (sy sx sz py ax az ay ex rw lx lz le lw hx
//     hy lh rh lk rk pz dy cy lhy rhy la ra ly rz lq …; a channel a key leaves out holds, and starts/ends at ATK_REST);
//     creatures (n3Cr): the v85 creature channels as offsets (nk hd jw ch sp pv fh fk hh hk by tl ty ex).
//     Both may add body channels: Brx (pitch), Bry (yaw), Bz (forward, tiles), By (lift, tiles).
//   The last stretch of every wind-up trembles (the dodge tell, as for every other monster).
// Effects only ever hurt through hitTarget/hitHero (s6Hit), so co-op works as for the v107 moves; anything that moves the
// hero (knock-back, pull, toss) acts on the local hero only and never through a dash (hero.iv).
var N3={on:true,keys:[],def:{},zone:{},humB:{},cur:null};
var HUP113={},CRP113={};
// ---------------- keyframe tracks ----------------
function n3U(ph,k){return ph==0?k:ph==1?1+k:3-k}
function n3Trk(keys,base){base=base||{};
  const K=keys.map(q=>[q[0],q[1]]);if(K[0][0]>0)K.unshift([0,{}]);if(K[K.length-1][0]<3)K.push([3,{}]);
  const ch={};K.forEach(q=>{for(const c in q[1])ch[c]=1});const T=K.map(q=>q[0]),C=[];
  for(const c in ch){const b0=c[0]=='B'?0:(base[c]||0);let last=b0;const Y=K.map((q,i)=>{if(q[1][c]!=null)last=q[1][c];else if(i==0||i==K.length-1)last=b0;return last});C.push({c,Y,M:V100A_mono(T,Y)})}
  const out={};
  return u=>{u=u<0?0:u>3?3:u;let i=0;while(i<T.length-2&&u>T[i+1])i++;const h=(T[i+1]-T[i])||1e-6,t=(u-T[i])/h,t2=t*t,t3=t2*t,A=2*t3-3*t2+1,Bq=t3-2*t2+t,Cq=-2*t3+3*t2,Dq=t3-t2;
    for(let j=0;j<C.length;j++){const q=C[j];out[q.c]=A*q.Y[i]+Bq*h*q.M[i]+Cq*q.Y[i+1]+Dq*h*q.M[i+1]}return out}}
function n3Hum(name,keys){const at=n3Trk(keys,ATK_REST),P={};
  const f=(ph,k,now)=>{const r=at(n3U(ph,k));for(const c in ATK_REST)P[c]=r[c]!=null?r[c]:ATK_REST[c];
    if(r.hy==null)P.hy=ATK_REST.hy-((r.sy||0)+(r.py||0))*.6;
    if(ph==0&&k>.72){const tr=(k-.72)/.28;P.ax+=Math.sin(now/32)*.05*tr;P.lx+=Math.sin(now/37)*.04*tr;P.sx+=Math.sin(now/45)*.02*tr}
    return P};f.at=at;HUP113[name]=f;return f}
function n3Cr(name,keys){const at=n3Trk(keys),O={};
  const f=(ph,k,now)=>{const r=at(n3U(ph,k));for(const c in O)delete O[c];for(const c in r)if(c[0]!='B')O[c]=r[c];
    if(ph==0&&k>.72){const tr=(k-.72)/.28;O.nk=(O.nk||0)+Math.sin(now/30)*.04*tr;O.by=(O.by||0)+Math.sin(now/41)*.008*tr}
    return O};f.at=at;CRP113[name]=f;return f}
// humanoid foes: our tracks (signature names, or a basic attack remapped per creature)
{const f=humAtkPose;humAtkPose=function(n,ph,k,now,g){try{if(N3.on){let T=HUP113[n];if(!T&&g&&g.n3b&&g.n3b[n])T=HUP113[g.n3b[n]];if(T)return T(ph,k,now)}}catch(e){console.warn('v113 pose',e)}
  return f.apply(this,arguments)}}
// creature rigs: crPose has no model argument, so the overlay tells it which model is being posed
{const f=crAtkOverlay;crAtkOverlay=function(x){N3.cur=x&&x.g;try{return f.apply(this,arguments)}finally{N3.cur=null}}}
{const f=crPose;crPose=function(n,ph,k,now){try{if(N3.on){const g=N3.cur;let T=CRP113[n];if(!T&&g&&g.n3b&&g.n3b[n])T=CRP113[g.n3b[n]];if(T)return T(ph,k,now)}}catch(e){console.warn('v113 crpose',e)}
  return f.apply(this,arguments)}}
// the body group (pitch, yaw, forward, lift) follows the track's B channels
function n3Body(e,a,M,ph,k,P){const T=HUP113[M.an]||CRP113[M.an];if(!T||!T.at)return;const r=T.at(n3U(ph,k)),ib=1/(e.m.bs||1);
  P.rx=r.Brx||0;P.ry=r.Bry||0;P.z=(r.Bz||0)*ib;P.y=(r.By||0)*ib}
// ---------------- moves ----------------
function n3Mv(n,M){M.x6=M.x6||{};const X=M.x6,t0=X.tick;X.tick=function(e,a,ph,k,dt,now,P){n3Body(e,a,M,ph,k,P);if(t0)return t0.apply(this,arguments)};
  MV107[n]=M;MV[n]=M;try{MVN[n]=M.nm}catch(_){}return M}
// ---------------- small helpers for the moves ----------------
function n3Near(p,r){return Math.hypot(pl.position.x-p.x,pl.position.z-p.z)<(r||18)}
function n3Snd(p,k,v){if(n3Near(p,20))try{sfx(k,v||.7)}catch(_){}}
function n3Shake(p,s){if(n3Near(p,10))shake(s)}
// run fn after sec seconds of game time (stops with the game, like every other effect)
function n3Later(sec,fn){let t=0;kqFx({tick(dt){t+=dt;if(t>=sec){try{fn()}catch(err){console.warn('v113 later',err)}return false}return true}})}
// a flat direction from a to b
function n3Dir(a,b){const v=V(b.x-a.x,0,b.z-a.z),L=v.length();return L>1e-4?v.multiplyScalar(1/L):V(0,0,1)}
// the local hero is the attack's target and not dashing
function n3Me(a){return s6T(a)===pl&&hero.iv<=0}
// push (d>0) or pull (d<0) the local hero along dir over ms; stops at walls and never into a town or past minD of the source
function n3Move(dir,d,ms,src,minD){if(!pl)return;let t=0;const T=ms/1000;
  kqFx({tick(dt){t+=dt;const s=d*Math.min(dt,T-(t-dt))/T,nx=pl.position.x+dir.x*s,nz=pl.position.z+dir.z*s;
    if(src&&minD&&Math.hypot(nx-src.x,nz-src.z)<minD)return false;
    if(!solid(nx,nz)&&townAt(nx,nz,.5)<0){pl.position.x=nx;pl.position.z=nz}return t<T}})}
function n3Shove(a,from,d,ms){if(!n3Me(a))return;n3Move(n3Dir(from,pl.position),d,ms||260)}
function n3Pull(a,to,d,ms,minD){if(!n3Me(a))return;n3Move(n3Dir(pl.position,to),d,ms||320,to,minD||1.3)}
// the monster glides from a to b (k 0→1, eased), stopping short of walls
function n3Glide(e,A,Bp,k){const x=A.x+(Bp.x-A.x)*k,z=A.z+(Bp.z-A.z)*k;if(s6Free(x,z)){e.m.position.x=x;e.m.position.z=z}}
// the furthest free spot from o towards q (k steps of 10%)
function n3Reach(o,q,keep){let k=1;while(k>0&&!s6Free(o.x+(q.x-o.x)*k,o.z+(q.z-o.z)*k))k-=.1;k=Math.max(0,k);const p=V(o.x+(q.x-o.x)*k,0,o.z+(q.z-o.z)*k);
  if(keep){const d=n3Dir(o,q),L=Math.hypot(p.x-o.x,p.z-o.z);if(L>keep){p.x-=d.x*keep;p.z-=d.z*keep}else p.copy(o)}return p}
// move the attack's target spot (and its warning) to p
function n3Aim(a,p){a.tp.set(p.x,0,p.z);if(a.tel)a.tel.position.copy(gY(a.tp,.12))}
// solid shards bursting out of the ground (spikes, crystals, chitin, bone): they rise fast, hold, sink back
var N3M={};function n3Mat(col,o){const k=col+'|'+JSON.stringify(o||{});return N3M[k]||(N3M[k]=new THREE.MeshStandardMaterial(Object.assign({color:col,flatShading:true,roughness:.8,metalness:0},o||{})))}
var N3G={};function n3Geo(k){if(N3G[k])return N3G[k];let g;
  if(k=='spike'){g=new THREE.ConeGeometry(.5,1,5);g.translate(0,.5,0)}else if(k=='shard'){g=new THREE.OctahedronGeometry(.5,0);g.scale(.55,1.6,.55);g.translate(0,.75,0)}
  else if(k=='rock')g=new THREE.DodecahedronGeometry(.5,0);else if(k=='ico')g=new THREE.IcosahedronGeometry(.5,0);else if(k=='sph')g=new THREE.SphereGeometry(.5,10,8);
  else if(k=='claw'){g=new THREE.ConeGeometry(.5,1,4);g.translate(0,.5,0)}else if(k=='bone'){g=new THREE.CylinderGeometry(.08,.11,1,6);g.translate(0,.5,0)}else g=new THREE.BoxGeometry(1,1,1);
  return N3G[k]=g}
function n3Spike(p,col,h,w,life,o){o=o||{};const m=new THREE.Mesh(n3Geo(o.geo||'spike'),n3Mat(col,o.mat));m.userData.lpsSkip=1;m.castShadow=false;
  const y0=GH(p.x,p.z);m.scale.set(w,h,w);m.rotation.set(o.tx!=null?o.tx:s6R(-.25,.25),s6R(0,6.283),o.tz!=null?o.tz:s6R(-.25,.25));m.position.set(p.x,y0-h,p.z);scene.add(m);let t=0,dl=o.delay||0;
  kqFx({tick(dt){t+=dt;const q=t-dl;if(q<0)return true;const L=life||.9,u=q<.1?1-Math.pow(1-q/.1,3):q<L-.3?1:Math.max(0,(L-q)/.3);m.position.y=y0-h*(1-u*.92);return q<L},end(){scene.remove(m)}});return m}
// coloured debris chunks thrown up (joins the v91 debris list: bounce, shrink, gone)
function n3Chunks(p,col,n,sp,up,sc){for(let i=0;i<n;i++){const m=fxbMesh(n3Geo(Math.random()<.5?'rock':'ico'),n3Mat(col));m.position.copy(p);const s=(sc||.18)*(.7+Math.random()*.6);m.scale.set(s,s*(.7+Math.random()*.5),s);
  m.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);scene.add(m);const a=Math.random()*6.283,r=sp*(.4+Math.random()*.6);
  FXB_DEB.push({m,vx:Math.cos(a)*r,vy:up*(.6+Math.random()*.6),vz:Math.sin(a)*r,rx:(Math.random()-.5)*14,rz:(Math.random()-.5)*14,t:0})}}
// a glowing ground disc that swells and fades (impact flash on the ground)
function n3Flash(p,col,r,ms){x5('disc',col,ms||420,(k,m)=>{m.scale.setScalar(r*2*(.4+.6*Math.sqrt(k)));m.material.opacity=.75*(1-k)},{p:gY(p,.08),r:[-Math.PI/2,0,0]})}
// an expanding band on the ground (shockwave) that hurts once when it passes the hero
function n3Shock(e,a,o,R,col,ms,mult,mt,onHit,w){let t=0,hit=0;const T=ms/1000,ww=w||.9;
  const g=new THREE.RingGeometry(.86,1,48);x5(g,col,ms,(k,m)=>{m.scale.setScalar(Math.max(.05,R*k));m.material.opacity=.8*(1-k*k)},{p:gY(o,.1),r:[-Math.PI/2,0,0]});
  kqFx({tick(dt){t+=dt;const r=R*Math.min(1,t/T),tg=s6T(a);if(!hit&&tg){const d=Math.hypot(tg.position.x-o.x,tg.position.z-o.z);if(Math.abs(d-r)<ww*.6+.3&&d<R+.3){hit=1;s6Hit(e,a,mult,mt);try{onHit&&onHit(tg)}catch(_){}}}
    if(Math.random()<.6){const an=Math.random()*6.283;burst(gY(V(o.x+Math.cos(an)*r,0,o.z+Math.sin(an)*r),.15),col,1,.4,.6,.35)}return t<T},end(){setTimeout(()=>g.dispose(),50)}})}
// a slashing arc of light in front of p (a blade or claw trail) facing d; roll tilts the swing (0 flat, ±1 diagonal), flip = backhand
var N3Q={a:new THREE.Quaternion(),b:new THREE.Quaternion(),X:new THREE.Vector3(1,0,0),Y:new THREE.Vector3(0,1,0),Z:new THREE.Vector3(0,0,1)};
function n3Slash(p,d,col,r,ms,roll,flip){const g=new THREE.RingGeometry(r*.62,r,24,1,-1.1,2.2),Q=N3Q;
  const m=x5(g,col,ms||240,(k,mm)=>{mm.material.opacity=.95*(1-k);mm.scale.setScalar(.85+.3*k)},{p:p.clone()});
  m.quaternion.setFromAxisAngle(Q.Y,Math.atan2(d.x,d.z)+(flip?Math.PI:0));Q.a.setFromAxisAngle(Q.Z,roll||0);m.quaternion.multiply(Q.a);
  Q.a.setFromAxisAngle(Q.X,-Math.PI/2);m.quaternion.multiply(Q.a);Q.a.setFromAxisAngle(Q.Z,-Math.PI/2);m.quaternion.multiply(Q.a);
  setTimeout(()=>g.dispose(),(ms||240)+60);return m}
// a forked lightning bolt from the sky onto p (thick additive segments that flicker), with a flash at the ground
function n3Bolt(p,col,h,ms,from){const top=from?from.clone():gY(p,h||9),end=gY(p,.05);let prev=top.clone();const n=9;
  for(let i=1;i<=n;i++){const q=top.clone().lerp(end,i/n);if(i<n){q.x+=s6R(-.45,.45);q.z+=s6R(-.45,.45)}const a=prev.clone(),L=a.distanceTo(q);
    const m=x5('box',col,ms||280,(k,mm)=>{mm.material.opacity=(1-k)*(Math.random()<.35?.35:1)},{p:a.clone().lerp(q,.5)});m.scale.set(.1,.1,L);m.lookAt(q);
    if(i==4&&Math.random()<.7){const br=q.clone().add(V(s6R(-1.2,1.2),s6R(-1.4,-.4),s6R(-1.2,1.2))),m2=x5('box',col,(ms||280)*.7,(k,mm)=>{mm.material.opacity=.8*(1-k)},{p:q.clone().lerp(br,.5)});m2.scale.set(.06,.06,q.distanceTo(br));m2.lookAt(br)}
    prev=q}
  kqFlash(gY(p,.8),col,3.2,220);try{fxaFlash(gY(p,2),col,6,220)}catch(_){}}
// a ball that flies from a to b on a lob with a trail; done() on landing
function n3Lob(e,from,to,h,ms,col,sz,done,kind){const g=kqShot(kind||'glob',col,sz||1.2);s6Lob(g,from,to,h,ms,done,col);return g}

// a copy of a creature body geometry with one colour swapped for another (vertex colours within tol of 'from'), cached
var N3RC={};function n3Recolor(key,G,from,to,tol){if(N3RC[key])return N3RC[key];const g=G.clone(),c=g.attributes.color,A=new THREE.Color(from),Bc=new THREE.Color(to),t=tol||.12;
  for(let i=0;i<c.count;i++){const r=c.getX(i),gg=c.getY(i),b=c.getZ(i);if(Math.abs(r-A.r)+Math.abs(gg-A.g)+Math.abs(b-A.b)<t*3){const f=(r+gg+b)/(A.r+A.g+A.b||1);c.setXYZ(i,Bc.r*f,Bc.g*f,Bc.b*f)}}
  c.needsUpdate=true;return N3RC[key]=g}
// ---------------- registering a creature ----------------
function n3Def(key,D){N3.def[key]=D;N3.keys.push(key);
  const en={n:D.n,e:D.e,w:D.w,mt:D.mt||'p',moves:D.moves.slice(),fam:D.fam||'Beast',v113:1};if(D.ranged)en.ranged=1;
  if(D.hum){en.hum=key;HUMLOOK[key]=Object.assign({skin:[120,120,120],tunic:0x303030,cape:[40,40,40],pants:[40,40,40],sc:1,wpn:'none'},D.hum);if(D.body)N3.humB[key]=D;}
  else if(D.rig){const R=D.rig;en.rig=R.name;en.col=R.col;if(R.sc)en.sc=R.sc;
    SPEC[R.name]=Object.assign({},SPEC[R.base],R.spec||{});const B=LPR[R.base];
    LPR[R.name]=Object.assign({},B,R.lpr||{},{geo:R.geo||((C,c)=>B.geo(C,c)),kit(k,c,C,red){if(!R.noBaseKit)B.kit(k,c,C,red);if(R.kit)R.kit(k,c,C,red)}});
    if(R.post){const p0=B.post;LPR[R.name].post=function(x,c,C,mat){if(p0&&!R.noBasePost)p0.apply(this,arguments);R.post(x,c,C,mat)}}else if(R.noBasePost)LPR[R.name].post=null}
  EN[key]=en;S[key]=S[key]||{e:D.e,c:(D.rig&&D.rig.col)||0x888888,h:'X',t:'x',hp:20,a:8,d:5};
  MSIG107[key]=D.moves.slice();MSET[key]=en.moves;
  if(D.weak)WEAKK[key]=1;if(D.role)ROLEK[key]=D.role;
  return en}
// humanoid bodies: our builder, inside the v99 proportion preset of this creature (brutes keep their bulk)
{const f=mdFoeB;mdFoeB=function(key){const D=N3.humB[key];if(!D)return f.apply(this,arguments);
  const S=AW_PROP99,o=S.ctx;S.ctx=S.forKey(key);
  try{const L=HUMLOOK[key],B=mdB(HB),k=dkKit(),P=mdP({col:{skin:mdSh(dkHex(L.skin),.86)}});D.body(B,P,k,L);mdKit(B,k);return B}
  finally{S.ctx=o}}}
// remember on the model which animations replace its basic attack
{const f=mkHumanoid;mkHumanoid=function(key){const g=f.apply(this,arguments);try{const D=N3.def[key];if(D&&g){if(D.basic)g.n3b=D.basic;g.n3k=key;if(D.post)D.post(g)}}catch(e){console.warn('v113 hum',e)}return g}}
{const f=cr;cr=function(c){const g=f.apply(this,arguments);try{const key=c&&c.g&&c.g[0],D=N3.def[key];if(D&&g&&!D.hum){if(D.basic)g.n3b=D.basic;g.n3k=key}}catch(e){}return g}}

// ---------------- instance rosters ----------------
// N3.zone[z][k] = {roam:[keys, repeated for weight], camps:[{n, mem:[[key, weight]…], b (camp builder)}, …]}
function n3Zone(z,k,R){(N3.zone[z]||(N3.zone[z]={}))[k]=R;const L=[];R.roam.forEach(q=>{for(let i=0;i<q[1];i++)L.push(q[0])});R.L=L;
  R.th=R.camps.map((c,i)=>{const id='v113_'+z+'_'+k+'_'+i;CTH[id]=c;return c})}
function n3Ins(r){const I=INSL[r];if(!I||!I.fld)return null;const Z=N3.zone[I.z];return Z&&Z[I.k]||null}
// roaming groups: the instance's own list (the camps get their own themes below)
{const f=rosterBuild;rosterBuild=function(r){const R=N3.on&&n3Ins(r);if(!R)return f.apply(this,arguments);
  const p=PMAP[INSL[r].z],o=BIOEN[p.n];BIOEN[p.n]=R.L;try{return f.apply(this,arguments)}finally{BIOEN[p.n]=o}}}
// the three camps of instances II and III take the instance's camp themes (instance I keeps the zone's)
function n3Camps(){const seen={};CAMPS.forEach(C=>{const R=n3Ins(C.ig);if(!R)return;const j=seen[C.ig]=(seen[C.ig]|0);seen[C.ig]++;if(!C.th0)C.th0=C.th;C.th=R.th[j%R.th.length]})}

// ---------------- model helpers (humanoid bodies) ----------------
// a stable 0..1 noise from a position (mottled skins, scattered parts)
function n3Nz(x,y,z,s){const v=Math.sin(x*127.1+y*311.7+z*74.7+(s||0)*13.3)*43758.5453;return v-Math.floor(v)}
// a smooth 0..1 noise (blotches a few faces wide): f = feature frequency
function n3Sn(x,y,z,f,s){f=f||9;s=s||0;const v=Math.sin(x*f+s)*Math.cos(y*f*1.3+s*2)+Math.sin(z*f*1.1+y*f*.7+s*3)*Math.cos(x*f*.8-z*f*.6)+.5*Math.sin((x+y+z)*f*1.7+s);return Math.max(0,Math.min(1,.5+v*.28))}
// paint the whole body (torso, hips, arms, hands, legs) with one function of the face m (y height, s front/back, c side…)
function n3Paint(P,fn){const f=m=>fn(m);P.paint.torso=f;P.paint.torsoLo=f;P.paint.sleeve=(m,s)=>fn(m,s,'arm');P.paint.fore=(m,s)=>fn(m,s,'arm');P.paint.hand=(m,s)=>fn(m,s,'hand');P.paint.leg=(m,s)=>fn(m,s,'leg')}
// a point on the torso surface at height y, angle a (0 front, +π/2 the right side, π back), pushed out by off
function n3Surf(P,y,a,off){const q=mdTorsoAt(P,y),c=Math.cos(a),s=Math.sin(a),r=c>=0?q.f:q.b;return [s*(q.rx+(off||0)),y,q.z+c*(r+(off||0))]}
// the bone a torso height belongs to
function n3TB(y){return y<.6?'pelvis':y<.76?'spine':y<.99?'chest':'neck'}
// the arm (s −1 left, +1 right) point at t along shoulder→elbow (0..1) or elbow→wrist (1..2)
function n3ArmAt(P,s,t){const b=P.bones,n=s<0?'aL':'aR',A=mdV(b[n+'0']),Bv=mdV(b[n+'1']),Cv=mdV(b[n+'2']),W=mdBuildF(P),xo=s*((W-1)*.12+(P.armX||0));
  const p=t<=1?A.clone().lerp(Bv,t):Bv.clone().lerp(Cv,t-1);p.x+=xo;return [p.x,p.y,p.z,t<.98?n+'0':n+'1']}
// a curling claw / talon from p along dir (rigid part chain), n segments that bend by curl
function n3Claw(k,bn,col,p,dir,len,r,curl,seg){let a=p.slice(),d=dir.slice();const n=seg||3;for(let i=0;i<n;i++){const L=len/n,b=[a[0]+d[0]*L,a[1]+d[1]*L,a[2]+d[2]*L];
  k.L(bn,'c',col,a,b,r*(1-i/n),r*(1-(i+1)/n)+.002,4);a=b;const c=Math.cos(curl),s=Math.sin(curl);d=[d[0],d[1]*c-d[2]*s,d[1]*s+d[2]*c]}}
// the moment a new creature's basic attack lands (strike / bite) or leaves (spit / throw / bolt): its own small effect
{const f=mTick;mTick=function(e,dt,now){const a=e&&e.atk,h0=a&&a.hit,p0=a&&a.ph;const r=f.apply(this,arguments);
  try{const D=a&&N3.def[e.c.en];if(D){if(D.bfx&&!h0&&a.hit&&(a.n=='strike'||a.n=='bite'))D.bfx(e,a);if(D.bfx0&&p0==0&&a.ph>=1&&KQR[a.n])D.bfx0(e,a)}}catch(err){console.warn('v113 basic fx',err)}return r}}
// a creature's own stance on top of every humanoid pose (idle, walk, attacks): D.stance = {channel: offset} (e.g. a hunch)
{const f=humAnim;humAnim=function(g,now,mv){const r=f.apply(this,arguments);try{const D=g&&g.n3k&&N3.def[g.n3k],St=D&&D.stance,b=g.h&&g.h.bones;
  if(St&&b){for(const c in St){const ch=HACH[c];if(c=='dy'){b.pelvis.position.y+=St.dy;continue}if(ch&&b[ch[0]])b[ch[0]].rotation[ch[1]]+=St[c]}}}catch(e){}return r}}
