# v207 pictures: the Trading Post sign, a Kindlelight carcass (Maggot Nest), the Seeping Lair's ladder. VIEWS=post,carcass,ladder -> <AW_TMP>/v207_<view>.png
import play,os
VIEWS=[v for v in os.environ.get('VIEWS','post,carcass,ladder').split(',') if v]
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#hint,#ztc116,#banner{display:none!important}')
    pg.evaluate("()=>{const r0=POST.render.bind(POST);POST.render=function(){try{const c=window.__cam;if(c){cam.position.set(c.p[0],c.p[1],c.p[2]);cam.lookAt(c.t[0],c.t[1],c.t[2]);cam.updateMatrixWorld(true)}}catch(_){}return r0.apply(this,arguments)};return 1}")
    for v in VIEWS:
        if v=='post':
            r=pg.evaluate("""async()=>{recallTown&&curMap()!=-1&&recallTown();await new Promise(r=>setTimeout(r,800));const l=dm196Fix('post');dm196Post();const T=TOWNS[0];
              const [ex,ez]=lotW103(l,1.2,9.5),[tx,tz]=lotW103(l,0,1.4);toPos(...lotW103(l,0,6));const y=T.ph;window.__cam={p:[ex,y+3.2,ez],t:[tx,y+2.6,tz]};return [ex,ez,y]}""")
        elif v=='carcass':
            r=pg.evaluate("""async()=>{insArrive(PMAP[0].ins[0]);await new Promise(r=>setTimeout(r,800));const C=CAMPS.find(C=>C.key=='0_0_1');buildCamp(C);C.g.visible=true;toPos(C.x+6,C.z+6);
              for(let i=0;i<20;i++)homeTick(1/30,performance.now());enemies.forEach(e=>{if(Math.hypot(e.m.position.x-C.x,e.m.position.z-C.z)<30)e.m.visible=false});
              const y=GH(C.x,C.z);window.__cam={p:[C.x+4.5,y+3.2,C.z+4.5],t:[C.x,y+.6,C.z]};return [C.x,C.z]}""")
        elif v=='ladder':
            r=pg.evaluate("""async()=>{const L=MB144L;toPos(L.ent.x,L.ent.z,0);await new Promise(r=>setTimeout(r,800));let c=performance.now();for(let i=0;i<10;i++){c+=33;mq144Tick(1/30,c)}
              if(typeof mb144LairBuild=='function')mb144LairBuild();if(MQ144.e)MQ144.e.m.visible=false;const l=L.lad,y=GH(l.x,l.z);window.__cam={p:[l.x+4.5,y+3.6,l.z-6.5],t:[l.x,y+2.8,l.z+.8]};return [l.x,l.z,!!MQ144.LS]}""")
        print(v,r)
        pg.wait_for_timeout(3500);pg.screenshot(path=play.TMP+'/v207_'+v+'.png',timeout=600000);print('shot',v)
play.run(s,w=900,hh=640)
