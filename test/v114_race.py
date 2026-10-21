# v114 beast races: creator → play → save → reload → barber for one class through the UI; then every class as its beast
# casts every ability and swings its basic attacks (v90 harness) with no errors; co-op look array; other classes drop a race.
#   TITLE=1 python3 v114_race.py      (the appearance step only exists with the title screen on)   UI=cat (default)
import os,json,sys
os.environ.setdefault('TITLE','1')
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__));LIB=open(HERE+'/v90_abil_lib.js').read()
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,str(info)[:300],flush=True)
    if not ok:FAIL.append(n)
RACES={'warrior':(1,'rat',31),'assassin':(2,'cat',31),'mage':(3,'frog',20),'paladin':(4,'badger',24),'ranger':(5,'weasel',30)}
UI=os.environ.get('UI','assassin')
ABIL=os.environ.get('ABIL_ONLY')
if ABIL:os.environ['TITLE']=''
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    if ABIL:
        pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
        return abil(pg,ev,errs)
    pg.wait_for_timeout(2500);pg.keyboard.press('Enter');pg.wait_for_timeout(1500)
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(800)
    for sel in ['#svpN','text=New Hero','text=New game']:
        try:
            if pg.locator(sel).count():pg.click(sel,timeout=3000);break
        except Exception:pass
    pg.wait_for_timeout(800)
    rid,rname,nb=RACES[UI]
    pg.click('[data-c="%s"]'%UI,timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(1200)
    chk(UI+' has a Race option',ev("(v)=>!!document.querySelector('[data-lk=race][data-v=\"'+v+'\"]')",rid))
    chk('only its own race is offered',ev("()=>document.querySelectorAll('[data-lk=race]').length==2"))
    pg.click('[data-lk=race][data-v="%d"]'%rid);pg.wait_for_timeout(2500)
    chk('beast panels: Fur/Hide and Eye colour, no hair',ev("()=>{const t=document.querySelector('#start').innerText;return /(fur|hide)/i.test(t)&&/eye colou?r/i.test(t)&&!/hair style/i.test(t)}"))
    fur=ev("(r)=>BRD[r].fur[2]",rid)
    pg.click('[data-lk=skin][data-v="%s"]'%fur);pg.wait_for_timeout(2500)
    pg.screenshot(path=play.TMP+'/v114_creator.png')
    pg.click('#ccNext');pg.wait_for_timeout(800);pg.click('#ccNext');pg.wait_for_timeout(4000)
    st=ev("()=>({look:hero.look,race:pl._race,bones:huBody(pl).skeleton.bones.length,cls:hero.cls})")
    chk('started as a '+rname,st['look'].get('race')==rid and st['race']==rid and st['bones']==nb,st)
    chk('fur kept',st['look'].get('skin')==fur,st['look'])
    ev("()=>{camDist=6;camPitch=.3;snapCam&&snapCam()}");pg.wait_for_timeout(2500)
    pg.screenshot(path=play.TMP+'/v114_ingame.png')
    pg.keyboard.down('w');pg.wait_for_timeout(2500);pg.keyboard.up('w')
    chk('saved with race',ev("()=>{saveGame(true);const k=Object.keys(localStorage).find(k=>/save|kq|aw/i.test(k))||Object.keys(localStorage)[0];return JSON.stringify(localStorage.getItem(k)||'').indexOf('race')>=0}"))
    pg.reload(wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(5000)
    pg.keyboard.press('Enter');pg.wait_for_timeout(1500)
    try:pg.click('[data-dev=desktop]',timeout=20000)
    except Exception as e:print('nodev',str(e)[:80])
    pg.wait_for_timeout(500)
    try:pg.click('#svpC',timeout=60000)
    except Exception as e:print('noclick',str(e)[:100])
    pg.wait_for_timeout(5000)
    st=ev("()=>({look:hero.look,race:pl._race,bones:huBody(pl).skeleton.bones.length})")
    chk('reloaded as a '+rname,st['race']==rid and st['bones']==nb,st)
    # barber: back to human, then beast again
    ev("()=>{openBarber()}");pg.wait_for_timeout(1500)
    chk('barber offers Race',ev("()=>!!document.querySelector('#lkw [data-lk=race]')"))
    pg.click('#lkw [data-lk=race][data-v="0"]');pg.wait_for_timeout(1500);pg.click('#lkApply');pg.wait_for_timeout(2500)
    st=ev("()=>({look:hero.look,race:pl._race,bones:huBody(pl).skeleton.bones.length})")
    chk('barber back to human',st['race']==0 and st['bones']==20 and not st['look'].get('race'),st)
    ev("()=>{openBarber()}");pg.wait_for_timeout(1200);pg.click('#lkw [data-lk=race][data-v="%d"]'%rid);pg.wait_for_timeout(1200);pg.click('#lkApply');pg.wait_for_timeout(2500)
    chk('barber to beast again',ev("(a)=>pl._race==a[0]&&huBody(pl).skeleton.bones.length==a[1]",[rid,nb]))
    chk('co-op look carries race',ev("(r)=>{const a=mpLookOut();return a[8]===r&&mpLookIn(a).race===r}",rid))
    chk('another class drops the race',ev("(r)=>{const L=lkFull('warrior',{race:r,skin:'#2a2628'});const R=lkFull(BRD[r].cls,{race:r});return !L.race&&R.race===r}",rid))
    abil(pg,ev,errs)
def abil(pg,ev,errs):
    # every class as its beast, in a zone: all abilities cast (most deal damage), basic attacks land, the model stays a beast, no errors
    ev("()=>{POST.render=()=>{};requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16);const q=PMAP[0];toPos(q.path[40][0],q.path[40][1])}");pg.wait_for_timeout(2500)
    ev("(L)=>{eval(L);V90.home=[pl.position.x,pl.position.z];V90.start()}",LIB)
    for cls,(rid,rname,nb) in RACES.items():
        r=ev("""async(a)=>{const [c,rid]=a;hero.look={race:rid,skin:BRD[rid].fur[0],eye:BRD[rid].eye[0]};V90.setup(c,30,{rank:1});refreshGear();
          const out={race:pl._race,bones:huBody(pl).skeleton.bones.length,ab:{},fail:[]};const names=kqsAll(c).filter(s=>s.lv<=30).map(s=>s.n);
          for(const n of names){try{const r=await V90.one(n);out.ab[n]=r.dmg;if(r.fail||r.err)out.fail.push(n)}catch(e){out.fail.push(n+':'+e)}}
          try{const b=await V90.basic(3);out.basic=b}catch(e){out.fail.push('basic:'+e)}
          out.race2=pl._race;return out}""",[cls,rid])
        dmg=[n for n,v in r['ab'].items() if v>0]
        print(cls,rname,'abilities:',len(r['ab']),'dealing damage:',len(dmg),'basic:',r.get('basic'))
        chk(cls+' as '+rname+': every ability casts',not r['fail'] and len(r['ab'])>=8,r['fail'])
        chk(cls+' as '+rname+': abilities deal damage',len(dmg)>=len(r['ab'])//2,r['ab'])
        chk(cls+' as '+rname+': basic attacks hit',r.get('basic',{}).get('hits',0)>0,r.get('basic'))
        chk(cls+' as '+rname+': still a beast after fighting',r['race']==rid and r['race2']==rid and r['bones']==nb,(r['race'],r['race2'],r['bones']))
    chk('no page errors',len(errs)==0,errs[:3])
play.run(s,w=1000,hh=640)
print('FAILURES:',FAIL if FAIL else 'none')
