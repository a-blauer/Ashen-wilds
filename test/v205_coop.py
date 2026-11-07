# v205 co-op: the Citadel main quest, two windows together:
#  I   a key taken by one is taken for both; the keys given by one are given for both; the guest asks Cheddar to begin, the host runs
#      the unbinding and the guest sees it (Cheddar casting, the seal, the HUD, a siphon's tether); it ends for both (the gate opens).
#  II  Vharog wakes for both, one driver; the partner's damage reaches the driver; a ballista loosed by one shows for the other;
#      his fall is both players' (the portcullis rises for both).
#  III a mirror taken / mounted / turned by one is for both; the dawn is both players'.
# Run: python3 mpt.py v205_coop.py
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json,time
for pg in (A,B):pg.evaluate("()=>FAST()")
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
def until(pg,js,ms=30000,arg=None):
    t0=time.time()
    while True:
        try:
            if (pg.evaluate(js,arg) if arg is not None else pg.evaluate(js)):return True
        except Exception as e:
            if 'closed' in str(e):raise
        if (time.time()-t0)*1000>=ms:return False
        A.wait_for_timeout(400)
for pg in (A,B):pg.evaluate("()=>{INSR[5]=0;hero.lvl=Math.max(hero.lvl,45);window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=1e9;if(typeof RV148!='undefined')RV148.down=0},100)}")

# ---------------- I The Unsealing ----------------
for pg in (A,B):pg.evaluate("()=>{const F=cq205F(0),[x,z]=F.W2(F.reach-12,(Math.random()-.5)*4);toPos(x,z)}")
H,G=mp_roles(60000)
chk('both in The Citadel I',H.evaluate("()=>cq205Here(0)") and G.evaluate("()=>cq205Here(0)"))
until(G,"()=>!!CH205.C",30000);until(H,"()=>!!CH205.C",30000)
for pg in (H,G):pg.evaluate("()=>{CQ205.c1.st=1;CQ205.trkK=''}")
H.evaluate("()=>{const d={kind:'cq205',data:{i:0}};take(d)}")
ok=until(G,"()=>!!(CQ205.c1.ing&1)",20000)
chk('a key taken by one is taken for both',ok,json.dumps(G.evaluate("()=>CQ205.c1.ing")))
H.evaluate("()=>{CQ205.c1.ing=15;ch205Give(true)}")
ok=until(G,"()=>CQ205.c1.st===2",20000)
chk('the keys given by one are given for both',ok,json.dumps([pg.evaluate("()=>[CQ205.c1.st,CH205.brz.filter(b=>b.ing.visible).length]") for pg in (H,G)]))
G.evaluate("()=>us205Start(true)")
ok=mp_until("()=>!!US205.E",30000)
chk('the guest asked and the unbinding runs for both',ok,json.dumps([pg.evaluate("()=>!!US205.E") for pg in (H,G)]))
ok=until(G,"()=>!!US205.E&&US205.E.go&&CH205.pose==='cast'",30000)
chk('the guest sees Cheddar cast',ok,json.dumps(G.evaluate("()=>US205.E?[US205.E.go,CH205.pose,US205.E.t]:null")))
H.evaluate("()=>{US205.E.t=US205.T*.3;const s=us205Spawn('siph');s.usS.to={x:s.m.position.x,z:s.m.position.z}}")
ok=until(G,"()=>!!US205.E&&US205.E.siN>=1&&US205T.length>=1",30000)
chk('the guest sees the siphon tether',ok,json.dumps(G.evaluate("()=>US205.E?[US205.E.siN,US205T.length,US205.E.t]:null")))
hg=G.evaluate("()=>{const h=document.getElementById('us205H');return !!h&&h.style.display!='none'}")
chk('the guest sees the HUD',hg)
H.evaluate("()=>{enemies.filter(e=>e.us205).forEach(e=>{e.c.h=1;hurt(e,1e6,{},false)});US205.E.t=US205.T-.1}")
ok=mp_until("()=>CQ205.c1.st>=3&&!US205.E",40000)
chk('the seal breaks for both',ok,json.dumps([pg.evaluate("()=>[CQ205.c1.st,!!US205.E,GG205.S?GG205.S.open:-1]") for pg in (H,G)]))

# ---------------- II Vharog ----------------
for pg in (A,B):pg.evaluate("()=>{INSR[5]=1;const F=cq205F(1),[x,z]=F.W2(-6,(Math.random()-.5)*4);toPos(x,z)}")
until(H,"()=>vh205Alive()",40000);until(G,"()=>vh205Alive()",40000)
G.evaluate("()=>{const e=VH205.e;toPos(e.m.position.x+6,e.m.position.z)}")
ok=mp_until("()=>!!(VH205A&&VH205A.f)",40000)
chk('Vharog wakes for both',ok,json.dumps([pg.evaluate("()=>[vh205Alive(),!!(VH205A&&VH205A.f)]") for pg in (H,G)]))
H.evaluate("()=>{const e=VH205.e;toPos(e.m.position.x-5,e.m.position.z)}")
t0=time.time()
while time.time()-t0<30:
    if [H.evaluate("()=>vh180Auth()"),G.evaluate("()=>vh180Auth()")].count(True)==1:break
    A.wait_for_timeout(400)
