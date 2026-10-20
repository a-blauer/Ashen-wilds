# v106 screenshots: the gateway at the end of an instance, the portal window, the local map (N). Out: out/v106_*.png
import play
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{const I=PMAP[1].ins[0],g=RPORT.find(r=>r.k=='next'&&r.ig===I.g),P=I.path,q=P[P.length-24];toPos(q[0],q[1]);camYaw=Math.atan2(q[0]-g.x,q[1]-g.z);camPitch=.32;camDist=9;snapCam();INSR[1]=1}")
    pg.wait_for_timeout(9000);pg.screenshot(path=play.TMP+'/v106_gateway.png',timeout=600000)
    ev("()=>{const I=PMAP[1].ins[0],g=RPORT.find(r=>r.k=='next'&&r.ig===I.g);toPos(g.x,g.z+1.5)}");pg.wait_for_timeout(2500)
    pg.screenshot(path=play.TMP+'/v106_prompt.png',timeout=600000)
    ev("()=>{bossDone.add(0);openX('portal',0)}");pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/v106_portal.png',timeout=600000)
    ev("()=>{closeX();insArrive(PMAP[0].ins[1]);}");pg.wait_for_timeout(3000);ev("()=>openWMap()");pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/v106_map.png',timeout=600000)
play.run(s,w=1000,hh=620)
