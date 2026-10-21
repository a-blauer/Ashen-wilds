# v112 Rat race: creator → play → save → reload → continue; barber back to human; other classes have no Race.
#   TITLE=1 python3 v112_race.py      (the appearance step only exists with the title screen on)
import os,json
os.environ.setdefault('TITLE','1')
import play
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info)
    if not ok:FAIL.append(n)
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.wait_for_timeout(2500);pg.keyboard.press('Enter');pg.wait_for_timeout(1500)
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(800)
    # a new hero: the title may offer New / Continue
    for sel in ['#svpN','text=New Hero','text=New game']:
        try:
            if pg.locator(sel).count():pg.click(sel,timeout=3000);break
        except Exception:pass
    pg.wait_for_timeout(800)
    # mage: no Race option
    pg.click('[data-c="mage"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(1200)
    chk('mage has no Race option',ev("()=>!document.querySelector('[data-lk=race]')"))
    pg.click('#ccBack');pg.wait_for_timeout(600)
    # warrior → Appearance → Race: Rat
    pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(1200)
    chk('warrior has a Race option',ev("()=>!!document.querySelector('[data-lk=race][data-v=\"1\"]')"))
    pg.click('[data-lk=race][data-v="1"]');pg.wait_for_timeout(2500)
    chk('rat panels: Fur and Eye colour, no hair',ev("()=>{const t=document.querySelector('#start').innerText;return /fur/i.test(t)&&/eye colou?r/i.test(t)&&!/hair style/i.test(t)}"))
    pg.click('[data-lk=skin][data-v="#e6e0d6"]');pg.wait_for_timeout(2500)
    pg.screenshot(path=play.TMP+'/v112_creator.png')
    pg.click('#ccNext');pg.wait_for_timeout(800);pg.click('#ccNext');pg.wait_for_timeout(4000)
    st=ev("()=>({look:hero.look,race:pl._race,tail:!!pl.bones.tl0,bones:huBody(pl).skeleton.bones.length,cls:hero.cls})")
    chk('started as a rat',st['look'].get('race')==1 and st['race']==1 and st['tail'] and st['bones']==31,st)
    chk('fur kept',st['look'].get('skin')=='#e6e0d6',st['look'])
    ev("()=>{camDist=6;camPitch=.3;snapCam&&snapCam()}");pg.wait_for_timeout(2500)
    pg.screenshot(path=play.TMP+'/v112_ingame.png')
    # walk a little (the crouch/tail run every frame without errors)
    pg.keyboard.down('w');pg.wait_for_timeout(2500);pg.keyboard.up('w')
    chk('saved with race',ev("()=>{saveGame(true);const k=Object.keys(localStorage).find(k=>/save|kq|aw/i.test(k))||Object.keys(localStorage)[0];return JSON.stringify(localStorage.getItem(k)||'').indexOf('race')>=0}"))
    pg.reload(wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(5000)
    pg.keyboard.press('Enter');pg.wait_for_timeout(1500)
    try:pg.click('[data-dev=desktop]',timeout=20000)
    except Exception as e:print('nodev',str(e)[:80])
    pg.wait_for_timeout(500)
    try:pg.click('#svpC',timeout=60000)
    except Exception as e:print('noclick',str(e)[:100])
    pg.wait_for_timeout(5000)
    st=ev("()=>({look:hero.look,race:pl._race,tail:!!(pl.bones&&pl.bones.tl0),bones:huBody(pl).skeleton.bones.length})")
    chk('reloaded as a rat',st['race']==1 and st['tail'] and st['bones']==31,st)
    # barber: back to human
    ev("()=>{openBarber()}");pg.wait_for_timeout(1500)
    chk('barber offers Race',ev("()=>!!document.querySelector('#lkw [data-lk=race]')"))
    pg.click('#lkw [data-lk=race][data-v="0"]');pg.wait_for_timeout(1500);pg.click('#lkApply');pg.wait_for_timeout(2500)
    st=ev("()=>({look:hero.look,race:pl._race,tail:!!pl.bones.tl0,bones:huBody(pl).skeleton.bones.length,y0:pl.bones.pelvis.userData.y0})")
    chk('barber back to human',st['race']==0 and not st['tail'] and st['bones']==20 and not st['look'].get('race'),st)
    pg.screenshot(path=play.TMP+'/v112_human_again.png')
    # and to rat again (the player model retargets both ways)
    ev("()=>{openBarber()}");pg.wait_for_timeout(1200);pg.click('#lkw [data-lk=race][data-v="1"]');pg.wait_for_timeout(1200);pg.click('#lkApply');pg.wait_for_timeout(2500)
    chk('barber to rat again',ev("()=>pl._race==1&&!!pl.bones.tl0&&huBody(pl).skeleton.bones.length==31"))
    # co-op look array carries the race
    chk('co-op look carries race',ev("()=>{const a=mpLookOut();return a[8]===1&&mpLookIn(a).race===1}"))
    chk('no page errors',len(errs)==0,errs[:3])
play.run(s,w=1000,hh=640)
print('FAILURES:',FAIL if FAIL else 'none')
