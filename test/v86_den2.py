# v86 den 2 — the Frozen Sepulchre (Rime Wraith): den screenshots + every mechanic + clear/fail cleanup
# SRC=<html> AW_TMP=<out dir> python3 v86_den2.py      (SHOTS=0 skips the screenshots)
import play,json,os
SH=os.environ.get('SHOTS','1')!='0'
def s(pg):
    ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:1600])
    def shot(n):
        if SH:
            ev('()=>STEP(.03,1)');pg.screenshot(path=play.TMP+'/v86d2_'+n+'.png',timeout=180000,animations='disabled')
    ev("()=>{enterMap(2)}");pg.wait_for_timeout(3500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
      window.__pr=POST.render;window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;if(window.GOD)hero.hp=heroMax();if(window.GOD>1)hero.iv=1;if(i==n-1&&draw)POST.render=__pr;try{loop(VT)}catch(err){window.LERR=window.LERR||[];if(LERR.length<6)LERR.push(String(err&&err.stack||err).slice(0,500))}}POST.render=__pr;return VT};
      window.GOD=1;if(window.PACE)PACE.basic=false;/* v96: no boss basic attacks in these mechanic checks */window.HITS=[];window.__bh=bossHit;bossHit=function(e,k){HITS.push(+(+k).toFixed(2))};window.XA=ARN[2];window.DN=XA.dn;window.EA=DN.ea;window.CAM=(x,z,yaw,pit,dist)=>{toPos(x,z);camYaw=yaw;camPitch=pit;camDist=dist;snapCam()};
      window.YAW=a=>Math.atan2(Math.cos(a),Math.sin(a));return [XA.cx,XA.cz,+DN.ea.toFixed(2),DN.br.length,DN.st.length,XA.g.children.length,DENB.size]}""")
    P('den',"()=>[XA.cx,XA.cz,+DN.ea.toFixed(2),DN.br.length,DN.st.length,XA.g.children.length,DENB.size,XA.g.children.map(o=>o.type+(o.geometry?':'+(o.geometry.attributes.position.count/3|0):'')).join(' ')]")
    # ---- the den from above (from the entrance side) and from the back ----
    ev("()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});CAM(XA.cx,XA.cz,YAW(EA),.95,36);STEP(1.2,1)}");shot('over')
    ev("()=>{CAM(XA.cx,XA.cz,YAW(EA+Math.PI),.6,26);STEP(1.2,1)}");shot('back')
    # ---- ground level: walking up to the entrance arch ----
    ev("()=>{const x=XA.cx+Math.cos(EA)*21,z=XA.cz+Math.sin(EA)*21;CAM(x,z,YAW(EA),.2,8);STEP(1.5,1)}");shot('gate')
    ev("()=>{const a=EA+125*Math.PI/180,x=XA.cx+Math.cos(a)*8.6,z=XA.cz+Math.sin(a)*8.6;CAM(x,z,YAW(a+Math.PI)+.5,.22,5.5);STEP(1.2,1)}");shot('statue')
    # ---- the fight starts (seal) ----
    P('start',"()=>{const x=XA.cx+Math.cos(EA)*11,z=XA.cz+Math.sin(EA)*11;CAM(x,z,YAW(EA),.55,16);STEP(.5);const r=[!!AF,AF&&AF.i];STEP(.5,1);return r.concat([DN.seal.visible,+DN.seal.position.y.toFixed(2),DN.br.map(B=>B.wr.visible)])}")
    shot('seal')
    ev("()=>{window.BE=bossEnt(2);BE.bs.t=99;STEP(.1)}")
    # ---- snuff ----
    P('snuff',"()=>{const B=DN.br.slice().sort((a,b)=>d2(a.p,BE.m.position)-d2(b.p,BE.m.position))[0];window.SB=B;const q=B.p;CAM(q.x+2,q.z+2,YAW(Math.atan2(q.z-XA.cz,q.x-XA.cx)),.6,15);BE.bs.t=99;const r=BMV.snuff(BE,XA,1);STEP(.9,1);return [r,DN.br.map(B=>B.lit)]}")
    shot('snuff1')
    P('snuff2',"()=>{STEP(1.0,1);return DN.br.map(B=>B.lit)}");shot('snuff2')
    # ---- deep cold: chill, freeze ----
    P('cold',"()=>{CAM(XA.cx,XA.cz,YAW(EA),.6,15);DN.cold=60;STEP(1.0,1);return [+DN.cold.toFixed(1),DN.tier,hero.buffs.filter(b=>b.n=='Deep Cold').map(b=>b.s.mspd),+HS().mspd.toFixed(2)]}")
    shot('chill')
    P('freeze',"()=>{DN.cold=99.5;GOD=2;STEP(.4,1);return [DN.frz>0,hero.buffs.map(b=>b.n),+HS().mspd.toFixed(2),!!(RW.blk&&RW.blk.parent)]}")
    shot('frozen')
    P('thawout',"()=>{STEP(1.4);return [DN.frz,+DN.cold.toFixed(0),hero.buffs.map(b=>b.n),!!(RW.blk&&RW.blk.parent)]}")
    # ---- rekindle the dark fire ----
    P('relight',"()=>{const B=SB;CAM(B.x+1.2,B.z+1.2,YAW(Math.atan2(B.z-XA.cz,B.x-XA.cx)),.55,10);STEP(1.0,1);return [B.lit,+B.rk.toFixed(2)]}")
    shot('relight')
    P('relit',"()=>{STEP(1.4,1);return [SB.lit,DN.br.map(B=>B.lit),+DN.cold.toFixed(0)]}");shot('relit')
    # ---- thaw: two statues crack ----
    P('thaw',"()=>{DN.thawN=2;const s=DN.st.slice().sort((a,b)=>d2(a.p,pl.position)-d2(b.p,pl.position))[0];CAM(s.x+3,s.z+3,YAW(Math.atan2(s.z-XA.cz,s.x-XA.cx)+.6),.45,12);BE.bs.t=99;BMV.thaw(BE,XA,1);STEP(1.2,1);return DN.st.map(s=>s.crk)}")
    shot('thaw1')
    P('thaw2',"()=>{STEP(1.2,1);return [DN.st.map(s=>s.ok),enemies.filter(x=>x.minion&&!x.dead).map(x=>x.c.n)]}");shot('thaw2')
    ev("()=>{enemies.slice().forEach(e=>{if(e.minion)removeE(e)})}")
    # ---- whiteout ----
    P('white',"()=>{CAM(XA.cx+3,XA.cz+3,YAW(EA),.5,13);BE.bs.ph=3;DN.ph=3;DN.whCD=0;BE.bs.t=99;BMV.whiteout(BE,XA,1);STEP(2.2,1);return [!!DN.wh,BE.hid,ZATM[2].fog,+scene.fog.density.toFixed(3)]}")
    shot('white')
    P('white_end',"()=>{STEP(5.6,1);return [!!DN.wh,BE.hid,ZATM[2].fog]}");shot('white_end')
    # ---- natural fight for a while: AI picks moves (log them) ----
    P('ai',"()=>{const log=[];const L=BE.bs;BE.bs.t=.5;let last='';for(let i=0;i<120;i++){STEP(.25);if(BE.bs.last!=last){last=BE.bs.last;log.push(last)}}return [log,DN.br.map(B=>B.lit),+DN.cold.toFixed(0)]}")
    shot('mid')
    # ---- fail: the hero falls -> everything resets ----
    P('fail',"()=>{arenaFail();STEP(1);return [!!AF,hero.buffs.map(b=>b.n),DN.br.map(B=>B.lit),DN.st.map(s=>s.ok),ZATM[2].fog,ZP.mat.size,document.getElementById('rwCold').style.display,DN.seal.visible,BSTY[2].pool]}")
    # ---- second fight, phases, kill ----
    P('again',"()=>{BE=bossEnt(2);const x=XA.cx+Math.cos(EA)*11,z=XA.cz+Math.sin(EA)*11;toPos(x,z);STEP(.6);const r=[!!AF];BE.c.h=M(BE.c)*.6;let fk=[];for(let i=0;i<40;i++){STEP(.25);if(fk[fk.length-1]!=BE.bs.last)fk.push(BE.bs.last)}BE.c.h=M(BE.c)*.3;for(let i=0;i<40;i++){STEP(.25);if(fk[fk.length-1]!=BE.bs.last)fk.push(BE.bs.last)}return r.concat([BE.bs.ph,fk,!!DN.wh,DN.st.map(s=>s.ok)])}")
    shot('ph3')
    P('hits',"()=>HITS.slice(0,80)")
    P('kill',"()=>{hurt(BE,1e9,1);STEP(1.5);return [!!AF,BE.dead,hero.buffs.map(b=>b.n),DN.br.map(B=>B.lit),DN.st.map(s=>s.ok),ZATM[2].fog,BE.hid,document.getElementById('rwCold').style.display,enemies.filter(x=>x.minion&&!x.dead).length,BSTY[2].pool]}")
    print('LOOPERR',ev('()=>window.LERR||[]'))
    print('ERRS',errs[:5])
play.run(s,w=1000,hh=620)
