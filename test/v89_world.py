# v89 world: bigger zones, more mobs, themed decorations.
#   python3 v89_world.py                      checks + perf of dist/ashen-wilds.html
#   SRC=old.html NOCHK=1 python3 v89_world.py perf numbers only (for a before/after comparison)
# Prints zone sizes, walkable tiles, roster sizes per zone, terrain triangles, instance counts, draw calls and frame times.
import play,json,os
from playwright.sync_api import Page
# the world takes a while to build on a busy machine: allow a slower first load than play.py's 2 minutes
_goto=Page.goto
def _slow_goto(self,url,**k):
    k['timeout']=max(k.get('timeout') or 0,600000);return _goto(self,url,**k)
Page.goto=_slow_goto
CHK=not os.environ.get('NOCHK')
SHOTS=os.environ.get('SHOTS')
def PERF(ev,P):
    if os.environ.get('NOPERF'):return
    # ---- frame time: stop the RAF loop and drive loop() by hand at a few spots per zone ----
    ev("()=>{window.requestAnimationFrame=()=>0}")
    perf=[]
    for i in range(6):
        for f in (0.2,0.7):
            r=ev("""([i,f])=>{const p=PMAP[i],q=p.path[Math.floor(p.path.length*f)];CHEAT.god=true;enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});ROST.r=-9;
              toPos(q[0],q[1]);rosterTick();let t=performance.now()+1e5;
              for(let k=0;k<4;k++){t+=16;loop(t)} // warm up (streaming, shader compile)
              const ts=[],rs=[];let calls=0,tris=0;for(let k=0;k<3;k++){t+=16;const a=performance.now();loop(t);ts.push(performance.now()-a);calls=ren.info.render.calls;tris=ren.info.render.triangles;
                const b=performance.now();POST.render();rs.push(performance.now()-b)}
              ts.sort((a,b)=>a-b);rs.sort((a,b)=>a-b);return {z:i,f,ms:+ts[1].toFixed(1),render:+rs[1].toFixed(1),calls,tris,mobs:enemies.filter(e=>!e.dead).length}}""",[i,f])
            perf.append(r);print('perf',json.dumps(r))
    avg=sum(r['ms'] for r in perf)/len(perf);print('PERF avg frame ms %.1f  render ms %.1f  avg calls %d  avg tris %d'%(avg,sum(r['render'] for r in perf)/len(perf),sum(r['calls'] for r in perf)/len(perf),sum(r['tris'] for r in perf)/len(perf)))
    P('heap',"()=>performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null")
