# v86 dens 4/5 in co-op (no network): the boss-driving player relays den events through the BMV queue; a non-driving
# player schedules nothing itself and shows exactly what is relayed (same pile / chalice set / moon spots via the index on `en`)
# SRC=<html> AW_TMP=<out dir> python3 v86_den45_mp.py
import play,json
def s(pg):
    ev=pg.evaluate
    P=lambda n,c,*a:print(n,'=>',json.dumps(ev(c,*a))[:1800])
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    for i in (4,5):
        ev("(i)=>{enterMap(i)}",i);pg.wait_for_timeout(3500)
        P('den%d'%i,"""(i)=>{const A=ARN[i];window.__down=window.__down||down;down=function(){hero.hp=heroMax()};toPos(A.cx+Math.cos(A.dqA)*8,A.cz+Math.sin(A.dqA)*8);arenaTick(.016,performance.now());const e=bossEnt(i);if(!AF)return 'no fight';
          const out={},S=A.dq,tk=(n)=>{for(let k=0;k<n;k++){hero.hp=heroMax();e.bs.t=99;DEN[i].tick(A,e,.05,performance.now())}};
          // 1) driver: den mechanics are queued for the peer
          MP.on=true;MP.me='m';MP.others=1;MP.rh={};MP.evq.length=0;if(i==4)S.cT=0;else S.chT=0;tk(3);out.driverQueued=MP.evq.filter(q=>q[0]=='b').map(q=>[q[2],q[3]]);
          // 2) non-driver: a lower peer id drives; our own timers start nothing
          DEN[i].clear(A,false);DEN[i].start(A,e);MP.evq.length=0;MP.rh={'0':{pr:{ar:i,hp:10,rg:MP.rg}}};out.auth=mpBossAuth(i);if(i==4)S.cT=0;else S.chT=0;tk(40);
          out.passiveProps=S.props.length;out.passiveQueued=MP.evq.length;
          // 3) relayed events build the same state
          const rel=(k,en)=>{mpOnEV({peer:'0',data:{l:[['b',i,k,en]]}});tk(4)};
          if(i==4){rel('corpsecall',1.282);out.pile=S.pileS.map(p=>p.on);e.c.h=M(e.c)*.6;e.bs.ph=2;tk(1);rel('pustules',1.2);out.pus=S.pus.length;rel('belch',1.28);out.fx=S.fx.length}
          else{rel('chalices',1.201);out.chal=S.chal.map(c=>c.dprop.pi);rel('chalices',1.201);out.chal2=S.chal.length;e.bs.ph=2;S.ph=2;rel('bloodmoon',1.203);out.moon=S.moon&&S.moon.spots.map(s=>[+(s.x-A.cx).toFixed(1),+(s.z-A.cz).toFixed(1)]);
            rel('rite',1.2);out.rite=!!S.rite&&S.rite.ob.length;out.imm=e.dqImm;rel('riteend',1.2);out.riteAfter=!!S.rite;out.stun=S.stun>0}
          MP.on=false;MP.rh={};MP.others=0;MP.evq.length=0;hurt(e,1e9,1);for(let q=0;q<5;q++)arenaTick(.05,performance.now());out.AF=!!AF;out.propsLeft=enemies.filter(q=>q.dprop).length;return out}""",i)
play.run(s,w=800,hh=500)
