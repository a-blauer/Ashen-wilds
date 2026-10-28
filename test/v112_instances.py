# v112: themed field instances II and III. For every field instance of every zone: the road from the entrance to the
# gateway is walkable (flood fill over solid(), colliders included), every camp, the home portal and a treasure-map spot are
# reached; themes/biomes/ribbons/atmosphere are in place; no console errors; the world is the same after a reload
# (determinism: hash of tiles, heights, biome ids and decorations); a v108 save in II is moved to that instance's entrance.
# Prints PASS/FAIL lines.  NORELOAD=1 skips the determinism reload.
import play,json,os
FL=r"""(g)=>{const I=INSL[g],x0=I.x0,y0=I.y0,w=I.w,h=I.h,seen=new Uint8Array(w*h),q=[];
  const ok=(x,z)=>x>=x0&&z>=y0&&x<x0+w&&z<y0+h&&!solid(x,z);
  const s=[Math.round(I.en[0]),Math.round(I.en[1])];if(!ok(s[0],s[1]))return {err:'entrance solid'};
  seen[(s[1]-y0)*w+s[0]-x0]=1;q.push(s);let n=0;
  while(q.length){const [x,z]=q.pop();n++;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Z=z+dz;if(!ok(X,Z))continue;const k=(Z-y0)*w+X-x0;if(seen[k])continue;seen[k]=1;q.push([X,Z])}}
  const near=(x,z,r)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const X=Math.round(x)+i,Z=Math.round(z)+j;if(X<x0||Z<y0||X>=x0+w||Z>=y0+h)continue;if(i*i+j*j<=r*r&&seen[(Z-y0)*w+X-x0])return true}return false};
  const gw=RPORT.find(r=>r.k=='next'&&r.ig===g),hp=RPORT.find(r=>r.k=='home'&&r.ig===g);
  const camps=CAMPS.filter(C=>C.ig===g).map(C=>near(C.x,C.z,3));
  let walk=0;for(let z=y0;z<y0+h;z+=2)for(let x=x0;x<x0+w;x+=2)if(MAP.DW[z*W+x]<0)walk++;
  const path=I.path.filter((p,i)=>i%4==0).every(p=>near(p[0],p[1],2));
  return {n:I.n,cells:n,gate:!!gw&&near(gw.x,gw.z,2),home:!hp||near(hp.x,hp.z,2),camps,path,walk:walk*4,bio:MAP.bio[Math.round(I.en[1])][Math.round(I.en[0])]}}"""
