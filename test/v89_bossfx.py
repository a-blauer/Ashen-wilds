# v89 bossfx — breakable Rime Wraith orbs (hit / shot / companion / Warmfire steam), Tab + click + target frame for
# Hydra necks and Argus eye-stalks, ranged shots and skills on them (through their own health logic), den cutaway materials.
# AW_TMP=<out dir> python3 v89_bossfx.py      (SHOTS=0 skips the screenshots)
import play,json,os
# a busy machine can take minutes to parse the page: allow a longer first load
from playwright.sync_api import Page as _Pg
_g0=_Pg.goto
def _goto(self,url,**k):
    k['timeout']=max(k.get('timeout') or 0,600000);return _g0(self,url,**k)
_Pg.goto=_goto
SH=os.environ.get('SHOTS','1')!='0'
FAIL=[]
def s(pg):
    pg.set_default_timeout(300000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=300000);pg.click('[data-c="ranger"]',timeout=300000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    def P(n,c,arg=None):
        r=ev(c,arg) if arg is not None else ev(c);print(n,'=>',json.dumps(r)[:1500]);return r
    def ok(n,cond):
        print('CHECK',n,'OK' if cond else 'FAIL')
        if not cond:FAIL.append(n)
    def shot(n):
        if SH:
            ev('()=>STEP(.03,1)');pg.screenshot(path=play.TMP+'/v89_'+n+'.png',timeout=180000,animations='disabled')
    def den(i):
        ev("(i)=>{if(window.__pn)performance.now=window.__pn;enterMap(i)}",i);pg.wait_for_timeout(3500)
        return ev("""(i)=>{window.__pn=window.__pn||performance.now.bind(performance);window.VT=window.__pn();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
          window.__pr=window.__pr||POST.render;window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let k=0;k<n;k++){VT+=16;if(window.GOD){hero.hp=heroMax();hero.iv=1}if(k==n-1&&draw)POST.render=__pr;try{loop(VT)}catch(err){window.LERR=window.LERR||[];if(LERR.length<6)LERR.push(String(err&&err.stack||err).slice(0,500))}}POST.render=__pr;return VT};
          window.GOD=1;window.XA=ARN[i];window.EA=(i<2)?d01Ent(XA):(XA.dn&&XA.dn.ea!=null?XA.dn.ea:dqEntry(XA));
          window.CAM=(x,z,yaw,pit,dist)=>{toPos(x,z);camYaw=yaw;camPitch=pit;camDist=dist;snapCam()};window.YAW=a=>Math.atan2(Math.cos(a),Math.sin(a));
          enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});
          const x=XA.cx+Math.cos(EA)*9,z=XA.cz+Math.sin(EA)*9;CAM(x,z,YAW(EA),.5,12);STEP(1.0);window.BE=bossEnt(i);BE.bs.t=99;BE.bs.ult=99;BE.m.position.set(XA.cx,0,XA.cz);STEP(.1);window.DN=XA.dn;
          window.BXP=k=>BFX.subs.filter(e=>e.bfx.k==k&&!e._gone);return [!!AF,AF&&AF.i,BFX.cutN]}""",i)
    # ================= den 2: orbs =================
    r=den(2)
    ok('fight2',r[0] and r[1]==2)
    ok('cut materials',r[2]>0)
    P('cutmats',"()=>{const n={cut:0,all:0};XA.g.traverse(o=>{if(o.isMesh){n.all++;if(o.material.userData.bfxCut)n.cut++}});const d4={cut:0,dq:0};ARN[4].g.traverse(o=>{if(o.isMesh){if(o.material.userData.bfxCut)d4.cut++;if(o.material.customProgramCacheKey&&String(o.material.customProgramCacheKey()).startsWith('dqcut'))d4.dq++}});return [n,d4]}")
    r=P('orbs',"()=>{BE.bs.t=99;BMV.orbs(BE,XA,1);STEP(2.2);BE.bs.t=99;const L=bxA(XA).filter(f=>f.k=='orb');return [L.length,BXP('orb').length,BXP('orb').every(e=>enemies.includes(e)&&e.c.n=='Wailing Orb')]}")
    ok('orb proxies',r[0]>=4 and r[1]==r[0] and r[2])
    shot('orbs')
    # one hero hit (any damage) shatters an orb
    r=P('orb hit',"()=>{const e=BXP('orb')[0],f=e.bfx.ref,n0=bxA(XA).length,k0=BFX.orbN;heroHit(e,1,'p');STEP(.05);return [bxA(XA).indexOf(f),!!f.ms.parent,e._gone,!enemies.includes(e),BFX.orbN-k0,bxA(XA).length-n0]}")
    ok('orb one hit',r[0]==-1 and not r[1] and r[2] and r[3] and r[4]==1)
    # a companion bite shatters one too
    r=P('orb comp',"()=>{const e=BXP('orb')[0];const c=party[0];const k0=BFX.orbN;compHit(c,e,.01);STEP(.05);return [e._gone,BFX.orbN-k0]}")
    ok('orb companion',r[0] and r[1]==1)
    # Tab targets orbs too; an arrow shot at the selected orb flies to it and shatters it
    r=P('orb tab',"()=>{setTarget(null);BFX.cyc=null;const seen=new Set();for(let k=0;k<8;k++){selectTarget();if(tgt)seen.add(tgt.bfx?tgt.bfx.k:tgt.boss?'boss':'x')}return [...seen]}")
    ok('orb tab',('orb' in r) and ('boss' in r))
    # (the bow releases on a real-time timer, so wait between swing() and stepping the game)
    P('orb shot0',"()=>{const e=BXP('orb')[0];window.OE=e;const f=e.bfx.ref;window.OK0=BFX.orbN;f.sp=0;f.t=30;const a=Math.atan2(f.ms.position.z-XA.cz,f.ms.position.x-XA.cx);toPos(XA.cx+Math.cos(a+.25)*4,XA.cz+Math.sin(a+.25)*4);setTarget(e);atkCd=0;swing();return d2(pl.position,f.ms.position)}")
    pg.wait_for_timeout(1500)
    r=P('orb shot',"()=>{const e=OE;let n=0;while(!e._gone&&n++<40)STEP(.1);return [e._gone,BFX.orbN-OK0,n]}")
    ok('orb arrow',r[0] and r[1]==1)
    # Warmfires: a lit fire melts an orb in a hiss of steam; a snuffed fire does not
    r=P('orb fire',"""()=>{BE.bs.t=99;BMV.orbs(BE,XA,1);STEP(2.2);BE.bs.t=99;const L=bxA(XA).filter(f=>f.k=='orb'),B=DN.br.find(B=>B.lit)||DN.br[0];if(!B.lit)rwFire(XA,B,true);const f=L[0],s0=BFX.stN;
       f.ms.position.set(B.x+.6,B.y+1.2,B.z);toPos(B.x+6,B.z+6);STEP(.05);const r1=[bxA(XA).indexOf(f),BFX.stN-s0];
       const B2=DN.br.find(q=>q!==B);rwFire(XA,B2,false);const f2=L[1],s1=BFX.stN;f2.sp=0;f2.ms.position.set(B2.x+.5,B2.y+1.2,B2.z);STEP(.3);const r2=[bxA(XA).indexOf(f2)>=0,BFX.stN-s1];rwFire(XA,B2,true);return r1.concat(r2)}""")
    ok('orb steam',r[0]==-1 and r[1]==1)
    ok('dark fire keeps orb',r[2])  # another orb may drift into a lit fire meanwhile
    shot('steam')
    P('d2 clear',"()=>{arenaFail();toPos(PMAP[XA.i].en[0],PMAP[XA.i].en[1]);STEP(.5);return [BFX.subs.length,!!AF]}")
    # ================= den 1: Hydra necks =================
    r=den(1);ok('fight1',r[0] and r[1]==1)
    r=P('necks',"""()=>{HY.nt=99;const fr=HY.slots.map((_,j)=>j).filter(j=>hySlotFree(j)&&Math.hypot(HY.slots[j][0]-pl.position.x,HY.slots[j][1]-pl.position.z)>2.5).slice(0,3);fr.forEach(j=>hyRise(XA,BE,j));STEP(2.0);HY.nt=99;
       const N=HY.necks.filter(N=>N.st=='up'),X=BXP('neck');return [N.length,X.length,X.every(e=>e.bfx.ref._bfx===e&&e.c.h==e.bfx.ref.hp&&M(e.c)==e.bfx.ref.hpM)]}""")
    ok('neck proxies',r[0]>=2 and r[1]==r[0] and r[2])
    # Tab: boss + necks, nearest first, cycling through every one
    r=P('neck tab',"""()=>{setTarget(null);BFX.cyc=null;const order=[];for(let k=0;k<6;k++){selectTarget();order.push(tgt?(tgt.bfx?tgt.bfx.k+':'+tgt.bfx.ref.i:tgt.boss?'boss':'x'):null)}const C=bfxCands(XA).sort((a,b)=>d2(a.m.position,pl.position)-d2(b.m.position,pl.position));
       return [order,C.length,C[0].bfx?C[0].bfx.k+':'+C[0].bfx.ref.i:'boss']}""")
    ok('neck tab cycles',len(set(r[0][:r[1]]))==r[1] and r[0][0]==r[2] and any(str(x).startswith('neck') for x in r[0]) and 'boss' in r[0])
    # the target frame shows the neck (name + health) below the boss bar
    r=P('neck frame',"()=>{const e=BXP('neck')[0];setTarget(e);STEP(.3);const t=$('tgt'),cs=getComputedStyle(t),b=$('boss').getBoundingClientRect(),tr=t.getBoundingClientRect();return [cs.display,$('tgN').textContent,$('tgH').textContent,document.body.classList.contains('bossf'),Math.round(tr.top-b.bottom),!!(BFX.mk&&BFX.mk.visible)]}")
    ok('neck frame',r[0]!='none' and r[1]=='Brood Neck' and '/' in r[2] and r[3] and r[4]>=0 and r[5])
    shot('neck_target')
    # the bow aims at and homes onto the targeted neck from far away; the neck's own health takes the hit
    P('neck bow0',"""()=>{const e=BXP('neck')[0],N=e.bfx.ref;window.NE=e;setTarget(e);const a=Math.atan2(N.z-XA.cz,N.x-XA.cx)+.5;toPos(XA.cx+Math.cos(a)*1,XA.cz+Math.sin(a)*1);pl.rotation.y=Math.atan2(N.x-pl.position.x,N.z-pl.position.z)+2;
       const d=aimDir(),want=V(N.x-pl.position.x,0,N.z-pl.position.z).normalize();window.NH0=N.hp;window.NC=0;window.__hy=hyHitNeck;hyHitNeck=function(){NC++;return __hy.apply(this,arguments)};
       atkCd=0;swing();return window.NB=[+d2(pl.position,N.p).toFixed(1),+(d.x*want.x+d.z*want.z).toFixed(3)]}""")
    pg.wait_for_timeout(1500)
    r=P('neck bow',"()=>{const e=NE,N=e.bfx.ref;let n=0;while(N.hp==NH0&&n++<30)STEP(.1);hyHitNeck=__hy;return NB.concat([NH0,N.hp,e.c.h,NC])}")
    ok('neck bow',r[1]>.99 and r[3]<r[2] and r[4]==r[3] and r[5]==1)
    # one melee sweep over a neck (area + the den's own arc check) strikes it once
    r=P('neck area',"()=>{const e=BXP('neck')[0],N=e.bfx.ref;let calls=0;const f=hyHitNeck;hyHitNeck=function(){calls++;return f.apply(this,arguments)};area(V(N.x+.5,0,N.z),2.3,5,{mt:'p',basic:1},null,0);hyHitNeck=f;return calls}")
    ok('neck area once',r==1)
    # a den projectile (d01Shots path) onto a neck strikes once and ends
    r=P('neck shot',"()=>{const e=BXP('neck')[0],N=e.bfx.ref;setTarget(null);let calls=0;const f=hyHitNeck;hyHitNeck=function(){calls++;return f.apply(this,arguments)};const o=V(N.x+3,0,N.z),d=V(-1,0,0);launch(o,d,20,{col:0xffffff,arrow:1,mt:'p'},5,1);let n=0;const sh=shots[shots.length-1];while(shots.includes(sh)&&n++<20)STEP(.05);hyHitNeck=f;return [calls,shots.includes(sh)]}")
    ok('neck shot once',r[0]==1 and not r[1])
    # targeted skills pick the selected neck
    r=P('neck skill',"()=>{const e=BXP('neck')[0];setTarget(e);const p=aimPoint(20);return [kqsNear(25)===e,0,+d2(p,e.m.position).toFixed(2)]}")
    ok('neck skill target',r[0] and r[2]<.01)
    # sever through the proxy -> stump (regrow/sear logic), proxy gone, target back on the Hydra
    r=P('neck sever',"()=>{const e=BXP('neck')[0],N=e.bfx.ref;setTarget(e);heroHit(e,N.hpM*3,'p');STEP(.2);return [N.st,e._gone,enemies.includes(e),tgt&&tgt.boss?'boss':tgt?'other':null,!!N._bfx]}")
    ok('neck sever',r[0]=='stump' and r[1] and not r[2] and r[3]=='boss' and not r[4])
    r=P('neck sear',"()=>{const N=HY.necks.find(N=>N.st=='stump');HY.fire=HY.clk+10;toPos(N.x+.5,N.z);STEP(.2);return [N.st,!!N._bfx]}")
    ok('neck sear',r[0]=='seared' and not r[1])
    # click a neck on screen to target it
    r=P('neck click pt',"""()=>{const e=BXP('neck')[0];if(!e)return null;setTarget(BE);toPos(XA.cx+Math.cos(EA)*8,XA.cz+Math.sin(EA)*8);camYaw=Math.atan2(pl.position.x-e.m.position.x,pl.position.z-e.m.position.z)+.35;camPitch=.3;camDist=9;snapCam();STEP(.05,1);
       const r=gl.getBoundingClientRect();for(const p of e.bfx.pts().slice().reverse()){const q=p.clone().project(cam),x=r.left+(q.x+1)/2*r.width,y=r.top+(1-q.y)/2*r.height;const el=document.elementFromPoint(x,y);if(el&&gl.contains(el))return [x,y,e.bfx.ref.i];window.CLX=(window.CLX||[]).concat([[Math.round(x),Math.round(y),el&&(el.id||el.tagName+'.'+el.className)]])}return null}""")
    if r:
        pg.mouse.click(r[0],r[1]);pg.wait_for_timeout(200)
        c=P('neck click',"()=>[tgt&&tgt.bfx?tgt.bfx.k+':'+tgt.bfx.ref.i:tgt&&tgt.boss?'boss':null]")
        ok('neck click',c[0]=='neck:%d'%r[2])
    else:
        P('click miss',"()=>[window.CLX,gl.getBoundingClientRect().toJSON()]");ok('neck click',False)
    P('d1 clear',"()=>{arenaFail();toPos(PMAP[XA.i].en[0],PMAP[XA.i].en[1]);STEP(.5);return [BFX.subs.length,HY.necks.filter(N=>N.st!='off').length]}")
    # ================= den 0: Argus eye-stalks =================
    r=den(0);ok('fight0',r[0] and r[1]==0)
    r=P('stalks',"()=>{STEP(.2);const X=BXP('stalk');return [X.length,AR.st.filter(T=>T.st!='dead').length,X.every(e=>e.c.h==e.bfx.ref.hp&&M(e.c)==e.bfx.ref.hpM)]}")
    ok('stalk proxies',r[0]==6 and r[1]==6 and r[2])
    r=P('stalk tab',"()=>{setTarget(null);BFX.cyc=null;const seen=new Set();for(let k=0;k<9;k++){selectTarget();if(tgt)seen.add(tgt.bfx?tgt.bfx.k+':'+tgt.bfx.ref.i:tgt.boss?'boss':'x')}return [...seen]}")
    ok('stalk tab',len([x for x in r if x.startswith('stalk')])>=6 and 'boss' in r)
    r=P('stalk frame',"()=>{const e=BXP('stalk')[0];setTarget(e);STEP(.3);return [getComputedStyle($('tgt')).display,$('tgN').textContent,$('tgS').textContent]}")
    ok('stalk frame',r[0]!='none' and r[1]=='Eye-stalk')
    shot('stalk_target')
    # open eye: +60% through arHitStalk; bursting a stalk through the proxy wounds Argus
    r=P('stalk burst',"()=>{const e=BXP('stalk')[0],T=e.bfx.ref,b0=BE.c.h;T.st='open';let got=0;const f=arHitStalk;arHitStalk=function(A,T2,dm){got=dm;return f.apply(this,arguments)};heroHit(e,T.hpM*3,'p');arHitStalk=f;STEP(.1);return [T.st,e._gone,BE.c.h<b0,got>0,tgt&&tgt.boss]}")
    ok('stalk burst',r[0]=='dead' and r[1] and r[2] and r[3] and r[4])
    r=P('stalk regrow',"()=>{arPhase(XA,BE,2);STEP(1.2);return BXP('stalk').length}")
    ok('stalk regrow proxy',r==6)
    r=P('mp',"()=>[mpElig(BXP('stalk')[0]),typeof MP!='undefined']")
    ok('no co-op sync for proxies',r[0]==False)
    P('d0 clear',"()=>{arenaFail();toPos(PMAP[XA.i].en[0],PMAP[XA.i].en[1]);STEP(.5);return [BFX.subs.length,!!AF,enemies.filter(e=>e.bfx).length]}")
    print('LOOPERR',ev('()=>window.LERR||[]'))
    print('ERRS',errs[:5])
    if errs or ev('()=>(window.LERR||[]).length'):FAIL.append('errors')
    print('FAILED' if FAIL else 'ALL OK',FAIL)
play.run(s,w=1000,hh=620)
