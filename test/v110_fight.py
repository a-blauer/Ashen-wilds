# v110: souls-style Sovereigns — a free-running fight per boss with the real AI: moves chosen, combos, poise break
# (stagger), Phase II at 55%, death and cleanup, then a wipe (arenaFail) and restart. BL=0,1 limits; SEC=40 fight length.
import play,json,os
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
BL=[int(x) for x in os.environ.get('BL','0,1,2,3,4,5').split(',')];SEC=float(os.environ.get('SEC','40'))
def s(pg):
    pg.set_default_timeout(1500000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    pg.on('console',lambda m:errs.append('console:'+m.text[:300]) if m.type=='error' else None)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    first=True;bad=[]
    for i in BL:
        ev("(i)=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[i].ins[3])}",i);pg.wait_for_timeout(1500)
        if first:
            first=False
            ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
            window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;if(window.GOD)hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
            window.HITS=[];const hb=bossHit;bossHit=function(e,k){HITS.push(+(+k).toFixed(2));return hb.apply(this,arguments)};window.GOD=1;window.__down=down;down=function(){hero.hp=heroMax()};return 1}""")
        r=ev("""([i,SEC])=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[i];const P=PMAP[i].ins[3].en,a=Math.atan2(P[1]-A.cz,P[0]-A.cx);
          toPos(A.cx+Math.cos(a)*10,A.cz+Math.sin(a)*10);STEP(.3);const e=bossEnt(i);const S=e.sv;HITS.length=0;SVX.log.length=0;const st0=SVX.st.stag;
          let t=0,maxMs=0,tot=0,frames=0,ph2At=null,stg=0,lastMv='',dmgT=0;const seen={};
          // the hero circles the boss at a changing radius, sometimes closing in, sometimes far
          while(t<SEC){const k=t*.35,rad=t%14<5?3.5:t%14<10?8:14,c=S.i===1?A:{cx:e.m.position.x,cz:e.m.position.z};
            let x=A.cx+Math.cos(k)*rad,z=A.cz+Math.sin(k)*rad;const d=Math.hypot(x-A.cx,z-A.cz);if(d>ARENA_R-2){x=A.cx+(x-A.cx)/d*(ARENA_R-2);z=A.cz+(z-A.cz)/d*(ARENA_R-2)}
            pl.position.x+=(x-pl.position.x)*.08;pl.position.z+=(z-pl.position.z)*.08;
            const t0=Date.now();STEP(.1);const ms=(Date.now()-t0)/6.25;maxMs=Math.max(maxMs,ms);tot+=ms;frames++;t+=.1;
            // chip damage: enough to break poise now and then, and Phase II at ~45% of the fight
            dmgT+=.1;if(dmgT>.5&&!e.dead){dmgT=0;hurt(e,Math.round(M(e.c)*.0075),{col:0xffffff},false)}
            if(t>SEC*.45&&S.ph===1&&e.c.h>M(e.c)*.6)e.c.h=M(e.c)*.57;if(S.ph===2&&ph2At==null)ph2At=+t.toFixed(1);
            if(S.mv&&S.mv.id!==lastMv){lastMv=S.mv.id;seen[lastMv]=(seen[lastMv]||0)+1}if(!S.mv)lastMv='';if(e.dead)break}
          const res={moves:seen,ph:S.ph,ph2At,stag:SVX.st.stag-st0,hits:HITS.length,dmg:+HITS.reduce((a,b)=>a+b,0).toFixed(1),hp:+(e.c.h/M(e.c)).toFixed(2),avgMs:+(tot/frames).toFixed(2),maxMs:+maxMs.toFixed(1),warns:DTL.live.length,AF:!!AF};
          return res}""",[i,SEC])
        print('fight',i,json.dumps(r))
        allm=ev("(i)=>Object.keys(SVB[i].M).filter(k=>SVB[i].M[k].wt)",i)
        miss=[k for k in allm if k not in r['moves']]
        if miss:print('  never chosen:',miss)
        # death + cleanup
        d=ev("""(i)=>{const e=bossEnt(i);svEndMove(e,true);if(e.sv.gone)e.sv.B.reset(e);hurt(e,1e9,{col:0xffffff},false);STEP(.5);const a={dead:e.dead,AF:!!AF,dying:!!e.sv.dying};STEP(2.6);
          return Object.assign(a,{gone:!enemies.includes(e),warns:DTL.live.length,fx:KQ.fx.length,hud:$('svPo')?$('svPo').style.display:'none'})}""",i)
        print('  death',json.dumps(d))
        # respawn, start, wipe, restart
        f=ev("""(i)=>{bossDone.delete(i);spawnBoss(i);   // v141: a defeated Sovereign is not spawned again, so forget the kill first
          STEP(.2);const e=bossEnt(i);const A=ARN[i];toPos(A.cx+5,A.cz);STEP(1.5);const st=!!AF,mv=e.sv.mv&&e.sv.mv.id;STEP(3);arenaFail();toPos(A.cx+Math.cos(1)*(ARENA_R+6),A.cz+Math.sin(1)*(ARENA_R+6));STEP(1);
          const r={started:st,intro:mv,AF:!!AF,ph:e.sv.ph,mv:e.sv.mv&&e.sv.mv.id,on:e.sv.on,hp:+(e.c.h/M(e.c)).toFixed(2),warns:DTL.live.length};toPos(A.cx+Math.cos(1)*(ARENA_R+6),A.cz+Math.sin(1)*(ARENA_R+6));STEP(2);r.home=+Math.hypot(e.m.position.x-A.cx,e.m.position.z-A.cz).toFixed(1);return r}""",i)
        print('  wipe',json.dumps(f))
        if r['ph']!=2 or d['AF'] or f['AF'] or r['warns']>12:bad.append(i)
    lerr=ev("()=>window.LERR||0");print('errs',errs[:10],lerr,'bad',bad)
    for i in bad:print('FAIL Sovereign %d: no Phase II, arena stuck after death/wipe, or too many warnings'%i)
    pe=[e for e in errs if not e.startswith('console:')]
    if pe:print('FAIL page errors:',pe[:3])
    if lerr:print('FAIL game loop error:',lerr)
play.run(s,w=640,hh=400)
