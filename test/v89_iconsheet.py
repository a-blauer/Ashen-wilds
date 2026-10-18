# Contact sheet of every gear template's rendered icon (rarity varies by row), plus timing.
#   AW_TMP=outdir python3 v89_iconsheet.py   -> v89_icons_all.png
import play,json,base64,os
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev("""()=>{const C=16,S=84,N=ITPL.length,rows=Math.ceil(N/C),cv=document.createElement('canvas');cv.width=C*S;cv.height=rows*(S+12);const c=cv.getContext('2d');c.fillStyle='#222';c.fillRect(0,0,cv.width,cv.height);
      v89Init();const t0=performance.now(),errs=[];
      for(let tp=0;tp<N;tp++){const r=(tp+Math.floor(tp/5))%5;try{const ic=v89Render({tp,r});c.drawImage(ic,(tp%C)*S+2,Math.floor(tp/C)*(S+12)+2,S-4,S-4)}catch(e){errs.push(tp+' '+e)}
        c.fillStyle='#ddd';c.font='9px sans-serif';c.fillText(ITPL[tp].n.slice(0,16),(tp%C)*S+2,Math.floor(tp/C)*(S+12)+S+8)}
      return {url:cv.toDataURL('image/png'),ms:(performance.now()-t0)/N,errs,lgb:Object.keys(LGB).filter(k=>k.startsWith('KQI')).length}}""")
    open(play.TMP+'/v89_icons_all.png','wb').write(base64.b64decode(r.pop('url').split(',')[1]))
    print(json.dumps(r))
# a busy machine can take over two minutes to parse the page: give goto more time (play.py uses 120 s)
from playwright.sync_api import Page as _Pg, Browser as _Br  # SLOWLOAD
_g0=_Pg.goto;_Pg.goto=lambda self,url,**k:_g0(self,url,**dict(k,timeout=600000))
_n0=_Br.new_page;_Br.new_page=lambda self,*a,**k:(lambda p:(p.set_default_timeout(240000),p)[1])(_n0(self,*a,**k))
play.run(s,w=1000,hh=620)
