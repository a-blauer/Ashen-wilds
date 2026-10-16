import re,json,subprocess,time,os,sys
HERE=os.path.dirname(os.path.abspath(__file__));os.makedirs(HERE+'/out',exist_ok=True)
from playwright.sync_api import sync_playwright
h=open(os.environ.get('AW_OUT',os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dist','ashen-wilds.html'))).read()
h=h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/vendor/three.min.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','/vendor/GLTFLoader.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js','/vendor/SkeletonUtils.js')
h=re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>','',h)
open(HERE+'/out/mp.html','w').write(h)
srv=subprocess.Popen(['python3','-m','http.server','8765','--directory',HERE],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
FAKE=open(HERE+'/fakeroom.js').read()
def setup(pg,cls,name):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="%s"]'%cls,timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{hero.name='%s';window.FAST=()=>{window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}}"%name)
try:
  with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--no-proxy-server'])
    ctx=b.new_context(viewport={'width':1000,'height':620})
    ctx.add_init_script(FAKE)
    logs={'A':[],'B':[]}
    pgs={}
    for k in 'AB':
        pg=ctx.new_page();pgs[k]=pg
        pg.on('console',lambda m,k=k:logs[k].append(m.type+': '+m.text))
        pg.on('pageerror',lambda e,k=k:logs[k].append('PAGEERROR: '+str(e)+' || '+(e.stack or '')[:600].replace('\n',' ')))
        pg.goto('http://127.0.0.1:8765/out/mp.html',wait_until='commit',timeout=60000);pg.wait_for_function('document.readyState=="complete"',timeout=120000);pg.wait_for_timeout(1500)
        pg.evaluate("()=>{window.__rr=ren.render.bind(ren);window.__pr=POST.render;ren.render=()=>{};POST.render=()=>{}}")
    A,B=pgs['A'],pgs['B']
    setup(A,'warrior','Aria');setup(B,'mage','Bram')
    exec(open(sys.argv[1] if len(sys.argv)>1 else HERE+'/mpsteps.py').read())
    for k in 'AB':
        print('--',k,'logs');print("\n".join([l for l in logs[k] if 'fishing' not in l and 'GPU stall' not in l][:25]))
    b.close()
finally:
    srv.kill()
