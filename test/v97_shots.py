# v97 world screenshots: two spots per zone along the road, a high view of each zone, the zone map (N), Duskhold.
#   AW_TMP=<outdir> [SRC=build.html] [TAG=x] [ONLY=z0a,map3,...] python3 v97_shots.py   -> <outdir>/v97_<name>[_TAG].png
import play,os
ONLY=os.environ.get('ONLY','').split(',') if os.environ.get('ONLY') else None
TAG=('_'+os.environ['TAG']) if os.environ.get('TAG') else ''
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{CHEAT.god=true}")
    spots=[]
    for i in range(6):spots+=[('z%da'%i,i,.3,14,.42),('z%db'%i,i,.75,14,.42),('z%dhi'%i,i,.5,60,1.05),('map%d'%i,i,.5,0,0)]
    spots+=[('town',-1,0,10,.42)]
    for name,i,f,dist,pitch in spots:
        if ONLY and name not in ONLY:continue
        r=ev("""([name,i,f,dist,pitch])=>{try{
          if(i<0){const T=TOWNS[0];toPos(T.cx,T.cy+6,0)}else{const p=PMAP[i],k=Math.floor(p.path.length*f),q=p.path[k],n=p.path[Math.min(p.path.length-1,k+12)];toPos(q[0],q[1],Math.atan2(q[0]-n[0],q[1]-n[1]))}
          if(name.startsWith('map')){openWMap();return 'map'}
          camDist=dist;camPitch=pitch;snapCam();return 'ok'}catch(e){return String(e)}}""",[name,i,f,dist,pitch])
        pg.wait_for_timeout(6000)
        pg.screenshot(path=play.TMP+'/v97_%s%s.png'%(name,TAG),timeout=180000,animations='disabled')
        if name.startswith('map'):ev("()=>$('wmap').classList.add('hide')")
        print(name,r)
play.run(s,w=1000,hh=620)
