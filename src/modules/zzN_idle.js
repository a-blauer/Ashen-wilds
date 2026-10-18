// ================= v93: natural idle animations for every character =================
// Standing still used to be a statue with one shared head sway (every wolf in a pack turned its head in lockstep).
// This file adds a layered idle on top of the existing animation, only while a model stands still and is not attacking:
//  - humanoids (hero, co-op heroes, humanoid foes, the two humanoid Sovereigns, town folk): breathing (chest and
//    shoulders), weight shifts between the feet with a hip sway (feet stay planted: the hips counter-rotate), head
//    glances, a small arm settle, and every 4–10 s a fidget: hero — roll shoulders, check weapon, adjust grip, look
//    over the shoulder (+ mage hand-glow flick, ranger bow check, warrior neck stretch); foes — menacing sway, weapon
//    tap, growl lean, look around; town folk — stretch, scratch head, shift weight, nod. The hero takes a combat-ready
//    stance (knees bent, weapon up, weight forward, no fidgets) while foes are close or hunting him; aggroed foes too.
//  - creatures (every SPEC rig through rigAnim): breathing, head turns and sniffs, tail sway and flicks, ear twitches,
//    and type-specific fidgets: quadrupeds sniff/look/shake/groom/yawn (companions also sit down for a while);
//    spiders shuffle a leg and twitch the mandibles; flyers bob with wing flutters; slimes wobble and squash;
//    floaters drift and slowly turn; serpents rear and look, flick the tongue, coil-sway. Ssith'ra (Centipede) keeps
//    its own v89 animation and is left alone.
//  - Sovereigns: slower and heavier; out of the fight an occasional roar, in the fight only breathing/head sway and a
//    snort (never anything that looks like a telegraph).
//  - mounts: weight shifts, head bob/look, a head toss, a hoof stamp and tail swishes.
// How it plugs in (later definitions win, every hook is a chain): rigAnim, animHero, humAnim and mkMountRig are wrapped.
// Each instance gets a constant random time offset for the inner animation (so the old shared idle terms are no longer
// in lockstep) and its own random rates/phases for this layer. The layer is additive with an "undo": it remembers what
// it added to each channel, so channels the base code sets every frame and channels nobody else touches both work
// without drifting. It is blended by a spring (eases in when the model settles, out when it walks or attacks) and is
// multiplied by (1 − the gait's moving blend), so walking/attacking override it without a pop. For the player, the
// v81 action system starts every action from the current pose, so the idle on those channels is dropped the moment
// an action starts (the action blends from where the body is) and eases back after it.
// Only models that are drawn and within IDL.dist of the camera run it (off-screen enemies were already skipped by the
// enemy loop). No per-frame allocations: state lives on the model (_idl), outputs go into reused objects.
// Nothing here changes gameplay: no positions, hit areas, timings or speeds — only bone rotations/offsets.
var IDL={pnow:()=>performance.now(),on:true,dist:34,fmin:4,fmax:10,prof:0,ms:0,n:0,force:null,combat:null,cbT:0,cbV:0,cnt:0};
var IDL_TAU=Math.PI*2;
function idlSS(a,b,x){const t=x<=a?0:x>=b?1:(x-a)/(b-a);return t*t*(3-2*t)}
function idlCl(x,a,b){return x<a?a:x>b?b:x}
// per-instance random numbers (Park–Miller), seeded once
function idlR(S){S.sd=S.sd*16807%2147483647;return (S.sd-1)/2147483646}
function idlRR(S,a,b){return a+(b-a)*idlR(S)}
// critically damped spring on slot i of a Float64Array (value at i, velocity at i+1)
function idlSp(A,i,target,T,dt){const om=2/Math.max(.01,T),x=om*dt,e=1/(1+x+.48*x*x+.235*x*x*x),c=A[i]-target,tmp=(A[i+1]+om*c)*dt;
  A[i+1]=(A[i+1]-om*tmp)*e;A[i]=target+(c+tmp)*e;return A[i]}
// one channel = (object, property). add: the base value is the current value, unless nobody wrote it since our last
// write, in which case our previous offset is taken back out first.
function idlCh(o,k){return o?{o:o,k:k,w:NaN,a:0}:null}
function idlAp(c,add){if(!c)return;const o=c.o,cur=o[c.k],b=cur===c.w?cur-c.a:cur,v=b+add;o[c.k]=v;c.w=v;c.a=add}
// fidget envelope: ease in over the first fi of the fidget, out over the last fo
function idlEnv(u,fi,fo){return u<fi?idlSS(0,fi,u):u>1-fo?1-idlSS(1-fo,1,u):1}
function idlNew(o,slow){const S={sd:((Math.random()*2147483646)|0)+1,t:0,on:0,iw:0,iwV:0,wX:0,wXV:0,cw:0,cwV:0,
  sp:new Float64Array(24),fT:0,fid:-1,fu:0,fd:1,fs:1,lT:0,ly:0,lp:0,lt:0,wT:0,wg:0,tT:0,tf:0,eT:0,ei:-1,fx:0,slow:slow||1,busy0:0};
  S.bf=idlRR(S,.2,.29)/S.slow;S.bp=idlRR(S,0,IDL_TAU);S.fT=idlRR(S,1.5,IDL.fmax);S.lT=idlRR(S,.5,2.5);S.wT=idlRR(S,0,3);S.tp=idlRR(S,0,IDL_TAU);S.tr=idlRR(S,.7,1.1);
  return S}
// is this model worth animating: drawn, and close to the camera (previews that are not in the scene always are)
function idlVis(g){if(!g.visible)return false;if(g.parent!==scene)return true;if(typeof cam=='undefined')return true;
  const p=g.position,c=cam.position,dx=p.x-c.x,dz=p.z-c.z;return dx*dx+dz*dz<IDL.dist*IDL.dist}
// pick the next fidget: list of [id, weight]; returns id
function idlPick(S,L){let s=0;for(let i=0;i<L.length;i+=2)s+=L[i+1];let r=idlR(S)*s;for(let i=0;i<L.length;i+=2){r-=L[i+1];if(r<=0)return L[i]}return L[0]}
// fidget scheduler: returns the envelope (0 when none); S.fid / S.fu (0..1) say which and where
function idlFid(S,dt,allow,list,dur){
  if(S.fid>=0){S.fu+=dt/S.fd;if(S.fu>=1||(!allow&&S.fu<.02)){S.fid=-1;S.fT=idlRR(S,IDL.fmin,IDL.fmax)*S.slow}}
  else if(allow){S.fT-=dt;const fo=IDL.force!=null&&list.indexOf(IDL.force)>=0;if(S.fT<=0||fo){const f=fo?IDL.force:idlPick(S,list);
    S.fid=f;S.fu=0;S.fd=(dur[f]||1.6)*(S.slow>1?1.25:1);S.fs=idlR(S)<.5?-1:1}}
  else if(S.fT<1.2)S.fT=1.2; // don't fire right after settling
  return S.fid>=0?1:0}

