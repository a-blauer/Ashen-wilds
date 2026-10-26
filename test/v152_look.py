# v152 pictures: Abeksi (the serpent city) and the Hillside Crest I cleft. VIEWS=name,... (default all); NOHUD=1 hides the HUD.
#   python3 v152_look.py   -> <AW_TMP>/v152_<view>.png
import play,os,json
VIEWS=[v for v in os.environ.get('VIEWS','').split(',') if v]
V={ # name: [plan u, v (hero spot), camYaw, camPitch, camDist, crouch]
 'breach':[14,10,3.6,.42,9,1],'breachUp':[30,18,2.2,1.05,22,0],'market':[24,34,3.9,.5,12,1],'marketUp':[80,52,3.1,1.0,30,0],'stalls':[66,48,2.4,.32,7,0],
 'dwell':[122,76,2.4,.45,10,1],'dwellUp':[74,95,3.1,1.05,28,0],'warrens':[24,120,3.9,.45,11,1],'pens':[73,146,3.1,.55,12,0],'kitchen':[122,156,2.3,.42,11,1],
 'kitchenUp':[76,166,3.14,.85,18,0],'gate':[24,184,4.3,.45,11,1],'gateUp':[78,182,3.14,.9,20,0],'cleft':None}
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if os.environ.get('NOHUD'):pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ab152h,#hint{display:none!important}')
    pg.evaluate("()=>{AB152Q.st=1;ab152Enter();return 1}");pg.wait_for_timeout(1500)
    for k,q in V.items():
        if VIEWS and k not in VIEWS:continue
        if q is None:
            pg.evaluate("""async()=>{const I=INSL[5];toPos(I.ba[0],I.ba[1]);await new Promise(r=>setTimeout(r,600));for(let i=0;i<6;i++)homeTick(1/30,performance.now());const G=SP152.gates.abeksi,s=G.spot;
              toPos(s.x-s.ux*7,s.z-s.uz*7,s.ry+Math.PI);camPitch=.35;camDist=9;snapCam();for(let i=0;i<40;i++)atmos(.05,performance.now());return 1}""")
        else:
            pg.evaluate("""async(q)=>{const I=INSL[30];if(!ab152In()){ab152Restart(false)}const [u,v,y,p,d,c]=q;toPos(I.x0+u,I.y0+v,y);camPitch=p;camDist=d;ab152SetCrouch(!!c);AB152H.crK=c?1:0;
              for(let i=0;i<8;i++)homeTick(1/30,performance.now()+i*33);for(let i=0;i<40;i++)atmos(.05,performance.now());snapCam();return 1}""",q)
        pg.wait_for_timeout(3500)
        pg.screenshot(path=play.TMP+'/v152_'+k+'.png',timeout=600000);print('shot',k)
play.run(s,w=1280,hh=760)
