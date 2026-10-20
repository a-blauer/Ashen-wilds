# v103: close-ups of a citizen walking (procedural walk on the town-folk skeleton) and one coming home with a sack
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
from PIL import Image
OUT=play.TMP
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{gold=1e7;for(const k of Object.keys(RES))mats[k]=5000;bossDone.add(0);hsBuy103('A2');const T=TOWNS[0];toPos(T.cx,T.cy+20);pl.visible=false;STEP(.3);TOD=.3}")
    ims=[]
    for i in range(6):
        ev("""(i)=>{const T=TOWNS[0],o=CZ103.live[0];if(i==0){o.c.task='';o.mode='walk';o.path=[[T.cx-2,T.cy+26],[T.cx-2,T.cy+46]];o.len=20;o.d=0}
          if(i==4){o.c.task='wood';o.c.t0=Date.now()-(HS103_TRIP-4000);o.pOut=null}STEP(i==0?.1:.18);const p=o.g.position,a=o.g.rotation.y+1.57;FC([p.x+Math.sin(a)*2.4,T.ph+1.2,p.z+Math.cos(a)*2.4],[p.x,T.ph+.8,p.z])}""",i)
        p=OUT+'/v103_walk_%d.png'%i;L.shot(pg,p);im=Image.open(p);w,h=im.size;ims.append(im.crop((int(w*.3),int(h*.15),int(w*.7),int(h*.92))).resize((300,290)))
    S=Image.new('RGB',(900,580))
    for i,im in enumerate(ims):S.paste(im,((i%3)*300,(i//3)*290))
    S.save(OUT+'/v103_walk.png');print('ok')
play.run(s,w=1000,hh=620)
