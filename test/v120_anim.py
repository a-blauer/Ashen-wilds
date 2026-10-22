# v120: idle enemies never pitch their whole body (v120_idle_tilt.js) and beast tails stop smoothly after a run, drag behind turns
# (v120_tail.js). Prints FAIL lines for ci_run.py.
import os,play
HERE=os.path.dirname(os.path.abspath(__file__))
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    def ok(c,msg,v):print(('PASS ' if c else 'FAIL ')+msg,v,flush=True)
    r=pg.evaluate(open(os.path.join(HERE,'v120_idle_tilt.js')).read())
    for k in ('hum','cr'):
        v=r.get(k);ok(isinstance(v,dict) and v['maxPitch']<.02 and v['minPitch']>-.02,'idle enemy keeps its body level ('+k+')',v)
    r=pg.evaluate(open(os.path.join(HERE,'v120_tail.js')).read())
    for k,v in r.items():
        if not isinstance(v,dict):continue
        ok(v['stopMaxStep']['now']<.05,'race %s tail changes smoothly when stopping'%k,v['stopMaxStep'])
        ok(v['turnLag']>.01,'race %s tail drags behind a turn'%k,v['turnLag'])
play.run(s)
