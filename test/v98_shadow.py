# v98 perf_shadow: shadow casters, shadow-pass draw calls and render time at a Kindlelight camp and in Duskhold,
# plus screenshots out/v98_shadow_<spot>_<TAG>.png.
#   python3 v98_shadow.py                                  # current build (TAG=after), runs the checks
#   SRC=out/v98/before.html TAG=before NOCHK=1 python3 v98_shadow.py   # an older build for comparison
# Results go to out/v98_shadow_<TAG>.json; with REF=out/v98_shadow_before.json a before/after table is printed.
import play,json,os,sys
from playwright.sync_api import Page
_g=Page.goto
def _sg(self,url,**k):k['timeout']=600000;return _g(self,url,**k)
Page.goto=_sg
TAG=os.environ.get('TAG','after');OUT=play.TMP
M="""(spot)=>{const p=pl.position;TOD=.3;
 cam.position.set(p.x+Math.sin(camYaw)*Math.cos(camPitch)*camDist,p.y+1.1+Math.sin(camPitch)*camDist,p.z+Math.cos(camYaw)*Math.cos(camPitch)*camDist);look.copy(p);look.y+=1.1;cam.lookAt(look);
 atmos(0,performance.now());chunkVis();if(window.SHD&&typeof shdPass=='function')shdPass();
 const gl=ren.getContext(),px=new Uint8Array(4),fin=()=>{const pr=ren.getRenderTarget();ren.setRenderTarget(null);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);ren.setRenderTarget(pr)};
 const vis=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true};
 let flags=0,flagsVis=0;scene.traverse(o=>{if(o.isMesh&&o.castShadow){flags++;if(vis(o))flagsVis++}});
 // one frame with the shadow map drawn: record what the shadow pass draws
 const rec=[];const rbd=ren.renderBufferDirect;ren.renderBufferDirect=function(c,s,g,m,o){if(s===null)rec.push(o);return rbd.apply(this,arguments)};
 if(window.SHD)SHD.f=1;ren.shadowMap.needsUpdate=true;fin();POST.render();fin();ren.renderBufferDirect=rbd;const cW=ren.info.render.calls,cN=cW-rec.length;
 const heroIn=rec.some(o=>{for(let q=o;q;q=q.parent)if(q===pl)return true;return false});
 // steady render time: 12 frames as the game draws them (with v98: shadow map every 2nd frame)
 // (the shadow pass alone is timed by wrapping ren.shadowMap.render, with a GPU finish before and after)
 const sm=ren.shadowMap,sr=sm.render;let shMs=0,shN=0;sm.render=function(l,s){const go=s===scene&&(this.autoUpdate||this.needsUpdate);if(!go)return sr.apply(this,arguments);fin();const t=performance.now();const r=sr.apply(this,arguments);fin();shMs+=performance.now()-t;shN++;return r};
 const ms=[];let calls=0;for(let i=0;i<12;i++){const t=performance.now();POST.render();fin();ms.push(performance.now()-t);calls+=ren.info.render.calls}ms.sort((a,b)=>a-b);
 const shPer=shN?shMs/shN:0,shAvg=shMs/12;sm.render=sr;
 // shadow map every frame, for reference
 const ms2=[];for(let i=0;i<6;i++){ren.shadowMap.needsUpdate=true;const t=performance.now();POST.render();fin();ms2.push(performance.now()-t)}ms2.sort((a,b)=>a-b);
 // main scene pass alone (no shadow map update, no post): where PCF vs PCF-soft filtering shows
 const au=ren.shadowMap.autoUpdate,ms3=[];ren.shadowMap.autoUpdate=false;ren.shadowMap.needsUpdate=false;
 for(let i=0;i<7;i++){fin();const t=performance.now();ren.setRenderTarget(null);ren.render(scene,cam);fin();ms3.push(performance.now()-t)}ms3.sort((a,b)=>a-b);ren.shadowMap.autoUpdate=au;
 const sc=sun.shadow.camera;
 return {spot,flags,flagsVis,shadowDraws:rec.length,casters:new Set(rec).size,callsWithShadow:cW,callsNoShadow:cN,heroCasts:heroIn,
  callsAvg:Math.round(calls/12),shadowMsPerPass:+shPer.toFixed(1),shadowMsPerFrame:+shAvg.toFixed(1),shadowPasses12:shN,msMedian:+ms[6].toFixed(1),msMainPass:+ms3[3].toFixed(1),msShadowEveryFrame:+ms2[3].toFixed(1),type:ren.shadowMap.type,auto:ren.shadowMap.autoUpdate,mapSize:sun.shadow.mapSize.x,
  square:[sc.left,sc.right,sc.top,sc.bottom],radius:sun.shadow.radius,shd:window.SHD?Object.assign({},SHD.stat,{hide:SHD.hide.length,inst:SHD.inst.length}):null}}"""
