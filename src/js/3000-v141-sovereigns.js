// ================= v141 Sovereigns: quicker charged attacks, footwork against melee, an answer to kiting, one fight each =================
// 1. Charged attacks: a move whose first hit lands 1.2 s or more after it starts plays its wind-up faster (SV141.wind): the
//    time to the hit becomes 0.9 + (t - 0.9) × 0.55 (Argus' Gaze 1.38 s → 1.16 s, Vaelric's Skyfall 3.25 s → 2.19 s). Everything in
//    the wind-up (pose, glow, red warning, turning, root motion) runs on the same faster clock, so the tell stays honest.
//    After the first hit the move runs at normal speed.
// 2. Melee: after two moves in a row cast with the hero close (SV141.close tiles), the boss disengages: a quick back-step,
//    then a spacing plan (v133) for a move it cannot use up close, which it walks to and casts. At most every SV141.disCd s.
// 3. Kiting: every Sovereign gains "Reach" (reach141): three eruptions under the hero, each aimed where the hero will be
//    (current position + velocity × lead), with the usual red warning. It is only picked at 8+ tiles, and it is strongly
//    preferred once the hero has stayed that far for SV141.farT s, and certain after SV141.sure s whenever it is off cooldown.
//    While the hero stays far, the boss also walks 40% faster.
// 4. One fight each: a defeated Sovereign never comes back (no respawn timer, removed after a load); its den stays open.
// Co-op: the timing change runs on every machine (same clock rule), the AI parts only on the boss driver like the rest of it.
var SV141={wind:{from:1.2,base:.9,k:.55,max:1.5},close:6.5,disCd:7000,farT:2.5,far:8,lead:.5,chase:1.4};
// ---- 1. faster wind-ups ----
function sv141H0(D){if(D._h141!==undefined)return D._h141;let h=null;(D.hit||[]).forEach(q=>{if(q&&q.t!=null&&(h==null||q.t<h))h=q.t});return D._h141=h}
function sv141K(D,id){if(id==='intro'||id==='awaken'||id==='stagger'||id==='reach141')return 1;const h=sv141H0(D),W=SV141.wind;if(h==null||h<W.from)return 1;
  return Math.min(W.max,h/(W.base+(h-W.base)*W.k))}
{const f=svTickMove;svTickMove=function(e,dt,now){const S=e&&e.sv,M=S&&S.mv;if(M&&dt>0){const k=sv141K(M.D,M.id);if(k>1){const h=sv141H0(M.D);
    if(M.t<h){const rem=(h-M.t)/k;if(dt<=rem)dt*=k;else dt=(h-M.t)+(dt-rem)}}}return f.call(this,e,dt,now)}}
// ---- the hero's distance and speed, per boss ----
{const f=svAI;svAI=function(e,dt,now){const S=e&&e.sv;if(S&&dt>0){const p=pl.position;
    if(S.hp141){const vx=(p.x-S.hp141.x)/dt,vz=(p.z-S.hp141.z)/dt,a=Math.min(1,dt*6);if(Math.hypot(vx,vz)<20){S.hv141=S.hv141||{x:0,z:0};S.hv141.x+=(vx-S.hv141.x)*a;S.hv141.z+=(vz-S.hv141.z)*a}}
    S.hp141={x:p.x,z:p.z};const L=d2(p,e.m.position);S.far141=L>=SV141.far?(S.far141||0)+dt:0}
  const r=f.apply(this,arguments);
  // after the disengage back-step: plan a move for the new range
  try{if(S&&S.dis141&&!S.rt&&!S.mv&&svAuth(e)&&!e.dead){S.dis141=0;if(!sv141Force(e))svPlan133(e,true)}}catch(_){}
  return r}}
// ---- 2. disengage after two close casts in a row ----
// right after the back-step the boss commits to a move it could not use up close (its range starts beyond the hero), cast
// at once even if the hero has followed: a gap-closer, a ranged or an area move, not used in the last two casts and off cooldown
function sv141Force(e){const S=e.sv,B=S.B,L=d2(pl.position,e.m.position),C=[];let tot=0;
  for(const id in B.M){const D=B.M[id];if(!D.wt||id==='reach141'||(D.ph||1)>S.ph||(D.ph1only&&S.ph>1)||!svSideOk133(D))continue;if((S.cd[id]||0)>0)continue;
    if(S.last[0]===id||S.last[1]===id)continue;const r=D.r||[0,99];if(r[0]<=Math.max(2.5,L*.6))continue;if(D.when&&!D.when(e,Math.max(L,r[0]),'f'))continue;
    let w=5;try{w=typeof D.wt==='function'?(+D.wt(e,r[0]+1,'f')||0):D.wt}catch(_){}if(w>0){C.push([id,w]);tot+=w}}
  if(!C.length)return null;let u=Math.random()*tot,id=C[C.length-1][0];for(const c of C){u-=c[1];if(u<=0){id=c[0];break}}S.force=id;S.rest=0;S.plan=null;return id}
{const f=svAfterMove;svAfterMove=function(e,M){const S=e&&e.sv;
  if(S&&M&&M.id!=='intro'&&M.id!=='stagger'&&M.id!=='awaken'){const L=d2(pl.position,e.m.position);S.cl141=L<SV141.close?(S.cl141||0)+1:0}
  f.apply(this,arguments);
  try{if(!S||e.dead||S.mv||!svAuth(e)||(S.B.ai||{}).style==='root')return;const now=performance.now();
    if((S.cl141||0)>=2&&now>=(S.dc141||0)&&!S.rt){S.cl141=0;S.dc141=now+SV141.disCd;S.plan=null;S.force=null;S.rt={t:.7+Math.random()*.35};S.dis141=1;SVX.st.rt=(SVX.st.rt||0)+1;
      try{burst(gY(e.m.position,.3),0x8a7a66,12,2,1.2,.45)}catch(_){}}}catch(_){}}}
