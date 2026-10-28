# v164 pictures: the Abeksi city gate (3230), from a free camera. ALARM=1 rings the bell first (doors open, beacon, arrows).
#   python3 v164_gate_look.py -> <AW_TMP>/v164_gate_<view>[_al].png     VIEWS=name,... picks views
import play,os
VIEWS=[v for v in os.environ.get('VIEWS','').split(',') if v]
AL=bool(os.environ.get('ALARM'))
# name: hero plan spot [u,v], camera plan [u,v,height above ground], look-at plan [u,v,height]
V={'front':[[74.5,170],[74.5,182.8,1.6],[74.5,187,4.6]],'over':[[74.5,170],[74.5,176,17],[74.5,186,3]],
   'side':[[60,176],[57,184.6,4.5],[74.5,186,4.2]],'sideR':[[60,176],[93,184.4,4.5],[74.5,186,4.2]],'doors':[[74.5,170],[74.5,183.4,2.0],[74.5,187.4,2.6]],
   'far':[[74.5,150],[74.5,140,30],[74.5,186,4]],'hero':[[74.5,184],None,None],'trail':[[34,184.5],None,None]}
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ab152h,#hint,#ab157al{display:none!important}')
    pg.evaluate("""()=>{AB152Q.st=1;ab152Enter();
      const f=POST.render;POST.render=function(){try{if(window.CAMO){const I=INSL[30],o=window.CAMO,X=I.x0,Y=I.y0;cam.position.set(X+o.p[0],GH(X+o.p[0],Y+o.p[1])+o.p[2],Y+o.p[1]);
        cam.lookAt(X+o.t[0],GH(X+o.t[0],Y+o.t[1])+o.t[2],Y+o.t[1]);cam.updateMatrixWorld(true)}}catch(e){}return f.apply(this,arguments)};return 1}""")
    pg.wait_for_timeout(4500)
    for k,q in V.items():
        if VIEWS and k not in VIEWS:continue
        pg.evaluate("""(q)=>{const I=INSL[30];if(!ab152In())ab152Restart(false);AB152H.frz=1;toPos(I.x0+q[0][0],I.y0+q[0][1],Math.PI);window.CAMO=q[1]?{p:q[1],t:q[2]}:null;
          if(q[3])window.CAMO=null;return 1}""",[q[0],q[1],q[2],k in ('hero','trail')])
        if k in ('hero','trail'):pg.evaluate("(k)=>{camYaw=k=='trail'?-Math.PI/2:Math.PI;camPitch=k=='trail'?.62:.42;camDist=k=='trail'?14:11;snapCam();camK=camPitch;camDD=camDist;return 1}",k)
        if AL:pg.evaluate("()=>{if(!AB157A.on)ab157Alarm();const t0=performance.now();for(let i=0;i<150;i++){try{ab152WorldTick(1/30,t0+i*33)}catch(e){}}hero.hp=heroMax();return 1}")
        pg.wait_for_timeout(3000)
        pg.screenshot(path=play.TMP+'/v164_gate_'+k+('_al' if AL else '')+'.png',timeout=600000);print('shot',k)
play.run(s,w=1280,hh=760)
