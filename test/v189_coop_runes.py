# v189 co-op: a partner sees your companion's fusion runes (same number, same spots, same symbols) and they follow a new fusion.
# Run: python3 v189_coop_runes.py   (opens the two co-op windows through mpt.py; A = warrior, B = mage)
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
# own runes as built fresh on B, in the model's own space (+ which symbol / metal each one is)
SIG="""(g)=>{const R=[];g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert();
  g.traverse(o=>{if(o.userData&&o.userData.fr189&&o.isMesh){const p=new THREE.Vector3().setFromMatrixPosition(o.matrixWorld).applyMatrix4(inv);
    const k=Object.keys(FR189.mat).find(k=>FR189.mat[k]===o.material);R.push([+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2),k])}});return R}"""
def mine():return B.evaluate("(sig)=>{const f=eval(sig);return f(cr(party[0]))}",SIG)
# the partner's live copy is animated (mid-walk), so the spots are compared on a rest-pose build from the look it received
def live():return A.evaluate("(sig)=>{const f=eval(sig);const r=Object.values(MP.rh)[0];const g=r&&r.fl&&r.fl[0];if(!g||!g.mpC)return null;return f(g)}",SIG)
def theirs():return A.evaluate("(sig)=>{const f=eval(sig);const r=Object.values(MP.rh)[0];const g=r&&r.fl&&r.fl[0];if(!g||!g.mpC)return null;return f(cr(g.mpC))}",SIG)
def stars():return A.evaluate("()=>{const r=Object.values(MP.rh)[0];const g=r&&r.fl&&r.fl[0];return g&&g.mpC?fs189Html(g.mpC).match(/fs189-s t\\d d\\d/g):null}")
for fz in (5,14):
    B.evaluate("(fz)=>{const a=mkC('Ashwolf',30,0,'');a.n='Cinderfang';a.fz=fz;a.fp=fz;a.f=Math.min(10,fz);a.rs189=4242;party[0]=a;ui()}",fz)
    poll(lambda:len(live() or [])==fz,60000)
    chk('partner\'s companion wears %d runes'%fz,len(live() or [])==fz,len(live() or []))
    m,t=mine(),theirs()
    chk('partner sees %d runes on the same spots with the same symbols'%fz,bool(m and t and len(m)==fz and m==t),json.dumps({'own':(m or [])[:3],'partner':(t or [])[:3],'n':[len(m or []),len(t or [])]}))
    chk('partner can show the same stars for %d fusions'%fz,stars()==B.evaluate("()=>fs189Html(party[0]).match(/fs189-s t\\d d\\d/g)"),json.dumps(stars()))
tick(1000)
errs=[l for k in 'AB' for l in logs[k] if 'PAGEERROR' in l or 'fusion runes' in l]
chk('no page errors',not errs,json.dumps(errs[:3])[:400])
