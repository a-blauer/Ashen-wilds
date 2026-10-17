import play,json
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="ranger"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:500])
    ev("()=>{POST.render=()=>{};window.requestAnimationFrame=cb=>setTimeout(()=>cb(performance.now()),16)}")
    ev("()=>{enterMap(0)}");pg.wait_for_timeout(2000)
    ev("()=>{const e=bossEnt(0);hurt(e,1e9,1);eggs.push(rollEgg(2));gold=777}");pg.wait_for_timeout(2500)
    P('state',"()=>[[...bossDone],curMap(),Math.round(pl.position.x),Math.round(pl.position.z)]")
    P('save',"()=>{saveGame(true);return !!localStorage.getItem(Object.keys(localStorage)[0])}")
    print('ERRS1',len(errs),errs[:3])
    pg.reload(wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(3000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(500)
    try:
        pg.click('#svpC',timeout=60000)
    except Exception as e: print('noclick',str(e)[:100])
    pg.wait_for_timeout(4000)
    P('loaded',"()=>[[...bossDone],curMap(),Math.round(pl.position.x),Math.round(pl.position.z),gold,eggs.length,pUnlocked(1),RPORT.filter(r=>r.k=='exit'&&r.g.visible).length,hero.cls]")
    print('ERRS2',len(errs),errs[:3])
play.run(s,w=900,hh=560)
