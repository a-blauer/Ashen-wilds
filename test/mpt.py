# Two game windows in one browser over a fake claude.ai room (fakeroom.js), then runs a steps file with A, B (the pages) in scope.
#   python3 mpt.py <steps.py>       (the co-op tests run themselves through this)
#   SLOW=4 python3 mpt.py ...       slows both windows' CPU 4x (Chrome's CPU throttling), to try a test the way a slow machine runs it
# Steadiness (Oct 27 2026): the windows start one after the other and only go on once each has its hero in the world; the steps
# start only once both windows see each other in the room. Steps files can use these helpers (they wait for a condition instead of a
# fixed time: on a slow machine the game runs fewer frames per second, and its game time (at most 0.05 s per frame) falls behind):
#   mp_until(js, ms, pgs)  -> True once js is true on every page in pgs (default both), polling; False after ms
#   mp_roles(ms)           -> (H, G): waits until both are in the same instance, see each other and agree on its host
#   mp_fps()               -> game frames per second of each window, measured over ~2 s (for FAIL messages)
import re,json,subprocess,time,os,sys,socket
HERE=os.path.dirname(os.path.abspath(__file__));os.makedirs(HERE+'/out',exist_ok=True)
from playwright.sync_api import sync_playwright
h=open(os.environ.get('AW_OUT',os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dist','ashen-wilds.html'))).read()
h=h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/vendor/three.min.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','/vendor/GLTFLoader.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js','/vendor/SkeletonUtils.js')
h=re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>','',h)
open(HERE+'/out/mp.html','w').write(h)
srv=subprocess.Popen(['python3','-m','http.server','8765','--directory',HERE],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
for _ in range(100):   # wait for the web server (a fixed 1 s was not always enough on a busy machine)
    try:socket.create_connection(('127.0.0.1',8765),timeout=1).close();break
    except OSError:time.sleep(.2)
FAKE=open(HERE+'/fakeroom.js').read()
def setup(pg,cls,name):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);ev("()=>{const d=document.getElementById('svp');if(d)d.classList.add('hide')}");pg.click('[data-c="%s"]'%cls,timeout=60000);pg.click('#ccNext')
    pg.wait_for_function("()=>typeof ccStep!='undefined'&&ccStep==1||typeof party!='undefined'&&party.length>0",timeout=60000);pg.wait_for_timeout(300)
    if not pg.evaluate("()=>party.length>0"):pg.click('#ccNext')
    pg.wait_for_function("()=>party.length>0&&typeof hero!='undefined'&&hero.hp>0",timeout=120000);pg.wait_for_timeout(1500)
    ev("()=>{hero.name='%s';MP.lastPres='';window.FAST=()=>{window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}}"%name)
def mp_until(js,ms=30000,pgs=None,arg=None,step=300):
    t0=time.time()
    while True:
        try:
            if all((p.evaluate(js,arg) if arg is not None else p.evaluate(js)) for p in (pgs or (A,B))):return True
        except Exception as e:
            if 'Target' in str(e) and 'closed' in str(e):raise
        if (time.time()-t0)*1000>=ms:return False
        A.wait_for_timeout(step)
def mp_roles(ms=60000):
    """Both in the same instance (rg >= 0), each seeing the other there, and agreeing who hosts it -> (host page, guest page)."""
    mp_until("()=>MP.on&&MP.rg>=0&&MP.others>=1&&!!MP.host",ms)
    t0=time.time()
    while (time.time()-t0)*1000<ms:
        a=A.evaluate("()=>[MP.rg,MP.host,MP.me,MP.others]");b=B.evaluate("()=>[MP.rg,MP.host,MP.me,MP.others]")
        if a[0]==b[0]>=0 and a[1]==b[1] and a[1] in (a[2],b[2]) and a[3]>=1 and b[3]>=1:break
        A.wait_for_timeout(300)
    return (A,B) if A.evaluate("()=>MP.host===MP.me") else (B,A)
def mp_fps():
    for p in (A,B):p.evaluate("()=>{if(!window.__fpsW){window.__fpsW=1;window.__fpsN=0;const f=homeTick;homeTick=function(){__fpsN++;return f.apply(this,arguments)}}window.__fps0=[__fpsN,performance.now()]}")
    A.wait_for_timeout(2000)
    return [p.evaluate("()=>Math.round(10000*(__fpsN-__fps0[0])/(performance.now()-__fps0[1]))/10") for p in (A,B)]
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--no-proxy-server'])
    ctx=b.new_context(viewport={'width':1000,'height':620})
    ctx.add_init_script(FAKE)
    logs={'A':[],'B':[]}
    pgs={}
    for k in 'AB':
        pg=ctx.new_page();pgs[k]=pg;pg.add_init_script('window.AW_NOTITLE=1')
        pg.on('console',lambda m,k=k:logs[k].append(m.type+': '+m.text))
        pg.on('pageerror',lambda e,k=k:logs[k].append('PAGEERROR: '+str(e)+' || '+(e.stack or '')[:600].replace('\n',' ')))
        if os.environ.get('SLOW'):ctx.new_cdp_session(pg).send('Emulation.setCPUThrottlingRate',{'rate':float(os.environ['SLOW'])})
        pg.goto('http://127.0.0.1:8765/out/mp.html',wait_until='commit',timeout=120000);pg.wait_for_function('document.readyState=="complete"',timeout=180000)
        pg.wait_for_function("()=>typeof ren!='undefined'&&!!ren.render&&typeof POST!='undefined'&&!!document.querySelector('[data-dev=desktop]')",timeout=120000);pg.wait_for_timeout(1500)
        pg.evaluate("()=>{window.__rr=ren.render.bind(ren);window.__pr=POST.render;ren.render=()=>{};POST.render=()=>{}}")
    A,B=pgs['A'],pgs['B']
    setup(A,'warrior','Aria');setup(B,'mage','Bram')
    # the room: both windows must see each other before the steps start (presence goes out every 125 ms of game loop)
    if not mp_until("()=>MP.on&&Object.keys(MP.rh).length>=1&&Object.values(MP.rh).every(r=>r.pr&&typeof r.pr.x=='number')",90000):
        print('FAIL co-op room: the two windows do not see each other',json.dumps([pg.evaluate("()=>[MP.on,MP.me,Object.keys(MP.rh)]") for pg in (A,B)]))
    print('mpt: both windows in the room; game fps',mp_fps(),flush=True)
    exec(open(sys.argv[1] if len(sys.argv)>1 else HERE+'/mpsteps.py').read())
    for k in 'AB':
        print('--',k,'logs');print("\n".join([l for l in logs[k] if 'fishing' not in l and 'GPU stall' not in l][:25]))
    b.close()
finally:
    srv.kill()
