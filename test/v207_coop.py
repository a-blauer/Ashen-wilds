# v207 co-op: what a partner sees of the owner's list: the longer, flowing swing reaches the partner (the relayed pose lasts the
# whole swing), a partner's ghost shot follows the ground like the real one, the new summit crack and the fixed carcass come out
# the same in both windows, and Kindlelight camps have the same (fewer) boxes. Run: python3 v207_coop.py (A = warrior, B = mage)
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
# 1. A's swing: the pose sent to partners lasts the whole (stretched) swing
A.evaluate("()=>{window.__P=[];const f=mpvPush;mpvPush=function(e){try{if(e&&e[0]==='P')__P.push(e[1])}catch(_){}return f.apply(this,arguments)}}")
r=A.evaluate("()=>{tgt=null;atkCd=0;swing();return [HA.cur&&Math.round(HA.cur.ms),Math.round(atkCd*1000),__P.slice(-1)[0]]}")
chk('the stretched swing is what the partner replays',bool(r[0] and r[2] and abs(r[2]-r[0])<=2 and r[0]>=r[1]*.9),json.dumps(r))
# 2. B sees A's ghost shot follow the ground
B.evaluate("()=>{window.__G=[];const f=shotMesh;shotMesh=function(){const m=f.apply(this,arguments);__G.push(m);return m}}")
A.evaluate("()=>{const P=pl.position;launch(P,V(1,0,0),15,{col:0xffffff,basic:1},1,1.2)}")
ok=poll(lambda:B.evaluate("()=>__G.length>0"),30000)
tick(800)
r=B.evaluate("()=>__G.map(m=>[+m.position.x.toFixed(1),+(m.position.y-GH(m.position.x,m.position.z)).toFixed(2)])")
chk('a partner\'s ghost shot rides above the ground',ok and len(r)>0 and all(.5<q[1]<1.5 for q in r),json.dumps(r))
# 3. the same crack, carcass and Kindlelight boxes in both windows
SIG="""()=>{const v=g=>{let n=0;g.traverse(m=>{if(m.geometry&&m.geometry.attributes&&m.geometry.attributes.position)n+=m.geometry.attributes.position.count});return n};
  const C=CAMPS.find(C=>C.key=='0_0_1');if(!C.g)buildCamp(C);const K=CAMPS.filter(C=>String(C.key).split('_')[0]==='0').map(C=>{if(!C.g)buildCamp(C);return C.boxes.length});
  return [v(ch153Crack()),v(C.g),K]}"""
sa,sb=A.evaluate(SIG),B.evaluate(SIG)
chk("crack, carcass camp and Kindlelight boxes match",sa==sb and max(sa[2])<=4,json.dumps([sa,sb]))
errs=[pg.evaluate("()=>(window.__perr||[]).length") for pg in (A,B)]
print('done',errs)
