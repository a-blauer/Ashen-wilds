import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=3},100);window._kg=kGloom;kGloom=function(){KG.mist.visible=false};const p=PMAP[0];toPos(p.path[60][0],p.path[60][1]);camPitch=.42;camDist=11;snapCam();TOD=.25}")
    pg.wait_for_timeout(7000);ev("()=>{TOD=.25}");pg.wait_for_timeout(1500)
    pg.locator('#stage').screenshot(path=play.TMP+'/kl_before.png',timeout=120000,animations='disabled')
    ev("()=>{kGloom=window._kg;TOD=.25}");pg.wait_for_timeout(9000);ev("()=>{TOD=.25}");pg.wait_for_timeout(1500)
    pg.locator('#stage').screenshot(path=play.TMP+'/kl_after.png',timeout=120000,animations='disabled')
    print(ev("()=>[KG.k,ATM.day,ZA.cur,scene.fog.density]"))
play.run(s,w=1000,hh=620)
