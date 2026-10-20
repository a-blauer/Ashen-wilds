// =============== 1. PERFECT DODGE ===============
function dodge(){if(riding)return;const dc=hero.dc||0;const r=dodge_base();if((hero.dc||0)<dc){hero.dshT=nowP();hero.pdOk=0}return r}
function perfectCheck(){
  const t=nowP();if(!hero.dshT||t-hero.dshT>340||hero.pdOk===hero.dshT)return false;hero.pdOk=hero.dshT;
  slowT=.85;hero.pcrit=t+3500;hero.dc=Math.min(Math.floor(HS().dash),(hero.dc||0)+1);
  popT(pl.position,'PERFECT DODGE','#7dd3fc',true);flash('rgba(125,211,252,.35)');burst(gY(pl.position,1),0x9ad8ff,40,3,2.5,.7);ring(pl.position,0x9ad8ff,3.5,420);sfx('perfect');
  return true;
}
function hitHero(e,mult,mt){
  if(hero.iv>0&&townAt(pl.position.x,pl.position.z,.5)<0)perfectCheck();
  const hp0=hero.hp,r=hitHero_base(e,mult,mt),dd=hp0-hero.hp;
  if(dd>0){
    if(e&&e.trait=='Vampiric'&&!e.dead){e.c.h=Math.min(M(e.c),e.c.h+dd*.4);burst(gY(e.m.position,1),0xd02040,8,1,1,.4)}
    const R=CRES[hero.cls];if(R&&R.hurt)resGain(R.hurt);
  }
  return r;
}
