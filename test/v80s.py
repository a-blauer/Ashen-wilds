# v80: screenshots of the hero mid-attack (strike, spin, dodge) to eyeball poses.
import play,json
O=play.TMP
def game(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{const p=PMAP[0];toPos(p.path[40][0],p.path[40][1]);snapCam();enemies.forEach(e=>{e.agg=0;e.ai=0})}")
    pg.wait_for_timeout(1500)
    # freeze the action at chosen points by driving HA directly, then let one frame render
    for nm,js in [('wind',"swingAnim(0,300);HA.cur.k=.29"),('strike',"swingAnim(1,300);HA.cur.k=.47"),('spin',"spinAnim(400);HA.cur.k=.5"),('dodge',"haDodge();HA.cur.k=.35"),('bow',"bowAnim(600);HA.cur.k=.5")]:
        ev("()=>{"+js+";HA.cur.ms=1e9}")
        pg.wait_for_timeout(2500)
        print(nm,ev("()=>[HA.cur&&+HA.cur.k.toFixed(2),pl.bones.aR0.rotation.x.toFixed(2),pl.bones.spine.rotation.y.toFixed(2)]"))
        pg.locator('#stage').screenshot(path=O+'/v80_'+nm+'.png',timeout=120000)
    ev("()=>haCancel(false)")
play.run(game,w=900,hh=560)
