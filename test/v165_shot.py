# v165 picture helper: VIEWS file (JSON list of [name, js]) -> <AW_TMP>/v165_<name>.png
#   each js is the body of an async function run in the game page (helpers: tick(n), go(x,z,ry), kcam(pitch,dist,yaw), kfree(eye,at));
#   it may return a value (printed). NOHUD=1 hides the HUD. W/H set the window size.
import play,os,json,sys
VIEWS=json.load(open(sys.argv[1]))
PRE=os.environ.get('PRE','')
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if os.environ.get('NOHUD'):pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#mqt143,#glog,#pk,#chqt132,#locBox,.dn,#hint,#guide,#pf,#orbs,#bar,#boss,#ztc116{display:none!important}')
    pg.evaluate("""()=>{const r0=POST.render.bind(POST);POST.render=function(){try{if(window.__fog!=null&&scene.fog)scene.fog.density=window.__fog;const q=window.__free;if(q){cam.position.set(q[0][0],q[0][1],q[0][2]);cam.lookAt(q[1][0],q[1][1],q[1][2]);cam.updateMatrixWorld()}
        else if(window.__snap){camPitch=__snap.p;camDist=__snap.d;camYaw=__snap.y;snapCam();cam.lookAt(look);cam.updateMatrixWorld()}}catch(_){}return r0.apply(this,arguments)};
      window.__T=performance.now();window.tick=n=>{for(let i=0;i<n;i++){__T+=33;homeTick(1/30,__T)}};
      window.go=(x,z,ry)=>{toPos(x,z,ry||0);tick(4)};window.kcam=(p,d,y)=>{window.__free=null;camPitch=p;camDist=d;camYaw=y;window.__snap={p,d,y};snapCam()};
      window.kfree=(e,a)=>{window.__snap=null;window.__free=[e,a]};return 1}""")
    if PRE:print('PRE',pg.evaluate('async()=>{'+PRE+'}'))
    for name,js in VIEWS:
        r=pg.evaluate('async()=>{const r=await (async()=>{'+js+'\n})();for(let i=0;i<30;i++)atmos(.05,performance.now());return r}')
        pg.wait_for_timeout(int(os.environ.get('WAIT','3000')));pg.screenshot(path=play.TMP+'/v165_'+name+'.png',timeout=600000);print('shot',name,json.dumps(r))
play.run(s,w=int(os.environ.get('W','1280')),hh=int(os.environ.get('H','760')))
