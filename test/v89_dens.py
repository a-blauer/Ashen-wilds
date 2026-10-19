# v89 dens — bigger dens, ground warnings that last the whole wind-up, warning signs outside every den
# SRC=<html> AW_TMP=<out dir> python3 v89_dens.py      DL=0,3 limits the dens; SHOTS=0 skips screenshots; PART=scale,tele,sign
import play,json,os
# a busy machine can take over two minutes to load the page
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
SH=os.environ.get('SHOTS','1')!='0'
DL=[int(x) for x in os.environ.get('DL','0,1,2,3,4,5').split(',')]
PART=os.environ.get('PART','scale,tele,sign').split(',')
# moves to trigger per Sovereign: (label, js run with BE=boss, XA=den, S=den state) — every one makes red warnings.
# v96: they run as the boss driver casts them (MP.inAI), so T (the wind-ups) are the v96 ones (×1.5); `early` must stay [].
MOVES={
 0:[('pounce','BMV.pounce(BE,XA,1)'),('charge','BMV.charge(BE,XA,1)'),('rain','BMV.rain(BE,XA,1)'),('triple','BMV.triple(BE,XA,1)'),
    ('marked leap','arLeap(XA,BE)'),('argstalk','BMV.argstalk(BE,XA,1)'),('adds+slam','BMV.slam(BE,XA,1)')],
 1:[('spit','BMV.spit(BE,XA,1)'),('tongue','BMV.tongue(BE,XA,1)'),('mines','BMV.mines(BE,XA,1)'),('spores','BMV.spores(BE,XA,1)'),
    ('neck rise','BMV.hyNeck0(BE,XA,1)'),('cataclysm','BMV.ult(BE,XA,1)')],
 2:[('fade','BMV.fade(BE,XA,1)'),('prison','BMV.prison(BE,XA,1)'),('snuff','BMV.snuff(BE,XA,1)'),('thaw','BMV.thaw(BE,XA,1)'),('mines','BMV.mines(BE,XA,1)'),
    ('wave','BMV.wave(BE,XA,1)'),('whiteout','(XA.dn.whCD=0,BMV.whiteout(BE,XA,1))')],
 3:[('tailsweep','BMV.tailsweep(BE,XA,1)'),('ram','BMV.ram(BE,XA,1)'),('erupt','BMV.erupt(BE,XA,1)'),('sandstorm','(XA.dn.stCD=0,BMV.sandstorm(BE,XA,1))'),
    ('spit','BMV.spit(BE,XA,1)'),('mines','BMV.mines(BE,XA,1)')],
 4:[('slam','BMV.slam(BE,XA,1)'),('rotspit','BMV.rotspit(BE,XA,1)'),('belch','BMV.belch(BE,XA,1)'),('sporering','BMV.sporering(BE,XA,1)'),
    ('quake','BMV.quake(BE,XA,1)'),('corpse pile','BMV.corpsecall(BE,XA,dqEnc(1.2,0))'),('pustules+erupt','(BMV.pustules(BE,XA,1),XA.dq.pusT=1.2)')],
 5:[('bloodfan','BMV.bloodfan(BE,XA,1)'),('dive','BMV.dive(BE,XA,1)'),('batswarm','BMV.batswarm(BE,XA,dqEnc(1,1))'),('mirror','BMV.mirror(BE,XA,dqEnc(1,1))'),
    ('prison','BMV.prison(BE,XA,1)'),('cross','BMV.cross(BE,XA,1)'),('rite end','(BMV.rite(BE,XA,1),XA.dq.rite.t=20.6)')]}
