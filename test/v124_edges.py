# v124: screenshots of the map edge (rim) of every zone instance, looking from the walkable ground at the rim.
# out/v124<TAG>_<zone>_<k>[_n].png plus a contact sheet out/v124<TAG>_sheet.png.
# ZONES=0,1 picks zones, KS=0,1,2,3 the instances (3 = the Den), F=0.3,0.7 the spots along the road.
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP
ZS=[int(x) for x in os.environ.get('ZONES','0,1,2,3,4,5').split(',')]
KS=[int(x) for x in os.environ.get('KS','0,1,2').split(',')]
FS=[float(x) for x in os.environ.get('F','0.3').split(',')]
TAG=os.environ.get('TAG','')
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{TOD=.3;document.querySelectorAll('#banner,#glog').forEach(e=>e.style.display='none')}")
    shots=[]
    for z in ZS:
        for k in KS:
            for fi,f in enumerate(FS):
                r=ev("""([z,k,f])=>{const I=PMAP[z].ins[k];insArrive(I);const P=I.path,i=Math.max(4,Math.min(P.length-5,Math.floor(P.length*f))),q=P[i],b=P[Math.max(0,i-4)],c=P[Math.min(P.length-1,i+4)];
                  const GROVE=GRV;const walk=t=>t=='.'||t=='g'||t=='a'||t=='r'||t=='~'||t=='p';
                  let dx=c[0]-b[0],dy=c[1]-b[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
                  let best=null;for(const sd of [1,-1]){const nx=-dy*sd,ny=dx*sd;for(let s=0;s<40;s++){const x=Math.round(q[0]+nx*s),y=Math.round(q[1]+ny*s);if(!walk(MAP[y]&&MAP[y][x])){if(!best||s<best.s)best={s,nx,ny,x,y};break}}}
                  if(GROVE){best=null;for(let y=I.y0;y<I.y0+I.h&&!best;y++)for(let x=I.x0;x<I.x0+I.w;x++)if(MAP[y][x]=='#'&&MAP.DW[y*W+x]<0){best={s:0,nx:0,ny:1,x,y};break}}
                  if(!best)return 'no edge';
                  const hx=best.x-best.nx*9,hz=best.y-best.ny*9;toPos(hx,hz,Math.atan2(-best.nx,-best.ny));rosterTick();
                  window.FCAM=null;STEP(1.5);
                  const g=GH(hx,hz);FC([hx-best.nx*3,g+4.5,hz-best.ny*3],[best.x+best.nx*2,GH(best.x,best.y)+2.5,best.y+best.ny*2]);STEP(.3);
                  return [I.n,best.x,best.y,MAP[best.y][best.x]]}""".replace("GRV","1" if os.environ.get("GROVE") else "0"),[z,k,f])
                p=OUT+'/v124%s_%d_%d%s.png'%(TAG,z,k,'' if fi==0 else '_%d'%fi);L.shot(pg,p);shots.append(p);print(r,p,flush=True)
    try:
        from PIL import Image
        ims=[Image.open(p) for p in shots];w,h=ims[0].size;cols=len(KS)*len(FS);rows=(len(ims)+cols-1)//cols
        sh=Image.new('RGB',(w*cols//2,h*rows//2))
        for i,im in enumerate(ims):sh.paste(im.resize((w//2,h//2)),((i%cols)*w//2,(i//cols)*h//2))
        sh.save(OUT+'/v124%s_sheet.png'%TAG)
    except Exception as e:print('sheet',e)
play.run(s,w=960,hh=560)
