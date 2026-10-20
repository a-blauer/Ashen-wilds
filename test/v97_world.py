# v97 world: every zone 40% bigger again (473x491), about twice the mobs, decorations and nodes; split ground texture.
#   python3 v97_world.py                         checks + perf of dist/ashen-wilds.html -> out/v97_after.json
#   SRC=old.html TAG=before NOCHK=1 python3 v97_world.py   numbers only (writes out/v97_before.json)
#   REF=out/v97_before.json python3 v97_world.py           also prints the before -> after tables
# Prints zone sizes, walkable tiles, roster sizes per zone, load-time phases, heap, textures, terrain triangles,
# draw calls / triangles at 12 spots, minimap bake, world-map draw, roster build/stream cost, array memory.
import play,json,os,re
from playwright.sync_api import Page
_goto=Page.goto
def _slow_goto(self,url,**k):
    k['timeout']=max(k.get('timeout') or 0,600000);return _goto(self,url,**k)
Page.goto=_slow_goto
CHK=not os.environ.get('NOCHK')
TAG=os.environ.get('TAG','after')
REF=os.environ.get('REF')
# ---- performance marks around the world-building phases (inserted into the test copy only) ----
LIVE=play.TMP+'/live.html'
h=open(LIVE).read()
def mark(anchor,name,after=False):
    global h
    if h.count(anchor)!=1:print('mark anchor missing',name,h.count(anchor));return
    m="performance.mark('kq_%s');"%name
    h=h.replace(anchor,anchor+m if after else m+anchor)
_i=h.rindex('<script>')+8;h=h[:_i]+"performance.mark('kq_s0');"+h[_i:]
mark("\nconst MAP=(()=>{","map0")
mark("  const DW=MAP.DW,sp=x=>","hf0")
mark("// ---- terrain: smooth painted ground","tex0")
mark("const NODE={},ZM=","tex1")
mark("try{wdDeco()}","vi0")
mark("try{wdBuild()}catch(e){console.warn('world deco build',e)}\n","vi1",True)
mark("const mmB=document.createElement('canvas')","mm0")
mark("const mmC=$('mini')","mm1")
mark("\nmmRimPaint();\n","rim0")
mark("\nmmRimPaint();\n","rim1",True)
_j=h.rindex('</script>');h=h[:_j]+"\nperformance.mark('kq_end');\n"+h[_j:]
open(LIVE,'w').write(h)

