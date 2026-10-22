import play,json,os
def chk(n,ok,info=''):print(('ok   ' if ok else 'FAIL ')+n,'' if ok else str(info)[:300],flush=True)
O=play.TMP
def title(pg):
    ev=pg.evaluate
    pg.wait_for_timeout(2500)
    pg.screenshot(path=O+'/t_title.png',timeout=120000)
    print('title', ev("()=>[!!$('awT'),[...document.querySelectorAll('[data-aw]')].map(b=>b.dataset.aw)]"))
    pg.keyboard.press('Enter');pg.wait_for_timeout(1500)
    print('after', ev("()=>[!!$('awT'),$('devp').classList.contains('hide')]"))
def game(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    def P(n,c):
        v=ev(c);print(n,'=>',json.dumps(v)[:600]);return v
    P('setup',"()=>{const p=PMAP[0];toPos(p.path[40][0],p.path[40][1]);snapCam();enemies.forEach(e=>{if(!e.boss)e.agg=0});window.__e=spawnEnemy('goo',pl.position.x+2.5,pl.position.z-1,2,{});__e.ai=0;return [hero.hp,heroMax(),regionAt(Math.round(pl.position.x),Math.round(pl.position.z))]}")
    pg.wait_for_timeout(1500)
    hit=P('hit',"()=>{const h0=hero.hp;hitHero(__e,1.5);return [h0,hero.hp]}")
    pg.wait_for_timeout(200);pg.screenshot(path=O+'/t_hit.png',timeout=120000)
    P('low',"()=>{hero.hp=Math.round(heroMax()*.12);return hero.hp}")
    pg.wait_for_timeout(2500);pg.screenshot(path=O+'/t_low.png',timeout=120000)
    lw=P('lowstate',"()=>[$('awLow').style.opacity,document.querySelector('.orb.hp').className,AWD.lowWarn]")
    die=P('die',"()=>{hero.hp=1;hitHero(__e,3);return [AWD.dead,hero.hp,uiOpen(),!$('dth').classList.contains('hide'),$('dth').innerText.slice(0,200)]}")
    nd=P('nodmg',"()=>{hitHero(__e,5);down();return [hero.hp,AWD.dead]}")
    pg.wait_for_timeout(3000);pg.screenshot(path=O+'/t_dead.png',timeout=120000)
    pg.keyboard.press('Enter');pg.wait_for_timeout(2500)
    rise=P('rise',"()=>[AWD.dead,hero.hp==heroMax(),$('dth').classList.contains('hide'),regionAt(Math.round(pl.position.x),Math.round(pl.position.z)),uiOpen()]")
    pg.screenshot(path=O+'/t_rise.png',timeout=120000)
    sv=P('save',"()=>{saveGame(true);return !!saveInfo()}")
    chk('a hit lowers health',hit[1]<hit[0],hit)
    chk('low health warning shows',lw[2]==1 and 'awlow' in lw[1],lw)
    chk('death: dead, 0 hp, death screen with killer',die[0]==1 and die[1]==0 and die[3] and 'Slain by' in die[4],die[:4])
    chk('no damage while dead',nd==[0,1],nd)
    chk('rise: alive, full health, screen gone, back in Duskhold',rise[0]==0 and rise[1] and rise[2] and rise[3]==-1,rise)
    chk('saves after rising',sv,sv)
if os.environ.get('TITLE'):play.run(title,w=1000,hh=620)
else:play.run(game,w=1000,hh=620)
