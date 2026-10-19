# v98 perf_gpu: shader warm-up + point-light pool.
#   python3 v98_gpu.py                 # load metrics, then camps of zone 0 (ZONES=) + every ability + drops + mounts:
#                                      # counts programs compiled after the warm-up and checks the point-light count
#   ZONES=0,3 python3 v98_gpu.py       # several zones
#   PART=shots python3 v98_gpu.py      # night screenshots near light sources -> out/v98_<TAG>_<spot>.png
#   PART=bench python3 v98_gpu.py      # render time of two fixed night views (software GL: compare builds only)
#   SRC=<old build> TAG=before ...     # same against another build (no PGL/PGW there; numbers only)
#   FX=0 skips the ability casts, FXN=Shadow Clone,Meteor casts only those, CAMPS=3 limits the camps per zone, PGLN=5 tries another light-pool size
import os,json,play
from playwright.sync_api import Page
PART=os.environ.get('PART','prog');TAG=os.environ.get('TAG','after');ZONES=[int(z) for z in os.environ.get('ZONES','0').split(',')]
NC=int(os.environ.get('CAMPS','99'));FX=os.environ.get('FX','1')!='0'
OUT=play.TMP
# frame timing from the very first frame (init script), and no navigation timeout (SwiftShader loads slowly)
INIT="""(()=>{window.__ff=[];const r=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=function(f){return r(t=>{const a=performance.now();f(t);const b=performance.now();if(window.__ff.length<400)window.__ff.push([Math.round(a),Math.round(b-a)])})}})()"""
if os.environ.get("PGLN"):INIT+=";window.AW_PGLN=%d"%int(os.environ["PGLN"])   # pool size experiment
if os.environ.get("NOWARM"):INIT+=";window.AW_NOWARM=1"   # skip the warm-up (screenshots, bench)
_g=Page.goto
def _goto(self,url,**k):
    k['timeout']=600000;self.add_init_script(INIT);return _g(self,url,**k)
Page.goto=_goto
res={'fail':[]}
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+(' '+str(info) if info!='' else ''))
    if not ok:res['fail'].append(name)
# logs every program created after it is installed, with the object/material that asked for it
HOOK="""()=>{window.__np=[];window.__cur=null;window.__used=new Set();THREE.Object3D.prototype.onBeforeRender=function(){window.__cur=this;const m=this.material;if(m)__used.add(m)};
 const P=ren.info.programs,op=P.push;P.push=function(){for(const p of arguments){const o=__cur;let d='?';try{let r=o,path=[];while(r&&r.parent&&r.parent.type!=='Scene'){path.push(r.name||r.type);r=r.parent}
   const e=r&&r.isE?enemies.find(e=>e.m===r):null,m=o&&o.material;
   d=(r===pl?'hero':e?'enemy '+e.c.en:(r&&(r.name||r.type)))+' / '+path.slice(0,3).join('<')+' / '+(m&&!Array.isArray(m)?m.type+(m.map?'+map':'')+(m.vertexColors?'+vc':'')+(m.skinning?'+skin':'')+(m.flatShading?'+flat':'')+(m.side==2?'+ds':'')+(m.fog===false?'+nofog':''):'')}catch(err){d='err '+err.message}
   __np.push(d);__npk.push(p.cacheKey)}return op.apply(this,arguments)};window.__npk=[];window.__k0=P.map(p=>p.cacheKey);
 window.__lc=()=>{let n=0,v=0;scene.traverse(o=>{if(o.isPointLight){n++;if(o.visible)v++}});return [n,v]}}"""
def newp(ev):return ev("()=>__np.splice(0)")
# r128 program parameter names, to say which shader feature a new program differs in from the nearest existing one
import re as _re
PN_=json.loads(_re.search(r'\["precision","isWebGL2"[^\]]*\]',open(os.path.dirname(os.path.abspath(__file__))+'/vendor/three.min.js').read()).group(0))
def kparse(k):
    a=k.split(',');i=next((j for j,x in enumerate(a) if x in('highp','mediump','lowp')),None)
    if i is None:return None
    return a[0],a[1:i],dict(zip(PN_,a[i:i+len(PN_)])),','.join(a[i+len(PN_)+2:])
def kdiff(ev):
    K0=ev("()=>__k0");KN=ev("()=>__npk")
    for k in KN:
        p=kparse(k)
        if not p:print('  custom shader program (no diff)');continue
        best=None;same=None
        for q in K0:
            r=kparse(q)
            if not r or r[0]!=p[0]:continue
            d=[(n,r[2].get(n),v) for n,v in p[2].items() if r[2].get(n)!=v]+([('defines',r[1],p[1])] if r[1]!=p[1] else [])+([('customKey',r[3][:40],p[3][:40])] if r[3]!=p[3] else [])
            if best is None or len(d)<len(best):best=d
            if r[3]==p[3] and (same is None or len(d)<len(same)):same=d
            if r[3]==p[3] and os.environ.get('KDIFF'):print('    vs same-key program:',d)
        print('  new',p[0],'differs from nearest by',best,'| from nearest with the same custom key by',same)
