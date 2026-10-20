# run a JS expression (file argument) after starting a hero; prints the full JSON result (no truncation). SHOT=name saves a screenshot.
import sys,json,os,play
JS=open(sys.argv[1]).read()
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print('RESULT',json.dumps(r))
    if os.environ.get('OUTF'):open(os.environ['OUTF'],'w').write(json.dumps(r))
    if os.environ.get('SHOT'):pg.screenshot(path=play.TMP+'/probe_'+os.environ['SHOT']+'.png',timeout=600000)
play.run(s)
