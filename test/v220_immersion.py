# v220: talking to people (dialogue box + camera), shopkeepers beside the shop window, fitted nameplates, simple title pop-ups
# that never overlap.  Run: python3 v220_immersion.py
import os,json,play
bad=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,'' if ok else info,flush=True)
    if not ok:bad.append(name)
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    def until(js,ms=60000):
        try:pg.wait_for_function(js,timeout=ms);return True
        except Exception:return False
    # ---- 1. nameplates fit their text ----
    r=ev("""()=>{const out=[];scene.traverse(g=>{const o=g.userData&&g.userData.npcO;if(!o||!o.label)return;const sp=g.children.find(c=>c.isSprite);if(!sp)return;
      const d=sp.userData.np220,c=sp.userData.np220c;let need=0;if(c){const x=document.createElement('canvas').getContext('2d');x.font='700 60px Cinzel,"Trajan Pro",Georgia,"Times New Roman",serif';need=x.measureText(d.text[0]).width}
      out.push({l:o.label,ok:!!d,w:c?c.width:0,need:Math.round(need),asp:c?+(sp.scale.x/sp.scale.y-c.width/c.height).toFixed(3):9})});return out}""")
    chk('town folk carry the new plates',len(r)>=3 and all(x['ok'] for x in r),r)
    chk('every plate is wider than its name',all(x['w']>=x['need']+60 for x in r),r)
    chk('plate sprites keep the canvas shape',all(abs(x['asp'])<.02 for x in r),r)
    chk('the Steward has a plate','Stronghold Steward' in [x['l'] for x in r],[x['l'] for x in r])
    r=ev("()=>{const a=np220Split('Corvin · Dealer'),b=np220Split('Stronghold Steward');return [a,b]}")
    chk('"Name · Role" splits into two lines',r==[['Corvin','Dealer'],['Stronghold Steward','']],r)
    # ---- 2. the Steward's window: keeper view ----
    ev("()=>{const s=SHM.st;pl.position.set(s.x+.6,pl.position.y,s.z+2);snapCam();window.__ry=im220Rig(SHM.st.g).rotation.y;openX('hold')}")
    ok=until("()=>IM220.on&&IM220.on.mode=='shop'&&!pl.visible&&IM220.on.k>=1",30000)
    r=ev("""()=>{const w=IM220.on||{},v=new THREE.Vector3(w.x,w.y0+w.h*.62,w.z).project(cam);return {mode:w.mode,key:w.key,cls:$('xw').className,body:document.body.className,vis:pl.visible,sx:+v.x.toFixed(2),sy:+v.y.toFixed(2),
      say:$('sk220say')&&$('sk220say').className,win:$('xw').querySelector('.win').getBoundingClientRect().right/innerWidth,plate:im220Rig(SHM.st.g).children.filter(c=>c.isSprite&&c.visible).length}}""")
    chk('opening the Steward starts the keeper view',ok and r['key']=='steward',r)
    chk('the window moves to the left',' sk220' in r['cls'] and r['win']<.72,r)
    chk('the keeper stands on the right of the screen',.2<r['sx']<.8 and -.6<r['sy']<.6,r)
    chk('the hero and the keeper\'s plate step out',r['vis']==False and r['plate']==0,r)
    chk('the keeper greets you',r['say']=='on',r)
    ev("()=>closeX()");ok=until("()=>!IM220.on&&pl.visible",20000)
    r=ev("()=>({cls:$('xw').className,body:document.body.className,ry:Math.abs(im220Rig(SHM.st.g).rotation.y-window.__ry)<1e-6,plate:im220Rig(SHM.st.g).children.filter(c=>c.isSprite&&c.visible).length})")
    chk('closing gives everything back',ok and 'sk220' not in r['cls'] and 'im220' not in r['body'] and r['ry'] and r['plate']>=1,r)
    # the Trading Post (its own window)
    ev("()=>{const p=im220Rig(DM196TP.npc).getWorldPosition(new THREE.Vector3());pl.position.set(p.x+1.2,pl.position.y,p.z+2.2);snapCam();openShop('m')}")
    ok=until("()=>IM220.on&&IM220.on.key=='post'",30000);chk('the Trading Post shows its merchant',ok and 'sk220' in ev("()=>$('shop').className"))
    pg.keyboard.press('Escape');ok=until("()=>!IM220.on&&pl.visible",20000);chk('Esc leaves the shop view',ok)
    # a window with nobody behind it stays a plain window
    ev("()=>{openX('portal')}");pg.wait_for_timeout(600)
    chk('other windows are unchanged',ev("()=>!IM220.on&&!/sk220|dlg220/.test($('xw').className)"));ev("()=>closeX()")
    # ---- 3. title pop-ups ----
    ev("""()=>{const H=window.__h={seq:[],both:0,two:0,b3:0};new MutationObserver(()=>{const b=$('banner'),n=b.children.length;if(n>1)H.two++;if(n&&/\\bon\\b/.test($('ztc116').className))H.both++;
      if(b.querySelector('.b3'))H.b3++;const t=n?(b.querySelector('.b1')||{}).textContent:null;if(t&&H.seq[H.seq.length-1]!==t)H.seq.push(t)}).observe($('banner'),{childList:true,subtree:true})}""")
    ev("()=>{TQ220.q.length=0;tq220Hide();TQ220.cur=null;clearTimeout(TQ220.end);zt116Ins(INSL[insG(0,1)]);banner('LEVEL 2','Warrior · +3 attribute points','Half of your health and mana restored');banner('Second','','x')}")
    r=ev("()=>({card:/\\bon\\b/.test($('ztc116').className),sub:!!document.querySelector('#ztc116 .zts'),txt:$('ztc116').textContent,ban:$('banner').children.length,q:TQ220.q.length})")
    chk('a card shows at once, banners wait',r['card'] and r['ban']==0 and r['q']==2,r)
    chk('the card has no flavour line',not r['sub'],r)
    ok=until("()=>window.__h.seq.length>=2",20000);r=ev("()=>window.__h")
    chk('then the banners, one at a time, never over the card',ok and r['seq']==['LEVEL 2','Second'] and r['both']==0 and r['two']==0,r)
    chk('no explaining line on a banner',r['b3']==0,r)
    r=ev("()=>[tq220Foot('Follow it down the road'),tq220Foot('F at the bench to begin melting the gate'),tq220Foot('2 of 3 sigils attuned'),tq220Foot('<span class=\"ztlow\">⚔ Rec. power 105</span>')!='',tq220Foot('<span class=\"\">⚔ Rec. power 105</span>')]")
    chk('only key hints, counts and the power warning stay',r==['','F at the bench to begin melting the gate','2 of 3 sigils attuned',True,''],r)
    # ---- 4. a conversation ----
    ev("()=>{TQ220.q.length=0;insGo(INSL[insG(0,0)])}");until("()=>curMap()==0&&MQ143.S&&MQ143.S.war&&MQ143.S.war.captain",180000);pg.wait_for_timeout(800)
    ev("()=>{try{if(KC208.on)kc208End()}catch(_){}MQ143.st=0;const p=MQ143.S.war.captain.g.getWorldPosition(new THREE.Vector3());pl.position.set(p.x+1.2,GH(p.x+1.2,p.z+2),p.z+2);snapCam()}")
    until("()=>!KC208.on&&!IC151.on",60000);pg.wait_for_timeout(400)
    ev("()=>openX('mq143')");ok=until("()=>IM220.on&&IM220.on.mode=='talk'&&IM220.on.k>=1",30000)
    r=ev("""()=>{const w=IM220.on||{},v=new THREE.Vector3(w.x,w.y0+w.h*.84,w.z).project(cam);return {cls:$('xw').className,body:document.body.className,n:DL220.pages.length,i:DL220.i,sx:+v.x.toFixed(2),sy:+v.y.toFixed(2),
      foot:getComputedStyle($('xwF')).display,hud:getComputedStyle($('topl')).visibility}}""")
    chk('talking to the Warden-Captain opens the dialogue view',ok and 'dlg220' in r['cls'] and 'im220t' in r['body'],r)
    chk('his words come in passages',r['n']==2 and r['i']==0,r)
    chk('his face is in the upper middle of the screen',abs(r['sx'])<.3 and 0<r['sy']<.8,r)
    chk('answers wait for the last passage; the HUD steps aside',r['foot']=='none' and r['hud']=='hidden',r)
    pg.keyboard.press('Space');pg.wait_for_timeout(150);a=ev("()=>({i:DL220.i,typed:DL220.typed})")   # finishes the typing (or moves on if it had finished)
    if a['i']==0:pg.keyboard.press('Space');pg.wait_for_timeout(150)
    pg.keyboard.press('Space');pg.wait_for_timeout(150)                                                # make sure passage 2 is fully shown
    r=ev("()=>({i:DL220.i,typed:DL220.typed,more:$('xw').classList.contains('dl220more'),foot:getComputedStyle($('xwF')).display,btn:$('xwF').querySelectorAll('button').length,st:MQ143.st})")
    chk('Space walks through to the last passage and the answers appear',r['i']==1 and r['typed'] and not r['more'] and r['foot']!='none' and r['btn']==1 and r['st']==0,r)
    pg.keyboard.press('1');pg.wait_for_timeout(300)
    r=ev("()=>({st:MQ143.st,i:DL220.i,on:dl220On()})");chk('1 picks the answer (the quest is accepted) and he speaks again',r['st']==1 and r['on'] and r['i']==0,r)
    pg.keyboard.press('Escape');ok=until("()=>!IM220.on&&pl.visible",20000)
    r=ev("()=>({mode:xwMode,hide:$('xw').classList.contains('hide'),body:document.body.className,hud:getComputedStyle($('topl')).visibility})")
    chk('Esc ends the conversation cleanly',ok and r['mode']=='' and r['hide'] and 'im220' not in r['body'] and r['hud']!='hidden',r)
    errs=[l for l in ev("()=>[]")]
play.run(s,w=1280,hh=760)
logs=open(play.TMP+'/lastlogs.txt').read()
chk('no page errors','PAGEERROR' not in logs,[l for l in logs.split('\n') if 'PAGEERROR' in l][:3])
print('v220_immersion:', 'ALL PASS' if not bad else 'FAILED %d'%len(bad))
import sys;sys.exit(1 if bad else 0)
