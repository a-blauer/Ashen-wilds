# v141 picture helper: python3 v141_look.py <file.js> [W H]
# The JS file is split at lines "//SHOT name": each part is run as an async function body in a started game
# (warrior unless the first line says //CLS mage etc.), then the page is screenshotted to out/v141_<name>.png.
# A part may "return" a value; it is printed. Lines "//WAIT ms" wait between parts.
import sys,os,json,re,play
src=open(sys.argv[1]).read();W=int(sys.argv[2]) if len(sys.argv)>2 else 1280;H=int(sys.argv[3]) if len(sys.argv)>3 else 760
cls=(re.search(r'//CLS (\w+)',src) or [None,'warrior'])[1]
parts=re.split(r'^//SHOT (\S+)\s*$',src,flags=re.M)
pre=parts[0];steps=[(parts[i],parts[i+1]) for i in range(1,len(parts),2)]
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="%s"]'%cls,timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if pre.strip():print('pre',pg.evaluate('async()=>{'+pre+'}'))
    for name,body in steps:
        m=re.search(r'//WAIT (\d+)',body)
        r=pg.evaluate('async()=>{'+body+'}')
        if r is not None:
            print(name,json.dumps(r)[:3000])
            if os.environ.get('OUTF'):open(os.environ['OUTF'],'w').write(json.dumps(r))
        if m:pg.wait_for_timeout(int(m.group(1)))
        pg.screenshot(path=play.TMP+'/v141_'+name+'.png',timeout=600000)
    print('page errors',errs[:5])
play.run(s,w=W,hh=H)
