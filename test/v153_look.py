# v153 pictures: the Hilltop Ascent. VIEWS=name,... (default all) -> <AW_TMP>/v153_<view>.png
#   road (Mistmere's hill road) · intro (Skarrith comes down) · run (riding, the snake behind) · venom (a volley landing ahead)
#   strike · bridge · tunnel · crack (the finish) · snake (a side view of the serpent) · swallow
import play,os
VIEWS=[v for v in os.environ.get('VIEWS','').split(',') if v]
V={'road':None,'intro':[6,'intro',2.2],'run':[70,'run',0],'venom':[260,'venom',0],'strike':[320,'strike',0],'bridge':[430,'run',0],'tunnel':[640,'run',0],'crack':[900,'run',0],'snake':[200,'side',0],'swallow':[150,'swallow',0]}
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if os.environ.get('NOHUD'):pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ch153h,#ch153g,#hint{display:none!important}')
    pg.evaluate("()=>{newMount(MNTK[0]);return 1}")
    # headless frames are ~1 s apart, so the game's smooth camera never catches up: snap it into place before every frame
    pg.evaluate("()=>{const r0=POST.render.bind(POST);POST.render=function(){try{if(window.__snap){const k=[camPitch,camDist];if(ch153Run()&&CH153.S){const R=CH153.R,P=CH153.S.P,yw=P.yaw(R.s),gap=R.s-R.sn.s;camPitch=window.__snap.p??camPitch;camDist=window.__snap.d??camDist;camYaw=window.__snap.y!=null?yw+window.__snap.y:camYaw}snapCam();cam.lookAt(look);cam.updateMatrixWorld();camPitch=k[0];camDist=k[1]}}catch(_){}return r0.apply(this,arguments)};return 1}")
    for k,q in V.items():
        if VIEWS and k not in VIEWS:continue
        if q is None:
            pg.evaluate("""async()=>{const I=INSL[6];toPos(I.ba[0],I.ba[1]);await new Promise(r=>setTimeout(r,600));for(let i=0;i<6;i++)homeTick(1/30,performance.now());const G=SP152.gates.ascent,s=G.spot;
              toPos(s.x-s.ux*5,s.z-s.uz*5,s.ry);camPitch=.3;camDist=10;snapCam();for(let i=0;i<40;i++)atmos(.05,performance.now());return 1}""")
        else:
            pg.evaluate("""async(q)=>{if(!ch153In()){ch153Enter();await new Promise(r=>setTimeout(r,1300))}let T=performance.now();const tick=n=>{for(let i=0;i<n;i++){T+=33;homeTick(1/30,T)}};
              const R=CH153.R,P=CH153.S.P;const [s,mode,t]=q;
              if(mode=='intro'){ch153Reset(true);R.t=0;CH153.R.t=t;tick(3)}
              else{const r=CH153.R;r.ph='run';r.t=5;r.s=s;r.o=0;r.sn.s=s-11;r.sn.strike=null;r.inv=9;tick(12);
                if(mode=='venom'){ch153Spit(3);tick(18)}if(mode=='strike'){r.sn.strike={t:.7,o:r.o,s0:r.sn.s};tick(7)}
                if(mode=='swallow'){r.inv=0;r.sn.s=r.s-2.4;tick(14)}}
              const r=CH153.R,yw=P.yaw(r.s);if(mode=='side'){camYaw=yw+Math.PI/2*P.sgn;camPitch=.5;camDist=26}else if(mode=='intro'){camYaw=yw-.25*P.sgn;camPitch=.16;camDist=22}else if(mode=='swallow'){camYaw=yw+.9;camPitch=.45;camDist=8}else{const gp=r.s-r.sn.s,dh=Math.max(3.8,Math.min(8.8,gp-5.6));camYaw=yw+Math.PI;camPitch=.34;camDist=dh/Math.cos(.34)}
              for(let i=0;i<40;i++)atmos(.05,performance.now());window.__snap={p:camPitch,d:camDist,y:camYaw-P.yaw(r.s)};snapCam();camK=camPitch;camDD=camDist;return 1}""",q)
        pg.wait_for_timeout(3500);pg.screenshot(path=play.TMP+'/v153_'+k+'.png',timeout=600000);print('shot',k)
play.run(s,w=1280,hh=760)
