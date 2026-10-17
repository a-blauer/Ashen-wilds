import play,json
def s(pg):
    ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:900])
    P('nodes',"()=>{const o={};CYD.nodes.forEach(q=>{const k=q[3]+':'+q[2];o[k]=(o[k]||0)+1});return [CYD.nodes.length,o,MAP.props.filter(q=>CYG.set.has(q[1]*W+q[0])).length]}")
    for n in [0,3,6]:
        P('sync%d'%n,"()=>{bossDone.clear();for(let i=0;i<%d;i++)bossDone.add(i);cySync();return [CYD.r,CYG.walls.length,CYG.lock.size,CYD.nodes.filter(q=>!CYG.lock.has(q[1]*W+q[0])).length]}"%n)
        ev("()=>{toPos(CYD.gate[0],CYD.gate[1]-4);camYaw=0;camPitch=.95;camDist=30;snapCam()}")
        pg.wait_for_timeout(5000)
        pg.locator('#stage').screenshot(path=play.TMP+'/v85_court%d.png'%n,timeout=180000)
    P('harvest',"()=>{const q=CYD.nodes.find(q=>q[2]=='rock'&&!CYG.lock.has(q[1]*W+q[0]));const tg={kind:'rock',x:q[0],y:q[1],k:q[1]*W+q[0]};gFinish(tg);const g=gresp.find(r=>r.tg===tg);return g&&g.t}")
    ev("()=>openWMap()");pg.wait_for_timeout(800);pg.locator('#stage').screenshot(path=play.TMP+'/v85_courtmap.png',timeout=180000)
    print('ERRS',errs[:3])
play.run(s,w=1100,hh=700)
