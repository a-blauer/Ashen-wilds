# v94 helper: run a JS expression (file given as argument) after starting a hero, print the result.
#   python3 v94_probe.py some.js        (SHOT=name also saves a screenshot <AW_TMP>/v94_probe_<name>.png)
import sys,json,os,play
JS=open(sys.argv[1]).read()
def s(pg):
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    print('RESULT',json.dumps(pg.evaluate(JS))[:4000])
    if os.environ.get('SHOT'):pg.screenshot(path=play.TMP+'/v94_probe_'+os.environ['SHOT']+'.png',timeout=120000)
play.run(s)
