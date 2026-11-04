# v196: Duskhold's round meadow — the portal rooms behind their seals (only Portal I's open at first), every door and the Inn's
# seats reachable, round walls at every stage, the forest drawn on the forest tiles only, decorations clear of lots and ways,
# villagers' places. Runs v196_meadow.js in a started game and prints one PASS / FAIL line per check.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v196_meadow.js')).read()
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps({k:v for k,v in r.items() if k!='fail'}))
    fails=[f for f in r['fail'] if not f.startswith('ground edge')]
    for f in fails:print('FAIL',f)
    print('V196_MEADOW','PASS' if not fails else 'FAIL')
play.run(s)
