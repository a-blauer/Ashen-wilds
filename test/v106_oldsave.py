# v106: a save from the v97 layout (one big map per zone) loads into the instanced world.
# Step 1 on the old build:  MODE=make SRC=<old build> AW_TMP=<dir> python3 v106_oldsave.py   (writes <AW_TMP>/oldsave.json)
# Step 2 on this build:     MODE=check OLDSAVE=<that file> python3 v106_oldsave.py
# Expect: standing in Hillside Crest -> Hillside Crest I's entrance; every instance of the open zones reached; the treasure
# map re-placed inside one instance; no saved recall spot from the old layout; no page errors.
import play,json,os
MODE=os.environ.get('MODE','check')
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    if MODE=='make':
        ev("()=>localStorage.clear()")
        pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="ranger"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
        ev("()=>{POST.render=()=>{};window.requestAnimationFrame=cb=>setTimeout(()=>cb(performance.now()),16)}")
        ev("()=>{enterMap(0)}");pg.wait_for_timeout(2000)
        ev("()=>{const e=bossEnt(0);hurt(e,1e9,1)}");pg.wait_for_timeout(2500)
        r=ev("()=>{const p=PMAP[1],q=p.path[300];toPos(q[0],q[1]);giveMap(pl.position);recallTown();RECBACK=0;const q2=p.path[320];toPos(q2[0],q2[1]);saveGame(true);const k=Object.keys(localStorage).find(k=>{try{return JSON.parse(localStorage.getItem(k)).hero}catch(_){return false}});return {k,v:localStorage.getItem(k),pos:[pl.position.x,pl.position.z],tm:tmaps.length,inst:!!INST}}")
        open(play.TMP+'/oldsave.json','w').write(json.dumps(r));print('MADE',r['k'],r['pos'],r['tm'],r['inst'],'ERRS',errs)
        return
    o=json.load(open(os.environ['OLDSAVE']))
    ev("([k,v])=>{localStorage.clear();localStorage.setItem(k,v)}",[o['k'],o['v']])
    pg.reload(wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(3000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(500)
    pg.click('#svpC',timeout=60000);pg.wait_for_timeout(4000)
    r=ev("()=>{const I=curIns();return {ins:I&&I.n,atEntrance:I&&Math.hypot(pl.position.x-I.en[0],pl.position.z-I.en[1])<1,insr:INSR,boss:[...bossDone],inst:INST,tm:tmaps.map(m=>[m.r,m.k,rgAt(Math.round(m.x),Math.round(m.z))===tmG(m)])}}")
    print('LOADED',json.dumps(r))
    ok=r['ins']=='Hillside Crest I' and r['atEntrance'] and r['insr'][:2]==[2,2] and r['insr'][2]==0 and r['inst'] is None and len(r['tm'])==1 and r['tm'][0][0]==1 and r['tm'][0][2] and not errs
    print('OLDSAVE','PASS' if ok else 'FAIL','ERRS',errs)
play.run(s,w=900,hh=560)
