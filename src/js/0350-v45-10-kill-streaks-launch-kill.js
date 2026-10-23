// =============== 10. launch on kill + explosive elites ===============
function kill(e){
  if(e.ar!=null)bossDefeated(e);if(typeof campOnKill=='function')campOnKill(e);if(typeof onKillX=='function')onKillX(e);
  // kill-streak XP/loot multiplier removed
  if(!e.boss){const a=V().subVectors(e.m.position,pl.position).setY(0).normalize(),m=e.m,y0=m.position.y,big=e.c.h<-M(e.c)*.15;
    // v134: a short shove back along the ground (it used to fly up in an arc, tipping over backwards)
    const x0=m.position.x,z0=m.position.z,dd=big?.9:.5;tw(420,k=>{const q=1-Math.pow(1-k,3);m.position.x=x0+a.x*dd*q;m.position.z=z0+a.z*dd*q;m.position.y=y0})}
  if(e.trait=='Explosive'){const P=e.m.position.clone();popT(P,'💥 It’s going to blow!','#fbbf24');tele(P,3.2,1.25,()=>{burst(gY(P,.6),0xff8a3a,70,4.5,3,.8);ring(P,0xffb020,3.4,380);shake(.35);sfx('boom');if(d2(pl.position,P)<3.3)hitHero(e,2.2,'p');party.slice(0,2).forEach((c,i)=>{const f=fols[i];if(c&&c.h>0&&f&&d2(f.position,P)<3.3){c.h=Math.max(0,c.h-M(c)*.25)}})})}
  return kill_base(e);
}
function strkUI(){const d=$('strk');if(d)d.classList.add('hide');if(typeof hero!='undefined'&&hero&&hero.buffs&&hero.buffs.some(b=>b.n=='Kill streak'))hero.buffs=hero.buffs.filter(b=>b.n!='Kill streak')}
