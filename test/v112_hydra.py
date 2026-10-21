# v112: the Crest Hydra (Sovereign 1) — every move cast (old and new) with hit checks, dodge checks for the three new
# moves (Mire Rush, Undertow, Venom Maelstrom), the AI picking them (svPick by range / side / phase + a short real fight),
# the model's part / draw counts, and close-up screenshots (idle from four sides, each new move mid-attack, Phase II).
# SHOT=0 skips pictures; PART=moves,dodge,ai,shots limits the parts.  Writes out/v112_hydra_*.png
import play,json,os
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
SH=os.environ.get('SHOT','1')!='0';PART=os.environ.get('PART','moves,dodge,ai,shots').split(',');OUT=play.TMP
NEW=['rush','geyser','maelstrom']
def s(pg):
    pg.set_default_timeout(900000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    pg.on('console',lambda m:errs.append('console:'+m.text[:300]) if m.type=='error' else None)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[1].ins[3])}");pg.wait_for_timeout(1500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;if(window.GOD)hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
      window.HITS=[];const hb=bossHit;bossHit=function(e,k){HITS.push([+(+k).toFixed(2),+(hero.iv||0).toFixed(2)]);return hb.apply(this,arguments)};window.GOD=1;
      window.SHOTCAM=(e,side,dist,h,ly)=>{const p=e.m.position,a=e.m.rotation.y+side;cam.position.set(p.x+Math.sin(a)*dist,GH(p.x,p.z)+h,p.z+Math.cos(a)*dist);cam.lookAt(p.x,GH(p.x,p.z)+(ly==null?h*.45:ly),p.z);POST.render()};
      window.PICK0=svPick;svPick=()=>null;window.__down=down;down=function(){hero.hp=heroMax()};
      const st=document.createElement('style');st.textContent='.stage>*:not(#gl){visibility:hidden!important}';document.head.appendChild(st);return 1}""")
    info=ev("""()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[1];window.XA=A;
      const P=PMAP[1].ins[3].en,a=Math.atan2(P[1]-A.cz,P[0]-A.cx);window.EA=a;toPos(A.cx+Math.cos(a)*10,A.cz+Math.sin(a)*10);STEP(.3);
      const e=bossEnt(1);window.BE=e;STEP(.5);const S=e.sv;let n=0,tri=0;S.R.root.traverse(o=>{if(o.isMesh){n++;const g=o.geometry;tri+=(g.index?g.index.count:g.attributes.position.count)/3}});
      return {sv:!!S,on:S.on,mv:S.mv&&S.mv.id,moves:Object.keys(S.B.M),joints:Object.keys(S.R.J).length,merge:S.R.mergeN,meshes:n,tris:Math.round(tri),mats:S.R.mats.length+S.R.glow.length}}""")
    print('boss',json.dumps(info))
    ev("()=>{STEP(3.2);return 1}")
    # cast one move with the hero at distance d in front (or behind); returns hits; opt: hero dodge script
    CAST="""([k,d,back,dodge,ph])=>{const e=BE,S=e.sv,A=XA,D=S.B.M[k];svEndMove(e,true);S.mv=null;S.stg=0;S.inv=0;S.cd={};
      if(ph===2&&S.ph<2){S.ph=2;e.bs.ph=2}if(ph===1){S.ph=1;e.bs.ph=1}
      e.m.position.set(A.cx,0,A.cz);e.m.rotation.y=Math.atan2(Math.cos(EA),Math.sin(EA));const a=e.m.rotation.y+(back?Math.PI:0);
      KQ.fx.slice().forEach(o=>{try{o.end&&o.end()}catch(_){}});KQ.fx.length=0;toPos(A.cx+Math.sin(a)*d,A.cz+Math.cos(a)*d);hero.iv=0;HITS.length=0;STEP(.05);svStart(e,k,7);let t=0;const N0=KQ.fx.length;
      while(S.mv&&S.mv.id===k&&t<D.dur+.2){if(dodge){for(const [tt,dx,dz] of dodge)if(t<tt&&t+.1>=tt){const r=e.m.rotation.y,x=pl.position.x+Math.cos(r)*dx+Math.sin(r)*dz,z=pl.position.z-Math.sin(r)*dx+Math.cos(r)*dz;toPos(x,z)}}STEP(.1);t+=.1}
      STEP(1.6);return {k,hits:HITS.slice(),ph:S.ph,end:!S.mv,warns:DTL.live.length,fx:KQ.fx.length,yaw:+e.m.rotation.y.toFixed(2)}}"""
    bad=[]
    if 'moves' in PART:
        mv=ev("()=>Object.keys(SVB[1].M)")
        for k in mv:
            if k in ('stagger','awaken','intro'):continue
            D=ev("(k)=>{const D=SVB[1].M[k];return {r:D.r||[0,8],a:D.a||'f',ph:D.ph||1}}",k)
            d=max(D['r'][0]+1.5,min(D['r'][1]-.5,9 if k=='rush' else 6))
            r=ev(CAST,[k,d,D['a'] in ('b','sb'),None,D['ph']])
            print('move',k,'d=%.1f'%d,json.dumps(r))
            if not r['hits'] and k not in ('breath',):bad.append(('nohit',k))
        for k in ['stagger','awaken']:
            r=ev(CAST,[k,6,False,None,1]);print('move',k,json.dumps(r))
    if 'dodge' in PART:
        # rush: hero at 12 in front steps 6 to the side once the lane shows -> no hit; stays -> hit
        r1=ev(CAST,['rush',12,False,None,1]);r2=ev(CAST,['rush',12,False,[[1.0,6.5,0]],1]);r3=ev(CAST,['rush',21.5,False,None,1])
        print('dodge rush stay',r1['hits'],'side-step',r2['hits'],'far(21.5)',r3['hits'])
        if not r1['hits'] or r2['hits']:bad.append('rush dodge')
        # undertow: standing still is hit three times; moving 5 after every launch is never hit
        g1=ev(CAST,['geyser',8,False,None,1]);g2=ev(CAST,['geyser',8,False,[[1.4,5,0],[1.8,-5,2],[2.25,-5,-2],[2.6,4,-4]],1])
        print('dodge geyser stay',g1['hits'],'moving',g2['hits'])
        if len(g1['hits'])<3 or g2['hits']:bad.append('geyser dodge')
        # maelstrom: inside the ring is hit, outside it is not
        m1=ev(CAST,['maelstrom',6.5,False,None,2]);m2=ev(CAST,['maelstrom',12.5,False,None,2])
        print('dodge maelstrom inside',m1['hits'],'outside',m2['hits'],'yaw after',m1['yaw'])
        if not m1['hits'] or m2['hits']:bad.append('maelstrom dodge')
    if 'ai' in PART:
        # the picker by range / side / phase (cooldowns cleared each time)
        h=ev("""()=>{const e=BE,S=e.sv,A=XA;svEndMove(e,true);S.mv=null;const out={};
          for(const ph of [1,2])for(const [d,back] of [[4,0],[6,0],[10,0],[16,0],[6,1]]){S.ph=ph;e.bs.ph=ph;const c={};for(let i=0;i<400;i++){S.cd={};S.last=[];
            e.m.position.set(A.cx,0,A.cz);const a=e.m.rotation.y+(back?Math.PI:0);pl.position.x=A.cx+Math.sin(a)*d;pl.position.z=A.cz+Math.cos(a)*d;const id=PICK0(e);c[id]=(c[id]||0)+1}
            out['ph'+ph+(back?' behind ':' front ')+d]=c}return out}""")
        for k,v in h.items():print('pick',k,json.dumps(v))
        seen=set()
        for v in h.values():seen.update(v.keys())
        for k in NEW:
            if k not in seen:bad.append(('never picked',k))
        # a short real fight (the AI picks, cooldowns tick), Phase II halfway
        f=ev("""()=>{svPick=PICK0;const e=BE,S=e.sv,A=XA;svEndMove(e,true);S.mv=null;S.cd={};S.ph=1;e.bs.ph=1;e.c.h=M(e.c);SVX.log.length=0;let t=0;const seen={};let last='';
          while(t<70){const k=t*.3,rad=t%20<6?5:t%20<13?10:16;let x=A.cx+Math.cos(k)*rad,z=A.cz+Math.sin(k)*rad;pl.position.x+=(x-pl.position.x)*.1;pl.position.z+=(z-pl.position.z)*.1;
            if(t>30&&S.ph===1)e.c.h=M(e.c)*.5;STEP(.1);t+=.1;if(S.mv&&S.mv.id!==last){last=S.mv.id;seen[last]=(seen[last]||0)+1}if(!S.mv)last=''}
          svPick=()=>null;svEndMove(e,true);S.mv=null;return {seen,ph:S.ph,cds:Object.keys(S.B.M).filter(k=>S.B.M[k].wt&&!S.B.M[k].cd)}}""")
        print('fight',json.dumps(f))
        if f['cds']:bad.append(('no cd',f['cds']))
    if 'shots' in PART and SH:
        def shot(name,side,dist,hh,ly=None):
            ev("([s,d,h,ly])=>{SHOTCAM(BE,s,d,h,ly);return 1}",[side,dist,hh,ly]);pg.locator('#gl canvas').screenshot(path=f'{OUT}/v112_hydra_{name}.png',timeout=300000,animations='disabled')
        POSE="""([k,tt,ph])=>{const e=BE,S=e.sv,A=XA;svEndMove(e,true);S.mv=null;S.cd={};KQ.fx.slice().forEach(o=>{try{o.end&&o.end()}catch(_){}});KQ.fx.length=0;if(ph){S.ph=ph;e.bs.ph=ph}
          e.m.position.set(A.cx,0,A.cz);e.m.rotation.y=Math.atan2(Math.cos(EA),Math.sin(EA));const a=e.m.rotation.y;toPos(A.cx+Math.sin(a)*9,A.cz+Math.cos(a)*9);hero.iv=0;STEP(.05);
          if(k){svStart(e,k,7);STEP(tt)}else STEP(tt||1);return 1}"""
        ev(POSE,['',2,1]);shot('idle_front',0.25,15,6.5,4);shot('idle_side',1.57,15,6.5,4);shot('idle_back',3.0,15,7,4);shot('idle_high',0.8,12,10,3.5)
        shot('head_close',0.35,6.5,7.2,6.6)
        for k,ts in [('rush',[0.9,1.35,1.6]),('geyser',[0.9,1.7,2.2]),('maelstrom',[1.2,2.2,3.0]),('bite',[0.72,0.92]),('sweep',[0.92,1.2]),('tail',[0.85,1.1])]:
            for j,tt in enumerate(ts):
                ev(POSE,[k,tt,2 if k=='maelstrom' else 1]);shot(f'{k}_{j}',0.9 if k!='tail' else 2.4,17,8,3.5)
        ev(POSE,["",2,2]);shot('ph2_front',0.4,15,6.5,4);shot('ph2_side',1.9,14,6,4)
    print('errs',errs[:8],ev("()=>window.LERR||0"),ev("()=>SVX.st"),'bad',bad)
play.run(s,w=800,hh=512)
