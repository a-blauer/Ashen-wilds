# v161: key bindings (Settings → Keyboard) and UI size settings.
# Presses real keys through Playwright and checks what the game's own key handlers see; prints FAIL lines on a wrong result.
import os,json,play
fails=[]
def ck(c,msg):
    if not c:fails.append(msg);print('FAIL',msg)
def s(pg):
    pg.set_default_timeout(600000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    # record the key each press reaches the game with (a bubbling listener added last runs after the game's own)
    pg.evaluate("()=>{window.__k=[];addEventListener('keydown',e=>__k.push(e.key));window.__cast=[];const f=cast;cast=function(i){__cast.push(i);return f.apply(this,arguments)}}")
    E=lambda js:pg.evaluate(js)
    def press(k):
        pg.evaluate("()=>{__k=[];__cast=[]}");pg.keyboard.press(k);pg.wait_for_timeout(150);return E("()=>({k:__k.slice(),c:__cast.slice()})")
    hidden=lambda i:E("()=>document.getElementById('%s').classList.contains('hide')"%i)
    closeAll=lambda:E("()=>{['bag','tal','xw','setw','inc','cmp','wmap'].forEach(i=>{const e=document.getElementById(i);if(e)e.classList.add('hide')})}")
    # 1. defaults: nothing is rewritten
    r=press('i');ck(not hidden('bag'),'I should open the inventory by default');ck(r['k']==['i'],'default key reaches the game unchanged: %s'%r['k']);closeAll()
    ck(E("()=>KB161.on")==False,'no custom keys at start')
    # 2. bind Inventory to J through the Settings window
    E("()=>openSet()");pg.wait_for_timeout(200)
    E("()=>{const d=document.getElementById('kb161');d.open=true}")
    pg.click('#kb161 [data-kb=inv]');pg.wait_for_timeout(100)
    ck(E("()=>!!KB161.cap"),'clicking a key button waits for a key')
    pg.keyboard.press('j');pg.wait_for_timeout(150)
    ck(E("()=>SET.keys&&SET.keys.inv")=='j','inventory saved as J: %s'%E("()=>JSON.stringify(SET.keys)"))
    ck(not hidden('setw'),'pressing the new key does not close Settings')
    ck(E("()=>document.querySelector('#kb161 [data-kb=inv]').textContent")=='J','the button shows J')
    # Esc while waiting cancels without closing the window
    pg.click('#kb161 [data-kb=map]');pg.keyboard.press('Escape');pg.wait_for_timeout(150)
    ck(not hidden('setw'),'Esc while waiting for a key keeps Settings open');ck(E("()=>!(SET.keys&&'map' in SET.keys)"),'Esc did not bind anything')
    closeAll()
    r=press('j');ck(not hidden('bag'),'J now opens the inventory');ck(r['k']==['i'],'J reaches the game as i: %s'%r['k']);closeAll()
    r=press('i');ck(hidden('bag'),'I no longer opens the inventory');closeAll()
    # 3. a key that is already used swaps: Inventory → C, Character takes J
    E("()=>openSet()");E("()=>{document.getElementById('kb161').open=true}")
    pg.click('#kb161 [data-kb=inv]');pg.keyboard.press('c');pg.wait_for_timeout(150)
    k=E("()=>JSON.stringify(SET.keys)");ck(E("()=>SET.keys.inv=='c'&&SET.keys.char=='j'"),'swap Inventory C / Character J: %s'%k)
    closeAll()
    press('c');ck(not hidden('bag'),'C opens the inventory after the swap');closeAll()
    press('j');ck(not hidden('tal'),'J opens Character after the swap');closeAll()
    # 4. movement: Move forward on ArrowUp → holding it moves like W; W itself is blocked
    E("()=>{SET.keys=Object.assign({},SET.keys,{up:'arrowup'});saveSet();kb161Apply()}")
    pg.keyboard.down('ArrowUp');pg.wait_for_timeout(100);ck(E("()=>K.w===1"),'ArrowUp held = W held: K=%s'%E("()=>JSON.stringify(K)"))
    pg.keyboard.up('ArrowUp');pg.wait_for_timeout(100);ck(E("()=>!K.w"),'releasing ArrowUp releases W')
    pg.keyboard.down('w');pg.wait_for_timeout(100);ck(E("()=>!K.w"),'W does nothing once Move forward moved');pg.keyboard.up('w')
    # 5. ability 1 on F1, Shift+F1 too; the hotbar shows F1
    E("()=>{SET.keys=Object.assign({},SET.keys,{a1:'f1'});saveSet();kb161Apply();hud()}");pg.wait_for_timeout(200)
    r=press('F1');ck(0 in r['c'],'F1 casts ability 1: %s'%r)
    lab=E("()=>{const b=document.querySelector('#acts .hs[data-x=\"0\"] .kb')||document.querySelector('#acts .hs[data-x=\"E0\"] .kb');return b&&b.textContent}")
    ck(lab=='F1','hotbar slot 1 shows F1: %s'%lab)
    r=press('1');ck(0 not in r['c'],'1 no longer casts ability 1')
    ck(E("()=>[...document.querySelectorAll('#sysmenu kbd')].some(k=>k.textContent=='C')"),'the menu shows C for the inventory')
    # typing in a text box is never rewritten
    E("()=>{const i=document.createElement('input');i.id='t161';document.body.appendChild(i);i.focus()}")
    E("()=>{const i=document.getElementById('t161');i.addEventListener('keydown',e=>e.stopPropagation())}")
    pg.keyboard.type('jcw');ck(E("()=>document.getElementById('t161').value")=='jcw','typing in a text box is untouched');E("()=>{const i=document.getElementById('t161');i.blur();i.remove()}")
    # 6. reset
    closeAll();E("()=>openSet()");E("()=>{document.getElementById('kb161').open=true}");pg.click('#kb161r');pg.wait_for_timeout(100)
    ck(E("()=>!KB161.on&&!Object.keys(SET.keys||{}).length"),'Reset all keys clears every binding');closeAll()
    press('i');ck(not hidden('bag'),'I opens the inventory again after reset');closeAll()
    ck(E("()=>JSON.parse(localStorage.getItem('et_set')).keys")=={},'saved bindings cleared')
    # 7. UI size: the HUD slider scales the HUD, the bar and the minimap; Reset brings 100% back
    z0=E("()=>document.getElementById('bbar').getBoundingClientRect().width")
    E("()=>{const i=document.getElementById('s161_hud');i.value=1.4;i.dispatchEvent(new Event('input'));i.dispatchEvent(new Event('change'))}");pg.wait_for_timeout(200)
    z1=E("()=>document.getElementById('bbar').getBoundingClientRect().width")
    ck(E("()=>Math.abs(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--kqHud'))-1.4)<.01"),'HUD 140%% sets the HUD size: %s'%E("()=>getComputedStyle(document.documentElement).getPropertyValue('--kqHud')"))
    ck(z1>z0*1.05 or E("()=>UI161.bar")<1.39,'the bottom bar grows with the HUD size (or is held to the window): %s → %s'%(z0,z1))
    ck(E("()=>SET.ui161&&SET.ui161.hud==1.4"),'HUD size saved')
    E("()=>{const i=document.getElementById('s161_menu');i.value=.8;i.dispatchEvent(new Event('input'));i.dispatchEvent(new Event('change'))}");pg.wait_for_timeout(200)
    ck(E("()=>Math.abs(parseFloat(getComputedStyle(document.querySelector('#setw .win')).zoom)-.8)<.02"),'Menus 80%% shrinks the windows: %s'%E("()=>getComputedStyle(document.querySelector('#setw .win')).zoom"))
    E("()=>document.getElementById('s161_reset').click()");pg.wait_for_timeout(200)
    ck(E("()=>Math.abs(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--kqHud'))-1)<.01"),'Reset interface size → 100%')
    # the location box and menu buttons stay under the minimap at every HUD size
    for v in [.6,1,1.5]:
        E("()=>{SET.ui161={hud:%s};ui161Lay(true)}"%v);pg.wait_for_timeout(100)
        g=E("()=>{const m=document.getElementById('mini').getBoundingClientRect(),l=document.getElementById('locBox').getBoundingClientRect(),b=document.getElementById('sysBtn').getBoundingClientRect();return {m:[m.left,m.bottom,m.right],l:[l.left,l.top,l.right,l.bottom],b:[b.top,b.right]}}")
        ck(g['l'][1]>=g['m'][1]-1 and abs(g['l'][0]-g['m'][0])<12,'HUD %s: location box under the minimap %s'%(v,g))
        ck(g['b'][0]>=g['l'][3]-1 and abs(g['b'][1]-g['m'][2])<12,'HUD %s: menu button under the location box %s'%(v,g))
    E("()=>{SET.ui161={};saveSet();ui161Lay(true)}")
play.run(s,w=1100,hh=700)
print('DONE',len(fails),'failures')
