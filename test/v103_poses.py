# v103 pose lab: close-ups of working shopkeepers at several moments. KEEP=smith,alch (default all), SIDE=1 side view
import os,json,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
from PIL import Image
OUT=play.TMP;KS=(os.environ.get('KEEP') or 'smith,alch,cook,bard,merchant,sage,trainer,stable,magic').split(',');SIDE=float(os.environ.get('SIDE','0'))
TS=[0,.25,.5,.75,1.0,1.4]
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{SHOPS.forEach(o=>SH.shop[o.k]=1);shApply();TOD=.3;for(const id of ['xw'])$(id).classList.add('hide')}")
    for k in KS:
        ims=[]
        for i,t in enumerate(TS):
            ev("""([k,t,i,side])=>{const q=TWN100_SH.find(s=>s.k==k),l=LOTM103[q._lot],W0=WK103[k],T=TOWNS[0],[sx,sz]=lotW103(l,W0.x,W0.z);
              const a=l.ry+side,cx=sx+Math.sin(a)*2.6,cz=sz+Math.cos(a)*2.6;toPos(sx+Math.sin(a)*6,sz+Math.cos(a)*6);pl.visible=false;visTick();try{(TWN100_S.npc[k]||((VIS.find(v=>v.k==k)||{}).g)).traverse(o=>{if(o.isSprite)o.visible=false})}catch(_){}
              if(i==0)STEP(.3);STEP(t>0?.25:.02);FC([cx,T.ph+1.35+(W0.y||0),cz],[sx,T.ph+.95+(W0.y||0),sz])}""",[k,t,i,SIDE])
            p=OUT+'/v103_pose_%s_%d.png'%(k,i);L.shot(pg,p);im=Image.open(p);w,h=im.size;ims.append(im.crop((int(w*.25),int(h*.08),int(w*.75),int(h*.9))).resize((330,270)))
        S=Image.new('RGB',(330*3,270*2))
        for i,im in enumerate(ims):S.paste(im,((i%3)*330,(i//3)*270))
        S.save(OUT+'/v103_pose_%s%s.png'%(k,'_side' if SIDE else ''))
        print('sheet',k)
play.run(s,w=1000,hh=620)