HASH=r"""()=>{let h=0;const mix=v=>{h=(Math.imul(h^v,2654435761)+1013904223)|0};
  INSL.forEach(I=>{for(let z=I.y0;z<I.y0+I.h;z+=1)for(let x=I.x0;x<I.x0+I.w;x+=1){const t=MAP[z][x];mix(t?t.charCodeAt(0):0);mix(MAP.bio[z][x]);if((x+z)%3==0)mix(Math.round(GHv(x,z)*100))}});
  WD.list.forEach(d=>{mix(Math.round(d.x*100));mix(Math.round(d.z*100));mix(d.k.length);mix(Math.round(d.ry*1000))});
  MAP.props.forEach(p=>{mix(p[0]);mix(p[1])});WDCOL.forEach(v=>mix(v));
  return [h,WD.list.length,MAP.props.length,WDCOL.length]}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    if os.environ.get('PART')=='perf':
        # frame cost per field instance (two spots each): draw calls, triangles, render ms, loop ms (render stubbed).
        # Run with SRC=<old build> too and compare.  Prints PERF lines and a total.
        ev("()=>{window.requestAnimationFrame=()=>0;window._vt=performance.now()+1e5;window._PR=POST.render.bind(POST)}")
        tot=[0,0,0,0,0]
        for g in [z*5+k for z in range(6) for k in range(3)]:
            for f in [0.3,0.7]:
                r=ev("""([g,f])=>{const I=INSL[g];insArrive(I);const P=I.path,i=Math.floor((P.length-30)*f),q=P[i],n=P[i+25];toPos(q[0],q[1],Math.atan2(q[0]-n[0],q[1]-n[1]));rosterTick();
                  POST.render=()=>{};for(let k=0;k<30;k++){_vt+=16;loop(_vt)}let t0=performance.now();for(let k=0;k<10;k++){_vt+=16;loop(_vt)}const lm=(performance.now()-t0)/10;POST.render=_PR;
                  _vt+=16;loop(_vt);t0=performance.now();let c=0,tr=0;for(let k=0;k<3;k++){ren.info.reset();POST.render();c=ren.info.render.calls;tr=ren.info.render.triangles}ren.getContext().finish();const rm=(performance.now()-t0)/3;
                  return [I.n,c,tr,Math.round(rm),Math.round(lm*10)/10,enemies.filter(e=>!e.dead).length]}""",[g,f])
                print('PERF',json.dumps(r));tot[0]+=r[1];tot[1]+=r[2];tot[2]+=r[3];tot[3]+=r[4];tot[4]+=1
        print('PERF TOTAL calls %d tris %d render ms %d loop ms %.1f (avg per spot: calls %.0f tris %.0f render %.0f ms loop %.1f ms)'%(tot[0],tot[1],tot[2],tot[3],tot[0]/tot[4],tot[1]/tot[4],tot[2]/tot[4],tot[3]/tot[4]))
        return
    ev("()=>{POST.render=()=>{};window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}")
    fails=[]
    def T(name,js,check,arg=None):
        r=ev(js,arg) if arg is not None else ev(js);ok=False
        try:ok=check(r)
        except Exception as e:print('check error',e)
        print(('PASS ' if ok else 'FAIL ')+name,'=>',json.dumps(r)[:600])
        if not ok:fails.append(name)
        return r
    # v164: the bigger camp clearings widen a few stretches of road, so fewer spots fit an arch (17 -> 11)
    st=T('themes',"()=>V112.stats()",lambda r:len(r['themes'])==12 and r['arches']>=10 and r['ceil']>20 and len(r['ribbons'])==4)
    T('biomes',"()=>INSL.filter(I=>I.fld).map(I=>[I.g,MAP.bio[Math.round(I.en[1])][Math.round(I.en[0])],PMAP[I.z].bi,BIOMES[MAP.bio[Math.round(I.en[1])][Math.round(I.en[0])]].n==PMAP[I.z].n])",
      lambda r:all((q[1]==q[2])==(q[0]%5==0) and q[3] for q in r))
    T('load cost',"()=>[WD.stats.ms,WD.stats.buildMs,WD.stats.meshes,WD.list.length]",lambda r:True)
    for g in [z*5+k for z in range(6) for k in range(3)]:
        T('walk %d'%g,FL,lambda r:'err' not in r and r['gate'] and r['home'] and all(r['camps']) and r['path'] and r['walk']>9000,g)
    # treasure maps: a spot in every themed instance, reachable
    T('treasure maps',"""()=>TH112.list.map(t=>{const I=INSL[t.g],q=I.path[60],m=giveMap({x:q[0],z:q[1]});if(!m)return null;const r=[m.k,rgAt(Math.round(m.x),Math.round(m.z)),!solid(Math.round(m.x),Math.round(m.z))];tmaps.splice(tmaps.indexOf(m),1);return r})""",
      lambda r:all(q and q[0]==q[1]%5 and q[2] for q in r) if r else False)
    # visiting every themed instance: atmosphere, ribbons, roster, frames run without errors
    T('visit',"""()=>{const out=[];for(const t of TH112.list){const I=INSL[t.g];insArrive(I);const q=I.path[80];toPos(q[0],q[1]);rosterTick();window._vt=window._vt||performance.now()+1e5;for(let i=0;i<40;i++){_vt+=16;loop(_vt)}
       const rib=ST112.filter(s=>s.m.visible).map(s=>s.g);out.push([t.g,curIns().g,Math.round(scene.fog.density*1000),IA112.k>.5,rib.join(','),ROST.slots.length,ZP.type,SKY.visible])}return out}""",
      lambda r:all(q[0]==q[1] and q[3] and q[5]>15 for q in r))
    T('instance I unchanged look',"()=>{const I=PMAP[0].ins[0];insArrive(I);window._vt=window._vt||performance.now()+1e5;for(let i=0;i<20;i++){_vt+=16;loop(_vt)}return [IA112.t,ST112.some(s=>s.m.visible),ZP.type]}",lambda r:r[0] is None and r[1] is False)
    # the gateways still lead on (v143-v145: Kindlelight's main quest seals its gateways until done; mark it done; v151: Burningeye's II
    # and III gateways are the melted gate (v165: the Dirge's chapters are marked done too) and the drilled tunnel: their own prompts; v152-v154: Hillside Crest's are special-instance gates;
    # v165: Searing Sands' II and III ways on are Kheprit's rift and the Sandskimmer, tested by v165_courtyard.py / v165_run.py)
    T('gateways',"()=>{if(typeof MQ143!='undefined')MQ143.st=3;if(typeof MQ144!='undefined')MQ144.st=3;if(typeof MQ145!='undefined')MQ145.at=[1,1,1];if(typeof MQ160!='undefined')MQ160.st=3;if(typeof MQ170!='undefined')MQ170.st=1;if(typeof DG165Q!='undefined'){DG165Q.s.st=2;DG165Q.r.st=2;DG165Q.o.st=1}return PMAP.map((p,z)=>[1,2].map(k=>{if(z===3)return true;const g=RPORT.find(r=>r.k=='next'&&r.ig===insG(z,k));const G=typeof SP152!='undefined'&&Object.values(SP152.gates).find(q=>q.ig===insG(z,k));if(G){if(typeof AB152Q!='undefined')AB152Q.st=2;if(typeof CH153Q!='undefined')CH153Q.st=2;if(typeof HD154!='undefined')HD154.st=2;const I=INSL[G.ig];toPos(I.ba[0],I.ba[1]);sp152GateTick();toPos(G.spot.x-G.spot.ux*2,G.spot.z-G.spot.uz*2);const pp=worldPrompt();return !!pp&&pp.label.includes(g.to.n)}toPos(g.x,g.z+1);for(let i=0;i<3;i++)homeTick(1/30,performance.now(),0);const pp=z===2?worldPrompt():portalPrompt();return !!pp&&(pp.label.includes(g.to.n)||z===2&&pp.label.includes(g.to.n.replace(/^Burningeye Summit /,''))||z===2&&/Through the gate|Into the tunnel/.test(pp.label))}))}",lambda r:all(all(x) for x in r))
    # co-op region and local map in a themed instance
    T('co-op region / map',"()=>{insArrive(PMAP[2].ins[1]);openWMap();const ok=!$('wmap').classList.contains('hide');$('wmap').classList.add('hide');return [mpCurRg(),mpLoc(mpCurRg()),ok,areaName()]}",lambda r:r[0]==11 and 'Burningeye Summit II' in r[1] and r[2])
    # save + old save (v108) in instance II -> moved to its entrance, reached instances kept
    T('save wl',"()=>{saveGame&&saveGame();const s=JSON.parse(localStorage.getItem(SAVE_KEY));return [s.x2.wl,s.x2.insr]}",lambda r:r[0]==112)
    T('v108 save in II',"""()=>{const s=JSON.parse(localStorage.getItem(SAVE_KEY));const I=PMAP[0].ins[1];let q=null;
       for(let z=I.y0+5;z<I.y0+I.h-5&&!q;z+=3)for(let x=I.x0+5;x<I.x0+I.w-5;x+=3){if(MAP.DW[z*W+x]>1&&MAP.DW[z*W+x]<5){q=[x,z];break}}
       s.pos={x:q[0],z:q[1]};s.x2.wl=108;s.x2.insr=[2,0,0,0,0,0];delete s.x2.inst;localStorage.setItem(SAVE_KEY,JSON.stringify(s));loadGame();const c=curIns();
       return [c&&c.g,Math.hypot(pl.position.x-I.en[0],pl.position.z-I.en[1])<1.5,INSR.slice(0,2),solid(Math.round(pl.position.x),Math.round(pl.position.z))]}""",
      lambda r:r[0]==1 and r[1] and r[2][0]==2 and r[3] is False)
    T('v108 save in I',"""()=>{const s=JSON.parse(localStorage.getItem(SAVE_KEY));const I=PMAP[3].ins[0],q=I.path[100];s.pos={x:q[0]+.3,z:q[1]};s.x2.wl=108;s.x2.insr=[3,3,3,1,0,0];localStorage.setItem(SAVE_KEY,JSON.stringify(s));loadGame();
       return [curIns()&&curIns().g,Math.hypot(pl.position.x-q[0]-.3,pl.position.z-q[1])<.01,INSR.slice(0,4)]}""",lambda r:r[0]==15 and r[1] and r[2]==[3,3,3,1])
    h1=T('hash',HASH,lambda r:True)
    if not os.environ.get('NORELOAD'):
        pg.reload(wait_until='domcontentloaded',timeout=600000);pg.wait_for_timeout(6000)
        T('deterministic',HASH,lambda r:r==h1)
    print('FAILS',fails)
    open(play.TMP+'/v112_fails.json','w').write(json.dumps(fails))
play.run(s,w=800,hh=500)
