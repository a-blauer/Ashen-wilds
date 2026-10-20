// ================= v43: sturdier companions =================
// 1) creatures grow faster per level (+80% health, +50% attack/defense)
Object.assign(CBS,{hp:110,pa:14,ma:14,pd:9,md:9});Object.assign(CGS,{hp:30,pa:4.4,ma:4.4,pd:2.8,md:2.8});
// 2) enemies prefer the player; a companion is only targeted when clearly closer, and at most two enemies gang up on one
function eTarget(e,m,dpl){
  const cnts=[0,0];enemies.forEach(o=>{if(o!==e&&!o.dead&&o.agg&&o.tgI!=null&&o.tgI<2)cnts[o.tgI]++});
  // stay on the current companion target while it's alive and nearby (no flip-flopping)
  if(e.tgI!=null){const f=fols[e.tgI],c=party[e.tgI];if(f&&c&&c.h>0&&!c.emp&&f.visible&&m.position.distanceTo(f.position)<6&&cnts[e.tgI]<2)return f;e.tgI=null}
  let tg=pl,bd=dpl-2.5;
  fols.forEach((f,i)=>{const c=party[i];if(i>1||!f||!c||c.h<=0||c.emp||!f.visible||cnts[i]>=2)return;const dd=m.position.distanceTo(f.position);if(dd<bd){bd=dd;tg=f;e.tgI=i}});
  if(tg===pl)e.tgI=null;return tg;
}
// 3) companions recover between fights: 0.6% of max health per second after 8s without taking damage
function compRegen(dt,now){
  if(dt<=0)return;party.forEach(c=>{if(!c||c.h<=0)return;const mx=M(c);
    if(c._ph!=null&&c.h<c._ph-.01)c._dt=now;
    if(now-(c._dt||0)>8000&&c.h<mx)c.h=Math.min(mx,c.h+mx*.006*dt);
    c._ph=c.h});
}

