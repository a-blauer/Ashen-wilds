import play,json
def chk(n,ok,info=''):print(('ok   ' if ok else 'FAIL ')+n,'' if ok else str(info)[:300],flush=True)
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="ranger"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    def P(n,c):
        v=ev(c);print(n,'=>',json.dumps(v)[:500]);return v
    ev("()=>{POST.render=()=>{};window.requestAnimationFrame=cb=>setTimeout(()=>cb(performance.now()),16)}")
    ev("()=>{enterMap(0)}");pg.wait_for_timeout(2000)
    ev("()=>{const e=bossEnt(0);hurt(e,1e9,1);eggs.push(rollEgg(2));gold=777}");pg.wait_for_timeout(2500)
    st=P('state',"()=>[[...bossDone],curMap(),Math.round(pl.position.x),Math.round(pl.position.z)]")
    chk('saved to browser storage',P('save',"()=>{saveGame(true);return !!localStorage.getItem(Object.keys(localStorage)[0])}"))
    print('ERRS1',len(errs),errs[:3])
    pg.reload(wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(3000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(500)
    try:
        pg.click('#svpC',timeout=60000)
    except Exception as e: print('noclick',str(e)[:100])
    pg.wait_for_timeout(4000)
    ld=P('loaded',"()=>[[...bossDone],curMap(),Math.round(pl.position.x),Math.round(pl.position.z),gold,eggs.length,pUnlocked(1),RPORT.filter(r=>r.k=='exit'&&r.g.visible).length,hero.cls]")
    print('ERRS2',len(errs),errs[:3])
    chk('reload: same defeated Sovereigns, map and spot',ld[:4]==st,[st,ld[:4]])
    chk('reload: gold, egg, unlocked portal, exit portal, class',ld[4]==777 and ld[5]>=1 and ld[6] and ld[7]==1 and ld[8]=='ranger',ld[4:])
    chk('no page errors',not errs,errs[:3])
play.run(s,w=900,hh=560)
