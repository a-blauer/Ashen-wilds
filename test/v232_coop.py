# v232 co-op: the Wardens' arenas are shared fights (4012) and the crown shows on a partner (4011).
#  * a partner in an arena can be followed from the talk window at the fountain; both then stand in the same arena
#  * one fight: one game leads (the lowest id), the other mirrors it: it starts when the leader's starts, plays the leader's moves,
#    keeps its boss near the leader's, and the damage dealt on the mirror arrives on the leader's boss
#  * the kill is everyone's: both copies die, each player on that road moves on
#  * the crown: a crowned player's partner sees the crown on their model (look array, index 20); the uncrowned one shows none
# Run: python3 mpt.py v232_coop.py
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json,time
for pg in (A,B):pg.evaluate("()=>{FAST();window.__e=[];const f=console.error;console.error=function(){try{__e.push([...arguments].map(a=>a&&a.stack?a.stack.slice(0,200):String(a)).join(' ').slice(0,300))}catch(_){}return f.apply(this,arguments)};window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=1e9},100);hero.lvl=50;for(let i=0;i<BOSSES.length;i++)bossDone.add(i);FN229.seen=1;fn229Npc();FN232.path=2;FN232.n=0;const T=TOWNS[0];toPos(T.cx+(MP.me<'m'?-1:1),T.cy+5)}")
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
SEEN="()=>MP.on&&Object.keys(MP.rh||{}).length>=1"
chk('the partners see each other first',mp_until(SEEN,60000))
A.evaluate("()=>fn232Go(OK232D)")
chk('A stands in the Elderglade with its Warden',mp_until("()=>wk232In(OK232D)&&!!OK232D.e&&!!OK232D.LS",90000,[A]),A.evaluate("()=>JSON.stringify({ins:curIns()&&curIns().n,err:WK232.err})"))
chk('B is offered to follow A',mp_until("()=>fn232Friends().some(f=>f.D===OK232D)",60000,[B]),B.evaluate("()=>JSON.stringify(Object.values(MP.rh).map(r=>r.pr&&r.pr.rg))"))
B.evaluate("()=>{fn232Talk();const b=[...document.querySelectorAll('#fn232B button')].find(b=>/Follow/.test(b.textContent));b&&b.click()}")
chk('B follows into the same arena',mp_until("()=>wk232In(OK232D)&&!!OK232D.e",90000,[B]))
chk('they see each other in the arena',mp_until("()=>wkn232Peers(OK232D).length>=1",60000))
roles=[pg.evaluate("()=>({mir:OK232D.mir,auth:OK232D.auth,me:MP.me})") for pg in (A,B)]
chk('one game leads, the other mirrors',sorted(r['mir'] for r in roles)==[0,1] and roles[0]['auth']==roles[1]['auth'],json.dumps(roles))
Ld,Mr=(A,B) if roles[0]['mir']==0 else (B,A)
Mr.evaluate("()=>wk232Start(OK232D,OK232D.e)")
chk('a fight started by the mirror starts on the leader',mp_until("()=>OK232D.A.f",30000,[Ld]))
chk('and runs on both',mp_until("()=>OK232D.A.f&&OK232D.e.sv.on",30000))
Mr.evaluate("()=>{window.__mv=[];const f=svStart;svStart=function(e,id){if(e&&e.wk)__mv.push(id);return f.apply(this,arguments)}}")
Ld.evaluate("()=>{window.__mv=[];const f=svStart;svStart=function(e,id){if(e&&e.wk)__mv.push(id);return f.apply(this,arguments)}}")
chk('the mirror plays the leader\'s moves',mp_until("()=>__mv.length>=2",90000),json.dumps([pg.evaluate("()=>__mv") for pg in (Ld,Mr)]))
lm,mm=Ld.evaluate("()=>__mv"),Mr.evaluate("()=>__mv")
chk('the same moves in the same order',len(mm)>0 and all(m in lm for m in mm),json.dumps([lm,mm]))
time.sleep(1.5)
d=[pg.evaluate("()=>[OK232D.e.m.position.x,OK232D.e.m.position.z]") for pg in (Ld,Mr)]
chk('the mirror\'s boss stands near the leader\'s',((d[0][0]-d[1][0])**2+(d[0][1]-d[1][1])**2)**.5<5,json.dumps(d))
h0=Ld.evaluate("()=>{OK232D.e.sv.dr=0;return OK232D.e.c.h}")
Mr.evaluate("()=>{const e=OK232D.e;e.sv.dr=0;e.sv.inv=0;e.c.h-=9000}")
chk('damage dealt on the mirror reaches the leader\'s boss',mp_until("()=>OK232D.e.c.h<%d-6000"%h0,30000,[Ld]),'%s -> %s'%(h0,Ld.evaluate("()=>OK232D.e.c.h")))
chk('the mirror cannot kill its copy alone',Mr.evaluate("()=>{const e=OK232D.e;e.c.h=0;e.dead=1;kill(e);return !e.dead&&e.c.h>=1&&FN232.n===0}"))
Ld.evaluate("()=>{const e=OK232D.e;svEndMove(e,true);e.sv.inv=0;e.sv.dr=0;e.c.h=1;hurt(e,50)}")
chk('the kill counts for both',mp_until("()=>FN232.n===1&&(!OK232D.e||OK232D.e.dead)&&!OK232D.A.f",60000),json.dumps([pg.evaluate("()=>({n:FN232.n,dead:OK232D.e&&OK232D.e.dead,f:OK232D.A.f})") for pg in (A,B)]))
time.sleep(1)
chk('no second Warden appears after the kill',all(pg.evaluate("()=>!enemies.some(e=>e.wk&&!e.dead)") for pg in (A,B)))
# the crown
for pg in (A,B):pg.evaluate("()=>{wk232Leave(OK232D)}")
chk('both back in Duskhold',mp_until("()=>!curIns()",60000))
for pg in (A,B):pg.evaluate("()=>{const T=TOWNS[0];toPos(T.cx+(MP.me<'m'?-1:1),T.cy+5)}")
A.evaluate("()=>{FN232.n=4;FN232.crown=1;fn232Regalia(pl,1);MP.lastPres=''}")
chk('A wears the crown',A.evaluate("()=>!!pl.userData.fn232&&mpLookOut()[20]===1"))
chk('B sees the crown on A',mp_until("()=>Object.values(MP.rh).some(r=>r.m&&r.m.userData.fn232&&r.m.userData.fn232.g.parent)",60000,[B]),B.evaluate("()=>JSON.stringify(Object.values(MP.rh).map(r=>r.pr&&r.pr.lk&&r.pr.lk[20]))"))
chk('A sees no crown on B',A.evaluate("()=>!Object.values(MP.rh).some(r=>r.m&&r.m.userData.fn232)"))
chk('B wears none',B.evaluate("()=>!pl.userData.fn232&&mpLookOut()[20]===0"))
e=[pg.evaluate("()=>({wk:WK232.err,fn:FN232.err,e:__e.slice(0,4)})") for pg in (A,B)]
chk('no errors',all(not x['wk'] and not x['fn'] and not x['e'] for x in e),json.dumps(e))
if fails:print('FAILED',fails)
