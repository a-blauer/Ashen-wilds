# v112 Argus (Sovereign 0): the reworked model, all moves (old and new), hits landing / missing, the AI choosing the new moves,
# and close-up screenshots (idle, walk, phase II, mid-attack frames of each new move) into out/v112a_*.png.
# SHOT=0 skips pictures.  LIT=1 adds a fill light to the pictures.  MV=whirl,furrow limits the move list.
import play,json,os
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
SH=os.environ.get('SHOT','1')!='0';MVS=[x for x in os.environ.get('MV','').split(',') if x];OUT=play.TMP
NEW=['whirl','furrow','furrow3','sweep']
def s(pg):
    pg.set_default_timeout(900000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    pg.on('console',lambda m:errs.append('console:'+m.text[:300]) if m.type=='error' else None)
    ev("()=>localStorage.clear()");ev('()=>{window.LIT0=%d}'%int(os.environ.get('LIT','1')))
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[0].ins[3])}");pg.wait_for_timeout(1500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
      window.HITS=[];const hb=bossHit;bossHit=function(e,k){HITS.push([+(+k).toFixed(2),+(hero.iv||0).toFixed(2)]);return hb.apply(this,arguments)};
      window.__pick=svPick;svPick=()=>null;down=function(){hero.hp=heroMax()};
      if(window.LIT0){const L=new THREE.HemisphereLight(0xfff4e0,0x404050,1.3);scene.add(L);const D=new THREE.DirectionalLight(0xffffff,1.1);D.position.set(30,60,20);scene.add(D)}
      const st=document.createElement('style');st.textContent='.stage>*:not(#gl){visibility:hidden!important}';document.head.appendChild(st);return 1}""")
    info=ev("""()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[0];window.XA=A;
      const P=PMAP[0].ins[3].en,a=Math.atan2(P[1]-A.cz,P[0]-A.cx);window.EA=a;toPos(A.cx+Math.cos(a)*10,A.cz+Math.sin(a)*10);STEP(.3);
      const e=bossEnt(0);window.BE=e;STEP(.5);const S=e.sv;let n=0,tri=0;S.R.root.traverse(o=>{if(o.isMesh){n++;tri+=o.geometry.attributes.position.count/3}});
      return {sv:!!S,AF:!!AF,moves:Object.keys(S.B.M),joints:Object.keys(S.R.J).length,drawCalls:n,tris:Math.round(tri),merge:S.R.mergeN,eyes:S.R.eyes.length}}""")
    print('boss',json.dumps(info))
    ev("()=>{STEP(3.2);return 1}")   # the intro
    def shot(name,side,dist,h,look=1.6):
        if not SH:return
        ev("([side,dist,h,look])=>{const e=BE,p=e.m.position,a=e.m.rotation.y+side;cam.position.set(p.x+Math.sin(a)*dist,GH(p.x,p.z)+h,p.z+Math.cos(a)*dist);cam.lookAt(p.x,GH(p.x,p.z)+look,p.z);POST.render()}",[side,dist,h,look])
        pg.locator('#gl canvas').screenshot(path=f'{OUT}/v112a_{name}.png',timeout=300000,animations='disabled')
    place="""(k)=>{const e=BE,S=e.sv,A=XA;svEndMove(e,true);S.mv=null;S.stg=0;S.inv=0;S.cd={};enemies.slice().forEach(q=>{if(q.minion)removeE(q)});
      e.m.position.set(A.cx,0,A.cz);e.m.rotation.y=Math.atan2(Math.cos(EA),Math.sin(EA));return 1}"""
    # ---- idle close-ups (front 3/4, side, rear 3/4, low front) and a walk frame ----
    ev(place,'');ev("()=>{const e=BE,A=XA,a=e.m.rotation.y;toPos(A.cx+Math.sin(a)*14,A.cz+Math.cos(a)*14);STEP(1.2);return 1}")
    shot('idle_front',.6,9,3.2);shot('idle_side',1.57,9,2.8);shot('idle_rear',2.5,9,3.5);shot('idle_head',.25,5.2,3.6,3.4);shot('idle_under',1.2,6.5,1.0,1.6)
    ev("()=>{const e=BE;e.sv.spd=3.2;e.sv.gp=1.1;for(let i=0;i<10;i++){e.sv.spd=3.2;svApply(e,.016,VT+=16)}return 1}");shot('walk_a',1.57,9,2.8)
    ev("()=>{const e=BE;for(let i=0;i<30;i++){e.sv.spd=3.2;e.sv.lp.copy(e.m.position);svApply(e,.016,VT+=16)}return 1}");shot('walk_b',1.57,9,2.8)
    # ---- every move: in range (should hit), and the new ones also from a safe spot (should miss) ----
    cast="""([k,mode])=>{const e=BE,S=e.sv,A=XA,D=S.B.M[k];if(!D)return 'nomove';svEndMove(e,true);S.mv=null;S.stg=0;S.inv=0;S.cd={};
      if(D.ph>1&&S.ph<2){S.ph=2;e.bs.ph=2;try{S.B.awake&&S.B.awake(e)}catch(_){}}if(D.ph1only&&S.ph>1){S.ph=1;e.bs.ph=1}
      enemies.slice().forEach(q=>{if(q.minion)removeE(q)});e.m.position.set(A.cx,0,A.cz);e.m.rotation.y=Math.atan2(Math.cos(EA),Math.sin(EA));
      const r=D.r||[0,8];let d=Math.max(r[0]+.8,Math.min(r[1]-.5,(r[0]+Math.min(r[1],r[0]+6))/2+1)),side=(D.a==='b'||D.a==='sb')?Math.PI:0;
      if(k==='whirl'&&mode==='miss')d=8.5;if((k==='furrow'||k==='furrow3'))d=9;if(k==='sweep')d=mode==='miss'?9:10;
      if(k==='sweep'&&mode==='miss')side=Math.PI;
      const a=e.m.rotation.y+side;toPos(A.cx+Math.sin(a)*d,A.cz+Math.cos(a)*d);hero.iv=0;HITS.length=0;STEP(.05);
      window.SWY=[];window.Y0=e.m.rotation.y;svStart(e,k,7);const TK=D.trk||[[D.dur]];return {d:+d.toFixed(1),dur:D.dur,keys:[...new Set(TK.map(q=>q[0]))].filter(t=>t<=D.dur)}}"""
    res={};moves=MVS or [m for m in info['moves'] if m not in ('intro',)]
    for k in moves:
        modes=['hit','miss'] if k in NEW else ['hit']
        for mode in modes:
            r=ev(cast,[k,mode])
            if not isinstance(r,dict):print('move',k,r);continue
            t=0
            if k in NEW and mode=='hit' and SH:
                for j,kt in enumerate(r['keys']):
                    dt=max(.016,kt-t);ev("(dt)=>{STEP(dt);return 1}",dt);t=kt
                    shot(f'{k}_{j}',1.2 if k!='sweep' else .5,11,4.2,1.6)
                    if k=='whirl' and j==2:   # mid-spin
                        ev("()=>{STEP(.1);return 1}");t+=.1;shot(f'{k}_{j}b',1.2,11,4.2,1.6)
            else:
                # step finely, record the sweep's beam angle
                while t<r['dur']+.1:
                    if mode=='miss' and k.startswith('furrow') and abs(t-.7)<.026:   # dodge sideways after it has locked its aim
                        ev("(a)=>{const e=BE,y=e.m.rotation.y+a[0];toPos(e.m.position.x+Math.sin(y)*a[1],e.m.position.z+Math.cos(y)*a[1]);return 1}",[.5,9] if k=='furrow' else [.21,12])
                    ev("()=>{STEP(.05);const e=BE,M=e.sv.mv;if(M&&M.id==='sweep'&&M.an.sw)SWY.push(+svAng(argSweepYaw(e)-Y0).toFixed(2));return 1}");t+=.05
            ev("(dt)=>{STEP(dt);return 1}",max(.05,r['dur']-t+.15))
            hits=ev("()=>HITS.slice()");sw=ev("()=>SWY.length?[Math.min(...SWY),Math.max(...SWY)]:null")
            res[(k,mode)]=hits
            print('move',k,mode,'d',r['d'],'dur',r['dur'],'hits',hits,('sweepYaw '+str(sw)) if sw else '')
    # ---- phase II look ----
    ev(place,'');ev("()=>{const e=BE,S=e.sv;S.ph=2;e.bs.ph=2;S.B.awake(e);const A=XA,a=e.m.rotation.y;toPos(A.cx+Math.sin(a)*14,A.cz+Math.cos(a)*14);STEP(1.5);return 1}")
    shot('ph2_front',.6,9,3.2);shot('ph2_side',1.57,9,2.8)
    # ---- the AI: which moves does svPick choose by situation (phase I and II) ----
    pick=ev("""()=>{const e=BE,S=e.sv,A=XA;svPick=__pick;const out={};
      const put=(d,side)=>{e.m.position.set(A.cx,0,A.cz);e.m.rotation.y=0;const a=side;toPos(A.cx+Math.sin(a)*d,A.cz+Math.cos(a)*d)};
      for(const ph of [1,2]){S.ph=ph;for(const [nm,d,side] of [['close-f',3,0],['close-b',3,Math.PI],['mid-f',9,0],['far-f',18,0]]){const c={};
        for(let n=0;n<300;n++){put(d,side);S.cd={};S.last=[];const id=svPick(e);c[id]=(c[id]||0)+1}out['ph'+ph+' '+nm]=c}}
      svPick=()=>null;S.ph=1;return out}""")
    for k,v in pick.items():print('pick',k,json.dumps(v))
    # ---- a free fight with the real AI (both phases): every weighted move should come up ----
    fight=ev("""()=>{const e=BE,S=e.sv,A=XA;svPick=__pick;svEndMove(e,true);S.mv=null;S.ph=1;e.bs.ph=1;e.c.h=M(e.c);S.cd={};S.last=[];const seen={};let last='',t=0;
      while(t<150){const k=t*.3,rad=t%12<4?3:t%12<8?9:15;let x=A.cx+Math.cos(k)*rad,z=A.cz+Math.sin(k)*rad;pl.position.x+=(x-pl.position.x)*.1;pl.position.z+=(z-pl.position.z)*.1;
        STEP(.1);t+=.1;if(t>60&&S.ph===1&&!S.mv)e.c.h=M(e.c)*.5;if(S.mv&&S.mv.id!==last){last=S.mv.id;seen[last]=(seen[last]||0)+1}if(!S.mv)last='';if(e.dead)break}
      svPick=()=>null;return {seen,ph:S.ph,warns:DTL.live.length}}""")
    print('fight',json.dumps(fight))
    allm=ev("()=>Object.keys(SVB[0].M).filter(k=>SVB[0].M[k].wt)")
    miss=[k for k in allm if k not in fight['seen']]
    print('never chosen in the fight:',miss)
    ok=True
    for k in NEW:
        if (k,'hit') in res and not res[(k,'hit')]:print('FAIL',k,'did not hit');ok=False
        if (k,'miss') in res and res[(k,'miss')]:print('FAIL',k,'hit from the safe spot');ok=False
    for k in NEW:
        if not any(k in v for v in pick.values()):print('FAIL AI never picks',k);ok=False
    print('errs',errs[:8],ev("()=>window.LERR||0"),'OK' if ok and not errs else 'BAD')
play.run(s,w=800,hh=512)
