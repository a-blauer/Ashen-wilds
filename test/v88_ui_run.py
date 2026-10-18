# play.run with longer timeouts (the v88 tracks run browsers side by side, so page loads can be slow)
import os,play
from playwright.sync_api import sync_playwright
def run(steps,w=1100,hh=680):
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
        pg=b.new_page(viewport={'width':w,'height':hh});pg.set_default_timeout(240000)
        logs=[];pg.on('pageerror',lambda e:logs.append('PAGEERROR: '+str(e)))
        if not os.environ.get('TITLE'):pg.add_init_script('window.AW_NOTITLE=1')
        pg.goto('file://'+play.TMP+'/live.html',wait_until='domcontentloaded',timeout=600000);pg.wait_for_timeout(4500)
        steps(pg);print("\n".join(logs[:20]));b.close()
