# v168: camps on terraces ('tiers' ground, 2270 cs123Op) have a flat top. Before, the top terrace only reached its full height at
# the centre point, so the Serpent Shrine's coiled idol (and every tiers camp's centrepiece) stood on a cone ~0.8 above the ground
# round its base. Checks: for every tiers camp the ground under a 1.7-tile circle round the centre is level with the centre (within
# .06), and the Serpent Shrine's idol base sits on it.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2000)
    r=pg.evaluate("""()=>{const P=cs123Plan(),out=[];CAMPS.forEach(C=>{const D=P[C.key];if(!D||!D.t.some(o=>o[0]=='tiers'))return;const y0=GH(C.x,C.z);let worst=0;
        for(let k=0;k<16;k++){const a=k/16*6.283;for(const d of [.8,1.7]){const h=GH(C.x+Math.cos(a)*d,C.z+Math.sin(a)*d);worst=Math.max(worst,Math.abs(h-y0))}}
        out.push([C.key,D.n,+worst.toFixed(3)])});return out}""")
    print(json.dumps(r))
    if len(r)<5:F('expected the tiers camps (found %d)'%len(r))
    for k,n,w in r:
        if w>.06:F('%s %s: the top terrace is not flat round the centre (%.2f)'%(k,n,w))
    if not any(n=='Serpent Shrine' for k,n,w in r):F('the Serpent Shrine camp is not on terraces any more')
    print('v168 tiers:',len(fails),'fails')
play.run(s)
