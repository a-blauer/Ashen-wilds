import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="mage"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{hero.lvl=30;['helm','chest','boots','weapon'].forEach(sl=>{const it=genItem(30,{sl,cls:hero.cls,minR:4});it.req=1;eq[sl]=it});refreshGear();hsDirty();saveGame(true)}")
    pg.reload(wait_until='domcontentloaded',timeout=120000);pg.wait_for_timeout(3000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(500)
    pg.click('#svpC',timeout=60000);pg.wait_for_timeout(4000)
    print(ev("()=>{$('bagBtn').click();return [Object.keys(eq).filter(k=>eq[k]).join(','),HP.gearG.length,pl.gearG.length]}"))
    pg.wait_for_timeout(2000)
    pg.locator('#hv').screenshot(path=play.TMP+'/v85_bag_load.png')
    pg.locator('#stage').screenshot(path=play.TMP+'/v85_bag_load_world.png')
play.run(s,w=1280,hh=800)
