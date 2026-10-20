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
