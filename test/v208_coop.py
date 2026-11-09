# v208 co-op: Hillside Crest's arrival cinematic is each player's own. While one player watches it the partner keeps seeing them
# in the room (presence keeps going out), the partner's game is not paused, and the partner gets the cinematic on their own first
# arrival. Run: python3 mpt.py v208_coop.py
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json,time
for pg in (A,B):pg.evaluate("()=>{FAST();window.KQ_HC208=1;HC208.seen=0;window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=1e9},100);const P=INSL[5].path,q=P[Math.floor(P.length*.15)];toPos(q[0]+(MP.me<'m'?0:1),q[1])}")
H,G=mp_roles(60000)
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
SEEN="()=>Object.values(MP.rh||{}).some(r=>r&&r.act)"
chk('the partners see each other first',mp_until(SEEN,30000))
A.evaluate("()=>insArrive(INSL[5])")
chk('the first arrival plays it',A.evaluate("()=>HC208.run&&IC151.on"))
chk('the partner is not paused',not B.evaluate("()=>IC151.on||HC208.run"))
A.wait_for_timeout(9000)
chk('the partner still sees the watcher after a while',B.evaluate(SEEN),B.evaluate("()=>JSON.stringify(Object.values(MP.rh||{}).map(r=>({act:r.act,rg:r.pr&&r.pr.rg})))"))
chk('still playing',A.evaluate("()=>HC208.run"))
A.evaluate("()=>hc208Skip()")
chk('handed back after Skip',mp_until("()=>!HC208.run&&!IC151.on",60000,[A]))
B.evaluate("()=>insArrive(INSL[5])")
chk('the partner gets it on their own first arrival',B.evaluate("()=>HC208.run&&IC151.on"))
chk('the first player is not paused by it',not A.evaluate("()=>IC151.on||HC208.run"))
B.evaluate("()=>hc208Skip()")
chk('the partner is handed back too',mp_until("()=>!HC208.run&&!IC151.on",60000,[B]))
A.evaluate("()=>insArrive(INSL[5])")
chk('never twice',not A.evaluate("()=>HC208.run"))
chk('both still together in the room',mp_until(SEEN,30000))
e=[pg.evaluate("()=>HC208.err||null") for pg in (A,B)]
chk('no frame errors',not any(e),e)
if fails:print('FAILED',fails)
else:print('v208 co-op: checked')
