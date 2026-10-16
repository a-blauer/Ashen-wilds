import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:500])
    P('enter',"()=>{const p=PMAP[0];toPos(p.path[100][0],p.path[100][1]);rosterTick();return [ROST.slots.length,ROST.slots.filter(s=>s.camp).length,enemies.filter(e=>e.slot&&!e.dead).length]}")
    P('kill',"()=>{const act=enemies.filter(e=>e.slot&&!e.dead);act.forEach(e=>{e.c.h=1;hurt(e,1e7,null)});return act.length}")
    pg.wait_for_timeout(2000)
    P('after',"()=>{for(let i=0;i<10;i++){rosterTick();spawn()}return [ROST.left,enemies.filter(e=>e.slot&&!e.dead).length,enemies.filter(e=>!e.dead&&!e.boss&&!e.slot).length]}")
    P('walk',"()=>{const p=PMAP[0];toPos(p.path[300][0],p.path[300][1]);rosterTick();return [ROST.left,enemies.filter(e=>e.slot&&!e.dead).length]}")
    P('reenter',"()=>{toPos(TOWNS[0].sp[0],TOWNS[0].sp[1]);rosterTick();const p=PMAP[0];toPos(p.path[100][0],p.path[100][1]);rosterTick();return [ROST.slots.length,ROST.left]}")
play.run(s,w=800,hh=500)
