# Screenshots of boss arenas, wave-trial grounds, secret boulders and the fishing bobber.
#   AW_TMP=/outdir [ONLY=ar0,wv0,...] python3 arenas_shots.py
import play,os
ONLY=os.environ.get('ONLY','').split(',') if os.environ.get('ONLY') else None
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    shots=[('ar0','ar',0),('ar2','ar',2),('ar4','ar',4),('wv1','wv',1),('wv3','wv',3),('sec','sec',0),('fish','fish',0)]
    for name,k,i in shots:
        if ONLY and name not in ONLY:continue
        r=ev("""([k,i])=>{try{
          if(k=='ar'){const A=ARN[i];toPos(A.cx,A.cz+ARENA_R-.9,0);camDist=12;camPitch=.55;snapCam();return [A.cx,A.cz,ARENA_R]}
          if(k=='wv'){const p=PMAP[i];toPos(p.wa[0],p.wa[1]+9,0);camDist=12;camPitch=.55;snapCam();return p.wa}
          if(k=='sec'){const S=SECRETS.find(s=>s.g);if(!S)return 'none';toPos(S.x+3,S.z+3,.8);camDist=6;camPitch=.35;snapCam();return [S.x,S.z]}
          if(k=='fish'){const p=pl.position;fishStart([p.x+2,p.z+2]);camDist=4;camPitch=.3;snapCam();return 'f'}
        }catch(e){return String(e)}}""",[k,i])
        pg.wait_for_timeout(5000)
        pg.screenshot(path=play.TMP+'/arena_'+name+'.png',timeout=120000,animations='disabled')
        print(name,r)
play.run(s,w=1000,hh=620)
