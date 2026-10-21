# v112: the Bloated One (Sovereign 4) — every move cast (old and new), hits land / miss as expected, the AI picks the new
# moves, a short free fight, and close-up screenshots of the model (idle, the cleaver grip, mid-attack of each new move,
# Phase II).  MODE=all|check|shot  SHOTS="name:move:t:side:dist:h:joint;..."  (writes out/v112_blo_*.png)
import play,json,os
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
MODE=os.environ.get('MODE','all');OUT=play.TMP;BI=4
NEW=['hook','gorge','furrow']
DEF_SHOTS=('idle_front:idle:0:0:9:3.2:;idle_side:idle:0:1.57:9:3.2:;idle_back:idle:0:3.14:9:3.4:;idle_q:idle:0:.7:8:3:;'
  'grip:idle:0:-1.3:4.5:0:hdR;grip_f:idle:0:-.45:5:0:hdR;'
  'chop_up:chop:1.2:-1.3:13:6:;chop_dn:chop:1.42:-1.2:10:3:;sweep_up:sweep:.85:.5:10:3.4:;sweep_hit:sweep:1.08:.5:10:3.2:;'
  'hook_wind:hook:.9:1.2:10:3.4:;hook_hit:hook:1.35:1.2:10:3.2:;hook_drag:hook:1.75:.9:10:3.2:;'
  'gorge_wind:gorge:1.0:1.0:10:3.4:;gorge_suck:gorge:1.8:.8:10:3.2:;gorge_blast:gorge:2.55:1.1:10:3.2:;'
  'furrow_wind:furrow:.95:1.4:11:3.6:;furrow_slam:furrow:1.3:1.2:11:3.2:;furrow_rip:furrow:1.75:.9:12:3.4:;hookchop:hookChop:.56:1.0:10:3.2:;'
  'stomp_up:stomp:.98:1.2:10:3.4:;vomit:vomit:1.3:.9:10:3.2:;flop_air:flop:1.25:1.4:13:4:;flop_land:flop:1.7:1.2:11:3:;'
  'frenzy_sw:frenzy:1.6:.7:10:3.2:;burst:burst:1.4:2.4:10:3.4:;stag:stagger:1.0:1.0:10:3:;'
  'ph2_front:idle2:0:.35:9:3.2:;ph2_back:idle2:0:2.8:9:3.4:')
