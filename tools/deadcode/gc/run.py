import sys,json,os,re
from playwright.sync_api import sync_playwright
T=''+os.path.dirname(os.path.abspath(__file__))+'/../../../test';VEND=T+'/vendor'
h=open(sys.argv[1]).read()
h=h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','file://'+VEND+'/three.min.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','file://'+VEND+'/GLTFLoader.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js','file://'+VEND+'/SkeletonUtils.js')
h=re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>','',h)
open('/tmp/kq_gc_live.html','w').write(h)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files','--js-flags=--expose-gc'])
    pg=b.new_page(viewport={'width':820,'height':520})
    errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    if not os.environ.get('TITLE'):pg.add_init_script('window.AW_NOTITLE=1')
    pg.goto('file:///tmp/kq_gc_live.html',wait_until='domcontentloaded',timeout=300000);pg.wait_for_timeout(8000)
    for i in range(4):
        pg.evaluate('gc()');pg.wait_for_timeout(500)
    r=pg.evaluate('({alive:Object.keys(__W).filter(k=>__W[k].deref()),reg:Object.keys(__W).length,regk:Object.keys(__W),called:Object.keys(__C)})')
    json.dump(r,open(sys.argv[2],'w'));print('reg',r['reg'],'alive',len(r['alive']),'called',len(r['called']),'errs',errs[:5])
    b.close()