// =====================================================================================================
// humanoids (HB skeleton: hero, co-op heroes, humanoid foes, Sovereign humanoids, town folk)
// =====================================================================================================
// channel table: [key, bone, property path]; HACH-driven ones are marked so the player can drop them at an action start
var IDL_HCH=[['sy','spine','r','y',1],['sx','spine','r','x',1],['sz','spine','r','z',0],['py','pelvis','r','y',1],['pz','pelvis','r','z',1],['px','pelvis','p','x',0],['dy','pelvis','p','y',0],
  ['cx','chest','r','x',0],['cz','chest','r','z',0],['ny','neck','r','y',0],['nx','neck','r','x',0],['hx','head','r','x',1],['hy','head','r','y',1],['hz','head','r','z',0],
  ['ax','aR0','r','x',1],['az','aR0','r','z',1],['ex','aR1','r','x',1],['rw','aR2','r','x',1],['lx','aL0','r','x',1],['lz','aL0','r','z',1],['le','aL1','r','x',1],['lw','aL2','r','x',1],
  ['lh','lh0','r','x',1],['rh','rh0','r','x',1],['lhz','lh0','r','z',0],['rhz','rh0','r','z',0],['lk','lh1','r','x',1],['rk','rh1','r','x',1],['la','lh2','r','x',0],['ra','rh2','r','x',0]];
