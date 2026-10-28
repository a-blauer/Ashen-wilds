# v164: bigger, integrated camps. Runs v164_camps.js (every camp of every field instance built) and checks: no errors while
# building, every camp at least its v123 size and most near the v164 target, camps keep 6+ tiles apart and off the gateway /
# entrance / instance edge, the Glowmire Warren is still Kindlelight II's hatch camp, draw calls and triangles per camp within
# budget, at most 2 lights and CS164.box boxes per camp, and the camp's walkable ground, chest spot and garrison spots reachable.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v164_camps.js')).read()
def s(pg):
    pg.set_default_timeout(2400000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);F=lambda m:print('FAIL',m,flush=True)
    for e in r['err']:F('error: '+e)
    C=r['camps'];print('camps',len(C))
    if len(C)!=54:F('expected 54 camps, got %d'%len(C))
    full=0
    for c in C:
        print(c['k'],c['n'],'r %s -> %s (want %s) dc %s tri %s boxes %s lights %s reach %s'%(c['r0'],c['r'],c['rd'],c['dc'],c['tri'],c['boxes'],c['lights'],c['reach']))
        if c['r']<c['r0']:F('%s smaller than v123 (%s < %s)'%(c['k'],c['r'],c['r0']))
        if c['r']>=c['r0']*1.7:full+=1
        if c['dc']>55:F('%s draws in %d calls'%(c['k'],c['dc']))
        if c['tri']>90000:F('%s has %d triangles'%(c['k'],c['tri']))
        if c['lights']>2:F('%s has %d lights'%(c['k'],c['lights']))
        if c['boxes']>10:F('%s has %d breakable boxes'%(c['k'],c['boxes']))
        if c['reach']<.97:F('%s: only %.1f%% of its walkable ground is reachable'%(c['k'],c['reach']*100))
        if not c['chest']:F('%s: the camp chest spot is not reachable'%c['k'])
        if c['slotsBad']:F('%s: %d garrison spots blocked or unreachable'%(c['k'],c['slotsBad']))
        if not 6.5<=c['sp']<=12:F('%s: garrison spread %s'%(c['k'],c['sp']))
    print('camps grown to 1.7x+: %d / %d'%(full,len(C)))
    if full<40:F('only %d camps grew to 1.7x their v123 size'%full)
    for g,cc,ga,en,ed in r['gaps']:
        if cc<6:F('instance %d: two camps only %d tiles apart'%(g,cc))
        if ga<20:F('instance %d: a camp within %d of the gateway clearing'%(g,ga))
        if en<12:F('instance %d: a camp within %d of the entrance'%(g,en))
        if ed<9:F('instance %d: a camp within %d of the instance edge'%(g,ed))
    if r.get('hatchN')!='Glowmire Warren':F('hatch camp is %s'%r.get('hatchN'))
    print('lights',r['lightsTotal'],'shared materials',r['mats'],'clearing',r.get('grow'))
play.run(s)
