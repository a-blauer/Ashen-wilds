# v91 fix track: camps stay green on the zone map once cleared (45 s, recall run, save/load, restart), Argus gaze cone at 40%
# opacity, Kindlelight stump mushrooms on the stump top. (Rime Wraith orbs: test/v89_bossfx.py.)
# AW_TMP=<out dir> python3 v91_fix.py     (SHOTS=0 skips the screenshots; SRC=<old build> TAG=before for comparison shots)
import play,json,os
from playwright.sync_api import Page as _Pg
_g0=_Pg.goto
def _goto(self,url,**k):
    k['timeout']=max(k.get('timeout') or 0,600000);return _g0(self,url,**k)
_Pg.goto=_goto
SH=os.environ.get('SHOTS','1')!='0';TAG=os.environ.get('TAG','after')
FAIL=[]
def s(pg):
    pg.set_default_timeout(300000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]');pg.click('[data-c="warrior"]');pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    def P(n,c,arg=None):
        r=ev(c,arg) if arg is not None else ev(c);print(n,'=>',json.dumps(r)[:1500]);return r
    def ok(n,cond):
        print('CHECK',n,'OK' if cond else 'FAIL')
        if not cond:FAIL.append(n)
    def shot(n):
        if SH:
            ev('()=>STEP(.03,1)');pg.screenshot(path=play.TMP+'/v91_%s_%s.png'%(n,TAG),timeout=180000,animations='disabled')
    # ---------- stump mushrooms ----------
    r=P('stump',"""()=>{const g=WD.T.k_stump.parts[0].g,a=g.attributes.position.array;let mx=0;for(let i=0;i<a.length;i+=3)if(a[i+1]>.515)mx=Math.max(mx,Math.hypot(a[i],a[i+2]));return +mx.toFixed(3)}""")
    ok('stump mushrooms over the top (r<.36)',r<.36)
    # ---------- camps ----------
    ev("()=>{enterMap(0)}");pg.wait_for_timeout(3500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();hero.iv=1;if(i==n-1&&draw)POST.render=__pr;try{loop(VT)}catch(err){window.LERR=window.LERR||[];if(LERR.length<6)LERR.push(String(err&&err.stack||err).slice(0,400))}}POST.render=__pr;return VT};
      window.__down=down;down=function(){hero.hp=heroMax()};
      // labels drawn on the zone map canvas
      window.WML=[];const ft=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(t,x,y){if(this.canvas&&this.canvas.id=='wmc')WML.push(String(t));return ft.apply(this,arguments)};
      window.CCL=C=>typeof campCleared=='function'?campCleared(C):null;window.MAPL=()=>{WML=[];openWMap();$('wmap').classList.add('hide');return WML.filter(t=>t.indexOf('⛺')>=0)};
      STEP(.5);rosterTick();return [ROST.r,CAMPS.filter(C=>C.pm===0).length]}""")
    r=P('camps',"()=>{const L=CAMPS.filter(C=>C.pm===0);return [L.length,L.map(C=>ROST.slots.filter(s=>s.camp===C).length),MAPL()]}")
    ok('8 camps (v97), all red at the start',r[0]==8 and all(n>0 for n in r[1]) and not any('cleared' in t for t in r[2]))
    r=P('clear camp',"""()=>{const C=CAMPS.filter(C=>C.pm===0).sort((a,b)=>Math.hypot(a.x-pl.position.x,a.z-pl.position.z)-Math.hypot(b.x-pl.position.x,b.z-pl.position.z))[0];window.CC=C;
       toPos(C.x+CAMP_R+3,C.z);STEP(.3);rosterTick();STEP(.3);let n=0;
       for(let k=0;k<12;k++){enemies.filter(e=>e.camp===C&&!e.dead).forEach(e=>{hurt(e,1e9,{});n++});STEP(.2);rosterTick()}
       return [n,ROST.slots.filter(s=>s.camp===C&&!s.dead).length,CCL(C),MAPL()]}""")
    ok('cleared camp is green',r[0]>0 and r[1]==0 and r[2] and sum('cleared' in t for t in r[3])==1)
    if SH:
        ev("()=>{openWMap()}");pg.wait_for_timeout(800);pg.screenshot(path=play.TMP+'/v91_campmap_%s.png'%TAG,timeout=180000);ev("()=>$('wmap').classList.add('hide')")
    r=P('after 60s',"()=>{STEP(60);rosterTick();return [CCL(CC),MAPL()]}")
    ok('still green after 60 s',r[0] and sum('cleared' in t for t in r[1])==1)
    # recall run: save the run, go to town, come back (and once through a save/load)
    r=P('recall',"()=>{instSave();recallTown();STEP(.5);rosterTick();const t=[ROST.r,!!INST];const ok=instRestore();STEP(.3);rosterTick();return t.concat([ok,ROST.r,CCL(CC),MAPL()])}")
    ok('green after a recall run',r[1] and r[2] and r[3]==0 and r[4] and sum('cleared' in t for t in r[5])==1)
    r=P('saveload',"""()=>{instSave();recallTown();STEP(.3);rosterTick();const s=JSON.parse(JSON.stringify(x2Save()));INST=null;CAMPS.forEach(C=>{C.kt=-1e9;C.clr=false});x2Load(s);const has=!!INST;
       instRestore();STEP(.3);rosterTick();return [has,CCL(CC),MAPL()]}""")
    ok('green after save/load of the run',r[0] and r[1] and sum('cleared' in t for t in r[2])==1)
    r=P('restart',"()=>{instSave();recallTown();STEP(.3);rosterTick();INST=null;toPos(PMAP[0].en[0],PMAP[0].en[1]);STEP(.3);rosterTick();return [CCL(CC),MAPL()]}")
    ok('restart: camps red again',not r[0] and not any('cleared' in t for t in r[1]))
    # ---------- Argus gaze cone ----------
    ev("()=>{toPos(PMAP[0].en[0],PMAP[0].en[1]);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)})}")
    r=P('den0',"""()=>{const A=ARN[0],a=AR.ent;window.AA=A;toPos(A.cx+Math.cos(a)*9,A.cz+Math.sin(a)*9,0);STEP(.4);const e=bossEnt(0);window.BE=e;e.bs.t=999;e.bs.ult=999;enemies.slice().forEach(q=>{if(!q.boss&&!q.bfx)removeE(q)});AR.wt=999;return !!AF}""")
    ok('den 0 fight',r)
    r=P('fan wake',"""()=>{const T=AR.st[2];BE.bs.t=999;AR.wt=999;arReset(T);T.st='wake';T.t=0;const o=[];for(let k=0;k<12;k++){STEP(.05);o.push(T.fan.material.opacity)}return [T.st,Math.min(...o),Math.max(...o)]}""")
    ok('wake cone opacity 40% (max .048)',r[2]<=.0481 and r[2]>.015)
    r=P('fan open',"""()=>{const T=AR.st[2];BE.bs.t=999;AR.wt=999;T.st='open';T.t=0;T.dur=50;const y=arEyeYaw(T)+.9;T.y0=y;T.y1=y+.01;const o=[];for(let k=0;k<12;k++){STEP(.05);o.push(T.fan.material.opacity)}return [T.st,Math.min(...o),Math.max(...o),T.fan.visible]}""")
    ok('open cone opacity 40% (.096-.144)',r[0]=='open' and r[1]>=.0959 and r[2]<=.1441 and r[3])
    if SH:
        ev("""()=>{AR.st.forEach((T,i)=>{T.st='open';T.t=0;T.dur=50;const y=T.gy;T.y0=y;T.y1=y+.01});const a=AR.ent;camYaw=Math.atan2(Math.cos(a),Math.sin(a));camPitch=.9;camDist=22;snapCam();STEP(.3,1)}""")
        pg.screenshot(path=play.TMP+'/v91_gaze_%s.png'%TAG,timeout=180000,animations='disabled')
    print('LOOPERR',ev('()=>window.LERR||[]'))
    print('ERRS',errs[:5])
    if errs or ev('()=>(window.LERR||[]).length'):FAIL.append('errors')
    print('FAILED' if FAIL else 'ALL OK',FAIL)
play.run(s,w=1000,hh=620)