OUT={}
def s(pg):
    pg.set_default_timeout(600000)
    ev=pg.evaluate
    cdp=pg.context.new_cdp_session(pg)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c,a=None:(lambda v:(print(n,'=>',json.dumps(v)[:1800]),v)[1])(ev(c,a) if a is not None else ev(c))
    fails=[]
    def ok(c,msg):
        if not c:fails.append(msg);print('FAIL',msg)
    # ---- load phases ----
    ph=P('phases',"""()=>{const m={};performance.getEntriesByType('mark').forEach(e=>{if(e.name.startsWith('kq_'))m[e.name.slice(3)]=e.startTime});
      const d=(a,b)=>m[a]!=null&&m[b]!=null?Math.round(m[b]-m[a]):null;
      return {script:d('s0','end'),map:d('map0','hf0'),hf:d('hf0','tex0'),tex:d('tex0','tex1'),inst:d('vi0','vi1'),mini:d('mm0','mm1'),rim:d('rim0','rim1')}}""")
    OUT['phases']=ph
    # ---- heap (after a GC) ----
    try:
        cdp.send('HeapProfiler.collectGarbage');cdp.send('Performance.enable')
        mt={m['name']:m['value'] for m in cdp.send('Performance.getMetrics')['metrics']}
        OUT['heapMB']=round(mt.get('JSHeapUsedSize',0)/1048576,1);print('heap MB',OUT['heapMB'])
    except Exception as e:print('heap err',e)
    # ---- static numbers ----
    st=P('world',"""()=>{const out={W,H,PMW,PMH,zones:[]};
      PMAP.forEach((p,i)=>{let walk=0;for(let y=p.y0;y<p.y0+PMH;y++)for(let x=p.x0;x<p.x0+PMW;x++)if(MAP.DW[y*W+x]<0)walk++;
        const t0=performance.now();rosterBuild(i);const rb=performance.now()-t0;const S=ROST.slots;
        let nodes=0;for(const k in NODE){const x=k%W,y=Math.floor(k/W);if(regionAt(x,y)===i)nodes++}const props=MAP.props.filter(q=>regionAt(q[0],q[1])===i).length;
        out.zones.push({n:p.n,walk,path:p.path.length,camps:p.cl.length,fields:p.fd.length,br:p.br.length,mobs:S.length,campMobs:S.filter(s=>s.camp).length,
          props,groups:new Set(S.filter(s=>!s.camp).map(s=>s.hx+','+s.hz)).size,nodes,deco:WD&&WD.stats?WD.stats.zones[i]:null,rosterMs:+rb.toFixed(1),
          lv0:zoneLv(p.en[0],p.en[1]),lvBoss:zoneLv(p.ba[0],p.ba[1])})});
      ROST.r=-9;ROST.slots=[];
      const isT=o=>o.isMesh&&o.material&&o.material.map&&(o.material.map===gt||(typeof gtT!='undefined'&&o.material.map===gtT));
      let tt=0,tc=0;scene.traverse(o=>{if(isT(o)){tc++;tt+=o.geometry.index?o.geometry.index.count/3:o.geometry.attributes.position.count/3}});
      out.terrainTris=tt;out.terrainChunks=tc;out.chunks=CHL.length;out.inst=VIL.reduce((a,v)=>a+v.n,0);out.vil=VIL.length;
      out.decoN=typeof WD!='undefined'?WD.list.length:null;out.decoMeshes=typeof WD!='undefined'?WD.ms.length:null;out.decoCol=typeof WD!='undefined'?WD.list.filter(d=>d.col).length:null;
      out.cblk=CBLK.size;out.sceneChildren=scene.children.length;out.secrets=SECRETS.length;
      // ground textures (CPU canvas + GPU estimate with mips)
      const tx=[gt].concat(typeof gtT!='undefined'?[gtT]:[]).map(t=>[t.image.width,t.image.height]);out.groundTex=tx;
      out.groundMB=+tx.reduce((a,[w,h])=>a+w*h*4*1.333/1048576,0).toFixed(1);out.maxTexSide=Math.max(...tx.map(q=>Math.max(q[0],q[1])));
      out.gpuMax=ren.capabilities.maxTextureSize;
      // world-sized arrays: MAP rows (string slots), bio, DW, HF, water depth maps
      out.arraysMB=+((W*H*8*2+MAP.DW.byteLength+HF.byteLength+W*H*4*2)/1048576).toFixed(1);
      out.geos=ren.info.memory.geometries;out.texN=ren.info.memory.textures;return out}""")
    OUT['world']=st
    # ---- map draw cost: the zone map (N) and the minimap ----
    mp=P('map cost',"""()=>{const p=PMAP[2],q=p.path[100];toPos(q[0],q[1]);let t=performance.now();for(let k=0;k<5;k++)openWMap();const wm=(performance.now()-t)/5;try{closeAll&&closeAll()}catch(_){}
      t=performance.now();for(let k=0;k<20;k++)mini_base();const mm=(performance.now()-t)/20;
      t=performance.now();for(let k=0;k<20;k++)rosterTick();const rt=(performance.now()-t)/20;
      t=performance.now();for(let k=0;k<50;k++)chunkVis();const cv=(performance.now()-t)/50;
      return {wmap:+wm.toFixed(2),mini:+mm.toFixed(2),rosterTick:+rt.toFixed(2),chunkVis:+cv.toFixed(3)}}""")
    OUT['mapcost']=mp
    if CHK:checks(ev,P,ok)
    PERF(ev,P)
    print('FAILS',len(fails),fails)
    OUT['fails']=fails
    json.dump(OUT,open(play.TMP+'/v97_%s.json'%TAG,'w'),indent=1)
    if REF:table(json.load(open(REF)),OUT)

