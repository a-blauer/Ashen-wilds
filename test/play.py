import sys,re,json,time
from playwright.sync_api import sync_playwright
import os
HERE=os.path.dirname(os.path.abspath(__file__));VEND=HERE+'/vendor';TMP=os.environ.get('AW_TMP',HERE+'/out');os.makedirs(TMP,exist_ok=True)
SRC=os.environ.get('SRC',os.environ.get('AW_OUT',os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dist','ashen-wilds.html')))
h=open(SRC).read()
h=h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','file://'+VEND+'/three.min.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','file://'+VEND+'/GLTFLoader.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js','file://'+VEND+'/SkeletonUtils.js')
h=re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>','',h)
import os
CAMH=os.environ.get('CAMH');CAMZ=os.environ.get('CAMZ')
open(TMP+'/live.html','w').write(h)
def run(steps,out_prefix=TMP+'/g',w=820,hh=520):
    with sync_playwright() as p:
        b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
        pg=b.new_page(viewport={'width':w,'height':hh})
        logs=[]
        pg.on('console',lambda m:logs.append(m.type+': '+m.text))
        pg.on('pageerror',lambda e:logs.append('PAGEERROR: '+str(e)+' || '+(e.stack or '')[:500].replace('\n',' ')))
        if not os.environ.get('TITLE'):pg.add_init_script('window.AW_NOTITLE=1')
        pg.goto('file://'+TMP+'/live.html',wait_until='domcontentloaded',timeout=120000);pg.wait_for_timeout(3000)
        pg.wait_for_timeout(1500)
        steps(pg)
        open(TMP+'/lastlogs.txt',"w").write("\n".join(logs));print("\n".join([l for l in logs if "fishing" not in l][:30]))
        b.close()
if __name__=='__main__':
    def s(pg):
        pg.click('#starters button')
        pg.wait_for_timeout(2500)
        pg.locator('#stage').screenshot(path=TMP+'/g_start.png')
    run(s)
