# v86 den 1 — the Crest Hydra in the Serpent Mere: den screenshots, brood necks (rise/bite/spit/sever/sear/regrow), brood guard,
# tidal surge + raised stones, free AI run, win + fail cleanup.   SRC=<html> AW_TMP=<out dir> python3 v86_den1.py   (SHOTS=0 to skip)
import play,json,os
SH=os.environ.get('SHOTS','1')!='0'
def s(pg):
    ev=pg.evaluate
    T=play.TMP
    def shot(n):
        if SH:pg.screenshot(path=T+f'/v86d1_{n}.png',timeout=180000,animations='disabled')
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:1600])
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{enterMap(1)}");pg.wait_for_timeout(3500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
      if(window.PACE)PACE.basic=false;/* v96: no boss basic attacks in these mechanic checks */window.__pr=POST.render;window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();if(window.GOD)hero.iv=1;if(window.HOLD&&window.BE&&!BE.dead){BE.c.h=Math.max(BE.c.h,M(BE.c)*HOLD);BE.bs.t=Math.max(BE.bs.t,50)}if(i==n-1&&draw)POST.render=__pr;loop(VT)}POST.render=__pr;return VT};
      window.__down=down;down=function(){hero.hp=heroMax()};window.CLR=()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)})};window.AA=ARN[1];window.HITS=()=>{window.__h=0;const f=hitHero;window.__hf=f;hitHero=function(){__h++;return f.apply(this,arguments)}};window.UNHIT=()=>{hitHero=__hf;return __h};return 1}""")
    P('den',"()=>({ent:+HY.ent.toFixed(2),stones:HY.stones.length,slots:HY.slots.length,braz:HY.braz.length,kids:AA.g.children.length,tris:AA.g.children.reduce((a,o)=>a+(o.geometry&&o.geometry.attributes.position?o.geometry.attributes.position.count/3:0),0)|0})")
    ev("()=>{CLR();const a=HY.ent;toPos(AA.cx+Math.cos(a)*15.5,AA.cz+Math.sin(a)*15.5,0);camYaw=Math.atan2(Math.cos(a),Math.sin(a));camPitch=1.05;camDist=34;snapCam();STEP(.4,1);return 1}")
    shot('1_overview')
    ev("()=>{const a=HY.ent;camYaw=Math.atan2(Math.cos(a),Math.sin(a))+2.4;camPitch=.7;camDist=26;snapCam();STEP(.2,1);return 1}")
    shot('2_overview_b')
    ev("()=>{const a=HY.ent;toPos(AA.cx+Math.cos(a)*14,AA.cz+Math.sin(a)*14,0);camYaw=Math.atan2(Math.cos(a),Math.sin(a));camPitch=.2;camDist=8;snapCam();STEP(.3,1);return 1}")
    shot('3_ground_entrance')
    P('start',"""()=>{const a=HY.ent;toPos(AA.cx+Math.cos(a)*9,AA.cz+Math.sin(a)*9,0);STEP(.3);const e=bossEnt(1);window.BE=e;window.HOLD=1;e.bs.t=99;e.bs.ult=999;HY.nt=99;
      return {AF:!!AF,seal:HY.seal.visible,wall:AA.wall.visible,hp:Math.round(M(e.c)),atk:Math.round(atkOf('p'))}}""")
    ev("()=>{const a=HY.ent;camYaw=Math.atan2(Math.cos(a),Math.sin(a));camPitch=.35;camDist=12;snapCam();STEP(1,1);return 1}")
    shot('4_sealed')
    P('rise',"""()=>{const e=BE;HY.nt=99;BMV.hyNeck0(e,AA,1);BMV.hyNeck2(e,AA,1);BMV.hyNeck5(e,AA,1);const N=HY.necks[0];toPos(N.x+(AA.cx-N.x)*.35,N.z+(AA.cz-N.z)*.35);STEP(.6,1);
      camYaw=Math.atan2(N.x-pl.position.x,N.z-pl.position.z)+Math.PI+.4;camPitch=.45;camDist=12;snapCam();STEP(.05,1);return HY.necks.map(n=>n.st)}""")
    shot('5_neck_tele')
    P('up',"()=>{HY.necks.forEach(n=>n.cd=99);STEP(2.4,1);return {st:HY.necks.map(n=>n.st),guard:HY.guard,hpM:HY.necks[0].hpM}}")
    shot('6_necks_up')
    P('guard',"()=>{const e=BE,h=e.c.h;hurt(e,1000,{});const d1=h-e.c.h;HY.necks[2].st='off';HY.guard=false;const h2=e.c.h;hurt(e,1000,{});const d2=h2-e.c.h;HY.necks[2].st='up';return {guarded:Math.round(d1),open:Math.round(d2)}}")
    P('bite',"""()=>{const N=HY.necks[0];toPos(N.x+(AA.cx-N.x)/11*3,N.z+(AA.cz-N.z)/11*3);N.cd=0;HY.lastAtk=-9;HITS();STEP(.55,1);return N.atk&&N.atk.k}""")
    shot('7_bite_windup')
    P('bite2',"()=>{STEP(.9,1);return {hits:UNHIT()}}")
    shot('8_bite_strike')
    P('spit',"""()=>{const N=HY.necks[1].st=='up'?HY.necks[1]:HY.necks[2];toPos(AA.cx,AA.cz-3);N.cd=0;HY.lastAtk=-9;HITS();STEP(.6,1);
      camYaw=Math.atan2(N.x-pl.position.x,N.z-pl.position.z)+Math.PI+.6;camPitch=.5;camDist=13;snapCam();STEP(.05,1);return N.atk&&N.atk.k}""")
    shot('9_spit')
    P('spit2',"()=>{STEP(1.4);return {hits:UNHIT(),pools:(AA.bx||[]).length}}")
    P('sever',"""()=>{HY.necks.forEach(n=>n.cd=99);const N=HY.necks[0];toPos(N.x+(AA.cx-N.x)/11*1.6,N.z+(AA.cz-N.z)/11*1.6);const h0=BE.c.h;let n=0;while(N.st=='up'&&n<300){area(pl.position,2.4,atkOf('p'),{mt:'p',basic:1},null,Math.PI);n++}
      STEP(.3,1);camYaw=Math.atan2(N.x-pl.position.x,N.z-pl.position.z)+Math.PI+.5;camPitch=.4;camDist=9;snapCam();STEP(.05,1);return {swings:n,st:N.st,wound:+((h0-BE.c.h)/M(BE.c)*100).toFixed(1),T:N.T0}}""")
    shot('10_stump')
    P('fire',"""()=>{const b=HY.braz[0];toPos(b.x+(AA.cx-b.x)/12*1.2,b.z+(AA.cz-b.z)/12*1.2);STEP(.3,1);camYaw=Math.atan2(b.x-pl.position.x,b.z-pl.position.z)+Math.PI+.5;camPitch=.35;camDist=8;snapCam();STEP(.05,1);
      return {fire:+(HY.fire-HY.clk).toFixed(1),buff:hero.buffs.some(q=>q.n=='Serpent-fire')}}""")
    shot('11_serpent_fire')
    P('sear',"()=>{const N=HY.necks[0],h0=BE.c.h;toPos(N.x+.6,N.z+.6);STEP(.3,1);return {st:N.st,wound:+((h0-BE.c.h)/M(BE.c)*100).toFixed(1)}}")
    shot('12_seared')
    P('regrow',"""()=>{HY.fire=0;STEP(.2);const N=HY.necks[2];toPos(N.x+(AA.cx-N.x)/11*1.6,N.z+(AA.cz-N.z)/11*1.6);let n=0;while(N.st=='up'&&n<300){area(pl.position,2.4,atkOf('p'),{mt:'p',basic:1},null,Math.PI);n++}
      toPos(AA.cx-4,AA.cz+4);HY.necks.forEach(q=>q.cd=99);const live0=hyLive();STEP(N.T0+.2,1);return {before:live0,after:hyLive(),st:HY.necks.map(q=>q.st)}}""")
    shot('13_two_heads')
    P('ranged',"()=>{STEP(1.5);const N=HY.necks.find(q=>q.st=='up');const hp=N.hp;const d=V(N.x-pl.position.x,0,N.z-pl.position.z).normalize();toPos(N.x-d.x*6,N.z-d.z*6);launch(pl.position,d,24,{col:0xe8d8b0,arrow:1,mt:'p',basic:1},100,1.1);STEP(.5);return [hp,N.hp]}")
    # tidal surge
    P('tide',"""()=>{HY.necks.forEach(hyOff);const e=BE;e.bs.lock=0;const s=HY.stones[0];toPos(AA.cx+(s[0]-AA.cx)*.6,AA.cz+(s[1]-AA.cz)*.6);HITS();BMV.tide(e,AA,1);STEP(.9,1);
      camYaw=Math.atan2(AA.cx-pl.position.x,AA.cz-pl.position.z)+Math.PI;camPitch=.75;camDist=20;snapCam();STEP(.05,1);return {glow:+HY.gk.toFixed(2)}}""")
    shot('14_tide_warn')
    P('tide2',"()=>{STEP(.75,1);return {waves:HY.waves.filter(w=>w.on).map(w=>+w.r.toFixed(1)),hits:__h}}")
    shot('15_tide_wave')
    P('tide3',"()=>{STEP(1.2);return {hits:UNHIT(),py:+(pl.position.y-GH(pl.position.x,pl.position.z)).toFixed(2)}}")
    P('tideSafe',"""()=>{const s=HY.stones[0];toPos(s[0],s[1]);STEP(.1);const lift=+(pl.position.y-GH(s[0],s[1])).toFixed(2);BE.bs.lock=0;HITS();BMV.tide(BE,AA,1);STEP(3.5);return {lift,hits:UNHIT()}}""")
    ev("()=>{const s=HY.stones[0];camYaw=Math.atan2(AA.cx-s[0],AA.cz-s[1])+Math.PI+.5;camPitch=.3;camDist=7;snapCam();STEP(.1,1);return 1}")
    shot('16_on_stone')
    P('ph2',"()=>{window.HOLD=0;BE.c.h=M(BE.c)*.6;STEP(.4);BE.bs.lock=0;BMV.tide(BE,AA,1);STEP(2.9,1);return {ph:BE.bs.ph,waves:HY.waves.filter(w=>w.on).length}}")
    shot('17_double_tide')
    P('ai',"()=>{BE.bs.t=1;BE.bs.lock=0;HY.nt=0;const log=[];for(let i=0;i<50;i++){STEP(.5);log.push(BE.bs.last)}return {moves:[...new Set(log)],live:hyLive(),stumps:hyStumps(),hud:$('d01hud').textContent}}")
    ev("()=>{camYaw=0;camPitch=.8;camDist=22;snapCam();STEP(.1,1);return 1}")
    shot('18_ai_run')
    P('ph3',"()=>{BE.c.h=M(BE.c)*.3;for(let i=0;i<20;i++)STEP(.5);return {ph:BE.bs.ph,live:hyLive()}}")
    P('win',"()=>{hurt(BE,1e9,1);STEP(1.5);return {AF:!!AF,necks:HY.necks.filter(n=>n.g.visible).length,waves:HY.waves.filter(w=>w.ms.visible).length,hud:$('d01hud')&&$('d01hud').style.display,fire:hero.buffs.some(b=>b.n=='Serpent-fire'),shell:HY.shell.visible,bx:(AA.bx||[]).length,fx:AA.fx.length,minions:enemies.filter(x=>x.minion).length}}")
    P('win2',"()=>{STEP(3);return {seal:HY.seal.visible}}")
    P('fail',"""()=>{spawnBoss(1);STEP(.2);const e=bossEnt(1);window.BE=e;toPos(AA.cx+5,AA.cz,0);STEP(.5);const st=!!AF;BMV.hyNeck1(e,AA,1);BMV.tide(e,AA,1);STEP(1.8);arenaFail();toPos(AA.cx+Math.cos(HY.ent)*17,AA.cz+Math.sin(HY.ent)*17);STEP(1);
      return {started:st,AF:!!AF,necks:HY.necks.filter(n=>n.g.visible).length,waves:HY.waves.filter(w=>w.ms.visible).length,hud:$('d01hud').style.display}}""")
    P('late',"()=>{STEP(2);return {necks:HY.necks.filter(n=>n.g.visible).length,st:HY.necks.map(n=>n.st)}}")
    P('restart',"()=>{toPos(AA.cx+15,AA.cz);STEP(1);toPos(AA.cx+5,AA.cz);STEP(.5);const r={AF:!!AF,seal:HY.seal.visible};hurt(bossEnt(1),1e9,1);STEP(2);r.after=!!AF;return r}")
play.run(s,w=1000,hh=640)
