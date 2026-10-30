# v171 pictures: the Hilltop Ascent's trail: the camera out over the lip (OUT) and from the hillside looking out over the drop (IN).
# Output <AW_TMP>/v171a_<s>_<view>.png. SRC=<older build> for before pictures.
import play,os,json
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v169_ghost_look.py')).read().split('def s(pg):')[0].split('import play,os,json')[1])
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ab152h,#hint,#orbs,#bar,#topl,#tr,#qt,.qt{display:none!important}')
    pg.evaluate("()=>{window.__god=1;const I=INSL[31];toPos(I.x0+I.w/2,I.y0+I.h/2);return 1}");pg.wait_for_timeout(3000)
    for sv in [120,420]:
        for nm,dist,pitch,flip in [('out',11,.3,0),('in',11,.45,1)]:
            q=pg.evaluate("""(a)=>{const P=ch153Path(),s=Math.min(P.S-5,a[0]),hw=P.hw(s),h=P.at(s,0),o=P.at(s,hw+8);let yaw=Math.atan2(o[0]-h[0],o[1]-h[1]);if(a[1])yaw+=Math.PI;return {x:h[0],z:h[1],yaw,S:P.S}}""",[sv,flip])
            pg.evaluate("(a)=>{const q=a[0];toPos(q.x,q.z,a[3]);camYaw=a[3];camPitch=a[2];camDist=a[1];camDD=null;try{snapCam()}catch(_){}return 1}",[q,dist,pitch,q['yaw']]);pg.evaluate(FR,60)
            info=pg.evaluate("()=>{const c=cam.position;return {cam:[c.x,c.y,c.z].map(v=>+v.toFixed(1)),gh:+GH(c.x,c.z).toFixed(1),k:cvKey()}}")
            pg.screenshot(path=play.TMP+'/v171a_%d_%s.png'%(sv,nm),timeout=600000);print('VIEW',sv,nm,json.dumps(q),json.dumps(info))
    print('DONE')
play.run(s,w=1000,hh=620)
