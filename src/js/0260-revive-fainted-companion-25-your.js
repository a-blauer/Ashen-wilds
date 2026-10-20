// ================= Revive a fainted companion for 25% of your max HP =================
function reviveComp(i){
  const c=party[i];if(!c||c.h>0)return;const mx=heroMax(),cost=Math.round(mx*.25);
  if(hero.hp<=cost)return say('You need more than 25% health to revive '+nm(c)+'.');
  hero.hp-=cost;c.h=Math.max(1,Math.round(M(c)*.5));
  const f=fols[i];if(f){f.position.set(pl.position.x+R(-1,1),0,pl.position.z+R(-1,1));burst(gY(f.position,.8),0xff7aa8,26,2.2,2.5,.7);ring(f.position,0xff7aa8,2,600)}
  burst(gY(pl.position,1),0xff4a6a,14,1.4,1.5,.5);dn(pl.position,'-'+cost,'#ff7a8a',-10);say('💗 You poured your life into '+nm(c)+'. It’s back on its feet!');hsDirty();ui();hud();
}
$('act').addEventListener('pointerdown',e=>{const b=e.target.closest('button[data-rv]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();reviveComp(+b.dataset.rv)},true);

