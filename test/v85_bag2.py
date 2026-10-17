import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    print(ev("()=>{hero.lvl=30;['helm','chest'].forEach(sl=>{const it=genItem(30,{sl,cls:hero.cls,minR:4});it.req=1;gear.push(it)});hsDirty();$('bagBtn').click();return gear.map(g=>g.id)}"))
    pg.wait_for_timeout(1500)
    pg.locator('#hv').screenshot(path=play.TMP+'/v85_bag_a.png')
    for i in range(2):
        pg.locator('button.rw.it[data-k="g"]').first.click();pg.wait_for_timeout(500)
        btns=pg.locator('#idt button').all_inner_texts();print(btns)
        b=pg.locator('#idt button',has_text='Equip')
        if b.count():b.first.click()
        pg.wait_for_timeout(1200)
    pg.locator('#hv').screenshot(path=play.TMP+'/v85_bag_b.png')
    print(ev("()=>[Object.keys(eq).filter(k=>eq[k]).join(','),HP.gearG.length,pl.gearG.length]"))
    print(ev("()=>String(rB).slice(0,400)"))
play.run(s,w=1280,hh=800)
