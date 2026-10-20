# v107: serpent tail stays put during companion abilities (Gravewyrm / Venomcoil): sum of |tail rotation.x| per ability (max, end)
import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
os.environ['SRC']=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dist','kq-anim-viewer.html')
import play
SPS=(os.environ.get('SPS') or 'Gravewyrm,Venomcoil').split(',')
def s(pg):
    pg.set_default_timeout(2400000);ev=pg.evaluate
    for i in range(120):
        if ev("()=>!!(window.KV&&KV.on)"):break
        pg.wait_for_timeout(1000)
    ev("()=>{KVCLK.manual=true;window.KVNODRAW=1;window.ST=ms=>{for(let i=0;i<Math.round(ms/16);i++)KVCLK.tick(16)};ST(300);const f=rigAnim;window._LX=new Map();rigAnim=function(x){_LX.set(x.g,x);return f.apply(this,arguments)};return 1}")
    for sp in SPS:
        ev("(k)=>{KVselect('comp',k,{stage:3});ST(400)}",sp)
        for k in ev("()=>KVactions()"):
            r=ev("""(k)=>{KVact(k);let mx=0,end=0;for(let i=0;i<160;i++){KVCLK.tick(16);const R=_LX.get(fols[0]);const B=R?R.bones:null;if(!B)return 'nobones';let s=0;for(let j=0;j<4;j++)if(B['tail'+j])s+=Math.abs(B['tail'+j].rotation.x);mx=Math.max(mx,s);end=s}
              return [k,+mx.toFixed(2),+end.toFixed(2)]}""",k)
            print(sp,r,flush=True)
play.run(s)
