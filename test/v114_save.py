# v114: export / import of the saved game (Settings and title-screen buttons), and the split publish build
# (dist/artifact/index.html + game.js) boots like the single file.
import os,sys,re,json,shutil
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__));FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,str(info)[:300],flush=True)
    if not ok:FAIL.append(n)
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    chk('import button on the layout picker',ev("()=>!!document.getElementById('kqsxI2')"))
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="paladin"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{hero.name='Brock';hero.look={race:4,skin:BRD[4].fur[0],eye:BRD[4].eye[0]};refreshGear();gold=1234;saveGame(true)}")
    ev("()=>{openSet()}");pg.wait_for_timeout(300)
    chk('settings has Export / Import',ev("()=>!!document.getElementById('kqsxE')&&!!document.getElementById('kqsxI')"))
    pg.click('#kqsxE');pg.wait_for_timeout(300)
    code=ev("()=>document.getElementById('kqsxA').value")
    chk('export code',code.startswith('KQSAVE1:') and len(code)>200,len(code))
    chk('code decodes to the hero',ev("(c)=>{const s=kqsxDecode(c);return s&&s.hero.name=='Brock'&&s.gold==1234&&s.hero.cls=='paladin'}",code))
    pg.click('#kqsxClose');ev("()=>$('setw').classList.add('hide')")
    # wipe the save, import the code from the title screen, reload → Continue offers Brock
    ev("()=>{deleteSave();localStorage.removeItem(SAVE_KEY)}")
    chk('save gone',ev("()=>!saveInfo()"))
    ev("(c)=>{kqsxOpen('import');const A=$('kqsxA');A.value=c;A.oninput()}",code);pg.wait_for_timeout(200)
    chk('import recognises the code',ev("()=>/Brock/.test($('kqsxM').textContent)"),ev("()=>$('kqsxM').textContent"))
    # the game's 30 s autosave may have written the hero back since the wipe; wipe again so Import reloads at once (no 'Tap again')
    ev("()=>{deleteSave();localStorage.removeItem(SAVE_KEY)}")
    with pg.expect_navigation(timeout=600000):pg.click('#kqsxGo')
    pg.wait_for_function("()=>typeof saveInfo=='function'&&!!document.getElementById('devp')",timeout=180000);pg.wait_for_timeout(3000)
    st=ev("()=>({has:!!saveInfo(),name:saveInfo()&&saveInfo().hero.name})")
    chk('imported; the page reloaded with the save',st['has'] and st['name']=='Brock',st)
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(800)
    chk('Welcome back offers Brock and Export/Import',ev("()=>!$('svp').classList.contains('hide')&&/Brock/.test($('svpI').textContent)&&!!$('kqsxE3')"))
    pg.click('#svpC');pg.wait_for_timeout(5000)
    chk('continued as the badger',ev("()=>hero.name=='Brock'&&pl._race==4"))
    chk('bad code refused',ev("()=>kqsxDecode('hello there')===null&&kqsxDecode('{\"x\":1}')===null"))
    chk('no page errors',len(errs)==0,errs[:3])
play.run(s,w=900,hh=600)
# ---- the split build boots ----
art=os.path.join(HERE,'..','dist','artifact');T=play.TMP+'/art';os.makedirs(T,exist_ok=True)
for f in ('index.html','game.js'):
    h=open(os.path.join(art,f),encoding='utf-8').read()
    h=h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','file://'+play.VEND+'/three.min.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','file://'+play.VEND+'/GLTFLoader.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js','file://'+play.VEND+'/SkeletonUtils.js')
    h=re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>','',h)
    open(os.path.join(T,f),'w',encoding='utf-8').write(h)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':900,'height':600});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.add_init_script('window.AW_NOTITLE=1')
    pg.goto('file://'+T+'/index.html',wait_until='load',timeout=180000);pg.wait_for_timeout(6000)
    r=pg.evaluate("()=>({cls:typeof CLS,brd:typeof BRD,sx:typeof kqsxOpen,devp:!!document.getElementById('devp')})")
    chk('split build (index.html + game.js) boots',r['cls']=='object' and r['brd']=='object' and r['sx']=='function' and r['devp'],r)
    chk('split build: no page errors',len(errs)==0,errs[:3])
    b.close()
print('FAILURES:',FAIL if FAIL else 'none')
