import play,json
def chk(n,ok,info=''):print(('ok   ' if ok else 'FAIL ')+n,'' if ok else str(info)[:300],flush=True)
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    def P(n,c):
        v=ev(c);print(n,'=>',json.dumps(v)[:500]);return v
    ev("()=>{window.__rr=ren.render.bind(ren);window.__pr=POST.render;window.__raf=window.requestAnimationFrame;window.FAST=()=>{ren.render=()=>{};POST.render=()=>{};window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)};window.SLOW=()=>{ren.render=__rr;POST.render=__pr;window.requestAnimationFrame=__raf}}")
    ev("()=>{toPos(PCOURT[0]-8,PCOURT[1]+.5,-Math.PI/2);camPitch=.45;camDist=16;snapCam()}");pg.wait_for_timeout(4000)
    pg.screenshot(path=play.TMP+'/p_court.png',timeout=120000,animations='disabled')
    pr=P('prompts',"()=>PORT.map(Q=>{pl.position.set(Q.x+.5,0,Q.z+.5);const p=portalPrompt();return p&&p.label})")
    ev("()=>{enterMap(0)}");pg.wait_for_timeout(3000)
    im=P('inmap',"()=>[curMap(),Math.round(pl.position.x),Math.round(pl.position.z),$('areaT').textContent,zoneLv(pl.position.x,pl.position.z)]")
    pg.screenshot(path=play.TMP+'/p_map1.png',timeout=120000,animations='disabled')
    ev("()=>{FAST();window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=5},40)}")
    P('camp',"()=>{const C=CAMPS.find(C=>C.pm===0);pl.position.set(C.x+6,0,C.z+6);return [C.th.n,C.x,C.z]}")
    pg.wait_for_timeout(5000)
    cf=P('campfoes',"()=>enemies.filter(e=>!e.boss&&!e.dead).map(e=>[e.c.en||e.c.g[0],e.c.l])")
    # boss kill
    P('boss',"()=>{const A=ARN[0],e=bossEnt(0);pl.position.set(A.cx+4,0,A.cz+4);return [e.c.n,e.c.l,!!e.m]}")
    pg.wait_for_timeout(3000)
    P('fight',"()=>{const e=bossEnt(0);return [AF&&AF.i,e.bs.last]}")
    ev("()=>{const e=bossEnt(0);e.c.h=1;hurt(e,999999,1)}");pg.wait_for_timeout(3000)
    af=P('after',"()=>[[...bossDone],pUnlocked(1),RPORT.filter(r=>r.k=='exit'&&r.g.visible).length]")
    ev("()=>{SLOW()}");pg.wait_for_timeout(1500)
    ev("()=>{goHome()}");pg.wait_for_timeout(2500)
    hm=P('home',"()=>[curMap(),Math.round(pl.position.x),Math.round(pl.position.z)]")
    ev("()=>{FAST();waveStart(0)}");pg.wait_for_timeout(2500)
    for k in range(12):
        pg.wait_for_timeout(1800)
        r=ev("()=>{if(!WV)return 'done';WV.foes.forEach(e=>{if(!e.dead){e.c.h=1;hurt(e,999999,1)}});return [WV.w,WV.foes.length]}")
        print('wave',r)
        if r=='done':break
    ch=P('chest',"()=>[drops.length,drops.map(d=>d.kind).join(',')]")
    chk('portal prompts: first open, the rest sealed',pr and 'Enter' in (pr[0] or '') and all('Sealed' in (x or '') for x in pr[1:]),pr)
    chk('portal goes into Kindlelight',im[0]==0,im)
    chk('camp has creatures',len(cf)>0,cf)
    chk('Sovereign kill: marked done, next portal open, exit portal shown',0 in af[0] and af[1] and af[2]==1,af)
    chk('recall goes home to Duskhold',hm[0]==-1,hm)
    chk('wave trial pays out a chest',ch[0]>0,ch)
    ev("()=>{SLOW();const p=PMAP[0];toPos(p.wa[0],p.wa[1]+4,0);camPitch=.5;camDist=13;snapCam()}");pg.wait_for_timeout(3500)
    pg.screenshot(path=play.TMP+'/p_wave.png',timeout=120000,animations='disabled')
play.run(s,w=1000,hh=620)
