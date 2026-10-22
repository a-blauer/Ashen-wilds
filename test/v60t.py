# zone roster per instance (v106): the dead stay down for RESP_T (30 s), the roster is rebuilt on re-entry
import play,json
def chk(n,ok,info=''):print(('ok   ' if ok else 'FAIL ')+n,'' if ok else str(info)[:300],flush=True)
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    def P(n,c):
        v=ev(c);print(n,'=>',json.dumps(v)[:500]);return v
    en=P('enter',"()=>{const p=PMAP[0].ins[0];toPos(p.path[100][0],p.path[100][1]);rosterTick();return [ROST.slots.length,ROST.slots.filter(s=>s.camp).length,enemies.filter(e=>e.slot&&!e.dead).length]}")
    k=P('kill',"()=>{const act=enemies.filter(e=>e.slot&&!e.dead);act.forEach(e=>{e.c.h=1;hurt(e,1e7,null)});return act.length}")
    pg.wait_for_timeout(2000)
    af=P('after',"()=>{for(let i=0;i<10;i++){rosterTick();spawn()}return [ROST.left,enemies.filter(e=>e.slot&&!e.dead).length,enemies.filter(e=>!e.dead&&!e.boss&&!e.slot).length]}")
    wk=P('walk',"()=>{const p=PMAP[0].ins[0];toPos(p.path[300][0],p.path[300][1]);rosterTick();return [ROST.left,enemies.filter(e=>e.slot&&!e.dead).length]}")
    re_=P('reenter',"()=>{toPos(TOWNS[0].sp[0],TOWNS[0].sp[1]);rosterTick();const p=PMAP[0].ins[0];toPos(p.path[100][0],p.path[100][1]);rosterTick();return [ROST.slots.length,ROST.left]}")
    chk('enter: roster with camps and live creatures',en[0]>0 and en[1]>0 and en[2]>0,en)
    chk('kill: every live creature died',k==en[2],[k,en])
    chk('slain stay down (none respawn, no extras)',af[1]==0 and af[2]==0 and af[0]==en[0]-k,af)
    chk('walking on: slain still count as gone',wk[0]==af[0],wk)
    chk('re-entry rebuilds the full roster',re_[1]==re_[0] and re_[0]>0,re_)
play.run(s,w=800,hh=500)
