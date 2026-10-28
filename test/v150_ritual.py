# v150 co-op rune sigil ritual: a guest's F asks the region host, the host's ghost wolves are shared (the guest sees them),
# the guest's tracker shows the host's count, the attunement is shared, and a ghost wolf gives a quarter of the XP.
# Run: python3 mpt.py v150_ritual.py
if 'A' not in globals():  # run directly (the test suite): open the two co-op windows through mpt.py
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
for pg in (A,B):pg.evaluate("()=>FAST()")
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
for pg in (A,B):pg.evaluate("()=>{INSR[0]=3;insArrive(PMAP[0].ins[2])}")
# steady on slow machines (Oct 27 2026): wait for each step's condition (generous deadlines) instead of fixed sleeps
ok=mp_until("()=>{if(mq145In3()&&!MQ145.S)mq145Build();return mq145In3()&&!!MQ145.S}",60000)
P=A.evaluate("()=>{mq145Build&&!MQ145.S&&mq145Build();const M=mq145Plan().sig[0];return [M.x,M.z]}")
for pg,dx in ((A,1.5),(B,-1.5)):pg.evaluate("([x,z])=>{toPos(x,z);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)})}",[P[0]+dx,P[1]])
H,G=mp_roles(60000)
print('host',H.evaluate("()=>hero.name"),A.evaluate("()=>[MP.rg,MP.others,MP.host]"),B.evaluate("()=>[MP.rg,MP.others,MP.host]"),'fps',mp_fps())
for pg in (A,B):pg.evaluate("()=>{window.__hp=setInterval(()=>{hero.hp=heroMax()},100)}")
G.evaluate("()=>mq145Start(0)")
mp_until("()=>!!MQ145.R&&MQ145.R.live.length>0",60000,[H])   # the first wolves rise 2 s of game time after the start
r=H.evaluate("()=>MQ145.R?[MQ145.R.i,MQ145.R.live.length,MQ145.R.live.filter(e=>!e.minion).length,MQ145.R.tot]:null")
chk('guest asks, host runs the ritual',r is not None and r[0]==0 and r[1]>0 and r[2]==r[1] and r[3]==50,json.dumps(r)+(' fps %s'%mp_fps() if not (r and r[1]) else ''))
mp_until("()=>enemies.some(e=>e.mir&&e.c.en==='ghostwolf'&&!e.dead)&&!!CP150.RR",30000,[G])
g=G.evaluate("()=>[enemies.filter(e=>e.mir&&e.c.en==='ghostwolf'&&!e.dead).length,!!CP150.RR]")
chk('guest sees the wolves and the count',g[0]>0 and g[1],json.dumps(g))
# XP of one wolf vs one normal monster at the same level
x=H.evaluate("()=>{const w=MQ145.R.live.find(e=>!e.dead);const hk=HXP164;HXP164=1;const xw=gainXP(w),xn=gainXP({c:Object.assign({},w.c,{en:'goo'})});HXP164=hk;return [xw,xn]}")
chk('a ghost wolf gives a quarter of the XP',x[1]>0 and abs(x[0]/x[1]-.25)<.06,json.dumps(x))
# the host slays them all
import time
t0=time.time();s=None;k=0
while time.time()-t0<300:
    s=H.evaluate("()=>{const R=MQ145.R;if(!R)return 'done';R.live.forEach(e=>{if(!e.dead)hurt(e,1e9,{},false,false)});return [R.dead,R.tot]}")
    if s=='done':break
    H.wait_for_timeout(1000);k+=1
print('slain',s,'in %d s'%(time.time()-t0))
mp_until("()=>MQ145.at[0]==1",30000)
chk('host attuned',H.evaluate("()=>MQ145.at[0]")==1,json.dumps(s))
chk('attunement shared with the guest',G.evaluate("()=>MQ145.at[0]")==1)
print('V150_RITUAL','PASS' if not fails else 'FAIL',fails)
