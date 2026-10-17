# Screenshot tour of the world: town, portal court, every zone, hero close-up.
#   AW_TMP=/outdir [AW_OUT=build.html] [ONLY=town,z0,...] python3 tour.py
import play,os
ONLY=os.environ.get('ONLY','').split(',') if os.environ.get('ONLY') else None
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    T=ev("()=>{const T=TOWNS[0];return [T.cx,T.cy]}")
    spots=[('town',T[0],T[1]+6,0,9,.42),('town2',T[0]-10,T[1]-8,2.4,12,.5),('gate',T[0]+20,T[1],-1.57,14,.35),('court',None,None,0,10,.4),('hero',T[0],T[1]+6,3.14,3,.18)]
    spots+= [('z%d'%i,None,None,0,9,.38) for i in range(6)]
    errs=[]
    for name,x,z,yaw,dist,pitch in spots:
        if ONLY and name not in ONLY:continue
        r=ev("""([name,x,z,yaw,dist,pitch])=>{try{
          if(name=='court'){x=PCOURT[0];z=PCOURT[1]}
          if(name[0]=='z'&&name.length==2){const p=PMAP[+name[1]];x=p.en[0]+6;z=p.en[1]+6}
          toPos(x,z,yaw);camDist=dist;camPitch=pitch;snapCam();return 'ok'}catch(e){return String(e)}}""",[name,x,z,yaw,dist,pitch])
        pg.wait_for_timeout(5000)
        pg.screenshot(path=play.TMP+'/tour_'+name+'.png',timeout=120000,animations='disabled')
        print(name,r)
play.run(s,w=1000,hh=620)
