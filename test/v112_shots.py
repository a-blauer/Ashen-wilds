# v112: screenshots of every zone's field instances I, II and III from the hero's view (out/v112_<zone>_<k>.png),
# plus a contact sheet out/v112_sheet.png. ZONES=0,1 picks zones, KS=1,2 picks instances, F=0.35 the spot along the road.
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP
ZS=[int(x) for x in os.environ.get('ZONES','0,1,2,3,4,5').split(',')]
KS=[int(x) for x in os.environ.get('KS','0,1,2').split(',')]
FS=[float(x) for x in os.environ.get('F','0.35').split(',')]
TAG=os.environ.get('TAG','')
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{TOD=.3;document.querySelectorAll('#banner,#glog').forEach(e=>e.style.display='none')}")
    shots=[]
    for z in ZS:
        for k in KS:
            for fi,f in enumerate(FS):
                r=ev("""([z,k,f])=>{const I=PMAP[z].ins[k];insArrive(I);const P=I.path,i=Math.max(20,Math.floor((P.length-30)*f)),q=P[i],b=P[i-14];
                  toPos(q[0],q[1],Math.atan2(b[0]-q[0],b[1]-q[1]));camPitch=.3;camDist=8.5;rosterTick();STEP(2.5);
                  return [I.n,Math.round(scene.fog.density*1000)/1000,'#'+scene.fog.color.getHexString()]}""",[z,k,f])
                p=OUT+'/v112%s_%d_%d%s.png'%(TAG,z,k,'' if fi==0 else '_%d'%fi);L.shot(pg,p);shots.append(p);print(r,p)
    try:
        from PIL import Image
        ims=[Image.open(p) for p in shots];w,h=ims[0].size;cols=len(KS)*len(FS);rows=(len(ims)+cols-1)//cols
        sh=Image.new('RGB',(w*cols//2,h*rows//2))
        for i,im in enumerate(ims):sh.paste(im.resize((w//2,h//2)),((i%cols)*w//2,(i//cols)*h//2))
        sh.save(OUT+'/v112%s_sheet.png'%TAG)
    except Exception as e:print('sheet',e)
play.run(s,w=960,hh=560)
