# debug pictures for the clipping check:  RACE=rat ITEMS="outfit,helm:great,chest:cuirass"  -> out/clipdbg_<race>.jpg
import os,sys,json,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__));LIB=open(HERE+'/v114_clip_lib.js').read()
CL={'rat':'warrior','cat':'assassin','frog':'mage','badger':'paladin','weasel':'ranger'}
race=os.environ.get('RACE','rat');cls=CL[race];items=os.environ.get('ITEMS','outfit').split(',')
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("(L)=>{eval(L);window.requestAnimationFrame=()=>0}",LIB)
    from PIL import Image
    import io
    rows=[]
    for itm in items:
        r=ev("""(a)=>{const [cls,itm]=a,it=tp=>({id:-1,tp,lv:1,req:1,r:3,up:0,aff:[]}),E={};
          if(itm!='outfit'){const [sl,st]=itm.split(':');const tp=ITPL.findIndex((t,i)=>t.sl==sl&&t.arm==CLS[cls].arm&&mdGD(it(i)).st==st);if(tp>=0)E[sl]=it(tp)}
          const V=[{c:[0,1.12,.05],d:[0,.1,1],r:1.1},{c:[0,1.12,.05],d:[1,.1,0],r:1.1},{c:[0,.8,0],d:[0,.1,1],r:3.2},{c:[0,.8,0],d:[1,.1,.1],r:3.2},{c:[0,.8,0],d:[0,.2,-1],r:3.2}];
          return CLIP.shot(cls,E,V)}""",[cls,itm])
        print(itm,r['n'],'poke',r['poke'],'hide',r['hide'])
        rows.append(Image.open(io.BytesIO(base64.b64decode(r['img'].split(',')[1]))))
    W=max(i.width for i in rows);H=sum(i.height for i in rows);out=Image.new('RGB',(W,H));y=0
    for i in rows:out.paste(i,(0,y));y+=i.height
    out.save(play.TMP+'/clipdbg_%s.jpg'%race,quality=88);print('wrote clipdbg_%s.jpg'%race)
play.run(s,w=900,hh=600)
