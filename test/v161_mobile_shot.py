# v161: screenshots of the game HUD at phone and desktop sizes (portrait + landscape), to check UI sizing.
# Usage: python3 v161_mobile_shot.py [tag]   -> out/v161_<tag>_<size>.png
# SIZES=pp,pl,tp,tl,dk  (phone portrait / landscape, tablet portrait / landscape, desktop)
# Prints FAIL lines when a HUD element sits off screen or two key controls overlap.
import sys,os,json
import play
from playwright.sync_api import sync_playwright
TAG=sys.argv[1] if len(sys.argv)>1 else 'cur'
SZ={'pp':(390,844,'mobile'),'cp':(352,615,'mobile'),'cs':(412,720,'mobile'),'pl':(844,390,'mobile'),'sp':(360,640,'mobile'),'sl':(640,360,'mobile'),'tp':(820,1180,'mobile'),'tl':(1180,820,'mobile'),'dk':(1280,760,'desktop')}
want=os.environ.get('SIZES','pp,pl,sl,dk').split(',')
CHECK=open(os.path.join(play.HERE,'v161_layout.js')).read()
# WRAP=1 (v163): load the page the way claude.ai serves it, wrapped inside an outer page's <body> (so the page's own <head>,
# stylesheet included, lands in that <body>), to catch layout that only breaks on the live site
PAGE='live.html'
if os.environ.get('WRAP'):
    W0='<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box}body{margin:0;padding:0;font:14px sans-serif;background:#fff;color:#000}</style></head><body>\n'
    open(play.TMP+'/live_wrap.html','w').write(W0+open(play.TMP+'/live.html').read()+'\n</body></html>');PAGE='live_wrap.html'
fails=0
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    for k in want:
        w,h,dev=SZ[k]
        ctx=b.new_context(viewport={'width':w,'height':h},has_touch=(dev=='mobile'),is_mobile=(dev=='mobile'))
        pg=ctx.new_page();logs=[]
        pg.on('pageerror',lambda e:logs.append('PAGEERROR: '+str(e)))
        pg.add_init_script('window.AW_NOTITLE=1')
        if os.environ.get('INIT'):pg.add_init_script(os.environ['INIT'])
        pg.goto('file://'+play.TMP+'/'+PAGE,wait_until='domcontentloaded',timeout=120000);pg.wait_for_timeout(4000)
        pg.set_default_timeout(600000)
        pg.click('[data-dev=%s]'%dev,timeout=60000)
        pg.evaluate("()=>{try{if(document.fullscreenElement)document.exitFullscreen()}catch(_){}}")
        pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(int(os.environ.get('WAIT','9000')))
        if dev=='mobile':
            try:pg.wait_for_function("getComputedStyle(document.getElementById('mctl')).display!='none'",timeout=90000)
            except Exception as ex:print(k,'touch controls never showed')
        if os.environ.get('JS'):print(k,'JS',json.dumps(pg.evaluate(os.environ['JS'])))
        r=pg.evaluate(CHECK)
        for f in r['fail']:print('FAIL',k,f);fails+=1
        print(k,'OK' if not r['fail'] else '', json.dumps(r['info'])[:600])
        pg.wait_for_timeout(500);pg.screenshot(path=play.TMP+'/v161_%s_%s.png'%(TAG,k),timeout=600000,animations='disabled')
        for l in logs:print(k,l);fails+=1
        ctx.close()
    b.close()
print('DONE fails=%d'%fails)
