import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    print(ev("()=>{hero.lvl=30;['helm','chest','boots','weapon'].forEach(sl=>{const it=genItem(30,{sl,cls:hero.cls,minR:4});it.req=1;eq[sl]=it});refreshGear();hsDirty();hud();$('bagBtn').click();return [Object.keys(eq).map(k=>k+':'+(eq[k]?itName(eq[k]):'-')),HP&&HP.gearG?HP.gearG.length:null,pl.gearG?pl.gearG.length:null]}"))
    pg.wait_for_timeout(2500)
    pg.screenshot(path=play.TMP+'/v85_bag.png',timeout=120000,animations='disabled')
play.run(s,w=1280,hh=800)
