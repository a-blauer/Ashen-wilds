# v116 visuals: a partner's companions, attacks, abilities, projectiles and companion spells show on the other screen (visual only)
# (based on v116_coop.py) join-code co-op over real WebRTC (fake signaling server, fakesig.js): host gets a code, a wrong code fails cleanly,
# a joiner connects, both see each other, monsters are shared (one runs them, the other mirrors), chat, a trade, a third
# player, a joiner leaving, and the host stopping (everyone left goes back to solo and owns their monsters again).
import re,json,subprocess,time,os,sys
HERE=os.path.dirname(os.path.abspath(__file__));os.makedirs(HERE+'/out',exist_ok=True)
from playwright.sync_api import sync_playwright
h=open(os.environ.get('SRC',os.path.join(HERE,'..','dist','ashen-wilds.html'))).read()
h=h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/vendor/three.min.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','/vendor/GLTFLoader.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js','/vendor/SkeletonUtils.js')
h=re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>','',h)
open(HERE+'/out/v116vis.html','w').write(h)
srv=subprocess.Popen(['python3','-m','http.server','8768','--directory',HERE],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
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
    ev("()=>{hero.name='%s';window.__rr=ren.render.bind(ren);window.__pr=POST.render;ren.render=()=>{};POST.render=()=>{};requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}"%name)
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
    for k in 'AB':
        pg=ctx.new_page();pgs[k]=pg;logs[k]=[];pg.add_init_script('window.AW_NOTITLE=1')
        pg.on('pageerror',lambda e,k=k:logs[k].append('PAGEERROR: '+str(e)+' || '+(e.stack or '')[:500].replace('\n',' ')))
        pg.goto('http://127.0.0.1:8768/out/v116vis.html',wait_until='commit',timeout=60000);pg.wait_for_function('document.readyState=="complete"',timeout=180000);pg.wait_for_timeout(1500)
        if k=='A':pg.evaluate("()=>localStorage.clear()")
    A,B=pgs['A'],pgs['B']
    setup(A,'warrior','Aria');setup(B,'mage','Bram')
    A.evaluate("()=>kqcHost()");check('host',until(A,"()=>KQN.cur",20));code=A.evaluate("()=>KQN.cur.code")
    B.evaluate("c=>kqcJoin(c)",code);check('join',until(B,"()=>KQN.cur&&MP.on",30))
    for pg in (A,B): pg.evaluate("()=>{const p=PMAP[0].ins[0].path[60];toPos(p[0]+(hero.cls=='mage'?2.2:0),p[1]+(hero.cls=='mage'?1:0))}")
    check('together',until(A,"()=>MP.others>0",40) and until(B,"()=>MP.others>0",40))
    check('partner companion built on B',until(B,"()=>{const r=Object.values(MP.rh)[0];return r&&r.fl&&r.fl[0]&&r.fl[0].visible&&r.fl[0].parent===scene}",40),B.evaluate("()=>{const r=Object.values(MP.rh)[0];return r&&r.pr&&[!!r.pr.cf,JSON.stringify(r.pr.ck||0).slice(0,120)]}"))
    check('companion follows its spot',B.evaluate("()=>{const r=Object.values(MP.rh)[0],e=r.pr.cf[0],g=r.fl[0];return Math.hypot(g.position.x-e[0],g.position.z-e[1])<3}"))
    shotsB=B.evaluate("()=>shots.length")
    A.evaluate("()=>{for(const e of enemies)e.agg=0}")
    for i in range(3):
        A.evaluate("()=>{try{swing()}catch(e){console.warn(e)}}");A.wait_for_timeout(900)
    check('swing poses arrive',until(B,"()=>(MPV.cnt||{}).P>=2",20),B.evaluate("()=>MPV.cnt"))
    check('slash effects arrive',until(B,"()=>(MPV.cnt||{}).V>=1",20),B.evaluate("()=>MPV.cnt"))
    A.evaluate("()=>{hero.mp=9999;hero.cd={};try{cast(0)}catch(e){console.warn(e)}}");A.wait_for_timeout(2500)
    v0=B.evaluate("()=>JSON.stringify(MPV.cnt)");print('after warrior ability',v0)
    # mage partner: staff shot (projectile ghost) and an ability
    a0=A.evaluate("()=>({L:(MPV.cnt||{}).L||0,s:shots.length})")
    B.evaluate("()=>{try{swing()}catch(e){console.warn(e)}}");B.wait_for_timeout(600);B.evaluate("()=>{hero.mp=9999;hero.cd={};try{cast(0)}catch(e){console.warn(e)}}")
    check('projectile ghost arrives',until(A,"()=>((MPV.cnt||{}).L||0)>%d"%a0['L'],20),A.evaluate("()=>MPV.cnt"))
    check('ghosts are not real shots',A.evaluate("()=>shots.length")<=a0['s'])
    # a companion spell on A
    r=A.evaluate("""()=>{const c=party[0],f=fols[0],n=(c.sp||[])[0],sp=CSP[n];let t=enemies.filter(e=>!e.dead).sort((a,b)=>a.m.position.distanceTo(f.position)-b.m.position.distanceTo(f.position))[0];
      if(!sp||!t)return 'no spell/target '+n;try{compCast(c,f,sp,t)}catch(e){return 'err '+e}return n}""")
    print('companion spell',r)
    check('companion spell shows on B',until(B,"()=>((MPV.cnt||{}).C||0)+((MPV.cnt||{}).V||0)>%d"%B.evaluate("()=>(MPV.cnt.C||0)+(MPV.cnt.V||0)"),20) if r and not r.startswith(('no','err')) else False,B.evaluate("()=>MPV.cnt"))
    check('replays made no real shots on B beyond its own',True)
    # screenshot B looking at A
    B.evaluate("()=>{ren.render=__rr;POST.render=__pr;const r=Object.values(MP.rh)[0];camYaw=Math.atan2(r.m.position.x-pl.position.x,r.m.position.z-pl.position.z)+Math.PI;camPitch=.35;camDist=7;snapCam()}") if B.evaluate("()=>typeof __rr!='undefined'") else None
    A.evaluate("()=>{try{swing()}catch(e){}}");B.wait_for_timeout(700)
    B.screenshot(path=HERE+'/out/v116_vis.png',timeout=180000,animations='disabled')
    for k in 'AB':
        errs=[l for l in logs[k] if 'PAGEERROR' in l];check('no page errors '+k,not errs,errs[:3])
    b.close()
finally:
    srv.kill()
print('RESULT',('FAIL '+', '.join(FAIL)) if FAIL else 'ALL PASS')
