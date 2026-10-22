# Fast test mode: run any test with the main game view not drawing, except right before a screenshot.
#   python3 fast.py v57t.py [args]          (run_suite.py does this for every test unless the line sets FAST=0)
# Why: in headless Chromium the game draws in software at ~0.5 fps; with drawing off the game loop runs ~14 fps,
# so tests that wait on gameplay finish far sooner. Screenshots still get a real, full-quality frame:
# every page/locator/element screenshot first turns drawing on and waits for fresh frames.
# Only the main renderer `ren` is affected (item icons, previews and portraits have their own renderers).
# While drawing is off, ren.render still updates world matrices and the camera inverse, so positions,
# projections and bone matrices that code reads stay current. A test that stubs ren.render itself still works.
import sys,os,runpy
from playwright.sync_api import _generated as G

JS=r"""(()=>{if(window.__fast)return;const F=window.__fast={draw:0,frames:0,on:false};
const iv=setInterval(()=>{let r;try{r=ren}catch(e){return}if(!r||!r.render)return;clearInterval(iv);const r0=r.render;
  r.render=function(s,c){if(F.draw>0)return r0.apply(this,arguments);
    if(s&&s.isScene&&s.autoUpdate!==false)s.updateMatrixWorld();
    if(c&&c.isCamera){if(!c.parent)c.updateMatrixWorld();c.matrixWorldInverse.copy(c.matrixWorld).invert()}};
  F.on=true},40);
(function t(){F.frames++;requestAnimationFrame(t)})();
window.__fastShot=()=>new Promise(res=>{if(!F.on){res(-1);return}F.draw++;const f0=F.frames,t0=performance.now();
  (function w(){if(F.frames>=f0+3||performance.now()-t0>30000)res(F.frames-f0);else setTimeout(w,20)})()});
window.__fastDone=()=>{F.draw=Math.max(0,F.draw-1)};})()"""

def _init(target):
    try:target.add_init_script(JS)
    except Exception as e:print('fast.py: init script failed',e)

def _wrap_new(cls,name):
    f=getattr(cls,name)
    def g(self,*a,**k):
        r=f(self,*a,**k);_init(r);return r
    setattr(cls,name,g)
_wrap_new(G.Browser,'new_context')
_wrap_new(G.Browser,'new_page')       # its hidden context does not go through new_context
_wrap_new(G.BrowserType,'launch_persistent_context')

def _shot(cls,page_of):
    f=cls.screenshot
    def g(self,*a,**k):
        pg=None
        try:pg=page_of(self);pg.evaluate("()=>window.__fastShot?__fastShot():0")
        except Exception:pg=None
        try:return f(self,*a,**k)
        finally:
            if pg is not None:
                try:pg.evaluate("()=>window.__fastDone&&__fastDone()")
                except Exception:pass
    cls.screenshot=g
_shot(G.Page,lambda p:p)
_shot(G.Locator,lambda l:l.page)
_shot(G.ElementHandle,lambda e:e.owner_frame().page)

if __name__=='__main__':
    if len(sys.argv)<2:sys.exit('usage: python3 fast.py <test.py> [args]')
    test=sys.argv[1];sys.argv=sys.argv[1:]
    sys.path.insert(0,os.path.dirname(os.path.abspath(test)))
    runpy.run_path(test,run_name='__main__')
