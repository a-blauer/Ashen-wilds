# v165 co-op: the Dirge main quest played together (two windows over the fake room).
#  The Keeper's grave opens for both · the Sanctum takes the partner in · a partner on the plate lifts the gate for both · the
#  closing walls start and the knights turn for both · the flooded stair takes both out · the raft takes the partner aboard · one
#  raft: the partner's follows the host's, sees the host's drowned, loses the planks the host loses · the raft breaking kills both
#  · the prisms: a carried prism is empty for both, a lit rune is lit for both.
# Run: python3 mpt.py v165_coop.py
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json,time
for pg in (A,B):pg.evaluate("()=>FAST()")
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
def W(ms,step=350):
    t=0;i=0
    while t<ms:
        (A if i%2==0 else B).bring_to_front();A.wait_for_timeout(step);t+=step;i+=1
SLACK=3
def until(js,ms,pgs=None):
    return mp_until(js,ms*SLACK,list(pgs or (A,B)),step=350)
for pg in (A,B):pg.evaluate("()=>{window.__iv=setInterval(()=>{if(!window.__mortal)hero.hp=heroMax()},100);insArrive(INSL[20]);return 1}")
ok=until("()=>MP.on&&MP.others>=1",20000)
chk('both in the Dirge I together',ok,json.dumps([p.evaluate("()=>[MP.rg,MP.others]") for p in (A,B)]))
# ---------------- the grave and the Sanctum ----------------
A.evaluate("()=>{dg165GBuild();const G=DG165GR.S.gr[DG165G.K];dg165DigDone(G,true);return DG165Q.g.st}")
ok=until("()=>DG165Q.g.st===2",8000,[B])
chk("Keeper's grave: dug open for both",ok)
A.evaluate("()=>dg165SEnter()")
ok=until("()=>dg165SIn()&&!!DG165S.S",14000)
chk('Sanctum: entering takes the partner in too',ok,json.dumps([p.evaluate("()=>[dg165SIn(),curIns()&&curIns().g]") for p in (A,B)]))
# the partner stands on the plate: the gate rises for the host too
B.evaluate("()=>{DG165Q.s.cp=2;const P=dg165SanPlan(),[x,z]=dg165SW(P.plate[0],P.plate[1]);toPos(x,z);return 1}")
A.evaluate("()=>{DG165Q.s.cp=2;const [x,z]=dg165SW(64,140);toPos(x,z);return 1}")
ok=until("()=>!!(DG165S.gate&&DG165S.gate.open)",9000,[A])
chk('Sanctum: a partner on the plate lifts the gate for both',ok)
# the closing walls start for both; the host turns the knights; solved for both
for pg in (A,B):pg.evaluate("()=>{DG165Q.s.cp=4;DG165S.gate=null;const [x,z]=dg165SW(92,219);toPos(x,z);return 1}")
ok=until("()=>!!(DG165S.cw&&DG165S.cw.ph=='run')",9000)
chk('Sanctum: the walls close in on both',ok)
A.evaluate("()=>{const S=DG165S.S;S.statues.forEach((s,i)=>{let n=0;while(s.f!==[0,2,1,3][s.want]&&n<4){s.anim=null;dg165STurn(i);s.anim=null;n++}});return S.statues.map(s=>s.f).join('')}")
W(3000)
ok=until("()=>DG165Q.s.cw===1",12000)
chk('Sanctum: the knights stop the walls for both',ok,json.dumps([p.evaluate("()=>[DG165Q.s.cw,DG165S.cw&&DG165S.cw.ph,DG165S.S.statues.map(s=>s.f).join('')]") for p in (A,B)]))
A.evaluate("()=>dg165SFinish()")
ok=until("()=>curIns()&&curIns().g===21",14000)
chk('Sanctum: the flooded stair takes both out to the Dirge II',ok,json.dumps([p.evaluate("()=>curIns()&&curIns().g") for p in (A,B)]))
# ---------------- the raft ----------------
until("()=>MP.others>=1&&MP.rg==21",8000)
A.evaluate("()=>rf165Enter()")
ok=until("()=>rf165In()&&!!RF165R",14000)
chk('raft: boarding takes the partner aboard',ok)
until("()=>MP.others>=1&&MP.rg==33",8000)
H,G=mp_roles(30000)
H.evaluate("()=>{const P=dg165ChPath();RF165R.s=P.S*.32;RF165R.ph='run';return 1}")
ok=until("()=>RF165R&&Math.abs(RF165R.s-dg165ChPath().S*.32)<14",12000,[G])
chk("raft: the partner's raft follows the host's",ok,json.dumps([p.evaluate("()=>RF165R&&Math.round(RF165R.s)") for p in (H,G)]))
ok=until("()=>enemies.some(e=>e.mir&&e.dg165w&&!e.dead)",30000,[G])
chk("raft: the partner sees the host's drowned",ok,json.dumps(G.evaluate("()=>enemies.filter(e=>e.dg165w).map(e=>[e.c.en,!!e.mir,e.dg165w.net||e.dg165w.st])")))
H.evaluate("()=>{const R=RF165R;rf165Break(R,R.cells[0],true);rf165Break(R,R.cells[1],true);return rf165Alive(R)}")
ok=until("()=>RF165R&&!RF165R.cells[0].alive&&!RF165R.cells[1].alive",9000,[G])
chk('raft: planks the host loses are lost for the partner',ok)
for pg in (A,B):pg.evaluate("()=>{window.__mortal=1;return 1}")
H.evaluate("()=>{const R=RF165R;R.cells.forEach(C=>{if(C.alive)rf165Break(R,C,true)});return R.ph}")
ok=until("()=>typeof AWD!='undefined'&&AWD.dead",14000)
chk('raft: the raft breaking takes both down',ok,json.dumps([p.evaluate("()=>[RF165R&&RF165R.ph,AWD.dead,RV148.down]") for p in (A,B)]))
for pg in (A,B):pg.evaluate("()=>{window.__mortal=0;if(AWD.dead&&AWD.res){const f=AWD.res;AWD.res=null;f();AWD.dead=0;document.body.classList.remove('awdead');$('dth').classList.add('hide')}return 1}")
# ---------------- the prisms ----------------
for pg in (A,B):pg.evaluate("()=>{RF165R=null;const I=INSL[22];toPos(I.ba[0],I.ba[1]);return 1}")
W(2500);until("()=>MP.others>=1&&MP.rg==22",8000)
A.evaluate("()=>{os165Build();os165Take(0,true);return 1}")
ok=until("()=>!os165Full(0)",8000,[B])
chk("prisms: a prism the partner carries is empty for both",ok)
A.evaluate("()=>{os165Give(0,true);return DG165Q.o.lit.join('')}")
ok=until("()=>DG165Q.o.lit[0]===1",8000,[B])
chk("prisms: a rune lit by the partner is lit for both",ok)
errs=[p.evaluate("()=>[DG165C.err,RF165.err,DG165S.err,OS165.err]") for p in (A,B)]
chk('no co-op errors',errs==[[0,0,0,0],[0,0,0,0]],json.dumps(errs))
print('V165_COOP','PASS' if not fails else 'FAIL',fails)
