# v106: three instances per zone (half size, rising levels), gateways, 30 s respawn, recall back to the same spot,
# the portal window lists reached instances, saves keep INSR, chunk visibility per instance. Prints PASS/FAIL lines.
import play,json,os
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{POST.render=()=>{};window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}")
    fails=[]
    def T(name,js,check):
        r=ev(js);ok=check(r);print(('PASS ' if ok else 'FAIL ')+name,'=>',json.dumps(r)[:400])
        if not ok:fails.append(name)
        return r
    T('layout',"()=>PMAP.map(p=>p.ins.map(I=>[I.lv[0],I.lv[1],I.den,rgAt(I.en[0],I.en[1])===I.g,regionAt(I.en[0],I.en[1])===I.z]))",
      lambda r:all(len(z)==3 and z[0][0]<=z[0][1]<z[1][0]<=z[1][1]<z[2][0]<=z[2][1] and [i[2] for i in z]==[False,False,True] and all(i[3] and i[4] for i in z) for z in r))
    T('dens in III',"()=>BOSSES.map((b,i)=>insAt(b.x,b.y).k===2&&insAt(b.x,b.y).z===i)",lambda r:all(r))
    T('size',"()=>INSL.map(I=>{let n=0;for(let y=I.y0;y<I.y0+PMH;y+=2)for(let x=I.x0;x<I.x0+PMW;x+=2)if(MAP.DW[y*W+x]<0)n++;return n*4})",lambda r:min(r)>25000 and max(r)<45000)
    # enter Kindlelight I from its portal
    T('enter I',"()=>{insArrive(PMAP[0].ins[0]);rosterTick();const I=curIns();return [I.g,ROST.r,ROST.slots.length,ROST.slots.every(s=>rgAt(s.x,s.z)===0),Math.min(...ROST.slots.map(s=>s.lv)),Math.max(...ROST.slots.filter(s=>!s.al).map(s=>s.lv))]}",
      lambda r:r[0]==0 and r[1]==0 and r[2]>60 and r[3] and r[4]>=1 and r[5]<=4)
    pg.wait_for_timeout(1500)
    T('levels II/III',"()=>[1,2].map(k=>{const I=PMAP[0].ins[k];return [zoneLv(I.en[0],I.en[1]),zoneLv(I.ba[0],I.ba[1]),I.lv]})",lambda r:all(q[2][0]<=q[0]<=q[1]<=q[2][1] for q in r))
    # respawn: kill one spawned creature, it stays down, then comes back 30 s later (time skipped by moving its timer)
    T('kill',"()=>{const I=curIns();const e=enemies.find(e=>e.slot&&!e.dead);if(!e)return null;window._s=e.slot;e.c.h=1;hurt(e,1e7,null);return [_s.dead,Math.round((_s.rt-nowP())/1000)]}",lambda r:r and r[0] and 29<=r[1]<=30)
    pg.wait_for_timeout(800)
    T('still dead',"()=>{rosterTick();return _s.dead}",lambda r:r is True)
    T('respawn',"()=>{_s.rt=nowP()-1;const P=pl.position;toPos(_s.x+10,_s.z);rosterTick();return [_s.dead,!!_s.on,_s.on&&!_s.on.dead,Math.round(Math.hypot(P.x-_s.x,P.z-_s.z))]}",lambda r:r[0] is False and r[1] and r[2])
    T('not on top of you',"()=>{const e=_s.on;e.c.h=1;hurt(e,1e7,null);_s.rt=nowP()-1;toPos(_s.x+.5,_s.z);rosterTick();return _s.dead}",lambda r:r is True)
    # gateway at the end of I
    T('gateway',"()=>{const g=RPORT.find(r=>r.k=='next'&&r.ig===0);toPos(g.x,g.z+1);const p=portalPrompt();return [p&&p.label,g.to.n]}",lambda r:r[0] and 'Kindlelight II' in r[0])
    T('through',"()=>{const g=RPORT.find(r=>r.k=='next'&&r.ig===0);insArrive(g.to);insMark(g.to);rosterTick();const I=curIns();return [I.g,INSR[0],ROST.r,enemies.filter(e=>e.slot&&!e.dead&&rgAt(Math.round(e.m.position.x),Math.round(e.m.position.z))!==1).length]}",
      lambda r:r[0]==1 and r[1]==1 and r[2]==1 and r[3]==0)
    # recall from a spot in II, then T again from Duskhold: back to that same spot
    r0=T('recall',"()=>{const I=curIns(),q=I.path[200];toPos(q[0],q[1]);rosterTick();const e=ROST.slots.find(s=>s.on&&!s.on.dead);if(e){e.on.c.h=1;hurt(e.on,1e7,null)}window._sp=[pl.position.x,pl.position.z];recallTown();return [curMap(),INST&&INST.r,INST&&INST.slots.filter(s=>s.dead).length]}",
      lambda r:r[0]==-1 and r[1]==1 and r[2]>=1)
    T('hint',"()=>{hud();const b=document.querySelector('.instb');return b&&b.textContent}",lambda r:r and 'Kindlelight II' in r)
    T('back',"()=>{RECBACK=nowP();recallTown();const I=curIns();return [I&&I.g,Math.hypot(pl.position.x-_sp[0],pl.position.z-_sp[1])<.01,ROST.r,INST,ROST.slots.filter(s=>s.dead).every(s=>s.rt>nowP()+20000)]}",
      lambda r:r[0]==1 and r[1] and r[2]==1 and r[3] is None and r[4])
    # the portal window: I and II open, III locked
    T('portal window',"()=>{recallTown();openX('portal',0);const b=[...document.querySelectorAll('#xwB [data-pgo=map]')].map(x=>x.dataset.pk);const t=$('xwB').textContent;closeX();return [b,t.includes('🔒')]}",lambda r:r[0]==['0','1'] and r[1])
    T('portal prompt',"()=>{const Q=PORT[0];toPos(Q.x,Q.z);const p=portalPrompt();return p&&p.label}",lambda r:r and 'choose' in r)
    T('portal enters II',"()=>{openX('portal',0);document.querySelector('#xwB [data-pk=\"1\"]').click();return 1}",lambda r:True)
    pg.wait_for_timeout(1500)
    T('in II',"()=>{const I=curIns();return [I&&I.g,Math.hypot(pl.position.x-I.en[0],pl.position.z-I.en[1])<1]}",lambda r:r[0]==1 and r[1])
    # chunk visibility: only chunks touching this instance draw
    T('chunks',"()=>{chunkVis();const I=curIns();let on=0,bad=0;for(const c of CHL){if(c.on||c.non){on++;const b=c.box;if(b.max.x<I.x0-3||b.min.x>I.x0+PMW+3||b.max.z<I.y0-3||b.min.z>I.y0+PMH+3)bad++}}return [on,bad]}",lambda r:r[0]>0 and r[1]==0)
    # co-op region = the instance
    T('co-op region',"()=>[mpCurRg(),mpLoc(mpCurRg())]",lambda r:r[0]==1 and r[1]=='Kindlelight II')
    # local map shows the instance
    T('local map',"()=>{openWMap();const ok=!$('wmap').classList.contains('hide');$('wmap').classList.add('hide');return ok}",lambda r:r)
    # treasure map in this instance
    T('treasure map',"()=>{const m=giveMap(pl.position);return m&&[m.r,m.k,rgAt(m.x,m.z),tmName(m)]}",lambda r:r and r[0]==0 and r[1]==1 and r[2]==1 and 'Kindlelight II' in r[3])
    # save + reload keeps the reached instances and the recall spot
    T('save',"()=>{const q=curIns().path[150];toPos(q[0],q[1]);recallTown();saveGame&&saveGame();const s=JSON.parse(localStorage.getItem(SAVE_KEY));return [s.x2.insr,s.x2.inst&&s.x2.inst.r,s.x2.wl]}",lambda r:r[0][0]==1 and r[1]==1 and r[2]==106)
    print('FAILS',fails)
    open(play.TMP+'/v106_fails.json','w').write(json.dumps(fails))
play.run(s,w=800,hh=500)