def s(pg):
    pg.set_default_timeout(600000)
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c,a=None:(lambda v:(print(n,'=>',json.dumps(v)[:1500]),v)[1])(ev(c,a) if a is not None else ev(c))
    fails=[]
    def ok(c,msg):
        if not c:fails.append(msg);print('FAIL',msg)
    # ---- static numbers ----
    st=P('world',"""()=>{const out={W,H,PMW,PMH,zones:[]};
      PMAP.forEach((p,i)=>{let walk=0;for(let y=p.y0;y<p.y0+PMH;y++)for(let x=p.x0;x<p.x0+PMW;x++)if(MAP.DW[y*W+x]<0)walk++;
        rosterBuild(i);const S=ROST.slots;out.zones.push({n:p.n,walk,path:p.path.length,camps:p.cl.length,fields:p.fd.length,mobs:S.length,campMobs:S.filter(s=>s.camp).length,
          lv0:zoneLv(p.en[0],p.en[1]),lvBoss:zoneLv(p.ba[0],p.ba[1])})});
      ROST.r=-9;ROST.slots=[];
      let tt=0,tc=0;scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.map===gt){tc++;tt+=o.geometry.index?o.geometry.index.count/3:o.geometry.attributes.position.count/3}});
      out.terrainTris=tt;out.terrainChunks=tc;out.chunks=CHL.length;out.inst=VIL.reduce((a,v)=>a+v.n,0);out.vil=VIL.length;
      out.deco=typeof WD!='undefined'?WD.stats:null;out.cblk=CBLK.size;
      out.heapMB=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null;out.geos=ren.info.memory.geometries;out.tex=ren.info.memory.textures;return out}""")
    if not CHK:PERF(ev,P);return
    # ---- checks ----
    ok(st['PMW']>=338 and st['PMH']>=351,'zones are 30% bigger')
    # roster sizes measured on the v88 layout (260x270 zones, 3 camps, 45 roaming groups)
    BASE=[58,75,72,81,86,75];BASEW=[15320,16865,17711,19619,17734,16273]
    for z,b,bw in zip(st['zones'],BASE,BASEW):
        print('  %-18s walkable %5d -> %5d (x%.2f)   mobs %3d -> %3d (x%.2f)'%(z['n'],bw,z['walk'],z['walk']/bw,b,z['mobs'],z['mobs']/b))
        ok(z['mobs']>=1.45*b,'%s has ~1.7x mobs (%d vs %d)'%(z['n'],z['mobs'],b))
        ok(z['walk']>=1.5*bw,'%s walkable area grew (%d vs %d)'%(z['n'],z['walk'],bw))
        ok(z['camps']>=5,'%s has 5 camps'%z['n'])
    lv=P('levels',"()=>PMAP.map(p=>[zoneLv(p.en[0],p.en[1]),p.lv[0],zoneLv(p.ba[0],p.ba[1]),p.lv[1]])")
    for a,b,c,d in lv:ok(abs(a-b)<=1 and c==d,'road level goes entrance %d->boss %d (%d..%d)'%(b,d,a,c))
    # nothing placed on the road, in the den circle, the wave arena or at the portals
    bad=P('deco clear',"""()=>{if(typeof WD=='undefined')return 'no WD';const out=[];
      WD.list.forEach(d=>{const r=regionAt(Math.round(d.x),Math.round(d.z));if(r<0)return;const p=PMAP[r];
        if(Math.hypot(d.x-p.ba[0],d.z-p.ba[1])<26)out.push(['den',d.k,d.x,d.z]);
        if(Math.hypot(d.x-p.wa[0],d.z-p.wa[1])<18)out.push(['wave',d.k,d.x,d.z]);
        if(Math.hypot(d.x-p.en[0],d.z-p.en[1])<10)out.push(['entrance',d.k,d.x,d.z]);
        if(d.col&&p.path.some((q,i)=>i%2==0&&Math.hypot(q[0]-d.x,q[1]-d.z)<5+d.col))out.push(['road',d.k,d.x,d.z]);
        if(!d.col&&MAP.DW[Math.round(d.z)*W+Math.round(d.x)]<0&&p.path.some((q,i)=>i%2==0&&Math.hypot(q[0]-d.x,q[1]-d.z)<2.5))out.push(['road-small',d.k,d.x,d.z]);
        if(CAMPS.some(C=>C.pm===r&&Math.hypot(C.x-d.x,C.z-d.z)<CAMP_R+2))out.push(['camp',d.k,d.x,d.z])});
      const den=PMAP.map(p=>{let n=0;for(let y=-24;y<=24;y++)for(let x=-24;x<=24;x++)if(x*x+y*y<=24*24&&MAP.DW[(p.ba[1]+y)*W+p.ba[0]+x]>=0)n++;return n});
      return {bad:out.slice(0,12),nbad:out.length,denBlocked:den,perZone:WD.stats}}""")
    if bad!='no WD':
        ok(bad['nbad']==0,'no decorations on the road / den / wave arena / entrance / camps')
        ok(all(n==0 for n in bad['denBlocked']),'den radius 24 is open ground')
        for z in bad['perZone']['zones']:ok(z>=600,'zone has many decorations (%d)'%z)
    # walk the road from the entrance to the boss: every road point must be walkable and reachable step by step
    wk=P('walk road',"""()=>PMAP.map((p,i)=>{let blocked=0,first=null;const P=p.path,s=P.findIndex(q=>q===P[16])||16;
       for(let k=16;k<P.length-1;k++){const x=Math.round(P[k][0]),z=Math.round(P[k][1]);if(solid(x,z)||plBlocked(x,z)){blocked++;if(!first)first=[x,z]}}
       // flood fill over walkable tiles from the entrance must reach the boss
       const ex=Math.round(p.en[0]),ez=Math.round(p.en[1]),seen=new Uint8Array(W*H),q=[[ex,ez]];seen[ez*W+ex]=1;let hit=false,n=0;
       while(q.length&&n++<300000){const [x,z]=q.pop();if(Math.hypot(x-p.ba[0],z-p.ba[1])<3){hit=true;break}
         for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Z=z+dz,k=Z*W+X;if(seen[k]||solid(X,Z))continue;seen[k]=1;q.push([X,Z])}}
       return {blocked,first,reach:hit}})""")
    for i,w in enumerate(wk):ok(w['blocked']==0 and w['reach'],'zone %d road walkable entrance->boss %s'%(i,w))
    # the hero actually walks a stretch of the road (movement + collision)
    mv=P('hero walk',"""()=>{const p=PMAP[3],P=p.path;let t=performance.now()+2e5,stuck=0;toPos(P[40][0],P[40][1]);
      for(let k=60;k<P.length-30;k+=20){const a=pl.position.clone(),[tx,tz]=P[k];toPos(a.x,a.z);
        for(let f=0;f<40&&Math.hypot(pl.position.x-tx,pl.position.z-tz)>1.5;f++){const dx=tx-pl.position.x,dz=tz-pl.position.z,L=Math.hypot(dx,dz),sp=Math.min(L,.5);
          const nx=pl.position.x+dx/L*sp,nz=pl.position.z+dz/L*sp;if(plBlocked(nx,nz)){stuck++;break}pl.position.x=nx;pl.position.z=nz}}
      return stuck}""")
    ok(mv==0,'hero can walk the Searing Sands road (%s)'%mv)
    # big decorations block movement, small ones don't
    cb=P('colliders',"""()=>{if(typeof WD=='undefined')return null;const big=WD.list.filter(d=>d.col),u=new Set(),CS=new Set(WDCOL);big.forEach(d=>d.tl.forEach(k=>u.add(k)));
      return {big:big.length,bigSolid:big.filter(d=>d.tl.length&&d.tl.every(k=>solid(k%W,Math.floor(k/W)))).length,small:WD.list.length-big.length,colTiles:WDCOL.length,fromBig:[...u].filter(k=>CS.has(k)).length}}""")
    if cb:ok(cb['big']>0 and cb['bigSolid']==cb['big'],'big decorations are solid %s'%cb);ok(cb['fromBig']==cb['colTiles'],'only big decorations add collider tiles %s'%cb)
    # old saves: an old INST run is dropped and an old-layout zone position goes back to that zone's entrance
    sv=P('old save',"""()=>{saveGame(true);const s=JSON.parse(localStorage.getItem(SAVE_KEY));
      s.pos={x:380+100,z:288+100,realm:false};if(s.x2){delete s.x2.wl;s.x2.inst={r:4,x:480,z:388,quiet:false,slots:[]}}
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));loadGame();const x=pl.position.x,z=pl.position.z,r=regionAt(Math.round(x),Math.round(z));
      return {x,z,r,en:PMAP[4].en,inst:INST,solid:solid(x,z)}}""")
    ok(sv['inst'] is None and sv['r']==4 and abs(sv['x']-sv['en'][0])<2 and not sv['solid'],'old save goes to The Dirge entrance and drops the INST run')
    sv2=P('new save',"""()=>{const p=PMAP[2],q=p.path[200];toPos(q[0],q[1]);INST={r:2,x:q[0],z:q[1],quiet:false,slots:[]};saveGame(true);INST=null;loadGame();
      return {d:Math.hypot(pl.position.x-q[0],pl.position.z-q[1]),inst:!!INST}}""")
    ok(sv2['d']<2 and sv2['inst'],'new saves keep position and INST')
    P('court/town',"()=>({town:solid(TOWNS[0].sp[0],TOWNS[0].sp[1]),court:solid(PCOURT[0],PCOURT[1]+3),cyd:MAP.DW[CYD.y*W+CYD.x]<0})")
    PERF(ev,P)
    if SHOTS:
        ev("()=>{window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}");ev("()=>{let t=performance.now();loop(t)}")
    print('FAILS',len(fails),fails)
play.run(s,w=900,hh=560)
