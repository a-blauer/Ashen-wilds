# v134: contact sheet of views round a field instance (ZONE=2 K=0) to look for out-of-place distant objects -> out/v134_far_<z>_<k>.jpg
import os,sys,io
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from PIL import Image
Z=int(os.environ.get('ZONE','2'));K=int(os.environ.get('K','0'));PTS=int(os.environ.get('PTS','4'));YAWS=int(os.environ.get('YAWS','4'))
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev(f"()=>{{hero.lvl=30;window.__I=PMAP[{Z}].ins[{K}];insArrive(__I);enemies.forEach(e=>{{if(e.m)e.m.visible=false}})}}");pg.wait_for_timeout(3000)
    ev("()=>{document.querySelectorAll('#zt116,.zt116,#hud,#bar').forEach(e=>e.style.visibility='hidden')}")
    tiles=[]
    if os.environ.get('TODS'):
        T=[float(v) for v in os.environ['TODS'].split(',')]
    else: T=None
    for i in range(PTS):
        for j in range(YAWS):
            if T: ev(f'()=>{{window.__TOD={T[j%len(T)]}}}')
            ev(f"()=>{{const P=__I.path,q=P[Math.floor((P.length-1)*({i}+.5)/{PTS})];toPos(q[0],q[1],{j}/{YAWS}*Math.PI*2);camPitch=.12;if(window.__TOD!=null)TOD=__TOD}}");pg.wait_for_timeout(1800)
            tiles.append(Image.open(io.BytesIO(pg.locator('#stage').screenshot(type='jpeg',quality=70))).resize((360,220)))
    W=Image.new('RGB',(360*YAWS,220*PTS))
    for n,t in enumerate(tiles):W.paste(t,((n%YAWS)*360,(n//YAWS)*220))
    W.save(play.TMP+f'/v134_far_{Z}_{K}.jpg',quality=80)
play.run(s,w=900,hh=550)
