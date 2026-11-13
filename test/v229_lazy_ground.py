# v229 lazy ground: a chunk's ground mesh is built when the chunk is first shown and freed when it has been out of sight.
#   python3 v229_lazy_ground.py      prints FAIL lines; ends with "==== v229_lazy_ground: N fails ===="
# Checks: only the chunks near the hero are built at the start; every shown chunk has its real ground (in Duskhold, after
# travelling into a zone, and back); chunks left behind are freed; a built chunk's heights equal the height field;
# LT229.on=false builds every chunk (the old behaviour) and turning it on again frees them.
import play,json
fails=0
def bad(msg):
    global fails;fails+=1;print('FAIL',msg)
ST="""()=>{let lazy=0,on=0,onBuilt=0,stale=0;const now=performance.now();CHL.forEach(c=>{const t=c.lt;if(!t)return;lazy++;if(c.on){on++;if(t.g&&t.m.geometry===t.g&&t.g.attributes.uv)onBuilt++}
  else if(t.g&&now-t.t>LT229.keep+4000)stale++;if(!t.g&&t.m.geometry!==LT229.ph)stale+=1000});
  return {lazy,on,onBuilt,built:LT229.built.size,stale,st:LT229.st,ins:(curIns()||{}).n||'town'}}"""
HEI="""()=>{let n=0,badv=0;for(const c of LT229.built){if(n++>40)break;const P=c.lt.g.attributes.position;for(let k=0;k<P.count;k++)if(Math.abs(P.getY(k)-GHv(P.getX(k),P.getZ(k)))>1e-4)badv++}return {n,badv}}"""
def wait(pg,cond,ms=60000):
    t=0
    while t<ms:
        if pg.evaluate(cond):return True
        pg.wait_for_timeout(500);t+=500
    return False
def s(pg):
    pg.set_default_timeout(900000);ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(4000)
    a=ev(ST);print('start',json.dumps(a))
    if a['lazy']<1000:bad('expected over 1000 lazy ground chunks, got %d'%a['lazy'])
    if a['on']<4 or a['onBuilt']!=a['on']:bad('Duskhold: %d chunks shown, %d with ground'%(a['on'],a['onBuilt']))
    if a['built']>a['lazy']*.25:bad('too many chunks built at the start: %d of %d'%(a['built'],a['lazy']))
    h=ev(HEI);print('heights',h)
    if h['badv']:bad('%d ground vertices differ from the height field'%h['badv'])
    # into a zone
    ev("()=>{const q=PMAP[1].ins[0],w=q.wp[Math.floor(q.wp.length/2)];toPos(w[0],w[1],0);LT229.keep=800}")
    wait(pg,"()=>{const I=curIns();return !!I&&CHL.some(c=>c.on&&c.lt)}");pg.wait_for_timeout(2500)
    b=ev(ST);print('zone',json.dumps(b))
    if b['ins']=='town':bad('did not arrive in a zone')
    if b['on']<4 or b['onBuilt']!=b['on']:bad('zone: %d chunks shown, %d with ground'%(b['on'],b['onBuilt']))
    if not wait(pg,"()=>LT229.st.frees>0",90000):bad('no chunk was freed after leaving Duskhold')
    pg.wait_for_timeout(6000);c=ev(ST);print('zone later',json.dumps(c))
    if c['stale']:bad('%d chunks out of sight still hold ground (or lost their placeholder)'%c['stale'])
    if c['onBuilt']!=c['on']:bad('zone later: %d shown, %d with ground'%(c['on'],c['onBuilt']))
    h=ev(HEI)
    if h['badv']:bad('zone: %d ground vertices differ from the height field'%h['badv'])
    # back to Duskhold: its ground comes back
    ev("()=>{const T=TOWNS[0];toPos(T.cx,T.cy+6,0)}");wait(pg,"()=>!curIns()");pg.wait_for_timeout(2500)
    d=ev(ST);print('back',json.dumps(d))
    if d['on']<4 or d['onBuilt']!=d['on']:bad('back in Duskhold: %d shown, %d with ground'%(d['on'],d['onBuilt']))
    # the old behaviour on demand, and back
    ev("()=>{LT229.on=false}");wait(pg,"()=>LT229.built.size>=CHL.filter(c=>c.lt).length",60000)
    e=ev(ST);print('all',json.dumps(e))
    if e['built']!=e['lazy']:bad('LT229.on=false built %d of %d'%(e['built'],e['lazy']))
    ev("()=>{LT229.on=true}")
    if not wait(pg,"()=>LT229.built.size<CHL.filter(c=>c.lt).length*.25",120000):bad('chunks were not freed after LT229.on=true (%d built)'%ev("()=>LT229.built.size"))
    f=ev(ST);print('lazy again',json.dumps(f))
    if f['onBuilt']!=f['on']:bad('lazy again: %d shown, %d with ground'%(f['on'],f['onBuilt']))
    errs=[l for l in ev("()=>[]")]
    print('==== v229_lazy_ground: %d fails ===='%fails)
play.run(s)
