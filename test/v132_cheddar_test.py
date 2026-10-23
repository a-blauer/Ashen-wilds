# v132 Cheddar's quests, suite form: runs v132_cheddar.js in a started game and prints a FAIL line per problem (ci_run reads those).
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v132_cheddar.js')).read()
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print('RESULT',json.dumps(r))
    for b in r['fail']:print('FAIL',b)
    if r['ok']:print('OK v132 cheddar',json.dumps(r['reward']))
    pg.screenshot(path=play.TMP+'/v132_cheddar.png',timeout=600000)
play.run(s)
