# v131: loading a save made in a zone instance shows that zone's title card, not Duskhold's
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
def chk(n,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+n,str(info)[:400],flush=True)
    if not ok:FAIL.append(n)
# every title card shown, in order (zt116Show is looked up at call time, so wrap it once the game has defined it)
HOOK="""()=>{window.__T=[];const w=()=>{if(typeof zt116Show!='function'){setTimeout(w,20);return}
  const f=zt116Show;zt116Show=function(T,kick,title){window.__T.push(title+' @'+(typeof curIns!='undefined'&&curIns?curIns.z:'-'));return f.apply(this,arguments)}};w()}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{insArrive(PMAP[0].ins[0])}");pg.wait_for_timeout(1500)
    at=ev("()=>({town:townAt(pl.position.x,pl.position.z,0),x:pl.position.x,z:pl.position.z})")
    chk('in Kindlelight I, not in town',at['town']<0,at)
    ev("()=>saveGame(true)")
    pg.reload(wait_until='domcontentloaded',timeout=240000);pg.wait_for_function("()=>!!document.getElementById('devp')",timeout=180000)
    ev(HOOK);pg.wait_for_timeout(2500)
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(800);pg.click('#svpC');pg.wait_for_timeout(6000)
    t=ev("()=>window.__T");el=ev("()=>ZT116.el?{t:(ZT116.el.querySelector('.ztt')||{}).textContent,on:/\\bon\\b/.test(ZT116.el.className)}:null")
    pos=ev("()=>({town:townAt(pl.position.x,pl.position.z,0),x:pl.position.x,z:pl.position.z})")
    print('cards shown:',t,'card now:',el,'pos:',pos)
    chk('back in Kindlelight after Continue',pos['town']<0,pos)
    chk('no Duskhold card on load in a zone',not any(x.startswith('Duskhold') for x in t),t)
    # (fast mode runs the game loop ~30x faster, so the card may already have faded by now: check the card that was shown)
    chk('the Kindlelight card shows',bool(t) and t[-1].startswith('Kindlelight') and bool(el) and el['t']!='Duskhold',[t,el])
play.run(s)
print('FAILURES:',FAIL if FAIL else 'none')
