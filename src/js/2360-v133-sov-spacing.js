// ================= v133 Sovereigns: sturdier posture, a retreat when hurt hard, and footwork that opens up their moves =================
// 1. Posture: a stagger takes about twice as much damage as before (POS133.mul), every stagger already taken in the fight
//    raises the next one by POS133.esc (up to POS133.escMax), and for POS133.grace ms after a stagger ends the bar fills at half
//    speed. The bar also starts draining a little sooner when the boss is left alone.
// 2. Retreat: when the boss takes a lot of damage in a short time (RT133.frac of its stagger threshold within RT133.win ms) it
//    backs away fast for a moment (sliding along the den wall instead of into it), then answers quickly from the new distance —
//    which is where its ranged and gap-closing moves live. It does this at most once every RT133.cd ms.
// 3. Spacing plans: the move picker only offers moves whose range covers the current distance, so a hero who stands still in
//    melee only ever saw the melee moves. Now, after a move, the boss often (more often when the hero stands still) picks a move
//    it has not used for a while whose range does NOT cover the current distance, walks or backs off to that range and casts it
//    there (giving up after PL133.max seconds). Moves meant for behind the boss are never planned.
// Co-op: all of this runs only on the boss driver (svMoveFree/svPoise/svPick are driver-only); partners follow the position sync
// and the relayed moves as before.
var POS133={mul:2,esc:.15,escMax:.45,grace:3500,drainAfter:2500,drain:.06};
var RT133={win:3000,frac:.4,cd:14000,cd2:10000,chance:.75,t:[1.0,1.5]};
var PL133={p:.45,p2:.55,pStill:.8,max:3.2};
function svPosT133(e){const S=e.sv;return M(e.c)*(S.B.poise||.075)*(S.ph>1?1.15:1)*1.5/((typeof PACE!='undefined'&&PACE.hp)||1.5)*POS133.mul*(1+Math.min(POS133.escMax,POS133.esc*(S.nStag||0)))}
// --- 1. posture ---
{const f=svPoise;svPoise=function(e,d){const S=e&&e.sv;if(!S)return f.apply(this,arguments);
  let k=1/(POS133.mul*(1+Math.min(POS133.escMax,POS133.esc*(S.nStag||0))));if(performance.now()<(S.poG||0))k*=.5;return f.call(this,e,d*k)}}
{const f=svStart;svStart=function(e,id,seed){const r=f.apply(this,arguments);const S=e&&e.sv;
  if(r!==false&&S){S.nC=(S.nC||0)+1;(S.lu||(S.lu={}))[id]=S.nC;
    if(id==='stagger'){S.nStag=(S.nStag||0)+1;S.poG=performance.now()+(((S.B.M.stagger||{}).dur||2.6)*1000)+POS133.grace;S.rt=null;S.plan=null}}
  return r}}
// --- 2. damage memory (every copy records; only the driver acts on it) ---
{const f=hurt;hurt=function(e,d,s,crit,dot){if(!(e&&e.sv&&!e.dead))return f.apply(this,arguments);const h0=e.c.h,r=f.apply(this,arguments),got=h0-e.c.h;
  if(got>0){const S=e.sv,t=performance.now();(S.dl||(S.dl=[])).push([t,got]);while(S.dl.length&&t-S.dl[0][0]>RT133.win)S.dl.shift()}return r}}
function svDmgRecent133(S,now){let s=0;if(S.dl)for(const [t,d] of S.dl)if(now-t<=RT133.win)s+=d;return s}
// a step that slides along the den wall instead of pushing into it
function svStep133(e,ux,uz,sp,dt){const S=e.sv,m=e.m,A=ARN[S.i];if(!A||sp<=0)return 0;const lim=ARENA_R-(S.B.edge||2);
  const rx=m.position.x-A.cx,rz=m.position.z-A.cz,rl=Math.hypot(rx,rz)||.01;
  if(rl>lim-2.5){const nx=rx/rl,nz=rz/rl,out=ux*nx+uz*nz;if(out>0){ux-=nx*out;uz-=nz*out;const sd=S.sd||1;ux+=-nz*sd*out;uz+=nx*sd*out;const l=Math.hypot(ux,uz)||1;ux/=l;uz/=l}}
  walkM(m,ux*sp*dt,uz*sp*dt);return sp}
function svFace133(e,dt){const S=e.sv,ai=S.B.ai||{},m=e.m,da=svAng(svYawTo(m,pl.position)-m.rotation.y),tr=(ai.turn||2.4)*(S.ph>1?1.2:1);m.rotation.y+=Math.max(-tr*dt,Math.min(tr*dt,da));return da}
// --- 3. spacing plans ---
function svSideOk133(D){const a=D.a||'f';return a==='f'||a==='fs'||a==='any'}
function svPlan133(e,force){const S=e.sv,B=S.B,L=d2(pl.position,e.m.position),C=[];let tot=0;
  const p=force?1:(svStill133(S)?PL133.pStill:S.ph>1?PL133.p2:PL133.p);if(Math.random()>=p){S.plan=null;return null}
  for(const id in B.M){const D=B.M[id];if(!D.wt||(D.ph||1)>S.ph||(D.ph1only&&S.ph>1)||!svSideOk133(D))continue;
    if(S.last[0]===id||S.last[1]===id)continue;if((S.cd[id]||0)>(S.rest||0)+PL133.max)continue;
    const r=D.r||[0,99];if(L>=r[0]&&L<=r[1])continue;if(r[0]>ARENA_R*1.4)continue;
    let w=5;try{w=typeof D.wt==='function'?(+D.wt(e,(r[0]+Math.min(r[1],r[0]+5))/2,'f')||0):D.wt}catch(_){}
    const ago=(S.nC||0)-((S.lu&&S.lu[id])||-8);w*=Math.min(8,Math.max(1,ago));if(w>0){C.push([id,w,r]);tot+=w}}
  if(!C.length){S.plan=null;return null}
  let u=Math.random()*tot,pick=C[C.length-1];for(const c of C){u-=c[1];if(u<=0){pick=c;break}}
  const r=pick[2],lo=r[0],hi=Math.min(r[1],lo+5,ARENA_R*1.4);S.plan={id:pick[0],g:lo+(hi-lo)*(.35+Math.random()*.3),r,t:PL133.max};return S.plan}
