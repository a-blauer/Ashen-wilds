# v220 pictures: nameplates, a shop with its keeper, a conversation, a title card.  ONLY=a,b picks scenes.  W/H = window size.
import os,json,play
W=int(os.environ.get('W','1280'));H=int(os.environ.get('H','720'));ONLY=[s for s in os.environ.get('ONLY','').split(',') if s];TAG=os.environ.get('TAG','v220')
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=%s]'%os.environ.get('DEV','desktop'),timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    def shot(n,wait=1500):
        pg.wait_for_timeout(wait);pg.screenshot(path=play.TMP+'/%s_%s.png'%(TAG,n));print('SHOT',n)
    def want(n):return not ONLY or n in ONLY
    ev("()=>{TOD=.3;gold=1e6;window.__r=[]}")
    if want('plates'):
        ev("()=>{const s=SHM.st;pl.position.set(s.x+1.5,pl.position.y,s.z+3.2);camYaw=0.4;camDist=6;snapCam()}");shot('plates')
    if want('hold'):
        ev("()=>{const s=SHM.st;pl.position.set(s.x+.6,pl.position.y,s.z+2);snapCam();openX('hold')}");shot('hold',2200);ev("()=>closeX()")
    if want('post'):
        ev("()=>{const T=TOWNS[0],b=wbase?null:null;const n=DM196TP.npc,p=n.children[0].getWorldPosition(new THREE.Vector3());pl.position.set(p.x+1.5,pl.position.y,p.z+2.5);snapCam();openShop('m')}");shot('post',2200)
        ev("()=>{$('shop').classList.add('hide')}")
    if want('visitor'):
        r=ev("()=>{const v=VIS.find(v=>v.g);if(!v)return null;const p=v.g.children.find(c=>c.bones).getWorldPosition(new THREE.Vector3());pl.position.set(p.x+1,pl.position.y,p.z+2.4);snapCam();openX('visitor',v.k);return v.k}");print('visitor',r)
        if r:shot('visitor',2200);ev("()=>closeX()")
    if want('board'):
        ev("()=>{const p=CHQ148.P.ch.root.getWorldPosition(new THREE.Vector3());pl.position.set(p.x+1,pl.position.y,p.z+2.4);snapCam();openX('chq132')}");shot('board',2200);ev("()=>closeX()")
    if want('bag'):
        ev("()=>{$('bag').classList.remove('hide');rB()}");shot('bag',800);ev("()=>$('bag').classList.add('hide')")
    if want('menus'):
        for n,js in [('m_bag',"$('bag').classList.remove('hide');rB()"),('m_cmp',"$('cmp').classList.remove('hide');try{rC()}catch(_){}"),('m_tal',"document.dispatchEvent(new KeyboardEvent('keydown',{key:'c',bubbles:true}))"),
                     ('m_set',"$('setw').classList.remove('hide')"),('m_portal',"openX('portal')"),('m_inc',"$('inc').classList.remove('hide');rI()"),('m_abil',"document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',bubbles:true}))")]:
            try:ev("()=>{"+js+"}")
            except Exception as e:print('ERR',n,str(e)[:200])
            shot(n,900);ev("()=>{try{closeX()}catch(_){}document.querySelectorAll('.modal.w').forEach(e=>e.classList.add('hide'));try{KQMENU.on=false}catch(_){}}")
    if want('talk'):
        ev("()=>{insGo(INSL[insG(0,0)])}");pg.wait_for_function("()=>curMap()==0&&MQ143.S&&MQ143.S.war&&MQ143.S.war.captain",timeout=180000);pg.wait_for_timeout(1500)
        ev("()=>{try{if(KC208.on)kc208End()}catch(_){}const g=MQ143.S.war.captain.g,p=g.getWorldPosition(new THREE.Vector3());pl.position.set(p.x+1.2,GH(p.x+1.2,p.z+2),p.z+2);snapCam()}");pg.wait_for_timeout(800)
        shot('talk0',600)
        ev("()=>openX('mq143')");shot('talk1',2600)
        pg.keyboard.press('Space');pg.keyboard.press('Space');pg.keyboard.press('Space');shot('talk2',1500)
        print('dlg',json.dumps(ev("()=>({on:dl220On(),i:DL220.i,n:DL220.pages.length,more:$('xw').classList.contains('dl220more'),im:IM220.on&&IM220.on.mode})")))
        pg.keyboard.press('1');shot('talk3',1500);pg.keyboard.press('Escape');pg.wait_for_timeout(1500)
        print('closed',json.dumps(ev("()=>({mode:xwMode,st:MQ143.st,vis:pl.visible,im:!!IM220.on,cls:document.body.className})")))
    if want('card'):
        ev("()=>{zt116Ins(INSL[insG(0,0)]);banner('LEVEL 2','Warrior · +3 attribute points (C)','Half of your health and mana restored')}");shot('card',1200);shot('card2',1800)
        print('q',json.dumps(ev("()=>({cur:TQ220.cur&&TQ220.cur.k,q:TQ220.q.length,card:$('ztc116').className,ban:$('banner').children.length,txt:$('ztc116').textContent})")))
play.run(s,w=W,hh=H)
