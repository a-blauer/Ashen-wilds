# v168 pictures: the drill's timed repairs (Burningeye III). VIEWS=thaw,wire,rebuild,strike,hud (default all) -> <AW_TMP>/v168_<view>.png
#   thaw · wire · rebuild (the hammer raised) · strike (the hammer coming down): the hero at work on a box, the repair half done
#   (P=0.5 sets how far); hud: the drill HUD with two boxes offline. YAW=<radians> turns the camera round the hero, DIST / PITCH set it.
import play,os
VIEWS=[v for v in os.environ.get('VIEWS','').split(',') if v] or ['thaw','wire','rebuild','strike','hud']
P=float(os.environ.get('P','0.5'))
# the camera per view: [yaw from the hero's facing, distance, pitch] (YAW / DIST / PITCH override all)
CAM={'thaw':[2.3,4,.3],'wire':[-1.57,3,.1],'rebuild':[2.3,4,.3],'strike':[2.3,4,.3],'hud':[0,0,0]}
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#ztc116,#glog,#mqt143,.dn,#hint{visibility:hidden!important}')
    pg.evaluate("""async()=>{hero.iv=1e9;x2Load(Object.assign(x2Save(),{mq170:{v:151,st:0},insr:[0,0,2,0,0,0]}));const R=mq170Plan();toPos(R.con.x,R.con.z);
      for(let i=0;i<10;i++){mq170Tick(1/30,performance.now());await new Promise(r=>setTimeout(r,30))}mq170Start();const E=MQ170.E;E.trT=1e9;E.box.forEach(b=>b.tf=1e9);return 1}""")
    for v in VIEWS:
        c=CAM.get(v,[2.3,4,.3]);YAW=float(os.environ.get('YAW',c[0]));DIST=float(os.environ.get('DIST',c[1]));PITCH=float(os.environ.get('PITCH',c[2]))
        pg.evaluate("""async([v,P,YAW,DIST,PITCH])=>{dr170Close(false);const E=MQ170.E,R=mq170Plan(),hud=document.getElementById('dr170h');E.trT=1e9;
          if(v=='hud'){hud.style.visibility='';E.box.forEach((b,i)=>dr170Set(i,i==1?'fault':i==2?'frozen':'on'));E.box.forEach(b=>b.tf=1e9);E.prog=40;const P2=R.L(2,16);toPos(P2.x,P2.z);camYaw=R.g.ry;camPitch=.42;camDist=15;snapCam();
            await new Promise(r=>setTimeout(r,1500));return 1}
          const k=v=='strike'?'rebuild':v,i=k=='thaw'?2:k=='wire'?1:0,st={thaw:'frozen',wire:'fault',rebuild:'smashed'}[k];E.box.forEach((b,j)=>{if(j!==i&&b.s!=='on')dr170Set(j,'on')});dr170Set(i,'on');dr170Set(i,st);E.box.forEach(b=>b.tf=1e9);
          const B=MQ170.S.box[i];toPos(B.x+R.g.fx*1.6,B.z+R.g.fz*1.6);E.box[i].rp=P;dr170Open(i,k);
          hud.style.visibility='hidden';try{R157.value.set(0,.01)}catch(_){}(typeof fols!='undefined'?fols:[]).forEach(f=>{if(f)f.scale.setScalar(.001)});const W=MQ170.W;camYaw=W.ry+YAW;camPitch=PITCH;camDist=DIST;snapCam();
          await new Promise(r=>setTimeout(r,2500));E.box[i].rp=P;camYaw=W.ry+YAW;snapCam();
          DR170W.kT=k=='rebuild'?(v=='strike'?.6:.42):null;await new Promise(r=>setTimeout(r,1200));return 1}""",[v,P,YAW,DIST,PITCH])
        pg.wait_for_timeout(300);pg.screenshot(path=play.TMP+'/v168_'+v+'.png',timeout=600000);print('shot',v)
play.run(s,w=1100,hh=700)