var IDO={};IDL_HCH.forEach(q=>IDO[q[0]]=0);
function idlHumCh(b){const C=[];IDL_HCH.forEach(q=>{const bn=b[q[1]];C.push(bn?idlCh(q[2]=='r'?bn.rotation:bn.position,q[3]):null)});return C}
// fidgets: ids and durations (s). 0-9 hero, 10-19 foe, 20-29 town folk
var IDL_HD={0:1.8,1:2.4,2:1.4,3:2.2,4:2.0,5:1.6,6:2.4,10:2.6,11:1.6,12:1.9,13:2.4,14:2.2,20:2.8,21:2.6,22:2.4,23:1.6};
var IDL_FH=[0,3,1,3,2,3,3,2],IDL_FHM=[0,3,1,2,2,2,3,2,4,3],IDL_FHR=[0,3,1,2,2,2,3,2,5,3],IDL_FHW=[0,3,1,3,2,3,3,2,6,3],IDL_FF=[10,3,11,3,12,2,13,3,14,2],IDL_FFB=[10,3,13,3],IDL_FN=[20,2,21,2,22,3,23,3];
// one frame of the humanoid idle. h: object with bones; S: state; dt: seconds; kind: 0 player, 1 other hero, 2 foe, 3 town folk
// quiet: the model may idle (not moving / attacking); mvw: the gait's moving blend; act: an action just began (player)
function idlHum(h,S,dt,kind,quiet,mvw,boss){
  const b=h.bones,O=IDO,A=S.sp;for(const k in O)O[k]=0;
  if(!S.C)S.C=idlHumCh(b);
  // weights: iw for the whole layer, wX for channels outside the action system, cw = combat-ready stance
  const tq=quiet?1:0;idlSp(S.sp,0,tq,quiet?.45*S.slow:.12,dt);const iwR=idlCl(A[0],0,1)*(1-idlCl(mvw,0,1));
  let cwT=0;if(kind==0)cwT=IDL.combat!=null?IDL.combat:IDL.cbV;else if(kind==2){const e=h._ie;cwT=e&&e.agg?1:0}
  idlSp(A,2,cwT,.35,dt);const cw=idlCl(A[2],0,1);
  const iw=iwR;S.iw=iw;
  if(iw<1e-3&&S.fid<0){if(S.on){for(const c of S.C)idlAp(c,0);S.on=0}return}
  S.on=1;S.t+=dt;const sl=S.slow;
  // ---- breathing ----
  S.bp+=dt*S.bf*IDL_TAU*(1+.35*cw);if(S.bp>1e4)S.bp%=IDL_TAU;
  const B=Math.sin(S.bp)+.22*Math.sin(2*S.bp-.6),bk=(boss?1.5:1)*(1-.3*cw);
  O.cx-=.022*B*bk;O.az+=.022*B*bk;O.lz-=.022*B*bk;O.hx+=.012*B*bk;O.dy+=.004*B*bk;
  // ---- weight shift: hold on one leg, then the other (sometimes square) ----
  S.wT-=dt;if(S.wT<=0){const r=idlR(S);S.wg=r<.18?0:(r<.59?-1:1)*idlRR(S,.65,1);S.wT=idlRR(S,2.6,6.5)*sl*(1-.55*cw)}
  const W=idlSp(A,4,S.wg*(1-.6*cw),.9*sl*(1-.5*cw),dt);
  const px=.02*W,pz=.034*W;O.px+=px;O.pz+=pz;O.sz-=pz*.75;O.cz-=pz*.35;O.hz+=.03*W;O.py+=.035*W;O.sy-=.03*W;
  O.lk+=.13*Math.max(0,W);O.rk+=.13*Math.max(0,-W);O.lh-=.04*Math.max(0,W);O.rh-=.04*Math.max(0,-W);
  // arms hang with the shoulders: the free side drifts a little
  O.ax-=.025*W;O.lx+=.025*W;
  // ---- glances: pick a look target now and then, the head eases there and holds ----
  S.lT-=dt;if(S.lT<=0){const big=idlR(S)<.3;S.ly=(big?idlRR(S,-.75,.75):idlRR(S,-.3,.3))*(1-.65*cw);S.lp=idlRR(S,-.12,.12)+(kind==3?.04:0);S.lt=idlRR(S,-.08,.08);
    S.lT=idlRR(S,1.4,4.2)*sl*(big?1.2:1);S.ad=idlRR(S,-1,1)}
  const ly=idlSp(A,6,S.ly,.32*sl,dt),lp=idlSp(A,8,S.lp,.4*sl,dt),lt=idlSp(A,10,S.lt,.5*sl,dt),ad=idlSp(A,12,S.ad||0,1.2,dt);
  O.hy+=ly*.62;O.ny+=ly*.25;O.sy+=ly*.12;O.hx+=lp;O.hz+=lt;
  O.ax+=.03*ad;O.lx-=.025*ad;O.ex-=.04*(1+ad);O.le-=.03*(1-ad);
  // ---- combat-ready stance ----
  if(cw>1e-3){const c=cw,bo=Math.sin(S.t*IDL_TAU*1.1)*.006;
    O.lk+=.2*c;O.rk+=.2*c;O.lh-=.12*c;O.rh-=.06*c;O.la+=.1*c;O.ra+=.04*c;O.dy+=(-.028+bo)*c;O.sx+=.08*c;O.hx-=.07*c;O.lhz-=.05*c;O.rhz+=.05*c;
    if(kind==0){const wt=IDL.wt;if(wt=='bow'||wt=='crossbow'||wt=='sling'){O.lx-=.35*c;O.le-=.3*c;O.ax-=.2*c;O.ex-=.5*c}
      else if(wt=='staff'||wt=='wand'||wt=='orb'){O.ax-=.35*c;O.ex-=.45*c;O.lx-=.3*c;O.le-=.6*c}
      else{O.ax-=.42*c;O.ex-=.55*c;O.az+=.06*c;O.lx-=.3*c;O.le-=.55*c;O.lz-=.08*c}}
    else{O.ax-=.35*c;O.ex-=.45*c;O.lx-=.3*c;O.le-=.45*c;O.py+=.06*Math.sin(S.t*.9)*c;O.sy-=.06*Math.sin(S.t*.9)*c}}
  // ---- fidgets ----
  const list=kind==3?IDL_FN:kind==2?(boss?IDL_FFB:IDL_FF):kind==0?(IDL.cls=='mage'?IDL_FHM:IDL.cls=='ranger'?IDL_FHR:IDL.cls=='warrior'?IDL_FHW:IDL_FH):IDL_FH;
  const allow=quiet&&iwR>.9&&(cw<.1||kind==2);
  if(idlFid(S,dt,allow&&!(kind==0&&cw>.1),list,IDL_HD)){const u=S.fu,s=S.fs,f=S.fid;let e;
    switch(f){
      case 0:{e=idlEnv(u,.15,.2);const th=idlSS(.05,.95,u)*IDL_TAU*2;O.ax+=.12*Math.sin(th)*e;O.lx+=.12*Math.sin(th)*e;O.az+=.07*(.5-.5*Math.cos(th))*e;O.lz-=.07*(.5-.5*Math.cos(th))*e;O.cx-=.05*Math.sin(th)*e;O.hx+=.04*Math.sin(th)*e;break}// roll shoulders
      case 1:{e=idlEnv(u,.25,.25);O.ax-=.5*e;O.ex-=.75*e;O.rw+=.25*e;O.az-=.12*e;O.hy+=.45*e-ly*.62*e;O.hx+=.28*e;O.sy+=.12*e;O.rw+=.12*Math.sin(u*IDL_TAU*1.5)*e;break}// check weapon
      case 2:{e=idlEnv(u,.2,.25);O.rw+=.22*Math.sin(u*IDL_TAU*2)*e;O.ax-=.12*e;O.ex-=.2*e;O.az+=.05*Math.sin(u*IDL_TAU*2)*e;break}// adjust grip
      case 3:{e=idlEnv(u,.25,.3);O.hy+=s*.85*e-ly*.62*e;O.ny+=s*.2*e;O.sy+=s*.28*e;O.py+=s*.08*e;O.hx-=.04*e;O.lx+=s*.06*e;O.ax+=s*.06*e;break}// look over the shoulder
      case 4:{e=idlEnv(u,.2,.25);const fl=idlSS(.5,.58,u)*(1-idlSS(.62,.9,u));O.lx-=.85*e;O.lz+=.15*e;O.le-=1.15*e;O.lw+=.5*e+.6*fl;O.hy-=.35*e-ly*.62*e;O.hx+=.2*e;
        if(kind==0&&u>.52&&S.fx!=1){S.fx=1;idlSpark(h,0x9a7aff)}if(u<.3)S.fx=0;break}// mage: glow flick
      case 5:{e=idlEnv(u,.25,.25);const pl2=idlSS(.45,.55,u)*(1-idlSS(.6,.75,u));O.lx-=.55*e;O.lz+=.08*e;O.le-=.4*e;O.lw+=.12*e;O.hy-=.4*e-ly*.62*e;O.hx+=.18*e;O.ax-=.45*pl2;O.ex-=.8*pl2;break}// ranger: bow check
      case 6:{e=idlEnv(u,.15,.15);O.hz+=.24*Math.sin(u*IDL_TAU)*e;O.hx+=.1*e;O.az+=.05*e;O.lz-=.05*e;O.cx-=.03*e;break}// warrior: neck stretch
      case 10:{e=idlEnv(u,.2,.2);const th=u*IDL_TAU;O.sy+=.16*Math.sin(th)*e;O.pz+=.04*Math.sin(th+1)*e;O.sx+=.06*(.5-.5*Math.cos(th))*e;O.hy-=.12*Math.sin(th)*e;O.lz-=.06*e;O.az+=.06*e;break}// menacing sway
      case 11:{e=idlEnv(u,.2,.25);const tp=Math.max(0,Math.sin(u*IDL_TAU*2));O.ax-=(.25+.12*tp)*e;O.ex-=.35*e;O.hx+=.18*e;O.hy+=.18*e-ly*.62*e;break}// weapon tap
      case 12:{e=idlEnv(u,.25,.3);O.sx+=.14*e;O.cx-=.08*e;O.hx-=.2*e;O.az+=.12*e;O.lz-=.12*e;O.ex-=.25*e;O.le-=.25*e;O.dy-=.015*e;O.lk+=.08*e;O.rk+=.08*e;break}// growl lean
      case 13:{e=idlEnv(u,.15,.2);const lr=idlSS(.04,.3,u)-2*idlSS(.45,.72,u);O.hy+=s*.7*lr*e-ly*.62*e;O.sy+=s*.1*lr*e;O.hx-=.03*e;break}// look around
      case 14:{e=idlEnv(u,.2,.3);O.hz+=s*.2*Math.sin(u*Math.PI)*e;O.hx+=.12*e;O.sy+=s*.06*e;break}// roll the neck
      case 20:{e=idlEnv(u,.3,.3);O.sx-=.16*e;O.cx-=.1*e;O.hx-=.26*e;O.ax+=.22*e;O.lx+=.22*e;O.ex+=.15*e;O.le+=.15*e;O.az+=.08*e;O.lz-=.08*e;O.dy+=.008*e;break}// stretch
      case 21:{e=idlEnv(u,.22,.25);const sc=Math.sin(u*IDL_TAU*5)*idlSS(.25,.35,u)*(1-idlSS(.7,.8,u));O.ax-=2.3*e;O.az+=.35*e;O.ex-=1.35*e+.12*sc;O.hz-=.12*e;O.hx+=.06*e;O.hy-=ly*.62*e;break}// scratch head
      case 22:{e=idlEnv(u,.25,.3);O.px+=.022*s*e;O.pz+=.05*s*e;O.sz-=.035*s*e;O.lk+=(s>0?.18:0)*e;O.rk+=(s<0?.18:0)*e;O.hy+=s*.25*e;break}// shift
      case 23:{e=idlEnv(u,.15,.2);O.hx+=(.1+.08*Math.sin(u*IDL_TAU*2))*e;O.nx+=.05*e;break}// nod
    }}
  // hips counter-rotate so the feet stay where they are when the pelvis shifts and rolls
  const LL=.55;O.lhz-=O.px/LL+O.pz;O.rhz-=O.px/LL+O.pz;
  // knees bent: tip the ankle so the sole stays flat
  O.la-=(O.lh+O.lk)*.6;O.ra-=(O.rh+O.rk)*.6;
  // apply: the player's action-system channels use wH (0 the moment an action starts), the rest wX (eases out)
  const wX=iw;let wH=iw;if(kind==0){if(S.busy0)S.wH=0;S.wH=Math.min(iw,(S.wH||0)+dt/.35);wH=S.wH}
  const C=S.C;for(let i=0;i<IDL_HCH.length;i++){const q=IDL_HCH[i];idlAp(C[i],O[q[0]]*(q[4]&&kind==0?wH:wX))}
}
// a few sparkles at the free hand (mage flick)
function idlSpark(h,col){try{if(typeof burst!='function'||!h.bones||!h.bones.aL2)return;const v=IDL._v||(IDL._v=new THREE.Vector3());h.bones.aL2.getWorldPosition(v);v.y-=.05;burst(v,col,6,.6,.8,.5)}catch(_){}}

