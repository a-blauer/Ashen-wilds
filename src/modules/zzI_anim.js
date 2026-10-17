// ================= v85: smoother movement animation — bow shot, companion and mount gaits, all models =================
// One shared "gait clock" drives every walking model (hero, humanoid foes, companions, creature foes, Sovereigns, mounts):
// - Speed is measured from how far the model really moved over the ground, so the legs never cycle faster than the body travels.
// - Stride length grows with speed like a real animal's (Alexander's rule: stride ≈ 2.3 × hip height × Froude^0.3),
//   so a faster creature takes longer strides instead of frantic short ones; big creatures step slower than small ones.
// - Each leg is planted for part of the cycle (the stance) and sweeps back at ground speed, then swings forward with a lift.
// - Four-legged creatures walk (4-beat), trot (diagonal pairs) and gallop (hind pair, front pair, flight) as they speed up.
// - Moving/idle blend with an eased spring instead of snapping; body bob, sway, lean into turns and acceleration,
//   head and tail follow-through ride on top.
// Nothing here changes gameplay: only bone rotations/offsets are set. Attack poses are left to the existing code.

var _gaV=null,_gaO=[0,0,0,0],_gaO2=[0,0,0,0];
var GA_OFF={walk:{hl:0,fl:.25,hr:.5,fr:.75},trot:{hl:0,fl:.5,hr:.5,fr:1},gal:{hl:0,hr:.12,fl:.42,fr:.54}};
function gaSS(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}
function gaCl(x,a,b){return x<a?a:x>b?b:x}
// critically damped spring toward target (eases in and out); state in G[k], velocity in G[k+'V']
function gaSD(G,k,target,T,dt){const om=2/Math.max(.01,T),x=om*dt,e=1/(1+x+.48*x*x+.235*x*x*x),vk=k+'V',c=G[k]-target,tmp=((G[vk]||0)+om*c)*dt;
  G[vk]=((G[vk]||0)-om*tmp)*e;G[k]=target+(c+tmp)*e;return G[k]}
// one leg over a gait cycle. p = cycle fraction since touchdown, beta = share of the cycle the foot is planted.
// out[0] hip swing (-1 forward .. +1 back; linear in stance so the foot stays put), out[1] swing lift 0..1, out[2] stance compression 0..1, out[3] stance progress (or -1 in swing)
function gaLeg(p,beta,out){
  p-=Math.floor(p);
  if(p<beta){const s=p/beta;out[0]=-1+2*s;out[1]=0;out[2]=Math.sin(Math.PI*s);out[3]=s}
  else{const u=(p-beta)/(1-beta),m=.6*(1-beta)/beta,u2=u*u,u3=u2*u;
    // Hermite from back (+1) to front (-1); both ends keep a little of the stance's backward motion (lift-off follow-through, swing retraction)
    out[0]=(2*u3-3*u2+1)+(u3-2*u2+u)*m-(-2*u3+3*u2)+(u3-u2)*m;out[1]=Math.sin(Math.PI*Math.pow(u,.75));out[2]=0;out[3]=-1}
  return out}
// advance the gait clock of object o. Lm = hip height in model units; k = stride factor; fmax = highest stride rate (Hz)
function gaStep(o,now,mv,sp,Lm,k,fmax){
  const V3=_gaV||(_gaV=new THREE.Vector3());o.getWorldPosition(V3);
  const e=o.matrixWorld.elements,sc=Math.hypot(e[0],e[1],e[2])||1,yaw=Math.atan2(e[8],e[10]);
  let G=o._ga;
  if(!G)G=o._ga={t:now,x:V3.x,z:V3.z,yaw:yaw,w:mv?1:0,v:mv?Math.min(sp||0,6):0,vm:0,ph:Math.random(),turn:0,tl:0,acc:0,Fr:0,f:0,cp:0,wp:0,br:0,sl:0};
  const dt=(now-G.t)/1000;G.t=now;G.dt=0;
  const L=Math.max(.05,Lm*sc);G.L=L;G.sc=sc;
  if(dt>0&&dt<.5){
    const dtc=Math.min(dt,.06),vm=Math.hypot(V3.x-G.x,V3.z-G.z)/dt;G.dt=dt;
    if(vm<40)G.vm+=(vm-G.vm)*(1-Math.exp(-dt*14));
    // moving: trust the measured ground speed; if blocked (pushing into a wall) step slowly in place
    const vt=mv?(G.vm>.25?Math.min(G.vm,14):gaCl(sp||1.2,.5,3)):0,v0=G.v;
    gaSD(G,'v',vt,mv?.2:.16,dtc);if(G.v<0){G.v=0;G.vV=0}
    gaSD(G,'w',mv?1:0,mv?.14:.2,dtc);G.w=gaCl(G.w,0,1);
    G.acc+=(gaCl((G.v-v0)/dtc,-40,40)-G.acc)*(1-Math.exp(-dtc*6));
    let dy=yaw-G.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));
    G.turn+=(gaCl(dy/dt,-6,6)-G.turn)*(1-Math.exp(-dtc*8));G.tl+=(G.turn-G.tl)*(1-Math.exp(-dtc*3.5));
    const Fr=G.v*G.v/(9.8*L);G.Fr=Fr;
    const D=Math.max(.05,L*2.3*Math.pow(Math.max(Fr,1e-4),.3)*(k||1));G.D=D;
    G.f=Math.min(fmax||4.5,G.v/D);G.ph+=G.f*dt;if(G.ph>1e4)G.ph-=1e4;
  }else if(!(dt>=0&&dt<.5)){G.vm=0}
  G.x=V3.x;G.z=V3.z;G.yaw=yaw;return G}
function gaLegLen(S){
  if(S._gaL)return S._gaL;let L=0;
  (S.legs||[]).forEach(q=>{const b=S.bones&&S.bones[q[0]+'0'];if(b&&b[2]>L)L=b[2]});
  if(!L&&S.bones&&S.bones.pelvis)L=S.bones.pelvis[2];
  return S._gaL=Math.max(.15,L||.4)}

// ---------------- companions, creature foes, Sovereigns (every SPEC rig) ----------------
rigAnim=function(x,now,mv,sp){
  const S=x.spec,b=x.bones,B=x.b,A=x.g.atk,ty=S.anim,legs=S.legs||[],TAU=Math.PI*2;
  const Lm=gaLegLen(S),slow=!!S.gs;
  const G=gaStep(x.g,now,mv,sp,Lm,ty=='hop'?1.6:ty=='slither'?1:slow?1.25:1,ty=='spider'?5.5:slow?3:4.5);
  const w=G.w,P=G.ph,Fr=G.Fr||0,dt=G.dt,id=1-w;
  const run=ty=='waddle'?0:slow?.5*gaSS(.3,1.4,Fr):gaSS(.3,1.4,Fr);
  const gal=(ty=='quad'&&legs.length==4&&!slow)?gaSS(1.8,4,Fr):0;
  const turnW=gaCl(G.turn,-3,3)*w,bank=gaCl(-G.turn*G.v*.02,-.2,.2)*w;
  // accumulated phases for things whose speed changes (so speeding up never makes them jump)
  if(dt>0){G.wp+=dt*1000/(ty=='fly'?55:85+215*id);G.br+=dt*(2.2+2.4*run*w);G.cp+=dt*(1.6+2*w)}
  let pitch=0;
  // ---- legs ----
  const beta=ty=='hop'?.3:ty=='spider'?.55:(legs.length<=2||ty=='waddle')?.6-.22*run:.62-.17*run-.13*gal;
  const Am=ty=='spider'?.45:ty=='hop'?.8:.62,reach=ty=='spider'?Lm*1.5*G.sc:G.L*.95;
  const amp=Math.min(Am,Math.asin(Math.min(.95,beta*(G.D||0)/(2*reach))))*w;
  const lift=(ty=='hop'?1.1:(.5+.45*run+.15*gal)*(slow?.6:1))*w;
  legs.forEach((q,i)=>{
    const k=q[0],h=b[k+'0'],kn=b[k+'1'],an=b[k+'2'];if(!h)return;
    if(ty=='fly'){h.rotation.x=.5;kn.rotation.x=1;an.rotation.x=-.6;return}
    let off=q[1]/TAU;
    if(ty=='hop')off=0;
    else if(ty=='quad'&&legs.length==4&&GA_OFF.walk[k]!=null){const wk=GA_OFF.walk[k],tr=GA_OFF.trot[k],ga=GA_OFF.gal[k];off=(wk+(tr-wk)*run)*(1-gal)+ga*gal}
    else if(ty=='spider')off+=(+k[1]||0)*.06;
    const o=gaLeg(P+off,beta,_gaO);
    if(ty=='spider'){const sd=k[0]=='a'?-1:1;h.rotation.y=o[0]*amp*sd;h.rotation.x=0;kn.rotation.z=sd*o[1]*.45*w;return}
    if(ty=='waddle'&&k[0]=='f'){h.rotation.x=-Math.sin(TAU*(P+off))*amp*.8;kn.rotation.x=0;an.rotation.x=0;return} // arms swing
    h.rotation.x=o[0]*amp;kn.rotation.x=o[1]*lift*.95+o[2]*.12*w;an.rotation.x=-(o[1]*lift*.6+o[2]*.06*w);
  });
  // ---- body: sway, bob, pitch, lean ----
  const s1=Math.sin(TAU*P)*w,sw=(ty=='waddle'?.14:.07)*(1-.6*run);
  b.pelvis.rotation.y=s1*sw;b.spine.rotation.y=-s1*sw*.85+turnW*.05;b.chest.rotation.y=-s1*sw*.7+turnW*.06;
  b.spine.rotation.z=0;
  if(ty=='waddle'){b.spine.rotation.z=s1*.1;b.pelvis.rotation.z=-s1*.08+bank}
  else b.pelvis.rotation.z=bank;
  // gallop: the back flexes and extends once per stride, the body rocks
  const gf=gal*w*Math.cos(TAU*(P-.95));b.spine.rotation.x=-gf*.07;b.chest.rotation.x=gf*.09;
  if(ty=='quad'||ty=='hop'||ty=='waddle'||ty=='spider')pitch=gaCl(-G.acc*.012,-.08,.08)*w-.05*gal*w*Math.sin(TAU*(P-.05));
  if(ty=='fly')pitch=.22*Math.min(1,G.v/4)*w;
  if(ty=='float')pitch=.18*Math.min(1,G.v/4)*w;
  let hopY=0;
  if(ty=='hop'){const p=P-Math.floor(P);if(p>=.3){const u=(p-.3)/.7;hopY=4*u*(1-u)*Math.min(.16,(G.D||0)/G.sc*.18)*w;pitch+=-.22*Math.cos(Math.PI*u)*w}else pitch+=.1*Math.sin(Math.PI*p/.3)*w}
  if(ty=='fly')b.pelvis.rotation.z=gaCl(-G.turn*.12,-.35,.35)*w;
  b.pelvis.rotation.x=pitch;
  b.chest.scale.y=1+Math.sin(G.br)*.025;
  // ---- head: steady gaze (counters bob/pitch), looks into turns, nods with the walk ----
  const hb=b.chest.rotation.x+b.spine.rotation.x+pitch;
  b.head.rotation.x=A?.45:id*Math.sin(now/1300)*.05+w*(-hb*.7+Math.sin(TAU*2*P)*.04*(1-run));
  b.head.rotation.y=A?0:id*Math.sin(now/1700)*.25+gaCl(turnW*.13,-.4,.4);
  if(b.neck)b.neck.rotation.y=A?0:gaCl(turnW*.06,-.2,.2);
  b.jaw.rotation.x=A?.65:.04+Math.sin(now/300)*.03+.12*run*w*(.6+.4*Math.sin(G.br*2));
  // ---- tail: wags with the stride, lifts when running, trails behind in turns ----
  for(let i=0;i<4;i++){
    const tb=b['tail'+i];if(!tb)continue;
    if(ty=='slither')continue;
    if(ty=='float'){tb.rotation.y=Math.sin(now/420-i*.9)*.35-G.tl*w*.1*(i+1);tb.rotation.x=Math.sin(now/600-i*.7)*.2+.12*w*Math.min(1,G.v/3)*(i+1)*.5;continue}
    const k1=1+i*.35;
    tb.rotation.y=id*Math.sin(now/380-i*.8)*.14*k1+w*Math.sin(TAU*P-i*.9)*(.16-.08*run-.06*gal)*k1-gaCl(G.tl,-3,3)*w*(.07+.05*i);
    tb.rotation.x=id*(.03+Math.sin(now/900+i)*.02)+w*(-.1-.08*run+.07*gal*Math.cos(TAU*(P-.1)-i*.7)+.03*Math.cos(TAU*2*P-i*.8)*(1-gal));
  }
  // slithering: the body wave travels back along the body exactly as fast as the body moves forward (no sliding)
  if(ty=='slither'){
    if(dt>0)G.sl+=dt*(w*(G.v/Math.max(.1,1.31*G.sc))+id*.245)*TAU;
    const th=G.sl,ta=.18+.22*w,ba=.1+.2*w;
    for(let i=0;i<4;i++){const tb=b['tail'+i];if(tb)tb.rotation.y=Math.sin(th-i*1.1)*ta}
    ['pelvis','spine','chest','neck'].forEach((k,i)=>{if(b[k])b[k].rotation.y=Math.sin(th-(i+4)*1.1)*ba*(k=='neck'?.6:1)+(k=='neck'?turnW*.08:0)});
    b.head.rotation.y=A?0:-Math.sin(th-8*1.1)*ba*.5+gaCl(turnW*.12,-.4,.4)+id*Math.sin(now/1700)*.2;
  }
  if(ty=='float')['fl','fr'].forEach((k,i)=>{if(b[k+'0']){b[k+'0'].rotation.z=(i?1:-1)*(.25+Math.sin(now/500+i*2)*.15);b[k+'0'].rotation.x=.35*w*Math.min(1,G.v/3)}});
  x.ears.forEach(e=>{e.rotation.z=e.userData.rz+Math.sin(now/620+e.userData.sd)*.06;e.rotation.x=A?-.5:-.12-.18*run*w+.05*w*Math.sin(TAU*2*P-.8)});
  x.wings.forEach(wg=>{wg.p.rotation.z=wg.s*(wg.base+Math.sin(G.wp)*wg.amp*(ty=='fly'?1.2:A?1.4:.3+.7*w+.2*run*w))});
  const bob=Lm*w*((1-run)*.012*(.5+.5*Math.cos(TAU*2*(P-beta*.5)))+run*(1-gal)*.045*(.5-.5*Math.cos(TAU*2*(P-beta*.5)))+gal*.08*(.5+.5*Math.cos(TAU*(P-.92))))*(slow?.5:1);
  B.position.y=ty=='fly'?.4+Math.sin(now/180)*.06:ty=='float'?.3+Math.sin(now/500)*.07:ty=='spider'?bob*.4:ty=='hop'?hopY:bob;
};

