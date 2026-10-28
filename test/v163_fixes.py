# v163 owner's list: attribute Reset at the bottom, desktop quest trackers placed once (no jumping, no overlap), one title card
# at a time, melee attacks aim where the camera looks when they land (a locked target wins), Sovereign signatures less often,
# Argus' Hundred Eyes: eyes ~10 m from the centre and twice as long to shut them. Prints FAIL lines.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
def s(pg):
    pg.set_default_timeout(1500000);ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    # ---- 1. Reset at the bottom of the attributes
    r=ev("""()=>{const k=ATR139.K[0];hero.tal['__at:'+k]=3;try{openTal()}catch(_){try{rTal()}catch(_){}}ch139Render();
      const at=$('ch139At'),rs=$('ch163Rs'),bar=$('ch139Bar');return {bar:!!(bar&&bar.querySelector('[data-at139x=reset]')),rs:!!(rs&&rs.querySelector('[data-at139x=reset]')),
        after:!!(rs&&at&&(at.compareDocumentPosition(rs)&Node.DOCUMENT_POSITION_FOLLOWING)),spent:atr139Spent()}}""")
    print('reset',json.dumps(r))
    if r['bar']:F('Reset still in the bar above the attributes')
    if not (r['rs'] and r['after']):F('Reset button not under the attributes: %s'%r)
    ev("()=>{$('tal').classList.add('hide')}")
    # ---- 2. desktop quest trackers: placed once, stacked, steady while their text changes
    r=ev("""async()=>{try{const qs=[].concat(...chq148Zones().map(q=>CHQD148[q]||[])).slice(0,3);qs.forEach(q=>{CHQ132.st[q.id]={s:1,p:q.o.map(()=>0),cj:[]}})}catch(_){}
      mq143Here=()=>true;CHQ132.trkK='';try{chqTrk132()}catch(_){}try{mq143Trk()}catch(_){}
      await new Promise(r=>setTimeout(r,1500));const vis=UI161_TRK.filter(id=>{const e=$(id);return e&&ui161Vis(e)});const S={};
      for(let i=0;i<30;i++){if(i%3==0){CHQ132.trkK='';try{chqTrk132()}catch(_){}try{mq143Trk()}catch(_){}}
        const k=vis.map(id=>{const q=$(id).getBoundingClientRect();return id+':'+Math.round(q.top)+','+Math.round(q.bottom)+','+Math.round(q.right)}).join(' ');S[k]=(S[k]||0)+1;await new Promise(r=>setTimeout(r,100))}
      const R=vis.map(id=>$(id).getBoundingClientRect()),mr=$('mini').getBoundingClientRect();let ov=0;for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){if(Math.min(R[i].bottom,R[j].bottom)-Math.max(R[i].top,R[j].top)>2)ov++}
      return {vis,states:Object.keys(S),ov,below:R.every(q=>q.top>=mr.bottom-1),onscreen:R.every(q=>q.bottom<=innerHeight+1&&q.right<=innerWidth+1)}}""")
    print('trackers',json.dumps(r))
    if len(r['vis'])<2:F('test setup: expected two trackers, got %s'%r['vis'])
    if len(r['states'])!=1:F('trackers moved while their text changed: %s'%r['states'])
    if r['ov']:F('trackers overlap')
    if not r['below'] or not r['onscreen']:F('trackers not under the minimap / off screen: %s'%r)
    # ---- 3. one title card at a time
    r=ev("""async()=>{const n0=$('banner').children.length;zt116Ins(INSL[1]);banner('Welcome back, Test','Lv 1','');const n1=$('banner').children.length;
      await new Promise(r=>setTimeout(r,5600));const n2=$('banner').children.length;return {n0,n1,n2,zt:/\\bon\\b/.test($('ztc116').className)}}""")
    print('cards',json.dumps(r))
    if r['n1']!=r['n0']:F('Welcome back shown on top of the zone card')
    if r['n2']<=r['n0']:F('Welcome back never shown after the zone card')
    # ---- stepped time from here on
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
      window.__down=down;down=function(){hero.hp=heroMax()};return 1}""")
    # ---- 4. melee aims when it lands
    r=ev("""()=>{const out={wt:curWT()};{const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0],q[1]);STEP(.5)}enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const LOG=[];{const f=area;area=function(p,r,dm,s,dir,half){if(s&&s.basic)LOG.push(dir?[+dir.x.toFixed(2),+dir.z.toFixed(2)]:null);return f.apply(this,arguments)}}
      const run=(o)=>{LOG.length=0;atkCd=0;combo=0;STEP(1.2);setTarget(o.tg||null);orb=!!o.orb;document.body.classList.toggle('mob',!!o.mob);camYaw=0;pl.rotation.y=Math.PI;swing();
        let n=0;STEP(.03);camYaw=-Math.PI/2;while(!LOG.length&&n<80){STEP(.03);n++}const fy=pl.rotation.y;orb=false;document.body.classList.remove("mob");setTarget(null);return {dir:LOG[0]||null,face:[+Math.sin(fy).toFixed(2),+Math.cos(fy).toFixed(2)]}};
      out.orb=run({orb:1});out.mob=run({mob:1});
      const e=spawnEnemy(BIOEN[PMAP[1].n][0],pl.position.x,pl.position.z-3,5,{});e.c.h=e.c.st.hp=1e7;e.stun=99;out.lock=run({orb:1,tg:e});removeE(e);
      out.mouse=run({});return out}""")
    print('aim',json.dumps(r))
    near=lambda a,b:a and abs(a[0]-b[0])<.15 and abs(a[1]-b[1])<.15
    if not near(r['orb']['dir'],[1,0]):F('mouse-look: swing did not follow the camera turned mid-swing: %s'%r['orb'])
    if not near(r['mob']['dir'],[1,0]):F('phone: swing did not follow the camera turned mid-swing: %s'%r['mob'])
    if not near(r['lock']['dir'],[0,-1]):F('locked target: swing left the target: %s'%r['lock'])
    if not near(r['orb']['face'],[1,0]):F('hero not turned to the hit direction: %s'%r['orb'])
    # ---- 5. Sovereign signatures: less often; Argus' eyes close in and twice the time
    r=ev("""()=>{const out={};out.sig=[];SVB.forEach((B,i)=>{if(!B||!B.M)return;['hundred','covenant','heart','sever','scars','feast'].forEach(id=>{const D=B.M[id];if(D)out.sig.push([i,id,D.cd,D.wt({sv:{heN:1,cvN:1,hrN:1,seN:1,scN:1,fsN:1}},5),D.wt({sv:{}},5)])})});
      try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[0].ins[3]);return out}""")
    pg.wait_for_timeout(800)
    print('sig',json.dumps(r))
    for i,id,cd,w2,w1 in r['sig']:
        if cd!=60:F('%s cooldown %s (want 60)'%(id,cd))
        if w2>4 or w1<30:F('%s weights first %s / again %s'%(id,w1,w2))
    if len(r['sig'])<6:F('signature moves found: %d'%len(r['sig']))
    r=ev("""()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[0];toPos(A.cx+9,A.cz);STEP(.3);const e=bossEnt(0);STEP(.4);const S=e.sv;window.__pick=svPick;svPick=()=>null;
      svEndMove(e,true);S.mv=null;S.cd={};S.ph=2;e.bs.ph=2;e.c.h=Math.round(M(e.c)*.5);e.m.position.set(A.cx,0,A.cz);window.LERR='';
      svStart(e,'hundred');let t=0,t0=null,t1=null,ds=[];
      while(S.mv&&S.mv.id==='hundred'&&t<40){STEP(.1);t+=.1;const P=S.mv&&S.mv.an&&S.mv.an.props;if(P&&t0==null){t0=t;ds=P.map(p=>Math.hypot(p.m.position.x-A.cx,p.m.position.z-A.cz))}if(t0!=null&&t1==null&&S.mv&&S.mv.an&&S.mv.an.done2)t1=t}
      return {t0,t1,ds:ds.map(d=>+d.toFixed(1)),err:window.LERR||''}}""")
    print('argus',json.dumps(r))
    if r['err']:F('Argus error %s'%r['err'])
    if not r['ds'] or any(abs(d-10)>1 for d in r['ds']):F('Watcher Eyes not ~10 m from the centre: %s'%r['ds'])
    if r['t0'] is None or r['t1'] is None or not (17<r['t1']-r['t0']<21):F('time to shut the eyes %s s (want ~19)'%(None if r['t1'] is None or r['t0'] is None else round(r['t1']-r['t0'],1)))
    for e in errs:F('page error '+e)
    print('v163 fixes: checked' if not fails else 'CHECKS FAILED')
play.run(s,w=1280,hh=760)
