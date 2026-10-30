# v182 animation clip of a companion: standing (long enough for a wing settle), walking, running, attacking, standing again.
#   SP=Skyhawk EVO=0 python3 v182_clip.py   -> out/v182_clip_<SP>.mp4 (and a contact sheet out/v182_clip_<SP>.jpg)
#   VIEW=3q|side|front  W=480  FPS=20  SEQ="idle:9,walk:2,run:2,atk:2.5,idle:1.5" (state:seconds)
import os,sys,re,base64,subprocess,shutil
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const [sp,evo,W,view,seq,fps]=a,V=THREE.Vector3,{rd,sc,pc}=RT.mk(W,W,0x262a30);
  if(!RT.rim){RT.rim=new THREE.DirectionalLight(0xa8b8ff,.7);RT.rim.position.set(-3,3,-4);sc.add(RT.rim)}
  const c=mkC(sp,30,0,'');c.z=1;c.evo=evo;const g=cr(c);sc.add(g);let T=5000;const step=1000/fps,out=[];
  const D={'3q':[.8,.25,.7],side:[1,.08,0],front:[.15,.15,1]}[view]||[.8,.25,.7];
  const bb=new THREE.Box3().setFromObject(g),ctr=bb.getCenter(new V()),R=bb.getSize(new V()).length();
  const cam=()=>{pc.position.copy(ctr).add(new V(...D).normalize().multiplyScalar(R*1.25));pc.lookAt(ctr)};
  for(let t=0;t<600;t+=16){T+=16;animC(g,T,false,0)}
  seq.forEach(([st,secs])=>{const n=Math.round(secs*fps);for(let i=0;i<n;i++){
    for(let t=0;t<step;t+=16){T+=16;g.atk=st=='atk'?1:0;animC(g,T,st=='walk'||st=='run',st=='run'?4.5:st=='walk'?1.6:0);g.position.set(0,0,0)}
    g.updateMatrixWorld(true);cam();rd.render(sc,pc);out.push(rd.domElement.toDataURL('image/jpeg',.88))}});
  g.atk=0;sc.remove(g);return out}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    sp=os.environ.get('SP','Skyhawk');fps=int(os.environ.get('FPS','20'));W=int(os.environ.get('W','480'))
    seq=[(q.split(':')[0],float(q.split(':')[1])) for q in os.environ.get('SEQ','idle:9,walk:2,run:2,atk:2.5,idle:1.5').split(',')]
    fr=ev(JS,[sp,int(os.environ.get('EVO','0')),W,os.environ.get('VIEW','3q'),seq,fps])
    d=O+'/clipfr';shutil.rmtree(d,ignore_errors=True);os.makedirs(d)
    for i,u in enumerate(fr):open('%s/%04d.jpg'%(d,i),'wb').write(base64.b64decode(u.split(',')[1]))
    tag=os.environ.get('TAG',sp);mp4=O+'/v182_clip_%s.mp4'%tag
    subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate',str(fps),'-i',d+'/%04d.jpg','-c:v','libx264','-pix_fmt','yuv420p','-crf','23',mp4],check=True)
    print('wrote',mp4,len(fr),'frames')
play.run(s,w=900,hh=600)
