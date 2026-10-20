# v108: three field instances per zone (half the v106 size), then the Sovereign's Den and the Wave Trial as instances of their own;
# bigger dens (DK 2). Gateways, respawn, recall, portal window, saves, chunk visibility. Prints PASS/FAIL lines.
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
    T('layout',"()=>PMAP.map(p=>p.ins.map(I=>[I.lv[0],I.lv[1],I.den,rgAt(I.en[0],I.en[1])===I.g,regionAt(I.en[0],I.en[1])===I.z,I.k]).concat([[p.tri.tri,rgAt(p.wa[0],p.wa[1])===p.tri.g,INSL[p.tri.g]===p.tri]]))",
      lambda r:all(len(z)==5 and z[0][0]<=z[0][1]<z[1][0]<=z[1][1]<z[2][0]<=z[2][1] and [i[2] for i in z[:4]]==[False,False,False,True] and all(i[3] and i[4] for i in z[:4]) and z[4]==[True,True,True] for z in r))
    T('dens in own instance',"()=>BOSSES.map((b,i)=>{const I=insAt(b.x,b.y);return I.den&&I.z===i&&I.k===PMF&&Math.hypot(b.x-I.x0,0)>26*DK&&I.x0+I.w-b.x>26*DK&&I.y0+I.h-b.y>26*DK})",lambda r:all(r))
    T('den bigger',"()=>[ARENA_R,DK,PM_DENR,ARN.map(A=>{let n=0;for(let y=A.cz-45;y<=A.cz+45;y++)for(let x=A.cx-45;x<=A.cx+45;x++)if(MAP.DW[y*W+x]<0&&Math.hypot(x-A.cx,y-A.cz)<ARENA_R)n++;return n})]",lambda r:r[0]==28 and min(r[3])>2000)
    T('trial in own instance',"()=>PMAP.map((p,i)=>{const I=insAt(p.wa[0],p.wa[1]);return [I&&I.tri,I&&I.z,MAP.DW[p.wa[1]*W+p.wa[0]]<0,MAP.DW[(p.wa[1]+11)*W+p.wa[0]]<0]})",lambda r:all(q[0] and q[1]==i and q[2] and q[3] for i,q in enumerate(r)))
    T('size',"()=>INSL.filter(I=>I.fld).map(I=>{let n=0;for(let y=I.y0;y<I.y0+I.h;y+=2)for(let x=I.x0;x<I.x0+I.w;x+=2)if(MAP.DW[y*W+x]<0)n++;return n*4})",lambda r:min(r)>10000 and max(r)<24000)
    # enter Kindlelight I from its portal
    T('enter I',"()=>{insArrive(PMAP[0].ins[0]);rosterTick();const I=curIns();return [I.g,ROST.r,ROST.slots.length,ROST.slots.every(s=>rgAt(s.x,s.z)===0),Math.min(...ROST.slots.map(s=>s.lv)),Math.max(...ROST.slots.filter(s=>!s.al).map(s=>s.lv))]}",
      lambda r:r[0]==0 and r[1]==0 and r[2]>30 and r[3] and r[4]>=1 and r[5]<=4)
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
    r0=T('recall',"()=>{const I=curIns(),q=I.path[120];toPos(q[0],q[1]);rosterTick();const e=ROST.slots.find(s=>s.on&&!s.on.dead);if(e){e.on.c.h=1;hurt(e.on,1e7,null)}window._sp=[pl.position.x,pl.position.z];recallTown();return [curMap(),INST&&INST.r,INST&&INST.slots.filter(s=>s.dead).length]}",
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
    T('chunks',"()=>{chunkVis();const I=curIns();let on=0,bad=0;for(const c of CHL){if(c.on||c.non){on++;const b=c.box;if(b.max.x<I.x0-3||b.min.x>I.x0+I.w+3||b.max.z<I.y0-3||b.min.z>I.y0+I.h+3)bad++}}return [on,bad]}",lambda r:r[0]>0 and r[1]==0)
    # co-op region = the instance
    T('co-op region',"()=>[mpCurRg(),mpLoc(mpCurRg())]",lambda r:r[0]==1 and r[1]=='Kindlelight II')
    # local map shows the instance
    T('local map',"()=>{openWMap();const ok=!$('wmap').classList.contains('hide');$('wmap').classList.add('hide');return ok}",lambda r:r)
    # treasure map in this instance
    T('treasure map',"()=>{const m=giveMap(pl.position);return m&&[m.r,m.k,rgAt(m.x,m.z),tmName(m)]}",lambda r:r and r[0]==0 and r[1]==1 and r[2]==1 and 'Kindlelight II' in r[3])
    # save + reload keeps the reached instances and the recall spot
    T('save',"()=>{const q=curIns().path[100];toPos(q[0],q[1]);recallTown();saveGame&&saveGame();const s=JSON.parse(localStorage.getItem(SAVE_KEY));return [s.x2.insr,s.x2.inst&&s.x2.inst.r,s.x2.wl]}",lambda r:r[0][0]==1 and r[1]==1 and r[2]==108)
    # III ends in the gateway to the den; the den has no roaming creatures, a way home at its entrance, and recall works there
    T('III gateway',"()=>{const g=RPORT.find(r=>r.k=='next'&&r.ig===insG(0,2));toPos(g.x,g.z+1);const p=portalPrompt();return [p&&p.label,g.to.den]}",lambda r:r[0] and 'Den' in r[0] and r[1])
    T('into den',"()=>{const g=RPORT.find(r=>r.k=='next'&&r.ig===insG(0,2));insArrive(g.to);insMark(g.to);rosterTick();const I=curIns();return [I.g,I.den,INSR[0],ROST.r,ROST.slots.length,RPORT.some(r=>r.k=='home'&&r.ig===I.g),zoneLv(I.en[0],I.en[1])]}",
      lambda r:r[0]==3 and r[1] and r[2]==3 and r[3]==3 and r[4]==0 and r[5])
    T('den fight starts',"()=>{const A=ARN[0];toPos(A.cx,A.cz+ARENA_R-4);arenaTick(.016,performance.now());return [!!AF,AF&&AF.i]}",lambda r:r[0] and r[1]==0)
    T('den fight leave',"()=>{try{arenaFail()}catch(e){return 'err '+e}const I=curIns();toPos(I.en[0],I.en[1]);return !AF}",lambda r:r is True)
    T('recall from den',"()=>{const I=PMAP[0].ins[3];insArrive(I);rosterTick();toPos(I.path[30][0],I.path[30][1]);recallTown();const r=INST&&INST.r;RECBACK=nowP();recallTown();return [r,curIns()&&curIns().g]}",lambda r:r[0]==3 and r[1]==3)
    T('portal lists den',"()=>{recallTown();openX('portal',0);const b=[...document.querySelectorAll('#xwB [data-pgo=map]')].map(x=>x.dataset.pk);const t=$('xwB').textContent;closeX();return [b,t]}",lambda r:r[0]==['0','1','2','3'] and 'Den' in r[1])
    T('wave trial',"()=>{bossDone.add(0);waveStart(0);return [!!AF,!!WV]}",lambda r:True)
    pg.wait_for_function("()=>WV&&WV.go",timeout=60000)
    T('in trial',"()=>{const I=curIns();rosterTick();return [I&&I.tri,curMap(),!!WV,ROST.slots.length,areaName()]}",lambda r:r[0] and r[1]==0 and r[2] and r[3]==0)
    T('trial map',"()=>{openWMap();const ok=!$('wmap').classList.contains('hide');$('wmap').classList.add('hide');return ok}",lambda r:r)
    T('trial leave',"()=>{const w=RPORT.find(r=>r.k=='wave'&&r.pi===0);toPos(w.x,w.z+.5);const p=portalPrompt();return p&&p.label}",lambda r:r and 'Leave' in r)
    T('treasure from den',"()=>{const g=tmZoneFor({x:BOSSES[0].x,z:BOSSES[0].y});return [g,INSL[g].fld]}",lambda r:r[0]==2 and r[1])
    print('FAILS',fails)
    open(play.TMP+'/v108_fails.json','w').write(json.dumps(fails))
play.run(s,w=800,hh=500)
