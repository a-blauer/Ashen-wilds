# enemy archers use the hero's bow shot: frames through wind-up, release and recovery
import play,json
def s(pg):
    ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{enterMap(0)}");pg.wait_for_timeout(3500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
      window.__pr=POST.render;window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();hero.iv=1;if(i==n-1&&draw)POST.render=__pr;loop(VT)}POST.render=__pr;return VT};
      window.CLR=()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)})};return 1}""")
    for key in ['bonearcher','nagaa']:
        print(key,ev("""(key)=>{CLR();const p=pl.position,e=spawnEnemy(key,p.x+4,p.z-3,5,{agg:1});e.cd=99;e._kp=1;e.m.position.set(p.x+4,0,p.z-3);
          camYaw=Math.atan2(-1,0);camPitch=.25;camDist=6;window.__e=e;mStart(e,pl,'throw');snapCam();return [!!e.m.bowW,e.atk&&e.atk.T]}""",key))
        for i in range(6):
            st=ev("()=>{const e=__e;STEP(.12,1);const c=V().copy(e.m.position).add(V(-.5,0,4.5));cam.position.set(c.x,GH(c.x,c.z)+1.6,c.z);cam.lookAt(e.m.position.x,GH(e.m.position.x,e.m.position.z)+1.1,e.m.position.z);POST.render&&POST.render();return [e.atk&&e.atk.ph,e.m.ak&&+e.m.ak.k.toFixed(2),e.m.bowFx&&e.m.bowFx.g.visible]}")
            print(' ',st)
            pg.locator('#stage').screenshot(path=play.TMP+'/v85_ebow_%s_%d.png'%(key,i),timeout=180000)
    print('ERRS',errs[:3])
play.run(s,w=900,hh=560)
