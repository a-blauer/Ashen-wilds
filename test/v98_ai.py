# v98 perf_ai: enemy update level of detail (src/modules/zzN_perf_ai.js, build/pN_perf_ai.py).
# Checks: near calm enemies update every frame, farther drawn ones every AIL.n2/n3-th frame with the skipped dt handed on
# (same game time per second), off-screen ones skip their pose, hidden ones sleep (no matrix updates), a throttled enemy
# still aggroes promptly when the hero walks up to it, and prints the enemy-loop / matrix ms per frame with AIL off vs on
# (~60 enemies around the hero, ren.render stubbed). Env: N=extra enemies (30), TM=ms per measuring window (2500).
import play,json,os,sys
h=open(play.TMP+'/live.html').read()
a="  enemies.slice().forEach(e=>{\n    const m=e.m;";assert h.count(a)==1
h=h.replace(a,"  const __t0=performance.now();\n"+a)
b="  eshotTick(dt);tgtTick(now,dt);\n";assert h.count(b)==1
h=h.replace(b,"  window.__ens=(window.__ens||0)+performance.now()-__t0;"+b)
open(play.TMP+'/live.html','w').write(h)
N=int(os.environ.get('N','30'));TM=int(os.environ.get('TM','2500'))
FAIL=[]
def ok(c,msg):
    print(('PASS ' if c else 'FAIL ')+msg)
    if not c:FAIL.append(msg)
