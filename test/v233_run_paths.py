# v233 the Sandstorm Run: how its creatures move (owner, Nov 14 2026: "The enemy movement and pathing needs to be improved in the
# duneskimmer level"). A 75 s ride on the autopilot with the real spawner; every creature is watched every frame:
# none inside the dune walls, none through a boulder or spire, swarms not standing inside one another, none through the hull
# (a charging Shellback and a jump over them aside), no turning on the spot in one frame, scorpions not running backwards.
# Before 4080 the same ride gave: wall 3115, rock 264, stack 12241, overlap 41159, snap 531, inHull 715, scorpions sideways 798.
#   python3 v233_run_paths.py
import play,json,os
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c:fails.append(m)
JS=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v233_run_paths.js')).read()
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:3000])
    ok(r.get('stat'),'the Run starts')
    if not r.get('stat'):return
    st,per,k=r['stat'],r['per'],r['kinds'];n=max(1,st['n'])
    ok(st['n']>15000 and k.get('sc',0)>8000 and k.get('sp',0)>500 and k.get('sb',0)>200,'creatures of every kind were watched (%s creature-frames: %s)'%(st['n'],k))
    ok(st['wall']<=n*.001,'none run inside the dune walls (%s)'%st['wall'])
    ok(st['rock']<=n*.0005,'none run through a boulder or a salt spire (%s)'%st['rock'])
    ok(st['stack']<=n*.02,'a swarm does not stand on one spot (%s pairs on one spot; 12241 before)'%st['stack'])
    ok(st['overlap']<=n*.2,'creatures keep apart (%s overlapping pairs; 41159 before)'%st['overlap'])
    ok(st['inHull']<=n*.004,'none run through the hull (%s; 715 before)'%st['inHull'])
    ok(st['snap']<=n*.0006,'none turn on the spot in one frame (%s; 531 before)'%st['snap'])
    sp=per.get('sp',{}).get('crab',0)+per.get('gs',{}).get('crab',0);ok(sp<=max(40,(k.get('sp',0)+k.get('gs',0))*.03),'scorpions run the way they face (%s frames sideways or backwards; 1000 before)'%sp)
    ok(not r['errs'] and r['err']==[0,0,0,0,0],'no errors %s %s'%(r['errs'],r['err']))
play.run(s)
print('v233 run paths:','ALL PASS' if not fails else 'FAILED %d'%len(fails))
if fails:raise SystemExit(1)