// ---- the player and other heroes (animHero) ----
{const f=animHero;animHero=function(now,mv,h){
  h=h||pl;
  if(h._foe)return f.call(this,now,mv,h); // humanoid foes: humAnim's wrapper below handles them
  const isP=h===pl;
  if(!isP){if(h._ido==null)h._ido=Math.random()*6e4;f.call(this,now+h._ido,mv,h)}else f.call(this,now,mv,h);
  if(!IDL.on||!h.bones)return;
  let t0=IDL.prof?IDL.pnow():0;
  try{
    let S=h._idl;if(!S)S=h._idl=idlNew(h,1);
    const dt=S.lt0==null?0:Math.min(.05,Math.max(0,(now-S.lt0)/1000));S.lt0=now;
    if(!isP&&!idlVis(h)){if(S.on){for(const c of S.C)idlAp(c,0);S.on=0;S.sp[0]=0;S.sp[1]=0}return}
    const G=h._ga,mvw=G?G.w:(mv?1:0);let quiet=!mv,busy=0;
    if(isP){const rid=typeof riding!='undefined'&&!!riding;busy=!!(HA.cur||pl.sw||hero.chan)||rid||(typeof hero!='undefined'&&hero.hp<=0);
      quiet=quiet&&!busy;S.busy0=busy&&!S.busyL?1:busy?1:0;S.busyL=busy;
      // combat-ready: a hunting foe within 15 tiles, or any foe within 6 (checked a few times a second)
      IDL.cbT-=dt;if(IDL.cbT<=0){IDL.cbT=.3;let c=0;try{const p=pl.position;for(const e of enemies){if(e.dead||!e.m||!e.m.visible||e.bfx)continue;const dx=e.m.position.x-p.x,dz=e.m.position.z-p.z,d2=dx*dx+dz*dz;if(d2<36||(e.agg&&d2<225)){c=1;break}}}catch(_){}
        IDL.cbV=c;try{IDL.cls=hero.cls;IDL.wt=typeof atkWT=='function'?atkWT():null}catch(_){}}}
    else{busy=!!h.sw;quiet=quiet&&!busy;S.busy0=0}
    idlHum(h,S,dt,isP?0:1,quiet,mvw,false);
  }catch(e){if(!IDL.err){IDL.err=1;console.warn('idle hero',e)}}
  if(IDL.prof){IDL.ms+=IDL.pnow()-t0;IDL.n++}
}}
// ---- humanoid foes (and the two humanoid Sovereigns) ----
{const f=humAnim;humAnim=function(g,now,mv,sp){
  const h=g.h;if(!h||!h.bones)return f.apply(this,arguments);h._foe=1;h._ie=g._ie;
  if(g._ido==null)g._ido=Math.random()*6e4;
  const r=f.call(this,g,now+g._ido,mv,sp);
  if(!IDL.on)return r;let t0=IDL.prof?IDL.pnow():0;
  try{let S=h._idl;const boss=!!g._bo;if(!S)S=h._idl=idlNew(h,boss?1.6:1);
    const dt=S.lt0==null?0:Math.min(.05,Math.max(0,(now-S.lt0)/1000));S.lt0=now;
    if(!idlVis(g)){if(S.on){for(const c of S.C)idlAp(c,0);S.on=0;S.sp[0]=0;S.sp[1]=0}}
    else{const e=g._ie,G=h._ga,busy=!!(g.ak||(e&&(e.stun>0||e.atk))||(boss&&g._bo.bs&&(g._bo.bs.lock>0||g._bo.bs.dash)));
      idlHum(h,S,dt,2,!mv&&!busy,G?G.w:(mv?1:0),boss)}
  }catch(e){if(!IDL.err){IDL.err=1;console.warn('idle foe',e)}}
  if(IDL.prof){IDL.ms+=IDL.pnow()-t0;IDL.n++}
  return r}}
// remember which enemy a model belongs to (aggro, stun) — set every frame the enemy is updated
{const f=eTick;eTick=function(e,dt,now){if(e&&e.m)e.m._ie=e;return f.apply(this,arguments)}}

// =====================================================================================================
// creatures, companions and Sovereigns (every SPEC rig)
// =====================================================================================================
// fidget ids: 30 sniff, 31 look, 32 shake, 33 groom, 34 yawn, 35 sit (companions), 40 throat/shuffle (hop),
// 45 flutter, 46 swoop (fly), 50 leg shuffle, 51 mandibles, 52 body turn (spider), 55 wobble, 56 squash (slime),
// 60 drift turn, 61 arm wave (float), 65 rear and look, 66 tongue, 67 coil (serpent), 70 roar, 71 snort (Sovereigns)
var IDL_CD={30:1.8,31:2.4,32:1.0,33:2.2,34:1.8,35:6.5,40:1.6,45:1.4,46:2.2,50:1.4,51:1.0,52:2.4,55:1.6,56:1.2,60:4,61:2.4,65:3,66:1.1,67:3.2,70:2.6,71:1.4};
var IDL_FC={quad:[30,3,31,3,32,1,33,2,34,1],quadC:[30,3,31,3,32,2,33,2,34,1,35,2],quadS:[30,3,31,3,34,1],hop:[31,3,40,3,30,1],fly:[45,3,46,2,31,2],spider:[50,4,51,3,52,2],
  waddle:[55,3,56,2,31,2],float:[60,3,61,2,31,2],slither:[65,3,66,3,67,2],bossOut:[70,2,31,3,71,1],bossIn:[71,1,31,2]};
