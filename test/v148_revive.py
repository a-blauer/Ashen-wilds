# v148.2 co-op: downed instead of dead when a partner stands in the map, revive by a partner (F, 3 s), moving away stops it,
# bleed-out / Give up / nobody standing = the normal death; solo unchanged; a Sovereign or Vorraxis kill credits every player.
import re,json,subprocess,time,os,sys
HERE=os.path.dirname(os.path.abspath(__file__));os.makedirs(HERE+'/out',exist_ok=True)
from playwright.sync_api import sync_playwright
h=open(os.environ.get('SRC',os.path.join(HERE,'..','dist','ashen-wilds.html'))).read()
h=h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/vendor/three.min.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','/vendor/GLTFLoader.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js','/vendor/SkeletonUtils.js')
h=re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>','',h)
open(HERE+'/out/v148rv.html','w').write(h)
srv=subprocess.Popen(['python3','-m','http.server','8767','--directory',HERE],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
import socket
for _ in range(100):   # wait for the web server (a fixed 1 s was not always enough on a busy machine)
    try:socket.create_connection(('127.0.0.1',8767),timeout=1).close();break
    except OSError:time.sleep(.2)
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
    ev("()=>{ren.render=()=>{};POST.render=()=>{}}")   # no drawing (also while the hero is made: much faster on a slow machine)
    ev("()=>$('ccNext').click()");pg.wait_for_function("()=>ccStep==1||party.length>0",timeout=60000);pg.wait_for_timeout(300)
    ev("()=>{if(!party.length)$('ccNext').click()}")
    pg.wait_for_function('party.length>0&&hero.hp>0',timeout=180000);pg.wait_for_timeout(1500)
    ev("()=>{hero.name='%s';ren.render=()=>{};POST.render=()=>{};requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}"%name)
# steady on slow machines (Oct 27 2026): every wait polls its condition with SLACK times the time it was written for (a slow
# machine runs few frames per second, and the game's own time (at most 0.05 s per frame) falls behind the clock)
SLACK=3
def until(pg,js,t=30):
    t*=SLACK;t0=time.time()
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
        pg.goto('http://127.0.0.1:8767/out/v148rv.html',wait_until='commit',timeout=60000);pg.wait_for_function('document.readyState=="complete"',timeout=180000);pg.wait_for_timeout(1500)
        if os.environ.get('SLOW'):ctx.new_cdp_session(pg).send('Emulation.setCPUThrottlingRate',{'rate':float(os.environ['SLOW'])})   # SLOW=4: a 4x slower CPU once the page has loaded
        if k=='A':pg.evaluate("()=>localStorage.clear()")
    A,B=pgs['A'],pgs['B']
    setup(A,'warrior','Aria');setup(B,'mage','Bram')
    RISE="()=>{if(AWD.dead&&AWD.ready)awRise();return !AWD.dead}"
    # solo: dying is the normal death
    A.evaluate("()=>{hero.hp=0;down()}")
    check('solo: no downed state, normal death',A.evaluate("()=>!RV148.down&&AWD.dead==1"))
    until(A,RISE,20);check('solo: rose again',A.evaluate("()=>!AWD.dead&&hero.hp>0"))
    # connect
    A.evaluate("()=>{openX('coop');document.querySelector('[data-kqc=host]').click()}")
    until(A,"()=>KQNET.cur&&KQNET.cur.host&&/^[A-Z2-9]{6}$/.test(KQNET.cur.code)",20);code=A.evaluate("()=>KQNET.cur.code")
    # join; a join that gave up (the game's own 20 s limit, e.g. a slow machine's WebRTC setup) is tried again, at most 3 times
    jl=[]
    for k in range(3):
        B.evaluate("c=>kqcJoin(c)",code)
        if until(B,"()=>!!(KQNET.cur&&MP.on)||!KQNET.busy&&!KQNET.cur",30):
            if B.evaluate("()=>!!(KQNET.cur&&MP.on)"):break
        jl.append(B.evaluate("()=>[KQNET.busy,!!KQNET.cur,KQNET.msg||'']"));B.wait_for_timeout(1000)
    check('joined',until(B,"()=>KQNET.cur&&MP.on&&Object.keys(MP.rh).length==1",30) and until(A,"()=>Object.keys(MP.rh).length==1",20),
          json.dumps([jl,B.evaluate("()=>[KQNET.busy,!!KQNET.cur,KQNET.msg||'',Object.keys(MP.rh).length]"),A.evaluate("()=>[!!KQNET.cur,Object.keys(MP.rh).length]")]))
    for pg in (A,B): pg.evaluate("()=>{closeX();const p=PMAP[0].ins[0].path[60];toPos(p[0]+(hero.cls=='mage'?1.2:0),p[1]+(hero.cls=='mage'?.6:0));hero.hp=heroMax()}")
    check('same map',until(A,"()=>MP.others>0",30) and until(B,"()=>MP.others>0",30))
    # B goes down
    B.evaluate("()=>{hero.hp=0;down()}")
    check('B is downed, not dead',B.evaluate("()=>RV148.down==1&&!AWD.dead&&hero.hp==0"))
    check('the downed box shows',B.evaluate("()=>!$('rv148b').classList.contains('hide')&&/Aria can revive you/.test($('rv148m').textContent)"),B.evaluate("()=>$('rv148m').textContent"))
    check('A sees B downed',until(A,"()=>Object.values(MP.rh).some(r=>r.pr&&r.pr.dn==1&&r.pr.hp==0&&r.pr.bt>0)",15))
    r=B.evaluate("""()=>{const x0=pl.position.x;walk(pl,1.5,0);const moved=pl.position.x!==x0;const h0=hero.hp;const e=enemies.find(q=>!q.dead&&!q.boss);if(e){hitHero(e,3,'p');bossHit(e,2)}
      swing();cast(0);return {moved,hp:hero.hp,down:RV148.down}}""")
    check('downed B cannot move, takes no damage, stays down',not r['moved'] and r['hp']==0 and r['down']==1,r)
    # A revives B
    A.evaluate("()=>{const r=Object.values(MP.rh)[0];toPos(r.m.position.x+.8,r.m.position.z+.3)}")
    check('A gets the revive prompt',until(A,"()=>{promptTick();return PR&&/^F · Revive Bram/.test(PR.label)}",10),A.evaluate("()=>PR&&PR.label"))
    A.evaluate("()=>PR.fn()")
    check('A is reviving',A.evaluate("()=>!!RV148.ch"))
    check('B gets up',until(B,"()=>!RV148.down&&hero.hp>0",20),B.evaluate("()=>[RV148.down,hero.hp,RV148.t]"))
    r=B.evaluate("()=>({f:hero.hp/heroMax(),iv:hero.iv,box:$('rv148b').classList.contains('hide')})")
    check('revived with 40% health and a moment of safety',abs(r['f']-.4)<.02 and r['iv']>0 and r['box'],r)
    check('A sees B standing again',until(A,"()=>Object.values(MP.rh).some(r=>r.pr&&!r.pr.dn&&r.pr.hp>0)",15))
    # moving away stops a revive
    B.evaluate("()=>{hero.hp=0;down()}");until(A,"()=>Object.values(MP.rh).some(r=>r.pr&&r.pr.dn==1)",15)
    A.evaluate("()=>{promptTick();PR&&PR.fn&&PR.fn()}");A.wait_for_timeout(400)
    A.evaluate("()=>{const r=Object.values(MP.rh)[0];toPos(r.m.position.x+6,r.m.position.z)}")
    check('moving away stops the revive',until(A,"()=>!RV148.ch",10) and B.evaluate("()=>RV148.down==1"))
    # bleed out
    B.evaluate("()=>{RV148.t=1}")
    check('bleeding out = the normal death',until(B,"()=>!RV148.down&&AWD.dead==1",15))
    until(B,RISE,20);check('B rose in Duskhold',B.evaluate("()=>!AWD.dead&&hero.hp==heroMax()&&townAt(pl.position.x,pl.position.z,0)>=0"))
    # give up
    B.evaluate("()=>{const p=PMAP[0].ins[0].path[60];toPos(p[0]+1.2,p[1]+.6);hero.hp=heroMax()}");until(B,"()=>MP.others>0",20)
    B.evaluate("()=>{hero.hp=0;down()}");check('down again',B.evaluate("()=>RV148.down==1"))
    B.evaluate("()=>$('rv148g').click()")
    check('Give up = the normal death',until(B,"()=>!RV148.down&&AWD.dead==1",10));until(B,RISE,20)
    # nobody standing in the map: straight to the death screen
    A.evaluate("()=>{toPos(TOWNS[0].sp?TOWNS[0].sp[0]:home.sp[0],TOWNS[0].sp?TOWNS[0].sp[1]:home.sp[1])}")
    B.evaluate("()=>{const p=PMAP[0].ins[0].path[60];toPos(p[0],p[1]);hero.hp=heroMax()}")
    until(B,"()=>MP.others==0",20)
    B.evaluate("()=>{hero.hp=0;down()}")
    check('alone in the map: normal death',until(B,"()=>!RV148.down&&AWD.dead==1",10),B.evaluate("()=>[RV148.down,AWD.dead,MP.others]"))
    until(B,RISE,20)
    # in a Sovereign's arena: B downed, A fights on; the arena is lost only when both are down
    for pg in (A,B): pg.evaluate("()=>{const A2=ARN[0],P=PMAP[0].ins[3].en,a0=Math.atan2(P[1]-A2.cz,P[0]-A2.cx);toPos(A2.cx+Math.cos(a0)*6+(hero.cls=='mage'?1:0),A2.cz+Math.sin(a0)*6);hero.hp=heroMax()}")
    check('arena: both in the fight',until(A,"()=>AF&&AF.i===0",30) and until(B,"()=>AF&&AF.i===0",30))
    until(A,"()=>Object.values(MP.rh).some(r=>r.pr&&r.pr.ar===0)",15)
    B.evaluate("()=>{hero.hp=0;down()}")
    check('arena: B downed, still in the fight',B.evaluate("()=>RV148.down==1&&AF&&AF.i===0"))
    A.wait_for_timeout(2500)
    check('arena: A fights on (not lost)',A.evaluate("()=>AF&&AF.i===0&&!bossDone.has(0)"))
    check('arena: A drives the boss now',until(A,"()=>mpBossAuth(0)===MP.me",10))
    A.evaluate("()=>{hero.hp=0;down()}")
    check('arena: A down with nobody standing = death',until(A,"()=>AWD.dead==1&&!RV148.down",10))
    DIAG="()=>JSON.stringify({me:MP.me,rg:MP.rg,dn:RV148.down,t:Math.round(RV148.t),dead:AWD.dead,hp:hero.hp,AF:AF&&AF.i,others:MP.others,rh:Object.entries(MP.rh).map(([k,r])=>[k,r.pr&&[r.pr.rg,r.pr.hp,r.pr.dn,r.pr.ar]])})"
    check('arena: B dies too',until(B,"()=>AWD.dead==1&&!RV148.down",15),'B '+B.evaluate(DIAG)+' A '+A.evaluate(DIAG))
    A.wait_for_timeout(2000)
    check('arena: lost for both, no new fight behind the death screen',A.evaluate("()=>!AF") and B.evaluate("()=>!AF"),(A.evaluate("()=>AF&&AF.i"),B.evaluate("()=>AF&&AF.i")))
    for pg in (A,B): until(pg,RISE,20)
    A.wait_for_timeout(1500)
    check('arena: after Rise Again both are in Duskhold',A.evaluate("()=>!AF&&townAt(pl.position.x,pl.position.z,0)>=0") and B.evaluate("()=>!AF&&townAt(pl.position.x,pl.position.z,0)>=0"))
    # boss credit: A slays Sovereign 0 while B stands in Duskhold
    check('neither has beaten Sovereign 0',A.evaluate("()=>!bossDone.has(0)") and B.evaluate("()=>!bossDone.has(0)"))
    A.evaluate("()=>{const e=bossEnt(0);e.c.h=0;e.dead=1;kill(e)}")
    check('A cleared the map',A.evaluate("()=>bossDone.has(0)"))
    check('B gets the credit in Duskhold',until(B,"()=>bossDone.has(0)",20))
    check('B gets the Sovereign power',B.evaluate("()=>hero.buffs.some(b=>b.perm&&b.n==BOSSES[0].pw.n)"))
    check('B is told who did it',B.evaluate("()=>[...document.querySelectorAll('#glog div')].some(d=>/Aria slew/.test(d.textContent))"))
    # Vorraxis credit
    B.evaluate("()=>{MQ144.st=0}")
    A.evaluate("()=>bc148Send('v144')")
    check('B gets Vorraxis credit',until(B,"()=>MQ144.st==2",20),B.evaluate("()=>MQ144.st"))
    # a second kill of an already-beaten Sovereign changes nothing for B
    n0=B.evaluate("()=>hero.buffs.filter(b=>b.perm).length")
    A.evaluate("()=>{const e=bossEnt(0);if(e){e.c.h=0;e.dead=1;kill(e)}}");B.wait_for_timeout(4000)
    check('no double power for B',B.evaluate("()=>hero.buffs.filter(b=>b.perm).length")==n0)
    for k in 'AB':
        errs=[l for l in logs[k] if 'PAGEERROR' in l];check('no page errors '+k,not errs,errs[:3])
    b.close()
finally:
    srv.kill()
print('RESULT',('FAIL '+', '.join(FAIL)) if FAIL else 'ALL PASS')
