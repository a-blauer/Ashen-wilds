# v116: join-code co-op over real WebRTC (fake signaling server, fakesig.js): host gets a code, a wrong code fails cleanly,
# a joiner connects, both see each other, monsters are shared (one runs them, the other mirrors), chat, a trade, a third
# player, a joiner leaving, and the host stopping (everyone left goes back to solo and owns their monsters again).
import re,json,subprocess,time,os,sys
HERE=os.path.dirname(os.path.abspath(__file__));os.makedirs(HERE+'/out',exist_ok=True)
from playwright.sync_api import sync_playwright
h=open(os.environ.get('SRC',os.path.join(HERE,'..','dist','ashen-wilds.html'))).read()
h=h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/vendor/three.min.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','/vendor/GLTFLoader.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js','/vendor/SkeletonUtils.js')
h=re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>','',h)
open(HERE+'/out/v116mp.html','w').write(h)
srv=subprocess.Popen(['python3','-m','http.server','8766','--directory',HERE],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
FAKE=open(HERE+'/fakesig.js').read()
FAIL=[]
def check(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+('  '+str(info) if info else ''));
    if not ok:FAIL.append(name)
def setup(pg,cls,name):
    ev=pg.evaluate
    pg.wait_for_function("()=>!!document.querySelector('[data-dev=desktop]')",timeout=120000)
    ev("()=>{document.querySelector('[data-dev=desktop]').click();const d=document.getElementById('svp');if(d)d.classList.add('hide')}");pg.wait_for_timeout(800)
    ev("c=>document.querySelector('[data-c=\"'+c+'\"]').click()",cls);pg.wait_for_timeout(500)
    ev("()=>$('ccNext').click()");pg.wait_for_timeout(1200);ev("()=>{if(!party.length)$('ccNext').click()}")
    pg.wait_for_function('party.length>0',timeout=120000);pg.wait_for_timeout(1500)
    ev("()=>{hero.name='%s';ren.render=()=>{};POST.render=()=>{};requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}"%name)
def until(pg,js,t=30):
    t0=time.time()
    while time.time()-t0<t:
        try:
            if pg.evaluate(js):return True
        except Exception as e:pass
        pg.wait_for_timeout(500)
    return False
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--no-proxy-server'])
    ctx=b.new_context(viewport={'width':1000,'height':620})
    ctx.add_init_script(FAKE)
    logs={};pgs={}
    for k in 'ABC':
        pg=ctx.new_page();pgs[k]=pg;logs[k]=[];pg.add_init_script('window.AW_NOTITLE=1')
        pg.on('pageerror',lambda e,k=k:logs[k].append('PAGEERROR: '+str(e)+' || '+(e.stack or '')[:500].replace('\n',' ')))
        pg.goto('http://127.0.0.1:8766/out/v116mp.html',wait_until='commit',timeout=60000);pg.wait_for_function('document.readyState=="complete"',timeout=180000);pg.wait_for_timeout(1500)
        if k=='A':pg.evaluate("()=>localStorage.clear()")
    A,B,C=pgs['A'],pgs['B'],pgs['C']
    setup(A,'warrior','Aria');setup(B,'mage','Bram');setup(C,'ranger','Cael')
    check('solo at start (no claude room here)',A.evaluate("()=>!MP.on&&!KQN.cur"))
    # host
    A.evaluate("()=>{openX('coop');document.querySelector('[data-kqc=host]').click()}")
    check('host gets a code',until(A,"()=>KQN.cur&&KQN.cur.host&&/^[A-Z2-9]{6}$/.test(KQN.cur.code)",20))
    code=A.evaluate("()=>KQN.cur.code");print('code',code)
    check('co-op window shows the code',A.evaluate("c=>document.querySelector('#xwB .kqc .big').textContent===c",code))
    A.screenshot(path=HERE+'/out/v116_host.png',timeout=120000,animations='disabled')
    # wrong code
    B.evaluate("()=>kqcJoin('ZZZZZZ')")
    check('a wrong code fails cleanly',until(B,"()=>!KQN.busy&&!KQN.cur&&/No game found/.test(KQN.msg||'')",30),B.evaluate("()=>KQN.msg"))
    # join from the co-op window
    B.evaluate("c=>{openX('coop');document.getElementById('kqcIn').value=c;document.querySelector('[data-kqc=join]').click()}",code)
    check('joiner connects',until(B,"()=>KQN.cur&&!KQN.cur.host&&MP.on",30),B.evaluate("()=>KQN.msg"))
    check('host sees the joiner',until(A,"()=>Object.values(MP.rh).some(r=>r.pr&&r.pr.n=='Bram')",20))
    check('joiner sees the host',until(B,"()=>Object.values(MP.rh).some(r=>r.pr&&r.pr.n=='Aria')",20))
    # same field instance: monsters are shared
    for pg in (A,B): pg.evaluate("()=>{const p=PMAP[0].ins[0].path[60];toPos(p[0]+(hero.cls=='mage'?2.2:0),p[1]+(hero.cls=='mage'?1:0))}")
    ok=until(A,"()=>MP.others>0",30) and until(B,"()=>MP.others>0",30)
    check('both in the same instance',ok)
    hA=A.evaluate("()=>MP.host===MP.me");hB=B.evaluate("()=>MP.host===MP.me")
    check('exactly one runs the monsters',hA!=hB,(hA,hB))
    other=B if hA else A
    check('the other mirrors them',until(other,"()=>enemies.some(e=>e.mir)",40),other.evaluate("()=>enemies.filter(e=>e.mir).length"))
    # chat
    B.evaluate("()=>MP.room.emit('chat',{m:'ready for the bog?'})")
    check('chat arrives',until(A,"()=>MP.chat.some(l=>l.includes('ready for the bog?'))",15))
    # trade: Bram gives Aria 250 gold
    B.evaluate("()=>{gold=400}");g0=A.evaluate("()=>gold")
    A.evaluate("()=>{closeX();mpTradeInvite(Object.keys(MP.rh)[0])}")
    check('trade request arrives',until(B,"()=>!!document.getElementById('mpAcc')",15))
    B.evaluate("()=>$('mpAcc').click()")
    check('trade window opens',until(A,"()=>xwMode=='trade'",15) and until(B,"()=>xwMode=='trade'",15))
    B.evaluate("()=>{const i=$('mpGold');i.value=250;i.dispatchEvent(new Event('change',{bubbles:true}))}")
    until(A,"()=>MP.tr&&MP.tr.th.gold==250",15)
    A.evaluate("()=>$('mpRdy').click()");A.wait_for_timeout(600);B.evaluate("()=>$('mpRdy').click()")
    check('trade completes',until(A,"()=>gold==%d"%(g0+250),20),(A.evaluate("()=>gold"),B.evaluate("()=>gold")))
    check('gold left the giver',until(B,"()=>gold==150",15))
    # a third player
    C.evaluate("c=>kqcJoin(c)",code)
    check('third player joins',until(C,"()=>KQN.cur&&Object.keys(MP.rh).length==2",30))
    check('host counts three',until(A,"()=>KQN.cur.room.count()==3",15))
    check('joiner sees the third',until(B,"()=>Object.values(MP.rh).some(r=>r.pr&&r.pr.n=='Cael')",20))
    # B leaves
    B.evaluate("()=>{openX('coop');document.querySelector('[data-kqc=leave]').click()}")
    check('leaver is solo',until(B,"()=>!MP.on&&!KQN.cur&&!enemies.some(e=>e.mir)",15))
    check('host drops the leaver',until(A,"()=>!Object.values(MP.rh).some(r=>r.pr&&r.pr.n=='Bram')",20))
    check('third drops the leaver',until(C,"()=>!Object.values(MP.rh).some(r=>r.pr&&r.pr.n=='Bram')",20))
    # host stops
    A.evaluate("()=>kqcLeave()")
    check('game ends for the rest',until(C,"()=>!KQN.cur&&!MP.on&&/host left/.test(KQN.msg||'')",30),C.evaluate("()=>KQN.msg"))
    check('nobody mirrors any more',C.evaluate("()=>!enemies.some(e=>e.mir)") and A.evaluate("()=>!enemies.some(e=>e.mir)"))
    for k in 'ABC':
        errs=[l for l in logs[k] if 'PAGEERROR' in l];check('no page errors '+k,not errs,errs[:3])
    b.close()
finally:
    srv.kill()
print('RESULT',('FAIL '+', '.join(FAIL)) if FAIL else 'ALL PASS')
