# Animation viewer (dist/kq-anim-viewer.html): every subject and every action runs without errors; contact sheets.
#   python3 kv_viewer.py            all tabs, errors only       SHOT=1 also contact sheets in out/kv_<tab>_<n>.png
#   TABS=comp,mon,boss,hero,abil    only those tabs (abil = every class ability, base and evolved)   ONLY=key,key  only those subjects
# Build first: ./viewer/build_viewer.sh   Prints FAIL lines and CHECKS OK / CHECKS FAILED.
import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
os.environ['SRC']=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dist','kq-anim-viewer.html')
import play
from PIL import Image,ImageDraw
OUT=play.TMP;SHOT=os.environ.get('SHOT');TABS=(os.environ.get('TABS') or 'comp,mon,boss,hero,abil').split(',');ONLY=[q for q in os.environ.get('ONLY','').split(',') if q]
def s(pg):
    pg.set_default_timeout(2400000);ev=pg.evaluate
    for i in range(120):
        if ev("()=>!!(window.KV&&KV.on)"):break
        pg.wait_for_timeout(1000)
    ev("""()=>{KVCLK.manual=true;window.KVNODRAW=1;window.ERR=[];const cap=fn=>function(){ERR.push([].map.call(arguments,a=>a&&a.stack?String(a.stack).slice(0,300):String(a)).join(' '));return fn.apply(console,arguments)};
      console.warn=cap(console.warn);console.error=cap(console.error);
      window.addEventListener('error',e=>ERR.push('ERR '+e.message));window.ST=ms=>{for(let i=0;i<Math.round(ms/16);i++)KVCLK.tick(16)};ST(300);return 1}""")
    subs={'comp':ev("()=>SPK"),
          'mon':ev("()=>Object.keys(EN).filter(k=>!/^boss/.test(k)&&k!=='vorraxis'&&((MSET[k]&&MSET[k].length)||(EN[k].moves&&EN[k].moves.length)))"),
          'boss':['s0','s1','s2','s3','s4','s5','mb','gb','qs'],
          'hero':ev("()=>CLSK.flatMap(c=>{const s={};ITPL.forEach(t=>{if(t.sl=='weapon'&&t.cls==c)s[t.wt]=1});return Object.keys(s).map(w=>c+':'+w)})"),
          'abil':ev("()=>CLSK.flatMap(c=>[c+':base',c+':evo'])")}
    fails=[];n=0
    def F(*a):fails.append(a);print('FAIL',*a,flush=True)
    for tab in TABS:
        ims=[]
        for sub in subs[tab]:
            if ONLY and sub not in ONLY:continue
            if tab=='hero':c,w=sub.split(':');ev("([c,w])=>{KVselect('hero',c,{wt:w,form:'base'});ST(200)}",[c,w])
            elif tab=='abil':c,f=sub.split(':');ev("([c,f])=>{KVselect('hero',c,{form:f});ST(200)}",[c,f])
            elif tab=='comp':ev("(k)=>{KVselect('comp',k,{stage:3});ST(200)}",sub)
            elif tab=='boss':
                r=ev("(k)=>{ERR.length=0;KVselect('boss',k);for(let i=0;i<60&&!KVbossReady();i++)ST(250);return {ok:KVbossReady(),err:ERR.slice(0,3),n:KVactions().length}}",sub)
                print('boss',sub,json.dumps(r),flush=True)
                if not r['ok'] or r['n']<8:F(tab,sub,'boss not ready',json.dumps(r));continue
            else:ev("(k)=>{KVselect('mon',k);ST(200)}",sub)
            keys=ev("()=>KVactions()")
            if tab=='hero':keys=[k for k in keys if not k.startswith('a')]
            if tab=='abil':
                keys=[k for k in keys if k.startswith('a')]
                if len(keys)!=17:F(tab,sub,'abilities listed: %d'%len(keys))
            for k in keys:
                ev("""(k)=>{ERR.length=0;KVact(k);ST(KV.mode=='comp'&&k!='basic'?520:KV.mode=='mon'?900:KV.mode=='boss'?700:380);return 1}""",k)
                if SHOT:
                    ev("()=>{window.KVNODRAW=0;KVCLK.tick(16);window.KVNODRAW=1}")
                    p=OUT+'/kv_one.png';pg.locator('#gl canvas').first.screenshot(path=p,animations='disabled');im=Image.open(p).convert('RGB');W,H=im.size;im=im.crop((int(W*.1),int(H*.08),int(W*.9),int(H*.92))).resize((300,200));d=ImageDraw.Draw(im);d.rectangle([0,0,300,14],fill=(0,0,0));d.text((3,1),sub+' · '+ev("()=>KV.label"),fill=(255,230,170));ims.append(im)
                o=ev("""()=>{if(KV.mode=='boss'){for(let i=0;i<80&&(KV.boss&&KV.boss.e&&(KV.boss.e.sv.mv||KV.die));i++)ST(250)}else ST(3200);
                  const e=ERR.filter(x=>!/fishing|audio|AudioContext/i.test(x)),b=KV.boss&&KV.boss.e;
                  return {err:e.slice(0,3),busy:!!(fols[0]&&fols[0]._m105),lk:!!(fols[0]&&fols[0].lk),chan:!!hero.chan,bmv:b?!!b.sv.mv:false,bdead:KV.mode=='boss'?!(b&&!b.dead):false,lab:KV.label}}""")
                n+=1
                if o['err'] or o['busy'] or o['lk'] or o['bmv'] or o['bdead']:F(tab,sub,k,json.dumps(o))
        if ims:
            for i in range(0,len(ims),16):
                S=Image.new('RGB',(1200,800));[S.paste(im,((j%4)*300,(j//4)*200)) for j,im in enumerate(ims[i:i+16])];S.save(OUT+'/kv_%s_%d.png'%(tab,i//16))
        print('tab',tab,'done',flush=True)
    # back to the field stage after the bosses: the stage is the Hillside Crest I road again
    if 'boss' in TABS:
        r=ev("()=>{KVselect('mon','hobgoblin');ST(400);const I=insAt(pl.position.x,pl.position.z);return {where:KV.where,ins:I&&I.n,boss:enemies.some(e=>e.boss||e.sv)}}")
        if r['where']!='stage' or r['boss'] or 'Hillside Crest I'!=r['ins']:F('boss','leave',json.dumps(r))
    print('actions run',n)
    print('CHECKS OK' if not fails else 'CHECKS FAILED: %d'%len(fails))
play.run(s,w=1100,hh=640)
