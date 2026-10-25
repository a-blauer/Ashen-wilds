# v133: Sovereigns — sturdier posture (fewer staggers), a retreat after heavy damage, and spacing plans so a hero who stands
# still in melee still sees the boss's ranged / gap-closing moves. For each boss: OLD (v133 features off) vs NEW, the hero
# standing 3 tiles away and hitting steadily. BL=0..5, SEC=60.
import play,json,os
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
BL=[int(x) for x in os.environ.get('BL','0,1,2,3,4,5').split(',')];SEC=float(os.environ.get('SEC','60'))
def s(pg):
    pg.set_default_timeout(1500000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    first=True;fails=[];tot=[0,0]
    for i in BL:
        ev("(i)=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[i].ins[3])}",i);pg.wait_for_timeout(1500)
        if first:
            first=False
            ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
            window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
            window.__down=down;down=function(){hero.hp=heroMax()};window.KN0={pm:POS133.mul,pe:POS133.esc,pg:POS133.grace,dr:POS133.drain,rc:RT133.chance,p:PL133.p,p2:PL133.p2,ps:PL133.pStill,s141:typeof SV141!='undefined'?JSON.stringify(SV141):null};return 1}""")
        out={}
        for mode in ('old','new'):
            r=ev("""([i,SEC,mode])=>{const K=KN0;if(mode==='old'){POS133.mul=1;POS133.esc=0;POS133.grace=0;POS133.drain=0;RT133.chance=0;PL133.p=PL133.p2=PL133.pStill=0;if(K.s141){SV141.close=-1;SV141.far=999;SV141.sure=999;SV141.chase=1}}   // v141's footwork is off in the baseline too
              else{POS133.mul=K.pm;POS133.esc=K.pe;POS133.grace=K.pg;POS133.drain=K.dr;RT133.chance=K.rc;PL133.p=K.p;PL133.p2=K.p2;PL133.pStill=K.ps;if(K.s141)Object.assign(SV141,JSON.parse(K.s141))}
              try{if(AF)arenaFail()}catch(_){}enemies.slice().forEach(e=>removeE(e));spawnBoss(i);STEP(.2);const A=ARN[i];const P=PMAP[i].ins[3].en,a=Math.atan2(P[1]-A.cz,P[0]-A.cx);
              toPos(A.cx+Math.cos(a)*8,A.cz+Math.sin(a)*8);STEP(.5);const e=bossEnt(i),S=e.sv;const st0=SVX.st.stag,rt0=SVX.st.rt||0;
              let t=0,dmgT=0,maxL=0,sumL=0,n=0;const seen={};let lastMv='';
              // first close in to 3 tiles in front of the boss, then stand still and hit (1.5% of max health per second)
              while(t<SEC&&!e.dead){if(t<1.5){const dx=e.m.position.x-pl.position.x,dz=e.m.position.z-pl.position.z,l=Math.hypot(dx,dz);if(l>3){pl.position.x+=dx/l*.5;pl.position.z+=dz/l*.5}}
                STEP(.1);t+=.1;const L=d2(pl.position,e.m.position);maxL=Math.max(maxL,L);sumL+=L;n++;
                dmgT+=.1;if(dmgT>=.5){dmgT=0;if(L<7)hurt(e,Math.round(M(e.c)*.0075),{col:0xffffff},false)}
                if(e.c.h<M(e.c)*.2)e.c.h=M(e.c)*.6;
                if(S.mv&&S.mv.id!==lastMv){lastMv=S.mv.id;seen[lastMv]=(seen[lastMv]||0)+1}if(!S.mv)lastMv=''}
              const all=Object.keys(SVB[i].M).filter(k=>SVB[i].M[k].wt);
              const far=all.filter(k=>(SVB[i].M[k].r||[0])[0]>=4).reduce((a,k)=>a+(seen[k]||0),0);
              return {far,distinct:all.filter(k=>seen[k]).length,of:all.length,stag:SVX.st.stag-st0,rt:(SVX.st.rt||0)-rt0,avgL:+(sumL/n).toFixed(1),maxL:+maxL.toFixed(1),moves:seen}}""",[i,SEC,mode])
            out[mode]=r;print('boss',i,mode,json.dumps(r))
        o,nw=out['old'],out['new']
        if nw['stag']>=o['stag']:fails.append('boss %d: staggers not fewer (%d vs %d)'%(i,nw['stag'],o['stag']))
        tot[0]+=o['far'];tot[1]+=nw['far']
        if nw['rt']<1:fails.append('boss %d: never retreated'%i)
    print('far-range casts old',tot[0],'new',tot[1])
    if tot[1]<=tot[0]*1.3:fails.append('far-range moves not used clearly more often while the hero stands still (%d vs %d)'%tot)
    lerr=ev("()=>window.LERR||0")
    for f in fails:print('FAIL',f)
    if errs:print('FAIL page errors:',errs[:3])
    if lerr:print('FAIL game loop error:',lerr)
    print('done')
play.run(s,w=640,hh=400)
