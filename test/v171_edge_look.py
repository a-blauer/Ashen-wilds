# v171 pictures: the rock past each instance's edge. For each instance (GKS=0,7,... default a spread of zones and kinds): looking
# out at the edge from inside the field ('in'), and the camera pushed out past the edge ('out'). Output <AW_TMP>/v171e_<g>_<view>.png
# and a contact sheet v171e_sheet.png. SRC=<older build> for before pictures.
import play,os,json
from PIL import Image
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v169_ghost_look.py')).read().split('def s(pg):')[0].split('import play,os,json')[1])
GKS=[int(x) for x in os.environ.get('GKS','0,1,7,12,17,22,25,3,30').split(',') if x]
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ab152h,#hint,#orbs,#bar,#topl,#tr,#qt,.qt{display:none!important}')
    pg.evaluate("()=>{window.__god=1;return 1}")
    shots=[]
    for gk in GKS:
        q=pg.evaluate(EDGE,gk);pg.wait_for_timeout(2500)
        if not q:print('FAIL no edge spot',gk);continue
        for nm,dist,pitch,yaw in [('in',12,.38,q['yaw']+3.14159),('out',12,.3,q['yaw']),('high',15,.95,q['yaw'])]:
            pg.evaluate("(a)=>{const q=a[0];toPos(q.x,q.z,a[3]);camYaw=a[3];camPitch=a[2];camDist=a[1];camDD=null;try{snapCam()}catch(_){}return 1}",[q,dist,pitch,yaw]);pg.evaluate(FR,60)
            info=pg.evaluate("()=>{const c=cam.position;return {cam:[c.x,c.y,c.z].map(v=>+v.toFixed(1)),under:window.GH171?GH171.under:null,t:GH169.U.uGhT?+GH169.U.uGhT.value.toFixed(2):null}}")
            p=play.TMP+'/v171e_%d_%s.png'%(gk,nm);pg.screenshot(path=p,timeout=600000);shots.append((gk,nm,p));print('VIEW',gk,nm,json.dumps(q),json.dumps(info))
    W,Hh=330,205;sh=Image.new('RGB',(W*3,Hh*((len(shots)+2)//3)))
    for i,(gk,nm,p) in enumerate(shots):
        im=Image.open(p).convert('RGB').crop((12,112,988,620)).resize((W,Hh));sh.paste(im,((i%3)*W,(i//3)*Hh))
    sh.save(play.TMP+'/v171e_sheet.png');print('DONE')
play.run(s,w=1000,hh=620)
