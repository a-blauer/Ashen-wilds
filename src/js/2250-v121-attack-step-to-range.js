// ================= v121: melee attacks step only into hitting range =================
// Before: every melee basic attack pushed the hero forward a fixed amount — a small step (pl.step, ~0.35 tiles) plus the
// v101 swing lunge (0.28, 0.5 on combo finishers) — however close the enemy already was. Hitting an enemy you were
// standing next to walked you into its body, and a few swings in a row carried you through and past it.
// Now: before each melee swing we find the enemy being swung at (the locked target if it is ahead, else the nearest
// enemy in front) and the distance at which the swing already reaches it ("stand", a little inside the hit radius and
// never closer than the two bodies touching). The step and the lunge together only close the gap to that distance:
//  · out of range → the hero steps in (no more than the old step + lunge), stopping once in range;
//  · in range     → the hero doesn't move;
//  · the lunge re-measures the gap every frame, so an enemy that walks in during the wind-up stops it early.
// Swinging at nothing (no enemy ahead) keeps the old step + lunge. Abilities (kqsLunge) already stop short and are untouched.
var SWLIM=null;                     // {e,stand} for the swing being started; read by swingAnim's lunge (1710)
var SWV121={on:true,FRONT:1.05,LOOK:2.6,STAND:.8,BODY:.95};
// how far the hero may still move forward (along its facing) before reaching `stand` from the target
function swRoom(lim){
  const e=lim&&lim.e;if(!e||e.dead||!e.m)return 1e9;
  const dx=e.m.position.x-pl.position.x,dz=e.m.position.z-pl.position.z;
  if(Math.hypot(dx,dz)<=lim.stand)return 0;
  const ry=pl.rotation.y,along=dx*Math.sin(ry)+dz*Math.cos(ry);
  return along-lim.stand}
// the enemy this swing is aimed at, and the distance to stop at
function swPlan(rg,d){
  if(!SWV121.on||!(rg>0)||!d||typeof enemies=='undefined')return null;
  let best=null,bd=1e9;
  const ok=e=>{
    if(!e||e.dead||!e.m||!e.c)return 0;
    const dx=e.m.position.x-pl.position.x,dz=e.m.position.z-pl.position.z,L=Math.hypot(dx,dz),bonus=(e.c.al?.5:0)+(e.boss?1.2:0);
    if(L>rg+bonus+SWV121.LOOK)return 0;
    if(L>.4&&Math.acos(Math.max(-1,Math.min(1,(dx*d.x+dz*d.z)/L)))>SWV121.FRONT)return 0;
    return L};
  if(typeof tgt!='undefined'&&tgt&&ok(tgt))best=tgt;
  else for(const e of enemies){const L=ok(e);if(L&&L<bd){bd=L;best=e}}
  if(!best)return null;
  const reach=rg+(best.c.al?.5:0)+(best.boss?1.2:0),body=SWV121.BODY+(best.boss?1.2:0)+(best.c.al?.25:0);
  const stand=Math.min(reach-.1,Math.max(body,reach*SWV121.STAND));
  return {e:best,stand}}
// run a melee attack with the plan in place, then trim the small step to the gap (the lunge trims itself)
function swRun(f,self,args,rg,d){
  let lim=null;try{lim=swPlan(rg,d)}catch(_){}
  const s0=pl.step;SWLIM=lim;
  try{return f.apply(self,args)}
  finally{SWLIM=null;
    try{if(lim&&pl.step&&pl.step!==s0&&pl.step.sp>0){
      const room=Math.max(0,swRoom(lim)),go=Math.min(pl.step.t*pl.step.sp,room);
      if(go<.01)pl.step=null;else pl.step.t=go/pl.step.sp}}catch(_){}}}
// class basic attack (no weapon type behaviour): reach = class range (greatsword/greataxe a touch longer)
{const f=swing_base;swing_base=function(){
  let rg=0,d=null;
  try{const C=CLS[hero.cls];if(C&&C.atk!='bow'&&C.atk!='staff'&&!(atkCd>0)&&party.length&&!hero.chan){
    const w=eq.weapon&&canUse(eq.weapon)?eq.weapon:null,wt=w?itT(w).wt:null;rg=C.rng*(wt=='gs'||wt=='ga'?1.08:1);d=aimDir()}}catch(_){}
  if(!d)return f.apply(this,arguments);
  return swRun(f,this,arguments,rg,d)}}
// weapon-type melee (swords, axes, halberd, claws…): reach = class range × weapon reach
{const f=wMelee;wMelee=function(Q,C,s,raw,d){
  let rg=0;try{rg=C.rng*Q.rg}catch(_){}
  return swRun(f,this,arguments,rg,d)}}
