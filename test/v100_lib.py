# v100 town: shared harness. Starts a hero with requestAnimationFrame stopped; time is driven by STEP(sec) (loop + render),
# views are set by FC(px,py,pz,lx,ly,lz) (free camera, world coords) or LOOK(...). SHOT(name) renders one frame and saves it.
import play,os,json,time
from playwright.sync_api import Page
_g=Page.goto
def _sg(self,url,**k):k['timeout']=max(k.get('timeout') or 0,2400000);return _g(self,url,**k)
Page.goto=_sg
LIB=r"""()=>{const RN=performance.now.bind(performance);window.RN=RN;window.VT=RN();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
 try{CHEAT.god=true}catch(_){}
 window.__rr=ren.render.bind(ren);
 ren.render=function(s,c){let fd=null;if(window.FCAM&&c===cam){cam.position.set(...FCAM.p);cam.lookAt(...FCAM.l);cam.updateMatrixWorld();if(FCAM.nf&&s.fog){fd=s.fog.density;s.fog.density=.0025;cam.far=600;cam.near=2;cam.updateProjectionMatrix()}}const r=__rr(s,c);if(fd!=null){s.fog.density=fd;cam.near=.1;cam.far=260;cam.updateProjectionMatrix()}return r};
 window.NODRAW=()=>{ren.render=function(s,c){if(window.FCAM&&c===cam){cam.position.set(...FCAM.p);cam.lookAt(...FCAM.l);cam.updateMatrixWorld()}if(s.autoUpdate!==false)s.updateMatrixWorld()}};
 window.DRAW=()=>{ren.render=function(s,c){let fd=null;if(window.FCAM&&c===cam){cam.position.set(...FCAM.p);cam.lookAt(...FCAM.l);cam.updateMatrixWorld();if(FCAM.nf&&s.fog){fd=s.fog.density;s.fog.density=.0025;cam.far=600;cam.near=2;cam.updateProjectionMatrix()}}const r=__rr(s,c);if(fd!=null){s.fog.density=fd;cam.near=.1;cam.far=260;cam.updateProjectionMatrix()}return r}};
 window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));NODRAW();for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(e){console.warn('loop',e)}if(draw&&i==n-1){DRAW();POST.render()}else POST.render()}DRAW()};
 window.FC=(p,l,nf)=>{window.FCAM={p,l,nf}};
 {const f=chunkVis;chunkVis=function(){if(window.FCAM){cam.position.set(...FCAM.p);cam.lookAt(...FCAM.l);cam.updateMatrixWorld();if(FCAM.nf){const s=FARR;FARR=400;const r=f.apply(this,arguments);FARR=s;return r}}return f.apply(this,arguments)}}
 return 1}"""
def start(pg):
    pg.set_default_timeout(2400000);ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]');pg.click('[data-c="warrior"]');pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(1500)
    ev(LIB);ev("()=>{for(const id of ['topl','mini','bbar','glog','sysBtn','fsBtn','hudTop','locBox','chInfo','prompt'])try{$(id).style.visibility='hidden'}catch(_){}}")
def shot(pg,path):
    pg.evaluate("()=>STEP(.05,1)");pg.locator('canvas').first.screenshot(path=path,timeout=900000,animations='disabled')