def s(pg):
    pg.set_default_timeout(600000);ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ok(ev("()=>typeof AIL=='object'&&typeof aiLod=='function'&&AIL.on"),'AIL present and on')
    ev("""()=>{ren.render=()=>{};POST.render=()=>{};window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16);
      window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=5},40);
      const C=CAMPS.filter(c=>c.pm===0);const c=C[Math.floor(C.length/2)];toPos(c.x+16,c.z);pl.step=null;rosterTick();
      // per-enemy counters: eTick calls and the dt they got; animC calls per model
      window.__cnt=new Map();window.__an=new Map();
      const f=eTick;eTick=function(e,dt,now){const q=__cnt.get(e)||{n:0,dt:0};q.n++;q.dt+=dt;__cnt.set(e,q);return f.apply(this,arguments)};
      const g=animC;animC=function(m){__an.set(m,(__an.get(m)||0)+1);return g.apply(this,arguments)};
      // a flat open spot: test enemies are placed on rings around the hero
      window.__mk=(dx,dz)=>{const p=PMAP[0],x=pl.position.x+dx,z=pl.position.z+dz;const e=spawnEnemy(BIOEN[p.n][0],x,z,3,{zt:p.t});e.wild=1;e.camp=null;e.hx=e.wx=x;e.hz=e.wz=z;e.agg=0;return e};
      return 1}""")
    pg.wait_for_timeout(1500)
    # --- 1. rates: calm enemies at 10 tiles (front), 27 tiles (front, drawn), 27 tiles behind the camera ---
    r=ev("""()=>{camYaw=0;snapCam();const fx=-Math.sin(camYaw),fz=-Math.cos(camYaw); // camera looks along -(sin,cos)
      // keep everything else calm and out of the way
      const A=[__mk(fx*10,fz*10),__mk(fx*27,fz*27),__mk(-fx*27+3,-fz*27)];window.__T=A;
      A.forEach(e=>{e.agg=0;e.cd=99});__cnt.clear();__an.clear();window.__f0=AIL.f;window.__a0=AIL.st.anim0;window.__naF=0;window.__naT=setInterval(()=>{if(!__T[2].m._aiNA)__naF++},16);window.__t0=PACE.clk;return A.map(e=>Math.round(e.m.position.distanceTo(pl.position)))}""")
    print('test enemies at',r)
    pg.wait_for_timeout(4000)
    r=ev("""()=>{const F=AIL.f-__f0,T=PACE.clk-__t0;clearInterval(__naT);return {F,T:+T.toFixed(2),na:__naF,a0:AIL.st.anim0-__a0,e:__T.map(e=>{const q=__cnt.get(e)||{n:0,dt:0};return {n:q.n,dt:+q.dt.toFixed(2),an:__an.get(e.m)||0,agg:e.agg,vis:e.m.visible,inV:aiInView(e.m),d:+e.m.position.distanceTo(pl.position).toFixed(1)}})}}""")
    print('rates',json.dumps(r))
    F=r['F'];n0,n1,n2=[x['n'] for x in r['e']]
    ok(all(x['agg']==0 for x in r['e']),'test enemies stayed calm')
    ok(n0>=F*.95,'near (10 tiles) updates every frame: %d/%d'%(n0,F))
    ok(F/AIL_n(ev,'n2')*.8<=n1<=F*.7,'drawn 27-tile enemy throttled: %d/%d'%(n1,F))
    ok(n2<=F*.5,'27 tiles behind the camera throttled more: %d/%d'%(n2,F))
    T=r['T']
    ok(all(abs(x['dt']-T)<max(.25,T*.08) for x in r['e']),'every test enemy got the same game time (dt sums %s vs %.2f)'%([x['dt'] for x in r['e']],T))
    ok(r['na']==0 and r['a0']>=n2 and not r['e'][2]['inV'],'enemy behind the camera skips its pose (flag never off, %d skipped poses)'%r['a0'])
    ok(r['e'][0]['an']>=n0*.9,'near enemy in view animates every update (%d)'%r['e'][0]['an'])
    # --- 2. sleeping: a hidden enemy (40 tiles) is skipped by updateMatrixWorld, wakes when the hero comes near ---
    r=ev("""()=>{const e=__mk(40,0);window.__S=e;return 1}""");pg.wait_for_timeout(600)
    r=ev("""()=>{const e=__S,m=e.m;const before=AIL.st.sleepN;m.position.x+=.5;scene.updateMatrixWorld();const stale=Math.abs(m.matrixWorld.elements[12]-m.position.x)>.4;
      const wp=new THREE.Vector3();m.getWorldPosition(wp);return {vis:m.visible,sleep:m._aiS,stale,wpOk:Math.abs(wp.x-m.position.x)<1e-3,cnt:AIL.st.sleepN-before}}""")
    print('sleep',r)
    ok(r['vis']==False and r['sleep']==1 and r['stale'],'hidden enemy sleeps (no matrix update; skipped by perf_static or perf_ai: %d)'%r['cnt'])
    ok(r['wpOk'],'getWorldPosition still exact on a sleeping enemy')
    ev("()=>{const m=__S.m;m.position.x=pl.position.x+8;m.position.z=pl.position.z;__S.hx=__S.wx=m.position.x;__S.hz=__S.wz=m.position.z}");pg.wait_for_timeout(800)
    r=ev("()=>{scene.updateMatrixWorld();const m=__S.m;return {vis:m.visible,sleep:m._aiS,dx:Math.abs(m.matrixWorld.elements[12]-m.position.x)}}")
    print('wake',r);ok(r['vis'] and r['sleep']==0 and r['dx']<1e-3,'woken enemy matrices are current')
    ev("()=>{removeE(__S)}")
    # --- 3. aggro: a throttled 27-tile enemy; the hero walks up to it at run speed and it must react at the usual range ---
    res=[]
    for k in range(3):
        r=ev("""(k)=>{const e=__T[1];if(!window.__P0){__P0=pl.position.clone();
            // a straight, open line (no solid tiles, no water) from the hero out to 27 tiles; camera looks along it
            let best=null;for(let a=0;a<6.283&&!best;a+=.13){let okk=true;for(let s=0;s<=29&&okk;s+=.25){const x=__P0.x+Math.sin(a)*s,z=__P0.z+Math.cos(a)*s;if(plBlocked(x,z)||!seeTg(__P0,V(x,0,z)))okk=false}if(okk)best=a}
            if(best==null)best=0;camYaw=best+Math.PI;__E0=V(__P0.x+Math.sin(best)*27,0,__P0.z+Math.cos(best)*27);__E0.y=GH(__E0.x,__E0.z)}pl.position.copy(__P0);e.m.position.copy(__E0);e.hx=e.wx=__E0.x;e.hz=e.wz=__E0.z;e._aiPh=k;e._aiAcc=0;e.agg=0;e.cd=0;const P=pl.position.clone();const dx=e.m.position.x-P.x,dz=e.m.position.z-P.z,L=Math.hypot(dx,dz);
          if(!window.__wkH){__wkH=1;const f=homeTick;homeTick=function(dt){if(window.__walk)__walk(dt);return f.apply(this,arguments)}}
          // the hero runs at 6 tiles/s straight at it (inside the game loop, before the enemy update)
          window.__ag={d:null,f:null};window.__walk=(dt)=>{if(__ag.d!=null)return;const ex=e.m.position.x-pl.position.x,ez=e.m.position.z-pl.position.z,l=Math.hypot(ex,ez);
            if(e.agg){__ag.d=l;__ag.f=AIL.f;return}if(l>2.2){pl.position.x+=ex/l*6*dt;pl.position.z+=ez/l*6*dt}};
          window.__agF0=AIL.f;return +L.toFixed(1)}""",k)
        pg.wait_for_timeout(7000)
        a=ev("()=>{__walk=null;const e=__T[1];const r={d:__ag.d,agg:e.agg,fin:+e.m.position.distanceTo(pl.position).toFixed(2),see:seeTg(e.m.position,pl.position),atk:!!e.atk,mv:+e.m.position.distanceTo(__E0).toFixed(2),hero:+pl.position.distanceTo(__P0).toFixed(2),F:AIL.f-__agF0,ph:e._aiPh,needR:e.c.al?6:4.5};e.agg=0;mCancel(e);e.cd=99;return r}")
        res.append(a);pg.wait_for_timeout(300)
    print('aggro',res)
    ok(all(a['d'] is not None and a['d']>=a['needR']-.6 for a in res),'approached enemy aggroes at its usual range (got %s)'%[a['d'] and round(a['d'],2) for a in res])
    # --- 4. timing: ~60 enemies, AIL off vs on, interleaved ---
    ev("""(n)=>{__T.forEach(e=>removeE(e));const p=PMAP[0];let k=0;for(let i=0;i<n*6&&k<n;i++){const a=Math.random()*6.28,r=6+Math.random()*70;const x=Math.round(pl.position.x+Math.cos(a)*r),z=Math.round(pl.position.z+Math.sin(a)*r);if(solid(x,z))continue;const e=spawnEnemy(BIOEN[p.n][0],x,z,5,{zt:p.t});if(e){e.wild=1;e.camp=null;e.hx=e.wx=x;e.hz=e.wz=z;k++}}
      const U=scene.updateMatrixWorld;scene.updateMatrixWorld=function(f){const a=performance.now();U.call(this,f);window.__umw+=performance.now()-a};
      POST.render=function(){scene.updateMatrixWorld();cam.updateMatrixWorld()};return enemies.length}""",N)
    pg.wait_for_timeout(1500)
    acc={'off':[],'on':[]}
    for mode in ['off','on']*4:
        ev("(on)=>{AIL.on=on}",mode=='on');pg.wait_for_timeout(400)
        ev("()=>{window.__ens=0;window.__umw=0;window.__f1=AIL.f}")
        pg.wait_for_timeout(TM)
        acc[mode].append(ev("()=>{const F=AIL.f-__f1;return [__ens/F,__umw/F,F]}"))
    st=ev("""()=>{const P=pl.position;let b=[0,0,0,0],vis=0;enemies.forEach(e=>{if(e.dead)return;const d=e.m.position.distanceTo(P);b[d<25?0:d<50?1:d<85?2:3]++;if(e.m.visible)vis++});return {n:enemies.length,bands:b,vis}}""")
    avg=lambda L,i:sum(x[i] for x in L)/len(L)
    print('ENEMIES',json.dumps(st))
    for m in ('off','on'):print('MS %-3s enemy-loop %.3f ms/frame  scene.updateMatrixWorld %.3f ms/frame  (windows: %s)'%(m,avg(acc[m],0),avg(acc[m],1),[round(x[0],3) for x in acc[m]]))
    med=lambda L:sorted(x[0] for x in L)[len(L)//2]
    print('MEDIAN enemy-loop off %.3f on %.3f ms/frame (timing is informational: shared CPU)'%(med(acc['off']),med(acc['on'])))
    ev("()=>{AIL.on=true}")
    print('RESULT','FAIL '+'; '.join(FAIL) if FAIL else 'ALL PASS')
def AIL_n(ev,k):return ev("(k)=>AIL[k]",k)
play.run(s)