function idlCrCh(x){
  const b=x.bones,C={},S=x.spec,legs=S.legs||[];const r=(n,k)=>b[n]?idlCh(b[n].rotation,k):null;
  C.hx=r('head','x');C.hy=r('head','y');C.hz=r('head','z');C.nx=r('neck','x');C.ny=r('neck','y');C.jw=r('jaw','x');
  C.cx=r('chest','x');C.cy=r('chest','y');C.sx=r('spine','x');C.sy=r('spine','y');C.px=r('pelvis','x');C.py=r('pelvis','y');C.pz=r('pelvis','z');
  C.by=x.b?idlCh(x.b.position,'y'):null;
  C.tx=[];C.ty=[];for(let i=0;i<4;i++){C.tx.push(r('tail'+i,'x'));C.ty.push(r('tail'+i,'y'))}
  C.ps=b.pelvis?[idlCh(b.pelvis.scale,'x'),idlCh(b.pelvis.scale,'y'),idlCh(b.pelvis.scale,'z')]:null;
  C.lg=legs.map(q=>({k:q[0],h:r(q[0]+'0','x'),hy:r(q[0]+'0','y'),k1:r(q[0]+'1','x'),kz:r(q[0]+'1','z'),a:r(q[0]+'2','x')}));
  C.ea=(x.ears||[]).map(e=>idlCh(e.rotation,'z'));C.wg=(x.wings||[]).map(w=>idlCh(w.p.rotation,'z'));
  return C}
