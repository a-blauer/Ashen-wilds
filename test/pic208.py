import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
SH=json.loads(os.environ.get('SHOTS','[]'))
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    if os.environ.get('PRE'):print('pre',ev(os.environ['PRE']))
    for n,js in SH:
        print(n,ev(js));pg.wait_for_timeout(1200);pg.screenshot(path=play.TMP+'/pic208_'+n+'.png')
play.run(s,w=1000,hh=620)
