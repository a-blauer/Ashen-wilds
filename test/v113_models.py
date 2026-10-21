# v113: contact sheets of the new instance creatures (animation viewer build: ./viewer/build_viewer.sh first)
#   ONLY=amalgam,akidon  python3 v113_models.py      -> out/v113_<key>.png: idle front/side/back, then 5 frames of every move
#   FR=6 frames per move · CAM=side|front for the move frames · NOMOVES=1 just the idle views
import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
os.environ['SRC']=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dist','kq-anim-viewer.html')
import play
from PIL import Image,ImageDraw
OUT=play.TMP;ONLY=[q for q in os.environ.get('ONLY','').split(',') if q];FR=int(os.environ.get('FR','5'));CAMM=os.environ.get('CAM','side')
def s(pg):
    pg.set_default_timeout(2400000);ev=pg.evaluate
    for i in range(120):
        if ev("()=>!!(window.KV&&KV.on)"):break
        pg.wait_for_timeout(1000)
    ev("""()=>{KVCLK.manual=true;window.KVNODRAW=1;window.ERR=[];const w=console.warn,er=console.error;console.warn=function(){ERR.push([].map.call(arguments,a=>a&&a.stack?String(a.stack).slice(0,300):String(a)).join(' '));return w.apply(console,arguments)};
      console.error=function(){ERR.push('E '+[].map.call(arguments,a=>a&&a.stack?String(a.stack).slice(0,300):String(a)).join(' '));return er.apply(console,arguments)};
      window.addEventListener('error',e=>ERR.push('ERR '+e.message));window.ST=ms=>{for(let i=0;i<Math.round(ms/16);i++)KVCLK.tick(16)};
      window.CP=n=>{const O=KV.orbit;if(n=='side'){O.yaw=Math.PI/2+.45;O.pitch=.3}else if(n=='front'){O.yaw=.15;O.pitch=.25}else if(n=='back'){O.yaw=Math.PI+.25;O.pitch=.35}else if(n=='side2'){O.yaw=-Math.PI/2-.45;O.pitch=.3}};ST(300);return 1}""")
    keys=ONLY or ev("()=>N3.keys")
    def shot(lbl,wide=0):
        ev("()=>{window.KVNODRAW=0;KVCLK.tick(16);window.KVNODRAW=1}")
        p=OUT+'/kv_m.png';pg.locator('#gl canvas').first.screenshot(path=p,animations='disabled');im=Image.open(p).convert('RGB');W,H=im.size;im=(im.crop((int(W*.06),int(H*.02),int(W*.94),int(H*.98))) if wide else im.crop((int(W*.2),int(H*.04),int(W*.8),int(H*.96)))).resize((330,350))
        d=ImageDraw.Draw(im);d.rectangle([0,0,330,13],fill=(0,0,0));d.text((3,1),lbl,fill=(255,230,170));return im
    for k in keys:
        ev("(k)=>{ERR.length=0;KVselect('mon',k);ST(400)}",k)
        ims=[]
        for cp in ['front','side','back']:
            ev("""(c)=>{CP(c);const m=KV.mon.m,h=pl.position.clone();pl.visible=false;const b=m.bs||1;KV.orbit.dist=2.2*b;KV.focus=V(m.position.x,GH(m.position.x,m.position.z)+.72*b,m.position.z);
              window.KVNODRAW=0;KVCLK.tick(16);window.KVNODRAW=1;KV.focus=V(m.position.x,GH(m.position.x,m.position.z)+.72*b,m.position.z);window._h=h}""",cp);ims.append(shot(k+' '+cp))
            ev("()=>{pl.visible=true}")
        if not os.environ.get('NOMOVES'):
            for n in ev("(k)=>EN[k].moves",k):
                M=ev("(n)=>{const M=MV[n];return M?[M.wind,M.act,M.rec]:[.5,.24,.45]}",n)
                ev("(c)=>{CP(c);KV.orbit.dist=3.7*Math.max(1,KV.mon.m.bs||1);ST(50)}",CAMM)
                tot=M[0]+M[1]+M[2];ts=[M[0]*.5,M[0]*.97,M[0]+M[1]*.45,M[0]+M[1]*.98,M[0]+M[1]+M[2]*.4] if FR==5 else [tot*(i+.5)/FR for i in range(FR)]
                ev("(n)=>{hero.iv=0;KVact('m'+n)}",n);t0=0
                for t in ts:
                    ev("(ms)=>{ST(ms);hero.iv=0}",int((t-t0)*1000));t0=t;ims.append(shot('%s %s %.2fs'%(k,n,t),1))
                ev("()=>{ST(2500);hero.buffs=[]}")
        er=ev("()=>ERR.filter(x=>!/fishing|audio|AudioContext/i.test(x)).slice(0,4)")
        print(k,'errors:',er,flush=True)
        cols=6 if len(ims)>3 else 3;rows=(len(ims)+cols-1)//cols
        S=Image.new('RGB',(330*cols,350*rows));[S.paste(im,((j%cols)*330,(j//cols)*350)) for j,im in enumerate(ims)];S.save(OUT+'/v113_%s.png'%k)
play.run(s,w=1100,hh=700)
