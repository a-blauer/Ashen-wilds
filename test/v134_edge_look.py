# v134: stand near each side of a field instance and look out over the edge (ZONE K) -> out/v134_edge_<z>_<k><TAG>.jpg
import os,sys,io
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from PIL import Image
Z=int(os.environ.get('ZONE','2'));K=int(os.environ.get('K','0'));TAG=os.environ.get('TAG','')
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev(f"()=>{{hero.lvl=30;window.__I=PMAP[{Z}].ins[{K}];insArrive(__I);TOD=.3}}");pg.wait_for_timeout(2500)
    ev("()=>{document.querySelectorAll('#zt116,.zt116').forEach(e=>e.style.visibility='hidden')}")
    tiles=[]
    for side in range(4):
        ok=ev(f"""()=>{{const I=__I,s={side},cx=Math.round(I.x0+I.w/2),cy=Math.round(I.y0+I.h/2);let p=null;
          for(let d=0;d<Math.max(I.w,I.h)/2;d++){{const x=s==1?I.x0+I.w-1-d:s==3?I.x0+d:cx+((d%9)-4)*3,z=s==0?I.y0+I.h-1-d:s==2?I.y0+d:cy+((d%9)-4)*3;if(insAt(x,z)===I&&!solid(x,z)&&!solid(x+1,z)&&!solid(x,z+1)){{p=[x,z];break}}}}
          if(!p)return false;const yaw=[Math.PI,-Math.PI/2,0,Math.PI/2][s];toPos(p[0],p[1],yaw);camPitch=.1;TOD=.3;return p}}""")
        pg.wait_for_timeout(2200)
        tiles.append(Image.open(io.BytesIO(pg.locator('#stage').screenshot(type='jpeg',quality=70))).resize((450,275)))
    W=Image.new('RGB',(900,550))
    for n,t in enumerate(tiles):W.paste(t,((n%2)*450,(n//2)*275))
    W.save(play.TMP+f'/v134_edge_{Z}_{K}{TAG}.jpg',quality=82)
play.run(s,w=900,hh=550)
