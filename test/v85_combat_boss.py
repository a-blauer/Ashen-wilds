# v85 Sovereign spell visuals + Rime Wraith edge orbs (split from v85_combat.py): enemy projectiles/cast effects, ranges, dimmer telegraphs, companion spell ranges, Rime Wraith orbs
# SRC=<html> AW_TMP=<out dir> python3 v85_combat.py
import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:1500])
    ev("()=>{enterMap(0)}");pg.wait_for_timeout(3500)
    # virtual clock: stop the real loop and step it by hand so screenshots land mid-attack
    ev("""()=>{window.VT=performance.now();const pn=performance.now.bind(performance);performance.now=()=>VT;window.requestAnimationFrame=()=>0;
      window.__pr=POST.render;window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();if(window.GOD)hero.iv=1;if(i==n-1&&draw)POST.render=__pr;loop(VT)}POST.render=__pr;return VT};
      window.CLR=()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)})};return 1}""")
    pg.wait_for_timeout(1500)
    ev("()=>{CLR();const p=pl.position;toPos(p.x,p.z,0);camPitch=.42;camDist=9;snapCam();STEP(.3);return 1}")
    # Rime Wraith orbs gather at the arena edge
    ev("()=>{window.GOD=1;performance.now=()=>VT;enterMap(2);return 1}");pg.wait_for_timeout(1500);ev("()=>{STEP(1.2);return 1}")
    P('arena',"""()=>{const A=ARN[2],e=bossEnt(2)||spawnBoss(2);toPos(A.cx+3,A.cz+5,0);e.m.position.set(A.cx,0,A.cz-2);arenaStart(A,e);e.bs.t=99;e.bs.ult=99;camPitch=.75;camDist=17;snapCam();STEP(.1);
      BMV.orbs(e,A,1.28);STEP(.7,1);e.bs.t=99;return [A.b.name,KQ.fx.length]}""")
    P('redprobe',"""()=>{const e=bossEnt(2),out=[];scene.traverse(o=>{if(!o.isMesh||!o.visible||!o.material||!o.material.color)return;const c=o.material.color;if(c.r>.7&&c.g<.5&&c.b<.4){const p=new THREE.Vector3();o.getWorldPosition(p);if(d2(p,e.m.position)<8)out.push([o.geometry.type,JSON.stringify(o.geometry.parameters||{}).slice(0,80),c.getHexString(),o.material.opacity,o.parent&&o.parent.type,o.renderOrder])}});return out}""")
    pg.screenshot(path=play.TMP+'/v85c_orbs_1warn.png',timeout=120000,animations='disabled')
    P('orbs',"""()=>{const A=ARN[2],e=bossEnt(2);STEP(.6);e.bs.t=99;const o=A.bx.filter(f=>f.k=='orb');const d0=o.map(f=>+Math.hypot(f.ms.position.x-A.cx,f.ms.position.z-A.cz).toFixed(1));STEP(1.0,1);e.bs.t=99;
      const d1=o.map(f=>+Math.hypot(f.ms.position.x-A.cx,f.ms.position.z-A.cz).toFixed(1));return {n:o.length,startDist:d0,after1s:d1,ARENA_R}}""")
    pg.screenshot(path=play.TMP+'/v85c_orbs_2fly.png',timeout=120000,animations='disabled')
    # other Sovereign spells
    for k in ['mines','bonelines','spit','lightning']:
        r=ev("""(k)=>{const A=ARN[2],e=bossEnt(2);A.bx.forEach(f=>{if(f.ms)scene.remove(f.ms)});A.bx.length=0;toPos(A.cx+3,A.cz+5,0);snapCam();e.bs.t=99;BMV[k](e,A,1.28);STEP(k=='mines'?1.5:k=='lightning'?.95:.85,1);e.bs.t=99;return [k,KQ.fx.length]}""",k)
        print('boss',r);pg.screenshot(path=play.TMP+f'/v85c_boss_{k}.png',timeout=120000,animations='disabled');ev("()=>{STEP(2.5);return 1}")
play.run(s,w=1000,hh=620)
