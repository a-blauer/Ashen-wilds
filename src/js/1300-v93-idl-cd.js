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
