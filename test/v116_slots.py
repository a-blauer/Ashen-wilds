# v116: three character slots on the title screen — new hero in slot 2, another in slot 1, continue either, switch from
# the in-game main menu (reload into the other slot), delete one, an old single save shows as slot 1, and the join window
# (pick a slot, paste a save code into it, Join → that hero loads and the join is attempted).
import re,json,subprocess,time,os,sys
HERE=os.path.dirname(os.path.abspath(__file__));os.makedirs(HERE+'/out',exist_ok=True)
from playwright.sync_api import sync_playwright
h=open(os.environ.get('SRC',os.path.join(HERE,'..','dist','ashen-wilds.html'))).read()
h=h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/vendor/three.min.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','/vendor/GLTFLoader.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js','/vendor/SkeletonUtils.js')
h=re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>','',h)
open(HERE+'/out/v116sl.html','w').write(h)
srv=subprocess.Popen(['python3','-m','http.server','8767','--directory',HERE],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
FAIL=[]
def check(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+('  '+str(info) if info else ''))
    if not ok:FAIL.append(name)
def until(pg,js,t=60):
    t0=time.time()
    while time.time()-t0<t:
        try:
            if pg.evaluate(js):return True
        except Exception:pass
        pg.wait_for_timeout(500)
    return False
URL='http://127.0.0.1:8767/out/v116sl.html'
def load(pg,first=False):
    if first:pg.goto(URL,wait_until='commit',timeout=60000)
    else:pg.reload(wait_until='commit',timeout=60000)
    pg.wait_for_function('document.readyState=="complete"',timeout=180000);pg.wait_for_timeout(1200)
def create(pg,cls,name):
    if pg.evaluate("()=>!document.getElementById('devp').classList.contains('hide')"):pg.click('[data-dev=desktop]',force=True,timeout=90000)
    pg.wait_for_timeout(800);pg.evaluate("c=>document.querySelector('[data-c=\"'+c+'\"]').click()",cls);pg.wait_for_timeout(500)
    for _ in range(5):
        if pg.evaluate("()=>party.length>0"):break
        pg.evaluate("n=>{if($('ccName'))$('ccName').value=n;$('ccNext').click()}",name);pg.wait_for_timeout(1500)
    pg.wait_for_function('party.length>0',timeout=120000);pg.wait_for_timeout(1500);pg.evaluate("()=>{ren.render=()=>{};POST.render=()=>{};saveGame(true)}")
slot=lambda pg,i:pg.evaluate("i=>{const s=localStorage.getItem(KQSL.keys[i]);return s?JSON.parse(s).hero.name:null}",i)
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--no-proxy-server'])
    ctx=b.new_context(viewport={'width':1000,'height':620});pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)+' || '+(e.stack or '')[:400].replace('\n',' ')))
    load(pg,True);pg.evaluate("()=>localStorage.clear()");load(pg)
    check('title lists three empty slots + join',pg.evaluate("()=>document.querySelectorAll('#awT [data-slot][data-aw=new]').length==3&&!!document.querySelector('#awT [data-aw=join]')"))
    pg.screenshot(path=HERE+'/out/v116_title_empty.png',timeout=120000)
    pg.click('#awT [data-slot="1"]',force=True);pg.wait_for_timeout(1500);create(pg,'warrior','Two')
    check('new hero saved in slot 2 only',slot(pg,1)=='Two' and slot(pg,0) is None and pg.evaluate("()=>localStorage.getItem('kq_slot')")=='1')
    load(pg)
    check('title shows slot 2 hero, current',pg.evaluate("()=>{const b=document.querySelector('#awT [data-slot=\"1\"]');return b.dataset.aw=='cont'&&b.classList.contains('p')&&b.textContent.includes('Two')}"))
    pg.click('#awT [data-slot="0"]',force=True);pg.wait_for_timeout(1500);create(pg,'mage','One')
    check('second hero in slot 1, slot 2 kept',slot(pg,0)=='One' and slot(pg,1)=='Two')
    load(pg)
    pg.screenshot(path=HERE+'/out/v116_title_two.png',timeout=120000)
    pg.click('#awT [data-slot="1"]',force=True)
    check('continue slot 2 loads Two',until(pg,"()=>party.length>0&&hero.name=='Two'&&hero.cls=='warrior'&&KQSL.n==1"))
    # in-game main menu → the other slot → reload → continue there
    pg.evaluate("()=>{ren.render=()=>{};POST.render=()=>{};kqMenuAsk();kqMenuGo()}");pg.wait_for_timeout(1500)
    check('menu title marks the hero playing now (no delete)',pg.evaluate("()=>{const b=document.querySelector('#awT [data-slot=\"1\"]');return b&&b.textContent.includes('playing now')&&!document.querySelector('#awT [data-sld=\"1\"]')}"))
    pg.click('#awT [data-slot="0"]',force=True)
    pg.wait_for_timeout(2500);pg.wait_for_function('document.readyState=="complete"',timeout=180000)
    check('switched to slot 1 after reload',until(pg,"()=>party.length>0&&hero.name=='One'&&KQSL.n==0",90))
    check('slot 2 untouched by the switch',slot(pg,1)=='Two')
    # an old single save (pre-v116 key) is slot 1; delete slot 1 from the title
    load(pg)
    pg.click('#awT [data-sld="0"]',force=True);pg.wait_for_timeout(300);pg.click('#awT [data-sld="0"]',force=True);pg.wait_for_timeout(300)
    check('delete needs two taps and clears only slot 1',slot(pg,0) is None and slot(pg,1)=='Two' and pg.evaluate("()=>document.querySelector('#awT [data-slot=\"0\"]').dataset.aw=='new'"))
    # join window: paste Two's save code into slot 3, Join
    code=pg.evaluate("()=>KQSX.pre+btoa(unescape(encodeURIComponent(localStorage.getItem(KQSL.keys[1]))))")
    pg.click('#awT [data-aw=join]',force=True);pg.wait_for_timeout(500)
    check('join window lists three slots',pg.evaluate("()=>!$('kqj').classList.contains('hide')&&document.querySelectorAll('#kqjSl [data-kqjs]').length==3"))
    pg.click('#kqjSl [data-kqjs="2"]',force=True);pg.evaluate("c=>{const d=$('kqjImp');d.open=true;const a=$('kqjA');a.value=c;a.dispatchEvent(new Event('input'))}",code)
    check('save code recognised for slot 3',pg.evaluate("()=>/Found Two/.test($('kqjAM').textContent)&&/Slot 3/.test($('kqjAM').textContent)"))
    pg.fill('#kqjCode','abc-def');check('code field cleans input',pg.evaluate("()=>$('kqjCode').value=='ABCDEF'"))
    pg.screenshot(path=HERE+'/out/v116_join.png',timeout=120000)
    pg.click('#kqjGo',force=True)
    check('imported hero loads from slot 3',until(pg,"()=>party.length>0&&hero.name=='Two'&&KQSL.n==2",90))
    check('slot 3 now holds the import',slot(pg,2)=='Two')
    check('join attempted once in the world',until(pg,"()=>!KQN.pend&&(KQN.busy||KQN.cur||KQN.msg)",30),pg.evaluate("()=>[KQN.busy,KQN.msg]"))
    check('no page errors',not errs,errs[:3])
    b.close()
finally:
    srv.kill()
print('RESULT',('FAIL '+', '.join(FAIL)) if FAIL else 'ALL PASS')