var IDC={hx:0,hy:0,hz:0,nx:0,ny:0,jw:0,cx:0,cy:0,sx:0,sy:0,px:0,py:0,pz:0,by:0,sq:0,t0:0,t1:0,t2:0,t3:0,y0:0,y1:0,y2:0,y3:0,fh:0,fk:0,hh:0,hk:0,ha:0,fa:0,lgS:-1,lgK:0,ear:0,eid:-1,wg:0};
function idlCr(x,now,mv){
  const g=x.g,ty=x.spec.anim;
  let S=g._idl;const boss=!!g._bo,comp=!g.isE;
  if(!S){S=g._idl=idlNew(g,boss?1.7:(x.spec.gs?1.3:1));S.C=idlCrCh(x);S.L=gaLegLen(x.spec)}
  const dt=S.lt0==null?0:Math.min(.05,Math.max(0,(now-S.lt0)/1000));S.lt0=now;
  const C=S.C,A=S.sp;
  if(!idlVis(g)){if(S.on)idlCrApply(C,idlZ(),0);S.on=0;A[0]=0;A[1]=0;return}
  const e=g._ie||g._bo||null,bs=boss&&g._bo.bs;
  const busy=!!(g.atk||g.ak||g._lk!=null||g.lk||g._mv||(e&&(e.stun>0||e.atk||e.jmp||e.spin||e.fly||e.hid))||(bs&&(bs.lock>0||bs.dash)));
  const quiet=!mv&&!busy;idlSp(A,0,quiet?1:0,quiet?.5*S.slow:.11,dt);
  const G=g._ga,mvw=G?G.w:(mv?1:0),iw=idlCl(A[0],0,1)*(1-idlCl(mvw,0,1));
  if(iw<1e-3&&S.fid<0){if(S.on){idlCrApply(C,idlZ(),0);S.on=0}return}
  S.on=1;S.t+=dt;const O=idlZ(),sl=S.slow,L=S.L;
  // ---- breathing: the flank/chest rises, the back flexes a touch ----
  S.bp+=dt*S.bf*IDL_TAU*(boss?.75:1);const B=Math.sin(S.bp)+.2*Math.sin(2*S.bp-.6),bk=boss?1.6:1;
  O.cx-=.03*B*bk;O.sx+=.012*B*bk;O.hx+=.015*B*bk;O.jw+=(boss?.03:.012)*(B+1);
  // ---- glances ----
  S.lT-=dt;if(S.lT<=0){const big=idlR(S)<.35;S.ly=big?idlRR(S,-.6,.6):idlRR(S,-.25,.25);S.lp=idlRR(S,-.15,.12);S.lt=idlRR(S,-.12,.12);S.lT=idlRR(S,1.2,3.8)*sl}
  const ly=idlSp(A,6,S.ly,.3*sl,dt),lp=idlSp(A,8,S.lp,.4*sl,dt),lt=idlSp(A,10,S.lt,.5*sl,dt);
  O.hy+=ly*.55;O.ny+=ly*.4;O.sy+=ly*.08;O.hx+=lp;O.hz+=lt;
  // ---- weight shift: a slow roll and yaw of the hips ----
  S.wT-=dt;if(S.wT<=0){S.wg=idlRR(S,-1,1);S.wT=idlRR(S,2.5,6)*sl}const W=idlSp(A,4,S.wg,1.1*sl,dt);O.pz+=.025*W;O.py+=.03*W;O.sy-=.02*W;
  // ---- tail: slow own-rhythm sway + an occasional flick ----
  S.tp+=dt*S.tr*IDL_TAU*.35/sl;S.tT-=dt;if(S.tT<=0){S.tT=idlRR(S,2,6)*sl;S.tf=1;S.ts=idlR(S)<.5?-1:1}
  if(S.tf>0)S.tf=Math.max(0,S.tf-dt/.6);const fk=S.tf>0?Math.sin((1-S.tf)*Math.PI*2)*Math.sin((1-S.tf)*Math.PI)*S.ts:0;
  {const ks=ty=='slither'?.5:1;O.y0+=(.09*Math.sin(S.tp)+.088*fk)*ks;O.y1+=(.09*Math.sin(S.tp-.75)+.154*fk)*ks;O.y2+=(.09*Math.sin(S.tp-1.5)+.22*fk)*ks;O.y3+=(.09*Math.sin(S.tp-2.25)+.286*fk)*ks;
   const c=.025;O.t0+=c*Math.sin(S.tp*.7);O.t1+=c*Math.sin(S.tp*.7-.6);O.t2+=c*Math.sin(S.tp*.7-1.2);O.t3+=c*Math.sin(S.tp*.7-1.8)}
  // ---- ears: a twitch now and then ----
  S.eT-=dt;if(S.eT<=0){S.eT=idlRR(S,1.2,4.5);S.ei=Math.floor(idlR(S)*Math.max(1,C.ea.length));S.ef=1}
  if(S.ef>0){S.ef=Math.max(0,S.ef-dt/.28);O.eid=S.ei;O.ear=Math.sin((1-S.ef)*Math.PI)*.35*(S.ei%2?1:-1)}
  // ---- body type layers ----
  if(ty=='fly'){O.pz+=.06*Math.sin(S.t*.9/sl+S.tp);O.wg+=.12*Math.sin(S.t*2.3)}
  if(ty=='float'){O.py+=.25*Math.sin(S.t*.35/sl+S.bp*.1);O.by+=.04*Math.sin(S.t*.6+1)*L}
  if(ty=='waddle'){O.sq+=.025*Math.sin(S.t*2.2/sl+S.tp)}
  if(ty=='slither'){O.hx-=.08;O.nx-=.05}
  // ---- fidgets ----
  const list=boss?(e&&e.agg?IDL_FC.bossIn:IDL_FC.bossOut):ty=='quad'?(x.spec.gs?IDL_FC.quadS:(comp&&(x.spec.legs||[]).length==4)?IDL_FC.quadC:IDL_FC.quad):IDL_FC[ty]||IDL_FC.quad;
  if(idlFid(S,dt,quiet&&iw>.9,list,IDL_CD)){const u=S.fu,s=S.fs;let ee;
    switch(S.fid){
      case 30:{ee=idlEnv(u,.2,.25);const sn=Math.sin(u*IDL_TAU*7)*idlSS(.25,.35,u)*(1-idlSS(.75,.85,u));O.nx+=.35*ee;O.hx+=.3*ee+.05*sn;O.hy+=s*.2*ee-ly*.55*ee;O.jw+=.03*sn*ee;break}
      case 31:{ee=idlEnv(u,.2,.25);O.hy+=s*.75*ee-ly*.55*ee;O.ny+=s*.35*ee-ly*.4*ee;O.hx-=.12*ee;O.hz+=s*.12*ee;O.sy+=s*.1*ee;break}
      case 32:{ee=idlEnv(u,.22,.35);const sh=Math.sin(u*IDL_TAU*5.5)*ee;O.hy+=.28*sh;O.ny+=.18*sh;O.sy-=.13*sh;O.py+=.09*sh;O.pz+=.07*sh;O.ear+=.3*sh;O.eid=-2;O.y0-=.12*sh;O.y1-=.12*sh;O.y2-=.12*sh;O.y3-=.12*sh;break}
      case 33:{ee=idlEnv(u,.25,.25);const ch=Math.sin(u*IDL_TAU*9)*idlSS(.3,.4,u)*(1-idlSS(.7,.8,u));O.ny+=s*.7*ee-ly*.4*ee;O.hy+=s*.75*ee-ly*.55*ee;O.sy+=s*.25*ee;O.nx+=.25*ee;O.hx+=.25*ee+.04*ch;O.jw+=.12*Math.max(0,ch)*ee;O.pz-=s*.05*ee;break}
      case 34:{ee=idlEnv(u,.3,.3);const op=Math.sin(Math.PI*idlSS(.1,.8,u));O.hx-=.3*op;O.nx-=.15*op;O.jw+=.7*op;O.cx-=.05*op;O.ear-=.2*op;O.eid=-2;break}
      case 35:{ee=idlEnv(u,.14,.14);// sit: the rear lowers, hind legs fold, front legs stay straight, head up
        O.px-=.42*ee;O.by-=.32*L*ee;O.hh-=.45*ee;O.hk+=1.25*ee;O.ha-=.55*ee;O.fh+=.36*ee;O.fk-=.0*ee;O.fa+=.1*ee;O.cx+=.08*ee;O.nx-=.05*ee;O.hx+=.28*ee;
        O.t0+=.35*ee;O.t1+=.14*ee;O.t2+=.14*ee;O.t3+=.14*ee;break}
      case 40:{ee=idlEnv(u,.2,.2);const th=Math.max(0,Math.sin(u*IDL_TAU*3));O.jw+=.06*th*ee;O.cx-=.04*th*ee;O.hx-=.05*ee;O.py+=s*.2*ee;break}
      case 45:{ee=idlEnv(u,.15,.3);O.wg+=.35*Math.sin(u*IDL_TAU*5)*ee;O.by+=.06*Math.sin(u*Math.PI)*ee*L;O.hx-=.1*ee;break}
      case 46:{ee=idlEnv(u,.25,.3);O.pz+=s*.3*Math.sin(u*Math.PI)*ee;O.py+=s*.25*ee;O.hy-=s*.2*ee;break}
      case 50:{ee=1;if(S.lg0==null||u<.05)S.lg0=Math.floor(idlR(S)*8);const st=u*3,k=Math.floor(st);O.lgS=(S.lg0+k*3)%8;O.lgK=Math.sin(Math.PI*idlSS(0,1,st-k));break}// three legs lift and re-plant in turn
      case 51:{ee=1;const tw=Math.max(0,Math.sin(u*IDL_TAU*4));O.jw+=.18*tw*idlEnv(u,.1,.2);O.hx+=.04*tw;break}
      case 52:{ee=idlEnv(u,.25,.25);O.py+=s*.22*ee;O.hy+=s*.25*ee;O.by+=.015*L*Math.sin(u*IDL_TAU*2)*ee;break}
      case 55:{ee=idlEnv(u,.1,.25);O.sq+=.09*Math.sin(u*IDL_TAU*3)*(1-u)*ee;O.hy+=s*.1*ee;break}
      case 56:{ee=idlEnv(u,.1,.3);O.sq-=.08*Math.sin(Math.PI*idlSS(0,.5,u))*ee-.05*Math.sin(Math.PI*idlSS(.4,1,u))*ee;break}
      case 60:{ee=idlEnv(u,.3,.3);O.py+=s*.55*ee;O.hy-=s*.15*ee;break}
      case 61:{ee=idlEnv(u,.2,.2);O.cx-=.05*Math.sin(u*IDL_TAU)*ee;O.hx-=.08*ee;O.by+=.05*L*Math.sin(u*Math.PI)*ee;break}
      case 65:{ee=idlEnv(u,.25,.25);O.nx-=.3*ee;O.hx-=.18*ee;O.cx-=.12*ee;O.hy+=s*.45*Math.sin(u*IDL_TAU)*ee;O.ny+=s*.25*Math.sin(u*IDL_TAU)*ee;break}
      case 66:{ee=1;const tg=Math.max(0,Math.sin(u*IDL_TAU*3))*idlEnv(u,.1,.2);O.jw+=.22*tg;O.hx-=.06*tg;break}
      case 67:{ee=idlEnv(u,.25,.25);const a=u*IDL_TAU;O.y0+=.25*Math.sin(a)*ee;O.y1+=.25*Math.sin(a-.9)*ee;O.y2+=.25*Math.sin(a-1.8)*ee;O.y3+=.25*Math.sin(a-2.7)*ee;O.sy+=.12*Math.sin(u*IDL_TAU-.5)*ee;break}
      case 70:{ee=idlEnv(u,.2,.3);const ro=Math.sin(Math.PI*idlSS(.15,.85,u)),sh=Math.sin(u*IDL_TAU*9)*ro;O.nx-=.35*ro;O.hx-=.3*ro+.03*sh;O.jw+=.7*ro;O.cx-=.1*ro;O.px-=.08*ro;O.hy-=ly*.55*ro;break}
      case 71:{ee=idlEnv(u,.15,.25);const sh=Math.sin(u*IDL_TAU*4)*ee;O.hy+=.18*sh;O.hz+=.1*sh;O.jw+=.08*ee;break}
    }}
  idlCrApply(C,O,iw,ty);
}
function idlZ(){const O=IDC;for(const k in O)O[k]=0;O.lgS=-1;O.eid=-1;return O}
function idlCrApply(C,O,w,ty){
  idlAp(C.hx,O.hx*w);idlAp(C.hy,O.hy*w);idlAp(C.hz,O.hz*w);idlAp(C.nx,O.nx*w);idlAp(C.ny,O.ny*w);idlAp(C.jw,O.jw*w);
  idlAp(C.cx,O.cx*w);idlAp(C.sx,O.sx*w);idlAp(C.sy,O.sy*w);idlAp(C.px,O.px*w);idlAp(C.py,O.py*w);idlAp(C.pz,O.pz*w);idlAp(C.by,O.by*w);
  const T=C.tx,Y=C.ty;idlAp(T[0],O.t0*w);idlAp(T[1],O.t1*w);idlAp(T[2],O.t2*w);idlAp(T[3],O.t3*w);idlAp(Y[0],O.y0*w);idlAp(Y[1],O.y1*w);idlAp(Y[2],O.y2*w);idlAp(Y[3],O.y3*w);
  if(C.ps){const q=O.sq*w;idlAp(C.ps[0],q*.5);idlAp(C.ps[1],-q);idlAp(C.ps[2],q*.5)}
  const sp=ty=='spider';
  for(let i=0;i<C.lg.length;i++){const l=C.lg[i],fr=l.k[0]=='f';
    if(sp){const k=O.lgS==i?O.lgK*w:0,sd=l.k[0]=='a'?-1:1;idlAp(l.hy,k*.18*sd);idlAp(l.kz,sd*k*.5);idlAp(l.h,0);idlAp(l.k1,0);idlAp(l.a,0);continue}
    idlAp(l.hy,0);idlAp(l.kz,0);
    idlAp(l.h,(fr?O.fh:O.hh)*w);idlAp(l.k1,(fr?O.fk:O.hk)*w);idlAp(l.a,(fr?O.fa:O.ha)*w)}
  for(let i=0;i<C.ea.length;i++)idlAp(C.ea[i],O.eid==-2||O.eid==i?O.ear*w:0);
  for(let i=0;i<C.wg.length;i++)idlAp(C.wg[i],O.wg*w*(i%2?-1:1));
}
{const f=rigAnim;rigAnim=function(x,now,mv,sp){
  const g=x&&x.g;if(!g)return f.apply(this,arguments);
  if(x.spec===SPEC.Centipede)return f.apply(this,arguments); // Ssith'ra & co keep the v89 sands animation untouched
  if(g._ido==null)g._ido=Math.random()*6e4;
  f.call(this,x,now+g._ido,mv,sp);
  if(!IDL.on)return;let t0=IDL.prof?IDL.pnow():0;
  try{idlCr(x,now,mv)}catch(e){if(!IDL.err){IDL.err=1;console.warn('idle creature',e)}}
  if(IDL.prof){IDL.ms+=IDL.pnow()-t0;IDL.n++}
}}

