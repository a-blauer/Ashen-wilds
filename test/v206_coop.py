# v206 co-op: a companion sent back with R (retreat) is seen running back by the partner (companions' moves reach partners
# through the 2170 relay; nothing new is sent). Run: python3 mpt.py v206_coop.py
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json,time
for pg in (A,B):pg.evaluate("()=>FAST()")
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
for pg in (A,B):pg.evaluate("()=>{hero.lvl=Math.max(hero.lvl,30);window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=1e9;if(typeof RV148!='undefined')RV148.down=0},100);const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0]+(MP.me<'m'?0:1),q[1])}")
H,G=mp_roles(60000)
# the partner's copy of H's hero and companion, as G sees them
SEE="""()=>{const r=Object.values(MP.rh||{}).find(r=>r&&r.act&&r.m&&r.fl&&r.fl[0]&&r.fl[0].visible);if(!r)return null;const a=r.m.position,b=r.fl[0].position;return Math.hypot(a.x-b.x,a.z-b.z)}"""
ok=mp_until("()=>("+SEE+")()!=null",30000,[G])
chk('the partner sees the companion',ok,json.dumps(G.evaluate("()=>Object.values(MP.rh||{}).map(r=>({act:r.act,m:!!r.m,fl:(r.fl||[]).map(g=>g?{v:g.visible,p:!!g.parent}:null),hp:r.m&&[r.m.position.x,r.m.position.z]}))")))
H.evaluate("()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const f=fols[0],x=pl.position.x+10,z=pl.position.z;window.__hold=setInterval(()=>{f.position.set(x,GH(x,z),z);f.vel&&f.vel.set(0,0,0)},10)}")
far=None
t0=time.time()
while time.time()-t0<15:
    d=G.evaluate(SEE)
    if d is not None and d>7:far=d;break
    A.wait_for_timeout(200)
chk('the partner sees it far off first',far is not None,far)
H.evaluate("()=>{clearInterval(window.__hold);retreat206()}")
ok=mp_until("()=>{const d=("+SEE+")();return d!=null&&d<4}",30000,[G])
chk('the partner sees it run back to the hero after R',ok,G.evaluate(SEE))
chk('the retreat is on in the owner\'s game',H.evaluate("()=>RET206.t>0"))
if fails:print('FAILED',fails)
else:print('v206 co-op: checked')
