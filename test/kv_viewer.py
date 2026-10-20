# Animation viewer (dist/kq-anim-viewer.html): every subject and every action runs without errors; contact sheets.
#   python3 kv_viewer.py            all tabs, errors only       SHOT=1 also contact sheets in out/kv_<tab>_<n>.png
#   TABS=comp,mon,hero              only those tabs
import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
os.environ['SRC']=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dist','kq-anim-viewer.html')
import play
from PIL import Image,ImageDraw
OUT=play.TMP;SHOT=os.environ.get('SHOT');TABS=(os.environ.get('TABS') or 'comp,mon,hero').split(',');ONLY=[q for q in os.environ.get('ONLY','').split(',') if q]
def s(pg):
    pg.set_default_timeout(2400000);ev=pg.evaluate
    for i in range(120):
        if ev("()=>!!(window.KV&&KV.on)"):break
        pg.wait_for_timeout(1000)
    ev("""()=>{KVCLK.manual=true;window.KVNODRAW=1;window.ERR=[];const w=console.warn;console.warn=function(){ERR.push([].map.call(arguments,a=>a&&a.stack?String(a.stack).slice(0,300):String(a)).join(' '));return w.apply(console,arguments)};
      window.addEventListener('error',e=>ERR.push('ERR '+e.message));window.ST=ms=>{for(let i=0;i<Math.round(ms/16);i++)KVCLK.tick(16)};ST(300);return 1}""")
    subs={'comp':ev("()=>SPK"),'mon':ev("()=>Object.keys(EN).filter(k=>!/^boss/.test(k)&&EN[k].moves&&EN[k].moves.length)"),'hero':ev("()=>CLSK.flatMap(c=>{const s={};ITPL.forEach(t=>{if(t.sl=='weapon'&&t.cls==c)s[t.wt]=1});return Object.keys(s).map(w=>c+':'+w)})")}
    fails=[];n=0
    for tab in TABS:
        ims=[]
        for sub in subs[tab]:
            if ONLY and sub not in ONLY:continue
            if tab=='hero':c,w=sub.split(':');ev("([c,w])=>{KVselect('hero',c,{wt:w});ST(200)}",[c,w])
            elif tab=='comp':ev("(k)=>{KVselect('comp',k,{stage:3});ST(200)}",sub)
            else:ev("(k)=>{KVselect('mon',k);ST(200)}",sub)
            for k in ev("()=>KVactions()"):
                r=ev("""(k)=>{ERR.length=0;KVact(k);ST(KV.mode=='comp'&&k!='basic'?520:KV.mode=='mon'?900:380);return 1}""",k)
                if SHOT:
                    ev("()=>{window.KVNODRAW=0;KVCLK.tick(16);window.KVNODRAW=1}")
                    p=OUT+'/kv_one.png';pg.locator('#gl canvas').first.screenshot(path=p,animations='disabled');im=Image.open(p).convert('RGB');W,H=im.size;im=im.crop((int(W*.1),int(H*.08),int(W*.9),int(H*.92))).resize((300,200));d=ImageDraw.Draw(im);d.rectangle([0,0,300,14],fill=(0,0,0));d.text((3,1),sub+' · '+ev("()=>KV.label"),fill=(255,230,170));ims.append(im)
                o=ev("()=>{ST(3200);const e=ERR.filter(x=>!/fishing|audio|AudioContext/i.test(x));return {err:e.slice(0,3),busy:!!(fols[0]&&fols[0]._m105),lk:!!(fols[0]&&fols[0].lk),chan:!!hero.chan}}")
                n+=1
                if o['err'] or o['busy'] or o['lk']:fails.append((tab,sub,k,o));print('FAIL',tab,sub,k,json.dumps(o))
        if ims:
            for i in range(0,len(ims),16):
                S=Image.new('RGB',(1200,800));[S.paste(im,((j%4)*300,(j//4)*200)) for j,im in enumerate(ims[i:i+16])];S.save(OUT+'/kv_%s_%d.png'%(tab,i//16))
        print('tab',tab,'done',flush=True)
    print('actions run',n)
    print('CHECKS OK' if not fails else 'CHECKS FAILED: %d'%len(fails))
play.run(s,w=1100,hh=640)
