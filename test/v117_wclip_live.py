# v116: the Mage's (raven since v133) real attacks (player, live animation): weapon points inside the shell during each combo hit and cast.
#   WT=wand|orb equips that weapon first (default: the starting staff)
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
LIB=open(os.path.dirname(os.path.abspath(__file__))+'/v117_wclip_lib.js').read()
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="mage"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{"+LIB+"}")
    WT=os.environ.get('WT')
    if WT:print('weapon',ev("(wt)=>{const it=tp=>({id:-1,tp,lv:1,req:1,r:2,up:0,aff:[]});const i=ITPL.findIndex((t,j)=>t.sl=='weapon'&&t.cls=='mage'&&itT(it(j)).wt==wt);if(i<0)return 'MISSING';eq.weapon=it(i);refreshGear(pl,'mage',eq);return ITPL[i].n}",WT))
    r=ev("""()=>new Promise(res=>{POST.render=()=>{};const out=[];let n=0,mx=0,fr=0;const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);if((!h||h===pl)&&HA.cur){const m=WCLIP.measure(pl);fr++;n+=m.inside;if(m.inside>mx){mx=m.inside;out.push([+(HA.cur.k||0).toFixed(2),pl._brS?+pl._brS.a.toFixed(2):-1,m.inside,m.depth])}}return r};
      let k=0;const go=()=>{if(k>=6){animHero=f;res({frames:fr,inside:n,worst:mx,at:out});return}atkCd=0;comboT=0;swing();k++;setTimeout(go,900)};go()})""")
    print('RESULT',r)
play.run(s)
