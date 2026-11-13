# v229: the fountain's finale (4000-4002): F at the fountain with the last Sovereign's essence plays the cinematic (KQ_FN229) instead
#   of the plain pour; Skip hands the game back with the essence claimed, the man standing by the fountain, the seen flag saved and
#   the den gone; a reload keeps him; the plain pour still works without the cinematic. Then every frame of the film is stepped
#   (STEP seconds apart): no frame errors, the camera never under the ground or the den's floor, and nothing solid within NEAR of the
#   lens (the den's rock, the stones, the town, the figure). Stills -> <AW_TMP>/v229_<t>.png (FRAMES=0 skips, TIMES= picks).
import play,os,json
TIMES=[float(x) for x in os.environ.get('TIMES','2,5.5,9,13,17.5,19.8,23.5,26.6,28.6,31,33.4,35.4,37,38.6,41.6,44,46.6,47.8,50.4,53.2,56.6,59.6,63.6,65.2,68').split(',') if x]
STEP=float(os.environ.get('STEP','.25'));NEAR=float(os.environ.get('NEAR','.3'))
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    fails=[]
    r=pg.evaluate("""async()=>{const o={},T=TOWNS[0],L=fn229Last();for(let i=0;i<L;i++)bossDone.add(i);try{cheatDusk147()}catch(e){}toPos(T.cx+1,T.cy+3.2);await new Promise(r=>setTimeout(r,1500));
      o.npc0=!!FN229.npc;SE208.st[L]=2;const n0=scene.children.length;
      // without the flag (automation): the plain pour, no cinematic
      se208Pour(L);o.plain=!FN229.run&&SE208.pour===1;await new Promise(r=>setTimeout(r,1800));o.plainDone=bossDone.has(L);o.plainNpc=!!FN229.npc;
      // back to carrying it, now with the cinematic
      bossDone.delete(L);SE208.st[L]=2;fn229Npc();o.npcGone=!FN229.npc;window.KQ_FN229=1;FN229.seen=0;
      const pr=townPortalPrompt(T);o.prompt=pr&&pr.label;pr&&pr.fn();o.run=FN229.run;o.on=IC151.on;o.claimedEarly=bossDone.has(L);o.err0=FN229.err;
      await new Promise(r=>setTimeout(r,2500));o.t1=FN229.S&&FN229.S.t;o.dom=!!document.getElementById('fn229');
      // jump on to the arrival in Duskhold so its one-off effects run on the real clock too
      if(FN229.S&&FN229.S.live)FN229.S.live.off+=FN229.T.f1-FN229.S.t;await new Promise(r=>setTimeout(r,3000));o.t2=FN229.S&&FN229.S.t;o.err1=FN229.err;
      fn229Skip();const t0=performance.now();while(FN229.run&&performance.now()-t0<60000)await new Promise(r=>setTimeout(r,200));
      o.after={run:FN229.run,on:IC151.on,dom:!!document.getElementById('fn229'),body:document.body.classList.contains('ic151d'),err:FN229.err};
      o.claimed=bossDone.has(L);o.npc=!!FN229.npc;o.pour=SE208.pour|0;o.seen=(x2Save()||{}).fn229;o.den=!!scene.getObjectByName('fn229den');
      if(FN229.npc){const N=FN229.npc;o.npcAt=[+(N.x-T.cx).toFixed(2),+(N.z-T.cy).toFixed(2)];o.npcVis=N.F.root.visible&&N.F.man.g.visible;o.robe=N.F.st.robe;o.hero=Math.hypot(pl.position.x-N.x,pl.position.z-N.z)}
      o.fov=cam.fov;o.near=cam.near;o.up=cam.up.toArray();o.kids=scene.children.length-n0;
      // a second F does nothing (nothing is carried), the viewer lists it
      o.again=!!townPortalPrompt(T)&&/essence/.test((townPortalPrompt(T)||{}).label||'');
      try{cv215Open();o.listed=CV215.L.some(c=>c.z==='fn229');$('cv215').classList.add('hide')}catch(e){o.listed=String(e)}
      // a save and a load keep him
      const snap=x2Save();fn229Npc();x2Load(snap);o.loadSeen=FN229.seen;try{fn229Npc()}catch(e){}o.loadNpc=!!FN229.npc;
      for(let i=0;i<40;i++)homeTick(.05,performance.now());o.tickErr=FN229.nerr||null;return o}""")
    print('RUN',json.dumps(r))
    def chk(ok,msg):
        if not ok:fails.append(msg)
    chk(not r['npc0'],'the man stands by the fountain before the last essence is poured')
    chk(r['plain'] and r['plainDone'] and r['plainNpc'],'the plain pour (no cinematic) no longer works or leaves no man')
    chk(r['npcGone'],'the man stays when the last Sovereign is not in bossDone')
    chk(r['prompt'] and 'essence' in r['prompt'],'no pour prompt at the fountain')
    chk(r['run'] and r['on'] and r['dom'],'the cinematic did not start on the pour')
    chk(not r['claimedEarly'],'the essence was claimed before the cinematic ended')
    chk(r['t1'] and r['t1']>.5 and r['t2'] and r['t2']>r['t1'],'the clock does not run')
    a=r['after'];chk(not(a['run'] or a['on'] or a['dom'] or a['body']),'not handed back after Skip '+json.dumps(a))
    chk(not(r['err0'] or r['err1'] or a['err']),'frame error '+str(r['err0'] or r['err1'] or a['err']))
    chk(r['claimed'] and r['pour']==0,'the essence was not claimed at the hand-back')
    chk(r['npc'] and r.get('npcVis') and r.get('robe')==1,'the man is not standing by the fountain afterwards')
    chk(r['seen']==1 and r['loadSeen']==1 and r['loadNpc'],'not saved / not kept by a load')
    chk(not r['den'],'the den was left in the scene')
    chk(r['fov']>50 and abs(r['near']-.1)<.05 and r['up']==[0,1,0],'the camera was not put back %s %s'%(r['fov'],r['near']))
    chk(not r['again'],'the pour is offered a second time')
    chk(r['listed'] is True,'not listed under Settings → Cinematics')
    chk(not r['tickErr'],'the man\'s idle tick throws: '+str(r['tickErr']))
    chk(r.get('hero',9)>1.5,'the hero stands inside the man')
    # every frame: errors and the camera's clearance
    c=pg.evaluate("""()=>{const L=fn229Last();const c=fn229Cap({rp:1});window.__clip=(near)=>{const S=FN229.S,C=S.cam,p=cam.position,O=S.D.g.position,rc=new THREE.Raycaster();rc.camera=cam;rc.near=0;rc.far=near;const out=[];
        const solid=o=>o.isMesh&&o.visible&&o.material&&!(o.material.transparent&&o.material.depthWrite===false)&&!(o.material.blending===THREE.AdditiveBlending)&&!o.material.userData.se208;
        const vis=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true};
        if(C.den){const lx=p.x-O.x,lz=p.z-O.z,r=Math.hypot(lx,lz),fy=O.y+(r<FN229D.pool+.2?-.22:fn229DenFloor(lx,lz));if(C.n!='b1'&&p.y<fy+.3)out.push('under the den floor '+(p.y-fy).toFixed(2));
          if(C.n=='b1'){if(r>FN229D.shR-.6)out.push('in the shaft wall r '+r.toFixed(2))}else if(p.y-O.y>fn229DenCeil(lx,lz)-1.5)out.push('in the den roof')}
        else if(p.y<GH(p.x,p.z)+.3)out.push('under the ground '+(p.y-GH(p.x,p.z)).toFixed(2));
        const T=C.den?[S.D.g]:scene.children.filter(o=>o.visible&&!o.isLight),f=new THREE.Vector3();cam.getWorldDirection(f);
        const dirs=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[.7,0,.7],[-.7,0,.7],[.7,0,-.7],[-.7,0,-.7],[f.x,f.y,f.z]];
        for(const d of dirs){rc.set(p,new THREE.Vector3(d[0],d[1],d[2]).normalize());if(d[3]===undefined&&d===dirs[10])rc.far=near*2;let H=[];try{H=rc.intersectObjects(T,true)}catch(e){}
          const h=H.find(x=>solid(x.object)&&vis(x.object));if(h){let n=h.object.name||'';for(let q=h.object;q&&!n;q=q.parent)n=q.name||'';out.push((n||'mesh')+' at '+h.distance.toFixed(2));break}}
        return out};return c}""")
    print('CAP',json.dumps(c))
    chk(c and c['ms']<20000,'the set-up takes too long: %s'%json.dumps(c))
    bad=pg.evaluate("""([step,near])=>{const out=[];FN229.noDraw=1;for(let t=0;t<FN229.cut-.01;t+=step){fn229Seek(t);if(FN229.err){out.push([t,'error '+FN229.err]);break}if(!FN229.S)break;const c=__clip(near);if(c.length)out.push([+t.toFixed(2),FN229.S.cam.n,c.join('; ')])}FN229.noDraw=0;return out}""",[STEP,NEAR])
    print('CLIP',json.dumps(bad[:40]))
    for b in bad[:12]:fails.append('camera %s'%json.dumps(b))
    if os.environ.get('FRAMES','1')!='0':
        for t in TIMES:
            e=pg.evaluate("(t)=>{FN229.noDraw=0;if(window.__fast)__fast.draw=1;fn229Seek(t);return FN229.err||null}",t)
            if e:fails.append('frame error at %s: %s'%(t,e));break
            pg.wait_for_timeout(250);pg.screenshot(path=play.TMP+'/v229_%04.1f.png'%t,timeout=600000);print('shot',t)
    e=pg.evaluate("""()=>{fn229Seek(FN229.len+.1);return {run:FN229.run,on:IC151.on,den:!!scene.getObjectByName('fn229den'),npc:!!FN229.npc,figs:scene.children.filter(o=>o.name=='fn229figure').length,err:FN229.err||null}}""")
    print('END',json.dumps(e))
    if e['run'] or e['on'] or e['den'] or e['err']:fails.append('the replay did not end cleanly %s'%json.dumps(e))
    if e['figs']!=1 or not e['npc']:fails.append('after a replay there should be exactly the one man by the fountain %s'%json.dumps(e))
    for f in fails:print('FAIL',f)
    print('DONE',len(fails),'fails')
play.run(s,w=1280,hh=720)
