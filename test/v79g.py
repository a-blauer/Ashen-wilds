import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(5000)
    print('party',ev("()=>party.map(c=>c.g.join())"))
    ev("()=>{camDist=5;camPitch=.35;snapCam&&snapCam()}");pg.wait_for_timeout(4000)
    pg.screenshot(path=play.TMP+'/fox_ingame.png',timeout=120000,animations='disabled')
play.run(s,w=1000,hh=620)
