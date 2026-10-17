import play,json
def s(pg):
    ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    print(ev("()=>[ARN.length,ARN.map(A=>A.g.children.length),typeof DEN,typeof denBuildAll]"))
    ev("()=>{window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=3},100);enterMap(0)}");pg.wait_for_timeout(3000)
    ev("()=>{const A=ARN[0];toPos(A.cx,A.cz+16);camYaw=0;camPitch=.8;camDist=26;snapCam()}");pg.wait_for_timeout(5000)
    pg.locator('#stage').screenshot(path=play.TMP+'/v86_den0.png',timeout=180000)
    print('ERRS',errs[:3])
play.run(s,w=1000,hh=640)
