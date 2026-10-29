# v168 pictures: the quest set pieces checked for low-poly / floating / sinking (owner: "bring everything up to par").
#   python3 v168_detail_look.py views.json [prefix]  -> <AW_TMP>/<prefix>_<name>.png (prefix default v168)
#   views.json: a JSON list of [name, js]; each js is the body of an async function run in the game page with the helpers
#   tick(n), go(x,z,ry), kcam(pitch,dist,yaw) (follow camera), kfree([eye],[at]) (free camera), ins(i) (go to INSL[i]'s start),
#   aim(tx,tz,ex,ez,eh,th) (a free camera at ground+eh over (ex,ez) looking at ground+th over (tx,tz); the hero waits behind it).
#   The HUD is always hidden; only the game view is captured. W/H set the window size.
import play,os,json,sys
VIEWS=json.load(open(sys.argv[1]))
PFX=sys.argv[2] if len(sys.argv)>2 else 'v168'
ONLY=[v for v in os.environ.get('ONLY','').split(',') if v]
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='body *{visibility:hidden!important} #gl,#gl *{visibility:visible!important}')
    pg.evaluate("""()=>{const r0=POST.render.bind(POST);POST.render=function(){try{const q=window.__free;if(q){cam.position.set(q[0][0],q[0][1],q[0][2]);cam.lookAt(q[1][0],q[1][1],q[1][2]);cam.updateMatrixWorld()}
        else if(window.__snap){camPitch=__snap.p;camDist=__snap.d;camYaw=__snap.y;snapCam();cam.lookAt(look);cam.updateMatrixWorld()}}catch(_){}return r0.apply(this,arguments)};
      window.__T=performance.now();window.tick=n=>{for(let i=0;i<n;i++){__T+=33;try{homeTick(1/30,__T)}catch(e){console.error(e)}}};
      window.go=(x,z,ry)=>{toPos(x,z,ry||0);tick(4)};window.kcam=(p,d,y)=>{window.__free=null;camPitch=p;camDist=d;camYaw=y;window.__snap={p,d,y};snapCam()};
      window.kfree=(e,a)=>{window.__snap=null;window.__free=[e,a]};
      // aim(tx,tz,ex,ez,eh,th): a free camera at (ex, ground+eh, ez) looking at (tx, ground+th, tz); the hero stands 5 behind the camera
      window.aim=(tx,tz,ex,ez,eh,th)=>{const dx=ex-tx,dz=ez-tz,L=Math.hypot(dx,dz)||1;toPos(ex+dx/L*5,ez+dz/L*5,Math.atan2(-dx,-dz));tick(3);kfree([ex,GH(ex,ez)+eh,ez],[tx,GH(tx,tz)+(th||0),tz])};
      window.ins=async i=>{const I=INSL[i];toPos(I.ba[0],I.ba[1]);await new Promise(r=>setTimeout(r,400));tick(6)};
      hero.hp=heroMax()*50;return 1}""")
    for name,js in VIEWS:
        if ONLY and name not in ONLY:continue
        r=pg.evaluate('async()=>{const r=await (async()=>{'+js+'\n})();enemies.slice().forEach(e=>{if(!e.boss)try{removeE(e)}catch(_){}});for(let i=0;i<30;i++)atmos(.05,performance.now());return r}')
        pg.wait_for_timeout(int(os.environ.get('WAIT','2500')));pg.locator('#gl').screenshot(path=play.TMP+'/'+PFX+'_'+name+'.png',timeout=600000);print('shot',name,json.dumps(r))
play.run(s,w=int(os.environ.get('W','1100')),hh=int(os.environ.get('H','650')))
