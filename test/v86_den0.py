# v86 den 0 — Argus in the Drowned Hollow: den screenshots, eye-stalk gaze/Seen/Mark, Great Eye beam, stalk kill, Lights Out, win + fail cleanup
# SRC=<html> AW_TMP=<out dir> python3 v86_den0.py      (SHOTS=0 to skip screenshots)
import play,json,os
SH=os.environ.get('SHOTS','1')!='0'
def s(pg):
    ev=pg.evaluate
    T=play.TMP
    def shot(n):
        if SH:pg.screenshot(path=T+f'/v86d0_{n}.png',timeout=180000,animations='disabled')
    P=lambda n,c,a=None:print(n,'=>',json.dumps(ev(c,a) if a is not None else ev(c))[:1600])
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{enterMap(0)}");pg.wait_for_timeout(3500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
      if(window.PACE)PACE.basic=false;/* v96: no boss basic attacks in these mechanic checks */window.__pr=POST.render;window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();if(window.GOD)hero.iv=1;if(window.HOLD&&window.BE&&!BE.dead){BE.c.h=Math.max(BE.c.h,M(BE.c)*HOLD);BE.bs.t=Math.max(BE.bs.t,50)}if(i==n-1&&draw)POST.render=__pr;loop(VT)}POST.render=__pr;return VT};
      window.__down=down;down=function(){hero.hp=heroMax()};window.CLR=()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)})};window.AA=ARN[0];return 1}""")
    P('den',"()=>({ent:+AR.ent.toFixed(2),pil:AR.pil.map(p=>p.map(v=>+v.toFixed(1))),pools:AR.pools.length,st:AR.st.length,kids:AA.g.children.length,tris:AA.g.children.reduce((a,o)=>a+(o.geometry&&o.geometry.attributes.position?o.geometry.attributes.position.count/3:0),0)|0,blocked:DENB.size})")
    # overview from above (outside the circle so the fight doesn't start)
    ev("()=>{CLR();const a=AR.ent;toPos(AA.cx+Math.cos(a)*15.5,AA.cz+Math.sin(a)*15.5,0);camYaw=Math.atan2(Math.cos(a),Math.sin(a));camPitch=1.05;camDist=34;snapCam();STEP(.4,1);return 1}")
    shot('1_overview')
    ev("()=>{const a=AR.ent;camYaw=Math.atan2(Math.cos(a),Math.sin(a))+2.2;camPitch=.75;camDist=26;snapCam();STEP(.2,1);return 1}")
    shot('2_overview_b')
    # ground level at the entrance
    ev("()=>{const a=AR.ent;toPos(AA.cx+Math.cos(a)*14,AA.cz+Math.sin(a)*14,0);camYaw=Math.atan2(Math.cos(a),Math.sin(a));camPitch=.18;camDist=8;snapCam();STEP(.3,1);return 1}")
    shot('3_ground_entrance')
    # start the fight
    P('start',"()=>{const a=AR.ent;toPos(AA.cx+Math.cos(a)*9,AA.cz+Math.sin(a)*9,0);STEP(.3);const e=bossEnt(0);window.BE=e;window.HOLD=1;e.bs.t=99;return {AF:!!AF,seal:AR.seal.visible,wall:AA.wall.visible,hp:Math.round(M(e.c)),stalkHp:AR.st[0].hpM,atk:Math.round(atkOf('p'))}}")
    ev("()=>{const a=AR.ent;camYaw=Math.atan2(Math.cos(a),Math.sin(a));camPitch=.35;camDist=12;snapCam();STEP(1,1);return 1}")
    shot('4_sealed')
    # wake stalk 2 with the hero standing in front of it
    P('wake',"()=>{const T=AR.st[2],e=BE;e.bs.t=99;e.m.position.set(AA.cx,0,AA.cz);const dx=AA.cx-T.x,dz=AA.cz-T.z,l=Math.hypot(dx,dz);toPos(T.x+dx/l*7,T.z+dz/l*7,0);AR.wt=99;AR.seen=0;BMV.arEye2(e,AA,1);STEP(.7);return [T.st,+T.lid.toFixed(2)]}")
    ev("()=>{const T=AR.st[2];camYaw=Math.atan2(T.x-pl.position.x,T.z-pl.position.z)+Math.PI;camPitch=.6;camDist=13;snapCam();STEP(.1,1);return 1}")
    shot('5_stalk_wake')
    P('open',"()=>{STEP(1.3);const T=AR.st[2];toPos(pl.position.x,pl.position.z);return [T.st,+AR.seen.toFixed(2)]}")
    # stand in the gaze: aim the sweep through the hero
    P('gaze',"()=>{const T=AR.st[2];const y=arEyeYaw(T);T.y0=y-.05;T.y1=y+.05;T.t=0;STEP(.9,1);return [T.st,+AR.seen.toFixed(2),AR.sN,$('d01hud').textContent]}")
    shot('6_in_gaze')
    P('mark',"()=>{const T=AR.st[2];const y=arEyeYaw(T);T.y0=y;T.y1=y;T.t=0;BE.bs.lock=0;let n=0;while(!AR.mark&&n++<200)STEP(.05);const m=!!AR.mark;STEP(.35,1);return {marked:m,done:AR.mark&&AR.mark.done,jmp:!!BE.jmp,hud:$('d01hud').textContent}}")
    shot('7_marked_leap')
    P('leap',"()=>{const h=hero.hp;let hits=0;const f=hitHero;hitHero=function(){hits++;return f.apply(this,arguments)};STEP(2.0);hitHero=f;const r={hits,mark:!!AR.mark};AR.st.forEach(arReset);AR.mark=null;AR.seen=0;return r}")
    # hide behind a pillar: the cone stops at it and Seen doesn't grow
    P('hide',"""()=>{const T=AR.st.slice().sort((a,b)=>Math.min(...AR.pil.map(p=>Math.hypot(p[0]-a.x,p[1]-a.z)))-Math.min(...AR.pil.map(p=>Math.hypot(p[0]-b.x,p[1]-b.z))))[0];const p=AR.pil.slice().sort((a,b)=>Math.hypot(a[0]-T.x,a[1]-T.z)-Math.hypot(b[0]-T.x,b[1]-T.z))[0];
      const dx=p[0]-T.ox,dz=p[1]-T.oz,l=Math.hypot(dx,dz);toPos(p[0]+dx/l*1.9,p[1]+dz/l*1.9,0);arReset(T);T.st='open';T.t=0;T.dur=9;T.spr.visible=true;const y=arEyeYaw(T);T.y0=y-.02;T.y1=y+.02;AR.seen=0;AR.mark=null;window.ZT=T;STEP(1.5);
      camYaw=Math.atan2(T.x-pl.position.x,T.z-pl.position.z)+Math.PI*.8;camPitch=.85;camDist=15;snapCam();STEP(.1,1);return {seen:+AR.seen.toFixed(2),stalk:T.i,d:+l.toFixed(1)}}""")
    shot('8_hidden_behind_pillar')
    # kill that stalk with melee hits (area() is what swings use)
    P('killStalk',"()=>{const T=ZT;toPos(T.x+(AA.cx-T.x)/12*1.8,T.z+(AA.cz-T.z)/12*1.8,0);const h0=BE.c.h;let n=0;while(T.st!='dead'&&n<200){area(pl.position,2.4,atkOf('p'),{mt:'p',basic:1},null,Math.PI);n++}STEP(.6,1);return {swings:n,st:T.st,bossDmg:Math.round(h0-BE.c.h),pct:+((h0-BE.c.h)/M(BE.c)*100).toFixed(1)}}")
    ev("()=>{const T=ZT;camYaw=Math.atan2(T.x-pl.position.x,T.z-pl.position.z)+Math.PI+.5;camPitch=.35;camDist=9;snapCam();STEP(.1,1);return 1}")
    shot('9_stalk_dead')
    # ranged: a shot flying at another stalk
    P('shotStalk',"()=>{const T=AR.st.find(q=>q.st!='dead'&&q!==ZT);arReset(T);const hp=T.hp;const d=V(T.x-pl.position.x,0,T.z-pl.position.z).normalize();toPos(T.x-d.x*6,T.z-d.z*6);launch(pl.position,d,24,{col:0xe8d8b0,arrow:1,mt:'p',basic:1},100,1.1);STEP(.5);return [hp,T.hp]}")
    # the Great Eye beam
    P('beam',"""()=>{CLR();arReset(ZT);AR.st.forEach(arReset);const e=BE;e.m.position.set(AA.cx,0,AA.cz);toPos(AA.cx+Math.cos(AR.ent)*6.5,AA.cz+Math.sin(AR.ent)*6.5,0);AR.seen=0;AR.mark=null;e.bs.lock=0;BMV.argusgaze(e,AA,1);STEP(.6);
      camYaw=Math.atan2(e.m.position.x-pl.position.x,e.m.position.z-pl.position.z)+Math.PI+.7;camPitch=.55;camDist=14;snapCam();STEP(.1,1);return {warm:+AR.beam.warm.toFixed(2)}}""")
    shot('10_beam_warm')
    P('beam2',"()=>{let hits=0;const f=hitHero;hitHero=function(){hits++;return f.apply(this,arguments)};STEP(1.0,1);hitHero=f;return {hits,seen:+AR.seen.toFixed(2),t:AR.beam&&+AR.beam.t.toFixed(2)}}")
    shot('11_beam_fire')
    P('beamHide',"()=>{const e=BE,p=AR.pil[0],dx=p[0]-e.m.position.x,dz=p[1]-e.m.position.z,l=Math.hypot(dx,dz);toPos(p[0]+dx/l*1.8,p[1]+dz/l*1.8);AR.beam.yaw=Math.atan2(dx,dz);AR.seen=0;let hits=0;const f=hitHero;hitHero=function(){hits++;return f.apply(this,arguments)};STEP(.8,1);hitHero=f;return {hits,seen:+AR.seen.toFixed(2)}}")
    shot('12_beam_blocked')
    # phase 2 regrow, phase 3 lights out + argstalk
    P('ph2',"()=>{window.HOLD=0;STEP(2);AR.st[0].st='dead';arKillStalk(AA,AR.st[0]);BE.c.h=M(BE.c)*.6;BE.bs.t=99;STEP(.5);return {ph:BE.bs.ph,st0:AR.st[0].st}}")
    P('ph3',"()=>{BE.c.h=M(BE.c)*.3;BE.bs.t=99;AR.wt=99;STEP(3);return {ph:BE.bs.ph,dk:+AR.dk.toFixed(2),sun:+sun.intensity.toFixed(3)}}")
    ev("()=>{toPos(AA.cx-3,AA.cz+5);camPitch=.5;camDist=12;snapCam();BMV.arEye1(BE,AA,1);BMV.arEye4(BE,AA,1);STEP(1.6,1);return 1}")
    shot('13_lights_out')
    P('stalk',"()=>{BE.bs.lock=0;BMV.argstalk(BE,AA,1);STEP(1.4,1);return {hid:BE.hid,eyes:AR.eyes.visible}}")
    shot('14_argstalk_tell')
    P('stalk2',"()=>{STEP(1.0,1);return {hid:BE.hid,dash:!!BE.bs.dash}}")
    shot('15_argstalk_dash')
    # a free-running stretch of the real AI in phase 3 (moves chosen by the boss)
    P('ai',"()=>{BE.bs.t=.5;BE.bs.lock=0;AR.wt=2;const log=[];const f=BMV.argusgaze;for(let i=0;i<40;i++){STEP(.5);log.push(BE.bs.last)}return [...new Set(log)]}")
    # win: kill Argus, everything is cleaned up
    P('win',"()=>{hurt(BE,1e9,1);STEP(1.5);const vis=AR.st.filter(T=>T.fan.visible).length;return {AF:!!AF,fans:vis,beam:AR.bm.visible||AR.bm3.visible,hud:$('d01hud')&&$('d01hud').style.display,mired:hero.buffs.some(b=>b.n=='Mired'),seal:AR.seal.visible,dk:+AR.dk.toFixed(2),wall:AA.wall.visible,bx:(AA.bx||[]).length,fx:AA.fx.length}}")
    P('win2',"()=>{STEP(3);return {seal:AR.seal.visible,dk:+AR.dk.toFixed(2)}}")
    # fail: respawn, start, fall
    P('fail',"""()=>{spawnBoss(0);STEP(.2);const e=bossEnt(0);window.BE=e;toPos(AA.cx+5,AA.cz,0);STEP(.5);const st=!!AF;BMV.arEye0(e,AA,1);BMV.argusgaze(e,AA,1);STEP(1.5);arenaFail();toPos(AA.cx+Math.cos(AR.ent)*17,AA.cz+Math.sin(AR.ent)*17);STEP(1);
      return {started:st,AF:!!AF,fans:AR.st.filter(T=>T.fan.visible).length,beam:AR.bm.visible,face:e.bs.face,hud:$('d01hud').style.display,sealGoing:AR.seal.scale.y<1}}""")
    P('restart',"()=>{toPos(AA.cx+15,AA.cz);STEP(1);toPos(AA.cx+5,AA.cz);STEP(.5);const r={AF:!!AF,seal:AR.seal.visible};hurt(bossEnt(0),1e9,1);STEP(2);r.after=!!AF;return r}")
    P('errors',"()=>window.__errs||0")
play.run(s,w=1000,hh=640)
