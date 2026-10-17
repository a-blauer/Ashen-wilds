# close-up of the Frozen Sepulchre's frozen challengers (no fight)
import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{enterMap(2)}");pg.wait_for_timeout(3500)
    print(ev("()=>{const D=ARN[2].dn;return D.st.map(s=>{const p=new THREE.Vector3();s.fig.getWorldPosition(p);return [s.x.toFixed(1),s.z.toFixed(1),p.y.toFixed(2),s.g.visible,s.fig.visible,s.g.parent===ARN[2].g,s.fig.geometry.attributes.position.count]})}"))
    ev("""()=>{const D=ARN[2].dn,s=D.st[1],A=ARN[2],a=Math.atan2(s.z-A.cz,s.x-A.cx);ARN.forEach(q=>q.f=false);window.AF=null;
      pl.position.set(s.x-Math.cos(a)*3.2,0,s.z-Math.sin(a)*3.2);camYaw=Math.atan2(-Math.cos(a),-Math.sin(a))+.4;camPitch=.3;camDist=6;snapCam();}""")
    pg.wait_for_timeout(5000)
    pg.screenshot(path=play.TMP+'/v86d2_statue_close.png',timeout=180000)
play.run(s,w=1000,hh=620)
