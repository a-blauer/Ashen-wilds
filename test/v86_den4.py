# v86 den 4 — The Charnel Pit (The Bloated One): den screenshots, every mechanic, win / fail / respawn cleanup
# SRC=<html> AW_TMP=<out dir> python3 v86_den4.py
import play,json,os
SHOTS=os.environ.get('SHOTS','1')=='1'
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c,*a:print(n,'=>',json.dumps(ev(c,*a))[:2500])
    def shot(n):
        if SHOTS:pg.screenshot(path=play.TMP+'/v86d4_'+n+'.png',timeout=120000,animations='disabled')
    ev("()=>{hero.lvl=44;hsDirty();hero.hp=heroMax();enterMap(4);return 1}");pg.wait_for_timeout(2500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();if(window.GOD)hero.iv=1;if(i==n-1&&draw)POST.render=__pr;loop(VT)}POST.render=__pr;return VT};
      window.VIEW=(px,py,pz,tx,ty,tz)=>{cam.position.set(px,py,pz);cam.lookAt(tx,ty,tz);FADE.cam.value.copy(cam.position);__pr();return 1};
      window.CLR=()=>{enemies.slice().forEach(e=>{if(!e.boss&&!e.dprop)removeE(e)})};return 1}""")
    ev("()=>{STEP(1);CLR();return 1}")
    A="ARN[4]"
    # ---------- den overview ----------
    P('den',"""()=>{const A=ARN[4];return {ea:+A.dqA.toFixed(2),cx:A.cx,cz:A.cz,children:A.g.children.length,tris:A.g.children.reduce((n,o)=>n+(o.geometry&&o.geometry.attributes.position?o.geometry.attributes.position.count/3:0),0)|0,blocked:DENB.size}}""")
    for n,(r,h,ao) in {'over':(24,26,0.0),'over2':(22,18,2.4),'over3':(20,14,-2.0)}.items():
        ev(f"""()=>{{const A=ARN[4],a=A.dqA+{ao},y=GH(A.cx,A.cz);toPos(A.cx+Math.cos(A.dqA)*20,A.cz+Math.sin(A.dqA)*20);STEP(.1);VIEW(A.cx+Math.cos(a)*{r},y+{h},A.cz+Math.sin(a)*{r},A.cx,y,A.cz);return 1}}""");shot(n)
    # ground level from inside the pit and at the gate
    ev("""()=>{const A=ARN[4],y=GH(A.cx,A.cz),a=A.dqA+Math.PI;VIEW(A.cx+Math.cos(A.dqA)*6,y+2.2,A.cz+Math.sin(A.dqA)*6,A.cx+Math.cos(a)*14,y+1.5,A.cz+Math.sin(a)*14);return 1}""");shot('ground1')
    ev("""()=>{const A=ARN[4],y=GH(A.cx,A.cz),a=A.dqA+1.2;VIEW(A.cx-Math.cos(a)*4,y+2.0,A.cz-Math.sin(a)*4,A.cx+Math.cos(a)*14,y+2,A.cz+Math.sin(a)*14);return 1}""");shot('ground2')
    ev("""()=>{const A=ARN[4],y=GH(A.cx,A.cz);VIEW(A.cx+Math.cos(A.dqA)*24,y+3.5,A.cz+Math.sin(A.dqA)*24,A.cx,y+1,A.cz);return 1}""");shot('gate')
    # ---------- fight: walk in ----------
    P('start',"""()=>{const A=ARN[4],e=bossEnt(4);window.GOD=1;if(window.PACE)PACE.basic=false;/* v96: no boss basic attacks in these mechanic checks */toPos(A.cx+Math.cos(A.dqA)*9,A.cz+Math.sin(A.dqA)*9,0);camPitch=.75;camDist=17;snapCam();STEP(.6);
      e.bs.t=99;STEP(1.2,1);const bb=new THREE.Box3().setFromObject(e.m);return {f:A.f,AF:!!AF&&AF.i,gateY:+D4.gate.position.y.toFixed(2),cur:D4.cur.visible,wall:A.wall.visible,boss:[+(bb.max.y-bb.min.y).toFixed(2),+(bb.max.x-bb.min.x).toFixed(2)],bs:e.m.bs,pool:BSTY[4].pool,ult:A.b.ult}}""")
    shot('fight_start')
    ev("()=>{const A=ARN[4],a=A.dqA+2.0;toPos(A.cx+Math.cos(a)*12.6,A.cz+Math.sin(a)*12.6,a+Math.PI/2);camYaw=Math.atan2(Math.cos(a),Math.sin(a));camPitch=.3;camDist=9.5;snapCam();bossEnt(4).bs.t=99;STEP(1.5,1);return 1}");shot('edge_defaultcam')
    if os.environ.get('STOP')=='start':return
    ev("()=>{const A=ARN[4];VIEW(A.cx+Math.cos(A.dqA)*20,GH(A.cx,A.cz)+5,A.cz+Math.sin(A.dqA)*20,A.cx,GH(A.cx,A.cz)+2,A.cz);return 1}");shot('sealed')
    # belch cone
    P('belch',"""()=>{const A=ARN[4],e=bossEnt(4);e.bs.t=99;e.bs.lock=0;e.m.position.set(A.cx,0,A.cz);toPos(A.cx+Math.cos(A.dqA)*5,A.cz+Math.sin(A.dqA)*5);snapCam();STEP(.1);const r=BMV.belch(e,A,1.28);STEP(.8,1);return [r,A.dq.fx.length,e.m.ak&&e.m.ak.n]}""")
    shot('belch_warn')
    P('belch_hit',"""()=>{window.GOD=0;hero.iv=0;const e=bossEnt(4),A=ARN[4];window.__h=0;const f=hitHero;hitHero=function(){__h++;return f.apply(this,arguments)};STEP(.7,1);hitHero=f;window.GOD=1;return {hits:__h,pools:A.dq.pools.length,rot:hero.buffs.map(b=>b.n)}}""")
    shot('belch_fire')
    # rot spit -> persistent pools
    P('rotspit',"""()=>{const A=ARN[4],e=bossEnt(4);e.bs.t=99;BMV.rotspit(e,A,1.28);STEP(.9,1);return A.dq.fx.length}""");shot('rotspit_fly')
    P('pools',"""()=>{const A=ARN[4],e=bossEnt(4);e.bs.t=99;STEP(2.5,1);return A.dq.pools.map(p=>[+p.r.toFixed(2),+p.rMax.toFixed(2),p.dry])}""");shot('pools')
    P('rotdot',"""()=>{const A=ARN[4],e=bossEnt(4),p=A.dq.pools.find(q=>!q.dry);window.GOD=0;hero.iv=0;toPos(p.x,p.z);let h=0;const f=hitHero;hitHero=function(){h++;return f.apply(this,arguments)};STEP(1.6);hitHero=f;window.GOD=1;return {hits:h,buffs:hero.buffs.filter(b=>b.n=='Rotting').length,mspd:+HS().mspd.toFixed(2)}}""")
    ev("()=>{const A=ARN[4],e=bossEnt(4);e.bs.t=99;STEP(10);return 1}")
    P('poolsGrow',"""()=>ARN[4].dq.pools.map(p=>+p.r.toFixed(2))""")
    # corpse pile swells
    P('corpse',"""()=>{const A=ARN[4],e=bossEnt(4),i=1,[x,z]=D4.piles[i];toPos(x+Math.cos(A.dqA)*4,z+Math.sin(A.dqA)*4);snapCam();e.bs.t=99;BMV.corpsecall(e,A,dqEnc(1.28,i));STEP(2.5,1);const p=A.dq.props.find(q=>q.c.n.includes('Corpse'));return {prop:!!p,hp:p&&p.c.h,inEnemies:enemies.includes(p)}}""")
    shot('corpse_swell')
    P('corpse_burst',"""()=>{const A=ARN[4],e=bossEnt(4);e.bs.t=99;STEP(4.5,1);return {maggots:enemies.filter(q=>q.c.g[0]=='maggot').length,props:A.dq.props.length,pools:A.dq.pools.length}}""")
    shot('corpse_burst')
    P('corpse_kill',"""()=>{const A=ARN[4],e=bossEnt(4);CLR();const xp=hero.xp,dr=drops.length;e.bs.t=99;BMV.corpsecall(e,A,dqEnc(1.28,2));STEP(.5);const p=A.dq.props.find(q=>q.c.n.includes('Corpse'));
      for(let k=0;k<200&&!p.dead;k++)heroHit(p,5000,'p');STEP(7);return {dead:!!p.dead,maggots:enemies.filter(q=>q.c.g[0]=='maggot').length,xpGain:hero.xp-xp,drops:drops.length-dr,props:A.dq.props.length,fx:A.dq.fx.length}}""")
    # phase 2: pustules
    P('ph2',"""()=>{const A=ARN[4],e=bossEnt(4);CLR();e.c.h=M(e.c)*.6;e.bs.t=99;e.bs.lock=0;toPos(A.cx+Math.cos(A.dqA)*4,A.cz+Math.sin(A.dqA)*4);e.m.position.set(A.cx,0,A.cz);STEP(.1);e.bs.t=99;STEP(4);e.bs.t=99;return {ph:e.bs.ph,pus:A.dq.pus.length,props:A.dq.props.map(p=>p.c.n)}}""")
    ev("()=>{const A=ARN[4],e=bossEnt(4);e.bs.t=99;STEP(3,1);return 1}");shot('pustules')
    ev("()=>{const A=ARN[4],e=bossEnt(4);VIEW(e.m.position.x+5,GH(A.cx,A.cz)+4,e.m.position.z+5,e.m.position.x,GH(A.cx,A.cz)+2.5,e.m.position.z);return 1}");shot('pustules_close')
    P('pop',"""()=>{const A=ARN[4],e=bossEnt(4),h0=e.c.h,L=A.dq.pus.filter(p=>!p._gone);L.forEach(p=>{for(let k=0;k<300&&!p.dead;k++)heroHit(p,5000,'p')});STEP(.3,1);return {popped:L.length,bossDmg:Math.round(h0-e.c.h),vul:e.dqVul>nowP(),lock:+e.bs.lock.toFixed(2)}}""")
    shot('pustules_pop')
    P('erupt',"""()=>{const A=ARN[4],e=bossEnt(4);e.bs.t=99;A.dq.pT=0;STEP(.2);STEP(12.5);e.bs.t=99;return {pus:A.dq.pus.length,props:A.dq.props.map(p=>p.c.n)}}""")
    ev("()=>{STEP(.9,1);return 1}");shot('erupt')
    # phase 3: rot tide
    P('ph3',"""()=>{const A=ARN[4],e=bossEnt(4);CLR();e.c.h=M(e.c)*.3;e.bs.t=99;e.bs.lock=0;STEP(3.5);e.bs.t=99;STEP(12);e.bs.t=99;return {ph:e.bs.ph,tide:A.dq.tide&&+A.dq.tide.r.toFixed(2)}}""")
    ev("()=>{const A=ARN[4],y=GH(A.cx,A.cz);VIEW(A.cx+Math.cos(A.dqA)*19,y+20,A.cz+Math.sin(A.dqA)*19,A.cx,y,A.cz);return 1}");shot('tide')
    ev("()=>{const A=ARN[4],e=bossEnt(4);e.bs.t=99;STEP(30);e.bs.t=99;toPos(A.cx+Math.cos(A.dqA)*3,A.cz+Math.sin(A.dqA)*3);camPitch=.6;camDist=14;snapCam();STEP(1,1);return 1}");shot('tide_late')
    P('tideMin',"""()=>{const A=ARN[4];return {tide:+A.dq.tide.r.toFixed(2),pools:A.dq.pools.length}}""")
    # live AI for a while (moves picked by the boss)
    P('live',"""()=>{const A=ARN[4],e=bossEnt(4),log=[];e.bs.t=0;e.bs.lock=0;const f=kqBmv;Object.keys(BMV).forEach(k=>{});const o={};['slam','rotspit','belch','quake','sporering','corpsecall','pustules'].forEach(k=>{const g=BMV[k];o[k]=g;BMV[k]=function(){log.push(k);return g.apply(this,arguments)}});
      for(let i=0;i<40;i++){STEP(.5)}Object.assign(BMV,o);return log}""")
    shot('live')
    # ---------- win ----------
    P('win',"""()=>{const A=ARN[4],e=bossEnt(4);hurt(e,1e9,1);STEP(1.5,1);const pools=scene.children.filter(o=>o.geometry===D4.pg).length;
      return {AF:!!AF,f:A.f,props:enemies.filter(q=>q.dprop).length,maggots:enemies.filter(q=>q.c.g[0]=='maggot').length,poolsInScene:pools,tide:D4.tide.visible,rot:hero.buffs.filter(b=>b.n=='Rotting').length,gateY:+D4.gate.position.y.toFixed(2),fx:A.dq.fx.length,q:A.dq.q.length,bossT:bossT[4]}}""")
    shot('win')
    # ---------- respawn & fail ----------
    P('respawn',"""()=>{bossT[4]=.05;STEP(.5);const A=ARN[4],e=bossEnt(4);return {boss:!!e,curVis:D4.cur.visible,gateY:+D4.gate.position.y.toFixed(2)}}""")
    P('fail',"""()=>{const A=ARN[4],e=bossEnt(4);toPos(A.cx+Math.cos(A.dqA)*9,A.cz+Math.sin(A.dqA)*9);STEP(.5);e.bs.t=99;BMV.rotspit(e,A,1.28);BMV.corpsecall(e,A,dqEnc(1.28,0));e.c.h=M(e.c)*.5;STEP(4);e.bs.t=99;STEP(2);
      const before={f:A.f,props:A.dq.props.length,pools:A.dq.pools.length};toPos(A.cx+Math.cos(A.dqA)*24,A.cz+Math.sin(A.dqA)*24);arenaFail();STEP(2);const pools=scene.children.filter(o=>o.geometry===D4.pg).length;
      return {before,after:{f:A.f,AF:!!AF,props:enemies.filter(q=>q.dprop).length,poolsInScene:pools,rot:hero.buffs.filter(b=>b.n=='Rotting').length,bossHp:e.c.h==M(e.c),gateY:+D4.gate.position.y.toFixed(2)}}}""")
    P('errors',"()=>window.__errs||[]")
play.run(s,w=1000,hh=620)
