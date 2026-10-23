# v136 gear sheets: any combination of worn items on a class's animal, from several views and poses.
#   RACE=cat  SETS="helm:ashcowl;helm:stormhood,chest:raiment"  (each ;-separated set is one row; items slot:style)
#   VIEWS=front,34,side,back,hf,h34,hb,run,windup,strike   R=3 (rarity)   TAG=_x (file name suffix)  W=1 (weapon shown)
#   -> out/v136_<race><TAG>.jpg
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
RACES={'rat':('warrior',1,'gs','gs1'),'cat':('assassin',2,'dagger','dag1'),'raven':('mage',3,'staff','sword0'),'badger':('paladin',4,'mace','mace1'),'weasel':('ranger',5,'bow','sling')}
JS=COMMON+r"""(a)=>{const [cls,race,sets,views,R,wt,mv,showW]=a,V=THREE.Vector3,FW=240,FH=300,{rd,sc,pc}=RT.mk(FW,FH,0x262a30);
  if(!RT.rim){RT.rim=new THREE.DirectionalLight(0xa8b8ff,.7);RT.rim.position.set(-3,3,-4);sc.add(RT.rim)}
  const arm=CLS[cls].arm,cnv=document.createElement('canvas');cnv.width=FW*views.length;cnv.height=FH*sets.length;const ctx=cnv.getContext('2d');let H=null;const info=[];
  const find=(sl,st)=>{let r=-1;ITPL.forEach((t,i)=>{if(r>=0||t.sl!=sl)return;if(t.arm&&t.arm!=arm)return;const d=mdGD(RT.it(i));if(d&&d.st==st)r=i});return r};
  sets.forEach((S,row)=>{const E={},nm=[];S.forEach(x=>{const [sl,st]=x.split(':');const tp=find(sl,st);if(tp>=0){E[sl]=RT.it(tp,R);nm.push(ITPL[tp].n)}else nm.push('MISSING '+x)});
    const wtp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls==cls&&itT(RT.it(i)).wt==wt);if(wtp>=0&&showW)E.weapon=RT.it(wtp,R);
    if(H)sc.remove(H);const t0=performance.now();H=RT.beast(cls,race,E);const ms=performance.now()-t0;sc.add(H);if(!showW)RT.hideW(H);RT.idle(H,800);info.push(nm.join(' + ')+' '+ms.toFixed(0)+'ms');
    const cb=new V(0,.86,0),shot=(col,dir,c,dist,l)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c).add(d);pc.lookAt(c);rd.render(sc,pc);ctx.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(ctx,l,col*FW,row*FH,FW)};
    const hc=()=>{const hp=H.bones.head.getWorldPosition(new V());return new V(hp.x,hp.y+.02,hp.z+.02)};
    views.forEach((v,col)=>{const lab=col?v:(nm.join(' + ')||'outfit');
      if(v=='front')shot(col,[0,.12,1],cb,4.0,lab);else if(v=='34')shot(col,[.8,.15,.6],cb,4.0,lab);else if(v=='side')shot(col,[1,.1,0],cb,4.0,lab);
      else if(v=='back')shot(col,[-.5,.2,-.9],cb,4.0,lab);else if(v=='hf')shot(col,[0,.1,1],hc(),1.15,lab);else if(v=='h34')shot(col,[.75,.2,.6],hc(),1.15,lab);
      else if(v=='hs')shot(col,[1,.1,-.05],hc(),1.15,lab);else if(v=='hb')shot(col,[-.6,.3,-.8],hc(),1.15,lab);else if(v=='cf')shot(col,[0,.15,1],new V(0,.72,0),2.0,lab);else if(v=='c34')shot(col,[.8,.2,.6],new V(0,.72,0),2.0,lab);else if(v=='cb')shot(col,[-.6,.2,-.8],new V(0,.72,0),2.0,lab);else if(v=='legs')shot(col,[.7,.1,.7],new V(0,.3,0),1.6,lab);else if(v=='top')shot(col,[.2,1,.25],hc(),1.3,lab);
      else if(v=='run'){for(let t=0;t<900;t+=16){RT.T+=16;animHero(RT.T,true,H);H.position.set(0,0,0)}H.updateMatrixWorld(true);shot(col,[1,.12,.25],cb,4.0,lab);RT.idle(H,600)}
      else if(v=='runb'){for(let t=0;t<700;t+=16){RT.T+=16;animHero(RT.T,true,H);H.position.set(0,0,0)}H.updateMatrixWorld(true);shot(col,[-.6,.2,-.8],cb,4.0,lab);RT.idle(H,600)}
      else if(v=='windup'){RT.pose(H,mv,.35);shot(col,[.7,.2,.8],cb,4.3,lab);RT.idle(H,400)}else if(v=='strike'){RT.pose(H,mv,.62);shot(col,[.5,.2,1],cb,4.3,lab);RT.idle(H,400)}})});
  if(H)sc.remove(H);return {img:cnv.toDataURL('image/jpeg',.88),info,err:RT.err||null}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    errs=[]
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    race=os.environ.get('RACE','cat');cls,rid,wt,mv=RACES[race]
    sets=[[x for x in S.split(',') if x] for S in os.environ.get('SETS','').split(';')]
    views=os.environ.get('VIEWS','front,34,side,back,hf,h34,hb,run,windup').split(',')
    r=ev(JS,[cls,rid,sets,views,int(os.environ.get('R','3')),wt,mv,int(os.environ.get('W','0'))])
    for i in r['info']:print(' ',i)
    print('err',r['err'],'console errors',errs[:5])
    nm='v136_%s%s.jpg'%(race,os.environ.get('TAG',''))
    open(O+'/'+nm,'wb').write(base64.b64decode(r['img'].split(',')[1]));print('wrote',nm)
play.run(s,w=900,hh=600)
