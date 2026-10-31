# v185: measured audit of every instance (in the suite as LIGHT=1: terrain and decoration checks) (v185_audit.js): decorations clipping into other objects or each other, terrain spikes,
# pits, steps in walkable ground, holes, NaN, dry water tiles, and near-black flat pieces. Prints a summary per instance and
# FAIL lines over the limits; the whole result goes to out/v185_audit.json.
#   python3 v185_audit.py [regex on the instance name]     LIGHT=1: skip the per-visit clip measure (slow), keep terrain and decoration checks
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
H=os.path.dirname(os.path.abspath(__file__));FLT=sys.argv[1] if len(sys.argv)>1 else '.'
LIM={'clip':int(os.environ.get('LIM_CLIP',0)),'wdwd':int(os.environ.get('LIM_WDWD',0)),'spike':0,'pit':999,'hole':0,'nan':0,'step':999,'dark':int(os.environ.get('LIM_DARK',0))}   # pits: burrows and quest holes are meant; steps: the courses and the temple terraces
fails=[]
def F(m):fails.append(m);print('FAIL',m,flush=True)
def s(pg):
    pg.set_default_timeout(3600000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{try{CHEAT.god=true}catch(_){}}")
    r=pg.evaluate(open(H+'/v185_audit.js').read(),{'flt':FLT,'light':bool(os.environ.get('LIGHT'))})
    json.dump(r,open(play.TMP+'/v185_audit.json','w'),indent=1)
    for I in r['inst']:
        t=I['terrain'];print('%-36s visits %2d  clip %3d  wd-wd %3d  spike %d pit %d step %d hole %d nan %d dry-water %d  dark %d'%(I['n'],I['visits'],len(I['clip']),len(I['wdwd']),len(t['spike']),len(t['pit']),len(t['step']),len(t['hole']),len(t['nan']),len(t['wet']),len(I['dark'])),flush=True)
        for k,v in [('clip',I['clip']),('wdwd',I['wdwd']),('spike',t['spike']),('pit',t['pit']),('hole',t['hole']),('nan',t['nan']),('step',t['step']),('dark',I['dark'])]:
            if len(v)>LIM[k]:F('%s: %d %s %s'%(I['n'],len(v),k,json.dumps(v[:4])))
    print('tidy',r.get('tidy'),'ponds',r.get('ponds'))
    if not r.get('tidy') or r['tidy']['overlap']<50:F('the decoration tidy did not run (%s)'%r.get('tidy'))
    if not r.get('ponds'):F('the pond shores were not rounded')
    print('audit ms',r['ms']);print('FAILS',len(fails))
    print('V185_AUDIT_OK' if not fails else 'V185_AUDIT_FAIL')
play.run(s)
