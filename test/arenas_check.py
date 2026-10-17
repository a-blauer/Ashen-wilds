# Sanity check for the low-poly arena module: arenas rebuilt, trial grounds built, bobber swapped, no errors.
import play
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    print('check',ev("""()=>{const p=pl.position;fishStart([p.x+2,p.z+2]);const r={arenas:ARN.map(A=>!!A.lpRune&&A.fx0.length),trial:ARK_TRIAL.length,
      tris:ARK_TRIAL.reduce((a,m)=>a+m.geometry.attributes.position.count/3,0)+ARN.reduce((a,A)=>a+A.g.children.reduce((b,m)=>b+(m.geometry?m.geometry.attributes.position.count/3:0),0),0),
      bob:!!(fishing&&fishing.bob.geometry===ARK.bob)};fishEnd();return r}"""))
play.run(s)
