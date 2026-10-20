# v109 screenshots: empty plots as ground outlines (new game, 5 plots; then after a kill), the Steward plan. Writes out/v109_*.png
import play
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{const T=TOWNS[0];const l=LOTM103.CE;toPos(T.cx+l.x+4.6,T.cy+l.z+5);camYaw=0.7;camPitch=0.85;camDist=10;document.querySelectorAll('#banner,#glog').forEach(e=>e.innerHTML='')}")
    pg.wait_for_timeout(6000);pg.screenshot(path=play.TMP+'/v109_plots_town.png')
    ev("()=>{bossDefeated({ar:0});const T=TOWNS[0];const l=LOTM103.E1;toPos(T.cx+l.x-5.5,T.cy+l.z+4);camYaw=0.6;camPitch=1.0;camDist=15}")
    pg.wait_for_timeout(9000);ev("()=>document.querySelectorAll('#banner').forEach(e=>e.innerHTML='')");pg.wait_for_timeout(2500);pg.screenshot(path=play.TMP+'/v109_plots_new.png')
    ev("()=>{gold=5000;openX('hold')}");pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/v109_steward.png')
play.run(s)
