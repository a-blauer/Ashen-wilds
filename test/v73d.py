import play
def s(pg):
    ev=pg.evaluate
    pg.wait_for_timeout(1500);pg.keyboard.press('Enter');pg.wait_for_timeout(1500)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="mage"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    print('saved',ev("()=>{hero.name='Tester';hero.lvl=7;return saveGame(true)}"))
    pg.reload();pg.wait_for_timeout(3000)
    print('title',ev("()=>[...document.querySelectorAll('[data-aw]')].map(b=>b.innerText.replace(/\\n/g,' | '))"))
    pg.screenshot(path=play.TMP+'/t_title2.png',timeout=120000)
    pg.keyboard.press('Enter');pg.wait_for_timeout(4000)
    print('cont',ev("()=>[hero.name,hero.lvl,hero.cls,$('devp').classList.contains('hide'),$('svp').classList.contains('hide'),$('start').classList.contains('hide'),!!$('awT')]"))
play.run(s,w=1000,hh=620)
