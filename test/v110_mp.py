# v110 souls Sovereigns in co-op (no network): the driver relays every move with its seed; a partner never picks moves,
# plays the relayed ones (same timeline, same random choices), follows Phase II from the health sync, and keeps its own
# root motion while a move moves the boss. BL=0,5 limits.
import play,json,os
BL=[int(x) for x in os.environ.get('BL','0,1,2,3,4,5').split(',')]
def s(pg):
    pg.set_default_timeout(900000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ok=True;first=True
    for i in BL:
        ev("(i)=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[i].ins[3])}",i);pg.wait_for_timeout(1500)
        if first:
            first=False
            ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};
              window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}};
              down=function(){hero.hp=heroMax()};return 1}""")
        r=ev("""(i)=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[i];toPos(A.cx+6,A.cz);STEP(.4);const e=bossEnt(i),S=e.sv;const out={AF:!!AF};STEP(3.2);
          const moves=Object.keys(S.B.M).filter(k=>S.B.M[k].wt&&!S.B.M[k].ph);const k=moves[0];
          // 1) driver: our cast goes into the co-op queue with its seed
          MP.on=true;MP.me='m';MP.others=1;MP.rh={};MP.evq.length=0;svEndMove(e,true);svCast(e,k,123);out.driverQueued=MP.evq.filter(q=>q[0]=='b').map(q=>q[2]+':'+q[3]);out.auth=mpBossAuth(i);
          // 2) partner: someone else drives; we never pick, even with the rest timer run out
          svEndMove(e,true);MP.evq.length=0;MP.rh={'0':{pr:{ar:i,hp:10,rg:MP.rg}}};out.auth2=mpBossAuth(i);S.rest=0;STEP(2.5);out.partnerPicked=S.mv?S.mv.id:null;out.partnerQueued=MP.evq.length;
          // 3) a relayed move plays with the same seed (same random numbers)
          const r1=svRng(77)(),k2=moves[1]||k;mpOnEV({peer:'0',data:{l:[['b',i,'sv'+i+'_'+k2,1.077]]}});out.relayed=S.mv&&S.mv.id;out.seedSame=S.mv&&+S.mv.seed===77;
          // 4) root motion: a far sync target does not yank the boss while the move moves it
          const rmv=Object.keys(S.B.M).find(q=>S.B.M[q].rm&&!S.B.M[q].ph);if(rmv){mpOnEV({peer:'0',data:{l:[['b',i,'sv'+i+'_'+rmv,1.005]]}});const D=S.B.M[rmv],t0=D.rm[0][0];
            let n=0;while(S.mv&&S.mv.t<t0+.02&&n++<400)STEP(.016);e.nx=e.m.position.x+6;e.nz=e.m.position.z;const p0=e.m.position.clone();STEP(.05);out.rmMove=rmv;out.rmOn=!!S.rmOn;out.yanked=+d2(e.m.position,p0).toFixed(2)}
          // 5) Phase II follows the synced health
          svEndMove(e,true);e.c.h=M(e.c)*.5;STEP(.3);out.ph=S.ph;
          MP.on=false;MP.rh={};MP.others=0;MP.evq.length=0;hurt(e,1e9,1);STEP(3);out.AFafter=!!AF;return out}""",i)
        print('mp',i,json.dumps(r))
        good=r['driverQueued'] and r['auth']=='m' and r['auth2']=='0' and not r['partnerPicked'] and r['relayed'] and r['seedSame'] and r['ph']==2 and not r['AFafter'] and r.get('yanked',0)<1.5
        if not good:ok=False;print('  FAIL')
    print('errs',errs[:6],ev("()=>window.LERR||0"),'OK' if ok else 'FAILED')
play.run(s,w=640,hh=400)