// ---- 3. faster walk while the hero keeps away ----
{const f=svMoveFree;svMoveFree=function(e,dt,now){const S=e&&e.sv,ai=S&&S.B.ai;if(!S||!ai||!(S.far141>SV141.farT))return f.apply(this,arguments);
  const w0=ai.walk,r0=ai.run;ai.walk=(w0||2.2)*SV141.chase;if(r0)ai.run=r0*SV141.chase*.9;try{return f.apply(this,arguments)}finally{ai.walk=w0;ai.run=r0}}}
// ---- 3b. Reach: three eruptions aimed ahead of a running hero ----
function sv141Aim(c,n){const S=c.S,p=pl.position,v=S.hv141||{x:0,z:0},ld=SV141.lead*(n||1);return c.inA(new THREE.Vector3(p.x+v.x*ld,0,p.z+v.z*ld),.6)}
function sv141Reach(B){const P=B.P||{},pick=['roar','howl','rear','tpRaise','vUp','gUp','fUp','oUp','rUp'].find(k=>P[k]);const col=B.col||0xff5a2a;
  const fx=(c,an,hit)=>{const q=new THREE.Vector3(an.x,0,an.z);try{svShock(q,col,3,.45);svDecal(q,0x140c08,2.2,2.6,.55);burst(gY(q,.4),col,24,4,2.6,.6);burst(gY(q,.3),0x3a2a20,18,3,2,.7);shake(.12);svSnd('crack',.7,.8)}catch(_){}};
  const hit=(t,n)=>({t,s:{k:'c',r:2.4},o:c=>{const p=sv141Aim(c,n);return {x:p.x,z:p.z,a:0}},w:.62,dm:.72,fx});
  return {wt:(e,L)=>{const S=e.sv;return L>=SV141.far?((S.far141||0)>=SV141.farT?16:3):0},cd:7.5,r:[SV141.far,60],a:'any',dur:1.95,lock:.4,trn:[[0,1.7,3]],armor:1,
    trk:pick?[[.35,pick,'io'],[1.45,pick,'l',.02],[1.95,'','io']]:[[1.95,'','io']],
    hit:[hit(.85,1),hit(1.2,1.2),hit(1.55,1.4)],ev:[[.08,c=>{try{svSnd('roar',.7,1.15);svShock(c.m.position,col,4,.4)}catch(_){}}]],rec:.35}}
SVB.forEach((B,i)=>{if(!B||!B.M||B.M.reach141)return;try{B.M.reach141=sv141Reach(B);svRegMoves(i)}catch(e){console.warn('reach141',i,e)}});
// ---- 4. one fight each ----
{const f=spawnBoss;spawnBoss=function(i){if(typeof bossDone!='undefined'&&bossDone.has(i))return null;return f.apply(this,arguments)}}
function sv141Clear(){try{enemies.slice().forEach(e=>{if(e&&e.boss&&!e.dead&&e.bi!=null&&bossDone.has(e.bi)&&!(typeof AF!='undefined'&&AF&&AF.i===e.bi&&AF.f))removeE(e)});
  if(typeof bossT!='undefined')bossT.forEach((t,i)=>{if(bossDone.has(i))bossT[i]=0})}catch(_){}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);setTimeout(sv141Clear,0);return r}}
setInterval(sv141Clear,5000);
// a hero who has kept away for SV141.sure s gets Reach as soon as it is off cooldown (not left to the weighted pick)
SV141.sure=4;
{const f=svPick;svPick=function(e,loose){const S=e&&e.sv;try{if(S&&!S.force&&(S.far141||0)>=SV141.sure&&S.B.M.reach141&&!((S.cd.reach141||0)>0)&&S.last[0]!=='reach141'&&d2(pl.position,e.m.position)>=SV141.far)return 'reach141'}catch(_){}return f.apply(this,arguments)}}
