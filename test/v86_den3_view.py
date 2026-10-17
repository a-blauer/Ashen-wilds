# Sunken Pit views without a fight (real loop): overview + ground level
import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{enterMap(3)}");pg.wait_for_timeout(3500)
    for n,(r,da,pit,dist) in {'over':(15.5,0,.95,30),'ground':(14.8,.0,.32,9),'ribs':(14.8,3.14,.4,10)}.items():
        ev("([r,da,pit,dist])=>{const A=ARN[3],a=A.dn.ea+da;pl.position.set(A.cx+Math.cos(a)*r,0,A.cz+Math.sin(a)*r);camYaw=Math.atan2(Math.cos(a),Math.sin(a));camPitch=pit;camDist=dist;snapCam()}",[r,da,pit,dist])
        pg.wait_for_timeout(6000);pg.screenshot(path=play.TMP+'/v86d3_view_'+n+'.png',timeout=180000)
play.run(s,w=1000,hh=620)