D,F=(H,G) if H.evaluate("()=>vh180Auth()") else (G,H)
chk('exactly one Vharog driver',D.evaluate("()=>vh180Auth()") and not F.evaluate("()=>vh180Auth()"))
D.evaluate("()=>{const e=VH205.e;if(e.sv.mv)svEndMove(e,true);e.sv.inv=0;e.sv.rest=99;e.c.h=M(e.c)}")
A.wait_for_timeout(1500)
h0=D.evaluate("()=>{const e=VH205.e;if(e.sv.mv)svEndMove(e,true);e.sv.rest=99;return [e.c.h,M(e.c)]}")
F.evaluate("()=>{const e=VH205.e;if(e.sv.mv)svEndMove(e,true);hurt(e,Math.round(M(e.c)*.1),{},false)}")
until(D,"()=>VH205.e.c.h<=M(VH205.e.c)*.93",20000)
h1=D.evaluate("()=>VH205.e.c.h")
chk("the partner's hits reach the driver",h0[0]-h1>=h0[1]*.07,json.dumps([h0,h1]))
D.evaluate("()=>{const e=VH205.e;e.sv.ph=2;svEndMove(e,true);svCast(e,'hunt')}")
ok=mp_until("()=>!!VH205.H",30000)
chk('the Night Hunt runs for both',ok,json.dumps([pg.evaluate("()=>!!VH205.H") for pg in (D,F)]))
F.evaluate("()=>{const b=VH205.bal[0];vh205Loose(0,true)}")
ok=until(D,"()=>VH205.bal[0].used===1",20000)
chk('a ballista loosed by one shows for the other',ok,json.dumps(D.evaluate("()=>[VH205.bal.map(b=>b.used),VH205.H?VH205.H.ch:-1]")))
D.evaluate("()=>{const e=VH205.e;VH205.H=null;svEndMove(e,true);e.sv.inv=0;hurt(e,1e9,{},false)}")
ok=mp_until("()=>CQ205.c2.st>=1&&!(VH205A&&VH205A.f)",40000)
chk('Vharog falls for both, the portcullis rises for both',ok,json.dumps([pg.evaluate("()=>[CQ205.c2.st,vh205Alive()]") for pg in (D,F)]))

# ---------------- III The Dawn Mirrors ----------------
for pg in (A,B):pg.evaluate("()=>{INSR[5]=2;const F=cq205F(2),[x,z]=F.W2(-2,(Math.random()-.5)*4);toPos(x,z)}")
until(H,"()=>!!DM205.S",40000);until(G,"()=>!!DM205.S",40000)
for pg in (H,G):pg.evaluate("()=>{CQ205.c3.st=1;CQ205.c3.cl=7;dm205Sync()}")
G.evaluate("()=>dm205Take(0,true)")
ok=until(H,"()=>!!(CQ205.c3.got&1)",20000)
chk('a mirror taken by one is taken for both',ok)
G.evaluate("()=>{dm205Take(1,true);dm205Take(2,true);dm205Mount(0,true);dm205Mount(1,true);dm205Mount(2,true)}")
ok=until(H,"()=>CQ205.c3.mnt===7&&CQ205.c3.st===2",20000)
chk('mounted by one, mounted for both',ok,json.dumps(H.evaluate("()=>[CQ205.c3.mnt,CQ205.c3.st]")))
H.evaluate("()=>dm205Turn(0,true)")
ok=until(G,"()=>CQ205.c3.rot[0]===4",20000)
chk('a mirror turned by one turns for both',ok,json.dumps(G.evaluate("()=>CQ205.c3.rot")))
H.evaluate("()=>{const R=dm205Court();[0,1,2].forEach(i=>{if(CQ205.c3.rot[i]!==R.solve[i])dm205Turn(i,true,R.solve[i])})}")
ok=mp_until("()=>CQ205.c3.st>=3",30000)
chk('the dawn breaks for both',ok,json.dumps([pg.evaluate("()=>[CQ205.c3.st,CQ205.c3.rot]") for pg in (H,G)]))
errs=[pg.evaluate("()=>(window.__perr||[]).slice(0,4)") for pg in (A,B)]
print('page errors',errs)
print('RESULT','PASS' if not fails else 'FAIL %d: %s'%(len(fails),', '.join(fails)))