def checks(ev,P,ok):
    st=OUT['world']
    ok(st['PMW']>=473 and st['PMH']>=491,'zones are 40% bigger (473x491)')
    # v89 layout (338x351, 5 camps, 60 roaming groups), measured with SRC=<v96 build> TAG=before
    B=json.load(open(REF))['world']['zones'] if REF else None
    for i,z in enumerate(st['zones']):
        if B:
            b=B[i];print('  %-18s walkable %5d -> %5d (x%.2f)   mobs %3d -> %3d (x%.2f)  camps %d -> %d  nodes %d -> %d  deco %s -> %s'%(z['n'],b['walk'],z['walk'],z['walk']/b['walk'],b['mobs'],z['mobs'],z['mobs']/b['mobs'],b['camps'],z['camps'],b['props'],z['props'],b['deco'],z['deco']))
            ok(z['mobs']>=1.75*b['mobs'],'%s has ~1.9-2x mobs (%d vs %d)'%(z['n'],z['mobs'],b['mobs']))
            ok(z['walk']>=1.6*b['walk'],'%s walkable area grew (%d vs %d)'%(z['n'],z['walk'],b['walk']))
            ok(z['props']>=1.6*b['props'],'%s harvest nodes grew with area (%d vs %d)'%(z['n'],z['props'],b['props']))
            if b['deco']:ok(z['deco']>=1.6*b['deco'],'%s decorations grew with area (%d vs %d)'%(z['n'],z['deco'],b['deco']))
        ok(z['camps']>=7,'%s has 7+ camps (%d)'%(z['n'],z['camps']))
    lv=P('levels',"()=>PMAP.map(p=>[zoneLv(p.en[0],p.en[1]),p.lv[0],zoneLv(p.ba[0],p.ba[1]),p.lv[1],p.cl.map(c=>zoneLv(c[0],c[1]))])")
    for a,b,c,d,cl in lv:ok(abs(a-b)<=1 and c==d,'road level goes entrance %d->boss %d (%d..%d)'%(b,d,a,c));ok(cl==sorted(cl),'camp levels rise along the road %s'%cl)
    # nothing placed on the road, in the den circle, the wave arena, at the portals or in camps; mobs keep clear too
    bad=P('deco clear',"""()=>{const out=[];
      WD.list.forEach(d=>{const r=regionAt(Math.round(d.x),Math.round(d.z));if(r<0)return;const p=PMAP[r];
        if(Math.hypot(d.x-p.ba[0],d.z-p.ba[1])<26)out.push(['den',d.k,d.x,d.z]);
        if(Math.hypot(d.x-p.wa[0],d.z-p.wa[1])<18)out.push(['wave',d.k,d.x,d.z]);
        if(Math.hypot(d.x-p.en[0],d.z-p.en[1])<10)out.push(['entrance',d.k,d.x,d.z]);
        if(d.col&&p.path.some((q,i)=>i%2==0&&Math.hypot(q[0]-d.x,q[1]-d.z)<5+d.col))out.push(['road',d.k,d.x,d.z]);
        if(!d.col&&MAP.DW[Math.round(d.z)*W+Math.round(d.x)]<0&&p.path.some((q,i)=>i%2==0&&Math.hypot(q[0]-d.x,q[1]-d.z)<2.5))out.push(['road-small',d.k,d.x,d.z]);
        if(CAMPS.some(C=>C.pm===r&&Math.hypot(C.x-d.x,C.z-d.z)<CAMP_R+2))out.push(['camp',d.k,d.x,d.z])});
      const nodes=[];for(const [x,y] of MAP.props){const r=regionAt(x,y);if(r<0)continue;const p=PMAP[r];
        if(Math.hypot(x-p.ba[0],y-p.ba[1])<PM_DENR+1||Math.hypot(x-p.wa[0],y-p.wa[1])<16||Math.hypot(x-p.en[0],y-p.en[1])<5)nodes.push([x,y])}
      const mobs=[];PMAP.forEach((p,i)=>{rosterBuild(i);ROST.slots.forEach(s=>{if(s.camp)return;if(Math.hypot(s.hx-p.ba[0],s.hz-p.ba[1])<30||Math.hypot(s.hx-p.wa[0],s.hz-p.wa[1])<20||Math.hypot(s.hx-p.en[0],s.hz-p.en[1])<22||solid(s.x,s.z))mobs.push([i,s.x,s.z])})});ROST.r=-9;ROST.slots=[];
      const den=PMAP.map(p=>{let n=0;for(let y=-24;y<=24;y++)for(let x=-24;x<=24;x++)if(x*x+y*y<=24*24&&MAP.DW[(p.ba[1]+y)*W+p.ba[0]+x]>=0)n++;return n});
      const camps=PMAP.map((p,i)=>{const C=CAMPS.filter(c=>c.pm===i);return {n:C.length,minGap:Math.round(Math.min(...C.map(a=>Math.min(...C.filter(b=>b!==a).map(b=>Math.hypot(a.x-b.x,a.z-b.z)))))),
        open:C.every(c=>MAP.DW[c.z*W+c.x]<-4),denGap:Math.round(Math.min(...C.map(c=>Math.hypot(c.x-p.ba[0],c.z-p.ba[1])))),waGap:Math.round(Math.min(...C.map(c=>Math.hypot(c.x-p.wa[0],c.z-p.wa[1]))))}});
      const sec=SECRETS.map(S=>{const r=regionAt(S.x,S.z);return [S.T,r,r>=0&&PMAP[r].t===S.T]});
      return {bad:out.slice(0,12),nbad:out.length,nodesBad:nodes.length,mobsBad:mobs.slice(0,8),nMobsBad:mobs.length,denBlocked:den,camps,sec,nodes:nodes.slice(0,6)}}""")
    ok(bad['nbad']==0,'no decorations on the road / den / wave arena / entrance / camps')
    ok(bad['nodesBad']==0,'no harvest nodes in the den / wave arena / at the entrance')
    ok(bad['nMobsBad']==0,'roaming mobs keep clear of den / wave arena / entrance and stand on open ground')
    ok(all(n==0 for n in bad['denBlocked']),'den radius 24 is open ground')
    for c in bad['camps']:ok(c['open'] and c['minGap']>=36 and c['denGap']>=48,'camps spread out, open, away from the den %s'%c)
    ok(len(bad['sec'])==10 and all(f for t,r,f in bad['sec']),'secrets sit in a zone of their tier %s'%bad['sec'])
    wk=P('walk road',"""()=>PMAP.map((p,i)=>{let blocked=0,first=null;const P=p.path;
       // a road that runs through a camp may pass a tent or a stake: those tiles only count if the camp can't be walked around (flood fill below)
       let inCamp=0;for(let k=16;k<P.length-1;k++){const x=Math.round(P[k][0]),z=Math.round(P[k][1]);if(solid(x,z)||plBlocked(x,z)){if(CAMPS.some(C=>C.pm===i&&Math.hypot(C.x-x,C.z-z)<CAMP_R)){inCamp++;continue}blocked++;if(!first)first=[x,z]}}
       const ex=Math.round(p.en[0]),ez=Math.round(p.en[1]),seen=new Uint8Array(W*H),q=[[ex,ez]];seen[ez*W+ex]=1;let hit=false,n=0;
       while(q.length&&n++<600000){const [x,z]=q.pop();if(Math.hypot(x-p.ba[0],z-p.ba[1])<3){hit=true;break}
         for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Z=z+dz,k=Z*W+X;if(seen[k]||solid(X,Z))continue;seen[k]=1;q.push([X,Z])}}
       return {blocked,inCamp,first,reach:hit,camps:p.cl.every(c=>{const k=Math.round(c[1])*W+Math.round(c[0]);return seen[k]||hit})}})""")
    for i,w in enumerate(wk):ok(w['blocked']==0 and w['reach'],'zone %d road walkable entrance->boss %s'%(i,w))
    mv=P('hero walk',"""()=>{const out=[];[0,3,5].forEach(zi=>{const p=PMAP[zi],P=p.path;let stuck=0;toPos(P[40][0],P[40][1]);
      for(let k=60;k<P.length-30;k+=20){const a=pl.position.clone(),[tx,tz]=P[k];toPos(a.x,a.z);
        for(let f=0;f<40&&Math.hypot(pl.position.x-tx,pl.position.z-tz)>1.5;f++){const dx=tx-pl.position.x,dz=tz-pl.position.z,L=Math.hypot(dx,dz),sp=Math.min(L,.5);
          const nx=pl.position.x+dx/L*sp,nz=pl.position.z+dz/L*sp;if(plBlocked(nx,nz)){stuck++;break}pl.position.x=nx;pl.position.z=nz}}out.push(stuck)});return out}""")
    ok(mv==[0,0,0],'hero can walk the Kindlelight / Sands / Citadel roads (%s)'%mv)
    cb=P('colliders',"""()=>{const big=WD.list.filter(d=>d.col),u=new Set(),CS=new Set(WDCOL);big.forEach(d=>d.tl.forEach(k=>u.add(k)));
      const offGrid=WDCOL.filter(k=>k<0||k>=W*H).length;
      return {big:big.length,bigSolid:big.filter(d=>d.tl.length&&d.tl.every(k=>solid(k%W,Math.floor(k/W)))).length,small:WD.list.length-big.length,colTiles:WDCOL.length,fromBig:[...u].filter(k=>CS.has(k)).length,offGrid}}""")
    ok(cb['big']>0 and cb['bigSolid']==cb['big'] and cb['offGrid']==0,'big decorations are solid %s'%cb);ok(cb['fromBig']==cb['colTiles'],'only big decorations add collider tiles %s'%cb)
    # treasure-map spots: reachable, in their own zone
    tm=P('tmaps',"""()=>PMAP.map((p,i)=>{let n=0,okN=0;for(let k=0;k<6;k++){const s=tmPick(i,null);n++;if(s&&regionAt(s[0],s[1])===i&&lnReachable(i,s[0],s[1]))okN++}return [n,okN,lnReach(i).n]})""")
    ok(all(a==b for a,b,c in tm),'treasure-map spots reachable in their zone %s'%tm)
    # old saves: a v89-layout save in a zone goes to that zone's new entrance, its INST run is dropped,
    # treasure maps keep their zone and are re-placed
    sv=P('v89 save',"""()=>{saveGame(true);const s=JSON.parse(localStorage.getItem(SAVE_KEY));
      s.pos={x:806+200,z:8+100,realm:false};s.x2=s.x2||{};s.x2.wl=89;s.x2.inst={r:2,x:1006,z:108,quiet:false,slots:[],wl:89};
      s.x2.tmaps=[{id:1,r:2,x:1006,z:120,T:3},{id:2,r:4,x:600,z:500,T:4}];
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));loadGame();const x=pl.position.x,z=pl.position.z,r=regionAt(Math.round(x),Math.round(z));
      return {x,z,r,en:PMAP[2].en,inst:INST,solid:solid(x,z),tm:tmaps.map(m=>[m.r,regionAt(m.x,m.z),tmOk(m.r,m.x,m.z)])}}""")
    ok(sv['inst'] is None and sv['r']==2 and abs(sv['x']-sv['en'][0])<2 and not sv['solid'],'v89 save in Burningeye goes to its new entrance and drops the INST run')
    ok(len(sv['tm'])==2 and all(a==b and c for a,b,c in sv['tm']) and [a for a,b,c in sv['tm']]==[2,4],'v89 treasure maps keep their zone and get a reachable spot %s'%sv['tm'])
    sv0=P('v88 save',"""()=>{saveGame(true);const s=JSON.parse(localStorage.getItem(SAVE_KEY));
      s.pos={x:380+100,z:288+100,realm:false};if(s.x2){delete s.x2.wl;s.x2.inst={r:4,x:480,z:388,quiet:false,slots:[]};delete s.x2.tmaps}
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));loadGame();const x=pl.position.x,z=pl.position.z,r=regionAt(Math.round(x),Math.round(z));
      return {x,z,r,en:PMAP[4].en,inst:INST,solid:solid(x,z)}}""")
    ok(sv0['inst'] is None and sv0['r']==4 and abs(sv0['x']-sv0['en'][0])<2,'v88 save in The Dirge goes to its entrance')
    sv1=P('duskhold save',"""()=>{saveGame(true);const s=JSON.parse(localStorage.getItem(SAVE_KEY));s.pos={x:PCOURT[0]-3,z:PCOURT[1],realm:false};s.x2.wl=89;
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));loadGame();return {d:Math.hypot(pl.position.x-PCOURT[0]+3,pl.position.z-PCOURT[1])}}""")
    ok(sv1['d']<1,'an old save in the Portal Court stays there %s'%sv1)
    sv2=P('new save',"""()=>{const p=PMAP[2],q=p.path[300];toPos(q[0],q[1]);INST={r:2,x:q[0],z:q[1],quiet:false,slots:[]};saveGame(true);INST=null;loadGame();
      return {d:Math.hypot(pl.position.x-q[0],pl.position.z-q[1]),inst:!!INST,wl:JSON.parse(localStorage.getItem(SAVE_KEY)).x2.wl}}""")
    ok(sv2['d']<2 and sv2['inst'] and sv2['wl']==97,'new saves keep position and INST (wl 97) %s'%sv2)
    ct=P('court/town',"()=>({town:solid(TOWNS[0].sp[0],TOWNS[0].sp[1]),court:solid(PCOURT[0],PCOURT[1]+3),cyd:MAP.DW[CYD.y*W+CYD.x]<0,westOfZones:Math.max(TOWNS[0].cx+31,PCOURT[0]+19,CYD.x+CYD.rmax)<PMAP[0].x0})")
    ok(not ct['town'] and not ct['court'] and ct['cyd'] and ct['westOfZones'],'Duskhold, Portal Court and Courtyard unchanged and west of the zones %s'%ct)

