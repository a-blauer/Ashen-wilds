# shared runner for limbs_* tests: like play.run but with its own live file (limbs_live.html)
import os,re
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__));VEND=HERE+'/vendor';TMP=HERE+'/out/limbs';os.makedirs(TMP,exist_ok=True)
SRC=os.environ.get('SRC',os.path.join(HERE,'..','dist','ashen-wilds.html'))
def run(steps,w=1280,hh=860):
    h=open(SRC).read()
    h=h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','file://'+VEND+'/three.min.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','file://'+VEND+'/GLTFLoader.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js','file://'+VEND+'/SkeletonUtils.js')
    h=re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>','',h)
    open(TMP+'/limbs_live.html','w').write(h)
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
        pg=b.new_page(viewport={'width':w,'height':hh})
        logs=[]
        pg.on('console',lambda m:logs.append(m.type+': '+m.text))
        pg.on('pageerror',lambda e:logs.append('PAGEERROR: '+str(e)))
        pg.add_init_script('window.AW_NOTITLE=1')
        pg.goto('file://'+TMP+'/limbs_live.html',wait_until='domcontentloaded',timeout=120000);pg.wait_for_timeout(4000)
        try: steps(pg)
        finally:
            print("\n".join([l for l in logs if 'error' in l.lower()][:30]))
            b.close()
def start(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{ren.render=()=>{};if(window.POST)POST.render=()=>{}}")
