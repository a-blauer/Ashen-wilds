# Run one JS snippet (file given as argv[1]) in a started game standing beside a Kindlelight camp; prints its JSON result.
import play,json,os,sys
from playwright.sync_api import Page
_g=Page.goto
def _sg(self,url,**k):k['timeout']=600000;return _g(self,url,**k)
Page.goto=_sg
JS=open(sys.argv[1]).read()
def s(pg):
    pg.set_default_timeout(600000);ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(4000)
    ev("()=>{const C=CAMPS.find(c=>c.pm===0);pl.position.x=C.x+14;pl.position.z=C.z;pl.step=null;window.__hp=setInterval(()=>{hero.hp=heroMax()},50);return [C.x,C.z]}")
    pg.wait_for_timeout(8000)
    print(json.dumps(ev(JS),indent=1))
play.run(s)
