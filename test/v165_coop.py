# v165 co-op Searing Sands main quest, two windows together:
#  1 The Buried Temple: a spadeful dug by one is dug for the other; Qarsul rises for both, one driver, the partner's damage reaches
#    the driver, his fall is both players' (the doors open for both).
#  2 The Last Warden: an urn broken by one is broken for the other, the remains laid by one are laid for both, Kheprit wakes for
#    both; the guest asks him to open the rift, the host runs it and the guest sees it grow; it opens for both.
#  3 The Sandskimmer: a column mined by one breaks for both, the build is shared.
#  4 The Sandstorm Run: the guest boards: two to one machine (the guest drives, the host shoots), the host sees the guest's machine
#    move, the machine reaches the cave and both arrive in the Den.
# Run: python3 mpt.py v165_coop.py
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
for pg in (A,B):pg.evaluate("()=>{INSR[3]=0;hero.lvl=Math.max(hero.lvl,35);window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=1e9;if(typeof RV148!='undefined')RV148.down=0},100)}")

# ---------------- 1 The Buried Temple ----------------
for pg in (A,B):pg.evaluate("()=>{const T=ss165T1(),[x,z]=T.F.W2(T.mound.a0-1.5,(Math.random()-.5)*4);toPos(x,z)}")
H,G=mp_roles(60000)
chk('both in Searing Sands I',H.evaluate("()=>ss165Here(0)") and G.evaluate("()=>ss165Here(0)"))
until(G,"()=>!!SD165.D",20000);until(H,"()=>!!SD165.D",20000)
n0=G.evaluate("()=>SS165.c1.dig.length")
H.evaluate("()=>{const T=ss165T1();for(let i=0;i<6;i++){const [x,z]=T.F.W2(T.mound.a0+.5,-3+i);pl.position.set(x,0,z);const t=sd165Aim();if(t)sd165Dig(t.a,t.b,true)}}")
until(G,"(n)=>SS165.c1.dig.length>=n+5",20000,n0)
chk('a spadeful dug by one is dug for the other',G.evaluate("()=>SS165.c1.dig.length")>=n0+5,json.dumps([n0,G.evaluate("()=>SS165.c1.dig.length"),H.evaluate("()=>SS165.c1.dig.length")]))
# uncovered: Qarsul rises for both
H.evaluate("()=>sd165Uncover(true)")
until(G,"()=>SS165.c1.st===2",20000)
for pg in (H,G):pg.evaluate("()=>{const T=ss165T1();toPos(T.ac[0]+(Math.random()-.5)*3,T.ac[1]+(Math.random()-.5)*3)}")
ok=mp_until("()=>qs165Alive()&&!!(QS165A&&QS165A.f)",60000)
chk('Qarsul rises and the fight starts for both',ok,json.dumps([pg.evaluate("()=>[SS165.c1.st,qs165Alive(),!!QS165.form,!!(QS165A&&QS165A.f)]") for pg in (H,G)]))
t0=time.time()
while time.time()-t0<30:
    if [H.evaluate("()=>qs180Auth()"),G.evaluate("()=>qs180Auth()")].count(True)==1:break
    A.wait_for_timeout(400)
D,F=(H,G) if H.evaluate("()=>qs180Auth()") else (G,H)
chk('exactly one Qarsul driver',D.evaluate("()=>qs180Auth()") and not F.evaluate("()=>qs180Auth()"))
h0=D.evaluate("()=>{const e=QS165.e;if(e.sv.mv)svEndMove(e,true);e.sv.inv=0;e.sv.rest=99;e.c.h=M(e.c);return [e.c.h,M(e.c)]}")
F.evaluate("()=>{const e=QS165.e;if(e.sv.mv&&e.sv.mv.id==='hidden')svEndMove(e,true);hurt(e,Math.round(M(e.c)*.1),{},false)}")
until(D,"()=>QS165.e.c.h<=M(QS165.e.c)*.93",20000)
h1=D.evaluate("()=>QS165.e.c.h")
chk('the partner\'s hits reach the driver',h0[0]-h1>=h0[1]*.07,json.dumps([h0,h1]))
D.evaluate("()=>{const e=QS165.e;if(e.sv.mv)svEndMove(e,true);e.sv.inv=0;hurt(e,1e9,{},false)}")
ok=mp_until("()=>SS165.c1.st>=3&&!(QS165A&&QS165A.f)",40000)
chk('Qarsul falls for both, the doors open for both',ok,json.dumps([pg.evaluate("()=>[SS165.c1.st,qs165Alive()]") for pg in (D,F)]))