def lights(ev,where):
    n,v=ev("()=>__lc()");res.setdefault('lights',[]).append([where,n,v])
    return n
def hero(pg):
    ev=pg.evaluate;ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{window.__hp=setInterval(()=>{if(party.length)hero.hp=heroMax()},50)}")
def prog(pg):
    ev=pg.evaluate;pg.set_default_timeout(1200000)
    has=ev("()=>typeof PGW!='undefined'")
    if has:
        pg.wait_for_function("()=>PGW.done||!PGW.on",timeout=1800000,polling=1000)
        W=ev("()=>({ms:PGW.ms,work:PGW.work,frames:PGW.frames,p0:PGW.p0,p1:PGW.p1,items:PGW.n,err:PGW.err})")
        res['warm']=W;print('warm-up',json.dumps(W))
        chk('warm-up builders ran without errors',not W['err'],W['err'][:5])
    F=ev("()=>__ff");big=[f for f in F if f[1]>200]
    res['load']={'first_frame_at':F[0][0] if F else None,'frames_over_200ms':len(big),'their_ms':sum(f[1] for f in big),'progs':ev("()=>ren.info.programs.length")}
    print('load',json.dumps(res['load']))
    ev(HOOK);hero(pg)
    p0=ev("()=>ren.info.programs.length");n0=newp(ev);res['hero_new']=n0;print('programs after hero',p0,'new during hero setup',len(n0),n0[:6])
    N=lights(ev,'start');PN=ev("()=>typeof PGL!='undefined'?PGL.n:null")
    if PN is not None:chk('point lights in scene == PGL.n',N==PN,N)
    tot=[]
    for Z in ZONES:
        C=ev("(z)=>CAMPS.filter(c=>c.pm===z).map(c=>[c.x,c.z])",Z)[:NC]
        for x,z in C:
            ev("([x,z])=>{pl.position.x=x+12;pl.position.z=z;pl.step=null}",[x,z]);pg.wait_for_timeout(3500)
            n=newp(ev);tot+=n;lights(ev,'camp %d,%d'%(x,z))
            print('zone',Z,'camp',x,z,'progs',ev("()=>ren.info.programs.length"),'enemies',ev("()=>enemies.length"),'new',len(n),n[:4])
    res['camps_new']=len(tot)
    # fight: let the camp's mobs hit, kill a few (death fx + loot drops)
    r=ev("""()=>{const L=enemies.filter(e=>!e.dead&&!e.boss&&e.m.position.distanceTo(pl.position)<30).slice(0,4);L.forEach(e=>{try{hurt(e,1e7)}catch(err){}});return L.length}""")
    pg.wait_for_timeout(3000);n=newp(ev);tot+=n;print('kills',r,'new',len(n),n[:4])
    for k in ['egg','megg','potion','mat','item','sup','gear']:
        ev("(k)=>{try{drop(k,k=='gear'?{id:9e6,tp:3,lv:5,req:1,r:3,up:0,aff:[]}:null,pl.position.clone().add(new THREE.Vector3(2,0,0)),k=='gear'?3:1)}catch(err){console.log('drop',k,err.message)}}",k)
    pg.wait_for_timeout(2500);n=newp(ev);tot+=n;print('drops new',len(n),n[:4])
    ev("()=>{window.__mm=Object.keys(MOUNTS).map((k,i)=>{const m=mountModel(k);m.position.set(pl.position.x+2+i,pl.position.y,pl.position.z+3);scene.add(m);return m})}")
    pg.wait_for_timeout(2500);ev("()=>__mm.forEach(m=>scene.remove(m))");n=newp(ev);tot+=n;print('mounts new',len(n),n[:4])
    if FX:
        L=ev("()=>{const o=[];Object.keys(TAL).forEach(c=>kqsAll(c).forEach(s=>o.push([c,s.n])));return o}");fxn=[]
        if os.environ.get('FXN'):L=[a for a in L if a[1] in os.environ['FXN'].split(',')]
        for c,nm in L:
            ev("""([c,n])=>{try{kqsClear();hero.chan=null;hero.cls=c;hero.lvl=60;hero.tal['ab:'+n]=1;hero.tal.__ld=n;KQS.ck='';hero.cd={};KQS.cdn={};hero.mp=9999;hsDirty();
              const sk=heroSkills()[0];if(!sk||sk.n!==n)return;const e=enemies.find(e=>!e.dead&&!e.boss);tgt=e||tgt;cast(0);if(sk.gt&&KQS.tg){KQS.tg.p=(e?e.m.position:pl.position).clone();kqsTgFire()}}catch(err){}}""",[c,nm])
            pg.wait_for_timeout(400);n=newp(ev)
            if n:print('cast',c,nm,'new',n);fxn+=n
        pg.wait_for_timeout(3000);n=newp(ev);fxn+=n;tot+=fxn;res['fx_casts']=len(L);res['fx_new']=len(fxn);print('abilities cast',len(L),'new programs',len(fxn))
        lights(ev,'after fx')
    res['new_after_warm']=len(tot);res['progs_end']=ev("()=>ren.info.programs.length")
    if tot:kdiff(ev)
    # programs never drawn in this run (warmed for content this run did not reach, or never needed)
    U=ev("()=>{const u=new Set();__used.forEach(m=>{(Array.isArray(m)?m:[m]).forEach(q=>{const p=ren.properties.get(q).currentProgram;if(p)u.add(p)})});return ren.info.programs.filter(p=>!u.has(p)).map(p=>p.cacheKey)}")
    res['progs_not_drawn']=len(U)
    if os.environ.get('WASTE'):
        for k in U:
            p=kparse(k)
            if not p:print('  not drawn: custom',k[:60].replace('\n',' '));continue
            f={n:v for n,v in p[2].items() if n in('instancing','instancingColor','map','vertexColors','vertexAlphas','fog','flatShading','skinning','doubleSided','alphaTest','morphTargets') and v not in('false','0','')}
            print('  not drawn:',p[0],f,p[3][:50].replace('\n',' '))
    if PN is not None:
        bad=[l for l in res['lights'] if l[1]!=PN or l[2]!=PN]
        chk('point-light count constant (%d) at every check'%PN,not bad,bad[:3])
        chk('no programs compiled after the warm-up',len(tot)==0,'%d new: %s'%(len(tot),tot[:8]))
    else:print('lights (no pool in this build)',res['lights'][:3])
