# v137 pictures (not in the suite): evolved abilities cast in the world at training dummies, several frames each, bigger than
# the preview sheets.   CLS=mage ONLY="Blink,Frost Nova" T=.15,.4,.8,1.4 NORM=1 (also the normal form, row above)  → out/v137_shots_<TAG>.jpg
import os,sys,json,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
from PIL import Image,ImageDraw
import re
SETUP=re.search(r'SETUP=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v137_evolve.py')).read(),re.S).group(1)
CLS=os.environ.get('CLS','mage');ONLY=[q for q in os.environ.get('ONLY','').split(',') if q];T=[float(v) for v in os.environ.get('T','.15,.4,.8,1.4').split(',')]
NORM=os.environ.get('NORM');TAG=os.environ.get('TAG',CLS)
def s(pg):
    ev=pg.evaluate;L.start(pg);ev(SETUP)
    ev("()=>{const p=PMAP[0].path[60];toPos(p[0],p[1]);hero.lvl=50;TOD=.35;STEP(.5)}");ev("(c)=>SETCLS(c)",CLS)
    names=ONLY or ev("(c)=>kqsAll(c).map(s=>s.n)",CLS)
    rows=[]
    for n in names:
        for evo in ([False,True] if NORM else [True]):
            ev("""async([n,evo])=>{const c=hero.cls,s=kqsFind(c,n);hero.tal['ab:'+s.n]=5;if(evo)hero.tal['__ev:'+s.n]=1;else delete hero.tal['__ev:'+s.n];kqsSetLd([s.n]);KQS.ck='';
              hero.cd={};KQS.cdn={};hero.mp=1e6;hero.cr=100;hero.chan=null;if(KQS.ch)kqsChanEnd(true);hero.buffs=[];hsDirty();CLEARE();for(let i=0;i<40;i++){STEP(.05);await new Promise(r=>setTimeout(r,10))}
              window.__F=[[0,4],[1.5,6],[-1.5,7]].map(q=>FOE(q[0],q[1]));pl.rotation.y=0;tgt=__F[0];face(kqsV(0,1));const P=pl.position;FC([P.x+7.5,P.y+4.2,P.z+1.2],[P.x,P.y+.8,P.z+3.6]);
              if(s.gt){KQS.gp=__F[0].m.position.clone();KQS.fire=1}cast(0);KQS.gp=null;KQS.fire=0;window.__T=0}""",[n,evo])
            ims=[]
            for t in T:
                ev("async(t)=>{while(__T<t-.001){STEP(.05);__T+=.05;await new Promise(r=>setTimeout(r,50))}}",t)
                p=play.TMP+'/v137_one.png';L.shot(pg,p);im=Image.open(p).convert('RGB');w,h=im.size;im=im.crop((int(w*.1),int(h*.08),int(w*.9),int(h*.92))).resize((420,300));d=ImageDraw.Draw(im);d.rectangle([0,0,420,15],fill=(0,0,0))
                d.text((3,1),('✦ ' if evo else '')+n+' t=%.2f'%t,fill=(245,208,254) if evo else (220,220,220));ims.append(im)
            rows.append(ims)
    S=Image.new('RGB',(420*len(T),300*len(rows)))
    for j,r in enumerate(rows):
        for i,im in enumerate(r):S.paste(im,(i*420,j*300))
    S.save(play.TMP+'/v137_shots_%s.jpg'%TAG,quality=86);print('wrote v137_shots_%s.jpg'%TAG)
play.run(s,w=1000,hh=640)
