# Evaluate a JS expression in the running game (after starting a warrior).  JS="..." python3 nature_eval.py
import play,os,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2000)
    print(json.dumps(ev(os.environ['JS']))[:4000])
play.run(s,w=600,hh=400)
