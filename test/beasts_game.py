# In-game check of the low-poly enemies, a Sovereign in its arena, and an egg hatching in the Companions & Eggs window.
#   AW_TMP=/outdir python3 beasts_game.py   → bzg_field.png, bzg_boss<N>.png, bzg_egg.png, bzg_hatch.png + page errors
import play,os
BOSS=int(os.environ.get('BOSS','1'))
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    print('field',ev("""()=>{try{const p=PMAP[0];const x=p.en[0]+8,z=p.en[1]+8;toPos(x,z,0);
      [['goo',-2,-5],['spitter',1.5,-6],['maggot',3.5,-4],['scorp',-4,-3]].forEach(q=>{const e=spawnEnemy(q[0],x+q[1],z+q[2],3);if(e){e.agg=0;e.wx=e.m.position.x;e.wz=e.m.position.z}});
      camDist=7;camPitch=.38;snapCam();return enemies.length}catch(e){return String(e)}}"""))
    pg.wait_for_timeout(5000);pg.screenshot(path=play.TMP+'/bzg_field.png',timeout=120000,animations='disabled')
    print('boss',ev("""(i)=>{try{const p=PMAP[i];toPos(p.ba[0],p.ba[1]+16,0);camDist=14;camPitch=.32;snapCam();
      if(!enemies.some(e=>e.boss&&e.bi==i))spawnBoss(i);return enemies.filter(e=>e.boss).map(e=>e.c.n)}catch(e){return String(e)}}""",BOSS))
    pg.wait_for_timeout(6000);pg.screenshot(path=play.TMP+'/bzg_boss%d.png'%BOSS,timeout=120000,animations='disabled')
    ev("(i)=>{const p=PMAP[i];toPos(p.ba[0],p.ba[1]+16,Math.PI);camDist=14;camPitch=.32;snapCam()}",BOSS)
    pg.wait_for_timeout(4000);pg.screenshot(path=play.TMP+'/bzg_boss%db.png'%BOSS,timeout=120000,animations='disabled')
    print('egg',ev("""()=>{try{const T=TOWNS[0];toPos(T.cx,T.cy+6,0);const e=rollEgg(3);e.t0=Date.now()-1e7;eggs.push(e);drop('egg',rollEgg(4),pl.position.clone().add(new THREE.Vector3(0,0,-1.5)),4);
      camDist=4;camPitch=.3;snapCam();return eggs.length}catch(e){return String(e)}}"""))
    pg.wait_for_timeout(3000);pg.screenshot(path=play.TMP+'/bzg_egg.png',timeout=120000,animations='disabled')
    ev("()=>{openCmp(true);hatchEgg(eggs[eggs.length-1].id)}");pg.wait_for_timeout(700)
    pg.screenshot(path=play.TMP+'/bzg_hatch.png',timeout=120000,animations='disabled')
    pg.wait_for_timeout(4000);pg.screenshot(path=play.TMP+'/bzg_hatched.png',timeout=120000,animations='disabled')
    print('errs',ev("()=>0"))
play.run(s,w=1000,hh=620)
