# v116: zone title cards replace the arrival banners; no recommendation pop-up; recommended power in the location box.
# out/v116_title_<z><k>.png per card, out/v116_locbox.png
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,'' if ok else info)
    if not ok:FAIL.append(n)
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="mage"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{$('banner').innerHTML='';const c=$('ztc116');if(c)c.className='';insGo(INSL[insG(0,0)])}");pg.wait_for_function("()=>curMap()==0",timeout=60000);pg.wait_for_timeout(300)
    r=ev("()=>({old:$('banner').children.length,card:!!document.querySelector('#ztc116.on'),t:(document.querySelector('#ztc116 .ztt')||{}).textContent})")
    chk('arrival: card, no old banner',r['old']==0 and r['t']=='Kindlelight',r)
    pg.wait_for_timeout(4000)
    for _ in range(3):ev("()=>hud()");pg.wait_for_timeout(400)
    r=ev("()=>({area:$('areaT').textContent,loc:($('locBox')||{}).textContent,ban:[...$('banner').children].map(b=>b.textContent)})")
    chk('Kindlelight: rec power in the location box','Rec. power' in (r['loc'] or ''),r);chk('no recommendation pop-up',not any('Recommended' in b for b in r['ban']),r)
    lb=pg.query_selector('#locBox')
    if lb:pg.screenshot(path=play.TMP+'/v116_locbox.png',clip={'x':560,'y':80,'width':260,'height':240})
    for z,k in [(0,0),(0,1),(1,2),(2,1),(3,0),(4,2),(5,1),(5,3),(-1,0)]:
        ev("([z,k])=>{if(z<0)banner('🏰 DUSKHOLD','x');else zt116Ins(INSL[insG(z,k)]);const c=$('ztc116');c.querySelectorAll('*').forEach(e=>e.style.animation='none');c.style.animation='none';c.style.opacity=1}",[z,k]);pg.wait_for_timeout(1200)
        pg.screenshot(path=play.TMP+'/v116_title_%s%d.png'%('t' if z<0 else z,k),clip={'x':40,'y':100,'width':740,'height':230})
play.run(s)
print('FAILURES:',FAIL if FAIL else 'none')
