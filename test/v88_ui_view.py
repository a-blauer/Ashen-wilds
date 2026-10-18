# v88 UI: render saved snapshots (v88_ui_snap.py) with the CURRENT theme/icon modules — fast CSS iteration, no game loop.
#   AW_TMP=<dir with snap_*.html> [BG=<png for the 3D view>] [MOB=1] python3 v88_ui_view.py hud bag set ...  -> <dir>/view_<name>.png
import os,sys,re
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__));M=HERE+'/../src/modules/'
O=os.environ.get('AW_TMP',HERE+'/out');BG=os.environ.get('BG')
icons=open(M+'zzM_uiicons.js').read();theme=open(M+'zzM_ui.js').read()
fix="for(const e of document.querySelectorAll('.kqi')){const m=/kqi-(\\w+)/.exec(e.className);if(m)kqUse(m[1])}"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None)
    for n in sys.argv[1:]:
        h=open(O+'/snap_%s.html'%n).read()
        h=re.sub(r'<style id="(kqUiCss|kqiCss)">.*?</style>','',h,flags=re.S)
        h=re.sub(r'<link[^>]*fonts.googleapis[^>]*>','',h)
        bg=('#gl{background:url(file://%s) center/cover}'%BG) if BG else ''
        h=h.replace('</body>','<style>%s</style><script>%s\n%s\n%s\n%s</script></body>'%(bg,icons,theme,fix,"document.body.classList.toggle('mob',%s)"%('true' if os.environ.get('MOB') else 'document.body.classList.contains("mob")')))
        open(O+'/viewtmp.html','w').write(h)
        pg=b.new_page(viewport={'width':int(os.environ.get('VW','1100')),'height':int(os.environ.get('VH','680'))});errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+O+'/viewtmp.html');pg.wait_for_timeout(900)
        pg.screenshot(path=O+'/view_%s.png'%n);print('view',n,errs[:3]);pg.close()
    b.close()