// ---------------- hero, humanoid foes, co-op players ----------------
// extra pose channels: draw-arm yaw (bow draw) and head yaw (look at the target / into turns)
HACH.ay=['aR0','y'];HACH.hy=['head','y'];HACH.lw=['aL2','x'];HACH.rw=['aR2','x'];
// knees, hip roll and a pelvis drop (dy, stored on the pelvis rotation object) so attacks can bend the legs and crouch
HACH.lk=['lh1','x'];HACH.rk=['rh1','x'];HACH.pz=['pelvis','z'];HACH.dy=['pelvis','_dy'];var HA_LEGS={lh:1,rh:1,lk:1,rk:1,pz:1,dy:1};
var HERO_LM=.55;
animHero=function(now,mv,h){
  h=h||pl;const b=h.bones;if(!b)return;
  const isP=h===pl,rid=isP&&typeof riding!='undefined'&&!!riding;
  const dt=Math.min(.05,Math.max(0,(now-(h._at||now))/1000));h._at=now;
  const G=gaStep(h,now,mv&&!rid,0,HERO_LM,1.15,3.2),TAU=Math.PI*2;
  const w=h.mvW=G.w,Fr=G.Fr||0,P=G.ph,idle=1-w,br=Math.sin(now/700),run=gaSS(.35,1.5,Fr);
  const beta=.6-.24*run,amp=Math.min(.8,Math.asin(Math.min(.95,beta*(G.D||0)/(2*G.L*.95))))*w;
  const oL=gaLeg(P,beta,_gaO),oR=gaLeg(P+.5,beta,_gaO2);
  const lh=oL[0]*amp,rh=oR[0]*amp,klift=(.7+.75*run)*w;
  const kL=oL[1]*klift+oL[2]*.14*w,kR=oR[1]*klift+oR[2]*.14*w;
  // ankles: push off the toes at the end of stance, toes up through the swing
  if(b.lh2){b.lh2.rotation.x=(oL[3]>=0?gaSS(.55,1,oL[3])*.4:-.12*oL[1])*w*(.5+.5*run)}
  if(b.rh2){b.rh2.rotation.x=(oR[3]>=0?gaSS(.55,1,oR[3])*.4:-.12*oR[1])*w*(.5+.5*run)}
  // arms: smooth counter-swing to the legs (right arm with the left leg), bigger with longer strides
  const arm=(.22+.12*run)*w+Math.min(.28,amp*.4),sA=Math.cos(Math.PI*2*(P-beta));
  const lean=.05*w+.12*run*w+gaCl(G.acc*.025,-.1,.14)*w;
  const L={lh:lh,rh:rh,ax:sA*arm-.2+br*.03*idle,az:0,ex:-.3-.4*run*w,lx:-sA*arm-br*.03*idle,lz:0,le:-.25-.45*run*w,
    sy:sA*.14*w,sx:lean,py:-sA*.09*w,hx:-lean*.45,ay:0,lw:0,rw:0,lk:kL,rk:kR,dy:0,hy:Math.sin(now/1900)*.2*idle+gaCl(G.turn*.1,-.3,.3)*w};
  // pelvis: bob (high mid-stance when walking, low when running), small hip drop and lean into turns
  const pv=b.pelvis;if(pv.userData.y0==null)pv.userData.y0=pv.position.y;
  const c2=Math.cos(TAU*2*(P-beta*.5));
  const bobY=w*((1-run)*.018*(.5+.5*c2)+run*(.04*(.5-.5*c2)-.012));
  L.pz=w*(.035*Math.sin(TAU*P)*(1-run))+gaCl(-G.turn*G.v*.012,-.14,.14)*w;
  b.chest.scale.y=1+Math.sin(now/500)*.015;
  // cape: lifts with speed, flutters faster, swings out against turns, bounces with the stride
  if(dt>0)G.cp+=dt*(3.3+3.5*w*Math.min(1,G.v/5));
  const cv=Math.min(1,G.v/5)*w,cb=.05*w*Math.cos(TAU*2*P-1);
  b.cp0.rotation.x=.05+.25*cv+Math.sin(G.cp)*.04+cb*.5;b.cp1.rotation.x=.06+.29*cv+Math.sin(G.cp*.87+1)*.05+cb;b.cp2.rotation.x=.07+.33*cv+Math.sin(G.cp*.77+2)*.06+cb;
  const ct=gaCl(G.tl*.08,-.3,.3)*w;b.cp0.rotation.z=ct*.5;b.cp1.rotation.z=ct;b.cp2.rotation.z=ct*1.3;
  if(!isP){h._gaLean=lean;h._L=L;if(!h.sw){for(const k in HACH){const [n,ax]=HACH[k];if(b[n]&&L[k]!=null)b[n].rotation[ax]=L[k]}}else for(const k in HA_LEGS){const [n,ax]=HACH[k];b[n].rotation[ax]=L[k]}
    pv.position.y=pv.userData.y0+bobY;return}
  // ---- player: the v81 action system on top of the walk ----
  let F=L;const pz=typeof uiOpen=='function'&&uiOpen();
  if(HA.buf&&!pz){if(now-HA.buf>380||!party.length)HA.buf=0;else if(atkCd<=0&&!hero.chan){HA.buf=0;swing()}}
  const A=HA.cur;
  if(A){
    if(!pz)A.k=Math.min(1,A.k+dt*1000/A.ms*(hstop>0?.12:1));
    const Pp=A.pose(A.k);F={};for(const k in L)F[k]=Pp[k]==null?L[k]:Pp[k];
    // legs: while running the stride keeps going and the attack's stance only shows through partly (no foot sliding)
    if(!A.legFull)for(const k in HA_LEGS)if(Pp[k]!=null)F[k]=L[k]+(Pp[k]-L[k])*(1-.85*w);
    if(A.k<A.bi){const t=haIO(A.k/A.bi);for(const k in F){const f=A.from[k];if(f!=null){let d=F[k]-f;if(k=='sy'||k=='py')d=haWrap(d);F[k]=f+d*t}}}
    if(!A.hit&&A.k>=A.hitAt){A.hit=1;A.onHit&&A.onHit()}
    if(A.tick)A.tick(A.k);
    if(A.k>=1&&HA.cur===A){HA.cur=null;HA.snap={};for(const k in F)HA.snap[k]=(k=='sy'||k=='py')?haWrap(F[k]):F[k];HA.sb=1;pl.sw=hero.chan?1:0;if(A.end)A.end()}
  }else{
    if(hero.chan)F=Object.assign({},L,{ax:-1.2,az:-.9,lx:-.5,lz:.7,sx:.1});
    if(HA.sb>0&&HA.snap){if(!pz)HA.sb=Math.max(0,HA.sb-dt/.17);const t=haIO(HA.sb);F=Object.assign({},F);
      for(const k in F){const sn=HA.snap[k];if(sn!=null){let d=sn-F[k];if(k=='sy'||k=='py')d=haWrap(d);F[k]+=d*t}}}
  }
  const fx=(now-HA.flT)/240;if(fx>=0&&fx<1){const a=(fx<.2?haOut(fx/.2):1-haIO((fx-.2)/.8))*(A?.6:1);F=F===L?Object.assign({},L):F;F.sx-=.32*a;F.hx-=.25*a}
  for(const k in HACH){const [n,ax]=HACH[k];if(b[n]&&F[k]!=null)b[n].rotation[ax]=F[k]}
  pv.position.y=pv.userData.y0+bobY+(F.dy||0);
};
// an action replaced or cancelled mid-way still tidies up its extras (nocked arrow, drawn string)
{const f=haCancel;haCancel=function(keepHit){const A=HA.cur;const r=f.apply(this,arguments);if(A&&A.end)try{A.end()}catch(e){}return r}}
// humanoid foes: the base code zeroes the spine pitch when not attacking; put the running lean back
{const f=humAnim;humAnim=function(g,now,mv){const r=f.apply(this,arguments);const h=g.h;if(h&&!g.ak&&h._gaLean&&h.bones)h.bones.spine.rotation.x+=h._gaLean;return r}}