# ---------------- 2 The Last Warden ----------------
for pg in (A,B):pg.evaluate("()=>{INSR[3]=1}")
for pg in (A,B):pg.evaluate("()=>{const T=ss165T2(),[x,z]=T.F.W2(-T.R+3,(Math.random()-.5)*4);toPos(x,z)}")
H,G=mp_roles(60000)
until(H,"()=>KH165W.urns.length===14",20000);until(G,"()=>KH165W.urns.length===14",20000)
H.evaluate("()=>{const u=KH165W.urns.find(s=>s.kh165u===0);for(let k=0;k<3;k++)hurt(u,10,{},false)}")
until(G,"()=>!!(SS165.c2.urn&1)",20000)
chk('an urn broken by one is broken for the other',G.evaluate("()=>!!(SS165.c2.urn&1)"))
H.evaluate("()=>{KH165W.urns.slice().forEach(s=>{for(let k=0;k<3;k++)hurt(s,10,{},false)});KH165W.picks.slice().forEach(q=>kh165Take(q.p,true));enemies.slice().forEach(e=>{if(!e.dead&&/Scarab/.test(e.c.n))removeE(e)})}")
until(G,"()=>ss165Bits(SS165.c2.got|SS165.c2.lay)===11",20000)
chk('the pieces taken by one count for the other',G.evaluate("()=>ss165Bits(SS165.c2.got|SS165.c2.lay)")==11)
H.evaluate("()=>{const T=ss165T2(),[x,z]=T.F.W2(T.altar.a-3,0);toPos(x,z);kh165LayAll(true)}")
ok=mp_until("()=>SS165.c2.lay===2047&&SS165.c2.st>=1",30000)
chk('the remains laid by one are laid for both and he wakes for both',ok,json.dumps([pg.evaluate("()=>[SS165.c2.lay,SS165.c2.st]") for pg in (H,G)]))
mp_until("()=>SS165.c2.st>=2",40000)
G.evaluate("()=>rf165Start(true)")
ok=until(H,"()=>!!RF165.E",20000) and until(G,"()=>!!RF165.E&&RF165.E.t>1",40000)
chk('the guest asks: the host runs the rift and the guest sees it grow',ok,json.dumps([pg.evaluate("()=>RF165.E?[RF165.E.t,RF165.E.hp,RF165.E.go]:null") for pg in (H,G)]))
H.evaluate("()=>{RF165.E.t=RF165.T}")
ok=mp_until("()=>SS165.c2.st>=3",20000)
chk('the rift opens for both',ok,json.dumps([pg.evaluate("()=>SS165.c2.st") for pg in (H,G)]))
for pg in (H,G):pg.evaluate("()=>{if(RF165.E)rf165Stop('quiet');SS165.c2.st=4}")

# ---------------- 3 The Sandskimmer ----------------
for pg in (A,B):pg.evaluate("()=>{INSR[3]=2}")
for pg in (A,B):pg.evaluate("()=>{const T=ss165T3(),[x,z]=T.F.W2(T.cr.a-2,(Math.random()-.5)*4);toPos(x,z)}")
H,G=mp_roles(60000)
until(H,"()=>SC165.cols.filter(c=>c).length===5",20000);until(G,"()=>SC165.cols.filter(c=>c).length===5",20000)
H.evaluate("()=>{for(let k=0;k<9;k++)sc165Hit(0,true)}")
until(G,"()=>!!(SS165.c3.col&1)",20000)
chk('a column mined by one breaks for the other',G.evaluate("()=>!!(SS165.c3.col&1)"))
H.evaluate("()=>{SS165.c3.got=31;cs165Assemble(true)}")
ok=mp_until("()=>SS165.c3.built===1",30000)
chk('the Sandskimmer is built for both',ok,json.dumps([pg.evaluate("()=>SS165.c3.built") for pg in (H,G)]))

# ---------------- 4 The Sandstorm Run ----------------
G.evaluate("()=>cs165Board()")
ok=mp_until("()=>SR165.on&&!!SR165.me",30000)
r=[pg.evaluate("()=>SR165.me?[SR165.V.length,SR165.me.drv,SR165.me.gun,SR165.me.id]:null") for pg in (H,G)]
chk('the guest boards: one machine, the guest drives and the host shoots',ok and r[0] and r[1] and r[0][0]==1 and r[1][1]=='me' and r[0][2]=='me' and r[0][3]==r[1][3],json.dumps(r))
if ok:
    G.evaluate("()=>{window.__drv=setInterval(()=>{K.w=1},50)}")
    until(G,"()=>SR165.ph==='run'&&SR165.me.s>30",40000)
    until(H,"()=>SR165.me&&SR165.me.s>20",20000)
    p=[pg.evaluate("()=>[SR165.me.x,SR165.me.z,SR165.me.s]") for pg in (H,G)]
    chk('the host sees the guest\'s machine move',p[0][2]>15 and abs(p[0][0]-p[1][0])+abs(p[0][1]-p[1][1])<12,json.dumps(p))
    G.evaluate("()=>{clearInterval(__drv);K.w=0;const V=SR165.me,P=sr165Path();sr165Place(V,P.S-3,0);SR165.ph='run'}")
    ok=mp_until("()=>SS165.run.st===1&&!SR165.on",30000)
    r=[pg.evaluate("()=>[SS165.run.st,SR165.on,curIns()?curIns().g:-1]") for pg in (H,G)]
    chk('the machine reaches the cave: both arrive at the Den',ok and all(x[2]==18 for x in r),json.dumps(r))
print('RESULT','PASS' if not fails else 'FAIL %d'%len(fails))
