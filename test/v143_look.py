# v143/v144 picture helper for the Lantern Road and Glowmire models (PROPS=boss, bossP:<pose> for Vorraxis): python3 v143_look.py
#   WHO=captain,boar,...   wardens to draw (keys of MQW143; default all)      VIEWS=front,34,side,back,head
#   PROPS=ripper,lamp,lampOn,tent,...  static models (keys of MQM143.sheet; default none unless WHO is empty)
#   JS=<file>  extra setup code run first (e.g. to define a test costume)   TAG=name  (out/v143_look_<tag>.jpg)
import os,sys,json,base64,io,re
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from PIL import Image,ImageDraw
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
WHO=os.environ.get('WHO');PROPS=os.environ.get('PROPS','');VIEWS=os.environ.get('VIEWS','front,34,side,back,head').split(',');TAG=os.environ.get('TAG','x')
EXTRA=open(os.environ['JS']).read() if os.environ.get('JS') else ''
FW=int(os.environ.get('FW','340'));FH=int(os.environ.get('FH','400'))
JS=COMMON+r"""(a)=>{const [who,props,views,FW,FH]=a,V=THREE.Vector3,out={items:[],errs:[]};
  const {rd,sc,pc}=RT.mk(FW,FH,0x2a2e34);
  const shot=(o,dir,c0,dist)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c0).add(d);pc.lookAt(c0);rd.render(sc,pc);return rd.domElement.toDataURL('image/jpeg',.88)};
  const W=(who===null?Object.keys(MQW143.D):who.split(',').filter(Boolean));
  W.forEach(k=>{const it={lab:k,shots:[],err:null};out.items.push(it);let g;
    try{g=mqw143Make(k,{preview:1});sc.add(g);g.position.set(0,0,0);g.rotation.y=0;IDL.on=true;for(let t=0;t<700;t+=33){RT.T+=33;idlNpc(g,RT.T)}g.updateMatrixWorld(true);
      const bb=new THREE.Box3().setFromObject(g),h=bb.max.y,ctr=new V(0,h*.52,0);
      views.forEach(v=>{if(v=='front')it.shots.push(['front',shot(g,[0,.12,1],ctr,h*2.9)]);if(v=='34')it.shots.push(['3/4',shot(g,[.8,.2,1],ctr,h*2.9)]);
        if(v=='side')it.shots.push(['side',shot(g,[1,.1,0],ctr,h*2.9)]);if(v=='back')it.shots.push(['back',shot(g,[-.3,.15,-1],ctr,h*2.9)]);
        if(v=='head'){const hc=g.bones.head.getWorldPosition(new V()).add(new V(0,.1*g.bones.pelvis.scale.x,.02));it.shots.push(['head',shot(g,[.7,.15,1],hc,.95)])}
        if(v=='heads'||v=='headb'){const hc=g.bones.head.getWorldPosition(new V()).add(new V(0,.1*g.bones.pelvis.scale.x,.02));it.shots.push([v,shot(g,v=='heads'?[1,.25,0]:[-.4,.5,-1],hc,.95)])}});
    }catch(e){it.err=String(e)+' '+(e.stack||'').slice(0,600)}
    if(g)sc.remove(g)});
  props.split(',').filter(Boolean).forEach(k=>{const it={lab:k,shots:[],err:null};out.items.push(it);let g;
    try{if(k.startsWith('bossP:')){const R=svRig();mb144Build(R,null);svRest(R);MB144.pose(null,R,k.slice(6));svMerge(R);g=R.root}else if(k.startsWith('qsP:')){const R=svRig();qs165Build(R,null);svRest(R);QS165M.pose(null,R,k.slice(4));svMerge(R);g=R.root}else if(k.startsWith('gbP:')){const R=svRig();gb151Build(R,null);if(k.endsWith('+'))R.shellM.visible=true;svRest(R);GB151.pose(null,R,k.slice(4).replace('+',''));svMerge(R);g=R.root}else g=(MQM143.sheet[k]||(typeof MB144!='undefined'&&MB144.sheet[k])||(typeof KQSH151!='undefined'&&KQSH151[k]))();sc.add(g);g.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new V()),c=bb.getCenter(new V()),R=Math.max(sz.x,sz.y,sz.z);
      [['front',[0,.25,1]],['3/4',[.9,.45,1]],['side',[1,.2,0]],['back',[-.7,.4,-1]],['top',[.2,1.6,.5]]].forEach(([l,d])=>it.shots.push([l,shot(g,d,c,R*2.1+.4)]));
    }catch(e){it.err=String(e)+' '+(e.stack||'').slice(0,600)}
    if(g)sc.remove(g)});
  return out}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if EXTRA:print('extra',pg.evaluate('()=>{'+EXTRA+'}'))
    r=pg.evaluate(JS,[WHO if WHO is not None else (None if not PROPS else ''),PROPS,VIEWS,FW,FH])
    rows=[]
    for it in r['items']:
        if it['err']:print('FAIL',it['lab'],it['err'])
        if it['shots']:rows.append((it['lab'],it['shots']))
    if not rows:return
    n=max(len(x[1]) for x in rows);S=Image.new('RGB',(n*FW,len(rows)*FH),(20,20,24));d=ImageDraw.Draw(S)
    for j,(lab,shots) in enumerate(rows):
        for i,(l,u) in enumerate(shots):
            im=Image.open(io.BytesIO(base64.b64decode(u.split(',')[1])));S.paste(im,(i*FW,j*FH));d.text((i*FW+6,j*FH+4),lab+' · '+l,fill=(255,255,255))
    p=O+'/v143_look_'+TAG+'.jpg';S.save(p,quality=86);print('sheet',p)
play.run(s)
