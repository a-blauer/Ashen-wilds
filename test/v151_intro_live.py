# v151 intro, live mode (v151c flow): a new game plays part one (woodland → the change) over the hero creator; Skip goes
# to the creator; the player makes a hero (here a Mage with the second starter companion, not the defaults); "Begin your
# journey" plays part two in Duskhold with that hero and companion; Skip goes to the game; the welcome banner waits for it;
# everything is cleaned up and the hero moves.
#   python3 v151_intro_live.py
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info)
    if not ok:FAIL.append(n)
def wait(pg,js,ms):
    for _ in range(ms//250):
        if pg.evaluate(js):return True
        pg.wait_for_timeout(250)
    return bool(pg.evaluate(js))
def s(pg):
    ev=pg.evaluate
    ev("()=>{window.KQ_INTRO=1;window._bt=[];const e=document.getElementById('banner');if(e)new MutationObserver(()=>{if(e.textContent&&!IC151.run)window._bt.push(e.textContent.slice(0,70))}).observe(e,{childList:true,subtree:true,characterData:true})}")
    pg.click('[data-dev=desktop]',timeout=60000)
    ok=wait(pg,"()=>IC151.run&&IC151.mode==='p1'&&!!document.getElementById('ic151')",8000)
    st=ev("()=>({run:IC151.run,mode:IC151.mode,el:!!document.getElementById('ic151'),start:!document.getElementById('start').classList.contains('hide'),party:party.length})");print(st)
    chk('part one plays when the new game starts, before the creator',ok and st['start'] and st['party']==0,st)
    pg.wait_for_timeout(2500)
    t1=ev("()=>(performance.now()-IC151.live.t0)/1000+IC151.live.off");chk('part one runs on its own clock',1.5<t1<20,t1)
    pg.screenshot(path=play.TMP+'/v151_live_p1.jpg',type='jpeg',timeout=120000)
    pg.click('#ic151 .skip')
    ok=wait(pg,"()=>!IC151.run&&!document.getElementById('ic151')",8000)
    st=ev("()=>({run:IC151.run,el:!!document.getElementById('ic151'),done:!!IC151.p1done,start:!document.getElementById('start').classList.contains('hide')})");print(st)
    chk('skip in part one goes to the creator (part one cleaned up)',ok and st['done'] and st['start'],st)
    e=ev("()=>IC151.err||''");chk('no frame errors in part one',not e,e[:400])
    # make a hero: a Mage with the second starter companion
    pg.click('[data-c="mage"]',timeout=20000);pg.click('#ccNext');pg.wait_for_timeout(400)
    sp=ev("()=>{const b=[...document.querySelectorAll('#ccList [data-s]')];return b.length>1?b[1].dataset.s:null}")
    if sp:pg.click('#ccList [data-s="%s"]'%sp)
    pg.wait_for_timeout(300);pg.click('#ccNext')
    ok=wait(pg,"()=>IC151.run&&IC151.mode==='p2'",15000)
    pg.wait_for_timeout(3000)
    st=ev("""()=>({run:IC151.run,mode:IC151.mode,t:IC151.live&&(performance.now()-IC151.live.t0)/1000+IC151.live.off,cls:hero.cls,sp:party[0]&&party[0].n,
      fol:!!(fols[0]&&fols[0].parent),town:!!(IC151.S&&IC151.S.D&&IC151.S.D.on),ban:(IC151.q||[]).length,skip:getComputedStyle(document.querySelector('#ic151 .skip')).display})""");print(st,'picked',sp)
    chk('part two plays after Begin, in Duskhold',ok and st['town'] and st['t'] and st['t']>=55.9,st)
    chk('with the hero and companion the player made',st['cls']=='mage' and sp and st['sp']==sp and st['fol'],(st['cls'],st['sp'],sp,st['fol']))
    chk('welcome banner waits for it',st['ban']>=1,st['ban'])
    chk('skip button shown in part two',st['skip']!='none',st['skip'])
    e=ev("()=>IC151.err||''");chk('no frame errors in part two',not e,e[:400])
    p0=ev("()=>[pl.position.x,pl.position.z]");pg.keyboard.down('w');pg.wait_for_timeout(1200);pg.keyboard.up('w')
    pg.screenshot(path=play.TMP+'/v151_live_p2.jpg',type='jpeg',timeout=120000)
    pg.click('#ic151 .skip');pg.wait_for_timeout(500)
    st=ev("()=>({t:(performance.now()-IC151.live.t0)/1000+IC151.live.off})");chk('skip in part two goes to the end',st['t']>=128,st)
    # the town part and the hand-back take a few seconds after the skip (more on a slow machine): wait for it, up to 30 s
    wait(pg,"()=>!IC151.run",30000);pg.wait_for_timeout(1200)
    st=ev("()=>({run:IC151.run,on:IC151.on,el:!!document.getElementById('ic151'),filt:ren.domElement.style.filter,mode:IC151.mode,ban:document.getElementById('banner')&&document.getElementById('banner').textContent})");print(st)
    chk('cleaned up and the game runs',not st['run'] and not st['on'] and not st['el'] and not st['filt'] and st['mode']=='all',st)
    bt=ev("()=>window._bt||[]")   # every banner text shown (they can come and go between two looks on a slow machine)
    chk('welcome banner shown after the intro',any('Welcome' in x for x in bt),bt[-3:])
    pg.screenshot(path=play.TMP+'/v151_live_after.jpg',type='jpeg',timeout=120000)
    p0=ev("()=>[pl.position.x,pl.position.z]");pg.keyboard.down('w');pg.wait_for_timeout(2500);pg.keyboard.up('w');p1=ev("()=>[pl.position.x,pl.position.z]")
    chk('hero moves again afterwards',abs(p0[0]-p1[0])+abs(p0[1]-p1[1])>.05,(p0,p1))
os.environ.setdefault('TITLE','')
play.run(s,w=1100,hh=650)
if FAIL:print('FAILED',FAIL)
