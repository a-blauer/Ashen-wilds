# v220: the Hatchery model, one row per level (0-3): front, 3/4, side, back-high. Draws the baked kit + the living parts.
# TAG=v220_hatch  W=420  LV=0,1,2,3
import os,sys,re,base64,io
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from PIL import Image
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const [lv,FW,FH]=a,V=THREE.Vector3,{rd,sc,pc}=RT.mk(FW,FH,0x262a30),l=lv+1,key='V220LOOK|'+l;
  const k=twKit(401+l*7+5),cl=KDU.hatch.b(k,l),g=twGroup(k,key);dc190Shade(k,key);HT220.k=null;const f=KDU.hatch.anim(g,l);if(l>=4){const hk=HT220.k;KDU.hatch.ring(g,l)}
  sc.add(g);if(f)f(2600);let tris=0;g.traverse(m=>{if(m.isMesh&&m.geometry){const G=m.geometry;tris+=(G.index?G.index.count:G.attributes.position.count)/3}});
  const out={tris:Math.round(tris),col:cl.length,shots:[]},ctr=new V(0,2.6,0);
  const shot=(dir,dist,l2,c)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c||ctr).add(d);pc.lookAt(c||ctr);rd.render(sc,pc);out.shots.push([l2,rd.domElement.toDataURL('image/jpeg',.9)])};
  shot([0,.22,1],17,'front');shot([.75,.3,.8],17,'3/4');shot([1,.2,0],17,'side');shot([-.5,.55,-.9],17,'back');shot([.3,.5,1],6,'nest',new V(0,.7,0));
  sc.remove(g);return out}"""
def s(pg):
    pg.set_default_timeout(3600000)
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    W=int(os.environ.get('W','420'));tag=os.environ.get('TAG','v220_hatch');L=[int(x) for x in os.environ.get('LV','0,1,2,3').split(',')]
    sh=Image.new('RGB',(W*5,W*len(L)),(20,20,20))
    for r,lv in enumerate(L):
        it=pg.evaluate(JS,[lv,W,W]);print('level',lv,'triangles',it['tris'],'colliders',it['col'],flush=True)
        for c,(l,u) in enumerate(it['shots']):sh.paste(Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))),(c*W,r*W))
    nm='%s/%s.jpg'%(O,tag);sh.save(nm,quality=88);print('wrote',nm,flush=True)
play.run(s)
