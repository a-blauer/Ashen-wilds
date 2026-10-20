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
function rigAnim(x,now,mv,sp){
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
    for(let i=0;i<4;i++){const tb=b['tail'+i];if(tb){tb.rotation.y=Math.sin(th-i*1.1)*ta;tb.rotation.x=0}}// v107: x reset every frame, or attack poses added to it (+=) pile up and coil the tail
    ['pelvis','spine','chest','neck'].forEach((k,i)=>{if(b[k])b[k].rotation.y=Math.sin(th-(i+4)*1.1)*ba*(k=='neck'?.6:1)+(k=='neck'?turnW*.08:0)});
    b.head.rotation.y=A?0:-Math.sin(th-8*1.1)*ba*.5+gaCl(turnW*.12,-.4,.4)+id*Math.sin(now/1700)*.2;
  }
  if(ty=='float')['fl','fr'].forEach((k,i)=>{if(b[k+'0']){b[k+'0'].rotation.z=(i?1:-1)*(.25+Math.sin(now/500+i*2)*.15);b[k+'0'].rotation.x=.35*w*Math.min(1,G.v/3)}});
  x.ears.forEach(e=>{e.rotation.z=e.userData.rz+Math.sin(now/620+e.userData.sd)*.06;e.rotation.x=A?-.5:-.12-.18*run*w+.05*w*Math.sin(TAU*2*P-.8)});
  x.wings.forEach(wg=>{wg.p.rotation.z=wg.s*(wg.base+Math.sin(G.wp)*wg.amp*(ty=='fly'?1.2:A?1.4:.3+.7*w+.2*run*w))});
  const bob=Lm*w*((1-run)*.012*(.5+.5*Math.cos(TAU*2*(P-beta*.5)))+run*(1-gal)*.045*(.5-.5*Math.cos(TAU*2*(P-beta*.5)))+gal*.08*(.5+.5*Math.cos(TAU*(P-.92))))*(slow?.5:1);
  B.position.y=ty=='fly'?.4+Math.sin(now/180)*.06:ty=='float'?.3+Math.sin(now/500)*.07:ty=='spider'?bob*.4:ty=='hop'?hopY:bob;
}

// ---------------- hero, humanoid foes, co-op players ----------------
// extra pose channels: draw-arm yaw (bow draw) and head yaw (look at the target / into turns)
HACH.ay=['aR0','y'];HACH.hy=['head','y'];HACH.lw=['aL2','x'];HACH.rw=['aR2','x'];
// knees, hip roll and a pelvis drop (dy, stored on the pelvis rotation object) so attacks can bend the legs and crouch
HACH.lk=['lh1','x'];HACH.rk=['rh1','x'];HACH.pz=['pelvis','z'];HACH.dy=['pelvis','_dy'];var HA_LEGS={lh:1,rh:1,lk:1,rk:1,pz:1,dy:1};
var HERO_LM=.55;
function animHero(now,mv,h){
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
    sz:0,cy:0,lhy:0,rhy:0,ly:0,rz:0,lq:0,la:b.lh2?b.lh2.rotation.x:0,ra:b.rh2?b.rh2.rotation.x:0,sy:sA*.14*w,sx:lean,py:-sA*.09*w,hx:-lean*.45,ay:0,lw:0,rw:0,lk:kL,rk:kR,dy:0,hy:Math.sin(now/1900)*.2*idle+gaCl(G.turn*.1,-.3,.3)*w};
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
}
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
function bowAnim(ms){
  const wt=typeof curWT=='function'?curWT():null;
  if(wt=='crossbow'){haPlay(ms,xbowPose,2,null,.2);return}
  haPlay(ms,bowPose,2,null,.18);
  const A=HA.cur;if(!A)return;
  A.tick=k=>bowFxSet(k<.12||k>=.53?0:gaSS(.12,.47,k)*.97+.03,k<.12?haOut(k/.12):k<.76?1:1-haIO(Math.min(1,(k-.76)/.2)));
  A.end=()=>bowFxSet(0,0);
}

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