// =====================================================================================================
// mounts
// =====================================================================================================
var IDL_MD={80:1.4,81:1.3,82:1.6,83:3.2};
var IDL_FM=[80,3,81,3,82,3,83,2];
var IDM={nx:0,ny:0,hx:0,bz:0,bx:0,by:0,tz:0,tx:0,lg:0,lk:0,li:0};
{const f=mkMountRig;mkMountRig=function(k){const r=f.apply(this,arguments);try{idlMount(r)}catch(e){console.warn('idle mount',e)}return r}}
function idlMount(r){
  const o=r.rig,b=r.b;if(!o||!b)return;
  const bb=b.children.filter(c=>c.isBone),neck=bb[0],tail=bb[1],head=neck&&neck.children.find(c=>c.isBone);
  const hips=r.children.filter(c=>c.isBone&&c!==b),legs=hips.map(h=>({h:h,k:h.children.find(c=>c.isBone),fr:h.position.z>0}));
  const C={nx:neck&&idlCh(neck.rotation,'x'),ny:neck&&idlCh(neck.rotation,'y'),hx:head&&idlCh(head.rotation,'x'),bz:idlCh(b.rotation,'z'),bx:idlCh(b.rotation,'x'),by:idlCh(b.position,'y'),
    tz:tail&&idlCh(tail.rotation,'z'),tx:tail&&idlCh(tail.rotation,'x'),lh:legs.map(l=>idlCh(l.h.rotation,'x')),lz:legs.map(l=>idlCh(l.h.rotation,'z')),lk:legs.map(l=>l.k?idlCh(l.k.rotation,'x'):null)};
  const fronts=legs.map((l,i)=>l.fr?i:-1).filter(i=>i>=0),Lm=hips.length?hips[0].position.y:1;
  r._ido=Math.random()*6e4;
  r.rig=function(now,mv,sp){
    o.call(this,now+r._ido,mv,sp);
    if(!IDL.on)return;let t0=IDL.prof?IDL.pnow():0;
    try{
      let S=r._idl;if(!S)S=r._idl=idlNew(r,1.3);
      const dt=S.lt0==null?0:Math.min(.05,Math.max(0,(now-S.lt0)/1000));S.lt0=now;const A=S.sp;
      idlSp(A,0,mv?0:1,mv?.12:.5,dt);const G=r._ga,iw=idlCl(A[0],0,1)*(1-idlCl(G?G.w:(mv?1:0),0,1));
      if(iw<1e-3&&S.fid<0){if(S.on){for(const k in C){const c=C[k];if(Array.isArray(c))c.forEach(q=>idlAp(q,0));else idlAp(c,0)}S.on=0}}
      else{S.on=1;S.t+=dt;const O=IDM;for(const k in O)O[k]=0;O.li=-1;
        S.bp+=dt*S.bf*IDL_TAU;const B=Math.sin(S.bp);O.by+=.006*B;O.bx+=.008*B;
        S.wT-=dt;if(S.wT<=0){S.wg=idlRR(S,-1,1);S.wT=idlRR(S,3,7)}const W=idlSp(A,4,S.wg,1.2,dt);O.bz+=.022*W;
        S.lT-=dt;if(S.lT<=0){S.ly=idlRR(S,-.35,.35);S.lp=idlRR(S,-.08,.12);S.lT=idlRR(S,1.6,4.5)}
        O.ny+=idlSp(A,6,S.ly,.45,dt);O.nx+=idlSp(A,8,S.lp,.5,dt)+.03*Math.sin(S.t*1.3+S.tp);
        S.tp+=dt*S.tr*IDL_TAU*.4;O.tz+=.08*Math.sin(S.tp);
        if(idlFid(S,dt,!mv&&iw>.9,IDL_FM,IDL_MD)){const u=S.fu,s=S.fs;let ee;
          switch(S.fid){
            case 80:{ee=idlEnv(u,.15,.35);const up=Math.sin(Math.PI*idlSS(0,.45,u));O.nx-=.35*up;O.hx+=.15*up;O.ny+=s*.1*ee;break}// head toss
            case 81:{ee=idlEnv(u,.15,.2);const st=Math.sin(Math.PI*idlSS(.1,.6,u));O.li=fronts.length?fronts[(s>0?0:1)%fronts.length]:-1;O.lg=-.45*st;O.lk=.9*st;O.bz+=s*.01*st;break}// hoof stamp
            case 82:{ee=idlEnv(u,.1,.3);O.tz+=.5*Math.sin(u*IDL_TAU*3)*ee;O.tx-=.15*ee;break}// tail swish
            case 83:{ee=idlEnv(u,.3,.3);O.nx+=.55*ee;O.hx+=.25*ee+.03*Math.sin(u*IDL_TAU*6)*ee;break}// graze
          }}
        idlAp(C.nx,O.nx*iw);idlAp(C.ny,O.ny*iw);idlAp(C.hx,O.hx*iw);idlAp(C.bz,O.bz*iw);idlAp(C.bx,O.bx*iw);idlAp(C.by,O.by*iw*Lm);idlAp(C.tz,O.tz*iw);idlAp(C.tx,O.tx*iw);
        for(let i=0;i<C.lh.length;i++){const on=i==O.li;idlAp(C.lh[i],on?O.lg*iw:0);idlAp(C.lk[i],on?O.lk*iw*(legs[i].fr?-1:1):0);idlAp(C.lz[i],-O.bz*iw)}}
    }catch(e){if(!IDL.err){IDL.err=1;console.warn('idle mount',e)}}
    if(IDL.prof){IDL.ms+=IDL.pnow()-t0;IDL.n++}
  }}