// ---------------- bow and crossbow ----------------
// Bow (release at 53% of the animation, when the arrow flies): raise the bow and turn side-on, reach for the string,
// draw to the cheek with the elbow high, settle at anchor, release (string hand flicks back past the ear, bow arm kicks),
// hold the follow-through, then relax. A nocked arrow and a drawn string are shown between nock and release.
// Crossbow (bolt at 54%): shoulder and sight down the stock, recoil kick on the shot, crank the string back, relax.
var BOW_FX=null;
function bowFx(){
  if(BOW_FX)return BOW_FX;
  const g=new THREE.Group(),arrow=new THREE.Group(),sm=new THREE.MeshBasicMaterial({color:0xd8c8a0}),hm=new THREE.MeshBasicMaterial({color:0xc0c8d0}),fm=new THREE.MeshBasicMaterial({color:0xe8e0d0,side:THREE.DoubleSide});
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,1,5),sm);sh.rotation.x=Math.PI/2;arrow.add(sh);
  const hd=new THREE.Mesh(new THREE.ConeGeometry(.026,.09,5),hm);hd.rotation.x=Math.PI/2;hd.position.z=.54;arrow.add(hd);
  [0,1,2].forEach(i=>{const f=new THREE.Mesh(new THREE.PlaneGeometry(.035,.12),fm);f.position.z=-.42;f.rotation.z=i*Math.PI/3*2;f.rotation.y=Math.PI/2;const p=new THREE.Group();p.rotation.z=i*Math.PI*2/3;f.position.x=0;f.position.y=.022;p.add(f);arrow.add(p)});
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(9),3));
  const str=new THREE.Line(sg,new THREE.LineBasicMaterial({color:0xe8e0c8}));str.frustumCulled=false;
  arrow.scale.setScalar(.82);g.add(arrow,str);g.visible=false;g.userData.lps=1;g.traverse(o=>{o.userData.lpsSkip=1});
  return BOW_FX={g:g,arrow:arrow,str:str}}
// k: 0..1 how far the string is pulled (0 = hidden)
function bowFxSet(k,g){
  try{
    const F=bowFx(),W=(pl.gearG||[]).find(o=>o.userData&&o.userData.wt=='bow'&&o.parent);if(!W){F.g.visible=false;return}
    const u=W.userData;if(!u.p0){u.p0=W.position.clone();u.s0=W.scale.x}
    // during the shot the bow is held by its grip (it is carried by the string side) and its limbs flex as it is drawn
    g=g||0;W.scale.x=u.s0*(1-.6*g+.12*k*g);W.position.copy(u.p0);W.position.z-=g*.555*W.scale.x;
    if(g<=0||!pl.visible){F.g.visible=false;return}
    if(F.g.parent!==scene)scene.add(F.g);
    pl.updateMatrixWorld(true);
    const V=THREE.Vector3,t1=new V(-.062,.594,0).applyMatrix4(W.matrixWorld),t2=new V(-.062,-.594,0).applyMatrix4(W.matrixWorld),grip=new V(-.555,0,0).applyMatrix4(W.matrixWorld);
    const hand=new V(0,-.03,.02).applyMatrix4(pl.bones.aR2.matrixWorld);
    // the nock point sits between the string's rest line and the drawing hand
    const rest=t1.clone().add(t2).multiplyScalar(.5),nock=rest.clone().lerp(hand,Math.min(1,k));
    const pa=F.str.geometry.attributes.position;pa.setXYZ(0,t1.x,t1.y,t1.z);pa.setXYZ(1,nock.x,nock.y,nock.z);pa.setXYZ(2,t2.x,t2.y,t2.z);pa.needsUpdate=true;
    const dir=grip.clone().sub(nock);if(dir.lengthSq()<1e-6){F.g.visible=false;return}dir.normalize();
    F.arrow.position.copy(nock).addScaledVector(dir,.42*.82);F.arrow.lookAt(F.arrow.position.clone().add(dir));F.arrow.visible=k>0;F.g.visible=true;
  }catch(e){if(BOW_FX)BOW_FX.g.visible=false}
}
function bowPose(k){
  // keyframes: N nock (string hand at the bow), D full draw (anchor at the cheek, elbow high, side-on), X release follow-through
  // lw turns the bow hand so the bow stays upright when the arm is raised
  const N={lx:-1.45,lz:-.3,lw:1.45,le:-.05,ax:0,az:1.4,ay:-1.15,ex:-.6,sy:.4,py:.1,sx:.03,hx:-.02,hy:-.45};
  const D={lx:-1.5,lz:-.42,lw:1.5,le:0,ax:0,az:1.4,ay:-.55,ex:-2.7,sy:.75,py:.2,sx:-.04,hx:-.06,hy:-.85};
  const X={lx:-1.42,lz:-.36,lw:1.42,le:-.08,ax:-.05,az:1.5,ay:-.08,ex:-1.3,sy:.78,py:.2,sx:-.09,hx:-.08,hy:-.85};
  if(k<.14)return haMix(N,N,0);                                              // (blend-in from the current pose does the raise)
  if(k<.47)return haMix(N,D,haIO((k-.14)/.33));                             // draw
  if(k<.53){const P=haMix(D,D,0);P.ex-=.05*Math.sin((k-.47)/.06*Math.PI);return P} // anchor, tiny settle
  if(k<.6)return haMix(D,X,haOut((k-.53)/.07));                             // release snap
  if(k<.74)return X;                                                         // hold the follow-through
  return haMix(X,{lx:-.3,lz:0,lw:0,le:-.25,ax:-.2,az:0,ay:0,ex:-.3,sy:0,py:0,sx:.03,hx:0,hy:0},haIO((k-.74)/.26));
}
function xbowPose(k){
  // rw turns the trigger hand so the crossbow stays level against the cheek while the arm is raised
  const S={ax:-1.25,az:-.28,ex:-1.0,rw:2.25,lx:-1.35,lz:.72,le:-.6,sy:.28,py:.06,sx:.06,hx:.14,hy:-.22};
  const C={ax:-.55,az:.1,ex:-1.6,rw:2.55,lx:-1.0,lz:.45,le:-.9,sy:.2,py:.04,sx:.14,hx:.22,hy:-.15}; // tilt down and crank the string back
  const kick=j=>{const P=haMix(S,S,0);P.ax+=.22*j;P.rw-=.35*j;P.lx+=.18*j;P.sx-=.14*j;P.hx-=.1*j;return P};
  if(k<.2)return S;                                             // (blend-in raises it to the shoulder)
  if(k<.54){const P=haMix(S,S,0);P.sx+=.02*Math.sin((k-.2)/.34*Math.PI);return P} // sight, hold steady
  if(k<.62)return kick(haOut((k-.54)/.08));                     // recoil: muzzle climbs, shoulder pushed back
  if(k<.8)return haMix(kick(1),C,haIO((k-.62)/.18));             // crank
  return haMix(C,{ax:-.2,az:0,ex:-.3,rw:0,lx:-.3,lz:0,le:-.25,sy:0,py:0,sx:.03,hx:0,hy:0},haIO((k-.8)/.2));
}
bowAnim=function(ms){
  const wt=typeof curWT=='function'?curWT():null;
  if(wt=='crossbow'){haPlay(ms,xbowPose,2,null,.2);return}
  haPlay(ms,bowPose,2,null,.18);
  const A=HA.cur;if(!A)return;
  A.tick=k=>bowFxSet(k<.12||k>=.53?0:gaSS(.12,.47,k)*.97+.03,k<.12?haOut(k/.12):k<.76?1:1-haIO(Math.min(1,(k-.76)/.2)));
  A.end=()=>bowFxSet(0,0);
};

// ---------------- mounts ----------------
// The v83 mount rig keeps its own flames/wings/idle; the walk is replaced by the shared gait (walk → trot → gallop for
// four legs, a running stride for the raptor) driven by the real riding speed, with head nod, back flex, and tail flow.
function mtGait(r,k){
  const S=(typeof LGMS!='undefined'&&LGMS[k])||null,o=r.rig,b=r.b;if(!o||!b||!S)return;
  const hips=r.children.filter(c=>c.isBone&&c!==b);if(!hips.length)return;
  const biped=!!S.biped,legs=hips.map((h,i)=>({hip:h,kn:h.children.find(c=>c.isBone),key:biped?(i?'hr':'hl'):(h.position.z>0?'f':'h')+(h.position.x<0?'l':'r')}));
  const bb=b.children.filter(c=>c.isBone),neck=bb[0],tail=bb[1],head=neck&&neck.children.find(c=>c.isBone);
  const n0=neck?neck.rotation.x:0,h0=head?head.rotation.x:0,t0=tail?tail.rotation.x:0,Lm=hips[0].position.y;
  r.rig=function(now,mv,sp){
    o(now,mv,sp); // flames, wing beats, idle breathing; the gait below overrides legs/body/neck/tail
    const G=gaStep(r,now,mv,sp,Lm,1.1,3.6),TAU=Math.PI*2,w=G.w,P=G.ph,Fr=G.Fr||0,id=1-w;
    const run=gaSS(.3,1.4,Fr),gal=biped?0:gaSS(1.6,3.6,Fr);
    const beta=biped?.6-.24*run:.62-.17*run-.14*gal,amp=Math.min(biped?.75:.6,Math.asin(Math.min(.95,beta*(G.D||0)/(2*G.L*.95))))*w,lift=(.55+.4*run+.2*gal)*w;
    legs.forEach(q=>{let off;
      if(biped)off=q.key=='hl'?0:.5;else{const wk=GA_OFF.walk[q.key],tr=GA_OFF.trot[q.key],ga=GA_OFF.gal[q.key];off=(wk+(tr-wk)*run)*(1-gal)+ga*gal}
      const g=gaLeg(P+off,beta,_gaO),front=q.key[0]=='f'&&!biped;
      q.hip.rotation.x=g[0]*amp;if(q.kn)q.kn.rotation.x=(g[1]*lift*1.05+g[2]*.1*w)*(front?-1:1)*(biped?-1:1)});
    const c2=Math.cos(TAU*2*(P-beta*.5));
    const bob=w*((1-run)*.012*(.5+.5*c2)+run*(1-gal)*.04*(.5-.5*c2)+gal*.07*(.5+.5*Math.cos(TAU*(P-.92))))*(biped?1.4:1);
    b.position.y=bob+id*Math.sin(now/1000*1.6)*.008;
    b.rotation.x=w*(gal*-.05*Math.sin(TAU*(P-.05))+(1-gal)*.015*Math.sin(TAU*2*P))+gaCl(-G.acc*.008,-.05,.05)*w;
    b.rotation.z=gaCl(-G.turn*G.v*.012,-.12,.12)*w;
    // head and neck: walking horses nod twice a stride, gallopers once; the head keeps level against the body's rocking
    if(neck)neck.rotation.x=n0+w*((1-gal)*.06*(1-run*.5)*Math.sin(TAU*2*P-.6)+gal*.1*Math.sin(TAU*(P-.2)))+id*Math.sin(now/1000*1.1)*.04+.05*run*w;
    if(neck)neck.rotation.y=gaCl(G.turn*.08,-.25,.25)*w;
    if(head)head.rotation.x=h0-b.rotation.x*.6;
    if(tail){tail.rotation.z=id*Math.sin(now/1000*2.2)*.12+w*Math.sin(TAU*P)*(.14-.08*gal)-gaCl(G.tl,-3,3)*.08*w;tail.rotation.x=t0+w*(-.12*run+.08*gal*Math.cos(TAU*(P-.15)))}
  };
}
{const f=mkMountRig;mkMountRig=function(k){const r=f.apply(this,arguments);try{mtGait(r,LGMS[k]?k:'pony')}catch(e){console.error('mount gait',e)}return r}}