def shots(pg):
    ev=pg.evaluate;pg.set_default_timeout(1200000)
    if ev("()=>typeof PGW!='undefined'"):pg.wait_for_function("()=>PGW.done||!PGW.on",timeout=1800000,polling=1000)
    hero(pg);ev("()=>{clearInterval(window.__hp);window.__hp=setInterval(()=>{if(party.length)hero.hp=heroMax()},50)}")
    # town: the spot with the most lamps within 20 tiles; camp: the first Kindlelight camp
    T=ev("()=>{let b=null,bn=-1;TLAMP.forEach(l=>{const n=TLAMP.filter(q=>Math.hypot(q[0]-l[0],q[2]-l[2])<20).length;if(n>bn){bn=n;b=l}});return [b[0]+1.5,b[2]+1.5,bn]}")
    C=ev("()=>{const c=CAMPS.find(c=>c.pm===0);return [c.x+6,c.z+4]}")
    for name,(x,z) in [('town',T[:2]),('camp',C)]:
        ev("([x,z])=>{TOD=.75;pl.position.set(x,GH(x,z),z);pl.step=null;camYaw=.6;enemies.forEach(e=>{if(!e.boss)e.m.visible=false})}",[x,z])
        pg.wait_for_timeout(16000);ev("()=>{TOD=.75}");pg.wait_for_timeout(1500)
        info=ev("()=>({night:+ATM.night.toFixed(2),pool:typeof PGL!='undefined'?PGL.pool.map(l=>+l.intensity.toFixed(2)):null,src:typeof PGL!='undefined'?PGL.src.filter(s=>s.intensity>0).length:null})")
        pg.locator('#stage').screenshot(path=OUT+'/v98_%s_%s.png'%(TAG,name));print('shot',name,x,z,info)
def bench(pg):
    # render cost of the same views (software GL: relative numbers only): Duskhold at night, a Kindlelight camp
    ev=pg.evaluate;pg.set_default_timeout(1200000)
    if ev("()=>typeof PGW!='undefined'"):pg.wait_for_function("()=>PGW.done||!PGW.on",timeout=1800000,polling=1000)
    hero(pg)
    T=ev("()=>{const l=TLAMP[0];return [l[0]+1.5,l[2]+1.5]}");C=ev("()=>{const c=CAMPS.find(c=>c.pm===0);return [c.x+6,c.z+4]}")
    for name,(x,z) in [('town',T),('camp',C)]:
        ev("([x,z])=>{TOD=.75;pl.position.set(x,GH(x,z),z);pl.step=null;camYaw=.6}",[x,z]);pg.wait_for_timeout(5000)
        r=ev("""()=>{enemies.forEach(e=>{e.m.visible=false;e.hb.visible=false});const t=[];for(let i=0;i<7;i++){const a=performance.now();ren.setRenderTarget(null);ren.render(scene,cam);const gl=ren.getContext();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(4));t.push(performance.now()-a)}t.sort((a,b)=>a-b);
          let n=0;scene.traverse(o=>{if(o.isPointLight)n++});return {median_ms:+t[3].toFixed(1),min_ms:+t[0].toFixed(1),pointLights:n,calls:ren.info.render.calls}}""")
        res['bench_'+name]=r;print('bench',name,r)
def s(pg):
    {'shots':shots,'bench':bench}.get(PART,prog)(pg)
    print('RESULT',json.dumps({k:v for k,v in res.items() if k!='lights'}))
    print('lights',res.get('lights',[])[:4],'...')
    print('ALL PASS' if not res['fail'] else 'FAILED: '+', '.join(res['fail']))
play.run(s)
