# v205 pictures: the Citadel main quest. VIEWS=name,... -> <AW_TMP>/v205_<view>.png  (NOHUD=1 hides the HUD)
#   g1 (the gateway of Citadel I, from the road) · g2 · g3 · plus the quest views added in 3740+ (V205X)
import play,os
VIEWS=[v for v in os.environ.get('VIEWS','g1,g2,g3').split(',') if v]
SETUP=r"""()=>{const r0=POST.render.bind(POST);POST.render=function(){try{if(window.__snap){camPitch=__snap.p;camDist=__snap.d;camYaw=__snap.y;snapCam();cam.lookAt(look);cam.updateMatrixWorld();}}catch(_){}return r0.apply(this,arguments)};
  window.TK205=n=>{let T=performance.now();for(let i=0;i<n;i++){T+=33;try{homeTick(1/30,T)}catch(e){console.error(e)}try{kqFxTick(1/30)}catch(_){}}};window.ERRS=[];const oe=console.error;console.error=(...a)=>{ERRS.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  hero.hp=heroMax()*50;CHEAT.god=true;return 1}"""
VIEW=r"""async(k)=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));let p=.42,d=12,y=0;
  const goG=async(g,back)=>{const I=INSL[g],P=I.path,q=P[Math.max(0,P.length-1-(back||14))];toPos(q[0],q[1]);await wait(400);TK205(6);return Math.atan2(q[0]-I.ba[0],q[1]-I.ba[1])};
  if(k=='g1'){y=await goG(25,22);p=.3;d=16}
  if(k=='g2'){y=await goG(26,22);p=.3;d=16}
  if(k=='g3'){y=await goG(27,22);p=.3;d=16}
  if(window.V205X){const r=await V205X(k);if(r){p=r[0];d=r[1];y=r[2]}}
  for(let i=0;i<40;i++)atmos(.05,performance.now());camPitch=p;camDist=d;camYaw=y;window.__snap={p,d,y};snapCam();return ERRS.slice(0,5)}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if os.environ.get('NOHUD'):pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#mqt143,#glog,#pk,#chqt132,#locBox,.dn,#hint,#guide,header,.hdr,#pf,#orbs,#bar{display:none!important}')
    pg.evaluate(SETUP)
    for k in VIEWS:
        r=pg.evaluate(VIEW,k)
        pg.wait_for_timeout(int(os.environ.get('SETTLE','2500')));pg.screenshot(path=play.TMP+'/v205_'+k+'.png',timeout=600000);print('shot',k,r)
play.run(s,w=1100,hh=650)
