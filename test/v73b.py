import play,os
def s(pg):
    ev=pg.evaluate
    if os.environ.get('TITLE'):
        pg.wait_for_timeout(2500);pg.screenshot(path=play.TMP+'/t_title.png',timeout=120000);return
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{const p=PMAP[0];toPos(p.path[40][0],p.path[40][1]);snapCam();window.__e=spawnEnemy('goo',pl.position.x+2,pl.position.z+2.5,2,{});__e.ai=0;hero.hp=Math.round(heroMax()*.2)}")
    pg.wait_for_timeout(2500)
    ev("()=>{awHurt(.12,__e);const h=$('awHit');h.classList.remove('on');h.style.opacity=.75;document.querySelectorAll('#awDir i').forEach(i=>i.style.animation='none')}")
    pg.wait_for_timeout(300);pg.screenshot(path=play.TMP+'/t_hit2.png',timeout=120000,animations='disabled')
play.run(s,w=1000,hh=620)
