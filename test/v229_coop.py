# v229 co-op: the fountain's finale (4000-4002) is each player's own film. While one player watches it the partner's game is not
# paused and still sees them in Duskhold; afterwards the one who poured has the man by the fountain, and the partner (who has not
# poured their own last essence) sees him there too while they play together (fn229Peer, relayed), without gaining the progress.
# Run: python3 mpt.py v229_coop.py
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json,time
for pg in (A,B):pg.evaluate("()=>{FAST();window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=1e9},100);const T=TOWNS[0];toPos(T.cx+(MP.me<'m'?-1:1),T.cy+5)}")
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
SEEN="()=>MP.on&&Object.keys(MP.rh||{}).length>=1"
chk('the partners see each other first',mp_until(SEEN,60000))
A.evaluate("()=>{const L=fn229Last();for(let i=0;i<L;i++)bossDone.add(i);SE208.st[L]=2;window.KQ_FN229=1;FN229.seen=0;const T=TOWNS[0];toPos(T.cx,T.cy+3.3);se208Pour(L)}")
chk('the last pour plays it',A.evaluate("()=>FN229.run&&IC151.on"),A.evaluate("()=>FN229.err"))
chk('the partner is not paused',not B.evaluate("()=>IC151.on||FN229.run"))
A.wait_for_timeout(8000)
chk('the partner still sees the watcher after a while',B.evaluate(SEEN))
chk('still playing',A.evaluate("()=>FN229.run"))
chk('no man for the partner yet',not B.evaluate("()=>!!FN229.npc"))
A.evaluate("()=>fn229Skip()")
chk('handed back after Skip',mp_until("()=>!FN229.run&&!IC151.on",90000,[A]))
chk('the one who poured has the man and the progress',A.evaluate("()=>!!FN229.npc&&bossDone.has(fn229Last())&&FN229.seen===1"))
chk('the partner sees the man by the fountain too',mp_until("()=>!!FN229.npc&&FN229.npc.F.root.visible",60000,[B]),B.evaluate("()=>JSON.stringify({peer:!!FN229.peer,npc:!!FN229.npc})"))
chk('the partner gained no progress from it',B.evaluate("()=>!bossDone.has(fn229Last())&&!FN229.seen&&!(x2Save()||{}).fn229"))
chk('both still together in the room',mp_until(SEEN,30000))
e=[pg.evaluate("()=>FN229.err||FN229.nerr||null") for pg in (A,B)]
chk('no frame errors',not any(e),e)
if fails:print('FAILED',fails)
else:print('v229 co-op: checked')
