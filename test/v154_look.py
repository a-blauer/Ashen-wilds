# v154 pictures: the Gate of the Hydra. VIEWS=name,... (default all) -> <AW_TMP>/v154_<view>.png
#   door (shut, from the clearing) · stone (a Wind Stone, wind off) · winds (all five ribbons flowing to the door) · song (a head and its chime lit) · open (the doors open on the oasis light)
import play,os
VIEWS=[v for v in os.environ.get('VIEWS','').split(',') if v]
V=['door','heads','stone','winds','song','open']
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if os.environ.get('NOHUD'):pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#hint,#guide,header,.hdr,#pf,#orbs,#bar{display:none!important}')
    pg.evaluate("()=>{const r0=POST.render.bind(POST);POST.render=function(){try{if(window.__snap){const k=[camPitch,camDist,camYaw];camPitch=__snap.p;camDist=__snap.d;camYaw=__snap.y;snapCam();cam.lookAt(look);cam.updateMatrixWorld();}}catch(_){}return r0.apply(this,arguments)};return 1}")
    pg.evaluate("""async()=>{const I=INSL[7];toPos(I.ba[0],I.ba[1]);await new Promise(r=>setTimeout(r,600));for(let i=0;i<6;i++)homeTick(1/30,performance.now());return 1}""")
    for k in V:
        if VIEWS and k not in VIEWS:continue
        pg.evaluate("""async(k)=>{let T=performance.now();const tick=n=>{for(let i=0;i<n;i++){T+=33;homeTick(1/30,T)}};const Pl=hd154Plan(),D=Pl.door,S=HD154.S;const yawTo=(x,z)=>Math.atan2(x-pl.position.x,z-pl.position.z);
          const on=v=>{HD154.vane=Pl.st.map((o,j)=>v?o.want:(o.want+3)%8);HD154.on=HD154.vane.map((x,j)=>x===Pl.st[j].want?1:0);hd154Sync()};
          let p=.22,d=22,y=D.ry;
          if(k=='door'){HD154.st=0;HD154.v=0;HD154.song=null;on(0);toPos(D.x-D.ux*16,D.z-D.uz*16,D.ry);p=.12;d=10}
          if(k=='heads'){on(1);toPos(D.x-D.ux*9,D.z-D.uz*9,D.ry);p=.5;d=16}
          if(k=='stone'){on(0);const o=Pl.st[2];toPos(o.x-3,o.z+4);y=yawTo(o.x,o.z)+Math.PI;p=.2;d=7}
          if(k=='winds'){on(1);const o=Pl.st[4];toPos(o.x+(o.x-D.x)*.2,o.z+(o.z-D.z)*.2);y=yawTo(D.x,D.z);p=.38;d=30;tick(50)}
          if(k=='song'){on(1);HD154.song={seq:[2],i:0,t:0,mode:'play',in:0};S.heads[2].f=1;S.chimes[2].f=1;toPos(D.x-D.ux*12,D.z-D.uz*12,D.ry);p=.2;d=9;tick(2)}
          if(k=='open'){on(1);HD154.song=null;HD154.v=3;hd154Open();tick(200);toPos(D.x-D.ux*14,D.z-D.uz*14,D.ry);p=.14;d=9}
          for(let i=0;i<40;i++)atmos(.05,performance.now());camPitch=p;camDist=d;camYaw=y;window.__snap={p,d,y};snapCam();return 1}""",k)
        pg.wait_for_timeout(3500);pg.screenshot(path=play.TMP+'/v154_'+k+'.png',timeout=600000);print('shot',k)
play.run(s,w=1280,hh=760)
