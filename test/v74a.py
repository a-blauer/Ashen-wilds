import play
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{for(let i=0;i<3;i++){const e=rollEgg(1+i);e.t0=Date.now()-(i?EGG_T:10000);eggs.push(e)};for(let i=0;i<2;i++)hatch(Object.assign(rollEgg(2),{basic:true}));$('cmpBtn').click()}")
    pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/c_before.png',timeout=120000)
    ev("()=>{$('cmp').classList.add('hide');$('incBtn').click()}");pg.wait_for_timeout(800);pg.screenshot(path=play.TMP+'/i_before.png',timeout=120000)
    ev("()=>{const e=eggs.find(eggRdy);hatchEgg(e.id)}");pg.wait_for_timeout(6000);pg.screenshot(path=play.TMP+'/h_before.png',timeout=120000)
play.run(s,w=1100,hh=700)
