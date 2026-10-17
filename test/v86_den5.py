# v86 den 5 — The Crimson Throne Hall (Lord Vaelric, final boss): den screenshots, every mechanic, win / fail / respawn cleanup
# SRC=<html> AW_TMP=<out dir> python3 v86_den5.py
import play,json,os
SHOTS=os.environ.get('SHOTS','1')=='1'
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c,*a:print(n,'=>',json.dumps(ev(c,*a))[:2500])
    def shot(n):
        if SHOTS:pg.screenshot(path=play.TMP+'/v86d5_'+n+'.png',timeout=120000,animations='disabled')
    ev("()=>{hero.lvl=51;hsDirty();hero.hp=heroMax();enterMap(5);return 1}");pg.wait_for_timeout(2500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();if(window.GOD)hero.iv=1;if(window.BHP){const b=bossEnt(5);if(b)b.c.h=Math.max(b.c.h,M(b.c)*BHP)}if(i==n-1&&draw)POST.render=__pr;loop(VT)}POST.render=__pr;return VT};
      window.VIEW=(px,py,pz,tx,ty,tz)=>{cam.position.set(px,py,pz);cam.lookAt(tx,ty,tz);FADE.cam.value.copy(cam.position);__pr();return 1};
      window.CLR=()=>{enemies.slice().forEach(e=>{if(!e.boss&&!e.dprop)removeE(e)})};return 1}""")
    ev("()=>{STEP(1);CLR();return 1}")
    P('den',"""()=>{const A=ARN[5];return {ea:+A.dqA.toFixed(2),children:A.g.children.length,tris:A.g.children.reduce((n,o)=>n+(o.geometry&&o.geometry.attributes.position?o.geometry.attributes.position.count/3:0),0)|0,blocked:DENB.size}}""")
    for n,(r,h,ao) in {'over':(21,17,0.0),'over2':(19,13,2.2),'over3':(16,10,-1.6)}.items():
        ev(f"""()=>{{const A=ARN[5],a=A.dqA+{ao},y=GH(A.cx,A.cz);toPos(A.cx+Math.cos(A.dqA)*20,A.cz+Math.sin(A.dqA)*20);STEP(.1);VIEW(A.cx+Math.cos(a)*{r},y+{h},A.cz+Math.sin(a)*{r},A.cx,y,A.cz);return 1}}""");shot(n)
    ev("""()=>{const A=ARN[5],y=GH(A.cx,A.cz),f=A.dqA+Math.PI;VIEW(A.cx+Math.cos(A.dqA)*12,y+2.2,A.cz+Math.sin(A.dqA)*12,A.cx+Math.cos(f)*14,y+3.5,A.cz+Math.sin(f)*14);return 1}""");shot('ground_throne')
    ev("""()=>{const A=ARN[5],y=GH(A.cx,A.cz),a=A.dqA+1.6;VIEW(A.cx-Math.cos(a)*6,y+2.0,A.cz-Math.sin(a)*6,A.cx+Math.cos(a)*16,y+5,A.cz+Math.sin(a)*16);return 1}""");shot('ground_side')
    ev("""()=>{const A=ARN[5],y=GH(A.cx,A.cz);VIEW(A.cx+Math.cos(A.dqA)*25,y+3.5,A.cz+Math.sin(A.dqA)*25,A.cx,y+2,A.cz);return 1}""");shot('gate')
    # ---------- fight ----------
    P('start',"""()=>{const A=ARN[5],e=bossEnt(5);window.GOD=1;window.BHP=.95;toPos(A.cx+Math.cos(A.dqA)*9,A.cz+Math.sin(A.dqA)*9,0);camPitch=.45;camDist=12;snapCam();STEP(.6);
      e.bs.t=99;STEP(1.2,1);const bb=new THREE.Box3().setFromObject(e.m);return {hp:+(e.c.h/M(e.c)).toFixed(2),ph:e.bs.ph,rite:!!A.dq.rite,f:A.f,gateY:+D5.gate.position.y.toFixed(2),cur:D5.cur.visible,boss:[+(bb.max.y-bb.min.y).toFixed(2)],pool:BSTY[5].pool,ult:A.b.ult}}""")
    shot('fight_start')
    if os.environ.get('STOP')=='start':return
    P('chalices',"""()=>{const A=ARN[5],e=bossEnt(5);e.bs.t=99;STEP(3.5);e.bs.t=99;window.BHP=0;e.c.h=M(e.c)*.8;const h0=e.c.h;STEP(2,1);window.BHP=.8;return {chal:A.dq.chal.length,teth:A.dq.teth.length,healed:Math.round(e.c.h-h0),props:A.dq.props.map(p=>p.c.n)}}""")
    shot('chalices')
    ev("()=>{const A=ARN[5],p=A.dq.chal[0];VIEW(p.m.position.x+4,GH(A.cx,A.cz)+3.5,p.m.position.z+4,p.m.position.x,GH(A.cx,A.cz)+1.5,p.m.position.z);return 1}");shot('chalice_close')
    P('chalice_kill',"""()=>{const A=ARN[5],e=bossEnt(5),xp=hero.xp;A.dq.chal.slice().forEach(p=>{for(let k=0;k<300&&!p.dead;k++)heroHit(p,5000,'p')});STEP(.5);return {chal:A.dq.chal.length,teth:A.dq.teth.length,xp:hero.xp-xp}}""")
    # bloodfan
    P('bloodfan',"""()=>{const A=ARN[5],e=bossEnt(5);e.bs.t=99;e.m.position.set(A.cx,0,A.cz);toPos(A.cx+Math.cos(A.dqA)*6,A.cz+Math.sin(A.dqA)*6);snapCam();BMV.bloodfan(e,A,1.28);STEP(.8,1);e.bs.t=99;return e.m.ak}""");shot('bloodfan')
    ev("()=>{STEP(1.5);bossEnt(5).bs.t=99;return 1}")
    # bat swarm
    P('bats',"""()=>{const A=ARN[5],e=bossEnt(5);e.bs.t=99;e.bs.lock=0;const r=BMV.batswarm(e,A,1.28);STEP(1.1,1);e.bs.t=99;return {r,hid:e.hid,fx:A.dq.fx.length,bats:D5.bats.filter(b=>b.on).length}}""");shot('bats_warn')
    P('bats_hit',"""()=>{const A=ARN[5],e=bossEnt(5);window.GOD=0;hero.iv=0;window.__bh=0;window.__hf=hitHero;hitHero=function(){__bh++;return __hf.apply(this,arguments)};STEP(.9,1);return {bats:D5.bats.filter(b=>b.on).length}}""");shot('bats_fly')
    P('bats_end',"""()=>{const A=ARN[5],e=bossEnt(5);STEP(4);hitHero=__hf;window.GOD=1;const hits=__bh;e.bs.t=99;return {hits,hid:e.hid,bats:D5.bats.filter(b=>b.on).length,lock:+e.bs.lock.toFixed(2)}}""")
    # phase 2: mirror + blood moon
    P('ph2',"""()=>{const A=ARN[5],e=bossEnt(5);CLR();window.BHP=.6;e.c.h=M(e.c)*.6;e.bs.t=99;e.bs.lock=0;STEP(.3);e.bs.t=99;STEP(3);e.bs.t=99;return {ph:e.bs.ph,chal:A.dq.chal.length}}""")
    P('mirror',"""()=>{const A=ARN[5],e=bossEnt(5);e.bs.t=99;e.bs.lock=0;toPos(A.cx,A.cz);snapCam();const r=BMV.mirror(e,A,dqEnc(1.28,2));STEP(1.4,1);e.bs.t=99;return {r,props:A.dq.props.filter(p=>p.c.n=='Crimson Double').length}}""");shot('mirror')
    ev("()=>{const A=ARN[5],e=bossEnt(5);VIEW(A.cx+Math.cos(A.dqA)*9,GH(A.cx,A.cz)+9,A.cz+Math.sin(A.dqA)*9,A.cx,GH(A.cx,A.cz),A.cz);return 1}");shot('mirror_top')
    P('mirror_hit',"""()=>{const A=ARN[5],e=bossEnt(5);heroHit(e,500,'p');STEP(.3,1);return {done:A.dq.mir.done,props:A.dq.props.filter(p=>p.c.n=='Crimson Double').length,vul:e.dqVul>nowP()}}""");shot('mirror_interrupt')
    ev("()=>{STEP(2);bossEnt(5).bs.t=99;return 1}")
    P('mirror2',"""()=>{const A=ARN[5],e=bossEnt(5);e.bs.t=99;e.bs.lock=0;window.GOD=0;hero.iv=0;let h=0;const f=hitHero;hitHero=function(){h++;return f.apply(this,arguments)};BMV.mirror(e,A,dqEnc(1.28,1));STEP(4);hitHero=f;window.GOD=1;e.bs.t=99;return {hits:h,props:A.dq.props.length}}""")
    P('moon',"""()=>{const A=ARN[5],e=bossEnt(5);e.bs.t=99;e.bs.lock=0;BMV.bloodmoon(e,A,dqEnc(1.28,3));STEP(1.6,1);e.bs.t=99;return {moon:!!A.dq.moon,spots:A.dq.moon.spots.map(s=>[+(s.x-A.cx).toFixed(1),+(s.z-A.cz).toFixed(1)])}}""");shot('moon_warn')
    P('moon_flood',"""()=>{const A=ARN[5],e=bossEnt(5);STEP(2.4);e.bs.t=99;const s=A.dq.moon.spots[0];toPos(s.x+5,s.z);window.GOD=0;hero.iv=0;let h=0;const f=hitHero;hitHero=function(){h++;return f.apply(this,arguments)};STEP(1.5);const out=h;h=0;toPos(s.x,s.z);STEP(1.5,1);hitHero=f;window.GOD=1;e.bs.t=99;return {hitsInBlood:out,hitsInMoon:h,wading:hero.buffs.some(b=>b.n=='Wading')}}""")
    shot('moon_flood')
    ev("()=>{const A=ARN[5],y=GH(A.cx,A.cz);VIEW(A.cx+Math.cos(A.dqA)*15,y+13,A.cz+Math.sin(A.dqA)*15,A.cx,y,A.cz);return 1}");shot('moon_flood_top')
    P('moon_end',"""()=>{const A=ARN[5],e=bossEnt(5);STEP(5);e.bs.t=99;return {moon:!!A.dq.moon,flood:D5.flood.visible,wading:hero.buffs.some(b=>b.n=='Wading')}}""")
    # phase 3: the Crimson Rite
    P('ph3',"""()=>{const A=ARN[5],e=bossEnt(5);CLR();window.BHP=.3;e.c.h=M(e.c)*.3;e.bs.t=99;e.bs.lock=0;STEP(.3);STEP(2.5);return {ph:e.bs.ph,rite:!!A.dq.rite,imm:e.dqImm,obel:A.dq.rite&&A.dq.rite.ob.length}}""")
    ev("()=>{const A=ARN[5];toPos(A.cx+Math.cos(A.dqA)*7,A.cz+Math.sin(A.dqA)*7);camPitch=.45;camDist=12;snapCam();STEP(1.2,1);return 1}");shot('rite')
    ev("()=>{const A=ARN[5],y=GH(A.cx,A.cz);VIEW(A.cx+Math.cos(A.dqA)*15,y+12,A.cz+Math.sin(A.dqA)*15,A.cx,y,A.cz);return 1}");shot('rite_top')
    P('rite_warded',"""()=>{const A=ARN[5],e=bossEnt(5),h0=e.c.h;heroHit(e,5000,'p');return {dmg:h0-e.c.h}}""")
    P('rite_break',"""()=>{const A=ARN[5],e=bossEnt(5);A.dq.rite.ob.slice().forEach(p=>{for(let k=0;k<300&&!p.dead;k++)heroHit(p,5000,'p')});STEP(.4,1);return {rite:!!A.dq.rite,imm:e.dqImm,stun:+A.dq.stun.toFixed(2),vul:e.dqVul>nowP()}}""")
    shot('rite_broken')
    P('rite_again',"""()=>{const A=ARN[5],e=bossEnt(5);STEP(6);e.bs.t=99;return {rite:!!A.dq.rite,riteDone:A.dq.riteDone}}""")
    # rite completes (fresh fight state forced)
    P('rite_complete',"""()=>{const A=ARN[5],e=bossEnt(5);A.dq.riteDone=0;window.GOD=0;hero.iv=0;BMV.rite(e,A,1.2);const hp0=heroMax();let hmin=1e9;POST.render=()=>{};let dmg=0;for(let i=0;i<60;i++){const n=Math.round(.45/.016);for(let j=0;j<n;j++){VT+=16;hero.hp=heroMax();const h1=hero.hp;loop(VT);if(hero.hp<h1-heroMax()*.4)dmg=Math.round((h1-hero.hp)/heroMax()*100)}}POST.render=__pr;
      window.GOD=1;return {rite:!!A.dq.rite,imm:e.dqImm,cataclysmPct:dmg}}""")
    # live AI
    P('live',"""()=>{const A=ARN[5],e=bossEnt(5),log=[];CLR();e.bs.t=0;e.bs.lock=0;const o={};['bloodfan','dive','batswarm','mirror','beam','prison','cross','chalices','bloodmoon','rain'].forEach(k=>{const g=BMV[k];o[k]=g;BMV[k]=function(){log.push(k);return g.apply(this,arguments)}});
      for(let i=0;i<60;i++)STEP(.5);Object.assign(BMV,o);return log}""")
    shot('live')
    P('win',"""()=>{const A=ARN[5],e=bossEnt(5);window.BHP=0;for(let k=0;k<60&&(e.hid||e.dqImm);k++)STEP(.25);hurt(e,1e9,1);STEP(3.5,1);return {AF:!!AF,f:A.f,props:enemies.filter(q=>q.dprop).length,bats:D5.bats.filter(b=>b.g.visible).length,flood:D5.flood.visible,sigil:D5.sigil.visible,tint:D5.tint.style.opacity,rite:D5.riteEl.style.display,teth:scene.children.filter(o=>o.geometry===D5.tg).length,buffs:hero.buffs.filter(b=>b.n=='Wading').length,gateY:+D5.gate.position.y.toFixed(2),fx:A.dq.fx.length,banner:($('banner')||{}).textContent}}""")
    shot('win')
    P('fail',"""()=>{bossT[5]=.05;STEP(.5);const A=ARN[5],e=bossEnt(5);toPos(A.cx+Math.cos(A.dqA)*9,A.cz+Math.sin(A.dqA)*9);STEP(.5);e.bs.t=99;window.BHP=.3;e.c.h=M(e.c)*.3;STEP(4);e.bs.t=99;BMV.batswarm(e,A,1.28);STEP(1);
      window.BHP=0;const before={f:A.f,rite:!!A.dq.rite,props:A.dq.props.length,hid:e.hid};toPos(A.cx+Math.cos(A.dqA)*26,A.cz+Math.sin(A.dqA)*26);arenaFail();STEP(2);
      return {before,after:{f:A.f,props:enemies.filter(q=>q.dprop).length,hid:e.hid,imm:e.dqImm,vis:e.m.visible,bats:D5.bats.filter(b=>b.g.visible).length,sigil:D5.sigil.visible,teth:scene.children.filter(o=>o.geometry===D5.tg).length,hp:e.c.h==M(e.c)}}}""")
play.run(s,w=1000,hh=620)
