# Close-up screenshots of every Duskhold building (all shops built, stronghold upgrades raised).
#   AW_TMP=/outdir [ONLY=tp,magic,...] python3 town_shots.py
import play,os
ONLY=os.environ.get('ONLY','').split(',') if os.environ.get('ONLY') else None
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext',timeout=90000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=90000);pg.wait_for_timeout(3000)
    if os.environ.get('BUILT','1')=='1':
        ev("()=>{SHOPS.forEach(o=>SH.shop[o.k]=1);SHU.forEach(u=>SH.lv[u.k]=2+(u.k.length%2));shApply();visTick&&visTick()}")
    spots=ev("""()=>{const T=TOWNS[0],c=T.cx,z=T.cy,st=T.st2||{c:[c,z]},v=T.vsp||[[c,z]],P=PORT[2];
      const pc=[P.x+(PCOURT[0]-P.x)*.35,P.z+(PCOURT[1]-P.z)*.35];
      return [['tp',c,z-8.5,0,7,.28],['magic',c+14.25,z-8.5,0,7.5,.3],['tavern',c-14.25,z-8.5,0,7.5,.28],['fountain',c+1,z+5,.2,5.5,.32],
        ['stable',c-7,z-3.5,0,6,.3],['stations',st.c[0]+2,st.c[1]+3,-.6,6,.32],['banners',c+4,z+7,.6,8,.4],['stall',v[0][0]-3,v[0][1]+2,-1.0,6,.3],
        ['corner',c-24,z+24,2.35,9,.32],['lamp',c+9,z+2.5,-.5,4,.2],['portal',pc[0],pc[1],Math.atan2(pc[0]-P.x,pc[1]-P.z),6,.25]]}""")
    for name,x,z,yaw,dist,pitch in spots:
        if ONLY and name not in ONLY:continue
        ev("([x,z,yaw,dist,pitch])=>{toPos(x,z,yaw);camDist=dist;camPitch=pitch;snapCam()}",[x,z,yaw,dist,pitch])
        pg.wait_for_timeout(4500)
        pg.screenshot(path=play.TMP+'/ts_'+name+'.png',timeout=120000,animations='disabled');print(name)
play.run(s,w=1000,hh=620)