// ---------------- enemy archers use the hero's bow shot ----------------
// Any humanoid foe whose look carries a bow (bone archer, naga archer, ...) plays bowPose over its 'throw' attack:
// wind-up = raise and draw, act = release (the arrow flies then), recover = follow-through and relax.
// Each archer gets its own drawn string and nocked arrow.
{const f=mkHumanoid;mkHumanoid=function(key){const g=f.apply(this,arguments);try{const L=HUMLOOK[key];if(L&&L.wpn=='bow'&&g.h&&g.h.bones){const a=g.h.bones.aL2;
  g.bowW=a.children.find(o=>o.userData&&o.userData.wt=='bow')||a.children[0]||null}}catch(_){}return g}}
function eBowFx(g){if(g.bowFx)return g.bowFx;const B=bowFx(),c=B.g.clone(true);c.visible=false;c.traverse(o=>{if(o.isLine){o.geometry=o.geometry.clone();o.material=o.material.clone()}});
  const arrow=c.children[0],str=c.children[1];return g.bowFx={g:c,arrow,str}}
function eBowFxSet(g,k,gr){const W=g.bowW;if(!W)return;const F=eBowFx(g);
  try{const u=W.userData;if(!u.p0){u.p0=W.position.clone();u.s0=W.scale.x}
    W.scale.x=u.s0*(1-.6*gr+.12*k*gr);W.position.copy(u.p0);W.position.z-=gr*.555*W.scale.x;
    if(gr<=0||!g.visible||!g.parent){F.g.visible=false;return}
    if(F.g.parent!==scene)scene.add(F.g);g.updateMatrixWorld(true);
    const V3=THREE.Vector3,t1=new V3(-.062,.594,0).applyMatrix4(W.matrixWorld),t2=new V3(-.062,-.594,0).applyMatrix4(W.matrixWorld),grip=new V3(-.555,0,0).applyMatrix4(W.matrixWorld);
    const hand=new V3(0,-.03,.02).applyMatrix4(g.h.bones.aR2.matrixWorld),rest=t1.clone().add(t2).multiplyScalar(.5),nock=rest.clone().lerp(hand,Math.min(1,k));
    const pa=F.str.geometry.attributes.position;pa.setXYZ(0,t1.x,t1.y,t1.z);pa.setXYZ(1,nock.x,nock.y,nock.z);pa.setXYZ(2,t2.x,t2.y,t2.z);pa.needsUpdate=true;
    const dir=grip.clone().sub(nock);if(dir.lengthSq()<1e-6){F.g.visible=false;return}dir.normalize();
    F.arrow.position.copy(nock).addScaledVector(dir,.42*.82*(g.bs||1));F.arrow.scale.setScalar(.82*(g.bs||1));F.arrow.lookAt(F.arrow.position.clone().add(dir));F.arrow.visible=k>0;F.g.visible=true}
  catch(e){F.g.visible=false}}
{const f=humAnim;humAnim=function(g,now,mv){const r=f.apply(this,arguments);try{
  if(!g.bowW)return r;const a=g.ak;
  if(!a||a.n!=='throw'){if(g.bowFx&&g.bowFx.g.visible)eBowFxSet(g,0,0);return r}
  // map the attack phases onto the hero's bow timeline (release at .53)
  const kb=a.ph==0?.47*a.k:a.ph==1?.53+.07*Math.min(1,a.k):.6+.4*(1-a.k);
  const P=bowPose(kb),wt=a.ph==0?Math.min(1,kb/.12):a.ph==2?1-gaSS(.86,1,kb):1,b=g.h.bones;
  for(const k in P){const ch=HACH[k];if(!ch)continue;const bn=b[ch[0]];if(!bn)continue;const cur=bn.rotation[ch[1]];bn.rotation[ch[1]]=cur+(P[k]-cur)*wt}
  const draw=kb<.12||kb>=.53?0:gaSS(.12,.47,kb)*.97+.03,grip=kb<.12?haOut(kb/.12):kb<.76?1:1-haIO(Math.min(1,(kb-.76)/.2));
  eBowFxSet(g,draw,grip)}catch(e){}return r}}
// tidy up an archer's string and arrow when it dies or despawns
{const f=removeE;removeE=function(e){try{const F=e&&e.m&&e.m.bowFx;if(F&&F.g.parent)F.g.parent.remove(F.g)}catch(_){}return f.apply(this,arguments)}}
{const f=kill;kill=function(e){try{const F=e&&e.m&&e.m.bowFx;if(F)F.g.visible=false}catch(_){}return f.apply(this,arguments)}}

// ======================= v85: attack animation pass (hero, humanoid foes, creatures, companions, Sovereigns) =======================
// Hero attacks are keyframe tracks played by the v81 action system (haPlay). Every track has the same beats:
// anticipation (coil back, weight onto the back foot) → strike (hips lead, then chest, then arm, wrist last) →
// follow-through (overshoot past the contact pose) → recover (eases back to the walk/run layer).
// The strike's contact pose sits exactly at the existing hit time (swing/spin .42), and durations are unchanged.
var ATK_REST={sy:0,sx:.04,py:0,ax:-.2,az:0,ay:0,ex:-.3,lx:0,lz:0,le:-.25,hx:0,hy:0,lh:0,rh:0,lk:0,rk:0,pz:0,dy:0,lw:0,rw:0};
// per-channel timing offset (fraction of the action): negative = moves earlier (hips and legs lead), positive = trails (elbow, wrist)
var ATK_LAG={py:-.045,dy:-.035,lh:-.04,rh:-.04,lk:-.04,rk:-.04,pz:-.035,sy:-.02,sx:-.015,hx:-.03,hy:-.035,ax:0,az:0,ay:0,lx:.008,lz:.008,ex:.015,le:.015,rw:.025,lw:.025};
var ATK_E={io:x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2,in:x=>x*x*x,in2:x=>x*x,out:x=>1-Math.pow(1-x,3),out2:x=>1-(1-x)*(1-x),lin:x=>x};
// keys: [[k, pose, ease-into-this-key], ...] (k ascending, first k = 0). Missing channels use ATK_REST.
function atkTrack(keys,noLag){
  const C={};keys.forEach(q=>{for(const c in q[1])C[c]=1});const ch=Object.keys(C),n=keys.length;
  return function(k){const o={};
    for(const c of ch){const kk=Math.max(0,Math.min(1,k-(noLag?0:(ATK_LAG[c]||0))));let i=0;while(i<n-2&&kk>keys[i+1][0])i++;
      const A=keys[i],B=keys[i+1],a=A[1][c]!=null?A[1][c]:ATK_REST[c],bv=B[1][c]!=null?B[1][c]:ATK_REST[c],t=Math.max(0,Math.min(1,(kk-A[0])/((B[0]-A[0])||1)));
      o[c]=a+(bv-a)*(ATK_E[B[2]||'io'])(t)}
    return o}}
function atkMix(A,B,t){const o=Object.assign({},A);for(const k in B)o[k]=(A[k]!=null?A[k]:ATK_REST[k])+(B[k]-(A[k]!=null?A[k]:ATK_REST[k]))*t;return o}
function atkAdd(A,B){const o=Object.assign({},A);for(const k in B)o[k]=(o[k]!=null?o[k]:ATK_REST[k])+B[k];return o}
// mirror a right-handed pose onto the left hand (for dual-wield off-hand strikes)
function atkMirror(P){const o={};for(const k in P){const v=P[k];
  if(k=='ax')o.lx=v;else if(k=='az')o.lz=-v;else if(k=='ex')o.le=v;else if(k=='rw')o.lw=v;else if(k=='lx')o.ax=v;else if(k=='lz')o.az=-v;else if(k=='le')o.ex=v;else if(k=='lw')o.rw=v;
  else if(k=='sy'||k=='py'||k=='hy'||k=='pz')o[k]=-v;else if(k=='lh')o.rh=v;else if(k=='rh')o.lh=v;else if(k=='lk')o.rk=v;else if(k=='rk')o.lk=v;else if(k=='ay'){}else o[k]=v}
  return o}
// the standard beat sheet for a melee strike: W wind-up, S contact (at .42), O follow-through; heavy = longer coil and a deeper settle
function atkSwing(W,S,O,heavy){
  const h=heavy||0,W2=atkAdd(W,{sx:-.03*h,dy:-.012*h}),S2=O||atkAdd(S,{}),Rc=atkMix(S2,ATK_REST,.35);
  return atkTrack([[0,atkMix(ATK_REST,W,.55),'io'],[.2+.05*h,W,'out'],[.31,W2,'io'],[.42,S,'in2'],[.52,S2,'out'],[.64+.04*h,Rc,'io'],[1,ATK_REST,'io']])}
