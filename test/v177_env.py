# v177: the zones' scenery sits on the ground and holds together (owner: "check all environment pieces on each instance in each zone
# ... for unattached pieces"). Two passes over the whole world (every instance is built at load; lazily built camps and set pieces
# are made by visiting each instance first):
#   1. scattered decorations (WD kinds, 1680/1981/2280): FAIL when a kind has a part that touches nothing and hangs above the
#      ground, or a placed piece has a gap under its base over .12 (env177Seat leans, sinks or hides it: 3370); FAIL when more
#      than 1600 pieces are hidden (too steep), or any hidden piece stands deep inside walkable ground with a collider.
#   2. every other scenery object: FAIL for a lit part that touches nothing and hangs more than .12 above the ground (a lintel,
#      a name plate, tusks, cloth, reeds), apart from the spots in OK below (looked at: attached within the measure's tolerance).
#   Plus: the grade ran on every kind (ENV177.look), no console errors.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
H=os.path.dirname(os.path.abspath(__file__))
fails=[]
def F(m):fails.append(m);print('FAIL',m,flush=True)
OK=[('Kindlelight · Sovereign’s Den',(0.3,0.6,0.3)),('Hillside Crest III',(0.3,0.2,0.7))]
# spots looked at: shelf fungi on the side of a fallen log (the log is an instanced decoration, which this pass does not see)
OKAT=[('Kindlelight III',708,151,9)]
def s(pg):
    pg.set_default_timeout(2400000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    errs=pg.evaluate("()=>{window.__e176=[];const oe=console.error;console.error=(...a)=>{window.__e176.push(a.map(String).join(' ').slice(0,200));oe(...a)};return 1}")
    r=pg.evaluate(open(H+'/v177_env_wd.js').read())
    E=r.get('E') or {};print('seated',E.get('n'),'hidden',E.get('hid'),'look',E.get('look'),'banks',E.get('banks'),flush=True)
    if not E.get('look') or E['look'].get('kinds',0)<150:F('the grade did not run over the decorations (%s)'%E.get('look'))
    if (E.get('hid') or 0)>1600:F('%s pieces hidden as too steep (more than 1600)'%E.get('hid'))
    for k,v in sorted(r['kinds'].items()):
        if v['det']:F('%s has a part that touches nothing, above the ground: %s'%(k,v['det'][:2]))
        if v['nFloat'] and v['h']>.06:F('%s: %d pieces with a gap under the base (worst %s: gap, x, z)'%(k,v['nFloat'],v['worst'][:2]))
    for k,L in r['hid'].items():
        deep=[a for a in L if a[2]<-12]
        if deep:F('%s hidden deep in walkable ground at %s'%(k,deep[:3]))
    r=pg.evaluate(open(H+'/v177_env_scene.js').read())
    print('objects',r['nobj'],'skipped',r['skipped'],'visited',len(r['vis']),flush=True)
    for o in r['out']:
        for f in o['fl']:
            if f['gap']<=.12:continue
            sz=tuple(round(v,1) for v in f['sz'])
            if any(o['ins']==a and sz==b for a,b in OK):continue
            if any(o['ins']==a and abs(f['at'][0]-x)<r and abs(f['at'][2]-z)<r for a,x,z,r in OKAT):continue
            F('%s: a part hangs %.2f above the ground, touching nothing (size %s at %s, object at %s)'%(o['ins'],f['gap'],sz,f['at'],o['pos']))
    for e in pg.evaluate("()=>window.__e176||[]"):F('console error: '+e)
play.run(s)
print('RESULT',('FAIL %d'%len(fails)) if fails else 'PASS')
