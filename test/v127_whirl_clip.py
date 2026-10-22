# v127: renders the warrior's Whirlwind as a clip (frames stepped by hand, no game loop) -> out/v127_whirl_<wt>.gif
#   WT=gs (weapon type), FPS=50 (game frames per second), DUR=2.4 (channel seconds), SLOW=1 (1 = real speed)
import os,sys,base64,io
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__))
LIB=open(HERE+'/v90_abil_lib.js').read()
WT=os.environ.get('WT','gs');FPS=float(os.environ.get('FPS','50'));DUR=float(os.environ.get('DUR','2.4'))
JS=r"""async(a)=>{const [wt,fps,dur]=a,W=360,H=300,dt=1/fps;
  const tp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&fitsCls(t,'warrior')&&itT({tp:i,lv:30,r:2,up:0,aff:[]}).wt==wt);
  eq.weapon={id:uid++,tp,lv:30,req:1,r:2,up:0,aff:[]};refreshGear();
  // stop the game loop: frames are stepped by hand below
  requestAnimationFrame=()=>{};await new Promise(r=>setTimeout(r,400));
  if(V90.dum&&V90.dum.m)V90.dum.m.visible=false;enemies.forEach(e=>{if(e.m)e.m.visible=false});
  const cam=new THREE.PerspectiveCamera(36,W/H,.05,80),sz=ren.getSize(new THREE.Vector2()),P=pl.position;
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d'),out=[];
  let T=performance.now();const sk=SKB.warrior.find(s=>s.n=='Whirlwind');
  const pre=.35,post=.6,N=Math.round((pre+dur+post)*fps);pl.rotation.y=0;
  for(let i=0;i<N;i++){const t=i*dt;T+=dt*1000;
    hero.chan=t>=pre&&t<pre+dur?{t:pre+dur-t,tick:1,sk,raw:0,R:2.7,mt:'p'}:null;pl.sw=hero.chan?1:0;
    if(hero.chan)pl.rotation.y+=dt*18;
    animHero(T,false);pl.updateMatrixWorld(true);
    cam.position.set(P.x+3.1,P.y+2.2,P.z+3.1);cam.lookAt(P.x,P.y+.75,P.z);
    ren.setSize(W,H,false);ren.render(scene,cam);x.drawImage(ren.domElement,0,0);ren.setSize(sz.x,sz.y,false);
    out.push(cv.toDataURL('image/jpeg',.9))}
  hero.chan=null;return out}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16);const q=PMAP[0];toPos(q.path[40][0],q.path[40][1])}");pg.wait_for_timeout(2500)
    ev("(L)=>{eval(L);V90.home=[pl.position.x,pl.position.z];V90.setup('warrior',30,{rank:1});refreshGear()}",LIB)
    fr=ev(JS,[WT,FPS,DUR])
    ims=[Image.open(io.BytesIO(base64.b64decode(f.split(',')[1]))).convert('RGB') for f in fr]
    for slow,tag in ((1,''),(3,'_slow')):
        ims[0].save(play.TMP+'/v127_whirl_%s%s.gif'%(WT,tag),save_all=True,append_images=ims[1:],duration=int(1000/FPS*slow),loop=0)
    print('frames',len(ims))
play.run(s,w=900,hh=600)
