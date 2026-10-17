# v86 den 3 — the Sunken Pit (Ssith'ra the Endless): den screenshots + every mechanic + clear/fail cleanup
# SRC=<html> AW_TMP=<out dir> python3 v86_den3.py      (SHOTS=0 skips the screenshots)
import play,json,os
SH=os.environ.get('SHOTS','1')!='0'
def s(pg):
    ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:1600])
    def shot(n):
        if SH:
            ev('()=>STEP(.03,1)');pg.screenshot(path=play.TMP+'/v86d3_'+n+'.png',timeout=180000,animations='disabled')
    ev("()=>{enterMap(3)}");pg.wait_for_timeout(3500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
      window.__pr=POST.render;window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;if(window.GOD)hero.hp=heroMax();if(window.GOD>1)hero.iv=1;if(i==n-1&&draw)POST.render=__pr;try{loop(VT)}catch(err){window.LERR=window.LERR||[];if(LERR.length<6)LERR.push(String(err&&err.stack||err).slice(0,500))}}POST.render=__pr;return VT};
      window.GOD=1;window.HITS=[];window.__bh=bossHit;bossHit=function(e,k){HITS.push(+(+k).toFixed(2))};window.XA=ARN[3];window.DN=XA.dn;window.EA=DN.ea;window.CAM=(x,z,yaw,pit,dist)=>{toPos(x,z);camYaw=yaw;camPitch=pit;camDist=dist;snapCam()};
      window.YAW=a=>Math.atan2(Math.cos(a),Math.sin(a));return 1}""")
    P('den',"()=>[XA.cx,XA.cz,+DN.ea.toFixed(2),DN.cols.length,XA.g.children.length,DENB.size,XA.g.children.map(o=>o.type+(o.geometry?':'+(o.geometry.attributes.position.count/3|0):'')).join(' ')]")
    ev("()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});CAM(XA.cx,XA.cz,YAW(DN.ea),.95,36);STEP(1.2,1)}");shot('over')
    ev("()=>{CAM(XA.cx,XA.cz,YAW(DN.ea+Math.PI),.6,26);STEP(1.2,1)}");shot('back')
    ev("()=>{const x=XA.cx+Math.cos(EA)*21,z=XA.cz+Math.sin(EA)*21;CAM(x,z,YAW(EA),.2,8);STEP(1.5,1)}");shot('gate')
    ev("()=>{const a=EA+2.6,x=XA.cx+Math.cos(a)*6,z=XA.cz+Math.sin(a)*6;CAM(x,z,YAW(a),.25,9);STEP(1.2,1)}");shot('ground')
    P('start',"()=>{const x=XA.cx+Math.cos(EA)*11,z=XA.cz+Math.sin(EA)*11;CAM(x,z,YAW(EA),.55,16);STEP(.5);const r=[!!AF,AF&&AF.i];STEP(.5,1);return r.concat([DN.seal.visible,+DN.seal.scale.y.toFixed(2)])}")
    shot('seal')
    ev("()=>{window.BE=bossEnt(3);BE.bs.t=99;STEP(.1)}")
    # ---- vortex ----
    P('vortex',"()=>{const x=XA.cx+Math.cos(EA)*9,z=XA.cz+Math.sin(EA)*9;CAM(x,z,YAW(EA),.7,15);BE.bs.t=99;DN.vxCD=0;BMV.vortex(BE,XA,1);STEP(2.2,1);return [!!DN.vx,+d2(pl.position,V(XA.cx,0,XA.cz)).toFixed(2)]}")
    shot('vortex')
    P('vortex2',"()=>{const r=[];for(let i=0;i<8;i++){STEP(.5);r.push(+d2(pl.position,V(XA.cx,0,XA.cz)).toFixed(2))}return [r,hero.buffs.map(b=>b.n),!!DN.vx]}")
    P('vortex3',"()=>{STEP(2);return [!!DN.vx,hero.buffs.map(b=>b.n)]}")
    # ---- erupt ----
    P('erupt',"()=>{const x=XA.cx+Math.cos(EA+1)*8,z=XA.cz+Math.sin(EA+1)*8;CAM(x,z,YAW(EA+1),.6,15);BE.bs.t=99;BE.bs.ph=2;BMV.erupt(BE,XA,1);STEP(1.4,1);return [DN.er&&DN.er.s,BE.hid,DN.mound.visible]}")
    shot('erupt_hunt')
    P('erupt2',"()=>{let t=0;while(DN.er&&DN.er.s!='tele'&&t<4){STEP(.1);t+=.1}STEP(.5,1);return [DN.er&&DN.er.s,+d2(BE.m.position,pl.position).toFixed(2)]}")
    shot('erupt_tele')
    P('erupt3',"()=>{let t=0;while(DN.er&&t<3){STEP(.05);t+=.05}STEP(.15,1);return [!!DN.er,BE.hid,BE._ssX>performance.now(),DN.mark.visible]}")
    shot('exposed')
    P('weak',"()=>{const h0=BE.c.h;hurt(BE,100,null,false);const d1=h0-BE.c.h;STEP(3);const h1=BE.c.h;hurt(BE,100,null,false);return [d1,h1-BE.c.h,BE._ssX>performance.now()]}")
    # ---- ram into a column ----
    P('ram',"()=>{const C=DN.cols[0];const a=Math.atan2(C.z-XA.cz,C.x-XA.cx),bx=XA.cx-Math.cos(a)*3,bz=XA.cz-Math.sin(a)*3;BE.m.position.set(bx,0,bz);const px=C.x+Math.cos(a)*2.6,pz=C.z+Math.sin(a)*2.6;CAM(px,pz,YAW(a+Math.PI/2),.75,13);BE.bs.t=99;BE.bs.ph=1;BMV.ram(BE,XA,1);STEP(.7,1);return [DN.ram&&DN.ram.s,+DN.ram.L.toFixed(1)]}")
    shot('ram_tele')
    P('ram2',"()=>{let t=0;while(DN.ram&&t<3){STEP(.05);t+=.05}STEP(.2,1);return [!!DN.ram,DN.cols.map(c=>c.ok),BE._ssX>performance.now()]}")
    shot('stuck')
    P('ram3',"()=>{STEP(4);return [BE._ssX,BE.bs.lock,BE.bs.t]}")
    # ---- sandstorm ----
    P('storm',"()=>{CAM(XA.cx+4,XA.cz-3,YAW(EA),.5,13);BE.bs.t=99;BMV.sandstorm(BE,XA,1);STEP(2.6,1);return [!!DN.st,ZATM[3].fog,+scene.fog.density.toFixed(3),DN.tails.filter(t=>t.t>0).length]}")
    shot('storm')
    P('storm2',"()=>{for(let i=0;i<20&&!DN.tails.some(t=>t.t>.55);i++)STEP(.05);STEP(.05,1);return DN.tails.map(t=>+t.t.toFixed(2))}");shot('lash')
    P('storm_end',"()=>{STEP(6);return [!!DN.st,ZATM[3].fog,ZP.mat.size]}")
    # ---- natural fight ----
    P('ai',"()=>{BE.bs.ph=1;DN.ph=1;BE.bs.t=.5;const log=[];let last='';for(let i=0;i<140;i++){STEP(.25);if(BE.bs.last!=last){last=BE.bs.last;log.push(last)}}return [log,DN.cols.map(c=>c.ok)]}")
    shot('mid')
    P('fail',"()=>{arenaFail();STEP(1);return [!!AF,hero.buffs.map(b=>b.n),DN.cols.map(c=>c.ok),ZATM[3].fog,ZP.mat.size,DN.seal.visible,BE.hid,BE._ssX,BSTY[3].pool,DN.tails.filter(t=>t.m.visible).length]}")
    P('again',"()=>{BE=bossEnt(3);const x=XA.cx+Math.cos(EA)*11,z=XA.cz+Math.sin(EA)*11;toPos(x,z);STEP(.6);const r=[!!AF];BE.c.h=M(BE.c)*.6;let fk=[];for(let i=0;i<40;i++){STEP(.25);if(fk[fk.length-1]!=BE.bs.last)fk.push(BE.bs.last)}BE.c.h=M(BE.c)*.3;for(let i=0;i<40;i++){STEP(.25);if(fk[fk.length-1]!=BE.bs.last)fk.push(BE.bs.last)}return r.concat([BE.bs.ph,fk])}")
    shot('ph3')
    P('hits',"()=>HITS.slice(0,80)")
    P('kill',"()=>{for(let i=0;i<200&&(BE.hid||DN.er);i++)STEP(.05);hurt(BE,1e9,1);STEP(1.5);return [!!AF,BE.dead,hero.buffs.map(b=>b.n),DN.cols.map(c=>c.ok),ZATM[3].fog,DN.vx,DN.st,DN.seal.visible,enemies.filter(x=>x.minion&&!x.dead).length,BSTY[3].pool]}")
    print('LOOPERR',ev('()=>window.LERR||[]'))
    print('ERRS',errs[:5])
play.run(s,w=1000,hh=620)
