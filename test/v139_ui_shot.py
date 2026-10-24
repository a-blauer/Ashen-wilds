# v139: screenshots of windows (WIN=bag,tal,abil,char) for the attribute / character screen work
import play,os
W=os.environ.get('WIN','bag,tal').split(',');TAG=os.environ.get('TAG','')
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="'+os.environ.get('CLS','warrior')+'"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    if os.environ.get('JS'):print('JS',ev(open(os.environ['JS']).read()))
    for w in W:
        if w not in ("auto","apply","plus"):ev("()=>{closeWin&&closeWin();if(typeof closeX=='function')try{closeX()}catch(_){}return 1}")
        if w=='bag':ev("()=>{$('bagBtn').click();return 1}")
        elif w=='tal':ev("()=>{openTal();return 1}")
        elif w=='abil':ev("()=>{openAbil();return 1}")
        elif w=='auto':ev("()=>{atr139Auto();ch139Render();return 1}")
        elif w=='plus':ev("()=>{atr139Undo();atr139Add('str',9);atr139Add('vig',10);ATR139.sel='str';ch139Render();return 1}")
        elif w=='apply':ev("()=>{atr139Apply();openTal();return 1}")
        elif w.startswith('key'):pg.keyboard.press(w[3:])
        pg.wait_for_timeout(1500)
        pg.screenshot(path=play.TMP+'/v139_ui_'+w+TAG+'.png')
        print('shot',w,flush=True)
play.run(s,w=int(os.environ.get('VW','820')),hh=int(os.environ.get('VH','520')))