SHOTS=[x for x in os.environ.get('SHOTS',DEF_SHOTS).split(';') if x]
def s(pg):
    pg.set_default_timeout(900000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    pg.on('console',lambda m:errs.append('console:'+m.text[:300]) if m.type=='error' else None)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("(i)=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[i].ins[3])}",BI);pg.wait_for_timeout(1500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;if(window.GOD)hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
      window.HITS=[];const hb=bossHit;bossHit=function(e,k){HITS.push([+(+k).toFixed(2),+(hero.iv||0).toFixed(2)]);return hb.apply(this,arguments)};
      window.GOD=1;window.__down=down;down=function(){hero.hp=heroMax()};window.__pick=svPick;svPick=()=>null;
      const st=document.createElement('style');st.textContent='.stage>*:not(#gl){visibility:hidden!important}';document.head.appendChild(st);return 1}""")
    info=ev("""(i)=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[i];window.XA=A;
      const P=PMAP[i].ins[3].en,a=Math.atan2(P[1]-A.cz,P[0]-A.cx);window.EA=a;toPos(A.cx+Math.cos(a)*10,A.cz+Math.sin(a)*10);STEP(.3);
      const e=bossEnt(i);window.BE=e;STEP(.5);const S=e.sv;let n=0,tri=0;S.R.root.traverse(o=>{if(o.isMesh){n++;tri+=o.geometry.attributes.position.count/3}});
      return {sv:!!S,moves:Object.keys(S.B.M),joints:Object.keys(S.R.J).length,meshes:n,tris:Math.round(tri),merge:S.R.mergeN,mats:S.R.mats.length}}""",BI)
    print('boss',json.dumps(info))
    ev("()=>{STEP(3.4);return 1}")
    # place the boss in the middle facing the hero at distance d; start move k (or idle)
    SETUP="""([k,d])=>{const e=BE,S=e.sv,A=XA;svEndMove(e,true);S.mv=null;S.stg=0;S.inv=0;S.trk=null;S.aw=0;S.cd={};
      enemies.slice().forEach(q=>{if(!q.boss)removeE(q)});e.m.position.set(A.cx,0,A.cz);const ya=EA;e.m.rotation.y=Math.atan2(Math.cos(ya),Math.sin(ya));
      const D=S.B.M[k],back=D&&(D.a==='b'||D.a==='sb'),a=e.m.rotation.y+(back?Math.PI:0);toPos(A.cx+Math.sin(a)*d,A.cz+Math.cos(a)*d);hero.iv=0;HITS.length=0;
      if(D&&D.ph>1&&S.ph<2){S.ph=2;e.bs.ph=2;try{S.B.awake&&S.B.awake(e)}catch(_){}}STEP(.05);if(D)svStart(e,k,7);return !!D}"""
    if MODE in ('all','check'):
        res={}
        for k in info['moves']:
            if k in ('intro','awaken'):continue
            D=ev("(k)=>{const D=SVB[4].M[k];return {r:D.r||[0,8],dur:D.dur,ph:D.ph||1,a:D.a||'f'}}",k)
            d=max(D['r'][0]+.8,min(D['r'][1]-.5,(D['r'][0]+min(D['r'][1],D['r'][0]+6))/2+1))
            if k=='stagger':d=4
            ev(SETUP,[k,d]);ev("(t)=>{STEP(t);return 1}",D['dur']+.2)
            h=ev("()=>HITS.slice()")
            # dodge: the same move with the hero far away (out of every shape) must miss
            ev(SETUP,[k,26 if k not in ('burst','flop','flop2') else 4]);ev("()=>{const A=XA;toPos(A.cx+ARENA_R-1.5,A.cz);return 1}")
            # for tracking moves the hero dashes (i-frames) through each hit instead
            ev("(t)=>{const n=Math.round(t/.05);for(let i=0;i<n;i++){hero.iv=.3;STEP(.05)}return 1}",D['dur']+.2)
            hm=ev("()=>HITS.filter(x=>x[1]<=0).length")
            res[k]=(d,h,hm);print('move',k,'d=%.1f'%d,'hits',h,'dodged-hits',hm)
        # the phase-2 awakening once
        ev(SETUP,['awaken',5]);ev("()=>{STEP(3.6);return 1}");print('awaken ph',ev("()=>BE.sv.ph"),'hits',ev("()=>HITS.slice()"))
        nohit=[k for k,(d,h,hm) in res.items() if not h and k not in ('stagger','flop2')]
        print('moves that never hit at their range:',nohit)
        print('moves that hit through a dodge:',[k for k,(d,h,hm) in res.items() if hm])
        # AI: which moves does svPick choose at each range (cooldowns cleared each time)
        pk=ev("""()=>{svPick=__pick;const e=BE,S=e.sv,A=XA,out={};S.ph=2;e.bs.ph=2;
          for(const d of [3,6,9,13,18]){const c={};e.m.position.set(A.cx,0,A.cz);const ya=EA;e.m.rotation.y=Math.atan2(Math.cos(ya),Math.sin(ya));const a=e.m.rotation.y;toPos(A.cx+Math.sin(a)*d,A.cz+Math.cos(a)*d);
            for(let n=0;n<400;n++){S.cd={};S.last=[];const id=svPick(e);c[id]=(c[id]||0)+1}out[d]=c}
          const c1={};S.ph=1;e.bs.ph=1;for(let n=0;n<300;n++){S.cd={};S.last=[];const id=svPick(e);c1[id]=(c1[id]||0)+1}out.ph1_18=c1;svPick=()=>null;return out}""")
        print('ai picks',json.dumps(pk))
        # free fight with the real AI (30 s)
        fr=ev("""()=>{svPick=__pick;const e=BE,S=e.sv,A=XA;svEndMove(e,true);S.ph=1;e.bs.ph=1;S.cd={};S.last=[];e.c.h=M(e.c);const seen={};let t=0,last='',dmgT=0;
          while(t<60){const k=t*.35,rad=t%14<5?3.5:t%14<10?8:14;let x=A.cx+Math.cos(k)*rad,z=A.cz+Math.sin(k)*rad;pl.position.x+=(x-pl.position.x)*.08;pl.position.z+=(z-pl.position.z)*.08;
            STEP(.1);t+=.1;dmgT+=.1;if(dmgT>.5){dmgT=0;hurt(e,Math.round(M(e.c)*.004),{col:0xffffff},false)}if(t>20&&S.ph===1)e.c.h=Math.min(e.c.h,M(e.c)*.54);
            if(S.mv&&S.mv.id!==last){last=S.mv.id;seen[last]=(seen[last]||0)+1}if(!S.mv)last='';if(e.dead)break}
          svPick=()=>null;return {seen,ph:S.ph,warns:DTL.live.length,hp:+(e.c.h/M(e.c)).toFixed(2)}}""")
        print('fight',json.dumps(fr))
        print('new moves chosen in the fight:',[k for k in NEW if k in fr['seen']])
        ev("()=>{const e=BE,S=e.sv;svEndMove(e,true);S.ph=1;e.bs.ph=1;e.c.h=M(e.c);STEP(.3);return 1}")
    if MODE in ('all','shot'):
        ev("()=>{const L=new THREE.HemisphereLight(0xfff0e0,0x404030,.55);scene.add(L);window.XL=L;pl.visible=false;return 1}")
        for sp in SHOTS:
            nm,k,t,side,dist,h,jn=(sp.split(':')+['']*7)[:7];t=float(t);side=float(side);dist=float(dist);h=float(h)
            ph2=k=='idle2' or k in ('frenzy','burst','flop2')
            ev("(p)=>{const e=BE,S=e.sv;S.ph=p?2:1;e.bs.ph=p?2:1;return 1}",ph2)
            ev("(f)=>{svMoveFree=f?()=>{BE.sv.walkSp=0}:(window.__mf||(window.__mf=svMoveFree));return 1}",k in ('idle','idle2'))
            if k in ('idle','idle2'):ev(SETUP,['none',14]);ev("()=>{STEP(1.2);return 1}")
            else:
                ev(SETUP,[k,{'hook':8,'furrow':9,'flop':9,'gorge':6}.get(k,4)]);ev("(t)=>{STEP(t);return 1}",t)
            ev("""([side,dist,h,jn])=>{const e=BE,p=e.m.position,a=e.m.rotation.y+side;let tx=p.x,ty=GH(p.x,p.z)+h*.6,tz=p.z;
              if(jn){const w=svWP(e,jn,0,-.3,.9);tx=w.x;ty=w.y;tz=w.z;cam.position.set(tx+Math.sin(a)*dist,ty+.6,tz+Math.cos(a)*dist)}
              else cam.position.set(p.x+Math.sin(a)*dist,GH(p.x,p.z)+h,p.z+Math.cos(a)*dist);cam.lookAt(tx,ty,tz);POST.render();return 1}""",[side,dist,h,jn])
            pg.locator('#gl canvas').screenshot(path=f'{OUT}/v112_blo_{nm}.png',timeout=300000,animations='disabled')
            print('shot',nm)
    print('errs',errs[:8],'LERR',ev("()=>window.LERR||0"),'ERRS',len(errs))
play.run(s,w=720,hh=560)