def PERF(ev,P):
    if os.environ.get('NOPERF'):return
    ev("()=>{window.requestAnimationFrame=()=>0}")
    perf=[]
    for i in range(6):
        for f in (0.2,0.7):
            r=ev("""([i,f])=>{const p=PMAP[i],q=p.path[Math.floor(p.path.length*f)];CHEAT.god=true;enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});ROST.r=-9;
              toPos(q[0],q[1]);rosterTick();let t=performance.now()+1e5;
              for(let k=0;k<10;k++){t+=16;loop(t);POST.render()} // warm up (streaming, shader compiles)
              const ts=[],rs=[];let calls=0,tris=0;for(let k=0;k<3;k++){t+=16;const a=performance.now();loop(t);ts.push(performance.now()-a);calls=ren.info.render.calls;tris=ren.info.render.triangles;
                const b=performance.now();POST.render();rs.push(performance.now()-b)}
              let on=0;CHL.forEach(c=>{if(c.on)on++});
              ts.sort((a,b)=>a-b);rs.sort((a,b)=>a-b);return {z:i,f,ms:+ts[1].toFixed(1),render:+rs[1].toFixed(1),calls,tris,chunksOn:on,mobs:enemies.filter(e=>!e.dead).length}}""",[i,f])
            perf.append(r);print('perf',json.dumps(r))
    OUT['perf']=perf
    n=len(perf);OUT['perfAvg']={k:round(sum(r[k] for r in perf)/n,1) for k in ('ms','render','calls','tris','chunksOn','mobs')}
    med=lambda L:sorted(L)[len(L)//2]
    OUT['perfMed']={k:med([r[k] for r in perf]) for k in ('ms','render','calls','tris')}
    print('PERF median',OUT['perfMed'])
    print('PERF avg',OUT['perfAvg'])

def table(B,A):
    print('\n== sizes / mobs per zone (before -> after) ==')
    print('| zone | size | walkable tiles | camps | roaming groups | mobs | harvest nodes | decorations | levels |')
    print('|---|---|---|---|---|---|---|---|---|')
    for b,a in zip(B['world']['zones'],A['world']['zones']):
        print('| %s | %dx%d -> %dx%d | %d -> %d (x%.2f) | %d -> %d | %d -> %d | %d -> %d (x%.2f) | %d -> %d | %s -> %s | %d-%d |'%(a['n'],B['world']['PMW'],B['world']['PMH'],A['world']['PMW'],A['world']['PMH'],
            b['walk'],a['walk'],a['walk']/b['walk'],b['camps'],a['camps'],b['groups'],a['groups'],b['mobs'],a['mobs'],a['mobs']/b['mobs'],b['props'],a['props'],b['deco'],a['deco'],a['lv0'],a['lvBoss']))
    print('\n== perf (before -> after) ==')
    print('| metric | before | after |');print('|---|---|---|')
    row=lambda n,x,y:print('| %s | %s | %s |'%(n,x,y))
    bw,aw=B['world'],A['world']
    row('world grid','%dx%d'%(bw['W'],bw['H']),'%dx%d'%(aw['W'],aw['H']))
    row('JS heap after load (MB, after GC)',B.get('heapMB'),A.get('heapMB'))
    for k in ('script','map','hf','tex','inst','mini','rim'):row('load: %s (ms)'%k,B['phases'].get(k),A['phases'].get(k))
    row('ground texture(s) px',bw['groundTex'],aw['groundTex']);row('ground texture GPU MB (with mips)',bw['groundMB'],aw['groundMB'])
    row('terrain chunks / triangles','%d / %d'%(bw['terrainChunks'],bw['terrainTris']),'%d / %d'%(aw['terrainChunks'],aw['terrainTris']))
    row('visibility chunks (CHL)',bw['chunks'],aw['chunks']);row('decorations / instanced meshes','%s / %s'%(bw['decoN'],bw['decoMeshes']),'%s / %s'%(aw['decoN'],aw['decoMeshes']))
    row('collider tiles (CBLK)',bw['cblk'],aw['cblk']);row('world arrays MB (MAP, bio, DW, HF, water maps)',bw['arraysMB'],aw['arraysMB'])
    row('scene children',bw['sceneChildren'],aw['sceneChildren'])
    for k in ('ms','render','calls','tris','chunksOn','mobs'):row('12 spots avg: %s'%k,B['perfAvg'][k],A['perfAvg'][k])
    for k in ('ms','render','calls','tris'):row('12 spots median: %s'%k,B['perfMed'][k],A['perfMed'][k])
    row('max draw calls / triangles at a spot','%d / %d'%(max(r['calls'] for r in B['perf']),max(r['tris'] for r in B['perf'])),'%d / %d'%(max(r['calls'] for r in A['perf']),max(r['tris'] for r in A['perf'])))
    for k in ('wmap','mini','rosterTick','chunkVis'):row('%s (ms per call)'%k,B['mapcost'][k],A['mapcost'][k])
    row('rosterBuild per zone (ms)',[z['rosterMs'] for z in bw['zones']],[z['rosterMs'] for z in aw['zones']])
play.run(s,w=900,hh=560)
