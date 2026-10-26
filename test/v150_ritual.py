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
A.wait_for_timeout(4000)
P=A.evaluate("()=>{mq145Build&&!MQ145.S&&mq145Build();const M=mq145Plan().sig[0];return [M.x,M.z]}")
for pg,dx in ((A,1.5),(B,-1.5)):pg.evaluate("([x,z])=>{toPos(x,z);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)})}",[P[0]+dx,P[1]])
A.wait_for_timeout(6000)
H,G=(A,B) if A.evaluate("()=>MP.host===MP.me") else (B,A)
print('host',H.evaluate("()=>hero.name"),A.evaluate("()=>[MP.rg,MP.others]"),B.evaluate("()=>[MP.rg,MP.others]"))
for pg in (A,B):pg.evaluate("()=>{window.__hp=setInterval(()=>{hero.hp=heroMax()},100)}")
G.evaluate("()=>mq145Start(0)")
H.bring_to_front()
H.wait_for_timeout(6000)
r=H.evaluate("()=>MQ145.R?[MQ145.R.i,MQ145.R.live.length,MQ145.R.live.filter(e=>!e.minion).length,MQ145.R.tot]:null")
chk('guest asks, host runs the ritual',r is not None and r[0]==0 and r[1]>0 and r[2]==r[1] and r[3]==50,json.dumps(r))
g=G.evaluate("()=>[enemies.filter(e=>e.mir&&e.c.en==='ghostwolf'&&!e.dead).length,!!CP150.RR]")
chk('guest sees the wolves and the count',g[0]>0 and g[1],json.dumps(g))
# XP of one wolf vs one normal monster at the same level
x=H.evaluate("()=>{const w=MQ145.R.live.find(e=>!e.dead);const xw=gainXP(w),xn=gainXP({c:Object.assign({},w.c,{en:'goo'})});return [xw,xn]}")
chk('a ghost wolf gives a quarter of the XP',x[1]>0 and abs(x[0]/x[1]-.25)<.06,json.dumps(x))
# the host slays them all
for k in range(40):
    s=H.evaluate("()=>{const R=MQ145.R;if(!R)return 'done';R.live.forEach(e=>{if(!e.dead)hurt(e,1e9,{},false,false)});return [R.dead,R.tot]}")
    if s=='done':break
    (G if k%3==2 else H).bring_to_front();H.wait_for_timeout(1500)
print('slain',s)
H.wait_for_timeout(3000)
chk('host attuned',H.evaluate("()=>MQ145.at[0]")==1)
chk('attunement shared with the guest',G.evaluate("()=>MQ145.at[0]")==1)
print('V150_RITUAL','PASS' if not fails else 'FAIL',fails)
