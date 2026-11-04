# v195 co-op: a partner sees the new weasel Ranger (beast kit body, sculpted head) and its motion layer runs on the partner's copy.
# Run: MPB=ranger python3 v195_coop_weasel.py   (opens the two co-op windows through mpt.py; window B plays the Ranger)
if 'A' not in globals():
    import os,sys,subprocess;os.environ.setdefault('MPB','ranger');sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
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
mine=B.evaluate("()=>({cls:hero.cls,race:pl._race,key:pl._mdKey,n:huBody(pl).geometry.attributes.position.count})")
SEE="""()=>{const r=Object.values(MP.rh)[0];if(!r||!r.m)return null;const m=r.m,b=huBody(m);return {race:m._race,key:m._mdKey,n:b&&b.geometry?b.geometry.attributes.position.count:0,bfm:!!m._bfm,bf:!!(BRD[5]&&BRD[5].bf)}}"""
ok=poll(lambda:(A.evaluate(SEE) or {}).get('race')==5,60000)
r=A.evaluate(SEE)
chk('B plays the weasel Ranger',mine['cls']=='ranger' and mine['race']==5,json.dumps(mine))
chk('partner sees the weasel with the same new model (key and vertex count)',bool(r and r['race']==5 and r['key']==mine['key'] and r['n']==mine['n'] and r['bf']),json.dumps({'partner':r,'own':mine}))
ok=poll(lambda:(A.evaluate(SEE) or {}).get('bfm'),30000)
chk("the motion layer (springs, gestures) runs on the partner's copy",ok,json.dumps(A.evaluate(SEE)))
