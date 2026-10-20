// =============== 10. KILL STREAKS + launch on kill + explosive elites ===============
let streak=0,streakT=0;
function kill(e){
  if(e.ar!=null)bossDefeated(e);if(typeof campOnKill=='function')campOnKill(e);if(typeof onKillX=='function')onKillX(e);
  const t=nowP();if(!e.minion||1){streak=t-streakT<5000?streak+1:1;streakT=t;
    if(streak>=2){const m=Math.min(1,.1*(streak-1));hero.buffs=hero.buffs.filter(b=>b.n!='Kill streak');hero.buffs.push({n:'Kill streak',i:'🔥',s:{xp:m,loot:m},t:t+5000});hsDirty()}
    strkUI(true)}
  if(!e.boss){const a=V().subVectors(e.m.position,pl.position).setY(0).normalize(),m=e.m,y0=m.position.y,big=e.c.h<-M(e.c)*.15||streak>=5;
    tw(460,k=>{m.position.x+=a.x*.09*(big?1.6:1);m.position.z+=a.z*.09*(big?1.6:1);m.position.y=y0+Math.sin(k*Math.PI)*(big?1.4:.8);m.rotation.x=-k*1.2})}
  if(e.trait=='Explosive'){const P=e.m.position.clone();popT(P,'💥 It’s going to blow!','#fbbf24');tele(P,3.2,1.25,()=>{burst(gY(P,.6),0xff8a3a,70,4.5,3,.8);ring(P,0xffb020,3.4,380);shake(.35);sfx('boom');if(d2(pl.position,P)<3.3)hitHero(e,2.2,'p');party.slice(0,2).forEach((c,i)=>{const f=fols[i];if(c&&c.h>0&&f&&d2(f.position,P)<3.3){c.h=Math.max(0,c.h-M(c)*.25)}})})}
  return kill_base(e);
}
function strkUI(bump){const d=$('strk');if(!d)return;const t=nowP(),left=5000-(t-streakT);if(streak<2||left<=0){d.classList.add('hide');if(left<=0)streak=0;return}
  d.classList.remove('hide');const m=1+Math.min(1,.1*(streak-1));d.innerHTML=`<b>🔥 ${streak}</b><span>STREAK</span><small>×${m.toFixed(1)} XP & loot</small><i style="width:${Math.max(0,left/50)}%"></i>`;if(bump){d.classList.remove('bump');void d.offsetWidth;d.classList.add('bump')}}
