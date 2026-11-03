# v192: (1) switching characters from the in-game main menu always loads that hero, never the creator (heroes wearing v137+
# gear used to break the load because the continue ran before the whole script had loaded); (2) ability points per level
# (3 / 4 / 5 / 6 / 7 by bracket) and old heroes get the new total once, without double grants on repeated loads;
# (3) idling at night by the Grand Square fountain in a maxed Duskhold with every decoration on plays no equip chime.
#   python3 v192_misc.py        PART=slots,ap,sound (default all)   SWITCHES=5
import re,json,subprocess,time,os,sys
HERE=os.path.dirname(os.path.abspath(__file__));os.makedirs(HERE+'/out',exist_ok=True)
from playwright.sync_api import sync_playwright
PART=os.environ.get('PART','slots,ap,sound')
h=open(os.environ.get('SRC',os.path.join(HERE,'..','dist','ashen-wilds.html'))).read()
h=h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/vendor/three.min.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','/vendor/GLTFLoader.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js','/vendor/SkeletonUtils.js')
h=re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>','',h)
open(HERE+'/out/v192m.html','w').write(h)
PORT=8792
srv=subprocess.Popen(['python3','-m','http.server',str(PORT),'--directory',HERE],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
FAIL=[]
def check(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+('  '+str(info)[:400] if info else ''),flush=True)
    if not ok:FAIL.append(name)
URL='http://127.0.0.1:%d/out/v192m.html'%PORT
def ready(pg):
    pg.wait_for_function('document.readyState=="complete"&&typeof loadGame=="function"',timeout=240000);pg.wait_for_timeout(1200)
def create(pg,cls,name):
    if pg.evaluate("()=>!document.getElementById('devp').classList.contains('hide')"):pg.click('[data-dev=desktop]',force=True,timeout=90000)
    pg.wait_for_timeout(800);pg.evaluate("c=>document.querySelector('[data-c=\"'+c+'\"]').click()",cls);pg.wait_for_timeout(500)
    for _ in range(6):
        if pg.evaluate("()=>party.length>0"):break
        pg.evaluate("n=>{if($('ccName'))$('ccName').value=n;$('ccNext').click()}",name);pg.wait_for_timeout(1500)
    pg.wait_for_function('party.length>0',timeout=120000);pg.wait_for_timeout(1000);pg.evaluate("()=>saveGame(true)")
# watches the page from the moment it loads: did the hero creator ever stand in front (no title, no layout picker)?
WATCH="""()=>{window.__cc=0;window.__ccT=setInterval(()=>{try{const st=$('start'),hid=id=>{const e=$(id);return !e||e.classList.contains('hide')};
  if(st&&!st.classList.contains('hide')&&!$('awT')&&hid('devp')&&hid('svp')&&hid('kqj'))window.__cc++}catch(_){}},100)}"""
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--no-proxy-server','--autoplay-policy=no-user-gesture-required'])
    ctx=b.new_context(viewport={'width':1000,'height':620});pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)+' || '+(e.stack or '')[:400].replace('\n',' ')))
    ctx.add_init_script(WATCH.replace('()=>{','(()=>{addEventListener("DOMContentLoaded",()=>{',1)+')})()')
    pg.goto(URL,wait_until='commit',timeout=120000);ready(pg);pg.evaluate("()=>localStorage.clear()")
    pg.reload(wait_until='commit',timeout=120000);ready(pg)
    # ---------- ability points: the table ----------
    if 'ap' in PART:
        r=pg.evaluate("()=>({per:[2,9,10,19,20,29,30,39,40,50].map(kqrLvAP),e:[1,2,9,10,20,30,40,50].map(l=>{const o=hero.lvl;hero.lvl=l;const v=apEarned()-((hero.tal&&hero.tal.__apB)|0);hero.lvl=o;return v})})")
        check('points per level-up: 3 (2-9), 4 (10-19), 5 (20-29), 6 (30-39), 7 (40-50)',r['per']==[3,3,4,4,5,5,6,6,7,7],r)
        check('total earned: 0,3,24,28,64,115,176,251 at 1,2,9,10,20,30,40,50',r['e']==[0,3,24,28,64,115,176,251],r)
    # ---------- three heroes: one made in the creator, two "old saves" wearing v137+ gear ----------
    pg.click('#awT [data-slot="0"]',force=True);pg.wait_for_timeout(1500);create(pg,'warrior','Ana')
    check('a new hero is marked as already on the new points table',pg.evaluate("()=>hero.tal.__ap192===1"))
    info=pg.evaluate("""()=>{const s0=JSON.parse(localStorage.getItem(KQSL.keys[0])),find=f=>ITPL.findIndex((t,i)=>i>=ITPL_V137&&f(t)),o={};
      const mk=(name,cls,lvl,eqx,tal)=>{const s=JSON.parse(JSON.stringify(s0));s.hero.name=name;s.hero.cls=cls;s.hero.lvl=lvl;s.hero.xp=0;s.hero.hp=0;s.hero.mp=0;
        s.hero.tal=tal;s.eq=Object.assign({},s.eq,eqx);delete s.eq.offhand;return s};
      const ch=find(t=>t.sl=='chest'&&t.arm=='cloth'),bow=find(t=>t.sl=='weapon'&&t.cls=='ranger'),rw=ITPL.findIndex(t=>t.sl=='weapon'&&t.cls=='ranger'&&t.t==0);
      // Bex: an old Lv 30 mage (no __ap192), a v137 robe on, one ability unlocked and ranked so points were spent
      const mB=kqsAll('mage').find(q=>q.lv>1&&q.lv<=30);
      const B=mk('Bex','mage',30,{weapon:{id:9001,tp:ITPL.findIndex(t=>t.sl=='weapon'&&t.cls=='mage'&&t.t==0),lv:1,req:1,r:0,up:0,aff:[]},chest:{id:9002,tp:ch,lv:30,req:1,r:2,up:0,aff:[]}},{__ab:1,__at138:1,['ab:'+mB.n]:2});
      const C=mk('Cy','ranger',45,{weapon:{id:9003,tp:bow>=0?bow:rw,lv:45,req:1,r:3,up:0,aff:[]}},{__ab:1,__at138:1});
      localStorage.setItem(KQSL.keys[1],JSON.stringify(B));localStorage.setItem(KQSL.keys[2],JSON.stringify(C));
      o.ch=ch;o.bow=bow;o.v137=ITPL_V137;o.mB=mB.n;return o}""")
    check('test heroes wear v137+ gear (what broke the switch)',info['ch']>=info['v137'] and info['bow']>=info['v137'],info)
    # ---------- switch slots from the in-game main menu, again and again ----------
    names=['Ana','Bex','Cy'];seen={}
    order=[1,2,0,2,1,0,1][:int(os.environ.get('SWITCHES','7'))]
    if 'slots' in PART or 'ap' in PART:
        for k,sl in enumerate(order):
            pg.evaluate("()=>{kqMenuAsk();kqMenuGo()}");pg.wait_for_timeout(1200)
            ok=pg.evaluate("i=>!!document.querySelector('#awT [data-slot=\"'+i+'\"][data-aw=cont]')",sl)
            if not ok:check('slot %d listed on the menu title'%(sl+1),False);break
            with pg.expect_navigation(timeout=240000):pg.evaluate("i=>document.querySelector('#awT [data-slot=\"'+i+'\"]').click()",sl)
            ready(pg)
            t0=time.time();got=False
            while time.time()-t0<90:
                if pg.evaluate("n=>party.length>0&&hero.name==n&&$('start').classList.contains('hide')&&!$('awT')",names[sl]):got=True;break
                pg.wait_for_timeout(400)
            pg.wait_for_timeout(1500)
            st=pg.evaluate("()=>({n:hero.name,cls:hero.cls,lv:hero.lvl,sl:KQSL.n,cc:window.__cc,start:!$('start').classList.contains('hide'),ap:apFree(),e:apEarned(),sp:apSpent(),m:hero.tal.__ap192,q:typeof CHQ132!='undefined'})")
            check('switch %d → slot %d loads %s, never the creator'%(k+1,sl+1,names[sl]),got and st['cc']==0 and not st['start'] and st['sl']==sl,st)
            seen.setdefault(sl,[]).append(st)
            pg.evaluate("()=>saveGame(true)")
    # ---------- old heroes topped up once ----------
    if 'ap' in PART and 1 in seen and 2 in seen:
        B=seen[1];C=seen[2]
        old=lambda L:sum(3 if l%5==0 else 2 for l in range(2,L+1))
        new=lambda L:sum(3 if l<10 else 4 if l<20 else 5 if l<30 else 6 if l<40 else 7 for l in range(2,L+1))
        check('old Lv 30 hero: earned = new table (%d, was %d), spent points kept'%(new(30),old(30)),B[0]['e']==new(30) and B[0]['sp']>0 and B[0]['ap']==new(30)-B[0]['sp'],B[0])
        check('old Lv 45 hero: earned = new table (%d, was %d)'%(new(45),old(45)),C[0]['e']==new(45) and C[0]['ap']==new(45)-C[0]['sp'],C[0])
        check('repeated loads never grant again',all(s['ap']==B[0]['ap'] and s['e']==B[0]['e'] for s in B) and all(s['ap']==C[0]['ap'] for s in C),[ (s['ap'],s['e']) for s in B+C])
        check('the one-time note marker is saved',all(s['m']==1 for s in B[1:]+C[1:]) and pg.evaluate("()=>[1,2].every(i=>JSON.parse(localStorage.getItem(KQSL.keys[i])).hero.tal.__ap192===1)"))
    # ---------- the equip chime in a maxed Duskhold, at night, by the fountain ----------
    if 'sound' in PART:
        r=pg.evaluate("""()=>{cheatDusk147();DECO103.forEach(D=>SH.deco[D.k]=1);dc103Sync();
          const T=TOWNS[0];toPos(T.cx+.5,T.cy+3.6);TOD=.75;
          window.__snd={chime:0,fwk:0,home:0};{const f=sfx;sfx=function(k){if(k=='chime')__snd.chime++;return f.apply(this,arguments)}}
          {const f=sfx192;sfx192=function(k){__snd[k]=(__snd[k]||0)+1;return f.apply(this,arguments)}}
          try{audio()}catch(_){}return {deco:Object.keys(DC103.g).length,all:DECO103.length,fw:!!DC103.g.fireworks}}""")
        check('every decoration built after Max Duskhold',r['deco']==r['all'] and r['fw'],r)
        pg.wait_for_timeout(int(os.environ.get('IDLE_MS','40000')))
        s=pg.evaluate("()=>({snd:__snd,night:ATM.night,d:Math.hypot(pl.position.x-TOWNS[0].cx,pl.position.z-TOWNS[0].cy),open:uiOpen()})")
        print('  idle by the fountain:',json.dumps(s))
        check('idling by the fountain at night plays no equip chime',s['snd']['chime']==0,s)
        check('the fireworks did burst meanwhile (scenario ran) with their own sound',s['snd']['fwk']>0 and s['night']>.35,s)
        # the chime still plays for a real equip (drag gear onto the hero)
        r=pg.evaluate("""()=>{const n0=__snd.chime,it={id:uid++,tp:ITPL.findIndex(t=>t.sl=='boots'&&ARMC[t.arm]&&ARMC[t.arm].includes(hero.cls)),lv:1,req:1,r:0,up:0,aff:[]};gear.push(it);
          V90D.it=it;V90D.from='g';const tg=v90Target;v90Target=()=>({kind:'hero',el:document.body});try{v90Drop(0,0)}finally{v90Target=tg}return {n:__snd.chime-n0,on:eq.boots===it}}""")
        check('a real equip (drag onto the hero) still plays the chime once',r['n']==1 and r['on'],r)
    pg.evaluate("()=>clearInterval(window.__ccT)")
    check('no page errors',not errs,errs[:3])
    b.close()
finally:
    srv.kill()
print('RESULT',('FAIL '+', '.join(FAIL)) if FAIL else 'ALL PASS')