SHOTM={(0,'pounce'),(1,'neck rise'),(3,'ram'),(4,'belch'),(5,'batswarm'),(2,'snuff')}
def s(pg):
    pg.set_default_timeout(300000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c,a=None:print(n,'=>',json.dumps(ev(c,a) if a is not None else ev(c))[:2400])
    def shot(n):
        if SH:pg.screenshot(path=play.TMP+'/v89_'+n+'.png',timeout=180000,animations='disabled')
    harness=False
    for i in DL:
        ev("(i)=>{enterMap(i)}",i);pg.wait_for_timeout(2500)
        if not harness:
            harness=True
            ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
      window.__pr=POST.render;window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};if(hudT>VT)hudT=VT-300;for(let i=0;i<n;i++){VT+=16;if(window.GOD)hero.hp=heroMax();if(window.BFULL&&window.BE&&!BE.dead)BE.c.h=M(BE.c);if(i==n-1&&draw)POST.render=__pr;try{loop(VT)}catch(err){window.LERR=window.LERR||[];if(LERR.length<6)LERR.push(String(err&&err.stack||err).slice(0,500))}}POST.render=__pr;return VT};
      window.GOD=1;window.HITS=[];window.__bh=bossHit;bossHit=function(e,k){HITS.push(+(+k).toFixed(2))};
      window.CAM=(x,z,yaw,pit,dist)=>{toPos(x,z);camYaw=yaw;camPitch=pit;camDist=dist;snapCam()};window.YAW=a=>Math.atan2(Math.cos(a),Math.sin(a));
      window.ENT=i=>{const A=ARN[i];return [AR.ent,HY.ent,A.dn&&A.dn.ea,A.dn&&A.dn.ea,A.dqA,A.dqA][i]};window.SGA=i=>{const s=DSIGN[i],A=ARN[i];return Math.atan2(s.z-A.cz,s.x-A.cx)}}""")
        ev("(i)=>{window.XA=ARN[i];window.EA=ENT(i);enemies.slice().forEach(e=>{if(!e.boss&&!e.dprop)removeE(e)})}",i)
        # ---------------- 1. the den is 35% bigger and still fits ----------------
        if 'scale' in PART:
            P('scale%d'%i,"""(i)=>{const A=XA,R=ARENA_R,y0=GH(A.cx,A.cz),p=PMAP[i];let fl=0,blkIn=[],ring=0,ringN=0;
              for(let z=Math.floor(A.cz-R-4);z<=A.cz+R+4;z++)for(let x=Math.floor(A.cx-R-4);x<=A.cx+R+4;x++){const d=Math.hypot(x-A.cx,z-A.cz);
                if(d<R+1)fl=Math.max(fl,Math.abs(GH(x,z)-y0));const b=DENB.has(z*W+x);if(b&&d<R-1.5)blkIn.push(+d.toFixed(1));if(d>R+1.5&&d<R+4.5){ringN++;if(b||!'.gap'.includes(MAP[z][x]))ring++}}
              const edge=Math.min(A.cx-p.x0,p.x0+PMW-A.cx,A.cz-p.y0,p.y0+PMH-A.cz),cmp=(CAMPS||[]).filter(C=>regionAt(C.x,C.z)==i).map(C=>+Math.hypot(C.x-A.cx,C.z-A.cz).toFixed(0));
              const D=A.dn,pos={0:()=>AR.pil.map(q=>[Math.hypot(q[0]-A.cx,q[1]-A.cz),q[2]]).concat(AR.st.map(T=>[Math.hypot(T.x-A.cx,T.z-A.cz),0])),
                1:()=>HY.stones.map(q=>[Math.hypot(q[0]-A.cx,q[1]-A.cz),q[2]]).concat(HY.braz.map(b=>[Math.hypot(b.x-A.cx,b.z-A.cz),0]),HY.slots.map(q=>[Math.hypot(q[0]-A.cx,q[1]-A.cz),-1])),
                2:()=>D.br.map(B=>[Math.hypot(B.x-A.cx,B.z-A.cz),RW_WARM]).concat(D.st.map(s=>[Math.hypot(s.x-A.cx,s.z-A.cz),0])),
                3:()=>D.cols.map(C=>[Math.hypot(C.x-A.cx,C.z-A.cz),C.tiles.length]),
                4:()=>D4.vats.map(q=>[Math.hypot(q[0]-A.cx,q[1]-A.cz),1]).concat(D4.piles.map(q=>[Math.hypot(q[0]-A.cx,q[1]-A.cz),2])),
                5:()=>D5.ped.map(q=>[Math.hypot(q[0]-A.cx,q[1]-A.cz),1]).concat(D5.fount.map(q=>[Math.hypot(q[0]-A.cx,q[1]-A.cz),2]),[[Math.hypot(D5.L(10.4,0)[0]-A.cx,D5.L(10.4,0)[1]-A.cz),3]])}[i]().map(q=>q.map(v=>+v.toFixed(2)));
              // the ground under each den mesh vertex: nothing floats or sinks far below the terrain at the new spot
              let vmin=1e9;A.g.children.forEach(o=>{if(o.geometry&&o.position.lengthSq()<1&&o.geometry.attributes.position){const a=o.geometry.attributes.position.array;for(let k=0;k<a.length;k+=27){const x=a[k],y=a[k+1],z=a[k+2];if(Math.hypot(x-A.cx,z-A.cz)<R-1)vmin=Math.min(vmin,y-GH(x,z))}}});
              return {R:+R.toFixed(2),flat:+fl.toFixed(3),blockedInside:blkIn.length,wallRing:+(ring/ringN).toFixed(2),edge,camps:cmp,img:DENS.img[i].size,mech:pos,floorMin:+vmin.toFixed(2),
                signAngleOff:+Math.abs(Math.atan2(Math.sin(SGA(i)-EA),Math.cos(SGA(i)-EA))).toFixed(2),gate:(()=>{const a=EA;let n=0;for(let r=R-2;r<R+6;r+=.5){const x=Math.round(A.cx+Math.cos(a)*r),z=Math.round(A.cz+Math.sin(a)*r);if(DENB.has(z*W+x))n++}return n})()}}""",i)
            ev("()=>{CAM(XA.cx+Math.cos(EA)*24,XA.cz+Math.sin(EA)*24,YAW(EA),1.0,42);STEP(.8,1)}");shot('over%d'%i)
            # walk in through the gate: the fight starts and the hero is held inside the bigger circle
            P('enter%d'%i,"""()=>{const A=XA;toPos(A.cx+Math.cos(EA)*(ARENA_R+6),A.cz+Math.sin(EA)*(ARENA_R+6));STEP(.3);const out=!!AF;
              for(let k=0;k<70&&!AF;k++){walk(pl,-Math.cos(EA)*.25,-Math.sin(EA)*.25);STEP(.03)}const d0=Math.hypot(pl.position.x-A.cx,pl.position.z-A.cz);
              toPos(A.cx+Math.cos(EA+.3)*(ARENA_R+3),A.cz+Math.sin(EA+.3)*(ARENA_R+3));STEP(.2);const d1=Math.hypot(pl.position.x-A.cx,pl.position.z-A.cz);return {startedOutside:out,started:!!AF,at:+d0.toFixed(1),heldAt:+d1.toFixed(1)}}""")
            ev("()=>{const A=XA;CAM(A.cx+Math.cos(EA)*(ARENA_R-3),A.cz+Math.sin(EA)*(ARENA_R-3),YAW(EA),.5,18);STEP(.8,1)}");shot('in%d'%i)
            if 'tele' not in PART:ev("()=>{arenaFail&&arenaFail();toPos(DSIGN[XA.i].x,DSIGN[XA.i].z);STEP(.5)}")
        # ---------------- 2. every red warning stays visible for its whole wind-up ----------------
        if 'tele' in PART:
            ev("()=>{const A=XA;if(!AF){toPos(A.cx+Math.cos(EA)*(ARENA_R-4),A.cz+Math.sin(EA)*(ARENA_R-4));STEP(.4)}window.BE=bossEnt(A.i);BE.bs.t=99;BE.bs.ult=99;STEP(.2)}")
            ev("""()=>{window.BFULL=1;window.TSTART=(js)=>{const A=XA;enemies.slice().forEach(e=>{if(e.minion&&!e.dprop)removeE(e)});BE.bs.t=99;BE.bs.ult=99;BE.bs.pb=99;BE.bs.dash=null;if(BE.hid)bxHide(BE,false);
                  const p0=V(A.cx+Math.cos(EA+1)*6,0,A.cz+Math.sin(EA+1)*6);toPos(p0.x,p0.z);BE.m.position.set(A.cx,0,A.cz);STEP(.05);
                  window.TSQ={L0:DTL.log.length,seen:new Map(),maxLive:0,bad:[],minA:9,minE:9,minF:9,st:0,s:0,fight:!!AF};HITS.length=0;
                  // v96: cast like the boss driver does (MP.inAI), so the move gets the v96 wind-up (×1.5) exactly as in a fight
                  const o0=MP.inAI;MP.inAI=1;try{eval(js)}catch(err){return 'ERR '+err}finally{MP.inAI=o0}return 'ok'};
                window.TSAMP=()=>{const T=TSQ;STEP(.05);T.s++;try{lpsFlush()}catch(_){}const L=DTL.live;T.maxLive=Math.max(T.maxLive,L.length);
                  for(const w of L){T.seen.set(w.id,w);const ob=w.dq?w.g:w.o;if(!ob.parent)T.bad.push('detached '+w.id);if(w.o.geometry!==w.g0)T.bad.push('geometry swapped '+w.id);
                    if(w.edge&&w.edge.geometry!==w.e0)T.bad.push('edge swapped '+w.id);
                    if(!w.dq&&!w.line){const c=w.o.geometry.boundingSphere.center;if(Math.hypot(c.x-w.pos.x,c.z-w.pos.z)>.5)T.bad.push('off '+w.id)}
                    if(w.o.material.fog||w.f.material.fog)T.bad.push('fog '+w.id);
                    T.minA=Math.min(T.minA,w.o.material.opacity);T.minF=Math.min(T.minF,w.f.material.opacity);if(w.edge)T.minE=Math.min(T.minE,w.edge.material.opacity)}
                  if(T.s>40&&!L.length&&DTL.log.length>T.L0)T.st++;return T.st>8};
                window.TFIN=(lab)=>{const T=TSQ,lg=DTL.log.slice(T.L0);return {lab,fight:T.fight,warnings:T.seen.size,done:lg.length,early:lg.filter(q=>q.early).map(q=>[q.t,q.T]),
                    full:lg.filter(q=>!q.early).length,T:[...new Set(lg.map(q=>q.T))].slice(0,6),maxLive:T.maxLive,minArea:+T.minA.toFixed(2),minFill:+T.minF.toFixed(2),minEdge:T.minE<9?+T.minE.toFixed(2):null,bad:[...new Set(T.bad)].slice(0,5),hits:HITS.length}}}""")
            for (lab,js) in MOVES[i]:
                ev("(js)=>TSTART(js)",js)
                for k in range(140):
                    if ev("()=>TSAMP()"):break
                    if k%4==0:pg.wait_for_timeout(20)
                print('tele%d'%i,'=>',json.dumps(ev("(l)=>TFIN(l)",lab)))
                if SH and (i,lab) in SHOTM:
                    ev("""(js)=>{const A=XA;BE.bs.t=99;BE.bs.ult=99;const p0=V(A.cx+Math.cos(EA+1)*6,0,A.cz+Math.sin(EA+1)*6);toPos(p0.x,p0.z);
                      camYaw=YAW(EA)+.5;camPitch=.75;camDist=17;snapCam();try{eval(js)}catch(err){}STEP(.5,1)}""",js);shot('tele%d_%s'%(i,lab.replace(' ','_')))
                    ev("()=>STEP(3)")
            ev("()=>{window.BFULL=0;arenaFail&&arenaFail();toPos(DSIGN[XA.i].x,DSIGN[XA.i].z);STEP(1.2)}")
        # ---------------- 3. the warning sign at the den's gate ----------------
        if 'sign' in PART:
            P('sign%d'%i,"""(i)=>{const s=DSIGN[i],A=XA;for(let k=0;k<4;k++)try{closeWin()}catch(_){};if(!$('xw').classList.contains('hide'))closeX();if(AF)arenaFail();toPos(s.x+1.4,s.z+.6);STEP(.2);if(AF)arenaFail();STEP(.4);const pr=$('prompt').textContent,vis=!$('prompt').classList.contains('hide');
              const t=MAP[Math.round(s.z)][Math.round(s.x)],onRoad=PMAP[i].path.some(q=>Math.hypot(q[0]-s.x,q[1]-s.z)<7);
              return {d:+Math.hypot(s.x-A.cx,s.z-A.cz).toFixed(1),tile:t,onRoad,prompt:pr,vis,region:regionAt(s.x,s.z),af:!!AF,ui:uiOpen(),near:!!dsignNear(),wp:(worldPrompt()||{}).label||null,lerr:(window.LERR||[]).map(s=>s.slice(0,300))}}""",i)
            camI="()=>{const s=DSIGN[%d];camYaw=Math.atan2(s.x-pl.position.x,s.z-pl.position.z)+Math.PI;camPitch=.28;camDist=6.5;snapCam();STEP(.4,1)}"%i
            ev(camI);shot('sign%d'%i)
            pg.keyboard.press('f');pg.wait_for_timeout(400)
            P('read%d'%i,"""(i)=>{const xw=$('xw');return {open:!xw.classList.contains('hide'),mode:xwMode,title:$('xwT').textContent,sub:$('xwS').textContent,
              atk:$('xwB').querySelectorAll('.dsg-a').length,weak:$('xwB').querySelectorAll('.dsg-w li').length,lv:$('xwB').querySelector('.dsg-lv').innerText.replace(/\\s+/g,' ')}}""",i)
            if i in (0,4):shot('read%d'%i)
            hero_lv=ev("()=>{const r=dsignLv(XA.i);hero.lvl=r.rec+1;rX();return [r,$('xwB').querySelector('.dsg-lv b+b, .dsg-lv span:nth-child(2) b').style.color]}")
            print('lvcol%d'%i,'=>',json.dumps(hero_lv))
            pg.keyboard.press('Escape');pg.wait_for_timeout(300);ev("()=>{if(!$('xw').classList.contains('hide'))closeX();hero.lvl=1}")
    print('LOOPERR',ev('()=>window.LERR||[]'))
    print('ERRS',errs[:5])
play.run(s,w=1000,hh=620)