// head keeps the eyes on the target while the torso twists
function atkEyes(P){const o=Object.assign({},P);if(o.hy==null)o.hy=-((o.sy||0)+(o.py||0))*.75;return o}
// ---------------- the move library ----------------
var ATK={};
(function(){
  const E=atkEyes;
  // one-handed sword / generic: backhand (left→right), forehand (right→left), overhead chop
  const bhW=E({rw:.7,sy:.8,py:.3,sx:-.08,ax:-1.2,az:-.75,ex:-1.0,lx:-.55,lz:.15,le:-.9,lh:-.18,rh:.16,lk:.22,rk:.12,dy:-.03,pz:.05});
  const bhS=E({rw:1.0,sy:-.15,py:-.1,sx:.16,ax:-1.5,az:.2,ex:-.05,lx:.1,lz:-.1,le:-.6,lh:-.28,rh:.22,lk:.32,rk:.08,dy:-.05});
  const bhO=E({rw:.9,sy:-.9,py:-.42,sx:.2,ax:-1.3,az:1.2,ex:-.2,lx:.35,lz:-.25,le:-.6,lh:-.28,rh:.22,lk:.34,rk:.08,dy:-.05,pz:-.06});
  const fhW=E({ay:.45,rw:.5,sy:-.95,py:-.35,sx:-.06,ax:-1.55,az:1.15,ex:-.5,lx:.2,lz:-.1,le:-.9,lh:.12,rh:-.2,lk:.12,rk:.25,dy:-.03,pz:-.05});
  const fhS=E({rw:1.0,sy:.15,py:.1,sx:.15,ax:-1.5,az:-.2,ex:-.05,lx:-.3,lz:.15,le:-.6,lh:-.28,rh:.2,lk:.3,rk:.1,dy:-.05});
  const fhO=E({rw:.9,sy:.9,py:.42,sx:.18,ax:-1.1,az:-.9,ex:-.25,lx:-.5,lz:.2,le:-.7,lh:-.28,rh:.2,lk:.32,rk:.1,dy:-.05,pz:.06});
  const ohW=E({sy:.3,py:.12,sx:-.22,ax:-2.95,az:.15,ex:-.75,lx:-1.6,lz:.1,le:-.6,hx:-.12,lh:-.12,rh:.2,lk:.2,rk:.25,dy:-.02});
  const ohS=E({rw:.45,sy:-.05,py:-.1,sx:.3,ax:-1.25,az:.05,ex:-.05,lx:-.9,le:-.3,hx:.06,lh:-.38,rh:.3,lk:.45,rk:.22,dy:-.08});
  const ohO=E({rw:.5,sy:-.12,py:-.12,sx:.5,ax:-.45,az:0,ex:-.15,lx:-.35,le:-.35,hx:.12,lh:-.38,rh:.3,lk:.52,rk:.28,dy:-.1});
  ATK.sword=[atkSwing(bhW,bhS,bhO),atkSwing(fhW,fhS,fhO),atkSwing(ohW,ohS,ohO,1)];
  // two-handed great weapons: the off hand rides the grip, bigger coil, deeper crouch on the hit
  const two=P=>Object.assign({},P,{lx:(P.ax||0)*.92+.1,lz:(P.az||0)*.85+.15,le:Math.min(-.35,(P.ex||0)-.25)});
  const big=(P,f)=>atkAdd(P,{sy:(P.sy||0)*.15*f,py:(P.py||0)*.2*f,dy:-.02*f,lk:.06*f,rk:.04*f});
  ATK.great=[atkSwing(two(big(bhW,1)),two(big(bhS,1)),two(big(bhO,1)),1),atkSwing(two(big(fhW,1)),two(big(fhS,1)),two(big(fhO,1)),1),
    atkSwing(two(atkAdd(ohW,{ax:-.1,sx:-.06,dy:-.01})),two(atkAdd(ohS,{sx:.08,dy:-.03,lk:.1})),two(atkAdd(ohO,{sx:-.1,dy:-.02})),1.4)];
  // heavy one-handers (mace, hammer): rotate in from the shoulder, more torso, bigger crouch; hammer finisher = two-hand ground slam
  ATK.mace=[atkSwing(big(fhW,1.2),big(fhS,1.2),big(fhO,1.2),1),atkSwing(big(bhW,1.2),big(bhS,1.2),big(bhO,1.2),1),atkSwing(ohW,atkAdd(ohS,{dy:-.02}),ohO,1.2)];
  const slamW=E({sy:.15,sx:-.3,ax:-3.1,az:.05,ex:-.5,lx:-3.0,lz:-.05,le:-.5,hx:-.2,lh:.05,rh:.05,lk:.12,rk:.12,dy:.0});
  const slamS=E({sy:0,sx:.62,ax:-.55,ex:-.05,lx:-.55,le:-.05,hx:.18,lh:-.45,rh:.35,lk:.85,rk:.55,dy:-.16});
  const slamO=E({sy:0,sx:.66,ax:-.42,ex:-.1,lx:-.42,le:-.1,hx:.2,lh:-.45,rh:.35,lk:.9,rk:.6,dy:-.17});
  ATK.hammer=[ATK.mace[0],ATK.mace[1],atkSwing(slamW,slamS,slamO,2)];
  // axes (dual): right chop, left chop, right, finisher = both axes cross down
  const lfW=atkMirror(fhW),lfS=atkMirror(fhS),lfO=atkMirror(fhO);
  const xW=E({sx:-.25,ax:-2.6,az:.55,ex:-.8,lx:-2.6,lz:-.55,le:-.8,hx:-.12,lk:.15,rk:.15,dy:-.01}),xS=E({rw:.5,lw:.5,sx:.3,ax:-1.35,az:-.2,ex:-.05,lx:-1.35,lz:.2,le:-.05,hx:.06,lh:-.3,rh:.25,lk:.42,rk:.25,dy:-.07}),xO=E({rw:.5,lw:.5,sx:.5,ax:-.55,az:-.45,ex:-.1,lx:-.55,lz:.45,le:-.1,hx:.12,lh:-.3,rh:.25,lk:.52,rk:.3,dy:-.1});
  ATK.axes=[atkSwing(fhW,fhS,fhO),atkSwing(lfW,lfS,lfO),atkSwing(atkAdd(fhW,{ax:-.3}),atkAdd(fhS,{ax:.15}),fhO),atkSwing(xW,xS,xO,1.2)];
  // ---- assassin dagger: low, fast, compact. slash, backhand, stab, rising X-cut finisher; the free hand guards the chin ----
  const g=P=>Object.assign({lx:-.55,lz:.3,le:-1.35,lw:.6},P),low=P=>atkAdd(P,{dy:-.035,lk:.12,rk:.12,sx:.08});
  const dSlW=low(E(g({sy:-.8,py:-.3,ax:-1.6,az:1.2,ex:-1.1,rw:.7,lh:.1,rh:-.15,lk:.1,rk:.2}))),dSlS=low(E(g({sy:.1,py:.05,ax:-1.5,az:-.12,ex:-.05,rw:1.0,lh:-.3,rh:.18,lk:.32,rk:.08,sx:.12}))),dSlO=low(E(g({sy:.7,py:.35,ax:-1.15,az:-.85,ex:-.3,rw:.9,lh:-.3,rh:.18,lk:.34,rk:.08,sx:.14})));
  const dBhW=low(E(g({sy:.75,py:.3,ax:-1.25,az:-.85,ex:-1.4,rw:.5,lh:-.15,rh:.12}))),dBhS=low(E(g({sy:-.6,py:-.3,ax:-1.5,az:.95,ex:-.1,rw:.5,lh:-.3,rh:.2,lk:.3,sx:.12}))),dBhO=low(E(g({sy:-.75,py:-.38,ax:-1.3,az:1.2,ex:-.3,rw:.4,lh:-.3,rh:.2,lk:.32,sx:.14})));
  const dStW=low(E(g({sy:.55,py:.3,sx:-.06,ax:-.75,az:.15,ex:-1.9,rw:1.1,lx:-1.2,lz:.1,le:-.9,lh:-.1,rh:.2,rk:.3}))),dStS=low(E(g({sy:-.35,py:-.25,sx:.3,ax:-1.55,az:-.05,ex:-.02,rw:1.2,lx:-.3,lz:.4,le:-1.6,lh:-.45,rh:.32,lk:.5,rk:.12,dy:-.03}))),dStO=atkAdd(dStS,{sx:.04,ax:.12,ex:-.15});
  const dXW=E({sx:.32,ax:-.35,az:-.45,ex:-1.3,rw:.6,lx:-.35,lz:.45,le:-1.3,lw:.6,hx:.15,lh:-.25,rh:.25,lk:.75,rk:.65,dy:-.14});
  const dXS=E({sx:.08,ax:-1.55,az:-.3,ex:-.1,rw:.9,lx:-1.55,lz:.3,le:-.1,lw:.9,lh:-.2,rh:.2,lk:.35,rk:.3,dy:-.06});
  const dXO=E({sx:-.12,ax:-2.55,az:.75,ex:-.2,rw:.3,lx:-2.55,lz:-.75,le:-.2,lw:.3,hx:-.15,lh:-.08,rh:.12,lk:.05,rk:.05,dy:.02});
  const gR=P=>Object.assign({},P,{ax:-.55,az:-.3,ex:-1.35,rw:.6});
  ATK.dagger=[atkSwing(dSlW,dSlS,dSlO),atkSwing(atkMirror(gR(dSlW)),atkMirror(gR(dSlS)),atkMirror(gR(dSlO))),atkSwing(dStW,dStS,dStO),atkSwing(dXW,dXS,dXO,1)];
  // ---- claws (dual): alternating rakes that dip low, then a crouch-and-spring double rake ----
  const cR_W=low(E({sy:-.7,py:-.3,ax:-2.1,az:.9,ex:-1.0,rw:.3,lx:-.8,lz:.2,le:-1.4,lh:.1,rh:-.15})),cR_S=low(E({sy:.15,py:.08,sx:.22,ax:-1.35,az:-.1,ex:-.1,rw:.5,lx:-.9,lz:.15,le:-1.3,lh:-.3,rh:.2,lk:.32})),cR_O=low(E({sy:.65,py:.33,sx:.26,ax:-.75,az:-.65,ex:-.25,rw:.4,lx:-.9,lz:.15,le:-1.3,lh:-.3,rh:.2,lk:.34}));
  const cU_W=low(E({sy:-.35,py:-.2,sx:.25,ax:-.15,az:.35,ex:-.6,rw:.2,lx:-1.0,le:-1.3,lk:.4,rk:.3,dy:-.04})),cU_S=E({sy:.25,py:.15,sx:.08,ax:-1.6,az:-.15,ex:-.15,rw:.5,lx:-.7,le:-1.4,lh:-.25,rh:.15,lk:.22,dy:-.02}),cU_O=E({sy:.4,py:.22,sx:-.08,ax:-2.5,az:-.25,ex:-.3,rw:.2,lx:-.7,le:-1.4,lh:-.25,rh:.15,lk:.12,dy:0});
  const cF_W=E({sx:.4,ax:-.4,az:.5,ex:-1.4,lx:-.4,lz:-.5,le:-1.4,hx:.15,lh:-.3,rh:.3,lk:.85,rk:.75,dy:-.16});
  const cF_S=E({sx:.3,ax:-1.5,az:-.35,ex:-.1,rw:.5,lx:-1.5,lz:.35,le:-.1,lw:.5,lh:-.5,rh:.45,lk:.25,rk:.15,dy:.03});
  const cF_O=E({sx:.48,ax:-.65,az:-.6,ex:-.2,rw:.4,lx:-.65,lz:.6,le:-.2,lw:.4,hx:.12,lh:-.5,rh:.45,lk:.55,rk:.4,dy:-.08});
  ATK.claws=[atkSwing(cR_W,cR_S,cR_O),atkSwing(atkMirror(cR_W),atkMirror(cR_S),atkMirror(cR_O)),atkSwing(cU_W,cU_S,cU_O),atkSwing(atkMirror(cU_W),atkMirror(cU_S),atkMirror(cU_O)),atkSwing(cF_W,cF_S,cF_O,1.3)];
  // ---- halberd: two thrusts with a front-foot lunge stance (no travel), finisher = wide sweep ----
  const tW=E({sy:.55,py:.3,sx:-.1,ax:-.85,az:.1,ex:-1.55,rw:1.0,lx:-1.1,lz:.25,le:-.9,lh:-.15,rh:.25,rk:.35,dy:-.03});
  const tS=E({sy:-.3,py:-.2,sx:.28,ax:-1.5,az:-.05,ex:-.05,rw:1.05,lx:-1.45,lz:.15,le:-.4,lh:-.5,rh:.35,lk:.55,rk:.1,dy:-.07});
  ATK.halberd=[atkSwing(tW,tS,atkAdd(tS,{sx:.05,ax:-.05})),atkSwing(atkAdd(tW,{ax:-.2,sy:.1}),atkAdd(tS,{ax:-.12}),atkAdd(tS,{sx:.05})),atkSwing(two(big(fhW,1.4)),two(big(fhS,1.4)),two(big(fhO,1.6)),1.3)];
  ATK.thrust=atkSwing(tW,tS,atkAdd(tS,{sx:.05}));
  // ---- thrown knives: cock back over the shoulder, off hand points, whip through and release on the hit frame ----
  const kW=E({sy:.75,py:.35,sx:-.14,ax:-2.55,az:.35,ex:-1.7,rw:-.3,lx:-1.45,lz:-.1,le:-.1,lh:-.25,rh:.15,rk:.3,dy:-.02});
  const kS=E({sy:-.45,py:-.3,sx:.25,ax:-1.45,az:-.1,ex:-.15,rw:.4,lx:-.35,lz:.2,le:-1.0,lh:-.32,rh:.2,lk:.35,dy:-.05});
  const kO=E({sy:-.7,py:-.4,sx:.32,ax:-.75,az:-.35,ex:-.35,rw:.5,lx:-.2,lz:.3,le:-1.1,lh:-.32,rh:.2,lk:.38,dy:-.05});
  ATK.knives=atkSwing(kW,kS,kO);
  // ---- sling: two whirls overhead, then a forward release ----
  const sl=a=>E({sy:.25,py:.1,sx:-.08,ax:-2.6+Math.cos(a)*.35,az:.45+Math.sin(a)*.5,ex:-.4,lx:-1.0,lz:.1,le:-.5,lh:-.12,rh:.12,rk:.15});
  ATK.sling=atkTrack([[0,atkMix(ATK_REST,sl(0),.6)],[.08,sl(0),'io'],[.15,sl(2.1),'lin'],[.22,sl(4.2),'lin'],[.29,sl(6.28),'lin'],[.42,E({sy:-.4,py:-.28,sx:.2,ax:-1.3,az:.1,ex:-.05,lx:-.4,le:-.6,lh:-.3,rh:.2,lk:.3,dy:-.04}),'in'],
    [.54,E({sy:-.55,py:-.35,sx:.24,ax:-.7,az:-.1,ex:-.2,lx:-.3,le:-.6,lh:-.3,rh:.2,lk:.32,dy:-.04}),'out'],[1,ATK_REST,'io']]);
  // ---- spin (flail strikes, whirl finishers): coil, hips whip round first, arms stretched out, shoulders follow ----
  ATK.spin=k=>{const c=k<.16?ATK_E.io(k/.16):1,e=k<.14?0:ATK_E.io(Math.min(1,(k-.14)/.66)),u=k<.14?ATK_E.out(k/.14):k>.82?1-ATK_E.io((k-.82)/.18):1,lagS=k<.18?0:ATK_E.io(Math.min(1,(k-.18)/.66));
    return {py:-.55*c*(1-e)+e*Math.PI*2,sy:-.35*c*(1-lagS)+(lagS-e)*1.2,ax:-1.35*u,az:1.15*u,ex:-.2*u-.3*(1-u),rw:.3*u,lx:-.5*u,lz:-.9*u,le:-.4,sx:.08*u-.06*c*(1-e),
      lh:-.2*u,rh:.2*u,lk:.35*u,rk:.3*u,dy:-.06*u,hy:.35*c*(1-e)}};
  // ---- staves / wands / orbs (release frames at .45 / .385 / .43 of the animation) ----
  ATK.staff=atkTrack([[0,ATK_REST],[.12,E({sx:-.06,ax:-1.2,ex:-1.0,lx:-.9,le:-1.0,sy:.25,lk:.1,dy:-.02}),'out'],[.32,E({sx:-.18,hx:-.15,ax:-2.65,az:.15,ex:-.55,lx:-.7,lz:.25,le:-1.2,sy:.4,py:.15,lh:-.1,rh:.15,rk:.2,dy:-.01}),'io'],
    [.45,E({sx:.25,hx:.05,ax:-1.55,az:.0,ex:-.08,rw:.3,lx:-1.1,lz:.1,le:-.6,sy:-.2,py:-.12,lh:-.32,rh:.22,lk:.38,dy:-.06}),'in'],[.58,E({sx:.28,ax:-1.45,ex:-.12,rw:.3,lx:-1.0,le:-.6,sy:-.25,py:-.15,lh:-.32,rh:.22,lk:.38,dy:-.06}),'out'],[1,ATK_REST,'io']]);
  ATK.wand=atkTrack([[0,ATK_REST],[.24,E({sy:.45,py:.2,sx:-.08,ax:-2.1,az:.4,ex:-1.6,rw:-.4,lx:-.6,lz:.2,le:-1.1,lh:-.1,rh:.15,rk:.15,dy:-.02}),'out'],
    [.385,E({sy:-.3,py:-.2,sx:.16,ax:-1.5,az:.05,ex:-.1,rw:.5,lx:-.3,le:-.9,lh:-.25,rh:.18,lk:.25,dy:-.04}),'in'],[.5,E({sy:-.38,py:-.22,sx:.18,ax:-1.35,az:-.05,ex:-.2,rw:.55,lx:-.3,le:-.9,lh:-.25,rh:.18,lk:.25,dy:-.04}),'out'],[1,ATK_REST,'io']]);
  ATK.orb=atkTrack([[0,ATK_REST],[.28,E({sy:-.45,py:-.2,sx:-.1,lx:-.85,lz:.45,le:-1.75,ax:-.75,az:-.2,ex:-1.4,hx:-.08,lh:.12,rh:-.15,lk:.2,dy:-.03}),'out'],
    [.43,E({sy:.35,py:.2,sx:.18,lx:-1.6,lz:-.05,le:-.04,ax:-.5,az:.15,ex:-.6,hx:.04,lh:-.3,rh:.22,lk:.3,dy:-.05}),'in'],[.56,E({sy:.42,py:.22,sx:.2,lx:-1.55,lz:-.1,le:-.1,ax:-.45,ex:-.6,lh:-.3,rh:.22,lk:.3,dy:-.05}),'out'],[1,ATK_REST,'io']]);
  // ---- class skills: effects fire on the cast frame, so the motion commits fast and shows the follow-through ----
  const push=E({sx:.2,ax:-1.65,az:.25,ex:-.08,lx:-1.65,lz:-.25,le:-.08,hx:-.02,lh:-.3,rh:.22,lk:.3,dy:-.05});
  ATK.cast=atkTrack([[0,atkMix(ATK_REST,E({sx:-.12,ax:-.9,ex:-1.7,lx:-.9,le:-1.7,az:-.25,lz:.25,dy:-.03}),.6)],[.16,E({sx:-.14,hx:-.1,ax:-1.0,ex:-1.8,lx:-1.0,le:-1.8,az:-.3,lz:.3,dy:-.04,rk:.2}),'out'],
    [.34,push,'in'],[.6,atkAdd(push,{ax:-.1,lx:-.1}),'out'],[1,ATK_REST,'io']]);
  ATK.raise=atkTrack([[0,ATK_REST],[.2,E({sx:.1,ax:-.6,ex:-1.4,lx:-.6,le:-1.4,dy:-.06,lk:.35,rk:.35,hx:.1}),'out'],[.42,E({sx:-.2,hx:-.35,ax:-2.9,az:.35,ex:-.1,lx:-2.9,lz:-.35,le:-.1,dy:.01}),'in'],[.7,E({sx:-.18,hx:-.3,ax:-2.8,az:.4,ex:-.15,lx:-2.8,lz:-.4,le:-.15}),'out'],[1,ATK_REST,'io']]);
  ATK.nova=atkTrack([[0,ATK_REST],[.2,E({sx:-.2,hx:-.2,ax:-2.6,az:.3,ex:-.6,lx:-2.6,lz:-.3,le:-.6,dy:.01}),'out'],[.36,E({sx:.55,hx:.2,ax:-.3,az:.9,ex:-.1,lx:-.3,lz:-.9,le:-.1,lh:-.35,rh:.3,lk:.8,rk:.6,dy:-.15}),'in'],
    [.6,E({sx:.5,hx:.2,ax:-.2,az:1.1,ex:-.1,lx:-.2,lz:-1.1,le:-.1,lh:-.35,rh:.3,lk:.82,rk:.62,dy:-.15}),'out'],[1,ATK_REST,'io']]);
  ATK.flex=atkTrack([[0,ATK_REST],[.25,E({sx:.12,ax:-.5,az:.5,ex:-1.9,lx:-.5,lz:-.5,le:-1.9,dy:-.05,lk:.3,rk:.3,hx:.1}),'out'],[.5,E({sx:-.15,hx:-.25,ax:-.4,az:1.3,ex:-1.6,lx:-.4,lz:-1.3,le:-1.6,dy:0}),'in'],[.75,E({sx:-.12,hx:-.2,ax:-.4,az:1.25,ex:-1.6,lx:-.4,lz:-1.25,le:-1.6}),'out'],[1,ATK_REST,'io']]);
  ATK.leap=atkTrack([[0,ATK_REST],[.12,E({sx:.35,ax:-.2,az:.3,ex:-.6,lx:-.2,lz:-.3,le:-.6,lk:.9,rk:.9,lh:-.4,rh:-.4,dy:-.14}),'out'],[.3,E({sx:-.1,ax:-2.8,ex:-.4,lx:-2.8,le:-.4,lk:.2,rk:1.0,lh:-.3,rh:.4,dy:.02}),'out'],
    [.62,E({sx:.15,ax:-2.6,ex:-.6,lx:-2.6,le:-.6,lk:1.4,rk:1.4,lh:-1.1,rh:-1.0,dy:.03}),'io'],[.78,E({sx:.6,hx:.2,ax:-.4,az:.4,ex:-.1,lx:-.4,lz:-.4,le:-.1,lk:1.1,rk:.9,lh:-.6,rh:.3,dy:-.2}),'in'],[1,ATK_REST,'io']]);
  ATK.dash=atkTrack([[0,ATK_REST],[.2,E({sx:.45,ax:.6,ex:-.4,lx:.6,le:-.4,lh:-.35,rh:.45,lk:.4,rk:.5,dy:-.06,hx:-.15}),'out'],[.7,E({sx:.4,ax:.5,ex:-.5,lx:.5,le:-.5,lh:-.3,rh:.4,lk:.35,rk:.5,dy:-.05,hx:-.15}),'lin'],[1,ATK_REST,'io']]);
  ATK.point=atkTrack([[0,ATK_REST],[.25,E({sy:.4,py:.2,sx:-.04,ax:-.6,az:.3,ex:-1.4,lx:-.4,le:-.5}),'out'],[.45,E({sy:-.25,py:-.15,sx:.12,ax:-1.6,az:-.05,ex:-.02,rw:.4,lx:-.3,le:-1.0,lh:-.25,rh:.18,lk:.25,dy:-.03}),'in'],[.65,E({sy:-.3,py:-.15,sx:.14,ax:-1.55,ex:-.05,rw:.4,lx:-.3,le:-1.0,lh:-.25,rh:.18,lk:.25,dy:-.03}),'out'],[1,ATK_REST,'io']]);
  ATK.drink=atkTrack([[0,ATK_REST],[.25,E({lx:-1.1,lz:.55,le:-2.3,lw:.4,hx:-.05,ax:-.3}),'out'],[.4,E({lx:-1.45,lz:.6,le:-2.4,lw:.9,hx:-.4,sx:-.08,ax:-.3}),'io'],[.7,E({lx:-1.5,lz:.6,le:-2.4,lw:1.0,hx:-.45,sx:-.1,ax:-.3}),'lin'],[1,ATK_REST,'io']]);
})();
// which move set the hero's equipped weapon uses
function atkWT(){let wt=null;try{wt=typeof curWT=='function'?curWT():null}catch(_){}
  if(!wt){const C=CLS[hero.cls]||{};wt=C.atk=='melee4'?'dagger':C.atk=='staff'?'staff':C.atk=='bow'?'bow':'gs'}return wt}
