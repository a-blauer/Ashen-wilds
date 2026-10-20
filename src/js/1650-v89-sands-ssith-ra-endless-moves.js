// ================= v89 sands: Ssith'ra the Endless moves like a heavy desert centipede =================
// Why it used to flail (all of these stacked on the same 9 bones):
//  - the generic 'slither' wave put up to ±0.3 rad on EVERY body bone (pelvis, spine, chest, neck) with a 1.1 rad phase step.
//    The bones are a chain, so the swings added up toward both ends, the pelvis swung the whole 8-tile body, and on the
//    front half the wave ran toward the head instead of toward the tail;
//  - the generic Sovereign attack overlay (rear back → snap down) added 'tl' to the tail bones every frame with +=, and the
//    slither code never reset them, so the tail curled up and flapped further with each move;
//  - the generic hit flinch pitched the whole body 0.45 rad on every hit (a long body flaps its tail on every sword swing);
//  - the AI turns the model to face the player instantly, so the whole body pivoted around its middle;
//  - exposed/stuck added a 2.3 Hz roll shiver.
// Now one function drives the Centipede rig on its own (the old rig code is skipped for it):
//  - follow-the-leader body: the head turns toward the facing with a heavy spring, every segment eases toward the heading of
//    the one in front at the speed the body travels (so the body follows the path the head took), joint bends are limited;
//    the body pivots about its middle (the model origin), so the instant AI turn never shows;
//  - a smooth travelling wave from head to tail, amplitude growing toward the tail and zero at the head, speed matched to
//    ground speed (capped), tiny when idle;
//  - every pose channel (rear, head pitch, jaw, tail lift, curl, crouch, dive tilt) eases through a critically damped spring;
//  - attacks follow their real timings (tail sweep impact at the telegraph's end, spit on the cast flash, ram wind-up / run /
//    daze, dive / emerge, stuck, exposed), read from the boss moves themselves so co-op partners see the same poses;
//  - hit flinch is a small head recoil; death curls the body and rolls it over before it sinks into the sand.
// Nothing here changes gameplay: only bones, the body group's offsets and when the corpse shrinks.
var SSR_J=['head','neck','chest','spine','pelvis','tail0','tail1','tail2','tail3'];
var SSR_S=[0,.12,.3,.5,.75,1.0,1.28,1.55,1.85];          // arc distance of each joint from the head joint (model units)
var SSR_L=[.12,.12,.18,.2,.25,.25,.28,.27,.3];            // length to the joint in front
var SSR_B=[0,.32,.34,.34,.36,.42,.5,.55,.6];               // largest bend allowed against the segment in front
var SSR_LAM=1.55;                                          // body wave length (model units)
var SSR_DEP=0,SSR_REC=0;
function ssrWr(a){return Math.atan2(Math.sin(a),Math.cos(a))}
function ssrIO(t){t=t<0?0:t>1?1:t;return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
function ssrOut(t){t=t<0?0:t>1?1:t;return 1-Math.pow(1-t,3)}
function ssrIO3(t){t=t<0?0:t>1?1:t;return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function ssrSS(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}
// where a boss move starts (wrapped below): kind + timing, so the rig can play it
function ssrMove(e,k,en,r){if(!e||!e.m||!e.m._ssr)return;const A=typeof arenaOf=='function'?arenaOf(e):null,D=A&&A.dn;
  let kind=k;
  if(k=='vortex')kind=D&&D.vx&&D.vx.w>1?'roar':'sweep';
  else if(k=='sandstorm')kind=D&&D.st&&D.st.t>7.9?'roar':'spit';
  else if(k=='erupt')kind=D&&D.er?'den':'sweep';
  else if(k=='ram')kind=D&&D.ram?'den':'sweep';
  else if(k=='tailsweep')kind='sweep';
  else if(k!='spit'&&k!='mines')kind='roar';
  if(kind=='den')return;
  e.m._ssMv={k:kind,t0:performance.now(),en:+en||1,s:Math.random()<.5?-1:1}}
Object.keys(BMV).forEach(k=>{const f=BMV[k];if(typeof f!='function')return;
  BMV[k]=function(e,A,en){if(SSR_DEP++==0)SSR_REC=0;let r;try{r=f.apply(this,arguments)}finally{SSR_DEP--}
    if(!SSR_REC){SSR_REC=1;try{ssrMove(e,k,en,r)}catch(err){}}return r}});
// pose targets for the current state: R rear (front up), LOW head down, HP head pitch, J jaw, T tail lift, C curl (signed),
// Y body height (model units), PP dive tilt, WA/WF wave amplitude/frequency, SH head shake, LK look-around, TH head spring time
function ssrState(x,g,e,now,G){
  const P={R:.05,LOW:0,HP:0,J:0,T:0,C:0,Y:0,PP:0,WA:.05,WF:.16,SH:0,LK:1,TH:.45,T2:.3};
  const v=G.v,mvW=Math.min(1,v/2.2);
  if(v>.15){P.WA=.05+.27*mvW;P.WF=Math.min(1.0,v/(SSR_LAM*G.sc));P.R=.05+.05*mvW;P.TH=.35;P.LK=1-mvW}
  if(G.death!=null){const k=G.death,u=ssrIO(k/.65);P.C=.95*G.ds*u;P.T=.55*u;P.R=.35*Math.sin(Math.PI*Math.min(1,k/.5))-.25*ssrSS(.4,.9,k);P.LOW=.3*ssrSS(.4,.9,k);P.J=1-ssrSS(.3,.9,k);
    P.WA=.12*(1-k);P.WF=.5;P.Y=-.4*ssrSS(.6,1,k);P.LK=0;P.T2=.12;return P}
  if(!e||!e.bs)return P;
  const A=typeof arenaOf=='function'?arenaOf(e):null,D=A&&A.dn,el0=now;
  // ---- den states (ram, burrow) ----
  if(D&&D.ram){const Rm=D.ram;G.den='ram';P.LK=0;P.TH=.18;
    if(Rm.s=='wind'){const W=Math.max(.3,G.rw||Rm.t),u=1-Math.max(0,Rm.t)/W;   // slow coil back, then hold tense
      P.R=-.05;P.LOW=.15+.25*ssrIO(u);P.Y=-.06*ssrIO(u);P.T=.12+.06*Math.sin(now/1000*Math.PI*2*1.4)*ssrIO(u);P.J=.25*u;P.C=.18*G.rs*Math.sin(Math.PI*Math.min(1,u*1.2));P.WA=.06;P.WF=.25;P.T2=.22}
    else if(Rm.s=='run'){P.R=-.08;P.LOW=.32;P.J=.6;P.T=.05;P.WA=.12;P.WF=1.25;P.Y=-.03;P.T2=.08}
    else{const k=Math.min(1,(G.dz||0)/.8);P.R=.12;P.LOW=.1;P.J=.2;P.SH=.22*Math.sin(Math.PI*2*1.25*(G.dz||0))*(1-k);P.WA=.08;P.WF=.3;P.T2=.15}
    return P}
  if(D&&D.er){const R2=D.er;G.den='er';P.LK=0;
    if(R2.s=='dive'){const u=1-Math.max(0,R2.t)/(G.dvT||.45);P.R=.45*Math.sin(Math.PI*Math.min(1,u*1.6))*(1-u);P.PP=.5*ssrIO(u);P.LOW=.4*ssrIO(u);P.Y=-.55*ssrIO((u-.25)/.75);P.J=.6;P.T=.15;P.WA=.1;P.WF=.6;P.T2=.1}
    return P}
  // ---- exposed after an eruption / stuck in a column ----
  if(e._ssX&&nowP()<e._ssX){const el=(now-(G.xT||now))/1000;P.LK=0;
    if(G.den=='ram'){P.LOW=.5;P.R=-.12;P.J=.35;P.Y=-.05;P.C=.28*G.rs*Math.sin(Math.PI*2*.55*el);P.T=.18+.12*Math.sin(Math.PI*2*.55*el+1);P.WA=.12;P.WF=.55;P.T2=.25}   // head jammed, body tugging
    else{const em=ssrOut(el/.6);P.R=.9*(1-em)-.1*em;P.HP=-.2*(1-em);P.LOW=.35*em;P.J=.35+.55*(1-em);P.Y=-.3*(1-em)-.12*em;P.T=-.05;P.WA=.05;P.WF=.2;P.T2=el<.6?.06:.3}    // bursts up, then lies slack
    return P}
  // ---- ordinary moves ----
  const M=g._ssMv;if(M){const el=(now-M.t0)/1000,en=M.en;let done=false;P.LK=0;P.TH=.22;
    if(M.k=='sweep'){const Ti=.75*en,a=Math.max(.2,Ti-.16),s=M.s;let c;
      if(el<a)c=.55*s*ssrIO(el/a);else if(el<Ti+.14)c=s*(.55-1.45*ssrIO3((el-a)/(Ti+.14-a)));else c=-.9*s*(1-ssrOut((el-Ti-.14)/.8));
      P.C=c;P.T=el<Ti?.45*ssrIO(el/a):.45*(1-ssrOut((el-Ti)/.25));P.R=el<Ti?.2*ssrIO(el/a):.2-.3*ssrOut((el-Ti)/.2)*(1-ssrSS(Ti+.3,Ti+1,el));
      P.J=el>Ti-.1&&el<Ti+.5?.6:.15;P.T2=.06;P.WA=.03;done=el>Ti+1}
    else if(M.k=='spit'){const u1=el/.3,u2=(el-.3)/.15,u3=(el-.45)/.6;
      if(el<.3){P.R=.5*ssrIO(u1);P.HP=-.25*ssrIO(u1);P.J=.35*u1}
      else if(el<.45){P.R=.5-.4*ssrIO(u2);P.HP=-.25+.4*ssrIO(u2);P.J=1;P.LOW=.15*ssrIO(u2)}
      else{const q=1-ssrOut(u3);P.R=.1*q;P.HP=.15*q;P.J=1*q;P.LOW=.15*q}
      P.T2=.06;done=el>1.1}
    else if(M.k=='mines'){if(el<.55){const u=ssrIO(el/.55);P.R=.7*u;P.HP=-.2*u;P.J=.5*u;P.T=.2*u}
      else if(el<.72){const u=ssrIO3((el-.55)/.17);P.R=.7-.9*u;P.HP=-.2+.35*u;P.LOW=.35*u;P.J=.5+.4*u;P.Y=-.08*u;P.T=.2-.1*u}
      else{const q=1-ssrOut((el-.72)/.7);P.R=-.2*q;P.HP=.15*q;P.LOW=.35*q;P.J=.9*q;P.Y=-.08*q;P.T=.1*q}
      P.T2=.07;done=el>1.5}
    else{const u=ssrIO(el/.7),q=1-ssrIO((el-1.3)/.7);P.R=.85*u*q;P.HP=-.15*u*q;P.J=(.3+.7*ssrSS(.35,.7,el))*q;P.T=.4*u*q;P.WA=.06+.04*u*q;P.WF=.3;
      P.C=.12*M.s*Math.sin(Math.PI*2*.4*Math.max(0,el-.5))*u*q;P.T2=.15;done=el>2.1}
    if(done)g._ssMv=null;return P}
  return P}
function ssrRig(x,now,mv,sp){
  const g=x.g,b=x.bones,B=x.b;g._ssr=1;g._ssx=x;
  const G=g._ss||(g._ss={t:now,psi:null,v:0,th:0,ch:{},px:null,pz:null,p0:b.pelvis.position.clone()});
  const dt=Math.max(0,Math.min(.05,(now-G.t)/1000));G.t=now;
  const e=g._bo||null;
  // world yaw of the model, scale and ground speed
  const Yr=g.rotation.y+(B.rotation.y||0);G.sc=g.scale.x||1;
  const wx=g.position.x,wz=g.position.z;let tele=false;
  if(G.px!=null&&dt>0){const d=Math.hypot(wx-G.px,wz-G.pz);if(d>2.5)tele=true;else{const vm=Math.min(25,d/dt);G.v+=(vm-G.v)*(1-Math.exp(-dt*7))}}
  G.px=wx;G.pz=wz;
  if(!g.visible){G.hid=1;G.v=0}
  if((G.hid||g._ssSnap)&&g.visible){G.hid=0;g._ssSnap=0;tele=true}
  if(!G.psi||tele){G.psi=SSR_J.map(()=>Yr);G.hv=0}
  // den bookkeeping: ram wind length, which way it coils, daze timer, exposure start, dive length
  const A=e&&typeof arenaOf=='function'?arenaOf(e):null,D=A&&A.dn;
  if(D){const Rm=D.ram;if(Rm&&Rm!==G.rmO){G.rmO=Rm;G.rw=Rm.t+dt;G.rs=Math.random()<.5?-1:1}if(Rm&&Rm.s=='daze'){if(G.dzO!==Rm.t){G.dz=(G.dz||0)+dt}}else G.dz=0;
    if(D.er&&D.er.s=='dive'){if(G.dvO!==D.er){G.dvO=D.er;G.dvT=Math.max(.3,D.er.t+dt)}}else if(D.er)G.dvO=null;
    if(!D.ram&&!D.er&&!(e._ssX&&nowP()<e._ssX))G.den=null}
  const xp=e&&e._ssX&&nowP()<e._ssX;if(xp&&!G.xOn){G.xOn=1;G.xT=now}if(!xp)G.xOn=0;
  const P=ssrState(x,g,e,now,G),C=G.ch;
  // eased channels (snap only while hidden or on the first frame)
  const snap=tele||C.R==null;
  for(const k in P){if(k=='TH'||k=='T2'||k=='WF'||k=='LK')continue;if(snap){C[k]=P[k];C[k+'V']=0}else gaSD(C,k,P[k],P.T2,dt)}
  if(snap){C.WF=P.WF;C.LK=P.LK}else{gaSD(C,'WF',P.WF,.6,dt);gaSD(C,'LK',P.LK,.5,dt)}
  // ---- heading: head eases toward the facing (plus a slow look-around), the body follows the head's path ----
  const psi=G.psi,look=.14*Math.sin(now/2300)*C.LK+C.SH,tgt=Yr+look;
  if(snap){psi[0]=tgt;G.hv=0}else{const st={a:psi[0],aV:G.hv};const a0=psi[0];gaSD(st,'a',psi[0]+ssrWr(tgt-psi[0]),P.TH,dt);const mx=(P.TH<.25?4:2.4)*dt,d=st.a-a0;if(Math.abs(d)>mx){st.a=a0+Math.sign(d)*mx;st.aV=Math.sign(d)*mx/Math.max(dt,1e-3)}psi[0]=st.a;G.hv=st.aV}
  for(let j=1;j<psi.length;j++){const rate=G.v/(SSR_L[j]*G.sc)+.55,d=ssrWr(psi[j-1]-psi[j]);psi[j]+=d*(1-Math.exp(-rate*dt));
    const r=ssrWr(psi[j]-psi[j-1]);if(Math.abs(r)>SSR_B[j])psi[j]=psi[j-1]+Math.sign(r)*SSR_B[j]}
  // ---- travelling wave (crests run from head to tail) + curl ----
  G.th+=dt*Math.PI*2*Math.max(0,C.WF);if(G.th>1e4)G.th-=1e4;
  const W=SSR_J.map((k,j)=>{const s=SSR_S[j],env=Math.pow(s/1.85,1.35);return C.WA*env*Math.sin(G.th-Math.PI*2*s/SSR_LAM)+C.C*Math.pow(s/1.85,1.2)*1.15});
  const H=psi.map((p,j)=>p+W[j]),loc=(j,pj)=>{const r=ssrWr(H[j]-H[pj]);return Math.max(-.8,Math.min(.8,r))};
  // pelvis: yaw relative to the model, and moved so the body turns about its middle (the spine joint = model origin)
  const dp=ssrWr(H[4]-Yr),p0=G.p0;b.pelvis.rotation.y=dp;
  b.pelvis.position.set(p0.x*Math.cos(dp)+p0.z*Math.sin(dp),p0.y,-p0.x*Math.sin(dp)+p0.z*Math.cos(dp));
  b.spine.rotation.y=loc(3,4);b.chest.rotation.y=loc(2,3);b.neck.rotation.y=loc(1,2);b.head.rotation.y=loc(0,1);
  b.tail0.rotation.y=loc(5,4);b.tail1.rotation.y=loc(6,5);b.tail2.rotation.y=loc(7,6);b.tail3.rotation.y=loc(8,7);
  // ---- pitch: rear up the front, lower the head, lift the tail, tilt into a dive; small head recoil on hits ----
  const fx=g.flT?(now-g.flT)/360:2,fl=fx>=0&&fx<1?(fx<.25?ssrSS(0,.25,fx):Math.pow(1-(fx-.25)/.75,2)):0;
  const R=C.R,LOW=C.LOW;
  b.pelvis.rotation.x=C.PP;b.pelvis.rotation.z=0;
  b.spine.rotation.x=-R*.3+LOW*.1;b.chest.rotation.x=-R*.4+LOW*.15;b.neck.rotation.x=-R*.3+LOW*.25-.14*fl;
  b.head.rotation.x=R*.78+C.HP+LOW*.1-.08*fl+.03*Math.sin(now/1500);
  b.jaw.rotation.x=.04+Math.max(0,C.J)*.7+.03*Math.sin(now/900)+.18*fl;
  const T=C.T;b.tail0.rotation.x=T*.3;b.tail1.rotation.x=T*.3;b.tail2.rotation.x=T*.25;b.tail3.rotation.x=T*.2;
  for(const k of ['spine','chest','neck','head','tail0','tail1','tail2','tail3'])b[k].rotation.z=0;
  b.chest.scale.y=1+Math.sin(now/1100)*.02;
  B.position.y=C.Y;
}
{const f=rigAnim;rigAnim=function(x,now,mv,sp){if(x&&x.spec===SPEC.Centipede&&x.bones&&x.bones.tail3){try{ssrRig(x,now,mv,sp);return}catch(err){console.warn('sands rig',err)}}return f.apply(this,arguments)}}
// the generic whole-body hit flinch is replaced by the head recoil above
{const f=animC;animC=function(g,now,mv,sp){f.apply(this,arguments);if(g&&g._ssr&&g.isE&&g.b){const S=g.ps;g.b.rotation.x=S?S.rx:0;g.b.position.z=S?S.z:0}}}
// death: curl up and roll over (slower than the small-foe flop), then sink into the sand before the corpse shrinks
{const f=kill;kill=function(e){const m=e&&e.m,on=m&&m._ssr&&m._ssx&&!m._ssDead;if(on)m._ssDead=1;const r=f.apply(this,arguments);
  if(on){const G=m._ss,x=m._ssx,sd=Math.random()<.5?-1:1;if(G){G.death=0;G.ds=-sd}
    tws.unshift({t:performance.now(),ms:1500,fn:k=>{if(G)G.death=k;try{ssrRig(x,performance.now(),false,0)}catch(err){}m.b.rotation.z=sd*1.25*ssrIO(Math.min(1,k/.6));m.b.rotation.x=0;m.b.position.z=0},done:null})}
  return r}}
// bursting out of the sand: the den code shows the boss again without calling the rig, so pose it in that same frame (below)
{const f=bxHide;bxHide=function(e,on){const r=f.apply(this,arguments);if(!on&&e&&e.m&&e.m._ssr)e.m._ssSnap=1;return r}}
// while it hunts under the sand the enemy loop's distance check (m.visible=dpl<30) showed the body standing on its mound
{const f=bossAI;bossAI=function(e){const r=f.apply(this,arguments);if(e&&e.hid&&e.m&&e.m._ssr){e.m.visible=false;if(e.hb)e.hb.visible=false}
  else if(e&&e.m&&e.m._ssSnap&&e.m._ssx){try{ssrRig(e.m._ssx,performance.now(),false,0)}catch(err){}}return r}}

