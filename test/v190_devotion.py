# v190 Devotion: levels, the tiered stat bonus, earning from kills and feeding, the extra modifier slot, the Devoted glow
# (own model and what a co-op partner builds from the look), the fusion warning, the Companions window row, saving.
#   python3 v190_devotion.py      (SRC=<build> as in every play.py test; the checks live in v190_devotion.js)
import sys,json,os,play
JS=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v190_devotion.js')).read()
FAIL=[]
def s(pg):
    pg.set_default_timeout(1200000)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS)
    for k,v in r.items():
        if k=='FAILS':continue
        print(('ok   ' if v is True else 'FAIL ')+k,'' if v is True else v);
        if v is not True:FAIL.append(k)
    if errs:print('FAIL page errors',errs[:3]);FAIL.append('pageerror')
    print('CHECKS OK' if not FAIL else 'FAILED: '+', '.join(FAIL))
play.run(s)
sys.exit(1 if FAIL else 0)