function atkPick(st){
  const wt=atkWT(),N=MW[wt]?MW[wt].N:(CLS[hero.cls]||{}).atk=='melee4'?4:3,step=((combo|0)+N-1)%N,L=ATK;
  if(wt=='knives')return L.knives;if(wt=='sling')return L.sling;
  if(wt=='dagger')return L.dagger[Math.min(3,step)];
  if(wt=='claws')return L.claws[Math.min(4,step)];
  if(wt=='axes')return L.axes[Math.min(3,step)];
  if(wt=='halberd')return L.halberd[Math.min(2,step)];
  if(wt=='gs'||wt=='ga')return L.great[st]||L.great[0];
  if(wt=='hammer')return L.hammer[st]||L.hammer[0];
  if(wt=='mace'||wt=='flail')return L.mace[st]||L.mace[0];
  return L.sword[st]||L.sword[0]}
// ---------------- hero action entry points (same names, durations and hit frames as before) ----------------
// zzz_mp.js wrapped the old swingAnim/castAnim to tell co-op peers about the swing (MP.sw); replacing them keeps that signal
function atkMpSig(){try{if(typeof MP!='undefined'&&MP)MP.sw=(MP.sw+1)%1000}catch(_){}}
swingAnim=function(st,ms,onHit){atkMpSig();st=st|0;let P;try{P=atkPick(st)}catch(e){P=ATK.sword[st]||ATK.sword[0]}haPlay(ms||300,P,.42,onHit,.24)};
spinAnim=function(ms,onHit){haPlay(ms,ATK.spin,.42,onHit,.12)};
staffAnim=function(ms){const wt=atkWT();haPlay(ms,wt=='wand'?ATK.wand:wt=='orb'?ATK.orb:ATK.staff,2,null,.2)};
var ATK_SK=null;
castAnim=function(){atkMpSig();const sk=ATK_SK,k=sk&&sk.k;
  const T=k=='nova'||k=='pulse'||k=='trap'?['nova',420]:k=='leap'?['leap',440]:k=='rain'||k=='meteor'?['raise',420]:k=='channel'?null:k=='blink'?['dash',260]:k=='mark'?['point',360]:k=='cone'?['great1',360]:k=='fan'?['spin',380]:['cast',340];
  if(!T){haPlay(320,ATK.cast,2,null,.2);return}
  const P=T[0]=='great1'?ATK.great[1]:T[0]=='spin'?ATK.spin:ATK[T[0]];haPlay(T[1],P,2,null,.15);if(T[0]=='leap'&&HA.cur)HA.cur.legFull=1};
{const f=cast_base;cast_base=function(i){let sk=null;try{sk=heroSkills()[i]}catch(_){}ATK_SK=sk;const cd0=hero.cd&&hero.cd['s'+i]||0;let r;try{r=f.apply(this,arguments)}finally{ATK_SK=null}
  // self buffs (buff/heal/barrier) had no animation: a short power-up flex
  try{if(sk&&(sk.k=='buff'||sk.k=='heal'||sk.k=='barrier')&&(hero.cd['s'+i]||0)>cd0&&!HA.cur)haPlay(420,ATK.flex,2,null,.15)}catch(_){}return r}}
{const f=haDodge;haDodge=function(){const r=f.apply(this,arguments);if(HA.cur)HA.cur.legFull=1;return r}}
{const f=drink;drink=function(){const p=pots,r=f.apply(this,arguments);try{if(pots<p&&!HA.cur&&!pl.sw&&!riding)haPlay(520,ATK.drink,2,null,.15)}catch(_){}return r}}
{const f=drinkMana;drinkMana=function(){const p=sup.p_mp,r=f.apply(this,arguments);try{if(sup.p_mp<p&&!HA.cur&&!pl.sw&&!riding)haPlay(520,ATK.drink,2,null,.15)}catch(_){}return r}}

