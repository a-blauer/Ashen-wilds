# v112: the Rime Wraith (Sovereign 2) — new model, scythe held blade-down, three new specials.
# PART=moves (default): casts every move (old and new) from a sensible spot and checks hits land / miss as expected,
#   no console errors, warnings cleaned up; then a dodge check (i-frames through a new special), then the AI: svPick
#   (real) from many spots must choose each of the new moves.
# PART=shot: close-up pictures into out/: idle from 3 sides, the walk, every new move at its key moments, Phase II.
#   SHOTS=idle,walk,reap,... limits; SIDE=angle; CZ zoom.
import play,json,os
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
PART=os.environ.get('PART','moves');OUT=play.TMP;BI=2
NEW=['frostbrand','wraithchain','maelstrom']
SH=[x for x in os.environ.get('SHOTS','').split(',') if x]
def s(pg):
    pg.set_default_timeout(900000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    pg.on('console',lambda m:errs.append('console:'+m.text[:300]) if m.type=='error' or (m.type=='warning' and m.text.startswith('sv ')) else None)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("(i)=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[i].ins[3])}",BI);pg.wait_for_timeout(1500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;if(window.GOD)hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
      window.HITS=[];const hb=bossHit;bossHit=function(e,k){HITS.push([+(+k).toFixed(2),+(hero.iv||0).toFixed(2)]);return hb.apply(this,arguments)};window.GOD=1;
      window.__down=down;down=function(){hero.hp=heroMax()};window.__pick=svPick;return 1}""")
    info=ev("""(i)=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[i];window.XA=A;
      const P=PMAP[i].ins[3].en,a=Math.atan2(P[1]-A.cz,P[0]-A.cx);window.EA=a;toPos(A.cx+Math.cos(a)*10,A.cz+Math.sin(a)*10);STEP(.3);
      const e=bossEnt(i);window.BE=e;STEP(.5);const S=e.sv;let n=0,v=0;S.R.root.traverse(o=>{if(o.isMesh){n++;v+=o.geometry.attributes.position.count/3}});
      return {sv:!!S,on:S.on,mv:S.mv&&S.mv.id,joints:Object.keys(S.R.J).length,meshes:n,tris:Math.round(v),merge:S.R.mergeN,moves:Object.keys(S.B.M),sign:DSTXT[i].atk.length}}""",BI)
    print('boss',json.dumps(info))
    ev("()=>{svPick=()=>null;STEP(3.2);return 1}")
    bad=[]
    # place the boss in the middle facing the den entrance, the hero at distance d in front (or behind)
    PLACE="""(k,d,back,ph)=>{const e=BE,S=e.sv,A=XA;svEndMove(e,true);S.mv=null;S.stg=0;S.inv=0;if(S.gone)S.B.reset(e);
      if(ph>1&&S.ph<2){S.ph=2;e.bs.ph=2}if(ph===1&&S.ph>1){S.ph=1;e.bs.ph=1}
      e.m.position.set(A.cx,0,A.cz);e.m.rotation.y=Math.atan2(Math.cos(EA),Math.sin(EA));const a=e.m.rotation.y+(back?Math.PI:0);
      toPos(A.cx+Math.sin(a)*d,A.cz+Math.cos(a)*d);hero.iv=0;HITS.length=0;S.cd={};STEP(.05);return 1}"""
    ev("(f)=>{window.PLACE=eval(f);return 1}",PLACE)
    if PART=='moves':
        # [move, distance, behind?, expect hit (True / False / None = don't care)]
        plan=[('reap',3.5,0,True),('reap2',3.5,0,True),('spinR',3.5,1,True),('cleave',6,0,True),('glide',12,0,True),('nova',3,1,True),
              ('icicles',12,0,True),('step',8,0,True),('prison',8,0,True),('awaken',4,0,True),('stagger',4,0,False),
              ('frostbrand',4,0,True),('wraithchain',10,0,True),('maelstrom',7,0,True),
              ('frostbrand',13,0,False),('wraithchain',10,1,False),('maelstrom',22,0,None)]
        for k,d,back,exp in plan:
            r=ev("""([k,d,back])=>{const e=BE,S=e.sv,D=S.B.M[k];if(!D)return {err:'nomove'};PLACE(k,d,back,D.ph||1);svStart(e,k,7);
              let t=0;const keep=k==='wraithchain'||k==='maelstrom'||k==='icicles'||k==='prison';while(t<D.dur+.4){STEP(.1);t+=.1;if(!keep&&!back){}}
              STEP(1.6);return {hits:HITS.slice(),warns:DTL.live.length,mv:S.mv&&S.mv.id,gone:!!S.gone,vis:e.m.visible,ph:S.ph}}""",[k,d,back])
            ok=('err' not in r) and (exp is None or (len(r['hits'])>0)==exp) and r['warns']==0 and not r['gone'] and r['vis']
            print('move',k,'d',d,'back',back,'expect',exp,json.dumps(r),'OK' if ok else 'BAD')
            if not ok:bad.append(k)
        # dodge: i-frames through the strike of each new special
        for k,d in [('frostbrand',4),('wraithchain',10),('maelstrom',7)]:
            r=ev("""([k,d])=>{const e=BE,S=e.sv,D=S.B.M[k];PLACE(k,d,0,D.ph||1);svStart(e,k,7);let t=0;
              while(t<D.dur+.3){STEP(.05);t+=.05;hero.iv=1}STEP(1.6);hero.iv=0;return {hits:HITS.slice()}}""",[k,d])
            ok=all(h[1]>0 for h in r['hits'])
            print('dodge',k,json.dumps(r),'OK' if ok else 'BAD')
            if not ok:bad.append('dodge:'+k)
        # edge leading: through the last 0.2 s before each swing lands, the blade travels tip-first (score = mean cos between
        # the blade's root->tip direction and its motion; 1 = perfectly tip/edge first, <0 = back of the blade first)
        r=ev("""()=>{const e=BE,S=e.sv,out={};const BP=(p,q)=>rwrBP(p,q);
          for(const [k,hi,d] of [['reap',0,3.5],['reap2',0,3.5],['spinR',0,3.5],['cleave',0,6],['glide',0,12],['step',0,8],['frostbrand',0,4],['wraithchain',1,10],['maelstrom',0,7],['maelstrom',1,7],['maelstrom',2,7]]){
            const D=S.B.M[k],h=D.hit[hi];PLACE(k,d,0,D.ph||1);svStart(e,k,7);STEP(Math.max(.016,h.t-.21));let sc=0,sv=0,pp=null;
            for(let i=0;i<13;i++){STEP(.016);const o=e.m.position,m=svWP(e,'scy',...BP(1.4,.25)).sub(o),a=svWP(e,'scy',...BP(0,0)).sub(o),b=svWP(e,'scy',...BP(2.55,1.25)).sub(o),ch=b.sub(a).normalize();
              if(pp){const v=m.clone().sub(pp);sc+=ch.dot(v);sv+=v.length()}pp=m}
            out[k+(hi?'#'+hi:'')]=+(sc/Math.max(1e-6,sv)).toFixed(2);STEP(D.dur);STEP(1.5)}return out}""")
        print('edge lead',json.dumps(r))
        for k,v in r.items():
            if v<.4:bad.append('lead:'+k)
        # the real AI picks the new moves
        r=ev("""(NEW)=>{svPick=__pick;const e=BE,S=e.sv,A=XA,seen={};
          for(let n=0;n<900;n++){const ph=n%2?2:1;S.ph=ph;S.cd={};S.last=[];const d=1+(n*7.3)%22,ang=(n*1.37)%6.283;
            e.m.position.set(A.cx,0,A.cz);e.m.rotation.y=0;pl.position.x=A.cx+Math.sin(ang)*d;pl.position.z=A.cz+Math.cos(ang)*d;
            const id=svPick(e);if(id)seen[id]=(seen[id]||0)+1}
          svPick=()=>null;S.ph=1;return seen}""",NEW)
        print('ai picks',json.dumps(r))
        for k in NEW:
            if not r.get(k):bad.append('ai:'+k)
        # a short free fight with the real AI (both phases)
        r=ev("""()=>{svPick=__pick;const e=BE,S=e.sv,A=XA;svEndMove(e,true);S.cd={};S.last=[];SVX.log.length=0;const seen={};let lm='';
          for(let t=0;t<70;t+=.1){const k=t*.4,rad=t%14<5?3.5:t%14<10?8:14;pl.position.x+=(A.cx+Math.cos(k)*rad-pl.position.x)*.1;pl.position.z+=(A.cz+Math.sin(k)*rad-pl.position.z)*.1;
            if(t>30&&S.ph===1){e.c.h=M(e.c)*.5}STEP(.1);if(S.mv&&S.mv.id!==lm){lm=S.mv.id;seen[lm]=(seen[lm]||0)+1}if(!S.mv)lm=''}
          svPick=()=>null;return {seen,ph:S.ph,warns:DTL.live.length,gone:!!S.gone}}""")
        print('fight',json.dumps(r))
        print('errs',errs[:10],ev("()=>window.LERR||0"),'bad',bad)
        print('RESULT','PASS' if not bad and not errs and not ev("()=>window.LERR||0") else 'FAIL')
    else:
        ev("""()=>{const L=new THREE.HemisphereLight(0xdde8ff,0x404050,.45);scene.add(L);const D=new THREE.DirectionalLight(0xffffff,.5);D.position.set(30,60,20);scene.add(D);
          window.SHOTCAM=(e,side,dist,h,ly)=>{const p=e.m.position,a=e.m.rotation.y+side,g=GH(p.x,p.z);cam.position.set(p.x+Math.sin(a)*dist,g+h,p.z+Math.cos(a)*dist);cam.lookAt(p.x,g+(ly==null?2.6:ly),p.z);cam.updateMatrixWorld();POST.render()};
          const st=document.createElement('style');st.textContent='.stage>*:not(#gl){visibility:hidden!important}';document.head.appendChild(st);return 1}""")
        def snap(name,side=0.9,dist=9.5,h=3.2,ly=2.6):
            ev("(a)=>{SHOTCAM(BE,...a);return 1}",[side,dist,h,ly]);fn=f'{OUT}/v112w_{name}.png'
            pg.locator('#gl canvas').screenshot(path=fn,timeout=300000,animations='disabled');print('shot',fn)
        want=lambda n:not SH or n in SH
        if want('idle'):
            ev("()=>{PLACE('',30,0,1);STEP(.6);return 1}")
            for nm,sd in [('front',0.0),('side',1.4),('back',3.0),('q',0.7)]:snap('idle_'+nm,sd)
            snap('idle_close',0.5,5.5,3.4,3.0)
        if want('walk'):
            ev("()=>{PLACE('',30,0,1);const e=BE;for(let i=0;i<40;i++){walkM(e.m,0,.04);STEP(.016)}return 1}")
            snap('walk',1.2)
        moves=[x for x in os.environ.get('MV','frostbrand,wraithchain,maelstrom,reap,reap2,cleave,glide,spinR,nova').split(',') if x]
        for k in moves:
            if not want(k) and SH:continue
            keys=ev("""(k)=>{const e=BE,S=e.sv,D=S.B.M[k];const ph=D.ph||1;PLACE(k,k==='glide'||k==='wraithchain'?11:k==='maelstrom'?8:4.5,0,ph);svStart(e,k,7);
              return [...new Set(D.trk.map(q=>q[0]))].filter(t=>t<=D.dur)}""",k)
            t=0
            for j,kt in enumerate(keys[:8]):
                ev("(dt)=>{STEP(dt);return 1}",max(.016,kt-t-.02));t=kt-.02
                snap(f'{k}_{j}',float(os.environ.get('SIDE','0.7')),7.5,3.4,2.8)
            ev("()=>{STEP(3);return 1}")
        if want('ph2'):
            ev("()=>{PLACE('',30,0,2);const S=BE.sv;S.ph=2;BE.bs.ph=2;STEP(.6);return 1}")
            snap('ph2',0.6)
        print('errs',errs[:10],ev("()=>window.LERR||0"))
play.run(s,w=800,hh=600)