function svStill133(S){const P=S.pp;if(!P||P.length<6)return false;const a=P[0],b=P[P.length-1];return Math.hypot(a[0]-b[0],a[1]-b[1])<1.5}
{const f=svAfterMove;svAfterMove=function(e,M){f.apply(this,arguments);const S=e&&e.sv;if(!S||e.dead||S.mv||!svAuth(e))return;
  if(M&&M.id==='intro')return;if(M&&M.id==='stagger'){S.plan=null;return}svPlan133(e)}}
{const f=svPick;svPick=function(e,loose){const S=e.sv;if(S&&S.force){const id=S.force;S.force=null;S.plan=null;const D=S.B.M[id];
    if(D&&!((S.cd[id]||0)>0)&&!(D.when&&!D.when(e,d2(pl.position,e.m.position),'f')))return id}
  return f.apply(this,arguments)}}
{const f=svMoveFree;svMoveFree=function(e,dt,now){const S=e.sv,ai=S.B.ai||{},m=e.m;
  if(ai.style==='root'||(!S.rt&&!S.plan))return f.apply(this,arguments);
  const ws=(ai.walk||2.2)*(S.ph>1?(ai.ph2s||1.15):1),v=V().subVectors(pl.position,m.position).setY(0),L=v.length()||.01;
  // retreat: back away fast, facing the hero
  if(S.rt){S.rt.t-=dt;svFace133(e,dt);const sp=Math.max(ai.run||0,ws*1.8)*.9;S.walkSp=svStep133(e,-v.x/L,-v.z/L,sp,dt);S.rest=Math.max(S.rest,dt+.05);
    if(S.rt.t<=0){S.rt=null;S.rest=.25+Math.random()*.2;if(Math.random()<.5)svPlan133(e,true)}return}
  // a plan: walk to the planned move's range, then cast it
  const P=S.plan,D=S.B.M[P.id];P.t-=dt;if(!D||P.t<=0||(D.ph||1)>S.ph){S.plan=null;return f.apply(this,arguments)}
  const da=svFace133(e,dt);
  if(L>=P.r[0]&&L<=P.r[1]&&Math.abs(da)<.9&&!((S.cd[P.id]||0)>0)){S.force=P.id;S.rest=0;S.walkSp=0;return}
  let sp=0,ux=0,uz=0;S.sdT=(S.sdT||0)-dt;if(S.sdT<=0){S.sdT=2+Math.random()*2;S.sd=Math.random()<.5?-1:1}const sd=S.sd||1;
  if(L<P.g-.6){sp=ws*(ai.back?1.15:.95);ux=-v.x/L+(-v.z/L)*sd*.35;uz=-v.z/L+(v.x/L)*sd*.35}
  else if(L>P.g+.6){sp=L>P.g+6&&ai.run?ai.run:ws;ux=v.x/L+(-v.z/L)*sd*.2;uz=v.z/L+(v.x/L)*sd*.2}
  else{sp=ws*.5;ux=-v.z/L*sd;uz=v.x/L*sd}
  const l=Math.hypot(ux,uz)||1;S.walkSp=Math.abs(da)<1.4?svStep133(e,ux/l,uz/l,sp,dt):0;S.rest=Math.max(S.rest,dt+.02)}}
{const f=svAI;svAI=function(e,dt,now){const S=e.sv,A=arenaOf(e);
  if(S&&A){if(!A.f||!S.on){S.plan=null;S.rt=null;S.force=null;S.nStag=0;S.dl=[];S.pp=[];S.poG=0}
    else{// the hero's recent positions (is the hero standing still?)
      S.ppT=(S.ppT||0)-dt;if(S.ppT<=0){S.ppT=.5;(S.pp||(S.pp=[])).push([pl.position.x,pl.position.z]);if(S.pp.length>6)S.pp.shift()}
      if(now-S.poT>POS133.drainAfter)S.po=Math.max(0,S.po-dt*POS133.drain);
      if(S.mv){S.rt=null}
      else if(svAuth(e)&&!S.rt&&!e.dead&&now>=(S.rtCd||0)&&!(S.ph===1&&S.B.ph2&&e.c.h/M(e.c)<=S.B.ph2)){
        if(svDmgRecent133(S,now)>=svPosT133(e)*RT133.frac){
          if(Math.random()<RT133.chance){S.rt={t:RT133.t[0]+Math.random()*(RT133.t[1]-RT133.t[0])};S.plan=null;S.force=null;S.dl=[];
            S.rtCd=now+(S.ph>1?RT133.cd2:RT133.cd);SVX.st.rt=(SVX.st.rt||0)+1;try{burst(gY(e.m.position,.3),0x8a7a66,14,2.2,1.2,.5)}catch(_){}}
          else S.rtCd=now+3000}}}}
  return f.apply(this,arguments)}}
