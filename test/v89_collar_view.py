# Vampire collar preview: every vampire model (Thrall, Blood Magister, Blood Knight, Lord Vaelric) from the front, back,
# both sides and 3/4, plus walk / attack / slam / head-turn poses (to check the collar does not clip).
#   AW_OUT=build.html AW_TMP=outdir python3 v89_collar_view.py   -> collar_<key>.png
import play,json,base64,os
KEYS=os.environ.get('KEYS','vamp,vampm,vampk,vlord').split(',')
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev("""(KEYS)=>{
      const CW=260,CH=330,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(CW,CH);
      const sc=new THREE.Scene();sc.background=new THREE.Color(0x4a5058);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.8));
      const d=new THREE.DirectionalLight(0xfff0d8,1.2);d.position.set(3,5,4);sc.add(d);const d2=new THREE.DirectionalLight(0x9ab0ff,.5);d2.position.set(-3,2,-4);sc.add(d2);
      const cam=new THREE.PerspectiveCamera(30,CW/CH,.05,80),out={},errs=[];
      const V=[['front',[0,.1,1],0],['back',[0,.15,-1],0],['left',[-1,.1,0],0],['right',[1,.1,0],0],['3/4',[.8,.3,.8],0],['3/4 back',[-.8,.35,-.7],0],
               ['walk',[.8,.2,.8],1],['attack',[.9,.2,.5],2],['slam',[1,.15,.3],3],['head turn',[.3,.4,1],4],['spin',[0,.3,1],5],['cast',[1,.2,.6],6]];
      KEYS.forEach(key=>{try{
        const g=mkHumanoid(key);sc.add(g);const cv=document.createElement('canvas');cv.width=CW*6;cv.height=CH*2;const cx=cv.getContext('2d');
        V.forEach((v,i)=>{g.ak=null;let t=1000;
          if(v[2]==1)t=1350;if(v[2]==2)g.ak={n:'strike',ph:1,k:.4};if(v[2]==3)g.ak={n:'slam',ph:0,k:1};if(v[2]==5)g.ak={n:'spin',ph:1,k:.5};if(v[2]==6)g.ak={n:'bolt',ph:0,k:1};
          g.rig(t,v[2]==1,3);if(v[2]==4&&g.h&&g.h.bones){g.h.bones.head.rotation.y=1.0;g.h.bones.head.rotation.x=.35;g.h.bones.neck.rotation.y=.3}
          g.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(g),hgt=bb.max.y-bb.min.y,ctr=new THREE.Vector3(0,bb.min.y+hgt*.8,0);
          cam.position.copy(ctr).add(new THREE.Vector3(...v[1]).normalize().multiplyScalar(hgt*1.25));cam.lookAt(ctr);rd.render(sc,cam);
          cx.drawImage(rd.domElement,(i%6)*CW,Math.floor(i/6)*CH);cx.fillStyle='#fff';cx.font='15px sans-serif';cx.fillText(key+' '+v[0],(i%6)*CW+6,Math.floor(i/6)*CH+18)});
        sc.remove(g);out[key]=cv.toDataURL('image/png')}catch(e){errs.push(key+' '+e+' '+e.stack)}});
      out.errs=errs;return out}""",KEYS)
    for k,v in r.items():
        if isinstance(v,str) and v.startswith('data:image'):open(play.TMP+'/collar_'+k+'.png','wb').write(base64.b64decode(v.split(',')[1]))
        else: print(k,json.dumps(v)[:1500])
# a busy machine can take over two minutes to parse the page: give goto more time (play.py uses 120 s)
from playwright.sync_api import Page as _Pg, Browser as _Br  # SLOWLOAD
_g0=_Pg.goto;_Pg.goto=lambda self,url,**k:_g0(self,url,**dict(k,timeout=600000))
_n0=_Br.new_page;_Br.new_page=lambda self,*a,**k:(lambda p:(p.set_default_timeout(240000),p)[1])(_n0(self,*a,**k))
play.run(s,w=1000,hh=620)
