# v141 Sovereigns: OLD (v141 changes off) vs NEW for each boss, in two fights of SEC seconds each:
#   melee - the hero stands 3 tiles in front and hits steadily: how many different moves the boss uses, how often it disengages
#   kite  - the hero runs circles 10-11 tiles away and never stops: how often the boss lands a hit
# Also checks the wind-up speed-up (a 1.38 s hit lands at ~1.16 s) and that a defeated Sovereign does not come back.
#   BL=0..5 SEC=40 python3 v141_sov.py      Prints FAIL lines and CHECKS OK / FAIL.
import play,json,os
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
BL=[int(x) for x in os.environ.get('BL','0,1,2,3,4,5').split(',')];SEC=float(os.environ.get('SEC','40'))
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,(' '+str(info)[:500]) if info!='' else '')
    if not ok:FAIL.append(n)
def s(pg):
    pg.set_default_timeout(1500000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="mage"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    first=True
    for i in BL:
        ev("(i)=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[i].ins[3])}",i);pg.wait_for_timeout(1500)
        if first:
            first=False
            ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
            window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
            window.__down=down;down=function(){hero.hp=heroMax()};window.K141=JSON.parse(JSON.stringify(SV141));return 1}""")
        out={}
        for mode in ('old','new'):
            for fight in ('melee','kite'):
                r=ev("""([i,SEC,mode,fight])=>{const K=K141;Object.assign(SV141,JSON.parse(JSON.stringify(K)));
                  if(mode==='old'){SV141.wind.from=99;SV141.close=-1;SV141.far=999;SV141.chase=1}
                  try{if(AF)arenaFail()}catch(_){}enemies.slice().forEach(e=>removeE(e));bossDone.delete(i);spawnBoss(i);STEP(.2);const A=ARN[i];const P=PMAP[i].ins[3].en,a0=Math.atan2(P[1]-A.cz,P[0]-A.cx);
                  toPos(A.cx+Math.cos(a0)*8,A.cz+Math.sin(a0)*8);STEP(.5);const e=bossEnt(i),S=e.sv;const h0=SVX.st.hits;
                  let t=0,dmgT=0,dis=0,lastDc=0,ang=a0;const seen={};let lastMv='';
                  while(t<SEC&&!e.dead){
                    if(fight==='melee'){if(t<1.5||d2(pl.position,e.m.position)>4){const dx=e.m.position.x-pl.position.x,dz=e.m.position.z-pl.position.z,l=Math.hypot(dx,dz);if(l>3){pl.position.x+=dx/l*.45;pl.position.z+=dz/l*.45}}}
                    else{ang+=.1*4.5/10.5;const R=Math.min(10.5,ARENA_R-1.5);const q=inArena(A,new THREE.Vector3(A.cx+Math.cos(ang)*R,0,A.cz+Math.sin(ang)*R),1);pl.position.x=q.x;pl.position.z=q.z}
                    STEP(.1);t+=.1;dmgT+=.1;if(dmgT>=.5){dmgT=0;hurt(e,Math.round(M(e.c)*.006),{col:0xffffff},false)}
                    if(e.c.h<M(e.c)*.2)e.c.h=M(e.c)*.6;if((S.dc141||0)!==lastDc){lastDc=S.dc141;dis++}
                    if(S.mv&&S.mv.id!==lastMv){lastMv=S.mv.id;seen[lastMv]=(seen[lastMv]||0)+1}if(!S.mv)lastMv=''}
                  const all=Object.keys(SVB[i].M).filter(k=>SVB[i].M[k].wt);
                  return {hits:SVX.st.hits-h0,distinct:all.filter(k=>seen[k]).length,dis,reach:seen.reach141||0,moves:seen,err:window.LERR||null}}""",[i,SEC,mode,fight])
                out[mode+'_'+fight]=r;print('boss',i,mode,fight,json.dumps(r))
        o,n=out,out
        chk('boss %d: more different moves against melee'%i,n['new_melee']['distinct']>=o['old_melee']['distinct'],(o['old_melee']['distinct'],n['new_melee']['distinct']))
        chk('boss %d: disengages from melee'%i,n['new_melee']['dis']>=1,n['new_melee']['dis'])
        chk('boss %d: a kiting hero gets hit at least as often'%i,n['new_kite']['hits']>=o['old_kite']['hits'],(o['old_kite']['hits'],n['new_kite']['hits']))
        chk('boss %d: Reach used against kiting'%i,n['new_kite']['reach']>=1,n['new_kite']['reach'])
    # wind-up: Argus' Gaze (first hit 1.38 s) lands at about 1.16 s; a defeated Sovereign does not come back
    r=ev("""()=>{Object.assign(SV141,JSON.parse(JSON.stringify(K141)));const D=SVB[0].M.gaze;const k=sv141K(D,'gaze');
      bossDone.add(0);enemies.slice().forEach(e=>removeE(e));const e=spawnBoss(0);bossT[0]=1;STEP(1.2);const back=enemies.some(q=>q.boss&&q.bi===0&&!q.dead);bossDone.delete(0);
      return {k,hit:+(1.38/k).toFixed(2),spawned:!!e,back}}""")
    chk('gaze lands at ~1.16 s',abs(r['hit']-1.16)<.03,r)
    chk('a defeated Sovereign is not spawned again',not r['spawned'] and not r['back'],r)
    chk('no page errors',not errs,errs[:3])
    print('CHECKS OK' if not FAIL else 'CHECKS FAIL '+str(FAIL))
play.run(s)
