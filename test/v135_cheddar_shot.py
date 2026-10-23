# v135: screenshots of Cheddar as you arrive in Kindlelight I (game camera), walking up to the end gateway, and the local map (N)
#   -> out/v135_ch_arrive.png, out/v135_ch_gate.png, out/v135_ch_map.png
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{window.__I=PMAP[0].ins[0];insArrive(__I)}");pg.wait_for_timeout(4500)
    ev("()=>{const t=document.querySelectorAll('.zt116,#zt116');t.forEach(e=>e.style.display='none')}")
    pg.locator('#stage').screenshot(path=play.TMP+'/v135_ch_arrive.png')
    ev("""()=>{const I=__I,t=chqSpotEnd135(I),P=I.path,q=P[Math.max(0,P.length-24)];toPos(q[0],q[1],Math.atan2(q[0]-t.x,q[1]-t.z))}""");pg.wait_for_timeout(3500)
    pg.locator('#stage').screenshot(path=play.TMP+'/v135_ch_gate.png')
    ev("()=>openWMap()");pg.wait_for_timeout(600)
    pg.locator('#stage').screenshot(path=play.TMP+'/v135_ch_map.png')
    r=ev("()=>({vis:[CHQ132.ch.root.visible,CHQ132.e.ch.root.visible],mk:[CHQ132.mkK,CHQ132.e.mkK]})");print(r)
    if not all(r['vis']):print('FAIL Cheddar hidden',r)
play.run(s,w=1100,hh=680)
