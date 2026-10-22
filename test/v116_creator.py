# v116 character creator: class step preview per class (current beast model + outfit, heroic pose, class effects). out/v116_cc_<cls>.png
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
def s(pg):
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(1500)
    if os.environ.get('ROT'):pg.evaluate("()=>{CC116.rot=%s}"%os.environ['ROT'])
    for c in ['warrior','assassin','mage','paladin','ranger']:
        pg.click('[data-c="%s"]'%c,timeout=60000);pg.wait_for_timeout(int(os.environ.get('WAIT','2500')))
        r=pg.evaluate("()=>{const h=(window.CC116&&CC116.h)||window.ccHero;return h?{race:h._race,gear:(h.gearG||[]).map(o=>o.userData.wt||'').join(',')}:null}")
        print(c,r)
        bb=pg.evaluate("()=>{const e=document.querySelector('#ccPV');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:Math.max(1,r.width),height:Math.max(1,r.height)}}")
        pg.screenshot(path=play.TMP+'/v116_cc_%s%s.png'%(c,os.environ.get('ROT','')),clip=bb,timeout=600000) if bb else pg.screenshot(path=play.TMP+'/v116_cc_%s%s.png'%(c,os.environ.get('ROT','')),timeout=600000)
    pg.screenshot(path=play.TMP+'/v116_cc_full.png',timeout=600000)
play.run(s,w=1100,hh=760)