def s(pg):
    pg.set_default_timeout(600000);ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(4000)
    ev("()=>{window.__hp=setInterval(()=>{hero.hp=heroMax()},50)}")
    res=[]
    # camera looks across the moonlight (MOOND), so shadows fall sideways on screen
    spots=[('camp',"()=>{const C=CAMPS.find(c=>c.pm===0),y=2.07;toPos(C.x+Math.sin(y)*9,C.z+Math.cos(y)*9);camYaw=y;pl.step=null}"),
           ('camp2',"()=>{const C=CAMPS.filter(c=>c.pm===0)[3],y=2.07;toPos(C.x+Math.sin(y)*8,C.z+Math.cos(y)*8);camYaw=y;pl.step=null}"),
           ('town',"()=>{const T=TOWNS[0],y=2.07;toPos(T.cx+Math.sin(y)*7,T.cy+Math.cos(y)*7);camYaw=y;pl.step=null}")]
    for name,js in spots:
        ev(js);pg.wait_for_timeout(7000)
        r=ev(M,name);res.append(r);print(json.dumps(r))
        ev("()=>{TOD=.3}");pg.wait_for_timeout(2500)
        pg.locator('#stage').screenshot(path=OUT+'/v98_shadow_%s_%s.png'%(name,TAG))
        # the game's moonlight is dim: a second shot with the moon bright and the ambient light low shows the shadows
        ev("()=>{const f=atmos;window.__atm=f;atmos=function(){f.apply(this,arguments);hemi.intensity=.1;sun.intensity=3.2;sun.color.setRGB(1,.95,.85)}}")
        pg.wait_for_timeout(2500)
        pg.locator('#stage').screenshot(path=OUT+'/v98_shadow_%s_lit_%s.png'%(name,TAG))
        ev("()=>{atmos=__atm}")
    # moving hero: the hero's shadow is drawn on the frames it moves (every frame while moving faster than SHD.mv per frame)
    mv=ev("""()=>new Promise(res=>{let n=0,drawn=0;const f0=window.SHD?SHD.stat.drawn:0,x0=pl.position.x,z0=pl.position.z;K.d=true;
      const t=setInterval(()=>{n++;if(n>=6){clearInterval(t);K.d=false;res({moved:+Math.hypot(pl.position.x-x0,pl.position.z-z0).toFixed(2),drawn:window.SHD?SHD.stat.drawn-f0:null})}},1000)})""")
    print('moving',json.dumps(mv))
    json.dump({'spots':res,'moving':mv},open(OUT+'/v98_shadow_%s.json'%TAG,'w'),indent=1)
    if os.environ.get('REF'):
        ref=json.load(open(os.environ['REF']))
        for a,b in zip(ref['spots'],res):
            print('%-6s'%a['spot'],' | '.join('%s %s -> %s'%(k,a[k],b[k]) for k in ['flags','flagsVis','casters','callsWithShadow','callsNoShadow','callsAvg','shadowMsPerPass','shadowMsPerFrame','msMainPass','msMedian','msShadowEveryFrame','type']))
    if not os.environ.get('NOCHK'):
        bad=[]
        for r in res:
            if r['type']!=1:bad.append((r['spot'],'shadow type',r['type']))
            if not r['heroCasts']:bad.append((r['spot'],'hero not in shadow pass'))
            if r['auto']:bad.append((r['spot'],'shadow autoUpdate still on'))
            if r['shd'] is None:bad.append((r['spot'],'no SHD'))
        if os.environ.get('REF'):
            for a,b in zip(ref['spots'],res):
                if not b['casters']<a['casters']:bad.append((b['spot'],'casters did not drop',a['casters'],b['casters']))
        if mv['moved']<.3 or (mv['drawn'] is not None and mv['drawn']<1):bad.append(('moving',mv))
        print('CHECKS', 'OK' if not bad else 'FAIL %r'%bad)
play.run(s)
