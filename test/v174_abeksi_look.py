# v174 pictures: an Abeksi street with several houses between the camera and the hero (the owner's spot, 142, 1559), from a few
# camera angles; also the Duskhold building and a cave wall. Output <AW_TMP>/v174_<name>.png. SRC=<older build> for before pictures.
# Prints how much of the hero shows (FAIL when the hero box differs too little from the same view with the window off).
import play,os,json
from PIL import Image
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v169_ghost_look.py')).read().split('def s(pg):')[0].split('import play,os,json')[1])
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ab152h,#hint,#orbs,#bar,#topl,#tr,#qt,.qt{display:none!important}')
    pg.evaluate("()=>{window.__god=1;toPos(142.01,1559.24);return 1}");pg.wait_for_timeout(5000)
    st=pg.evaluate("()=>{const r=$('stage').getBoundingClientRect();return [r.left,r.top,r.width,r.height]}")
    BOX=r"""(st)=>{const P=pl.position,v=new THREE.Vector3(),xs=[],ys=[];for(const h of [.2,1,1.8])for(const [dx,dz] of [[-.35,0],[.35,0],[0,-.35],[0,.35]]){v.set(P.x+dx,P.y+h,P.z+dz).project(cam);xs.push(st[0]+(v.x+1)/2*st[2]);ys.push(st[1]+(1-v.y)/2*st[3])}
      return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)].map(Math.round)}"""
    pg.evaluate("()=>{window.__rr=[R157.value.x,R157.value.y,N157.value.x,N157.value.y];return 1}")
    for i,yaw in enumerate([3.53,2.75,3.93,1.96]):
        pg.evaluate("(a)=>{toPos(142.01,1559.24,a[0]);camYaw=a[0];camPitch=.35;camDist=9.5;camDD=null;try{snapCam()}catch(_){}return 1}",[yaw]);pg.evaluate(FR,60)
        p=play.TMP+'/v174_ab%d.png'%i;pg.screenshot(path=p,timeout=600000);on=Image.open(p).convert('L')
        pg.evaluate("()=>{R157.value.set(-2,-1);N157.value.set(-2,-1);return 1}");pg.evaluate(FR,5)
        p2=play.TMP+'/v174_ab%d_solid.png'%i;pg.screenshot(path=p2,timeout=600000);off=Image.open(p2).convert('L')
        pg.evaluate("()=>{const r=window.__rr;R157.value.set(r[0],r[1]);N157.value.set(r[2],r[3]);return 1}")
        b=pg.evaluate(BOX,st);a=on.crop(tuple(b));c=off.crop(tuple(b))
        dd=sum(abs(x-y) for x,y in zip(a.tobytes(),c.tobytes()))/max(1,a.size[0]*a.size[1])
        print('VIEW ab%d yaw %.2f hero box'%(i,yaw),b,'window vs none',round(dd,1))
    print('DONE')
play.run(s,w=1000,hh=620)
