# Where are the Sovereigns? Prints each boss model's visibility, position and scale, then screenshots one up close.
#   BOSS=1 AW_TMP=/outdir python3 beasts_bossq.py
import play,os
BOSS=int(os.environ.get('BOSS','1'))
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("(i)=>{const p=PMAP[i];toPos(p.ba[0],p.ba[1]+12,0);camDist=16;camPitch=.35;snapCam()}",BOSS)
    pg.wait_for_timeout(4000)
    print(ev("()=>enemies.filter(e=>e.boss).map(e=>[e.c.n,e.m.visible,e.m.parent===scene,+e.m.position.x.toFixed(1),+e.m.position.y.toFixed(1),+e.m.position.z.toFixed(1),+e.m.scale.x.toFixed(2),e.bi])"))
    print(ev("(i)=>{const e=enemies.find(e=>e.boss&&e.bi==i);const p=e.m.position;pl.position.set(p.x+13,0,p.z+13);camYaw=Math.atan2(13,13);camDist=13;camPitch=.3;snapCam();return [pl.position.x,pl.position.z]}",BOSS))
    pg.wait_for_timeout(3000);pg.screenshot(path=play.TMP+'/bzq_boss%d.png'%BOSS,timeout=120000,animations='disabled')
play.run(s,w=1000,hh=620)
