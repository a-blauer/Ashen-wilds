import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=mobile]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{hatch(Object.assign(rollEgg(1),{basic:true}));hud()}")
    pg.wait_for_timeout(2500)
    pg.locator('#stage').screenshot(path=play.TMP+'/v79_mob.png',timeout=120000,animations='disabled')
play.run(s,w=900,hh=430)
