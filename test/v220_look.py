# v220: villager picture sheet. Builds N citizens exactly as the town does (czModel103: body, clothes, trade gear),
# stands them in the relaxed pose and draws front / 3/4 / side / back (+ one walk frame).
# FITS=farm,burgher (force outfits in turn)  N=12  TAG=v220  W=260  ROLES=gather,egg,fish,hunt  CLOSE=1 (shoulder close-ups instead)
import os,sys,re,base64,io
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from PIL import Image
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const [i0,n,FW,FH,roles,close,fits]=a,V=THREE.Vector3,out=[];
  const {rd,sc,pc}=RT.mk(FW,FH,0x262a30);
  for(let i=i0;i<i0+n;i++){const r=roles[i%roles.length],c={n:HS103_CN[i%HS103_CN.length],h:0,r,rk:1,task:'',t0:0,lk:(i*7919+i*i*104729+12345)%1000000};
    if(!RT.cz0){RT.cz0=czLook103;czLook103=function(c){const o=RT.cz0.apply(this,arguments);if(RT.fit)o.fkFit=RT.fit;return o}}RT.fit=fits&&fits.length?fits[i%fits.length]:null;const g=czModel103(c);if(g.userData.lab)g.userData.lab.visible=false;sc.add(g);g.position.set(0,0,0);g.rotation.y=0;
    czReset103(g);IDL.on=true;for(let t=0;t<700;t+=33){RT.T+=33;idlNpc(g,RT.T)}g.updateMatrixWorld(true);
    const m=g.children.find(q=>q.isSkinnedMesh),it={lab:c.n+' '+r+' '+(RT.fit||'')+' ('+(m&&m.userData.fk)+')',shots:[]};out.push(it);
    const k=g.bones.pelvis.scale.x,ctr=close?new V(0,.9*k,0):new V(0,.62*k+.3,0),dist=close?1.7:4.3;
    const shot=(dir,l)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(ctr).add(d);pc.lookAt(ctr);rd.render(sc,pc);it.shots.push([l,rd.domElement.toDataURL('image/jpeg',.9)])};
    shot([0,.12,1],'front');shot([.7,.14,.75],'3/4');shot([1,.1,0],'side');shot([-.45,.14,-1],'back');
    czWalkPose103(g,1.2,1);g.updateMatrixWorld(true);shot([.7,.14,.75],'walk');czReset103(g);
    sc.remove(g)}
  return out}"""
def s(pg):
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    N=int(os.environ.get('N','12'));W=int(os.environ.get('W','260'));H=int(W*1.35);tag=os.environ.get('TAG','v220')
    roles=os.environ.get('ROLES','gather,egg,fish,hunt,gather,gather').split(',');close=bool(os.environ.get('CLOSE'))
    if close:H=W
    items=[]
    for i in range(0,N,3):items+=pg.evaluate(JS,[i,min(3,N-i),W,H,roles,close,[f for f in os.environ.get('FITS','').split(',') if f]])
    per=4
    for si in range(0,len(items),per):
        part=items[si:si+per];sh=Image.new('RGB',(W*5,H*len(part)),(20,20,20))
        for r,it in enumerate(part):
            for c,(l,u) in enumerate(it['shots']):
                im=Image.open(io.BytesIO(base64.b64decode(u.split(',')[1])));sh.paste(im,(c*W,r*H))
            print(it['lab'])
        nm='%s/%s_%d.jpg'%(O,tag,si//per);sh.save(nm,quality=88);print('wrote',nm,flush=True)
play.run(s)
