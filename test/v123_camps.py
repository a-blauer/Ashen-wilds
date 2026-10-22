# v123: themed camp sites. Screenshots of camps from above at an angle (out/v123<TAG>_<zone>_<k>_<j>.png) and a contact sheet
# (out/v123<TAG>_sheet.png); checks: no camp signpost, every camp has a size (C.r) and a design, garrison spots are walkable.
# ZONES=0,1 picks zones, KS=0,1,2 instances, JS=0,1,2 camps. NOSHOT=1 runs only the checks.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP
ZS=[int(x) for x in os.environ.get('ZONES','0,1,2,3,4,5').split(',')]
KS=[int(x) for x in os.environ.get('KS','0,1,2').split(',')]
JS=[int(x) for x in os.environ.get('JS','0,1,2').split(',')]
TAG=os.environ.get('TAG','')
DIST=float(os.environ.get('DIST','0'))
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{TOD=.3;document.querySelectorAll('#banner,#glog,#ztc116').forEach(e=>e.style.display='none')}")
    shots=[];fails=[]
    for z in ZS:
        for k in KS:
            for j in JS:
                r=ev("""([z,k,j,D])=>{const I=PMAP[z].ins[k];insArrive(I);const L=CAMPS.filter(C=>C.ig===I.g),C=L[j];if(!C)return {err:'no camp'};
                  enemies.forEach(e=>{if(e.m)e.m.visible=false});
                  const r=C.r||12,d=D||r*.55,a=.7;toPos(C.x+Math.sin(a)*d,C.z+Math.cos(a)*d,a);camPitch=.78;camDist=Math.max(10,r*1.5);
                  if(!C.g)buildCamp(C);const y0=GH(C.x,C.z);window.FCAM={p:[C.x+Math.sin(a)*r*1.25,y0+r*1.05,C.z+Math.cos(a)*r*1.25],l:[C.x,y0,C.z]};STEP(1.2);enemies.forEach(e=>{if(e.m)e.m.visible=false});
                  let signs=0;C.g.traverse(o=>{if(o.userData&&o.userData.sign)signs++});
                  const bad=[];try{ROST.slots.forEach(s=>{if(s.camp===C&&solid(s.x,s.z))bad.push([s.x,s.z])})}catch(_){}
                  return {n:C.th.n,r:C.r,des:!!C.v123,signs,kids:C.g.children.length,bad,h0:+GH(C.x,C.z).toFixed(2)}}""",[z,k,j,DIST])
                print(z,k,j,json.dumps(r))
                if r.get('err') or r.get('signs') or r.get('bad') or not r.get('des'):fails.append((z,k,j,r))
                if not os.environ.get('NOSHOT'):
                    p=OUT+'/v123%s_%d_%d_%d.png'%(TAG,z,k,j)
                    if os.environ.get('BRIGHT'):
                        ev("()=>{STEP(.05);hemi.intensity=1.5;sun.intensity=1.8;if(scene.fog&&scene.fog.density!=null)scene.fog.density=.006;DRAW();POST.render()}");pg.locator('canvas').first.screenshot(path=p,timeout=900000,animations='disabled')
                    else:L.shot(pg,p)
                    shots.append(p)
    print('FAILS',len(fails),json.dumps(fails)[:2000])
    if shots:
        try:
            from PIL import Image
            ims=[Image.open(p) for p in shots];w,h=ims[0].size;cols=min(3,len(ims));rows=(len(ims)+cols-1)//cols
            sh=Image.new('RGB',(w*cols//2,h*rows//2))
            for i,im in enumerate(ims):sh.paste(im.resize((w//2,h//2)),((i%cols)*w//2,(i//cols)*h//2))
            sh.save(OUT+'/v123%s_sheet.png'%TAG)
        except Exception as e:print('sheet',e)
    if fails:sys.exit(1)
play.run(s,w=960,hh=560)
