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
    if os.environ.get('HANDV'):ev('()=>{window.HANDV=1}')
    if os.environ.get('POSE'):ev('(a)=>{CLIP.poseMv=a[0];CLIP.poseK=+a[1]}',os.environ['POSE'].split(':'))
    from PIL import Image
    import io
    rows=[]
    for itm in items:
        r=ev("""(a)=>{const [cls,itm]=a,it=tp=>({id:-1,tp,lv:1,req:1,r:3,up:0,aff:[]}),E={};
          if(itm=='amulet+ring'){E.amulet=it(ITPL.findIndex(t=>t.sl=='amulet'));E.ring=it(ITPL.findIndex(t=>t.sl=='ring'))}else if(itm!='outfit'){const [sl,st]=itm.split(':');const tp=ITPL.findIndex((t,i)=>t.sl==sl&&t.arm==CLS[cls].arm&&mdGD(it(i)).st==st);if(tp>=0)E[sl]=it(tp)}
          const hb=(()=>{const h=buildHero();h.mdLook={race:BR_CLS[cls]};refreshGear(h,cls,{});let T=7e5;for(let t=0;t<900;t+=16){T+=16;animHero(T,false,h);h.position.set(0,0,0)}h.updateMatrixWorld(true);return h.bones.aR2.getWorldPosition(new THREE.Vector3()).toArray()})();
          const V=(window.HANDV?[{c:hb,d:[1,.2,.6],r:.45},{c:hb,d:[0,.1,1],r:.45},{c:hb,d:[-.3,.2,1],r:.45}]:[]).concat([{c:[0,1.12,.05],d:[0,.1,1],r:1.1},{c:[0,1.12,.05],d:[1,.1,0],r:1.1},{c:[0,.8,0],d:[0,.1,1],r:3.2},{c:[0,.8,0],d:[1,.1,.1],r:3.2},{c:[0,.8,0],d:[0,.2,-1],r:3.2}]);
          return CLIP.shot(cls,E,V)}""",[cls,itm])
        print(itm,r['n'],'poke',r['poke'],'hide',r['hide']);print('   head parts:',sorted((r.get('sub') or {}).items(),key=lambda x:-x[1])[:8]);print('   samples:',[x for x in r.get('smp',[]) if x[0]=='hide'][:12])
        rows.append(Image.open(io.BytesIO(base64.b64decode(r['img'].split(',')[1]))))
    W=max(i.width for i in rows);H=sum(i.height for i in rows);out=Image.new('RGB',(W,H));y=0
    for i in rows:out.paste(i,(0,y));y+=i.height
    out.save(play.TMP+'/clipdbg_%s.jpg'%race,quality=88);print('wrote clipdbg_%s.jpg'%race)
play.run(s,w=900,hh=600)
