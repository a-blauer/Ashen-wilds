# v85 attack animation smoke test in the live game loop (real timers):
# assassin dagger combo standing and while running, every skill of the class, companions biting, enemies attacking,
# Sovereign moves, and the co-op swing signal (MP.sw) + remote-player swing.
#   SRC=<build.html> AW_TMP=<outdir> python3 v85_atk_game.py      -> prints results + page errors, writes v85atkgame_*.png
import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="assassin"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16);ren.render=()=>{};POST.render=()=>{};hero.lvl=25;hero.mp=999;hatch(Object.assign(rollEgg(1),{basic:true}));hatch(Object.assign(rollEgg(1),{basic:true}))}")
    pg.wait_for_timeout(1000)
    # go to the first zone and fight
    ev("()=>{const p=PMAP[0].path[40];toPos(p[0],p[1])}");pg.wait_for_timeout(2500)
    spawn="()=>{const e=enemies.filter(e=>!e.dead).sort((a,b)=>d2(a.m.position,pl.position)-d2(b.m.position,pl.position))[0];if(e){e.m.position.set(pl.position.x+1.2,0,pl.position.z);e.agg=1;e.c.h=M(e.c)}return e?[e.c.n,Math.round(e.c.h)]:null}"
    print('foe',ev(spawn))
    print('combo',ev("""()=>new Promise(res=>{const e=enemies.filter(e=>!e.dead).sort((a,b)=>d2(a.m.position,pl.position)-d2(b.m.position,pl.position))[0];const h0=e?e.c.h:0,sw0=MP.sw;let n=0,acts=[];
      const it=setInterval(()=>{atkHeld=true;if(HA.cur&&!acts.includes(HA.cur))acts.push(HA.cur);if(++n>60){clearInterval(it);atkHeld=false;res({hits:e?Math.round(h0-e.c.h):null,actions:acts.length,mpSig:MP.sw-sw0,combo})}},50)})"""))
    pg.screenshot(path=play.TMP+'/v85atkgame_combo.png')
    print('moving combo',ev("""()=>new Promise(res=>{K.d=true;let n=0,mx=0;const it=setInterval(()=>{atkHeld=true;mx=Math.max(mx,pl._ga?pl._ga.w:0);if(++n>40){clearInterval(it);atkHeld=false;K.d=false;res({moveW:+mx.toFixed(2),legFull:!!(HA.cur&&HA.cur.legFull)})}},50)})"""))
    print('skills',ev("""()=>new Promise(res=>{const out=[];let i=0;const go=()=>{if(i>=4){res(out);return}hero.mp=999;hero.cd['s'+i]=0;atkCd=0;HA.cur=null;cast(i);out.push([(heroSkills()[i]||{}).k,HA.cur?Math.round(HA.cur.ms):null]);i++;setTimeout(go,700)};go()})"""))
    print('companions/enemies',ev("""()=>new Promise(res=>{let bites=0,eatk=0,n=0;const it=setInterval(()=>{fols.forEach(f=>{if(f&&f._lk!=null)bites++});enemies.forEach(e=>{if(e.m.ak)eatk++});if(++n>80){clearInterval(it);res({compBiteFrames:bites,enemyAtkFrames:eatk})}},50)})"""))
    print('remote swing',ev("""()=>new Promise(res=>{const g=cr(mk('bandit',5,0,''));scene.add(g);g.position.copy(pl.position);mpSwingRH(g.h);const a=g.h.bones.aR0.rotation.x;setTimeout(()=>{const r={sw:g.h.sw,moved:Math.abs(g.h.bones.aR0.rotation.x-a)>.01};scene.remove(g);res(r)},150)})"""))
    print('boss',ev("""()=>new Promise(res=>{try{const i=0;spawnBoss(i);const e=enemies.find(e=>e.boss&&e.bi==i);e.m.position.set(BOSSES[i].x,0,BOSSES[i].y);toPos(BOSSES[i].x+3,BOSSES[i].y);let n=0,moves=new Set();const it=setInterval(()=>{if(e.m._mv)moves.add(e.m._mv.k);if(++n>120){clearInterval(it);res({moves:[...moves],hp:Math.round(e.c.h)})}},50)}catch(err){res(String(err))}})"""))
    pg.screenshot(path=play.TMP+'/v85atkgame_boss.png')
play.run(s,w=1000,hh=620)
