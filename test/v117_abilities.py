# v117: every class has its full ability list (17: SKB + SKX + KQN) and the KQN table is the ability table (the v116 co-op code
# had replaced it with its network settings); a hero's unlocked KQN abilities and loadout come back from the save.
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,'' if ok else str(info)[:300])
    if not ok:FAIL.append(n)
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev("()=>({n:Object.keys(CLS).map(c=>[c,kqsAll(c).length]),kqn:Array.isArray(KQN.warrior),net:typeof KQNET})")
    chk('every class has 17 abilities',all(x[1]==17 for x in r['n']),r['n'])
    chk('KQN is the ability table, co-op settings live in KQNET',r['kqn'] and r['net']=='object',r)
    r=ev("""()=>{hero.lvl=20;hero.tal['ab:Bull Rush']=1;hero.tal['ab:Intimidating Shout']=1;kqsSetLd(['Cleave','Bull Rush','Intimidating Shout']);saveGame(true);hero.tal={};loadGame();
      return {ld:heroSkills().map(s=>s.n),un:['Bull Rush','Intimidating Shout'].map(n=>kqsUnl('warrior',kqsFind('warrior',n)))}}""")
    chk('unlocked new abilities and the loadout survive save + load','Bull Rush' in r['ld'] and all(r['un']),r)
play.run(s)
print('FAILURES:',FAIL if FAIL else 'none')
