import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{toPos(CYD.x,CYD.y+9);camYaw=0;camPitch=.6;camDist=20;snapCam()}")
    pg.wait_for_timeout(5000)
    pg.locator('#stage').screenshot(path=play.TMP+'/cy1.png',timeout=120000,animations='disabled')
    ev("()=>{openWMap()}");pg.wait_for_timeout(800)
    pg.locator('#stage').screenshot(path=play.TMP+'/cy2.png',timeout=120000,animations='disabled')
    print(ev("()=>{$('wmap').classList.add('hide');let t=0,r=0;for(let y=CYD.y-12;y<=CYD.y+12;y++)for(let x=CYD.x-12;x<=CYD.x+12;x++){if(MAP[y][x]=='#')t++;if(MAP[y][x]=='r')r++}return [t,r,typeof camYaw]}"))
play.run(s,w=1100,hh=700)
