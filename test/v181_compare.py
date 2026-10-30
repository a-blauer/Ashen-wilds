# v181: old vs new model pictures. Renders each enemy from two builds and puts them side by side:
# old front, 3/4, back, face | new front, 3/4, back, face.
# ONLY=orc,troll  OLD=<old build html, or the out_old.json of an earlier run to reuse its pictures>  (NEW = the normal SRC)  SZ=300  OUT=out/v181_cmp  ->  out/v181_cmp_<n>.jpg (4 enemies each)
import os,sys,json,base64,io,subprocess
from PIL import Image,ImageDraw
if os.environ.get('V181_PART'):
    import play
    JS=r"""(a)=>{const [list,SZ]=a,V=THREE.Vector3,out=[];
      if(!window.RT181){const rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(SZ,SZ);const sc=new THREE.Scene();sc.background=new THREE.Color(0x2c3036);
        sc.add(new THREE.HemisphereLight(0xc8d0dc,0x3a3028,.85));const dl=new THREE.DirectionalLight(0xfff0d8,1.15);dl.position.set(2,4,4);sc.add(dl);const d2=new THREE.DirectionalLight(0x8090c0,.6);d2.position.set(-4,1.5,-2);sc.add(d2);
        const gr=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshLambertMaterial({color:0x3a4234}));gr.rotation.x=-Math.PI/2;sc.add(gr);window.RT181={rd,sc,pc:new THREE.PerspectiveCamera(28,1,.02,200)}}
      const {rd,sc,pc}=RT181;
      list.forEach(k=>{const it={k,shots:[],err:null};out.push(it);let g,T=5000;
        try{const c=enemyC(k,20,{});g=cr(c);g.position.set(0,0,0);g.rotation.y=0;sc.add(g)}catch(e){it.err='build error '+String(e).slice(0,200);return}
        for(let t=0;t<600;t+=16){T+=16;try{animC(g,T,false,0)}catch(e){}}g.position.set(0,g.position.y,0);g.updateMatrixWorld(true);
        const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new V()),ctr=bb.getCenter(new V()),R=Math.max(sz.x,sz.y,sz.z)*.5;it.h=sz.y;
        let tri=0;g.traverse(o=>{if(o.isMesh&&o.geometry){const gg=o.geometry;tri+=(gg.index?gg.index.count:gg.attributes.position.count)/3}});it.tri=tri|0;
        const shot=(dir,c,r)=>{const d=new V(...dir).normalize().multiplyScalar(r/Math.tan(14*Math.PI/180)*1.12);pc.position.copy(c).add(d);pc.lookAt(c);rd.render(sc,pc);it.shots.push(rd.domElement.toDataURL('image/jpeg',.9))};
        shot([0,.12,1],ctr,R);shot([.75,.2,.75],ctr,R);shot([-.5,.2,-1],ctr,R);
        let hp=null;g.traverse(o=>{if(o.isBone&&o.name=='head'&&!hp){hp=new V();o.getWorldPosition(hp)}});
        if(!hp)hp=new V(ctr.x,bb.max.y-sz.y*.12,ctr.z);hp.y+=sz.y*.03;shot([.35,.1,1],hp,sz.y*.15);sc.remove(g)});
      return out}"""
    def s(pg):
        ev=pg.evaluate;pg.set_default_timeout(3600000);ev("()=>localStorage.clear()")
        pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
        ev("()=>{window.requestAnimationFrame=()=>0}")
        res=[]
        for k in os.environ['ONLY'].split(','):res+=ev(JS,[[k],int(os.environ.get('SZ','300'))])
        json.dump(res,open(os.environ['V181_PART'],'w'))
    play.run(s);sys.exit(0)
here=os.path.dirname(os.path.abspath(__file__));SZ=int(os.environ.get('SZ','300'));out=os.environ.get('OUT','out/v181_cmp')
parts={}
for lab,src in (('old',os.environ['OLD']),('new',os.environ.get('SRC',os.path.join(here,'..','dist','ashen-wilds.html')))):
    if src.endswith('.json'):parts[lab]={it['k']:it for it in json.load(open(src))};continue   # reuse earlier old pictures
    pf=out+'_'+lab+'.json';env=dict(os.environ,V181_PART=pf,SRC=src,SZ=str(SZ))
    subprocess.run([sys.executable,os.path.abspath(__file__)],env=env,cwd=here,check=True);parts[lab]={it['k']:it for it in json.load(open(pf))}
keys=os.environ['ONLY'].split(',')
for si in range(0,len(keys),4):
    K=keys[si:si+4];im=Image.new('RGB',(8*SZ+12,len(K)*SZ),(20,20,24));d=ImageDraw.Draw(im)
    for ri,k in enumerate(K):
        for ci,lab in enumerate(('old','new')):
            it=parts[lab].get(k) or {};x0=ci*(4*SZ+12)
            if it.get('err'):print('FAIL %s %s: %s'%(lab,k,it['err']))
            for j,u in enumerate(it.get('shots',[])):im.paste(Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))),(x0+j*SZ,ri*SZ))
            t='%s %s  %.2fm  %dk tris'%(lab.upper(),k,it.get('h',0),it.get('tri',0)//1000);d.rectangle([x0,ri*SZ,x0+len(t)*7+8,ri*SZ+13],fill=(0,0,0));d.text((x0+3,ri*SZ+1),t,fill=(255,255,255))
            print('%s %s height %.2f tris %d'%(lab,k,it.get('h',0),it.get('tri',0)))
    p='%s_%d.jpg'%(out,si//4);im.save(p,quality=86);print('wrote',p)
