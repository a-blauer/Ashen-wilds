# Model sheets of the scattered decorations (WD kinds, 1680 / 1981 / 2280 ...): every kind drawn alone on a grey floor, from two sides.
#   python3 wd_sheet.py [filter-regex] [TAG]   -> out/env/wd_<TAG>_<n>.png (24 kinds per sheet)
import os,sys,json,base64,io,re
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from PIL import Image,ImageDraw
OUT=play.TMP+'/env';os.makedirs(OUT,exist_ok=True)
FLT=sys.argv[1] if len(sys.argv)>1 else '.';TAG=sys.argv[2] if len(sys.argv)>2 else 'all'
JS=r"""async([flt])=>{const re=new RegExp(flt),ks=Object.keys(WD.T).filter(k=>re.test(k)).sort(),out=[];
  const cv=document.createElement('canvas');cv.width=480;cv.height=300;const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});
  R.outputEncoding=ren.outputEncoding;R.toneMapping=ren.toneMapping;R.toneMappingExposure=ren.toneMappingExposure;
  const S=new THREE.Scene();S.background=new THREE.Color(0x30343a);S.add(new THREE.HemisphereLight(0xb8c0d0,0x403830,.9));const D=new THREE.DirectionalLight(0xfff0dc,1.6);D.position.set(4,8,6);S.add(D);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x6a6660,roughness:1}));fl.rotation.x=-Math.PI/2;S.add(fl);
  const C=new THREE.PerspectiveCamera(35,480/300,.05,200);
  for(const k of ks){const T=WD.T[k],g=new THREE.Group();T.parts.forEach(p=>{let m;if(p.glow)m=new THREE.MeshBasicMaterial({vertexColors:true});else if(p.mat)m=new THREE.MeshBasicMaterial({color:0xaaaaaa,transparent:true,opacity:.4});
      else m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true});if(T.tint&&!p.glow&&m.color)m.color.setHex(T.tint[0]);g.add(new THREE.Mesh(p.g,m))});
    const sc=T.sc||[1,1,1];g.scale.set(sc[0],sc[1],sc[2]);g.position.y=T.abs!=null?0:T.y;S.add(g);g.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(g),c=b.getCenter(new THREE.Vector3()),r=Math.max(.5,b.getSize(new THREE.Vector3()).length()/2);const imgs=[];
    for(const a of [.7,3.6]){C.position.set(c.x+Math.sin(a)*r*2.6,c.y+r*1.1,c.z+Math.cos(a)*r*2.6);C.lookAt(c);R.render(S,C);imgs.push(cv.toDataURL('image/png'))}
    S.remove(g);g.children.forEach(m=>m.material.dispose());
    let tr=0;T.parts.forEach(p=>tr+=(p.g.index?p.g.index.count:p.g.attributes.position.count)/3);out.push({k,imgs,tr,n:WD.list.filter(d=>d.k==k).length})}
  R.dispose();return out}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2000)
    r=pg.evaluate(JS,[FLT]);print(len(r),'kinds')
    per=24;cols=4
    for si in range(0,len(r),per):
        L=r[si:si+per];rows=(len(L)+cols-1)//cols;sh=Image.new('RGB',(cols*480,rows*150),(0,0,0))
        for i,q in enumerate(L):
            for j,u in enumerate(q['imgs']):
                im=Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).resize((240,150));sh.paste(im,((i%cols)*480+j*240,(i//cols)*150))
            ImageDraw.Draw(sh).text(((i%cols)*480+4,(i//cols)*150+3),'%s  %dt  x%d'%(q['k'],q['tr'],q['n']),fill=(255,255,0))
        p=OUT+'/wd_%s_%d.png'%(TAG,si//per);sh.save(p);print(p)
play.run(s)
