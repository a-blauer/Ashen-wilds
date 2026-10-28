# v164: camp pictures. For each picked camp: an overview from high above at an angle (out/v164<TAG>_<z>_<k>_<j>_a.png) and a
# ground-level view from outside the gate (…_g.png), well lit (BRIGHT=0 keeps the zone's own light), plus contact sheets
# out/v164<TAG>_sheet_a.png / _g.png. ZONES=, KS=, JS= pick camps (default: camp 0 of every field instance of every zone).
# VIEWS=a,g picks the views. SRC=<old build> TAG=_before for before/after.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP
ZS=[int(x) for x in os.environ.get('ZONES','0,1,2,3,4,5').split(',')]
KS=[int(x) for x in os.environ.get('KS','0').split(',')]
JS=[int(x) for x in os.environ.get('JS','0').split(',')]
VIEWS=os.environ.get('VIEWS','a,g').split(',')
TAG=os.environ.get('TAG','')
BRIGHT=os.environ.get('BRIGHT','1')!='0'
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{TOD=.3;document.querySelectorAll('#banner,#glog,#ztc116,#mqt143,#chqt132').forEach(e=>e.style.display='none')}")
    shots={v:[] for v in VIEWS}
    for z in ZS:
        for k in KS:
            for j in JS:
                for v in VIEWS:
                    r=ev("""([z,k,j,v])=>{const I=PMAP[z].ins[k];insArrive(I);const C=CAMPS.filter(C=>C.ig===I.g)[j];if(!C)return {err:'no camp'};
                      const r=C.r||12,y0=GH(C.x,C.z),o=C.site,ga=o&&o.gates&&o.gates.length?o.gates[0]:C.ang;
                      if(v=='a'){const a=ga+.9;toPos(C.x+Math.cos(a)*r*.5,C.z+Math.sin(a)*r*.5);window.FCAM={p:[C.x+Math.cos(a)*r*1.05,y0+r*1.25,C.z+Math.sin(a)*r*1.05],l:[C.x-Math.cos(a)*r*.12,y0,C.z-Math.sin(a)*r*.12],nf:1}}
                      else{const d=(o?o.rf:r*.8)+4.5,px=C.x+Math.cos(ga+.25)*d,pz=C.z+Math.sin(ga+.25)*d;toPos(px,pz);window.FCAM={p:[px,GH(px,pz)+2.3,pz],l:[C.x,y0+1.2,C.z]}}
                      if(!C.g)buildCamp(C);STEP(1.2);enemies.forEach(e=>{if(e.m)e.m.visible=false});pl.visible=false;fols.forEach(f=>{if(f)f.visible=false});
                      return {n:C.th.n,r:C.r,r0:C.r0,st:CS164.st[C.key]||null}}""",[z,k,j,v])
                    print(z,k,j,v,json.dumps(r),flush=True)
                    if r.get('err'):continue
                    p=OUT+'/v164%s_%d_%d_%d_%s.png'%(TAG,z,k,j,v)
                    if BRIGHT:ev("()=>{STEP(.05);hemi.intensity=1.5;sun.intensity=1.8;if(scene.fog&&scene.fog.density!=null)scene.fog.density=Math.min(scene.fog.density,.006);DRAW();POST.render()}")
                    else:ev("()=>{STEP(.05,1)}")
                    pg.locator('canvas').first.screenshot(path=p,timeout=900000,animations='disabled');shots[v].append(p)
    try:
        from PIL import Image
        for v,L2 in shots.items():
            if not L2:continue
            ims=[Image.open(p) for p in L2];w,h=ims[0].size;cols=min(3,len(ims));rows=(len(ims)+cols-1)//cols
            sh=Image.new('RGB',(w*cols//2,h*rows//2))
            for i,im in enumerate(ims):sh.paste(im.resize((w//2,h//2)),((i%cols)*w//2,(i//cols)*h//2))
            sh.save(OUT+'/v164%s_sheet_%s.png'%(TAG,v))
    except Exception as e:print('sheet',e)
play.run(s,w=960,hh=560)
