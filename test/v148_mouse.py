# v148: mouse buttons and aimed abilities.
#   1. the middle button turns the camera only (no attack); the left button still attacks
#   2. with mouse-look on (right click), starting a ground-aimed ability turns it off (cursor back) until the spot is clicked,
#      then turns it back on; a right-click cancel also brings it back; Esc cancels and leaves it off; without mouse-look
#      nothing changes (it stays off after the cast)
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
def s(pg):
    pg.set_default_timeout(600000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    ev("""()=>{window.__sw=0;const f=swing;swing=function(){window.__sw++;return f.apply(this,arguments)};
      // a ground-aimed ability in slot 0 with no cost (the cast itself may do nothing here)
      const L=heroSkills(),sk=Object.assign({},L[0]||{},{n:'Test Aim',i:'🎯',gt:1,lv:1,mp:0,r:2,R:8,sh:'circle'});window.__sk=sk;
      window.__tgo=(on)=>{kqsTgStart(0,sk)};hero.mp=999}""")
    box=pg.locator('#gl').bounding_box();cx=box['x']+box['width']*.5;cy=box['y']+box['height']*.55
    st=lambda:ev("()=>({orb:!!orb,tg:!!(orb&&orb.tg),aim:!!KQS.tg,sw:window.__sw,held:atkHeld})")
    fails=[]
    # 1. middle button
    pg.mouse.move(cx,cy);pg.mouse.down(button='middle');pg.wait_for_timeout(150);a=st();pg.mouse.up(button='middle');pg.wait_for_timeout(150)
    print('middle',a)
    if a['sw']!=0 or a['held']:fails.append('middle button attacked: '+json.dumps(a))
    if not a['orb']:fails.append('middle button did not turn the camera')
    pg.mouse.down(button='left');pg.wait_for_timeout(100);b=st();pg.mouse.up(button='left');pg.wait_for_timeout(200)
    print('left',b)
    if b['sw']<1:fails.append('left button no longer attacks')
    # 2. mouse-look on, then an aimed ability
    def ml_on():
        pg.mouse.click(cx,cy,button='right');pg.wait_for_timeout(200)
        if not st()['tg']:pg.mouse.click(cx,cy,button='right');pg.wait_for_timeout(200)
        return st()['tg']
    if not ml_on():fails.append('right click did not turn mouse-look on')
    ev("()=>__tgo()");pg.wait_for_timeout(150);c=st();print('aiming',c)
    if not c['aim']:fails.append('aim did not start')
    if c['tg']:fails.append('mouse-look stayed on while aiming')
    pg.mouse.click(cx+40,cy+20,button='left');pg.wait_for_timeout(250);d=st();print('cast',d)
    if d['aim']:fails.append('the click did not cast')
    if not d['tg']:fails.append('mouse-look did not come back after the cast')
    # right-click cancel
    ev("()=>__tgo()");pg.wait_for_timeout(150);pg.mouse.click(cx,cy,button='right');pg.wait_for_timeout(250);e=st();print('rc cancel',e)
    if e['aim']:fails.append('right click did not cancel')
    if not e['tg']:fails.append('mouse-look did not come back after a right-click cancel')
    # Esc cancel: stays off
    ev("()=>__tgo()");pg.wait_for_timeout(150);pg.keyboard.press('Escape');pg.wait_for_timeout(250);g=st();print('esc',g)
    if g['aim']:fails.append('Esc did not cancel')
    if g['tg']:fails.append('mouse-look came back after Esc')
    # no mouse-look: stays off after the cast
    ev("()=>{if(orb)orbEnd();__tgo()}");pg.wait_for_timeout(150);pg.mouse.click(cx+30,cy,button='left');pg.wait_for_timeout(250);h=st();print('plain',h)
    if h['tg'] or h['aim']:fails.append('mouse-look turned on without having been on: '+json.dumps(h))
    for f in fails:print('FAIL',f)
    if not fails:print('mouse: all good')
play.run(s)
