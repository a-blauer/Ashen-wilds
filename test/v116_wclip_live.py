# v116: the frog Mage's real attacks (player, live animation): weapon points inside the shell during each combo hit and cast.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
LIB=open(os.path.dirname(os.path.abspath(__file__))+'/v116_wclip_lib.js').read()
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="mage"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{"+LIB+"}")
    r=ev("""()=>new Promise(res=>{POST.render=()=>{};const out=[];let n=0,mx=0,fr=0;const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);if((!h||h===pl)&&HA.cur){const m=WCLIP.measure(pl);fr++;n+=m.inside;if(m.inside>mx){mx=m.inside;out.push([+(HA.cur.k||0).toFixed(2),pl._brS?+pl._brS.a.toFixed(2):-1,m.inside,m.depth])}}return r};
      let k=0;const go=()=>{if(k>=6){animHero=f;res({frames:fr,inside:n,worst:mx,at:out});return}atkCd=0;comboT=0;swing();k++;setTimeout(go,900)};go()})""")
    print('RESULT',r)
play.run(s)
