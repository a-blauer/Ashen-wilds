# v109: a v108 kingdom save (2 Sovereigns, 14 buildings + 3 houses on the old 31-lot layout, standing in the old south ward)
# loads into the walled kingdom: the stage fits every building, each has a lot inside the walls, doors reachable, the hero
# is not left inside a wall or a building, no page errors.
# Step 1 on the old build:  MODE=make SRC=<v108 build> AW_TMP=<dir> python3 v109_oldsave.py   (writes <AW_TMP>/oldsave109.json)
# Step 2 on this build:     MODE=check OLDSAVE=<that file> python3 v109_oldsave.py
import play,json,os
MODE=os.environ.get('MODE','check')
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    if MODE=='make':
        ev("()=>localStorage.clear()")
        pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="ranger"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
        ev("()=>{POST.render=()=>{};window.requestAnimationFrame=cb=>setTimeout(()=>cb(performance.now()),16)}")
        r=ev("""()=>{gold=1e7;for(const k of Object.keys(RES))mats[k]=5000;['Rock Core','Silk Gland','Ectoplasm'].forEach(k=>mats[k]=500);bossDone.add(0);bossDone.add(1);
          SHOPS.forEach(o=>SH.shop[o.k]=1);SHU.forEach(u=>SH.lv[u.k]=1);shApply();['A3','B3','C4'].forEach(id=>hsBuy103(id));const T=TOWNS[0];toPos(T.cx+7,T.cy+40);saveGame(true);
          const k=Object.keys(localStorage).find(k=>{try{return JSON.parse(localStorage.getItem(k)).x2}catch(_){return false}});return {k,v:localStorage.getItem(k),pos:Object.assign({},SH.pos),h:HS103.h.length}}""")
        open(play.TMP+'/oldsave109.json','w').write(json.dumps(r));print('MADE',r['k'],r['pos'],r['h'],'ERRS',errs)
        return
    o=json.load(open(os.environ['OLDSAVE']))
    ev("([k,v])=>{localStorage.clear();localStorage.setItem(k,v)}",[o['k'],o['v']])
    pg.reload(wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(3000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(500)
    pg.click('#svpC',timeout=60000);pg.wait_for_timeout(4000)
    r=ev("""()=>{const T=TOWNS[0],p=pl.position,keys=Object.keys(SH.pos);return {st:kf109(),n:keys.length,h:HS103.h.length,pos:Object.assign({},SH.pos),allIn:keys.every(k=>{const l=lotOf103(k);return l&&kfIn109(l.x,l.z,3)}),
      doors:kfDoors109(),stuck:solid(p.x,p.z)||tcHit(p.x,p.z),at:[+(p.x-T.cx).toFixed(1),+(p.z-T.cy).toFixed(1)],area:areaName(),shops:SHOPS.map(o=>!!TWN100_S.b[o.k]||o.k=='stable'&&!!STB.g)}}""")
    print('LOADED',json.dumps(r))
    ok=r['st']['s']==4 and r['n']==17 and r['h']==3 and r['allIn'] and r['doors']==[] and not r['stuck'] and all(r['shops']) and not errs
    print('OLDSAVE','PASS' if ok else 'FAIL','ERRS',errs)
play.run(s,w=900,hh=560)
