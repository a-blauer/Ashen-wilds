# v159 intro preview page (tools/build_preview.sh; tools/preview_page.py): it makes a hero, builds the whole intro and lets
# the owner play and scrub it. Checks: it starts and never keeps a save; a jump draws that time and names the shot; play
# moves the clock; a jump into the town replays it the same way every time (companions included); it stops before the
# hand-back to the game; loop shot, keys, hide, copy time, sound; the hero and companion picked are the ones used.
#   python3 v159_preview.py
import os,sys
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(HERE)
sys.path.insert(0,ROOT+'/tools');import preview_page
G=os.environ.get('SRC') or ROOT+'/dist/ashen-wilds.html';T=os.environ.get('AW_TMP',HERE+'/out');os.makedirs(T,exist_ok=True)
os.environ['SRC']=T+'/preview_src.html';open(os.environ['SRC'],'w').write(preview_page.page(open(G).read()))   # the game build as the preview page
sys.path.insert(0,HERE)
import play
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info)
    if not ok:FAIL.append(n)
def wait(pg,js,ms):
    for _ in range(ms//250):
        if pg.evaluate(js):return True
        pg.wait_for_timeout(250)
    return bool(pg.evaluate(js))
def ready(pg):
    ok=wait(pg,"()=>!!window.KQPV_READY||!!window.KQPV_ERR",240000)
    return ok and pg.evaluate("()=>!!window.KQPV_READY"),pg.evaluate("()=>window.KQPV_ERR||''")
def settle(pg,ms=240000):return wait(pg,"()=>!KQPV.busy",ms)
def s(pg):
    ev=pg.evaluate
    ok,err=ready(pg);chk('the preview starts (hero made, intro built)',ok,err[:300])
    if not ok:return
    st=ev("()=>({cls:hero.cls,sp:party[0]&&party[0].n,shots:KQPV.shots.length,panel:!!document.getElementById('kqpv'),run:IC151.run,town:!!(IC151.S&&IC151.S.D),title:document.title})");print(st)
    chk('panel, shot list and the town part are there',st['panel'] and st['shots']>30 and st['run'] and st['town'],st)
    chk('page title',st['title']=='Kill Quest Intro Preview',st['title'])
    sv=ev("()=>{const r=saveGame();return {r,has:!!localStorage.getItem(SAVE_KEY)}}");chk('the preview never keeps a save',not sv['r'] and not sv['has'],sv)
    ev("()=>kqpvGo(20,true)");pg.wait_for_timeout(400)
    st=ev("()=>({t:KQPV.t,shot:document.querySelector('#kqpv .sn').textContent,ph:document.querySelector('#kqpv .ph').style.left})");print(st)
    chk('a jump goes to that time and names the shot',abs(st['t']-20)<1e-6 and st['shot']=='Across the meadow',st)
    pg.screenshot(path=play.TMP+'/v159_prev_20.jpg',type='jpeg',timeout=120000)
    ev("()=>kqpvPlay(true)");pg.wait_for_timeout(2000);t=ev("()=>{const t=KQPV.t;kqpvPlay(false);return t}")
    chk('play moves the clock',20.3<t<23,t)
    # the town: a jump replays it from the cut without drawing; twice gives the same frame
    ev("()=>kqpvGo(64,true)");ok=settle(pg)
    a=ev("()=>({ok:KQPV.ex===64,h:[pl.position.x,pl.position.z],f:fols[0]&&fols[0].parent?[fols[0].position.x,fols[0].position.z]:null,shot:document.querySelector('#kqpv .sn').textContent})");print('town',a)
    chk('a jump into the town settles on that time',ok and a['ok'] and a['shot']=='The Steward',a)
    ev("()=>kqpvGo(30,true)");pg.wait_for_timeout(300);ev("()=>kqpvGo(80,false)");pg.wait_for_timeout(300);ev("()=>kqpvGo(64,true)");settle(pg)
    b=ev("()=>({h:[pl.position.x,pl.position.z],f:fols[0]&&fols[0].parent?[fols[0].position.x,fols[0].position.z]:null})");print('again',b)
    d=abs(a['h'][0]-b['h'][0])+abs(a['h'][1]-b['h'][1]);df=abs(a['f'][0]-b['f'][0])+abs(a['f'][1]-b['f'][1]) if a['f'] and b['f'] else 9
    chk('the same town frame every time (hero and companion)',d<1e-3 and df<.15,(d,df))
    pg.wait_for_timeout(800);pg.screenshot(path=play.TMP+'/v159_prev_64.jpg',type='jpeg',timeout=120000)
    # loop the shot: the Steward meeting plays over and over
    ev("()=>{KQPV.loop=true;kqpvPlay(true)}");pg.wait_for_timeout(4500);st=ev("()=>{const r={t:KQPV.t,shot:document.querySelector('#kqpv .sn').textContent};kqpvPlay(false);KQPV.loop=false;return r}")
    chk('loop shot stays in the shot',st['shot']=='The Steward',st)
    # the end: it stops before the hand-back to the game
    ev("()=>kqpvGo(500,true)");ok=settle(pg,400000)
    st=ev("()=>({t:KQPV.t,run:IC151.run,on:IC151.on,done:!!(IC151.S&&IC151.S.D&&IC151.S.D.done),el:!!document.getElementById('ic151')})");print('end',st)
    chk('the last frame keeps the intro up (no hand-back)',ok and st['run'] and st['on'] and not st['done'] and st['el'] and st['t']<ev("()=>IC151.dEnd"),st)
    ev("()=>kqpvGo(10,true)")
    # keys (the game doesn't see them), hide, copy time
    pg.keyboard.press('Space');p1=ev("()=>KQPV.play");pg.keyboard.press('Space');p2=ev("()=>KQPV.play")
    chk('Space plays and pauses',p1 and not p2,(p1,p2))
    t0=ev("()=>KQPV.t");pg.keyboard.press('ArrowRight');t1=ev("()=>KQPV.t");chk('→ is one frame',abs(t1-t0-1/24)<1e-6,(t0,t1))
    pg.keyboard.press(']');t2=ev("()=>KQPV.t");chk('] goes to the next shot',abs(t2-15)<.01,t2)
    pg.keyboard.press('h');h=ev("()=>document.getElementById('kqpv').classList.contains('hid')");pg.keyboard.press('h');h2=ev("()=>document.getElementById('kqpv').classList.contains('hid')")
    chk('H hides and shows the panel',h and not h2,(h,h2))
    pg.click('#kqpv .b-cp');pg.wait_for_timeout(300);m=ev("()=>document.querySelector('#kqpv .msg').textContent");chk('copy time shows the time',m.find('t = 15.00')>=0,m)
    pg.click('#kqpv .b-snd');ok=wait(pg,"()=>!!KQPV.buf||!!KQPV.sndErr",120000);d=ev("()=>KQPV.buf?KQPV.buf.duration:KQPV.sndErr")
    chk('sound made from the score',ok and isinstance(d,(int,float)) and d>129,d)
    e=ev("()=>IC151.err||''");chk('no frame errors',not e,e[:400])
    # the hero picker: a Mage with the second starter companion (the page reloads with them)
    sp=ev("()=>STARTERS[1]")
    with pg.expect_navigation(timeout=60000):pg.select_option('#kqpv .b-cls','mage')
    ok,err=ready(pg)
    if ok:
        with pg.expect_navigation(timeout=60000):ev("s=>{const e=document.querySelector('#kqpv .b-com');e.value=s;e.dispatchEvent(new Event('change'))}",sp)
        ok,err=ready(pg)
    st=ev("()=>({cls:hero.cls,sp:party[0]&&party[0].n,t:KQPV.t})") if ok else {}
    print('picked',st,sp);chk('the hero and companion picked are used',ok and st['cls']=='mage' and st['sp']==sp,(st,sp,err[:200]))
    chk('it comes back at the same time',ok and abs(st['t']-15)<.01,st)
    ev("()=>kqpvGo(64,true)");settle(pg);pg.wait_for_timeout(800);pg.screenshot(path=play.TMP+'/v159_prev_mage.jpg',type='jpeg',timeout=120000)
play.run(s,w=1100,hh=650)
if FAIL:print('FAILED',FAIL)
