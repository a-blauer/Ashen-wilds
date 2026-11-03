# v194 co-op: a partner sees runed gear (weapon aura shells + motes, armour glow) on your hero.
# Run: python3 v194_coop_runes.py   (opens the two co-op windows through mpt.py)
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
for pg in (A,B):pg.evaluate("()=>FAST()")
def tick(ms):
    for i in range(max(1,ms//400)):
        (A if i%2 else B).bring_to_front();A.wait_for_timeout(400)
def poll(f,ms=40000):
    import time;t0=time.time()
    while True:
        try:
            if f():return True
        except Exception as e:
            if 'closed' in str(e):raise
        if (time.time()-t0)*1000>=ms:return False
        tick(400)
def chk(name,ok,info=''):print(('PASS ' if ok else 'FAIL ')+name,info,flush=True)
p=A.evaluate("()=>{const p=PMAP[0].ins[0].path[60];return p}")
A.evaluate("(p)=>toPos(p[0],p[1])",p);B.evaluate("(p)=>toPos(p[0]+2.2,p[1]+1)",p)
H,G=mp_roles(60000)
B.evaluate("""()=>{const c=hero.cls,arm=CLS[c].arm,W=ITPL.findIndex(q=>q.sl=='weapon'&&q.cls==c&&q.t==2),C=ITPL.findIndex(q=>q.sl=='chest'&&q.arm==arm&&q.t==2);
  eq.weapon={id:7001,tp:W,lv:25,req:1,r:3,up:0,aff:[],rs:2,ru:['r_ember','r_frost']};eq.chest={id:7002,tp:C,lv:25,req:1,r:3,up:0,aff:[],rs:1,ru:['r_vigor2']};hero.lvl=Math.max(hero.lvl,25);hsDirty();refreshGear()}""")
SEE="""()=>{const r=Object.values(MP.rh)[0];if(!r||!r.m)return null;let sh=0,pt=0,gl=0;r.m.traverse(o=>{if(o.userData&&o.userData.rv194){if(o.isPoints&&o.parent&&o.parent.isBone)gl++;else if(o.isPoints)pt++;else if(o.isMesh)sh++}});return {sh,pt,gl,key:(r.m._mdKey||'').includes('rn:')}}"""
ok=poll(lambda:(A.evaluate(SEE) or {}).get('sh',0)>0,60000)
r=A.evaluate(SEE);mine=B.evaluate("()=>{let sh=0,pt=0,gl=0;pl.traverse(o=>{if(o.userData&&o.userData.rv194){if(o.isPoints&&o.parent&&o.parent.isBone)gl++;else if(o.isPoints)pt++;else if(o.isMesh)sh++}});return {sh,pt,gl}}")
chk('partner sees the runed weapon (aura shells and motes)',bool(r and r['sh']>0 and r['pt']>0),json.dumps({'partner':r,'own':mine}))
chk('partner sees the runed chest (model key and glow points)',bool(r and r['key'] and r['gl']>0),json.dumps(r))
B.evaluate("()=>{eq.weapon.ru=[];eq.chest.ru=[];hsDirty();refreshGear()}")
ok=poll(lambda:(A.evaluate(SEE) or {}).get('sh',1)==0,60000)
chk('runes gone on the partner too after they are destroyed',ok,json.dumps(A.evaluate(SEE)))
