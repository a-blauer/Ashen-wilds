# v151 intro, live mode: Begin your journey -> the intro plays on its own clock, the game waits, Skip jumps to the
# light, the game view clears, the welcome banner shows afterwards, everything is cleaned up.
#   python3 v151_intro_live.py
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info)
    if not ok:FAIL.append(n)
def s(pg):
    ev=pg.evaluate
    ev("()=>{window.KQ_INTRO=1}")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext')
    pg.wait_for_timeout(4000)
    st=ev("()=>({run:IC151.run,on:IC151.on,el:!!document.getElementById('ic151'),t:IC151.live&&(performance.now()-IC151.live.t0)/1000,ban:(IC151.q||[]).length})");print(st)
    chk('intro plays after Begin',st['run'] and st['on'] and st['el'])
    chk('welcome banner waits for it',st['ban']>=1,st['ban'])
    p0=ev("()=>[pl.position.x,pl.position.z]");pg.keyboard.down('w');pg.wait_for_timeout(1500);pg.keyboard.up('w');p1=ev("()=>[pl.position.x,pl.position.z]")
    chk('hero does not move during the intro',abs(p0[0]-p1[0])+abs(p0[1]-p1[1])<1e-6,(p0,p1))
    pg.screenshot(path=play.TMP+'/v151_live_play.jpg',type='jpeg')
    pg.click('#ic151 .skip');pg.wait_for_timeout(500)
    st=ev("()=>({t:(performance.now()-IC151.live.t0)/1000+IC151.live.off})");chk('skip jumps to the light',st['t']>=54.9,st)
    # the town part and the hand-back take a few seconds after the skip (more on a slow machine): wait for it, up to 30 s
    for _ in range(60):
        pg.wait_for_timeout(500)
        if not ev("()=>IC151.run"):break
    pg.wait_for_timeout(1200)
    st=ev("()=>({run:IC151.run,on:IC151.on,el:!!document.getElementById('ic151'),filt:ren.domElement.style.filter,ban:document.getElementById('banner')&&document.getElementById('banner').textContent})");print(st)
    chk('cleaned up and the game runs',not st['run'] and not st['on'] and not st['el'] and not st['filt'],st)
    chk('welcome banner shown after the intro','Welcome' in (st['ban'] or ''),st['ban'])
    pg.screenshot(path=play.TMP+'/v151_live_after.jpg',type='jpeg')
    p0=ev("()=>[pl.position.x,pl.position.z]");pg.keyboard.down('w');pg.wait_for_timeout(2500);pg.keyboard.up('w');p1=ev("()=>[pl.position.x,pl.position.z]")
    chk('hero moves again afterwards',abs(p0[0]-p1[0])+abs(p0[1]-p1[1])>.05,(p0,p1))
os.environ.setdefault('TITLE','')
play.run(s,w=1100,hh=650)
if FAIL:print('FAILED',FAIL)