// =====================================================================================================
// town folk: rebuilt as skinned figures on a small skeleton so they can breathe, shift and fidget
// =====================================================================================================
// (npc() runs while the towns are built, before this code: everything here is hoisted functions + lazy state)
function idlNB(){return idlNB.c||(idlNB.c={pelvis:[null,0,.55,0],spine:['pelvis',0,.65,0],chest:['spine',0,.85,0],neck:['chest',0,.99,0],head:['neck',0,1.04,0],
  lh0:['pelvis',-.1,.55,0],lh1:['lh0',-.1,.3,.02],lh2:['lh1',-.1,.07,0],rh0:['pelvis',.1,.55,0],rh1:['rh0',.1,.3,.02],rh2:['rh1',.1,.07,0],
  aL0:['chest',-.2,.95,0],aL1:['aL0',-.235,.72,.1],aL2:['aL1',-.11,.655,.19],aR0:['chest',.2,.95,0],aR1:['aR0',.235,.72,.1],aR2:['aR1',.11,.655,.19]})}
function idlNpcBody(o){
  const NB=idlNB(),names=Object.keys(NB);
  const seed=((o.robe|0)*31+(o.trim|0)*7+((o.hatC|0)*3))%99991+11,R=dkRng(seed),sks=[[214,170,132],[190,146,110],[150,108,78],[222,186,152]],skin=dkHex(sks[Math.floor(R()*4)]);
  const P={skin,hair:null},key='NLS|'+o.robe+'|'+(o.trim||0)+'|'+(o.hat||'')+'|'+(o.hatC||0)+'|'+(o.apron?1:0);
  const L=huNpcLofts(o,P),by=y=>y<=.11?['lh2','rh2',.5]:y<=.32?['lh1','rh1',.5]:y<=.52?['pelvis','pelvis',0]:y<=.64?['pelvis','spine',.5]:y<=.8?['spine','chest',.5]:y<=.97?['chest','chest',0]:y<=1.01?['chest','neck',.5]:['neck','neck',0];
  L[0].rings.forEach(r=>r.b=by(r.p[1]));L[1].rings[0].b=['neck','head',.5];L[2].rings.forEach(r=>r.b=r.p[1]>.98?['chest','neck',.3]:['chest','chest',0]);
  [[3,'aL'],[4,'aR']].forEach(([i,a])=>{const M=[['chest',a+'0',.5],[a+'0',a+'0',0],[a+'0',a+'1',.5],[a+'1',a+'1',0],[a+'1',a+'2',.5],[a+'2',a+'2',0],[a+'2',a+'2',0]];L[i].rings.forEach((r,j)=>r.b=M[Math.min(j,M.length-1)])});
  const mb=mkBones({bones:NB}),geo=huGeo(key,names,L,seed),mesh=new THREE.SkinnedMesh(geo,huMat(1));
  mesh.castShadow=true;mesh.add(mb.bones.pelvis);mesh.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton(mb.arr));
  const kk='NLSK|'+key.slice(4),kit=dkBake(DKBK[kk]?[]:huNpcKit(o,P,seed).P,names,kk);
  kit.forEach(m=>{m.bind(mesh.skeleton,mesh.bindMatrix);m.frustumCulled=true});
  return {meshes:[mesh].concat(kit),bones:mb.bones}}
function npc(p,x,z,o){DKBK=DKBK||{};
  tc(p,x,z,.38);const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=o.ry||0;p.add(g);
  let rig=null;try{rig=idlNpcBody(o)}catch(e){console.error('town folk rig',e)}
  if(rig){rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones}else huNpcBody(o).forEach(m=>g.add(m));
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:txTex([{t:o.label,f:'700 30px'}],256,56,'rgba(10,14,20,.78)','#f4e9c8','rgba(255,214,120,.7)'),transparent:true,depthWrite:false}));
  sp.scale.set(1.5,.33,1);sp.position.set(0,2.05,0);g.add(sp);
  const wb=wbase(p,T_cur);
  TANIM.push({x:wb[0]+x,z:wb[1]+z,f:rig?now=>idlNpc(g,now):now=>{g.position.y=Math.sin(now/700+x)*.012;g.rotation.y=(o.ry||0)+Math.sin(now/2300+z)*.12}});
  return g}
function idlNpc(g,now){
  if(typeof IDL=='undefined'||!IDL||!g.bones)return;
  if(!IDL.on){const S=g._idl;if(S&&S.on){for(const c of S.C)idlAp(c,0);S.on=0}return}
  let t0=IDL.prof?IDL.pnow():0;
  try{let S=g._idl;if(!S){S=g._idl=idlNew(g,1.15);S.sp[0]=1}
    const dt=S.lt0==null?0:Math.min(.05,Math.max(0,(now-S.lt0)/1000));S.lt0=now;
    if(!g.visible||(g.parent&&!g.parent.visible)){return}
    idlHum(g,S,dt,3,true,0,false)}catch(e){if(!IDL.err){IDL.err=1;console.warn('idle town folk',e)}}
  if(IDL.prof){IDL.ms+=IDL.pnow()-t0;IDL.n++}}
