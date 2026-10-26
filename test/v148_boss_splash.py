# v148.1: boss strikes (Sovereigns, v146 ring waves) also catch a companion standing in them, at 30%
#   BL=0..5 SEC=25 python3 v148_boss_splash.py      Prints FAIL lines and "boss splash: checked".
import play,json,os
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
BL=[int(x) for x in os.environ.get('BL','0,1,2,3,4,5').split(',')];SEC=float(os.environ.get('SEC','25'))
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,(' '+str(info)[:400]) if info!='' else '')
    if not ok:FAIL.append(n)
def s(pg):
    pg.set_default_timeout(1500000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    first=True
    for i in BL:
        ev("(i)=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[i].ins[3])}",i);pg.wait_for_timeout(1500)
        if first:
            first=False
            ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
            window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
            window.__down=down;down=function(){hero.hp=heroMax()};
            if(!party.length)party.push(mkC('Foxlet',30));
            window.SLOG=[];{const f=hitTarget;hitTarget=function(e,tg,mult,mt){const k=fols.indexOf(tg);if(k>=0)SLOG.push({mult,boss:!!(e&&(e.sv||e.mb144))});return f.apply(this,arguments)}}
            return 1}""")
        r=ev("""([i,SEC])=>{const out={};try{if(AF)arenaFail()}catch(_){}enemies.slice().forEach(e=>removeE(e));bossDone.delete(i);spawnBoss(i);STEP(.3);
          const A=ARN[i],e=bossEnt(i);out.fols=fols.length;out.vis=fols[0]&&fols[0].visible;if(!e||!fols.length)return out;
          const f0=fols[0],c0=party[0],B=e.m.position;const put=(dx,dz)=>{f0.position.set(B.x+dx,f0.position.y,B.z+dz)};
          // hero far away, companion inside a 3-tile circle round the boss
          const P=PMAP[i].ins[3].en,a0=Math.atan2(P[1]-A.cz,P[0]-A.cx);toPos(A.cx+Math.cos(a0)*8,A.cz+Math.sin(a0)*8);STEP(.5);c0.h=M(c0);SLOG.length=0;put(1.5,0);out.af=[!!AF,AF&&AF.i,e.sv&&e.sv.i,!!e.mb144,typeof actN141=="function"?actN141():-1,c0.h];
          svHitNow(e,{k:'c',r:3},{x:B.x,z:B.z,a:0},1.4,{flash:false});out.inside=SLOG.slice();out.dmg=M(c0)-c0.h;out.max=M(c0);
          SLOG.length=0;put(6,0);svHitNow(e,{k:'c',r:3},{x:B.x,z:B.z,a:0},1.4,{flash:false});out.outside=SLOG.slice();
          SLOG.length=0;put(1.5,0);svHitNow(e,{k:'c',r:99},{x:B.x,z:B.z,a:0},1.4,{flash:false});out.catchall=SLOG.slice();
          // a ring wave sweeping out from the boss passes the companion once
          SLOG.length=0;c0.h=M(c0);put(4,0);sk146RingWave(e,B.clone(),1,8,1,1.2,1,0xffffff);for(let k=0;k<20;k++)STEP(.1),put(4,0);out.ring=SLOG.slice();
          // a real fight: the hero stands in melee range, the companion right beside the hero
          SLOG.length=0;const n0=BSPL148.n;let t=0;
          while(t<SEC&&!e.dead){const dx=e.m.position.x-pl.position.x,dz=e.m.position.z-pl.position.z,l=Math.hypot(dx,dz);if(l>2.6){pl.position.x+=dx/l*.45;pl.position.z+=dz/l*.45}
            c0.h=M(c0);f0.position.set(pl.position.x+.5,f0.position.y,pl.position.z+.4);STEP(.1);t+=.1;if(e.c.h<M(e.c)*.3)e.c.h=M(e.c)*.7}
          out.fight=BSPL148.n-n0;out.fightMult=[...new Set(SLOG.filter(q=>q.boss).map(q=>+q.mult.toFixed(3)))].slice(0,8);out.err=window.LERR||null;return out}""",[i,SEC])
        print('boss',i,json.dumps(r))
        if not r.get('fols'):chk('boss %d: companion out'%i,False);continue
        ins=[q for q in r['inside'] if q['boss']]
        chk('boss %d: companion inside the strike hit once at 30%%'%i,len(ins)==1 and abs(ins[0]['mult']-1.4*.3)<1e-6,ins)
        chk('boss %d: companion lost HP'%i,r['dmg']>0,(r['dmg'],r['max']))
        chk('boss %d: companion outside the strike not hit'%i,not r['outside'],r['outside'])
        chk('boss %d: catch-all (projectile) hit does not splash'%i,not r['catchall'],r['catchall'])
        chk('boss %d: ring wave caught the companion once at 30%%'%i,len(r['ring'])==1 and abs(r['ring'][0]['mult']-.3)<1e-6,r['ring'])
        chk('boss %d: companion beside the hero caught in a real fight'%i,r['fight']>=1,r['fight'])
        chk('boss %d: no errors'%i,not r['err'],r['err'])
    chk('no page errors',not errs,errs[:3])
    print('boss splash: checked' if not FAIL else 'CHECKS FAIL %s'%FAIL)
play.run(s,w=800,hh=500)