// ---------------- humanoid foes: wind-up (the dodge tell) → strike → follow-through → recover, on the same phase timings ----------------
// g.ak = {n, ph, k}: ph 0 wind-up (k 0→1), ph 1 act (k 0→1), ph 2 recover (k 1→0). Poses are offsets from the walk layer, so
// they start and end exactly on it. The right hand stays raised through spell wind-ups (zzI_combat's hand glow reads that bone).
var HUM_ATK=(function(){const P=(W,S,O)=>({W,S,O:O||S});return {
  strike:P({sy:.6,py:.25,sx:-.15,ax:-2.6,az:.45,ex:-.9,rw:-.45,lx:-.7,lz:.15,le:-.6,hx:-.1,lh:-.15,rh:.2,rk:.28,dy:-.02},
           {sy:-.35,py:-.2,sx:.3,ax:-1.35,az:-.2,ex:-.1,rw:.6,lx:.15,lz:-.1,le:-.4,hx:.05,lh:-.35,rh:.25,lk:.4,dy:-.06},
           {sy:-.6,py:-.3,sx:.36,ax:-.6,az:-.5,ex:-.25,rw:.5,lx:.3,lz:-.15,le:-.5,hx:.08,lh:-.35,rh:.25,lk:.42,dy:-.07}),
  slam:P({sx:-.32,ax:-3.05,az:.15,ex:-.6,lx:-3.05,lz:-.15,le:-.6,hx:-.22,lk:.18,rk:.18,dy:-.01},
         {sx:.6,ax:-.65,ex:-.05,lx:-.65,le:-.05,hx:.2,lh:-.42,rh:.32,lk:.8,rk:.55,dy:-.15},
         {sx:.64,ax:-.5,ex:-.1,lx:-.5,le:-.1,hx:.22,lh:-.42,rh:.32,lk:.84,rk:.58,dy:-.16}),
  spin:P({sy:-.7,py:-.35,sx:.05,ax:-1.25,az:1.2,ex:-.3,lx:-1.25,lz:-1.2,le:-.3,lk:.32,rk:.32,dy:-.05},
         {sy:.35,py:.2,sx:.12,ax:-1.45,az:1.35,ex:-.1,lx:-1.45,lz:-1.35,le:-.1,lk:.3,rk:.3,dy:-.05}),
  charge:P({sx:.38,ax:-.35,az:.25,ex:-1.4,lx:-.35,lz:-.25,le:-1.4,hx:-.28,lh:-.3,rh:.35,lk:.45,rk:.55,dy:-.08},
           {sx:.48,ax:-1.05,az:-.3,ex:-1.5,lx:-1.05,lz:.3,le:-1.5,hx:-.32,dy:-.05}),
  throw:P({sy:.75,py:.3,sx:-.16,ax:-2.6,az:.3,ex:-1.6,lx:-1.4,lz:-.05,le:-.1,lh:-.25,rh:.15,rk:.3,dy:-.02},
          {rw:.6,sy:-.4,py:-.25,sx:.25,ax:-1.5,az:-.05,ex:-.1,lx:-.3,lz:.2,le:-1.0,lh:-.3,rh:.2,lk:.35,dy:-.05},
          {sy:-.65,py:-.35,sx:.3,ax:-.8,az:-.3,ex:-.3,lx:-.2,lz:.25,le:-1.0,lh:-.3,rh:.2,lk:.38,dy:-.05}),
  bolt:P({sy:.35,py:.12,sx:-.12,ax:-2.85,az:.25,ex:-.45,lx:-1.3,lz:.2,le:-.4,hx:-.12,rk:.2,dy:-.01},
         {rw:1.2,sy:-.2,py:-.12,sx:.2,ax:-1.6,az:0,ex:-.05,lx:-.6,lz:.1,le:-.9,lh:-.25,rh:.15,lk:.3,dy:-.04}),
  rainfire:P({sx:-.25,hx:-.35,ax:-2.95,az:.4,ex:-.2,lx:-2.95,lz:-.4,le:-.2,dy:.01},
             {rw:.8,sx:.35,hx:.1,ax:-1.3,az:.6,ex:-.1,lx:-1.3,lz:-.6,le:-.1,lh:-.3,rh:.25,lk:.42,rk:.32,dy:-.08})}})();
HUM_ATK.spit=HUM_ATK.bolt;HUM_ATK.bite=HUM_ATK.strike;HUM_ATK.pounce=HUM_ATK.slam;
function humAtkPose(n,ph,k,now){
  const Q=HUM_ATK[n]||HUM_ATK.strike;let P;
  if(ph==0){P=atkMix(ATK_REST,Q.W,ATK_E.out(Math.min(1,k/.8)));
    // the last quarter of the wind-up trembles at full coil: the moment to dodge
    if(k>.72){const tr=(k-.72)/.28;P=atkAdd(P,{ax:Math.sin(now/32)*.06*tr,lx:Math.sin(now/37)*.04*tr,sx:Math.sin(now/45)*.02*tr})}}
  else if(ph==1)P=k<.45?atkMix(Q.W,Q.S,ATK_E.in2(k/.45)):atkMix(Q.S,Q.O,ATK_E.out((k-.45)/.55));
  else P=atkMix(Q.O,ATK_REST,ATK_E.io(1-k));
  return P}
{const f=humAnim;humAnim=function(g,now,mv){const r=f.apply(this,arguments);try{
  const a=g.ak,h=g.h,L=h&&h._L;if(!a||!L||!h.bones)return r;if(g.bowW&&a.n=='throw')return r;
  const P=humAtkPose(a.n,a.ph,a.k,now),b=h.bones,mw=h._ga?h._ga.w:0;
  for(const c in ATK_REST){if(c=='dy')continue;const ch=HACH[c];if(!ch)continue;const bn=b[ch[0]];if(!bn)continue;let d=(P[c]!=null?P[c]:ATK_REST[c])-ATK_REST[c];
    if(HA_LEGS[c])d*=1-.85*mw;bn.rotation[ch[1]]=(L[c]!=null?L[c]:0)+d}
  if(P.dy)b.pelvis.position.y+=P.dy*(1-.85*mw);
}catch(e){}return r}}

