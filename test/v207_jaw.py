# v207 pictures: Skarrith's head while it emerges at the start of the Hilltop Ascent (close views of the jaw). -> <AW_TMP>/v207_jaw_<t>_<view>.png
import play,os
TS=[float(x) for x in os.environ.get('TS','0.85,1.05,1.3,1.6').split(',')]
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ch153h,#ch153g,#hint,#ztc116,#banner{display:none!important}')
    pg.evaluate("()=>{newMount(MNTK[0]);const r0=POST.render.bind(POST);POST.render=function(){try{const c=window.__cam;if(c){cam.position.set(c.p[0],c.p[1],c.p[2]);cam.lookAt(c.t[0],c.t[1],c.t[2]);cam.updateMatrixWorld(true)}}catch(_){}return r0.apply(this,arguments)};return 1}")
    pg.evaluate("async()=>{if(!ch153In()){ch153Enter();await new Promise(r=>setTimeout(r,1500))}return 1}")
    for t in TS:
        for view in ['side','front']:
            pg.evaluate("""([t,view])=>{const R=CH153.R;ch153Reset(true);let T=performance.now();R.t=0;
                for(let i=0;i<Math.round(t*30);i++){T+=33;CH153.R.t=i/30;homeTick(1/30,T)}
                const M=CH153.S.sn,h=new THREE.Vector3();M.head.getWorldPosition(h);const P=CH153.S.P,yw=P.yaw(0);
                const fx=Math.sin(yw),fz=Math.cos(yw),sx=Math.cos(yw),sz=-Math.sin(yw);
                const off=view=='side'?[sx*7,1.2,sz*7]:[fx*6+sx*2,1.5,fz*6+sz*2];
                window.__cam={p:[h.x+off[0],h.y+off[1],h.z+off[2]],t:[h.x,h.y-.4,h.z]};return [h.x,h.y,h.z,M.jaw.rotation.x]}""",[t,view])
            pg.wait_for_timeout(2500);pg.screenshot(path=play.TMP+'/v207_jaw_%s_%s.png'%(t,view),timeout=600000);print('shot',t,view)
play.run(s,w=900,hh=640)
