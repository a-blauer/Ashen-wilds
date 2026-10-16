import play
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    print(ev("()=>{const D=$('awDir');[0,90,200].forEach(a=>{const i=document.createElement('i');i.style.transform='rotate('+a+'deg)';i.style.animation='none';D.appendChild(i)});const r=D.getBoundingClientRect();return [r.width,r.height,getComputedStyle(D).zIndex,D.children.length]}"))
    pg.screenshot(path=play.TMP+'/t_dir.png',timeout=120000,animations='disabled')
play.run(s,w=1000,hh=620)
