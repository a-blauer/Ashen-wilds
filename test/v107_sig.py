# v107: every zone monster's signature moves start, play, hit a hero standing in the warning, and raise no errors.
#   python3 v107_sig.py      (uses the animation viewer build: ./viewer/build_viewer.sh first)   SHOT=1 contact sheets out/v107_*.png
import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
os.environ['SRC']=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dist','kq-anim-viewer.html')
import play
from PIL import Image,ImageDraw
OUT=play.TMP;SHOT=os.environ.get('SHOT');ONLY=[q for q in os.environ.get('ONLY','').split(',') if q]
def s(pg):
    pg.set_default_timeout(2400000);ev=pg.evaluate
    for i in range(120):
        if ev("()=>!!(window.KV&&KV.on)"):break
        pg.wait_for_timeout(1000)
    ev("""()=>{KVCLK.manual=true;window.KVNODRAW=1;window.ERR=[];const w=console.warn;console.warn=function(){ERR.push([].map.call(arguments,a=>a&&a.stack?String(a.stack).slice(0,300):String(a)).join(' '));return w.apply(console,arguments)};
      window.addEventListener('error',e=>ERR.push('ERR '+e.message));window.ST=ms=>{for(let i=0;i<Math.round(ms/16);i++)KVCLK.tick(16)};
      window.HITS=[];const f=hitHero;hitHero=function(e,m,mt){HITS.push([e&&e.c?e.c.g[0]:'?',+(m||0).toFixed(2)]);return f.apply(this,arguments)};ST(300);return 1}""")
    zone=ev("()=>Object.keys(MSIG107)")
    rep=ev("()=>{const out={},all={};Object.keys(MSIG107).forEach(k=>{const ms=EN[k].moves;out[k]=ms;ms.slice(1).forEach(n=>{all[n]=(all[n]||0)+1})});return {out,dup:Object.keys(all).filter(n=>all[n]>1),lunge:Object.keys(out).filter(k=>out[k].some(n=>n=='charge'||n=='pounce'))}}")
    print('duplicate signatures:',rep['dup'],' monsters with charge/pounce:',rep['lunge'])
    fails=[];ims=[]
    if rep['dup'] or rep['lunge']:fails.append('roster')
    for k in zone:
        if ONLY and k not in ONLY:continue
        ev("(k)=>{KVselect('mon',k);ST(300)}",k)
        for n in ev("(k)=>EN[k].moves",k):
            r=ev("""([k,n])=>{ERR.length=0;HITS.length=0;hero.iv=0;KVact('m'+n);const e=KV.mon;
              // self-heal / oath: hurt the monster first so the move can be judged
              let hp0=e.c.h;if(n=='regen'){e.c.h=Math.round(M(e.c)*.4);hp0=e.c.h}
              let maxT=0;for(let i=0;i<220;i++){KVCLK.tick(16);hero.iv=0;if(!e.atk&&i>20)break;maxT=i}
              for(let i=0;i<160;i++){KVCLK.tick(16);hero.iv=0}const st={hits:HITS.length,err:ERR.filter(x=>!/fishing|audio|AudioContext/i.test(x)).slice(0,2),frames:maxT,heal:e.c.h-hp0,enr:!!e.enr,buffs:hero.buffs.map(b=>b.n)};
              hero.buffs=[];e.enr=0;e._oath=0;return st}""",[k,n])
            self=n in('regen','bloodoath')
            basic=n in('strike','bite','spit','throw','bolt');ok=not r['err'] and (basic or (r['heal']>0 if n=='regen' else r['enr'] if n=='bloodoath' else r['hits']>0))
            print(('ok  ' if ok else 'FAIL'),k,n,json.dumps(r),flush=True)
            if not ok:fails.append((k,n))
            if SHOT:
                ev(f"""()=>{{KVact('m{n}');ST({'600' if self else '900'});window.KVNODRAW=0;KVCLK.tick(16);window.KVNODRAW=1}}""")
                p=OUT+'/kv_one.png';pg.locator('#gl canvas').first.screenshot(path=p,animations='disabled');im=Image.open(p).convert('RGB');W,H=im.size;im=im.crop((int(W*.1),int(H*.08),int(W*.9),int(H*.92))).resize((300,200));d=ImageDraw.Draw(im);d.rectangle([0,0,300,14],fill=(0,0,0));d.text((3,1),k+' · '+n,fill=(255,230,170));ims.append(im)
                ev("()=>{ST(3000);hero.buffs=[]}")
    for i in range(0,len(ims),16):
        S=Image.new('RGB',(1200,800));[S.paste(im,((j%4)*300,(j//4)*200)) for j,im in enumerate(ims[i:i+16])];S.save(OUT+'/v107_%d.png'%(i//16))
    print('CHECKS OK' if not fails else 'CHECKS FAILED: %s'%fails)
play.run(s,w=1100,hh=640)
