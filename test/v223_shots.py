# v223 pictures: close-ups of the Blacksmith, the Bard and the Beast Trainer through their work loops (whole figure and the
# working hand, front and side), the Beast Trainer and the smith with their window open, and the Scholar's Tower station.
# KEEP=smith,bard,trainer  SCENES=work,talk,tower  TAG=v223   Run: python3 v223_shots.py (or tools/sheet.sh 'TAG=x python3 v223_shots.py')
# Writes sheets only: out/<TAG>_<keeper>.png, <TAG>_<keeper>_talk.png, <TAG>_tower.png (+ <TAG>_info.txt.png: numbers, plain text)
import os,json,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
from PIL import Image
OUT=play.TMP;TAG=os.environ.get('TAG','v223')
KS=(os.environ.get('KEEP') or 'smith,bard,trainer').split(',');SC=(os.environ.get('SCENES') or 'work,talk,tower').split(',')
TS=[0,.15,.3,.45,.6,.75,.9,1.05]
INFO=[]
def sheet(ims,name,cols=3):
    w,h=ims[0].size;S=Image.new('RGB',(w*cols,h*((len(ims)+cols-1)//cols)))
    for i,im in enumerate(ims):S.paste(im,((i%cols)*w,(i//cols)*h))
    S.save(OUT+'/'+name);print('sheet',OUT+'/'+name)
def grab(pg,crop=None,size=None):
    p=OUT+'/_v223_tmp.png';L.shot(pg,p);im=Image.open(p).convert('RGB')
    if crop:w,h=im.size;im=im.crop((int(w*crop[0]),int(h*crop[1]),int(w*crop[2]),int(h*crop[3])))
    if size:im=im.resize(size)
    os.remove(p);return im
SETUP="""()=>{[0,1,2,3,4,5].forEach(i=>bossDone.add(i));try{kfApply109()}catch(e){console.warn(e)}SHOPS.forEach(o=>SH.shop[o.k]=1);SH.lv.tower=Math.max(1,SH.lv.tower|0);shApply();try{lotSync103()}catch(_){}
  TOD=.3;$('xw').classList.add('hide');
  window.KP=k=>{const g=TWN100_S.npc[k]||((VIS.find(v=>v.k==k)||{}).g);return g&&(g.bones?g:g.children.find(c=>c.bones))};
  window.KL=k=>{const q=TWN100_SH.find(s=>s.k==k);return lotOf103(k)||(q&&LOTM103[q._lot])};
  const l=KL('smith'),[x,z]=lotW103(l,0,4.8);toPos(x,z);visTick();STEP(.3);
  return {pos:JSON.stringify(SH.pos),vis:VIS.map(v=>v.k+':'+!!v.g)}}"""
def s(pg):
    L.start(pg);ev=pg.evaluate
    INFO.append(ev(SETUP))
    def go(k):
        ev("([k])=>{const l=KL(k),[x,z]=lotW103(l,0,4.8);toPos(x,z);pl.visible=false;visTick();STEP(.3);try{im220Rig(KP(k)).parent.traverse(o=>{if(o.isSprite)o.visible=false})}catch(_){}}",[k])
    def view(k,side,dist=2.3,up=1.3,look=.95,hand=False):
        return ev("""([k,side,dist,up,look,hand])=>{const W0=WK103[k],l=KL(k),T=TOWNS[0],[sx,sz]=lotW103(l,W0.x,W0.z),n=KP(k);
          const a=l.ry+W0.ry+side;let c=[sx,T.ph+look+(W0.y||0),sz];
          if(hand){n.updateMatrixWorld(true);const p=n.bones[hand].getWorldPosition(new THREE.Vector3());c=[p.x,p.y,p.z]}
          FC([c[0]+Math.sin(a)*dist,c[1]+(up-look),c[2]+Math.cos(a)*dist],c);return c}""",[k,side,dist,up,look,hand])
    if 'work' in SC:
        for k in KS:
            go(k);ims=[];hand={'smith':'aR2','trainer':'aR2','bard':'aL2'}.get(k,'aR2')
            for side,hd in [(0,False),(1.2,False),(.5,hand),(1.6,hand)]:
                for i,t in enumerate(TS):
                    ev("([t])=>STEP(t>0?.15:.02)",[t])
                    if hd:view(k,side,.75,.95,.85,hd);ims.append(grab(pg,(.2,.05,.8,.95),(300,280)))
                    else:view(k,side);ims.append(grab(pg,(.22,.04,.78,.96),(300,280)))
            sheet(ims,'%s_%s.png'%(TAG,k),8)
    if 'talk' in SC:
        for k,js in [('trainer',"openX('visitor','trainer')"),('smith',"KQM_SMITH=true;$('bag').classList.remove('hide');try{rB()}catch(_){}")]:
            if k not in KS:continue
            ev("([k])=>{const l=KL(k),W0=WK103[k],[x,z]=lotW103(l,W0.x,W0.z);const a=l.ry+W0.ry;toPos(x+Math.sin(a)*1.6,z+Math.cos(a)*1.6);pl.visible=true;visTick();STEP(.3);window.FCAM=null}",[k])
            ev("()=>{"+js+"}");ims=[]
            for i in range(4):
                ev("()=>STEP(.4)");INFO.append(ev("([k])=>({k,on:!!IM220.on,key:IM220.on&&IM220.on.key,h:KP(k)._wk.h223})",[k]))
                ev("()=>{window.FCAM=null}");ims.append(grab(pg,None,(500,310)))
            view(k,1.4);ims.append(grab(pg,None,(500,310)));view(k,0);ims.append(grab(pg,None,(500,310)))
            sheet(ims,'%s_%s_talk.png'%(TAG,k),3)
            ev("()=>{try{closeX()}catch(_){}$('bag').classList.add('hide');KQM_SMITH=false;STEP(.2)}")
    if 'tower' in SC:
        ims=[]
        for i,(lx,lz,up,dist) in enumerate([(-1.4,2.3,1.6,3.0),(-1.4,2.3,1.2,1.5),(0,0,3.5,9)]):
            for side in [0,.9,-.9]:
                ev("""([lx,lz,up,dist,side])=>{const l=lotOf103('u:tower');if(!l)return;const T=TOWNS[0],[x,z]=lotW103(l,lx,lz),a=l.ry+side+.6;const [dx,dz]=lotW103(l,0,4.6);toPos(dx,dz);pl.visible=false;STEP(.1);
                  FC([x+Math.sin(a)*dist,T.ph+up,z+Math.cos(a)*dist],[x,T.ph+(dist>5?2:.85),z])}""",[lx,lz,up,dist,side])
                ims.append(grab(pg,None,(420,260)))
        sheet(ims,'%s_tower.png'%TAG,3)
    open(OUT+'/%s_info.txt.png'%TAG,'w').write(json.dumps(INFO,indent=1))
play.run(s,w=1000,hh=620)