// ---------------- creatures, companions and Sovereigns ----------------
// Bone-level poses layered on the existing whole-body moves (mTick's lean/hop/lunge on the body group):
// anticipation (crouch, head pulled back, jaw parting, tail up) → committed strike (head and neck drive forward, jaw snaps
// shut on the hit) → settle.
function crPose(n,ph,k,now){
  // returns offsets: nk neck, hd head, jw jaw, ch chest, sp spine, pv pelvis pitch, fh/fk front hips/knees, hh/hk hind hips/knees, by body drop (×hip height), tl tail lift, ty tail yaw, ex chest swell
  const q=ph==0?ATK_E.out(Math.min(1,k/.85)):1,tr=ph==0&&k>.72?(k-.72)/.28:0,o={};
  const W={bite:{nk:-.35,hd:-.25,jw:.25,ch:-.1,fh:-.2,hk:.35,by:-.06,tl:-.25},pounce:{nk:.15,hd:-.12,jw:.1,fh:-.15,fk:.5,hh:-.2,hk:.7,by:-.12,tl:-.15},
    charge:{nk:.4,hd:.15,jw:.05,hk:.3,by:-.05,tl:-.3},spin:{sp:-.35,ty:.6,by:-.03},slam:{nk:-.3,hd:-.2,jw:.5,fh:-1.05,fk:.9,hk:.3,tl:-.2},
    spit:{nk:-.45,hd:-.35,ch:-.1,ex:.08,tl:-.15}};
  const S={bite:{nk:.45,hd:.35,jw:.9,ch:.12,sp:.1,fh:-.45,hh:.3,by:-.02,tl:.1},pounce:{nk:-.15,hd:-.1,jw:.5,fh:-.85,hh:.75},charge:{nk:.35,hd:.2,jw:.5,tl:.15},
    spin:{sp:.3,ty:-.9},slam:{nk:.35,hd:.3,jw:.8,fh:.25,ch:.1},spit:{nk:.4,hd:.3,jw:.95,ch:.08}};
  const key=n=='strike'?'bite':n=='throw'||n=='bolt'||n=='rainfire'?'spit':W[n]?n:'bite',w=W[key],s=S[key];
  if(ph==0){for(const c in w)o[c]=w[c]*q;
    if(key=='pounce')o.ty=Math.sin(now/70)*.35*q;
    if(key=='charge')o.paw=Math.sin(now/85)*.55*q;
    if(tr){o.nk=(o.nk||0)+Math.sin(now/30)*.04*tr;o.by=(o.by||0)+Math.sin(now/41)*.008*tr}}
  else if(ph==1){
    if(key=='pounce'){const L2={nk:.3,hd:.25,jw:.9,fh:-.4,fk:.3,hh:-.3,hk:.5};const t=k<.5?0:ATK_E.io((k-.5)/.5),A=k<.5?atkMix(w,s,ATK_E.out(k/.5)):s;for(const c in Object.assign({},A,L2))o[c]=(A[c]||0)+((L2[c]||0)-(A[c]||0))*t;if(k>.9)o.jw=.9*(1-(k-.9)/.1)}
    else{const t=ATK_E.in2(Math.min(1,k/.4));for(const c in Object.assign({},w,s))o[c]=(w[c]||0)+((s[c]||0)-(w[c]||0))*t;
      if(key=='bite'){o.jw=k<.38?.9:.9*(1-ATK_E.out(Math.min(1,(k-.38)/.14)))+.05}
      if(key=='spin')o.ty=Math.sin(Math.PI*k)*-.9}}
  else{const u=ATK_E.io(1-k),E=key=='pounce'?{nk:.3,hd:.25,jw:0,fh:-.4,fk:.3,hh:-.3,hk:.5,by:-.06}:Object.assign({},s,key=='bite'?{jw:.05}:{});for(const c in E)o[c]=E[c]*(1-u)}
  return o}
function crApply(x,o,Lm){
  const b=x.bones,S=x.spec;if(!o)return;
  if(b.neck)b.neck.rotation.x=o.nk||0;if(o.hd)b.head.rotation.x+=o.hd;if(o.jw!=null&&b.jaw)b.jaw.rotation.x=Math.max(b.jaw.rotation.x*.3,o.jw);
  if(o.ch)b.chest.rotation.x+=o.ch;if(o.sp){b.spine.rotation.y+=o.sp;b.chest.rotation.y+=o.sp*.6}if(o.pv)b.pelvis.rotation.x+=o.pv;if(o.ex)b.chest.scale.y+=o.ex;
  if(o.by)x.b.position.y+=o.by*Lm;
  const ty=S.anim;
  if(ty!='fly')(S.legs||[]).forEach((q,i)=>{const k=q[0],h=b[k+'0'],kn=b[k+'1'];if(!h)return;
    const front=k[0]=='f'||(ty=='spider'&&(k[1]=='0'));if(ty=='spider'){if(front&&o.fh)h.rotation.x+=o.fh*.8;return}
    if(ty=='waddle'&&k[0]=='f'){if(o.fh)h.rotation.x+=o.fh*1.2;return}
    if(front){h.rotation.x+=(o.fh||0)+(o.paw&&i%2==0?o.paw:0);if(kn)kn.rotation.x+=o.fk||0}else{h.rotation.x+=o.hh||0;if(kn)kn.rotation.x+=o.hk||0}});
  if(o.tl||o.ty)for(let i=0;i<4;i++){const tb=b['tail'+i];if(!tb)continue;tb.rotation.x+=(o.tl||0)*(i?.6:1);tb.rotation.y+=(o.ty||0)*(.4+.25*i)}
}
// companion bite: anticipation → snap → settle on the same 380 ms (done() still fires at the end, where the damage happens)
lunge=function(a,to,done){
  if(a._bo){a.atk=1;tw(380,()=>{},()=>{a.atk=0;done&&done()});return}
  const L=Math.max(0,V().subVectors(to,a.position).setY(0).length()-1.1);a.atk=1;
  tw(380,k=>{a._lk=k;const z=k<.3?-.12*ATK_E.out(k/.3):k<.55?-.12+(L+.12)*ATK_E.in2((k-.3)/.25):k<.62?L:L*(1-ATK_E.io((k-.62)/.38));
    const rx=k<.3?-.18*ATK_E.out(k/.3):k<.55?-.18+.55*ATK_E.in2((k-.3)/.25):k<.62?.37:.37*(1-ATK_E.io((k-.62)/.38));a.b.position.z=z;a.b.rotation.x=rx},
    ()=>{a.b.position.z=0;a.b.rotation.x=0;a.atk=0;a._lk=null;done&&done()});
};
{const f=bossAI;bossAI=function(e){if(e&&e.m)e.m._bo=e;return f.apply(this,arguments)}}
function crAtkOverlay(x,now){
  const g=x.g,Lm=gaLegLen(x.spec);let o=null;
  if(g.ak)o=crPose(g.ak.n,g.ak.ph,g.ak.k,now);
  else if(g._lk!=null){const k=g._lk;o=k<.3?crPose('bite',0,k/.3,now):k<.55?crPose('bite',1,(k-.3)/.25,now):crPose('bite',2,1-(k-.55)/.45,now)}
  else if(g._bo){o=bossPose(g,g._bo,now)}
  else if(g.lk&&!g.atk){if(g._cbT==null)g._cbT=now;const u=Math.min(1,(now-g._cbT)/220);o=u<.7?{nk:-.4*ATK_E.out(u/.7),hd:-.3*ATK_E.out(u/.7),jw:.6*u,ex:.06*u,fh:-.35*ATK_E.out(u/.7)}:{nk:-.4+.75*ATK_E.in2((u-.7)/.3),hd:-.3+.55*ATK_E.in2((u-.7)/.3),jw:.9,fh:-.35}}
  if(!g.lk)g._cbT=null;
  // settle after a companion cast instead of popping back
  if(o){g._ao=o;g._aoT=now}else if(g._ao&&now-g._aoT<260){const t=1-ATK_E.io((now-g._aoT)/260),p={};for(const c in g._ao)p[c]=g._ao[c]*t;o=p}else g._ao=null;
  if(!o){if(x.bones.neck)x.bones.neck.rotation.x=0;return}
  crApply(x,o,Lm)}
function bossPose(g,e,now){
  const b=e.bs;if(!b)return null;
  if(e.jmp){const j=e.jmp,k=Math.min(1,j.t/j.dur);return {fh:-.55*Math.sin(Math.PI*k),fk:.6*Math.sin(Math.PI*k),hh:.5*Math.sin(Math.PI*k),hk:.6*Math.sin(Math.PI*k),nk:-.15}}
  // a new move starts when the boss timer jumps up
  if(g._bt!=null&&b.t>g._bt+.3)g._mv={k:b.last,t0:now,D:Math.max(.4,b.lock||1.2)};g._bt=b.t;
  const M=g._mv;if(!M)return null;const el=(now-M.t0)/1000;
  if(M.k=='slam'){const ti=M.D*.733,u=el/ti;
    if(u<.82)return {pv:-.35*ATK_E.out(Math.min(1,u/.7)),fh:-1.0*ATK_E.out(Math.min(1,u/.7)),fk:.8*ATK_E.out(Math.min(1,u/.7)),hk:.3,nk:-.25,hd:-.15,jw:.6,by:.05};
    if(u<1){const t=ATK_E.in2((u-.82)/.18);return {pv:-.35+.47*t,fh:-1.0+1.2*t,fk:.8*(1-t),hk:.3,nk:-.25+.6*t,hd:-.15+.4*t,jw:.6+.2*t,by:.05-.1*t}}
    const s=Math.max(0,1-(el-ti)/.6);if(s<=0){g._mv=null;return null}return {pv:.12*s,fh:.2*s,nk:.35*s,hd:.25*s,jw:.8*s,by:-.05*s}}
  if(M.k=='charge'){if(b.dash)return {nk:.35,hd:.2,jw:.5,tl:.15};const u=Math.min(1,el/.6);if(el>M.D){g._mv=null;return null}return {nk:.4*u,hd:.15*u,hk:.3*u,by:-.05*u,tl:-.3*u,paw:Math.sin(now/85)*.55*u}}
  // spells and summons: rear back and roar, then thrust the head down as the effect lands
  const T=Math.min(1.4,M.D);
  if(el<.4){const u=ATK_E.out(el/.4);return {nk:-.5*u,hd:-.4*u,jw:.2*u,ex:.08*u,pv:-.1*u,tl:-.3*u}}
  if(el<.4+T*.45){const u=ATK_E.in2(Math.min(1,(el-.4)/.18));return {nk:-.5+.7*u,hd:-.4+.5*u,jw:.2+.8*u,ex:.08,pv:-.1+.15*u,tl:-.3}}
  const s=Math.max(0,1-(el-.4-T*.45)/.5);if(s<=0){g._mv=null;return null}return {nk:.2*s,hd:.1*s,jw:1*s,pv:.05*s}}
{const f=rigAnim;rigAnim=function(x,now,mv,sp){f.apply(this,arguments);try{crAtkOverlay(x,now)}catch(e){}}}
// co-op: a remote player's swing plays the same keyframed slash (arms and torso; their legs keep walking)
mpSwingRH=function(h){if(h.sw||!h.bones)return;h.sw=1;const b=h.bones,T=ATK.sword[(h._sn=((h._sn|0)+1)%2)];
  tw(300,k=>{const P=T(k);for(const c in P){if(HA_LEGS[c])continue;const ch=HACH[c];if(ch&&b[ch[0]])b[ch[0]].rotation[ch[1]]=P[c]}},()=>{h.sw=0})};
