# v86 dens 0/1 in co-op (no network): the driving player relays den events; a non-driving player only shows what is relayed
# SRC=<html> AW_TMP=<out dir> python3 v86_den01_mp.py
import play,json
def s(pg):
    ev=pg.evaluate
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:1500])
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    for i in (0,1):
        ev("(i)=>{enterMap(i)}",i);pg.wait_for_timeout(3500)
        P('den%d'%i,"""()=>{const i=curMap(),A=ARN[i];window.__down=window.__down||down;down=function(){hero.hp=heroMax()};toPos(A.cx+3,A.cz+3);arenaTick(.016,performance.now());const e=bossEnt(i);if(!AF)return 'no fight';
          const out={};const tk=(n)=>{for(let k=0;k<n;k++){hero.hp=heroMax();DEN[i].tick(A,e,.05,performance.now())}};
          // 1) driver: den events go into the co-op queue
          MP.on=true;MP.me='m';MP.others=1;MP.rh={};MP.evq.length=0;if(i==0)AR.wt=0;else HY.nt=0;tk(3);out.driverQueued=MP.evq.filter(q=>q[0]=='b').map(q=>q[2]);
          // 2) non-driver: another player in the den with a lower id drives; our tick schedules nothing, relayed events show
          DEN[i].clear(A,false);DEN[i].start(A,e);MP.evq.length=0;MP.rh={'0':{pr:{ar:i,hp:10,rg:MP.rg}}};out.auth=mpBossAuth(i);if(i==0)AR.wt=0;else HY.nt=0;tk(20);
          out.passive=i==0?AR.st.filter(T=>T.st!='closed').length:hyLive();out.passiveQueued=MP.evq.length;
          const k=i==0?'arEye3':'hyNeck2';mpOnEV({peer:'0',data:{l:[['b',i,k,1]]}});tk(2);out.relayed=i==0?AR.st[3].st:HY.necks.map(n=>n.st).filter(s=>s!='off');
          const k2=i==0?'argusgaze':'tide';mpOnEV({peer:'0',data:{l:[['b',i,k2,1]]}});tk(30);out.relayed2=i==0?!!AR.beam||AR.bm.visible:HY.waves.some(w=>w.on)||HY.q.length;
          MP.on=false;MP.rh={};MP.others=0;MP.evq.length=0;hurt(e,1e9,1);for(let q=0;q<5;q++)arenaTick(.05,performance.now());out.AF=!!AF;return out}""")
play.run(s,w=800,hh=500)
